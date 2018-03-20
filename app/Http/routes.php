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
Route::get('/', 'RootRouteController@getIndex');
Route::get('/about', 'RootRouteController@getAbout');
Route::get('/help', 'RootRouteController@getHelp');
Route::get('/test', 'RootRouteController@getTest');


/*
 * Static route for images in storage
 * http://stackoverflow.com/questions/30191330/laravel-5-how-to-access-image-uploaded-in-storage-within-view
 */

Route::get('images/{filename}', 'RootRouteController@getImage');

/*
 * Routes for the CoursesController
 */
//Route::controller('courses', 'CoursesController');
Route::get('courses/', 'CoursesController@getIndex');
Route::get('courses/category/{category}', 'CoursesController@getCategory');
Route::get('courses/course/{slug}', 'CoursesController@getCourse');
Route::get('courses/coursefeed', 'CoursesController@getCoursefeed');

/*
 * Routes for the FlowchartsController
 */
//Route::controller('flowcharts', 'FlowchartsController');
Route::get('flowcharts/{id?}', 'FlowchartsController@getIndex');
Route::get('flowcharts/view/{id}', 'FlowchartsController@getFlowchart');
Route::get('flowcharts/data/{id}', 'FlowchartsController@getFlowchartData');
Route::get('flowcharts/semesters/{id}', 'FlowchartsController@getSemesterData');
Route::post('flowcharts/semesters/{id}/save', 'FlowchartsController@postSemesterSave');
Route::post('flowcharts/semesters/{id}/delete', 'FlowchartsController@postSemesterDelete');
Route::post('flowcharts/semesters/{id}/add', 'FlowchartsController@postSemesterAdd');
Route::post('flowcharts/semesters/{id}/move', 'FlowchartsController@postSemesterMove');
Route::post('flowcharts/data/{id}/move', 'FlowchartsController@postCourseMove');

/*
 * Routes for the AdvisingController
 */
//Route::controller('advising', 'AdvisingController');
Route::get('advising', 'AdvisingController@getIndex');
Route::get('advising/index/{id?}', 'AdvisingController@getIndex');
Route::get('advising/select/{dept?}', 'AdvisingController@getSelect');
Route::get('advising/meetingfeed', 'AdvisingController@getMeetingfeed');
Route::get('advising/blackoutfeed', 'AdvisingController@getBlackoutfeed');
Route::get('advising/blackout', 'AdvisingController@getBlackout');
Route::get('advising/meeting', 'AdvisingController@getMeeting');
Route::get('advising/conflicts', 'AdvisingController@getConflicts');
Route::post('advising/createmeeting', 'AdvisingController@postCreatemeeting');
Route::post('advising/deletemeeting', 'AdvisingController@postDeletemeeting');
Route::post('advising/createblackout', 'AdvisingController@postCreateblackout');
Route::post('advising/createblackoutevent', 'AdvisingController@postCreateblackoutevent');
Route::post('advising/deleteblackout', 'AdvisingController@postDeleteblackout');
Route::post('advising/deleteblackoutevent', 'AdvisingController@postDeleteblackoutevent');
Route::post('advising/resolveconflict', 'AdvisingController@postResolveconflict');

/*
 * Routes for the ProfilesController
 */
//Route::controller('profile', 'ProfilesController');
Route::get('profile/', 'ProfilesController@getIndex');
Route::get('profile/pic/{id?}', 'ProfilesController@getPic');
Route::get('profile/studentfeed', 'ProfilesController@getStudentfeed');
Route::post('profile/update', 'ProfilesController@postUpdate');
Route::post('profile/newstudent', 'ProfilesController@postNewstudent');

/*
 * Routes for the GroupsessionController
 */
//Route::controller('groupsession', 'GroupsessionController');
Route::get('groupsession/', 'GroupsessionController@getIndex');
Route::get('groupsession/list', 'GroupsessionController@getList');
Route::get('groupsession/queue', 'GroupsessionController@getQueue');
Route::post('groupsession/register', 'GroupsessionController@postRegister');
Route::post('groupsession/take', 'GroupsessionController@postTake');
Route::post('groupsession/put', 'GroupsessionController@postPut');
Route::post('groupsession/done', 'GroupsessionController@postDone');
Route::post('groupsession/delete', 'GroupsessionController@postDelete');
Route::get('groupsession/enable', 'GroupsessionController@getEnable');
Route::post('groupsession/disable', 'GroupsessionController@postDisable');

/*
 * Routes for the DashboardController
 */
//Route::controller('admin', 'DashboardController');
Route::get('admin/', 'Dashboard\DashboardController@getIndex');

