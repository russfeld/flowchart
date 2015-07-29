# flowchart
Advising and Flowchart System for K-State Engineering

Deploy URL: http://45.55.69.44/
Domain Name: http://flowchart.russfeld.me/
Domain registered at https://www.namecheap.com

JSFiddle: http://jsfiddle.net/1u9u1nh8/4/

# Worklog

#### 2015-07-28
Switching to Laravel to deploy with Envoy.

#### 2015-07-20
Added more code for force-directed line drawing. Need to add forces for vertical channels

#### 2015-07-16
Initial code added for drawing lines

#### 2015-07-08
Refactored Javascript code to be MUCH cleanr, very few bug fixes

#### 2015-07-06
Worked on flowchart UI using Snap.svg http://snapsvg.io/
Deployed at http://flowchart.russfeld.me/flowchart_test.html

#### 2015-06-30
Worked on the Meteor todo app tutorial https://www.meteor.com/tutorials/blaze/creating-an-app

# Useful Laravel Commands

## Installing Composer Globally
https://getcomposer.org/doc/00-intro.md#globally
1. `curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer`

## Installing Laravel
http://laravel.com/docs/5.1#installation
1. `composer global require "laravel/installer=~1.1"`
2. Add to ~/.bashrc: "export PATH=$PATH:~/.composer/vendor/bin"
3. Don't forget to move .htaccess to default Apache config for speed

## Deploying with Envoy
https://serversforhackers.com/video/deploying-with-envoy-cast
https://serversforhackers.com/video/enhancing-envoy-deployment

# Useful Meteor Commands

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

# Helpful Reference URLs
1. http://jsfiddle.net/38ne4/6/ JSFiddle for Drag/Drop handlers with Snap.svg