# flowchart
Advising and Flowchart System for K-State Engineering

Deploy URL: http://45.55.69.44/
Domain Name: http://flowchart.russfeld.me/
Domain registered at https://www.namecheap.com

JSFiddle: http://jsfiddle.net/1u9u1nh8/4/

See DEVELOPING.md for instructions on configuring the development environment

# Worklog

#### 2015-07-29
Installed Elixir, Gulp and Bower
Installed Bootstrap, FontAwesome, JQuery, and SnapSVG through Bower
Moved all CSS and JS to resources folder for compilation/minification

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

## Gulp, Bower & Elixir
http://laravel.com/docs/5.1/elixir
http://laravelcoding.com/blog/laravel-5-beauty-using-bower
https://mattstauffer.co/blog/convert-laravel-5-frontend-scaffold-to-bower
1. `sudo npm install --global gulp`
2. `sudo npm install`
3. `sudo npm install -g bower`
4. `bower init`
5. `bower install jquery bootstrap fontawesome --save`
6. `gulp` to compile it all, `gulp --production` for minification
7. `gulp watch` to watch all files for changes and auto-compile

## Blade Templates
https://scotch.io/tutorials/simple-laravel-layouts-using-blade
