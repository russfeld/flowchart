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

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(158);
module.exports = __webpack_require__(203);


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
			//admin/plan/{id}
			getPlanDetail: function getPlanDetail() {
				var plandetail = __webpack_require__(202);
				plandetail.init();
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
  dashboard.init(options);

  $("div.newbutton").html('<a type="button" class="btn btn-success" href="#" id="new">New Plan Requirement</a>');

  $('#save').on('click', function () {
    var data = {
      notes: $('#notes').val(),
      plan_id: $('#plan_id').val(),
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
      $('#semester').val(message.data.semester);
      $('#ordering').val(message.data.ordering);
      $('#credits').val(message.data.credits);
      $('#notes').val(message.data.notes);
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
      $('#planrequirementform').modal('show');
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

/***/ 203:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3M/NmQxMCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiXSwibmFtZXMiOlsiZGFzaGJvYXJkIiwicmVxdWlyZSIsImV4cG9ydHMiLCJpbml0Iiwib3B0aW9ucyIsImRhdGFUYWJsZU9wdGlvbnMiLCJkb20iLCIkIiwiaHRtbCIsIm9uIiwiZGF0YSIsImZpcnN0X25hbWUiLCJ2YWwiLCJsYXN0X25hbWUiLCJlbWFpbCIsImFkdmlzb3JfaWQiLCJkZXBhcnRtZW50X2lkIiwiaWQiLCJlaWQiLCJsZW5ndGgiLCJ1cmwiLCJhamF4c2F2ZSIsInJldFVybCIsImFqYXhkZWxldGUiLCJhamF4cmVzdG9yZSIsInN1bW1lcm5vdGUiLCJmb2N1cyIsInRvb2xiYXIiLCJ0YWJzaXplIiwiY29kZW1pcnJvciIsIm1vZGUiLCJodG1sTW9kZSIsImxpbmVOdW1iZXJzIiwidGhlbWUiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwiYXBwZW5kIiwiaXMiLCJmaWxlcyIsImRvY3VtZW50IiwiaW5wdXQiLCJudW1GaWxlcyIsImdldCIsImxhYmVsIiwicmVwbGFjZSIsInRyaWdnZXIiLCJldmVudCIsInBhcmVudHMiLCJmaW5kIiwibG9nIiwiYWxlcnQiLCJuYW1lIiwib2ZmaWNlIiwicGhvbmUiLCJhYmJyZXZpYXRpb24iLCJkZXNjcmlwdGlvbiIsImVmZmVjdGl2ZV95ZWFyIiwiZWZmZWN0aXZlX3NlbWVzdGVyIiwic3RhcnRfeWVhciIsInN0YXJ0X3NlbWVzdGVyIiwiZGVncmVlcHJvZ3JhbV9pZCIsInN0dWRlbnRfaWQiLCJjaG9pY2UiLCJjb25maXJtIiwiYWpheGF1dG9jb21wbGV0ZSIsImNvdXJzZW51bWJlciIsInllYXIiLCJzZW1lc3RlciIsImJhc2lzIiwiZ3JhZGUiLCJjcmVkaXRzIiwic2VsZWN0ZWQiLCJzZWxlY3RlZFZhbCIsInRyYW5zZmVyIiwiaW5jb21pbmdfaW5zdGl0dXRpb24iLCJpbmNvbWluZ19uYW1lIiwiaW5jb21pbmdfZGVzY3JpcHRpb24iLCJpbmNvbWluZ19zZW1lc3RlciIsImluY29taW5nX2NyZWRpdHMiLCJpbmNvbWluZ19ncmFkZSIsInNob3dzZWxlY3RlZCIsInByb3AiLCJzaG93IiwiaGlkZSIsIkFwcCIsImFjdGlvbnMiLCJSb290Um91dGVDb250cm9sbGVyIiwiZ2V0SW5kZXgiLCJlZGl0YWJsZSIsInNpdGUiLCJjaGVja01lc3NhZ2UiLCJnZXRBYm91dCIsIkFkdmlzaW5nQ29udHJvbGxlciIsImNhbGVuZGFyIiwiR3JvdXBzZXNzaW9uQ29udHJvbGxlciIsImdldExpc3QiLCJncm91cHNlc3Npb24iLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiRGFzaGJvYXJkQ29udHJvbGxlciIsIlN0dWRlbnRzQ29udHJvbGxlciIsImdldFN0dWRlbnRzIiwic3R1ZGVudGVkaXQiLCJnZXROZXdzdHVkZW50IiwiQWR2aXNvcnNDb250cm9sbGVyIiwiZ2V0QWR2aXNvcnMiLCJhZHZpc29yZWRpdCIsImdldE5ld2Fkdmlzb3IiLCJEZXBhcnRtZW50c0NvbnRyb2xsZXIiLCJnZXREZXBhcnRtZW50cyIsImRlcGFydG1lbnRlZGl0IiwiZ2V0TmV3ZGVwYXJ0bWVudCIsIk1lZXRpbmdzQ29udHJvbGxlciIsImdldE1lZXRpbmdzIiwibWVldGluZ2VkaXQiLCJCbGFja291dHNDb250cm9sbGVyIiwiZ2V0QmxhY2tvdXRzIiwiYmxhY2tvdXRlZGl0IiwiR3JvdXBzZXNzaW9uc0NvbnRyb2xsZXIiLCJnZXRHcm91cHNlc3Npb25zIiwiZ3JvdXBzZXNzaW9uZWRpdCIsIlNldHRpbmdzQ29udHJvbGxlciIsImdldFNldHRpbmdzIiwic2V0dGluZ3MiLCJEZWdyZWVwcm9ncmFtc0NvbnRyb2xsZXIiLCJnZXREZWdyZWVwcm9ncmFtcyIsImRlZ3JlZXByb2dyYW1lZGl0IiwiZ2V0RGVncmVlcHJvZ3JhbURldGFpbCIsImdldE5ld2RlZ3JlZXByb2dyYW0iLCJFbGVjdGl2ZWxpc3RzQ29udHJvbGxlciIsImdldEVsZWN0aXZlbGlzdHMiLCJlbGVjdGl2ZWxpc3RlZGl0IiwiZ2V0RWxlY3RpdmVsaXN0RGV0YWlsIiwiZ2V0TmV3ZWxlY3RpdmVsaXN0IiwiUGxhbnNDb250cm9sbGVyIiwiZ2V0UGxhbnMiLCJwbGFuZWRpdCIsImdldFBsYW5EZXRhaWwiLCJwbGFuZGV0YWlsIiwiZ2V0TmV3cGxhbiIsIkNvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyIiwiZ2V0Q29tcGxldGVkY291cnNlcyIsImNvbXBsZXRlZGNvdXJzZWVkaXQiLCJnZXROZXdjb21wbGV0ZWRjb3Vyc2UiLCJjb250cm9sbGVyIiwiYWN0aW9uIiwid2luZG93IiwiXyIsImF4aW9zIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiY29tbW9uIiwidG9rZW4iLCJoZWFkIiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJtb21lbnQiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidHlwZSIsImNvbG9yIiwidGV4dENvbG9yIiwic2VsZWN0YWJsZSIsInNlbGVjdEhlbHBlciIsInNlbGVjdE92ZXJsYXAiLCJyZW5kZXJpbmciLCJ0aW1lRm9ybWF0IiwiZGF0ZVBpY2tlckRhdGEiLCJkYXlzT2ZXZWVrRGlzYWJsZWQiLCJmb3JtYXQiLCJzdGVwcGluZyIsImVuYWJsZWRIb3VycyIsIm1heEhvdXIiLCJzaWRlQnlTaWRlIiwiaWdub3JlUmVhZG9ubHkiLCJhbGxvd0lucHV0VG9nZ2xlIiwiZGF0ZVBpY2tlckRhdGVPbmx5IiwiYWR2aXNvciIsIm5vYmluZCIsInRyaW0iLCJ3aWR0aCIsInJlbW92ZUNsYXNzIiwicmVzZXRGb3JtIiwiYmluZCIsIm5ld1N0dWRlbnQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzaG93TWVldGluZ0Zvcm0iLCJyZXBlYXQiLCJibGFja291dFNlcmllcyIsIm1vZGFsIiwic2VsZWN0IiwiY2hhbmdlIiwicmVwZWF0Q2hhbmdlIiwic2F2ZUJsYWNrb3V0IiwiZGVsZXRlQmxhY2tvdXQiLCJibGFja291dE9jY3VycmVuY2UiLCJvZmYiLCJlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiZGVzYyIsInN0YXR1cyIsIm1lZXRpbmdpZCIsInN0dWRlbnRpZCIsImR1cmF0aW9uT3B0aW9ucyIsInVuZGVmaW5lZCIsImhvdXIiLCJtaW51dGUiLCJjbGVhckZvcm1FcnJvcnMiLCJlbXB0eSIsIm1pbnV0ZXMiLCJkaWZmIiwiZWxlbTEiLCJlbGVtMiIsImR1cmF0aW9uIiwiZGF0ZTIiLCJkYXRlIiwiaXNTYW1lIiwiY2xvbmUiLCJkYXRlMSIsImlzQmVmb3JlIiwibmV3RGF0ZSIsImFkZCIsImRlbGV0ZUNvbmZsaWN0IiwiZWRpdENvbmZsaWN0IiwicmVzb2x2ZUNvbmZsaWN0IiwiaW5kZXgiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJibGFja291dF9pZCIsInJlcGVhdF90eXBlIiwicmVwZWF0X2V2ZXJ5IiwicmVwZWF0X3VudGlsIiwicmVwZWF0X2RldGFpbCIsIlN0cmluZyIsImluZGV4T2YiLCJwcm9tcHQiLCJWdWUiLCJFY2hvIiwiUHVzaGVyIiwiaW9uIiwic291bmQiLCJzb3VuZHMiLCJ2b2x1bWUiLCJwYXRoIiwicHJlbG9hZCIsInVzZXJJRCIsInBhcnNlSW50IiwiZ3JvdXBSZWdpc3RlckJ0biIsImdyb3VwRGlzYWJsZUJ0biIsInZtIiwiZWwiLCJxdWV1ZSIsIm9ubGluZSIsIm1ldGhvZHMiLCJnZXRDbGFzcyIsInMiLCJ1c2VyaWQiLCJpbkFycmF5IiwidGFrZVN0dWRlbnQiLCJnaWQiLCJjdXJyZW50VGFyZ2V0IiwiZGF0YXNldCIsImFqYXhQb3N0IiwicHV0U3R1ZGVudCIsImRvbmVTdHVkZW50IiwiZGVsU3R1ZGVudCIsImVudiIsImxvZ1RvQ29uc29sZSIsImJyb2FkY2FzdGVyIiwia2V5IiwicHVzaGVyS2V5IiwiY2x1c3RlciIsInB1c2hlckNsdXN0ZXIiLCJjb25uZWN0b3IiLCJwdXNoZXIiLCJjb25uZWN0aW9uIiwiY29uY2F0IiwiY2hlY2tCdXR0b25zIiwiaW5pdGlhbENoZWNrRGluZyIsInNvcnQiLCJzb3J0RnVuY3Rpb24iLCJjaGFubmVsIiwibGlzdGVuIiwibG9jYXRpb24iLCJocmVmIiwiam9pbiIsImhlcmUiLCJ1c2VycyIsImxlbiIsImkiLCJwdXNoIiwiam9pbmluZyIsInVzZXIiLCJsZWF2aW5nIiwic3BsaWNlIiwiZm91bmQiLCJjaGVja0RpbmciLCJmaWx0ZXIiLCJkaXNhYmxlQnV0dG9uIiwicmVhbGx5IiwiYXR0ciIsImJvZHkiLCJzdWJtaXQiLCJlbmFibGVCdXR0b24iLCJyZW1vdmVBdHRyIiwiZm91bmRNZSIsInBlcnNvbiIsInBsYXkiLCJhIiwiYiIsIm1lc3NhZ2UiLCJEYXRhVGFibGUiLCJ0b2dnbGVDbGFzcyIsImxvYWRwaWN0dXJlIiwiYWpheG1vZGFsc2F2ZSIsImFqYXgiLCJyZWxvYWQiLCJzb2Z0IiwiYWpheG1vZGFsZGVsZXRlIiwibWluQ2hhcnMiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwibm90ZXMiLCJvcmRlcmluZyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsInBsYW5faWQiLCJzZXRUaW1lb3V0Iiwic2V0Rm9ybUVycm9ycyIsImpzb24iLCJjbGljayIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBLGlFQUFpRTtBQUNqRSxxQkFBcUI7QUFDckI7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLFdBQVc7QUFDdEIsZUFBZSxpQ0FBaUM7QUFDaEQsaUJBQWlCLGlCQUFpQjtBQUNsQyxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsNkJBQTZCO0FBQzNDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsY0FBYztBQUM1QixXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXO0FBQ1gsR0FBRztBQUNILGdCQUFnQixZQUFZO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QixxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0QsU0FBUztBQUNULHVEQUF1RDtBQUN2RDtBQUNBLE9BQU87QUFDUCwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFD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LCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcbiAgICAgIGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2Fkdmlzb3JfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5hZHZpc29yX2lkID0gJCgnI2Fkdmlzb3JfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgZGF0YS5laWQgPSAkKCcjZWlkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3c3R1ZGVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9zdHVkZW50cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3YWR2aXNvclwiPk5ldyBBZHZpc29yPC9hPicpO1xuXG4gICQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKFwiaGlkZGVuXCIsICQoJyNoaWRkZW4nKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImRlcGFydG1lbnRfaWRcIiwgJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImVpZFwiLCAkKCcjZWlkJykudmFsKCkpO1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3YWR2aXNvcic7XG4gICAgfWVsc2V7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2Fkdmlzb3JzLycgKyBpZDtcbiAgICB9XG5cdFx0ZGFzaGJvYXJkLmFqYXhzYXZlKGZvcm1EYXRhLCB1cmwsIGlkLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0ID0gJCh0aGlzKSxcbiAgICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcbiAgICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG4gICAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcbiAgfSk7XG5cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKSxcbiAgICAgICAgICBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKCBpbnB1dC5sZW5ndGggKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKCBsb2cgKSBhbGVydChsb2cpO1xuICAgICAgfVxuXG4gIH0pO1xuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVwYXJ0bWVudFwiPk5ldyBEZXBhcnRtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgICBvZmZpY2U6ICQoJyNvZmZpY2UnKS52YWwoKSxcbiAgICAgIHBob25lOiAkKCcjcGhvbmUnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlcGFydG1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVwYXJ0bWVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXCI+TmV3IERlZ3JlZSBQcm9ncmFtPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV95ZWFyOiAkKCcjZWZmZWN0aXZlX3llYXInKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV9zZW1lc3RlcjogJCgnI2VmZmVjdGl2ZV9zZW1lc3RlcicpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVwcm9ncmFtcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2VsZWN0aXZlbGlzdFwiPk5ldyBFbGVjdGl2ZSBMaXN0PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWxpc3RzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdwbGFuXCI+TmV3IFBsYW48L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIHN0YXJ0X3llYXI6ICQoJyNzdGFydF95ZWFyJykudmFsKCksXG4gICAgICBzdGFydF9zZW1lc3RlcjogJCgnI3N0YXJ0X3NlbWVzdGVyJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW4nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVwb3B1bGF0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlcXVpcmVtZW50cyBhbmQgcmVwb3B1bGF0ZSB0aGVtIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBkZWdyZWUgcHJvZ3JhbS4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICAgdmFyIHVybCA9IFwiL2FkbWluL3BvcHVsYXRlcGxhblwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXCI+TmV3IENvbXBsZXRlZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgY291cnNlbnVtYmVyOiAkKCcjY291cnNlbnVtYmVyJykudmFsKCksXG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgeWVhcjogJCgnI3llYXInKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIGJhc2lzOiAkKCcjYmFzaXMnKS52YWwoKSxcbiAgICAgIGdyYWRlOiAkKCcjZ3JhZGUnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNzdHVkZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSd0cmFuc2ZlciddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEudHJhbnNmZXIgPSBmYWxzZTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgZGF0YS50cmFuc2ZlciA9IHRydWU7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19pbnN0aXR1dGlvbiA9ICQoJyNpbmNvbWluZ19pbnN0aXR1dGlvbicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfbmFtZSA9ICQoJyNpbmNvbWluZ19uYW1lJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19kZXNjcmlwdGlvbiA9ICQoJyNpbmNvbWluZ19kZXNjcmlwdGlvbicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfc2VtZXN0ZXIgPSAkKCcjaW5jb21pbmdfc2VtZXN0ZXInKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2NyZWRpdHMgPSAkKCcjaW5jb21pbmdfY3JlZGl0cycpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfZ3JhZGUgPSAkKCcjaW5jb21pbmdfZ3JhZGUnKS52YWwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2UnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vY29tcGxldGVkY291cnNlcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWNvbXBsZXRlZGNvdXJzZVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9dHJhbnNmZXJdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ3N0dWRlbnRfaWQnLCAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnKTtcblxuICBpZigkKCcjdHJhbnNmZXJjb3Vyc2UnKS5pcygnOmhpZGRlbicpKXtcbiAgICAkKCcjdHJhbnNmZXIxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICB9ZWxzZXtcbiAgICAkKCcjdHJhbnNmZXIyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICB9XG5cbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3RyYW5zZmVyJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNrc3RhdGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyN0cmFuc2ZlcmNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcja3N0YXRlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjdHJhbnNmZXJjb3Vyc2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCIvL2h0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy81LjQvbWl4I3dvcmtpbmctd2l0aC1zY3JpcHRzXG4vL2h0dHBzOi8vYW5keS1jYXJ0ZXIuY29tL2Jsb2cvc2NvcGluZy1qYXZhc2NyaXB0LWZ1bmN0aW9uYWxpdHktdG8tc3BlY2lmaWMtcGFnZXMtd2l0aC1sYXJhdmVsLWFuZC1jYWtlcGhwXG5cbi8vTG9hZCBzaXRlLXdpZGUgbGlicmFyaWVzIGluIGJvb3RzdHJhcCBmaWxlXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcCcpO1xuXG52YXIgQXBwID0ge1xuXG5cdC8vIENvbnRyb2xsZXItYWN0aW9uIG1ldGhvZHNcblx0YWN0aW9uczoge1xuXHRcdC8vSW5kZXggZm9yIGRpcmVjdGx5IGNyZWF0ZWQgdmlld3Mgd2l0aCBubyBleHBsaWNpdCBjb250cm9sbGVyXG5cdFx0Um9vdFJvdXRlQ29udHJvbGxlcjoge1xuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWJvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuICAgIH0sXG5cblx0XHQvL0FkdmlzaW5nIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWR2aXNpbmdcblx0XHRBZHZpc2luZ0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWR2aXNpbmcvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNhbGVuZGFyID0gcmVxdWlyZSgnLi9wYWdlcy9jYWxlbmRhcicpO1xuXHRcdFx0XHRjYWxlbmRhci5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vR3JvdXBzZXNzaW9uIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvZ3JvdXBzZXNzaW9uXG4gICAgR3JvdXBzZXNzaW9uQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9ncm91cHNlc3Npb24vaW5kZXhcbiAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuICAgICAgfSxcblx0XHRcdC8vZ3JvdXBzZXNpb24vbGlzdFxuXHRcdFx0Z2V0TGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBncm91cHNlc3Npb24gPSByZXF1aXJlKCcuL3BhZ2VzL2dyb3Vwc2Vzc2lvbicpO1xuXHRcdFx0XHRncm91cHNlc3Npb24uaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Ly9Qcm9maWxlcyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL3Byb2ZpbGVcblx0XHRQcm9maWxlc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vcHJvZmlsZS9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcHJvZmlsZSA9IHJlcXVpcmUoJy4vcGFnZXMvcHJvZmlsZScpO1xuXHRcdFx0XHRwcm9maWxlLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9EYXNoYm9hcmQgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZG1pbi1sdGVcblx0XHREYXNoYm9hcmRDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuL3V0aWwvZGFzaGJvYXJkJyk7XG5cdFx0XHRcdGRhc2hib2FyZC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTdHVkZW50c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc3R1ZGVudHNcblx0XHRcdGdldFN0dWRlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3c3R1ZGVudFxuXHRcdFx0Z2V0TmV3c3R1ZGVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEFkdmlzb3JzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9hZHZpc29yc1xuXHRcdFx0Z2V0QWR2aXNvcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdhZHZpc29yXG5cdFx0XHRnZXROZXdhZHZpc29yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVwYXJ0bWVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlcGFydG1lbnRzXG5cdFx0XHRnZXREZXBhcnRtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZXBhcnRtZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0Jyk7XG5cdFx0XHRcdGRlcGFydG1lbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlcGFydG1lbnRcblx0XHRcdGdldE5ld2RlcGFydG1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRNZWV0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vbWVldGluZ3Ncblx0XHRcdGdldE1lZXRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1lZXRpbmdlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQnKTtcblx0XHRcdFx0bWVldGluZ2VkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0QmxhY2tvdXRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ibGFja291dHNcblx0XHRcdGdldEJsYWNrb3V0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBibGFja291dGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQnKTtcblx0XHRcdFx0YmxhY2tvdXRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2dyb3Vwc2Vzc2lvbnNcblx0XHRcdGdldEdyb3Vwc2Vzc2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQnKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTZXR0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc2V0dGluZ3Ncblx0XHRcdGdldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNldHRpbmdzID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MnKTtcblx0XHRcdFx0c2V0dGluZ3MuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVncmVlcHJvZ3JhbXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbURldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVxuXHRcdFx0Z2V0TmV3ZGVncmVlcHJvZ3JhbTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEVsZWN0aXZlbGlzdHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3RzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0Jyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3REZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2VsZWN0aXZlbGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9wbGFuc1xuXHRcdFx0Z2V0UGxhbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdCcpO1xuXHRcdFx0XHRwbGFuZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9wbGFuL3tpZH1cblx0XHRcdGdldFBsYW5EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmRldGFpbCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwnKTtcblx0XHRcdFx0cGxhbmRldGFpbC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuXG5cdFx0XHRnZXROZXdwbGFuOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Q29tcGxldGVkY291cnNlc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vY29tcGxldGVkY291cnNlc1xuXHRcdFx0Z2V0Q29tcGxldGVkY291cnNlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb21wbGV0ZWRjb3Vyc2VlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdCcpO1xuXHRcdFx0XHRjb21wbGV0ZWRjb3Vyc2VlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZVxuXHRcdFx0Z2V0TmV3Y29tcGxldGVkY291cnNlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNvbXBsZXRlZGNvdXJzZWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0Jyk7XG5cdFx0XHRcdGNvbXBsZXRlZGNvdXJzZWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdH0sXG5cblx0Ly9GdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBieSB0aGUgcGFnZSBhdCBsb2FkLiBEZWZpbmVkIGluIHJlc291cmNlcy92aWV3cy9pbmNsdWRlcy9zY3JpcHRzLmJsYWRlLnBocFxuXHQvL2FuZCBBcHAvSHR0cC9WaWV3Q29tcG9zZXJzL0phdmFzY3JpcHQgQ29tcG9zZXJcblx0Ly9TZWUgbGlua3MgYXQgdG9wIG9mIGZpbGUgZm9yIGRlc2NyaXB0aW9uIG9mIHdoYXQncyBnb2luZyBvbiBoZXJlXG5cdC8vQXNzdW1lcyAyIGlucHV0cyAtIHRoZSBjb250cm9sbGVyIGFuZCBhY3Rpb24gdGhhdCBjcmVhdGVkIHRoaXMgcGFnZVxuXHRpbml0OiBmdW5jdGlvbihjb250cm9sbGVyLCBhY3Rpb24pIHtcblx0XHRpZiAodHlwZW9mIHRoaXMuYWN0aW9uc1tjb250cm9sbGVyXSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRoaXMuYWN0aW9uc1tjb250cm9sbGVyXVthY3Rpb25dICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly9jYWxsIHRoZSBtYXRjaGluZyBmdW5jdGlvbiBpbiB0aGUgYXJyYXkgYWJvdmVcblx0XHRcdHJldHVybiBBcHAuYWN0aW9uc1tjb250cm9sbGVyXVthY3Rpb25dKCk7XG5cdFx0fVxuXHR9LFxufTtcblxuLy9CaW5kIHRvIHRoZSB3aW5kb3dcbndpbmRvdy5BcHAgPSBBcHA7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2FwcC5qcyIsIndpbmRvdy5fID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8qKlxuICogV2UnbGwgbG9hZCBqUXVlcnkgYW5kIHRoZSBCb290c3RyYXAgalF1ZXJ5IHBsdWdpbiB3aGljaCBwcm92aWRlcyBzdXBwb3J0XG4gKiBmb3IgSmF2YVNjcmlwdCBiYXNlZCBCb290c3RyYXAgZmVhdHVyZXMgc3VjaCBhcyBtb2RhbHMgYW5kIHRhYnMuIFRoaXNcbiAqIGNvZGUgbWF5IGJlIG1vZGlmaWVkIHRvIGZpdCB0aGUgc3BlY2lmaWMgbmVlZHMgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAqL1xuXG53aW5kb3cuJCA9IHdpbmRvdy5qUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcblxucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG5cbi8qKlxuICogV2UnbGwgbG9hZCB0aGUgYXhpb3MgSFRUUCBsaWJyYXJ5IHdoaWNoIGFsbG93cyB1cyB0byBlYXNpbHkgaXNzdWUgcmVxdWVzdHNcbiAqIHRvIG91ciBMYXJhdmVsIGJhY2stZW5kLiBUaGlzIGxpYnJhcnkgYXV0b21hdGljYWxseSBoYW5kbGVzIHNlbmRpbmcgdGhlXG4gKiBDU1JGIHRva2VuIGFzIGEgaGVhZGVyIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgXCJYU1JGXCIgdG9rZW4gY29va2llLlxuICovXG5cbndpbmRvdy5heGlvcyA9IHJlcXVpcmUoJ2F4aW9zJyk7XG5cbi8vaHR0cHM6Ly9naXRodWIuY29tL3JhcHBhc29mdC9sYXJhdmVsLTUtYm9pbGVycGxhdGUvYmxvYi9tYXN0ZXIvcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanNcbndpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuLyoqXG4gKiBOZXh0IHdlIHdpbGwgcmVnaXN0ZXIgdGhlIENTUkYgVG9rZW4gYXMgYSBjb21tb24gaGVhZGVyIHdpdGggQXhpb3Mgc28gdGhhdFxuICogYWxsIG91dGdvaW5nIEhUVFAgcmVxdWVzdHMgYXV0b21hdGljYWxseSBoYXZlIGl0IGF0dGFjaGVkLiBUaGlzIGlzIGp1c3RcbiAqIGEgc2ltcGxlIGNvbnZlbmllbmNlIHNvIHdlIGRvbid0IGhhdmUgdG8gYXR0YWNoIGV2ZXJ5IHRva2VuIG1hbnVhbGx5LlxuICovXG5cbmxldCB0b2tlbiA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpO1xuXG5pZiAodG9rZW4pIHtcbiAgICB3aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtQ1NSRi1UT0tFTiddID0gdG9rZW4uY29udGVudDtcbn0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcignQ1NSRiB0b2tlbiBub3QgZm91bmQ6IGh0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy9jc3JmI2NzcmYteC1jc3JmLXRva2VuJyk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qcyIsIi8vbG9hZCByZXF1aXJlZCBKUyBsaWJyYXJpZXNcbnJlcXVpcmUoJ2Z1bGxjYWxlbmRhcicpO1xucmVxdWlyZSgnZGV2YnJpZGdlLWF1dG9jb21wbGV0ZScpO1xudmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2VvbmFzZGFuLWJvb3RzdHJhcC1kYXRldGltZXBpY2tlci1ydXNzZmVsZCcpO1xudmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi4vdXRpbC9lZGl0YWJsZScpO1xuXG4vL1Nlc3Npb24gZm9yIHN0b3JpbmcgZGF0YSBiZXR3ZWVuIGZvcm1zXG5leHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXG4vL0lEIG9mIHRoZSBjdXJyZW50bHkgbG9hZGVkIGNhbGVuZGFyJ3MgYWR2aXNvclxuZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9IC0xO1xuXG4vL1N0dWRlbnQncyBOYW1lIHNldCBieSBpbml0XG5leHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSBcIlwiO1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG5leHBvcnRzLmNhbGVuZGFyRGF0YSA9IHtcblx0aGVhZGVyOiB7XG5cdFx0bGVmdDogJ3ByZXYsbmV4dCB0b2RheScsXG5cdFx0Y2VudGVyOiAndGl0bGUnLFxuXHRcdHJpZ2h0OiAnYWdlbmRhV2VlayxhZ2VuZGFEYXknXG5cdH0sXG5cdGVkaXRhYmxlOiBmYWxzZSxcblx0ZXZlbnRMaW1pdDogdHJ1ZSxcblx0aGVpZ2h0OiAnYXV0bycsXG5cdHdlZWtlbmRzOiBmYWxzZSxcblx0YnVzaW5lc3NIb3Vyczoge1xuXHRcdHN0YXJ0OiAnODowMCcsIC8vIGEgc3RhcnQgdGltZSAoMTBhbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZW5kOiAnMTc6MDAnLCAvLyBhbiBlbmQgdGltZSAoNnBtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRkb3c6IFsgMSwgMiwgMywgNCwgNSBdXG5cdH0sXG5cdGRlZmF1bHRWaWV3OiAnYWdlbmRhV2VlaycsXG5cdHZpZXdzOiB7XG5cdFx0YWdlbmRhOiB7XG5cdFx0XHRhbGxEYXlTbG90OiBmYWxzZSxcblx0XHRcdHNsb3REdXJhdGlvbjogJzAwOjIwOjAwJyxcblx0XHRcdG1pblRpbWU6ICcwODowMDowMCcsXG5cdFx0XHRtYXhUaW1lOiAnMTc6MDA6MDAnXG5cdFx0fVxuXHR9LFxuXHRldmVudFNvdXJjZXM6IFtcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvbWVldGluZ2ZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBtZWV0aW5nIGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjNTEyODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ3doaXRlJyxcblx0XHR9LFxuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9ibGFja291dGZlZWQnLFxuXHRcdFx0dHlwZTogJ0dFVCcsXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBmZXRjaGluZyBibGFja291dCBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnI0ZGODg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICdibGFjaycsXG5cdFx0fSxcblx0XSxcblx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0c2VsZWN0SGVscGVyOiB0cnVlLFxuXHRzZWxlY3RPdmVybGFwOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHJldHVybiBldmVudC5yZW5kZXJpbmcgPT09ICdiYWNrZ3JvdW5kJztcblx0fSxcblx0dGltZUZvcm1hdDogJyAnLFxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2VcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGEgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTExMJyxcblx0XHRzdGVwcGluZzogMjAsXG5cdFx0ZW5hYmxlZEhvdXJzOiBbOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3XSxcblx0XHRtYXhIb3VyOiAxNyxcblx0XHRzaWRlQnlTaWRlOiB0cnVlLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlIGRheSBvbmx5XG5leHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdNTS9ERC9ZWVlZJyxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vKipcbiAqIEluaXRpYWx6YXRpb24gZnVuY3Rpb24gZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSBhZHZpc29yIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSB1c2VyIGlzIGFuIGFkdmlzb3JcbiAqIEBwYXJhbSBub2JpbmQgLSBib29sZWFuIHRydWUgaWYgdGhlIGJ1dHRvbnMgc2hvdWxkIG5vdCBiZSBib3VuZCAobWFrZSBjYWxlbmRhciByZWFkLW9ubHkpXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9DaGVjayBmb3IgbWVzc2FnZXMgaW4gdGhlIHNlc3Npb24gZnJvbSBhIHByZXZpb3VzIGFjdGlvblxuXHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG5cdC8vaW5pdGFsaXplIGVkaXRhYmxlIGVsZW1lbnRzXG5cdGVkaXRhYmxlLmluaXQoKTtcblxuXHQvL3R3ZWFrIHBhcmFtZXRlcnNcblx0d2luZG93LmFkdmlzb3IgfHwgKHdpbmRvdy5hZHZpc29yID0gZmFsc2UpO1xuXHR3aW5kb3cubm9iaW5kIHx8ICh3aW5kb3cubm9iaW5kID0gZmFsc2UpO1xuXG5cdC8vZ2V0IHRoZSBjdXJyZW50IGFkdmlzb3IncyBJRFxuXHRleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gJCgnI2NhbGVuZGFyQWR2aXNvcklEJykudmFsKCkudHJpbSgpO1xuXG5cdC8vU2V0IHRoZSBhZHZpc29yIGluZm9ybWF0aW9uIGZvciBtZWV0aW5nIGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMF0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9TZXQgdGhlIGFkdnNpb3IgaW5mb3JhbXRpb24gZm9yIGJsYWNrb3V0IGV2ZW50IHNvdXJjZVxuXHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0uZGF0YSA9IHtpZDogZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRH07XG5cblx0Ly9pZiB0aGUgd2luZG93IGlzIHNtYWxsLCBzZXQgZGlmZmVyZW50IGRlZmF1bHQgZm9yIGNhbGVuZGFyXG5cdGlmKCQod2luZG93KS53aWR0aCgpIDwgNjAwKXtcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5kZWZhdWx0VmlldyA9ICdhZ2VuZGFEYXknO1xuXHR9XG5cblx0Ly9JZiBub2JpbmQsIGRvbid0IGJpbmQgdGhlIGZvcm1zXG5cdGlmKCF3aW5kb3cubm9iaW5kKXtcblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgYW4gYWR2aXNvciwgYmluZCBtb3JlIGRhdGFcblx0XHRpZih3aW5kb3cuYWR2aXNvcil7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyN0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0X3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI2VuZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI2VuZF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5zaG93KCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2Jykuc2hvdygpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuXHRcdFx0Ly9iaW5kIG1ldGhvZHMgZm9yIGJ1dHRvbnMgYW5kIGZvcm1zXG5cdFx0XHQkKCcjbmV3U3R1ZGVudEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgbmV3U3R1ZGVudCk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2J0aXRsZScpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRcdFx0ICAgICQodGhpcykuZmluZCgnLmhhcy1lcnJvcicpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS50ZXh0KCcnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGxvYWRDb25mbGljdHMpO1xuXG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vYmluZCBhdXRvY29tcGxldGUgZmllbGRcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5hdXRvY29tcGxldGUoe1xuXHRcdFx0ICAgIHNlcnZpY2VVcmw6ICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcsXG5cdFx0XHQgICAgYWpheFNldHRpbmdzOiB7XG5cdFx0XHQgICAgXHRkYXRhVHlwZTogXCJqc29uXCJcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuXHRcdFx0ICAgICAgICAkKCcjc3R1ZGVudGlkdmFsJykudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHQgICAgICAgIHJldHVybiB7XG5cdFx0XHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0XHRcdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0XHRcdCAgICAgICAgICAgIH0pXG5cdFx0XHQgICAgICAgIH07XG5cdFx0XHQgICAgfVxuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjc3RhcnQnLCAnI2VuZCcsICcjZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNic3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjYmVuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNic3RhcnQnLCAnI2JlbmQnLCAnI2JkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JyZXBlYXR1bnRpbF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkpO1xuXG5cdFx0XHQvL2NoYW5nZSByZW5kZXJpbmcgb2YgZXZlbnRzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHRcdFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWNsaWNrYWJsZVwiKTtcblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdtJyl7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZCcpLnZhbChldmVudC5zdHVkZW50bmFtZSk7XG5cdFx0XHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHR9ZWxzZSBpZiAoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdFx0ZXZlbnQ6IGV2ZW50XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZihldmVudC5yZXBlYXQgPT0gJzAnKXtcblx0XHRcdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0XHRcdGVuZDogZW5kXG5cdFx0XHRcdH07XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdH07XG5cblx0XHRcdC8vYmluZCBtb3JlIGJ1dHRvbnNcblx0XHRcdCQoJyNicmVwZWF0JykuY2hhbmdlKHJlcGVhdENoYW5nZSk7XG5cblx0XHRcdCQoJyNzYXZlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVCbGFja291dCk7XG5cblx0XHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRTZXJpZXMnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0U2VyaWVzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0T2NjdXJyZW5jZScpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRPY2N1cnJlbmNlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2FkdmlzaW5nQnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9mZignaGlkZGVuLmJzLm1vZGFsJyk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlTWVldGluZ0J0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlTWVldGluZ0Zvcm0oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXRCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdFx0JCgnI3Jlc29sdmVCdXR0b24nKS5vbignY2xpY2snLCByZXNvbHZlQ29uZmxpY3RzKTtcblxuXHRcdFx0bG9hZENvbmZsaWN0cygpO1xuXG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIG5vdCBhbiBhZHZpc29yLCBiaW5kIGxlc3MgZGF0YVxuXHRcdH1lbHNle1xuXG5cdFx0XHQvL0dldCB0aGUgY3VycmVudCBzdHVkZW50J3MgbmFtZVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gJCgnI2NhbGVuZGFyU3R1ZGVudE5hbWUnKS52YWwoKS50cmltKCk7XG5cblx0XHQgIC8vUmVuZGVyIGJsYWNrb3V0cyB0byBiYWNrZ3JvdW5kXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuXG5cdFx0ICAvL1doZW4gcmVuZGVyaW5nLCB1c2UgdGhpcyBjdXN0b20gZnVuY3Rpb24gZm9yIGJsYWNrb3V0cyBhbmQgc3R1ZGVudCBtZWV0aW5nc1xuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdFx0ICAgIH1cblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0XHQgICAgfVxuXHRcdFx0fTtcblxuXHRcdCAgLy9Vc2UgdGhpcyBtZXRob2QgZm9yIGNsaWNraW5nIG9uIG1lZXRpbmdzXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQsIHZpZXcpe1xuXHRcdFx0XHRpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0XHRcdFx0aWYoZXZlbnQuc3RhcnQuaXNBZnRlcihtb21lbnQoKSkpe1xuXHRcdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KFwiWW91IGNhbm5vdCBlZGl0IG1lZXRpbmdzIGluIHRoZSBwYXN0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdCAgLy9XaGVuIHNlbGVjdGluZyBuZXcgYXJlYXMsIHVzZSB0aGUgc3R1ZGVudFNlbGVjdCBtZXRob2QgaW4gdGhlIGNhbGVuZGFyIGxpYnJhcnlcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdCA9IHN0dWRlbnRTZWxlY3Q7XG5cblx0XHRcdC8vV2hlbiB0aGUgY3JlYXRlIGV2ZW50IGJ1dHRvbiBpcyBjbGlja2VkLCBzaG93IHRoZSBtb2RhbCBmb3JtXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNkZXNjJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0XCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JChcIiNlbmRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjZW5kX3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNzdHVkZW50aWRkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3RhdHVzZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJy5tb2RhbCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXHRcdH1cblxuXHRcdC8vQmluZCBjbGljayBoYW5kbGVycyBvbiB0aGUgZm9ybVxuXHRcdCQoJyNzYXZlQnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlTWVldGluZyk7XG5cdFx0JCgnI2RlbGV0ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZGVsZXRlTWVldGluZyk7XG5cdFx0JCgnI2R1cmF0aW9uJykub24oJ2NoYW5nZScsIGNoYW5nZUR1cmF0aW9uKTtcblxuXHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzIHdpdGggbm8gYmluZGluZ1xuXHR9ZWxzZXtcblx0XHQvL2ZvciByZWFkLW9ubHkgY2FsZW5kYXJzLCBzZXQgcmVuZGVyaW5nIHRvIGJhY2tncm91bmRcblx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFNvdXJjZXNbMV0ucmVuZGVyaW5nID0gJ2JhY2tncm91bmQnO1xuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLnNlbGVjdGFibGUgPSBmYWxzZTtcblxuICAgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHQgICAgICAgIGVsZW1lbnQuYXBwZW5kKFwiPGRpdiBzdHlsZT1cXFwiY29sb3I6ICMwMDAwMDA7IHotaW5kZXg6IDU7XFxcIj5cIiArIGV2ZW50LnRpdGxlICsgXCI8L2Rpdj5cIik7XG5cdCAgICB9XG5cdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdCAgICBcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1ncmVlblwiKTtcblx0ICAgIH1cblx0XHR9O1xuXHR9XG5cblx0Ly9pbml0YWxpemUgdGhlIGNhbGVuZGFyIVxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoZXhwb3J0cy5jYWxlbmRhckRhdGEpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGNhbGVuZGFyIGJ5IGNsb3NpbmcgbW9kYWxzIGFuZCByZWxvYWRpbmcgZGF0YVxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBmb3JtIHRvIGhpZGUgKGFuZCB0aGUgc3BpbilcbiAqIEBwYXJhbSByZXBvbnNlIC0gdGhlIEF4aW9zIHJlcHNvbnNlIG9iamVjdCByZWNlaXZlZFxuICovXG52YXIgcmVzZXRDYWxlbmRhciA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlc3BvbnNlKXtcblx0Ly9oaWRlIHRoZSBmb3JtXG5cdCQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2Rpc3BsYXkgdGhlIG1lc3NhZ2UgdG8gdGhlIHVzZXJcblx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cblx0Ly9yZWZyZXNoIHRoZSBjYWxlbmRhclxuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigncmVmZXRjaEV2ZW50cycpO1xuXHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRpZih3aW5kb3cuYWR2aXNvcil7XG5cdFx0bG9hZENvbmZsaWN0cygpO1xuXHR9XG59XG5cbi8qKlxuICogQUpBWCBtZXRob2QgdG8gc2F2ZSBkYXRhIGZyb20gYSBmb3JtXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgc291cmNlIGVsZW1lbnQgb2YgdGhlIGRhdGFcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhTYXZlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24pe1xuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHQgIC8vaWYgcmVzcG9uc2UgaXMgMnh4XG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0fSlcblx0XHQvL2lmIHJlc3BvbnNlIGlzIG5vdCAyeHhcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHR9KTtcbn1cblxudmFyIGFqYXhEZWxldGUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbiwgbm9SZXNldCwgbm9DaG9pY2Upe1xuXHQvL2NoZWNrIG5vUmVzZXQgdmFyaWFibGVcblx0bm9SZXNldCB8fCAobm9SZXNldCA9IGZhbHNlKTtcblx0bm9DaG9pY2UgfHwgKG5vQ2hvaWNlID0gZmFsc2UpO1xuXG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBjb25maXJtYXRpb25cblx0aWYoIW5vQ2hvaWNlKXtcblx0XHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdH1lbHNle1xuXHRcdHZhciBjaG9pY2UgPSB0cnVlO1xuXHR9XG5cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblxuXHRcdC8vaWYgY29uZmlybWVkLCBzaG93IHNwaW5uaW5nIGljb25cblx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vbWFrZSBBSkFYIHJlcXVlc3QgdG8gZGVsZXRlXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihub1Jlc2V0KXtcblx0XHRcdFx0XHQvL2hpZGUgcGFyZW50IGVsZW1lbnQgLSBUT0RPIFRFU1RNRVxuXHRcdFx0XHRcdC8vY2FsbGVyLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0XHQkKGVsZW1lbnQpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0cmVzZXRDYWxlbmRhcihlbGVtZW50LCByZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIGEgbWVldGluZ1xuICovXG52YXIgc2F2ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlRXZlbnRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0c3RhcnQ6IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0ZW5kOiBtb21lbnQoJCgnI2VuZCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHR0aXRsZTogJCgnI3RpdGxlJykudmFsKCksXG5cdFx0ZGVzYzogJCgnI2Rlc2MnKS52YWwoKSxcblx0XHRzdGF0dXM6ICQoJyNzdGF0dXMnKS52YWwoKVxuXHR9O1xuXHRkYXRhLmlkID0gZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRDtcblx0aWYoJCgnI21lZXRpbmdJRCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5tZWV0aW5naWQgPSAkKCcjbWVldGluZ0lEJykudmFsKCk7XG5cdH1cblx0aWYoJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpID4gMCl7XG5cdFx0ZGF0YS5zdHVkZW50aWQgPSAkKCcjc3R1ZGVudGlkdmFsJykudmFsKCk7XG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlbWVldGluZyc7XG5cblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdzYXZlIG1lZXRpbmcnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGEgbWVldGluZ1xuICovXG52YXIgZGVsZXRlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCB1cmxcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiAkKCcjbWVldGluZ0lEJykudmFsKClcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVFdmVudCcsICdkZWxldGUgbWVldGluZycsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcG9wdWxhdGUgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgZWRpdGluZ1xuICpcbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byBlZGl0XG4gKi9cbnZhciBzaG93TWVldGluZ0Zvcm0gPSBmdW5jdGlvbihldmVudCl7XG5cdCQoJyN0aXRsZScpLnZhbChldmVudC50aXRsZSk7XG5cdCQoJyNzdGFydCcpLnZhbChldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZW5kJykudmFsKGV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjZGVzYycpLnZhbChldmVudC5kZXNjKTtcblx0ZHVyYXRpb25PcHRpb25zKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpO1xuXHQkKCcjbWVldGluZ0lEJykudmFsKGV2ZW50LmlkKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbChldmVudC5zdHVkZW50X2lkKTtcblx0JCgnI3N0YXR1cycpLnZhbChldmVudC5zdGF0dXMpO1xuXHQkKCcjZGVsZXRlQnV0dG9uJykuc2hvdygpO1xuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBjcmVhdGlvblxuICpcbiAqIEBwYXJhbSBjYWxlbmRhclN0dWRlbnROYW1lIC0gc3RyaW5nIG5hbWUgb2YgdGhlIHN0dWRlbnRcbiAqL1xudmFyIGNyZWF0ZU1lZXRpbmdGb3JtID0gZnVuY3Rpb24oY2FsZW5kYXJTdHVkZW50TmFtZSl7XG5cblx0Ly9wb3B1bGF0ZSB0aGUgdGl0bGUgYXV0b21hdGljYWxseSBmb3IgYSBzdHVkZW50XG5cdGlmKGNhbGVuZGFyU3R1ZGVudE5hbWUgIT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3RpdGxlJykudmFsKGNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9ZWxzZXtcblx0XHQkKCcjdGl0bGUnKS52YWwoJycpO1xuXHR9XG5cblx0Ly9TZXQgc3RhcnQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjc3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZW5kIHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNlbmQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMjApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cblx0Ly9TZXQgZHVyYXRpb24gb3B0aW9uc1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHRkdXJhdGlvbk9wdGlvbnMobW9tZW50KCkuaG91cig4KS5taW51dGUoMCksIG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKSk7XG5cdH1lbHNle1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCwgZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kKTtcblx0fVxuXG5cdC8vUmVzZXQgb3RoZXIgb3B0aW9uc1xuXHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0JCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgtMSk7XG5cblx0Ly9IaWRlIGRlbGV0ZSBidXR0b25cblx0JCgnI2RlbGV0ZUJ1dHRvbicpLmhpZGUoKTtcblxuXHQvL1Nob3cgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSBvbiB0aGlzIHBhZ2VcbiAqL1xudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNldCBkdXJhdGlvbiBvcHRpb25zIGZvciB0aGUgbWVldGluZyBmb3JtXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZVxuICogQHBhcmFtIGVuZCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZGluZyB0aW1lXG4gKi9cbnZhciBkdXJhdGlvbk9wdGlvbnMgPSBmdW5jdGlvbihzdGFydCwgZW5kKXtcblx0Ly9jbGVhciB0aGUgbGlzdFxuXHQkKCcjZHVyYXRpb24nKS5lbXB0eSgpO1xuXG5cdC8vYXNzdW1lIGFsbCBtZWV0aW5ncyBoYXZlIHJvb20gZm9yIDIwIG1pbnV0ZXNcblx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nMjAnPjIwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MjAsIGFsbG93IDQwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDIwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNDAnPjQwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDowMCwgYWxsb3cgNjAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzYwJz42MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9zZXQgZGVmYXVsdCB2YWx1ZSBiYXNlZCBvbiBnaXZlbiBzcGFuXG5cdCQoJyNkdXJhdGlvbicpLnZhbChlbmQuZGlmZihzdGFydCwgXCJtaW51dGVzXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbGluayB0aGUgZGF0ZXBpY2tlcnMgdG9nZXRoZXJcbiAqXG4gKiBAcGFyYW0gZWxlbTEgLSBqUXVlcnkgb2JqZWN0IGZvciBmaXJzdCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZWxlbTIgLSBqUXVlcnkgb2JqZWN0IGZvciBzZWNvbmQgZGF0ZXBpY2tlclxuICogQHBhcmFtIGR1cmF0aW9uIC0gZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGxpbmtEYXRlUGlja2VycyA9IGZ1bmN0aW9uKGVsZW0xLCBlbGVtMiwgZHVyYXRpb24pe1xuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBmaXJzdCBkYXRhcGlja2VyXG5cdCQoZWxlbTEgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUyID0gbW9tZW50KCQoZWxlbTIpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQWZ0ZXIoZGF0ZTIpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTIpKXtcblx0XHRcdGRhdGUyID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0yKS52YWwoZGF0ZTIuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIHNlY29uZCBkYXRlcGlja2VyXG5cdCQoZWxlbTIgKyBcIl9kYXRlcGlja2VyXCIpLm9uKFwiZHAuY2hhbmdlXCIsIGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIGRhdGUxID0gbW9tZW50KCQoZWxlbTEpLnZhbCgpLCAnTExMJyk7XG5cdFx0aWYoZS5kYXRlLmlzQmVmb3JlKGRhdGUxKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUxKSl7XG5cdFx0XHRkYXRlMSA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMSkudmFsKGRhdGUxLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgY2hhbmdlRHVyYXRpb24gPSBmdW5jdGlvbigpe1xuXHR2YXIgbmV3RGF0ZSA9IG1vbWVudCgkKCcjc3RhcnQnKS52YWwoKSwgJ0xMTCcpLmFkZCgkKHRoaXMpLnZhbCgpLCBcIm1pbnV0ZXNcIik7XG5cdCQoJyNlbmQnKS52YWwobmV3RGF0ZS5mb3JtYXQoXCJMTExcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB2ZXJpZnkgdGhhdCB0aGUgc3R1ZGVudHMgYXJlIHNlbGVjdGluZyBtZWV0aW5ncyB0aGF0IGFyZW4ndCB0b28gbG9uZ1xuICpcbiAqIEBwYXJhbSBzdGFydCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCBvZiB0aGUgbWVldGluZ1xuICogQHBhcmFtIGVuZCAtIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmQgb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIHN0dWRlbnRTZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cblx0Ly9XaGVuIHN0dWRlbnRzIHNlbGVjdCBhIG1lZXRpbmcsIGRpZmYgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXNcblx0aWYoZW5kLmRpZmYoc3RhcnQsICdtaW51dGVzJykgPiA2MCl7XG5cblx0XHQvL2lmIGludmFsaWQsIHVuc2VsZWN0IGFuZCBzaG93IGFuIGVycm9yXG5cdFx0YWxlcnQoXCJNZWV0aW5ncyBjYW5ub3QgbGFzdCBsb25nZXIgdGhhbiAxIGhvdXJcIik7XG5cdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHR9ZWxzZXtcblxuXHRcdC8vaWYgdmFsaWQsIHNldCBkYXRhIGluIHRoZSBzZXNzaW9uIGFuZCBzaG93IHRoZSBmb3JtXG5cdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRlbmQ6IGVuZFxuXHRcdH07XG5cdFx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdFx0Y3JlYXRlTWVldGluZ0Zvcm0oZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBMb2FkIGNvbmZsaWN0aW5nIG1lZXRpbmdzIGZyb20gdGhlIHNlcnZlclxuICovXG52YXIgbG9hZENvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9yZXF1ZXN0IGNvbmZsaWN0cyB2aWEgQUpBWFxuXHR3aW5kb3cuYXhpb3MuZ2V0KCcvYWR2aXNpbmcvY29uZmxpY3RzJylcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdC8vZGlzYWJsZSBleGlzdGluZyBjbGljayBoYW5kbGVyc1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0Ly9JZiByZXNwb25zZSBpcyAyMDAsIGRhdGEgd2FzIHJlY2VpdmVkXG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gMjAwKXtcblxuXHRcdFx0XHQvL0FwcGVuZCBIVE1MIGZvciBjb25mbGljdHMgdG8gRE9NXG5cdFx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpLmVtcHR5KCk7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0XHRcdCQoJzxkaXYvPicsIHtcblx0XHRcdFx0XHRcdCdpZCcgOiAncmVzb2x2ZScrdmFsdWUuaWQsXG5cdFx0XHRcdFx0XHQnY2xhc3MnOiAnbWVldGluZy1jb25mbGljdCcsXG5cdFx0XHRcdFx0XHQnaHRtbCc6IFx0JzxwPiZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodCBkZWxldGVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JyZuYnNwOzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgZWRpdENvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RWRpdDwvYnV0dG9uPiAnICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0IHJlc29sdmVDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPktlZXAgTWVldGluZzwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZScrdmFsdWUuaWQrJ3NwaW5cIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0fSkuYXBwZW5kVG8oJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvL1JlLXJlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHRcdC8vU2hvdyB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cblx0XHQgIC8vSWYgcmVzcG9uc2UgaXMgMjA0LCBubyBjb25mbGljdHMgYXJlIHByZXNlbnRcblx0XHRcdH1lbHNlIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQpe1xuXG5cdFx0XHRcdC8vSGlkZSB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gcmV0cmlldmUgY29uZmxpY3RpbmcgbWVldGluZ3M6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fSk7XG59XG5cbi8qKlxuICogU2F2ZSBibGFja291dHMgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgc2F2ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUJsYWNrb3V0c3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgdXJsO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRic3RhcnQ6IG1vbWVudCgkKCcjYnN0YXJ0JykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRiZW5kOiBtb21lbnQoJCgnI2JlbmQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJ0aXRsZTogJCgnI2J0aXRsZScpLnZhbCgpXG5cdH07XG5cdHZhciB1cmw7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEuYmJsYWNrb3V0ZXZlbnRpZCA9ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCk7XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXQnO1xuXHRcdGlmKCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpID4gMCl7XG5cdFx0XHRkYXRhLmJibGFja291dGlkID0gJCgnI2JibGFja291dGlkJykudmFsKCk7XG5cdFx0fVxuXHRcdGRhdGEuYnJlcGVhdCA9ICQoJyNicmVwZWF0JykudmFsKCk7XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAxKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5PSAkKCcjYnJlcGVhdGRhaWx5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAyKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5ID0gJCgnI2JyZXBlYXR3ZWVrbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzbSA9ICQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN0ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3cgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdSA9ICQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNmID0gJCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdzYXZlIGJsYWNrb3V0Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBibGFja291dCBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBkZWxldGVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBVUkwgYW5kIGRhdGEgb2JqZWN0XG5cdHZhciB1cmwsIGRhdGE7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGV2ZW50aWQ6ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgfTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0aWQ6ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpIH07XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ2RlbGV0ZSBibGFja291dCcsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBjaGFuZ2Ugb2YgcmVwZWF0IG9wdGlvbnMgb24gdGhlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIHJlcGVhdENoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQodGhpcykudmFsKCkgPT0gMCl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDEpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAyKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1cbn07XG5cbi8qKlxuICogU2hvdyB0aGUgcmVzb2x2ZSBjb25mbGljdHMgbW9kYWwgZm9ybVxuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZGVsZXRlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdC8vc2VuZCBBSkFYIGRlbGV0ZVxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAnZGVsZXRlIG1lZXRpbmcnLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBFZGl0IGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGVkaXRDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvbWVldGluZyc7XG5cblx0Ly9zaG93IHNwaW5uZXIgdG8gbG9hZCBtZWV0aW5nXG5cdCQoJyNyZXNvbHZlJysgaWQgKyAnc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2xvYWQgbWVldGluZyBhbmQgZGlzcGxheSBmb3JtXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNyZXNvbHZlJysgaWQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0ZXZlbnQgPSByZXNwb25zZS5kYXRhO1xuXHRcdFx0ZXZlbnQuc3RhcnQgPSBtb21lbnQoZXZlbnQuc3RhcnQpO1xuXHRcdFx0ZXZlbnQuZW5kID0gbW9tZW50KGV2ZW50LmVuZCk7XG5cdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIG1lZXRpbmcnLCAnI3Jlc29sdmUnICsgaWQsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogUmVzb2x2ZSBhIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIHJlc29sdmVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvcmVzb2x2ZWNvbmZsaWN0JztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAncmVzb2x2ZSBtZWV0aW5nJywgdHJ1ZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgY3JlYXRlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIGNyZWF0ZUJsYWNrb3V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNidGl0bGUnKS52YWwoXCJcIik7XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KCkuaG91cig5KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCQoJyNicmVwZWF0JykudmFsKDApO1xuXHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5oaWRlKCk7XG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIHRvIGEgc2luZ2xlIG9jY3VycmVuY2VcbiAqL1xudmFyIGJsYWNrb3V0T2NjdXJyZW5jZSA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vc2V0IGZvcm0gdmFsdWVzIGFuZCBoaWRlIHVubmVlZGVkIGZpZWxkc1xuXHQkKCcjYnRpdGxlJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnRpdGxlKTtcblx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI3JlcGVhdGRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZCk7XG5cdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmlkKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXG5cdC8vc2hvdyB0aGUgZm9ybVxuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgYmxhY2tvdXQgc2VyaWVzIGVkaXQgZm9ybVxuICovXG52YXIgYmxhY2tvdXRTZXJpZXMgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cbiBcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0aWQ6IGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvYmxhY2tvdXQnO1xuXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNidGl0bGUnKS52YWwocmVzcG9uc2UuZGF0YS50aXRsZSlcblx0IFx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnN0YXJ0LCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLmVuZCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwocmVzcG9uc2UuZGF0YS5pZCk7XG5cdCBcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHQgXHRcdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0IFx0XHRpZihyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDEpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXRkYWlseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fWVsc2UgaWYgKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMil7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdFx0XHRcdHZhciByZXBlYXRfZGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLmRhdGEucmVwZWF0X2RldGFpbCk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMlwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiM1wiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNFwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fVxuXHQgXHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblx0IFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGJsYWNrb3V0IHNlcmllcycsICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBzdHVkZW50IGluIHRoZSBkYXRhYmFzZVxuICovXG52YXIgbmV3U3R1ZGVudCA9IGZ1bmN0aW9uKCl7XG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBhbiBlSUQgdG8gYWRkIHRvIHRoZSBzeXN0ZW1cblx0dmFyIGVpZCA9IHByb21wdChcIkVudGVyIHRoZSBzdHVkZW50J3MgZUlEXCIpO1xuXG5cdC8vYnVpbGQgdGhlIFVSTCBhbmQgZGF0YVxuXHR2YXIgZGF0YSA9IHtcblx0XHRlaWQ6IGVpZCxcblx0fTtcblx0dmFyIHVybCA9ICcvcHJvZmlsZS9uZXdzdHVkZW50JztcblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRhbGVydChyZXNwb25zZS5kYXRhKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdFx0XHRpZihlcnJvci5yZXNwb25zZS5zdGF0dXMgPT0gNDIyKXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhW1wiZWlkXCJdKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnZhciBFY2hvID0gcmVxdWlyZSgnbGFyYXZlbC1lY2hvJyk7XG5yZXF1aXJlKCdpb24tc291bmQnKTtcblxud2luZG93LlB1c2hlciA9IHJlcXVpcmUoJ3B1c2hlci1qcycpO1xuXG4vKipcbiAqIEdyb3Vwc2Vzc2lvbiBpbml0IGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IHRvIHN0YXJ0XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9sb2FkIGlvbi1zb3VuZCBsaWJyYXJ5XG5cdGlvbi5zb3VuZCh7XG4gICAgc291bmRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwiZG9vcl9iZWxsXCJcbiAgICAgICAgfSxcbiAgICBdLFxuICAgIHZvbHVtZTogMS4wLFxuICAgIHBhdGg6IFwiL3NvdW5kcy9cIixcbiAgICBwcmVsb2FkOiB0cnVlXG5cdH0pO1xuXG5cdC8vZ2V0IHVzZXJJRCBhbmQgaXNBZHZpc29yIHZhcmlhYmxlc1xuXHR3aW5kb3cudXNlcklEID0gcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKTtcblxuXHQvL3JlZ2lzdGVyIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLm9uKCdjbGljaycsIGdyb3VwUmVnaXN0ZXJCdG4pO1xuXG5cdC8vZGlzYWJsZSBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwRGlzYWJsZUJ0bicpLm9uKCdjbGljaycsIGdyb3VwRGlzYWJsZUJ0bik7XG5cblx0Ly9yZW5kZXIgVnVlIEFwcFxuXHR3aW5kb3cudm0gPSBuZXcgVnVlKHtcblx0XHRlbDogJyNncm91cExpc3QnLFxuXHRcdGRhdGE6IHtcblx0XHRcdHF1ZXVlOiBbXSxcblx0XHRcdGFkdmlzb3I6IHBhcnNlSW50KCQoJyNpc0Fkdmlzb3InKS52YWwoKSkgPT0gMSxcblx0XHRcdHVzZXJJRDogcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKSxcblx0XHRcdG9ubGluZTogW10sXG5cdFx0fSxcblx0XHRtZXRob2RzOiB7XG5cdFx0XHQvL0Z1bmN0aW9uIHRvIGdldCBDU1MgY2xhc3NlcyBmb3IgYSBzdHVkZW50IG9iamVjdFxuXHRcdFx0Z2V0Q2xhc3M6IGZ1bmN0aW9uKHMpe1xuXHRcdFx0XHRyZXR1cm57XG5cdFx0XHRcdFx0J2FsZXJ0LWluZm8nOiBzLnN0YXR1cyA9PSAwIHx8IHMuc3RhdHVzID09IDEsXG5cdFx0XHRcdFx0J2FsZXJ0LXN1Y2Nlc3MnOiBzLnN0YXR1cyA9PSAyLFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tbWUnOiBzLnVzZXJpZCA9PSB0aGlzLnVzZXJJRCxcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW9mZmxpbmUnOiAkLmluQXJyYXkocy51c2VyaWQsIHRoaXMub25saW5lKSA9PSAtMSxcblx0XHRcdFx0fTtcblx0XHRcdH0sXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHRha2UgYSBzdHVkZW50IGZyb20gdGhlIGxpc3Rcblx0XHRcdHRha2VTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vdGFrZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAndGFrZScpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly9mdW5jdGlvbiB0byBwdXQgYSBzdHVkZW50IGJhY2sgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdFxuXHRcdFx0cHV0U3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3B1dCdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAncHV0Jyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvLyBmdW5jdGlvbiB0byBtYXJrIGEgc3R1ZGVudCBkb25lIG9uIHRoZSBsaXN0XG5cdFx0XHRkb25lU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RvbmUnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ21hcmsgZG9uZScpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly9mdW5jdGlvbiB0byBkZWxldGUgYSBzdHVkZW50IGZyb20gdGhlIGxpc3Rcblx0XHRcdGRlbFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kZWxldGUnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ2RlbGV0ZScpO1xuXHRcdFx0fSxcblx0XHR9LFxuXHR9KVxuXG5cblx0Ly9FbmFibGUgUHVzaGVyIGxvZ2dpbmdcblx0aWYod2luZG93LmVudiA9PSBcImxvY2FsXCIgfHwgd2luZG93LmVudiA9PSBcInN0YWdpbmdcIil7XG5cdFx0Y29uc29sZS5sb2coXCJQdXNoZXIgbG9nZ2luZyBlbmFibGVkIVwiKTtcblx0XHRQdXNoZXIubG9nVG9Db25zb2xlID0gdHJ1ZTtcblx0fVxuXG5cdC8vTG9hZCB0aGUgRWNobyBpbnN0YW5jZSBvbiB0aGUgd2luZG93XG5cdHdpbmRvdy5FY2hvID0gbmV3IEVjaG8oe1xuXHRcdGJyb2FkY2FzdGVyOiAncHVzaGVyJyxcblx0XHRrZXk6IHdpbmRvdy5wdXNoZXJLZXksXG5cdFx0Y2x1c3Rlcjogd2luZG93LnB1c2hlckNsdXN0ZXIsXG5cdH0pO1xuXG5cdC8vQmluZCB0byB0aGUgY29ubmVjdGVkIGFjdGlvbiBvbiBQdXNoZXIgKGNhbGxlZCB3aGVuIGNvbm5lY3RlZClcblx0d2luZG93LkVjaG8uY29ubmVjdG9yLnB1c2hlci5jb25uZWN0aW9uLmJpbmQoJ2Nvbm5lY3RlZCcsIGZ1bmN0aW9uKCl7XG5cdFx0Ly93aGVuIGNvbm5lY3RlZCwgZGlzYWJsZSB0aGUgc3Bpbm5lclxuXHRcdCQoJyNncm91cHNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL0xvYWQgdGhlIGluaXRpYWwgc3R1ZGVudCBxdWV1ZSB2aWEgQUpBWFxuXHRcdHdpbmRvdy5heGlvcy5nZXQoJy9ncm91cHNlc3Npb24vcXVldWUnKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHR3aW5kb3cudm0ucXVldWUgPSB3aW5kb3cudm0ucXVldWUuY29uY2F0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRjaGVja0J1dHRvbnMod2luZG93LnZtLnF1ZXVlKTtcblx0XHRcdFx0aW5pdGlhbENoZWNrRGluZyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHR3aW5kb3cudm0ucXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBxdWV1ZScsICcnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSlcblxuXHQvL0Nvbm5lY3QgdG8gdGhlIGdyb3Vwc2Vzc2lvbiBjaGFubmVsXG5cdC8qXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbicpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZGF0YSkgPT4ge1xuXG5cdFx0fSk7XG4gKi9cblxuXHQvL0Nvbm5lY3QgdG8gdGhlIGdyb3Vwc2Vzc2lvbmVuZCBjaGFubmVsXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbmVuZCcpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uRW5kJywgKGUpID0+IHtcblxuXHRcdFx0Ly9pZiBlbmRpbmcsIHJlZGlyZWN0IGJhY2sgdG8gaG9tZSBwYWdlXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2dyb3Vwc2Vzc2lvblwiO1xuXHR9KTtcblxuXHR3aW5kb3cuRWNoby5qb2luKCdwcmVzZW5jZScpXG5cdFx0LmhlcmUoKHVzZXJzKSA9PiB7XG5cdFx0XHR2YXIgbGVuID0gdXNlcnMubGVuZ3RoO1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0d2luZG93LnZtLm9ubGluZS5wdXNoKHVzZXJzW2ldLmlkKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5qb2luaW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlci5pZCk7XG5cdFx0fSlcblx0XHQubGVhdmluZygodXNlcikgPT4ge1xuXHRcdFx0d2luZG93LnZtLm9ubGluZS5zcGxpY2UoICQuaW5BcnJheSh1c2VyLmlkLCB3aW5kb3cudm0ub25saW5lKSwgMSk7XG5cdFx0fSlcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cdFx0XHR2YXIgcXVldWUgPSB3aW5kb3cudm0ucXVldWU7XG5cdFx0XHR2YXIgZm91bmQgPSBmYWxzZTtcblx0XHRcdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cblx0XHRcdC8vdXBkYXRlIHRoZSBxdWV1ZSBiYXNlZCBvbiByZXNwb25zZVxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0aWYocXVldWVbaV0uaWQgPT09IGRhdGEuaWQpe1xuXHRcdFx0XHRcdGlmKGRhdGEuc3RhdHVzIDwgMyl7XG5cdFx0XHRcdFx0XHRxdWV1ZVtpXSA9IGRhdGE7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRxdWV1ZS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0XHRsZW4tLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vaWYgZWxlbWVudCBub3QgZm91bmQgb24gY3VycmVudCBxdWV1ZSwgcHVzaCBpdCBvbiB0byB0aGUgcXVldWVcblx0XHRcdGlmKCFmb3VuZCl7XG5cdFx0XHRcdHF1ZXVlLnB1c2goZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vY2hlY2sgdG8gc2VlIGlmIGN1cnJlbnQgdXNlciBpcyBvbiBxdWV1ZSBiZWZvcmUgZW5hYmxpbmcgYnV0dG9uXG5cdFx0XHRjaGVja0J1dHRvbnMocXVldWUpO1xuXG5cdFx0XHQvL2lmIGN1cnJlbnQgdXNlciBpcyBmb3VuZCwgY2hlY2sgZm9yIHN0YXR1cyB1cGRhdGUgdG8gcGxheSBzb3VuZFxuXHRcdFx0aWYoZGF0YS51c2VyaWQgPT09IHVzZXJJRCl7XG5cdFx0XHRcdGNoZWNrRGluZyhkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9zb3J0IHRoZSBxdWV1ZSBjb3JyZWN0bHlcblx0XHRcdHF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblxuXHRcdFx0Ly91cGRhdGUgVnVlIHN0YXRlLCBtaWdodCBiZSB1bm5lY2Vzc2FyeVxuXHRcdFx0d2luZG93LnZtLnF1ZXVlID0gcXVldWU7XG5cdFx0fSk7XG5cbn07XG5cblxuLyoqXG4gKiBWdWUgZmlsdGVyIGZvciBzdGF0dXMgdGV4dFxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIHN0dWRlbnQgdG8gcmVuZGVyXG4gKi9cblZ1ZS5maWx0ZXIoJ3N0YXR1c3RleHQnLCBmdW5jdGlvbihkYXRhKXtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDApIHJldHVybiBcIk5FV1wiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMSkgcmV0dXJuIFwiUVVFVUVEXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAyKSByZXR1cm4gXCJNRUVUIFdJVEggXCIgKyBkYXRhLmFkdmlzb3I7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAzKSByZXR1cm4gXCJERUxBWVwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNCkgcmV0dXJuIFwiQUJTRU5UXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA1KSByZXR1cm4gXCJET05FXCI7XG59KTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgY2xpY2tpbmcgb24gdGhlIHJlZ2lzdGVyIGJ1dHRvblxuICovXG52YXIgZ3JvdXBSZWdpc3RlckJ0biA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3JlZ2lzdGVyJztcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCB7fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdGRpc2FibGVCdXR0b24oKTtcblx0XHRcdCQoJyNncm91cHNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmVnaXN0ZXInLCAnI2dyb3VwJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgYWR2aXNvcnMgdG8gZGlzYWJsZSBncm91cHNlc3Npb25cbiAqL1xudmFyIGdyb3VwRGlzYWJsZUJ0biA9IGZ1bmN0aW9uKCl7XG5cdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblx0XHR2YXIgcmVhbGx5ID0gY29uZmlybShcIlNlcmlvdXNseSwgdGhpcyB3aWxsIGxvc2UgYWxsIGN1cnJlbnQgZGF0YS4gQXJlIHlvdSByZWFsbHkgc3VyZT9cIik7XG5cdFx0aWYocmVhbGx5ID09PSB0cnVlKXtcblx0XHRcdC8vdGhpcyBpcyBhIGJpdCBoYWNreSwgYnV0IGl0IHdvcmtzXG5cdFx0XHR2YXIgdG9rZW4gPSAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpO1xuXHRcdFx0JCgnPGZvcm0gYWN0aW9uPVwiL2dyb3Vwc2Vzc2lvbi9kaXNhYmxlXCIgbWV0aG9kPVwiUE9TVFwiLz4nKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImlkXCIgdmFsdWU9XCInICsgd2luZG93LnVzZXJJRCArICdcIj4nKSlcblx0XHRcdFx0LmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJfdG9rZW5cIiB2YWx1ZT1cIicgKyB0b2tlbiArICdcIj4nKSlcblx0XHRcdFx0LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpIC8vaXQgaGFzIHRvIGJlIGFkZGVkIHNvbWV3aGVyZSBpbnRvIHRoZSA8Ym9keT5cblx0XHRcdFx0LnN1Ym1pdCgpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGVuYWJsZSByZWdpc3RyYXRpb24gYnV0dG9uXG4gKi9cbnZhciBlbmFibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGlzYWJsZSByZWdpc3RyYXRpb24gYnV0dG9uXG4gKi9cbnZhciBkaXNhYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGFuZCBzZWUgaWYgdXNlciBpcyBvbiB0aGUgbGlzdCAtIGlmIG5vdCwgZG9uJ3QgZW5hYmxlIGJ1dHRvblxuICovXG52YXIgY2hlY2tCdXR0b25zID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHR2YXIgZm91bmRNZSA9IGZhbHNlO1xuXG5cdC8vaXRlcmF0ZSB0aHJvdWdoIHVzZXJzIG9uIGxpc3QsIGxvb2tpbmcgZm9yIGN1cnJlbnQgdXNlclxuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gd2luZG93LnVzZXJJRCl7XG5cdFx0XHRmb3VuZE1lID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8vaWYgZm91bmQsIGRpc2FibGUgYnV0dG9uOyBpZiBub3QsIGVuYWJsZSBidXR0b25cblx0aWYoZm91bmRNZSl7XG5cdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHR9ZWxzZXtcblx0XHRlbmFibGVCdXR0b24oKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGJlY2tvbmVkLCBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcGVyc29uIC0gdGhlIGN1cnJlbnQgdXNlciB0byBjaGVja1xuICovXG52YXIgY2hlY2tEaW5nID0gZnVuY3Rpb24ocGVyc29uKXtcblx0aWYocGVyc29uLnN0YXR1cyA9PSAyKXtcblx0XHRpb24uc291bmQucGxheShcImRvb3JfYmVsbFwiKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBwZXJzb24gaGFzIGJlZW4gYmVja29uZWQgb24gbG9hZDsgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHF1ZXVlIC0gdGhlIGluaXRpYWwgcXVldWUgb2YgdXNlcnMgbG9hZGVkXG4gKi9cbnZhciBpbml0aWFsQ2hlY2tEaW5nID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gd2luZG93LnVzZXJJRCl7XG5cdFx0XHRjaGVja0RpbmcocXVldWVbaV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHNvcnQgZWxlbWVudHMgYmFzZWQgb24gdGhlaXIgc3RhdHVzXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBwZXJzb25cbiAqIEBwYXJhbSBiIC0gc2Vjb25kIHBlcnNvblxuICogQHJldHVybiAtIHNvcnRpbmcgdmFsdWUgaW5kaWNhdGluZyB3aG8gc2hvdWxkIGdvIGZpcnN0X25hbWVcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLnN0YXR1cyA9PSBiLnN0YXR1cyl7XG5cdFx0cmV0dXJuIChhLmlkIDwgYi5pZCA/IC0xIDogMSk7XG5cdH1cblx0cmV0dXJuIChhLnN0YXR1cyA8IGIuc3RhdHVzID8gMSA6IC0xKTtcbn1cblxuXG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIG1ha2luZyBBSkFYIFBPU1QgcmVxdWVzdHNcbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmliaW5nIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhQb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBhY3Rpb24pe1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ2YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnY29kZW1pcnJvcicpO1xucmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbnJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQkKCcjbm90ZXMnKS5zdW1tZXJub3RlKHtcblx0XHRmb2N1czogdHJ1ZSxcblx0XHR0b29sYmFyOiBbXG5cdFx0XHQvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cblx0XHRcdFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcblx0XHRcdFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcblx0XHRcdFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuXHRcdFx0WydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG5cdFx0XSxcblx0XHR0YWJzaXplOiAyLFxuXHRcdGNvZGVtaXJyb3I6IHtcblx0XHRcdG1vZGU6ICd0ZXh0L2h0bWwnLFxuXHRcdFx0aHRtbE1vZGU6IHRydWUsXG5cdFx0XHRsaW5lTnVtYmVyczogdHJ1ZSxcblx0XHRcdHRoZW1lOiAnbW9ub2thaSdcblx0XHR9LFxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3Igc2F2ZSBidXR0b25cblx0JCgnI3NhdmVQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGZpcnN0X25hbWU6ICQoJyNmaXJzdF9uYW1lJykudmFsKCksXG5cdFx0XHRsYXN0X25hbWU6ICQoJyNsYXN0X25hbWUnKS52YWwoKSxcblx0XHR9O1xuXHRcdHZhciB1cmwgPSAnL3Byb2ZpbGUvdXBkYXRlJztcblxuXHRcdC8vc2VuZCBBSkFYIHBvc3Rcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZXNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSlcblx0fSk7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIGFkdmlzb3Igc2F2ZSBidXR0b25cblx0JCgnI3NhdmVBZHZpc29yUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0Ly9UT0RPIFRFU1RNRVxuXHRcdHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJ2Zvcm0nKVswXSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwib2ZmaWNlXCIsICQoJyNvZmZpY2UnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGRhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuXHRcdHZhciB1cmwgPSAnL3Byb2ZpbGUvdXBkYXRlJztcblxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0d2luZG93LmF4aW9zLmdldCgnL3Byb2ZpbGUvcGljJylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHQkKCcjcGljdGV4dCcpLnZhbChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHRcdCQoJyNwaWNpbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBwaWN0dXJlJywgJycsIGVycm9yKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHQvL2h0dHA6Ly93d3cuYWJlYXV0aWZ1bHNpdGUubmV0L3doaXBwaW5nLWZpbGUtaW5wdXRzLWludG8tc2hhcGUtd2l0aC1ib290c3RyYXAtMy9cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuYnRuLWZpbGUgOmZpbGUnLCBmdW5jdGlvbigpIHtcblx0ICB2YXIgaW5wdXQgPSAkKHRoaXMpLFxuXHQgICAgICBudW1GaWxlcyA9IGlucHV0LmdldCgwKS5maWxlcyA/IGlucHV0LmdldCgwKS5maWxlcy5sZW5ndGggOiAxLFxuXHQgICAgICBsYWJlbCA9IGlucHV0LnZhbCgpLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC8uKlxcLy8sICcnKTtcblx0ICBpbnB1dC50cmlnZ2VyKCdmaWxlc2VsZWN0JywgW251bUZpbGVzLCBsYWJlbF0pO1xuXHR9KTtcblxuXHQvL2JpbmQgdG8gZmlsZXNlbGVjdCBidXR0b25cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKTtcblx0XHRcdHZhciBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICAgaWYobG9nKXtcblx0XHRcdFx0XHRcdGFsZXJ0KGxvZyk7XG5cdFx0XHRcdFx0fVxuICAgICAgfVxuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZW1lZXRpbmdcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vbWVldGluZ3NcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9tZWV0aW5nZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVibGFja291dFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ibGFja291dHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAvLyQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVncm91cHNlc3Npb25cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZ3JvdXBzZXNzaW9uc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIC8vbG9hZCBjdXN0b20gYnV0dG9uIG9uIHRoZSBkb21cbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdCgpO1xuXG4gIC8vYmluZCBzZXR0aW5ncyBidXR0b25zXG4gICQoJy5zZXR0aW5nc2J1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBrZXk6ICQodGhpcykuYXR0cignaWQnKSxcbiAgICB9O1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3NhdmVzZXR0aW5nJztcblxuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9hZG1pbi9zZXR0aW5ncycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIC8vYmluZCBuZXcgc2V0dGluZyBidXR0b25cbiAgJCgnI25ld3NldHRpbmcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBjaG9pY2UgPSBwcm9tcHQoXCJFbnRlciBhIG5hbWUgZm9yIHRoZSBuZXcgc2V0dGluZzpcIik7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBrZXk6IGNob2ljZSxcbiAgICB9O1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9uZXdzZXR0aW5nXCJcblxuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9hZG1pbi9zZXR0aW5ncycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2NyZWF0ZScsICcnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzLmpzIiwiLy9sb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2FkbWluLWx0ZScpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQnKTtcbnJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0LWJzJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG5cbi8vb3B0aW9ucyBmb3IgZGF0YXRhYmxlc1xuZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zID0ge1xuICBcInBhZ2VMZW5ndGhcIjogNTAsXG4gIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxufVxuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IG9uIGFsbCBkYXRhdGFibGVzIHBhZ2VzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBjdXN0b20gZGF0YXRhYmxlcyBvcHRpb25zXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICBvcHRpb25zIHx8IChvcHRpb25zID0gZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zKTtcbiAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKG9wdGlvbnMpO1xuICBzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG4gICQoJyNhZG1pbmx0ZS10b2dnbGVtZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ3NpZGViYXItb3BlbicpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBpZCAtIHRoZSBpZCBvZiB0aGUgaXRlbSB0byBiZSBzYXZlLWRldlxuICogQHBhcmFtIGxvYWRwaWN0dXJlIC0gdHJ1ZSB0byByZWxvYWQgYSBwcm9maWxlIHBpY3R1cmVcbiAqL1xuZXhwb3J0cy5hamF4c2F2ZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgaWQsIGxvYWRwaWN0dXJlKXtcbiAgbG9hZHBpY3R1cmUgfHwgKGxvYWRwaWN0dXJlID0gZmFsc2UpO1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJlc3BvbnNlLmRhdGEpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgICBpZihsb2FkcGljdHVyZSkgZXhwb3J0cy5sb2FkcGljdHVyZShpZCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gc2F2ZSB2aWEgQUpBWCBvbiBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIG1vZGFsIGVsZW1lbnQgdG8gY2xvc2VcbiAqL1xuZXhwb3J0cy5hamF4bW9kYWxzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBlbGVtZW50KXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAkKCcjdGFibGUnKS5EYXRhVGFibGUoKS5hamF4LnJlbG9hZCgpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIHBpY3R1cmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gaWQgLSB0aGUgdXNlciBJRCBvZiB0aGUgcGljdHVyZSB0byByZWxvYWRcbiAqL1xuZXhwb3J0cy5sb2FkcGljdHVyZSA9IGZ1bmN0aW9uKGlkKXtcbiAgd2luZG93LmF4aW9zLmdldCgnL3Byb2ZpbGUvcGljLycgKyBpZClcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKCcjcGljdGV4dCcpLnZhbChyZXNwb25zZS5kYXRhKTtcbiAgICAgICQoJyNwaWNpbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBwaWN0dXJlJywgJycsIGVycm9yKTtcbiAgICB9KVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvIGFmdGVyIGRlbGV0ZVxuICogQHBhcmFtIHNvZnQgLSBib29sZWFuIGlmIHRoaXMgaXMgYSBzb2Z0IGRlbGV0ZSBvciBub3RcbiAqL1xuZXhwb3J0cy5hamF4ZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgcmV0VXJsLCBzb2Z0ID0gZmFsc2Upe1xuICBpZihzb2Z0KXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gIH1lbHNle1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIGFsbCByZWxhdGVkIHJlY29yZHMuIFlvdSBjYW5ub3QgdW5kbyB0aGlzIGFjdGlvbi5cIik7XG4gIH1cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXRVcmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtIGZyb20gYSBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbGRlbGV0ZSA9IGZ1bmN0aW9uIChkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICAgJChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAkKCcjdGFibGUnKS5EYXRhVGFibGUoKS5hamF4LnJlbG9hZCgpO1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdkZWxldGUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXN0b3JlIGEgc29mdC1kZWxldGVkIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBpdGVtIHRvIGJlIHJlc3RvcmVkXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoYXQgaW5mb3JtYXRpb24gdG9cbiAqIEBwYXJhbSByZXRVcmwgLSB0aGUgVVJMIHRvIHJldHVybiB0b1xuICovXG5leHBvcnRzLmFqYXhyZXN0b3JlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCByZXRVcmwpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXRVcmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3Jlc3RvcmUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhdXRvY29tcGxldGUgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSBJRCBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHJlcXVlc3QgZGF0YSBmcm9tXG4gKi9cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICAkKCcjJyArIGlkICsgJ2F1dG8nKS5hdXRvY29tcGxldGUoe1xuXHQgICAgc2VydmljZVVybDogdXJsLFxuXHQgICAgYWpheFNldHRpbmdzOiB7XG5cdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHQgICAgfSxcbiAgICAgIG1pbkNoYXJzOiAzLFxuXHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdCAgICAgICAgJCgnIycgKyBpZCkudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgICAgJCgnIycgKyBpZCArICd0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBzdWdnZXN0aW9uLmRhdGEgKyBcIikgXCIgKyBzdWdnZXN0aW9uLnZhbHVlKTtcblx0ICAgIH0sXG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0ICAgICAgICAgICAgfSlcblx0ICAgICAgICB9O1xuXHQgICAgfVxuXHR9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2RlZ3JlZXByb2dyYW1yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IERlZ3JlZSBSZXF1aXJlbWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgb3JkZXJpbmc6ICQoJyNvcmRlcmluZycpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgaWYoJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICAgICAgICBkYXRhLmVsZWN0aXZlbGlzdF9pZCA9ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcmVxdWlyZW1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZWdyZWVyZXF1aXJlbWVudFwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5vbignc2hvd24uYnMubW9kYWwnLCBzaG93c2VsZWN0ZWQpO1xuXG4gICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL2RlZ3JlZXJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKCcjaWQnKS52YWwobWVzc2FnZS5kYXRhLmlkKTtcbiAgICAgICAgJCgnI3NlbWVzdGVyJykudmFsKG1lc3NhZ2UuZGF0YS5zZW1lc3Rlcik7XG4gICAgICAgICQoJyNvcmRlcmluZycpLnZhbChtZXNzYWdlLmRhdGEub3JkZXJpbmcpO1xuICAgICAgICAkKCcjY3JlZGl0cycpLnZhbChtZXNzYWdlLmRhdGEuY3JlZGl0cyk7XG4gICAgICAgICQoJyNub3RlcycpLnZhbChtZXNzYWdlLmRhdGEubm90ZXMpO1xuICAgICAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgICAgIGlmKG1lc3NhZ2UuZGF0YS50eXBlID09IFwiY291cnNlXCIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX25hbWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgfWVsc2UgaWYgKG1lc3NhZ2UuZGF0YS50eXBlID09IFwiZWxlY3RpdmVsaXN0XCIpe1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwobWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQgKyBcIikgXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X25hbWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuaGlkZSgpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcjZGVsZXRlJykuc2hvdygpO1xuICAgICAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSByZXF1aXJlbWVudCcsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICB9KTtcblxuICAkKCdpbnB1dFtuYW1lPXJlcXVpcmVhYmxlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnL2VsZWN0aXZlbGlzdHMvZWxlY3RpdmVsaXN0ZmVlZCcpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI3NlbWVzdGVyJykudmFsKFwiXCIpO1xuICAkKCcjb3JkZXJpbmcnKS52YWwoXCJcIik7XG4gICQoJyNjcmVkaXRzJykudmFsKFwiXCIpO1xuICAkKCcjbm90ZXMnKS52YWwoXCJcIik7XG4gICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2VsZWN0aXZlbGlzdGNvdXJzZXMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdFxcXCIgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV1cbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPkFkZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZWxlY3RpdmVsaXN0X2lkOiAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCksXG4gICAgICBjb3Vyc2VfcHJlZml4OiAkKCcjY291cnNlX3ByZWZpeCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWluX251bWJlciA9ICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWF4X251bWJlciA9ICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVlbGVjdGl2ZWNvdXJzZVwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpO1xuICB9KTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS52YWwoJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVjb3Vyc2UvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX3ByZWZpeCk7XG4gICAgICAgICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21pbl9udW1iZXIpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpO1xuICAgICAgICAgICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChcIlwiKTtcbiAgICAgICAgICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBlbGVjdGl2ZSBsaXN0IGNvdXJzZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgJCgnaW5wdXRbbmFtZT1yYW5nZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmFuZ2UyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZGV0YWlsLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9wbGFucmVxdWlyZW1lbnRzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnY3JlZGl0cyd9LFxuICAgIHsnZGF0YSc6ICdzZW1lc3Rlcid9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdub3Rlcyd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdFxcXCIgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV1cbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPk5ldyBQbGFuIFJlcXVpcmVtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICAgIHBsYW5faWQ6ICQoJyNwbGFuX2lkJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFucmVxdWlyZW1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI3BsYW5yZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXBsYW5yZXF1aXJlbWVudFwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjc2VtZXN0ZXInKS52YWwobWVzc2FnZS5kYXRhLnNlbWVzdGVyKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSByZXF1aXJlbWVudCcsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICB9KTtcblxuICAkKCdpbnB1dFtuYW1lPXJlcXVpcmVhYmxlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnL2VsZWN0aXZlbGlzdHMvZWxlY3RpdmVsaXN0ZmVlZCcpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI3NlbWVzdGVyJykudmFsKFwiXCIpO1xuICAkKCcjb3JkZXJpbmcnKS52YWwoXCJcIik7XG4gICQoJyNjcmVkaXRzJykudmFsKFwiXCIpO1xuICAkKCcjbm90ZXMnKS52YWwoXCJcIik7XG4gICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMjAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIGZyb20gdGhlIGZsYXNoZWQgc2Vzc2lvbiBkYXRhXG4gKlxuICogdXNlICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgnbWVzc2FnZScsIHRyYW5zKCdtZXNzYWdlcy5pdGVtX3NhdmVkJykpO1xuICogICAgICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgndHlwZScsICdzdWNjZXNzJyk7XG4gKiB0byBzZXQgbWVzc2FnZSB0ZXh0IGFuZCB0eXBlXG4gKi9cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKXtcblx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cImphdmFzY3JpcHRNZXNzYWdlXCIgY2xhc3M9XCJhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LScgKyB0eXBlICsgJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PC9idXR0b24+PHNwYW4gY2xhc3M9XCJoNFwiPicgKyBtZXNzYWdlICsgJzwvc3Bhbj48L2Rpdj4nO1xuXHQkKCcjbWVzc2FnZScpLmFwcGVuZChodG1sKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKFwiI2phdmFzY3JpcHRNZXNzYWdlXCIpLmFsZXJ0KCdjbG9zZScpO1xuXHR9LCAzMDAwKTtcbn07XG5cbi8qXG5leHBvcnRzLmFqYXhjcnNmID0gZnVuY3Rpb24oKXtcblx0JC5hamF4U2V0dXAoe1xuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG5cdFx0fVxuXHR9KTtcbn07XG4qL1xuXG4vKipcbiAqIENsZWFycyBlcnJvcnMgb24gZm9ybXMgYnkgcmVtb3ZpbmcgZXJyb3IgY2xhc3Nlc1xuICovXG5leHBvcnRzLmNsZWFyRm9ybUVycm9ycyA9IGZ1bmN0aW9uKCl7XG5cdCQoJy5mb3JtLWdyb3VwJykuZWFjaChmdW5jdGlvbiAoKXtcblx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFNldHMgZXJyb3JzIG9uIGZvcm1zIGJhc2VkIG9uIHJlc3BvbnNlIEpTT05cbiAqL1xuZXhwb3J0cy5zZXRGb3JtRXJyb3JzID0gZnVuY3Rpb24oanNvbil7XG5cdGV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdCQuZWFjaChqc29uLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdCQoJyMnICsga2V5KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKCcjJyArIGtleSArICdoZWxwJykudGV4dCh2YWx1ZS5qb2luKCcgJykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG1lc3NhZ2VzIGluIHRoZSBmbGFzaCBkYXRhLiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IGJ5IHRoZSBwYWdlXG4gKi9cbmV4cG9ydHMuY2hlY2tNZXNzYWdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCgnI21lc3NhZ2VfZmxhc2gnKS5sZW5ndGgpe1xuXHRcdHZhciBtZXNzYWdlID0gJCgnI21lc3NhZ2VfZmxhc2gnKS52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICQoJyNtZXNzYWdlX3R5cGVfZmxhc2gnKS52YWwoKTtcblx0XHRleHBvcnRzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIHR5cGUpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGVycm9ycyBmcm9tIEFKQVhcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gZXJyb3IgLSB0aGUgQXhpb3MgZXJyb3IgcmVjZWl2ZWRcbiAqL1xuZXhwb3J0cy5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGVsZW1lbnQsIGVycm9yKXtcblx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0ZXhwb3J0cy5zZXRGb3JtRXJyb3JzKGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gXCIgKyBtZXNzYWdlICsgXCI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0aWYoZWxlbWVudC5sZW5ndGggPiAwKXtcblx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCIvKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIGZvciBlZGl0YWJsZSB0ZXh0LWJveGVzIG9uIHRoZSBzaXRlXG4gKiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgLy9Mb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xuICByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG4gIHJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiXSwic291cmNlUm9vdCI6IiJ9