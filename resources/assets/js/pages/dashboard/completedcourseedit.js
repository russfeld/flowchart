var dashboard = require('../../util/dashboard');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

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
    var selected = $("input[name='transfer']:checked");
    if (selected.length > 0) {
        var selectedVal = selected.val();
        if(selectedVal == 1){
          data.transfer = false;
        }else if(selectedVal == 2){
          data.transfer = true;
          data.incoming_institution = $('#incoming_institution').val();
          data.incoming_name = $('#incoming_name').val();
          data.incoming_description = $('#incoming_description').val();
          data.incoming_semester = $('#incoming_semester').val();
          data.incoming_credits = $('#incoming_credits').val();
          data.incoming_grade = $('#incoming_grade').val();
        }
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

  $('input[name=transfer]').on('change', showselected);

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');

  if($('#transfercourse').is(':hidden')){
    $('#transfer1').prop('checked', true);
  }else{
    $('#transfer2').prop('checked', true);
  }

};

/**
 * Determine which div to show in the form
 */
var showselected = function(){
  //https://stackoverflow.com/questions/8622336/jquery-get-value-of-selected-radio-button
  var selected = $("input[name='transfer']:checked");
  if (selected.length > 0) {
      var selectedVal = selected.val();
      if(selectedVal == 1){
        $('#kstatecourse').show();
        $('#transfercourse').hide();
      }else if(selectedVal == 2){
        $('#kstatecourse').hide();
        $('#transfercourse').show();
      }
  }
}
