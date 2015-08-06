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
	var calendarDeleteURL = $('#calendarDeleteURL').val().trim();
	var blackoutPostURL = $('#blackoutPostURL').val().trim();
	var blackoutDeleteURL = $('#blackoutDeleteURL').val().trim();

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
		    },
		],
	    timeFormat: ' ',
	    eventRender: function(event, element){
		    element.addClass("fc-clickable");
		},
		eventClick: function(event, element, view){
			if(event.type == 'm'){
				$('#title').val(event.title);
				$('#start').val(event.start.format("LLL"));
				$('#end').val(event.end.format("LLL"));
				$('#desc').val(event.desc);
				$('#meetingID').val(event.id);
				$('#deleteButton').show();
				$('#createEvent').modal('show');
			}else if (event.type == 'b'){
				$('#btitle').val(event.title);
				$('#bstart').val(event.start.format("LLL"));
				$('#bend').val(event.end.format("LLL"));
				$('#deleteBlackoutButton').show();
				$('#createBlackout').modal('show');
			}
		},
		selectable: true,
		selectHelper: true,
		selectOverlap: function(event) {
	        return event.rendering === 'background';
	    },
		select: function(start, end) {
			$('#btitle').val("");
			$('#bstart').val(start.format("LLL"));
			$('#bend').val(end.format("LLL"));
			$('#blackoutID').val(-1);
			$('#deleteBlackoutButton').hide();
			$('#createBlackout').modal('show');
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

	$('#createBlackout .input-group.date').datepicker({
	    daysOfWeekDisabled: "0,6"
	});

	$('#brepeat').change(function() {
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
	});

});