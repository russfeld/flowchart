require(['util/site', 'util/calendar', 'moment'], function(site, calendar, moment) {
	site.ajaxcrsf();

	calendar.init(true);

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

	var saveBlackout = function(){
		$('#createBlackoutSpin').removeClass('hide-spin');
		var data = {
			bstart: moment($('#bstart').val(), 'LLL').format(),
			bend: moment($('#bend').val(), 'LLL').format(),
			btitle: $('#btitle').val()
		};
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
			site.displayMessage(message, 'success');
			$('#calendar').fullCalendar('unselect');
			$('#calendar').fullCalendar('refetchEvents');
			$('#createBlackoutSpin').addClass('hide-spin');
			loadConflicts();
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
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
				site.displayMessage(message, 'success');
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
			calendar.showMeetingForm(event);
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

	var createBlackoutForm = function(){
		$('#btitle').val("");
		if(calendar.session.start === undefined){
			$('#bstart').val(moment().hour(8).minute(00).format('LLL'));
		}else{
			$('#bstart').val(calendar.session.start.format("LLL"));
		}
		if(calendar.session.end === undefined){
			$('#bend').val(moment().hour(9).minute(00).format('LLL'));
		}else{
			$('#bend').val(calendar.session.end.format("LLL"));
		}
		$('#bblackoutid').val(-1);
		$('#repeatdiv').show();
		$('#brepeat').val(0);
		$('#brepeat').trigger('change');
		$('#deleteBlackoutButton').hide();
		$('#createBlackout').modal('show');
	};

	var blackoutOccurrence = function(){
		$('#blackoutOption').modal('hide');
		$('#btitle').val(calendar.session.event.title);
		$('#bstart').val(calendar.session.event.start.format("LLL"));
		$('#bend').val(calendar.session.event.end.format("LLL"));
		$('#repeatdiv').hide();
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').hide();
		$('#bblackoutid').val(calendar.session.event.blackout_id);
		$('#bblackouteventid').val(calendar.session.event.id);
		$('#deleteBlackoutButton').show();
		$('#createBlackout').modal('show');
	};

	var blackoutSeries = function(){
		$('#blackoutOption').modal('hide');
		$.ajax({
			method: "GET",
			url: '/advising/blackout',
			data: {id: calendar.session.event.blackout_id},
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

	$('#createEvent').on('hidden.bs.modal', loadConflicts);

	$('#resolveConflict').on('hidden.bs.modal', loadConflicts);

	$('#resolveConflict').on('hidden.bs.modal', function(){
		$('#calendar').fullCalendar('refetchEvents');
	});

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

	$('#start_datepicker').datetimepicker(calendar.datePickerData);

  $('#end_datepicker').datetimepicker(calendar.datePickerData);

 	calendar.linkDatePickers('#start', '#end', '#duration');

 	$('#bstart_datepicker').datetimepicker(calendar.datePickerData);

  $('#bend_datepicker').datetimepicker(calendar.datePickerData);

 	calendar.linkDatePickers('#bstart', '#bend', '#bduration');

 	$('#brepeatuntil_datepicker').datetimepicker(calendar.datePickerDateOnly);

	// page is now ready, initialize the calendar...
	calendar.calendarData.eventSources[0].data = {id: calendar.calendarAdvisorID};
	calendar.calendarData.eventSources[1].data = {id: calendar.calendarAdvisorID};
	calendar.calendarData.eventRender = function(event, element){
		element.addClass("fc-clickable");
	};
	calendar.calendarData.eventClick = function(event, element, view){
		if(event.type == 'm'){
			$('#studentid').val(event.studentname);
			$('#studentidval').val(event.student_id);
			calendar.showMeetingForm(event);
		}else if (event.type == 'b'){
			calendar.session = {
				event: event
			};
			if(event.repeat == '0'){
				blackoutSeries();
			}else{
				$('#blackoutOption').modal('show');
			}
		}
	};
	calendar.calendarData.select = function(start, end) {
		calendar.session = {
			start: start,
			end: end
		};
		$('#bblackoutid').val(-1);
		$('#bblackouteventid').val(-1);
		$('#meetingID').val(-1);
		$('#meetingOption').modal('show');
	};

	if($(window).width() < 600){
		calendar.calendarData.defaultView = 'agendaDay';
	}

	$('#calendar').fullCalendar(calendar.calendarData);

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
		calendar.createMeetingForm();
	});

	$('#createMeetingBtn').bind('click', function(){
		calendar.session = {};
		calendar.createMeetingForm();
	});

	$('#blackoutButton').bind('click', function(){
		$('#meetingOption').modal('hide');
		createBlackoutForm();
	});

	$('#createBlackoutBtn').bind('click', function(){
		calendar.session = {};
		createBlackoutForm();
	});


	$('#resolveButton').on('click', resolveConflicts);

	loadConflicts();

});

//# sourceMappingURL=advisor-calendar.js.map
