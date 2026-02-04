/**
 * Client-side wrapper for Google Calendar Authentication
 * Communicates with the server-side calendar_auth API
 */

const API_BASE_URL = '/.netlify/functions/calendar_auth';

// Generate a unique session ID for this browser session
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

let tokenClient;
let gapiInited = false;
let gisInited = false;
let authConfig = null;

/**
 * Fetch authentication configuration from the server
 */
async function fetchAuthConfig() {
    if (authConfig) return authConfig;

    try {
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        authConfig = await response.json();
        return authConfig;
    } catch (error) {
        console.error('Error fetching auth config:', error);
        throw error;
    }
}

/**
 * Initialize the Google API client
 */
export async function gapiLoaded() {
    const config = await fetchAuthConfig();

    await gapi.client.init({
        apiKey: config.apiKey,
        discoveryDocs: [config.discoveryDoc],
    });
    gapiInited = true;
}

/**
 * Initialize the Google Identity Services client
 */
export async function gisLoaded() {
    try {
        const config = await fetchAuthConfig();

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: config.clientId,
            scope: config.scopes,
            callback: '', // defined later
        });
        gisInited = true;
        console.log('Google Identity Services initialized successfully');
    } catch (error) {
        console.error('Error initializing Google Identity Services:', error);
        throw error;
    }
}

/**
 * Store token on the server
 */
async function storeToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: SESSION_ID,
                token: token
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to store token: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error storing token:', error);
        throw error;
    }
}

/**
 * Handle authentication click
 * @param {Function} onAuthSuccess - Callback function to execute after successful authentication
 */
export function handleAuthClick(onAuthSuccess) {
    if (!tokenClient) {
        const error = new Error('Token client not initialized. Please ensure gisLoaded() has completed.');
        console.error(error);
        throw error;
    }

    tokenClient.callback = async (resp) => {
        console.log("Auth Response: ", resp);

        if (resp.error !== undefined) {
            throw (resp);
        }

        // Store the token on the server
        try {
            await storeToken(resp);
            console.log("Token stored on server successfully");

            if (onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (error) {
            console.error("Failed to store token on server:", error);
            throw error;
        }
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 * Handle sign out click
 */
export async function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');

        // Remove token from server
        try {
            const response = await fetch(`${API_BASE_URL}/token/${SESSION_ID}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log("Token revoked on server successfully");
            }
        } catch (error) {
            console.error("Failed to revoke token on server:", error);
        }
    }
}

/**
 * Check if both GAPI and GIS are initialized
 * @returns {boolean} True if both are initialized
 */
export function isInitialized() {
    return gapiInited && gisInited && tokenClient !== null;
}

/**
 * Validate if the current session has a valid token
 */
export async function validateSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: SESSION_ID
            })
        });

        if (!response.ok) {
            return { valid: false };
        }

        return await response.json();
    } catch (error) {
        console.error('Error validating session:', error);
        return { valid: false };
    }
}
