// HTML parsing utilities for extracting course data from D2L pages

/**
 * Day name mapping to numeric format
 */
const DAY_MAP = {
  'sunday': '1', 'sun': '1', 'u': '1',
  'monday': '2', 'mon': '2', 'm': '2',
  'tuesday': '3', 'tue': '3', 't': '3',
  'wednesday': '4', 'wed': '4', 'w': '4',
  'thursday': '5', 'thu': '5', 'r': '5',
  'friday': '6', 'fri': '6', 'f': '6',
  'saturday': '7', 'sat': '7', 's': '7'
};

/**
 * Extract course title from HTML
 * @param {HTMLElement} element - DOM element to search
 * @returns {string} - Course title
 */
function extractTitle(element) {
  return element.querySelector('h1')?.textContent?.trim() || 'Unnamed Course';
}

/**
 * Extract course code from HTML
 * @param {HTMLElement} element - DOM element to search
 * @returns {string} - Course code
 */
function extractCourseCode(element) {
  return element.querySelector('.d2l-course-code, .course-code')?.textContent?.trim() || 'UNKNOWN';
}

/**
 * Extract time from page text
 * @param {string} pageText - Full page text content
 * @returns {{startTime: string, endTime: string}} - Time data
 */
function extractTime(pageText) {
  const timeMatch = pageText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  
  if (timeMatch) {
    return {
      startTime: timeMatch[1],
      endTime: timeMatch[2]
    };
  }
  
  return { startTime: '', endTime: '' };
}

/**
 * Extract days of week from page text
 * @param {string} pageText - Full page text content
 * @returns {string} - Space-separated day numbers (e.g., "2 4 6")
 */
function extractDays(pageText) {
  const daysMatch = pageText.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|M|T|W|R|F|S|U)/gi);
  
  if (!daysMatch || daysMatch.length === 0) {
    return '';
  }
  
  const uniqueDays = new Set();
  daysMatch.forEach(day => {
    const normalized = day.toLowerCase();
    if (DAY_MAP[normalized]) {
      uniqueDays.add(DAY_MAP[normalized]);
    }
  });
  
  return Array.from(uniqueDays).sort().join(' ');
}

/**
 * Extract location from page text
 * @param {string} pageText - Full page text content
 * @returns {string} - Location string
 */
function extractLocation(pageText) {
  const locationMatch = pageText.match(/(?:Room|Location|Building)\s*:?\s*([A-Z]{1,3}\s*\d{1,4}[A-Z]?)/i);
  return locationMatch ? locationMatch[1] : '';
}

/**
 * Extract instructor name from page text
 * @param {string} pageText - Full page text content
 * @returns {string} - Instructor name
 */
function extractInstructor(pageText) {
  const instructorMatch = pageText.match(/(?:Instructor|Professor|Teacher)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
  return instructorMatch ? instructorMatch[1] : '';
}

/**
 * Parse HTML and extract course data
 * @param {string} html - HTML content from D2L page
 * @param {string} sourceUrl - Source URL of the page
 * @returns {Object} - Parsed course data and import package
 */
export function parseHTMLForCourseData(html, sourceUrl) {
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const pageText = tempDiv.innerText || tempDiv.textContent;
  const title = extractTitle(tempDiv);
  const code = extractCourseCode(tempDiv);
  const { startTime, endTime } = extractTime(pageText);
  
  const scheduleData = {
    code,
    title,
    days: extractDays(pageText),
    startTime,
    endTime,
    location: extractLocation(pageText),
    instructor: extractInstructor(pageText)
  };

  console.log('Extracted course data:', {
    title,
    code,
    hasTime: !!(startTime && endTime),
    pageLength: pageText.length
  });

  // Warn if critical data is missing
  if (!startTime || !endTime) {
    console.warn('No schedule times found in HTML. Course will be imported but may need manual time entry.');
  }

  // Create the import data structure
  return {
    timestamp: Date.now(),
    source: sourceUrl,
    timezone: 'America/Edmonton',
    courses: [scheduleData]
  };
}
