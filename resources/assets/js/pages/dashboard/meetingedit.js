var dashboard = require('../../util/dashboard');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $('#delete').on('click', function(){
    var url = "/admin/deletemeeting";
    var retUrl = "/admin/meetings";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function(){
    var url = "/admin/forcedeletemeeting";
    var retUrl = "/admin/meetings";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

};
