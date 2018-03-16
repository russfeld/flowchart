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
      number: $('#number').val(),
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
__webpack_require__(207);
module.exports = __webpack_require__(208);


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
  options2.columns = [{ 'data': 'id' }, { 'data': 'name' }, { 'data': 'number' }, { 'data': 'ordering' }, { 'data': 'id' }];
  options2.columnDefs = [{
    "targets": -1,
    "data": 'id',
    "render": function render(data, type, row, meta) {
      return "<a class=\"btn btn-primary btn-sm editsem\" href=\"/admin/plans/plansemester/" + data + "\" role=\"button\">Edit</a>";
    }
  }];
  $('#tablesem').DataTable(options2);

  $("div.newbutton2").html('<a type="button" class="btn btn-success" href="/admin/plans/newplansemester/' + id + '" id="new2">New Semester</a>');

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
      coursesForSemester: function coursesForSemester(plan, number) {
        return plan.filter(function (course) {
          return course.semester === number;
        });
      }
    },
    components: {
      draggable: draggable
    }
  });

  $('#addsemester').on('click', function () {
    var max = Math.max.apply(null, window.vm.semesters.map(function (a) {
      return a.number;
    }));
    var semester = {
      name: "New Semester",
      number: max + 1,
      ordering: window.vm.semesters.length + 1,
      courses: []
    };
    window.vm.semesters.push(semester);
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
  });

  loadData();

  $('#reset').on('click', loadData);
};

var loadData = function loadData() {
  var id = $('#id').val();
  window.axios.get('/flowcharts/semesters/' + id).then(function (response) {
    window.vm.semesters = response.data;
    for (i = 0; i < window.vm.semesters.length; i++) {
      Vue.set(window.vm.semesters[i], 'courses', new Array());
    }
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
    window.axios.get('/flowcharts/data/' + id).then(function (response) {
      $.each(response.data, function (index, value) {
        var semester = window.vm.semesters.find(function (element) {
          return element.number == value.semester;
        });
        semester.courses.push(value);
      });
    }).catch(function (error) {
      site.handleError('get data', '', error);
    });
  }).catch(function (error) {
    site.handleError('get data', '', error);
  });
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),

