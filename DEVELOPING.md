# Development Environment

Follow these instructions to configure your development environment.

I am using Ubuntu 16.04 LTS as my development system. It is easiest to just set up a Virtual Machine with Ubuntu installed so you have total control of your environment. If you want to use a different system, you may have to adjust these instructions to match your environment.

I'm also assuming a familiarity with Ubuntu and Linux in general (things like running `sudo apt-get update` before installing packages).

## Before Cloning Repository

### Packages Required
Install the following Ubuntu packages and all dependencies:

1. `apache2`
2. `mysql-server`
  - ~~Run the `sudo mysql_secure_installation` command to secure the MySQL server a bit~~ This currently breaks the `phpmyadmin` installation; hopefully will be fixed in a future update.
3. `php libapache2-mod-php php-mcrypt php-mysql`
4. `phpmyadmin php-mbstring php-gettext`
  - Make sure you press `spacebar` to select `apache2` when asked which webserver to configure automatically. A red box does not mean it is selected; it must have an asterisk in the box. This part is usually confusing.
5. `git`
6. `composer`
  1. Follow the instructions here to download: https://getcomposer.org/download/
  2. To install globally (recommended), run `sudo mv composer.phar /usr/local/bin/composer`
7. `php-curl`
8. `nodejs npm`
  1. Because Ubuntu uses the `nodejs` executable name instead of `node`, I always alias it to `node` by running `sudo ln -s /usr/bin/nodejs /usr/bin/node`. Otherwise, tools such as Bower will not work properly.

### Node.js Packages
You will also need to install the following Node.js packages using `sudo npm install -g <package>`

1. `bower`
2. `gulp`

### Optional Packages
These are packages I use personally for development. They are not required but recommended:

1. `chromium-browser`
  - This is a Google Chrome clone for testing
2. `atom`
  - Run `sudo add-apt-repository ppa:webupd8team/atom` first to add the repo, then `sudo apt-get update` to download the list before installing.

### Firefox Addons
I also recommend installing these Firefox Addons for testing

1. `firebug`
2. `NoScript`

### Configure git

1. Create an SSH keypair using `ssh-keygen -t rsa`
2. Upload the public key to GitHub
3. Configure git
  1. `git config --global user.name "John Doe"`
  2. `git config --global user.email johndoe@example.com`
  3. `git config --global core.editor nano`

## Clone Repository

1. From the home directory, run `git clone git@github.com:russfeld/flowchart.git`

## After Cloning Repository

1. Go into the `~/flowchart` directory and run the following commands
  1. `composer install`
  2. `bower install`
  3. `npm install`
    1. `node-sass` apparently needs rebuilt after install. Run `npm rebuild node-sass` to do this.
  4. `gulp`
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


**Good References**
- https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-16-04
- https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-phpmyadmin-on-ubuntu-16-04
- http://www.webupd8.org/2014/05/install-atom-text-editor-in-ubuntu-via-ppa.html
- https://help.ubuntu.com/community/SSH/OpenSSH/Keys
- https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
