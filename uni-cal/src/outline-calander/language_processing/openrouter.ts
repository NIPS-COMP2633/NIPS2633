

export async function makeOpenRouterCalls(prompt: string) {
  try {
    // Read API key from file
    const apiKeyResponse = await fetch('/open_router_api_key.txt');
    if (!apiKeyResponse.ok) {
      throw new Error('Failed to load API key');
    }
    const OPENROUTER_API_KEY = (await apiKeyResponse.text()).trim();

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
      model: "arcee-ai/trinity-large-preview:free",
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
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in makeOpenRouterCalls:', error);
    throw error;
  }
}