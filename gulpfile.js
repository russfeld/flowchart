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

    mix.styles([
        '../bower/fullcalendar/dist/fullcalendar.css',
        "../bower/russfeld-eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css"
    ], 'public/css/calendar.css');

    mix.scripts([
    	'../bower/jquery/dist/jquery.js',
    	'../bower/bootstrap-sass/assets/javascripts/bootstrap.js',
        '../bower/devbridge-autocomplete/dist/jquery.autocomplete.js'
    ],'public/js/vendor.js');

    mix.scripts([
        '../bower/moment/moment.js',
        '../bower/fullcalendar/dist/fullcalendar.js',
        '../bower/russfeld-eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js'
    ], 'public/js/calendar.js');

    mix.scripts([
    	'../bower/snap.svg/dist/snap.svg.js',
        'flowchart.js'
    ], 'public/js/flowchart.js');

    mix.scripts([
        'calendarutilities.js',
        'studentcalendar.js'
    ], 'public/js/studentcalendar.js');

    mix.scripts([
        'calendarutilities.js',
        'advisorcalendar.js'
    ], 'public/js/advisorcalendar.js');

    mix.task('copyfonts');
});

//From http://ilikekillnerds.com/2014/07/copying-files-from-one-folder-to-another-in-gulp-js/
gulp.task('copyfonts', function() {
   gulp.src('resources/assets/bower/fontawesome/fonts/**/*.{ttf,woff,eot,svg,woff2}')
   .pipe(gulp.dest('public/fonts'));
   gulp.src('resources/assets/bower/bootstrap-sass/assets/fonts/bootstrap/**/*.{ttf,woff,eot,svg,woff2}')
   .pipe(gulp.dest('public/fonts'));
});
