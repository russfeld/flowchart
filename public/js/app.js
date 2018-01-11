webpackJsonp([1],{

/***/ 138:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(139);
module.exports = __webpack_require__(178);


/***/ }),

/***/ 139:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(140);

var App = {

	// Controller-action methods
	actions: {
		//Index for directly created views with no explicit controller
		index: {
			index: function index() {
				//no default javascripts on home pages?
			}
		},

		//Advising Controller for routes at /advising
		AdvisingController: {
			//advising/index
			getIndex: function getIndex() {
				var studentcalendar = __webpack_require__(172);
				studentcalendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
		GroupsessionController: {
			//groupsession/index
			getIndex: function getIndex() {
				var editable = __webpack_require__(175);
				editable.init();
			}
		}
	},

	//Function that is called by the page at load. Defined in resources/views/includes/scripts.blade.php
	//and App/Http/ViewComposers/Javascript Composer
	//See links at top of file for description of what's going on here
	//Assumes 2 inputs - the controller and action that created this page
	init: function init(controller, action) {
		if (typeof this.actions[controller] !== 'undefined' && typeof this.actions[controller][action] !== 'undefined') {
			//call the matching function in the array above
			return App.actions[controller][action]();
		}
	}
};

//Bind to the window
window.App = App;

/***/ }),

