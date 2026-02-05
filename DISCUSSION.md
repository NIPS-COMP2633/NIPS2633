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

1. The information of the username and password is used to navigate through the redirect process starting at sb.mymru.ca, the link to My Schedule Builder, for the full process, see `app.post('/api/get_calendar'` of [backend-proxy.js](uni-cal/src/server-side-scripts/backend-proxy.js). It's fairly involved, because it's _lightly_ approximating the user workflow to navigate to their calendar. My Schedule Builder is not setup for developers to hit the endpoints, at least to the best of our knowledge. After using the username and password to POST for auth, it gets the current schedule for the winter 2026 semester, which is currently hardcoded.
2. Then, the information for the calendar is brought back in memory in an XML format, as that's what the API responds with. It then goes through the [xml_to_json.js](uni-cal/src/server-side-scripts/xml_to_json.js) script, which converts it into JSON, compatible with what the Google Calendar API expects.
3. The user is navigated to the next page, and the information for the courses is displayed, along with a prompt to add [bookmarkletGenerator.js](uni-cal/src/outline-calander/utils/bookmarkletGenerator.js) to their bookmarks bar. The instructions are given to go to their course outline, and click the bookmarklet. This will extract the raw information from their outline PDF, and instruct the user to return to their calendar preview. At this point [dataProcessor.js](uni-cal/src/outline-calander/utils/dataProcessor.js) will process the raw information into a manageable text. After which [openrouter.js](uni-cal/src/server-side-scripts/openrouter.js) will be hit, and the information will be given to the `openai/gpt-oss-safeguard-20b` model, which will attempt to extract the information of due dates, in an Google Calendar friendly format.
4. Once the information is received, it is appended to the My Schedule Builder calendar JSON.

### Output

1. The JSON is now sent via [outline_google_upoad.js](uni-cal/src/client-side-scripts/outline_google_upoad.js) in conjunction with [calendar_auth_client.js](uni-cal/src/client-side-scripts/calendar_auth.js) to the Google Calendar API.
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

### How we established cross-machine consistency

&emsp; Our team aggreed to use WSL and MacOS to keep our whole team in a consistent unix environment. We also kept our package.json file up to date with dependencies to ensure that everyone could setup quickly and easily. These decisions were vital for making it fast and easy to deply when we got to that step.

## 4. AI Use (If Any)

### Naveed Elias

&emsp; At the start of the projects I work on, I use AI to help check my high-level implementation of my task. Because I have no real experience working with authentication and HTTP requests, I wanted to make sure I had the right idea for how to implement it. I make sure to add, "without code" because it will begin to write code for my task.  
&emsp;Example prompt: Without using any code, I am creating [insert task], here is my current high level implementation of the [insert task]. Am I getting the right idea of the steps to implement [insert task]?. Point out any missing steps.  
When it came to using the gapi library for my task, the documentation lacked actual syntax for using gapi and only had an HTTP request, which I had to use the fetch function to use. I wanted to use the actual library because I am more familiar with using libraries. So I used AI to teach me the syntax and how to use functions like insert for events and calendar. This part still required human judgement, as it was still my job to use the syntax to implement scripts for my task.  
&emsp;Example prompt: What is the syntax for [for example, Event: insert], and how do I use it?  
I used AI to debug errors in my code, but before that I would spend time trying to figure out how to debug the error myself. If I could not figure it out after a decent amount of time, I would use AI to give me some hints for what could be wrong and create logs to see what was happening with my functions.  
&emsp;Example prompt: [Inset error message or image]

### Sarah Fazal

&emsp; AI was a great asset throughout this group project. I used AI tools, including ChatGPT, Claude, and Microsoft Copilot, to support my work, specifically the XML to JSON conversion process. AI was used to understand the structure of the MRU Schedule Builder XML. I prompted ChatGPT by saying, "How can I parse through XML structure in Ruby on Rails and convert it to JSON?" In doing so, ChatGPT gave me a full outline of every task that needed to be completed. This was great, as having initial instructions on exactly what to do was needed. Specifically, this was my first time working with Ruby on Rails, so having a clear outline was essential.  
&emsp; Additionally, I asked ChatGPT and Copilot to provide a comprehensive guide on how to use Ruby on Rails effectively, starting with the setup process. I specifically prompted "Create a step-by-step guide on how to get set up with Ruby on Rails and give me a guideline on how to convert XML to JSON." This allowed me to learn a whole new framework, which could be an asset in the future.
&emsp; Another use of AI was in converting Ruby on Rails straight into JavaScript. At the start of this hackathon, our team decided to use Ruby on Rails for this project. However, as development progressed, we realized that switching to JavaScript would be more effective as it is more widely understood and it aligned better with the rest of the tools and technologies we used.  
&emsp; Overall, AI can only do so much, and it tends to make mistakes, so working alongside it was great, and the work being done was completed efficiently. Moreover, human judgment is essential to correct and refine AI-generated suggestions. Human judgment was required at all critical points in this hackathon, including validating JavaScript output that matched the Ruby logic, testing outputs against data, and adjusting AI-generated code to fit constraints and styles. Therefore, AI can only be used to a certain extent; however, it is an asset that can enhance workflow and overall success as a whole.  

