require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();

  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);
  site.checkMessage();

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newstudent">New Student</a>');

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
    if(id.length == 0){
      data.eid = $('#eid').val();
      var url = '/admin/newstudent';
    }else{
      var url = '/admin/students/' + id;
    }
    $.ajax({
      method: "POST",
      url: url,
      data: data
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
      var url = "/admin/deletestudent"
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        $(location).attr('href', '/admin/students');
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

});

//# sourceMappingURL=dashboard_studentedit.js.map