/***/ 140:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {window._ = __webpack_require__(6);

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(1);

__webpack_require__(8);

/**
 * Vue is a modern JavaScript library for building interactive web interfaces
 * using reactive data binding and reusable components. Vue's API is clean
 * and simple, leaving you to focus on building your next great project.
 */

// window.Vue = require('vue');

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(9);

//https://github.com/rappasoft/laravel-5-boilerplate/blob/master/resources/assets/js/bootstrap.js
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

var token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: 'your-pusher-key'
// });
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 172:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {exports.init = function () {

  //Load required libraries
  calendar = __webpack_require__(173);
  site = __webpack_require__(5);

  //Check for messages in the sessionn from a previous action
  site.checkMessage();

  //Initialize the calendar library as a student view
  calendar.init(false);

  //Set the advisor information for meeting event source
  calendar.calendarData.eventSources[0].data = { id: calendar.calendarAdvisorID };

  //Set the advsior inforamtion for blackout event source
  calendar.calendarData.eventSources[1].data = { id: calendar.calendarAdvisorID };
  //Render blackouts to background
  calendar.calendarData.eventSources[1].rendering = 'background';

  //When rendering, use this custom function for blackouts and student meetings
  calendar.calendarData.eventRender = function (event, element) {
    if (event.type == 'b') {
      element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
    }
    if (event.type == 's') {
      element.addClass("fc-green");
    }
  };

  //Use this method for clicking on meetings
  calendar.calendarData.eventClick = function (event, element, view) {
    if (event.type == 's') {
      if (event.start.isAfter(moment())) {
        calendar.showMeetingForm(event);
      } else {
        alert("You cannot edit meetings in the past");
      }
    }
  };

  //When selecting new areas, use the studentSelect method in the calendar library
  calendar.calendarData.select = calendar.studentSelect;

  //if the window is small, set different default for calendar
  if ($(window).width() < 600) {
    calendar.calendarData.defaultView = 'agendaDay';
  }

  //initalize the calendar!
  $('#calendar').fullCalendar(calendar.calendarData);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 173:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required JS libraries
__webpack_require__(15);
__webpack_require__(135);
moment = __webpack_require__(0);
site = __webpack_require__(5);
__webpack_require__(136);

//Session for storing data between forms
exports.calendarSession = {};

//ID of the currently loaded calendar's advisor
exports.calendarAdvisorID = -1;

//Student's Name set by init
exports.calendarStudentName = "";

//Configuration data for fullcalendar instance
exports.calendarData = {
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'agendaWeek,agendaDay'
	},
	editable: false,
	eventLimit: true,
	height: 'auto',
	weekends: false,
	businessHours: {
		start: '8:00', // a start time (10am in this example)
		end: '17:00', // an end time (6pm in this example)
		dow: [1, 2, 3, 4, 5]
	},
	defaultView: 'agendaWeek',
	views: {
		agenda: {
			allDaySlot: false,
			slotDuration: '00:20:00',
			minTime: '08:00:00',
			maxTime: '17:00:00'
		}
	},
	eventSources: [{
		url: '/advising/meetingfeed',
		type: 'GET',
		error: function error() {
			alert('Error fetching meeting events from database');
		},
		color: '#512888',
		textColor: 'white'
	}, {
		url: '/advising/blackoutfeed',
		type: 'GET',
		error: function error() {
			alert('Error fetching blackout events from database');
		},
		color: '#FF8888',
		textColor: 'black'
	}],
	selectable: true,
	selectHelper: true,
	selectOverlap: function selectOverlap(event) {
		return event.rendering === 'background';
	},
	timeFormat: ' '
};

//Configuration data for datepicker instance
exports.datePickerData = {
	daysOfWeekDisabled: [0, 6],
	format: 'LLL',
	stepping: 20,
	enabledHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
	maxHour: 17,
	sideBySide: true,
	ignoreReadonly: true,
	allowInputToggle: true
};

//Configuration data for datepicker instance day only
exports.datePickerDateOnly = {
	daysOfWeekDisabled: [0, 6],
	format: 'MM/DD/YYYY',
	ignoreReadonly: true,
	allowInputToggle: true
};

/**
 * Initialzation function for fullcalendar instance
 *
 * @param advisor - boolean true if the user is an advisor
 * @param nobind - boolean true if the buttons should not be bound (make calendar read-only)
 */
exports.init = function (advisor, nobind) {

	//tweak parameters
	advisor || (advisor = false);
	nobind || (nobind = false);

	//get the current advisor's ID
	exports.calendarAdvisorID = $('#calendarAdvisorID').val().trim();

	//If nobind, don't bind the forms
	if (!nobind) {
		//If the current user is an advisor, bind more data
		if (advisor) {

			//When the create event button is clicked, show the modal form
			$('#createEvent').on('shown.bs.modal', function () {
				$('#title').focus();
			});

			//Enable and disable certain form fields based on user
			$('#title').prop('disabled', false);
			$('#start').prop('disabled', false);
			$('#studentid').prop('disabled', false);
			$('#start_span').removeClass('datepicker-disabled');
			$('#end').prop('disabled', false);
			$('#end_span').removeClass('datepicker-disabled');
			$('#studentiddiv').show();
			$('#statusdiv').show();

			//bind the reset form method
			$('#createEvent').on('hidden.bs.modal', resetForm);

			//If the current user is not an advisor, bind less data
		} else {

			//When the create event button is clicked, show the modal form
			$('#createEvent').on('shown.bs.modal', function () {
				$('#desc').focus();
			});

			//Enable and disable certain form fields based on user
			$('#title').prop('disabled', true);
			$("#start").prop('disabled', true);
			$('#studentid').prop('disabled', true);
			$("#start_span").addClass('datepicker-disabled');
			$("#end").prop('disabled', true);
			$("#end_span").addClass('datepicker-disabled');
			$('#studentiddiv').hide();
			$('#statusdiv').hide();
			$('#studentidval').val(-1);

			//Get the current student's name
			exports.calendarStudentName = $('#calendarStudentName').val().trim();

			//bind the reset form method
			$('.modal').on('hidden.bs.modal', self.resetForm);
		}

		//Bind click handlers on the form
		$('#saveButton').bind('click', saveMeeting);
		$('#deleteButton').bind('click', deleteMeeting);
		$('#duration').on('change', changeDuration);
	}
};

/**
 * Function to save a meeting
 */
var saveMeeting = function saveMeeting() {

	//Show the spinning status icon while working
	$('#createEventSpin').removeClass('hide-spin');

	//build the data object
	var data = {
		start: moment($('#start').val(), "LLL").format(),
		end: moment($('#end').val(), "LLL").format(),
		title: $('#title').val(),
		desc: $('#desc').val(),
		status: $('#status').val()
	};
	data.id = exports.calendarAdvisorID;
	if ($('#meetingID').val() > 0) {
		data.meetingid = $('#meetingID').val();
	}
	if ($('#studentidval').val() > 0) {
		data.studentid = $('#studentidval').val();
	}

	//AJAX POST to server
	window.axios.post('/advising/createmeeting', data)
	//if response is 2xx
	.then(function (response) {
		//hide the form
		$('#createEvent').modal('hide');

		//display the message to the user
		site.displayMessage(response.data, "success");

		//refresh the calendar
		$('#calendar').fullCalendar('unselect');
		$('#calendar').fullCalendar('refetchEvents');
		$('#createEventSpin').addClass('hide-spin');
	})
	//if response is not 2xx
	.catch(function (error) {
		if (error.response) {
			//If response is 422, errors were provided
			if (error.response.status == 422) {
				site.setFormErrors(error.response.data);
			} else {
				alert("Unable to save meeting: " + error.response.data);
			}
		}

		//hide spinning icon
		$('#createEventSpin').addClass('hide-spin');
	});

	/*
 $.ajax({
   method: "POST",
   url: '/advising/createmeeting',
   data: data
 })
 .success(function( message ) {
 	$('#createEvent').modal('hide');
 	site.displayMessage(message, "success");
 	$('#calendar').fullCalendar('unselect');
 	$('#calendar').fullCalendar('refetchEvents');
 	$('#createEventSpin').addClass('hide-spin');
 }).fail(function( jqXHR, message ){
 	if (jqXHR.status == 422)
 	{
 		site.setFormErrors(jqXHR.responseJSON);
 	}else{
 		alert("Unable to save meeting: " + jqXHR.responseJSON);
 	}
 	$('#createEventSpin').addClass('hide-spin');
 });
 */
};

/**
 * Function to delete a meeting
 */
var deleteMeeting = function deleteMeeting() {

	//prompt the user for confirmation
	var choice = confirm("Are you sure?");
	if (choice === true) {

		//if confirmed, show spinning icon
		$('#createEventSpin').removeClass('hide-spin');

		//make AJAX request to delete
		window.axios.post('/advising/deletemeeting', {
			meetingid: $('#meetingID').val()
		}).then(function (response) {
			//hide the form
			$('#createEvent').modal('hide');

			//display the message to the user
			site.displayMessage(response.data, "success");

			//refresh the calendar
			$('#calendar').fullCalendar('unselect');
			$('#calendar').fullCalendar('refetchEvents');
			$('#createEventSpin').addClass('hide-spin');
		}).catch(function (error) {
			alert("Unable to save meeting: " + error.response.data);

			//hide spinning icon
			$('#createEventSpin').addClass('hide-spin');
		});

		/*
  $.ajax({
    method: "POST",
    url: '/advising/deletemeeting',
    data: { meetingid: $('#meetingID').val() }
  })
  .success(function( message ) {
  	$('#createEvent').modal('hide');
  	site.displayMessage(message, "success");
  	$('#calendar').fullCalendar('unselect');
  	$('#calendar').fullCalendar('refetchEvents');
  	$('#createEventSpin').addClass('hide-spin');
  }).fail(function( jqXHR, message ){
  	alert("Unable to delete meeting: " + jqXHR.responseJSON);
  	$('#createEventSpin').addClass('hide-spin');
  });
  */
	}
};

/**
 * Function to populate and show the meeting form for editing
 *
 * @param event - The event to edit
 */
exports.showMeetingForm = function (event) {
	$('#title').val(event.title);
	$('#start').val(event.start.format("LLL"));
	$('#end').val(event.end.format("LLL"));
	$('#desc').val(event.desc);
	durationOptions(event.start, event.end);
	$('#meetingID').val(event.id);
	$('#studentidval').val(event.student_id);
	$('#status').val(event.status);
	$('#deleteButton').show();
	$('#createEvent').modal('show');
};

/**
 * Function to reset and show the meeting form for creation
 *
 * @param calendarStudentName - string name of the student
 */
exports.createMeetingForm = function (calendarStudentName) {

	//populate the title automatically for a student
	if (calendarStudentName !== undefined) {
		$('#title').val(calendarStudentName);
	} else {
		$('#title').val('');
	}

	//Set start time
	if (exports.calendarSession.start === undefined) {
		$('#start').val(moment().hour(8).minute(0).format('LLL'));
	} else {
		$('#start').val(exports.calendarSession.start.format("LLL"));
	}

	//Set end time
	if (exports.calendarSession.end === undefined) {
		$('#end').val(moment().hour(8).minute(20).format('LLL'));
	} else {
		$('#end').val(exports.calendarSession.end.format("LLL"));
	}

	//Set duration options
	if (exports.calendarSession.start === undefined) {
		durationOptions(moment().hour(8).minute(0), moment().hour(8).minute(20));
	} else {
		durationOptions(exports.calendarSession.start, exports.calendarSession.end);
	}

	//Reset other options
	$('#meetingID').val(-1);
	$('#studentidval').val(-1);

	//Hide delete button
	$('#deleteButton').hide();

	//Show the modal form
	$('#createEvent').modal('show');
};

/*
 * Function to reset the form on this page
 */
exports.resetForm = function () {
	$(this).find('form')[0].reset();
	site.clearFormErrors();
};

/**
 * Function to set duration options for the meeting form
 *
 * @param start - a moment object for the start time
 * @param end - a moment object for the ending time
 */
var durationOptions = function durationOptions(start, end) {
	//clear the list
	$('#duration').empty();

	//assume all meetings have room for 20 minutes
	$('#duration').append("<option value='20'>20 minutes</option>");

	//if it starts on or before 4:20, allow 40 minutes as an option
	if (start.hour() < 16 || start.hour() == 16 && start.minutes() <= 20) {
		$('#duration').append("<option value='40'>40 minutes</option>");
	}

	//if it starts on or before 4:00, allow 60 minutes as an option
	if (start.hour() < 16 || start.hour() == 16 && start.minutes() <= 0) {
		$('#duration').append("<option value='60'>60 minutes</option>");
	}

	//set default value based on given span
	$('#duration').val(end.diff(start, "minutes"));
};

/**
 * Function to link the datepickers together
 *
 * @param elem1 - jQuery object for first datepicker
 * @param elem2 - jQuery object for second datepicker
 * @param duration - duration of the meeting
 */
exports.linkDatePickers = function (elem1, elem2, duration) {
	//bind to change action on first datapicker
	$(elem1 + "_datepicker").on("dp.change", function (e) {
		var date2 = moment($(elem2).val(), 'LLL');
		if (e.date.isAfter(date2) || e.date.isSame(date2)) {
			date2 = e.date.clone();
			$(elem2).val(date2.format("LLL"));
		}
	});

	//bind to change action on second datepicker
	$(elem2 + "_datepicker").on("dp.change", function (e) {
		var date1 = moment($(elem1).val(), 'LLL');
		if (e.date.isBefore(date1) || e.date.isSame(date1)) {
			date1 = e.date.clone();
			$(elem1).val(date1.format("LLL"));
		}
	});
};

/**
 * Function to change the duration of the meeting
 */
var changeDuration = function changeDuration() {
	var newDate = moment($('#start').val(), 'LLL').add($(this).val(), "minutes");
	$('#end').val(newDate.format("LLL"));
};

/**
 * Function to verify that the students are selecting meetings that aren't too long
 *
 * @param start - moment object for the start of the meeting
 * @param end - moment object for the end of the meeting
 */
exports.studentSelect = function (start, end) {

	//When students select a meeting, diff the start and end times
	if (end.diff(start, 'minutes') > 60) {

		//if invalid, unselect and show an error
		alert("Meetings cannot last longer than 1 hour");
		$('#calendar').fullCalendar('unselect');
	} else {

		//if valid, set data in the session and show the form
		exports.calendarSession = {
			start: start,
			end: end
		};
		$('#meetingID').val(-1);
		exports.createMeetingForm(exports.calendarStudentName);
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 175:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function () {

  //Load required libraries
  __webpack_require__(3);
  __webpack_require__(176);
  __webpack_require__(137);
  site = __webpack_require__(5);

  //Check for messages in the session (usually from a previous successful save)
  site.checkMessage();

  //Register click handlers for [edit] links
  $('.editable-link').each(function () {
    $(this).click(function (e) {
      e.stopPropagation();
      e.preventDefault();

      //get ID of item clicked
      var id = $(this).data('id');

      //hide the [edit] links, enable editor, and show Save and Cancel buttons
      $('#editablebutton-' + id).addClass('hidden');
      $('#editablesave-' + id).removeClass('hidden');
      $('#editable-' + id).summernote({
        focus: true,
        toolbar: [
        // [groupName, [list of buttons]]
        ['style', ['style', 'bold', 'italic', 'underline', 'clear']], ['font', ['strikethrough', 'superscript', 'subscript', 'link']], ['para', ['ul', 'ol', 'paragraph']], ['misc', ['fullscreen', 'codeview', 'help']]],
        tabsize: 2,
        codemirror: {
          mode: 'text/html',
          htmlMode: true,
          lineNumbers: true,
          theme: 'monokai'
        }
      });
    });
  });

  //Register click handlers for Save buttons
  $('.editable-save').each(function () {
    $(this).click(function (e) {
      e.stopPropagation();
      e.preventDefault();

      //get ID of item clicked
      var id = $(this).data('id');

      //Display spinner while AJAX call is performed
      $('#editablespin-' + id).removeClass('hide-spin');

      //Get contents of editor
      var htmlString = $('#editable-' + id).summernote('code');

      //Post contents to server, wait for response
      window.axios.post('/editable/save/' + id, {
        contents: htmlString
      }).then(function (response) {
        //If response 200 received, assume it saved and reload page
        location.reload(true);
      }).catch(function (error) {
        alert("Unable to save content: " + error.response.data);
      });
    });
  });

  //Register click handlers for Cancel buttons
  $('.editable-cancel').each(function () {
    $(this).click(function (e) {
      e.stopPropagation();
      e.preventDefault();

      //get ID of item clicked
      var id = $(this).data('id');

      //Reset the contents of the editor and destroy it
      $('#editable-' + id).summernote('reset');
      $('#editable-' + id).summernote('destroy');

      //Hide Save and Cancel buttons, and show [edit] link
      $('#editablebutton-' + id).removeClass('hidden');
      $('#editablesave-' + id).addClass('hidden');
    });
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 176:
/***/ (function(module, exports, __webpack_require__) {

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (true) // CommonJS
    mod(__webpack_require__(3));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

var htmlConfig = {
  autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
                    'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
                    'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
                    'track': true, 'wbr': true, 'menuitem': true},
  implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
                     'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
                     'th': true, 'tr': true},
  contextGrabbers: {
    'dd': {'dd': true, 'dt': true},
    'dt': {'dd': true, 'dt': true},
    'li': {'li': true},
    'option': {'option': true, 'optgroup': true},
    'optgroup': {'optgroup': true},
    'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
          'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
          'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
          'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
          'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
    'rp': {'rp': true, 'rt': true},
    'rt': {'rp': true, 'rt': true},
    'tbody': {'tbody': true, 'tfoot': true},
    'td': {'td': true, 'th': true},
    'tfoot': {'tbody': true},
    'th': {'td': true, 'th': true},
    'thead': {'tbody': true, 'tfoot': true},
    'tr': {'tr': true}
  },
  doNotIndent: {"pre": true},
  allowUnquoted: true,
  allowMissing: true,
  caseFold: true
}

var xmlConfig = {
  autoSelfClosers: {},
  implicitlyClosed: {},
  contextGrabbers: {},
  doNotIndent: {},
  allowUnquoted: false,
  allowMissing: false,
  allowMissingTagName: false,
  caseFold: false
}

CodeMirror.defineMode("xml", function(editorConf, config_) {
  var indentUnit = editorConf.indentUnit
  var config = {}
  var defaults = config_.htmlMode ? htmlConfig : xmlConfig
  for (var prop in defaults) config[prop] = defaults[prop]
  for (var prop in config_) config[prop] = config_[prop]

  // Return variables for tokenizers
  var type, setStyle;

  function inText(stream, state) {
    function chain(parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    var ch = stream.next();
    if (ch == "<") {
      if (stream.eat("!")) {
        if (stream.eat("[")) {
          if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
          else return null;
        } else if (stream.match("--")) {
          return chain(inBlock("comment", "-->"));
        } else if (stream.match("DOCTYPE", true, true)) {
          stream.eatWhile(/[\w\._\-]/);
          return chain(doctype(1));
        } else {
          return null;
        }
      } else if (stream.eat("?")) {
        stream.eatWhile(/[\w\._\-]/);
        state.tokenize = inBlock("meta", "?>");
        return "meta";
      } else {
        type = stream.eat("/") ? "closeTag" : "openTag";
        state.tokenize = inTag;
        return "tag bracket";
      }
    } else if (ch == "&") {
      var ok;
      if (stream.eat("#")) {
        if (stream.eat("x")) {
          ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
        } else {
          ok = stream.eatWhile(/[\d]/) && stream.eat(";");
        }
      } else {
        ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
      }
      return ok ? "atom" : "error";
    } else {
      stream.eatWhile(/[^&<]/);
      return null;
    }
  }
  inText.isInText = true;

  function inTag(stream, state) {
    var ch = stream.next();
    if (ch == ">" || (ch == "/" && stream.eat(">"))) {
      state.tokenize = inText;
      type = ch == ">" ? "endTag" : "selfcloseTag";
      return "tag bracket";
    } else if (ch == "=") {
      type = "equals";
      return null;
    } else if (ch == "<") {
      state.tokenize = inText;
      state.state = baseState;
      state.tagName = state.tagStart = null;
      var next = state.tokenize(stream, state);
      return next ? next + " tag error" : "tag error";
    } else if (/[\'\"]/.test(ch)) {
      state.tokenize = inAttribute(ch);
      state.stringStartCol = stream.column();
      return state.tokenize(stream, state);
    } else {
      stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
      return "word";
    }
  }

  function inAttribute(quote) {
    var closure = function(stream, state) {
      while (!stream.eol()) {
        if (stream.next() == quote) {
          state.tokenize = inTag;
          break;
        }
      }
      return "string";
    };
    closure.isInAttribute = true;
    return closure;
  }

  function inBlock(style, terminator) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.match(terminator)) {
          state.tokenize = inText;
          break;
        }
        stream.next();
      }
      return style;
    };
  }
  function doctype(depth) {
    return function(stream, state) {
      var ch;
      while ((ch = stream.next()) != null) {
        if (ch == "<") {
          state.tokenize = doctype(depth + 1);
          return state.tokenize(stream, state);
        } else if (ch == ">") {
          if (depth == 1) {
            state.tokenize = inText;
            break;
          } else {
            state.tokenize = doctype(depth - 1);
            return state.tokenize(stream, state);
          }
        }
      }
      return "meta";
    };
  }

  function Context(state, tagName, startOfLine) {
    this.prev = state.context;
    this.tagName = tagName;
    this.indent = state.indented;
    this.startOfLine = startOfLine;
    if (config.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
      this.noIndent = true;
  }
  function popContext(state) {
    if (state.context) state.context = state.context.prev;
  }
  function maybePopContext(state, nextTagName) {
    var parentTagName;
    while (true) {
      if (!state.context) {
        return;
      }
      parentTagName = state.context.tagName;
      if (!config.contextGrabbers.hasOwnProperty(parentTagName) ||
          !config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) {
        return;
      }
      popContext(state);
    }
  }

  function baseState(type, stream, state) {
    if (type == "openTag") {
      state.tagStart = stream.column();
      return tagNameState;
    } else if (type == "closeTag") {
      return closeTagNameState;
    } else {
      return baseState;
    }
  }
  function tagNameState(type, stream, state) {
    if (type == "word") {
      state.tagName = stream.current();
      setStyle = "tag";
      return attrState;
    } else if (config.allowMissingTagName && type == "endTag") {
      setStyle = "tag bracket";
      return attrState(type, stream, state);
    } else {
      setStyle = "error";
      return tagNameState;
    }
  }
  function closeTagNameState(type, stream, state) {
    if (type == "word") {
      var tagName = stream.current();
      if (state.context && state.context.tagName != tagName &&
          config.implicitlyClosed.hasOwnProperty(state.context.tagName))
        popContext(state);
      if ((state.context && state.context.tagName == tagName) || config.matchClosing === false) {
        setStyle = "tag";
        return closeState;
      } else {
        setStyle = "tag error";
        return closeStateErr;
      }
    } else if (config.allowMissingTagName && type == "endTag") {
      setStyle = "tag bracket";
      return closeState(type, stream, state);
    } else {
      setStyle = "error";
      return closeStateErr;
    }
  }

  function closeState(type, _stream, state) {
    if (type != "endTag") {
      setStyle = "error";
      return closeState;
    }
    popContext(state);
    return baseState;
  }
  function closeStateErr(type, stream, state) {
    setStyle = "error";
    return closeState(type, stream, state);
  }

  function attrState(type, _stream, state) {
    if (type == "word") {
      setStyle = "attribute";
      return attrEqState;
    } else if (type == "endTag" || type == "selfcloseTag") {
      var tagName = state.tagName, tagStart = state.tagStart;
      state.tagName = state.tagStart = null;
      if (type == "selfcloseTag" ||
          config.autoSelfClosers.hasOwnProperty(tagName)) {
        maybePopContext(state, tagName);
      } else {
        maybePopContext(state, tagName);
        state.context = new Context(state, tagName, tagStart == state.indented);
      }
      return baseState;
    }
    setStyle = "error";
    return attrState;
  }
  function attrEqState(type, stream, state) {
    if (type == "equals") return attrValueState;
    if (!config.allowMissing) setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrValueState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    if (type == "word" && config.allowUnquoted) {setStyle = "string"; return attrState;}
    setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrContinuedState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    return attrState(type, stream, state);
  }

  return {
    startState: function(baseIndent) {
      var state = {tokenize: inText,
                   state: baseState,
                   indented: baseIndent || 0,
                   tagName: null, tagStart: null,
                   context: null}
      if (baseIndent != null) state.baseIndent = baseIndent
      return state
    },

    token: function(stream, state) {
      if (!state.tagName && stream.sol())
        state.indented = stream.indentation();

      if (stream.eatSpace()) return null;
      type = null;
      var style = state.tokenize(stream, state);
      if ((style || type) && style != "comment") {
        setStyle = null;
        state.state = state.state(type || style, stream, state);
        if (setStyle)
          style = setStyle == "error" ? style + " error" : setStyle;
      }
      return style;
    },

    indent: function(state, textAfter, fullLine) {
      var context = state.context;
      // Indent multi-line strings (e.g. css).
      if (state.tokenize.isInAttribute) {
        if (state.tagStart == state.indented)
          return state.stringStartCol + 1;
        else
          return state.indented + indentUnit;
      }
      if (context && context.noIndent) return CodeMirror.Pass;
      if (state.tokenize != inTag && state.tokenize != inText)
        return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
      // Indent the starts of attribute names.
      if (state.tagName) {
        if (config.multilineTagIndentPastTag !== false)
          return state.tagStart + state.tagName.length + 2;
        else
          return state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
      }
      if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
      if (tagAfter && tagAfter[1]) { // Closing tag spotted
        while (context) {
          if (context.tagName == tagAfter[2]) {
            context = context.prev;
            break;
          } else if (config.implicitlyClosed.hasOwnProperty(context.tagName)) {
            context = context.prev;
          } else {
            break;
          }
        }
      } else if (tagAfter) { // Opening tag spotted
        while (context) {
          var grabbers = config.contextGrabbers[context.tagName];
          if (grabbers && grabbers.hasOwnProperty(tagAfter[2]))
            context = context.prev;
          else
            break;
        }
      }
      while (context && context.prev && !context.startOfLine)
        context = context.prev;
      if (context) return context.indent + indentUnit;
      else return state.baseIndent || 0;
    },

    electricInput: /<\/[\s\w:]+>$/,
    blockCommentStart: "<!--",
    blockCommentEnd: "-->",

    configuration: config.htmlMode ? "html" : "xml",
    helperType: config.htmlMode ? "html" : "xml",

    skipAttribute: function(state) {
      if (state.state == attrValueState)
        state.state = attrState
    }
  };
});

CodeMirror.defineMIME("text/xml", "xml");
CodeMirror.defineMIME("application/xml", "xml");
if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
  CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

});


/***/ }),

/***/ 178:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Displays a message from the flashed session data
 *
 * use $request->session()->put('message', trans('messages.item_saved'));
 *     $request->session()->put('type', 'success');
 * to set message text and type
 */
exports.displayMessage = function (message, type) {
	var html = '<div id="javascriptMessage" class="alert fade in alert-dismissable alert-' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">' + message + '</span></div>';
	$('#message').append(html);
	setTimeout(function () {
		$("#javascriptMessage").alert('close');
	}, 3000);
};

/*
exports.ajaxcrsf = function(){
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
};
*/

/**
 * Clears errors on forms by removing error classes
 */
exports.clearFormErrors = function () {
	$('.form-group').each(function () {
		$(this).removeClass('has-error');
		$(this).find('.help-block').text('');
	});
};

/**
 * Sets errors on forms based on response JSON
 */
exports.setFormErrors = function (json) {
	exports.clearFormErrors();
	$.each(json, function (key, value) {
		$('#' + key).parents('.form-group').addClass('has-error');
		$('#' + key + 'help').text(value.join(' '));
	});
};

/**
 * Checks for messages in the flash data. Must be called explicitly by the page
 */
exports.checkMessage = function () {
	if ($('#message_flash').length) {
		var message = $('#message_flash').val();
		var type = $('#message_type_flash').val();
		exports.displayMessage(message, type);
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ })

},[138]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3N0dWRlbnRjYWxlbmRhci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3M/NmQxMCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQXBwIiwiYWN0aW9ucyIsImluZGV4IiwiQWR2aXNpbmdDb250cm9sbGVyIiwiZ2V0SW5kZXgiLCJzdHVkZW50Y2FsZW5kYXIiLCJpbml0IiwiR3JvdXBzZXNzaW9uQ29udHJvbGxlciIsImVkaXRhYmxlIiwiY29udHJvbGxlciIsImFjdGlvbiIsIndpbmRvdyIsIl8iLCIkIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJjb250ZW50IiwiY29uc29sZSIsImVycm9yIiwiZXhwb3J0cyIsImNhbGVuZGFyIiwic2l0ZSIsImNoZWNrTWVzc2FnZSIsImNhbGVuZGFyRGF0YSIsImV2ZW50U291cmNlcyIsImRhdGEiLCJpZCIsImNhbGVuZGFyQWR2aXNvcklEIiwicmVuZGVyaW5nIiwiZXZlbnRSZW5kZXIiLCJldmVudCIsImVsZW1lbnQiLCJ0eXBlIiwiYXBwZW5kIiwidGl0bGUiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3RhcnQiLCJpc0FmdGVyIiwibW9tZW50Iiwic2hvd01lZXRpbmdGb3JtIiwiYWxlcnQiLCJzZWxlY3QiLCJzdHVkZW50U2VsZWN0Iiwid2lkdGgiLCJkZWZhdWx0VmlldyIsImZ1bGxDYWxlbmRhciIsImNhbGVuZGFyU2Vzc2lvbiIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwiZW5kIiwiZG93Iiwidmlld3MiLCJhZ2VuZGEiLCJhbGxEYXlTbG90Iiwic2xvdER1cmF0aW9uIiwibWluVGltZSIsIm1heFRpbWUiLCJ1cmwiLCJjb2xvciIsInRleHRDb2xvciIsInNlbGVjdGFibGUiLCJzZWxlY3RIZWxwZXIiLCJzZWxlY3RPdmVybGFwIiwidGltZUZvcm1hdCIsImRhdGVQaWNrZXJEYXRhIiwiZGF5c09mV2Vla0Rpc2FibGVkIiwiZm9ybWF0Iiwic3RlcHBpbmciLCJlbmFibGVkSG91cnMiLCJtYXhIb3VyIiwic2lkZUJ5U2lkZSIsImlnbm9yZVJlYWRvbmx5IiwiYWxsb3dJbnB1dFRvZ2dsZSIsImRhdGVQaWNrZXJEYXRlT25seSIsImFkdmlzb3IiLCJub2JpbmQiLCJ2YWwiLCJ0cmltIiwib24iLCJmb2N1cyIsInByb3AiLCJyZW1vdmVDbGFzcyIsInNob3ciLCJyZXNldEZvcm0iLCJoaWRlIiwic2VsZiIsImJpbmQiLCJzYXZlTWVldGluZyIsImRlbGV0ZU1lZXRpbmciLCJjaGFuZ2VEdXJhdGlvbiIsImRlc2MiLCJzdGF0dXMiLCJtZWV0aW5naWQiLCJzdHVkZW50aWQiLCJwb3N0IiwidGhlbiIsInJlc3BvbnNlIiwibW9kYWwiLCJkaXNwbGF5TWVzc2FnZSIsImNhdGNoIiwic2V0Rm9ybUVycm9ycyIsImNob2ljZSIsImNvbmZpcm0iLCJkdXJhdGlvbk9wdGlvbnMiLCJzdHVkZW50X2lkIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJ1bmRlZmluZWQiLCJob3VyIiwibWludXRlIiwiZmluZCIsInJlc2V0IiwiY2xlYXJGb3JtRXJyb3JzIiwiZW1wdHkiLCJtaW51dGVzIiwiZGlmZiIsImxpbmtEYXRlUGlja2VycyIsImVsZW0xIiwiZWxlbTIiLCJkdXJhdGlvbiIsImUiLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZWFjaCIsImNsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJzdW1tZXJub3RlIiwidG9vbGJhciIsInRhYnNpemUiLCJjb2RlbWlycm9yIiwibW9kZSIsImh0bWxNb2RlIiwibGluZU51bWJlcnMiLCJ0aGVtZSIsImh0bWxTdHJpbmciLCJjb250ZW50cyIsImxvY2F0aW9uIiwicmVsb2FkIiwibWVzc2FnZSIsImh0bWwiLCJzZXRUaW1lb3V0IiwidGV4dCIsImpzb24iLCJrZXkiLCJ2YWx1ZSIsInBhcmVudHMiLCJqb2luIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBQUEsQ0FBUSxHQUFSOztBQUVBLElBQUlDLE1BQU07O0FBRVQ7QUFDQUMsVUFBUztBQUNSO0FBQ0FDLFNBQU87QUFDTkEsVUFBTyxpQkFBVztBQUNqQjtBQUNBO0FBSEssR0FGQzs7QUFRUjtBQUNBQyxzQkFBb0I7QUFDbkI7QUFDQUMsYUFBVSxvQkFBVztBQUNwQixRQUFJQyxrQkFBa0IsbUJBQUFOLENBQVEsR0FBUixDQUF0QjtBQUNBTSxvQkFBZ0JDLElBQWhCO0FBQ0E7QUFMa0IsR0FUWjs7QUFpQlI7QUFDRUMsMEJBQXdCO0FBQ3pCO0FBQ0dILGFBQVUsb0JBQVc7QUFDbkIsUUFBSUksV0FBVyxtQkFBQVQsQ0FBUSxHQUFSLENBQWY7QUFDSlMsYUFBU0YsSUFBVDtBQUNHO0FBTHFCO0FBbEJsQixFQUhBOztBQThCVDtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxPQUFN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QTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlELG9CQUFvQjtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsT0FBTyxxQkFBcUI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsNEJBQTRCOztBQUVsRSxDQUFDOzs7Ozs7OztBQ2haRCx5Qzs7Ozs7OztBQ0FBOzs7Ozs7O0FBT0FoQixRQUFRd0YsY0FBUixHQUF5QixVQUFTOEMsT0FBVCxFQUFrQnpILElBQWxCLEVBQXVCO0FBQy9DLEtBQUkwSCxPQUFPLDhFQUE4RTFILElBQTlFLEdBQXFGLGlKQUFyRixHQUF5T3lILE9BQXpPLEdBQW1QLGVBQTlQO0FBQ0FsSixHQUFFLFVBQUYsRUFBYzBCLE1BQWQsQ0FBcUJ5SCxJQUFyQjtBQUNBQyxZQUFXLFlBQVc7QUFDckJwSixJQUFFLG9CQUFGLEVBQXdCbUMsS0FBeEIsQ0FBOEIsT0FBOUI7QUFDQSxFQUZELEVBRUcsSUFGSDtBQUdBLENBTkQ7O0FBUUE7Ozs7Ozs7Ozs7QUFVQTs7O0FBR0F2QixRQUFRcUcsZUFBUixHQUEwQixZQUFVO0FBQ25DakgsR0FBRSxhQUFGLEVBQWlCa0ksSUFBakIsQ0FBc0IsWUFBVztBQUNoQ2xJLElBQUUsSUFBRixFQUFRbUYsV0FBUixDQUFvQixXQUFwQjtBQUNBbkYsSUFBRSxJQUFGLEVBQVErRyxJQUFSLENBQWEsYUFBYixFQUE0QnNDLElBQTVCLENBQWlDLEVBQWpDO0FBQ0EsRUFIRDtBQUlBLENBTEQ7O0FBT0E7OztBQUdBekksUUFBUTBGLGFBQVIsR0FBd0IsVUFBU2dELElBQVQsRUFBYztBQUNyQzFJLFNBQVFxRyxlQUFSO0FBQ0FqSCxHQUFFa0ksSUFBRixDQUFPb0IsSUFBUCxFQUFhLFVBQVVDLEdBQVYsRUFBZUMsS0FBZixFQUFzQjtBQUNsQ3hKLElBQUUsTUFBTXVKLEdBQVIsRUFBYUUsT0FBYixDQUFxQixhQUFyQixFQUFvQzdILFFBQXBDLENBQTZDLFdBQTdDO0FBQ0E1QixJQUFFLE1BQU11SixHQUFOLEdBQVksTUFBZCxFQUFzQkYsSUFBdEIsQ0FBMkJHLE1BQU1FLElBQU4sQ0FBVyxHQUFYLENBQTNCO0FBQ0EsRUFIRDtBQUlBLENBTkQ7O0FBUUE7OztBQUdBOUksUUFBUUcsWUFBUixHQUF1QixZQUFVO0FBQ2hDLEtBQUdmLEVBQUUsZ0JBQUYsRUFBb0IySixNQUF2QixFQUE4QjtBQUM3QixNQUFJVCxVQUFVbEosRUFBRSxnQkFBRixFQUFvQjhFLEdBQXBCLEVBQWQ7QUFDQSxNQUFJckQsT0FBT3pCLEVBQUUscUJBQUYsRUFBeUI4RSxHQUF6QixFQUFYO0FBQ0FsRSxVQUFRd0YsY0FBUixDQUF1QjhDLE9BQXZCLEVBQWdDekgsSUFBaEM7QUFDQTtBQUNELENBTkQsQyIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9odHRwczovL2xhcmF2ZWwuY29tL2RvY3MvNS40L21peCN3b3JraW5nLXdpdGgtc2NyaXB0c1xuLy9odHRwczovL2FuZHktY2FydGVyLmNvbS9ibG9nL3Njb3BpbmctamF2YXNjcmlwdC1mdW5jdGlvbmFsaXR5LXRvLXNwZWNpZmljLXBhZ2VzLXdpdGgtbGFyYXZlbC1hbmQtY2FrZXBocFxuXG4vL0xvYWQgc2l0ZS13aWRlIGxpYnJhcmllcyBpbiBib290c3RyYXAgZmlsZVxucmVxdWlyZSgnLi9ib290c3RyYXAnKTtcblxudmFyIEFwcCA9IHtcblxuXHQvLyBDb250cm9sbGVyLWFjdGlvbiBtZXRob2RzXG5cdGFjdGlvbnM6IHtcblx0XHQvL0luZGV4IGZvciBkaXJlY3RseSBjcmVhdGVkIHZpZXdzIHdpdGggbm8gZXhwbGljaXQgY29udHJvbGxlclxuXHRcdGluZGV4OiB7XG5cdFx0XHRpbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vbm8gZGVmYXVsdCBqYXZhc2NyaXB0cyBvbiBob21lIHBhZ2VzP1xuXHRcdFx0fSxcbiAgICB9LFxuXG5cdFx0Ly9BZHZpc2luZyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkdmlzaW5nXG5cdFx0QWR2aXNpbmdDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkdmlzaW5nL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50Y2FsZW5kYXIgPSByZXF1aXJlKCcuL3BhZ2VzL3N0dWRlbnRjYWxlbmRhcicpO1xuXHRcdFx0XHRzdHVkZW50Y2FsZW5kYXIuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0dyb3Vwc2Vzc2lvbiBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2dyb3Vwc2Vzc2lvblxuICAgIEdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXI6IHtcblx0XHRcdC8vZ3JvdXBzZXNzaW9uL2luZGV4XG4gICAgICBnZXRJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG4gICAgICB9LFxuXHRcdH0sXG5cdH0sXG5cblx0Ly9GdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBieSB0aGUgcGFnZSBhdCBsb2FkLiBEZWZpbmVkIGluIHJlc291cmNlcy92aWV3cy9pbmNsdWRlcy9zY3JpcHRzLmJsYWRlLnBocFxuXHQvL2FuZCBBcHAvSHR0cC9WaWV3Q29tcG9zZXJzL0phdmFzY3JpcHQgQ29tcG9zZXJcblx0Ly9TZWUgbGlua3MgYXQgdG9wIG9mIGZpbGUgZm9yIGRlc2NyaXB0aW9uIG9mIHdoYXQncyBnb2luZyBvbiBoZXJlXG5cdC8vQXNzdW1lcyAyIGlucHV0cyAtIHRoZSBjb250cm9sbGVyIGFuZCBhY3Rpb24gdGhhdCBjcmVhdGVkIHRoaXMgcGFnZVxuXHRpbml0OiBmdW5jdGlvbihjb250cm9sbGVyLCBhY3Rpb24pIHtcblx0XHRpZiAodHlwZW9mIHRoaXMuYWN0aW9uc1tjb250cm9sbGVyXSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRoaXMuYWN0aW9uc1tjb250cm9sbGVyXVthY3Rpb25dICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly9jYWxsIHRoZSBtYXRjaGluZyBmdW5jdGlvbiBpbiB0aGUgYXJyYXkgYWJvdmVcblx0XHRcdHJldHVybiBBcHAuYWN0aW9uc1tjb250cm9sbGVyXVthY3Rpb25dKCk7XG5cdFx0fVxuXHR9LFxufTtcblxuLy9CaW5kIHRvIHRoZSB3aW5kb3dcbndpbmRvdy5BcHAgPSBBcHA7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndpbmRvdy5fID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8qKlxuICogV2UnbGwgbG9hZCBqUXVlcnkgYW5kIHRoZSBCb290c3RyYXAgalF1ZXJ5IHBsdWdpbiB3aGljaCBwcm92aWRlcyBzdXBwb3J0XG4gKiBmb3IgSmF2YVNjcmlwdCBiYXNlZCBCb290c3RyYXAgZmVhdHVyZXMgc3VjaCBhcyBtb2RhbHMgYW5kIHRhYnMuIFRoaXNcbiAqIGNvZGUgbWF5IGJlIG1vZGlmaWVkIHRvIGZpdCB0aGUgc3BlY2lmaWMgbmVlZHMgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAqL1xuXG53aW5kb3cuJCA9IHdpbmRvdy5qUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcblxucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG5cbi8qKlxuICogVnVlIGlzIGEgbW9kZXJuIEphdmFTY3JpcHQgbGlicmFyeSBmb3IgYnVpbGRpbmcgaW50ZXJhY3RpdmUgd2ViIGludGVyZmFjZXNcbiAqIHVzaW5nIHJlYWN0aXZlIGRhdGEgYmluZGluZyBhbmQgcmV1c2FibGUgY29tcG9uZW50cy4gVnVlJ3MgQVBJIGlzIGNsZWFuXG4gKiBhbmQgc2ltcGxlLCBsZWF2aW5nIHlvdSB0byBmb2N1cyBvbiBidWlsZGluZyB5b3VyIG5leHQgZ3JlYXQgcHJvamVjdC5cbiAqL1xuXG4vLyB3aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG5cbi8qKlxuICogV2UnbGwgbG9hZCB0aGUgYXhpb3MgSFRUUCBsaWJyYXJ5IHdoaWNoIGFsbG93cyB1cyB0byBlYXNpbHkgaXNzdWUgcmVxdWVzdHNcbiAqIHRvIG91ciBMYXJhdmVsIGJhY2stZW5kLiBUaGlzIGxpYnJhcnkgYXV0b21hdGljYWxseSBoYW5kbGVzIHNlbmRpbmcgdGhlXG4gKiBDU1JGIHRva2VuIGFzIGEgaGVhZGVyIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgXCJYU1JGXCIgdG9rZW4gY29va2llLlxuICovXG5cbndpbmRvdy5heGlvcyA9IHJlcXVpcmUoJ2F4aW9zJyk7XG5cbi8vaHR0cHM6Ly9naXRodWIuY29tL3JhcHBhc29mdC9sYXJhdmVsLTUtYm9pbGVycGxhdGUvYmxvYi9tYXN0ZXIvcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanNcbndpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuLyoqXG4gKiBOZXh0IHdlIHdpbGwgcmVnaXN0ZXIgdGhlIENTUkYgVG9rZW4gYXMgYSBjb21tb24gaGVhZGVyIHdpdGggQXhpb3Mgc28gdGhhdFxuICogYWxsIG91dGdvaW5nIEhUVFAgcmVxdWVzdHMgYXV0b21hdGljYWxseSBoYXZlIGl0IGF0dGFjaGVkLiBUaGlzIGlzIGp1c3RcbiAqIGEgc2ltcGxlIGNvbnZlbmllbmNlIHNvIHdlIGRvbid0IGhhdmUgdG8gYXR0YWNoIGV2ZXJ5IHRva2VuIG1hbnVhbGx5LlxuICovXG5cbmxldCB0b2tlbiA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpO1xuXG5pZiAodG9rZW4pIHtcbiAgICB3aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtQ1NSRi1UT0tFTiddID0gdG9rZW4uY29udGVudDtcbn0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcignQ1NSRiB0b2tlbiBub3QgZm91bmQ6IGh0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy9jc3JmI2NzcmYteC1jc3JmLXRva2VuJyk7XG59XG5cbi8qKlxuICogRWNobyBleHBvc2VzIGFuIGV4cHJlc3NpdmUgQVBJIGZvciBzdWJzY3JpYmluZyB0byBjaGFubmVscyBhbmQgbGlzdGVuaW5nXG4gKiBmb3IgZXZlbnRzIHRoYXQgYXJlIGJyb2FkY2FzdCBieSBMYXJhdmVsLiBFY2hvIGFuZCBldmVudCBicm9hZGNhc3RpbmdcbiAqIGFsbG93cyB5b3VyIHRlYW0gdG8gZWFzaWx5IGJ1aWxkIHJvYnVzdCByZWFsLXRpbWUgd2ViIGFwcGxpY2F0aW9ucy5cbiAqL1xuXG4vLyBpbXBvcnQgRWNobyBmcm9tICdsYXJhdmVsLWVjaG8nXG5cbi8vIHdpbmRvdy5QdXNoZXIgPSByZXF1aXJlKCdwdXNoZXItanMnKTtcblxuLy8gd2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG4vLyAgICAgYnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuLy8gICAgIGtleTogJ3lvdXItcHVzaGVyLWtleSdcbi8vIH0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCJleHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIC8vTG9hZCByZXF1aXJlZCBsaWJyYXJpZXNcbiAgY2FsZW5kYXIgPSByZXF1aXJlKCcuLi91dGlsL2NhbGVuZGFyJyk7XG4gIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcblxuICAvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbm4gZnJvbSBhIHByZXZpb3VzIGFjdGlvblxuXHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG4gIC8vSW5pdGlhbGl6ZSB0aGUgY2FsZW5kYXIgbGlicmFyeSBhcyBhIHN0dWRlbnQgdmlld1xuXHRjYWxlbmRhci5pbml0KGZhbHNlKTtcblxuICAvL1NldCB0aGUgYWR2aXNvciBpbmZvcm1hdGlvbiBmb3IgbWVldGluZyBldmVudCBzb3VyY2VcbiAgY2FsZW5kYXIuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1swXS5kYXRhID0ge2lkOiBjYWxlbmRhci5jYWxlbmRhckFkdmlzb3JJRH07XG5cbiAgLy9TZXQgdGhlIGFkdnNpb3IgaW5mb3JhbXRpb24gZm9yIGJsYWNrb3V0IGV2ZW50IHNvdXJjZVxuICBjYWxlbmRhci5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLmRhdGEgPSB7aWQ6IGNhbGVuZGFyLmNhbGVuZGFyQWR2aXNvcklEfTtcbiAgLy9SZW5kZXIgYmxhY2tvdXRzIHRvIGJhY2tncm91bmRcbiAgY2FsZW5kYXIuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG5cbiAgLy9XaGVuIHJlbmRlcmluZywgdXNlIHRoaXMgY3VzdG9tIGZ1bmN0aW9uIGZvciBibGFja291dHMgYW5kIHN0dWRlbnQgbWVldGluZ3NcbiAgY2FsZW5kYXIuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcbiAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuICAgIH1cblx0fTtcblxuICAvL1VzZSB0aGlzIG1ldGhvZCBmb3IgY2xpY2tpbmcgb24gbWVldGluZ3Ncblx0Y2FsZW5kYXIuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0aWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdFx0aWYoZXZlbnQuc3RhcnQuaXNBZnRlcihtb21lbnQoKSkpe1xuXHRcdFx0XHRjYWxlbmRhci5zaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGFsZXJ0KFwiWW91IGNhbm5vdCBlZGl0IG1lZXRpbmdzIGluIHRoZSBwYXN0XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuICAvL1doZW4gc2VsZWN0aW5nIG5ldyBhcmVhcywgdXNlIHRoZSBzdHVkZW50U2VsZWN0IG1ldGhvZCBpbiB0aGUgY2FsZW5kYXIgbGlicmFyeVxuXHRjYWxlbmRhci5jYWxlbmRhckRhdGEuc2VsZWN0ID0gY2FsZW5kYXIuc3R1ZGVudFNlbGVjdDtcblxuICAvL2lmIHRoZSB3aW5kb3cgaXMgc21hbGwsIHNldCBkaWZmZXJlbnQgZGVmYXVsdCBmb3IgY2FsZW5kYXJcblx0aWYoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApe1xuXHRcdGNhbGVuZGFyLmNhbGVuZGFyRGF0YS5kZWZhdWx0VmlldyA9ICdhZ2VuZGFEYXknO1xuXHR9XG5cbiAgLy9pbml0YWxpemUgdGhlIGNhbGVuZGFyIVxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoY2FsZW5kYXIuY2FsZW5kYXJEYXRhKTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3N0dWRlbnRjYWxlbmRhci5qcyIsIi8vbG9hZCByZXF1aXJlZCBKUyBsaWJyYXJpZXNcbnJlcXVpcmUoJ2Z1bGxjYWxlbmRhcicpO1xucmVxdWlyZSgnanF1ZXJ5LWF1dG9jb21wbGV0ZScpO1xubW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5zaXRlID0gcmVxdWlyZSgnLi9zaXRlJyk7XG5yZXF1aXJlKCdlb25hc2Rhbi1ib290c3RyYXAtZGF0ZXRpbWVwaWNrZXItcnVzc2ZlbGQnKTtcblxuLy9TZXNzaW9uIGZvciBzdG9yaW5nIGRhdGEgYmV0d2VlbiBmb3Jtc1xuZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblxuLy9JRCBvZiB0aGUgY3VycmVudGx5IGxvYWRlZCBjYWxlbmRhcidzIGFkdmlzb3JcbmV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAtMTtcblxuLy9TdHVkZW50J3MgTmFtZSBzZXQgYnkgaW5pdFxuZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gXCJcIjtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuZXhwb3J0cy5jYWxlbmRhckRhdGEgPSB7XG5cdGhlYWRlcjoge1xuXHRcdGxlZnQ6ICdwcmV2LG5leHQgdG9kYXknLFxuXHRcdGNlbnRlcjogJ3RpdGxlJyxcblx0XHRyaWdodDogJ2FnZW5kYVdlZWssYWdlbmRhRGF5J1xuXHR9LFxuXHRlZGl0YWJsZTogZmFsc2UsXG5cdGV2ZW50TGltaXQ6IHRydWUsXG5cdGhlaWdodDogJ2F1dG8nLFxuXHR3ZWVrZW5kczogZmFsc2UsXG5cdGJ1c2luZXNzSG91cnM6IHtcblx0XHRzdGFydDogJzg6MDAnLCAvLyBhIHN0YXJ0IHRpbWUgKDEwYW0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGVuZDogJzE3OjAwJywgLy8gYW4gZW5kIHRpbWUgKDZwbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZG93OiBbIDEsIDIsIDMsIDQsIDUgXVxuXHR9LFxuXHRkZWZhdWx0VmlldzogJ2FnZW5kYVdlZWsnLFxuXHR2aWV3czoge1xuXHRcdGFnZW5kYToge1xuXHRcdFx0YWxsRGF5U2xvdDogZmFsc2UsXG5cdFx0XHRzbG90RHVyYXRpb246ICcwMDoyMDowMCcsXG5cdFx0XHRtaW5UaW1lOiAnMDg6MDA6MDAnLFxuXHRcdFx0bWF4VGltZTogJzE3OjAwOjAwJ1xuXHRcdH1cblx0fSxcblx0ZXZlbnRTb3VyY2VzOiBbXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL21lZXRpbmdmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgbWVldGluZyBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnIzUxMjg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICd3aGl0ZScsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvYmxhY2tvdXRmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgYmxhY2tvdXQgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyNGRjg4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnYmxhY2snLFxuXHRcdH0sXG5cdF0sXG5cdHNlbGVjdGFibGU6IHRydWUsXG5cdHNlbGVjdEhlbHBlcjogdHJ1ZSxcblx0c2VsZWN0T3ZlcmxhcDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRyZXR1cm4gZXZlbnQucmVuZGVyaW5nID09PSAnYmFja2dyb3VuZCc7XG5cdH0sXG5cdHRpbWVGb3JtYXQ6ICcgJyxcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlXG5leHBvcnRzLmRhdGVQaWNrZXJEYXRhID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ0xMTCcsXG5cdFx0c3RlcHBpbmc6IDIwLFxuXHRcdGVuYWJsZWRIb3VyczogWzgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxN10sXG5cdFx0bWF4SG91cjogMTcsXG5cdFx0c2lkZUJ5U2lkZTogdHJ1ZSxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZSBkYXkgb25seVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTU0vREQvWVlZWScsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLyoqXG4gKiBJbml0aWFsemF0aW9uIGZ1bmN0aW9uIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gYWR2aXNvciAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgdXNlciBpcyBhbiBhZHZpc29yXG4gKiBAcGFyYW0gbm9iaW5kIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSBidXR0b25zIHNob3VsZCBub3QgYmUgYm91bmQgKG1ha2UgY2FsZW5kYXIgcmVhZC1vbmx5KVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihhZHZpc29yLCBub2JpbmQpe1xuXG5cdC8vdHdlYWsgcGFyYW1ldGVyc1xuXHRhZHZpc29yIHx8IChhZHZpc29yID0gZmFsc2UpO1xuXHRub2JpbmQgfHwgKG5vYmluZCA9IGZhbHNlKTtcblxuXHQvL2dldCB0aGUgY3VycmVudCBhZHZpc29yJ3MgSURcblx0ZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9ICQoJyNjYWxlbmRhckFkdmlzb3JJRCcpLnZhbCgpLnRyaW0oKTtcblxuXHQvL0lmIG5vYmluZCwgZG9uJ3QgYmluZCB0aGUgZm9ybXNcblx0aWYoIW5vYmluZCl7XG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIGFuIGFkdmlzb3IsIGJpbmQgbW9yZSBkYXRhXG5cdFx0aWYoYWR2aXNvcil7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyN0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0X3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI2VuZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI2VuZF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5zaG93KCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2Jykuc2hvdygpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBub3QgYW4gYWR2aXNvciwgYmluZCBsZXNzIGRhdGFcblx0XHR9ZWxzZXtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2Rlc2MnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKFwiI2VuZFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNlbmRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHRcdFx0Ly9HZXQgdGhlIGN1cnJlbnQgc3R1ZGVudCdzIG5hbWVcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9ICQoJyNjYWxlbmRhclN0dWRlbnROYW1lJykudmFsKCkudHJpbSgpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcubW9kYWwnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgc2VsZi5yZXNldEZvcm0pO1xuXHRcdH1cblxuXHRcdC8vQmluZCBjbGljayBoYW5kbGVycyBvbiB0aGUgZm9ybVxuXHRcdCQoJyNzYXZlQnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlTWVldGluZyk7XG5cdFx0JCgnI2RlbGV0ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlTWVldGluZyk7XG5cdFx0JCgnI2R1cmF0aW9uJykub24oJ2NoYW5nZScsIGNoYW5nZUR1cmF0aW9uKTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgYSBtZWV0aW5nXG4gKi9cbnZhciBzYXZlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVFdmVudFNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3Rcblx0dmFyIGRhdGEgPSB7XG5cdFx0c3RhcnQ6IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0ZW5kOiBtb21lbnQoJCgnI2VuZCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHR0aXRsZTogJCgnI3RpdGxlJykudmFsKCksXG5cdFx0ZGVzYzogJCgnI2Rlc2MnKS52YWwoKSxcblx0XHRzdGF0dXM6ICQoJyNzdGF0dXMnKS52YWwoKVxuXHR9O1xuXHRkYXRhLmlkID0gZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRDtcblx0aWYoJCgnI21lZXRpbmdJRCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5tZWV0aW5naWQgPSAkKCcjbWVldGluZ0lEJykudmFsKCk7XG5cdH1cblx0aWYoJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5zdHVkZW50aWQgPSAkKCcjc3R1ZGVudGlkdmFsJykudmFsKCk7XG5cdH1cblxuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0d2luZG93LmF4aW9zLnBvc3QoJy9hZHZpc2luZy9jcmVhdGVtZWV0aW5nJywgZGF0YSlcblx0ICAvL2lmIHJlc3BvbnNlIGlzIDJ4eFxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdC8vaGlkZSB0aGUgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ2hpZGUnKTtcblxuXHRcdFx0Ly9kaXNwbGF5IHRoZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHRcdFx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHQkKCcjY3JlYXRlRXZlbnRTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdH0pXG5cdFx0Ly9pZiByZXNwb25zZSBpcyBub3QgMnh4XG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdHNpdGUuc2V0Rm9ybUVycm9ycyhlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBtZWV0aW5nOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vaGlkZSBzcGlubmluZyBpY29uXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnRTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdH0pO1xuXG5cdC8qXG5cdCQuYWpheCh7XG5cdCAgbWV0aG9kOiBcIlBPU1RcIixcblx0ICB1cmw6ICcvYWR2aXNpbmcvY3JlYXRlbWVldGluZycsXG5cdCAgZGF0YTogZGF0YVxuXHR9KVxuXHQuc3VjY2VzcyhmdW5jdGlvbiggbWVzc2FnZSApIHtcblx0XHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnaGlkZScpO1xuXHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgXCJzdWNjZXNzXCIpO1xuXHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0XHQkKCcjY3JlYXRlRXZlbnRTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9KS5mYWlsKGZ1bmN0aW9uKCBqcVhIUiwgbWVzc2FnZSApe1xuXHRcdGlmIChqcVhIUi5zdGF0dXMgPT0gNDIyKVxuXHRcdHtcblx0XHRcdHNpdGUuc2V0Rm9ybUVycm9ycyhqcVhIUi5yZXNwb25zZUpTT04pO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBtZWV0aW5nOiBcIiArIGpxWEhSLnJlc3BvbnNlSlNPTik7XG5cdFx0fVxuXHRcdCQoJyNjcmVhdGVFdmVudFNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdH0pO1xuXHQqL1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYSBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uXG5cdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblxuXHRcdC8vaWYgY29uZmlybWVkLCBzaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjY3JlYXRlRXZlbnRTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9tYWtlIEFKQVggcmVxdWVzdCB0byBkZWxldGVcblx0XHR3aW5kb3cuYXhpb3MucG9zdCgnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnLCB7XG5cdFx0XHQgbWVldGluZ2lkOiAkKCcjbWVldGluZ0lEJykudmFsKClcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdC8vaGlkZSB0aGUgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ2hpZGUnKTtcblxuXHRcdFx0Ly9kaXNwbGF5IHRoZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHRcdFx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHQkKCcjY3JlYXRlRXZlbnRTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIHNhdmUgbWVldGluZzogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblxuXHRcdFx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0XHRcdCQoJyNjcmVhdGVFdmVudFNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0fSk7XG5cblx0XHQvKlxuXHRcdCQuYWpheCh7XG5cdFx0ICBtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdCAgdXJsOiAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnLFxuXHRcdCAgZGF0YTogeyBtZWV0aW5naWQ6ICQoJyNtZWV0aW5nSUQnKS52YWwoKSB9XG5cdFx0fSlcblx0XHQuc3VjY2VzcyhmdW5jdGlvbiggbWVzc2FnZSApIHtcblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIFwic3VjY2Vzc1wiKTtcblx0XHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0XHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50U3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKCBqcVhIUiwgbWVzc2FnZSApe1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gZGVsZXRlIG1lZXRpbmc6IFwiICsganFYSFIucmVzcG9uc2VKU09OKTtcblx0XHRcdCQoJyNjcmVhdGVFdmVudFNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0fSk7XG5cdFx0Ki9cblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3B1bGF0ZSBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBlZGl0aW5nXG4gKlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIGVkaXRcbiAqL1xuZXhwb3J0cy5zaG93TWVldGluZ0Zvcm0gPSBmdW5jdGlvbihldmVudCl7XG5cdCQoJyN0aXRsZScpLnZhbChldmVudC50aXRsZSk7XG5cdCQoJyNzdGFydCcpLnZhbChldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZW5kJykudmFsKGV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZGVzYycpLnZhbChldmVudC5kZXNjKTtcblx0ZHVyYXRpb25PcHRpb25zKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpO1xuXHQkKCcjbWVldGluZ0lEJykudmFsKGV2ZW50LmlkKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0JCgnI3N0YXR1cycpLnZhbChldmVudC5zdGF0dXMpO1xuXHQkKCcjZGVsZXRlQnV0dG9uJykuc2hvdygpO1xuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBjcmVhdGlvblxuICpcbiAqIEBwYXJhbSBjYWxlbmRhclN0dWRlbnROYW1lIC0gc3RyaW5nIG5hbWUgb2YgdGhlIHN0dWRlbnRcbiAqL1xuZXhwb3J0cy5jcmVhdGVNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGNhbGVuZGFyU3R1ZGVudE5hbWUpe1xuXG5cdC8vcG9wdWxhdGUgdGhlIHRpdGxlIGF1dG9tYXRpY2FsbHkgZm9yIGEgc3R1ZGVudFxuXHRpZihjYWxlbmRhclN0dWRlbnROYW1lICE9PSB1bmRlZmluZWQpe1xuXHRcdCQoJyN0aXRsZScpLnZhbChjYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fWVsc2V7XG5cdFx0JCgnI3RpdGxlJykudmFsKCcnKTtcblx0fVxuXG5cdC8vU2V0IHN0YXJ0IHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3N0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjc3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGVuZCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2VuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGR1cmF0aW9uIG9wdGlvbnNcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0ZHVyYXRpb25PcHRpb25zKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLCBtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkpO1xuXHR9ZWxzZXtcblx0XHRkdXJhdGlvbk9wdGlvbnMoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQsIGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCk7XG5cdH1cblxuXHQvL1Jlc2V0IG90aGVyIG9wdGlvbnNcblx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdC8vSGlkZSBkZWxldGUgYnV0dG9uXG5cdCQoJyNkZWxldGVCdXR0b24nKS5oaWRlKCk7XG5cblx0Ly9TaG93IHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gb24gdGhpcyBwYWdlXG4gKi9cbmV4cG9ydHMucmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgJCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2V0IGR1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBtZWV0aW5nIGZvcm1cbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lXG4gKiBAcGFyYW0gZW5kIC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kaW5nIHRpbWVcbiAqL1xudmFyIGR1cmF0aW9uT3B0aW9ucyA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuXHQvL2NsZWFyIHRoZSBsaXN0XG5cdCQoJyNkdXJhdGlvbicpLmVtcHR5KCk7XG5cblx0Ly9hc3N1bWUgYWxsIG1lZXRpbmdzIGhhdmUgcm9vbSBmb3IgMjAgbWludXRlc1xuXHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPScyMCc+MjAgbWludXRlczwvb3B0aW9uPlwiKTtcblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDoyMCwgYWxsb3cgNDAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMjApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc0MCc+NDAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjAwLCBhbGxvdyA2MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNjAnPjYwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL3NldCBkZWZhdWx0IHZhbHVlIGJhc2VkIG9uIGdpdmVuIHNwYW5cblx0JCgnI2R1cmF0aW9uJykudmFsKGVuZC5kaWZmKHN0YXJ0LCBcIm1pbnV0ZXNcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsaW5rIHRoZSBkYXRlcGlja2VycyB0b2dldGhlclxuICpcbiAqIEBwYXJhbSBlbGVtMSAtIGpRdWVyeSBvYmplY3QgZm9yIGZpcnN0IGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBlbGVtMiAtIGpRdWVyeSBvYmplY3QgZm9yIHNlY29uZCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG5leHBvcnRzLmxpbmtEYXRlUGlja2VycyA9IGZ1bmN0aW9uKGVsZW0xLCBlbGVtMiwgZHVyYXRpb24pe1xuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBmaXJzdCBkYXRhcGlja2VyXG5cdCQoZWxlbTEgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUyID0gbW9tZW50KCQoZWxlbTIpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQWZ0ZXIoZGF0ZTIpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTIpKXtcblx0XHRcdGRhdGUyID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0yKS52YWwoZGF0ZTIuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIHNlY29uZCBkYXRlcGlja2VyXG5cdCQoZWxlbTIgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUxID0gbW9tZW50KCQoZWxlbTEpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQmVmb3JlKGRhdGUxKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUxKSl7XG5cdFx0XHRkYXRlMSA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMSkudmFsKGRhdGUxLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgY2hhbmdlRHVyYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgbmV3RGF0ZSA9IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgJ0xMTCcpLmFkZCgkKHRoaXMpLnZhbCgpLCBcIm1pbnV0ZXNcIik7XG5cdCQoJyNlbmQnKS52YWwobmV3RGF0ZS5mb3JtYXQoXCJMTExcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2ZXJpZnkgdGhhdCB0aGUgc3R1ZGVudHMgYXJlIHNlbGVjdGluZyBtZWV0aW5ncyB0aGF0IGFyZW4ndCB0b28gbG9uZ1xuICpcbiAqIEBwYXJhbSBzdGFydCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCBvZiB0aGUgbWVldGluZ1xuICogQHBhcmFtIGVuZCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmQgb2YgdGhlIG1lZXRpbmdcbiAqL1xuZXhwb3J0cy5zdHVkZW50U2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXG5cdC8vV2hlbiBzdHVkZW50cyBzZWxlY3QgYSBtZWV0aW5nLCBkaWZmIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzXG5cdGlmKGVuZC5kaWZmKHN0YXJ0LCAnbWludXRlcycpID4gNjApe1xuXG5cdFx0Ly9pZiBpbnZhbGlkLCB1bnNlbGVjdCBhbmQgc2hvdyBhbiBlcnJvclxuXHRcdGFsZXJ0KFwiTWVldGluZ3MgY2Fubm90IGxhc3QgbG9uZ2VyIHRoYW4gMSBob3VyXCIpO1xuXHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0fWVsc2V7XG5cblx0XHQvL2lmIHZhbGlkLCBzZXQgZGF0YSBpbiB0aGUgc2Vzc2lvbiBhbmQgc2hvdyB0aGUgZm9ybVxuXHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0ZW5kOiBlbmRcblx0XHR9O1xuXHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdGV4cG9ydHMuY3JlYXRlTWVldGluZ0Zvcm0oZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9jYWxlbmRhci5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuICBzaXRlID0gcmVxdWlyZSgnLi9zaXRlJyk7XG5cbiAgLy9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gKHVzdWFsbHkgZnJvbSBhIHByZXZpb3VzIHN1Y2Nlc3NmdWwgc2F2ZSlcbiAgc2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTc2XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDE3OFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvKipcbiAqIERpc3BsYXlzIGEgbWVzc2FnZSBmcm9tIHRoZSBmbGFzaGVkIHNlc3Npb24gZGF0YVxuICpcbiAqIHVzZSAkcmVxdWVzdC0+c2Vzc2lvbigpLT5wdXQoJ21lc3NhZ2UnLCB0cmFucygnbWVzc2FnZXMuaXRlbV9zYXZlZCcpKTtcbiAqICAgICAkcmVxdWVzdC0+c2Vzc2lvbigpLT5wdXQoJ3R5cGUnLCAnc3VjY2VzcycpO1xuICogdG8gc2V0IG1lc3NhZ2UgdGV4dCBhbmQgdHlwZVxuICovXG5leHBvcnRzLmRpc3BsYXlNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSl7XG5cdHZhciBodG1sID0gJzxkaXYgaWQ9XCJqYXZhc2NyaXB0TWVzc2FnZVwiIGNsYXNzPVwiYWxlcnQgZmFkZSBpbiBhbGVydC1kaXNtaXNzYWJsZSBhbGVydC0nICsgdHlwZSArICdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWxhYmVsPVwiQ2xvc2VcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjwvYnV0dG9uPjxzcGFuIGNsYXNzPVwiaDRcIj4nICsgbWVzc2FnZSArICc8L3NwYW4+PC9kaXY+Jztcblx0JCgnI21lc3NhZ2UnKS5hcHBlbmQoaHRtbCk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0JChcIiNqYXZhc2NyaXB0TWVzc2FnZVwiKS5hbGVydCgnY2xvc2UnKTtcblx0fSwgMzAwMCk7XG59O1xuXG4vKlxuZXhwb3J0cy5hamF4Y3JzZiA9IGZ1bmN0aW9uKCl7XG5cdCQuYWpheFNldHVwKHtcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuXHRcdH1cblx0fSk7XG59O1xuKi9cblxuLyoqXG4gKiBDbGVhcnMgZXJyb3JzIG9uIGZvcm1zIGJ5IHJlbW92aW5nIGVycm9yIGNsYXNzZXNcbiAqL1xuZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMgPSBmdW5jdGlvbigpe1xuXHQkKCcuZm9ybS1ncm91cCcpLmVhY2goZnVuY3Rpb24gKCl7XG5cdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLnRleHQoJycpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBTZXRzIGVycm9ycyBvbiBmb3JtcyBiYXNlZCBvbiByZXNwb25zZSBKU09OXG4gKi9cbmV4cG9ydHMuc2V0Rm9ybUVycm9ycyA9IGZ1bmN0aW9uKGpzb24pe1xuXHRleHBvcnRzLmNsZWFyRm9ybUVycm9ycygpO1xuXHQkLmVhY2goanNvbiwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblx0XHQkKCcjJyArIGtleSkucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0JCgnIycgKyBrZXkgKyAnaGVscCcpLnRleHQodmFsdWUuam9pbignICcpKTtcblx0fSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGZvciBtZXNzYWdlcyBpbiB0aGUgZmxhc2ggZGF0YS4gTXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSBieSB0aGUgcGFnZVxuICovXG5leHBvcnRzLmNoZWNrTWVzc2FnZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQoJyNtZXNzYWdlX2ZsYXNoJykubGVuZ3RoKXtcblx0XHR2YXIgbWVzc2FnZSA9ICQoJyNtZXNzYWdlX2ZsYXNoJykudmFsKCk7XG5cdFx0dmFyIHR5cGUgPSAkKCcjbWVzc2FnZV90eXBlX2ZsYXNoJykudmFsKCk7XG5cdFx0ZXhwb3J0cy5kaXNwbGF5TWVzc2FnZShtZXNzYWdlLCB0eXBlKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiXSwic291cmNlUm9vdCI6IiJ9