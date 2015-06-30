# flowchart
Advising and Flowchart System for K-State Engineering

Deploy URL: http://45.55.69.44/
Domain Name: http://flowchart.russfeld.me/
Domain registered at https://www.namecheap.com

# Worklog

#### 2015-06-30
Worked on the Meteor todo app tutorial https://www.meteor.com/tutorials/blaze/creating-an-app

# Record of Useful Commands

## Installing Meteor
1. `curl https://install.meteor.com/ | sh`
2. `meteor create ~/flowchart`

## Editing Mongo Database
1. `meteor mongo`
2. `db.tasks.insert({ text: "Hello World!", createdAt: new Date() });`

## Adding User Accounts
1. `meteor add accounts-ui accounts-password`

## Security
1. `meteor remove insecure` Cannot edit database directly from Client
2. `meteor remove autopublish` Cannot access all data from Client

## Deployment
http://meteortips.com/deployment-tutorial/digitalocean-part-1/
1. `sudo npm install -g mup`
2. Configure the mup.json file
3. `mup setup`
4. **`mup deploy`**

## Monitoring
https://kadira.io
1. `meteor add meteorhacks:kadira`
2. Add appID and appSecret to settings.json
3. Deploy as usual