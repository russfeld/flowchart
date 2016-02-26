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
			$('.form-group').each(function (){
				$(this).removeClass('has-error');
				$(this).find('.help-block').text('');
			});
			$('#profileSpin').addClass('hide-spin');
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
				alert("Unable to save profile: " + jqXHR.responseJSON);
			}
			$('#profileSpin').addClass('hide-spin');
		});
	});

});
