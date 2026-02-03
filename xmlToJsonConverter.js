// xmlToJsonConverter.js
// This file has been converted from rails to javascript with the help of chatgpt.
// I simply put my rails version into chatgpt, told it to convert that to javascript and made some tweaks and will continue to where need be!
// Converts MRU Schedule Builder XML into Google Calendar API JSON format
// Still not perfect

const { DOMParser } = require("xmldom");
const moment = require("moment-timezone");

class XmlToJsonConverter {
  // XML day → Google Calendar day mapping
  static DAY_MAP = {
    "1": "SU",
    "2": "MO",
    "3": "TU",
    "4": "WE",
    "5": "TH",
    "6": "FR",
    "7": "SA"
  };

  /**
   * Converts XML string to array of Google Calendar event JSONs
   */
  static convert(xmlString, timezone = "America/Edmonton", allowedCodes = null) {
    const doc = new DOMParser().parseFromString(xmlString, "text/xml");
    const courses = Array.from(doc.getElementsByTagName("Course"));

    const events = courses.map(course => {
      const getText = tag =>
        course.getElementsByTagName(tag)[0]?.textContent || null;

      const code = getText("Code");
      if (allowedCodes && !allowedCodes.includes(code)) return null;

      const title = getText("Title");
      const days = getText("Days") || "";
      const startTime = getText("StartTime");
      const endTime = getText("EndTime");
      const location = getText("Location") || "";

      // "2 4 6" → ["MO", "WE", "FR"]
      const rruleDays = days
        .split(" ")
        .map(d => this.DAY_MAP[d])
        .filter(Boolean);

      const event = {
        summary: title || code,
        description: `Course code: ${code}`,
        location: location,
        start: {
          dateTime: this.buildDateTime(startTime, timezone),
          timeZone: timezone
        },
        end: {
          dateTime: this.buildDateTime(endTime, timezone),
          timeZone: timezone
        }
      };

      if (rruleDays.length > 0) {
        event.recurrence = [
          `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays.join(",")}`
        ];
      }

      return event;
    });

    return JSON.stringify(events.filter(Boolean));
  }

  /**
   * Builds ISO8601 datetime string in given timezone
   */
  static buildDateTime(timeStr, timezone) {
    const [hour, minute] = timeStr.split(":").map(Number);
    return moment()
      .tz(timezone)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0)
      .toISOString();
  }
}

module.exports = XmlToJsonConverter;
