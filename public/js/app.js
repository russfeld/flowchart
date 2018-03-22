webpackJsonp([1],{

/***/ 134:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(135);
__webpack_require__(136);
module.exports = __webpack_require__(137);


/***/ }),

/***/ 135:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(225);

var App = {

	// Controller-action methods
	actions: {
		//Index for directly created views with no explicit controller
		RootRouteController: {
			getIndex: function getIndex() {
				var editable = __webpack_require__(214);
				editable.init();
				var site = __webpack_require__(213);
				site.checkMessage();
			},
			getAbout: function getAbout() {
				var editable = __webpack_require__(214);
				editable.init();
				var site = __webpack_require__(213);
				site.checkMessage();
			}
		},

		//Advising Controller for routes at /advising
		AdvisingController: {
			//advising/index
			getIndex: function getIndex() {
				var calendar = __webpack_require__(226);
				calendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
		GroupsessionController: {
			//groupsession/index
			getIndex: function getIndex() {
				var editable = __webpack_require__(214);
				editable.init();
				var site = __webpack_require__(213);
				site.checkMessage();
			},
			//groupsesion/list
			getList: function getList() {
				var groupsession = __webpack_require__(227);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(228);
				profile.init();
			}
		},

		//Dashboard Controller for routes at /admin-lte
		DashboardController: {
			//admin/index
			getIndex: function getIndex() {
				var dashboard = __webpack_require__(212);
				dashboard.init();
			}
		},

		StudentsController: {
			//admin/students
			getStudents: function getStudents() {
				var studentedit = __webpack_require__(216);
				studentedit.init();
			},
			//admin/newstudent
			getNewstudent: function getNewstudent() {
				var studentedit = __webpack_require__(216);
				studentedit.init();
			}
		},

		AdvisorsController: {
			//admin/advisors
			getAdvisors: function getAdvisors() {
				var advisoredit = __webpack_require__(217);
				advisoredit.init();
			},
			//admin/newadvisor
			getNewadvisor: function getNewadvisor() {
				var advisoredit = __webpack_require__(217);
				advisoredit.init();
			}
		},

		DepartmentsController: {
			//admin/departments
			getDepartments: function getDepartments() {
				var departmentedit = __webpack_require__(218);
				departmentedit.init();
			},
			//admin/newdepartment
			getNewdepartment: function getNewdepartment() {
				var departmentedit = __webpack_require__(218);
				departmentedit.init();
			}
		},

		MeetingsController: {
			//admin/meetings
			getMeetings: function getMeetings() {
				var meetingedit = __webpack_require__(229);
				meetingedit.init();
			}
		},

		BlackoutsController: {
			//admin/blackouts
			getBlackouts: function getBlackouts() {
				var blackoutedit = __webpack_require__(230);
				blackoutedit.init();
			}
		},

		GroupsessionsController: {
			//admin/groupsessions
			getGroupsessions: function getGroupsessions() {
				var groupsessionedit = __webpack_require__(231);
				groupsessionedit.init();
			}
		},

		SettingsController: {
			//admin/settings
			getSettings: function getSettings() {
				var settings = __webpack_require__(232);
				settings.init();
			}
		},

		DegreeprogramsController: {
			//admin/degreeprograms
			getDegreeprograms: function getDegreeprograms() {
				var degreeprogramedit = __webpack_require__(219);
				degreeprogramedit.init();
			},
			//admin/degreeprogram/{id}
			getDegreeprogramDetail: function getDegreeprogramDetail() {
				var degreeprogramedit = __webpack_require__(233);
				degreeprogramedit.init();
			},
			//admin/newdegreeprogram
			getNewdegreeprogram: function getNewdegreeprogram() {
				var degreeprogramedit = __webpack_require__(219);
				degreeprogramedit.init();
			}
		},

		ElectivelistsController: {
			//admin/degreeprograms
			getElectivelists: function getElectivelists() {
				var electivelistedit = __webpack_require__(220);
				electivelistedit.init();
			},
			//admin/degreeprogram/{id}
			getElectivelistDetail: function getElectivelistDetail() {
				var electivelistedit = __webpack_require__(234);
				electivelistedit.init();
			},
			//admin/newdegreeprogram
			getNewelectivelist: function getNewelectivelist() {
				var electivelistedit = __webpack_require__(220);
				electivelistedit.init();
			}
		},

		PlansController: {
			//admin/plans
			getPlans: function getPlans() {
				var planedit = __webpack_require__(221);
				planedit.init();
			},
			//admin/plan/{id}
			getPlanDetail: function getPlanDetail() {
				var plandetail = __webpack_require__(235);
				plandetail.init();
			},
			//admin/newplan
			getNewplan: function getNewplan() {
				var planedit = __webpack_require__(221);
				planedit.init();
			}
		},

		PlansemestersController: {
			//admin/plansemester
			getPlanSemester: function getPlanSemester() {
				var plansemesteredit = __webpack_require__(222);
				plansemesteredit.init();
			},
			//admin/newplansemester
			getNewPlanSemester: function getNewPlanSemester() {
				var plansemesteredit = __webpack_require__(222);
				plansemesteredit.init();
			}
		},

		CompletedcoursesController: {
			//admin/completedcourses
			getCompletedcourses: function getCompletedcourses() {
				var completedcourseedit = __webpack_require__(223);
				completedcourseedit.init();
			},
			//admin/newcompletedcourse
			getNewcompletedcourse: function getNewcompletedcourse() {
				var completedcourseedit = __webpack_require__(223);
				completedcourseedit.init();
			}
		},

		FlowchartsController: {
			//flowcharts/view/
			getFlowchart: function getFlowchart() {
				var flowchart = __webpack_require__(236);
				flowchart.init();
			},
			getIndex: function getIndex() {
				var flowchart = __webpack_require__(237);
				flowchart.init();
			},
			newFlowchart: function newFlowchart() {
				var flowchart = __webpack_require__(224);
				flowchart.init();
			},
			editFlowchart: function editFlowchart() {
				var flowchart = __webpack_require__(224);
				flowchart.init();
			}
		}

	},

	//Function that is called by the page at load. Defined in resources/views/includes/scripts.blade.php
	//and App/Http/ViewComposers/Javascript Composer
	//See links at top of file for description of what's going on here
	//Assumes 2 inputs - the controller and action that created this page
	init: function init(controller, action) {
		if (typeof this.actions[controller] !== 'undefined' && typeof this.actions[controller][action] !== 'undefined') {
			//call the matching function in the array above
			return App.actions[controller][action]();
		}
	}
};

//Bind to the window
window.App = App;

/***/ }),

/***/ 136:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 137:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 212:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required libraries
var site = __webpack_require__(213);
__webpack_require__(183);
__webpack_require__(132);
__webpack_require__(184);
__webpack_require__(175);

//options for datatables
exports.dataTableOptions = {
  "pageLength": 50,
  "lengthChange": false

  /**
   * Initialization function
   * must be called explicitly on all datatables pages
   *
   * @param options - custom datatables options
   */
};exports.init = function (options) {
  options || (options = exports.dataTableOptions);
  $('#table').DataTable(options);
  site.checkMessage();

  $('#adminlte-togglemenu').on('click', function () {
    $('body').toggleClass('sidebar-open');
  });
};

/**
 * Function save via AJAX
 *
 * @param data - the data to save
 * @param url - the url to send data to
 * @param id - the id of the item to be save-dev
 * @param loadpicture - true to reload a profile picture
 */
exports.ajaxsave = function (data, url, id, loadpicture) {
  loadpicture || (loadpicture = false);
  $('#spin').removeClass('hide-spin');
  window.axios.post(url, data).then(function (response) {
    site.clearFormErrors();
    $('#spin').addClass('hide-spin');
    if (id.length == 0) {
      $(location).attr('href', response.data);
    } else {
      site.displayMessage(response.data, "success");
      if (loadpicture) exports.loadpicture(id);
    }
  }).catch(function (error) {
    site.handleError('save', '#', error);
  });
};

/**
 * Function save via AJAX on modal form
 *
 * @param data - the data to save
 * @param url - the url to send data to
 * @param element - the modal element to close
 */
exports.ajaxmodalsave = function (data, url, element) {
  $('#spin').removeClass('hide-spin');
  window.axios.post(url, data).then(function (response) {
    site.clearFormErrors();
    $('#spin').addClass('hide-spin');
    $(element).modal('hide');
    $('#table').DataTable().ajax.reload();
    site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.handleError('save', '#', error);
  });
};

/**
 * Function to load a picture via AJAX
 *
 * @param id - the user ID of the picture to reload
 */
exports.loadpicture = function (id) {
  window.axios.get('/profile/pic/' + id).then(function (response) {
    $('#pictext').val(response.data);
    $('#picimg').attr('src', response.data);
  }).catch(function (error) {
    site.handleError('retrieve picture', '', error);
  });
};

/**
 * Function to delete an item
 *
 * @param data - the data containing the item to delete
 * @param url - the URL to send the data to
 * @param retUrl - the URL to return to after delete
 * @param soft - boolean if this is a soft delete or not
 */
exports.ajaxdelete = function (data, url, retUrl) {
  var soft = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (soft) {
    var choice = confirm("Are you sure?");
  } else {
    var choice = confirm("Are you sure? This will permanently remove all related records. You cannot undo this action.");
  }
  if (choice === true) {
    $('#spin').removeClass('hide-spin');
    window.axios.post(url, data).then(function (response) {
      $(location).attr('href', retUrl);
    }).catch(function (error) {
      site.handleError('delete', '#', error);
    });
  }
};

/**
 * Function to delete an item from a modal form
 *
 * @param data - the data containing the item to delete
 * @param url - the URL to send the data to
 * @param element - the modal element to close
 */
exports.ajaxmodaldelete = function (data, url, element) {
  var choice = confirm("Are you sure?");
  if (choice === true) {
    $('#spin').removeClass('hide-spin');
    window.axios.post(url, data).then(function (response) {
      site.clearFormErrors();
      $('#spin').addClass('hide-spin');
      $(element).modal('hide');
      $('#table').DataTable().ajax.reload();
      site.displayMessage(response.data, "success");
    }).catch(function (error) {
      site.handleError('delete', '#', error);
    });
  }
};

/**
 * Function to restore a soft-deleted item
 *
 * @param data - the item to be restored
 * @param url - the URL to send that information to
 * @param retUrl - the URL to return to
 */
exports.ajaxrestore = function (data, url, retUrl) {
  var choice = confirm("Are you sure?");
  if (choice === true) {
    $('#spin').removeClass('hide-spin');
    var data = {
      id: $('#id').val()
    };
    window.axios.post(url, data).then(function (response) {
      $(location).attr('href', retUrl);
    }).catch(function (error) {
      site.handleError('restore', '#', error);
    });
  }
};

exports.ajaxautocomplete = function (id, url) {
  site.ajaxautocomplete(id, url);
};

exports.ajaxautocompletelock = function (id, url) {
  site.ajaxautocompletelock(id, url);
};

exports.ajaxautocompleteset = function (id, value) {
  site.ajaxautocompleteset(id, value);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 213:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Displays a message from the flashed session data
 *
 * use $request->session()->put('message', trans('messages.item_saved'));
 *     $request->session()->put('type', 'success');
 * to set message text and type
 */
exports.displayMessage = function (message, type) {
  var html = '<div id="javascriptMessage" class="alert fade in alert-dismissable alert-' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="h4">' + message + '</span></div>';
  $('#message').append(html);
  setTimeout(function () {
    $("#javascriptMessage").alert('close');
  }, 3000);
};

/*
exports.ajaxcrsf = function(){
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
};
*/

/**
 * Clears errors on forms by removing error classes
 */
exports.clearFormErrors = function () {
  $('.form-group').each(function () {
    $(this).removeClass('has-error');
    $(this).find('.help-block').text('');
  });
};

/**
 * Sets errors on forms based on response JSON
 */
exports.setFormErrors = function (json) {
  exports.clearFormErrors();
  $.each(json, function (key, value) {
    $('#' + key).parents('.form-group').addClass('has-error');
    $('#' + key + 'help').text(value.join(' '));
  });
};

/**
 * Checks for messages in the flash data. Must be called explicitly by the page
 */
exports.checkMessage = function () {
  if ($('#message_flash').length) {
    var message = $('#message_flash').val();
    var type = $('#message_type_flash').val();
    exports.displayMessage(message, type);
  }
};

/**
 * Function to handle errors from AJAX
 *
 * @param message - the message to display to the user
 * @param element - the jQuery identifier of the element
 * @param error - the Axios error received
 */
exports.handleError = function (message, element, error) {
  if (error.response) {
    //If response is 422, errors were provided
    if (error.response.status == 422) {
      exports.setFormErrors(error.response.data);
    } else {
      alert("Unable to " + message + ": " + error.response.data);
    }
  }

  //hide spinning icon
  if (element.length > 0) {
    $(element + 'spin').addClass('hide-spin');
  }
};

/**
 * Function to truncate text
 *
 * @param text - the text to truncate
 * @param length - the maximum length
 *
 * http://jsfiddle.net/schadeck/GpCZL/
 */
exports.truncateText = function (text, length) {
  if (text.length > length) {
    return $.trim(text).substring(0, length).split(" ").slice(0, -1).join(" ") + "...";
  } else {
    return text;
  }
};

/**
 * Function to autocomplete a field
 *
 * @param id - the ID of the field
 * @param url - the URL to request data from
 */
exports.ajaxautocomplete = function (id, url) {
  $('#' + id + 'auto').autocomplete({
    serviceUrl: url,
    ajaxSettings: {
      dataType: "json"
    },
    minChars: 3,
    autoSelectFirst: true,
    onSelect: function onSelect(suggestion) {
      $('#' + id).val(suggestion.data);
      $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + exports.truncateText(suggestion.value, 30));
      $('#' + id + 'auto').val("");
    },
    transformResult: function transformResult(response) {
      return {
        suggestions: $.map(response.data, function (dataItem) {
          return { value: dataItem.value, data: dataItem.data };
        })
      };
    }
  });

  $('#' + id + 'clear').on('click', function () {
    $('#' + id).val(0);
    $('#' + id + 'text').html("Selected: (" + 0 + ") ");
    $('#' + id + 'auto').val("");
  });
};

/**
 * Function to autocomplete a field with a lock
 *
 * @param id - the ID of the field
 * @param url - the URL to request data from
 */
exports.ajaxautocompletelock = function (id, url) {
  $('#' + id + 'auto').autocomplete({
    serviceUrl: url,
    ajaxSettings: {
      dataType: "json"
    },
    minChars: 3,
    autoSelectFirst: true,
    onSelect: function onSelect(suggestion) {
      $('#' + id).val(suggestion.data);
      $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + exports.truncateText(suggestion.value, 30));
      $('#' + id + 'auto').val("");
      exports.ajaxautocompleteset(id, 1);
    },
    transformResult: function transformResult(response) {
      return {
        suggestions: $.map(response.data, function (dataItem) {
          return { value: dataItem.value, data: dataItem.data };
        })
      };
    }
  });

  $('#' + id + 'clear').on('click', function () {
    $('#' + id).val(0);
    $('#' + id + 'text').html("Selected: (" + 0 + ") ");
    $('#' + id + 'auto').val("");
    exports.ajaxautocompleteset(id, 0);
  });

  $('#' + id + 'lockBtn').on('click', function () {
    val = parseInt($('#' + id + 'lock').val());
    exports.ajaxautocompleteset(id, (val + 1) % 2);
  });
};

/**
 * Function to update a locked autocomplete button
 *
 * @param id - the ID of the field
 * @param value - the value to set
 */
exports.ajaxautocompleteset = function (id, value) {
  if (value == 1) {
    $('#' + id + 'lock').val(1);
    $('#' + id + 'lockBtn').addClass("active");
    $('#' + id + 'lockBtn').html('<i class="fa fa-lock"></i>');
  } else {
    $('#' + id + 'lock').val(0);
    $('#' + id + 'lockBtn').removeClass("active");
    $('#' + id + 'lockBtn').html('<i class="fa fa-unlock-alt"></i>');
  }
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 214:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function () {

  //Load required libraries
  __webpack_require__(5);
  __webpack_require__(215);
  __webpack_require__(171);

  //Register click handlers for [edit] links
  $('.editable-link').each(function () {
    $(this).click(function (e) {
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
        ['style', ['style', 'bold', 'italic', 'underline', 'clear']], ['font', ['strikethrough', 'superscript', 'subscript', 'link']], ['para', ['ul', 'ol', 'paragraph']], ['misc', ['fullscreen', 'codeview', 'help']]],
        tabsize: 2,
        codemirror: {
          mode: 'text/html',
          htmlMode: true,
          lineNumbers: true,
          theme: 'monokai'
        }
      });
    });
  });

  //Register click handlers for Save buttons
  $('.editable-save').each(function () {
    $(this).click(function (e) {
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
      }).then(function (response) {
        //If response 200 received, assume it saved and reload page
        location.reload(true);
      }).catch(function (error) {
        alert("Unable to save content: " + error.response.data);
      });
    });
  });

  //Register click handlers for Cancel buttons
  $('.editable-cancel').each(function () {
    $(this).click(function (e) {
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 215:
/***/ (function(module, exports, __webpack_require__) {

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (true) // CommonJS
    mod(__webpack_require__(5));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

var htmlConfig = {
  autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
                    'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
                    'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
                    'track': true, 'wbr': true, 'menuitem': true},
  implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
                     'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
                     'th': true, 'tr': true},
  contextGrabbers: {
    'dd': {'dd': true, 'dt': true},
    'dt': {'dd': true, 'dt': true},
    'li': {'li': true},
    'option': {'option': true, 'optgroup': true},
    'optgroup': {'optgroup': true},
    'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
          'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
          'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
          'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
          'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
    'rp': {'rp': true, 'rt': true},
    'rt': {'rp': true, 'rt': true},
    'tbody': {'tbody': true, 'tfoot': true},
    'td': {'td': true, 'th': true},
    'tfoot': {'tbody': true},
    'th': {'td': true, 'th': true},
    'thead': {'tbody': true, 'tfoot': true},
    'tr': {'tr': true}
  },
  doNotIndent: {"pre": true},
  allowUnquoted: true,
  allowMissing: true,
  caseFold: true
}

var xmlConfig = {
  autoSelfClosers: {},
  implicitlyClosed: {},
  contextGrabbers: {},
  doNotIndent: {},
  allowUnquoted: false,
  allowMissing: false,
  allowMissingTagName: false,
  caseFold: false
}

CodeMirror.defineMode("xml", function(editorConf, config_) {
  var indentUnit = editorConf.indentUnit
  var config = {}
  var defaults = config_.htmlMode ? htmlConfig : xmlConfig
  for (var prop in defaults) config[prop] = defaults[prop]
  for (var prop in config_) config[prop] = config_[prop]

  // Return variables for tokenizers
  var type, setStyle;

  function inText(stream, state) {
    function chain(parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    var ch = stream.next();
    if (ch == "<") {
      if (stream.eat("!")) {
        if (stream.eat("[")) {
          if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
          else return null;
        } else if (stream.match("--")) {
          return chain(inBlock("comment", "-->"));
        } else if (stream.match("DOCTYPE", true, true)) {
          stream.eatWhile(/[\w\._\-]/);
          return chain(doctype(1));
        } else {
          return null;
        }
      } else if (stream.eat("?")) {
        stream.eatWhile(/[\w\._\-]/);
        state.tokenize = inBlock("meta", "?>");
        return "meta";
      } else {
        type = stream.eat("/") ? "closeTag" : "openTag";
        state.tokenize = inTag;
        return "tag bracket";
      }
    } else if (ch == "&") {
      var ok;
      if (stream.eat("#")) {
        if (stream.eat("x")) {
          ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
        } else {
          ok = stream.eatWhile(/[\d]/) && stream.eat(";");
        }
      } else {
        ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
      }
      return ok ? "atom" : "error";
    } else {
      stream.eatWhile(/[^&<]/);
      return null;
    }
  }
  inText.isInText = true;

  function inTag(stream, state) {
    var ch = stream.next();
    if (ch == ">" || (ch == "/" && stream.eat(">"))) {
      state.tokenize = inText;
      type = ch == ">" ? "endTag" : "selfcloseTag";
      return "tag bracket";
    } else if (ch == "=") {
      type = "equals";
      return null;
    } else if (ch == "<") {
      state.tokenize = inText;
      state.state = baseState;
      state.tagName = state.tagStart = null;
      var next = state.tokenize(stream, state);
      return next ? next + " tag error" : "tag error";
    } else if (/[\'\"]/.test(ch)) {
      state.tokenize = inAttribute(ch);
      state.stringStartCol = stream.column();
      return state.tokenize(stream, state);
    } else {
      stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
      return "word";
    }
  }

  function inAttribute(quote) {
    var closure = function(stream, state) {
      while (!stream.eol()) {
        if (stream.next() == quote) {
          state.tokenize = inTag;
          break;
        }
      }
      return "string";
    };
    closure.isInAttribute = true;
    return closure;
  }

  function inBlock(style, terminator) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.match(terminator)) {
          state.tokenize = inText;
          break;
        }
        stream.next();
      }
      return style;
    };
  }
  function doctype(depth) {
    return function(stream, state) {
      var ch;
      while ((ch = stream.next()) != null) {
        if (ch == "<") {
          state.tokenize = doctype(depth + 1);
          return state.tokenize(stream, state);
        } else if (ch == ">") {
          if (depth == 1) {
            state.tokenize = inText;
            break;
          } else {
            state.tokenize = doctype(depth - 1);
            return state.tokenize(stream, state);
          }
        }
      }
      return "meta";
    };
  }

  function Context(state, tagName, startOfLine) {
    this.prev = state.context;
    this.tagName = tagName;
    this.indent = state.indented;
    this.startOfLine = startOfLine;
    if (config.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
      this.noIndent = true;
  }
  function popContext(state) {
    if (state.context) state.context = state.context.prev;
  }
  function maybePopContext(state, nextTagName) {
    var parentTagName;
    while (true) {
      if (!state.context) {
        return;
      }
      parentTagName = state.context.tagName;
      if (!config.contextGrabbers.hasOwnProperty(parentTagName) ||
          !config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) {
        return;
      }
      popContext(state);
    }
  }

  function baseState(type, stream, state) {
    if (type == "openTag") {
      state.tagStart = stream.column();
      return tagNameState;
    } else if (type == "closeTag") {
      return closeTagNameState;
    } else {
      return baseState;
    }
  }
  function tagNameState(type, stream, state) {
    if (type == "word") {
      state.tagName = stream.current();
      setStyle = "tag";
      return attrState;
    } else if (config.allowMissingTagName && type == "endTag") {
      setStyle = "tag bracket";
      return attrState(type, stream, state);
    } else {
      setStyle = "error";
      return tagNameState;
    }
  }
  function closeTagNameState(type, stream, state) {
    if (type == "word") {
      var tagName = stream.current();
      if (state.context && state.context.tagName != tagName &&
          config.implicitlyClosed.hasOwnProperty(state.context.tagName))
        popContext(state);
      if ((state.context && state.context.tagName == tagName) || config.matchClosing === false) {
        setStyle = "tag";
        return closeState;
      } else {
        setStyle = "tag error";
        return closeStateErr;
      }
    } else if (config.allowMissingTagName && type == "endTag") {
      setStyle = "tag bracket";
      return closeState(type, stream, state);
    } else {
      setStyle = "error";
      return closeStateErr;
    }
  }

  function closeState(type, _stream, state) {
    if (type != "endTag") {
      setStyle = "error";
      return closeState;
    }
    popContext(state);
    return baseState;
  }
  function closeStateErr(type, stream, state) {
    setStyle = "error";
    return closeState(type, stream, state);
  }

  function attrState(type, _stream, state) {
    if (type == "word") {
      setStyle = "attribute";
      return attrEqState;
    } else if (type == "endTag" || type == "selfcloseTag") {
      var tagName = state.tagName, tagStart = state.tagStart;
      state.tagName = state.tagStart = null;
      if (type == "selfcloseTag" ||
          config.autoSelfClosers.hasOwnProperty(tagName)) {
        maybePopContext(state, tagName);
      } else {
        maybePopContext(state, tagName);
        state.context = new Context(state, tagName, tagStart == state.indented);
      }
      return baseState;
    }
    setStyle = "error";
    return attrState;
  }
  function attrEqState(type, stream, state) {
    if (type == "equals") return attrValueState;
    if (!config.allowMissing) setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrValueState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    if (type == "word" && config.allowUnquoted) {setStyle = "string"; return attrState;}
    setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrContinuedState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    return attrState(type, stream, state);
  }

  return {
    startState: function(baseIndent) {
      var state = {tokenize: inText,
                   state: baseState,
                   indented: baseIndent || 0,
                   tagName: null, tagStart: null,
                   context: null}
      if (baseIndent != null) state.baseIndent = baseIndent
      return state
    },

    token: function(stream, state) {
      if (!state.tagName && stream.sol())
        state.indented = stream.indentation();

      if (stream.eatSpace()) return null;
      type = null;
      var style = state.tokenize(stream, state);
      if ((style || type) && style != "comment") {
        setStyle = null;
        state.state = state.state(type || style, stream, state);
        if (setStyle)
          style = setStyle == "error" ? style + " error" : setStyle;
      }
      return style;
    },

    indent: function(state, textAfter, fullLine) {
      var context = state.context;
      // Indent multi-line strings (e.g. css).
      if (state.tokenize.isInAttribute) {
        if (state.tagStart == state.indented)
          return state.stringStartCol + 1;
        else
          return state.indented + indentUnit;
      }
      if (context && context.noIndent) return CodeMirror.Pass;
      if (state.tokenize != inTag && state.tokenize != inText)
        return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
      // Indent the starts of attribute names.
      if (state.tagName) {
        if (config.multilineTagIndentPastTag !== false)
          return state.tagStart + state.tagName.length + 2;
        else
          return state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
      }
      if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
      if (tagAfter && tagAfter[1]) { // Closing tag spotted
        while (context) {
          if (context.tagName == tagAfter[2]) {
            context = context.prev;
            break;
          } else if (config.implicitlyClosed.hasOwnProperty(context.tagName)) {
            context = context.prev;
          } else {
            break;
          }
        }
      } else if (tagAfter) { // Opening tag spotted
        while (context) {
          var grabbers = config.contextGrabbers[context.tagName];
          if (grabbers && grabbers.hasOwnProperty(tagAfter[2]))
            context = context.prev;
          else
            break;
        }
      }
      while (context && context.prev && !context.startOfLine)
        context = context.prev;
      if (context) return context.indent + indentUnit;
      else return state.baseIndent || 0;
    },

    electricInput: /<\/[\s\w:]+>$/,
    blockCommentStart: "<!--",
    blockCommentEnd: "-->",

    configuration: config.htmlMode ? "html" : "xml",
    helperType: config.htmlMode ? "html" : "xml",

    skipAttribute: function(state) {
      if (state.state == attrValueState)
        state.state = attrState
    }
  };
});

CodeMirror.defineMIME("text/xml", "xml");
CodeMirror.defineMIME("application/xml", "xml");
if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
  CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

});


/***/ }),

