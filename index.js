module.exports = (app) => {

const fs = require('fs');
const functions = require('./template.js')
global.myvar = []
global.editsCount = 0;
global.stepsCount = 0;
  // - probot detects that the user commented on the volunteer - start here issue
      //starter issue needs walkthrough with screenshots
  app.on('issue_comment.created', async context => {
    
    if (context.payload.issue.number === 1 || context.payload.issue.title == "New volunteer? Start here!") {
      var userName = context.payload.comment.user.login;
      var repoName = context.payload.repository.name;
      var repoOwner = context.payload.repository.owner.login;
      app.log({owner: repoOwner, repo: repoName, username: userName})
      return context.github.repos.addCollaborator({owner: repoOwner, repo: repoName, username: userName});
    }
  });
  //- probot detects that there was a fork and CREATES an Issue on the Repo with a list of ToDo items - [ ] and assigns it to the person, with a deadline of 7 days from opening
  app.on('fork', async context => {
    var repoName = context.payload.repository.name;
    var repoOwner = context.payload.repository.owner.login;
    var forker = context.payload.forkee.owner.login;
      var forkeeName = context.payload.forkee.name;
    //app.log(context)
      var date = new Date();
      date.setDate(date.getDate() + 7);
      var titleString = 'Welcome ' + forker + '!';
      context.github.issues.createMilestone({owner: repoOwner, repo: repoName, title: 'Deadline: ' + date, due_on: date}).then((result)=>{
        const params = context.issue({owner: repoOwner, repo: repoName, title: titleString, body: '# Hi ' + forker + '!' + functions.getTemplateMarkdown(forker) +  '- [ ] check', milestone: result.data.number, assignees: [forker]})
        return context.github.issues.create(params)
      });
  });

  //listen on user actions from checklist - comment with a funny message (as a comment to the issue)
global.editsCount = 0;
global.stepsCount = 0;
app.on('issues.edited', async context => {
  
  const title = context.payload.issue.title;
  const creator = context.payload.issue.user.login;
  const editor = context.payload.sender.login;
  const forker = context.payload.issue.assignees[0].login;
  let titleString = 'Welcome ' + forker + '!';
          //app.log(editor)
          //app.log(forker)
          //app.log(global.myvar)
if (title == titleString && creator == "volunteer-onboarding[bot]" && editor == forker){
    global.editsCount = global.editsCount + 1;
    app.log('something happened', global.editsCount)
    app.log('editcount', global.editsCount)
    app.log('stepsdone', global.stepsCount)
    const repoName = context.payload.repository.name;
    const repoOwner = context.payload.repository.owner.login;
    const assignee = forker;
    const repoFullName = context.payload.repository.full_name;
    const id = process.env.APP_ID;
    const secret = process.env.WEBHOOK_SECRET;
      const rp = require('request-promise');
      const options = {
          uri: 'http://api.github.com/search/issues?q=assignee:'+assignee+'+repo:'+repoFullName+'+state:open&sort=created&order=asc?client_id=' + id + '&client_secret=' + secret,
          headers: {
              'User-Agent': 'volunteer-onboarding'
          },
          json: true // Automatically parses the JSON string in the response
      };

      //the search API goes over the limit quickly - unlikely to go over but consider 
    //catch the API limit error and throw a comment "take your time!"
      rp(options)
          .then(function (info, err) {
           let issueNumber =  info.items[0].number;

            if (global.myvar.length < 10) {
              global.myvar.push(issueNumber);
            }
      
          
            app.log('my global variable changes', global.myvar)
           //console.log(issueNumber)
          app.log("task done");
      if (global.stepsCount === 0 && global.editsCount === 7) {
          global.editsCount = 0;
          global.stepsCount = global.stepsCount +1;
          return context.github.issues.createComment({owner: repoOwner, repo: repoName, number: issueNumber, body: 'Well done ' + editor + '! Here\'s a cookie :cookie:'});
      }
      if (global.stepsCount === 1 && global.editsCount === 1) {
          global.editsCount = 0;
          global.stepsCount = global.stepsCount + 1;
          return context.github.issues.createComment({owner: repoOwner, repo: repoName, number: issueNumber, body: 'Good job ' + editor + '! Almost there! Keep going! :muscle:'});
      }
      if (global.stepsCount === 2 && global.editsCount === 4) {

          return context.github.issues.createComment({owner: repoOwner, repo: repoName, number: issueNumber, body: 'Wow! :fire: That was amazing ' + editor + '! Now take a rest and start hunting for issues! Don\'t forget you can post your questions in the Discord channel. You can go ahead and close this issue now (click the "Close issue" button at the bottom of this page). We are looking forward to working with you! :heart:'}),
          context.github.issues.edit({owner: repoOwner, repo: repoName, number: issueNumber, state: "closed"});
      }
      return global.myvar;
          })
          .catch(function (err, info) {
       // app.log("This is my global var in catch with issue number ", global.myvar[0])
        let issueNumber = global.myvar[0];
          global.stepsCount;
          global.editsCount;
          return context.github.issues.createComment({owner: repoOwner, repo: repoName, number: issueNumber, body: 'Whoa, slow down  ' + editor + '! :scream_cat: Are you sure you\'re taking the time to read everything carefully? There\'s no rush! These are foundational readings that will help you become a superstar volunteer! :star:'}); 
          

        app.log('API call failed...')
          });
}
});
  
}
