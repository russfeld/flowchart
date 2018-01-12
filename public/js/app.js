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
				var calendar = __webpack_require__(172);
				calendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
		GroupsessionController: {
			//groupsession/index
			getIndex: function getIndex() {
				var editable = __webpack_require__(174);
				editable.init();
			},
			getList: function getList() {
				//var groupsession = require('./pages/groupsession');
				//groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(177);
				profile.init();
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
exports.init = function () {

	//Check for messages in the session from a previous action
	site.checkMessage();

	//tweak parameters
	window.advisor || (window.advisor = false);
	window.nobind || (window.nobind = false);

	//get the current advisor's ID
	exports.calendarAdvisorID = $('#calendarAdvisorID').val().trim();

	//Set the advisor information for meeting event source
	exports.calendarData.eventSources[0].data = { id: exports.calendarAdvisorID };

	//Set the advsior inforamtion for blackout event source
	exports.calendarData.eventSources[1].data = { id: exports.calendarAdvisorID };

	//if the window is small, set different default for calendar
	if ($(window).width() < 600) {
		exports.calendarData.defaultView = 'agendaDay';
	}

	//If nobind, don't bind the forms
	if (!window.nobind) {
		//If the current user is an advisor, bind more data
		if (window.advisor) {

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

			//bind methods for buttons and forms
			$('#newStudentButton').bind('click', newStudent);

			$('#createBlackout').on('shown.bs.modal', function () {
				$('#btitle').focus();
			});

			$('#createBlackout').on('hidden.bs.modal', function () {
				$('#repeatdailydiv').hide();
				$('#repeatweeklydiv').hide();
				$('#repeatuntildiv').hide();
				$(this).find('form')[0].reset();
				$(this).find('.has-error').each(function () {
					$(this).removeClass('has-error');
				});
				$(this).find('.help-block').each(function () {
					$(this).text('');
				});
			});

			$('#createEvent').on('hidden.bs.modal', loadConflicts);

			$('#resolveConflict').on('hidden.bs.modal', loadConflicts);

			$('#resolveConflict').on('hidden.bs.modal', function () {
				$('#calendar').fullCalendar('refetchEvents');
			});

			//bind autocomplete field
			$('#studentid').autocomplete({
				serviceUrl: '/profile/studentfeed',
				ajaxSettings: {
					dataType: "json"
				},
				onSelect: function onSelect(suggestion) {
					$('#studentidval').val(suggestion.data);
				},
				transformResult: function transformResult(response) {
					return {
						suggestions: $.map(response.data, function (dataItem) {
							return { value: dataItem.value, data: dataItem.data };
						})
					};
				}
			});

			$('#start_datepicker').datetimepicker(exports.datePickerData);

			$('#end_datepicker').datetimepicker(exports.datePickerData);

			linkDatePickers('#start', '#end', '#duration');

			$('#bstart_datepicker').datetimepicker(exports.datePickerData);

			$('#bend_datepicker').datetimepicker(exports.datePickerData);

			linkDatePickers('#bstart', '#bend', '#bduration');

			$('#brepeatuntil_datepicker').datetimepicker(exports.datePickerDateOnly);

			//change rendering of events
			exports.calendarData.eventRender = function (event, element) {
				element.addClass("fc-clickable");
			};
			exports.calendarData.eventClick = function (event, element, view) {
				if (event.type == 'm') {
					$('#studentid').val(event.studentname);
					$('#studentidval').val(event.student_id);
					showMeetingForm(event);
				} else if (event.type == 'b') {
					exports.calendarSession = {
						event: event
					};
					if (event.repeat == '0') {
						blackoutSeries();
					} else {
						$('#blackoutOption').modal('show');
					}
				}
			};
			exports.calendarData.select = function (start, end) {
				exports.calendarSession = {
					start: start,
					end: end
				};
				$('#bblackoutid').val(-1);
				$('#bblackouteventid').val(-1);
				$('#meetingID').val(-1);
				$('#meetingOption').modal('show');
			};

			//bind more buttons
			$('#brepeat').change(repeatChange);

			$('#saveBlackoutButton').bind('click', saveBlackout);

			$('#deleteBlackoutButton').bind('click', deleteBlackout);

			$('#blackoutSeries').bind('click', function () {
				$('#blackoutOption').modal('hide');
				blackoutSeries();
			});

			$('#blackoutOccurrence').bind('click', function () {
				$('#blackoutOption').modal('hide');
				blackoutOccurrence();
			});

			$('#advisingButton').bind('click', function () {
				$('#meetingOption').modal('hide');
				createMeetingForm();
			});

			$('#createMeetingBtn').bind('click', function () {
				exports.calendarSession = {};
				createMeetingForm();
			});

			$('#blackoutButton').bind('click', function () {
				$('#meetingOption').modal('hide');
				createBlackoutForm();
			});

			$('#createBlackoutBtn').bind('click', function () {
				exports.calendarSession = {};
				createBlackoutForm();
			});

			$('#resolveButton').on('click', resolveConflicts);

			loadConflicts();

			//If the current user is not an advisor, bind less data
		} else {

			//Get the current student's name
			exports.calendarStudentName = $('#calendarStudentName').val().trim();

			//Render blackouts to background
			exports.calendarData.eventSources[1].rendering = 'background';

			//When rendering, use this custom function for blackouts and student meetings
			exports.calendarData.eventRender = function (event, element) {
				if (event.type == 'b') {
					element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
				}
				if (event.type == 's') {
					element.addClass("fc-green");
				}
			};

			//Use this method for clicking on meetings
			exports.calendarData.eventClick = function (event, element, view) {
				if (event.type == 's') {
					if (event.start.isAfter(moment())) {
						showMeetingForm(event);
					} else {
						alert("You cannot edit meetings in the past");
					}
				}
			};

			//When selecting new areas, use the studentSelect method in the calendar library
			exports.calendarData.select = studentSelect;

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

			//bind the reset form method
			$('.modal').on('hidden.bs.modal', resetForm);
		}

		//Bind click handlers on the form
		$('#saveButton').bind('click', saveMeeting);
		$('#deleteButton').bind('click', deleteMeeting);
		$('#duration').on('change', changeDuration);

		//for read-only calendars with no binding
	} else {
		//for read-only calendars, set rendering to background
		exports.calendarData.eventSources[1].rendering = 'background';
		exports.calendarData.selectable = false;

		exports.calendarData.eventRender = function (event, element) {
			if (event.type == 'b') {
				element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
			}
			if (event.type == 's') {
				element.addClass("fc-green");
			}
		};
	}

	//initalize the calendar!
	$('#calendar').fullCalendar(exports.calendarData);
};

/**
 * Function to reset calendar by closing modals and reloading data
 *
 * @param element - the jQuery identifier of the form to hide (and the spin)
 * @param reponse - the Axios repsonse object received
 */
var resetCalendar = function resetCalendar(element, response) {
	//hide the form
	$(element).modal('hide');

	//display the message to the user
	site.displayMessage(response.data, "success");

	//refresh the calendar
	$('#calendar').fullCalendar('unselect');
	$('#calendar').fullCalendar('refetchEvents');
	$(element + 'Spin').addClass('hide-spin');

	if (window.advisor) {
		loadConflicts();
	}
};

/**
 * AJAX method to save data from a form
 *
 * @param url - the URL to send the data to
 * @param data - the data object to send
 * @param element - the source element of the data
 * @param action - the string description of the action
 */
var ajaxSave = function ajaxSave(url, data, element, action) {
	//AJAX POST to server
	window.axios.post(url, data)
	//if response is 2xx
	.then(function (response) {
		resetCalendar(element, response);
	})
	//if response is not 2xx
	.catch(function (error) {
		site.handleError(action, element, error);
	});
};

var ajaxDelete = function ajaxDelete(url, data, element, action, noReset, noChoice) {
	//check noReset variable
	noReset || (noReset = false);
	noChoice || (noChoice = false);

	//prompt the user for confirmation
	if (!noChoice) {
		var choice = confirm("Are you sure?");
	} else {
		var choice = true;
	}

	if (choice === true) {

		//if confirmed, show spinning icon
		$(element + 'Spin').removeClass('hide-spin');

		//make AJAX request to delete
		window.axios.post(url, data).then(function (response) {
			if (noReset) {
				//hide parent element - TODO TESTME
				//caller.parent().parent().addClass('hidden');
				$(element + 'Spin').addClass('hide-spin');
				$(element).addClass('hidden');
			} else {
				resetCalendar(element, response);
			}
		}).catch(function (error) {
			site.handleError(action, element, error);
		});
	}
};

/**
 * Function to save a meeting
 */
var saveMeeting = function saveMeeting() {

	//Show the spinning status icon while working
	$('#createEventSpin').removeClass('hide-spin');

	//build the data object and URL
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
	var url = '/advising/createmeeting';

	//AJAX POST to server
	ajaxSave(url, data, '#createEvent', 'save meeting');
};

/**
 * Function to delete a meeting
 */
var deleteMeeting = function deleteMeeting() {

	//build data and url
	var data = {
		meetingid: $('#meetingID').val()
	};
	var url = '/advising/deletemeeting';

	ajaxDelete(url, data, '#createEvent', 'delete meeting', false);
};

/**
 * Function to populate and show the meeting form for editing
 *
 * @param event - The event to edit
 */
var showMeetingForm = function showMeetingForm(event) {
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
var createMeetingForm = function createMeetingForm(calendarStudentName) {

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
var resetForm = function resetForm() {
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
var linkDatePickers = function linkDatePickers(elem1, elem2, duration) {
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
var studentSelect = function studentSelect(start, end) {

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
		createMeetingForm(exports.calendarStudentName);
	}
};

/**
 * Load conflicting meetings from the server
 */
var loadConflicts = function loadConflicts() {

	//request conflicts via AJAX
	window.axios.get('/advising/conflicts').then(function (response) {

		//disable existing click handlers
		$(document).off('click', '.deleteConflict', deleteConflict);
		$(document).off('click', '.editConflict', editConflict);
		$(document).off('click', '.resolveConflict', resolveConflict);

		//If response is 200, data was received
		if (response.status == 200) {

			//Append HTML for conflicts to DOM
			$('#resolveConflictMeetings').empty();
			$.each(response.data, function (index, value) {
				$('<div/>', {
					'id': 'resolve' + value.id,
					'class': 'meeting-conflict',
					'html': '<p>&nbsp;<button type="button" class="btn btn-danger pull-right deleteConflict" data-id=' + value.id + '>Delete</button>' + '&nbsp;<button type="button" class="btn btn-primary pull-right editConflict" data-id=' + value.id + '>Edit</button> ' + '<button type="button" class="btn btn-success pull-right resolveConflict" data-id=' + value.id + '>Keep Meeting</button>' + '<span id="resolve' + value.id + 'Spin" class="fa fa-cog fa-spin fa-lg pull-right hide-spin">&nbsp;</span>' + '<b>' + value.title + '</b> (' + value.start + ')</p><hr>'
				}).appendTo('#resolveConflictMeetings');
			});

			//Re-register click handlers
			$(document).on('click', '.deleteConflict', deleteConflict);
			$(document).on('click', '.editConflict', editConflict);
			$(document).on('click', '.resolveConflict', resolveConflict);

			//Show the <div> containing conflicts
			$('#conflictingMeetings').removeClass('hidden');

			//If response is 204, no conflicts are present
		} else if (response.status == 204) {

			//Hide the <div> containing conflicts
			$('#conflictingMeetings').addClass('hidden');
		}
	}).catch(function (error) {
		alert("Unable to retrieve conflicting meetings: " + error.response.data);
	});

	/*
 	$.ajax({
 		method: "GET",
 		url: '/advising/conflicts',
 		dataType: 'json'
 	})
 	.success(function(data, message, jqXHR) {
 		$(document).off('click', '.deleteConflict', deleteConflict);
 		$(document).off('click', '.editConflict', editConflict);
 		$(document).off('click', '.resolveConflict', resolveConflict);
 		if(jqXHR.status == 200){
 			$('#resolveConflictMeetings').empty();
 			$.each(data, function(index, value){
 				$('<div/>', {
 					'class': 'meeting-conflict',
 							'html': 	'<p>&nbsp;<button type="button" class="btn btn-danger pull-right deleteConflict" data-id='+value.id+'>Delete</button>' +
 										'&nbsp;<button type="button" class="btn btn-primary pull-right editConflict" data-id='+value.id+'>Edit</button> ' +
 										'<button type="button" class="btn btn-success pull-right resolveConflict" data-id='+value.id+'>Keep Meeting</button>' +
 										'<span id="resolveSpin'+value.id+'" class="fa fa-cog fa-spin fa-lg pull-right hide-spin">&nbsp;</span>' +
 											'<b>'+value.title+'</b> ('+value.start+')</p><hr>'
 					}).appendTo('#resolveConflictMeetings');
 			});
 			$(document).on('click', '.deleteConflict', deleteConflict);
 			$(document).on('click', '.editConflict', editConflict);
 			$(document).on('click', '.resolveConflict', resolveConflict);
 			$('#conflictingMeetings').removeClass('hidden');
 		}else if (jqXHR.status == 204){
 			$('#conflictingMeetings').addClass('hidden');
 		}
 	}).fail(function( jqXHR, message ){
 		alert("Unable to retrieve conflicting meetings: " + jqXHR.responseJSON);
 	});
 */
};

/**
 * Save blackouts and blackout events
 */
var saveBlackout = function saveBlackout() {

	//Show the spinning status icon while working
	$('#createBlackoutSpin').removeClass('hide-spin');

	//build the data object and url;
	var data = {
		bstart: moment($('#bstart').val(), 'LLL').format(),
		bend: moment($('#bend').val(), 'LLL').format(),
		btitle: $('#btitle').val()
	};
	var url;
	if ($('#bblackouteventid').val() > 0) {
		url = '/advising/createblackoutevent';
		data.bblackouteventid = $('#bblackouteventid').val();
	} else {
		url = '/advising/createblackout';
		if ($('#bblackoutid').val() > 0) {
			data.bblackoutid = $('#bblackoutid').val();
		}
		data.brepeat = $('#brepeat').val();
		if ($('#brepeat').val() == 1) {
			data.brepeatevery = $('#brepeatdaily').val();
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
		if ($('#brepeat').val() == 2) {
			data.brepeatevery = $('#brepeatweekly').val();
			data.brepeatweekdaysm = $('#brepeatweekdays1').prop('checked');
			data.brepeatweekdayst = $('#brepeatweekdays2').prop('checked');
			data.brepeatweekdaysw = $('#brepeatweekdays3').prop('checked');
			data.brepeatweekdaysu = $('#brepeatweekdays4').prop('checked');
			data.brepeatweekdaysf = $('#brepeatweekdays5').prop('checked');
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
	}

	//send AJAX post
	ajaxSave(url, data, '#createBlackout', 'save blackout');
};

/**
 * Delete blackout and blackout events
 */
var deleteBlackout = function deleteBlackout() {

	//build URL and data object
	var url, data;
	if ($('#bblackouteventid').val() > 0) {
		url = '/advising/deleteblackoutevent';
		data = { bblackouteventid: $('#bblackouteventid').val() };
	} else {
		url = '/advising/deleteblackout';
		data = { bblackoutid: $('#bblackoutid').val() };
	}

	//send AJAX post
	ajaxDelete(url, data, '#createBlackout', 'delete blackout', false);
};

/**
 * Function for handling the change of repeat options on the blackout form
 */
var repeatChange = function repeatChange() {
	if ($(this).val() == 0) {
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').hide();
	} else if ($(this).val() == 1) {
		$('#repeatdailydiv').show();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').show();
	} else if ($(this).val() == 2) {
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').show();
		$('#repeatuntildiv').show();
	}
};

/**
 * Show the resolve conflicts modal form
 */
var resolveConflicts = function resolveConflicts() {
	$('#resolveConflict').modal('show');
};

/**
 * Delete conflicting meeting
 */
var deleteConflict = function deleteConflict() {

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	};
	var url = '/advising/deletemeeting';

	//send AJAX delete
	ajaxDelete(url, data, '#resolve' + id, 'delete meeting', true);
};

/**
 * Edit conflicting meeting
 */
var editConflict = function editConflict() {

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	};
	var url = '/advising/meeting';

	//show spinner to load meeting
	$('#resolve' + id + 'Spin').removeClass('hide-spin');

	//load meeting and display form
	window.axios.get(url, {
		params: data
	}).then(function (response) {
		$('#resolve' + id + 'Spin').addClass('hide-spin');
		$('#resolveConflict').modal('hide');
		event = response.data;
		event.start = moment(event.start);
		event.end = moment(event.end);
		showMeetingForm(event);
	}).catch(function (error) {
		site.handleError('retrieve meeting', '#resolve' + id, error);
	});
};

/**
 * Resolve a conflicting meeting
 */
var resolveConflict = function resolveConflict() {

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	};
	var url = '/advising/resolveconflict';

	ajaxDelete(url, data, '#resolve' + id, 'resolve meeting', true, true);
};

/**
 * Function to create the create blackout form
 */
var createBlackoutForm = function createBlackoutForm() {
	$('#btitle').val("");
	if (exports.calendarSession.start === undefined) {
		$('#bstart').val(moment().hour(8).minute(0).format('LLL'));
	} else {
		$('#bstart').val(exports.calendarSession.start.format("LLL"));
	}
	if (exports.calendarSession.end === undefined) {
		$('#bend').val(moment().hour(9).minute(0).format('LLL'));
	} else {
		$('#bend').val(exports.calendarSession.end.format("LLL"));
	}
	$('#bblackoutid').val(-1);
	$('#repeatdiv').show();
	$('#brepeat').val(0);
	$('#brepeat').trigger('change');
	$('#deleteBlackoutButton').hide();
	$('#createBlackout').modal('show');
};

/**
 * Function to reset the form to a single occurrence
 */
var blackoutOccurrence = function blackoutOccurrence() {
	//hide the modal form
	$('#blackoutOption').modal('hide');

	//set form values and hide unneeded fields
	$('#btitle').val(exports.calendarSession.event.title);
	$('#bstart').val(exports.calendarSession.event.start.format("LLL"));
	$('#bend').val(exports.calendarSession.event.end.format("LLL"));
	$('#repeatdiv').hide();
	$('#repeatdailydiv').hide();
	$('#repeatweeklydiv').hide();
	$('#repeatuntildiv').hide();
	$('#bblackoutid').val(exports.calendarSession.event.blackout_id);
	$('#bblackouteventid').val(exports.calendarSession.event.id);
	$('#deleteBlackoutButton').show();

	//show the form
	$('#createBlackout').modal('show');
};

/**
 * Function to load a blackout series edit form
 */
var blackoutSeries = function blackoutSeries() {
	//hide the modal form
	$('#blackoutOption').modal('hide');

	//build data and URL
	var data = {
		id: exports.calendarSession.event.blackout_id
	};
	var url = '/advising/blackout';

	window.axios.get(url, {
		params: data
	}).then(function (response) {
		$('#btitle').val(response.data.title);
		$('#bstart').val(moment(response.data.start, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
		$('#bend').val(moment(response.data.end, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
		$('#bblackoutid').val(response.data.id);
		$('#bblackouteventid').val(-1);
		$('#repeatdiv').show();
		$('#brepeat').val(response.data.repeat_type);
		$('#brepeat').trigger('change');
		if (response.data.repeat_type == 1) {
			$('#brepeatdaily').val(response.data.repeat_every);
			$('#brepeatuntil').val(moment(response.data.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
		} else if (response.data.repeat_type == 2) {
			$('#brepeatweekly').val(response.data.repeat_every);
			var repeat_detail = String(response.data.repeat_detail);
			$('#brepeatweekdays1').prop('checked', repeat_detail.indexOf("1") >= 0);
			$('#brepeatweekdays2').prop('checked', repeat_detail.indexOf("2") >= 0);
			$('#brepeatweekdays3').prop('checked', repeat_detail.indexOf("3") >= 0);
			$('#brepeatweekdays4').prop('checked', repeat_detail.indexOf("4") >= 0);
			$('#brepeatweekdays5').prop('checked', repeat_detail.indexOf("5") >= 0);
			$('#brepeatuntil').val(moment(response.data.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
		}
		$('#deleteBlackoutButton').show();
		$('#createBlackout').modal('show');
	}).catch(function (error) {
		site.handleError('retrieve blackout series', '', error);
	});
};

/**
 * Function to create a new student in the database
 */
var newStudent = function newStudent() {
	//prompt the user for an eID to add to the system
	var eid = prompt("Enter the student's eID");

	//build the URL and data
	var data = {
		eid: eid
	};
	var url = '/profile/newstudent';

	//send AJAX post
	window.axios.post(url, data).then(function (response) {
		alert(response.data);
	}).catch(function (error) {
		if (error.response) {
			//If response is 422, errors were provided
			if (error.response.status == 422) {
				alert("Unable to create user: " + error.response.data["eid"]);
			} else {
				alert("Unable to create user: " + error.response.data);
			}
		}
	});
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 174:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function () {

  //Load required libraries
  __webpack_require__(3);
  __webpack_require__(175);
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

/***/ 175:
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

/***/ 177:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {site = __webpack_require__(5);

exports.init = function () {

	//bind click handler for save button
	$('#saveProfile').on('click', function () {

		//show spinning icon
		$('#profileSpin').removeClass('hide-spin');

		//build data and URL
		var data = {
			first_name: $('#first_name').val(),
			last_name: $('#last_name').val()
		};
		var url = '/profile/update';

		//send AJAX post
		window.axios.post(url, data).then(function (response) {
			site.displayMessage(response.data, "success");
			site.clearFormErrors();
			$('#profileSpin').addClass('hide-spin');
			$('#profileAdvisingBtn').removeClass('hide-spin');
		}).catch(function (error) {
			site.handleError('save profile', '#profile', error);
		});
	});

	//bind click handler for advisor save button
	$('#saveAdvisorProfile').on('click', function () {

		//show spinning icon
		$('#profileSpin').removeClass('hide-spin');

		//build data and URL
		//TODO TESTME
		var data = new FormData($('form')[0]);
		data.append("name", $('#name').val());
		data.append("email", $('#email').val());
		data.append("office", $('#office').val());
		data.append("phone", $('#phone').val());
		data.append("notes", $('#notes').val());
		if ($('#pic').val()) {
			data.append("pic", $('#pic')[0].files[0]);
		}
		var url = '/profile/update';

		window.axios.post(url, data).then(function (response) {
			site.displayMessage(response.data, "success");
			site.clearFormErrors();
			$('#profileSpin').addClass('hide-spin');
			$('#profileAdvisingBtn').removeClass('hide-spin');
			window.axios.get('/profile/pic').then(function (response) {
				$('#pictext').val(response.data);
				$('#picimg').attr('src', response.data);
			}).catch(function (error) {
				site.handleError('retrieve picture', '', error);
			});
		}).catch(function (error) {
			site.handleError('save profile', '#profile', error);
		});
	});

	//http://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3/
	$(document).on('change', '.btn-file :file', function () {
		var input = $(this),
		    numFiles = input.get(0).files ? input.get(0).files.length : 1,
		    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});

	//bind to fileselect button
	$('.btn-file :file').on('fileselect', function (event, numFiles, label) {

		var input = $(this).parents('.input-group').find(':text');
		var log = numFiles > 1 ? numFiles + ' files selected' : label;

		if (input.length) {
			input.val(log);
		} else {
			if (log) {
				alert(log);
			}
		}
	});
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

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

/**
 * Function to handle errors from AJAX
 *
 * @param message - the message to display to the user
 * @param element - the jQuery identifier of the element
 * @param error - the Axios error received
 */
exports.handleError = function (message, element, error) {
	if (error.response) {
		//If response is 422, errors were provided
		if (error.response.status == 422) {
			exports.setFormErrors(error.response.data);
		} else {
			alert("Unable to " + message + ": " + error.response.data);
		}
	}

	//hide spinning icon
	if (element.length > 0) {
		$(element + 'Spin').addClass('hide-spin');
	}
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ })

},[138]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzcz82ZDEwIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJBcHAiLCJhY3Rpb25zIiwiaW5kZXgiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJnZXRJbmRleCIsImNhbGVuZGFyIiwiaW5pdCIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJlZGl0YWJsZSIsImdldExpc3QiLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiY29udHJvbGxlciIsImFjdGlvbiIsIndpbmRvdyIsIl8iLCIkIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJjb250ZW50IiwiY29uc29sZSIsImVycm9yIiwibW9tZW50Iiwic2l0ZSIsImV4cG9ydHMiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidXJsIiwidHlwZSIsImFsZXJ0IiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsImV2ZW50IiwicmVuZGVyaW5nIiwidGltZUZvcm1hdCIsImRhdGVQaWNrZXJEYXRhIiwiZGF5c09mV2Vla0Rpc2FibGVkIiwiZm9ybWF0Iiwic3RlcHBpbmciLCJlbmFibGVkSG91cnMiLCJtYXhIb3VyIiwic2lkZUJ5U2lkZSIsImlnbm9yZVJlYWRvbmx5IiwiYWxsb3dJbnB1dFRvZ2dsZSIsImRhdGVQaWNrZXJEYXRlT25seSIsImNoZWNrTWVzc2FnZSIsImFkdmlzb3IiLCJub2JpbmQiLCJ2YWwiLCJ0cmltIiwiZGF0YSIsImlkIiwid2lkdGgiLCJvbiIsImZvY3VzIiwicHJvcCIsInJlbW92ZUNsYXNzIiwic2hvdyIsInJlc2V0Rm9ybSIsImJpbmQiLCJuZXdTdHVkZW50IiwiaGlkZSIsImZpbmQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzdHVkZW50X2lkIiwic2hvd01lZXRpbmdGb3JtIiwicmVwZWF0IiwiYmxhY2tvdXRTZXJpZXMiLCJtb2RhbCIsInNlbGVjdCIsImNoYW5nZSIsInJlcGVhdENoYW5nZSIsInNhdmVCbGFja291dCIsImRlbGV0ZUJsYWNrb3V0IiwiYmxhY2tvdXRPY2N1cnJlbmNlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwiYXBwZW5kIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiY2hvaWNlIiwiY29uZmlybSIsImRlc2MiLCJzdGF0dXMiLCJtZWV0aW5naWQiLCJzdHVkZW50aWQiLCJkdXJhdGlvbk9wdGlvbnMiLCJ1bmRlZmluZWQiLCJob3VyIiwibWludXRlIiwiY2xlYXJGb3JtRXJyb3JzIiwiZW1wdHkiLCJtaW51dGVzIiwiZGlmZiIsImVsZW0xIiwiZWxlbTIiLCJkdXJhdGlvbiIsImUiLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZ2V0Iiwib2ZmIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJ0cmlnZ2VyIiwiYmxhY2tvdXRfaWQiLCJyZXBlYXRfdHlwZSIsInJlcGVhdF9ldmVyeSIsInJlcGVhdF91bnRpbCIsInJlcGVhdF9kZXRhaWwiLCJTdHJpbmciLCJpbmRleE9mIiwiZWlkIiwicHJvbXB0IiwiY2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInN1bW1lcm5vdGUiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIiwibG9jYXRpb24iLCJyZWxvYWQiLCJmaXJzdF9uYW1lIiwibGFzdF9uYW1lIiwiRm9ybURhdGEiLCJmaWxlcyIsImF0dHIiLCJpbnB1dCIsIm51bUZpbGVzIiwibGVuZ3RoIiwibGFiZWwiLCJyZXBsYWNlIiwicGFyZW50cyIsImxvZyIsIm1lc3NhZ2UiLCJodG1sIiwic2V0VGltZW91dCIsInNldEZvcm1FcnJvcnMiLCJqc29uIiwia2V5Iiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0EsbUJBQUFBLENBQVEsR0FBUjs7QUFFQSxJQUFJQyxNQUFNOztBQUVUO0FBQ0FDLFVBQVM7QUFDUjtBQUNBQyxTQUFPO0FBQ05BLFVBQU8saUJBQVc7QUFDakI7QUFDQTtBQUhLLEdBRkM7O0FBUVI7QUFDQUMsc0JBQW9CO0FBQ25CO0FBQ0FDLGFBQVUsb0JBQVc7QUFDcEIsUUFBSUMsV0FBVyxtQkFBQU4sQ0FBUSxHQUFSLENBQWY7QUFDQU0sYUFBU0MsSUFBVDtBQUNBO0FBTGtCLEdBVFo7O0FBaUJSO0FBQ0VDLDBCQUF3QjtBQUN6QjtBQUNHSCxhQUFVLG9CQUFXO0FBQ25CLFFBQUlJLFdBQVcsbUJBQUFULENBQVEsR0FBUixDQUFmO0FBQ0pTLGFBQVNGLElBQVQ7QUFDRyxJQUxxQjtBQU16QkcsWUFBUyxtQkFBVztBQUNuQjtBQUNBO0FBQ0E7QUFUd0IsR0FsQmxCOztB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Q0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsNkRBQTZEO0FBQzdELFNBQVM7QUFDVCx1REFBdUQ7QUFDdkQ7QUFDQSxPQUFPO0FBQ1AsMERBQTBEO0FBQzFEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0EsRUFIRDtBQUlBLENBTkQ7O0FBUUE7OztBQUdBaE4sUUFBUTZDLFlBQVIsR0FBdUIsWUFBVTtBQUNoQyxLQUFHM0QsRUFBRSxnQkFBRixFQUFvQm1OLE1BQXZCLEVBQThCO0FBQzdCLE1BQUlLLFVBQVV4TixFQUFFLGdCQUFGLEVBQW9COEQsR0FBcEIsRUFBZDtBQUNBLE1BQUl2QixPQUFPdkMsRUFBRSxxQkFBRixFQUF5QjhELEdBQXpCLEVBQVg7QUFDQWhELFVBQVE4RyxjQUFSLENBQXVCNEYsT0FBdkIsRUFBZ0NqTCxJQUFoQztBQUNBO0FBQ0QsQ0FORDs7QUFRQTs7Ozs7OztBQU9BekIsUUFBUW1ILFdBQVIsR0FBc0IsVUFBU3VGLE9BQVQsRUFBa0J2SCxPQUFsQixFQUEyQnRGLEtBQTNCLEVBQWlDO0FBQ3RELEtBQUdBLE1BQU04RSxRQUFULEVBQWtCO0FBQ2pCO0FBQ0EsTUFBRzlFLE1BQU04RSxRQUFOLENBQWUrQyxNQUFmLElBQXlCLEdBQTVCLEVBQWdDO0FBQy9CMUgsV0FBUTZNLGFBQVIsQ0FBc0JoTixNQUFNOEUsUUFBTixDQUFlekIsSUFBckM7QUFDQSxHQUZELE1BRUs7QUFDSnhCLFNBQU0sZUFBZWdMLE9BQWYsR0FBeUIsSUFBekIsR0FBZ0M3TSxNQUFNOEUsUUFBTixDQUFlekIsSUFBckQ7QUFDQTtBQUNEOztBQUVEO0FBQ0EsS0FBR2lDLFFBQVFrSCxNQUFSLEdBQWlCLENBQXBCLEVBQXNCO0FBQ3JCbk4sSUFBRWlHLFVBQVUsTUFBWixFQUFvQkMsUUFBcEIsQ0FBNkIsV0FBN0I7QUFDQTtBQUNELENBZEQsQyIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9odHRwczovL2xhcmF2ZWwuY29tL2RvY3MvNS40L21peCN3b3JraW5nLXdpdGgtc2NyaXB0c1xuLy9odHRwczovL2FuZHktY2FydGVyLmNvbS9ibG9nL3Njb3BpbmctamF2YXNjcmlwdC1mdW5jdGlvbmFsaXR5LXRvLXNwZWNpZmljLXBhZ2VzLXdpdGgtbGFyYXZlbC1hbmQtY2FrZXBocFxuXG4vL0xvYWQgc2l0ZS13aWRlIGxpYnJhcmllcyBpbiBib290c3RyYXAgZmlsZVxucmVxdWlyZSgnLi9ib290c3RyYXAnKTtcblxudmFyIEFwcCA9IHtcblxuXHQvLyBDb250cm9sbGVyLWFjdGlvbiBtZXRob2RzXG5cdGFjdGlvbnM6IHtcblx0XHQvL0luZGV4IGZvciBkaXJlY3RseSBjcmVhdGVkIHZpZXdzIHdpdGggbm8gZXhwbGljaXQgY29udHJvbGxlclxuXHRcdGluZGV4OiB7XG5cdFx0XHRpbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vbm8gZGVmYXVsdCBqYXZhc2NyaXB0cyBvbiBob21lIHBhZ2VzP1xuXHRcdFx0fSxcbiAgICB9LFxuXG5cdFx0Ly9BZHZpc2luZyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkdmlzaW5nXG5cdFx0QWR2aXNpbmdDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkdmlzaW5nL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vcGFnZXMvY2FsZW5kYXInKTtcblx0XHRcdFx0Y2FsZW5kYXIuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0dyb3Vwc2Vzc2lvbiBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2dyb3Vwc2Vzc2lvblxuICAgIEdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXI6IHtcblx0XHRcdC8vZ3JvdXBzZXNzaW9uL2luZGV4XG4gICAgICBnZXRJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG4gICAgICB9LFxuXHRcdFx0Z2V0TGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vdmFyIGdyb3Vwc2Vzc2lvbiA9IHJlcXVpcmUoJy4vcGFnZXMvZ3JvdXBzZXNzaW9uJyk7XG5cdFx0XHRcdC8vZ3JvdXBzZXNzaW9uLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdC8vUHJvZmlsZXMgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9wcm9maWxlXG5cdFx0UHJvZmlsZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL3Byb2ZpbGUvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHByb2ZpbGUgPSByZXF1aXJlKCcuL3BhZ2VzL3Byb2ZpbGUnKTtcblx0XHRcdFx0cHJvZmlsZS5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3aW5kb3cuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgalF1ZXJ5IGFuZCB0aGUgQm9vdHN0cmFwIGpRdWVyeSBwbHVnaW4gd2hpY2ggcHJvdmlkZXMgc3VwcG9ydFxuICogZm9yIEphdmFTY3JpcHQgYmFzZWQgQm9vdHN0cmFwIGZlYXR1cmVzIHN1Y2ggYXMgbW9kYWxzIGFuZCB0YWJzLiBUaGlzXG4gKiBjb2RlIG1heSBiZSBtb2RpZmllZCB0byBmaXQgdGhlIHNwZWNpZmljIG5lZWRzIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKi9cblxud2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4vKipcbiAqIFZ1ZSBpcyBhIG1vZGVybiBKYXZhU2NyaXB0IGxpYnJhcnkgZm9yIGJ1aWxkaW5nIGludGVyYWN0aXZlIHdlYiBpbnRlcmZhY2VzXG4gKiB1c2luZyByZWFjdGl2ZSBkYXRhIGJpbmRpbmcgYW5kIHJldXNhYmxlIGNvbXBvbmVudHMuIFZ1ZSdzIEFQSSBpcyBjbGVhblxuICogYW5kIHNpbXBsZSwgbGVhdmluZyB5b3UgdG8gZm9jdXMgb24gYnVpbGRpbmcgeW91ciBuZXh0IGdyZWF0IHByb2plY3QuXG4gKi9cblxuLy8gd2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgdGhlIGF4aW9zIEhUVFAgbGlicmFyeSB3aGljaCBhbGxvd3MgdXMgdG8gZWFzaWx5IGlzc3VlIHJlcXVlc3RzXG4gKiB0byBvdXIgTGFyYXZlbCBiYWNrLWVuZC4gVGhpcyBsaWJyYXJ5IGF1dG9tYXRpY2FsbHkgaGFuZGxlcyBzZW5kaW5nIHRoZVxuICogQ1NSRiB0b2tlbiBhcyBhIGhlYWRlciBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIFwiWFNSRlwiIHRva2VuIGNvb2tpZS5cbiAqL1xuXG53aW5kb3cuYXhpb3MgPSByZXF1aXJlKCdheGlvcycpO1xuXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9yYXBwYXNvZnQvbGFyYXZlbC01LWJvaWxlcnBsYXRlL2Jsb2IvbWFzdGVyL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzXG53aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbi8qKlxuICogTmV4dCB3ZSB3aWxsIHJlZ2lzdGVyIHRoZSBDU1JGIFRva2VuIGFzIGEgY29tbW9uIGhlYWRlciB3aXRoIEF4aW9zIHNvIHRoYXRcbiAqIGFsbCBvdXRnb2luZyBIVFRQIHJlcXVlc3RzIGF1dG9tYXRpY2FsbHkgaGF2ZSBpdCBhdHRhY2hlZC4gVGhpcyBpcyBqdXN0XG4gKiBhIHNpbXBsZSBjb252ZW5pZW5jZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGF0dGFjaCBldmVyeSB0b2tlbiBtYW51YWxseS5cbiAqL1xuXG5sZXQgdG9rZW4gPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKTtcblxuaWYgKHRva2VuKSB7XG4gICAgd2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUNTUkYtVE9LRU4nXSA9IHRva2VuLmNvbnRlbnQ7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NTUkYgdG9rZW4gbm90IGZvdW5kOiBodHRwczovL2xhcmF2ZWwuY29tL2RvY3MvY3NyZiNjc3JmLXgtY3NyZi10b2tlbicpO1xufVxuXG4vKipcbiAqIEVjaG8gZXhwb3NlcyBhbiBleHByZXNzaXZlIEFQSSBmb3Igc3Vic2NyaWJpbmcgdG8gY2hhbm5lbHMgYW5kIGxpc3RlbmluZ1xuICogZm9yIGV2ZW50cyB0aGF0IGFyZSBicm9hZGNhc3QgYnkgTGFyYXZlbC4gRWNobyBhbmQgZXZlbnQgYnJvYWRjYXN0aW5nXG4gKiBhbGxvd3MgeW91ciB0ZWFtIHRvIGVhc2lseSBidWlsZCByb2J1c3QgcmVhbC10aW1lIHdlYiBhcHBsaWNhdGlvbnMuXG4gKi9cblxuLy8gaW1wb3J0IEVjaG8gZnJvbSAnbGFyYXZlbC1lY2hvJ1xuXG4vLyB3aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8vIHdpbmRvdy5FY2hvID0gbmV3IEVjaG8oe1xuLy8gICAgIGJyb2FkY2FzdGVyOiAncHVzaGVyJyxcbi8vICAgICBrZXk6ICd5b3VyLXB1c2hlci1rZXknXG4vLyB9KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG5tb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbnNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2VvbmFzZGFuLWJvb3RzdHJhcC1kYXRldGltZXBpY2tlci1ydXNzZmVsZCcpO1xuXG4vL1Nlc3Npb24gZm9yIHN0b3JpbmcgZGF0YSBiZXR3ZWVuIGZvcm1zXG5leHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXG4vL0lEIG9mIHRoZSBjdXJyZW50bHkgbG9hZGVkIGNhbGVuZGFyJ3MgYWR2aXNvclxuZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9IC0xO1xuXG4vL1N0dWRlbnQncyBOYW1lIHNldCBieSBpbml0XG5leHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSBcIlwiO1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG5leHBvcnRzLmNhbGVuZGFyRGF0YSA9IHtcblx0aGVhZGVyOiB7XG5cdFx0bGVmdDogJ3ByZXYsbmV4dCB0b2RheScsXG5cdFx0Y2VudGVyOiAndGl0bGUnLFxuXHRcdHJpZ2h0OiAnYWdlbmRhV2VlayxhZ2VuZGFEYXknXG5cdH0sXG5cdGVkaXRhYmxlOiBmYWxzZSxcblx0ZXZlbnRMaW1pdDogdHJ1ZSxcblx0aGVpZ2h0OiAnYXV0bycsXG5cdHdlZWtlbmRzOiBmYWxzZSxcblx0YnVzaW5lc3NIb3Vyczoge1xuXHRcdHN0YXJ0OiAnODowMCcsIC8vIGEgc3RhcnQgdGltZSAoMTBhbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZW5kOiAnMTc6MDAnLCAvLyBhbiBlbmQgdGltZSAoNnBtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRkb3c6IFsgMSwgMiwgMywgNCwgNSBdXG5cdH0sXG5cdGRlZmF1bHRWaWV3OiAnYWdlbmRhV2VlaycsXG5cdHZpZXdzOiB7XG5cdFx0YWdlbmRhOiB7XG5cdFx0XHRhbGxEYXlTbG90OiBmYWxzZSxcblx0XHRcdHNsb3REdXJhdGlvbjogJzAwOjIwOjAwJyxcblx0XHRcdG1pblRpbWU6ICcwODowMDowMCcsXG5cdFx0XHRtYXhUaW1lOiAnMTc6MDA6MDAnXG5cdFx0fVxuXHR9LFxuXHRldmVudFNvdXJjZXM6IFtcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvbWVldGluZ2ZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBtZWV0aW5nIGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjNTEyODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ3doaXRlJyxcblx0XHR9LFxuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9ibGFja291dGZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBibGFja291dCBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnI0ZGODg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICdibGFjaycsXG5cdFx0fSxcblx0XSxcblx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0c2VsZWN0SGVscGVyOiB0cnVlLFxuXHRzZWxlY3RPdmVybGFwOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHJldHVybiBldmVudC5yZW5kZXJpbmcgPT09ICdiYWNrZ3JvdW5kJztcblx0fSxcblx0dGltZUZvcm1hdDogJyAnLFxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2VcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGEgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTExMJyxcblx0XHRzdGVwcGluZzogMjAsXG5cdFx0ZW5hYmxlZEhvdXJzOiBbOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3XSxcblx0XHRtYXhIb3VyOiAxNyxcblx0XHRzaWRlQnlTaWRlOiB0cnVlLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlIGRheSBvbmx5XG5leHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdNTS9ERC9ZWVlZJyxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vKipcbiAqIEluaXRpYWx6YXRpb24gZnVuY3Rpb24gZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSBhZHZpc29yIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSB1c2VyIGlzIGFuIGFkdmlzb3JcbiAqIEBwYXJhbSBub2JpbmQgLSBib29sZWFuIHRydWUgaWYgdGhlIGJ1dHRvbnMgc2hvdWxkIG5vdCBiZSBib3VuZCAobWFrZSBjYWxlbmRhciByZWFkLW9ubHkpXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gZnJvbSBhIHByZXZpb3VzIGFjdGlvblxuXHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG5cdC8vdHdlYWsgcGFyYW1ldGVyc1xuXHR3aW5kb3cuYWR2aXNvciB8fCAod2luZG93LmFkdmlzb3IgPSBmYWxzZSk7XG5cdHdpbmRvdy5ub2JpbmQgfHwgKHdpbmRvdy5ub2JpbmQgPSBmYWxzZSk7XG5cblx0Ly9nZXQgdGhlIGN1cnJlbnQgYWR2aXNvcidzIElEXG5cdGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAkKCcjY2FsZW5kYXJBZHZpc29ySUQnKS52YWwoKS50cmltKCk7XG5cblx0Ly9TZXQgdGhlIGFkdmlzb3IgaW5mb3JtYXRpb24gZm9yIG1lZXRpbmcgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1swXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL1NldCB0aGUgYWR2c2lvciBpbmZvcmFtdGlvbiBmb3IgYmxhY2tvdXQgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL2lmIHRoZSB3aW5kb3cgaXMgc21hbGwsIHNldCBkaWZmZXJlbnQgZGVmYXVsdCBmb3IgY2FsZW5kYXJcblx0aWYoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApe1xuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmRlZmF1bHRWaWV3ID0gJ2FnZW5kYURheSc7XG5cdH1cblxuXHQvL0lmIG5vYmluZCwgZG9uJ3QgYmluZCB0aGUgZm9ybXNcblx0aWYoIXdpbmRvdy5ub2JpbmQpe1xuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhbiBhZHZpc29yLCBiaW5kIG1vcmUgZGF0YVxuXHRcdGlmKHdpbmRvdy5hZHZpc29yKXtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI3RpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0JykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjZW5kJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjZW5kX3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLnNob3coKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5zaG93KCk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG5cdFx0XHQvL2JpbmQgbWV0aG9kcyBmb3IgYnV0dG9ucyBhbmQgZm9ybXNcblx0XHRcdCQoJyNuZXdTdHVkZW50QnV0dG9uJykuYmluZCgnY2xpY2snLCBuZXdTdHVkZW50KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjYnRpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdFx0XHQgICAgJCh0aGlzKS5maW5kKCcuaGFzLWVycm9yJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRleHQoJycpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9iaW5kIGF1dG9jb21wbGV0ZSBmaWVsZFxuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLmF1dG9jb21wbGV0ZSh7XG5cdFx0XHQgICAgc2VydmljZVVybDogJy9wcm9maWxlL3N0dWRlbnRmZWVkJyxcblx0XHRcdCAgICBhamF4U2V0dGluZ3M6IHtcblx0XHRcdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdFx0XHQgICAgICAgICQoJyNzdHVkZW50aWR2YWwnKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdCAgICAgICAgcmV0dXJuIHtcblx0XHRcdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHRcdFx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHRcdFx0ICAgICAgICAgICAgfSlcblx0XHRcdCAgICAgICAgfTtcblx0XHRcdCAgICB9XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3N0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2VuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNzdGFydCcsICcjZW5kJywgJyNkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNiZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI2JzdGFydCcsICcjYmVuZCcsICcjYmR1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnJlcGVhdHVudGlsX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSk7XG5cblx0XHRcdC8vY2hhbmdlIHJlbmRlcmluZyBvZiBldmVudHNcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdFx0XHRlbGVtZW50LmFkZENsYXNzKFwiZmMtY2xpY2thYmxlXCIpO1xuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ20nKXtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkJykudmFsKGV2ZW50LnN0dWRlbnRuYW1lKTtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdH1lbHNlIGlmIChldmVudC50eXBlID09ICdiJyl7XG5cdFx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0XHRldmVudDogZXZlbnRcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmKGV2ZW50LnJlcGVhdCA9PSAnMCcpe1xuXHRcdFx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRcdFx0ZW5kOiBlbmRcblx0XHRcdFx0fTtcblx0XHRcdFx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly9iaW5kIG1vcmUgYnV0dG9uc1xuXHRcdFx0JCgnI2JyZXBlYXQnKS5jaGFuZ2UocmVwZWF0Q2hhbmdlKTtcblxuXHRcdFx0JCgnI3NhdmVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVCbGFja291dCk7XG5cblx0XHRcdCQoJyNibGFja291dFNlcmllcycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRPY2N1cnJlbmNlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dE9jY3VycmVuY2UoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYWR2aXNpbmdCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlTWVldGluZ0J0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0QnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdCQoJyNyZXNvbHZlQnV0dG9uJykub24oJ2NsaWNrJywgcmVzb2x2ZUNvbmZsaWN0cyk7XG5cblx0XHRcdGxvYWRDb25mbGljdHMoKTtcblxuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBub3QgYW4gYWR2aXNvciwgYmluZCBsZXNzIGRhdGFcblx0XHR9ZWxzZXtcblxuXHRcdFx0Ly9HZXQgdGhlIGN1cnJlbnQgc3R1ZGVudCdzIG5hbWVcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9ICQoJyNjYWxlbmRhclN0dWRlbnROYW1lJykudmFsKCkudHJpbSgpO1xuXG5cdFx0ICAvL1JlbmRlciBibGFja291dHMgdG8gYmFja2dyb3VuZFxuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcblxuXHRcdCAgLy9XaGVuIHJlbmRlcmluZywgdXNlIHRoaXMgY3VzdG9tIGZ1bmN0aW9uIGZvciBibGFja291dHMgYW5kIHN0dWRlbnQgbWVldGluZ3Ncblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdFx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHRcdCAgICB9XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdFx0ICAgIH1cblx0XHRcdH07XG5cblx0XHQgIC8vVXNlIHRoaXMgbWV0aG9kIGZvciBjbGlja2luZyBvbiBtZWV0aW5nc1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdFx0XHRcdGlmKGV2ZW50LnN0YXJ0LmlzQWZ0ZXIobW9tZW50KCkpKXtcblx0XHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydChcIllvdSBjYW5ub3QgZWRpdCBtZWV0aW5ncyBpbiB0aGUgcGFzdFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHQgIC8vV2hlbiBzZWxlY3RpbmcgbmV3IGFyZWFzLCB1c2UgdGhlIHN0dWRlbnRTZWxlY3QgbWV0aG9kIGluIHRoZSBjYWxlbmRhciBsaWJyYXJ5XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBzdHVkZW50U2VsZWN0O1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjZGVzYycpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0X3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoXCIjZW5kXCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI2VuZF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcubW9kYWwnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblx0XHR9XG5cblx0XHQvL0JpbmQgY2xpY2sgaGFuZGxlcnMgb24gdGhlIGZvcm1cblx0XHQkKCcjc2F2ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZU1lZXRpbmcpO1xuXHRcdCQoJyNkZWxldGVCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZU1lZXRpbmcpO1xuXHRcdCQoJyNkdXJhdGlvbicpLm9uKCdjaGFuZ2UnLCBjaGFuZ2VEdXJhdGlvbik7XG5cblx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycyB3aXRoIG5vIGJpbmRpbmdcblx0fWVsc2V7XG5cdFx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycywgc2V0IHJlbmRlcmluZyB0byBiYWNrZ3JvdW5kXG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3RhYmxlID0gZmFsc2U7XG5cbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHQgICAgfVxuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdCAgICB9XG5cdFx0fTtcblx0fVxuXG5cdC8vaW5pdGFsaXplIHRoZSBjYWxlbmRhciFcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKGV4cG9ydHMuY2FsZW5kYXJEYXRhKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBjYWxlbmRhciBieSBjbG9zaW5nIG1vZGFscyBhbmQgcmVsb2FkaW5nIGRhdGFcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBqUXVlcnkgaWRlbnRpZmllciBvZiB0aGUgZm9ybSB0byBoaWRlIChhbmQgdGhlIHNwaW4pXG4gKiBAcGFyYW0gcmVwb25zZSAtIHRoZSBBeGlvcyByZXBzb25zZSBvYmplY3QgcmVjZWl2ZWRcbiAqL1xudmFyIHJlc2V0Q2FsZW5kYXIgPSBmdW5jdGlvbihlbGVtZW50LCByZXNwb25zZSl7XG5cdC8vaGlkZSB0aGUgZm9ybVxuXHQkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9kaXNwbGF5IHRoZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG5cdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXG5cdC8vcmVmcmVzaCB0aGUgY2FsZW5kYXJcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0JChlbGVtZW50ICsgJ1NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0aWYod2luZG93LmFkdmlzb3Ipe1xuXHRcdGxvYWRDb25mbGljdHMoKTtcblx0fVxufVxuXG4vKipcbiAqIEFKQVggbWV0aG9kIHRvIHNhdmUgZGF0YSBmcm9tIGEgZm9ybVxuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIHNvdXJjZSBlbGVtZW50IG9mIHRoZSBkYXRhXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4U2F2ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uKXtcblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0ICAvL2lmIHJlc3BvbnNlIGlzIDJ4eFxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdH0pXG5cdFx0Ly9pZiByZXNwb25zZSBpcyBub3QgMnh4XG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0fSk7XG59XG5cbnZhciBhamF4RGVsZXRlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24sIG5vUmVzZXQsIG5vQ2hvaWNlKXtcblx0Ly9jaGVjayBub1Jlc2V0IHZhcmlhYmxlXG5cdG5vUmVzZXQgfHwgKG5vUmVzZXQgPSBmYWxzZSk7XG5cdG5vQ2hvaWNlIHx8IChub0Nob2ljZSA9IGZhbHNlKTtcblxuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uXG5cdGlmKCFub0Nob2ljZSl7XG5cdFx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHR9ZWxzZXtcblx0XHR2YXIgY2hvaWNlID0gdHJ1ZTtcblx0fVxuXG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cblx0XHQvL2lmIGNvbmZpcm1lZCwgc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JChlbGVtZW50ICsgJ1NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL21ha2UgQUpBWCByZXF1ZXN0IHRvIGRlbGV0ZVxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYobm9SZXNldCl7XG5cdFx0XHRcdFx0Ly9oaWRlIHBhcmVudCBlbGVtZW50IC0gVE9ETyBURVNUTUVcblx0XHRcdFx0XHQvL2NhbGxlci5wYXJlbnQoKS5wYXJlbnQoKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50ICsgJ1NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50KS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2F2ZSBhIG1lZXRpbmdcbiAqL1xudmFyIHNhdmVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUV2ZW50U3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdHN0YXJ0OiBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdGVuZDogbW9tZW50KCQoJyNlbmQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0dGl0bGU6ICQoJyN0aXRsZScpLnZhbCgpLFxuXHRcdGRlc2M6ICQoJyNkZXNjJykudmFsKCksXG5cdFx0c3RhdHVzOiAkKCcjc3RhdHVzJykudmFsKClcblx0fTtcblx0ZGF0YS5pZCA9IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQ7XG5cdGlmKCQoJyNtZWV0aW5nSUQnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEubWVldGluZ2lkID0gJCgnI21lZXRpbmdJRCcpLnZhbCgpO1xuXHR9XG5cdGlmKCQoJyNzdHVkZW50aWR2YWwnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEuc3R1ZGVudGlkID0gJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpO1xuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZW1lZXRpbmcnO1xuXG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnc2F2ZSBtZWV0aW5nJyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgdXJsXG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogJCgnI21lZXRpbmdJRCcpLnZhbCgpXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnZGVsZXRlIG1lZXRpbmcnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHBvcHVsYXRlIGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGVkaXRpbmdcbiAqXG4gKiBAcGFyYW0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gZWRpdFxuICovXG52YXIgc2hvd01lZXRpbmdGb3JtID0gZnVuY3Rpb24oZXZlbnQpe1xuXHQkKCcjdGl0bGUnKS52YWwoZXZlbnQudGl0bGUpO1xuXHQkKCcjc3RhcnQnKS52YWwoZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2VuZCcpLnZhbChldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2Rlc2MnKS52YWwoZXZlbnQuZGVzYyk7XG5cdGR1cmF0aW9uT3B0aW9ucyhldmVudC5zdGFydCwgZXZlbnQuZW5kKTtcblx0JCgnI21lZXRpbmdJRCcpLnZhbChldmVudC5pZCk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdCQoJyNzdGF0dXMnKS52YWwoZXZlbnQuc3RhdHVzKTtcblx0JCgnI2RlbGV0ZUJ1dHRvbicpLnNob3coKTtcblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgY3JlYXRpb25cbiAqXG4gKiBAcGFyYW0gY2FsZW5kYXJTdHVkZW50TmFtZSAtIHN0cmluZyBuYW1lIG9mIHRoZSBzdHVkZW50XG4gKi9cbnZhciBjcmVhdGVNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGNhbGVuZGFyU3R1ZGVudE5hbWUpe1xuXG5cdC8vcG9wdWxhdGUgdGhlIHRpdGxlIGF1dG9tYXRpY2FsbHkgZm9yIGEgc3R1ZGVudFxuXHRpZihjYWxlbmRhclN0dWRlbnROYW1lICE9PSB1bmRlZmluZWQpe1xuXHRcdCQoJyN0aXRsZScpLnZhbChjYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fWVsc2V7XG5cdFx0JCgnI3RpdGxlJykudmFsKCcnKTtcblx0fVxuXG5cdC8vU2V0IHN0YXJ0IHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3N0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjc3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGVuZCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2VuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGR1cmF0aW9uIG9wdGlvbnNcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0ZHVyYXRpb25PcHRpb25zKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLCBtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkpO1xuXHR9ZWxzZXtcblx0XHRkdXJhdGlvbk9wdGlvbnMoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQsIGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCk7XG5cdH1cblxuXHQvL1Jlc2V0IG90aGVyIG9wdGlvbnNcblx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdC8vSGlkZSBkZWxldGUgYnV0dG9uXG5cdCQoJyNkZWxldGVCdXR0b24nKS5oaWRlKCk7XG5cblx0Ly9TaG93IHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gb24gdGhpcyBwYWdlXG4gKi9cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICAkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzZXQgZHVyYXRpb24gb3B0aW9ucyBmb3IgdGhlIG1lZXRpbmcgZm9ybVxuICpcbiAqIEBwYXJhbSBzdGFydCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IHRpbWVcbiAqIEBwYXJhbSBlbmQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmRpbmcgdGltZVxuICovXG52YXIgZHVyYXRpb25PcHRpb25zID0gZnVuY3Rpb24oc3RhcnQsIGVuZCl7XG5cdC8vY2xlYXIgdGhlIGxpc3Rcblx0JCgnI2R1cmF0aW9uJykuZW1wdHkoKTtcblxuXHQvL2Fzc3VtZSBhbGwgbWVldGluZ3MgaGF2ZSByb29tIGZvciAyMCBtaW51dGVzXG5cdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzIwJz4yMCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjIwLCBhbGxvdyA0MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAyMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzQwJz40MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MDAsIGFsbG93IDYwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc2MCc+NjAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vc2V0IGRlZmF1bHQgdmFsdWUgYmFzZWQgb24gZ2l2ZW4gc3BhblxuXHQkKCcjZHVyYXRpb24nKS52YWwoZW5kLmRpZmYoc3RhcnQsIFwibWludXRlc1wiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxpbmsgdGhlIGRhdGVwaWNrZXJzIHRvZ2V0aGVyXG4gKlxuICogQHBhcmFtIGVsZW0xIC0galF1ZXJ5IG9iamVjdCBmb3IgZmlyc3QgZGF0ZXBpY2tlclxuICogQHBhcmFtIGVsZW0yIC0galF1ZXJ5IG9iamVjdCBmb3Igc2Vjb25kIGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBsaW5rRGF0ZVBpY2tlcnMgPSBmdW5jdGlvbihlbGVtMSwgZWxlbTIsIGR1cmF0aW9uKXtcblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gZmlyc3QgZGF0YXBpY2tlclxuXHQkKGVsZW0xICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMiA9IG1vbWVudCgkKGVsZW0yKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0FmdGVyKGRhdGUyKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUyKSl7XG5cdFx0XHRkYXRlMiA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMikudmFsKGRhdGUyLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBzZWNvbmQgZGF0ZXBpY2tlclxuXHQkKGVsZW0yICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMSA9IG1vbWVudCgkKGVsZW0xKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0JlZm9yZShkYXRlMSkgfHwgZS5kYXRlLmlzU2FtZShkYXRlMSkpe1xuXHRcdFx0ZGF0ZTEgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTEpLnZhbChkYXRlMS5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGNoYW5nZUR1cmF0aW9uID0gZnVuY3Rpb24oKXtcblx0dmFyIG5ld0RhdGUgPSBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksICdMTEwnKS5hZGQoJCh0aGlzKS52YWwoKSwgXCJtaW51dGVzXCIpO1xuXHQkKCcjZW5kJykudmFsKG5ld0RhdGUuZm9ybWF0KFwiTExMXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmVyaWZ5IHRoYXQgdGhlIHN0dWRlbnRzIGFyZSBzZWxlY3RpbmcgbWVldGluZ3MgdGhhdCBhcmVuJ3QgdG9vIGxvbmdcbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgb2YgdGhlIG1lZXRpbmdcbiAqIEBwYXJhbSBlbmQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBzdHVkZW50U2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXG5cdC8vV2hlbiBzdHVkZW50cyBzZWxlY3QgYSBtZWV0aW5nLCBkaWZmIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzXG5cdGlmKGVuZC5kaWZmKHN0YXJ0LCAnbWludXRlcycpID4gNjApe1xuXG5cdFx0Ly9pZiBpbnZhbGlkLCB1bnNlbGVjdCBhbmQgc2hvdyBhbiBlcnJvclxuXHRcdGFsZXJ0KFwiTWVldGluZ3MgY2Fubm90IGxhc3QgbG9uZ2VyIHRoYW4gMSBob3VyXCIpO1xuXHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0fWVsc2V7XG5cblx0XHQvL2lmIHZhbGlkLCBzZXQgZGF0YSBpbiB0aGUgc2Vzc2lvbiBhbmQgc2hvdyB0aGUgZm9ybVxuXHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0ZW5kOiBlbmRcblx0XHR9O1xuXHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdGNyZWF0ZU1lZXRpbmdGb3JtKGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1cbn07XG5cbi8qKlxuICogTG9hZCBjb25mbGljdGluZyBtZWV0aW5ncyBmcm9tIHRoZSBzZXJ2ZXJcbiAqL1xudmFyIGxvYWRDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXG5cdC8vcmVxdWVzdCBjb25mbGljdHMgdmlhIEFKQVhcblx0d2luZG93LmF4aW9zLmdldCgnL2FkdmlzaW5nL2NvbmZsaWN0cycpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXG5cdFx0XHQvL2Rpc2FibGUgZXhpc3RpbmcgY2xpY2sgaGFuZGxlcnNcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgMjAwLCBkYXRhIHdhcyByZWNlaXZlZFxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IDIwMCl7XG5cblx0XHRcdFx0Ly9BcHBlbmQgSFRNTCBmb3IgY29uZmxpY3RzIHRvIERPTVxuXHRcdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKS5lbXB0eSgpO1xuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0XHRcdFx0XHQkKCc8ZGl2Lz4nLCB7XG5cdFx0XHRcdFx0XHQnaWQnIDogJ3Jlc29sdmUnK3ZhbHVlLmlkLFxuXHRcdFx0XHRcdFx0J2NsYXNzJzogJ21lZXRpbmctY29uZmxpY3QnLFxuXHRcdFx0XHRcdFx0J2h0bWwnOiBcdCc8cD4mbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIHB1bGwtcmlnaHQgZGVsZXRlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5EZWxldGU8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCcmbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBwdWxsLXJpZ2h0IGVkaXRDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkVkaXQ8L2J1dHRvbj4gJyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCByZXNvbHZlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5LZWVwIE1lZXRpbmc8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8c3BhbiBpZD1cInJlc29sdmUnK3ZhbHVlLmlkKydTcGluXCIgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpbiBmYS1sZyBwdWxsLXJpZ2h0IGhpZGUtc3BpblwiPiZuYnNwOzwvc3Bhbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxiPicrdmFsdWUudGl0bGUrJzwvYj4gKCcrdmFsdWUuc3RhcnQrJyk8L3A+PGhyPidcblx0XHRcdFx0XHRcdH0pLmFwcGVuZFRvKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly9SZS1yZWdpc3RlciBjbGljayBoYW5kbGVyc1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0XHQvL1Nob3cgdGhlIDxkaXY+IGNvbnRhaW5pbmcgY29uZmxpY3RzXG5cdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXG5cdFx0ICAvL0lmIHJlc3BvbnNlIGlzIDIwNCwgbm8gY29uZmxpY3RzIGFyZSBwcmVzZW50XG5cdFx0XHR9ZWxzZSBpZihyZXNwb25zZS5zdGF0dXMgPT0gMjA0KXtcblxuXHRcdFx0XHQvL0hpZGUgdGhlIDxkaXY+IGNvbnRhaW5pbmcgY29uZmxpY3RzXG5cdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIHJldHJpZXZlIGNvbmZsaWN0aW5nIG1lZXRpbmdzOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pO1xuXG5cdFx0Lypcblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdG1ldGhvZDogXCJHRVRcIixcblx0XHRcdFx0dXJsOiAnL2FkdmlzaW5nL2NvbmZsaWN0cycsXG5cdFx0XHRcdGRhdGFUeXBlOiAnanNvbidcblx0XHRcdH0pXG5cdFx0XHQuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBtZXNzYWdlLCBqcVhIUikge1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblx0XHRcdFx0aWYoanFYSFIuc3RhdHVzID09IDIwMCl7XG5cdFx0XHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJykuZW1wdHkoKTtcblx0XHRcdFx0XHQkLmVhY2goZGF0YSwgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0XHRcdFx0XHRcdCQoJzxkaXYvPicsIHtcblx0XHRcdFx0XHRcdFx0J2NsYXNzJzogJ21lZXRpbmctY29uZmxpY3QnLFxuXHRcdFx0XHRcdFx0XHRcdFx0J2h0bWwnOiBcdCc8cD4mbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIHB1bGwtcmlnaHQgZGVsZXRlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5EZWxldGU8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcmbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBwdWxsLXJpZ2h0IGVkaXRDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkVkaXQ8L2J1dHRvbj4gJyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCByZXNvbHZlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5LZWVwIE1lZXRpbmc8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCc8c3BhbiBpZD1cInJlc29sdmVTcGluJyt2YWx1ZS5pZCsnXCIgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpbiBmYS1sZyBwdWxsLXJpZ2h0IGhpZGUtc3BpblwiPiZuYnNwOzwvc3Bhbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JzxiPicrdmFsdWUudGl0bGUrJzwvYj4gKCcrdmFsdWUuc3RhcnQrJyk8L3A+PGhyPidcblx0XHRcdFx0XHRcdFx0fSkuYXBwZW5kVG8oJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblx0XHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fWVsc2UgaWYgKGpxWEhSLnN0YXR1cyA9PSAyMDQpe1xuXHRcdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5mYWlsKGZ1bmN0aW9uKCBqcVhIUiwgbWVzc2FnZSApe1xuXHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBqcVhIUi5yZXNwb25zZUpTT04pO1xuXHRcdFx0fSk7XG5cdFx0Ki9cbn1cblxuLyoqXG4gKiBTYXZlIGJsYWNrb3V0cyBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBzYXZlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlQmxhY2tvdXRTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCB1cmw7XG5cdHZhciBkYXRhID0ge1xuXHRcdGJzdGFydDogbW9tZW50KCQoJyNic3RhcnQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJlbmQ6IG1vbWVudCgkKCcjYmVuZCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YnRpdGxlOiAkKCcjYnRpdGxlJykudmFsKClcblx0fTtcblx0dmFyIHVybDtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YS5iYmxhY2tvdXRldmVudGlkID0gJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dCc7XG5cdFx0aWYoJCgnI2JibGFja291dGlkJykudmFsKCkgPiAwKXtcblx0XHRcdGRhdGEuYmJsYWNrb3V0aWQgPSAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKTtcblx0XHR9XG5cdFx0ZGF0YS5icmVwZWF0ID0gJCgnI2JyZXBlYXQnKS52YWwoKTtcblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDEpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnk9ICQoJyNicmVwZWF0ZGFpbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDIpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnkgPSAkKCcjYnJlcGVhdHdlZWtseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNtID0gJCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3QgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdyA9ICQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN1ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c2YgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ3NhdmUgYmxhY2tvdXQnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGJsYWNrb3V0IGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIGRlbGV0ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIFVSTCBhbmQgZGF0YSBvYmplY3Rcblx0dmFyIHVybCwgZGF0YTtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0ZXZlbnRpZDogJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSB9O1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRpZDogJCgnI2JibGFja291dGlkJykudmFsKCkgfTtcblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnZGVsZXRlIGJsYWNrb3V0JywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGNoYW5nZSBvZiByZXBlYXQgb3B0aW9ucyBvbiB0aGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgcmVwZWF0Q2hhbmdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCh0aGlzKS52YWwoKSA9PSAwKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMSl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDIpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fVxufTtcblxuLyoqXG4gKiBTaG93IHRoZSByZXNvbHZlIGNvbmZsaWN0cyBtb2RhbCBmb3JtXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0Ly9zZW5kIEFKQVggZGVsZXRlXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdkZWxldGUgbWVldGluZycsIHRydWUpO1xuXG59O1xuXG4vKipcbiAqIEVkaXQgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZWRpdENvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9tZWV0aW5nJztcblxuXHQvL3Nob3cgc3Bpbm5lciB0byBsb2FkIG1lZXRpbmdcblx0JCgnI3Jlc29sdmUnKyBpZCArICdTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vbG9hZCBtZWV0aW5nIGFuZCBkaXNwbGF5IGZvcm1cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI3Jlc29sdmUnKyBpZCArICdTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRldmVudCA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRldmVudC5zdGFydCA9IG1vbWVudChldmVudC5zdGFydCk7XG5cdFx0XHRldmVudC5lbmQgPSBtb21lbnQoZXZlbnQuZW5kKTtcblx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgbWVldGluZycsICcjcmVzb2x2ZScgKyBpZCwgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBSZXNvbHZlIGEgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9yZXNvbHZlY29uZmxpY3QnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdyZXNvbHZlIG1lZXRpbmcnLCB0cnVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBjcmVhdGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgY3JlYXRlQmxhY2tvdXRGb3JtID0gZnVuY3Rpb24oKXtcblx0JCgnI2J0aXRsZScpLnZhbChcIlwiKTtcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQoKS5ob3VyKDkpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0JCgnI2JyZXBlYXQnKS52YWwoMCk7XG5cdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmhpZGUoKTtcblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gdG8gYSBzaW5nbGUgb2NjdXJyZW5jZVxuICovXG52YXIgYmxhY2tvdXRPY2N1cnJlbmNlID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9zZXQgZm9ybSB2YWx1ZXMgYW5kIGhpZGUgdW5uZWVkZWQgZmllbGRzXG5cdCQoJyNidGl0bGUnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQudGl0bGUpO1xuXHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjcmVwZWF0ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0JCgnI2JibGFja291dGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkKTtcblx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuaWQpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cblx0Ly9zaG93IHRoZSBmb3JtXG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBibGFja291dCBzZXJpZXMgZWRpdCBmb3JtXG4gKi9cbnZhciBibGFja291dFNlcmllcyA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuIFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRpZDogZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9ibGFja291dCc7XG5cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI2J0aXRsZScpLnZhbChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXHQgXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuc3RhcnQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuZW5kLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChyZXNwb25zZS5kYXRhLmlkKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdCBcdFx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQgXHRcdGlmKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMSl7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdGRhaWx5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9ZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAyKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2x5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0XHRcdFx0dmFyIHJlcGVhdF9kZXRhaWwgPSBTdHJpbmcocmVzcG9uc2UuZGF0YS5yZXBlYXRfZGV0YWlsKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIxXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIyXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIzXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI0XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI1XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9XG5cdCBcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXHQgXHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgYmxhY2tvdXQgc2VyaWVzJywgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IHN0dWRlbnQgaW4gdGhlIGRhdGFiYXNlXG4gKi9cbnZhciBuZXdTdHVkZW50ID0gZnVuY3Rpb24oKXtcblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGFuIGVJRCB0byBhZGQgdG8gdGhlIHN5c3RlbVxuXHR2YXIgZWlkID0gcHJvbXB0KFwiRW50ZXIgdGhlIHN0dWRlbnQncyBlSURcIik7XG5cblx0Ly9idWlsZCB0aGUgVVJMIGFuZCBkYXRhXG5cdHZhciBkYXRhID0ge1xuXHRcdGVpZDogZWlkLFxuXHR9O1xuXHR2YXIgdXJsID0gJy9wcm9maWxlL25ld3N0dWRlbnQnO1xuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGFbXCJlaWRcIl0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCIvKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIGZvciBlZGl0YWJsZSB0ZXh0LWJveGVzIG9uIHRoZSBzaXRlXG4gKiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgLy9Mb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xuICByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG4gIHJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcbiAgc2l0ZSA9IHJlcXVpcmUoJy4vc2l0ZScpO1xuXG4gIC8vQ2hlY2sgZm9yIG1lc3NhZ2VzIGluIHRoZSBzZXNzaW9uICh1c3VhbGx5IGZyb20gYSBwcmV2aW91cyBzdWNjZXNzZnVsIHNhdmUpXG4gIHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgW2VkaXRdIGxpbmtzXG4gICQoJy5lZGl0YWJsZS1saW5rJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9oaWRlIHRoZSBbZWRpdF0gbGlua3MsIGVuYWJsZSBlZGl0b3IsIGFuZCBzaG93IFNhdmUgYW5kIENhbmNlbCBidXR0b25zXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSh7XG4gICAgICAgIGZvY3VzOiB0cnVlLFxuICAgICAgICB0b29sYmFyOiBbXG4gICAgICAgICAgLy8gW2dyb3VwTmFtZSwgW2xpc3Qgb2YgYnV0dG9uc11dXG4gICAgICAgICAgWydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuICAgICAgICAgIFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcbiAgICAgICAgICBbJ3BhcmEnLCBbJ3VsJywgJ29sJywgJ3BhcmFncmFwaCddXSxcbiAgICAgICAgICBbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcbiAgICAgICAgXSxcbiAgICAgICAgdGFic2l6ZTogMixcbiAgICAgICAgY29kZW1pcnJvcjoge1xuICAgICAgICAgIG1vZGU6ICd0ZXh0L2h0bWwnLFxuICAgICAgICAgIGh0bWxNb2RlOiB0cnVlLFxuICAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnbW9ub2thaSdcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBTYXZlIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLXNhdmUnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL0Rpc3BsYXkgc3Bpbm5lciB3aGlsZSBBSkFYIGNhbGwgaXMgcGVyZm9ybWVkXG4gICAgICAkKCcjZWRpdGFibGVzcGluLScgKyBpZCkucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG4gICAgICAvL0dldCBjb250ZW50cyBvZiBlZGl0b3JcbiAgICAgIHZhciBodG1sU3RyaW5nID0gJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnY29kZScpO1xuXG4gICAgICAvL1Bvc3QgY29udGVudHMgdG8gc2VydmVyLCB3YWl0IGZvciByZXNwb25zZVxuICAgICAgd2luZG93LmF4aW9zLnBvc3QoJy9lZGl0YWJsZS9zYXZlLycgKyBpZCwge1xuICAgICAgICBjb250ZW50czogaHRtbFN0cmluZ1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgLy9JZiByZXNwb25zZSAyMDAgcmVjZWl2ZWQsIGFzc3VtZSBpdCBzYXZlZCBhbmQgcmVsb2FkIHBhZ2VcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIGFsZXJ0KFwiVW5hYmxlIHRvIHNhdmUgY29udGVudDogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBDYW5jZWwgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtY2FuY2VsJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9SZXNldCB0aGUgY29udGVudHMgb2YgdGhlIGVkaXRvciBhbmQgZGVzdHJveSBpdFxuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgncmVzZXQnKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2Rlc3Ryb3knKTtcblxuICAgICAgLy9IaWRlIFNhdmUgYW5kIENhbmNlbCBidXR0b25zLCBhbmQgc2hvdyBbZWRpdF0gbGlua1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIiwiLy8gQ29kZU1pcnJvciwgY29weXJpZ2h0IChjKSBieSBNYXJpam4gSGF2ZXJiZWtlIGFuZCBvdGhlcnNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIGFuIE1JVCBsaWNlbnNlOiBodHRwOi8vY29kZW1pcnJvci5uZXQvTElDRU5TRVxuXG4oZnVuY3Rpb24obW9kKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2QocmVxdWlyZShcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIpKTtcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgZGVmaW5lKFtcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCJdLCBtb2QpO1xuICBlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgbW9kKENvZGVNaXJyb3IpO1xufSkoZnVuY3Rpb24oQ29kZU1pcnJvcikge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBodG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHsnYXJlYSc6IHRydWUsICdiYXNlJzogdHJ1ZSwgJ2JyJzogdHJ1ZSwgJ2NvbCc6IHRydWUsICdjb21tYW5kJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2VtYmVkJzogdHJ1ZSwgJ2ZyYW1lJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ2ltZyc6IHRydWUsICdpbnB1dCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdrZXlnZW4nOiB0cnVlLCAnbGluayc6IHRydWUsICdtZXRhJzogdHJ1ZSwgJ3BhcmFtJzogdHJ1ZSwgJ3NvdXJjZSc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICd0cmFjayc6IHRydWUsICd3YnInOiB0cnVlLCAnbWVudWl0ZW0nOiB0cnVlfSxcbiAgaW1wbGljaXRseUNsb3NlZDogeydkZCc6IHRydWUsICdsaSc6IHRydWUsICdvcHRncm91cCc6IHRydWUsICdvcHRpb24nOiB0cnVlLCAncCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAncnAnOiB0cnVlLCAncnQnOiB0cnVlLCAndGJvZHknOiB0cnVlLCAndGQnOiB0cnVlLCAndGZvb3QnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3RoJzogdHJ1ZSwgJ3RyJzogdHJ1ZX0sXG4gIGNvbnRleHRHcmFiYmVyczoge1xuICAgICdkZCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnZHQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2xpJzogeydsaSc6IHRydWV9LFxuICAgICdvcHRpb24nOiB7J29wdGlvbic6IHRydWUsICdvcHRncm91cCc6IHRydWV9LFxuICAgICdvcHRncm91cCc6IHsnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAncCc6IHsnYWRkcmVzcyc6IHRydWUsICdhcnRpY2xlJzogdHJ1ZSwgJ2FzaWRlJzogdHJ1ZSwgJ2Jsb2NrcXVvdGUnOiB0cnVlLCAnZGlyJzogdHJ1ZSxcbiAgICAgICAgICAnZGl2JzogdHJ1ZSwgJ2RsJzogdHJ1ZSwgJ2ZpZWxkc2V0JzogdHJ1ZSwgJ2Zvb3Rlcic6IHRydWUsICdmb3JtJzogdHJ1ZSxcbiAgICAgICAgICAnaDEnOiB0cnVlLCAnaDInOiB0cnVlLCAnaDMnOiB0cnVlLCAnaDQnOiB0cnVlLCAnaDUnOiB0cnVlLCAnaDYnOiB0cnVlLFxuICAgICAgICAgICdoZWFkZXInOiB0cnVlLCAnaGdyb3VwJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ21lbnUnOiB0cnVlLCAnbmF2JzogdHJ1ZSwgJ29sJzogdHJ1ZSxcbiAgICAgICAgICAncCc6IHRydWUsICdwcmUnOiB0cnVlLCAnc2VjdGlvbic6IHRydWUsICd0YWJsZSc6IHRydWUsICd1bCc6IHRydWV9LFxuICAgICdycCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAncnQnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3Rib2R5Jzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0ZCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGZvb3QnOiB7J3Rib2R5JzogdHJ1ZX0sXG4gICAgJ3RoJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0aGVhZCc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndHInOiB7J3RyJzogdHJ1ZX1cbiAgfSxcbiAgZG9Ob3RJbmRlbnQ6IHtcInByZVwiOiB0cnVlfSxcbiAgYWxsb3dVbnF1b3RlZDogdHJ1ZSxcbiAgYWxsb3dNaXNzaW5nOiB0cnVlLFxuICBjYXNlRm9sZDogdHJ1ZVxufVxuXG52YXIgeG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHt9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7fSxcbiAgY29udGV4dEdyYWJiZXJzOiB7fSxcbiAgZG9Ob3RJbmRlbnQ6IHt9LFxuICBhbGxvd1VucXVvdGVkOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nVGFnTmFtZTogZmFsc2UsXG4gIGNhc2VGb2xkOiBmYWxzZVxufVxuXG5Db2RlTWlycm9yLmRlZmluZU1vZGUoXCJ4bWxcIiwgZnVuY3Rpb24oZWRpdG9yQ29uZiwgY29uZmlnXykge1xuICB2YXIgaW5kZW50VW5pdCA9IGVkaXRvckNvbmYuaW5kZW50VW5pdFxuICB2YXIgY29uZmlnID0ge31cbiAgdmFyIGRlZmF1bHRzID0gY29uZmlnXy5odG1sTW9kZSA/IGh0bWxDb25maWcgOiB4bWxDb25maWdcbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0cykgY29uZmlnW3Byb3BdID0gZGVmYXVsdHNbcHJvcF1cbiAgZm9yICh2YXIgcHJvcCBpbiBjb25maWdfKSBjb25maWdbcHJvcF0gPSBjb25maWdfW3Byb3BdXG5cbiAgLy8gUmV0dXJuIHZhcmlhYmxlcyBmb3IgdG9rZW5pemVyc1xuICB2YXIgdHlwZSwgc2V0U3R5bGU7XG5cbiAgZnVuY3Rpb24gaW5UZXh0KHN0cmVhbSwgc3RhdGUpIHtcbiAgICBmdW5jdGlvbiBjaGFpbihwYXJzZXIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gcGFyc2VyO1xuICAgICAgcmV0dXJuIHBhcnNlcihzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIhXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwiW1wiKSkge1xuICAgICAgICAgIGlmIChzdHJlYW0ubWF0Y2goXCJDREFUQVtcIikpIHJldHVybiBjaGFpbihpbkJsb2NrKFwiYXRvbVwiLCBcIl1dPlwiKSk7XG4gICAgICAgICAgZWxzZSByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCItLVwiKSkge1xuICAgICAgICAgIHJldHVybiBjaGFpbihpbkJsb2NrKFwiY29tbWVudFwiLCBcIi0tPlwiKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiRE9DVFlQRVwiLCB0cnVlLCB0cnVlKSkge1xuICAgICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGRvY3R5cGUoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmVhbS5lYXQoXCI/XCIpKSB7XG4gICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5CbG9jayhcIm1ldGFcIiwgXCI/PlwiKTtcbiAgICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZSA9IHN0cmVhbS5lYXQoXCIvXCIpID8gXCJjbG9zZVRhZ1wiIDogXCJvcGVuVGFnXCI7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIiZcIikge1xuICAgICAgdmFyIG9rO1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIjXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwieFwiKSkge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bYS1mQS1GXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLlxcLTpdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2sgPyBcImF0b21cIiA6IFwiZXJyb3JcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXiY8XS8pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGluVGV4dC5pc0luVGV4dCA9IHRydWU7XG5cbiAgZnVuY3Rpb24gaW5UYWcoc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPlwiIHx8IChjaCA9PSBcIi9cIiAmJiBzdHJlYW0uZWF0KFwiPlwiKSkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgdHlwZSA9IGNoID09IFwiPlwiID8gXCJlbmRUYWdcIiA6IFwic2VsZmNsb3NlVGFnXCI7XG4gICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIpIHtcbiAgICAgIHR5cGUgPSBcImVxdWFsc1wiO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICBzdGF0ZS5zdGF0ZSA9IGJhc2VTdGF0ZTtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICB2YXIgbmV4dCA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgcmV0dXJuIG5leHQgPyBuZXh0ICsgXCIgdGFnIGVycm9yXCIgOiBcInRhZyBlcnJvclwiO1xuICAgIH0gZWxzZSBpZiAoL1tcXCdcXFwiXS8udGVzdChjaCkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5BdHRyaWJ1dGUoY2gpO1xuICAgICAgc3RhdGUuc3RyaW5nU3RhcnRDb2wgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5tYXRjaCgvXlteXFxzXFx1MDBhMD08PlxcXCJcXCddKlteXFxzXFx1MDBhMD08PlxcXCJcXCdcXC9dLyk7XG4gICAgICByZXR1cm4gXCJ3b3JkXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5BdHRyaWJ1dGUocXVvdGUpIHtcbiAgICB2YXIgY2xvc3VyZSA9IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubmV4dCgpID09IHF1b3RlKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwic3RyaW5nXCI7XG4gICAgfTtcbiAgICBjbG9zdXJlLmlzSW5BdHRyaWJ1dGUgPSB0cnVlO1xuICAgIHJldHVybiBjbG9zdXJlO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5CbG9jayhzdHlsZSwgdGVybWluYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKHRlcm1pbmF0b3IpKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLm5leHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGRvY3R5cGUoZGVwdGgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgdmFyIGNoO1xuICAgICAgd2hpbGUgKChjaCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoICsgMSk7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNoID09IFwiPlwiKSB7XG4gICAgICAgICAgaWYgKGRlcHRoID09IDEpIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCAtIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCBzdGFydE9mTGluZSkge1xuICAgIHRoaXMucHJldiA9IHN0YXRlLmNvbnRleHQ7XG4gICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZTtcbiAgICB0aGlzLmluZGVudCA9IHN0YXRlLmluZGVudGVkO1xuICAgIHRoaXMuc3RhcnRPZkxpbmUgPSBzdGFydE9mTGluZTtcbiAgICBpZiAoY29uZmlnLmRvTm90SW5kZW50Lmhhc093blByb3BlcnR5KHRhZ05hbWUpIHx8IChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQubm9JbmRlbnQpKVxuICAgICAgdGhpcy5ub0luZGVudCA9IHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gcG9wQ29udGV4dChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5jb250ZXh0KSBzdGF0ZS5jb250ZXh0ID0gc3RhdGUuY29udGV4dC5wcmV2O1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgbmV4dFRhZ05hbWUpIHtcbiAgICB2YXIgcGFyZW50VGFnTmFtZTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKCFzdGF0ZS5jb250ZXh0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBhcmVudFRhZ05hbWUgPSBzdGF0ZS5jb250ZXh0LnRhZ05hbWU7XG4gICAgICBpZiAoIWNvbmZpZy5jb250ZXh0R3JhYmJlcnMuaGFzT3duUHJvcGVydHkocGFyZW50VGFnTmFtZSkgfHxcbiAgICAgICAgICAhY29uZmlnLmNvbnRleHRHcmFiYmVyc1twYXJlbnRUYWdOYW1lXS5oYXNPd25Qcm9wZXJ0eShuZXh0VGFnTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmFzZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIm9wZW5UYWdcIikge1xuICAgICAgc3RhdGUudGFnU3RhcnQgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImNsb3NlVGFnXCIpIHtcbiAgICAgIHJldHVybiBjbG9zZVRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VUYWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBpZiAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgIT0gdGFnTmFtZSAmJlxuICAgICAgICAgIGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KHN0YXRlLmNvbnRleHQudGFnTmFtZSkpXG4gICAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSA9PSB0YWdOYW1lKSB8fCBjb25maWcubWF0Y2hDbG9zaW5nID09PSBmYWxzZSkge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZyBlcnJvclwiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZVN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgIT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICB9XG4gICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZVN0YXRlRXJyKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dHJTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiYXR0cmlidXRlXCI7XG4gICAgICByZXR1cm4gYXR0ckVxU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZW5kVGFnXCIgfHwgdHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0YXRlLnRhZ05hbWUsIHRhZ1N0YXJ0ID0gc3RhdGUudGFnU3RhcnQ7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgaWYgKHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIiB8fFxuICAgICAgICAgIGNvbmZpZy5hdXRvU2VsZkNsb3NlcnMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICAgIHN0YXRlLmNvbnRleHQgPSBuZXcgQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgdGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyRXFTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJlcXVhbHNcIikgcmV0dXJuIGF0dHJWYWx1ZVN0YXRlO1xuICAgIGlmICghY29uZmlnLmFsbG93TWlzc2luZykgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyVmFsdWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIiAmJiBjb25maWcuYWxsb3dVbnF1b3RlZCkge3NldFN0eWxlID0gXCJzdHJpbmdcIjsgcmV0dXJuIGF0dHJTdGF0ZTt9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyQ29udGludWVkU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnRTdGF0ZTogZnVuY3Rpb24oYmFzZUluZGVudCkge1xuICAgICAgdmFyIHN0YXRlID0ge3Rva2VuaXplOiBpblRleHQsXG4gICAgICAgICAgICAgICAgICAgc3RhdGU6IGJhc2VTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICBpbmRlbnRlZDogYmFzZUluZGVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IG51bGwsIHRhZ1N0YXJ0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IG51bGx9XG4gICAgICBpZiAoYmFzZUluZGVudCAhPSBudWxsKSBzdGF0ZS5iYXNlSW5kZW50ID0gYmFzZUluZGVudFxuICAgICAgcmV0dXJuIHN0YXRlXG4gICAgfSxcblxuICAgIHRva2VuOiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlLnRhZ05hbWUgJiYgc3RyZWFtLnNvbCgpKVxuICAgICAgICBzdGF0ZS5pbmRlbnRlZCA9IHN0cmVhbS5pbmRlbnRhdGlvbigpO1xuXG4gICAgICBpZiAoc3RyZWFtLmVhdFNwYWNlKCkpIHJldHVybiBudWxsO1xuICAgICAgdHlwZSA9IG51bGw7XG4gICAgICB2YXIgc3R5bGUgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmICgoc3R5bGUgfHwgdHlwZSkgJiYgc3R5bGUgIT0gXCJjb21tZW50XCIpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBudWxsO1xuICAgICAgICBzdGF0ZS5zdGF0ZSA9IHN0YXRlLnN0YXRlKHR5cGUgfHwgc3R5bGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICBpZiAoc2V0U3R5bGUpXG4gICAgICAgICAgc3R5bGUgPSBzZXRTdHlsZSA9PSBcImVycm9yXCIgPyBzdHlsZSArIFwiIGVycm9yXCIgOiBzZXRTdHlsZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9LFxuXG4gICAgaW5kZW50OiBmdW5jdGlvbihzdGF0ZSwgdGV4dEFmdGVyLCBmdWxsTGluZSkge1xuICAgICAgdmFyIGNvbnRleHQgPSBzdGF0ZS5jb250ZXh0O1xuICAgICAgLy8gSW5kZW50IG11bHRpLWxpbmUgc3RyaW5ncyAoZS5nLiBjc3MpLlxuICAgICAgaWYgKHN0YXRlLnRva2VuaXplLmlzSW5BdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLnRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5zdHJpbmdTdGFydENvbCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUuaW5kZW50ZWQgKyBpbmRlbnRVbml0O1xuICAgICAgfVxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5ub0luZGVudCkgcmV0dXJuIENvZGVNaXJyb3IuUGFzcztcbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSAhPSBpblRhZyAmJiBzdGF0ZS50b2tlbml6ZSAhPSBpblRleHQpXG4gICAgICAgIHJldHVybiBmdWxsTGluZSA/IGZ1bGxMaW5lLm1hdGNoKC9eKFxccyopLylbMF0ubGVuZ3RoIDogMDtcbiAgICAgIC8vIEluZGVudCB0aGUgc3RhcnRzIG9mIGF0dHJpYnV0ZSBuYW1lcy5cbiAgICAgIGlmIChzdGF0ZS50YWdOYW1lKSB7XG4gICAgICAgIGlmIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50UGFzdFRhZyAhPT0gZmFsc2UpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgc3RhdGUudGFnTmFtZS5sZW5ndGggKyAyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgaW5kZW50VW5pdCAqIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50RmFjdG9yIHx8IDEpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5hbGlnbkNEQVRBICYmIC88IVxcW0NEQVRBXFxbLy50ZXN0KHRleHRBZnRlcikpIHJldHVybiAwO1xuICAgICAgdmFyIHRhZ0FmdGVyID0gdGV4dEFmdGVyICYmIC9ePChcXC8pPyhbXFx3XzpcXC4tXSopLy5leGVjKHRleHRBZnRlcik7XG4gICAgICBpZiAodGFnQWZ0ZXIgJiYgdGFnQWZ0ZXJbMV0pIHsgLy8gQ2xvc2luZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0LnRhZ05hbWUgPT0gdGFnQWZ0ZXJbMl0pIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KGNvbnRleHQudGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0YWdBZnRlcikgeyAvLyBPcGVuaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgdmFyIGdyYWJiZXJzID0gY29uZmlnLmNvbnRleHRHcmFiYmVyc1tjb250ZXh0LnRhZ05hbWVdO1xuICAgICAgICAgIGlmIChncmFiYmVycyAmJiBncmFiYmVycy5oYXNPd25Qcm9wZXJ0eSh0YWdBZnRlclsyXSkpXG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoY29udGV4dCAmJiBjb250ZXh0LnByZXYgJiYgIWNvbnRleHQuc3RhcnRPZkxpbmUpXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICBpZiAoY29udGV4dCkgcmV0dXJuIGNvbnRleHQuaW5kZW50ICsgaW5kZW50VW5pdDtcbiAgICAgIGVsc2UgcmV0dXJuIHN0YXRlLmJhc2VJbmRlbnQgfHwgMDtcbiAgICB9LFxuXG4gICAgZWxlY3RyaWNJbnB1dDogLzxcXC9bXFxzXFx3Ol0rPiQvLFxuICAgIGJsb2NrQ29tbWVudFN0YXJ0OiBcIjwhLS1cIixcbiAgICBibG9ja0NvbW1lbnRFbmQ6IFwiLS0+XCIsXG5cbiAgICBjb25maWd1cmF0aW9uOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG4gICAgaGVscGVyVHlwZTogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuXG4gICAgc2tpcEF0dHJpYnV0ZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5zdGF0ZSA9PSBhdHRyVmFsdWVTdGF0ZSlcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBhdHRyU3RhdGVcbiAgICB9XG4gIH07XG59KTtcblxuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC94bWxcIiwgXCJ4bWxcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi94bWxcIiwgXCJ4bWxcIik7XG5pZiAoIUNvZGVNaXJyb3IubWltZU1vZGVzLmhhc093blByb3BlcnR5KFwidGV4dC9odG1sXCIpKVxuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2h0bWxcIiwge25hbWU6IFwieG1sXCIsIGh0bWxNb2RlOiB0cnVlfSk7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanNcbi8vIG1vZHVsZSBpZCA9IDE3NVxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCJzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuXHRcdFx0bGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG5cdFx0fTtcblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHQvL3NlbmQgQUpBWCBwb3N0XG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBhZHZpc29yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlQWR2aXNvclByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZVNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdC8vVE9ETyBURVNUTUVcblx0XHR2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGRhdGEuYXBwZW5kKFwibmFtZVwiLCAkKCcjbmFtZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwicGhvbmVcIiwgJCgnI3Bob25lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuXHRcdGlmKCQoJyNwaWMnKS52YWwoKSl7XG5cdFx0XHRkYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZVNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYycpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0JCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0XHQkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0Ly9odHRwOi8vd3d3LmFiZWF1dGlmdWxzaXRlLm5ldC93aGlwcGluZy1maWxlLWlucHV0cy1pbnRvLXNoYXBlLXdpdGgtYm9vdHN0cmFwLTMvXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG5cdCAgdmFyIGlucHV0ID0gJCh0aGlzKSxcblx0ICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcblx0ICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG5cdCAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcblx0fSk7XG5cblx0Ly9iaW5kIHRvIGZpbGVzZWxlY3QgYnV0dG9uXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0Jyk7XG5cdFx0XHR2YXIgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZihpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC52YWwobG9nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKGxvZyl7XG5cdFx0XHRcdFx0XHRhbGVydChsb2cpO1xuXHRcdFx0XHRcdH1cbiAgICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMTc4XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIGZyb20gdGhlIGZsYXNoZWQgc2Vzc2lvbiBkYXRhXG4gKlxuICogdXNlICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgnbWVzc2FnZScsIHRyYW5zKCdtZXNzYWdlcy5pdGVtX3NhdmVkJykpO1xuICogICAgICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgndHlwZScsICdzdWNjZXNzJyk7XG4gKiB0byBzZXQgbWVzc2FnZSB0ZXh0IGFuZCB0eXBlXG4gKi9cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKXtcblx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cImphdmFzY3JpcHRNZXNzYWdlXCIgY2xhc3M9XCJhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LScgKyB0eXBlICsgJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PC9idXR0b24+PHNwYW4gY2xhc3M9XCJoNFwiPicgKyBtZXNzYWdlICsgJzwvc3Bhbj48L2Rpdj4nO1xuXHQkKCcjbWVzc2FnZScpLmFwcGVuZChodG1sKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKFwiI2phdmFzY3JpcHRNZXNzYWdlXCIpLmFsZXJ0KCdjbG9zZScpO1xuXHR9LCAzMDAwKTtcbn07XG5cbi8qXG5leHBvcnRzLmFqYXhjcnNmID0gZnVuY3Rpb24oKXtcblx0JC5hamF4U2V0dXAoe1xuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG5cdFx0fVxuXHR9KTtcbn07XG4qL1xuXG4vKipcbiAqIENsZWFycyBlcnJvcnMgb24gZm9ybXMgYnkgcmVtb3ZpbmcgZXJyb3IgY2xhc3Nlc1xuICovXG5leHBvcnRzLmNsZWFyRm9ybUVycm9ycyA9IGZ1bmN0aW9uKCl7XG5cdCQoJy5mb3JtLWdyb3VwJykuZWFjaChmdW5jdGlvbiAoKXtcblx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFNldHMgZXJyb3JzIG9uIGZvcm1zIGJhc2VkIG9uIHJlc3BvbnNlIEpTT05cbiAqL1xuZXhwb3J0cy5zZXRGb3JtRXJyb3JzID0gZnVuY3Rpb24oanNvbil7XG5cdGV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdCQuZWFjaChqc29uLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdCQoJyMnICsga2V5KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKCcjJyArIGtleSArICdoZWxwJykudGV4dCh2YWx1ZS5qb2luKCcgJykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG1lc3NhZ2VzIGluIHRoZSBmbGFzaCBkYXRhLiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IGJ5IHRoZSBwYWdlXG4gKi9cbmV4cG9ydHMuY2hlY2tNZXNzYWdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCgnI21lc3NhZ2VfZmxhc2gnKS5sZW5ndGgpe1xuXHRcdHZhciBtZXNzYWdlID0gJCgnI21lc3NhZ2VfZmxhc2gnKS52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICQoJyNtZXNzYWdlX3R5cGVfZmxhc2gnKS52YWwoKTtcblx0XHRleHBvcnRzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIHR5cGUpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGVycm9ycyBmcm9tIEFKQVhcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gZXJyb3IgLSB0aGUgQXhpb3MgZXJyb3IgcmVjZWl2ZWRcbiAqL1xuZXhwb3J0cy5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGVsZW1lbnQsIGVycm9yKXtcblx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0ZXhwb3J0cy5zZXRGb3JtRXJyb3JzKGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gXCIgKyBtZXNzYWdlICsgXCI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0aWYoZWxlbWVudC5sZW5ndGggPiAwKXtcblx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiXSwic291cmNlUm9vdCI6IiJ9