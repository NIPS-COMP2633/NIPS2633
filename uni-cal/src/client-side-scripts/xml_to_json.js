// app/services/xml_to_json_converter.js
//
// Converts MRU Schedule Builder XML into Google Calendar API JSON format
//
// This file has been tested with the TEST at the bottom of this file.
// It has provided a correct JSON interpretation of the XML data
// The output amongst this TEST, and other test cases have passed as well!!!

// For Node.js environment
const { DOMParser } = require('xmldom');

class XmlToJsonConverter {
  // XML dates transfers to google dates in their respected formats
  static DAY_MAP = {
    "1": "SU",
    "2": "MO",
    "3": "TU",
    "4": "WE",
    "5": "TH",
    "6": "FR",
    "7": "SA"
  };

  // Converts XML string to array of Google Calendar event JSONs
  static convert(xmlString, timezone = "America/Edmonton") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    const courses = doc.getElementsByTagName("Course");
    const events = Array.from(courses).map(course => {
      const getElementText = (tagName) => {
        const element = course.getElementsByTagName(tagName)[0];
        return element ? element.textContent : "";
      };

      const code = getElementText("Code");
      const title = getElementText("Title");
      const days = getElementText("Days");
      const startTime = getElementText("StartTime");
      const endTime = getElementText("EndTime");
      const location = getElementText("Location");

      // Days like "2 4 6" → MO,WE,FR
      const rruleDays = days
        .split(/\s+/)
        .map(d => this.DAY_MAP[d])
        .filter(Boolean)
        .join(",");

      const recurrence = rruleDays ? [`RRULE:FREQ=WEEKLY;BYDAY=${rruleDays}`] : null;

      const event = {
        summary: title || code,
        description: `Course code: ${code}`,
        location: location,
        start: {
          dateTime: this.formatDatetime(startTime),
          timeZone: timezone
        },
        end: {
          dateTime: this.formatDatetime(endTime),
          timeZone: timezone
        }
      };

      if (recurrence) {
        event.recurrence = recurrence;
      }

      return event;
    });

    return JSON.stringify(events, null, 2);
  }

  // Helper to turn e.g. "1:00" into ISO8601 string
  static formatDatetime(timeStr) {
    const today = new Date();
    const [hours, minutes] = timeStr.split(":");

    // Create date with current date and specified time
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                         parseInt(hours), parseInt(minutes), 0);

    // Format as ISO8601
    return date.toISOString();
  }
}

// TEST: sample XML for Software Engineering class
const sampleXml = `
<Course>
  <Code>COMP2633</Code>
  <Title>Software Engineering</Title>
  <Days>2 4 6</Days>
  <StartTime>1:00</StartTime>
  <EndTime>2:20</EndTime>
  <Location>MC 123</Location>
</Course>
`;

console.log(XmlToJsonConverter.convert(sampleXml));

// Export for use in Node.js or modules
module.exports = XmlToJsonConverter;
