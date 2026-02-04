/**
 * Google Calendar Authentication Netlify Serverless Function
 * 
 * This function handles Google Calendar OAuth2 authentication flow
 * and manages tokens for calendar operations.
 */

// Store OAuth2 configuration
const CLIENT_ID = process.env.google_calander_client_id;
const API_KEY = process.env.google_calander_api_key;
const DISCOVERY_DOC = process.env.google_calander_discovery_doc;
const SCOPES = process.env.google_calander_scopes;

// Session storage for tokens (in production, use a proper session store)
const sessionTokens = new Map();

/**
 * Netlify serverless function handler
 * Handles multiple routes based on path and method
 */
exports.handler = async (event, context) => {
    const path = event.path;
    const method = event.httpMethod;

    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Route: GET /config
        if (path.endsWith('/config') && method === 'GET') {
            if (!CLIENT_ID || !API_KEY || !DISCOVERY_DOC || !SCOPES) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'Google Calendar configuration not found in environment variables',
                        missing: {
                            clientId: !CLIENT_ID,
                            apiKey: !API_KEY,
                            discoveryDoc: !DISCOVERY_DOC,
                            scopes: !SCOPES
                        }
                    })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    clientId: CLIENT_ID,
                    apiKey: API_KEY,
                    discoveryDoc: DISCOVERY_DOC,
                    scopes: SCOPES
                })
            };
        }

        // Route: POST /token
        if (path.endsWith('/token') && method === 'POST') {
            const { sessionId, token } = JSON.parse(event.body);

            if (!sessionId || !token) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Session ID and token are required'
                    })
                };
            }

            // Store token with session ID
            sessionTokens.set(sessionId, {
                token,
                timestamp: Date.now()
            });

            // Auto-cleanup old sessions (older than 1 hour)
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            for (const [sid, data] of sessionTokens.entries()) {
                if (data.timestamp < oneHourAgo) {
                    sessionTokens.delete(sid);
                }
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Token stored successfully' })
            };
        }

        // Route: GET /token/:sessionId
        if (path.includes('/token/') && method === 'GET') {
            const sessionId = path.split('/token/')[1];

            if (!sessionId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Session ID is required' })
                };
            }

            const sessionData = sessionTokens.get(sessionId);

            if (!sessionData) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Token not found for session' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    token: sessionData.token,
                    timestamp: sessionData.timestamp
                })
            };
        }

        // Route: DELETE /token/:sessionId
        if (path.includes('/token/') && method === 'DELETE') {
            const sessionId = path.split('/token/')[1];

            if (!sessionId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Session ID is required' })
                };
            }

            const wasDeleted = sessionTokens.delete(sessionId);

            if (!wasDeleted) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Token not found for session' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Token revoked successfully' })
            };
        }

        // Route: POST /validate
        if (path.endsWith('/validate') && method === 'POST') {
            const { sessionId } = JSON.parse(event.body);

            if (!sessionId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Session ID is required' })
                };
            }

            const sessionData = sessionTokens.get(sessionId);

            if (!sessionData) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ valid: false, message: 'No token found' })
                };
            }

            // Check if token is older than 1 hour
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            if (sessionData.timestamp < oneHourAgo) {
                sessionTokens.delete(sessionId);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ valid: false, message: 'Token expired' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ valid: true, timestamp: sessionData.timestamp })
            };
        }

        // Route not found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Route not found' })
        };

    } catch (error) {
        console.error('Error in calendar_auth function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
