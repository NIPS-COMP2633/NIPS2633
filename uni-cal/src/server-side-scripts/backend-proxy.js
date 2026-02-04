/**
 * MRU Schedule Backend Proxy - Netlify Serverless Function
 * 
 * This serverless function handles the authentication flow without CORS issues
 * and properly captures redirects that browsers can't access.
 */

const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const { parseString, Builder } = require('xml2js');

/**
 * Extract cartids from enrollment string
 * e.g., "--202601_13607--" -> ["13607"]
 * e.g., "--202601_13303-13305-" -> ["13303", "13305"]
 */
function extractCartIds(enrString) {
    const matches = enrString.match(/\d{5,}/g);
    return matches || [];
}

/**
 * Filter XML to only include sections matching enrolled cartids
 * @param {string} xmlData - The full XML response from class-data API
 * @param {Object[]} enrolledCourses - Array of enrolled course objects with enr field
 * @returns {Promise<string>} Filtered XML string
 */
async function filterXMLByCourses(xmlData, enrolledCourses) {
    return new Promise((resolve, reject) => {
        // Extract all enrolled cartids
        const enrolledCartIds = new Set();
        enrolledCourses.forEach(course => {
            const cartids = extractCartIds(course.enr);
            cartids.forEach(id => enrolledCartIds.add(id));
        });

        console.log('Filtering XML with enrolled cartids:', Array.from(enrolledCartIds));

        parseString(xmlData, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return reject(err);
            }

            // Navigate to courses in the XML structure
            if (!result.addcourse || !result.addcourse.classdata || !result.addcourse.classdata[0].course) {
                console.log('No courses found in XML structure');
                return resolve(xmlData); // Return original if structure is unexpected
            }

            console.log(`Found ${result.addcourse.classdata[0].course.length} courses in XML`);

            // Filter each course's uselections
            result.addcourse.classdata[0].course.forEach(course => {
                if (course.uselection && Array.isArray(course.uselection)) {
                    const originalCount = course.uselection.length;

                    // Keep only uselections where ANY block's cartid matches enrolled cartids
                    course.uselection = course.uselection.filter(usel => {
                        if (usel.selection && usel.selection[0] && usel.selection[0].block) {
                            // Check if any block in this selection has a matching cartid
                            const hasMatch = usel.selection[0].block.some(block => {
                                if (block.$ && block.$.cartid) {
                                    const cartid = block.$.cartid;
                                    const isMatch = enrolledCartIds.has(cartid);
                                    if (isMatch) {
                                        console.log(`  Found matching cartid: ${cartid}`);
                                    }
                                    return isMatch;
                                }
                                return false;
                            });
                            return hasMatch;
                        }
                        return false;
                    });

                    const courseKey = course.$ && course.$.key ? course.$.key : 'unknown';
                    console.log(`Course ${courseKey}: ${originalCount} sections -> ${course.uselection.length} after filter`);
                }
            });

            // Remove courses with no remaining uselections
            result.addcourse.classdata[0].course = result.addcourse.classdata[0].course.filter(course => {
                return course.uselection && course.uselection.length > 0;
            });

            console.log(`Final result: ${result.addcourse.classdata[0].course.length} courses with matching sections`);

            // Convert back to XML
            const builder = new Builder();
            const filteredXML = builder.buildObject(result);
            resolve(filteredXML);
        });
    });
}

