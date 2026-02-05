# Team Hackathon Post Template

## Team Information
- **Team name:** NIPS
- **Team members:**  Naveed Elias (201748310), Robert Parker Hutcheson (201762335), Isaac Klein (201763977), Sarah Fazal (201742339)
- **Tools / language(s) used:** React.js, Node.js/Express, JavaScript (ES6+), HTML/CSS, Google Calendar API, OpenRouter API (AI integration), XML/JSON processing (xml2js, xmldom), Axios (HTTP client), React Router, Netlify (Deployment)

## 1. What We Set Out to Build

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

## 4. AI Use (If Any)

## 5. Evidence of Work
- [Video of our app in action](https://youtu.be/UfqZ6Q7_L4s)
- [The actual live app](https://my-schedule-sync.netlify.app/)
- [You're already here, but you can see the code in our repository](https://github.com/NIPS-COMP2633/NIPS2633)

## 6. Team Reflection — Multiple Perspectives

### Naveed Elias

&emsp; I believe our project went well and ran pretty smoothly despite having a week. I was able to understand the role my scripts play in the workflow of our web application, and my scripts worked as expected, tested and approved by my teammates. I gained a better understanding of creating and running scripts within a web application and was able to successfully implement authentication from the user to use their Google Calendar. Despite the function randomly working within the web application at the moment, I encountered an issue with my addNewCalendar script. The intended behavior was to create a new calendar and return the calendarId, which it does, but when I try to add events to it, I get an HTTP 400 error. Because of the time constraints, I made the decision to add events to the primary calendar instead of the new one. I overestimated how difficult it would be to set up the Google Console for authentication, which ended up being really easy. Compared to my last experience learning something new in the directed reading project I did, I didn't get as overwhelmed learning new things and implementing them into my task. If I could change one thing for next time, it would be to slow down the pace. Because everything was really fast-paced, I didn't give much time for myself and to check up on my teammates to see how they are doing mentally with all the work we have to do. So I hope for next time, I check up more on my teammates to ensure they're doing well.  

## 7. Portfolio-Style Reflection (Optional, Short)