### Robert Parker Hutcheson

&emsp; My AI was borderline excessive. And the way I see it, given acceptable circustances of its use, that's effectively the necessary methodology of productive work in the current landscape. It is often a productivity boost, those who _don't_ use it will get left behind, similar to not learning how to properly leverage your IDE. I used primarily Claude, but this time I experimented with using GitHub CoPilot.  
&emsp; Claude was the "first" widely used code-based LLM, and it remains a solid option, but from my experience, Claude is a BIC lighter, and CoPilot is a blow torch. The productivity gains from CoPilot are incredible. Namely, Claude has the option to upload files, so that it gains some context on the problem, but it's a manual back and forth process of uploading files, changing files, and doing it all over again. CoPilot automatically has access to your repository, and as a result eliminates the limited scope that Claude operates in. Furthermore, Claude will edit your file in excess, you'll ask it to change one thing and be met with a wall of console logs and emojis, without an explicit outline of what it did. CoPilot will operate in a pull-request / diff manor wherein the changes it makes are highlighted to be reviewed. CoPilot tends to operate in conjunction with your work, whereas Claude tends to want to take control of your work with somewhat blind trust. For example, I asked it to show me an edit to this file, which you can see in yellow:  
![copilot-in-action](/assets/copilot_diff.png)
&emsp; The best use-cases for me were in conditions that required little judgement, and debugging. The first example of a condition that required little judgement was filterXMLByCourses in [backend-proxy.js](uni-cal/src/server-side-scripts/backend-proxy.js). I had written a series of REST requests that returned XML of calendar data. So I told it to filter the resulting XML based on the course values, as the returned XML included every section, not just the ones that the student is enrolled in. This is a fairly mindless job. Take a list of classes, and remove the classes that don't match the classes the student is enroled in. Both arrays were already present, just code the thing. It's not hard, it's hard to mess up, and it's a waste of human-time to implement manually. Wham. Bam. Go next.  
&emsp; The next use is debugging and solutioning where otherwise there would be a large amount of time spent reading up on ideas. For example, there was two parts of the parameter that I did not understand, called "t" and "e" when getting class data, they can be seen in [backend-proxy.js](uni-cal/src/server-side-scripts/backend-proxy.js). They are parameters used to reduce the amount of bots. When they are incorrect, the endpoint will deny a request. The bot helped me by telling me about the initiator area, allowing me to look into the javascript and figure out what needed to be done with these parameters. Just for fun, `t` was set by `(unix time / 60000) % 1000` and `e` was a checksum of `t`, set to `(t % 3) + (t % 39) + (t % 42)`. No way I would have figured that out on my own. Here's the initiator in question, cool stuff:  
![initiator-of-javascript](/assets/initiator.png)
&emsp; Human judgement has and will continue to be necessary for the big picture. I wish I had time to find some examples, but there are many occassions where the bots will go off and do some ridiculous approaches to a problem. You will request that it helps you get calendar data, and it will respond with wanting to write a Python script that uses a frontend testing framework to scrape data, instead of hitting API endpoints. Now, I think that's because it's the current landscape of AI, but probably not one that will change significantly. The bots struggle with the context of the problem. It doesn't know what you don't tell it, and most of us are not good at communicating precisely what we want. However, it's worth mentioning that I have been doing some homework on "prompt engineering" and effectively, the biggest takeaway that I have, is that the better you describe the problem, the better the output of the bot. However, there's obviously a tradeoff, if you spend the entire time describing the problem, you may as well do the work yourself at a certain point. There's no free lunch.

### Isaac Klein

