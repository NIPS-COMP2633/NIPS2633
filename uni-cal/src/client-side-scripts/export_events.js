const newCalendar = {
    summary: 'TMyScheduleSync',
    description: 'Events imported from .ics file',
    timeZone: 'America/Edmonton'
  };

export function addNewCalendar(callback) {
    gapi.client.calendar.calendars.insert({
        resource: newCalendar
    })
        .then(response => {
            const calendarId = response.result.id;
            console.log("Calendar created:", calendarId);
            
            // Call the callback with the calendar ID
            setTimeout(() => {
                if (callback) {
                    callback(calendarId);
                }
            }, 1000);
        })
        .catch(error => {
            console.error("Error creating calendar:", error);
        });
}

export async function addEvents(eventsArray, calendarId = 'primary') {
    try {
      for (const event of eventsArray) {        
        const response = await gapi.client.calendar.events.insert({
          calendarId: calendarId,
          resource: event
        });

        // Add "response" to console log if errors occur.

        console.log(`Added: ${event.summary}`);
      }
      
      return { success: true, count: eventsArray.length };
      
    } catch (error) {
      console.error("Error adding event:", error);
      console.error("Error details:", error.result);
      throw error;
    }
  }