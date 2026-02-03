// test.js
// Test file for XmlToJsonConverter using your original XML

const XmlToJsonConverter = require("./xmlToJsonConverter");

const sampleXML = `
<Schedule>
  <Course>
    <Code>COMP2633</Code>
    <Title>Software Engineering</Title>
    <Days>2 4</Days>
    <StartTime>13:00</StartTime>
    <EndTime>14:20</EndTime>
    <Location>EA 2009</Location>
  </Course>

  <Course>
    <Code>ENTR3305</Code>
    <Title>The Art of the Pitch</Title>
    <Days>2 4</Days>
    <StartTime>16:00</StartTime>
    <EndTime>17:20</EndTime>
    <Location>EB1107</Location>
  </Course>

  <Course>
    <Code>COMP2659</Code>
    <Title>Computing Machinery II</Title>
    <Days>2 3 5</Days>
    <StartTime>10:30</StartTime>
    <EndTime>11:20</EndTime>
    <Location>EC1135</Location>
  </Course>

  <Course>
    <Code>MATH2234</Code>
    <Title>Concepts of Mathematical Statistics</Title>
    <Days>2 4 5</Days>
    <StartTime>8:30</StartTime>
    <EndTime>9:50</EndTime>
    <Location>Y316</Location>
  </Course>
</Schedule>
`;

// Convert XML to Google Calendar-style JSON
const jsonOutput = XmlToJsonConverter.convert(sampleXML);

// Print JSON
console.log(jsonOutput);
