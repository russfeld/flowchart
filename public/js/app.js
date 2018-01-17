webpackJsonp([1],{

/***/ 149:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

/***/ 150:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="/admin/newadvisor">New Advisor</a>');

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

/***/ 151:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

/***/ 152:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

/***/ 153:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 154:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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
    if ($('#course_id').val() > 0) {
      data.course_id = $('#course_id').val();
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

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');

  dashboard.ajaxautocomplete('course_id', '/courses/coursefeed');
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(156);
module.exports = __webpack_require__(200);


/***/ }),

/***/ 156:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(157);

var App = {

	// Controller-action methods
	actions: {
		//Index for directly created views with no explicit controller
		RootRouteController: {
			getIndex: function getIndex() {
				var editable = __webpack_require__(6);
				editable.init();
				var site = __webpack_require__(4);
				site.checkMessage();
			},
			getAbout: function getAbout() {
				var editable = __webpack_require__(6);
				editable.init();
				var site = __webpack_require__(4);
				site.checkMessage();
			}
		},

		//Advising Controller for routes at /advising
		AdvisingController: {
			//advising/index
			getIndex: function getIndex() {
				var calendar = __webpack_require__(189);
				calendar.init();
			}
		},

		//Groupsession Controller for routes at /groupsession
		GroupsessionController: {
			//groupsession/index
			getIndex: function getIndex() {
				var editable = __webpack_require__(6);
				editable.init();
				var site = __webpack_require__(4);
				site.checkMessage();
			},
			//groupsesion/list
			getList: function getList() {
				var groupsession = __webpack_require__(191);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(194);
				profile.init();
			}
		},

		//Dashboard Controller for routes at /admin-lte
		DashboardController: {
			//admin/index
			getIndex: function getIndex() {
				var dashboard = __webpack_require__(3);
				dashboard.init();
			},
			//admin/settings
			getSettings: function getSettings() {
				var settings = __webpack_require__(195);
				settings.init();
			},
			//admin/students
			getStudents: function getStudents() {
				var studentedit = __webpack_require__(149);
				studentedit.init();
			},
			//admin/newstudent
			getNewstudent: function getNewstudent() {
				var studentedit = __webpack_require__(149);
				studentedit.init();
			},
			//admin/advisors
			getAdvisors: function getAdvisors() {
				var advisoredit = __webpack_require__(150);
				advisoredit.init();
			},
			//admin/newadvisor
			getNewadvisor: function getNewadvisor() {
				var advisoredit = __webpack_require__(150);
				advisoredit.init();
			},
			//admin/departments
			getDepartments: function getDepartments() {
				var departmentedit = __webpack_require__(151);
				departmentedit.init();
			},
			//admin/newdepartment
			getNewdepartment: function getNewdepartment() {
				var departmentedit = __webpack_require__(151);
				departmentedit.init();
			},
			//admin/meetings
			getMeetings: function getMeetings() {
				var meetingedit = __webpack_require__(196);
				meetingedit.init();
			},
			//admin/blackouts
			getBlackouts: function getBlackouts() {
				var blackoutedit = __webpack_require__(197);
				blackoutedit.init();
			},
			//admin/groupsessions
			getGroupsessions: function getGroupsessions() {
				var groupsessionedit = __webpack_require__(198);
				groupsessionedit.init();
			},
			//admin/degreeprograms
			getDegreeprograms: function getDegreeprograms() {
				var degreeprogramedit = __webpack_require__(152);
				degreeprogramedit.init();
			},
			//admin/degreeprogram/{id}
			getDegreeprogramDetail: function getDegreeprogramDetail() {
				var degreeprogramedit = __webpack_require__(199);
				degreeprogramedit.init();
			},
			//admin/newdegreeprogram
			getNewdegreeprogram: function getNewdegreeprogram() {
				var degreeprogramedit = __webpack_require__(152);
				degreeprogramedit.init();
			},
			//admin/plans
			getPlans: function getPlans() {
				var planedit = __webpack_require__(153);
				planedit.init();
			},
			//admin/newplan
			getNewplan: function getNewplan() {
				var planedit = __webpack_require__(153);
				planedit.init();
			},
			//admin/completedcourses
			getCompletedcourses: function getCompletedcourses() {
				var completedcourseedit = __webpack_require__(154);
				completedcourseedit.init();
			},
			//admin/newcompletedcourse
			getNewcompletedcourse: function getNewcompletedcourse() {
				var completedcourseedit = __webpack_require__(154);
				completedcourseedit.init();
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

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {window._ = __webpack_require__(11);

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(1);

__webpack_require__(13);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(14);

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

/***/ 187:
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

/***/ 189:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required JS libraries
__webpack_require__(22);
__webpack_require__(9);
var moment = __webpack_require__(0);
var site = __webpack_require__(4);
__webpack_require__(142);
var editable = __webpack_require__(6);

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

/***/ 191:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {window.Vue = __webpack_require__(143);
var site = __webpack_require__(4);
var Echo = __webpack_require__(144);
__webpack_require__(145);

window.Pusher = __webpack_require__(146);

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

/***/ 194:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(4);

exports.init = function () {

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

/***/ 195:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);
var site = __webpack_require__(4);

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

/***/ 196:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

/***/ 197:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

/***/ 198:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);

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

/***/ 199:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(3);
var site = __webpack_require__(4);

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
        if ($('#course_id').val() > 0) {
          data.course_id = $('#course_id').val();
        }
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

  $('#delete').on('click', function () {});

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
        $('#course_id').val(message.data.course_id);
        $('#course_idtext').html("Selected: (" + message.data.course_id + ") " + message.data.course_name);
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

  dashboard.ajaxautocomplete('course_id', '/courses/coursefeed');
  dashboard.ajaxautocomplete('electivelist_id', 'electivelists/electivelistfeed');
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
  $('#course_id').val("-1");
  $('#course_idauto').val("");
  $('#electivelist_id').val("-1");
  $('#electivelist_idauto').val("");
  $('#requiredcourse').show();
  $('#electivecourse').hide();
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 200:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required libraries
var site = __webpack_require__(4);
__webpack_require__(147);
__webpack_require__(10);
__webpack_require__(148);
__webpack_require__(9);

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
 * @param id - the id of the item to be save-dev
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
    onSelect: function onSelect(suggestion) {
      $('#' + id).val(suggestion.data);
      $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + suggestion.value);
    },
    transformResult: function transformResult(response) {
      return {
        suggestions: $.map(response.data, function (dataItem) {
          return { value: dataItem.value, data: dataItem.data };
        })
      };
    }
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 4:
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {/**
 * Initialization function for editable text-boxes on the site
 * Must be called explicitly
 */
exports.init = function () {

  //Load required libraries
  __webpack_require__(5);
  __webpack_require__(187);
  __webpack_require__(21);

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

/***/ })

},[155]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZ3JvdXBzZXNzaW9uLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9tZWV0aW5nZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzcz82ZDEwIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIl0sIm5hbWVzIjpbImRhc2hib2FyZCIsInJlcXVpcmUiLCJleHBvcnRzIiwiaW5pdCIsIm9wdGlvbnMiLCJkYXRhVGFibGVPcHRpb25zIiwiZG9tIiwiJCIsImh0bWwiLCJvbiIsImRhdGEiLCJmaXJzdF9uYW1lIiwidmFsIiwibGFzdF9uYW1lIiwiZW1haWwiLCJhZHZpc29yX2lkIiwiZGVwYXJ0bWVudF9pZCIsImlkIiwiZWlkIiwibGVuZ3RoIiwidXJsIiwiYWpheHNhdmUiLCJyZXRVcmwiLCJhamF4ZGVsZXRlIiwiYWpheHJlc3RvcmUiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwiYXBwZW5kIiwiaXMiLCJmaWxlcyIsImRvY3VtZW50IiwiaW5wdXQiLCJudW1GaWxlcyIsImdldCIsImxhYmVsIiwicmVwbGFjZSIsInRyaWdnZXIiLCJldmVudCIsInBhcmVudHMiLCJmaW5kIiwibG9nIiwiYWxlcnQiLCJuYW1lIiwib2ZmaWNlIiwicGhvbmUiLCJhYmJyZXZpYXRpb24iLCJkZXNjcmlwdGlvbiIsImVmZmVjdGl2ZV95ZWFyIiwiZWZmZWN0aXZlX3NlbWVzdGVyIiwic3RhcnRfeWVhciIsInN0YXJ0X3NlbWVzdGVyIiwiZGVncmVlcHJvZ3JhbV9pZCIsInN0dWRlbnRfaWQiLCJhamF4YXV0b2NvbXBsZXRlIiwiY291cnNlbnVtYmVyIiwieWVhciIsInNlbWVzdGVyIiwiYmFzaXMiLCJncmFkZSIsImNyZWRpdHMiLCJjb3Vyc2VfaWQiLCJBcHAiLCJhY3Rpb25zIiwiUm9vdFJvdXRlQ29udHJvbGxlciIsImdldEluZGV4IiwiZWRpdGFibGUiLCJzaXRlIiwiY2hlY2tNZXNzYWdlIiwiZ2V0QWJvdXQiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJjYWxlbmRhciIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJnZXRMaXN0IiwiZ3JvdXBzZXNzaW9uIiwiUHJvZmlsZXNDb250cm9sbGVyIiwicHJvZmlsZSIsIkRhc2hib2FyZENvbnRyb2xsZXIiLCJnZXRTZXR0aW5ncyIsInNldHRpbmdzIiwiZ2V0U3R1ZGVudHMiLCJzdHVkZW50ZWRpdCIsImdldE5ld3N0dWRlbnQiLCJnZXRBZHZpc29ycyIsImFkdmlzb3JlZGl0IiwiZ2V0TmV3YWR2aXNvciIsImdldERlcGFydG1lbnRzIiwiZGVwYXJ0bWVudGVkaXQiLCJnZXROZXdkZXBhcnRtZW50IiwiZ2V0TWVldGluZ3MiLCJtZWV0aW5nZWRpdCIsImdldEJsYWNrb3V0cyIsImJsYWNrb3V0ZWRpdCIsImdldEdyb3Vwc2Vzc2lvbnMiLCJncm91cHNlc3Npb25lZGl0IiwiZ2V0RGVncmVlcHJvZ3JhbXMiLCJkZWdyZWVwcm9ncmFtZWRpdCIsImdldERlZ3JlZXByb2dyYW1EZXRhaWwiLCJnZXROZXdkZWdyZWVwcm9ncmFtIiwiZ2V0UGxhbnMiLCJwbGFuZWRpdCIsImdldE5ld3BsYW4iLCJnZXRDb21wbGV0ZWRjb3Vyc2VzIiwiY29tcGxldGVkY291cnNlZWRpdCIsImdldE5ld2NvbXBsZXRlZGNvdXJzZSIsImNvbnRyb2xsZXIiLCJhY3Rpb24iLCJ3aW5kb3ciLCJfIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImhlYWQiLCJxdWVyeVNlbGVjdG9yIiwiY29udGVudCIsImNvbnNvbGUiLCJlcnJvciIsIm1vbWVudCIsImNhbGVuZGFyU2Vzc2lvbiIsImNhbGVuZGFyQWR2aXNvcklEIiwiY2FsZW5kYXJTdHVkZW50TmFtZSIsImNhbGVuZGFyRGF0YSIsImhlYWRlciIsImxlZnQiLCJjZW50ZXIiLCJyaWdodCIsImV2ZW50TGltaXQiLCJoZWlnaHQiLCJ3ZWVrZW5kcyIsImJ1c2luZXNzSG91cnMiLCJzdGFydCIsImVuZCIsImRvdyIsImRlZmF1bHRWaWV3Iiwidmlld3MiLCJhZ2VuZGEiLCJhbGxEYXlTbG90Iiwic2xvdER1cmF0aW9uIiwibWluVGltZSIsIm1heFRpbWUiLCJldmVudFNvdXJjZXMiLCJ0eXBlIiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsInJlbmRlcmluZyIsInRpbWVGb3JtYXQiLCJkYXRlUGlja2VyRGF0YSIsImRheXNPZldlZWtEaXNhYmxlZCIsImZvcm1hdCIsInN0ZXBwaW5nIiwiZW5hYmxlZEhvdXJzIiwibWF4SG91ciIsInNpZGVCeVNpZGUiLCJpZ25vcmVSZWFkb25seSIsImFsbG93SW5wdXRUb2dnbGUiLCJkYXRlUGlja2VyRGF0ZU9ubHkiLCJhZHZpc29yIiwibm9iaW5kIiwidHJpbSIsIndpZHRoIiwiZm9jdXMiLCJwcm9wIiwicmVtb3ZlQ2xhc3MiLCJzaG93IiwicmVzZXRGb3JtIiwiYmluZCIsIm5ld1N0dWRlbnQiLCJoaWRlIiwicmVzZXQiLCJlYWNoIiwidGV4dCIsImxvYWRDb25mbGljdHMiLCJmdWxsQ2FsZW5kYXIiLCJhdXRvY29tcGxldGUiLCJzZXJ2aWNlVXJsIiwiYWpheFNldHRpbmdzIiwiZGF0YVR5cGUiLCJvblNlbGVjdCIsInN1Z2dlc3Rpb24iLCJ0cmFuc2Zvcm1SZXN1bHQiLCJyZXNwb25zZSIsInN1Z2dlc3Rpb25zIiwibWFwIiwiZGF0YUl0ZW0iLCJ2YWx1ZSIsImRhdGV0aW1lcGlja2VyIiwibGlua0RhdGVQaWNrZXJzIiwiZXZlbnRSZW5kZXIiLCJlbGVtZW50IiwiYWRkQ2xhc3MiLCJldmVudENsaWNrIiwidmlldyIsInN0dWRlbnRuYW1lIiwic2hvd01lZXRpbmdGb3JtIiwicmVwZWF0IiwiYmxhY2tvdXRTZXJpZXMiLCJtb2RhbCIsInNlbGVjdCIsImNoYW5nZSIsInJlcGVhdENoYW5nZSIsInNhdmVCbGFja291dCIsImRlbGV0ZUJsYWNrb3V0IiwiYmxhY2tvdXRPY2N1cnJlbmNlIiwib2ZmIiwiZSIsImNyZWF0ZU1lZXRpbmdGb3JtIiwiY3JlYXRlQmxhY2tvdXRGb3JtIiwicmVzb2x2ZUNvbmZsaWN0cyIsInRpdGxlIiwiaXNBZnRlciIsInN0dWRlbnRTZWxlY3QiLCJzYXZlTWVldGluZyIsImRlbGV0ZU1lZXRpbmciLCJjaGFuZ2VEdXJhdGlvbiIsInJlc2V0Q2FsZW5kYXIiLCJkaXNwbGF5TWVzc2FnZSIsImFqYXhTYXZlIiwicG9zdCIsInRoZW4iLCJjYXRjaCIsImhhbmRsZUVycm9yIiwiYWpheERlbGV0ZSIsIm5vUmVzZXQiLCJub0Nob2ljZSIsImNob2ljZSIsImNvbmZpcm0iLCJkZXNjIiwic3RhdHVzIiwibWVldGluZ2lkIiwic3R1ZGVudGlkIiwiZHVyYXRpb25PcHRpb25zIiwidW5kZWZpbmVkIiwiaG91ciIsIm1pbnV0ZSIsImNsZWFyRm9ybUVycm9ycyIsImVtcHR5IiwibWludXRlcyIsImRpZmYiLCJlbGVtMSIsImVsZW0yIiwiZHVyYXRpb24iLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJpbmRleCIsImFwcGVuZFRvIiwiYnN0YXJ0IiwiYmVuZCIsImJ0aXRsZSIsImJibGFja291dGV2ZW50aWQiLCJiYmxhY2tvdXRpZCIsImJyZXBlYXQiLCJicmVwZWF0ZXZlcnkiLCJicmVwZWF0dW50aWwiLCJicmVwZWF0d2Vla2RheXNtIiwiYnJlcGVhdHdlZWtkYXlzdCIsImJyZXBlYXR3ZWVrZGF5c3ciLCJicmVwZWF0d2Vla2RheXN1IiwiYnJlcGVhdHdlZWtkYXlzZiIsInBhcmFtcyIsImJsYWNrb3V0X2lkIiwicmVwZWF0X3R5cGUiLCJyZXBlYXRfZXZlcnkiLCJyZXBlYXRfdW50aWwiLCJyZXBlYXRfZGV0YWlsIiwiU3RyaW5nIiwiaW5kZXhPZiIsInByb21wdCIsIlZ1ZSIsIkVjaG8iLCJQdXNoZXIiLCJpb24iLCJzb3VuZCIsInNvdW5kcyIsInZvbHVtZSIsInBhdGgiLCJwcmVsb2FkIiwidXNlcklEIiwicGFyc2VJbnQiLCJncm91cFJlZ2lzdGVyQnRuIiwiZ3JvdXBEaXNhYmxlQnRuIiwidm0iLCJlbCIsInF1ZXVlIiwib25saW5lIiwibWV0aG9kcyIsImdldENsYXNzIiwicyIsInVzZXJpZCIsImluQXJyYXkiLCJ0YWtlU3R1ZGVudCIsImdpZCIsImN1cnJlbnRUYXJnZXQiLCJkYXRhc2V0IiwiYWpheFBvc3QiLCJwdXRTdHVkZW50IiwiZG9uZVN0dWRlbnQiLCJkZWxTdHVkZW50IiwiZW52IiwibG9nVG9Db25zb2xlIiwiYnJvYWRjYXN0ZXIiLCJrZXkiLCJwdXNoZXJLZXkiLCJjbHVzdGVyIiwicHVzaGVyQ2x1c3RlciIsImNvbm5lY3RvciIsInB1c2hlciIsImNvbm5lY3Rpb24iLCJjb25jYXQiLCJjaGVja0J1dHRvbnMiLCJpbml0aWFsQ2hlY2tEaW5nIiwic29ydCIsInNvcnRGdW5jdGlvbiIsImNoYW5uZWwiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImhyZWYiLCJqb2luIiwiaGVyZSIsInVzZXJzIiwibGVuIiwiaSIsInB1c2giLCJqb2luaW5nIiwidXNlciIsImxlYXZpbmciLCJzcGxpY2UiLCJmb3VuZCIsImNoZWNrRGluZyIsImZpbHRlciIsImRpc2FibGVCdXR0b24iLCJyZWFsbHkiLCJhdHRyIiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJmb3VuZE1lIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwibWVzc2FnZSIsImFqYXgiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwibm90ZXMiLCJvcmRlcmluZyIsInNlbGVjdGVkIiwic2VsZWN0ZWRWYWwiLCJlbGVjdGl2ZWxpc3RfaWQiLCJhamF4bW9kYWxzYXZlIiwic2hvd3NlbGVjdGVkIiwiY291cnNlX25hbWUiLCJlbGVjdGl2ZWxpc3RfbmFtZSIsIkRhdGFUYWJsZSIsInRvZ2dsZUNsYXNzIiwibG9hZHBpY3R1cmUiLCJyZWxvYWQiLCJzb2Z0IiwibWluQ2hhcnMiLCJzZXRUaW1lb3V0Iiwic2V0Rm9ybUVycm9ycyIsImpzb24iLCJjbGljayIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic3VtbWVybm90ZSIsInRvb2xiYXIiLCJ0YWJzaXplIiwiY29kZW1pcnJvciIsIm1vZGUiLCJodG1sTW9kZSIsImxpbmVOdW1iZXJzIiwidGhlbWUiLCJodG1sU3RyaW5nIiwiY29udGVudHMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQUlBLFlBQVksbUJBQUFDLENBQVEsQ0FBUixDQUFoQjs7QUFFQUMsUUFBUUMsSUFBUixHQUFlLFlBQVU7QUFDdkIsTUFBSUMsVUFBVUosVUFBVUssZ0JBQXhCO0FBQ0FELFVBQVFFLEdBQVIsR0FBYyxvQkFBZDtBQUNBTixZQUFVRyxJQUFWLENBQWVDLE9BQWY7O0FBRUFHLElBQUUsZUFBRixFQUFtQkMsSUFBbkIsQ0FBd0IsbUZBQXhCOztBQUVBRCxJQUFFLE9BQUYsRUFBV0UsRUFBWCxDQUFjLE9BQWQsRUFBdUIsWUFBVTtBQUMvQixRQUFJQyxPQUFPO0FBQ1RDLGtCQUFZSixFQUFFLGFBQUYsRUFBaUJLLEdBQWpCLEVBREg7QUFFVEMsaUJBQVdOLEVBQUUsWUFBRixFQUFnQkssR0FBaEIsRUFGRjtBQUdURSxhQUFPUCxFQUFFLFFBQUYsRUFBWUssR0FBWjtBQUhFLEtBQVg7QUFLQSxRQUFHTCxFQUFFLGFBQUYsRUFBaUJL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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsb0JBQW9CO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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YWlILElBQWIsQ0FBa0Isb0JBQW9CNU0sRUFBdEMsRUFBMEM7QUFDeENzWCxrQkFBVUQ7QUFEOEIsT0FBMUMsRUFHQ3hLLElBSEQsQ0FHTSxVQUFTdEMsUUFBVCxFQUFrQjtBQUN0QjtBQUNBK0ksaUJBQVM4QyxNQUFULENBQWdCLElBQWhCO0FBQ0QsT0FORCxFQU9DdEosS0FQRCxDQU9PLFVBQVMxRyxLQUFULEVBQWU7QUFDcEI1RSxjQUFNLDZCQUE2QjRFLE1BQU1tRSxRQUFOLENBQWU5SyxJQUFsRDtBQUNELE9BVEQ7QUFVRCxLQXhCRDtBQXlCRCxHQTFCRDs7QUE0QkE7QUFDQUgsSUFBRSxrQkFBRixFQUFzQnNLLElBQXRCLENBQTJCLFlBQVU7QUFDbkN0SyxNQUFFLElBQUYsRUFBUW9YLEtBQVIsQ0FBYyxVQUFTM0ssQ0FBVCxFQUFXO0FBQ3ZCQSxRQUFFNEssZUFBRjtBQUNBNUssUUFBRTZLLGNBQUY7O0FBRUE7QUFDQSxVQUFJNVcsS0FBS1YsRUFBRSxJQUFGLEVBQVFHLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQUgsUUFBRSxlQUFlVSxFQUFqQixFQUFxQjZXLFVBQXJCLENBQWdDLE9BQWhDO0FBQ0F2WCxRQUFFLGVBQWVVLEVBQWpCLEVBQXFCNlcsVUFBckIsQ0FBZ0MsU0FBaEM7O0FBRUE7QUFDQXZYLFFBQUUscUJBQXFCVSxFQUF2QixFQUEyQnFKLFdBQTNCLENBQXVDLFFBQXZDO0FBQ0EvSixRQUFFLG1CQUFtQlUsRUFBckIsRUFBeUJnTCxRQUF6QixDQUFrQyxRQUFsQztBQUNELEtBZEQ7QUFlRCxHQWhCRDtBQWlCRCxDQXRGRCxDIiwiZmlsZSI6Ii9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld3N0dWRlbnRcIj5OZXcgU3R1ZGVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuICAgICAgbGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjYWR2aXNvcl9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmFkdmlzb3JfaWQgPSAkKCcjYWR2aXNvcl9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmRlcGFydG1lbnRfaWQgPSAkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBkYXRhLmVpZCA9ICQoJyNlaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdzdHVkZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3N0dWRlbnRzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3Jlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2Fkdmlzb3JcIj5OZXcgQWR2aXNvcjwvYT4nKTtcblxuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuICAgIGZvcm1EYXRhLmFwcGVuZChcImhpZGRlblwiLCAkKCcjaGlkZGVuJykuaXMoJzpjaGVja2VkJykgPyAxIDogMCk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJkZXBhcnRtZW50X2lkXCIsICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2Fkdmlzb3InO1xuICAgIH1lbHNle1xuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZWlkXCIsICQoJyNlaWQnKS52YWwoKSk7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9hZHZpc29ycy8nICsgaWQ7XG4gICAgfVxuXHRcdGRhc2hib2FyZC5hamF4c2F2ZShmb3JtRGF0YSwgdXJsLCBpZCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlYWR2aXNvclwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9hZHZpc29yc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dCA9ICQodGhpcyksXG4gICAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG4gICAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuICAgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG4gIH0pO1xuXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0JyksXG4gICAgICAgICAgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZiggaW5wdXQubGVuZ3RoICkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiggbG9nICkgYWxlcnQobG9nKTtcbiAgICAgIH1cblxuICB9KTtcblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2RlcGFydG1lbnRcIj5OZXcgRGVwYXJ0bWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgICAgb2ZmaWNlOiAkKCcjb2ZmaWNlJykudmFsKCksXG4gICAgICBwaG9uZTogJCgnI3Bob25lJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZXBhcnRtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlcGFydG1lbnRzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWRlcGFydG1lbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVwYXJ0bWVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVwiPk5ldyBEZWdyZWUgUHJvZ3JhbTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfeWVhcjogJCgnI2VmZmVjdGl2ZV95ZWFyJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfc2VtZXN0ZXI6ICQoJyNlZmZlY3RpdmVfc2VtZXN0ZXInKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXByb2dyYW0nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVncmVlcHJvZ3JhbVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZWdyZWVwcm9ncmFtc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdwbGFuXCI+TmV3IFBsYW48L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIHN0YXJ0X3llYXI6ICQoJyNzdGFydF95ZWFyJykudmFsKCksXG4gICAgICBzdGFydF9zZW1lc3RlcjogJCgnI3N0YXJ0X3NlbWVzdGVyJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW4nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZVwiPk5ldyBDb21wbGV0ZWQgQ291cnNlPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGNvdXJzZW51bWJlcjogJCgnI2NvdXJzZW51bWJlcicpLnZhbCgpLFxuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIHllYXI6ICQoJyN5ZWFyJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBiYXNpczogJCgnI2Jhc2lzJykudmFsKCksXG4gICAgICBncmFkZTogJCgnI2dyYWRlJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjc3R1ZGVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLnN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICBpZigkKCcjY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuY291cnNlX2lkID0gJCgnI2NvdXJzZV9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2UnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vY29tcGxldGVkY291cnNlcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWNvbXBsZXRlZGNvdXJzZVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2NvdXJzZV9pZCcsICcvY291cnNlcy9jb3Vyc2VmZWVkJyk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwiLy9odHRwczovL2xhcmF2ZWwuY29tL2RvY3MvNS40L21peCN3b3JraW5nLXdpdGgtc2NyaXB0c1xuLy9odHRwczovL2FuZHktY2FydGVyLmNvbS9ibG9nL3Njb3BpbmctamF2YXNjcmlwdC1mdW5jdGlvbmFsaXR5LXRvLXNwZWNpZmljLXBhZ2VzLXdpdGgtbGFyYXZlbC1hbmQtY2FrZXBocFxuXG4vL0xvYWQgc2l0ZS13aWRlIGxpYnJhcmllcyBpbiBib290c3RyYXAgZmlsZVxucmVxdWlyZSgnLi9ib290c3RyYXAnKTtcblxudmFyIEFwcCA9IHtcblxuXHQvLyBDb250cm9sbGVyLWFjdGlvbiBtZXRob2RzXG5cdGFjdGlvbnM6IHtcblx0XHQvL0luZGV4IGZvciBkaXJlY3RseSBjcmVhdGVkIHZpZXdzIHdpdGggbm8gZXhwbGljaXQgY29udHJvbGxlclxuXHRcdFJvb3RSb3V0ZUNvbnRyb2xsZXI6IHtcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEFib3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcbiAgICB9LFxuXG5cdFx0Ly9BZHZpc2luZyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkdmlzaW5nXG5cdFx0QWR2aXNpbmdDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkdmlzaW5nL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vcGFnZXMvY2FsZW5kYXInKTtcblx0XHRcdFx0Y2FsZW5kYXIuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0dyb3Vwc2Vzc2lvbiBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2dyb3Vwc2Vzc2lvblxuICAgIEdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXI6IHtcblx0XHRcdC8vZ3JvdXBzZXNzaW9uL2luZGV4XG4gICAgICBnZXRJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcbiAgICAgIH0sXG5cdFx0XHQvL2dyb3Vwc2VzaW9uL2xpc3Rcblx0XHRcdGdldExpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uID0gcmVxdWlyZSgnLi9wYWdlcy9ncm91cHNlc3Npb24nKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdC8vUHJvZmlsZXMgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9wcm9maWxlXG5cdFx0UHJvZmlsZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL3Byb2ZpbGUvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHByb2ZpbGUgPSByZXF1aXJlKCcuL3BhZ2VzL3Byb2ZpbGUnKTtcblx0XHRcdFx0cHJvZmlsZS5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vRGFzaGJvYXJkIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWRtaW4tbHRlXG5cdFx0RGFzaGJvYXJkQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi91dGlsL2Rhc2hib2FyZCcpO1xuXHRcdFx0XHRkYXNoYm9hcmQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vc2V0dGluZ3Ncblx0XHRcdGdldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNldHRpbmdzID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MnKTtcblx0XHRcdFx0c2V0dGluZ3MuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vc3R1ZGVudHNcblx0XHRcdGdldFN0dWRlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3c3R1ZGVudFxuXHRcdFx0Z2V0TmV3c3R1ZGVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2Fkdmlzb3JzXG5cdFx0XHRnZXRBZHZpc29yczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhZHZpc29yZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0Jyk7XG5cdFx0XHRcdGFkdmlzb3JlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2Fkdmlzb3Jcblx0XHRcdGdldE5ld2Fkdmlzb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9kZXBhcnRtZW50c1xuXHRcdFx0Z2V0RGVwYXJ0bWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZXBhcnRtZW50XG5cdFx0XHRnZXROZXdkZXBhcnRtZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlcGFydG1lbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQnKTtcblx0XHRcdFx0ZGVwYXJ0bWVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbWVldGluZ3Ncblx0XHRcdGdldE1lZXRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1lZXRpbmdlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQnKTtcblx0XHRcdFx0bWVldGluZ2VkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vYmxhY2tvdXRzXG5cdFx0XHRnZXRCbGFja291dHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYmxhY2tvdXRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0Jyk7XG5cdFx0XHRcdGJsYWNrb3V0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9ncm91cHNlc3Npb25zXG5cdFx0XHRnZXRHcm91cHNlc3Npb25zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0Jyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbXNcblx0XHRcdGdldERlZ3JlZXByb2dyYW1zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtRGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXG5cdFx0XHRnZXROZXdkZWdyZWVwcm9ncmFtOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vcGxhbnNcblx0XHRcdGdldFBsYW5zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhblxuXHRcdFx0Z2V0TmV3cGxhbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0Jyk7XG5cdFx0XHRcdHBsYW5lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcblx0XHRcdGdldENvbXBsZXRlZGNvdXJzZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2Vcblx0XHRcdGdldE5ld2NvbXBsZXRlZGNvdXJzZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb21wbGV0ZWRjb3Vyc2VlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdCcpO1xuXHRcdFx0XHRjb21wbGV0ZWRjb3Vyc2VlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fVxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3aW5kb3cuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgalF1ZXJ5IGFuZCB0aGUgQm9vdHN0cmFwIGpRdWVyeSBwbHVnaW4gd2hpY2ggcHJvdmlkZXMgc3VwcG9ydFxuICogZm9yIEphdmFTY3JpcHQgYmFzZWQgQm9vdHN0cmFwIGZlYXR1cmVzIHN1Y2ggYXMgbW9kYWxzIGFuZCB0YWJzLiBUaGlzXG4gKiBjb2RlIG1heSBiZSBtb2RpZmllZCB0byBmaXQgdGhlIHNwZWNpZmljIG5lZWRzIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKi9cblxud2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgdGhlIGF4aW9zIEhUVFAgbGlicmFyeSB3aGljaCBhbGxvd3MgdXMgdG8gZWFzaWx5IGlzc3VlIHJlcXVlc3RzXG4gKiB0byBvdXIgTGFyYXZlbCBiYWNrLWVuZC4gVGhpcyBsaWJyYXJ5IGF1dG9tYXRpY2FsbHkgaGFuZGxlcyBzZW5kaW5nIHRoZVxuICogQ1NSRiB0b2tlbiBhcyBhIGhlYWRlciBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIFwiWFNSRlwiIHRva2VuIGNvb2tpZS5cbiAqL1xuXG53aW5kb3cuYXhpb3MgPSByZXF1aXJlKCdheGlvcycpO1xuXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9yYXBwYXNvZnQvbGFyYXZlbC01LWJvaWxlcnBsYXRlL2Jsb2IvbWFzdGVyL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzXG53aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbi8qKlxuICogTmV4dCB3ZSB3aWxsIHJlZ2lzdGVyIHRoZSBDU1JGIFRva2VuIGFzIGEgY29tbW9uIGhlYWRlciB3aXRoIEF4aW9zIHNvIHRoYXRcbiAqIGFsbCBvdXRnb2luZyBIVFRQIHJlcXVlc3RzIGF1dG9tYXRpY2FsbHkgaGF2ZSBpdCBhdHRhY2hlZC4gVGhpcyBpcyBqdXN0XG4gKiBhIHNpbXBsZSBjb252ZW5pZW5jZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGF0dGFjaCBldmVyeSB0b2tlbiBtYW51YWxseS5cbiAqL1xuXG5sZXQgdG9rZW4gPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKTtcblxuaWYgKHRva2VuKSB7XG4gICAgd2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUNTUkYtVE9LRU4nXSA9IHRva2VuLmNvbnRlbnQ7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NTUkYgdG9rZW4gbm90IGZvdW5kOiBodHRwczovL2xhcmF2ZWwuY29tL2RvY3MvY3NyZiNjc3JmLXgtY3NyZi10b2tlbicpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTg3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8vbG9hZCByZXF1aXJlZCBKUyBsaWJyYXJpZXNcbnJlcXVpcmUoJ2Z1bGxjYWxlbmRhcicpO1xucmVxdWlyZSgnZGV2YnJpZGdlLWF1dG9jb21wbGV0ZScpO1xudmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2VvbmFzZGFuLWJvb3RzdHJhcC1kYXRldGltZXBpY2tlci1ydXNzZmVsZCcpO1xudmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi4vdXRpbC9lZGl0YWJsZScpO1xuXG4vL1Nlc3Npb24gZm9yIHN0b3JpbmcgZGF0YSBiZXR3ZWVuIGZvcm1zXG5leHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXG4vL0lEIG9mIHRoZSBjdXJyZW50bHkgbG9hZGVkIGNhbGVuZGFyJ3MgYWR2aXNvclxuZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9IC0xO1xuXG4vL1N0dWRlbnQncyBOYW1lIHNldCBieSBpbml0XG5leHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSBcIlwiO1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG5leHBvcnRzLmNhbGVuZGFyRGF0YSA9IHtcblx0aGVhZGVyOiB7XG5cdFx0bGVmdDogJ3ByZXYsbmV4dCB0b2RheScsXG5cdFx0Y2VudGVyOiAndGl0bGUnLFxuXHRcdHJpZ2h0OiAnYWdlbmRhV2VlayxhZ2VuZGFEYXknXG5cdH0sXG5cdGVkaXRhYmxlOiBmYWxzZSxcblx0ZXZlbnRMaW1pdDogdHJ1ZSxcblx0aGVpZ2h0OiAnYXV0bycsXG5cdHdlZWtlbmRzOiBmYWxzZSxcblx0YnVzaW5lc3NIb3Vyczoge1xuXHRcdHN0YXJ0OiAnODowMCcsIC8vIGEgc3RhcnQgdGltZSAoMTBhbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZW5kOiAnMTc6MDAnLCAvLyBhbiBlbmQgdGltZSAoNnBtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRkb3c6IFsgMSwgMiwgMywgNCwgNSBdXG5cdH0sXG5cdGRlZmF1bHRWaWV3OiAnYWdlbmRhV2VlaycsXG5cdHZpZXdzOiB7XG5cdFx0YWdlbmRhOiB7XG5cdFx0XHRhbGxEYXlTbG90OiBmYWxzZSxcblx0XHRcdHNsb3REdXJhdGlvbjogJzAwOjIwOjAwJyxcblx0XHRcdG1pblRpbWU6ICcwODowMDowMCcsXG5cdFx0XHRtYXhUaW1lOiAnMTc6MDA6MDAnXG5cdFx0fVxuXHR9LFxuXHRldmVudFNvdXJjZXM6IFtcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvbWVldGluZ2ZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBtZWV0aW5nIGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjNTEyODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ3doaXRlJyxcblx0XHR9LFxuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9ibGFja291dGZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBibGFja291dCBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnI0ZGODg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICdibGFjaycsXG5cdFx0fSxcblx0XSxcblx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0c2VsZWN0SGVscGVyOiB0cnVlLFxuXHRzZWxlY3RPdmVybGFwOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHJldHVybiBldmVudC5yZW5kZXJpbmcgPT09ICdiYWNrZ3JvdW5kJztcblx0fSxcblx0dGltZUZvcm1hdDogJyAnLFxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2VcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGEgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTExMJyxcblx0XHRzdGVwcGluZzogMjAsXG5cdFx0ZW5hYmxlZEhvdXJzOiBbOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3XSxcblx0XHRtYXhIb3VyOiAxNyxcblx0XHRzaWRlQnlTaWRlOiB0cnVlLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlIGRheSBvbmx5XG5leHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdNTS9ERC9ZWVlZJyxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vKipcbiAqIEluaXRpYWx6YXRpb24gZnVuY3Rpb24gZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSBhZHZpc29yIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSB1c2VyIGlzIGFuIGFkdmlzb3JcbiAqIEBwYXJhbSBub2JpbmQgLSBib29sZWFuIHRydWUgaWYgdGhlIGJ1dHRvbnMgc2hvdWxkIG5vdCBiZSBib3VuZCAobWFrZSBjYWxlbmRhciByZWFkLW9ubHkpXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gZnJvbSBhIHByZXZpb3VzIGFjdGlvblxuXHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG5cdC8vaW5pdGFsaXplIGVkaXRhYmxlIGVsZW1lbnRzXG5cdGVkaXRhYmxlLmluaXQoKTtcblxuXHQvL3R3ZWFrIHBhcmFtZXRlcnNcblx0d2luZG93LmFkdmlzb3IgfHwgKHdpbmRvdy5hZHZpc29yID0gZmFsc2UpO1xuXHR3aW5kb3cubm9iaW5kIHx8ICh3aW5kb3cubm9iaW5kID0gZmFsc2UpO1xuXG5cdC8vZ2V0IHRoZSBjdXJyZW50IGFkdmlzb3IncyBJRFxuXHRleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gJCgnI2NhbGVuZGFyQWR2aXNvcklEJykudmFsKCkudHJpbSgpO1xuXG5cdC8vU2V0IHRoZSBhZHZpc29yIGluZm9ybWF0aW9uIGZvciBtZWV0aW5nIGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMF0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9TZXQgdGhlIGFkdnNpb3IgaW5mb3JhbXRpb24gZm9yIGJsYWNrb3V0IGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9pZiB0aGUgd2luZG93IGlzIHNtYWxsLCBzZXQgZGlmZmVyZW50IGRlZmF1bHQgZm9yIGNhbGVuZGFyXG5cdGlmKCQod2luZG93KS53aWR0aCgpIDwgNjAwKXtcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5kZWZhdWx0VmlldyA9ICdhZ2VuZGFEYXknO1xuXHR9XG5cblx0Ly9JZiBub2JpbmQsIGRvbid0IGJpbmQgdGhlIGZvcm1zXG5cdGlmKCF3aW5kb3cubm9iaW5kKXtcblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgYW4gYWR2aXNvciwgYmluZCBtb3JlIGRhdGFcblx0XHRpZih3aW5kb3cuYWR2aXNvcil7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyN0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0X3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI2VuZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI2VuZF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5zaG93KCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2Jykuc2hvdygpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuXHRcdFx0Ly9iaW5kIG1ldGhvZHMgZm9yIGJ1dHRvbnMgYW5kIGZvcm1zXG5cdFx0XHQkKCcjbmV3U3R1ZGVudEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgbmV3U3R1ZGVudCk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2J0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRcdFx0ICAgICQodGhpcykuZmluZCgnLmhhcy1lcnJvcicpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS50ZXh0KCcnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vYmluZCBhdXRvY29tcGxldGUgZmllbGRcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5hdXRvY29tcGxldGUoe1xuXHRcdFx0ICAgIHNlcnZpY2VVcmw6ICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcsXG5cdFx0XHQgICAgYWpheFNldHRpbmdzOiB7XG5cdFx0XHQgICAgXHRkYXRhVHlwZTogXCJqc29uXCJcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuXHRcdFx0ICAgICAgICAkKCcjc3R1ZGVudGlkdmFsJykudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHQgICAgICAgIHJldHVybiB7XG5cdFx0XHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0XHRcdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0XHRcdCAgICAgICAgICAgIH0pXG5cdFx0XHQgICAgICAgIH07XG5cdFx0XHQgICAgfVxuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjc3RhcnQnLCAnI2VuZCcsICcjZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNic3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjYmVuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNic3RhcnQnLCAnI2JlbmQnLCAnI2JkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JyZXBlYXR1bnRpbF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkpO1xuXG5cdFx0XHQvL2NoYW5nZSByZW5kZXJpbmcgb2YgZXZlbnRzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHRcdFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWNsaWNrYWJsZVwiKTtcblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdtJyl7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZCcpLnZhbChldmVudC5zdHVkZW50bmFtZSk7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdFx0ZXZlbnQ6IGV2ZW50XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZihldmVudC5yZXBlYXQgPT0gJzAnKXtcblx0XHRcdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0XHRcdGVuZDogZW5kXG5cdFx0XHRcdH07XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdH07XG5cblx0XHRcdC8vYmluZCBtb3JlIGJ1dHRvbnNcblx0XHRcdCQoJyNicmVwZWF0JykuY2hhbmdlKHJlcGVhdENoYW5nZSk7XG5cblx0XHRcdCQoJyNzYXZlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVCbGFja291dCk7XG5cblx0XHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRTZXJpZXMnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0T2NjdXJyZW5jZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRPY2N1cnJlbmNlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2FkdmlzaW5nQnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9mZignaGlkZGVuLmJzLm1vZGFsJyk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlTWVldGluZ0J0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXRCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdFx0JCgnI3Jlc29sdmVCdXR0b24nKS5vbignY2xpY2snLCByZXNvbHZlQ29uZmxpY3RzKTtcblxuXHRcdFx0bG9hZENvbmZsaWN0cygpO1xuXG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIG5vdCBhbiBhZHZpc29yLCBiaW5kIGxlc3MgZGF0YVxuXHRcdH1lbHNle1xuXG5cdFx0XHQvL0dldCB0aGUgY3VycmVudCBzdHVkZW50J3MgbmFtZVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gJCgnI2NhbGVuZGFyU3R1ZGVudE5hbWUnKS52YWwoKS50cmltKCk7XG5cblx0XHQgIC8vUmVuZGVyIGJsYWNrb3V0cyB0byBiYWNrZ3JvdW5kXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuXG5cdFx0ICAvL1doZW4gcmVuZGVyaW5nLCB1c2UgdGhpcyBjdXN0b20gZnVuY3Rpb24gZm9yIGJsYWNrb3V0cyBhbmQgc3R1ZGVudCBtZWV0aW5nc1xuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdFx0ICAgIH1cblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0XHQgICAgfVxuXHRcdFx0fTtcblxuXHRcdCAgLy9Vc2UgdGhpcyBtZXRob2QgZm9yIGNsaWNraW5nIG9uIG1lZXRpbmdzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0XHRcdFx0aWYoZXZlbnQuc3RhcnQuaXNBZnRlcihtb21lbnQoKSkpe1xuXHRcdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KFwiWW91IGNhbm5vdCBlZGl0IG1lZXRpbmdzIGluIHRoZSBwYXN0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdCAgLy9XaGVuIHNlbGVjdGluZyBuZXcgYXJlYXMsIHVzZSB0aGUgc3R1ZGVudFNlbGVjdCBtZXRob2QgaW4gdGhlIGNhbGVuZGFyIGxpYnJhcnlcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IHN0dWRlbnRTZWxlY3Q7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNkZXNjJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0XCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JChcIiNlbmRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjZW5kX3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJy5tb2RhbCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXHRcdH1cblxuXHRcdC8vQmluZCBjbGljayBoYW5kbGVycyBvbiB0aGUgZm9ybVxuXHRcdCQoJyNzYXZlQnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlTWVldGluZyk7XG5cdFx0JCgnI2RlbGV0ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlTWVldGluZyk7XG5cdFx0JCgnI2R1cmF0aW9uJykub24oJ2NoYW5nZScsIGNoYW5nZUR1cmF0aW9uKTtcblxuXHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzIHdpdGggbm8gYmluZGluZ1xuXHR9ZWxzZXtcblx0XHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzLCBzZXQgcmVuZGVyaW5nIHRvIGJhY2tncm91bmRcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdGFibGUgPSBmYWxzZTtcblxuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdCAgICB9XG5cdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0ICAgIH1cblx0XHR9O1xuXHR9XG5cblx0Ly9pbml0YWxpemUgdGhlIGNhbGVuZGFyIVxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoZXhwb3J0cy5jYWxlbmRhckRhdGEpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGNhbGVuZGFyIGJ5IGNsb3NpbmcgbW9kYWxzIGFuZCByZWxvYWRpbmcgZGF0YVxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBmb3JtIHRvIGhpZGUgKGFuZCB0aGUgc3BpbilcbiAqIEBwYXJhbSByZXBvbnNlIC0gdGhlIEF4aW9zIHJlcHNvbnNlIG9iamVjdCByZWNlaXZlZFxuICovXG52YXIgcmVzZXRDYWxlbmRhciA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlc3BvbnNlKXtcblx0Ly9oaWRlIHRoZSBmb3JtXG5cdCQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2Rpc3BsYXkgdGhlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcblx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cblx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRpZih3aW5kb3cuYWR2aXNvcil7XG5cdFx0bG9hZENvbmZsaWN0cygpO1xuXHR9XG59XG5cbi8qKlxuICogQUpBWCBtZXRob2QgdG8gc2F2ZSBkYXRhIGZyb20gYSBmb3JtXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgc291cmNlIGVsZW1lbnQgb2YgdGhlIGRhdGFcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhTYXZlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24pe1xuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHQgIC8vaWYgcmVzcG9uc2UgaXMgMnh4XG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0fSlcblx0XHQvL2lmIHJlc3BvbnNlIGlzIG5vdCAyeHhcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHR9KTtcbn1cblxudmFyIGFqYXhEZWxldGUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbiwgbm9SZXNldCwgbm9DaG9pY2Upe1xuXHQvL2NoZWNrIG5vUmVzZXQgdmFyaWFibGVcblx0bm9SZXNldCB8fCAobm9SZXNldCA9IGZhbHNlKTtcblx0bm9DaG9pY2UgfHwgKG5vQ2hvaWNlID0gZmFsc2UpO1xuXG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBjb25maXJtYXRpb25cblx0aWYoIW5vQ2hvaWNlKXtcblx0XHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdH1lbHNle1xuXHRcdHZhciBjaG9pY2UgPSB0cnVlO1xuXHR9XG5cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblxuXHRcdC8vaWYgY29uZmlybWVkLCBzaG93IHNwaW5uaW5nIGljb25cblx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vbWFrZSBBSkFYIHJlcXVlc3QgdG8gZGVsZXRlXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihub1Jlc2V0KXtcblx0XHRcdFx0XHQvL2hpZGUgcGFyZW50IGVsZW1lbnQgLSBUT0RPIFRFU1RNRVxuXHRcdFx0XHRcdC8vY2FsbGVyLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIGEgbWVldGluZ1xuICovXG52YXIgc2F2ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlRXZlbnRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0c3RhcnQ6IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0ZW5kOiBtb21lbnQoJCgnI2VuZCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHR0aXRsZTogJCgnI3RpdGxlJykudmFsKCksXG5cdFx0ZGVzYzogJCgnI2Rlc2MnKS52YWwoKSxcblx0XHRzdGF0dXM6ICQoJyNzdGF0dXMnKS52YWwoKVxuXHR9O1xuXHRkYXRhLmlkID0gZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRDtcblx0aWYoJCgnI21lZXRpbmdJRCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5tZWV0aW5naWQgPSAkKCcjbWVldGluZ0lEJykudmFsKCk7XG5cdH1cblx0aWYoJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5zdHVkZW50aWQgPSAkKCcjc3R1ZGVudGlkdmFsJykudmFsKCk7XG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlbWVldGluZyc7XG5cblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdzYXZlIG1lZXRpbmcnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGEgbWVldGluZ1xuICovXG52YXIgZGVsZXRlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCB1cmxcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiAkKCcjbWVldGluZ0lEJykudmFsKClcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdkZWxldGUgbWVldGluZycsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcG9wdWxhdGUgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgZWRpdGluZ1xuICpcbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byBlZGl0XG4gKi9cbnZhciBzaG93TWVldGluZ0Zvcm0gPSBmdW5jdGlvbihldmVudCl7XG5cdCQoJyN0aXRsZScpLnZhbChldmVudC50aXRsZSk7XG5cdCQoJyNzdGFydCcpLnZhbChldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZW5kJykudmFsKGV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZGVzYycpLnZhbChldmVudC5kZXNjKTtcblx0ZHVyYXRpb25PcHRpb25zKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpO1xuXHQkKCcjbWVldGluZ0lEJykudmFsKGV2ZW50LmlkKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0JCgnI3N0YXR1cycpLnZhbChldmVudC5zdGF0dXMpO1xuXHQkKCcjZGVsZXRlQnV0dG9uJykuc2hvdygpO1xuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBjcmVhdGlvblxuICpcbiAqIEBwYXJhbSBjYWxlbmRhclN0dWRlbnROYW1lIC0gc3RyaW5nIG5hbWUgb2YgdGhlIHN0dWRlbnRcbiAqL1xudmFyIGNyZWF0ZU1lZXRpbmdGb3JtID0gZnVuY3Rpb24oY2FsZW5kYXJTdHVkZW50TmFtZSl7XG5cblx0Ly9wb3B1bGF0ZSB0aGUgdGl0bGUgYXV0b21hdGljYWxseSBmb3IgYSBzdHVkZW50XG5cdGlmKGNhbGVuZGFyU3R1ZGVudE5hbWUgIT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3RpdGxlJykudmFsKGNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9ZWxzZXtcblx0XHQkKCcjdGl0bGUnKS52YWwoJycpO1xuXHR9XG5cblx0Ly9TZXQgc3RhcnQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjc3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZW5kIHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNlbmQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMjApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZHVyYXRpb24gb3B0aW9uc1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHRkdXJhdGlvbk9wdGlvbnMobW9tZW50KCkuaG91cig4KS5taW51dGUoMCksIG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKSk7XG5cdH1lbHNle1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCwgZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kKTtcblx0fVxuXG5cdC8vUmVzZXQgb3RoZXIgb3B0aW9uc1xuXHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0Ly9IaWRlIGRlbGV0ZSBidXR0b25cblx0JCgnI2RlbGV0ZUJ1dHRvbicpLmhpZGUoKTtcblxuXHQvL1Nob3cgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSBvbiB0aGlzIHBhZ2VcbiAqL1xudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNldCBkdXJhdGlvbiBvcHRpb25zIGZvciB0aGUgbWVldGluZyBmb3JtXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZVxuICogQHBhcmFtIGVuZCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZGluZyB0aW1lXG4gKi9cbnZhciBkdXJhdGlvbk9wdGlvbnMgPSBmdW5jdGlvbihzdGFydCwgZW5kKXtcblx0Ly9jbGVhciB0aGUgbGlzdFxuXHQkKCcjZHVyYXRpb24nKS5lbXB0eSgpO1xuXG5cdC8vYXNzdW1lIGFsbCBtZWV0aW5ncyBoYXZlIHJvb20gZm9yIDIwIG1pbnV0ZXNcblx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nMjAnPjIwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MjAsIGFsbG93IDQwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDIwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNDAnPjQwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDowMCwgYWxsb3cgNjAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzYwJz42MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9zZXQgZGVmYXVsdCB2YWx1ZSBiYXNlZCBvbiBnaXZlbiBzcGFuXG5cdCQoJyNkdXJhdGlvbicpLnZhbChlbmQuZGlmZihzdGFydCwgXCJtaW51dGVzXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbGluayB0aGUgZGF0ZXBpY2tlcnMgdG9nZXRoZXJcbiAqXG4gKiBAcGFyYW0gZWxlbTEgLSBqUXVlcnkgb2JqZWN0IGZvciBmaXJzdCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZWxlbTIgLSBqUXVlcnkgb2JqZWN0IGZvciBzZWNvbmQgZGF0ZXBpY2tlclxuICogQHBhcmFtIGR1cmF0aW9uIC0gZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGxpbmtEYXRlUGlja2VycyA9IGZ1bmN0aW9uKGVsZW0xLCBlbGVtMiwgZHVyYXRpb24pe1xuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBmaXJzdCBkYXRhcGlja2VyXG5cdCQoZWxlbTEgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUyID0gbW9tZW50KCQoZWxlbTIpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQWZ0ZXIoZGF0ZTIpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTIpKXtcblx0XHRcdGRhdGUyID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0yKS52YWwoZGF0ZTIuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIHNlY29uZCBkYXRlcGlja2VyXG5cdCQoZWxlbTIgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUxID0gbW9tZW50KCQoZWxlbTEpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQmVmb3JlKGRhdGUxKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUxKSl7XG5cdFx0XHRkYXRlMSA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMSkudmFsKGRhdGUxLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgY2hhbmdlRHVyYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgbmV3RGF0ZSA9IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgJ0xMTCcpLmFkZCgkKHRoaXMpLnZhbCgpLCBcIm1pbnV0ZXNcIik7XG5cdCQoJyNlbmQnKS52YWwobmV3RGF0ZS5mb3JtYXQoXCJMTExcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2ZXJpZnkgdGhhdCB0aGUgc3R1ZGVudHMgYXJlIHNlbGVjdGluZyBtZWV0aW5ncyB0aGF0IGFyZW4ndCB0b28gbG9uZ1xuICpcbiAqIEBwYXJhbSBzdGFydCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCBvZiB0aGUgbWVldGluZ1xuICogQHBhcmFtIGVuZCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmQgb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIHN0dWRlbnRTZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cblx0Ly9XaGVuIHN0dWRlbnRzIHNlbGVjdCBhIG1lZXRpbmcsIGRpZmYgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXNcblx0aWYoZW5kLmRpZmYoc3RhcnQsICdtaW51dGVzJykgPiA2MCl7XG5cblx0XHQvL2lmIGludmFsaWQsIHVuc2VsZWN0IGFuZCBzaG93IGFuIGVycm9yXG5cdFx0YWxlcnQoXCJNZWV0aW5ncyBjYW5ub3QgbGFzdCBsb25nZXIgdGhhbiAxIGhvdXJcIik7XG5cdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHR9ZWxzZXtcblxuXHRcdC8vaWYgdmFsaWQsIHNldCBkYXRhIGluIHRoZSBzZXNzaW9uIGFuZCBzaG93IHRoZSBmb3JtXG5cdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRlbmQ6IGVuZFxuXHRcdH07XG5cdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0Y3JlYXRlTWVldGluZ0Zvcm0oZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBMb2FkIGNvbmZsaWN0aW5nIG1lZXRpbmdzIGZyb20gdGhlIHNlcnZlclxuICovXG52YXIgbG9hZENvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9yZXF1ZXN0IGNvbmZsaWN0cyB2aWEgQUpBWFxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvYWR2aXNpbmcvY29uZmxpY3RzJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdC8vZGlzYWJsZSBleGlzdGluZyBjbGljayBoYW5kbGVyc1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0Ly9JZiByZXNwb25zZSBpcyAyMDAsIGRhdGEgd2FzIHJlY2VpdmVkXG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gMjAwKXtcblxuXHRcdFx0XHQvL0FwcGVuZCBIVE1MIGZvciBjb25mbGljdHMgdG8gRE9NXG5cdFx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpLmVtcHR5KCk7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdCQoJzxkaXYvPicsIHtcblx0XHRcdFx0XHRcdCdpZCcgOiAncmVzb2x2ZScrdmFsdWUuaWQsXG5cdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RWRpdDwvYnV0dG9uPiAnICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0IHJlc29sdmVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPktlZXAgTWVldGluZzwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZScrdmFsdWUuaWQrJ3NwaW5cIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0fSkuYXBwZW5kVG8oJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvL1JlLXJlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHRcdC8vU2hvdyB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cblx0XHQgIC8vSWYgcmVzcG9uc2UgaXMgMjA0LCBubyBjb25mbGljdHMgYXJlIHByZXNlbnRcblx0XHRcdH1lbHNlIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQpe1xuXG5cdFx0XHRcdC8vSGlkZSB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gcmV0cmlldmUgY29uZmxpY3RpbmcgbWVldGluZ3M6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fSk7XG59XG5cbi8qKlxuICogU2F2ZSBibGFja291dHMgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgc2F2ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUJsYWNrb3V0c3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgdXJsO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRic3RhcnQ6IG1vbWVudCgkKCcjYnN0YXJ0JykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRiZW5kOiBtb21lbnQoJCgnI2JlbmQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJ0aXRsZTogJCgnI2J0aXRsZScpLnZhbCgpXG5cdH07XG5cdHZhciB1cmw7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEuYmJsYWNrb3V0ZXZlbnRpZCA9ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCk7XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXQnO1xuXHRcdGlmKCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpID4gMCl7XG5cdFx0XHRkYXRhLmJibGFja291dGlkID0gJCgnI2JibGFja291dGlkJykudmFsKCk7XG5cdFx0fVxuXHRcdGRhdGEuYnJlcGVhdCA9ICQoJyNicmVwZWF0JykudmFsKCk7XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAxKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5PSAkKCcjYnJlcGVhdGRhaWx5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAyKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5ID0gJCgnI2JyZXBlYXR3ZWVrbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzbSA9ICQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN0ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3cgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdSA9ICQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNmID0gJCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdzYXZlIGJsYWNrb3V0Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBibGFja291dCBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBkZWxldGVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBVUkwgYW5kIGRhdGEgb2JqZWN0XG5cdHZhciB1cmwsIGRhdGE7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGV2ZW50aWQ6ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgfTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0aWQ6ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpIH07XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ2RlbGV0ZSBibGFja291dCcsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBjaGFuZ2Ugb2YgcmVwZWF0IG9wdGlvbnMgb24gdGhlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIHJlcGVhdENoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQodGhpcykudmFsKCkgPT0gMCl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDEpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAyKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1cbn07XG5cbi8qKlxuICogU2hvdyB0aGUgcmVzb2x2ZSBjb25mbGljdHMgbW9kYWwgZm9ybVxuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZGVsZXRlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdC8vc2VuZCBBSkFYIGRlbGV0ZVxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAnZGVsZXRlIG1lZXRpbmcnLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBFZGl0IGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGVkaXRDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvbWVldGluZyc7XG5cblx0Ly9zaG93IHNwaW5uZXIgdG8gbG9hZCBtZWV0aW5nXG5cdCQoJyNyZXNvbHZlJysgaWQgKyAnc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2xvYWQgbWVldGluZyBhbmQgZGlzcGxheSBmb3JtXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNyZXNvbHZlJysgaWQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0ZXZlbnQgPSByZXNwb25zZS5kYXRhO1xuXHRcdFx0ZXZlbnQuc3RhcnQgPSBtb21lbnQoZXZlbnQuc3RhcnQpO1xuXHRcdFx0ZXZlbnQuZW5kID0gbW9tZW50KGV2ZW50LmVuZCk7XG5cdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIG1lZXRpbmcnLCAnI3Jlc29sdmUnICsgaWQsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogUmVzb2x2ZSBhIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIHJlc29sdmVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvcmVzb2x2ZWNvbmZsaWN0JztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAncmVzb2x2ZSBtZWV0aW5nJywgdHJ1ZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgY3JlYXRlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIGNyZWF0ZUJsYWNrb3V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNidGl0bGUnKS52YWwoXCJcIik7XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KCkuaG91cig5KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCQoJyNicmVwZWF0JykudmFsKDApO1xuXHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5oaWRlKCk7XG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIHRvIGEgc2luZ2xlIG9jY3VycmVuY2VcbiAqL1xudmFyIGJsYWNrb3V0T2NjdXJyZW5jZSA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vc2V0IGZvcm0gdmFsdWVzIGFuZCBoaWRlIHVubmVlZGVkIGZpZWxkc1xuXHQkKCcjYnRpdGxlJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnRpdGxlKTtcblx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI3JlcGVhdGRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZCk7XG5cdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmlkKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXG5cdC8vc2hvdyB0aGUgZm9ybVxuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgYmxhY2tvdXQgc2VyaWVzIGVkaXQgZm9ybVxuICovXG52YXIgYmxhY2tvdXRTZXJpZXMgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cbiBcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0aWQ6IGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvYmxhY2tvdXQnO1xuXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNidGl0bGUnKS52YWwocmVzcG9uc2UuZGF0YS50aXRsZSlcblx0IFx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnN0YXJ0LCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLmVuZCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwocmVzcG9uc2UuZGF0YS5pZCk7XG5cdCBcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHQgXHRcdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0IFx0XHRpZihyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDEpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXRkYWlseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fWVsc2UgaWYgKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMil7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdFx0XHRcdHZhciByZXBlYXRfZGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLmRhdGEucmVwZWF0X2RldGFpbCk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMlwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiM1wiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNFwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fVxuXHQgXHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblx0IFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGJsYWNrb3V0IHNlcmllcycsICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBzdHVkZW50IGluIHRoZSBkYXRhYmFzZVxuICovXG52YXIgbmV3U3R1ZGVudCA9IGZ1bmN0aW9uKCl7XG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBhbiBlSUQgdG8gYWRkIHRvIHRoZSBzeXN0ZW1cblx0dmFyIGVpZCA9IHByb21wdChcIkVudGVyIHRoZSBzdHVkZW50J3MgZUlEXCIpO1xuXG5cdC8vYnVpbGQgdGhlIFVSTCBhbmQgZGF0YVxuXHR2YXIgZGF0YSA9IHtcblx0XHRlaWQ6IGVpZCxcblx0fTtcblx0dmFyIHVybCA9ICcvcHJvZmlsZS9uZXdzdHVkZW50JztcblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRhbGVydChyZXNwb25zZS5kYXRhKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdFx0XHRpZihlcnJvci5yZXNwb25zZS5zdGF0dXMgPT0gNDIyKXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhW1wiZWlkXCJdKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnZhciBFY2hvID0gcmVxdWlyZSgnbGFyYXZlbC1lY2hvJyk7XG5yZXF1aXJlKCdpb24tc291bmQnKTtcblxud2luZG93LlB1c2hlciA9IHJlcXVpcmUoJ3B1c2hlci1qcycpO1xuXG4vKipcbiAqIEdyb3Vwc2Vzc2lvbiBpbml0IGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IHRvIHN0YXJ0XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9sb2FkIGlvbi1zb3VuZCBsaWJyYXJ5XG5cdGlvbi5zb3VuZCh7XG4gICAgc291bmRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwiZG9vcl9iZWxsXCJcbiAgICAgICAgfSxcbiAgICBdLFxuICAgIHZvbHVtZTogMS4wLFxuICAgIHBhdGg6IFwiL3NvdW5kcy9cIixcbiAgICBwcmVsb2FkOiB0cnVlXG5cdH0pO1xuXG5cdC8vZ2V0IHVzZXJJRCBhbmQgaXNBZHZpc29yIHZhcmlhYmxlc1xuXHR3aW5kb3cudXNlcklEID0gcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKTtcblxuXHQvL3JlZ2lzdGVyIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLm9uKCdjbGljaycsIGdyb3VwUmVnaXN0ZXJCdG4pO1xuXG5cdC8vZGlzYWJsZSBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwRGlzYWJsZUJ0bicpLm9uKCdjbGljaycsIGdyb3VwRGlzYWJsZUJ0bik7XG5cblx0Ly9yZW5kZXIgVnVlIEFwcFxuXHR3aW5kb3cudm0gPSBuZXcgVnVlKHtcblx0XHRlbDogJyNncm91cExpc3QnLFxuXHRcdGRhdGE6IHtcblx0XHRcdHF1ZXVlOiBbXSxcblx0XHRcdGFkdmlzb3I6IHBhcnNlSW50KCQoJyNpc0Fkdmlzb3InKS52YWwoKSkgPT0gMSxcblx0XHRcdHVzZXJJRDogcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKSxcblx0XHRcdG9ubGluZTogW10sXG5cdFx0fSxcblx0XHRtZXRob2RzOiB7XG5cdFx0XHQvL0Z1bmN0aW9uIHRvIGdldCBDU1MgY2xhc3NlcyBmb3IgYSBzdHVkZW50IG9iamVjdFxuXHRcdFx0Z2V0Q2xhc3M6IGZ1bmN0aW9uKHMpe1xuXHRcdFx0XHRyZXR1cm57XG5cdFx0XHRcdFx0J2FsZXJ0LWluZm8nOiBzLnN0YXR1cyA9PSAwIHx8IHMuc3RhdHVzID09IDEsXG5cdFx0XHRcdFx0J2FsZXJ0LXN1Y2Nlc3MnOiBzLnN0YXR1cyA9PSAyLFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tbWUnOiBzLnVzZXJpZCA9PSB0aGlzLnVzZXJJRCxcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW9mZmxpbmUnOiAkLmluQXJyYXkocy51c2VyaWQsIHRoaXMub25saW5lKSA9PSAtMSxcblx0XHRcdFx0fTtcblx0XHRcdH0sXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHRha2UgYSBzdHVkZW50IGZyb20gdGhlIGxpc3Rcblx0XHRcdHRha2VTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vdGFrZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAndGFrZScpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly9mdW5jdGlvbiB0byBwdXQgYSBzdHVkZW50IGJhY2sgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdFxuXHRcdFx0cHV0U3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3B1dCdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAncHV0Jyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvLyBmdW5jdGlvbiB0byBtYXJrIGEgc3R1ZGVudCBkb25lIG9uIHRoZSBsaXN0XG5cdFx0XHRkb25lU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RvbmUnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ21hcmsgZG9uZScpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly9mdW5jdGlvbiB0byBkZWxldGUgYSBzdHVkZW50IGZyb20gdGhlIGxpc3Rcblx0XHRcdGRlbFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kZWxldGUnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ2RlbGV0ZScpO1xuXHRcdFx0fSxcblx0XHR9LFxuXHR9KVxuXG5cblx0Ly9FbmFibGUgUHVzaGVyIGxvZ2dpbmdcblx0aWYod2luZG93LmVudiA9PSBcImxvY2FsXCIgfHwgd2luZG93LmVudiA9PSBcInN0YWdpbmdcIil7XG5cdFx0Y29uc29sZS5sb2coXCJQdXNoZXIgbG9nZ2luZyBlbmFibGVkIVwiKTtcblx0XHRQdXNoZXIubG9nVG9Db25zb2xlID0gdHJ1ZTtcblx0fVxuXG5cdC8vTG9hZCB0aGUgRWNobyBpbnN0YW5jZSBvbiB0aGUgd2luZG93XG5cdHdpbmRvdy5FY2hvID0gbmV3IEVjaG8oe1xuXHRcdGJyb2FkY2FzdGVyOiAncHVzaGVyJyxcblx0XHRrZXk6IHdpbmRvdy5wdXNoZXJLZXksXG5cdFx0Y2x1c3Rlcjogd2luZG93LnB1c2hlckNsdXN0ZXIsXG5cdH0pO1xuXG5cdC8vQmluZCB0byB0aGUgY29ubmVjdGVkIGFjdGlvbiBvbiBQdXNoZXIgKGNhbGxlZCB3aGVuIGNvbm5lY3RlZClcblx0d2luZG93LkVjaG8uY29ubmVjdG9yLnB1c2hlci5jb25uZWN0aW9uLmJpbmQoJ2Nvbm5lY3RlZCcsIGZ1bmN0aW9uKCl7XG5cdFx0Ly93aGVuIGNvbm5lY3RlZCwgZGlzYWJsZSB0aGUgc3Bpbm5lclxuXHRcdCQoJyNncm91cHNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL0xvYWQgdGhlIGluaXRpYWwgc3R1ZGVudCBxdWV1ZSB2aWEgQUpBWFxuXHRcdHdpbmRvdy5heGlvcy5nZXQoJy9ncm91cHNlc3Npb24vcXVldWUnKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHR3aW5kb3cudm0ucXVldWUgPSB3aW5kb3cudm0ucXVldWUuY29uY2F0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRjaGVja0J1dHRvbnMod2luZG93LnZtLnF1ZXVlKTtcblx0XHRcdFx0aW5pdGlhbENoZWNrRGluZyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHR3aW5kb3cudm0ucXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBxdWV1ZScsICcnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSlcblxuXHQvL0Nvbm5lY3QgdG8gdGhlIGdyb3Vwc2Vzc2lvbiBjaGFubmVsXG5cdC8qXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbicpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZGF0YSkgPT4ge1xuXG5cdFx0fSk7XG4gKi9cblxuXHQvL0Nvbm5lY3QgdG8gdGhlIGdyb3Vwc2Vzc2lvbmVuZCBjaGFubmVsXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbmVuZCcpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uRW5kJywgKGUpID0+IHtcblxuXHRcdFx0Ly9pZiBlbmRpbmcsIHJlZGlyZWN0IGJhY2sgdG8gaG9tZSBwYWdlXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2dyb3Vwc2Vzc2lvblwiO1xuXHR9KTtcblxuXHR3aW5kb3cuRWNoby5qb2luKCdwcmVzZW5jZScpXG5cdFx0LmhlcmUoKHVzZXJzKSA9PiB7XG5cdFx0XHR2YXIgbGVuID0gdXNlcnMubGVuZ3RoO1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0d2luZG93LnZtLm9ubGluZS5wdXNoKHVzZXJzW2ldLmlkKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5qb2luaW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlci5pZCk7XG5cdFx0fSlcblx0XHQubGVhdmluZygodXNlcikgPT4ge1xuXHRcdFx0d2luZG93LnZtLm9ubGluZS5zcGxpY2UoICQuaW5BcnJheSh1c2VyLmlkLCB3aW5kb3cudm0ub25saW5lKSwgMSk7XG5cdFx0fSlcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cdFx0XHR2YXIgcXVldWUgPSB3aW5kb3cudm0ucXVldWU7XG5cdFx0XHR2YXIgZm91bmQgPSBmYWxzZTtcblx0XHRcdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cblx0XHRcdC8vdXBkYXRlIHRoZSBxdWV1ZSBiYXNlZCBvbiByZXNwb25zZVxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0aWYocXVldWVbaV0uaWQgPT09IGRhdGEuaWQpe1xuXHRcdFx0XHRcdGlmKGRhdGEuc3RhdHVzIDwgMyl7XG5cdFx0XHRcdFx0XHRxdWV1ZVtpXSA9IGRhdGE7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRxdWV1ZS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0XHRsZW4tLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vaWYgZWxlbWVudCBub3QgZm91bmQgb24gY3VycmVudCBxdWV1ZSwgcHVzaCBpdCBvbiB0byB0aGUgcXVldWVcblx0XHRcdGlmKCFmb3VuZCl7XG5cdFx0XHRcdHF1ZXVlLnB1c2goZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vY2hlY2sgdG8gc2VlIGlmIGN1cnJlbnQgdXNlciBpcyBvbiBxdWV1ZSBiZWZvcmUgZW5hYmxpbmcgYnV0dG9uXG5cdFx0XHRjaGVja0J1dHRvbnMocXVldWUpO1xuXG5cdFx0XHQvL2lmIGN1cnJlbnQgdXNlciBpcyBmb3VuZCwgY2hlY2sgZm9yIHN0YXR1cyB1cGRhdGUgdG8gcGxheSBzb3VuZFxuXHRcdFx0aWYoZGF0YS51c2VyaWQgPT09IHVzZXJJRCl7XG5cdFx0XHRcdGNoZWNrRGluZyhkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9zb3J0IHRoZSBxdWV1ZSBjb3JyZWN0bHlcblx0XHRcdHF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblxuXHRcdFx0Ly91cGRhdGUgVnVlIHN0YXRlLCBtaWdodCBiZSB1bm5lY2Vzc2FyeVxuXHRcdFx0d2luZG93LnZtLnF1ZXVlID0gcXVldWU7XG5cdFx0fSk7XG5cbn07XG5cblxuLyoqXG4gKiBWdWUgZmlsdGVyIGZvciBzdGF0dXMgdGV4dFxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIHN0dWRlbnQgdG8gcmVuZGVyXG4gKi9cblZ1ZS5maWx0ZXIoJ3N0YXR1c3RleHQnLCBmdW5jdGlvbihkYXRhKXtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDApIHJldHVybiBcIk5FV1wiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMSkgcmV0dXJuIFwiUVVFVUVEXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAyKSByZXR1cm4gXCJNRUVUIFdJVEggXCIgKyBkYXRhLmFkdmlzb3I7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAzKSByZXR1cm4gXCJERUxBWVwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNCkgcmV0dXJuIFwiQUJTRU5UXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA1KSByZXR1cm4gXCJET05FXCI7XG59KTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgY2xpY2tpbmcgb24gdGhlIHJlZ2lzdGVyIGJ1dHRvblxuICovXG52YXIgZ3JvdXBSZWdpc3RlckJ0biA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3JlZ2lzdGVyJztcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCB7fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdGRpc2FibGVCdXR0b24oKTtcblx0XHRcdCQoJyNncm91cHNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmVnaXN0ZXInLCAnI2dyb3VwJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgYWR2aXNvcnMgdG8gZGlzYWJsZSBncm91cHNlc3Npb25cbiAqL1xudmFyIGdyb3VwRGlzYWJsZUJ0biA9IGZ1bmN0aW9uKCl7XG5cdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblx0XHR2YXIgcmVhbGx5ID0gY29uZmlybShcIlNlcmlvdXNseSwgdGhpcyB3aWxsIGxvc2UgYWxsIGN1cnJlbnQgZGF0YS4gQXJlIHlvdSByZWFsbHkgc3VyZT9cIik7XG5cdFx0aWYocmVhbGx5ID09PSB0cnVlKXtcblx0XHRcdC8vdGhpcyBpcyBhIGJpdCBoYWNreSwgYnV0IGl0IHdvcmtzXG5cdFx0XHR2YXIgdG9rZW4gPSAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpO1xuXHRcdFx0JCgnPGZvcm0gYWN0aW9uPVwiL2dyb3Vwc2Vzc2lvbi9kaXNhYmxlXCIgbWV0aG9kPVwiUE9TVFwiLz4nKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImlkXCIgdmFsdWU9XCInICsgd2luZG93LnVzZXJJRCArICdcIj4nKSlcblx0XHRcdFx0LmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJfdG9rZW5cIiB2YWx1ZT1cIicgKyB0b2tlbiArICdcIj4nKSlcblx0XHRcdFx0LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpIC8vaXQgaGFzIHRvIGJlIGFkZGVkIHNvbWV3aGVyZSBpbnRvIHRoZSA8Ym9keT5cblx0XHRcdFx0LnN1Ym1pdCgpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGVuYWJsZSByZWdpc3RyYXRpb24gYnV0dG9uXG4gKi9cbnZhciBlbmFibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGlzYWJsZSByZWdpc3RyYXRpb24gYnV0dG9uXG4gKi9cbnZhciBkaXNhYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGFuZCBzZWUgaWYgdXNlciBpcyBvbiB0aGUgbGlzdCAtIGlmIG5vdCwgZG9uJ3QgZW5hYmxlIGJ1dHRvblxuICovXG52YXIgY2hlY2tCdXR0b25zID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHR2YXIgZm91bmRNZSA9IGZhbHNlO1xuXG5cdC8vaXRlcmF0ZSB0aHJvdWdoIHVzZXJzIG9uIGxpc3QsIGxvb2tpbmcgZm9yIGN1cnJlbnQgdXNlclxuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gd2luZG93LnVzZXJJRCl7XG5cdFx0XHRmb3VuZE1lID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8vaWYgZm91bmQsIGRpc2FibGUgYnV0dG9uOyBpZiBub3QsIGVuYWJsZSBidXR0b25cblx0aWYoZm91bmRNZSl7XG5cdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHR9ZWxzZXtcblx0XHRlbmFibGVCdXR0b24oKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGJlY2tvbmVkLCBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcGVyc29uIC0gdGhlIGN1cnJlbnQgdXNlciB0byBjaGVja1xuICovXG52YXIgY2hlY2tEaW5nID0gZnVuY3Rpb24ocGVyc29uKXtcblx0aWYocGVyc29uLnN0YXR1cyA9PSAyKXtcblx0XHRpb24uc291bmQucGxheShcImRvb3JfYmVsbFwiKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBwZXJzb24gaGFzIGJlZW4gYmVja29uZWQgb24gbG9hZDsgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHF1ZXVlIC0gdGhlIGluaXRpYWwgcXVldWUgb2YgdXNlcnMgbG9hZGVkXG4gKi9cbnZhciBpbml0aWFsQ2hlY2tEaW5nID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gd2luZG93LnVzZXJJRCl7XG5cdFx0XHRjaGVja0RpbmcocXVldWVbaV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHNvcnQgZWxlbWVudHMgYmFzZWQgb24gdGhlaXIgc3RhdHVzXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBwZXJzb25cbiAqIEBwYXJhbSBiIC0gc2Vjb25kIHBlcnNvblxuICogQHJldHVybiAtIHNvcnRpbmcgdmFsdWUgaW5kaWNhdGluZyB3aG8gc2hvdWxkIGdvIGZpcnN0X25hbWVcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLnN0YXR1cyA9PSBiLnN0YXR1cyl7XG5cdFx0cmV0dXJuIChhLmlkIDwgYi5pZCA/IC0xIDogMSk7XG5cdH1cblx0cmV0dXJuIChhLnN0YXR1cyA8IGIuc3RhdHVzID8gMSA6IC0xKTtcbn1cblxuXG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIG1ha2luZyBBSkFYIFBPU1QgcmVxdWVzdHNcbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmliaW5nIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhQb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBhY3Rpb24pe1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ2YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZVByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Zmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcblx0XHRcdGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuXHRcdH07XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0Ly9zZW5kIEFKQVggcG9zdFxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3IgYWR2aXNvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZUFkdmlzb3JQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHQvL1RPRE8gVEVTVE1FXG5cdFx0dmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRkYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0ZGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdCQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdFx0JCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdC8vaHR0cDovL3d3dy5hYmVhdXRpZnVsc2l0ZS5uZXQvd2hpcHBpbmctZmlsZS1pbnB1dHMtaW50by1zaGFwZS13aXRoLWJvb3RzdHJhcC0zL1xuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuXHQgIHZhciBpbnB1dCA9ICQodGhpcyksXG5cdCAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG5cdCAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuXHQgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG5cdH0pO1xuXG5cdC8vYmluZCB0byBmaWxlc2VsZWN0IGJ1dHRvblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpO1xuXHRcdFx0dmFyIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgICBpZihsb2cpe1xuXHRcdFx0XHRcdFx0YWxlcnQobG9nKTtcblx0XHRcdFx0XHR9XG4gICAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgLy9sb2FkIGN1c3RvbSBidXR0b24gb24gdGhlIGRvbVxuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgLy9iaW5kIHNldHRpbmdzIGJ1dHRvbnNcbiAgJCgnLnNldHRpbmdzYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgIH07XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vc2F2ZXNldHRpbmcnO1xuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9iaW5kIG5ldyBzZXR0aW5nIGJ1dHRvblxuICAkKCcjbmV3c2V0dGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IHByb21wdChcIkVudGVyIGEgbmFtZSBmb3IgdGhlIG5ldyBzZXR0aW5nOlwiKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogY2hvaWNlLFxuICAgIH07XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL25ld3NldHRpbmdcIlxuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignY3JlYXRlJywgJycsIGVycm9yKVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZW1lZXRpbmdcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vbWVldGluZ3NcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9tZWV0aW5nZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVibGFja291dFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ibGFja291dHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAvLyQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVncm91cHNlc3Npb25cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZ3JvdXBzZXNzaW9uc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2RlZ3JlZXByb2dyYW1yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IERlZ3JlZSBSZXF1aXJlbWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgb3JkZXJpbmc6ICQoJyNvcmRlcmluZycpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGlmKCQoJyNjb3Vyc2VfaWQnKS52YWwoKSA+IDApe1xuICAgICAgICAgICAgZGF0YS5jb3Vyc2VfaWQgPSAkKCcjY291cnNlX2lkJykudmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZWdyZWVyZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cbiAgfSk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjc2VtZXN0ZXInKS52YWwobWVzc2FnZS5kYXRhLnNlbWVzdGVyKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9pZCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX2lkKTtcbiAgICAgICAgICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmNvdXJzZV9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2NvdXJzZV9pZCcsICcvY291cnNlcy9jb3Vyc2VmZWVkJyk7XG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAyMDBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLy9sb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2FkbWluLWx0ZScpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQnKTtcbnJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0LWJzJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG5cbi8vb3B0aW9ucyBmb3IgZGF0YXRhYmxlc1xuZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zID0ge1xuICBcInBhZ2VMZW5ndGhcIjogNTAsXG4gIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxufVxuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IG9uIGFsbCBkYXRhdGFibGVzIHBhZ2VzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBjdXN0b20gZGF0YXRhYmxlcyBvcHRpb25zXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICBvcHRpb25zIHx8IChvcHRpb25zID0gZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zKTtcbiAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKG9wdGlvbnMpO1xuICBzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG4gICQoJyNhZG1pbmx0ZS10b2dnbGVtZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ3NpZGViYXItb3BlbicpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBpZCAtIHRoZSBpZCBvZiB0aGUgaXRlbSB0byBiZSBzYXZlLWRldlxuICogQHBhcmFtIGxvYWRwaWN0dXJlIC0gdHJ1ZSB0byByZWxvYWQgYSBwcm9maWxlIHBpY3R1cmVcbiAqL1xuZXhwb3J0cy5hamF4c2F2ZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgaWQsIGxvYWRwaWN0dXJlKXtcbiAgbG9hZHBpY3R1cmUgfHwgKGxvYWRwaWN0dXJlID0gZmFsc2UpO1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJlc3BvbnNlLmRhdGEpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgICBpZihsb2FkcGljdHVyZSkgZXhwb3J0cy5sb2FkcGljdHVyZShpZCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gc2F2ZSB2aWEgQUpBWCBvbiBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBpZCAtIHRoZSBpZCBvZiB0aGUgaXRlbSB0byBiZSBzYXZlLWRldlxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgcGljdHVyZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSB1c2VyIElEIG9mIHRoZSBwaWN0dXJlIHRvIHJlbG9hZFxuICovXG5leHBvcnRzLmxvYWRwaWN0dXJlID0gZnVuY3Rpb24oaWQpe1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgJCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuICAgIH0pXG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG8gYWZ0ZXIgZGVsZXRlXG4gKiBAcGFyYW0gc29mdCAtIGJvb2xlYW4gaWYgdGhpcyBpcyBhIHNvZnQgZGVsZXRlIG9yIG5vdFxuICovXG5leHBvcnRzLmFqYXhkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCByZXRVcmwsIHNvZnQgPSBmYWxzZSl7XG4gIGlmKHNvZnQpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgfWVsc2V7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlbGF0ZWQgcmVjb3Jkcy4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgfVxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzdG9yZSBhIHNvZnQtZGVsZXRlZCBpdGVtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgaXRlbSB0byBiZSByZXN0b3JlZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGF0IGluZm9ybWF0aW9uIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG9cbiAqL1xuZXhwb3J0cy5hamF4cmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgcmV0VXJsKXtcbiAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmV0VXJsKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXN0b3JlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYXV0b2NvbXBsZXRlIGEgZmllbGRcbiAqXG4gKiBAcGFyYW0gaWQgLSB0aGUgSUQgb2YgdGhlIGZpZWxkXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byByZXF1ZXN0IGRhdGEgZnJvbVxuICovXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGUgPSBmdW5jdGlvbihpZCwgdXJsKXtcbiAgJCgnIycgKyBpZCArICdhdXRvJykuYXV0b2NvbXBsZXRlKHtcblx0ICAgIHNlcnZpY2VVcmw6IHVybCxcblx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHQgICAgXHRkYXRhVHlwZTogXCJqc29uXCJcblx0ICAgIH0sXG4gICAgICBtaW5DaGFyczogMyxcblx0ICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuXHQgICAgICAgICQoJyMnICsgaWQpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuICAgICAgICAgICQoJyMnICsgaWQgKyAndGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgc3VnZ2VzdGlvbi5kYXRhICsgXCIpIFwiICsgc3VnZ2VzdGlvbi52YWx1ZSk7XG5cdCAgICB9LFxuXHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgfTtcblx0ICAgIH1cblx0fSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZGFzaGJvYXJkLmpzIiwiLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmxhc2hlZCBzZXNzaW9uIGRhdGFcbiAqXG4gKiB1c2UgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCdtZXNzYWdlJywgdHJhbnMoJ21lc3NhZ2VzLml0ZW1fc2F2ZWQnKSk7XG4gKiAgICAgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCd0eXBlJywgJ3N1Y2Nlc3MnKTtcbiAqIHRvIHNldCBtZXNzYWdlIHRleHQgYW5kIHR5cGVcbiAqL1xuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpe1xuXHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiamF2YXNjcmlwdE1lc3NhZ2VcIiBjbGFzcz1cImFsZXJ0IGZhZGUgaW4gYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtJyArIHR5cGUgKyAnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48L2J1dHRvbj48c3BhbiBjbGFzcz1cImg0XCI+JyArIG1lc3NhZ2UgKyAnPC9zcGFuPjwvZGl2Pic7XG5cdCQoJyNtZXNzYWdlJykuYXBwZW5kKGh0bWwpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoXCIjamF2YXNjcmlwdE1lc3NhZ2VcIikuYWxlcnQoJ2Nsb3NlJyk7XG5cdH0sIDMwMDApO1xufTtcblxuLypcbmV4cG9ydHMuYWpheGNyc2YgPSBmdW5jdGlvbigpe1xuXHQkLmFqYXhTZXR1cCh7XG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jylcblx0XHR9XG5cdH0pO1xufTtcbiovXG5cbi8qKlxuICogQ2xlYXJzIGVycm9ycyBvbiBmb3JtcyBieSByZW1vdmluZyBlcnJvciBjbGFzc2VzXG4gKi9cbmV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzID0gZnVuY3Rpb24oKXtcblx0JCgnLmZvcm0tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uICgpe1xuXHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcblx0fSk7XG59XG5cbi8qKlxuICogU2V0cyBlcnJvcnMgb24gZm9ybXMgYmFzZWQgb24gcmVzcG9uc2UgSlNPTlxuICovXG5leHBvcnRzLnNldEZvcm1FcnJvcnMgPSBmdW5jdGlvbihqc29uKXtcblx0ZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMoKTtcblx0JC5lYWNoKGpzb24sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0JCgnIycgKyBrZXkpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQoJyMnICsga2V5ICsgJ2hlbHAnKS50ZXh0KHZhbHVlLmpvaW4oJyAnKSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBmb3IgbWVzc2FnZXMgaW4gdGhlIGZsYXNoIGRhdGEuIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgYnkgdGhlIHBhZ2VcbiAqL1xuZXhwb3J0cy5jaGVja01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKCcjbWVzc2FnZV9mbGFzaCcpLmxlbmd0aCl7XG5cdFx0dmFyIG1lc3NhZ2UgPSAkKCcjbWVzc2FnZV9mbGFzaCcpLnZhbCgpO1xuXHRcdHZhciB0eXBlID0gJCgnI21lc3NhZ2VfdHlwZV9mbGFzaCcpLnZhbCgpO1xuXHRcdGV4cG9ydHMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3JzIGZyb20gQUpBWFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSB0byB0aGUgdXNlclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBlcnJvciAtIHRoZSBBeGlvcyBlcnJvciByZWNlaXZlZFxuICovXG5leHBvcnRzLmhhbmRsZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgZWxlbWVudCwgZXJyb3Ipe1xuXHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRleHBvcnRzLnNldEZvcm1FcnJvcnMoZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byBcIiArIG1lc3NhZ2UgKyBcIjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvL2hpZGUgc3Bpbm5pbmcgaWNvblxuXHRpZihlbGVtZW50Lmxlbmd0aCA+IDApe1xuXHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFtlZGl0XSBsaW5rc1xuICAkKCcuZWRpdGFibGUtbGluaycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vaGlkZSB0aGUgW2VkaXRdIGxpbmtzLCBlbmFibGUgZWRpdG9yLCBhbmQgc2hvdyBTYXZlIGFuZCBDYW5jZWwgYnV0dG9uc1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoe1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdG9vbGJhcjogW1xuICAgICAgICAgIC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuICAgICAgICAgIFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcbiAgICAgICAgICBbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG4gICAgICAgICAgWydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG4gICAgICAgICAgWydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG4gICAgICAgIF0sXG4gICAgICAgIHRhYnNpemU6IDIsXG4gICAgICAgIGNvZGVtaXJyb3I6IHtcbiAgICAgICAgICBtb2RlOiAndGV4dC9odG1sJyxcbiAgICAgICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ21vbm9rYWknXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgU2F2ZSBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1zYXZlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9EaXNwbGF5IHNwaW5uZXIgd2hpbGUgQUpBWCBjYWxsIGlzIHBlcmZvcm1lZFxuICAgICAgJCgnI2VkaXRhYmxlc3Bpbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuICAgICAgLy9HZXQgY29udGVudHMgb2YgZWRpdG9yXG4gICAgICB2YXIgaHRtbFN0cmluZyA9ICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2NvZGUnKTtcblxuICAgICAgLy9Qb3N0IGNvbnRlbnRzIHRvIHNlcnZlciwgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZWRpdGFibGUvc2F2ZS8nICsgaWQsIHtcbiAgICAgICAgY29udGVudHM6IGh0bWxTdHJpbmdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIC8vSWYgcmVzcG9uc2UgMjAwIHJlY2VpdmVkLCBhc3N1bWUgaXQgc2F2ZWQgYW5kIHJlbG9hZCBwYWdlXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChcIlVuYWJsZSB0byBzYXZlIGNvbnRlbnQ6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgQ2FuY2VsIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLWNhbmNlbCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vUmVzZXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IgYW5kIGRlc3Ryb3kgaXRcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ3Jlc2V0Jyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdkZXN0cm95Jyk7XG5cbiAgICAgIC8vSGlkZSBTYXZlIGFuZCBDYW5jZWwgYnV0dG9ucywgYW5kIHNob3cgW2VkaXRdIGxpbmtcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=