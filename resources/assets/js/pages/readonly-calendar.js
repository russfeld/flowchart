require(['util/site', 'util/calendar', 'moment'], function(site, calendar, moment) {
  	site.ajaxcrsf();

  	calendar.init(false, true);

    // page is now ready, initialize the calendar...

    calendar.calendarData.eventSources[0].data = {id: calendar.calendarAdvisorID};
    calendar.calendarData.eventSources[1].data = {id: calendar.calendarAdvisorID};
    calendar.calendarData.eventSources[1].rendering = 'background';
    calendar.calendarData.selectable = false;

    calendar.calendarData.eventRender = function(event, element){
	    if(event.type == 'b'){
	        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
	    }
	    if(event.type == 's'){
	    	element.addClass("fc-green");
	    }
	};

	if($(window).width() < 600){
		calendar.calendarData.defaultView = 'agendaDay';
	}

	$('#calendar').fullCalendar(calendar.calendarData);
});
