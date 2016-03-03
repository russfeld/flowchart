require(['util/site', 'lib/pusher'], function(site, pusher) {

	site.ajaxcrsf();

	var getStatus = function(data){
		if(data.status === 0) return "NEW";
		if(data.status === 1) return "QUEUED";
		if(data.status === 2) return "BECKON";
		if(data.status === 3) return "DELAY";
		if(data.status === 4) return "ABSENT";
		if(data.status === 5) return "COMPLETE";
	}

	var listAdd = function(data){
		$('#groupList').append("<div class='alert alert-info' role='alert'>" + data.name + " <span class='badge'>" + getStatus(data) + "</span></div>");
	}

	$('#groupRegisterBtn').on('click', function(){
		$('#groupSpin').removeClass('hide-spin');
		$.ajax({
		  method: "POST",
		  url: '/groupsession/register',
		})
		.success(function( message ) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			$('#groupRegisterBtn').attr('disabled', 'disabled');
			$('#groupSpin').addClass('hide-spin');
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
			}else{
				alert("Unable to register: " + jqXHR.responseJSON);
			}
			$('#groupSpin').addClass('hide-spin');
		});
	});

	var pusherInstance = new Pusher(pusherKey);
	var groupSessionChannel = pusherInstance.subscribe( 'groupsession' );

	pusherInstance.connection.bind('connected', function() {
	  $('#groupRegisterBtn').removeAttr('disabled');
		$('#groupSpin').addClass('hide-spin');
	});

	groupSessionChannel.bind( "App\\Events\\GroupsessionRegister", function(data){
		listAdd(data);
	});

	Pusher.log = function(message) {
	  if (window.console && window.console.log) {
	    window.console.log(message);
	  }
	};

});
