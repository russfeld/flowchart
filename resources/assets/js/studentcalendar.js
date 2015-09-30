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

	if($(window).width() < 600){
		calendarData.defaultView = 'agendaDay';
	}

    $('#calendar').fullCalendar(calendarData);

	$('#saveButton').bind('click', saveMeeting);

	$('#deleteButton').bind('click', deleteMeeting);

	$('.modal').on('hidden.bs.modal', resetForm);

	$('#duration').on('change', changeDuration);

});