// Calendar export utilities

/**
 * Export events as JSON file (temporary until Google Calendar API is integrated)
 * @param {Array} events - Calendar events to export
 * @returns {Promise<void>}
 */
export async function exportEventsAsJSON(events) {
  const dataStr = JSON.stringify(events, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'uni-cal-events.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export events to Google Calendar (placeholder for future implementation)
 * @param {Array} events - Calendar events to export
 * @returns {Promise<void>}
 */
export async function exportToGoogleCalendar(events) {
  // TODO: Implement Google Calendar API integration
  // For now, just download as JSON
  await exportEventsAsJSON(events);
  
  return {
    success: true,
    message: 'Events exported! Google Calendar integration coming soon.\n\nFor now, events have been downloaded as JSON.'
  };
}
