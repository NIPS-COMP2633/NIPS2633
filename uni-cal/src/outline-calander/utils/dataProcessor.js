// Data processing utilities for converting D2L course data to Google Calendar format
// Currently only the title is acquired successfully

/**
 * Constants for data transfer
 */
export const STORAGE_KEY = 'uni-cal-import-data';

/**
 * Validates the structure of incoming D2L data
 * @param {Object} data - The data to validate
 * @returns {boolean} - Whether the data is valid
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.timestamp || !data.courses || !Array.isArray(data.courses)) {
    return false;
  }

  // Validate each course has at least a title (other fields can be optional/empty)
  return data.courses.every(course =>
    course && typeof course === 'object' && course.title
  );
}


/**
 * Process PDF data and extract events from AI response
 * @param {Array} pdfData - Array of PDF info objects
 * @returns {Array} - Array of event objects with summary field
 */
async function processPDFData(pdfData) {

  if (!pdfData || pdfData.length === 0) {
    console.log('No PDF data to process - returning empty array');
    return [];
  }

  // Call OpenRouter API via Netlify function
  try {
    const response = await fetch('/.netlify/functions/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: JSON.stringify(pdfData, null, 2)
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    // Extract the actual message content from the API response
    if (responseData?.choices?.[0]?.message?.content) {
      const aiMessage = responseData.choices[0].message.content;
      // Try to parse as JSON if it's a JSON response
      try {
        const parsedContent = JSON.parse(aiMessage);

        // If it's an array of events, return them
        if (Array.isArray(parsedContent)) {
          return parsedContent;
        }
        // If it's a single event object, wrap in array
        if (parsedContent && typeof parsedContent === 'object') {
          return [parsedContent];
        }
      } catch (e) {
        console.log('AI response is not JSON, raw text:', aiMessage);
      }
    } else {
      console.log('Unexpected response structure from OpenRouter API');
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
  }

  return [];
}

/**
 * Process raw D2L data into calendar events
 * @param {Object} rawData - Raw data from localStorage
 * @returns {Object} - Processed data with events and metadata
 */
export async function processImportData(rawData) {
  try {
    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    // Extract events from PDF data via OpenRouter AI
    const aiExtractedEvents = data.pdfData ? await processPDFData(data.pdfData) : [];

    if (!validateImportData(data)) {
      throw new Error('Invalid data structure');
    }

    // Attach events to each course
    const coursesWithEvents = data.courses.map((course, index) => ({
      ...course,
      events: aiExtractedEvents.map(event => ({
        summary: event.summary || 'Untitled Event',
        ...event
      }))
    }));

    return {
      success: true,
      courses: coursesWithEvents,
      courseCount: data.courses.length,
      timestamp: data.timestamp,
      source: data.source || 'D2L'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      courses: []
    };
  }
}

/**
 * Parse HTML and extract PDF data, then pass to LLM
 * @param {string} html - HTML content from D2L page
 * @param {string} sourceUrl - Source URL of the page
 * @param {Array} pdfData - PDF data extracted from iframes
 * @returns {Object} - Import data package with PDF data
 */
export function parseHTMLForCourseData(html, sourceUrl, pdfData = null) {
  // Extract course title from HTML as a fallback
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const title = tempDiv.querySelector('h1')?.textContent?.trim() || 'Unnamed Course';

  // Create the import data structure
  const result = {
    timestamp: Date.now(),
    source: sourceUrl,
    timezone: 'America/Edmonton',
    courses: [{
      code: '',
      title: title,
      days: '',
      startTime: '',
      endTime: '',
      location: '',
      startDate: null,
      endDate: null,
      instructor: ''
    }]
  };

  // Include PDF data if available - this will be processed by the LLM
  if (pdfData) {
    result.pdfData = pdfData;
  }

  return result;
}
