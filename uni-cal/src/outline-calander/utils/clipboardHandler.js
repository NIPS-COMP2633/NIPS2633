// Clipboard handling utilities for importing course data

/**
 * Parse and validate clipboard text as course data
 * @param {string} clipboardText - Raw clipboard text
 * @returns {Object} - Parsed clipboard data
 * @throws {Error} - If data is empty or invalid
 */
function parseAndValidateClipboardText(clipboardText) {
  
  if (!clipboardText) {
    throw new Error('Clipboard is empty. Make sure you clicked the bookmarklet first.');
  }
  
  // Parse the JSON data
  const data = JSON.parse(clipboardText);
  
  // Validate it has the expected structure
  if (!data.html || !data.url || !data.timestamp) {
    throw new Error('Invalid data format. Make sure you copied data from the bookmarklet.');
  }
  
  return data;
}

/**
 * Read and parse JSON data from clipboard
 * @returns {Promise<Object>} - Parsed clipboard data
 * @throws {Error} - If clipboard is empty or data is invalid
 */
export async function readClipboardData() {
  const clipboardText = await navigator.clipboard.readText();
  return parseAndValidateClipboardText(clipboardText);
}

/**
 * Check if clipboard contains valid course data
 * @param {string} clipboardText - Raw clipboard text
 * @returns {boolean} - Whether clipboard has valid bookmarklet data
 */
export function isValidCourseData(clipboardText) {
  if (!clipboardText) return false;
  
  try {
    const data = JSON.parse(clipboardText);
    return !!(data.html && data.url && data.timestamp);
  } catch {
    return false;
  }
}

/**
 * Auto-check clipboard for course data
 * @param {string} lastCheck - Last clipboard content checked
 * @returns {Promise<{data: Object|null, clipboardText: string}>} - Course data if found
 */
export async function autoCheckClipboard(lastCheck = null) {
  try {
    const clipboardText = await navigator.clipboard.readText();
    
    // Don't process if clipboard is empty or unchanged
    if (!clipboardText || clipboardText === lastCheck) {
      return { data: null, clipboardText };
    }

    // Parse and validate using shared logic
    const data = parseAndValidateClipboardText(clipboardText);
    console.log('Auto-detected course data in clipboard!');
    return { data, clipboardText };
  } catch (error) {
    // Silently fail - clipboard might not have valid data or permission denied
    console.log('Auto-clipboard check skipped:', error.message);
    return { data: null, clipboardText: lastCheck };
  }
}
