/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function(){

  //Load required libraries
  require('codemirror');
  require('codemirror/mode/xml/xml.js');
  require('summernote');

  //Register click handlers for [edit] links
  $('.editable-link').each(function(){
    $(this).click(function(e){
      e.stopPropagation();
      e.preventDefault();

      //get ID of item clicked
      var id = $(this).data('id');

      //hide the [edit] links, enable editor, and show Save and Cancel buttons
      $('#editablebutton-' + id).addClass('hidden');
      $('#editablesave-' + id).removeClass('hidden');
      $('#editable-' + id).summernote({
        focus: true,
        toolbar: [
          // [groupName, [list of buttons]]
          ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
          ['font', ['strikethrough', 'superscript', 'subscript', 'link']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['misc', ['fullscreen', 'codeview', 'help']],
        ],
        tabsize: 2,
        codemirror: {
          mode: 'text/html',
          htmlMode: true,
          lineNumbers: true,
          theme: 'monokai'
        },
      });
    });
  });

  //Register click handlers for Save buttons
  $('.editable-save').each(function(){
    $(this).click(function(e){
      e.stopPropagation();
      e.preventDefault();

      //get ID of item clicked
      var id = $(this).data('id');

      //Display spinner while AJAX call is performed
      $('#editablespin-' + id).removeClass('hide-spin');

      //Get contents of editor
      var htmlString = $('#editable-' + id).summernote('code');

      //Post contents to server, wait for response
      window.axios.post('/editable/save/' + id, {
        contents: htmlString
      })
      .then(function(response){
        //If response 200 received, assume it saved and reload page
        location.reload(true);
      })
      .catch(function(error){
        alert("Unable to save content: " + error.response.data);
      });
    });
  });

  //Register click handlers for Cancel buttons
  $('.editable-cancel').each(function(){
    $(this).click(function(e){
      e.stopPropagation();
      e.preventDefault();

      //get ID of item clicked
      var id = $(this).data('id');

      //Reset the contents of the editor and destroy it
      $('#editable-' + id).summernote('reset');
      $('#editable-' + id).summernote('destroy');

      //Hide Save and Cancel buttons, and show [edit] link
      $('#editablebutton-' + id).removeClass('hidden');
      $('#editablesave-' + id).addClass('hidden');
    });
  });
};
