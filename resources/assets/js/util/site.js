define(['jquery', 'bootstrap'], function(jquery, bootstrap) {
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

	var clearFormErrors = function(){
		$('.form-group').each(function (){
			$(this).removeClass('has-error');
			$(this).find('.help-block').text('');
		});
	}

	var setFormErrors = function(json){
		clearFormErrors();
		$.each(json, function (key, value) {
			$('#' + key).parents('.form-group').addClass('has-error');
			$('#' + key + 'help').text(value);
		});
	}


  return {
    displayMessage: displayMessage,
    ajaxcrsf: ajaxcrsf,
		clearFormErrors: clearFormErrors,
		setFormErrors: setFormErrors,
  };
});
