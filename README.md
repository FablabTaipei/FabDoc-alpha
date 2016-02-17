# FabDoc-alpha
Prototype version of project documentation platform for desktop and mobile.

http://fablabtaipei.github.io/FabDoc-alpha/

Recommended Browser: **Chrome**、**Firefox** (Cross-domain issue in Safari)

## About
FabDoc is under active development.

Based on GitHub pages and Parse backend ([will be closed in one year](http://blog.parse.com/announcements/moving-on/)), we try to build a better platform to let everyone record their project in Git-like workflow. Every makerspaces in the world could also easily deploy their local documentation platform by "fork".

## Deploy (if you want to build your local platform)
* Fork
* Build [GitHub pages](https://pages.github.com)
* Log in [Parse](https://www.parse.com/) (with existing account)
* Create new App on Parse
* Copy, paste your Parse App [token](https://parse.com/apps/quickstart#parse_data/web/existing) to fabdoc.js
* Enable "Verify user emails" in Parse App setting
* Deploy [Cloud Code](https://github.com/FablabTaipei/FabDoc-alpha.cloudcode) of resizing images to Parse App
* Enjoy it

> Parse will be closed in one year so you cannot sign up right now. We are planning to work on Parse open source server and develop a  package(e.g. npm) which can make us deploy our platform more quickly.

> We use Cloud Code to resize every images. This feature would make browser load each step list faster. If you do not know how to deploy, please follow [the official tutorial](https://parse.com/docs/cloudcode/guide#command-line).

## Try
### Sign Up & Log In
Type in your Email and password to sign up or log in (in same page). Before adding new project, you have to verify it with Email first.

### Add New Project
In this version, you can only see default tutorial "How To Use FabDoc" and your own projects. You do not have promission to the project which not belongs to you.

![](http://i.imgur.com/vKlbOsn.jpg)
![](http://i.imgur.com/4F0um7r.jpg)

Of course, sharing and corporating with friends should be a key feature. It has priority in development.

### Upload photo
You could take a photo to each step by your mobile browser and give a short commit to each photo.

When you click on "Upload", you could just leave your phone and go back to work. You should be focus on the project and pick up your phone again when it is an important step.

### Edit steps
After shooting, You could edit "description" and "code link" now on your desktop or laptop. Later, we are going to publish new version with "material" and "tool" for each step, and the summary of these categories will automatically show up on the top of project page. 

![](http://i.imgur.com/HsHT71t.jpg)

Although we cannot share projects to each other now, there is static **embeddable** code in Bootstrap style for each step. You can share the specific step by embedding to your site or blog.

## Development
We are working on "branch" freature that can help you do projects in the way of version control. It might not be like Git which let you easily see the difference in every commits but will be a new "branching and merging" system.

Welcome to [Gitter](https://gitter.im/FablabTaipei/FabDoc-alpha) channel to discuss about the workflow and features.

### To-Do list (sorted by priority)
* Share and edit your project to others or even public
* Branching and merging
* Search projects with tags
* Upload gifs or videos in 3 sec
* Offline editor (maybe develop an app for mobile)
* Editing log
* Optimize uploading and loading speed

## License
The MIT License (MIT)
