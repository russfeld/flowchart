var dashboard = require('../../util/dashboard');
var site = require('../../util/site');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#plan_id').val();
  options.ajax = {
      url: '/admin/planrequirements/' + id,
      dataSrc: '',
  };
  options.columns = [
    {'data': 'id'},
    {'data': 'name'},
    {'data': 'electivelist_abbr'},
    {'data': 'credits'},
    {'data': 'semester'},
    {'data': 'ordering'},
    {'data': 'notes'},
    {'data': 'catalog_course'},
    {'data': 'completed_course'},
    {'data': 'id'},
  ];
  options.columnDefs = [{
            "targets": -1,
            "data": 'id',
            "render": function(data, type, row, meta) {
              return "<a class=\"btn btn-primary btn-sm edit\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Edit</a>";
            }
  }];
  options.order = [
    [4, "asc"],
    [5, "asc"],
  ];
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">New Plan Requirement</a>');

  //added for new semesters table
  var options2 = {
    "pageLength": 50,
    "lengthChange": false,
  }
  options2.dom = '<"newbutton2">frtip';
  options2.ajax = {
      url: '/admin/plans/plansemesters/' + id,
      dataSrc: '',
  };
  options2.columns = [
    {'data': 'id'},
    {'data': 'name'},
    {'data': 'ordering'},
    {'data': 'id'},
  ];
  options2.columnDefs = [{
            "targets": -1,
            "data": 'id',
            "render": function(data, type, row, meta) {
              return "<a class=\"btn btn-primary btn-sm editsem\" href=\"/admin/plans/plansemester/" + data + "\" role=\"button\">Edit</a>";
            }
  }];
  options2.order = [
    [2, "asc"],
  ];
  $('#tablesem').DataTable(options2);

  $("div.newbutton2").html('<a type="button" class="btn btn-success" href="/admin/plans/newplansemester/' + id + '" id="new2">New Semester</a>');

  $('#save').on('click', function(){
    var data = {
      notes: $('#notes').val(),
      plan_id: $('#plan_id').val(),
      ordering: $('#ordering').val(),
      credits: $('#credits').val(),
      student_id: $('#student_id').val(),
      course_id_lock: $('#course_idlock').val(),
      completedcourse_id_lock: $('#completedcourse_idlock').val(),
    };
    if($('#semester_id').val() > 0){
      data.semester_id = $('#semester_id').val();
    }
    data.course_name = $('#course_name').val();
    if($('#electivelist_id').val() > 0){
      data.electivelist_id = $('#electivelist_id').val();
    }else{
      data.electivelist_id = '';
    }
    if($('#course_id').val() > 0){
      data.course_id = $('#course_id').val();
    }else{
      data.course_id = '';
    }
    if($('#completedcourse_id').val() > 0){
      data.completedcourse_id = $('#completedcourse_id').val();
    }else{
      data.completedcourse_id = '';
    }
    var id = $('#id').val();
    if(id.length == 0){
      var url = '/admin/newplanrequirement';
    }else{
      var url = '/admin/planrequirement/' + id;
    }
    dashboard.ajaxmodalsave(data, url, '#planrequirementform');
  });

  $('#delete').on('click', function(){
    var url = "/admin/deleteplanrequirement";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxmodaldelete(data, url, '#planrequirementform');
  });

  $('#planrequirementform').on('hidden.bs.modal', resetForm);

  resetForm();

  $('#new').on('click', function(){
    $('#id').val("");
    $('#plan_idview').val($('#plan_idview').attr('value'));
    $('#delete').hide();
    var planid = $('#plan_id').val();
    window.axios.get('/admin/plans/plansemesters/' + planid)
      .then(function(message){
        var listitems = '';
        $.each(message.data, function(key, value){
          listitems += '<option value=' + value.id + '>' + value.name +'</option>';
        });
        $('#semester_id').find('option').remove().end().append(listitems);
        $('#semester_id').val(semester_id);
        $('#planrequirementform').modal('show');
      })
  });

  $('#table').on('click', '.edit', function(){
    var id = $(this).data('id');
    var url = '/admin/planrequirement/' + id;
    window.axios.get(url)
      .then(function(message){
        $('#id').val(message.data.id);
        $('#ordering').val(message.data.ordering);
        $('#credits').val(message.data.credits);
        $('#notes').val(message.data.notes);
        $('#degreerequirement_id').val(message.data.degreerequirement_id);
        $('#plan_idview').val($('#plan_idview').attr('value'));
        $('#course_name').val(message.data.course_name);
        $('#electivelist_id').val(message.data.electivelist_id);
        $('#electivelist_idtext').html("Selected: (" + message.data.electivelist_id + ") " + site.truncateText(message.data.electivelist_name, 30));
        $('#course_id').val(message.data.course_id);
        $('#course_idtext').html("Selected: (" + message.data.course_id + ") " + site.truncateText(message.data.catalog_course, 30));
        dashboard.ajaxautocompleteset('course_id', message.data.course_id_lock);
        $('#completedcourse_id').val(message.data.completedcourse_id);
        $('#completedcourse_idtext').html("Selected: (" + message.data.completedcourse_id + ") " + site.truncateText(message.data.completed_course, 30));
        dashboard.ajaxautocompleteset('completedcourse_id', message.data.completedcourse_id_lock);
        $('#delete').show();

        var semester_id = message.data.semester_id;

        //load semesters
        var planid = $('#plan_id').val();
        window.axios.get('/admin/plans/plansemesters/' + planid)
          .then(function(message){
            var listitems = '';
            $.each(message.data, function(key, value){
              listitems += '<option value=' + value.id + '>' + value.name +'</option>';
            });
            $('#semester_id').find('option').remove().end().append(listitems);
            $('#semester_id').val(semester_id);
            $('#planrequirementform').modal('show');
          })
          .catch(function(error){
            site.handleError('retrieve semesters', '', error);
          });
      })
      .catch(function(error){
        site.handleError('retrieve requirement', '', error);
      });

  });

  dashboard.ajaxautocomplete('electivelist_id', '/electivelists/electivelistfeed');

  dashboard.ajaxautocompletelock('course_id', '/courses/coursefeed');

  var student_id = $('#student_id').val();
  dashboard.ajaxautocompletelock('completedcourse_id', '/completedcourses/completedcoursefeed/' + student_id);
};

var resetForm = function(){
  site.clearFormErrors();
  $('#id').val("");
  $('#semester').val("");
  $('#ordering').val("");
  $('#credits').val("");
  $('#notes').val("");
  $('#degreerequirement_id').val("");
  $('#plan_idview').val($('#plan_idview').attr('value'));
  $('#course_name').val("");
  $('#electivelist_id').val("-1");
  $('#electivelist_idauto').val("");
  $('#electivelist_idtext').html("Selected (0) ");
  $('#course_id').val("-1");
  $('#course_idauto').val("");
  $('#course_idtext').html("Selected (0) ");
  $('#completedcourse_id').val("-1");
  $('#completedcourse_idauto').val("");
  $('#completedcourse_idtext').html("Selected (0) ");
  dashboard.ajaxautocompleteset('course_id', 0);
  dashboard.ajaxautocompleteset('completedcourse_id', 0);
}
