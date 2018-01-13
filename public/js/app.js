webpackJsonp([1],{

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(145);
module.exports = __webpack_require__(185);


/***/ }),

/***/ 145:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(146);

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
				var calendar = __webpack_require__(176);
				calendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
		GroupsessionController: {
			//groupsession/index
			getIndex: function getIndex() {
				var editable = __webpack_require__(178);
				editable.init();
			},
			getList: function getList() {
				var groupsession = __webpack_require__(181);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(184);
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

/***/ 146:
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

/***/ 176:
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

/***/ 178:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function () {

  //Load required libraries
  __webpack_require__(3);
  __webpack_require__(179);
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

/***/ 179:
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

/***/ 181:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {window.Vue = __webpack_require__(140);
var site = __webpack_require__(4);
var Echo = __webpack_require__(141);
__webpack_require__(142);

window.Pusher = __webpack_require__(143);

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
	window.userID = parseInt($('#userID').val());

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
			userID: parseInt($('#userID').val()),
			online: []
		},
		methods: {
			//Function to get CSS classes for a student object
			getClass: function getClass(s) {
				return {
					'alert-info': s.status == 0 || s.status == 1,
					'alert-success': s.status == 2,
					'groupsession-me': s.userid == this.userID,
					'groupsession-offline': $.inArray(s.userid, this.online) == -1
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

	//Enable Pusher logging
	if (window.env == "local" || window.env == "staging") {
		console.log("Pusher logging enabled!");
		Pusher.logToConsole = true;
	}

	//Load the Echo instance on the window
	window.Echo = new Echo({
		broadcaster: 'pusher',
		key: window.pusherKey,
		cluster: window.pusherCluster
	});

	//Bind to the connected action on Pusher (called when connected)
	window.Echo.connector.pusher.connection.bind('connected', function () {
		//when connected, disable the spinner
		$('#groupSpin').addClass('hide-spin');

		//Load the initial student queue via AJAX
		window.axios.get('/groupsession/queue').then(function (response) {
			window.vm.queue = window.vm.queue.concat(response.data);
			checkButtons(window.vm.queue);
			initialCheckDing(window.vm.queue);
			window.vm.queue.sort(sortFunction);
		}).catch(function (error) {
			site.handleError('get queue', '', error);
		});
	});

	//Connect to the groupsession channel
	/*
 window.Echo.channel('groupsession')
 	.listen('GroupsessionRegister', (data) => {
 		});
 */

	//Connect to the groupsessionend channel
	window.Echo.channel('groupsessionend').listen('GroupsessionEnd', function (e) {

		//if ending, redirect back to home page
		window.location.href = "/groupsession";
	});

	window.Echo.join('presence').here(function (users) {
		var len = users.length;
		for (var i = 0; i < len; i++) {
			window.vm.online.push(users[i].id);
		}
	}).joining(function (user) {
		window.vm.online.push(user.id);
	}).leaving(function (user) {
		window.vm.online.splice($.inArray(user.id, window.vm.online), 1);
	}).listen('GroupsessionRegister', function (data) {
		var queue = window.vm.queue;
		var found = false;
		var len = queue.length;

		//update the queue based on response
		for (var i = 0; i < len; i++) {
			if (queue[i].id === data.id) {
				if (data.status < 3) {
					queue[i] = data;
				} else {
					queue.splice(i, 1);
					i--;
					len--;
				}
				found = true;
			}
		}

		//if element not found on current queue, push it on to the queue
		if (!found) {
			queue.push(data);
		}

		//check to see if current user is on queue before enabling button
		checkButtons(queue);

		//if current user is found, check for status update to play sound
		if (data.userid === userID) {
			checkDing(data);
		}

		//sort the queue correctly
		queue.sort(sortFunction);

		//update Vue state, might be unnecessary
		window.vm.queue = queue;
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
			$('<form action="/groupsession/disable" method="POST"/>').append($('<input type="hidden" name="id" value="' + window.userID + '">')).append($('<input type="hidden" name="_token" value="' + token + '">')).appendTo($(document.body)) //it has to be added somewhere into the <body>
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
		if (queue[i].userid === window.userID) {
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
		if (queue[i].userid === window.userID) {
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

/***/ 184:
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

/***/ 185:
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

},[144]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzcz82ZDEwIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJBcHAiLCJhY3Rpb25zIiwiaW5kZXgiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJnZXRJbmRleCIsImNhbGVuZGFyIiwiaW5pdCIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJlZGl0YWJsZSIsImdldExpc3QiLCJncm91cHNlc3Npb24iLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiY29udHJvbGxlciIsImFjdGlvbiIsIndpbmRvdyIsIl8iLCIkIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJjb250ZW50IiwiY29uc29sZSIsImVycm9yIiwibW9tZW50Iiwic2l0ZSIsImV4cG9ydHMiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidXJsIiwidHlwZSIsImFsZXJ0IiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsImV2ZW50IiwicmVuZGVyaW5nIiwidGltZUZvcm1hdCIsImRhdGVQaWNrZXJEYXRhIiwiZGF5c09mV2Vla0Rpc2FibGVkIiwiZm9ybWF0Iiwic3RlcHBpbmciLCJlbmFibGVkSG91cnMiLCJtYXhIb3VyIiwic2lkZUJ5U2lkZSIsImlnbm9yZVJlYWRvbmx5IiwiYWxsb3dJbnB1dFRvZ2dsZSIsImRhdGVQaWNrZXJEYXRlT25seSIsImNoZWNrTWVzc2FnZSIsImFkdmlzb3IiLCJub2JpbmQiLCJ2YWwiLCJ0cmltIiwiZGF0YSIsImlkIiwid2lkdGgiLCJvbiIsImZvY3VzIiwicHJvcCIsInJlbW92ZUNsYXNzIiwic2hvdyIsInJlc2V0Rm9ybSIsImJpbmQiLCJuZXdTdHVkZW50IiwiaGlkZSIsImZpbmQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzdHVkZW50X2lkIiwic2hvd01lZXRpbmdGb3JtIiwicmVwZWF0IiwiYmxhY2tvdXRTZXJpZXMiLCJtb2RhbCIsInNlbGVjdCIsImNoYW5nZSIsInJlcGVhdENoYW5nZSIsInNhdmVCbGFja291dCIsImRlbGV0ZUJsYWNrb3V0IiwiYmxhY2tvdXRPY2N1cnJlbmNlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwiYXBwZW5kIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiY2hvaWNlIiwiY29uZmlybSIsImRlc2MiLCJzdGF0dXMiLCJtZWV0aW5naWQiLCJzdHVkZW50aWQiLCJkdXJhdGlvbk9wdGlvbnMiLCJ1bmRlZmluZWQiLCJob3VyIiwibWludXRlIiwiY2xlYXJGb3JtRXJyb3JzIiwiZW1wdHkiLCJtaW51dGVzIiwiZGlmZiIsImVsZW0xIiwiZWxlbTIiLCJkdXJhdGlvbiIsImUiLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZ2V0Iiwib2ZmIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJ0cmlnZ2VyIiwiYmxhY2tvdXRfaWQiLCJyZXBlYXRfdHlwZSIsInJlcGVhdF9ldmVyeSIsInJlcGVhdF91bnRpbCIsInJlcGVhdF9kZXRhaWwiLCJTdHJpbmciLCJpbmRleE9mIiwiZWlkIiwicHJvbXB0IiwiY2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInN1bW1lcm5vdGUiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIiwibG9jYXRpb24iLCJyZWxvYWQiLCJWdWUiLCJFY2hvIiwiUHVzaGVyIiwiaW9uIiwic291bmQiLCJzb3VuZHMiLCJuYW1lIiwidm9sdW1lIiwicGF0aCIsInByZWxvYWQiLCJ1c2VySUQiLCJwYXJzZUludCIsImdyb3VwUmVnaXN0ZXJCdG4iLCJncm91cERpc2FibGVCdG4iLCJ2bSIsImVsIiwicXVldWUiLCJvbmxpbmUiLCJtZXRob2RzIiwiZ2V0Q2xhc3MiLCJzIiwidXNlcmlkIiwiaW5BcnJheSIsInRha2VTdHVkZW50IiwiZ2lkIiwiY3VycmVudFRhcmdldCIsImRhdGFzZXQiLCJhamF4UG9zdCIsInB1dFN0dWRlbnQiLCJkb25lU3R1ZGVudCIsImRlbFN0dWRlbnQiLCJlbnYiLCJsb2ciLCJsb2dUb0NvbnNvbGUiLCJicm9hZGNhc3RlciIsImtleSIsInB1c2hlcktleSIsImNsdXN0ZXIiLCJwdXNoZXJDbHVzdGVyIiwiY29ubmVjdG9yIiwicHVzaGVyIiwiY29ubmVjdGlvbiIsImNvbmNhdCIsImNoZWNrQnV0dG9ucyIsImluaXRpYWxDaGVja0RpbmciLCJzb3J0Iiwic29ydEZ1bmN0aW9uIiwiY2hhbm5lbCIsImxpc3RlbiIsImhyZWYiLCJqb2luIiwiaGVyZSIsInVzZXJzIiwibGVuIiwibGVuZ3RoIiwiaSIsInB1c2giLCJqb2luaW5nIiwidXNlciIsImxlYXZpbmciLCJzcGxpY2UiLCJmb3VuZCIsImNoZWNrRGluZyIsImZpbHRlciIsImRpc2FibGVCdXR0b24iLCJyZWFsbHkiLCJhdHRyIiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJmb3VuZE1lIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwiZmlyc3RfbmFtZSIsImxhc3RfbmFtZSIsIkZvcm1EYXRhIiwiZmlsZXMiLCJpbnB1dCIsIm51bUZpbGVzIiwibGFiZWwiLCJyZXBsYWNlIiwicGFyZW50cyIsIm1lc3NhZ2UiLCJodG1sIiwic2V0VGltZW91dCIsInNldEZvcm1FcnJvcnMiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBQUEsQ0FBUSxHQUFSOztBQUVBLElBQUlDLE1BQU07O0FBRVQ7QUFDQUMsVUFBUztBQUNSO0FBQ0FDLFNBQU87QUFDTkEsVUFBTyxpQkFBVztBQUNqQjtBQUNBO0FBSEssR0FGQzs7QUFRUjtBQUNBQyxzQkFBb0I7QUFDbkI7QUFDQUMsYUFBVSxvQkFBVztBQUNwQixRQUFJQyxXQUFXLG1CQUFBTixDQUFRLEdBQVIsQ0FBZjtBQUNBTSxhQUFTQyxJQUFUO0FBQ0E7QUFMa0IsR0FUWjs7QUFpQlI7QUFDRUMsMEJBQXdCO0FBQ3pCO0FBQ0dILGFBQVUsb0JBQVc7QUFDbkIsUUFBSUksV0FBVyxtQkFBQVQsQ0FBUSxHQUFSLENBQWY7QUFDSlMsYUFBU0YsSUFBVDtBQUNHLElBTHFCO0FBTXpCRyxZQUFTLG1CQUFXO0FBQ25CLFFBQUlDLGVBQWUsbUJBQUFYLENBQVEsR0FBUixDQUFuQjtBQUNBVyxpQkFBYUosSUFBYjtBQUNBO0FBVHdCLEdBbEJsQjs7QUE4QlI7QUFDQUssc0JBQW9CO0FBQ25CO0FBQ0FQLGFBQVUsb0JBQVc7QUFDcEIsUUFBSVEsVUFBVSxtQkFBQWIsQ0FBUSxHQUFSLENBQWQ7QUFDQWEsWUFBUU4sSUFBUjtBQUNBO0FBTGtCO0FBL0JaLEVBSEE7O0FBMkNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLE9BQU0sY0FBU08sVUFBVCxFQUFxQkMsTUFBckIsRUFBNkI7QUFDbEMsTUFBSSxPQUFPLEtBQUtiLE9BQUwsQ0FBYVksVUFBYixDQUFQLEtBQW9DLFdBQXBDLElBQW1ELE9BQU8sS0FBS1osT0FBTCxDQUFhWSxVQUFiLEVBQXlCQyxNQUF6QixDQUFQLEtBQTRDLFdBQW5HLEVBQWdIO0FBQy9HO0FBQ0EsVUFBT2QsSUFBSUMsT0FBSixDQUFZWSxVQUFaLEVBQXdCQyxNQUF4QixHQUFQO0FBQ0E7QUFDRDtBQXBEUSxDQUFWOztBQXVEQTtBQUNBQyxPQUFPZixHQUFQLEdBQWFBLEdBQWIsQzs7Ozs7OztBQzlEQSw0RUFBQWUsT0FBT0MsQ0FBUCxHQUFXLG1CQUFBakIsQ0FBUSxDQUFSLENBQVg7O0FBRUE7Ozs7OztBQU1BZ0IsT0FBT0UsQ0FBUCxHQUFXLHVDQUFnQixtQkFBQWxCLENBQVEsQ0FBUixDQUEzQjs7QUFFQSxtQkFBQUEsQ0FBUSxDQUFSOztBQUVBOzs7Ozs7QUFNQWdCLE9BQU9HLEtBQVAsR0FBZSxtQkFBQW5CLENBQVEsRUFBUixDQUFmOztBQUVBO0FBQ0FnQixPQUFPRyxLQUFQLENBQWFDLFFBQWIsQ0FBc0JDLE9BQXRCLENBQThCQyxNQUE5QixDQUFxQyxrQkFBckMsSUFBMkQsZ0JBQTNEOztBQUVBOzs7Ozs7QUFNQSxJQUFJQyxRQUFRQyxTQUFTQyxJQUFULENBQWNDLGFBQWQsQ0FBNEIseUJBQTVCLENBQVo7O0FBRUEsSUFBSUgsS0FBSixFQUFXO0FBQ1BQLFNBQU9HLEtBQVAsQ0FBYUMsUUFBYixDQUFzQkMsT0FBdEIsQ0FBOEJDLE1BQTlCLENBQXFDLGNBQXJDLElBQXVEQyxNQUFNSSxPQUE3RDtBQUNILENBRkQsTUFFTztBQUNIQyxVQUFRQyxLQUFSLENBQWMsdUVBQWQ7QUFDSCxDOzs7Ozs7OztBQ25DRDtBQUNBLG1CQUFBN0IsQ0FBUSxFQUFSO0FBQ0EsbUJBQUFBLENBQVEsR0FBUjtBQUNBLElBQUk4QixTQUFTLG1CQUFBOUIsQ0FBUSxDQUFSLENBQWI7QUFDQSxJQUFJK0IsT0FBTyxtQkFBQS9CLENBQVEsQ0FBUixDQUFYO0FBQ0EsbUJBQUFBLENBQVEsR0FBUjs7QUFFQTtBQUNBZ0MsUUFBUUMsZUFBUixHQUEwQixFQUExQjs7QUFFQTtBQUNBRCxRQUFRRSxpQkFBUixHQUE0QixDQUFDLENBQTdCOztBQUVBO0FBQ0FGLFFBQVFHLG1CQUFSLEdBQThCLEVBQTlCOztBQUVBO0FBQ0FILFFBQVFJLFlBQVIsR0FBdUI7QUFDdEJDLFNBQVE7QUFDUEMsUUFBTSxpQkFEQztBQUVQQyxVQUFRLE9BRkQ7QUFHUEMsU0FBTztBQUhBLEVBRGM7QUFNdEIvQixXQUFVLEtBTlk7QUFPdEJnQyxhQUFZLElBUFU7QUFRdEJDLFNBQVEsTUFSYztBQVN0QkMsV0FBVSxLQVRZO0FBVXRCQyxnQkFBZTtBQUNkQyxTQUFPLE1BRE8sRUFDQztBQUNmQyxPQUFLLE9BRlMsRUFFQTtBQUNkQyxPQUFLLENBQUUsQ0FBRixFQUFLLENBQUwsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7QUFIUyxFQVZPO0FBZXRCQyxjQUFhLFlBZlM7QUFnQnRCQyxRQUFPO0FBQ05DLFVBQVE7QUFDUEMsZUFBWSxLQURMO0FBRVBDLGlCQUFjLFVBRlA7QUFHUEMsWUFBUyxVQUhGO0FBSVBDLFlBQVM7QUFKRjtBQURGLEVBaEJlO0FBd0J0QkMsZUFBYyxDQUNiO0FBQ0NDLE9BQUssdUJBRE47QUFFQ0MsUUFBTSxLQUZQO0FBR0M1QixTQUFPLGlCQUFXO0FBQ2pCNkIsU0FBTSw2Q0FBTjtBQUNBLEdBTEY7QUFNQ0MsU0FBTyxTQU5SO0FBT0NDLGFBQVc7QUFQWixFQURhLEVBVWI7QUFDQ0osT0FBSyx3QkFETjtBQUVDQyxRQUFNLEtBRlA7QUFHQzVCLFNBQU8saUJBQVc7QUFDakI2QixTQUFNLDhDQUFOO0FBQ0EsR0FMRjtBQU1DQyxTQUFPLFNBTlI7QUFPQ0MsYUFBVztBQVBaLEVBVmEsQ0F4QlE7QUE0Q3RCQyxhQUFZLElBNUNVO0FBNkN0QkMsZUFBYyxJQTdDUTtBQThDdEJDLGdCQUFlLHVCQUFTQyxLQUFULEVBQWdCO0FBQzlCLFNBQU9BLE1BQU1DLFNBQU4sS0FBb0IsWUFBM0I7QUFDQSxFQWhEcUI7QUFpRHRCQyxhQUFZO0FBakRVLENBQXZCOztBQW9EQTtBQUNBbEMsUUFBUW1DLGNBQVIsR0FBeUI7QUFDdkJDLHFCQUFvQixDQUFDLENBQUQsRUFBSSxDQUFKLENBREc7QUFFdkJDLFNBQVEsS0FGZTtBQUd2QkMsV0FBVSxFQUhhO0FBSXZCQyxlQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxFQUFQLEVBQVcsRUFBWCxFQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBdUIsRUFBdkIsRUFBMkIsRUFBM0IsRUFBK0IsRUFBL0IsRUFBbUMsRUFBbkMsQ0FKUztBQUt2QkMsVUFBUyxFQUxjO0FBTXZCQyxhQUFZLElBTlc7QUFPdkJDLGlCQUFnQixJQVBPO0FBUXZCQyxtQkFBa0I7QUFSSyxDQUF6Qjs7QUFXQTtBQUNBM0MsUUFBUTRDLGtCQUFSLEdBQTZCO0FBQzNCUixxQkFBb0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURPO0FBRTNCQyxTQUFRLFlBRm1CO0FBRzNCSyxpQkFBZ0IsSUFIVztBQUkzQkMsbUJBQWtCO0FBSlMsQ0FBN0I7O0FBT0E7Ozs7OztBQU1BM0MsUUFBUXpCLElBQVIsR0FBZSxZQUFVOztBQUV4QjtBQUNBd0IsTUFBSzhDLFlBQUw7O0FBRUE7QUFDQTdELFFBQU84RCxPQUFQLEtBQW1COUQsT0FBTzhELE9BQVAsR0FBaUIsS0FBcEM7QUFDQTlELFFBQU8rRCxNQUFQLEtBQWtCL0QsT0FBTytELE1BQVAsR0FBZ0IsS0FBbEM7O0FBRUE7QUFDQS9DLFNBQVFFLGlCQUFSLEdBQTRCaEIsRUFBRSxvQkFBRixFQUF3QjhELEdBQXhCLEdBQThCQyxJQUE5QixFQUE1Qjs7QUFFQTtBQUNBakQsU0FBUUksWUFBUixDQUFxQm1CLFlBQXJCLENBQWtDLENBQWxDLEVBQXFDMkIsSUFBckMsR0FBNEMsRUFBQ0MsSUFBSW5ELFFBQVFFLGlCQUFiLEVBQTVDOztBQUVBO0FBQ0FGLFNBQVFJLFlBQVIsQ0FBcUJtQixZQUFyQixDQUFrQyxDQUFsQyxFQUFxQzJCLElBQXJDLEdBQTRDLEVBQUNDLElBQUluRCxRQUFRRSxpQkFBYixFQUE1Qzs7QUFFQTtBQUNBLEtBQUdoQixFQUFFRixNQUFGLEVBQVVvRSxLQUFWLEtBQW9CLEdBQXZCLEVBQTJCO0FBQzFCcEQsVUFBUUksWUFBUixDQUFxQlksV0FBckIsR0FBbUMsV0FBbkM7QUFDQTs7QUFFRDtBQUNBLEtBQUcsQ0FBQ2hDLE9BQU8rRCxNQUFYLEVBQWtCO0FBQ2pCO0FBQ0EsTUFBRy9ELE9BQU84RCxPQUFWLEVBQWtCOztBQUVqQjtBQUNBNUQsS0FBRSxjQUFGLEVBQWtCbUUsRUFBbEIsQ0FBcUIsZ0JBQXJCLEVBQXVDLFlBQVk7QUFDakRuRSxNQUFFLFFBQUYsRUFBWW9FLEtBQVo7QUFDRCxJQUZEOztBQUlBO0FBQ0FwRSxLQUFFLFFBQUYsRUFBWXFFLElBQVosQ0FBaUIsVUFBakIsRUFBNkIsS0FBN0I7QUFDQXJFLEtBQUUsUUFBRixFQUFZcUUsSUFBWixDQUFpQixVQUFqQixFQUE2QixLQUE3QjtBQUNBckUsS0FBRSxZQUFGLEVBQWdCcUUsSUFBaEIsQ0FBcUIsVUFBckIsRUFBaUMsS0FBakM7QUFDQXJFLEtBQUUsYUFBRixFQUFpQnNFLFdBQWpCLENBQTZCLHFCQUE3QjtBQUNBdEUsS0FBRSxNQUFGLEVBQVVxRSxJQUFWLENBQWUsVUFBZixFQUEyQixLQUEzQjtBQUNBckUsS0FBRSxXQUFGLEVBQWVzRSxXQUFmLENBQTJCLHFCQUEzQjtBQUNBdEUsS0FBRSxlQUFGLEVBQW1CdUUsSUFBbkI7QUFDQXZFLEtBQUUsWUFBRixFQUFnQnVFLElBQWhCOztBQUVBO0FBQ0F2RSxLQUFFLGNBQUYsRUFBa0JtRSxFQUFsQixDQUFxQixpQkFBckIsRUFBd0NLLFNBQXhDOztBQUVBO0FBQ0F4RSxLQUFFLG1CQUFGLEVBQXVCeUUsSUFBdkIsQ0FBNEIsT0FBNUIsRUFBcUNDLFVBQXJDOztBQUVBMUUsS0FBRSxpQkFBRixFQUFxQm1FLEVBQXJCLENBQXdCLGdCQUF4QixFQUEwQyxZQUFZO0FBQ3BEbkUsTUFBRSxTQUFGLEVBQWFvRSxLQUFiO0FBQ0QsSUFGRDs7QUFJQXBFLEtBQUUsaUJBQUYsRUFBcUJtRSxFQUFyQixDQUF3QixpQkFBeEIsRUFBMkMsWUFBVTtBQUNwRG5FLE1BQUUsaUJBQUYsRUFBcUIyRSxJQUFyQjtBQUNBM0UsTUFBRSxrQkFBRixFQUFzQjJFLElBQXRCO0FBQ0EzRSxNQUFFLGlCQUFGLEVBQXFCMkUsSUFBckI7QUFDQTNFLE1BQUUsSUFBRixFQUFRNEUsSUFBUixDQUFhLE1BQWIsRUFBcUIsQ0FBckIsRUFBd0JDLEtBQXhCO0FBQ0c3RSxNQUFFLElBQUYsRUFBUTRFLElBQVIsQ0FBYSxZQUFiLEVBQTJCRSxJQUEzQixDQUFnQyxZQUFVO0FBQzVDOUUsT0FBRSxJQUFGLEVBQVFzRSxXQUFSLENBQW9CLFdBQXBCO0FBQ0EsS0FGRTtBQUdIdEUsTUFBRSxJQUFGLEVBQVE0RSxJQUFSLENBQWEsYUFBYixFQUE0QkUsSUFBNUIsQ0FBaUMsWUFBVTtBQUMxQzlFLE9BQUUsSUFBRixFQUFRK0UsSUFBUixDQUFhLEVBQWI7QUFDQSxLQUZEO0FBR0EsSUFYRDs7QUFhQS9FLEtBQUUsY0FBRixFQUFrQm1FLEVBQWxCLENBQXFCLGlCQUFyQixFQUF3Q2EsYUFBeEM7O0FBRUFoRixLQUFFLGtCQUFGLEVBQXNCbUUsRUFBdEIsQ0FBeUIsaUJBQXpCLEVBQTRDYSxhQUE1Qzs7QUFFQWhGLEtBQUUsa0JBQUYsRUFBc0JtRSxFQUF0QixDQUF5QixpQkFBekIsRUFBNEMsWUFBVTtBQUNyRG5FLE1BQUUsV0FBRixFQUFlaUYsWUFBZixDQUE0QixlQUE1QjtBQUNBLElBRkQ7O0FBSUE7QUFDQWpGLEtBQUUsWUFBRixFQUFnQmtGLFlBQWhCLENBQTZCO0FBQ3pCQyxnQkFBWSxzQkFEYTtBQUV6QkMsa0JBQWM7QUFDYkMsZUFBVTtBQURHLEtBRlc7QUFLekJDLGNBQVUsa0JBQVVDLFVBQVYsRUFBc0I7QUFDNUJ2RixPQUFFLGVBQUYsRUFBbUI4RCxHQUFuQixDQUF1QnlCLFdBQVd2QixJQUFsQztBQUNILEtBUHdCO0FBUXpCd0IscUJBQWlCLHlCQUFTQyxRQUFULEVBQW1CO0FBQ2hDLFlBQU87QUFDSEMsbUJBQWExRixFQUFFMkYsR0FBRixDQUFNRixTQUFTekIsSUFBZixFQUFxQixVQUFTNEIsUUFBVCxFQUFtQjtBQUNqRCxjQUFPLEVBQUVDLE9BQU9ELFNBQVNDLEtBQWxCLEVBQXlCN0IsTUFBTTRCLFNBQVM1QixJQUF4QyxFQUFQO0FBQ0gsT0FGWTtBQURWLE1BQVA7QUFLSDtBQWR3QixJQUE3Qjs7QUFpQkFoRSxLQUFFLG1CQUFGLEVBQXVCOEYsY0FBdkIsQ0FBc0NoRixRQUFRbUMsY0FBOUM7O0FBRUNqRCxLQUFFLGlCQUFGLEVBQXFCOEYsY0FBckIsQ0FBb0NoRixRQUFRbUMsY0FBNUM7O0FBRUE4QyxtQkFBZ0IsUUFBaEIsRUFBMEIsTUFBMUIsRUFBa0MsV0FBbEM7O0FBRUEvRixLQUFFLG9CQUFGLEVBQXdCOEYsY0FBeEIsQ0FBdUNoRixRQUFRbUMsY0FBL0M7O0FBRUFqRCxLQUFFLGtCQUFGLEVBQXNCOEYsY0FBdEIsQ0FBcUNoRixRQUFRbUMsY0FBN0M7O0FBRUE4QyxtQkFBZ0IsU0FBaEIsRUFBMkIsT0FBM0IsRUFBb0MsWUFBcEM7O0FBRUEvRixLQUFFLDBCQUFGLEVBQThCOEYsY0FBOUIsQ0FBNkNoRixRQUFRNEMsa0JBQXJEOztBQUVEO0FBQ0E1QyxXQUFRSSxZQUFSLENBQXFCOEUsV0FBckIsR0FBbUMsVUFBU2xELEtBQVQsRUFBZ0JtRCxPQUFoQixFQUF3QjtBQUMxREEsWUFBUUMsUUFBUixDQUFpQixjQUFqQjtBQUNBLElBRkQ7QUFHQXBGLFdBQVFJLFlBQVIsQ0FBcUJpRixVQUFyQixHQUFrQyxVQUFTckQsS0FBVCxFQUFnQm1ELE9BQWhCLEVBQXlCRyxJQUF6QixFQUE4QjtBQUMvRCxRQUFHdEQsTUFBTVAsSUFBTixJQUFjLEdBQWpCLEVBQXFCO0FBQ3BCdkMsT0FBRSxZQUFGLEVBQWdCOEQsR0FBaEIsQ0FBb0JoQixNQUFNdUQsV0FBMUI7QUFDQXJHLE9BQUUsZUFBRixFQUFtQjhELEdBQW5CLENBQXVCaEIsTUFBTXdELFVBQTdCO0FBQ0FDLHFCQUFnQnpELEtBQWhCO0FBQ0EsS0FKRCxNQUlNLElBQUlBLE1BQU1QLElBQU4sSUFBYyxHQUFsQixFQUFzQjtBQUMzQnpCLGFBQVFDLGVBQVIsR0FBMEI7QUFDekIrQixhQUFPQTtBQURrQixNQUExQjtBQUdBLFNBQUdBLE1BQU0wRCxNQUFOLElBQWdCLEdBQW5CLEVBQXVCO0FBQ3RCQztBQUNBLE1BRkQsTUFFSztBQUNKekcsUUFBRSxpQkFBRixFQUFxQjBHLEtBQXJCLENBQTJCLE1BQTNCO0FBQ0E7QUFDRDtBQUNELElBZkQ7QUFnQkE1RixXQUFRSSxZQUFSLENBQXFCeUYsTUFBckIsR0FBOEIsVUFBU2hGLEtBQVQsRUFBZ0JDLEdBQWhCLEVBQXFCO0FBQ2xEZCxZQUFRQyxlQUFSLEdBQTBCO0FBQ3pCWSxZQUFPQSxLQURrQjtBQUV6QkMsVUFBS0E7QUFGb0IsS0FBMUI7QUFJQTVCLE1BQUUsY0FBRixFQUFrQjhELEdBQWxCLENBQXNCLENBQUMsQ0FBdkI7QUFDQTlELE1BQUUsbUJBQUYsRUFBdUI4RCxHQUF2QixDQUEyQixDQUFDLENBQTVCO0FBQ0E5RCxNQUFFLFlBQUYsRUFBZ0I4RCxHQUFoQixDQUFvQixDQUFDLENBQXJCO0FBQ0E5RCxNQUFFLGdCQUFGLEVBQW9CMEcsS0FBcEIsQ0FBMEIsTUFBMUI7QUFDQSxJQVREOztBQVdBO0FBQ0ExRyxLQUFFLFVBQUYsRUFBYzRHLE1BQWQsQ0FBcUJDLFlBQXJCOztBQUVBN0csS0FBRSxxQkFBRixFQUF5QnlFLElBQXpCLENBQThCLE9BQTlCLEVBQXVDcUMsWUFBdkM7O0FBRUE5RyxLQUFFLHVCQUFGLEVBQTJCeUUsSUFBM0IsQ0FBZ0MsT0FBaEMsRUFBeUNzQyxjQUF6Qzs7QUFFQS9HLEtBQUUsaUJBQUYsRUFBcUJ5RSxJQUFyQixDQUEwQixPQUExQixFQUFtQyxZQUFVO0FBQzVDekUsTUFBRSxpQkFBRixFQUFxQjBHLEtBQXJCLENBQTJCLE1BQTNCO0FBQ0FEO0FBQ0EsSUFIRDs7QUFLQXpHLEtBQUUscUJBQUYsRUFBeUJ5RSxJQUF6QixDQUE4QixPQUE5QixFQUF1QyxZQUFVO0FBQ2hEekUsTUFBRSxpQkFBRixFQUFxQjBHLEtBQXJCLENBQTJCLE1BQTNCO0FBQ0FNO0FBQ0EsSUFIRDs7QUFLQWhILEtBQUUsaUJBQUYsRUFBcUJ5RSxJQUFyQixDQUEwQixPQUExQixFQUFtQyxZQUFVO0FBQzVDekUsTUFBRSxnQkFBRixFQUFvQjBHLEtBQXBCLENBQTBCLE1BQTFCO0FBQ0FPO0FBQ0EsSUFIRDs7QUFLQWpILEtBQUUsbUJBQUYsRUFBdUJ5RSxJQUF2QixDQUE0QixPQUE1QixFQUFxQyxZQUFVO0FBQzlDM0QsWUFBUUMsZUFBUixHQUEwQixFQUExQjtBQUNBa0c7QUFDQSxJQUhEOztBQUtBakgsS0FBRSxpQkFBRixFQUFxQnlFLElBQXJCLENBQTBCLE9BQTFCLEVBQW1DLFlBQVU7QUFDNUN6RSxNQUFFLGdCQUFGLEVBQW9CMEcsS0FBcEIsQ0FBMEIsTUFBMUI7QUFDQVE7QUFDQSxJQUhEOztBQUtBbEgsS0FBRSxvQkFBRixFQUF3QnlFLElBQXhCLENBQTZCLE9BQTdCLEVBQXNDLFlBQVU7QUFDL0MzRCxZQUFRQyxlQUFSLEdBQTBCLEVBQTFCO0FBQ0FtRztBQUNBLElBSEQ7O0FBTUFsSCxLQUFFLGdCQUFGLEVBQW9CbUUsRUFBcEIsQ0FBdUIsT0FBdkIsRUFBZ0NnRCxnQkFBaEM7O0FBRUFuQzs7QUFFRDtBQUNDLEdBMUpELE1BMEpLOztBQUVKO0FBQ0FsRSxXQUFRRyxtQkFBUixHQUE4QmpCLEVBQUUsc0JBQUYsRUFBMEI4RCxHQUExQixHQUFnQ0MsSUFBaEMsRUFBOUI7O0FBRUM7QUFDQWpELFdBQVFJLFlBQVIsQ0FBcUJtQixZQUFyQixDQUFrQyxDQUFsQyxFQUFxQ1UsU0FBckMsR0FBaUQsWUFBakQ7O0FBRUE7QUFDQWpDLFdBQVFJLFlBQVIsQ0FBcUI4RSxXQUFyQixHQUFtQyxVQUFTbEQsS0FBVCxFQUFnQm1ELE9BQWhCLEVBQXdCO0FBQ3pELFFBQUduRCxNQUFNUCxJQUFOLElBQWMsR0FBakIsRUFBcUI7QUFDakIwRCxhQUFRbUIsTUFBUixDQUFlLGdEQUFnRHRFLE1BQU11RSxLQUF0RCxHQUE4RCxRQUE3RTtBQUNIO0FBQ0QsUUFBR3ZFLE1BQU1QLElBQU4sSUFBYyxHQUFqQixFQUFxQjtBQUNwQjBELGFBQVFDLFFBQVIsQ0FBaUIsVUFBakI7QUFDQTtBQUNILElBUEE7O0FBU0E7QUFDRHBGLFdBQVFJLFlBQVIsQ0FBcUJpRixVQUFyQixHQUFrQyxVQUFTckQsS0FBVCxFQUFnQm1ELE9BQWhCLEVBQXlCRyxJQUF6QixFQUE4QjtBQUMvRCxRQUFHdEQsTUFBTVAsSUFBTixJQUFjLEdBQWpCLEVBQXFCO0FBQ3BCLFNBQUdPLE1BQU1uQixLQUFOLENBQVkyRixPQUFaLENBQW9CMUcsUUFBcEIsQ0FBSCxFQUFpQztBQUNoQzJGLHNCQUFnQnpELEtBQWhCO0FBQ0EsTUFGRCxNQUVLO0FBQ0pOLFlBQU0sc0NBQU47QUFDQTtBQUNEO0FBQ0QsSUFSRDs7QUFVQztBQUNEMUIsV0FBUUksWUFBUixDQUFxQnlGLE1BQXJCLEdBQThCWSxhQUE5Qjs7QUFFQTtBQUNBdkgsS0FBRSxjQUFGLEVBQWtCbUUsRUFBbEIsQ0FBcUIsZ0JBQXJCLEVBQXVDLFlBQVk7QUFDakRuRSxNQUFFLE9BQUYsRUFBV29FLEtBQVg7QUFDRCxJQUZEOztBQUlBO0FBQ0FwRSxLQUFFLFFBQUYsRUFBWXFFLElBQVosQ0FBaUIsVUFBakIsRUFBNkIsSUFBN0I7QUFDQXJFLEtBQUUsUUFBRixFQUFZcUUsSUFBWixDQUFpQixVQUFqQixFQUE2QixJQUE3QjtBQUNBckUsS0FBRSxZQUFGLEVBQWdCcUUsSUFBaEIsQ0FBcUIsVUFBckIsRUFBaUMsSUFBakM7QUFDQXJFLEtBQUUsYUFBRixFQUFpQmtHLFFBQWpCLENBQTBCLHFCQUExQjtBQUNBbEcsS0FBRSxNQUFGLEVBQVVxRSxJQUFWLENBQWUsVUFBZixFQUEyQixJQUEzQjtBQUNBckUsS0FBRSxXQUFGLEVBQWVrRyxRQUFmLENBQXdCLHFCQUF4QjtBQUNBbEcsS0FBRSxlQUFGLEVBQW1CMkUsSUFBbkI7QUFDQTNFLEtBQUUsWUFBRixFQUFnQjJFLElBQWhCO0FBQ0EzRSxLQUFFLGVBQUYsRUFBbUI4RCxHQUFuQixDQUF1QixDQUFDLENBQXhCOztBQUVBO0FBQ0E5RCxLQUFFLFFBQUYsRUFBWW1FLEVBQVosQ0FBZSxpQkFBZixFQUFrQ0ssU0FBbEM7QUFDQTs7QUFFRDtBQUNBeEUsSUFBRSxhQUFGLEVBQWlCeUUsSUFBakIsQ0FBc0IsT0FBdEIsRUFBK0IrQyxXQUEvQjtBQUNBeEgsSUFBRSxlQUFGLEVBQW1CeUUsSUFBbkIsQ0FBd0IsT0FBeEIsRUFBaUNnRCxhQUFqQztBQUNBekgsSUFBRSxXQUFGLEVBQWVtRSxFQUFmLENBQWtCLFFBQWxCLEVBQTRCdUQsY0FBNUI7O0FBRUQ7QUFDQyxFQXRORCxNQXNOSztBQUNKO0FBQ0E1RyxVQUFRSSxZQUFSLENBQXFCbUIsWUFBckIsQ0FBa0MsQ0FBbEMsRUFBcUNVLFNBQXJDLEdBQWlELFlBQWpEO0FBQ0VqQyxVQUFRSSxZQUFSLENBQXFCeUIsVUFBckIsR0FBa0MsS0FBbEM7O0FBRUE3QixVQUFRSSxZQUFSLENBQXFCOEUsV0FBckIsR0FBbUMsVUFBU2xELEtBQVQsRUFBZ0JtRCxPQUFoQixFQUF3QjtBQUMxRCxPQUFHbkQsTUFBTVAsSUFBTixJQUFjLEdBQWpCLEVBQXFCO0FBQ2pCMEQsWUFBUW1CLE1BQVIsQ0FBZSxnREFBZ0R0RSxNQUFNdUUsS0FBdEQsR0FBOEQsUUFBN0U7QUFDSDtBQUNELE9BQUd2RSxNQUFNUCxJQUFOLElBQWMsR0FBakIsRUFBcUI7QUFDcEIwRCxZQUFRQyxRQUFSLENBQWlCLFVBQWpCO0FBQ0E7QUFDSCxHQVBDO0FBUUY7O0FBRUQ7QUFDQWxHLEdBQUUsV0FBRixFQUFlaUYsWUFBZixDQUE0Qm5FLFFBQVFJLFlBQXBDO0FBQ0EsQ0EvUEQ7O0FBaVFBOzs7Ozs7QUFNQSxJQUFJeUcsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFTMUIsT0FBVCxFQUFrQlIsUUFBbEIsRUFBMkI7QUFDOUM7QUFDQXpGLEdBQUVpRyxPQUFGLEVBQVdTLEtBQVgsQ0FBaUIsTUFBakI7O0FBRUE7QUFDQTdGLE1BQUsrRyxjQUFMLENBQW9CbkMsU0FBU3pCLElBQTdCLEVBQW1DLFNBQW5DOztBQUVBO0FBQ0FoRSxHQUFFLFdBQUYsRUFBZWlGLFlBQWYsQ0FBNEIsVUFBNUI7QUFDQWpGLEdBQUUsV0FBRixFQUFlaUYsWUFBZixDQUE0QixlQUE1QjtBQUNBakYsR0FBRWlHLFVBQVUsTUFBWixFQUFvQkMsUUFBcEIsQ0FBNkIsV0FBN0I7O0FBRUEsS0FBR3BHLE9BQU84RCxPQUFWLEVBQWtCO0FBQ2pCb0I7QUFDQTtBQUNELENBZkQ7O0FBaUJBOzs7Ozs7OztBQVFBLElBQUk2QyxXQUFXLFNBQVhBLFFBQVcsQ0FBU3ZGLEdBQVQsRUFBYzBCLElBQWQsRUFBb0JpQyxPQUFwQixFQUE2QnBHLE1BQTdCLEVBQW9DO0FBQ2xEO0FBQ0FDLFFBQU9HLEtBQVAsQ0FBYTZILElBQWIsQ0FBa0J4RixHQUFsQixFQUF1QjBCLElBQXZCO0FBQ0U7QUFERixFQUVFK0QsSUFGRixDQUVPLFVBQVN0QyxRQUFULEVBQWtCO0FBQ3ZCa0MsZ0JBQWMxQixPQUFkLEVBQXVCUixRQUF2QjtBQUNBLEVBSkY7QUFLQztBQUxELEVBTUV1QyxLQU5GLENBTVEsVUFBU3JILEtBQVQsRUFBZTtBQUNyQkUsT0FBS29ILFdBQUwsQ0FBaUJwSSxNQUFqQixFQUF5Qm9HLE9BQXpCLEVBQWtDdEYsS0FBbEM7QUFDQSxFQVJGO0FBU0EsQ0FYRDs7QUFhQSxJQUFJdUgsYUFBYSxTQUFiQSxVQUFhLENBQVM1RixHQUFULEVBQWMwQixJQUFkLEVBQW9CaUMsT0FBcEIsRUFBNkJwRyxNQUE3QixFQUFxQ3NJLE9BQXJDLEVBQThDQyxRQUE5QyxFQUF1RDtBQUN2RTtBQUNBRCxhQUFZQSxVQUFVLEtBQXRCO0FBQ0FDLGNBQWFBLFdBQVcsS0FBeEI7O0FBRUE7QUFDQSxLQUFHLENBQUNBLFFBQUosRUFBYTtBQUNaLE1BQUlDLFNBQVNDLFFBQVEsZUFBUixDQUFiO0FBQ0EsRUFGRCxNQUVLO0FBQ0osTUFBSUQsU0FBUyxJQUFiO0FBQ0E7O0FBRUQsS0FBR0EsV0FBVyxJQUFkLEVBQW1COztBQUVsQjtBQUNBckksSUFBRWlHLFVBQVUsTUFBWixFQUFvQjNCLFdBQXBCLENBQWdDLFdBQWhDOztBQUVBO0FBQ0F4RSxTQUFPRyxLQUFQLENBQWE2SCxJQUFiLENBQWtCeEYsR0FBbEIsRUFBdUIwQixJQUF2QixFQUNFK0QsSUFERixDQUNPLFVBQVN0QyxRQUFULEVBQWtCO0FBQ3ZCLE9BQUcwQyxPQUFILEVBQVc7QUFDVjtBQUNBO0FBQ0FuSSxNQUFFaUcsVUFBVSxNQUFaLEVBQW9CQyxRQUFwQixDQUE2QixXQUE3QjtBQUNBbEcsTUFBRWlHLE9BQUYsRUFBV0MsUUFBWCxDQUFvQixRQUFwQjtBQUNBLElBTEQsTUFLSztBQUNKeUIsa0JBQWMxQixPQUFkLEVBQXVCUixRQUF2QjtBQUNBO0FBQ0QsR0FWRixFQVdFdUMsS0FYRixDQVdRLFVBQVNySCxLQUFULEVBQWU7QUFDckJFLFFBQUtvSCxXQUFMLENBQWlCcEksTUFBakIsRUFBeUJvRyxPQUF6QixFQUFrQ3RGLEtBQWxDO0FBQ0EsR0FiRjtBQWNBO0FBQ0QsQ0FqQ0Q7O0FBbUNBOzs7QUFHQSxJQUFJNkcsY0FBYyxTQUFkQSxXQUFjLEdBQVU7O0FBRTNCO0FBQ0F4SCxHQUFFLGtCQUFGLEVBQXNCc0UsV0FBdEIsQ0FBa0MsV0FBbEM7O0FBRUE7QUFDQSxLQUFJTixPQUFPO0FBQ1ZyQyxTQUFPZixPQUFPWixFQUFFLFFBQUYsRUFBWThELEdBQVosRUFBUCxFQUEwQixLQUExQixFQUFpQ1gsTUFBakMsRUFERztBQUVWdkIsT0FBS2hCLE9BQU9aLEVBQUUsTUFBRixFQUFVOEQsR0FBVixFQUFQLEVBQXdCLEtBQXhCLEVBQStCWCxNQUEvQixFQUZLO0FBR1ZrRSxTQUFPckgsRUFBRSxRQUFGLEVBQVk4RCxHQUFaLEVBSEc7QUFJVnlFLFFBQU12SSxFQUFFLE9BQUYsRUFBVzhELEdBQVgsRUFKSTtBQUtWMEUsVUFBUXhJLEVBQUUsU0FBRixFQUFhOEQsR0FBYjtBQUxFLEVBQVg7QUFPQUUsTUFBS0MsRUFBTCxHQUFVbkQsUUFBUUUsaUJBQWxCO0FBQ0EsS0FBR2hCLEVBQUUsWUFBRixFQUFnQjhELEdBQWhCLEtBQXdCLENBQTNCLEVBQTZCO0FBQzVCRSxPQUFLeUUsU0FBTCxHQUFpQnpJLEVBQUUsWUFBRixFQUFnQjhELEdBQWhCLEVBQWpCO0FBQ0E7QUFDRCxLQUFHOUQsRUFBRSxlQUFGLEVBQW1COEQsR0FBbkIsS0FBMkIsQ0FBOUIsRUFBZ0M7QUFDL0JFLE9BQUswRSxTQUFMLEdBQWlCMUksRUFBRSxlQUFGLEVBQW1COEQsR0FBbkIsRUFBakI7QUFDQTtBQUNELEtBQUl4QixNQUFNLHlCQUFWOztBQUVBO0FBQ0F1RixVQUFTdkYsR0FBVCxFQUFjMEIsSUFBZCxFQUFvQixjQUFwQixFQUFvQyxjQUFwQztBQUNBLENBeEJEOztBQTBCQTs7O0FBR0EsSUFBSXlELGdCQUFnQixTQUFoQkEsYUFBZ0IsR0FBVTs7QUFFN0I7QUFDQSxLQUFJekQsT0FBTztBQUNWeUUsYUFBV3pJLEVBQUUsWUFBRixFQUFnQjhELEdBQWhCO0FBREQsRUFBWDtBQUdBLEtBQUl4QixNQUFNLHlCQUFWOztBQUVBNEYsWUFBVzVGLEdBQVgsRUFBZ0IwQixJQUFoQixFQUFzQixjQUF0QixFQUFzQyxnQkFBdEMsRUFBd0QsS0FBeEQ7QUFDQSxDQVREOztBQVdBOzs7OztBQUtBLElBQUl1QyxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQVN6RCxLQUFULEVBQWU7QUFDcEM5QyxHQUFFLFFBQUYsRUFBWThELEdBQVosQ0FBZ0JoQixNQUFNdUUsS0FBdEI7QUFDQXJILEdBQUUsUUFBRixFQUFZOEQsR0FBWixDQUFnQmhCLE1BQU1uQixLQUFOLENBQVl3QixNQUFaLENBQW1CLEtBQW5CLENBQWhCO0FBQ0FuRCxHQUFFLE1BQUYsRUFBVThELEdBQVYsQ0FBY2hCLE1BQU1sQixHQUFOLENBQVV1QixNQUFWLENBQWlCLEtBQWpCLENBQWQ7QUFDQW5ELEdBQUUsT0FBRixFQUFXOEQsR0FBWCxDQUFlaEIsTUFBTXlGLElBQXJCO0FBQ0FJLGlCQUFnQjdGLE1BQU1uQixLQUF0QixFQUE2Qm1CLE1BQU1sQixHQUFuQztBQUNBNUIsR0FBRSxZQUFGLEVBQWdCOEQsR0FBaEIsQ0FBb0JoQixNQUFNbUIsRUFBMUI7QUFDQWpFLEdBQUUsZUFBRixFQUFtQjhELEdBQW5CLENBQXVCaEIsTUFBTXdELFVBQTdCO0FBQ0F0RyxHQUFFLFNBQUYsRUFBYThELEdBQWIsQ0FBaUJoQixNQUFNMEYsTUFBdkI7QUFDQXhJLEdBQUUsZUFBRixFQUFtQnVFLElBQW5CO0FBQ0F2RSxHQUFFLGNBQUYsRUFBa0IwRyxLQUFsQixDQUF3QixNQUF4QjtBQUNBLENBWEQ7O0FBYUE7Ozs7O0FBS0EsSUFBSU8sb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBU2hHLG1CQUFULEVBQTZCOztBQUVwRDtBQUNBLEtBQUdBLHdCQUF3QjJILFNBQTNCLEVBQXFDO0FBQ3BDNUksSUFBRSxRQUFGLEVBQVk4RCxHQUFaLENBQWdCN0MsbUJBQWhCO0FBQ0EsRUFGRCxNQUVLO0FBQ0pqQixJQUFFLFFBQUYsRUFBWThELEdBQVosQ0FBZ0IsRUFBaEI7QUFDQTs7QUFFRDtBQUNBLEtBQUdoRCxRQUFRQyxlQUFSLENBQXdCWSxLQUF4QixLQUFrQ2lILFNBQXJDLEVBQStDO0FBQzlDNUksSUFBRSxRQUFGLEVBQVk4RCxHQUFaLENBQWdCbEQsU0FBU2lJLElBQVQsQ0FBYyxDQUFkLEVBQWlCQyxNQUFqQixDQUF3QixDQUF4QixFQUEyQjNGLE1BQTNCLENBQWtDLEtBQWxDLENBQWhCO0FBQ0EsRUFGRCxNQUVLO0FBQ0puRCxJQUFFLFFBQUYsRUFBWThELEdBQVosQ0FBZ0JoRCxRQUFRQyxlQUFSLENBQXdCWSxLQUF4QixDQUE4QndCLE1BQTlCLENBQXFDLEtBQXJDLENBQWhCO0FBQ0E7O0FBRUQ7QUFDQSxLQUFHckMsUUFBUUMsZUFBUixDQUF3QmEsR0FBeEIsS0FBZ0NnSCxTQUFuQyxFQUE2QztBQUM1QzVJLElBQUUsTUFBRixFQUFVOEQsR0FBVixDQUFjbEQsU0FBU2lJLElBQVQsQ0FBYyxDQUFkLEVBQWlCQyxNQUFqQixDQUF3QixFQUF4QixFQUE0QjNGLE1BQTVCLENBQW1DLEtBQW5DLENBQWQ7QUFDQSxFQUZELE1BRUs7QUFDSm5ELElBQUUsTUFBRixFQUFVOEQsR0FBVixDQUFjaEQsUUFBUUMsZUFBUixDQUF3QmEsR0FBeEIsQ0FBNEJ1QixNQUE1QixDQUFtQyxLQUFuQyxDQUFkO0FBQ0E7O0FBRUQ7QUFDQSxLQUFHckMsUUFBUUMsZUFBUixDQUF3QlksS0FBeEIsS0FBa0NpSCxTQUFyQyxFQUErQztBQUM5Q0Qsa0JBQWdCL0gsU0FBU2lJLElBQVQsQ0FBYyxDQUFkLEVBQWlCQyxNQUFqQixDQUF3QixDQUF4QixDQUFoQixFQUE0Q2xJLFNBQVNpSSxJQUFULENBQWMsQ0FBZCxFQUFpQkMsTUFBakIsQ0FBd0IsRUFBeEIsQ0FBNUM7QUFDQSxFQUZELE1BRUs7QUFDSkgsa0JBQWdCN0gsUUFBUUMsZUFBUixDQUF3QlksS0FBeEMsRUFBK0NiLFFBQVFDLGVBQVIsQ0FBd0JhLEdBQXZFO0FBQ0E7O0FBRUQ7QUFDQTVCLEdBQUUsWUFBRixFQUFnQjhELEdBQWhCLENBQW9CLENBQUMsQ0FBckI7QUFDQTlELEdBQUUsZUFBRixFQUFtQjhELEdBQW5CLENBQXVCLENBQUMsQ0FBeEI7O0FBRUE7QUFDQTlELEdBQUUsZUFBRixFQUFtQjJFLElBQW5COztBQUVBO0FBQ0EzRSxHQUFFLGNBQUYsRUFBa0IwRyxLQUFsQixDQUF3QixNQUF4QjtBQUNBLENBdkNEOztBQXlDQTs7O0FBR0EsSUFBSWxDLFlBQVksU0FBWkEsU0FBWSxHQUFVO0FBQ3hCeEUsR0FBRSxJQUFGLEVBQVE0RSxJQUFSLENBQWEsTUFBYixFQUFxQixDQUFyQixFQUF3QkMsS0FBeEI7QUFDRGhFLE1BQUtrSSxlQUFMO0FBQ0EsQ0FIRDs7QUFLQTs7Ozs7O0FBTUEsSUFBSUosa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFTaEgsS0FBVCxFQUFnQkMsR0FBaEIsRUFBb0I7QUFDekM7QUFDQTVCLEdBQUUsV0FBRixFQUFlZ0osS0FBZjs7QUFFQTtBQUNBaEosR0FBRSxXQUFGLEVBQWVvSCxNQUFmLENBQXNCLHdDQUF0Qjs7QUFFQTtBQUNBLEtBQUd6RixNQUFNa0gsSUFBTixLQUFlLEVBQWYsSUFBc0JsSCxNQUFNa0gsSUFBTixNQUFnQixFQUFoQixJQUFzQmxILE1BQU1zSCxPQUFOLE1BQW1CLEVBQWxFLEVBQXNFO0FBQ3JFakosSUFBRSxXQUFGLEVBQWVvSCxNQUFmLENBQXNCLHdDQUF0QjtBQUNBOztBQUVEO0FBQ0EsS0FBR3pGLE1BQU1rSCxJQUFOLEtBQWUsRUFBZixJQUFzQmxILE1BQU1rSCxJQUFOLE1BQWdCLEVBQWhCLElBQXNCbEgsTUFBTXNILE9BQU4sTUFBbUIsQ0FBbEUsRUFBcUU7QUFDcEVqSixJQUFFLFdBQUYsRUFBZW9ILE1BQWYsQ0FBc0Isd0NBQXRCO0FBQ0E7O0FBRUQ7QUFDQXBILEdBQUUsV0FBRixFQUFlOEQsR0FBZixDQUFtQmxDLElBQUlzSCxJQUFKLENBQVN2SCxLQUFULEVBQWdCLFNBQWhCLENBQW5CO0FBQ0EsQ0FuQkQ7O0FBcUJBOzs7Ozs7O0FBT0EsSUFBSW9FLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBU29ELEtBQVQsRUFBZ0JDLEtBQWhCLEVBQXVCQyxRQUF2QixFQUFnQztBQUNyRDtBQUNBckosR0FBRW1KLFFBQVEsYUFBVixFQUF5QmhGLEVBQXpCLENBQTRCLFdBQTVCLEVBQXlDLFVBQVVtRixDQUFWLEVBQWE7QUFDckQsTUFBSUMsUUFBUTNJLE9BQU9aLEVBQUVvSixLQUFGLEVBQVN0RixHQUFULEVBQVAsRUFBdUIsS0FBdkIsQ0FBWjtBQUNBLE1BQUd3RixFQUFFRSxJQUFGLENBQU9sQyxPQUFQLENBQWVpQyxLQUFmLEtBQXlCRCxFQUFFRSxJQUFGLENBQU9DLE1BQVAsQ0FBY0YsS0FBZCxDQUE1QixFQUFpRDtBQUNoREEsV0FBUUQsRUFBRUUsSUFBRixDQUFPRSxLQUFQLEVBQVI7QUFDQTFKLEtBQUVvSixLQUFGLEVBQVN0RixHQUFULENBQWF5RixNQUFNcEcsTUFBTixDQUFhLEtBQWIsQ0FBYjtBQUNBO0FBQ0QsRUFORDs7QUFRQTtBQUNBbkQsR0FBRW9KLFFBQVEsYUFBVixFQUF5QmpGLEVBQXpCLENBQTRCLFdBQTVCLEVBQXlDLFVBQVVtRixDQUFWLEVBQWE7QUFDckQsTUFBSUssUUFBUS9JLE9BQU9aLEVBQUVtSixLQUFGLEVBQVNyRixHQUFULEVBQVAsRUFBdUIsS0FBdkIsQ0FBWjtBQUNBLE1BQUd3RixFQUFFRSxJQUFGLENBQU9JLFFBQVAsQ0FBZ0JELEtBQWhCLEtBQTBCTCxFQUFFRSxJQUFGLENBQU9DLE1BQVAsQ0FBY0UsS0FBZCxDQUE3QixFQUFrRDtBQUNqREEsV0FBUUwsRUFBRUUsSUFBRixDQUFPRSxLQUFQLEVBQVI7QUFDQTFKLEtBQUVtSixLQUFGLEVBQVNyRixHQUFULENBQWE2RixNQUFNeEcsTUFBTixDQUFhLEtBQWIsQ0FBYjtBQUNBO0FBQ0QsRUFORDtBQU9BLENBbEJEOztBQW9CQTs7O0FBR0EsSUFBSXVFLGlCQUFpQixTQUFqQkEsY0FBaUIsR0FBVTtBQUM5QixLQUFJbUMsVUFBVWpKLE9BQU9aLEVBQUUsUUFBRixFQUFZOEQsR0FBWixFQUFQLEVBQTBCLEtBQTFCLEVBQWlDZ0csR0FBakMsQ0FBcUM5SixFQUFFLElBQUYsRUFBUThELEdBQVIsRUFBckMsRUFBb0QsU0FBcEQsQ0FBZDtBQUNBOUQsR0FBRSxNQUFGLEVBQVU4RCxHQUFWLENBQWMrRixRQUFRMUcsTUFBUixDQUFlLEtBQWYsQ0FBZDtBQUNBLENBSEQ7O0FBS0E7Ozs7OztBQU1BLElBQUlvRSxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQVM1RixLQUFULEVBQWdCQyxHQUFoQixFQUFxQjs7QUFFeEM7QUFDQSxLQUFHQSxJQUFJc0gsSUFBSixDQUFTdkgsS0FBVCxFQUFnQixTQUFoQixJQUE2QixFQUFoQyxFQUFtQzs7QUFFbEM7QUFDQWEsUUFBTSx5Q0FBTjtBQUNBeEMsSUFBRSxXQUFGLEVBQWVpRixZQUFmLENBQTRCLFVBQTVCO0FBQ0EsRUFMRCxNQUtLOztBQUVKO0FBQ0FuRSxVQUFRQyxlQUFSLEdBQTBCO0FBQ3pCWSxVQUFPQSxLQURrQjtBQUV6QkMsUUFBS0E7QUFGb0IsR0FBMUI7QUFJQTVCLElBQUUsWUFBRixFQUFnQjhELEdBQWhCLENBQW9CLENBQUMsQ0FBckI7QUFDQW1ELG9CQUFrQm5HLFFBQVFHLG1CQUExQjtBQUNBO0FBQ0QsQ0FsQkQ7O0FBb0JBOzs7QUFHQSxJQUFJK0QsZ0JBQWdCLFNBQWhCQSxhQUFnQixHQUFVOztBQUU3QjtBQUNBbEYsUUFBT0csS0FBUCxDQUFhOEosR0FBYixDQUFpQixxQkFBakIsRUFDRWhDLElBREYsQ0FDTyxVQUFTdEMsUUFBVCxFQUFrQjs7QUFFdkI7QUFDQXpGLElBQUVNLFFBQUYsRUFBWTBKLEdBQVosQ0FBZ0IsT0FBaEIsRUFBeUIsaUJBQXpCLEVBQTRDQyxjQUE1QztBQUNBakssSUFBRU0sUUFBRixFQUFZMEosR0FBWixDQUFnQixPQUFoQixFQUF5QixlQUF6QixFQUEwQ0UsWUFBMUM7QUFDQWxLLElBQUVNLFFBQUYsRUFBWTBKLEdBQVosQ0FBZ0IsT0FBaEIsRUFBeUIsa0JBQXpCLEVBQTZDRyxlQUE3Qzs7QUFFQTtBQUNBLE1BQUcxRSxTQUFTK0MsTUFBVCxJQUFtQixHQUF0QixFQUEwQjs7QUFFekI7QUFDQXhJLEtBQUUsMEJBQUYsRUFBOEJnSixLQUE5QjtBQUNBaEosS0FBRThFLElBQUYsQ0FBT1csU0FBU3pCLElBQWhCLEVBQXNCLFVBQVMvRSxLQUFULEVBQWdCNEcsS0FBaEIsRUFBc0I7QUFDM0M3RixNQUFFLFFBQUYsRUFBWTtBQUNYLFdBQU8sWUFBVTZGLE1BQU01QixFQURaO0FBRVgsY0FBUyxrQkFGRTtBQUdYLGFBQVMsNkZBQTJGNEIsTUFBTTVCLEVBQWpHLEdBQW9HLGtCQUFwRyxHQUNOLHNGQURNLEdBQ2lGNEIsTUFBTTVCLEVBRHZGLEdBQzBGLGlCQUQxRixHQUVOLG1GQUZNLEdBRThFNEIsTUFBTTVCLEVBRnBGLEdBRXVGLHdCQUZ2RixHQUdOLG1CQUhNLEdBR2M0QixNQUFNNUIsRUFIcEIsR0FHdUIsMEVBSHZCLEdBSUwsS0FKSyxHQUlDNEIsTUFBTXdCLEtBSlAsR0FJYSxRQUpiLEdBSXNCeEIsTUFBTWxFLEtBSjVCLEdBSWtDO0FBUGhDLEtBQVosRUFRSXlJLFFBUkosQ0FRYSwwQkFSYjtBQVNBLElBVkQ7O0FBWUE7QUFDQXBLLEtBQUVNLFFBQUYsRUFBWTZELEVBQVosQ0FBZSxPQUFmLEVBQXdCLGlCQUF4QixFQUEyQzhGLGNBQTNDO0FBQ0FqSyxLQUFFTSxRQUFGLEVBQVk2RCxFQUFaLENBQWUsT0FBZixFQUF3QixlQUF4QixFQUF5QytGLFlBQXpDO0FBQ0FsSyxLQUFFTSxRQUFGLEVBQVk2RCxFQUFaLENBQWUsT0FBZixFQUF3QixrQkFBeEIsRUFBNENnRyxlQUE1Qzs7QUFFQTtBQUNBbkssS0FBRSxzQkFBRixFQUEwQnNFLFdBQTFCLENBQXNDLFFBQXRDOztBQUVBO0FBQ0EsR0F6QkQsTUF5Qk0sSUFBR21CLFNBQVMrQyxNQUFULElBQW1CLEdBQXRCLEVBQTBCOztBQUUvQjtBQUNBeEksS0FBRSxzQkFBRixFQUEwQmtHLFFBQTFCLENBQW1DLFFBQW5DO0FBQ0E7QUFDRCxFQXZDRixFQXdDRThCLEtBeENGLENBd0NRLFVBQVNySCxLQUFULEVBQWU7QUFDckI2QixRQUFNLDhDQUE4QzdCLE1BQU04RSxRQUFOLENBQWV6QixJQUFuRTtBQUNBLEVBMUNGOztBQTRDQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUNELENBaEZEOztBQWtGQTs7O0FBR0EsSUFBSThDLGVBQWUsU0FBZkEsWUFBZSxHQUFVOztBQUU1QjtBQUNBOUcsR0FBRSxxQkFBRixFQUF5QnNFLFdBQXpCLENBQXFDLFdBQXJDOztBQUVBO0FBQ0EsS0FBSU4sT0FBTztBQUNWcUcsVUFBUXpKLE9BQU9aLEVBQUUsU0FBRixFQUFhOEQsR0FBYixFQUFQLEVBQTJCLEtBQTNCLEVBQWtDWCxNQUFsQyxFQURFO0FBRVZtSCxRQUFNMUosT0FBT1osRUFBRSxPQUFGLEVBQVc4RCxHQUFYLEVBQVAsRUFBeUIsS0FBekIsRUFBZ0NYLE1BQWhDLEVBRkk7QUFHVm9ILFVBQVF2SyxFQUFFLFNBQUYsRUFBYThELEdBQWI7QUFIRSxFQUFYO0FBS0EsS0FBSXhCLEdBQUo7QUFDQSxLQUFHdEMsRUFBRSxtQkFBRixFQUF1QjhELEdBQXZCLEtBQStCLENBQWxDLEVBQW9DO0FBQ25DeEIsUUFBTSwrQkFBTjtBQUNBMEIsT0FBS3dHLGdCQUFMLEdBQXdCeEssRUFBRSxtQkFBRixFQUF1QjhELEdBQXZCLEVBQXhCO0FBQ0EsRUFIRCxNQUdLO0FBQ0p4QixRQUFNLDBCQUFOO0FBQ0EsTUFBR3RDLEVBQUUsY0FBRixFQUFrQjhELEdBQWxCLEtBQTBCLENBQTdCLEVBQStCO0FBQzlCRSxRQUFLeUcsV0FBTCxHQUFtQnpLLEVBQUUsY0FBRixFQUFrQjhELEdBQWxCLEVBQW5CO0FBQ0E7QUFDREUsT0FBSzBHLE9BQUwsR0FBZTFLLEVBQUUsVUFBRixFQUFjOEQsR0FBZCxFQUFmO0FBQ0EsTUFBRzlELEVBQUUsVUFBRixFQUFjOEQsR0FBZCxNQUF1QixDQUExQixFQUE0QjtBQUMzQkUsUUFBSzJHLFlBQUwsR0FBbUIzSyxFQUFFLGVBQUYsRUFBbUI4RCxHQUFuQixFQUFuQjtBQUNBRSxRQUFLNEcsWUFBTCxHQUFvQmhLLE9BQU9aLEVBQUUsZUFBRixFQUFtQjhELEdBQW5CLEVBQVAsRUFBaUMsWUFBakMsRUFBK0NYLE1BQS9DLEVBQXBCO0FBQ0E7QUFDRCxNQUFHbkQsRUFBRSxVQUFGLEVBQWM4RCxHQUFkLE1BQXVCLENBQTFCLEVBQTRCO0FBQzNCRSxRQUFLMkcsWUFBTCxHQUFvQjNLLEVBQUUsZ0JBQUYsRUFBb0I4RCxHQUFwQixFQUFwQjtBQUNBRSxRQUFLNkcsZ0JBQUwsR0FBd0I3SyxFQUFFLG1CQUFGLEVBQXVCcUUsSUFBdkIsQ0FBNEIsU0FBNUIsQ0FBeEI7QUFDQUwsUUFBSzhHLGdCQUFMLEdBQXdCOUssRUFBRSxtQkFBRixFQUF1QnFFLElBQXZCLENBQTRCLFNBQTVCLENBQXhCO0FBQ0FMLFFBQUsrRyxnQkFBTCxHQUF3Qi9LLEVBQUUsbUJBQUYsRUFBdUJxRSxJQUF2QixDQUE0QixTQUE1QixDQUF4QjtBQUNBTCxRQUFLZ0gsZ0JBQUwsR0FBd0JoTCxFQUFFLG1CQUFGLEVBQXVCcUUsSUFBdkIsQ0FBNEIsU0FBNUIsQ0FBeEI7QUFDQUwsUUFBS2lILGdCQUFMLEdBQXdCakwsRUFBRSxtQkFBRixFQUF1QnFFLElBQXZCLENBQTRCLFNBQTVCLENBQXhCO0FBQ0FMLFFBQUs0RyxZQUFMLEdBQW9CaEssT0FBT1osRUFBRSxlQUFGLEVBQW1COEQsR0FBbkIsRUFBUCxFQUFpQyxZQUFqQyxFQUErQ1gsTUFBL0MsRUFBcEI7QUFDQTtBQUNEOztBQUVEO0FBQ0EwRSxVQUFTdkYsR0FBVCxFQUFjMEIsSUFBZCxFQUFvQixpQkFBcEIsRUFBdUMsZUFBdkM7QUFDQSxDQXRDRDs7QUF3Q0E7OztBQUdBLElBQUkrQyxpQkFBaUIsU0FBakJBLGNBQWlCLEdBQVU7O0FBRTlCO0FBQ0EsS0FBSXpFLEdBQUosRUFBUzBCLElBQVQ7QUFDQSxLQUFHaEUsRUFBRSxtQkFBRixFQUF1QjhELEdBQXZCLEtBQStCLENBQWxDLEVBQW9DO0FBQ25DeEIsUUFBTSwrQkFBTjtBQUNBMEIsU0FBTyxFQUFFd0csa0JBQWtCeEssRUFBRSxtQkFBRixFQUF1QjhELEdBQXZCLEVBQXBCLEVBQVA7QUFDQSxFQUhELE1BR0s7QUFDSnhCLFFBQU0sMEJBQU47QUFDQTBCLFNBQU8sRUFBRXlHLGFBQWF6SyxFQUFFLGNBQUYsRUFBa0I4RCxHQUFsQixFQUFmLEVBQVA7QUFDQTs7QUFFRDtBQUNBb0UsWUFBVzVGLEdBQVgsRUFBZ0IwQixJQUFoQixFQUFzQixpQkFBdEIsRUFBeUMsaUJBQXpDLEVBQTRELEtBQTVEO0FBQ0EsQ0FkRDs7QUFnQkE7OztBQUdBLElBQUk2QyxlQUFlLFNBQWZBLFlBQWUsR0FBVTtBQUM1QixLQUFHN0csRUFBRSxJQUFGLEVBQVE4RCxHQUFSLE1BQWlCLENBQXBCLEVBQXNCO0FBQ3JCOUQsSUFBRSxpQkFBRixFQUFxQjJFLElBQXJCO0FBQ0EzRSxJQUFFLGtCQUFGLEVBQXNCMkUsSUFBdEI7QUFDQTNFLElBQUUsaUJBQUYsRUFBcUIyRSxJQUFyQjtBQUNBLEVBSkQsTUFJTSxJQUFHM0UsRUFBRSxJQUFGLEVBQVE4RCxHQUFSLE1BQWlCLENBQXBCLEVBQXNCO0FBQzNCOUQsSUFBRSxpQkFBRixFQUFxQnVFLElBQXJCO0FBQ0F2RSxJQUFFLGtCQUFGLEVBQXNCMkUsSUFBdEI7QUFDQTNFLElBQUUsaUJBQUYsRUFBcUJ1RSxJQUFyQjtBQUNBLEVBSkssTUFJQSxJQUFHdkUsRUFBRSxJQUFGLEVBQVE4RCxHQUFSLE1BQWlCLENBQXBCLEVBQXNCO0FBQzNCOUQsSUFBRSxpQkFBRixFQUFxQjJFLElBQXJCO0FBQ0EzRSxJQUFFLGtCQUFGLEVBQXNCdUUsSUFBdEI7QUFDQXZFLElBQUUsaUJBQUYsRUFBcUJ1RSxJQUFyQjtBQUNBO0FBQ0QsQ0FkRDs7QUFnQkE7OztBQUdBLElBQUk0QyxtQkFBbUIsU0FBbkJBLGdCQUFtQixHQUFVO0FBQ2hDbkgsR0FBRSxrQkFBRixFQUFzQjBHLEtBQXRCLENBQTRCLE1BQTVCO0FBQ0EsQ0FGRDs7QUFJQTs7O0FBR0EsSUFBSXVELGlCQUFpQixTQUFqQkEsY0FBaUIsR0FBVTs7QUFFOUI7QUFDQSxLQUFJaEcsS0FBS2pFLEVBQUUsSUFBRixFQUFRZ0UsSUFBUixDQUFhLElBQWIsQ0FBVDtBQUNBLEtBQUlBLE9BQU87QUFDVnlFLGFBQVd4RTtBQURELEVBQVg7QUFHQSxLQUFJM0IsTUFBTSx5QkFBVjs7QUFFQTtBQUNBNEYsWUFBVzVGLEdBQVgsRUFBZ0IwQixJQUFoQixFQUFzQixhQUFhQyxFQUFuQyxFQUF1QyxnQkFBdkMsRUFBeUQsSUFBekQ7QUFFQSxDQVpEOztBQWNBOzs7QUFHQSxJQUFJaUcsZUFBZSxTQUFmQSxZQUFlLEdBQVU7O0FBRTVCO0FBQ0EsS0FBSWpHLEtBQUtqRSxFQUFFLElBQUYsRUFBUWdFLElBQVIsQ0FBYSxJQUFiLENBQVQ7QUFDQSxLQUFJQSxPQUFPO0FBQ1Z5RSxhQUFXeEU7QUFERCxFQUFYO0FBR0EsS0FBSTNCLE1BQU0sbUJBQVY7O0FBRUE7QUFDQXRDLEdBQUUsYUFBWWlFLEVBQVosR0FBaUIsTUFBbkIsRUFBMkJLLFdBQTNCLENBQXVDLFdBQXZDOztBQUVBO0FBQ0F4RSxRQUFPRyxLQUFQLENBQWE4SixHQUFiLENBQWlCekgsR0FBakIsRUFBc0I7QUFDcEI0SSxVQUFRbEg7QUFEWSxFQUF0QixFQUdFK0QsSUFIRixDQUdPLFVBQVN0QyxRQUFULEVBQWtCO0FBQ3ZCekYsSUFBRSxhQUFZaUUsRUFBWixHQUFpQixNQUFuQixFQUEyQmlDLFFBQTNCLENBQW9DLFdBQXBDO0FBQ0FsRyxJQUFFLGtCQUFGLEVBQXNCMEcsS0FBdEIsQ0FBNEIsTUFBNUI7QUFDQTVELFVBQVEyQyxTQUFTekIsSUFBakI7QUFDQWxCLFFBQU1uQixLQUFOLEdBQWNmLE9BQU9rQyxNQUFNbkIsS0FBYixDQUFkO0FBQ0FtQixRQUFNbEIsR0FBTixHQUFZaEIsT0FBT2tDLE1BQU1sQixHQUFiLENBQVo7QUFDQTJFLGtCQUFnQnpELEtBQWhCO0FBQ0EsRUFWRixFQVVJa0YsS0FWSixDQVVVLFVBQVNySCxLQUFULEVBQWU7QUFDdkJFLE9BQUtvSCxXQUFMLENBQWlCLGtCQUFqQixFQUFxQyxhQUFhaEUsRUFBbEQsRUFBc0R0RCxLQUF0RDtBQUNBLEVBWkY7QUFhQSxDQTFCRDs7QUE0QkE7OztBQUdBLElBQUl3SixrQkFBa0IsU0FBbEJBLGVBQWtCLEdBQVU7O0FBRS9CO0FBQ0EsS0FBSWxHLEtBQUtqRSxFQUFFLElBQUYsRUFBUWdFLElBQVIsQ0FBYSxJQUFiLENBQVQ7QUFDQSxLQUFJQSxPQUFPO0FBQ1Z5RSxhQUFXeEU7QUFERCxFQUFYO0FBR0EsS0FBSTNCLE1BQU0sMkJBQVY7O0FBRUE0RixZQUFXNUYsR0FBWCxFQUFnQjBCLElBQWhCLEVBQXNCLGFBQWFDLEVBQW5DLEVBQXVDLGlCQUF2QyxFQUEwRCxJQUExRCxFQUFnRSxJQUFoRTtBQUNBLENBVkQ7O0FBWUE7OztBQUdBLElBQUlpRCxxQkFBcUIsU0FBckJBLGtCQUFxQixHQUFVO0FBQ2xDbEgsR0FBRSxTQUFGLEVBQWE4RCxHQUFiLENBQWlCLEVBQWpCO0FBQ0EsS0FBR2hELFFBQVFDLGVBQVIsQ0FBd0JZLEtBQXhCLEtBQWtDaUgsU0FBckMsRUFBK0M7QUFDOUM1SSxJQUFFLFNBQUYsRUFBYThELEdBQWIsQ0FBaUJsRCxTQUFTaUksSUFBVCxDQUFjLENBQWQsRUFBaUJDLE1BQWpCLENBQXdCLENBQXhCLEVBQTJCM0YsTUFBM0IsQ0FBa0MsS0FBbEMsQ0FBakI7QUFDQSxFQUZELE1BRUs7QUFDSm5ELElBQUUsU0FBRixFQUFhOEQsR0FBYixDQUFpQmhELFFBQVFDLGVBQVIsQ0FBd0JZLEtBQXhCLENBQThCd0IsTUFBOUIsQ0FBcUMsS0FBckMsQ0FBakI7QUFDQTtBQUNELEtBQUdyQyxRQUFRQyxlQUFSLENBQXdCYSxHQUF4QixLQUFnQ2dILFNBQW5DLEVBQTZDO0FBQzVDNUksSUFBRSxPQUFGLEVBQVc4RCxHQUFYLENBQWVsRCxTQUFTaUksSUFBVCxDQUFjLENBQWQsRUFBaUJDLE1BQWpCLENBQXdCLENBQXhCLEVBQTJCM0YsTUFBM0IsQ0FBa0MsS0FBbEMsQ0FBZjtBQUNBLEVBRkQsTUFFSztBQUNKbkQsSUFBRSxPQUFGLEVBQVc4RCxHQUFYLENBQWVoRCxRQUFRQyxlQUFSLENBQXdCYSxHQUF4QixDQUE0QnVCLE1BQTVCLENBQW1DLEtBQW5DLENBQWY7QUFDQTtBQUNEbkQsR0FBRSxjQUFGLEVBQWtCOEQsR0FBbEIsQ0FBc0IsQ0FBQyxDQUF2QjtBQUNBOUQsR0FBRSxZQUFGLEVBQWdCdUUsSUFBaEI7QUFDQXZFLEdBQUUsVUFBRixFQUFjOEQsR0FBZCxDQUFrQixDQUFsQjtBQUNBOUQsR0FBRSxVQUFGLEVBQWNtTCxPQUFkLENBQXNCLFFBQXRCO0FBQ0FuTCxHQUFFLHVCQUFGLEVBQTJCMkUsSUFBM0I7QUFDQTNFLEdBQUUsaUJBQUYsRUFBcUIwRyxLQUFyQixDQUEyQixNQUEzQjtBQUNBLENBbEJEOztBQW9CQTs7O0FBR0EsSUFBSU0scUJBQXFCLFNBQXJCQSxrQkFBcUIsR0FBVTtBQUNsQztBQUNBaEgsR0FBRSxpQkFBRixFQUFxQjBHLEtBQXJCLENBQTJCLE1BQTNCOztBQUVBO0FBQ0ExRyxHQUFFLFNBQUYsRUFBYThELEdBQWIsQ0FBaUJoRCxRQUFRQyxlQUFSLENBQXdCK0IsS0FBeEIsQ0FBOEJ1RSxLQUEvQztBQUNBckgsR0FBRSxTQUFGLEVBQWE4RCxHQUFiLENBQWlCaEQsUUFBUUMsZUFBUixDQUF3QitCLEtBQXhCLENBQThCbkIsS0FBOUIsQ0FBb0N3QixNQUFwQyxDQUEyQyxLQUEzQyxDQUFqQjtBQUNBbkQsR0FBRSxPQUFGLEVBQVc4RCxHQUFYLENBQWVoRCxRQUFRQyxlQUFSLENBQXdCK0IsS0FBeEIsQ0FBOEJsQixHQUE5QixDQUFrQ3VCLE1BQWxDLENBQXlDLEtBQXpDLENBQWY7QUFDQW5ELEdBQUUsWUFBRixFQUFnQjJFLElBQWhCO0FBQ0EzRSxHQUFFLGlCQUFGLEVBQXFCMkUsSUFBckI7QUFDQTNFLEdBQUUsa0JBQUYsRUFBc0IyRSxJQUF0QjtBQUNBM0UsR0FBRSxpQkFBRixFQUFxQjJFLElBQXJCO0FBQ0EzRSxHQUFFLGNBQUYsRUFBa0I4RCxHQUFsQixDQUFzQmhELFFBQVFDLGVBQVIsQ0FBd0IrQixLQUF4QixDQUE4QnNJLFdBQXBEO0FBQ0FwTCxHQUFFLG1CQUFGLEVBQXVCOEQsR0FBdkIsQ0FBMkJoRCxRQUFRQyxlQUFSLENBQXdCK0IsS0FBeEIsQ0FBOEJtQixFQUF6RDtBQUNBakUsR0FBRSx1QkFBRixFQUEyQnVFLElBQTNCOztBQUVBO0FBQ0F2RSxHQUFFLGlCQUFGLEVBQXFCMEcsS0FBckIsQ0FBMkIsTUFBM0I7QUFDQSxDQWxCRDs7QUFvQkE7OztBQUdBLElBQUlELGlCQUFpQixTQUFqQkEsY0FBaUIsR0FBVTtBQUM5QjtBQUNDekcsR0FBRSxpQkFBRixFQUFxQjBHLEtBQXJCLENBQTJCLE1BQTNCOztBQUVEO0FBQ0EsS0FBSTFDLE9BQU87QUFDVkMsTUFBSW5ELFFBQVFDLGVBQVIsQ0FBd0IrQixLQUF4QixDQUE4QnNJO0FBRHhCLEVBQVg7QUFHQSxLQUFJOUksTUFBTSxvQkFBVjs7QUFFQXhDLFFBQU9HLEtBQVAsQ0FBYThKLEdBQWIsQ0FBaUJ6SCxHQUFqQixFQUFzQjtBQUNwQjRJLFVBQVFsSDtBQURZLEVBQXRCLEVBR0UrRCxJQUhGLENBR08sVUFBU3RDLFFBQVQsRUFBa0I7QUFDdkJ6RixJQUFFLFNBQUYsRUFBYThELEdBQWIsQ0FBaUIyQixTQUFTekIsSUFBVCxDQUFjcUQsS0FBL0I7QUFDQ3JILElBQUUsU0FBRixFQUFhOEQsR0FBYixDQUFpQmxELE9BQU82RSxTQUFTekIsSUFBVCxDQUFjckMsS0FBckIsRUFBNEIscUJBQTVCLEVBQW1Ed0IsTUFBbkQsQ0FBMEQsS0FBMUQsQ0FBakI7QUFDQW5ELElBQUUsT0FBRixFQUFXOEQsR0FBWCxDQUFlbEQsT0FBTzZFLFNBQVN6QixJQUFULENBQWNwQyxHQUFyQixFQUEwQixxQkFBMUIsRUFBaUR1QixNQUFqRCxDQUF3RCxLQUF4RCxDQUFmO0FBQ0FuRCxJQUFFLGNBQUYsRUFBa0I4RCxHQUFsQixDQUFzQjJCLFNBQVN6QixJQUFULENBQWNDLEVBQXBDO0FBQ0FqRSxJQUFFLG1CQUFGLEVBQXVCOEQsR0FBdkIsQ0FBMkIsQ0FBQyxDQUE1QjtBQUNBOUQsSUFBRSxZQUFGLEVBQWdCdUUsSUFBaEI7QUFDQXZFLElBQUUsVUFBRixFQUFjOEQsR0FBZCxDQUFrQjJCLFNBQVN6QixJQUFULENBQWNxSCxXQUFoQztBQUNBckwsSUFBRSxVQUFGLEVBQWNtTCxPQUFkLENBQXNCLFFBQXRCO0FBQ0EsTUFBRzFGLFNBQVN6QixJQUFULENBQWNxSCxXQUFkLElBQTZCLENBQWhDLEVBQWtDO0FBQ2pDckwsS0FBRSxlQUFGLEVBQW1COEQsR0FBbkIsQ0FBdUIyQixTQUFTekIsSUFBVCxDQUFjc0gsWUFBckM7QUFDQXRMLEtBQUUsZUFBRixFQUFtQjhELEdBQW5CLENBQXVCbEQsT0FBTzZFLFNBQVN6QixJQUFULENBQWN1SCxZQUFyQixFQUFtQyxxQkFBbkMsRUFBMERwSSxNQUExRCxDQUFpRSxZQUFqRSxDQUF2QjtBQUNBLEdBSEQsTUFHTSxJQUFJc0MsU0FBU3pCLElBQVQsQ0FBY3FILFdBQWQsSUFBNkIsQ0FBakMsRUFBbUM7QUFDeENyTCxLQUFFLGdCQUFGLEVBQW9COEQsR0FBcEIsQ0FBd0IyQixTQUFTekIsSUFBVCxDQUFjc0gsWUFBdEM7QUFDRCxPQUFJRSxnQkFBZ0JDLE9BQU9oRyxTQUFTekIsSUFBVCxDQUFjd0gsYUFBckIsQ0FBcEI7QUFDQ3hMLEtBQUUsbUJBQUYsRUFBdUJxRSxJQUF2QixDQUE0QixTQUE1QixFQUF3Q21ILGNBQWNFLE9BQWQsQ0FBc0IsR0FBdEIsS0FBOEIsQ0FBdEU7QUFDQTFMLEtBQUUsbUJBQUYsRUFBdUJxRSxJQUF2QixDQUE0QixTQUE1QixFQUF3Q21ILGNBQWNFLE9BQWQsQ0FBc0IsR0FBdEIsS0FBOEIsQ0FBdEU7QUFDQTFMLEtBQUUsbUJBQUYsRUFBdUJxRSxJQUF2QixDQUE0QixTQUE1QixFQUF3Q21ILGNBQWNFLE9BQWQsQ0FBc0IsR0FBdEIsS0FBOEIsQ0FBdEU7QUFDQTFMLEtBQUUsbUJBQUYsRUFBdUJxRSxJQUF2QixDQUE0QixTQUE1QixFQUF3Q21ILGNBQWNFLE9BQWQsQ0FBc0IsR0FBdEIsS0FBOEIsQ0FBdEU7QUFDQTFMLEtBQUUsbUJBQUYsRUFBdUJxRSxJQUF2QixDQUE0QixTQUE1QixFQUF3Q21ILGNBQWNFLE9BQWQsQ0FBc0IsR0FBdEIsS0FBOEIsQ0FBdEU7QUFDQTFMLEtBQUUsZUFBRixFQUFtQjhELEdBQW5CLENBQXVCbEQsT0FBTzZFLFNBQVN6QixJQUFULENBQWN1SCxZQUFyQixFQUFtQyxxQkFBbkMsRUFBMERwSSxNQUExRCxDQUFpRSxZQUFqRSxDQUF2QjtBQUNBO0FBQ0RuRCxJQUFFLHVCQUFGLEVBQTJCdUUsSUFBM0I7QUFDQXZFLElBQUUsaUJBQUYsRUFBcUIwRyxLQUFyQixDQUEyQixNQUEzQjtBQUNELEVBM0JGLEVBNEJFc0IsS0E1QkYsQ0E0QlEsVUFBU3JILEtBQVQsRUFBZTtBQUNyQkUsT0FBS29ILFdBQUwsQ0FBaUIsMEJBQWpCLEVBQTZDLEVBQTdDLEVBQWlEdEgsS0FBakQ7QUFDQSxFQTlCRjtBQStCQSxDQXpDRDs7QUEyQ0E7OztBQUdBLElBQUkrRCxhQUFhLFNBQWJBLFVBQWEsR0FBVTtBQUMxQjtBQUNBLEtBQUlpSCxNQUFNQyxPQUFPLHlCQUFQLENBQVY7O0FBRUE7QUFDQSxLQUFJNUgsT0FBTztBQUNWMkgsT0FBS0E7QUFESyxFQUFYO0FBR0EsS0FBSXJKLE1BQU0scUJBQVY7O0FBRUE7QUFDQXhDLFFBQU9HLEtBQVAsQ0FBYTZILElBQWIsQ0FBa0J4RixHQUFsQixFQUF1QjBCLElBQXZCLEVBQ0UrRCxJQURGLENBQ08sVUFBU3RDLFFBQVQsRUFBa0I7QUFDdkJqRCxRQUFNaUQsU0FBU3pCLElBQWY7QUFDQSxFQUhGLEVBSUVnRSxLQUpGLENBSVEsVUFBU3JILEtBQVQsRUFBZTtBQUNyQixNQUFHQSxNQUFNOEUsUUFBVCxFQUFrQjtBQUNqQjtBQUNBLE9BQUc5RSxNQUFNOEUsUUFBTixDQUFlK0MsTUFBZixJQUF5QixHQUE1QixFQUFnQztBQUMvQmhHLFVBQU0sNEJBQTRCN0IsTUFBTThFLFFBQU4sQ0FBZXpCLElBQWYsQ0FBb0IsS0FBcEIsQ0FBbEM7QUFDQSxJQUZELE1BRUs7QUFDSnhCLFVBQU0sNEJBQTRCN0IsTUFBTThFLFFBQU4sQ0FBZXpCLElBQWpEO0FBQ0E7QUFDRDtBQUNELEVBYkY7QUFjQSxDQXpCRCxDOzs7Ozs7OztBQ3I4QkE7Ozs7QUFJQWxELFFBQVF6QixJQUFSLEdBQWUsWUFBVTs7QUFFdkI7QUFDQVAsRUFBQSxtQkFBQUEsQ0FBUSxDQUFSO0FBQ0FBLEVBQUEsbUJBQUFBLENBQVEsR0FBUjtBQUNBQSxFQUFBLG1CQUFBQSxDQUFRLEdBQVI7QUFDQStCLFNBQU8sbUJBQUEvQixDQUFRLENBQVIsQ0FBUDs7QUFFQTtBQUNBK0IsT0FBSzhDLFlBQUw7O0FBRUE7QUFDQTNELElBQUUsZ0JBQUYsRUFBb0I4RSxJQUFwQixDQUF5QixZQUFVO0FBQ2pDOUUsTUFBRSxJQUFGLEVBQVE2TCxLQUFSLENBQWMsVUFBU3ZDLENBQVQsRUFBVztBQUN2QkEsUUFBRXdDLGVBQUY7QUFDQXhDLFFBQUV5QyxjQUFGOztBQUVBO0FBQ0EsVUFBSTlILEtBQUtqRSxFQUFFLElBQUYsRUFBUWdFLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQWhFLFFBQUUscUJBQXFCaUUsRUFBdkIsRUFBMkJpQyxRQUEzQixDQUFvQyxRQUFwQztBQUNBbEcsUUFBRSxtQkFBbUJpRSxFQUFyQixFQUF5QkssV0FBekIsQ0FBcUMsUUFBckM7QUFDQXRFLFFBQUUsZUFBZWlFLEVBQWpCLEVBQXFCK0gsVUFBckIsQ0FBZ0M7QUFDOUI1SCxlQUFPLElBRHVCO0FBRTlCNkgsaUJBQVM7QUFDUDtBQUNBLFNBQUMsT0FBRCxFQUFVLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsUUFBbEIsRUFBNEIsV0FBNUIsRUFBeUMsT0FBekMsQ0FBVixDQUZPLEVBR1AsQ0FBQyxNQUFELEVBQVMsQ0FBQyxlQUFELEVBQWtCLGFBQWxCLEVBQWlDLFdBQWpDLEVBQThDLE1BQTlDLENBQVQsQ0FITyxFQUlQLENBQUMsTUFBRCxFQUFTLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxXQUFiLENBQVQsQ0FKTyxFQUtQLENBQUMsTUFBRCxFQUFTLENBQUMsWUFBRCxFQUFlLFVBQWYsRUFBMkIsTUFBM0IsQ0FBVCxDQUxPLENBRnFCO0FBUzlCQyxpQkFBUyxDQVRxQjtBQVU5QkMsb0JBQVk7QUFDVkMsZ0JBQU0sV0FESTtBQUVWQyxvQkFBVSxJQUZBO0FBR1ZDLHVCQUFhLElBSEg7QUFJVkMsaUJBQU87QUFKRztBQVZrQixPQUFoQztBQWlCRCxLQTNCRDtBQTRCRCxHQTdCRDs7QUErQkE7QUFDQXZNLElBQUUsZ0JBQUYsRUFBb0I4RSxJQUFwQixDQUF5QixZQUFVO0FBQ2pDOUUsTUFBRSxJQUFGLEVBQVE2TCxLQUFSLENBQWMsVUFBU3ZDLENBQVQsRUFBVztBQUN2QkEsUUFBRXdDLGVBQUY7QUFDQXhDLFFBQUV5QyxjQUFGOztBQUVBO0FBQ0EsVUFBSTlILEtBQUtqRSxFQUFFLElBQUYsRUFBUWdFLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQWhFLFFBQUUsbUJBQW1CaUUsRUFBckIsRUFBeUJLLFdBQXpCLENBQXFDLFdBQXJDOztBQUVBO0FBQ0EsVUFBSWtJLGFBQWF4TSxFQUFFLGVBQWVpRSxFQUFqQixFQUFxQitILFVBQXJCLENBQWdDLE1BQWhDLENBQWpCOztBQUVBO0FBQ0FsTSxhQUFPRyxLQUFQLENBQWE2SCxJQUFiLENBQWtCLG9CQUFvQjdELEVBQXRDLEVBQTBDO0FBQ3hDd0ksa0JBQVVEO0FBRDhCLE9BQTFDLEVBR0N6RSxJQUhELENBR00sVUFBU3RDLFFBQVQsRUFBa0I7QUFDdEI7QUFDQWlILGlCQUFTQyxNQUFULENBQWdCLElBQWhCO0FBQ0QsT0FORCxFQU9DM0UsS0FQRCxDQU9PLFVBQVNySCxLQUFULEVBQWU7QUFDcEI2QixjQUFNLDZCQUE2QjdCLE1BQU04RSxRQUFOLENBQWV6QixJQUFsRDtBQUNELE9BVEQ7QUFVRCxLQXhCRDtBQXlCRCxHQTFCRDs7QUE0QkE7QUFDQWhFLElBQUUsa0JBQUYsRUFBc0I4RSxJQUF0QixDQUEyQixZQUFVO0FBQ25DOUUsTUFBRSxJQUFGLEVBQVE2TCxLQUFSLENBQWMsVUFBU3ZDLENBQVQsRUFBVztBQUN2QkEsUUFBRXdDLGVBQUY7QUFDQXhDLFFBQUV5QyxjQUFGOztBQUVBO0FBQ0EsVUFBSTlILEtBQUtqRSxFQUFFLElBQUYsRUFBUWdFLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQWhFLFFBQUUsZUFBZWlFLEVBQWpCLEVBQXFCK0gsVUFBckIsQ0FBZ0MsT0FBaEM7QUFDQWhNLFFBQUUsZUFBZWlFLEVBQWpCLEVBQXFCK0gsVUFBckIsQ0FBZ0MsU0FBaEM7O0FBRUE7QUFDQWhNLFFBQUUscUJBQXFCaUUsRUFBdkIsRUFBMkJLLFdBQTNCLENBQXVDLFFBQXZDO0FBQ0F0RSxRQUFFLG1CQUFtQmlFLEVBQXJCLEVBQXlCaUMsUUFBekIsQ0FBa0MsUUFBbEM7QUFDRCxLQWREO0FBZUQsR0FoQkQ7QUFpQkQsQ0ExRkQsQzs7Ozs7Ozs7QUNKQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakUscUJBQXFCO0FBQ3JCO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyxXQUFXO0FBQ3RCLGVBQWUsaUNBQWlDO0FBQ2hELGlCQUFpQixpQkFBaUI7QUFDbEMsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLDZFQUE2RTtBQUM3RSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLGNBQWM7QUFDNUIsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyw2QkFBNkI7QUFDM0MsV0FBVztBQUNYLEdBQUc7QUFDSCxnQkFBZ0IsWUFBWTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsNkRBQTZEO0FBQzdELFNBQVM7QUFDVCx1REFBdUQ7QUFDdkQ7QUFDQSxPQUFPO0FBQ1AsMERBQTBEO0FBQzFEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QWhDO0FBQ0E7QUFDRCxDQU5EOztBQVFBOzs7Ozs7O0FBT0F6QixRQUFRbUgsV0FBUixHQUFzQixVQUFTZ0ssT0FBVCxFQUFrQmhNLE9BQWxCLEVBQTJCdEYsS0FBM0IsRUFBaUM7QUFDdEQsS0FBR0EsTUFBTThFLFFBQVQsRUFBa0I7QUFDakI7QUFDQSxNQUFHOUUsTUFBTThFLFFBQU4sQ0FBZStDLE1BQWYsSUFBeUIsR0FBNUIsRUFBZ0M7QUFDL0IxSCxXQUFRc1IsYUFBUixDQUFzQnpSLE1BQU04RSxRQUFOLENBQWV6QixJQUFyQztBQUNBLEdBRkQsTUFFSztBQUNKeEIsU0FBTSxlQUFleVAsT0FBZixHQUF5QixJQUF6QixHQUFnQ3RSLE1BQU04RSxRQUFOLENBQWV6QixJQUFyRDtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQSxLQUFHaUMsUUFBUWlLLE1BQVIsR0FBaUIsQ0FBcEIsRUFBc0I7QUFDckJsUSxJQUFFaUcsVUFBVSxNQUFaLEVBQW9CQyxRQUFwQixDQUE2QixXQUE3QjtBQUNBO0FBQ0QsQ0FkRCxDIiwiZmlsZSI6Ii9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2h0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy81LjQvbWl4I3dvcmtpbmctd2l0aC1zY3JpcHRzXG4vL2h0dHBzOi8vYW5keS1jYXJ0ZXIuY29tL2Jsb2cvc2NvcGluZy1qYXZhc2NyaXB0LWZ1bmN0aW9uYWxpdHktdG8tc3BlY2lmaWMtcGFnZXMtd2l0aC1sYXJhdmVsLWFuZC1jYWtlcGhwXG5cbi8vTG9hZCBzaXRlLXdpZGUgbGlicmFyaWVzIGluIGJvb3RzdHJhcCBmaWxlXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcCcpO1xuXG52YXIgQXBwID0ge1xuXG5cdC8vIENvbnRyb2xsZXItYWN0aW9uIG1ldGhvZHNcblx0YWN0aW9uczoge1xuXHRcdC8vSW5kZXggZm9yIGRpcmVjdGx5IGNyZWF0ZWQgdmlld3Mgd2l0aCBubyBleHBsaWNpdCBjb250cm9sbGVyXG5cdFx0aW5kZXg6IHtcblx0XHRcdGluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly9ubyBkZWZhdWx0IGphdmFzY3JpcHRzIG9uIGhvbWUgcGFnZXM/XG5cdFx0XHR9LFxuICAgIH0sXG5cblx0XHQvL0FkdmlzaW5nIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWR2aXNpbmdcblx0XHRBZHZpc2luZ0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWR2aXNpbmcvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNhbGVuZGFyID0gcmVxdWlyZSgnLi9wYWdlcy9jYWxlbmRhcicpO1xuXHRcdFx0XHRjYWxlbmRhci5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vR3JvdXBzZXNzaW9uIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvZ3JvdXBzZXNzaW9uXG4gICAgR3JvdXBzZXNzaW9uQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9ncm91cHNlc3Npb24vaW5kZXhcbiAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcbiAgICAgIH0sXG5cdFx0XHRnZXRMaXN0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbiA9IHJlcXVpcmUoJy4vcGFnZXMvZ3JvdXBzZXNzaW9uJyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbi5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHQvL1Byb2ZpbGVzIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvcHJvZmlsZVxuXHRcdFByb2ZpbGVzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9wcm9maWxlL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwcm9maWxlID0gcmVxdWlyZSgnLi9wYWdlcy9wcm9maWxlJyk7XG5cdFx0XHRcdHByb2ZpbGUuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL0Z1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGJ5IHRoZSBwYWdlIGF0IGxvYWQuIERlZmluZWQgaW4gcmVzb3VyY2VzL3ZpZXdzL2luY2x1ZGVzL3NjcmlwdHMuYmxhZGUucGhwXG5cdC8vYW5kIEFwcC9IdHRwL1ZpZXdDb21wb3NlcnMvSmF2YXNjcmlwdCBDb21wb3NlclxuXHQvL1NlZSBsaW5rcyBhdCB0b3Agb2YgZmlsZSBmb3IgZGVzY3JpcHRpb24gb2Ygd2hhdCdzIGdvaW5nIG9uIGhlcmVcblx0Ly9Bc3N1bWVzIDIgaW5wdXRzIC0gdGhlIGNvbnRyb2xsZXIgYW5kIGFjdGlvbiB0aGF0IGNyZWF0ZWQgdGhpcyBwYWdlXG5cdGluaXQ6IGZ1bmN0aW9uKGNvbnRyb2xsZXIsIGFjdGlvbikge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvL2NhbGwgdGhlIG1hdGNoaW5nIGZ1bmN0aW9uIGluIHRoZSBhcnJheSBhYm92ZVxuXHRcdFx0cmV0dXJuIEFwcC5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0oKTtcblx0XHR9XG5cdH0sXG59O1xuXG4vL0JpbmQgdG8gdGhlIHdpbmRvd1xud2luZG93LkFwcCA9IEFwcDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2luZG93Ll8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIGpRdWVyeSBhbmQgdGhlIEJvb3RzdHJhcCBqUXVlcnkgcGx1Z2luIHdoaWNoIHByb3ZpZGVzIHN1cHBvcnRcbiAqIGZvciBKYXZhU2NyaXB0IGJhc2VkIEJvb3RzdHJhcCBmZWF0dXJlcyBzdWNoIGFzIG1vZGFscyBhbmQgdGFicy4gVGhpc1xuICogY29kZSBtYXkgYmUgbW9kaWZpZWQgdG8gZml0IHRoZSBzcGVjaWZpYyBuZWVkcyBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICovXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIHRoZSBheGlvcyBIVFRQIGxpYnJhcnkgd2hpY2ggYWxsb3dzIHVzIHRvIGVhc2lseSBpc3N1ZSByZXF1ZXN0c1xuICogdG8gb3VyIExhcmF2ZWwgYmFjay1lbmQuIFRoaXMgbGlicmFyeSBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgc2VuZGluZyB0aGVcbiAqIENTUkYgdG9rZW4gYXMgYSBoZWFkZXIgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBcIlhTUkZcIiB0b2tlbiBjb29raWUuXG4gKi9cblxud2luZG93LmF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLy9odHRwczovL2dpdGh1Yi5jb20vcmFwcGFzb2Z0L2xhcmF2ZWwtNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qc1xud2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4vKipcbiAqIE5leHQgd2Ugd2lsbCByZWdpc3RlciB0aGUgQ1NSRiBUb2tlbiBhcyBhIGNvbW1vbiBoZWFkZXIgd2l0aCBBeGlvcyBzbyB0aGF0XG4gKiBhbGwgb3V0Z29pbmcgSFRUUCByZXF1ZXN0cyBhdXRvbWF0aWNhbGx5IGhhdmUgaXQgYXR0YWNoZWQuIFRoaXMgaXMganVzdFxuICogYSBzaW1wbGUgY29udmVuaWVuY2Ugc28gd2UgZG9uJ3QgaGF2ZSB0byBhdHRhY2ggZXZlcnkgdG9rZW4gbWFudWFsbHkuXG4gKi9cblxubGV0IHRva2VuID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG5cbmlmICh0b2tlbikge1xuICAgIHdpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1DU1JGLVRPS0VOJ10gPSB0b2tlbi5jb250ZW50O1xufSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdDU1JGIHRva2VuIG5vdCBmb3VuZDogaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzL2NzcmYjY3NyZi14LWNzcmYtdG9rZW4nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnZW9uYXNkYW4tYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLXJ1c3NmZWxkJyk7XG5cbi8vU2Vzc2lvbiBmb3Igc3RvcmluZyBkYXRhIGJldHdlZW4gZm9ybXNcbmV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cbi8vSUQgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgY2FsZW5kYXIncyBhZHZpc29yXG5leHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gLTE7XG5cbi8vU3R1ZGVudCdzIE5hbWUgc2V0IGJ5IGluaXRcbmV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9IFwiXCI7XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbmV4cG9ydHMuY2FsZW5kYXJEYXRhID0ge1xuXHRoZWFkZXI6IHtcblx0XHRsZWZ0OiAncHJldixuZXh0IHRvZGF5Jyxcblx0XHRjZW50ZXI6ICd0aXRsZScsXG5cdFx0cmlnaHQ6ICdhZ2VuZGFXZWVrLGFnZW5kYURheSdcblx0fSxcblx0ZWRpdGFibGU6IGZhbHNlLFxuXHRldmVudExpbWl0OiB0cnVlLFxuXHRoZWlnaHQ6ICdhdXRvJyxcblx0d2Vla2VuZHM6IGZhbHNlLFxuXHRidXNpbmVzc0hvdXJzOiB7XG5cdFx0c3RhcnQ6ICc4OjAwJywgLy8gYSBzdGFydCB0aW1lICgxMGFtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRlbmQ6ICcxNzowMCcsIC8vIGFuIGVuZCB0aW1lICg2cG0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGRvdzogWyAxLCAyLCAzLCA0LCA1IF1cblx0fSxcblx0ZGVmYXVsdFZpZXc6ICdhZ2VuZGFXZWVrJyxcblx0dmlld3M6IHtcblx0XHRhZ2VuZGE6IHtcblx0XHRcdGFsbERheVNsb3Q6IGZhbHNlLFxuXHRcdFx0c2xvdER1cmF0aW9uOiAnMDA6MjA6MDAnLFxuXHRcdFx0bWluVGltZTogJzA4OjAwOjAwJyxcblx0XHRcdG1heFRpbWU6ICcxNzowMDowMCdcblx0XHR9XG5cdH0sXG5cdGV2ZW50U291cmNlczogW1xuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9tZWV0aW5nZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIG1lZXRpbmcgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyM1MTI4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnd2hpdGUnLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL2JsYWNrb3V0ZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIGJsYWNrb3V0IGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjRkY4ODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ2JsYWNrJyxcblx0XHR9LFxuXHRdLFxuXHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRzZWxlY3RIZWxwZXI6IHRydWUsXG5cdHNlbGVjdE92ZXJsYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGV2ZW50LnJlbmRlcmluZyA9PT0gJ2JhY2tncm91bmQnO1xuXHR9LFxuXHR0aW1lRm9ybWF0OiAnICcsXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0YSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdMTEwnLFxuXHRcdHN0ZXBwaW5nOiAyMCxcblx0XHRlbmFibGVkSG91cnM6IFs4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTddLFxuXHRcdG1heEhvdXI6IDE3LFxuXHRcdHNpZGVCeVNpZGU6IHRydWUsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2UgZGF5IG9ubHlcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5ID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ01NL0REL1lZWVknLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8qKlxuICogSW5pdGlhbHphdGlvbiBmdW5jdGlvbiBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIGFkdmlzb3IgLSBib29sZWFuIHRydWUgaWYgdGhlIHVzZXIgaXMgYW4gYWR2aXNvclxuICogQHBhcmFtIG5vYmluZCAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgYnV0dG9ucyBzaG91bGQgbm90IGJlIGJvdW5kIChtYWtlIGNhbGVuZGFyIHJlYWQtb25seSlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXMgYWN0aW9uXG5cdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cblx0Ly90d2VhayBwYXJhbWV0ZXJzXG5cdHdpbmRvdy5hZHZpc29yIHx8ICh3aW5kb3cuYWR2aXNvciA9IGZhbHNlKTtcblx0d2luZG93Lm5vYmluZCB8fCAod2luZG93Lm5vYmluZCA9IGZhbHNlKTtcblxuXHQvL2dldCB0aGUgY3VycmVudCBhZHZpc29yJ3MgSURcblx0ZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9ICQoJyNjYWxlbmRhckFkdmlzb3JJRCcpLnZhbCgpLnRyaW0oKTtcblxuXHQvL1NldCB0aGUgYWR2aXNvciBpbmZvcm1hdGlvbiBmb3IgbWVldGluZyBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzBdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vU2V0IHRoZSBhZHZzaW9yIGluZm9yYW10aW9uIGZvciBibGFja291dCBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vaWYgdGhlIHdpbmRvdyBpcyBzbWFsbCwgc2V0IGRpZmZlcmVudCBkZWZhdWx0IGZvciBjYWxlbmRhclxuXHRpZigkKHdpbmRvdykud2lkdGgoKSA8IDYwMCl7XG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZGVmYXVsdFZpZXcgPSAnYWdlbmRhRGF5Jztcblx0fVxuXG5cdC8vSWYgbm9iaW5kLCBkb24ndCBiaW5kIHRoZSBmb3Jtc1xuXHRpZighd2luZG93Lm5vYmluZCl7XG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIGFuIGFkdmlzb3IsIGJpbmQgbW9yZSBkYXRhXG5cdFx0aWYod2luZG93LmFkdmlzb3Ipe1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjdGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNlbmQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNlbmRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2Jykuc2hvdygpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLnNob3coKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cblx0XHRcdC8vYmluZCBtZXRob2RzIGZvciBidXR0b25zIGFuZCBmb3Jtc1xuXHRcdFx0JCgnI25ld1N0dWRlbnRCdXR0b24nKS5iaW5kKCdjbGljaycsIG5ld1N0dWRlbnQpO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNidGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0XHRcdCAgICAkKHRoaXMpLmZpbmQoJy5oYXMtZXJyb3InKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykudGV4dCgnJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL2JpbmQgYXV0b2NvbXBsZXRlIGZpZWxkXG5cdFx0XHQkKCcjc3R1ZGVudGlkJykuYXV0b2NvbXBsZXRlKHtcblx0XHRcdCAgICBzZXJ2aWNlVXJsOiAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnLFxuXHRcdFx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHRcdFx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0XHRcdCAgICAgICAgJCgnI3N0dWRlbnRpZHZhbCcpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0ICAgICAgICByZXR1cm4ge1xuXHRcdFx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdFx0XHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdFx0XHQgICAgICAgICAgICB9KVxuXHRcdFx0ICAgICAgICB9O1xuXHRcdFx0ICAgIH1cblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjc3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI3N0YXJ0JywgJyNlbmQnLCAnI2R1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnN0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2JlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjYnN0YXJ0JywgJyNiZW5kJywgJyNiZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNicmVwZWF0dW50aWxfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5KTtcblxuXHRcdFx0Ly9jaGFuZ2UgcmVuZGVyaW5nIG9mIGV2ZW50c1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0XHRcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1jbGlja2FibGVcIik7XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAnbScpe1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWQnKS52YWwoZXZlbnQuc3R1ZGVudG5hbWUpO1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0fWVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRcdGV2ZW50OiBldmVudFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYoZXZlbnQucmVwZWF0ID09ICcwJyl7XG5cdFx0XHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdFx0XHRlbmQ6IGVuZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvL2JpbmQgbW9yZSBidXR0b25zXG5cdFx0XHQkKCcjYnJlcGVhdCcpLmNoYW5nZShyZXBlYXRDaGFuZ2UpO1xuXG5cdFx0XHQkKCcjc2F2ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0U2VyaWVzJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dE9jY3VycmVuY2UnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0T2NjdXJyZW5jZSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNhZHZpc2luZ0J1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVNZWV0aW5nQnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXRCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdFx0JCgnI3Jlc29sdmVCdXR0b24nKS5vbignY2xpY2snLCByZXNvbHZlQ29uZmxpY3RzKTtcblxuXHRcdFx0bG9hZENvbmZsaWN0cygpO1xuXG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIG5vdCBhbiBhZHZpc29yLCBiaW5kIGxlc3MgZGF0YVxuXHRcdH1lbHNle1xuXG5cdFx0XHQvL0dldCB0aGUgY3VycmVudCBzdHVkZW50J3MgbmFtZVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gJCgnI2NhbGVuZGFyU3R1ZGVudE5hbWUnKS52YWwoKS50cmltKCk7XG5cblx0XHQgIC8vUmVuZGVyIGJsYWNrb3V0cyB0byBiYWNrZ3JvdW5kXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuXG5cdFx0ICAvL1doZW4gcmVuZGVyaW5nLCB1c2UgdGhpcyBjdXN0b20gZnVuY3Rpb24gZm9yIGJsYWNrb3V0cyBhbmQgc3R1ZGVudCBtZWV0aW5nc1xuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdFx0ICAgIH1cblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0XHQgICAgfVxuXHRcdFx0fTtcblxuXHRcdCAgLy9Vc2UgdGhpcyBtZXRob2QgZm9yIGNsaWNraW5nIG9uIG1lZXRpbmdzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0XHRcdFx0aWYoZXZlbnQuc3RhcnQuaXNBZnRlcihtb21lbnQoKSkpe1xuXHRcdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KFwiWW91IGNhbm5vdCBlZGl0IG1lZXRpbmdzIGluIHRoZSBwYXN0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdCAgLy9XaGVuIHNlbGVjdGluZyBuZXcgYXJlYXMsIHVzZSB0aGUgc3R1ZGVudFNlbGVjdCBtZXRob2QgaW4gdGhlIGNhbGVuZGFyIGxpYnJhcnlcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IHN0dWRlbnRTZWxlY3Q7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNkZXNjJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0XCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JChcIiNlbmRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjZW5kX3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJy5tb2RhbCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXHRcdH1cblxuXHRcdC8vQmluZCBjbGljayBoYW5kbGVycyBvbiB0aGUgZm9ybVxuXHRcdCQoJyNzYXZlQnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlTWVldGluZyk7XG5cdFx0JCgnI2RlbGV0ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlTWVldGluZyk7XG5cdFx0JCgnI2R1cmF0aW9uJykub24oJ2NoYW5nZScsIGNoYW5nZUR1cmF0aW9uKTtcblxuXHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzIHdpdGggbm8gYmluZGluZ1xuXHR9ZWxzZXtcblx0XHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzLCBzZXQgcmVuZGVyaW5nIHRvIGJhY2tncm91bmRcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdGFibGUgPSBmYWxzZTtcblxuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdCAgICB9XG5cdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0ICAgIH1cblx0XHR9O1xuXHR9XG5cblx0Ly9pbml0YWxpemUgdGhlIGNhbGVuZGFyIVxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoZXhwb3J0cy5jYWxlbmRhckRhdGEpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGNhbGVuZGFyIGJ5IGNsb3NpbmcgbW9kYWxzIGFuZCByZWxvYWRpbmcgZGF0YVxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBmb3JtIHRvIGhpZGUgKGFuZCB0aGUgc3BpbilcbiAqIEBwYXJhbSByZXBvbnNlIC0gdGhlIEF4aW9zIHJlcHNvbnNlIG9iamVjdCByZWNlaXZlZFxuICovXG52YXIgcmVzZXRDYWxlbmRhciA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlc3BvbnNlKXtcblx0Ly9oaWRlIHRoZSBmb3JtXG5cdCQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2Rpc3BsYXkgdGhlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcblx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cblx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRpZih3aW5kb3cuYWR2aXNvcil7XG5cdFx0bG9hZENvbmZsaWN0cygpO1xuXHR9XG59XG5cbi8qKlxuICogQUpBWCBtZXRob2QgdG8gc2F2ZSBkYXRhIGZyb20gYSBmb3JtXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgc291cmNlIGVsZW1lbnQgb2YgdGhlIGRhdGFcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhTYXZlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24pe1xuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHQgIC8vaWYgcmVzcG9uc2UgaXMgMnh4XG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0fSlcblx0XHQvL2lmIHJlc3BvbnNlIGlzIG5vdCAyeHhcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHR9KTtcbn1cblxudmFyIGFqYXhEZWxldGUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbiwgbm9SZXNldCwgbm9DaG9pY2Upe1xuXHQvL2NoZWNrIG5vUmVzZXQgdmFyaWFibGVcblx0bm9SZXNldCB8fCAobm9SZXNldCA9IGZhbHNlKTtcblx0bm9DaG9pY2UgfHwgKG5vQ2hvaWNlID0gZmFsc2UpO1xuXG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBjb25maXJtYXRpb25cblx0aWYoIW5vQ2hvaWNlKXtcblx0XHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdH1lbHNle1xuXHRcdHZhciBjaG9pY2UgPSB0cnVlO1xuXHR9XG5cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblxuXHRcdC8vaWYgY29uZmlybWVkLCBzaG93IHNwaW5uaW5nIGljb25cblx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vbWFrZSBBSkFYIHJlcXVlc3QgdG8gZGVsZXRlXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihub1Jlc2V0KXtcblx0XHRcdFx0XHQvL2hpZGUgcGFyZW50IGVsZW1lbnQgLSBUT0RPIFRFU1RNRVxuXHRcdFx0XHRcdC8vY2FsbGVyLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIGEgbWVldGluZ1xuICovXG52YXIgc2F2ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlRXZlbnRTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0c3RhcnQ6IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0ZW5kOiBtb21lbnQoJCgnI2VuZCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHR0aXRsZTogJCgnI3RpdGxlJykudmFsKCksXG5cdFx0ZGVzYzogJCgnI2Rlc2MnKS52YWwoKSxcblx0XHRzdGF0dXM6ICQoJyNzdGF0dXMnKS52YWwoKVxuXHR9O1xuXHRkYXRhLmlkID0gZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRDtcblx0aWYoJCgnI21lZXRpbmdJRCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5tZWV0aW5naWQgPSAkKCcjbWVldGluZ0lEJykudmFsKCk7XG5cdH1cblx0aWYoJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5zdHVkZW50aWQgPSAkKCcjc3R1ZGVudGlkdmFsJykudmFsKCk7XG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlbWVldGluZyc7XG5cblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdzYXZlIG1lZXRpbmcnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGEgbWVldGluZ1xuICovXG52YXIgZGVsZXRlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCB1cmxcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiAkKCcjbWVldGluZ0lEJykudmFsKClcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdkZWxldGUgbWVldGluZycsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcG9wdWxhdGUgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgZWRpdGluZ1xuICpcbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byBlZGl0XG4gKi9cbnZhciBzaG93TWVldGluZ0Zvcm0gPSBmdW5jdGlvbihldmVudCl7XG5cdCQoJyN0aXRsZScpLnZhbChldmVudC50aXRsZSk7XG5cdCQoJyNzdGFydCcpLnZhbChldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZW5kJykudmFsKGV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZGVzYycpLnZhbChldmVudC5kZXNjKTtcblx0ZHVyYXRpb25PcHRpb25zKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpO1xuXHQkKCcjbWVldGluZ0lEJykudmFsKGV2ZW50LmlkKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0JCgnI3N0YXR1cycpLnZhbChldmVudC5zdGF0dXMpO1xuXHQkKCcjZGVsZXRlQnV0dG9uJykuc2hvdygpO1xuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBjcmVhdGlvblxuICpcbiAqIEBwYXJhbSBjYWxlbmRhclN0dWRlbnROYW1lIC0gc3RyaW5nIG5hbWUgb2YgdGhlIHN0dWRlbnRcbiAqL1xudmFyIGNyZWF0ZU1lZXRpbmdGb3JtID0gZnVuY3Rpb24oY2FsZW5kYXJTdHVkZW50TmFtZSl7XG5cblx0Ly9wb3B1bGF0ZSB0aGUgdGl0bGUgYXV0b21hdGljYWxseSBmb3IgYSBzdHVkZW50XG5cdGlmKGNhbGVuZGFyU3R1ZGVudE5hbWUgIT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3RpdGxlJykudmFsKGNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9ZWxzZXtcblx0XHQkKCcjdGl0bGUnKS52YWwoJycpO1xuXHR9XG5cblx0Ly9TZXQgc3RhcnQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjc3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZW5kIHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNlbmQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMjApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZHVyYXRpb24gb3B0aW9uc1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHRkdXJhdGlvbk9wdGlvbnMobW9tZW50KCkuaG91cig4KS5taW51dGUoMCksIG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKSk7XG5cdH1lbHNle1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCwgZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kKTtcblx0fVxuXG5cdC8vUmVzZXQgb3RoZXIgb3B0aW9uc1xuXHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0Ly9IaWRlIGRlbGV0ZSBidXR0b25cblx0JCgnI2RlbGV0ZUJ1dHRvbicpLmhpZGUoKTtcblxuXHQvL1Nob3cgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSBvbiB0aGlzIHBhZ2VcbiAqL1xudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNldCBkdXJhdGlvbiBvcHRpb25zIGZvciB0aGUgbWVldGluZyBmb3JtXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZVxuICogQHBhcmFtIGVuZCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZGluZyB0aW1lXG4gKi9cbnZhciBkdXJhdGlvbk9wdGlvbnMgPSBmdW5jdGlvbihzdGFydCwgZW5kKXtcblx0Ly9jbGVhciB0aGUgbGlzdFxuXHQkKCcjZHVyYXRpb24nKS5lbXB0eSgpO1xuXG5cdC8vYXNzdW1lIGFsbCBtZWV0aW5ncyBoYXZlIHJvb20gZm9yIDIwIG1pbnV0ZXNcblx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nMjAnPjIwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MjAsIGFsbG93IDQwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDIwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNDAnPjQwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDowMCwgYWxsb3cgNjAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzYwJz42MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9zZXQgZGVmYXVsdCB2YWx1ZSBiYXNlZCBvbiBnaXZlbiBzcGFuXG5cdCQoJyNkdXJhdGlvbicpLnZhbChlbmQuZGlmZihzdGFydCwgXCJtaW51dGVzXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbGluayB0aGUgZGF0ZXBpY2tlcnMgdG9nZXRoZXJcbiAqXG4gKiBAcGFyYW0gZWxlbTEgLSBqUXVlcnkgb2JqZWN0IGZvciBmaXJzdCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZWxlbTIgLSBqUXVlcnkgb2JqZWN0IGZvciBzZWNvbmQgZGF0ZXBpY2tlclxuICogQHBhcmFtIGR1cmF0aW9uIC0gZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGxpbmtEYXRlUGlja2VycyA9IGZ1bmN0aW9uKGVsZW0xLCBlbGVtMiwgZHVyYXRpb24pe1xuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBmaXJzdCBkYXRhcGlja2VyXG5cdCQoZWxlbTEgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUyID0gbW9tZW50KCQoZWxlbTIpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQWZ0ZXIoZGF0ZTIpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTIpKXtcblx0XHRcdGRhdGUyID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0yKS52YWwoZGF0ZTIuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIHNlY29uZCBkYXRlcGlja2VyXG5cdCQoZWxlbTIgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUxID0gbW9tZW50KCQoZWxlbTEpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQmVmb3JlKGRhdGUxKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUxKSl7XG5cdFx0XHRkYXRlMSA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMSkudmFsKGRhdGUxLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgY2hhbmdlRHVyYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgbmV3RGF0ZSA9IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgJ0xMTCcpLmFkZCgkKHRoaXMpLnZhbCgpLCBcIm1pbnV0ZXNcIik7XG5cdCQoJyNlbmQnKS52YWwobmV3RGF0ZS5mb3JtYXQoXCJMTExcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2ZXJpZnkgdGhhdCB0aGUgc3R1ZGVudHMgYXJlIHNlbGVjdGluZyBtZWV0aW5ncyB0aGF0IGFyZW4ndCB0b28gbG9uZ1xuICpcbiAqIEBwYXJhbSBzdGFydCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCBvZiB0aGUgbWVldGluZ1xuICogQHBhcmFtIGVuZCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmQgb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIHN0dWRlbnRTZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cblx0Ly9XaGVuIHN0dWRlbnRzIHNlbGVjdCBhIG1lZXRpbmcsIGRpZmYgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXNcblx0aWYoZW5kLmRpZmYoc3RhcnQsICdtaW51dGVzJykgPiA2MCl7XG5cblx0XHQvL2lmIGludmFsaWQsIHVuc2VsZWN0IGFuZCBzaG93IGFuIGVycm9yXG5cdFx0YWxlcnQoXCJNZWV0aW5ncyBjYW5ub3QgbGFzdCBsb25nZXIgdGhhbiAxIGhvdXJcIik7XG5cdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHR9ZWxzZXtcblxuXHRcdC8vaWYgdmFsaWQsIHNldCBkYXRhIGluIHRoZSBzZXNzaW9uIGFuZCBzaG93IHRoZSBmb3JtXG5cdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRlbmQ6IGVuZFxuXHRcdH07XG5cdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0Y3JlYXRlTWVldGluZ0Zvcm0oZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBMb2FkIGNvbmZsaWN0aW5nIG1lZXRpbmdzIGZyb20gdGhlIHNlcnZlclxuICovXG52YXIgbG9hZENvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9yZXF1ZXN0IGNvbmZsaWN0cyB2aWEgQUpBWFxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvYWR2aXNpbmcvY29uZmxpY3RzJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdC8vZGlzYWJsZSBleGlzdGluZyBjbGljayBoYW5kbGVyc1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0Ly9JZiByZXNwb25zZSBpcyAyMDAsIGRhdGEgd2FzIHJlY2VpdmVkXG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gMjAwKXtcblxuXHRcdFx0XHQvL0FwcGVuZCBIVE1MIGZvciBjb25mbGljdHMgdG8gRE9NXG5cdFx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpLmVtcHR5KCk7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdCQoJzxkaXYvPicsIHtcblx0XHRcdFx0XHRcdCdpZCcgOiAncmVzb2x2ZScrdmFsdWUuaWQsXG5cdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RWRpdDwvYnV0dG9uPiAnICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0IHJlc29sdmVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPktlZXAgTWVldGluZzwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZScrdmFsdWUuaWQrJ1NwaW5cIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0fSkuYXBwZW5kVG8oJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvL1JlLXJlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHRcdC8vU2hvdyB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cblx0XHQgIC8vSWYgcmVzcG9uc2UgaXMgMjA0LCBubyBjb25mbGljdHMgYXJlIHByZXNlbnRcblx0XHRcdH1lbHNlIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQpe1xuXG5cdFx0XHRcdC8vSGlkZSB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gcmV0cmlldmUgY29uZmxpY3RpbmcgbWVldGluZ3M6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fSk7XG5cblx0XHQvKlxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0bWV0aG9kOiBcIkdFVFwiLFxuXHRcdFx0XHR1cmw6ICcvYWR2aXNpbmcvY29uZmxpY3RzJyxcblx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJ1xuXHRcdFx0fSlcblx0XHRcdC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIG1lc3NhZ2UsIGpxWEhSKSB7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXHRcdFx0XHRpZihqcVhIUi5zdGF0dXMgPT0gMjAwKXtcblx0XHRcdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKS5lbXB0eSgpO1xuXHRcdFx0XHRcdCQuZWFjaChkYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RWRpdDwvYnV0dG9uPiAnICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0IHJlc29sdmVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPktlZXAgTWVldGluZzwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZVNwaW4nK3ZhbHVlLmlkKydcIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXHRcdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoanFYSFIuc3RhdHVzID09IDIwNCl7XG5cdFx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLmZhaWwoZnVuY3Rpb24oIGpxWEhSLCBtZXNzYWdlICl7XG5cdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIHJldHJpZXZlIGNvbmZsaWN0aW5nIG1lZXRpbmdzOiBcIiArIGpxWEhSLnJlc3BvbnNlSlNPTik7XG5cdFx0XHR9KTtcblx0XHQqL1xufVxuXG4vKipcbiAqIFNhdmUgYmxhY2tvdXRzIGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIHNhdmVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVCbGFja291dFNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIHVybDtcblx0dmFyIGRhdGEgPSB7XG5cdFx0YnN0YXJ0OiBtb21lbnQoJCgnI2JzdGFydCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YmVuZDogbW9tZW50KCQoJyNiZW5kJykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRidGl0bGU6ICQoJyNidGl0bGUnKS52YWwoKVxuXHR9O1xuXHR2YXIgdXJsO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhLmJibGFja291dGV2ZW50aWQgPSAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpO1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0Jztcblx0XHRpZigkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSA+IDApe1xuXHRcdFx0ZGF0YS5iYmxhY2tvdXRpZCA9ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpO1xuXHRcdH1cblx0XHRkYXRhLmJyZXBlYXQgPSAkKCcjYnJlcGVhdCcpLnZhbCgpO1xuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMSl7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeT0gJCgnI2JyZXBlYXRkYWlseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMil7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeSA9ICQoJyNicmVwZWF0d2Vla2x5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c20gPSAkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdCA9ICQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN3ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3UgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzZiA9ICQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnc2F2ZSBibGFja291dCcpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgYmxhY2tvdXQgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgZGVsZXRlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgVVJMIGFuZCBkYXRhIG9iamVjdFxuXHR2YXIgdXJsLCBkYXRhO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRldmVudGlkOiAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpIH07XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGlkOiAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSB9O1xuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdkZWxldGUgYmxhY2tvdXQnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgY2hhbmdlIG9mIHJlcGVhdCBvcHRpb25zIG9uIHRoZSBibGFja291dCBmb3JtXG4gKi9cbnZhciByZXBlYXRDaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKHRoaXMpLnZhbCgpID09IDApe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAxKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMil7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9XG59O1xuXG4vKipcbiAqIFNob3cgdGhlIHJlc29sdmUgY29uZmxpY3RzIG1vZGFsIGZvcm1cbiAqL1xudmFyIHJlc29sdmVDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHQvL3NlbmQgQUpBWCBkZWxldGVcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ2RlbGV0ZSBtZWV0aW5nJywgdHJ1ZSk7XG5cbn07XG5cbi8qKlxuICogRWRpdCBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBlZGl0Q29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL21lZXRpbmcnO1xuXG5cdC8vc2hvdyBzcGlubmVyIHRvIGxvYWQgbWVldGluZ1xuXHQkKCcjcmVzb2x2ZScrIGlkICsgJ1NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9sb2FkIG1lZXRpbmcgYW5kIGRpc3BsYXkgZm9ybVxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjcmVzb2x2ZScrIGlkICsgJ1NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdGV2ZW50ID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdGV2ZW50LnN0YXJ0ID0gbW9tZW50KGV2ZW50LnN0YXJ0KTtcblx0XHRcdGV2ZW50LmVuZCA9IG1vbWVudChldmVudC5lbmQpO1xuXHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBtZWV0aW5nJywgJyNyZXNvbHZlJyArIGlkLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIFJlc29sdmUgYSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL3Jlc29sdmVjb25mbGljdCc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ3Jlc29sdmUgbWVldGluZycsIHRydWUsIHRydWUpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgdGhlIGNyZWF0ZSBibGFja291dCBmb3JtXG4gKi9cbnZhciBjcmVhdGVCbGFja291dEZvcm0gPSBmdW5jdGlvbigpe1xuXHQkKCcjYnRpdGxlJykudmFsKFwiXCIpO1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOSkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQkKCcjYnJlcGVhdCcpLnZhbCgwKTtcblx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuaGlkZSgpO1xuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSB0byBhIHNpbmdsZSBvY2N1cnJlbmNlXG4gKi9cbnZhciBibGFja291dE9jY3VycmVuY2UgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL3NldCBmb3JtIHZhbHVlcyBhbmQgaGlkZSB1bm5lZWRlZCBmaWVsZHNcblx0JCgnI2J0aXRsZScpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC50aXRsZSk7XG5cdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWQpO1xuXHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5pZCk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblxuXHQvL3Nob3cgdGhlIGZvcm1cblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIGJsYWNrb3V0IHNlcmllcyBlZGl0IGZvcm1cbiAqL1xudmFyIGJsYWNrb3V0U2VyaWVzID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG4gXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdGlkOiBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2JsYWNrb3V0JztcblxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjYnRpdGxlJykudmFsKHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cdCBcdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5zdGFydCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5lbmQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JibGFja291dGlkJykudmFsKHJlc3BvbnNlLmRhdGEuaWQpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0IFx0XHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCBcdFx0aWYocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAxKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0ZGFpbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1lbHNlIGlmIChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDIpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHRcdFx0XHR2YXIgcmVwZWF0X2RldGFpbCA9IFN0cmluZyhyZXNwb25zZS5kYXRhLnJlcGVhdF9kZXRhaWwpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjFcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjJcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjNcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjRcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjVcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1cblx0IFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cdCBcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBibGFja291dCBzZXJpZXMnLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgc3R1ZGVudCBpbiB0aGUgZGF0YWJhc2VcbiAqL1xudmFyIG5ld1N0dWRlbnQgPSBmdW5jdGlvbigpe1xuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgYW4gZUlEIHRvIGFkZCB0byB0aGUgc3lzdGVtXG5cdHZhciBlaWQgPSBwcm9tcHQoXCJFbnRlciB0aGUgc3R1ZGVudCdzIGVJRFwiKTtcblxuXHQvL2J1aWxkIHRoZSBVUkwgYW5kIGRhdGFcblx0dmFyIGRhdGEgPSB7XG5cdFx0ZWlkOiBlaWQsXG5cdH07XG5cdHZhciB1cmwgPSAnL3Byb2ZpbGUvbmV3c3R1ZGVudCc7XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDQyMiwgZXJyb3JzIHdlcmUgcHJvdmlkZWRcblx0XHRcdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YVtcImVpZFwiXSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuICBzaXRlID0gcmVxdWlyZSgnLi9zaXRlJyk7XG5cbiAgLy9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gKHVzdWFsbHkgZnJvbSBhIHByZXZpb3VzIHN1Y2Nlc3NmdWwgc2F2ZSlcbiAgc2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIndpbmRvdy5WdWUgPSByZXF1aXJlKCd2dWUnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG52YXIgRWNobyA9IHJlcXVpcmUoJ2xhcmF2ZWwtZWNobycpO1xucmVxdWlyZSgnaW9uLXNvdW5kJyk7XG5cbndpbmRvdy5QdXNoZXIgPSByZXF1aXJlKCdwdXNoZXItanMnKTtcblxuLyoqXG4gKiBHcm91cHNlc3Npb24gaW5pdCBmdW5jdGlvblxuICogbXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSB0byBzdGFydFxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vbG9hZCBpb24tc291bmQgbGlicmFyeVxuXHRpb24uc291bmQoe1xuICAgIHNvdW5kczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcImRvb3JfYmVsbFwiXG4gICAgICAgIH0sXG4gICAgXSxcbiAgICB2b2x1bWU6IDEuMCxcbiAgICBwYXRoOiBcIi9zb3VuZHMvXCIsXG4gICAgcHJlbG9hZDogdHJ1ZVxuXHR9KTtcblxuXHQvL2dldCB1c2VySUQgYW5kIGlzQWR2aXNvciB2YXJpYWJsZXNcblx0d2luZG93LnVzZXJJRCA9IHBhcnNlSW50KCQoJyN1c2VySUQnKS52YWwoKSk7XG5cblx0Ly9yZWdpc3RlciBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5vbignY2xpY2snLCBncm91cFJlZ2lzdGVyQnRuKTtcblxuXHQvL2Rpc2FibGUgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cERpc2FibGVCdG4nKS5vbignY2xpY2snLCBncm91cERpc2FibGVCdG4pO1xuXG5cdC8vcmVuZGVyIFZ1ZSBBcHBcblx0d2luZG93LnZtID0gbmV3IFZ1ZSh7XG5cdFx0ZWw6ICcjZ3JvdXBMaXN0Jyxcblx0XHRkYXRhOiB7XG5cdFx0XHRxdWV1ZTogW10sXG5cdFx0XHRhZHZpc29yOiBwYXJzZUludCgkKCcjaXNBZHZpc29yJykudmFsKCkpID09IDEsXG5cdFx0XHR1c2VySUQ6IHBhcnNlSW50KCQoJyN1c2VySUQnKS52YWwoKSksXG5cdFx0XHRvbmxpbmU6IFtdLFxuXHRcdH0sXG5cdFx0bWV0aG9kczoge1xuXHRcdFx0Ly9GdW5jdGlvbiB0byBnZXQgQ1NTIGNsYXNzZXMgZm9yIGEgc3R1ZGVudCBvYmplY3Rcblx0XHRcdGdldENsYXNzOiBmdW5jdGlvbihzKXtcblx0XHRcdFx0cmV0dXJue1xuXHRcdFx0XHRcdCdhbGVydC1pbmZvJzogcy5zdGF0dXMgPT0gMCB8fCBzLnN0YXR1cyA9PSAxLFxuXHRcdFx0XHRcdCdhbGVydC1zdWNjZXNzJzogcy5zdGF0dXMgPT0gMixcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW1lJzogcy51c2VyaWQgPT0gdGhpcy51c2VySUQsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1vZmZsaW5lJzogJC5pbkFycmF5KHMudXNlcmlkLCB0aGlzLm9ubGluZSkgPT0gLTEsXG5cdFx0XHRcdH07XG5cdFx0XHR9LFxuXHRcdFx0Ly9mdW5jdGlvbiB0byB0YWtlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHR0YWtlU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3Rha2UnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3Rha2UnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gcHV0IGEgc3R1ZGVudCBiYWNrIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3Rcblx0XHRcdHB1dFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9wdXQnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3B1dCcpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly8gZnVuY3Rpb24gdG8gbWFyayBhIHN0dWRlbnQgZG9uZSBvbiB0aGUgbGlzdFxuXHRcdFx0ZG9uZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kb25lJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdtYXJrIGRvbmUnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gZGVsZXRlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHRkZWxTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZGVsZXRlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdkZWxldGUnKTtcblx0XHRcdH0sXG5cdFx0fSxcblx0fSlcblxuXG5cdC8vRW5hYmxlIFB1c2hlciBsb2dnaW5nXG5cdGlmKHdpbmRvdy5lbnYgPT0gXCJsb2NhbFwiIHx8IHdpbmRvdy5lbnYgPT0gXCJzdGFnaW5nXCIpe1xuXHRcdGNvbnNvbGUubG9nKFwiUHVzaGVyIGxvZ2dpbmcgZW5hYmxlZCFcIik7XG5cdFx0UHVzaGVyLmxvZ1RvQ29uc29sZSA9IHRydWU7XG5cdH1cblxuXHQvL0xvYWQgdGhlIEVjaG8gaW5zdGFuY2Ugb24gdGhlIHdpbmRvd1xuXHR3aW5kb3cuRWNobyA9IG5ldyBFY2hvKHtcblx0XHRicm9hZGNhc3RlcjogJ3B1c2hlcicsXG5cdFx0a2V5OiB3aW5kb3cucHVzaGVyS2V5LFxuXHRcdGNsdXN0ZXI6IHdpbmRvdy5wdXNoZXJDbHVzdGVyLFxuXHR9KTtcblxuXHQvL0JpbmQgdG8gdGhlIGNvbm5lY3RlZCBhY3Rpb24gb24gUHVzaGVyIChjYWxsZWQgd2hlbiBjb25uZWN0ZWQpXG5cdHdpbmRvdy5FY2hvLmNvbm5lY3Rvci5wdXNoZXIuY29ubmVjdGlvbi5iaW5kKCdjb25uZWN0ZWQnLCBmdW5jdGlvbigpe1xuXHRcdC8vd2hlbiBjb25uZWN0ZWQsIGRpc2FibGUgdGhlIHNwaW5uZXJcblx0XHQkKCcjZ3JvdXBTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9Mb2FkIHRoZSBpbml0aWFsIHN0dWRlbnQgcXVldWUgdmlhIEFKQVhcblx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvZ3JvdXBzZXNzaW9uL3F1ZXVlJylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0d2luZG93LnZtLnF1ZXVlID0gd2luZG93LnZtLnF1ZXVlLmNvbmNhdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0Y2hlY2tCdXR0b25zKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdGluaXRpYWxDaGVja0Rpbmcod2luZG93LnZtLnF1ZXVlKTtcblx0XHRcdFx0d2luZG93LnZtLnF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdnZXQgcXVldWUnLCAnJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pXG5cblx0Ly9Db25uZWN0IHRvIHRoZSBncm91cHNlc3Npb24gY2hhbm5lbFxuXHQvKlxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb24nKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblxuXHRcdH0pO1xuICovXG5cblx0Ly9Db25uZWN0IHRvIHRoZSBncm91cHNlc3Npb25lbmQgY2hhbm5lbFxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb25lbmQnKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvbkVuZCcsIChlKSA9PiB7XG5cblx0XHRcdC8vaWYgZW5kaW5nLCByZWRpcmVjdCBiYWNrIHRvIGhvbWUgcGFnZVxuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9ncm91cHNlc3Npb25cIjtcblx0fSk7XG5cblx0d2luZG93LkVjaG8uam9pbigncHJlc2VuY2UnKVxuXHRcdC5oZXJlKCh1c2VycykgPT4ge1xuXHRcdFx0dmFyIGxlbiA9IHVzZXJzLmxlbmd0aDtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2Vyc1tpXS5pZCk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuam9pbmluZygodXNlcikgPT4ge1xuXHRcdFx0d2luZG93LnZtLm9ubGluZS5wdXNoKHVzZXIuaWQpO1xuXHRcdH0pXG5cdFx0LmxlYXZpbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUuc3BsaWNlKCAkLmluQXJyYXkodXNlci5pZCwgd2luZG93LnZtLm9ubGluZSksIDEpO1xuXHRcdH0pXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZGF0YSkgPT4ge1xuXHRcdFx0dmFyIHF1ZXVlID0gd2luZG93LnZtLnF1ZXVlO1xuXHRcdFx0dmFyIGZvdW5kID0gZmFsc2U7XG5cdFx0XHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXG5cdFx0XHQvL3VwZGF0ZSB0aGUgcXVldWUgYmFzZWQgb24gcmVzcG9uc2Vcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdGlmKHF1ZXVlW2ldLmlkID09PSBkYXRhLmlkKXtcblx0XHRcdFx0XHRpZihkYXRhLnN0YXR1cyA8IDMpe1xuXHRcdFx0XHRcdFx0cXVldWVbaV0gPSBkYXRhO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0cXVldWUuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdFx0bGVuLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2lmIGVsZW1lbnQgbm90IGZvdW5kIG9uIGN1cnJlbnQgcXVldWUsIHB1c2ggaXQgb24gdG8gdGhlIHF1ZXVlXG5cdFx0XHRpZighZm91bmQpe1xuXHRcdFx0XHRxdWV1ZS5wdXNoKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NoZWNrIHRvIHNlZSBpZiBjdXJyZW50IHVzZXIgaXMgb24gcXVldWUgYmVmb3JlIGVuYWJsaW5nIGJ1dHRvblxuXHRcdFx0Y2hlY2tCdXR0b25zKHF1ZXVlKTtcblxuXHRcdFx0Ly9pZiBjdXJyZW50IHVzZXIgaXMgZm91bmQsIGNoZWNrIGZvciBzdGF0dXMgdXBkYXRlIHRvIHBsYXkgc291bmRcblx0XHRcdGlmKGRhdGEudXNlcmlkID09PSB1c2VySUQpe1xuXHRcdFx0XHRjaGVja0RpbmcoZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vc29ydCB0aGUgcXVldWUgY29ycmVjdGx5XG5cdFx0XHRxdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cblx0XHRcdC8vdXBkYXRlIFZ1ZSBzdGF0ZSwgbWlnaHQgYmUgdW5uZWNlc3Nhcnlcblx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHF1ZXVlO1xuXHRcdH0pO1xuXG59O1xuXG5cbi8qKlxuICogVnVlIGZpbHRlciBmb3Igc3RhdHVzIHRleHRcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBzdHVkZW50IHRvIHJlbmRlclxuICovXG5WdWUuZmlsdGVyKCdzdGF0dXN0ZXh0JywgZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAwKSByZXR1cm4gXCJORVdcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDEpIHJldHVybiBcIlFVRVVFRFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMikgcmV0dXJuIFwiTUVFVCBXSVRIIFwiICsgZGF0YS5hZHZpc29yO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMykgcmV0dXJuIFwiREVMQVlcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDQpIHJldHVybiBcIkFCU0VOVFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNSkgcmV0dXJuIFwiRE9ORVwiO1xufSk7XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGNsaWNraW5nIG9uIHRoZSByZWdpc3RlciBidXR0b25cbiAqL1xudmFyIGdyb3VwUmVnaXN0ZXJCdG4gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9yZWdpc3Rlcic7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwge30pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdFx0XHQkKCcjZ3JvdXBTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JlZ2lzdGVyJywgJyNncm91cCcsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGFkdmlzb3JzIHRvIGRpc2FibGUgZ3JvdXBzZXNzaW9uXG4gKi9cbnZhciBncm91cERpc2FibGVCdG4gPSBmdW5jdGlvbigpe1xuXHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cdFx0dmFyIHJlYWxseSA9IGNvbmZpcm0oXCJTZXJpb3VzbHksIHRoaXMgd2lsbCBsb3NlIGFsbCBjdXJyZW50IGRhdGEuIEFyZSB5b3UgcmVhbGx5IHN1cmU/XCIpO1xuXHRcdGlmKHJlYWxseSA9PT0gdHJ1ZSl7XG5cdFx0XHQvL3RoaXMgaXMgYSBiaXQgaGFja3ksIGJ1dCBpdCB3b3Jrc1xuXHRcdFx0dmFyIHRva2VuID0gJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKTtcblx0XHRcdCQoJzxmb3JtIGFjdGlvbj1cIi9ncm91cHNlc3Npb24vZGlzYWJsZVwiIG1ldGhvZD1cIlBPU1RcIi8+Jylcblx0XHRcdFx0LmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJpZFwiIHZhbHVlPVwiJyArIHdpbmRvdy51c2VySUQgKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiX3Rva2VuXCIgdmFsdWU9XCInICsgdG9rZW4gKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmRUbygkKGRvY3VtZW50LmJvZHkpKSAvL2l0IGhhcyB0byBiZSBhZGRlZCBzb21ld2hlcmUgaW50byB0aGUgPGJvZHk+XG5cdFx0XHRcdC5zdWJtaXQoKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBlbmFibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZW5hYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRpc2FibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZGlzYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBhbmQgc2VlIGlmIHVzZXIgaXMgb24gdGhlIGxpc3QgLSBpZiBub3QsIGRvbid0IGVuYWJsZSBidXR0b25cbiAqL1xudmFyIGNoZWNrQnV0dG9ucyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0dmFyIGZvdW5kTWUgPSBmYWxzZTtcblxuXHQvL2l0ZXJhdGUgdGhyb3VnaCB1c2VycyBvbiBsaXN0LCBsb29raW5nIGZvciBjdXJyZW50IHVzZXJcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHdpbmRvdy51c2VySUQpe1xuXHRcdFx0Zm91bmRNZSA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvL2lmIGZvdW5kLCBkaXNhYmxlIGJ1dHRvbjsgaWYgbm90LCBlbmFibGUgYnV0dG9uXG5cdGlmKGZvdW5kTWUpe1xuXHRcdGRpc2FibGVCdXR0b24oKTtcblx0fWVsc2V7XG5cdFx0ZW5hYmxlQnV0dG9uKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgdXNlciBpcyBiZWNrb25lZCwgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHBlcnNvbiAtIHRoZSBjdXJyZW50IHVzZXIgdG8gY2hlY2tcbiAqL1xudmFyIGNoZWNrRGluZyA9IGZ1bmN0aW9uKHBlcnNvbil7XG5cdGlmKHBlcnNvbi5zdGF0dXMgPT0gMil7XG5cdFx0aW9uLnNvdW5kLnBsYXkoXCJkb29yX2JlbGxcIik7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcGVyc29uIGhhcyBiZWVuIGJlY2tvbmVkIG9uIGxvYWQ7IGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBxdWV1ZSAtIHRoZSBpbml0aWFsIHF1ZXVlIG9mIHVzZXJzIGxvYWRlZFxuICovXG52YXIgaW5pdGlhbENoZWNrRGluZyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHdpbmRvdy51c2VySUQpe1xuXHRcdFx0Y2hlY2tEaW5nKHF1ZXVlW2ldKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIHN0YXR1c1xuICpcbiAqIEBwYXJhbSBhIC0gZmlyc3QgcGVyc29uXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBwZXJzb25cbiAqIEByZXR1cm4gLSBzb3J0aW5nIHZhbHVlIGluZGljYXRpbmcgd2hvIHNob3VsZCBnbyBmaXJzdF9uYW1lXG4gKi9cbnZhciBzb3J0RnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKXtcblx0aWYoYS5zdGF0dXMgPT0gYi5zdGF0dXMpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5zdGF0dXMgPCBiLnN0YXR1cyA/IDEgOiAtMSk7XG59XG5cblxuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBtYWtpbmcgQUpBWCBQT1NUIHJlcXVlc3RzXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4UG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgYWN0aW9uKXtcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZ3JvdXBzZXNzaW9uLmpzIiwidmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3Igc2F2ZSBidXR0b25cblx0JCgnI3NhdmVQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGZpcnN0X25hbWU6ICQoJyNmaXJzdF9uYW1lJykudmFsKCksXG5cdFx0XHRsYXN0X25hbWU6ICQoJyNsYXN0X25hbWUnKS52YWwoKSxcblx0XHR9O1xuXHRcdHZhciB1cmwgPSAnL3Byb2ZpbGUvdXBkYXRlJztcblxuXHRcdC8vc2VuZCBBSkFYIHBvc3Rcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZVNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSlcblx0fSk7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIGFkdmlzb3Igc2F2ZSBidXR0b25cblx0JCgnI3NhdmVBZHZpc29yUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0Ly9UT0RPIFRFU1RNRVxuXHRcdHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJ2Zvcm0nKVswXSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwib2ZmaWNlXCIsICQoJyNvZmZpY2UnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGRhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuXHRcdHZhciB1cmwgPSAnL3Byb2ZpbGUvdXBkYXRlJztcblxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0d2luZG93LmF4aW9zLmdldCgnL3Byb2ZpbGUvcGljJylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHQkKCcjcGljdGV4dCcpLnZhbChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHRcdCQoJyNwaWNpbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBwaWN0dXJlJywgJycsIGVycm9yKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHQvL2h0dHA6Ly93d3cuYWJlYXV0aWZ1bHNpdGUubmV0L3doaXBwaW5nLWZpbGUtaW5wdXRzLWludG8tc2hhcGUtd2l0aC1ib290c3RyYXAtMy9cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuYnRuLWZpbGUgOmZpbGUnLCBmdW5jdGlvbigpIHtcblx0ICB2YXIgaW5wdXQgPSAkKHRoaXMpLFxuXHQgICAgICBudW1GaWxlcyA9IGlucHV0LmdldCgwKS5maWxlcyA/IGlucHV0LmdldCgwKS5maWxlcy5sZW5ndGggOiAxLFxuXHQgICAgICBsYWJlbCA9IGlucHV0LnZhbCgpLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC8uKlxcLy8sICcnKTtcblx0ICBpbnB1dC50cmlnZ2VyKCdmaWxlc2VsZWN0JywgW251bUZpbGVzLCBsYWJlbF0pO1xuXHR9KTtcblxuXHQvL2JpbmQgdG8gZmlsZXNlbGVjdCBidXR0b25cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKTtcblx0XHRcdHZhciBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICAgaWYobG9nKXtcblx0XHRcdFx0XHRcdGFsZXJ0KGxvZyk7XG5cdFx0XHRcdFx0fVxuICAgICAgfVxuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAxODVcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmxhc2hlZCBzZXNzaW9uIGRhdGFcbiAqXG4gKiB1c2UgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCdtZXNzYWdlJywgdHJhbnMoJ21lc3NhZ2VzLml0ZW1fc2F2ZWQnKSk7XG4gKiAgICAgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCd0eXBlJywgJ3N1Y2Nlc3MnKTtcbiAqIHRvIHNldCBtZXNzYWdlIHRleHQgYW5kIHR5cGVcbiAqL1xuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpe1xuXHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiamF2YXNjcmlwdE1lc3NhZ2VcIiBjbGFzcz1cImFsZXJ0IGZhZGUgaW4gYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtJyArIHR5cGUgKyAnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48L2J1dHRvbj48c3BhbiBjbGFzcz1cImg0XCI+JyArIG1lc3NhZ2UgKyAnPC9zcGFuPjwvZGl2Pic7XG5cdCQoJyNtZXNzYWdlJykuYXBwZW5kKGh0bWwpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoXCIjamF2YXNjcmlwdE1lc3NhZ2VcIikuYWxlcnQoJ2Nsb3NlJyk7XG5cdH0sIDMwMDApO1xufTtcblxuLypcbmV4cG9ydHMuYWpheGNyc2YgPSBmdW5jdGlvbigpe1xuXHQkLmFqYXhTZXR1cCh7XG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jylcblx0XHR9XG5cdH0pO1xufTtcbiovXG5cbi8qKlxuICogQ2xlYXJzIGVycm9ycyBvbiBmb3JtcyBieSByZW1vdmluZyBlcnJvciBjbGFzc2VzXG4gKi9cbmV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzID0gZnVuY3Rpb24oKXtcblx0JCgnLmZvcm0tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uICgpe1xuXHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcblx0fSk7XG59XG5cbi8qKlxuICogU2V0cyBlcnJvcnMgb24gZm9ybXMgYmFzZWQgb24gcmVzcG9uc2UgSlNPTlxuICovXG5leHBvcnRzLnNldEZvcm1FcnJvcnMgPSBmdW5jdGlvbihqc29uKXtcblx0ZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMoKTtcblx0JC5lYWNoKGpzb24sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0JCgnIycgKyBrZXkpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQoJyMnICsga2V5ICsgJ2hlbHAnKS50ZXh0KHZhbHVlLmpvaW4oJyAnKSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBmb3IgbWVzc2FnZXMgaW4gdGhlIGZsYXNoIGRhdGEuIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgYnkgdGhlIHBhZ2VcbiAqL1xuZXhwb3J0cy5jaGVja01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKCcjbWVzc2FnZV9mbGFzaCcpLmxlbmd0aCl7XG5cdFx0dmFyIG1lc3NhZ2UgPSAkKCcjbWVzc2FnZV9mbGFzaCcpLnZhbCgpO1xuXHRcdHZhciB0eXBlID0gJCgnI21lc3NhZ2VfdHlwZV9mbGFzaCcpLnZhbCgpO1xuXHRcdGV4cG9ydHMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3JzIGZyb20gQUpBWFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSB0byB0aGUgdXNlclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBlcnJvciAtIHRoZSBBeGlvcyBlcnJvciByZWNlaXZlZFxuICovXG5leHBvcnRzLmhhbmRsZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgZWxlbWVudCwgZXJyb3Ipe1xuXHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRleHBvcnRzLnNldEZvcm1FcnJvcnMoZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byBcIiArIG1lc3NhZ2UgKyBcIjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvL2hpZGUgc3Bpbm5pbmcgaWNvblxuXHRpZihlbGVtZW50Lmxlbmd0aCA+IDApe1xuXHRcdCQoZWxlbWVudCArICdTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=