&emsp; I used AI to implement specific tasks. I would provide a detailed description of what I wanted (example, which function I wanted it to call, with which parameters) and reviewed the outputs by going through the CoPilot diffs for each change. I generally used AI when I knew what I wanted, and knew what proper output should look like, so that I could error correct the output when necessary.  
&emsp; Example Prompt:  

```
Right now, In #file:outline_cal.js when the
"Export course to google calendar button"
is clicked, it calls mockUploadToGoogleCalendar() in
#file:outline_google_upoad.js.

Change the function name to "exportAllEvents", and
implement the function following logic.

It should appropriately call the method in
#file:calendar_auth.js and
file:export_events.js to export the json events to
google calendar using the functions in both files.
```

## 5. Evidence of Work
- [Video of our app in action](https://youtu.be/UfqZ6Q7_L4s)
- [The actual live app](https://my-schedule-sync.netlify.app/)
- [You're already here, but you can see the code in our repository](https://github.com/NIPS-COMP2633/NIPS2633)

## 6. Team Reflection — Multiple Perspectives

### Naveed Elias

&emsp; I believe our project went well and ran pretty smoothly despite having a week. I was able to understand the role my scripts play in the workflow of our web application, and my scripts worked as expected, tested and approved by my teammates. I gained a better understanding of creating and running scripts within a web application and was able to successfully implement authentication from the user to use their Google Calendar. Despite the function randomly working within the web application at the moment, I encountered an issue with my addNewCalendar script. The intended behavior was to create a new calendar and return the calendarId, which it does, but when I try to add events to it, I get an HTTP 400 error. Because of the time constraints, I made the decision to add events to the primary calendar instead of the new one. I overestimated how difficult it would be to set up the Google Console for authentication, which ended up being really easy. Compared to my last experience learning something new in the directed reading project I did, I didn't get as overwhelmed learning new things and implementing them into my task. If I could change one thing for next time, it would be to slow down the pace. Because everything was really fast-paced, I didn't give much time for myself and to check up on my teammates to see how they are doing mentally with all the work we have to do. So I hope for next time, I check up more on my teammates to ensure they're doing well.

### Sarah Fazal

&emsp; Overall, I found the project to be a positive and challenging experience. What went well was our ability to adapt quickly. Specifically, when switching from Ruby on Rails to JavaScript, and on multiple other instances, the change was quick and efficient with the help of AI when needed. Additionally, I found that our communication most of the time was clear and effective, which is essential in group settings. At times, there were aspects that were miscommunicated. For example, we had two of the same file implemented differently; however, we worked it out and solved our issues effectively. We were able to solve problems and work together in a meaningful way. We also tried doing daily stand-ups, which I found great, as knowing where each person is sitting at tasks, and it being a way to ask for help was great.
&emsp; At times, I found some instructions for tasks unclear; however, after communicating with group members, it became clear what a task was. Additionally, some tasks took a large amount of time, which I was not expecting. Time was also a factor, as balancing other classes was difficult at times. Additionally, at times, there were unclear or shifting requirements, which I found overstimulating and confusing.
&emsp; Overall, this experience was extremely valuable as it reinforced the great importance of communication and working as a team. Furthermore, having group members who know how to use so many different tools and guide you on how to use them effectively was great. For next time, I would start off by having a longer initial meeting to set out who does what tasks and when each task should be completed to stay on track. Additionally, having checkpoints and more in-person meetings if possible, would be great to ask questions and understand all aspects.

### Robert Parker Hutcheson

&emsp; The speed at which we moved was awesome, there's pros and cons to everything, but in terms of our team, we really got the job done. We set our goal. We achieved it. We succeeded past it.  
&emsp; The competence of our team was awesome, we didn't need to mess around with tutorials.  
&emsp; The scope we chose was appropriate for the time we had. We nailed exactly what was wanted with little time to spare and little additional time.  
&emsp; We had mostly successful distribution of responsibilities, there was a bit of friction when it came to division of responsibilities, but that boils down to a more hierarchical approach to things. In particular it felt like we did not give Sarah enough space to stretch her legs, and I think that boils down to familiarity. I've worked alongside or with Naveed and Isaac for at least a year, and as a result, I think we fell short a bit in terms of getting her as involved as she could have been. That said, our schedules were awful, there was basically no time to meet up except for ~6:00 PM and onwords. If we want to talk about mental health, having a meeting when you should be eating dinner is an excellent way to disrupt mental health.  
&emsp; We had a stack shift from Rails to Node, and it worked really well. We evaluated pros and cons, made the decision, and made it happen.  
&emsp; I did a particularly bad job at communicating, on multiple occasions, I had team mates come back to me with "I don't know what you're talking about." That by itself does not stress me out, I can be a good writer, I just need to dedicate the time to it. Really big call out that I need to take more time to think through my written communication.  
&emsp; Hierarchy in general is a difficult one with group projects, we're peers, but without what I refer to as "organizational clout," it can be really tricky to implement standards. For example, early on, we were supposed to do daily standups in our Discord channel. We more or less did not. Without some sort of hierarchy, it's difficult to maintain certain standards, because who am I to try and enforce a standard on my peers? On one hand, it's good communication, on the other hand there's a very fine line between that and arrogance.  
&emsp; Ultimately, this was an incredible experience, we weren't constrained by the limits of a "mad-lib fill in the functions" coding assignment, we were told to run with an idea, and it was so refreshing to have that freedom to just run. I'm really proud of our team and where we ended up, the idea was awesome, the execution was even better, and I'm so grateful that we got this opportunity.

### Isaac Klein

&emsp; Our team committed to using git with a standard branch structure, Required reviews for PR's, and GitHub issues- which helped us stay organized and allowed for easy collaboration.  
&emsp; The issues- with people self-assigning what they were working on- helped us stay on track and ensured that everyone knew more or less what was going on.  
&emsp; We had pretty good communication, and we had a very talented team.  
&emsp; Although this section is short, I think the vast majority of our project went very smoothly, and we collaborated very well as a team.

&emsp; On the last day of the hackathon (~16 hrs before deadline), I had the task of integrating different components of our project and getting everything running in an online deployment. This required me to:  
&emsp; 1. Have administrative access to the repository to connect it to our deployment service.  
&emsp; 2. Remove branch protection from the `production` branch and push a new version up based on `development` (our original template had an issue that needed to be resolved).  
&emsp; I pushed the initial deployment branch to remote. Driven by the time crunch, and without taking a moment to consider the best-pactice solution- I began to iteratively develop on and push to changes directly to `production`, testing changes on the website in order to avoid the time-cost of setting up the CLI tools required to test it locally and awaiting PR approvals for each commit- because I knew I would be attempting many commits. I wa aware that this was bad practice, but in the heat of the moment, the deadline coming closer, and my thought that "this is just a hackathon", I continued onward. By the end, I had a functioning deployment, and things were more-or-less working, but my changes to `production` meant that we needed to merge back into `development` from `production`. This break in protocol caused confusion and disorganization for the rest of the team (who were working in `development` at the time), and corrupted the otherwise clean git history we had been maintaining.  
&emsp; It was only after I had finished everything when I ralized that there was a better, obvious, alternative to my approach: I should have linked the deployment to a new test branch of my own, and iteratively changed that branch- merging into development and later deployment when I was happy with how things were working.  
&emsp; Moral of my story- protocols are there for a reason: you should be very certain that there isn't a better, alternative, approach before going off and doing things your own way. Think before you `git push origin deployment`.

&emsp; Perhaps the one thing we over-estimated was the amount of time that we would have to work on this project outside of classes (and other school time-sinks). Some things that we had wanted to make standerd, daily, practice fell through due to busy schedules and different availabilities. Overall, I think we knew that this project would be a little bit of a tight fit in the 1 week time period, but in the end we accomplished everything we wanted to (_plus the outline import feature, bonus!_).

&emsp; I had fun, and I feel that I learned a lot. The 1 week hackathon was a good stress-test for collaboration, giving us a tight deadline and endless freedom. It was a great way to illustrate the value of following agreed-upon practices and following SDLC's.  
&emsp; I always enjoy projects like these: I love seeing the raw talent of my classmates when we collaborate on projects with tight deadlines and lofty goals. _NIPS for the win!_

&emsp; Refer to ""What didn't go well" above.  
&emsp; In addition however: I think, if I were to do it again- I would attempt to adapt our protocols and agreed-upon practices to something that would fit better with an environment where we need to make quick decisions and rapid changes, and something that attempted to maximize communication effectiveness with the least amount of overhead/ time investment per day. I think these changes would better fit the 1 week hackathon deadline, and perhaps be easier to adhere to with classes and other assesments in consideration.
