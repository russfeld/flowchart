var site = require('../util/site');
require('codemirror');
require('codemirror/mode/xml/xml.js');
require('summernote');

exports.init = function(){

	$('#notes').summernote({
		focus: true,
		toolbar: [
			// [groupName, [list of buttons]]
			['style', ['style', 'bold', 'italic', 'underline', 'clear']],
			['font', ['strikethrough', 'superscript', 'subscript', 'link']],
			['para', ['ul', 'ol', 'paragraph']],
			['misc', ['fullscreen', 'codeview', 'help']],
		],
		tabsize: 2,
		codemirror: {
			mode: 'text/html',
			htmlMode: true,
			lineNumbers: true,
			theme: 'monokai'
		},
	});

	//bind click handler for save button
	$('#saveProfile').on('click', function(){

		//show spinning icon
		$('#profilespin').removeClass('hide-spin');

		//build data and URL
		var data = {
			first_name: $('#first_name').val(),
			last_name: $('#last_name').val(),
		};
		var url = '/profile/update';

		//send AJAX post
		window.axios.post(url, data)
			.then(function(response){
				site.displayMessage(response.data, "success");
				site.clearFormErrors();
				$('#profilespin').addClass('hide-spin');
				$('#profileAdvisingBtn').removeClass('hide-spin');
			})
			.catch(function(error){
				site.handleError('save profile', '#profile', error);
			})
	});

	//bind click handler for advisor save button
	$('#saveAdvisorProfile').on('click', function(){

		//show spinning icon
		$('#profilespin').removeClass('hide-spin');

		//build data and URL
		//TODO TESTME
		var data = new FormData($('form')[0]);
		data.append("name", $('#name').val());
		data.append("email", $('#email').val());
		data.append("office", $('#office').val());
		data.append("phone", $('#phone').val());
		data.append("notes", $('#notes').val());
		if($('#pic').val()){
			data.append("pic", $('#pic')[0].files[0]);
		}
		var url = '/profile/update';

		window.axios.post(url, data)
			.then(function(response){
				site.displayMessage(response.data, "success");
				site.clearFormErrors();
				$('#profilespin').addClass('hide-spin');
				$('#profileAdvisingBtn').removeClass('hide-spin');
				window.axios.get('/profile/pic')
					.then(function(response){
						$('#pictext').val(response.data);
						$('#picimg').attr('src', response.data);
					})
					.catch(function(error){
						site.handleError('retrieve picture', '', error);
					})
			})
			.catch(function(error){
				site.handleError('save profile', '#profile', error);
			});
	});

	//http://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3/
	$(document).on('change', '.btn-file :file', function() {
	  var input = $(this),
	      numFiles = input.get(0).files ? input.get(0).files.length : 1,
	      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	  input.trigger('fileselect', [numFiles, label]);
	});

	//bind to fileselect button
  $('.btn-file :file').on('fileselect', function(event, numFiles, label) {

      var input = $(this).parents('.input-group').find(':text');
			var log = numFiles > 1 ? numFiles + ' files selected' : label;

      if(input.length) {
          input.val(log);
      }else{
          if(log){
						alert(log);
					}
      }
  });
};
