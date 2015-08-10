var session,calendarAdvisorID,studentName,displayMessage=function(e,a){var t='<div class="alert fade in alert-dismissable alert-'+a+'"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">'+e+"</span></div>";$("#message").append(t),setTimeout(function(){$(".alert").alert("close")},3e3)},ajaxcrsf=function(){$.ajaxSetup({headers:{"X-CSRF-TOKEN":$('meta[name="csrf-token"]').attr("content")}})},calendarData={header:{left:"prev,next today",center:"title",right:"agendaWeek,agendaDay"},editable:!1,eventLimit:!0,height:"auto",weekends:!1,businessHours:{start:"8:00",end:"17:00",dow:[1,2,3,4,5]},defaultView:"agendaWeek",views:{agenda:{allDaySlot:!1,slotDuration:"00:20:00",minTime:"08:00:00",maxTime:"17:00:00"}},eventSources:[{url:"/advising/meetingfeed",type:"GET",error:function(){alert("Error fetching meeting events from database")},color:"#512888",textColor:"white"},{url:"/advising/blackoutfeed",type:"GET",error:function(){alert("Error fetching blackout events from database")},color:"#FF8888",textColor:"black"}],selectable:!0,selectHelper:!0,selectOverlap:function(e){return"background"===e.rendering},timeFormat:" "},datePickerData={daysOfWeekDisabled:[0,6],format:"LLL",stepping:20,enabledHours:[8,9,10,11,12,13,14,15,16],sideBySide:!0,ignoreReadonly:!0,allowInputToggle:!0},datePickerDateOnly={daysOfWeekDisabled:[0,6],format:"MM/DD/YYYY",ignoreReadonly:!0,allowInputToggle:!0},saveMeeting=function(){var e={start:moment($("#start").val(),"LLL").format(),end:moment($("#end").val(),"LLL").format(),title:$("#title").val(),id:calendarAdvisorID,desc:$("#desc").val()};$("#meetingID").val()>0&&(e.meetingid=$("#meetingID").val()),$("#studentidval").val()>0&&(e.studentid=$("#studentidval").val()),$.ajax({method:"POST",url:"/advising/createmeeting",data:e}).success(function(e){$("#createEvent").modal("hide"),displayMessage(e,"success"),$("#calendar").fullCalendar("unselect"),$("#calendar").fullCalendar("refetchEvents")}).fail(function(e,a){422==e.status?($(".form-group").each(function(){$(this).removeClass("has-error"),$(this).find(".help-block").text("")}),$.each(e.responseJSON,function(e,a){$("#"+e).parents(".form-group").addClass("has-error"),$("#"+e+"help").text(a)})):alert("Unable to save meeting: "+JSON.stringify(e)+" "+a)})},deleteMeeting=function(){var e=confirm("Are you sure?");e===!0&&$.ajax({method:"POST",url:"/advising/deletemeeting",data:{meetingid:$("#meetingID").val()}}).success(function(e){$("#createEvent").modal("hide"),displayMessage(e,"success"),$("#calendar").fullCalendar("unselect"),$("#calendar").fullCalendar("refetchEvents")}).fail(function(e,a){alert("Unable to delete meeting: "+JSON.stringify(e)+" "+a)})},showMeetingForm=function(e){$("#title").val(e.title),$("#start").val(e.start.format("LLL")),$("#end").val(e.end.format("LLL")),$("#desc").val(e.desc),$("#meetingID").val(e.id),$("#deleteButton").show(),$("#createEvent").modal("show")},createMeetingForm=function(e){$("#title").val(void 0!==e?e:""),$("#start").val(session.start.format("LLL")),$("#end").val(session.end.format("LLL")),$("#meetingID").val(-1),$("#studentidval").val(-1),$("#deleteButton").hide(),$("#createEvent").modal("show")},resetForm=function(){$(this).find("form")[0].reset(),$(this).find(".has-error").each(function(){$(this).removeClass("has-error")}),$(this).find(".help-block").each(function(){$(this).text("")})},linkDatePickers=function(e,a){$(e+"_datepicker").on("dp.change",function(e){var t=moment($(a).val(),"LLL");(e.date.isAfter(t)||e.date.isSame(t))&&(t=e.date.clone(),$(a).val(t.format("LLL")))}),$(a+"_datepicker").on("dp.change",function(a){var t=moment($(e).val(),"LLL");(a.date.isBefore(t)||a.date.isSame(t))&&(t=a.date.clone(),$(e).val(t.format("LLL")))})};$(document).ready(function(){ajaxcrsf(),$("#createEvent").on("shown.bs.modal",function(){$("#desc").focus()}),$("#title").prop("disabled",!0),$("#start").prop("disabled",!0),$("#studentid").prop("disabled",!0),$("#start_span").addClass("datepicker-disabled"),$("#end").prop("disabled",!0),$("#end_span").addClass("datepicker-disabled"),$("#studentiddiv").hide(),$("#studentidval").val(-1),calendarAdvisorID=$("#calendarAdvisorID").val().trim(),studentName=$("#studentName").val().trim(),calendarData.eventSources[0].data={id:calendarAdvisorID},calendarData.eventSources[1].data={id:calendarAdvisorID},calendarData.eventSources[1].rendering="background",calendarData.eventRender=function(e,a){"b"==e.type&&a.append('<div style="color: #000000; z-index: 5;">'+e.title+"</div>"),"s"==e.type&&a.addClass("fc-green")},calendarData.eventClick=function(e,a,t){"s"==e.type&&(e.start.isAfter(moment())?showMeetingForm(e):alert("You cannot edit meetings in the past"))},calendarData.select=function(e,a){a.diff(e,"minutes")>60?(alert("Meetings cannot last longer than 1 hour"),$("#calendar").fullCalendar("unselect")):(session={start:e,end:a},$("#meetingID").val(-1),createMeetingForm(studentName))},$("#calendar").fullCalendar(calendarData),$("#saveButton").bind("click",saveMeeting),$("#deleteButton").bind("click",deleteMeeting),$(".modal").on("hidden.bs.modal",resetForm)});