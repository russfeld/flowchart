var elixir = require('laravel-elixir');
var gulp = require('gulp');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.sass('app.scss');

    //Global CSS styles definition

    mix.styles([
        '../bower/fullcalendar/dist/fullcalendar.css',
        "../bower/russfeld-eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css"
    ], 'public/css/calendar.css');

    //Require.js configuration & library

    mix.scripts([
        'require-config.js'
    ], 'public/js/require-config.js');

    mix.scripts([
        '../bower/requirejs/require.js'
    ], 'public/js/lib/require.js');

    //Libraries

    mix.scripts([
        '../bower/jquery/dist/jquery.js',
    ], 'public/js/lib/jquery.js');

    mix.scripts([
        '../bower/moment/moment.js',
    ], 'public/js/lib/moment.js');

    mix.scripts([
        '../bower/bootstrap-sass/assets/javascripts/bootstrap.js',
    ], 'public/js/lib/bootstrap.js');

        mix.scripts([
        '../bower/devbridge-autocomplete/dist/jquery.autocomplete.js'
    ], 'public/js/lib/jquery.autocomplete.js');

    mix.scripts([
        '../bower/fullcalendar/dist/fullcalendar.js',
    ], 'public/js/lib/fullcalendar.js');

    mix.scripts([
        '../bower/russfeld-eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
    ], 'public/js/lib/bootstrap-datetimepicker.js');

    mix.scripts([
        '../bower/pusher/dist/pusher.js',
    ], 'public/js/lib/pusher.js');

    mix.scripts([
        '../bower/ionsound/js/ion.sound.js'
    ], 'public/js/lib/ionsound.js');

    mix.scripts([
        '../bower/react/react-with-addons.js'
    ], 'public/js/lib/react.js')

    mix.scripts([
        '../bower/react/react-dom.js',
    ], 'public/js/lib/react-dom.js');

    //Utilities

    mix.scripts([
        'util/site.js',
    ], 'public/js/util/site.js');

    mix.scripts([
        'util/calendar.js',
    ], 'public/js/util/calendar.js');

    //Pages

    mix.scripts([
        'pages/advisor-calendar.js',
    ], 'public/js/advisor-calendar.js');

    mix.scripts([
        'pages/student-calendar.js',
    ], 'public/js/student-calendar.js');

    mix.scripts([
        'pages/profiles.js',
    ], 'public/js/profiles.js');
/*
    mix.babel([
        'pages/groupsession.js',
    ], 'public/js/groupsession.js');
*/
    //Test Flowchart

    mix.scripts([
    	'../bower/snap.svg/dist/snap.svg.js',
        'flowchart.js'
    ], 'public/js/flowchart.js');

    mix.task('copyfonts');
});

//From http://ilikekillnerds.com/2014/07/copying-files-from-one-folder-to-another-in-gulp-js/
gulp.task('copyfonts', function() {
   gulp.src('resources/assets/bower/fontawesome/fonts/**/*.{ttf,woff,eot,svg,woff2}')
   .pipe(gulp.dest('public/fonts'));
   gulp.src('resources/assets/bower/bootstrap-sass/assets/fonts/bootstrap/**/*.{ttf,woff,eot,svg,woff2}')
   .pipe(gulp.dest('public/fonts'));
   gulp.src('resources/assets/bower/ionsound/sounds/**/*.{aac,mp3,ogg}')
   .pipe(gulp.dest('public/sounds'));
});
