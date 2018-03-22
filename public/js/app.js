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

/* WEBPACK VAR INJECTION */(function($) {var dashboard = __webpack_require__(2);

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

/***/ 161:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(162);
__webpack_require__(209);
module.exports = __webpack_require__(210);


/***/ }),

/***/ 162:
/***/ (function(module, exports, __webpack_require__) {

//https://laravel.com/docs/5.4/mix#working-with-scripts
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

//Load site-wide libraries in bootstrap file
__webpack_require__(163);

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
				var calendar = __webpack_require__(194);
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
				var groupsession = __webpack_require__(196);
				groupsession.init();
			}
		},

		//Profiles Controller for routes at /profile
		ProfilesController: {
			//profile/index
			getIndex: function getIndex() {
				var profile = __webpack_require__(199);
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
				var meetingedit = __webpack_require__(200);
				meetingedit.init();
			}
		},

		BlackoutsController: {
			//admin/blackouts
			getBlackouts: function getBlackouts() {
				var blackoutedit = __webpack_require__(201);
				blackoutedit.init();
			}
		},

		GroupsessionsController: {
			//admin/groupsessions
			getGroupsessions: function getGroupsessions() {
				var groupsessionedit = __webpack_require__(202);
				groupsessionedit.init();
			}
		},

		SettingsController: {
			//admin/settings
			getSettings: function getSettings() {
				var settings = __webpack_require__(203);
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
				var degreeprogramedit = __webpack_require__(204);
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
				var electivelistedit = __webpack_require__(205);
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
				var plandetail = __webpack_require__(206);
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
				var flowchart = __webpack_require__(207);
				flowchart.init();
			},
			getIndex: function getIndex() {
				var flowchart = __webpack_require__(208);
				flowchart.init();
			},
			newFlowchart: function newFlowchart() {
				var flowchart = __webpack_require__(160);
				flowchart.init();
			},
			editFlowchart: function editFlowchart() {
				var flowchart = __webpack_require__(160);
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

/***/ 163:
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

/***/ 194:
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
					'html': '<p>&nbsp;<button type="button" class="btn btn-danger pull-right deleteConflict" data-id=' + value.id + '><i class="fa fa-trash" aria-hidden="true"></i> Delete</button>' + '&nbsp;<button type="button" class="btn btn-primary pull-right editConflict" data-id=' + value.id + '><i class="fa fa-pencil" aria-hidden="true"></i> Edit</button> ' + '<button type="button" class="btn btn-success pull-right resolveConflict" data-id=' + value.id + '><i class="fa fa-floppy-o" aria-hidden="true"></i> Keep</button>' + '<span id="resolve' + value.id + 'spin" class="fa fa-cog fa-spin fa-lg pull-right hide-spin">&nbsp;</span>' + '<b>' + value.title + '</b> (' + value.start + ')</p><hr>'
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

/***/ 196:
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

/***/ 199:
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

/***/ 200:
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

/***/ 201:
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

/***/ 202:
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

/***/ 203:
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

/***/ 204:
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

/***/ 205:
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

/***/ 206:
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

/***/ 207:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {var site = __webpack_require__(4);
window.Vue = __webpack_require__(12);
var draggable = __webpack_require__(158);

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

/***/ 208:
/***/ (function(module, exports, __webpack_require__) {

var dashboard = __webpack_require__(2);

exports.init = function () {
  var options = dashboard.dataTableOptions;
  dashboard.init(options);
};

/***/ }),

/***/ 209:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 210:
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

},[161]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnRlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydGxpc3QuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzPzZkMTAiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2Zsb3djaGFydC5zY3NzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmQiLCJyZXF1aXJlIiwiZXhwb3J0cyIsImluaXQiLCJvcHRpb25zIiwiZGF0YVRhYmxlT3B0aW9ucyIsImRvbSIsIiQiLCJodG1sIiwib24iLCJkYXRhIiwiZmlyc3RfbmFtZSIsInZhbCIsImxhc3RfbmFtZSIsImVtYWlsIiwiYWR2aXNvcl9pZCIsImRlcGFydG1lbnRfaWQiLCJpZCIsImVpZCIsImxlbmd0aCIsInVybCIsImFqYXhzYXZlIiwicmV0VXJsIiwiYWpheGRlbGV0ZSIsImFqYXhyZXN0b3JlIiwic3VtbWVybm90ZSIsImZvY3VzIiwidG9vbGJhciIsInRhYnNpemUiLCJjb2RlbWlycm9yIiwibW9kZSIsImh0bWxNb2RlIiwibGluZU51bWJlcnMiLCJ0aGVtZSIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJpcyIsImZpbGVzIiwiZG9jdW1lbnQiLCJpbnB1dCIsIm51bUZpbGVzIiwiZ2V0IiwibGFiZWwiLCJyZXBsYWNlIiwidHJpZ2dlciIsImV2ZW50IiwicGFyZW50cyIsImZpbmQiLCJsb2ciLCJhbGVydCIsIm5hbWUiLCJvZmZpY2UiLCJwaG9uZSIsImFiYnJldmlhdGlvbiIsImRlc2NyaXB0aW9uIiwiZWZmZWN0aXZlX3llYXIiLCJlZmZlY3RpdmVfc2VtZXN0ZXIiLCJzdGFydF95ZWFyIiwic3RhcnRfc2VtZXN0ZXIiLCJkZWdyZWVwcm9ncmFtX2lkIiwic3R1ZGVudF9pZCIsImNob2ljZSIsImNvbmZpcm0iLCJhamF4YXV0b2NvbXBsZXRlIiwib3JkZXJpbmciLCJwbGFuX2lkIiwiY291cnNlbnVtYmVyIiwieWVhciIsInNlbWVzdGVyIiwiYmFzaXMiLCJncmFkZSIsImNyZWRpdHMiLCJzZWxlY3RlZCIsInNlbGVjdGVkVmFsIiwidHJhbnNmZXIiLCJpbmNvbWluZ19pbnN0aXR1dGlvbiIsImluY29taW5nX25hbWUiLCJpbmNvbWluZ19kZXNjcmlwdGlvbiIsImluY29taW5nX3NlbWVzdGVyIiwiaW5jb21pbmdfY3JlZGl0cyIsImluY29taW5nX2dyYWRlIiwic2hvd3NlbGVjdGVkIiwicHJvcCIsInNob3ciLCJoaWRlIiwiQXBwIiwiYWN0aW9ucyIsIlJvb3RSb3V0ZUNvbnRyb2xsZXIiLCJnZXRJbmRleCIsImVkaXRhYmxlIiwic2l0ZSIsImNoZWNrTWVzc2FnZSIsImdldEFib3V0IiwiQWR2aXNpbmdDb250cm9sbGVyIiwiY2FsZW5kYXIiLCJHcm91cHNlc3Npb25Db250cm9sbGVyIiwiZ2V0TGlzdCIsImdyb3Vwc2Vzc2lvbiIsIlByb2ZpbGVzQ29udHJvbGxlciIsInByb2ZpbGUiLCJEYXNoYm9hcmRDb250cm9sbGVyIiwiU3R1ZGVudHNDb250cm9sbGVyIiwiZ2V0U3R1ZGVudHMiLCJzdHVkZW50ZWRpdCIsImdldE5ld3N0dWRlbnQiLCJBZHZpc29yc0NvbnRyb2xsZXIiLCJnZXRBZHZpc29ycyIsImFkdmlzb3JlZGl0IiwiZ2V0TmV3YWR2aXNvciIsIkRlcGFydG1lbnRzQ29udHJvbGxlciIsImdldERlcGFydG1lbnRzIiwiZGVwYXJ0bWVudGVkaXQiLCJnZXROZXdkZXBhcnRtZW50IiwiTWVldGluZ3NDb250cm9sbGVyIiwiZ2V0TWVldGluZ3MiLCJtZWV0aW5nZWRpdCIsIkJsYWNrb3V0c0NvbnRyb2xsZXIiLCJnZXRCbGFja291dHMiLCJibGFja291dGVkaXQiLCJHcm91cHNlc3Npb25zQ29udHJvbGxlciIsImdldEdyb3Vwc2Vzc2lvbnMiLCJncm91cHNlc3Npb25lZGl0IiwiU2V0dGluZ3NDb250cm9sbGVyIiwiZ2V0U2V0dGluZ3MiLCJzZXR0aW5ncyIsIkRlZ3JlZXByb2dyYW1zQ29udHJvbGxlciIsImdldERlZ3JlZXByb2dyYW1zIiwiZGVncmVlcHJvZ3JhbWVkaXQiLCJnZXREZWdyZWVwcm9ncmFtRGV0YWlsIiwiZ2V0TmV3ZGVncmVlcHJvZ3JhbSIsIkVsZWN0aXZlbGlzdHNDb250cm9sbGVyIiwiZ2V0RWxlY3RpdmVsaXN0cyIsImVsZWN0aXZlbGlzdGVkaXQiLCJnZXRFbGVjdGl2ZWxpc3REZXRhaWwiLCJnZXROZXdlbGVjdGl2ZWxpc3QiLCJQbGFuc0NvbnRyb2xsZXIiLCJnZXRQbGFucyIsInBsYW5lZGl0IiwiZ2V0UGxhbkRldGFpbCIsInBsYW5kZXRhaWwiLCJnZXROZXdwbGFuIiwiUGxhbnNlbWVzdGVyc0NvbnRyb2xsZXIiLCJnZXRQbGFuU2VtZXN0ZXIiLCJwbGFuc2VtZXN0ZXJlZGl0IiwiZ2V0TmV3UGxhblNlbWVzdGVyIiwiQ29tcGxldGVkY291cnNlc0NvbnRyb2xsZXIiLCJnZXRDb21wbGV0ZWRjb3Vyc2VzIiwiY29tcGxldGVkY291cnNlZWRpdCIsImdldE5ld2NvbXBsZXRlZGNvdXJzZSIsIkZsb3djaGFydHNDb250cm9sbGVyIiwiZ2V0Rmxvd2NoYXJ0IiwiZmxvd2NoYXJ0IiwibmV3Rmxvd2NoYXJ0IiwiZWRpdEZsb3djaGFydCIsImNvbnRyb2xsZXIiLCJhY3Rpb24iLCJ3aW5kb3ciLCJfIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImhlYWQiLCJxdWVyeVNlbGVjdG9yIiwiY29udGVudCIsImNvbnNvbGUiLCJlcnJvciIsIm1vbWVudCIsImNhbGVuZGFyU2Vzc2lvbiIsImNhbGVuZGFyQWR2aXNvcklEIiwiY2FsZW5kYXJTdHVkZW50TmFtZSIsImNhbGVuZGFyRGF0YSIsImhlYWRlciIsImxlZnQiLCJjZW50ZXIiLCJyaWdodCIsImV2ZW50TGltaXQiLCJoZWlnaHQiLCJ3ZWVrZW5kcyIsImJ1c2luZXNzSG91cnMiLCJzdGFydCIsImVuZCIsImRvdyIsImRlZmF1bHRWaWV3Iiwidmlld3MiLCJhZ2VuZGEiLCJhbGxEYXlTbG90Iiwic2xvdER1cmF0aW9uIiwibWluVGltZSIsIm1heFRpbWUiLCJldmVudFNvdXJjZXMiLCJ0eXBlIiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsInJlbmRlcmluZyIsInRpbWVGb3JtYXQiLCJkYXRlUGlja2VyRGF0YSIsImRheXNPZldlZWtEaXNhYmxlZCIsImZvcm1hdCIsInN0ZXBwaW5nIiwiZW5hYmxlZEhvdXJzIiwibWF4SG91ciIsInNpZGVCeVNpZGUiLCJpZ25vcmVSZWFkb25seSIsImFsbG93SW5wdXRUb2dnbGUiLCJkYXRlUGlja2VyRGF0ZU9ubHkiLCJhZHZpc29yIiwibm9iaW5kIiwidHJpbSIsIndpZHRoIiwicmVtb3ZlQ2xhc3MiLCJyZXNldEZvcm0iLCJiaW5kIiwibmV3U3R1ZGVudCIsInJlc2V0IiwiZWFjaCIsInRleHQiLCJsb2FkQ29uZmxpY3RzIiwiZnVsbENhbGVuZGFyIiwiYXV0b2NvbXBsZXRlIiwic2VydmljZVVybCIsImFqYXhTZXR0aW5ncyIsImRhdGFUeXBlIiwib25TZWxlY3QiLCJzdWdnZXN0aW9uIiwidHJhbnNmb3JtUmVzdWx0IiwicmVzcG9uc2UiLCJzdWdnZXN0aW9ucyIsIm1hcCIsImRhdGFJdGVtIiwidmFsdWUiLCJkYXRldGltZXBpY2tlciIsImxpbmtEYXRlUGlja2VycyIsImV2ZW50UmVuZGVyIiwiZWxlbWVudCIsImFkZENsYXNzIiwiZXZlbnRDbGljayIsInZpZXciLCJzdHVkZW50bmFtZSIsInNob3dNZWV0aW5nRm9ybSIsInJlcGVhdCIsImJsYWNrb3V0U2VyaWVzIiwibW9kYWwiLCJzZWxlY3QiLCJjaGFuZ2UiLCJyZXBlYXRDaGFuZ2UiLCJzYXZlQmxhY2tvdXQiLCJkZWxldGVCbGFja291dCIsImJsYWNrb3V0T2NjdXJyZW5jZSIsIm9mZiIsImUiLCJjcmVhdGVNZWV0aW5nRm9ybSIsImNyZWF0ZUJsYWNrb3V0Rm9ybSIsInJlc29sdmVDb25mbGljdHMiLCJ0aXRsZSIsImlzQWZ0ZXIiLCJzdHVkZW50U2VsZWN0Iiwic2F2ZU1lZXRpbmciLCJkZWxldGVNZWV0aW5nIiwiY2hhbmdlRHVyYXRpb24iLCJyZXNldENhbGVuZGFyIiwiZGlzcGxheU1lc3NhZ2UiLCJhamF4U2F2ZSIsInBvc3QiLCJ0aGVuIiwiY2F0Y2giLCJoYW5kbGVFcnJvciIsImFqYXhEZWxldGUiLCJub1Jlc2V0Iiwibm9DaG9pY2UiLCJkZXNjIiwic3RhdHVzIiwibWVldGluZ2lkIiwic3R1ZGVudGlkIiwiZHVyYXRpb25PcHRpb25zIiwidW5kZWZpbmVkIiwiaG91ciIsIm1pbnV0ZSIsImNsZWFyRm9ybUVycm9ycyIsImVtcHR5IiwibWludXRlcyIsImRpZmYiLCJlbGVtMSIsImVsZW0yIiwiZHVyYXRpb24iLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJpbmRleCIsImFwcGVuZFRvIiwiYnN0YXJ0IiwiYmVuZCIsImJ0aXRsZSIsImJibGFja291dGV2ZW50aWQiLCJiYmxhY2tvdXRpZCIsImJyZXBlYXQiLCJicmVwZWF0ZXZlcnkiLCJicmVwZWF0dW50aWwiLCJicmVwZWF0d2Vla2RheXNtIiwiYnJlcGVhdHdlZWtkYXlzdCIsImJyZXBlYXR3ZWVrZGF5c3ciLCJicmVwZWF0d2Vla2RheXN1IiwiYnJlcGVhdHdlZWtkYXlzZiIsInBhcmFtcyIsImJsYWNrb3V0X2lkIiwicmVwZWF0X3R5cGUiLCJyZXBlYXRfZXZlcnkiLCJyZXBlYXRfdW50aWwiLCJyZXBlYXRfZGV0YWlsIiwiU3RyaW5nIiwiaW5kZXhPZiIsInByb21wdCIsIlZ1ZSIsIkVjaG8iLCJQdXNoZXIiLCJpb24iLCJzb3VuZCIsInNvdW5kcyIsInZvbHVtZSIsInBhdGgiLCJwcmVsb2FkIiwidXNlcklEIiwicGFyc2VJbnQiLCJncm91cFJlZ2lzdGVyQnRuIiwiZ3JvdXBEaXNhYmxlQnRuIiwidm0iLCJlbCIsInF1ZXVlIiwib25saW5lIiwibWV0aG9kcyIsImdldENsYXNzIiwicyIsInVzZXJpZCIsImluQXJyYXkiLCJ0YWtlU3R1ZGVudCIsImdpZCIsImN1cnJlbnRUYXJnZXQiLCJkYXRhc2V0IiwiYWpheFBvc3QiLCJwdXRTdHVkZW50IiwiZG9uZVN0dWRlbnQiLCJkZWxTdHVkZW50IiwiZW52IiwibG9nVG9Db25zb2xlIiwiYnJvYWRjYXN0ZXIiLCJrZXkiLCJwdXNoZXJLZXkiLCJjbHVzdGVyIiwicHVzaGVyQ2x1c3RlciIsImNvbm5lY3RvciIsInB1c2hlciIsImNvbm5lY3Rpb24iLCJjb25jYXQiLCJjaGVja0J1dHRvbnMiLCJpbml0aWFsQ2hlY2tEaW5nIiwic29ydCIsInNvcnRGdW5jdGlvbiIsImNoYW5uZWwiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImhyZWYiLCJqb2luIiwiaGVyZSIsInVzZXJzIiwibGVuIiwiaSIsInB1c2giLCJqb2luaW5nIiwidXNlciIsImxlYXZpbmciLCJzcGxpY2UiLCJmb3VuZCIsImNoZWNrRGluZyIsImZpbHRlciIsImRpc2FibGVCdXR0b24iLCJyZWFsbHkiLCJhdHRyIiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJmb3VuZE1lIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwiRGF0YVRhYmxlIiwidG9nZ2xlQ2xhc3MiLCJsb2FkcGljdHVyZSIsImFqYXhtb2RhbHNhdmUiLCJhamF4IiwicmVsb2FkIiwic29mdCIsImFqYXhtb2RhbGRlbGV0ZSIsImFqYXhhdXRvY29tcGxldGVsb2NrIiwiYWpheGF1dG9jb21wbGV0ZXNldCIsIm1lc3NhZ2UiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwib3JkZXIiLCJub3RlcyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsIm9wdGlvbnMyIiwiY291cnNlX2lkX2xvY2siLCJjb21wbGV0ZWRjb3Vyc2VfaWRfbG9jayIsInNlbWVzdGVyX2lkIiwiY291cnNlX2lkIiwiY29tcGxldGVkY291cnNlX2lkIiwicGxhbmlkIiwibGlzdGl0ZW1zIiwicmVtb3ZlIiwiZGVncmVlcmVxdWlyZW1lbnRfaWQiLCJ0cnVuY2F0ZVRleHQiLCJjYXRhbG9nX2NvdXJzZSIsImNvbXBsZXRlZF9jb3Vyc2UiLCJkcmFnZ2FibGUiLCJzZW1lc3RlcnMiLCJlZGl0U2VtZXN0ZXIiLCJzYXZlU2VtZXN0ZXIiLCJkZWxldGVTZW1lc3RlciIsImRyb3BTZW1lc3RlciIsImRyb3BDb3Vyc2UiLCJlZGl0Q291cnNlIiwiY29tcG9uZW50cyIsImxvYWREYXRhIiwiYWRkU2VtZXN0ZXIiLCJhZGRDb3Vyc2UiLCJzYXZlQ291cnNlIiwiZGVsZXRlQ291cnNlIiwiZG9jdW1lbnRFbGVtZW50Iiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsImN1c3RvbSIsImNvbXBsZXRlIiwiY291cnNlcyIsInNlbWlkIiwidG9TZW1JbmRleCIsInRvIiwiaXRlbSIsImNvdXJzZUluZGV4Iiwic2VtSW5kZXgiLCJjb3Vyc2UiLCJjb21wbGV0ZWRjb3Vyc2VfbmFtZSIsInBsYW5yZXF1aXJlbWVudF9pZCIsInNldFRpbWVvdXQiLCJzZXRGb3JtRXJyb3JzIiwianNvbiIsInN1YnN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJtaW5DaGFycyIsImF1dG9TZWxlY3RGaXJzdCIsImNsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJodG1sU3RyaW5nIiwiY29udGVudHMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDs7QUFFQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0EsaUVBQWlFO0FBQ2pFLHFCQUFxQjtBQUNyQjtBQUNBLDRDQUE0QztBQUM1QztBQUNBLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsV0FBVztBQUN0QixlQUFlLGlDQUFpQztBQUNoRCxpQkFBaUIsaUJBQWlCO0FBQ2xDLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0UsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyw2QkFBNkI7QUFDM0MsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyxjQUFjO0FBQzVCLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsNkJBQTZCO0FBQzNDLFdBQVc7QUFDWCxHQUFHO0FBQ0gsZ0JBQWdCLFlBQVk7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckIsc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RDtBQUM3RCxTQUFTO0FBQ1QsdURBQXVEO0FBQ3ZEO0FBQ0EsT0FBTztBQUNQLDBEQUEwRDtBQUMxRDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxvQkFBb0I7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RUFPQ3RJLEtBUEQsQ0FPTyxVQUFTdEcsS0FBVCxFQUFlO0FBQ3BCdEgsY0FBTSw2QkFBNkJzSCxNQUFNK0QsUUFBTixDQUFlN04sSUFBbEQ7QUFDRCxPQVREO0FBVUQsS0F4QkQ7QUF5QkQsR0ExQkQ7O0FBNEJBO0FBQ0FILElBQUUsa0JBQUYsRUFBc0JxTixJQUF0QixDQUEyQixZQUFVO0FBQ25Dck4sTUFBRSxJQUFGLEVBQVFrZCxLQUFSLENBQWMsVUFBUzFOLENBQVQsRUFBVztBQUN2QkEsUUFBRTJOLGVBQUY7QUFDQTNOLFFBQUU0TixjQUFGOztBQUVBO0FBQ0EsVUFBSTFjLEtBQUtWLEVBQUUsSUFBRixFQUFRRyxJQUFSLENBQWEsSUFBYixDQUFUOztBQUVBO0FBQ0FILFFBQUUsZUFBZVUsRUFBakIsRUFBcUJRLFVBQXJCLENBQWdDLE9BQWhDO0FBQ0FsQixRQUFFLGVBQWVVLEVBQWpCLEVBQXFCUSxVQUFyQixDQUFnQyxTQUFoQzs7QUFFQTtBQUNBbEIsUUFBRSxxQkFBcUJVLEVBQXZCLEVBQTJCc00sV0FBM0IsQ0FBdUMsUUFBdkM7QUFDQWhOLFFBQUUsbUJBQW1CVSxFQUFyQixFQUF5QitOLFFBQXpCLENBQWtDLFFBQWxDO0FBQ0QsS0FkRDtBQWVELEdBaEJEO0FBaUJELENBdEZELEMiLCJmaWxlIjoiL2pzL2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvZGVNaXJyb3IsIGNvcHlyaWdodCAoYykgYnkgTWFyaWpuIEhhdmVyYmVrZSBhbmQgb3RoZXJzXG4vLyBEaXN0cmlidXRlZCB1bmRlciBhbiBNSVQgbGljZW5zZTogaHR0cDovL2NvZGVtaXJyb3IubmV0L0xJQ0VOU0VcblxuKGZ1bmN0aW9uKG1vZCkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpIC8vIENvbW1vbkpTXG4gICAgbW9kKHJlcXVpcmUoXCIuLi8uLi9saWIvY29kZW1pcnJvclwiKSk7XG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIC8vIEFNRFxuICAgIGRlZmluZShbXCIuLi8uLi9saWIvY29kZW1pcnJvclwiXSwgbW9kKTtcbiAgZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIG1vZChDb2RlTWlycm9yKTtcbn0pKGZ1bmN0aW9uKENvZGVNaXJyb3IpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaHRtbENvbmZpZyA9IHtcbiAgYXV0b1NlbGZDbG9zZXJzOiB7J2FyZWEnOiB0cnVlLCAnYmFzZSc6IHRydWUsICdicic6IHRydWUsICdjb2wnOiB0cnVlLCAnY29tbWFuZCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdlbWJlZCc6IHRydWUsICdmcmFtZSc6IHRydWUsICdocic6IHRydWUsICdpbWcnOiB0cnVlLCAnaW5wdXQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAna2V5Z2VuJzogdHJ1ZSwgJ2xpbmsnOiB0cnVlLCAnbWV0YSc6IHRydWUsICdwYXJhbSc6IHRydWUsICdzb3VyY2UnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAndHJhY2snOiB0cnVlLCAnd2JyJzogdHJ1ZSwgJ21lbnVpdGVtJzogdHJ1ZX0sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHsnZGQnOiB0cnVlLCAnbGknOiB0cnVlLCAnb3B0Z3JvdXAnOiB0cnVlLCAnb3B0aW9uJzogdHJ1ZSwgJ3AnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZSwgJ3Rib2R5JzogdHJ1ZSwgJ3RkJzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICd0aCc6IHRydWUsICd0cic6IHRydWV9LFxuICBjb250ZXh0R3JhYmJlcnM6IHtcbiAgICAnZGQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2R0JzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdsaSc6IHsnbGknOiB0cnVlfSxcbiAgICAnb3B0aW9uJzogeydvcHRpb24nOiB0cnVlLCAnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAnb3B0Z3JvdXAnOiB7J29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ3AnOiB7J2FkZHJlc3MnOiB0cnVlLCAnYXJ0aWNsZSc6IHRydWUsICdhc2lkZSc6IHRydWUsICdibG9ja3F1b3RlJzogdHJ1ZSwgJ2Rpcic6IHRydWUsXG4gICAgICAgICAgJ2Rpdic6IHRydWUsICdkbCc6IHRydWUsICdmaWVsZHNldCc6IHRydWUsICdmb290ZXInOiB0cnVlLCAnZm9ybSc6IHRydWUsXG4gICAgICAgICAgJ2gxJzogdHJ1ZSwgJ2gyJzogdHJ1ZSwgJ2gzJzogdHJ1ZSwgJ2g0JzogdHJ1ZSwgJ2g1JzogdHJ1ZSwgJ2g2JzogdHJ1ZSxcbiAgICAgICAgICAnaGVhZGVyJzogdHJ1ZSwgJ2hncm91cCc6IHRydWUsICdocic6IHRydWUsICdtZW51JzogdHJ1ZSwgJ25hdic6IHRydWUsICdvbCc6IHRydWUsXG4gICAgICAgICAgJ3AnOiB0cnVlLCAncHJlJzogdHJ1ZSwgJ3NlY3Rpb24nOiB0cnVlLCAndGFibGUnOiB0cnVlLCAndWwnOiB0cnVlfSxcbiAgICAncnAnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3J0JzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICd0Ym9keSc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndGQnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3Rmb290Jzogeyd0Ym9keSc6IHRydWV9LFxuICAgICd0aCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGhlYWQnOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RyJzogeyd0cic6IHRydWV9XG4gIH0sXG4gIGRvTm90SW5kZW50OiB7XCJwcmVcIjogdHJ1ZX0sXG4gIGFsbG93VW5xdW90ZWQ6IHRydWUsXG4gIGFsbG93TWlzc2luZzogdHJ1ZSxcbiAgY2FzZUZvbGQ6IHRydWVcbn1cblxudmFyIHhtbENvbmZpZyA9IHtcbiAgYXV0b1NlbGZDbG9zZXJzOiB7fSxcbiAgaW1wbGljaXRseUNsb3NlZDoge30sXG4gIGNvbnRleHRHcmFiYmVyczoge30sXG4gIGRvTm90SW5kZW50OiB7fSxcbiAgYWxsb3dVbnF1b3RlZDogZmFsc2UsXG4gIGFsbG93TWlzc2luZzogZmFsc2UsXG4gIGFsbG93TWlzc2luZ1RhZ05hbWU6IGZhbHNlLFxuICBjYXNlRm9sZDogZmFsc2Vcbn1cblxuQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwieG1sXCIsIGZ1bmN0aW9uKGVkaXRvckNvbmYsIGNvbmZpZ18pIHtcbiAgdmFyIGluZGVudFVuaXQgPSBlZGl0b3JDb25mLmluZGVudFVuaXRcbiAgdmFyIGNvbmZpZyA9IHt9XG4gIHZhciBkZWZhdWx0cyA9IGNvbmZpZ18uaHRtbE1vZGUgPyBodG1sQ29uZmlnIDogeG1sQ29uZmlnXG4gIGZvciAodmFyIHByb3AgaW4gZGVmYXVsdHMpIGNvbmZpZ1twcm9wXSA9IGRlZmF1bHRzW3Byb3BdXG4gIGZvciAodmFyIHByb3AgaW4gY29uZmlnXykgY29uZmlnW3Byb3BdID0gY29uZmlnX1twcm9wXVxuXG4gIC8vIFJldHVybiB2YXJpYWJsZXMgZm9yIHRva2VuaXplcnNcbiAgdmFyIHR5cGUsIHNldFN0eWxlO1xuXG4gIGZ1bmN0aW9uIGluVGV4dChzdHJlYW0sIHN0YXRlKSB7XG4gICAgZnVuY3Rpb24gY2hhaW4ocGFyc2VyKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IHBhcnNlcjtcbiAgICAgIHJldHVybiBwYXJzZXIoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiIVwiKSkge1xuICAgICAgICBpZiAoc3RyZWFtLmVhdChcIltcIikpIHtcbiAgICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKFwiQ0RBVEFbXCIpKSByZXR1cm4gY2hhaW4oaW5CbG9jayhcImF0b21cIiwgXCJdXT5cIikpO1xuICAgICAgICAgIGVsc2UgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiLS1cIikpIHtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oaW5CbG9jayhcImNvbW1lbnRcIiwgXCItLT5cIikpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIkRPQ1RZUEVcIiwgdHJ1ZSwgdHJ1ZSkpIHtcbiAgICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5fXFwtXS8pO1xuICAgICAgICAgIHJldHVybiBjaGFpbihkb2N0eXBlKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzdHJlYW0uZWF0KFwiP1wiKSkge1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5fXFwtXS8pO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluQmxvY2soXCJtZXRhXCIsIFwiPz5cIik7XG4gICAgICAgIHJldHVybiBcIm1ldGFcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGUgPSBzdHJlYW0uZWF0KFwiL1wiKSA/IFwiY2xvc2VUYWdcIiA6IFwib3BlblRhZ1wiO1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCImXCIpIHtcbiAgICAgIHZhciBvaztcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiI1wiKSkge1xuICAgICAgICBpZiAoc3RyZWFtLmVhdChcInhcIikpIHtcbiAgICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW2EtZkEtRlxcZF0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcZF0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXC5cXC06XS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9rID8gXCJhdG9tXCIgOiBcImVycm9yXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW14mPF0vKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBpblRleHQuaXNJblRleHQgPSB0cnVlO1xuXG4gIGZ1bmN0aW9uIGluVGFnKHN0cmVhbSwgc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIj5cIiB8fCAoY2ggPT0gXCIvXCIgJiYgc3RyZWFtLmVhdChcIj5cIikpKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHR5cGUgPSBjaCA9PSBcIj5cIiA/IFwiZW5kVGFnXCIgOiBcInNlbGZjbG9zZVRhZ1wiO1xuICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPVwiKSB7XG4gICAgICB0eXBlID0gXCJlcXVhbHNcIjtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgc3RhdGUuc3RhdGUgPSBiYXNlU3RhdGU7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgdmFyIG5leHQgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIHJldHVybiBuZXh0ID8gbmV4dCArIFwiIHRhZyBlcnJvclwiIDogXCJ0YWcgZXJyb3JcIjtcbiAgICB9IGVsc2UgaWYgKC9bXFwnXFxcIl0vLnRlc3QoY2gpKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluQXR0cmlidXRlKGNoKTtcbiAgICAgIHN0YXRlLnN0cmluZ1N0YXJ0Q29sID0gc3RyZWFtLmNvbHVtbigpO1xuICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0ubWF0Y2goL15bXlxcc1xcdTAwYTA9PD5cXFwiXFwnXSpbXlxcc1xcdTAwYTA9PD5cXFwiXFwnXFwvXS8pO1xuICAgICAgcmV0dXJuIFwid29yZFwiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluQXR0cmlidXRlKHF1b3RlKSB7XG4gICAgdmFyIGNsb3N1cmUgPSBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm5leHQoKSA9PSBxdW90ZSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcInN0cmluZ1wiO1xuICAgIH07XG4gICAgY2xvc3VyZS5pc0luQXR0cmlidXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gY2xvc3VyZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluQmxvY2soc3R5bGUsIHRlcm1pbmF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5tYXRjaCh0ZXJtaW5hdG9yKSkge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5uZXh0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkb2N0eXBlKGRlcHRoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHZhciBjaDtcbiAgICAgIHdoaWxlICgoY2ggPSBzdHJlYW0ubmV4dCgpKSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCArIDEpO1xuICAgICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaCA9PSBcIj5cIikge1xuICAgICAgICAgIGlmIChkZXB0aCA9PSAxKSB7XG4gICAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggLSAxKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcIm1ldGFcIjtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgc3RhcnRPZkxpbmUpIHtcbiAgICB0aGlzLnByZXYgPSBzdGF0ZS5jb250ZXh0O1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG4gICAgdGhpcy5pbmRlbnQgPSBzdGF0ZS5pbmRlbnRlZDtcbiAgICB0aGlzLnN0YXJ0T2ZMaW5lID0gc3RhcnRPZkxpbmU7XG4gICAgaWYgKGNvbmZpZy5kb05vdEluZGVudC5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSB8fCAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0Lm5vSW5kZW50KSlcbiAgICAgIHRoaXMubm9JbmRlbnQgPSB0cnVlO1xuICB9XG4gIGZ1bmN0aW9uIHBvcENvbnRleHQoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuY29udGV4dCkgc3RhdGUuY29udGV4dCA9IHN0YXRlLmNvbnRleHQucHJldjtcbiAgfVxuICBmdW5jdGlvbiBtYXliZVBvcENvbnRleHQoc3RhdGUsIG5leHRUYWdOYW1lKSB7XG4gICAgdmFyIHBhcmVudFRhZ05hbWU7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICghc3RhdGUuY29udGV4dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwYXJlbnRUYWdOYW1lID0gc3RhdGUuY29udGV4dC50YWdOYW1lO1xuICAgICAgaWYgKCFjb25maWcuY29udGV4dEdyYWJiZXJzLmhhc093blByb3BlcnR5KHBhcmVudFRhZ05hbWUpIHx8XG4gICAgICAgICAgIWNvbmZpZy5jb250ZXh0R3JhYmJlcnNbcGFyZW50VGFnTmFtZV0uaGFzT3duUHJvcGVydHkobmV4dFRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJhc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJvcGVuVGFnXCIpIHtcbiAgICAgIHN0YXRlLnRhZ1N0YXJ0ID0gc3RyZWFtLmNvbHVtbigpO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJjbG9zZVRhZ1wiKSB7XG4gICAgICByZXR1cm4gY2xvc2VUYWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiYXNlU3RhdGU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdHJlYW0uY3VycmVudCgpO1xuICAgICAgc2V0U3R5bGUgPSBcInRhZ1wiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGNsb3NlVGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgdmFyIHRhZ05hbWUgPSBzdHJlYW0uY3VycmVudCgpO1xuICAgICAgaWYgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lICE9IHRhZ05hbWUgJiZcbiAgICAgICAgICBjb25maWcuaW1wbGljaXRseUNsb3NlZC5oYXNPd25Qcm9wZXJ0eShzdGF0ZS5jb250ZXh0LnRhZ05hbWUpKVxuICAgICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICAgIGlmICgoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgPT0gdGFnTmFtZSkgfHwgY29uZmlnLm1hdGNoQ2xvc2luZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZ1wiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWcgZXJyb3JcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGVFcnI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGVFcnI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlICE9IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgfVxuICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgIHJldHVybiBiYXNlU3RhdGU7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VTdGF0ZUVycih0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGNsb3NlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhdHRyU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImF0dHJpYnV0ZVwiO1xuICAgICAgcmV0dXJuIGF0dHJFcVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImVuZFRhZ1wiIHx8IHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIikge1xuICAgICAgdmFyIHRhZ05hbWUgPSBzdGF0ZS50YWdOYW1lLCB0YWdTdGFydCA9IHN0YXRlLnRhZ1N0YXJ0O1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIGlmICh0eXBlID09IFwic2VsZmNsb3NlVGFnXCIgfHxcbiAgICAgICAgICBjb25maWcuYXV0b1NlbGZDbG9zZXJzLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgICBzdGF0ZS5jb250ZXh0ID0gbmV3IENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlU3RhdGU7XG4gICAgfVxuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGU7XG4gIH1cbiAgZnVuY3Rpb24gYXR0ckVxU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwiZXF1YWxzXCIpIHJldHVybiBhdHRyVmFsdWVTdGF0ZTtcbiAgICBpZiAoIWNvbmZpZy5hbGxvd01pc3NpbmcpIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYXR0clZhbHVlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIgJiYgY29uZmlnLmFsbG93VW5xdW90ZWQpIHtzZXRTdHlsZSA9IFwic3RyaW5nXCI7IHJldHVybiBhdHRyU3RhdGU7fVxuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYXR0ckNvbnRpbnVlZFN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0YXJ0U3RhdGU6IGZ1bmN0aW9uKGJhc2VJbmRlbnQpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHt0b2tlbml6ZTogaW5UZXh0LFxuICAgICAgICAgICAgICAgICAgIHN0YXRlOiBiYXNlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgaW5kZW50ZWQ6IGJhc2VJbmRlbnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiBudWxsLCB0YWdTdGFydDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBudWxsfVxuICAgICAgaWYgKGJhc2VJbmRlbnQgIT0gbnVsbCkgc3RhdGUuYmFzZUluZGVudCA9IGJhc2VJbmRlbnRcbiAgICAgIHJldHVybiBzdGF0ZVxuICAgIH0sXG5cbiAgICB0b2tlbjogZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKCFzdGF0ZS50YWdOYW1lICYmIHN0cmVhbS5zb2woKSlcbiAgICAgICAgc3RhdGUuaW5kZW50ZWQgPSBzdHJlYW0uaW5kZW50YXRpb24oKTtcblxuICAgICAgaWYgKHN0cmVhbS5lYXRTcGFjZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgIHR5cGUgPSBudWxsO1xuICAgICAgdmFyIHN0eWxlID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBpZiAoKHN0eWxlIHx8IHR5cGUpICYmIHN0eWxlICE9IFwiY29tbWVudFwiKSB7XG4gICAgICAgIHNldFN0eWxlID0gbnVsbDtcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBzdGF0ZS5zdGF0ZSh0eXBlIHx8IHN0eWxlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgICAgaWYgKHNldFN0eWxlKVxuICAgICAgICAgIHN0eWxlID0gc2V0U3R5bGUgPT0gXCJlcnJvclwiID8gc3R5bGUgKyBcIiBlcnJvclwiIDogc2V0U3R5bGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R5bGU7XG4gICAgfSxcblxuICAgIGluZGVudDogZnVuY3Rpb24oc3RhdGUsIHRleHRBZnRlciwgZnVsbExpbmUpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gc3RhdGUuY29udGV4dDtcbiAgICAgIC8vIEluZGVudCBtdWx0aS1saW5lIHN0cmluZ3MgKGUuZy4gY3NzKS5cbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZS5pc0luQXR0cmlidXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZS50YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZClcbiAgICAgICAgICByZXR1cm4gc3RhdGUuc3RyaW5nU3RhcnRDb2wgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLmluZGVudGVkICsgaW5kZW50VW5pdDtcbiAgICAgIH1cbiAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQubm9JbmRlbnQpIHJldHVybiBDb2RlTWlycm9yLlBhc3M7XG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUgIT0gaW5UYWcgJiYgc3RhdGUudG9rZW5pemUgIT0gaW5UZXh0KVxuICAgICAgICByZXR1cm4gZnVsbExpbmUgPyBmdWxsTGluZS5tYXRjaCgvXihcXHMqKS8pWzBdLmxlbmd0aCA6IDA7XG4gICAgICAvLyBJbmRlbnQgdGhlIHN0YXJ0cyBvZiBhdHRyaWJ1dGUgbmFtZXMuXG4gICAgICBpZiAoc3RhdGUudGFnTmFtZSkge1xuICAgICAgICBpZiAoY29uZmlnLm11bHRpbGluZVRhZ0luZGVudFBhc3RUYWcgIT09IGZhbHNlKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS50YWdTdGFydCArIHN0YXRlLnRhZ05hbWUubGVuZ3RoICsgMjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS50YWdTdGFydCArIGluZGVudFVuaXQgKiAoY29uZmlnLm11bHRpbGluZVRhZ0luZGVudEZhY3RvciB8fCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcuYWxpZ25DREFUQSAmJiAvPCFcXFtDREFUQVxcWy8udGVzdCh0ZXh0QWZ0ZXIpKSByZXR1cm4gMDtcbiAgICAgIHZhciB0YWdBZnRlciA9IHRleHRBZnRlciAmJiAvXjwoXFwvKT8oW1xcd186XFwuLV0qKS8uZXhlYyh0ZXh0QWZ0ZXIpO1xuICAgICAgaWYgKHRhZ0FmdGVyICYmIHRhZ0FmdGVyWzFdKSB7IC8vIENsb3NpbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC50YWdOYW1lID09IHRhZ0FmdGVyWzJdKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb25maWcuaW1wbGljaXRseUNsb3NlZC5oYXNPd25Qcm9wZXJ0eShjb250ZXh0LnRhZ05hbWUpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGFnQWZ0ZXIpIHsgLy8gT3BlbmluZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIHZhciBncmFiYmVycyA9IGNvbmZpZy5jb250ZXh0R3JhYmJlcnNbY29udGV4dC50YWdOYW1lXTtcbiAgICAgICAgICBpZiAoZ3JhYmJlcnMgJiYgZ3JhYmJlcnMuaGFzT3duUHJvcGVydHkodGFnQWZ0ZXJbMl0pKVxuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKGNvbnRleHQgJiYgY29udGV4dC5wcmV2ICYmICFjb250ZXh0LnN0YXJ0T2ZMaW5lKVxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgaWYgKGNvbnRleHQpIHJldHVybiBjb250ZXh0LmluZGVudCArIGluZGVudFVuaXQ7XG4gICAgICBlbHNlIHJldHVybiBzdGF0ZS5iYXNlSW5kZW50IHx8IDA7XG4gICAgfSxcblxuICAgIGVsZWN0cmljSW5wdXQ6IC88XFwvW1xcc1xcdzpdKz4kLyxcbiAgICBibG9ja0NvbW1lbnRTdGFydDogXCI8IS0tXCIsXG4gICAgYmxvY2tDb21tZW50RW5kOiBcIi0tPlwiLFxuXG4gICAgY29uZmlndXJhdGlvbjogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuICAgIGhlbHBlclR5cGU6IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcblxuICAgIHNraXBBdHRyaWJ1dGU6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBpZiAoc3RhdGUuc3RhdGUgPT0gYXR0clZhbHVlU3RhdGUpXG4gICAgICAgIHN0YXRlLnN0YXRlID0gYXR0clN0YXRlXG4gICAgfVxuICB9O1xufSk7XG5cbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQveG1sXCIsIFwieG1sXCIpO1xuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24veG1sXCIsIFwieG1sXCIpO1xuaWYgKCFDb2RlTWlycm9yLm1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShcInRleHQvaHRtbFwiKSlcbiAgQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC9odG1sXCIsIHtuYW1lOiBcInhtbFwiLCBodG1sTW9kZTogdHJ1ZX0pO1xuXG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld3N0dWRlbnRcIj5OZXcgU3R1ZGVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuICAgICAgbGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjYWR2aXNvcl9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmFkdmlzb3JfaWQgPSAkKCcjYWR2aXNvcl9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmRlcGFydG1lbnRfaWQgPSAkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBkYXRhLmVpZCA9ICQoJyNlaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdzdHVkZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3N0dWRlbnRzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3Jlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbnJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG5yZXF1aXJlKCdzdW1tZXJub3RlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdhZHZpc29yXCI+TmV3IEFkdmlzb3I8L2E+Jyk7XG5cbiAgJCgnI25vdGVzJykuc3VtbWVybm90ZSh7XG5cdFx0Zm9jdXM6IHRydWUsXG5cdFx0dG9vbGJhcjogW1xuXHRcdFx0Ly8gW2dyb3VwTmFtZSwgW2xpc3Qgb2YgYnV0dG9uc11dXG5cdFx0XHRbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG5cdFx0XHRbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG5cdFx0XHRbJ3BhcmEnLCBbJ3VsJywgJ29sJywgJ3BhcmFncmFwaCddXSxcblx0XHRcdFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuXHRcdF0sXG5cdFx0dGFic2l6ZTogMixcblx0XHRjb2RlbWlycm9yOiB7XG5cdFx0XHRtb2RlOiAndGV4dC9odG1sJyxcblx0XHRcdGh0bWxNb2RlOiB0cnVlLFxuXHRcdFx0bGluZU51bWJlcnM6IHRydWUsXG5cdFx0XHR0aGVtZTogJ21vbm9rYWknXG5cdFx0fSxcblx0fSk7XG5cblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCQoJ2Zvcm0nKVswXSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibmFtZVwiLCAkKCcjbmFtZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwib2ZmaWNlXCIsICQoJyNvZmZpY2UnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwicGhvbmVcIiwgJCgnI3Bob25lJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoXCJoaWRkZW5cIiwgJCgnI2hpZGRlbicpLmlzKCc6Y2hlY2tlZCcpID8gMSA6IDApO1xuXHRcdGlmKCQoJyNwaWMnKS52YWwoKSl7XG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZGVwYXJ0bWVudF9pZFwiLCAkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZWlkXCIsICQoJyNlaWQnKS52YWwoKSk7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdhZHZpc29yJztcbiAgICB9ZWxzZXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImVpZFwiLCAkKCcjZWlkJykudmFsKCkpO1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vYWR2aXNvcnMvJyArIGlkO1xuICAgIH1cblx0XHRkYXNoYm9hcmQuYWpheHNhdmUoZm9ybURhdGEsIHVybCwgaWQsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlYWR2aXNvclwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9hZHZpc29yc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlYWR2aXNvclwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9hZHZpc29yc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuYnRuLWZpbGUgOmZpbGUnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLFxuICAgICAgICBudW1GaWxlcyA9IGlucHV0LmdldCgwKS5maWxlcyA/IGlucHV0LmdldCgwKS5maWxlcy5sZW5ndGggOiAxLFxuICAgICAgICBsYWJlbCA9IGlucHV0LnZhbCgpLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC8uKlxcLy8sICcnKTtcbiAgICBpbnB1dC50cmlnZ2VyKCdmaWxlc2VsZWN0JywgW251bUZpbGVzLCBsYWJlbF0pO1xuICB9KTtcblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpLFxuICAgICAgICAgIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoIGlucHV0Lmxlbmd0aCApIHtcbiAgICAgICAgICBpbnB1dC52YWwobG9nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYoIGxvZyApIGFsZXJ0KGxvZyk7XG4gICAgICB9XG5cbiAgfSk7XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdkZXBhcnRtZW50XCI+TmV3IERlcGFydG1lbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGVtYWlsOiAkKCcjZW1haWwnKS52YWwoKSxcbiAgICAgIG9mZmljZTogJCgnI29mZmljZScpLnZhbCgpLFxuICAgICAgcGhvbmU6ICQoJyNwaG9uZScpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVwYXJ0bWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZXBhcnRtZW50cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlcGFydG1lbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVwYXJ0bWVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWRlcGFydG1lbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVwYXJ0bWVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cIj5OZXcgRGVncmVlIFByb2dyYW08L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGFiYnJldmlhdGlvbjogJCgnI2FiYnJldmlhdGlvbicpLnZhbCgpLFxuICAgICAgZGVzY3JpcHRpb246ICQoJyNkZXNjcmlwdGlvbicpLnZhbCgpLFxuICAgICAgZWZmZWN0aXZlX3llYXI6ICQoJyNlZmZlY3RpdmVfeWVhcicpLnZhbCgpLFxuICAgICAgZWZmZWN0aXZlX3NlbWVzdGVyOiAkKCcjZWZmZWN0aXZlX3NlbWVzdGVyJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmRlcGFydG1lbnRfaWQgPSAkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlZ3JlZXByb2dyYW1zLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVncmVlcHJvZ3JhbVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZWdyZWVwcm9ncmFtc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZGVncmVlcHJvZ3JhbVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZWdyZWVwcm9ncmFtc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZWxlY3RpdmVsaXN0XCI+TmV3IEVsZWN0aXZlIExpc3Q8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGFiYnJldmlhdGlvbjogJCgnI2FiYnJldmlhdGlvbicpLnZhbCgpLFxuICAgICAgZGVzY3JpcHRpb246ICQoJyNkZXNjcmlwdGlvbicpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZWxlY3RpdmVsaXN0JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2VsZWN0aXZlbGlzdHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWVsZWN0aXZlbGlzdFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9lbGVjdGl2ZWxpc3RzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWVsZWN0aXZlbGlzdFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9lbGVjdGl2ZWxpc3RzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld3BsYW5cIj5OZXcgUGxhbjwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZGVzY3JpcHRpb246ICQoJyNkZXNjcmlwdGlvbicpLnZhbCgpLFxuICAgICAgc3RhcnRfeWVhcjogJCgnI3N0YXJ0X3llYXInKS52YWwoKSxcbiAgICAgIHN0YXJ0X3NlbWVzdGVyOiAkKCcjc3RhcnRfc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3cGxhbic7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXBsYW5cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZXBsYW5cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXBvcHVsYXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSBhbGwgcmVxdWlyZW1lbnRzIGFuZCByZXBvcHVsYXRlIHRoZW0gYmFzZWQgb24gdGhlIHNlbGVjdGVkIGRlZ3JlZSBwcm9ncmFtLiBZb3UgY2Fubm90IHVuZG8gdGhpcyBhY3Rpb24uXCIpO1xuICBcdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgICB2YXIgdXJsID0gXCIvYWRtaW4vcG9wdWxhdGVwbGFuXCI7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgICAgfTtcbiAgICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgICB9XG4gIH0pXG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ3N0dWRlbnRfaWQnLCAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnKTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgZGFzaGJvYXJkLmluaXQoKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgb3JkZXJpbmc6ICQoJyNvcmRlcmluZycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zL25ld3BsYW5zZW1lc3Rlci8nICsgJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3Rlci8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3BsYW5zL2RlbGV0ZXBsYW5zZW1lc3Rlci9cIiArICQoJyNpZCcpLnZhbCgpIDtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnMvXCIgKyAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZVwiPk5ldyBDb21wbGV0ZWQgQ291cnNlPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGNvdXJzZW51bWJlcjogJCgnI2NvdXJzZW51bWJlcicpLnZhbCgpLFxuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIHllYXI6ICQoJyN5ZWFyJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBiYXNpczogJCgnI2Jhc2lzJykudmFsKCksXG4gICAgICBncmFkZTogJCgnI2dyYWRlJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjc3R1ZGVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLnN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ndHJhbnNmZXInXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLnRyYW5zZmVyID0gZmFsc2U7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGRhdGEudHJhbnNmZXIgPSB0cnVlO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfaW5zdGl0dXRpb24gPSAkKCcjaW5jb21pbmdfaW5zdGl0dXRpb24nKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX25hbWUgPSAkKCcjaW5jb21pbmdfbmFtZScpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfZGVzY3JpcHRpb24gPSAkKCcjaW5jb21pbmdfZGVzY3JpcHRpb24nKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX3NlbWVzdGVyID0gJCgnI2luY29taW5nX3NlbWVzdGVyJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19jcmVkaXRzID0gJCgnI2luY29taW5nX2NyZWRpdHMnKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2dyYWRlID0gJCgnI2luY29taW5nX2dyYWRlJykudmFsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3Y29tcGxldGVkY291cnNlJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2NvbXBsZXRlZGNvdXJzZXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVjb21wbGV0ZWRjb3Vyc2VcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vY29tcGxldGVkY291cnNlc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCdpbnB1dFtuYW1lPXRyYW5zZmVyXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbiAgaWYoJCgnI3RyYW5zZmVyY291cnNlJykuaXMoJzpoaWRkZW4nKSl7XG4gICAgJCgnI3RyYW5zZmVyMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgfWVsc2V7XG4gICAgJCgnI3RyYW5zZmVyMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgfVxuXG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSd0cmFuc2ZlciddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcja3N0YXRlY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjdHJhbnNmZXJjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI2tzdGF0ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI3RyYW5zZmVyY291cnNlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBzdGFydF95ZWFyOiAkKCcjc3RhcnRfeWVhcicpLnZhbCgpLFxuICAgICAgc3RhcnRfc2VtZXN0ZXI6ICQoJyNzdGFydF9zZW1lc3RlcicpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9mbG93Y2hhcnRzL25ldy8nICsgc3R1ZGVudF9pZDtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2Zsb3djaGFydHMvZWRpdC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICAgIHZhciB1cmwgPSBcIi9mbG93Y2hhcnRzL2RlbGV0ZVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9mbG93Y2hhcnRzL1wiICsgc3R1ZGVudF9pZDtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI3JlcG9wdWxhdGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIGFsbCByZXF1aXJlbWVudHMgYW5kIHJlcG9wdWxhdGUgdGhlbSBiYXNlZCBvbiB0aGUgc2VsZWN0ZWQgZGVncmVlIHByb2dyYW0uIFlvdSBjYW5ub3QgdW5kbyB0aGlzIGFjdGlvbi5cIik7XG4gIFx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAgIHZhciB1cmwgPSBcIi9mbG93Y2hhcnRzL3Jlc2V0XCI7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgICAgfTtcbiAgICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgICB9XG4gIH0pXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydGVkaXQuanMiLCIvL2h0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy81LjQvbWl4I3dvcmtpbmctd2l0aC1zY3JpcHRzXG4vL2h0dHBzOi8vYW5keS1jYXJ0ZXIuY29tL2Jsb2cvc2NvcGluZy1qYXZhc2NyaXB0LWZ1bmN0aW9uYWxpdHktdG8tc3BlY2lmaWMtcGFnZXMtd2l0aC1sYXJhdmVsLWFuZC1jYWtlcGhwXG5cbi8vTG9hZCBzaXRlLXdpZGUgbGlicmFyaWVzIGluIGJvb3RzdHJhcCBmaWxlXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcCcpO1xuXG52YXIgQXBwID0ge1xuXG5cdC8vIENvbnRyb2xsZXItYWN0aW9uIG1ldGhvZHNcblx0YWN0aW9uczoge1xuXHRcdC8vSW5kZXggZm9yIGRpcmVjdGx5IGNyZWF0ZWQgdmlld3Mgd2l0aCBubyBleHBsaWNpdCBjb250cm9sbGVyXG5cdFx0Um9vdFJvdXRlQ29udHJvbGxlcjoge1xuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWJvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuICAgIH0sXG5cblx0XHQvL0FkdmlzaW5nIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWR2aXNpbmdcblx0XHRBZHZpc2luZ0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWR2aXNpbmcvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNhbGVuZGFyID0gcmVxdWlyZSgnLi9wYWdlcy9jYWxlbmRhcicpO1xuXHRcdFx0XHRjYWxlbmRhci5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vR3JvdXBzZXNzaW9uIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvZ3JvdXBzZXNzaW9uXG4gICAgR3JvdXBzZXNzaW9uQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9ncm91cHNlc3Npb24vaW5kZXhcbiAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuICAgICAgfSxcblx0XHRcdC8vZ3JvdXBzZXNpb24vbGlzdFxuXHRcdFx0Z2V0TGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBncm91cHNlc3Npb24gPSByZXF1aXJlKCcuL3BhZ2VzL2dyb3Vwc2Vzc2lvbicpO1xuXHRcdFx0XHRncm91cHNlc3Npb24uaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Ly9Qcm9maWxlcyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL3Byb2ZpbGVcblx0XHRQcm9maWxlc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vcHJvZmlsZS9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcHJvZmlsZSA9IHJlcXVpcmUoJy4vcGFnZXMvcHJvZmlsZScpO1xuXHRcdFx0XHRwcm9maWxlLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9EYXNoYm9hcmQgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZG1pbi1sdGVcblx0XHREYXNoYm9hcmRDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuL3V0aWwvZGFzaGJvYXJkJyk7XG5cdFx0XHRcdGRhc2hib2FyZC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTdHVkZW50c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc3R1ZGVudHNcblx0XHRcdGdldFN0dWRlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3c3R1ZGVudFxuXHRcdFx0Z2V0TmV3c3R1ZGVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEFkdmlzb3JzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9hZHZpc29yc1xuXHRcdFx0Z2V0QWR2aXNvcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdhZHZpc29yXG5cdFx0XHRnZXROZXdhZHZpc29yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVwYXJ0bWVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlcGFydG1lbnRzXG5cdFx0XHRnZXREZXBhcnRtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZXBhcnRtZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0Jyk7XG5cdFx0XHRcdGRlcGFydG1lbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlcGFydG1lbnRcblx0XHRcdGdldE5ld2RlcGFydG1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRNZWV0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vbWVldGluZ3Ncblx0XHRcdGdldE1lZXRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1lZXRpbmdlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQnKTtcblx0XHRcdFx0bWVldGluZ2VkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0QmxhY2tvdXRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ibGFja291dHNcblx0XHRcdGdldEJsYWNrb3V0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBibGFja291dGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQnKTtcblx0XHRcdFx0YmxhY2tvdXRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2dyb3Vwc2Vzc2lvbnNcblx0XHRcdGdldEdyb3Vwc2Vzc2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQnKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTZXR0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc2V0dGluZ3Ncblx0XHRcdGdldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNldHRpbmdzID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MnKTtcblx0XHRcdFx0c2V0dGluZ3MuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVncmVlcHJvZ3JhbXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbURldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVxuXHRcdFx0Z2V0TmV3ZGVncmVlcHJvZ3JhbTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEVsZWN0aXZlbGlzdHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3RzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0Jyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3REZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2VsZWN0aXZlbGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9wbGFuc1xuXHRcdFx0Z2V0UGxhbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdCcpO1xuXHRcdFx0XHRwbGFuZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9wbGFuL3tpZH1cblx0XHRcdGdldFBsYW5EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmRldGFpbCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwnKTtcblx0XHRcdFx0cGxhbmRldGFpbC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuXG5cdFx0XHRnZXROZXdwbGFuOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0UGxhbnNlbWVzdGVyc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vcGxhbnNlbWVzdGVyXG5cdFx0XHRnZXRQbGFuU2VtZXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbnNlbWVzdGVyZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQnKTtcblx0XHRcdFx0cGxhbnNlbWVzdGVyZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuc2VtZXN0ZXJcblx0XHRcdGdldE5ld1BsYW5TZW1lc3RlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuc2VtZXN0ZXJlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdCcpO1xuXHRcdFx0XHRwbGFuc2VtZXN0ZXJlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdENvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcblx0XHRcdGdldENvbXBsZXRlZGNvdXJzZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2Vcblx0XHRcdGdldE5ld2NvbXBsZXRlZGNvdXJzZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb21wbGV0ZWRjb3Vyc2VlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdCcpO1xuXHRcdFx0XHRjb21wbGV0ZWRjb3Vyc2VlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEZsb3djaGFydHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2Zsb3djaGFydHMvdmlldy9cblx0XHRcdGdldEZsb3djaGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGZsb3djaGFydCA9IHJlcXVpcmUoJy4vcGFnZXMvZmxvd2NoYXJ0bGlzdCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdG5ld0Zsb3djaGFydDogZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIGZsb3djaGFydCA9IHJlcXVpcmUoJy4vcGFnZXMvZmxvd2NoYXJ0ZWRpdCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdGVkaXRGbG93Y2hhcnQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydGVkaXQnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdH0sXG5cblx0Ly9GdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBieSB0aGUgcGFnZSBhdCBsb2FkLiBEZWZpbmVkIGluIHJlc291cmNlcy92aWV3cy9pbmNsdWRlcy9zY3JpcHRzLmJsYWRlLnBocFxuXHQvL2FuZCBBcHAvSHR0cC9WaWV3Q29tcG9zZXJzL0phdmFzY3JpcHQgQ29tcG9zZXJcblx0Ly9TZWUgbGlua3MgYXQgdG9wIG9mIGZpbGUgZm9yIGRlc2NyaXB0aW9uIG9mIHdoYXQncyBnb2luZyBvbiBoZXJlXG5cdC8vQXNzdW1lcyAyIGlucHV0cyAtIHRoZSBjb250cm9sbGVyIGFuZCBhY3Rpb24gdGhhdCBjcmVhdGVkIHRoaXMgcGFnZVxuXHRpbml0OiBmdW5jdGlvbihjb250cm9sbGVyLCBhY3Rpb24pIHtcblx0XHRpZiAodHlwZW9mIHRoaXMuYWN0aW9uc1tjb250cm9sbGVyXSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRoaXMuYWN0aW9uc1tjb250cm9sbGVyXVthY3Rpb25dICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly9jYWxsIHRoZSBtYXRjaGluZyBmdW5jdGlvbiBpbiB0aGUgYXJyYXkgYWJvdmVcblx0XHRcdHJldHVybiBBcHAuYWN0aW9uc1tjb250cm9sbGVyXVthY3Rpb25dKCk7XG5cdFx0fVxuXHR9LFxufTtcblxuLy9CaW5kIHRvIHRoZSB3aW5kb3dcbndpbmRvdy5BcHAgPSBBcHA7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndpbmRvdy5fID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8qKlxuICogV2UnbGwgbG9hZCBqUXVlcnkgYW5kIHRoZSBCb290c3RyYXAgalF1ZXJ5IHBsdWdpbiB3aGljaCBwcm92aWRlcyBzdXBwb3J0XG4gKiBmb3IgSmF2YVNjcmlwdCBiYXNlZCBCb290c3RyYXAgZmVhdHVyZXMgc3VjaCBhcyBtb2RhbHMgYW5kIHRhYnMuIFRoaXNcbiAqIGNvZGUgbWF5IGJlIG1vZGlmaWVkIHRvIGZpdCB0aGUgc3BlY2lmaWMgbmVlZHMgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAqL1xuXG53aW5kb3cuJCA9IHdpbmRvdy5qUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcblxucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG5cbi8qKlxuICogV2UnbGwgbG9hZCB0aGUgYXhpb3MgSFRUUCBsaWJyYXJ5IHdoaWNoIGFsbG93cyB1cyB0byBlYXNpbHkgaXNzdWUgcmVxdWVzdHNcbiAqIHRvIG91ciBMYXJhdmVsIGJhY2stZW5kLiBUaGlzIGxpYnJhcnkgYXV0b21hdGljYWxseSBoYW5kbGVzIHNlbmRpbmcgdGhlXG4gKiBDU1JGIHRva2VuIGFzIGEgaGVhZGVyIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgXCJYU1JGXCIgdG9rZW4gY29va2llLlxuICovXG5cbndpbmRvdy5heGlvcyA9IHJlcXVpcmUoJ2F4aW9zJyk7XG5cbi8vaHR0cHM6Ly9naXRodWIuY29tL3JhcHBhc29mdC9sYXJhdmVsLTUtYm9pbGVycGxhdGUvYmxvYi9tYXN0ZXIvcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanNcbndpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuLyoqXG4gKiBOZXh0IHdlIHdpbGwgcmVnaXN0ZXIgdGhlIENTUkYgVG9rZW4gYXMgYSBjb21tb24gaGVhZGVyIHdpdGggQXhpb3Mgc28gdGhhdFxuICogYWxsIG91dGdvaW5nIEhUVFAgcmVxdWVzdHMgYXV0b21hdGljYWxseSBoYXZlIGl0IGF0dGFjaGVkLiBUaGlzIGlzIGp1c3RcbiAqIGEgc2ltcGxlIGNvbnZlbmllbmNlIHNvIHdlIGRvbid0IGhhdmUgdG8gYXR0YWNoIGV2ZXJ5IHRva2VuIG1hbnVhbGx5LlxuICovXG5cbmxldCB0b2tlbiA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpO1xuXG5pZiAodG9rZW4pIHtcbiAgICB3aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtQ1NSRi1UT0tFTiddID0gdG9rZW4uY29udGVudDtcbn0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcignQ1NSRiB0b2tlbiBub3QgZm91bmQ6IGh0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy9jc3JmI2NzcmYteC1jc3JmLXRva2VuJyk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIi8vbG9hZCByZXF1aXJlZCBKUyBsaWJyYXJpZXNcbnJlcXVpcmUoJ2Z1bGxjYWxlbmRhcicpO1xucmVxdWlyZSgnZGV2YnJpZGdlLWF1dG9jb21wbGV0ZScpO1xudmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2VvbmFzZGFuLWJvb3RzdHJhcC1kYXRldGltZXBpY2tlci1ydXNzZmVsZCcpO1xudmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi4vdXRpbC9lZGl0YWJsZScpO1xuXG4vL1Nlc3Npb24gZm9yIHN0b3JpbmcgZGF0YSBiZXR3ZWVuIGZvcm1zXG5leHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXG4vL0lEIG9mIHRoZSBjdXJyZW50bHkgbG9hZGVkIGNhbGVuZGFyJ3MgYWR2aXNvclxuZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9IC0xO1xuXG4vL1N0dWRlbnQncyBOYW1lIHNldCBieSBpbml0XG5leHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSBcIlwiO1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG5leHBvcnRzLmNhbGVuZGFyRGF0YSA9IHtcblx0aGVhZGVyOiB7XG5cdFx0bGVmdDogJ3ByZXYsbmV4dCB0b2RheScsXG5cdFx0Y2VudGVyOiAndGl0bGUnLFxuXHRcdHJpZ2h0OiAnYWdlbmRhV2VlayxhZ2VuZGFEYXknXG5cdH0sXG5cdGVkaXRhYmxlOiBmYWxzZSxcblx0ZXZlbnRMaW1pdDogdHJ1ZSxcblx0aGVpZ2h0OiAnYXV0bycsXG5cdHdlZWtlbmRzOiBmYWxzZSxcblx0YnVzaW5lc3NIb3Vyczoge1xuXHRcdHN0YXJ0OiAnODowMCcsIC8vIGEgc3RhcnQgdGltZSAoMTBhbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZW5kOiAnMTc6MDAnLCAvLyBhbiBlbmQgdGltZSAoNnBtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRkb3c6IFsgMSwgMiwgMywgNCwgNSBdXG5cdH0sXG5cdGRlZmF1bHRWaWV3OiAnYWdlbmRhV2VlaycsXG5cdHZpZXdzOiB7XG5cdFx0YWdlbmRhOiB7XG5cdFx0XHRhbGxEYXlTbG90OiBmYWxzZSxcblx0XHRcdHNsb3REdXJhdGlvbjogJzAwOjIwOjAwJyxcblx0XHRcdG1pblRpbWU6ICcwODowMDowMCcsXG5cdFx0XHRtYXhUaW1lOiAnMTc6MDA6MDAnXG5cdFx0fVxuXHR9LFxuXHRldmVudFNvdXJjZXM6IFtcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvbWVldGluZ2ZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBtZWV0aW5nIGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjNTEyODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ3doaXRlJyxcblx0XHR9LFxuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9ibGFja291dGZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBibGFja291dCBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnI0ZGODg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICdibGFjaycsXG5cdFx0fSxcblx0XSxcblx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0c2VsZWN0SGVscGVyOiB0cnVlLFxuXHRzZWxlY3RPdmVybGFwOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHJldHVybiBldmVudC5yZW5kZXJpbmcgPT09ICdiYWNrZ3JvdW5kJztcblx0fSxcblx0dGltZUZvcm1hdDogJyAnLFxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2VcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGEgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTExMJyxcblx0XHRzdGVwcGluZzogMjAsXG5cdFx0ZW5hYmxlZEhvdXJzOiBbOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3XSxcblx0XHRtYXhIb3VyOiAxNyxcblx0XHRzaWRlQnlTaWRlOiB0cnVlLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlIGRheSBvbmx5XG5leHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdNTS9ERC9ZWVlZJyxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vKipcbiAqIEluaXRpYWx6YXRpb24gZnVuY3Rpb24gZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSBhZHZpc29yIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSB1c2VyIGlzIGFuIGFkdmlzb3JcbiAqIEBwYXJhbSBub2JpbmQgLSBib29sZWFuIHRydWUgaWYgdGhlIGJ1dHRvbnMgc2hvdWxkIG5vdCBiZSBib3VuZCAobWFrZSBjYWxlbmRhciByZWFkLW9ubHkpXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gZnJvbSBhIHByZXZpb3VzIGFjdGlvblxuXHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG5cdC8vaW5pdGFsaXplIGVkaXRhYmxlIGVsZW1lbnRzXG5cdGVkaXRhYmxlLmluaXQoKTtcblxuXHQvL3R3ZWFrIHBhcmFtZXRlcnNcblx0d2luZG93LmFkdmlzb3IgfHwgKHdpbmRvdy5hZHZpc29yID0gZmFsc2UpO1xuXHR3aW5kb3cubm9iaW5kIHx8ICh3aW5kb3cubm9iaW5kID0gZmFsc2UpO1xuXG5cdC8vZ2V0IHRoZSBjdXJyZW50IGFkdmlzb3IncyBJRFxuXHRleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gJCgnI2NhbGVuZGFyQWR2aXNvcklEJykudmFsKCkudHJpbSgpO1xuXG5cdC8vU2V0IHRoZSBhZHZpc29yIGluZm9ybWF0aW9uIGZvciBtZWV0aW5nIGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMF0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9TZXQgdGhlIGFkdnNpb3IgaW5mb3JhbXRpb24gZm9yIGJsYWNrb3V0IGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9pZiB0aGUgd2luZG93IGlzIHNtYWxsLCBzZXQgZGlmZmVyZW50IGRlZmF1bHQgZm9yIGNhbGVuZGFyXG5cdGlmKCQod2luZG93KS53aWR0aCgpIDwgNjAwKXtcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5kZWZhdWx0VmlldyA9ICdhZ2VuZGFEYXknO1xuXHR9XG5cblx0Ly9JZiBub2JpbmQsIGRvbid0IGJpbmQgdGhlIGZvcm1zXG5cdGlmKCF3aW5kb3cubm9iaW5kKXtcblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgYW4gYWR2aXNvciwgYmluZCBtb3JlIGRhdGFcblx0XHRpZih3aW5kb3cuYWR2aXNvcil7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyN0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0X3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI2VuZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI2VuZF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5zaG93KCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2Jykuc2hvdygpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuXHRcdFx0Ly9iaW5kIG1ldGhvZHMgZm9yIGJ1dHRvbnMgYW5kIGZvcm1zXG5cdFx0XHQkKCcjbmV3U3R1ZGVudEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgbmV3U3R1ZGVudCk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2J0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRcdFx0ICAgICQodGhpcykuZmluZCgnLmhhcy1lcnJvcicpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS50ZXh0KCcnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vYmluZCBhdXRvY29tcGxldGUgZmllbGRcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5hdXRvY29tcGxldGUoe1xuXHRcdFx0ICAgIHNlcnZpY2VVcmw6ICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcsXG5cdFx0XHQgICAgYWpheFNldHRpbmdzOiB7XG5cdFx0XHQgICAgXHRkYXRhVHlwZTogXCJqc29uXCJcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuXHRcdFx0ICAgICAgICAkKCcjc3R1ZGVudGlkdmFsJykudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHQgICAgICAgIHJldHVybiB7XG5cdFx0XHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0XHRcdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0XHRcdCAgICAgICAgICAgIH0pXG5cdFx0XHQgICAgICAgIH07XG5cdFx0XHQgICAgfVxuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjc3RhcnQnLCAnI2VuZCcsICcjZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNic3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjYmVuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNic3RhcnQnLCAnI2JlbmQnLCAnI2JkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JyZXBlYXR1bnRpbF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkpO1xuXG5cdFx0XHQvL2NoYW5nZSByZW5kZXJpbmcgb2YgZXZlbnRzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHRcdFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWNsaWNrYWJsZVwiKTtcblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdtJyl7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZCcpLnZhbChldmVudC5zdHVkZW50bmFtZSk7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdFx0ZXZlbnQ6IGV2ZW50XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZihldmVudC5yZXBlYXQgPT0gJzAnKXtcblx0XHRcdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0XHRcdGVuZDogZW5kXG5cdFx0XHRcdH07XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdH07XG5cblx0XHRcdC8vYmluZCBtb3JlIGJ1dHRvbnNcblx0XHRcdCQoJyNicmVwZWF0JykuY2hhbmdlKHJlcGVhdENoYW5nZSk7XG5cblx0XHRcdCQoJyNzYXZlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVCbGFja291dCk7XG5cblx0XHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRTZXJpZXMnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0T2NjdXJyZW5jZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRPY2N1cnJlbmNlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2FkdmlzaW5nQnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9mZignaGlkZGVuLmJzLm1vZGFsJyk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlTWVldGluZ0J0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXRCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdFx0JCgnI3Jlc29sdmVCdXR0b24nKS5vbignY2xpY2snLCByZXNvbHZlQ29uZmxpY3RzKTtcblxuXHRcdFx0bG9hZENvbmZsaWN0cygpO1xuXG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIG5vdCBhbiBhZHZpc29yLCBiaW5kIGxlc3MgZGF0YVxuXHRcdH1lbHNle1xuXG5cdFx0XHQvL0dldCB0aGUgY3VycmVudCBzdHVkZW50J3MgbmFtZVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gJCgnI2NhbGVuZGFyU3R1ZGVudE5hbWUnKS52YWwoKS50cmltKCk7XG5cblx0XHQgIC8vUmVuZGVyIGJsYWNrb3V0cyB0byBiYWNrZ3JvdW5kXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuXG5cdFx0ICAvL1doZW4gcmVuZGVyaW5nLCB1c2UgdGhpcyBjdXN0b20gZnVuY3Rpb24gZm9yIGJsYWNrb3V0cyBhbmQgc3R1ZGVudCBtZWV0aW5nc1xuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdFx0ICAgIH1cblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0XHQgICAgfVxuXHRcdFx0fTtcblxuXHRcdCAgLy9Vc2UgdGhpcyBtZXRob2QgZm9yIGNsaWNraW5nIG9uIG1lZXRpbmdzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0XHRcdFx0aWYoZXZlbnQuc3RhcnQuaXNBZnRlcihtb21lbnQoKSkpe1xuXHRcdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KFwiWW91IGNhbm5vdCBlZGl0IG1lZXRpbmdzIGluIHRoZSBwYXN0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdCAgLy9XaGVuIHNlbGVjdGluZyBuZXcgYXJlYXMsIHVzZSB0aGUgc3R1ZGVudFNlbGVjdCBtZXRob2QgaW4gdGhlIGNhbGVuZGFyIGxpYnJhcnlcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IHN0dWRlbnRTZWxlY3Q7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNkZXNjJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0XCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JChcIiNlbmRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjZW5kX3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJy5tb2RhbCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXHRcdH1cblxuXHRcdC8vQmluZCBjbGljayBoYW5kbGVycyBvbiB0aGUgZm9ybVxuXHRcdCQoJyNzYXZlQnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlTWVldGluZyk7XG5cdFx0JCgnI2RlbGV0ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlTWVldGluZyk7XG5cdFx0JCgnI2R1cmF0aW9uJykub24oJ2NoYW5nZScsIGNoYW5nZUR1cmF0aW9uKTtcblxuXHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzIHdpdGggbm8gYmluZGluZ1xuXHR9ZWxzZXtcblx0XHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzLCBzZXQgcmVuZGVyaW5nIHRvIGJhY2tncm91bmRcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdGFibGUgPSBmYWxzZTtcblxuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdCAgICB9XG5cdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0ICAgIH1cblx0XHR9O1xuXHR9XG5cblx0Ly9pbml0YWxpemUgdGhlIGNhbGVuZGFyIVxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoZXhwb3J0cy5jYWxlbmRhckRhdGEpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGNhbGVuZGFyIGJ5IGNsb3NpbmcgbW9kYWxzIGFuZCByZWxvYWRpbmcgZGF0YVxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBmb3JtIHRvIGhpZGUgKGFuZCB0aGUgc3BpbilcbiAqIEBwYXJhbSByZXBvbnNlIC0gdGhlIEF4aW9zIHJlcHNvbnNlIG9iamVjdCByZWNlaXZlZFxuICovXG52YXIgcmVzZXRDYWxlbmRhciA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlc3BvbnNlKXtcblx0Ly9oaWRlIHRoZSBmb3JtXG5cdCQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2Rpc3BsYXkgdGhlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcblx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cblx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRpZih3aW5kb3cuYWR2aXNvcil7XG5cdFx0bG9hZENvbmZsaWN0cygpO1xuXHR9XG59XG5cbi8qKlxuICogQUpBWCBtZXRob2QgdG8gc2F2ZSBkYXRhIGZyb20gYSBmb3JtXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgc291cmNlIGVsZW1lbnQgb2YgdGhlIGRhdGFcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhTYXZlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24pe1xuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHQgIC8vaWYgcmVzcG9uc2UgaXMgMnh4XG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0fSlcblx0XHQvL2lmIHJlc3BvbnNlIGlzIG5vdCAyeHhcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHR9KTtcbn1cblxudmFyIGFqYXhEZWxldGUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbiwgbm9SZXNldCwgbm9DaG9pY2Upe1xuXHQvL2NoZWNrIG5vUmVzZXQgdmFyaWFibGVcblx0bm9SZXNldCB8fCAobm9SZXNldCA9IGZhbHNlKTtcblx0bm9DaG9pY2UgfHwgKG5vQ2hvaWNlID0gZmFsc2UpO1xuXG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBjb25maXJtYXRpb25cblx0aWYoIW5vQ2hvaWNlKXtcblx0XHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdH1lbHNle1xuXHRcdHZhciBjaG9pY2UgPSB0cnVlO1xuXHR9XG5cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblxuXHRcdC8vaWYgY29uZmlybWVkLCBzaG93IHNwaW5uaW5nIGljb25cblx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vbWFrZSBBSkFYIHJlcXVlc3QgdG8gZGVsZXRlXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihub1Jlc2V0KXtcblx0XHRcdFx0XHQvL2hpZGUgcGFyZW50IGVsZW1lbnQgLSBUT0RPIFRFU1RNRVxuXHRcdFx0XHRcdC8vY2FsbGVyLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIGEgbWVldGluZ1xuICovXG52YXIgc2F2ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlRXZlbnRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0c3RhcnQ6IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0ZW5kOiBtb21lbnQoJCgnI2VuZCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHR0aXRsZTogJCgnI3RpdGxlJykudmFsKCksXG5cdFx0ZGVzYzogJCgnI2Rlc2MnKS52YWwoKSxcblx0XHRzdGF0dXM6ICQoJyNzdGF0dXMnKS52YWwoKVxuXHR9O1xuXHRkYXRhLmlkID0gZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRDtcblx0aWYoJCgnI21lZXRpbmdJRCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5tZWV0aW5naWQgPSAkKCcjbWVldGluZ0lEJykudmFsKCk7XG5cdH1cblx0aWYoJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5zdHVkZW50aWQgPSAkKCcjc3R1ZGVudGlkdmFsJykudmFsKCk7XG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlbWVldGluZyc7XG5cblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdzYXZlIG1lZXRpbmcnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGEgbWVldGluZ1xuICovXG52YXIgZGVsZXRlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCB1cmxcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiAkKCcjbWVldGluZ0lEJykudmFsKClcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdkZWxldGUgbWVldGluZycsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcG9wdWxhdGUgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgZWRpdGluZ1xuICpcbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byBlZGl0XG4gKi9cbnZhciBzaG93TWVldGluZ0Zvcm0gPSBmdW5jdGlvbihldmVudCl7XG5cdCQoJyN0aXRsZScpLnZhbChldmVudC50aXRsZSk7XG5cdCQoJyNzdGFydCcpLnZhbChldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZW5kJykudmFsKGV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZGVzYycpLnZhbChldmVudC5kZXNjKTtcblx0ZHVyYXRpb25PcHRpb25zKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpO1xuXHQkKCcjbWVldGluZ0lEJykudmFsKGV2ZW50LmlkKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0JCgnI3N0YXR1cycpLnZhbChldmVudC5zdGF0dXMpO1xuXHQkKCcjZGVsZXRlQnV0dG9uJykuc2hvdygpO1xuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBjcmVhdGlvblxuICpcbiAqIEBwYXJhbSBjYWxlbmRhclN0dWRlbnROYW1lIC0gc3RyaW5nIG5hbWUgb2YgdGhlIHN0dWRlbnRcbiAqL1xudmFyIGNyZWF0ZU1lZXRpbmdGb3JtID0gZnVuY3Rpb24oY2FsZW5kYXJTdHVkZW50TmFtZSl7XG5cblx0Ly9wb3B1bGF0ZSB0aGUgdGl0bGUgYXV0b21hdGljYWxseSBmb3IgYSBzdHVkZW50XG5cdGlmKGNhbGVuZGFyU3R1ZGVudE5hbWUgIT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3RpdGxlJykudmFsKGNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9ZWxzZXtcblx0XHQkKCcjdGl0bGUnKS52YWwoJycpO1xuXHR9XG5cblx0Ly9TZXQgc3RhcnQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjc3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZW5kIHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNlbmQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMjApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZHVyYXRpb24gb3B0aW9uc1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHRkdXJhdGlvbk9wdGlvbnMobW9tZW50KCkuaG91cig4KS5taW51dGUoMCksIG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKSk7XG5cdH1lbHNle1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCwgZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kKTtcblx0fVxuXG5cdC8vUmVzZXQgb3RoZXIgb3B0aW9uc1xuXHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0Ly9IaWRlIGRlbGV0ZSBidXR0b25cblx0JCgnI2RlbGV0ZUJ1dHRvbicpLmhpZGUoKTtcblxuXHQvL1Nob3cgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSBvbiB0aGlzIHBhZ2VcbiAqL1xudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNldCBkdXJhdGlvbiBvcHRpb25zIGZvciB0aGUgbWVldGluZyBmb3JtXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZVxuICogQHBhcmFtIGVuZCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZGluZyB0aW1lXG4gKi9cbnZhciBkdXJhdGlvbk9wdGlvbnMgPSBmdW5jdGlvbihzdGFydCwgZW5kKXtcblx0Ly9jbGVhciB0aGUgbGlzdFxuXHQkKCcjZHVyYXRpb24nKS5lbXB0eSgpO1xuXG5cdC8vYXNzdW1lIGFsbCBtZWV0aW5ncyBoYXZlIHJvb20gZm9yIDIwIG1pbnV0ZXNcblx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nMjAnPjIwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MjAsIGFsbG93IDQwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDIwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNDAnPjQwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDowMCwgYWxsb3cgNjAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzYwJz42MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9zZXQgZGVmYXVsdCB2YWx1ZSBiYXNlZCBvbiBnaXZlbiBzcGFuXG5cdCQoJyNkdXJhdGlvbicpLnZhbChlbmQuZGlmZihzdGFydCwgXCJtaW51dGVzXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbGluayB0aGUgZGF0ZXBpY2tlcnMgdG9nZXRoZXJcbiAqXG4gKiBAcGFyYW0gZWxlbTEgLSBqUXVlcnkgb2JqZWN0IGZvciBmaXJzdCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZWxlbTIgLSBqUXVlcnkgb2JqZWN0IGZvciBzZWNvbmQgZGF0ZXBpY2tlclxuICogQHBhcmFtIGR1cmF0aW9uIC0gZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGxpbmtEYXRlUGlja2VycyA9IGZ1bmN0aW9uKGVsZW0xLCBlbGVtMiwgZHVyYXRpb24pe1xuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBmaXJzdCBkYXRhcGlja2VyXG5cdCQoZWxlbTEgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUyID0gbW9tZW50KCQoZWxlbTIpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQWZ0ZXIoZGF0ZTIpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTIpKXtcblx0XHRcdGRhdGUyID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0yKS52YWwoZGF0ZTIuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIHNlY29uZCBkYXRlcGlja2VyXG5cdCQoZWxlbTIgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUxID0gbW9tZW50KCQoZWxlbTEpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQmVmb3JlKGRhdGUxKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUxKSl7XG5cdFx0XHRkYXRlMSA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMSkudmFsKGRhdGUxLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgY2hhbmdlRHVyYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgbmV3RGF0ZSA9IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgJ0xMTCcpLmFkZCgkKHRoaXMpLnZhbCgpLCBcIm1pbnV0ZXNcIik7XG5cdCQoJyNlbmQnKS52YWwobmV3RGF0ZS5mb3JtYXQoXCJMTExcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2ZXJpZnkgdGhhdCB0aGUgc3R1ZGVudHMgYXJlIHNlbGVjdGluZyBtZWV0aW5ncyB0aGF0IGFyZW4ndCB0b28gbG9uZ1xuICpcbiAqIEBwYXJhbSBzdGFydCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCBvZiB0aGUgbWVldGluZ1xuICogQHBhcmFtIGVuZCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmQgb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIHN0dWRlbnRTZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cblx0Ly9XaGVuIHN0dWRlbnRzIHNlbGVjdCBhIG1lZXRpbmcsIGRpZmYgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXNcblx0aWYoZW5kLmRpZmYoc3RhcnQsICdtaW51dGVzJykgPiA2MCl7XG5cblx0XHQvL2lmIGludmFsaWQsIHVuc2VsZWN0IGFuZCBzaG93IGFuIGVycm9yXG5cdFx0YWxlcnQoXCJNZWV0aW5ncyBjYW5ub3QgbGFzdCBsb25nZXIgdGhhbiAxIGhvdXJcIik7XG5cdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHR9ZWxzZXtcblxuXHRcdC8vaWYgdmFsaWQsIHNldCBkYXRhIGluIHRoZSBzZXNzaW9uIGFuZCBzaG93IHRoZSBmb3JtXG5cdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRlbmQ6IGVuZFxuXHRcdH07XG5cdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0Y3JlYXRlTWVldGluZ0Zvcm0oZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBMb2FkIGNvbmZsaWN0aW5nIG1lZXRpbmdzIGZyb20gdGhlIHNlcnZlclxuICovXG52YXIgbG9hZENvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9yZXF1ZXN0IGNvbmZsaWN0cyB2aWEgQUpBWFxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvYWR2aXNpbmcvY29uZmxpY3RzJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdC8vZGlzYWJsZSBleGlzdGluZyBjbGljayBoYW5kbGVyc1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0Ly9JZiByZXNwb25zZSBpcyAyMDAsIGRhdGEgd2FzIHJlY2VpdmVkXG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gMjAwKXtcblxuXHRcdFx0XHQvL0FwcGVuZCBIVE1MIGZvciBjb25mbGljdHMgdG8gRE9NXG5cdFx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpLmVtcHR5KCk7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdCQoJzxkaXYvPicsIHtcblx0XHRcdFx0XHRcdCdpZCcgOiAncmVzb2x2ZScrdmFsdWUuaWQsXG5cdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPjxpIGNsYXNzPVwiZmEgZmEtdHJhc2hcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+IERlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+PGkgY2xhc3M9XCJmYSBmYS1wZW5jaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+IEVkaXQ8L2J1dHRvbj4gJyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCByZXNvbHZlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz48aSBjbGFzcz1cImZhIGZhLWZsb3BweS1vXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPiBLZWVwPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlJyt2YWx1ZS5pZCsnc3BpblwiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vUmUtcmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnNcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdFx0Ly9TaG93IHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuXHRcdCAgLy9JZiByZXNwb25zZSBpcyAyMDQsIG5vIGNvbmZsaWN0cyBhcmUgcHJlc2VudFxuXHRcdFx0fWVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwNCl7XG5cblx0XHRcdFx0Ly9IaWRlIHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBTYXZlIGJsYWNrb3V0cyBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBzYXZlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlQmxhY2tvdXRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCB1cmw7XG5cdHZhciBkYXRhID0ge1xuXHRcdGJzdGFydDogbW9tZW50KCQoJyNic3RhcnQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJlbmQ6IG1vbWVudCgkKCcjYmVuZCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YnRpdGxlOiAkKCcjYnRpdGxlJykudmFsKClcblx0fTtcblx0dmFyIHVybDtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YS5iYmxhY2tvdXRldmVudGlkID0gJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dCc7XG5cdFx0aWYoJCgnI2JibGFja291dGlkJykudmFsKCkgPiAwKXtcblx0XHRcdGRhdGEuYmJsYWNrb3V0aWQgPSAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKTtcblx0XHR9XG5cdFx0ZGF0YS5icmVwZWF0ID0gJCgnI2JyZXBlYXQnKS52YWwoKTtcblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDEpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnk9ICQoJyNicmVwZWF0ZGFpbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDIpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnkgPSAkKCcjYnJlcGVhdHdlZWtseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNtID0gJCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3QgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdyA9ICQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN1ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c2YgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ3NhdmUgYmxhY2tvdXQnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGJsYWNrb3V0IGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIGRlbGV0ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIFVSTCBhbmQgZGF0YSBvYmplY3Rcblx0dmFyIHVybCwgZGF0YTtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0ZXZlbnRpZDogJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSB9O1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRpZDogJCgnI2JibGFja291dGlkJykudmFsKCkgfTtcblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnZGVsZXRlIGJsYWNrb3V0JywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGNoYW5nZSBvZiByZXBlYXQgb3B0aW9ucyBvbiB0aGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgcmVwZWF0Q2hhbmdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCh0aGlzKS52YWwoKSA9PSAwKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMSl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDIpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fVxufTtcblxuLyoqXG4gKiBTaG93IHRoZSByZXNvbHZlIGNvbmZsaWN0cyBtb2RhbCBmb3JtXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0Ly9zZW5kIEFKQVggZGVsZXRlXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdkZWxldGUgbWVldGluZycsIHRydWUpO1xuXG59O1xuXG4vKipcbiAqIEVkaXQgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZWRpdENvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9tZWV0aW5nJztcblxuXHQvL3Nob3cgc3Bpbm5lciB0byBsb2FkIG1lZXRpbmdcblx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vbG9hZCBtZWV0aW5nIGFuZCBkaXNwbGF5IGZvcm1cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRldmVudCA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRldmVudC5zdGFydCA9IG1vbWVudChldmVudC5zdGFydCk7XG5cdFx0XHRldmVudC5lbmQgPSBtb21lbnQoZXZlbnQuZW5kKTtcblx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgbWVldGluZycsICcjcmVzb2x2ZScgKyBpZCwgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBSZXNvbHZlIGEgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9yZXNvbHZlY29uZmxpY3QnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdyZXNvbHZlIG1lZXRpbmcnLCB0cnVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBjcmVhdGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgY3JlYXRlQmxhY2tvdXRGb3JtID0gZnVuY3Rpb24oKXtcblx0JCgnI2J0aXRsZScpLnZhbChcIlwiKTtcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQoKS5ob3VyKDkpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0JCgnI2JyZXBlYXQnKS52YWwoMCk7XG5cdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmhpZGUoKTtcblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gdG8gYSBzaW5nbGUgb2NjdXJyZW5jZVxuICovXG52YXIgYmxhY2tvdXRPY2N1cnJlbmNlID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9zZXQgZm9ybSB2YWx1ZXMgYW5kIGhpZGUgdW5uZWVkZWQgZmllbGRzXG5cdCQoJyNidGl0bGUnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQudGl0bGUpO1xuXHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjcmVwZWF0ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0JCgnI2JibGFja291dGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkKTtcblx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuaWQpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cblx0Ly9zaG93IHRoZSBmb3JtXG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBibGFja291dCBzZXJpZXMgZWRpdCBmb3JtXG4gKi9cbnZhciBibGFja291dFNlcmllcyA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuIFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRpZDogZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9ibGFja291dCc7XG5cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI2J0aXRsZScpLnZhbChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXHQgXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuc3RhcnQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuZW5kLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChyZXNwb25zZS5kYXRhLmlkKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdCBcdFx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQgXHRcdGlmKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMSl7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdGRhaWx5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9ZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAyKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2x5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0XHRcdFx0dmFyIHJlcGVhdF9kZXRhaWwgPSBTdHJpbmcocmVzcG9uc2UuZGF0YS5yZXBlYXRfZGV0YWlsKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIxXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIyXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIzXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI0XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI1XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9XG5cdCBcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXHQgXHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgYmxhY2tvdXQgc2VyaWVzJywgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IHN0dWRlbnQgaW4gdGhlIGRhdGFiYXNlXG4gKi9cbnZhciBuZXdTdHVkZW50ID0gZnVuY3Rpb24oKXtcblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGFuIGVJRCB0byBhZGQgdG8gdGhlIHN5c3RlbVxuXHR2YXIgZWlkID0gcHJvbXB0KFwiRW50ZXIgdGhlIHN0dWRlbnQncyBlSURcIik7XG5cblx0Ly9idWlsZCB0aGUgVVJMIGFuZCBkYXRhXG5cdHZhciBkYXRhID0ge1xuXHRcdGVpZDogZWlkLFxuXHR9O1xuXHR2YXIgdXJsID0gJy9wcm9maWxlL25ld3N0dWRlbnQnO1xuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGFbXCJlaWRcIl0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xudmFyIEVjaG8gPSByZXF1aXJlKCdsYXJhdmVsLWVjaG8nKTtcbnJlcXVpcmUoJ2lvbi1zb3VuZCcpO1xuXG53aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8qKlxuICogR3JvdXBzZXNzaW9uIGluaXQgZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgdG8gc3RhcnRcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2xvYWQgaW9uLXNvdW5kIGxpYnJhcnlcblx0aW9uLnNvdW5kKHtcbiAgICBzb3VuZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJkb29yX2JlbGxcIlxuICAgICAgICB9LFxuICAgIF0sXG4gICAgdm9sdW1lOiAxLjAsXG4gICAgcGF0aDogXCIvc291bmRzL1wiLFxuICAgIHByZWxvYWQ6IHRydWVcblx0fSk7XG5cblx0Ly9nZXQgdXNlcklEIGFuZCBpc0Fkdmlzb3IgdmFyaWFibGVzXG5cdHdpbmRvdy51c2VySUQgPSBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpO1xuXG5cdC8vcmVnaXN0ZXIgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykub24oJ2NsaWNrJywgZ3JvdXBSZWdpc3RlckJ0bik7XG5cblx0Ly9kaXNhYmxlIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBEaXNhYmxlQnRuJykub24oJ2NsaWNrJywgZ3JvdXBEaXNhYmxlQnRuKTtcblxuXHQvL3JlbmRlciBWdWUgQXBwXG5cdHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2dyb3VwTGlzdCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0cXVldWU6IFtdLFxuXHRcdFx0YWR2aXNvcjogcGFyc2VJbnQoJCgnI2lzQWR2aXNvcicpLnZhbCgpKSA9PSAxLFxuXHRcdFx0dXNlcklEOiBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpLFxuXHRcdFx0b25saW5lOiBbXSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdC8vRnVuY3Rpb24gdG8gZ2V0IENTUyBjbGFzc2VzIGZvciBhIHN0dWRlbnQgb2JqZWN0XG5cdFx0XHRnZXRDbGFzczogZnVuY3Rpb24ocyl7XG5cdFx0XHRcdHJldHVybntcblx0XHRcdFx0XHQnYWxlcnQtaW5mbyc6IHMuc3RhdHVzID09IDAgfHwgcy5zdGF0dXMgPT0gMSxcblx0XHRcdFx0XHQnYWxlcnQtc3VjY2Vzcyc6IHMuc3RhdHVzID09IDIsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1tZSc6IHMudXNlcmlkID09IHRoaXMudXNlcklELFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tb2ZmbGluZSc6ICQuaW5BcnJheShzLnVzZXJpZCwgdGhpcy5vbmxpbmUpID09IC0xLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdC8vZnVuY3Rpb24gdG8gdGFrZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0dGFrZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi90YWtlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICd0YWtlJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHB1dCBhIHN0dWRlbnQgYmFjayBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0XG5cdFx0XHRwdXRTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcHV0J1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdwdXQnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIGZ1bmN0aW9uIHRvIG1hcmsgYSBzdHVkZW50IGRvbmUgb24gdGhlIGxpc3Rcblx0XHRcdGRvbmVTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZG9uZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnbWFyayBkb25lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIGRlbGV0ZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0ZGVsU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RlbGV0ZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnZGVsZXRlJyk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0pXG5cblxuXHQvL0VuYWJsZSBQdXNoZXIgbG9nZ2luZ1xuXHRpZih3aW5kb3cuZW52ID09IFwibG9jYWxcIiB8fCB3aW5kb3cuZW52ID09IFwic3RhZ2luZ1wiKXtcblx0XHRjb25zb2xlLmxvZyhcIlB1c2hlciBsb2dnaW5nIGVuYWJsZWQhXCIpO1xuXHRcdFB1c2hlci5sb2dUb0NvbnNvbGUgPSB0cnVlO1xuXHR9XG5cblx0Ly9Mb2FkIHRoZSBFY2hvIGluc3RhbmNlIG9uIHRoZSB3aW5kb3dcblx0d2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG5cdFx0YnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuXHRcdGtleTogd2luZG93LnB1c2hlcktleSxcblx0XHRjbHVzdGVyOiB3aW5kb3cucHVzaGVyQ2x1c3Rlcixcblx0fSk7XG5cblx0Ly9CaW5kIHRvIHRoZSBjb25uZWN0ZWQgYWN0aW9uIG9uIFB1c2hlciAoY2FsbGVkIHdoZW4gY29ubmVjdGVkKVxuXHR3aW5kb3cuRWNoby5jb25uZWN0b3IucHVzaGVyLmNvbm5lY3Rpb24uYmluZCgnY29ubmVjdGVkJywgZnVuY3Rpb24oKXtcblx0XHQvL3doZW4gY29ubmVjdGVkLCBkaXNhYmxlIHRoZSBzcGlubmVyXG5cdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vTG9hZCB0aGUgaW5pdGlhbCBzdHVkZW50IHF1ZXVlIHZpYSBBSkFYXG5cdFx0d2luZG93LmF4aW9zLmdldCgnL2dyb3Vwc2Vzc2lvbi9xdWV1ZScpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZS5jb25jYXQocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGNoZWNrQnV0dG9ucyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignZ2V0IHF1ZXVlJywgJycsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KVxuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uIGNoYW5uZWxcblx0Lypcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cblx0XHR9KTtcbiAqL1xuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uZW5kIGNoYW5uZWxcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uZW5kJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25FbmQnLCAoZSkgPT4ge1xuXG5cdFx0XHQvL2lmIGVuZGluZywgcmVkaXJlY3QgYmFjayB0byBob21lIHBhZ2Vcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvZ3JvdXBzZXNzaW9uXCI7XG5cdH0pO1xuXG5cdHdpbmRvdy5FY2hvLmpvaW4oJ3ByZXNlbmNlJylcblx0XHQuaGVyZSgodXNlcnMpID0+IHtcblx0XHRcdHZhciBsZW4gPSB1c2Vycy5sZW5ndGg7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlcnNbaV0uaWQpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmpvaW5pbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2VyLmlkKTtcblx0XHR9KVxuXHRcdC5sZWF2aW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnNwbGljZSggJC5pbkFycmF5KHVzZXIuaWQsIHdpbmRvdy52bS5vbmxpbmUpLCAxKTtcblx0XHR9KVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblx0XHRcdHZhciBxdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZTtcblx0XHRcdHZhciBmb3VuZCA9IGZhbHNlO1xuXHRcdFx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblxuXHRcdFx0Ly91cGRhdGUgdGhlIHF1ZXVlIGJhc2VkIG9uIHJlc3BvbnNlXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRpZihxdWV1ZVtpXS5pZCA9PT0gZGF0YS5pZCl7XG5cdFx0XHRcdFx0aWYoZGF0YS5zdGF0dXMgPCAzKXtcblx0XHRcdFx0XHRcdHF1ZXVlW2ldID0gZGF0YTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHF1ZXVlLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHRcdGxlbi0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9pZiBlbGVtZW50IG5vdCBmb3VuZCBvbiBjdXJyZW50IHF1ZXVlLCBwdXNoIGl0IG9uIHRvIHRoZSBxdWV1ZVxuXHRcdFx0aWYoIWZvdW5kKXtcblx0XHRcdFx0cXVldWUucHVzaChkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9jaGVjayB0byBzZWUgaWYgY3VycmVudCB1c2VyIGlzIG9uIHF1ZXVlIGJlZm9yZSBlbmFibGluZyBidXR0b25cblx0XHRcdGNoZWNrQnV0dG9ucyhxdWV1ZSk7XG5cblx0XHRcdC8vaWYgY3VycmVudCB1c2VyIGlzIGZvdW5kLCBjaGVjayBmb3Igc3RhdHVzIHVwZGF0ZSB0byBwbGF5IHNvdW5kXG5cdFx0XHRpZihkYXRhLnVzZXJpZCA9PT0gdXNlcklEKXtcblx0XHRcdFx0Y2hlY2tEaW5nKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NvcnQgdGhlIHF1ZXVlIGNvcnJlY3RseVxuXHRcdFx0cXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXG5cdFx0XHQvL3VwZGF0ZSBWdWUgc3RhdGUsIG1pZ2h0IGJlIHVubmVjZXNzYXJ5XG5cdFx0XHR3aW5kb3cudm0ucXVldWUgPSBxdWV1ZTtcblx0XHR9KTtcblxufTtcblxuXG4vKipcbiAqIFZ1ZSBmaWx0ZXIgZm9yIHN0YXR1cyB0ZXh0XG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgc3R1ZGVudCB0byByZW5kZXJcbiAqL1xuVnVlLmZpbHRlcignc3RhdHVzdGV4dCcsIGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMCkgcmV0dXJuIFwiTkVXXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAxKSByZXR1cm4gXCJRVUVVRURcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDIpIHJldHVybiBcIk1FRVQgV0lUSCBcIiArIGRhdGEuYWR2aXNvcjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDMpIHJldHVybiBcIkRFTEFZXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA0KSByZXR1cm4gXCJBQlNFTlRcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDUpIHJldHVybiBcIkRPTkVcIjtcbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3Vwc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB3aW5kb3cudXNlcklEICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJyArIHRva2VuICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSkgLy9pdCBoYXMgdG8gYmUgYWRkZWQgc29tZXdoZXJlIGludG8gdGhlIDxib2R5PlxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5hYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGVuYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkaXNhYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGRpc2FibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgYW5kIHNlZSBpZiB1c2VyIGlzIG9uIHRoZSBsaXN0IC0gaWYgbm90LCBkb24ndCBlbmFibGUgYnV0dG9uXG4gKi9cbnZhciBjaGVja0J1dHRvbnMgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdHZhciBmb3VuZE1lID0gZmFsc2U7XG5cblx0Ly9pdGVyYXRlIHRocm91Z2ggdXNlcnMgb24gbGlzdCwgbG9va2luZyBmb3IgY3VycmVudCB1c2VyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGZvdW5kTWUgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly9pZiBmb3VuZCwgZGlzYWJsZSBidXR0b247IGlmIG5vdCwgZW5hYmxlIGJ1dHRvblxuXHRpZihmb3VuZE1lKXtcblx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdH1lbHNle1xuXHRcdGVuYWJsZUJ1dHRvbigpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYmVja29uZWQsIGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBwZXJzb24gLSB0aGUgY3VycmVudCB1c2VyIHRvIGNoZWNrXG4gKi9cbnZhciBjaGVja0RpbmcgPSBmdW5jdGlvbihwZXJzb24pe1xuXHRpZihwZXJzb24uc3RhdHVzID09IDIpe1xuXHRcdGlvbi5zb3VuZC5wbGF5KFwiZG9vcl9iZWxsXCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBlcnNvbiBoYXMgYmVlbiBiZWNrb25lZCBvbiBsb2FkOyBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcXVldWUgLSB0aGUgaW5pdGlhbCBxdWV1ZSBvZiB1c2VycyBsb2FkZWRcbiAqL1xudmFyIGluaXRpYWxDaGVja0RpbmcgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdCQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZVByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Zmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcblx0XHRcdGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuXHRcdH07XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0Ly9zZW5kIEFKQVggcG9zdFxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3IgYWR2aXNvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZUFkdmlzb3JQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHQvL1RPRE8gVEVTVE1FXG5cdFx0dmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRkYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0ZGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdCQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdFx0JCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdC8vaHR0cDovL3d3dy5hYmVhdXRpZnVsc2l0ZS5uZXQvd2hpcHBpbmctZmlsZS1pbnB1dHMtaW50by1zaGFwZS13aXRoLWJvb3RzdHJhcC0zL1xuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuXHQgIHZhciBpbnB1dCA9ICQodGhpcyksXG5cdCAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG5cdCAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuXHQgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG5cdH0pO1xuXG5cdC8vYmluZCB0byBmaWxlc2VsZWN0IGJ1dHRvblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpO1xuXHRcdFx0dmFyIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgICBpZihsb2cpe1xuXHRcdFx0XHRcdFx0YWxlcnQobG9nKTtcblx0XHRcdFx0XHR9XG4gICAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsIi8vbG9hZCByZXF1aXJlZCBsaWJyYXJpZXNcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdhZG1pbi1sdGUnKTtcbnJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0Jyk7XG5yZXF1aXJlKCdkYXRhdGFibGVzLm5ldC1icycpO1xucmVxdWlyZSgnZGV2YnJpZGdlLWF1dG9jb21wbGV0ZScpO1xuXG4vL29wdGlvbnMgZm9yIGRhdGF0YWJsZXNcbmV4cG9ydHMuZGF0YVRhYmxlT3B0aW9ucyA9IHtcbiAgXCJwYWdlTGVuZ3RoXCI6IDUwLFxuICBcImxlbmd0aENoYW5nZVwiOiBmYWxzZSxcbn1cblxuLyoqXG4gKiBJbml0aWFsaXphdGlvbiBmdW5jdGlvblxuICogbXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSBvbiBhbGwgZGF0YXRhYmxlcyBwYWdlc1xuICpcbiAqIEBwYXJhbSBvcHRpb25zIC0gY3VzdG9tIGRhdGF0YWJsZXMgb3B0aW9uc1xuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IGV4cG9ydHMuZGF0YVRhYmxlT3B0aW9ucyk7XG4gICQoJyN0YWJsZScpLkRhdGFUYWJsZShvcHRpb25zKTtcbiAgc2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuICAkKCcjYWRtaW5sdGUtdG9nZ2xlbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdzaWRlYmFyLW9wZW4nKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gc2F2ZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgdG8gc2F2ZVxuICogQHBhcmFtIHVybCAtIHRoZSB1cmwgdG8gc2VuZCBkYXRhIHRvXG4gKiBAcGFyYW0gaWQgLSB0aGUgaWQgb2YgdGhlIGl0ZW0gdG8gYmUgc2F2ZS1kZXZcbiAqIEBwYXJhbSBsb2FkcGljdHVyZSAtIHRydWUgdG8gcmVsb2FkIGEgcHJvZmlsZSBwaWN0dXJlXG4gKi9cbmV4cG9ydHMuYWpheHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGlkLCBsb2FkcGljdHVyZSl7XG4gIGxvYWRwaWN0dXJlIHx8IChsb2FkcGljdHVyZSA9IGZhbHNlKTtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXNwb25zZS5kYXRhKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgaWYobG9hZHBpY3R1cmUpIGV4cG9ydHMubG9hZHBpY3R1cmUoaWQpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnIycsIGVycm9yKVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHNhdmUgdmlhIEFKQVggb24gbW9kYWwgZm9ybVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgdG8gc2F2ZVxuICogQHBhcmFtIHVybCAtIHRoZSB1cmwgdG8gc2VuZCBkYXRhIHRvXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBtb2RhbCBlbGVtZW50IHRvIGNsb3NlXG4gKi9cbmV4cG9ydHMuYWpheG1vZGFsc2F2ZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgZWxlbWVudCl7XG4gICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgJChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuICAgICAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKCkuYWpheC5yZWxvYWQoKTtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnIycsIGVycm9yKVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBwaWN0dXJlIHZpYSBBSkFYXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIHVzZXIgSUQgb2YgdGhlIHBpY3R1cmUgdG8gcmVsb2FkXG4gKi9cbmV4cG9ydHMubG9hZHBpY3R1cmUgPSBmdW5jdGlvbihpZCl7XG4gIHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYy8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG4gICAgICAkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG4gICAgfSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYW4gaXRlbVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgY29udGFpbmluZyB0aGUgaXRlbSB0byBkZWxldGVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSByZXRVcmwgLSB0aGUgVVJMIHRvIHJldHVybiB0byBhZnRlciBkZWxldGVcbiAqIEBwYXJhbSBzb2Z0IC0gYm9vbGVhbiBpZiB0aGlzIGlzIGEgc29mdCBkZWxldGUgb3Igbm90XG4gKi9cbmV4cG9ydHMuYWpheGRlbGV0ZSA9IGZ1bmN0aW9uIChkYXRhLCB1cmwsIHJldFVybCwgc29mdCA9IGZhbHNlKXtcbiAgaWYoc29mdCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuICB9ZWxzZXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSBhbGwgcmVsYXRlZCByZWNvcmRzLiBZb3UgY2Fubm90IHVuZG8gdGhpcyBhY3Rpb24uXCIpO1xuICB9XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmV0VXJsKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdkZWxldGUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYW4gaXRlbSBmcm9tIGEgbW9kYWwgZm9ybVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgY29udGFpbmluZyB0aGUgaXRlbSB0byBkZWxldGVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIG1vZGFsIGVsZW1lbnQgdG8gY2xvc2VcbiAqL1xuZXhwb3J0cy5hamF4bW9kYWxkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCBlbGVtZW50KXtcbiAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKCkuYWpheC5yZWxvYWQoKTtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzdG9yZSBhIHNvZnQtZGVsZXRlZCBpdGVtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgaXRlbSB0byBiZSByZXN0b3JlZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGF0IGluZm9ybWF0aW9uIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG9cbiAqL1xuZXhwb3J0cy5hamF4cmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgcmV0VXJsKXtcbiAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmV0VXJsKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXN0b3JlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGUoaWQsIHVybCk7XG59XG5cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZWxvY2sgPSBmdW5jdGlvbihpZCwgdXJsKXtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlbG9jayhpZCwgdXJsKTtcbn1cblxuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlc2V0ID0gZnVuY3Rpb24oaWQsIHZhbHVlKXtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlc2V0KGlkLCB2YWx1ZSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZGFzaGJvYXJkLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZW1lZXRpbmdcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vbWVldGluZ3NcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlYmxhY2tvdXRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYmxhY2tvdXRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgLy8kKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld3N0dWRlbnRcIj5OZXcgU3R1ZGVudDwvYT4nKTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZ3JvdXBzZXNzaW9uXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2dyb3Vwc2Vzc2lvbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICAvL2xvYWQgY3VzdG9tIGJ1dHRvbiBvbiB0aGUgZG9tXG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQoKTtcblxuICAvL2JpbmQgc2V0dGluZ3MgYnV0dG9uc1xuICAkKCcuc2V0dGluZ3NidXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAga2V5OiAkKHRoaXMpLmF0dHIoJ2lkJyksXG4gICAgfTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9zYXZlc2V0dGluZyc7XG5cbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsICcvYWRtaW4vc2V0dGluZ3MnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICAvL2JpbmQgbmV3IHNldHRpbmcgYnV0dG9uXG4gICQoJyNuZXdzZXR0aW5nJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgY2hvaWNlID0gcHJvbXB0KFwiRW50ZXIgYSBuYW1lIGZvciB0aGUgbmV3IHNldHRpbmc6XCIpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAga2V5OiBjaG9pY2UsXG4gICAgfTtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vbmV3c2V0dGluZ1wiXG5cbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsICcvYWRtaW4vc2V0dGluZ3MnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdjcmVhdGUnLCAnJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXJlcXVpcmVtZW50cy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2NyZWRpdHMnfSxcbiAgICB7J2RhdGEnOiAnc2VtZXN0ZXInfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnbm90ZXMnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIG9wdGlvbnMub3JkZXIgPSBbXG4gICAgWzMsIFwiYXNjXCJdLFxuICAgIFs0LCBcImFzY1wiXSxcbiAgXTtcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPk5ldyBEZWdyZWUgUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9uYW1lID0gJCgnI2NvdXJzZV9uYW1lJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXJlcXVpcmVtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlZ3JlZXJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVncmVlcmVxdWlyZW1lbnRcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4bW9kYWxkZWxldGUoZGF0YSwgdXJsLCAnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNzZW1lc3RlcicpLnZhbChtZXNzYWdlLmRhdGEuc2VtZXN0ZXIpO1xuICAgICAgICAkKCcjb3JkZXJpbmcnKS52YWwobWVzc2FnZS5kYXRhLm9yZGVyaW5nKTtcbiAgICAgICAgJCgnI2NyZWRpdHMnKS52YWwobWVzc2FnZS5kYXRhLmNyZWRpdHMpO1xuICAgICAgICAkKCcjbm90ZXMnKS52YWwobWVzc2FnZS5kYXRhLm5vdGVzKTtcbiAgICAgICAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEudHlwZSA9PSBcImNvdXJzZVwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNlIGlmIChtZXNzYWdlLmRhdGEudHlwZSA9PSBcImVsZWN0aXZlbGlzdFwiKXtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcmVxdWlyZW1lbnQnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT1yZXF1aXJlYWJsZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNzZW1lc3RlcicpLnZhbChcIlwiKTtcbiAgJCgnI29yZGVyaW5nJykudmFsKFwiXCIpO1xuICAkKCcjY3JlZGl0cycpLnZhbChcIlwiKTtcbiAgJCgnI25vdGVzJykudmFsKFwiXCIpO1xuICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9lbGVjdGl2ZWxpc3Rjb3Vyc2VzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIG9wdGlvbnMub3JkZXIgPSBbXG4gICAgWzEsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+QWRkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBlbGVjdGl2ZWxpc3RfaWQ6ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSxcbiAgICAgIGNvdXJzZV9wcmVmaXg6ICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmFuZ2UnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGRhdGEuY291cnNlX21pbl9udW1iZXIgPSAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9tYXhfbnVtYmVyID0gJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZWxlY3RpdmVsaXN0Y291cnNlJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2VsZWN0aXZlY291cnNlLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWVsZWN0aXZlY291cnNlXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdmlldycpLnZhbCgkKCcjZWxlY3RpdmVsaXN0X2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfcHJlZml4KTtcbiAgICAgICAgJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWluX251bWJlcik7XG4gICAgICAgIGlmKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWF4X251bWJlcil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbWF4X251bWJlcik7XG4gICAgICAgICAgJCgnI3JhbmdlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAgICAgICAgICQoJyNyYW5nZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGVsZWN0aXZlIGxpc3QgY291cnNlJywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICAkKCdpbnB1dFtuYW1lPXJhbmdlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmFuZ2UnXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoXCJcIik7XG4gICQoJyNyYW5nZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL3BsYW5yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdlbGVjdGl2ZWxpc3RfYWJicid9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2NhdGFsb2dfY291cnNlJ30sXG4gICAgeydkYXRhJzogJ2NvbXBsZXRlZF9jb3Vyc2UnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dO1xuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFs0LCBcImFzY1wiXSxcbiAgICBbNSwgXCJhc2NcIl0sXG4gIF07XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5OZXcgUGxhbiBSZXF1aXJlbWVudDwvYT4nKTtcblxuICAvL2FkZGVkIGZvciBuZXcgc2VtZXN0ZXJzIHRhYmxlXG4gIHZhciBvcHRpb25zMiA9IHtcbiAgICBcInBhZ2VMZW5ndGhcIjogNTAsXG4gICAgXCJsZW5ndGhDaGFuZ2VcIjogZmFsc2UsXG4gIH1cbiAgb3B0aW9uczIuZG9tID0gJzxcIm5ld2J1dHRvbjJcIj5mcnRpcCc7XG4gIG9wdGlvbnMyLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVycy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9uczIuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zMi5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRzZW1cXFwiIGhyZWY9XFxcIi9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXIvXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV07XG4gIG9wdGlvbnMyLm9yZGVyID0gW1xuICAgIFsyLCBcImFzY1wiXSxcbiAgXTtcbiAgJCgnI3RhYmxlc2VtJykuRGF0YVRhYmxlKG9wdGlvbnMyKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvbjJcIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9wbGFucy9uZXdwbGFuc2VtZXN0ZXIvJyArIGlkICsgJ1wiIGlkPVwibmV3MlwiPk5ldyBTZW1lc3RlcjwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gICAgICBwbGFuX2lkOiAkKCcjcGxhbl9pZCcpLnZhbCgpLFxuICAgICAgb3JkZXJpbmc6ICQoJyNvcmRlcmluZycpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgICBjb3Vyc2VfaWRfbG9jazogJCgnI2NvdXJzZV9pZGxvY2snKS52YWwoKSxcbiAgICAgIGNvbXBsZXRlZGNvdXJzZV9pZF9sb2NrOiAkKCcjY29tcGxldGVkY291cnNlX2lkbG9jaycpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI3NlbWVzdGVyX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuc2VtZXN0ZXJfaWQgPSAkKCcjc2VtZXN0ZXJfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmVsZWN0aXZlbGlzdF9pZCA9ICcnO1xuICAgIH1cbiAgICBpZigkKCcjY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuY291cnNlX2lkID0gJCgnI2NvdXJzZV9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5jb3Vyc2VfaWQgPSAnJztcbiAgICB9XG4gICAgaWYoJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCA9ICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKTtcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGEuY29tcGxldGVkY291cnNlX2lkID0gJyc7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW5yZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlcGxhbnJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNwbGFucmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgIHZhciBwbGFuaWQgPSAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgIHdpbmRvdy5heGlvcy5nZXQoJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXJzLycgKyBwbGFuaWQpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgdmFyIGxpc3RpdGVtcyA9ICcnO1xuICAgICAgICAkLmVhY2gobWVzc2FnZS5kYXRhLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICBsaXN0aXRlbXMgKz0gJzxvcHRpb24gdmFsdWU9JyArIHZhbHVlLmlkICsgJz4nICsgdmFsdWUubmFtZSArJzwvb3B0aW9uPic7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKS5lbmQoKS5hcHBlbmQobGlzdGl0ZW1zKTtcbiAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykudmFsKHNlbWVzdGVyX2lkKTtcbiAgICAgICAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKCcjaWQnKS52YWwobWVzc2FnZS5kYXRhLmlkKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZGVncmVlcmVxdWlyZW1lbnRfaWQpO1xuICAgICAgICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX25hbWUpO1xuICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSwgMzApKTtcbiAgICAgICAgJCgnI2NvdXJzZV9pZCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX2lkKTtcbiAgICAgICAgJCgnI2NvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5jb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuY2F0YWxvZ19jb3Vyc2UsIDMwKSk7XG4gICAgICAgIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlc2V0KCdjb3Vyc2VfaWQnLCBtZXNzYWdlLmRhdGEuY291cnNlX2lkX2xvY2spO1xuICAgICAgICAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQpO1xuICAgICAgICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRfY291cnNlLCAzMCkpO1xuICAgICAgICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZXNldCgnY29tcGxldGVkY291cnNlX2lkJywgbWVzc2FnZS5kYXRhLmNvbXBsZXRlZGNvdXJzZV9pZF9sb2NrKTtcbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcblxuICAgICAgICB2YXIgc2VtZXN0ZXJfaWQgPSBtZXNzYWdlLmRhdGEuc2VtZXN0ZXJfaWQ7XG5cbiAgICAgICAgLy9sb2FkIHNlbWVzdGVyc1xuICAgICAgICB2YXIgcGxhbmlkID0gJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICAgICAgd2luZG93LmF4aW9zLmdldCgnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIHBsYW5pZClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgICAgIHZhciBsaXN0aXRlbXMgPSAnJztcbiAgICAgICAgICAgICQuZWFjaChtZXNzYWdlLmRhdGEsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAgICBsaXN0aXRlbXMgKz0gJzxvcHRpb24gdmFsdWU9JyArIHZhbHVlLmlkICsgJz4nICsgdmFsdWUubmFtZSArJzwvb3B0aW9uPic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpLmVuZCgpLmFwcGVuZChsaXN0aXRlbXMpO1xuICAgICAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykudmFsKHNlbWVzdGVyX2lkKTtcbiAgICAgICAgICAgICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBzZW1lc3RlcnMnLCAnJywgZXJyb3IpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnL2VsZWN0aXZlbGlzdHMvZWxlY3RpdmVsaXN0ZmVlZCcpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlbG9jaygnY291cnNlX2lkJywgJy9jb3Vyc2VzL2NvdXJzZWZlZWQnKTtcblxuICB2YXIgc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlbG9jaygnY29tcGxldGVkY291cnNlX2lkJywgJy9jb21wbGV0ZWRjb3Vyc2VzL2NvbXBsZXRlZGNvdXJzZWZlZWQvJyArIHN0dWRlbnRfaWQpO1xufTtcblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI3NlbWVzdGVyJykudmFsKFwiXCIpO1xuICAkKCcjb3JkZXJpbmcnKS52YWwoXCJcIik7XG4gICQoJyNjcmVkaXRzJykudmFsKFwiXCIpO1xuICAkKCcjbm90ZXMnKS52YWwoXCJcIik7XG4gICQoJyNkZWdyZWVyZXF1aXJlbWVudF9pZCcpLnZhbChcIlwiKTtcbiAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNjb3Vyc2VfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2NvdXJzZV9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlc2V0KCdjb3Vyc2VfaWQnLCAwKTtcbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsIDApO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbC5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG53aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgZHJhZ2dhYmxlID0gcmVxdWlyZSgndnVlZHJhZ2dhYmxlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgd2luZG93LnZtID0gbmV3IFZ1ZSh7XG5cdFx0ZWw6ICcjZmxvd2NoYXJ0Jyxcblx0XHRkYXRhOiB7XG4gICAgICBzZW1lc3RlcnM6IFtdLFxuXHRcdH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgZWRpdFNlbWVzdGVyOiBlZGl0U2VtZXN0ZXIsXG4gICAgICBzYXZlU2VtZXN0ZXI6IHNhdmVTZW1lc3RlcixcbiAgICAgIGRlbGV0ZVNlbWVzdGVyOiBkZWxldGVTZW1lc3RlcixcbiAgICAgIGRyb3BTZW1lc3RlcjogZHJvcFNlbWVzdGVyLFxuICAgICAgZHJvcENvdXJzZTogZHJvcENvdXJzZSxcbiAgICAgIGVkaXRDb3Vyc2U6IGVkaXRDb3Vyc2UsXG4gICAgfSxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICBkcmFnZ2FibGUsXG4gICAgfSxcbiAgfSk7XG5cbiAgbG9hZERhdGEoKTtcblxuICAkKCcjcmVzZXQnKS5vbignY2xpY2snLCBsb2FkRGF0YSk7XG4gICQoJyNhZGQtc2VtJykub24oJ2NsaWNrJywgYWRkU2VtZXN0ZXIpO1xuICAkKCcjYWRkLWNvdXJzZScpLm9uKCdjbGljaycsIGFkZENvdXJzZSk7XG5cbiAgJCgnI3NhdmVDb3Vyc2UnKS5vbignY2xpY2snLCBzYXZlQ291cnNlKTtcbiAgJCgnI2RlbGV0ZUNvdXJzZScpLm9uKCdjbGljaycsIGRlbGV0ZUNvdXJzZSk7XG5cbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnL2VsZWN0aXZlbGlzdHMvZWxlY3RpdmVsaXN0ZmVlZCcpO1xuXG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZWxvY2soJ2NvdXJzZV9pZCcsICcvY291cnNlcy9jb3Vyc2VmZWVkJyk7XG5cbiAgdmFyIHN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVsb2NrKCdjb21wbGV0ZWRjb3Vyc2VfaWQnLCAnL2NvbXBsZXRlZGNvdXJzZXMvY29tcGxldGVkY291cnNlZmVlZC8nICsgc3R1ZGVudF9pZCk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHNvcnQgZWxlbWVudHMgYmFzZWQgb24gdGhlaXIgb3JkZXJpbmdcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IGl0ZW1cbiAqIEBwYXJhbSBiIC0gc2Vjb25kIGl0ZW1cbiAqIEByZXR1cm4gLSBzb3J0aW5nIHZhbHVlIGluZGljYXRpbmcgd2hvIHNob3VsZCBnbyBmaXJzdFxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEub3JkZXJpbmcgPT0gYi5vcmRlcmluZyl7XG5cdFx0cmV0dXJuIChhLmlkIDwgYi5pZCA/IC0xIDogMSk7XG5cdH1cblx0cmV0dXJuIChhLm9yZGVyaW5nIDwgYi5vcmRlcmluZyA/IC0xIDogMSk7XG59XG5cbnZhciBsb2FkRGF0YSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkKVxuICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgd2luZG93LnZtLnNlbWVzdGVycyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgd2luZG93LnZtLnNlbWVzdGVycy5zb3J0KHNvcnRGdW5jdGlvbik7XG4gICAgJChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpWzBdLnN0eWxlLnNldFByb3BlcnR5KCctLWNvbE51bScsIHdpbmRvdy52bS5zZW1lc3RlcnMubGVuZ3RoKTtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KCcvZmxvd2NoYXJ0cy9kYXRhLycgKyBpZClcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkLmVhY2gocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICAgICAgdmFyIHNlbWVzdGVyID0gd2luZG93LnZtLnNlbWVzdGVycy5maW5kKGZ1bmN0aW9uKGVsZW1lbnQpe1xuICAgICAgICAgIHJldHVybiBlbGVtZW50LmlkID09IHZhbHVlLnNlbWVzdGVyX2lkO1xuICAgICAgICB9KVxuICAgICAgICBpZih2YWx1ZS5kZWdyZWVyZXF1aXJlbWVudF9pZCA8PSAwKXtcbiAgICAgICAgICB2YWx1ZS5jdXN0b20gPSB0cnVlO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB2YWx1ZS5jdXN0b20gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih2YWx1ZS5jb21wbGV0ZWRjb3Vyc2VfaWQgPD0gMCl7XG4gICAgICAgICAgdmFsdWUuY29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdmFsdWUuY29tcGxldGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlbWVzdGVyLmNvdXJzZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgICQuZWFjaCh3aW5kb3cudm0uc2VtZXN0ZXJzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgICAgICB2YWx1ZS5jb3Vyc2VzLnNvcnQoc29ydEZ1bmN0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBkYXRhJywgJycsIGVycm9yKTtcbiAgICB9KTtcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICBzaXRlLmhhbmRsZUVycm9yKCdnZXQgZGF0YScsICcnLCBlcnJvcik7XG4gIH0pO1xufVxuXG52YXIgZWRpdFNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgc2VtaWQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICQoXCIjc2VtLXBhbmVsZWRpdC1cIiArIHNlbWlkKS5zaG93KCk7XG4gICQoXCIjc2VtLXBhbmVsaGVhZC1cIiArIHNlbWlkKS5oaWRlKCk7XG59XG5cbnZhciBzYXZlU2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgc2VtaWQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gIHZhciBkYXRhID0ge1xuICAgIGlkOiBzZW1pZCxcbiAgICBuYW1lOiAkKFwiI3NlbS10ZXh0LVwiICsgc2VtaWQpLnZhbCgpXG4gIH1cbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL3NhdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoXCIjc2VtLXBhbmVsZWRpdC1cIiArIHNlbWlkKS5oaWRlKCk7XG4gICAgICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZGVsZXRlU2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgICBpZihjaG9pY2UgPT09IHRydWUpe1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIHZhciBzZW1pZCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiBzZW1pZCxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9kZWxldGUnLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgaWYod2luZG93LnZtLnNlbWVzdGVyc1tpXS5pZCA9PSBzZW1pZCl7XG4gICAgICAgICAgICB3aW5kb3cudm0uc2VtZXN0ZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgICAgfSk7XG4gIH1cbn1cblxudmFyIGFkZFNlbWVzdGVyID0gZnVuY3Rpb24oKXtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHZhciBkYXRhID0ge1xuICB9O1xuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZCArICcvYWRkJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICB3aW5kb3cudm0uc2VtZXN0ZXJzLnB1c2gocmVzcG9uc2UuZGF0YSk7XG4gICAgICAvL1Z1ZS5zZXQod2luZG93LnZtLnNlbWVzdGVyc1t3aW5kb3cudm0uc2VtZXN0ZXIubGVuZ3RoIC0gMV0sICdjb3Vyc2VzJywgbmV3IEFycmF5KCkpO1xuICAgICAgJChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpWzBdLnN0eWxlLnNldFByb3BlcnR5KCctLWNvbE51bScsIHdpbmRvdy52bS5zZW1lc3RlcnMubGVuZ3RoKTtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkl0ZW0gU2F2ZWRcIiwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgIH0pXG59XG5cbnZhciBkcm9wU2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBvcmRlcmluZyA9IFtdO1xuICAkLmVhY2god2luZG93LnZtLnNlbWVzdGVycywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICBvcmRlcmluZy5wdXNoKHtcbiAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBkYXRhID0ge1xuICAgIG9yZGVyaW5nOiBvcmRlcmluZyxcbiAgfVxuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL21vdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRyb3BDb3Vyc2UgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBvcmRlcmluZyA9IFtdO1xuICB2YXIgdG9TZW1JbmRleCA9ICQoZXZlbnQudG8pLmRhdGEoJ2lkJyk7XG4gICQuZWFjaCh3aW5kb3cudm0uc2VtZXN0ZXJzW3RvU2VtSW5kZXhdLmNvdXJzZXMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgb3JkZXJpbmcucHVzaCh7XG4gICAgICBpZDogdmFsdWUuaWQsXG4gICAgfSk7XG4gIH0pO1xuICB2YXIgZGF0YSA9IHtcbiAgICBzZW1lc3Rlcl9pZDogd2luZG93LnZtLnNlbWVzdGVyc1t0b1NlbUluZGV4XS5pZCxcbiAgICBjb3Vyc2VfaWQ6ICQoZXZlbnQuaXRlbSkuZGF0YSgnaWQnKSxcbiAgICBvcmRlcmluZzogb3JkZXJpbmcsXG4gIH1cbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9kYXRhLycgKyBpZCArICcvbW92ZScsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZWRpdENvdXJzZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIGNvdXJzZUluZGV4ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdpZCcpO1xuICB2YXIgc2VtSW5kZXggPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3NlbScpO1xuICB2YXIgY291cnNlID0gd2luZG93LnZtLnNlbWVzdGVyc1tzZW1JbmRleF0uY291cnNlc1tjb3Vyc2VJbmRleF07XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChjb3Vyc2UubmFtZSk7XG4gICQoJyNjcmVkaXRzJykudmFsKGNvdXJzZS5jcmVkaXRzKTtcbiAgJCgnI25vdGVzJykudmFsKGNvdXJzZS5ub3Rlcyk7XG4gICQoJyNwbGFucmVxdWlyZW1lbnRfaWQnKS52YWwoY291cnNlLmlkKTtcbiAgJCgnI2VsZWN0bGl2ZWxpc3RfaWQnKS52YWwoY291cnNlLmVsZWN0aXZlbGlzdF9pZCk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIGNvdXJzZS5lbGVjdGl2ZWxpc3RfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChjb3Vyc2UuZWxlY3RpdmVsaXN0X25hbWUsIDMwKSk7XG4gICQoJyNjb3Vyc2VfaWQnKS52YWwoY291cnNlLmNvdXJzZV9pZCk7XG4gICQoJyNjb3Vyc2VfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2NvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIGNvdXJzZS5jb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChjb3Vyc2UuY291cnNlX25hbWUsIDMwKSk7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZXNldCgnY291cnNlX2lkJywgY291cnNlLmNvdXJzZV9pZF9sb2NrKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbChjb3Vyc2UuY29tcGxldGVkY291cnNlX2lkKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgY291cnNlLmNvbXBsZXRlZGNvdXJzZV9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KGNvdXJzZS5jb21wbGV0ZWRjb3Vyc2VfbmFtZSwgMzApKTtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlc2V0KCdjb21wbGV0ZWRjb3Vyc2VfaWQnLCBjb3Vyc2UuY29tcGxldGVkY291cnNlX2lkX2xvY2spO1xuICBpZihjb3Vyc2UuZGVncmVlcmVxdWlyZW1lbnRfaWQgPD0gMCl7XG4gICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgJCgnI2NyZWRpdHMnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICQoJyNkZWxldGVDb3Vyc2UnKS5zaG93KCk7XG4gIH1lbHNle1xuICAgIGlmKGNvdXJzZS5lbGVjdGl2ZWxpc3RfaWQgPD0gMCl7XG4gICAgICAkKCcjY291cnNlX25hbWUnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgIH1lbHNle1xuICAgICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgfVxuICAgICQoJyNjcmVkaXRzJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgJCgnI2RlbGV0ZUNvdXJzZScpLmhpZGUoKTtcbiAgfVxuXG4gICQoJyNlZGl0Q291cnNlJykubW9kYWwoJ3Nob3cnKTtcbn1cblxudmFyIHNhdmVDb3Vyc2UgPSBmdW5jdGlvbigpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHZhciBwbGFucmVxdWlyZW1lbnRfaWQgPSAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCk7XG4gIHZhciBkYXRhID0ge1xuICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICBjb3Vyc2VfaWRfbG9jazogJCgnI2NvdXJzZV9pZGxvY2snKS52YWwoKSxcbiAgICBjb21wbGV0ZWRjb3Vyc2VfaWRfbG9jazogJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGxvY2snKS52YWwoKSxcbiAgfVxuICBpZigkKCcjY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICBkYXRhLmNvdXJzZV9pZCA9ICQoJyNjb3Vyc2VfaWQnKS52YWwoKTtcbiAgfWVsc2V7XG4gICAgZGF0YS5jb3Vyc2VfaWQgPSAnJztcbiAgfVxuICBpZigkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICBkYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCA9ICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKTtcbiAgfWVsc2V7XG4gICAgZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgPSAnJztcbiAgfVxuICBpZigkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCkubGVuZ3RoID4gMCl7XG4gICAgZGF0YS5wbGFucmVxdWlyZW1lbnRfaWQgPSAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCk7XG4gIH1cbiAgaWYoISQoJyNjb3Vyc2VfbmFtZScpLmlzKCc6ZGlzYWJsZWQnKSl7XG4gICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICB9XG4gIGlmKCEkKCcjY3JlZGl0cycpLmlzKCc6ZGlzYWJsZWQnKSl7XG4gICAgZGF0YS5jcmVkaXRzID0gJCgnI2NyZWRpdHMnKS52YWwoKTtcbiAgfVxuICBpZighJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmVsZWN0aXZlbGlzdF9pZCA9ICcnO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL3NhdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNlZGl0Q291cnNlJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgbG9hZERhdGEoKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoXCJzYXZlIGNvdXJzZVwiLCBcIiNlZGl0Q291cnNlXCIsIGVycm9yKTtcbiAgICB9KTtcblxufVxuXG52YXIgZGVsZXRlQ291cnNlID0gZnVuY3Rpb24oZXZlbnQpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHZhciBwbGFucmVxdWlyZW1lbnRfaWQgPSAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCk7XG4gIHZhciBkYXRhID0ge1xuICAgIHBsYW5yZXF1aXJlbWVudF9pZDogcGxhbnJlcXVpcmVtZW50X2lkLFxuICB9XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9kYXRhLycgKyBpZCArICcvZGVsZXRlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgIGxvYWREYXRhKCk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKFwiZGVsZXRlIGNvdXJzZVwiLCBcIiNlZGl0Q291cnNlXCIsIGVycm9yKTtcbiAgICB9KTtcblxufVxuXG52YXIgYWRkQ291cnNlID0gZnVuY3Rpb24oKXtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKCcnKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoJycpO1xuICAkKCcjbm90ZXMnKS52YWwoJycpO1xuICAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCcnKTtcbiAgJCgnI2VsZWN0bGl2ZWxpc3RfaWQnKS52YWwoMCk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIDAgKyBcIikgXCIpO1xuICAkKCcjY291cnNlX2lkJykudmFsKDApO1xuICAkKCcjY291cnNlX2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyAwICsgXCIpIFwiKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgwKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgMCArIFwiKSBcIik7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAkKCcjY3JlZGl0cycpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAkKCcjZGVsZXRlQ291cnNlJykuaGlkZSgpO1xuICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdzaG93Jyk7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZXNldCgnY291cnNlX2lkJywgMCk7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZXNldCgnY29tcGxldGVkY291cnNlX2lkJywgMCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0bGlzdC5qcyIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDIwOVxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2Zsb3djaGFydC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAyMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmxhc2hlZCBzZXNzaW9uIGRhdGFcbiAqXG4gKiB1c2UgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCdtZXNzYWdlJywgdHJhbnMoJ21lc3NhZ2VzLml0ZW1fc2F2ZWQnKSk7XG4gKiAgICAgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCd0eXBlJywgJ3N1Y2Nlc3MnKTtcbiAqIHRvIHNldCBtZXNzYWdlIHRleHQgYW5kIHR5cGVcbiAqL1xuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpe1xuXHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiamF2YXNjcmlwdE1lc3NhZ2VcIiBjbGFzcz1cImFsZXJ0IGZhZGUgaW4gYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtJyArIHR5cGUgKyAnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48L2J1dHRvbj48c3BhbiBjbGFzcz1cImg0XCI+JyArIG1lc3NhZ2UgKyAnPC9zcGFuPjwvZGl2Pic7XG5cdCQoJyNtZXNzYWdlJykuYXBwZW5kKGh0bWwpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoXCIjamF2YXNjcmlwdE1lc3NhZ2VcIikuYWxlcnQoJ2Nsb3NlJyk7XG5cdH0sIDMwMDApO1xufTtcblxuLypcbmV4cG9ydHMuYWpheGNyc2YgPSBmdW5jdGlvbigpe1xuXHQkLmFqYXhTZXR1cCh7XG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jylcblx0XHR9XG5cdH0pO1xufTtcbiovXG5cbi8qKlxuICogQ2xlYXJzIGVycm9ycyBvbiBmb3JtcyBieSByZW1vdmluZyBlcnJvciBjbGFzc2VzXG4gKi9cbmV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzID0gZnVuY3Rpb24oKXtcblx0JCgnLmZvcm0tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uICgpe1xuXHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcblx0fSk7XG59XG5cbi8qKlxuICogU2V0cyBlcnJvcnMgb24gZm9ybXMgYmFzZWQgb24gcmVzcG9uc2UgSlNPTlxuICovXG5leHBvcnRzLnNldEZvcm1FcnJvcnMgPSBmdW5jdGlvbihqc29uKXtcblx0ZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMoKTtcblx0JC5lYWNoKGpzb24sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0JCgnIycgKyBrZXkpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQoJyMnICsga2V5ICsgJ2hlbHAnKS50ZXh0KHZhbHVlLmpvaW4oJyAnKSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBmb3IgbWVzc2FnZXMgaW4gdGhlIGZsYXNoIGRhdGEuIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgYnkgdGhlIHBhZ2VcbiAqL1xuZXhwb3J0cy5jaGVja01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKCcjbWVzc2FnZV9mbGFzaCcpLmxlbmd0aCl7XG5cdFx0dmFyIG1lc3NhZ2UgPSAkKCcjbWVzc2FnZV9mbGFzaCcpLnZhbCgpO1xuXHRcdHZhciB0eXBlID0gJCgnI21lc3NhZ2VfdHlwZV9mbGFzaCcpLnZhbCgpO1xuXHRcdGV4cG9ydHMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3JzIGZyb20gQUpBWFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSB0byB0aGUgdXNlclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBlcnJvciAtIHRoZSBBeGlvcyBlcnJvciByZWNlaXZlZFxuICovXG5leHBvcnRzLmhhbmRsZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgZWxlbWVudCwgZXJyb3Ipe1xuXHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRleHBvcnRzLnNldEZvcm1FcnJvcnMoZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byBcIiArIG1lc3NhZ2UgKyBcIjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvL2hpZGUgc3Bpbm5pbmcgaWNvblxuXHRpZihlbGVtZW50Lmxlbmd0aCA+IDApe1xuXHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdHJ1bmNhdGUgdGV4dFxuICpcbiAqIEBwYXJhbSB0ZXh0IC0gdGhlIHRleHQgdG8gdHJ1bmNhdGVcbiAqIEBwYXJhbSBsZW5ndGggLSB0aGUgbWF4aW11bSBsZW5ndGhcbiAqXG4gKiBodHRwOi8vanNmaWRkbGUubmV0L3NjaGFkZWNrL0dwQ1pML1xuICovXG5leHBvcnRzLnRydW5jYXRlVGV4dCA9IGZ1bmN0aW9uKHRleHQsIGxlbmd0aCl7XG5cdGlmKHRleHQubGVuZ3RoID4gbGVuZ3RoKXtcblx0XHRyZXR1cm4gJC50cmltKHRleHQpLnN1YnN0cmluZygwLCBsZW5ndGgpLnNwbGl0KFwiIFwiKS5zbGljZSgwLCAtMSkuam9pbihcIiBcIikgKyBcIi4uLlwiO1xuXHR9ZWxzZXtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG4gICAgICBhdXRvU2VsZWN0Rmlyc3Q6IHRydWUsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIGV4cG9ydHMudHJ1bmNhdGVUZXh0KHN1Z2dlc3Rpb24udmFsdWUsIDMwKSk7XG5cdFx0XHRcdFx0JCgnIycgKyBpZCArICdhdXRvJykudmFsKFwiXCIpO1xuXHQgICAgfSxcblx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH07XG5cdCAgICB9XG5cdH0pO1xuXG4gICQoJyMnICsgaWQgKyAnY2xlYXInKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyMnICsgaWQpLnZhbCgwKTtcbiAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIDAgKyBcIikgXCIpO1xuICAgICQoJyMnICsgaWQgKyAnYXV0bycpLnZhbChcIlwiKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYXV0b2NvbXBsZXRlIGEgZmllbGQgd2l0aCBhIGxvY2tcbiAqXG4gKiBAcGFyYW0gaWQgLSB0aGUgSUQgb2YgdGhlIGZpZWxkXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byByZXF1ZXN0IGRhdGEgZnJvbVxuICovXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGVsb2NrID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG4gICAgICBhdXRvU2VsZWN0Rmlyc3Q6IHRydWUsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIGV4cG9ydHMudHJ1bmNhdGVUZXh0KHN1Z2dlc3Rpb24udmFsdWUsIDMwKSk7XG5cdFx0XHRcdFx0JCgnIycgKyBpZCArICdhdXRvJykudmFsKFwiXCIpO1xuICAgICAgICAgIGV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgMSk7XG5cdCAgICB9LFxuXHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgfTtcblx0ICAgIH1cblx0fSk7XG5cbiAgJCgnIycgKyBpZCArICdjbGVhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnIycgKyBpZCkudmFsKDApO1xuICAgICQoJyMnICsgaWQgKyAndGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgMCArIFwiKSBcIik7XG4gICAgJCgnIycgKyBpZCArICdhdXRvJykudmFsKFwiXCIpO1xuICAgIGV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgMCk7XG4gIH0pO1xuXG4gICQoJyMnICsgaWQgKyAnbG9ja0J0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFsID0gcGFyc2VJbnQoJCgnIycgKyBpZCArICdsb2NrJykudmFsKCkpO1xuICAgIGV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgKHZhbCArIDEpICUgMik7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHVwZGF0ZSBhIGxvY2tlZCBhdXRvY29tcGxldGUgYnV0dG9uXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIHRvIHNldFxuICovXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGVzZXQgPSBmdW5jdGlvbihpZCwgdmFsdWUpe1xuICBpZih2YWx1ZSA9PSAxKXtcbiAgICAkKCcjJyArIGlkICsgJ2xvY2snKS52YWwoMSk7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1sb2NrXCI+PC9pPicpO1xuICB9ZWxzZXtcbiAgICAkKCcjJyArIGlkICsgJ2xvY2snKS52YWwoMCk7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgJCgnIycgKyBpZCArICdsb2NrQnRuJykuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS11bmxvY2stYWx0XCI+PC9pPicpO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFtlZGl0XSBsaW5rc1xuICAkKCcuZWRpdGFibGUtbGluaycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vaGlkZSB0aGUgW2VkaXRdIGxpbmtzLCBlbmFibGUgZWRpdG9yLCBhbmQgc2hvdyBTYXZlIGFuZCBDYW5jZWwgYnV0dG9uc1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoe1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdG9vbGJhcjogW1xuICAgICAgICAgIC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuICAgICAgICAgIFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcbiAgICAgICAgICBbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG4gICAgICAgICAgWydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG4gICAgICAgICAgWydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG4gICAgICAgIF0sXG4gICAgICAgIHRhYnNpemU6IDIsXG4gICAgICAgIGNvZGVtaXJyb3I6IHtcbiAgICAgICAgICBtb2RlOiAndGV4dC9odG1sJyxcbiAgICAgICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ21vbm9rYWknXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgU2F2ZSBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1zYXZlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9EaXNwbGF5IHNwaW5uZXIgd2hpbGUgQUpBWCBjYWxsIGlzIHBlcmZvcm1lZFxuICAgICAgJCgnI2VkaXRhYmxlc3Bpbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuICAgICAgLy9HZXQgY29udGVudHMgb2YgZWRpdG9yXG4gICAgICB2YXIgaHRtbFN0cmluZyA9ICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2NvZGUnKTtcblxuICAgICAgLy9Qb3N0IGNvbnRlbnRzIHRvIHNlcnZlciwgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZWRpdGFibGUvc2F2ZS8nICsgaWQsIHtcbiAgICAgICAgY29udGVudHM6IGh0bWxTdHJpbmdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIC8vSWYgcmVzcG9uc2UgMjAwIHJlY2VpdmVkLCBhc3N1bWUgaXQgc2F2ZWQgYW5kIHJlbG9hZCBwYWdlXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChcIlVuYWJsZSB0byBzYXZlIGNvbnRlbnQ6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgQ2FuY2VsIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLWNhbmNlbCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vUmVzZXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IgYW5kIGRlc3Ryb3kgaXRcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ3Jlc2V0Jyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdkZXN0cm95Jyk7XG5cbiAgICAgIC8vSGlkZSBTYXZlIGFuZCBDYW5jZWwgYnV0dG9ucywgYW5kIHNob3cgW2VkaXRdIGxpbmtcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=