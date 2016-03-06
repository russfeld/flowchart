require(['util/site', 'util/calendar', 'moment'], function(site, calendar, moment) {
  	site.ajaxcrsf();

  	calendar.init(false);

    // page is now ready, initialize the calendar...

    calendar.calendarData.eventSources[0].data = {id: calendar.calendarAdvisorID};
    calendar.calendarData.eventSources[1].data = {id: calendar.calendarAdvisorID};
    calendar.calendarData.eventSources[1].rendering = 'background';

    calendar.calendarData.eventRender = function(event, element){
	    if(event.type == 'b'){
	        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
	    }
	    if(event.type == 's'){
	    	element.addClass("fc-green");
	    }
	};

	calendar.calendarData.eventClick = function(event, element, view){
		if(event.type == 's'){
			if(event.start.isAfter(moment())){
				calendar.showMeetingForm(event);
			}else{
				alert("You cannot edit meetings in the past");
			}
		}
	};

	calendar.calendarData.select = calendar.studentSelect;

	if($(window).width() < 600){
		calendar.calendarData.defaultView = 'agendaDay';
	}

	$('#calendar').fullCalendar(calendar.calendarData);
});
