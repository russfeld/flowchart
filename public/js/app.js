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

	window.Echo = new Echo({
		broadcaster: 'pusher',
		key: window.pusherKey,
		cluster: window.pusherCluster
	});

	window.Echo.connector.pusher.connection.bind('connected', function () {
		//when connected, disable the spinner
		$('#groupSpin').addClass('hide-spin');
	});

	window.Echo.channel('groupsession').listen('GroupsessionRegister', function (e) {
		console.log(e.id);
	});

	window.Echo.channel('groupsessionend').listen('GroupsessionEnd', function (e) {
		console.log(e.id);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzcz82ZDEwIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJBcHAiLCJhY3Rpb25zIiwiaW5kZXgiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJnZXRJbmRleCIsImNhbGVuZGFyIiwiaW5pdCIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJlZGl0YWJsZSIsImdldExpc3QiLCJncm91cHNlc3Npb24iLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiY29udHJvbGxlciIsImFjdGlvbiIsIndpbmRvdyIsIl8iLCIkIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJjb250ZW50IiwiY29uc29sZSIsImVycm9yIiwibW9tZW50Iiwic2l0ZSIsImV4cG9ydHMiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidXJsIiwidHlwZSIsImFsZXJ0IiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsImV2ZW50IiwicmVuZGVyaW5nIiwidGltZUZvcm1hdCIsImRhdGVQaWNrZXJEYXRhIiwiZGF5c09mV2Vla0Rpc2FibGVkIiwiZm9ybWF0Iiwic3RlcHBpbmciLCJlbmFibGVkSG91cnMiLCJtYXhIb3VyIiwic2lkZUJ5U2lkZSIsImlnbm9yZVJlYWRvbmx5IiwiYWxsb3dJbnB1dFRvZ2dsZSIsImRhdGVQaWNrZXJEYXRlT25seSIsImNoZWNrTWVzc2FnZSIsImFkdmlzb3IiLCJub2JpbmQiLCJ2YWwiLCJ0cmltIiwiZGF0YSIsImlkIiwid2lkdGgiLCJvbiIsImZvY3VzIiwicHJvcCIsInJlbW92ZUNsYXNzIiwic2hvdyIsInJlc2V0Rm9ybSIsImJpbmQiLCJuZXdTdHVkZW50IiwiaGlkZSIsImZpbmQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzdHVkZW50X2lkIiwic2hvd01lZXRpbmdGb3JtIiwicmVwZWF0IiwiYmxhY2tvdXRTZXJpZXMiLCJtb2RhbCIsInNlbGVjdCIsImNoYW5nZSIsInJlcGVhdENoYW5nZSIsInNhdmVCbGFja291dCIsImRlbGV0ZUJsYWNrb3V0IiwiYmxhY2tvdXRPY2N1cnJlbmNlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwiYXBwZW5kIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiY2hvaWNlIiwiY29uZmlybSIsImRlc2MiLCJzdGF0dXMiLCJtZWV0aW5naWQiLCJzdHVkZW50aWQiLCJkdXJhdGlvbk9wdGlvbnMiLCJ1bmRlZmluZWQiLCJob3VyIiwibWludXRlIiwiY2xlYXJGb3JtRXJyb3JzIiwiZW1wdHkiLCJtaW51dGVzIiwiZGlmZiIsImVsZW0xIiwiZWxlbTIiLCJkdXJhdGlvbiIsImUiLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZ2V0Iiwib2ZmIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJ0cmlnZ2VyIiwiYmxhY2tvdXRfaWQiLCJyZXBlYXRfdHlwZSIsInJlcGVhdF9ldmVyeSIsInJlcGVhdF91bnRpbCIsInJlcGVhdF9kZXRhaWwiLCJTdHJpbmciLCJpbmRleE9mIiwiZWlkIiwicHJvbXB0IiwiY2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInN1bW1lcm5vdGUiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIiwibG9jYXRpb24iLCJyZWxvYWQiLCJWdWUiLCJFY2hvIiwiUHVzaGVyIiwiaW9uIiwic291bmQiLCJzb3VuZHMiLCJuYW1lIiwidm9sdW1lIiwicGF0aCIsInByZWxvYWQiLCJ1c2VySUQiLCJwYXJzZUludCIsImdyb3VwUmVnaXN0ZXJCdG4iLCJncm91cERpc2FibGVCdG4iLCJ2bSIsImVsIiwicXVldWUiLCJtZXRob2RzIiwiZ2V0Q2xhc3MiLCJzIiwidXNlcmlkIiwidGFrZVN0dWRlbnQiLCJnaWQiLCJjdXJyZW50VGFyZ2V0IiwiZGF0YXNldCIsImFqYXhQb3N0IiwicHV0U3R1ZGVudCIsImRvbmVTdHVkZW50IiwiZGVsU3R1ZGVudCIsImNvbmNhdCIsImNoZWNrQnV0dG9ucyIsImluaXRpYWxDaGVja0RpbmciLCJzb3J0Iiwic29ydEZ1bmN0aW9uIiwiYnJvYWRjYXN0ZXIiLCJrZXkiLCJwdXNoZXJLZXkiLCJjbHVzdGVyIiwicHVzaGVyQ2x1c3RlciIsImNvbm5lY3RvciIsInB1c2hlciIsImNvbm5lY3Rpb24iLCJjaGFubmVsIiwibGlzdGVuIiwibG9nIiwiZmlsdGVyIiwiY29tcG9uZW50IiwicHJvcHMiLCJ0ZW1wbGF0ZSIsImRpc2FibGVCdXR0b24iLCJyZWFsbHkiLCJhdHRyIiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJsZW4iLCJsZW5ndGgiLCJmb3VuZE1lIiwiaSIsImNoZWNrRGluZyIsInBlcnNvbiIsInBsYXkiLCJhIiwiYiIsImZpcnN0X25hbWUiLCJsYXN0X25hbWUiLCJGb3JtRGF0YSIsImZpbGVzIiwiaW5wdXQiLCJudW1GaWxlcyIsImxhYmVsIiwicmVwbGFjZSIsInBhcmVudHMiLCJtZXNzYWdlIiwiaHRtbCIsInNldFRpbWVvdXQiLCJzZXRGb3JtRXJyb3JzIiwianNvbiIsImpvaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBLG1CQUFBQSxDQUFRLEdBQVI7O0FBRUEsSUFBSUMsTUFBTTs7QUFFVDtBQUNBQyxVQUFTO0FBQ1I7QUFDQUMsU0FBTztBQUNOQSxVQUFPLGlCQUFXO0FBQ2pCO0FBQ0E7QUFISyxHQUZDOztBQVFSO0FBQ0FDLHNCQUFvQjtBQUNuQjtBQUNBQyxhQUFVLG9CQUFXO0FBQ3BCLFFBQUlDLFdBQVcsbUJBQUFOLENBQVEsR0FBUixDQUFmO0FBQ0FNLGFBQVNDLElBQVQ7QUFDQTtBQUxrQixHQVRaOztBQWlCUjtBQUNFQywwQkFBd0I7QUFDekI7QUFDR0gsYUFBVSxvQkFBVztBQUNuQixRQUFJSSxXQUFXLG1CQUFBVCxDQUFRLEdBQVIsQ0FBZjtBQUNKUyxhQUFTRixJQUFUO0FBQ0csSUFMcUI7QUFNekJHLFlBQVMsbUJBQVc7QUFDbkIsUUFBSUMsZUFBZSxtQkFBQVgsQ0FBUSxHQUFSLENBQW5CO0FBQ0FXLGlCQUFhSixJQUFiO0FBQ0E7QUFUd0IsR0FsQmxCOztBQThCUjtBQUNBSyxzQkFBb0I7QUFDbkI7QUFDQVAsYUFBVSxvQkFBVztBQUNwQixRQUFJUSxVQUFVLG1CQUFBYixDQUFRLEdBQVIsQ0FBZDtBQUNBYSxZQUFRTixJQUFSO0FBQ0E7QUFMa0I7QUEvQlosRUFIQTs7QUEyQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQUEsT0FBTSxjQUFTTyxVQUFU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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNB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bEcsSUFBRSxNQUFNK08sR0FBTixHQUFZLE1BQWQsRUFBc0JoSyxJQUF0QixDQUEyQmMsTUFBTThMLElBQU4sQ0FBVyxHQUFYLENBQTNCO0FBQ0EsRUFIRDtBQUlBLENBTkQ7O0FBUUE7OztBQUdBN1EsUUFBUTZDLFlBQVIsR0FBdUIsWUFBVTtBQUNoQyxLQUFHM0QsRUFBRSxnQkFBRixFQUFvQnFRLE1BQXZCLEVBQThCO0FBQzdCLE1BQUlpQixVQUFVdFIsRUFBRSxnQkFBRixFQUFvQjhELEdBQXBCLEVBQWQ7QUFDQSxNQUFJdkIsT0FBT3ZDLEVBQUUscUJBQUYsRUFBeUI4RCxHQUF6QixFQUFYO0FBQ0FoRCxVQUFROEcsY0FBUixDQUF1QjBKLE9BQXZCLEVBQWdDL08sSUFBaEM7QUFDQTtBQUNELENBTkQ7O0FBUUE7Ozs7Ozs7QUFPQXpCLFFBQVFtSCxXQUFSLEdBQXNCLFVBQVNxSixPQUFULEVBQWtCckwsT0FBbEIsRUFBMkJ0RixLQUEzQixFQUFpQztBQUN0RCxLQUFHQSxNQUFNOEUsUUFBVCxFQUFrQjtBQUNqQjtBQUNBLE1BQUc5RSxNQUFNOEUsUUFBTixDQUFlK0MsTUFBZixJQUF5QixHQUE1QixFQUFnQztBQUMvQjFILFdBQVEyUSxhQUFSLENBQXNCOVEsTUFBTThFLFFBQU4sQ0FBZXpCLElBQXJDO0FBQ0EsR0FGRCxNQUVLO0FBQ0p4QixTQUFNLGVBQWU4TyxPQUFmLEdBQXlCLElBQXpCLEdBQWdDM1EsTUFBTThFLFFBQU4sQ0FBZXpCLElBQXJEO0FBQ0E7QUFDRDs7QUFFRDtBQUNBLEtBQUdpQyxRQUFRb0ssTUFBUixHQUFpQixDQUFwQixFQUFzQjtBQUNyQnJRLElBQUVpRyxVQUFVLE1BQVosRUFBb0JDLFFBQXBCLENBQTZCLFdBQTdCO0FBQ0E7QUFDRCxDQWRELEMiLCJmaWxlIjoiL2pzL2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzLzUuNC9taXgjd29ya2luZy13aXRoLXNjcmlwdHNcbi8vaHR0cHM6Ly9hbmR5LWNhcnRlci5jb20vYmxvZy9zY29waW5nLWphdmFzY3JpcHQtZnVuY3Rpb25hbGl0eS10by1zcGVjaWZpYy1wYWdlcy13aXRoLWxhcmF2ZWwtYW5kLWNha2VwaHBcblxuLy9Mb2FkIHNpdGUtd2lkZSBsaWJyYXJpZXMgaW4gYm9vdHN0cmFwIGZpbGVcbnJlcXVpcmUoJy4vYm9vdHN0cmFwJyk7XG5cbnZhciBBcHAgPSB7XG5cblx0Ly8gQ29udHJvbGxlci1hY3Rpb24gbWV0aG9kc1xuXHRhY3Rpb25zOiB7XG5cdFx0Ly9JbmRleCBmb3IgZGlyZWN0bHkgY3JlYXRlZCB2aWV3cyB3aXRoIG5vIGV4cGxpY2l0IGNvbnRyb2xsZXJcblx0XHRpbmRleDoge1xuXHRcdFx0aW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvL25vIGRlZmF1bHQgamF2YXNjcmlwdHMgb24gaG9tZSBwYWdlcz9cblx0XHRcdH0sXG4gICAgfSxcblxuXHRcdC8vQWR2aXNpbmcgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZHZpc2luZ1xuXHRcdEFkdmlzaW5nQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZHZpc2luZy9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY2FsZW5kYXIgPSByZXF1aXJlKCcuL3BhZ2VzL2NhbGVuZGFyJyk7XG5cdFx0XHRcdGNhbGVuZGFyLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9Hcm91cHNlc3Npb24gQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9ncm91cHNlc3Npb25cbiAgICBHcm91cHNlc3Npb25Db250cm9sbGVyOiB7XG5cdFx0XHQvL2dyb3Vwc2Vzc2lvbi9pbmRleFxuICAgICAgZ2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuICAgICAgfSxcblx0XHRcdGdldExpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uID0gcmVxdWlyZSgnLi9wYWdlcy9ncm91cHNlc3Npb24nKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdC8vUHJvZmlsZXMgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9wcm9maWxlXG5cdFx0UHJvZmlsZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL3Byb2ZpbGUvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHByb2ZpbGUgPSByZXF1aXJlKCcuL3BhZ2VzL3Byb2ZpbGUnKTtcblx0XHRcdFx0cHJvZmlsZS5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3aW5kb3cuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgalF1ZXJ5IGFuZCB0aGUgQm9vdHN0cmFwIGpRdWVyeSBwbHVnaW4gd2hpY2ggcHJvdmlkZXMgc3VwcG9ydFxuICogZm9yIEphdmFTY3JpcHQgYmFzZWQgQm9vdHN0cmFwIGZlYXR1cmVzIHN1Y2ggYXMgbW9kYWxzIGFuZCB0YWJzLiBUaGlzXG4gKiBjb2RlIG1heSBiZSBtb2RpZmllZCB0byBmaXQgdGhlIHNwZWNpZmljIG5lZWRzIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKi9cblxud2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgdGhlIGF4aW9zIEhUVFAgbGlicmFyeSB3aGljaCBhbGxvd3MgdXMgdG8gZWFzaWx5IGlzc3VlIHJlcXVlc3RzXG4gKiB0byBvdXIgTGFyYXZlbCBiYWNrLWVuZC4gVGhpcyBsaWJyYXJ5IGF1dG9tYXRpY2FsbHkgaGFuZGxlcyBzZW5kaW5nIHRoZVxuICogQ1NSRiB0b2tlbiBhcyBhIGhlYWRlciBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIFwiWFNSRlwiIHRva2VuIGNvb2tpZS5cbiAqL1xuXG53aW5kb3cuYXhpb3MgPSByZXF1aXJlKCdheGlvcycpO1xuXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9yYXBwYXNvZnQvbGFyYXZlbC01LWJvaWxlcnBsYXRlL2Jsb2IvbWFzdGVyL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzXG53aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbi8qKlxuICogTmV4dCB3ZSB3aWxsIHJlZ2lzdGVyIHRoZSBDU1JGIFRva2VuIGFzIGEgY29tbW9uIGhlYWRlciB3aXRoIEF4aW9zIHNvIHRoYXRcbiAqIGFsbCBvdXRnb2luZyBIVFRQIHJlcXVlc3RzIGF1dG9tYXRpY2FsbHkgaGF2ZSBpdCBhdHRhY2hlZC4gVGhpcyBpcyBqdXN0XG4gKiBhIHNpbXBsZSBjb252ZW5pZW5jZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGF0dGFjaCBldmVyeSB0b2tlbiBtYW51YWxseS5cbiAqL1xuXG5sZXQgdG9rZW4gPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKTtcblxuaWYgKHRva2VuKSB7XG4gICAgd2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUNTUkYtVE9LRU4nXSA9IHRva2VuLmNvbnRlbnQ7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NTUkYgdG9rZW4gbm90IGZvdW5kOiBodHRwczovL2xhcmF2ZWwuY29tL2RvY3MvY3NyZiNjc3JmLXgtY3NyZi10b2tlbicpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCIvL2xvYWQgcmVxdWlyZWQgSlMgbGlicmFyaWVzXG5yZXF1aXJlKCdmdWxsY2FsZW5kYXInKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcbnZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdlb25hc2Rhbi1ib290c3RyYXAtZGF0ZXRpbWVwaWNrZXItcnVzc2ZlbGQnKTtcblxuLy9TZXNzaW9uIGZvciBzdG9yaW5nIGRhdGEgYmV0d2VlbiBmb3Jtc1xuZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblxuLy9JRCBvZiB0aGUgY3VycmVudGx5IGxvYWRlZCBjYWxlbmRhcidzIGFkdmlzb3JcbmV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAtMTtcblxuLy9TdHVkZW50J3MgTmFtZSBzZXQgYnkgaW5pdFxuZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gXCJcIjtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuZXhwb3J0cy5jYWxlbmRhckRhdGEgPSB7XG5cdGhlYWRlcjoge1xuXHRcdGxlZnQ6ICdwcmV2LG5leHQgdG9kYXknLFxuXHRcdGNlbnRlcjogJ3RpdGxlJyxcblx0XHRyaWdodDogJ2FnZW5kYVdlZWssYWdlbmRhRGF5J1xuXHR9LFxuXHRlZGl0YWJsZTogZmFsc2UsXG5cdGV2ZW50TGltaXQ6IHRydWUsXG5cdGhlaWdodDogJ2F1dG8nLFxuXHR3ZWVrZW5kczogZmFsc2UsXG5cdGJ1c2luZXNzSG91cnM6IHtcblx0XHRzdGFydDogJzg6MDAnLCAvLyBhIHN0YXJ0IHRpbWUgKDEwYW0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGVuZDogJzE3OjAwJywgLy8gYW4gZW5kIHRpbWUgKDZwbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZG93OiBbIDEsIDIsIDMsIDQsIDUgXVxuXHR9LFxuXHRkZWZhdWx0VmlldzogJ2FnZW5kYVdlZWsnLFxuXHR2aWV3czoge1xuXHRcdGFnZW5kYToge1xuXHRcdFx0YWxsRGF5U2xvdDogZmFsc2UsXG5cdFx0XHRzbG90RHVyYXRpb246ICcwMDoyMDowMCcsXG5cdFx0XHRtaW5UaW1lOiAnMDg6MDA6MDAnLFxuXHRcdFx0bWF4VGltZTogJzE3OjAwOjAwJ1xuXHRcdH1cblx0fSxcblx0ZXZlbnRTb3VyY2VzOiBbXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL21lZXRpbmdmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgbWVldGluZyBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnIzUxMjg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICd3aGl0ZScsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvYmxhY2tvdXRmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgYmxhY2tvdXQgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyNGRjg4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnYmxhY2snLFxuXHRcdH0sXG5cdF0sXG5cdHNlbGVjdGFibGU6IHRydWUsXG5cdHNlbGVjdEhlbHBlcjogdHJ1ZSxcblx0c2VsZWN0T3ZlcmxhcDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRyZXR1cm4gZXZlbnQucmVuZGVyaW5nID09PSAnYmFja2dyb3VuZCc7XG5cdH0sXG5cdHRpbWVGb3JtYXQ6ICcgJyxcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlXG5leHBvcnRzLmRhdGVQaWNrZXJEYXRhID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ0xMTCcsXG5cdFx0c3RlcHBpbmc6IDIwLFxuXHRcdGVuYWJsZWRIb3VyczogWzgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxN10sXG5cdFx0bWF4SG91cjogMTcsXG5cdFx0c2lkZUJ5U2lkZTogdHJ1ZSxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZSBkYXkgb25seVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTU0vREQvWVlZWScsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLyoqXG4gKiBJbml0aWFsemF0aW9uIGZ1bmN0aW9uIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gYWR2aXNvciAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgdXNlciBpcyBhbiBhZHZpc29yXG4gKiBAcGFyYW0gbm9iaW5kIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSBidXR0b25zIHNob3VsZCBub3QgYmUgYm91bmQgKG1ha2UgY2FsZW5kYXIgcmVhZC1vbmx5KVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vQ2hlY2sgZm9yIG1lc3NhZ2VzIGluIHRoZSBzZXNzaW9uIGZyb20gYSBwcmV2aW91cyBhY3Rpb25cblx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuXHQvL3R3ZWFrIHBhcmFtZXRlcnNcblx0d2luZG93LmFkdmlzb3IgfHwgKHdpbmRvdy5hZHZpc29yID0gZmFsc2UpO1xuXHR3aW5kb3cubm9iaW5kIHx8ICh3aW5kb3cubm9iaW5kID0gZmFsc2UpO1xuXG5cdC8vZ2V0IHRoZSBjdXJyZW50IGFkdmlzb3IncyBJRFxuXHRleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gJCgnI2NhbGVuZGFyQWR2aXNvcklEJykudmFsKCkudHJpbSgpO1xuXG5cdC8vU2V0IHRoZSBhZHZpc29yIGluZm9ybWF0aW9uIGZvciBtZWV0aW5nIGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMF0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9TZXQgdGhlIGFkdnNpb3IgaW5mb3JhbXRpb24gZm9yIGJsYWNrb3V0IGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9pZiB0aGUgd2luZG93IGlzIHNtYWxsLCBzZXQgZGlmZmVyZW50IGRlZmF1bHQgZm9yIGNhbGVuZGFyXG5cdGlmKCQod2luZG93KS53aWR0aCgpIDwgNjAwKXtcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5kZWZhdWx0VmlldyA9ICdhZ2VuZGFEYXknO1xuXHR9XG5cblx0Ly9JZiBub2JpbmQsIGRvbid0IGJpbmQgdGhlIGZvcm1zXG5cdGlmKCF3aW5kb3cubm9iaW5kKXtcblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgYW4gYWR2aXNvciwgYmluZCBtb3JlIGRhdGFcblx0XHRpZih3aW5kb3cuYWR2aXNvcil7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyN0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0X3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI2VuZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI2VuZF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5zaG93KCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2Jykuc2hvdygpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuXHRcdFx0Ly9iaW5kIG1ldGhvZHMgZm9yIGJ1dHRvbnMgYW5kIGZvcm1zXG5cdFx0XHQkKCcjbmV3U3R1ZGVudEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgbmV3U3R1ZGVudCk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2J0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRcdFx0ICAgICQodGhpcykuZmluZCgnLmhhcy1lcnJvcicpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS50ZXh0KCcnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vYmluZCBhdXRvY29tcGxldGUgZmllbGRcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5hdXRvY29tcGxldGUoe1xuXHRcdFx0ICAgIHNlcnZpY2VVcmw6ICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcsXG5cdFx0XHQgICAgYWpheFNldHRpbmdzOiB7XG5cdFx0XHQgICAgXHRkYXRhVHlwZTogXCJqc29uXCJcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuXHRcdFx0ICAgICAgICAkKCcjc3R1ZGVudGlkdmFsJykudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHQgICAgICAgIHJldHVybiB7XG5cdFx0XHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0XHRcdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0XHRcdCAgICAgICAgICAgIH0pXG5cdFx0XHQgICAgICAgIH07XG5cdFx0XHQgICAgfVxuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjc3RhcnQnLCAnI2VuZCcsICcjZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNic3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjYmVuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNic3RhcnQnLCAnI2JlbmQnLCAnI2JkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JyZXBlYXR1bnRpbF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkpO1xuXG5cdFx0XHQvL2NoYW5nZSByZW5kZXJpbmcgb2YgZXZlbnRzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHRcdFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWNsaWNrYWJsZVwiKTtcblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdtJyl7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZCcpLnZhbChldmVudC5zdHVkZW50bmFtZSk7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdFx0ZXZlbnQ6IGV2ZW50XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZihldmVudC5yZXBlYXQgPT0gJzAnKXtcblx0XHRcdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0XHRcdGVuZDogZW5kXG5cdFx0XHRcdH07XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdH07XG5cblx0XHRcdC8vYmluZCBtb3JlIGJ1dHRvbnNcblx0XHRcdCQoJyNicmVwZWF0JykuY2hhbmdlKHJlcGVhdENoYW5nZSk7XG5cblx0XHRcdCQoJyNzYXZlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVCbGFja291dCk7XG5cblx0XHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRTZXJpZXMnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0T2NjdXJyZW5jZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRPY2N1cnJlbmNlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2FkdmlzaW5nQnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZU1lZXRpbmdCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dEJ0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHR9KTtcblxuXG5cdFx0XHQkKCcjcmVzb2x2ZUJ1dHRvbicpLm9uKCdjbGljaycsIHJlc29sdmVDb25mbGljdHMpO1xuXG5cdFx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgbm90IGFuIGFkdmlzb3IsIGJpbmQgbGVzcyBkYXRhXG5cdFx0fWVsc2V7XG5cblx0XHRcdC8vR2V0IHRoZSBjdXJyZW50IHN0dWRlbnQncyBuYW1lXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSAkKCcjY2FsZW5kYXJTdHVkZW50TmFtZScpLnZhbCgpLnRyaW0oKTtcblxuXHRcdCAgLy9SZW5kZXIgYmxhY2tvdXRzIHRvIGJhY2tncm91bmRcblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG5cblx0XHQgIC8vV2hlbiByZW5kZXJpbmcsIHVzZSB0aGlzIGN1c3RvbSBmdW5jdGlvbiBmb3IgYmxhY2tvdXRzIGFuZCBzdHVkZW50IG1lZXRpbmdzXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0XHQgICAgfVxuXHRcdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHRcdCAgICB9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1VzZSB0aGlzIG1ldGhvZCBmb3IgY2xpY2tpbmcgb24gbWVldGluZ3Ncblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHRcdFx0XHRpZihldmVudC5zdGFydC5pc0FmdGVyKG1vbWVudCgpKSl7XG5cdFx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoXCJZb3UgY2Fubm90IGVkaXQgbWVldGluZ3MgaW4gdGhlIHBhc3RcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1doZW4gc2VsZWN0aW5nIG5ldyBhcmVhcywgdXNlIHRoZSBzdHVkZW50U2VsZWN0IG1ldGhvZCBpbiB0aGUgY2FsZW5kYXIgbGlicmFyeVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gc3R1ZGVudFNlbGVjdDtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2Rlc2MnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKFwiI2VuZFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNlbmRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnLm1vZGFsJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cdFx0fVxuXG5cdFx0Ly9CaW5kIGNsaWNrIGhhbmRsZXJzIG9uIHRoZSBmb3JtXG5cdFx0JCgnI3NhdmVCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVNZWV0aW5nKTtcblx0XHQkKCcjZGVsZXRlQnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVNZWV0aW5nKTtcblx0XHQkKCcjZHVyYXRpb24nKS5vbignY2hhbmdlJywgY2hhbmdlRHVyYXRpb24pO1xuXG5cdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMgd2l0aCBubyBiaW5kaW5nXG5cdH1lbHNle1xuXHRcdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMsIHNldCByZW5kZXJpbmcgdG8gYmFja2dyb3VuZFxuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0ICAgIH1cblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHQgICAgfVxuXHRcdH07XG5cdH1cblxuXHQvL2luaXRhbGl6ZSB0aGUgY2FsZW5kYXIhXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcihleHBvcnRzLmNhbGVuZGFyRGF0YSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgY2FsZW5kYXIgYnkgY2xvc2luZyBtb2RhbHMgYW5kIHJlbG9hZGluZyBkYXRhXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGZvcm0gdG8gaGlkZSAoYW5kIHRoZSBzcGluKVxuICogQHBhcmFtIHJlcG9uc2UgLSB0aGUgQXhpb3MgcmVwc29uc2Ugb2JqZWN0IHJlY2VpdmVkXG4gKi9cbnZhciByZXNldENhbGVuZGFyID0gZnVuY3Rpb24oZWxlbWVudCwgcmVzcG9uc2Upe1xuXHQvL2hpZGUgdGhlIGZvcm1cblx0JChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vZGlzcGxheSB0aGUgbWVzc2FnZSB0byB0aGUgdXNlclxuXHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHQvL3JlZnJlc2ggdGhlIGNhbGVuZGFyXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdCQoZWxlbWVudCArICdTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdGlmKHdpbmRvdy5hZHZpc29yKXtcblx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBSkFYIG1ldGhvZCB0byBzYXZlIGRhdGEgZnJvbSBhIGZvcm1cbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBzb3VyY2UgZWxlbWVudCBvZiB0aGUgZGF0YVxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFNhdmUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbil7XG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdCAgLy9pZiByZXNwb25zZSBpcyAyeHhcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHR9KVxuXHRcdC8vaWYgcmVzcG9uc2UgaXMgbm90IDJ4eFxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdH0pO1xufVxuXG52YXIgYWpheERlbGV0ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uLCBub1Jlc2V0LCBub0Nob2ljZSl7XG5cdC8vY2hlY2sgbm9SZXNldCB2YXJpYWJsZVxuXHRub1Jlc2V0IHx8IChub1Jlc2V0ID0gZmFsc2UpO1xuXHRub0Nob2ljZSB8fCAobm9DaG9pY2UgPSBmYWxzZSk7XG5cblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGNvbmZpcm1hdGlvblxuXHRpZighbm9DaG9pY2Upe1xuXHRcdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0fWVsc2V7XG5cdFx0dmFyIGNob2ljZSA9IHRydWU7XG5cdH1cblxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXG5cdFx0Ly9pZiBjb25maXJtZWQsIHNob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoZWxlbWVudCArICdTcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9tYWtlIEFKQVggcmVxdWVzdCB0byBkZWxldGVcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKG5vUmVzZXQpe1xuXHRcdFx0XHRcdC8vaGlkZSBwYXJlbnQgZWxlbWVudCAtIFRPRE8gVEVTVE1FXG5cdFx0XHRcdFx0Ly9jYWxsZXIucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCArICdTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgYSBtZWV0aW5nXG4gKi9cbnZhciBzYXZlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVFdmVudFNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRzdGFydDogbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHRlbmQ6IG1vbWVudCgkKCcjZW5kJykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdHRpdGxlOiAkKCcjdGl0bGUnKS52YWwoKSxcblx0XHRkZXNjOiAkKCcjZGVzYycpLnZhbCgpLFxuXHRcdHN0YXR1czogJCgnI3N0YXR1cycpLnZhbCgpXG5cdH07XG5cdGRhdGEuaWQgPSBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEO1xuXHRpZigkKCcjbWVldGluZ0lEJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLm1lZXRpbmdpZCA9ICQoJyNtZWV0aW5nSUQnKS52YWwoKTtcblx0fVxuXHRpZigkKCcjc3R1ZGVudGlkdmFsJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLnN0dWRlbnRpZCA9ICQoJyNzdHVkZW50aWR2YWwnKS52YWwoKTtcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9jcmVhdGVtZWV0aW5nJztcblxuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ3NhdmUgbWVldGluZycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYSBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIHVybFxuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6ICQoJyNtZWV0aW5nSUQnKS52YWwoKVxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ2RlbGV0ZSBtZWV0aW5nJywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3B1bGF0ZSBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBlZGl0aW5nXG4gKlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIGVkaXRcbiAqL1xudmFyIHNob3dNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGV2ZW50KXtcblx0JCgnI3RpdGxlJykudmFsKGV2ZW50LnRpdGxlKTtcblx0JCgnI3N0YXJ0JykudmFsKGV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNlbmQnKS52YWwoZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNkZXNjJykudmFsKGV2ZW50LmRlc2MpO1xuXHRkdXJhdGlvbk9wdGlvbnMoZXZlbnQuc3RhcnQsIGV2ZW50LmVuZCk7XG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoZXZlbnQuaWQpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHQkKCcjc3RhdHVzJykudmFsKGV2ZW50LnN0YXR1cyk7XG5cdCQoJyNkZWxldGVCdXR0b24nKS5zaG93KCk7XG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGNyZWF0aW9uXG4gKlxuICogQHBhcmFtIGNhbGVuZGFyU3R1ZGVudE5hbWUgLSBzdHJpbmcgbmFtZSBvZiB0aGUgc3R1ZGVudFxuICovXG52YXIgY3JlYXRlTWVldGluZ0Zvcm0gPSBmdW5jdGlvbihjYWxlbmRhclN0dWRlbnROYW1lKXtcblxuXHQvL3BvcHVsYXRlIHRoZSB0aXRsZSBhdXRvbWF0aWNhbGx5IGZvciBhIHN0dWRlbnRcblx0aWYoY2FsZW5kYXJTdHVkZW50TmFtZSAhPT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjdGl0bGUnKS52YWwoY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1lbHNle1xuXHRcdCQoJyN0aXRsZScpLnZhbCgnJyk7XG5cdH1cblxuXHQvL1NldCBzdGFydCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI3N0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBlbmQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2VuZCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBkdXJhdGlvbiBvcHRpb25zXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKSwgbW9tZW50KCkuaG91cig4KS5taW51dGUoMjApKTtcblx0fWVsc2V7XG5cdFx0ZHVyYXRpb25PcHRpb25zKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LCBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQpO1xuXHR9XG5cblx0Ly9SZXNldCBvdGhlciBvcHRpb25zXG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHQvL0hpZGUgZGVsZXRlIGJ1dHRvblxuXHQkKCcjZGVsZXRlQnV0dG9uJykuaGlkZSgpO1xuXG5cdC8vU2hvdyB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIG9uIHRoaXMgcGFnZVxuICovXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgJCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2V0IGR1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBtZWV0aW5nIGZvcm1cbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lXG4gKiBAcGFyYW0gZW5kIC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kaW5nIHRpbWVcbiAqL1xudmFyIGR1cmF0aW9uT3B0aW9ucyA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuXHQvL2NsZWFyIHRoZSBsaXN0XG5cdCQoJyNkdXJhdGlvbicpLmVtcHR5KCk7XG5cblx0Ly9hc3N1bWUgYWxsIG1lZXRpbmdzIGhhdmUgcm9vbSBmb3IgMjAgbWludXRlc1xuXHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPScyMCc+MjAgbWludXRlczwvb3B0aW9uPlwiKTtcblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDoyMCwgYWxsb3cgNDAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMjApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc0MCc+NDAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjAwLCBhbGxvdyA2MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNjAnPjYwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL3NldCBkZWZhdWx0IHZhbHVlIGJhc2VkIG9uIGdpdmVuIHNwYW5cblx0JCgnI2R1cmF0aW9uJykudmFsKGVuZC5kaWZmKHN0YXJ0LCBcIm1pbnV0ZXNcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsaW5rIHRoZSBkYXRlcGlja2VycyB0b2dldGhlclxuICpcbiAqIEBwYXJhbSBlbGVtMSAtIGpRdWVyeSBvYmplY3QgZm9yIGZpcnN0IGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBlbGVtMiAtIGpRdWVyeSBvYmplY3QgZm9yIHNlY29uZCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgbGlua0RhdGVQaWNrZXJzID0gZnVuY3Rpb24oZWxlbTEsIGVsZW0yLCBkdXJhdGlvbil7XG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIGZpcnN0IGRhdGFwaWNrZXJcblx0JChlbGVtMSArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTIgPSBtb21lbnQoJChlbGVtMikudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNBZnRlcihkYXRlMikgfHwgZS5kYXRlLmlzU2FtZShkYXRlMikpe1xuXHRcdFx0ZGF0ZTIgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTIpLnZhbChkYXRlMi5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gc2Vjb25kIGRhdGVwaWNrZXJcblx0JChlbGVtMiArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTEgPSBtb21lbnQoJChlbGVtMSkudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNCZWZvcmUoZGF0ZTEpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTEpKXtcblx0XHRcdGRhdGUxID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0xKS52YWwoZGF0ZTEuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBjaGFuZ2VEdXJhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdHZhciBuZXdEYXRlID0gbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCAnTExMJykuYWRkKCQodGhpcykudmFsKCksIFwibWludXRlc1wiKTtcblx0JCgnI2VuZCcpLnZhbChuZXdEYXRlLmZvcm1hdChcIkxMTFwiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZlcmlmeSB0aGF0IHRoZSBzdHVkZW50cyBhcmUgc2VsZWN0aW5nIG1lZXRpbmdzIHRoYXQgYXJlbid0IHRvbyBsb25nXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBtZWV0aW5nXG4gKiBAcGFyYW0gZW5kIC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZCBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgc3R1ZGVudFNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblxuXHQvL1doZW4gc3R1ZGVudHMgc2VsZWN0IGEgbWVldGluZywgZGlmZiB0aGUgc3RhcnQgYW5kIGVuZCB0aW1lc1xuXHRpZihlbmQuZGlmZihzdGFydCwgJ21pbnV0ZXMnKSA+IDYwKXtcblxuXHRcdC8vaWYgaW52YWxpZCwgdW5zZWxlY3QgYW5kIHNob3cgYW4gZXJyb3Jcblx0XHRhbGVydChcIk1lZXRpbmdzIGNhbm5vdCBsYXN0IGxvbmdlciB0aGFuIDEgaG91clwiKTtcblx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdH1lbHNle1xuXG5cdFx0Ly9pZiB2YWxpZCwgc2V0IGRhdGEgaW4gdGhlIHNlc3Npb24gYW5kIHNob3cgdGhlIGZvcm1cblx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdGVuZDogZW5kXG5cdFx0fTtcblx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRjcmVhdGVNZWV0aW5nRm9ybShleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9XG59O1xuXG4vKipcbiAqIExvYWQgY29uZmxpY3RpbmcgbWVldGluZ3MgZnJvbSB0aGUgc2VydmVyXG4gKi9cbnZhciBsb2FkQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblxuXHQvL3JlcXVlc3QgY29uZmxpY3RzIHZpYSBBSkFYXG5cdHdpbmRvdy5heGlvcy5nZXQoJy9hZHZpc2luZy9jb25mbGljdHMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0Ly9kaXNhYmxlIGV4aXN0aW5nIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDIwMCwgZGF0YSB3YXMgcmVjZWl2ZWRcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDApe1xuXG5cdFx0XHRcdC8vQXBwZW5kIEhUTUwgZm9yIGNvbmZsaWN0cyB0byBET01cblx0XHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJykuZW1wdHkoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0J2lkJyA6ICdyZXNvbHZlJyt2YWx1ZS5pZCxcblx0XHRcdFx0XHRcdCdjbGFzcyc6ICdtZWV0aW5nLWNvbmZsaWN0Jyxcblx0XHRcdFx0XHRcdCdodG1sJzogXHQnPHA+Jm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBwdWxsLXJpZ2h0IGRlbGV0ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnJm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgcHVsbC1yaWdodCBlZGl0Q29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5FZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+S2VlcCBNZWV0aW5nPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlJyt2YWx1ZS5pZCsnU3BpblwiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vUmUtcmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnNcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdFx0Ly9TaG93IHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuXHRcdCAgLy9JZiByZXNwb25zZSBpcyAyMDQsIG5vIGNvbmZsaWN0cyBhcmUgcHJlc2VudFxuXHRcdFx0fWVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwNCl7XG5cblx0XHRcdFx0Ly9IaWRlIHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9KTtcblxuXHRcdC8qXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHRtZXRob2Q6IFwiR0VUXCIsXG5cdFx0XHRcdHVybDogJy9hZHZpc2luZy9jb25mbGljdHMnLFxuXHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nXG5cdFx0XHR9KVxuXHRcdFx0LnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgbWVzc2FnZSwganFYSFIpIHtcblx0XHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cdFx0XHRcdGlmKGpxWEhSLnN0YXR1cyA9PSAyMDApe1xuXHRcdFx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpLmVtcHR5KCk7XG5cdFx0XHRcdFx0JC5lYWNoKGRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRcdFx0XHQkKCc8ZGl2Lz4nLCB7XG5cdFx0XHRcdFx0XHRcdCdjbGFzcyc6ICdtZWV0aW5nLWNvbmZsaWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRcdCdodG1sJzogXHQnPHA+Jm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBwdWxsLXJpZ2h0IGRlbGV0ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnJm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgcHVsbC1yaWdodCBlZGl0Q29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5FZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+S2VlcCBNZWV0aW5nPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlU3BpbicrdmFsdWUuaWQrJ1wiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHRcdH0pLmFwcGVuZFRvKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cdFx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1lbHNlIGlmIChqcVhIUi5zdGF0dXMgPT0gMjA0KXtcblx0XHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkuZmFpbChmdW5jdGlvbigganFYSFIsIG1lc3NhZ2UgKXtcblx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gcmV0cmlldmUgY29uZmxpY3RpbmcgbWVldGluZ3M6IFwiICsganFYSFIucmVzcG9uc2VKU09OKTtcblx0XHRcdH0pO1xuXHRcdCovXG59XG5cbi8qKlxuICogU2F2ZSBibGFja291dHMgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgc2F2ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUJsYWNrb3V0U3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgdXJsO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRic3RhcnQ6IG1vbWVudCgkKCcjYnN0YXJ0JykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRiZW5kOiBtb21lbnQoJCgnI2JlbmQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJ0aXRsZTogJCgnI2J0aXRsZScpLnZhbCgpXG5cdH07XG5cdHZhciB1cmw7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEuYmJsYWNrb3V0ZXZlbnRpZCA9ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCk7XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXQnO1xuXHRcdGlmKCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpID4gMCl7XG5cdFx0XHRkYXRhLmJibGFja291dGlkID0gJCgnI2JibGFja291dGlkJykudmFsKCk7XG5cdFx0fVxuXHRcdGRhdGEuYnJlcGVhdCA9ICQoJyNicmVwZWF0JykudmFsKCk7XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAxKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5PSAkKCcjYnJlcGVhdGRhaWx5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAyKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5ID0gJCgnI2JyZXBlYXR3ZWVrbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzbSA9ICQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN0ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3cgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdSA9ICQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNmID0gJCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdzYXZlIGJsYWNrb3V0Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBibGFja291dCBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBkZWxldGVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBVUkwgYW5kIGRhdGEgb2JqZWN0XG5cdHZhciB1cmwsIGRhdGE7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGV2ZW50aWQ6ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgfTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0aWQ6ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpIH07XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ2RlbGV0ZSBibGFja291dCcsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBjaGFuZ2Ugb2YgcmVwZWF0IG9wdGlvbnMgb24gdGhlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIHJlcGVhdENoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQodGhpcykudmFsKCkgPT0gMCl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDEpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAyKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1cbn07XG5cbi8qKlxuICogU2hvdyB0aGUgcmVzb2x2ZSBjb25mbGljdHMgbW9kYWwgZm9ybVxuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZGVsZXRlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdC8vc2VuZCBBSkFYIGRlbGV0ZVxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAnZGVsZXRlIG1lZXRpbmcnLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBFZGl0IGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGVkaXRDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvbWVldGluZyc7XG5cblx0Ly9zaG93IHNwaW5uZXIgdG8gbG9hZCBtZWV0aW5nXG5cdCQoJyNyZXNvbHZlJysgaWQgKyAnU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2xvYWQgbWVldGluZyBhbmQgZGlzcGxheSBmb3JtXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNyZXNvbHZlJysgaWQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0ZXZlbnQgPSByZXNwb25zZS5kYXRhO1xuXHRcdFx0ZXZlbnQuc3RhcnQgPSBtb21lbnQoZXZlbnQuc3RhcnQpO1xuXHRcdFx0ZXZlbnQuZW5kID0gbW9tZW50KGV2ZW50LmVuZCk7XG5cdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIG1lZXRpbmcnLCAnI3Jlc29sdmUnICsgaWQsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogUmVzb2x2ZSBhIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIHJlc29sdmVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvcmVzb2x2ZWNvbmZsaWN0JztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAncmVzb2x2ZSBtZWV0aW5nJywgdHJ1ZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgY3JlYXRlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIGNyZWF0ZUJsYWNrb3V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNidGl0bGUnKS52YWwoXCJcIik7XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KCkuaG91cig5KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCQoJyNicmVwZWF0JykudmFsKDApO1xuXHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5oaWRlKCk7XG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIHRvIGEgc2luZ2xlIG9jY3VycmVuY2VcbiAqL1xudmFyIGJsYWNrb3V0T2NjdXJyZW5jZSA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vc2V0IGZvcm0gdmFsdWVzIGFuZCBoaWRlIHVubmVlZGVkIGZpZWxkc1xuXHQkKCcjYnRpdGxlJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnRpdGxlKTtcblx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI3JlcGVhdGRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZCk7XG5cdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmlkKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXG5cdC8vc2hvdyB0aGUgZm9ybVxuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgYmxhY2tvdXQgc2VyaWVzIGVkaXQgZm9ybVxuICovXG52YXIgYmxhY2tvdXRTZXJpZXMgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cbiBcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0aWQ6IGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvYmxhY2tvdXQnO1xuXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNidGl0bGUnKS52YWwocmVzcG9uc2UuZGF0YS50aXRsZSlcblx0IFx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnN0YXJ0LCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLmVuZCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwocmVzcG9uc2UuZGF0YS5pZCk7XG5cdCBcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHQgXHRcdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0IFx0XHRpZihyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDEpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXRkYWlseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fWVsc2UgaWYgKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMil7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdFx0XHRcdHZhciByZXBlYXRfZGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLmRhdGEucmVwZWF0X2RldGFpbCk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMlwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiM1wiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNFwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fVxuXHQgXHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblx0IFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGJsYWNrb3V0IHNlcmllcycsICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBzdHVkZW50IGluIHRoZSBkYXRhYmFzZVxuICovXG52YXIgbmV3U3R1ZGVudCA9IGZ1bmN0aW9uKCl7XG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBhbiBlSUQgdG8gYWRkIHRvIHRoZSBzeXN0ZW1cblx0dmFyIGVpZCA9IHByb21wdChcIkVudGVyIHRoZSBzdHVkZW50J3MgZUlEXCIpO1xuXG5cdC8vYnVpbGQgdGhlIFVSTCBhbmQgZGF0YVxuXHR2YXIgZGF0YSA9IHtcblx0XHRlaWQ6IGVpZCxcblx0fTtcblx0dmFyIHVybCA9ICcvcHJvZmlsZS9uZXdzdHVkZW50JztcblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRhbGVydChyZXNwb25zZS5kYXRhKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdFx0XHRpZihlcnJvci5yZXNwb25zZS5zdGF0dXMgPT0gNDIyKXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhW1wiZWlkXCJdKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwiLyoqXG4gKiBJbml0aWFsaXphdGlvbiBmdW5jdGlvbiBmb3IgZWRpdGFibGUgdGV4dC1ib3hlcyBvbiB0aGUgc2l0ZVxuICogTXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIC8vTG9hZCByZXF1aXJlZCBsaWJyYXJpZXNcbiAgcmVxdWlyZSgnY29kZW1pcnJvcicpO1xuICByZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xuICByZXF1aXJlKCdzdW1tZXJub3RlJyk7XG4gIHNpdGUgPSByZXF1aXJlKCcuL3NpdGUnKTtcblxuICAvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiAodXN1YWxseSBmcm9tIGEgcHJldmlvdXMgc3VjY2Vzc2Z1bCBzYXZlKVxuICBzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFtlZGl0XSBsaW5rc1xuICAkKCcuZWRpdGFibGUtbGluaycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vaGlkZSB0aGUgW2VkaXRdIGxpbmtzLCBlbmFibGUgZWRpdG9yLCBhbmQgc2hvdyBTYXZlIGFuZCBDYW5jZWwgYnV0dG9uc1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoe1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdG9vbGJhcjogW1xuICAgICAgICAgIC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuICAgICAgICAgIFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcbiAgICAgICAgICBbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG4gICAgICAgICAgWydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG4gICAgICAgICAgWydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG4gICAgICAgIF0sXG4gICAgICAgIHRhYnNpemU6IDIsXG4gICAgICAgIGNvZGVtaXJyb3I6IHtcbiAgICAgICAgICBtb2RlOiAndGV4dC9odG1sJyxcbiAgICAgICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ21vbm9rYWknXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgU2F2ZSBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1zYXZlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9EaXNwbGF5IHNwaW5uZXIgd2hpbGUgQUpBWCBjYWxsIGlzIHBlcmZvcm1lZFxuICAgICAgJCgnI2VkaXRhYmxlc3Bpbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuICAgICAgLy9HZXQgY29udGVudHMgb2YgZWRpdG9yXG4gICAgICB2YXIgaHRtbFN0cmluZyA9ICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2NvZGUnKTtcblxuICAgICAgLy9Qb3N0IGNvbnRlbnRzIHRvIHNlcnZlciwgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZWRpdGFibGUvc2F2ZS8nICsgaWQsIHtcbiAgICAgICAgY29udGVudHM6IGh0bWxTdHJpbmdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIC8vSWYgcmVzcG9uc2UgMjAwIHJlY2VpdmVkLCBhc3N1bWUgaXQgc2F2ZWQgYW5kIHJlbG9hZCBwYWdlXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChcIlVuYWJsZSB0byBzYXZlIGNvbnRlbnQ6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgQ2FuY2VsIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLWNhbmNlbCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vUmVzZXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IgYW5kIGRlc3Ryb3kgaXRcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ3Jlc2V0Jyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdkZXN0cm95Jyk7XG5cbiAgICAgIC8vSGlkZSBTYXZlIGFuZCBDYW5jZWwgYnV0dG9ucywgYW5kIHNob3cgW2VkaXRdIGxpbmtcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyIsIi8vIENvZGVNaXJyb3IsIGNvcHlyaWdodCAoYykgYnkgTWFyaWpuIEhhdmVyYmVrZSBhbmQgb3RoZXJzXG4vLyBEaXN0cmlidXRlZCB1bmRlciBhbiBNSVQgbGljZW5zZTogaHR0cDovL2NvZGVtaXJyb3IubmV0L0xJQ0VOU0VcblxuKGZ1bmN0aW9uKG1vZCkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpIC8vIENvbW1vbkpTXG4gICAgbW9kKHJlcXVpcmUoXCIuLi8uLi9saWIvY29kZW1pcnJvclwiKSk7XG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIC8vIEFNRFxuICAgIGRlZmluZShbXCIuLi8uLi9saWIvY29kZW1pcnJvclwiXSwgbW9kKTtcbiAgZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIG1vZChDb2RlTWlycm9yKTtcbn0pKGZ1bmN0aW9uKENvZGVNaXJyb3IpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaHRtbENvbmZpZyA9IHtcbiAgYXV0b1NlbGZDbG9zZXJzOiB7J2FyZWEnOiB0cnVlLCAnYmFzZSc6IHRydWUsICdicic6IHRydWUsICdjb2wnOiB0cnVlLCAnY29tbWFuZCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdlbWJlZCc6IHRydWUsICdmcmFtZSc6IHRydWUsICdocic6IHRydWUsICdpbWcnOiB0cnVlLCAnaW5wdXQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAna2V5Z2VuJzogdHJ1ZSwgJ2xpbmsnOiB0cnVlLCAnbWV0YSc6IHRydWUsICdwYXJhbSc6IHRydWUsICdzb3VyY2UnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAndHJhY2snOiB0cnVlLCAnd2JyJzogdHJ1ZSwgJ21lbnVpdGVtJzogdHJ1ZX0sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHsnZGQnOiB0cnVlLCAnbGknOiB0cnVlLCAnb3B0Z3JvdXAnOiB0cnVlLCAnb3B0aW9uJzogdHJ1ZSwgJ3AnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZSwgJ3Rib2R5JzogdHJ1ZSwgJ3RkJzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICd0aCc6IHRydWUsICd0cic6IHRydWV9LFxuICBjb250ZXh0R3JhYmJlcnM6IHtcbiAgICAnZGQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2R0JzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdsaSc6IHsnbGknOiB0cnVlfSxcbiAgICAnb3B0aW9uJzogeydvcHRpb24nOiB0cnVlLCAnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAnb3B0Z3JvdXAnOiB7J29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ3AnOiB7J2FkZHJlc3MnOiB0cnVlLCAnYXJ0aWNsZSc6IHRydWUsICdhc2lkZSc6IHRydWUsICdibG9ja3F1b3RlJzogdHJ1ZSwgJ2Rpcic6IHRydWUsXG4gICAgICAgICAgJ2Rpdic6IHRydWUsICdkbCc6IHRydWUsICdmaWVsZHNldCc6IHRydWUsICdmb290ZXInOiB0cnVlLCAnZm9ybSc6IHRydWUsXG4gICAgICAgICAgJ2gxJzogdHJ1ZSwgJ2gyJzogdHJ1ZSwgJ2gzJzogdHJ1ZSwgJ2g0JzogdHJ1ZSwgJ2g1JzogdHJ1ZSwgJ2g2JzogdHJ1ZSxcbiAgICAgICAgICAnaGVhZGVyJzogdHJ1ZSwgJ2hncm91cCc6IHRydWUsICdocic6IHRydWUsICdtZW51JzogdHJ1ZSwgJ25hdic6IHRydWUsICdvbCc6IHRydWUsXG4gICAgICAgICAgJ3AnOiB0cnVlLCAncHJlJzogdHJ1ZSwgJ3NlY3Rpb24nOiB0cnVlLCAndGFibGUnOiB0cnVlLCAndWwnOiB0cnVlfSxcbiAgICAncnAnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3J0JzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICd0Ym9keSc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndGQnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3Rmb290Jzogeyd0Ym9keSc6IHRydWV9LFxuICAgICd0aCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGhlYWQnOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RyJzogeyd0cic6IHRydWV9XG4gIH0sXG4gIGRvTm90SW5kZW50OiB7XCJwcmVcIjogdHJ1ZX0sXG4gIGFsbG93VW5xdW90ZWQ6IHRydWUsXG4gIGFsbG93TWlzc2luZzogdHJ1ZSxcbiAgY2FzZUZvbGQ6IHRydWVcbn1cblxudmFyIHhtbENvbmZpZyA9IHtcbiAgYXV0b1NlbGZDbG9zZXJzOiB7fSxcbiAgaW1wbGljaXRseUNsb3NlZDoge30sXG4gIGNvbnRleHRHcmFiYmVyczoge30sXG4gIGRvTm90SW5kZW50OiB7fSxcbiAgYWxsb3dVbnF1b3RlZDogZmFsc2UsXG4gIGFsbG93TWlzc2luZzogZmFsc2UsXG4gIGFsbG93TWlzc2luZ1RhZ05hbWU6IGZhbHNlLFxuICBjYXNlRm9sZDogZmFsc2Vcbn1cblxuQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwieG1sXCIsIGZ1bmN0aW9uKGVkaXRvckNvbmYsIGNvbmZpZ18pIHtcbiAgdmFyIGluZGVudFVuaXQgPSBlZGl0b3JDb25mLmluZGVudFVuaXRcbiAgdmFyIGNvbmZpZyA9IHt9XG4gIHZhciBkZWZhdWx0cyA9IGNvbmZpZ18uaHRtbE1vZGUgPyBodG1sQ29uZmlnIDogeG1sQ29uZmlnXG4gIGZvciAodmFyIHByb3AgaW4gZGVmYXVsdHMpIGNvbmZpZ1twcm9wXSA9IGRlZmF1bHRzW3Byb3BdXG4gIGZvciAodmFyIHByb3AgaW4gY29uZmlnXykgY29uZmlnW3Byb3BdID0gY29uZmlnX1twcm9wXVxuXG4gIC8vIFJldHVybiB2YXJpYWJsZXMgZm9yIHRva2VuaXplcnNcbiAgdmFyIHR5cGUsIHNldFN0eWxlO1xuXG4gIGZ1bmN0aW9uIGluVGV4dChzdHJlYW0sIHN0YXRlKSB7XG4gICAgZnVuY3Rpb24gY2hhaW4ocGFyc2VyKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IHBhcnNlcjtcbiAgICAgIHJldHVybiBwYXJzZXIoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiIVwiKSkge1xuICAgICAgICBpZiAoc3RyZWFtLmVhdChcIltcIikpIHtcbiAgICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKFwiQ0RBVEFbXCIpKSByZXR1cm4gY2hhaW4oaW5CbG9jayhcImF0b21cIiwgXCJdXT5cIikpO1xuICAgICAgICAgIGVsc2UgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiLS1cIikpIHtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oaW5CbG9jayhcImNvbW1lbnRcIiwgXCItLT5cIikpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIkRPQ1RZUEVcIiwgdHJ1ZSwgdHJ1ZSkpIHtcbiAgICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5fXFwtXS8pO1xuICAgICAgICAgIHJldHVybiBjaGFpbihkb2N0eXBlKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzdHJlYW0uZWF0KFwiP1wiKSkge1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5fXFwtXS8pO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluQmxvY2soXCJtZXRhXCIsIFwiPz5cIik7XG4gICAgICAgIHJldHVybiBcIm1ldGFcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGUgPSBzdHJlYW0uZWF0KFwiL1wiKSA/IFwiY2xvc2VUYWdcIiA6IFwib3BlblRhZ1wiO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCImXCIpIHtcbiAgICAgIHZhciBvaztcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiI1wiKSkge1xuICAgICAgICBpZiAoc3RyZWFtLmVhdChcInhcIikpIHtcbiAgICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW2EtZkEtRlxcZF0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcZF0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5cXC06XS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9rID8gXCJhdG9tXCIgOiBcImVycm9yXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW14mPF0vKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBpblRleHQuaXNJblRleHQgPSB0cnVlO1xuXG4gIGZ1bmN0aW9uIGluVGFnKHN0cmVhbSwgc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIj5cIiB8fCAoY2ggPT0gXCIvXCIgJiYgc3RyZWFtLmVhdChcIj5cIikpKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHR5cGUgPSBjaCA9PSBcIj5cIiA/IFwiZW5kVGFnXCIgOiBcInNlbGZjbG9zZVRhZ1wiO1xuICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPVwiKSB7XG4gICAgICB0eXBlID0gXCJlcXVhbHNcIjtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgc3RhdGUuc3RhdGUgPSBiYXNlU3RhdGU7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgdmFyIG5leHQgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIHJldHVybiBuZXh0ID8gbmV4dCArIFwiIHRhZyBlcnJvclwiIDogXCJ0YWcgZXJyb3JcIjtcbiAgICB9IGVsc2UgaWYgKC9bXFwnXFxcIl0vLnRlc3QoY2gpKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluQXR0cmlidXRlKGNoKTtcbiAgICAgIHN0YXRlLnN0cmluZ1N0YXJ0Q29sID0gc3RyZWFtLmNvbHVtbigpO1xuICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0ubWF0Y2goL15bXlxcc1xcdTAwYTA9PD5cXFwiXFwnXSpbXlxcc1xcdTAwYTA9PD5cXFwiXFwnXFwvXS8pO1xuICAgICAgcmV0dXJuIFwid29yZFwiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluQXR0cmlidXRlKHF1b3RlKSB7XG4gICAgdmFyIGNsb3N1cmUgPSBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm5leHQoKSA9PSBxdW90ZSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcInN0cmluZ1wiO1xuICAgIH07XG4gICAgY2xvc3VyZS5pc0luQXR0cmlidXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gY2xvc3VyZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluQmxvY2soc3R5bGUsIHRlcm1pbmF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5tYXRjaCh0ZXJtaW5hdG9yKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5uZXh0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkb2N0eXBlKGRlcHRoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHZhciBjaDtcbiAgICAgIHdoaWxlICgoY2ggPSBzdHJlYW0ubmV4dCgpKSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCArIDEpO1xuICAgICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaCA9PSBcIj5cIikge1xuICAgICAgICAgIGlmIChkZXB0aCA9PSAxKSB7XG4gICAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggLSAxKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcIm1ldGFcIjtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgc3RhcnRPZkxpbmUpIHtcbiAgICB0aGlzLnByZXYgPSBzdGF0ZS5jb250ZXh0O1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG4gICAgdGhpcy5pbmRlbnQgPSBzdGF0ZS5pbmRlbnRlZDtcbiAgICB0aGlzLnN0YXJ0T2ZMaW5lID0gc3RhcnRPZkxpbmU7XG4gICAgaWYgKGNvbmZpZy5kb05vdEluZGVudC5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSB8fCAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0Lm5vSW5kZW50KSlcbiAgICAgIHRoaXMubm9JbmRlbnQgPSB0cnVlO1xuICB9XG4gIGZ1bmN0aW9uIHBvcENvbnRleHQoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuY29udGV4dCkgc3RhdGUuY29udGV4dCA9IHN0YXRlLmNvbnRleHQucHJldjtcbiAgfVxuICBmdW5jdGlvbiBtYXliZVBvcENvbnRleHQoc3RhdGUsIG5leHRUYWdOYW1lKSB7XG4gICAgdmFyIHBhcmVudFRhZ05hbWU7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICghc3RhdGUuY29udGV4dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwYXJlbnRUYWdOYW1lID0gc3RhdGUuY29udGV4dC50YWdOYW1lO1xuICAgICAgaWYgKCFjb25maWcuY29udGV4dEdyYWJiZXJzLmhhc093blByb3BlcnR5KHBhcmVudFRhZ05hbWUpIHx8XG4gICAgICAgICAgIWNvbmZpZy5jb250ZXh0R3JhYmJlcnNbcGFyZW50VGFnTmFtZV0uaGFzT3duUHJvcGVydHkobmV4dFRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJhc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJvcGVuVGFnXCIpIHtcbiAgICAgIHN0YXRlLnRhZ1N0YXJ0ID0gc3RyZWFtLmNvbHVtbigpO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJjbG9zZVRhZ1wiKSB7XG4gICAgICByZXR1cm4gY2xvc2VUYWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiYXNlU3RhdGU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdHJlYW0uY3VycmVudCgpO1xuICAgICAgc2V0U3R5bGUgPSBcInRhZ1wiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGNsb3NlVGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgdmFyIHRhZ05hbWUgPSBzdHJlYW0uY3VycmVudCgpO1xuICAgICAgaWYgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lICE9IHRhZ05hbWUgJiZcbiAgICAgICAgICBjb25maWcuaW1wbGljaXRseUNsb3NlZC5oYXNPd25Qcm9wZXJ0eShzdGF0ZS5jb250ZXh0LnRhZ05hbWUpKVxuICAgICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICAgIGlmICgoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgPT0gdGFnTmFtZSkgfHwgY29uZmlnLm1hdGNoQ2xvc2luZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZ1wiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWcgZXJyb3JcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGVFcnI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGVFcnI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlICE9IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgfVxuICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgIHJldHVybiBiYXNlU3RhdGU7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VTdGF0ZUVycih0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGNsb3NlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhdHRyU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImF0dHJpYnV0ZVwiO1xuICAgICAgcmV0dXJuIGF0dHJFcVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImVuZFRhZ1wiIHx8IHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIikge1xuICAgICAgdmFyIHRhZ05hbWUgPSBzdGF0ZS50YWdOYW1lLCB0YWdTdGFydCA9IHN0YXRlLnRhZ1N0YXJ0O1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIGlmICh0eXBlID09IFwic2VsZmNsb3NlVGFnXCIgfHxcbiAgICAgICAgICBjb25maWcuYXV0b1NlbGZDbG9zZXJzLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgICBzdGF0ZS5jb250ZXh0ID0gbmV3IENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlU3RhdGU7XG4gICAgfVxuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGU7XG4gIH1cbiAgZnVuY3Rpb24gYXR0ckVxU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwiZXF1YWxzXCIpIHJldHVybiBhdHRyVmFsdWVTdGF0ZTtcbiAgICBpZiAoIWNvbmZpZy5hbGxvd01pc3NpbmcpIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYXR0clZhbHVlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIgJiYgY29uZmlnLmFsbG93VW5xdW90ZWQpIHtzZXRTdHlsZSA9IFwic3RyaW5nXCI7IHJldHVybiBhdHRyU3RhdGU7fVxuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYXR0ckNvbnRpbnVlZFN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0YXJ0U3RhdGU6IGZ1bmN0aW9uKGJhc2VJbmRlbnQpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHt0b2tlbml6ZTogaW5UZXh0LFxuICAgICAgICAgICAgICAgICAgIHN0YXRlOiBiYXNlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgaW5kZW50ZWQ6IGJhc2VJbmRlbnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiBudWxsLCB0YWdTdGFydDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBudWxsfVxuICAgICAgaWYgKGJhc2VJbmRlbnQgIT0gbnVsbCkgc3RhdGUuYmFzZUluZGVudCA9IGJhc2VJbmRlbnRcbiAgICAgIHJldHVybiBzdGF0ZVxuICAgIH0sXG5cbiAgICB0b2tlbjogZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKCFzdGF0ZS50YWdOYW1lICYmIHN0cmVhbS5zb2woKSlcbiAgICAgICAgc3RhdGUuaW5kZW50ZWQgPSBzdHJlYW0uaW5kZW50YXRpb24oKTtcblxuICAgICAgaWYgKHN0cmVhbS5lYXRTcGFjZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgIHR5cGUgPSBudWxsO1xuICAgICAgdmFyIHN0eWxlID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBpZiAoKHN0eWxlIHx8IHR5cGUpICYmIHN0eWxlICE9IFwiY29tbWVudFwiKSB7XG4gICAgICAgIHNldFN0eWxlID0gbnVsbDtcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBzdGF0ZS5zdGF0ZSh0eXBlIHx8IHN0eWxlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgaWYgKHNldFN0eWxlKVxuICAgICAgICAgIHN0eWxlID0gc2V0U3R5bGUgPT0gXCJlcnJvclwiID8gc3R5bGUgKyBcIiBlcnJvclwiIDogc2V0U3R5bGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfSxcblxuICAgIGluZGVudDogZnVuY3Rpb24oc3RhdGUsIHRleHRBZnRlciwgZnVsbExpbmUpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gc3RhdGUuY29udGV4dDtcbiAgICAgIC8vIEluZGVudCBtdWx0aS1saW5lIHN0cmluZ3MgKGUuZy4gY3NzKS5cbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZS5pc0luQXR0cmlidXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZS50YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZClcbiAgICAgICAgICByZXR1cm4gc3RhdGUuc3RyaW5nU3RhcnRDb2wgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmluZGVudGVkICsgaW5kZW50VW5pdDtcbiAgICAgIH1cbiAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQubm9JbmRlbnQpIHJldHVybiBDb2RlTWlycm9yLlBhc3M7XG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUgIT0gaW5UYWcgJiYgc3RhdGUudG9rZW5pemUgIT0gaW5UZXh0KVxuICAgICAgICByZXR1cm4gZnVsbExpbmUgPyBmdWxsTGluZS5tYXRjaCgvXihcXHMqKS8pWzBdLmxlbmd0aCA6IDA7XG4gICAgICAvLyBJbmRlbnQgdGhlIHN0YXJ0cyBvZiBhdHRyaWJ1dGUgbmFtZXMuXG4gICAgICBpZiAoc3RhdGUudGFnTmFtZSkge1xuICAgICAgICBpZiAoY29uZmlnLm11bHRpbGluZVRhZ0luZGVudFBhc3RUYWcgIT09IGZhbHNlKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS50YWdTdGFydCArIHN0YXRlLnRhZ05hbWUubGVuZ3RoICsgMjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS50YWdTdGFydCArIGluZGVudFVuaXQgKiAoY29uZmlnLm11bHRpbGluZVRhZ0luZGVudEZhY3RvciB8fCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcuYWxpZ25DREFUQSAmJiAvPCFcXFtDREFUQVxcWy8udGVzdCh0ZXh0QWZ0ZXIpKSByZXR1cm4gMDtcbiAgICAgIHZhciB0YWdBZnRlciA9IHRleHRBZnRlciAmJiAvXjwoXFwvKT8oW1xcd186XFwuLV0qKS8uZXhlYyh0ZXh0QWZ0ZXIpO1xuICAgICAgaWYgKHRhZ0FmdGVyICYmIHRhZ0FmdGVyWzFdKSB7IC8vIENsb3NpbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC50YWdOYW1lID09IHRhZ0FmdGVyWzJdKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb25maWcuaW1wbGljaXRseUNsb3NlZC5oYXNPd25Qcm9wZXJ0eShjb250ZXh0LnRhZ05hbWUpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGFnQWZ0ZXIpIHsgLy8gT3BlbmluZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIHZhciBncmFiYmVycyA9IGNvbmZpZy5jb250ZXh0R3JhYmJlcnNbY29udGV4dC50YWdOYW1lXTtcbiAgICAgICAgICBpZiAoZ3JhYmJlcnMgJiYgZ3JhYmJlcnMuaGFzT3duUHJvcGVydHkodGFnQWZ0ZXJbMl0pKVxuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKGNvbnRleHQgJiYgY29udGV4dC5wcmV2ICYmICFjb250ZXh0LnN0YXJ0T2ZMaW5lKVxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgaWYgKGNvbnRleHQpIHJldHVybiBjb250ZXh0LmluZGVudCArIGluZGVudFVuaXQ7XG4gICAgICBlbHNlIHJldHVybiBzdGF0ZS5iYXNlSW5kZW50IHx8IDA7XG4gICAgfSxcblxuICAgIGVsZWN0cmljSW5wdXQ6IC88XFwvW1xcc1xcdzpdKz4kLyxcbiAgICBibG9ja0NvbW1lbnRTdGFydDogXCI8IS0tXCIsXG4gICAgYmxvY2tDb21tZW50RW5kOiBcIi0tPlwiLFxuXG4gICAgY29uZmlndXJhdGlvbjogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuICAgIGhlbHBlclR5cGU6IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcblxuICAgIHNraXBBdHRyaWJ1dGU6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBpZiAoc3RhdGUuc3RhdGUgPT0gYXR0clZhbHVlU3RhdGUpXG4gICAgICAgIHN0YXRlLnN0YXRlID0gYXR0clN0YXRlXG4gICAgfVxuICB9O1xufSk7XG5cbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQveG1sXCIsIFwieG1sXCIpO1xuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24veG1sXCIsIFwieG1sXCIpO1xuaWYgKCFDb2RlTWlycm9yLm1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShcInRleHQvaHRtbFwiKSlcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC9odG1sXCIsIHtuYW1lOiBcInhtbFwiLCBodG1sTW9kZTogdHJ1ZX0pO1xuXG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzXG4vLyBtb2R1bGUgaWQgPSAxNzlcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwid2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnZhciBFY2hvID0gcmVxdWlyZSgnbGFyYXZlbC1lY2hvJyk7XG5yZXF1aXJlKCdpb24tc291bmQnKTtcblxud2luZG93LlB1c2hlciA9IHJlcXVpcmUoJ3B1c2hlci1qcycpO1xuXG4vKipcbiAqIEdyb3Vwc2Vzc2lvbiBpbml0IGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IHRvIHN0YXJ0XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9sb2FkIGlvbi1zb3VuZCBsaWJyYXJ5XG5cdGlvbi5zb3VuZCh7XG4gICAgc291bmRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwiZG9vcl9iZWxsXCJcbiAgICAgICAgfSxcbiAgICBdLFxuICAgIHZvbHVtZTogMS4wLFxuICAgIHBhdGg6IFwiL3NvdW5kcy9cIixcbiAgICBwcmVsb2FkOiB0cnVlXG5cdH0pO1xuXG5cdC8vZ2V0IHVzZXJJRCBhbmQgaXNBZHZpc29yIHZhcmlhYmxlc1xuXHR3aW5kb3cudXNlcklEID0gcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKTtcblxuXHQvL3JlZ2lzdGVyIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLm9uKCdjbGljaycsIGdyb3VwUmVnaXN0ZXJCdG4pO1xuXG5cdC8vZGlzYWJsZSBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwRGlzYWJsZUJ0bicpLm9uKCdjbGljaycsIGdyb3VwRGlzYWJsZUJ0bik7XG5cblx0Ly9yZW5kZXIgVnVlIEFwcFxuXHR3aW5kb3cudm0gPSBuZXcgVnVlKHtcblx0XHRlbDogJyNncm91cExpc3QnLFxuXHRcdGRhdGE6IHtcblx0XHRcdHF1ZXVlOiBbXSxcblx0XHRcdGFkdmlzb3I6IHBhcnNlSW50KCQoJyNpc0Fkdmlzb3InKS52YWwoKSkgPT0gMSxcblx0XHRcdHVzZXJJRDogcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdGdldENsYXNzOiBmdW5jdGlvbihzKXtcblx0XHRcdFx0cmV0dXJue1xuXHRcdFx0XHRcdCdhbGVydC1pbmZvJzogcy5zdGF0dXMgPT0gMCB8fCBzLnN0YXR1cyA9PSAxLFxuXHRcdFx0XHRcdCdhbGVydC1zdWNjZXNzJzogcy5zdGF0dXMgPT0gMixcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW1lJzogcy51c2VyaWQgPT0gdGhpcy51c2VySUQsXG5cdFx0XHRcdH07XG5cdFx0XHR9LFxuXHRcdFx0Ly9mdW5jdGlvbiB0byB0YWtlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHR0YWtlU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3Rha2UnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3Rha2UnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gcHV0IGEgc3R1ZGVudCBiYWNrIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3Rcblx0XHRcdHB1dFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9wdXQnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3B1dCcpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly8gZnVuY3Rpb24gdG8gbWFyayBhIHN0dWRlbnQgZG9uZSBvbiB0aGUgbGlzdFxuXHRcdFx0ZG9uZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kb25lJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdtYXJrIGRvbmUnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gZGVsZXRlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHRkZWxTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZGVsZXRlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdkZWxldGUnKTtcblx0XHRcdH0sXG5cdFx0fSxcblx0fSlcblxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvZ3JvdXBzZXNzaW9uL3F1ZXVlJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHR2bS5xdWV1ZSA9IHZtLnF1ZXVlLmNvbmNhdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdGNoZWNrQnV0dG9ucyh2bS5xdWV1ZSk7XG5cdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHZtLnF1ZXVlKTtcblx0XHRcdHZtLnF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdnZXQgcXVldWUnLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xuXG5cdHdpbmRvdy5FY2hvID0gbmV3IEVjaG8oe1xuXHRcdGJyb2FkY2FzdGVyOiAncHVzaGVyJyxcblx0XHRrZXk6IHdpbmRvdy5wdXNoZXJLZXksXG5cdFx0Y2x1c3Rlcjogd2luZG93LnB1c2hlckNsdXN0ZXIsXG5cdH0pO1xuXG5cdHdpbmRvdy5FY2hvLmNvbm5lY3Rvci5wdXNoZXIuY29ubmVjdGlvbi5iaW5kKCdjb25uZWN0ZWQnLCBmdW5jdGlvbigpe1xuXHRcdC8vd2hlbiBjb25uZWN0ZWQsIGRpc2FibGUgdGhlIHNwaW5uZXJcblx0XHQkKCcjZ3JvdXBTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9KVxuXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbicpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZSkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coZS5pZCk7XG5cdFx0fSlcblxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb25lbmQnKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvbkVuZCcsIChlKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coZS5pZCk7XG5cdH0pO1xuXG59O1xuXG5cbi8qKlxuICogVnVlIGZpbHRlciBmb3Igc3RhdHVzIHRleHRcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBzdHVkZW50IHRvIHJlbmRlclxuICovXG5WdWUuZmlsdGVyKCdzdGF0dXN0ZXh0JywgZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAwKSByZXR1cm4gXCJORVdcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDEpIHJldHVybiBcIlFVRVVFRFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMikgcmV0dXJuIFwiTUVFVCBXSVRIIFwiICsgZGF0YS5hZHZpc29yO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMykgcmV0dXJuIFwiREVMQVlcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDQpIHJldHVybiBcIkFCU0VOVFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNSkgcmV0dXJuIFwiRE9ORVwiO1xufSk7XG5cbi8qKlxuICogVnVlIGNvbXBvbmVudCBmb3IgZGlzcGxheWluZyBhIHN0dWRlbnQgcm93XG4gKi9cblZ1ZS5jb21wb25lbnQoJ3N0dWRlbnQtcm93Jywge1xuXHRwcm9wczogWydzdHVkZW50J10sXG5cdHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm8gZ3JvdXBzZXNzaW9uLWRpdlwiIHJvbGU9XCJhbGVydFwiPnt7IHN0dWRlbnQubmFtZSB9fSA8c3BhbiBjbGFzcz1cImJhZGdlXCI+IHt7IHN0dWRlbnQgfCBzdGF0dXN0ZXh0IH19PC9zcGFuPjwvZGl2PicsXG5cbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3VwU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB3aW5kb3cudXNlcklEICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJyArIHRva2VuICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSkgLy9pdCBoYXMgdG8gYmUgYWRkZWQgc29tZXdoZXJlIGludG8gdGhlIDxib2R5PlxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5hYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGVuYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkaXNhYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGRpc2FibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgYW5kIHNlZSBpZiB1c2VyIGlzIG9uIHRoZSBsaXN0IC0gaWYgbm90LCBkb24ndCBlbmFibGUgYnV0dG9uXG4gKi9cbnZhciBjaGVja0J1dHRvbnMgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdHZhciBmb3VuZE1lID0gZmFsc2U7XG5cblx0Ly9pdGVyYXRlIHRocm91Z2ggdXNlcnMgb24gbGlzdCwgbG9va2luZyBmb3IgY3VycmVudCB1c2VyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGZvdW5kTWUgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly9pZiBmb3VuZCwgZGlzYWJsZSBidXR0b247IGlmIG5vdCwgZW5hYmxlIGJ1dHRvblxuXHRpZihmb3VuZE1lKXtcblx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdH1lbHNle1xuXHRcdGVuYWJsZUJ1dHRvbigpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYmVja29uZWQsIGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBwZXJzb24gLSB0aGUgY3VycmVudCB1c2VyIHRvIGNoZWNrXG4gKi9cbnZhciBjaGVja0RpbmcgPSBmdW5jdGlvbihwZXJzb24pe1xuXHRpZihwZXJzb24uc3RhdHVzID09IDIpe1xuXHRcdGlvbi5zb3VuZC5wbGF5KFwiZG9vcl9iZWxsXCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBlcnNvbiBoYXMgYmVlbiBiZWNrb25lZCBvbiBsb2FkOyBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcXVldWUgLSB0aGUgaW5pdGlhbCBxdWV1ZSBvZiB1c2VycyBsb2FkZWRcbiAqL1xudmFyIGluaXRpYWxDaGVja0RpbmcgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlU3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuXHRcdFx0bGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG5cdFx0fTtcblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHQvL3NlbmQgQUpBWCBwb3N0XG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVTcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBhZHZpc29yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlQWR2aXNvclByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZVNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdC8vVE9ETyBURVNUTUVcblx0XHR2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGRhdGEuYXBwZW5kKFwibmFtZVwiLCAkKCcjbmFtZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwicGhvbmVcIiwgJCgnI3Bob25lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuXHRcdGlmKCQoJyNwaWMnKS52YWwoKSl7XG5cdFx0XHRkYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZVNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYycpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0JCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0XHQkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0Ly9odHRwOi8vd3d3LmFiZWF1dGlmdWxzaXRlLm5ldC93aGlwcGluZy1maWxlLWlucHV0cy1pbnRvLXNoYXBlLXdpdGgtYm9vdHN0cmFwLTMvXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG5cdCAgdmFyIGlucHV0ID0gJCh0aGlzKSxcblx0ICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcblx0ICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG5cdCAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcblx0fSk7XG5cblx0Ly9iaW5kIHRvIGZpbGVzZWxlY3QgYnV0dG9uXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0Jyk7XG5cdFx0XHR2YXIgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZihpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC52YWwobG9nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKGxvZyl7XG5cdFx0XHRcdFx0XHRhbGVydChsb2cpO1xuXHRcdFx0XHRcdH1cbiAgICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMTg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIGZyb20gdGhlIGZsYXNoZWQgc2Vzc2lvbiBkYXRhXG4gKlxuICogdXNlICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgnbWVzc2FnZScsIHRyYW5zKCdtZXNzYWdlcy5pdGVtX3NhdmVkJykpO1xuICogICAgICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgndHlwZScsICdzdWNjZXNzJyk7XG4gKiB0byBzZXQgbWVzc2FnZSB0ZXh0IGFuZCB0eXBlXG4gKi9cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKXtcblx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cImphdmFzY3JpcHRNZXNzYWdlXCIgY2xhc3M9XCJhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LScgKyB0eXBlICsgJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PC9idXR0b24+PHNwYW4gY2xhc3M9XCJoNFwiPicgKyBtZXNzYWdlICsgJzwvc3Bhbj48L2Rpdj4nO1xuXHQkKCcjbWVzc2FnZScpLmFwcGVuZChodG1sKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKFwiI2phdmFzY3JpcHRNZXNzYWdlXCIpLmFsZXJ0KCdjbG9zZScpO1xuXHR9LCAzMDAwKTtcbn07XG5cbi8qXG5leHBvcnRzLmFqYXhjcnNmID0gZnVuY3Rpb24oKXtcblx0JC5hamF4U2V0dXAoe1xuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG5cdFx0fVxuXHR9KTtcbn07XG4qL1xuXG4vKipcbiAqIENsZWFycyBlcnJvcnMgb24gZm9ybXMgYnkgcmVtb3ZpbmcgZXJyb3IgY2xhc3Nlc1xuICovXG5leHBvcnRzLmNsZWFyRm9ybUVycm9ycyA9IGZ1bmN0aW9uKCl7XG5cdCQoJy5mb3JtLWdyb3VwJykuZWFjaChmdW5jdGlvbiAoKXtcblx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFNldHMgZXJyb3JzIG9uIGZvcm1zIGJhc2VkIG9uIHJlc3BvbnNlIEpTT05cbiAqL1xuZXhwb3J0cy5zZXRGb3JtRXJyb3JzID0gZnVuY3Rpb24oanNvbil7XG5cdGV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdCQuZWFjaChqc29uLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdCQoJyMnICsga2V5KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKCcjJyArIGtleSArICdoZWxwJykudGV4dCh2YWx1ZS5qb2luKCcgJykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG1lc3NhZ2VzIGluIHRoZSBmbGFzaCBkYXRhLiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IGJ5IHRoZSBwYWdlXG4gKi9cbmV4cG9ydHMuY2hlY2tNZXNzYWdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCgnI21lc3NhZ2VfZmxhc2gnKS5sZW5ndGgpe1xuXHRcdHZhciBtZXNzYWdlID0gJCgnI21lc3NhZ2VfZmxhc2gnKS52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICQoJyNtZXNzYWdlX3R5cGVfZmxhc2gnKS52YWwoKTtcblx0XHRleHBvcnRzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIHR5cGUpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGVycm9ycyBmcm9tIEFKQVhcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gZXJyb3IgLSB0aGUgQXhpb3MgZXJyb3IgcmVjZWl2ZWRcbiAqL1xuZXhwb3J0cy5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGVsZW1lbnQsIGVycm9yKXtcblx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0ZXhwb3J0cy5zZXRGb3JtRXJyb3JzKGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gXCIgKyBtZXNzYWdlICsgXCI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0aWYoZWxlbWVudC5sZW5ndGggPiAwKXtcblx0XHQkKGVsZW1lbnQgKyAnU3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiXSwic291cmNlUm9vdCI6IiJ9