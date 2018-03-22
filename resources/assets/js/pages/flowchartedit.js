var dashboard = require('../util/dashboard');

exports.init = function(){
  $('#save').on('click', function(){
    var data = {
      name: $('#name').val(),
      description: $('#description').val(),
      start_year: $('#start_year').val(),
      start_semester: $('#start_semester').val(),
      degreeprogram_id: $('#degreeprogram_id').val(),
    };
    var id = $('#id').val();
    var student_id = $('#student_id').val();
    if(id.length == 0){
      var url = '/flowcharts/new/' + student_id;
    }else{
      var url = '/flowcharts/edit/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function(){
    var student_id = $('#student_id').val();
    var url = "/flowcharts/delete";
    var retUrl = "/flowcharts/" + student_id;
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#repopulate').on('click', function(){
    var choice = confirm("Are you sure? This will permanently remove all requirements and repopulate them based on the selected degree program. You cannot undo this action.");
  	if(choice === true){
      var url = "/flowcharts/reset";
      var data = {
        id: $('#id').val(),
      };
      dashboard.ajaxsave(data, url, id);
    }
  })
}
