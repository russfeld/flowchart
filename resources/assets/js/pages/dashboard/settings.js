var dashboard = require('../../util/dashboard');
var site = require('../../util/site');

exports.init = function(){
  //load custom button on the dom
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init();

  //bind settings buttons
  $('.settingsbutton').on('click', function(){
    var data = {
      key: $(this).attr('id'),
    };
    var url = '/admin/savesetting';

    window.axios.post(url, data)
      .then(function(message){
        $(location).attr('href', '/admin/settings');
      })
      .catch(function(error){
        site.handleError('save', '', error);
      });
  });

  //bind new setting button
  $('#newsetting').on('click', function(){
    var choice = prompt("Enter a name for the new setting:");
    var data = {
      key: choice,
    };
    var url = "/admin/newsetting"

    window.axios.post(url, data)
      .then(function(message){
        $(location).attr('href', '/admin/settings');
      })
      .catch(function(error){
        site.handleError('create', '', error)
      });
  });
}
