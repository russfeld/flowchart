define(['jquery', 'bootstrap', 'jquery.autocomplete', 'moment', 'bootstrap-datetimepicker', 'fullcalendar'], function(jquery, bootstrap, jqueryac, moment, boostrapdt, fullcalendar) {
	var session, calendarAdvisorID, studentName;

	var init = function(advisor = false){

		this.calendarAdvisorID = $('#calendarAdvisorID').val().trim();

		if(advisor){
			$('#createEvent').on('shown.bs.modal', function () {
			  $('#studentid').focus();
			});

			$('#title').prop('disabled', true);
			$('#start').prop('disabled', false);
			$('#studentid').prop('disabled', false);
			$('#start_span').removeClass('datepicker-disabled');
			$('#end').prop('disabled', false);
			$('#end_span').removeClass('datepicker-disabled');
			$('#studentiddiv').show();

			$('#createEvent').on('hidden.bs.modal', resetForm);
		}else{
			$('#createEvent').on('shown.bs.modal', function () {
			  $('#desc').focus();
			});

			$('#title').prop('disabled', true);
			$("#start").prop('disabled', true);
			$('#studentid').prop('disabled', true);
			$("#start_span").addClass('datepicker-disabled');
			$("#end").prop('disabled', true);
			$("#end_span").addClass('datepicker-disabled');
			$('#studentiddiv').hide();
			$('#studentidval').val(-1);

			studentName = $('#studentName').val().trim();

			$('.modal').on('hidden.bs.modal', resetForm);
		}


		$('#saveButton').bind('click', saveMeeting);
		$('#deleteButton').bind('click', deleteMeeting);
		$('#duration').on('change', changeDuration);
	}

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
	};

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
	};

	var changeDuration = function(){
		var newDate = moment($('#start').val(), 'LLL').add($(this).val(), "minutes");
		$('#end').val(newDate.format("LLL"));
	};

	var studentSelect = function(start, end) {
		if(end.diff(start, 'minutes') > 60){
			alert("Meetings cannot last longer than 1 hour");
			$('#calendar').fullCalendar('unselect');
		}else{
			session = {
				start: start,
				end: end
			};
			$('#meetingID').val(-1);
			createMeetingForm(studentName);
		}
	};

	return {
		init: init,
		saveMeeting: saveMeeting,
		deleteMeeting: deleteMeeting,
		showMeetingForm: showMeetingForm,
		createMeetingForm: createMeetingForm,
		resetForm: resetForm,
		durationOptions: durationOptions,
		linkDatePickers: linkDatePickers,
		changeDuration: changeDuration,
		session: session,
		calendarAdvisorID: calendarAdvisorID,
		studentName: studentName,
		calendarData: calendarData,
		datePickerData: datePickerData,
		datePickerDateOnly: datePickerDateOnly,
		studentSelect: studentSelect
	};
});

//# sourceMappingURL=calendar.js.map