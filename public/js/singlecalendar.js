$(document).ready(function() {

	$.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
	});

	var calendarFeedURL = $('#calendarFeedURL').val().trim();
	var calendarAdvisorID = $('#calendarAdvisorID').val().trim();
	var calendarBlackoutFeedURL = $('#calendarBlackoutFeedURL').val().trim();
	var calendarPostURL = $('#calendarPostURL').val().trim();

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
		        color: '#FF6666',
		        textColor: 'black',
		        rendering: 'background'
		    },
		],
	    timeFormat: '',
	    eventRender: function(event, element){
		    if(event.type == 'b'){
		        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
		    }
		},
		selectable: true,
		selectHelper: true,
		selectOverlap: function(event) {
	        return event.rendering === 'background';
	    },
		select: function(start, end) {
			var title = prompt('Meeting Title:');
			console.log(start.format());
			console.log(end.format());
			if (title) {
				$.ajax({
				  method: "POST",
				  url: calendarPostURL,
				  data: { start: start.format(), end: end.format(), title: title, id: calendarAdvisorID }
				})
			  	.done(function( message ) {
			  		$('#calendar').fullCalendar('refetchEvents');
			  	}).fail(function( header, message ){
			  		alert("Unable to save meeting: " + message);
			  	});
			  	$('#calendar').fullCalendar('unselect');
			}
		},

	})

});
//# sourceMappingURL=singlecalendar.js.map