/**
 * Netlify serverless function handler
 * POST /.netlify/functions/backend-proxy
 * Handles the full authentication flow and retrieves schedule data
 */
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const { username, password, term } = JSON.parse(event.body);

        if (!username || !password || !term) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing required fields',
                    details: 'username, password, and term are required'
                })
            };
        }

        console.log('Starting calendar workflow...');

        // Create a fresh cookie jar for this request
        const jar = new CookieJar();
        const client = wrapper(axios.create({
            jar,
            maxRedirects: 0, // DON'T follow redirects automatically
            validateStatus: (status) => status < 400, // Don't throw on 3xx
            withCredentials: true
        }));

        // Step 1: Initial request to get first cas session
        const step1 = await client.get('https://sb.mymru.ca/criteria.jsp');
        const casSessionStart = step1.headers.location;
        if (!(step1.status >= 300 && step1.status < 400 && casSessionStart)) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Could not extract session key from initializing request' })
            };
        }

        // Step 2: Start auth session
        const step2 = await client.get(casSessionStart);
        const authSessionStart = step2.headers.location;
        if (!authSessionStart) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Could not extract auth session from step 2' })
            };
        }
        // Extract CAS session key
        const casSessionKeyMatch = authSessionStart.match(/sessionDataKey=([^&]+)/);
        if (!casSessionKeyMatch) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Could not extract CAS session key from step 2' })
            };
        }
        const casSessionDataKey = casSessionKeyMatch[1];

        // Step 3: Get auth session data
        const step3 = await client.get(authSessionStart);
        const authSessionDataURL = step3.headers.location;
        if (!authSessionDataURL) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Could not extract auth session data URL from step 3' })
            };
        }
        // Extract auth session key
        const authSessionKeyMatch = authSessionDataURL.match(/sessionDataKey=([^&]+)/);
        if (!authSessionKeyMatch) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Could not extract auth session key' })
            };
        }
        const authSessionDataKey = authSessionKeyMatch[1];

        // Step 4: Intermediate auth redirect
        const step4 = await client.get(authSessionDataURL);

        // Step 5: Submit login credentials
        const step5 = await client.post('https://auth.mtroyal.ca/commonauth',
            new URLSearchParams({
                usernameUserInput: username,
                username: username,
                password: password,
                sessionDataKey: authSessionDataKey
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Check for login failure
        if (step5.data.includes('Login Failed')) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Login failed - invalid credentials' })
            };
        }

        // Step 6: Finalize CAS login
        const step6 = await client.get('https://auth.mtroyal.ca/cas/login', {
            params: { sessionDataKey: casSessionDataKey }
        });
        const authenticatedURL = step6.headers.location;
        if (!authenticatedURL) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Could not extract authenticated URL after CAS login' })
            };
        }

        // Step 7: Access authenticated resources
        const step7 = await client.get(authenticatedURL);

        // Step 8: Get enrolled classes
        const step8 = await client.get('https://sb.mymru.ca/api/getEnrollmentState', {
            params: {
                term: term,
                _timestamp: Date.now()
            },
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://sb.mymru.ca/criteria.jsp'
            }
        });

        const enrollmentData = step8.data;

        // Validate enrollment data
        if (!enrollmentData || !enrollmentData.cnfs || !Array.isArray(enrollmentData.cnfs)) {
            console.error('Invalid enrollment data:', enrollmentData);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: 'Could not retrieve course enrollment data',
                    details: 'The enrollment API returned unexpected data format'
                })
            };
        }
        if (enrollmentData.cnfs.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: 'No courses found',
                    details: 'Your account has no enrolled courses for this term'
                })
            };
        }
        // Transform cnfs to courses format
        const courses = enrollmentData.cnfs.map(c => ({
            code: c.cnKey,
            va: c.va,
            enr: c.enr
        }));

        console.log('Enrolled courses:', JSON.stringify(courses, null, 2));

        // Build the base form data
        const formData = {
            access: '0',
            lang: 'en',
            tip: '3',
            page: 'results',
            scratch: '0',
            advice: '0',
            legend: '1',
            term: term,
            sort: 'none',
            filters: 'iiiiiiiiii',
            bbs: '',
            ds: '',
            cams: 'M_LP',
            locs: 'any',
            isrts: 'any',
            ses: 'any',
            pl: '',
            pac: '1'
        };
        // Add course data
        courses.forEach((course, index) => {
            formData[`course_${index}_0`] = course.code;
            formData[`va_${index}_0`] = course.va;
            formData[`sa_${index}_0`] = '';
            formData[`cs_${index}_0`] = course.enr;
            formData[`cpn_${index}_0`] = '';
            formData[`csn_${index}_0`] = '';
            formData[`ca_${index}_0`] = '';
            formData[`dropdown_${index}_0`] = `kp_${course.enr}`;
            formData[`ig_${index}_0`] = '0';
            formData[`rq_${index}_0`] = '';
            formData[`bg_${index}_0`] = '0';
            formData[`cr_${index}_0`] = '';
            formData[`ss_${index}_0`] = '0';
            formData[`sbc_${index}_0`] = '0';
        });

        // Step 9: Submit course selection to get referer
        const getReferer = await client.post('https://sb.mymru.ca/criteria.jsp',
            new URLSearchParams(formData).toString()
        );
        const refererParams = new URLSearchParams(formData);
        const refererURL = `https://sb.mymru.ca/criteria.jsp?${refererParams.toString()}`;

        // Step 10: Fetch schedule data
        // Calculate timing parameters
        const currentTime = new Date().getTime();
        const t = Math.floor(currentTime / 60000) % 1000;
        const e = (t % 3) + (t % 39) + (t % 42);

        // Build query params for schedule API
        const scheduleParams = {
            term: term,
            t: t,
            e: e,
            nouser: 1,
            _: currentTime
        };

        // Add course params
        courses.forEach((course, index) => {
            scheduleParams[`course_${index}_0`] = course.code;
            scheduleParams[`va_${index}_0`] = course.va;
            scheduleParams[`rq_${index}_0`] = '';
        });

        const scheduleResponse = await client.get('https://sb.mymru.ca/api/class-data', {
            params: scheduleParams,
            headers: {
                'Accept': 'application/xml, text/xml, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': refererURL
            }
        });

        // Filter the XML to only include enrolled sections
        const filteredXML = await filterXMLByCourses(scheduleResponse.data, courses);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: filteredXML
        };
    } catch (error) {
        console.error('Error during authentication:', error.message);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Authentication failed',
                details: error.message
            })
        };
    }
};