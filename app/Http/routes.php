<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

/*
 * Static routes for static pages
 * Tested in tests/RouteTest.php
 */
Route::get('/', function () {
    return View::make('root/index');
});

Route::get('/about', function () {
    return View::make('root/about');
});

Route::get('help', function(){
	return View::make('help/index');
});

Route::get('help/groupsession', function(){
	return View::make('help/groupsession');
});

/*
 * Static route for images in storage
 * http://stackoverflow.com/questions/30191330/laravel-5-how-to-access-image-uploaded-in-storage-within-view
 */

Route::get('images/{filename}', function ($filename)
{
    $path = storage_path() . '/app/images/' . $filename;

    $file = File::get($path);
    $type = File::mimeType($path);

    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);

    return $response;
});

/*
 * Routes for the CoursesController
 */
Route::get('courses/{category}', 'CoursesController@getCategory')->where('category', '[A-Za-z]+');
Route::get('courses/{slug}', 'CoursesController@getCourse')->where('slug', '[A-Za-z]+[0-9][0-9][0-9]');
Route::controller('courses', 'CoursesController');

/*
 * Routes for the FlowchartsController
 */
Route::controller('flowcharts', 'FlowchartsController');

/*
 * Routes for the AdvisingController
 */
Route::controller('advising', 'AdvisingController');

/*
 * Routes for the ProfilesController
 */
Route::controller('profile', 'ProfilesController');

/*
 * Routes for the GroupsessionController
 */
Route::controller('groupsession', 'GroupsessionController');

/*
 * Routes for Authentication
 */
Route::get('auth/login', 'Auth\AuthController@CASLogin');
Route::get('auth/logout', 'Auth\AuthController@Logout');
Route::get('auth/caslogout', 'Auth\AuthController@CASLogout');
Route::get('auth/force', 'Auth\AuthController@ForceLogin');

/*
 * Test Routes for Flowchart tester
 * Tested in tests/RouteTest.php
 */
Route::get('/test', function() {
	return View::make('flowchart_test');
});
