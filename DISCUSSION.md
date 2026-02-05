# Team Hackathon Post Template

## Team Information

* **Team name:**
* **Team members:**
* **Tools / language(s) used:**

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

## 6. Team Reflection — Multiple Perspectives

## 7. Portfolio-Style Reflection (Optional, Short)
