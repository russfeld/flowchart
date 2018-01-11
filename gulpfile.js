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

    mix.styles([
        //'../bower/admin-lte/dist/css/AdminLTE.css',
        "dashboard-custom.css",
        "dashboard-skin.css",
        "../bower/datatables.net-bs/css/dataTables.bootstrap.css",
    ], 'public/css/dashboard.css');

    mix.styles([
        "../bower/summernote/dist/summernote.css",
    ], 'public/css/summernote.css');

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

    mix.scripts([
        '../bower/admin-lte/dist/js/app.js',
    ], 'public/js/lib/adminlte.js');

    mix.scripts([
        '../bower/datatables.net/js/jquery.dataTables.js',
    ], 'public/js/lib/datatables.js');

    mix.scripts([
        '../bower/datatables.net-bs/js/dataTables.bootstrap.js',
    ], 'public/js/lib/datatablesbs.js');

    mix.scripts([
        '../bower/summernote/dist/summernote.js',
    ], 'public/js/lib/summernote.js');

    //Utilities

    mix.scripts([
        'util/site.js',
    ], 'public/js/util/site.js');

    mix.scripts([
        'util/calendar.js',
    ], 'public/js/util/calendar.js');

    mix.scripts([
        'util/dashboard.js',
    ], 'public/js/util/dashboard.js');

    mix.scripts([
        'util/editable.js',
    ], 'public/js/util/editable.js');


    //Pages

    mix.scripts([
        'pages/advisor-calendar.js',
    ], 'public/js/advisor-calendar.js');

    mix.scripts([
        'pages/student-calendar.js',
    ], 'public/js/student-calendar.js');

    mix.scripts([
        'pages/readonly-calendar.js',
    ], 'public/js/readonly-calendar.js');

    mix.scripts([
        'pages/profiles.js',
    ], 'public/js/profiles.js');

    mix.babel([
        'pages/groupsession.js',
    ], 'public/js/groupsession.js');

    mix.scripts([
        'pages/dashboard/index.js',
    ], 'public/js/dashboard_index.js');

    mix.scripts([
        'pages/dashboard/studentedit.js',
    ], 'public/js/dashboard_studentedit.js');

    mix.scripts([
        'pages/dashboard/advisoredit.js',
    ], 'public/js/dashboard_advisoredit.js');

    mix.scripts([
        'pages/dashboard/departmentedit.js',
    ], 'public/js/dashboard_departmentedit.js');

    mix.scripts([
        'pages/dashboard/meetingedit.js',
    ], 'public/js/dashboard_meetingedit.js');

    mix.scripts([
        'pages/dashboard/blackoutedit.js',
    ], 'public/js/dashboard_blackoutedit.js');

    mix.scripts([
        'pages/dashboard/groupsessionedit.js',
    ], 'public/js/dashboard_groupsessionedit.js');

    mix.scripts([
        'pages/dashboard/degreeprogramedit.js',
    ], 'public/js/dashboard_degreeprogramedit.js');

    mix.scripts([
        'pages/dashboard/planedit.js',
    ], 'public/js/dashboard_planedit.js');

    mix.scripts([
        'pages/dashboard/completedcourseedit.js',
    ], 'public/js/dashboard_completedcourseedit.js');

    mix.scripts([
        'pages/dashboard/settings.js',
    ], 'public/js/dashboard_settings.js');

    mix.scripts([
        'pages/groupsessionindex.js',
    ], 'public/js/groupsessionindex.js');

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
   gulp.src('resources/assets/bower/summernote/dist/font/**/*.{ttf,woff,eot}')
   .pipe(gulp.dest('public/font'));
});
