define(['util/site', 'bootstrap-editable'], function(site, editable) {

  function editableModule() {
    //self-referential variable
    //anything attached to this or self will be public
    var self = this;

    self.init = function(){

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
  };

  return new editableModule();
});
