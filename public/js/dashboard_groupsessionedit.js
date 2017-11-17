require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();

  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);
  site.checkMessage();

  //$("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newstudent">New Student</a>');

  $('#delete').on('click', function(){
    var url = "/admin/deletegroupsession";
    var retUrl = "/admin/groupsessions";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

});

//# sourceMappingURL=dashboard_groupsessionedit.js.map
