//load required libraries
var site = require('../util/site');
require('admin-lte');
require('datatables.net');
require('datatables.net-bs');
require('devbridge-autocomplete');

//options for datatables
exports.dataTableOptions = {
  "pageLength": 50,
  "lengthChange": false,
}

/**
 * Initialization function
 * must be called explicitly on all datatables pages
 *
 * @param options - custom datatables options
 */
exports.init = function(options){
  options || (options = exports.dataTableOptions);
  $('#table').DataTable(options);
  site.checkMessage();

  $('#adminlte-togglemenu').on('click', function(){
    $('body').toggleClass('sidebar-open');
  });
}

/**
 * Function save via AJAX
 *
 * @param data - the data to save
 * @param url - the url to send data to
 * @param id - the id of the item to be save-dev
 * @param loadpicture - true to reload a profile picture
 */
exports.ajaxsave = function(data, url, id, loadpicture){
  loadpicture || (loadpicture = false);
  $('#spin').removeClass('hide-spin');
  window.axios.post(url, data)
    .then(function(response){
      site.clearFormErrors();
      $('#spin').addClass('hide-spin');
      if(id.length == 0){
        $(location).attr('href', response.data);
      }else{
        site.displayMessage(response.data, "success");
        if(loadpicture) exports.loadpicture(id);
      }
    })
    .catch(function(error){
      site.handleError('save', '#', error)
    });
}

/**
 * Function save via AJAX on modal form
 *
 * @param data - the data to save
 * @param url - the url to send data to
 * @param id - the id of the item to be save-dev
 * @param element - the modal element to close
 */
exports.ajaxmodalsave = function(data, url, element){
  $('#spin').removeClass('hide-spin');
  window.axios.post(url, data)
    .then(function(response){
      site.clearFormErrors();
      $('#spin').addClass('hide-spin');
      $(element).modal('hide');
      resetForm();
      $('#table').DataTable().ajax.reload();
      site.displayMessage(response.data, "success");
    })
    .catch(function(error){
      site.handleError('save', '#', error)
    });
}

/**
 * Function to load a picture via AJAX
 *
 * @param id - the user ID of the picture to reload
 */
exports.loadpicture = function(id){
  window.axios.get('/profile/pic/' + id)
    .then(function(response){
      $('#pictext').val(response.data);
      $('#picimg').attr('src', response.data);
    })
    .catch(function(error){
      site.handleError('retrieve picture', '', error);
    })
}

/**
 * Function to delete an item
 *
 * @param data - the data containing the item to delete
 * @param url - the URL to send the data to
 * @param retUrl - the URL to return to after delete
 * @param soft - boolean if this is a soft delete or not
 */
exports.ajaxdelete = function (data, url, retUrl, soft = false){
  if(soft){
    var choice = confirm("Are you sure?");
  }else{
    var choice = confirm("Are you sure? This will permanently remove all related records. You cannot undo this action.");
  }
	if(choice === true){
    $('#spin').removeClass('hide-spin');
    window.axios.post(url, data)
      .then(function(response){
        $(location).attr('href', retUrl);
      })
      .catch(function(error){
        site.handleError('delete', '#', error)
      });
  }
}

/**
 * Function to restore a soft-deleted item
 *
 * @param data - the item to be restored
 * @param url - the URL to send that information to
 * @param retUrl - the URL to return to
 */
exports.ajaxrestore = function(data, url, retUrl){
  var choice = confirm("Are you sure?");
	if(choice === true){
    $('#spin').removeClass('hide-spin');
    var data = {
      id: $('#id').val(),
    };
    window.axios.post(url, data)
      .then(function(response){
        $(location).attr('href', retUrl);
      })
      .catch(function(error){
        site.handleError('restore', '#', error)
      });
  }
}

/**
 * Function to autocomplete a field
 *
 * @param id - the ID of the field
 * @param url - the URL to request data from
 */
exports.ajaxautocomplete = function(id, url){
  $('#' + id + 'auto').autocomplete({
	    serviceUrl: url,
	    ajaxSettings: {
	    	dataType: "json"
	    },
      minChars: 3,
	    onSelect: function (suggestion) {
	        $('#' + id).val(suggestion.data);
          $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + suggestion.value);
	    },
	    transformResult: function(response) {
	        return {
	            suggestions: $.map(response.data, function(dataItem) {
	                return { value: dataItem.value, data: dataItem.data };
	            })
	        };
	    }
	});
}

/*
 * Function to reset the form on this page
 */
var resetForm = function(){
  $(':input','#form')
    .not(':button, :submit, :reset, :hidden, :disabled')
    .val('')
    .removeAttr('checked')
    .removeAttr('selected');
	site.clearFormErrors();
};
