var dashboard = require('../../util/dashboard');

exports.init = function(){
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newadvisor">New Advisor</a>');


  $('#save').on('click', function(){
    var formData = new FormData($('form')[0]);
		formData.append("name", $('#name').val());
		formData.append("email", $('#email').val());
		formData.append("office", $('#office').val());
		formData.append("phone", $('#phone').val());
		formData.append("notes", $('#notes').val());
		if($('#pic').val()){
			formData.append("pic", $('#pic')[0].files[0]);
		}
    if($('#department_id').val() > 0){
      formData.append("department_id", $('#department_id').val());
    }
    var id = $('#id').val();
    if(id.length == 0){
      formData.append("eid", $('#eid').val());
      var url = '/admin/newadvisor';
    }else{
      formData.append("eid", $('#eid').val());
      var url = '/admin/advisors/' + id;
    }
		dashboard.ajaxsave(formData, url, id, true);
  });

  $('#delete').on('click', function(){
    var url = "/admin/deleteadvisor";
    var retUrl = "/admin/advisors";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function(){
    var url = "/admin/forcedeleteadvisor";
    var retUrl = "/admin/advisors";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function(){
    var url = "/admin/restoreadvisor";
    var retUrl = "/admin/advisors";
    var data = {
      id: $('#id').val(),
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });

  $(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
  });

  $('.btn-file :file').on('fileselect', function(event, numFiles, label) {

      var input = $(this).parents('.input-group').find(':text'),
          log = numFiles > 1 ? numFiles + ' files selected' : label;

      if( input.length ) {
          input.val(log);
      } else {
          if( log ) alert(log);
      }

  });

}
