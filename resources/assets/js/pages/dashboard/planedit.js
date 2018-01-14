var dashboard = require('../../util/dashboard');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newplan">New Plan</a>');

  $('#save').on('click', function(){
    var data = {
      name: $('#name').val(),
      description: $('#description').val(),
      start_year: $('#start_year').val(),
      start_semester: $('#start_semester').val(),
      degreeprogram_id: $('#degreeprogram_id').val(),
      student_id: $('#student_id').val(),
    };
    var id = $('#id').val();
    if(id.length == 0){
      var url = '/admin/newplan';
    }else{
      var url = '/admin/plans/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function(){
    var url = "/admin/deleteplan";
    var retUrl = "/admin/plans";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function(){
    var url = "/admin/forcedeleteplan";
    var retUrl = "/admin/plans";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function(){
    var url = "/admin/restoreplan";
    var retUrl = "/admin/plans";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');

};
