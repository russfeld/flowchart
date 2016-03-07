require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();
  dashboard.init();

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
    var url = '/admin/students/' + id;
    $.ajax({
      method: "POST",
      url: url,
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
  });
});
