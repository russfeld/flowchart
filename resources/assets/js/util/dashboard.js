define(['util/site', 'adminlte', 'datatables.net', 'datatables.netbs'], function(site, adminlte, datatables, datatablesbs) {

  function dashboardModule() {
    //self-referential variable
    //anything attached to this or self will be public
    var self = this;

    self.dataTableOptions = {
      "pageLength": 50,
      "lengthChange": false,
    }

    self.init = function(options){
      options || (options = self.dataTableOptions);
      $('#table').DataTable(options);
    }

    self.ajaxsave = function(data, url, id){
      $('#spin').removeClass('hide-spin');
      $.ajax({
        method: "POST",
        url: url,
        data: data
      })
      .success(function( message ) {
        if(id.length == 0){
          site.clearFormErrors();
          $('#spin').addClass('hide-spin');
          $(location).attr('href', message);
        }else{
          site.displayMessage(message, "success");
          site.clearFormErrors();
          $('#spin').addClass('hide-spin');
        }
      }).fail(function( jqXHR, message ){
        if (jqXHR.status == 422)
        {
          site.setFormErrors(jqXHR.responseJSON);
        }else{
          alert("Unable to save: " + jqXHR.responseJSON);
        }
        $('#spin').addClass('hide-spin');
      });
    }

    self.ajaxobjectsave = function (formData, url, id){
      $('#spin').removeClass('hide-spin');
      $.ajax({
        method: "POST",
        url: url,
        data: formData,
      	dataType: 'json',
      	processData: false,
      	contentType: false,
      })
      .success(function( message ) {
        if(id.length == 0){
          site.clearFormErrors();
          $('#spin').addClass('hide-spin');
          $(location).attr('href', message);
        }else{
      		site.displayMessage(message, "success");
      		site.clearFormErrors();
      		$('#spin').addClass('hide-spin');
      		$.ajax({
      			method: "GET",
      		  url: '/profile/pic/' + id,
      		})
      		.success(function(message){
      			$('#pictext').val(message);
      			$('#picimg').attr('src', message);
      		});
        }
      }).fail(function( jqXHR, message ){
      	if (jqXHR.status == 422)
      	{
      		site.setFormErrors(jqXHR.responseJSON);
      	}else{
      		alert("Unable to save: " + jqXHR.responseJSON);
      	}
      	$('#spin').addClass('hide-spin');
      });
    }

    self.ajaxdelete = function (data, url, retUrl, soft = false){
      if(soft){
        var choice = confirm("Are you sure?");
      }else{
        var choice = confirm("Are you sure? This will permanently remove all related records. You cannot undo this action.");
      }
  		if(choice === true){
        $('#spin').removeClass('hide-spin');
        $.ajax({
          method: "POST",
          url: url,
          data: data
        })
        .success(function( message ) {
          $(location).attr('href', retUrl);
        })
        .fail(function( jqXHR, message ){
          if (jqXHR.status == 422)
          {
            site.setFormErrors(jqXHR.responseJSON);
          }else{
            alert("Unable to delete: " + jqXHR.responseJSON);
          }
          $('#spin').addClass('hide-spin');
        });
      }
    }

    self.ajaxrestore = function(data, url, retUrl){
      var choice = confirm("Are you sure?");
  		if(choice === true){
        $('#spin').removeClass('hide-spin');
        var data = {
          id: $('#id').val(),
        };
        $.ajax({
          method: "POST",
          url: url,
          data: data
        })
        .success(function( message ) {
          $(location).attr('href', retUrl);
        })
        .fail(function( jqXHR, message ){
          if (jqXHR.status == 422)
          {
            site.setFormErrors(jqXHR.responseJSON);
          }else{
            alert("Unable to restore: " + jqXHR.responseJSON);
          }
          $('#spin').addClass('hide-spin');
        });
      }
    }
  };

  return new dashboardModule();
});