Route::get('admin/students/{id?}', 'Dashboard\StudentsController@getStudents');
Route::get('admin/newstudent', 'Dashboard\StudentsController@getNewstudent');
Route::post('admin/students/{id?}', 'Dashboard\StudentsController@postStudents');
Route::post('admin/newstudent', 'Dashboard\StudentsController@postNewstudent');
Route::post('admin/deletestudent', 'Dashboard\StudentsController@postDeletestudent');
Route::post('admin/forcedeletestudent', 'Dashboard\StudentsController@postForcedeletestudent');
Route::post('admin/restorestudent', 'Dashboard\StudentsController@postRestorestudent');

Route::get('admin/advisors/{id?}', 'Dashboard\AdvisorsController@getAdvisors');
Route::get('admin/newadvisor', 'Dashboard\AdvisorsController@getNewadvisor');
Route::post('admin/advisors/{id?}', 'Dashboard\AdvisorsController@postAdvisors');
Route::post('admin/newadvisor', 'Dashboard\AdvisorsController@postNewadvisor');
Route::post('admin/deleteadvisor', 'Dashboard\AdvisorsController@postDeleteadvisor');
Route::post('admin/forcedeleteadvisor', 'Dashboard\AdvisorsController@postForcedeleteadvisor');
Route::post('admin/restoreadvisor', 'Dashboard\AdvisorsController@postRestoreadvisor');

Route::get('admin/departments/{id?}', 'Dashboard\DepartmentsController@getDepartments');
Route::get('admin/newdepartment', 'Dashboard\DepartmentsController@getNewdepartment');
Route::post('admin/departments/{id?}', 'Dashboard\DepartmentsController@postDepartments');
Route::post('admin/newdepartment', 'Dashboard\DepartmentsController@postNewdepartment');
Route::post('admin/deletedepartment', 'Dashboard\DepartmentsController@postDeletedepartment');
Route::post('admin/restoredepartment', 'Dashboard\DepartmentsController@postRestoredepartment');
Route::post('admin/forcedeletedepartment', 'Dashboard\DepartmentsController@postForcedeletedepartment');

Route::get('admin/meetings/{id?}', 'Dashboard\MeetingsController@getMeetings');
Route::post('admin/deletemeeting', 'Dashboard\MeetingsController@postDeletemeeting');
Route::post('admin/forcedeletemeeting', 'Dashboard\MeetingsController@postForcedeletemeeting');

Route::get('admin/blackouts/{id?}', 'Dashboard\BlackoutsController@getBlackouts');
Route::post('admin/deleteblackout', 'Dashboard\BlackoutsController@postDeleteblackout');


Route::get('admin/groupsessions/{id?}', 'Dashboard\GroupsessionsController@getGroupsessions');
Route::post('admin/deletegroupsession', 'Dashboard\GroupsessionsController@postDeletegroupsession');


Route::get('admin/settings', 'Dashboard\SettingsController@getSettings');
Route::post('admin/newsetting', 'Dashboard\SettingsController@postNewsetting');
Route::post('admin/savesetting', 'Dashboard\SettingsController@postSavesetting');

Route::get('admin/degreeprograms', 'Dashboard\DegreeprogramsController@getDegreeprograms');
Route::get('admin/degreeprograms/{id?}', 'Dashboard\DegreeprogramsController@getDegreeprogramDetail');
Route::get('admin/degreeprograms/{id?}/edit', 'Dashboard\DegreeprogramsController@getDegreeprograms');
Route::get('admin/newdegreeprogram', 'Dashboard\DegreeprogramsController@getNewdegreeprogram');
Route::post('admin/degreeprograms/{id?}', 'Dashboard\DegreeprogramsController@postDegreeprograms');
Route::post('admin/newdegreeprogram', 'Dashboard\DegreeprogramsController@postNewdegreeprogram');
Route::post('admin/deletedegreeprogram', 'Dashboard\DegreeprogramsController@postDeletedegreeprogram');
Route::post('admin/restoredegreeprogram', 'Dashboard\DegreeprogramsController@postRestoredegreeprogram');
Route::post('admin/forcedeletedegreeprogram', 'Dashboard\DegreeprogramsController@postForcedeletedegreeprogram');

Route::post('admin/newdegreerequirement/', 'Dashboard\DegreerequirementsController@postNewdegreerequirement');
Route::get('admin/degreeprogramrequirements/{id?}', 'Dashboard\DegreerequirementsController@getDegreerequirementsForProgram');
Route::get('admin/degreerequirement/{id?}', 'Dashboard\DegreerequirementsController@getDegreerequirement');
Route::post('admin/degreerequirement/{id?}', 'Dashboard\DegreerequirementsController@postDegreerequirement');
Route::post('admin/deletedegreerequirement', 'Dashboard\DegreerequirementsController@postDeletedegreerequirement');

