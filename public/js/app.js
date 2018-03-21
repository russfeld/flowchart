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
      $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + site.truncateText(suggestion.value, 30));
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
      student_id: $('#student_id').val()
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
    if ($('#course_id').val() > 0) {
      data.course_id = $('#course_id').val();
    }
    if ($('#completedcourse_id').val() > 0) {
      data.completedcourse_id = $('#completedcourse_id').val();
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
      if (message.data.type == "course") {
        $('#course_name').val(message.data.course_name);
        $('#requireable1').prop('checked', true);
        $('#requiredcourse').show();
        $('#electivecourse').hide();
      } else if (message.data.type == "electivelist") {
        $('#course_name').val(message.data.course_name);
        $('#electivelist_id').val(message.data.electivelist_id);
        $('#electivelist_idtext').html("Selected: (" + message.data.electivelist_id + ") " + site.truncateText(message.data.electivelist_name, 30));
        $('#requireable2').prop('checked', true);
        $('#requiredcourse').hide();
        $('#electivecourse').show();
      }
      $('#course_id').val(message.data.course_id);
      $('#course_idtext').html("Selected: (" + message.data.course_id + ") " + site.truncateText(message.data.catalog_course, 30));
      $('#completedcourse_id').val(message.data.completedcourse_id);
      $('#completedcourse_idtext').html("Selected: (" + message.data.completedcourse_id + ") " + site.truncateText(message.data.completed_course, 30));
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

  dashboard.ajaxautocomplete('course_id', '/courses/coursefeed');

  var student_id = $('#student_id').val();
  dashboard.ajaxautocomplete('completedcourse_id', '/completedcourses/completedcoursefeed/' + student_id);
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
  $('#course_id').val("-1");
  $('#course_idauto').val("");
  $('#course_idtext').html("Selected (0) ");
  $('#completedcourse_id').val("-1");
  $('#completedcourse_idauto').val("");
  $('#completedcourse_idtext').html("Selected (0) ");
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

  $('#saveCourse').on('click', saveCourse);
  $('#deleteCourse').on('click', deleteCourse);

  ajaxautocomplete('electivelist_id', '/electivelists/electivelistfeed');

  ajaxautocomplete('course_id', '/courses/coursefeed');

  var student_id = $('#student_id').val();
  ajaxautocomplete('completedcourse_id', '/completedcourses/completedcoursefeed/' + student_id);
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
    //site.displayMessage(response.data, "success");
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
  var courseIndex = $(event.target).data('id');
  var semIndex = $(event.target).data('sem');
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
  $('#completedcourse_id').val(course.completedcourse_id);
  $('#completedcourse_idauto').val('');
  $('#completedcourse_idtext').html("Selected: (" + course.completedcourse_id + ") " + site.truncateText(course.completedcourse_name, 30));
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
    notes: $('#notes').val()
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
    site.handleError("save course", "#editCourse", error);
  });
};

var deleteCourse = function deleteCourse(event) {
  console.log($(event.target).data('id'));
};

/**
 * Function to autocomplete a field (duplicated from dashboard)
 *
 * @param id - the ID of the field
 * @param url - the URL to request data from
 */
