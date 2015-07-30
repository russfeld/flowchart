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

    mix.scripts([
    	'../bower/jquery/dist/jquery.js',
    	'../bower/bootstrap-sass/assets/javascripts/bootstrap.js',
    ],'public/js/vendor.js');

    mix.scripts([
    	'../bower/snap.svg/dist/snap.svg.js'
    ], 'public/js/snapsvg.js');

    mix.scripts([
    	'flowchart.js'
    ], 'public/js/flowchart.js');

    mix.task('copyfonts');
});

//From http://ilikekillnerds.com/2014/07/copying-files-from-one-folder-to-another-in-gulp-js/
gulp.task('copyfonts', function() {
   gulp.src('resources/assets/bower/fontawesome/fonts/**/*.{ttf,woff,eot,svg,woff2}')
   .pipe(gulp.dest('public/fonts'));
});
