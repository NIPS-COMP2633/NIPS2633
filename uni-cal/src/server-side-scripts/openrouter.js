exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Get API key from Netlify environment variable
        const OPENROUTER_API_KEY = process.env.openrouter_api_key;

        if (!OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key not found in environment variables');
        }

        // Parse the request body to get the prompt
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required' })
            };
        }

        // Sanitize prompt - remove control characters and ensure valid UTF-8
        const sanitizedPrompt = prompt
            // eslint-disable-next-line no-control-regex
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except \n, \r, \t
            .replace(/\uFFFD/g, ''); // Remove replacement characters

        const systemInstructions = `
      Respond **only** in JSON. Find the following values in the user prompt, and return an array of JSON objects in this format:
    {
    "summary": "<course-title> - <event type (exam, assignment, etc)>",
    "description": "<short description>",
    "location": "<class-room. Example: lecture room>",
    "start": {
      "dateTime": "<start-datetime>",
      "timeZone": "America/Edmonton"
    },
    "end": {
      "dateTime": "<end-datetime>",
      "timeZone": "America/Edmonton"
    }
      for every event found.
    `.replace(/\s+/g, ' ').trim();

        const requestBody = {
            model: "openai/gpt-oss-safeguard-20b",
            messages: [
                {
                    role: "system",
                    content: systemInstructions
                },
                {
                    role: "user",
                    content: sanitizedPrompt
                }
            ]
        };

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Adjust this for production
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error in openrouter function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
