//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
require('./bootstrap');

var App = {

	// Controller-action methods
	actions: {
		//Index for directly created views with no explicit controller
		RootRouteController: {
			getIndex: function() {
				var editable = require('./util/editable');
				editable.init();
				var site = require('./util/site');
				site.checkMessage();
			},
			getAbout: function() {
				var editable = require('./util/editable');
				editable.init();
				var site = require('./util/site');
				site.checkMessage();
			},
    },

		//Advising Controller for routes at /advising
		AdvisingController: {
			//advising/index
			getIndex: function() {
				var calendar = require('./pages/calendar');
				calendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
    GroupsessionController: {
			//groupsession/index
      getIndex: function() {
        var editable = require('./util/editable');
				editable.init();
				var site = require('./util/site');
				site.checkMessage();
      },
			//groupsesion/list
			getList: function() {
				var groupsession = require('./pages/groupsession');
				groupsession.init();
			},
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function() {
				var profile = require('./pages/profile');
				profile.init();
			}
		},

		//Dashboard Controller for routes at /admin-lte
		DashboardController: {
			//admin/index
			getIndex: function() {
				var dashboard = require('./util/dashboard');
				dashboard.init();
			},
		},

		StudentsController: {
			//admin/students
			getStudents: function() {
				var studentedit = require('./pages/dashboard/studentedit');
				studentedit.init();
			},
			//admin/newstudent
			getNewstudent: function() {
				var studentedit = require('./pages/dashboard/studentedit');
				studentedit.init();
			},
		},

		AdvisorsController: {
			//admin/advisors
			getAdvisors: function() {
				var advisoredit = require('./pages/dashboard/advisoredit');
				advisoredit.init();
			},
			//admin/newadvisor
			getNewadvisor: function() {
				var advisoredit = require('./pages/dashboard/advisoredit');
				advisoredit.init();
			},
		},

		DepartmentsController: {
			//admin/departments
			getDepartments: function() {
				var departmentedit = require('./pages/dashboard/departmentedit');
				departmentedit.init();
			},
			//admin/newdepartment
			getNewdepartment: function() {
				var departmentedit = require('./pages/dashboard/departmentedit');
				departmentedit.init();
			},
		},

		MeetingsController: {
			//admin/meetings
			getMeetings: function() {
				var meetingedit = require('./pages/dashboard/meetingedit');
				meetingedit.init();
			},
		},

		BlackoutsController: {
			//admin/blackouts
			getBlackouts: function() {
				var blackoutedit = require('./pages/dashboard/blackoutedit');
				blackoutedit.init();
			},
		},

		GroupsessionsController: {
			//admin/groupsessions
			getGroupsessions: function() {
				var groupsessionedit = require('./pages/dashboard/groupsessionedit');
				groupsessionedit.init();
			},
		},

		SettingsController: {
			//admin/settings
			getSettings: function() {
				var settings = require('./pages/dashboard/settings');
				settings.init();
			},
		},

		DegreeprogramsController: {
			//admin/degreeprograms
			getDegreeprograms: function() {
				var degreeprogramedit = require('./pages/dashboard/degreeprogramedit');
				degreeprogramedit.init();
			},
			//admin/degreeprogram/{id}
			getDegreeprogramDetail: function() {
				var degreeprogramedit = require('./pages/dashboard/degreeprogramdetail');
				degreeprogramedit.init();
			},
			//admin/newdegreeprogram
			getNewdegreeprogram: function() {
				var degreeprogramedit = require('./pages/dashboard/degreeprogramedit');
				degreeprogramedit.init();
			},
		},

		ElectivelistsController: {
			//admin/degreeprograms
			getElectivelists: function() {
				var electivelistedit = require('./pages/dashboard/electivelistedit');
				electivelistedit.init();
			},
			//admin/degreeprogram/{id}
			getElectivelistDetail: function() {
				var electivelistedit = require('./pages/dashboard/electivelistdetail');
				electivelistedit.init();
			},
			//admin/newdegreeprogram
			getNewelectivelist: function() {
				var electivelistedit = require('./pages/dashboard/electivelistedit');
				electivelistedit.init();
			},
		},

		PlansController: {
			//admin/plans
			getPlans: function() {
				var planedit = require('./pages/dashboard/planedit');
				planedit.init();
			},
			//admin/plan/{id}
			getPlanDetail: function() {
				var plandetail = require('./pages/dashboard/plandetail');
				plandetail.init();
			},
			//admin/newplan
			getNewplan: function() {
				var planedit = require('./pages/dashboard/planedit');
				planedit.init();
			},
		},

		CompletedcoursesController: {
			//admin/completedcourses
			getCompletedcourses: function() {
				var completedcourseedit = require('./pages/dashboard/completedcourseedit');
				completedcourseedit.init();
			},
			//admin/newcompletedcourse
			getNewcompletedcourse: function() {
				var completedcourseedit = require('./pages/dashboard/completedcourseedit');
				completedcourseedit.init();
			},
		},

	},

	//Function that is called by the page at load. Defined in resources/views/includes/scripts.blade.php
	//and App/Http/ViewComposers/Javascript Composer
	//See links at top of file for description of what's going on here
	//Assumes 2 inputs - the controller and action that created this page
	init: function(controller, action) {
		if (typeof this.actions[controller] !== 'undefined' && typeof this.actions[controller][action] !== 'undefined') {
			//call the matching function in the array above
			return App.actions[controller][action]();
		}
	},
};

//Bind to the window
window.App = App;
