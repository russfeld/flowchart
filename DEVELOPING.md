# BIG A$$ WARNING!

NPM has a bug! Whenever you install a new package, it will remove old packages that it thinks it did not install. So far this only affects the custom bootstrap datepicker used in this project. So, if it doesn't work, after updating/adding NPM packages, you'll need to do:

npm install https://github.com/russfeld/bootstrap-datetimepicker.git --save-dev

Stupid, right?
See https://github.com/npm/npm/issues/17379

# Development Environment

Follow these instructions to configure your development environment.

I am using Ubuntu 16.04 LTS as my development system. It is easiest to just set up a Virtual Machine with Ubuntu installed so you have total control of your environment. If you want to use a different system, you may have to adjust these instructions to match your environment.

I'm also assuming a familiarity with Ubuntu and Linux in general (things like running `sudo apt-get update` before installing packages).

## Before Cloning Repository

### Packages Required
Install the following Ubuntu packages and all dependencies:

1. `apache2`
2. `mysql-server`
3. `php libapache2-mod-php php-mcrypt php-mysql`
4. `phpmyadmin php-mbstring php-gettext`
  - Make sure you press `spacebar` to select `apache2` when asked which webserver to configure automatically. A red box does not mean it is selected; it must have an asterisk in the box. This part is usually confusing.
5. `git`
6. `composer`
  1. Follow the instructions here to download: https://getcomposer.org/download/
  2. To install globally (recommended), run `sudo mv composer.phar /usr/local/bin/composer`
7. `php-curl php-zip`
8. `nodejs npm`
  1. Make sure you get the latest versions. The Ubuntu repositories tend to be woefully out of date. I used this guide: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04
  2. Because Ubuntu uses the `nodejs` executable name instead of `node`, I always alias it to `node` by running `sudo ln -s /usr/bin/nodejs /usr/bin/node`.

### Optional Packages
These are packages I use personally for development. They are not required but recommended:

1. `chromium-browser`
  - This is a Google Chrome clone for testing
2. `atom`
  - Run `sudo add-apt-repository ppa:webupd8team/atom` first to add the repo, then `sudo apt-get update` to download the list before installing.

### Firefox Addons
I also recommend installing these Firefox Addons for testing

1. `NoScript`

### Configure git

1. Create an SSH keypair using `ssh-keygen -t rsa`
2. Upload the public key to GitHub
3. Configure git
  1. `git config --global user.name "John Doe"`
  2. `git config --global user.email johndoe@example.com`
  3. `git config --global core.editor nano`
  4. `git config --global push.default simple`

## Clone Repository

1. From the home directory, run `git clone git@github.com:russfeld/flowchart.git`

## After Cloning Repository

1. Go into the `~/flowchart` directory and run the following commands
  1. `composer install`
  2. ~~`bower install`~~
  3. `npm install`
  4. `npm run dev`
    - This should recompile all CSS, JS, and asset files into the public folder. If this doesn't work, there are probably errors that must be addressed.

### App & Database Setup
This will walk you through setting up the required database for the Flowchart system

1. Using the MySQL tools of your choice, create a database and user account for the Flowchart system
2. Copy `.env.example` to `.env`
3. Modify the settings in `.env` as needed
  1. Database settings
  2. Email settings
  3. Force Authentication (DO NOT ENABLE ON PRODUCTION!)
  4. CAS Authentication settings
  5. PUSHER API Keys - http://pusher.com
4. Run `php artisan key:generate` to generate a new random APP_KEY
5. Run `php artisan migrate` to migrate database tables
  1. To include seed data, use `php artisan migrate --seed`

### Apache Virtual Host Configuration
1. Copy `flowchart.conf.example` to `/etc/apache2/sites-available/flowchart.conf`
2. Enable the site by doing `sudo a2ensite flowchart`
3. Add `127.0.0.1  flowchart.local` to `/etc/hosts`
4. Change the group of the folders in `storage` to `www-data`
5. Enable the `rewrite` apache module: `sudo a2enmod rewrite`
6. Restart the computer for things to work properly

### Deployment Configuration
1. Install Envoy globally using `composer global require "laravel/envoy=~1.0"`
2. Add `export PATH=$PATH:~/.composer/vendor/bin` to `~/.bashrc` so that envoy can be found by the system
3. Configure SSH keys on any systems that will be used for deployment. Generally it just needs the development system's public key added as an authorized key.
4. See `Envoy.blade.php` in the root directory of the web application for available tasks

### Setting Up Deployment Server
1. Install packages listed above
2. Configure git as above
3. Create a database user and database
4. Create directory structure
  1. /var/www/flowchart_releases
  2. /var/www/flowchart_data
    1. /var/www/flowchart_data/.env <-- Copy from repo sample or existing file
    2. /var/www/flowchart_data/app <-- Set owner to www-data:www-data
    3. /var/www/flowchart_data/logs <-- Set owner to www-data:www-data
5. Put server SSH key on github
6. Pull from git at least once to accept the key
7. Check settings in Envoy.blade.php
8. Deploy and test

## Unit Testing
Some very minor unit tests are available. To run the, execute `./vendor/bin/phpunit` in the main directory. Currently Laravel 5.1 only supports an older version of phpunit, so using the one in the vendor folder is best

## References

**General Development Environment**
- https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-16-04
- https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-phpmyadmin-on-ubuntu-16-04
- http://www.webupd8.org/2014/05/install-atom-text-editor-in-ubuntu-via-ppa.html
- https://help.ubuntu.com/community/SSH/OpenSSH/Keys
- https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup

**Deploying with Envoy**
- https://serversforhackers.com/video/deploying-with-envoy-cast
- https://serversforhackers.com/video/enhancing-envoy-deployment

**Gulp, Bower & Elixir**
- http://laravel.com/docs/5.1/elixir
- http://laravelcoding.com/blog/laravel-5-beauty-using-bower
- https://mattstauffer.co/blog/convert-laravel-5-frontend-scaffold-to-bower

**Blade Templates**
- https://scotch.io/tutorials/simple-laravel-layouts-using-blade
