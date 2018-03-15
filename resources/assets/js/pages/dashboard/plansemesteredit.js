var dashboard = require('../../util/dashboard');

exports.init = function(){

  dashboard.init();

  $('#save').on('click', function(){
    var data = {
      name: $('#name').val(),
      number: $('#number').val(),
      ordering: $('#ordering').val(),
      plan_id: $('#plan_id').val(),
    };
    var id = $('#id').val();
    if(id.length == 0){
      var url = '/admin/plans/newplansemester';
    }else{
      var url = '/admin/plans/plansemester/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function(){
    var url = "/admin/plans/deleteplansemester/" + $('#id').val() ;
    var retUrl = "/admin/plans/" + $('#plan_id').val();
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

};
