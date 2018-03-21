/**
 * Displays a message from the flashed session data
 *
 * use $request->session()->put('message', trans('messages.item_saved'));
 *     $request->session()->put('type', 'success');
 * to set message text and type
 */
exports.displayMessage = function(message, type){
	var html = '<div id="javascriptMessage" class="alert fade in alert-dismissable alert-' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">' + message + '</span></div>';
	$('#message').append(html);
	setTimeout(function() {
		$("#javascriptMessage").alert('close');
	}, 3000);
};

/*
exports.ajaxcrsf = function(){
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
};
*/

/**
 * Clears errors on forms by removing error classes
 */
exports.clearFormErrors = function(){
	$('.form-group').each(function (){
		$(this).removeClass('has-error');
		$(this).find('.help-block').text('');
	});
}

/**
 * Sets errors on forms based on response JSON
 */
exports.setFormErrors = function(json){
	exports.clearFormErrors();
	$.each(json, function (key, value) {
		$('#' + key).parents('.form-group').addClass('has-error');
		$('#' + key + 'help').text(value.join(' '));
	});
}

/**
 * Checks for messages in the flash data. Must be called explicitly by the page
 */
exports.checkMessage = function(){
	if($('#message_flash').length){
		var message = $('#message_flash').val();
		var type = $('#message_type_flash').val();
		exports.displayMessage(message, type);
	}
}

/**
 * Function to handle errors from AJAX
 *
 * @param message - the message to display to the user
 * @param element - the jQuery identifier of the element
 * @param error - the Axios error received
 */
exports.handleError = function(message, element, error){
	if(error.response){
		//If response is 422, errors were provided
		if(error.response.status == 422){
			exports.setFormErrors(error.response.data);
		}else{
			alert("Unable to " + message + ": " + error.response.data);
		}
	}

	//hide spinning icon
	if(element.length > 0){
		$(element + 'spin').addClass('hide-spin');
	}
}

/**
 * Function to truncate text
 *
 * @param text - the text to truncate
 * @param length - the maximum length
 *
 * http://jsfiddle.net/schadeck/GpCZL/
 */
exports.truncateText = function(text, length){
	if(text.length > length){
		return $.trim(text).substring(0, length).split(" ").slice(0, -1).join(" ") + "...";
	}else{
		return text;
	}
}
