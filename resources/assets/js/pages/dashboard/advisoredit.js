require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();

  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);
  site.checkMessage();

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newadvisor">New Advisor</a>');


  $('#save').on('click', function(){
    $('#spin').removeClass('hide-spin');
    var formData = new FormData($('form')[0]);
		formData.append("name", $('#name').val());
		formData.append("email", $('#email').val());
		formData.append("office", $('#office').val());
		formData.append("phone", $('#phone').val());
		formData.append("notes", $('#notes').val());
    formData.append("notes", $('#notes').val());
		if($('#pic').val()){
			formData.append("pic", $('#pic')[0].files[0]);
		}
    if($('#department').val() > 0){
      formData.append("department", $('#department').val());
    }
    var id = $('#id').val();
    if(id.length == 0){
      formData.append("eid", $('#eid').val());
      var url = '/admin/newadvisor';
    }else{
      var url = '/admin/advisors/' + id;
    }
		$.ajax({
		  method: "POST",
		  url: url,
		  data: formData,
			dataType: 'json',
			processData: false,
			contentType: false,
		})
		.success(function( message ) {
      if(id.length == 0){
        site.clearFormErrors();
        $('#spin').addClass('hide-spin');
        $(location).attr('href', message);
      }else{
  			site.displayMessage(message, "success");
  			site.clearFormErrors();
  			$('#spin').addClass('hide-spin');
  			$.ajax({
  				method: "GET",
  			  url: '/profile/pic/' + id,
  			})
  			.success(function(message){
  				$('#pictext').val(message);
  				$('#picimg').attr('src', message);
  			});
      }
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
			}else{
				alert("Unable to save: " + jqXHR.responseJSON);
			}
			$('#spin').addClass('hide-spin');
		});
  });

  $('#delete').on('click', function(){
    var choice = confirm("Are you sure?");
		if(choice === true){
      $('#spin').removeClass('hide-spin');
      var data = {
        id: $('#id').val(),
      };
      var url = "/admin/deleteadvisor"
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        $(location).attr('href', '/admin/advisors');
      })
      .fail(function( jqXHR, message ){
        if (jqXHR.status == 422)
        {
          site.setFormErrors(jqXHR.responseJSON);
        }else{
          alert("Unable to delete: " + jqXHR.responseJSON);
        }
        $('#spin').addClass('hide-spin');
      });
    }
  });

  $('#forcedelete').on('click', function(){
    var choice = confirm("Are you sure? This will permanently remove all related records. You cannot undo this action.");
		if(choice === true){
      $('#spin').removeClass('hide-spin');
      var data = {
        id: $('#id').val(),
      };
      var url = "/admin/forcedeleteadvisor"
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        $(location).attr('href', '/admin/advisors');
      })
      .fail(function( jqXHR, message ){
        if (jqXHR.status == 422)
        {
          site.setFormErrors(jqXHR.responseJSON);
        }else{
          alert("Unable to delete: " + jqXHR.responseJSON);
        }
        $('#spin').addClass('hide-spin');
      });
    }
  });

  $('#restore').on('click', function(){
    var choice = confirm("Are you sure?");
		if(choice === true){
      $('#spin').removeClass('hide-spin');
      var data = {
        id: $('#id').val(),
      };
      var url = "/admin/restoreadvisor"
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        $(location).attr('href', '/admin/advisors');
      })
      .fail(function( jqXHR, message ){
        if (jqXHR.status == 422)
        {
          site.setFormErrors(jqXHR.responseJSON);
        }else{
          alert("Unable to delete: " + jqXHR.responseJSON);
        }
        $('#spin').addClass('hide-spin');
      });
    }
  });

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
