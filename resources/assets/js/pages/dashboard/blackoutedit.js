var dashboard = require('../../util/dashboard');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $('#delete').on('click', function(){
    var url = "/admin/deleteblackout";
    var retUrl = "/admin/blackouts";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

};
