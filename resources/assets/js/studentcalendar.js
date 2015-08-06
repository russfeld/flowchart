$(document).ready(function() {

	$.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
	});

	$('#createEvent').on('shown.bs.modal', function () {
	  $('#desc').focus()
	})

	var calendarFeedURL = $('#calendarFeedURL').val().trim();
	var calendarAdvisorID = $('#calendarAdvisorID').val().trim();
	var calendarBlackoutFeedURL = $('#calendarBlackoutFeedURL').val().trim();
	var calendarPostURL = $('#calendarPostURL').val().trim();
	var studentName = $('#studentName').val().trim();
	var calendarDeleteURL = $('#calendarDeleteURL').val().trim();

    // page is now ready, initialize the calendar...

    $('#calendar').fullCalendar({
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
		        url: calendarFeedURL,
		        type: 'GET',
		        data: {
		            id: calendarAdvisorID,
		        },
		        error: function() {
		            alert('Error fetching meeting events from database');
		        },
		        color: '#512888',
		        textColor: 'white',
		    },
		    {
		        url: calendarBlackoutFeedURL,
		        type: 'GET',
		        data: {
		            id: calendarAdvisorID,
		        },
		        error: function() {
		            alert('Error fetching blackout events from database');
		        },
		        color: '#FF8888',
		        textColor: 'black',
		        rendering: 'background'
		    },
		],
	    timeFormat: ' ',
	    eventRender: function(event, element){
		    if(event.type == 'b'){
		        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
		    }
		    if(event.type == 's'){
		    	element.addClass("fc-green");
		    }
		},
		eventClick: function(event, element, view){
			if(event.type == 's'){
				$('#title').val(event.title);
				$('#start').val(event.start.format("LLL"));
				$('#end').val(event.end.format("LLL"));
				$('#desc').val(event.desc);
				$('#meetingID').val(event.id);
				$('#deleteButton').show();
				$('#createEvent').modal('show');
			}
		},
		selectable: true,
		selectHelper: true,
		selectOverlap: function(event) {
	        return event.rendering === 'background';
	    },
		select: function(start, end) {
			$('#title').val(studentName);
			$('#start').val(start.format("LLL"));
			$('#end').val(end.format("LLL"));
			$('#meetingID').val(-1);
			$('#deleteButton').hide();
			$('#createEvent').modal('show');
		},

	});

	$('#saveButton').bind('click', function(){
		var data = { start: moment($('#start').val(), "LLL").format(), end: moment($('#end').val(), "LLL").format(), title: $('#title').val(), id: calendarAdvisorID, desc: $('#desc').val() };
		if($('#meetingID').val() > 0){
			data.meetingid = $('#meetingID').val();
		}
		$.ajax({
		  method: "POST",
		  url: calendarPostURL,
		  data: data
		})
	  	.success(function( message ) {
	  		$('#createEvent').modal('hide');
	  		$('#calendar').fullCalendar('unselect');
	  		$('#calendar').fullCalendar('refetchEvents');
	  	}).fail(function( jqXHR, message ){
	  		if (jqXHR.status == 422)
		    {
		    	$('.form-group').each(function (){
		    		$(this).removeClass('has-error');
		    		$(this).find('span').text('');
		    	})
		        $.each(jqXHR.responseJSON, function (key, value) {
		            $('#' + key).parent().addClass('has-error');
		            $('#' + key + 'help').text(value);
		        });
		    }else{
	  			alert("Unable to save meeting: " + JSON.stringify(jqXHR) + ' ' + message)
	  		}
	  	});
	});

	$('#deleteButton').bind('click', function(){
		var choice = confirm("Are you sure?");
		if(choice == true){
			$.ajax({
			  method: "POST",
			  url: calendarDeleteURL,
			  data: { meetingid: $('#meetingID').val() }
			})
			.success(function( message ) {
		  		$('#createEvent').modal('hide');
		  		$('#calendar').fullCalendar('unselect');
		  		$('#calendar').fullCalendar('refetchEvents');
		  	}).fail(function( jqXHR, message ){
	  			alert("Unable to delete meeting: " + JSON.stringify(jqXHR) + ' ' + message)
		  	});
		}
	});

});