/**
 * Google Calendar Authentication Server-Side Handler
 * 
 * This server handles Google Calendar OAuth2 authentication flow
 * and manages tokens for calendar operations.
 */

const express = require('express');
const router = express.Router();

// Store OAuth2 configuration
const CLIENT_ID = process.env.google_calander_client_id;
const API_KEY = process.env.google_calander_api_key;
const DISCOVERY_DOC = process.env.google_calander_discovery_doc;
const SCOPES = process.env.google_calander_scopes;

// Session storage for tokens (in production, use a proper session store)
const sessionTokens = new Map();

/**
 * GET /api/calendar-auth/config
 * Returns the OAuth2 configuration for client-side initialization
 */
router.get('/config', (req, res) => {
    try {
        if (!CLIENT_ID || !API_KEY || !DISCOVERY_DOC || !SCOPES) {
            return res.status(500).json({
                error: 'Google Calendar configuration not found in environment variables',
                missing: {
                    clientId: !CLIENT_ID,
                    apiKey: !API_KEY,
                    discoveryDoc: !DISCOVERY_DOC,
                    scopes: !SCOPES
                }
            });
        }

        res.json({
            clientId: CLIENT_ID,
            apiKey: API_KEY,
            discoveryDoc: DISCOVERY_DOC,
            scopes: SCOPES
        });
    } catch (error) {
        console.error('Error getting calendar auth config:', error);
        res.status(500).json({ error: 'Failed to retrieve configuration' });
    }
});

/**
 * POST /api/calendar-auth/token
 * Stores the OAuth2 token received from the client
 */
router.post('/token', (req, res) => {
    try {
        const { sessionId, token } = req.body;

        if (!sessionId || !token) {
            return res.status(400).json({
                error: 'Session ID and token are required'
            });
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

        res.json({ success: true, message: 'Token stored successfully' });
    } catch (error) {
        console.error('Error storing token:', error);
        res.status(500).json({ error: 'Failed to store token' });
    }
});

/**
 * GET /api/calendar-auth/token/:sessionId
 * Retrieves the stored token for a session
 */
router.get('/token/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const sessionData = sessionTokens.get(sessionId);

        if (!sessionData) {
            return res.status(404).json({ error: 'Token not found for session' });
        }

        res.json({
            token: sessionData.token,
            timestamp: sessionData.timestamp
        });
    } catch (error) {
        console.error('Error retrieving token:', error);
        res.status(500).json({ error: 'Failed to retrieve token' });
    }
});

/**
 * DELETE /api/calendar-auth/token/:sessionId
 * Revokes and removes the stored token for a session
 */
router.delete('/token/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const wasDeleted = sessionTokens.delete(sessionId);

        if (!wasDeleted) {
            return res.status(404).json({ error: 'Token not found for session' });
        }

        res.json({ success: true, message: 'Token revoked successfully' });
    } catch (error) {
        console.error('Error revoking token:', error);
        res.status(500).json({ error: 'Failed to revoke token' });
    }
});

/**
 * POST /api/calendar-auth/validate
 * Validates if a token is still valid
 */
router.post('/validate', (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const sessionData = sessionTokens.get(sessionId);

        if (!sessionData) {
            return res.json({ valid: false, message: 'No token found' });
        }

        // Check if token is older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (sessionData.timestamp < oneHourAgo) {
            sessionTokens.delete(sessionId);
            return res.json({ valid: false, message: 'Token expired' });
        }

        res.json({ valid: true, timestamp: sessionData.timestamp });
    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({ error: 'Failed to validate token' });
    }
});

module.exports = router;