/***/ 207:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 208:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzcz82ZDEwIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9mbG93Y2hhcnQuc2NzcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiXSwibmFtZXMiOlsiZGFzaGJvYXJkIiwicmVxdWlyZSIsImV4cG9ydHMiLCJpbml0Iiwib3B0aW9ucyIsImRhdGFUYWJsZU9wdGlvbnMiLCJkb20iLCIkIiwiaHRtbCIsIm9uIiwiZGF0YSIsImZpcnN0X25hbWUiLCJ2YWwiLCJsYXN0X25hbWUiLCJlbWFpbCIsImFkdmlzb3JfaWQiLCJkZXBhcnRtZW50X2lkIiwiaWQiLCJlaWQiLCJsZW5ndGgiLCJ1cmwiLCJhamF4c2F2ZSIsInJldFVybCIsImFqYXhkZWxldGUiLCJhamF4cmVzdG9yZSIsInN1bW1lcm5vdGUiLCJmb2N1cyIsInRvb2xiYXIiLCJ0YWJzaXplIiwiY29kZW1pcnJvciIsIm1vZGUiLCJodG1sTW9kZSIsImxpbmVOdW1iZXJzIiwidGhlbWUiLCJmb3JtRGF0YSIsIkZvcm1EYXRhIiwiYXBwZW5kIiwiaXMiLCJmaWxlcyIsImRvY3VtZW50IiwiaW5wdXQiLCJudW1GaWxlcyIsImdldCIsImxhYmVsIiwicmVwbGFjZSIsInRyaWdnZXIiLCJldmVudCIsInBhcmVudHMiLCJmaW5kIiwibG9nIiwiYWxlcnQiLCJuYW1lIiwib2ZmaWNlIiwicGhvbmUiLCJhYmJyZXZpYXRpb24iLCJkZXNjcmlwdGlvbiIsImVmZmVjdGl2ZV95ZWFyIiwiZWZmZWN0aXZlX3NlbWVzdGVyIiwic3RhcnRfeWVhciIsInN0YXJ0X3NlbWVzdGVyIiwiZGVncmVlcHJvZ3JhbV9pZCIsInN0dWRlbnRfaWQiLCJjaG9pY2UiLCJjb25maXJtIiwiYWpheGF1dG9jb21wbGV0ZSIsIm51bWJlciIsIm9yZGVyaW5nIiwicGxhbl9pZCIsImNvdXJzZW51bWJlciIsInllYXIiLCJzZW1lc3RlciIsImJhc2lzIiwiZ3JhZGUiLCJjcmVkaXRzIiwic2VsZWN0ZWQiLCJzZWxlY3RlZFZhbCIsInRyYW5zZmVyIiwiaW5jb21pbmdfaW5zdGl0dXRpb24iLCJpbmNvbWluZ19uYW1lIiwiaW5jb21pbmdfZGVzY3JpcHRpb24iLCJpbmNvbWluZ19zZW1lc3RlciIsImluY29taW5nX2NyZWRpdHMiLCJpbmNvbWluZ19ncmFkZSIsInNob3dzZWxlY3RlZCIsInByb3AiLCJzaG93IiwiaGlkZSIsIkFwcCIsImFjdGlvbnMiLCJSb290Um91dGVDb250cm9sbGVyIiwiZ2V0SW5kZXgiLCJlZGl0YWJsZSIsInNpdGUiLCJjaGVja01lc3NhZ2UiLCJnZXRBYm91dCIsIkFkdmlzaW5nQ29udHJvbGxlciIsImNhbGVuZGFyIiwiR3JvdXBzZXNzaW9uQ29udHJvbGxlciIsImdldExpc3QiLCJncm91cHNlc3Npb24iLCJQcm9maWxlc0NvbnRyb2xsZXIiLCJwcm9maWxlIiwiRGFzaGJvYXJkQ29udHJvbGxlciIsIlN0dWRlbnRzQ29udHJvbGxlciIsImdldFN0dWRlbnRzIiwic3R1ZGVudGVkaXQiLCJnZXROZXdzdHVkZW50IiwiQWR2aXNvcnNDb250cm9sbGVyIiwiZ2V0QWR2aXNvcnMiLCJhZHZpc29yZWRpdCIsImdldE5ld2Fkdmlzb3IiLCJEZXBhcnRtZW50c0NvbnRyb2xsZXIiLCJnZXREZXBhcnRtZW50cyIsImRlcGFydG1lbnRlZGl0IiwiZ2V0TmV3ZGVwYXJ0bWVudCIsIk1lZXRpbmdzQ29udHJvbGxlciIsImdldE1lZXRpbmdzIiwibWVldGluZ2VkaXQiLCJCbGFja291dHNDb250cm9sbGVyIiwiZ2V0QmxhY2tvdXRzIiwiYmxhY2tvdXRlZGl0IiwiR3JvdXBzZXNzaW9uc0NvbnRyb2xsZXIiLCJnZXRHcm91cHNlc3Npb25zIiwiZ3JvdXBzZXNzaW9uZWRpdCIsIlNldHRpbmdzQ29udHJvbGxlciIsImdldFNldHRpbmdzIiwic2V0dGluZ3MiLCJEZWdyZWVwcm9ncmFtc0NvbnRyb2xsZXIiLCJnZXREZWdyZWVwcm9ncmFtcyIsImRlZ3JlZXByb2dyYW1lZGl0IiwiZ2V0RGVncmVlcHJvZ3JhbURldGFpbCIsImdldE5ld2RlZ3JlZXByb2dyYW0iLCJFbGVjdGl2ZWxpc3RzQ29udHJvbGxlciIsImdldEVsZWN0aXZlbGlzdHMiLCJlbGVjdGl2ZWxpc3RlZGl0IiwiZ2V0RWxlY3RpdmVsaXN0RGV0YWlsIiwiZ2V0TmV3ZWxlY3RpdmVsaXN0IiwiUGxhbnNDb250cm9sbGVyIiwiZ2V0UGxhbnMiLCJwbGFuZWRpdCIsImdldFBsYW5EZXRhaWwiLCJwbGFuZGV0YWlsIiwiZ2V0TmV3cGxhbiIsIlBsYW5zZW1lc3RlcnNDb250cm9sbGVyIiwiZ2V0UGxhblNlbWVzdGVyIiwicGxhbnNlbWVzdGVyZWRpdCIsImdldE5ld1BsYW5TZW1lc3RlciIsIkNvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyIiwiZ2V0Q29tcGxldGVkY291cnNlcyIsImNvbXBsZXRlZGNvdXJzZWVkaXQiLCJnZXROZXdjb21wbGV0ZWRjb3Vyc2UiLCJGbG93Y2hhcnRzQ29udHJvbGxlciIsImdldEZsb3djaGFydCIsImZsb3djaGFydCIsImNvbnRyb2xsZXIiLCJhY3Rpb24iLCJ3aW5kb3ciLCJfIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImhlYWQiLCJxdWVyeVNlbGVjdG9yIiwiY29udGVudCIsImNvbnNvbGUiLCJlcnJvciIsIm1vbWVudCIsImNhbGVuZGFyU2Vzc2lvbiIsImNhbGVuZGFyQWR2aXNvcklEIiwiY2FsZW5kYXJTdHVkZW50TmFtZSIsImNhbGVuZGFyRGF0YSIsImhlYWRlciIsImxlZnQiLCJjZW50ZXIiLCJyaWdodCIsImV2ZW50TGltaXQiLCJoZWlnaHQiLCJ3ZWVrZW5kcyIsImJ1c2luZXNzSG91cnMiLCJzdGFydCIsImVuZCIsImRvdyIsImRlZmF1bHRWaWV3Iiwidmlld3MiLCJhZ2VuZGEiLCJhbGxEYXlTbG90Iiwic2xvdER1cmF0aW9uIiwibWluVGltZSIsIm1heFRpbWUiLCJldmVudFNvdXJjZXMiLCJ0eXBlIiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsInJlbmRlcmluZyIsInRpbWVGb3JtYXQiLCJkYXRlUGlja2VyRGF0YSIsImRheXNPZldlZWtEaXNhYmxlZCIsImZvcm1hdCIsInN0ZXBwaW5nIiwiZW5hYmxlZEhvdXJzIiwibWF4SG91ciIsInNpZGVCeVNpZGUiLCJpZ25vcmVSZWFkb25seSIsImFsbG93SW5wdXRUb2dnbGUiLCJkYXRlUGlja2VyRGF0ZU9ubHkiLCJhZHZpc29yIiwibm9iaW5kIiwidHJpbSIsIndpZHRoIiwicmVtb3ZlQ2xhc3MiLCJyZXNldEZvcm0iLCJiaW5kIiwibmV3U3R1ZGVudCIsInJlc2V0IiwiZWFjaCIsInRleHQiLCJsb2FkQ29uZmxpY3RzIiwiZnVsbENhbGVuZGFyIiwiYXV0b2NvbXBsZXRlIiwic2VydmljZVVybCIsImFqYXhTZXR0aW5ncyIsImRhdGFUeXBlIiwib25TZWxlY3QiLCJzdWdnZXN0aW9uIiwidHJhbnNmb3JtUmVzdWx0IiwicmVzcG9uc2UiLCJzdWdnZXN0aW9ucyIsIm1hcCIsImRhdGFJdGVtIiwidmFsdWUiLCJkYXRldGltZXBpY2tlciIsImxpbmtEYXRlUGlja2VycyIsImV2ZW50UmVuZGVyIiwiZWxlbWVudCIsImFkZENsYXNzIiwiZXZlbnRDbGljayIsInZpZXciLCJzdHVkZW50bmFtZSIsInNob3dNZWV0aW5nRm9ybSIsInJlcGVhdCIsImJsYWNrb3V0U2VyaWVzIiwibW9kYWwiLCJzZWxlY3QiLCJjaGFuZ2UiLCJyZXBlYXRDaGFuZ2UiLCJzYXZlQmxhY2tvdXQiLCJkZWxldGVCbGFja291dCIsImJsYWNrb3V0T2NjdXJyZW5jZSIsIm9mZiIsImUiLCJjcmVhdGVNZWV0aW5nRm9ybSIsImNyZWF0ZUJsYWNrb3V0Rm9ybSIsInJlc29sdmVDb25mbGljdHMiLCJ0aXRsZSIsImlzQWZ0ZXIiLCJzdHVkZW50U2VsZWN0Iiwic2F2ZU1lZXRpbmciLCJkZWxldGVNZWV0aW5nIiwiY2hhbmdlRHVyYXRpb24iLCJyZXNldENhbGVuZGFyIiwiZGlzcGxheU1lc3NhZ2UiLCJhamF4U2F2ZSIsInBvc3QiLCJ0aGVuIiwiY2F0Y2giLCJoYW5kbGVFcnJvciIsImFqYXhEZWxldGUiLCJub1Jlc2V0Iiwibm9DaG9pY2UiLCJkZXNjIiwic3RhdHVzIiwibWVldGluZ2lkIiwic3R1ZGVudGlkIiwiZHVyYXRpb25PcHRpb25zIiwidW5kZWZpbmVkIiwiaG91ciIsIm1pbnV0ZSIsImNsZWFyRm9ybUVycm9ycyIsImVtcHR5IiwibWludXRlcyIsImRpZmYiLCJlbGVtMSIsImVsZW0yIiwiZHVyYXRpb24iLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJpbmRleCIsImFwcGVuZFRvIiwiYnN0YXJ0IiwiYmVuZCIsImJ0aXRsZSIsImJibGFja291dGV2ZW50aWQiLCJiYmxhY2tvdXRpZCIsImJyZXBlYXQiLCJicmVwZWF0ZXZlcnkiLCJicmVwZWF0dW50aWwiLCJicmVwZWF0d2Vla2RheXNtIiwiYnJlcGVhdHdlZWtkYXlzdCIsImJyZXBlYXR3ZWVrZGF5c3ciLCJicmVwZWF0d2Vla2RheXN1IiwiYnJlcGVhdHdlZWtkYXlzZiIsInBhcmFtcyIsImJsYWNrb3V0X2lkIiwicmVwZWF0X3R5cGUiLCJyZXBlYXRfZXZlcnkiLCJyZXBlYXRfdW50aWwiLCJyZXBlYXRfZGV0YWlsIiwiU3RyaW5nIiwiaW5kZXhPZiIsInByb21wdCIsIlZ1ZSIsIkVjaG8iLCJQdXNoZXIiLCJpb24iLCJzb3VuZCIsInNvdW5kcyIsInZvbHVtZSIsInBhdGgiLCJwcmVsb2FkIiwidXNlcklEIiwicGFyc2VJbnQiLCJncm91cFJlZ2lzdGVyQnRuIiwiZ3JvdXBEaXNhYmxlQnRuIiwidm0iLCJlbCIsInF1ZXVlIiwib25saW5lIiwibWV0aG9kcyIsImdldENsYXNzIiwicyIsInVzZXJpZCIsImluQXJyYXkiLCJ0YWtlU3R1ZGVudCIsImdpZCIsImN1cnJlbnRUYXJnZXQiLCJkYXRhc2V0IiwiYWpheFBvc3QiLCJwdXRTdHVkZW50IiwiZG9uZVN0dWRlbnQiLCJkZWxTdHVkZW50IiwiZW52IiwibG9nVG9Db25zb2xlIiwiYnJvYWRjYXN0ZXIiLCJrZXkiLCJwdXNoZXJLZXkiLCJjbHVzdGVyIiwicHVzaGVyQ2x1c3RlciIsImNvbm5lY3RvciIsInB1c2hlciIsImNvbm5lY3Rpb24iLCJjb25jYXQiLCJjaGVja0J1dHRvbnMiLCJpbml0aWFsQ2hlY2tEaW5nIiwic29ydCIsInNvcnRGdW5jdGlvbiIsImNoYW5uZWwiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImhyZWYiLCJqb2luIiwiaGVyZSIsInVzZXJzIiwibGVuIiwiaSIsInB1c2giLCJqb2luaW5nIiwidXNlciIsImxlYXZpbmciLCJzcGxpY2UiLCJmb3VuZCIsImNoZWNrRGluZyIsImZpbHRlciIsImRpc2FibGVCdXR0b24iLCJyZWFsbHkiLCJhdHRyIiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJmb3VuZE1lIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwiRGF0YVRhYmxlIiwidG9nZ2xlQ2xhc3MiLCJsb2FkcGljdHVyZSIsImFqYXhtb2RhbHNhdmUiLCJhamF4IiwicmVsb2FkIiwic29mdCIsImFqYXhtb2RhbGRlbGV0ZSIsIm1pbkNoYXJzIiwibWVzc2FnZSIsImRhdGFTcmMiLCJjb2x1bW5zIiwiY29sdW1uRGVmcyIsInJvdyIsIm1ldGEiLCJub3RlcyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsIm9wdGlvbnMyIiwiZHJhZ2dhYmxlIiwicGxhbiIsInNlbWVzdGVycyIsImNvdXJzZXNGb3JTZW1lc3RlciIsImNvdXJzZSIsImNvbXBvbmVudHMiLCJtYXgiLCJNYXRoIiwiYXBwbHkiLCJjb3Vyc2VzIiwiZG9jdW1lbnRFbGVtZW50Iiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsImxvYWREYXRhIiwic2V0IiwiQXJyYXkiLCJzZXRUaW1lb3V0Iiwic2V0Rm9ybUVycm9ycyIsImpzb24iLCJjbGljayIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBLGlFQUFpRTtBQUNqRSxxQkFBcUI7QUFDckI7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLFdBQVc7QUFDdEIsZUFBZSxpQ0FBaUM7QUFDaEQsaUJBQWlCLGlCQUFpQjtBQUNsQyxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsNkJBQTZCO0FBQzNDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsY0FBYztBQUM1QixXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXO0FBQ1gsR0FBRztBQUNILGdCQUFnQixZQUFZO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QixxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0QsU0FBUztBQUNULHVEQUF1RDtBQUN2RDtBQUNBLE9BQU87QUFDUCwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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TSxRQUFFLG1CQUFtQlUsRUFBckIsRUFBeUI4TixRQUF6QixDQUFrQyxRQUFsQztBQUNELEtBZEQ7QUFlRCxHQWhCRDtBQWlCRCxDQXRGRCxDIiwiZmlsZSI6Ii9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcbiAgICAgIGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2Fkdmlzb3JfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5hZHZpc29yX2lkID0gJCgnI2Fkdmlzb3JfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgZGF0YS5laWQgPSAkKCcjZWlkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3c3R1ZGVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9zdHVkZW50cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3YWR2aXNvclwiPk5ldyBBZHZpc29yPC9hPicpO1xuXG4gICQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKFwiaGlkZGVuXCIsICQoJyNoaWRkZW4nKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImRlcGFydG1lbnRfaWRcIiwgJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImVpZFwiLCAkKCcjZWlkJykudmFsKCkpO1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3YWR2aXNvcic7XG4gICAgfWVsc2V7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2Fkdmlzb3JzLycgKyBpZDtcbiAgICB9XG5cdFx0ZGFzaGJvYXJkLmFqYXhzYXZlKGZvcm1EYXRhLCB1cmwsIGlkLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0ID0gJCh0aGlzKSxcbiAgICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcbiAgICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG4gICAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcbiAgfSk7XG5cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKSxcbiAgICAgICAgICBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKCBpbnB1dC5sZW5ndGggKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKCBsb2cgKSBhbGVydChsb2cpO1xuICAgICAgfVxuXG4gIH0pO1xuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVwYXJ0bWVudFwiPk5ldyBEZXBhcnRtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgICBvZmZpY2U6ICQoJyNvZmZpY2UnKS52YWwoKSxcbiAgICAgIHBob25lOiAkKCcjcGhvbmUnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlcGFydG1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVwYXJ0bWVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXCI+TmV3IERlZ3JlZSBQcm9ncmFtPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV95ZWFyOiAkKCcjZWZmZWN0aXZlX3llYXInKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV9zZW1lc3RlcjogJCgnI2VmZmVjdGl2ZV9zZW1lc3RlcicpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVwcm9ncmFtcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2VsZWN0aXZlbGlzdFwiPk5ldyBFbGVjdGl2ZSBMaXN0PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWxpc3RzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdwbGFuXCI+TmV3IFBsYW48L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIHN0YXJ0X3llYXI6ICQoJyNzdGFydF95ZWFyJykudmFsKCksXG4gICAgICBzdGFydF9zZW1lc3RlcjogJCgnI3N0YXJ0X3NlbWVzdGVyJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW4nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVwb3B1bGF0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlcXVpcmVtZW50cyBhbmQgcmVwb3B1bGF0ZSB0aGVtIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBkZWdyZWUgcHJvZ3JhbS4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICAgdmFyIHVybCA9IFwiL2FkbWluL3BvcHVsYXRlcGxhblwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIG51bWJlcjogJCgnI251bWJlcicpLnZhbCgpLFxuICAgICAgb3JkZXJpbmc6ICQoJyNvcmRlcmluZycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zL25ld3BsYW5zZW1lc3Rlci8nICsgJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3Rlci8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3BsYW5zL2RlbGV0ZXBsYW5zZW1lc3Rlci9cIiArICQoJyNpZCcpLnZhbCgpIDtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnMvXCIgKyAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZVwiPk5ldyBDb21wbGV0ZWQgQ291cnNlPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGNvdXJzZW51bWJlcjogJCgnI2NvdXJzZW51bWJlcicpLnZhbCgpLFxuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIHllYXI6ICQoJyN5ZWFyJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBiYXNpczogJCgnI2Jhc2lzJykudmFsKCksXG4gICAgICBncmFkZTogJCgnI2dyYWRlJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgfTtcbiAgICBpZigkKCcjc3R1ZGVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLnN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ndHJhbnNmZXInXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLnRyYW5zZmVyID0gZmFsc2U7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGRhdGEudHJhbnNmZXIgPSB0cnVlO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfaW5zdGl0dXRpb24gPSAkKCcjaW5jb21pbmdfaW5zdGl0dXRpb24nKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX25hbWUgPSAkKCcjaW5jb21pbmdfbmFtZScpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfZGVzY3JpcHRpb24gPSAkKCcjaW5jb21pbmdfZGVzY3JpcHRpb24nKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX3NlbWVzdGVyID0gJCgnI2luY29taW5nX3NlbWVzdGVyJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19jcmVkaXRzID0gJCgnI2luY29taW5nX2NyZWRpdHMnKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2dyYWRlID0gJCgnI2luY29taW5nX2dyYWRlJykudmFsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3Y29tcGxldGVkY291cnNlJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2NvbXBsZXRlZGNvdXJzZXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVjb21wbGV0ZWRjb3Vyc2VcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vY29tcGxldGVkY291cnNlc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCdpbnB1dFtuYW1lPXRyYW5zZmVyXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbiAgaWYoJCgnI3RyYW5zZmVyY291cnNlJykuaXMoJzpoaWRkZW4nKSl7XG4gICAgJCgnI3RyYW5zZmVyMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgfWVsc2V7XG4gICAgJCgnI3RyYW5zZmVyMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgfVxuXG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSd0cmFuc2ZlciddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcja3N0YXRlY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjdHJhbnNmZXJjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI2tzdGF0ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI3RyYW5zZmVyY291cnNlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0LmpzIiwiLy9odHRwczovL2xhcmF2ZWwuY29tL2RvY3MvNS40L21peCN3b3JraW5nLXdpdGgtc2NyaXB0c1xuLy9odHRwczovL2FuZHktY2FydGVyLmNvbS9ibG9nL3Njb3BpbmctamF2YXNjcmlwdC1mdW5jdGlvbmFsaXR5LXRvLXNwZWNpZmljLXBhZ2VzLXdpdGgtbGFyYXZlbC1hbmQtY2FrZXBocFxuXG4vL0xvYWQgc2l0ZS13aWRlIGxpYnJhcmllcyBpbiBib290c3RyYXAgZmlsZVxucmVxdWlyZSgnLi9ib290c3RyYXAnKTtcblxudmFyIEFwcCA9IHtcblxuXHQvLyBDb250cm9sbGVyLWFjdGlvbiBtZXRob2RzXG5cdGFjdGlvbnM6IHtcblx0XHQvL0luZGV4IGZvciBkaXJlY3RseSBjcmVhdGVkIHZpZXdzIHdpdGggbm8gZXhwbGljaXQgY29udHJvbGxlclxuXHRcdFJvb3RSb3V0ZUNvbnRyb2xsZXI6IHtcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEFib3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcbiAgICB9LFxuXG5cdFx0Ly9BZHZpc2luZyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkdmlzaW5nXG5cdFx0QWR2aXNpbmdDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkdmlzaW5nL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vcGFnZXMvY2FsZW5kYXInKTtcblx0XHRcdFx0Y2FsZW5kYXIuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0dyb3Vwc2Vzc2lvbiBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2dyb3Vwc2Vzc2lvblxuICAgIEdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXI6IHtcblx0XHRcdC8vZ3JvdXBzZXNzaW9uL2luZGV4XG4gICAgICBnZXRJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcbiAgICAgIH0sXG5cdFx0XHQvL2dyb3Vwc2VzaW9uL2xpc3Rcblx0XHRcdGdldExpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uID0gcmVxdWlyZSgnLi9wYWdlcy9ncm91cHNlc3Npb24nKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdC8vUHJvZmlsZXMgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9wcm9maWxlXG5cdFx0UHJvZmlsZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL3Byb2ZpbGUvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHByb2ZpbGUgPSByZXF1aXJlKCcuL3BhZ2VzL3Byb2ZpbGUnKTtcblx0XHRcdFx0cHJvZmlsZS5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vRGFzaGJvYXJkIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWRtaW4tbHRlXG5cdFx0RGFzaGJvYXJkQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi91dGlsL2Rhc2hib2FyZCcpO1xuXHRcdFx0XHRkYXNoYm9hcmQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0U3R1ZGVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3N0dWRlbnRzXG5cdFx0XHRnZXRTdHVkZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld3N0dWRlbnRcblx0XHRcdGdldE5ld3N0dWRlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3R1ZGVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdCcpO1xuXHRcdFx0XHRzdHVkZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRBZHZpc29yc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vYWR2aXNvcnNcblx0XHRcdGdldEFkdmlzb3JzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3YWR2aXNvclxuXHRcdFx0Z2V0TmV3YWR2aXNvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhZHZpc29yZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0Jyk7XG5cdFx0XHRcdGFkdmlzb3JlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdERlcGFydG1lbnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZXBhcnRtZW50c1xuXHRcdFx0Z2V0RGVwYXJ0bWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZXBhcnRtZW50XG5cdFx0XHRnZXROZXdkZXBhcnRtZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlcGFydG1lbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQnKTtcblx0XHRcdFx0ZGVwYXJ0bWVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0TWVldGluZ3NDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL21lZXRpbmdzXG5cdFx0XHRnZXRNZWV0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBtZWV0aW5nZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0Jyk7XG5cdFx0XHRcdG1lZXRpbmdlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEJsYWNrb3V0c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vYmxhY2tvdXRzXG5cdFx0XHRnZXRCbGFja291dHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYmxhY2tvdXRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0Jyk7XG5cdFx0XHRcdGJsYWNrb3V0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRHcm91cHNlc3Npb25zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ncm91cHNlc3Npb25zXG5cdFx0XHRnZXRHcm91cHNlc3Npb25zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0Jyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0U2V0dGluZ3NDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3NldHRpbmdzXG5cdFx0XHRnZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzJyk7XG5cdFx0XHRcdHNldHRpbmdzLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdERlZ3JlZXByb2dyYW1zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtc1xuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtL3tpZH1cblx0XHRcdGdldERlZ3JlZXByb2dyYW1EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsJyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2RlZ3JlZXByb2dyYW06IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRFbGVjdGl2ZWxpc3RzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtc1xuXHRcdFx0Z2V0RWxlY3RpdmVsaXN0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RWxlY3RpdmVsaXN0RGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXG5cdFx0XHRnZXROZXdlbGVjdGl2ZWxpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRQbGFuc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vcGxhbnNcblx0XHRcdGdldFBsYW5zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vcGxhbi97aWR9XG5cdFx0XHRnZXRQbGFuRGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5kZXRhaWwgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsJyk7XG5cdFx0XHRcdHBsYW5kZXRhaWwuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhblxuXHRcdFx0Z2V0TmV3cGxhbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0Jyk7XG5cdFx0XHRcdHBsYW5lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zZW1lc3RlcnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3BsYW5zZW1lc3RlclxuXHRcdFx0Z2V0UGxhblNlbWVzdGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5zZW1lc3RlcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0Jyk7XG5cdFx0XHRcdHBsYW5zZW1lc3RlcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhbnNlbWVzdGVyXG5cdFx0XHRnZXROZXdQbGFuU2VtZXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbnNlbWVzdGVyZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQnKTtcblx0XHRcdFx0cGxhbnNlbWVzdGVyZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXG5cdFx0XHRnZXRDb21wbGV0ZWRjb3Vyc2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNvbXBsZXRlZGNvdXJzZWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0Jyk7XG5cdFx0XHRcdGNvbXBsZXRlZGNvdXJzZWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXG5cdFx0XHRnZXROZXdjb21wbGV0ZWRjb3Vyc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRGbG93Y2hhcnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9mbG93Y2hhcnRzL3ZpZXcvXG5cdFx0XHRnZXRGbG93Y2hhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZmxvd2NoYXJ0ID0gcmVxdWlyZSgnLi9wYWdlcy9mbG93Y2hhcnQnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3aW5kb3cuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgalF1ZXJ5IGFuZCB0aGUgQm9vdHN0cmFwIGpRdWVyeSBwbHVnaW4gd2hpY2ggcHJvdmlkZXMgc3VwcG9ydFxuICogZm9yIEphdmFTY3JpcHQgYmFzZWQgQm9vdHN0cmFwIGZlYXR1cmVzIHN1Y2ggYXMgbW9kYWxzIGFuZCB0YWJzLiBUaGlzXG4gKiBjb2RlIG1heSBiZSBtb2RpZmllZCB0byBmaXQgdGhlIHNwZWNpZmljIG5lZWRzIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKi9cblxud2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgdGhlIGF4aW9zIEhUVFAgbGlicmFyeSB3aGljaCBhbGxvd3MgdXMgdG8gZWFzaWx5IGlzc3VlIHJlcXVlc3RzXG4gKiB0byBvdXIgTGFyYXZlbCBiYWNrLWVuZC4gVGhpcyBsaWJyYXJ5IGF1dG9tYXRpY2FsbHkgaGFuZGxlcyBzZW5kaW5nIHRoZVxuICogQ1NSRiB0b2tlbiBhcyBhIGhlYWRlciBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIFwiWFNSRlwiIHRva2VuIGNvb2tpZS5cbiAqL1xuXG53aW5kb3cuYXhpb3MgPSByZXF1aXJlKCdheGlvcycpO1xuXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9yYXBwYXNvZnQvbGFyYXZlbC01LWJvaWxlcnBsYXRlL2Jsb2IvbWFzdGVyL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzXG53aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbi8qKlxuICogTmV4dCB3ZSB3aWxsIHJlZ2lzdGVyIHRoZSBDU1JGIFRva2VuIGFzIGEgY29tbW9uIGhlYWRlciB3aXRoIEF4aW9zIHNvIHRoYXRcbiAqIGFsbCBvdXRnb2luZyBIVFRQIHJlcXVlc3RzIGF1dG9tYXRpY2FsbHkgaGF2ZSBpdCBhdHRhY2hlZC4gVGhpcyBpcyBqdXN0XG4gKiBhIHNpbXBsZSBjb252ZW5pZW5jZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGF0dGFjaCBldmVyeSB0b2tlbiBtYW51YWxseS5cbiAqL1xuXG5sZXQgdG9rZW4gPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKTtcblxuaWYgKHRva2VuKSB7XG4gICAgd2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUNTUkYtVE9LRU4nXSA9IHRva2VuLmNvbnRlbnQ7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NTUkYgdG9rZW4gbm90IGZvdW5kOiBodHRwczovL2xhcmF2ZWwuY29tL2RvY3MvY3NyZiNjc3JmLXgtY3NyZi10b2tlbicpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCIvL2xvYWQgcmVxdWlyZWQgSlMgbGlicmFyaWVzXG5yZXF1aXJlKCdmdWxsY2FsZW5kYXInKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcbnZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdlb25hc2Rhbi1ib290c3RyYXAtZGF0ZXRpbWVwaWNrZXItcnVzc2ZlbGQnKTtcbnZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4uL3V0aWwvZWRpdGFibGUnKTtcblxuLy9TZXNzaW9uIGZvciBzdG9yaW5nIGRhdGEgYmV0d2VlbiBmb3Jtc1xuZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblxuLy9JRCBvZiB0aGUgY3VycmVudGx5IGxvYWRlZCBjYWxlbmRhcidzIGFkdmlzb3JcbmV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAtMTtcblxuLy9TdHVkZW50J3MgTmFtZSBzZXQgYnkgaW5pdFxuZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gXCJcIjtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuZXhwb3J0cy5jYWxlbmRhckRhdGEgPSB7XG5cdGhlYWRlcjoge1xuXHRcdGxlZnQ6ICdwcmV2LG5leHQgdG9kYXknLFxuXHRcdGNlbnRlcjogJ3RpdGxlJyxcblx0XHRyaWdodDogJ2FnZW5kYVdlZWssYWdlbmRhRGF5J1xuXHR9LFxuXHRlZGl0YWJsZTogZmFsc2UsXG5cdGV2ZW50TGltaXQ6IHRydWUsXG5cdGhlaWdodDogJ2F1dG8nLFxuXHR3ZWVrZW5kczogZmFsc2UsXG5cdGJ1c2luZXNzSG91cnM6IHtcblx0XHRzdGFydDogJzg6MDAnLCAvLyBhIHN0YXJ0IHRpbWUgKDEwYW0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGVuZDogJzE3OjAwJywgLy8gYW4gZW5kIHRpbWUgKDZwbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZG93OiBbIDEsIDIsIDMsIDQsIDUgXVxuXHR9LFxuXHRkZWZhdWx0VmlldzogJ2FnZW5kYVdlZWsnLFxuXHR2aWV3czoge1xuXHRcdGFnZW5kYToge1xuXHRcdFx0YWxsRGF5U2xvdDogZmFsc2UsXG5cdFx0XHRzbG90RHVyYXRpb246ICcwMDoyMDowMCcsXG5cdFx0XHRtaW5UaW1lOiAnMDg6MDA6MDAnLFxuXHRcdFx0bWF4VGltZTogJzE3OjAwOjAwJ1xuXHRcdH1cblx0fSxcblx0ZXZlbnRTb3VyY2VzOiBbXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL21lZXRpbmdmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgbWVldGluZyBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnIzUxMjg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICd3aGl0ZScsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvYmxhY2tvdXRmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgYmxhY2tvdXQgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyNGRjg4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnYmxhY2snLFxuXHRcdH0sXG5cdF0sXG5cdHNlbGVjdGFibGU6IHRydWUsXG5cdHNlbGVjdEhlbHBlcjogdHJ1ZSxcblx0c2VsZWN0T3ZlcmxhcDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRyZXR1cm4gZXZlbnQucmVuZGVyaW5nID09PSAnYmFja2dyb3VuZCc7XG5cdH0sXG5cdHRpbWVGb3JtYXQ6ICcgJyxcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlXG5leHBvcnRzLmRhdGVQaWNrZXJEYXRhID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ0xMTCcsXG5cdFx0c3RlcHBpbmc6IDIwLFxuXHRcdGVuYWJsZWRIb3VyczogWzgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxN10sXG5cdFx0bWF4SG91cjogMTcsXG5cdFx0c2lkZUJ5U2lkZTogdHJ1ZSxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZSBkYXkgb25seVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTU0vREQvWVlZWScsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLyoqXG4gKiBJbml0aWFsemF0aW9uIGZ1bmN0aW9uIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gYWR2aXNvciAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgdXNlciBpcyBhbiBhZHZpc29yXG4gKiBAcGFyYW0gbm9iaW5kIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSBidXR0b25zIHNob3VsZCBub3QgYmUgYm91bmQgKG1ha2UgY2FsZW5kYXIgcmVhZC1vbmx5KVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vQ2hlY2sgZm9yIG1lc3NhZ2VzIGluIHRoZSBzZXNzaW9uIGZyb20gYSBwcmV2aW91cyBhY3Rpb25cblx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuXHQvL2luaXRhbGl6ZSBlZGl0YWJsZSBlbGVtZW50c1xuXHRlZGl0YWJsZS5pbml0KCk7XG5cblx0Ly90d2VhayBwYXJhbWV0ZXJzXG5cdHdpbmRvdy5hZHZpc29yIHx8ICh3aW5kb3cuYWR2aXNvciA9IGZhbHNlKTtcblx0d2luZG93Lm5vYmluZCB8fCAod2luZG93Lm5vYmluZCA9IGZhbHNlKTtcblxuXHQvL2dldCB0aGUgY3VycmVudCBhZHZpc29yJ3MgSURcblx0ZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9ICQoJyNjYWxlbmRhckFkdmlzb3JJRCcpLnZhbCgpLnRyaW0oKTtcblxuXHQvL1NldCB0aGUgYWR2aXNvciBpbmZvcm1hdGlvbiBmb3IgbWVldGluZyBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzBdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vU2V0IHRoZSBhZHZzaW9yIGluZm9yYW10aW9uIGZvciBibGFja291dCBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vaWYgdGhlIHdpbmRvdyBpcyBzbWFsbCwgc2V0IGRpZmZlcmVudCBkZWZhdWx0IGZvciBjYWxlbmRhclxuXHRpZigkKHdpbmRvdykud2lkdGgoKSA8IDYwMCl7XG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZGVmYXVsdFZpZXcgPSAnYWdlbmRhRGF5Jztcblx0fVxuXG5cdC8vSWYgbm9iaW5kLCBkb24ndCBiaW5kIHRoZSBmb3Jtc1xuXHRpZighd2luZG93Lm5vYmluZCl7XG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIGFuIGFkdmlzb3IsIGJpbmQgbW9yZSBkYXRhXG5cdFx0aWYod2luZG93LmFkdmlzb3Ipe1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjdGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNlbmQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNlbmRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2Jykuc2hvdygpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLnNob3coKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cblx0XHRcdC8vYmluZCBtZXRob2RzIGZvciBidXR0b25zIGFuZCBmb3Jtc1xuXHRcdFx0JCgnI25ld1N0dWRlbnRCdXR0b24nKS5iaW5kKCdjbGljaycsIG5ld1N0dWRlbnQpO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNidGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0XHRcdCAgICAkKHRoaXMpLmZpbmQoJy5oYXMtZXJyb3InKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykudGV4dCgnJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL2JpbmQgYXV0b2NvbXBsZXRlIGZpZWxkXG5cdFx0XHQkKCcjc3R1ZGVudGlkJykuYXV0b2NvbXBsZXRlKHtcblx0XHRcdCAgICBzZXJ2aWNlVXJsOiAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnLFxuXHRcdFx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHRcdFx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0XHRcdCAgICAgICAgJCgnI3N0dWRlbnRpZHZhbCcpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0ICAgICAgICByZXR1cm4ge1xuXHRcdFx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdFx0XHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdFx0XHQgICAgICAgICAgICB9KVxuXHRcdFx0ICAgICAgICB9O1xuXHRcdFx0ICAgIH1cblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjc3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI3N0YXJ0JywgJyNlbmQnLCAnI2R1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnN0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2JlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjYnN0YXJ0JywgJyNiZW5kJywgJyNiZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNicmVwZWF0dW50aWxfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5KTtcblxuXHRcdFx0Ly9jaGFuZ2UgcmVuZGVyaW5nIG9mIGV2ZW50c1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0XHRcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1jbGlja2FibGVcIik7XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAnbScpe1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWQnKS52YWwoZXZlbnQuc3R1ZGVudG5hbWUpO1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0fWVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRcdGV2ZW50OiBldmVudFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYoZXZlbnQucmVwZWF0ID09ICcwJyl7XG5cdFx0XHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdFx0XHRlbmQ6IGVuZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvL2JpbmQgbW9yZSBidXR0b25zXG5cdFx0XHQkKCcjYnJlcGVhdCcpLmNoYW5nZShyZXBlYXRDaGFuZ2UpO1xuXG5cdFx0XHQkKCcjc2F2ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0U2VyaWVzJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dE9jY3VycmVuY2UnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0T2NjdXJyZW5jZSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNhZHZpc2luZ0J1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZU1lZXRpbmdCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9mZignaGlkZGVuLmJzLm1vZGFsJyk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0QnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdCQoJyNyZXNvbHZlQnV0dG9uJykub24oJ2NsaWNrJywgcmVzb2x2ZUNvbmZsaWN0cyk7XG5cblx0XHRcdGxvYWRDb25mbGljdHMoKTtcblxuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBub3QgYW4gYWR2aXNvciwgYmluZCBsZXNzIGRhdGFcblx0XHR9ZWxzZXtcblxuXHRcdFx0Ly9HZXQgdGhlIGN1cnJlbnQgc3R1ZGVudCdzIG5hbWVcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9ICQoJyNjYWxlbmRhclN0dWRlbnROYW1lJykudmFsKCkudHJpbSgpO1xuXG5cdFx0ICAvL1JlbmRlciBibGFja291dHMgdG8gYmFja2dyb3VuZFxuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcblxuXHRcdCAgLy9XaGVuIHJlbmRlcmluZywgdXNlIHRoaXMgY3VzdG9tIGZ1bmN0aW9uIGZvciBibGFja291dHMgYW5kIHN0dWRlbnQgbWVldGluZ3Ncblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdFx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHRcdCAgICB9XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdFx0ICAgIH1cblx0XHRcdH07XG5cblx0XHQgIC8vVXNlIHRoaXMgbWV0aG9kIGZvciBjbGlja2luZyBvbiBtZWV0aW5nc1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdFx0XHRcdGlmKGV2ZW50LnN0YXJ0LmlzQWZ0ZXIobW9tZW50KCkpKXtcblx0XHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydChcIllvdSBjYW5ub3QgZWRpdCBtZWV0aW5ncyBpbiB0aGUgcGFzdFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHQgIC8vV2hlbiBzZWxlY3RpbmcgbmV3IGFyZWFzLCB1c2UgdGhlIHN0dWRlbnRTZWxlY3QgbWV0aG9kIGluIHRoZSBjYWxlbmRhciBsaWJyYXJ5XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBzdHVkZW50U2VsZWN0O1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjZGVzYycpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0X3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoXCIjZW5kXCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI2VuZF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcubW9kYWwnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblx0XHR9XG5cblx0XHQvL0JpbmQgY2xpY2sgaGFuZGxlcnMgb24gdGhlIGZvcm1cblx0XHQkKCcjc2F2ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZU1lZXRpbmcpO1xuXHRcdCQoJyNkZWxldGVCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZU1lZXRpbmcpO1xuXHRcdCQoJyNkdXJhdGlvbicpLm9uKCdjaGFuZ2UnLCBjaGFuZ2VEdXJhdGlvbik7XG5cblx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycyB3aXRoIG5vIGJpbmRpbmdcblx0fWVsc2V7XG5cdFx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycywgc2V0IHJlbmRlcmluZyB0byBiYWNrZ3JvdW5kXG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3RhYmxlID0gZmFsc2U7XG5cbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHQgICAgfVxuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdCAgICB9XG5cdFx0fTtcblx0fVxuXG5cdC8vaW5pdGFsaXplIHRoZSBjYWxlbmRhciFcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKGV4cG9ydHMuY2FsZW5kYXJEYXRhKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBjYWxlbmRhciBieSBjbG9zaW5nIG1vZGFscyBhbmQgcmVsb2FkaW5nIGRhdGFcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBqUXVlcnkgaWRlbnRpZmllciBvZiB0aGUgZm9ybSB0byBoaWRlIChhbmQgdGhlIHNwaW4pXG4gKiBAcGFyYW0gcmVwb25zZSAtIHRoZSBBeGlvcyByZXBzb25zZSBvYmplY3QgcmVjZWl2ZWRcbiAqL1xudmFyIHJlc2V0Q2FsZW5kYXIgPSBmdW5jdGlvbihlbGVtZW50LCByZXNwb25zZSl7XG5cdC8vaGlkZSB0aGUgZm9ybVxuXHQkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9kaXNwbGF5IHRoZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG5cdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXG5cdC8vcmVmcmVzaCB0aGUgY2FsZW5kYXJcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0aWYod2luZG93LmFkdmlzb3Ipe1xuXHRcdGxvYWRDb25mbGljdHMoKTtcblx0fVxufVxuXG4vKipcbiAqIEFKQVggbWV0aG9kIHRvIHNhdmUgZGF0YSBmcm9tIGEgZm9ybVxuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIHNvdXJjZSBlbGVtZW50IG9mIHRoZSBkYXRhXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4U2F2ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uKXtcblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0ICAvL2lmIHJlc3BvbnNlIGlzIDJ4eFxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdH0pXG5cdFx0Ly9pZiByZXNwb25zZSBpcyBub3QgMnh4XG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0fSk7XG59XG5cbnZhciBhamF4RGVsZXRlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24sIG5vUmVzZXQsIG5vQ2hvaWNlKXtcblx0Ly9jaGVjayBub1Jlc2V0IHZhcmlhYmxlXG5cdG5vUmVzZXQgfHwgKG5vUmVzZXQgPSBmYWxzZSk7XG5cdG5vQ2hvaWNlIHx8IChub0Nob2ljZSA9IGZhbHNlKTtcblxuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uXG5cdGlmKCFub0Nob2ljZSl7XG5cdFx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHR9ZWxzZXtcblx0XHR2YXIgY2hvaWNlID0gdHJ1ZTtcblx0fVxuXG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cblx0XHQvL2lmIGNvbmZpcm1lZCwgc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL21ha2UgQUpBWCByZXF1ZXN0IHRvIGRlbGV0ZVxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYobm9SZXNldCl7XG5cdFx0XHRcdFx0Ly9oaWRlIHBhcmVudCBlbGVtZW50IC0gVE9ETyBURVNUTUVcblx0XHRcdFx0XHQvL2NhbGxlci5wYXJlbnQoKS5wYXJlbnQoKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50KS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2F2ZSBhIG1lZXRpbmdcbiAqL1xudmFyIHNhdmVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUV2ZW50c3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdHN0YXJ0OiBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdGVuZDogbW9tZW50KCQoJyNlbmQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0dGl0bGU6ICQoJyN0aXRsZScpLnZhbCgpLFxuXHRcdGRlc2M6ICQoJyNkZXNjJykudmFsKCksXG5cdFx0c3RhdHVzOiAkKCcjc3RhdHVzJykudmFsKClcblx0fTtcblx0ZGF0YS5pZCA9IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQ7XG5cdGlmKCQoJyNtZWV0aW5nSUQnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEubWVldGluZ2lkID0gJCgnI21lZXRpbmdJRCcpLnZhbCgpO1xuXHR9XG5cdGlmKCQoJyNzdHVkZW50aWR2YWwnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEuc3R1ZGVudGlkID0gJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpO1xuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZW1lZXRpbmcnO1xuXG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnc2F2ZSBtZWV0aW5nJyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgdXJsXG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogJCgnI21lZXRpbmdJRCcpLnZhbCgpXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnZGVsZXRlIG1lZXRpbmcnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHBvcHVsYXRlIGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGVkaXRpbmdcbiAqXG4gKiBAcGFyYW0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gZWRpdFxuICovXG52YXIgc2hvd01lZXRpbmdGb3JtID0gZnVuY3Rpb24oZXZlbnQpe1xuXHQkKCcjdGl0bGUnKS52YWwoZXZlbnQudGl0bGUpO1xuXHQkKCcjc3RhcnQnKS52YWwoZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2VuZCcpLnZhbChldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2Rlc2MnKS52YWwoZXZlbnQuZGVzYyk7XG5cdGR1cmF0aW9uT3B0aW9ucyhldmVudC5zdGFydCwgZXZlbnQuZW5kKTtcblx0JCgnI21lZXRpbmdJRCcpLnZhbChldmVudC5pZCk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdCQoJyNzdGF0dXMnKS52YWwoZXZlbnQuc3RhdHVzKTtcblx0JCgnI2RlbGV0ZUJ1dHRvbicpLnNob3coKTtcblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgY3JlYXRpb25cbiAqXG4gKiBAcGFyYW0gY2FsZW5kYXJTdHVkZW50TmFtZSAtIHN0cmluZyBuYW1lIG9mIHRoZSBzdHVkZW50XG4gKi9cbnZhciBjcmVhdGVNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGNhbGVuZGFyU3R1ZGVudE5hbWUpe1xuXG5cdC8vcG9wdWxhdGUgdGhlIHRpdGxlIGF1dG9tYXRpY2FsbHkgZm9yIGEgc3R1ZGVudFxuXHRpZihjYWxlbmRhclN0dWRlbnROYW1lICE9PSB1bmRlZmluZWQpe1xuXHRcdCQoJyN0aXRsZScpLnZhbChjYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fWVsc2V7XG5cdFx0JCgnI3RpdGxlJykudmFsKCcnKTtcblx0fVxuXG5cdC8vU2V0IHN0YXJ0IHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3N0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjc3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGVuZCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2VuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGR1cmF0aW9uIG9wdGlvbnNcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0ZHVyYXRpb25PcHRpb25zKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLCBtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkpO1xuXHR9ZWxzZXtcblx0XHRkdXJhdGlvbk9wdGlvbnMoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQsIGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCk7XG5cdH1cblxuXHQvL1Jlc2V0IG90aGVyIG9wdGlvbnNcblx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdC8vSGlkZSBkZWxldGUgYnV0dG9uXG5cdCQoJyNkZWxldGVCdXR0b24nKS5oaWRlKCk7XG5cblx0Ly9TaG93IHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gb24gdGhpcyBwYWdlXG4gKi9cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICAkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzZXQgZHVyYXRpb24gb3B0aW9ucyBmb3IgdGhlIG1lZXRpbmcgZm9ybVxuICpcbiAqIEBwYXJhbSBzdGFydCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IHRpbWVcbiAqIEBwYXJhbSBlbmQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmRpbmcgdGltZVxuICovXG52YXIgZHVyYXRpb25PcHRpb25zID0gZnVuY3Rpb24oc3RhcnQsIGVuZCl7XG5cdC8vY2xlYXIgdGhlIGxpc3Rcblx0JCgnI2R1cmF0aW9uJykuZW1wdHkoKTtcblxuXHQvL2Fzc3VtZSBhbGwgbWVldGluZ3MgaGF2ZSByb29tIGZvciAyMCBtaW51dGVzXG5cdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzIwJz4yMCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjIwLCBhbGxvdyA0MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAyMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzQwJz40MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MDAsIGFsbG93IDYwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc2MCc+NjAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vc2V0IGRlZmF1bHQgdmFsdWUgYmFzZWQgb24gZ2l2ZW4gc3BhblxuXHQkKCcjZHVyYXRpb24nKS52YWwoZW5kLmRpZmYoc3RhcnQsIFwibWludXRlc1wiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxpbmsgdGhlIGRhdGVwaWNrZXJzIHRvZ2V0aGVyXG4gKlxuICogQHBhcmFtIGVsZW0xIC0galF1ZXJ5IG9iamVjdCBmb3IgZmlyc3QgZGF0ZXBpY2tlclxuICogQHBhcmFtIGVsZW0yIC0galF1ZXJ5IG9iamVjdCBmb3Igc2Vjb25kIGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBsaW5rRGF0ZVBpY2tlcnMgPSBmdW5jdGlvbihlbGVtMSwgZWxlbTIsIGR1cmF0aW9uKXtcblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gZmlyc3QgZGF0YXBpY2tlclxuXHQkKGVsZW0xICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMiA9IG1vbWVudCgkKGVsZW0yKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0FmdGVyKGRhdGUyKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUyKSl7XG5cdFx0XHRkYXRlMiA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMikudmFsKGRhdGUyLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBzZWNvbmQgZGF0ZXBpY2tlclxuXHQkKGVsZW0yICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMSA9IG1vbWVudCgkKGVsZW0xKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0JlZm9yZShkYXRlMSkgfHwgZS5kYXRlLmlzU2FtZShkYXRlMSkpe1xuXHRcdFx0ZGF0ZTEgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTEpLnZhbChkYXRlMS5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGNoYW5nZUR1cmF0aW9uID0gZnVuY3Rpb24oKXtcblx0dmFyIG5ld0RhdGUgPSBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksICdMTEwnKS5hZGQoJCh0aGlzKS52YWwoKSwgXCJtaW51dGVzXCIpO1xuXHQkKCcjZW5kJykudmFsKG5ld0RhdGUuZm9ybWF0KFwiTExMXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmVyaWZ5IHRoYXQgdGhlIHN0dWRlbnRzIGFyZSBzZWxlY3RpbmcgbWVldGluZ3MgdGhhdCBhcmVuJ3QgdG9vIGxvbmdcbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgb2YgdGhlIG1lZXRpbmdcbiAqIEBwYXJhbSBlbmQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBzdHVkZW50U2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXG5cdC8vV2hlbiBzdHVkZW50cyBzZWxlY3QgYSBtZWV0aW5nLCBkaWZmIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzXG5cdGlmKGVuZC5kaWZmKHN0YXJ0LCAnbWludXRlcycpID4gNjApe1xuXG5cdFx0Ly9pZiBpbnZhbGlkLCB1bnNlbGVjdCBhbmQgc2hvdyBhbiBlcnJvclxuXHRcdGFsZXJ0KFwiTWVldGluZ3MgY2Fubm90IGxhc3QgbG9uZ2VyIHRoYW4gMSBob3VyXCIpO1xuXHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0fWVsc2V7XG5cblx0XHQvL2lmIHZhbGlkLCBzZXQgZGF0YSBpbiB0aGUgc2Vzc2lvbiBhbmQgc2hvdyB0aGUgZm9ybVxuXHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0ZW5kOiBlbmRcblx0XHR9O1xuXHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdGNyZWF0ZU1lZXRpbmdGb3JtKGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1cbn07XG5cbi8qKlxuICogTG9hZCBjb25mbGljdGluZyBtZWV0aW5ncyBmcm9tIHRoZSBzZXJ2ZXJcbiAqL1xudmFyIGxvYWRDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXG5cdC8vcmVxdWVzdCBjb25mbGljdHMgdmlhIEFKQVhcblx0d2luZG93LmF4aW9zLmdldCgnL2FkdmlzaW5nL2NvbmZsaWN0cycpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXG5cdFx0XHQvL2Rpc2FibGUgZXhpc3RpbmcgY2xpY2sgaGFuZGxlcnNcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgMjAwLCBkYXRhIHdhcyByZWNlaXZlZFxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IDIwMCl7XG5cblx0XHRcdFx0Ly9BcHBlbmQgSFRNTCBmb3IgY29uZmxpY3RzIHRvIERPTVxuXHRcdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKS5lbXB0eSgpO1xuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0XHRcdFx0XHQkKCc8ZGl2Lz4nLCB7XG5cdFx0XHRcdFx0XHQnaWQnIDogJ3Jlc29sdmUnK3ZhbHVlLmlkLFxuXHRcdFx0XHRcdFx0J2NsYXNzJzogJ21lZXRpbmctY29uZmxpY3QnLFxuXHRcdFx0XHRcdFx0J2h0bWwnOiBcdCc8cD4mbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIHB1bGwtcmlnaHQgZGVsZXRlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5EZWxldGU8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCcmbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBwdWxsLXJpZ2h0IGVkaXRDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkVkaXQ8L2J1dHRvbj4gJyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCByZXNvbHZlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5LZWVwIE1lZXRpbmc8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8c3BhbiBpZD1cInJlc29sdmUnK3ZhbHVlLmlkKydzcGluXCIgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpbiBmYS1sZyBwdWxsLXJpZ2h0IGhpZGUtc3BpblwiPiZuYnNwOzwvc3Bhbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxiPicrdmFsdWUudGl0bGUrJzwvYj4gKCcrdmFsdWUuc3RhcnQrJyk8L3A+PGhyPidcblx0XHRcdFx0XHRcdH0pLmFwcGVuZFRvKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly9SZS1yZWdpc3RlciBjbGljayBoYW5kbGVyc1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0XHQvL1Nob3cgdGhlIDxkaXY+IGNvbnRhaW5pbmcgY29uZmxpY3RzXG5cdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXG5cdFx0ICAvL0lmIHJlc3BvbnNlIGlzIDIwNCwgbm8gY29uZmxpY3RzIGFyZSBwcmVzZW50XG5cdFx0XHR9ZWxzZSBpZihyZXNwb25zZS5zdGF0dXMgPT0gMjA0KXtcblxuXHRcdFx0XHQvL0hpZGUgdGhlIDxkaXY+IGNvbnRhaW5pbmcgY29uZmxpY3RzXG5cdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIHJldHJpZXZlIGNvbmZsaWN0aW5nIG1lZXRpbmdzOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIFNhdmUgYmxhY2tvdXRzIGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIHNhdmVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVCbGFja291dHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIHVybDtcblx0dmFyIGRhdGEgPSB7XG5cdFx0YnN0YXJ0OiBtb21lbnQoJCgnI2JzdGFydCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YmVuZDogbW9tZW50KCQoJyNiZW5kJykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRidGl0bGU6ICQoJyNidGl0bGUnKS52YWwoKVxuXHR9O1xuXHR2YXIgdXJsO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhLmJibGFja291dGV2ZW50aWQgPSAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpO1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0Jztcblx0XHRpZigkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSA+IDApe1xuXHRcdFx0ZGF0YS5iYmxhY2tvdXRpZCA9ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpO1xuXHRcdH1cblx0XHRkYXRhLmJyZXBlYXQgPSAkKCcjYnJlcGVhdCcpLnZhbCgpO1xuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMSl7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeT0gJCgnI2JyZXBlYXRkYWlseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMil7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeSA9ICQoJyNicmVwZWF0d2Vla2x5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c20gPSAkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdCA9ICQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN3ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3UgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzZiA9ICQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnc2F2ZSBibGFja291dCcpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgYmxhY2tvdXQgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgZGVsZXRlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgVVJMIGFuZCBkYXRhIG9iamVjdFxuXHR2YXIgdXJsLCBkYXRhO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRldmVudGlkOiAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpIH07XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGlkOiAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSB9O1xuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdkZWxldGUgYmxhY2tvdXQnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgY2hhbmdlIG9mIHJlcGVhdCBvcHRpb25zIG9uIHRoZSBibGFja291dCBmb3JtXG4gKi9cbnZhciByZXBlYXRDaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKHRoaXMpLnZhbCgpID09IDApe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAxKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMil7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9XG59O1xuXG4vKipcbiAqIFNob3cgdGhlIHJlc29sdmUgY29uZmxpY3RzIG1vZGFsIGZvcm1cbiAqL1xudmFyIHJlc29sdmVDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHQvL3NlbmQgQUpBWCBkZWxldGVcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ2RlbGV0ZSBtZWV0aW5nJywgdHJ1ZSk7XG5cbn07XG5cbi8qKlxuICogRWRpdCBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBlZGl0Q29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL21lZXRpbmcnO1xuXG5cdC8vc2hvdyBzcGlubmVyIHRvIGxvYWQgbWVldGluZ1xuXHQkKCcjcmVzb2x2ZScrIGlkICsgJ3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9sb2FkIG1lZXRpbmcgYW5kIGRpc3BsYXkgZm9ybVxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjcmVzb2x2ZScrIGlkICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdGV2ZW50ID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdGV2ZW50LnN0YXJ0ID0gbW9tZW50KGV2ZW50LnN0YXJ0KTtcblx0XHRcdGV2ZW50LmVuZCA9IG1vbWVudChldmVudC5lbmQpO1xuXHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBtZWV0aW5nJywgJyNyZXNvbHZlJyArIGlkLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIFJlc29sdmUgYSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL3Jlc29sdmVjb25mbGljdCc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ3Jlc29sdmUgbWVldGluZycsIHRydWUsIHRydWUpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgdGhlIGNyZWF0ZSBibGFja291dCBmb3JtXG4gKi9cbnZhciBjcmVhdGVCbGFja291dEZvcm0gPSBmdW5jdGlvbigpe1xuXHQkKCcjYnRpdGxlJykudmFsKFwiXCIpO1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOSkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQkKCcjYnJlcGVhdCcpLnZhbCgwKTtcblx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuaGlkZSgpO1xuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSB0byBhIHNpbmdsZSBvY2N1cnJlbmNlXG4gKi9cbnZhciBibGFja291dE9jY3VycmVuY2UgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL3NldCBmb3JtIHZhbHVlcyBhbmQgaGlkZSB1bm5lZWRlZCBmaWVsZHNcblx0JCgnI2J0aXRsZScpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC50aXRsZSk7XG5cdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWQpO1xuXHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5pZCk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblxuXHQvL3Nob3cgdGhlIGZvcm1cblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIGJsYWNrb3V0IHNlcmllcyBlZGl0IGZvcm1cbiAqL1xudmFyIGJsYWNrb3V0U2VyaWVzID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG4gXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdGlkOiBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2JsYWNrb3V0JztcblxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjYnRpdGxlJykudmFsKHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cdCBcdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5zdGFydCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5lbmQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JibGFja291dGlkJykudmFsKHJlc3BvbnNlLmRhdGEuaWQpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0IFx0XHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCBcdFx0aWYocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAxKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0ZGFpbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1lbHNlIGlmIChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDIpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHRcdFx0XHR2YXIgcmVwZWF0X2RldGFpbCA9IFN0cmluZyhyZXNwb25zZS5kYXRhLnJlcGVhdF9kZXRhaWwpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjFcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjJcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjNcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjRcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjVcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1cblx0IFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cdCBcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBibGFja291dCBzZXJpZXMnLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgc3R1ZGVudCBpbiB0aGUgZGF0YWJhc2VcbiAqL1xudmFyIG5ld1N0dWRlbnQgPSBmdW5jdGlvbigpe1xuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgYW4gZUlEIHRvIGFkZCB0byB0aGUgc3lzdGVtXG5cdHZhciBlaWQgPSBwcm9tcHQoXCJFbnRlciB0aGUgc3R1ZGVudCdzIGVJRFwiKTtcblxuXHQvL2J1aWxkIHRoZSBVUkwgYW5kIGRhdGFcblx0dmFyIGRhdGEgPSB7XG5cdFx0ZWlkOiBlaWQsXG5cdH07XG5cdHZhciB1cmwgPSAnL3Byb2ZpbGUvbmV3c3R1ZGVudCc7XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDQyMiwgZXJyb3JzIHdlcmUgcHJvdmlkZWRcblx0XHRcdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YVtcImVpZFwiXSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIndpbmRvdy5WdWUgPSByZXF1aXJlKCd2dWUnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG52YXIgRWNobyA9IHJlcXVpcmUoJ2xhcmF2ZWwtZWNobycpO1xucmVxdWlyZSgnaW9uLXNvdW5kJyk7XG5cbndpbmRvdy5QdXNoZXIgPSByZXF1aXJlKCdwdXNoZXItanMnKTtcblxuLyoqXG4gKiBHcm91cHNlc3Npb24gaW5pdCBmdW5jdGlvblxuICogbXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSB0byBzdGFydFxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vbG9hZCBpb24tc291bmQgbGlicmFyeVxuXHRpb24uc291bmQoe1xuICAgIHNvdW5kczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcImRvb3JfYmVsbFwiXG4gICAgICAgIH0sXG4gICAgXSxcbiAgICB2b2x1bWU6IDEuMCxcbiAgICBwYXRoOiBcIi9zb3VuZHMvXCIsXG4gICAgcHJlbG9hZDogdHJ1ZVxuXHR9KTtcblxuXHQvL2dldCB1c2VySUQgYW5kIGlzQWR2aXNvciB2YXJpYWJsZXNcblx0d2luZG93LnVzZXJJRCA9IHBhcnNlSW50KCQoJyN1c2VySUQnKS52YWwoKSk7XG5cblx0Ly9yZWdpc3RlciBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5vbignY2xpY2snLCBncm91cFJlZ2lzdGVyQnRuKTtcblxuXHQvL2Rpc2FibGUgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cERpc2FibGVCdG4nKS5vbignY2xpY2snLCBncm91cERpc2FibGVCdG4pO1xuXG5cdC8vcmVuZGVyIFZ1ZSBBcHBcblx0d2luZG93LnZtID0gbmV3IFZ1ZSh7XG5cdFx0ZWw6ICcjZ3JvdXBMaXN0Jyxcblx0XHRkYXRhOiB7XG5cdFx0XHRxdWV1ZTogW10sXG5cdFx0XHRhZHZpc29yOiBwYXJzZUludCgkKCcjaXNBZHZpc29yJykudmFsKCkpID09IDEsXG5cdFx0XHR1c2VySUQ6IHBhcnNlSW50KCQoJyN1c2VySUQnKS52YWwoKSksXG5cdFx0XHRvbmxpbmU6IFtdLFxuXHRcdH0sXG5cdFx0bWV0aG9kczoge1xuXHRcdFx0Ly9GdW5jdGlvbiB0byBnZXQgQ1NTIGNsYXNzZXMgZm9yIGEgc3R1ZGVudCBvYmplY3Rcblx0XHRcdGdldENsYXNzOiBmdW5jdGlvbihzKXtcblx0XHRcdFx0cmV0dXJue1xuXHRcdFx0XHRcdCdhbGVydC1pbmZvJzogcy5zdGF0dXMgPT0gMCB8fCBzLnN0YXR1cyA9PSAxLFxuXHRcdFx0XHRcdCdhbGVydC1zdWNjZXNzJzogcy5zdGF0dXMgPT0gMixcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW1lJzogcy51c2VyaWQgPT0gdGhpcy51c2VySUQsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1vZmZsaW5lJzogJC5pbkFycmF5KHMudXNlcmlkLCB0aGlzLm9ubGluZSkgPT0gLTEsXG5cdFx0XHRcdH07XG5cdFx0XHR9LFxuXHRcdFx0Ly9mdW5jdGlvbiB0byB0YWtlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHR0YWtlU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3Rha2UnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3Rha2UnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gcHV0IGEgc3R1ZGVudCBiYWNrIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3Rcblx0XHRcdHB1dFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9wdXQnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3B1dCcpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly8gZnVuY3Rpb24gdG8gbWFyayBhIHN0dWRlbnQgZG9uZSBvbiB0aGUgbGlzdFxuXHRcdFx0ZG9uZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kb25lJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdtYXJrIGRvbmUnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gZGVsZXRlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHRkZWxTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZGVsZXRlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdkZWxldGUnKTtcblx0XHRcdH0sXG5cdFx0fSxcblx0fSlcblxuXG5cdC8vRW5hYmxlIFB1c2hlciBsb2dnaW5nXG5cdGlmKHdpbmRvdy5lbnYgPT0gXCJsb2NhbFwiIHx8IHdpbmRvdy5lbnYgPT0gXCJzdGFnaW5nXCIpe1xuXHRcdGNvbnNvbGUubG9nKFwiUHVzaGVyIGxvZ2dpbmcgZW5hYmxlZCFcIik7XG5cdFx0UHVzaGVyLmxvZ1RvQ29uc29sZSA9IHRydWU7XG5cdH1cblxuXHQvL0xvYWQgdGhlIEVjaG8gaW5zdGFuY2Ugb24gdGhlIHdpbmRvd1xuXHR3aW5kb3cuRWNobyA9IG5ldyBFY2hvKHtcblx0XHRicm9hZGNhc3RlcjogJ3B1c2hlcicsXG5cdFx0a2V5OiB3aW5kb3cucHVzaGVyS2V5LFxuXHRcdGNsdXN0ZXI6IHdpbmRvdy5wdXNoZXJDbHVzdGVyLFxuXHR9KTtcblxuXHQvL0JpbmQgdG8gdGhlIGNvbm5lY3RlZCBhY3Rpb24gb24gUHVzaGVyIChjYWxsZWQgd2hlbiBjb25uZWN0ZWQpXG5cdHdpbmRvdy5FY2hvLmNvbm5lY3Rvci5wdXNoZXIuY29ubmVjdGlvbi5iaW5kKCdjb25uZWN0ZWQnLCBmdW5jdGlvbigpe1xuXHRcdC8vd2hlbiBjb25uZWN0ZWQsIGRpc2FibGUgdGhlIHNwaW5uZXJcblx0XHQkKCcjZ3JvdXBzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9Mb2FkIHRoZSBpbml0aWFsIHN0dWRlbnQgcXVldWUgdmlhIEFKQVhcblx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvZ3JvdXBzZXNzaW9uL3F1ZXVlJylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0d2luZG93LnZtLnF1ZXVlID0gd2luZG93LnZtLnF1ZXVlLmNvbmNhdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0Y2hlY2tCdXR0b25zKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdGluaXRpYWxDaGVja0Rpbmcod2luZG93LnZtLnF1ZXVlKTtcblx0XHRcdFx0d2luZG93LnZtLnF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdnZXQgcXVldWUnLCAnJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pXG5cblx0Ly9Db25uZWN0IHRvIHRoZSBncm91cHNlc3Npb24gY2hhbm5lbFxuXHQvKlxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb24nKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblxuXHRcdH0pO1xuICovXG5cblx0Ly9Db25uZWN0IHRvIHRoZSBncm91cHNlc3Npb25lbmQgY2hhbm5lbFxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb25lbmQnKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvbkVuZCcsIChlKSA9PiB7XG5cblx0XHRcdC8vaWYgZW5kaW5nLCByZWRpcmVjdCBiYWNrIHRvIGhvbWUgcGFnZVxuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9ncm91cHNlc3Npb25cIjtcblx0fSk7XG5cblx0d2luZG93LkVjaG8uam9pbigncHJlc2VuY2UnKVxuXHRcdC5oZXJlKCh1c2VycykgPT4ge1xuXHRcdFx0dmFyIGxlbiA9IHVzZXJzLmxlbmd0aDtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2Vyc1tpXS5pZCk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuam9pbmluZygodXNlcikgPT4ge1xuXHRcdFx0d2luZG93LnZtLm9ubGluZS5wdXNoKHVzZXIuaWQpO1xuXHRcdH0pXG5cdFx0LmxlYXZpbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUuc3BsaWNlKCAkLmluQXJyYXkodXNlci5pZCwgd2luZG93LnZtLm9ubGluZSksIDEpO1xuXHRcdH0pXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZGF0YSkgPT4ge1xuXHRcdFx0dmFyIHF1ZXVlID0gd2luZG93LnZtLnF1ZXVlO1xuXHRcdFx0dmFyIGZvdW5kID0gZmFsc2U7XG5cdFx0XHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXG5cdFx0XHQvL3VwZGF0ZSB0aGUgcXVldWUgYmFzZWQgb24gcmVzcG9uc2Vcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdGlmKHF1ZXVlW2ldLmlkID09PSBkYXRhLmlkKXtcblx0XHRcdFx0XHRpZihkYXRhLnN0YXR1cyA8IDMpe1xuXHRcdFx0XHRcdFx0cXVldWVbaV0gPSBkYXRhO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0cXVldWUuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdFx0bGVuLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2lmIGVsZW1lbnQgbm90IGZvdW5kIG9uIGN1cnJlbnQgcXVldWUsIHB1c2ggaXQgb24gdG8gdGhlIHF1ZXVlXG5cdFx0XHRpZighZm91bmQpe1xuXHRcdFx0XHRxdWV1ZS5wdXNoKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NoZWNrIHRvIHNlZSBpZiBjdXJyZW50IHVzZXIgaXMgb24gcXVldWUgYmVmb3JlIGVuYWJsaW5nIGJ1dHRvblxuXHRcdFx0Y2hlY2tCdXR0b25zKHF1ZXVlKTtcblxuXHRcdFx0Ly9pZiBjdXJyZW50IHVzZXIgaXMgZm91bmQsIGNoZWNrIGZvciBzdGF0dXMgdXBkYXRlIHRvIHBsYXkgc291bmRcblx0XHRcdGlmKGRhdGEudXNlcmlkID09PSB1c2VySUQpe1xuXHRcdFx0XHRjaGVja0RpbmcoZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vc29ydCB0aGUgcXVldWUgY29ycmVjdGx5XG5cdFx0XHRxdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cblx0XHRcdC8vdXBkYXRlIFZ1ZSBzdGF0ZSwgbWlnaHQgYmUgdW5uZWNlc3Nhcnlcblx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHF1ZXVlO1xuXHRcdH0pO1xuXG59O1xuXG5cbi8qKlxuICogVnVlIGZpbHRlciBmb3Igc3RhdHVzIHRleHRcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBzdHVkZW50IHRvIHJlbmRlclxuICovXG5WdWUuZmlsdGVyKCdzdGF0dXN0ZXh0JywgZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAwKSByZXR1cm4gXCJORVdcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDEpIHJldHVybiBcIlFVRVVFRFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMikgcmV0dXJuIFwiTUVFVCBXSVRIIFwiICsgZGF0YS5hZHZpc29yO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMykgcmV0dXJuIFwiREVMQVlcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDQpIHJldHVybiBcIkFCU0VOVFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNSkgcmV0dXJuIFwiRE9ORVwiO1xufSk7XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGNsaWNraW5nIG9uIHRoZSByZWdpc3RlciBidXR0b25cbiAqL1xudmFyIGdyb3VwUmVnaXN0ZXJCdG4gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9yZWdpc3Rlcic7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwge30pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdFx0XHQkKCcjZ3JvdXBzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JlZ2lzdGVyJywgJyNncm91cCcsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGFkdmlzb3JzIHRvIGRpc2FibGUgZ3JvdXBzZXNzaW9uXG4gKi9cbnZhciBncm91cERpc2FibGVCdG4gPSBmdW5jdGlvbigpe1xuXHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cdFx0dmFyIHJlYWxseSA9IGNvbmZpcm0oXCJTZXJpb3VzbHksIHRoaXMgd2lsbCBsb3NlIGFsbCBjdXJyZW50IGRhdGEuIEFyZSB5b3UgcmVhbGx5IHN1cmU/XCIpO1xuXHRcdGlmKHJlYWxseSA9PT0gdHJ1ZSl7XG5cdFx0XHQvL3RoaXMgaXMgYSBiaXQgaGFja3ksIGJ1dCBpdCB3b3Jrc1xuXHRcdFx0dmFyIHRva2VuID0gJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKTtcblx0XHRcdCQoJzxmb3JtIGFjdGlvbj1cIi9ncm91cHNlc3Npb24vZGlzYWJsZVwiIG1ldGhvZD1cIlBPU1RcIi8+Jylcblx0XHRcdFx0LmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJpZFwiIHZhbHVlPVwiJyArIHdpbmRvdy51c2VySUQgKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiX3Rva2VuXCIgdmFsdWU9XCInICsgdG9rZW4gKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmRUbygkKGRvY3VtZW50LmJvZHkpKSAvL2l0IGhhcyB0byBiZSBhZGRlZCBzb21ld2hlcmUgaW50byB0aGUgPGJvZHk+XG5cdFx0XHRcdC5zdWJtaXQoKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBlbmFibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZW5hYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRpc2FibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZGlzYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBhbmQgc2VlIGlmIHVzZXIgaXMgb24gdGhlIGxpc3QgLSBpZiBub3QsIGRvbid0IGVuYWJsZSBidXR0b25cbiAqL1xudmFyIGNoZWNrQnV0dG9ucyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0dmFyIGZvdW5kTWUgPSBmYWxzZTtcblxuXHQvL2l0ZXJhdGUgdGhyb3VnaCB1c2VycyBvbiBsaXN0LCBsb29raW5nIGZvciBjdXJyZW50IHVzZXJcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHdpbmRvdy51c2VySUQpe1xuXHRcdFx0Zm91bmRNZSA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvL2lmIGZvdW5kLCBkaXNhYmxlIGJ1dHRvbjsgaWYgbm90LCBlbmFibGUgYnV0dG9uXG5cdGlmKGZvdW5kTWUpe1xuXHRcdGRpc2FibGVCdXR0b24oKTtcblx0fWVsc2V7XG5cdFx0ZW5hYmxlQnV0dG9uKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgdXNlciBpcyBiZWNrb25lZCwgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHBlcnNvbiAtIHRoZSBjdXJyZW50IHVzZXIgdG8gY2hlY2tcbiAqL1xudmFyIGNoZWNrRGluZyA9IGZ1bmN0aW9uKHBlcnNvbil7XG5cdGlmKHBlcnNvbi5zdGF0dXMgPT0gMil7XG5cdFx0aW9uLnNvdW5kLnBsYXkoXCJkb29yX2JlbGxcIik7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcGVyc29uIGhhcyBiZWVuIGJlY2tvbmVkIG9uIGxvYWQ7IGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBxdWV1ZSAtIHRoZSBpbml0aWFsIHF1ZXVlIG9mIHVzZXJzIGxvYWRlZFxuICovXG52YXIgaW5pdGlhbENoZWNrRGluZyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHdpbmRvdy51c2VySUQpe1xuXHRcdFx0Y2hlY2tEaW5nKHF1ZXVlW2ldKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIHN0YXR1c1xuICpcbiAqIEBwYXJhbSBhIC0gZmlyc3QgcGVyc29uXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBwZXJzb25cbiAqIEByZXR1cm4gLSBzb3J0aW5nIHZhbHVlIGluZGljYXRpbmcgd2hvIHNob3VsZCBnbyBmaXJzdF9uYW1lXG4gKi9cbnZhciBzb3J0RnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKXtcblx0aWYoYS5zdGF0dXMgPT0gYi5zdGF0dXMpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5zdGF0dXMgPCBiLnN0YXR1cyA/IDEgOiAtMSk7XG59XG5cblxuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBtYWtpbmcgQUpBWCBQT1NUIHJlcXVlc3RzXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4UG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgYWN0aW9uKXtcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZ3JvdXBzZXNzaW9uLmpzIiwidmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbnJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG5yZXF1aXJlKCdzdW1tZXJub3RlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0JCgnI25vdGVzJykuc3VtbWVybm90ZSh7XG5cdFx0Zm9jdXM6IHRydWUsXG5cdFx0dG9vbGJhcjogW1xuXHRcdFx0Ly8gW2dyb3VwTmFtZSwgW2xpc3Qgb2YgYnV0dG9uc11dXG5cdFx0XHRbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG5cdFx0XHRbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG5cdFx0XHRbJ3BhcmEnLCBbJ3VsJywgJ29sJywgJ3BhcmFncmFwaCddXSxcblx0XHRcdFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuXHRcdF0sXG5cdFx0dGFic2l6ZTogMixcblx0XHRjb2RlbWlycm9yOiB7XG5cdFx0XHRtb2RlOiAndGV4dC9odG1sJyxcblx0XHRcdGh0bWxNb2RlOiB0cnVlLFxuXHRcdFx0bGluZU51bWJlcnM6IHRydWUsXG5cdFx0XHR0aGVtZTogJ21vbm9rYWknXG5cdFx0fSxcblx0fSk7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuXHRcdFx0bGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG5cdFx0fTtcblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHQvL3NlbmQgQUpBWCBwb3N0XG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBhZHZpc29yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlQWR2aXNvclByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdC8vVE9ETyBURVNUTUVcblx0XHR2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGRhdGEuYXBwZW5kKFwibmFtZVwiLCAkKCcjbmFtZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwicGhvbmVcIiwgJCgnI3Bob25lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuXHRcdGlmKCQoJyNwaWMnKS52YWwoKSl7XG5cdFx0XHRkYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZXNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYycpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0JCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0XHQkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0Ly9odHRwOi8vd3d3LmFiZWF1dGlmdWxzaXRlLm5ldC93aGlwcGluZy1maWxlLWlucHV0cy1pbnRvLXNoYXBlLXdpdGgtYm9vdHN0cmFwLTMvXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG5cdCAgdmFyIGlucHV0ID0gJCh0aGlzKSxcblx0ICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcblx0ICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG5cdCAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcblx0fSk7XG5cblx0Ly9iaW5kIHRvIGZpbGVzZWxlY3QgYnV0dG9uXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0Jyk7XG5cdFx0XHR2YXIgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZihpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC52YWwobG9nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKGxvZyl7XG5cdFx0XHRcdFx0XHRhbGVydChsb2cpO1xuXHRcdFx0XHRcdH1cbiAgICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZW1lZXRpbmdcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vbWVldGluZ3NcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCIvL2xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnYWRtaW4tbHRlJyk7XG5yZXF1aXJlKCdkYXRhdGFibGVzLm5ldCcpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQtYnMnKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcblxuLy9vcHRpb25zIGZvciBkYXRhdGFibGVzXG5leHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMgPSB7XG4gIFwicGFnZUxlbmd0aFwiOiA1MCxcbiAgXCJsZW5ndGhDaGFuZ2VcIjogZmFsc2UsXG59XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgb24gYWxsIGRhdGF0YWJsZXMgcGFnZXNcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIGN1c3RvbSBkYXRhdGFibGVzIG9wdGlvbnNcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSBleHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMpO1xuICAkKCcjdGFibGUnKS5EYXRhVGFibGUob3B0aW9ucyk7XG4gIHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cbiAgJCgnI2FkbWlubHRlLXRvZ2dsZW1lbnUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnc2lkZWJhci1vcGVuJyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHNhdmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGlkIC0gdGhlIGlkIG9mIHRoZSBpdGVtIHRvIGJlIHNhdmUtZGV2XG4gKiBAcGFyYW0gbG9hZHBpY3R1cmUgLSB0cnVlIHRvIHJlbG9hZCBhIHByb2ZpbGUgcGljdHVyZVxuICovXG5leHBvcnRzLmFqYXhzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBpZCwgbG9hZHBpY3R1cmUpe1xuICBsb2FkcGljdHVyZSB8fCAobG9hZHBpY3R1cmUgPSBmYWxzZSk7XG4gICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmVzcG9uc2UuZGF0YSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgIGlmKGxvYWRwaWN0dXJlKSBleHBvcnRzLmxvYWRwaWN0dXJlKGlkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYIG9uIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgcGljdHVyZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSB1c2VyIElEIG9mIHRoZSBwaWN0dXJlIHRvIHJlbG9hZFxuICovXG5leHBvcnRzLmxvYWRwaWN0dXJlID0gZnVuY3Rpb24oaWQpe1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgJCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuICAgIH0pXG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG8gYWZ0ZXIgZGVsZXRlXG4gKiBAcGFyYW0gc29mdCAtIGJvb2xlYW4gaWYgdGhpcyBpcyBhIHNvZnQgZGVsZXRlIG9yIG5vdFxuICovXG5leHBvcnRzLmFqYXhkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCByZXRVcmwsIHNvZnQgPSBmYWxzZSl7XG4gIGlmKHNvZnQpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgfWVsc2V7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlbGF0ZWQgcmVjb3Jkcy4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgfVxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW0gZnJvbSBhIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBtb2RhbCBlbGVtZW50IHRvIGNsb3NlXG4gKi9cbmV4cG9ydHMuYWpheG1vZGFsZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgZWxlbWVudCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc3RvcmUgYSBzb2Z0LWRlbGV0ZWQgaXRlbVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGl0ZW0gdG8gYmUgcmVzdG9yZWRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhhdCBpbmZvcm1hdGlvbiB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvXG4gKi9cbmV4cG9ydHMuYWpheHJlc3RvcmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIHJldFVybCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmVzdG9yZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIHN1Z2dlc3Rpb24udmFsdWUpO1xuXHQgICAgfSxcblx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH07XG5cdCAgICB9XG5cdH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVibGFja291dFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ibGFja291dHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAvLyQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVncm91cHNlc3Npb25cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZ3JvdXBzZXNzaW9uc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIC8vbG9hZCBjdXN0b20gYnV0dG9uIG9uIHRoZSBkb21cbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdCgpO1xuXG4gIC8vYmluZCBzZXR0aW5ncyBidXR0b25zXG4gICQoJy5zZXR0aW5nc2J1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBrZXk6ICQodGhpcykuYXR0cignaWQnKSxcbiAgICB9O1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3NhdmVzZXR0aW5nJztcblxuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9hZG1pbi9zZXR0aW5ncycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIC8vYmluZCBuZXcgc2V0dGluZyBidXR0b25cbiAgJCgnI25ld3NldHRpbmcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBjaG9pY2UgPSBwcm9tcHQoXCJFbnRlciBhIG5hbWUgZm9yIHRoZSBuZXcgc2V0dGluZzpcIik7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBrZXk6IGNob2ljZSxcbiAgICB9O1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9uZXdzZXR0aW5nXCJcblxuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9hZG1pbi9zZXR0aW5ncycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2NyZWF0ZScsICcnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9kZWdyZWVwcm9ncmFtcmVxdWlyZW1lbnRzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnY3JlZGl0cyd9LFxuICAgIHsnZGF0YSc6ICdzZW1lc3Rlcid9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdub3Rlcyd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdFxcXCIgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV1cbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPk5ldyBEZWdyZWUgUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9uYW1lID0gJCgnI2NvdXJzZV9uYW1lJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXJlcXVpcmVtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlZ3JlZXJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVncmVlcmVxdWlyZW1lbnRcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4bW9kYWxkZWxldGUoZGF0YSwgdXJsLCAnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNzZW1lc3RlcicpLnZhbChtZXNzYWdlLmRhdGEuc2VtZXN0ZXIpO1xuICAgICAgICAkKCcjb3JkZXJpbmcnKS52YWwobWVzc2FnZS5kYXRhLm9yZGVyaW5nKTtcbiAgICAgICAgJCgnI2NyZWRpdHMnKS52YWwobWVzc2FnZS5kYXRhLmNyZWRpdHMpO1xuICAgICAgICAkKCcjbm90ZXMnKS52YWwobWVzc2FnZS5kYXRhLm5vdGVzKTtcbiAgICAgICAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEudHlwZSA9PSBcImNvdXJzZVwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNlIGlmIChtZXNzYWdlLmRhdGEudHlwZSA9PSBcImVsZWN0aXZlbGlzdFwiKXtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcmVxdWlyZW1lbnQnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT1yZXF1aXJlYWJsZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNzZW1lc3RlcicpLnZhbChcIlwiKTtcbiAgJCgnI29yZGVyaW5nJykudmFsKFwiXCIpO1xuICAkKCcjY3JlZGl0cycpLnZhbChcIlwiKTtcbiAgJCgnI25vdGVzJykudmFsKFwiXCIpO1xuICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9lbGVjdGl2ZWxpc3Rjb3Vyc2VzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5BZGQgQ291cnNlPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGVsZWN0aXZlbGlzdF9pZDogJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpLFxuICAgICAgY291cnNlX3ByZWZpeDogJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyYW5nZSddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEuY291cnNlX21pbl9udW1iZXIgPSAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoKTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWluX251bWJlciA9ICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuY291cnNlX21heF9udW1iZXIgPSAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdlbGVjdGl2ZWxpc3Rjb3Vyc2UnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVjb3Vyc2UvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVjb3Vyc2VcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4bW9kYWxkZWxldGUoZGF0YSwgdXJsLCAnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5vbignc2hvd24uYnMubW9kYWwnLCBzaG93c2VsZWN0ZWQpO1xuXG4gICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR2aWV3JykudmFsKCQoJyNlbGVjdGl2ZWxpc3RfaWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL2VsZWN0aXZlY291cnNlLycgKyBpZDtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKCcjaWQnKS52YWwobWVzc2FnZS5kYXRhLmlkKTtcbiAgICAgICAgJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9wcmVmaXgpO1xuICAgICAgICAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9taW5fbnVtYmVyKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLmNvdXJzZV9tYXhfbnVtYmVyKXtcbiAgICAgICAgICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9tYXhfbnVtYmVyKTtcbiAgICAgICAgICAkKCcjcmFuZ2UyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoXCJcIik7XG4gICAgICAgICAgJCgnI3JhbmdlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcjZGVsZXRlJykuc2hvdygpO1xuICAgICAgICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgZWxlY3RpdmUgbGlzdCBjb3Vyc2UnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgICQoJ2lucHV0W25hbWU9cmFuZ2VdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyYW5nZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChcIlwiKTtcbiAgJCgnI3JhbmdlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JhbmdlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50cy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2NyZWRpdHMnfSxcbiAgICB7J2RhdGEnOiAnc2VtZXN0ZXInfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnbm90ZXMnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9ucy5jb2x1bW5EZWZzID0gW3tcbiAgICAgICAgICAgIFwidGFyZ2V0c1wiOiAtMSxcbiAgICAgICAgICAgIFwiZGF0YVwiOiAnaWQnLFxuICAgICAgICAgICAgXCJyZW5kZXJcIjogZnVuY3Rpb24oZGF0YSwgdHlwZSwgcm93LCBtZXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIjxhIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGVkaXRcXFwiIGhyZWY9XFxcIiNcXFwiIGRhdGEtaWQ9XFxcIlwiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5OZXcgUGxhbiBSZXF1aXJlbWVudDwvYT4nKTtcblxuICAvL2FkZGVkIGZvciBuZXcgc2VtZXN0ZXJzIHRhYmxlXG4gIHZhciBvcHRpb25zMiA9IHtcbiAgICBcInBhZ2VMZW5ndGhcIjogNTAsXG4gICAgXCJsZW5ndGhDaGFuZ2VcIjogZmFsc2UsXG4gIH1cbiAgb3B0aW9uczIuZG9tID0gJzxcIm5ld2J1dHRvbjJcIj5mcnRpcCc7XG4gIG9wdGlvbnMyLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVycy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9uczIuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdudW1iZXInfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9uczIuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0c2VtXFxcIiBocmVmPVxcXCIvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyL1wiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dXG4gICQoJyN0YWJsZXNlbScpLkRhdGFUYWJsZShvcHRpb25zMik7XG5cbiAgJChcImRpdi5uZXdidXR0b24yXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyBpZCArICdcIiBpZD1cIm5ldzJcIj5OZXcgU2VtZXN0ZXI8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9uYW1lID0gJCgnI2NvdXJzZV9uYW1lJykudmFsKCk7XG4gICAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW5yZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlcGxhbnJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNwbGFucmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykub24oJ3Nob3duLmJzLm1vZGFsJywgc2hvd3NlbGVjdGVkKTtcblxuICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5yZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNzZW1lc3RlcicpLnZhbChtZXNzYWdlLmRhdGEuc2VtZXN0ZXIpO1xuICAgICAgICAkKCcjb3JkZXJpbmcnKS52YWwobWVzc2FnZS5kYXRhLm9yZGVyaW5nKTtcbiAgICAgICAgJCgnI2NyZWRpdHMnKS52YWwobWVzc2FnZS5kYXRhLmNyZWRpdHMpO1xuICAgICAgICAkKCcjbm90ZXMnKS52YWwobWVzc2FnZS5kYXRhLm5vdGVzKTtcbiAgICAgICAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEudHlwZSA9PSBcImNvdXJzZVwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNlIGlmIChtZXNzYWdlLmRhdGEudHlwZSA9PSBcImVsZWN0aXZlbGlzdFwiKXtcbiAgICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9uYW1lKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2RlbGV0ZScpLnNob3coKTtcbiAgICAgICAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwuanMiLCJ2YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xud2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIGRyYWdnYWJsZSA9IHJlcXVpcmUoJ3Z1ZWRyYWdnYWJsZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2Zsb3djaGFydCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0cGxhbjogW10sXG4gICAgICBzZW1lc3RlcnM6IFtdLFxuXHRcdH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgY291cnNlc0ZvclNlbWVzdGVyOiBmdW5jdGlvbihwbGFuLCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHBsYW4uZmlsdGVyKGZ1bmN0aW9uIChjb3Vyc2Upe1xuICAgICAgICAgIHJldHVybiBjb3Vyc2Uuc2VtZXN0ZXIgPT09IG51bWJlcjtcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIGRyYWdnYWJsZSxcbiAgICB9LFxuICB9KTtcblxuICAkKCcjYWRkc2VtZXN0ZXInKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBtYXggPSBNYXRoLm1heC5hcHBseShudWxsLCB3aW5kb3cudm0uc2VtZXN0ZXJzLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gYS5udW1iZXJ9KSk7XG4gICAgdmFyIHNlbWVzdGVyID0ge1xuICAgICAgbmFtZTogXCJOZXcgU2VtZXN0ZXJcIixcbiAgICAgIG51bWJlcjogbWF4ICsgMSxcbiAgICAgIG9yZGVyaW5nOiB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCArIDEsXG4gICAgICBjb3Vyc2VzOiBbXSxcbiAgICB9XG4gICAgd2luZG93LnZtLnNlbWVzdGVycy5wdXNoKHNlbWVzdGVyKTtcbiAgICAkKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClbMF0uc3R5bGUuc2V0UHJvcGVydHkoJy0tY29sTnVtJywgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGgpO1xuICB9KVxuXG4gIGxvYWREYXRhKCk7XG5cbiAgJCgnI3Jlc2V0Jykub24oJ2NsaWNrJywgbG9hZERhdGEpO1xuXG59XG5cbnZhciBsb2FkRGF0YSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkKVxuICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgd2luZG93LnZtLnNlbWVzdGVycyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgZm9yKGkgPSAwOyBpIDwgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGg7IGkrKyl7XG4gICAgICBWdWUuc2V0KHdpbmRvdy52bS5zZW1lc3RlcnNbaV0sICdjb3Vyc2VzJywgbmV3IEFycmF5KCkpO1xuICAgIH1cbiAgICAkKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClbMF0uc3R5bGUuc2V0UHJvcGVydHkoJy0tY29sTnVtJywgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGgpO1xuICAgIHdpbmRvdy5heGlvcy5nZXQoJy9mbG93Y2hhcnRzL2RhdGEvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgICAgICB2YXIgc2VtZXN0ZXIgPSB3aW5kb3cudm0uc2VtZXN0ZXJzLmZpbmQoZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQubnVtYmVyID09IHZhbHVlLnNlbWVzdGVyO1xuICAgICAgICB9KVxuICAgICAgICBzZW1lc3Rlci5jb3Vyc2VzLnB1c2godmFsdWUpO1xuICAgICAgfSlcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdnZXQgZGF0YScsICcnLCBlcnJvcik7XG4gICAgfSk7XG4gIH0pXG4gIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgc2l0ZS5oYW5kbGVFcnJvcignZ2V0IGRhdGEnLCAnJywgZXJyb3IpO1xuICB9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMjA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvZmxvd2NoYXJ0LnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDIwOFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvKipcbiAqIERpc3BsYXlzIGEgbWVzc2FnZSBmcm9tIHRoZSBmbGFzaGVkIHNlc3Npb24gZGF0YVxuICpcbiAqIHVzZSAkcmVxdWVzdC0+c2Vzc2lvbigpLT5wdXQoJ21lc3NhZ2UnLCB0cmFucygnbWVzc2FnZXMuaXRlbV9zYXZlZCcpKTtcbiAqICAgICAkcmVxdWVzdC0+c2Vzc2lvbigpLT5wdXQoJ3R5cGUnLCAnc3VjY2VzcycpO1xuICogdG8gc2V0IG1lc3NhZ2UgdGV4dCBhbmQgdHlwZVxuICovXG5leHBvcnRzLmRpc3BsYXlNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSl7XG5cdHZhciBodG1sID0gJzxkaXYgaWQ9XCJqYXZhc2NyaXB0TWVzc2FnZVwiIGNsYXNzPVwiYWxlcnQgZmFkZSBpbiBhbGVydC1kaXNtaXNzYWJsZSBhbGVydC0nICsgdHlwZSArICdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWxhYmVsPVwiQ2xvc2VcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjwvYnV0dG9uPjxzcGFuIGNsYXNzPVwiaDRcIj4nICsgbWVzc2FnZSArICc8L3NwYW4+PC9kaXY+Jztcblx0JCgnI21lc3NhZ2UnKS5hcHBlbmQoaHRtbCk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0JChcIiNqYXZhc2NyaXB0TWVzc2FnZVwiKS5hbGVydCgnY2xvc2UnKTtcblx0fSwgMzAwMCk7XG59O1xuXG4vKlxuZXhwb3J0cy5hamF4Y3JzZiA9IGZ1bmN0aW9uKCl7XG5cdCQuYWpheFNldHVwKHtcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuXHRcdH1cblx0fSk7XG59O1xuKi9cblxuLyoqXG4gKiBDbGVhcnMgZXJyb3JzIG9uIGZvcm1zIGJ5IHJlbW92aW5nIGVycm9yIGNsYXNzZXNcbiAqL1xuZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMgPSBmdW5jdGlvbigpe1xuXHQkKCcuZm9ybS1ncm91cCcpLmVhY2goZnVuY3Rpb24gKCl7XG5cdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLnRleHQoJycpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBTZXRzIGVycm9ycyBvbiBmb3JtcyBiYXNlZCBvbiByZXNwb25zZSBKU09OXG4gKi9cbmV4cG9ydHMuc2V0Rm9ybUVycm9ycyA9IGZ1bmN0aW9uKGpzb24pe1xuXHRleHBvcnRzLmNsZWFyRm9ybUVycm9ycygpO1xuXHQkLmVhY2goanNvbiwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblx0XHQkKCcjJyArIGtleSkucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0JCgnIycgKyBrZXkgKyAnaGVscCcpLnRleHQodmFsdWUuam9pbignICcpKTtcblx0fSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGZvciBtZXNzYWdlcyBpbiB0aGUgZmxhc2ggZGF0YS4gTXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSBieSB0aGUgcGFnZVxuICovXG5leHBvcnRzLmNoZWNrTWVzc2FnZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQoJyNtZXNzYWdlX2ZsYXNoJykubGVuZ3RoKXtcblx0XHR2YXIgbWVzc2FnZSA9ICQoJyNtZXNzYWdlX2ZsYXNoJykudmFsKCk7XG5cdFx0dmFyIHR5cGUgPSAkKCcjbWVzc2FnZV90eXBlX2ZsYXNoJykudmFsKCk7XG5cdFx0ZXhwb3J0cy5kaXNwbGF5TWVzc2FnZShtZXNzYWdlLCB0eXBlKTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBlcnJvcnMgZnJvbSBBSkFYXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgLSB0aGUgbWVzc2FnZSB0byBkaXNwbGF5IHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBqUXVlcnkgaWRlbnRpZmllciBvZiB0aGUgZWxlbWVudFxuICogQHBhcmFtIGVycm9yIC0gdGhlIEF4aW9zIGVycm9yIHJlY2VpdmVkXG4gKi9cbmV4cG9ydHMuaGFuZGxlRXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlLCBlbGVtZW50LCBlcnJvcil7XG5cdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHQvL0lmIHJlc3BvbnNlIGlzIDQyMiwgZXJyb3JzIHdlcmUgcHJvdmlkZWRcblx0XHRpZihlcnJvci5yZXNwb25zZS5zdGF0dXMgPT0gNDIyKXtcblx0XHRcdGV4cG9ydHMuc2V0Rm9ybUVycm9ycyhlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9ZWxzZXtcblx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIFwiICsgbWVzc2FnZSArIFwiOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1cblx0fVxuXG5cdC8vaGlkZSBzcGlubmluZyBpY29uXG5cdGlmKGVsZW1lbnQubGVuZ3RoID4gMCl7XG5cdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIiwiLyoqXG4gKiBJbml0aWFsaXphdGlvbiBmdW5jdGlvbiBmb3IgZWRpdGFibGUgdGV4dC1ib3hlcyBvbiB0aGUgc2l0ZVxuICogTXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIC8vTG9hZCByZXF1aXJlZCBsaWJyYXJpZXNcbiAgcmVxdWlyZSgnY29kZW1pcnJvcicpO1xuICByZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xuICByZXF1aXJlKCdzdW1tZXJub3RlJyk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgW2VkaXRdIGxpbmtzXG4gICQoJy5lZGl0YWJsZS1saW5rJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9oaWRlIHRoZSBbZWRpdF0gbGlua3MsIGVuYWJsZSBlZGl0b3IsIGFuZCBzaG93IFNhdmUgYW5kIENhbmNlbCBidXR0b25zXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSh7XG4gICAgICAgIGZvY3VzOiB0cnVlLFxuICAgICAgICB0b29sYmFyOiBbXG4gICAgICAgICAgLy8gW2dyb3VwTmFtZSwgW2xpc3Qgb2YgYnV0dG9uc11dXG4gICAgICAgICAgWydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuICAgICAgICAgIFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcbiAgICAgICAgICBbJ3BhcmEnLCBbJ3VsJywgJ29sJywgJ3BhcmFncmFwaCddXSxcbiAgICAgICAgICBbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcbiAgICAgICAgXSxcbiAgICAgICAgdGFic2l6ZTogMixcbiAgICAgICAgY29kZW1pcnJvcjoge1xuICAgICAgICAgIG1vZGU6ICd0ZXh0L2h0bWwnLFxuICAgICAgICAgIGh0bWxNb2RlOiB0cnVlLFxuICAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnbW9ub2thaSdcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBTYXZlIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLXNhdmUnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL0Rpc3BsYXkgc3Bpbm5lciB3aGlsZSBBSkFYIGNhbGwgaXMgcGVyZm9ybWVkXG4gICAgICAkKCcjZWRpdGFibGVzcGluLScgKyBpZCkucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG4gICAgICAvL0dldCBjb250ZW50cyBvZiBlZGl0b3JcbiAgICAgIHZhciBodG1sU3RyaW5nID0gJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnY29kZScpO1xuXG4gICAgICAvL1Bvc3QgY29udGVudHMgdG8gc2VydmVyLCB3YWl0IGZvciByZXNwb25zZVxuICAgICAgd2luZG93LmF4aW9zLnBvc3QoJy9lZGl0YWJsZS9zYXZlLycgKyBpZCwge1xuICAgICAgICBjb250ZW50czogaHRtbFN0cmluZ1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgLy9JZiByZXNwb25zZSAyMDAgcmVjZWl2ZWQsIGFzc3VtZSBpdCBzYXZlZCBhbmQgcmVsb2FkIHBhZ2VcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIGFsZXJ0KFwiVW5hYmxlIHRvIHNhdmUgY29udGVudDogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBDYW5jZWwgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtY2FuY2VsJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9SZXNldCB0aGUgY29udGVudHMgb2YgdGhlIGVkaXRvciBhbmQgZGVzdHJveSBpdFxuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgncmVzZXQnKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2Rlc3Ryb3knKTtcblxuICAgICAgLy9IaWRlIFNhdmUgYW5kIENhbmNlbCBidXR0b25zLCBhbmQgc2hvdyBbZWRpdF0gbGlua1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==