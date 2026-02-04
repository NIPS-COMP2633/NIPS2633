// Browser-compatible XML to JSON converter for MRU Schedule Builder
// Converts MRU Schedule Builder XML into Google Calendar API JSON format

class XmlToJsonConverter {
  // XML day numbers to Google Calendar day codes
  static DAY_MAP = {
    "1": "SU",
    "2": "MO",
    "3": "TU",
    "4": "WE",
    "5": "TH",
    "6": "FR",
    "7": "SA"
  };

  // Convert minutes from midnight to HH:MM format
  static minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  // Create ISO datetime string for a specific day and time
  static createDateTime(dayOfWeek, timeMinutes, semesterStartDate) {
    // dayOfWeek: 1=Sunday, 2=Monday, etc.
    // semesterStartDate: Date object for the first day of the semester
    
    const date = new Date(semesterStartDate);
    
    // Find the first occurrence of this day of week on or after start date
    const startDayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    const targetDayOfWeek = dayOfWeek - 1; // Convert from 1-based to 0-based
    
    let daysToAdd = targetDayOfWeek - startDayOfWeek;
    if (daysToAdd < 0) daysToAdd += 7;
    
    date.setDate(date.getDate() + daysToAdd);
    
    // Set the time
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    date.setHours(hours, minutes, 0, 0);
    
    return date.toISOString();
  }

  // Converts XML string to array of Google Calendar event JSONs
  static convert(xmlString, semesterStartDate = "2026-01-06", semesterEndDate = "2026-04-30", timezone = "America/Edmonton") {
    const startDate = new Date(semesterStartDate);
    const endDate = new Date(semesterEndDate);
    
    // Use browser's built-in DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    const courses = doc.getElementsByTagName("course");
    const events = [];

    Array.from(courses).forEach(course => {
      const code = course.getAttribute("code");
      const number = course.getAttribute("number");
      const courseCode = `${code}-${number}`;
      
      // Get course title from offering
      const offering = course.getElementsByTagName("offering")[0];
      const title = offering ? offering.getAttribute("title") : "";

      // Get all uselections (different sections)
      const uselections = course.getElementsByTagName("uselection");
      
      Array.from(uselections).forEach(uselection => {
        // Get all blocks (Lec, Tut, Lab)
        const selection = uselection.getElementsByTagName("selection")[0];
        const blocks = selection ? selection.getElementsByTagName("block") : [];
        
        // Get all timeblocks for this selection
        const timeblocks = uselection.getElementsByTagName("timeblock");
        
        // Group timeblocks by their id (referenced in blocks)
        const timeblockMap = {};
        Array.from(timeblocks).forEach(tb => {
          const id = tb.getAttribute("id");
          timeblockMap[id] = {
            day: parseInt(tb.getAttribute("day")),
            t1: parseInt(tb.getAttribute("t1")),
            t2: parseInt(tb.getAttribute("t2")),
            d1: parseInt(tb.getAttribute("d1")),
            d2: parseInt(tb.getAttribute("d2"))
          };
        });

        // Create an event for each block type
        Array.from(blocks).forEach(block => {
          const blockType = block.getAttribute("type");
          const secNo = block.getAttribute("secNo");
          const teacher = block.getAttribute("teacher") || "";
          const location = block.getAttribute("location") || "";
          const timeblockids = block.getAttribute("timeblockids");
          
          if (!timeblockids) return;

          // Get the timeblocks for this block
          const ids = timeblockids.split(",");
          const blockTimeblocks = ids.map(id => timeblockMap[id]).filter(Boolean);
          
          if (blockTimeblocks.length === 0) return;

          // Use the first timeblock to get date range
          const firstTb = blockTimeblocks[0];

          // Collect all days this event occurs on
          const daysOfWeek = blockTimeblocks.map(tb => this.DAY_MAP[tb.day]).filter(Boolean);
          
          // Use the first timeblock's time for the event
          const startTime = firstTb.t1;
          const endTime = firstTb.t2;

          const event = {
            summary: `${courseCode}, ${blockType}${secNo}, ${location}`,
            description: `Course: ${title}\nInstructor: ${teacher}\nType: ${blockType}\nSection: ${secNo}`,
            location: location,
            start: {
              dateTime: this.createDateTime(firstTb.day, startTime, startDate),
              timeZone: timezone
            },
            end: {
              dateTime: this.createDateTime(firstTb.day, endTime, startDate),
              timeZone: timezone
            }
          };

          // Add recurrence rule if there are recurring days
          if (daysOfWeek.length > 0) {
            const untilDate = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            event.recurrence = [
              `RRULE:FREQ=WEEKLY;BYDAY=${daysOfWeek.join(',')};UNTIL=${untilDate}`
            ];
          }

          events.push(event);
        });
      });
    });

    return events;
  }
}

export { XmlToJsonConverter };
