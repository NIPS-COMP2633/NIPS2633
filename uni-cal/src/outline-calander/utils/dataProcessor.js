// Data processing utilities for converting D2L course data to Google Calendar format
// Currently only the title is acquired successfully

import { makeOpenRouterCalls } from '../language_processing/openrouter.ts';

/**
 * Constants for data transfer
 */
export const STORAGE_KEY = 'uni-cal-import-data';
export const STORAGE_STATUS_KEY = 'uni-cal-import-status';


/**
 * Day mapping from D2L numeric format to Google Calendar RRULE format
 */
const DAY_MAP = {
  "1": "SU",
  "2": "MO",
  "3": "TU",
  "4": "WE",
  "5": "TH",
  "6": "FR",
  "7": "SA"
};

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
 * Sanitize HTML content to prevent XSS
 * @param {string} html - Raw HTML content
 * @returns {string} - Sanitized content
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Format time string for datetime
 * @param {string} timeStr - Time in format like "1:00 PM" or "13:00"
 * @param {Date} date - The date to use
 * @returns {string} - ISO 8601 formatted datetime
 */
function formatDateTime(timeStr, date = new Date()) {
  try {
    // Parse time (handles both 12-hour and 24-hour formats)
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeParts) {
      throw new Error('Invalid time format');
    }

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const meridiem = timeParts[3];

    // Convert to 24-hour format if needed
    if (meridiem) {
      if (meridiem.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    
    return dateTime.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * Convert D2L course data to Google Calendar event format
 * @param {Object} course - Course data from D2L
 * @param {string} timezone - Timezone for the events (default: America/Edmonton)
 * @returns {Object} - Google Calendar event object
 */
export function courseToCalendarEvent(course, timezone = 'America/Edmonton') {
  const {
    code,
    title,
    days,
    startTime,
    endTime,
    location,
    startDate,
    endDate
  } = course;

  // Convert days string like "2 4 6" to RRULE format "MO,WE,FR"
  let recurrence = null;
  if (days && days.trim()) {
    const rruleDays = days
      .split(/\s+/)
      .map(d => DAY_MAP[d])
      .filter(Boolean)
      .join(',');
    
    if (rruleDays) {
      const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays}`;
      // Add end date if provided
      if (endDate) {
        const until = new Date(endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        recurrence = [`${rrule};UNTIL=${until}`];
      } else {
        recurrence = [rrule];
      }
    }
  }

  const eventStartDate = startDate ? new Date(startDate) : new Date();
  
  // Use placeholder times if not provided (9 AM - 10 AM)
  const defaultStartTime = startTime || '9:00 AM';
  const defaultEndTime = endTime || '10:00 AM';
  
  const event = {
    summary: title || code || 'Untitled Course',
    description: `Course code: ${code}${course.instructor ? `\nInstructor: ${course.instructor}` : ''}${!startTime ? '\n\n⚠️ Note: Schedule times could not be extracted. Please verify and update times in Google Calendar.' : ''}`,
    location: location || '',
    start: {
      dateTime: formatDateTime(defaultStartTime, eventStartDate),
      timeZone: timezone
    },
    end: {
      dateTime: formatDateTime(defaultEndTime, eventStartDate),
      timeZone: timezone
    }
  };

  if (recurrence) {
    event.recurrence = recurrence;
  }

  return event;
}

/**
 * Process PDF data and extract events from AI response
 * @param {Array} pdfData - Array of PDF info objects
 * @returns {Array} - Array of event objects with summary field
 */
async function processPDFData(pdfData) {
  console.log('processPDFData called with:', {
    isArray: Array.isArray(pdfData),
    length: pdfData?.length
  });
  
  if (!pdfData || pdfData.length === 0) {
    console.log('No PDF data to process - returning empty array');
    return [];
  }
  
  // Call OpenRouter API with PDF data
  try {
    const responseData = await makeOpenRouterCalls(JSON.stringify(pdfData, null, 2));
    console.log('OpenRouter API Full Response:', responseData);
    
    // Extract the actual message content from the API response
    if (responseData?.choices?.[0]?.message?.content) {
      const aiMessage = responseData.choices[0].message.content;
      console.log('AI Response Content:', aiMessage);
      
      // Try to parse as JSON if it's a JSON response
      try {
        const parsedContent = JSON.parse(aiMessage);
        console.log('Parsed AI JSON Response:', parsedContent);
        
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
    
    console.log('processImportData called with data:', {
      hasPdfData: !!data.pdfData,
      pdfDataLength: data.pdfData?.length,
      coursesCount: data.courses?.length
    });
    
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

/**
 * Create import data package for localStorage
 * @param {Array} courses - Array of course objects
 * @param {string} source - Source URL or identifier
 * @returns {Object} - Formatted data package
 */
export function createImportPackage(courses, source = 'D2L') {
  return {
    timestamp: Date.now(),
    source,
    timezone: 'America/Edmonton',
    courses: courses.map(course => ({
      code: sanitizeHTML(course.code || ''),
      title: sanitizeHTML(course.title || ''),
      days: course.days || '',
      startTime: course.startTime || '',
      endTime: course.endTime || '',
      location: sanitizeHTML(course.location || ''),
      startDate: course.startDate || null,
      endDate: course.endDate || null,
      instructor: sanitizeHTML(course.instructor || '')
    }))
  };
}
