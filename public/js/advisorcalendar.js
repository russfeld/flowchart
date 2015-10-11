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
    enabledHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    maxHour: 17,
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
	$('#createEventSpin').removeClass('hide-spin');
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
		$('#createEventSpin').addClass('hide-spin');
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
			alert("Unable to save meeting: " + jqXHR.responseJSON);
		}
		$('#createEventSpin').addClass('hide-spin');
	});
};

var deleteMeeting = function(){
	var choice = confirm("Are you sure?");
	if(choice === true){
		$('#createEventSpin').removeClass('hide-spin');
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
			$('#createEventSpin').addClass('hide-spin');
		}).fail(function( jqXHR, message ){
			alert("Unable to delete meeting: " + jqXHR.responseJSON);
			$('#createEventSpin').addClass('hide-spin');
		});
	}
};

var showMeetingForm = function(event){
	$('#title').val(event.title);
	$('#start').val(event.start.format("LLL"));
	$('#end').val(event.end.format("LLL"));
	$('#desc').val(event.desc);
	durationOptions(event.start, event.end);
	$('#meetingID').val(event.id);
	$('#studentidval').val(event.student_id);
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
	durationOptions(session.start, session.end);
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

var durationOptions = function(start, end){
	$('#duration').empty();
	$('#duration').append("<option value='20'>20 minutes</option>");
	if(start.hour() < 16 || (start.hour() == 16 && start.minutes() <= 20)){
		$('#duration').append("<option value='40'>40 minutes</option>");
	}
	if(start.hour() < 16 || (start.hour() == 16 && start.minutes() <= 0)){
		$('#duration').append("<option value='60'>60 minutes</option>");
	}
	$('#duration').val(end.diff(start, "minutes"));
}

var linkDatePickers = function(elem1, elem2, duration){
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

var changeDuration = function(){
	var newDate = moment($('#start').val(), 'LLL').add($(this).val(), "minutes");
	$('#end').val(newDate.format("LLL"));
}


$(document).ready(function() {

	ajaxcrsf();

	$('#createEvent').on('shown.bs.modal', function () {
	  $('#studentid').focus();
	});

	$('#createBlackout').on('shown.bs.modal', function () {
	  $('#btitle').focus();
	});

	$('#createBlackout').on('hidden.bs.modal', function(){
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').hide();
		$(this).find('form')[0].reset();
	    $(this).find('.has-error').each(function(){
			$(this).removeClass('has-error');
		});
		$(this).find('.help-block').each(function(){
			$(this).text('');
		});
	});

	$('#createEvent').on('hidden.bs.modal', resetForm);

	$('#createEvent').on('hidden.bs.modal', loadConflicts);

	$('#resolveConflict').on('hidden.bs.modal', loadConflicts);

	$('#resolveConflict').on('hidden.bs.modal', function(){
		$('#calendar').fullCalendar('refetchEvents');
	});

	$('#title').prop('disabled', true);
	$('#start').prop('disabled', false);
	$('#studentid').prop('disabled', false);
	$('#start_span').removeClass('datepicker-disabled');
	$('#end').prop('disabled', false);
	$('#end_span').removeClass('datepicker-disabled');
	$('#studentiddiv').show();

	$('#studentid').autocomplete({
	    serviceUrl: 'profile/studentfeed',
	    ajaxSettings: {
	    	dataType: "json"
	    },
	    onSelect: function (suggestion) {
	        $('#studentidval').val(suggestion.data);
	        $('#title').val($('#studentid').val());
	    },
	    transformResult: function(response) {
        return {
            suggestions: $.map(response.data, function(dataItem) {
                return { value: dataItem.value, data: dataItem.data };
            })
        };
    }
	});

	$('#start_datepicker').datetimepicker(datePickerData);

    $('#end_datepicker').datetimepicker(datePickerData);

 	linkDatePickers('#start', '#end', '#duration');

 	$('#bstart_datepicker').datetimepicker(datePickerData);

    $('#bend_datepicker').datetimepicker(datePickerData);

 	linkDatePickers('#bstart', '#bend', '#bduration');

 	$('#brepeatuntil_datepicker').datetimepicker(datePickerDateOnly);

	calendarAdvisorID = $('#calendarAdvisorID').val().trim();

	// page is now ready, initialize the calendar...
	calendarData.eventSources[0].data = {id: calendarAdvisorID};
	calendarData.eventSources[1].data = {id: calendarAdvisorID};
	calendarData.eventRender = function(event, element){
		element.addClass("fc-clickable");
	};
	calendarData.eventClick = function(event, element, view){
		if(event.type == 'm'){
			$('#studentid').val(event.studentname);
			$('#studentidval').val(event.student_id);
			showMeetingForm(event);
		}else if (event.type == 'b'){
			session = {
				event: event
			};
			if(event.repeat == '0'){
				blackoutSeries();
			}else{
				$('#blackoutOption').modal('show');
			}
		}
	};
	calendarData.select = function(start, end) {
		session = {
			start: start,
			end: end
		};
		$('#bblackoutid').val(-1);
		$('#bblackouteventid').val(-1);
		$('#meetingID').val(-1);
		$('#meetingOption').modal('show');
	};
	
	if($(window).width() < 600){
		calendarData.defaultView = 'agendaDay';
	}

	$('#calendar').fullCalendar(calendarData);

	$('#saveButton').bind('click', saveMeeting);

	$('#deleteButton').bind('click', deleteMeeting);

	$('#brepeat').change(repeatChange);

	$('#saveBlackoutButton').bind('click', saveBlackout);

	$('#deleteBlackoutButton').bind('click', deleteBlackout);

	$('#blackoutSeries').bind('click', function(){
		$('#blackoutOption').modal('hide');
		blackoutSeries();
	});

	$('#blackoutOccurrence').bind('click', function(){
		$('#blackoutOption').modal('hide');
		blackoutOccurrence();
	});

	$('#advisingButton').bind('click', function(){
		$('#meetingOption').modal('hide');
		createMeetingForm();
	});

	$('#blackoutButton').bind('click', function(){
		$('#meetingOption').modal('hide');
		createBlackoutForm();
	});

	$('#duration').on('change', changeDuration);

	$('#resolveButton').on('click', resolveConflicts);

	loadConflicts();
});

var createBlackoutForm = function(){
	$('#btitle').val("");
	$('#bstart').val(session.start.format('LLL'));
	$('#bend').val(session.end.format('LLL'));
	$('#bblackoutid').val(-1);
	$('#repeatdiv').show();
	$('#brepeat').val(0);
	$('#brepeat').trigger('change');
	$('#deleteBlackoutButton').hide();
	$('#createBlackout').modal('show');
};

var blackoutOccurrence = function(){
	$('#blackoutOption').modal('hide');
	$('#btitle').val(session.event.title);
	$('#bstart').val(session.event.start.format("LLL"));
	$('#bend').val(session.event.end.format("LLL"));
	$('#repeatdiv').hide();
	$('#repeatdailydiv').hide();
	$('#repeatweeklydiv').hide();
	$('#repeatuntildiv').hide();
	$('#bblackoutid').val(session.event.blackout_id);
	$('#bblackouteventid').val(session.event.id);
	$('#deleteBlackoutButton').show();
	$('#createBlackout').modal('show');
};

var blackoutSeries = function(){
	$('#blackoutOption').modal('hide');
	$.ajax({
	  method: "GET",
	  url: '/advising/blackout',
	  data: {id: session.event.blackout_id},
	  dataType: 'json'
	})
	.success(function( series ) {
			$('#btitle').val(series.title)
			$('#bstart').val(moment(series.start, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
			$('#bend').val(moment(series.end, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
			$('#bblackoutid').val(series.id);
			$('#bblackouteventid').val(-1);
			$('#repeatdiv').show();
			$('#brepeat').val(series.repeat_type);
			$('#brepeat').trigger('change');
			if(series.repeat_type == 1){
				$('#brepeatdaily').val(series.repeat_every);
				$('#brepeatuntil').val(moment(series.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
			}else if (series.repeat_type == 2){
				$('#brepeatweekly').val(series.repeat_every);
				$('#brepeatweekdays1').prop('checked', (series.repeat_detail.indexOf("1") >= 0));
				$('#brepeatweekdays2').prop('checked', (series.repeat_detail.indexOf("2") >= 0));
				$('#brepeatweekdays3').prop('checked', (series.repeat_detail.indexOf("3") >= 0));
				$('#brepeatweekdays4').prop('checked', (series.repeat_detail.indexOf("4") >= 0));
				$('#brepeatweekdays5').prop('checked', (series.repeat_detail.indexOf("5") >= 0));
				$('#brepeatuntil').val(moment(series.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
			}
			$('#deleteBlackoutButton').show();
			$('#createBlackout').modal('show');
	}).fail(function( jqXHR, message ){
		alert("Unable to retrieve blackout series: " + jqXHR.responseJSON);
	});
};

var repeatChange = function(){
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
};

var saveBlackout = function(){
	$('#createBlackoutSpin').removeClass('hide-spin');
	var data = { bstart: moment($('#bstart').val(), 'LLL').format(), bend: moment($('#bend').val(), 'LLL').format(), btitle: $('#btitle').val()};
	var url;

	if($('#bblackouteventid').val() > 0){
		url = '/advising/createblackoutevent';
		data.bblackouteventid = $('#bblackouteventid').val();
	}else{
		url = '/advising/createblackout';
		if($('#bblackoutid').val() > 0){
			data.bblackoutid = $('#bblackoutid').val();
		}
		data.brepeat = $('#brepeat').val();
		if($('#brepeat').val() == 1){
			data.brepeatevery= $('#brepeatdaily').val();
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
		if($('#brepeat').val() == 2){
			data.brepeatevery = $('#brepeatweekly').val();
			data.brepeatweekdaysm = $('#brepeatweekdays1').prop('checked');
			data.brepeatweekdayst = $('#brepeatweekdays2').prop('checked');
			data.brepeatweekdaysw = $('#brepeatweekdays3').prop('checked');
			data.brepeatweekdaysu = $('#brepeatweekdays4').prop('checked');
			data.brepeatweekdaysf = $('#brepeatweekdays5').prop('checked');
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
	}
	$.ajax({
	  method: "POST",
	  url: url,
	  data: data
	})
	.success(function( message ) {
		$('#createBlackout').modal('hide');
		displayMessage(message, 'success');
		$('#calendar').fullCalendar('unselect');
		$('#calendar').fullCalendar('refetchEvents');
		$('#createBlackoutSpin').addClass('hide-spin');
		loadConflicts();
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
			alert("Unable to save blackout: " + jqXHR.responseJSON);
		}
		$('#createBlackoutSpin').addClass('hide-spin');
	});
};

var deleteBlackout = function(){
	var choice = confirm("Are you sure?");
	if(choice === true){
		$('#createBlackoutSpin').removeClass('hide-spin');
		var url, data;
		if($('#bblackouteventid').val() > 0){
			url = '/advising/deleteblackoutevent';
			data = { bblackouteventid: $('#bblackouteventid').val() };
		}else{
			url = '/advising/deleteblackout';
			data = { bblackoutid: $('#bblackoutid').val() };
		}
		$.ajax({
		  method: 'POST',
		  url: url,
		  data: data
		})
		.success(function( message ) {
			$('#createBlackout').modal('hide');
			displayMessage(message, 'success');
			$('#calendar').fullCalendar('unselect');
			$('#calendar').fullCalendar('refetchEvents');
			$('#createBlackoutSpin').addClass('hide-spin');
			loadConflicts();
		}).fail(function( jqXHR, message ){
			alert("Unable to delete blackout: " + jqXHR.responseJSON);
			$('#createBlackoutSpin').addClass('hide-spin');
		});
	}
};

var loadConflicts = function(){
	$.ajax({
	  method: "GET",
	  url: '/advising/conflicts',
	  dataType: 'json'
	})
	.success(function(data, message, jqXHR) {
		$(document).off('click', '.deleteConflict', deleteConflict);
		$(document).off('click', '.editConflict', editConflict);
		$(document).off('click', '.resolveConflict', resolveConflict);
		if(jqXHR.status == 200){
			$('#resolveConflictMeetings').empty();
			$.each(data, function(index, value){
				$('<div/>', {
					'class': 'meeting-conflict',
			        'html': 	'<p>&nbsp;<button type="button" class="btn btn-danger pull-right deleteConflict" data-id='+value.id+'>Delete</button>' +
			        			'&nbsp;<button type="button" class="btn btn-primary pull-right editConflict" data-id='+value.id+'>Edit</button> ' +
			        			'<button type="button" class="btn btn-success pull-right resolveConflict" data-id='+value.id+'>Keep Meeting</button>' +
			        			'<span id="resolveSpin'+value.id+'" class="fa fa-cog fa-spin fa-lg pull-right hide-spin">&nbsp;</span>' +
			        	   		'<b>'+value.title+'</b> ('+value.start+')</p><hr>'
			    }).appendTo('#resolveConflictMeetings');
			});
			$(document).on('click', '.deleteConflict', deleteConflict);
			$(document).on('click', '.editConflict', editConflict);
			$(document).on('click', '.resolveConflict', resolveConflict);
			$('#conflictingMeetings').removeClass('hidden');
		}else if (jqXHR.status == 204){
			$('#conflictingMeetings').addClass('hidden');
		}
	}).fail(function( jqXHR, message ){
		alert("Unable to retrieve conflicting meetings: " + jqXHR.responseJSON);
	});
}

var resolveConflicts = function(){
	$('#resolveConflict').modal('show');
};

var deleteConflict = function(){
	var caller = $(this);
	var id = $(this).data('id');
	var choice = confirm("Are you sure?");
	if(choice === true){
		$('#resolveSpin' + id).removeClass('hide-spin');
		$.ajax({
		  method: "POST",
		  url: '/advising/deletemeeting',
		  data: {meetingid: id}
		})
		.success(function( message ) {
			$('#resolveSpin' + id).addClass('hide-spin');
			caller.parent().parent().addClass('hidden');
		}).fail(function( jqXHR, message ){
			alert("Unable to delete meeting: " + jqXHR.responseJSON);
			$('#resolveSpin' + id).addClass('hide-spin');
		});
	}
};

var editConflict = function(){
	var caller = $(this);
	var id = $(this).data('id');
	$('#resolveSpin' + id).removeClass('hide-spin');
	$.ajax({
	  method: 'get',
	  url: '/advising/meeting',
	  data: {meetingid: id}
	})
	.success(function( message ) {
		$('#resolveSpin' + id).addClass('hide-spin');
		$('#resolveConflict').modal('hide');
		event = JSON.parse(message);
		event.start = moment(event.start);
		event.end = moment(event.end);
		showMeetingForm(event);
	}).fail(function( jqXHR, message ){
		$('#resolveSpin' + id).addClass('hide-spin');
		alert("Unable to retrieve meeting: " + jqXHR.responseJSON);
	});
};

var resolveConflict = function(){
	var caller = $(this);
	var id = $(this).data('id');
	$('#resolveSpin' + id).removeClass('hide-spin');
	$.ajax({
	  method: 'POST',
	  url: '/advising/resolveconflict',
	  data: {meetingid: id}
	})
	.success(function( message ) {
		$('#resolveSpin' + id).addClass('hide-spin');
		caller.parent().parent().addClass('hidden');
	}).fail(function( jqXHR, message ){
		alert("Unable to resolve: " + jqXHR.responseJSON);
		$('#resolveSpin' + id).addClass('hide-spin');
	});
};
//# sourceMappingURL=advisorcalendar.js.map