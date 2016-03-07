require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();
  dashboard.init();

  $('#save').on('click', function(){
    $('#spin').removeClass('hide-spin');
    var data = {
      name: $('#name').val(),
      email: $('#email').val(),
      office: $('#office').val(),
      phone: $('#phone').val(),
    };
    var id = $('#id').val();
    var url = '/admin/departments/' + id;
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

//# sourceMappingURL=dashboard_departmentedit.js.map