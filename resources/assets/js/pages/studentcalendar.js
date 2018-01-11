exports.init = function(){

  //Load required libraries
  calendar = require('../util/calendar');
  site = require('../util/site');

  //Check for messages in the sessionn from a previous action
	site.checkMessage();

  //Initialize the calendar library as a student view
	calendar.init(false);

  //Set the advisor information for meeting event source
  calendar.calendarData.eventSources[0].data = {id: calendar.calendarAdvisorID};

  //Set the advsior inforamtion for blackout event source
  calendar.calendarData.eventSources[1].data = {id: calendar.calendarAdvisorID};
  //Render blackouts to background
  calendar.calendarData.eventSources[1].rendering = 'background';

  //When rendering, use this custom function for blackouts and student meetings
  calendar.calendarData.eventRender = function(event, element){
    if(event.type == 'b'){
        element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
    }
    if(event.type == 's'){
    	element.addClass("fc-green");
    }
	};

  //Use this method for clicking on meetings
	calendar.calendarData.eventClick = function(event, element, view){
		if(event.type == 's'){
			if(event.start.isAfter(moment())){
				calendar.showMeetingForm(event);
			}else{
				alert("You cannot edit meetings in the past");
			}
		}
	};

  //When selecting new areas, use the studentSelect method in the calendar library
	calendar.calendarData.select = calendar.studentSelect;

  //if the window is small, set different default for calendar
	if($(window).width() < 600){
		calendar.calendarData.defaultView = 'agendaDay';
	}

  //initalize the calendar!
	$('#calendar').fullCalendar(calendar.calendarData);
};
