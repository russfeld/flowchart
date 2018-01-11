//load required JS libraries
require('fullcalendar');
require('jquery-autocomplete');
moment = require('moment');
site = require('./site');
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
exports.init = function(advisor, nobind){

	//tweak parameters
	advisor || (advisor = false);
	nobind || (nobind = false);

	//get the current advisor's ID
	exports.calendarAdvisorID = $('#calendarAdvisorID').val().trim();

	//If nobind, don't bind the forms
	if(!nobind){
		//If the current user is an advisor, bind more data
		if(advisor){

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
		}else{

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
}

/**
 * Function to save a meeting
 */
var saveMeeting = function(){

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
	if($('#meetingID').val() > 0){
		data.meetingid = $('#meetingID').val();
	}
	if($('#studentidval').val() > 0){
		data.studentid = $('#studentidval').val();
	}

	//AJAX POST to server
	window.axios.post('/advising/createmeeting', data)
	  //if response is 2xx
		.then(function(response){
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
		.catch(function(error){
			if(error.response){
				//If response is 422, errors were provided
				if(error.response.status == 422){
					site.setFormErrors(error.response.data);
				}else{
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
var deleteMeeting = function(){

	//prompt the user for confirmation
	var choice = confirm("Are you sure?");
	if(choice === true){

		//if confirmed, show spinning icon
		$('#createEventSpin').removeClass('hide-spin');

		//make AJAX request to delete
		window.axios.post('/advising/deletemeeting', {
			 meetingid: $('#meetingID').val()
		})
		.then(function(response){
			//hide the form
			$('#createEvent').modal('hide');

			//display the message to the user
			site.displayMessage(response.data, "success");

			//refresh the calendar
			$('#calendar').fullCalendar('unselect');
			$('#calendar').fullCalendar('refetchEvents');
			$('#createEventSpin').addClass('hide-spin');
		})
		.catch(function(error){
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
exports.showMeetingForm = function(event){
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
exports.createMeetingForm = function(calendarStudentName){

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
exports.resetForm = function(){
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
exports.linkDatePickers = function(elem1, elem2, duration){
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
exports.studentSelect = function(start, end) {

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
		exports.createMeetingForm(exports.calendarStudentName);
	}
};
