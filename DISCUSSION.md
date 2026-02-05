# Team Hackathon Post Template

## Team Information
- **Team name:** NIPS
- **Team members:**  Naveed Elias (201748310), Robert Parker Hutcheson (201762335), Isaac Klein (201763977), Sarah Fazal (201742339)
- **Tools / language(s) used:** React.js, Node.js/Express, JavaScript (ES6+), HTML/CSS, Google Calendar API, OpenRouter API (AI integration), XML/JSON processing (xml2js, xmldom), Axios (HTTP client), React Router, Netlify (Deployment)

## 1. What We Set Out to Build
### Problem or Idea
&emsp; Currently, MRU students need to manually move their calendar from [My Schedule Builder](https://sb.mymru.ca/criteria.jsp) or the [Registration Landing Page](https://ban9ssb-prod.mtroyal.ca/StudentRegistrationSsb/ssb/registration) into a system that works for them, be it physical or digital. However, all students are already set up with a Google Calendar for holidays and school wide events because MRU accounts are run using [Google Workspace](https://en.wikipedia.org/wiki/Google_Workspace).  
&emsp; So, at least to start, we set out to create an application that would download the information from student's schedules and upload it to their Google Calendar.  
&emsp; But we also managed to hit a stretch goal, which was to use an LLM API to parse student's syllubi and add the due dates of assignments and exams. However, because it is using an LLM, there is some reliability issues- further confounded by the fact that many syllubi don't include all of the relevant information.

### Why is it Meaningful
&emsp; Having class-times and assessments in Google Calendar allows students an easier time to sync their calendars to their phones, and even more importantly, allows them to find meeting times for group projects with reduced friction. This is how many companies are run, and it helps prepare students for the workforce by (hopefully) encouraging the habit of using their calendars, while not forcing them to spend an hour or two every semester trying to keep it up to date.  
&emsp; Furthermore, the amount of time it takes to add assignments and tests can be significant, but the upside of being able to prioritize what you're working on based on what is coming up can make a significant impact on the outcome of a semester.  
&emsp; For example, imagine how much fun it would be to find a meeting time for our hackathon group:  
![collaborative-calendars](/assets/calendars.png)

## 2. Input → Process → Output
### Inputs
1. MRU Login: Username and password **!NOT STORED ANYWHERE!**
2. D2L Course Outlines: The syllabus text-data is collected from the "uni-cal Importer" bookmarklet, and from it we parse information like assignments and test. After each class is added, the user must return to our website for the time being however.
3. Google Calendar Login: A google login popup. If the user is already logged into google on their browser, it merely asks for permission- otherwise users will need to log into their google account.

### Process
1. The information of the username and password is used to navigate through the redirect process starting at sb.mymru.ca, the link to My Schedule Builder, for the full process, see `app.post('/api/get_calendar'` of [backend-proxy.js](uni-cal/backend-proxy.js). It's fairly involved, because it's _lightly_ approximating the user workflow to navigate to their calendar. My Schedule Builder is not setup for developers to hit the endpoints, at least to the best of our knowledge. After using the username and password to POST for auth, it gets the current schedule for the winter 2026 semester, which is currently hardcoded.
2. Then, the information for the calendar is brought back in memory in an XML format, as that's what the API responds with. It then goes through the [xml_to_json.js](uni-cal/src/client-side-scripts/xml_to_json.js) script, which converts it into JSON, compatible with what the Google Calendar API expects.
3. The user is navigated to the next page, and the information for the courses is displayed, along with a prompt to add [bookmarkletGenerator.js](uni-cal/src/outline-calander/utils/bookmarkletGenerator.js) to their bookmarks bar. The instructions are given to go to their course outline, and click the bookmarklet. This will extract the raw information from their outline PDF, and instruct the user to return to their calendar preview. At this point [dataProcessor.js](uni-cal/src/outline-calander/utils/dataProcessor.js) will process the raw information into a manageable text. After which [openrouter.js](uni-cal/src/server-side-scripts/openrouter.js) will be hit, and the information will be given to the `openai/gpt-oss-safeguard-20b` model, which will attempt to extract the information of due dates, in an Google Calendar friendly format.
4. Once the information is received, it is appended to the My Schedule Builder calendar JSON.

### Output
1. The JSON is now sent via [outline_google_upoad.js](uni-cal/src/client-side-scripts/outline_google_upoad.js) in conjunction with [calendar_auth.js](uni-cal/src/client-side-scripts/calendar_auth.js) to the Google Calendar API.
2. Authentication and permissions are handled via Google's federated authentication.
3. Finally, the calendar information is added into the user's Google Calender as a new calendar.

## 3. Team System
### Communication
Our team communicated via Discord. We used the following channels:
- #general: for overall team communication and updates
- #schedules: for sharing and discussing schedules
- standup: daily standup updates and progress reports (didn't fully work out)
- #tech-support: for technical questions and troubleshooting
- #meeting-outcomes: for posting meeting summaries and action items

### Decision Making / how work was divided
We used GitHub issues and GitHub projects to trak our tasks and features. A team member would for any tasks or features they wanted to work on, and we would prioritize using the GitHub project board. People could self-assign issues they wanted to work on to avoid two people working on the same thing.

### How we handled uncertainty / confusion
For anything we needed cleared up, Discord was our GoTo. People would message to the #General channel for questions or to clarify any confusion.

## 4. AI Use (If Any)

## 5. Evidence of Work
- [Video of our app in action](https://youtu.be/UfqZ6Q7_L4s)
- [The actual live app](https://my-schedule-sync.netlify.app/)
- [You're already here, but you can see the code in our repository](https://github.com/NIPS-COMP2633/NIPS2633)

## 6. Team Reflection — Multiple Perspectives

## 7. Portfolio-Style Reflection (Optional, Short)
