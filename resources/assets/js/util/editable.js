exports.init = function(){
  require('codemirror');
  require('codemirror/lib/codemirror.css');
  require('codemirror/mode/xml/xml.js');
  require('codemirror/theme/blackboard.css');
  require('codemirror/theme/monokai.css');
  require('summernote');
  require('summernote/dist/summernote.css');

/*
  var SaveButton = function (context) {
    var ui = $.summernote.ui;

    // create button
    var button = ui.button({
      contents: '<i class="fa fa-floppy-o"/>',
      className: 'note-btn-green',
      tooltip: 'Save',
      click: function () {
        console.log("save clicked");
      }
    });

    return button.render();   // return button as jquery object
  }
*/

  $('.editable-link').each(function(){
    $(this).click(function(e){
      e.stopPropagation();
      e.preventDefault();
      var id = $(this).data('id');
      $('#editablebutton-' + id).addClass('hidden');
      $('#editablesave-' + id).removeClass('hidden');
      $('#editable-' + id).summernote({
        focus: true,
        toolbar: [
          // [groupName, [list of button]]
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

  $('.editable-save').each(function(){
    $(this).click(function(e){
      e.stopPropagation();
      e.preventDefault();
      var id = $(this).data('id');
      $('#editablespin-' + id).removeClass('hide-spin');
      var htmlString = $('#editable-' + id).summernote('code');
      window.axios.post('/editable/save/' + id, {
        contents: htmlString
      })
      .then(function(response){
        location.reload(true);
      })
      .catch(function(error){
        console.log(error);
      });
    });
  });
};