/***/ 216:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newstudent">New Student</a>');

  $('#save').on('click', function () {
    var data = {
      first_name: $('#first_name').val(),
      last_name: $('#last_name').val(),
      email: $('#email').val()
    };
    if ($('#advisor_id').val() > 0) {
      data.advisor_id = $('#advisor_id').val();
    }
    if ($('#department_id').val() > 0) {
      data.department_id = $('#department_id').val();
    }
    var id = $('#id').val();
    data.eid = $('#eid').val();
    if (id.length == 0) {
      var url = '/admin/newstudent';
    } else {
      var url = '/admin/students/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deletestudent";
    var retUrl = "/admin/students";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeletestudent";
    var retUrl = "/admin/students";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function () {
    var url = "/admin/restorestudent";
    var retUrl = "/admin/students";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 217:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);
__webpack_require__(5);
__webpack_require__(215);
__webpack_require__(171);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newadvisor">New Advisor</a>');

  $('#notes').summernote({
    focus: true,
    toolbar: [
    // [groupName, [list of buttons]]
    ['style', ['style', 'bold', 'italic', 'underline', 'clear']], ['font', ['strikethrough', 'superscript', 'subscript', 'link']], ['para', ['ul', 'ol', 'paragraph']], ['misc', ['fullscreen', 'codeview', 'help']]],
    tabsize: 2,
    codemirror: {
      mode: 'text/html',
      htmlMode: true,
      lineNumbers: true,
      theme: 'monokai'
    }
  });

  $('#save').on('click', function () {
    var formData = new FormData($('form')[0]);
    formData.append("name", $('#name').val());
    formData.append("email", $('#email').val());
    formData.append("office", $('#office').val());
    formData.append("phone", $('#phone').val());
    formData.append("notes", $('#notes').val());
    formData.append("hidden", $('#hidden').is(':checked') ? 1 : 0);
    if ($('#pic').val()) {
      formData.append("pic", $('#pic')[0].files[0]);
    }
    if ($('#department_id').val() > 0) {
      formData.append("department_id", $('#department_id').val());
    }
    var id = $('#id').val();
    if (id.length == 0) {
      formData.append("eid", $('#eid').val());
      var url = '/admin/newadvisor';
    } else {
      formData.append("eid", $('#eid').val());
      var url = '/admin/advisors/' + id;
    }
    dashboard.ajaxsave(formData, url, id, true);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deleteadvisor";
    var retUrl = "/admin/advisors";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeleteadvisor";
    var retUrl = "/admin/advisors";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function () {
    var url = "/admin/restoreadvisor";
    var retUrl = "/admin/advisors";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });

  $(document).on('change', '.btn-file :file', function () {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
  });

  $('.btn-file :file').on('fileselect', function (event, numFiles, label) {

    var input = $(this).parents('.input-group').find(':text'),
        log = numFiles > 1 ? numFiles + ' files selected' : label;

    if (input.length) {
      input.val(log);
    } else {
      if (log) alert(log);
    }
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 218:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newdepartment">New Department</a>');

  $('#save').on('click', function () {
    var data = {
      name: $('#name').val(),
      email: $('#email').val(),
      office: $('#office').val(),
      phone: $('#phone').val()
    };
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newdepartment';
    } else {
      var url = '/admin/departments/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deletedepartment";
    var retUrl = "/admin/departments";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeletedepartment";
    var retUrl = "/admin/departments";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function () {
    var url = "/admin/restoredepartment";
    var retUrl = "/admin/departments";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 219:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newdegreeprogram">New Degree Program</a>');

  $('#save').on('click', function () {
    var data = {
      name: $('#name').val(),
      abbreviation: $('#abbreviation').val(),
      description: $('#description').val(),
      effective_year: $('#effective_year').val(),
      effective_semester: $('#effective_semester').val()
    };
    if ($('#department_id').val() > 0) {
      data.department_id = $('#department_id').val();
    }
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newdegreeprogram';
    } else {
      var url = '/admin/degreeprograms/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deletedegreeprogram";
    var retUrl = "/admin/degreeprograms";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeletedegreeprogram";
    var retUrl = "/admin/degreeprograms";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function () {
    var url = "/admin/restoredegreeprogram";
    var retUrl = "/admin/degreeprograms";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 220:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newelectivelist">New Elective List</a>');

  $('#save').on('click', function () {
    var data = {
      name: $('#name').val(),
      abbreviation: $('#abbreviation').val(),
      description: $('#description').val()
    };
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newelectivelist';
    } else {
      var url = '/admin/electivelists/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deleteelectivelist";
    var retUrl = "/admin/electivelists";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeleteelectivelist";
    var retUrl = "/admin/electivelists";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function () {
    var url = "/admin/restoreelectivelist";
    var retUrl = "/admin/electivelists";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 221:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newplan">New Plan</a>');

  $('#save').on('click', function () {
    var data = {
      name: $('#name').val(),
      description: $('#description').val(),
      start_year: $('#start_year').val(),
      start_semester: $('#start_semester').val(),
      degreeprogram_id: $('#degreeprogram_id').val(),
      student_id: $('#student_id').val()
    };
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newplan';
    } else {
      var url = '/admin/plans/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deleteplan";
    var retUrl = "/admin/plans";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeleteplan";
    var retUrl = "/admin/plans";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('#restore').on('click', function () {
    var url = "/admin/restoreplan";
    var retUrl = "/admin/plans";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxrestore(data, url, retUrl);
  });

  $('#repopulate').on('click', function () {
    var choice = confirm("Are you sure? This will permanently remove all requirements and repopulate them based on the selected degree program. You cannot undo this action.");
    if (choice === true) {
      var url = "/admin/populateplan";
      var data = {
        id: $('#id').val()
      };
      dashboard.ajaxsave(data, url, id);
    }
  });

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 222:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {

  dashboard.init();

  $('#save').on('click', function () {
    var data = {
      name: $('#name').val(),
      ordering: $('#ordering').val(),
      plan_id: $('#plan_id').val()
    };
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/plans/newplansemester/' + $('#plan_id').val();
    } else {
      var url = '/admin/plans/plansemester/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/plans/deleteplansemester/" + $('#id').val();
    var retUrl = "/admin/plans/" + $('#plan_id').val();
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 223:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newcompletedcourse">New Completed Course</a>');

  $('#save').on('click', function () {
    var data = {
      coursenumber: $('#coursenumber').val(),
      name: $('#name').val(),
      year: $('#year').val(),
      semester: $('#semester').val(),
      basis: $('#basis').val(),
      grade: $('#grade').val(),
      credits: $('#credits').val(),
      degreeprogram_id: $('#degreeprogram_id').val(),
      student_id: $('#student_id').val()
    };
    if ($('#student_id').val() > 0) {
      data.student_id = $('#student_id').val();
    }
    var selected = $("input[name='transfer']:checked");
    if (selected.length > 0) {
      var selectedVal = selected.val();
      if (selectedVal == 1) {
        data.transfer = false;
      } else if (selectedVal == 2) {
        data.transfer = true;
        data.incoming_institution = $('#incoming_institution').val();
        data.incoming_name = $('#incoming_name').val();
        data.incoming_description = $('#incoming_description').val();
        data.incoming_semester = $('#incoming_semester').val();
        data.incoming_credits = $('#incoming_credits').val();
        data.incoming_grade = $('#incoming_grade').val();
      }
    }
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newcompletedcourse';
    } else {
      var url = '/admin/completedcourses/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var url = "/admin/deletecompletedcourse";
    var retUrl = "/admin/completedcourses";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });

  $('input[name=transfer]').on('change', showselected);

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');

  if ($('#transfercourse').is(':hidden')) {
    $('#transfer1').prop('checked', true);
  } else {
    $('#transfer2').prop('checked', true);
  }
};

/**
 * Determine which div to show in the form
 */
var showselected = function showselected() {
  //https://stackoverflow.com/questions/8622336/jquery-get-value-of-selected-radio-button
  var selected = $("input[name='transfer']:checked");
  if (selected.length > 0) {
    var selectedVal = selected.val();
    if (selectedVal == 1) {
      $('#kstatecourse').show();
      $('#transfercourse').hide();
    } else if (selectedVal == 2) {
      $('#kstatecourse').hide();
      $('#transfercourse').show();
    }
  }
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 224:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  $('#save').on('click', function () {
    var data = {
      name: $('#name').val(),
      description: $('#description').val(),
      start_year: $('#start_year').val(),
      start_semester: $('#start_semester').val(),
      degreeprogram_id: $('#degreeprogram_id').val()
    };
    var id = $('#id').val();
    var student_id = $('#student_id').val();
    if (id.length == 0) {
      var url = '/flowcharts/new/' + student_id;
    } else {
      var url = '/flowcharts/edit/' + id;
    }
    dashboard.ajaxsave(data, url, id);
  });

  $('#delete').on('click', function () {
    var student_id = $('#student_id').val();
    var url = "/flowcharts/delete";
    var retUrl = "/flowcharts/" + student_id;
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#repopulate').on('click', function () {
    var choice = confirm("Are you sure? This will permanently remove all requirements and repopulate them based on the selected degree program. You cannot undo this action.");
    if (choice === true) {
      var url = "/flowcharts/reset";
      var data = {
        id: $('#id').val()
      };
      dashboard.ajaxsave(data, url, id);
    }
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 225:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {window._ = __webpack_require__(152);

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(1);

__webpack_require__(139);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(153);

//https://github.com/rappasoft/laravel-5-boilerplate/blob/master/resources/assets/js/bootstrap.js
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

var token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 226:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required JS libraries
__webpack_require__(173);
__webpack_require__(175);
var moment = __webpack_require__(0);
var site = __webpack_require__(213);
__webpack_require__(176);
var editable = __webpack_require__(214);

//Session for storing data between forms
exports.calendarSession = {};

//ID of the currently loaded calendar's advisor
exports.calendarAdvisorID = -1;

//Student's Name set by init
exports.calendarStudentName = "";

//Configuration data for fullcalendar instance
exports.calendarData = {
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'agendaWeek,agendaDay'
	},
	editable: false,
	eventLimit: true,
	height: 'auto',
	weekends: false,
	businessHours: {
		start: '8:00', // a start time (10am in this example)
		end: '17:00', // an end time (6pm in this example)
		dow: [1, 2, 3, 4, 5]
	},
	defaultView: 'agendaWeek',
	views: {
		agenda: {
			allDaySlot: false,
			slotDuration: '00:20:00',
			minTime: '08:00:00',
			maxTime: '17:00:00'
		}
	},
	eventSources: [{
		url: '/advising/meetingfeed',
		type: 'GET',
		error: function error() {
			alert('Error fetching meeting events from database');
		},
		color: '#512888',
		textColor: 'white'
	}, {
		url: '/advising/blackoutfeed',
		type: 'GET',
		error: function error() {
			alert('Error fetching blackout events from database');
		},
		color: '#FF8888',
		textColor: 'black'
	}],
	selectable: true,
	selectHelper: true,
	selectOverlap: function selectOverlap(event) {
		return event.rendering === 'background';
	},
	timeFormat: ' '
};

//Configuration data for datepicker instance
exports.datePickerData = {
	daysOfWeekDisabled: [0, 6],
	format: 'LLL',
	stepping: 20,
	enabledHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
	maxHour: 17,
	sideBySide: true,
	ignoreReadonly: true,
	allowInputToggle: true
};

//Configuration data for datepicker instance day only
exports.datePickerDateOnly = {
	daysOfWeekDisabled: [0, 6],
	format: 'MM/DD/YYYY',
	ignoreReadonly: true,
	allowInputToggle: true
};

/**
 * Initialzation function for fullcalendar instance
 *
 * @param advisor - boolean true if the user is an advisor
 * @param nobind - boolean true if the buttons should not be bound (make calendar read-only)
 */
exports.init = function () {

	//Check for messages in the session from a previous action
	site.checkMessage();

	//initalize editable elements
	editable.init();

	//tweak parameters
	window.advisor || (window.advisor = false);
	window.nobind || (window.nobind = false);

	//get the current advisor's ID
	exports.calendarAdvisorID = $('#calendarAdvisorID').val().trim();

	//Set the advisor information for meeting event source
	exports.calendarData.eventSources[0].data = { id: exports.calendarAdvisorID };

	//Set the advsior inforamtion for blackout event source
	exports.calendarData.eventSources[1].data = { id: exports.calendarAdvisorID };

	//if the window is small, set different default for calendar
	if ($(window).width() < 600) {
		exports.calendarData.defaultView = 'agendaDay';
	}

	//If nobind, don't bind the forms
	if (!window.nobind) {
		//If the current user is an advisor, bind more data
		if (window.advisor) {

			//When the create event button is clicked, show the modal form
			$('#createEvent').on('shown.bs.modal', function () {
				$('#title').focus();
			});

			//Enable and disable certain form fields based on user
			$('#title').prop('disabled', false);
			$('#start').prop('disabled', false);
			$('#studentid').prop('disabled', false);
			$('#start_span').removeClass('datepicker-disabled');
			$('#end').prop('disabled', false);
			$('#end_span').removeClass('datepicker-disabled');
			$('#studentiddiv').show();
			$('#statusdiv').show();

			//bind the reset form method
			$('#createEvent').on('hidden.bs.modal', resetForm);

			//bind methods for buttons and forms
			$('#newStudentButton').bind('click', newStudent);

			$('#createBlackout').on('shown.bs.modal', function () {
				$('#btitle').focus();
			});

			$('#createBlackout').on('hidden.bs.modal', function () {
				$('#repeatdailydiv').hide();
				$('#repeatweeklydiv').hide();
				$('#repeatuntildiv').hide();
				$(this).find('form')[0].reset();
				$(this).find('.has-error').each(function () {
					$(this).removeClass('has-error');
				});
				$(this).find('.help-block').each(function () {
					$(this).text('');
				});
			});

			$('#createEvent').on('hidden.bs.modal', loadConflicts);

			$('#resolveConflict').on('hidden.bs.modal', loadConflicts);

			$('#resolveConflict').on('hidden.bs.modal', function () {
				$('#calendar').fullCalendar('refetchEvents');
			});

			//bind autocomplete field
			$('#studentid').autocomplete({
				serviceUrl: '/profile/studentfeed',
				ajaxSettings: {
					dataType: "json"
				},
				onSelect: function onSelect(suggestion) {
					$('#studentidval').val(suggestion.data);
				},
				transformResult: function transformResult(response) {
					return {
						suggestions: $.map(response.data, function (dataItem) {
							return { value: dataItem.value, data: dataItem.data };
						})
					};
				}
			});

			$('#start_datepicker').datetimepicker(exports.datePickerData);

			$('#end_datepicker').datetimepicker(exports.datePickerData);

			linkDatePickers('#start', '#end', '#duration');

			$('#bstart_datepicker').datetimepicker(exports.datePickerData);

			$('#bend_datepicker').datetimepicker(exports.datePickerData);

			linkDatePickers('#bstart', '#bend', '#bduration');

			$('#brepeatuntil_datepicker').datetimepicker(exports.datePickerDateOnly);

			//change rendering of events
			exports.calendarData.eventRender = function (event, element) {
				element.addClass("fc-clickable");
			};
			exports.calendarData.eventClick = function (event, element, view) {
				if (event.type == 'm') {
					$('#studentid').val(event.studentname);
					$('#studentidval').val(event.student_id);
					showMeetingForm(event);
				} else if (event.type == 'b') {
					exports.calendarSession = {
						event: event
					};
					if (event.repeat == '0') {
						blackoutSeries();
					} else {
						$('#blackoutOption').modal('show');
					}
				}
			};
			exports.calendarData.select = function (start, end) {
				exports.calendarSession = {
					start: start,
					end: end
				};
				$('#bblackoutid').val(-1);
				$('#bblackouteventid').val(-1);
				$('#meetingID').val(-1);
				$('#meetingOption').modal('show');
			};

			//bind more buttons
			$('#brepeat').change(repeatChange);

			$('#saveBlackoutButton').bind('click', saveBlackout);

			$('#deleteBlackoutButton').bind('click', deleteBlackout);

			$('#blackoutSeries').bind('click', function () {
				$('#blackoutOption').modal('hide');
				blackoutSeries();
			});

			$('#blackoutOccurrence').bind('click', function () {
				$('#blackoutOption').modal('hide');
				blackoutOccurrence();
			});

			$('#advisingButton').bind('click', function () {
				$('#meetingOption').off('hidden.bs.modal');
				$('#meetingOption').on('hidden.bs.modal', function (e) {
					createMeetingForm();
				});
				$('#meetingOption').modal('hide');
			});

			$('#createMeetingBtn').bind('click', function () {
				exports.calendarSession = {};
				createMeetingForm();
			});

			$('#blackoutButton').bind('click', function () {
				$('#meetingOption').off('hidden.bs.modal');
				$('#meetingOption').on('hidden.bs.modal', function (e) {
					createBlackoutForm();
				});
				$('#meetingOption').modal('hide');
			});

			$('#createBlackoutBtn').bind('click', function () {
				exports.calendarSession = {};
				createBlackoutForm();
			});

			$('#resolveButton').on('click', resolveConflicts);

			loadConflicts();

			//If the current user is not an advisor, bind less data
		} else {

			//Get the current student's name
			exports.calendarStudentName = $('#calendarStudentName').val().trim();

			//Render blackouts to background
			exports.calendarData.eventSources[1].rendering = 'background';

			//When rendering, use this custom function for blackouts and student meetings
			exports.calendarData.eventRender = function (event, element) {
				if (event.type == 'b') {
					element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
				}
				if (event.type == 's') {
					element.addClass("fc-green");
				}
			};

			//Use this method for clicking on meetings
			exports.calendarData.eventClick = function (event, element, view) {
				if (event.type == 's') {
					if (event.start.isAfter(moment())) {
						showMeetingForm(event);
					} else {
						alert("You cannot edit meetings in the past");
					}
				}
			};

			//When selecting new areas, use the studentSelect method in the calendar library
			exports.calendarData.select = studentSelect;

			//When the create event button is clicked, show the modal form
			$('#createEvent').on('shown.bs.modal', function () {
				$('#desc').focus();
			});

			//Enable and disable certain form fields based on user
			$('#title').prop('disabled', true);
			$("#start").prop('disabled', true);
			$('#studentid').prop('disabled', true);
			$("#start_span").addClass('datepicker-disabled');
			$("#end").prop('disabled', true);
			$("#end_span").addClass('datepicker-disabled');
			$('#studentiddiv').hide();
			$('#statusdiv').hide();
			$('#studentidval').val(-1);

			//bind the reset form method
			$('.modal').on('hidden.bs.modal', resetForm);
		}

		//Bind click handlers on the form
		$('#saveButton').bind('click', saveMeeting);
		$('#deleteButton').bind('click', deleteMeeting);
		$('#duration').on('change', changeDuration);

		//for read-only calendars with no binding
	} else {
		//for read-only calendars, set rendering to background
		exports.calendarData.eventSources[1].rendering = 'background';
		exports.calendarData.selectable = false;

		exports.calendarData.eventRender = function (event, element) {
			if (event.type == 'b') {
				element.append("<div style=\"color: #000000; z-index: 5;\">" + event.title + "</div>");
			}
			if (event.type == 's') {
				element.addClass("fc-green");
			}
		};
	}

	//initalize the calendar!
	$('#calendar').fullCalendar(exports.calendarData);
};

/**
 * Function to reset calendar by closing modals and reloading data
 *
 * @param element - the jQuery identifier of the form to hide (and the spin)
 * @param reponse - the Axios repsonse object received
 */
var resetCalendar = function resetCalendar(element, response) {
	//hide the form
	$(element).modal('hide');

	//display the message to the user
	site.displayMessage(response.data, "success");

	//refresh the calendar
	$('#calendar').fullCalendar('unselect');
	$('#calendar').fullCalendar('refetchEvents');
	$(element + 'spin').addClass('hide-spin');

	if (window.advisor) {
		loadConflicts();
	}
};

/**
 * AJAX method to save data from a form
 *
 * @param url - the URL to send the data to
 * @param data - the data object to send
 * @param element - the source element of the data
 * @param action - the string description of the action
 */
var ajaxSave = function ajaxSave(url, data, element, action) {
	//AJAX POST to server
	window.axios.post(url, data)
	//if response is 2xx
	.then(function (response) {
		resetCalendar(element, response);
	})
	//if response is not 2xx
	.catch(function (error) {
		site.handleError(action, element, error);
	});
};

var ajaxDelete = function ajaxDelete(url, data, element, action, noReset, noChoice) {
	//check noReset variable
	noReset || (noReset = false);
	noChoice || (noChoice = false);

	//prompt the user for confirmation
	if (!noChoice) {
		var choice = confirm("Are you sure?");
	} else {
		var choice = true;
	}

	if (choice === true) {

		//if confirmed, show spinning icon
		$(element + 'spin').removeClass('hide-spin');

		//make AJAX request to delete
		window.axios.post(url, data).then(function (response) {
			if (noReset) {
				//hide parent element - TODO TESTME
				//caller.parent().parent().addClass('hidden');
				$(element + 'spin').addClass('hide-spin');
				$(element).addClass('hidden');
			} else {
				resetCalendar(element, response);
			}
		}).catch(function (error) {
			site.handleError(action, element, error);
		});
	}
};

/**
 * Function to save a meeting
 */
var saveMeeting = function saveMeeting() {

	//Show the spinning status icon while working
	$('#createEventspin').removeClass('hide-spin');

	//build the data object and URL
	var data = {
		start: moment($('#start').val(), "LLL").format(),
		end: moment($('#end').val(), "LLL").format(),
		title: $('#title').val(),
		desc: $('#desc').val(),
		status: $('#status').val()
	};
	data.id = exports.calendarAdvisorID;
	if ($('#meetingID').val() > 0) {
		data.meetingid = $('#meetingID').val();
	}
	if ($('#studentidval').val() > 0) {
		data.studentid = $('#studentidval').val();
	}
	var url = '/advising/createmeeting';

	//AJAX POST to server
	ajaxSave(url, data, '#createEvent', 'save meeting');
};

/**
 * Function to delete a meeting
 */
var deleteMeeting = function deleteMeeting() {

	//build data and url
	var data = {
		meetingid: $('#meetingID').val()
	};
	var url = '/advising/deletemeeting';

	ajaxDelete(url, data, '#createEvent', 'delete meeting', false);
};

/**
 * Function to populate and show the meeting form for editing
 *
 * @param event - The event to edit
 */
var showMeetingForm = function showMeetingForm(event) {
	$('#title').val(event.title);
	$('#start').val(event.start.format("LLL"));
	$('#end').val(event.end.format("LLL"));
	$('#desc').val(event.desc);
	durationOptions(event.start, event.end);
	$('#meetingID').val(event.id);
	$('#studentidval').val(event.student_id);
	$('#status').val(event.status);
	$('#deleteButton').show();
	$('#createEvent').modal('show');
};

/**
 * Function to reset and show the meeting form for creation
 *
 * @param calendarStudentName - string name of the student
 */
var createMeetingForm = function createMeetingForm(calendarStudentName) {

	//populate the title automatically for a student
	if (calendarStudentName !== undefined) {
		$('#title').val(calendarStudentName);
	} else {
		$('#title').val('');
	}

	//Set start time
	if (exports.calendarSession.start === undefined) {
		$('#start').val(moment().hour(8).minute(0).format('LLL'));
	} else {
		$('#start').val(exports.calendarSession.start.format("LLL"));
	}

	//Set end time
	if (exports.calendarSession.end === undefined) {
		$('#end').val(moment().hour(8).minute(20).format('LLL'));
	} else {
		$('#end').val(exports.calendarSession.end.format("LLL"));
	}

	//Set duration options
	if (exports.calendarSession.start === undefined) {
		durationOptions(moment().hour(8).minute(0), moment().hour(8).minute(20));
	} else {
		durationOptions(exports.calendarSession.start, exports.calendarSession.end);
	}

	//Reset other options
	$('#meetingID').val(-1);
	$('#studentidval').val(-1);

	//Hide delete button
	$('#deleteButton').hide();

	//Show the modal form
	$('#createEvent').modal('show');
};

/*
 * Function to reset the form on this page
 */
var resetForm = function resetForm() {
	$(this).find('form')[0].reset();
	site.clearFormErrors();
};

/**
 * Function to set duration options for the meeting form
 *
 * @param start - a moment object for the start time
 * @param end - a moment object for the ending time
 */
var durationOptions = function durationOptions(start, end) {
	//clear the list
	$('#duration').empty();

	//assume all meetings have room for 20 minutes
	$('#duration').append("<option value='20'>20 minutes</option>");

	//if it starts on or before 4:20, allow 40 minutes as an option
	if (start.hour() < 16 || start.hour() == 16 && start.minutes() <= 20) {
		$('#duration').append("<option value='40'>40 minutes</option>");
	}

	//if it starts on or before 4:00, allow 60 minutes as an option
	if (start.hour() < 16 || start.hour() == 16 && start.minutes() <= 0) {
		$('#duration').append("<option value='60'>60 minutes</option>");
	}

	//set default value based on given span
	$('#duration').val(end.diff(start, "minutes"));
};

/**
 * Function to link the datepickers together
 *
 * @param elem1 - jQuery object for first datepicker
 * @param elem2 - jQuery object for second datepicker
 * @param duration - duration of the meeting
 */
var linkDatePickers = function linkDatePickers(elem1, elem2, duration) {
	//bind to change action on first datapicker
	$(elem1 + "_datepicker").on("dp.change", function (e) {
		var date2 = moment($(elem2).val(), 'LLL');
		if (e.date.isAfter(date2) || e.date.isSame(date2)) {
			date2 = e.date.clone();
			$(elem2).val(date2.format("LLL"));
		}
	});

	//bind to change action on second datepicker
	$(elem2 + "_datepicker").on("dp.change", function (e) {
		var date1 = moment($(elem1).val(), 'LLL');
		if (e.date.isBefore(date1) || e.date.isSame(date1)) {
			date1 = e.date.clone();
			$(elem1).val(date1.format("LLL"));
		}
	});
};

/**
 * Function to change the duration of the meeting
 */
var changeDuration = function changeDuration() {
	var newDate = moment($('#start').val(), 'LLL').add($(this).val(), "minutes");
	$('#end').val(newDate.format("LLL"));
};

/**
 * Function to verify that the students are selecting meetings that aren't too long
 *
 * @param start - moment object for the start of the meeting
 * @param end - moment object for the end of the meeting
 */
var studentSelect = function studentSelect(start, end) {

	//When students select a meeting, diff the start and end times
	if (end.diff(start, 'minutes') > 60) {

		//if invalid, unselect and show an error
		alert("Meetings cannot last longer than 1 hour");
		$('#calendar').fullCalendar('unselect');
	} else {

		//if valid, set data in the session and show the form
		exports.calendarSession = {
			start: start,
			end: end
		};
		$('#meetingID').val(-1);
		createMeetingForm(exports.calendarStudentName);
	}
};

/**
 * Load conflicting meetings from the server
 */
var loadConflicts = function loadConflicts() {

	//request conflicts via AJAX
	window.axios.get('/advising/conflicts').then(function (response) {

		//disable existing click handlers
		$(document).off('click', '.deleteConflict', deleteConflict);
		$(document).off('click', '.editConflict', editConflict);
		$(document).off('click', '.resolveConflict', resolveConflict);

		//If response is 200, data was received
		if (response.status == 200) {

			//Append HTML for conflicts to DOM
			$('#resolveConflictMeetings').empty();
			$.each(response.data, function (index, value) {
				$('<div/>', {
					'id': 'resolve' + value.id,
					'class': 'meeting-conflict',
					'html': '<p>&nbsp;<button type="button" class="btn btn-danger pull-right deleteConflict" data-id=' + value.id + '>Delete</button>' + '&nbsp;<button type="button" class="btn btn-primary pull-right editConflict" data-id=' + value.id + '>Edit</button> ' + '<button type="button" class="btn btn-success pull-right resolveConflict" data-id=' + value.id + '>Keep Meeting</button>' + '<span id="resolve' + value.id + 'spin" class="fa fa-cog fa-spin fa-lg pull-right hide-spin">&nbsp;</span>' + '<b>' + value.title + '</b> (' + value.start + ')</p><hr>'
				}).appendTo('#resolveConflictMeetings');
			});

			//Re-register click handlers
			$(document).on('click', '.deleteConflict', deleteConflict);
			$(document).on('click', '.editConflict', editConflict);
			$(document).on('click', '.resolveConflict', resolveConflict);

			//Show the <div> containing conflicts
			$('#conflictingMeetings').removeClass('hidden');

			//If response is 204, no conflicts are present
		} else if (response.status == 204) {

			//Hide the <div> containing conflicts
			$('#conflictingMeetings').addClass('hidden');
		}
	}).catch(function (error) {
		alert("Unable to retrieve conflicting meetings: " + error.response.data);
	});
};

/**
 * Save blackouts and blackout events
 */
var saveBlackout = function saveBlackout() {

	//Show the spinning status icon while working
	$('#createBlackoutspin').removeClass('hide-spin');

	//build the data object and url;
	var data = {
		bstart: moment($('#bstart').val(), 'LLL').format(),
		bend: moment($('#bend').val(), 'LLL').format(),
		btitle: $('#btitle').val()
	};
	var url;
	if ($('#bblackouteventid').val() > 0) {
		url = '/advising/createblackoutevent';
		data.bblackouteventid = $('#bblackouteventid').val();
	} else {
		url = '/advising/createblackout';
		if ($('#bblackoutid').val() > 0) {
			data.bblackoutid = $('#bblackoutid').val();
		}
		data.brepeat = $('#brepeat').val();
		if ($('#brepeat').val() == 1) {
			data.brepeatevery = $('#brepeatdaily').val();
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
		if ($('#brepeat').val() == 2) {
			data.brepeatevery = $('#brepeatweekly').val();
			data.brepeatweekdaysm = $('#brepeatweekdays1').prop('checked');
			data.brepeatweekdayst = $('#brepeatweekdays2').prop('checked');
			data.brepeatweekdaysw = $('#brepeatweekdays3').prop('checked');
			data.brepeatweekdaysu = $('#brepeatweekdays4').prop('checked');
			data.brepeatweekdaysf = $('#brepeatweekdays5').prop('checked');
			data.brepeatuntil = moment($('#brepeatuntil').val(), "MM/DD/YYYY").format();
		}
	}

	//send AJAX post
	ajaxSave(url, data, '#createBlackout', 'save blackout');
};

/**
 * Delete blackout and blackout events
 */
var deleteBlackout = function deleteBlackout() {

	//build URL and data object
	var url, data;
	if ($('#bblackouteventid').val() > 0) {
		url = '/advising/deleteblackoutevent';
		data = { bblackouteventid: $('#bblackouteventid').val() };
	} else {
		url = '/advising/deleteblackout';
		data = { bblackoutid: $('#bblackoutid').val() };
	}

	//send AJAX post
	ajaxDelete(url, data, '#createBlackout', 'delete blackout', false);
};

/**
 * Function for handling the change of repeat options on the blackout form
 */
var repeatChange = function repeatChange() {
	if ($(this).val() == 0) {
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').hide();
	} else if ($(this).val() == 1) {
		$('#repeatdailydiv').show();
		$('#repeatweeklydiv').hide();
		$('#repeatuntildiv').show();
	} else if ($(this).val() == 2) {
		$('#repeatdailydiv').hide();
		$('#repeatweeklydiv').show();
		$('#repeatuntildiv').show();
	}
};

/**
 * Show the resolve conflicts modal form
 */
var resolveConflicts = function resolveConflicts() {
	$('#resolveConflict').modal('show');
};

/**
 * Delete conflicting meeting
 */
var deleteConflict = function deleteConflict() {

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	};
	var url = '/advising/deletemeeting';

	//send AJAX delete
	ajaxDelete(url, data, '#resolve' + id, 'delete meeting', true);
};

/**
 * Edit conflicting meeting
 */
var editConflict = function editConflict() {

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	};
	var url = '/advising/meeting';

	//show spinner to load meeting
	$('#resolve' + id + 'spin').removeClass('hide-spin');

	//load meeting and display form
	window.axios.get(url, {
		params: data
	}).then(function (response) {
		$('#resolve' + id + 'spin').addClass('hide-spin');
		$('#resolveConflict').modal('hide');
		event = response.data;
		event.start = moment(event.start);
		event.end = moment(event.end);
		showMeetingForm(event);
	}).catch(function (error) {
		site.handleError('retrieve meeting', '#resolve' + id, error);
	});
};

/**
 * Resolve a conflicting meeting
 */
var resolveConflict = function resolveConflict() {

	//build data and URL
	var id = $(this).data('id');
	var data = {
		meetingid: id
	};
	var url = '/advising/resolveconflict';

	ajaxDelete(url, data, '#resolve' + id, 'resolve meeting', true, true);
};

/**
 * Function to create the create blackout form
 */
var createBlackoutForm = function createBlackoutForm() {
	$('#btitle').val("");
	if (exports.calendarSession.start === undefined) {
		$('#bstart').val(moment().hour(8).minute(0).format('LLL'));
	} else {
		$('#bstart').val(exports.calendarSession.start.format("LLL"));
	}
	if (exports.calendarSession.end === undefined) {
		$('#bend').val(moment().hour(9).minute(0).format('LLL'));
	} else {
		$('#bend').val(exports.calendarSession.end.format("LLL"));
	}
	$('#bblackoutid').val(-1);
	$('#repeatdiv').show();
	$('#brepeat').val(0);
	$('#brepeat').trigger('change');
	$('#deleteBlackoutButton').hide();
	$('#createBlackout').modal('show');
};

/**
 * Function to reset the form to a single occurrence
 */
var blackoutOccurrence = function blackoutOccurrence() {
	//hide the modal form
	$('#blackoutOption').modal('hide');

	//set form values and hide unneeded fields
	$('#btitle').val(exports.calendarSession.event.title);
	$('#bstart').val(exports.calendarSession.event.start.format("LLL"));
	$('#bend').val(exports.calendarSession.event.end.format("LLL"));
	$('#repeatdiv').hide();
	$('#repeatdailydiv').hide();
	$('#repeatweeklydiv').hide();
	$('#repeatuntildiv').hide();
	$('#bblackoutid').val(exports.calendarSession.event.blackout_id);
	$('#bblackouteventid').val(exports.calendarSession.event.id);
	$('#deleteBlackoutButton').show();

	//show the form
	$('#createBlackout').modal('show');
};

/**
 * Function to load a blackout series edit form
 */
var blackoutSeries = function blackoutSeries() {
	//hide the modal form
	$('#blackoutOption').modal('hide');

	//build data and URL
	var data = {
		id: exports.calendarSession.event.blackout_id
	};
	var url = '/advising/blackout';

	window.axios.get(url, {
		params: data
	}).then(function (response) {
		$('#btitle').val(response.data.title);
		$('#bstart').val(moment(response.data.start, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
		$('#bend').val(moment(response.data.end, 'YYYY-MM-DD HH:mm:ss').format('LLL'));
		$('#bblackoutid').val(response.data.id);
		$('#bblackouteventid').val(-1);
		$('#repeatdiv').show();
		$('#brepeat').val(response.data.repeat_type);
		$('#brepeat').trigger('change');
		if (response.data.repeat_type == 1) {
			$('#brepeatdaily').val(response.data.repeat_every);
			$('#brepeatuntil').val(moment(response.data.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
		} else if (response.data.repeat_type == 2) {
			$('#brepeatweekly').val(response.data.repeat_every);
			var repeat_detail = String(response.data.repeat_detail);
			$('#brepeatweekdays1').prop('checked', repeat_detail.indexOf("1") >= 0);
			$('#brepeatweekdays2').prop('checked', repeat_detail.indexOf("2") >= 0);
			$('#brepeatweekdays3').prop('checked', repeat_detail.indexOf("3") >= 0);
			$('#brepeatweekdays4').prop('checked', repeat_detail.indexOf("4") >= 0);
			$('#brepeatweekdays5').prop('checked', repeat_detail.indexOf("5") >= 0);
			$('#brepeatuntil').val(moment(response.data.repeat_until, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY'));
		}
		$('#deleteBlackoutButton').show();
		$('#createBlackout').modal('show');
	}).catch(function (error) {
		site.handleError('retrieve blackout series', '', error);
	});
};

/**
 * Function to create a new student in the database
 */
var newStudent = function newStudent() {
	//prompt the user for an eID to add to the system
	var eid = prompt("Enter the student's eID");

	//build the URL and data
	var data = {
		eid: eid
	};
	var url = '/profile/newstudent';

	//send AJAX post
	window.axios.post(url, data).then(function (response) {
		alert(response.data);
	}).catch(function (error) {
		if (error.response) {
			//If response is 422, errors were provided
			if (error.response.status == 422) {
				alert("Unable to create user: " + error.response.data["eid"]);
			} else {
				alert("Unable to create user: " + error.response.data);
			}
		}
	});
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 227:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {window.Vue = __webpack_require__(177);
var site = __webpack_require__(213);
var Echo = __webpack_require__(182);
__webpack_require__(181);

window.Pusher = __webpack_require__(180);

/**
 * Groupsession init function
 * must be called explicitly to start
 */
exports.init = function () {

	//load ion-sound library
	ion.sound({
		sounds: [{
			name: "door_bell"
		}],
		volume: 1.0,
		path: "/sounds/",
		preload: true
	});

	//get userID and isAdvisor variables
	window.userID = parseInt($('#userID').val());

	//register button click
	$('#groupRegisterBtn').on('click', groupRegisterBtn);

	//disable button click
	$('#groupDisableBtn').on('click', groupDisableBtn);

	//render Vue App
	window.vm = new Vue({
		el: '#groupList',
		data: {
			queue: [],
			advisor: parseInt($('#isAdvisor').val()) == 1,
			userID: parseInt($('#userID').val()),
			online: []
		},
		methods: {
			//Function to get CSS classes for a student object
			getClass: function getClass(s) {
				return {
					'alert-info': s.status == 0 || s.status == 1,
					'alert-success': s.status == 2,
					'groupsession-me': s.userid == this.userID,
					'groupsession-offline': $.inArray(s.userid, this.online) == -1
				};
			},
			//function to take a student from the list
			takeStudent: function takeStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/take';
				ajaxPost(url, data, 'take');
			},

			//function to put a student back at the end of the list
			putStudent: function putStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/put';
				ajaxPost(url, data, 'put');
			},

			// function to mark a student done on the list
			doneStudent: function doneStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/done';
				ajaxPost(url, data, 'mark done');
			},

			//function to delete a student from the list
			delStudent: function delStudent(event) {
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/delete';
				ajaxPost(url, data, 'delete');
			}
		}
	});

	//Enable Pusher logging
	if (window.env == "local" || window.env == "staging") {
		console.log("Pusher logging enabled!");
		Pusher.logToConsole = true;
	}

	//Load the Echo instance on the window
	window.Echo = new Echo({
		broadcaster: 'pusher',
		key: window.pusherKey,
		cluster: window.pusherCluster
	});

	//Bind to the connected action on Pusher (called when connected)
	window.Echo.connector.pusher.connection.bind('connected', function () {
		//when connected, disable the spinner
		$('#groupspin').addClass('hide-spin');

		//Load the initial student queue via AJAX
		window.axios.get('/groupsession/queue').then(function (response) {
			window.vm.queue = window.vm.queue.concat(response.data);
			checkButtons(window.vm.queue);
			initialCheckDing(window.vm.queue);
			window.vm.queue.sort(sortFunction);
		}).catch(function (error) {
			site.handleError('get queue', '', error);
		});
	});

	//Connect to the groupsession channel
	/*
 window.Echo.channel('groupsession')
 	.listen('GroupsessionRegister', (data) => {
 		});
 */

	//Connect to the groupsessionend channel
	window.Echo.channel('groupsessionend').listen('GroupsessionEnd', function (e) {

		//if ending, redirect back to home page
		window.location.href = "/groupsession";
	});

	window.Echo.join('presence').here(function (users) {
		var len = users.length;
		for (var i = 0; i < len; i++) {
			window.vm.online.push(users[i].id);
		}
	}).joining(function (user) {
		window.vm.online.push(user.id);
	}).leaving(function (user) {
		window.vm.online.splice($.inArray(user.id, window.vm.online), 1);
	}).listen('GroupsessionRegister', function (data) {
		var queue = window.vm.queue;
		var found = false;
		var len = queue.length;

		//update the queue based on response
		for (var i = 0; i < len; i++) {
			if (queue[i].id === data.id) {
				if (data.status < 3) {
					queue[i] = data;
				} else {
					queue.splice(i, 1);
					i--;
					len--;
				}
				found = true;
			}
		}

		//if element not found on current queue, push it on to the queue
		if (!found) {
			queue.push(data);
		}

		//check to see if current user is on queue before enabling button
		checkButtons(queue);

		//if current user is found, check for status update to play sound
		if (data.userid === userID) {
			checkDing(data);
		}

		//sort the queue correctly
		queue.sort(sortFunction);

		//update Vue state, might be unnecessary
		window.vm.queue = queue;
	});
};

/**
 * Vue filter for status text
 *
 * @param data - the student to render
 */
Vue.filter('statustext', function (data) {
	if (data.status === 0) return "NEW";
	if (data.status === 1) return "QUEUED";
	if (data.status === 2) return "MEET WITH " + data.advisor;
	if (data.status === 3) return "DELAY";
	if (data.status === 4) return "ABSENT";
	if (data.status === 5) return "DONE";
});

/**
 * Function for clicking on the register button
 */
var groupRegisterBtn = function groupRegisterBtn() {
	$('#groupspin').removeClass('hide-spin');

	var url = '/groupsession/register';
	window.axios.post(url, {}).then(function (response) {
		site.displayMessage(response.data, "success");
		disableButton();
		$('#groupspin').addClass('hide-spin');
	}).catch(function (error) {
		site.handleError('register', '#group', error);
	});
};

/**
 * Function for advisors to disable groupsession
 */
var groupDisableBtn = function groupDisableBtn() {
	var choice = confirm("Are you sure?");
	if (choice === true) {
		var really = confirm("Seriously, this will lose all current data. Are you really sure?");
		if (really === true) {
			//this is a bit hacky, but it works
			var token = $('meta[name="csrf-token"]').attr('content');
			$('<form action="/groupsession/disable" method="POST"/>').append($('<input type="hidden" name="id" value="' + window.userID + '">')).append($('<input type="hidden" name="_token" value="' + token + '">')).appendTo($(document.body)) //it has to be added somewhere into the <body>
			.submit();
		}
	}
};

/**
 * Function to enable registration button
 */
var enableButton = function enableButton() {
	$('#groupRegisterBtn').removeAttr('disabled');
};

/**
 * Function to disable registration button
 */
var disableButton = function disableButton() {
	$('#groupRegisterBtn').attr('disabled', 'disabled');
};

/**
 * Function to check and see if user is on the list - if not, don't enable button
 */
var checkButtons = function checkButtons(queue) {
	var len = queue.length;
	var foundMe = false;

	//iterate through users on list, looking for current user
	for (var i = 0; i < len; i++) {
		if (queue[i].userid === window.userID) {
			foundMe = true;
			break;
		}
	}

	//if found, disable button; if not, enable button
	if (foundMe) {
		disableButton();
	} else {
		enableButton();
	}
};

/**
 * Check to see if the current user is beckoned, if so, play sound!
 *
 * @param person - the current user to check
 */
var checkDing = function checkDing(person) {
	if (person.status == 2) {
		ion.sound.play("door_bell");
	}
};

/**
 * Check if the person has been beckoned on load; if so, play sound!
 *
 * @param queue - the initial queue of users loaded
 */
var initialCheckDing = function initialCheckDing(queue) {
	var len = queue.length;
	for (var i = 0; i < len; i++) {
		if (queue[i].userid === window.userID) {
			checkDing(queue[i]);
			break;
		}
	}
};

/**
 * Helper function to sort elements based on their status
 *
 * @param a - first person
 * @param b - second person
 * @return - sorting value indicating who should go first_name
 */
var sortFunction = function sortFunction(a, b) {
	if (a.status == b.status) {
		return a.id < b.id ? -1 : 1;
	}
	return a.status < b.status ? 1 : -1;
};

/**
 * Function for making AJAX POST requests
 *
 * @param url - the URL to send to
 * @param data - the data object to send
 * @param action - the string describing the action
 */
var ajaxPost = function ajaxPost(url, data, action) {
	window.axios.post(url, data).then(function (response) {
		site.displayMessage(response.data, "success");
	}).catch(function (error) {
		site.handleError(action, '', error);
	});
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 228:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(213);
__webpack_require__(5);
__webpack_require__(215);
__webpack_require__(171);

exports.init = function () {

	$('#notes').summernote({
		focus: true,
		toolbar: [
		// [groupName, [list of buttons]]
		['style', ['style', 'bold', 'italic', 'underline', 'clear']], ['font', ['strikethrough', 'superscript', 'subscript', 'link']], ['para', ['ul', 'ol', 'paragraph']], ['misc', ['fullscreen', 'codeview', 'help']]],
		tabsize: 2,
		codemirror: {
			mode: 'text/html',
			htmlMode: true,
			lineNumbers: true,
			theme: 'monokai'
		}
	});

	//bind click handler for save button
	$('#saveProfile').on('click', function () {

		//show spinning icon
		$('#profilespin').removeClass('hide-spin');

		//build data and URL
		var data = {
			first_name: $('#first_name').val(),
			last_name: $('#last_name').val()
		};
		var url = '/profile/update';

		//send AJAX post
		window.axios.post(url, data).then(function (response) {
			site.displayMessage(response.data, "success");
			site.clearFormErrors();
			$('#profilespin').addClass('hide-spin');
			$('#profileAdvisingBtn').removeClass('hide-spin');
		}).catch(function (error) {
			site.handleError('save profile', '#profile', error);
		});
	});

	//bind click handler for advisor save button
	$('#saveAdvisorProfile').on('click', function () {

		//show spinning icon
		$('#profilespin').removeClass('hide-spin');

		//build data and URL
		//TODO TESTME
		var data = new FormData($('form')[0]);
		data.append("name", $('#name').val());
		data.append("email", $('#email').val());
		data.append("office", $('#office').val());
		data.append("phone", $('#phone').val());
		data.append("notes", $('#notes').val());
		if ($('#pic').val()) {
			data.append("pic", $('#pic')[0].files[0]);
		}
		var url = '/profile/update';

		window.axios.post(url, data).then(function (response) {
			site.displayMessage(response.data, "success");
			site.clearFormErrors();
			$('#profilespin').addClass('hide-spin');
			$('#profileAdvisingBtn').removeClass('hide-spin');
			window.axios.get('/profile/pic').then(function (response) {
				$('#pictext').val(response.data);
				$('#picimg').attr('src', response.data);
			}).catch(function (error) {
				site.handleError('retrieve picture', '', error);
			});
		}).catch(function (error) {
			site.handleError('save profile', '#profile', error);
		});
	});

	//http://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3/
	$(document).on('change', '.btn-file :file', function () {
		var input = $(this),
		    numFiles = input.get(0).files ? input.get(0).files.length : 1,
		    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});

	//bind to fileselect button
	$('.btn-file :file').on('fileselect', function (event, numFiles, label) {

		var input = $(this).parents('.input-group').find(':text');
		var log = numFiles > 1 ? numFiles + ' files selected' : label;

		if (input.length) {
			input.val(log);
		} else {
			if (log) {
				alert(log);
			}
		}
	});
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 229:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $('#delete').on('click', function () {
    var url = "/admin/deletemeeting";
    var retUrl = "/admin/meetings";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl, true);
  });

  $('#forcedelete').on('click', function () {
    var url = "/admin/forcedeletemeeting";
    var retUrl = "/admin/meetings";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $('#delete').on('click', function () {
    var url = "/admin/deleteblackout";
    var retUrl = "/admin/blackouts";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 231:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  //$("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newstudent">New Student</a>');

  $('#delete').on('click', function () {
    var url = "/admin/deletegroupsession";
    var retUrl = "/admin/groupsessions";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxdelete(data, url, retUrl);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 232:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);
var site = __webpack_require__(213);

exports.init = function () {
  //load custom button on the dom
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init();

  //bind settings buttons
  $('.settingsbutton').on('click', function () {
    var data = {
      key: $(this).attr('id')
    };
    var url = '/admin/savesetting';

    window.axios.post(url, data).then(function (message) {
      $(location).attr('href', '/admin/settings');
    }).catch(function (error) {
      site.handleError('save', '', error);
    });
  });

  //bind new setting button
  $('#newsetting').on('click', function () {
    var choice = prompt("Enter a name for the new setting:");
    var data = {
      key: choice
    };
    var url = "/admin/newsetting";

    window.axios.post(url, data).then(function (message) {
      $(location).attr('href', '/admin/settings');
    }).catch(function (error) {
      site.handleError('create', '', error);
    });
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 233:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);
var site = __webpack_require__(213);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#degreeprogram_id').val();
  options.ajax = {
    url: '/admin/degreeprogramrequirements/' + id,
    dataSrc: ''
  };
  options.columns = [{ 'data': 'id' }, { 'data': 'name' }, { 'data': 'credits' }, { 'data': 'semester' }, { 'data': 'ordering' }, { 'data': 'notes' }, { 'data': 'id' }];
  options.columnDefs = [{
    "targets": -1,
    "data": 'id',
    "render": function render(data, type, row, meta) {
      return "<a class=\"btn btn-primary btn-sm edit\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Edit</a>";
    }
  }];
  options.order = [[3, "asc"], [4, "asc"]];
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">New Degree Requirement</a>');

  $('#save').on('click', function () {
    var data = {
      notes: $('#notes').val(),
      degreeprogram_id: $('#degreeprogram_id').val(),
      semester: $('#semester').val(),
      ordering: $('#ordering').val(),
      credits: $('#credits').val()
    };
    var selected = $("input[name='requireable']:checked");
    if (selected.length > 0) {
      var selectedVal = selected.val();
      if (selectedVal == 1) {
        data.course_name = $('#course_name').val();
      } else if (selectedVal == 2) {
        if ($('#electivelist_id').val() > 0) {
          data.electivelist_id = $('#electivelist_id').val();
        }
      }
    }
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newdegreerequirement';
    } else {
      var url = '/admin/degreerequirement/' + id;
    }
    dashboard.ajaxmodalsave(data, url, '#degreerequirementform');
  });

  $('#delete').on('click', function () {
    var url = "/admin/deletedegreerequirement";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxmodaldelete(data, url, '#degreerequirementform');
  });

  $('#degreerequirementform').on('shown.bs.modal', showselected);

  $('#degreerequirementform').on('hidden.bs.modal', resetForm);

  resetForm();

  $('#new').on('click', function () {
    $('#id').val("");
    $('#degreeprogram_idview').val($('#degreeprogram_idview').attr('value'));
    $('#delete').hide();
    $('#degreerequirementform').modal('show');
  });

  $('#table').on('click', '.edit', function () {
    var id = $(this).data('id');
    var url = '/admin/degreerequirement/' + id;
    window.axios.get(url).then(function (message) {
      $('#id').val(message.data.id);
      $('#semester').val(message.data.semester);
      $('#ordering').val(message.data.ordering);
      $('#credits').val(message.data.credits);
      $('#notes').val(message.data.notes);
      $('#degreeprogram_idview').val($('#degreeprogram_idview').attr('value'));
      if (message.data.type == "course") {
        $('#course_name').val(message.data.course_name);
        $('#requireable1').prop('checked', true);
        $('#requiredcourse').show();
        $('#electivecourse').hide();
      } else if (message.data.type == "electivelist") {
        $('#electivelist_id').val(message.data.electivelist_id);
        $('#electivelist_idtext').html("Selected: (" + message.data.electivelist_id + ") " + message.data.electivelist_name);
        $('#requireable2').prop('checked', true);
        $('#requiredcourse').hide();
        $('#electivecourse').show();
      }
      $('#delete').show();
      $('#degreerequirementform').modal('show');
    }).catch(function (error) {
      site.handleError('retrieve requirement', '', error);
    });
  });

  $('input[name=requireable]').on('change', showselected);

  dashboard.ajaxautocomplete('electivelist_id', '/electivelists/electivelistfeed');
};

/**
 * Determine which div to show in the form
 */
var showselected = function showselected() {
  //https://stackoverflow.com/questions/8622336/jquery-get-value-of-selected-radio-button
  var selected = $("input[name='requireable']:checked");
  if (selected.length > 0) {
    var selectedVal = selected.val();
    if (selectedVal == 1) {
      $('#requiredcourse').show();
      $('#electivecourse').hide();
    } else if (selectedVal == 2) {
      $('#requiredcourse').hide();
      $('#electivecourse').show();
    }
  }
};

var resetForm = function resetForm() {
  site.clearFormErrors();
  $('#id').val("");
  $('#semester').val("");
  $('#ordering').val("");
  $('#credits').val("");
  $('#notes').val("");
  $('#degreeprogram_idview').val($('#degreeprogram_idview').attr('value'));
  $('#course_name').val("");
  $('#electivelist_id').val("-1");
  $('#electivelist_idauto').val("");
  $('#electivelist_idtext').html("Selected (0) ");
  $('#requireable1').prop('checked', true);
  $('#requireable2').prop('checked', false);
  $('#requiredcourse').show();
  $('#electivecourse').hide();
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 234:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);
var site = __webpack_require__(213);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#electivelist_id').val();
  options.ajax = {
    url: '/admin/electivelistcourses/' + id,
    dataSrc: ''
  };
  options.columns = [{ 'data': 'id' }, { 'data': 'name' }, { 'data': 'id' }];
  options.columnDefs = [{
    "targets": -1,
    "data": 'id',
    "render": function render(data, type, row, meta) {
      return "<a class=\"btn btn-primary btn-sm edit\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Edit</a>";
    }
  }];
  options.order = [[1, "asc"]];
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">Add Course</a>');

  $('#save').on('click', function () {
    var data = {
      electivelist_id: $('#electivelist_id').val(),
      course_prefix: $('#course_prefix').val()
    };
    var selected = $("input[name='range']:checked");
    if (selected.length > 0) {
      var selectedVal = selected.val();
      if (selectedVal == 1) {
        data.course_min_number = $('#course_min_number').val();
      } else if (selectedVal == 2) {
        data.course_min_number = $('#course_min_number').val();
        data.course_max_number = $('#course_max_number').val();
      }
    }
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newelectivelistcourse';
    } else {
      var url = '/admin/electivecourse/' + id;
    }
    dashboard.ajaxmodalsave(data, url, '#electivelistcourseform');
  });

  $('#delete').on('click', function () {
    var url = "/admin/deleteelectivecourse";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxmodaldelete(data, url, '#electivelistcourseform');
  });

  $('#electivelistcourseform').on('shown.bs.modal', showselected);

  $('#electivelistcourseform').on('hidden.bs.modal', resetForm);

  resetForm();

  $('#new').on('click', function () {
    $('#id').val("");
    $('#electivelist_idview').val($('#electivelist_idview').attr('value'));
    $('#delete').hide();
    $('#electivelistcourseform').modal('show');
  });

  $('#table').on('click', '.edit', function () {
    var id = $(this).data('id');
    var url = '/admin/electivecourse/' + id;
    window.axios.get(url).then(function (message) {
      $('#id').val(message.data.id);
      $('#course_prefix').val(message.data.course_prefix);
      $('#course_min_number').val(message.data.course_min_number);
      if (message.data.course_max_number) {
        $('#course_max_number').val(message.data.course_max_number);
        $('#range2').prop('checked', true);
        $('#courserange').show();
        $('#singlecourse').hide();
      } else {
        $('#course_max_number').val("");
        $('#range1').prop('checked', true);
        $('#singlecourse').show();
        $('#courserange').hide();
      }
      $('#delete').show();
      $('#electivelistcourseform').modal('show');
    }).catch(function (error) {
      site.handleError('retrieve elective list course', '', error);
    });
  });

  $('input[name=range]').on('change', showselected);
};

/**
 * Determine which div to show in the form
 */
var showselected = function showselected() {
  //https://stackoverflow.com/questions/8622336/jquery-get-value-of-selected-radio-button
  var selected = $("input[name='range']:checked");
  if (selected.length > 0) {
    var selectedVal = selected.val();
    if (selectedVal == 1) {
      $('#singlecourse').show();
      $('#courserange').hide();
    } else if (selectedVal == 2) {
      $('#singlecourse').hide();
      $('#courserange').show();
    }
  }
};

var resetForm = function resetForm() {
  site.clearFormErrors();
  $('#id').val("");
  $('#course_prefix').val("");
  $('#course_min_number').val("");
  $('#course_max_number').val("");
  $('#range1').prop('checked', true);
  $('#range2').prop('checked', false);
  $('#singlecourse').show();
  $('#courserange').hide();
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 235:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(212);
var site = __webpack_require__(213);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#plan_id').val();
  options.ajax = {
    url: '/admin/planrequirements/' + id,
    dataSrc: ''
  };
  options.columns = [{ 'data': 'id' }, { 'data': 'name' }, { 'data': 'electivelist_abbr' }, { 'data': 'credits' }, { 'data': 'semester' }, { 'data': 'ordering' }, { 'data': 'notes' }, { 'data': 'catalog_course' }, { 'data': 'completed_course' }, { 'data': 'id' }];
  options.columnDefs = [{
    "targets": -1,
    "data": 'id',
    "render": function render(data, type, row, meta) {
      return "<a class=\"btn btn-primary btn-sm edit\" href=\"#\" data-id=\"" + data + "\" role=\"button\">Edit</a>";
    }
  }];
  options.order = [[4, "asc"], [5, "asc"]];
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">New Plan Requirement</a>');

  //added for new semesters table
  var options2 = {
    "pageLength": 50,
    "lengthChange": false
  };
  options2.dom = '<"newbutton2">frtip';
  options2.ajax = {
    url: '/admin/plans/plansemesters/' + id,
    dataSrc: ''
  };
  options2.columns = [{ 'data': 'id' }, { 'data': 'name' }, { 'data': 'ordering' }, { 'data': 'id' }];
  options2.columnDefs = [{
    "targets": -1,
    "data": 'id',
    "render": function render(data, type, row, meta) {
      return "<a class=\"btn btn-primary btn-sm editsem\" href=\"/admin/plans/plansemester/" + data + "\" role=\"button\">Edit</a>";
    }
  }];
  options2.order = [[2, "asc"]];
  $('#tablesem').DataTable(options2);

  $("div.newbutton2").html('<a type="button" class="btn btn-success" href="/admin/plans/newplansemester/' + id + '" id="new2">New Semester</a>');

  $('#save').on('click', function () {
    var data = {
      notes: $('#notes').val(),
      plan_id: $('#plan_id').val(),
      ordering: $('#ordering').val(),
      credits: $('#credits').val(),
      student_id: $('#student_id').val(),
      course_id_lock: $('#course_idlock').val(),
      completedcourse_id_lock: $('#completedcourse_idlock').val()
    };
    if ($('#semester_id').val() > 0) {
      data.semester_id = $('#semester_id').val();
    }
    data.course_name = $('#course_name').val();
    if ($('#electivelist_id').val() > 0) {
      data.electivelist_id = $('#electivelist_id').val();
    } else {
      data.electivelist_id = '';
    }
    if ($('#course_id').val() > 0) {
      data.course_id = $('#course_id').val();
    } else {
      data.course_id = '';
    }
    if ($('#completedcourse_id').val() > 0) {
      data.completedcourse_id = $('#completedcourse_id').val();
    } else {
      data.completedcourse_id = '';
    }
    var id = $('#id').val();
    if (id.length == 0) {
      var url = '/admin/newplanrequirement';
    } else {
      var url = '/admin/planrequirement/' + id;
    }
    dashboard.ajaxmodalsave(data, url, '#planrequirementform');
  });

  $('#delete').on('click', function () {
    var url = "/admin/deleteplanrequirement";
    var data = {
      id: $('#id').val()
    };
    dashboard.ajaxmodaldelete(data, url, '#planrequirementform');
  });

  $('#planrequirementform').on('hidden.bs.modal', resetForm);

  resetForm();

  $('#new').on('click', function () {
    $('#id').val("");
    $('#plan_idview').val($('#plan_idview').attr('value'));
    $('#delete').hide();
    var planid = $('#plan_id').val();
    window.axios.get('/admin/plans/plansemesters/' + planid).then(function (message) {
      var listitems = '';
      $.each(message.data, function (key, value) {
        listitems += '<option value=' + value.id + '>' + value.name + '</option>';
      });
      $('#semester_id').find('option').remove().end().append(listitems);
      $('#semester_id').val(semester_id);
      $('#planrequirementform').modal('show');
    });
  });

  $('#table').on('click', '.edit', function () {
    var id = $(this).data('id');
    var url = '/admin/planrequirement/' + id;
    window.axios.get(url).then(function (message) {
      $('#id').val(message.data.id);
      $('#ordering').val(message.data.ordering);
      $('#credits').val(message.data.credits);
      $('#notes').val(message.data.notes);
      $('#degreerequirement_id').val(message.data.degreerequirement_id);
      $('#plan_idview').val($('#plan_idview').attr('value'));
      $('#course_name').val(message.data.course_name);
      $('#electivelist_id').val(message.data.electivelist_id);
      $('#electivelist_idtext').html("Selected: (" + message.data.electivelist_id + ") " + site.truncateText(message.data.electivelist_name, 30));
      $('#course_id').val(message.data.course_id);
      $('#course_idtext').html("Selected: (" + message.data.course_id + ") " + site.truncateText(message.data.catalog_course, 30));
      dashboard.ajaxautocompleteset('course_id', message.data.course_id_lock);
      $('#completedcourse_id').val(message.data.completedcourse_id);
      $('#completedcourse_idtext').html("Selected: (" + message.data.completedcourse_id + ") " + site.truncateText(message.data.completed_course, 30));
      dashboard.ajaxautocompleteset('completedcourse_id', message.data.completedcourse_id_lock);
      $('#delete').show();

      var semester_id = message.data.semester_id;

      //load semesters
      var planid = $('#plan_id').val();
      window.axios.get('/admin/plans/plansemesters/' + planid).then(function (message) {
        var listitems = '';
        $.each(message.data, function (key, value) {
          listitems += '<option value=' + value.id + '>' + value.name + '</option>';
        });
        $('#semester_id').find('option').remove().end().append(listitems);
        $('#semester_id').val(semester_id);
        $('#planrequirementform').modal('show');
      }).catch(function (error) {
        site.handleError('retrieve semesters', '', error);
      });
    }).catch(function (error) {
      site.handleError('retrieve requirement', '', error);
    });
  });

  dashboard.ajaxautocomplete('electivelist_id', '/electivelists/electivelistfeed');

  dashboard.ajaxautocompletelock('course_id', '/courses/coursefeed');

  var student_id = $('#student_id').val();
  dashboard.ajaxautocompletelock('completedcourse_id', '/completedcourses/completedcoursefeed/' + student_id);
};

var resetForm = function resetForm() {
  site.clearFormErrors();
  $('#id').val("");
  $('#semester').val("");
  $('#ordering').val("");
  $('#credits').val("");
  $('#notes').val("");
  $('#degreerequirement_id').val("");
  $('#plan_idview').val($('#plan_idview').attr('value'));
  $('#course_name').val("");
  $('#electivelist_id').val("-1");
  $('#electivelist_idauto').val("");
  $('#electivelist_idtext').html("Selected (0) ");
  $('#course_id').val("-1");
  $('#course_idauto').val("");
  $('#course_idtext').html("Selected (0) ");
  $('#completedcourse_id').val("-1");
  $('#completedcourse_idauto').val("");
  $('#completedcourse_idtext').html("Selected (0) ");
  dashboard.ajaxautocompleteset('course_id', 0);
  dashboard.ajaxautocompleteset('completedcourse_id', 0);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 236:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(213);
window.Vue = __webpack_require__(177);
var draggable = __webpack_require__(185);

exports.init = function () {

  window.vm = new Vue({
    el: '#flowchart',
    data: {
      semesters: []
    },
    methods: {
      editSemester: editSemester,
      saveSemester: saveSemester,
      deleteSemester: deleteSemester,
      dropSemester: dropSemester,
      dropCourse: dropCourse,
      editCourse: editCourse
    },
    components: {
      draggable: draggable
    }
  });

  loadData();

  $('#reset').on('click', loadData);
  $('#add-sem').on('click', addSemester);
  $('#add-course').on('click', addCourse);

  $('#saveCourse').on('click', saveCourse);
  $('#deleteCourse').on('click', deleteCourse);

  site.ajaxautocomplete('electivelist_id', '/electivelists/electivelistfeed');

  site.ajaxautocompletelock('course_id', '/courses/coursefeed');

  var student_id = $('#student_id').val();
  site.ajaxautocompletelock('completedcourse_id', '/completedcourses/completedcoursefeed/' + student_id);
};

/**
 * Helper function to sort elements based on their ordering
 *
 * @param a - first item
 * @param b - second item
 * @return - sorting value indicating who should go first
 */
var sortFunction = function sortFunction(a, b) {
  if (a.ordering == b.ordering) {
    return a.id < b.id ? -1 : 1;
  }
  return a.ordering < b.ordering ? -1 : 1;
};

var loadData = function loadData() {
  var id = $('#id').val();
  window.axios.get('/flowcharts/semesters/' + id).then(function (response) {
    window.vm.semesters = response.data;
    window.vm.semesters.sort(sortFunction);
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
    window.axios.get('/flowcharts/data/' + id).then(function (response) {
      $.each(response.data, function (index, value) {
        var semester = window.vm.semesters.find(function (element) {
          return element.id == value.semester_id;
        });
        if (value.degreerequirement_id <= 0) {
          value.custom = true;
        } else {
          value.custom = false;
        }
        if (value.completedcourse_id <= 0) {
          value.complete = false;
        } else {
          value.complete = true;
        }
        semester.courses.push(value);
      });
      $.each(window.vm.semesters, function (index, value) {
        value.courses.sort(sortFunction);
      });
    }).catch(function (error) {
      site.handleError('get data', '', error);
    });
  }).catch(function (error) {
    site.handleError('get data', '', error);
  });
};

var editSemester = function editSemester(event) {
  var semid = $(event.currentTarget).data('id');
  $("#sem-paneledit-" + semid).show();
  $("#sem-panelhead-" + semid).hide();
};

var saveSemester = function saveSemester(event) {
  var id = $('#id').val();
  var semid = $(event.currentTarget).data('id');
  var data = {
    id: semid,
    name: $("#sem-text-" + semid).val()
  };
  window.axios.post('/flowcharts/semesters/' + id + '/save', data).then(function (response) {
    $("#sem-paneledit-" + semid).hide();
    $("#sem-panelhead-" + semid).show();
    //site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};

var deleteSemester = function deleteSemester(event) {
  var choice = confirm("Are you sure?");
  if (choice === true) {
    var id = $('#id').val();
    var semid = $(event.currentTarget).data('id');
    var data = {
      id: semid
    };
    window.axios.post('/flowcharts/semesters/' + id + '/delete', data).then(function (response) {
      for (var i = 0; i < window.vm.semesters.length; i++) {
        if (window.vm.semesters[i].id == semid) {
          window.vm.semesters.splice(i, 1);
          break;
        }
      }
      //site.displayMessage(response.data, "success");
    }).catch(function (error) {
      site.displayMessage("AJAX Error", "danger");
    });
  }
};

var addSemester = function addSemester() {
  var id = $('#id').val();
  var data = {};
  window.axios.post('/flowcharts/semesters/' + id + '/add', data).then(function (response) {
    window.vm.semesters.push(response.data);
    //Vue.set(window.vm.semesters[window.vm.semester.length - 1], 'courses', new Array());
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
    //site.displayMessage("Item Saved", "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};

var dropSemester = function dropSemester(event) {
  var ordering = [];
  $.each(window.vm.semesters, function (index, value) {
    ordering.push({
      id: value.id
    });
  });
  var data = {
    ordering: ordering
  };
  var id = $('#id').val();
  window.axios.post('/flowcharts/semesters/' + id + '/move', data).then(function (response) {
    //site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};

var dropCourse = function dropCourse(event) {
  var ordering = [];
  var toSemIndex = $(event.to).data('id');
  $.each(window.vm.semesters[toSemIndex].courses, function (index, value) {
    ordering.push({
      id: value.id
    });
  });
  var data = {
    semester_id: window.vm.semesters[toSemIndex].id,
    course_id: $(event.item).data('id'),
    ordering: ordering
  };
  var id = $('#id').val();
  window.axios.post('/flowcharts/data/' + id + '/move', data).then(function (response) {
    //site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};

var editCourse = function editCourse(event) {
  var courseIndex = $(event.currentTarget).data('id');
  var semIndex = $(event.currentTarget).data('sem');
  var course = window.vm.semesters[semIndex].courses[courseIndex];
  $('#course_name').val(course.name);
  $('#credits').val(course.credits);
  $('#notes').val(course.notes);
  $('#planrequirement_id').val(course.id);
  $('#electlivelist_id').val(course.electivelist_id);
  $('#electivelist_idauto').val('');
  $('#electivelist_idtext').html("Selected: (" + course.electivelist_id + ") " + site.truncateText(course.electivelist_name, 30));
  $('#course_id').val(course.course_id);
  $('#course_idauto').val('');
  $('#course_idtext').html("Selected: (" + course.course_id + ") " + site.truncateText(course.course_name, 30));
  site.ajaxautocompleteset('course_id', course.course_id_lock);
  $('#completedcourse_id').val(course.completedcourse_id);
  $('#completedcourse_idauto').val('');
  $('#completedcourse_idtext').html("Selected: (" + course.completedcourse_id + ") " + site.truncateText(course.completedcourse_name, 30));
  site.ajaxautocompleteset('completedcourse_id', course.completedcourse_id_lock);
  if (course.degreerequirement_id <= 0) {
    $('#course_name').prop('disabled', false);
    $('#credits').prop('disabled', false);
    $('#electivelist_idauto').prop('disabled', false);
    $('#deleteCourse').show();
  } else {
    if (course.electivelist_id <= 0) {
      $('#course_name').prop('disabled', true);
    } else {
      $('#course_name').prop('disabled', false);
    }
    $('#credits').prop('disabled', true);
    $('#electivelist_idauto').prop('disabled', true);
    $('#deleteCourse').hide();
  }

  $('#editCourse').modal('show');
};

var saveCourse = function saveCourse() {
  $('#spin').removeClass('hide-spin');
  var id = $('#id').val();
  var planrequirement_id = $('#planrequirement_id').val();
  var data = {
    notes: $('#notes').val(),
    course_id_lock: $('#course_idlock').val(),
    completedcourse_id_lock: $('#completedcourse_idlock').val()
  };
  if ($('#course_id').val() > 0) {
    data.course_id = $('#course_id').val();
  } else {
    data.course_id = '';
  }
  if ($('#completedcourse_id').val() > 0) {
    data.completedcourse_id = $('#completedcourse_id').val();
  } else {
    data.completedcourse_id = '';
  }
  if ($('#planrequirement_id').val().length > 0) {
    data.planrequirement_id = $('#planrequirement_id').val();
  }
  if (!$('#course_name').is(':disabled')) {
    data.course_name = $('#course_name').val();
  }
  if (!$('#credits').is(':disabled')) {
    data.credits = $('#credits').val();
  }
  if (!$('#electivelist_idauto').is(':disabled')) {
    if ($('#electivelist_id').val() > 0) {
      data.electivelist_id = $('#electivelist_id').val();
    } else {
      data.electivelist_id = '';
    }
  }
  window.axios.post('/flowcharts/data/' + id + '/save', data).then(function (response) {
    $('#editCourse').modal('hide');
    $('#spin').addClass('hide-spin');
    site.displayMessage(response.data, "success");
    site.clearFormErrors();
    loadData();
  }).catch(function (error) {
    $('#spin').addClass('hide-spin');
    site.handleError("save course", "#editCourse", error);
  });
};

var deleteCourse = function deleteCourse(event) {
  $('#spin').removeClass('hide-spin');
  var id = $('#id').val();
  var planrequirement_id = $('#planrequirement_id').val();
  var data = {
    planrequirement_id: planrequirement_id
  };
  window.axios.post('/flowcharts/data/' + id + '/delete', data).then(function (response) {
    $('#editCourse').modal('hide');
    $('#spin').addClass('hide-spin');
    site.displayMessage(response.data, "success");
    site.clearFormErrors();
    loadData();
  }).catch(function (error) {
    $('#spin').addClass('hide-spin');
    site.handleError("delete course", "#editCourse", error);
  });
};

var addCourse = function addCourse() {
  $('#course_name').val('');
  $('#credits').val('');
  $('#notes').val('');
  $('#planrequirement_id').val('');
  $('#electlivelist_id').val(0);
  $('#electivelist_idauto').val('');
  $('#electivelist_idtext').html("Selected: (" + 0 + ") ");
  $('#course_id').val(0);
  $('#course_idauto').val('');
  $('#course_idtext').html("Selected: (" + 0 + ") ");
  $('#completedcourse_id').val(0);
  $('#completedcourse_idauto').val('');
  $('#completedcourse_idtext').html("Selected: (" + 0 + ") ");
  $('#course_name').prop('disabled', false);
  $('#credits').prop('disabled', false);
  $('#electivelist_idauto').prop('disabled', false);
  $('#deleteCourse').hide();
  $('#editCourse').modal('show');
  site.ajaxautocompleteset('course_id', 0);
  site.ajaxautocompleteset('completedcourse_id', 0);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 237:
/***/ (function(module, exports, __webpack_require__) {

var dashboard = __webpack_require__(212);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  dashboard.init(options);
};

/***/ })

},[134]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3M/NmQxMCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvZmxvd2NoYXJ0LnNjc3MiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZ3JvdXBzZXNzaW9uLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9tZWV0aW5nZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0bGlzdC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQXBwIiwiYWN0aW9ucyIsIlJvb3RSb3V0ZUNvbnRyb2xsZXIiLCJnZXRJbmRleCIsImVkaXRhYmxlIiwiaW5pdCIsInNpdGUiLCJjaGVja01lc3NhZ2UiLCJnZXRBYm91dCIsIkFkdmlzaW5nQ29udHJvbGxlciIsImNhbGVuZGFyIiwiR3JvdXBzZXNzaW9uQ29udHJvbGxlciIsImdldExpc3QiLCJncm91cHNlc3Npb24iLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiRGFzaGJvYXJkQ29udHJvbGxlciIsImRhc2hib2FyZCIsIlN0dWRlbnRzQ29udHJvbGxlciIsImdldFN0dWRlbnRzIiwic3R1ZGVudGVkaXQiLCJnZXROZXdzdHVkZW50IiwiQWR2aXNvcnNDb250cm9sbGVyIiwiZ2V0QWR2aXNvcnMiLCJhZHZpc29yZWRpdCIsImdldE5ld2Fkdmlzb3IiLCJEZXBhcnRtZW50c0NvbnRyb2xsZXIiLCJnZXREZXBhcnRtZW50cyIsImRlcGFydG1lbnRlZGl0IiwiZ2V0TmV3ZGVwYXJ0bWVudCIsIk1lZXRpbmdzQ29udHJvbGxlciIsImdldE1lZXRpbmdzIiwibWVldGluZ2VkaXQiLCJCbGFja291dHNDb250cm9sbGVyIiwiZ2V0QmxhY2tvdXRzIiwiYmxhY2tvdXRlZGl0IiwiR3JvdXBzZXNzaW9uc0NvbnRyb2xsZXIiLCJnZXRHcm91cHNlc3Npb25zIiwiZ3JvdXBzZXNzaW9uZWRpdCIsIlNldHRpbmdzQ29udHJvbGxlciIsImdldFNldHRpbmdzIiwic2V0dGluZ3MiLCJEZWdyZWVwcm9ncmFtc0NvbnRyb2xsZXIiLCJnZXREZWdyZWVwcm9ncmFtcyIsImRlZ3JlZXByb2dyYW1lZGl0IiwiZ2V0RGVncmVlcHJvZ3JhbURldGFpbCIsImdldE5ld2RlZ3JlZXByb2dyYW0iLCJFbGVjdGl2ZWxpc3RzQ29udHJvbGxlciIsImdldEVsZWN0aXZlbGlzdHMiLCJlbGVjdGl2ZWxpc3RlZGl0IiwiZ2V0RWxlY3RpdmVsaXN0RGV0YWlsIiwiZ2V0TmV3ZWxlY3RpdmVsaXN0IiwiUGxhbnNDb250cm9sbGVyIiwiZ2V0UGxhbnMiLCJwbGFuZWRpdCIsImdldFBsYW5EZXRhaWwiLCJwbGFuZGV0YWlsIiwiZ2V0TmV3cGxhbiIsIlBsYW5zZW1lc3RlcnNDb250cm9sbGVyIiwiZ2V0UGxhblNlbWVzdGVyIiwicGxhbnNlbWVzdGVyZWRpdCIsImdldE5ld1BsYW5TZW1lc3RlciIsIkNvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyIiwiZ2V0Q29tcGxldGVkY291cnNlcyIsImNvbXBsZXRlZGNvdXJzZWVkaXQiLCJnZXROZXdjb21wbGV0ZWRjb3Vyc2UiLCJGbG93Y2hhcnRzQ29udHJvbGxlciIsImdldEZsb3djaGFydCIsImZsb3djaGFydCIsIm5ld0Zsb3djaGFydCIsImVkaXRGbG93Y2hhcnQiLCJjb250cm9sbGVyIiwiYWN0aW9uIiwid2luZG93IiwiZXhwb3J0cyIsImRhdGFUYWJsZU9wdGlvbnMiLCJvcHRpb25zIiwiJCIsIkRhdGFUYWJsZSIsIm9uIiwidG9nZ2xlQ2xhc3MiLCJhamF4c2F2ZSIsImRhdGEiLCJ1cmwiLCJpZCIsImxvYWRwaWN0dXJlIiwicmVtb3ZlQ2xhc3MiLCJheGlvcyIsInBvc3QiLCJ0aGVuIiwicmVzcG9uc2UiLCJjbGVhckZvcm1FcnJvcnMiLCJhZGRDbGFzcyIsImxlbmd0aCIsImxvY2F0aW9uIiwiYXR0ciIsImRpc3BsYXlNZXNzYWdlIiwiY2F0Y2giLCJlcnJvciIsImhhbmRsZUVycm9yIiwiYWpheG1vZGFsc2F2ZSIsImVsZW1lbnQiLCJtb2RhbCIsImFqYXgiLCJyZWxvYWQiLCJnZXQiLCJ2YWwiLCJhamF4ZGVsZXRlIiwicmV0VXJsIiwic29mdCIsImNob2ljZSIsImNvbmZpcm0iLCJhamF4bW9kYWxkZWxldGUiLCJhamF4cmVzdG9yZSIsImFqYXhhdXRvY29tcGxldGUiLCJhamF4YXV0b2NvbXBsZXRlbG9jayIsImFqYXhhdXRvY29tcGxldGVzZXQiLCJ2YWx1ZSIsIm1lc3NhZ2UiLCJ0eXBlIiwiaHRtbCIsImFwcGVuZCIsInNldFRpbWVvdXQiLCJhbGVydCIsImVhY2giLCJmaW5kIiwidGV4dCIsInNldEZvcm1FcnJvcnMiLCJqc29uIiwia2V5IiwicGFyZW50cyIsImpvaW4iLCJzdGF0dXMiLCJ0cnVuY2F0ZVRleHQiLCJ0cmltIiwic3Vic3RyaW5nIiwic3BsaXQiLCJzbGljZSIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm1pbkNoYXJzIiwiYXV0b1NlbGVjdEZpcnN0Iiwib25TZWxlY3QiLCJzdWdnZXN0aW9uIiwidHJhbnNmb3JtUmVzdWx0Iiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInBhcnNlSW50IiwiY2xpY2siLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJzdW1tZXJub3RlIiwiZm9jdXMiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIiwiZG9tIiwiZmlyc3RfbmFtZSIsImxhc3RfbmFtZSIsImVtYWlsIiwiYWR2aXNvcl9pZCIsImRlcGFydG1lbnRfaWQiLCJlaWQiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwiaXMiLCJmaWxlcyIsImRvY3VtZW50IiwiaW5wdXQiLCJudW1GaWxlcyIsImxhYmVsIiwicmVwbGFjZSIsInRyaWdnZXIiLCJldmVudCIsImxvZyIsIm5hbWUiLCJvZmZpY2UiLCJwaG9uZSIsImFiYnJldmlhdGlvbiIsImRlc2NyaXB0aW9uIiwiZWZmZWN0aXZlX3llYXIiLCJlZmZlY3RpdmVfc2VtZXN0ZXIiLCJzdGFydF95ZWFyIiwic3RhcnRfc2VtZXN0ZXIiLCJkZWdyZWVwcm9ncmFtX2lkIiwic3R1ZGVudF9pZCIsIm9yZGVyaW5nIiwicGxhbl9pZCIsImNvdXJzZW51bWJlciIsInllYXIiLCJzZW1lc3RlciIsImJhc2lzIiwiZ3JhZGUiLCJjcmVkaXRzIiwic2VsZWN0ZWQiLCJzZWxlY3RlZFZhbCIsInRyYW5zZmVyIiwiaW5jb21pbmdfaW5zdGl0dXRpb24iLCJpbmNvbWluZ19uYW1lIiwiaW5jb21pbmdfZGVzY3JpcHRpb24iLCJpbmNvbWluZ19zZW1lc3RlciIsImluY29taW5nX2NyZWRpdHMiLCJpbmNvbWluZ19ncmFkZSIsInNob3dzZWxlY3RlZCIsInByb3AiLCJzaG93IiwiaGlkZSIsIl8iLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImhlYWQiLCJxdWVyeVNlbGVjdG9yIiwiY29udGVudCIsImNvbnNvbGUiLCJtb21lbnQiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsInJlbmRlcmluZyIsInRpbWVGb3JtYXQiLCJkYXRlUGlja2VyRGF0YSIsImRheXNPZldlZWtEaXNhYmxlZCIsImZvcm1hdCIsInN0ZXBwaW5nIiwiZW5hYmxlZEhvdXJzIiwibWF4SG91ciIsInNpZGVCeVNpZGUiLCJpZ25vcmVSZWFkb25seSIsImFsbG93SW5wdXRUb2dnbGUiLCJkYXRlUGlja2VyRGF0ZU9ubHkiLCJhZHZpc29yIiwibm9iaW5kIiwid2lkdGgiLCJyZXNldEZvcm0iLCJiaW5kIiwibmV3U3R1ZGVudCIsInJlc2V0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImRhdGV0aW1lcGlja2VyIiwibGlua0RhdGVQaWNrZXJzIiwiZXZlbnRSZW5kZXIiLCJldmVudENsaWNrIiwidmlldyIsInN0dWRlbnRuYW1lIiwic2hvd01lZXRpbmdGb3JtIiwicmVwZWF0IiwiYmxhY2tvdXRTZXJpZXMiLCJzZWxlY3QiLCJjaGFuZ2UiLCJyZXBlYXRDaGFuZ2UiLCJzYXZlQmxhY2tvdXQiLCJkZWxldGVCbGFja291dCIsImJsYWNrb3V0T2NjdXJyZW5jZSIsIm9mZiIsImNyZWF0ZU1lZXRpbmdGb3JtIiwiY3JlYXRlQmxhY2tvdXRGb3JtIiwicmVzb2x2ZUNvbmZsaWN0cyIsInRpdGxlIiwiaXNBZnRlciIsInN0dWRlbnRTZWxlY3QiLCJzYXZlTWVldGluZyIsImRlbGV0ZU1lZXRpbmciLCJjaGFuZ2VEdXJhdGlvbiIsInJlc2V0Q2FsZW5kYXIiLCJhamF4U2F2ZSIsImFqYXhEZWxldGUiLCJub1Jlc2V0Iiwibm9DaG9pY2UiLCJkZXNjIiwibWVldGluZ2lkIiwic3R1ZGVudGlkIiwiZHVyYXRpb25PcHRpb25zIiwidW5kZWZpbmVkIiwiaG91ciIsIm1pbnV0ZSIsImVtcHR5IiwibWludXRlcyIsImRpZmYiLCJlbGVtMSIsImVsZW0yIiwiZHVyYXRpb24iLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJpbmRleCIsImFwcGVuZFRvIiwiYnN0YXJ0IiwiYmVuZCIsImJ0aXRsZSIsImJibGFja291dGV2ZW50aWQiLCJiYmxhY2tvdXRpZCIsImJyZXBlYXQiLCJicmVwZWF0ZXZlcnkiLCJicmVwZWF0dW50aWwiLCJicmVwZWF0d2Vla2RheXNtIiwiYnJlcGVhdHdlZWtkYXlzdCIsImJyZXBlYXR3ZWVrZGF5c3ciLCJicmVwZWF0d2Vla2RheXN1IiwiYnJlcGVhdHdlZWtkYXlzZiIsInBhcmFtcyIsImJsYWNrb3V0X2lkIiwicmVwZWF0X3R5cGUiLCJyZXBlYXRfZXZlcnkiLCJyZXBlYXRfdW50aWwiLCJyZXBlYXRfZGV0YWlsIiwiU3RyaW5nIiwiaW5kZXhPZiIsInByb21wdCIsIlZ1ZSIsIkVjaG8iLCJQdXNoZXIiLCJpb24iLCJzb3VuZCIsInNvdW5kcyIsInZvbHVtZSIsInBhdGgiLCJwcmVsb2FkIiwidXNlcklEIiwiZ3JvdXBSZWdpc3RlckJ0biIsImdyb3VwRGlzYWJsZUJ0biIsInZtIiwiZWwiLCJxdWV1ZSIsIm9ubGluZSIsIm1ldGhvZHMiLCJnZXRDbGFzcyIsInMiLCJ1c2VyaWQiLCJpbkFycmF5IiwidGFrZVN0dWRlbnQiLCJnaWQiLCJjdXJyZW50VGFyZ2V0IiwiZGF0YXNldCIsImFqYXhQb3N0IiwicHV0U3R1ZGVudCIsImRvbmVTdHVkZW50IiwiZGVsU3R1ZGVudCIsImVudiIsImxvZ1RvQ29uc29sZSIsImJyb2FkY2FzdGVyIiwicHVzaGVyS2V5IiwiY2x1c3RlciIsInB1c2hlckNsdXN0ZXIiLCJjb25uZWN0b3IiLCJwdXNoZXIiLCJjb25uZWN0aW9uIiwiY29uY2F0IiwiY2hlY2tCdXR0b25zIiwiaW5pdGlhbENoZWNrRGluZyIsInNvcnQiLCJzb3J0RnVuY3Rpb24iLCJjaGFubmVsIiwibGlzdGVuIiwiaHJlZiIsImhlcmUiLCJ1c2VycyIsImxlbiIsImkiLCJwdXNoIiwiam9pbmluZyIsInVzZXIiLCJsZWF2aW5nIiwic3BsaWNlIiwiZm91bmQiLCJjaGVja0RpbmciLCJmaWx0ZXIiLCJkaXNhYmxlQnV0dG9uIiwicmVhbGx5IiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJmb3VuZE1lIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwiZGF0YVNyYyIsImNvbHVtbnMiLCJjb2x1bW5EZWZzIiwicm93IiwibWV0YSIsIm9yZGVyIiwibm90ZXMiLCJjb3Vyc2VfbmFtZSIsImVsZWN0aXZlbGlzdF9pZCIsImVsZWN0aXZlbGlzdF9uYW1lIiwiY291cnNlX3ByZWZpeCIsImNvdXJzZV9taW5fbnVtYmVyIiwiY291cnNlX21heF9udW1iZXIiLCJvcHRpb25zMiIsImNvdXJzZV9pZF9sb2NrIiwiY29tcGxldGVkY291cnNlX2lkX2xvY2siLCJzZW1lc3Rlcl9pZCIsImNvdXJzZV9pZCIsImNvbXBsZXRlZGNvdXJzZV9pZCIsInBsYW5pZCIsImxpc3RpdGVtcyIsInJlbW92ZSIsImRlZ3JlZXJlcXVpcmVtZW50X2lkIiwiY2F0YWxvZ19jb3Vyc2UiLCJjb21wbGV0ZWRfY291cnNlIiwiZHJhZ2dhYmxlIiwic2VtZXN0ZXJzIiwiZWRpdFNlbWVzdGVyIiwic2F2ZVNlbWVzdGVyIiwiZGVsZXRlU2VtZXN0ZXIiLCJkcm9wU2VtZXN0ZXIiLCJkcm9wQ291cnNlIiwiZWRpdENvdXJzZSIsImNvbXBvbmVudHMiLCJsb2FkRGF0YSIsImFkZFNlbWVzdGVyIiwiYWRkQ291cnNlIiwic2F2ZUNvdXJzZSIsImRlbGV0ZUNvdXJzZSIsImRvY3VtZW50RWxlbWVudCIsInN0eWxlIiwic2V0UHJvcGVydHkiLCJjdXN0b20iLCJjb21wbGV0ZSIsImNvdXJzZXMiLCJzZW1pZCIsInRvU2VtSW5kZXgiLCJ0byIsIml0ZW0iLCJjb3Vyc2VJbmRleCIsInNlbUluZGV4IiwiY291cnNlIiwiY29tcGxldGVkY291cnNlX25hbWUiLCJwbGFucmVxdWlyZW1lbnRfaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBQUEsQ0FBUSxHQUFSOztBQUVBLElBQUlDLE1BQU07O0FBRVQ7QUFDQUMsVUFBUztBQUNSO0FBQ0FDLHVCQUFxQjtBQUNwQkMsYUFBVSxvQkFBVztBQUNwQixRQUFJQyxXQUFXLG1CQUFBTCxDQUFRLEdBQVIsQ0FBZjtBQUNBSyxhQUFTQyxJQUFUO0FBQ0EsUUFBSUMsT0FBTyxtQkFBQVAsQ0FBUSxHQUFSLENBQVg7QUFDQU8sU0FBS0MsWUFBTDtBQUNBLElBTm1CO0FBT3BCQyxhQUFVLG9CQUFXO0FBQ3BCLFFBQUlKLFdBQVcsbUJBQUFMLENBQVEsR0FBUixDQUFmO0FBQ0FLLGFB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QUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0QsU0FBUztBQUNULHVEQUF1RDtBQUN2RDtBQUNBLE9BQU87QUFDUCwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtB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QUFBbEIsQ0FBUSxHQUFSLENBQWhCOztBQUVBMkUsUUFBUXJFLElBQVIsR0FBZSxZQUFVO0FBQ3ZCLE1BQUl1RSxVQUFVM0QsVUFBVTBELGdCQUF4QjtBQUNBMUQsWUFBVVosSUFBVixDQUFldUUsT0FBZjtBQUNELENBSEQsQyIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9odHRwczovL2xhcmF2ZWwuY29tL2RvY3MvNS40L21peCN3b3JraW5nLXdpdGgtc2NyaXB0c1xuLy9odHRwczovL2FuZHktY2FydGVyLmNvbS9ibG9nL3Njb3BpbmctamF2YXNjcmlwdC1mdW5jdGlvbmFsaXR5LXRvLXNwZWNpZmljLXBhZ2VzLXdpdGgtbGFyYXZlbC1hbmQtY2FrZXBocFxuXG4vL0xvYWQgc2l0ZS13aWRlIGxpYnJhcmllcyBpbiBib290c3RyYXAgZmlsZVxucmVxdWlyZSgnLi9ib290c3RyYXAnKTtcblxudmFyIEFwcCA9IHtcblxuXHQvLyBDb250cm9sbGVyLWFjdGlvbiBtZXRob2RzXG5cdGFjdGlvbnM6IHtcblx0XHQvL0luZGV4IGZvciBkaXJlY3RseSBjcmVhdGVkIHZpZXdzIHdpdGggbm8gZXhwbGljaXQgY29udHJvbGxlclxuXHRcdFJvb3RSb3V0ZUNvbnRyb2xsZXI6IHtcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEFib3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcbiAgICB9LFxuXG5cdFx0Ly9BZHZpc2luZyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkdmlzaW5nXG5cdFx0QWR2aXNpbmdDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkdmlzaW5nL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vcGFnZXMvY2FsZW5kYXInKTtcblx0XHRcdFx0Y2FsZW5kYXIuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0dyb3Vwc2Vzc2lvbiBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2dyb3Vwc2Vzc2lvblxuICAgIEdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXI6IHtcblx0XHRcdC8vZ3JvdXBzZXNzaW9uL2luZGV4XG4gICAgICBnZXRJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcbiAgICAgIH0sXG5cdFx0XHQvL2dyb3Vwc2VzaW9uL2xpc3Rcblx0XHRcdGdldExpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uID0gcmVxdWlyZSgnLi9wYWdlcy9ncm91cHNlc3Npb24nKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdC8vUHJvZmlsZXMgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9wcm9maWxlXG5cdFx0UHJvZmlsZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL3Byb2ZpbGUvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHByb2ZpbGUgPSByZXF1aXJlKCcuL3BhZ2VzL3Byb2ZpbGUnKTtcblx0XHRcdFx0cHJvZmlsZS5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vRGFzaGJvYXJkIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWRtaW4tbHRlXG5cdFx0RGFzaGJvYXJkQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi91dGlsL2Rhc2hib2FyZCcpO1xuXHRcdFx0XHRkYXNoYm9hcmQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0U3R1ZGVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3N0dWRlbnRzXG5cdFx0XHRnZXRTdHVkZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld3N0dWRlbnRcblx0XHRcdGdldE5ld3N0dWRlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3R1ZGVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdCcpO1xuXHRcdFx0XHRzdHVkZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRBZHZpc29yc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vYWR2aXNvcnNcblx0XHRcdGdldEFkdmlzb3JzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3YWR2aXNvclxuXHRcdFx0Z2V0TmV3YWR2aXNvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhZHZpc29yZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0Jyk7XG5cdFx0XHRcdGFkdmlzb3JlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdERlcGFydG1lbnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZXBhcnRtZW50c1xuXHRcdFx0Z2V0RGVwYXJ0bWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZXBhcnRtZW50XG5cdFx0XHRnZXROZXdkZXBhcnRtZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlcGFydG1lbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQnKTtcblx0XHRcdFx0ZGVwYXJ0bWVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0TWVldGluZ3NDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL21lZXRpbmdzXG5cdFx0XHRnZXRNZWV0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBtZWV0aW5nZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0Jyk7XG5cdFx0XHRcdG1lZXRpbmdlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEJsYWNrb3V0c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vYmxhY2tvdXRzXG5cdFx0XHRnZXRCbGFja291dHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYmxhY2tvdXRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0Jyk7XG5cdFx0XHRcdGJsYWNrb3V0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRHcm91cHNlc3Npb25zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ncm91cHNlc3Npb25zXG5cdFx0XHRnZXRHcm91cHNlc3Npb25zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0Jyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0U2V0dGluZ3NDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3NldHRpbmdzXG5cdFx0XHRnZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzJyk7XG5cdFx0XHRcdHNldHRpbmdzLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdERlZ3JlZXByb2dyYW1zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtc1xuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtL3tpZH1cblx0XHRcdGdldERlZ3JlZXByb2dyYW1EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsJyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2RlZ3JlZXByb2dyYW06IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRFbGVjdGl2ZWxpc3RzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtc1xuXHRcdFx0Z2V0RWxlY3RpdmVsaXN0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RWxlY3RpdmVsaXN0RGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXG5cdFx0XHRnZXROZXdlbGVjdGl2ZWxpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRQbGFuc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vcGxhbnNcblx0XHRcdGdldFBsYW5zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vcGxhbi97aWR9XG5cdFx0XHRnZXRQbGFuRGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5kZXRhaWwgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsJyk7XG5cdFx0XHRcdHBsYW5kZXRhaWwuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhblxuXHRcdFx0Z2V0TmV3cGxhbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0Jyk7XG5cdFx0XHRcdHBsYW5lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zZW1lc3RlcnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3BsYW5zZW1lc3RlclxuXHRcdFx0Z2V0UGxhblNlbWVzdGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5zZW1lc3RlcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0Jyk7XG5cdFx0XHRcdHBsYW5zZW1lc3RlcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhbnNlbWVzdGVyXG5cdFx0XHRnZXROZXdQbGFuU2VtZXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbnNlbWVzdGVyZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQnKTtcblx0XHRcdFx0cGxhbnNlbWVzdGVyZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXG5cdFx0XHRnZXRDb21wbGV0ZWRjb3Vyc2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNvbXBsZXRlZGNvdXJzZWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0Jyk7XG5cdFx0XHRcdGNvbXBsZXRlZGNvdXJzZWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXG5cdFx0XHRnZXROZXdjb21wbGV0ZWRjb3Vyc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRGbG93Y2hhcnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9mbG93Y2hhcnRzL3ZpZXcvXG5cdFx0XHRnZXRGbG93Y2hhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZmxvd2NoYXJ0ID0gcmVxdWlyZSgnLi9wYWdlcy9mbG93Y2hhcnQnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydGxpc3QnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHRuZXdGbG93Y2hhcnQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydGVkaXQnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHRlZGl0Rmxvd2NoYXJ0OiBmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgZmxvd2NoYXJ0ID0gcmVxdWlyZSgnLi9wYWdlcy9mbG93Y2hhcnRlZGl0Jyk7XG5cdFx0XHRcdGZsb3djaGFydC5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAxMzZcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9mbG93Y2hhcnQuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMTM3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8vbG9hZCByZXF1aXJlZCBsaWJyYXJpZXNcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdhZG1pbi1sdGUnKTtcbnJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0Jyk7XG5yZXF1aXJlKCdkYXRhdGFibGVzLm5ldC1icycpO1xucmVxdWlyZSgnZGV2YnJpZGdlLWF1dG9jb21wbGV0ZScpO1xuXG4vL29wdGlvbnMgZm9yIGRhdGF0YWJsZXNcbmV4cG9ydHMuZGF0YVRhYmxlT3B0aW9ucyA9IHtcbiAgXCJwYWdlTGVuZ3RoXCI6IDUwLFxuICBcImxlbmd0aENoYW5nZVwiOiBmYWxzZSxcbn1cblxuLyoqXG4gKiBJbml0aWFsaXphdGlvbiBmdW5jdGlvblxuICogbXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSBvbiBhbGwgZGF0YXRhYmxlcyBwYWdlc1xuICpcbiAqIEBwYXJhbSBvcHRpb25zIC0gY3VzdG9tIGRhdGF0YWJsZXMgb3B0aW9uc1xuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IGV4cG9ydHMuZGF0YVRhYmxlT3B0aW9ucyk7XG4gICQoJyN0YWJsZScpLkRhdGFUYWJsZShvcHRpb25zKTtcbiAgc2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuICAkKCcjYWRtaW5sdGUtdG9nZ2xlbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdzaWRlYmFyLW9wZW4nKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gc2F2ZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgdG8gc2F2ZVxuICogQHBhcmFtIHVybCAtIHRoZSB1cmwgdG8gc2VuZCBkYXRhIHRvXG4gKiBAcGFyYW0gaWQgLSB0aGUgaWQgb2YgdGhlIGl0ZW0gdG8gYmUgc2F2ZS1kZXZcbiAqIEBwYXJhbSBsb2FkcGljdHVyZSAtIHRydWUgdG8gcmVsb2FkIGEgcHJvZmlsZSBwaWN0dXJlXG4gKi9cbmV4cG9ydHMuYWpheHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGlkLCBsb2FkcGljdHVyZSl7XG4gIGxvYWRwaWN0dXJlIHx8IChsb2FkcGljdHVyZSA9IGZhbHNlKTtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXNwb25zZS5kYXRhKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgaWYobG9hZHBpY3R1cmUpIGV4cG9ydHMubG9hZHBpY3R1cmUoaWQpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnIycsIGVycm9yKVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHNhdmUgdmlhIEFKQVggb24gbW9kYWwgZm9ybVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgdG8gc2F2ZVxuICogQHBhcmFtIHVybCAtIHRoZSB1cmwgdG8gc2VuZCBkYXRhIHRvXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBtb2RhbCBlbGVtZW50IHRvIGNsb3NlXG4gKi9cbmV4cG9ydHMuYWpheG1vZGFsc2F2ZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgZWxlbWVudCl7XG4gICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgJChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuICAgICAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKCkuYWpheC5yZWxvYWQoKTtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnIycsIGVycm9yKVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBwaWN0dXJlIHZpYSBBSkFYXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIHVzZXIgSUQgb2YgdGhlIHBpY3R1cmUgdG8gcmVsb2FkXG4gKi9cbmV4cG9ydHMubG9hZHBpY3R1cmUgPSBmdW5jdGlvbihpZCl7XG4gIHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYy8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG4gICAgICAkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG4gICAgfSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYW4gaXRlbVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgY29udGFpbmluZyB0aGUgaXRlbSB0byBkZWxldGVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSByZXRVcmwgLSB0aGUgVVJMIHRvIHJldHVybiB0byBhZnRlciBkZWxldGVcbiAqIEBwYXJhbSBzb2Z0IC0gYm9vbGVhbiBpZiB0aGlzIGlzIGEgc29mdCBkZWxldGUgb3Igbm90XG4gKi9cbmV4cG9ydHMuYWpheGRlbGV0ZSA9IGZ1bmN0aW9uIChkYXRhLCB1cmwsIHJldFVybCwgc29mdCA9IGZhbHNlKXtcbiAgaWYoc29mdCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuICB9ZWxzZXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSBhbGwgcmVsYXRlZCByZWNvcmRzLiBZb3UgY2Fubm90IHVuZG8gdGhpcyBhY3Rpb24uXCIpO1xuICB9XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmV0VXJsKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdkZWxldGUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYW4gaXRlbSBmcm9tIGEgbW9kYWwgZm9ybVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgY29udGFpbmluZyB0aGUgaXRlbSB0byBkZWxldGVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIG1vZGFsIGVsZW1lbnQgdG8gY2xvc2VcbiAqL1xuZXhwb3J0cy5hamF4bW9kYWxkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCBlbGVtZW50KXtcbiAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKCkuYWpheC5yZWxvYWQoKTtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzdG9yZSBhIHNvZnQtZGVsZXRlZCBpdGVtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgaXRlbSB0byBiZSByZXN0b3JlZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGF0IGluZm9ybWF0aW9uIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG9cbiAqL1xuZXhwb3J0cy5hamF4cmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgcmV0VXJsKXtcbiAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmV0VXJsKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXN0b3JlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGUoaWQsIHVybCk7XG59XG5cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZWxvY2sgPSBmdW5jdGlvbihpZCwgdXJsKXtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlbG9jayhpZCwgdXJsKTtcbn1cblxuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlc2V0ID0gZnVuY3Rpb24oaWQsIHZhbHVlKXtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlc2V0KGlkLCB2YWx1ZSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZGFzaGJvYXJkLmpzIiwiLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmxhc2hlZCBzZXNzaW9uIGRhdGFcbiAqXG4gKiB1c2UgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCdtZXNzYWdlJywgdHJhbnMoJ21lc3NhZ2VzLml0ZW1fc2F2ZWQnKSk7XG4gKiAgICAgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCd0eXBlJywgJ3N1Y2Nlc3MnKTtcbiAqIHRvIHNldCBtZXNzYWdlIHRleHQgYW5kIHR5cGVcbiAqL1xuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpe1xuXHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiamF2YXNjcmlwdE1lc3NhZ2VcIiBjbGFzcz1cImFsZXJ0IGZhZGUgaW4gYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtJyArIHR5cGUgKyAnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48L2J1dHRvbj48c3BhbiBjbGFzcz1cImg0XCI+JyArIG1lc3NhZ2UgKyAnPC9zcGFuPjwvZGl2Pic7XG5cdCQoJyNtZXNzYWdlJykuYXBwZW5kKGh0bWwpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoXCIjamF2YXNjcmlwdE1lc3NhZ2VcIikuYWxlcnQoJ2Nsb3NlJyk7XG5cdH0sIDMwMDApO1xufTtcblxuLypcbmV4cG9ydHMuYWpheGNyc2YgPSBmdW5jdGlvbigpe1xuXHQkLmFqYXhTZXR1cCh7XG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jylcblx0XHR9XG5cdH0pO1xufTtcbiovXG5cbi8qKlxuICogQ2xlYXJzIGVycm9ycyBvbiBmb3JtcyBieSByZW1vdmluZyBlcnJvciBjbGFzc2VzXG4gKi9cbmV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzID0gZnVuY3Rpb24oKXtcblx0JCgnLmZvcm0tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uICgpe1xuXHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcblx0fSk7XG59XG5cbi8qKlxuICogU2V0cyBlcnJvcnMgb24gZm9ybXMgYmFzZWQgb24gcmVzcG9uc2UgSlNPTlxuICovXG5leHBvcnRzLnNldEZvcm1FcnJvcnMgPSBmdW5jdGlvbihqc29uKXtcblx0ZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMoKTtcblx0JC5lYWNoKGpzb24sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0JCgnIycgKyBrZXkpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQoJyMnICsga2V5ICsgJ2hlbHAnKS50ZXh0KHZhbHVlLmpvaW4oJyAnKSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBmb3IgbWVzc2FnZXMgaW4gdGhlIGZsYXNoIGRhdGEuIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgYnkgdGhlIHBhZ2VcbiAqL1xuZXhwb3J0cy5jaGVja01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKCcjbWVzc2FnZV9mbGFzaCcpLmxlbmd0aCl7XG5cdFx0dmFyIG1lc3NhZ2UgPSAkKCcjbWVzc2FnZV9mbGFzaCcpLnZhbCgpO1xuXHRcdHZhciB0eXBlID0gJCgnI21lc3NhZ2VfdHlwZV9mbGFzaCcpLnZhbCgpO1xuXHRcdGV4cG9ydHMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3JzIGZyb20gQUpBWFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSB0byB0aGUgdXNlclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBlcnJvciAtIHRoZSBBeGlvcyBlcnJvciByZWNlaXZlZFxuICovXG5leHBvcnRzLmhhbmRsZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgZWxlbWVudCwgZXJyb3Ipe1xuXHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRleHBvcnRzLnNldEZvcm1FcnJvcnMoZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byBcIiArIG1lc3NhZ2UgKyBcIjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvL2hpZGUgc3Bpbm5pbmcgaWNvblxuXHRpZihlbGVtZW50Lmxlbmd0aCA+IDApe1xuXHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdHJ1bmNhdGUgdGV4dFxuICpcbiAqIEBwYXJhbSB0ZXh0IC0gdGhlIHRleHQgdG8gdHJ1bmNhdGVcbiAqIEBwYXJhbSBsZW5ndGggLSB0aGUgbWF4aW11bSBsZW5ndGhcbiAqXG4gKiBodHRwOi8vanNmaWRkbGUubmV0L3NjaGFkZWNrL0dwQ1pML1xuICovXG5leHBvcnRzLnRydW5jYXRlVGV4dCA9IGZ1bmN0aW9uKHRleHQsIGxlbmd0aCl7XG5cdGlmKHRleHQubGVuZ3RoID4gbGVuZ3RoKXtcblx0XHRyZXR1cm4gJC50cmltKHRleHQpLnN1YnN0cmluZygwLCBsZW5ndGgpLnNwbGl0KFwiIFwiKS5zbGljZSgwLCAtMSkuam9pbihcIiBcIikgKyBcIi4uLlwiO1xuXHR9ZWxzZXtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG4gICAgICBhdXRvU2VsZWN0Rmlyc3Q6IHRydWUsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIGV4cG9ydHMudHJ1bmNhdGVUZXh0KHN1Z2dlc3Rpb24udmFsdWUsIDMwKSk7XG5cdFx0XHRcdFx0JCgnIycgKyBpZCArICdhdXRvJykudmFsKFwiXCIpO1xuXHQgICAgfSxcblx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH07XG5cdCAgICB9XG5cdH0pO1xuXG4gICQoJyMnICsgaWQgKyAnY2xlYXInKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyMnICsgaWQpLnZhbCgwKTtcbiAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIDAgKyBcIikgXCIpO1xuICAgICQoJyMnICsgaWQgKyAnYXV0bycpLnZhbChcIlwiKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYXV0b2NvbXBsZXRlIGEgZmllbGQgd2l0aCBhIGxvY2tcbiAqXG4gKiBAcGFyYW0gaWQgLSB0aGUgSUQgb2YgdGhlIGZpZWxkXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byByZXF1ZXN0IGRhdGEgZnJvbVxuICovXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGVsb2NrID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG4gICAgICBhdXRvU2VsZWN0Rmlyc3Q6IHRydWUsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIGV4cG9ydHMudHJ1bmNhdGVUZXh0KHN1Z2dlc3Rpb24udmFsdWUsIDMwKSk7XG5cdFx0XHRcdFx0JCgnIycgKyBpZCArICdhdXRvJykudmFsKFwiXCIpO1xuICAgICAgICAgIGV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgMSk7XG5cdCAgICB9LFxuXHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgfTtcblx0ICAgIH1cblx0fSk7XG5cbiAgJCgnIycgKyBpZCArICdjbGVhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnIycgKyBpZCkudmFsKDApO1xuICAgICQoJyMnICsgaWQgKyAndGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgMCArIFwiKSBcIik7XG4gICAgJCgnIycgKyBpZCArICdhdXRvJykudmFsKFwiXCIpO1xuICAgIGV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgMCk7XG4gIH0pO1xuXG4gICQoJyMnICsgaWQgKyAnbG9ja0J0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFsID0gcGFyc2VJbnQoJCgnIycgKyBpZCArICdsb2NrJykudmFsKCkpO1xuICAgIGV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgKHZhbCArIDEpICUgMik7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHVwZGF0ZSBhIGxvY2tlZCBhdXRvY29tcGxldGUgYnV0dG9uXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIHRvIHNldFxuICovXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGVzZXQgPSBmdW5jdGlvbihpZCwgdmFsdWUpe1xuICBpZih2YWx1ZSA9PSAxKXtcbiAgICAkKCcjJyArIGlkICsgJ2xvY2snKS52YWwoMSk7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1sb2NrXCI+PC9pPicpO1xuICB9ZWxzZXtcbiAgICAkKCcjJyArIGlkICsgJ2xvY2snKS52YWwoMCk7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS11bmxvY2stYWx0XCI+PC9pPicpO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFtlZGl0XSBsaW5rc1xuICAkKCcuZWRpdGFibGUtbGluaycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vaGlkZSB0aGUgW2VkaXRdIGxpbmtzLCBlbmFibGUgZWRpdG9yLCBhbmQgc2hvdyBTYXZlIGFuZCBDYW5jZWwgYnV0dG9uc1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoe1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdG9vbGJhcjogW1xuICAgICAgICAgIC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuICAgICAgICAgIFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcbiAgICAgICAgICBbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG4gICAgICAgICAgWydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG4gICAgICAgICAgWydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG4gICAgICAgIF0sXG4gICAgICAgIHRhYnNpemU6IDIsXG4gICAgICAgIGNvZGVtaXJyb3I6IHtcbiAgICAgICAgICBtb2RlOiAndGV4dC9odG1sJyxcbiAgICAgICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ21vbm9rYWknXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgU2F2ZSBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1zYXZlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9EaXNwbGF5IHNwaW5uZXIgd2hpbGUgQUpBWCBjYWxsIGlzIHBlcmZvcm1lZFxuICAgICAgJCgnI2VkaXRhYmxlc3Bpbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuICAgICAgLy9HZXQgY29udGVudHMgb2YgZWRpdG9yXG4gICAgICB2YXIgaHRtbFN0cmluZyA9ICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2NvZGUnKTtcblxuICAgICAgLy9Qb3N0IGNvbnRlbnRzIHRvIHNlcnZlciwgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZWRpdGFibGUvc2F2ZS8nICsgaWQsIHtcbiAgICAgICAgY29udGVudHM6IGh0bWxTdHJpbmdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIC8vSWYgcmVzcG9uc2UgMjAwIHJlY2VpdmVkLCBhc3N1bWUgaXQgc2F2ZWQgYW5kIHJlbG9hZCBwYWdlXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChcIlVuYWJsZSB0byBzYXZlIGNvbnRlbnQ6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgQ2FuY2VsIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLWNhbmNlbCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vUmVzZXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IgYW5kIGRlc3Ryb3kgaXRcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ3Jlc2V0Jyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdkZXN0cm95Jyk7XG5cbiAgICAgIC8vSGlkZSBTYXZlIGFuZCBDYW5jZWwgYnV0dG9ucywgYW5kIHNob3cgW2VkaXRdIGxpbmtcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyIsIi8vIENvZGVNaXJyb3IsIGNvcHlyaWdodCAoYykgYnkgTWFyaWpuIEhhdmVyYmVrZSBhbmQgb3RoZXJzXG4vLyBEaXN0cmlidXRlZCB1bmRlciBhbiBNSVQgbGljZW5zZTogaHR0cDovL2NvZGVtaXJyb3IubmV0L0xJQ0VOU0VcblxuKGZ1bmN0aW9uKG1vZCkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpIC8vIENvbW1vbkpTXG4gICAgbW9kKHJlcXVpcmUoXCIuLi8uLi9saWIvY29kZW1pcnJvclwiKSk7XG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIC8vIEFNRFxuICAgIGRlZmluZShbXCIuLi8uLi9saWIvY29kZW1pcnJvclwiXSwgbW9kKTtcbiAgZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIG1vZChDb2RlTWlycm9yKTtcbn0pKGZ1bmN0aW9uKENvZGVNaXJyb3IpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaHRtbENvbmZpZyA9IHtcbiAgYXV0b1NlbGZDbG9zZXJzOiB7J2FyZWEnOiB0cnVlLCAnYmFzZSc6IHRydWUsICdicic6IHRydWUsICdjb2wnOiB0cnVlLCAnY29tbWFuZCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdlbWJlZCc6IHRydWUsICdmcmFtZSc6IHRydWUsICdocic6IHRydWUsICdpbWcnOiB0cnVlLCAnaW5wdXQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAna2V5Z2VuJzogdHJ1ZSwgJ2xpbmsnOiB0cnVlLCAnbWV0YSc6IHRydWUsICdwYXJhbSc6IHRydWUsICdzb3VyY2UnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAndHJhY2snOiB0cnVlLCAnd2JyJzogdHJ1ZSwgJ21lbnVpdGVtJzogdHJ1ZX0sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHsnZGQnOiB0cnVlLCAnbGknOiB0cnVlLCAnb3B0Z3JvdXAnOiB0cnVlLCAnb3B0aW9uJzogdHJ1ZSwgJ3AnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZSwgJ3Rib2R5JzogdHJ1ZSwgJ3RkJzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICd0aCc6IHRydWUsICd0cic6IHRydWV9LFxuICBjb250ZXh0R3JhYmJlcnM6IHtcbiAgICAnZGQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2R0JzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdsaSc6IHsnbGknOiB0cnVlfSxcbiAgICAnb3B0aW9uJzogeydvcHRpb24nOiB0cnVlLCAnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAnb3B0Z3JvdXAnOiB7J29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ3AnOiB7J2FkZHJlc3MnOiB0cnVlLCAnYXJ0aWNsZSc6IHRydWUsICdhc2lkZSc6IHRydWUsICdibG9ja3F1b3RlJzogdHJ1ZSwgJ2Rpcic6IHRydWUsXG4gICAgICAgICAgJ2Rpdic6IHRydWUsICdkbCc6IHRydWUsICdmaWVsZHNldCc6IHRydWUsICdmb290ZXInOiB0cnVlLCAnZm9ybSc6IHRydWUsXG4gICAgICAgICAgJ2gxJzogdHJ1ZSwgJ2gyJzogdHJ1ZSwgJ2gzJzogdHJ1ZSwgJ2g0JzogdHJ1ZSwgJ2g1JzogdHJ1ZSwgJ2g2JzogdHJ1ZSxcbiAgICAgICAgICAnaGVhZGVyJzogdHJ1ZSwgJ2hncm91cCc6IHRydWUsICdocic6IHRydWUsICdtZW51JzogdHJ1ZSwgJ25hdic6IHRydWUsICdvbCc6IHRydWUsXG4gICAgICAgICAgJ3AnOiB0cnVlLCAncHJlJzogdHJ1ZSwgJ3NlY3Rpb24nOiB0cnVlLCAndGFibGUnOiB0cnVlLCAndWwnOiB0cnVlfSxcbiAgICAncnAnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3J0JzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICd0Ym9keSc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndGQnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3Rmb290Jzogeyd0Ym9keSc6IHRydWV9LFxuICAgICd0aCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGhlYWQnOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RyJzogeyd0cic6IHRydWV9XG4gIH0sXG4gIGRvTm90SW5kZW50OiB7XCJwcmVcIjogdHJ1ZX0sXG4gIGFsbG93VW5xdW90ZWQ6IHRydWUsXG4gIGFsbG93TWlzc2luZzogdHJ1ZSxcbiAgY2FzZUZvbGQ6IHRydWVcbn1cblxudmFyIHhtbENvbmZpZyA9IHtcbiAgYXV0b1NlbGZDbG9zZXJzOiB7fSxcbiAgaW1wbGljaXRseUNsb3NlZDoge30sXG4gIGNvbnRleHRHcmFiYmVyczoge30sXG4gIGRvTm90SW5kZW50OiB7fSxcbiAgYWxsb3dVbnF1b3RlZDogZmFsc2UsXG4gIGFsbG93TWlzc2luZzogZmFsc2UsXG4gIGFsbG93TWlzc2luZ1RhZ05hbWU6IGZhbHNlLFxuICBjYXNlRm9sZDogZmFsc2Vcbn1cblxuQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwieG1sXCIsIGZ1bmN0aW9uKGVkaXRvckNvbmYsIGNvbmZpZ18pIHtcbiAgdmFyIGluZGVudFVuaXQgPSBlZGl0b3JDb25mLmluZGVudFVuaXRcbiAgdmFyIGNvbmZpZyA9IHt9XG4gIHZhciBkZWZhdWx0cyA9IGNvbmZpZ18uaHRtbE1vZGUgPyBodG1sQ29uZmlnIDogeG1sQ29uZmlnXG4gIGZvciAodmFyIHByb3AgaW4gZGVmYXVsdHMpIGNvbmZpZ1twcm9wXSA9IGRlZmF1bHRzW3Byb3BdXG4gIGZvciAodmFyIHByb3AgaW4gY29uZmlnXykgY29uZmlnW3Byb3BdID0gY29uZmlnX1twcm9wXVxuXG4gIC8vIFJldHVybiB2YXJpYWJsZXMgZm9yIHRva2VuaXplcnNcbiAgdmFyIHR5cGUsIHNldFN0eWxlO1xuXG4gIGZ1bmN0aW9uIGluVGV4dChzdHJlYW0sIHN0YXRlKSB7XG4gICAgZnVuY3Rpb24gY2hhaW4ocGFyc2VyKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IHBhcnNlcjtcbiAgICAgIHJldHVybiBwYXJzZXIoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiIVwiKSkge1xuICAgICAgICBpZiAoc3RyZWFtLmVhdChcIltcIikpIHtcbiAgICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKFwiQ0RBVEFbXCIpKSByZXR1cm4gY2hhaW4oaW5CbG9jayhcImF0b21cIiwgXCJdXT5cIikpO1xuICAgICAgICAgIGVsc2UgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiLS1cIikpIHtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oaW5CbG9jayhcImNvbW1lbnRcIiwgXCItLT5cIikpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIkRPQ1RZUEVcIiwgdHJ1ZSwgdHJ1ZSkpIHtcbiAgICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5fXFwtXS8pO1xuICAgICAgICAgIHJldHVybiBjaGFpbihkb2N0eXBlKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzdHJlYW0uZWF0KFwiP1wiKSkge1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5fXFwtXS8pO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluQmxvY2soXCJtZXRhXCIsIFwiPz5cIik7XG4gICAgICAgIHJldHVybiBcIm1ldGFcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGUgPSBzdHJlYW0uZWF0KFwiL1wiKSA/IFwiY2xvc2VUYWdcIiA6IFwib3BlblRhZ1wiO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCImXCIpIHtcbiAgICAgIHZhciBvaztcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiI1wiKSkge1xuICAgICAgICBpZiAoc3RyZWFtLmVhdChcInhcIikpIHtcbiAgICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW2EtZkEtRlxcZF0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcZF0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5cXC06XS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9rID8gXCJhdG9tXCIgOiBcImVycm9yXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW14mPF0vKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBpblRleHQuaXNJblRleHQgPSB0cnVlO1xuXG4gIGZ1bmN0aW9uIGluVGFnKHN0cmVhbSwgc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIj5cIiB8fCAoY2ggPT0gXCIvXCIgJiYgc3RyZWFtLmVhdChcIj5cIikpKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHR5cGUgPSBjaCA9PSBcIj5cIiA/IFwiZW5kVGFnXCIgOiBcInNlbGZjbG9zZVRhZ1wiO1xuICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPVwiKSB7XG4gICAgICB0eXBlID0gXCJlcXVhbHNcIjtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgc3RhdGUuc3RhdGUgPSBiYXNlU3RhdGU7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgdmFyIG5leHQgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIHJldHVybiBuZXh0ID8gbmV4dCArIFwiIHRhZyBlcnJvclwiIDogXCJ0YWcgZXJyb3JcIjtcbiAgICB9IGVsc2UgaWYgKC9bXFwnXFxcIl0vLnRlc3QoY2gpKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluQXR0cmlidXRlKGNoKTtcbiAgICAgIHN0YXRlLnN0cmluZ1N0YXJ0Q29sID0gc3RyZWFtLmNvbHVtbigpO1xuICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0ubWF0Y2goL15bXlxcc1xcdTAwYTA9PD5cXFwiXFwnXSpbXlxcc1xcdTAwYTA9PD5cXFwiXFwnXFwvXS8pO1xuICAgICAgcmV0dXJuIFwid29yZFwiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluQXR0cmlidXRlKHF1b3RlKSB7XG4gICAgdmFyIGNsb3N1cmUgPSBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm5leHQoKSA9PSBxdW90ZSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcInN0cmluZ1wiO1xuICAgIH07XG4gICAgY2xvc3VyZS5pc0luQXR0cmlidXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gY2xvc3VyZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluQmxvY2soc3R5bGUsIHRlcm1pbmF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5tYXRjaCh0ZXJtaW5hdG9yKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5uZXh0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkb2N0eXBlKGRlcHRoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHZhciBjaDtcbiAgICAgIHdoaWxlICgoY2ggPSBzdHJlYW0ubmV4dCgpKSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCArIDEpO1xuICAgICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaCA9PSBcIj5cIikge1xuICAgICAgICAgIGlmIChkZXB0aCA9PSAxKSB7XG4gICAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggLSAxKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcIm1ldGFcIjtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgc3RhcnRPZkxpbmUpIHtcbiAgICB0aGlzLnByZXYgPSBzdGF0ZS5jb250ZXh0O1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG4gICAgdGhpcy5pbmRlbnQgPSBzdGF0ZS5pbmRlbnRlZDtcbiAgICB0aGlzLnN0YXJ0T2ZMaW5lID0gc3RhcnRPZkxpbmU7XG4gICAgaWYgKGNvbmZpZy5kb05vdEluZGVudC5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSB8fCAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0Lm5vSW5kZW50KSlcbiAgICAgIHRoaXMubm9JbmRlbnQgPSB0cnVlO1xuICB9XG4gIGZ1bmN0aW9uIHBvcENvbnRleHQoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuY29udGV4dCkgc3RhdGUuY29udGV4dCA9IHN0YXRlLmNvbnRleHQucHJldjtcbiAgfVxuICBmdW5jdGlvbiBtYXliZVBvcENvbnRleHQoc3RhdGUsIG5leHRUYWdOYW1lKSB7XG4gICAgdmFyIHBhcmVudFRhZ05hbWU7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICghc3RhdGUuY29udGV4dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwYXJlbnRUYWdOYW1lID0gc3RhdGUuY29udGV4dC50YWdOYW1lO1xuICAgICAgaWYgKCFjb25maWcuY29udGV4dEdyYWJiZXJzLmhhc093blByb3BlcnR5KHBhcmVudFRhZ05hbWUpIHx8XG4gICAgICAgICAgIWNvbmZpZy5jb250ZXh0R3JhYmJlcnNbcGFyZW50VGFnTmFtZV0uaGFzT3duUHJvcGVydHkobmV4dFRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJhc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJvcGVuVGFnXCIpIHtcbiAgICAgIHN0YXRlLnRhZ1N0YXJ0ID0gc3RyZWFtLmNvbHVtbigpO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJjbG9zZVRhZ1wiKSB7XG4gICAgICByZXR1cm4gY2xvc2VUYWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiYXNlU3RhdGU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdHJlYW0uY3VycmVudCgpO1xuICAgICAgc2V0U3R5bGUgPSBcInRhZ1wiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGNsb3NlVGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgdmFyIHRhZ05hbWUgPSBzdHJlYW0uY3VycmVudCgpO1xuICAgICAgaWYgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lICE9IHRhZ05hbWUgJiZcbiAgICAgICAgICBjb25maWcuaW1wbGljaXRseUNsb3NlZC5oYXNPd25Qcm9wZXJ0eShzdGF0ZS5jb250ZXh0LnRhZ05hbWUpKVxuICAgICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICAgIGlmICgoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgPT0gdGFnTmFtZSkgfHwgY29uZmlnLm1hdGNoQ2xvc2luZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZ1wiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWcgZXJyb3JcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGVFcnI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGVFcnI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlICE9IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgfVxuICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgIHJldHVybiBiYXNlU3RhdGU7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VTdGF0ZUVycih0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGNsb3NlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhdHRyU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImF0dHJpYnV0ZVwiO1xuICAgICAgcmV0dXJuIGF0dHJFcVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImVuZFRhZ1wiIHx8IHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIikge1xuICAgICAgdmFyIHRhZ05hbWUgPSBzdGF0ZS50YWdOYW1lLCB0YWdTdGFydCA9IHN0YXRlLnRhZ1N0YXJ0O1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIGlmICh0eXBlID09IFwic2VsZmNsb3NlVGFnXCIgfHxcbiAgICAgICAgICBjb25maWcuYXV0b1NlbGZDbG9zZXJzLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgICBzdGF0ZS5jb250ZXh0ID0gbmV3IENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlU3RhdGU7XG4gICAgfVxuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGU7XG4gIH1cbiAgZnVuY3Rpb24gYXR0ckVxU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwiZXF1YWxzXCIpIHJldHVybiBhdHRyVmFsdWVTdGF0ZTtcbiAgICBpZiAoIWNvbmZpZy5hbGxvd01pc3NpbmcpIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYXR0clZhbHVlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIgJiYgY29uZmlnLmFsbG93VW5xdW90ZWQpIHtzZXRTdHlsZSA9IFwic3RyaW5nXCI7IHJldHVybiBhdHRyU3RhdGU7fVxuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYXR0ckNvbnRpbnVlZFN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0YXJ0U3RhdGU6IGZ1bmN0aW9uKGJhc2VJbmRlbnQpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHt0b2tlbml6ZTogaW5UZXh0LFxuICAgICAgICAgICAgICAgICAgIHN0YXRlOiBiYXNlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgaW5kZW50ZWQ6IGJhc2VJbmRlbnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiBudWxsLCB0YWdTdGFydDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBudWxsfVxuICAgICAgaWYgKGJhc2VJbmRlbnQgIT0gbnVsbCkgc3RhdGUuYmFzZUluZGVudCA9IGJhc2VJbmRlbnRcbiAgICAgIHJldHVybiBzdGF0ZVxuICAgIH0sXG5cbiAgICB0b2tlbjogZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKCFzdGF0ZS50YWdOYW1lICYmIHN0cmVhbS5zb2woKSlcbiAgICAgICAgc3RhdGUuaW5kZW50ZWQgPSBzdHJlYW0uaW5kZW50YXRpb24oKTtcblxuICAgICAgaWYgKHN0cmVhbS5lYXRTcGFjZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgIHR5cGUgPSBudWxsO1xuICAgICAgdmFyIHN0eWxlID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBpZiAoKHN0eWxlIHx8IHR5cGUpICYmIHN0eWxlICE9IFwiY29tbWVudFwiKSB7XG4gICAgICAgIHNldFN0eWxlID0gbnVsbDtcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBzdGF0ZS5zdGF0ZSh0eXBlIHx8IHN0eWxlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgaWYgKHNldFN0eWxlKVxuICAgICAgICAgIHN0eWxlID0gc2V0U3R5bGUgPT0gXCJlcnJvclwiID8gc3R5bGUgKyBcIiBlcnJvclwiIDogc2V0U3R5bGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfSxcblxuICAgIGluZGVudDogZnVuY3Rpb24oc3RhdGUsIHRleHRBZnRlciwgZnVsbExpbmUpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gc3RhdGUuY29udGV4dDtcbiAgICAgIC8vIEluZGVudCBtdWx0aS1saW5lIHN0cmluZ3MgKGUuZy4gY3NzKS5cbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZS5pc0luQXR0cmlidXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZS50YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZClcbiAgICAgICAgICByZXR1cm4gc3RhdGUuc3RyaW5nU3RhcnRDb2wgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmluZGVudGVkICsgaW5kZW50VW5pdDtcbiAgICAgIH1cbiAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQubm9JbmRlbnQpIHJldHVybiBDb2RlTWlycm9yLlBhc3M7XG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUgIT0gaW5UYWcgJiYgc3RhdGUudG9rZW5pemUgIT0gaW5UZXh0KVxuICAgICAgICByZXR1cm4gZnVsbExpbmUgPyBmdWxsTGluZS5tYXRjaCgvXihcXHMqKS8pWzBdLmxlbmd0aCA6IDA7XG4gICAgICAvLyBJbmRlbnQgdGhlIHN0YXJ0cyBvZiBhdHRyaWJ1dGUgbmFtZXMuXG4gICAgICBpZiAoc3RhdGUudGFnTmFtZSkge1xuICAgICAgICBpZiAoY29uZmlnLm11bHRpbGluZVRhZ0luZGVudFBhc3RUYWcgIT09IGZhbHNlKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS50YWdTdGFydCArIHN0YXRlLnRhZ05hbWUubGVuZ3RoICsgMjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS50YWdTdGFydCArIGluZGVudFVuaXQgKiAoY29uZmlnLm11bHRpbGluZVRhZ0luZGVudEZhY3RvciB8fCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcuYWxpZ25DREFUQSAmJiAvPCFcXFtDREFUQVxcWy8udGVzdCh0ZXh0QWZ0ZXIpKSByZXR1cm4gMDtcbiAgICAgIHZhciB0YWdBZnRlciA9IHRleHRBZnRlciAmJiAvXjwoXFwvKT8oW1xcd186XFwuLV0qKS8uZXhlYyh0ZXh0QWZ0ZXIpO1xuICAgICAgaWYgKHRhZ0FmdGVyICYmIHRhZ0FmdGVyWzFdKSB7IC8vIENsb3NpbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC50YWdOYW1lID09IHRhZ0FmdGVyWzJdKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb25maWcuaW1wbGljaXRseUNsb3NlZC5oYXNPd25Qcm9wZXJ0eShjb250ZXh0LnRhZ05hbWUpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGFnQWZ0ZXIpIHsgLy8gT3BlbmluZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIHZhciBncmFiYmVycyA9IGNvbmZpZy5jb250ZXh0R3JhYmJlcnNbY29udGV4dC50YWdOYW1lXTtcbiAgICAgICAgICBpZiAoZ3JhYmJlcnMgJiYgZ3JhYmJlcnMuaGFzT3duUHJvcGVydHkodGFnQWZ0ZXJbMl0pKVxuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKGNvbnRleHQgJiYgY29udGV4dC5wcmV2ICYmICFjb250ZXh0LnN0YXJ0T2ZMaW5lKVxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgaWYgKGNvbnRleHQpIHJldHVybiBjb250ZXh0LmluZGVudCArIGluZGVudFVuaXQ7XG4gICAgICBlbHNlIHJldHVybiBzdGF0ZS5iYXNlSW5kZW50IHx8IDA7XG4gICAgfSxcblxuICAgIGVsZWN0cmljSW5wdXQ6IC88XFwvW1xcc1xcdzpdKz4kLyxcbiAgICBibG9ja0NvbW1lbnRTdGFydDogXCI8IS0tXCIsXG4gICAgYmxvY2tDb21tZW50RW5kOiBcIi0tPlwiLFxuXG4gICAgY29uZmlndXJhdGlvbjogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuICAgIGhlbHBlclR5cGU6IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcblxuICAgIHNraXBBdHRyaWJ1dGU6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBpZiAoc3RhdGUuc3RhdGUgPT0gYXR0clZhbHVlU3RhdGUpXG4gICAgICAgIHN0YXRlLnN0YXRlID0gYXR0clN0YXRlXG4gICAgfVxuICB9O1xufSk7XG5cbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQveG1sXCIsIFwieG1sXCIpO1xuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24veG1sXCIsIFwieG1sXCIpO1xuaWYgKCFDb2RlTWlycm9yLm1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShcInRleHQvaHRtbFwiKSlcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC9odG1sXCIsIHtuYW1lOiBcInhtbFwiLCBodG1sTW9kZTogdHJ1ZX0pO1xuXG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzXG4vLyBtb2R1bGUgaWQgPSAyMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcbiAgICAgIGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2Fkdmlzb3JfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5hZHZpc29yX2lkID0gJCgnI2Fkdmlzb3JfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgZGF0YS5laWQgPSAkKCcjZWlkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3c3R1ZGVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9zdHVkZW50cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3YWR2aXNvclwiPk5ldyBBZHZpc29yPC9hPicpO1xuXG4gICQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKFwiaGlkZGVuXCIsICQoJyNoaWRkZW4nKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImRlcGFydG1lbnRfaWRcIiwgJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImVpZFwiLCAkKCcjZWlkJykudmFsKCkpO1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3YWR2aXNvcic7XG4gICAgfWVsc2V7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2Fkdmlzb3JzLycgKyBpZDtcbiAgICB9XG5cdFx0ZGFzaGJvYXJkLmFqYXhzYXZlKGZvcm1EYXRhLCB1cmwsIGlkLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0ID0gJCh0aGlzKSxcbiAgICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcbiAgICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG4gICAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcbiAgfSk7XG5cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKSxcbiAgICAgICAgICBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKCBpbnB1dC5sZW5ndGggKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKCBsb2cgKSBhbGVydChsb2cpO1xuICAgICAgfVxuXG4gIH0pO1xuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVwYXJ0bWVudFwiPk5ldyBEZXBhcnRtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgICBvZmZpY2U6ICQoJyNvZmZpY2UnKS52YWwoKSxcbiAgICAgIHBob25lOiAkKCcjcGhvbmUnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlcGFydG1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVwYXJ0bWVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXCI+TmV3IERlZ3JlZSBQcm9ncmFtPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV95ZWFyOiAkKCcjZWZmZWN0aXZlX3llYXInKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV9zZW1lc3RlcjogJCgnI2VmZmVjdGl2ZV9zZW1lc3RlcicpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVwcm9ncmFtcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2VsZWN0aXZlbGlzdFwiPk5ldyBFbGVjdGl2ZSBMaXN0PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWxpc3RzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdwbGFuXCI+TmV3IFBsYW48L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIHN0YXJ0X3llYXI6ICQoJyNzdGFydF95ZWFyJykudmFsKCksXG4gICAgICBzdGFydF9zZW1lc3RlcjogJCgnI3N0YXJ0X3NlbWVzdGVyJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW4nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVwb3B1bGF0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlcXVpcmVtZW50cyBhbmQgcmVwb3B1bGF0ZSB0aGVtIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBkZWdyZWUgcHJvZ3JhbS4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICAgdmFyIHVybCA9IFwiL2FkbWluL3BvcHVsYXRlcGxhblwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIHBsYW5faWQ6ICQoJyNwbGFuX2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy9uZXdwbGFuc2VtZXN0ZXIvJyArICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXIvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9wbGFucy9kZWxldGVwbGFuc2VtZXN0ZXIvXCIgKyAkKCcjaWQnKS52YWwoKSA7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zL1wiICsgJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2VcIj5OZXcgQ29tcGxldGVkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBjb3Vyc2VudW1iZXI6ICQoJyNjb3Vyc2VudW1iZXInKS52YWwoKSxcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICB5ZWFyOiAkKCcjeWVhcicpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgYmFzaXM6ICQoJyNiYXNpcycpLnZhbCgpLFxuICAgICAgZ3JhZGU6ICQoJyNncmFkZScpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI3N0dWRlbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5zdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3RyYW5zZmVyJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS50cmFuc2ZlciA9IGZhbHNlO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLnRyYW5zZmVyID0gdHJ1ZTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2luc3RpdHV0aW9uID0gJCgnI2luY29taW5nX2luc3RpdHV0aW9uJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19uYW1lID0gJCgnI2luY29taW5nX25hbWUnKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2Rlc2NyaXB0aW9uID0gJCgnI2luY29taW5nX2Rlc2NyaXB0aW9uJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19zZW1lc3RlciA9ICQoJyNpbmNvbWluZ19zZW1lc3RlcicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfY3JlZGl0cyA9ICQoJyNpbmNvbWluZ19jcmVkaXRzJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19ncmFkZSA9ICQoJyNpbmNvbWluZ19ncmFkZScpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlY29tcGxldGVkY291cnNlXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT10cmFuc2Zlcl0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG4gIGlmKCQoJyN0cmFuc2ZlcmNvdXJzZScpLmlzKCc6aGlkZGVuJykpe1xuICAgICQoJyN0cmFuc2ZlcjEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gIH1lbHNle1xuICAgICQoJyN0cmFuc2ZlcjInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gIH1cblxufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ndHJhbnNmZXInXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI2tzdGF0ZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI3RyYW5zZmVyY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNrc3RhdGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyN0cmFuc2ZlcmNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZGVzY3JpcHRpb246ICQoJyNkZXNjcmlwdGlvbicpLnZhbCgpLFxuICAgICAgc3RhcnRfeWVhcjogJCgnI3N0YXJ0X3llYXInKS52YWwoKSxcbiAgICAgIHN0YXJ0X3NlbWVzdGVyOiAkKCcjc3RhcnRfc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICB2YXIgc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvZmxvd2NoYXJ0cy9uZXcvJyArIHN0dWRlbnRfaWQ7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9mbG93Y2hhcnRzL2VkaXQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICB2YXIgdXJsID0gXCIvZmxvd2NoYXJ0cy9kZWxldGVcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvZmxvd2NoYXJ0cy9cIiArIHN0dWRlbnRfaWQ7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNyZXBvcHVsYXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSBhbGwgcmVxdWlyZW1lbnRzIGFuZCByZXBvcHVsYXRlIHRoZW0gYmFzZWQgb24gdGhlIHNlbGVjdGVkIGRlZ3JlZSBwcm9ncmFtLiBZb3UgY2Fubm90IHVuZG8gdGhpcyBhY3Rpb24uXCIpO1xuICBcdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgICB2YXIgdXJsID0gXCIvZmxvd2NoYXJ0cy9yZXNldFwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnRlZGl0LmpzIiwid2luZG93Ll8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIGpRdWVyeSBhbmQgdGhlIEJvb3RzdHJhcCBqUXVlcnkgcGx1Z2luIHdoaWNoIHByb3ZpZGVzIHN1cHBvcnRcbiAqIGZvciBKYXZhU2NyaXB0IGJhc2VkIEJvb3RzdHJhcCBmZWF0dXJlcyBzdWNoIGFzIG1vZGFscyBhbmQgdGFicy4gVGhpc1xuICogY29kZSBtYXkgYmUgbW9kaWZpZWQgdG8gZml0IHRoZSBzcGVjaWZpYyBuZWVkcyBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICovXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIHRoZSBheGlvcyBIVFRQIGxpYnJhcnkgd2hpY2ggYWxsb3dzIHVzIHRvIGVhc2lseSBpc3N1ZSByZXF1ZXN0c1xuICogdG8gb3VyIExhcmF2ZWwgYmFjay1lbmQuIFRoaXMgbGlicmFyeSBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgc2VuZGluZyB0aGVcbiAqIENTUkYgdG9rZW4gYXMgYSBoZWFkZXIgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBcIlhTUkZcIiB0b2tlbiBjb29raWUuXG4gKi9cblxud2luZG93LmF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLy9odHRwczovL2dpdGh1Yi5jb20vcmFwcGFzb2Z0L2xhcmF2ZWwtNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qc1xud2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4vKipcbiAqIE5leHQgd2Ugd2lsbCByZWdpc3RlciB0aGUgQ1NSRiBUb2tlbiBhcyBhIGNvbW1vbiBoZWFkZXIgd2l0aCBBeGlvcyBzbyB0aGF0XG4gKiBhbGwgb3V0Z29pbmcgSFRUUCByZXF1ZXN0cyBhdXRvbWF0aWNhbGx5IGhhdmUgaXQgYXR0YWNoZWQuIFRoaXMgaXMganVzdFxuICogYSBzaW1wbGUgY29udmVuaWVuY2Ugc28gd2UgZG9uJ3QgaGF2ZSB0byBhdHRhY2ggZXZlcnkgdG9rZW4gbWFudWFsbHkuXG4gKi9cblxubGV0IHRva2VuID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG5cbmlmICh0b2tlbikge1xuICAgIHdpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1DU1JGLVRPS0VOJ10gPSB0b2tlbi5jb250ZW50O1xufSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdDU1JGIHRva2VuIG5vdCBmb3VuZDogaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzL2NzcmYjY3NyZi14LWNzcmYtdG9rZW4nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnZW9uYXNkYW4tYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLXJ1c3NmZWxkJyk7XG52YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuLi91dGlsL2VkaXRhYmxlJyk7XG5cbi8vU2Vzc2lvbiBmb3Igc3RvcmluZyBkYXRhIGJldHdlZW4gZm9ybXNcbmV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cbi8vSUQgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgY2FsZW5kYXIncyBhZHZpc29yXG5leHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gLTE7XG5cbi8vU3R1ZGVudCdzIE5hbWUgc2V0IGJ5IGluaXRcbmV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9IFwiXCI7XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbmV4cG9ydHMuY2FsZW5kYXJEYXRhID0ge1xuXHRoZWFkZXI6IHtcblx0XHRsZWZ0OiAncHJldixuZXh0IHRvZGF5Jyxcblx0XHRjZW50ZXI6ICd0aXRsZScsXG5cdFx0cmlnaHQ6ICdhZ2VuZGFXZWVrLGFnZW5kYURheSdcblx0fSxcblx0ZWRpdGFibGU6IGZhbHNlLFxuXHRldmVudExpbWl0OiB0cnVlLFxuXHRoZWlnaHQ6ICdhdXRvJyxcblx0d2Vla2VuZHM6IGZhbHNlLFxuXHRidXNpbmVzc0hvdXJzOiB7XG5cdFx0c3RhcnQ6ICc4OjAwJywgLy8gYSBzdGFydCB0aW1lICgxMGFtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRlbmQ6ICcxNzowMCcsIC8vIGFuIGVuZCB0aW1lICg2cG0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGRvdzogWyAxLCAyLCAzLCA0LCA1IF1cblx0fSxcblx0ZGVmYXVsdFZpZXc6ICdhZ2VuZGFXZWVrJyxcblx0dmlld3M6IHtcblx0XHRhZ2VuZGE6IHtcblx0XHRcdGFsbERheVNsb3Q6IGZhbHNlLFxuXHRcdFx0c2xvdER1cmF0aW9uOiAnMDA6MjA6MDAnLFxuXHRcdFx0bWluVGltZTogJzA4OjAwOjAwJyxcblx0XHRcdG1heFRpbWU6ICcxNzowMDowMCdcblx0XHR9XG5cdH0sXG5cdGV2ZW50U291cmNlczogW1xuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9tZWV0aW5nZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIG1lZXRpbmcgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyM1MTI4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnd2hpdGUnLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL2JsYWNrb3V0ZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIGJsYWNrb3V0IGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjRkY4ODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ2JsYWNrJyxcblx0XHR9LFxuXHRdLFxuXHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRzZWxlY3RIZWxwZXI6IHRydWUsXG5cdHNlbGVjdE92ZXJsYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGV2ZW50LnJlbmRlcmluZyA9PT0gJ2JhY2tncm91bmQnO1xuXHR9LFxuXHR0aW1lRm9ybWF0OiAnICcsXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0YSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdMTEwnLFxuXHRcdHN0ZXBwaW5nOiAyMCxcblx0XHRlbmFibGVkSG91cnM6IFs4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTddLFxuXHRcdG1heEhvdXI6IDE3LFxuXHRcdHNpZGVCeVNpZGU6IHRydWUsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2UgZGF5IG9ubHlcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5ID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ01NL0REL1lZWVknLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8qKlxuICogSW5pdGlhbHphdGlvbiBmdW5jdGlvbiBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIGFkdmlzb3IgLSBib29sZWFuIHRydWUgaWYgdGhlIHVzZXIgaXMgYW4gYWR2aXNvclxuICogQHBhcmFtIG5vYmluZCAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgYnV0dG9ucyBzaG91bGQgbm90IGJlIGJvdW5kIChtYWtlIGNhbGVuZGFyIHJlYWQtb25seSlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXMgYWN0aW9uXG5cdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cblx0Ly9pbml0YWxpemUgZWRpdGFibGUgZWxlbWVudHNcblx0ZWRpdGFibGUuaW5pdCgpO1xuXG5cdC8vdHdlYWsgcGFyYW1ldGVyc1xuXHR3aW5kb3cuYWR2aXNvciB8fCAod2luZG93LmFkdmlzb3IgPSBmYWxzZSk7XG5cdHdpbmRvdy5ub2JpbmQgfHwgKHdpbmRvdy5ub2JpbmQgPSBmYWxzZSk7XG5cblx0Ly9nZXQgdGhlIGN1cnJlbnQgYWR2aXNvcidzIElEXG5cdGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAkKCcjY2FsZW5kYXJBZHZpc29ySUQnKS52YWwoKS50cmltKCk7XG5cblx0Ly9TZXQgdGhlIGFkdmlzb3IgaW5mb3JtYXRpb24gZm9yIG1lZXRpbmcgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1swXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL1NldCB0aGUgYWR2c2lvciBpbmZvcmFtdGlvbiBmb3IgYmxhY2tvdXQgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL2lmIHRoZSB3aW5kb3cgaXMgc21hbGwsIHNldCBkaWZmZXJlbnQgZGVmYXVsdCBmb3IgY2FsZW5kYXJcblx0aWYoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApe1xuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmRlZmF1bHRWaWV3ID0gJ2FnZW5kYURheSc7XG5cdH1cblxuXHQvL0lmIG5vYmluZCwgZG9uJ3QgYmluZCB0aGUgZm9ybXNcblx0aWYoIXdpbmRvdy5ub2JpbmQpe1xuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhbiBhZHZpc29yLCBiaW5kIG1vcmUgZGF0YVxuXHRcdGlmKHdpbmRvdy5hZHZpc29yKXtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI3RpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0JykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjZW5kJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjZW5kX3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLnNob3coKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5zaG93KCk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG5cdFx0XHQvL2JpbmQgbWV0aG9kcyBmb3IgYnV0dG9ucyBhbmQgZm9ybXNcblx0XHRcdCQoJyNuZXdTdHVkZW50QnV0dG9uJykuYmluZCgnY2xpY2snLCBuZXdTdHVkZW50KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjYnRpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdFx0XHQgICAgJCh0aGlzKS5maW5kKCcuaGFzLWVycm9yJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRleHQoJycpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9iaW5kIGF1dG9jb21wbGV0ZSBmaWVsZFxuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLmF1dG9jb21wbGV0ZSh7XG5cdFx0XHQgICAgc2VydmljZVVybDogJy9wcm9maWxlL3N0dWRlbnRmZWVkJyxcblx0XHRcdCAgICBhamF4U2V0dGluZ3M6IHtcblx0XHRcdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdFx0XHQgICAgICAgICQoJyNzdHVkZW50aWR2YWwnKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdCAgICAgICAgcmV0dXJuIHtcblx0XHRcdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHRcdFx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHRcdFx0ICAgICAgICAgICAgfSlcblx0XHRcdCAgICAgICAgfTtcblx0XHRcdCAgICB9XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3N0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2VuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNzdGFydCcsICcjZW5kJywgJyNkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNiZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI2JzdGFydCcsICcjYmVuZCcsICcjYmR1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnJlcGVhdHVudGlsX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSk7XG5cblx0XHRcdC8vY2hhbmdlIHJlbmRlcmluZyBvZiBldmVudHNcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdFx0XHRlbGVtZW50LmFkZENsYXNzKFwiZmMtY2xpY2thYmxlXCIpO1xuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ20nKXtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkJykudmFsKGV2ZW50LnN0dWRlbnRuYW1lKTtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdH1lbHNlIGlmIChldmVudC50eXBlID09ICdiJyl7XG5cdFx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0XHRldmVudDogZXZlbnRcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmKGV2ZW50LnJlcGVhdCA9PSAnMCcpe1xuXHRcdFx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRcdFx0ZW5kOiBlbmRcblx0XHRcdFx0fTtcblx0XHRcdFx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly9iaW5kIG1vcmUgYnV0dG9uc1xuXHRcdFx0JCgnI2JyZXBlYXQnKS5jaGFuZ2UocmVwZWF0Q2hhbmdlKTtcblxuXHRcdFx0JCgnI3NhdmVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVCbGFja291dCk7XG5cblx0XHRcdCQoJyNibGFja291dFNlcmllcycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRPY2N1cnJlbmNlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dE9jY3VycmVuY2UoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYWR2aXNpbmdCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVNZWV0aW5nQnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dEJ0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHR9KTtcblxuXG5cdFx0XHQkKCcjcmVzb2x2ZUJ1dHRvbicpLm9uKCdjbGljaycsIHJlc29sdmVDb25mbGljdHMpO1xuXG5cdFx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgbm90IGFuIGFkdmlzb3IsIGJpbmQgbGVzcyBkYXRhXG5cdFx0fWVsc2V7XG5cblx0XHRcdC8vR2V0IHRoZSBjdXJyZW50IHN0dWRlbnQncyBuYW1lXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSAkKCcjY2FsZW5kYXJTdHVkZW50TmFtZScpLnZhbCgpLnRyaW0oKTtcblxuXHRcdCAgLy9SZW5kZXIgYmxhY2tvdXRzIHRvIGJhY2tncm91bmRcblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG5cblx0XHQgIC8vV2hlbiByZW5kZXJpbmcsIHVzZSB0aGlzIGN1c3RvbSBmdW5jdGlvbiBmb3IgYmxhY2tvdXRzIGFuZCBzdHVkZW50IG1lZXRpbmdzXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0XHQgICAgfVxuXHRcdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHRcdCAgICB9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1VzZSB0aGlzIG1ldGhvZCBmb3IgY2xpY2tpbmcgb24gbWVldGluZ3Ncblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHRcdFx0XHRpZihldmVudC5zdGFydC5pc0FmdGVyKG1vbWVudCgpKSl7XG5cdFx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoXCJZb3UgY2Fubm90IGVkaXQgbWVldGluZ3MgaW4gdGhlIHBhc3RcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1doZW4gc2VsZWN0aW5nIG5ldyBhcmVhcywgdXNlIHRoZSBzdHVkZW50U2VsZWN0IG1ldGhvZCBpbiB0aGUgY2FsZW5kYXIgbGlicmFyeVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gc3R1ZGVudFNlbGVjdDtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2Rlc2MnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKFwiI2VuZFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNlbmRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnLm1vZGFsJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cdFx0fVxuXG5cdFx0Ly9CaW5kIGNsaWNrIGhhbmRsZXJzIG9uIHRoZSBmb3JtXG5cdFx0JCgnI3NhdmVCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVNZWV0aW5nKTtcblx0XHQkKCcjZGVsZXRlQnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVNZWV0aW5nKTtcblx0XHQkKCcjZHVyYXRpb24nKS5vbignY2hhbmdlJywgY2hhbmdlRHVyYXRpb24pO1xuXG5cdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMgd2l0aCBubyBiaW5kaW5nXG5cdH1lbHNle1xuXHRcdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMsIHNldCByZW5kZXJpbmcgdG8gYmFja2dyb3VuZFxuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0ICAgIH1cblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHQgICAgfVxuXHRcdH07XG5cdH1cblxuXHQvL2luaXRhbGl6ZSB0aGUgY2FsZW5kYXIhXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcihleHBvcnRzLmNhbGVuZGFyRGF0YSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgY2FsZW5kYXIgYnkgY2xvc2luZyBtb2RhbHMgYW5kIHJlbG9hZGluZyBkYXRhXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGZvcm0gdG8gaGlkZSAoYW5kIHRoZSBzcGluKVxuICogQHBhcmFtIHJlcG9uc2UgLSB0aGUgQXhpb3MgcmVwc29uc2Ugb2JqZWN0IHJlY2VpdmVkXG4gKi9cbnZhciByZXNldENhbGVuZGFyID0gZnVuY3Rpb24oZWxlbWVudCwgcmVzcG9uc2Upe1xuXHQvL2hpZGUgdGhlIGZvcm1cblx0JChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vZGlzcGxheSB0aGUgbWVzc2FnZSB0byB0aGUgdXNlclxuXHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHQvL3JlZnJlc2ggdGhlIGNhbGVuZGFyXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdGlmKHdpbmRvdy5hZHZpc29yKXtcblx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBSkFYIG1ldGhvZCB0byBzYXZlIGRhdGEgZnJvbSBhIGZvcm1cbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBzb3VyY2UgZWxlbWVudCBvZiB0aGUgZGF0YVxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFNhdmUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbil7XG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdCAgLy9pZiByZXNwb25zZSBpcyAyeHhcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHR9KVxuXHRcdC8vaWYgcmVzcG9uc2UgaXMgbm90IDJ4eFxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdH0pO1xufVxuXG52YXIgYWpheERlbGV0ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uLCBub1Jlc2V0LCBub0Nob2ljZSl7XG5cdC8vY2hlY2sgbm9SZXNldCB2YXJpYWJsZVxuXHRub1Jlc2V0IHx8IChub1Jlc2V0ID0gZmFsc2UpO1xuXHRub0Nob2ljZSB8fCAobm9DaG9pY2UgPSBmYWxzZSk7XG5cblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGNvbmZpcm1hdGlvblxuXHRpZighbm9DaG9pY2Upe1xuXHRcdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0fWVsc2V7XG5cdFx0dmFyIGNob2ljZSA9IHRydWU7XG5cdH1cblxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXG5cdFx0Ly9pZiBjb25maXJtZWQsIHNob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoZWxlbWVudCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9tYWtlIEFKQVggcmVxdWVzdCB0byBkZWxldGVcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKG5vUmVzZXQpe1xuXHRcdFx0XHRcdC8vaGlkZSBwYXJlbnQgZWxlbWVudCAtIFRPRE8gVEVTVE1FXG5cdFx0XHRcdFx0Ly9jYWxsZXIucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgYSBtZWV0aW5nXG4gKi9cbnZhciBzYXZlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVFdmVudHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRzdGFydDogbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHRlbmQ6IG1vbWVudCgkKCcjZW5kJykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdHRpdGxlOiAkKCcjdGl0bGUnKS52YWwoKSxcblx0XHRkZXNjOiAkKCcjZGVzYycpLnZhbCgpLFxuXHRcdHN0YXR1czogJCgnI3N0YXR1cycpLnZhbCgpXG5cdH07XG5cdGRhdGEuaWQgPSBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEO1xuXHRpZigkKCcjbWVldGluZ0lEJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLm1lZXRpbmdpZCA9ICQoJyNtZWV0aW5nSUQnKS52YWwoKTtcblx0fVxuXHRpZigkKCcjc3R1ZGVudGlkdmFsJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLnN0dWRlbnRpZCA9ICQoJyNzdHVkZW50aWR2YWwnKS52YWwoKTtcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9jcmVhdGVtZWV0aW5nJztcblxuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ3NhdmUgbWVldGluZycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYSBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIHVybFxuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6ICQoJyNtZWV0aW5nSUQnKS52YWwoKVxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ2RlbGV0ZSBtZWV0aW5nJywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3B1bGF0ZSBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBlZGl0aW5nXG4gKlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIGVkaXRcbiAqL1xudmFyIHNob3dNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGV2ZW50KXtcblx0JCgnI3RpdGxlJykudmFsKGV2ZW50LnRpdGxlKTtcblx0JCgnI3N0YXJ0JykudmFsKGV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNlbmQnKS52YWwoZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNkZXNjJykudmFsKGV2ZW50LmRlc2MpO1xuXHRkdXJhdGlvbk9wdGlvbnMoZXZlbnQuc3RhcnQsIGV2ZW50LmVuZCk7XG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoZXZlbnQuaWQpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHQkKCcjc3RhdHVzJykudmFsKGV2ZW50LnN0YXR1cyk7XG5cdCQoJyNkZWxldGVCdXR0b24nKS5zaG93KCk7XG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGNyZWF0aW9uXG4gKlxuICogQHBhcmFtIGNhbGVuZGFyU3R1ZGVudE5hbWUgLSBzdHJpbmcgbmFtZSBvZiB0aGUgc3R1ZGVudFxuICovXG52YXIgY3JlYXRlTWVldGluZ0Zvcm0gPSBmdW5jdGlvbihjYWxlbmRhclN0dWRlbnROYW1lKXtcblxuXHQvL3BvcHVsYXRlIHRoZSB0aXRsZSBhdXRvbWF0aWNhbGx5IGZvciBhIHN0dWRlbnRcblx0aWYoY2FsZW5kYXJTdHVkZW50TmFtZSAhPT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjdGl0bGUnKS52YWwoY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1lbHNle1xuXHRcdCQoJyN0aXRsZScpLnZhbCgnJyk7XG5cdH1cblxuXHQvL1NldCBzdGFydCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI3N0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBlbmQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2VuZCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBkdXJhdGlvbiBvcHRpb25zXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKSwgbW9tZW50KCkuaG91cig4KS5taW51dGUoMjApKTtcblx0fWVsc2V7XG5cdFx0ZHVyYXRpb25PcHRpb25zKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LCBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQpO1xuXHR9XG5cblx0Ly9SZXNldCBvdGhlciBvcHRpb25zXG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHQvL0hpZGUgZGVsZXRlIGJ1dHRvblxuXHQkKCcjZGVsZXRlQnV0dG9uJykuaGlkZSgpO1xuXG5cdC8vU2hvdyB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIG9uIHRoaXMgcGFnZVxuICovXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgJCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2V0IGR1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBtZWV0aW5nIGZvcm1cbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lXG4gKiBAcGFyYW0gZW5kIC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kaW5nIHRpbWVcbiAqL1xudmFyIGR1cmF0aW9uT3B0aW9ucyA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuXHQvL2NsZWFyIHRoZSBsaXN0XG5cdCQoJyNkdXJhdGlvbicpLmVtcHR5KCk7XG5cblx0Ly9hc3N1bWUgYWxsIG1lZXRpbmdzIGhhdmUgcm9vbSBmb3IgMjAgbWludXRlc1xuXHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPScyMCc+MjAgbWludXRlczwvb3B0aW9uPlwiKTtcblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDoyMCwgYWxsb3cgNDAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMjApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc0MCc+NDAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjAwLCBhbGxvdyA2MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNjAnPjYwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL3NldCBkZWZhdWx0IHZhbHVlIGJhc2VkIG9uIGdpdmVuIHNwYW5cblx0JCgnI2R1cmF0aW9uJykudmFsKGVuZC5kaWZmKHN0YXJ0LCBcIm1pbnV0ZXNcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsaW5rIHRoZSBkYXRlcGlja2VycyB0b2dldGhlclxuICpcbiAqIEBwYXJhbSBlbGVtMSAtIGpRdWVyeSBvYmplY3QgZm9yIGZpcnN0IGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBlbGVtMiAtIGpRdWVyeSBvYmplY3QgZm9yIHNlY29uZCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgbGlua0RhdGVQaWNrZXJzID0gZnVuY3Rpb24oZWxlbTEsIGVsZW0yLCBkdXJhdGlvbil7XG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIGZpcnN0IGRhdGFwaWNrZXJcblx0JChlbGVtMSArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTIgPSBtb21lbnQoJChlbGVtMikudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNBZnRlcihkYXRlMikgfHwgZS5kYXRlLmlzU2FtZShkYXRlMikpe1xuXHRcdFx0ZGF0ZTIgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTIpLnZhbChkYXRlMi5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gc2Vjb25kIGRhdGVwaWNrZXJcblx0JChlbGVtMiArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTEgPSBtb21lbnQoJChlbGVtMSkudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNCZWZvcmUoZGF0ZTEpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTEpKXtcblx0XHRcdGRhdGUxID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0xKS52YWwoZGF0ZTEuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBjaGFuZ2VEdXJhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdHZhciBuZXdEYXRlID0gbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCAnTExMJykuYWRkKCQodGhpcykudmFsKCksIFwibWludXRlc1wiKTtcblx0JCgnI2VuZCcpLnZhbChuZXdEYXRlLmZvcm1hdChcIkxMTFwiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZlcmlmeSB0aGF0IHRoZSBzdHVkZW50cyBhcmUgc2VsZWN0aW5nIG1lZXRpbmdzIHRoYXQgYXJlbid0IHRvbyBsb25nXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBtZWV0aW5nXG4gKiBAcGFyYW0gZW5kIC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZCBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgc3R1ZGVudFNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblxuXHQvL1doZW4gc3R1ZGVudHMgc2VsZWN0IGEgbWVldGluZywgZGlmZiB0aGUgc3RhcnQgYW5kIGVuZCB0aW1lc1xuXHRpZihlbmQuZGlmZihzdGFydCwgJ21pbnV0ZXMnKSA+IDYwKXtcblxuXHRcdC8vaWYgaW52YWxpZCwgdW5zZWxlY3QgYW5kIHNob3cgYW4gZXJyb3Jcblx0XHRhbGVydChcIk1lZXRpbmdzIGNhbm5vdCBsYXN0IGxvbmdlciB0aGFuIDEgaG91clwiKTtcblx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdH1lbHNle1xuXG5cdFx0Ly9pZiB2YWxpZCwgc2V0IGRhdGEgaW4gdGhlIHNlc3Npb24gYW5kIHNob3cgdGhlIGZvcm1cblx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdGVuZDogZW5kXG5cdFx0fTtcblx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRjcmVhdGVNZWV0aW5nRm9ybShleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9XG59O1xuXG4vKipcbiAqIExvYWQgY29uZmxpY3RpbmcgbWVldGluZ3MgZnJvbSB0aGUgc2VydmVyXG4gKi9cbnZhciBsb2FkQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblxuXHQvL3JlcXVlc3QgY29uZmxpY3RzIHZpYSBBSkFYXG5cdHdpbmRvdy5heGlvcy5nZXQoJy9hZHZpc2luZy9jb25mbGljdHMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0Ly9kaXNhYmxlIGV4aXN0aW5nIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDIwMCwgZGF0YSB3YXMgcmVjZWl2ZWRcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDApe1xuXG5cdFx0XHRcdC8vQXBwZW5kIEhUTUwgZm9yIGNvbmZsaWN0cyB0byBET01cblx0XHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJykuZW1wdHkoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0J2lkJyA6ICdyZXNvbHZlJyt2YWx1ZS5pZCxcblx0XHRcdFx0XHRcdCdjbGFzcyc6ICdtZWV0aW5nLWNvbmZsaWN0Jyxcblx0XHRcdFx0XHRcdCdodG1sJzogXHQnPHA+Jm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBwdWxsLXJpZ2h0IGRlbGV0ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnJm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgcHVsbC1yaWdodCBlZGl0Q29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5FZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+S2VlcCBNZWV0aW5nPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlJyt2YWx1ZS5pZCsnc3BpblwiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vUmUtcmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnNcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdFx0Ly9TaG93IHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuXHRcdCAgLy9JZiByZXNwb25zZSBpcyAyMDQsIG5vIGNvbmZsaWN0cyBhcmUgcHJlc2VudFxuXHRcdFx0fWVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwNCl7XG5cblx0XHRcdFx0Ly9IaWRlIHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBTYXZlIGJsYWNrb3V0cyBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBzYXZlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlQmxhY2tvdXRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCB1cmw7XG5cdHZhciBkYXRhID0ge1xuXHRcdGJzdGFydDogbW9tZW50KCQoJyNic3RhcnQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJlbmQ6IG1vbWVudCgkKCcjYmVuZCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YnRpdGxlOiAkKCcjYnRpdGxlJykudmFsKClcblx0fTtcblx0dmFyIHVybDtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YS5iYmxhY2tvdXRldmVudGlkID0gJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dCc7XG5cdFx0aWYoJCgnI2JibGFja291dGlkJykudmFsKCkgPiAwKXtcblx0XHRcdGRhdGEuYmJsYWNrb3V0aWQgPSAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKTtcblx0XHR9XG5cdFx0ZGF0YS5icmVwZWF0ID0gJCgnI2JyZXBlYXQnKS52YWwoKTtcblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDEpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnk9ICQoJyNicmVwZWF0ZGFpbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDIpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnkgPSAkKCcjYnJlcGVhdHdlZWtseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNtID0gJCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3QgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdyA9ICQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN1ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c2YgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ3NhdmUgYmxhY2tvdXQnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGJsYWNrb3V0IGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIGRlbGV0ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIFVSTCBhbmQgZGF0YSBvYmplY3Rcblx0dmFyIHVybCwgZGF0YTtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0ZXZlbnRpZDogJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSB9O1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRpZDogJCgnI2JibGFja291dGlkJykudmFsKCkgfTtcblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnZGVsZXRlIGJsYWNrb3V0JywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGNoYW5nZSBvZiByZXBlYXQgb3B0aW9ucyBvbiB0aGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgcmVwZWF0Q2hhbmdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCh0aGlzKS52YWwoKSA9PSAwKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMSl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDIpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fVxufTtcblxuLyoqXG4gKiBTaG93IHRoZSByZXNvbHZlIGNvbmZsaWN0cyBtb2RhbCBmb3JtXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0Ly9zZW5kIEFKQVggZGVsZXRlXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdkZWxldGUgbWVldGluZycsIHRydWUpO1xuXG59O1xuXG4vKipcbiAqIEVkaXQgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZWRpdENvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9tZWV0aW5nJztcblxuXHQvL3Nob3cgc3Bpbm5lciB0byBsb2FkIG1lZXRpbmdcblx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vbG9hZCBtZWV0aW5nIGFuZCBkaXNwbGF5IGZvcm1cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRldmVudCA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRldmVudC5zdGFydCA9IG1vbWVudChldmVudC5zdGFydCk7XG5cdFx0XHRldmVudC5lbmQgPSBtb21lbnQoZXZlbnQuZW5kKTtcblx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgbWVldGluZycsICcjcmVzb2x2ZScgKyBpZCwgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBSZXNvbHZlIGEgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9yZXNvbHZlY29uZmxpY3QnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdyZXNvbHZlIG1lZXRpbmcnLCB0cnVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBjcmVhdGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgY3JlYXRlQmxhY2tvdXRGb3JtID0gZnVuY3Rpb24oKXtcblx0JCgnI2J0aXRsZScpLnZhbChcIlwiKTtcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQoKS5ob3VyKDkpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0JCgnI2JyZXBlYXQnKS52YWwoMCk7XG5cdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmhpZGUoKTtcblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gdG8gYSBzaW5nbGUgb2NjdXJyZW5jZVxuICovXG52YXIgYmxhY2tvdXRPY2N1cnJlbmNlID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9zZXQgZm9ybSB2YWx1ZXMgYW5kIGhpZGUgdW5uZWVkZWQgZmllbGRzXG5cdCQoJyNidGl0bGUnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQudGl0bGUpO1xuXHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjcmVwZWF0ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0JCgnI2JibGFja291dGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkKTtcblx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuaWQpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cblx0Ly9zaG93IHRoZSBmb3JtXG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBibGFja291dCBzZXJpZXMgZWRpdCBmb3JtXG4gKi9cbnZhciBibGFja291dFNlcmllcyA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuIFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRpZDogZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9ibGFja291dCc7XG5cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI2J0aXRsZScpLnZhbChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXHQgXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuc3RhcnQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuZW5kLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChyZXNwb25zZS5kYXRhLmlkKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdCBcdFx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQgXHRcdGlmKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMSl7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdGRhaWx5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9ZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAyKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2x5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0XHRcdFx0dmFyIHJlcGVhdF9kZXRhaWwgPSBTdHJpbmcocmVzcG9uc2UuZGF0YS5yZXBlYXRfZGV0YWlsKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIxXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIyXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIzXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI0XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI1XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9XG5cdCBcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXHQgXHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgYmxhY2tvdXQgc2VyaWVzJywgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IHN0dWRlbnQgaW4gdGhlIGRhdGFiYXNlXG4gKi9cbnZhciBuZXdTdHVkZW50ID0gZnVuY3Rpb24oKXtcblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGFuIGVJRCB0byBhZGQgdG8gdGhlIHN5c3RlbVxuXHR2YXIgZWlkID0gcHJvbXB0KFwiRW50ZXIgdGhlIHN0dWRlbnQncyBlSURcIik7XG5cblx0Ly9idWlsZCB0aGUgVVJMIGFuZCBkYXRhXG5cdHZhciBkYXRhID0ge1xuXHRcdGVpZDogZWlkLFxuXHR9O1xuXHR2YXIgdXJsID0gJy9wcm9maWxlL25ld3N0dWRlbnQnO1xuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGFbXCJlaWRcIl0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xudmFyIEVjaG8gPSByZXF1aXJlKCdsYXJhdmVsLWVjaG8nKTtcbnJlcXVpcmUoJ2lvbi1zb3VuZCcpO1xuXG53aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8qKlxuICogR3JvdXBzZXNzaW9uIGluaXQgZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgdG8gc3RhcnRcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2xvYWQgaW9uLXNvdW5kIGxpYnJhcnlcblx0aW9uLnNvdW5kKHtcbiAgICBzb3VuZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJkb29yX2JlbGxcIlxuICAgICAgICB9LFxuICAgIF0sXG4gICAgdm9sdW1lOiAxLjAsXG4gICAgcGF0aDogXCIvc291bmRzL1wiLFxuICAgIHByZWxvYWQ6IHRydWVcblx0fSk7XG5cblx0Ly9nZXQgdXNlcklEIGFuZCBpc0Fkdmlzb3IgdmFyaWFibGVzXG5cdHdpbmRvdy51c2VySUQgPSBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpO1xuXG5cdC8vcmVnaXN0ZXIgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykub24oJ2NsaWNrJywgZ3JvdXBSZWdpc3RlckJ0bik7XG5cblx0Ly9kaXNhYmxlIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBEaXNhYmxlQnRuJykub24oJ2NsaWNrJywgZ3JvdXBEaXNhYmxlQnRuKTtcblxuXHQvL3JlbmRlciBWdWUgQXBwXG5cdHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2dyb3VwTGlzdCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0cXVldWU6IFtdLFxuXHRcdFx0YWR2aXNvcjogcGFyc2VJbnQoJCgnI2lzQWR2aXNvcicpLnZhbCgpKSA9PSAxLFxuXHRcdFx0dXNlcklEOiBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpLFxuXHRcdFx0b25saW5lOiBbXSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdC8vRnVuY3Rpb24gdG8gZ2V0IENTUyBjbGFzc2VzIGZvciBhIHN0dWRlbnQgb2JqZWN0XG5cdFx0XHRnZXRDbGFzczogZnVuY3Rpb24ocyl7XG5cdFx0XHRcdHJldHVybntcblx0XHRcdFx0XHQnYWxlcnQtaW5mbyc6IHMuc3RhdHVzID09IDAgfHwgcy5zdGF0dXMgPT0gMSxcblx0XHRcdFx0XHQnYWxlcnQtc3VjY2Vzcyc6IHMuc3RhdHVzID09IDIsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1tZSc6IHMudXNlcmlkID09IHRoaXMudXNlcklELFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tb2ZmbGluZSc6ICQuaW5BcnJheShzLnVzZXJpZCwgdGhpcy5vbmxpbmUpID09IC0xLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdC8vZnVuY3Rpb24gdG8gdGFrZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0dGFrZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi90YWtlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICd0YWtlJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHB1dCBhIHN0dWRlbnQgYmFjayBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0XG5cdFx0XHRwdXRTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcHV0J1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdwdXQnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIGZ1bmN0aW9uIHRvIG1hcmsgYSBzdHVkZW50IGRvbmUgb24gdGhlIGxpc3Rcblx0XHRcdGRvbmVTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZG9uZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnbWFyayBkb25lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIGRlbGV0ZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0ZGVsU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RlbGV0ZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnZGVsZXRlJyk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0pXG5cblxuXHQvL0VuYWJsZSBQdXNoZXIgbG9nZ2luZ1xuXHRpZih3aW5kb3cuZW52ID09IFwibG9jYWxcIiB8fCB3aW5kb3cuZW52ID09IFwic3RhZ2luZ1wiKXtcblx0XHRjb25zb2xlLmxvZyhcIlB1c2hlciBsb2dnaW5nIGVuYWJsZWQhXCIpO1xuXHRcdFB1c2hlci5sb2dUb0NvbnNvbGUgPSB0cnVlO1xuXHR9XG5cblx0Ly9Mb2FkIHRoZSBFY2hvIGluc3RhbmNlIG9uIHRoZSB3aW5kb3dcblx0d2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG5cdFx0YnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuXHRcdGtleTogd2luZG93LnB1c2hlcktleSxcblx0XHRjbHVzdGVyOiB3aW5kb3cucHVzaGVyQ2x1c3Rlcixcblx0fSk7XG5cblx0Ly9CaW5kIHRvIHRoZSBjb25uZWN0ZWQgYWN0aW9uIG9uIFB1c2hlciAoY2FsbGVkIHdoZW4gY29ubmVjdGVkKVxuXHR3aW5kb3cuRWNoby5jb25uZWN0b3IucHVzaGVyLmNvbm5lY3Rpb24uYmluZCgnY29ubmVjdGVkJywgZnVuY3Rpb24oKXtcblx0XHQvL3doZW4gY29ubmVjdGVkLCBkaXNhYmxlIHRoZSBzcGlubmVyXG5cdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vTG9hZCB0aGUgaW5pdGlhbCBzdHVkZW50IHF1ZXVlIHZpYSBBSkFYXG5cdFx0d2luZG93LmF4aW9zLmdldCgnL2dyb3Vwc2Vzc2lvbi9xdWV1ZScpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZS5jb25jYXQocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGNoZWNrQnV0dG9ucyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignZ2V0IHF1ZXVlJywgJycsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KVxuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uIGNoYW5uZWxcblx0Lypcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cblx0XHR9KTtcbiAqL1xuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uZW5kIGNoYW5uZWxcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uZW5kJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25FbmQnLCAoZSkgPT4ge1xuXG5cdFx0XHQvL2lmIGVuZGluZywgcmVkaXJlY3QgYmFjayB0byBob21lIHBhZ2Vcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvZ3JvdXBzZXNzaW9uXCI7XG5cdH0pO1xuXG5cdHdpbmRvdy5FY2hvLmpvaW4oJ3ByZXNlbmNlJylcblx0XHQuaGVyZSgodXNlcnMpID0+IHtcblx0XHRcdHZhciBsZW4gPSB1c2Vycy5sZW5ndGg7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlcnNbaV0uaWQpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmpvaW5pbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2VyLmlkKTtcblx0XHR9KVxuXHRcdC5sZWF2aW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnNwbGljZSggJC5pbkFycmF5KHVzZXIuaWQsIHdpbmRvdy52bS5vbmxpbmUpLCAxKTtcblx0XHR9KVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblx0XHRcdHZhciBxdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZTtcblx0XHRcdHZhciBmb3VuZCA9IGZhbHNlO1xuXHRcdFx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblxuXHRcdFx0Ly91cGRhdGUgdGhlIHF1ZXVlIGJhc2VkIG9uIHJlc3BvbnNlXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRpZihxdWV1ZVtpXS5pZCA9PT0gZGF0YS5pZCl7XG5cdFx0XHRcdFx0aWYoZGF0YS5zdGF0dXMgPCAzKXtcblx0XHRcdFx0XHRcdHF1ZXVlW2ldID0gZGF0YTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHF1ZXVlLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHRcdGxlbi0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9pZiBlbGVtZW50IG5vdCBmb3VuZCBvbiBjdXJyZW50IHF1ZXVlLCBwdXNoIGl0IG9uIHRvIHRoZSBxdWV1ZVxuXHRcdFx0aWYoIWZvdW5kKXtcblx0XHRcdFx0cXVldWUucHVzaChkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9jaGVjayB0byBzZWUgaWYgY3VycmVudCB1c2VyIGlzIG9uIHF1ZXVlIGJlZm9yZSBlbmFibGluZyBidXR0b25cblx0XHRcdGNoZWNrQnV0dG9ucyhxdWV1ZSk7XG5cblx0XHRcdC8vaWYgY3VycmVudCB1c2VyIGlzIGZvdW5kLCBjaGVjayBmb3Igc3RhdHVzIHVwZGF0ZSB0byBwbGF5IHNvdW5kXG5cdFx0XHRpZihkYXRhLnVzZXJpZCA9PT0gdXNlcklEKXtcblx0XHRcdFx0Y2hlY2tEaW5nKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NvcnQgdGhlIHF1ZXVlIGNvcnJlY3RseVxuXHRcdFx0cXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXG5cdFx0XHQvL3VwZGF0ZSBWdWUgc3RhdGUsIG1pZ2h0IGJlIHVubmVjZXNzYXJ5XG5cdFx0XHR3aW5kb3cudm0ucXVldWUgPSBxdWV1ZTtcblx0XHR9KTtcblxufTtcblxuXG4vKipcbiAqIFZ1ZSBmaWx0ZXIgZm9yIHN0YXR1cyB0ZXh0XG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgc3R1ZGVudCB0byByZW5kZXJcbiAqL1xuVnVlLmZpbHRlcignc3RhdHVzdGV4dCcsIGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMCkgcmV0dXJuIFwiTkVXXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAxKSByZXR1cm4gXCJRVUVVRURcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDIpIHJldHVybiBcIk1FRVQgV0lUSCBcIiArIGRhdGEuYWR2aXNvcjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDMpIHJldHVybiBcIkRFTEFZXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA0KSByZXR1cm4gXCJBQlNFTlRcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDUpIHJldHVybiBcIkRPTkVcIjtcbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3Vwc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB3aW5kb3cudXNlcklEICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJyArIHRva2VuICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSkgLy9pdCBoYXMgdG8gYmUgYWRkZWQgc29tZXdoZXJlIGludG8gdGhlIDxib2R5PlxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5hYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGVuYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkaXNhYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGRpc2FibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgYW5kIHNlZSBpZiB1c2VyIGlzIG9uIHRoZSBsaXN0IC0gaWYgbm90LCBkb24ndCBlbmFibGUgYnV0dG9uXG4gKi9cbnZhciBjaGVja0J1dHRvbnMgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdHZhciBmb3VuZE1lID0gZmFsc2U7XG5cblx0Ly9pdGVyYXRlIHRocm91Z2ggdXNlcnMgb24gbGlzdCwgbG9va2luZyBmb3IgY3VycmVudCB1c2VyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGZvdW5kTWUgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly9pZiBmb3VuZCwgZGlzYWJsZSBidXR0b247IGlmIG5vdCwgZW5hYmxlIGJ1dHRvblxuXHRpZihmb3VuZE1lKXtcblx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdH1lbHNle1xuXHRcdGVuYWJsZUJ1dHRvbigpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYmVja29uZWQsIGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBwZXJzb24gLSB0aGUgY3VycmVudCB1c2VyIHRvIGNoZWNrXG4gKi9cbnZhciBjaGVja0RpbmcgPSBmdW5jdGlvbihwZXJzb24pe1xuXHRpZihwZXJzb24uc3RhdHVzID09IDIpe1xuXHRcdGlvbi5zb3VuZC5wbGF5KFwiZG9vcl9iZWxsXCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBlcnNvbiBoYXMgYmVlbiBiZWNrb25lZCBvbiBsb2FkOyBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcXVldWUgLSB0aGUgaW5pdGlhbCBxdWV1ZSBvZiB1c2VycyBsb2FkZWRcbiAqL1xudmFyIGluaXRpYWxDaGVja0RpbmcgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdCQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZVByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Zmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcblx0XHRcdGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuXHRcdH07XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0Ly9zZW5kIEFKQVggcG9zdFxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3IgYWR2aXNvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZUFkdmlzb3JQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHQvL1RPRE8gVEVTVE1FXG5cdFx0dmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRkYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0ZGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdCQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdFx0JCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdC8vaHR0cDovL3d3dy5hYmVhdXRpZnVsc2l0ZS5uZXQvd2hpcHBpbmctZmlsZS1pbnB1dHMtaW50by1zaGFwZS13aXRoLWJvb3RzdHJhcC0zL1xuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuXHQgIHZhciBpbnB1dCA9ICQodGhpcyksXG5cdCAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG5cdCAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuXHQgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG5cdH0pO1xuXG5cdC8vYmluZCB0byBmaWxlc2VsZWN0IGJ1dHRvblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpO1xuXHRcdFx0dmFyIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgICBpZihsb2cpe1xuXHRcdFx0XHRcdFx0YWxlcnQobG9nKTtcblx0XHRcdFx0XHR9XG4gICAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWJsYWNrb3V0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2JsYWNrb3V0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gIC8vJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWdyb3Vwc2Vzc2lvblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ncm91cHNlc3Npb25zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgLy9sb2FkIGN1c3RvbSBidXR0b24gb24gdGhlIGRvbVxuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgLy9iaW5kIHNldHRpbmdzIGJ1dHRvbnNcbiAgJCgnLnNldHRpbmdzYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgIH07XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vc2F2ZXNldHRpbmcnO1xuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9iaW5kIG5ldyBzZXR0aW5nIGJ1dHRvblxuICAkKCcjbmV3c2V0dGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IHByb21wdChcIkVudGVyIGEgbmFtZSBmb3IgdGhlIG5ldyBzZXR0aW5nOlwiKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogY2hvaWNlLFxuICAgIH07XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL25ld3NldHRpbmdcIlxuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignY3JlYXRlJywgJycsIGVycm9yKVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2RlZ3JlZXByb2dyYW1yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFszLCBcImFzY1wiXSxcbiAgICBbNCwgXCJhc2NcIl0sXG4gIF07XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5OZXcgRGVncmVlIFJlcXVpcmVtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZWdyZWVyZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjc2VtZXN0ZXInKS52YWwobWVzc2FnZS5kYXRhLnNlbWVzdGVyKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZWxlY3RpdmVsaXN0Y291cnNlcy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFsxLCBcImFzY1wiXSxcbiAgXTtcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPkFkZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZWxlY3RpdmVsaXN0X2lkOiAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCksXG4gICAgICBjb3Vyc2VfcHJlZml4OiAkKCcjY291cnNlX3ByZWZpeCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWluX251bWJlciA9ICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWF4X251bWJlciA9ICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVlbGVjdGl2ZWNvdXJzZVwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpO1xuICB9KTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS52YWwoJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVjb3Vyc2UvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX3ByZWZpeCk7XG4gICAgICAgICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21pbl9udW1iZXIpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpO1xuICAgICAgICAgICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChcIlwiKTtcbiAgICAgICAgICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBlbGVjdGl2ZSBsaXN0IGNvdXJzZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgJCgnaW5wdXRbbmFtZT1yYW5nZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmFuZ2UyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZGV0YWlsLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9wbGFucmVxdWlyZW1lbnRzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnZWxlY3RpdmVsaXN0X2FiYnInfSxcbiAgICB7J2RhdGEnOiAnY3JlZGl0cyd9LFxuICAgIHsnZGF0YSc6ICdzZW1lc3Rlcid9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdub3Rlcyd9LFxuICAgIHsnZGF0YSc6ICdjYXRhbG9nX2NvdXJzZSd9LFxuICAgIHsnZGF0YSc6ICdjb21wbGV0ZWRfY291cnNlJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XTtcbiAgb3B0aW9ucy5vcmRlciA9IFtcbiAgICBbNCwgXCJhc2NcIl0sXG4gICAgWzUsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IFBsYW4gUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgLy9hZGRlZCBmb3IgbmV3IHNlbWVzdGVycyB0YWJsZVxuICB2YXIgb3B0aW9uczIgPSB7XG4gICAgXCJwYWdlTGVuZ3RoXCI6IDUwLFxuICAgIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxuICB9XG4gIG9wdGlvbnMyLmRvbSA9ICc8XCJuZXdidXR0b24yXCI+ZnJ0aXAnO1xuICBvcHRpb25zMi5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMyLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9uczIuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0c2VtXFxcIiBocmVmPVxcXCIvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyL1wiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dO1xuICBvcHRpb25zMi5vcmRlciA9IFtcbiAgICBbMiwgXCJhc2NcIl0sXG4gIF07XG4gICQoJyN0YWJsZXNlbScpLkRhdGFUYWJsZShvcHRpb25zMik7XG5cbiAgJChcImRpdi5uZXdidXR0b24yXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyBpZCArICdcIiBpZD1cIm5ldzJcIj5OZXcgU2VtZXN0ZXI8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgICAgY291cnNlX2lkX2xvY2s6ICQoJyNjb3Vyc2VfaWRsb2NrJykudmFsKCksXG4gICAgICBjb21wbGV0ZWRjb3Vyc2VfaWRfbG9jazogJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGxvY2snKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNzZW1lc3Rlcl9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLnNlbWVzdGVyX2lkID0gJCgnI3NlbWVzdGVyX2lkJykudmFsKCk7XG4gICAgfVxuICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAnJztcbiAgICB9XG4gICAgaWYoJCgnI2NvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmNvdXJzZV9pZCA9ICQoJyNjb3Vyc2VfaWQnKS52YWwoKTtcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGEuY291cnNlX2lkID0gJyc7XG4gICAgfVxuICAgIGlmKCQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgPSAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCA9ICcnO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFucmVxdWlyZW1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI3BsYW5yZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXBsYW5yZXF1aXJlbWVudFwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICB2YXIgcGxhbmlkID0gJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KCcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVycy8nICsgcGxhbmlkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHZhciBsaXN0aXRlbXMgPSAnJztcbiAgICAgICAgJC5lYWNoKG1lc3NhZ2UuZGF0YSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgbGlzdGl0ZW1zICs9ICc8b3B0aW9uIHZhbHVlPScgKyB2YWx1ZS5pZCArICc+JyArIHZhbHVlLm5hbWUgKyc8L29wdGlvbj4nO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCkuZW5kKCkuYXBwZW5kKGxpc3RpdGVtcyk7XG4gICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLnZhbChzZW1lc3Rlcl9pZCk7XG4gICAgICAgICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5yZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNvcmRlcmluZycpLnZhbChtZXNzYWdlLmRhdGEub3JkZXJpbmcpO1xuICAgICAgICAkKCcjY3JlZGl0cycpLnZhbChtZXNzYWdlLmRhdGEuY3JlZGl0cyk7XG4gICAgICAgICQoJyNub3RlcycpLnZhbChtZXNzYWdlLmRhdGEubm90ZXMpO1xuICAgICAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRfaWQnKS52YWwobWVzc2FnZS5kYXRhLmRlZ3JlZXJlcXVpcmVtZW50X2lkKTtcbiAgICAgICAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X25hbWUsIDMwKSk7XG4gICAgICAgICQoJyNjb3Vyc2VfaWQnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9pZCk7XG4gICAgICAgICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQobWVzc2FnZS5kYXRhLmNhdGFsb2dfY291cnNlLCAzMCkpO1xuICAgICAgICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZXNldCgnY291cnNlX2lkJywgbWVzc2FnZS5kYXRhLmNvdXJzZV9pZF9sb2NrKTtcbiAgICAgICAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbChtZXNzYWdlLmRhdGEuY29tcGxldGVkY291cnNlX2lkKTtcbiAgICAgICAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuY29tcGxldGVkX2NvdXJzZSwgMzApKTtcbiAgICAgICAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsIG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWRfbG9jayk7XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG5cbiAgICAgICAgdmFyIHNlbWVzdGVyX2lkID0gbWVzc2FnZS5kYXRhLnNlbWVzdGVyX2lkO1xuXG4gICAgICAgIC8vbG9hZCBzZW1lc3RlcnNcbiAgICAgICAgdmFyIHBsYW5pZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgICAgIHdpbmRvdy5heGlvcy5nZXQoJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXJzLycgKyBwbGFuaWQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICAgICB2YXIgbGlzdGl0ZW1zID0gJyc7XG4gICAgICAgICAgICAkLmVhY2gobWVzc2FnZS5kYXRhLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICAgICAgbGlzdGl0ZW1zICs9ICc8b3B0aW9uIHZhbHVlPScgKyB2YWx1ZS5pZCArICc+JyArIHZhbHVlLm5hbWUgKyc8L29wdGlvbj4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKS5lbmQoKS5hcHBlbmQobGlzdGl0ZW1zKTtcbiAgICAgICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLnZhbChzZW1lc3Rlcl9pZCk7XG4gICAgICAgICAgICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgc2VtZXN0ZXJzJywgJycsIGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSByZXF1aXJlbWVudCcsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICB9KTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZWxvY2soJ2NvdXJzZV9pZCcsICcvY291cnNlcy9jb3Vyc2VmZWVkJyk7XG5cbiAgdmFyIHN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZWxvY2soJ2NvbXBsZXRlZGNvdXJzZV9pZCcsICcvY29tcGxldGVkY291cnNlcy9jb21wbGV0ZWRjb3Vyc2VmZWVkLycgKyBzdHVkZW50X2lkKTtcbn07XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNzZW1lc3RlcicpLnZhbChcIlwiKTtcbiAgJCgnI29yZGVyaW5nJykudmFsKFwiXCIpO1xuICAkKCcjY3JlZGl0cycpLnZhbChcIlwiKTtcbiAgJCgnI25vdGVzJykudmFsKFwiXCIpO1xuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRfaWQnKS52YWwoXCJcIik7XG4gICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZXNldCgnY291cnNlX2lkJywgMCk7XG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlc2V0KCdjb21wbGV0ZWRjb3Vyc2VfaWQnLCAwKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwuanMiLCJ2YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xud2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIGRyYWdnYWJsZSA9IHJlcXVpcmUoJ3Z1ZWRyYWdnYWJsZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2Zsb3djaGFydCcsXG5cdFx0ZGF0YToge1xuICAgICAgc2VtZXN0ZXJzOiBbXSxcblx0XHR9LFxuICAgIG1ldGhvZHM6IHtcbiAgICAgIGVkaXRTZW1lc3RlcjogZWRpdFNlbWVzdGVyLFxuICAgICAgc2F2ZVNlbWVzdGVyOiBzYXZlU2VtZXN0ZXIsXG4gICAgICBkZWxldGVTZW1lc3RlcjogZGVsZXRlU2VtZXN0ZXIsXG4gICAgICBkcm9wU2VtZXN0ZXI6IGRyb3BTZW1lc3RlcixcbiAgICAgIGRyb3BDb3Vyc2U6IGRyb3BDb3Vyc2UsXG4gICAgICBlZGl0Q291cnNlOiBlZGl0Q291cnNlLFxuICAgIH0sXG4gICAgY29tcG9uZW50czoge1xuICAgICAgZHJhZ2dhYmxlLFxuICAgIH0sXG4gIH0pO1xuXG4gIGxvYWREYXRhKCk7XG5cbiAgJCgnI3Jlc2V0Jykub24oJ2NsaWNrJywgbG9hZERhdGEpO1xuICAkKCcjYWRkLXNlbScpLm9uKCdjbGljaycsIGFkZFNlbWVzdGVyKTtcbiAgJCgnI2FkZC1jb3Vyc2UnKS5vbignY2xpY2snLCBhZGRDb3Vyc2UpO1xuXG4gICQoJyNzYXZlQ291cnNlJykub24oJ2NsaWNrJywgc2F2ZUNvdXJzZSk7XG4gICQoJyNkZWxldGVDb3Vyc2UnKS5vbignY2xpY2snLCBkZWxldGVDb3Vyc2UpO1xuXG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcblxuICBzaXRlLmFqYXhhdXRvY29tcGxldGVsb2NrKCdjb3Vyc2VfaWQnLCAnL2NvdXJzZXMvY291cnNlZmVlZCcpO1xuXG4gIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlbG9jaygnY29tcGxldGVkY291cnNlX2lkJywgJy9jb21wbGV0ZWRjb3Vyc2VzL2NvbXBsZXRlZGNvdXJzZWZlZWQvJyArIHN0dWRlbnRfaWQpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIG9yZGVyaW5nXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBpdGVtXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBpdGVtXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLm9yZGVyaW5nID09IGIub3JkZXJpbmcpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5vcmRlcmluZyA8IGIub3JkZXJpbmcgPyAtMSA6IDEpO1xufVxuXG52YXIgbG9hZERhdGEgPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZClcbiAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMgPSByZXNwb25zZS5kYXRhO1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMuc29ydChzb3J0RnVuY3Rpb24pO1xuICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgICAgIHZhciBzZW1lc3RlciA9IHdpbmRvdy52bS5zZW1lc3RlcnMuZmluZChmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudC5pZCA9PSB2YWx1ZS5zZW1lc3Rlcl9pZDtcbiAgICAgICAgfSlcbiAgICAgICAgaWYodmFsdWUuZGVncmVlcmVxdWlyZW1lbnRfaWQgPD0gMCl7XG4gICAgICAgICAgdmFsdWUuY3VzdG9tID0gdHJ1ZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdmFsdWUuY3VzdG9tID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYodmFsdWUuY29tcGxldGVkY291cnNlX2lkIDw9IDApe1xuICAgICAgICAgIHZhbHVlLmNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHZhbHVlLmNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZW1lc3Rlci5jb3Vyc2VzLnB1c2godmFsdWUpO1xuICAgICAgfSk7XG4gICAgICAkLmVhY2god2luZG93LnZtLnNlbWVzdGVycywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICAgICAgdmFsdWUuY291cnNlcy5zb3J0KHNvcnRGdW5jdGlvbik7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdnZXQgZGF0YScsICcnLCBlcnJvcik7XG4gICAgfSk7XG4gIH0pXG4gIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgc2l0ZS5oYW5kbGVFcnJvcignZ2V0IGRhdGEnLCAnJywgZXJyb3IpO1xuICB9KTtcbn1cblxudmFyIGVkaXRTZW1lc3RlciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIHNlbWlkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuaGlkZSgpO1xufVxuXG52YXIgc2F2ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgdmFyIHNlbWlkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdpZCcpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBpZDogc2VtaWQsXG4gICAgbmFtZTogJChcIiNzZW0tdGV4dC1cIiArIHNlbWlkKS52YWwoKVxuICB9XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9zYXZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuaGlkZSgpO1xuICAgICAgJChcIiNzZW0tcGFuZWxoZWFkLVwiICsgc2VtaWQpLnNob3coKTtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRlbGV0ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gICAgaWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICB2YXIgc2VtaWQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogc2VtaWQsXG4gICAgfTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZCArICcvZGVsZXRlJywgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHdpbmRvdy52bS5zZW1lc3RlcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgIGlmKHdpbmRvdy52bS5zZW1lc3RlcnNbaV0uaWQgPT0gc2VtaWQpe1xuICAgICAgICAgICAgd2luZG93LnZtLnNlbWVzdGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICAgIH0pO1xuICB9XG59XG5cbnZhciBhZGRTZW1lc3RlciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgfTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL2FkZCcsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgd2luZG93LnZtLnNlbWVzdGVycy5wdXNoKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgLy9WdWUuc2V0KHdpbmRvdy52bS5zZW1lc3RlcnNbd2luZG93LnZtLnNlbWVzdGVyLmxlbmd0aCAtIDFdLCAnY291cnNlcycsIG5ldyBBcnJheSgpKTtcbiAgICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UoXCJJdGVtIFNhdmVkXCIsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZHJvcFNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgb3JkZXJpbmcgPSBbXTtcbiAgJC5lYWNoKHdpbmRvdy52bS5zZW1lc3RlcnMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgb3JkZXJpbmcucHVzaCh7XG4gICAgICBpZDogdmFsdWUuaWQsXG4gICAgfSk7XG4gIH0pO1xuICB2YXIgZGF0YSA9IHtcbiAgICBvcmRlcmluZzogb3JkZXJpbmcsXG4gIH1cbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9tb3ZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgIH0pXG59XG5cbnZhciBkcm9wQ291cnNlID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgb3JkZXJpbmcgPSBbXTtcbiAgdmFyIHRvU2VtSW5kZXggPSAkKGV2ZW50LnRvKS5kYXRhKCdpZCcpO1xuICAkLmVhY2god2luZG93LnZtLnNlbWVzdGVyc1t0b1NlbUluZGV4XS5jb3Vyc2VzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgIG9yZGVyaW5nLnB1c2goe1xuICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgIH0pO1xuICB9KTtcbiAgdmFyIGRhdGEgPSB7XG4gICAgc2VtZXN0ZXJfaWQ6IHdpbmRvdy52bS5zZW1lc3RlcnNbdG9TZW1JbmRleF0uaWQsXG4gICAgY291cnNlX2lkOiAkKGV2ZW50Lml0ZW0pLmRhdGEoJ2lkJyksXG4gICAgb3JkZXJpbmc6IG9yZGVyaW5nLFxuICB9XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL21vdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGVkaXRDb3Vyc2UgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBjb3Vyc2VJbmRleCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgdmFyIHNlbUluZGV4ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdzZW0nKTtcbiAgdmFyIGNvdXJzZSA9IHdpbmRvdy52bS5zZW1lc3RlcnNbc2VtSW5kZXhdLmNvdXJzZXNbY291cnNlSW5kZXhdO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoY291cnNlLm5hbWUpO1xuICAkKCcjY3JlZGl0cycpLnZhbChjb3Vyc2UuY3JlZGl0cyk7XG4gICQoJyNub3RlcycpLnZhbChjb3Vyc2Uubm90ZXMpO1xuICAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKGNvdXJzZS5pZCk7XG4gICQoJyNlbGVjdGxpdmVsaXN0X2lkJykudmFsKGNvdXJzZS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmVsZWN0aXZlbGlzdF9uYW1lLCAzMCkpO1xuICAkKCcjY291cnNlX2lkJykudmFsKGNvdXJzZS5jb3Vyc2VfaWQpO1xuICAkKCcjY291cnNlX2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmNvdXJzZV9uYW1lLCAzMCkpO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvdXJzZV9pZCcsIGNvdXJzZS5jb3Vyc2VfaWRfbG9jayk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoY291cnNlLmNvbXBsZXRlZGNvdXJzZV9pZCk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIGNvdXJzZS5jb21wbGV0ZWRjb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChjb3Vyc2UuY29tcGxldGVkY291cnNlX25hbWUsIDMwKSk7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZXNldCgnY29tcGxldGVkY291cnNlX2lkJywgY291cnNlLmNvbXBsZXRlZGNvdXJzZV9pZF9sb2NrKTtcbiAgaWYoY291cnNlLmRlZ3JlZXJlcXVpcmVtZW50X2lkIDw9IDApe1xuICAgICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICQoJyNjcmVkaXRzJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAkKCcjZGVsZXRlQ291cnNlJykuc2hvdygpO1xuICB9ZWxzZXtcbiAgICBpZihjb3Vyc2UuZWxlY3RpdmVsaXN0X2lkIDw9IDApe1xuICAgICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICB9ZWxzZXtcbiAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgIH1cbiAgICAkKCcjY3JlZGl0cycpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICQoJyNkZWxldGVDb3Vyc2UnKS5oaWRlKCk7XG4gIH1cblxuICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdzaG93Jyk7XG59XG5cbnZhciBzYXZlQ291cnNlID0gZnVuY3Rpb24oKXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgcGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gICAgY291cnNlX2lkX2xvY2s6ICQoJyNjb3Vyc2VfaWRsb2NrJykudmFsKCksXG4gICAgY29tcGxldGVkY291cnNlX2lkX2xvY2s6ICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRsb2NrJykudmFsKCksXG4gIH1cbiAgaWYoJCgnI2NvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgZGF0YS5jb3Vyc2VfaWQgPSAkKCcjY291cnNlX2lkJykudmFsKCk7XG4gIH1lbHNle1xuICAgIGRhdGEuY291cnNlX2lkID0gJyc7XG4gIH1cbiAgaWYoJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgPSAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCk7XG4gIH1lbHNle1xuICAgIGRhdGEuY29tcGxldGVkY291cnNlX2lkID0gJyc7XG4gIH1cbiAgaWYoJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpLmxlbmd0aCA+IDApe1xuICAgIGRhdGEucGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB9XG4gIGlmKCEkKCcjY291cnNlX25hbWUnKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgfVxuICBpZighJCgnI2NyZWRpdHMnKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGRhdGEuY3JlZGl0cyA9ICQoJyNjcmVkaXRzJykudmFsKCk7XG4gIH1cbiAgaWYoISQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykuaXMoJzpkaXNhYmxlZCcpKXtcbiAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAnJztcbiAgICB9XG4gIH1cbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL2RhdGEvJyArIGlkICsgJy9zYXZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgIGxvYWREYXRhKCk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKFwic2F2ZSBjb3Vyc2VcIiwgXCIjZWRpdENvdXJzZVwiLCBlcnJvcik7XG4gICAgfSk7XG5cbn1cblxudmFyIGRlbGV0ZUNvdXJzZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgcGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBwbGFucmVxdWlyZW1lbnRfaWQ6IHBsYW5yZXF1aXJlbWVudF9pZCxcbiAgfVxuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL2RlbGV0ZScsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJCgnI2VkaXRDb3Vyc2UnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICBsb2FkRGF0YSgpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcihcImRlbGV0ZSBjb3Vyc2VcIiwgXCIjZWRpdENvdXJzZVwiLCBlcnJvcik7XG4gICAgfSk7XG5cbn1cblxudmFyIGFkZENvdXJzZSA9IGZ1bmN0aW9uKCl7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgnJyk7XG4gICQoJyNjcmVkaXRzJykudmFsKCcnKTtcbiAgJCgnI25vdGVzJykudmFsKCcnKTtcbiAgJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGxpdmVsaXN0X2lkJykudmFsKDApO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyAwICsgXCIpIFwiKTtcbiAgJCgnI2NvdXJzZV9pZCcpLnZhbCgwKTtcbiAgJCgnI2NvdXJzZV9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgMCArIFwiKSBcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoMCk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIDAgKyBcIikgXCIpO1xuICAkKCcjY291cnNlX25hbWUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgJCgnI2NyZWRpdHMnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgJCgnI2RlbGV0ZUNvdXJzZScpLmhpZGUoKTtcbiAgJCgnI2VkaXRDb3Vyc2UnKS5tb2RhbCgnc2hvdycpO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvdXJzZV9pZCcsIDApO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsIDApO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydGxpc3QuanMiXSwic291cmNlUm9vdCI6IiJ9