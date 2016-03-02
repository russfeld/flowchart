require(['util/site', 'lib/pusher'], function(site, pusher) {

	site.ajaxcrsf();

	$('#groupRegisterBtn').on('click', function(){
		$('#groupSpin').removeClass('hide-spin');
		$.ajax({
		  method: "POST",
		  url: '/groupsession/register',
		})
		.success(function( message ) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
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

});
