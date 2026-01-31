
// Use an LLM to convert the following `ruby` into `javascript`

/*

# app/services/xml_to_json_converter.rb
#
# Converts MRU Schedule Builder XML into Google Calendar API JSON format
#
# This file has been tested with the TEST at the bottom of this file.
# It has provided a correct JSON interpretation of the XML data 
# The output amongst this TEST, and other test cases have passed as well!!!

require 'nokogiri'
require 'json'
require 'time'
require 'date'

class XmlToJsonConverter
  # XML dates transfers to google dates in their respected formats
  DAY_MAP = {
    "1" => "SU",
    "2" => "MO",
    "3" => "TU",
    "4" => "WE",
    "5" => "TH",
    "6" => "FR",
    "7" => "SA"
  }

  # Converts XML string to array of Google Calendar event JSONs
  def self.convert(xml_string, timezone="America/Edmonton")
    doc = Nokogiri::XML(xml_string)

    events = doc.xpath("//Course").map do |course|
      code  = course.at_xpath("Code")&.text
      title = course.at_xpath("Title")&.text
      days  = course.at_xpath("Days")&.text.to_s
      start_time = course.at_xpath("StartTime")&.text
      end_time   = course.at_xpath("EndTime")&.text
      location   = course.at_xpath("Location")&.text.to_s

      # Days like "2 4 6" → MO,WE,FR
      rrule_days = days.split.map { |d| DAY_MAP[d] }.compact.join(",")

      recurrence = rrule_days.empty? ? nil : [
        "RRULE:FREQ=WEEKLY;BYDAY=#{rrule_days}"
      ]

      event = {
        "summary" => title || code,
        "description" => "Course code: #{code}",
        "location" => location,
        "start" => {
          "dateTime" => format_datetime(start_time),
          "timeZone" => timezone
        },
        "end" => {
          "dateTime" => format_datetime(end_time),
          "timeZone" => timezone
        }
      }

      event["recurrence"] = recurrence if recurrence
      event
    end

    events.to_json
  end

  private

  # helper to turn e.g."1:00" into string
  def self.format_datetime(time_str)
    date = Date.today
    Time.parse("#{date} #{time_str} -07:00").iso8601
  end
end


# TEST: sample XML for Kidneys class
sample_xml = <<~XML
<Course>
  <Code>COMP2633</Code>
  <Title>Software Engineering</Title>
  <Days>2 4 6</Days>
  <StartTime>1:00</StartTime>
  <EndTime>2:20</EndTime>
  <Location>MC 123</Location>
</Course>
XML

puts XmlToJsonConverter.convert(sample_xml)

*/