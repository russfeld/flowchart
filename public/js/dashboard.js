require(['util/site', 'adminlte', 'datatables.net', 'datatables.netbs'], function(site, adminlte, datatables, datatablesbs) {

  site.ajaxcrsf();

  $('body').addClass('skin-purple');

  $('#table').DataTable({
    "pageLength": 50,
    "lengthChange": false,
  });

  $('#save').on('click', function(){
    $('#spin').removeClass('hide-spin');
		var data = {
			first_name: $('#first_name').val(),
			last_name: $('#last_name').val(),
      email: $('#email').val(),
		};
    if($('#advisor').val() > 0){
      data.advisor = $('#advisor').val();
    }
    if($('#department').val() > 0){
      data.department = $('#department').val();
    }
    var id = $('#id').val();
		$.ajax({
		  method: "POST",
		  url: '/admin/students/' + id,
		  data: data
		})
		.success(function( message ) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			$('#spin').addClass('hide-spin');
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
			}else{
				alert("Unable to save: " + jqXHR.responseJSON);
			}
			$('#spin').addClass('hide-spin');
		});
  })
});

//# sourceMappingURL=dashboard.js.map