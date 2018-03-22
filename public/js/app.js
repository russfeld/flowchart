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
  site.clearFormErrors();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnRlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9kYXNoYm9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydGxpc3QuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzPzZkMTAiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2Zsb3djaGFydC5zY3NzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9zaXRlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmQiLCJyZXF1aXJlIiwiZXhwb3J0cyIsImluaXQiLCJvcHRpb25zIiwiZGF0YVRhYmxlT3B0aW9ucyIsImRvbSIsIiQiLCJodG1sIiwib24iLCJkYXRhIiwiZmlyc3RfbmFtZSIsInZhbCIsImxhc3RfbmFtZSIsImVtYWlsIiwiYWR2aXNvcl9pZCIsImRlcGFydG1lbnRfaWQiLCJpZCIsImVpZCIsImxlbmd0aCIsInVybCIsImFqYXhzYXZlIiwicmV0VXJsIiwiYWpheGRlbGV0ZSIsImFqYXhyZXN0b3JlIiwic3VtbWVybm90ZSIsImZvY3VzIiwidG9vbGJhciIsInRhYnNpemUiLCJjb2RlbWlycm9yIiwibW9kZSIsImh0bWxNb2RlIiwibGluZU51bWJlcnMiLCJ0aGVtZSIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJpcyIsImZpbGVzIiwiZG9jdW1lbnQiLCJpbnB1dCIsIm51bUZpbGVzIiwiZ2V0IiwibGFiZWwiLCJyZXBsYWNlIiwidHJpZ2dlciIsImV2ZW50IiwicGFyZW50cyIsImZpbmQiLCJsb2ciLCJhbGVydCIsIm5hbWUiLCJvZmZpY2UiLCJwaG9uZSIsImFiYnJldmlhdGlvbiIsImRlc2NyaXB0aW9uIiwiZWZmZWN0aXZlX3llYXIiLCJlZmZlY3RpdmVfc2VtZXN0ZXIiLCJzdGFydF95ZWFyIiwic3RhcnRfc2VtZXN0ZXIiLCJkZWdyZWVwcm9ncmFtX2lkIiwic3R1ZGVudF9pZCIsImNob2ljZSIsImNvbmZpcm0iLCJhamF4YXV0b2NvbXBsZXRlIiwib3JkZXJpbmciLCJwbGFuX2lkIiwiY291cnNlbnVtYmVyIiwieWVhciIsInNlbWVzdGVyIiwiYmFzaXMiLCJncmFkZSIsImNyZWRpdHMiLCJzZWxlY3RlZCIsInNlbGVjdGVkVmFsIiwidHJhbnNmZXIiLCJpbmNvbWluZ19pbnN0aXR1dGlvbiIsImluY29taW5nX25hbWUiLCJpbmNvbWluZ19kZXNjcmlwdGlvbiIsImluY29taW5nX3NlbWVzdGVyIiwiaW5jb21pbmdfY3JlZGl0cyIsImluY29taW5nX2dyYWRlIiwic2hvd3NlbGVjdGVkIiwicHJvcCIsInNob3ciLCJoaWRlIiwiQXBwIiwiYWN0aW9ucyIsIlJvb3RSb3V0ZUNvbnRyb2xsZXIiLCJnZXRJbmRleCIsImVkaXRhYmxlIiwic2l0ZSIsImNoZWNrTWVzc2FnZSIsImdldEFib3V0IiwiQWR2aXNpbmdDb250cm9sbGVyIiwiY2FsZW5kYXIiLCJHcm91cHNlc3Npb25Db250cm9sbGVyIiwiZ2V0TGlzdCIsImdyb3Vwc2Vzc2lvbiIsIlByb2ZpbGVzQ29udHJvbGxlciIsInByb2ZpbGUiLCJEYXNoYm9hcmRDb250cm9sbGVyIiwiU3R1ZGVudHNDb250cm9sbGVyIiwiZ2V0U3R1ZGVudHMiLCJzdHVkZW50ZWRpdCIsImdldE5ld3N0dWRlbnQiLCJBZHZpc29yc0NvbnRyb2xsZXIiLCJnZXRBZHZpc29ycyIsImFkdmlzb3JlZGl0IiwiZ2V0TmV3YWR2aXNvciIsIkRlcGFydG1lbnRzQ29udHJvbGxlciIsImdldERlcGFydG1lbnRzIiwiZGVwYXJ0bWVudGVkaXQiLCJnZXROZXdkZXBhcnRtZW50IiwiTWVldGluZ3NDb250cm9sbGVyIiwiZ2V0TWVldGluZ3MiLCJtZWV0aW5nZWRpdCIsIkJsYWNrb3V0c0NvbnRyb2xsZXIiLCJnZXRCbGFja291dHMiLCJibGFja291dGVkaXQiLCJHcm91cHNlc3Npb25zQ29udHJvbGxlciIsImdldEdyb3Vwc2Vzc2lvbnMiLCJncm91cHNlc3Npb25lZGl0IiwiU2V0dGluZ3NDb250cm9sbGVyIiwiZ2V0U2V0dGluZ3MiLCJzZXR0aW5ncyIsIkRlZ3JlZXByb2dyYW1zQ29udHJvbGxlciIsImdldERlZ3JlZXByb2dyYW1zIiwiZGVncmVlcHJvZ3JhbWVkaXQiLCJnZXREZWdyZWVwcm9ncmFtRGV0YWlsIiwiZ2V0TmV3ZGVncmVlcHJvZ3JhbSIsIkVsZWN0aXZlbGlzdHNDb250cm9sbGVyIiwiZ2V0RWxlY3RpdmVsaXN0cyIsImVsZWN0aXZlbGlzdGVkaXQiLCJnZXRFbGVjdGl2ZWxpc3REZXRhaWwiLCJnZXROZXdlbGVjdGl2ZWxpc3QiLCJQbGFuc0NvbnRyb2xsZXIiLCJnZXRQbGFucyIsInBsYW5lZGl0IiwiZ2V0UGxhbkRldGFpbCIsInBsYW5kZXRhaWwiLCJnZXROZXdwbGFuIiwiUGxhbnNlbWVzdGVyc0NvbnRyb2xsZXIiLCJnZXRQbGFuU2VtZXN0ZXIiLCJwbGFuc2VtZXN0ZXJlZGl0IiwiZ2V0TmV3UGxhblNlbWVzdGVyIiwiQ29tcGxldGVkY291cnNlc0NvbnRyb2xsZXIiLCJnZXRDb21wbGV0ZWRjb3Vyc2VzIiwiY29tcGxldGVkY291cnNlZWRpdCIsImdldE5ld2NvbXBsZXRlZGNvdXJzZSIsIkZsb3djaGFydHNDb250cm9sbGVyIiwiZ2V0Rmxvd2NoYXJ0IiwiZmxvd2NoYXJ0IiwibmV3Rmxvd2NoYXJ0IiwiZWRpdEZsb3djaGFydCIsImNvbnRyb2xsZXIiLCJhY3Rpb24iLCJ3aW5kb3ciLCJfIiwiYXhpb3MiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJ0b2tlbiIsImhlYWQiLCJxdWVyeVNlbGVjdG9yIiwiY29udGVudCIsImNvbnNvbGUiLCJlcnJvciIsIm1vbWVudCIsImNhbGVuZGFyU2Vzc2lvbiIsImNhbGVuZGFyQWR2aXNvcklEIiwiY2FsZW5kYXJTdHVkZW50TmFtZSIsImNhbGVuZGFyRGF0YSIsImhlYWRlciIsImxlZnQiLCJjZW50ZXIiLCJyaWdodCIsImV2ZW50TGltaXQiLCJoZWlnaHQiLCJ3ZWVrZW5kcyIsImJ1c2luZXNzSG91cnMiLCJzdGFydCIsImVuZCIsImRvdyIsImRlZmF1bHRWaWV3Iiwidmlld3MiLCJhZ2VuZGEiLCJhbGxEYXlTbG90Iiwic2xvdER1cmF0aW9uIiwibWluVGltZSIsIm1heFRpbWUiLCJldmVudFNvdXJjZXMiLCJ0eXBlIiwiY29sb3IiLCJ0ZXh0Q29sb3IiLCJzZWxlY3RhYmxlIiwic2VsZWN0SGVscGVyIiwic2VsZWN0T3ZlcmxhcCIsInJlbmRlcmluZyIsInRpbWVGb3JtYXQiLCJkYXRlUGlja2VyRGF0YSIsImRheXNPZldlZWtEaXNhYmxlZCIsImZvcm1hdCIsInN0ZXBwaW5nIiwiZW5hYmxlZEhvdXJzIiwibWF4SG91ciIsInNpZGVCeVNpZGUiLCJpZ25vcmVSZWFkb25seSIsImFsbG93SW5wdXRUb2dnbGUiLCJkYXRlUGlja2VyRGF0ZU9ubHkiLCJhZHZpc29yIiwibm9iaW5kIiwidHJpbSIsIndpZHRoIiwicmVtb3ZlQ2xhc3MiLCJyZXNldEZvcm0iLCJiaW5kIiwibmV3U3R1ZGVudCIsInJlc2V0IiwiZWFjaCIsInRleHQiLCJsb2FkQ29uZmxpY3RzIiwiZnVsbENhbGVuZGFyIiwiYXV0b2NvbXBsZXRlIiwic2VydmljZVVybCIsImFqYXhTZXR0aW5ncyIsImRhdGFUeXBlIiwib25TZWxlY3QiLCJzdWdnZXN0aW9uIiwidHJhbnNmb3JtUmVzdWx0IiwicmVzcG9uc2UiLCJzdWdnZXN0aW9ucyIsIm1hcCIsImRhdGFJdGVtIiwidmFsdWUiLCJkYXRldGltZXBpY2tlciIsImxpbmtEYXRlUGlja2VycyIsImV2ZW50UmVuZGVyIiwiZWxlbWVudCIsImFkZENsYXNzIiwiZXZlbnRDbGljayIsInZpZXciLCJzdHVkZW50bmFtZSIsInNob3dNZWV0aW5nRm9ybSIsInJlcGVhdCIsImJsYWNrb3V0U2VyaWVzIiwibW9kYWwiLCJzZWxlY3QiLCJjaGFuZ2UiLCJyZXBlYXRDaGFuZ2UiLCJzYXZlQmxhY2tvdXQiLCJkZWxldGVCbGFja291dCIsImJsYWNrb3V0T2NjdXJyZW5jZSIsIm9mZiIsImUiLCJjcmVhdGVNZWV0aW5nRm9ybSIsImNyZWF0ZUJsYWNrb3V0Rm9ybSIsInJlc29sdmVDb25mbGljdHMiLCJ0aXRsZSIsImlzQWZ0ZXIiLCJzdHVkZW50U2VsZWN0Iiwic2F2ZU1lZXRpbmciLCJkZWxldGVNZWV0aW5nIiwiY2hhbmdlRHVyYXRpb24iLCJyZXNldENhbGVuZGFyIiwiZGlzcGxheU1lc3NhZ2UiLCJhamF4U2F2ZSIsInBvc3QiLCJ0aGVuIiwiY2F0Y2giLCJoYW5kbGVFcnJvciIsImFqYXhEZWxldGUiLCJub1Jlc2V0Iiwibm9DaG9pY2UiLCJkZXNjIiwic3RhdHVzIiwibWVldGluZ2lkIiwic3R1ZGVudGlkIiwiZHVyYXRpb25PcHRpb25zIiwidW5kZWZpbmVkIiwiaG91ciIsIm1pbnV0ZSIsImNsZWFyRm9ybUVycm9ycyIsImVtcHR5IiwibWludXRlcyIsImRpZmYiLCJlbGVtMSIsImVsZW0yIiwiZHVyYXRpb24iLCJkYXRlMiIsImRhdGUiLCJpc1NhbWUiLCJjbG9uZSIsImRhdGUxIiwiaXNCZWZvcmUiLCJuZXdEYXRlIiwiYWRkIiwiZGVsZXRlQ29uZmxpY3QiLCJlZGl0Q29uZmxpY3QiLCJyZXNvbHZlQ29uZmxpY3QiLCJpbmRleCIsImFwcGVuZFRvIiwiYnN0YXJ0IiwiYmVuZCIsImJ0aXRsZSIsImJibGFja291dGV2ZW50aWQiLCJiYmxhY2tvdXRpZCIsImJyZXBlYXQiLCJicmVwZWF0ZXZlcnkiLCJicmVwZWF0dW50aWwiLCJicmVwZWF0d2Vla2RheXNtIiwiYnJlcGVhdHdlZWtkYXlzdCIsImJyZXBlYXR3ZWVrZGF5c3ciLCJicmVwZWF0d2Vla2RheXN1IiwiYnJlcGVhdHdlZWtkYXlzZiIsInBhcmFtcyIsImJsYWNrb3V0X2lkIiwicmVwZWF0X3R5cGUiLCJyZXBlYXRfZXZlcnkiLCJyZXBlYXRfdW50aWwiLCJyZXBlYXRfZGV0YWlsIiwiU3RyaW5nIiwiaW5kZXhPZiIsInByb21wdCIsIlZ1ZSIsIkVjaG8iLCJQdXNoZXIiLCJpb24iLCJzb3VuZCIsInNvdW5kcyIsInZvbHVtZSIsInBhdGgiLCJwcmVsb2FkIiwidXNlcklEIiwicGFyc2VJbnQiLCJncm91cFJlZ2lzdGVyQnRuIiwiZ3JvdXBEaXNhYmxlQnRuIiwidm0iLCJlbCIsInF1ZXVlIiwib25saW5lIiwibWV0aG9kcyIsImdldENsYXNzIiwicyIsInVzZXJpZCIsImluQXJyYXkiLCJ0YWtlU3R1ZGVudCIsImdpZCIsImN1cnJlbnRUYXJnZXQiLCJkYXRhc2V0IiwiYWpheFBvc3QiLCJwdXRTdHVkZW50IiwiZG9uZVN0dWRlbnQiLCJkZWxTdHVkZW50IiwiZW52IiwibG9nVG9Db25zb2xlIiwiYnJvYWRjYXN0ZXIiLCJrZXkiLCJwdXNoZXJLZXkiLCJjbHVzdGVyIiwicHVzaGVyQ2x1c3RlciIsImNvbm5lY3RvciIsInB1c2hlciIsImNvbm5lY3Rpb24iLCJjb25jYXQiLCJjaGVja0J1dHRvbnMiLCJpbml0aWFsQ2hlY2tEaW5nIiwic29ydCIsInNvcnRGdW5jdGlvbiIsImNoYW5uZWwiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImhyZWYiLCJqb2luIiwiaGVyZSIsInVzZXJzIiwibGVuIiwiaSIsInB1c2giLCJqb2luaW5nIiwidXNlciIsImxlYXZpbmciLCJzcGxpY2UiLCJmb3VuZCIsImNoZWNrRGluZyIsImZpbHRlciIsImRpc2FibGVCdXR0b24iLCJyZWFsbHkiLCJhdHRyIiwiYm9keSIsInN1Ym1pdCIsImVuYWJsZUJ1dHRvbiIsInJlbW92ZUF0dHIiLCJmb3VuZE1lIiwicGVyc29uIiwicGxheSIsImEiLCJiIiwiRGF0YVRhYmxlIiwidG9nZ2xlQ2xhc3MiLCJsb2FkcGljdHVyZSIsImFqYXhtb2RhbHNhdmUiLCJhamF4IiwicmVsb2FkIiwic29mdCIsImFqYXhtb2RhbGRlbGV0ZSIsImFqYXhhdXRvY29tcGxldGVsb2NrIiwiYWpheGF1dG9jb21wbGV0ZXNldCIsIm1lc3NhZ2UiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwib3JkZXIiLCJub3RlcyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsIm9wdGlvbnMyIiwiY291cnNlX2lkX2xvY2siLCJjb21wbGV0ZWRjb3Vyc2VfaWRfbG9jayIsInNlbWVzdGVyX2lkIiwiY291cnNlX2lkIiwiY29tcGxldGVkY291cnNlX2lkIiwicGxhbmlkIiwibGlzdGl0ZW1zIiwicmVtb3ZlIiwiZGVncmVlcmVxdWlyZW1lbnRfaWQiLCJ0cnVuY2F0ZVRleHQiLCJjYXRhbG9nX2NvdXJzZSIsImNvbXBsZXRlZF9jb3Vyc2UiLCJkcmFnZ2FibGUiLCJzZW1lc3RlcnMiLCJlZGl0U2VtZXN0ZXIiLCJzYXZlU2VtZXN0ZXIiLCJkZWxldGVTZW1lc3RlciIsImRyb3BTZW1lc3RlciIsImRyb3BDb3Vyc2UiLCJlZGl0Q291cnNlIiwiY29tcG9uZW50cyIsImxvYWREYXRhIiwiYWRkU2VtZXN0ZXIiLCJhZGRDb3Vyc2UiLCJzYXZlQ291cnNlIiwiZGVsZXRlQ291cnNlIiwiZG9jdW1lbnRFbGVtZW50Iiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsImN1c3RvbSIsImNvbXBsZXRlIiwiY291cnNlcyIsInNlbWlkIiwidG9TZW1JbmRleCIsInRvIiwiaXRlbSIsImNvdXJzZUluZGV4Iiwic2VtSW5kZXgiLCJjb3Vyc2UiLCJjb21wbGV0ZWRjb3Vyc2VfbmFtZSIsInBsYW5yZXF1aXJlbWVudF9pZCIsInNldFRpbWVvdXQiLCJzZXRGb3JtRXJyb3JzIiwianNvbiIsInN1YnN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJtaW5DaGFycyIsImF1dG9TZWxlY3RGaXJzdCIsImNsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJodG1sU3RyaW5nIiwiY29udGVudHMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDs7QUFFQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0EsaUVBQWlFO0FBQ2pFLHFCQUFxQjtBQUNyQjtBQUNBLDRDQUE0QztBQUM1QztBQUNBLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsV0FBVztBQUN0QixlQUFlLGlDQUFpQztBQUNoRCxpQkFBaUIsaUJBQWlCO0FBQ2xDLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0UsV0FBVyx1QkFBdUI7QUFDbEMsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyw2QkFBNkI7QUFDM0MsV0FBVyx1QkFBdUI7QUFDbEMsY0FBYyxjQUFjO0FBQzVCLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsNkJBQTZCO0FBQzNDLFdBQVc7QUFDWCxHQUFHO0FBQ0gsZ0JBQWdCLFlBQVk7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckIsc0JBQXNCO0FBQ3RCLHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RDtBQUM3RCxTQUFTO0FBQ1QsdURBQXVEO0FBQ3ZEO0FBQ0EsT0FBTztBQUNQLDBEQUEwRDtBQUMxRDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxvQkFBb0I7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Z0IsSUFBaEI7QUFDRCxPQU5ELEVBT0N0SSxLQVBELENBT08sVUFBU3RHLEtBQVQsRUFBZTtBQUNwQnRILGNBQU0sNkJBQTZCc0gsTUFBTStELFFBQU4sQ0FBZTdOLElBQWxEO0FBQ0QsT0FURDtBQVVELEtBeEJEO0FBeUJELEdBMUJEOztBQTRCQTtBQUNBSCxJQUFFLGtCQUFGLEVBQXNCcU4sSUFBdEIsQ0FBMkIsWUFBVTtBQUNuQ3JOLE1BQUUsSUFBRixFQUFRa2QsS0FBUixDQUFjLFVBQVMxTixDQUFULEVBQVc7QUFDdkJBLFFBQUUyTixlQUFGO0FBQ0EzTixRQUFFNE4sY0FBRjs7QUFFQTtBQUNBLFVBQUkxYyxLQUFLVixFQUFFLElBQUYsRUFBUUcsSUFBUixDQUFhLElBQWIsQ0FBVDs7QUFFQTtBQUNBSCxRQUFFLGVBQWVVLEVBQWpCLEVBQXFCUSxVQUFyQixDQUFnQyxPQUFoQztBQUNBbEIsUUFBRSxlQUFlVSxFQUFqQixFQUFxQlEsVUFBckIsQ0FBZ0MsU0FBaEM7O0FBRUE7QUFDQWxCLFFBQUUscUJBQXFCVSxFQUF2QixFQUEyQnNNLFdBQTNCLENBQXVDLFFBQXZDO0FBQ0FoTixRQUFFLG1CQUFtQlUsRUFBckIsRUFBeUIrTixRQUF6QixDQUFrQyxRQUFsQztBQUNELEtBZEQ7QUFlRCxHQWhCRDtBQWlCRCxDQXRGRCxDIiwiZmlsZSI6Ii9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcbiAgICAgIGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2Fkdmlzb3JfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5hZHZpc29yX2lkID0gJCgnI2Fkdmlzb3JfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgZGF0YS5laWQgPSAkKCcjZWlkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3c3R1ZGVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9zdHVkZW50cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3YWR2aXNvclwiPk5ldyBBZHZpc29yPC9hPicpO1xuXG4gICQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKFwiaGlkZGVuXCIsICQoJyNoaWRkZW4nKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImRlcGFydG1lbnRfaWRcIiwgJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImVpZFwiLCAkKCcjZWlkJykudmFsKCkpO1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3YWR2aXNvcic7XG4gICAgfWVsc2V7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2Fkdmlzb3JzLycgKyBpZDtcbiAgICB9XG5cdFx0ZGFzaGJvYXJkLmFqYXhzYXZlKGZvcm1EYXRhLCB1cmwsIGlkLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0ID0gJCh0aGlzKSxcbiAgICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcbiAgICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG4gICAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcbiAgfSk7XG5cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKSxcbiAgICAgICAgICBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKCBpbnB1dC5sZW5ndGggKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKCBsb2cgKSBhbGVydChsb2cpO1xuICAgICAgfVxuXG4gIH0pO1xuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVwYXJ0bWVudFwiPk5ldyBEZXBhcnRtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgICBvZmZpY2U6ICQoJyNvZmZpY2UnKS52YWwoKSxcbiAgICAgIHBob25lOiAkKCcjcGhvbmUnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlcGFydG1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVwYXJ0bWVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXCI+TmV3IERlZ3JlZSBQcm9ncmFtPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV95ZWFyOiAkKCcjZWZmZWN0aXZlX3llYXInKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV9zZW1lc3RlcjogJCgnI2VmZmVjdGl2ZV9zZW1lc3RlcicpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVwcm9ncmFtcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2VsZWN0aXZlbGlzdFwiPk5ldyBFbGVjdGl2ZSBMaXN0PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWxpc3RzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdwbGFuXCI+TmV3IFBsYW48L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIHN0YXJ0X3llYXI6ICQoJyNzdGFydF95ZWFyJykudmFsKCksXG4gICAgICBzdGFydF9zZW1lc3RlcjogJCgnI3N0YXJ0X3NlbWVzdGVyJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW4nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVwb3B1bGF0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlcXVpcmVtZW50cyBhbmQgcmVwb3B1bGF0ZSB0aGVtIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBkZWdyZWUgcHJvZ3JhbS4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICAgdmFyIHVybCA9IFwiL2FkbWluL3BvcHVsYXRlcGxhblwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIHBsYW5faWQ6ICQoJyNwbGFuX2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy9uZXdwbGFuc2VtZXN0ZXIvJyArICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXIvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9wbGFucy9kZWxldGVwbGFuc2VtZXN0ZXIvXCIgKyAkKCcjaWQnKS52YWwoKSA7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zL1wiICsgJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2VcIj5OZXcgQ29tcGxldGVkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBjb3Vyc2VudW1iZXI6ICQoJyNjb3Vyc2VudW1iZXInKS52YWwoKSxcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICB5ZWFyOiAkKCcjeWVhcicpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgYmFzaXM6ICQoJyNiYXNpcycpLnZhbCgpLFxuICAgICAgZ3JhZGU6ICQoJyNncmFkZScpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI3N0dWRlbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5zdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3RyYW5zZmVyJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS50cmFuc2ZlciA9IGZhbHNlO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLnRyYW5zZmVyID0gdHJ1ZTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2luc3RpdHV0aW9uID0gJCgnI2luY29taW5nX2luc3RpdHV0aW9uJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19uYW1lID0gJCgnI2luY29taW5nX25hbWUnKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2Rlc2NyaXB0aW9uID0gJCgnI2luY29taW5nX2Rlc2NyaXB0aW9uJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19zZW1lc3RlciA9ICQoJyNpbmNvbWluZ19zZW1lc3RlcicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfY3JlZGl0cyA9ICQoJyNpbmNvbWluZ19jcmVkaXRzJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19ncmFkZSA9ICQoJyNpbmNvbWluZ19ncmFkZScpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlY29tcGxldGVkY291cnNlXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT10cmFuc2Zlcl0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG4gIGlmKCQoJyN0cmFuc2ZlcmNvdXJzZScpLmlzKCc6aGlkZGVuJykpe1xuICAgICQoJyN0cmFuc2ZlcjEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gIH1lbHNle1xuICAgICQoJyN0cmFuc2ZlcjInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gIH1cblxufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ndHJhbnNmZXInXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI2tzdGF0ZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI3RyYW5zZmVyY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNrc3RhdGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyN0cmFuc2ZlcmNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZGVzY3JpcHRpb246ICQoJyNkZXNjcmlwdGlvbicpLnZhbCgpLFxuICAgICAgc3RhcnRfeWVhcjogJCgnI3N0YXJ0X3llYXInKS52YWwoKSxcbiAgICAgIHN0YXJ0X3NlbWVzdGVyOiAkKCcjc3RhcnRfc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICB2YXIgc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvZmxvd2NoYXJ0cy9uZXcvJyArIHN0dWRlbnRfaWQ7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9mbG93Y2hhcnRzL2VkaXQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICB2YXIgdXJsID0gXCIvZmxvd2NoYXJ0cy9kZWxldGVcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvZmxvd2NoYXJ0cy9cIiArIHN0dWRlbnRfaWQ7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNyZXBvcHVsYXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSBhbGwgcmVxdWlyZW1lbnRzIGFuZCByZXBvcHVsYXRlIHRoZW0gYmFzZWQgb24gdGhlIHNlbGVjdGVkIGRlZ3JlZSBwcm9ncmFtLiBZb3UgY2Fubm90IHVuZG8gdGhpcyBhY3Rpb24uXCIpO1xuICBcdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgICB2YXIgdXJsID0gXCIvZmxvd2NoYXJ0cy9yZXNldFwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnRlZGl0LmpzIiwiLy9odHRwczovL2xhcmF2ZWwuY29tL2RvY3MvNS40L21peCN3b3JraW5nLXdpdGgtc2NyaXB0c1xuLy9odHRwczovL2FuZHktY2FydGVyLmNvbS9ibG9nL3Njb3BpbmctamF2YXNjcmlwdC1mdW5jdGlvbmFsaXR5LXRvLXNwZWNpZmljLXBhZ2VzLXdpdGgtbGFyYXZlbC1hbmQtY2FrZXBocFxuXG4vL0xvYWQgc2l0ZS13aWRlIGxpYnJhcmllcyBpbiBib290c3RyYXAgZmlsZVxucmVxdWlyZSgnLi9ib290c3RyYXAnKTtcblxudmFyIEFwcCA9IHtcblxuXHQvLyBDb250cm9sbGVyLWFjdGlvbiBtZXRob2RzXG5cdGFjdGlvbnM6IHtcblx0XHQvL0luZGV4IGZvciBkaXJlY3RseSBjcmVhdGVkIHZpZXdzIHdpdGggbm8gZXhwbGljaXQgY29udHJvbGxlclxuXHRcdFJvb3RSb3V0ZUNvbnRyb2xsZXI6IHtcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEFib3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXHRcdFx0fSxcbiAgICB9LFxuXG5cdFx0Ly9BZHZpc2luZyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkdmlzaW5nXG5cdFx0QWR2aXNpbmdDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkdmlzaW5nL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjYWxlbmRhciA9IHJlcXVpcmUoJy4vcGFnZXMvY2FsZW5kYXInKTtcblx0XHRcdFx0Y2FsZW5kYXIuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0dyb3Vwc2Vzc2lvbiBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2dyb3Vwc2Vzc2lvblxuICAgIEdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXI6IHtcblx0XHRcdC8vZ3JvdXBzZXNzaW9uL2luZGV4XG4gICAgICBnZXRJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcbiAgICAgIH0sXG5cdFx0XHQvL2dyb3Vwc2VzaW9uL2xpc3Rcblx0XHRcdGdldExpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uID0gcmVxdWlyZSgnLi9wYWdlcy9ncm91cHNlc3Npb24nKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdC8vUHJvZmlsZXMgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9wcm9maWxlXG5cdFx0UHJvZmlsZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL3Byb2ZpbGUvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHByb2ZpbGUgPSByZXF1aXJlKCcuL3BhZ2VzL3Byb2ZpbGUnKTtcblx0XHRcdFx0cHJvZmlsZS5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vRGFzaGJvYXJkIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWRtaW4tbHRlXG5cdFx0RGFzaGJvYXJkQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi91dGlsL2Rhc2hib2FyZCcpO1xuXHRcdFx0XHRkYXNoYm9hcmQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0U3R1ZGVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3N0dWRlbnRzXG5cdFx0XHRnZXRTdHVkZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld3N0dWRlbnRcblx0XHRcdGdldE5ld3N0dWRlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3R1ZGVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdCcpO1xuXHRcdFx0XHRzdHVkZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRBZHZpc29yc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vYWR2aXNvcnNcblx0XHRcdGdldEFkdmlzb3JzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3YWR2aXNvclxuXHRcdFx0Z2V0TmV3YWR2aXNvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhZHZpc29yZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0Jyk7XG5cdFx0XHRcdGFkdmlzb3JlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdERlcGFydG1lbnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZXBhcnRtZW50c1xuXHRcdFx0Z2V0RGVwYXJ0bWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZXBhcnRtZW50XG5cdFx0XHRnZXROZXdkZXBhcnRtZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlcGFydG1lbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQnKTtcblx0XHRcdFx0ZGVwYXJ0bWVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0TWVldGluZ3NDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL21lZXRpbmdzXG5cdFx0XHRnZXRNZWV0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBtZWV0aW5nZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0Jyk7XG5cdFx0XHRcdG1lZXRpbmdlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEJsYWNrb3V0c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vYmxhY2tvdXRzXG5cdFx0XHRnZXRCbGFja291dHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYmxhY2tvdXRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYmxhY2tvdXRlZGl0Jyk7XG5cdFx0XHRcdGJsYWNrb3V0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRHcm91cHNlc3Npb25zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ncm91cHNlc3Npb25zXG5cdFx0XHRnZXRHcm91cHNlc3Npb25zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ncm91cHNlc3Npb25lZGl0Jyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0U2V0dGluZ3NDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3NldHRpbmdzXG5cdFx0XHRnZXRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzJyk7XG5cdFx0XHRcdHNldHRpbmdzLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdERlZ3JlZXByb2dyYW1zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtc1xuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtL3tpZH1cblx0XHRcdGdldERlZ3JlZXByb2dyYW1EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsJyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2RlZ3JlZXByb2dyYW06IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVncmVlcHJvZ3JhbWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZWRpdCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRFbGVjdGl2ZWxpc3RzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtc1xuXHRcdFx0Z2V0RWxlY3RpdmVsaXN0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RWxlY3RpdmVsaXN0RGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RkZXRhaWwnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXG5cdFx0XHRnZXROZXdlbGVjdGl2ZWxpc3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRQbGFuc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vcGxhbnNcblx0XHRcdGdldFBsYW5zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vcGxhbi97aWR9XG5cdFx0XHRnZXRQbGFuRGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5kZXRhaWwgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsJyk7XG5cdFx0XHRcdHBsYW5kZXRhaWwuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhblxuXHRcdFx0Z2V0TmV3cGxhbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0Jyk7XG5cdFx0XHRcdHBsYW5lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zZW1lc3RlcnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3BsYW5zZW1lc3RlclxuXHRcdFx0Z2V0UGxhblNlbWVzdGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5zZW1lc3RlcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0Jyk7XG5cdFx0XHRcdHBsYW5zZW1lc3RlcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3cGxhbnNlbWVzdGVyXG5cdFx0XHRnZXROZXdQbGFuU2VtZXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbnNlbWVzdGVyZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQnKTtcblx0XHRcdFx0cGxhbnNlbWVzdGVyZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXG5cdFx0XHRnZXRDb21wbGV0ZWRjb3Vyc2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNvbXBsZXRlZGNvdXJzZWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0Jyk7XG5cdFx0XHRcdGNvbXBsZXRlZGNvdXJzZWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXG5cdFx0XHRnZXROZXdjb21wbGV0ZWRjb3Vyc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRGbG93Y2hhcnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9mbG93Y2hhcnRzL3ZpZXcvXG5cdFx0XHRnZXRGbG93Y2hhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZmxvd2NoYXJ0ID0gcmVxdWlyZSgnLi9wYWdlcy9mbG93Y2hhcnQnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydGxpc3QnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHRuZXdGbG93Y2hhcnQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydGVkaXQnKTtcblx0XHRcdFx0Zmxvd2NoYXJ0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHRlZGl0Rmxvd2NoYXJ0OiBmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgZmxvd2NoYXJ0ID0gcmVxdWlyZSgnLi9wYWdlcy9mbG93Y2hhcnRlZGl0Jyk7XG5cdFx0XHRcdGZsb3djaGFydC5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3aW5kb3cuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgalF1ZXJ5IGFuZCB0aGUgQm9vdHN0cmFwIGpRdWVyeSBwbHVnaW4gd2hpY2ggcHJvdmlkZXMgc3VwcG9ydFxuICogZm9yIEphdmFTY3JpcHQgYmFzZWQgQm9vdHN0cmFwIGZlYXR1cmVzIHN1Y2ggYXMgbW9kYWxzIGFuZCB0YWJzLiBUaGlzXG4gKiBjb2RlIG1heSBiZSBtb2RpZmllZCB0byBmaXQgdGhlIHNwZWNpZmljIG5lZWRzIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKi9cblxud2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgdGhlIGF4aW9zIEhUVFAgbGlicmFyeSB3aGljaCBhbGxvd3MgdXMgdG8gZWFzaWx5IGlzc3VlIHJlcXVlc3RzXG4gKiB0byBvdXIgTGFyYXZlbCBiYWNrLWVuZC4gVGhpcyBsaWJyYXJ5IGF1dG9tYXRpY2FsbHkgaGFuZGxlcyBzZW5kaW5nIHRoZVxuICogQ1NSRiB0b2tlbiBhcyBhIGhlYWRlciBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIFwiWFNSRlwiIHRva2VuIGNvb2tpZS5cbiAqL1xuXG53aW5kb3cuYXhpb3MgPSByZXF1aXJlKCdheGlvcycpO1xuXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9yYXBwYXNvZnQvbGFyYXZlbC01LWJvaWxlcnBsYXRlL2Jsb2IvbWFzdGVyL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzXG53aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbi8qKlxuICogTmV4dCB3ZSB3aWxsIHJlZ2lzdGVyIHRoZSBDU1JGIFRva2VuIGFzIGEgY29tbW9uIGhlYWRlciB3aXRoIEF4aW9zIHNvIHRoYXRcbiAqIGFsbCBvdXRnb2luZyBIVFRQIHJlcXVlc3RzIGF1dG9tYXRpY2FsbHkgaGF2ZSBpdCBhdHRhY2hlZC4gVGhpcyBpcyBqdXN0XG4gKiBhIHNpbXBsZSBjb252ZW5pZW5jZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGF0dGFjaCBldmVyeSB0b2tlbiBtYW51YWxseS5cbiAqL1xuXG5sZXQgdG9rZW4gPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKTtcblxuaWYgKHRva2VuKSB7XG4gICAgd2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUNTUkYtVE9LRU4nXSA9IHRva2VuLmNvbnRlbnQ7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NTUkYgdG9rZW4gbm90IGZvdW5kOiBodHRwczovL2xhcmF2ZWwuY29tL2RvY3MvY3NyZiNjc3JmLXgtY3NyZi10b2tlbicpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCIvL2xvYWQgcmVxdWlyZWQgSlMgbGlicmFyaWVzXG5yZXF1aXJlKCdmdWxsY2FsZW5kYXInKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcbnZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdlb25hc2Rhbi1ib290c3RyYXAtZGF0ZXRpbWVwaWNrZXItcnVzc2ZlbGQnKTtcbnZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4uL3V0aWwvZWRpdGFibGUnKTtcblxuLy9TZXNzaW9uIGZvciBzdG9yaW5nIGRhdGEgYmV0d2VlbiBmb3Jtc1xuZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblxuLy9JRCBvZiB0aGUgY3VycmVudGx5IGxvYWRlZCBjYWxlbmRhcidzIGFkdmlzb3JcbmV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAtMTtcblxuLy9TdHVkZW50J3MgTmFtZSBzZXQgYnkgaW5pdFxuZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gXCJcIjtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuZXhwb3J0cy5jYWxlbmRhckRhdGEgPSB7XG5cdGhlYWRlcjoge1xuXHRcdGxlZnQ6ICdwcmV2LG5leHQgdG9kYXknLFxuXHRcdGNlbnRlcjogJ3RpdGxlJyxcblx0XHRyaWdodDogJ2FnZW5kYVdlZWssYWdlbmRhRGF5J1xuXHR9LFxuXHRlZGl0YWJsZTogZmFsc2UsXG5cdGV2ZW50TGltaXQ6IHRydWUsXG5cdGhlaWdodDogJ2F1dG8nLFxuXHR3ZWVrZW5kczogZmFsc2UsXG5cdGJ1c2luZXNzSG91cnM6IHtcblx0XHRzdGFydDogJzg6MDAnLCAvLyBhIHN0YXJ0IHRpbWUgKDEwYW0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGVuZDogJzE3OjAwJywgLy8gYW4gZW5kIHRpbWUgKDZwbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZG93OiBbIDEsIDIsIDMsIDQsIDUgXVxuXHR9LFxuXHRkZWZhdWx0VmlldzogJ2FnZW5kYVdlZWsnLFxuXHR2aWV3czoge1xuXHRcdGFnZW5kYToge1xuXHRcdFx0YWxsRGF5U2xvdDogZmFsc2UsXG5cdFx0XHRzbG90RHVyYXRpb246ICcwMDoyMDowMCcsXG5cdFx0XHRtaW5UaW1lOiAnMDg6MDA6MDAnLFxuXHRcdFx0bWF4VGltZTogJzE3OjAwOjAwJ1xuXHRcdH1cblx0fSxcblx0ZXZlbnRTb3VyY2VzOiBbXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL21lZXRpbmdmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgbWVldGluZyBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnIzUxMjg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICd3aGl0ZScsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvYmxhY2tvdXRmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgYmxhY2tvdXQgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyNGRjg4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnYmxhY2snLFxuXHRcdH0sXG5cdF0sXG5cdHNlbGVjdGFibGU6IHRydWUsXG5cdHNlbGVjdEhlbHBlcjogdHJ1ZSxcblx0c2VsZWN0T3ZlcmxhcDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRyZXR1cm4gZXZlbnQucmVuZGVyaW5nID09PSAnYmFja2dyb3VuZCc7XG5cdH0sXG5cdHRpbWVGb3JtYXQ6ICcgJyxcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlXG5leHBvcnRzLmRhdGVQaWNrZXJEYXRhID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ0xMTCcsXG5cdFx0c3RlcHBpbmc6IDIwLFxuXHRcdGVuYWJsZWRIb3VyczogWzgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxN10sXG5cdFx0bWF4SG91cjogMTcsXG5cdFx0c2lkZUJ5U2lkZTogdHJ1ZSxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZSBkYXkgb25seVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTU0vREQvWVlZWScsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLyoqXG4gKiBJbml0aWFsemF0aW9uIGZ1bmN0aW9uIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gYWR2aXNvciAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgdXNlciBpcyBhbiBhZHZpc29yXG4gKiBAcGFyYW0gbm9iaW5kIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSBidXR0b25zIHNob3VsZCBub3QgYmUgYm91bmQgKG1ha2UgY2FsZW5kYXIgcmVhZC1vbmx5KVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vQ2hlY2sgZm9yIG1lc3NhZ2VzIGluIHRoZSBzZXNzaW9uIGZyb20gYSBwcmV2aW91cyBhY3Rpb25cblx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuXHQvL2luaXRhbGl6ZSBlZGl0YWJsZSBlbGVtZW50c1xuXHRlZGl0YWJsZS5pbml0KCk7XG5cblx0Ly90d2VhayBwYXJhbWV0ZXJzXG5cdHdpbmRvdy5hZHZpc29yIHx8ICh3aW5kb3cuYWR2aXNvciA9IGZhbHNlKTtcblx0d2luZG93Lm5vYmluZCB8fCAod2luZG93Lm5vYmluZCA9IGZhbHNlKTtcblxuXHQvL2dldCB0aGUgY3VycmVudCBhZHZpc29yJ3MgSURcblx0ZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9ICQoJyNjYWxlbmRhckFkdmlzb3JJRCcpLnZhbCgpLnRyaW0oKTtcblxuXHQvL1NldCB0aGUgYWR2aXNvciBpbmZvcm1hdGlvbiBmb3IgbWVldGluZyBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzBdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vU2V0IHRoZSBhZHZzaW9yIGluZm9yYW10aW9uIGZvciBibGFja291dCBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vaWYgdGhlIHdpbmRvdyBpcyBzbWFsbCwgc2V0IGRpZmZlcmVudCBkZWZhdWx0IGZvciBjYWxlbmRhclxuXHRpZigkKHdpbmRvdykud2lkdGgoKSA8IDYwMCl7XG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZGVmYXVsdFZpZXcgPSAnYWdlbmRhRGF5Jztcblx0fVxuXG5cdC8vSWYgbm9iaW5kLCBkb24ndCBiaW5kIHRoZSBmb3Jtc1xuXHRpZighd2luZG93Lm5vYmluZCl7XG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIGFuIGFkdmlzb3IsIGJpbmQgbW9yZSBkYXRhXG5cdFx0aWYod2luZG93LmFkdmlzb3Ipe1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjdGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNlbmQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNlbmRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2Jykuc2hvdygpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLnNob3coKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cblx0XHRcdC8vYmluZCBtZXRob2RzIGZvciBidXR0b25zIGFuZCBmb3Jtc1xuXHRcdFx0JCgnI25ld1N0dWRlbnRCdXR0b24nKS5iaW5kKCdjbGljaycsIG5ld1N0dWRlbnQpO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNidGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0XHRcdCAgICAkKHRoaXMpLmZpbmQoJy5oYXMtZXJyb3InKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykudGV4dCgnJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL2JpbmQgYXV0b2NvbXBsZXRlIGZpZWxkXG5cdFx0XHQkKCcjc3R1ZGVudGlkJykuYXV0b2NvbXBsZXRlKHtcblx0XHRcdCAgICBzZXJ2aWNlVXJsOiAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnLFxuXHRcdFx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHRcdFx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0XHRcdCAgICAgICAgJCgnI3N0dWRlbnRpZHZhbCcpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0ICAgICAgICByZXR1cm4ge1xuXHRcdFx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdFx0XHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdFx0XHQgICAgICAgICAgICB9KVxuXHRcdFx0ICAgICAgICB9O1xuXHRcdFx0ICAgIH1cblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjc3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI3N0YXJ0JywgJyNlbmQnLCAnI2R1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnN0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2JlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjYnN0YXJ0JywgJyNiZW5kJywgJyNiZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNicmVwZWF0dW50aWxfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5KTtcblxuXHRcdFx0Ly9jaGFuZ2UgcmVuZGVyaW5nIG9mIGV2ZW50c1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0XHRcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1jbGlja2FibGVcIik7XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAnbScpe1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWQnKS52YWwoZXZlbnQuc3R1ZGVudG5hbWUpO1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0fWVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRcdGV2ZW50OiBldmVudFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYoZXZlbnQucmVwZWF0ID09ICcwJyl7XG5cdFx0XHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdFx0XHRlbmQ6IGVuZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvL2JpbmQgbW9yZSBidXR0b25zXG5cdFx0XHQkKCcjYnJlcGVhdCcpLmNoYW5nZShyZXBlYXRDaGFuZ2UpO1xuXG5cdFx0XHQkKCcjc2F2ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0U2VyaWVzJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dE9jY3VycmVuY2UnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0T2NjdXJyZW5jZSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNhZHZpc2luZ0J1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZU1lZXRpbmdCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9mZignaGlkZGVuLmJzLm1vZGFsJyk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0QnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdCQoJyNyZXNvbHZlQnV0dG9uJykub24oJ2NsaWNrJywgcmVzb2x2ZUNvbmZsaWN0cyk7XG5cblx0XHRcdGxvYWRDb25mbGljdHMoKTtcblxuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBub3QgYW4gYWR2aXNvciwgYmluZCBsZXNzIGRhdGFcblx0XHR9ZWxzZXtcblxuXHRcdFx0Ly9HZXQgdGhlIGN1cnJlbnQgc3R1ZGVudCdzIG5hbWVcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9ICQoJyNjYWxlbmRhclN0dWRlbnROYW1lJykudmFsKCkudHJpbSgpO1xuXG5cdFx0ICAvL1JlbmRlciBibGFja291dHMgdG8gYmFja2dyb3VuZFxuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcblxuXHRcdCAgLy9XaGVuIHJlbmRlcmluZywgdXNlIHRoaXMgY3VzdG9tIGZ1bmN0aW9uIGZvciBibGFja291dHMgYW5kIHN0dWRlbnQgbWVldGluZ3Ncblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdFx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHRcdCAgICB9XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdFx0ICAgIH1cblx0XHRcdH07XG5cblx0XHQgIC8vVXNlIHRoaXMgbWV0aG9kIGZvciBjbGlja2luZyBvbiBtZWV0aW5nc1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdFx0XHRcdGlmKGV2ZW50LnN0YXJ0LmlzQWZ0ZXIobW9tZW50KCkpKXtcblx0XHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydChcIllvdSBjYW5ub3QgZWRpdCBtZWV0aW5ncyBpbiB0aGUgcGFzdFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHQgIC8vV2hlbiBzZWxlY3RpbmcgbmV3IGFyZWFzLCB1c2UgdGhlIHN0dWRlbnRTZWxlY3QgbWV0aG9kIGluIHRoZSBjYWxlbmRhciBsaWJyYXJ5XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBzdHVkZW50U2VsZWN0O1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjZGVzYycpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0X3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoXCIjZW5kXCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI2VuZF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcubW9kYWwnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblx0XHR9XG5cblx0XHQvL0JpbmQgY2xpY2sgaGFuZGxlcnMgb24gdGhlIGZvcm1cblx0XHQkKCcjc2F2ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZU1lZXRpbmcpO1xuXHRcdCQoJyNkZWxldGVCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZU1lZXRpbmcpO1xuXHRcdCQoJyNkdXJhdGlvbicpLm9uKCdjaGFuZ2UnLCBjaGFuZ2VEdXJhdGlvbik7XG5cblx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycyB3aXRoIG5vIGJpbmRpbmdcblx0fWVsc2V7XG5cdFx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycywgc2V0IHJlbmRlcmluZyB0byBiYWNrZ3JvdW5kXG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3RhYmxlID0gZmFsc2U7XG5cbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHQgICAgfVxuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdCAgICB9XG5cdFx0fTtcblx0fVxuXG5cdC8vaW5pdGFsaXplIHRoZSBjYWxlbmRhciFcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKGV4cG9ydHMuY2FsZW5kYXJEYXRhKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBjYWxlbmRhciBieSBjbG9zaW5nIG1vZGFscyBhbmQgcmVsb2FkaW5nIGRhdGFcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBqUXVlcnkgaWRlbnRpZmllciBvZiB0aGUgZm9ybSB0byBoaWRlIChhbmQgdGhlIHNwaW4pXG4gKiBAcGFyYW0gcmVwb25zZSAtIHRoZSBBeGlvcyByZXBzb25zZSBvYmplY3QgcmVjZWl2ZWRcbiAqL1xudmFyIHJlc2V0Q2FsZW5kYXIgPSBmdW5jdGlvbihlbGVtZW50LCByZXNwb25zZSl7XG5cdC8vaGlkZSB0aGUgZm9ybVxuXHQkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9kaXNwbGF5IHRoZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG5cdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXG5cdC8vcmVmcmVzaCB0aGUgY2FsZW5kYXJcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0aWYod2luZG93LmFkdmlzb3Ipe1xuXHRcdGxvYWRDb25mbGljdHMoKTtcblx0fVxufVxuXG4vKipcbiAqIEFKQVggbWV0aG9kIHRvIHNhdmUgZGF0YSBmcm9tIGEgZm9ybVxuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIHNvdXJjZSBlbGVtZW50IG9mIHRoZSBkYXRhXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4U2F2ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uKXtcblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0ICAvL2lmIHJlc3BvbnNlIGlzIDJ4eFxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdH0pXG5cdFx0Ly9pZiByZXNwb25zZSBpcyBub3QgMnh4XG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0fSk7XG59XG5cbnZhciBhamF4RGVsZXRlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24sIG5vUmVzZXQsIG5vQ2hvaWNlKXtcblx0Ly9jaGVjayBub1Jlc2V0IHZhcmlhYmxlXG5cdG5vUmVzZXQgfHwgKG5vUmVzZXQgPSBmYWxzZSk7XG5cdG5vQ2hvaWNlIHx8IChub0Nob2ljZSA9IGZhbHNlKTtcblxuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uXG5cdGlmKCFub0Nob2ljZSl7XG5cdFx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHR9ZWxzZXtcblx0XHR2YXIgY2hvaWNlID0gdHJ1ZTtcblx0fVxuXG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cblx0XHQvL2lmIGNvbmZpcm1lZCwgc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL21ha2UgQUpBWCByZXF1ZXN0IHRvIGRlbGV0ZVxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYobm9SZXNldCl7XG5cdFx0XHRcdFx0Ly9oaWRlIHBhcmVudCBlbGVtZW50IC0gVE9ETyBURVNUTUVcblx0XHRcdFx0XHQvL2NhbGxlci5wYXJlbnQoKS5wYXJlbnQoKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50KS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2F2ZSBhIG1lZXRpbmdcbiAqL1xudmFyIHNhdmVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUV2ZW50c3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdHN0YXJ0OiBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdGVuZDogbW9tZW50KCQoJyNlbmQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0dGl0bGU6ICQoJyN0aXRsZScpLnZhbCgpLFxuXHRcdGRlc2M6ICQoJyNkZXNjJykudmFsKCksXG5cdFx0c3RhdHVzOiAkKCcjc3RhdHVzJykudmFsKClcblx0fTtcblx0ZGF0YS5pZCA9IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQ7XG5cdGlmKCQoJyNtZWV0aW5nSUQnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEubWVldGluZ2lkID0gJCgnI21lZXRpbmdJRCcpLnZhbCgpO1xuXHR9XG5cdGlmKCQoJyNzdHVkZW50aWR2YWwnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEuc3R1ZGVudGlkID0gJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpO1xuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZW1lZXRpbmcnO1xuXG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnc2F2ZSBtZWV0aW5nJyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgdXJsXG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogJCgnI21lZXRpbmdJRCcpLnZhbCgpXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnZGVsZXRlIG1lZXRpbmcnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHBvcHVsYXRlIGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGVkaXRpbmdcbiAqXG4gKiBAcGFyYW0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gZWRpdFxuICovXG52YXIgc2hvd01lZXRpbmdGb3JtID0gZnVuY3Rpb24oZXZlbnQpe1xuXHQkKCcjdGl0bGUnKS52YWwoZXZlbnQudGl0bGUpO1xuXHQkKCcjc3RhcnQnKS52YWwoZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2VuZCcpLnZhbChldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2Rlc2MnKS52YWwoZXZlbnQuZGVzYyk7XG5cdGR1cmF0aW9uT3B0aW9ucyhldmVudC5zdGFydCwgZXZlbnQuZW5kKTtcblx0JCgnI21lZXRpbmdJRCcpLnZhbChldmVudC5pZCk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdCQoJyNzdGF0dXMnKS52YWwoZXZlbnQuc3RhdHVzKTtcblx0JCgnI2RlbGV0ZUJ1dHRvbicpLnNob3coKTtcblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgY3JlYXRpb25cbiAqXG4gKiBAcGFyYW0gY2FsZW5kYXJTdHVkZW50TmFtZSAtIHN0cmluZyBuYW1lIG9mIHRoZSBzdHVkZW50XG4gKi9cbnZhciBjcmVhdGVNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGNhbGVuZGFyU3R1ZGVudE5hbWUpe1xuXG5cdC8vcG9wdWxhdGUgdGhlIHRpdGxlIGF1dG9tYXRpY2FsbHkgZm9yIGEgc3R1ZGVudFxuXHRpZihjYWxlbmRhclN0dWRlbnROYW1lICE9PSB1bmRlZmluZWQpe1xuXHRcdCQoJyN0aXRsZScpLnZhbChjYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fWVsc2V7XG5cdFx0JCgnI3RpdGxlJykudmFsKCcnKTtcblx0fVxuXG5cdC8vU2V0IHN0YXJ0IHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3N0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjc3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGVuZCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2VuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGR1cmF0aW9uIG9wdGlvbnNcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0ZHVyYXRpb25PcHRpb25zKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLCBtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkpO1xuXHR9ZWxzZXtcblx0XHRkdXJhdGlvbk9wdGlvbnMoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQsIGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCk7XG5cdH1cblxuXHQvL1Jlc2V0IG90aGVyIG9wdGlvbnNcblx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdC8vSGlkZSBkZWxldGUgYnV0dG9uXG5cdCQoJyNkZWxldGVCdXR0b24nKS5oaWRlKCk7XG5cblx0Ly9TaG93IHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gb24gdGhpcyBwYWdlXG4gKi9cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICAkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzZXQgZHVyYXRpb24gb3B0aW9ucyBmb3IgdGhlIG1lZXRpbmcgZm9ybVxuICpcbiAqIEBwYXJhbSBzdGFydCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IHRpbWVcbiAqIEBwYXJhbSBlbmQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmRpbmcgdGltZVxuICovXG52YXIgZHVyYXRpb25PcHRpb25zID0gZnVuY3Rpb24oc3RhcnQsIGVuZCl7XG5cdC8vY2xlYXIgdGhlIGxpc3Rcblx0JCgnI2R1cmF0aW9uJykuZW1wdHkoKTtcblxuXHQvL2Fzc3VtZSBhbGwgbWVldGluZ3MgaGF2ZSByb29tIGZvciAyMCBtaW51dGVzXG5cdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzIwJz4yMCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjIwLCBhbGxvdyA0MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAyMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzQwJz40MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MDAsIGFsbG93IDYwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc2MCc+NjAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vc2V0IGRlZmF1bHQgdmFsdWUgYmFzZWQgb24gZ2l2ZW4gc3BhblxuXHQkKCcjZHVyYXRpb24nKS52YWwoZW5kLmRpZmYoc3RhcnQsIFwibWludXRlc1wiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxpbmsgdGhlIGRhdGVwaWNrZXJzIHRvZ2V0aGVyXG4gKlxuICogQHBhcmFtIGVsZW0xIC0galF1ZXJ5IG9iamVjdCBmb3IgZmlyc3QgZGF0ZXBpY2tlclxuICogQHBhcmFtIGVsZW0yIC0galF1ZXJ5IG9iamVjdCBmb3Igc2Vjb25kIGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBsaW5rRGF0ZVBpY2tlcnMgPSBmdW5jdGlvbihlbGVtMSwgZWxlbTIsIGR1cmF0aW9uKXtcblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gZmlyc3QgZGF0YXBpY2tlclxuXHQkKGVsZW0xICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMiA9IG1vbWVudCgkKGVsZW0yKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0FmdGVyKGRhdGUyKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUyKSl7XG5cdFx0XHRkYXRlMiA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMikudmFsKGRhdGUyLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBzZWNvbmQgZGF0ZXBpY2tlclxuXHQkKGVsZW0yICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMSA9IG1vbWVudCgkKGVsZW0xKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0JlZm9yZShkYXRlMSkgfHwgZS5kYXRlLmlzU2FtZShkYXRlMSkpe1xuXHRcdFx0ZGF0ZTEgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTEpLnZhbChkYXRlMS5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGNoYW5nZUR1cmF0aW9uID0gZnVuY3Rpb24oKXtcblx0dmFyIG5ld0RhdGUgPSBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksICdMTEwnKS5hZGQoJCh0aGlzKS52YWwoKSwgXCJtaW51dGVzXCIpO1xuXHQkKCcjZW5kJykudmFsKG5ld0RhdGUuZm9ybWF0KFwiTExMXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmVyaWZ5IHRoYXQgdGhlIHN0dWRlbnRzIGFyZSBzZWxlY3RpbmcgbWVldGluZ3MgdGhhdCBhcmVuJ3QgdG9vIGxvbmdcbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgb2YgdGhlIG1lZXRpbmdcbiAqIEBwYXJhbSBlbmQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBzdHVkZW50U2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXG5cdC8vV2hlbiBzdHVkZW50cyBzZWxlY3QgYSBtZWV0aW5nLCBkaWZmIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzXG5cdGlmKGVuZC5kaWZmKHN0YXJ0LCAnbWludXRlcycpID4gNjApe1xuXG5cdFx0Ly9pZiBpbnZhbGlkLCB1bnNlbGVjdCBhbmQgc2hvdyBhbiBlcnJvclxuXHRcdGFsZXJ0KFwiTWVldGluZ3MgY2Fubm90IGxhc3QgbG9uZ2VyIHRoYW4gMSBob3VyXCIpO1xuXHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0fWVsc2V7XG5cblx0XHQvL2lmIHZhbGlkLCBzZXQgZGF0YSBpbiB0aGUgc2Vzc2lvbiBhbmQgc2hvdyB0aGUgZm9ybVxuXHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0ZW5kOiBlbmRcblx0XHR9O1xuXHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdGNyZWF0ZU1lZXRpbmdGb3JtKGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1cbn07XG5cbi8qKlxuICogTG9hZCBjb25mbGljdGluZyBtZWV0aW5ncyBmcm9tIHRoZSBzZXJ2ZXJcbiAqL1xudmFyIGxvYWRDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXG5cdC8vcmVxdWVzdCBjb25mbGljdHMgdmlhIEFKQVhcblx0d2luZG93LmF4aW9zLmdldCgnL2FkdmlzaW5nL2NvbmZsaWN0cycpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXG5cdFx0XHQvL2Rpc2FibGUgZXhpc3RpbmcgY2xpY2sgaGFuZGxlcnNcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgMjAwLCBkYXRhIHdhcyByZWNlaXZlZFxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IDIwMCl7XG5cblx0XHRcdFx0Ly9BcHBlbmQgSFRNTCBmb3IgY29uZmxpY3RzIHRvIERPTVxuXHRcdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKS5lbXB0eSgpO1xuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0XHRcdFx0XHQkKCc8ZGl2Lz4nLCB7XG5cdFx0XHRcdFx0XHQnaWQnIDogJ3Jlc29sdmUnK3ZhbHVlLmlkLFxuXHRcdFx0XHRcdFx0J2NsYXNzJzogJ21lZXRpbmctY29uZmxpY3QnLFxuXHRcdFx0XHRcdFx0J2h0bWwnOiBcdCc8cD4mbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIHB1bGwtcmlnaHQgZGVsZXRlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz48aSBjbGFzcz1cImZhIGZhLXRyYXNoXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPiBEZWxldGU8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCcmbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBwdWxsLXJpZ2h0IGVkaXRDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPjxpIGNsYXNzPVwiZmEgZmEtcGVuY2lsXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPiBFZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+PGkgY2xhc3M9XCJmYSBmYS1mbG9wcHktb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gS2VlcDwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxzcGFuIGlkPVwicmVzb2x2ZScrdmFsdWUuaWQrJ3NwaW5cIiBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluIGZhLWxnIHB1bGwtcmlnaHQgaGlkZS1zcGluXCI+Jm5ic3A7PC9zcGFuPicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnPGI+Jyt2YWx1ZS50aXRsZSsnPC9iPiAoJyt2YWx1ZS5zdGFydCsnKTwvcD48aHI+J1xuXHRcdFx0XHRcdFx0fSkuYXBwZW5kVG8oJyNyZXNvbHZlQ29uZmxpY3RNZWV0aW5ncycpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvL1JlLXJlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZGVsZXRlQ29uZmxpY3QnLCBkZWxldGVDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHRcdC8vU2hvdyB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cblx0XHQgIC8vSWYgcmVzcG9uc2UgaXMgMjA0LCBubyBjb25mbGljdHMgYXJlIHByZXNlbnRcblx0XHRcdH1lbHNlIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDQpe1xuXG5cdFx0XHRcdC8vSGlkZSB0aGUgPGRpdj4gY29udGFpbmluZyBjb25mbGljdHNcblx0XHRcdFx0JCgnI2NvbmZsaWN0aW5nTWVldGluZ3MnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gcmV0cmlldmUgY29uZmxpY3RpbmcgbWVldGluZ3M6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fSk7XG59XG5cbi8qKlxuICogU2F2ZSBibGFja291dHMgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgc2F2ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUJsYWNrb3V0c3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgdXJsO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRic3RhcnQ6IG1vbWVudCgkKCcjYnN0YXJ0JykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRiZW5kOiBtb21lbnQoJCgnI2JlbmQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJ0aXRsZTogJCgnI2J0aXRsZScpLnZhbCgpXG5cdH07XG5cdHZhciB1cmw7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEuYmJsYWNrb3V0ZXZlbnRpZCA9ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCk7XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXQnO1xuXHRcdGlmKCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpID4gMCl7XG5cdFx0XHRkYXRhLmJibGFja291dGlkID0gJCgnI2JibGFja291dGlkJykudmFsKCk7XG5cdFx0fVxuXHRcdGRhdGEuYnJlcGVhdCA9ICQoJyNicmVwZWF0JykudmFsKCk7XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAxKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5PSAkKCcjYnJlcGVhdGRhaWx5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdFx0aWYoJCgnI2JyZXBlYXQnKS52YWwoKSA9PSAyKXtcblx0XHRcdGRhdGEuYnJlcGVhdGV2ZXJ5ID0gJCgnI2JyZXBlYXR3ZWVrbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzbSA9ICQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN0ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3cgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdSA9ICQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNmID0gJCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR1bnRpbCA9IG1vbWVudCgkKCcjYnJlcGVhdHVudGlsJykudmFsKCksIFwiTU0vREQvWVlZWVwiKS5mb3JtYXQoKTtcblx0XHR9XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhTYXZlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdzYXZlIGJsYWNrb3V0Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBibGFja291dCBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBkZWxldGVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBVUkwgYW5kIGRhdGEgb2JqZWN0XG5cdHZhciB1cmwsIGRhdGE7XG5cdGlmKCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgPiAwKXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0ZXZlbnQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGV2ZW50aWQ6ICQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKCkgfTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0aWQ6ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpIH07XG5cdH1cblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ2RlbGV0ZSBibGFja291dCcsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGhhbmRsaW5nIHRoZSBjaGFuZ2Ugb2YgcmVwZWF0IG9wdGlvbnMgb24gdGhlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIHJlcGVhdENoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQodGhpcykudmFsKCkgPT0gMCl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDEpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAyKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLnNob3coKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1cbn07XG5cbi8qKlxuICogU2hvdyB0aGUgcmVzb2x2ZSBjb25mbGljdHMgbW9kYWwgZm9ybVxuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0cyA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZGVsZXRlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdC8vc2VuZCBBSkFYIGRlbGV0ZVxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAnZGVsZXRlIG1lZXRpbmcnLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBFZGl0IGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGVkaXRDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvbWVldGluZyc7XG5cblx0Ly9zaG93IHNwaW5uZXIgdG8gbG9hZCBtZWV0aW5nXG5cdCQoJyNyZXNvbHZlJysgaWQgKyAnc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2xvYWQgbWVldGluZyBhbmQgZGlzcGxheSBmb3JtXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNyZXNvbHZlJysgaWQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0ZXZlbnQgPSByZXNwb25zZS5kYXRhO1xuXHRcdFx0ZXZlbnQuc3RhcnQgPSBtb21lbnQoZXZlbnQuc3RhcnQpO1xuXHRcdFx0ZXZlbnQuZW5kID0gbW9tZW50KGV2ZW50LmVuZCk7XG5cdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIG1lZXRpbmcnLCAnI3Jlc29sdmUnICsgaWQsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogUmVzb2x2ZSBhIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIHJlc29sdmVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvcmVzb2x2ZWNvbmZsaWN0JztcblxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNyZXNvbHZlJyArIGlkLCAncmVzb2x2ZSBtZWV0aW5nJywgdHJ1ZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgY3JlYXRlIGJsYWNrb3V0IGZvcm1cbiAqL1xudmFyIGNyZWF0ZUJsYWNrb3V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNidGl0bGUnKS52YWwoXCJcIik7XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KCkuaG91cig4KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KCkuaG91cig5KS5taW51dGUoMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbCgtMSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCQoJyNicmVwZWF0JykudmFsKDApO1xuXHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5oaWRlKCk7XG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIHRvIGEgc2luZ2xlIG9jY3VycmVuY2VcbiAqL1xudmFyIGJsYWNrb3V0T2NjdXJyZW5jZSA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vc2V0IGZvcm0gdmFsdWVzIGFuZCBoaWRlIHVubmVlZGVkIGZpZWxkc1xuXHQkKCcjYnRpdGxlJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnRpdGxlKTtcblx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI3JlcGVhdGRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZCk7XG5cdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmlkKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXG5cdC8vc2hvdyB0aGUgZm9ybVxuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgYmxhY2tvdXQgc2VyaWVzIGVkaXQgZm9ybVxuICovXG52YXIgYmxhY2tvdXRTZXJpZXMgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cbiBcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGRhdGEgPSB7XG5cdFx0aWQ6IGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvYmxhY2tvdXQnO1xuXG5cdHdpbmRvdy5heGlvcy5nZXQodXJsLCB7XG5cdFx0XHRwYXJhbXM6IGRhdGFcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdCQoJyNidGl0bGUnKS52YWwocmVzcG9uc2UuZGF0YS50aXRsZSlcblx0IFx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnN0YXJ0LCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLmVuZCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwocmVzcG9uc2UuZGF0YS5pZCk7XG5cdCBcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHQgXHRcdCQoJyNyZXBlYXRkaXYnKS5zaG93KCk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSk7XG5cdCBcdFx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0IFx0XHRpZihyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDEpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXRkYWlseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fWVsc2UgaWYgKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMil7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtseScpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF9ldmVyeSk7XG5cdFx0XHRcdHZhciByZXBlYXRfZGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLmRhdGEucmVwZWF0X2RldGFpbCk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiMlwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzMycpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiM1wiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNFwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnLCAocmVwZWF0X2RldGFpbC5pbmRleE9mKFwiNVwiKSA+PSAwKSk7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdHVudGlsJykudmFsKG1vbWVudChyZXNwb25zZS5kYXRhLnJlcGVhdF91bnRpbCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ01NL0REL1lZWVknKSk7XG5cdCBcdFx0fVxuXHQgXHRcdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblx0IFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIGJsYWNrb3V0IHNlcmllcycsICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBzdHVkZW50IGluIHRoZSBkYXRhYmFzZVxuICovXG52YXIgbmV3U3R1ZGVudCA9IGZ1bmN0aW9uKCl7XG5cdC8vcHJvbXB0IHRoZSB1c2VyIGZvciBhbiBlSUQgdG8gYWRkIHRvIHRoZSBzeXN0ZW1cblx0dmFyIGVpZCA9IHByb21wdChcIkVudGVyIHRoZSBzdHVkZW50J3MgZUlEXCIpO1xuXG5cdC8vYnVpbGQgdGhlIFVSTCBhbmQgZGF0YVxuXHR2YXIgZGF0YSA9IHtcblx0XHRlaWQ6IGVpZCxcblx0fTtcblx0dmFyIHVybCA9ICcvcHJvZmlsZS9uZXdzdHVkZW50JztcblxuXHQvL3NlbmQgQUpBWCBwb3N0XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRhbGVydChyZXNwb25zZS5kYXRhKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdFx0XHRpZihlcnJvci5yZXNwb25zZS5zdGF0dXMgPT0gNDIyKXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhW1wiZWlkXCJdKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2NhbGVuZGFyLmpzIiwid2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnZhciBFY2hvID0gcmVxdWlyZSgnbGFyYXZlbC1lY2hvJyk7XG5yZXF1aXJlKCdpb24tc291bmQnKTtcblxud2luZG93LlB1c2hlciA9IHJlcXVpcmUoJ3B1c2hlci1qcycpO1xuXG4vKipcbiAqIEdyb3Vwc2Vzc2lvbiBpbml0IGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IHRvIHN0YXJ0XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9sb2FkIGlvbi1zb3VuZCBsaWJyYXJ5XG5cdGlvbi5zb3VuZCh7XG4gICAgc291bmRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwiZG9vcl9iZWxsXCJcbiAgICAgICAgfSxcbiAgICBdLFxuICAgIHZvbHVtZTogMS4wLFxuICAgIHBhdGg6IFwiL3NvdW5kcy9cIixcbiAgICBwcmVsb2FkOiB0cnVlXG5cdH0pO1xuXG5cdC8vZ2V0IHVzZXJJRCBhbmQgaXNBZHZpc29yIHZhcmlhYmxlc1xuXHR3aW5kb3cudXNlcklEID0gcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKTtcblxuXHQvL3JlZ2lzdGVyIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLm9uKCdjbGljaycsIGdyb3VwUmVnaXN0ZXJCdG4pO1xuXG5cdC8vZGlzYWJsZSBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwRGlzYWJsZUJ0bicpLm9uKCdjbGljaycsIGdyb3VwRGlzYWJsZUJ0bik7XG5cblx0Ly9yZW5kZXIgVnVlIEFwcFxuXHR3aW5kb3cudm0gPSBuZXcgVnVlKHtcblx0XHRlbDogJyNncm91cExpc3QnLFxuXHRcdGRhdGE6IHtcblx0XHRcdHF1ZXVlOiBbXSxcblx0XHRcdGFkdmlzb3I6IHBhcnNlSW50KCQoJyNpc0Fkdmlzb3InKS52YWwoKSkgPT0gMSxcblx0XHRcdHVzZXJJRDogcGFyc2VJbnQoJCgnI3VzZXJJRCcpLnZhbCgpKSxcblx0XHRcdG9ubGluZTogW10sXG5cdFx0fSxcblx0XHRtZXRob2RzOiB7XG5cdFx0XHQvL0Z1bmN0aW9uIHRvIGdldCBDU1MgY2xhc3NlcyBmb3IgYSBzdHVkZW50IG9iamVjdFxuXHRcdFx0Z2V0Q2xhc3M6IGZ1bmN0aW9uKHMpe1xuXHRcdFx0XHRyZXR1cm57XG5cdFx0XHRcdFx0J2FsZXJ0LWluZm8nOiBzLnN0YXR1cyA9PSAwIHx8IHMuc3RhdHVzID09IDEsXG5cdFx0XHRcdFx0J2FsZXJ0LXN1Y2Nlc3MnOiBzLnN0YXR1cyA9PSAyLFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tbWUnOiBzLnVzZXJpZCA9PSB0aGlzLnVzZXJJRCxcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW9mZmxpbmUnOiAkLmluQXJyYXkocy51c2VyaWQsIHRoaXMub25saW5lKSA9PSAtMSxcblx0XHRcdFx0fTtcblx0XHRcdH0sXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHRha2UgYSBzdHVkZW50IGZyb20gdGhlIGxpc3Rcblx0XHRcdHRha2VTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vdGFrZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAndGFrZScpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly9mdW5jdGlvbiB0byBwdXQgYSBzdHVkZW50IGJhY2sgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdFxuXHRcdFx0cHV0U3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3B1dCdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAncHV0Jyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvLyBmdW5jdGlvbiB0byBtYXJrIGEgc3R1ZGVudCBkb25lIG9uIHRoZSBsaXN0XG5cdFx0XHRkb25lU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RvbmUnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ21hcmsgZG9uZScpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly9mdW5jdGlvbiB0byBkZWxldGUgYSBzdHVkZW50IGZyb20gdGhlIGxpc3Rcblx0XHRcdGRlbFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kZWxldGUnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ2RlbGV0ZScpO1xuXHRcdFx0fSxcblx0XHR9LFxuXHR9KVxuXG5cblx0Ly9FbmFibGUgUHVzaGVyIGxvZ2dpbmdcblx0aWYod2luZG93LmVudiA9PSBcImxvY2FsXCIgfHwgd2luZG93LmVudiA9PSBcInN0YWdpbmdcIil7XG5cdFx0Y29uc29sZS5sb2coXCJQdXNoZXIgbG9nZ2luZyBlbmFibGVkIVwiKTtcblx0XHRQdXNoZXIubG9nVG9Db25zb2xlID0gdHJ1ZTtcblx0fVxuXG5cdC8vTG9hZCB0aGUgRWNobyBpbnN0YW5jZSBvbiB0aGUgd2luZG93XG5cdHdpbmRvdy5FY2hvID0gbmV3IEVjaG8oe1xuXHRcdGJyb2FkY2FzdGVyOiAncHVzaGVyJyxcblx0XHRrZXk6IHdpbmRvdy5wdXNoZXJLZXksXG5cdFx0Y2x1c3Rlcjogd2luZG93LnB1c2hlckNsdXN0ZXIsXG5cdH0pO1xuXG5cdC8vQmluZCB0byB0aGUgY29ubmVjdGVkIGFjdGlvbiBvbiBQdXNoZXIgKGNhbGxlZCB3aGVuIGNvbm5lY3RlZClcblx0d2luZG93LkVjaG8uY29ubmVjdG9yLnB1c2hlci5jb25uZWN0aW9uLmJpbmQoJ2Nvbm5lY3RlZCcsIGZ1bmN0aW9uKCl7XG5cdFx0Ly93aGVuIGNvbm5lY3RlZCwgZGlzYWJsZSB0aGUgc3Bpbm5lclxuXHRcdCQoJyNncm91cHNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL0xvYWQgdGhlIGluaXRpYWwgc3R1ZGVudCBxdWV1ZSB2aWEgQUpBWFxuXHRcdHdpbmRvdy5heGlvcy5nZXQoJy9ncm91cHNlc3Npb24vcXVldWUnKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHR3aW5kb3cudm0ucXVldWUgPSB3aW5kb3cudm0ucXVldWUuY29uY2F0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRjaGVja0J1dHRvbnMod2luZG93LnZtLnF1ZXVlKTtcblx0XHRcdFx0aW5pdGlhbENoZWNrRGluZyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHR3aW5kb3cudm0ucXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBxdWV1ZScsICcnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSlcblxuXHQvL0Nvbm5lY3QgdG8gdGhlIGdyb3Vwc2Vzc2lvbiBjaGFubmVsXG5cdC8qXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbicpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZGF0YSkgPT4ge1xuXG5cdFx0fSk7XG4gKi9cblxuXHQvL0Nvbm5lY3QgdG8gdGhlIGdyb3Vwc2Vzc2lvbmVuZCBjaGFubmVsXG5cdHdpbmRvdy5FY2hvLmNoYW5uZWwoJ2dyb3Vwc2Vzc2lvbmVuZCcpXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uRW5kJywgKGUpID0+IHtcblxuXHRcdFx0Ly9pZiBlbmRpbmcsIHJlZGlyZWN0IGJhY2sgdG8gaG9tZSBwYWdlXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2dyb3Vwc2Vzc2lvblwiO1xuXHR9KTtcblxuXHR3aW5kb3cuRWNoby5qb2luKCdwcmVzZW5jZScpXG5cdFx0LmhlcmUoKHVzZXJzKSA9PiB7XG5cdFx0XHR2YXIgbGVuID0gdXNlcnMubGVuZ3RoO1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0d2luZG93LnZtLm9ubGluZS5wdXNoKHVzZXJzW2ldLmlkKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5qb2luaW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlci5pZCk7XG5cdFx0fSlcblx0XHQubGVhdmluZygodXNlcikgPT4ge1xuXHRcdFx0d2luZG93LnZtLm9ubGluZS5zcGxpY2UoICQuaW5BcnJheSh1c2VyLmlkLCB3aW5kb3cudm0ub25saW5lKSwgMSk7XG5cdFx0fSlcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cdFx0XHR2YXIgcXVldWUgPSB3aW5kb3cudm0ucXVldWU7XG5cdFx0XHR2YXIgZm91bmQgPSBmYWxzZTtcblx0XHRcdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cblx0XHRcdC8vdXBkYXRlIHRoZSBxdWV1ZSBiYXNlZCBvbiByZXNwb25zZVxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRcdFx0aWYocXVldWVbaV0uaWQgPT09IGRhdGEuaWQpe1xuXHRcdFx0XHRcdGlmKGRhdGEuc3RhdHVzIDwgMyl7XG5cdFx0XHRcdFx0XHRxdWV1ZVtpXSA9IGRhdGE7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRxdWV1ZS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0XHRsZW4tLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vaWYgZWxlbWVudCBub3QgZm91bmQgb24gY3VycmVudCBxdWV1ZSwgcHVzaCBpdCBvbiB0byB0aGUgcXVldWVcblx0XHRcdGlmKCFmb3VuZCl7XG5cdFx0XHRcdHF1ZXVlLnB1c2goZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vY2hlY2sgdG8gc2VlIGlmIGN1cnJlbnQgdXNlciBpcyBvbiBxdWV1ZSBiZWZvcmUgZW5hYmxpbmcgYnV0dG9uXG5cdFx0XHRjaGVja0J1dHRvbnMocXVldWUpO1xuXG5cdFx0XHQvL2lmIGN1cnJlbnQgdXNlciBpcyBmb3VuZCwgY2hlY2sgZm9yIHN0YXR1cyB1cGRhdGUgdG8gcGxheSBzb3VuZFxuXHRcdFx0aWYoZGF0YS51c2VyaWQgPT09IHVzZXJJRCl7XG5cdFx0XHRcdGNoZWNrRGluZyhkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9zb3J0IHRoZSBxdWV1ZSBjb3JyZWN0bHlcblx0XHRcdHF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblxuXHRcdFx0Ly91cGRhdGUgVnVlIHN0YXRlLCBtaWdodCBiZSB1bm5lY2Vzc2FyeVxuXHRcdFx0d2luZG93LnZtLnF1ZXVlID0gcXVldWU7XG5cdFx0fSk7XG5cbn07XG5cblxuLyoqXG4gKiBWdWUgZmlsdGVyIGZvciBzdGF0dXMgdGV4dFxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIHN0dWRlbnQgdG8gcmVuZGVyXG4gKi9cblZ1ZS5maWx0ZXIoJ3N0YXR1c3RleHQnLCBmdW5jdGlvbihkYXRhKXtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDApIHJldHVybiBcIk5FV1wiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMSkgcmV0dXJuIFwiUVVFVUVEXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAyKSByZXR1cm4gXCJNRUVUIFdJVEggXCIgKyBkYXRhLmFkdmlzb3I7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAzKSByZXR1cm4gXCJERUxBWVwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNCkgcmV0dXJuIFwiQUJTRU5UXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA1KSByZXR1cm4gXCJET05FXCI7XG59KTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgY2xpY2tpbmcgb24gdGhlIHJlZ2lzdGVyIGJ1dHRvblxuICovXG52YXIgZ3JvdXBSZWdpc3RlckJ0biA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3JlZ2lzdGVyJztcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCB7fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdGRpc2FibGVCdXR0b24oKTtcblx0XHRcdCQoJyNncm91cHNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmVnaXN0ZXInLCAnI2dyb3VwJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgYWR2aXNvcnMgdG8gZGlzYWJsZSBncm91cHNlc3Npb25cbiAqL1xudmFyIGdyb3VwRGlzYWJsZUJ0biA9IGZ1bmN0aW9uKCl7XG5cdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcblx0XHR2YXIgcmVhbGx5ID0gY29uZmlybShcIlNlcmlvdXNseSwgdGhpcyB3aWxsIGxvc2UgYWxsIGN1cnJlbnQgZGF0YS4gQXJlIHlvdSByZWFsbHkgc3VyZT9cIik7XG5cdFx0aWYocmVhbGx5ID09PSB0cnVlKXtcblx0XHRcdC8vdGhpcyBpcyBhIGJpdCBoYWNreSwgYnV0IGl0IHdvcmtzXG5cdFx0XHR2YXIgdG9rZW4gPSAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpO1xuXHRcdFx0JCgnPGZvcm0gYWN0aW9uPVwiL2dyb3Vwc2Vzc2lvbi9kaXNhYmxlXCIgbWV0aG9kPVwiUE9TVFwiLz4nKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImlkXCIgdmFsdWU9XCInICsgd2luZG93LnVzZXJJRCArICdcIj4nKSlcblx0XHRcdFx0LmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJfdG9rZW5cIiB2YWx1ZT1cIicgKyB0b2tlbiArICdcIj4nKSlcblx0XHRcdFx0LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpIC8vaXQgaGFzIHRvIGJlIGFkZGVkIHNvbWV3aGVyZSBpbnRvIHRoZSA8Ym9keT5cblx0XHRcdFx0LnN1Ym1pdCgpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGVuYWJsZSByZWdpc3RyYXRpb24gYnV0dG9uXG4gKi9cbnZhciBlbmFibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGlzYWJsZSByZWdpc3RyYXRpb24gYnV0dG9uXG4gKi9cbnZhciBkaXNhYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGFuZCBzZWUgaWYgdXNlciBpcyBvbiB0aGUgbGlzdCAtIGlmIG5vdCwgZG9uJ3QgZW5hYmxlIGJ1dHRvblxuICovXG52YXIgY2hlY2tCdXR0b25zID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHR2YXIgZm91bmRNZSA9IGZhbHNlO1xuXG5cdC8vaXRlcmF0ZSB0aHJvdWdoIHVzZXJzIG9uIGxpc3QsIGxvb2tpbmcgZm9yIGN1cnJlbnQgdXNlclxuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gd2luZG93LnVzZXJJRCl7XG5cdFx0XHRmb3VuZE1lID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8vaWYgZm91bmQsIGRpc2FibGUgYnV0dG9uOyBpZiBub3QsIGVuYWJsZSBidXR0b25cblx0aWYoZm91bmRNZSl7XG5cdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHR9ZWxzZXtcblx0XHRlbmFibGVCdXR0b24oKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGJlY2tvbmVkLCBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcGVyc29uIC0gdGhlIGN1cnJlbnQgdXNlciB0byBjaGVja1xuICovXG52YXIgY2hlY2tEaW5nID0gZnVuY3Rpb24ocGVyc29uKXtcblx0aWYocGVyc29uLnN0YXR1cyA9PSAyKXtcblx0XHRpb24uc291bmQucGxheShcImRvb3JfYmVsbFwiKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBwZXJzb24gaGFzIGJlZW4gYmVja29uZWQgb24gbG9hZDsgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHF1ZXVlIC0gdGhlIGluaXRpYWwgcXVldWUgb2YgdXNlcnMgbG9hZGVkXG4gKi9cbnZhciBpbml0aWFsQ2hlY2tEaW5nID0gZnVuY3Rpb24ocXVldWUpe1xuXHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdGlmKHF1ZXVlW2ldLnVzZXJpZCA9PT0gd2luZG93LnVzZXJJRCl7XG5cdFx0XHRjaGVja0RpbmcocXVldWVbaV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHNvcnQgZWxlbWVudHMgYmFzZWQgb24gdGhlaXIgc3RhdHVzXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBwZXJzb25cbiAqIEBwYXJhbSBiIC0gc2Vjb25kIHBlcnNvblxuICogQHJldHVybiAtIHNvcnRpbmcgdmFsdWUgaW5kaWNhdGluZyB3aG8gc2hvdWxkIGdvIGZpcnN0X25hbWVcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLnN0YXR1cyA9PSBiLnN0YXR1cyl7XG5cdFx0cmV0dXJuIChhLmlkIDwgYi5pZCA/IC0xIDogMSk7XG5cdH1cblx0cmV0dXJuIChhLnN0YXR1cyA8IGIuc3RhdHVzID8gMSA6IC0xKTtcbn1cblxuXG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIG1ha2luZyBBSkFYIFBPU1QgcmVxdWVzdHNcbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmliaW5nIHRoZSBhY3Rpb25cbiAqL1xudmFyIGFqYXhQb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBhY3Rpb24pe1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sICcnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9ncm91cHNlc3Npb24uanMiLCJ2YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnY29kZW1pcnJvcicpO1xucmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbnJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQkKCcjbm90ZXMnKS5zdW1tZXJub3RlKHtcblx0XHRmb2N1czogdHJ1ZSxcblx0XHR0b29sYmFyOiBbXG5cdFx0XHQvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cblx0XHRcdFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcblx0XHRcdFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcblx0XHRcdFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuXHRcdFx0WydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG5cdFx0XSxcblx0XHR0YWJzaXplOiAyLFxuXHRcdGNvZGVtaXJyb3I6IHtcblx0XHRcdG1vZGU6ICd0ZXh0L2h0bWwnLFxuXHRcdFx0aHRtbE1vZGU6IHRydWUsXG5cdFx0XHRsaW5lTnVtYmVyczogdHJ1ZSxcblx0XHRcdHRoZW1lOiAnbW9ub2thaSdcblx0XHR9LFxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3Igc2F2ZSBidXR0b25cblx0JCgnI3NhdmVQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGZpcnN0X25hbWU6ICQoJyNmaXJzdF9uYW1lJykudmFsKCksXG5cdFx0XHRsYXN0X25hbWU6ICQoJyNsYXN0X25hbWUnKS52YWwoKSxcblx0XHR9O1xuXHRcdHZhciB1cmwgPSAnL3Byb2ZpbGUvdXBkYXRlJztcblxuXHRcdC8vc2VuZCBBSkFYIHBvc3Rcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZXNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSlcblx0fSk7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIGFkdmlzb3Igc2F2ZSBidXR0b25cblx0JCgnI3NhdmVBZHZpc29yUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0Ly9UT0RPIFRFU1RNRVxuXHRcdHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJ2Zvcm0nKVswXSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwib2ZmaWNlXCIsICQoJyNvZmZpY2UnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGRhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuXHRcdHZhciB1cmwgPSAnL3Byb2ZpbGUvdXBkYXRlJztcblxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0d2luZG93LmF4aW9zLmdldCgnL3Byb2ZpbGUvcGljJylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHQkKCcjcGljdGV4dCcpLnZhbChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHRcdCQoJyNwaWNpbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBwaWN0dXJlJywgJycsIGVycm9yKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHQvL2h0dHA6Ly93d3cuYWJlYXV0aWZ1bHNpdGUubmV0L3doaXBwaW5nLWZpbGUtaW5wdXRzLWludG8tc2hhcGUtd2l0aC1ib290c3RyYXAtMy9cblx0JChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuYnRuLWZpbGUgOmZpbGUnLCBmdW5jdGlvbigpIHtcblx0ICB2YXIgaW5wdXQgPSAkKHRoaXMpLFxuXHQgICAgICBudW1GaWxlcyA9IGlucHV0LmdldCgwKS5maWxlcyA/IGlucHV0LmdldCgwKS5maWxlcy5sZW5ndGggOiAxLFxuXHQgICAgICBsYWJlbCA9IGlucHV0LnZhbCgpLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC8uKlxcLy8sICcnKTtcblx0ICBpbnB1dC50cmlnZ2VyKCdmaWxlc2VsZWN0JywgW251bUZpbGVzLCBsYWJlbF0pO1xuXHR9KTtcblxuXHQvL2JpbmQgdG8gZmlsZXNlbGVjdCBidXR0b25cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKTtcblx0XHRcdHZhciBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICAgaWYobG9nKXtcblx0XHRcdFx0XHRcdGFsZXJ0KGxvZyk7XG5cdFx0XHRcdFx0fVxuICAgICAgfVxuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCIvL2xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnYWRtaW4tbHRlJyk7XG5yZXF1aXJlKCdkYXRhdGFibGVzLm5ldCcpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQtYnMnKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcblxuLy9vcHRpb25zIGZvciBkYXRhdGFibGVzXG5leHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMgPSB7XG4gIFwicGFnZUxlbmd0aFwiOiA1MCxcbiAgXCJsZW5ndGhDaGFuZ2VcIjogZmFsc2UsXG59XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgb24gYWxsIGRhdGF0YWJsZXMgcGFnZXNcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIGN1c3RvbSBkYXRhdGFibGVzIG9wdGlvbnNcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSBleHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMpO1xuICAkKCcjdGFibGUnKS5EYXRhVGFibGUob3B0aW9ucyk7XG4gIHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cbiAgJCgnI2FkbWlubHRlLXRvZ2dsZW1lbnUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnc2lkZWJhci1vcGVuJyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHNhdmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGlkIC0gdGhlIGlkIG9mIHRoZSBpdGVtIHRvIGJlIHNhdmUtZGV2XG4gKiBAcGFyYW0gbG9hZHBpY3R1cmUgLSB0cnVlIHRvIHJlbG9hZCBhIHByb2ZpbGUgcGljdHVyZVxuICovXG5leHBvcnRzLmFqYXhzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBpZCwgbG9hZHBpY3R1cmUpe1xuICBsb2FkcGljdHVyZSB8fCAobG9hZHBpY3R1cmUgPSBmYWxzZSk7XG4gICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmVzcG9uc2UuZGF0YSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgIGlmKGxvYWRwaWN0dXJlKSBleHBvcnRzLmxvYWRwaWN0dXJlKGlkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYIG9uIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgcGljdHVyZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSB1c2VyIElEIG9mIHRoZSBwaWN0dXJlIHRvIHJlbG9hZFxuICovXG5leHBvcnRzLmxvYWRwaWN0dXJlID0gZnVuY3Rpb24oaWQpe1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgJCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuICAgIH0pXG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG8gYWZ0ZXIgZGVsZXRlXG4gKiBAcGFyYW0gc29mdCAtIGJvb2xlYW4gaWYgdGhpcyBpcyBhIHNvZnQgZGVsZXRlIG9yIG5vdFxuICovXG5leHBvcnRzLmFqYXhkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCByZXRVcmwsIHNvZnQgPSBmYWxzZSl7XG4gIGlmKHNvZnQpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgfWVsc2V7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlbGF0ZWQgcmVjb3Jkcy4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgfVxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW0gZnJvbSBhIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBtb2RhbCBlbGVtZW50IHRvIGNsb3NlXG4gKi9cbmV4cG9ydHMuYWpheG1vZGFsZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgZWxlbWVudCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc3RvcmUgYSBzb2Z0LWRlbGV0ZWQgaXRlbVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGl0ZW0gdG8gYmUgcmVzdG9yZWRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhhdCBpbmZvcm1hdGlvbiB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvXG4gKi9cbmV4cG9ydHMuYWpheHJlc3RvcmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIHJldFVybCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmVzdG9yZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGUgPSBmdW5jdGlvbihpZCwgdXJsKXtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlKGlkLCB1cmwpO1xufVxuXG5leHBvcnRzLmFqYXhhdXRvY29tcGxldGVsb2NrID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZWxvY2soaWQsIHVybCk7XG59XG5cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZXNldCA9IGZ1bmN0aW9uKGlkLCB2YWx1ZSl7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZXNldChpZCwgdmFsdWUpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWJsYWNrb3V0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2JsYWNrb3V0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gIC8vJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWdyb3Vwc2Vzc2lvblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ncm91cHNlc3Npb25zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgLy9sb2FkIGN1c3RvbSBidXR0b24gb24gdGhlIGRvbVxuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgLy9iaW5kIHNldHRpbmdzIGJ1dHRvbnNcbiAgJCgnLnNldHRpbmdzYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgIH07XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vc2F2ZXNldHRpbmcnO1xuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9iaW5kIG5ldyBzZXR0aW5nIGJ1dHRvblxuICAkKCcjbmV3c2V0dGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IHByb21wdChcIkVudGVyIGEgbmFtZSBmb3IgdGhlIG5ldyBzZXR0aW5nOlwiKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogY2hvaWNlLFxuICAgIH07XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL25ld3NldHRpbmdcIlxuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignY3JlYXRlJywgJycsIGVycm9yKVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2RlZ3JlZXByb2dyYW1yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFszLCBcImFzY1wiXSxcbiAgICBbNCwgXCJhc2NcIl0sXG4gIF07XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5OZXcgRGVncmVlIFJlcXVpcmVtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZWdyZWVyZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjc2VtZXN0ZXInKS52YWwobWVzc2FnZS5kYXRhLnNlbWVzdGVyKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZWxlY3RpdmVsaXN0Y291cnNlcy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFsxLCBcImFzY1wiXSxcbiAgXTtcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPkFkZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZWxlY3RpdmVsaXN0X2lkOiAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCksXG4gICAgICBjb3Vyc2VfcHJlZml4OiAkKCcjY291cnNlX3ByZWZpeCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWluX251bWJlciA9ICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWF4X251bWJlciA9ICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVlbGVjdGl2ZWNvdXJzZVwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpO1xuICB9KTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS52YWwoJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVjb3Vyc2UvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX3ByZWZpeCk7XG4gICAgICAgICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21pbl9udW1iZXIpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpO1xuICAgICAgICAgICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChcIlwiKTtcbiAgICAgICAgICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBlbGVjdGl2ZSBsaXN0IGNvdXJzZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgJCgnaW5wdXRbbmFtZT1yYW5nZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmFuZ2UyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZGV0YWlsLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9wbGFucmVxdWlyZW1lbnRzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnZWxlY3RpdmVsaXN0X2FiYnInfSxcbiAgICB7J2RhdGEnOiAnY3JlZGl0cyd9LFxuICAgIHsnZGF0YSc6ICdzZW1lc3Rlcid9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdub3Rlcyd9LFxuICAgIHsnZGF0YSc6ICdjYXRhbG9nX2NvdXJzZSd9LFxuICAgIHsnZGF0YSc6ICdjb21wbGV0ZWRfY291cnNlJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XTtcbiAgb3B0aW9ucy5vcmRlciA9IFtcbiAgICBbNCwgXCJhc2NcIl0sXG4gICAgWzUsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IFBsYW4gUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgLy9hZGRlZCBmb3IgbmV3IHNlbWVzdGVycyB0YWJsZVxuICB2YXIgb3B0aW9uczIgPSB7XG4gICAgXCJwYWdlTGVuZ3RoXCI6IDUwLFxuICAgIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxuICB9XG4gIG9wdGlvbnMyLmRvbSA9ICc8XCJuZXdidXR0b24yXCI+ZnJ0aXAnO1xuICBvcHRpb25zMi5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMyLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9uczIuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0c2VtXFxcIiBocmVmPVxcXCIvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyL1wiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dO1xuICBvcHRpb25zMi5vcmRlciA9IFtcbiAgICBbMiwgXCJhc2NcIl0sXG4gIF07XG4gICQoJyN0YWJsZXNlbScpLkRhdGFUYWJsZShvcHRpb25zMik7XG5cbiAgJChcImRpdi5uZXdidXR0b24yXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyBpZCArICdcIiBpZD1cIm5ldzJcIj5OZXcgU2VtZXN0ZXI8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgICAgY291cnNlX2lkX2xvY2s6ICQoJyNjb3Vyc2VfaWRsb2NrJykudmFsKCksXG4gICAgICBjb21wbGV0ZWRjb3Vyc2VfaWRfbG9jazogJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGxvY2snKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNzZW1lc3Rlcl9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLnNlbWVzdGVyX2lkID0gJCgnI3NlbWVzdGVyX2lkJykudmFsKCk7XG4gICAgfVxuICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAnJztcbiAgICB9XG4gICAgaWYoJCgnI2NvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmNvdXJzZV9pZCA9ICQoJyNjb3Vyc2VfaWQnKS52YWwoKTtcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGEuY291cnNlX2lkID0gJyc7XG4gICAgfVxuICAgIGlmKCQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgPSAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCA9ICcnO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFucmVxdWlyZW1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI3BsYW5yZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXBsYW5yZXF1aXJlbWVudFwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICB2YXIgcGxhbmlkID0gJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KCcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVycy8nICsgcGxhbmlkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHZhciBsaXN0aXRlbXMgPSAnJztcbiAgICAgICAgJC5lYWNoKG1lc3NhZ2UuZGF0YSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgbGlzdGl0ZW1zICs9ICc8b3B0aW9uIHZhbHVlPScgKyB2YWx1ZS5pZCArICc+JyArIHZhbHVlLm5hbWUgKyc8L29wdGlvbj4nO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCkuZW5kKCkuYXBwZW5kKGxpc3RpdGVtcyk7XG4gICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLnZhbChzZW1lc3Rlcl9pZCk7XG4gICAgICAgICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5yZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgd2luZG93LmF4aW9zLmdldCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgJCgnI2lkJykudmFsKG1lc3NhZ2UuZGF0YS5pZCk7XG4gICAgICAgICQoJyNvcmRlcmluZycpLnZhbChtZXNzYWdlLmRhdGEub3JkZXJpbmcpO1xuICAgICAgICAkKCcjY3JlZGl0cycpLnZhbChtZXNzYWdlLmRhdGEuY3JlZGl0cyk7XG4gICAgICAgICQoJyNub3RlcycpLnZhbChtZXNzYWdlLmRhdGEubm90ZXMpO1xuICAgICAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRfaWQnKS52YWwobWVzc2FnZS5kYXRhLmRlZ3JlZXJlcXVpcmVtZW50X2lkKTtcbiAgICAgICAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICAgICAkKCcjY291cnNlX25hbWUnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9uYW1lKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X25hbWUsIDMwKSk7XG4gICAgICAgICQoJyNjb3Vyc2VfaWQnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9pZCk7XG4gICAgICAgICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQobWVzc2FnZS5kYXRhLmNhdGFsb2dfY291cnNlLCAzMCkpO1xuICAgICAgICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZXNldCgnY291cnNlX2lkJywgbWVzc2FnZS5kYXRhLmNvdXJzZV9pZF9sb2NrKTtcbiAgICAgICAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbChtZXNzYWdlLmRhdGEuY29tcGxldGVkY291cnNlX2lkKTtcbiAgICAgICAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuY29tcGxldGVkX2NvdXJzZSwgMzApKTtcbiAgICAgICAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsIG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWRfbG9jayk7XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG5cbiAgICAgICAgdmFyIHNlbWVzdGVyX2lkID0gbWVzc2FnZS5kYXRhLnNlbWVzdGVyX2lkO1xuXG4gICAgICAgIC8vbG9hZCBzZW1lc3RlcnNcbiAgICAgICAgdmFyIHBsYW5pZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgICAgIHdpbmRvdy5heGlvcy5nZXQoJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXJzLycgKyBwbGFuaWQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICAgICB2YXIgbGlzdGl0ZW1zID0gJyc7XG4gICAgICAgICAgICAkLmVhY2gobWVzc2FnZS5kYXRhLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICAgICAgbGlzdGl0ZW1zICs9ICc8b3B0aW9uIHZhbHVlPScgKyB2YWx1ZS5pZCArICc+JyArIHZhbHVlLm5hbWUgKyc8L29wdGlvbj4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKS5lbmQoKS5hcHBlbmQobGlzdGl0ZW1zKTtcbiAgICAgICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLnZhbChzZW1lc3Rlcl9pZCk7XG4gICAgICAgICAgICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgc2VtZXN0ZXJzJywgJycsIGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSByZXF1aXJlbWVudCcsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICB9KTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZWxvY2soJ2NvdXJzZV9pZCcsICcvY291cnNlcy9jb3Vyc2VmZWVkJyk7XG5cbiAgdmFyIHN0dWRlbnRfaWQgPSAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpO1xuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZWxvY2soJ2NvbXBsZXRlZGNvdXJzZV9pZCcsICcvY29tcGxldGVkY291cnNlcy9jb21wbGV0ZWRjb3Vyc2VmZWVkLycgKyBzdHVkZW50X2lkKTtcbn07XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNzZW1lc3RlcicpLnZhbChcIlwiKTtcbiAgJCgnI29yZGVyaW5nJykudmFsKFwiXCIpO1xuICAkKCcjY3JlZGl0cycpLnZhbChcIlwiKTtcbiAgJCgnI25vdGVzJykudmFsKFwiXCIpO1xuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRfaWQnKS52YWwoXCJcIik7XG4gICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZXNldCgnY291cnNlX2lkJywgMCk7XG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlc2V0KCdjb21wbGV0ZWRjb3Vyc2VfaWQnLCAwKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwuanMiLCJ2YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xud2luZG93LlZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xudmFyIGRyYWdnYWJsZSA9IHJlcXVpcmUoJ3Z1ZWRyYWdnYWJsZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2Zsb3djaGFydCcsXG5cdFx0ZGF0YToge1xuICAgICAgc2VtZXN0ZXJzOiBbXSxcblx0XHR9LFxuICAgIG1ldGhvZHM6IHtcbiAgICAgIGVkaXRTZW1lc3RlcjogZWRpdFNlbWVzdGVyLFxuICAgICAgc2F2ZVNlbWVzdGVyOiBzYXZlU2VtZXN0ZXIsXG4gICAgICBkZWxldGVTZW1lc3RlcjogZGVsZXRlU2VtZXN0ZXIsXG4gICAgICBkcm9wU2VtZXN0ZXI6IGRyb3BTZW1lc3RlcixcbiAgICAgIGRyb3BDb3Vyc2U6IGRyb3BDb3Vyc2UsXG4gICAgICBlZGl0Q291cnNlOiBlZGl0Q291cnNlLFxuICAgIH0sXG4gICAgY29tcG9uZW50czoge1xuICAgICAgZHJhZ2dhYmxlLFxuICAgIH0sXG4gIH0pO1xuXG4gIGxvYWREYXRhKCk7XG5cbiAgJCgnI3Jlc2V0Jykub24oJ2NsaWNrJywgbG9hZERhdGEpO1xuICAkKCcjYWRkLXNlbScpLm9uKCdjbGljaycsIGFkZFNlbWVzdGVyKTtcbiAgJCgnI2FkZC1jb3Vyc2UnKS5vbignY2xpY2snLCBhZGRDb3Vyc2UpO1xuXG4gICQoJyNzYXZlQ291cnNlJykub24oJ2NsaWNrJywgc2F2ZUNvdXJzZSk7XG4gICQoJyNkZWxldGVDb3Vyc2UnKS5vbignY2xpY2snLCBkZWxldGVDb3Vyc2UpO1xuXG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcblxuICBzaXRlLmFqYXhhdXRvY29tcGxldGVsb2NrKCdjb3Vyc2VfaWQnLCAnL2NvdXJzZXMvY291cnNlZmVlZCcpO1xuXG4gIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgc2l0ZS5hamF4YXV0b2NvbXBsZXRlbG9jaygnY29tcGxldGVkY291cnNlX2lkJywgJy9jb21wbGV0ZWRjb3Vyc2VzL2NvbXBsZXRlZGNvdXJzZWZlZWQvJyArIHN0dWRlbnRfaWQpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIG9yZGVyaW5nXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBpdGVtXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBpdGVtXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLm9yZGVyaW5nID09IGIub3JkZXJpbmcpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5vcmRlcmluZyA8IGIub3JkZXJpbmcgPyAtMSA6IDEpO1xufVxuXG52YXIgbG9hZERhdGEgPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZClcbiAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMgPSByZXNwb25zZS5kYXRhO1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMuc29ydChzb3J0RnVuY3Rpb24pO1xuICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgICAgIHZhciBzZW1lc3RlciA9IHdpbmRvdy52bS5zZW1lc3RlcnMuZmluZChmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudC5pZCA9PSB2YWx1ZS5zZW1lc3Rlcl9pZDtcbiAgICAgICAgfSlcbiAgICAgICAgaWYodmFsdWUuZGVncmVlcmVxdWlyZW1lbnRfaWQgPD0gMCl7XG4gICAgICAgICAgdmFsdWUuY3VzdG9tID0gdHJ1ZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdmFsdWUuY3VzdG9tID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYodmFsdWUuY29tcGxldGVkY291cnNlX2lkIDw9IDApe1xuICAgICAgICAgIHZhbHVlLmNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHZhbHVlLmNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZW1lc3Rlci5jb3Vyc2VzLnB1c2godmFsdWUpO1xuICAgICAgfSk7XG4gICAgICAkLmVhY2god2luZG93LnZtLnNlbWVzdGVycywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICAgICAgdmFsdWUuY291cnNlcy5zb3J0KHNvcnRGdW5jdGlvbik7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdnZXQgZGF0YScsICcnLCBlcnJvcik7XG4gICAgfSk7XG4gIH0pXG4gIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgc2l0ZS5oYW5kbGVFcnJvcignZ2V0IGRhdGEnLCAnJywgZXJyb3IpO1xuICB9KTtcbn1cblxudmFyIGVkaXRTZW1lc3RlciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIHNlbWlkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuaGlkZSgpO1xufVxuXG52YXIgc2F2ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgdmFyIHNlbWlkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdpZCcpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBpZDogc2VtaWQsXG4gICAgbmFtZTogJChcIiNzZW0tdGV4dC1cIiArIHNlbWlkKS52YWwoKVxuICB9XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9zYXZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuaGlkZSgpO1xuICAgICAgJChcIiNzZW0tcGFuZWxoZWFkLVwiICsgc2VtaWQpLnNob3coKTtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRlbGV0ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gICAgaWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICB2YXIgc2VtaWQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogc2VtaWQsXG4gICAgfTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZCArICcvZGVsZXRlJywgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHdpbmRvdy52bS5zZW1lc3RlcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgIGlmKHdpbmRvdy52bS5zZW1lc3RlcnNbaV0uaWQgPT0gc2VtaWQpe1xuICAgICAgICAgICAgd2luZG93LnZtLnNlbWVzdGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICAgIH0pO1xuICB9XG59XG5cbnZhciBhZGRTZW1lc3RlciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgfTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL2FkZCcsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgd2luZG93LnZtLnNlbWVzdGVycy5wdXNoKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgLy9WdWUuc2V0KHdpbmRvdy52bS5zZW1lc3RlcnNbd2luZG93LnZtLnNlbWVzdGVyLmxlbmd0aCAtIDFdLCAnY291cnNlcycsIG5ldyBBcnJheSgpKTtcbiAgICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UoXCJJdGVtIFNhdmVkXCIsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZHJvcFNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgb3JkZXJpbmcgPSBbXTtcbiAgJC5lYWNoKHdpbmRvdy52bS5zZW1lc3RlcnMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgb3JkZXJpbmcucHVzaCh7XG4gICAgICBpZDogdmFsdWUuaWQsXG4gICAgfSk7XG4gIH0pO1xuICB2YXIgZGF0YSA9IHtcbiAgICBvcmRlcmluZzogb3JkZXJpbmcsXG4gIH1cbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9tb3ZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgIH0pXG59XG5cbnZhciBkcm9wQ291cnNlID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgb3JkZXJpbmcgPSBbXTtcbiAgdmFyIHRvU2VtSW5kZXggPSAkKGV2ZW50LnRvKS5kYXRhKCdpZCcpO1xuICAkLmVhY2god2luZG93LnZtLnNlbWVzdGVyc1t0b1NlbUluZGV4XS5jb3Vyc2VzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgIG9yZGVyaW5nLnB1c2goe1xuICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgIH0pO1xuICB9KTtcbiAgdmFyIGRhdGEgPSB7XG4gICAgc2VtZXN0ZXJfaWQ6IHdpbmRvdy52bS5zZW1lc3RlcnNbdG9TZW1JbmRleF0uaWQsXG4gICAgY291cnNlX2lkOiAkKGV2ZW50Lml0ZW0pLmRhdGEoJ2lkJyksXG4gICAgb3JkZXJpbmc6IG9yZGVyaW5nLFxuICB9XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL21vdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGVkaXRDb3Vyc2UgPSBmdW5jdGlvbihldmVudCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gIHZhciBjb3Vyc2VJbmRleCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnaWQnKTtcbiAgdmFyIHNlbUluZGV4ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdzZW0nKTtcbiAgdmFyIGNvdXJzZSA9IHdpbmRvdy52bS5zZW1lc3RlcnNbc2VtSW5kZXhdLmNvdXJzZXNbY291cnNlSW5kZXhdO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoY291cnNlLm5hbWUpO1xuICAkKCcjY3JlZGl0cycpLnZhbChjb3Vyc2UuY3JlZGl0cyk7XG4gICQoJyNub3RlcycpLnZhbChjb3Vyc2Uubm90ZXMpO1xuICAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKGNvdXJzZS5pZCk7XG4gICQoJyNlbGVjdGxpdmVsaXN0X2lkJykudmFsKGNvdXJzZS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmVsZWN0aXZlbGlzdF9uYW1lLCAzMCkpO1xuICAkKCcjY291cnNlX2lkJykudmFsKGNvdXJzZS5jb3Vyc2VfaWQpO1xuICAkKCcjY291cnNlX2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmNvdXJzZV9uYW1lLCAzMCkpO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvdXJzZV9pZCcsIGNvdXJzZS5jb3Vyc2VfaWRfbG9jayk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoY291cnNlLmNvbXBsZXRlZGNvdXJzZV9pZCk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIGNvdXJzZS5jb21wbGV0ZWRjb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChjb3Vyc2UuY29tcGxldGVkY291cnNlX25hbWUsIDMwKSk7XG4gIHNpdGUuYWpheGF1dG9jb21wbGV0ZXNldCgnY29tcGxldGVkY291cnNlX2lkJywgY291cnNlLmNvbXBsZXRlZGNvdXJzZV9pZF9sb2NrKTtcbiAgaWYoY291cnNlLmRlZ3JlZXJlcXVpcmVtZW50X2lkIDw9IDApe1xuICAgICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICQoJyNjcmVkaXRzJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAkKCcjZGVsZXRlQ291cnNlJykuc2hvdygpO1xuICB9ZWxzZXtcbiAgICBpZihjb3Vyc2UuZWxlY3RpdmVsaXN0X2lkIDw9IDApe1xuICAgICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICB9ZWxzZXtcbiAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgIH1cbiAgICAkKCcjY3JlZGl0cycpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICQoJyNkZWxldGVDb3Vyc2UnKS5oaWRlKCk7XG4gIH1cblxuICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdzaG93Jyk7XG59XG5cbnZhciBzYXZlQ291cnNlID0gZnVuY3Rpb24oKXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgcGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gICAgY291cnNlX2lkX2xvY2s6ICQoJyNjb3Vyc2VfaWRsb2NrJykudmFsKCksXG4gICAgY29tcGxldGVkY291cnNlX2lkX2xvY2s6ICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRsb2NrJykudmFsKCksXG4gIH1cbiAgaWYoJCgnI2NvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgZGF0YS5jb3Vyc2VfaWQgPSAkKCcjY291cnNlX2lkJykudmFsKCk7XG4gIH1lbHNle1xuICAgIGRhdGEuY291cnNlX2lkID0gJyc7XG4gIH1cbiAgaWYoJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgPSAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCk7XG4gIH1lbHNle1xuICAgIGRhdGEuY29tcGxldGVkY291cnNlX2lkID0gJyc7XG4gIH1cbiAgaWYoJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpLmxlbmd0aCA+IDApe1xuICAgIGRhdGEucGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB9XG4gIGlmKCEkKCcjY291cnNlX25hbWUnKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgfVxuICBpZighJCgnI2NyZWRpdHMnKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGRhdGEuY3JlZGl0cyA9ICQoJyNjcmVkaXRzJykudmFsKCk7XG4gIH1cbiAgaWYoISQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykuaXMoJzpkaXNhYmxlZCcpKXtcbiAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAnJztcbiAgICB9XG4gIH1cbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL2RhdGEvJyArIGlkICsgJy9zYXZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgIGxvYWREYXRhKCk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKFwic2F2ZSBjb3Vyc2VcIiwgXCIjZWRpdENvdXJzZVwiLCBlcnJvcik7XG4gICAgfSk7XG5cbn1cblxudmFyIGRlbGV0ZUNvdXJzZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgcGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBwbGFucmVxdWlyZW1lbnRfaWQ6IHBsYW5yZXF1aXJlbWVudF9pZCxcbiAgfVxuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL2RlbGV0ZScsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJCgnI2VkaXRDb3Vyc2UnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICBsb2FkRGF0YSgpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcihcImRlbGV0ZSBjb3Vyc2VcIiwgXCIjZWRpdENvdXJzZVwiLCBlcnJvcik7XG4gICAgfSk7XG5cbn1cblxudmFyIGFkZENvdXJzZSA9IGZ1bmN0aW9uKCl7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgnJyk7XG4gICQoJyNjcmVkaXRzJykudmFsKCcnKTtcbiAgJCgnI25vdGVzJykudmFsKCcnKTtcbiAgJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGxpdmVsaXN0X2lkJykudmFsKDApO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyAwICsgXCIpIFwiKTtcbiAgJCgnI2NvdXJzZV9pZCcpLnZhbCgwKTtcbiAgJCgnI2NvdXJzZV9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgMCArIFwiKSBcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoMCk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKCcnKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIDAgKyBcIikgXCIpO1xuICAkKCcjY291cnNlX25hbWUnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgJCgnI2NyZWRpdHMnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgJCgnI2RlbGV0ZUNvdXJzZScpLmhpZGUoKTtcbiAgJCgnI2VkaXRDb3Vyc2UnKS5tb2RhbCgnc2hvdycpO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvdXJzZV9pZCcsIDApO1xuICBzaXRlLmFqYXhhdXRvY29tcGxldGVzZXQoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsIDApO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydGxpc3QuanMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2FwcC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAyMDlcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9mbG93Y2hhcnQuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMjEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIGZyb20gdGhlIGZsYXNoZWQgc2Vzc2lvbiBkYXRhXG4gKlxuICogdXNlICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgnbWVzc2FnZScsIHRyYW5zKCdtZXNzYWdlcy5pdGVtX3NhdmVkJykpO1xuICogICAgICRyZXF1ZXN0LT5zZXNzaW9uKCktPnB1dCgndHlwZScsICdzdWNjZXNzJyk7XG4gKiB0byBzZXQgbWVzc2FnZSB0ZXh0IGFuZCB0eXBlXG4gKi9cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKXtcblx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cImphdmFzY3JpcHRNZXNzYWdlXCIgY2xhc3M9XCJhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NhYmxlIGFsZXJ0LScgKyB0eXBlICsgJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PC9idXR0b24+PHNwYW4gY2xhc3M9XCJoNFwiPicgKyBtZXNzYWdlICsgJzwvc3Bhbj48L2Rpdj4nO1xuXHQkKCcjbWVzc2FnZScpLmFwcGVuZChodG1sKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQkKFwiI2phdmFzY3JpcHRNZXNzYWdlXCIpLmFsZXJ0KCdjbG9zZScpO1xuXHR9LCAzMDAwKTtcbn07XG5cbi8qXG5leHBvcnRzLmFqYXhjcnNmID0gZnVuY3Rpb24oKXtcblx0JC5hamF4U2V0dXAoe1xuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG5cdFx0fVxuXHR9KTtcbn07XG4qL1xuXG4vKipcbiAqIENsZWFycyBlcnJvcnMgb24gZm9ybXMgYnkgcmVtb3ZpbmcgZXJyb3IgY2xhc3Nlc1xuICovXG5leHBvcnRzLmNsZWFyRm9ybUVycm9ycyA9IGZ1bmN0aW9uKCl7XG5cdCQoJy5mb3JtLWdyb3VwJykuZWFjaChmdW5jdGlvbiAoKXtcblx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFNldHMgZXJyb3JzIG9uIGZvcm1zIGJhc2VkIG9uIHJlc3BvbnNlIEpTT05cbiAqL1xuZXhwb3J0cy5zZXRGb3JtRXJyb3JzID0gZnVuY3Rpb24oanNvbil7XG5cdGV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdCQuZWFjaChqc29uLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdCQoJyMnICsga2V5KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblx0XHQkKCcjJyArIGtleSArICdoZWxwJykudGV4dCh2YWx1ZS5qb2luKCcgJykpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG1lc3NhZ2VzIGluIHRoZSBmbGFzaCBkYXRhLiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IGJ5IHRoZSBwYWdlXG4gKi9cbmV4cG9ydHMuY2hlY2tNZXNzYWdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCgnI21lc3NhZ2VfZmxhc2gnKS5sZW5ndGgpe1xuXHRcdHZhciBtZXNzYWdlID0gJCgnI21lc3NhZ2VfZmxhc2gnKS52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICQoJyNtZXNzYWdlX3R5cGVfZmxhc2gnKS52YWwoKTtcblx0XHRleHBvcnRzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIHR5cGUpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGVycm9ycyBmcm9tIEFKQVhcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIHRoZSBtZXNzYWdlIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGpRdWVyeSBpZGVudGlmaWVyIG9mIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0gZXJyb3IgLSB0aGUgQXhpb3MgZXJyb3IgcmVjZWl2ZWRcbiAqL1xuZXhwb3J0cy5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGVsZW1lbnQsIGVycm9yKXtcblx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdC8vSWYgcmVzcG9uc2UgaXMgNDIyLCBlcnJvcnMgd2VyZSBwcm92aWRlZFxuXHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0ZXhwb3J0cy5zZXRGb3JtRXJyb3JzKGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gXCIgKyBtZXNzYWdlICsgXCI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9oaWRlIHNwaW5uaW5nIGljb25cblx0aWYoZWxlbWVudC5sZW5ndGggPiAwKXtcblx0XHQkKGVsZW1lbnQgKyAnc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHRydW5jYXRlIHRleHRcbiAqXG4gKiBAcGFyYW0gdGV4dCAtIHRoZSB0ZXh0IHRvIHRydW5jYXRlXG4gKiBAcGFyYW0gbGVuZ3RoIC0gdGhlIG1heGltdW0gbGVuZ3RoXG4gKlxuICogaHR0cDovL2pzZmlkZGxlLm5ldC9zY2hhZGVjay9HcENaTC9cbiAqL1xuZXhwb3J0cy50cnVuY2F0ZVRleHQgPSBmdW5jdGlvbih0ZXh0LCBsZW5ndGgpe1xuXHRpZih0ZXh0Lmxlbmd0aCA+IGxlbmd0aCl7XG5cdFx0cmV0dXJuICQudHJpbSh0ZXh0KS5zdWJzdHJpbmcoMCwgbGVuZ3RoKS5zcGxpdChcIiBcIikuc2xpY2UoMCwgLTEpLmpvaW4oXCIgXCIpICsgXCIuLi5cIjtcblx0fWVsc2V7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhdXRvY29tcGxldGUgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSBJRCBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHJlcXVlc3QgZGF0YSBmcm9tXG4gKi9cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICAkKCcjJyArIGlkICsgJ2F1dG8nKS5hdXRvY29tcGxldGUoe1xuXHQgICAgc2VydmljZVVybDogdXJsLFxuXHQgICAgYWpheFNldHRpbmdzOiB7XG5cdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHQgICAgfSxcbiAgICAgIG1pbkNoYXJzOiAzLFxuICAgICAgYXV0b1NlbGVjdEZpcnN0OiB0cnVlLFxuXHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdCAgICAgICAgJCgnIycgKyBpZCkudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgICAgJCgnIycgKyBpZCArICd0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBzdWdnZXN0aW9uLmRhdGEgKyBcIikgXCIgKyBleHBvcnRzLnRydW5jYXRlVGV4dChzdWdnZXN0aW9uLnZhbHVlLCAzMCkpO1xuXHRcdFx0XHRcdCQoJyMnICsgaWQgKyAnYXV0bycpLnZhbChcIlwiKTtcblx0ICAgIH0sXG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0ICAgICAgICAgICAgfSlcblx0ICAgICAgICB9O1xuXHQgICAgfVxuXHR9KTtcblxuICAkKCcjJyArIGlkICsgJ2NsZWFyJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjJyArIGlkKS52YWwoMCk7XG4gICAgJCgnIycgKyBpZCArICd0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyAwICsgXCIpIFwiKTtcbiAgICAkKCcjJyArIGlkICsgJ2F1dG8nKS52YWwoXCJcIik7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkIHdpdGggYSBsb2NrXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlbG9jayA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICAkKCcjJyArIGlkICsgJ2F1dG8nKS5hdXRvY29tcGxldGUoe1xuXHQgICAgc2VydmljZVVybDogdXJsLFxuXHQgICAgYWpheFNldHRpbmdzOiB7XG5cdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHQgICAgfSxcbiAgICAgIG1pbkNoYXJzOiAzLFxuICAgICAgYXV0b1NlbGVjdEZpcnN0OiB0cnVlLFxuXHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdCAgICAgICAgJCgnIycgKyBpZCkudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgICAgJCgnIycgKyBpZCArICd0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBzdWdnZXN0aW9uLmRhdGEgKyBcIikgXCIgKyBleHBvcnRzLnRydW5jYXRlVGV4dChzdWdnZXN0aW9uLnZhbHVlLCAzMCkpO1xuXHRcdFx0XHRcdCQoJyMnICsgaWQgKyAnYXV0bycpLnZhbChcIlwiKTtcbiAgICAgICAgICBleHBvcnRzLmFqYXhhdXRvY29tcGxldGVzZXQoaWQsIDEpO1xuXHQgICAgfSxcblx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH07XG5cdCAgICB9XG5cdH0pO1xuXG4gICQoJyMnICsgaWQgKyAnY2xlYXInKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyMnICsgaWQpLnZhbCgwKTtcbiAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIDAgKyBcIikgXCIpO1xuICAgICQoJyMnICsgaWQgKyAnYXV0bycpLnZhbChcIlwiKTtcbiAgICBleHBvcnRzLmFqYXhhdXRvY29tcGxldGVzZXQoaWQsIDApO1xuICB9KTtcblxuICAkKCcjJyArIGlkICsgJ2xvY2tCdG4nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhbCA9IHBhcnNlSW50KCQoJyMnICsgaWQgKyAnbG9jaycpLnZhbCgpKTtcbiAgICBleHBvcnRzLmFqYXhhdXRvY29tcGxldGVzZXQoaWQsICh2YWwgKyAxKSAlIDIpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byB1cGRhdGUgYSBsb2NrZWQgYXV0b2NvbXBsZXRlIGJ1dHRvblxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSBJRCBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBzZXRcbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlc2V0ID0gZnVuY3Rpb24oaWQsIHZhbHVlKXtcbiAgaWYodmFsdWUgPT0gMSl7XG4gICAgJCgnIycgKyBpZCArICdsb2NrJykudmFsKDEpO1xuICAgICQoJyMnICsgaWQgKyAnbG9ja0J0bicpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICQoJyMnICsgaWQgKyAnbG9ja0J0bicpLmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtbG9ja1wiPjwvaT4nKTtcbiAgfWVsc2V7XG4gICAgJCgnIycgKyBpZCArICdsb2NrJykudmFsKDApO1xuICAgICQoJyMnICsgaWQgKyAnbG9ja0J0bicpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICQoJyMnICsgaWQgKyAnbG9ja0J0bicpLmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtdW5sb2NrLWFsdFwiPjwvaT4nKTtcbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCIvKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIGZvciBlZGl0YWJsZSB0ZXh0LWJveGVzIG9uIHRoZSBzaXRlXG4gKiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgLy9Mb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xuICByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG4gIHJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiXSwic291cmNlUm9vdCI6IiJ9