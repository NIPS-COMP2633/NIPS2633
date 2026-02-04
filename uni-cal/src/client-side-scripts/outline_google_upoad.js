import { handleAuthClick, gapiLoaded, gisLoaded } from './calendar_auth_client';
import { addNewCalendar, addEvents } from './export_events';

/**
 * Export all course events to Google Calendar
 * @param {Array<Array>} allEventsArray - 2D array where each element is an array of events from a course
 */
export async function exportAllEvents(allEventsArray) {
  console.log('Exporting events to Google Calendar...', allEventsArray);
  console.log('Number of courses:', allEventsArray?.length || 0);
  
  return new Promise((resolve, reject) => {
    // Ensure Google APIs are loaded before proceeding
    if (typeof gapi === 'undefined' || typeof google === 'undefined') {
      reject(new Error('Google API libraries not loaded. Please refresh the page.'));
      return;
    }

    // Wait for APIs to be ready and initialize them
    const waitForAPIs = async () => {
      // Wait for script tags to load
      while (!window.gapiLoaded || !window.gisLoaded) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Initialize gapi client
      gapiLoaded();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Initialize gis
      gisLoaded();
      await new Promise(resolve => setTimeout(resolve, 300));
    };

    waitForAPIs().then(() => {
      // Now authenticate the user
      handleAuthClick(async () => {
        try {
          // Create a new calendar for the imported courses
          addNewCalendar(async (calendarId) => {
            try {
              // Flatten the 2D array and add all events to the new calendar
              const allEvents = allEventsArray.flat();
              console.log(`Adding ${allEvents.length} events to calendar ${calendarId}`);
              
              const result = await addEvents(allEvents, calendarId);
              console.log(`Successfully added ${result.count} events`);
              
              // Redirect to Google Calendar to view the newly created calendar
              window.location.href = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`;
              
              resolve(result);
            } catch (error) {
              console.error('Error adding events:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('Error creating calendar:', error);
          reject(error);
        }
      });
    }).catch(reject);
  });
}
