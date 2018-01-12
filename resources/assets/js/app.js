//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
require('./bootstrap');

var App = {

	// Controller-action methods
	actions: {
		//Index for directly created views with no explicit controller
		index: {
			index: function() {
				//no default javascripts on home pages?
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
      },
			getList: function() {
				//var groupsession = require('./pages/groupsession');
				//groupsession.init();
			},
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function() {
				var profile = require('./pages/profile');
				profile.init();
			}
		}
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
