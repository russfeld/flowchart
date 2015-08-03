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

Route::get('/', function () {
    return view('root/index');
});


Route::get('courses/{category}', 'CoursesController@getCategory')->where('category', '[A-Za-z]+');
Route::get('courses/{slug}', 'CoursesController@getCourse')->where('slug', '[A-Za-z]+[0-9][0-9][0-9]');

Route::controller('courses', 'CoursesController');

Route::controller('flowcharts', 'FlowchartsController');

Route::controller('advising', 'AdvisingController');

Route::controller('profile', 'ProfilesController');


// Authentication routes...
Route::get('auth/login', 'Auth\AuthController@getLogin');
Route::post('auth/login', 'Auth\AuthController@postLogin');
Route::get('auth/logout', 'Auth\AuthController@getLogout');

// Registration routes...
Route::get('auth/register', 'Auth\AuthController@getRegister');
Route::post('auth/register', 'Auth\AuthController@postRegister');

//Test Routes
Route::get('/test', function() {
	return view('flowchart_test');
});
