var dashboard = require('../../util/dashboard');
var site = require('../../util/site');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#electivelist_id').val();
  options.ajax = {
      url: '/admin/electivelistcourses/' + id,
      dataSrc: '',
  };
  options.columns = [
    {'data': 'id'},
    {'data': 'name'},
    {'data': 'id'},
  ];
  options.columnDefs = [{
            "targets": -1,
            "data": 'id',
            "render": function(data, type, row, meta) {
              return "<a class=\"btn btn-primary btn-sm edit\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Edit</a>";
            }
  }]
  options.order = [
    [1, "asc"],
  ];
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">Add Course</a>');

  $('#save').on('click', function(){
    var data = {
      electivelist_id: $('#electivelist_id').val(),
      course_prefix: $('#course_prefix').val(),
    };
    var selected = $("input[name='range']:checked");
    if (selected.length > 0) {
        var selectedVal = selected.val();
        if(selectedVal == 1){
          data.course_min_number = $('#course_min_number').val();
        }else if(selectedVal == 2){
          data.course_min_number = $('#course_min_number').val();
          data.course_max_number = $('#course_max_number').val();
        }
    }
    var id = $('#id').val();
    if(id.length == 0){
      var url = '/admin/newelectivelistcourse';
    }else{
      var url = '/admin/electivecourse/' + id;
    }
    dashboard.ajaxmodalsave(data, url, '#electivelistcourseform');
  });

  $('#delete').on('click', function(){
    var url = "/admin/deleteelectivecourse";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxmodaldelete(data, url, '#electivelistcourseform');
  });

  $('#electivelistcourseform').on('shown.bs.modal', showselected);

  $('#electivelistcourseform').on('hidden.bs.modal', resetForm);

  resetForm();

  $('#new').on('click', function(){
    $('#id').val("");
    $('#electivelist_idview').val($('#electivelist_idview').attr('value'));
    $('#delete').hide();
    $('#electivelistcourseform').modal('show');
  });

  $('#table').on('click', '.edit', function(){
    var id = $(this).data('id');
    var url = '/admin/electivecourse/' + id;
    window.axios.get(url)
      .then(function(message){
        $('#id').val(message.data.id);
        $('#course_prefix').val(message.data.course_prefix);
        $('#course_min_number').val(message.data.course_min_number);
        if(message.data.course_max_number){
          $('#course_max_number').val(message.data.course_max_number);
          $('#range2').prop('checked', true);
          $('#courserange').show();
          $('#singlecourse').hide();
        }else{
          $('#course_max_number').val("");
          $('#range1').prop('checked', true);
          $('#singlecourse').show();
          $('#courserange').hide();
        }
        $('#delete').show();
        $('#electivelistcourseform').modal('show');
      })
      .catch(function(error){
        site.handleError('retrieve elective list course', '', error);
      });

    });

    $('input[name=range]').on('change', showselected);
};

/**
 * Determine which div to show in the form
 */
var showselected = function(){
  //https://stackoverflow.com/questions/8622336/jquery-get-value-of-selected-radio-button
  var selected = $("input[name='range']:checked");
  if (selected.length > 0) {
      var selectedVal = selected.val();
      if(selectedVal == 1){
        $('#singlecourse').show();
        $('#courserange').hide();
      }else if(selectedVal == 2){
        $('#singlecourse').hide();
        $('#courserange').show();
      }
  }
}

var resetForm = function(){
  site.clearFormErrors();
  $('#id').val("");
  $('#course_prefix').val("");
  $('#course_min_number').val("");
  $('#course_max_number').val("");
  $('#range1').prop('checked', true);
  $('#range2').prop('checked', false);
  $('#singlecourse').show();
  $('#courserange').hide();
}