var ajaxautocomplete = function ajaxautocomplete(id, url) {
  $('#' + id + 'auto').autocomplete({
    serviceUrl: url,
    ajaxSettings: {
      dataType: "json"
    },
    minChars: 3,
    onSelect: function onSelect(suggestion) {
      $('#' + id).val(suggestion.data);
      $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + site.truncateText(suggestion.value, 30));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0bGlzdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3M/NmQxMCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvZmxvd2NoYXJ0LnNjc3MiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIl0sIm5hbWVzIjpbImRhc2hib2FyZCIsInJlcXVpcmUiLCJleHBvcnRzIiwiaW5pdCIsIm9wdGlvbnMiLCJkYXRhVGFibGVPcHRpb25zIiwiZG9tIiwiJCIsImh0bWwiLCJvbiIsImRhdGEiLCJmaXJzdF9uYW1lIiwidmFsIiwibGFzdF9uYW1lIiwiZW1haWwiLCJhZHZpc29yX2lkIiwiZGVwYXJ0bWVudF9pZCIsImlkIiwiZWlkIiwibGVuZ3RoIiwidXJsIiwiYWpheHNhdmUiLCJyZXRVcmwiLCJhamF4ZGVsZXRlIiwiYWpheHJlc3RvcmUiLCJzdW1tZXJub3RlIiwiZm9jdXMiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsImlzIiwiZmlsZXMiLCJkb2N1bWVudCIsImlucHV0IiwibnVtRmlsZXMiLCJnZXQiLCJsYWJlbCIsInJlcGxhY2UiLCJ0cmlnZ2VyIiwiZXZlbnQiLCJwYXJlbnRzIiwiZmluZCIsImxvZyIsImFsZXJ0IiwibmFtZSIsIm9mZmljZSIsInBob25lIiwiYWJicmV2aWF0aW9uIiwiZGVzY3JpcHRpb24iLCJlZmZlY3RpdmVfeWVhciIsImVmZmVjdGl2ZV9zZW1lc3RlciIsInN0YXJ0X3llYXIiLCJzdGFydF9zZW1lc3RlciIsImRlZ3JlZXByb2dyYW1faWQiLCJzdHVkZW50X2lkIiwiY2hvaWNlIiwiY29uZmlybSIsImFqYXhhdXRvY29tcGxldGUiLCJvcmRlcmluZyIsInBsYW5faWQiLCJjb3Vyc2VudW1iZXIiLCJ5ZWFyIiwic2VtZXN0ZXIiLCJiYXNpcyIsImdyYWRlIiwiY3JlZGl0cyIsInNlbGVjdGVkIiwic2VsZWN0ZWRWYWwiLCJ0cmFuc2ZlciIsImluY29taW5nX2luc3RpdHV0aW9uIiwiaW5jb21pbmdfbmFtZSIsImluY29taW5nX2Rlc2NyaXB0aW9uIiwiaW5jb21pbmdfc2VtZXN0ZXIiLCJpbmNvbWluZ19jcmVkaXRzIiwiaW5jb21pbmdfZ3JhZGUiLCJzaG93c2VsZWN0ZWQiLCJwcm9wIiwic2hvdyIsImhpZGUiLCJBcHAiLCJhY3Rpb25zIiwiUm9vdFJvdXRlQ29udHJvbGxlciIsImdldEluZGV4IiwiZWRpdGFibGUiLCJzaXRlIiwiY2hlY2tNZXNzYWdlIiwiZ2V0QWJvdXQiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJjYWxlbmRhciIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJnZXRMaXN0IiwiZ3JvdXBzZXNzaW9uIiwiUHJvZmlsZXNDb250cm9sbGVyIiwicHJvZmlsZSIsIkRhc2hib2FyZENvbnRyb2xsZXIiLCJTdHVkZW50c0NvbnRyb2xsZXIiLCJnZXRTdHVkZW50cyIsInN0dWRlbnRlZGl0IiwiZ2V0TmV3c3R1ZGVudCIsIkFkdmlzb3JzQ29udHJvbGxlciIsImdldEFkdmlzb3JzIiwiYWR2aXNvcmVkaXQiLCJnZXROZXdhZHZpc29yIiwiRGVwYXJ0bWVudHNDb250cm9sbGVyIiwiZ2V0RGVwYXJ0bWVudHMiLCJkZXBhcnRtZW50ZWRpdCIsImdldE5ld2RlcGFydG1lbnQiLCJNZWV0aW5nc0NvbnRyb2xsZXIiLCJnZXRNZWV0aW5ncyIsIm1lZXRpbmdlZGl0IiwiQmxhY2tvdXRzQ29udHJvbGxlciIsImdldEJsYWNrb3V0cyIsImJsYWNrb3V0ZWRpdCIsIkdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyIiwiZ2V0R3JvdXBzZXNzaW9ucyIsImdyb3Vwc2Vzc2lvbmVkaXQiLCJTZXR0aW5nc0NvbnRyb2xsZXIiLCJnZXRTZXR0aW5ncyIsInNldHRpbmdzIiwiRGVncmVlcHJvZ3JhbXNDb250cm9sbGVyIiwiZ2V0RGVncmVlcHJvZ3JhbXMiLCJkZWdyZWVwcm9ncmFtZWRpdCIsImdldERlZ3JlZXByb2dyYW1EZXRhaWwiLCJnZXROZXdkZWdyZWVwcm9ncmFtIiwiRWxlY3RpdmVsaXN0c0NvbnRyb2xsZXIiLCJnZXRFbGVjdGl2ZWxpc3RzIiwiZWxlY3RpdmVsaXN0ZWRpdCIsImdldEVsZWN0aXZlbGlzdERldGFpbCIsImdldE5ld2VsZWN0aXZlbGlzdCIsIlBsYW5zQ29udHJvbGxlciIsImdldFBsYW5zIiwicGxhbmVkaXQiLCJnZXRQbGFuRGV0YWlsIiwicGxhbmRldGFpbCIsImdldE5ld3BsYW4iLCJQbGFuc2VtZXN0ZXJzQ29udHJvbGxlciIsImdldFBsYW5TZW1lc3RlciIsInBsYW5zZW1lc3RlcmVkaXQiLCJnZXROZXdQbGFuU2VtZXN0ZXIiLCJDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlciIsImdldENvbXBsZXRlZGNvdXJzZXMiLCJjb21wbGV0ZWRjb3Vyc2VlZGl0IiwiZ2V0TmV3Y29tcGxldGVkY291cnNlIiwiRmxvd2NoYXJ0c0NvbnRyb2xsZXIiLCJnZXRGbG93Y2hhcnQiLCJmbG93Y2hhcnQiLCJjb250cm9sbGVyIiwiYWN0aW9uIiwid2luZG93IiwiXyIsImF4aW9zIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiY29tbW9uIiwidG9rZW4iLCJoZWFkIiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJtb21lbnQiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidHlwZSIsImNvbG9yIiwidGV4dENvbG9yIiwic2VsZWN0YWJsZSIsInNlbGVjdEhlbHBlciIsInNlbGVjdE92ZXJsYXAiLCJyZW5kZXJpbmciLCJ0aW1lRm9ybWF0IiwiZGF0ZVBpY2tlckRhdGEiLCJkYXlzT2ZXZWVrRGlzYWJsZWQiLCJmb3JtYXQiLCJzdGVwcGluZyIsImVuYWJsZWRIb3VycyIsIm1heEhvdXIiLCJzaWRlQnlTaWRlIiwiaWdub3JlUmVhZG9ubHkiLCJhbGxvd0lucHV0VG9nZ2xlIiwiZGF0ZVBpY2tlckRhdGVPbmx5IiwiYWR2aXNvciIsIm5vYmluZCIsInRyaW0iLCJ3aWR0aCIsInJlbW92ZUNsYXNzIiwicmVzZXRGb3JtIiwiYmluZCIsIm5ld1N0dWRlbnQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzaG93TWVldGluZ0Zvcm0iLCJyZXBlYXQiLCJibGFja291dFNlcmllcyIsIm1vZGFsIiwic2VsZWN0IiwiY2hhbmdlIiwicmVwZWF0Q2hhbmdlIiwic2F2ZUJsYWNrb3V0IiwiZGVsZXRlQmxhY2tvdXQiLCJibGFja291dE9jY3VycmVuY2UiLCJvZmYiLCJlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiZGVzYyIsInN0YXR1cyIsIm1lZXRpbmdpZCIsInN0dWRlbnRpZCIsImR1cmF0aW9uT3B0aW9ucyIsInVuZGVmaW5lZCIsImhvdXIiLCJtaW51dGUiLCJjbGVhckZvcm1FcnJvcnMiLCJlbXB0eSIsIm1pbnV0ZXMiLCJkaWZmIiwiZWxlbTEiLCJlbGVtMiIsImR1cmF0aW9uIiwiZGF0ZTIiLCJkYXRlIiwiaXNTYW1lIiwiY2xvbmUiLCJkYXRlMSIsImlzQmVmb3JlIiwibmV3RGF0ZSIsImFkZCIsImRlbGV0ZUNvbmZsaWN0IiwiZWRpdENvbmZsaWN0IiwicmVzb2x2ZUNvbmZsaWN0IiwiaW5kZXgiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJibGFja291dF9pZCIsInJlcGVhdF90eXBlIiwicmVwZWF0X2V2ZXJ5IiwicmVwZWF0X3VudGlsIiwicmVwZWF0X2RldGFpbCIsIlN0cmluZyIsImluZGV4T2YiLCJwcm9tcHQiLCJWdWUiLCJFY2hvIiwiUHVzaGVyIiwiaW9uIiwic291bmQiLCJzb3VuZHMiLCJ2b2x1bWUiLCJwYXRoIiwicHJlbG9hZCIsInVzZXJJRCIsInBhcnNlSW50IiwiZ3JvdXBSZWdpc3RlckJ0biIsImdyb3VwRGlzYWJsZUJ0biIsInZtIiwiZWwiLCJxdWV1ZSIsIm9ubGluZSIsIm1ldGhvZHMiLCJnZXRDbGFzcyIsInMiLCJ1c2VyaWQiLCJpbkFycmF5IiwidGFrZVN0dWRlbnQiLCJnaWQiLCJjdXJyZW50VGFyZ2V0IiwiZGF0YXNldCIsImFqYXhQb3N0IiwicHV0U3R1ZGVudCIsImRvbmVTdHVkZW50IiwiZGVsU3R1ZGVudCIsImVudiIsImxvZ1RvQ29uc29sZSIsImJyb2FkY2FzdGVyIiwia2V5IiwicHVzaGVyS2V5IiwiY2x1c3RlciIsInB1c2hlckNsdXN0ZXIiLCJjb25uZWN0b3IiLCJwdXNoZXIiLCJjb25uZWN0aW9uIiwiY29uY2F0IiwiY2hlY2tCdXR0b25zIiwiaW5pdGlhbENoZWNrRGluZyIsInNvcnQiLCJzb3J0RnVuY3Rpb24iLCJjaGFubmVsIiwibGlzdGVuIiwibG9jYXRpb24iLCJocmVmIiwiam9pbiIsImhlcmUiLCJ1c2VycyIsImxlbiIsImkiLCJwdXNoIiwiam9pbmluZyIsInVzZXIiLCJsZWF2aW5nIiwic3BsaWNlIiwiZm91bmQiLCJjaGVja0RpbmciLCJmaWx0ZXIiLCJkaXNhYmxlQnV0dG9uIiwicmVhbGx5IiwiYXR0ciIsImJvZHkiLCJzdWJtaXQiLCJlbmFibGVCdXR0b24iLCJyZW1vdmVBdHRyIiwiZm91bmRNZSIsInBlcnNvbiIsInBsYXkiLCJhIiwiYiIsIkRhdGFUYWJsZSIsInRvZ2dsZUNsYXNzIiwibG9hZHBpY3R1cmUiLCJhamF4bW9kYWxzYXZlIiwiYWpheCIsInJlbG9hZCIsInNvZnQiLCJhamF4bW9kYWxkZWxldGUiLCJtaW5DaGFycyIsInRydW5jYXRlVGV4dCIsIm1lc3NhZ2UiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwib3JkZXIiLCJub3RlcyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsIm9wdGlvbnMyIiwic2VtZXN0ZXJfaWQiLCJjb3Vyc2VfaWQiLCJjb21wbGV0ZWRjb3Vyc2VfaWQiLCJwbGFuaWQiLCJsaXN0aXRlbXMiLCJyZW1vdmUiLCJkZWdyZWVyZXF1aXJlbWVudF9pZCIsImNhdGFsb2dfY291cnNlIiwiY29tcGxldGVkX2NvdXJzZSIsImRyYWdnYWJsZSIsInNlbWVzdGVycyIsImVkaXRTZW1lc3RlciIsInNhdmVTZW1lc3RlciIsImRlbGV0ZVNlbWVzdGVyIiwiZHJvcFNlbWVzdGVyIiwiZHJvcENvdXJzZSIsImVkaXRDb3Vyc2UiLCJjb21wb25lbnRzIiwibG9hZERhdGEiLCJhZGRTZW1lc3RlciIsInNhdmVDb3Vyc2UiLCJkZWxldGVDb3Vyc2UiLCJkb2N1bWVudEVsZW1lbnQiLCJzdHlsZSIsInNldFByb3BlcnR5IiwiY291cnNlcyIsInNlbWlkIiwidGFyZ2V0IiwidG9TZW1JbmRleCIsInRvIiwiaXRlbSIsImNvdXJzZUluZGV4Iiwic2VtSW5kZXgiLCJjb3Vyc2UiLCJjb21wbGV0ZWRjb3Vyc2VfbmFtZSIsInBsYW5yZXF1aXJlbWVudF9pZCIsInNldFRpbWVvdXQiLCJzZXRGb3JtRXJyb3JzIiwianNvbiIsInN1YnN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJjbGljayIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBLGlFQUFpRTtBQUNqRSxxQkFBcUI7QUFDckI7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLFdBQVc7QUFDdEIsZUFBZSxpQ0FBaUM7QUFDaEQsaUJBQWlCLGlCQUFpQjtBQUNsQyxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsNkJBQTZCO0FBQzNDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsY0FBYztBQUM1QixXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXO0FBQ1gsR0FBRztBQUNILGdCQUFnQixZQUFZO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QixxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0QsU0FBUztBQUNULHVEQUF1RDtBQUN2RDtBQUNBLE9BQU87QUFDUCwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FB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MUMsRUFHQ3hNLElBSEQsQ0FHTSxVQUFTdEMsUUFBVCxFQUFrQjtBQUN0QjtBQUNBNkksaUJBQVNnQyxNQUFULENBQWdCLElBQWhCO0FBQ0QsT0FORCxFQU9DdEksS0FQRCxDQU9PLFVBQVN0RyxLQUFULEVBQWU7QUFDcEJwSCxjQUFNLDZCQUE2Qm9ILE1BQU0rRCxRQUFOLENBQWUzTixJQUFsRDtBQUNELE9BVEQ7QUFVRCxLQXhCRDtBQXlCRCxHQTFCRDs7QUE0QkE7QUFDQUgsSUFBRSxrQkFBRixFQUFzQm1OLElBQXRCLENBQTJCLFlBQVU7QUFDbkNuTixNQUFFLElBQUYsRUFBUXljLEtBQVIsQ0FBYyxVQUFTbk4sQ0FBVCxFQUFXO0FBQ3ZCQSxRQUFFb04sZUFBRjtBQUNBcE4sUUFBRXFOLGNBQUY7O0FBRUE7QUFDQSxVQUFJamMsS0FBS1YsRUFBRSxJQUFGLEVBQVFHLElBQVIsQ0FBYSxJQUFiLENBQVQ7O0FBRUE7QUFDQUgsUUFBRSxlQUFlVSxFQUFqQixFQUFxQlEsVUFBckIsQ0FBZ0MsT0FBaEM7QUFDQWxCLFFBQUUsZUFBZVUsRUFBakIsRUFBcUJRLFVBQXJCLENBQWdDLFNBQWhDOztBQUVBO0FBQ0FsQixRQUFFLHFCQUFxQlUsRUFBdkIsRUFBMkJvTSxXQUEzQixDQUF1QyxRQUF2QztBQUNBOU0sUUFBRSxtQkFBbUJVLEVBQXJCLEVBQXlCNk4sUUFBekIsQ0FBa0MsUUFBbEM7QUFDRCxLQWREO0FBZUQsR0FoQkQ7QUFpQkQsQ0F0RkQsQyIsImZpbGUiOiIvanMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29kZU1pcnJvciwgY29weXJpZ2h0IChjKSBieSBNYXJpam4gSGF2ZXJiZWtlIGFuZCBvdGhlcnNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIGFuIE1JVCBsaWNlbnNlOiBodHRwOi8vY29kZW1pcnJvci5uZXQvTElDRU5TRVxuXG4oZnVuY3Rpb24obW9kKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2QocmVxdWlyZShcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIpKTtcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgZGVmaW5lKFtcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCJdLCBtb2QpO1xuICBlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgbW9kKENvZGVNaXJyb3IpO1xufSkoZnVuY3Rpb24oQ29kZU1pcnJvcikge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBodG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHsnYXJlYSc6IHRydWUsICdiYXNlJzogdHJ1ZSwgJ2JyJzogdHJ1ZSwgJ2NvbCc6IHRydWUsICdjb21tYW5kJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2VtYmVkJzogdHJ1ZSwgJ2ZyYW1lJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ2ltZyc6IHRydWUsICdpbnB1dCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdrZXlnZW4nOiB0cnVlLCAnbGluayc6IHRydWUsICdtZXRhJzogdHJ1ZSwgJ3BhcmFtJzogdHJ1ZSwgJ3NvdXJjZSc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICd0cmFjayc6IHRydWUsICd3YnInOiB0cnVlLCAnbWVudWl0ZW0nOiB0cnVlfSxcbiAgaW1wbGljaXRseUNsb3NlZDogeydkZCc6IHRydWUsICdsaSc6IHRydWUsICdvcHRncm91cCc6IHRydWUsICdvcHRpb24nOiB0cnVlLCAncCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAncnAnOiB0cnVlLCAncnQnOiB0cnVlLCAndGJvZHknOiB0cnVlLCAndGQnOiB0cnVlLCAndGZvb3QnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgJ3RoJzogdHJ1ZSwgJ3RyJzogdHJ1ZX0sXG4gIGNvbnRleHRHcmFiYmVyczoge1xuICAgICdkZCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnZHQnOiB7J2RkJzogdHJ1ZSwgJ2R0JzogdHJ1ZX0sXG4gICAgJ2xpJzogeydsaSc6IHRydWV9LFxuICAgICdvcHRpb24nOiB7J29wdGlvbic6IHRydWUsICdvcHRncm91cCc6IHRydWV9LFxuICAgICdvcHRncm91cCc6IHsnb3B0Z3JvdXAnOiB0cnVlfSxcbiAgICAncCc6IHsnYWRkcmVzcyc6IHRydWUsICdhcnRpY2xlJzogdHJ1ZSwgJ2FzaWRlJzogdHJ1ZSwgJ2Jsb2NrcXVvdGUnOiB0cnVlLCAnZGlyJzogdHJ1ZSxcbiAgICAgICAgICAnZGl2JzogdHJ1ZSwgJ2RsJzogdHJ1ZSwgJ2ZpZWxkc2V0JzogdHJ1ZSwgJ2Zvb3Rlcic6IHRydWUsICdmb3JtJzogdHJ1ZSxcbiAgICAgICAgICAnaDEnOiB0cnVlLCAnaDInOiB0cnVlLCAnaDMnOiB0cnVlLCAnaDQnOiB0cnVlLCAnaDUnOiB0cnVlLCAnaDYnOiB0cnVlLFxuICAgICAgICAgICdoZWFkZXInOiB0cnVlLCAnaGdyb3VwJzogdHJ1ZSwgJ2hyJzogdHJ1ZSwgJ21lbnUnOiB0cnVlLCAnbmF2JzogdHJ1ZSwgJ29sJzogdHJ1ZSxcbiAgICAgICAgICAncCc6IHRydWUsICdwcmUnOiB0cnVlLCAnc2VjdGlvbic6IHRydWUsICd0YWJsZSc6IHRydWUsICd1bCc6IHRydWV9LFxuICAgICdycCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAncnQnOiB7J3JwJzogdHJ1ZSwgJ3J0JzogdHJ1ZX0sXG4gICAgJ3Rib2R5Jzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0ZCc6IHsndGQnOiB0cnVlLCAndGgnOiB0cnVlfSxcbiAgICAndGZvb3QnOiB7J3Rib2R5JzogdHJ1ZX0sXG4gICAgJ3RoJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0aGVhZCc6IHsndGJvZHknOiB0cnVlLCAndGZvb3QnOiB0cnVlfSxcbiAgICAndHInOiB7J3RyJzogdHJ1ZX1cbiAgfSxcbiAgZG9Ob3RJbmRlbnQ6IHtcInByZVwiOiB0cnVlfSxcbiAgYWxsb3dVbnF1b3RlZDogdHJ1ZSxcbiAgYWxsb3dNaXNzaW5nOiB0cnVlLFxuICBjYXNlRm9sZDogdHJ1ZVxufVxuXG52YXIgeG1sQ29uZmlnID0ge1xuICBhdXRvU2VsZkNsb3NlcnM6IHt9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7fSxcbiAgY29udGV4dEdyYWJiZXJzOiB7fSxcbiAgZG9Ob3RJbmRlbnQ6IHt9LFxuICBhbGxvd1VucXVvdGVkOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nOiBmYWxzZSxcbiAgYWxsb3dNaXNzaW5nVGFnTmFtZTogZmFsc2UsXG4gIGNhc2VGb2xkOiBmYWxzZVxufVxuXG5Db2RlTWlycm9yLmRlZmluZU1vZGUoXCJ4bWxcIiwgZnVuY3Rpb24oZWRpdG9yQ29uZiwgY29uZmlnXykge1xuICB2YXIgaW5kZW50VW5pdCA9IGVkaXRvckNvbmYuaW5kZW50VW5pdFxuICB2YXIgY29uZmlnID0ge31cbiAgdmFyIGRlZmF1bHRzID0gY29uZmlnXy5odG1sTW9kZSA/IGh0bWxDb25maWcgOiB4bWxDb25maWdcbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0cykgY29uZmlnW3Byb3BdID0gZGVmYXVsdHNbcHJvcF1cbiAgZm9yICh2YXIgcHJvcCBpbiBjb25maWdfKSBjb25maWdbcHJvcF0gPSBjb25maWdfW3Byb3BdXG5cbiAgLy8gUmV0dXJuIHZhcmlhYmxlcyBmb3IgdG9rZW5pemVyc1xuICB2YXIgdHlwZSwgc2V0U3R5bGU7XG5cbiAgZnVuY3Rpb24gaW5UZXh0KHN0cmVhbSwgc3RhdGUpIHtcbiAgICBmdW5jdGlvbiBjaGFpbihwYXJzZXIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gcGFyc2VyO1xuICAgICAgcmV0dXJuIHBhcnNlcihzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIhXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwiW1wiKSkge1xuICAgICAgICAgIGlmIChzdHJlYW0ubWF0Y2goXCJDREFUQVtcIikpIHJldHVybiBjaGFpbihpbkJsb2NrKFwiYXRvbVwiLCBcIl1dPlwiKSk7XG4gICAgICAgICAgZWxzZSByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCItLVwiKSkge1xuICAgICAgICAgIHJldHVybiBjaGFpbihpbkJsb2NrKFwiY29tbWVudFwiLCBcIi0tPlwiKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLm1hdGNoKFwiRE9DVFlQRVwiLCB0cnVlLCB0cnVlKSkge1xuICAgICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGRvY3R5cGUoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmVhbS5lYXQoXCI/XCIpKSB7XG4gICAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLl9cXC1dLyk7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5CbG9jayhcIm1ldGFcIiwgXCI/PlwiKTtcbiAgICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZSA9IHN0cmVhbS5lYXQoXCIvXCIpID8gXCJjbG9zZVRhZ1wiIDogXCJvcGVuVGFnXCI7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UYWc7XG4gICAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIiZcIikge1xuICAgICAgdmFyIG9rO1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIjXCIpKSB7XG4gICAgICAgIGlmIChzdHJlYW0uZWF0KFwieFwiKSkge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bYS1mQS1GXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFxkXS8pICYmIHN0cmVhbS5lYXQoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvayA9IHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcLlxcLTpdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2sgPyBcImF0b21cIiA6IFwiZXJyb3JcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXiY8XS8pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGluVGV4dC5pc0luVGV4dCA9IHRydWU7XG5cbiAgZnVuY3Rpb24gaW5UYWcoc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPlwiIHx8IChjaCA9PSBcIi9cIiAmJiBzdHJlYW0uZWF0KFwiPlwiKSkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgdHlwZSA9IGNoID09IFwiPlwiID8gXCJlbmRUYWdcIiA6IFwic2VsZmNsb3NlVGFnXCI7XG4gICAgICByZXR1cm4gXCJ0YWcgYnJhY2tldFwiO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIpIHtcbiAgICAgIHR5cGUgPSBcImVxdWFsc1wiO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIjxcIikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICBzdGF0ZS5zdGF0ZSA9IGJhc2VTdGF0ZTtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICB2YXIgbmV4dCA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgcmV0dXJuIG5leHQgPyBuZXh0ICsgXCIgdGFnIGVycm9yXCIgOiBcInRhZyBlcnJvclwiO1xuICAgIH0gZWxzZSBpZiAoL1tcXCdcXFwiXS8udGVzdChjaCkpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gaW5BdHRyaWJ1dGUoY2gpO1xuICAgICAgc3RhdGUuc3RyaW5nU3RhcnRDb2wgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5tYXRjaCgvXlteXFxzXFx1MDBhMD08PlxcXCJcXCddKlteXFxzXFx1MDBhMD08PlxcXCJcXCdcXC9dLyk7XG4gICAgICByZXR1cm4gXCJ3b3JkXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5BdHRyaWJ1dGUocXVvdGUpIHtcbiAgICB2YXIgY2xvc3VyZSA9IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubmV4dCgpID09IHF1b3RlKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwic3RyaW5nXCI7XG4gICAgfTtcbiAgICBjbG9zdXJlLmlzSW5BdHRyaWJ1dGUgPSB0cnVlO1xuICAgIHJldHVybiBjbG9zdXJlO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5CbG9jayhzdHlsZSwgdGVybWluYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBpZiAoc3RyZWFtLm1hdGNoKHRlcm1pbmF0b3IpKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLm5leHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGRvY3R5cGUoZGVwdGgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgdmFyIGNoO1xuICAgICAgd2hpbGUgKChjaCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoICsgMSk7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNoID09IFwiPlwiKSB7XG4gICAgICAgICAgaWYgKGRlcHRoID09IDEpIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gaW5UZXh0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnRva2VuaXplID0gZG9jdHlwZShkZXB0aCAtIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFwibWV0YVwiO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCBzdGFydE9mTGluZSkge1xuICAgIHRoaXMucHJldiA9IHN0YXRlLmNvbnRleHQ7XG4gICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZTtcbiAgICB0aGlzLmluZGVudCA9IHN0YXRlLmluZGVudGVkO1xuICAgIHRoaXMuc3RhcnRPZkxpbmUgPSBzdGFydE9mTGluZTtcbiAgICBpZiAoY29uZmlnLmRvTm90SW5kZW50Lmhhc093blByb3BlcnR5KHRhZ05hbWUpIHx8IChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQubm9JbmRlbnQpKVxuICAgICAgdGhpcy5ub0luZGVudCA9IHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gcG9wQ29udGV4dChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5jb250ZXh0KSBzdGF0ZS5jb250ZXh0ID0gc3RhdGUuY29udGV4dC5wcmV2O1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgbmV4dFRhZ05hbWUpIHtcbiAgICB2YXIgcGFyZW50VGFnTmFtZTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKCFzdGF0ZS5jb250ZXh0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBhcmVudFRhZ05hbWUgPSBzdGF0ZS5jb250ZXh0LnRhZ05hbWU7XG4gICAgICBpZiAoIWNvbmZpZy5jb250ZXh0R3JhYmJlcnMuaGFzT3duUHJvcGVydHkocGFyZW50VGFnTmFtZSkgfHxcbiAgICAgICAgICAhY29uZmlnLmNvbnRleHRHcmFiYmVyc1twYXJlbnRUYWdOYW1lXS5oYXNPd25Qcm9wZXJ0eShuZXh0VGFnTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmFzZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIm9wZW5UYWdcIikge1xuICAgICAgc3RhdGUudGFnU3RhcnQgPSBzdHJlYW0uY29sdW1uKCk7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImNsb3NlVGFnXCIpIHtcbiAgICAgIHJldHVybiBjbG9zZVRhZ05hbWVTdGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdGFnTmFtZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIikge1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICByZXR1cm4gYXR0clN0YXRlO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgICAgcmV0dXJuIHRhZ05hbWVTdGF0ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2VUYWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0cmVhbS5jdXJyZW50KCk7XG4gICAgICBpZiAoc3RhdGUuY29udGV4dCAmJiBzdGF0ZS5jb250ZXh0LnRhZ05hbWUgIT0gdGFnTmFtZSAmJlxuICAgICAgICAgIGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KHN0YXRlLmNvbnRleHQudGFnTmFtZSkpXG4gICAgICAgIHBvcENvbnRleHQoc3RhdGUpO1xuICAgICAgaWYgKChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSA9PSB0YWdOYW1lKSB8fCBjb25maWcubWF0Y2hDbG9zaW5nID09PSBmYWxzZSkge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U3R5bGUgPSBcInRhZyBlcnJvclwiO1xuICAgICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5hbGxvd01pc3NpbmdUYWdOYW1lICYmIHR5cGUgPT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcInRhZyBicmFja2V0XCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZUVycjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZVN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgIT0gXCJlbmRUYWdcIikge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gY2xvc2VTdGF0ZTtcbiAgICB9XG4gICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZVN0YXRlRXJyKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gY2xvc2VTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dHJTdGF0ZSh0eXBlLCBfc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiYXR0cmlidXRlXCI7XG4gICAgICByZXR1cm4gYXR0ckVxU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZW5kVGFnXCIgfHwgdHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiKSB7XG4gICAgICB2YXIgdGFnTmFtZSA9IHN0YXRlLnRhZ05hbWUsIHRhZ1N0YXJ0ID0gc3RhdGUudGFnU3RhcnQ7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RhdGUudGFnU3RhcnQgPSBudWxsO1xuICAgICAgaWYgKHR5cGUgPT0gXCJzZWxmY2xvc2VUYWdcIiB8fFxuICAgICAgICAgIGNvbmZpZy5hdXRvU2VsZkNsb3NlcnMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heWJlUG9wQ29udGV4dChzdGF0ZSwgdGFnTmFtZSk7XG4gICAgICAgIHN0YXRlLmNvbnRleHQgPSBuZXcgQ29udGV4dChzdGF0ZSwgdGFnTmFtZSwgdGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VTdGF0ZTtcbiAgICB9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyRXFTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJlcXVhbHNcIikgcmV0dXJuIGF0dHJWYWx1ZVN0YXRlO1xuICAgIGlmICghY29uZmlnLmFsbG93TWlzc2luZykgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyVmFsdWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICBpZiAodHlwZSA9PSBcIndvcmRcIiAmJiBjb25maWcuYWxsb3dVbnF1b3RlZCkge3NldFN0eWxlID0gXCJzdHJpbmdcIjsgcmV0dXJuIGF0dHJTdGF0ZTt9XG4gICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBhdHRyQ29udGludWVkU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBhdHRyQ29udGludWVkU3RhdGU7XG4gICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnRTdGF0ZTogZnVuY3Rpb24oYmFzZUluZGVudCkge1xuICAgICAgdmFyIHN0YXRlID0ge3Rva2VuaXplOiBpblRleHQsXG4gICAgICAgICAgICAgICAgICAgc3RhdGU6IGJhc2VTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICBpbmRlbnRlZDogYmFzZUluZGVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IG51bGwsIHRhZ1N0YXJ0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IG51bGx9XG4gICAgICBpZiAoYmFzZUluZGVudCAhPSBudWxsKSBzdGF0ZS5iYXNlSW5kZW50ID0gYmFzZUluZGVudFxuICAgICAgcmV0dXJuIHN0YXRlXG4gICAgfSxcblxuICAgIHRva2VuOiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICBpZiAoIXN0YXRlLnRhZ05hbWUgJiYgc3RyZWFtLnNvbCgpKVxuICAgICAgICBzdGF0ZS5pbmRlbnRlZCA9IHN0cmVhbS5pbmRlbnRhdGlvbigpO1xuXG4gICAgICBpZiAoc3RyZWFtLmVhdFNwYWNlKCkpIHJldHVybiBudWxsO1xuICAgICAgdHlwZSA9IG51bGw7XG4gICAgICB2YXIgc3R5bGUgPSBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmICgoc3R5bGUgfHwgdHlwZSkgJiYgc3R5bGUgIT0gXCJjb21tZW50XCIpIHtcbiAgICAgICAgc2V0U3R5bGUgPSBudWxsO1xuICAgICAgICBzdGF0ZS5zdGF0ZSA9IHN0YXRlLnN0YXRlKHR5cGUgfHwgc3R5bGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgICBpZiAoc2V0U3R5bGUpXG4gICAgICAgICAgc3R5bGUgPSBzZXRTdHlsZSA9PSBcImVycm9yXCIgPyBzdHlsZSArIFwiIGVycm9yXCIgOiBzZXRTdHlsZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9LFxuXG4gICAgaW5kZW50OiBmdW5jdGlvbihzdGF0ZSwgdGV4dEFmdGVyLCBmdWxsTGluZSkge1xuICAgICAgdmFyIGNvbnRleHQgPSBzdGF0ZS5jb250ZXh0O1xuICAgICAgLy8gSW5kZW50IG11bHRpLWxpbmUgc3RyaW5ncyAoZS5nLiBjc3MpLlxuICAgICAgaWYgKHN0YXRlLnRva2VuaXplLmlzSW5BdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKHN0YXRlLnRhZ1N0YXJ0ID09IHN0YXRlLmluZGVudGVkKVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5zdHJpbmdTdGFydENvbCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUuaW5kZW50ZWQgKyBpbmRlbnRVbml0O1xuICAgICAgfVxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5ub0luZGVudCkgcmV0dXJuIENvZGVNaXJyb3IuUGFzcztcbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSAhPSBpblRhZyAmJiBzdGF0ZS50b2tlbml6ZSAhPSBpblRleHQpXG4gICAgICAgIHJldHVybiBmdWxsTGluZSA/IGZ1bGxMaW5lLm1hdGNoKC9eKFxccyopLylbMF0ubGVuZ3RoIDogMDtcbiAgICAgIC8vIEluZGVudCB0aGUgc3RhcnRzIG9mIGF0dHJpYnV0ZSBuYW1lcy5cbiAgICAgIGlmIChzdGF0ZS50YWdOYW1lKSB7XG4gICAgICAgIGlmIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50UGFzdFRhZyAhPT0gZmFsc2UpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgc3RhdGUudGFnTmFtZS5sZW5ndGggKyAyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnRhZ1N0YXJ0ICsgaW5kZW50VW5pdCAqIChjb25maWcubXVsdGlsaW5lVGFnSW5kZW50RmFjdG9yIHx8IDEpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZy5hbGlnbkNEQVRBICYmIC88IVxcW0NEQVRBXFxbLy50ZXN0KHRleHRBZnRlcikpIHJldHVybiAwO1xuICAgICAgdmFyIHRhZ0FmdGVyID0gdGV4dEFmdGVyICYmIC9ePChcXC8pPyhbXFx3XzpcXC4tXSopLy5leGVjKHRleHRBZnRlcik7XG4gICAgICBpZiAodGFnQWZ0ZXIgJiYgdGFnQWZ0ZXJbMV0pIHsgLy8gQ2xvc2luZyB0YWcgc3BvdHRlZFxuICAgICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0LnRhZ05hbWUgPT0gdGFnQWZ0ZXJbMl0pIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy5pbXBsaWNpdGx5Q2xvc2VkLmhhc093blByb3BlcnR5KGNvbnRleHQudGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0YWdBZnRlcikgeyAvLyBPcGVuaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgdmFyIGdyYWJiZXJzID0gY29uZmlnLmNvbnRleHRHcmFiYmVyc1tjb250ZXh0LnRhZ05hbWVdO1xuICAgICAgICAgIGlmIChncmFiYmVycyAmJiBncmFiYmVycy5oYXNPd25Qcm9wZXJ0eSh0YWdBZnRlclsyXSkpXG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wcmV2O1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoY29udGV4dCAmJiBjb250ZXh0LnByZXYgJiYgIWNvbnRleHQuc3RhcnRPZkxpbmUpXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICBpZiAoY29udGV4dCkgcmV0dXJuIGNvbnRleHQuaW5kZW50ICsgaW5kZW50VW5pdDtcbiAgICAgIGVsc2UgcmV0dXJuIHN0YXRlLmJhc2VJbmRlbnQgfHwgMDtcbiAgICB9LFxuXG4gICAgZWxlY3RyaWNJbnB1dDogLzxcXC9bXFxzXFx3Ol0rPiQvLFxuICAgIGJsb2NrQ29tbWVudFN0YXJ0OiBcIjwhLS1cIixcbiAgICBibG9ja0NvbW1lbnRFbmQ6IFwiLS0+XCIsXG5cbiAgICBjb25maWd1cmF0aW9uOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG4gICAgaGVscGVyVHlwZTogY29uZmlnLmh0bWxNb2RlID8gXCJodG1sXCIgOiBcInhtbFwiLFxuXG4gICAgc2tpcEF0dHJpYnV0ZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5zdGF0ZSA9PSBhdHRyVmFsdWVTdGF0ZSlcbiAgICAgICAgc3RhdGUuc3RhdGUgPSBhdHRyU3RhdGVcbiAgICB9XG4gIH07XG59KTtcblxuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC94bWxcIiwgXCJ4bWxcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi94bWxcIiwgXCJ4bWxcIik7XG5pZiAoIUNvZGVNaXJyb3IubWltZU1vZGVzLmhhc093blByb3BlcnR5KFwidGV4dC9odG1sXCIpKVxuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2h0bWxcIiwge25hbWU6IFwieG1sXCIsIGh0bWxNb2RlOiB0cnVlfSk7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGZpcnN0X25hbWU6ICQoJyNmaXJzdF9uYW1lJykudmFsKCksXG4gICAgICBsYXN0X25hbWU6ICQoJyNsYXN0X25hbWUnKS52YWwoKSxcbiAgICAgIGVtYWlsOiAkKCcjZW1haWwnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNhZHZpc29yX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuYWR2aXNvcl9pZCA9ICQoJyNhZHZpc29yX2lkJykudmFsKCk7XG4gICAgfVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGRhdGEuZWlkID0gJCgnI2VpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3N0dWRlbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vc3R1ZGVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlc3R1ZGVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9zdHVkZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xucmVxdWlyZSgnY29kZW1pcnJvcicpO1xucmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbnJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2Fkdmlzb3JcIj5OZXcgQWR2aXNvcjwvYT4nKTtcblxuICAkKCcjbm90ZXMnKS5zdW1tZXJub3RlKHtcblx0XHRmb2N1czogdHJ1ZSxcblx0XHR0b29sYmFyOiBbXG5cdFx0XHQvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cblx0XHRcdFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcblx0XHRcdFsnZm9udCcsIFsnc3RyaWtldGhyb3VnaCcsICdzdXBlcnNjcmlwdCcsICdzdWJzY3JpcHQnLCAnbGluayddXSxcblx0XHRcdFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuXHRcdFx0WydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG5cdFx0XSxcblx0XHR0YWJzaXplOiAyLFxuXHRcdGNvZGVtaXJyb3I6IHtcblx0XHRcdG1vZGU6ICd0ZXh0L2h0bWwnLFxuXHRcdFx0aHRtbE1vZGU6IHRydWUsXG5cdFx0XHRsaW5lTnVtYmVyczogdHJ1ZSxcblx0XHRcdHRoZW1lOiAnbW9ub2thaSdcblx0XHR9LFxuXHR9KTtcblxuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJuYW1lXCIsICQoJyNuYW1lJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJwaG9uZVwiLCAkKCcjcGhvbmUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuICAgIGZvcm1EYXRhLmFwcGVuZChcImhpZGRlblwiLCAkKCcjaGlkZGVuJykuaXMoJzpjaGVja2VkJykgPyAxIDogMCk7XG5cdFx0aWYoJCgnI3BpYycpLnZhbCgpKXtcblx0XHRcdGZvcm1EYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cbiAgICBpZigkKCcjZGVwYXJ0bWVudF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJkZXBhcnRtZW50X2lkXCIsICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2Fkdmlzb3InO1xuICAgIH1lbHNle1xuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZWlkXCIsICQoJyNlaWQnKS52YWwoKSk7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9hZHZpc29ycy8nICsgaWQ7XG4gICAgfVxuXHRcdGRhc2hib2FyZC5hamF4c2F2ZShmb3JtRGF0YSwgdXJsLCBpZCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlYWR2aXNvclwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9hZHZpc29yc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dCA9ICQodGhpcyksXG4gICAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG4gICAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuICAgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG4gIH0pO1xuXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0JyksXG4gICAgICAgICAgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZiggaW5wdXQubGVuZ3RoICkge1xuICAgICAgICAgIGlucHV0LnZhbChsb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiggbG9nICkgYWxlcnQobG9nKTtcbiAgICAgIH1cblxuICB9KTtcblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2RlcGFydG1lbnRcIj5OZXcgRGVwYXJ0bWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgICAgb2ZmaWNlOiAkKCcjb2ZmaWNlJykudmFsKCksXG4gICAgICBwaG9uZTogJCgnI3Bob25lJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZXBhcnRtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2RlcGFydG1lbnRzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZWRlcGFydG1lbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVwYXJ0bWVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVwiPk5ldyBEZWdyZWUgUHJvZ3JhbTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfeWVhcjogJCgnI2VmZmVjdGl2ZV95ZWFyJykudmFsKCksXG4gICAgICBlZmZlY3RpdmVfc2VtZXN0ZXI6ICQoJyNlZmZlY3RpdmVfc2VtZXN0ZXInKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZGVwYXJ0bWVudF9pZCA9ICQoJyNkZXBhcnRtZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlZ3JlZXByb2dyYW0nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcHJvZ3JhbXMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVncmVlcHJvZ3JhbVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZWdyZWVwcm9ncmFtc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdlbGVjdGl2ZWxpc3RcIj5OZXcgRWxlY3RpdmUgTGlzdDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgYWJicmV2aWF0aW9uOiAkKCcjYWJicmV2aWF0aW9uJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdlbGVjdGl2ZWxpc3QnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVsaXN0cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWVsZWN0aXZlbGlzdFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9lbGVjdGl2ZWxpc3RzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3cGxhblwiPk5ldyBQbGFuPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBkZXNjcmlwdGlvbjogJCgnI2Rlc2NyaXB0aW9uJykudmFsKCksXG4gICAgICBzdGFydF95ZWFyOiAkKCcjc3RhcnRfeWVhcicpLnZhbCgpLFxuICAgICAgc3RhcnRfc2VtZXN0ZXI6ICQoJyNzdGFydF9zZW1lc3RlcicpLnZhbCgpLFxuICAgICAgZGVncmVlcHJvZ3JhbV9pZDogJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKSxcbiAgICAgIHN0dWRlbnRfaWQ6ICQoJyNzdHVkZW50X2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFuJztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5zLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwsIHRydWUpO1xuICB9KTtcblxuICAkKCcjZm9yY2VkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9mb3JjZWRlbGV0ZXBsYW5cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vcGxhbnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3Jlc3RvcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9yZXN0b3JlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnI3JlcG9wdWxhdGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIGFsbCByZXF1aXJlbWVudHMgYW5kIHJlcG9wdWxhdGUgdGhlbSBiYXNlZCBvbiB0aGUgc2VsZWN0ZWQgZGVncmVlIHByb2dyYW0uIFlvdSBjYW5ub3QgdW5kbyB0aGlzIGFjdGlvbi5cIik7XG4gIFx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAgIHZhciB1cmwgPSBcIi9hZG1pbi9wb3B1bGF0ZXBsYW5cIjtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgICB9O1xuICAgICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICAgIH1cbiAgfSlcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICBkYXNoYm9hcmQuaW5pdCgpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBwbGFuX2lkOiAkKCcjcGxhbl9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcGxhbnMvZGVsZXRlcGxhbnNlbWVzdGVyL1wiICsgJCgnI2lkJykudmFsKCkgO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFucy9cIiArICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3Y29tcGxldGVkY291cnNlXCI+TmV3IENvbXBsZXRlZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgY291cnNlbnVtYmVyOiAkKCcjY291cnNlbnVtYmVyJykudmFsKCksXG4gICAgICBuYW1lOiAkKCcjbmFtZScpLnZhbCgpLFxuICAgICAgeWVhcjogJCgnI3llYXInKS52YWwoKSxcbiAgICAgIHNlbWVzdGVyOiAkKCcjc2VtZXN0ZXInKS52YWwoKSxcbiAgICAgIGJhc2lzOiAkKCcjYmFzaXMnKS52YWwoKSxcbiAgICAgIGdyYWRlOiAkKCcjZ3JhZGUnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNzdHVkZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSd0cmFuc2ZlciddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEudHJhbnNmZXIgPSBmYWxzZTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgZGF0YS50cmFuc2ZlciA9IHRydWU7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19pbnN0aXR1dGlvbiA9ICQoJyNpbmNvbWluZ19pbnN0aXR1dGlvbicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfbmFtZSA9ICQoJyNpbmNvbWluZ19uYW1lJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19kZXNjcmlwdGlvbiA9ICQoJyNpbmNvbWluZ19kZXNjcmlwdGlvbicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfc2VtZXN0ZXIgPSAkKCcjaW5jb21pbmdfc2VtZXN0ZXInKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2NyZWRpdHMgPSAkKCcjaW5jb21pbmdfY3JlZGl0cycpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfZ3JhZGUgPSAkKCcjaW5jb21pbmdfZ3JhZGUnKS52YWwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2UnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vY29tcGxldGVkY291cnNlcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWNvbXBsZXRlZGNvdXJzZVwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9dHJhbnNmZXJdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ3N0dWRlbnRfaWQnLCAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnKTtcblxuICBpZigkKCcjdHJhbnNmZXJjb3Vyc2UnKS5pcygnOmhpZGRlbicpKXtcbiAgICAkKCcjdHJhbnNmZXIxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICB9ZWxzZXtcbiAgICAkKCcjdHJhbnNmZXIyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICB9XG5cbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3RyYW5zZmVyJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNrc3RhdGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyN0cmFuc2ZlcmNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcja3N0YXRlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjdHJhbnNmZXJjb3Vyc2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCIvL2h0dHBzOi8vbGFyYXZlbC5jb20vZG9jcy81LjQvbWl4I3dvcmtpbmctd2l0aC1zY3JpcHRzXG4vL2h0dHBzOi8vYW5keS1jYXJ0ZXIuY29tL2Jsb2cvc2NvcGluZy1qYXZhc2NyaXB0LWZ1bmN0aW9uYWxpdHktdG8tc3BlY2lmaWMtcGFnZXMtd2l0aC1sYXJhdmVsLWFuZC1jYWtlcGhwXG5cbi8vTG9hZCBzaXRlLXdpZGUgbGlicmFyaWVzIGluIGJvb3RzdHJhcCBmaWxlXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcCcpO1xuXG52YXIgQXBwID0ge1xuXG5cdC8vIENvbnRyb2xsZXItYWN0aW9uIG1ldGhvZHNcblx0YWN0aW9uczoge1xuXHRcdC8vSW5kZXggZm9yIGRpcmVjdGx5IGNyZWF0ZWQgdmlld3Mgd2l0aCBubyBleHBsaWNpdCBjb250cm9sbGVyXG5cdFx0Um9vdFJvdXRlQ29udHJvbGxlcjoge1xuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWJvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cdFx0XHR9LFxuICAgIH0sXG5cblx0XHQvL0FkdmlzaW5nIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvYWR2aXNpbmdcblx0XHRBZHZpc2luZ0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWR2aXNpbmcvaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNhbGVuZGFyID0gcmVxdWlyZSgnLi9wYWdlcy9jYWxlbmRhcicpO1xuXHRcdFx0XHRjYWxlbmRhci5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vR3JvdXBzZXNzaW9uIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvZ3JvdXBzZXNzaW9uXG4gICAgR3JvdXBzZXNzaW9uQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9ncm91cHNlc3Npb24vaW5kZXhcbiAgICAgIGdldEluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRhYmxlID0gcmVxdWlyZSgnLi91dGlsL2VkaXRhYmxlJyk7XG5cdFx0XHRcdGVkaXRhYmxlLmluaXQoKTtcblx0XHRcdFx0dmFyIHNpdGUgPSByZXF1aXJlKCcuL3V0aWwvc2l0ZScpO1xuXHRcdFx0XHRzaXRlLmNoZWNrTWVzc2FnZSgpO1xuICAgICAgfSxcblx0XHRcdC8vZ3JvdXBzZXNpb24vbGlzdFxuXHRcdFx0Z2V0TGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBncm91cHNlc3Npb24gPSByZXF1aXJlKCcuL3BhZ2VzL2dyb3Vwc2Vzc2lvbicpO1xuXHRcdFx0XHRncm91cHNlc3Npb24uaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Ly9Qcm9maWxlcyBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL3Byb2ZpbGVcblx0XHRQcm9maWxlc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vcHJvZmlsZS9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcHJvZmlsZSA9IHJlcXVpcmUoJy4vcGFnZXMvcHJvZmlsZScpO1xuXHRcdFx0XHRwcm9maWxlLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9EYXNoYm9hcmQgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZG1pbi1sdGVcblx0XHREYXNoYm9hcmRDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuL3V0aWwvZGFzaGJvYXJkJyk7XG5cdFx0XHRcdGRhc2hib2FyZC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTdHVkZW50c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc3R1ZGVudHNcblx0XHRcdGdldFN0dWRlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3c3R1ZGVudFxuXHRcdFx0Z2V0TmV3c3R1ZGVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdHVkZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0Jyk7XG5cdFx0XHRcdHN0dWRlbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEFkdmlzb3JzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9hZHZpc29yc1xuXHRcdFx0Z2V0QWR2aXNvcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdhZHZpc29yXG5cdFx0XHRnZXROZXdhZHZpc29yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFkdmlzb3JlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQnKTtcblx0XHRcdFx0YWR2aXNvcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVwYXJ0bWVudHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlcGFydG1lbnRzXG5cdFx0XHRnZXREZXBhcnRtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZXBhcnRtZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0Jyk7XG5cdFx0XHRcdGRlcGFydG1lbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlcGFydG1lbnRcblx0XHRcdGdldE5ld2RlcGFydG1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZGVwYXJ0bWVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9kZXBhcnRtZW50ZWRpdCcpO1xuXHRcdFx0XHRkZXBhcnRtZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRNZWV0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vbWVldGluZ3Ncblx0XHRcdGdldE1lZXRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1lZXRpbmdlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQnKTtcblx0XHRcdFx0bWVldGluZ2VkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0QmxhY2tvdXRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9ibGFja291dHNcblx0XHRcdGdldEJsYWNrb3V0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBibGFja291dGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQnKTtcblx0XHRcdFx0YmxhY2tvdXRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2dyb3Vwc2Vzc2lvbnNcblx0XHRcdGdldEdyb3Vwc2Vzc2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXBzZXNzaW9uZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQnKTtcblx0XHRcdFx0Z3JvdXBzZXNzaW9uZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRTZXR0aW5nc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vc2V0dGluZ3Ncblx0XHRcdGdldFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNldHRpbmdzID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MnKTtcblx0XHRcdFx0c2V0dGluZ3MuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RGVncmVlcHJvZ3JhbXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW0ve2lkfVxuXHRcdFx0Z2V0RGVncmVlcHJvZ3JhbURldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVxuXHRcdFx0Z2V0TmV3ZGVncmVlcHJvZ3JhbTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZWdyZWVwcm9ncmFtZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1lZGl0Jyk7XG5cdFx0XHRcdGRlZ3JlZXByb2dyYW1lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEVsZWN0aXZlbGlzdHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2RlZ3JlZXByb2dyYW1zXG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3RzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0Jyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXRFbGVjdGl2ZWxpc3REZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2RlZ3JlZXByb2dyYW1cblx0XHRcdGdldE5ld2VsZWN0aXZlbGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdCcpO1xuXHRcdFx0XHRlbGVjdGl2ZWxpc3RlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFBsYW5zQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9wbGFuc1xuXHRcdFx0Z2V0UGxhbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdCcpO1xuXHRcdFx0XHRwbGFuZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9wbGFuL3tpZH1cblx0XHRcdGdldFBsYW5EZXRhaWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmRldGFpbCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5kZXRhaWwnKTtcblx0XHRcdFx0cGxhbmRldGFpbC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuXG5cdFx0XHRnZXROZXdwbGFuOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmVkaXQnKTtcblx0XHRcdFx0cGxhbmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0UGxhbnNlbWVzdGVyc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vcGxhbnNlbWVzdGVyXG5cdFx0XHRnZXRQbGFuU2VtZXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbnNlbWVzdGVyZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5zZW1lc3RlcmVkaXQnKTtcblx0XHRcdFx0cGxhbnNlbWVzdGVyZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdwbGFuc2VtZXN0ZXJcblx0XHRcdGdldE5ld1BsYW5TZW1lc3RlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuc2VtZXN0ZXJlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdCcpO1xuXHRcdFx0XHRwbGFuc2VtZXN0ZXJlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdENvbXBsZXRlZGNvdXJzZXNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcblx0XHRcdGdldENvbXBsZXRlZGNvdXJzZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY29tcGxldGVkY291cnNlZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQnKTtcblx0XHRcdFx0Y29tcGxldGVkY291cnNlZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2Vcblx0XHRcdGdldE5ld2NvbXBsZXRlZGNvdXJzZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb21wbGV0ZWRjb3Vyc2VlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdCcpO1xuXHRcdFx0XHRjb21wbGV0ZWRjb3Vyc2VlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdEZsb3djaGFydHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2Zsb3djaGFydHMvdmlldy9cblx0XHRcdGdldEZsb3djaGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBmbG93Y2hhcnQgPSByZXF1aXJlKCcuL3BhZ2VzL2Zsb3djaGFydCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGZsb3djaGFydCA9IHJlcXVpcmUoJy4vcGFnZXMvZmxvd2NoYXJ0bGlzdCcpO1xuXHRcdFx0XHRmbG93Y2hhcnQuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0fSxcblxuXHQvL0Z1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGJ5IHRoZSBwYWdlIGF0IGxvYWQuIERlZmluZWQgaW4gcmVzb3VyY2VzL3ZpZXdzL2luY2x1ZGVzL3NjcmlwdHMuYmxhZGUucGhwXG5cdC8vYW5kIEFwcC9IdHRwL1ZpZXdDb21wb3NlcnMvSmF2YXNjcmlwdCBDb21wb3NlclxuXHQvL1NlZSBsaW5rcyBhdCB0b3Agb2YgZmlsZSBmb3IgZGVzY3JpcHRpb24gb2Ygd2hhdCdzIGdvaW5nIG9uIGhlcmVcblx0Ly9Bc3N1bWVzIDIgaW5wdXRzIC0gdGhlIGNvbnRyb2xsZXIgYW5kIGFjdGlvbiB0aGF0IGNyZWF0ZWQgdGhpcyBwYWdlXG5cdGluaXQ6IGZ1bmN0aW9uKGNvbnRyb2xsZXIsIGFjdGlvbikge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgdGhpcy5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvL2NhbGwgdGhlIG1hdGNoaW5nIGZ1bmN0aW9uIGluIHRoZSBhcnJheSBhYm92ZVxuXHRcdFx0cmV0dXJuIEFwcC5hY3Rpb25zW2NvbnRyb2xsZXJdW2FjdGlvbl0oKTtcblx0XHR9XG5cdH0sXG59O1xuXG4vL0JpbmQgdG8gdGhlIHdpbmRvd1xud2luZG93LkFwcCA9IEFwcDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYXBwLmpzIiwid2luZG93Ll8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIGpRdWVyeSBhbmQgdGhlIEJvb3RzdHJhcCBqUXVlcnkgcGx1Z2luIHdoaWNoIHByb3ZpZGVzIHN1cHBvcnRcbiAqIGZvciBKYXZhU2NyaXB0IGJhc2VkIEJvb3RzdHJhcCBmZWF0dXJlcyBzdWNoIGFzIG1vZGFscyBhbmQgdGFicy4gVGhpc1xuICogY29kZSBtYXkgYmUgbW9kaWZpZWQgdG8gZml0IHRoZSBzcGVjaWZpYyBuZWVkcyBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICovXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuLyoqXG4gKiBXZSdsbCBsb2FkIHRoZSBheGlvcyBIVFRQIGxpYnJhcnkgd2hpY2ggYWxsb3dzIHVzIHRvIGVhc2lseSBpc3N1ZSByZXF1ZXN0c1xuICogdG8gb3VyIExhcmF2ZWwgYmFjay1lbmQuIFRoaXMgbGlicmFyeSBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgc2VuZGluZyB0aGVcbiAqIENTUkYgdG9rZW4gYXMgYSBoZWFkZXIgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBcIlhTUkZcIiB0b2tlbiBjb29raWUuXG4gKi9cblxud2luZG93LmF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLy9odHRwczovL2dpdGh1Yi5jb20vcmFwcGFzb2Z0L2xhcmF2ZWwtNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9yZXNvdXJjZXMvYXNzZXRzL2pzL2Jvb3RzdHJhcC5qc1xud2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4vKipcbiAqIE5leHQgd2Ugd2lsbCByZWdpc3RlciB0aGUgQ1NSRiBUb2tlbiBhcyBhIGNvbW1vbiBoZWFkZXIgd2l0aCBBeGlvcyBzbyB0aGF0XG4gKiBhbGwgb3V0Z29pbmcgSFRUUCByZXF1ZXN0cyBhdXRvbWF0aWNhbGx5IGhhdmUgaXQgYXR0YWNoZWQuIFRoaXMgaXMganVzdFxuICogYSBzaW1wbGUgY29udmVuaWVuY2Ugc28gd2UgZG9uJ3QgaGF2ZSB0byBhdHRhY2ggZXZlcnkgdG9rZW4gbWFudWFsbHkuXG4gKi9cblxubGV0IHRva2VuID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG5cbmlmICh0b2tlbikge1xuICAgIHdpbmRvdy5heGlvcy5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1DU1JGLVRPS0VOJ10gPSB0b2tlbi5jb250ZW50O1xufSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdDU1JGIHRva2VuIG5vdCBmb3VuZDogaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzL2NzcmYjY3NyZi14LWNzcmYtdG9rZW4nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzIiwiLy9sb2FkIHJlcXVpcmVkIEpTIGxpYnJhcmllc1xucmVxdWlyZSgnZnVsbGNhbGVuZGFyJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnZW9uYXNkYW4tYm9vdHN0cmFwLWRhdGV0aW1lcGlja2VyLXJ1c3NmZWxkJyk7XG52YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuLi91dGlsL2VkaXRhYmxlJyk7XG5cbi8vU2Vzc2lvbiBmb3Igc3RvcmluZyBkYXRhIGJldHdlZW4gZm9ybXNcbmV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cbi8vSUQgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgY2FsZW5kYXIncyBhZHZpc29yXG5leHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEID0gLTE7XG5cbi8vU3R1ZGVudCdzIE5hbWUgc2V0IGJ5IGluaXRcbmV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9IFwiXCI7XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbmV4cG9ydHMuY2FsZW5kYXJEYXRhID0ge1xuXHRoZWFkZXI6IHtcblx0XHRsZWZ0OiAncHJldixuZXh0IHRvZGF5Jyxcblx0XHRjZW50ZXI6ICd0aXRsZScsXG5cdFx0cmlnaHQ6ICdhZ2VuZGFXZWVrLGFnZW5kYURheSdcblx0fSxcblx0ZWRpdGFibGU6IGZhbHNlLFxuXHRldmVudExpbWl0OiB0cnVlLFxuXHRoZWlnaHQ6ICdhdXRvJyxcblx0d2Vla2VuZHM6IGZhbHNlLFxuXHRidXNpbmVzc0hvdXJzOiB7XG5cdFx0c3RhcnQ6ICc4OjAwJywgLy8gYSBzdGFydCB0aW1lICgxMGFtIGluIHRoaXMgZXhhbXBsZSlcblx0XHRlbmQ6ICcxNzowMCcsIC8vIGFuIGVuZCB0aW1lICg2cG0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGRvdzogWyAxLCAyLCAzLCA0LCA1IF1cblx0fSxcblx0ZGVmYXVsdFZpZXc6ICdhZ2VuZGFXZWVrJyxcblx0dmlld3M6IHtcblx0XHRhZ2VuZGE6IHtcblx0XHRcdGFsbERheVNsb3Q6IGZhbHNlLFxuXHRcdFx0c2xvdER1cmF0aW9uOiAnMDA6MjA6MDAnLFxuXHRcdFx0bWluVGltZTogJzA4OjAwOjAwJyxcblx0XHRcdG1heFRpbWU6ICcxNzowMDowMCdcblx0XHR9XG5cdH0sXG5cdGV2ZW50U291cmNlczogW1xuXHRcdHtcblx0XHRcdHVybDogJy9hZHZpc2luZy9tZWV0aW5nZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIG1lZXRpbmcgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyM1MTI4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnd2hpdGUnLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL2JsYWNrb3V0ZmVlZCcsXG5cdFx0XHR0eXBlOiAnR0VUJyxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGZldGNoaW5nIGJsYWNrb3V0IGV2ZW50cyBmcm9tIGRhdGFiYXNlJyk7XG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6ICcjRkY4ODg4Jyxcblx0XHRcdHRleHRDb2xvcjogJ2JsYWNrJyxcblx0XHR9LFxuXHRdLFxuXHRzZWxlY3RhYmxlOiB0cnVlLFxuXHRzZWxlY3RIZWxwZXI6IHRydWUsXG5cdHNlbGVjdE92ZXJsYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGV2ZW50LnJlbmRlcmluZyA9PT0gJ2JhY2tncm91bmQnO1xuXHR9LFxuXHR0aW1lRm9ybWF0OiAnICcsXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0YSA9IHtcblx0XHRkYXlzT2ZXZWVrRGlzYWJsZWQ6IFswLCA2XSxcblx0XHRmb3JtYXQ6ICdMTEwnLFxuXHRcdHN0ZXBwaW5nOiAyMCxcblx0XHRlbmFibGVkSG91cnM6IFs4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTddLFxuXHRcdG1heEhvdXI6IDE3LFxuXHRcdHNpZGVCeVNpZGU6IHRydWUsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGRhdGVwaWNrZXIgaW5zdGFuY2UgZGF5IG9ubHlcbmV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5ID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ01NL0REL1lZWVknLFxuXHRcdGlnbm9yZVJlYWRvbmx5OiB0cnVlLFxuXHRcdGFsbG93SW5wdXRUb2dnbGU6IHRydWVcbn07XG5cbi8qKlxuICogSW5pdGlhbHphdGlvbiBmdW5jdGlvbiBmb3IgZnVsbGNhbGVuZGFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIGFkdmlzb3IgLSBib29sZWFuIHRydWUgaWYgdGhlIHVzZXIgaXMgYW4gYWR2aXNvclxuICogQHBhcmFtIG5vYmluZCAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgYnV0dG9ucyBzaG91bGQgbm90IGJlIGJvdW5kIChtYWtlIGNhbGVuZGFyIHJlYWQtb25seSlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL0NoZWNrIGZvciBtZXNzYWdlcyBpbiB0aGUgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXMgYWN0aW9uXG5cdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cblx0Ly9pbml0YWxpemUgZWRpdGFibGUgZWxlbWVudHNcblx0ZWRpdGFibGUuaW5pdCgpO1xuXG5cdC8vdHdlYWsgcGFyYW1ldGVyc1xuXHR3aW5kb3cuYWR2aXNvciB8fCAod2luZG93LmFkdmlzb3IgPSBmYWxzZSk7XG5cdHdpbmRvdy5ub2JpbmQgfHwgKHdpbmRvdy5ub2JpbmQgPSBmYWxzZSk7XG5cblx0Ly9nZXQgdGhlIGN1cnJlbnQgYWR2aXNvcidzIElEXG5cdGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAkKCcjY2FsZW5kYXJBZHZpc29ySUQnKS52YWwoKS50cmltKCk7XG5cblx0Ly9TZXQgdGhlIGFkdmlzb3IgaW5mb3JtYXRpb24gZm9yIG1lZXRpbmcgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1swXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL1NldCB0aGUgYWR2c2lvciBpbmZvcmFtdGlvbiBmb3IgYmxhY2tvdXQgZXZlbnQgc291cmNlXG5cdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5kYXRhID0ge2lkOiBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEfTtcblxuXHQvL2lmIHRoZSB3aW5kb3cgaXMgc21hbGwsIHNldCBkaWZmZXJlbnQgZGVmYXVsdCBmb3IgY2FsZW5kYXJcblx0aWYoJCh3aW5kb3cpLndpZHRoKCkgPCA2MDApe1xuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmRlZmF1bHRWaWV3ID0gJ2FnZW5kYURheSc7XG5cdH1cblxuXHQvL0lmIG5vYmluZCwgZG9uJ3QgYmluZCB0aGUgZm9ybXNcblx0aWYoIXdpbmRvdy5ub2JpbmQpe1xuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhbiBhZHZpc29yLCBiaW5kIG1vcmUgZGF0YVxuXHRcdGlmKHdpbmRvdy5hZHZpc29yKXtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI3RpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL0VuYWJsZSBhbmQgZGlzYWJsZSBjZXJ0YWluIGZvcm0gZmllbGRzIGJhc2VkIG9uIHVzZXJcblx0XHRcdCQoJyN0aXRsZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0JCgnI3N0YXJ0JykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjZW5kJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjZW5kX3NwYW4nKS5yZW1vdmVDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLnNob3coKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5zaG93KCk7XG5cblx0XHRcdC8vYmluZCB0aGUgcmVzZXQgZm9ybSBtZXRob2Rcblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG5cdFx0XHQvL2JpbmQgbWV0aG9kcyBmb3IgYnV0dG9ucyBhbmQgZm9ybXNcblx0XHRcdCQoJyNuZXdTdHVkZW50QnV0dG9uJykuYmluZCgnY2xpY2snLCBuZXdTdHVkZW50KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjYnRpdGxlJykuZm9jdXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdFx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQodGhpcykuZmluZCgnZm9ybScpWzBdLnJlc2V0KCk7XG5cdFx0XHQgICAgJCh0aGlzKS5maW5kKCcuaGFzLWVycm9yJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRleHQoJycpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjY3JlYXRlRXZlbnQnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgbG9hZENvbmZsaWN0cyk7XG5cblx0XHRcdCQoJyNyZXNvbHZlQ29uZmxpY3QnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9iaW5kIGF1dG9jb21wbGV0ZSBmaWVsZFxuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLmF1dG9jb21wbGV0ZSh7XG5cdFx0XHQgICAgc2VydmljZVVybDogJy9wcm9maWxlL3N0dWRlbnRmZWVkJyxcblx0XHRcdCAgICBhamF4U2V0dGluZ3M6IHtcblx0XHRcdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdFx0XHQgICAgICAgICQoJyNzdHVkZW50aWR2YWwnKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcblx0XHRcdCAgICB9LFxuXHRcdFx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdCAgICAgICAgcmV0dXJuIHtcblx0XHRcdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHRcdFx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHRcdFx0ICAgICAgICAgICAgfSlcblx0XHRcdCAgICAgICAgfTtcblx0XHRcdCAgICB9XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI3N0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2VuZF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgXHRsaW5rRGF0ZVBpY2tlcnMoJyNzdGFydCcsICcjZW5kJywgJyNkdXJhdGlvbicpO1xuXG5cdFx0IFx0JCgnI2JzdGFydF9kYXRlcGlja2VyJykuZGF0ZXRpbWVwaWNrZXIoZXhwb3J0cy5kYXRlUGlja2VyRGF0YSk7XG5cblx0XHQgICQoJyNiZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI2JzdGFydCcsICcjYmVuZCcsICcjYmR1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnJlcGVhdHVudGlsX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRlT25seSk7XG5cblx0XHRcdC8vY2hhbmdlIHJlbmRlcmluZyBvZiBldmVudHNcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdFx0XHRlbGVtZW50LmFkZENsYXNzKFwiZmMtY2xpY2thYmxlXCIpO1xuXHRcdFx0fTtcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ20nKXtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkJykudmFsKGV2ZW50LnN0dWRlbnRuYW1lKTtcblx0XHRcdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdH1lbHNlIGlmIChldmVudC50eXBlID09ICdiJyl7XG5cdFx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7XG5cdFx0XHRcdFx0XHRldmVudDogZXZlbnRcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmKGV2ZW50LnJlcGVhdCA9PSAnMCcpe1xuXHRcdFx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRcdFx0ZW5kOiBlbmRcblx0XHRcdFx0fTtcblx0XHRcdFx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnc2hvdycpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly9iaW5kIG1vcmUgYnV0dG9uc1xuXHRcdFx0JCgnI2JyZXBlYXQnKS5jaGFuZ2UocmVwZWF0Q2hhbmdlKTtcblxuXHRcdFx0JCgnI3NhdmVCbGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVCbGFja291dCk7XG5cblx0XHRcdCQoJyNibGFja291dFNlcmllcycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdFx0YmxhY2tvdXRTZXJpZXMoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYmxhY2tvdXRPY2N1cnJlbmNlJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dE9jY3VycmVuY2UoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjYWR2aXNpbmdCdXR0b24nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub2ZmKCdoaWRkZW4uYnMubW9kYWwnKTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVNZWV0aW5nQnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVNZWV0aW5nRm9ybSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dEJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZUJsYWNrb3V0Rm9ybSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dEJ0bicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0ZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHR9KTtcblxuXG5cdFx0XHQkKCcjcmVzb2x2ZUJ1dHRvbicpLm9uKCdjbGljaycsIHJlc29sdmVDb25mbGljdHMpO1xuXG5cdFx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cblx0XHQvL0lmIHRoZSBjdXJyZW50IHVzZXIgaXMgbm90IGFuIGFkdmlzb3IsIGJpbmQgbGVzcyBkYXRhXG5cdFx0fWVsc2V7XG5cblx0XHRcdC8vR2V0IHRoZSBjdXJyZW50IHN0dWRlbnQncyBuYW1lXG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUgPSAkKCcjY2FsZW5kYXJTdHVkZW50TmFtZScpLnZhbCgpLnRyaW0oKTtcblxuXHRcdCAgLy9SZW5kZXIgYmxhY2tvdXRzIHRvIGJhY2tncm91bmRcblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG5cblx0XHQgIC8vV2hlbiByZW5kZXJpbmcsIHVzZSB0aGlzIGN1c3RvbSBmdW5jdGlvbiBmb3IgYmxhY2tvdXRzIGFuZCBzdHVkZW50IG1lZXRpbmdzXG5cdFx0ICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0XHQgICAgaWYoZXZlbnQudHlwZSA9PSAnYicpe1xuXHRcdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0XHQgICAgfVxuXHRcdCAgICBpZihldmVudC50eXBlID09ICdzJyl7XG5cdFx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHRcdCAgICB9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1VzZSB0aGlzIG1ldGhvZCBmb3IgY2xpY2tpbmcgb24gbWVldGluZ3Ncblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50Q2xpY2sgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgdmlldyl7XG5cdFx0XHRcdGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHRcdFx0XHRpZihldmVudC5zdGFydC5pc0FmdGVyKG1vbWVudCgpKSl7XG5cdFx0XHRcdFx0XHRzaG93TWVldGluZ0Zvcm0oZXZlbnQpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoXCJZb3UgY2Fubm90IGVkaXQgbWVldGluZ3MgaW4gdGhlIHBhc3RcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0ICAvL1doZW4gc2VsZWN0aW5nIG5ldyBhcmVhcywgdXNlIHRoZSBzdHVkZW50U2VsZWN0IG1ldGhvZCBpbiB0aGUgY2FsZW5kYXIgbGlicmFyeVxuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0ID0gc3R1ZGVudFNlbGVjdDtcblxuXHRcdFx0Ly9XaGVuIHRoZSBjcmVhdGUgZXZlbnQgYnV0dG9uIGlzIGNsaWNrZWQsIHNob3cgdGhlIG1vZGFsIGZvcm1cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCgnI2Rlc2MnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoXCIjc3RhcnRcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKFwiI2VuZFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNlbmRfc3BhblwiKS5hZGRDbGFzcygnZGF0ZXBpY2tlci1kaXNhYmxlZCcpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZGRpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdGF0dXNkaXYnKS5oaWRlKCk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnLm1vZGFsJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cdFx0fVxuXG5cdFx0Ly9CaW5kIGNsaWNrIGhhbmRsZXJzIG9uIHRoZSBmb3JtXG5cdFx0JCgnI3NhdmVCdXR0b24nKS5iaW5kKCdjbGljaycsIHNhdmVNZWV0aW5nKTtcblx0XHQkKCcjZGVsZXRlQnV0dG9uJykuYmluZCgnY2xpY2snLCBkZWxldGVNZWV0aW5nKTtcblx0XHQkKCcjZHVyYXRpb24nKS5vbignY2hhbmdlJywgY2hhbmdlRHVyYXRpb24pO1xuXG5cdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMgd2l0aCBubyBiaW5kaW5nXG5cdH1lbHNle1xuXHRcdC8vZm9yIHJlYWQtb25seSBjYWxlbmRhcnMsIHNldCByZW5kZXJpbmcgdG8gYmFja2dyb3VuZFxuXHRcdGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50U291cmNlc1sxXS5yZW5kZXJpbmcgPSAnYmFja2dyb3VuZCc7XG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXG4gICAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdCAgICAgICAgZWxlbWVudC5hcHBlbmQoXCI8ZGl2IHN0eWxlPVxcXCJjb2xvcjogIzAwMDAwMDsgei1pbmRleDogNTtcXFwiPlwiICsgZXZlbnQudGl0bGUgKyBcIjwvZGl2PlwiKTtcblx0ICAgIH1cblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0ICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhcImZjLWdyZWVuXCIpO1xuXHQgICAgfVxuXHRcdH07XG5cdH1cblxuXHQvL2luaXRhbGl6ZSB0aGUgY2FsZW5kYXIhXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcihleHBvcnRzLmNhbGVuZGFyRGF0YSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgY2FsZW5kYXIgYnkgY2xvc2luZyBtb2RhbHMgYW5kIHJlbG9hZGluZyBkYXRhXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGZvcm0gdG8gaGlkZSAoYW5kIHRoZSBzcGluKVxuICogQHBhcmFtIHJlcG9uc2UgLSB0aGUgQXhpb3MgcmVwc29uc2Ugb2JqZWN0IHJlY2VpdmVkXG4gKi9cbnZhciByZXNldENhbGVuZGFyID0gZnVuY3Rpb24oZWxlbWVudCwgcmVzcG9uc2Upe1xuXHQvL2hpZGUgdGhlIGZvcm1cblx0JChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vZGlzcGxheSB0aGUgbWVzc2FnZSB0byB0aGUgdXNlclxuXHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblxuXHQvL3JlZnJlc2ggdGhlIGNhbGVuZGFyXG5cdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCdyZWZldGNoRXZlbnRzJyk7XG5cdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdGlmKHdpbmRvdy5hZHZpc29yKXtcblx0XHRsb2FkQ29uZmxpY3RzKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBSkFYIG1ldGhvZCB0byBzYXZlIGRhdGEgZnJvbSBhIGZvcm1cbiAqXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIG9iamVjdCB0byBzZW5kXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBzb3VyY2UgZWxlbWVudCBvZiB0aGUgZGF0YVxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFNhdmUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGVsZW1lbnQsIGFjdGlvbil7XG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdCAgLy9pZiByZXNwb25zZSBpcyAyeHhcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHR9KVxuXHRcdC8vaWYgcmVzcG9uc2UgaXMgbm90IDJ4eFxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgZWxlbWVudCwgZXJyb3IpO1xuXHRcdH0pO1xufVxuXG52YXIgYWpheERlbGV0ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uLCBub1Jlc2V0LCBub0Nob2ljZSl7XG5cdC8vY2hlY2sgbm9SZXNldCB2YXJpYWJsZVxuXHRub1Jlc2V0IHx8IChub1Jlc2V0ID0gZmFsc2UpO1xuXHRub0Nob2ljZSB8fCAobm9DaG9pY2UgPSBmYWxzZSk7XG5cblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGNvbmZpcm1hdGlvblxuXHRpZighbm9DaG9pY2Upe1xuXHRcdHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0fWVsc2V7XG5cdFx0dmFyIGNob2ljZSA9IHRydWU7XG5cdH1cblxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXG5cdFx0Ly9pZiBjb25maXJtZWQsIHNob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoZWxlbWVudCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9tYWtlIEFKQVggcmVxdWVzdCB0byBkZWxldGVcblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKG5vUmVzZXQpe1xuXHRcdFx0XHRcdC8vaGlkZSBwYXJlbnQgZWxlbWVudCAtIFRPRE8gVEVTVE1FXG5cdFx0XHRcdFx0Ly9jYWxsZXIucGFyZW50KCkucGFyZW50KCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHRcdCQoZWxlbWVudCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyZXNldENhbGVuZGFyKGVsZW1lbnQsIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgYSBtZWV0aW5nXG4gKi9cbnZhciBzYXZlTWVldGluZyA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVFdmVudHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRzdGFydDogbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCBcIkxMTFwiKS5mb3JtYXQoKSxcblx0XHRlbmQ6IG1vbWVudCgkKCcjZW5kJykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdHRpdGxlOiAkKCcjdGl0bGUnKS52YWwoKSxcblx0XHRkZXNjOiAkKCcjZGVzYycpLnZhbCgpLFxuXHRcdHN0YXR1czogJCgnI3N0YXR1cycpLnZhbCgpXG5cdH07XG5cdGRhdGEuaWQgPSBleHBvcnRzLmNhbGVuZGFyQWR2aXNvcklEO1xuXHRpZigkKCcjbWVldGluZ0lEJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLm1lZXRpbmdpZCA9ICQoJyNtZWV0aW5nSUQnKS52YWwoKTtcblx0fVxuXHRpZigkKCcjc3R1ZGVudGlkdmFsJykudmFsKCkgPiAwKXtcblx0XHRkYXRhLnN0dWRlbnRpZCA9ICQoJyNzdHVkZW50aWR2YWwnKS52YWwoKTtcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9jcmVhdGVtZWV0aW5nJztcblxuXHQvL0FKQVggUE9TVCB0byBzZXJ2ZXJcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ3NhdmUgbWVldGluZycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZWxldGUgYSBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIHVybFxuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6ICQoJyNtZWV0aW5nSUQnKS52YWwoKVxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZW1lZXRpbmcnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI2NyZWF0ZUV2ZW50JywgJ2RlbGV0ZSBtZWV0aW5nJywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3B1bGF0ZSBhbmQgc2hvdyB0aGUgbWVldGluZyBmb3JtIGZvciBlZGl0aW5nXG4gKlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIGVkaXRcbiAqL1xudmFyIHNob3dNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGV2ZW50KXtcblx0JCgnI3RpdGxlJykudmFsKGV2ZW50LnRpdGxlKTtcblx0JCgnI3N0YXJ0JykudmFsKGV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNlbmQnKS52YWwoZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNkZXNjJykudmFsKGV2ZW50LmRlc2MpO1xuXHRkdXJhdGlvbk9wdGlvbnMoZXZlbnQuc3RhcnQsIGV2ZW50LmVuZCk7XG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoZXZlbnQuaWQpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKGV2ZW50LnN0dWRlbnRfaWQpO1xuXHQkKCcjc3RhdHVzJykudmFsKGV2ZW50LnN0YXR1cyk7XG5cdCQoJyNkZWxldGVCdXR0b24nKS5zaG93KCk7XG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGNyZWF0aW9uXG4gKlxuICogQHBhcmFtIGNhbGVuZGFyU3R1ZGVudE5hbWUgLSBzdHJpbmcgbmFtZSBvZiB0aGUgc3R1ZGVudFxuICovXG52YXIgY3JlYXRlTWVldGluZ0Zvcm0gPSBmdW5jdGlvbihjYWxlbmRhclN0dWRlbnROYW1lKXtcblxuXHQvL3BvcHVsYXRlIHRoZSB0aXRsZSBhdXRvbWF0aWNhbGx5IGZvciBhIHN0dWRlbnRcblx0aWYoY2FsZW5kYXJTdHVkZW50TmFtZSAhPT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjdGl0bGUnKS52YWwoY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1lbHNle1xuXHRcdCQoJyN0aXRsZScpLnZhbCgnJyk7XG5cdH1cblxuXHQvL1NldCBzdGFydCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI3N0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBlbmQgdGltZVxuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2VuZCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkuZm9ybWF0KCdMTEwnKSk7XG5cdH1lbHNle1xuXHRcdCQoJyNlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblxuXHQvL1NldCBkdXJhdGlvbiBvcHRpb25zXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuXHRcdGR1cmF0aW9uT3B0aW9ucyhtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKSwgbW9tZW50KCkuaG91cig4KS5taW51dGUoMjApKTtcblx0fWVsc2V7XG5cdFx0ZHVyYXRpb25PcHRpb25zKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LCBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQpO1xuXHR9XG5cblx0Ly9SZXNldCBvdGhlciBvcHRpb25zXG5cdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHQkKCcjc3R1ZGVudGlkdmFsJykudmFsKC0xKTtcblxuXHQvL0hpZGUgZGVsZXRlIGJ1dHRvblxuXHQkKCcjZGVsZXRlQnV0dG9uJykuaGlkZSgpO1xuXG5cdC8vU2hvdyB0aGUgbW9kYWwgZm9ybVxuXHQkKCcjY3JlYXRlRXZlbnQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmb3JtIG9uIHRoaXMgcGFnZVxuICovXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgJCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2V0IGR1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBtZWV0aW5nIGZvcm1cbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lXG4gKiBAcGFyYW0gZW5kIC0gYSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kaW5nIHRpbWVcbiAqL1xudmFyIGR1cmF0aW9uT3B0aW9ucyA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuXHQvL2NsZWFyIHRoZSBsaXN0XG5cdCQoJyNkdXJhdGlvbicpLmVtcHR5KCk7XG5cblx0Ly9hc3N1bWUgYWxsIG1lZXRpbmdzIGhhdmUgcm9vbSBmb3IgMjAgbWludXRlc1xuXHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPScyMCc+MjAgbWludXRlczwvb3B0aW9uPlwiKTtcblxuXHQvL2lmIGl0IHN0YXJ0cyBvbiBvciBiZWZvcmUgNDoyMCwgYWxsb3cgNDAgbWludXRlcyBhcyBhbiBvcHRpb25cblx0aWYoc3RhcnQuaG91cigpIDwgMTYgfHwgKHN0YXJ0LmhvdXIoKSA9PSAxNiAmJiBzdGFydC5taW51dGVzKCkgPD0gMjApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc0MCc+NDAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjAwLCBhbGxvdyA2MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAwKSl7XG5cdFx0JCgnI2R1cmF0aW9uJykuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nNjAnPjYwIG1pbnV0ZXM8L29wdGlvbj5cIik7XG5cdH1cblxuXHQvL3NldCBkZWZhdWx0IHZhbHVlIGJhc2VkIG9uIGdpdmVuIHNwYW5cblx0JCgnI2R1cmF0aW9uJykudmFsKGVuZC5kaWZmKHN0YXJ0LCBcIm1pbnV0ZXNcIikpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsaW5rIHRoZSBkYXRlcGlja2VycyB0b2dldGhlclxuICpcbiAqIEBwYXJhbSBlbGVtMSAtIGpRdWVyeSBvYmplY3QgZm9yIGZpcnN0IGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBlbGVtMiAtIGpRdWVyeSBvYmplY3QgZm9yIHNlY29uZCBkYXRlcGlja2VyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBkdXJhdGlvbiBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgbGlua0RhdGVQaWNrZXJzID0gZnVuY3Rpb24oZWxlbTEsIGVsZW0yLCBkdXJhdGlvbil7XG5cdC8vYmluZCB0byBjaGFuZ2UgYWN0aW9uIG9uIGZpcnN0IGRhdGFwaWNrZXJcblx0JChlbGVtMSArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTIgPSBtb21lbnQoJChlbGVtMikudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNBZnRlcihkYXRlMikgfHwgZS5kYXRlLmlzU2FtZShkYXRlMikpe1xuXHRcdFx0ZGF0ZTIgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTIpLnZhbChkYXRlMi5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gc2Vjb25kIGRhdGVwaWNrZXJcblx0JChlbGVtMiArIFwiX2RhdGVwaWNrZXJcIikub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgZGF0ZTEgPSBtb21lbnQoJChlbGVtMSkudmFsKCksICdMTEwnKTtcblx0XHRpZihlLmRhdGUuaXNCZWZvcmUoZGF0ZTEpIHx8IGUuZGF0ZS5pc1NhbWUoZGF0ZTEpKXtcblx0XHRcdGRhdGUxID0gZS5kYXRlLmNsb25lKCk7XG5cdFx0XHQkKGVsZW0xKS52YWwoZGF0ZTEuZm9ybWF0KFwiTExMXCIpKTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBjaGFuZ2VEdXJhdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdHZhciBuZXdEYXRlID0gbW9tZW50KCQoJyNzdGFydCcpLnZhbCgpLCAnTExMJykuYWRkKCQodGhpcykudmFsKCksIFwibWludXRlc1wiKTtcblx0JCgnI2VuZCcpLnZhbChuZXdEYXRlLmZvcm1hdChcIkxMTFwiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHZlcmlmeSB0aGF0IHRoZSBzdHVkZW50cyBhcmUgc2VsZWN0aW5nIG1lZXRpbmdzIHRoYXQgYXJlbid0IHRvbyBsb25nXG4gKlxuICogQHBhcmFtIHN0YXJ0IC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IG9mIHRoZSBtZWV0aW5nXG4gKiBAcGFyYW0gZW5kIC0gbW9tZW50IG9iamVjdCBmb3IgdGhlIGVuZCBvZiB0aGUgbWVldGluZ1xuICovXG52YXIgc3R1ZGVudFNlbGVjdCA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcblxuXHQvL1doZW4gc3R1ZGVudHMgc2VsZWN0IGEgbWVldGluZywgZGlmZiB0aGUgc3RhcnQgYW5kIGVuZCB0aW1lc1xuXHRpZihlbmQuZGlmZihzdGFydCwgJ21pbnV0ZXMnKSA+IDYwKXtcblxuXHRcdC8vaWYgaW52YWxpZCwgdW5zZWxlY3QgYW5kIHNob3cgYW4gZXJyb3Jcblx0XHRhbGVydChcIk1lZXRpbmdzIGNhbm5vdCBsYXN0IGxvbmdlciB0aGFuIDEgaG91clwiKTtcblx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3Vuc2VsZWN0Jyk7XG5cdH1lbHNle1xuXG5cdFx0Ly9pZiB2YWxpZCwgc2V0IGRhdGEgaW4gdGhlIHNlc3Npb24gYW5kIHNob3cgdGhlIGZvcm1cblx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdGVuZDogZW5kXG5cdFx0fTtcblx0XHQkKCcjbWVldGluZ0lEJykudmFsKC0xKTtcblx0XHRjcmVhdGVNZWV0aW5nRm9ybShleHBvcnRzLmNhbGVuZGFyU3R1ZGVudE5hbWUpO1xuXHR9XG59O1xuXG4vKipcbiAqIExvYWQgY29uZmxpY3RpbmcgbWVldGluZ3MgZnJvbSB0aGUgc2VydmVyXG4gKi9cbnZhciBsb2FkQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblxuXHQvL3JlcXVlc3QgY29uZmxpY3RzIHZpYSBBSkFYXG5cdHdpbmRvdy5heGlvcy5nZXQoJy9hZHZpc2luZy9jb25mbGljdHMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0Ly9kaXNhYmxlIGV4aXN0aW5nIGNsaWNrIGhhbmRsZXJzXG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2NsaWNrJywgJy5yZXNvbHZlQ29uZmxpY3QnLCByZXNvbHZlQ29uZmxpY3QpO1xuXG5cdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDIwMCwgZGF0YSB3YXMgcmVjZWl2ZWRcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAyMDApe1xuXG5cdFx0XHRcdC8vQXBwZW5kIEhUTUwgZm9yIGNvbmZsaWN0cyB0byBET01cblx0XHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJykuZW1wdHkoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRcdFx0JCgnPGRpdi8+Jywge1xuXHRcdFx0XHRcdFx0J2lkJyA6ICdyZXNvbHZlJyt2YWx1ZS5pZCxcblx0XHRcdFx0XHRcdCdjbGFzcyc6ICdtZWV0aW5nLWNvbmZsaWN0Jyxcblx0XHRcdFx0XHRcdCdodG1sJzogXHQnPHA+Jm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBwdWxsLXJpZ2h0IGRlbGV0ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnJm5ic3A7PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgcHVsbC1yaWdodCBlZGl0Q29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5FZGl0PC9idXR0b24+ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0JzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzIHB1bGwtcmlnaHQgcmVzb2x2ZUNvbmZsaWN0XCIgZGF0YS1pZD0nK3ZhbHVlLmlkKyc+S2VlcCBNZWV0aW5nPC9idXR0b24+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPHNwYW4gaWQ9XCJyZXNvbHZlJyt2YWx1ZS5pZCsnc3BpblwiIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW4gZmEtbGcgcHVsbC1yaWdodCBoaWRlLXNwaW5cIj4mbmJzcDs8L3NwYW4+JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCc8Yj4nK3ZhbHVlLnRpdGxlKyc8L2I+ICgnK3ZhbHVlLnN0YXJ0KycpPC9wPjxocj4nXG5cdFx0XHRcdFx0XHR9KS5hcHBlbmRUbygnI3Jlc29sdmVDb25mbGljdE1lZXRpbmdzJyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vUmUtcmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnNcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5kZWxldGVDb25mbGljdCcsIGRlbGV0ZUNvbmZsaWN0KTtcblx0XHRcdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5lZGl0Q29uZmxpY3QnLCBlZGl0Q29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdFx0Ly9TaG93IHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuXHRcdCAgLy9JZiByZXNwb25zZSBpcyAyMDQsIG5vIGNvbmZsaWN0cyBhcmUgcHJlc2VudFxuXHRcdFx0fWVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwNCl7XG5cblx0XHRcdFx0Ly9IaWRlIHRoZSA8ZGl2PiBjb250YWluaW5nIGNvbmZsaWN0c1xuXHRcdFx0XHQkKCcjY29uZmxpY3RpbmdNZWV0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byByZXRyaWV2ZSBjb25mbGljdGluZyBtZWV0aW5nczogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBTYXZlIGJsYWNrb3V0cyBhbmQgYmxhY2tvdXQgZXZlbnRzXG4gKi9cbnZhciBzYXZlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vU2hvdyB0aGUgc3Bpbm5pbmcgc3RhdHVzIGljb24gd2hpbGUgd29ya2luZ1xuXHQkKCcjY3JlYXRlQmxhY2tvdXRzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vYnVpbGQgdGhlIGRhdGEgb2JqZWN0IGFuZCB1cmw7XG5cdHZhciBkYXRhID0ge1xuXHRcdGJzdGFydDogbW9tZW50KCQoJyNic3RhcnQnKS52YWwoKSwgJ0xMTCcpLmZvcm1hdCgpLFxuXHRcdGJlbmQ6IG1vbWVudCgkKCcjYmVuZCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YnRpdGxlOiAkKCcjYnRpdGxlJykudmFsKClcblx0fTtcblx0dmFyIHVybDtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvY3JlYXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YS5iYmxhY2tvdXRldmVudGlkID0gJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKTtcblx0fWVsc2V7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dCc7XG5cdFx0aWYoJCgnI2JibGFja291dGlkJykudmFsKCkgPiAwKXtcblx0XHRcdGRhdGEuYmJsYWNrb3V0aWQgPSAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKTtcblx0XHR9XG5cdFx0ZGF0YS5icmVwZWF0ID0gJCgnI2JyZXBlYXQnKS52YWwoKTtcblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDEpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnk9ICQoJyNicmVwZWF0ZGFpbHknKS52YWwoKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0XHRpZigkKCcjYnJlcGVhdCcpLnZhbCgpID09IDIpe1xuXHRcdFx0ZGF0YS5icmVwZWF0ZXZlcnkgPSAkKCcjYnJlcGVhdHdlZWtseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXNtID0gJCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3QgPSAkKCcjYnJlcGVhdHdlZWtkYXlzMicpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdyA9ICQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN1ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c2YgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHVudGlsID0gbW9tZW50KCQoJyNicmVwZWF0dW50aWwnKS52YWwoKSwgXCJNTS9ERC9ZWVlZXCIpLmZvcm1hdCgpO1xuXHRcdH1cblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheFNhdmUodXJsLCBkYXRhLCAnI2NyZWF0ZUJsYWNrb3V0JywgJ3NhdmUgYmxhY2tvdXQnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGJsYWNrb3V0IGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIGRlbGV0ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIFVSTCBhbmQgZGF0YSBvYmplY3Rcblx0dmFyIHVybCwgZGF0YTtcblx0aWYoJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSA+IDApe1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXRldmVudCc7XG5cdFx0ZGF0YSA9IHsgYmJsYWNrb3V0ZXZlbnRpZDogJCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoKSB9O1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2RlbGV0ZWJsYWNrb3V0Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRpZDogJCgnI2JibGFja291dGlkJykudmFsKCkgfTtcblx0fVxuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnZGVsZXRlIGJsYWNrb3V0JywgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgaGFuZGxpbmcgdGhlIGNoYW5nZSBvZiByZXBlYXQgb3B0aW9ucyBvbiB0aGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgcmVwZWF0Q2hhbmdlID0gZnVuY3Rpb24oKXtcblx0aWYoJCh0aGlzKS52YWwoKSA9PSAwKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5oaWRlKCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMSl7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9ZWxzZSBpZigkKHRoaXMpLnZhbCgpID09IDIpe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2Jykuc2hvdygpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLnNob3coKTtcblx0fVxufTtcblxuLyoqXG4gKiBTaG93IHRoZSByZXNvbHZlIGNvbmZsaWN0cyBtb2RhbCBmb3JtXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3RzID0gZnVuY3Rpb24oKXtcblx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBkZWxldGVDb25mbGljdCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0dmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHR2YXIgZGF0YSA9IHtcblx0XHRtZWV0aW5naWQ6IGlkXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0Ly9zZW5kIEFKQVggZGVsZXRlXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdkZWxldGUgbWVldGluZycsIHRydWUpO1xuXG59O1xuXG4vKipcbiAqIEVkaXQgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgZWRpdENvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9tZWV0aW5nJztcblxuXHQvL3Nob3cgc3Bpbm5lciB0byBsb2FkIG1lZXRpbmdcblx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdC8vbG9hZCBtZWV0aW5nIGFuZCBkaXNwbGF5IGZvcm1cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI3Jlc29sdmUnKyBpZCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRldmVudCA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRldmVudC5zdGFydCA9IG1vbWVudChldmVudC5zdGFydCk7XG5cdFx0XHRldmVudC5lbmQgPSBtb21lbnQoZXZlbnQuZW5kKTtcblx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgbWVldGluZycsICcjcmVzb2x2ZScgKyBpZCwgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBSZXNvbHZlIGEgY29uZmxpY3RpbmcgbWVldGluZ1xuICovXG52YXIgcmVzb2x2ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9yZXNvbHZlY29uZmxpY3QnO1xuXG5cdGFqYXhEZWxldGUodXJsLCBkYXRhLCAnI3Jlc29sdmUnICsgaWQsICdyZXNvbHZlIG1lZXRpbmcnLCB0cnVlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBjcmVhdGUgYmxhY2tvdXQgZm9ybVxuICovXG52YXIgY3JlYXRlQmxhY2tvdXRGb3JtID0gZnVuY3Rpb24oKXtcblx0JCgnI2J0aXRsZScpLnZhbChcIlwiKTtcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JzdGFydCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydC5mb3JtYXQoXCJMTExcIikpO1xuXHR9XG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQoKS5ob3VyKDkpLm1pbnV0ZSgwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0JCgnI2JibGFja291dGlkJykudmFsKC0xKTtcblx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0JCgnI2JyZXBlYXQnKS52YWwoMCk7XG5cdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLmhpZGUoKTtcblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gdG8gYSBzaW5nbGUgb2NjdXJyZW5jZVxuICovXG52YXIgYmxhY2tvdXRPY2N1cnJlbmNlID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9zZXQgZm9ybSB2YWx1ZXMgYW5kIGhpZGUgdW5uZWVkZWQgZmllbGRzXG5cdCQoJyNidGl0bGUnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQudGl0bGUpO1xuXHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNiZW5kJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmVuZC5mb3JtYXQoXCJMTExcIikpO1xuXHQkKCcjcmVwZWF0ZGl2JykuaGlkZSgpO1xuXHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0JCgnI2JibGFja291dGlkJykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmV2ZW50LmJsYWNrb3V0X2lkKTtcblx0JCgnI2JibGFja291dGV2ZW50aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuaWQpO1xuXHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cblx0Ly9zaG93IHRoZSBmb3JtXG5cdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxvYWQgYSBibGFja291dCBzZXJpZXMgZWRpdCBmb3JtXG4gKi9cbnZhciBibGFja291dFNlcmllcyA9IGZ1bmN0aW9uKCl7XG5cdC8vaGlkZSB0aGUgbW9kYWwgZm9ybVxuIFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgZGF0YSA9IHtcblx0XHRpZDogZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9ibGFja291dCc7XG5cblx0d2luZG93LmF4aW9zLmdldCh1cmwsIHtcblx0XHRcdHBhcmFtczogZGF0YVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0JCgnI2J0aXRsZScpLnZhbChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXHQgXHRcdCQoJyNic3RhcnQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuc3RhcnQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JlbmQnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEuZW5kLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTExMJykpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRpZCcpLnZhbChyZXNwb25zZS5kYXRhLmlkKTtcblx0IFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdCBcdFx0JCgnI3JlcGVhdGRpdicpLnNob3coKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnZhbChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlKTtcblx0IFx0XHQkKCcjYnJlcGVhdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHQgXHRcdGlmKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUgPT0gMSl7XG5cdCBcdFx0XHQkKCcjYnJlcGVhdGRhaWx5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9ZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAyKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2x5JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X2V2ZXJ5KTtcblx0XHRcdFx0dmFyIHJlcGVhdF9kZXRhaWwgPSBTdHJpbmcocmVzcG9uc2UuZGF0YS5yZXBlYXRfZGV0YWlsKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMxJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIxXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIyXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXMzJykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCIzXCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM0JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI0XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcsIChyZXBlYXRfZGV0YWlsLmluZGV4T2YoXCI1XCIpID49IDApKTtcblx0IFx0XHRcdCQoJyNicmVwZWF0dW50aWwnKS52YWwobW9tZW50KHJlc3BvbnNlLmRhdGEucmVwZWF0X3VudGlsLCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgnTU0vREQvWVlZWScpKTtcblx0IFx0XHR9XG5cdCBcdFx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuc2hvdygpO1xuXHQgXHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgYmxhY2tvdXQgc2VyaWVzJywgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IHN0dWRlbnQgaW4gdGhlIGRhdGFiYXNlXG4gKi9cbnZhciBuZXdTdHVkZW50ID0gZnVuY3Rpb24oKXtcblx0Ly9wcm9tcHQgdGhlIHVzZXIgZm9yIGFuIGVJRCB0byBhZGQgdG8gdGhlIHN5c3RlbVxuXHR2YXIgZWlkID0gcHJvbXB0KFwiRW50ZXIgdGhlIHN0dWRlbnQncyBlSURcIik7XG5cblx0Ly9idWlsZCB0aGUgVVJMIGFuZCBkYXRhXG5cdHZhciBkYXRhID0ge1xuXHRcdGVpZDogZWlkLFxuXHR9O1xuXHR2YXIgdXJsID0gJy9wcm9maWxlL25ld3N0dWRlbnQnO1xuXG5cdC8vc2VuZCBBSkFYIHBvc3Rcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHRcdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0XHRcdGlmKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PSA0MjIpe1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGFbXCJlaWRcIl0pO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRhbGVydChcIlVuYWJsZSB0byBjcmVhdGUgdXNlcjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvY2FsZW5kYXIuanMiLCJ3aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xudmFyIEVjaG8gPSByZXF1aXJlKCdsYXJhdmVsLWVjaG8nKTtcbnJlcXVpcmUoJ2lvbi1zb3VuZCcpO1xuXG53aW5kb3cuUHVzaGVyID0gcmVxdWlyZSgncHVzaGVyLWpzJyk7XG5cbi8qKlxuICogR3JvdXBzZXNzaW9uIGluaXQgZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgdG8gc3RhcnRcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2xvYWQgaW9uLXNvdW5kIGxpYnJhcnlcblx0aW9uLnNvdW5kKHtcbiAgICBzb3VuZHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJkb29yX2JlbGxcIlxuICAgICAgICB9LFxuICAgIF0sXG4gICAgdm9sdW1lOiAxLjAsXG4gICAgcGF0aDogXCIvc291bmRzL1wiLFxuICAgIHByZWxvYWQ6IHRydWVcblx0fSk7XG5cblx0Ly9nZXQgdXNlcklEIGFuZCBpc0Fkdmlzb3IgdmFyaWFibGVzXG5cdHdpbmRvdy51c2VySUQgPSBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpO1xuXG5cdC8vcmVnaXN0ZXIgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykub24oJ2NsaWNrJywgZ3JvdXBSZWdpc3RlckJ0bik7XG5cblx0Ly9kaXNhYmxlIGJ1dHRvbiBjbGlja1xuXHQkKCcjZ3JvdXBEaXNhYmxlQnRuJykub24oJ2NsaWNrJywgZ3JvdXBEaXNhYmxlQnRuKTtcblxuXHQvL3JlbmRlciBWdWUgQXBwXG5cdHdpbmRvdy52bSA9IG5ldyBWdWUoe1xuXHRcdGVsOiAnI2dyb3VwTGlzdCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0cXVldWU6IFtdLFxuXHRcdFx0YWR2aXNvcjogcGFyc2VJbnQoJCgnI2lzQWR2aXNvcicpLnZhbCgpKSA9PSAxLFxuXHRcdFx0dXNlcklEOiBwYXJzZUludCgkKCcjdXNlcklEJykudmFsKCkpLFxuXHRcdFx0b25saW5lOiBbXSxcblx0XHR9LFxuXHRcdG1ldGhvZHM6IHtcblx0XHRcdC8vRnVuY3Rpb24gdG8gZ2V0IENTUyBjbGFzc2VzIGZvciBhIHN0dWRlbnQgb2JqZWN0XG5cdFx0XHRnZXRDbGFzczogZnVuY3Rpb24ocyl7XG5cdFx0XHRcdHJldHVybntcblx0XHRcdFx0XHQnYWxlcnQtaW5mbyc6IHMuc3RhdHVzID09IDAgfHwgcy5zdGF0dXMgPT0gMSxcblx0XHRcdFx0XHQnYWxlcnQtc3VjY2Vzcyc6IHMuc3RhdHVzID09IDIsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1tZSc6IHMudXNlcmlkID09IHRoaXMudXNlcklELFxuXHRcdFx0XHRcdCdncm91cHNlc3Npb24tb2ZmbGluZSc6ICQuaW5BcnJheShzLnVzZXJpZCwgdGhpcy5vbmxpbmUpID09IC0xLFxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdC8vZnVuY3Rpb24gdG8gdGFrZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0dGFrZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi90YWtlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICd0YWtlJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIHB1dCBhIHN0dWRlbnQgYmFjayBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0XG5cdFx0XHRwdXRTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcHV0J1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdwdXQnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIGZ1bmN0aW9uIHRvIG1hcmsgYSBzdHVkZW50IGRvbmUgb24gdGhlIGxpc3Rcblx0XHRcdGRvbmVTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZG9uZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnbWFyayBkb25lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvL2Z1bmN0aW9uIHRvIGRlbGV0ZSBhIHN0dWRlbnQgZnJvbSB0aGUgbGlzdFxuXHRcdFx0ZGVsU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL2RlbGV0ZSdcblx0XHRcdFx0YWpheFBvc3QodXJsLCBkYXRhLCAnZGVsZXRlJyk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0pXG5cblxuXHQvL0VuYWJsZSBQdXNoZXIgbG9nZ2luZ1xuXHRpZih3aW5kb3cuZW52ID09IFwibG9jYWxcIiB8fCB3aW5kb3cuZW52ID09IFwic3RhZ2luZ1wiKXtcblx0XHRjb25zb2xlLmxvZyhcIlB1c2hlciBsb2dnaW5nIGVuYWJsZWQhXCIpO1xuXHRcdFB1c2hlci5sb2dUb0NvbnNvbGUgPSB0cnVlO1xuXHR9XG5cblx0Ly9Mb2FkIHRoZSBFY2hvIGluc3RhbmNlIG9uIHRoZSB3aW5kb3dcblx0d2luZG93LkVjaG8gPSBuZXcgRWNobyh7XG5cdFx0YnJvYWRjYXN0ZXI6ICdwdXNoZXInLFxuXHRcdGtleTogd2luZG93LnB1c2hlcktleSxcblx0XHRjbHVzdGVyOiB3aW5kb3cucHVzaGVyQ2x1c3Rlcixcblx0fSk7XG5cblx0Ly9CaW5kIHRvIHRoZSBjb25uZWN0ZWQgYWN0aW9uIG9uIFB1c2hlciAoY2FsbGVkIHdoZW4gY29ubmVjdGVkKVxuXHR3aW5kb3cuRWNoby5jb25uZWN0b3IucHVzaGVyLmNvbm5lY3Rpb24uYmluZCgnY29ubmVjdGVkJywgZnVuY3Rpb24oKXtcblx0XHQvL3doZW4gY29ubmVjdGVkLCBkaXNhYmxlIHRoZSBzcGlubmVyXG5cdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vTG9hZCB0aGUgaW5pdGlhbCBzdHVkZW50IHF1ZXVlIHZpYSBBSkFYXG5cdFx0d2luZG93LmF4aW9zLmdldCgnL2dyb3Vwc2Vzc2lvbi9xdWV1ZScpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZS5jb25jYXQocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdGNoZWNrQnV0dG9ucyh3aW5kb3cudm0ucXVldWUpO1xuXHRcdFx0XHRpbml0aWFsQ2hlY2tEaW5nKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdHdpbmRvdy52bS5xdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignZ2V0IHF1ZXVlJywgJycsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9KVxuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uIGNoYW5uZWxcblx0Lypcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25SZWdpc3RlcicsIChkYXRhKSA9PiB7XG5cblx0XHR9KTtcbiAqL1xuXG5cdC8vQ29ubmVjdCB0byB0aGUgZ3JvdXBzZXNzaW9uZW5kIGNoYW5uZWxcblx0d2luZG93LkVjaG8uY2hhbm5lbCgnZ3JvdXBzZXNzaW9uZW5kJylcblx0XHQubGlzdGVuKCdHcm91cHNlc3Npb25FbmQnLCAoZSkgPT4ge1xuXG5cdFx0XHQvL2lmIGVuZGluZywgcmVkaXJlY3QgYmFjayB0byBob21lIHBhZ2Vcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvZ3JvdXBzZXNzaW9uXCI7XG5cdH0pO1xuXG5cdHdpbmRvdy5FY2hvLmpvaW4oJ3ByZXNlbmNlJylcblx0XHQuaGVyZSgodXNlcnMpID0+IHtcblx0XHRcdHZhciBsZW4gPSB1c2Vycy5sZW5ndGg7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHR3aW5kb3cudm0ub25saW5lLnB1c2godXNlcnNbaV0uaWQpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmpvaW5pbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2VyLmlkKTtcblx0XHR9KVxuXHRcdC5sZWF2aW5nKCh1c2VyKSA9PiB7XG5cdFx0XHR3aW5kb3cudm0ub25saW5lLnNwbGljZSggJC5pbkFycmF5KHVzZXIuaWQsIHdpbmRvdy52bS5vbmxpbmUpLCAxKTtcblx0XHR9KVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblx0XHRcdHZhciBxdWV1ZSA9IHdpbmRvdy52bS5xdWV1ZTtcblx0XHRcdHZhciBmb3VuZCA9IGZhbHNlO1xuXHRcdFx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblxuXHRcdFx0Ly91cGRhdGUgdGhlIHF1ZXVlIGJhc2VkIG9uIHJlc3BvbnNlXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRpZihxdWV1ZVtpXS5pZCA9PT0gZGF0YS5pZCl7XG5cdFx0XHRcdFx0aWYoZGF0YS5zdGF0dXMgPCAzKXtcblx0XHRcdFx0XHRcdHF1ZXVlW2ldID0gZGF0YTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHF1ZXVlLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHRcdGxlbi0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9pZiBlbGVtZW50IG5vdCBmb3VuZCBvbiBjdXJyZW50IHF1ZXVlLCBwdXNoIGl0IG9uIHRvIHRoZSBxdWV1ZVxuXHRcdFx0aWYoIWZvdW5kKXtcblx0XHRcdFx0cXVldWUucHVzaChkYXRhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9jaGVjayB0byBzZWUgaWYgY3VycmVudCB1c2VyIGlzIG9uIHF1ZXVlIGJlZm9yZSBlbmFibGluZyBidXR0b25cblx0XHRcdGNoZWNrQnV0dG9ucyhxdWV1ZSk7XG5cblx0XHRcdC8vaWYgY3VycmVudCB1c2VyIGlzIGZvdW5kLCBjaGVjayBmb3Igc3RhdHVzIHVwZGF0ZSB0byBwbGF5IHNvdW5kXG5cdFx0XHRpZihkYXRhLnVzZXJpZCA9PT0gdXNlcklEKXtcblx0XHRcdFx0Y2hlY2tEaW5nKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NvcnQgdGhlIHF1ZXVlIGNvcnJlY3RseVxuXHRcdFx0cXVldWUuc29ydChzb3J0RnVuY3Rpb24pO1xuXG5cdFx0XHQvL3VwZGF0ZSBWdWUgc3RhdGUsIG1pZ2h0IGJlIHVubmVjZXNzYXJ5XG5cdFx0XHR3aW5kb3cudm0ucXVldWUgPSBxdWV1ZTtcblx0XHR9KTtcblxufTtcblxuXG4vKipcbiAqIFZ1ZSBmaWx0ZXIgZm9yIHN0YXR1cyB0ZXh0XG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgc3R1ZGVudCB0byByZW5kZXJcbiAqL1xuVnVlLmZpbHRlcignc3RhdHVzdGV4dCcsIGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMCkgcmV0dXJuIFwiTkVXXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAxKSByZXR1cm4gXCJRVUVVRURcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDIpIHJldHVybiBcIk1FRVQgV0lUSCBcIiArIGRhdGEuYWR2aXNvcjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDMpIHJldHVybiBcIkRFTEFZXCI7XG5cdGlmKGRhdGEuc3RhdHVzID09PSA0KSByZXR1cm4gXCJBQlNFTlRcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDUpIHJldHVybiBcIkRPTkVcIjtcbn0pO1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBjbGlja2luZyBvbiB0aGUgcmVnaXN0ZXIgYnV0dG9uXG4gKi9cbnZhciBncm91cFJlZ2lzdGVyQnRuID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3Vwc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vcmVnaXN0ZXInO1xuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIHt9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0ZGlzYWJsZUJ1dHRvbigpO1xuXHRcdFx0JCgnI2dyb3Vwc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZWdpc3RlcicsICcjZ3JvdXAnLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBhZHZpc29ycyB0byBkaXNhYmxlIGdyb3Vwc2Vzc2lvblxuICovXG52YXIgZ3JvdXBEaXNhYmxlQnRuID0gZnVuY3Rpb24oKXtcblx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuXHRcdHZhciByZWFsbHkgPSBjb25maXJtKFwiU2VyaW91c2x5LCB0aGlzIHdpbGwgbG9zZSBhbGwgY3VycmVudCBkYXRhLiBBcmUgeW91IHJlYWxseSBzdXJlP1wiKTtcblx0XHRpZihyZWFsbHkgPT09IHRydWUpe1xuXHRcdFx0Ly90aGlzIGlzIGEgYml0IGhhY2t5LCBidXQgaXQgd29ya3Ncblx0XHRcdHZhciB0b2tlbiA9ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jyk7XG5cdFx0XHQkKCc8Zm9ybSBhY3Rpb249XCIvZ3JvdXBzZXNzaW9uL2Rpc2FibGVcIiBtZXRob2Q9XCJQT1NUXCIvPicpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRcIiB2YWx1ZT1cIicgKyB3aW5kb3cudXNlcklEICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJyArIHRva2VuICsgJ1wiPicpKVxuXHRcdFx0XHQuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSkgLy9pdCBoYXMgdG8gYmUgYWRkZWQgc29tZXdoZXJlIGludG8gdGhlIDxib2R5PlxuXHRcdFx0XHQuc3VibWl0KCk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZW5hYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGVuYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkaXNhYmxlIHJlZ2lzdHJhdGlvbiBidXR0b25cbiAqL1xudmFyIGRpc2FibGVCdXR0b24gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBSZWdpc3RlckJ0bicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgYW5kIHNlZSBpZiB1c2VyIGlzIG9uIHRoZSBsaXN0IC0gaWYgbm90LCBkb24ndCBlbmFibGUgYnV0dG9uXG4gKi9cbnZhciBjaGVja0J1dHRvbnMgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdHZhciBmb3VuZE1lID0gZmFsc2U7XG5cblx0Ly9pdGVyYXRlIHRocm91Z2ggdXNlcnMgb24gbGlzdCwgbG9va2luZyBmb3IgY3VycmVudCB1c2VyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGZvdW5kTWUgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly9pZiBmb3VuZCwgZGlzYWJsZSBidXR0b247IGlmIG5vdCwgZW5hYmxlIGJ1dHRvblxuXHRpZihmb3VuZE1lKXtcblx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdH1lbHNle1xuXHRcdGVuYWJsZUJ1dHRvbigpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYmVja29uZWQsIGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBwZXJzb24gLSB0aGUgY3VycmVudCB1c2VyIHRvIGNoZWNrXG4gKi9cbnZhciBjaGVja0RpbmcgPSBmdW5jdGlvbihwZXJzb24pe1xuXHRpZihwZXJzb24uc3RhdHVzID09IDIpe1xuXHRcdGlvbi5zb3VuZC5wbGF5KFwiZG9vcl9iZWxsXCIpO1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBlcnNvbiBoYXMgYmVlbiBiZWNrb25lZCBvbiBsb2FkOyBpZiBzbywgcGxheSBzb3VuZCFcbiAqXG4gKiBAcGFyYW0gcXVldWUgLSB0aGUgaW5pdGlhbCBxdWV1ZSBvZiB1c2VycyBsb2FkZWRcbiAqL1xudmFyIGluaXRpYWxDaGVja0RpbmcgPSBmdW5jdGlvbihxdWV1ZSl7XG5cdHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0aWYocXVldWVbaV0udXNlcmlkID09PSB3aW5kb3cudXNlcklEKXtcblx0XHRcdGNoZWNrRGluZyhxdWV1ZVtpXSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBzdGF0dXNcbiAqXG4gKiBAcGFyYW0gYSAtIGZpcnN0IHBlcnNvblxuICogQHBhcmFtIGIgLSBzZWNvbmQgcGVyc29uXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RfbmFtZVxuICovXG52YXIgc29ydEZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYil7XG5cdGlmKGEuc3RhdHVzID09IGIuc3RhdHVzKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEuc3RhdHVzIDwgYi5zdGF0dXMgPyAxIDogLTEpO1xufVxuXG5cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgbWFraW5nIEFKQVggUE9TVCByZXF1ZXN0c1xuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBhY3Rpb24gLSB0aGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGFjdGlvblxuICovXG52YXIgYWpheFBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGFjdGlvbil7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKGFjdGlvbiwgJycsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdCQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZVByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Zmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcblx0XHRcdGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuXHRcdH07XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0Ly9zZW5kIEFKQVggcG9zdFxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG5cdFx0XHRcdCQoJyNwcm9maWxlc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVBZHZpc2luZ0J0bicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHQvL2JpbmQgY2xpY2sgaGFuZGxlciBmb3IgYWR2aXNvciBzYXZlIGJ1dHRvblxuXHQkKCcjc2F2ZUFkdmlzb3JQcm9maWxlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblxuXHRcdC8vc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JCgnI3Byb2ZpbGVzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9idWlsZCBkYXRhIGFuZCBVUkxcblx0XHQvL1RPRE8gVEVTVE1FXG5cdFx0dmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnZm9ybScpWzBdKTtcblx0XHRkYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJlbWFpbFwiLCAkKCcjZW1haWwnKS52YWwoKSk7XG5cdFx0ZGF0YS5hcHBlbmQoXCJvZmZpY2VcIiwgJCgnI29mZmljZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm5vdGVzXCIsICQoJyNub3RlcycpLnZhbCgpKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0ZGF0YS5hcHBlbmQoXCJwaWNcIiwgJCgnI3BpYycpWzBdLmZpbGVzWzBdKTtcblx0XHR9XG5cdFx0dmFyIHVybCA9ICcvcHJvZmlsZS91cGRhdGUnO1xuXG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMnKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdCQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdFx0JCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcignc2F2ZSBwcm9maWxlJywgJyNwcm9maWxlJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdC8vaHR0cDovL3d3dy5hYmVhdXRpZnVsc2l0ZS5uZXQvd2hpcHBpbmctZmlsZS1pbnB1dHMtaW50by1zaGFwZS13aXRoLWJvb3RzdHJhcC0zL1xuXHQkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5idG4tZmlsZSA6ZmlsZScsIGZ1bmN0aW9uKCkge1xuXHQgIHZhciBpbnB1dCA9ICQodGhpcyksXG5cdCAgICAgIG51bUZpbGVzID0gaW5wdXQuZ2V0KDApLmZpbGVzID8gaW5wdXQuZ2V0KDApLmZpbGVzLmxlbmd0aCA6IDEsXG5cdCAgICAgIGxhYmVsID0gaW5wdXQudmFsKCkucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoLy4qXFwvLywgJycpO1xuXHQgIGlucHV0LnRyaWdnZXIoJ2ZpbGVzZWxlY3QnLCBbbnVtRmlsZXMsIGxhYmVsXSk7XG5cdH0pO1xuXG5cdC8vYmluZCB0byBmaWxlc2VsZWN0IGJ1dHRvblxuICAkKCcuYnRuLWZpbGUgOmZpbGUnKS5vbignZmlsZXNlbGVjdCcsIGZ1bmN0aW9uKGV2ZW50LCBudW1GaWxlcywgbGFiZWwpIHtcblxuICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKS5wYXJlbnRzKCcuaW5wdXQtZ3JvdXAnKS5maW5kKCc6dGV4dCcpO1xuXHRcdFx0dmFyIGxvZyA9IG51bUZpbGVzID4gMSA/IG51bUZpbGVzICsgJyBmaWxlcyBzZWxlY3RlZCcgOiBsYWJlbDtcblxuICAgICAgaWYoaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgICBpZihsb2cpe1xuXHRcdFx0XHRcdFx0YWxlcnQobG9nKTtcblx0XHRcdFx0XHR9XG4gICAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvcHJvZmlsZS5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlbWVldGluZ1wiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9tZWV0aW5nc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL21lZXRpbmdlZGl0LmpzIiwiLy9sb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2FkbWluLWx0ZScpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQnKTtcbnJlcXVpcmUoJ2RhdGF0YWJsZXMubmV0LWJzJyk7XG5yZXF1aXJlKCdkZXZicmlkZ2UtYXV0b2NvbXBsZXRlJyk7XG5cbi8vb3B0aW9ucyBmb3IgZGF0YXRhYmxlc1xuZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zID0ge1xuICBcInBhZ2VMZW5ndGhcIjogNTAsXG4gIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxufVxuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uXG4gKiBtdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5IG9uIGFsbCBkYXRhdGFibGVzIHBhZ2VzXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBjdXN0b20gZGF0YXRhYmxlcyBvcHRpb25zXG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICBvcHRpb25zIHx8IChvcHRpb25zID0gZXhwb3J0cy5kYXRhVGFibGVPcHRpb25zKTtcbiAgJCgnI3RhYmxlJykuRGF0YVRhYmxlKG9wdGlvbnMpO1xuICBzaXRlLmNoZWNrTWVzc2FnZSgpO1xuXG4gICQoJyNhZG1pbmx0ZS10b2dnbGVtZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ3NpZGViYXItb3BlbicpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBpZCAtIHRoZSBpZCBvZiB0aGUgaXRlbSB0byBiZSBzYXZlLWRldlxuICogQHBhcmFtIGxvYWRwaWN0dXJlIC0gdHJ1ZSB0byByZWxvYWQgYSBwcm9maWxlIHBpY3R1cmVcbiAqL1xuZXhwb3J0cy5hamF4c2F2ZSA9IGZ1bmN0aW9uKGRhdGEsIHVybCwgaWQsIGxvYWRwaWN0dXJlKXtcbiAgbG9hZHBpY3R1cmUgfHwgKGxvYWRwaWN0dXJlID0gZmFsc2UpO1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJlc3BvbnNlLmRhdGEpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgICBpZihsb2FkcGljdHVyZSkgZXhwb3J0cy5sb2FkcGljdHVyZShpZCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gc2F2ZSB2aWEgQUpBWCBvbiBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSB0byBzYXZlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIHVybCB0byBzZW5kIGRhdGEgdG9cbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIG1vZGFsIGVsZW1lbnQgdG8gY2xvc2VcbiAqL1xuZXhwb3J0cy5hamF4bW9kYWxzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBlbGVtZW50KXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgJCgnI3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAkKCcjdGFibGUnKS5EYXRhVGFibGUoKS5hamF4LnJlbG9hZCgpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcjJywgZXJyb3IpXG4gICAgfSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIHBpY3R1cmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gaWQgLSB0aGUgdXNlciBJRCBvZiB0aGUgcGljdHVyZSB0byByZWxvYWRcbiAqL1xuZXhwb3J0cy5sb2FkcGljdHVyZSA9IGZ1bmN0aW9uKGlkKXtcbiAgd2luZG93LmF4aW9zLmdldCgnL3Byb2ZpbGUvcGljLycgKyBpZClcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKCcjcGljdGV4dCcpLnZhbChyZXNwb25zZS5kYXRhKTtcbiAgICAgICQoJyNwaWNpbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBwaWN0dXJlJywgJycsIGVycm9yKTtcbiAgICB9KVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvIGFmdGVyIGRlbGV0ZVxuICogQHBhcmFtIHNvZnQgLSBib29sZWFuIGlmIHRoaXMgaXMgYSBzb2Z0IGRlbGV0ZSBvciBub3RcbiAqL1xuZXhwb3J0cy5hamF4ZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgcmV0VXJsLCBzb2Z0ID0gZmFsc2Upe1xuICBpZihzb2Z0KXtcbiAgICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gIH1lbHNle1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIGFsbCByZWxhdGVkIHJlY29yZHMuIFlvdSBjYW5ub3QgdW5kbyB0aGlzIGFjdGlvbi5cIik7XG4gIH1cblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXRVcmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtIGZyb20gYSBtb2RhbCBmb3JtXG4gKlxuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0aGUgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbGRlbGV0ZSA9IGZ1bmN0aW9uIChkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICAgJChlbGVtZW50KS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAkKCcjdGFibGUnKS5EYXRhVGFibGUoKS5hamF4LnJlbG9hZCgpO1xuICAgICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdkZWxldGUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXN0b3JlIGEgc29mdC1kZWxldGVkIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBpdGVtIHRvIGJlIHJlc3RvcmVkXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoYXQgaW5mb3JtYXRpb24gdG9cbiAqIEBwYXJhbSByZXRVcmwgLSB0aGUgVVJMIHRvIHJldHVybiB0b1xuICovXG5leHBvcnRzLmFqYXhyZXN0b3JlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCByZXRVcmwpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG4gICAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCByZXRVcmwpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3Jlc3RvcmUnLCAnIycsIGVycm9yKVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhdXRvY29tcGxldGUgYSBmaWVsZFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSBJRCBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHJlcXVlc3QgZGF0YSBmcm9tXG4gKi9cbmV4cG9ydHMuYWpheGF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkLCB1cmwpe1xuICAkKCcjJyArIGlkICsgJ2F1dG8nKS5hdXRvY29tcGxldGUoe1xuXHQgICAgc2VydmljZVVybDogdXJsLFxuXHQgICAgYWpheFNldHRpbmdzOiB7XG5cdCAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuXHQgICAgfSxcbiAgICAgIG1pbkNoYXJzOiAzLFxuXHQgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG5cdCAgICAgICAgJCgnIycgKyBpZCkudmFsKHN1Z2dlc3Rpb24uZGF0YSk7XG4gICAgICAgICAgJCgnIycgKyBpZCArICd0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBzdWdnZXN0aW9uLmRhdGEgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChzdWdnZXN0aW9uLnZhbHVlLCAzMCkpO1xuXHQgICAgfSxcblx0ICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5tYXAocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oZGF0YUl0ZW0pIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBkYXRhSXRlbS52YWx1ZSwgZGF0YTogZGF0YUl0ZW0uZGF0YSB9O1xuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH07XG5cdCAgICB9XG5cdH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVibGFja291dFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ibGFja291dHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAvLyQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3c3R1ZGVudFwiPk5ldyBTdHVkZW50PC9hPicpO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVncm91cHNlc3Npb25cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZ3JvdXBzZXNzaW9uc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2dyb3Vwc2Vzc2lvbmVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIC8vbG9hZCBjdXN0b20gYnV0dG9uIG9uIHRoZSBkb21cbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdCgpO1xuXG4gIC8vYmluZCBzZXR0aW5ncyBidXR0b25zXG4gICQoJy5zZXR0aW5nc2J1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBrZXk6ICQodGhpcykuYXR0cignaWQnKSxcbiAgICB9O1xuICAgIHZhciB1cmwgPSAnL2FkbWluL3NhdmVzZXR0aW5nJztcblxuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9hZG1pbi9zZXR0aW5ncycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIC8vYmluZCBuZXcgc2V0dGluZyBidXR0b25cbiAgJCgnI25ld3NldHRpbmcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBjaG9pY2UgPSBwcm9tcHQoXCJFbnRlciBhIG5hbWUgZm9yIHRoZSBuZXcgc2V0dGluZzpcIik7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBrZXk6IGNob2ljZSxcbiAgICB9O1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9uZXdzZXR0aW5nXCJcblxuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgJy9hZG1pbi9zZXR0aW5ncycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2NyZWF0ZScsICcnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3NldHRpbmdzLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9kZWdyZWVwcm9ncmFtcmVxdWlyZW1lbnRzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnY3JlZGl0cyd9LFxuICAgIHsnZGF0YSc6ICdzZW1lc3Rlcid9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdub3Rlcyd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdFxcXCIgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV1cbiAgb3B0aW9ucy5vcmRlciA9IFtcbiAgICBbMywgXCJhc2NcIl0sXG4gICAgWzQsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IERlZ3JlZSBSZXF1aXJlbWVudDwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgb3JkZXJpbmc6ICQoJyNvcmRlcmluZycpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgaWYoJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICAgICAgICBkYXRhLmVsZWN0aXZlbGlzdF9pZCA9ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcmVxdWlyZW1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZWdyZWVyZXF1aXJlbWVudFwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5vbignc2hvd24uYnMubW9kYWwnLCBzaG93c2VsZWN0ZWQpO1xuXG4gICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL2RlZ3JlZXJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKCcjaWQnKS52YWwobWVzc2FnZS5kYXRhLmlkKTtcbiAgICAgICAgJCgnI3NlbWVzdGVyJykudmFsKG1lc3NhZ2UuZGF0YS5zZW1lc3Rlcik7XG4gICAgICAgICQoJyNvcmRlcmluZycpLnZhbChtZXNzYWdlLmRhdGEub3JkZXJpbmcpO1xuICAgICAgICAkKCcjY3JlZGl0cycpLnZhbChtZXNzYWdlLmRhdGEuY3JlZGl0cyk7XG4gICAgICAgICQoJyNub3RlcycpLnZhbChtZXNzYWdlLmRhdGEubm90ZXMpO1xuICAgICAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgICAgIGlmKG1lc3NhZ2UuZGF0YS50eXBlID09IFwiY291cnNlXCIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX25hbWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgfWVsc2UgaWYgKG1lc3NhZ2UuZGF0YS50eXBlID09IFwiZWxlY3RpdmVsaXN0XCIpe1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwobWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQgKyBcIikgXCIgKyBtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X25hbWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuaGlkZSgpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcjZGVsZXRlJykuc2hvdygpO1xuICAgICAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSByZXF1aXJlbWVudCcsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICB9KTtcblxuICAkKCdpbnB1dFtuYW1lPXJlcXVpcmVhYmxlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnL2VsZWN0aXZlbGlzdHMvZWxlY3RpdmVsaXN0ZmVlZCcpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ncmVxdWlyZWFibGUnXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI3NlbWVzdGVyJykudmFsKFwiXCIpO1xuICAkKCcjb3JkZXJpbmcnKS52YWwoXCJcIik7XG4gICQoJyNjcmVkaXRzJykudmFsKFwiXCIpO1xuICAkKCcjbm90ZXMnKS52YWwoXCJcIik7XG4gICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2VsZWN0aXZlbGlzdGNvdXJzZXMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdFxcXCIgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV1cbiAgb3B0aW9ucy5vcmRlciA9IFtcbiAgICBbMSwgXCJhc2NcIl0sXG4gIF07XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5BZGQgQ291cnNlPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGVsZWN0aXZlbGlzdF9pZDogJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpLFxuICAgICAgY291cnNlX3ByZWZpeDogJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyYW5nZSddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEuY291cnNlX21pbl9udW1iZXIgPSAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoKTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWluX251bWJlciA9ICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuY291cnNlX21heF9udW1iZXIgPSAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdlbGVjdGl2ZWxpc3Rjb3Vyc2UnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVjb3Vyc2UvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsc2F2ZShkYXRhLCB1cmwsICcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVjb3Vyc2VcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4bW9kYWxkZWxldGUoZGF0YSwgdXJsLCAnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5vbignc2hvd24uYnMubW9kYWwnLCBzaG93c2VsZWN0ZWQpO1xuXG4gICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNlbGVjdGl2ZWxpc3RfaWR2aWV3JykudmFsKCQoJyNlbGVjdGl2ZWxpc3RfaWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gIH0pO1xuXG4gICQoJyN0YWJsZScpLm9uKCdjbGljaycsICcuZWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciB1cmwgPSAnL2FkbWluL2VsZWN0aXZlY291cnNlLycgKyBpZDtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKCcjaWQnKS52YWwobWVzc2FnZS5kYXRhLmlkKTtcbiAgICAgICAgJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9wcmVmaXgpO1xuICAgICAgICAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9taW5fbnVtYmVyKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLmNvdXJzZV9tYXhfbnVtYmVyKXtcbiAgICAgICAgICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9tYXhfbnVtYmVyKTtcbiAgICAgICAgICAkKCcjcmFuZ2UyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLnNob3coKTtcbiAgICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAkKCcjY291cnNlX21heF9udW1iZXInKS52YWwoXCJcIik7XG4gICAgICAgICAgJCgnI3JhbmdlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcjZGVsZXRlJykuc2hvdygpO1xuICAgICAgICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgZWxlY3RpdmUgbGlzdCBjb3Vyc2UnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgICQoJ2lucHV0W25hbWU9cmFuZ2VdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyYW5nZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuc2hvdygpO1xuICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5oaWRlKCk7XG4gICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgJCgnI3NpbmdsZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfcHJlZml4JykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX21pbl9udW1iZXInKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChcIlwiKTtcbiAgJCgnI3JhbmdlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JhbmdlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICB2YXIgaWQgPSAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50cy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2VsZWN0aXZlbGlzdF9hYmJyJ30sXG4gICAgeydkYXRhJzogJ2NyZWRpdHMnfSxcbiAgICB7J2RhdGEnOiAnc2VtZXN0ZXInfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnbm90ZXMnfSxcbiAgICB7J2RhdGEnOiAnY2F0YWxvZ19jb3Vyc2UnfSxcbiAgICB7J2RhdGEnOiAnY29tcGxldGVkX2NvdXJzZSd9LFxuICAgIHsnZGF0YSc6ICdpZCd9LFxuICBdO1xuICBvcHRpb25zLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdFxcXCIgaHJlZj1cXFwiI1xcXCIgZGF0YS1pZD1cXFwiXCIgKyBkYXRhICsgXCJcXFwiIHJvbGU9XFxcImJ1dHRvblxcXCI+RWRpdDwvYT5cIjtcbiAgICAgICAgICAgIH1cbiAgfV07XG4gIG9wdGlvbnMub3JkZXIgPSBbXG4gICAgWzQsIFwiYXNjXCJdLFxuICAgIFs1LCBcImFzY1wiXSxcbiAgXTtcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPk5ldyBQbGFuIFJlcXVpcmVtZW50PC9hPicpO1xuXG4gIC8vYWRkZWQgZm9yIG5ldyBzZW1lc3RlcnMgdGFibGVcbiAgdmFyIG9wdGlvbnMyID0ge1xuICAgIFwicGFnZUxlbmd0aFwiOiA1MCxcbiAgICBcImxlbmd0aENoYW5nZVwiOiBmYWxzZSxcbiAgfVxuICBvcHRpb25zMi5kb20gPSAnPFwibmV3YnV0dG9uMlwiPmZydGlwJztcbiAgb3B0aW9uczIuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXJzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zMi5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMyLmNvbHVtbkRlZnMgPSBbe1xuICAgICAgICAgICAgXCJ0YXJnZXRzXCI6IC0xLFxuICAgICAgICAgICAgXCJkYXRhXCI6ICdpZCcsXG4gICAgICAgICAgICBcInJlbmRlclwiOiBmdW5jdGlvbihkYXRhLCB0eXBlLCByb3csIG1ldGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdHNlbVxcXCIgaHJlZj1cXFwiL2FkbWluL3BsYW5zL3BsYW5zZW1lc3Rlci9cIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XTtcbiAgb3B0aW9uczIub3JkZXIgPSBbXG4gICAgWzIsIFwiYXNjXCJdLFxuICBdO1xuICAkKCcjdGFibGVzZW0nKS5EYXRhVGFibGUob3B0aW9uczIpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uMlwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL3BsYW5zL25ld3BsYW5zZW1lc3Rlci8nICsgaWQgKyAnXCIgaWQ9XCJuZXcyXCI+TmV3IFNlbWVzdGVyPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICAgIHBsYW5faWQ6ICQoJyNwbGFuX2lkJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGlmKCQoJyNzZW1lc3Rlcl9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLnNlbWVzdGVyX2lkID0gJCgnI3NlbWVzdGVyX2lkJykudmFsKCk7XG4gICAgfVxuICAgIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICAgaWYoJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpID4gMCl7XG4gICAgICAgICAgICBkYXRhLmNvdXJzZV9uYW1lID0gJCgnI2NvdXJzZV9uYW1lJykudmFsKCk7XG4gICAgICAgICAgICBkYXRhLmVsZWN0aXZlbGlzdF9pZCA9ICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYoJCgnI2NvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmNvdXJzZV9pZCA9ICQoJyNjb3Vyc2VfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgpID4gMCl7XG4gICAgICBkYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCA9ICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3cGxhbnJlcXVpcmVtZW50JztcbiAgICB9ZWxzZXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL3BsYW5yZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNwbGFucmVxdWlyZW1lbnRmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFucmVxdWlyZW1lbnRcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4bW9kYWxkZWxldGUoZGF0YSwgdXJsLCAnI3BsYW5yZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5vbignc2hvd24uYnMubW9kYWwnLCBzaG93c2VsZWN0ZWQpO1xuXG4gICQoJyNwbGFucmVxdWlyZW1lbnRmb3JtJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cbiAgcmVzZXRGb3JtKCk7XG5cbiAgJCgnI25ldycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAgICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgIHZhciBwbGFuaWQgPSAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgIHdpbmRvdy5heGlvcy5nZXQoJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXJzLycgKyBwbGFuaWQpXG4gICAgICAudGhlbihmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgdmFyIGxpc3RpdGVtcyA9ICcnO1xuICAgICAgICAkLmVhY2gobWVzc2FnZS5kYXRhLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICBsaXN0aXRlbXMgKz0gJzxvcHRpb24gdmFsdWU9JyArIHZhbHVlLmlkICsgJz4nICsgdmFsdWUubmFtZSArJzwvb3B0aW9uPic7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKS5lbmQoKS5hcHBlbmQobGlzdGl0ZW1zKTtcbiAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykudmFsKHNlbWVzdGVyX2lkKTtcbiAgICAgICAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB3aW5kb3cuYXhpb3MuZ2V0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAkKCcjaWQnKS52YWwobWVzc2FnZS5kYXRhLmlkKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZGVncmVlcmVxdWlyZW1lbnRfaWQpO1xuICAgICAgICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgICAgIGlmKG1lc3NhZ2UuZGF0YS50eXBlID09IFwiY291cnNlXCIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX25hbWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgfWVsc2UgaWYgKG1lc3NhZ2UuZGF0YS50eXBlID09IFwiZWxlY3RpdmVsaXN0XCIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX25hbWUpO1xuICAgICAgICAgICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwobWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X25hbWUsIDMwKSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNjb3Vyc2VfaWQnKS52YWwobWVzc2FnZS5kYXRhLmNvdXJzZV9pZCk7XG4gICAgICAgICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQobWVzc2FnZS5kYXRhLmNhdGFsb2dfY291cnNlLCAzMCkpO1xuICAgICAgICAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQpO1xuICAgICAgICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KG1lc3NhZ2UuZGF0YS5jb21wbGV0ZWRfY291cnNlLCAzMCkpO1xuICAgICAgICAkKCcjZGVsZXRlJykuc2hvdygpO1xuXG4gICAgICAgIHZhciBzZW1lc3Rlcl9pZCA9IG1lc3NhZ2UuZGF0YS5zZW1lc3Rlcl9pZDtcblxuICAgICAgICAvL2xvYWQgc2VtZXN0ZXJzXG4gICAgICAgIHZhciBwbGFuaWQgPSAkKCcjcGxhbl9pZCcpLnZhbCgpO1xuICAgICAgICB3aW5kb3cuYXhpb3MuZ2V0KCcvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVycy8nICsgcGxhbmlkKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICAgICAgdmFyIGxpc3RpdGVtcyA9ICcnO1xuICAgICAgICAgICAgJC5lYWNoKG1lc3NhZ2UuZGF0YSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgICAgIGxpc3RpdGVtcyArPSAnPG9wdGlvbiB2YWx1ZT0nICsgdmFsdWUuaWQgKyAnPicgKyB2YWx1ZS5uYW1lICsnPC9vcHRpb24+JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJCgnI3NlbWVzdGVyX2lkJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCkuZW5kKCkuYXBwZW5kKGxpc3RpdGVtcyk7XG4gICAgICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS52YWwoc2VtZXN0ZXJfaWQpO1xuICAgICAgICAgICAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHNlbWVzdGVycycsICcnLCBlcnJvcik7XG4gICAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcmVxdWlyZW1lbnQnLCAnJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT1yZXF1aXJlYWJsZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnY291cnNlX2lkJywgJy9jb3Vyc2VzL2NvdXJzZWZlZWQnKTtcblxuICB2YXIgc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdjb21wbGV0ZWRjb3Vyc2VfaWQnLCAnL2NvbXBsZXRlZGNvdXJzZXMvY29tcGxldGVkY291cnNlZmVlZC8nICsgc3R1ZGVudF9pZCk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50X2lkJykudmFsKFwiXCIpO1xuICAkKCcjcGxhbl9pZHZpZXcnKS52YWwoJCgnI3BsYW5faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI2NvdXJzZV9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjY291cnNlX2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbChcIi0xXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkYXV0bycpLnZhbChcIlwiKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQgKDApIFwiKTtcbiAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbC5qcyIsInZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG53aW5kb3cuVnVlID0gcmVxdWlyZSgndnVlJyk7XG52YXIgZHJhZ2dhYmxlID0gcmVxdWlyZSgndnVlZHJhZ2dhYmxlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgd2luZG93LnZtID0gbmV3IFZ1ZSh7XG5cdFx0ZWw6ICcjZmxvd2NoYXJ0Jyxcblx0XHRkYXRhOiB7XG4gICAgICBzZW1lc3RlcnM6IFtdLFxuXHRcdH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgZWRpdFNlbWVzdGVyOiBlZGl0U2VtZXN0ZXIsXG4gICAgICBzYXZlU2VtZXN0ZXI6IHNhdmVTZW1lc3RlcixcbiAgICAgIGRlbGV0ZVNlbWVzdGVyOiBkZWxldGVTZW1lc3RlcixcbiAgICAgIGRyb3BTZW1lc3RlcjogZHJvcFNlbWVzdGVyLFxuICAgICAgZHJvcENvdXJzZTogZHJvcENvdXJzZSxcbiAgICAgIGVkaXRDb3Vyc2U6IGVkaXRDb3Vyc2UsXG4gICAgfSxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICBkcmFnZ2FibGUsXG4gICAgfSxcbiAgfSk7XG5cbiAgbG9hZERhdGEoKTtcblxuICAkKCcjcmVzZXQnKS5vbignY2xpY2snLCBsb2FkRGF0YSk7XG4gICQoJyNhZGQtc2VtJykub24oJ2NsaWNrJywgYWRkU2VtZXN0ZXIpO1xuXG4gICQoJyNzYXZlQ291cnNlJykub24oJ2NsaWNrJywgc2F2ZUNvdXJzZSk7XG4gICQoJyNkZWxldGVDb3Vyc2UnKS5vbignY2xpY2snLCBkZWxldGVDb3Vyc2UpO1xuXG4gIGFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG5cbiAgYWpheGF1dG9jb21wbGV0ZSgnY291cnNlX2lkJywgJy9jb3Vyc2VzL2NvdXJzZWZlZWQnKTtcblxuICB2YXIgc3R1ZGVudF9pZCA9ICQoJyNzdHVkZW50X2lkJykudmFsKCk7XG4gIGFqYXhhdXRvY29tcGxldGUoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsICcvY29tcGxldGVkY291cnNlcy9jb21wbGV0ZWRjb3Vyc2VmZWVkLycgKyBzdHVkZW50X2lkKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc29ydCBlbGVtZW50cyBiYXNlZCBvbiB0aGVpciBvcmRlcmluZ1xuICpcbiAqIEBwYXJhbSBhIC0gZmlyc3QgaXRlbVxuICogQHBhcmFtIGIgLSBzZWNvbmQgaXRlbVxuICogQHJldHVybiAtIHNvcnRpbmcgdmFsdWUgaW5kaWNhdGluZyB3aG8gc2hvdWxkIGdvIGZpcnN0XG4gKi9cbnZhciBzb3J0RnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKXtcblx0aWYoYS5vcmRlcmluZyA9PSBiLm9yZGVyaW5nKXtcblx0XHRyZXR1cm4gKGEuaWQgPCBiLmlkID8gLTEgOiAxKTtcblx0fVxuXHRyZXR1cm4gKGEub3JkZXJpbmcgPCBiLm9yZGVyaW5nID8gLTEgOiAxKTtcbn1cblxudmFyIGxvYWREYXRhID0gZnVuY3Rpb24oKXtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHdpbmRvdy5heGlvcy5nZXQoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQpXG4gIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICB3aW5kb3cudm0uc2VtZXN0ZXJzID0gcmVzcG9uc2UuZGF0YTtcbiAgICB3aW5kb3cudm0uc2VtZXN0ZXJzLnNvcnQoc29ydEZ1bmN0aW9uKTtcbiAgICAkKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClbMF0uc3R5bGUuc2V0UHJvcGVydHkoJy0tY29sTnVtJywgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGgpO1xuICAgIHdpbmRvdy5heGlvcy5nZXQoJy9mbG93Y2hhcnRzL2RhdGEvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQuZWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgICAgICB2YXIgc2VtZXN0ZXIgPSB3aW5kb3cudm0uc2VtZXN0ZXJzLmZpbmQoZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQuaWQgPT0gdmFsdWUuc2VtZXN0ZXJfaWQ7XG4gICAgICAgIH0pXG4gICAgICAgIHNlbWVzdGVyLmNvdXJzZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgICQuZWFjaCh3aW5kb3cudm0uc2VtZXN0ZXJzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgICAgICB2YWx1ZS5jb3Vyc2VzLnNvcnQoc29ydEZ1bmN0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBkYXRhJywgJycsIGVycm9yKTtcbiAgICB9KTtcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICBzaXRlLmhhbmRsZUVycm9yKCdnZXQgZGF0YScsICcnLCBlcnJvcik7XG4gIH0pO1xufVxuXG52YXIgZWRpdFNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgc2VtaWQgPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcbiAgJChcIiNzZW0tcGFuZWxlZGl0LVwiICsgc2VtaWQpLnNob3coKTtcbiAgJChcIiNzZW0tcGFuZWxoZWFkLVwiICsgc2VtaWQpLmhpZGUoKTtcbn1cblxudmFyIHNhdmVTZW1lc3RlciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHZhciBzZW1pZCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBpZDogc2VtaWQsXG4gICAgbmFtZTogJChcIiNzZW0tdGV4dC1cIiArIHNlbWlkKS52YWwoKVxuICB9XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9zYXZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuaGlkZSgpO1xuICAgICAgJChcIiNzZW0tcGFuZWxoZWFkLVwiICsgc2VtaWQpLnNob3coKTtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRlbGV0ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG4gICAgaWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICB2YXIgc2VtaWQgPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiBzZW1pZCxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9kZWxldGUnLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgaWYod2luZG93LnZtLnNlbWVzdGVyc1tpXS5pZCA9PSBzZW1pZCl7XG4gICAgICAgICAgICB3aW5kb3cudm0uc2VtZXN0ZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgICAgfSk7XG4gIH1cbn1cblxudmFyIGFkZFNlbWVzdGVyID0gZnVuY3Rpb24oKXtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHZhciBkYXRhID0ge1xuICB9O1xuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZCArICcvYWRkJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICB3aW5kb3cudm0uc2VtZXN0ZXJzLnB1c2gocmVzcG9uc2UuZGF0YSk7XG4gICAgICAvL1Z1ZS5zZXQod2luZG93LnZtLnNlbWVzdGVyc1t3aW5kb3cudm0uc2VtZXN0ZXIubGVuZ3RoIC0gMV0sICdjb3Vyc2VzJywgbmV3IEFycmF5KCkpO1xuICAgICAgJChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpWzBdLnN0eWxlLnNldFByb3BlcnR5KCctLWNvbE51bScsIHdpbmRvdy52bS5zZW1lc3RlcnMubGVuZ3RoKTtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkl0ZW0gU2F2ZWRcIiwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgIH0pXG59XG5cbnZhciBkcm9wU2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBvcmRlcmluZyA9IFtdO1xuICAkLmVhY2god2luZG93LnZtLnNlbWVzdGVycywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICBvcmRlcmluZy5wdXNoKHtcbiAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBkYXRhID0ge1xuICAgIG9yZGVyaW5nOiBvcmRlcmluZyxcbiAgfVxuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL21vdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRyb3BDb3Vyc2UgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBvcmRlcmluZyA9IFtdO1xuICB2YXIgdG9TZW1JbmRleCA9ICQoZXZlbnQudG8pLmRhdGEoJ2lkJyk7XG4gICQuZWFjaCh3aW5kb3cudm0uc2VtZXN0ZXJzW3RvU2VtSW5kZXhdLmNvdXJzZXMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgb3JkZXJpbmcucHVzaCh7XG4gICAgICBpZDogdmFsdWUuaWQsXG4gICAgfSk7XG4gIH0pO1xuICB2YXIgZGF0YSA9IHtcbiAgICBzZW1lc3Rlcl9pZDogd2luZG93LnZtLnNlbWVzdGVyc1t0b1NlbUluZGV4XS5pZCxcbiAgICBjb3Vyc2VfaWQ6ICQoZXZlbnQuaXRlbSkuZGF0YSgnaWQnKSxcbiAgICBvcmRlcmluZzogb3JkZXJpbmcsXG4gIH1cbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9kYXRhLycgKyBpZCArICcvbW92ZScsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZWRpdENvdXJzZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIGNvdXJzZUluZGV4ID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG4gIHZhciBzZW1JbmRleCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdzZW0nKTtcbiAgdmFyIGNvdXJzZSA9IHdpbmRvdy52bS5zZW1lc3RlcnNbc2VtSW5kZXhdLmNvdXJzZXNbY291cnNlSW5kZXhdO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoY291cnNlLm5hbWUpO1xuICAkKCcjY3JlZGl0cycpLnZhbChjb3Vyc2UuY3JlZGl0cyk7XG4gICQoJyNub3RlcycpLnZhbChjb3Vyc2Uubm90ZXMpO1xuICAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKGNvdXJzZS5pZCk7XG4gICQoJyNlbGVjdGxpdmVsaXN0X2lkJykudmFsKGNvdXJzZS5lbGVjdGl2ZWxpc3RfaWQpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuZWxlY3RpdmVsaXN0X2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmVsZWN0aXZlbGlzdF9uYW1lLCAzMCkpO1xuICAkKCcjY291cnNlX2lkJykudmFsKGNvdXJzZS5jb3Vyc2VfaWQpO1xuICAkKCcjY291cnNlX2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmNvdXJzZV9uYW1lLCAzMCkpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKGNvdXJzZS5jb21wbGV0ZWRjb3Vyc2VfaWQpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkYXV0bycpLnZhbCgnJyk7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBjb3Vyc2UuY29tcGxldGVkY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoY291cnNlLmNvbXBsZXRlZGNvdXJzZV9uYW1lLCAzMCkpO1xuICBpZihjb3Vyc2UuZGVncmVlcmVxdWlyZW1lbnRfaWQgPD0gMCl7XG4gICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgJCgnI2NyZWRpdHMnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICQoJyNkZWxldGVDb3Vyc2UnKS5zaG93KCk7XG4gIH1lbHNle1xuICAgIGlmKGNvdXJzZS5lbGVjdGl2ZWxpc3RfaWQgPD0gMCl7XG4gICAgICAkKCcjY291cnNlX25hbWUnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgIH1lbHNle1xuICAgICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgfVxuICAgICQoJyNjcmVkaXRzJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAkKCcjZWxlY3RpdmVsaXN0X2lkYXV0bycpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgJCgnI2RlbGV0ZUNvdXJzZScpLmhpZGUoKTtcbiAgfVxuXG4gICQoJyNlZGl0Q291cnNlJykubW9kYWwoJ3Nob3cnKTtcbn1cblxudmFyIHNhdmVDb3Vyc2UgPSBmdW5jdGlvbigpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gIHZhciBwbGFucmVxdWlyZW1lbnRfaWQgPSAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCk7XG4gIHZhciBkYXRhID0ge1xuICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgfVxuICBpZigkKCcjY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICBkYXRhLmNvdXJzZV9pZCA9ICQoJyNjb3Vyc2VfaWQnKS52YWwoKTtcbiAgfWVsc2V7XG4gICAgZGF0YS5jb3Vyc2VfaWQgPSAnJztcbiAgfVxuICBpZigkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICBkYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCA9ICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKTtcbiAgfWVsc2V7XG4gICAgZGF0YS5jb21wbGV0ZWRjb3Vyc2VfaWQgPSAnJztcbiAgfVxuICBpZigkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCkubGVuZ3RoID4gMCl7XG4gICAgZGF0YS5wbGFucmVxdWlyZW1lbnRfaWQgPSAkKCcjcGxhbnJlcXVpcmVtZW50X2lkJykudmFsKCk7XG4gIH1cbiAgaWYoISQoJyNjb3Vyc2VfbmFtZScpLmlzKCc6ZGlzYWJsZWQnKSl7XG4gICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICB9XG4gIGlmKCEkKCcjY3JlZGl0cycpLmlzKCc6ZGlzYWJsZWQnKSl7XG4gICAgZGF0YS5jcmVkaXRzID0gJCgnI2NyZWRpdHMnKS52YWwoKTtcbiAgfVxuICBpZighJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGlmKCQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5lbGVjdGl2ZWxpc3RfaWQgPSAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmVsZWN0aXZlbGlzdF9pZCA9ICcnO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL3NhdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNlZGl0Q291cnNlJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAgICAgbG9hZERhdGEoKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKFwic2F2ZSBjb3Vyc2VcIiwgXCIjZWRpdENvdXJzZVwiLCBlcnJvcik7XG4gICAgfSk7XG5cbn1cblxudmFyIGRlbGV0ZUNvdXJzZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgY29uc29sZS5sb2coJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJykpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkIChkdXBsaWNhdGVkIGZyb20gZGFzaGJvYXJkKVxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSBJRCBvZiB0aGUgZmllbGRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHJlcXVlc3QgZGF0YSBmcm9tXG4gKi9cbnZhciBhamF4YXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KHN1Z2dlc3Rpb24udmFsdWUsIDMwKSk7XG5cdCAgICB9LFxuXHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgfTtcblx0ICAgIH1cblx0fSk7XG5cbiAgJCgnIycgKyBpZCArICdjbGVhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgJCgnIycgKyBpZCkudmFsKDApO1xuICAgICQoJyMnICsgaWQgKyAndGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgMCArIFwiKSBcIik7XG4gIH0pXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Zsb3djaGFydC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0bGlzdC5qcyIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDIwOFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9zYXNzL2Zsb3djaGFydC5zY3NzXG4vLyBtb2R1bGUgaWQgPSAyMDlcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLyoqXG4gKiBEaXNwbGF5cyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmxhc2hlZCBzZXNzaW9uIGRhdGFcbiAqXG4gKiB1c2UgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCdtZXNzYWdlJywgdHJhbnMoJ21lc3NhZ2VzLml0ZW1fc2F2ZWQnKSk7XG4gKiAgICAgJHJlcXVlc3QtPnNlc3Npb24oKS0+cHV0KCd0eXBlJywgJ3N1Y2Nlc3MnKTtcbiAqIHRvIHNldCBtZXNzYWdlIHRleHQgYW5kIHR5cGVcbiAqL1xuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpe1xuXHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiamF2YXNjcmlwdE1lc3NhZ2VcIiBjbGFzcz1cImFsZXJ0IGZhZGUgaW4gYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtJyArIHR5cGUgKyAnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1sYWJlbD1cIkNsb3NlXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48L2J1dHRvbj48c3BhbiBjbGFzcz1cImg0XCI+JyArIG1lc3NhZ2UgKyAnPC9zcGFuPjwvZGl2Pic7XG5cdCQoJyNtZXNzYWdlJykuYXBwZW5kKGh0bWwpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdCQoXCIjamF2YXNjcmlwdE1lc3NhZ2VcIikuYWxlcnQoJ2Nsb3NlJyk7XG5cdH0sIDMwMDApO1xufTtcblxuLypcbmV4cG9ydHMuYWpheGNyc2YgPSBmdW5jdGlvbigpe1xuXHQkLmFqYXhTZXR1cCh7XG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50Jylcblx0XHR9XG5cdH0pO1xufTtcbiovXG5cbi8qKlxuICogQ2xlYXJzIGVycm9ycyBvbiBmb3JtcyBieSByZW1vdmluZyBlcnJvciBjbGFzc2VzXG4gKi9cbmV4cG9ydHMuY2xlYXJGb3JtRXJyb3JzID0gZnVuY3Rpb24oKXtcblx0JCgnLmZvcm0tZ3JvdXAnKS5lYWNoKGZ1bmN0aW9uICgpe1xuXHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQodGhpcykuZmluZCgnLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcblx0fSk7XG59XG5cbi8qKlxuICogU2V0cyBlcnJvcnMgb24gZm9ybXMgYmFzZWQgb24gcmVzcG9uc2UgSlNPTlxuICovXG5leHBvcnRzLnNldEZvcm1FcnJvcnMgPSBmdW5jdGlvbihqc29uKXtcblx0ZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMoKTtcblx0JC5lYWNoKGpzb24sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0JCgnIycgKyBrZXkpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXHRcdCQoJyMnICsga2V5ICsgJ2hlbHAnKS50ZXh0KHZhbHVlLmpvaW4oJyAnKSk7XG5cdH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBmb3IgbWVzc2FnZXMgaW4gdGhlIGZsYXNoIGRhdGEuIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgYnkgdGhlIHBhZ2VcbiAqL1xuZXhwb3J0cy5jaGVja01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKCcjbWVzc2FnZV9mbGFzaCcpLmxlbmd0aCl7XG5cdFx0dmFyIG1lc3NhZ2UgPSAkKCcjbWVzc2FnZV9mbGFzaCcpLnZhbCgpO1xuXHRcdHZhciB0eXBlID0gJCgnI21lc3NhZ2VfdHlwZV9mbGFzaCcpLnZhbCgpO1xuXHRcdGV4cG9ydHMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3JzIGZyb20gQUpBWFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gdGhlIG1lc3NhZ2UgdG8gZGlzcGxheSB0byB0aGUgdXNlclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgalF1ZXJ5IGlkZW50aWZpZXIgb2YgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBlcnJvciAtIHRoZSBBeGlvcyBlcnJvciByZWNlaXZlZFxuICovXG5leHBvcnRzLmhhbmRsZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgZWxlbWVudCwgZXJyb3Ipe1xuXHRpZihlcnJvci5yZXNwb25zZSl7XG5cdFx0Ly9JZiByZXNwb25zZSBpcyA0MjIsIGVycm9ycyB3ZXJlIHByb3ZpZGVkXG5cdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRleHBvcnRzLnNldEZvcm1FcnJvcnMoZXJyb3IucmVzcG9uc2UuZGF0YSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbGVydChcIlVuYWJsZSB0byBcIiArIG1lc3NhZ2UgKyBcIjogXCIgKyBlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvL2hpZGUgc3Bpbm5pbmcgaWNvblxuXHRpZihlbGVtZW50Lmxlbmd0aCA+IDApe1xuXHRcdCQoZWxlbWVudCArICdzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdHJ1bmNhdGUgdGV4dFxuICpcbiAqIEBwYXJhbSB0ZXh0IC0gdGhlIHRleHQgdG8gdHJ1bmNhdGVcbiAqIEBwYXJhbSBsZW5ndGggLSB0aGUgbWF4aW11bSBsZW5ndGhcbiAqXG4gKiBodHRwOi8vanNmaWRkbGUubmV0L3NjaGFkZWNrL0dwQ1pML1xuICovXG5leHBvcnRzLnRydW5jYXRlVGV4dCA9IGZ1bmN0aW9uKHRleHQsIGxlbmd0aCl7XG5cdGlmKHRleHQubGVuZ3RoID4gbGVuZ3RoKXtcblx0XHRyZXR1cm4gJC50cmltKHRleHQpLnN1YnN0cmluZygwLCBsZW5ndGgpLnNwbGl0KFwiIFwiKS5zbGljZSgwLCAtMSkuam9pbihcIiBcIikgKyBcIi4uLlwiO1xuXHR9ZWxzZXtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCIvKipcbiAqIEluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIGZvciBlZGl0YWJsZSB0ZXh0LWJveGVzIG9uIHRoZSBzaXRlXG4gKiBNdXN0IGJlIGNhbGxlZCBleHBsaWNpdGx5XG4gKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cbiAgLy9Mb2FkIHJlcXVpcmVkIGxpYnJhcmllc1xuICByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG4gIHJlcXVpcmUoJ3N1bW1lcm5vdGUnKTtcblxuICAvL1JlZ2lzdGVyIGNsaWNrIGhhbmRsZXJzIGZvciBbZWRpdF0gbGlua3NcbiAgJCgnLmVkaXRhYmxlLWxpbmsnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL2hpZGUgdGhlIFtlZGl0XSBsaW5rcywgZW5hYmxlIGVkaXRvciwgYW5kIHNob3cgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnNcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRvb2xiYXI6IFtcbiAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25zXV1cbiAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG4gICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgIFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuICAgICAgICBdLFxuICAgICAgICB0YWJzaXplOiAyLFxuICAgICAgICBjb2RlbWlycm9yOiB7XG4gICAgICAgICAgbW9kZTogJ3RleHQvaHRtbCcsXG4gICAgICAgICAgaHRtbE1vZGU6IHRydWUsXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICdtb25va2FpJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFNhdmUgYnV0dG9uc1xuICAkKCcuZWRpdGFibGUtc2F2ZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vRGlzcGxheSBzcGlubmVyIHdoaWxlIEFKQVggY2FsbCBpcyBwZXJmb3JtZWRcbiAgICAgICQoJyNlZGl0YWJsZXNwaW4tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cbiAgICAgIC8vR2V0IGNvbnRlbnRzIG9mIGVkaXRvclxuICAgICAgdmFyIGh0bWxTdHJpbmcgPSAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdjb2RlJyk7XG5cbiAgICAgIC8vUG9zdCBjb250ZW50cyB0byBzZXJ2ZXIsIHdhaXQgZm9yIHJlc3BvbnNlXG4gICAgICB3aW5kb3cuYXhpb3MucG9zdCgnL2VkaXRhYmxlL3NhdmUvJyArIGlkLCB7XG4gICAgICAgIGNvbnRlbnRzOiBodG1sU3RyaW5nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAvL0lmIHJlc3BvbnNlIDIwMCByZWNlaXZlZCwgYXNzdW1lIGl0IHNhdmVkIGFuZCByZWxvYWQgcGFnZVxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoXCJVbmFibGUgdG8gc2F2ZSBjb250ZW50OiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIENhbmNlbCBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1jYW5jZWwnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vZ2V0IElEIG9mIGl0ZW0gY2xpY2tlZFxuICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXG4gICAgICAvL1Jlc2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yIGFuZCBkZXN0cm95IGl0XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdyZXNldCcpO1xuICAgICAgJCgnI2VkaXRhYmxlLScgKyBpZCkuc3VtbWVybm90ZSgnZGVzdHJveScpO1xuXG4gICAgICAvL0hpZGUgU2F2ZSBhbmQgQ2FuY2VsIGJ1dHRvbnMsIGFuZCBzaG93IFtlZGl0XSBsaW5rXG4gICAgICAkKCcjZWRpdGFibGVidXR0b24tJyArIGlkKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcjZWRpdGFibGVzYXZlLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZWRpdGFibGUuanMiXSwic291cmNlUm9vdCI6IiJ9