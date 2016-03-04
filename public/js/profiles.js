require(['util/site'], function(site) {

	site.ajaxcrsf();

	$('#saveProfile').on('click', function(){
		$('#profileSpin').removeClass('hide-spin');
		var data = {
			first_name: $('#first_name').val(),
			last_name: $('#last_name').val(),
		};
		$.ajax({
		  method: "POST",
		  url: '/profile/update',
		  data: data
		})
		.success(function( message ) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			$('#profileSpin').addClass('hide-spin');
			$('#profileAdvisingBtn').removeClass('hide-spin');
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
			}else{
				alert("Unable to save profile: " + jqXHR.responseJSON);
			}
			$('#profileSpin').addClass('hide-spin');
		});
	});

	$('#saveAdvisorProfile').on('click', function(){
		$('#profileSpin').removeClass('hide-spin');
		var data = {
			name: $('#name').val(),
			email: $('#email').val(),
			office: $('#office').val(),
			phone: $('#phone').val(),
			notes: $('#notes').val(),
		};
		$.ajax({
		  method: "POST",
		  url: '/profile/update',
		  data: data
		})
		.success(function( message ) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			$('#profileSpin').addClass('hide-spin');
			$('#profileAdvisingBtn').removeClass('hide-spin');
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
			}else{
				alert("Unable to save profile: " + jqXHR.responseJSON);
			}
			$('#profileSpin').addClass('hide-spin');
		});
	});

});

//# sourceMappingURL=profiles.js.map