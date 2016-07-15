require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();

  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);
  site.checkMessage();

  //$("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newstudent">New Student</a>');

  $('.settingsbutton').on('click', function(){
    var data = {
      key: $(this).attr('id'),
    };
    var url = '/admin/savesetting';
    $.ajax({
      method: "POST",
      url: url,
      data: data
    })
    .success(function( message ) {
      $(location).attr('href', '/admin/settings');
    }).fail(function( jqXHR, message ){
      alert("Unable to save: " + jqXHR.responseJSON);
    });
  });

  $('#newsetting').on('click', function(){
    var choice = prompt("Enter a name for the new setting:");
    var data = {
      key: choice,
    };
    var url = "/admin/newsetting"
    $.ajax({
      method: "POST",
      url: url,
      data: data
    })
    .success(function( message ) {
      $(location).attr('href', '/admin/settings');
    })
    .fail(function( jqXHR, message ){
      alert("Unable to create setting: " + jqXHR.responseJSON);
    });
  });

});
