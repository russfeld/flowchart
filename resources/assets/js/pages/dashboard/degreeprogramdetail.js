var dashboard = require('../../util/dashboard');
var site = require('../../util/site');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#degreeprogram_id').val();
  options.ajax = {
      url: '/admin/degreeprogramrequirements/' + id,
      dataSrc: '',
  };
  options.columns = [
    {'data': 'id'},
    {'data': 'notes'},
    {'data': 'semester'},
    {'data': 'ordering'},
    {'data': 'credits'},
    {'data': 'id'},
  ];
  options.columnDefs = [{
            "targets": -1,
            "data": 'id',
            "render": function(data, type, row, meta) {
              return "<a class=\"btn btn-primary btn-sm edit\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Edit</a>";
            }
  }]
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">New Degree Requirement</a>');

  $('#save').on('click', function(){
    var data = {
      notes: $('#notes').val(),
      degreeprogram_id: $('#degreeprogram_id').val()
    };
    var id = $('#id').val();
    if(id.length == 0){
      var url = '/admin/newdegreerequirement';
    }else{
      var url = '/admin/degreerequirement/' + id;
    }
    dashboard.ajaxmodalsave(data, url, '#degreerequirementform');
  });

  $('#delete').on('click', function(){

  });

  $('#new').on('click', function(){
    $('#id').val("");
    $('#degreeprogram_idview').val($('#degreeprogram_idview').attr('value'));
    $('#delete').hide();
    $('#degreerequirementform').modal('show');
  });

  $('#table').on('click', '.edit', function(){
    var id = $(this).data('id');
    var url = '/admin/degreerequirement/' + id;
    window.axios.get(url)
      .then(function(message){
        $('#id').val(message.data.id);
        $('#notes').val(message.data.notes);
        $('#degreeprogram_idview').val($('#degreeprogram_idview').attr('value'));
        $('#delete').show();
        $('#degreerequirementform').modal('show');
      })
      .catch(function(error){
        site.handleError('retrieve requirement', '', error);
      });

  });

};
