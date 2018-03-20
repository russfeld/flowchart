webpackJsonp([1],{

/***/ 10:
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

/***/ 150:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 151:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);
__webpack_require__(5);
__webpack_require__(10);
__webpack_require__(7);

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

/***/ 152:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 153:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 154:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 156:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(161);
__webpack_require__(208);
module.exports = __webpack_require__(209);


/***/ }),

/***/ 161:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(162);

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
				var calendar = __webpack_require__(193);
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
				var groupsession = __webpack_require__(195);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(198);
				profile.init();
			}
		},

		//Dashboard Controller for routes at /admin-lte
		DashboardController: {
			//admin/index
			getIndex: function getIndex() {
				var dashboard = __webpack_require__(2);
				dashboard.init();
			}
		},

		StudentsController: {
			//admin/students
			getStudents: function getStudents() {
				var studentedit = __webpack_require__(150);
				studentedit.init();
			},
			//admin/newstudent
			getNewstudent: function getNewstudent() {
				var studentedit = __webpack_require__(150);
				studentedit.init();
			}
		},

		AdvisorsController: {
			//admin/advisors
			getAdvisors: function getAdvisors() {
				var advisoredit = __webpack_require__(151);
				advisoredit.init();
			},
			//admin/newadvisor
			getNewadvisor: function getNewadvisor() {
				var advisoredit = __webpack_require__(151);
				advisoredit.init();
			}
		},

		DepartmentsController: {
			//admin/departments
			getDepartments: function getDepartments() {
				var departmentedit = __webpack_require__(152);
				departmentedit.init();
			},
			//admin/newdepartment
			getNewdepartment: function getNewdepartment() {
				var departmentedit = __webpack_require__(152);
				departmentedit.init();
			}
		},

		MeetingsController: {
			//admin/meetings
			getMeetings: function getMeetings() {
				var meetingedit = __webpack_require__(199);
				meetingedit.init();
			}
		},

		BlackoutsController: {
			//admin/blackouts
			getBlackouts: function getBlackouts() {
				var blackoutedit = __webpack_require__(200);
				blackoutedit.init();
			}
		},

		GroupsessionsController: {
			//admin/groupsessions
			getGroupsessions: function getGroupsessions() {
				var groupsessionedit = __webpack_require__(201);
				groupsessionedit.init();
			}
		},

		SettingsController: {
			//admin/settings
			getSettings: function getSettings() {
				var settings = __webpack_require__(202);
				settings.init();
			}
		},

		DegreeprogramsController: {
			//admin/degreeprograms
			getDegreeprograms: function getDegreeprograms() {
				var degreeprogramedit = __webpack_require__(153);
				degreeprogramedit.init();
			},
			//admin/degreeprogram/{id}
			getDegreeprogramDetail: function getDegreeprogramDetail() {
				var degreeprogramedit = __webpack_require__(203);
				degreeprogramedit.init();
			},
			//admin/newdegreeprogram
			getNewdegreeprogram: function getNewdegreeprogram() {
				var degreeprogramedit = __webpack_require__(153);
				degreeprogramedit.init();
			}
		},

		ElectivelistsController: {
			//admin/degreeprograms
			getElectivelists: function getElectivelists() {
				var electivelistedit = __webpack_require__(154);
				electivelistedit.init();
			},
			//admin/degreeprogram/{id}
			getElectivelistDetail: function getElectivelistDetail() {
				var electivelistedit = __webpack_require__(204);
				electivelistedit.init();
			},
			//admin/newdegreeprogram
			getNewelectivelist: function getNewelectivelist() {
				var electivelistedit = __webpack_require__(154);
				electivelistedit.init();
			}
		},

		PlansController: {
			//admin/plans
			getPlans: function getPlans() {
				var planedit = __webpack_require__(155);
				planedit.init();
			},
			//admin/plan/{id}
			getPlanDetail: function getPlanDetail() {
				var plandetail = __webpack_require__(205);
				plandetail.init();
			},
			//admin/newplan
			getNewplan: function getNewplan() {
				var planedit = __webpack_require__(155);
				planedit.init();
			}
		},

		PlansemestersController: {
			//admin/plansemester
			getPlanSemester: function getPlanSemester() {
				var plansemesteredit = __webpack_require__(156);
				plansemesteredit.init();
			},
			//admin/newplansemester
			getNewPlanSemester: function getNewPlanSemester() {
				var plansemesteredit = __webpack_require__(156);
				plansemesteredit.init();
			}
		},

		CompletedcoursesController: {
			//admin/completedcourses
			getCompletedcourses: function getCompletedcourses() {
				var completedcourseedit = __webpack_require__(157);
				completedcourseedit.init();
			},
			//admin/newcompletedcourse
			getNewcompletedcourse: function getNewcompletedcourse() {
				var completedcourseedit = __webpack_require__(157);
				completedcourseedit.init();
			}
		},

		FlowchartsController: {
			//flowcharts/view/
			getFlowchart: function getFlowchart() {
				var flowchart = __webpack_require__(206);
				flowchart.init();
			},
			getIndex: function getIndex() {
				var flowchart = __webpack_require__(207);
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

/***/ 162:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {window._ = __webpack_require__(14);

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(1);

__webpack_require__(16);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(17);

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

/***/ 193:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required JS libraries
__webpack_require__(24);
__webpack_require__(11);
var moment = __webpack_require__(0);
var site = __webpack_require__(4);
__webpack_require__(144);
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

/***/ 195:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {window.Vue = __webpack_require__(12);
var site = __webpack_require__(4);
var Echo = __webpack_require__(145);
__webpack_require__(146);

window.Pusher = __webpack_require__(147);

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

/***/ 198:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(4);
__webpack_require__(5);
__webpack_require__(10);
__webpack_require__(7);

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

/***/ 199:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required libraries
var site = __webpack_require__(4);
__webpack_require__(148);
__webpack_require__(13);
__webpack_require__(149);
__webpack_require__(11);

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

/***/ 200:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 201:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 202:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);
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

/***/ 203:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);
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

/***/ 204:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);
var site = __webpack_require__(4);

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

/***/ 205:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);
var site = __webpack_require__(4);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  options.dom = '<"newbutton">frtip';
  var id = $('#plan_id').val();
  options.ajax = {
    url: '/admin/planrequirements/' + id,
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
      credits: $('#credits').val()
    };
    if ($('#semester_id').val() > 0) {
      data.semester_id = $('#semester_id').val();
    }
    var selected = $("input[name='requireable']:checked");
    if (selected.length > 0) {
      var selectedVal = selected.val();
      if (selectedVal == 1) {
        data.course_name = $('#course_name').val();
      } else if (selectedVal == 2) {
        if ($('#electivelist_id').val() > 0) {
          data.course_name = $('#course_name').val();
          data.electivelist_id = $('#electivelist_id').val();
        }
      }
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

  $('#planrequirementform').on('shown.bs.modal', showselected);

  $('#planrequirementform').on('hidden.bs.modal', resetForm);

  resetForm();

  $('#new').on('click', function () {
    $('#id').val("");
    $('#plan_idview').val($('#plan_idview').attr('value'));
    $('#delete').hide();
    $('#planrequirementform').modal('show');
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
      if (message.data.type == "course") {
        $('#course_name').val(message.data.course_name);
        $('#requireable1').prop('checked', true);
        $('#requiredcourse').show();
        $('#electivecourse').hide();
      } else if (message.data.type == "electivelist") {
        $('#course_name').val(message.data.course_name);
        $('#electivelist_id').val(message.data.electivelist_id);
        $('#electivelist_idtext').html("Selected: (" + message.data.electivelist_id + ") " + message.data.electivelist_name);
        $('#requireable2').prop('checked', true);
        $('#requiredcourse').hide();
        $('#electivecourse').show();
      }
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
  $('#degreerequirement_id').val("");
  $('#plan_idview').val($('#plan_idview').attr('value'));
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

/***/ 206:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(4);
window.Vue = __webpack_require__(12);
var draggable = __webpack_require__(158);

exports.init = function () {

  window.vm = new Vue({
    el: '#flowchart',
    data: {
      plan: [],
      semesters: []
    },
    methods: {
      editSemester: editSemester,
      saveSemester: saveSemester,
      deleteSemester: deleteSemester,
      dropSemester: dropSemester,
      dropCourse: dropCourse
    },
    components: {
      draggable: draggable
    }
  });

  loadData();

  $('#reset').on('click', loadData);
  $('#add-sem').on('click', addSemester);
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
  var semid = $(event.target).data('id');
  $("#sem-paneledit-" + semid).show();
  $("#sem-panelhead-" + semid).hide();
};

var saveSemester = function saveSemester(event) {
  var id = $('#id').val();
  var semid = $(event.target).data('id');
  var data = {
    id: semid,
    name: $("#sem-text-" + semid).val()
  };
  window.axios.post('/flowcharts/semesters/' + id + '/save', data).then(function (response) {
    $("#sem-paneledit-" + semid).hide();
    $("#sem-panelhead-" + semid).show();
    site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};

var deleteSemester = function deleteSemester(event) {
  var choice = confirm("Are you sure?");
  if (choice === true) {
    var id = $('#id').val();
    var semid = $(event.target).data('id');
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
      site.displayMessage(response.data, "success");
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
    site.displayMessage("Item Saved", "success");
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
    site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};

var dropCourse = function dropCourse(event) {
  console.log(event);
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
    site.displayMessage(response.data, "success");
  }).catch(function (error) {
    site.displayMessage("AJAX Error", "danger");
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 207:
/***/ (function(module, exports, __webpack_require__) {

var dashboard = __webpack_require__(2);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  dashboard.init(options);
};

/***/ }),

/***/ 208:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 209:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

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
  __webpack_require__(10);
  __webpack_require__(7);

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

},[160]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0bGlzdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3M/NmQxMCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvZmxvd2NoYXJ0LnNjc3MiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIl0sIm5hbWVzIjpbImRhc2hib2FyZCIsInJlcXVpcmUiLCJleHBvcnRzIiwiaW5pdCIsIm9wdGlvbnMiLCJkYXRhVGFibGVPcHRpb25zIiwiZG9tIiwiJCIsImh0bWwiLCJvbiIsImRhdGEiLCJmaXJzdF9uYW1lIiwidmFsIiwibGFzdF9uYW1lIiwiZW1haWwiLCJhZHZpc29yX2lkIiwiZGVwYXJ0bWVudF9pZCIsImlkIiwiZWlkIiwibGVuZ3RoIiwidXJsIiwiYWpheHNhdmUiLCJyZXRVcmwiLCJhamF4ZGVsZXRlIiwiYWpheHJlc3RvcmUiLCJzdW1tZXJub3RlIiwiZm9jdXMiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsImlzIiwiZmlsZXMiLCJkb2N1bWVudCIsImlucHV0IiwibnVtRmlsZXMiLCJnZXQiLCJsYWJlbCIsInJlcGxhY2UiLCJ0cmlnZ2VyIiwiZXZlbnQiLCJwYXJlbnRzIiwiZmluZCIsImxvZyIsImFsZXJ0IiwibmFtZSIsIm9mZmljZSIsInBob25lIiwiYWJicmV2aWF0aW9uIiwiZGVzY3JpcHRpb24iLCJlZmZlY3RpdmVfeWVhciIsImVmZmVjdGl2ZV9zZW1lc3RlciIsInN0YXJ0X3llYXIiLCJzdGFydF9zZW1lc3RlciIsImRlZ3JlZXByb2dyYW1faWQiLCJzdHVkZW50X2lkIiwiY2hvaWNlIiwiY29uZmlybSIsImFqYXhhdXRvY29tcGxldGUiLCJvcmRlcmluZyIsInBsYW5faWQiLCJjb3Vyc2VudW1iZXIiLCJ5ZWFyIiwic2VtZXN0ZXIiLCJiYXNpcyIsImdyYWRlIiwiY3JlZGl0cyIsInNlbGVjdGVkIiwic2VsZWN0ZWRWYWwiLCJ0cmFuc2ZlciIsImluY29taW5nX2luc3RpdHV0aW9uIiwiaW5jb21pbmdfbmFtZSIsImluY29taW5nX2Rlc2NyaXB0aW9uIiwiaW5jb21pbmdfc2VtZXN0ZXIiLCJpbmNvbWluZ19jcmVkaXRzIiwiaW5jb21pbmdfZ3JhZGUiLCJzaG93c2VsZWN0ZWQiLCJwcm9wIiwic2hvdyIsImhpZGUiLCJBcHAiLCJhY3Rpb25zIiwiUm9vdFJvdXRlQ29udHJvbGxlciIsImdldEluZGV4IiwiZWRpdGFibGUiLCJzaXRlIiwiY2hlY2tNZXNzYWdlIiwiZ2V0QWJvdXQiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJjYWxlbmRhciIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJnZXRMaXN0IiwiZ3JvdXBzZXNzaW9uIiwiUHJvZmlsZXNDb250cm9sbGVyIiwicHJvZmlsZSIsIkRhc2hib2FyZENvbnRyb2xsZXIiLCJTdHVkZW50c0NvbnRyb2xsZXIiLCJnZXRTdHVkZW50cyIsInN0dWRlbnRlZGl0IiwiZ2V0TmV3c3R1ZGVudCIsIkFkdmlzb3JzQ29udHJvbGxlciIsImdldEFkdmlzb3JzIiwiYWR2aXNvcmVkaXQiLCJnZXROZXdhZHZpc29yIiwiRGVwYXJ0bWVudHNDb250cm9sbGVyIiwiZ2V0RGVwYXJ0bWVudHMiLCJkZXBhcnRtZW50ZWRpdCIsImdldE5ld2RlcGFydG1lbnQiLCJNZWV0aW5nc0NvbnRyb2xsZXIiLCJnZXRNZWV0aW5ncyIsIm1lZXRpbmdlZGl0IiwiQmxhY2tvdXRzQ29udHJvbGxlciIsImdldEJsYWNrb3V0cyIsImJsYWNrb3V0ZWRpdCIsIkdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyIiwiZ2V0R3JvdXBzZXNzaW9ucyIsImdyb3Vwc2Vzc2lvbmVkaXQiLCJTZXR0aW5nc0NvbnRyb2xsZXIiLCJnZXRTZXR0aW5ncyIsInNldHRpbmdzIiwiRGVncmVlcHJvZ3JhbXNDb250cm9sbGVyIiwiZ2V0RGVncmVlcHJvZ3JhbXMiLCJkZWdyZWVwcm9ncmFtZWRpdCIsImdldERlZ3JlZXByb2dyYW1EZXRhaWwiLCJnZXROZXdkZWdyZWVwcm9ncmFtIiwiRWxlY3RpdmVsaXN0c0NvbnRyb2xsZXIiLCJnZXRFbGVjdGl2ZWxpc3RzIiwiZWxlY3RpdmVsaXN0ZWRpdCIsImdldEVsZWN0aXZlbGlzdERldGFpbCIsImdldE5ld2VsZWN0aXZlbGlzdCIsIlBsYW5zQ29udHJvbGxlciIsImdldFBsYW5zIiwicGxhbmVkaXQiLCJnZXRQbGFuRGV0YWlsIiwicGxhbmRldGFpbCIsImdldE5ld3BsYW4iLCJQbGFuc2VtZXN0ZXJzQ29udHJvbGxlciIsImdldFBsYW5TZW1lc3RlciIsInBsYW5zZW1lc3RlcmVkaXQiLCJnZXROZXdQbGFuU2VtZXN0ZXIiLCJDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlciIsImdldENvbXBsZXRlZGNvdXJzZXMiLCJjb21wbGV0ZWRjb3Vyc2VlZGl0IiwiZ2V0TmV3Y29tcGxldGVkY291cnNlIiwiRmxvd2NoYXJ0c0NvbnRyb2xsZXIiLCJnZXRGbG93Y2hhcnQiLCJmbG93Y2hhcnQiLCJjb250cm9sbGVyIiwiYWN0aW9uIiwid2luZG93IiwiXyIsImF4aW9zIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiY29tbW9uIiwidG9rZW4iLCJoZWFkIiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJtb21lbnQiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidHlwZSIsImNvbG9yIiwidGV4dENvbG9yIiwic2VsZWN0YWJsZSIsInNlbGVjdEhlbHBlciIsInNlbGVjdE92ZXJsYXAiLCJyZW5kZXJpbmciLCJ0aW1lRm9ybWF0IiwiZGF0ZVBpY2tlckRhdGEiLCJkYXlzT2ZXZWVrRGlzYWJsZWQiLCJmb3JtYXQiLCJzdGVwcGluZyIsImVuYWJsZWRIb3VycyIsIm1heEhvdXIiLCJzaWRlQnlTaWRlIiwiaWdub3JlUmVhZG9ubHkiLCJhbGxvd0lucHV0VG9nZ2xlIiwiZGF0ZVBpY2tlckRhdGVPbmx5IiwiYWR2aXNvciIsIm5vYmluZCIsInRyaW0iLCJ3aWR0aCIsInJlbW92ZUNsYXNzIiwicmVzZXRGb3JtIiwiYmluZCIsIm5ld1N0dWRlbnQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzaG93TWVldGluZ0Zvcm0iLCJyZXBlYXQiLCJibGFja291dFNlcmllcyIsIm1vZGFsIiwic2VsZWN0IiwiY2hhbmdlIiwicmVwZWF0Q2hhbmdlIiwic2F2ZUJsYWNrb3V0IiwiZGVsZXRlQmxhY2tvdXQiLCJibGFja291dE9jY3VycmVuY2UiLCJvZmYiLCJlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiZGVzYyIsInN0YXR1cyIsIm1lZXRpbmdpZCIsInN0dWRlbnRpZCIsImR1cmF0aW9uT3B0aW9ucyIsInVuZGVmaW5lZCIsImhvdXIiLCJtaW51dGUiLCJjbGVhckZvcm1FcnJvcnMiLCJlbXB0eSIsIm1pbnV0ZXMiLCJkaWZmIiwiZWxlbTEiLCJlbGVtMiIsImR1cmF0aW9uIiwiZGF0ZTIiLCJkYXRlIiwiaXNTYW1lIiwiY2xvbmUiLCJkYXRlMSIsImlzQmVmb3JlIiwibmV3RGF0ZSIsImFkZCIsImRlbGV0ZUNvbmZsaWN0IiwiZWRpdENvbmZsaWN0IiwicmVzb2x2ZUNvbmZsaWN0IiwiaW5kZXgiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJibGFja291dF9pZCIsInJlcGVhdF90eXBlIiwicmVwZWF0X2V2ZXJ5IiwicmVwZWF0X3VudGlsIiwicmVwZWF0X2RldGFpbCIsIlN0cmluZyIsImluZGV4T2YiLCJwcm9tcHQiLCJWdWUiLCJFY2hvIiwiUHVzaGVyIiwiaW9uIiwic291bmQiLCJzb3VuZHMiLCJ2b2x1bWUiLCJwYXRoIiwicHJlbG9hZCIsInVzZXJJRCIsInBhcnNlSW50IiwiZ3JvdXBSZWdpc3RlckJ0biIsImdyb3VwRGlzYWJsZUJ0biIsInZtIiwiZWwiLCJxdWV1ZSIsIm9ubGluZSIsIm1ldGhvZHMiLCJnZXRDbGFzcyIsInMiLCJ1c2VyaWQiLCJpbkFycmF5IiwidGFrZVN0dWRlbnQiLCJnaWQiLCJjdXJyZW50VGFyZ2V0IiwiZGF0YXNldCIsImFqYXhQb3N0IiwicHV0U3R1ZGVudCIsImRvbmVTdHVkZW50IiwiZGVsU3R1ZGVudCIsImVudiIsImxvZ1RvQ29uc29sZSIsImJyb2FkY2FzdGVyIiwia2V5IiwicHVzaGVyS2V5IiwiY2x1c3RlciIsInB1c2hlckNsdXN0ZXIiLCJjb25uZWN0b3IiLCJwdXNoZXIiLCJjb25uZWN0aW9uIiwiY29uY2F0IiwiY2hlY2tCdXR0b25zIiwiaW5pdGlhbENoZWNrRGluZyIsInNvcnQiLCJzb3J0RnVuY3Rpb24iLCJjaGFubmVsIiwibGlzdGVuIiwibG9jYXRpb24iLCJocmVmIiwiam9pbiIsImhlcmUiLCJ1c2VycyIsImxlbiIsImkiLCJwdXNoIiwiam9pbmluZyIsInVzZXIiLCJsZWF2aW5nIiwic3BsaWNlIiwiZm91bmQiLCJjaGVja0RpbmciLCJmaWx0ZXIiLCJkaXNhYmxlQnV0dG9uIiwicmVhbGx5IiwiYXR0ciIsImJvZHkiLCJzdWJtaXQiLCJlbmFibGVCdXR0b24iLCJyZW1vdmVBdHRyIiwiZm91bmRNZSIsInBlcnNvbiIsInBsYXkiLCJhIiwiYiIsIkRhdGFUYWJsZSIsInRvZ2dsZUNsYXNzIiwibG9hZHBpY3R1cmUiLCJhamF4bW9kYWxzYXZlIiwiYWpheCIsInJlbG9hZCIsInNvZnQiLCJhamF4bW9kYWxkZWxldGUiLCJtaW5DaGFycyIsIm1lc3NhZ2UiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwib3JkZXIiLCJub3RlcyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsIm9wdGlvbnMyIiwic2VtZXN0ZXJfaWQiLCJkZWdyZWVyZXF1aXJlbWVudF9pZCIsInBsYW5pZCIsImxpc3RpdGVtcyIsInJlbW92ZSIsImRyYWdnYWJsZSIsInBsYW4iLCJzZW1lc3RlcnMiLCJlZGl0U2VtZXN0ZXIiLCJzYXZlU2VtZXN0ZXIiLCJkZWxldGVTZW1lc3RlciIsImRyb3BTZW1lc3RlciIsImRyb3BDb3Vyc2UiLCJjb21wb25lbnRzIiwibG9hZERhdGEiLCJhZGRTZW1lc3RlciIsImRvY3VtZW50RWxlbWVudCIsInN0eWxlIiwic2V0UHJvcGVydHkiLCJjb3Vyc2VzIiwic2VtaWQiLCJ0YXJnZXQiLCJ0b1NlbUluZGV4IiwidG8iLCJjb3Vyc2VfaWQiLCJpdGVtIiwic2V0VGltZW91dCIsInNldEZvcm1FcnJvcnMiLCJqc29uIiwiY2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImh0bWxTdHJpbmciLCJjb250ZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakUscUJBQXFCO0FBQ3JCO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyxXQUFXO0FBQ3RCLGVBQWUsaUNBQWlDO0FBQ2hELGlCQUFpQixpQkFBaUI7QUFDbEMsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLDZFQUE2RTtBQUM3RSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLGNBQWM7QUFDNUIsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyw2QkFBNkI7QUFDM0MsV0FBVztBQUNYLEdBQUc7QUFDSCxnQkFBZ0IsWUFBWTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsNkRBQTZEO0FBQzdELFNBQVM7QUFDVCx1REFBdUQ7QUFDdkQ7QUFDQSxPQUFPO0FBQ1AsMERBQTBEO0FBQzFEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7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QSxVQUFJbmIsS0FBS1YsRUFBRSxJQUFGLEVBQVFHLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQUgsUUFBRSxlQUFlVSxFQUFqQixFQUFxQlEsVUFBckIsQ0FBZ0MsT0FBaEM7QUFDQWxCLFFBQUUsZUFBZVUsRUFBakIsRUFBcUJRLFVBQXJCLENBQWdDLFNBQWhDOztBQUVBO0FBQ0FsQixRQUFFLHFCQUFxQlUsRUFBdkIsRUFBMkJvTSxXQUEzQixDQUF1QyxRQUF2QztBQUNBOU0sUUFBRSxtQkFBbUJVLEVBQXJCLEVBQXlCNk4sUUFBekIsQ0FBa0MsUUFBbEM7QUFDRCxLQWREO0FBZUQsR0FoQkQ7QUFpQkQsQ0F0RkQsQyIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29kZU1pcnJvciwgY29weXJpZ2h0IChjKSBieSBNYXJpam4gSGF2ZXJiZWtlIGFuZCBvdGhlcnNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIGFuIE1JVCBsaWNlbnNlOiBodHRwOi8vY29kZW1pcnJvci5uZXQvTElDRU5TRVxuXG4oZnVuY3Rpb24obW9kKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2QocmVxdWlyZShcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIpKTtcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgZGVmaW5lKFtcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCJdLCBtb2QpO1xuICBlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgbW9kKENvZGVNaXJyb3IpO1xufSkoZnVuY3Rpb24oQ29kZU1pcnJvcikge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBodG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHsnYXJlYSc6IHRydWUsICdiYXNlJzogdHJ1ZSwgJ2JyJzogdHJ1ZSwgJ2NvbCc6IHRydWUsICdjb21tYW5kJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2VtYmVkJzogdHJ1ZSwgJ2ZyYW1lJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ2ltZyc6IHRydWUsICdpbnB1dCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdrZXlnZW4nOiB0cnVlLCAnbGluayc6IHRydWUsICdtZXRhJzogdHJ1ZSwgJ3BhcmFtJzogdHJ1ZSwgJ3NvdXJjZSc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICd0cmFjayc6IHRydWUsICd3YnInOiB0cnVlLCAnbWVudWl0ZW0nOiB0cnVlfSxcbiAgaW1wbGljaXRseUNsb3NlZDogeydkZCc6IHRydWUsICdsaSc6IHRydWUsICdvcHRncm91cCc6IHRydWUsICdvcHRpb24nOiB0cnVlLCAncCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAncnAnOiB0cnVlLCAncnQnOiB0cnVlLCAndGJvZHknOiB0cnVlLCAndGQnOiB0cnVlLCAndGZvb3QnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3RoJzogdHJ1ZSwgJ3RyJzogdHJ1ZX0sXG4gIGNvbnRleHRHcmFiYmVyczoge1xuICAgICdkZCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnZHQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2xpJzogeydsaSc6IHRydWV9LFxuICAgICdvcHRpb24nOiB7J29wdGlvbic6IHRydWUsICdvcHRncm91cCc6IHRydWV9LFxuICAgICdvcHRncm91cCc6IHsnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAncCc6IHsnYWRkcmVzcyc6IHRydWUsICdhcnRpY2xlJzogdHJ1ZSwgJ2FzaWRlJzogdHJ1ZSwgJ2Jsb2NrcXVvdGUnOiB0cnVlLCAnZGlyJzogdHJ1ZSxcbiAgICAgICAgICAnZGl2JzogdHJ1ZSwgJ2RsJzogdHJ1ZSwgJ2ZpZWxkc2V0JzogdHJ1ZSwgJ2Zvb3Rlcic6IHRydWUsICdmb3JtJzogdHJ1ZSxcbiAgICAgICAgICAnaDEnOiB0cnVlLCAnaDInOiB0cnVlLCAnaDMnOiB0cnVlLCAnaDQnOiB0cnVlLCAnaDUnOiB0cnVlLCAnaDYnOiB0cnVlLFxuICAgICAgICAgICdoZWFkZXInOiB0cnVlLCAnaGdyb3VwJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ21lbnUnOiB0cnVlLCAnbmF2JzogdHJ1ZSwgJ29sJzogdHJ1ZSxcbiAgICAgICAgICAncCc6IHRydWUsICdwcmUnOiB0cnVlLCAnc2VjdGlvbic6IHRydWUsICd0YWJsZSc6IHRydWUsICd1bCc6IHRydWV9LFxuICAgICdycCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAncnQnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3Rib2R5Jzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0ZCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGZvb3QnOiB7J3Rib2R5JzogdHJ1ZX0sXG4gICAgJ3RoJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0aGVhZCc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndHInOiB7J3RyJzogdHJ1ZX1cbiAgfSxcbiAgZG9Ob3RJbmRlbnQ6IHtcInByZVwiOiB0cnVlfSxcbiAgYWxsb3dVbnF1b3RlZDogdHJ1ZSxcbiAgYWxsb3dNaXNzaW5nOiB0cnVlLFxuICBjYXNlRm9sZDogdHJ1ZVxufVxuXG52YXIgeG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHt9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7fSxcbiAgY29udGV4dEdyYWJiZXJzOiB7fSxcbiAgZG9Ob3RJbmRlbnQ6IHt9LFxuICBhbGxvd1VucXVvdGVkOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nVGFnTmFtZTogZmFsc2UsXG4gIGNhc2VGb2xkOiBmYWxzZVxufVxuXG5Db2RlTWlycm9yLmRlZmluZU1vZGUoXCJ4bWxcIiwgZnVuY3Rpb24oZWRpdG9yQ29uZiwgY29uZmlnXykge1xuICB2YXIgaW5kZW50VW5pdCA9IGVkaXRvckNvbmYuaW5kZW50VW5pdFxuICB2YXIgY29uZmlnID0ge31cbiAgdmFyIGRlZmF1bHRzID0gY29uZmlnXy5odG1sTW9kZSA/IGh0bWxDb25maWcgOiB4bWxDb25maWdcbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0cykgY29uZmlnW3Byb3BdID0gZGVmYXVsdHNbcHJvcF1cbiAgZm9yICh2YXIgcHJvcCBpbiBjb25maWdfKSBjb25maWdbcHJvcF0gPSBjb25maWdfW3Byb3BdXG5cbiAgLy8gUmV0dXJuIHZhcmlhYmxlcyBmb3IgdG9rZW5pemVyc1xuICB2YXIgdHlwZSwgc2V0U3R5bGU7XG5cbiAgZnVuY3Rpb24gaW5UZXh0KHN0cmVhbSwgc3RhdGUpIHtcbiAgICBmdW5jdGlvbiBjaGFpbihwYXJzZXIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gcGFyc2VyO1xuICAgICAgcmV0dXJuIHBhcnNlcihzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIhXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwiW1wiKSkge1xuICAgICAgICAgIGlmIChzdHJlYW0ubWF0Y2goXCJDREFUQVtcIikpIHJldHVybiBjaGFpbihpbkJsb2NrKFwiYXRvbVwiLCBcIl1dPlwiKSk7XG4gICAgICAgICAgZWxzZSByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCItLVwiKSkge1xuICAgICAgICAgIHJldHVybiBjaGFpbihpbkJsb2NrKFwiY29tbWVudFwiLCBcIi0tPlwiKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiRE9DVFlQRVwiLCB0cnVlLCB0cnVlKSkge1xuICAgICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGRvY3R5cGUoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmVhbS5lYXQoXCI/XCIpKSB7XG4gICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5CbG9jayhcIm1ldGFcIiwgXCI/PlwiKTtcbiAgICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZSA9IHN0cmVhbS5lYXQoXCIvXCIpID8gXCJjbG9zZVRhZ1wiIDogXCJvcGVuVGFnXCI7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIiZcIikge1xuICAgICAgdmFyIG9rO1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIjXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwieFwiKSkge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bYS1mQS1GXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLlxcLTpdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2sgPyBcImF0b21cIiA6IFwiZXJyb3JcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXiY8XS8pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGluVGV4dC5pc0luVGV4dCA9IHRydWU7XG5cbiAgZnVuY3Rpb24gaW5UYWcoc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPlwiIHx8IChjaCA9PSBcIi9cIiAmJiBzdHJlYW0uZWF0KFwiPlwiKSkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgdHlwZSA9IGNoID09IFwiPlwiID8gXCJlbmRUYWdcIiA6IFwic2VsZmNsb3NlVGFnXCI7XG4gICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIpIHtcbiAgICAgIHR5cGUgPSBcImVxdWFsc1wiO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICBzdGF0ZS5zdGF0ZSA9IGJhc2VTdGF0ZTtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICB2YXIgbmV4dCA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgcmV0dXJuIG5leHQgPyBuZXh0ICsgXCIgdGFnIGVycm9yXCIgOiBcInRhZyBlcnJvclwiO1xuICAgIH0gZWxzZSBpZiAoL1tcXCdcXFwiXS8udGVzdChjaCkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5BdHRyaWJ1dGUoY2gpO1xuICAgICAgc3RhdGUuc3RyaW5nU3RhcnRDb2wgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5tYXRjaCgvXlteXFxzXFx1MDBhMD08PlxcXCJcXCddKlteXFxzXFx1MDBhMD08PlxcXCJcXCdcXC9dLyk7XG4gICAgICByZXR1cm4gXCJ3b3JkXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5BdHRyaWJ1dGUocXVvdGUpIHtcbiAgICB2YXIgY2xvc3VyZSA9IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubmV4dCgpID09IHF1b3RlKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwic3RyaW5nXCI7XG4gICAgfTtcbiAgICBjbG9zdXJlLmlzSW5BdHRyaWJ1dGUgPSB0cnVlO1xuICAgIHJldHVybiBjbG9zdXJlO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5CbG9jayhzdHlsZSwgdGVybWluYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKHRlcm1pbmF0b3IpKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLm5leHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGRvY3R5cGUoZGVwdGgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgdmFyIGNoO1xuICAgICAgd2hpbGUgKChjaCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoICsgMSk7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNoID09IFwiPlwiKSB7XG4gICAgICAgICAgaWYgKGRlcHRoID09IDEpIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCAtIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCBzdGFydE9mTGluZSkge1xuICAgIHRoaXMucHJldiA9IHN0YXRlLmNvbnRleHQ7XG4gICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZTtcbiAgICB0aGlzLmluZGVudCA9IHN0YXRlLmluZGVudGVkO1xuICAgIHRoaXMuc3RhcnRPZkxpbmUgPSBzdGFydE9mTGluZTtcbiAgICBpZiAoY29uZmlnLmRvTm90SW5kZW50Lmhhc093blByb3BlcnR5KHRhZ05hbWUpIHx8IChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQubm9JbmRlbnQpKVxuICAgICAgdGhpcy5ub0luZGVudCA9IHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gcG9wQ29udGV4dChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5jb250ZXh0KSBzdGF0ZS5jb250ZXh0ID0gc3RhdGUuY29udGV4dC5wcmV2O1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgbmV4dFRhZ05hbWUpIHtcbiAgICB2YXIgcGFyZW50VGFnTmFtZTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKCFzdGF0ZS5jb250ZXh0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBhcmVudFRhZ05hbWUgPSBzdGF0ZS5jb250ZXh0LnRhZ05hbWU7XG4gICAgICBpZiAoIWNvbmZpZy5jb250ZXh0R3JhYmJlcnMuaGFzT3duUHJvcGVydHkocGFyZW50VGFnTmFtZSkgfHxcbiAgICAgICAgICAhY29uZmlnLmNvbnRleHRHcmFiYmVyc1twYXJlbnRUYWdOYW1lXS5oYXNPd25Qcm9wZXJ0eShuZXh0VGFnTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmFzZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIm9wZW5UYWdcIikge1xuICAgICAgc3RhdGUudGFnU3RhcnQgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImNsb3NlVGFnXCIpIHtcbiAgICAgIHJldHVybiBjbG9zZVRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VUYWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBpZiAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgIT0gdGFnTmFtZSAmJlxuICAgICAgICAgIGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KHN0YXRlLmNvbnRleHQudGFnTmFtZSkpXG4gICAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSA9PSB0YWdOYW1lKSB8fCBjb25maWcubWF0Y2hDbG9zaW5nID09PSBmYWxzZSkge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZyBlcnJvclwiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZVN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgIT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICB9XG4gICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZVN0YXRlRXJyKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dHJTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiYXR0cmlidXRlXCI7XG4gICAgICByZXR1cm4gYXR0ckVxU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZW5kVGFnXCIgfHwgdHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0YXRlLnRhZ05hbWUsIHRhZ1N0YXJ0ID0gc3RhdGUudGFnU3RhcnQ7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgaWYgKHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIiB8fFxuICAgICAgICAgIGNvbmZpZy5hdXRvU2VsZkNsb3NlcnMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICAgIHN0YXRlLmNvbnRleHQgPSBuZXcgQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgdGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyRXFTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJlcXVhbHNcIikgcmV0dXJuIGF0dHJWYWx1ZVN0YXRlO1xuICAgIGlmICghY29uZmlnLmFsbG93TWlzc2luZykgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyVmFsdWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIiAmJiBjb25maWcuYWxsb3dVbnF1b3RlZCkge3NldFN0eWxlID0gXCJzdHJpbmdcIjsgcmV0dXJuIGF0dHJTdGF0ZTt9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyQ29udGludWVkU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnRTdGF0ZTogZnVuY3Rpb24oYmFzZUluZGVudCkge1xuICAgICAgdmFyIHN0YXRlID0ge3Rva2VuaXplOiBpblRleHQsXG4gICAgICAgICAgICAgICAgICAgc3RhdGU6IGJhc2VTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICBpbmRlbnRlZDogYmFzZUluZGVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IG51bGwsIHRhZ1N0YXJ0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IG51bGx9XG4gICAgICBpZiAoYmFzZUluZGVudCAhPSBudWxsKSBzdGF0ZS5iYXNlSW5kZW50ID0gYmFzZUluZGVudFxuICAgICAgcmV0dXJuIHN0YXRlXG4gICAgfSxcblxuICAgIHRva2VuOiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlLnRhZ05hbWUgJiYgc3RyZWFtLnNvbCgpKVxuICAgICAgICBzdGF0ZS5pbmRlbnRlZCA9IHN0cmVhbS5pbmRlbnRhdGlvbigpO1xuXG4gICAgICBpZiAoc3RyZWFtLmVhdFNwYWNlKCkpIHJldHVybiBudWxsO1xuICAgICAgdHlwZSA9IG51bGw7XG4gICAgICB2YXIgc3R5bGUgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmICgoc3R5bGUgfHwgdHlwZSkgJiYgc3R5bGUgIT0gXCJjb21tZW50XCIpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBudWxsO1xuICAgICAgICBzdGF0ZS5zdGF0ZSA9IHN0YXRlLnN0YXRlKHR5cGUgfHwgc3R5bGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICBpZiAoc2V0U3R5bGUpXG4gICAgICAgICAgc3R5bGUgPSBzZXRTdHlsZSA9PSBcImVycm9yXCIgPyBzdHlsZSArIFwiIGVycm9yXCIgOiBzZXRTdHlsZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9LFxuXG4gICAgaW5kZW50OiBmdW5jdGlvbihzdGF0ZSwgdGV4dEFmdGVyLCBmdWxsTGluZSkge1xuICAgICAgdmFyIGNvbnRleHQgPSBzdGF0ZS5jb250ZXh0O1xuICAgICAgLy8gSW5kZW50IG11bHRpLWxpbmUgc3RyaW5ncyAoZS5nLiBjc3MpLlxuICAgICAgaWYgKHN0YXRlLnRva2VuaXplLmlzSW5BdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLnRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5zdHJpbmdTdGFydENvbCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUuaW5kZW50ZWQgKyBpbmRlbnRVbml0O1xuICAgICAgfVxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5ub0luZGVudCkgcmV0dXJuIENvZGVNaXJyb3IuUGFzcztcbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSAhPSBpblRhZyAmJiBzdGF0ZS50b2tlbml6ZSAhPSBpblRleHQpXG4gICAgICAgIHJldHVybiBmdWxsTGluZSA/IGZ1bGxMaW5lLm1hdGNoKC9eKFxccyopLylbMF0ubGVuZ3RoIDogMDtcbiAgICAgIC8vIEluZGVudCB0aGUgc3RhcnRzIG9mIGF0dHJpYnV0ZSBuYW1lcy5cbiAgICAgIGlmIChzdGF0ZS50YWdOYW1lKSB7XG4gICAgICAgIGlmIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50UGFzdFRhZyAhPT0gZmFsc2UpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgc3RhdGUudGFnTmFtZS5sZW5ndGggKyAyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgaW5kZW50VW5pdCAqIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50RmFjdG9yIHx8IDEpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5hbGlnbkNEQVRBICYmIC88IVxcW0NEQVRBXFxbLy50ZXN0KHRleHRBZnRlcikpIHJldHVybiAwO1xuICAgICAgdmFyIHRhZ0FmdGVyID0gdGV4dEFmdGVyICYmIC9ePChcXC8pPyhbXFx3XzpcXC4tXSopLy5leGVjKHRleHRBZnRlcik7XG4gICAgICBpZiAodGFnQWZ0ZXIgJiYgdGFnQWZ0ZXJbMV0pIHsgLy8gQ2xvc2luZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0LnRhZ05hbWUgPT0gdGFnQWZ0ZXJbMl0pIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KGNvbnRleHQudGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0YWdBZnRlcikgeyAvLyBPcGVuaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgdmFyIGdyYWJiZXJzID0gY29uZmlnLmNvbnRleHRHcmFiYmVyc1tjb250ZXh0LnRhZ05hbWVdO1xuICAgICAgICAgIGlmIChncmFiYmVycyAmJiBncmFiYmVycy5oYXNPd25Qcm9wZXJ0eSh0YWdBZnRlclsyXSkpXG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoY29udGV4dCAmJiBjb250ZXh0LnByZXYgJiYgIWNvbnRleHQuc3RhcnRPZkxpbmUpXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICBpZiAoY29udGV4dCkgcmV0dXJuIGNvbnRleHQuaW5kZW50ICsgaW5kZW50VW5pdDtcbiAgICAgIGVsc2UgcmV0dXJuIHN0YXRlLmJhc2VJbmRlbnQgfHwgMDtcbiAgICB9LFxuXG4gICAgZWxlY3RyaWNJbnB1dDogLzxcXC9bXFxzXFx3Ol0rPiQvLFxuICAgIGJsb2NrQ29tbWVudFN0YXJ0OiBcIjwhLS1cIixcbiAgICBibG9ja0NvbW1lbnRFbmQ6IFwiLS0+XCIsXG5cbiAgICBjb25maWd1cmF0aW9uOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG4gICAgaGVscGVyVHlwZTogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuXG4gICAgc2tpcEF0dHJpYnV0ZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5zdGF0ZSA9PSBhdHRyVmFsdWVTdGF0ZSlcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBhdHRyU3RhdGVcbiAgICB9XG4gIH07XG59KTtcblxuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC94bWxcIiwgXCJ4bWxcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi94bWxcIiwgXCJ4bWxcIik7XG5pZiAoIUNvZGVNaXJyb3IubWltZU1vZGVzLmhhc093blByb3BlcnR5KFwidGV4dC9odG1sXCIpKVxuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2h0bWxcIiwge25hbWU6IFwieG1sXCIsIGh0bWxNb2RlOiB0cnVlfSk7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGZpcnN0X25hbWU6ICQoJyNmaXJzdF9uYW1lJykudmFsKCksXG4gICAgICBsYXN0X25hbWU6ICQoJyNsYXN0X25hbWUnKS52YWwoKSxcbiAgICAgIGVtYWlsOiAkKCcjZW1haWwnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNhZHZpc29yX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuYWR2aXNvcl9pZCA9ICQoJyNhZHZpc29yX2lkJykudmFsKCk7XG4gICAgfVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGRhdGEuZWlkID0gJCgnI2VpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3N0dWRlbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vc3R1ZGVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xucmVxdWlyZSgnY29kZW1pcnJvcicpO1xucmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbnJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2Fkdmlzb3JcIj5OZXcgQWR2aXNvcjwvYT4nKTtcblxuICAkKCcjbm90ZXMnKS5zdW1tZXJub3RlKHtcblx0XHRmb2N1czogdHJ1ZSxcblx0XHR0b29sYmFyOiBbXG5cdFx0XHQvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cblx0XHRcdFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcblx0XHRcdFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcblx0XHRcdFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuXHRcdFx0WydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG5cdFx0XSxcblx0XHR0YWJzaXplOiAyLFxuXHRcdGNvZGVtaXJyb3I6IHtcblx0XHRcdG1vZGU6ICd0ZXh0L2h0bWwnLFxuXHRcdFx0aHRtbE1vZGU6IHRydWUsXG5cdFx0XHRsaW5lTnVtYmVyczogdHJ1ZSxcblx0XHRcdHRoZW1lOiAnbW9ub2thaSdcblx0XHR9LFxuXHR9KTtcblxuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuICAgIGZvcm1EYXRhLmFwcGVuZChcImhpZGRlblwiLCAkKCcjaGlkZGVuJykuaXMoJzpjaGVja2VkJykgPyAxIDogMCk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJkZXBhcnRtZW50X2lkXCIsICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2Fkdmlzb3InO1xuICAgIH1lbHNle1xuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZWlkXCIsICQoJyNlaWQnKS52YWwoKSk7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9hZHZpc29ycy8nICsgaWQ7XG4gICAgfVxuXHRcdGRhc2hib2FyZC5hamF4c2F2ZShmb3JtRGF0YSwgdXJsLCBpZCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlYWR2aXNvclwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9hZHZpc29yc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dCA9ICQodGhpcyksXG4gICAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG4gICAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuICAgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG4gIH0pO1xuXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0JyksXG4gICAgICAgICAgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZiggaW5wdXQubGVuZ3RoICkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiggbG9nICkgYWxlcnQobG9nKTtcbiAgICAgIH1cblxuICB9KTtcblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2RlcGFydG1lbnRcIj5OZXcgRGVwYXJ0bWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgICAgb2ZmaWNlOiAkKCcjb2ZmaWNlJykudmFsKCksXG4gICAgICBwaG9uZTogJCgnI3Bob25lJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZXBhcnRtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlcGFydG1lbnRzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWRlcGFydG1lbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVwYXJ0bWVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVwiPk5ldyBEZWdyZWUgUHJvZ3JhbTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfeWVhcjogJCgnI2VmZmVjdGl2ZV95ZWFyJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfc2VtZXN0ZXI6ICQoJyNlZmZlY3RpdmVfc2VtZXN0ZXInKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXByb2dyYW0nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVncmVlcHJvZ3JhbVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZWdyZWVwcm9ncmFtc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdlbGVjdGl2ZWxpc3RcIj5OZXcgRWxlY3RpdmUgTGlzdDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdlbGVjdGl2ZWxpc3QnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVsaXN0cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWVsZWN0aXZlbGlzdFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9lbGVjdGl2ZWxpc3RzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3cGxhblwiPk5ldyBQbGFuPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBzdGFydF95ZWFyOiAkKCcjc3RhcnRfeWVhcicpLnZhbCgpLFxuICAgICAgc3RhcnRfc2VtZXN0ZXI6ICQoJyNzdGFydF9zZW1lc3RlcicpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFuJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZXBsYW5cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3JlcG9wdWxhdGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIGFsbCByZXF1aXJlbWVudHMgYW5kIHJlcG9wdWxhdGUgdGhlbSBiYXNlZCBvbiB0aGUgc2VsZWN0ZWQgZGVncmVlIHByb2dyYW0uIFlvdSBjYW5ub3QgdW5kbyB0aGlzIGFjdGlvbi5cIik7XG4gIFx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAgIHZhciB1cmwgPSBcIi9hZG1pbi9wb3B1bGF0ZXBsYW5cIjtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgICB9O1xuICAgICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICAgIH1cbiAgfSlcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICBkYXNoYm9hcmQuaW5pdCgpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBwbGFuX2lkOiAkKCcjcGxhbl9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcGxhbnMvZGVsZXRlcGxhbnNlbWVzdGVyL1wiICsgJCgnI2lkJykudmFsKCkgO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFucy9cIiArICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXCI+TmV3IENvbXBsZXRlZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgY291cnNlbnVtYmVyOiAkKCcjY291cnNlbnVtYmVyJykudmFsKCksXG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgeWVhcjogJCgnI3llYXInKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIGJhc2lzOiAkKCcjYmFzaXMnKS52YWwoKSxcbiAgICAgIGdyYWRlOiAkKCcjZ3JhZGUnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNzdHVkZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSd0cmFuc2ZlciddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEudHJhbnNmZXIgPSBmYWxzZTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgZGF0YS50cmFuc2ZlciA9IHRydWU7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19pbnN0aXR1dGlvbiA9ICQoJyNpbmNvbWluZ19pbnN0aXR1dGlvbicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfbmFtZSA9ICQoJyNpbmNvbWluZ19uYW1lJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19kZXNjcmlwdGlvbiA9ICQoJyNpbmNvbWluZ19kZXNjcmlwdGlvbicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfc2VtZXN0ZXIgPSAkKCcjaW5jb21pbmdfc2VtZXN0ZXInKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2NyZWRpdHMgPSAkKCcjaW5jb21pbmdfY3JlZGl0cycpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfZ3JhZGUgPSAkKCcjaW5jb21pbmdfZ3JhZGUnKS52YWwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2UnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vY29tcGxldGVkY291cnNlcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWNvbXBsZXRlZGNvdXJzZVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9dHJhbnNmZXJdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ3N0dWRlbnRfaWQnLCAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnKTtcblxuICBpZigkKCcjdHJhbnNmZXJjb3Vyc2UnKS5pcygnOmhpZGRlbicpKXtcbiAgICAkKCcjdHJhbnNmZXIxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICB9ZWxzZXtcbiAgICAkKCcjdHJhbnNmZXIyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICB9XG5cbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3RyYW5zZmVyJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNrc3RhdGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyN0cmFuc2ZlcmNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcja3N0YXRlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjdHJhbnNmZXJjb3Vyc2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCIvL2h0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy81LjQvbWl4I3dvcmtpbmctd2l0aC1zY3JpcHRzXG4vL2h0dHBzOi8vYW5keS1jYXJ0ZXIuY29tL2Jsb2cvc2NvcGluZy1qYXZhc2NyaXB0LWZ1bmN0aW9uYWxpdHktdG8tc3BlY2lmaWMtcGFnZXMtd2l0aC1sYXJhdmVsLWFuZC1jYWtlcGhwXG5cbi8vTG9hZCBzaXRlLXdpZGUgbGlicmFyaWVzIGluIGJvb3RzdHJhcCBmaWxlXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcCcpO1xuXG52YXIgQXBwID0ge1xuXG5cdC8vIENvbnRyb2xsZXItYWN0aW9uIG1ldGhvZHNcblx0YWN0aW9uczoge1xuXHRcdC8vSW5kZXggZm9yIGRpcmVjdGx5IGNyZWF0ZWQgdmlld3Mgd2l0aCBubyBleHBsaWNpdCBjb250cm9sbGVyXG5cdFx0Um9vdFJvdXRlQ29udHJvbGxlcjoge1xuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWJvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuICAgIH0sXG5cblx0XHQvL0FkdmlzaW5nIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWR2aXNpbmdcblx0XHRBZHZpc2luZ0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWR2aXNpbmcvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNhbGVuZGFyID0gcmVxdWlyZSgnLi9wYWdlcy9jYWxlbmRhcicpO1xuXHRcdFx0XHRjYWxlbmRhci5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vR3JvdXBzZXNzaW9uIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvZ3JvdXBzZXNzaW9uXG4gICAgR3JvdXBzZXNzaW9uQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9ncm91cHNlc3Npb24vaW5kZXhcbiAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuICAgICAgfSxcblx0XHRcdC8vZ3JvdXBzZXNpb24vbGlzdFxuXHRcdFx0Z2V0TGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBncm91cHNlc3Npb24gPSByZXF1aXJlKCcuL3BhZ2VzL2dyb3Vwc2Vzc2lvbicpO1xuXHRcdFx0XHRncm91cHNlc3Npb24uaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Ly9Qcm9maWxlcyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL3Byb2ZpbGVcblx0XHRQcm9maWxlc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vcHJvZmlsZS9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcHJvZmlsZSA9IHJlcXVpcmUoJy4vcGFnZXMvcHJvZmlsZScpO1xuXHRcdFx0XHRwcm9maWxlLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9EYXNoYm9hcmQgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZG1pbi1sdGVcblx0XHREYXNoYm9hcmRDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuL3V0aWwvZGFzaGJvYXJkJyk7XG5cdFx0XHRcdGRhc2hib2FyZC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTdHVkZW50c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc3R1ZGVudHNcblx0XHRcdGdldFN0dWRlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3c3R1ZGVudFxuXHRcdFx0Z2V0TmV3c3R1ZGVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEFkdmlzb3JzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9hZHZpc29yc1xuXHRcdFx0Z2V0QWR2aXNvcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdhZHZpc29yXG5cdFx0XHRnZXROZXdhZHZpc29yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVwYXJ0bWVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlcGFydG1lbnRzXG5cdFx0XHRnZXREZXBhcnRtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZXBhcnRtZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0Jyk7XG5cdFx0XHRcdGRlcGFydG1lbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlcGFydG1lbnRcblx0XHRcdGdldE5ld2RlcGFydG1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRNZWV0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vbWVldGluZ3Ncblx0XHRcdGdldE1lZXRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1lZXRpbmdlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQnKTtcblx0XHRcdFx0bWVldGluZ2VkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0QmxhY2tvdXRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ibGFja291dHNcblx0XHRcdGdldEJsYWNrb3V0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBibGFja291dGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQnKTtcblx0XHRcdFx0YmxhY2tvdXRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2dyb3Vwc2Vzc2lvbnNcblx0XHRcdGdldEdyb3Vwc2Vzc2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQnKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTZXR0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc2V0dGluZ3Ncblx0XHRcdGdldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNldHRpbmdzID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MnKTtcblx0XHRcdFx0c2V0dGluZ3MuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVncmVlcHJvZ3JhbXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbURldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVxuXHRcdFx0Z2V0TmV3ZGVncmVlcHJvZ3JhbTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEVsZWN0aXZlbGlzdHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3RzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0Jyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3REZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2VsZWN0aXZlbGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9wbGFuc1xuXHRcdFx0Z2V0UGxhbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdCcpO1xuXHRcdFx0XHRwbGFuZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9wbGFuL3tpZH1cblx0XHRcdGdldFBsYW5EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmRldGFpbCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwnKTtcblx0XHRcdFx0cGxhbmRldGFpbC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuXG5cdFx0XHRnZXROZXdwbGFuOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0UGxhbnNlbWVzdGVyc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vcGxhbnNlbWVzdGVyXG5cdFx0XHRnZXRQbGFuU2VtZXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbnNlbWVzdGVyZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQnKTtcblx0XHRcdFx0cGxhbnNlbWVzdGVyZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuc2VtZXN0ZXJcblx0XHRcdGdldE5ld1BsYW5TZW1lc3RlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuc2VtZXN0ZXJlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdCcpO1xuXHRcdFx0XHRwbGFuc2VtZXN0ZXJlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdENvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcblx0XHRcdGdldENvbXBsZXRlZGNvdXJzZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2Vcblx0XHRcdGdldE5ld2NvbXBsZXRlZGNvdXJzZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb21wbGV0ZWRjb3Vyc2VlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdCcpO1xuXHRcdFx0XHRjb21wbGV0ZWRjb3Vyc2VlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEZsb3djaGFydHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2Zsb3djaGFydHMvdmlldy9cblx0XHRcdGdldEZsb3djaGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGZsb3djaGFydCA9IHJlcXVpcmUoJy4vcGFnZXMvZmxvd2NoYXJ0bGlzdCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0fSxcblxuXHQvL0Z1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGJ5IHRoZSBwYWdlIGF0IGxvYWQuIERlZmluZWQgaW4gcmVzb3VyY2VzL3ZpZXdzL2luY2x1ZGVzL3NjcmlwdHMuYmxhZGUucGhwXG5cdC8vYW5kIEFwcC9IdHRwL1ZpZXdDb21wb3NlcnMvSmF2YXNjcmlwdCBDb21wb3NlclxuXHQvL1NlZSBsaW5rcyBhdCB0b3Agb2YgZmlsZSBmb3IgZGVzY3JpcHRpb24gb2Ygd2hhdCdzIGdvaW5nIG9uIGhlcmVcblx0Ly9Bc3N1bWVzIDIgaW5wdXRzIC0gdGhlIGNvbnRyb2xsZXIgYW5kIGFjdGlvbiB0aGF0IGNyZWF0ZWQgdGhpcyBwYWdlXG5cdGluaXQ6IGZ1bmN0aW9uKGNvbnRyb2xsZXIsIGFjdGlvbikge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvL2NhbGwgdGhlIG1hdGNoaW5nIGZ1bmN0aW9uIGluIHRoZSBhcnJheSBhYm92ZVxuXHRcdFx0cmV0dXJuIEFwcC5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0oKTtcblx0XHR9XG5cdH0sXG59O1xuXG4vL0JpbmQgdG8gdGhlIHdpbmRvd1xud2luZG93LkFwcCA9IEFwcDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2luZG93Ll8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIGpRdWVyeSBhbmQgdGhlIEJvb3RzdHJhcCBqUXVlcnkgcGx1Z2luIHdoaWNoIHByb3ZpZGVzIHN1cHBvcnRcbiAqIGZvciBKYXZhU2NyaXB0IGJhc2VkIEJvb3RzdHJhcCBmZWF0dXJlcyBzdWNoIGFzIG1vZGFscyBhbmQgdGFicy4gVGhpc1xuICogY29kZSBtYXkgYmUgbW9kaWZpZWQgdG8gZml0IHRoZSBzcGVjaWZpYyBuZWVkcyBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICovXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIHRoZSBheGlvcyBIVFRQIGxpYnJhcnkgd2hpY2ggYWxsb3dzIHVzIHRvIGVhc2lseSBpc3N1ZSByZXF1ZXN0c1xuICogdG8gb3VyIExhcmF2ZWwgYmFjay1lbmQuIFRoaXMgbGlicmFyeSBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgc2VuZGluZyB0aGVcbiAqIENTUkYgdG9rZW4gYXMgYSBoZWFkZXIgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBcIlhTUkZcIiB0b2tlbiBjb29raWUuXG4gKi9cblxud2luZG93LmF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLy9odHRwczovL2dpdGh1Yi5jb20vcmFwcGFzb2Z0L2xhcmF2ZWwtNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qc1xud2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4vKipcbiAqIE5leHQgd2Ugd2lsbCByZWdpc3RlciB0aGUgQ1NSRiBUb2tlbiBhcyBhIGNvbW1vbiBoZWFkZXIgd2l0aCBBeGlvcyBzbyB0aGF0XG4gKiBhbGwgb3V0Z29pbmcgSFRUUCByZXF1ZXN0cyBhdXRvbWF0aWNhbGx5IGhhdmUgaXQgYXR0YWNoZWQuIFRoaXMgaXMganVzdFxuICogYSBzaW1wbGUgY29udmVuaWVuY2Ugc28gd2UgZG9uJ3QgaGF2ZSB0byBhdHRhY2ggZXZlcnkgdG9rZW4gbWFudWFsbHkuXG4gKi9cblxubGV0IHRva2VuID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG5cbmlmICh0b2tlbikge1xuICAgIHdpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1DU1JGLVRPS0VOJ10gPSB0b2tlbi5jb250ZW50O1xufSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdDU1JGIHRva2VuIG5vdCBmb3VuZDogaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzL2NzcmYjY3NyZi14LWNzcmYtdG9rZW4nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnZW9uYXNkYW4tYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLXJ1c3NmZWxkJyk7XG52YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuLi91dGlsL2VkaXRhYmxlJyk7XG5cbi8vU2Vzc2lvbiBmb3Igc3RvcmluZyBkYXRhIGJldHdlZW4gZm9ybXNcbmV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cbi8vSUQgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgY2FsZW5kYXIncyBhZHZpc29yXG5leHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gLTE7XG5cbi8vU3R1ZGVudCdzIE5hbWUgc2V0IGJ5IGluaXRcbmV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9IFwiXCI7XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbmV4cG9ydHMuY2FsZW5kYXJEYXRhID0ge1xuXHRoZWFkZXI6IHtcblx0XHRsZWZ0OiAncHJldixuZXh0IHRvZGF5Jyxcblx0XHRjZW50ZXI6ICd0aXRsZScsXG5cdFx0cmlnaHQ6ICdhZ2VuZGFXZWVrLGFnZW5kYURheSdcblx0fSxcblx0ZWRpdGFibGU6IGZhbHNlLFxuXHRldmVudExpbWl0OiB0cnVlLFxuXHRoZWlnaHQ6ICdhdXRvJyxcblx0d2Vla2VuZHM6IGZhbHNlLFxuXHRidXNpbmVzc0hvdXJzOiB7XG5cdFx0c3RhcnQ6ICc4OjAwJywgLy8gYSBzdGFydCB0aW1lICgxMGFtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRlbmQ6ICcxNzowMCcsIC8vIGFuIGVuZCB0aW1lICg2cG0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGRvdzogWyAxLCAyLCAzLCA0LCA1IF1cblx0fSxcblx0ZGVmYXVsdFZpZXc6ICdhZ2VuZGFXZWVrJyxcblx0dmlld3M6IHtcblx0XHRhZ2VuZGE6IHtcblx0XHRcdGFsbERheVNsb3Q6IGZhbHNlLFxuXHRcdFx0c2xvdER1cmF0aW9uOiAnMDA6MjA6MDAnLFxuXHRcdFx0bWluVGltZTogJzA4OjAwOjAwJyxcblx0XHRcdG1heFRpbWU6ICcxNzowMDowMCdcblx0XHR9XG5cdH0sXG5cdGV2ZW50U291cmNlczogW1xuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9tZWV0aW5nZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIG1lZXRpbmcgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyM1MTI4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnd2hpdGUnLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL2JsYWNrb3V0ZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIGJsYWNrb3V0IGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjRkY4ODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ2JsYWNrJyxcblx0XHR9LFxuXHRdLFxuXHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRzZWxlY3RIZWxwZXI6IHRydWUsXG5cdHNlbGVjdE92ZXJsYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGV2ZW50LnJlbmRlcmluZyA9PT0gJ2JhY2tncm91bmQnO1xuXHR9LFxuXHR0aW1lRm9ybWF0OiAnICcsXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0YSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdMTEwnLFxuXHRcdHN0ZXBwaW5nOiAyMCxcblx0XHRlbmFibGVkSG91cnM6IFs4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTddLFxuXHRcdG1heEhvdXI6IDE3LFxuXHRcdHNpZGVCeVNpZGU6IHRydWUsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2UgZGF5IG9ubHlcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5ID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ01NL0REL1lZWVknLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8qKlxuICogSW5pdGlhbHphdGlvbiBmdW5jdGlvbiBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIGFkdmlzb3IgLSBib29sZWFuIHRydWUgaWYgdGhlIHVzZXIgaXMgYW4gYWR2aXNvclxuICogQHBhcmFtIG5vYmluZCAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgYnV0dG9ucyBzaG91bGQgbm90IGJlIGJvdW5kIChtYWtlIGNhbGVuZGFyIHJlYWQtb25seSlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXMgYWN0aW9uXG5cdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cblx0Ly9pbml0YWxpemUgZWRpdGFibGUgZWxlbWVudHNcblx0ZWRpdGFibGUuaW5pdCgpO1xuXG5cdC8vdHdlYWsgcGFyYW1ldGVyc1xuXHR3aW5kb3cuYWR2aXNvciB8fCAod2luZG93LmFkdmlzb3IgPSBmYWxzZSk7XG5cdHdpbmRvdy5ub2JpbmQgfHwgKHdpbmRvdy5ub2JpbmQgPSBmYWxzZSk7XG5cblx0Ly9nZXQgdGhlIGN1cnJlbnQgYWR2aXNvcidzIElEXG5cdGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAkKCcjY2FsZW5kYXJBZHZpc29ySUQnKS52YWwoKS50cmltKCk7XG5cblx0Ly9TZXQgdGhlIGFkdmlzb3IgaW5mb3JtYXRpb24gZm9yIG1lZXRpbmcgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1swXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL1NldCB0aGUgYWR2c2lvciBpbmZvcmFtdGlvbiBmb3IgYmxhY2tvdXQgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL2lmIHRoZSB3aW5kb3cgaXMgc21hbGwsIHNldCBkaWZmZXJlbnQgZGVmYXVsdCBmb3IgY2FsZW5kYXJcblx0aWYoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApe1xuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmRlZmF1bHRWaWV3ID0gJ2FnZW5kYURheSc7XG5cdH1cblxuXHQvL0lmIG5vYmluZCwgZG9uJ3QgYmluZCB0aGUgZm9ybXNcblx0aWYoIXdpbmRvdy5ub2JpbmQpe1xuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhbiBhZHZpc29yLCBiaW5kIG1vcmUgZGF0YVxuXHRcdGlmKHdpbmRvdy5hZHZpc29yKXtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI3RpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0JykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjZW5kJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjZW5kX3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLnNob3coKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5zaG93KCk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG5cdFx0XHQvL2JpbmQgbWV0aG9kcyBmb3IgYnV0dG9ucyBhbmQgZm9ybXNcblx0XHRcdCQoJyNuZXdTdHVkZW50QnV0dG9uJykuYmluZCgnY2xpY2snLCBuZXdTdHVkZW50KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjYnRpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdFx0XHQgICAgJCh0aGlzKS5maW5kKCcuaGFzLWVycm9yJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRleHQoJycpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9iaW5kIGF1dG9jb21wbGV0ZSBmaWVsZFxuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLmF1dG9jb21wbGV0ZSh7XG5cdFx0XHQgICAgc2VydmljZVVybDogJy9wcm9maWxlL3N0dWRlbnRmZWVkJyxcblx0XHRcdCAgICBhamF4U2V0dGluZ3M6IHtcblx0XHRcdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdFx0XHQgICAgICAgICQoJyNzdHVkZW50aWR2YWwnKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdCAgICAgICAgcmV0dXJuIHtcblx0XHRcdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHRcdFx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHRcdFx0ICAgICAgICAgICAgfSlcblx0XHRcdCAgICAgICAgfTtcblx0XHRcdCAgICB9XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3N0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2VuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNzdGFydCcsICcjZW5kJywgJyNkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNiZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI2JzdGFydCcsICcjYmVuZCcsICcjYmR1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnJlcGVhdHVudGlsX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSk7XG5cblx0XHRcdC8vY2hhbmdlIHJlbmRlcmluZyBvZiBldmVudHNcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdFx0XHRlbGVtZW50LmFkZENsYXNzKFwiZmMtY2xpY2thYmxlXCIpO1xuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ20nKXtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkJykudmFsKGV2ZW50LnN0dWRlbnRuYW1lKTtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdH1lbHNlIGlmIChldmVudC50eXBlID09ICdiJyl7XG5cdFx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0XHRldmVudDogZXZlbnRcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmKGV2ZW50LnJlcGVhdCA9PSAnMCcpe1xuXHRcdFx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRcdFx0ZW5kOiBlbmRcblx0XHRcdFx0fTtcblx0XHRcdFx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly9iaW5kIG1vcmUgYnV0dG9uc1xuXHRcdFx0JCgnI2JyZXBlYXQnKS5jaGFuZ2UocmVwZWF0Q2hhbmdlKTtcblxuXHRcdFx0JCgnI3NhdmVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVCbGFja291dCk7XG5cblx0XHRcdCQoJyNibGFja291dFNlcmllcycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRPY2N1cnJlbmNlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dE9jY3VycmVuY2UoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYWR2aXNpbmdCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVNZWV0aW5nQnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dEJ0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHR9KTtcblxuXG5cdFx0XHQkKCcjcmVzb2x2ZUJ1dHRvbicpLm9uKCdjbGljaycsIHJlc29sdmVDb25mbGljdHMpO1xuXG5cdFx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgbm90IGFuIGFkdmlzb3IsIGJpbmQgbGVzcyBkYXRhXG5cdFx0fWVsc2V7XG5cblx0XHRcdC8vR2V0IHRoZSBjdXJyZW50IHN0dWRlbnQncyBuYW1lXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSAkKCcjY2FsZW5kYXJTdHVkZW50TmFtZScpLnZhbCgpLnRyaW0oKTtcblxuXHRcdCAgLy9SZW5kZXIgYmxhY2tvdXRzIHRvIGJhY2tncm91bmRcblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG5cblx0XHQgIC8vV2hlbiByZW5kZXJpbmcsIHVzZSB0aGlzIGN1c3RvbSBmdW5jdGlvbiBmb3IgYmxhY2tvdXRzIGFuZCBzdHVkZW50IG1lZXRpbmdzXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0XHQgICAgfVxuXHRcdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHRcdCAgICB9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1VzZSB0aGlzIG1ldGhvZCBmb3IgY2xpY2tpbmcgb24gbWVldGluZ3Ncblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHRcdFx0XHRpZihldmVudC5zdGFydC5pc0FmdGVyKG1vbWVudCgpKSl7XG5cdFx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoXCJZb3UgY2Fubm90IGVkaXQgbWVldGluZ3MgaW4gdGhlIHBhc3RcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1doZW4gc2VsZWN0aW5nIG5ldyBhcmVhcywgdXNlIHRoZSBzdHVkZW50U2VsZWN0IG1ldGhvZCBpbiB0aGUgY2FsZW5kYXIgbGlicmFyeVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gc3R1ZGVudFNlbGVjdDtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2Rlc2MnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKFwiI2VuZFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNlbmRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnLm1vZGFsJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cdFx0fVxuXG5cdFx0Ly9CaW5kIGNsaWNrIGhhbmRsZXJzIG9uIHRoZSBmb3JtXG5cdFx0JCgnI3NhdmVCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVNZWV0aW5nKTtcblx0XHQkKCcjZGVsZXRlQnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVNZWV0aW5nKTtcblx0XHQkKCcjZHVyYXRpb24nKS5vbignY2hhbmdlJywgY2hhbmdlRHVyYXRpb24pO1xuXG5cdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMgd2l0aCBubyBiaW5kaW5nXG5cdH1lbHNle1xuXHRcdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMsIHNldCByZW5kZXJpbmcgdG8gYmFja2dyb3VuZFxuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0ICAgIH1cblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHQgICAgfVxuXHRcdH07XG5cdH1cblxuXHQvL2luaXRhbGl6ZSB0aGUgY2FsZW5kYXIhXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcihleHBvcnRzLmNhbGVuZGFyRGF0YSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgY2FsZW5kYXIgYnkgY2xvc2luZyBtb2RhbHMgYW5kIHJlbG9hZGluZyBkYXRhXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGZvcm0gdG8gaGlkZSAoYW5kIHRoZSBzcGluKVxuICogQHBhcmFtIHJlcG9uc2UgLSB0aGUgQXhpb3MgcmVwc29uc2Ugb2JqZWN0IHJlY2VpdmVkXG4gKi9cbnZhciByZXNldENhbGVuZGFyID0gZnVuY3Rpb24oZWxlbWVudCwgcmVzcG9uc2Upe1xuXHQvL2hpZGUgdGhlIGZvcm1cblx0JChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vZGlzcGxheSB0aGUgbWVzc2FnZSB0byB0aGUgdXNlclxuXHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHQvL3JlZnJlc2ggdGhlIGNhbGVuZGFyXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdGlmKHdpbmRvdy5hZHZpc29yKXtcblx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBSkFYIG1ldGhvZCB0byBzYXZlIGRhdGEgZnJvbSBhIGZvcm1cbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBzb3VyY2UgZWxlbWVudCBvZiB0aGUgZGF0YVxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFNhdmUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbil7XG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdCAgLy9pZiByZXNwb25zZSBpcyAyeHhcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHR9KVxuXHRcdC8vaWYgcmVzcG9uc2UgaXMgbm90IDJ4eFxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdH0pO1xufVxuXG52YXIgYWpheERlbGV0ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uLCBub1Jlc2V0LCBub0Nob2ljZSl7XG5cdC8vY2hlY2sgbm9SZXNldCB2YXJpYWJsZVxuXHRub1Jlc2V0IHx8IChub1Jlc2V0ID0gZmFsc2UpO1xuXHRub0Nob2ljZSB8fCAobm9DaG9pY2UgPSBmYWxzZSk7XG5cblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGNvbmZpcm1hdGlvblxuXHRpZighbm9DaG9pY2Upe1xuXHRcdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0fWVsc2V7XG5cdFx0dmFyIGNob2ljZSA9IHRydWU7XG5cdH1cblxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXG5cdFx0Ly9pZiBjb25maXJtZWQsIHNob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoZWxlbWVudCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9tYWtlIEFKQVggcmVxdWVzdCB0byBkZWxldGVcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKG5vUmVzZXQpe1xuXHRcdFx0XHRcdC8vaGlkZSBwYXJlbnQgZWxlbWVudCAtIFRPRE8gVEVTVE1FXG5cdFx0XHRcdFx0Ly9jYWxsZXIucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgYSBtZWV0aW5nXG4gKi9cbnZhciBzYXZlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVFdmVudHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRzdGFydDogbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHRlbmQ6IG1vbWVudCgkKCcjZW5kJykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdHRpdGxlOiAkKCcjdGl0bGUnKS52YWwoKSxcblx0XHRkZXNjOiAkKCcjZGVzYycpLnZhbCgpLFxuXHRcdHN0YXR1czogJCgnI3N0YXR1cycpLnZhbCgpXG5cdH07XG5cdGRhdGEuaWQgPSBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEO1xuXHRpZigkKCcjbWVldGluZ0lEJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLm1lZXRpbmdpZCA9ICQoJyNtZWV0aW5nSUQnKS52YWwoKTtcblx0fVxuXHRpZigkKCcjc3R1ZGVudGlkdmFsJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLnN0dWRlbnRpZCA9ICQoJyNzdHVkZW50aWR2YWwnKS52YWwoKTtcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9jcmVhdGVtZWV0aW5nJztcblxuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ3NhdmUgbWVldGluZycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYSBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIHVybFxuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6ICQoJyNtZWV0aW5nSUQnKS52YWwoKVxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ2RlbGV0ZSBtZWV0aW5nJywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3B1bGF0ZSBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBlZGl0aW5nXG4gKlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIGVkaXRcbiAqL1xudmFyIHNob3dNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGV2ZW50KXtcblx0JCgnI3RpdGxlJykudmFsKGV2ZW50LnRpdGxlKTtcblx0JCgnI3N0YXJ0JykudmFsKGV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNlbmQnKS52YWwoZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNkZXNjJykudmFsKGV2ZW50LmRlc2MpO1xuXHRkdXJhdGlvbk9wdGlvbnMoZXZlbnQuc3RhcnQsIGV2ZW50LmVuZCk7XG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoZXZlbnQuaWQpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHQkKCcjc3RhdHVzJykudmFsKGV2ZW50LnN0YXR1cyk7XG5cdCQoJyNkZWxldGVCdXR0b24nKS5zaG93KCk7XG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGNyZWF0aW9uXG4gKlxuICogQHBhcmFtIGNhbGVuZGFyU3R1ZGVudE5hbWUgLSBzdHJpbmcgbmFtZSBvZiB0aGUgc3R1ZGVudFxuICovXG52YXIgY3JlYXRlTWVldGluZ0Zvcm0gPSBmdW5jdGlvbihjYWxlbmRhclN0dWRlbnROYW1lKXtcblxuXHQvL3BvcHVsYXRlIHRoZSB0aXRsZSBhdXRvbWF0aWNhbGx5IGZvciBhIHN0dWRlbnRcblx0aWYoY2FsZW5kYXJTdHVkZW50TmFtZSAhPT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjdGl0bGUnKS52YWwoY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1lbHNle1xuXHRcdCQoJyN0aXRsZScpLnZhbCgnJyk7XG5cdH1cblxuXHQvL1NldCBzdGFydCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI3N0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBlbmQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2VuZCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBkdXJhdGlvbiBvcHRpb25zXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKSwgbW9tZW50KCkuaG91cig4KS5taW51dGUoMjApKTtcblx0fWVsc2V7XG5cdFx0ZHVyYXRpb25PcHRpb25zKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LCBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQpO1xuXHR9XG5cblx0Ly9SZXNldCBvdGhlciBvcHRpb25zXG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHQvL0hpZGUgZGVsZXRlIGJ1dHRvblxuXHQkKCcjZGVsZXRlQnV0dG9uJykuaGlkZSgpO1xuXG5cdC8vU2hvdyB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIG9uIHRoaXMgcGFnZVxuICovXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgJCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2V0IGR1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBtZWV0aW5nIGZvcm1cbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lXG4gKiBAcGFyYW0gZW5kIC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kaW5nIHRpbWVcbiAqL1xudmFyIGR1cmF0aW9uT3B0aW9ucyA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuXHQvL2NsZWFyIHRoZSBsaXN0XG5cdCQoJyNkdXJhdGlvbicpLmVtcHR5KCk7XG5cblx0Ly9hc3N1bWUgYWxsIG1lZXRpbmdzIGhhdmUgcm9vbSBmb3IgMjAgbWludXRlc1xuXHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPScyMCc+MjAgbWludXRlczwvb3B0aW9uPlwiKTtcblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDoyMCwgYWxsb3cgNDAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMjApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc0MCc+NDAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjAwLCBhbGxvdyA2MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNjAnPjYwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL3NldCBkZWZhdWx0IHZhbHVlIGJhc2VkIG9uIGdpdmVuIHNwYW5cblx0JCgnI2R1cmF0aW9uJykudmFsKGVuZC5kaWZmKHN0YXJ0LCBcIm1pbnV0ZXNcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsaW5rIHRoZSBkYXRlcGlja2VycyB0b2dldGhlclxuICpcbiAqIEBwYXJhbSBlbGVtMSAtIGpRdWVyeSBvYmplY3QgZm9yIGZpcnN0IGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBlbGVtMiAtIGpRdWVyeSBvYmplY3QgZm9yIHNlY29uZCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgbGlua0RhdGVQaWNrZXJzID0gZnVuY3Rpb24oZWxlbTEsIGVsZW0yLCBkdXJhdGlvbil7XG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIGZpcnN0IGRhdGFwaWNrZXJcblx0JChlbGVtMSArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTIgPSBtb21lbnQoJChlbGVtMikudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNBZnRlcihkYXRlMikgfHwgZS5kYXRlLmlzU2FtZShkYXRlMikpe1xuXHRcdFx0ZGF0ZTIgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTIpLnZhbChkYXRlMi5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gc2Vjb25kIGRhdGVwaWNrZXJcblx0JChlbGVtMiArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTEgPSBtb21lbnQoJChlbGVtMSkudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNCZWZvcmUoZGF0ZTEpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTEpKXtcblx0XHRcdGRhdGUxID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0xKS52YWwoZGF0ZTEuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBjaGFuZ2VEdXJhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdHZhciBuZXdEYXRlID0gbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCAnTExMJykuYWRkKCQodGhpcykudmFsKCksIFwibWludXRlc1wiKTtcblx0JCgnI2VuZCcpLnZhbChuZXdEYXRlLmZvcm1hdChcIkxMTFwiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZlcmlmeSB0aGF0IHRoZSBzdHVkZW50cyBhcmUgc2VsZWN0aW5nIG1lZXRpbmdzIHRoYXQgYXJlbid0IHRvbyBsb25nXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBtZWV0aW5nXG4gKiBAcGFyYW0gZW5kIC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZCBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgc3R1ZGVudFNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblxuXHQvL1doZW4gc3R1ZGVudHMgc2VsZWN0IGEgbWVldGluZywgZGlmZiB0aGUgc3RhcnQgYW5kIGVuZCB0aW1lc1xuXHRpZihlbmQuZGlmZihzdGFydCwgJ21pbnV0ZXMnKSA+IDYwKXtcblxuXHRcdC8vaWYgaW52YWxpZCwgdW5zZWxlY3QgYW5kIHNob3cgYW4gZXJyb3Jcblx0XHRhbGVydChcIk1lZXRpbmdzIGNhbm5vdCBsYXN0IGxvbmdlciB0aGFuIDEgaG91clwiKTtcblx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdH1lbHNle1xuXG5cdFx0Ly9pZiB2YWxpZCwgc2V0IGRhdGEgaW4gdGhlIHNlc3Npb24gYW5kIHNob3cgdGhlIGZvcm1cblx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdGVuZDogZW5kXG5cdFx0fTtcblx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRjcmVhdGVNZWV0aW5nRm9ybShleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9XG59O1xuXG4vKipcbiAqIExvYWQgY29uZmxpY3RpbmcgbWVldGluZ3MgZnJvbSB0aGUgc2VydmVyXG4gKi9cbnZhciBsb2FkQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblxuXHQvL3JlcXVlc3QgY29uZmxpY3RzIHZpYSBBSkFYXG5cdHdpbmRvdy5heGlvcy5nZXQoJy9hZHZpc2luZy9jb25mbGljdHMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0Ly9kaXNhYmxlIGV4aXN0aW5nIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDIwMCwgZGF0YSB3YXMgcmVjZWl2ZWRcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDApe1xuXG5cdFx0XHRcdC8vQXBwZW5kIEhUTUwgZm9yIGNvbmZsaWN0cyB0byBET01cblx0XHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJykuZW1wdHkoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0J2lkJyA6ICdyZXNvbHZlJyt2YWx1ZS5pZCxcblx0XHRcdFx0XHRcdCdjbGFzcyc6ICdtZWV0aW5nLWNvbmZsaWN0Jyxcblx0XHRcdFx0XHRcdCdodG1sJzogXHQnPHA+Jm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBwdWxsLXJpZ2h0IGRlbGV0ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnJm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgcHVsbC1yaWdodCBlZGl0Q29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5FZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+S2VlcCBNZWV0aW5nPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlJyt2YWx1ZS5pZCsnc3BpblwiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vUmUtcmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnNcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdFx0Ly9TaG93IHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuXHRcdCAgLy9JZiByZXNwb25zZSBpcyAyMDQsIG5vIGNvbmZsaWN0cyBhcmUgcHJlc2VudFxuXHRcdFx0fWVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwNCl7XG5cblx0XHRcdFx0Ly9IaWRlIHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBTYXZlIGJsYWNrb3V0cyBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBzYXZlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlQmxhY2tvdXRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCB1cmw7XG5cdHZhciBkYXRhID0ge1xuXHRcdGJzdGFydDogbW9tZW50KCQoJyNic3RhcnQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJlbmQ6IG1vbWVudCgkKCcjYmVuZCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YnRpdGxlOiAkKCcjYnRpdGxlJykudmFsKClcblx0fTtcblx0dmFyIHVybDtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YS5iYmxhY2tvdXRldmVudGlkID0gJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dCc7XG5cdFx0aWYoJCgnI2JibGFja291dGlkJykudmFsKCkgPiAwKXtcblx0XHRcdGRhdGEuYmJsYWNrb3V0aWQgPSAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKTtcblx0XHR9XG5cdFx0ZGF0YS5icmVwZWF0ID0gJCgnI2JyZXBlYXQnKS52YWwoKTtcblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDEpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnk9ICQoJyNicmVwZWF0ZGFpbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDIpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnkgPSAkKCcjYnJlcGVhdHdlZWtseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNtID0gJCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3QgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdyA9ICQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN1ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c2YgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ3NhdmUgYmxhY2tvdXQnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGJsYWNrb3V0IGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIGRlbGV0ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIFVSTCBhbmQgZGF0YSBvYmplY3Rcblx0dmFyIHVybCwgZGF0YTtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0ZXZlbnRpZDogJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSB9O1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRpZDogJCgnI2JibGFja291dGlkJykudmFsKCkgfTtcblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnZGVsZXRlIGJsYWNrb3V0JywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGNoYW5nZSBvZiByZXBlYXQgb3B0aW9ucyBvbiB0aGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgcmVwZWF0Q2hhbmdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCh0aGlzKS52YWwoKSA9PSAwKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMSl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDIpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fVxufTtcblxuLyoqXG4gKiBTaG93IHRoZSByZXNvbHZlIGNvbmZsaWN0cyBtb2RhbCBmb3JtXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0Ly9zZW5kIEFKQVggZGVsZXRlXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdkZWxldGUgbWVldGluZycsIHRydWUpO1xuXG59O1xuXG4vKipcbiAqIEVkaXQgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZWRpdENvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9tZWV0aW5nJztcblxuXHQvL3Nob3cgc3Bpbm5lciB0byBsb2FkIG1lZXRpbmdcblx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vbG9hZCBtZWV0aW5nIGFuZCBkaXNwbGF5IGZvcm1cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRldmVudCA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRldmVudC5zdGFydCA9IG1vbWVudChldmVudC5zdGFydCk7XG5cdFx0XHRldmVudC5lbmQgPSBtb21lbnQoZXZlbnQuZW5kKTtcblx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgbWVldGluZycsICcjcmVzb2x2ZScgKyBpZCwgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBSZXNvbHZlIGEgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9yZXNvbHZlY29uZmxpY3QnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdyZXNvbHZlIG1lZXRpbmcnLCB0cnVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBjcmVhdGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgY3JlYXRlQmxhY2tvdXRGb3JtID0gZnVuY3Rpb24oKXtcblx0JCgnI2J0aXRsZScpLnZhbChcIlwiKTtcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQoKS5ob3VyKDkpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0JCgnI2JyZXBlYXQnKS52YWwoMCk7XG5cdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmhpZGUoKTtcblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gdG8gYSBzaW5nbGUgb2NjdXJyZW5jZVxuICovXG52YXIgYmxhY2tvdXRPY2N1cnJlbmNlID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9zZXQgZm9ybSB2YWx1ZXMgYW5kIGhpZGUgdW5uZWVkZWQgZmllbGRzXG5cdCQoJyNidGl0bGUnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQudGl0bGUpO1xuXHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjcmVwZWF0ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0JCgnI2JibGFja291dGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkKTtcblx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuaWQpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cblx0Ly9zaG93IHRoZSBmb3JtXG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBibGFja291dCBzZXJpZXMgZWRpdCBmb3JtXG4gKi9cbnZhciBibGFja291dFNlcmllcyA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuIFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRpZDogZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9ibGFja291dCc7XG5cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI2J0aXRsZScpLnZhbChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXHQgXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuc3RhcnQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuZW5kLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChyZXNwb25zZS5kYXRhLmlkKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdCBcdFx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQgXHRcdGlmKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMSl7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdGRhaWx5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9ZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAyKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2x5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0XHRcdFx0dmFyIHJlcGVhdF9kZXRhaWwgPSBTdHJpbmcocmVzcG9uc2UuZGF0YS5yZXBlYXRfZGV0YWlsKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIxXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIyXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIzXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI0XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI1XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9XG5cdCBcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXHQgXHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgYmxhY2tvdXQgc2VyaWVzJywgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IHN0dWRlbnQgaW4gdGhlIGRhdGFiYXNlXG4gKi9cbnZhciBuZXdTdHVkZW50ID0gZnVuY3Rpb24oKXtcblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGFuIGVJRCB0byBhZGQgdG8gdGhlIHN5c3RlbVxuXHR2YXIgZWlkID0gcHJvbXB0KFwiRW50ZXIgdGhlIHN0dWRlbnQncyBlSURcIik7XG5cblx0Ly9idWlsZCB0aGUgVVJMIGFuZCBkYXRhXG5cdHZhciBkYXRhID0ge1xuXHRcdGVpZDogZWlkLFxuXHR9O1xuXHR2YXIgdXJsID0gJy9wcm9maWxlL25ld3N0dWRlbnQnO1xuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGFbXCJlaWRcIl0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xudmFyIEVjaG8gPSByZXF1aXJlKCdsYXJhdmVsLWVjaG8nKTtcbnJlcXVpcmUoJ2lvbi1zb3VuZCcpO1xuXG53aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8qKlxuICogR3JvdXBzZXNzaW9uIGluaXQgZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgdG8gc3RhcnRcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2xvYWQgaW9uLXNvdW5kIGxpYnJhcnlcblx0aW9uLnNvdW5kKHtcbiAgICBzb3VuZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJkb29yX2JlbGxcIlxuICAgICAgICB9LFxuICAgIF0sXG4gICAgdm9sdW1lOiAxLjAsXG4gICAgcGF0aDogXCIvc291bmRzL1wiLFxuICAgIHByZWxvYWQ6IHRydWVcblx0fSk7XG5cblx0Ly9nZXQgdXNlcklEIGFuZCBpc0Fkdmlzb3IgdmFyaWFibGVzXG5cdHdpbmRvdy51c2VySUQgPSBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpO1xuXG5cdC8vcmVnaXN0ZXIgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykub24oJ2NsaWNrJywgZ3JvdXBSZWdpc3RlckJ0bik7XG5cblx0Ly9kaXNhYmxlIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBEaXNhYmxlQnRuJykub24oJ2NsaWNrJywgZ3JvdXBEaXNhYmxlQnRuKTtcblxuXHQvL3JlbmRlciBWdWUgQXBwXG5cdHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2dyb3VwTGlzdCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0cXVldWU6IFtdLFxuXHRcdFx0YWR2aXNvcjogcGFyc2VJbnQoJCgnI2lzQWR2aXNvcicpLnZhbCgpKSA9PSAxLFxuXHRcdFx0dXNlcklEOiBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpLFxuXHRcdFx0b25saW5lOiBbXSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdC8vRnVuY3Rpb24gdG8gZ2V0IENTUyBjbGFzc2VzIGZvciBhIHN0dWRlbnQgb2JqZWN0XG5cdFx0XHRnZXRDbGFzczogZnVuY3Rpb24ocyl7XG5cdFx0XHRcdHJldHVybntcblx0XHRcdFx0XHQnYWxlcnQtaW5mbyc6IHMuc3RhdHVzID09IDAgfHwgcy5zdGF0dXMgPT0gMSxcblx0XHRcdFx0XHQnYWxlcnQtc3VjY2Vzcyc6IHMuc3RhdHVzID09IDIsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1tZSc6IHMudXNlcmlkID09IHRoaXMudXNlcklELFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tb2ZmbGluZSc6ICQuaW5BcnJheShzLnVzZXJpZCwgdGhpcy5vbmxpbmUpID09IC0xLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdC8vZnVuY3Rpb24gdG8gdGFrZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0dGFrZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi90YWtlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICd0YWtlJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHB1dCBhIHN0dWRlbnQgYmFjayBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0XG5cdFx0XHRwdXRTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcHV0J1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdwdXQnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIGZ1bmN0aW9uIHRvIG1hcmsgYSBzdHVkZW50IGRvbmUgb24gdGhlIGxpc3Rcblx0XHRcdGRvbmVTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZG9uZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnbWFyayBkb25lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIGRlbGV0ZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0ZGVsU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RlbGV0ZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnZGVsZXRlJyk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0pXG5cblxuXHQvL0VuYWJsZSBQdXNoZXIgbG9nZ2luZ1xuXHRpZih3aW5kb3cuZW52ID09IFwibG9jYWxcIiB8fCB3aW5kb3cuZW52ID09IFwic3RhZ2luZ1wiKXtcblx0XHRjb25zb2xlLmxvZyhcIlB1c2hlciBsb2dnaW5nIGVuYWJsZWQhXCIpO1xuXHRcdFB1c2hlci5sb2dUb0NvbnNvbGUgPSB0cnVlO1xuXHR9XG5cblx0Ly9Mb2FkIHRoZSBFY2hvIGluc3RhbmNlIG9uIHRoZSB3aW5kb3dcblx0d2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG5cdFx0YnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuXHRcdGtleTogd2luZG93LnB1c2hlcktleSxcblx0XHRjbHVzdGVyOiB3aW5kb3cucHVzaGVyQ2x1c3Rlcixcblx0fSk7XG5cblx0Ly9CaW5kIHRvIHRoZSBjb25uZWN0ZWQgYWN0aW9uIG9uIFB1c2hlciAoY2FsbGVkIHdoZW4gY29ubmVjdGVkKVxuXHR3aW5kb3cuRWNoby5jb25uZWN0b3IucHVzaGVyLmNvbm5lY3Rpb24uYmluZCgnY29ubmVjdGVkJywgZnVuY3Rpb24oKXtcblx0XHQvL3doZW4gY29ubmVjdGVkLCBkaXNhYmxlIHRoZSBzcGlubmVyXG5cdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vTG9hZCB0aGUgaW5pdGlhbCBzdHVkZW50IHF1ZXVlIHZpYSBBSkFYXG5cdFx0d2luZG93LmF4aW9zLmdldCgnL2dyb3Vwc2Vzc2lvbi9xdWV1ZScpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZS5jb25jYXQocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGNoZWNrQnV0dG9ucyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignZ2V0IHF1ZXVlJywgJycsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KVxuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uIGNoYW5uZWxcblx0Lypcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cblx0XHR9KTtcbiAqL1xuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uZW5kIGNoYW5uZWxcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uZW5kJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25FbmQnLCAoZSkgPT4ge1xuXG5cdFx0XHQvL2lmIGVuZGluZywgcmVkaXJlY3QgYmFjayB0byBob21lIHBhZ2Vcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvZ3JvdXBzZXNzaW9uXCI7XG5cdH0pO1xuXG5cdHdpbmRvdy5FY2hvLmpvaW4oJ3ByZXNlbmNlJylcblx0XHQuaGVyZSgodXNlcnMpID0+IHtcblx0XHRcdHZhciBsZW4gPSB1c2Vycy5sZW5ndGg7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlcnNbaV0uaWQpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmpvaW5pbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2VyLmlkKTtcblx0XHR9KVxuXHRcdC5sZWF2aW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnNwbGljZSggJC5pbkFycmF5KHVzZXIuaWQsIHdpbmRvdy52bS5vbmxpbmUpLCAxKTtcblx0XHR9KVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblx0XHRcdHZhciBxdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZTtcblx0XHRcdHZhciBmb3VuZCA9IGZhbHNlO1xuXHRcdFx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblxuXHRcdFx0Ly91cGRhdGUgdGhlIHF1ZXVlIGJhc2VkIG9uIHJlc3BvbnNlXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRpZihxdWV1ZVtpXS5pZCA9PT0gZGF0YS5pZCl7XG5cdFx0XHRcdFx0aWYoZGF0YS5zdGF0dXMgPCAzKXtcblx0XHRcdFx0XHRcdHF1ZXVlW2ldID0gZGF0YTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHF1ZXVlLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHRcdGxlbi0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9pZiBlbGVtZW50IG5vdCBmb3VuZCBvbiBjdXJyZW50IHF1ZXVlLCBwdXNoIGl0IG9uIHRvIHRoZSBxdWV1ZVxuXHRcdFx0aWYoIWZvdW5kKXtcblx0XHRcdFx0cXVldWUucHVzaChkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9jaGVjayB0byBzZWUgaWYgY3VycmVudCB1c2VyIGlzIG9uIHF1ZXVlIGJlZm9yZSBlbmFibGluZyBidXR0b25cblx0XHRcdGNoZWNrQnV0dG9ucyhxdWV1ZSk7XG5cblx0XHRcdC8vaWYgY3VycmVudCB1c2VyIGlzIGZvdW5kLCBjaGVjayBmb3Igc3RhdHVzIHVwZGF0ZSB0byBwbGF5IHNvdW5kXG5cdFx0XHRpZihkYXRhLnVzZXJpZCA9PT0gdXNlcklEKXtcblx0XHRcdFx0Y2hlY2tEaW5nKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NvcnQgdGhlIHF1ZXVlIGNvcnJlY3RseVxuXHRcdFx0cXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXG5cdFx0XHQvL3VwZGF0ZSBWdWUgc3RhdGUsIG1pZ2h0IGJlIHVubmVjZXNzYXJ5XG5cdFx0XHR3aW5kb3cudm0ucXVldWUgPSBxdWV1ZTtcblx0XHR9KTtcblxufTtcblxuXG4vKipcbiAqIFZ1ZSBmaWx0ZXIgZm9yIHN0YXR1cyB0ZXh0XG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgc3R1ZGVudCB0byByZW5kZXJcbiAqL1xuVnVlLmZpbHRlcignc3RhdHVzdGV4dCcsIGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMCkgcmV0dXJuIFwiTkVXXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAxKSByZXR1cm4gXCJRVUVVRURcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDIpIHJldHVybiBcIk1FRVQgV0lUSCBcIiArIGRhdGEuYWR2aXNvcjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDMpIHJldHVybiBcIkRFTEFZXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA0KSByZXR1cm4gXCJBQlNFTlRcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDUpIHJldHVybiBcIkRPTkVcIjtcbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3Vwc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB3aW5kb3cudXNlcklEICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJyArIHRva2VuICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSkgLy9pdCBoYXMgdG8gYmUgYWRkZWQgc29tZXdoZXJlIGludG8gdGhlIDxib2R5PlxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5hYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGVuYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkaXNhYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGRpc2FibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgYW5kIHNlZSBpZiB1c2VyIGlzIG9uIHRoZSBsaXN0IC0gaWYgbm90LCBkb24ndCBlbmFibGUgYnV0dG9uXG4gKi9cbnZhciBjaGVja0J1dHRvbnMgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdHZhciBmb3VuZE1lID0gZmFsc2U7XG5cblx0Ly9pdGVyYXRlIHRocm91Z2ggdXNlcnMgb24gbGlzdCwgbG9va2luZyBmb3IgY3VycmVudCB1c2VyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGZvdW5kTWUgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly9pZiBmb3VuZCwgZGlzYWJsZSBidXR0b247IGlmIG5vdCwgZW5hYmxlIGJ1dHRvblxuXHRpZihmb3VuZE1lKXtcblx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdH1lbHNle1xuXHRcdGVuYWJsZUJ1dHRvbigpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYmVja29uZWQsIGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBwZXJzb24gLSB0aGUgY3VycmVudCB1c2VyIHRvIGNoZWNrXG4gKi9cbnZhciBjaGVja0RpbmcgPSBmdW5jdGlvbihwZXJzb24pe1xuXHRpZihwZXJzb24uc3RhdHVzID09IDIpe1xuXHRcdGlvbi5zb3VuZC5wbGF5KFwiZG9vcl9iZWxsXCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBlcnNvbiBoYXMgYmVlbiBiZWNrb25lZCBvbiBsb2FkOyBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcXVldWUgLSB0aGUgaW5pdGlhbCBxdWV1ZSBvZiB1c2VycyBsb2FkZWRcbiAqL1xudmFyIGluaXRpYWxDaGVja0RpbmcgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdCQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZVByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Zmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcblx0XHRcdGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuXHRcdH07XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0Ly9zZW5kIEFKQVggcG9zdFxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3IgYWR2aXNvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZUFkdmlzb3JQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHQvL1RPRE8gVEVTVE1FXG5cdFx0dmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRkYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0ZGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdCQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdFx0JCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdC8vaHR0cDovL3d3dy5hYmVhdXRpZnVsc2l0ZS5uZXQvd2hpcHBpbmctZmlsZS1pbnB1dHMtaW50by1zaGFwZS13aXRoLWJvb3RzdHJhcC0zL1xuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuXHQgIHZhciBpbnB1dCA9ICQodGhpcyksXG5cdCAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG5cdCAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuXHQgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG5cdH0pO1xuXG5cdC8vYmluZCB0byBmaWxlc2VsZWN0IGJ1dHRvblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpO1xuXHRcdFx0dmFyIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgICBpZihsb2cpe1xuXHRcdFx0XHRcdFx0YWxlcnQobG9nKTtcblx0XHRcdFx0XHR9XG4gICAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwiLy9sb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2FkbWluLWx0ZScpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQnKTtcbnJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0LWJzJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG5cbi8vb3B0aW9ucyBmb3IgZGF0YXRhYmxlc1xuZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zID0ge1xuICBcInBhZ2VMZW5ndGhcIjogNTAsXG4gIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxufVxuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IG9uIGFsbCBkYXRhdGFibGVzIHBhZ2VzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBjdXN0b20gZGF0YXRhYmxlcyBvcHRpb25zXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICBvcHRpb25zIHx8IChvcHRpb25zID0gZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zKTtcbiAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKG9wdGlvbnMpO1xuICBzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG4gICQoJyNhZG1pbmx0ZS10b2dnbGVtZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ3NpZGViYXItb3BlbicpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBpZCAtIHRoZSBpZCBvZiB0aGUgaXRlbSB0byBiZSBzYXZlLWRldlxuICogQHBhcmFtIGxvYWRwaWN0dXJlIC0gdHJ1ZSB0byByZWxvYWQgYSBwcm9maWxlIHBpY3R1cmVcbiAqL1xuZXhwb3J0cy5hamF4c2F2ZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgaWQsIGxvYWRwaWN0dXJlKXtcbiAgbG9hZHBpY3R1cmUgfHwgKGxvYWRwaWN0dXJlID0gZmFsc2UpO1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJlc3BvbnNlLmRhdGEpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgICBpZihsb2FkcGljdHVyZSkgZXhwb3J0cy5sb2FkcGljdHVyZShpZCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gc2F2ZSB2aWEgQUpBWCBvbiBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIG1vZGFsIGVsZW1lbnQgdG8gY2xvc2VcbiAqL1xuZXhwb3J0cy5hamF4bW9kYWxzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBlbGVtZW50KXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAkKCcjdGFibGUnKS5EYXRhVGFibGUoKS5hamF4LnJlbG9hZCgpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIHBpY3R1cmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gaWQgLSB0aGUgdXNlciBJRCBvZiB0aGUgcGljdHVyZSB0byByZWxvYWRcbiAqL1xuZXhwb3J0cy5sb2FkcGljdHVyZSA9IGZ1bmN0aW9uKGlkKXtcbiAgd2luZG93LmF4aW9zLmdldCgnL3Byb2ZpbGUvcGljLycgKyBpZClcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKCcjcGljdGV4dCcpLnZhbChyZXNwb25zZS5kYXRhKTtcbiAgICAgICQoJyNwaWNpbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBwaWN0dXJlJywgJycsIGVycm9yKTtcbiAgICB9KVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvIGFmdGVyIGRlbGV0ZVxuICogQHBhcmFtIHNvZnQgLSBib29sZWFuIGlmIHRoaXMgaXMgYSBzb2Z0IGRlbGV0ZSBvciBub3RcbiAqL1xuZXhwb3J0cy5hamF4ZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgcmV0VXJsLCBzb2Z0ID0gZmFsc2Upe1xuICBpZihzb2Z0KXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gIH1lbHNle1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIGFsbCByZWxhdGVkIHJlY29yZHMuIFlvdSBjYW5ub3QgdW5kbyB0aGlzIGFjdGlvbi5cIik7XG4gIH1cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXRVcmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtIGZyb20gYSBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbGRlbGV0ZSA9IGZ1bmN0aW9uIChkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICAgJChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAkKCcjdGFibGUnKS5EYXRhVGFibGUoKS5hamF4LnJlbG9hZCgpO1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdkZWxldGUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXN0b3JlIGEgc29mdC1kZWxldGVkIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBpdGVtIHRvIGJlIHJlc3RvcmVkXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoYXQgaW5mb3JtYXRpb24gdG9cbiAqIEBwYXJhbSByZXRVcmwgLSB0aGUgVVJMIHRvIHJldHVybiB0b1xuICovXG5leHBvcnRzLmFqYXhyZXN0b3JlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCByZXRVcmwpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXRVcmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3Jlc3RvcmUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhdXRvY29tcGxldGUgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSBJRCBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHJlcXVlc3QgZGF0YSBmcm9tXG4gKi9cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICAkKCcjJyArIGlkICsgJ2F1dG8nKS5hdXRvY29tcGxldGUoe1xuXHQgICAgc2VydmljZVVybDogdXJsLFxuXHQgICAgYWpheFNldHRpbmdzOiB7XG5cdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHQgICAgfSxcbiAgICAgIG1pbkNoYXJzOiAzLFxuXHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdCAgICAgICAgJCgnIycgKyBpZCkudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgICAgJCgnIycgKyBpZCArICd0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBzdWdnZXN0aW9uLmRhdGEgKyBcIikgXCIgKyBzdWdnZXN0aW9uLnZhbHVlKTtcblx0ICAgIH0sXG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0ICAgICAgICAgICAgfSlcblx0ICAgICAgICB9O1xuXHQgICAgfVxuXHR9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlYmxhY2tvdXRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYmxhY2tvdXRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgLy8kKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld3N0dWRlbnRcIj5OZXcgU3R1ZGVudDwvYT4nKTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZ3JvdXBzZXNzaW9uXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2dyb3Vwc2Vzc2lvbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICAvL2xvYWQgY3VzdG9tIGJ1dHRvbiBvbiB0aGUgZG9tXG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQoKTtcblxuICAvL2JpbmQgc2V0dGluZ3MgYnV0dG9uc1xuICAkKCcuc2V0dGluZ3NidXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAga2V5OiAkKHRoaXMpLmF0dHIoJ2lkJyksXG4gICAgfTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9zYXZlc2V0dGluZyc7XG5cbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsICcvYWRtaW4vc2V0dGluZ3MnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICAvL2JpbmQgbmV3IHNldHRpbmcgYnV0dG9uXG4gICQoJyNuZXdzZXR0aW5nJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgY2hvaWNlID0gcHJvbXB0KFwiRW50ZXIgYSBuYW1lIGZvciB0aGUgbmV3IHNldHRpbmc6XCIpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAga2V5OiBjaG9pY2UsXG4gICAgfTtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vbmV3c2V0dGluZ1wiXG5cbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsICcvYWRtaW4vc2V0dGluZ3MnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdjcmVhdGUnLCAnJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXJlcXVpcmVtZW50cy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2NyZWRpdHMnfSxcbiAgICB7J2RhdGEnOiAnc2VtZXN0ZXInfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnbm90ZXMnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIG9wdGlvbnMub3JkZXIgPSBbXG4gICAgWzMsIFwiYXNjXCJdLFxuICAgIFs0LCBcImFzY1wiXSxcbiAgXTtcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPk5ldyBEZWdyZWUgUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9uYW1lID0gJCgnI2NvdXJzZV9uYW1lJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXJlcXVpcmVtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlZ3JlZXJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVncmVlcmVxdWlyZW1lbnRcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4bW9kYWxkZWxldGUoZGF0YSwgdXJsLCAnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNzZW1lc3RlcicpLnZhbChtZXNzYWdlLmRhdGEuc2VtZXN0ZXIpO1xuICAgICAgICAkKCcjb3JkZXJpbmcnKS52YWwobWVzc2FnZS5kYXRhLm9yZGVyaW5nKTtcbiAgICAgICAgJCgnI2NyZWRpdHMnKS52YWwobWVzc2FnZS5kYXRhLmNyZWRpdHMpO1xuICAgICAgICAkKCcjbm90ZXMnKS52YWwobWVzc2FnZS5kYXRhLm5vdGVzKTtcbiAgICAgICAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEudHlwZSA9PSBcImNvdXJzZVwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNlIGlmIChtZXNzYWdlLmRhdGEudHlwZSA9PSBcImVsZWN0aXZlbGlzdFwiKXtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcmVxdWlyZW1lbnQnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT1yZXF1aXJlYWJsZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNzZW1lc3RlcicpLnZhbChcIlwiKTtcbiAgJCgnI29yZGVyaW5nJykudmFsKFwiXCIpO1xuICAkKCcjY3JlZGl0cycpLnZhbChcIlwiKTtcbiAgJCgnI25vdGVzJykudmFsKFwiXCIpO1xuICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9lbGVjdGl2ZWxpc3Rjb3Vyc2VzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIG9wdGlvbnMub3JkZXIgPSBbXG4gICAgWzEsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+QWRkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBlbGVjdGl2ZWxpc3RfaWQ6ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSxcbiAgICAgIGNvdXJzZV9wcmVmaXg6ICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmFuZ2UnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGRhdGEuY291cnNlX21pbl9udW1iZXIgPSAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9tYXhfbnVtYmVyID0gJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZWxlY3RpdmVsaXN0Y291cnNlJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2VsZWN0aXZlY291cnNlLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWVsZWN0aXZlY291cnNlXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdmlldycpLnZhbCgkKCcjZWxlY3RpdmVsaXN0X2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfcHJlZml4KTtcbiAgICAgICAgJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWluX251bWJlcik7XG4gICAgICAgIGlmKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWF4X251bWJlcil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWF4X251bWJlcik7XG4gICAgICAgICAgJCgnI3JhbmdlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAgICAgICAgICQoJyNyYW5nZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGVsZWN0aXZlIGxpc3QgY291cnNlJywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICAkKCdpbnB1dFtuYW1lPXJhbmdlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmFuZ2UnXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoXCJcIik7XG4gICQoJyNyYW5nZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL3BsYW5yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XTtcbiAgb3B0aW9ucy5vcmRlciA9IFtcbiAgICBbMywgXCJhc2NcIl0sXG4gICAgWzQsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IFBsYW4gUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgLy9hZGRlZCBmb3IgbmV3IHNlbWVzdGVycyB0YWJsZVxuICB2YXIgb3B0aW9uczIgPSB7XG4gICAgXCJwYWdlTGVuZ3RoXCI6IDUwLFxuICAgIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxuICB9XG4gIG9wdGlvbnMyLmRvbSA9ICc8XCJuZXdidXR0b24yXCI+ZnJ0aXAnO1xuICBvcHRpb25zMi5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMyLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9uczIuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0c2VtXFxcIiBocmVmPVxcXCIvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyL1wiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dO1xuICBvcHRpb25zMi5vcmRlciA9IFtcbiAgICBbMiwgXCJhc2NcIl0sXG4gIF07XG4gICQoJyN0YWJsZXNlbScpLkRhdGFUYWJsZShvcHRpb25zMik7XG5cbiAgJChcImRpdi5uZXdidXR0b24yXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyBpZCArICdcIiBpZD1cIm5ldzJcIj5OZXcgU2VtZXN0ZXI8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjc2VtZXN0ZXJfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5zZW1lc3Rlcl9pZCA9ICQoJyNzZW1lc3Rlcl9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9uYW1lID0gJCgnI2NvdXJzZV9uYW1lJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW5yZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlcGxhbnJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNwbGFucmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5yZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNvcmRlcmluZycpLnZhbChtZXNzYWdlLmRhdGEub3JkZXJpbmcpO1xuICAgICAgICAkKCcjY3JlZGl0cycpLnZhbChtZXNzYWdlLmRhdGEuY3JlZGl0cyk7XG4gICAgICAgICQoJyNub3RlcycpLnZhbChtZXNzYWdlLmRhdGEubm90ZXMpO1xuICAgICAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRfaWQnKS52YWwobWVzc2FnZS5kYXRhLmRlZ3JlZXJlcXVpcmVtZW50X2lkKTtcbiAgICAgICAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEudHlwZSA9PSBcImNvdXJzZVwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNlIGlmIChtZXNzYWdlLmRhdGEudHlwZSA9PSBcImVsZWN0aXZlbGlzdFwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcblxuICAgICAgICB2YXIgc2VtZXN0ZXJfaWQgPSBtZXNzYWdlLmRhdGEuc2VtZXN0ZXJfaWQ7XG5cbiAgICAgICAgLy9sb2FkIHNlbWVzdGVyc1xuICAgICAgICB2YXIgcGxhbmlkID0gJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICAgICAgd2luZG93LmF4aW9zLmdldCgnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIHBsYW5pZClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgICAgIHZhciBsaXN0aXRlbXMgPSAnJztcbiAgICAgICAgICAgICQuZWFjaChtZXNzYWdlLmRhdGEsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAgICBsaXN0aXRlbXMgKz0gJzxvcHRpb24gdmFsdWU9JyArIHZhbHVlLmlkICsgJz4nICsgdmFsdWUubmFtZSArJzwvb3B0aW9uPic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpLmVuZCgpLmFwcGVuZChsaXN0aXRlbXMpO1xuICAgICAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykudmFsKHNlbWVzdGVyX2lkKTtcbiAgICAgICAgICAgICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBzZW1lc3RlcnMnLCAnJywgZXJyb3IpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50X2lkJykudmFsKFwiXCIpO1xuICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbC5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG53aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgZHJhZ2dhYmxlID0gcmVxdWlyZSgndnVlZHJhZ2dhYmxlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgd2luZG93LnZtID0gbmV3IFZ1ZSh7XG5cdFx0ZWw6ICcjZmxvd2NoYXJ0Jyxcblx0XHRkYXRhOiB7XG5cdFx0XHRwbGFuOiBbXSxcbiAgICAgIHNlbWVzdGVyczogW10sXG5cdFx0fSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBlZGl0U2VtZXN0ZXI6IGVkaXRTZW1lc3RlcixcbiAgICAgIHNhdmVTZW1lc3Rlcjogc2F2ZVNlbWVzdGVyLFxuICAgICAgZGVsZXRlU2VtZXN0ZXI6IGRlbGV0ZVNlbWVzdGVyLFxuICAgICAgZHJvcFNlbWVzdGVyOiBkcm9wU2VtZXN0ZXIsXG4gICAgICBkcm9wQ291cnNlOiBkcm9wQ291cnNlLFxuICAgIH0sXG4gICAgY29tcG9uZW50czoge1xuICAgICAgZHJhZ2dhYmxlLFxuICAgIH0sXG4gIH0pO1xuXG4gIGxvYWREYXRhKCk7XG5cbiAgJCgnI3Jlc2V0Jykub24oJ2NsaWNrJywgbG9hZERhdGEpO1xuICAkKCcjYWRkLXNlbScpLm9uKCdjbGljaycsIGFkZFNlbWVzdGVyKTtcblxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIG9yZGVyaW5nXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBpdGVtXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBpdGVtXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLm9yZGVyaW5nID09IGIub3JkZXJpbmcpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5vcmRlcmluZyA8IGIub3JkZXJpbmcgPyAtMSA6IDEpO1xufVxuXG52YXIgbG9hZERhdGEgPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZClcbiAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMgPSByZXNwb25zZS5kYXRhO1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMuc29ydChzb3J0RnVuY3Rpb24pO1xuICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgICAgIHZhciBzZW1lc3RlciA9IHdpbmRvdy52bS5zZW1lc3RlcnMuZmluZChmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudC5pZCA9PSB2YWx1ZS5zZW1lc3Rlcl9pZDtcbiAgICAgICAgfSlcbiAgICAgICAgc2VtZXN0ZXIuY291cnNlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgJC5lYWNoKHdpbmRvdy52bS5zZW1lc3RlcnMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgICAgIHZhbHVlLmNvdXJzZXMuc29ydChzb3J0RnVuY3Rpb24pO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZ2V0IGRhdGEnLCAnJywgZXJyb3IpO1xuICAgIH0pO1xuICB9KVxuICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBkYXRhJywgJycsIGVycm9yKTtcbiAgfSk7XG59XG5cbnZhciBlZGl0U2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBzZW1pZCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuaGlkZSgpO1xufVxuXG52YXIgc2F2ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgdmFyIHNlbWlkID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG4gIHZhciBkYXRhID0ge1xuICAgIGlkOiBzZW1pZCxcbiAgICBuYW1lOiAkKFwiI3NlbS10ZXh0LVwiICsgc2VtaWQpLnZhbCgpXG4gIH1cbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL3NhdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoXCIjc2VtLXBhbmVsZWRpdC1cIiArIHNlbWlkKS5oaWRlKCk7XG4gICAgICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRlbGV0ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gICAgaWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICB2YXIgc2VtaWQgPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiBzZW1pZCxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9kZWxldGUnLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgaWYod2luZG93LnZtLnNlbWVzdGVyc1tpXS5pZCA9PSBzZW1pZCl7XG4gICAgICAgICAgICB3aW5kb3cudm0uc2VtZXN0ZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICAgIH0pO1xuICB9XG59XG5cbnZhciBhZGRTZW1lc3RlciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgfTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL2FkZCcsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgd2luZG93LnZtLnNlbWVzdGVycy5wdXNoKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgLy9WdWUuc2V0KHdpbmRvdy52bS5zZW1lc3RlcnNbd2luZG93LnZtLnNlbWVzdGVyLmxlbmd0aCAtIDFdLCAnY291cnNlcycsIG5ldyBBcnJheSgpKTtcbiAgICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiSXRlbSBTYXZlZFwiLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRyb3BTZW1lc3RlciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIG9yZGVyaW5nID0gW107XG4gICQuZWFjaCh3aW5kb3cudm0uc2VtZXN0ZXJzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgIG9yZGVyaW5nLnB1c2goe1xuICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgIH0pO1xuICB9KTtcbiAgdmFyIGRhdGEgPSB7XG4gICAgb3JkZXJpbmc6IG9yZGVyaW5nLFxuICB9XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZCArICcvbW92ZScsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRyb3BDb3Vyc2UgPSBmdW5jdGlvbihldmVudCl7XG4gIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgdmFyIG9yZGVyaW5nID0gW107XG4gIHZhciB0b1NlbUluZGV4ID0gJChldmVudC50bykuZGF0YSgnaWQnKTtcbiAgJC5lYWNoKHdpbmRvdy52bS5zZW1lc3RlcnNbdG9TZW1JbmRleF0uY291cnNlcywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICBvcmRlcmluZy5wdXNoKHtcbiAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBkYXRhID0ge1xuICAgIHNlbWVzdGVyX2lkOiB3aW5kb3cudm0uc2VtZXN0ZXJzW3RvU2VtSW5kZXhdLmlkLFxuICAgIGNvdXJzZV9pZDogJChldmVudC5pdGVtKS5kYXRhKCdpZCcpLFxuICAgIG9yZGVyaW5nOiBvcmRlcmluZyxcbiAgfVxuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL2RhdGEvJyArIGlkICsgJy9tb3ZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydGxpc3QuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAyMDhcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9mbG93Y2hhcnQuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMjA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIGZyb20gdGhlIGZsYXNoZWQgc2Vzc2lvbiBkYXRhXG4gKlxuICogdXNlICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgnbWVzc2FnZScsIHRyYW5zKCdtZXNzYWdlcy5pdGVtX3NhdmVkJykpO1xuICogICAgICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgndHlwZScsICdzdWNjZXNzJyk7XG4gKiB0byBzZXQgbWVzc2FnZSB0ZXh0IGFuZCB0eXBlXG4gKi9cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKXtcblx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cImphdmFzY3JpcHRNZXNzYWdlXCIgY2xhc3M9XCJhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LScgKyB0eXBlICsgJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PC9idXR0b24+PHNwYW4gY2xhc3M9XCJoNFwiPicgKyBtZXNzYWdlICsgJzwvc3Bhbj48L2Rpdj4nO1xuXHQkKCcjbWVzc2FnZScpLmFwcGVuZChodG1sKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKFwiI2phdmFzY3JpcHRNZXNzYWdlXCIpLmFsZXJ0KCdjbG9zZScpO1xuXHR9LCAzMDAwKTtcbn07XG5cbi8qXG5leHBvcnRzLmFqYXhjcnNmID0gZnVuY3Rpb24oKXtcblx0JC5hamF4U2V0dXAoe1xuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG5cdFx0fVxuXHR9KTtcbn07XG4qL1xuXG4vKipcbiAqIENsZWFycyBlcnJvcnMgb24gZm9ybXMgYnkgcmVtb3ZpbmcgZXJyb3IgY2xhc3Nlc1xuICovXG5leHBvcnRzLmNsZWFyRm9ybUVycm9ycyA9IGZ1bmN0aW9uKCl7XG5cdCQoJy5mb3JtLWdyb3VwJykuZWFjaChmdW5jdGlvbiAoKXtcblx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFNldHMgZXJyb3JzIG9uIGZvcm1zIGJhc2VkIG9uIHJlc3BvbnNlIEpTT05cbiAqL1xuZXhwb3J0cy5zZXRGb3JtRXJyb3JzID0gZnVuY3Rpb24oanNvbil7XG5cdGV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdCQuZWFjaChqc29uLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdCQoJyMnICsga2V5KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKCcjJyArIGtleSArICdoZWxwJykudGV4dCh2YWx1ZS5qb2luKCcgJykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG1lc3NhZ2VzIGluIHRoZSBmbGFzaCBkYXRhLiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IGJ5IHRoZSBwYWdlXG4gKi9cbmV4cG9ydHMuY2hlY2tNZXNzYWdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCgnI21lc3NhZ2VfZmxhc2gnKS5sZW5ndGgpe1xuXHRcdHZhciBtZXNzYWdlID0gJCgnI21lc3NhZ2VfZmxhc2gnKS52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICQoJyNtZXNzYWdlX3R5cGVfZmxhc2gnKS52YWwoKTtcblx0XHRleHBvcnRzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIHR5cGUpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGVycm9ycyBmcm9tIEFKQVhcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gZXJyb3IgLSB0aGUgQXhpb3MgZXJyb3IgcmVjZWl2ZWRcbiAqL1xuZXhwb3J0cy5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGVsZW1lbnQsIGVycm9yKXtcblx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0ZXhwb3J0cy5zZXRGb3JtRXJyb3JzKGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gXCIgKyBtZXNzYWdlICsgXCI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0aWYoZWxlbWVudC5sZW5ndGggPiAwKXtcblx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCIvKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIGZvciBlZGl0YWJsZSB0ZXh0LWJveGVzIG9uIHRoZSBzaXRlXG4gKiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgLy9Mb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xuICByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG4gIHJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiXSwic291cmNlUm9vdCI6IiJ9