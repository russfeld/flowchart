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
		alert("Unable to retrieve blackout series: " + JSON.stringify(jqXHR) + ' ' + message);
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
			alert("Unable to save blackout: " + JSON.stringify(jqXHR) + ' ' + message);
		}
	});
};

var deleteBlackout = function(){
	var choice = confirm("Are you sure?");
	if(choice === true){
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
		}).fail(function( jqXHR, message ){
			alert("Unable to delete blackout: " + JSON.stringify(jqXHR) + ' ' + message);
		});
	}
};