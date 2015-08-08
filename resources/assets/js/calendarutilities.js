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
			url: 'advising/meetingfeed',
			type: 'GET',
			error: function() {
				alert('Error fetching meeting events from database');
			},
			color: '#512888',
			textColor: 'white',
		},
		{
			url: 'advising/blackoutfeed',
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

var saveMeeting = function(){
	var data = { start: moment($('#start').val(), "LLL").format(), end: moment($('#end').val(), "LLL").format(), title: $('#title').val(), id: calendarAdvisorID, desc: $('#desc').val() };
	if($('#meetingID').val() > 0){
		data.meetingid = $('#meetingID').val();
	}
	$.ajax({
	  method: "POST",
	  url: 'advising/createmeeting',
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
				$(this).find('span').text('');
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
		  url: 'advising/deletemeeting',
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