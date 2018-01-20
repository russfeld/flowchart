var dashboard = require('../../util/dashboard');
var site = require('../../util/site');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  //options.dom = '<"newbutton">frtip';
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
              return "<a class=\"btn btn-danger btn-sm delete\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Delete</a>";
            }
  }]
  dashboard.init(options);

  //$("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">Add Course</a>');

  $('#save').on('click', function(){
    var data = {
      electivelist_id: $('#electivelist_id').val(),
      course_id: $('#course_id').val(),
    };
    var url = '/admin/newelectivelistcourse';
    window.axios.post(url, data)
      .then(function(response){
        site.clearFormErrors();
        resetForm();
        $('#spin').addClass('hide-spin');
        $('#table').DataTable().ajax.reload();
        site.displayMessage(response.data, "success");
      })
      .catch(function(error){
        site.handleError('save', '#', error)
      });
  });

  resetForm();

  $('#table').on('click', '.delete', function(){
    var url = "/admin/deleteelectivecourse";
    var data = {
      id: $(this).data('id'),
    };
    var choice = confirm("Are you sure?");
  	if(choice === true){
      $('#spin').removeClass('hide-spin');
      window.axios.post(url, data)
        .then(function(response){
          site.clearFormErrors();
          $('#spin').addClass('hide-spin');
          $('#table').DataTable().ajax.reload();
          site.displayMessage(response.data, "success");
        })
        .catch(function(error){
          site.handleError('delete course', '#', error)
        });
    }
  });

  dashboard.ajaxautocomplete('course_id', '/courses/coursefeed');
};


var resetForm = function(){
  site.clearFormErrors();
  $('#course_id').val("-1");
  $('#course_idauto').val("");
  $('#course_idtext').html("Selected: (0) ");
}
