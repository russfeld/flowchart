//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//load libraries in bootstrap file
require('./bootstrap');

var App = {
	init: function(controller, action) {
		if (typeof this.actions[controller] !== 'undefined' && typeof this.actions[controller][action] !== 'undefined') {
			return App.actions[controller][action]();
		}
	},
	// Controller-action methods
	actions: {
		index: {
			index: function() {
				//no default javascripts on home pages?
			},
    },
    GroupsessionController: {
      getIndex: function() {
        var editables_init = require('./util/editable').init;
				editables_init();
      },
		},
	},
};

window.App = App;
