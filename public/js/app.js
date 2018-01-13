webpackJsonp([1],{

/***/ 142:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(143);
module.exports = __webpack_require__(183);


/***/ }),

/***/ 143:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(144);

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
				var calendar = __webpack_require__(174);
				calendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
		GroupsessionController: {
			//groupsession/index
			getIndex: function getIndex() {
				var editable = __webpack_require__(176);
				editable.init();
			},
			getList: function getList() {
				var groupsession = __webpack_require__(179);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(182);
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

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {window._ = __webpack_require__(7);

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(1);

__webpack_require__(9);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(10);

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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 174:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required JS libraries
__webpack_require__(17);
__webpack_require__(137);
var moment = __webpack_require__(0);
var site = __webpack_require__(4);
__webpack_require__(138);

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

/***/ 176:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function () {

  //Load required libraries
  __webpack_require__(3);
  __webpack_require__(177);
  __webpack_require__(139);
  site = __webpack_require__(4);

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

/***/ 177:
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

/***/ 179:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {window.Vue = __webpack_require__(140);
var site = __webpack_require__(4);
//var Echo = require('laravel-echo');
__webpack_require__(141);

//window.Pusher = require('pusher-js');

/**
 * Groupsession init function
 * must be called explicitly to start
 */
exports.init = function () {

	//load ion-sound library
	ion.sound({
		sounds: [{
			name: "door_bell"
		}],
		volume: 1.0,
		path: "/sounds/",
		preload: true
	});

	//get userID and isAdvisor variables
	var userID = parseInt($('#userID').val());
	var isAdvisor = parseInt($('#isAdvisor').val());

	//register button click
	$('#groupRegisterBtn').on('click', groupRegisterBtn);

	//disable button click
	$('#groupDisableBtn').on('click', groupDisableBtn);

	//render Vue App
	window.vm = new Vue({
		el: '#groupList',
		data: {
			queue: [],
			advisor: parseInt($('#isAdvisor').val()) == 1,
			userID: parseInt($('#userID').val())
		},
		methods: {
			getClass: function getClass(s) {
				return {
					'alert-info': s.status == 0 || s.status == 1,
					'alert-success': s.status == 2,
					'groupsession-me': s.userid == this.userID
				};
			},
			//function to take a student from the list
			takeStudent: function takeStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/take';
				ajaxPost(url, data, 'take');
			},

			//function to put a student back at the end of the list
			putStudent: function putStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/put';
				ajaxPost(url, data, 'put');
			},

			// function to mark a student done on the list
			doneStudent: function doneStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/done';
				ajaxPost(url, data, 'mark done');
			},

			//function to delete a student from the list
			delStudent: function delStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/delete';
				ajaxPost(url, data, 'delete');
			}
		}
	});

	window.axios.get('/groupsession/queue').then(function (response) {
		vm.queue = vm.queue.concat(response.data);
		checkButtons(vm.queue);
		initialCheckDing(vm.queue);
		vm.queue.sort(sortFunction);
	}).catch(function (error) {
		site.handleError('get queue', '', error);
	});
};

/**
 * Vue filter for status text
 *
 * @param data - the student to render
 */
Vue.filter('statustext', function (data) {
	if (data.status === 0) return "NEW";
	if (data.status === 1) return "QUEUED";
	if (data.status === 2) return "MEET WITH " + data.advisor;
	if (data.status === 3) return "DELAY";
	if (data.status === 4) return "ABSENT";
	if (data.status === 5) return "DONE";
});

/**
 * Vue component for displaying a student row
 */
Vue.component('student-row', {
	props: ['student'],
	template: '<div class="alert alert-info groupsession-div" role="alert">{{ student.name }} <span class="badge"> {{ student | statustext }}</span></div>'

});

/**
 * Function for clicking on the register button
 */
var groupRegisterBtn = function groupRegisterBtn() {
	$('#groupSpin').removeClass('hide-spin');

	var url = '/groupsession/register';
	window.axios.post(url, {}).then(function (response) {
		site.displayMessage(response.data, "success");
		disableButton();
		$('#groupSpin').addClass('hide-spin');
	}).catch(function (error) {
		site.handleError('register', '#group', error);
	});
};

/**
 * Function for advisors to disable groupsession
 */
var groupDisableBtn = function groupDisableBtn() {
	var choice = confirm("Are you sure?");
	if (choice === true) {
		var really = confirm("Seriously, this will lose all current data. Are you really sure?");
		if (really === true) {
			//this is a bit hacky, but it works
			var token = $('meta[name="csrf-token"]').attr('content');
			$('<form action="/groupsession/disable" method="POST"/>').append($('<input type="hidden" name="id" value="' + userID + '">')).append($('<input type="hidden" name="_token" value="' + token + '">')).appendTo($(document.body)) //it has to be added somewhere into the <body>
			.submit();
		}
	}
};

/**
 * Function to enable registration button
 */
var enableButton = function enableButton() {
	$('#groupRegisterBtn').removeAttr('disabled');
};

/**
 * Function to disable registration button
 */
var disableButton = function disableButton() {
	$('#groupRegisterBtn').attr('disabled', 'disabled');
};

/**
 * Function to check and see if user is on the list - if not, don't enable button
 */
var checkButtons = function checkButtons(queue) {
	var len = queue.length;
	var foundMe = false;

	//iterate through users on list, looking for current user
	for (var i = 0; i < len; i++) {
		if (queue[i].userid === userID) {
			foundMe = true;
			break;
		}
	}

	//if found, disable button; if not, enable button
	if (foundMe) {
		disableButton();
	} else {
		enableButton();
	}
};

/**
 * Check to see if the current user is beckoned, if so, play sound!
 *
 * @param person - the current user to check
 */
var checkDing = function checkDing(person) {
	if (person.status == 2) {
		ion.sound.play("door_bell");
	}
};

/**
 * Check if the person has been beckoned on load; if so, play sound!
 *
 * @param queue - the initial queue of users loaded
 */
var initialCheckDing = function initialCheckDing(queue) {
	var len = queue.length;
	for (var i = 0; i < len; i++) {
		if (queue[i].userid === userID) {
			checkDing(queue[i]);
			break;
		}
	}
};

/**
 * Helper function to sort elements based on their status
 *
 * @param a - first person
 * @param b - second person
 * @return - sorting value indicating who should go first_name
 */
var sortFunction = function sortFunction(a, b) {
	if (a.status == b.status) {
		return a.id < b.id ? -1 : 1;
	}
	return a.status < b.status ? 1 : -1;
};

/**
 * Function for making AJAX POST requests
 *
 * @param url - the URL to send to
 * @param data - the data object to send
 * @param action - the string describing the action
 */
var ajaxPost = function ajaxPost(url, data, action) {
	window.axios.post(url, data).then(function (response) {
		site.displayMessage(response.data, "success");
	}).catch(function (error) {
		site.handleError(action, '', error);
	});
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 182:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(4);

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

/***/ 183:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 4:
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

},[142]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzcz82ZDEwIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJBcHAiLCJhY3Rpb25zIiwiaW5kZXgiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJnZXRJbmRleCIsImNhbGVuZGFyIiwiaW5pdCIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJlZGl0YWJsZSIsImdldExpc3QiLCJncm91cHNlc3Npb24iLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiY29udHJvbGxlciIsImFjdGlvbiIsIndpbmRvdyIsIl8iLCIkIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJjb250ZW50IiwiY29uc29sZSIsImVycm9yIiwibW9tZW50Iiwic2l0ZSIsImV4cG9ydHMiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidXJsIiwidHlwZSIsImFsZXJ0IiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsImV2ZW50IiwicmVuZGVyaW5nIiwidGltZUZvcm1hdCIsImRhdGVQaWNrZXJEYXRhIiwiZGF5c09mV2Vla0Rpc2FibGVkIiwiZm9ybWF0Iiwic3RlcHBpbmciLCJlbmFibGVkSG91cnMiLCJtYXhIb3VyIiwic2lkZUJ5U2lkZSIsImlnbm9yZVJlYWRvbmx5IiwiYWxsb3dJbnB1dFRvZ2dsZSIsImRhdGVQaWNrZXJEYXRlT25seSIsImNoZWNrTWVzc2FnZSIsImFkdmlzb3IiLCJub2JpbmQiLCJ2YWwiLCJ0cmltIiwiZGF0YSIsImlkIiwid2lkdGgiLCJvbiIsImZvY3VzIiwicHJvcCIsInJlbW92ZUNsYXNzIiwic2hvdyIsInJlc2V0Rm9ybSIsImJpbmQiLCJuZXdTdHVkZW50IiwiaGlkZSIsImZpbmQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzdHVkZW50X2lkIiwic2hvd01lZXRpbmdGb3JtIiwicmVwZWF0IiwiYmxhY2tvdXRTZXJpZXMiLCJtb2RhbCIsInNlbGVjdCIsImNoYW5nZSIsInJlcGVhdENoYW5nZSIsInNhdmVCbGFja291dCIsImRlbGV0ZUJsYWNrb3V0IiwiYmxhY2tvdXRPY2N1cnJlbmNlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwiYXBwZW5kIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiY2hvaWNlIiwiY29uZmlybSIsImRlc2MiLCJzdGF0dXMiLCJtZWV0aW5naWQiLCJzdHVkZW50aWQiLCJkdXJhdGlvbk9wdGlvbnMiLCJ1bmRlZmluZWQiLCJob3VyIiwibWludXRlIiwiY2xlYXJGb3JtRXJyb3JzIiwiZW1wdHkiLCJtaW51dGVzIiwiZGlmZiIsImVsZW0xIiwiZWxlbTIiLCJkdXJhdGlvbiIsImUiLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZ2V0Iiwib2ZmIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJ0cmlnZ2VyIiwiYmxhY2tvdXRfaWQiLCJyZXBlYXRfdHlwZSIsInJlcGVhdF9ldmVyeSIsInJlcGVhdF91bnRpbCIsInJlcGVhdF9kZXRhaWwiLCJTdHJpbmciLCJpbmRleE9mIiwiZWlkIiwicHJvbXB0IiwiY2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInN1bW1lcm5vdGUiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIiwibG9jYXRpb24iLCJyZWxvYWQiLCJWdWUiLCJpb24iLCJzb3VuZCIsInNvdW5kcyIsIm5hbWUiLCJ2b2x1bWUiLCJwYXRoIiwicHJlbG9hZCIsInVzZXJJRCIsInBhcnNlSW50IiwiaXNBZHZpc29yIiwiZ3JvdXBSZWdpc3RlckJ0biIsImdyb3VwRGlzYWJsZUJ0biIsInZtIiwiZWwiLCJxdWV1ZSIsIm1ldGhvZHMiLCJnZXRDbGFzcyIsInMiLCJ1c2VyaWQiLCJ0YWtlU3R1ZGVudCIsImdpZCIsImN1cnJlbnRUYXJnZXQiLCJkYXRhc2V0IiwiYWpheFBvc3QiLCJwdXRTdHVkZW50IiwiZG9uZVN0dWRlbnQiLCJkZWxTdHVkZW50IiwiY29uY2F0IiwiY2hlY2tCdXR0b25zIiwiaW5pdGlhbENoZWNrRGluZyIsInNvcnQiLCJzb3J0RnVuY3Rpb24iLCJmaWx0ZXIiLCJjb21wb25lbnQiLCJwcm9wcyIsInRlbXBsYXRlIiwiZGlzYWJsZUJ1dHRvbiIsInJlYWxseSIsImF0dHIiLCJib2R5Iiwic3VibWl0IiwiZW5hYmxlQnV0dG9uIiwicmVtb3ZlQXR0ciIsImxlbiIsImxlbmd0aCIsImZvdW5kTWUiLCJpIiwiY2hlY2tEaW5nIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwiZmlyc3RfbmFtZSIsImxhc3RfbmFtZSIsIkZvcm1EYXRhIiwiZmlsZXMiLCJpbnB1dCIsIm51bUZpbGVzIiwibGFiZWwiLCJyZXBsYWNlIiwicGFyZW50cyIsImxvZyIsIm1lc3NhZ2UiLCJodG1sIiwic2V0VGltZW91dCIsInNldEZvcm1FcnJvcnMiLCJqc29uIiwia2V5Iiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0EsbUJBQUFBLENBQVEsR0FBUjs7QUFFQSxJQUFJQyxNQUFNOztBQUVUO0FBQ0FDLFVBQVM7QUFDUjtBQUNBQyxTQUFPO0FBQ05BLFVBQU8saUJBQVc7QUFDakI7QUFDQTtBQUhLLEdBRkM7O0FBUVI7QUFDQUMsc0JBQW9CO0FBQ25CO0FBQ0FDLGFBQVUsb0JBQVc7QUFDcEIsUUFBSUMsV0FBVyxtQkFBQU4sQ0FBUSxHQUFSLENBQWY7QUFDQU0sYUFBU0MsSUFBVDtBQUNBO0FBTGtCLEdBVFo7O0FBaUJSO0FBQ0VDLDBCQUF3QjtBQUN6QjtBQUNHSCxhQUFVLG9CQUFXO0FBQ25CLFFBQUlJLFdBQVcsbUJBQUFULENBQVEsR0FBUixDQUFmO0FBQ0pTLGFBQVNGLElBQVQ7QUFDRyxJQUxxQjtBQU16QkcsWUFBUyxtQkFBVztBQUNuQixRQUFJQyxlQUFlLG1CQUFBWCxDQUFRLEdBQVIsQ0FBbkI7QUFDQVcsaUJBQWFKLElBQWI7QUFDQTtBQVR3QixHQWxCbEI7O0FBOEJSO0FBQ0FLLHNCQUFvQjtBQUNuQjtBQUNBUCxhQUFVLG9CQUFXO0FBQ3BCLFFBQUlRLFVBQVUsbUJBQUFiLENBQVEsR0FBUixDQUFkO0FBQ0FhLFlBQVFOLElBQVI7QUFDQTtBQUxrQjtBQS9CWixFQUhBOztBQTJDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxPQUFNLGNBQVNPLFVBQVQsRUFBcUJDLE1BQXJCLEVBQTZCO0FBQ2xDLE1BQUksT0FBTyxLQUFLYixPQUFMLENBQWFZLFVBQWIsQ0FBUCxLQUFvQyxXQUFwQyxJQUFtRCxPQUFPLEtBQUtaLE9BQUwsQ0FBYVksVUFBYixF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O0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxvQkFBb0I7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLE9BQU8scUJBQXFCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLDRCQUE0Qjs7QUFFbEUsQ0FBQzs7Ozs7Ozs7QUNoWkQseUNBQUFwRyxPQUFPOE0sR0FBUCxHQUFhLG1CQUFBOU4sQ0FBUSxHQUFSLENBQWI7QUFDQSxJQUFJK0IsT0FBTyxtQkFBQS9CLENBQVEsQ0FBUixDQUFYO0FBQ0E7QUFDQSxtQkFBQUEsQ0FBUSxHQUFSOztBQUVBOztBQUVBOzs7O0FBSUFnQyxRQUFRekIsSUFBUixHQUFlLFlBQVU7O0FBRXhCO0FBQ0F3TixLQUFJQyxLQUFKLENBQVU7QUFDUEMsVUFBUSxDQUNKO0FBQ0lDLFNBQU07QUFEVixHQURJLENBREQ7QUFNUEMsVUFBUSxHQU5EO0FBT1BDLFFBQU0sVUFQQztBQVFQQyxXQUFTO0FBUkYsRUFBVjs7QUFXQTtBQUNBLEtBQUlDLFNBQVNDLFNBQVNyTixFQUFFLFNBQUYsRUFBYThELEdBQWIsRUFBVCxDQUFiO0FBQ0EsS0FBSXdKLFlBQVlELFNBQVNyTixFQUFFLFlBQUYsRUFBZ0I4RCxHQUFoQixFQUFULENBQWhCOztBQUVBO0FBQ0E5RCxHQUFFLG1CQUFGLEVBQXVCbUUsRUFBdkIsQ0FBMEIsT0FBMUIsRUFBbUNvSixnQkFBbkM7O0FBRUE7QUFDQXZOLEdBQUUsa0JBQUYsRUFBc0JtRSxFQUF0QixDQUF5QixPQUF6QixFQUFrQ3FKLGVBQWxDOztBQUVBO0FBQ0ExTixRQUFPMk4sRUFBUCxHQUFZLElBQUliLEdBQUosQ0FBUTtBQUNuQmMsTUFBSSxZQURlO0FBRW5CMUosUUFBTTtBQUNMMkosVUFBTyxFQURGO0FBRUwvSixZQUFTeUosU0FBU3JOLEVBQUUsWUFBRixFQUFnQjhELEdBQWhCLEVBQVQsS0FBbUMsQ0FGdkM7QUFHTHNKLFdBQVFDLFNBQVNyTixFQUFFLFNBQUYsRUFBYThELEdBQWIsRUFBVDtBQUhILEdBRmE7QUFPbkI4SixXQUFTO0FBQ1JDLGFBQVUsa0JBQVNDLENBQVQsRUFBVztBQUNwQixXQUFNO0FBQ0wsbUJBQWNBLEVBQUV0RixNQUFGLElBQVksQ0FBWixJQUFpQnNGLEVBQUV0RixNQUFGLElBQVksQ0FEdEM7QUFFTCxzQkFBaUJzRixFQUFFdEYsTUFBRixJQUFZLENBRnhCO0FBR0wsd0JBQW1Cc0YsRUFBRUMsTUFBRixJQUFZLEtBQUtYO0FBSC9CLEtBQU47QUFLQSxJQVBPO0FBUVI7QUFDQVksZ0JBQWEscUJBQVNsTCxLQUFULEVBQWU7QUFDM0IsUUFBSWtCLE9BQU8sRUFBRWlLLEtBQUtuTCxNQUFNb0wsYUFBTixDQUFvQkMsT0FBcEIsQ0FBNEJsSyxFQUFuQyxFQUFYO0FBQ0EsUUFBSTNCLE1BQU0sb0JBQVY7QUFDQThMLGFBQVM5TCxHQUFULEVBQWMwQixJQUFkLEVBQW9CLE1BQXBCO0FBQ0EsSUFiTzs7QUFlUjtBQUNBcUssZUFBWSxvQkFBU3ZMLEtBQVQsRUFBZTtBQUMxQixRQUFJa0IsT0FBTyxFQUFFaUssS0FBS25MLE1BQU1vTCxhQUFOLENBQW9CQyxPQUFwQixDQUE0QmxLLEVBQW5DLEVBQVg7QUFDQSxRQUFJM0IsTUFBTSxtQkFBVjtBQUNBOEwsYUFBUzlMLEdBQVQsRUFBYzBCLElBQWQsRUFBb0IsS0FBcEI7QUFDQSxJQXBCTzs7QUFzQlI7QUFDQXNLLGdCQUFhLHFCQUFTeEwsS0FBVCxFQUFlO0FBQzNCLFFBQUlrQixPQUFPLEVBQUVpSyxLQUFLbkwsTUFBTW9MLGFBQU4sQ0FBb0JDLE9BQXBCLENBQTRCbEssRUFBbkMsRUFBWDtBQUNBLFFBQUkzQixNQUFNLG9CQUFWO0FBQ0E4TCxhQUFTOUwsR0FBVCxFQUFjMEIsSUFBZCxFQUFvQixXQUFwQjtBQUNBLElBM0JPOztBQTZCUjtBQUNBdUssZUFBWSxvQkFBU3pMLEtBQVQsRUFBZTtBQUMxQixRQUFJa0IsT0FBTyxFQUFFaUssS0FBS25MLE1BQU1vTCxhQUFOLENBQW9CQyxPQUFwQixDQUE0QmxLLEVBQW5DLEVBQVg7QUFDQSxRQUFJM0IsTUFBTSxzQkFBVjtBQUNBOEwsYUFBUzlMLEdBQVQsRUFBYzBCLElBQWQsRUFBb0IsUUFBcEI7QUFDQTtBQWxDTztBQVBVLEVBQVIsQ0FBWjs7QUE2Q0FsRSxRQUFPRyxLQUFQLENBQWE4SixHQUFiLENBQWlCLHFCQUFqQixFQUNFaEMsSUFERixDQUNPLFVBQVN0QyxRQUFULEVBQWtCO0FBQ3ZCZ0ksS0FBR0UsS0FBSCxHQUFXRixHQUFHRSxLQUFILENBQVNhLE1BQVQsQ0FBZ0IvSSxTQUFTekIsSUFBekIsQ0FBWDtBQUNBeUssZUFBYWhCLEdBQUdFLEtBQWhCO0FBQ0FlLG1CQUFpQmpCLEdBQUdFLEtBQXBCO0FBQ0FGLEtBQUdFLEtBQUgsQ0FBU2dCLElBQVQsQ0FBY0MsWUFBZDtBQUNBLEVBTkYsRUFPRTVHLEtBUEYsQ0FPUSxVQUFTckgsS0FBVCxFQUFlO0FBQ3JCRSxPQUFLb0gsV0FBTCxDQUFpQixXQUFqQixFQUE4QixFQUE5QixFQUFrQ3RILEtBQWxDO0FBQ0EsRUFURjtBQVdBLENBakZEOztBQW9GQTs7Ozs7QUFLQWlNLElBQUlpQyxNQUFKLENBQVcsWUFBWCxFQUF5QixVQUFTN0ssSUFBVCxFQUFjO0FBQ3RDLEtBQUdBLEtBQUt3RSxNQUFMLEtBQWdCLENBQW5CLEVBQXNCLE9BQU8sS0FBUDtBQUN0QixLQUFHeEUsS0FBS3dFLE1BQUwsS0FBZ0IsQ0FBbkIsRUFBc0IsT0FBTyxRQUFQO0FBQ3RCLEtBQUd4RSxLQUFLd0UsTUFBTCxLQUFnQixDQUFuQixFQUFzQixPQUFPLGVBQWV4RSxLQUFLSixPQUEzQjtBQUN0QixLQUFHSSxLQUFLd0UsTUFBTCxLQUFnQixDQUFuQixFQUFzQixPQUFPLE9BQVA7QUFDdEIsS0FBR3hFLEtBQUt3RSxNQUFMLEtBQWdCLENBQW5CLEVBQXNCLE9BQU8sUUFBUDtBQUN0QixLQUFHeEUsS0FBS3dFLE1BQUwsS0FBZ0IsQ0FBbkIsRUFBc0IsT0FBTyxNQUFQO0FBQ3RCLENBUEQ7O0FBU0E7OztBQUdBb0UsSUFBSWtDLFNBQUosQ0FBYyxhQUFkLEVBQTZCO0FBQzVCQyxRQUFPLENBQUMsU0FBRCxDQURxQjtBQUU1QkMsV0FBVTs7QUFGa0IsQ0FBN0I7O0FBTUE7OztBQUdBLElBQUl6QixtQkFBbUIsU0FBbkJBLGdCQUFtQixHQUFVO0FBQ2hDdk4sR0FBRSxZQUFGLEVBQWdCc0UsV0FBaEIsQ0FBNEIsV0FBNUI7O0FBRUEsS0FBSWhDLE1BQU0sd0JBQVY7QUFDQXhDLFFBQU9HLEtBQVAsQ0FBYTZILElBQWIsQ0FBa0J4RixHQUFsQixFQUF1QixFQUF2QixFQUNFeUYsSUFERixDQUNPLFVBQVN0QyxRQUFULEVBQWtCO0FBQ3ZCNUUsT0FBSytHLGNBQUwsQ0FBb0JuQyxTQUFTekIsSUFBN0IsRUFBbUMsU0FBbkM7QUFDQWlMO0FBQ0FqUCxJQUFFLFlBQUYsRUFBZ0JrRyxRQUFoQixDQUF5QixXQUF6QjtBQUNBLEVBTEYsRUFNRThCLEtBTkYsQ0FNUSxVQUFTckgsS0FBVCxFQUFlO0FBQ3JCRSxPQUFLb0gsV0FBTCxDQUFpQixVQUFqQixFQUE2QixRQUE3QixFQUF1Q3RILEtBQXZDO0FBQ0EsRUFSRjtBQVNBLENBYkQ7O0FBZUE7OztBQUdBLElBQUk2TSxrQkFBa0IsU0FBbEJBLGVBQWtCLEdBQVU7QUFDL0IsS0FBSW5GLFNBQVNDLFFBQVEsZUFBUixDQUFiO0FBQ0EsS0FBR0QsV0FBVyxJQUFkLEVBQW1CO0FBQ2xCLE1BQUk2RyxTQUFTNUcsUUFBUSxrRUFBUixDQUFiO0FBQ0EsTUFBRzRHLFdBQVcsSUFBZCxFQUFtQjtBQUNsQjtBQUNBLE9BQUk3TyxRQUFRTCxFQUFFLHlCQUFGLEVBQTZCbVAsSUFBN0IsQ0FBa0MsU0FBbEMsQ0FBWjtBQUNBblAsS0FBRSxzREFBRixFQUNFb0gsTUFERixDQUNTcEgsRUFBRSwyQ0FBMkNvTixNQUEzQyxHQUFvRCxJQUF0RCxDQURULEVBRUVoRyxNQUZGLENBRVNwSCxFQUFFLCtDQUErQ0ssS0FBL0MsR0FBdUQsSUFBekQsQ0FGVCxFQUdFK0osUUFIRixDQUdXcEssRUFBRU0sU0FBUzhPLElBQVgsQ0FIWCxFQUc2QjtBQUg3QixJQUlFQyxNQUpGO0FBS0E7QUFDRDtBQUNELENBZEQ7O0FBZ0JBOzs7QUFHQSxJQUFJQyxlQUFlLFNBQWZBLFlBQWUsR0FBVTtBQUM1QnRQLEdBQUUsbUJBQUYsRUFBdUJ1UCxVQUF2QixDQUFrQyxVQUFsQztBQUNBLENBRkQ7O0FBSUE7OztBQUdBLElBQUlOLGdCQUFnQixTQUFoQkEsYUFBZ0IsR0FBVTtBQUM3QmpQLEdBQUUsbUJBQUYsRUFBdUJtUCxJQUF2QixDQUE0QixVQUE1QixFQUF3QyxVQUF4QztBQUNBLENBRkQ7O0FBSUE7OztBQUdBLElBQUlWLGVBQWUsU0FBZkEsWUFBZSxDQUFTZCxLQUFULEVBQWU7QUFDakMsS0FBSTZCLE1BQU03QixNQUFNOEIsTUFBaEI7QUFDQSxLQUFJQyxVQUFVLEtBQWQ7O0FBRUE7QUFDQSxNQUFJLElBQUlDLElBQUksQ0FBWixFQUFlQSxJQUFJSCxHQUFuQixFQUF3QkcsR0FBeEIsRUFBNEI7QUFDM0IsTUFBR2hDLE1BQU1nQyxDQUFOLEVBQVM1QixNQUFULEtBQW9CWCxNQUF2QixFQUE4QjtBQUM3QnNDLGFBQVUsSUFBVjtBQUNBO0FBQ0E7QUFDRDs7QUFFRDtBQUNBLEtBQUdBLE9BQUgsRUFBVztBQUNWVDtBQUNBLEVBRkQsTUFFSztBQUNKSztBQUNBO0FBQ0QsQ0FsQkQ7O0FBb0JBOzs7OztBQUtBLElBQUlNLFlBQVksU0FBWkEsU0FBWSxDQUFTQyxNQUFULEVBQWdCO0FBQy9CLEtBQUdBLE9BQU9ySCxNQUFQLElBQWlCLENBQXBCLEVBQXNCO0FBQ3JCcUUsTUFBSUMsS0FBSixDQUFVZ0QsSUFBVixDQUFlLFdBQWY7QUFDQTtBQUNELENBSkQ7O0FBTUE7Ozs7O0FBS0EsSUFBSXBCLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQVNmLEtBQVQsRUFBZTtBQUNyQyxLQUFJNkIsTUFBTTdCLE1BQU04QixNQUFoQjtBQUNBLE1BQUksSUFBSUUsSUFBSSxDQUFaLEVBQWVBLElBQUlILEdBQW5CLEVBQXdCRyxHQUF4QixFQUE0QjtBQUMzQixNQUFHaEMsTUFBTWdDLENBQU4sRUFBUzVCLE1BQVQsS0FBb0JYLE1BQXZCLEVBQThCO0FBQzdCd0MsYUFBVWpDLE1BQU1nQyxDQUFOLENBQVY7QUFDQTtBQUNBO0FBQ0Q7QUFDRCxDQVJEOztBQVVBOzs7Ozs7O0FBT0EsSUFBSWYsZUFBZSxTQUFmQSxZQUFlLENBQVNtQixDQUFULEVBQVlDLENBQVosRUFBYztBQUNoQyxLQUFHRCxFQUFFdkgsTUFBRixJQUFZd0gsRUFBRXhILE1BQWpCLEVBQXdCO0FBQ3ZCLFNBQVF1SCxFQUFFOUwsRUFBRixHQUFPK0wsRUFBRS9MLEVBQVQsR0FBYyxDQUFDLENBQWYsR0FBbUIsQ0FBM0I7QUFDQTtBQUNELFFBQVE4TCxFQUFFdkgsTUFBRixHQUFXd0gsRUFBRXhILE1BQWIsR0FBc0IsQ0FBdEIsR0FBMEIsQ0FBQyxDQUFuQztBQUNBLENBTEQ7O0FBU0E7Ozs7Ozs7QUFPQSxJQUFJNEYsV0FBVyxTQUFYQSxRQUFXLENBQVM5TCxHQUFULEVBQWMwQixJQUFkLEVBQW9CbkUsTUFBcEIsRUFBMkI7QUFDekNDLFFBQU9HLEtBQVAsQ0FBYTZILElBQWIsQ0FBa0J4RixHQUFsQixFQUF1QjBCLElBQXZCLEVBQ0UrRCxJQURGLENBQ08sVUFBU3RDLFFBQVQsRUFBa0I7QUFDdkI1RSxPQUFLK0csY0FBTCxDQUFvQm5DLFNBQVN6QixJQUE3QixFQUFtQyxTQUFuQztBQUNBLEVBSEYsRUFJRWdFLEtBSkYsQ0FJUSxVQUFTckgsS0FBVCxFQUFlO0FBQ3JCRSxPQUFLb0gsV0FBTCxDQUFpQnBJLE1BQWpCLEVBQXlCLEVBQXpCLEVBQTZCYyxLQUE3QjtBQUNBLEVBTkY7QUFPQSxDQVJELEM7Ozs7Ozs7O0FDalBBLDZDQUFJRSxPQUFPLG1CQUFBL0IsQ0FBUSxDQUFSLENBQVg7O0FBRUFnQyxRQUFRekIsSUFBUixHQUFlLFlBQVU7O0FBRXhCO0FBQ0FXLEdBQUUsY0FBRixFQUFrQm1FLEVBQWxCLENBQXFCLE9BQXJCLEVBQThCLFlBQVU7O0FBRXZDO0FBQ0FuRSxJQUFFLGNBQUYsRUFBa0JzRSxXQUFsQixDQUE4QixXQUE5Qjs7QUFFQTtBQUNBLE1BQUlOLE9BQU87QUFDVmlNLGVBQVlqUSxFQUFFLGFBQUYsRUFBaUI4RCxHQUFqQixFQURGO0FBRVZvTSxjQUFXbFEsRUFBRSxZQUFGLEVBQWdCOEQsR0FBaEI7QUFGRCxHQUFYO0FBSUEsTUFBSXhCLE1BQU0saUJBQVY7O0FBRUE7QUFDQXhDLFNBQU9HLEtBQVAsQ0FBYTZILElBQWIsQ0FBa0J4RixHQUFsQixFQUF1QjBCLElBQXZCLEVBQ0UrRCxJQURGLENBQ08sVUFBU3RDLFFBQVQsRUFBa0I7QUFDdkI1RSxRQUFLK0csY0FBTCxDQUFvQm5DLFNBQVN6QixJQUE3QixFQUFtQyxTQUFuQztBQUNBbkQsUUFBS2tJLGVBQUw7QUFDQS9JLEtBQUUsY0FBRixFQUFrQmtHLFFBQWxCLENBQTJCLFdBQTNCO0FBQ0FsRyxLQUFFLHFCQUFGLEVBQXlCc0UsV0FBekIsQ0FBcUMsV0FBckM7QUFDQSxHQU5GLEVBT0UwRCxLQVBGLENBT1EsVUFBU3JILEtBQVQsRUFBZTtBQUNyQkUsUUFBS29ILFdBQUwsQ0FBaUIsY0FBakIsRUFBaUMsVUFBakMsRUFBNkN0SCxLQUE3QztBQUNBLEdBVEY7QUFVQSxFQXZCRDs7QUF5QkE7QUFDQVgsR0FBRSxxQkFBRixFQUF5Qm1FLEVBQXpCLENBQTRCLE9BQTVCLEVBQXFDLFlBQVU7O0FBRTlDO0FBQ0FuRSxJQUFFLGNBQUYsRUFBa0JzRSxXQUFsQixDQUE4QixXQUE5Qjs7QUFFQTtBQUNBO0FBQ0EsTUFBSU4sT0FBTyxJQUFJbU0sUUFBSixDQUFhblEsRUFBRSxNQUFGLEVBQVUsQ0FBVixDQUFiLENBQVg7QUFDQWdFLE9BQUtvRCxNQUFMLENBQVksTUFBWixFQUFvQnBILEVBQUUsT0FBRixFQUFXOEQsR0FBWCxFQUFwQjtBQUNBRSxPQUFLb0QsTUFBTCxDQUFZLE9BQVosRUFBcUJwSCxFQUFFLFFBQUYsRUFBWThELEdBQVosRUFBckI7QUFDQUUsT0FBS29ELE1BQUwsQ0FBWSxRQUFaLEVBQXNCcEgsRUFBRSxTQUFGLEVBQWE4RCxHQUFiLEVBQXRCO0FBQ0FFLE9BQUtvRCxNQUFMLENBQVksT0FBWixFQUFxQnBILEVBQUUsUUFBRixFQUFZOEQsR0FBWixFQUFyQjtBQUNBRSxPQUFLb0QsTUFBTCxDQUFZLE9BQVosRUFBcUJwSCxFQUFFLFFBQUYsRUFBWThELEdBQVosRUFBckI7QUFDQSxNQUFHOUQsRUFBRSxNQUFGLEVBQVU4RCxHQUFWLEVBQUgsRUFBbUI7QUFDbEJFLFFBQUtvRCxNQUFMLENBQVksS0FBWixFQUFtQnBILEVBQUUsTUFBRixFQUFVLENBQVYsRUFBYW9RLEtBQWIsQ0FBbUIsQ0FBbkIsQ0FBbkI7QUFDQTtBQUNELE1BQUk5TixNQUFNLGlCQUFWOztBQUVBeEMsU0FBT0csS0FBUCxDQUFhNkgsSUFBYixDQUFrQnhGLEdBQWxCLEVBQXVCMEIsSUFBdkIsRUFDRStELElBREYsQ0FDTyxVQUFTdEMsUUFBVCxFQUFrQjtBQUN2QjVFLFFBQUsrRyxjQUFMLENBQW9CbkMsU0FBU3pCLElBQTdCLEVBQW1DLFNBQW5DO0FBQ0FuRCxRQUFLa0ksZUFBTDtBQUNBL0ksS0FBRSxjQUFGLEVBQWtCa0csUUFBbEIsQ0FBMkIsV0FBM0I7QUFDQWxHLEtBQUUscUJBQUYsRUFBeUJzRSxXQUF6QixDQUFxQyxXQUFyQztBQUNBeEUsVUFBT0csS0FBUCxDQUFhOEosR0FBYixDQUFpQixjQUFqQixFQUNFaEMsSUFERixDQUNPLFVBQVN0QyxRQUFULEVBQWtCO0FBQ3ZCekYsTUFBRSxVQUFGLEVBQWM4RCxHQUFkLENBQWtCMkIsU0FBU3pCLElBQTNCO0FBQ0FoRSxNQUFFLFNBQUYsRUFBYW1QLElBQWIsQ0FBa0IsS0FBbEIsRUFBeUIxSixTQUFTekIsSUFBbEM7QUFDQSxJQUpGLEVBS0VnRSxLQUxGLENBS1EsVUFBU3JILEtBQVQsRUFBZTtBQUNyQkUsU0FBS29ILFdBQUwsQ0FBaUIsa0JBQWpCLEVBQXFDLEVBQXJDLEVBQXlDdEgsS0FBekM7QUFDQSxJQVBGO0FBUUEsR0FkRixFQWVFcUgsS0FmRixDQWVRLFVBQVNySCxLQUFULEVBQWU7QUFDckJFLFFBQUtvSCxXQUFMLENBQWlCLGNBQWpCLEVBQWlDLFVBQWpDLEVBQTZDdEgsS0FBN0M7QUFDQSxHQWpCRjtBQWtCQSxFQXBDRDs7QUFzQ0E7QUFDQVgsR0FBRU0sUUFBRixFQUFZNkQsRUFBWixDQUFlLFFBQWYsRUFBeUIsaUJBQXpCLEVBQTRDLFlBQVc7QUFDckQsTUFBSWtNLFFBQVFyUSxFQUFFLElBQUYsQ0FBWjtBQUFBLE1BQ0lzUSxXQUFXRCxNQUFNdEcsR0FBTixDQUFVLENBQVYsRUFBYXFHLEtBQWIsR0FBcUJDLE1BQU10RyxHQUFOLENBQVUsQ0FBVixFQUFhcUcsS0FBYixDQUFtQlgsTUFBeEMsR0FBaUQsQ0FEaEU7QUFBQSxNQUVJYyxRQUFRRixNQUFNdk0sR0FBTixHQUFZME0sT0FBWixDQUFvQixLQUFwQixFQUEyQixHQUEzQixFQUFnQ0EsT0FBaEMsQ0FBd0MsTUFBeEMsRUFBZ0QsRUFBaEQsQ0FGWjtBQUdBSCxRQUFNbEYsT0FBTixDQUFjLFlBQWQsRUFBNEIsQ0FBQ21GLFFBQUQsRUFBV0MsS0FBWCxDQUE1QjtBQUNELEVBTEQ7O0FBT0E7QUFDQ3ZRLEdBQUUsaUJBQUYsRUFBcUJtRSxFQUFyQixDQUF3QixZQUF4QixFQUFzQyxVQUFTckIsS0FBVCxFQUFnQndOLFFBQWhCLEVBQTBCQyxLQUExQixFQUFpQzs7QUFFbkUsTUFBSUYsUUFBUXJRLEVBQUUsSUFBRixFQUFReVEsT0FBUixDQUFnQixjQUFoQixFQUFnQzdMLElBQWhDLENBQXFDLE9BQXJDLENBQVo7QUFDSCxNQUFJOEwsTUFBTUosV0FBVyxDQUFYLEdBQWVBLFdBQVcsaUJBQTFCLEdBQThDQyxLQUF4RDs7QUFFRyxNQUFHRixNQUFNWixNQUFULEVBQWlCO0FBQ2JZLFNBQU12TSxHQUFOLENBQVU0TSxHQUFWO0FBQ0gsR0FGRCxNQUVLO0FBQ0QsT0FBR0EsR0FBSCxFQUFPO0FBQ1hsTyxVQUFNa08sR0FBTjtBQUNBO0FBQ0M7QUFDSixFQVpEO0FBYUQsQ0F6RkQsQzs7Ozs7Ozs7QUNGQSx5Qzs7Ozs7OztBQ0FBOzs7Ozs7O0FBT0E1UCxRQUFROEcsY0FBUixHQUF5QixVQUFTK0ksT0FBVCxFQUFrQnBPLElBQWxCLEVBQXVCO0FBQy9DLEtBQUlxTyxPQUFPLDhFQUE4RXJPLElBQTlFLEdBQXFGLGlKQUFyRixHQUF5T29PLE9BQXpPLEdBQW1QLGVBQTlQO0FBQ0EzUSxHQUFFLFVBQUYsRUFBY29ILE1BQWQsQ0FBcUJ3SixJQUFyQjtBQUNBQyxZQUFXLFlBQVc7QUFDckI3USxJQUFFLG9CQUFGLEVBQXdCd0MsS0FBeEIsQ0FBOEIsT0FBOUI7QUFDQSxFQUZELEVBRUcsSUFGSDtBQUdBLENBTkQ7O0FBUUE7Ozs7Ozs7Ozs7QUFVQTs7O0FBR0ExQixRQUFRaUksZUFBUixHQUEwQixZQUFVO0FBQ25DL0ksR0FBRSxhQUFGLEVBQWlCOEUsSUFBakIsQ0FBc0IsWUFBVztBQUNoQzlFLElBQUUsSUFBRixFQUFRc0UsV0FBUixDQUFvQixXQUFwQjtBQUNBdEUsSUFBRSxJQUFGLEVBQVE0RSxJQUFSLENBQWEsYUFBYixFQUE0QkcsSUFBNUIsQ0FBaUMsRUFBakM7QUFDQSxFQUhEO0FBSUEsQ0FMRDs7QUFPQTs7O0FBR0FqRSxRQUFRZ1EsYUFBUixHQUF3QixVQUFTQyxJQUFULEVBQWM7QUFDckNqUSxTQUFRaUksZUFBUjtBQUNBL0ksR0FBRThFLElBQUYsQ0FBT2lNLElBQVAsRUFBYSxVQUFVQyxHQUFWLEVBQWVuTCxLQUFmLEVBQXNCO0FBQ2xDN0YsSUFBRSxNQUFNZ1IsR0FBUixFQUFhUCxPQUFiLENBQXFCLGFBQXJCLEVBQW9DdkssUUFBcEMsQ0FBNkMsV0FBN0M7QUFDQWxHLElBQUUsTUFBTWdSLEdBQU4sR0FBWSxNQUFkLEVBQXNCak0sSUFBdEIsQ0FBMkJjLE1BQU1vTCxJQUFOLENBQVcsR0FBWCxDQUEzQjtBQUNBLEVBSEQ7QUFJQSxDQU5EOztBQVFBOzs7QUFHQW5RLFFBQVE2QyxZQUFSLEdBQXVCLFlBQVU7QUFDaEMsS0FBRzNELEVBQUUsZ0JBQUYsRUFBb0J5UCxNQUF2QixFQUE4QjtBQUM3QixNQUFJa0IsVUFBVTNRLEVBQUUsZ0JBQUYsRUFBb0I4RCxHQUFwQixFQUFkO0FBQ0EsTUFBSXZCLE9BQU92QyxFQUFFLHFCQUFGLEVBQXlCOEQsR0FBekIsRUFBWDtBQUNBaEQsVUFBUThHLGNBQVIsQ0FBdUIrSSxPQUF2QixFQUFnQ3BPLElBQWhDO0FBQ0E7QUFDRCxDQU5EOztBQVFBOzs7Ozs7O0FBT0F6QixRQUFRbUgsV0FBUixHQUFzQixVQUFTMEksT0FBVCxFQUFrQjFLLE9BQWxCLEVBQTJCdEYsS0FBM0IsRUFBaUM7QUFDdEQsS0FBR0EsTUFBTThFLFFBQVQsRUFBa0I7QUFDakI7QUFDQSxNQUFHOUUsTUFBTThFLFFBQU4sQ0FBZStDLE1BQWYsSUFBeUIsR0FBNUIsRUFBZ0M7QUFDL0IxSCxXQUFRZ1EsYUFBUixDQUFzQm5RLE1BQU04RSxRQUFOLENBQWV6QixJQUFyQztBQUNBLEdBRkQsTUFFSztBQUNKeEIsU0FBTSxlQUFlbU8sT0FBZixHQUF5QixJQUF6QixHQUFnQ2hRLE1BQU04RSxRQUFOLENBQWV6QixJQUFyRDtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQSxLQUFHaUMsUUFBUXdKLE1BQVIsR0FBaUIsQ0FBcEIsRUFBc0I7QUFDckJ6UCxJQUFFaUcsVUFBVSxNQUFaLEVBQW9CQyxRQUFwQixDQUE2QixXQUE3QjtBQUNBO0FBQ0QsQ0FkRCxDIiwiZmlsZSI6Ii9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2h0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy81LjQvbWl4I3dvcmtpbmctd2l0aC1zY3JpcHRzXG4vL2h0dHBzOi8vYW5keS1jYXJ0ZXIuY29tL2Jsb2cvc2NvcGluZy1qYXZhc2NyaXB0LWZ1bmN0aW9uYWxpdHktdG8tc3BlY2lmaWMtcGFnZXMtd2l0aC1sYXJhdmVsLWFuZC1jYWtlcGhwXG5cbi8vTG9hZCBzaXRlLXdpZGUgbGlicmFyaWVzIGluIGJvb3RzdHJhcCBmaWxlXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcCcpO1xuXG52YXIgQXBwID0ge1xuXG5cdC8vIENvbnRyb2xsZXItYWN0aW9uIG1ldGhvZHNcblx0YWN0aW9uczoge1xuXHRcdC8vSW5kZXggZm9yIGRpcmVjdGx5IGNyZWF0ZWQgdmlld3Mgd2l0aCBubyBleHBsaWNpdCBjb250cm9sbGVyXG5cdFx0aW5kZXg6IHtcblx0XHRcdGluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly9ubyBkZWZhdWx0IGphdmFzY3JpcHRzIG9uIGhvbWUgcGFnZXM/XG5cdFx0XHR9LFxuICAgIH0sXG5cblx0XHQvL0FkdmlzaW5nIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWR2aXNpbmdcblx0XHRBZHZpc2luZ0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWR2aXNpbmcvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNhbGVuZGFyID0gcmVxdWlyZSgnLi9wYWdlcy9jYWxlbmRhcicpO1xuXHRcdFx0XHRjYWxlbmRhci5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vR3JvdXBzZXNzaW9uIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvZ3JvdXBzZXNzaW9uXG4gICAgR3JvdXBzZXNzaW9uQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9ncm91cHNlc3Npb24vaW5kZXhcbiAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcbiAgICAgIH0sXG5cdFx0XHRnZXRMaXN0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbiA9IHJlcXVpcmUoJy4vcGFnZXMvZ3JvdXBzZXNzaW9uJyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbi5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHQvL1Byb2ZpbGVzIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvcHJvZmlsZVxuXHRcdFByb2ZpbGVzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9wcm9maWxlL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwcm9maWxlID0gcmVxdWlyZSgnLi9wYWdlcy9wcm9maWxlJyk7XG5cdFx0XHRcdHByb2ZpbGUuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL0Z1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGJ5IHRoZSBwYWdlIGF0IGxvYWQuIERlZmluZWQgaW4gcmVzb3VyY2VzL3ZpZXdzL2luY2x1ZGVzL3NjcmlwdHMuYmxhZGUucGhwXG5cdC8vYW5kIEFwcC9IdHRwL1ZpZXdDb21wb3NlcnMvSmF2YXNjcmlwdCBDb21wb3NlclxuXHQvL1NlZSBsaW5rcyBhdCB0b3Agb2YgZmlsZSBmb3IgZGVzY3JpcHRpb24gb2Ygd2hhdCdzIGdvaW5nIG9uIGhlcmVcblx0Ly9Bc3N1bWVzIDIgaW5wdXRzIC0gdGhlIGNvbnRyb2xsZXIgYW5kIGFjdGlvbiB0aGF0IGNyZWF0ZWQgdGhpcyBwYWdlXG5cdGluaXQ6IGZ1bmN0aW9uKGNvbnRyb2xsZXIsIGFjdGlvbikge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvL2NhbGwgdGhlIG1hdGNoaW5nIGZ1bmN0aW9uIGluIHRoZSBhcnJheSBhYm92ZVxuXHRcdFx0cmV0dXJuIEFwcC5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0oKTtcblx0XHR9XG5cdH0sXG59O1xuXG4vL0JpbmQgdG8gdGhlIHdpbmRvd1xud2luZG93LkFwcCA9IEFwcDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2luZG93Ll8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIGpRdWVyeSBhbmQgdGhlIEJvb3RzdHJhcCBqUXVlcnkgcGx1Z2luIHdoaWNoIHByb3ZpZGVzIHN1cHBvcnRcbiAqIGZvciBKYXZhU2NyaXB0IGJhc2VkIEJvb3RzdHJhcCBmZWF0dXJlcyBzdWNoIGFzIG1vZGFscyBhbmQgdGFicy4gVGhpc1xuICogY29kZSBtYXkgYmUgbW9kaWZpZWQgdG8gZml0IHRoZSBzcGVjaWZpYyBuZWVkcyBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICovXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIHRoZSBheGlvcyBIVFRQIGxpYnJhcnkgd2hpY2ggYWxsb3dzIHVzIHRvIGVhc2lseSBpc3N1ZSByZXF1ZXN0c1xuICogdG8gb3VyIExhcmF2ZWwgYmFjay1lbmQuIFRoaXMgbGlicmFyeSBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgc2VuZGluZyB0aGVcbiAqIENTUkYgdG9rZW4gYXMgYSBoZWFkZXIgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBcIlhTUkZcIiB0b2tlbiBjb29raWUuXG4gKi9cblxud2luZG93LmF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLy9odHRwczovL2dpdGh1Yi5jb20vcmFwcGFzb2Z0L2xhcmF2ZWwtNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qc1xud2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4vKipcbiAqIE5leHQgd2Ugd2lsbCByZWdpc3RlciB0aGUgQ1NSRiBUb2tlbiBhcyBhIGNvbW1vbiBoZWFkZXIgd2l0aCBBeGlvcyBzbyB0aGF0XG4gKiBhbGwgb3V0Z29pbmcgSFRUUCByZXF1ZXN0cyBhdXRvbWF0aWNhbGx5IGhhdmUgaXQgYXR0YWNoZWQuIFRoaXMgaXMganVzdFxuICogYSBzaW1wbGUgY29udmVuaWVuY2Ugc28gd2UgZG9uJ3QgaGF2ZSB0byBhdHRhY2ggZXZlcnkgdG9rZW4gbWFudWFsbHkuXG4gKi9cblxubGV0IHRva2VuID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG5cbmlmICh0b2tlbikge1xuICAgIHdpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1DU1JGLVRPS0VOJ10gPSB0b2tlbi5jb250ZW50O1xufSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdDU1JGIHRva2VuIG5vdCBmb3VuZDogaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzL2NzcmYjY3NyZi14LWNzcmYtdG9rZW4nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnZW9uYXNkYW4tYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLXJ1c3NmZWxkJyk7XG5cbi8vU2Vzc2lvbiBmb3Igc3RvcmluZyBkYXRhIGJldHdlZW4gZm9ybXNcbmV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cbi8vSUQgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgY2FsZW5kYXIncyBhZHZpc29yXG5leHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gLTE7XG5cbi8vU3R1ZGVudCdzIE5hbWUgc2V0IGJ5IGluaXRcbmV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9IFwiXCI7XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbmV4cG9ydHMuY2FsZW5kYXJEYXRhID0ge1xuXHRoZWFkZXI6IHtcblx0XHRsZWZ0OiAncHJldixuZXh0IHRvZGF5Jyxcblx0XHRjZW50ZXI6ICd0aXRsZScsXG5cdFx0cmlnaHQ6ICdhZ2VuZGFXZWVrLGFnZW5kYURheSdcblx0fSxcblx0ZWRpdGFibGU6IGZhbHNlLFxuXHRldmVudExpbWl0OiB0cnVlLFxuXHRoZWlnaHQ6ICdhdXRvJyxcblx0d2Vla2VuZHM6IGZhbHNlLFxuXHRidXNpbmVzc0hvdXJzOiB7XG5cdFx0c3RhcnQ6ICc4OjAwJywgLy8gYSBzdGFydCB0aW1lICgxMGFtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRlbmQ6ICcxNzowMCcsIC8vIGFuIGVuZCB0aW1lICg2cG0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGRvdzogWyAxLCAyLCAzLCA0LCA1IF1cblx0fSxcblx0ZGVmYXVsdFZpZXc6ICdhZ2VuZGFXZWVrJyxcblx0dmlld3M6IHtcblx0XHRhZ2VuZGE6IHtcblx0XHRcdGFsbERheVNsb3Q6IGZhbHNlLFxuXHRcdFx0c2xvdER1cmF0aW9uOiAnMDA6MjA6MDAnLFxuXHRcdFx0bWluVGltZTogJzA4OjAwOjAwJyxcblx0XHRcdG1heFRpbWU6ICcxNzowMDowMCdcblx0XHR9XG5cdH0sXG5cdGV2ZW50U291cmNlczogW1xuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9tZWV0aW5nZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIG1lZXRpbmcgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyM1MTI4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnd2hpdGUnLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL2JsYWNrb3V0ZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIGJsYWNrb3V0IGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjRkY4ODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ2JsYWNrJyxcblx0XHR9LFxuXHRdLFxuXHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRzZWxlY3RIZWxwZXI6IHRydWUsXG5cdHNlbGVjdE92ZXJsYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGV2ZW50LnJlbmRlcmluZyA9PT0gJ2JhY2tncm91bmQnO1xuXHR9LFxuXHR0aW1lRm9ybWF0OiAnICcsXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0YSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdMTEwnLFxuXHRcdHN0ZXBwaW5nOiAyMCxcblx0XHRlbmFibGVkSG91cnM6IFs4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTddLFxuXHRcdG1heEhvdXI6IDE3LFxuXHRcdHNpZGVCeVNpZGU6IHRydWUsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2UgZGF5IG9ubHlcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5ID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ01NL0REL1lZWVknLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8qKlxuICogSW5pdGlhbHphdGlvbiBmdW5jdGlvbiBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIGFkdmlzb3IgLSBib29sZWFuIHRydWUgaWYgdGhlIHVzZXIgaXMgYW4gYWR2aXNvclxuICogQHBhcmFtIG5vYmluZCAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgYnV0dG9ucyBzaG91bGQgbm90IGJlIGJvdW5kIChtYWtlIGNhbGVuZGFyIHJlYWQtb25seSlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXMgYWN0aW9uXG5cdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cblx0Ly90d2VhayBwYXJhbWV0ZXJzXG5cdHdpbmRvdy5hZHZpc29yIHx8ICh3aW5kb3cuYWR2aXNvciA9IGZhbHNlKTtcblx0d2luZG93Lm5vYmluZCB8fCAod2luZG93Lm5vYmluZCA9IGZhbHNlKTtcblxuXHQvL2dldCB0aGUgY3VycmVudCBhZHZpc29yJ3MgSURcblx0ZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9ICQoJyNjYWxlbmRhckFkdmlzb3JJRCcpLnZhbCgpLnRyaW0oKTtcblxuXHQvL1NldCB0aGUgYWR2aXNvciBpbmZvcm1hdGlvbiBmb3IgbWVldGluZyBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzBdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vU2V0IHRoZSBhZHZzaW9yIGluZm9yYW10aW9uIGZvciBibGFja291dCBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vaWYgdGhlIHdpbmRvdyBpcyBzbWFsbCwgc2V0IGRpZmZlcmVudCBkZWZhdWx0IGZvciBjYWxlbmRhclxuXHRpZigkKHdpbmRvdykud2lkdGgoKSA8IDYwMCl7XG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZGVmYXVsdFZpZXcgPSAnYWdlbmRhRGF5Jztcblx0fVxuXG5cdC8vSWYgbm9iaW5kLCBkb24ndCBiaW5kIHRoZSBmb3Jtc1xuXHRpZighd2luZG93Lm5vYmluZCl7XG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIGFuIGFkdmlzb3IsIGJpbmQgbW9yZSBkYXRhXG5cdFx0aWYod2luZG93LmFkdmlzb3Ipe1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjdGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNlbmQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNlbmRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2Jykuc2hvdygpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLnNob3coKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cblx0XHRcdC8vYmluZCBtZXRob2RzIGZvciBidXR0b25zIGFuZCBmb3Jtc1xuXHRcdFx0JCgnI25ld1N0dWRlbnRCdXR0b24nKS5iaW5kKCdjbGljaycsIG5ld1N0dWRlbnQpO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNidGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0XHRcdCAgICAkKHRoaXMpLmZpbmQoJy5oYXMtZXJyb3InKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykudGV4dCgnJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL2JpbmQgYXV0b2NvbXBsZXRlIGZpZWxkXG5cdFx0XHQkKCcjc3R1ZGVudGlkJykuYXV0b2NvbXBsZXRlKHtcblx0XHRcdCAgICBzZXJ2aWNlVXJsOiAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnLFxuXHRcdFx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHRcdFx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0XHRcdCAgICAgICAgJCgnI3N0dWRlbnRpZHZhbCcpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0ICAgICAgICByZXR1cm4ge1xuXHRcdFx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdFx0XHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdFx0XHQgICAgICAgICAgICB9KVxuXHRcdFx0ICAgICAgICB9O1xuXHRcdFx0ICAgIH1cblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjc3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI3N0YXJ0JywgJyNlbmQnLCAnI2R1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnN0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2JlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjYnN0YXJ0JywgJyNiZW5kJywgJyNiZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNicmVwZWF0dW50aWxfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5KTtcblxuXHRcdFx0Ly9jaGFuZ2UgcmVuZGVyaW5nIG9mIGV2ZW50c1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0XHRcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1jbGlja2FibGVcIik7XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAnbScpe1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWQnKS52YWwoZXZlbnQuc3R1ZGVudG5hbWUpO1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0fWVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRcdGV2ZW50OiBldmVudFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYoZXZlbnQucmVwZWF0ID09ICcwJyl7XG5cdFx0XHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdFx0XHRlbmQ6IGVuZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvL2JpbmQgbW9yZSBidXR0b25zXG5cdFx0XHQkKCcjYnJlcGVhdCcpLmNoYW5nZShyZXBlYXRDaGFuZ2UpO1xuXG5cdFx0XHQkKCcjc2F2ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0U2VyaWVzJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dE9jY3VycmVuY2UnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0T2NjdXJyZW5jZSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNhZHZpc2luZ0J1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVNZWV0aW5nQnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXRCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdFx0JCgnI3Jlc29sdmVCdXR0b24nKS5vbignY2xpY2snLCByZXNvbHZlQ29uZmxpY3RzKTtcblxuXHRcdFx0bG9hZENvbmZsaWN0cygpO1xuXG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIG5vdCBhbiBhZHZpc29yLCBiaW5kIGxlc3MgZGF0YVxuXHRcdH1lbHNle1xuXG5cdFx0XHQvL0dldCB0aGUgY3VycmVudCBzdHVkZW50J3MgbmFtZVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gJCgnI2NhbGVuZGFyU3R1ZGVudE5hbWUnKS52YWwoKS50cmltKCk7XG5cblx0XHQgIC8vUmVuZGVyIGJsYWNrb3V0cyB0byBiYWNrZ3JvdW5kXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuXG5cdFx0ICAvL1doZW4gcmVuZGVyaW5nLCB1c2UgdGhpcyBjdXN0b20gZnVuY3Rpb24gZm9yIGJsYWNrb3V0cyBhbmQgc3R1ZGVudCBtZWV0aW5nc1xuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdFx0ICAgIH1cblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0XHQgICAgfVxuXHRcdFx0fTtcblxuXHRcdCAgLy9Vc2UgdGhpcyBtZXRob2QgZm9yIGNsaWNraW5nIG9uIG1lZXRpbmdzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0XHRcdFx0aWYoZXZlbnQuc3RhcnQuaXNBZnRlcihtb21lbnQoKSkpe1xuXHRcdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KFwiWW91IGNhbm5vdCBlZGl0IG1lZXRpbmdzIGluIHRoZSBwYXN0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdCAgLy9XaGVuIHNlbGVjdGluZyBuZXcgYXJlYXMsIHVzZSB0aGUgc3R1ZGVudFNlbGVjdCBtZXRob2QgaW4gdGhlIGNhbGVuZGFyIGxpYnJhcnlcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IHN0dWRlbnRTZWxlY3Q7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNkZXNjJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0XCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JChcIiNlbmRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjZW5kX3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJy5tb2RhbCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXHRcdH1cblxuXHRcdC8vQmluZCBjbGljayBoYW5kbGVycyBvbiB0aGUgZm9ybVxuXHRcdCQoJyNzYXZlQnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlTWVldGluZyk7XG5cdFx0JCgnI2RlbGV0ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlTWVldGluZyk7XG5cdFx0JCgnI2R1cmF0aW9uJykub24oJ2NoYW5nZScsIGNoYW5nZUR1cmF0aW9uKTtcblxuXHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzIHdpdGggbm8gYmluZGluZ1xuXHR9ZWxzZXtcblx0XHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzLCBzZXQgcmVuZGVyaW5nIHRvIGJhY2tncm91bmRcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdGFibGUgPSBmYWxzZTtcblxuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdCAgICB9XG5cdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0ICAgIH1cblx0XHR9O1xuXHR9XG5cblx0Ly9pbml0YWxpemUgdGhlIGNhbGVuZGFyIVxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoZXhwb3J0cy5jYWxlbmRhckRhdGEpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGNhbGVuZGFyIGJ5IGNsb3NpbmcgbW9kYWxzIGFuZCByZWxvYWRpbmcgZGF0YVxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBmb3JtIHRvIGhpZGUgKGFuZCB0aGUgc3BpbilcbiAqIEBwYXJhbSByZXBvbnNlIC0gdGhlIEF4aW9zIHJlcHNvbnNlIG9iamVjdCByZWNlaXZlZFxuICovXG52YXIgcmVzZXRDYWxlbmRhciA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlc3BvbnNlKXtcblx0Ly9oaWRlIHRoZSBmb3JtXG5cdCQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2Rpc3BsYXkgdGhlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcblx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cblx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRpZih3aW5kb3cuYWR2aXNvcil7XG5cdFx0bG9hZENvbmZsaWN0cygpO1xuXHR9XG59XG5cbi8qKlxuICogQUpBWCBtZXRob2QgdG8gc2F2ZSBkYXRhIGZyb20gYSBmb3JtXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgc291cmNlIGVsZW1lbnQgb2YgdGhlIGRhdGFcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhTYXZlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24pe1xuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHQgIC8vaWYgcmVzcG9uc2UgaXMgMnh4XG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0fSlcblx0XHQvL2lmIHJlc3BvbnNlIGlzIG5vdCAyeHhcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHR9KTtcbn1cblxudmFyIGFqYXhEZWxldGUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbiwgbm9SZXNldCwgbm9DaG9pY2Upe1xuXHQvL2NoZWNrIG5vUmVzZXQgdmFyaWFibGVcblx0bm9SZXNldCB8fCAobm9SZXNldCA9IGZhbHNlKTtcblx0bm9DaG9pY2UgfHwgKG5vQ2hvaWNlID0gZmFsc2UpO1xuXG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBjb25maXJtYXRpb25cblx0aWYoIW5vQ2hvaWNlKXtcblx0XHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdH1lbHNle1xuXHRcdHZhciBjaG9pY2UgPSB0cnVlO1xuXHR9XG5cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblxuXHRcdC8vaWYgY29uZmlybWVkLCBzaG93IHNwaW5uaW5nIGljb25cblx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vbWFrZSBBSkFYIHJlcXVlc3QgdG8gZGVsZXRlXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihub1Jlc2V0KXtcblx0XHRcdFx0XHQvL2hpZGUgcGFyZW50IGVsZW1lbnQgLSBUT0RPIFRFU1RNRVxuXHRcdFx0XHRcdC8vY2FsbGVyLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIGEgbWVldGluZ1xuICovXG52YXIgc2F2ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlRXZlbnRTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0c3RhcnQ6IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0ZW5kOiBtb21lbnQoJCgnI2VuZCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHR0aXRsZTogJCgnI3RpdGxlJykudmFsKCksXG5cdFx0ZGVzYzogJCgnI2Rlc2MnKS52YWwoKSxcblx0XHRzdGF0dXM6ICQoJyNzdGF0dXMnKS52YWwoKVxuXHR9O1xuXHRkYXRhLmlkID0gZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRDtcblx0aWYoJCgnI21lZXRpbmdJRCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5tZWV0aW5naWQgPSAkKCcjbWVldGluZ0lEJykudmFsKCk7XG5cdH1cblx0aWYoJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5zdHVkZW50aWQgPSAkKCcjc3R1ZGVudGlkdmFsJykudmFsKCk7XG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlbWVldGluZyc7XG5cblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdzYXZlIG1lZXRpbmcnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGEgbWVldGluZ1xuICovXG52YXIgZGVsZXRlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCB1cmxcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiAkKCcjbWVldGluZ0lEJykudmFsKClcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdkZWxldGUgbWVldGluZycsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcG9wdWxhdGUgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgZWRpdGluZ1xuICpcbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byBlZGl0XG4gKi9cbnZhciBzaG93TWVldGluZ0Zvcm0gPSBmdW5jdGlvbihldmVudCl7XG5cdCQoJyN0aXRsZScpLnZhbChldmVudC50aXRsZSk7XG5cdCQoJyNzdGFydCcpLnZhbChldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZW5kJykudmFsKGV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZGVzYycpLnZhbChldmVudC5kZXNjKTtcblx0ZHVyYXRpb25PcHRpb25zKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpO1xuXHQkKCcjbWVldGluZ0lEJykudmFsKGV2ZW50LmlkKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0JCgnI3N0YXR1cycpLnZhbChldmVudC5zdGF0dXMpO1xuXHQkKCcjZGVsZXRlQnV0dG9uJykuc2hvdygpO1xuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBjcmVhdGlvblxuICpcbiAqIEBwYXJhbSBjYWxlbmRhclN0dWRlbnROYW1lIC0gc3RyaW5nIG5hbWUgb2YgdGhlIHN0dWRlbnRcbiAqL1xudmFyIGNyZWF0ZU1lZXRpbmdGb3JtID0gZnVuY3Rpb24oY2FsZW5kYXJTdHVkZW50TmFtZSl7XG5cblx0Ly9wb3B1bGF0ZSB0aGUgdGl0bGUgYXV0b21hdGljYWxseSBmb3IgYSBzdHVkZW50XG5cdGlmKGNhbGVuZGFyU3R1ZGVudE5hbWUgIT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3RpdGxlJykudmFsKGNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9ZWxzZXtcblx0XHQkKCcjdGl0bGUnKS52YWwoJycpO1xuXHR9XG5cblx0Ly9TZXQgc3RhcnQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjc3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZW5kIHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNlbmQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMjApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZHVyYXRpb24gb3B0aW9uc1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHRkdXJhdGlvbk9wdGlvbnMobW9tZW50KCkuaG91cig4KS5taW51dGUoMCksIG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKSk7XG5cdH1lbHNle1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCwgZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kKTtcblx0fVxuXG5cdC8vUmVzZXQgb3RoZXIgb3B0aW9uc1xuXHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0Ly9IaWRlIGRlbGV0ZSBidXR0b25cblx0JCgnI2RlbGV0ZUJ1dHRvbicpLmhpZGUoKTtcblxuXHQvL1Nob3cgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSBvbiB0aGlzIHBhZ2VcbiAqL1xudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNldCBkdXJhdGlvbiBvcHRpb25zIGZvciB0aGUgbWVldGluZyBmb3JtXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZVxuICogQHBhcmFtIGVuZCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZGluZyB0aW1lXG4gKi9cbnZhciBkdXJhdGlvbk9wdGlvbnMgPSBmdW5jdGlvbihzdGFydCwgZW5kKXtcblx0Ly9jbGVhciB0aGUgbGlzdFxuXHQkKCcjZHVyYXRpb24nKS5lbXB0eSgpO1xuXG5cdC8vYXNzdW1lIGFsbCBtZWV0aW5ncyBoYXZlIHJvb20gZm9yIDIwIG1pbnV0ZXNcblx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nMjAnPjIwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MjAsIGFsbG93IDQwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDIwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNDAnPjQwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDowMCwgYWxsb3cgNjAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzYwJz42MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9zZXQgZGVmYXVsdCB2YWx1ZSBiYXNlZCBvbiBnaXZlbiBzcGFuXG5cdCQoJyNkdXJhdGlvbicpLnZhbChlbmQuZGlmZihzdGFydCwgXCJtaW51dGVzXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbGluayB0aGUgZGF0ZXBpY2tlcnMgdG9nZXRoZXJcbiAqXG4gKiBAcGFyYW0gZWxlbTEgLSBqUXVlcnkgb2JqZWN0IGZvciBmaXJzdCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZWxlbTIgLSBqUXVlcnkgb2JqZWN0IGZvciBzZWNvbmQgZGF0ZXBpY2tlclxuICogQHBhcmFtIGR1cmF0aW9uIC0gZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGxpbmtEYXRlUGlja2VycyA9IGZ1bmN0aW9uKGVsZW0xLCBlbGVtMiwgZHVyYXRpb24pe1xuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBmaXJzdCBkYXRhcGlja2VyXG5cdCQoZWxlbTEgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUyID0gbW9tZW50KCQoZWxlbTIpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQWZ0ZXIoZGF0ZTIpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTIpKXtcblx0XHRcdGRhdGUyID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0yKS52YWwoZGF0ZTIuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIHNlY29uZCBkYXRlcGlja2VyXG5cdCQoZWxlbTIgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUxID0gbW9tZW50KCQoZWxlbTEpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQmVmb3JlKGRhdGUxKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUxKSl7XG5cdFx0XHRkYXRlMSA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMSkudmFsKGRhdGUxLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgY2hhbmdlRHVyYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgbmV3RGF0ZSA9IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgJ0xMTCcpLmFkZCgkKHRoaXMpLnZhbCgpLCBcIm1pbnV0ZXNcIik7XG5cdCQoJyNlbmQnKS52YWwobmV3RGF0ZS5mb3JtYXQoXCJMTExcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2ZXJpZnkgdGhhdCB0aGUgc3R1ZGVudHMgYXJlIHNlbGVjdGluZyBtZWV0aW5ncyB0aGF0IGFyZW4ndCB0b28gbG9uZ1xuICpcbiAqIEBwYXJhbSBzdGFydCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCBvZiB0aGUgbWVldGluZ1xuICogQHBhcmFtIGVuZCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmQgb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIHN0dWRlbnRTZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cblx0Ly9XaGVuIHN0dWRlbnRzIHNlbGVjdCBhIG1lZXRpbmcsIGRpZmYgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXNcblx0aWYoZW5kLmRpZmYoc3RhcnQsICdtaW51dGVzJykgPiA2MCl7XG5cblx0XHQvL2lmIGludmFsaWQsIHVuc2VsZWN0IGFuZCBzaG93IGFuIGVycm9yXG5cdFx0YWxlcnQoXCJNZWV0aW5ncyBjYW5ub3QgbGFzdCBsb25nZXIgdGhhbiAxIGhvdXJcIik7XG5cdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHR9ZWxzZXtcblxuXHRcdC8vaWYgdmFsaWQsIHNldCBkYXRhIGluIHRoZSBzZXNzaW9uIGFuZCBzaG93IHRoZSBmb3JtXG5cdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRlbmQ6IGVuZFxuXHRcdH07XG5cdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0Y3JlYXRlTWVldGluZ0Zvcm0oZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBMb2FkIGNvbmZsaWN0aW5nIG1lZXRpbmdzIGZyb20gdGhlIHNlcnZlclxuICovXG52YXIgbG9hZENvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9yZXF1ZXN0IGNvbmZsaWN0cyB2aWEgQUpBWFxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvYWR2aXNpbmcvY29uZmxpY3RzJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdC8vZGlzYWJsZSBleGlzdGluZyBjbGljayBoYW5kbGVyc1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0Ly9JZiByZXNwb25zZSBpcyAyMDAsIGRhdGEgd2FzIHJlY2VpdmVkXG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gMjAwKXtcblxuXHRcdFx0XHQvL0FwcGVuZCBIVE1MIGZvciBjb25mbGljdHMgdG8gRE9NXG5cdFx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpLmVtcHR5KCk7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdCQoJzxkaXYvPicsIHtcblx0XHRcdFx0XHRcdCdpZCcgOiAncmVzb2x2ZScrdmFsdWUuaWQsXG5cdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RWRpdDwvYnV0dG9uPiAnICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0IHJlc29sdmVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPktlZXAgTWVldGluZzwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZScrdmFsdWUuaWQrJ1NwaW5cIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0fSkuYXBwZW5kVG8oJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvL1JlLXJlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHRcdC8vU2hvdyB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cblx0XHQgIC8vSWYgcmVzcG9uc2UgaXMgMjA0LCBubyBjb25mbGljdHMgYXJlIHByZXNlbnRcblx0XHRcdH1lbHNlIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQpe1xuXG5cdFx0XHRcdC8vSGlkZSB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gcmV0cmlldmUgY29uZmxpY3RpbmcgbWVldGluZ3M6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fSk7XG5cblx0XHQvKlxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0bWV0aG9kOiBcIkdFVFwiLFxuXHRcdFx0XHR1cmw6ICcvYWR2aXNpbmcvY29uZmxpY3RzJyxcblx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJ1xuXHRcdFx0fSlcblx0XHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIG1lc3NhZ2UsIGpxWEhSKSB7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXHRcdFx0XHRpZihqcVhIUi5zdGF0dXMgPT0gMjAwKXtcblx0XHRcdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKS5lbXB0eSgpO1xuXHRcdFx0XHRcdCQuZWFjaChkYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RWRpdDwvYnV0dG9uPiAnICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0IHJlc29sdmVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPktlZXAgTWVldGluZzwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZVNwaW4nK3ZhbHVlLmlkKydcIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXHRcdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoanFYSFIuc3RhdHVzID09IDIwNCl7XG5cdFx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLmZhaWwoZnVuY3Rpb24oIGpxWEhSLCBtZXNzYWdlICl7XG5cdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIHJldHJpZXZlIGNvbmZsaWN0aW5nIG1lZXRpbmdzOiBcIiArIGpxWEhSLnJlc3BvbnNlSlNPTik7XG5cdFx0XHR9KTtcblx0XHQqL1xufVxuXG4vKipcbiAqIFNhdmUgYmxhY2tvdXRzIGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIHNhdmVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVCbGFja291dFNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIHVybDtcblx0dmFyIGRhdGEgPSB7XG5cdFx0YnN0YXJ0OiBtb21lbnQoJCgnI2JzdGFydCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YmVuZDogbW9tZW50KCQoJyNiZW5kJykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRidGl0bGU6ICQoJyNidGl0bGUnKS52YWwoKVxuXHR9O1xuXHR2YXIgdXJsO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhLmJibGFja291dGV2ZW50aWQgPSAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpO1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0Jztcblx0XHRpZigkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSA+IDApe1xuXHRcdFx0ZGF0YS5iYmxhY2tvdXRpZCA9ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpO1xuXHRcdH1cblx0XHRkYXRhLmJyZXBlYXQgPSAkKCcjYnJlcGVhdCcpLnZhbCgpO1xuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMSl7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeT0gJCgnI2JyZXBlYXRkYWlseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMil7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeSA9ICQoJyNicmVwZWF0d2Vla2x5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c20gPSAkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdCA9ICQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN3ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3UgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzZiA9ICQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnc2F2ZSBibGFja291dCcpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgYmxhY2tvdXQgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgZGVsZXRlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgVVJMIGFuZCBkYXRhIG9iamVjdFxuXHR2YXIgdXJsLCBkYXRhO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRldmVudGlkOiAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpIH07XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGlkOiAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSB9O1xuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdkZWxldGUgYmxhY2tvdXQnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgY2hhbmdlIG9mIHJlcGVhdCBvcHRpb25zIG9uIHRoZSBibGFja291dCBmb3JtXG4gKi9cbnZhciByZXBlYXRDaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKHRoaXMpLnZhbCgpID09IDApe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAxKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMil7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9XG59O1xuXG4vKipcbiAqIFNob3cgdGhlIHJlc29sdmUgY29uZmxpY3RzIG1vZGFsIGZvcm1cbiAqL1xudmFyIHJlc29sdmVDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHQvL3NlbmQgQUpBWCBkZWxldGVcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ2RlbGV0ZSBtZWV0aW5nJywgdHJ1ZSk7XG5cbn07XG5cbi8qKlxuICogRWRpdCBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBlZGl0Q29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL21lZXRpbmcnO1xuXG5cdC8vc2hvdyBzcGlubmVyIHRvIGxvYWQgbWVldGluZ1xuXHQkKCcjcmVzb2x2ZScrIGlkICsgJ1NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9sb2FkIG1lZXRpbmcgYW5kIGRpc3BsYXkgZm9ybVxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjcmVzb2x2ZScrIGlkICsgJ1NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdGV2ZW50ID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdGV2ZW50LnN0YXJ0ID0gbW9tZW50KGV2ZW50LnN0YXJ0KTtcblx0XHRcdGV2ZW50LmVuZCA9IG1vbWVudChldmVudC5lbmQpO1xuXHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBtZWV0aW5nJywgJyNyZXNvbHZlJyArIGlkLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIFJlc29sdmUgYSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL3Jlc29sdmVjb25mbGljdCc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ3Jlc29sdmUgbWVldGluZycsIHRydWUsIHRydWUpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgdGhlIGNyZWF0ZSBibGFja291dCBmb3JtXG4gKi9cbnZhciBjcmVhdGVCbGFja291dEZvcm0gPSBmdW5jdGlvbigpe1xuXHQkKCcjYnRpdGxlJykudmFsKFwiXCIpO1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOSkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQkKCcjYnJlcGVhdCcpLnZhbCgwKTtcblx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuaGlkZSgpO1xuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSB0byBhIHNpbmdsZSBvY2N1cnJlbmNlXG4gKi9cbnZhciBibGFja291dE9jY3VycmVuY2UgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL3NldCBmb3JtIHZhbHVlcyBhbmQgaGlkZSB1bm5lZWRlZCBmaWVsZHNcblx0JCgnI2J0aXRsZScpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC50aXRsZSk7XG5cdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWQpO1xuXHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5pZCk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblxuXHQvL3Nob3cgdGhlIGZvcm1cblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIGJsYWNrb3V0IHNlcmllcyBlZGl0IGZvcm1cbiAqL1xudmFyIGJsYWNrb3V0U2VyaWVzID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG4gXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdGlkOiBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2JsYWNrb3V0JztcblxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjYnRpdGxlJykudmFsKHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cdCBcdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5zdGFydCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5lbmQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JibGFja291dGlkJykudmFsKHJlc3BvbnNlLmRhdGEuaWQpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0IFx0XHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCBcdFx0aWYocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAxKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0ZGFpbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1lbHNlIGlmIChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDIpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHRcdFx0XHR2YXIgcmVwZWF0X2RldGFpbCA9IFN0cmluZyhyZXNwb25zZS5kYXRhLnJlcGVhdF9kZXRhaWwpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjFcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjJcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjNcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjRcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjVcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1cblx0IFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cdCBcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBibGFja291dCBzZXJpZXMnLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgc3R1ZGVudCBpbiB0aGUgZGF0YWJhc2VcbiAqL1xudmFyIG5ld1N0dWRlbnQgPSBmdW5jdGlvbigpe1xuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgYW4gZUlEIHRvIGFkZCB0byB0aGUgc3lzdGVtXG5cdHZhciBlaWQgPSBwcm9tcHQoXCJFbnRlciB0aGUgc3R1ZGVudCdzIGVJRFwiKTtcblxuXHQvL2J1aWxkIHRoZSBVUkwgYW5kIGRhdGFcblx0dmFyIGRhdGEgPSB7XG5cdFx0ZWlkOiBlaWQsXG5cdH07XG5cdHZhciB1cmwgPSAnL3Byb2ZpbGUvbmV3c3R1ZGVudCc7XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDQyMiwgZXJyb3JzIHdlcmUgcHJvdmlkZWRcblx0XHRcdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YVtcImVpZFwiXSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuICBzaXRlID0gcmVxdWlyZSgnLi9zaXRlJyk7XG5cbiAgLy9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gKHVzdWFsbHkgZnJvbSBhIHByZXZpb3VzIHN1Y2Nlc3NmdWwgc2F2ZSlcbiAgc2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTc3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIndpbmRvdy5WdWUgPSByZXF1aXJlKCd2dWUnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG4vL3ZhciBFY2hvID0gcmVxdWlyZSgnbGFyYXZlbC1lY2hvJyk7XG5yZXF1aXJlKCdpb24tc291bmQnKTtcblxuLy93aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8qKlxuICogR3JvdXBzZXNzaW9uIGluaXQgZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgdG8gc3RhcnRcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2xvYWQgaW9uLXNvdW5kIGxpYnJhcnlcblx0aW9uLnNvdW5kKHtcbiAgICBzb3VuZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJkb29yX2JlbGxcIlxuICAgICAgICB9LFxuICAgIF0sXG4gICAgdm9sdW1lOiAxLjAsXG4gICAgcGF0aDogXCIvc291bmRzL1wiLFxuICAgIHByZWxvYWQ6IHRydWVcblx0fSk7XG5cblx0Ly9nZXQgdXNlcklEIGFuZCBpc0Fkdmlzb3IgdmFyaWFibGVzXG5cdHZhciB1c2VySUQgPSBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpO1xuXHR2YXIgaXNBZHZpc29yID0gcGFyc2VJbnQoJCgnI2lzQWR2aXNvcicpLnZhbCgpKTtcblxuXHQvL3JlZ2lzdGVyIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLm9uKCdjbGljaycsIGdyb3VwUmVnaXN0ZXJCdG4pO1xuXG5cdC8vZGlzYWJsZSBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwRGlzYWJsZUJ0bicpLm9uKCdjbGljaycsIGdyb3VwRGlzYWJsZUJ0bik7XG5cblx0Ly9yZW5kZXIgVnVlIEFwcFxuXHR3aW5kb3cudm0gPSBuZXcgVnVlKHtcblx0XHRlbDogJyNncm91cExpc3QnLFxuXHRcdGRhdGE6IHtcblx0XHRcdHF1ZXVlOiBbXSxcblx0XHRcdGFkdmlzb3I6IHBhcnNlSW50KCQoJyNpc0Fkdmlzb3InKS52YWwoKSkgPT0gMSxcblx0XHRcdHVzZXJJRDogcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdGdldENsYXNzOiBmdW5jdGlvbihzKXtcblx0XHRcdFx0cmV0dXJue1xuXHRcdFx0XHRcdCdhbGVydC1pbmZvJzogcy5zdGF0dXMgPT0gMCB8fCBzLnN0YXR1cyA9PSAxLFxuXHRcdFx0XHRcdCdhbGVydC1zdWNjZXNzJzogcy5zdGF0dXMgPT0gMixcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW1lJzogcy51c2VyaWQgPT0gdGhpcy51c2VySUQsXG5cdFx0XHRcdH07XG5cdFx0XHR9LFxuXHRcdFx0Ly9mdW5jdGlvbiB0byB0YWtlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHR0YWtlU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3Rha2UnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3Rha2UnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gcHV0IGEgc3R1ZGVudCBiYWNrIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3Rcblx0XHRcdHB1dFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9wdXQnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3B1dCcpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly8gZnVuY3Rpb24gdG8gbWFyayBhIHN0dWRlbnQgZG9uZSBvbiB0aGUgbGlzdFxuXHRcdFx0ZG9uZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kb25lJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdtYXJrIGRvbmUnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gZGVsZXRlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHRkZWxTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZGVsZXRlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdkZWxldGUnKTtcblx0XHRcdH0sXG5cdFx0fSxcblx0fSlcblxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvZ3JvdXBzZXNzaW9uL3F1ZXVlJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHR2bS5xdWV1ZSA9IHZtLnF1ZXVlLmNvbmNhdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdGNoZWNrQnV0dG9ucyh2bS5xdWV1ZSk7XG5cdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHZtLnF1ZXVlKTtcblx0XHRcdHZtLnF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdnZXQgcXVldWUnLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xuXG59O1xuXG5cbi8qKlxuICogVnVlIGZpbHRlciBmb3Igc3RhdHVzIHRleHRcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBzdHVkZW50IHRvIHJlbmRlclxuICovXG5WdWUuZmlsdGVyKCdzdGF0dXN0ZXh0JywgZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAwKSByZXR1cm4gXCJORVdcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDEpIHJldHVybiBcIlFVRVVFRFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMikgcmV0dXJuIFwiTUVFVCBXSVRIIFwiICsgZGF0YS5hZHZpc29yO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMykgcmV0dXJuIFwiREVMQVlcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDQpIHJldHVybiBcIkFCU0VOVFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNSkgcmV0dXJuIFwiRE9ORVwiO1xufSk7XG5cbi8qKlxuICogVnVlIGNvbXBvbmVudCBmb3IgZGlzcGxheWluZyBhIHN0dWRlbnQgcm93XG4gKi9cblZ1ZS5jb21wb25lbnQoJ3N0dWRlbnQtcm93Jywge1xuXHRwcm9wczogWydzdHVkZW50J10sXG5cdHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm8gZ3JvdXBzZXNzaW9uLWRpdlwiIHJvbGU9XCJhbGVydFwiPnt7IHN0dWRlbnQubmFtZSB9fSA8c3BhbiBjbGFzcz1cImJhZGdlXCI+IHt7IHN0dWRlbnQgfCBzdGF0dXN0ZXh0IH19PC9zcGFuPjwvZGl2PicsXG5cbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3VwU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB1c2VySUQgKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiX3Rva2VuXCIgdmFsdWU9XCInICsgdG9rZW4gKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmRUbygkKGRvY3VtZW50LmJvZHkpKSAvL2l0IGhhcyB0byBiZSBhZGRlZCBzb21ld2hlcmUgaW50byB0aGUgPGJvZHk+XG5cdFx0XHRcdC5zdWJtaXQoKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBlbmFibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZW5hYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRpc2FibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZGlzYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBhbmQgc2VlIGlmIHVzZXIgaXMgb24gdGhlIGxpc3QgLSBpZiBub3QsIGRvbid0IGVuYWJsZSBidXR0b25cbiAqL1xudmFyIGNoZWNrQnV0dG9ucyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0dmFyIGZvdW5kTWUgPSBmYWxzZTtcblxuXHQvL2l0ZXJhdGUgdGhyb3VnaCB1c2VycyBvbiBsaXN0LCBsb29raW5nIGZvciBjdXJyZW50IHVzZXJcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHVzZXJJRCl7XG5cdFx0XHRmb3VuZE1lID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8vaWYgZm91bmQsIGRpc2FibGUgYnV0dG9uOyBpZiBub3QsIGVuYWJsZSBidXR0b25cblx0aWYoZm91bmRNZSl7XG5cdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHR9ZWxzZXtcblx0XHRlbmFibGVCdXR0b24oKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGJlY2tvbmVkLCBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcGVyc29uIC0gdGhlIGN1cnJlbnQgdXNlciB0byBjaGVja1xuICovXG52YXIgY2hlY2tEaW5nID0gZnVuY3Rpb24ocGVyc29uKXtcblx0aWYocGVyc29uLnN0YXR1cyA9PSAyKXtcblx0XHRpb24uc291bmQucGxheShcImRvb3JfYmVsbFwiKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBwZXJzb24gaGFzIGJlZW4gYmVja29uZWQgb24gbG9hZDsgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHF1ZXVlIC0gdGhlIGluaXRpYWwgcXVldWUgb2YgdXNlcnMgbG9hZGVkXG4gKi9cbnZhciBpbml0aWFsQ2hlY2tEaW5nID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gdXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuXHRcdFx0bGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG5cdFx0fTtcblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHQvL3NlbmQgQUpBWCBwb3N0XG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBhZHZpc29yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlQWR2aXNvclByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZVNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdC8vVE9ETyBURVNUTUVcblx0XHR2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGRhdGEuYXBwZW5kKFwibmFtZVwiLCAkKCcjbmFtZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwicGhvbmVcIiwgJCgnI3Bob25lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuXHRcdGlmKCQoJyNwaWMnKS52YWwoKSl7XG5cdFx0XHRkYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZVNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYycpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0JCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0XHQkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0Ly9odHRwOi8vd3d3LmFiZWF1dGlmdWxzaXRlLm5ldC93aGlwcGluZy1maWxlLWlucHV0cy1pbnRvLXNoYXBlLXdpdGgtYm9vdHN0cmFwLTMvXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG5cdCAgdmFyIGlucHV0ID0gJCh0aGlzKSxcblx0ICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcblx0ICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG5cdCAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcblx0fSk7XG5cblx0Ly9iaW5kIHRvIGZpbGVzZWxlY3QgYnV0dG9uXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0Jyk7XG5cdFx0XHR2YXIgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZihpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC52YWwobG9nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKGxvZyl7XG5cdFx0XHRcdFx0XHRhbGVydChsb2cpO1xuXHRcdFx0XHRcdH1cbiAgICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMTgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIGZyb20gdGhlIGZsYXNoZWQgc2Vzc2lvbiBkYXRhXG4gKlxuICogdXNlICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgnbWVzc2FnZScsIHRyYW5zKCdtZXNzYWdlcy5pdGVtX3NhdmVkJykpO1xuICogICAgICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgndHlwZScsICdzdWNjZXNzJyk7XG4gKiB0byBzZXQgbWVzc2FnZSB0ZXh0IGFuZCB0eXBlXG4gKi9cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKXtcblx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cImphdmFzY3JpcHRNZXNzYWdlXCIgY2xhc3M9XCJhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LScgKyB0eXBlICsgJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PC9idXR0b24+PHNwYW4gY2xhc3M9XCJoNFwiPicgKyBtZXNzYWdlICsgJzwvc3Bhbj48L2Rpdj4nO1xuXHQkKCcjbWVzc2FnZScpLmFwcGVuZChodG1sKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKFwiI2phdmFzY3JpcHRNZXNzYWdlXCIpLmFsZXJ0KCdjbG9zZScpO1xuXHR9LCAzMDAwKTtcbn07XG5cbi8qXG5leHBvcnRzLmFqYXhjcnNmID0gZnVuY3Rpb24oKXtcblx0JC5hamF4U2V0dXAoe1xuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG5cdFx0fVxuXHR9KTtcbn07XG4qL1xuXG4vKipcbiAqIENsZWFycyBlcnJvcnMgb24gZm9ybXMgYnkgcmVtb3ZpbmcgZXJyb3IgY2xhc3Nlc1xuICovXG5leHBvcnRzLmNsZWFyRm9ybUVycm9ycyA9IGZ1bmN0aW9uKCl7XG5cdCQoJy5mb3JtLWdyb3VwJykuZWFjaChmdW5jdGlvbiAoKXtcblx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFNldHMgZXJyb3JzIG9uIGZvcm1zIGJhc2VkIG9uIHJlc3BvbnNlIEpTT05cbiAqL1xuZXhwb3J0cy5zZXRGb3JtRXJyb3JzID0gZnVuY3Rpb24oanNvbil7XG5cdGV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdCQuZWFjaChqc29uLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdCQoJyMnICsga2V5KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKCcjJyArIGtleSArICdoZWxwJykudGV4dCh2YWx1ZS5qb2luKCcgJykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG1lc3NhZ2VzIGluIHRoZSBmbGFzaCBkYXRhLiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IGJ5IHRoZSBwYWdlXG4gKi9cbmV4cG9ydHMuY2hlY2tNZXNzYWdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCgnI21lc3NhZ2VfZmxhc2gnKS5sZW5ndGgpe1xuXHRcdHZhciBtZXNzYWdlID0gJCgnI21lc3NhZ2VfZmxhc2gnKS52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICQoJyNtZXNzYWdlX3R5cGVfZmxhc2gnKS52YWwoKTtcblx0XHRleHBvcnRzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIHR5cGUpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGVycm9ycyBmcm9tIEFKQVhcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gZXJyb3IgLSB0aGUgQXhpb3MgZXJyb3IgcmVjZWl2ZWRcbiAqL1xuZXhwb3J0cy5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGVsZW1lbnQsIGVycm9yKXtcblx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0ZXhwb3J0cy5zZXRGb3JtRXJyb3JzKGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gXCIgKyBtZXNzYWdlICsgXCI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0aWYoZWxlbWVudC5sZW5ndGggPiAwKXtcblx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiXSwic291cmNlUm9vdCI6IiJ9