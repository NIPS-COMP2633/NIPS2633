const newCalendar = {
    summary: "New Test Calendar",
    timeZone: "America/Edmonton"
}

export function addNewCalendar() {
    gapi.client.calendar.calendars.insert({
        resource: newCalendar
    })
        .then(response => {
            return response.result.id;
        })
        .catch(error => {
            console.error("Error creating calendar:", error)
        })
}
