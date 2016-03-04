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
		var formData = new FormData($('form')[0]);
		formData.append("name", $('#name').val());
		formData.append("email", $('#email').val());
		formData.append("office", $('#office').val());
		formData.append("phone", $('#phone').val());
		formData.append("notes", $('#notes').val());
		formData.append("pic", $('#pic')[0].files[0]);

		$.ajax({
		  method: "POST",
		  url: '/profile/update',
		  data: formData,
			dataType: 'json',
			processData: false,
			contentType: false,
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

	//http://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3/
	$(document).on('change', '.btn-file :file', function() {
	  var input = $(this),
	      numFiles = input.get(0).files ? input.get(0).files.length : 1,
	      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	  input.trigger('fileselect', [numFiles, label]);
	});

  $('.btn-file :file').on('fileselect', function(event, numFiles, label) {

      var input = $(this).parents('.input-group').find(':text'),
          log = numFiles > 1 ? numFiles + ' files selected' : label;

      if( input.length ) {
          input.val(log);
      } else {
          if( log ) alert(log);
      }

  });

});
