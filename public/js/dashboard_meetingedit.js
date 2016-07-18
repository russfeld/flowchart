require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();

  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);
  site.checkMessage();

  //$("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newstudent">New Student</a>');

  $('#delete').on('click', function(){
    var choice = confirm("Are you sure?");
		if(choice === true){
      $('#spin').removeClass('hide-spin');
      var data = {
        id: $('#id').val(),
      };
      var url = "/admin/deletemeeting"
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        $(location).attr('href', '/admin/meetings');
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
    var choice = confirm("Are you sure? This will permanently remove this record. You cannot undo this action.");
		if(choice === true){
      $('#spin').removeClass('hide-spin');
      var data = {
        id: $('#id').val(),
      };
      var url = "/admin/forcedeletemeeting"
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        $(location).attr('href', '/admin/meetings');
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

//# sourceMappingURL=dashboard_meetingedit.js.map
