# Team Hackathon Post Template

## Team Information

* **Team name:**
* **Team members:**
* **Tools / language(s) used:**

## 1. What We Set Out to Build

## 2. Input → Process → Output

## 3. Team System

## 4. AI Use (If Any)

## 5. Evidence of Work
- [Video of our app in action](https://youtu.be/UfqZ6Q7_L4s)
- [The actual live app](https://my-schedule-sync.netlify.app/)
- [You're already here, but you can see the code in our repository](https://github.com/NIPS-COMP2633/NIPS2633)

## 6. Team Reflection — Multiple Perspectives

### Sarah Fazal
&emsp; Overall, I found the project to be a positive and challenging experience. What went well was our ability to adapt quickly. Specifically, when switching from Ruby on Rails to JavaScript, and on multiple other instances, the change was quick and efficient with the help of AI when needed. Additionally, I found that our communication most of the time was clear and effective, which is essential in group settings. At times, there were aspects that were miscommunicated. For example, we had two of the same file implemented differently; however, we worked it out and solved our issues effectively. We were able to solve problems and work together in a meaningful way. We also tried doing daily stand-ups, which I found great, as knowing where each person is sitting at tasks, and it being a way to ask for help was great.
&emsp; At times, I found some instructions for tasks unclear; however, after communicating with group members, it became clear what a task was. Additionally, some tasks took a large amount of time, which I was not expecting. Time was also a factor, as balancing other classes was difficult at times. Additionally, at times, there were unclear or shifting requirements, which I found overstimulating and confusing.
&emsp; Overall, this experience was extremely valuable as it reinforced the great importance of communication and working as a team. Furthermore, having group members who know how to use so many different tools and guide you on how to use them effectively was great. For next time, I would start off by having a longer initial meeting to set out who does what tasks and when each task should be completed to stay on track. Additionally, having checkpoints and more in-person meetings if possible, would be great to ask questions and understand all aspects.

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

&emsp; Perhaps the one thing we over-estimated was the amount of time that we would have to work on this project outside of classes (and other school time-sinks). Some things that we had wanted to make standerd, daily, practice fell through due to busy schedules and different availabilities. Overall, I think we knew that this project would be a little bit of a tight fit in the 1 week time period, but in the end we accomplished everything we wanted to (*plus the outline import feature, bonus!*).

&emsp; I had fun, and I feel that I learned a lot. The 1 week hackathon was a good stress-test for collaboration, giving us a tight deadline and endless freedom. It was a great way to illustrate the value of following agreed-upon practices and following SDLC's.  
&emsp; I always enjoy projects like these: I love seeing the raw talent of my classmates when we collaborate on projects with tight deadlines and lofty goals. *NIPS for the win!*

&emsp; Refer to ""What didn't go well" above.  
&emsp; In addition however: I think, if I were to do it again- I would attempt to adapt our protocols and agreed-upon practices to something that would fit better with an environment where we need to make quick decisions and rapid changes, and something that attempted to maximize communication effectiveness with the least amount of overhead/ time investment per day. I think these changes would better fit the 1 week hackathon deadline, and perhaps be easier to adhere to with classes and other assesments in consideration.

## 7. Portfolio-Style Reflection (Optional, Short)
