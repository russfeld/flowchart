$(document).ready(function() {
	ajaxcrsf();

	$('#saveProfile').bind('click', saveProfile);
});

var ajaxcrsf = function(){
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
};

var saveProfile = function(){
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
		displayMessage(message, "success");
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
};

var displayMessage = function(message, type){
	var html = '<div class="alert fade in alert-dismissable alert-' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">' + message + '</span></div>';
	$('#message').append(html);
	setTimeout(function() {
		$(".alert").alert('close');
	}, 3000);
};