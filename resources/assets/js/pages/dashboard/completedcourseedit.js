require(['util/site', 'util/dashboard', 'jquery.autocomplete'], function(site, dashboard, autocomplete) {

  site.ajaxcrsf();

  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);
  site.checkMessage();

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newcompletedcourse">New Completed Course</a>');

  $('#save').on('click', function(){
    var data = {
      coursenumber: $('#coursenumber').val(),
      name: $('#name').val(),
      year: $('#year').val(),
      semester: $('#semester').val(),
      basis: $('#basis').val(),
      grade: $('#grade').val(),
      credits: $('#credits').val(),
      degreeprogram_id: $('#degreeprogram_id').val(),
      student_id: $('#student_id').val(),
    };
    if($('#student_id').val() > 0){
      data.student_id = $('#student_id').val();
    }
    if($('#course_id').val() > 0){
      data.course_id = $('#course_id').val();
    }
    var id = $('#id').val();
    if(id.length == 0){
      var url = '/admin/newcompletedcourse';
    }else{
      var url = '/admin/completedcourses/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function(){
    var url = "/admin/deletecompletedcourse";
    var retUrl = "/admin/completedcourses";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');

  dashboard.ajaxautocomplete('course_id', '/courses/coursefeed');

});
