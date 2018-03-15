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

mix.sass('resources/assets/sass/flowchart.scss', 'public/css')

mix.styles([
    //'node_modules/admin-lte/dist/css/AdminLTE.css',
    "resources/assets/css/dashboard-custom.css",
    "resources/assets/css/dashboard-skin.css",
    "node_modules/datatables.net-bs/css/dataTables.bootstrap.css",
], 'public/css/dashboard.css');


//Global Javascript Stuff

mix.js('resources/assets/js/app.js', 'public/js')
    .extract(['jquery', 'bootstrap', 'lodash', 'axios', 'summernote', 'codemirror', 'fullcalendar', 'devbridge-autocomplete', 'moment', 'eonasdan-bootstrap-datetimepicker-russfeld', 'vue', 'pusher-js', 'ion-sound', 'laravel-echo', 'admin-lte', 'datatables.net', 'datatables.net-bs', 'muuri', 'hammerjs', 'web-animations-js'])
    .sourceMaps();

mix.copy('node_modules/ion-sound/sounds/door_bell*', 'public/sounds');

if (mix.inProduction()) {
    mix.version();
}
