var session, calendarAdvisorID, studentName;

var displayMessage = function(message, type){
	var html = '<div class="alert fade in alert-dismissable alert-' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">' + message + '</span></div>';
	$('#message').append(html);
	setTimeout(function() {
		$(".alert").alert('close');
	}, 3000);
};

var ajaxcrsf = function(){
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
};

var calendarData = {
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

var datePickerData = {
    daysOfWeekDisabled: [0, 6],
    format: 'LLL',
    stepping: 20,
    enabledHours: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    sideBySide: true,
    ignoreReadonly: true,
    allowInputToggle: true
};

var datePickerDateOnly = {
    daysOfWeekDisabled: [0, 6],
    format: 'MM/DD/YYYY',
    ignoreReadonly: true,
    allowInputToggle: true
};

var saveMeeting = function(){
	var data = { start: moment($('#start').val(), "LLL").format(), end: moment($('#end').val(), "LLL").format(), title: $('#title').val(), id: calendarAdvisorID, desc: $('#desc').val() };
	if($('#meetingID').val() > 0){
		data.meetingid = $('#meetingID').val();
	}
	if($('#studentidval').val() > 0){
		data.studentid = $('#studentidval').val();
	}
	$.ajax({
	  method: "POST",
	  url: '/advising/createmeeting',
	  data: data
	})
	.success(function( message ) {
		$('#createEvent').modal('hide');
		displayMessage(message, "success");
		$('#calendar').fullCalendar('unselect');
		$('#calendar').fullCalendar('refetchEvents');
	}).fail(function( jqXHR, message ){
		if (jqXHR.status == 422)
		{
			$('.form-group').each(function (){
				$(this).removeClass('has-error');
				$(this).find('.help-block').text('');
			});
			$.each(jqXHR.responseJSON, function (key, value) {
				$('#' + key).parents('.form-group').addClass('has-error');
				$('#' + key + 'help').text(value);
			});
		}else{
			alert("Unable to save meeting: " + JSON.stringify(jqXHR) + ' ' + message);
		}
	});
};

var deleteMeeting = function(){
	var choice = confirm("Are you sure?");
	if(choice === true){
		$.ajax({
		  method: "POST",
		  url: '/advising/deletemeeting',
		  data: { meetingid: $('#meetingID').val() }
		})
		.success(function( message ) {
			$('#createEvent').modal('hide');
			displayMessage(message, "success");
			$('#calendar').fullCalendar('unselect');
			$('#calendar').fullCalendar('refetchEvents');
		}).fail(function( jqXHR, message ){
			alert("Unable to delete meeting: " + JSON.stringify(jqXHR) + ' ' + message);
		});
	}
};

var showMeetingForm = function(event){
	$('#title').val(event.title);
	$('#start').val(event.start.format("LLL"));
	$('#end').val(event.end.format("LLL"));
	$('#desc').val(event.desc);
	$('#meetingID').val(event.id);
	$('#deleteButton').show();
	$('#createEvent').modal('show');
};

var createMeetingForm = function(studentName){
	if(studentName !== undefined){
		$('#title').val(studentName);
	}else{
		$('#title').val('');
	}
	$('#start').val(session.start.format("LLL"));
	$('#end').val(session.end.format("LLL"));
	$('#meetingID').val(-1);
	$('#studentidval').val(-1);
	$('#deleteButton').hide();
	$('#createEvent').modal('show');
};

var resetForm = function(){
    $(this).find('form')[0].reset();
    $(this).find('.has-error').each(function(){
		$(this).removeClass('has-error');
	});
	$(this).find('.help-block').each(function(){
		$(this).text('');
	});
};

var linkDatePickers = function(elem1, elem2){
	$(elem1 + "_datepicker").on("dp.change", function (e) {
		var date2 = moment($(elem2).val(), 'LLL');
		if(e.date.isAfter(date2) || e.date.isSame(date2)){
			date2 = e.date.clone();
			$(elem2).val(date2.format("LLL"));
		}
    });
    $(elem2 + "_datepicker").on("dp.change", function (e) {
        var date1 = moment($(elem1).val(), 'LLL');
		if(e.date.isBefore(date1) || e.date.isSame(date1)){
			date1 = e.date.clone();
			$(elem1).val(date1.format("LLL"));
		}
    });
}
//see calendarutils.js

$(document).ready(function() {

	ajaxcrsf();

	$('#createEvent').on('shown.bs.modal', function () {
	  $('#desc').focus();
	});

	$('#title').prop('disabled', true);
	$("#start").prop('disabled', true);
	$('#studentid').prop('disabled', true);
	$("#start_span").addClass('datepicker-disabled');
	$("#end").prop('disabled', true);
	$("#end_span").addClass('datepicker-disabled');
	$('#studentiddiv').hide();
	$('#studentidval').val(-1);

	calendarAdvisorID = $('#calendarAdvisorID').val().trim();
	studentName = $('#studentName').val().trim();

    // page is now ready, initialize the calendar...

    calendarData.eventSources[0].data = {id: calendarAdvisorID};
    calendarData.eventSources[1].data = {id: calendarAdvisorID};
    calendarData.eventSources[1].rendering = 'background';
    calendarData.eventRender = function(event, element){
	    if(event.type == 'b'){
	        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
	    }
	    if(event.type == 's'){
	    	element.addClass("fc-green");
	    }
	};
	calendarData.eventClick = function(event, element, view){
		if(event.type == 's'){
			if(event.start.isAfter(moment())){
				showMeetingForm(event);
			}else{
				alert("You cannot edit meetings in the past");
			}
		}
	};
	calendarData.select = function(start, end) {
		if(end.diff(start, 'minutes') > 60){
			alert("Meetings cannot last longer than 1 hour");
			$('#calendar').fullCalendar('unselect');
		}else{
			session = {
				start: start,
				end: end
			};
			$('#meetingID').val(-1);
			createMeetingForm(studentName);
		}
	};

    $('#calendar').fullCalendar(calendarData);

	$('#saveButton').bind('click', saveMeeting);

	$('#deleteButton').bind('click', deleteMeeting);

	$('.modal').on('hidden.bs.modal', resetForm);

});
//# sourceMappingURL=studentcalendar.js.map