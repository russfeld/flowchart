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

  dashboard.ajaxautocomplete('student_id', '/profile/studentfeed');
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 156:
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

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(158);
module.exports = __webpack_require__(202);


/***/ }),

/***/ 158:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(159);

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
				var calendar = __webpack_require__(190);
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
				var groupsession = __webpack_require__(192);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(195);
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
				var meetingedit = __webpack_require__(196);
				meetingedit.init();
			}
		},

		BlackoutsController: {
			//admin/blackouts
			getBlackouts: function getBlackouts() {
				var blackoutedit = __webpack_require__(197);
				blackoutedit.init();
			}
		},

		GroupsessionsController: {
			//admin/groupsessions
			getGroupsessions: function getGroupsessions() {
				var groupsessionedit = __webpack_require__(198);
				groupsessionedit.init();
			}
		},

		SettingsController: {
			//admin/settings
			getSettings: function getSettings() {
				var settings = __webpack_require__(199);
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
				var degreeprogramedit = __webpack_require__(200);
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
				var electivelistedit = __webpack_require__(201);
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
			//admin/newplan
			getNewplan: function getNewplan() {
				var planedit = __webpack_require__(155);
				planedit.init();
			}
		},

		CompletedcoursesController: {
			//admin/completedcourses
			getCompletedcourses: function getCompletedcourses() {
				var completedcourseedit = __webpack_require__(156);
				completedcourseedit.init();
			},
			//admin/newcompletedcourse
			getNewcompletedcourse: function getNewcompletedcourse() {
				var completedcourseedit = __webpack_require__(156);
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

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {window._ = __webpack_require__(13);

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = __webpack_provided_window_dot_jQuery = __webpack_require__(1);

__webpack_require__(15);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(16);

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

/***/ 190:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required JS libraries
__webpack_require__(23);
__webpack_require__(11);
var moment = __webpack_require__(0);
var site = __webpack_require__(4);
__webpack_require__(143);
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

/***/ 192:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {window.Vue = __webpack_require__(144);
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

/***/ 195:
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

/***/ 196:
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

/***/ 197:
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

/***/ 198:
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

/***/ 199:
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

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//load required libraries
var site = __webpack_require__(4);
__webpack_require__(148);
__webpack_require__(12);
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

/***/ 201:
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

/***/ 202:
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

},[157]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzPzZkMTAiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIl0sIm5hbWVzIjpbImRhc2hib2FyZCIsInJlcXVpcmUiLCJleHBvcnRzIiwiaW5pdCIsIm9wdGlvbnMiLCJkYXRhVGFibGVPcHRpb25zIiwiZG9tIiwiJCIsImh0bWwiLCJvbiIsImRhdGEiLCJmaXJzdF9uYW1lIiwidmFsIiwibGFzdF9uYW1lIiwiZW1haWwiLCJhZHZpc29yX2lkIiwiZGVwYXJ0bWVudF9pZCIsImlkIiwiZWlkIiwibGVuZ3RoIiwidXJsIiwiYWpheHNhdmUiLCJyZXRVcmwiLCJhamF4ZGVsZXRlIiwiYWpheHJlc3RvcmUiLCJzdW1tZXJub3RlIiwiZm9jdXMiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsImlzIiwiZmlsZXMiLCJkb2N1bWVudCIsImlucHV0IiwibnVtRmlsZXMiLCJnZXQiLCJsYWJlbCIsInJlcGxhY2UiLCJ0cmlnZ2VyIiwiZXZlbnQiLCJwYXJlbnRzIiwiZmluZCIsImxvZyIsImFsZXJ0IiwibmFtZSIsIm9mZmljZSIsInBob25lIiwiYWJicmV2aWF0aW9uIiwiZGVzY3JpcHRpb24iLCJlZmZlY3RpdmVfeWVhciIsImVmZmVjdGl2ZV9zZW1lc3RlciIsInN0YXJ0X3llYXIiLCJzdGFydF9zZW1lc3RlciIsImRlZ3JlZXByb2dyYW1faWQiLCJzdHVkZW50X2lkIiwiYWpheGF1dG9jb21wbGV0ZSIsImNvdXJzZW51bWJlciIsInllYXIiLCJzZW1lc3RlciIsImJhc2lzIiwiZ3JhZGUiLCJjcmVkaXRzIiwiY291cnNlX2lkIiwiQXBwIiwiYWN0aW9ucyIsIlJvb3RSb3V0ZUNvbnRyb2xsZXIiLCJnZXRJbmRleCIsImVkaXRhYmxlIiwic2l0ZSIsImNoZWNrTWVzc2FnZSIsImdldEFib3V0IiwiQWR2aXNpbmdDb250cm9sbGVyIiwiY2FsZW5kYXIiLCJHcm91cHNlc3Npb25Db250cm9sbGVyIiwiZ2V0TGlzdCIsImdyb3Vwc2Vzc2lvbiIsIlByb2ZpbGVzQ29udHJvbGxlciIsInByb2ZpbGUiLCJEYXNoYm9hcmRDb250cm9sbGVyIiwiU3R1ZGVudHNDb250cm9sbGVyIiwiZ2V0U3R1ZGVudHMiLCJzdHVkZW50ZWRpdCIsImdldE5ld3N0dWRlbnQiLCJBZHZpc29yc0NvbnRyb2xsZXIiLCJnZXRBZHZpc29ycyIsImFkdmlzb3JlZGl0IiwiZ2V0TmV3YWR2aXNvciIsIkRlcGFydG1lbnRzQ29udHJvbGxlciIsImdldERlcGFydG1lbnRzIiwiZGVwYXJ0bWVudGVkaXQiLCJnZXROZXdkZXBhcnRtZW50IiwiTWVldGluZ3NDb250cm9sbGVyIiwiZ2V0TWVldGluZ3MiLCJtZWV0aW5nZWRpdCIsIkJsYWNrb3V0c0NvbnRyb2xsZXIiLCJnZXRCbGFja291dHMiLCJibGFja291dGVkaXQiLCJHcm91cHNlc3Npb25zQ29udHJvbGxlciIsImdldEdyb3Vwc2Vzc2lvbnMiLCJncm91cHNlc3Npb25lZGl0IiwiU2V0dGluZ3NDb250cm9sbGVyIiwiZ2V0U2V0dGluZ3MiLCJzZXR0aW5ncyIsIkRlZ3JlZXByb2dyYW1zQ29udHJvbGxlciIsImdldERlZ3JlZXByb2dyYW1zIiwiZGVncmVlcHJvZ3JhbWVkaXQiLCJnZXREZWdyZWVwcm9ncmFtRGV0YWlsIiwiZ2V0TmV3ZGVncmVlcHJvZ3JhbSIsIkVsZWN0aXZlbGlzdHNDb250cm9sbGVyIiwiZ2V0RWxlY3RpdmVsaXN0cyIsImVsZWN0aXZlbGlzdGVkaXQiLCJnZXRFbGVjdGl2ZWxpc3REZXRhaWwiLCJnZXROZXdlbGVjdGl2ZWxpc3QiLCJQbGFuc0NvbnRyb2xsZXIiLCJnZXRQbGFucyIsInBsYW5lZGl0IiwiZ2V0TmV3cGxhbiIsIkNvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyIiwiZ2V0Q29tcGxldGVkY291cnNlcyIsImNvbXBsZXRlZGNvdXJzZWVkaXQiLCJnZXROZXdjb21wbGV0ZWRjb3Vyc2UiLCJjb250cm9sbGVyIiwiYWN0aW9uIiwid2luZG93IiwiXyIsImF4aW9zIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiY29tbW9uIiwidG9rZW4iLCJoZWFkIiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJtb21lbnQiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidHlwZSIsImNvbG9yIiwidGV4dENvbG9yIiwic2VsZWN0YWJsZSIsInNlbGVjdEhlbHBlciIsInNlbGVjdE92ZXJsYXAiLCJyZW5kZXJpbmciLCJ0aW1lRm9ybWF0IiwiZGF0ZVBpY2tlckRhdGEiLCJkYXlzT2ZXZWVrRGlzYWJsZWQiLCJmb3JtYXQiLCJzdGVwcGluZyIsImVuYWJsZWRIb3VycyIsIm1heEhvdXIiLCJzaWRlQnlTaWRlIiwiaWdub3JlUmVhZG9ubHkiLCJhbGxvd0lucHV0VG9nZ2xlIiwiZGF0ZVBpY2tlckRhdGVPbmx5IiwiYWR2aXNvciIsIm5vYmluZCIsInRyaW0iLCJ3aWR0aCIsInByb3AiLCJyZW1vdmVDbGFzcyIsInNob3ciLCJyZXNldEZvcm0iLCJiaW5kIiwibmV3U3R1ZGVudCIsImhpZGUiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzaG93TWVldGluZ0Zvcm0iLCJyZXBlYXQiLCJibGFja291dFNlcmllcyIsIm1vZGFsIiwic2VsZWN0IiwiY2hhbmdlIiwicmVwZWF0Q2hhbmdlIiwic2F2ZUJsYWNrb3V0IiwiZGVsZXRlQmxhY2tvdXQiLCJibGFja291dE9jY3VycmVuY2UiLCJvZmYiLCJlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiY2hvaWNlIiwiY29uZmlybSIsImRlc2MiLCJzdGF0dXMiLCJtZWV0aW5naWQiLCJzdHVkZW50aWQiLCJkdXJhdGlvbk9wdGlvbnMiLCJ1bmRlZmluZWQiLCJob3VyIiwibWludXRlIiwiY2xlYXJGb3JtRXJyb3JzIiwiZW1wdHkiLCJtaW51dGVzIiwiZGlmZiIsImVsZW0xIiwiZWxlbTIiLCJkdXJhdGlvbiIsImRhdGUyIiwiZGF0ZSIsImlzU2FtZSIsImNsb25lIiwiZGF0ZTEiLCJpc0JlZm9yZSIsIm5ld0RhdGUiLCJhZGQiLCJkZWxldGVDb25mbGljdCIsImVkaXRDb25mbGljdCIsInJlc29sdmVDb25mbGljdCIsImluZGV4IiwiYXBwZW5kVG8iLCJic3RhcnQiLCJiZW5kIiwiYnRpdGxlIiwiYmJsYWNrb3V0ZXZlbnRpZCIsImJibGFja291dGlkIiwiYnJlcGVhdCIsImJyZXBlYXRldmVyeSIsImJyZXBlYXR1bnRpbCIsImJyZXBlYXR3ZWVrZGF5c20iLCJicmVwZWF0d2Vla2RheXN0IiwiYnJlcGVhdHdlZWtkYXlzdyIsImJyZXBlYXR3ZWVrZGF5c3UiLCJicmVwZWF0d2Vla2RheXNmIiwicGFyYW1zIiwiYmxhY2tvdXRfaWQiLCJyZXBlYXRfdHlwZSIsInJlcGVhdF9ldmVyeSIsInJlcGVhdF91bnRpbCIsInJlcGVhdF9kZXRhaWwiLCJTdHJpbmciLCJpbmRleE9mIiwicHJvbXB0IiwiVnVlIiwiRWNobyIsIlB1c2hlciIsImlvbiIsInNvdW5kIiwic291bmRzIiwidm9sdW1lIiwicGF0aCIsInByZWxvYWQiLCJ1c2VySUQiLCJwYXJzZUludCIsImdyb3VwUmVnaXN0ZXJCdG4iLCJncm91cERpc2FibGVCdG4iLCJ2bSIsImVsIiwicXVldWUiLCJvbmxpbmUiLCJtZXRob2RzIiwiZ2V0Q2xhc3MiLCJzIiwidXNlcmlkIiwiaW5BcnJheSIsInRha2VTdHVkZW50IiwiZ2lkIiwiY3VycmVudFRhcmdldCIsImRhdGFzZXQiLCJhamF4UG9zdCIsInB1dFN0dWRlbnQiLCJkb25lU3R1ZGVudCIsImRlbFN0dWRlbnQiLCJlbnYiLCJsb2dUb0NvbnNvbGUiLCJicm9hZGNhc3RlciIsImtleSIsInB1c2hlcktleSIsImNsdXN0ZXIiLCJwdXNoZXJDbHVzdGVyIiwiY29ubmVjdG9yIiwicHVzaGVyIiwiY29ubmVjdGlvbiIsImNvbmNhdCIsImNoZWNrQnV0dG9ucyIsImluaXRpYWxDaGVja0RpbmciLCJzb3J0Iiwic29ydEZ1bmN0aW9uIiwiY2hhbm5lbCIsImxpc3RlbiIsImxvY2F0aW9uIiwiaHJlZiIsImpvaW4iLCJoZXJlIiwidXNlcnMiLCJsZW4iLCJpIiwicHVzaCIsImpvaW5pbmciLCJ1c2VyIiwibGVhdmluZyIsInNwbGljZSIsImZvdW5kIiwiY2hlY2tEaW5nIiwiZmlsdGVyIiwiZGlzYWJsZUJ1dHRvbiIsInJlYWxseSIsImF0dHIiLCJib2R5Iiwic3VibWl0IiwiZW5hYmxlQnV0dG9uIiwicmVtb3ZlQXR0ciIsImZvdW5kTWUiLCJwZXJzb24iLCJwbGF5IiwiYSIsImIiLCJtZXNzYWdlIiwiRGF0YVRhYmxlIiwidG9nZ2xlQ2xhc3MiLCJsb2FkcGljdHVyZSIsImFqYXhtb2RhbHNhdmUiLCJhamF4IiwicmVsb2FkIiwic29mdCIsImFqYXhtb2RhbGRlbGV0ZSIsIm1pbkNoYXJzIiwiZGF0YVNyYyIsImNvbHVtbnMiLCJjb2x1bW5EZWZzIiwicm93IiwibWV0YSIsIm5vdGVzIiwib3JkZXJpbmciLCJzZWxlY3RlZCIsInNlbGVjdGVkVmFsIiwiY291cnNlX25hbWUiLCJlbGVjdGl2ZWxpc3RfaWQiLCJzaG93c2VsZWN0ZWQiLCJlbGVjdGl2ZWxpc3RfbmFtZSIsImNvdXJzZV9wcmVmaXgiLCJjb3Vyc2VfbWluX251bWJlciIsImNvdXJzZV9tYXhfbnVtYmVyIiwic2V0VGltZW91dCIsInNldEZvcm1FcnJvcnMiLCJqc29uIiwiY2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImh0bWxTdHJpbmciLCJjb250ZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakUscUJBQXFCO0FBQ3JCO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyxXQUFXO0FBQ3RCLGVBQWUsaUNBQWlDO0FBQ2hELGlCQUFpQixpQkFBaUI7QUFDbEMsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLDZFQUE2RTtBQUM3RSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLGNBQWM7QUFDNUIsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyw2QkFBNkI7QUFDM0MsV0FBVztBQUNYLEdBQUc7QUFDSCxnQkFBZ0IsWUFBWTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsNkRBQTZEO0FBQzdELFNBQVM7QUFDVCx1REFBdUQ7QUFDdkQ7QUFDQSxPQUFPO0FBQ1AsMERBQTBEO0FBQzFEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFD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QWhCO0FBQ0QsT0FORCxFQU9DekksS0FQRCxDQU9PLFVBQVN6RyxLQUFULEVBQWU7QUFDcEIzRixjQUFNLDZCQUE2QjJGLE1BQU1rRSxRQUFOLENBQWVyTSxJQUFsRDtBQUNELE9BVEQ7QUFVRCxLQXhCRDtBQXlCRCxHQTFCRDs7QUE0QkE7QUFDQUgsSUFBRSxrQkFBRixFQUFzQjZMLElBQXRCLENBQTJCLFlBQVU7QUFDbkM3TCxNQUFFLElBQUYsRUFBUStZLEtBQVIsQ0FBYyxVQUFTL0ssQ0FBVCxFQUFXO0FBQ3ZCQSxRQUFFZ0wsZUFBRjtBQUNBaEwsUUFBRWlMLGNBQUY7O0FBRUE7QUFDQSxVQUFJdlksS0FBS1YsRUFBRSxJQUFGLEVBQVFHLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQUgsUUFBRSxlQUFlVSxFQUFqQixFQUFxQlEsVUFBckIsQ0FBZ0MsT0FBaEM7QUFDQWxCLFFBQUUsZUFBZVUsRUFBakIsRUFBcUJRLFVBQXJCLENBQWdDLFNBQWhDOztBQUVBO0FBQ0FsQixRQUFFLHFCQUFxQlUsRUFBdkIsRUFBMkI0SyxXQUEzQixDQUF1QyxRQUF2QztBQUNBdEwsUUFBRSxtQkFBbUJVLEVBQXJCLEVBQXlCdU0sUUFBekIsQ0FBa0MsUUFBbEM7QUFDRCxLQWREO0FBZUQsR0FoQkQ7QUFpQkQsQ0F0RkQsQyIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29kZU1pcnJvciwgY29weXJpZ2h0IChjKSBieSBNYXJpam4gSGF2ZXJiZWtlIGFuZCBvdGhlcnNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIGFuIE1JVCBsaWNlbnNlOiBodHRwOi8vY29kZW1pcnJvci5uZXQvTElDRU5TRVxuXG4oZnVuY3Rpb24obW9kKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2QocmVxdWlyZShcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIpKTtcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgZGVmaW5lKFtcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCJdLCBtb2QpO1xuICBlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgbW9kKENvZGVNaXJyb3IpO1xufSkoZnVuY3Rpb24oQ29kZU1pcnJvcikge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBodG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHsnYXJlYSc6IHRydWUsICdiYXNlJzogdHJ1ZSwgJ2JyJzogdHJ1ZSwgJ2NvbCc6IHRydWUsICdjb21tYW5kJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2VtYmVkJzogdHJ1ZSwgJ2ZyYW1lJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ2ltZyc6IHRydWUsICdpbnB1dCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdrZXlnZW4nOiB0cnVlLCAnbGluayc6IHRydWUsICdtZXRhJzogdHJ1ZSwgJ3BhcmFtJzogdHJ1ZSwgJ3NvdXJjZSc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICd0cmFjayc6IHRydWUsICd3YnInOiB0cnVlLCAnbWVudWl0ZW0nOiB0cnVlfSxcbiAgaW1wbGljaXRseUNsb3NlZDogeydkZCc6IHRydWUsICdsaSc6IHRydWUsICdvcHRncm91cCc6IHRydWUsICdvcHRpb24nOiB0cnVlLCAncCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAncnAnOiB0cnVlLCAncnQnOiB0cnVlLCAndGJvZHknOiB0cnVlLCAndGQnOiB0cnVlLCAndGZvb3QnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3RoJzogdHJ1ZSwgJ3RyJzogdHJ1ZX0sXG4gIGNvbnRleHRHcmFiYmVyczoge1xuICAgICdkZCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnZHQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2xpJzogeydsaSc6IHRydWV9LFxuICAgICdvcHRpb24nOiB7J29wdGlvbic6IHRydWUsICdvcHRncm91cCc6IHRydWV9LFxuICAgICdvcHRncm91cCc6IHsnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAncCc6IHsnYWRkcmVzcyc6IHRydWUsICdhcnRpY2xlJzogdHJ1ZSwgJ2FzaWRlJzogdHJ1ZSwgJ2Jsb2NrcXVvdGUnOiB0cnVlLCAnZGlyJzogdHJ1ZSxcbiAgICAgICAgICAnZGl2JzogdHJ1ZSwgJ2RsJzogdHJ1ZSwgJ2ZpZWxkc2V0JzogdHJ1ZSwgJ2Zvb3Rlcic6IHRydWUsICdmb3JtJzogdHJ1ZSxcbiAgICAgICAgICAnaDEnOiB0cnVlLCAnaDInOiB0cnVlLCAnaDMnOiB0cnVlLCAnaDQnOiB0cnVlLCAnaDUnOiB0cnVlLCAnaDYnOiB0cnVlLFxuICAgICAgICAgICdoZWFkZXInOiB0cnVlLCAnaGdyb3VwJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ21lbnUnOiB0cnVlLCAnbmF2JzogdHJ1ZSwgJ29sJzogdHJ1ZSxcbiAgICAgICAgICAncCc6IHRydWUsICdwcmUnOiB0cnVlLCAnc2VjdGlvbic6IHRydWUsICd0YWJsZSc6IHRydWUsICd1bCc6IHRydWV9LFxuICAgICdycCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAncnQnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3Rib2R5Jzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0ZCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGZvb3QnOiB7J3Rib2R5JzogdHJ1ZX0sXG4gICAgJ3RoJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0aGVhZCc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndHInOiB7J3RyJzogdHJ1ZX1cbiAgfSxcbiAgZG9Ob3RJbmRlbnQ6IHtcInByZVwiOiB0cnVlfSxcbiAgYWxsb3dVbnF1b3RlZDogdHJ1ZSxcbiAgYWxsb3dNaXNzaW5nOiB0cnVlLFxuICBjYXNlRm9sZDogdHJ1ZVxufVxuXG52YXIgeG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHt9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7fSxcbiAgY29udGV4dEdyYWJiZXJzOiB7fSxcbiAgZG9Ob3RJbmRlbnQ6IHt9LFxuICBhbGxvd1VucXVvdGVkOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nVGFnTmFtZTogZmFsc2UsXG4gIGNhc2VGb2xkOiBmYWxzZVxufVxuXG5Db2RlTWlycm9yLmRlZmluZU1vZGUoXCJ4bWxcIiwgZnVuY3Rpb24oZWRpdG9yQ29uZiwgY29uZmlnXykge1xuICB2YXIgaW5kZW50VW5pdCA9IGVkaXRvckNvbmYuaW5kZW50VW5pdFxuICB2YXIgY29uZmlnID0ge31cbiAgdmFyIGRlZmF1bHRzID0gY29uZmlnXy5odG1sTW9kZSA/IGh0bWxDb25maWcgOiB4bWxDb25maWdcbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0cykgY29uZmlnW3Byb3BdID0gZGVmYXVsdHNbcHJvcF1cbiAgZm9yICh2YXIgcHJvcCBpbiBjb25maWdfKSBjb25maWdbcHJvcF0gPSBjb25maWdfW3Byb3BdXG5cbiAgLy8gUmV0dXJuIHZhcmlhYmxlcyBmb3IgdG9rZW5pemVyc1xuICB2YXIgdHlwZSwgc2V0U3R5bGU7XG5cbiAgZnVuY3Rpb24gaW5UZXh0KHN0cmVhbSwgc3RhdGUpIHtcbiAgICBmdW5jdGlvbiBjaGFpbihwYXJzZXIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gcGFyc2VyO1xuICAgICAgcmV0dXJuIHBhcnNlcihzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIhXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwiW1wiKSkge1xuICAgICAgICAgIGlmIChzdHJlYW0ubWF0Y2goXCJDREFUQVtcIikpIHJldHVybiBjaGFpbihpbkJsb2NrKFwiYXRvbVwiLCBcIl1dPlwiKSk7XG4gICAgICAgICAgZWxzZSByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCItLVwiKSkge1xuICAgICAgICAgIHJldHVybiBjaGFpbihpbkJsb2NrKFwiY29tbWVudFwiLCBcIi0tPlwiKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiRE9DVFlQRVwiLCB0cnVlLCB0cnVlKSkge1xuICAgICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGRvY3R5cGUoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmVhbS5lYXQoXCI/XCIpKSB7XG4gICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5CbG9jayhcIm1ldGFcIiwgXCI/PlwiKTtcbiAgICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZSA9IHN0cmVhbS5lYXQoXCIvXCIpID8gXCJjbG9zZVRhZ1wiIDogXCJvcGVuVGFnXCI7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIiZcIikge1xuICAgICAgdmFyIG9rO1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIjXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwieFwiKSkge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bYS1mQS1GXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLlxcLTpdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2sgPyBcImF0b21cIiA6IFwiZXJyb3JcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXiY8XS8pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGluVGV4dC5pc0luVGV4dCA9IHRydWU7XG5cbiAgZnVuY3Rpb24gaW5UYWcoc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPlwiIHx8IChjaCA9PSBcIi9cIiAmJiBzdHJlYW0uZWF0KFwiPlwiKSkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgdHlwZSA9IGNoID09IFwiPlwiID8gXCJlbmRUYWdcIiA6IFwic2VsZmNsb3NlVGFnXCI7XG4gICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIpIHtcbiAgICAgIHR5cGUgPSBcImVxdWFsc1wiO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICBzdGF0ZS5zdGF0ZSA9IGJhc2VTdGF0ZTtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICB2YXIgbmV4dCA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgcmV0dXJuIG5leHQgPyBuZXh0ICsgXCIgdGFnIGVycm9yXCIgOiBcInRhZyBlcnJvclwiO1xuICAgIH0gZWxzZSBpZiAoL1tcXCdcXFwiXS8udGVzdChjaCkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5BdHRyaWJ1dGUoY2gpO1xuICAgICAgc3RhdGUuc3RyaW5nU3RhcnRDb2wgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5tYXRjaCgvXlteXFxzXFx1MDBhMD08PlxcXCJcXCddKlteXFxzXFx1MDBhMD08PlxcXCJcXCdcXC9dLyk7XG4gICAgICByZXR1cm4gXCJ3b3JkXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5BdHRyaWJ1dGUocXVvdGUpIHtcbiAgICB2YXIgY2xvc3VyZSA9IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubmV4dCgpID09IHF1b3RlKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwic3RyaW5nXCI7XG4gICAgfTtcbiAgICBjbG9zdXJlLmlzSW5BdHRyaWJ1dGUgPSB0cnVlO1xuICAgIHJldHVybiBjbG9zdXJlO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5CbG9jayhzdHlsZSwgdGVybWluYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKHRlcm1pbmF0b3IpKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLm5leHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGRvY3R5cGUoZGVwdGgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgdmFyIGNoO1xuICAgICAgd2hpbGUgKChjaCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoICsgMSk7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNoID09IFwiPlwiKSB7XG4gICAgICAgICAgaWYgKGRlcHRoID09IDEpIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCAtIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCBzdGFydE9mTGluZSkge1xuICAgIHRoaXMucHJldiA9IHN0YXRlLmNvbnRleHQ7XG4gICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZTtcbiAgICB0aGlzLmluZGVudCA9IHN0YXRlLmluZGVudGVkO1xuICAgIHRoaXMuc3RhcnRPZkxpbmUgPSBzdGFydE9mTGluZTtcbiAgICBpZiAoY29uZmlnLmRvTm90SW5kZW50Lmhhc093blByb3BlcnR5KHRhZ05hbWUpIHx8IChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQubm9JbmRlbnQpKVxuICAgICAgdGhpcy5ub0luZGVudCA9IHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gcG9wQ29udGV4dChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5jb250ZXh0KSBzdGF0ZS5jb250ZXh0ID0gc3RhdGUuY29udGV4dC5wcmV2O1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgbmV4dFRhZ05hbWUpIHtcbiAgICB2YXIgcGFyZW50VGFnTmFtZTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKCFzdGF0ZS5jb250ZXh0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBhcmVudFRhZ05hbWUgPSBzdGF0ZS5jb250ZXh0LnRhZ05hbWU7XG4gICAgICBpZiAoIWNvbmZpZy5jb250ZXh0R3JhYmJlcnMuaGFzT3duUHJvcGVydHkocGFyZW50VGFnTmFtZSkgfHxcbiAgICAgICAgICAhY29uZmlnLmNvbnRleHRHcmFiYmVyc1twYXJlbnRUYWdOYW1lXS5oYXNPd25Qcm9wZXJ0eShuZXh0VGFnTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmFzZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIm9wZW5UYWdcIikge1xuICAgICAgc3RhdGUudGFnU3RhcnQgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImNsb3NlVGFnXCIpIHtcbiAgICAgIHJldHVybiBjbG9zZVRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VUYWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBpZiAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgIT0gdGFnTmFtZSAmJlxuICAgICAgICAgIGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KHN0YXRlLmNvbnRleHQudGFnTmFtZSkpXG4gICAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSA9PSB0YWdOYW1lKSB8fCBjb25maWcubWF0Y2hDbG9zaW5nID09PSBmYWxzZSkge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZyBlcnJvclwiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZVN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgIT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICB9XG4gICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZVN0YXRlRXJyKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dHJTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiYXR0cmlidXRlXCI7XG4gICAgICByZXR1cm4gYXR0ckVxU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZW5kVGFnXCIgfHwgdHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0YXRlLnRhZ05hbWUsIHRhZ1N0YXJ0ID0gc3RhdGUudGFnU3RhcnQ7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgaWYgKHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIiB8fFxuICAgICAgICAgIGNvbmZpZy5hdXRvU2VsZkNsb3NlcnMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICAgIHN0YXRlLmNvbnRleHQgPSBuZXcgQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgdGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyRXFTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJlcXVhbHNcIikgcmV0dXJuIGF0dHJWYWx1ZVN0YXRlO1xuICAgIGlmICghY29uZmlnLmFsbG93TWlzc2luZykgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyVmFsdWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIiAmJiBjb25maWcuYWxsb3dVbnF1b3RlZCkge3NldFN0eWxlID0gXCJzdHJpbmdcIjsgcmV0dXJuIGF0dHJTdGF0ZTt9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyQ29udGludWVkU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnRTdGF0ZTogZnVuY3Rpb24oYmFzZUluZGVudCkge1xuICAgICAgdmFyIHN0YXRlID0ge3Rva2VuaXplOiBpblRleHQsXG4gICAgICAgICAgICAgICAgICAgc3RhdGU6IGJhc2VTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICBpbmRlbnRlZDogYmFzZUluZGVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IG51bGwsIHRhZ1N0YXJ0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IG51bGx9XG4gICAgICBpZiAoYmFzZUluZGVudCAhPSBudWxsKSBzdGF0ZS5iYXNlSW5kZW50ID0gYmFzZUluZGVudFxuICAgICAgcmV0dXJuIHN0YXRlXG4gICAgfSxcblxuICAgIHRva2VuOiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlLnRhZ05hbWUgJiYgc3RyZWFtLnNvbCgpKVxuICAgICAgICBzdGF0ZS5pbmRlbnRlZCA9IHN0cmVhbS5pbmRlbnRhdGlvbigpO1xuXG4gICAgICBpZiAoc3RyZWFtLmVhdFNwYWNlKCkpIHJldHVybiBudWxsO1xuICAgICAgdHlwZSA9IG51bGw7XG4gICAgICB2YXIgc3R5bGUgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmICgoc3R5bGUgfHwgdHlwZSkgJiYgc3R5bGUgIT0gXCJjb21tZW50XCIpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBudWxsO1xuICAgICAgICBzdGF0ZS5zdGF0ZSA9IHN0YXRlLnN0YXRlKHR5cGUgfHwgc3R5bGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICBpZiAoc2V0U3R5bGUpXG4gICAgICAgICAgc3R5bGUgPSBzZXRTdHlsZSA9PSBcImVycm9yXCIgPyBzdHlsZSArIFwiIGVycm9yXCIgOiBzZXRTdHlsZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9LFxuXG4gICAgaW5kZW50OiBmdW5jdGlvbihzdGF0ZSwgdGV4dEFmdGVyLCBmdWxsTGluZSkge1xuICAgICAgdmFyIGNvbnRleHQgPSBzdGF0ZS5jb250ZXh0O1xuICAgICAgLy8gSW5kZW50IG11bHRpLWxpbmUgc3RyaW5ncyAoZS5nLiBjc3MpLlxuICAgICAgaWYgKHN0YXRlLnRva2VuaXplLmlzSW5BdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLnRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5zdHJpbmdTdGFydENvbCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUuaW5kZW50ZWQgKyBpbmRlbnRVbml0O1xuICAgICAgfVxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5ub0luZGVudCkgcmV0dXJuIENvZGVNaXJyb3IuUGFzcztcbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSAhPSBpblRhZyAmJiBzdGF0ZS50b2tlbml6ZSAhPSBpblRleHQpXG4gICAgICAgIHJldHVybiBmdWxsTGluZSA/IGZ1bGxMaW5lLm1hdGNoKC9eKFxccyopLylbMF0ubGVuZ3RoIDogMDtcbiAgICAgIC8vIEluZGVudCB0aGUgc3RhcnRzIG9mIGF0dHJpYnV0ZSBuYW1lcy5cbiAgICAgIGlmIChzdGF0ZS50YWdOYW1lKSB7XG4gICAgICAgIGlmIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50UGFzdFRhZyAhPT0gZmFsc2UpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgc3RhdGUudGFnTmFtZS5sZW5ndGggKyAyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgaW5kZW50VW5pdCAqIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50RmFjdG9yIHx8IDEpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5hbGlnbkNEQVRBICYmIC88IVxcW0NEQVRBXFxbLy50ZXN0KHRleHRBZnRlcikpIHJldHVybiAwO1xuICAgICAgdmFyIHRhZ0FmdGVyID0gdGV4dEFmdGVyICYmIC9ePChcXC8pPyhbXFx3XzpcXC4tXSopLy5leGVjKHRleHRBZnRlcik7XG4gICAgICBpZiAodGFnQWZ0ZXIgJiYgdGFnQWZ0ZXJbMV0pIHsgLy8gQ2xvc2luZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0LnRhZ05hbWUgPT0gdGFnQWZ0ZXJbMl0pIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KGNvbnRleHQudGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0YWdBZnRlcikgeyAvLyBPcGVuaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgdmFyIGdyYWJiZXJzID0gY29uZmlnLmNvbnRleHRHcmFiYmVyc1tjb250ZXh0LnRhZ05hbWVdO1xuICAgICAgICAgIGlmIChncmFiYmVycyAmJiBncmFiYmVycy5oYXNPd25Qcm9wZXJ0eSh0YWdBZnRlclsyXSkpXG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoY29udGV4dCAmJiBjb250ZXh0LnByZXYgJiYgIWNvbnRleHQuc3RhcnRPZkxpbmUpXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICBpZiAoY29udGV4dCkgcmV0dXJuIGNvbnRleHQuaW5kZW50ICsgaW5kZW50VW5pdDtcbiAgICAgIGVsc2UgcmV0dXJuIHN0YXRlLmJhc2VJbmRlbnQgfHwgMDtcbiAgICB9LFxuXG4gICAgZWxlY3RyaWNJbnB1dDogLzxcXC9bXFxzXFx3Ol0rPiQvLFxuICAgIGJsb2NrQ29tbWVudFN0YXJ0OiBcIjwhLS1cIixcbiAgICBibG9ja0NvbW1lbnRFbmQ6IFwiLS0+XCIsXG5cbiAgICBjb25maWd1cmF0aW9uOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG4gICAgaGVscGVyVHlwZTogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuXG4gICAgc2tpcEF0dHJpYnV0ZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5zdGF0ZSA9PSBhdHRyVmFsdWVTdGF0ZSlcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBhdHRyU3RhdGVcbiAgICB9XG4gIH07XG59KTtcblxuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC94bWxcIiwgXCJ4bWxcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi94bWxcIiwgXCJ4bWxcIik7XG5pZiAoIUNvZGVNaXJyb3IubWltZU1vZGVzLmhhc093blByb3BlcnR5KFwidGV4dC9odG1sXCIpKVxuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2h0bWxcIiwge25hbWU6IFwieG1sXCIsIGh0bWxNb2RlOiB0cnVlfSk7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGZpcnN0X25hbWU6ICQoJyNmaXJzdF9uYW1lJykudmFsKCksXG4gICAgICBsYXN0X25hbWU6ICQoJyNsYXN0X25hbWUnKS52YWwoKSxcbiAgICAgIGVtYWlsOiAkKCcjZW1haWwnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNhZHZpc29yX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuYWR2aXNvcl9pZCA9ICQoJyNhZHZpc29yX2lkJykudmFsKCk7XG4gICAgfVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGRhdGEuZWlkID0gJCgnI2VpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3N0dWRlbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vc3R1ZGVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xucmVxdWlyZSgnY29kZW1pcnJvcicpO1xucmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbnJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2Fkdmlzb3JcIj5OZXcgQWR2aXNvcjwvYT4nKTtcblxuICAkKCcjbm90ZXMnKS5zdW1tZXJub3RlKHtcblx0XHRmb2N1czogdHJ1ZSxcblx0XHR0b29sYmFyOiBbXG5cdFx0XHQvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cblx0XHRcdFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcblx0XHRcdFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcblx0XHRcdFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuXHRcdFx0WydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG5cdFx0XSxcblx0XHR0YWJzaXplOiAyLFxuXHRcdGNvZGVtaXJyb3I6IHtcblx0XHRcdG1vZGU6ICd0ZXh0L2h0bWwnLFxuXHRcdFx0aHRtbE1vZGU6IHRydWUsXG5cdFx0XHRsaW5lTnVtYmVyczogdHJ1ZSxcblx0XHRcdHRoZW1lOiAnbW9ub2thaSdcblx0XHR9LFxuXHR9KTtcblxuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuICAgIGZvcm1EYXRhLmFwcGVuZChcImhpZGRlblwiLCAkKCcjaGlkZGVuJykuaXMoJzpjaGVja2VkJykgPyAxIDogMCk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJkZXBhcnRtZW50X2lkXCIsICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2Fkdmlzb3InO1xuICAgIH1lbHNle1xuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZWlkXCIsICQoJyNlaWQnKS52YWwoKSk7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9hZHZpc29ycy8nICsgaWQ7XG4gICAgfVxuXHRcdGRhc2hib2FyZC5hamF4c2F2ZShmb3JtRGF0YSwgdXJsLCBpZCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlYWR2aXNvclwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9hZHZpc29yc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dCA9ICQodGhpcyksXG4gICAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG4gICAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuICAgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG4gIH0pO1xuXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0JyksXG4gICAgICAgICAgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZiggaW5wdXQubGVuZ3RoICkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiggbG9nICkgYWxlcnQobG9nKTtcbiAgICAgIH1cblxuICB9KTtcblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2RlcGFydG1lbnRcIj5OZXcgRGVwYXJ0bWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgICAgb2ZmaWNlOiAkKCcjb2ZmaWNlJykudmFsKCksXG4gICAgICBwaG9uZTogJCgnI3Bob25lJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZXBhcnRtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlcGFydG1lbnRzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWRlcGFydG1lbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVwYXJ0bWVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVwiPk5ldyBEZWdyZWUgUHJvZ3JhbTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfeWVhcjogJCgnI2VmZmVjdGl2ZV95ZWFyJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfc2VtZXN0ZXI6ICQoJyNlZmZlY3RpdmVfc2VtZXN0ZXInKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXByb2dyYW0nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVncmVlcHJvZ3JhbVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZWdyZWVwcm9ncmFtc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdlbGVjdGl2ZWxpc3RcIj5OZXcgRWxlY3RpdmUgTGlzdDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdlbGVjdGl2ZWxpc3QnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVsaXN0cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWVsZWN0aXZlbGlzdFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9lbGVjdGl2ZWxpc3RzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3cGxhblwiPk5ldyBQbGFuPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBzdGFydF95ZWFyOiAkKCcjc3RhcnRfeWVhcicpLnZhbCgpLFxuICAgICAgc3RhcnRfc2VtZXN0ZXI6ICQoJyNzdGFydF9zZW1lc3RlcicpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFuJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZXBsYW5cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ3N0dWRlbnRfaWQnLCAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnKTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2VcIj5OZXcgQ29tcGxldGVkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBjb3Vyc2VudW1iZXI6ICQoJyNjb3Vyc2VudW1iZXInKS52YWwoKSxcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICB5ZWFyOiAkKCcjeWVhcicpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgYmFzaXM6ICQoJyNiYXNpcycpLnZhbCgpLFxuICAgICAgZ3JhZGU6ICQoJyNncmFkZScpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI3N0dWRlbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5zdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2NvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmNvdXJzZV9pZCA9ICQoJyNjb3Vyc2VfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3Y29tcGxldGVkY291cnNlJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2NvbXBsZXRlZGNvdXJzZXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVjb21wbGV0ZWRjb3Vyc2VcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vY29tcGxldGVkY291cnNlc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdjb3Vyc2VfaWQnLCAnL2NvdXJzZXMvY291cnNlZmVlZCcpO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdC5qcyIsIi8vaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzLzUuNC9taXgjd29ya2luZy13aXRoLXNjcmlwdHNcbi8vaHR0cHM6Ly9hbmR5LWNhcnRlci5jb20vYmxvZy9zY29waW5nLWphdmFzY3JpcHQtZnVuY3Rpb25hbGl0eS10by1zcGVjaWZpYy1wYWdlcy13aXRoLWxhcmF2ZWwtYW5kLWNha2VwaHBcblxuLy9Mb2FkIHNpdGUtd2lkZSBsaWJyYXJpZXMgaW4gYm9vdHN0cmFwIGZpbGVcbnJlcXVpcmUoJy4vYm9vdHN0cmFwJyk7XG5cbnZhciBBcHAgPSB7XG5cblx0Ly8gQ29udHJvbGxlci1hY3Rpb24gbWV0aG9kc1xuXHRhY3Rpb25zOiB7XG5cdFx0Ly9JbmRleCBmb3IgZGlyZWN0bHkgY3JlYXRlZCB2aWV3cyB3aXRoIG5vIGV4cGxpY2l0IGNvbnRyb2xsZXJcblx0XHRSb290Um91dGVDb250cm9sbGVyOiB7XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblx0XHRcdH0sXG5cdFx0XHRnZXRBYm91dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblx0XHRcdH0sXG4gICAgfSxcblxuXHRcdC8vQWR2aXNpbmcgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZHZpc2luZ1xuXHRcdEFkdmlzaW5nQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZHZpc2luZy9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY2FsZW5kYXIgPSByZXF1aXJlKCcuL3BhZ2VzL2NhbGVuZGFyJyk7XG5cdFx0XHRcdGNhbGVuZGFyLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9Hcm91cHNlc3Npb24gQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9ncm91cHNlc3Npb25cbiAgICBHcm91cHNlc3Npb25Db250cm9sbGVyOiB7XG5cdFx0XHQvL2dyb3Vwc2Vzc2lvbi9pbmRleFxuICAgICAgZ2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG4gICAgICB9LFxuXHRcdFx0Ly9ncm91cHNlc2lvbi9saXN0XG5cdFx0XHRnZXRMaXN0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbiA9IHJlcXVpcmUoJy4vcGFnZXMvZ3JvdXBzZXNzaW9uJyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbi5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHQvL1Byb2ZpbGVzIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvcHJvZmlsZVxuXHRcdFByb2ZpbGVzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9wcm9maWxlL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwcm9maWxlID0gcmVxdWlyZSgnLi9wYWdlcy9wcm9maWxlJyk7XG5cdFx0XHRcdHByb2ZpbGUuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0Rhc2hib2FyZCBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkbWluLWx0ZVxuXHRcdERhc2hib2FyZENvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4vdXRpbC9kYXNoYm9hcmQnKTtcblx0XHRcdFx0ZGFzaGJvYXJkLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFN0dWRlbnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9zdHVkZW50c1xuXHRcdFx0Z2V0U3R1ZGVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3R1ZGVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdCcpO1xuXHRcdFx0XHRzdHVkZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdzdHVkZW50XG5cdFx0XHRnZXROZXdzdHVkZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0QWR2aXNvcnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2Fkdmlzb3JzXG5cdFx0XHRnZXRBZHZpc29yczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhZHZpc29yZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0Jyk7XG5cdFx0XHRcdGFkdmlzb3JlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2Fkdmlzb3Jcblx0XHRcdGdldE5ld2Fkdmlzb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHREZXBhcnRtZW50c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZGVwYXJ0bWVudHNcblx0XHRcdGdldERlcGFydG1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlcGFydG1lbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQnKTtcblx0XHRcdFx0ZGVwYXJ0bWVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVwYXJ0bWVudFxuXHRcdFx0Z2V0TmV3ZGVwYXJ0bWVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZXBhcnRtZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0Jyk7XG5cdFx0XHRcdGRlcGFydG1lbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdE1lZXRpbmdzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9tZWV0aW5nc1xuXHRcdFx0Z2V0TWVldGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgbWVldGluZ2VkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9tZWV0aW5nZWRpdCcpO1xuXHRcdFx0XHRtZWV0aW5nZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRCbGFja291dHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2JsYWNrb3V0c1xuXHRcdFx0Z2V0QmxhY2tvdXRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGJsYWNrb3V0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdCcpO1xuXHRcdFx0XHRibGFja291dGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0R3JvdXBzZXNzaW9uc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZ3JvdXBzZXNzaW9uc1xuXHRcdFx0Z2V0R3JvdXBzZXNzaW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBncm91cHNlc3Npb25lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdCcpO1xuXHRcdFx0XHRncm91cHNlc3Npb25lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFNldHRpbmdzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9zZXR0aW5nc1xuXHRcdFx0Z2V0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncycpO1xuXHRcdFx0XHRzZXR0aW5ncy5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHREZWdyZWVwcm9ncmFtc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbXNcblx0XHRcdGdldERlZ3JlZXByb2dyYW1zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtRGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXG5cdFx0XHRnZXROZXdkZWdyZWVwcm9ncmFtOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RWxlY3RpdmVsaXN0c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbXNcblx0XHRcdGdldEVsZWN0aXZlbGlzdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtL3tpZH1cblx0XHRcdGdldEVsZWN0aXZlbGlzdERldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZGV0YWlsJyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVxuXHRcdFx0Z2V0TmV3ZWxlY3RpdmVsaXN0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0Jyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0UGxhbnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3BsYW5zXG5cdFx0XHRnZXRQbGFuczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0Jyk7XG5cdFx0XHRcdHBsYW5lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld3BsYW5cblx0XHRcdGdldE5ld3BsYW46IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdCcpO1xuXHRcdFx0XHRwbGFuZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXG5cdFx0XHRnZXRDb21wbGV0ZWRjb3Vyc2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNvbXBsZXRlZGNvdXJzZWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0Jyk7XG5cdFx0XHRcdGNvbXBsZXRlZGNvdXJzZWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXG5cdFx0XHRnZXROZXdjb21wbGV0ZWRjb3Vyc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0fSxcblxuXHQvL0Z1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGJ5IHRoZSBwYWdlIGF0IGxvYWQuIERlZmluZWQgaW4gcmVzb3VyY2VzL3ZpZXdzL2luY2x1ZGVzL3NjcmlwdHMuYmxhZGUucGhwXG5cdC8vYW5kIEFwcC9IdHRwL1ZpZXdDb21wb3NlcnMvSmF2YXNjcmlwdCBDb21wb3NlclxuXHQvL1NlZSBsaW5rcyBhdCB0b3Agb2YgZmlsZSBmb3IgZGVzY3JpcHRpb24gb2Ygd2hhdCdzIGdvaW5nIG9uIGhlcmVcblx0Ly9Bc3N1bWVzIDIgaW5wdXRzIC0gdGhlIGNvbnRyb2xsZXIgYW5kIGFjdGlvbiB0aGF0IGNyZWF0ZWQgdGhpcyBwYWdlXG5cdGluaXQ6IGZ1bmN0aW9uKGNvbnRyb2xsZXIsIGFjdGlvbikge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvL2NhbGwgdGhlIG1hdGNoaW5nIGZ1bmN0aW9uIGluIHRoZSBhcnJheSBhYm92ZVxuXHRcdFx0cmV0dXJuIEFwcC5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0oKTtcblx0XHR9XG5cdH0sXG59O1xuXG4vL0JpbmQgdG8gdGhlIHdpbmRvd1xud2luZG93LkFwcCA9IEFwcDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2luZG93Ll8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIGpRdWVyeSBhbmQgdGhlIEJvb3RzdHJhcCBqUXVlcnkgcGx1Z2luIHdoaWNoIHByb3ZpZGVzIHN1cHBvcnRcbiAqIGZvciBKYXZhU2NyaXB0IGJhc2VkIEJvb3RzdHJhcCBmZWF0dXJlcyBzdWNoIGFzIG1vZGFscyBhbmQgdGFicy4gVGhpc1xuICogY29kZSBtYXkgYmUgbW9kaWZpZWQgdG8gZml0IHRoZSBzcGVjaWZpYyBuZWVkcyBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICovXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIHRoZSBheGlvcyBIVFRQIGxpYnJhcnkgd2hpY2ggYWxsb3dzIHVzIHRvIGVhc2lseSBpc3N1ZSByZXF1ZXN0c1xuICogdG8gb3VyIExhcmF2ZWwgYmFjay1lbmQuIFRoaXMgbGlicmFyeSBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgc2VuZGluZyB0aGVcbiAqIENTUkYgdG9rZW4gYXMgYSBoZWFkZXIgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBcIlhTUkZcIiB0b2tlbiBjb29raWUuXG4gKi9cblxud2luZG93LmF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLy9odHRwczovL2dpdGh1Yi5jb20vcmFwcGFzb2Z0L2xhcmF2ZWwtNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qc1xud2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4vKipcbiAqIE5leHQgd2Ugd2lsbCByZWdpc3RlciB0aGUgQ1NSRiBUb2tlbiBhcyBhIGNvbW1vbiBoZWFkZXIgd2l0aCBBeGlvcyBzbyB0aGF0XG4gKiBhbGwgb3V0Z29pbmcgSFRUUCByZXF1ZXN0cyBhdXRvbWF0aWNhbGx5IGhhdmUgaXQgYXR0YWNoZWQuIFRoaXMgaXMganVzdFxuICogYSBzaW1wbGUgY29udmVuaWVuY2Ugc28gd2UgZG9uJ3QgaGF2ZSB0byBhdHRhY2ggZXZlcnkgdG9rZW4gbWFudWFsbHkuXG4gKi9cblxubGV0IHRva2VuID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG5cbmlmICh0b2tlbikge1xuICAgIHdpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1DU1JGLVRPS0VOJ10gPSB0b2tlbi5jb250ZW50O1xufSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdDU1JGIHRva2VuIG5vdCBmb3VuZDogaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzL2NzcmYjY3NyZi14LWNzcmYtdG9rZW4nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnZW9uYXNkYW4tYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLXJ1c3NmZWxkJyk7XG52YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuLi91dGlsL2VkaXRhYmxlJyk7XG5cbi8vU2Vzc2lvbiBmb3Igc3RvcmluZyBkYXRhIGJldHdlZW4gZm9ybXNcbmV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cbi8vSUQgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgY2FsZW5kYXIncyBhZHZpc29yXG5leHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gLTE7XG5cbi8vU3R1ZGVudCdzIE5hbWUgc2V0IGJ5IGluaXRcbmV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9IFwiXCI7XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbmV4cG9ydHMuY2FsZW5kYXJEYXRhID0ge1xuXHRoZWFkZXI6IHtcblx0XHRsZWZ0OiAncHJldixuZXh0IHRvZGF5Jyxcblx0XHRjZW50ZXI6ICd0aXRsZScsXG5cdFx0cmlnaHQ6ICdhZ2VuZGFXZWVrLGFnZW5kYURheSdcblx0fSxcblx0ZWRpdGFibGU6IGZhbHNlLFxuXHRldmVudExpbWl0OiB0cnVlLFxuXHRoZWlnaHQ6ICdhdXRvJyxcblx0d2Vla2VuZHM6IGZhbHNlLFxuXHRidXNpbmVzc0hvdXJzOiB7XG5cdFx0c3RhcnQ6ICc4OjAwJywgLy8gYSBzdGFydCB0aW1lICgxMGFtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRlbmQ6ICcxNzowMCcsIC8vIGFuIGVuZCB0aW1lICg2cG0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGRvdzogWyAxLCAyLCAzLCA0LCA1IF1cblx0fSxcblx0ZGVmYXVsdFZpZXc6ICdhZ2VuZGFXZWVrJyxcblx0dmlld3M6IHtcblx0XHRhZ2VuZGE6IHtcblx0XHRcdGFsbERheVNsb3Q6IGZhbHNlLFxuXHRcdFx0c2xvdER1cmF0aW9uOiAnMDA6MjA6MDAnLFxuXHRcdFx0bWluVGltZTogJzA4OjAwOjAwJyxcblx0XHRcdG1heFRpbWU6ICcxNzowMDowMCdcblx0XHR9XG5cdH0sXG5cdGV2ZW50U291cmNlczogW1xuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9tZWV0aW5nZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIG1lZXRpbmcgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyM1MTI4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnd2hpdGUnLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL2JsYWNrb3V0ZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIGJsYWNrb3V0IGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjRkY4ODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ2JsYWNrJyxcblx0XHR9LFxuXHRdLFxuXHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRzZWxlY3RIZWxwZXI6IHRydWUsXG5cdHNlbGVjdE92ZXJsYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGV2ZW50LnJlbmRlcmluZyA9PT0gJ2JhY2tncm91bmQnO1xuXHR9LFxuXHR0aW1lRm9ybWF0OiAnICcsXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0YSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdMTEwnLFxuXHRcdHN0ZXBwaW5nOiAyMCxcblx0XHRlbmFibGVkSG91cnM6IFs4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTddLFxuXHRcdG1heEhvdXI6IDE3LFxuXHRcdHNpZGVCeVNpZGU6IHRydWUsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2UgZGF5IG9ubHlcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5ID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ01NL0REL1lZWVknLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8qKlxuICogSW5pdGlhbHphdGlvbiBmdW5jdGlvbiBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIGFkdmlzb3IgLSBib29sZWFuIHRydWUgaWYgdGhlIHVzZXIgaXMgYW4gYWR2aXNvclxuICogQHBhcmFtIG5vYmluZCAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgYnV0dG9ucyBzaG91bGQgbm90IGJlIGJvdW5kIChtYWtlIGNhbGVuZGFyIHJlYWQtb25seSlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXMgYWN0aW9uXG5cdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cblx0Ly9pbml0YWxpemUgZWRpdGFibGUgZWxlbWVudHNcblx0ZWRpdGFibGUuaW5pdCgpO1xuXG5cdC8vdHdlYWsgcGFyYW1ldGVyc1xuXHR3aW5kb3cuYWR2aXNvciB8fCAod2luZG93LmFkdmlzb3IgPSBmYWxzZSk7XG5cdHdpbmRvdy5ub2JpbmQgfHwgKHdpbmRvdy5ub2JpbmQgPSBmYWxzZSk7XG5cblx0Ly9nZXQgdGhlIGN1cnJlbnQgYWR2aXNvcidzIElEXG5cdGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAkKCcjY2FsZW5kYXJBZHZpc29ySUQnKS52YWwoKS50cmltKCk7XG5cblx0Ly9TZXQgdGhlIGFkdmlzb3IgaW5mb3JtYXRpb24gZm9yIG1lZXRpbmcgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1swXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL1NldCB0aGUgYWR2c2lvciBpbmZvcmFtdGlvbiBmb3IgYmxhY2tvdXQgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL2lmIHRoZSB3aW5kb3cgaXMgc21hbGwsIHNldCBkaWZmZXJlbnQgZGVmYXVsdCBmb3IgY2FsZW5kYXJcblx0aWYoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApe1xuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmRlZmF1bHRWaWV3ID0gJ2FnZW5kYURheSc7XG5cdH1cblxuXHQvL0lmIG5vYmluZCwgZG9uJ3QgYmluZCB0aGUgZm9ybXNcblx0aWYoIXdpbmRvdy5ub2JpbmQpe1xuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhbiBhZHZpc29yLCBiaW5kIG1vcmUgZGF0YVxuXHRcdGlmKHdpbmRvdy5hZHZpc29yKXtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI3RpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0JykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjZW5kJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjZW5kX3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLnNob3coKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5zaG93KCk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG5cdFx0XHQvL2JpbmQgbWV0aG9kcyBmb3IgYnV0dG9ucyBhbmQgZm9ybXNcblx0XHRcdCQoJyNuZXdTdHVkZW50QnV0dG9uJykuYmluZCgnY2xpY2snLCBuZXdTdHVkZW50KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjYnRpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdFx0XHQgICAgJCh0aGlzKS5maW5kKCcuaGFzLWVycm9yJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRleHQoJycpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9iaW5kIGF1dG9jb21wbGV0ZSBmaWVsZFxuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLmF1dG9jb21wbGV0ZSh7XG5cdFx0XHQgICAgc2VydmljZVVybDogJy9wcm9maWxlL3N0dWRlbnRmZWVkJyxcblx0XHRcdCAgICBhamF4U2V0dGluZ3M6IHtcblx0XHRcdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdFx0XHQgICAgICAgICQoJyNzdHVkZW50aWR2YWwnKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdCAgICAgICAgcmV0dXJuIHtcblx0XHRcdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHRcdFx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHRcdFx0ICAgICAgICAgICAgfSlcblx0XHRcdCAgICAgICAgfTtcblx0XHRcdCAgICB9XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3N0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2VuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNzdGFydCcsICcjZW5kJywgJyNkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNiZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI2JzdGFydCcsICcjYmVuZCcsICcjYmR1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnJlcGVhdHVudGlsX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSk7XG5cblx0XHRcdC8vY2hhbmdlIHJlbmRlcmluZyBvZiBldmVudHNcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdFx0XHRlbGVtZW50LmFkZENsYXNzKFwiZmMtY2xpY2thYmxlXCIpO1xuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ20nKXtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkJykudmFsKGV2ZW50LnN0dWRlbnRuYW1lKTtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdH1lbHNlIGlmIChldmVudC50eXBlID09ICdiJyl7XG5cdFx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0XHRldmVudDogZXZlbnRcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmKGV2ZW50LnJlcGVhdCA9PSAnMCcpe1xuXHRcdFx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRcdFx0ZW5kOiBlbmRcblx0XHRcdFx0fTtcblx0XHRcdFx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly9iaW5kIG1vcmUgYnV0dG9uc1xuXHRcdFx0JCgnI2JyZXBlYXQnKS5jaGFuZ2UocmVwZWF0Q2hhbmdlKTtcblxuXHRcdFx0JCgnI3NhdmVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVCbGFja291dCk7XG5cblx0XHRcdCQoJyNibGFja291dFNlcmllcycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRPY2N1cnJlbmNlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dE9jY3VycmVuY2UoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYWR2aXNpbmdCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVNZWV0aW5nQnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dEJ0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHR9KTtcblxuXG5cdFx0XHQkKCcjcmVzb2x2ZUJ1dHRvbicpLm9uKCdjbGljaycsIHJlc29sdmVDb25mbGljdHMpO1xuXG5cdFx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgbm90IGFuIGFkdmlzb3IsIGJpbmQgbGVzcyBkYXRhXG5cdFx0fWVsc2V7XG5cblx0XHRcdC8vR2V0IHRoZSBjdXJyZW50IHN0dWRlbnQncyBuYW1lXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSAkKCcjY2FsZW5kYXJTdHVkZW50TmFtZScpLnZhbCgpLnRyaW0oKTtcblxuXHRcdCAgLy9SZW5kZXIgYmxhY2tvdXRzIHRvIGJhY2tncm91bmRcblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG5cblx0XHQgIC8vV2hlbiByZW5kZXJpbmcsIHVzZSB0aGlzIGN1c3RvbSBmdW5jdGlvbiBmb3IgYmxhY2tvdXRzIGFuZCBzdHVkZW50IG1lZXRpbmdzXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0XHQgICAgfVxuXHRcdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHRcdCAgICB9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1VzZSB0aGlzIG1ldGhvZCBmb3IgY2xpY2tpbmcgb24gbWVldGluZ3Ncblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHRcdFx0XHRpZihldmVudC5zdGFydC5pc0FmdGVyKG1vbWVudCgpKSl7XG5cdFx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoXCJZb3UgY2Fubm90IGVkaXQgbWVldGluZ3MgaW4gdGhlIHBhc3RcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1doZW4gc2VsZWN0aW5nIG5ldyBhcmVhcywgdXNlIHRoZSBzdHVkZW50U2VsZWN0IG1ldGhvZCBpbiB0aGUgY2FsZW5kYXIgbGlicmFyeVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gc3R1ZGVudFNlbGVjdDtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2Rlc2MnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKFwiI2VuZFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNlbmRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnLm1vZGFsJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cdFx0fVxuXG5cdFx0Ly9CaW5kIGNsaWNrIGhhbmRsZXJzIG9uIHRoZSBmb3JtXG5cdFx0JCgnI3NhdmVCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVNZWV0aW5nKTtcblx0XHQkKCcjZGVsZXRlQnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVNZWV0aW5nKTtcblx0XHQkKCcjZHVyYXRpb24nKS5vbignY2hhbmdlJywgY2hhbmdlRHVyYXRpb24pO1xuXG5cdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMgd2l0aCBubyBiaW5kaW5nXG5cdH1lbHNle1xuXHRcdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMsIHNldCByZW5kZXJpbmcgdG8gYmFja2dyb3VuZFxuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0ICAgIH1cblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHQgICAgfVxuXHRcdH07XG5cdH1cblxuXHQvL2luaXRhbGl6ZSB0aGUgY2FsZW5kYXIhXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcihleHBvcnRzLmNhbGVuZGFyRGF0YSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgY2FsZW5kYXIgYnkgY2xvc2luZyBtb2RhbHMgYW5kIHJlbG9hZGluZyBkYXRhXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGZvcm0gdG8gaGlkZSAoYW5kIHRoZSBzcGluKVxuICogQHBhcmFtIHJlcG9uc2UgLSB0aGUgQXhpb3MgcmVwc29uc2Ugb2JqZWN0IHJlY2VpdmVkXG4gKi9cbnZhciByZXNldENhbGVuZGFyID0gZnVuY3Rpb24oZWxlbWVudCwgcmVzcG9uc2Upe1xuXHQvL2hpZGUgdGhlIGZvcm1cblx0JChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vZGlzcGxheSB0aGUgbWVzc2FnZSB0byB0aGUgdXNlclxuXHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHQvL3JlZnJlc2ggdGhlIGNhbGVuZGFyXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdGlmKHdpbmRvdy5hZHZpc29yKXtcblx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBSkFYIG1ldGhvZCB0byBzYXZlIGRhdGEgZnJvbSBhIGZvcm1cbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBzb3VyY2UgZWxlbWVudCBvZiB0aGUgZGF0YVxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFNhdmUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbil7XG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdCAgLy9pZiByZXNwb25zZSBpcyAyeHhcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHR9KVxuXHRcdC8vaWYgcmVzcG9uc2UgaXMgbm90IDJ4eFxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdH0pO1xufVxuXG52YXIgYWpheERlbGV0ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uLCBub1Jlc2V0LCBub0Nob2ljZSl7XG5cdC8vY2hlY2sgbm9SZXNldCB2YXJpYWJsZVxuXHRub1Jlc2V0IHx8IChub1Jlc2V0ID0gZmFsc2UpO1xuXHRub0Nob2ljZSB8fCAobm9DaG9pY2UgPSBmYWxzZSk7XG5cblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGNvbmZpcm1hdGlvblxuXHRpZighbm9DaG9pY2Upe1xuXHRcdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0fWVsc2V7XG5cdFx0dmFyIGNob2ljZSA9IHRydWU7XG5cdH1cblxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXG5cdFx0Ly9pZiBjb25maXJtZWQsIHNob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoZWxlbWVudCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9tYWtlIEFKQVggcmVxdWVzdCB0byBkZWxldGVcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKG5vUmVzZXQpe1xuXHRcdFx0XHRcdC8vaGlkZSBwYXJlbnQgZWxlbWVudCAtIFRPRE8gVEVTVE1FXG5cdFx0XHRcdFx0Ly9jYWxsZXIucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgYSBtZWV0aW5nXG4gKi9cbnZhciBzYXZlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVFdmVudHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRzdGFydDogbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHRlbmQ6IG1vbWVudCgkKCcjZW5kJykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdHRpdGxlOiAkKCcjdGl0bGUnKS52YWwoKSxcblx0XHRkZXNjOiAkKCcjZGVzYycpLnZhbCgpLFxuXHRcdHN0YXR1czogJCgnI3N0YXR1cycpLnZhbCgpXG5cdH07XG5cdGRhdGEuaWQgPSBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEO1xuXHRpZigkKCcjbWVldGluZ0lEJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLm1lZXRpbmdpZCA9ICQoJyNtZWV0aW5nSUQnKS52YWwoKTtcblx0fVxuXHRpZigkKCcjc3R1ZGVudGlkdmFsJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLnN0dWRlbnRpZCA9ICQoJyNzdHVkZW50aWR2YWwnKS52YWwoKTtcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9jcmVhdGVtZWV0aW5nJztcblxuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ3NhdmUgbWVldGluZycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYSBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIHVybFxuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6ICQoJyNtZWV0aW5nSUQnKS52YWwoKVxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ2RlbGV0ZSBtZWV0aW5nJywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3B1bGF0ZSBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBlZGl0aW5nXG4gKlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIGVkaXRcbiAqL1xudmFyIHNob3dNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGV2ZW50KXtcblx0JCgnI3RpdGxlJykudmFsKGV2ZW50LnRpdGxlKTtcblx0JCgnI3N0YXJ0JykudmFsKGV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNlbmQnKS52YWwoZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNkZXNjJykudmFsKGV2ZW50LmRlc2MpO1xuXHRkdXJhdGlvbk9wdGlvbnMoZXZlbnQuc3RhcnQsIGV2ZW50LmVuZCk7XG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoZXZlbnQuaWQpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHQkKCcjc3RhdHVzJykudmFsKGV2ZW50LnN0YXR1cyk7XG5cdCQoJyNkZWxldGVCdXR0b24nKS5zaG93KCk7XG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGNyZWF0aW9uXG4gKlxuICogQHBhcmFtIGNhbGVuZGFyU3R1ZGVudE5hbWUgLSBzdHJpbmcgbmFtZSBvZiB0aGUgc3R1ZGVudFxuICovXG52YXIgY3JlYXRlTWVldGluZ0Zvcm0gPSBmdW5jdGlvbihjYWxlbmRhclN0dWRlbnROYW1lKXtcblxuXHQvL3BvcHVsYXRlIHRoZSB0aXRsZSBhdXRvbWF0aWNhbGx5IGZvciBhIHN0dWRlbnRcblx0aWYoY2FsZW5kYXJTdHVkZW50TmFtZSAhPT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjdGl0bGUnKS52YWwoY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1lbHNle1xuXHRcdCQoJyN0aXRsZScpLnZhbCgnJyk7XG5cdH1cblxuXHQvL1NldCBzdGFydCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI3N0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBlbmQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2VuZCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBkdXJhdGlvbiBvcHRpb25zXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKSwgbW9tZW50KCkuaG91cig4KS5taW51dGUoMjApKTtcblx0fWVsc2V7XG5cdFx0ZHVyYXRpb25PcHRpb25zKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LCBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQpO1xuXHR9XG5cblx0Ly9SZXNldCBvdGhlciBvcHRpb25zXG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHQvL0hpZGUgZGVsZXRlIGJ1dHRvblxuXHQkKCcjZGVsZXRlQnV0dG9uJykuaGlkZSgpO1xuXG5cdC8vU2hvdyB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIG9uIHRoaXMgcGFnZVxuICovXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgJCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2V0IGR1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBtZWV0aW5nIGZvcm1cbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lXG4gKiBAcGFyYW0gZW5kIC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kaW5nIHRpbWVcbiAqL1xudmFyIGR1cmF0aW9uT3B0aW9ucyA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuXHQvL2NsZWFyIHRoZSBsaXN0XG5cdCQoJyNkdXJhdGlvbicpLmVtcHR5KCk7XG5cblx0Ly9hc3N1bWUgYWxsIG1lZXRpbmdzIGhhdmUgcm9vbSBmb3IgMjAgbWludXRlc1xuXHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPScyMCc+MjAgbWludXRlczwvb3B0aW9uPlwiKTtcblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDoyMCwgYWxsb3cgNDAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMjApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc0MCc+NDAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjAwLCBhbGxvdyA2MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNjAnPjYwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL3NldCBkZWZhdWx0IHZhbHVlIGJhc2VkIG9uIGdpdmVuIHNwYW5cblx0JCgnI2R1cmF0aW9uJykudmFsKGVuZC5kaWZmKHN0YXJ0LCBcIm1pbnV0ZXNcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsaW5rIHRoZSBkYXRlcGlja2VycyB0b2dldGhlclxuICpcbiAqIEBwYXJhbSBlbGVtMSAtIGpRdWVyeSBvYmplY3QgZm9yIGZpcnN0IGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBlbGVtMiAtIGpRdWVyeSBvYmplY3QgZm9yIHNlY29uZCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgbGlua0RhdGVQaWNrZXJzID0gZnVuY3Rpb24oZWxlbTEsIGVsZW0yLCBkdXJhdGlvbil7XG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIGZpcnN0IGRhdGFwaWNrZXJcblx0JChlbGVtMSArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTIgPSBtb21lbnQoJChlbGVtMikudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNBZnRlcihkYXRlMikgfHwgZS5kYXRlLmlzU2FtZShkYXRlMikpe1xuXHRcdFx0ZGF0ZTIgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTIpLnZhbChkYXRlMi5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gc2Vjb25kIGRhdGVwaWNrZXJcblx0JChlbGVtMiArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTEgPSBtb21lbnQoJChlbGVtMSkudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNCZWZvcmUoZGF0ZTEpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTEpKXtcblx0XHRcdGRhdGUxID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0xKS52YWwoZGF0ZTEuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBjaGFuZ2VEdXJhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdHZhciBuZXdEYXRlID0gbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCAnTExMJykuYWRkKCQodGhpcykudmFsKCksIFwibWludXRlc1wiKTtcblx0JCgnI2VuZCcpLnZhbChuZXdEYXRlLmZvcm1hdChcIkxMTFwiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZlcmlmeSB0aGF0IHRoZSBzdHVkZW50cyBhcmUgc2VsZWN0aW5nIG1lZXRpbmdzIHRoYXQgYXJlbid0IHRvbyBsb25nXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBtZWV0aW5nXG4gKiBAcGFyYW0gZW5kIC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZCBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgc3R1ZGVudFNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblxuXHQvL1doZW4gc3R1ZGVudHMgc2VsZWN0IGEgbWVldGluZywgZGlmZiB0aGUgc3RhcnQgYW5kIGVuZCB0aW1lc1xuXHRpZihlbmQuZGlmZihzdGFydCwgJ21pbnV0ZXMnKSA+IDYwKXtcblxuXHRcdC8vaWYgaW52YWxpZCwgdW5zZWxlY3QgYW5kIHNob3cgYW4gZXJyb3Jcblx0XHRhbGVydChcIk1lZXRpbmdzIGNhbm5vdCBsYXN0IGxvbmdlciB0aGFuIDEgaG91clwiKTtcblx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdH1lbHNle1xuXG5cdFx0Ly9pZiB2YWxpZCwgc2V0IGRhdGEgaW4gdGhlIHNlc3Npb24gYW5kIHNob3cgdGhlIGZvcm1cblx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdGVuZDogZW5kXG5cdFx0fTtcblx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRjcmVhdGVNZWV0aW5nRm9ybShleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9XG59O1xuXG4vKipcbiAqIExvYWQgY29uZmxpY3RpbmcgbWVldGluZ3MgZnJvbSB0aGUgc2VydmVyXG4gKi9cbnZhciBsb2FkQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblxuXHQvL3JlcXVlc3QgY29uZmxpY3RzIHZpYSBBSkFYXG5cdHdpbmRvdy5heGlvcy5nZXQoJy9hZHZpc2luZy9jb25mbGljdHMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0Ly9kaXNhYmxlIGV4aXN0aW5nIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDIwMCwgZGF0YSB3YXMgcmVjZWl2ZWRcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDApe1xuXG5cdFx0XHRcdC8vQXBwZW5kIEhUTUwgZm9yIGNvbmZsaWN0cyB0byBET01cblx0XHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJykuZW1wdHkoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0J2lkJyA6ICdyZXNvbHZlJyt2YWx1ZS5pZCxcblx0XHRcdFx0XHRcdCdjbGFzcyc6ICdtZWV0aW5nLWNvbmZsaWN0Jyxcblx0XHRcdFx0XHRcdCdodG1sJzogXHQnPHA+Jm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBwdWxsLXJpZ2h0IGRlbGV0ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnJm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgcHVsbC1yaWdodCBlZGl0Q29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5FZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+S2VlcCBNZWV0aW5nPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlJyt2YWx1ZS5pZCsnc3BpblwiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vUmUtcmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnNcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdFx0Ly9TaG93IHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuXHRcdCAgLy9JZiByZXNwb25zZSBpcyAyMDQsIG5vIGNvbmZsaWN0cyBhcmUgcHJlc2VudFxuXHRcdFx0fWVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwNCl7XG5cblx0XHRcdFx0Ly9IaWRlIHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBTYXZlIGJsYWNrb3V0cyBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBzYXZlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlQmxhY2tvdXRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCB1cmw7XG5cdHZhciBkYXRhID0ge1xuXHRcdGJzdGFydDogbW9tZW50KCQoJyNic3RhcnQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJlbmQ6IG1vbWVudCgkKCcjYmVuZCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YnRpdGxlOiAkKCcjYnRpdGxlJykudmFsKClcblx0fTtcblx0dmFyIHVybDtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YS5iYmxhY2tvdXRldmVudGlkID0gJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dCc7XG5cdFx0aWYoJCgnI2JibGFja291dGlkJykudmFsKCkgPiAwKXtcblx0XHRcdGRhdGEuYmJsYWNrb3V0aWQgPSAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKTtcblx0XHR9XG5cdFx0ZGF0YS5icmVwZWF0ID0gJCgnI2JyZXBlYXQnKS52YWwoKTtcblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDEpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnk9ICQoJyNicmVwZWF0ZGFpbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDIpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnkgPSAkKCcjYnJlcGVhdHdlZWtseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNtID0gJCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3QgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdyA9ICQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN1ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c2YgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ3NhdmUgYmxhY2tvdXQnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGJsYWNrb3V0IGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIGRlbGV0ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIFVSTCBhbmQgZGF0YSBvYmplY3Rcblx0dmFyIHVybCwgZGF0YTtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0ZXZlbnRpZDogJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSB9O1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRpZDogJCgnI2JibGFja291dGlkJykudmFsKCkgfTtcblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnZGVsZXRlIGJsYWNrb3V0JywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGNoYW5nZSBvZiByZXBlYXQgb3B0aW9ucyBvbiB0aGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgcmVwZWF0Q2hhbmdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCh0aGlzKS52YWwoKSA9PSAwKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMSl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDIpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fVxufTtcblxuLyoqXG4gKiBTaG93IHRoZSByZXNvbHZlIGNvbmZsaWN0cyBtb2RhbCBmb3JtXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0Ly9zZW5kIEFKQVggZGVsZXRlXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdkZWxldGUgbWVldGluZycsIHRydWUpO1xuXG59O1xuXG4vKipcbiAqIEVkaXQgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZWRpdENvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9tZWV0aW5nJztcblxuXHQvL3Nob3cgc3Bpbm5lciB0byBsb2FkIG1lZXRpbmdcblx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vbG9hZCBtZWV0aW5nIGFuZCBkaXNwbGF5IGZvcm1cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRldmVudCA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRldmVudC5zdGFydCA9IG1vbWVudChldmVudC5zdGFydCk7XG5cdFx0XHRldmVudC5lbmQgPSBtb21lbnQoZXZlbnQuZW5kKTtcblx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgbWVldGluZycsICcjcmVzb2x2ZScgKyBpZCwgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBSZXNvbHZlIGEgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9yZXNvbHZlY29uZmxpY3QnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdyZXNvbHZlIG1lZXRpbmcnLCB0cnVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBjcmVhdGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgY3JlYXRlQmxhY2tvdXRGb3JtID0gZnVuY3Rpb24oKXtcblx0JCgnI2J0aXRsZScpLnZhbChcIlwiKTtcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQoKS5ob3VyKDkpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0JCgnI2JyZXBlYXQnKS52YWwoMCk7XG5cdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmhpZGUoKTtcblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gdG8gYSBzaW5nbGUgb2NjdXJyZW5jZVxuICovXG52YXIgYmxhY2tvdXRPY2N1cnJlbmNlID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9zZXQgZm9ybSB2YWx1ZXMgYW5kIGhpZGUgdW5uZWVkZWQgZmllbGRzXG5cdCQoJyNidGl0bGUnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQudGl0bGUpO1xuXHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjcmVwZWF0ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0JCgnI2JibGFja291dGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkKTtcblx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuaWQpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cblx0Ly9zaG93IHRoZSBmb3JtXG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBibGFja291dCBzZXJpZXMgZWRpdCBmb3JtXG4gKi9cbnZhciBibGFja291dFNlcmllcyA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuIFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRpZDogZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9ibGFja291dCc7XG5cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI2J0aXRsZScpLnZhbChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXHQgXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuc3RhcnQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuZW5kLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChyZXNwb25zZS5kYXRhLmlkKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdCBcdFx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQgXHRcdGlmKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMSl7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdGRhaWx5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9ZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAyKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2x5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0XHRcdFx0dmFyIHJlcGVhdF9kZXRhaWwgPSBTdHJpbmcocmVzcG9uc2UuZGF0YS5yZXBlYXRfZGV0YWlsKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIxXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIyXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIzXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI0XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI1XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9XG5cdCBcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXHQgXHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgYmxhY2tvdXQgc2VyaWVzJywgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IHN0dWRlbnQgaW4gdGhlIGRhdGFiYXNlXG4gKi9cbnZhciBuZXdTdHVkZW50ID0gZnVuY3Rpb24oKXtcblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGFuIGVJRCB0byBhZGQgdG8gdGhlIHN5c3RlbVxuXHR2YXIgZWlkID0gcHJvbXB0KFwiRW50ZXIgdGhlIHN0dWRlbnQncyBlSURcIik7XG5cblx0Ly9idWlsZCB0aGUgVVJMIGFuZCBkYXRhXG5cdHZhciBkYXRhID0ge1xuXHRcdGVpZDogZWlkLFxuXHR9O1xuXHR2YXIgdXJsID0gJy9wcm9maWxlL25ld3N0dWRlbnQnO1xuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGFbXCJlaWRcIl0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xudmFyIEVjaG8gPSByZXF1aXJlKCdsYXJhdmVsLWVjaG8nKTtcbnJlcXVpcmUoJ2lvbi1zb3VuZCcpO1xuXG53aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8qKlxuICogR3JvdXBzZXNzaW9uIGluaXQgZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgdG8gc3RhcnRcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2xvYWQgaW9uLXNvdW5kIGxpYnJhcnlcblx0aW9uLnNvdW5kKHtcbiAgICBzb3VuZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJkb29yX2JlbGxcIlxuICAgICAgICB9LFxuICAgIF0sXG4gICAgdm9sdW1lOiAxLjAsXG4gICAgcGF0aDogXCIvc291bmRzL1wiLFxuICAgIHByZWxvYWQ6IHRydWVcblx0fSk7XG5cblx0Ly9nZXQgdXNlcklEIGFuZCBpc0Fkdmlzb3IgdmFyaWFibGVzXG5cdHdpbmRvdy51c2VySUQgPSBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpO1xuXG5cdC8vcmVnaXN0ZXIgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykub24oJ2NsaWNrJywgZ3JvdXBSZWdpc3RlckJ0bik7XG5cblx0Ly9kaXNhYmxlIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBEaXNhYmxlQnRuJykub24oJ2NsaWNrJywgZ3JvdXBEaXNhYmxlQnRuKTtcblxuXHQvL3JlbmRlciBWdWUgQXBwXG5cdHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2dyb3VwTGlzdCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0cXVldWU6IFtdLFxuXHRcdFx0YWR2aXNvcjogcGFyc2VJbnQoJCgnI2lzQWR2aXNvcicpLnZhbCgpKSA9PSAxLFxuXHRcdFx0dXNlcklEOiBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpLFxuXHRcdFx0b25saW5lOiBbXSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdC8vRnVuY3Rpb24gdG8gZ2V0IENTUyBjbGFzc2VzIGZvciBhIHN0dWRlbnQgb2JqZWN0XG5cdFx0XHRnZXRDbGFzczogZnVuY3Rpb24ocyl7XG5cdFx0XHRcdHJldHVybntcblx0XHRcdFx0XHQnYWxlcnQtaW5mbyc6IHMuc3RhdHVzID09IDAgfHwgcy5zdGF0dXMgPT0gMSxcblx0XHRcdFx0XHQnYWxlcnQtc3VjY2Vzcyc6IHMuc3RhdHVzID09IDIsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1tZSc6IHMudXNlcmlkID09IHRoaXMudXNlcklELFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tb2ZmbGluZSc6ICQuaW5BcnJheShzLnVzZXJpZCwgdGhpcy5vbmxpbmUpID09IC0xLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdC8vZnVuY3Rpb24gdG8gdGFrZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0dGFrZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi90YWtlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICd0YWtlJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHB1dCBhIHN0dWRlbnQgYmFjayBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0XG5cdFx0XHRwdXRTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcHV0J1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdwdXQnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIGZ1bmN0aW9uIHRvIG1hcmsgYSBzdHVkZW50IGRvbmUgb24gdGhlIGxpc3Rcblx0XHRcdGRvbmVTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZG9uZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnbWFyayBkb25lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIGRlbGV0ZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0ZGVsU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RlbGV0ZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnZGVsZXRlJyk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0pXG5cblxuXHQvL0VuYWJsZSBQdXNoZXIgbG9nZ2luZ1xuXHRpZih3aW5kb3cuZW52ID09IFwibG9jYWxcIiB8fCB3aW5kb3cuZW52ID09IFwic3RhZ2luZ1wiKXtcblx0XHRjb25zb2xlLmxvZyhcIlB1c2hlciBsb2dnaW5nIGVuYWJsZWQhXCIpO1xuXHRcdFB1c2hlci5sb2dUb0NvbnNvbGUgPSB0cnVlO1xuXHR9XG5cblx0Ly9Mb2FkIHRoZSBFY2hvIGluc3RhbmNlIG9uIHRoZSB3aW5kb3dcblx0d2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG5cdFx0YnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuXHRcdGtleTogd2luZG93LnB1c2hlcktleSxcblx0XHRjbHVzdGVyOiB3aW5kb3cucHVzaGVyQ2x1c3Rlcixcblx0fSk7XG5cblx0Ly9CaW5kIHRvIHRoZSBjb25uZWN0ZWQgYWN0aW9uIG9uIFB1c2hlciAoY2FsbGVkIHdoZW4gY29ubmVjdGVkKVxuXHR3aW5kb3cuRWNoby5jb25uZWN0b3IucHVzaGVyLmNvbm5lY3Rpb24uYmluZCgnY29ubmVjdGVkJywgZnVuY3Rpb24oKXtcblx0XHQvL3doZW4gY29ubmVjdGVkLCBkaXNhYmxlIHRoZSBzcGlubmVyXG5cdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vTG9hZCB0aGUgaW5pdGlhbCBzdHVkZW50IHF1ZXVlIHZpYSBBSkFYXG5cdFx0d2luZG93LmF4aW9zLmdldCgnL2dyb3Vwc2Vzc2lvbi9xdWV1ZScpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZS5jb25jYXQocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGNoZWNrQnV0dG9ucyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignZ2V0IHF1ZXVlJywgJycsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KVxuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uIGNoYW5uZWxcblx0Lypcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cblx0XHR9KTtcbiAqL1xuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uZW5kIGNoYW5uZWxcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uZW5kJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25FbmQnLCAoZSkgPT4ge1xuXG5cdFx0XHQvL2lmIGVuZGluZywgcmVkaXJlY3QgYmFjayB0byBob21lIHBhZ2Vcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvZ3JvdXBzZXNzaW9uXCI7XG5cdH0pO1xuXG5cdHdpbmRvdy5FY2hvLmpvaW4oJ3ByZXNlbmNlJylcblx0XHQuaGVyZSgodXNlcnMpID0+IHtcblx0XHRcdHZhciBsZW4gPSB1c2Vycy5sZW5ndGg7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlcnNbaV0uaWQpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmpvaW5pbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2VyLmlkKTtcblx0XHR9KVxuXHRcdC5sZWF2aW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnNwbGljZSggJC5pbkFycmF5KHVzZXIuaWQsIHdpbmRvdy52bS5vbmxpbmUpLCAxKTtcblx0XHR9KVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblx0XHRcdHZhciBxdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZTtcblx0XHRcdHZhciBmb3VuZCA9IGZhbHNlO1xuXHRcdFx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblxuXHRcdFx0Ly91cGRhdGUgdGhlIHF1ZXVlIGJhc2VkIG9uIHJlc3BvbnNlXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRpZihxdWV1ZVtpXS5pZCA9PT0gZGF0YS5pZCl7XG5cdFx0XHRcdFx0aWYoZGF0YS5zdGF0dXMgPCAzKXtcblx0XHRcdFx0XHRcdHF1ZXVlW2ldID0gZGF0YTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHF1ZXVlLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHRcdGxlbi0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9pZiBlbGVtZW50IG5vdCBmb3VuZCBvbiBjdXJyZW50IHF1ZXVlLCBwdXNoIGl0IG9uIHRvIHRoZSBxdWV1ZVxuXHRcdFx0aWYoIWZvdW5kKXtcblx0XHRcdFx0cXVldWUucHVzaChkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9jaGVjayB0byBzZWUgaWYgY3VycmVudCB1c2VyIGlzIG9uIHF1ZXVlIGJlZm9yZSBlbmFibGluZyBidXR0b25cblx0XHRcdGNoZWNrQnV0dG9ucyhxdWV1ZSk7XG5cblx0XHRcdC8vaWYgY3VycmVudCB1c2VyIGlzIGZvdW5kLCBjaGVjayBmb3Igc3RhdHVzIHVwZGF0ZSB0byBwbGF5IHNvdW5kXG5cdFx0XHRpZihkYXRhLnVzZXJpZCA9PT0gdXNlcklEKXtcblx0XHRcdFx0Y2hlY2tEaW5nKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NvcnQgdGhlIHF1ZXVlIGNvcnJlY3RseVxuXHRcdFx0cXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXG5cdFx0XHQvL3VwZGF0ZSBWdWUgc3RhdGUsIG1pZ2h0IGJlIHVubmVjZXNzYXJ5XG5cdFx0XHR3aW5kb3cudm0ucXVldWUgPSBxdWV1ZTtcblx0XHR9KTtcblxufTtcblxuXG4vKipcbiAqIFZ1ZSBmaWx0ZXIgZm9yIHN0YXR1cyB0ZXh0XG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgc3R1ZGVudCB0byByZW5kZXJcbiAqL1xuVnVlLmZpbHRlcignc3RhdHVzdGV4dCcsIGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMCkgcmV0dXJuIFwiTkVXXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAxKSByZXR1cm4gXCJRVUVVRURcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDIpIHJldHVybiBcIk1FRVQgV0lUSCBcIiArIGRhdGEuYWR2aXNvcjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDMpIHJldHVybiBcIkRFTEFZXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA0KSByZXR1cm4gXCJBQlNFTlRcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDUpIHJldHVybiBcIkRPTkVcIjtcbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3Vwc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB3aW5kb3cudXNlcklEICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJyArIHRva2VuICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSkgLy9pdCBoYXMgdG8gYmUgYWRkZWQgc29tZXdoZXJlIGludG8gdGhlIDxib2R5PlxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5hYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGVuYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkaXNhYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGRpc2FibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgYW5kIHNlZSBpZiB1c2VyIGlzIG9uIHRoZSBsaXN0IC0gaWYgbm90LCBkb24ndCBlbmFibGUgYnV0dG9uXG4gKi9cbnZhciBjaGVja0J1dHRvbnMgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdHZhciBmb3VuZE1lID0gZmFsc2U7XG5cblx0Ly9pdGVyYXRlIHRocm91Z2ggdXNlcnMgb24gbGlzdCwgbG9va2luZyBmb3IgY3VycmVudCB1c2VyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGZvdW5kTWUgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly9pZiBmb3VuZCwgZGlzYWJsZSBidXR0b247IGlmIG5vdCwgZW5hYmxlIGJ1dHRvblxuXHRpZihmb3VuZE1lKXtcblx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdH1lbHNle1xuXHRcdGVuYWJsZUJ1dHRvbigpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYmVja29uZWQsIGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBwZXJzb24gLSB0aGUgY3VycmVudCB1c2VyIHRvIGNoZWNrXG4gKi9cbnZhciBjaGVja0RpbmcgPSBmdW5jdGlvbihwZXJzb24pe1xuXHRpZihwZXJzb24uc3RhdHVzID09IDIpe1xuXHRcdGlvbi5zb3VuZC5wbGF5KFwiZG9vcl9iZWxsXCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBlcnNvbiBoYXMgYmVlbiBiZWNrb25lZCBvbiBsb2FkOyBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcXVldWUgLSB0aGUgaW5pdGlhbCBxdWV1ZSBvZiB1c2VycyBsb2FkZWRcbiAqL1xudmFyIGluaXRpYWxDaGVja0RpbmcgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdCQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZVByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Zmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcblx0XHRcdGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuXHRcdH07XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0Ly9zZW5kIEFKQVggcG9zdFxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3IgYWR2aXNvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZUFkdmlzb3JQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHQvL1RPRE8gVEVTVE1FXG5cdFx0dmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRkYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0ZGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdCQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdFx0JCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdC8vaHR0cDovL3d3dy5hYmVhdXRpZnVsc2l0ZS5uZXQvd2hpcHBpbmctZmlsZS1pbnB1dHMtaW50by1zaGFwZS13aXRoLWJvb3RzdHJhcC0zL1xuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuXHQgIHZhciBpbnB1dCA9ICQodGhpcyksXG5cdCAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG5cdCAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuXHQgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG5cdH0pO1xuXG5cdC8vYmluZCB0byBmaWxlc2VsZWN0IGJ1dHRvblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpO1xuXHRcdFx0dmFyIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgICBpZihsb2cpe1xuXHRcdFx0XHRcdFx0YWxlcnQobG9nKTtcblx0XHRcdFx0XHR9XG4gICAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWJsYWNrb3V0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2JsYWNrb3V0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gIC8vJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWdyb3Vwc2Vzc2lvblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ncm91cHNlc3Npb25zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgLy9sb2FkIGN1c3RvbSBidXR0b24gb24gdGhlIGRvbVxuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgLy9iaW5kIHNldHRpbmdzIGJ1dHRvbnNcbiAgJCgnLnNldHRpbmdzYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgIH07XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vc2F2ZXNldHRpbmcnO1xuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9iaW5kIG5ldyBzZXR0aW5nIGJ1dHRvblxuICAkKCcjbmV3c2V0dGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IHByb21wdChcIkVudGVyIGEgbmFtZSBmb3IgdGhlIG5ldyBzZXR0aW5nOlwiKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogY2hvaWNlLFxuICAgIH07XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL25ld3NldHRpbmdcIlxuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignY3JlYXRlJywgJycsIGVycm9yKVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCIvL2xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnYWRtaW4tbHRlJyk7XG5yZXF1aXJlKCdkYXRhdGFibGVzLm5ldCcpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQtYnMnKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcblxuLy9vcHRpb25zIGZvciBkYXRhdGFibGVzXG5leHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMgPSB7XG4gIFwicGFnZUxlbmd0aFwiOiA1MCxcbiAgXCJsZW5ndGhDaGFuZ2VcIjogZmFsc2UsXG59XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgb24gYWxsIGRhdGF0YWJsZXMgcGFnZXNcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIGN1c3RvbSBkYXRhdGFibGVzIG9wdGlvbnNcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSBleHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMpO1xuICAkKCcjdGFibGUnKS5EYXRhVGFibGUob3B0aW9ucyk7XG4gIHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cbiAgJCgnI2FkbWlubHRlLXRvZ2dsZW1lbnUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnc2lkZWJhci1vcGVuJyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHNhdmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGlkIC0gdGhlIGlkIG9mIHRoZSBpdGVtIHRvIGJlIHNhdmUtZGV2XG4gKiBAcGFyYW0gbG9hZHBpY3R1cmUgLSB0cnVlIHRvIHJlbG9hZCBhIHByb2ZpbGUgcGljdHVyZVxuICovXG5leHBvcnRzLmFqYXhzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBpZCwgbG9hZHBpY3R1cmUpe1xuICBsb2FkcGljdHVyZSB8fCAobG9hZHBpY3R1cmUgPSBmYWxzZSk7XG4gICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmVzcG9uc2UuZGF0YSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgIGlmKGxvYWRwaWN0dXJlKSBleHBvcnRzLmxvYWRwaWN0dXJlKGlkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYIG9uIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgcGljdHVyZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSB1c2VyIElEIG9mIHRoZSBwaWN0dXJlIHRvIHJlbG9hZFxuICovXG5leHBvcnRzLmxvYWRwaWN0dXJlID0gZnVuY3Rpb24oaWQpe1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgJCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuICAgIH0pXG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG8gYWZ0ZXIgZGVsZXRlXG4gKiBAcGFyYW0gc29mdCAtIGJvb2xlYW4gaWYgdGhpcyBpcyBhIHNvZnQgZGVsZXRlIG9yIG5vdFxuICovXG5leHBvcnRzLmFqYXhkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCByZXRVcmwsIHNvZnQgPSBmYWxzZSl7XG4gIGlmKHNvZnQpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgfWVsc2V7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlbGF0ZWQgcmVjb3Jkcy4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgfVxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW0gZnJvbSBhIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBtb2RhbCBlbGVtZW50IHRvIGNsb3NlXG4gKi9cbmV4cG9ydHMuYWpheG1vZGFsZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgZWxlbWVudCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc3RvcmUgYSBzb2Z0LWRlbGV0ZWQgaXRlbVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGl0ZW0gdG8gYmUgcmVzdG9yZWRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhhdCBpbmZvcm1hdGlvbiB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvXG4gKi9cbmV4cG9ydHMuYWpheHJlc3RvcmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIHJldFVybCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmVzdG9yZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIHN1Z2dlc3Rpb24udmFsdWUpO1xuXHQgICAgfSxcblx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH07XG5cdCAgICB9XG5cdH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXJlcXVpcmVtZW50cy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2NyZWRpdHMnfSxcbiAgICB7J2RhdGEnOiAnc2VtZXN0ZXInfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnbm90ZXMnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5OZXcgRGVncmVlIFJlcXVpcmVtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZWdyZWVyZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjc2VtZXN0ZXInKS52YWwobWVzc2FnZS5kYXRhLnNlbWVzdGVyKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZWxlY3RpdmVsaXN0Y291cnNlcy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+QWRkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBlbGVjdGl2ZWxpc3RfaWQ6ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSxcbiAgICAgIGNvdXJzZV9wcmVmaXg6ICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmFuZ2UnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGRhdGEuY291cnNlX21pbl9udW1iZXIgPSAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9tYXhfbnVtYmVyID0gJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZWxlY3RpdmVsaXN0Y291cnNlJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2VsZWN0aXZlY291cnNlLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWVsZWN0aXZlY291cnNlXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdmlldycpLnZhbCgkKCcjZWxlY3RpdmVsaXN0X2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfcHJlZml4KTtcbiAgICAgICAgJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWluX251bWJlcik7XG4gICAgICAgIGlmKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWF4X251bWJlcil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWF4X251bWJlcik7XG4gICAgICAgICAgJCgnI3JhbmdlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAgICAgICAgICQoJyNyYW5nZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGVsZWN0aXZlIGxpc3QgY291cnNlJywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICAkKCdpbnB1dFtuYW1lPXJhbmdlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmFuZ2UnXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoXCJcIik7XG4gICQoJyNyYW5nZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAyMDJcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmxhc2hlZCBzZXNzaW9uIGRhdGFcbiAqXG4gKiB1c2UgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCdtZXNzYWdlJywgdHJhbnMoJ21lc3NhZ2VzLml0ZW1fc2F2ZWQnKSk7XG4gKiAgICAgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCd0eXBlJywgJ3N1Y2Nlc3MnKTtcbiAqIHRvIHNldCBtZXNzYWdlIHRleHQgYW5kIHR5cGVcbiAqL1xuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpe1xuXHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiamF2YXNjcmlwdE1lc3NhZ2VcIiBjbGFzcz1cImFsZXJ0IGZhZGUgaW4gYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtJyArIHR5cGUgKyAnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48L2J1dHRvbj48c3BhbiBjbGFzcz1cImg0XCI+JyArIG1lc3NhZ2UgKyAnPC9zcGFuPjwvZGl2Pic7XG5cdCQoJyNtZXNzYWdlJykuYXBwZW5kKGh0bWwpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoXCIjamF2YXNjcmlwdE1lc3NhZ2VcIikuYWxlcnQoJ2Nsb3NlJyk7XG5cdH0sIDMwMDApO1xufTtcblxuLypcbmV4cG9ydHMuYWpheGNyc2YgPSBmdW5jdGlvbigpe1xuXHQkLmFqYXhTZXR1cCh7XG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jylcblx0XHR9XG5cdH0pO1xufTtcbiovXG5cbi8qKlxuICogQ2xlYXJzIGVycm9ycyBvbiBmb3JtcyBieSByZW1vdmluZyBlcnJvciBjbGFzc2VzXG4gKi9cbmV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzID0gZnVuY3Rpb24oKXtcblx0JCgnLmZvcm0tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uICgpe1xuXHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcblx0fSk7XG59XG5cbi8qKlxuICogU2V0cyBlcnJvcnMgb24gZm9ybXMgYmFzZWQgb24gcmVzcG9uc2UgSlNPTlxuICovXG5leHBvcnRzLnNldEZvcm1FcnJvcnMgPSBmdW5jdGlvbihqc29uKXtcblx0ZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMoKTtcblx0JC5lYWNoKGpzb24sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0JCgnIycgKyBrZXkpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQoJyMnICsga2V5ICsgJ2hlbHAnKS50ZXh0KHZhbHVlLmpvaW4oJyAnKSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBmb3IgbWVzc2FnZXMgaW4gdGhlIGZsYXNoIGRhdGEuIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgYnkgdGhlIHBhZ2VcbiAqL1xuZXhwb3J0cy5jaGVja01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKCcjbWVzc2FnZV9mbGFzaCcpLmxlbmd0aCl7XG5cdFx0dmFyIG1lc3NhZ2UgPSAkKCcjbWVzc2FnZV9mbGFzaCcpLnZhbCgpO1xuXHRcdHZhciB0eXBlID0gJCgnI21lc3NhZ2VfdHlwZV9mbGFzaCcpLnZhbCgpO1xuXHRcdGV4cG9ydHMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3JzIGZyb20gQUpBWFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSB0byB0aGUgdXNlclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBlcnJvciAtIHRoZSBBeGlvcyBlcnJvciByZWNlaXZlZFxuICovXG5leHBvcnRzLmhhbmRsZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgZWxlbWVudCwgZXJyb3Ipe1xuXHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRleHBvcnRzLnNldEZvcm1FcnJvcnMoZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byBcIiArIG1lc3NhZ2UgKyBcIjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvL2hpZGUgc3Bpbm5pbmcgaWNvblxuXHRpZihlbGVtZW50Lmxlbmd0aCA+IDApe1xuXHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFtlZGl0XSBsaW5rc1xuICAkKCcuZWRpdGFibGUtbGluaycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vaGlkZSB0aGUgW2VkaXRdIGxpbmtzLCBlbmFibGUgZWRpdG9yLCBhbmQgc2hvdyBTYXZlIGFuZCBDYW5jZWwgYnV0dG9uc1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoe1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdG9vbGJhcjogW1xuICAgICAgICAgIC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuICAgICAgICAgIFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcbiAgICAgICAgICBbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG4gICAgICAgICAgWydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG4gICAgICAgICAgWydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG4gICAgICAgIF0sXG4gICAgICAgIHRhYnNpemU6IDIsXG4gICAgICAgIGNvZGVtaXJyb3I6IHtcbiAgICAgICAgICBtb2RlOiAndGV4dC9odG1sJyxcbiAgICAgICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ21vbm9rYWknXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgU2F2ZSBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1zYXZlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9EaXNwbGF5IHNwaW5uZXIgd2hpbGUgQUpBWCBjYWxsIGlzIHBlcmZvcm1lZFxuICAgICAgJCgnI2VkaXRhYmxlc3Bpbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuICAgICAgLy9HZXQgY29udGVudHMgb2YgZWRpdG9yXG4gICAgICB2YXIgaHRtbFN0cmluZyA9ICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2NvZGUnKTtcblxuICAgICAgLy9Qb3N0IGNvbnRlbnRzIHRvIHNlcnZlciwgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZWRpdGFibGUvc2F2ZS8nICsgaWQsIHtcbiAgICAgICAgY29udGVudHM6IGh0bWxTdHJpbmdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIC8vSWYgcmVzcG9uc2UgMjAwIHJlY2VpdmVkLCBhc3N1bWUgaXQgc2F2ZWQgYW5kIHJlbG9hZCBwYWdlXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChcIlVuYWJsZSB0byBzYXZlIGNvbnRlbnQ6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgQ2FuY2VsIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLWNhbmNlbCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vUmVzZXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IgYW5kIGRlc3Ryb3kgaXRcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ3Jlc2V0Jyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdkZXN0cm95Jyk7XG5cbiAgICAgIC8vSGlkZSBTYXZlIGFuZCBDYW5jZWwgYnV0dG9ucywgYW5kIHNob3cgW2VkaXRdIGxpbmtcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=