Route::get('admin/electivelists', 'Dashboard\ElectivelistsController@getElectivelists');
Route::get('admin/electivelists/{id?}', 'Dashboard\ElectivelistsController@getElectivelistDetail');
Route::get('admin/electivelists/{id?}/edit', 'Dashboard\ElectivelistsController@getElectivelists');
Route::get('admin/newelectivelist', 'Dashboard\ElectivelistsController@getNewelectivelist');
Route::post('admin/electivelists/{id?}', 'Dashboard\ElectivelistsController@postElectivelists');
Route::post('admin/newelectivelist', 'Dashboard\ElectivelistsController@postNewelectivelist');
Route::post('admin/deleteelectivelist', 'Dashboard\ElectivelistsController@postDeleteelectivelist');
Route::post('admin/restoreelectivelist', 'Dashboard\ElectivelistsController@postRestoreelectivelist');
Route::post('admin/forcedeleteelectivelist', 'Dashboard\ElectivelistsController@postForcedeleteelectivelist');

Route::get('admin/electivelistcourses/{id?}', 'Dashboard\ElectivelistcoursesController@getElectivelistcoursesforList');
Route::post('admin/newelectivelistcourse/', 'Dashboard\ElectivelistcoursesController@postNewelectivelistcourse');
Route::post('admin/deleteelectivecourse', 'Dashboard\ElectivelistcoursesController@postDeleteelectivelistcourse');
Route::post('admin/electivecourse/{id?}', 'Dashboard\ElectivelistcoursesController@postElectivelistcourse');
Route::get('admin/electivecourse/{id?}', 'Dashboard\ElectivelistcoursesController@getElectivelistcourse');

Route::get('admin/plans', 'Dashboard\PlansController@getPlans');
Route::get('admin/plans/{id?}', 'Dashboard\PlansController@getPlanDetail');
Route::get('admin/plans/{id?}/edit', 'Dashboard\PlansController@getPlans');
Route::get('admin/newplan', 'Dashboard\PlansController@getNewplan');
Route::post('admin/plans/{id?}', 'Dashboard\PlansController@postPlans');
Route::post('admin/newplan', 'Dashboard\PlansController@postNewplan');
Route::post('admin/deleteplan', 'Dashboard\PlansController@postDeleteplan');
Route::post('admin/restoreplan', 'Dashboard\PlansController@postRestoreplan');
Route::post('admin/forcedeleteplan', 'Dashboard\PlansController@postForcedeleteplan');
Route::post('admin/populateplan', 'Dashboard\PlansController@postPopulateplan');

Route::post('admin/newplanrequirement/', 'Dashboard\PlanrequirementsController@postNewplanrequirement');
Route::get('admin/planrequirements/{id?}', 'Dashboard\PlanrequirementsController@getPlanrequirementsForPlan');
Route::get('admin/planrequirement/{id?}', 'Dashboard\PlanrequirementsController@getPlanrequirement');
Route::post('admin/planrequirement/{id?}', 'Dashboard\PlanrequirementsController@postPlanrequirement');
Route::post('admin/deleteplanrequirement', 'Dashboard\PlanrequirementsController@postDeleteplanrequirement');

Route::get('admin/plans/plansemesters/{id?}', 'Dashboard\PlansemestersController@getPlanSemestersForPlan');
Route::get('admin/plans/plansemester/{id?}', 'Dashboard\PlansemestersController@getPlanSemester');
Route::get('admin/plans/newplansemester/{id?}', 'Dashboard\PlansemestersController@getNewPlanSemester');
Route::post('admin/plans/newplansemester/{id?}', 'Dashboard\PlansemestersController@postNewPlanSemester');
Route::post('admin/plans/plansemester/{id?}', 'Dashboard\PlansemestersController@postPlanSemester');
Route::post('admin/plans/deleteplansemester/{id?}', 'Dashboard\PlansemestersController@postDeletePlanSemester');


Route::get('admin/completedcourses/{id?}', 'Dashboard\CompletedcoursesController@getCompletedcourses');
Route::get('admin/newcompletedcourse', 'Dashboard\CompletedcoursesController@getNewcompletedcourse');
Route::post('admin/completedcourses/{id?}', 'Dashboard\CompletedcoursesController@postCompletedcourses');
Route::post('admin/newcompletedcourse', 'Dashboard\CompletedcoursesController@postNewcompletedcourse');
Route::post('admin/deletecompletedcourse', 'Dashboard\CompletedcoursesController@postDeletecompletedcourse');

/*
 * Routes for ElectivelistsController
 */
Route::get('electivelists/electivelistfeed', 'ElectivelistsController@getElectivelistfeed');

/*
 * Routes for Authentication
 */
Route::get('auth/login', 'Auth\AuthController@CASLogin');
Route::get('auth/logout', 'Auth\AuthController@Logout');
Route::get('auth/caslogout', 'Auth\AuthController@CASLogout');
Route::get('auth/force', 'Auth\AuthController@ForceLogin');

Route::post('editable/save/{id?}', 'EditableController@postSave');
