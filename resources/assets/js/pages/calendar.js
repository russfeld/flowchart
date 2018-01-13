//load required JS libraries
require('fullcalendar');
require('devbridge-autocomplete');
var moment = require('moment');
var site = require('../util/site');
require('eonasdan-bootstrap-datetimepicker-russfeld');

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
		dow: [ 1, 2, 3, 4, 5 ]
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
	eventSources: [
		{
			url: '/advising/meetingfeed',
			type: 'GET',
			error: function() {
				alert('Error fetching meeting events from database');
			},
			color: '#512888',
			textColor: 'white',
		},
		{
			url: '/advising/blackoutfeed',
			type: 'GET',
			error: function() {
				alert('Error fetching blackout events from database');
			},
			color: '#FF8888',
			textColor: 'black',
		},
	],
	selectable: true,
	selectHelper: true,
	selectOverlap: function(event) {
		return event.rendering === 'background';
	},
	timeFormat: ' ',
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
exports.init = function(){

	//Check for messages in the session from a previous action
	site.checkMessage();

	//tweak parameters
	window.advisor || (window.advisor = false);
	window.nobind || (window.nobind = false);

	//get the current advisor's ID
	exports.calendarAdvisorID = $('#calendarAdvisorID').val().trim();

	//Set the advisor information for meeting event source
	exports.calendarData.eventSources[0].data = {id: exports.calendarAdvisorID};

	//Set the advsior inforamtion for blackout event source
	exports.calendarData.eventSources[1].data = {id: exports.calendarAdvisorID};

	//if the window is small, set different default for calendar
	if($(window).width() < 600){
		exports.calendarData.defaultView = 'agendaDay';
	}

	//If nobind, don't bind the forms
	if(!window.nobind){
		//If the current user is an advisor, bind more data
		if(window.advisor){

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

			$('#createBlackout').on('hidden.bs.modal', function(){
				$('#repeatdailydiv').hide();
				$('#repeatweeklydiv').hide();
				$('#repeatuntildiv').hide();
				$(this).find('form')[0].reset();
			    $(this).find('.has-error').each(function(){
					$(this).removeClass('has-error');
				});
				$(this).find('.help-block').each(function(){
					$(this).text('');
				});
			});

			$('#createEvent').on('hidden.bs.modal', loadConflicts);

			$('#resolveConflict').on('hidden.bs.modal', loadConflicts);

			$('#resolveConflict').on('hidden.bs.modal', function(){
				$('#calendar').fullCalendar('refetchEvents');
			});

			//bind autocomplete field
			$('#studentid').autocomplete({
			    serviceUrl: '/profile/studentfeed',
			    ajaxSettings: {
			    	dataType: "json"
			    },
			    onSelect: function (suggestion) {
			        $('#studentidval').val(suggestion.data);
			    },
			    transformResult: function(response) {
			        return {
			            suggestions: $.map(response.data, function(dataItem) {
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
			exports.calendarData.eventRender = function(event, element){
				element.addClass("fc-clickable");
			};
			exports.calendarData.eventClick = function(event, element, view){
				if(event.type == 'm'){
					$('#studentid').val(event.studentname);
					$('#studentidval').val(event.student_id);
					showMeetingForm(event);
				}else if (event.type == 'b'){
					exports.calendarSession = {
						event: event
					};
					if(event.repeat == '0'){
						blackoutSeries();
					}else{
						$('#blackoutOption').modal('show');
					}
				}
			};
			exports.calendarData.select = function(start, end) {
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

			$('#blackoutSeries').bind('click', function(){
				$('#blackoutOption').modal('hide');
				blackoutSeries();
			});

			$('#blackoutOccurrence').bind('click', function(){
				$('#blackoutOption').modal('hide');
				blackoutOccurrence();
			});

			$('#advisingButton').bind('click', function(){
				$('#meetingOption').modal('hide');
				createMeetingForm();
			});

			$('#createMeetingBtn').bind('click', function(){
				exports.calendarSession = {};
				createMeetingForm();
			});

			$('#blackoutButton').bind('click', function(){
				$('#meetingOption').modal('hide');
				createBlackoutForm();
			});

			$('#createBlackoutBtn').bind('click', function(){
				exports.calendarSession = {};
				createBlackoutForm();
			});


			$('#resolveButton').on('click', resolveConflicts);

			loadConflicts();

		//If the current user is not an advisor, bind less data
		}else{

			//Get the current student's name
			exports.calendarStudentName = $('#calendarStudentName').val().trim();

		  //Render blackouts to background
		  exports.calendarData.eventSources[1].rendering = 'background';

		  //When rendering, use this custom function for blackouts and student meetings
		  exports.calendarData.eventRender = function(event, element){
		    if(event.type == 'b'){
		        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
		    }
		    if(event.type == 's'){
		    	element.addClass("fc-green");
		    }
			};

		  //Use this method for clicking on meetings
			exports.calendarData.eventClick = function(event, element, view){
				if(event.type == 's'){
					if(event.start.isAfter(moment())){
						showMeetingForm(event);
					}else{
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
	}else{
		//for read-only calendars, set rendering to background
		exports.calendarData.eventSources[1].rendering = 'background';
    exports.calendarData.selectable = false;

    exports.calendarData.eventRender = function(event, element){
	    if(event.type == 'b'){
	        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
	    }
	    if(event.type == 's'){
	    	element.addClass("fc-green");
	    }
		};
	}

	//initalize the calendar!
	$('#calendar').fullCalendar(exports.calendarData);
}

/**
 * Function to reset calendar by closing modals and reloading data
 *
 * @param element - the jQuery identifier of the form to hide (and the spin)
 * @param reponse - the Axios repsonse object received
 */
var resetCalendar = function(element, response){
	//hide the form
	$(element).modal('hide');

	//display the message to the user
	site.displayMessage(response.data, "success");

	//refresh the calendar
	$('#calendar').fullCalendar('unselect');
	$('#calendar').fullCalendar('refetchEvents');
	$(element + 'Spin').addClass('hide-spin');

	if(window.advisor){
		loadConflicts();
	}
}

/**
 * AJAX method to save data from a form
 *
 * @param url - the URL to send the data to
 * @param data - the data object to send
 * @param element - the source element of the data
 * @param action - the string description of the action
 */
var ajaxSave = function(url, data, element, action){
	//AJAX POST to server
	window.axios.post(url, data)
	  //if response is 2xx
		.then(function(response){
			resetCalendar(element, response);
		})
		//if response is not 2xx
		.catch(function(error){
			site.handleError(action, element, error);
		});
}

var ajaxDelete = function(url, data, element, action, noReset, noChoice){
	//check noReset variable
	noReset || (noReset = false);
	noChoice || (noChoice = false);

	//prompt the user for confirmation
	if(!noChoice){
		var choice = confirm("Are you sure?");
	}else{
		var choice = true;
	}

	if(choice === true){

		//if confirmed, show spinning icon
		$(element + 'Spin').removeClass('hide-spin');

		//make AJAX request to delete
		window.axios.post(url, data)
			.then(function(response){
				if(noReset){
					//hide parent element - TODO TESTME
					//caller.parent().parent().addClass('hidden');
					$(element + 'Spin').addClass('hide-spin');
					$(element).addClass('hidden');
				}else{
					resetCalendar(element, response);
				}
			})
			.catch(function(error){
				site.handleError(action, element, error);
			});
	}
}

/**
 * Function to save a meeting
 */
var saveMeeting = function(){

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
	if($('#meetingID').val() > 0){
		data.meetingid = $('#meetingID').val();
	}
	if($('#studentidval').val() > 0){
		data.studentid = $('#studentidval').val();
	}
	var url = '/advising/createmeeting';

	//AJAX POST to server
	ajaxSave(url, data, '#createEvent', 'save meeting');
};

/**
 * Function to delete a meeting
 */
var deleteMeeting = function(){

	//build data and url
	var data = {
		meetingid: $('#meetingID').val()
	}
	var url = '/advising/deletemeeting';

	ajaxDelete(url, data, '#createEvent', 'delete meeting', false);
};

/**
 * Function to populate and show the meeting form for editing
 *
 * @param event - The event to edit
 */
var showMeetingForm = function(event){
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
var createMeetingForm = function(calendarStudentName){

	//populate the title automatically for a student
	if(calendarStudentName !== undefined){
		$('#title').val(calendarStudentName);
	}else{
		$('#title').val('');
	}

	//Set start time
	if(exports.calendarSession.start === undefined){
		$('#start').val(moment().hour(8).minute(0).format('LLL'));
	}else{
		$('#start').val(exports.calendarSession.start.format("LLL"));
	}

	//Set end time
	if(exports.calendarSession.end === undefined){
		$('#end').val(moment().hour(8).minute(20).format('LLL'));
	}else{
		$('#end').val(exports.calendarSession.end.format("LLL"));
	}

	//Set duration options
	if(exports.calendarSession.start === undefined){
		durationOptions(moment().hour(8).minute(0), moment().hour(8).minute(20));
	}else{
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
var resetForm = function(){
  $(this).find('form')[0].reset();
	site.clearFormErrors();
};

/**
 * Function to set duration options for the meeting form
 *
 * @param start - a moment object for the start time
 * @param end - a moment object for the ending time
 */
var durationOptions = function(start, end){
	//clear the list
	$('#duration').empty();

	//assume all meetings have room for 20 minutes
	$('#duration').append("<option value='20'>20 minutes</option>");

	//if it starts on or before 4:20, allow 40 minutes as an option
	if(start.hour() < 16 || (start.hour() == 16 && start.minutes() <= 20)){
		$('#duration').append("<option value='40'>40 minutes</option>");
	}

	//if it starts on or before 4:00, allow 60 minutes as an option
	if(start.hour() < 16 || (start.hour() == 16 && start.minutes() <= 0)){
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
var linkDatePickers = function(elem1, elem2, duration){
	//bind to change action on first datapicker
	$(elem1 + "_datepicker").on("dp.change", function (e) {
		var date2 = moment($(elem2).val(), 'LLL');
		if(e.date.isAfter(date2) || e.date.isSame(date2)){
			date2 = e.date.clone();
			$(elem2).val(date2.format("LLL"));
		}
	});

	//bind to change action on second datepicker
	$(elem2 + "_datepicker").on("dp.change", function (e) {
		var date1 = moment($(elem1).val(), 'LLL');
		if(e.date.isBefore(date1) || e.date.isSame(date1)){
			date1 = e.date.clone();
			$(elem1).val(date1.format("LLL"));
		}
	});
};

/**
 * Function to change the duration of the meeting
 */
var changeDuration = function(){
	var newDate = moment($('#start').val(), 'LLL').add($(this).val(), "minutes");
	$('#end').val(newDate.format("LLL"));
};

/**
 * Function to verify that the students are selecting meetings that aren't too long
 *
 * @param start - moment object for the start of the meeting
 * @param end - moment object for the end of the meeting
 */
var studentSelect = function(start, end) {

	//When students select a meeting, diff the start and end times
	if(end.diff(start, 'minutes') > 60){

		//if invalid, unselect and show an error
		alert("Meetings cannot last longer than 1 hour");
		$('#calendar').fullCalendar('unselect');
	}else{

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
var loadConflicts = function(){

	//request conflicts via AJAX
	window.axios.get('/advising/conflicts')
		.then(function(response){

			//disable existing click handlers
			$(document).off('click', '.deleteConflict', deleteConflict);
			$(document).off('click', '.editConflict', editConflict);
			$(document).off('click', '.resolveConflict', resolveConflict);

			//If response is 200, data was received
			if(response.status == 200){

				//Append HTML for conflicts to DOM
				$('#resolveConflictMeetings').empty();
				$.each(response.data, function(index, value){
					$('<div/>', {
						'id' : 'resolve'+value.id,
						'class': 'meeting-conflict',
						'html': 	'<p>&nbsp;<button type="button" class="btn btn-danger pull-right deleteConflict" data-id='+value.id+'>Delete</button>' +
									'&nbsp;<button type="button" class="btn btn-primary pull-right editConflict" data-id='+value.id+'>Edit</button> ' +
									'<button type="button" class="btn btn-success pull-right resolveConflict" data-id='+value.id+'>Keep Meeting</button>' +
									'<span id="resolve'+value.id+'Spin" class="fa fa-cog fa-spin fa-lg pull-right hide-spin">&nbsp;</span>' +
										'<b>'+value.title+'</b> ('+value.start+')</p><hr>'
						}).appendTo('#resolveConflictMeetings');
				});

				//Re-register click handlers
				$(document).on('click', '.deleteConflict', deleteConflict);
				$(document).on('click', '.editConflict', editConflict);
				$(document).on('click', '.resolveConflict', resolveConflict);

				//Show the <div> containing conflicts
				$('#conflictingMeetings').removeClass('hidden');

		  //If response is 204, no conflicts are present
			}else if(response.status == 204){

				//Hide the <div> containing conflicts
				$('#conflictingMeetings').addClass('hidden');
			}
		})
		.catch(function(error){
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
}

/**
 * Save blackouts and blackout events
 */
var saveBlackout = function(){

	//Show the spinning status icon while working
	$('#createBlackoutSpin').removeClass('hide-spin');

	//build the data object and url;
	var data = {
		bstart: moment($('#bstart').val(), 'LLL').format(),
		bend: moment($('#bend').val(), 'LLL').format(),
		btitle: $('#btitle').val()
	};
	var url;
	if($('#bblackouteventid').val() > 0){
		url = '/advising/createblackoutevent';
		data.bblackouteventid = $('#bblackouteventid').val();
	}else{
		url = '/advising/createblackout';
		if($('#bblackoutid').val() > 0){
			data.bblackoutid = $('#bblackoutid').val();
		}
		data.brepeat = $('#brepeat').val();
		if($('#brepeat').val() == 1){
			data.brepeatevery= $('#brepeatdaily').val();
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
		if($('#brepeat').val() == 2){
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
var deleteBlackout = function(){

	//build URL and data object
	var url, data;
	if($('#bblackouteventid').val() > 0){
		url = '/advising/deleteblackoutevent';
		data = { bblackouteventid: $('#bblackouteventid').val() };
	}else{
		url = '/advising/deleteblackout';
		data = { bblackoutid: $('#bblackoutid').val() };
	}

	//send AJAX post
	ajaxDelete(url, data, '#createBlackout', 'delete blackout', false);
};

/**
 * Function for handling the change of repeat options on the blackout form
 */
var repeatChange = function(){
	if($(this).val() == 0){
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').hide();
	}else if($(this).val() == 1){
		$('#repeatdailydiv').show();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').show();
	}else if($(this).val() == 2){
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').show();
		$('#repeatuntildiv').show();
	}
};

/**
 * Show the resolve conflicts modal form
 */
var resolveConflicts = function(){
	$('#resolveConflict').modal('show');
};

/**
 * Delete conflicting meeting
 */
var deleteConflict = function(){

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	}
	var url = '/advising/deletemeeting';

	//send AJAX delete
	ajaxDelete(url, data, '#resolve' + id, 'delete meeting', true);

};

/**
 * Edit conflicting meeting
 */
var editConflict = function(){

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	}
	var url = '/advising/meeting';

	//show spinner to load meeting
	$('#resolve'+ id + 'Spin').removeClass('hide-spin');

	//load meeting and display form
	window.axios.get(url, {
			params: data
		})
		.then(function(response){
			$('#resolve'+ id + 'Spin').addClass('hide-spin');
			$('#resolveConflict').modal('hide');
			event = response.data;
			event.start = moment(event.start);
			event.end = moment(event.end);
			showMeetingForm(event);
		}).catch(function(error){
			site.handleError('retrieve meeting', '#resolve' + id, error);
		});
};

/**
 * Resolve a conflicting meeting
 */
var resolveConflict = function(){

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	}
	var url = '/advising/resolveconflict';

	ajaxDelete(url, data, '#resolve' + id, 'resolve meeting', true, true);
};

/**
 * Function to create the create blackout form
 */
var createBlackoutForm = function(){
	$('#btitle').val("");
	if(exports.calendarSession.start === undefined){
		$('#bstart').val(moment().hour(8).minute(0).format('LLL'));
	}else{
		$('#bstart').val(exports.calendarSession.start.format("LLL"));
	}
	if(exports.calendarSession.end === undefined){
		$('#bend').val(moment().hour(9).minute(0).format('LLL'));
	}else{
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
var blackoutOccurrence = function(){
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
var blackoutSeries = function(){
	//hide the modal form
 	$('#blackoutOption').modal('hide');

	//build data and URL
	var data = {
		id: exports.calendarSession.event.blackout_id
	}
	var url = '/advising/blackout';

	window.axios.get(url, {
			params: data
		})
		.then(function(response){
			$('#btitle').val(response.data.title)
	 		$('#bstart').val(moment(response.data.start, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
	 		$('#bend').val(moment(response.data.end, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
	 		$('#bblackoutid').val(response.data.id);
	 		$('#bblackouteventid').val(-1);
	 		$('#repeatdiv').show();
	 		$('#brepeat').val(response.data.repeat_type);
	 		$('#brepeat').trigger('change');
	 		if(response.data.repeat_type == 1){
	 			$('#brepeatdaily').val(response.data.repeat_every);
	 			$('#brepeatuntil').val(moment(response.data.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
	 		}else if (response.data.repeat_type == 2){
	 			$('#brepeatweekly').val(response.data.repeat_every);
				var repeat_detail = String(response.data.repeat_detail);
	 			$('#brepeatweekdays1').prop('checked', (repeat_detail.indexOf("1") >= 0));
	 			$('#brepeatweekdays2').prop('checked', (repeat_detail.indexOf("2") >= 0));
	 			$('#brepeatweekdays3').prop('checked', (repeat_detail.indexOf("3") >= 0));
	 			$('#brepeatweekdays4').prop('checked', (repeat_detail.indexOf("4") >= 0));
	 			$('#brepeatweekdays5').prop('checked', (repeat_detail.indexOf("5") >= 0));
	 			$('#brepeatuntil').val(moment(response.data.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
	 		}
	 		$('#deleteBlackoutButton').show();
	 		$('#createBlackout').modal('show');
		})
		.catch(function(error){
			site.handleError('retrieve blackout series', '', error);
		});
};

/**
 * Function to create a new student in the database
 */
var newStudent = function(){
	//prompt the user for an eID to add to the system
	var eid = prompt("Enter the student's eID");

	//build the URL and data
	var data = {
		eid: eid,
	};
	var url = '/profile/newstudent';

	//send AJAX post
	window.axios.post(url, data)
		.then(function(response){
			alert(response.data);
		})
		.catch(function(error){
			if(error.response){
				//If response is 422, errors were provided
				if(error.response.status == 422){
					alert("Unable to create user: " + error.response.data["eid"]);
				}else{
					alert("Unable to create user: " + error.response.data);
				}
			}
		});
};
