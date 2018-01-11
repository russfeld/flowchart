////https://mattstauffer.com/blog/introducing-laravel-mix-new-in-laravel-5-4/

const { mix } = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

//Example in default file

/*
mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css');
*/

//https://github.com/JeffreyWay/laravel-mix/blob/master/docs/quick-webpack-configuration.md
//fixes https://www.fixtheerror.com/bootstrap-errors/fix-bootstrap-error-jquery-is-not-defined-238223
mix.webpackConfig(webpack => {
    return {
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
            })
        ]
    };
});


//Global CSS styles definition

mix.setPublicPath('public')

mix.sass('resources/assets/sass/app.scss', 'public/css');

/*
mix.styles([
    'resources/assets/bower/fullcalendar/dist/fullcalendar.css',
    'resources/assets/bower/russfeld-eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
], 'public/css/calendar.css');

mix.styles([
    //'../bower/admin-lte/dist/css/AdminLTE.css',
    "resources/assets/css/dashboard-custom.css",
    "resources/assets/css/dashboard-skin.css",
    "resources/assets/bower/datatables.net-bs/css/dataTables.bootstrap.css",
], 'public/css/dashboard.css');

*/

//Global Javascript Stuff

mix.js('resources/assets/js/app.js', 'public/js')
    .extract(['jquery', 'bootstrap', 'lodash', 'axios', 'summernote', 'codemirror', 'fullcalendar', 'jquery-autocomplete', 'moment', 'eonasdan-bootstrap-datetimepicker-russfeld'])
    .sourceMaps();

if (mix.inProduction()) {
    mix.version();
}
