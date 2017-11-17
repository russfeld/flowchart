define(['jquery', 'bootstrap'], function(jquery, bootstrap) {
	var displayMessage = function(message, type){
		var html = '<div id="javascriptMessage" class="alert fade in alert-dismissable alert-' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">' + message + '</span></div>';
		$('#message').append(html);
		setTimeout(function() {
			$("#javascriptMessage").alert('close');
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
			$('#' + key + 'help').text(value.join(' '));
		});
	}

	var checkMessage = function(){
		if($('#message_flash').length){
			var message = $('#message_flash').val();
			var type = $('#message_type_flash').val();
			displayMessage(message, type);
		}
	}


  return {
    displayMessage: displayMessage,
    ajaxcrsf: ajaxcrsf,
		clearFormErrors: clearFormErrors,
		setFormErrors: setFormErrors,
		checkMessage: checkMessage,
  };
});
