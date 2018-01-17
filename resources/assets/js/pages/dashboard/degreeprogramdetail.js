var dashboard = require('../../util/dashboard');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">New Degree Requirement</a>');

  $('#save').on('click', function(){
    var data = {
      notes: $('#notes').val(),
      degreeprogram_id: $('#degreeprogram_id').val()
    };
    var id = $('#degreerequirementid').val();
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
    $('#degreerequirementid').val("");
    $('#degreerequirementform').modal('show');
  });

  $('.edit').on('click', function(){
      var id = $('this').data('id');
      $('#degreerequirementid').val(id);
      $('#degreerequirementform').modal('show');
  });

};
