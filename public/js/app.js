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
  $('#electivelist_idauto').val('');
  $('#electivelist_idtext').html("Selected: (" + course.electivelist_id + ") " + site.truncateText(course.electivelist_name, 30));
  $('#course_idauto').val('');
  $('#course_idtext').html("Selected: (" + course.course_id + ") " + site.truncateText(course.course_name, 30));
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
  if ($('#planrequirement_id').val().length > 0) {
    data.planrequirement_id = $('#planrequirement_id').val();
  }
  if ($('#course_id').val() > 0) {
    data.course_id = $('#course_id').val();
  }
  if ($('#completedcourse_id').val() > 0) {
    data.completedcourse_id = $('#completedcourse_id').val();
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
    }
  }
  window.axios.post('/flowcharts/data/' + id + '/save', data).then(function (response) {
    $('#editCourse').modal('hide');
    $('#spin').addClass('hide-spin');
    site.displayMessage(response.data, "success");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvYWR2aXNvcmVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2NvbXBsZXRlZGNvdXJzZWVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2dyb3Vwc2Vzc2lvbi5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL3Byb2ZpbGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9ibGFja291dGVkaXQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9kZWdyZWVwcm9ncmFtZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0bGlzdC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvYXBwLnNjc3M/NmQxMCIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvZmxvd2NoYXJ0LnNjc3MiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL3NpdGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9qcy91dGlsL2VkaXRhYmxlLmpzIl0sIm5hbWVzIjpbImRhc2hib2FyZCIsInJlcXVpcmUiLCJleHBvcnRzIiwiaW5pdCIsIm9wdGlvbnMiLCJkYXRhVGFibGVPcHRpb25zIiwiZG9tIiwiJCIsImh0bWwiLCJvbiIsImRhdGEiLCJmaXJzdF9uYW1lIiwidmFsIiwibGFzdF9uYW1lIiwiZW1haWwiLCJhZHZpc29yX2lkIiwiZGVwYXJ0bWVudF9pZCIsImlkIiwiZWlkIiwibGVuZ3RoIiwidXJsIiwiYWpheHNhdmUiLCJyZXRVcmwiLCJhamF4ZGVsZXRlIiwiYWpheHJlc3RvcmUiLCJzdW1tZXJub3RlIiwiZm9jdXMiLCJ0b29sYmFyIiwidGFic2l6ZSIsImNvZGVtaXJyb3IiLCJtb2RlIiwiaHRtbE1vZGUiLCJsaW5lTnVtYmVycyIsInRoZW1lIiwiZm9ybURhdGEiLCJGb3JtRGF0YSIsImFwcGVuZCIsImlzIiwiZmlsZXMiLCJkb2N1bWVudCIsImlucHV0IiwibnVtRmlsZXMiLCJnZXQiLCJsYWJlbCIsInJlcGxhY2UiLCJ0cmlnZ2VyIiwiZXZlbnQiLCJwYXJlbnRzIiwiZmluZCIsImxvZyIsImFsZXJ0IiwibmFtZSIsIm9mZmljZSIsInBob25lIiwiYWJicmV2aWF0aW9uIiwiZGVzY3JpcHRpb24iLCJlZmZlY3RpdmVfeWVhciIsImVmZmVjdGl2ZV9zZW1lc3RlciIsInN0YXJ0X3llYXIiLCJzdGFydF9zZW1lc3RlciIsImRlZ3JlZXByb2dyYW1faWQiLCJzdHVkZW50X2lkIiwiY2hvaWNlIiwiY29uZmlybSIsImFqYXhhdXRvY29tcGxldGUiLCJvcmRlcmluZyIsInBsYW5faWQiLCJjb3Vyc2VudW1iZXIiLCJ5ZWFyIiwic2VtZXN0ZXIiLCJiYXNpcyIsImdyYWRlIiwiY3JlZGl0cyIsInNlbGVjdGVkIiwic2VsZWN0ZWRWYWwiLCJ0cmFuc2ZlciIsImluY29taW5nX2luc3RpdHV0aW9uIiwiaW5jb21pbmdfbmFtZSIsImluY29taW5nX2Rlc2NyaXB0aW9uIiwiaW5jb21pbmdfc2VtZXN0ZXIiLCJpbmNvbWluZ19jcmVkaXRzIiwiaW5jb21pbmdfZ3JhZGUiLCJzaG93c2VsZWN0ZWQiLCJwcm9wIiwic2hvdyIsImhpZGUiLCJBcHAiLCJhY3Rpb25zIiwiUm9vdFJvdXRlQ29udHJvbGxlciIsImdldEluZGV4IiwiZWRpdGFibGUiLCJzaXRlIiwiY2hlY2tNZXNzYWdlIiwiZ2V0QWJvdXQiLCJBZHZpc2luZ0NvbnRyb2xsZXIiLCJjYWxlbmRhciIsIkdyb3Vwc2Vzc2lvbkNvbnRyb2xsZXIiLCJnZXRMaXN0IiwiZ3JvdXBzZXNzaW9uIiwiUHJvZmlsZXNDb250cm9sbGVyIiwicHJvZmlsZSIsIkRhc2hib2FyZENvbnRyb2xsZXIiLCJTdHVkZW50c0NvbnRyb2xsZXIiLCJnZXRTdHVkZW50cyIsInN0dWRlbnRlZGl0IiwiZ2V0TmV3c3R1ZGVudCIsIkFkdmlzb3JzQ29udHJvbGxlciIsImdldEFkdmlzb3JzIiwiYWR2aXNvcmVkaXQiLCJnZXROZXdhZHZpc29yIiwiRGVwYXJ0bWVudHNDb250cm9sbGVyIiwiZ2V0RGVwYXJ0bWVudHMiLCJkZXBhcnRtZW50ZWRpdCIsImdldE5ld2RlcGFydG1lbnQiLCJNZWV0aW5nc0NvbnRyb2xsZXIiLCJnZXRNZWV0aW5ncyIsIm1lZXRpbmdlZGl0IiwiQmxhY2tvdXRzQ29udHJvbGxlciIsImdldEJsYWNrb3V0cyIsImJsYWNrb3V0ZWRpdCIsIkdyb3Vwc2Vzc2lvbnNDb250cm9sbGVyIiwiZ2V0R3JvdXBzZXNzaW9ucyIsImdyb3Vwc2Vzc2lvbmVkaXQiLCJTZXR0aW5nc0NvbnRyb2xsZXIiLCJnZXRTZXR0aW5ncyIsInNldHRpbmdzIiwiRGVncmVlcHJvZ3JhbXNDb250cm9sbGVyIiwiZ2V0RGVncmVlcHJvZ3JhbXMiLCJkZWdyZWVwcm9ncmFtZWRpdCIsImdldERlZ3JlZXByb2dyYW1EZXRhaWwiLCJnZXROZXdkZWdyZWVwcm9ncmFtIiwiRWxlY3RpdmVsaXN0c0NvbnRyb2xsZXIiLCJnZXRFbGVjdGl2ZWxpc3RzIiwiZWxlY3RpdmVsaXN0ZWRpdCIsImdldEVsZWN0aXZlbGlzdERldGFpbCIsImdldE5ld2VsZWN0aXZlbGlzdCIsIlBsYW5zQ29udHJvbGxlciIsImdldFBsYW5zIiwicGxhbmVkaXQiLCJnZXRQbGFuRGV0YWlsIiwicGxhbmRldGFpbCIsImdldE5ld3BsYW4iLCJQbGFuc2VtZXN0ZXJzQ29udHJvbGxlciIsImdldFBsYW5TZW1lc3RlciIsInBsYW5zZW1lc3RlcmVkaXQiLCJnZXROZXdQbGFuU2VtZXN0ZXIiLCJDb21wbGV0ZWRjb3Vyc2VzQ29udHJvbGxlciIsImdldENvbXBsZXRlZGNvdXJzZXMiLCJjb21wbGV0ZWRjb3Vyc2VlZGl0IiwiZ2V0TmV3Y29tcGxldGVkY291cnNlIiwiRmxvd2NoYXJ0c0NvbnRyb2xsZXIiLCJnZXRGbG93Y2hhcnQiLCJmbG93Y2hhcnQiLCJjb250cm9sbGVyIiwiYWN0aW9uIiwid2luZG93IiwiXyIsImF4aW9zIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiY29tbW9uIiwidG9rZW4iLCJoZWFkIiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJtb21lbnQiLCJjYWxlbmRhclNlc3Npb24iLCJjYWxlbmRhckFkdmlzb3JJRCIsImNhbGVuZGFyU3R1ZGVudE5hbWUiLCJjYWxlbmRhckRhdGEiLCJoZWFkZXIiLCJsZWZ0IiwiY2VudGVyIiwicmlnaHQiLCJldmVudExpbWl0IiwiaGVpZ2h0Iiwid2Vla2VuZHMiLCJidXNpbmVzc0hvdXJzIiwic3RhcnQiLCJlbmQiLCJkb3ciLCJkZWZhdWx0VmlldyIsInZpZXdzIiwiYWdlbmRhIiwiYWxsRGF5U2xvdCIsInNsb3REdXJhdGlvbiIsIm1pblRpbWUiLCJtYXhUaW1lIiwiZXZlbnRTb3VyY2VzIiwidHlwZSIsImNvbG9yIiwidGV4dENvbG9yIiwic2VsZWN0YWJsZSIsInNlbGVjdEhlbHBlciIsInNlbGVjdE92ZXJsYXAiLCJyZW5kZXJpbmciLCJ0aW1lRm9ybWF0IiwiZGF0ZVBpY2tlckRhdGEiLCJkYXlzT2ZXZWVrRGlzYWJsZWQiLCJmb3JtYXQiLCJzdGVwcGluZyIsImVuYWJsZWRIb3VycyIsIm1heEhvdXIiLCJzaWRlQnlTaWRlIiwiaWdub3JlUmVhZG9ubHkiLCJhbGxvd0lucHV0VG9nZ2xlIiwiZGF0ZVBpY2tlckRhdGVPbmx5IiwiYWR2aXNvciIsIm5vYmluZCIsInRyaW0iLCJ3aWR0aCIsInJlbW92ZUNsYXNzIiwicmVzZXRGb3JtIiwiYmluZCIsIm5ld1N0dWRlbnQiLCJyZXNldCIsImVhY2giLCJ0ZXh0IiwibG9hZENvbmZsaWN0cyIsImZ1bGxDYWxlbmRhciIsImF1dG9jb21wbGV0ZSIsInNlcnZpY2VVcmwiLCJhamF4U2V0dGluZ3MiLCJkYXRhVHlwZSIsIm9uU2VsZWN0Iiwic3VnZ2VzdGlvbiIsInRyYW5zZm9ybVJlc3VsdCIsInJlc3BvbnNlIiwic3VnZ2VzdGlvbnMiLCJtYXAiLCJkYXRhSXRlbSIsInZhbHVlIiwiZGF0ZXRpbWVwaWNrZXIiLCJsaW5rRGF0ZVBpY2tlcnMiLCJldmVudFJlbmRlciIsImVsZW1lbnQiLCJhZGRDbGFzcyIsImV2ZW50Q2xpY2siLCJ2aWV3Iiwic3R1ZGVudG5hbWUiLCJzaG93TWVldGluZ0Zvcm0iLCJyZXBlYXQiLCJibGFja291dFNlcmllcyIsIm1vZGFsIiwic2VsZWN0IiwiY2hhbmdlIiwicmVwZWF0Q2hhbmdlIiwic2F2ZUJsYWNrb3V0IiwiZGVsZXRlQmxhY2tvdXQiLCJibGFja291dE9jY3VycmVuY2UiLCJvZmYiLCJlIiwiY3JlYXRlTWVldGluZ0Zvcm0iLCJjcmVhdGVCbGFja291dEZvcm0iLCJyZXNvbHZlQ29uZmxpY3RzIiwidGl0bGUiLCJpc0FmdGVyIiwic3R1ZGVudFNlbGVjdCIsInNhdmVNZWV0aW5nIiwiZGVsZXRlTWVldGluZyIsImNoYW5nZUR1cmF0aW9uIiwicmVzZXRDYWxlbmRhciIsImRpc3BsYXlNZXNzYWdlIiwiYWpheFNhdmUiLCJwb3N0IiwidGhlbiIsImNhdGNoIiwiaGFuZGxlRXJyb3IiLCJhamF4RGVsZXRlIiwibm9SZXNldCIsIm5vQ2hvaWNlIiwiZGVzYyIsInN0YXR1cyIsIm1lZXRpbmdpZCIsInN0dWRlbnRpZCIsImR1cmF0aW9uT3B0aW9ucyIsInVuZGVmaW5lZCIsImhvdXIiLCJtaW51dGUiLCJjbGVhckZvcm1FcnJvcnMiLCJlbXB0eSIsIm1pbnV0ZXMiLCJkaWZmIiwiZWxlbTEiLCJlbGVtMiIsImR1cmF0aW9uIiwiZGF0ZTIiLCJkYXRlIiwiaXNTYW1lIiwiY2xvbmUiLCJkYXRlMSIsImlzQmVmb3JlIiwibmV3RGF0ZSIsImFkZCIsImRlbGV0ZUNvbmZsaWN0IiwiZWRpdENvbmZsaWN0IiwicmVzb2x2ZUNvbmZsaWN0IiwiaW5kZXgiLCJhcHBlbmRUbyIsImJzdGFydCIsImJlbmQiLCJidGl0bGUiLCJiYmxhY2tvdXRldmVudGlkIiwiYmJsYWNrb3V0aWQiLCJicmVwZWF0IiwiYnJlcGVhdGV2ZXJ5IiwiYnJlcGVhdHVudGlsIiwiYnJlcGVhdHdlZWtkYXlzbSIsImJyZXBlYXR3ZWVrZGF5c3QiLCJicmVwZWF0d2Vla2RheXN3IiwiYnJlcGVhdHdlZWtkYXlzdSIsImJyZXBlYXR3ZWVrZGF5c2YiLCJwYXJhbXMiLCJibGFja291dF9pZCIsInJlcGVhdF90eXBlIiwicmVwZWF0X2V2ZXJ5IiwicmVwZWF0X3VudGlsIiwicmVwZWF0X2RldGFpbCIsIlN0cmluZyIsImluZGV4T2YiLCJwcm9tcHQiLCJWdWUiLCJFY2hvIiwiUHVzaGVyIiwiaW9uIiwic291bmQiLCJzb3VuZHMiLCJ2b2x1bWUiLCJwYXRoIiwicHJlbG9hZCIsInVzZXJJRCIsInBhcnNlSW50IiwiZ3JvdXBSZWdpc3RlckJ0biIsImdyb3VwRGlzYWJsZUJ0biIsInZtIiwiZWwiLCJxdWV1ZSIsIm9ubGluZSIsIm1ldGhvZHMiLCJnZXRDbGFzcyIsInMiLCJ1c2VyaWQiLCJpbkFycmF5IiwidGFrZVN0dWRlbnQiLCJnaWQiLCJjdXJyZW50VGFyZ2V0IiwiZGF0YXNldCIsImFqYXhQb3N0IiwicHV0U3R1ZGVudCIsImRvbmVTdHVkZW50IiwiZGVsU3R1ZGVudCIsImVudiIsImxvZ1RvQ29uc29sZSIsImJyb2FkY2FzdGVyIiwia2V5IiwicHVzaGVyS2V5IiwiY2x1c3RlciIsInB1c2hlckNsdXN0ZXIiLCJjb25uZWN0b3IiLCJwdXNoZXIiLCJjb25uZWN0aW9uIiwiY29uY2F0IiwiY2hlY2tCdXR0b25zIiwiaW5pdGlhbENoZWNrRGluZyIsInNvcnQiLCJzb3J0RnVuY3Rpb24iLCJjaGFubmVsIiwibGlzdGVuIiwibG9jYXRpb24iLCJocmVmIiwiam9pbiIsImhlcmUiLCJ1c2VycyIsImxlbiIsImkiLCJwdXNoIiwiam9pbmluZyIsInVzZXIiLCJsZWF2aW5nIiwic3BsaWNlIiwiZm91bmQiLCJjaGVja0RpbmciLCJmaWx0ZXIiLCJkaXNhYmxlQnV0dG9uIiwicmVhbGx5IiwiYXR0ciIsImJvZHkiLCJzdWJtaXQiLCJlbmFibGVCdXR0b24iLCJyZW1vdmVBdHRyIiwiZm91bmRNZSIsInBlcnNvbiIsInBsYXkiLCJhIiwiYiIsIkRhdGFUYWJsZSIsInRvZ2dsZUNsYXNzIiwibG9hZHBpY3R1cmUiLCJhamF4bW9kYWxzYXZlIiwiYWpheCIsInJlbG9hZCIsInNvZnQiLCJhamF4bW9kYWxkZWxldGUiLCJtaW5DaGFycyIsInRydW5jYXRlVGV4dCIsIm1lc3NhZ2UiLCJkYXRhU3JjIiwiY29sdW1ucyIsImNvbHVtbkRlZnMiLCJyb3ciLCJtZXRhIiwib3JkZXIiLCJub3RlcyIsImNvdXJzZV9uYW1lIiwiZWxlY3RpdmVsaXN0X2lkIiwiZWxlY3RpdmVsaXN0X25hbWUiLCJjb3Vyc2VfcHJlZml4IiwiY291cnNlX21pbl9udW1iZXIiLCJjb3Vyc2VfbWF4X251bWJlciIsIm9wdGlvbnMyIiwic2VtZXN0ZXJfaWQiLCJjb3Vyc2VfaWQiLCJjb21wbGV0ZWRjb3Vyc2VfaWQiLCJwbGFuaWQiLCJsaXN0aXRlbXMiLCJyZW1vdmUiLCJkZWdyZWVyZXF1aXJlbWVudF9pZCIsImNhdGFsb2dfY291cnNlIiwiY29tcGxldGVkX2NvdXJzZSIsImRyYWdnYWJsZSIsInNlbWVzdGVycyIsImVkaXRTZW1lc3RlciIsInNhdmVTZW1lc3RlciIsImRlbGV0ZVNlbWVzdGVyIiwiZHJvcFNlbWVzdGVyIiwiZHJvcENvdXJzZSIsImVkaXRDb3Vyc2UiLCJjb21wb25lbnRzIiwibG9hZERhdGEiLCJhZGRTZW1lc3RlciIsInNhdmVDb3Vyc2UiLCJkZWxldGVDb3Vyc2UiLCJkb2N1bWVudEVsZW1lbnQiLCJzdHlsZSIsInNldFByb3BlcnR5IiwiY291cnNlcyIsInNlbWlkIiwidGFyZ2V0IiwidG9TZW1JbmRleCIsInRvIiwiaXRlbSIsImNvdXJzZUluZGV4Iiwic2VtSW5kZXgiLCJjb3Vyc2UiLCJjb21wbGV0ZWRjb3Vyc2VfbmFtZSIsInBsYW5yZXF1aXJlbWVudF9pZCIsInNldFRpbWVvdXQiLCJzZXRGb3JtRXJyb3JzIiwianNvbiIsInN1YnN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJjbGljayIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiaHRtbFN0cmluZyIsImNvbnRlbnRzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBLGlFQUFpRTtBQUNqRSxxQkFBcUI7QUFDckI7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLFdBQVc7QUFDdEIsZUFBZSxpQ0FBaUM7QUFDaEQsaUJBQWlCLGlCQUFpQjtBQUNsQyxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFLFdBQVcsdUJBQXVCO0FBQ2xDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsNkJBQTZCO0FBQzNDLFdBQVcsdUJBQXVCO0FBQ2xDLGNBQWMsY0FBYztBQUM1QixXQUFXLHVCQUF1QjtBQUNsQyxjQUFjLDZCQUE2QjtBQUMzQyxXQUFXO0FBQ1gsR0FBRztBQUNILGdCQUFnQixZQUFZO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QixxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0QsU0FBUztBQUNULHVEQUF1RDtBQUN2RDtBQUNBLE9BQU87QUFDUCwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FB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LFFBQUUscUJBQXFCVSxFQUF2QixFQUEyQm9NLFdBQTNCLENBQXVDLFFBQXZDO0FBQ0E5TSxRQUFFLG1CQUFtQlUsRUFBckIsRUFBeUI2TixRQUF6QixDQUFrQyxRQUFsQztBQUNELEtBZEQ7QUFlRCxHQWhCRDtBQWlCRCxDQXRGRCxDIiwiZmlsZSI6Ii9qcy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbihmdW5jdGlvbihtb2QpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSAvLyBDb21tb25KU1xuICAgIG1vZChyZXF1aXJlKFwiLi4vLi4vbGliL2NvZGVtaXJyb3JcIikpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICBkZWZpbmUoW1wiLi4vLi4vbGliL2NvZGVtaXJyb3JcIl0sIG1vZCk7XG4gIGVsc2UgLy8gUGxhaW4gYnJvd3NlciBlbnZcbiAgICBtb2QoQ29kZU1pcnJvcik7XG59KShmdW5jdGlvbihDb2RlTWlycm9yKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGh0bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2VyczogeydhcmVhJzogdHJ1ZSwgJ2Jhc2UnOiB0cnVlLCAnYnInOiB0cnVlLCAnY29sJzogdHJ1ZSwgJ2NvbW1hbmQnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnZW1iZWQnOiB0cnVlLCAnZnJhbWUnOiB0cnVlLCAnaHInOiB0cnVlLCAnaW1nJzogdHJ1ZSwgJ2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2tleWdlbic6IHRydWUsICdsaW5rJzogdHJ1ZSwgJ21ldGEnOiB0cnVlLCAncGFyYW0nOiB0cnVlLCAnc291cmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYWNrJzogdHJ1ZSwgJ3dicic6IHRydWUsICdtZW51aXRlbSc6IHRydWV9LFxuICBpbXBsaWNpdGx5Q2xvc2VkOiB7J2RkJzogdHJ1ZSwgJ2xpJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZSwgJ29wdGlvbic6IHRydWUsICdwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICdycCc6IHRydWUsICdydCc6IHRydWUsICd0Ym9keSc6IHRydWUsICd0ZCc6IHRydWUsICd0Zm9vdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAndGgnOiB0cnVlLCAndHInOiB0cnVlfSxcbiAgY29udGV4dEdyYWJiZXJzOiB7XG4gICAgJ2RkJzogeydkZCc6IHRydWUsICdkdCc6IHRydWV9LFxuICAgICdkdCc6IHsnZGQnOiB0cnVlLCAnZHQnOiB0cnVlfSxcbiAgICAnbGknOiB7J2xpJzogdHJ1ZX0sXG4gICAgJ29wdGlvbic6IHsnb3B0aW9uJzogdHJ1ZSwgJ29wdGdyb3VwJzogdHJ1ZX0sXG4gICAgJ29wdGdyb3VwJzogeydvcHRncm91cCc6IHRydWV9LFxuICAgICdwJzogeydhZGRyZXNzJzogdHJ1ZSwgJ2FydGljbGUnOiB0cnVlLCAnYXNpZGUnOiB0cnVlLCAnYmxvY2txdW90ZSc6IHRydWUsICdkaXInOiB0cnVlLFxuICAgICAgICAgICdkaXYnOiB0cnVlLCAnZGwnOiB0cnVlLCAnZmllbGRzZXQnOiB0cnVlLCAnZm9vdGVyJzogdHJ1ZSwgJ2Zvcm0nOiB0cnVlLFxuICAgICAgICAgICdoMSc6IHRydWUsICdoMic6IHRydWUsICdoMyc6IHRydWUsICdoNCc6IHRydWUsICdoNSc6IHRydWUsICdoNic6IHRydWUsXG4gICAgICAgICAgJ2hlYWRlcic6IHRydWUsICdoZ3JvdXAnOiB0cnVlLCAnaHInOiB0cnVlLCAnbWVudSc6IHRydWUsICduYXYnOiB0cnVlLCAnb2wnOiB0cnVlLFxuICAgICAgICAgICdwJzogdHJ1ZSwgJ3ByZSc6IHRydWUsICdzZWN0aW9uJzogdHJ1ZSwgJ3RhYmxlJzogdHJ1ZSwgJ3VsJzogdHJ1ZX0sXG4gICAgJ3JwJzogeydycCc6IHRydWUsICdydCc6IHRydWV9LFxuICAgICdydCc6IHsncnAnOiB0cnVlLCAncnQnOiB0cnVlfSxcbiAgICAndGJvZHknOiB7J3Rib2R5JzogdHJ1ZSwgJ3Rmb290JzogdHJ1ZX0sXG4gICAgJ3RkJzogeyd0ZCc6IHRydWUsICd0aCc6IHRydWV9LFxuICAgICd0Zm9vdCc6IHsndGJvZHknOiB0cnVlfSxcbiAgICAndGgnOiB7J3RkJzogdHJ1ZSwgJ3RoJzogdHJ1ZX0sXG4gICAgJ3RoZWFkJzogeyd0Ym9keSc6IHRydWUsICd0Zm9vdCc6IHRydWV9LFxuICAgICd0cic6IHsndHInOiB0cnVlfVxuICB9LFxuICBkb05vdEluZGVudDoge1wicHJlXCI6IHRydWV9LFxuICBhbGxvd1VucXVvdGVkOiB0cnVlLFxuICBhbGxvd01pc3Npbmc6IHRydWUsXG4gIGNhc2VGb2xkOiB0cnVlXG59XG5cbnZhciB4bWxDb25maWcgPSB7XG4gIGF1dG9TZWxmQ2xvc2Vyczoge30sXG4gIGltcGxpY2l0bHlDbG9zZWQ6IHt9LFxuICBjb250ZXh0R3JhYmJlcnM6IHt9LFxuICBkb05vdEluZGVudDoge30sXG4gIGFsbG93VW5xdW90ZWQ6IGZhbHNlLFxuICBhbGxvd01pc3Npbmc6IGZhbHNlLFxuICBhbGxvd01pc3NpbmdUYWdOYW1lOiBmYWxzZSxcbiAgY2FzZUZvbGQ6IGZhbHNlXG59XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcInhtbFwiLCBmdW5jdGlvbihlZGl0b3JDb25mLCBjb25maWdfKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gZWRpdG9yQ29uZi5pbmRlbnRVbml0XG4gIHZhciBjb25maWcgPSB7fVxuICB2YXIgZGVmYXVsdHMgPSBjb25maWdfLmh0bWxNb2RlID8gaHRtbENvbmZpZyA6IHhtbENvbmZpZ1xuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSBjb25maWdbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ18pIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ19bcHJvcF1cblxuICAvLyBSZXR1cm4gdmFyaWFibGVzIGZvciB0b2tlbml6ZXJzXG4gIHZhciB0eXBlLCBzZXRTdHlsZTtcblxuICBmdW5jdGlvbiBpblRleHQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNoYWluKHBhcnNlcikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBwYXJzZXI7XG4gICAgICByZXR1cm4gcGFyc2VyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiFcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJbXCIpKSB7XG4gICAgICAgICAgaWYgKHN0cmVhbS5tYXRjaChcIkNEQVRBW1wiKSkgcmV0dXJuIGNoYWluKGluQmxvY2soXCJhdG9tXCIsIFwiXV0+XCIpKTtcbiAgICAgICAgICBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmVhbS5tYXRjaChcIi0tXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYWluKGluQmxvY2soXCJjb21tZW50XCIsIFwiLS0+XCIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJlYW0ubWF0Y2goXCJET0NUWVBFXCIsIHRydWUsIHRydWUpKSB7XG4gICAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgICByZXR1cm4gY2hhaW4oZG9jdHlwZSgxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIj9cIikpIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuX1xcLV0vKTtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkJsb2NrKFwibWV0YVwiLCBcIj8+XCIpO1xuICAgICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gc3RyZWFtLmVhdChcIi9cIikgPyBcImNsb3NlVGFnXCIgOiBcIm9wZW5UYWdcIjtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRhZztcbiAgICAgICAgcmV0dXJuIFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiJlwiKSB7XG4gICAgICB2YXIgb2s7XG4gICAgICBpZiAoc3RyZWFtLmVhdChcIiNcIikpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5lYXQoXCJ4XCIpKSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1thLWZBLUZcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2sgPSBzdHJlYW0uZWF0V2hpbGUoL1tcXGRdLykgJiYgc3RyZWFtLmVhdChcIjtcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9rID0gc3RyZWFtLmVhdFdoaWxlKC9bXFx3XFwuXFwtOl0vKSAmJiBzdHJlYW0uZWF0KFwiO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvayA/IFwiYXRvbVwiIDogXCJlcnJvclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1teJjxdLyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaW5UZXh0LmlzSW5UZXh0ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpblRhZyhzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RyZWFtLm5leHQoKTtcbiAgICBpZiAoY2ggPT0gXCI+XCIgfHwgKGNoID09IFwiL1wiICYmIHN0cmVhbS5lYXQoXCI+XCIpKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICB0eXBlID0gY2ggPT0gXCI+XCIgPyBcImVuZFRhZ1wiIDogXCJzZWxmY2xvc2VUYWdcIjtcbiAgICAgIHJldHVybiBcInRhZyBicmFja2V0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIikge1xuICAgICAgdHlwZSA9IFwiZXF1YWxzXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiPFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgIHN0YXRlLnN0YXRlID0gYmFzZVN0YXRlO1xuICAgICAgc3RhdGUudGFnTmFtZSA9IHN0YXRlLnRhZ1N0YXJ0ID0gbnVsbDtcbiAgICAgIHZhciBuZXh0ID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICByZXR1cm4gbmV4dCA/IG5leHQgKyBcIiB0YWcgZXJyb3JcIiA6IFwidGFnIGVycm9yXCI7XG4gICAgfSBlbHNlIGlmICgvW1xcJ1xcXCJdLy50ZXN0KGNoKSkge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSBpbkF0dHJpYnV0ZShjaCk7XG4gICAgICBzdGF0ZS5zdHJpbmdTdGFydENvbCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eW15cXHNcXHUwMGEwPTw+XFxcIlxcJ10qW15cXHNcXHUwMGEwPTw+XFxcIlxcJ1xcL10vKTtcbiAgICAgIHJldHVybiBcIndvcmRcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbkF0dHJpYnV0ZShxdW90ZSkge1xuICAgIHZhciBjbG9zdXJlID0gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkpIHtcbiAgICAgICAgaWYgKHN0cmVhbS5uZXh0KCkgPT0gcXVvdGUpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGFnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICB9O1xuICAgIGNsb3N1cmUuaXNJbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgcmV0dXJuIGNsb3N1cmU7XG4gIH1cblxuICBmdW5jdGlvbiBpbkJsb2NrKHN0eWxlLCB0ZXJtaW5hdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIGlmIChzdHJlYW0ubWF0Y2godGVybWluYXRvcikpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGluVGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ubmV4dCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jdHlwZShkZXB0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgY2g7XG4gICAgICB3aGlsZSAoKGNoID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY2ggPT0gXCI8XCIpIHtcbiAgICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IGRvY3R5cGUoZGVwdGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI+XCIpIHtcbiAgICAgICAgICBpZiAoZGVwdGggPT0gMSkge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBpblRleHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudG9rZW5pemUgPSBkb2N0eXBlKGRlcHRoIC0gMSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJtZXRhXCI7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQoc3RhdGUsIHRhZ05hbWUsIHN0YXJ0T2ZMaW5lKSB7XG4gICAgdGhpcy5wcmV2ID0gc3RhdGUuY29udGV4dDtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuICAgIHRoaXMuaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgdGhpcy5zdGFydE9mTGluZSA9IHN0YXJ0T2ZMaW5lO1xuICAgIGlmIChjb25maWcuZG9Ob3RJbmRlbnQuaGFzT3duUHJvcGVydHkodGFnTmFtZSkgfHwgKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC5ub0luZGVudCkpXG4gICAgICB0aGlzLm5vSW5kZW50ID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBwb3BDb250ZXh0KHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHN0YXRlLmNvbnRleHQgPSBzdGF0ZS5jb250ZXh0LnByZXY7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVQb3BDb250ZXh0KHN0YXRlLCBuZXh0VGFnTmFtZSkge1xuICAgIHZhciBwYXJlbnRUYWdOYW1lO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIXN0YXRlLmNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGFyZW50VGFnTmFtZSA9IHN0YXRlLmNvbnRleHQudGFnTmFtZTtcbiAgICAgIGlmICghY29uZmlnLmNvbnRleHRHcmFiYmVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRUYWdOYW1lKSB8fFxuICAgICAgICAgICFjb25maWcuY29udGV4dEdyYWJiZXJzW3BhcmVudFRhZ05hbWVdLmhhc093blByb3BlcnR5KG5leHRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYXNlU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwib3BlblRhZ1wiKSB7XG4gICAgICBzdGF0ZS50YWdTdGFydCA9IHN0cmVhbS5jb2x1bW4oKTtcbiAgICAgIHJldHVybiB0YWdOYW1lU3RhdGU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiY2xvc2VUYWdcIikge1xuICAgICAgcmV0dXJuIGNsb3NlVGFnTmFtZVN0YXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0YWdOYW1lU3RhdGUodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmICh0eXBlID09IFwid29yZFwiKSB7XG4gICAgICBzdGF0ZS50YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgIHJldHVybiBhdHRyU3RhdGU7XG4gICAgfSBlbHNlIGlmIChjb25maWcuYWxsb3dNaXNzaW5nVGFnTmFtZSAmJiB0eXBlID09IFwiZW5kVGFnXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJ0YWcgYnJhY2tldFwiO1xuICAgICAgcmV0dXJuIGF0dHJTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3R5bGUgPSBcImVycm9yXCI7XG4gICAgICByZXR1cm4gdGFnTmFtZVN0YXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbG9zZVRhZ05hbWVTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RyZWFtLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzdGF0ZS5jb250ZXh0ICYmIHN0YXRlLmNvbnRleHQudGFnTmFtZSAhPSB0YWdOYW1lICYmXG4gICAgICAgICAgY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoc3RhdGUuY29udGV4dC50YWdOYW1lKSlcbiAgICAgICAgcG9wQ29udGV4dChzdGF0ZSk7XG4gICAgICBpZiAoKHN0YXRlLmNvbnRleHQgJiYgc3RhdGUuY29udGV4dC50YWdOYW1lID09IHRhZ05hbWUpIHx8IGNvbmZpZy5tYXRjaENsb3NpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFN0eWxlID0gXCJ0YWdcIjtcbiAgICAgICAgcmV0dXJuIGNsb3NlU3RhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZSA9IFwidGFnIGVycm9yXCI7XG4gICAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29uZmlnLmFsbG93TWlzc2luZ1RhZ05hbWUgJiYgdHlwZSA9PSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwidGFnIGJyYWNrZXRcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlRXJyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGUodHlwZSwgX3N0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSAhPSBcImVuZFRhZ1wiKSB7XG4gICAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICAgIHJldHVybiBjbG9zZVN0YXRlO1xuICAgIH1cbiAgICBwb3BDb250ZXh0KHN0YXRlKTtcbiAgICByZXR1cm4gYmFzZVN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlU3RhdGVFcnIodHlwZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIHNldFN0eWxlID0gXCJlcnJvclwiO1xuICAgIHJldHVybiBjbG9zZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXR0clN0YXRlKHR5cGUsIF9zdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ3b3JkXCIpIHtcbiAgICAgIHNldFN0eWxlID0gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIHJldHVybiBhdHRyRXFTdGF0ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJlbmRUYWdcIiB8fCB0eXBlID09IFwic2VsZmNsb3NlVGFnXCIpIHtcbiAgICAgIHZhciB0YWdOYW1lID0gc3RhdGUudGFnTmFtZSwgdGFnU3RhcnQgPSBzdGF0ZS50YWdTdGFydDtcbiAgICAgIHN0YXRlLnRhZ05hbWUgPSBzdGF0ZS50YWdTdGFydCA9IG51bGw7XG4gICAgICBpZiAodHlwZSA9PSBcInNlbGZjbG9zZVRhZ1wiIHx8XG4gICAgICAgICAgY29uZmlnLmF1dG9TZWxmQ2xvc2Vycy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgICBtYXliZVBvcENvbnRleHQoc3RhdGUsIHRhZ05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF5YmVQb3BDb250ZXh0KHN0YXRlLCB0YWdOYW1lKTtcbiAgICAgICAgc3RhdGUuY29udGV4dCA9IG5ldyBDb250ZXh0KHN0YXRlLCB0YWdOYW1lLCB0YWdTdGFydCA9PSBzdGF0ZS5pbmRlbnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVN0YXRlO1xuICAgIH1cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJFcVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImVxdWFsc1wiKSByZXR1cm4gYXR0clZhbHVlU3RhdGU7XG4gICAgaWYgKCFjb25maWcuYWxsb3dNaXNzaW5nKSBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJWYWx1ZVN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gYXR0ckNvbnRpbnVlZFN0YXRlO1xuICAgIGlmICh0eXBlID09IFwid29yZFwiICYmIGNvbmZpZy5hbGxvd1VucXVvdGVkKSB7c2V0U3R5bGUgPSBcInN0cmluZ1wiOyByZXR1cm4gYXR0clN0YXRlO31cbiAgICBzZXRTdHlsZSA9IFwiZXJyb3JcIjtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIGF0dHJDb250aW51ZWRTdGF0ZSh0eXBlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGF0dHJDb250aW51ZWRTdGF0ZTtcbiAgICByZXR1cm4gYXR0clN0YXRlKHR5cGUsIHN0cmVhbSwgc3RhdGUpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlSW5kZW50KSB7XG4gICAgICB2YXIgc3RhdGUgPSB7dG9rZW5pemU6IGluVGV4dCxcbiAgICAgICAgICAgICAgICAgICBzdGF0ZTogYmFzZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgIGluZGVudGVkOiBiYXNlSW5kZW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbnVsbCwgdGFnU3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgY29udGV4dDogbnVsbH1cbiAgICAgIGlmIChiYXNlSW5kZW50ICE9IG51bGwpIHN0YXRlLmJhc2VJbmRlbnQgPSBiYXNlSW5kZW50XG4gICAgICByZXR1cm4gc3RhdGVcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmICghc3RhdGUudGFnTmFtZSAmJiBzdHJlYW0uc29sKCkpXG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG5cbiAgICAgIGlmIChzdHJlYW0uZWF0U3BhY2UoKSkgcmV0dXJuIG51bGw7XG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKChzdHlsZSB8fCB0eXBlKSAmJiBzdHlsZSAhPSBcImNvbW1lbnRcIikge1xuICAgICAgICBzZXRTdHlsZSA9IG51bGw7XG4gICAgICAgIHN0YXRlLnN0YXRlID0gc3RhdGUuc3RhdGUodHlwZSB8fCBzdHlsZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICAgIGlmIChzZXRTdHlsZSlcbiAgICAgICAgICBzdHlsZSA9IHNldFN0eWxlID09IFwiZXJyb3JcIiA/IHN0eWxlICsgXCIgZXJyb3JcIiA6IHNldFN0eWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIsIGZ1bGxMaW5lKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gICAgICAvLyBJbmRlbnQgbXVsdGktbGluZSBzdHJpbmdzIChlLmcuIGNzcykuXG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUuaXNJbkF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAoc3RhdGUudGFnU3RhcnQgPT0gc3RhdGUuaW5kZW50ZWQpXG4gICAgICAgICAgcmV0dXJuIHN0YXRlLnN0cmluZ1N0YXJ0Q29sICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBzdGF0ZS5pbmRlbnRlZCArIGluZGVudFVuaXQ7XG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0Lm5vSW5kZW50KSByZXR1cm4gQ29kZU1pcnJvci5QYXNzO1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplICE9IGluVGFnICYmIHN0YXRlLnRva2VuaXplICE9IGluVGV4dClcbiAgICAgICAgcmV0dXJuIGZ1bGxMaW5lID8gZnVsbExpbmUubWF0Y2goL14oXFxzKikvKVswXS5sZW5ndGggOiAwO1xuICAgICAgLy8gSW5kZW50IHRoZSBzdGFydHMgb2YgYXR0cmlidXRlIG5hbWVzLlxuICAgICAgaWYgKHN0YXRlLnRhZ05hbWUpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRQYXN0VGFnICE9PSBmYWxzZSlcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBzdGF0ZS50YWdOYW1lLmxlbmd0aCArIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gc3RhdGUudGFnU3RhcnQgKyBpbmRlbnRVbml0ICogKGNvbmZpZy5tdWx0aWxpbmVUYWdJbmRlbnRGYWN0b3IgfHwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnLmFsaWduQ0RBVEEgJiYgLzwhXFxbQ0RBVEFcXFsvLnRlc3QodGV4dEFmdGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGFnQWZ0ZXIgPSB0ZXh0QWZ0ZXIgJiYgL148KFxcLyk/KFtcXHdfOlxcLi1dKikvLmV4ZWModGV4dEFmdGVyKTtcbiAgICAgIGlmICh0YWdBZnRlciAmJiB0YWdBZnRlclsxXSkgeyAvLyBDbG9zaW5nIHRhZyBzcG90dGVkXG4gICAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQudGFnTmFtZSA9PSB0YWdBZnRlclsyXSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmltcGxpY2l0bHlDbG9zZWQuaGFzT3duUHJvcGVydHkoY29udGV4dC50YWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZ0FmdGVyKSB7IC8vIE9wZW5pbmcgdGFnIHNwb3R0ZWRcbiAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICB2YXIgZ3JhYmJlcnMgPSBjb25maWcuY29udGV4dEdyYWJiZXJzW2NvbnRleHQudGFnTmFtZV07XG4gICAgICAgICAgaWYgKGdyYWJiZXJzICYmIGdyYWJiZXJzLmhhc093blByb3BlcnR5KHRhZ0FmdGVyWzJdKSlcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnByZXY7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjb250ZXh0ICYmIGNvbnRleHQucHJldiAmJiAhY29udGV4dC5zdGFydE9mTGluZSlcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucHJldjtcbiAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dC5pbmRlbnQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSByZXR1cm4gc3RhdGUuYmFzZUluZGVudCB8fCAwO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0lucHV0OiAvPFxcL1tcXHNcXHc6XSs+JC8sXG4gICAgYmxvY2tDb21tZW50U3RhcnQ6IFwiPCEtLVwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDogXCItLT5cIixcblxuICAgIGNvbmZpZ3VyYXRpb246IGNvbmZpZy5odG1sTW9kZSA/IFwiaHRtbFwiIDogXCJ4bWxcIixcbiAgICBoZWxwZXJUeXBlOiBjb25maWcuaHRtbE1vZGUgPyBcImh0bWxcIiA6IFwieG1sXCIsXG5cbiAgICBza2lwQXR0cmlidXRlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnN0YXRlID09IGF0dHJWYWx1ZVN0YXRlKVxuICAgICAgICBzdGF0ZS5zdGF0ZSA9IGF0dHJTdGF0ZVxuICAgIH1cbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3htbFwiLCBcInhtbFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3htbFwiLCBcInhtbFwiKTtcbmlmICghQ29kZU1pcnJvci5taW1lTW9kZXMuaGFzT3duUHJvcGVydHkoXCJ0ZXh0L2h0bWxcIikpXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvaHRtbFwiLCB7bmFtZTogXCJ4bWxcIiwgaHRtbE1vZGU6IHRydWV9KTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yL21vZGUveG1sL3htbC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZmlyc3RfbmFtZTogJCgnI2ZpcnN0X25hbWUnKS52YWwoKSxcbiAgICAgIGxhc3RfbmFtZTogJCgnI2xhc3RfbmFtZScpLnZhbCgpLFxuICAgICAgZW1haWw6ICQoJyNlbWFpbCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2Fkdmlzb3JfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5hZHZpc29yX2lkID0gJCgnI2Fkdmlzb3JfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgZGF0YS5laWQgPSAkKCcjZWlkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3c3R1ZGVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9zdHVkZW50cy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVzdHVkZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3N0dWRlbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZXN0dWRlbnRcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vc3R1ZGVudHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL3N0dWRlbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUveG1sL3htbC5qcycpO1xucmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3YWR2aXNvclwiPk5ldyBBZHZpc29yPC9hPicpO1xuXG4gICQoJyNub3RlcycpLnN1bW1lcm5vdGUoe1xuXHRcdGZvY3VzOiB0cnVlLFxuXHRcdHRvb2xiYXI6IFtcblx0XHRcdC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuXHRcdFx0WydzdHlsZScsIFsnc3R5bGUnLCAnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuXHRcdFx0Wydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCcsICdsaW5rJ11dLFxuXHRcdFx0WydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG5cdFx0XHRbJ21pc2MnLCBbJ2Z1bGxzY3JlZW4nLCAnY29kZXZpZXcnLCAnaGVscCddXSxcblx0XHRdLFxuXHRcdHRhYnNpemU6IDIsXG5cdFx0Y29kZW1pcnJvcjoge1xuXHRcdFx0bW9kZTogJ3RleHQvaHRtbCcsXG5cdFx0XHRodG1sTW9kZTogdHJ1ZSxcblx0XHRcdGxpbmVOdW1iZXJzOiB0cnVlLFxuXHRcdFx0dGhlbWU6ICdtb25va2FpJ1xuXHRcdH0sXG5cdH0pO1xuXG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm5hbWVcIiwgJCgnI25hbWUnKS52YWwoKSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiZW1haWxcIiwgJCgnI2VtYWlsJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcInBob25lXCIsICQoJyNwaG9uZScpLnZhbCgpKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJub3Rlc1wiLCAkKCcjbm90ZXMnKS52YWwoKSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKFwiaGlkZGVuXCIsICQoJyNoaWRkZW4nKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwKTtcblx0XHRpZigkKCcjcGljJykudmFsKCkpe1xuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKFwicGljXCIsICQoJyNwaWMnKVswXS5maWxlc1swXSk7XG5cdFx0fVxuICAgIGlmKCQoJyNkZXBhcnRtZW50X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImRlcGFydG1lbnRfaWRcIiwgJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSk7XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImVpZFwiLCAkKCcjZWlkJykudmFsKCkpO1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3YWR2aXNvcic7XG4gICAgfWVsc2V7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJlaWRcIiwgJCgnI2VpZCcpLnZhbCgpKTtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL2Fkdmlzb3JzLycgKyBpZDtcbiAgICB9XG5cdFx0ZGFzaGJvYXJkLmFqYXhzYXZlKGZvcm1EYXRhLCB1cmwsIGlkLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVhZHZpc29yXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2Fkdmlzb3JzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWFkdmlzb3JcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vYWR2aXNvcnNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0ID0gJCh0aGlzKSxcbiAgICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcbiAgICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG4gICAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcbiAgfSk7XG5cbiAgJCgnLmJ0bi1maWxlIDpmaWxlJykub24oJ2ZpbGVzZWxlY3QnLCBmdW5jdGlvbihldmVudCwgbnVtRmlsZXMsIGxhYmVsKSB7XG5cbiAgICAgIHZhciBpbnB1dCA9ICQodGhpcykucGFyZW50cygnLmlucHV0LWdyb3VwJykuZmluZCgnOnRleHQnKSxcbiAgICAgICAgICBsb2cgPSBudW1GaWxlcyA+IDEgPyBudW1GaWxlcyArICcgZmlsZXMgc2VsZWN0ZWQnIDogbGFiZWw7XG5cbiAgICAgIGlmKCBpbnB1dC5sZW5ndGggKSB7XG4gICAgICAgICAgaW5wdXQudmFsKGxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKCBsb2cgKSBhbGVydChsb2cpO1xuICAgICAgfVxuXG4gIH0pO1xuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vbmV3ZGVwYXJ0bWVudFwiPk5ldyBEZXBhcnRtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBlbWFpbDogJCgnI2VtYWlsJykudmFsKCksXG4gICAgICBvZmZpY2U6ICQoJyNvZmZpY2UnKS52YWwoKSxcbiAgICAgIHBob25lOiAkKCcjcGhvbmUnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2RlcGFydG1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vZGVwYXJ0bWVudHMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlZGVwYXJ0bWVudFwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9kZXBhcnRtZW50c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVkZXBhcnRtZW50XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlcGFydG1lbnRzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXCI+TmV3IERlZ3JlZSBQcm9ncmFtPC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV95ZWFyOiAkKCcjZWZmZWN0aXZlX3llYXInKS52YWwoKSxcbiAgICAgIGVmZmVjdGl2ZV9zZW1lc3RlcjogJCgnI2VmZmVjdGl2ZV9zZW1lc3RlcicpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5kZXBhcnRtZW50X2lkID0gJCgnI2RlcGFydG1lbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIGlkID0gJCgnI2lkJykudmFsKCk7XG4gICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVwcm9ncmFtcy8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4c2F2ZShkYXRhLCB1cmwsIGlkKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVkZWdyZWVwcm9ncmFtXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2RlZ3JlZXByb2dyYW1zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG4gICQoJyNyZXN0b3JlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vcmVzdG9yZWRlZ3JlZXByb2dyYW1cIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZGVncmVlcHJvZ3JhbXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4cmVzdG9yZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdGlvbnMgPSBkYXNoYm9hcmQuZGF0YVRhYmxlT3B0aW9ucztcbiAgb3B0aW9ucy5kb20gPSAnPFwibmV3YnV0dG9uXCI+ZnJ0aXAnO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiL2FkbWluL25ld2VsZWN0aXZlbGlzdFwiPk5ldyBFbGVjdGl2ZSBMaXN0PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICBhYmJyZXZpYXRpb246ICQoJyNhYmJyZXZpYXRpb24nKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWxpc3RzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlZWxlY3RpdmVsaXN0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2VsZWN0aXZlbGlzdHNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVlbGVjdGl2ZWxpc3RcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vZWxlY3RpdmVsaXN0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhyZXN0b3JlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdwbGFuXCI+TmV3IFBsYW48L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAkKCcjZGVzY3JpcHRpb24nKS52YWwoKSxcbiAgICAgIHN0YXJ0X3llYXI6ICQoJyNzdGFydF95ZWFyJykudmFsKCksXG4gICAgICBzdGFydF9zZW1lc3RlcjogJCgnI3N0YXJ0X3NlbWVzdGVyJykudmFsKCksXG4gICAgICBkZWdyZWVwcm9ncmFtX2lkOiAkKCcjZGVncmVlcHJvZ3JhbV9pZCcpLnZhbCgpLFxuICAgICAgc3R1ZGVudF9pZDogJCgnI3N0dWRlbnRfaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld3BsYW4nO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnMvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCwgdHJ1ZSk7XG4gIH0pO1xuXG4gICQoJyNmb3JjZWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2ZvcmNlZGVsZXRlcGxhblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9wbGFuc1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVzdG9yZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL3Jlc3RvcmVwbGFuXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheHJlc3RvcmUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxuICAkKCcjcmVwb3B1bGF0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlcXVpcmVtZW50cyBhbmQgcmVwb3B1bGF0ZSB0aGVtIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBkZWdyZWUgcHJvZ3JhbS4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICAgdmFyIHVybCA9IFwiL2FkbWluL3BvcHVsYXRlcGxhblwiO1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICAgIH07XG4gICAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gICAgfVxuICB9KVxuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdzdHVkZW50X2lkJywgJy9wcm9maWxlL3N0dWRlbnRmZWVkJyk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbmFtZTogJCgnI25hbWUnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIHBsYW5faWQ6ICQoJyNwbGFuX2lkJykudmFsKCksXG4gICAgfTtcbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy9uZXdwbGFuc2VtZXN0ZXIvJyArICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXIvJyArIGlkO1xuICAgIH1cbiAgICBkYXNoYm9hcmQuYWpheHNhdmUoZGF0YSwgdXJsLCBpZCk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9wbGFucy9kZWxldGVwbGFuc2VtZXN0ZXIvXCIgKyAkKCcjaWQnKS52YWwoKSA7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL3BsYW5zL1wiICsgJCgnI3BsYW5faWQnKS52YWwoKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdjb21wbGV0ZWRjb3Vyc2VcIj5OZXcgQ29tcGxldGVkIENvdXJzZTwvYT4nKTtcblxuICAkKCcjc2F2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBjb3Vyc2VudW1iZXI6ICQoJyNjb3Vyc2VudW1iZXInKS52YWwoKSxcbiAgICAgIG5hbWU6ICQoJyNuYW1lJykudmFsKCksXG4gICAgICB5ZWFyOiAkKCcjeWVhcicpLnZhbCgpLFxuICAgICAgc2VtZXN0ZXI6ICQoJyNzZW1lc3RlcicpLnZhbCgpLFxuICAgICAgYmFzaXM6ICQoJyNiYXNpcycpLnZhbCgpLFxuICAgICAgZ3JhZGU6ICQoJyNncmFkZScpLnZhbCgpLFxuICAgICAgY3JlZGl0czogJCgnI2NyZWRpdHMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI3N0dWRlbnRfaWQnKS52YWwoKSA+IDApe1xuICAgICAgZGF0YS5zdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3RyYW5zZmVyJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS50cmFuc2ZlciA9IGZhbHNlO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLnRyYW5zZmVyID0gdHJ1ZTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2luc3RpdHV0aW9uID0gJCgnI2luY29taW5nX2luc3RpdHV0aW9uJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19uYW1lID0gJCgnI2luY29taW5nX25hbWUnKS52YWwoKTtcbiAgICAgICAgICBkYXRhLmluY29taW5nX2Rlc2NyaXB0aW9uID0gJCgnI2luY29taW5nX2Rlc2NyaXB0aW9uJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19zZW1lc3RlciA9ICQoJyNpbmNvbWluZ19zZW1lc3RlcicpLnZhbCgpO1xuICAgICAgICAgIGRhdGEuaW5jb21pbmdfY3JlZGl0cyA9ICQoJyNpbmNvbWluZ19jcmVkaXRzJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5pbmNvbWluZ19ncmFkZSA9ICQoJyNpbmNvbWluZ19ncmFkZScpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9jb21wbGV0ZWRjb3Vyc2VzLycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhzYXZlKGRhdGEsIHVybCwgaWQpO1xuICB9KTtcblxuICAkKCcjZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZGVsZXRlY29tcGxldGVkY291cnNlXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2NvbXBsZXRlZGNvdXJzZXNcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsKTtcbiAgfSk7XG5cbiAgJCgnaW5wdXRbbmFtZT10cmFuc2Zlcl0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcblxuICBkYXNoYm9hcmQuYWpheGF1dG9jb21wbGV0ZSgnc3R1ZGVudF9pZCcsICcvcHJvZmlsZS9zdHVkZW50ZmVlZCcpO1xuXG4gIGlmKCQoJyN0cmFuc2ZlcmNvdXJzZScpLmlzKCc6aGlkZGVuJykpe1xuICAgICQoJyN0cmFuc2ZlcjEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gIH1lbHNle1xuICAgICQoJyN0cmFuc2ZlcjInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gIH1cblxufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hpY2ggZGl2IHRvIHNob3cgaW4gdGhlIGZvcm1cbiAqL1xudmFyIHNob3dzZWxlY3RlZCA9IGZ1bmN0aW9uKCl7XG4gIC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODYyMjMzNi9qcXVlcnktZ2V0LXZhbHVlLW9mLXNlbGVjdGVkLXJhZGlvLWJ1dHRvblxuICB2YXIgc2VsZWN0ZWQgPSAkKFwiaW5wdXRbbmFtZT0ndHJhbnNmZXInXTpjaGVja2VkXCIpO1xuICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHNlbGVjdGVkVmFsID0gc2VsZWN0ZWQudmFsKCk7XG4gICAgICBpZihzZWxlY3RlZFZhbCA9PSAxKXtcbiAgICAgICAgJCgnI2tzdGF0ZWNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI3RyYW5zZmVyY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNrc3RhdGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyN0cmFuc2ZlcmNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdC5qcyIsIi8vaHR0cHM6Ly9sYXJhdmVsLmNvbS9kb2NzLzUuNC9taXgjd29ya2luZy13aXRoLXNjcmlwdHNcbi8vaHR0cHM6Ly9hbmR5LWNhcnRlci5jb20vYmxvZy9zY29waW5nLWphdmFzY3JpcHQtZnVuY3Rpb25hbGl0eS10by1zcGVjaWZpYy1wYWdlcy13aXRoLWxhcmF2ZWwtYW5kLWNha2VwaHBcblxuLy9Mb2FkIHNpdGUtd2lkZSBsaWJyYXJpZXMgaW4gYm9vdHN0cmFwIGZpbGVcbnJlcXVpcmUoJy4vYm9vdHN0cmFwJyk7XG5cbnZhciBBcHAgPSB7XG5cblx0Ly8gQ29udHJvbGxlci1hY3Rpb24gbWV0aG9kc1xuXHRhY3Rpb25zOiB7XG5cdFx0Ly9JbmRleCBmb3IgZGlyZWN0bHkgY3JlYXRlZCB2aWV3cyB3aXRoIG5vIGV4cGxpY2l0IGNvbnRyb2xsZXJcblx0XHRSb290Um91dGVDb250cm9sbGVyOiB7XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblx0XHRcdH0sXG5cdFx0XHRnZXRBYm91dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4vdXRpbC9lZGl0YWJsZScpO1xuXHRcdFx0XHRlZGl0YWJsZS5pbml0KCk7XG5cdFx0XHRcdHZhciBzaXRlID0gcmVxdWlyZSgnLi91dGlsL3NpdGUnKTtcblx0XHRcdFx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblx0XHRcdH0sXG4gICAgfSxcblxuXHRcdC8vQWR2aXNpbmcgQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9hZHZpc2luZ1xuXHRcdEFkdmlzaW5nQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZHZpc2luZy9pbmRleFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY2FsZW5kYXIgPSByZXF1aXJlKCcuL3BhZ2VzL2NhbGVuZGFyJyk7XG5cdFx0XHRcdGNhbGVuZGFyLmluaXQoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9Hcm91cHNlc3Npb24gQ29udHJvbGxlciBmb3Igcm91dGVzIGF0IC9ncm91cHNlc3Npb25cbiAgICBHcm91cHNlc3Npb25Db250cm9sbGVyOiB7XG5cdFx0XHQvL2dyb3Vwc2Vzc2lvbi9pbmRleFxuICAgICAgZ2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWRpdGFibGUgPSByZXF1aXJlKCcuL3V0aWwvZWRpdGFibGUnKTtcblx0XHRcdFx0ZWRpdGFibGUuaW5pdCgpO1xuXHRcdFx0XHR2YXIgc2l0ZSA9IHJlcXVpcmUoJy4vdXRpbC9zaXRlJyk7XG5cdFx0XHRcdHNpdGUuY2hlY2tNZXNzYWdlKCk7XG4gICAgICB9LFxuXHRcdFx0Ly9ncm91cHNlc2lvbi9saXN0XG5cdFx0XHRnZXRMaXN0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGdyb3Vwc2Vzc2lvbiA9IHJlcXVpcmUoJy4vcGFnZXMvZ3JvdXBzZXNzaW9uJyk7XG5cdFx0XHRcdGdyb3Vwc2Vzc2lvbi5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHQvL1Byb2ZpbGVzIENvbnRyb2xsZXIgZm9yIHJvdXRlcyBhdCAvcHJvZmlsZVxuXHRcdFByb2ZpbGVzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9wcm9maWxlL2luZGV4XG5cdFx0XHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwcm9maWxlID0gcmVxdWlyZSgnLi9wYWdlcy9wcm9maWxlJyk7XG5cdFx0XHRcdHByb2ZpbGUuaW5pdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL0Rhc2hib2FyZCBDb250cm9sbGVyIGZvciByb3V0ZXMgYXQgL2FkbWluLWx0ZVxuXHRcdERhc2hib2FyZENvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vaW5kZXhcblx0XHRcdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4vdXRpbC9kYXNoYm9hcmQnKTtcblx0XHRcdFx0ZGFzaGJvYXJkLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFN0dWRlbnRzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9zdHVkZW50c1xuXHRcdFx0Z2V0U3R1ZGVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3R1ZGVudGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zdHVkZW50ZWRpdCcpO1xuXHRcdFx0XHRzdHVkZW50ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdzdHVkZW50XG5cdFx0XHRnZXROZXdzdHVkZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN0dWRlbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvc3R1ZGVudGVkaXQnKTtcblx0XHRcdFx0c3R1ZGVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0QWR2aXNvcnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2Fkdmlzb3JzXG5cdFx0XHRnZXRBZHZpc29yczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhZHZpc29yZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2Fkdmlzb3JlZGl0Jyk7XG5cdFx0XHRcdGFkdmlzb3JlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2Fkdmlzb3Jcblx0XHRcdGdldE5ld2Fkdmlzb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYWR2aXNvcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9hZHZpc29yZWRpdCcpO1xuXHRcdFx0XHRhZHZpc29yZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHREZXBhcnRtZW50c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZGVwYXJ0bWVudHNcblx0XHRcdGdldERlcGFydG1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlcGFydG1lbnRlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVwYXJ0bWVudGVkaXQnKTtcblx0XHRcdFx0ZGVwYXJ0bWVudGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVwYXJ0bWVudFxuXHRcdFx0Z2V0TmV3ZGVwYXJ0bWVudDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBkZXBhcnRtZW50ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2RlcGFydG1lbnRlZGl0Jyk7XG5cdFx0XHRcdGRlcGFydG1lbnRlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdE1lZXRpbmdzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9tZWV0aW5nc1xuXHRcdFx0Z2V0TWVldGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgbWVldGluZ2VkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9tZWV0aW5nZWRpdCcpO1xuXHRcdFx0XHRtZWV0aW5nZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRCbGFja291dHNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL2JsYWNrb3V0c1xuXHRcdFx0Z2V0QmxhY2tvdXRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGJsYWNrb3V0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdCcpO1xuXHRcdFx0XHRibGFja291dGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0R3JvdXBzZXNzaW9uc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZ3JvdXBzZXNzaW9uc1xuXHRcdFx0Z2V0R3JvdXBzZXNzaW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBncm91cHNlc3Npb25lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdCcpO1xuXHRcdFx0XHRncm91cHNlc3Npb25lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0fSxcblxuXHRcdFNldHRpbmdzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9zZXR0aW5nc1xuXHRcdFx0Z2V0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9zZXR0aW5ncycpO1xuXHRcdFx0XHRzZXR0aW5ncy5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHREZWdyZWVwcm9ncmFtc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbXNcblx0XHRcdGdldERlZ3JlZXByb2dyYW1zOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbS97aWR9XG5cdFx0XHRnZXREZWdyZWVwcm9ncmFtRGV0YWlsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWRldGFpbCcpO1xuXHRcdFx0XHRkZWdyZWVwcm9ncmFtZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9uZXdkZWdyZWVwcm9ncmFtXG5cdFx0XHRnZXROZXdkZWdyZWVwcm9ncmFtOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGRlZ3JlZXByb2dyYW1lZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZGVncmVlcHJvZ3JhbWVkaXQnKTtcblx0XHRcdFx0ZGVncmVlcHJvZ3JhbWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0RWxlY3RpdmVsaXN0c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vZGVncmVlcHJvZ3JhbXNcblx0XHRcdGdldEVsZWN0aXZlbGlzdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZWxlY3RpdmVsaXN0ZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL2VsZWN0aXZlbGlzdGVkaXQnKTtcblx0XHRcdFx0ZWxlY3RpdmVsaXN0ZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Ly9hZG1pbi9kZWdyZWVwcm9ncmFtL3tpZH1cblx0XHRcdGdldEVsZWN0aXZlbGlzdERldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVjdGl2ZWxpc3RlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZGV0YWlsJyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHRcdC8vYWRtaW4vbmV3ZGVncmVlcHJvZ3JhbVxuXHRcdFx0Z2V0TmV3ZWxlY3RpdmVsaXN0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGVsZWN0aXZlbGlzdGVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9lbGVjdGl2ZWxpc3RlZGl0Jyk7XG5cdFx0XHRcdGVsZWN0aXZlbGlzdGVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0UGxhbnNDb250cm9sbGVyOiB7XG5cdFx0XHQvL2FkbWluL3BsYW5zXG5cdFx0XHRnZXRQbGFuczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZWRpdCA9IHJlcXVpcmUoJy4vcGFnZXMvZGFzaGJvYXJkL3BsYW5lZGl0Jyk7XG5cdFx0XHRcdHBsYW5lZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL3BsYW4ve2lkfVxuXHRcdFx0Z2V0UGxhbkRldGFpbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuZGV0YWlsID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbmRldGFpbCcpO1xuXHRcdFx0XHRwbGFuZGV0YWlsLmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld3BsYW5cblx0XHRcdGdldE5ld3BsYW46IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgcGxhbmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZWRpdCcpO1xuXHRcdFx0XHRwbGFuZWRpdC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdH0sXG5cblx0XHRQbGFuc2VtZXN0ZXJzQ29udHJvbGxlcjoge1xuXHRcdFx0Ly9hZG1pbi9wbGFuc2VtZXN0ZXJcblx0XHRcdGdldFBsYW5TZW1lc3RlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBwbGFuc2VtZXN0ZXJlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvcGxhbnNlbWVzdGVyZWRpdCcpO1xuXHRcdFx0XHRwbGFuc2VtZXN0ZXJlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld3BsYW5zZW1lc3RlclxuXHRcdFx0Z2V0TmV3UGxhblNlbWVzdGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHBsYW5zZW1lc3RlcmVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9wbGFuc2VtZXN0ZXJlZGl0Jyk7XG5cdFx0XHRcdHBsYW5zZW1lc3RlcmVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Q29tcGxldGVkY291cnNlc0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vYWRtaW4vY29tcGxldGVkY291cnNlc1xuXHRcdFx0Z2V0Q29tcGxldGVkY291cnNlczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb21wbGV0ZWRjb3Vyc2VlZGl0ID0gcmVxdWlyZSgnLi9wYWdlcy9kYXNoYm9hcmQvY29tcGxldGVkY291cnNlZWRpdCcpO1xuXHRcdFx0XHRjb21wbGV0ZWRjb3Vyc2VlZGl0LmluaXQoKTtcblx0XHRcdH0sXG5cdFx0XHQvL2FkbWluL25ld2NvbXBsZXRlZGNvdXJzZVxuXHRcdFx0Z2V0TmV3Y29tcGxldGVkY291cnNlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNvbXBsZXRlZGNvdXJzZWVkaXQgPSByZXF1aXJlKCcuL3BhZ2VzL2Rhc2hib2FyZC9jb21wbGV0ZWRjb3Vyc2VlZGl0Jyk7XG5cdFx0XHRcdGNvbXBsZXRlZGNvdXJzZWVkaXQuaW5pdCgpO1xuXHRcdFx0fSxcblx0XHR9LFxuXG5cdFx0Rmxvd2NoYXJ0c0NvbnRyb2xsZXI6IHtcblx0XHRcdC8vZmxvd2NoYXJ0cy92aWV3L1xuXHRcdFx0Z2V0Rmxvd2NoYXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGZsb3djaGFydCA9IHJlcXVpcmUoJy4vcGFnZXMvZmxvd2NoYXJ0Jyk7XG5cdFx0XHRcdGZsb3djaGFydC5pbml0KCk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgZmxvd2NoYXJ0ID0gcmVxdWlyZSgnLi9wYWdlcy9mbG93Y2hhcnRsaXN0Jyk7XG5cdFx0XHRcdGZsb3djaGFydC5pbml0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHR9LFxuXG5cdC8vRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYnkgdGhlIHBhZ2UgYXQgbG9hZC4gRGVmaW5lZCBpbiByZXNvdXJjZXMvdmlld3MvaW5jbHVkZXMvc2NyaXB0cy5ibGFkZS5waHBcblx0Ly9hbmQgQXBwL0h0dHAvVmlld0NvbXBvc2Vycy9KYXZhc2NyaXB0IENvbXBvc2VyXG5cdC8vU2VlIGxpbmtzIGF0IHRvcCBvZiBmaWxlIGZvciBkZXNjcmlwdGlvbiBvZiB3aGF0J3MgZ29pbmcgb24gaGVyZVxuXHQvL0Fzc3VtZXMgMiBpbnB1dHMgLSB0aGUgY29udHJvbGxlciBhbmQgYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzIHBhZ2Vcblx0aW5pdDogZnVuY3Rpb24oY29udHJvbGxlciwgYWN0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl0gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB0aGlzLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vY2FsbCB0aGUgbWF0Y2hpbmcgZnVuY3Rpb24gaW4gdGhlIGFycmF5IGFib3ZlXG5cdFx0XHRyZXR1cm4gQXBwLmFjdGlvbnNbY29udHJvbGxlcl1bYWN0aW9uXSgpO1xuXHRcdH1cblx0fSxcbn07XG5cbi8vQmluZCB0byB0aGUgd2luZG93XG53aW5kb3cuQXBwID0gQXBwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9hcHAuanMiLCJ3aW5kb3cuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgalF1ZXJ5IGFuZCB0aGUgQm9vdHN0cmFwIGpRdWVyeSBwbHVnaW4gd2hpY2ggcHJvdmlkZXMgc3VwcG9ydFxuICogZm9yIEphdmFTY3JpcHQgYmFzZWQgQm9vdHN0cmFwIGZlYXR1cmVzIHN1Y2ggYXMgbW9kYWxzIGFuZCB0YWJzLiBUaGlzXG4gKiBjb2RlIG1heSBiZSBtb2RpZmllZCB0byBmaXQgdGhlIHNwZWNpZmljIG5lZWRzIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKi9cblxud2luZG93LiQgPSB3aW5kb3cualF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4vKipcbiAqIFdlJ2xsIGxvYWQgdGhlIGF4aW9zIEhUVFAgbGlicmFyeSB3aGljaCBhbGxvd3MgdXMgdG8gZWFzaWx5IGlzc3VlIHJlcXVlc3RzXG4gKiB0byBvdXIgTGFyYXZlbCBiYWNrLWVuZC4gVGhpcyBsaWJyYXJ5IGF1dG9tYXRpY2FsbHkgaGFuZGxlcyBzZW5kaW5nIHRoZVxuICogQ1NSRiB0b2tlbiBhcyBhIGhlYWRlciBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIFwiWFNSRlwiIHRva2VuIGNvb2tpZS5cbiAqL1xuXG53aW5kb3cuYXhpb3MgPSByZXF1aXJlKCdheGlvcycpO1xuXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9yYXBwYXNvZnQvbGFyYXZlbC01LWJvaWxlcnBsYXRlL2Jsb2IvbWFzdGVyL3Jlc291cmNlcy9hc3NldHMvanMvYm9vdHN0cmFwLmpzXG53aW5kb3cuYXhpb3MuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbi8qKlxuICogTmV4dCB3ZSB3aWxsIHJlZ2lzdGVyIHRoZSBDU1JGIFRva2VuIGFzIGEgY29tbW9uIGhlYWRlciB3aXRoIEF4aW9zIHNvIHRoYXRcbiAqIGFsbCBvdXRnb2luZyBIVFRQIHJlcXVlc3RzIGF1dG9tYXRpY2FsbHkgaGF2ZSBpdCBhdHRhY2hlZC4gVGhpcyBpcyBqdXN0XG4gKiBhIHNpbXBsZSBjb252ZW5pZW5jZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGF0dGFjaCBldmVyeSB0b2tlbiBtYW51YWxseS5cbiAqL1xuXG5sZXQgdG9rZW4gPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKTtcblxuaWYgKHRva2VuKSB7XG4gICAgd2luZG93LmF4aW9zLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLUNTUkYtVE9LRU4nXSA9IHRva2VuLmNvbnRlbnQ7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NTUkYgdG9rZW4gbm90IGZvdW5kOiBodHRwczovL2xhcmF2ZWwuY29tL2RvY3MvY3NyZiNjc3JmLXgtY3NyZi10b2tlbicpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9ib290c3RyYXAuanMiLCIvL2xvYWQgcmVxdWlyZWQgSlMgbGlicmFyaWVzXG5yZXF1aXJlKCdmdWxsY2FsZW5kYXInKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcbnZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG5yZXF1aXJlKCdlb25hc2Rhbi1ib290c3RyYXAtZGF0ZXRpbWVwaWNrZXItcnVzc2ZlbGQnKTtcbnZhciBlZGl0YWJsZSA9IHJlcXVpcmUoJy4uL3V0aWwvZWRpdGFibGUnKTtcblxuLy9TZXNzaW9uIGZvciBzdG9yaW5nIGRhdGEgYmV0d2VlbiBmb3Jtc1xuZXhwb3J0cy5jYWxlbmRhclNlc3Npb24gPSB7fTtcblxuLy9JRCBvZiB0aGUgY3VycmVudGx5IGxvYWRlZCBjYWxlbmRhcidzIGFkdmlzb3JcbmV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQgPSAtMTtcblxuLy9TdHVkZW50J3MgTmFtZSBzZXQgYnkgaW5pdFxuZXhwb3J0cy5jYWxlbmRhclN0dWRlbnROYW1lID0gXCJcIjtcblxuLy9Db25maWd1cmF0aW9uIGRhdGEgZm9yIGZ1bGxjYWxlbmRhciBpbnN0YW5jZVxuZXhwb3J0cy5jYWxlbmRhckRhdGEgPSB7XG5cdGhlYWRlcjoge1xuXHRcdGxlZnQ6ICdwcmV2LG5leHQgdG9kYXknLFxuXHRcdGNlbnRlcjogJ3RpdGxlJyxcblx0XHRyaWdodDogJ2FnZW5kYVdlZWssYWdlbmRhRGF5J1xuXHR9LFxuXHRlZGl0YWJsZTogZmFsc2UsXG5cdGV2ZW50TGltaXQ6IHRydWUsXG5cdGhlaWdodDogJ2F1dG8nLFxuXHR3ZWVrZW5kczogZmFsc2UsXG5cdGJ1c2luZXNzSG91cnM6IHtcblx0XHRzdGFydDogJzg6MDAnLCAvLyBhIHN0YXJ0IHRpbWUgKDEwYW0gaW4gdGhpcyBleGFtcGxlKVxuXHRcdGVuZDogJzE3OjAwJywgLy8gYW4gZW5kIHRpbWUgKDZwbSBpbiB0aGlzIGV4YW1wbGUpXG5cdFx0ZG93OiBbIDEsIDIsIDMsIDQsIDUgXVxuXHR9LFxuXHRkZWZhdWx0VmlldzogJ2FnZW5kYVdlZWsnLFxuXHR2aWV3czoge1xuXHRcdGFnZW5kYToge1xuXHRcdFx0YWxsRGF5U2xvdDogZmFsc2UsXG5cdFx0XHRzbG90RHVyYXRpb246ICcwMDoyMDowMCcsXG5cdFx0XHRtaW5UaW1lOiAnMDg6MDA6MDAnLFxuXHRcdFx0bWF4VGltZTogJzE3OjAwOjAwJ1xuXHRcdH1cblx0fSxcblx0ZXZlbnRTb3VyY2VzOiBbXG5cdFx0e1xuXHRcdFx0dXJsOiAnL2FkdmlzaW5nL21lZXRpbmdmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgbWVldGluZyBldmVudHMgZnJvbSBkYXRhYmFzZScpO1xuXHRcdFx0fSxcblx0XHRcdGNvbG9yOiAnIzUxMjg4OCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICd3aGl0ZScsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1cmw6ICcvYWR2aXNpbmcvYmxhY2tvdXRmZWVkJyxcblx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgZmV0Y2hpbmcgYmxhY2tvdXQgZXZlbnRzIGZyb20gZGF0YWJhc2UnKTtcblx0XHRcdH0sXG5cdFx0XHRjb2xvcjogJyNGRjg4ODgnLFxuXHRcdFx0dGV4dENvbG9yOiAnYmxhY2snLFxuXHRcdH0sXG5cdF0sXG5cdHNlbGVjdGFibGU6IHRydWUsXG5cdHNlbGVjdEhlbHBlcjogdHJ1ZSxcblx0c2VsZWN0T3ZlcmxhcDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRyZXR1cm4gZXZlbnQucmVuZGVyaW5nID09PSAnYmFja2dyb3VuZCc7XG5cdH0sXG5cdHRpbWVGb3JtYXQ6ICcgJyxcbn07XG5cbi8vQ29uZmlndXJhdGlvbiBkYXRhIGZvciBkYXRlcGlja2VyIGluc3RhbmNlXG5leHBvcnRzLmRhdGVQaWNrZXJEYXRhID0ge1xuXHRcdGRheXNPZldlZWtEaXNhYmxlZDogWzAsIDZdLFxuXHRcdGZvcm1hdDogJ0xMTCcsXG5cdFx0c3RlcHBpbmc6IDIwLFxuXHRcdGVuYWJsZWRIb3VyczogWzgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxN10sXG5cdFx0bWF4SG91cjogMTcsXG5cdFx0c2lkZUJ5U2lkZTogdHJ1ZSxcblx0XHRpZ25vcmVSZWFkb25seTogdHJ1ZSxcblx0XHRhbGxvd0lucHV0VG9nZ2xlOiB0cnVlXG59O1xuXG4vL0NvbmZpZ3VyYXRpb24gZGF0YSBmb3IgZGF0ZXBpY2tlciBpbnN0YW5jZSBkYXkgb25seVxuZXhwb3J0cy5kYXRlUGlja2VyRGF0ZU9ubHkgPSB7XG5cdFx0ZGF5c09mV2Vla0Rpc2FibGVkOiBbMCwgNl0sXG5cdFx0Zm9ybWF0OiAnTU0vREQvWVlZWScsXG5cdFx0aWdub3JlUmVhZG9ubHk6IHRydWUsXG5cdFx0YWxsb3dJbnB1dFRvZ2dsZTogdHJ1ZVxufTtcblxuLyoqXG4gKiBJbml0aWFsemF0aW9uIGZ1bmN0aW9uIGZvciBmdWxsY2FsZW5kYXIgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0gYWR2aXNvciAtIGJvb2xlYW4gdHJ1ZSBpZiB0aGUgdXNlciBpcyBhbiBhZHZpc29yXG4gKiBAcGFyYW0gbm9iaW5kIC0gYm9vbGVhbiB0cnVlIGlmIHRoZSBidXR0b25zIHNob3VsZCBub3QgYmUgYm91bmQgKG1ha2UgY2FsZW5kYXIgcmVhZC1vbmx5KVxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vQ2hlY2sgZm9yIG1lc3NhZ2VzIGluIHRoZSBzZXNzaW9uIGZyb20gYSBwcmV2aW91cyBhY3Rpb25cblx0c2l0ZS5jaGVja01lc3NhZ2UoKTtcblxuXHQvL2luaXRhbGl6ZSBlZGl0YWJsZSBlbGVtZW50c1xuXHRlZGl0YWJsZS5pbml0KCk7XG5cblx0Ly90d2VhayBwYXJhbWV0ZXJzXG5cdHdpbmRvdy5hZHZpc29yIHx8ICh3aW5kb3cuYWR2aXNvciA9IGZhbHNlKTtcblx0d2luZG93Lm5vYmluZCB8fCAod2luZG93Lm5vYmluZCA9IGZhbHNlKTtcblxuXHQvL2dldCB0aGUgY3VycmVudCBhZHZpc29yJ3MgSURcblx0ZXhwb3J0cy5jYWxlbmRhckFkdmlzb3JJRCA9ICQoJyNjYWxlbmRhckFkdmlzb3JJRCcpLnZhbCgpLnRyaW0oKTtcblxuXHQvL1NldCB0aGUgYWR2aXNvciBpbmZvcm1hdGlvbiBmb3IgbWVldGluZyBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzBdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vU2V0IHRoZSBhZHZzaW9yIGluZm9yYW10aW9uIGZvciBibGFja291dCBldmVudCBzb3VyY2Vcblx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLmRhdGEgPSB7aWQ6IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUR9O1xuXG5cdC8vaWYgdGhlIHdpbmRvdyBpcyBzbWFsbCwgc2V0IGRpZmZlcmVudCBkZWZhdWx0IGZvciBjYWxlbmRhclxuXHRpZigkKHdpbmRvdykud2lkdGgoKSA8IDYwMCl7XG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZGVmYXVsdFZpZXcgPSAnYWdlbmRhRGF5Jztcblx0fVxuXG5cdC8vSWYgbm9iaW5kLCBkb24ndCBiaW5kIHRoZSBmb3Jtc1xuXHRpZighd2luZG93Lm5vYmluZCl7XG5cdFx0Ly9JZiB0aGUgY3VycmVudCB1c2VyIGlzIGFuIGFkdmlzb3IsIGJpbmQgbW9yZSBkYXRhXG5cdFx0aWYod2luZG93LmFkdmlzb3Ipe1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjdGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vRW5hYmxlIGFuZCBkaXNhYmxlIGNlcnRhaW4gZm9ybSBmaWVsZHMgYmFzZWQgb24gdXNlclxuXHRcdFx0JCgnI3RpdGxlJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHQkKCcjc3RhcnQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdHVkZW50aWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNzdGFydF9zcGFuJykucmVtb3ZlQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoJyNlbmQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdCQoJyNlbmRfc3BhbicpLnJlbW92ZUNsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2Jykuc2hvdygpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLnNob3coKTtcblxuXHRcdFx0Ly9iaW5kIHRoZSByZXNldCBmb3JtIG1ldGhvZFxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ2hpZGRlbi5icy5tb2RhbCcsIHJlc2V0Rm9ybSk7XG5cblx0XHRcdC8vYmluZCBtZXRob2RzIGZvciBidXR0b25zIGFuZCBmb3Jtc1xuXHRcdFx0JCgnI25ld1N0dWRlbnRCdXR0b24nKS5iaW5kKCdjbGljaycsIG5ld1N0dWRlbnQpO1xuXG5cdFx0XHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQoJyNidGl0bGUnKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVCbGFja291dCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5oaWRlKCk7XG5cdFx0XHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0XHRcdFx0JCh0aGlzKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKTtcblx0XHRcdCAgICAkKHRoaXMpLmZpbmQoJy5oYXMtZXJyb3InKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKHRoaXMpLmZpbmQoJy5oZWxwLWJsb2NrJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdCQodGhpcykudGV4dCgnJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNjcmVhdGVFdmVudCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBsb2FkQ29uZmxpY3RzKTtcblxuXHRcdFx0JCgnI3Jlc29sdmVDb25mbGljdCcpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL2JpbmQgYXV0b2NvbXBsZXRlIGZpZWxkXG5cdFx0XHQkKCcjc3R1ZGVudGlkJykuYXV0b2NvbXBsZXRlKHtcblx0XHRcdCAgICBzZXJ2aWNlVXJsOiAnL3Byb2ZpbGUvc3R1ZGVudGZlZWQnLFxuXHRcdFx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHRcdFx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdFx0XHQgICAgfSxcblx0XHRcdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0XHRcdCAgICAgICAgJCgnI3N0dWRlbnRpZHZhbCcpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuXHRcdFx0ICAgIH0sXG5cdFx0XHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0ICAgICAgICByZXR1cm4ge1xuXHRcdFx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdFx0XHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdFx0XHQgICAgICAgICAgICB9KVxuXHRcdFx0ICAgICAgICB9O1xuXHRcdFx0ICAgIH1cblx0XHRcdH0pO1xuXG5cdFx0XHQkKCcjc3RhcnRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0ICAkKCcjZW5kX2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCBcdGxpbmtEYXRlUGlja2VycygnI3N0YXJ0JywgJyNlbmQnLCAnI2R1cmF0aW9uJyk7XG5cblx0XHQgXHQkKCcjYnN0YXJ0X2RhdGVwaWNrZXInKS5kYXRldGltZXBpY2tlcihleHBvcnRzLmRhdGVQaWNrZXJEYXRhKTtcblxuXHRcdCAgJCgnI2JlbmRfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGEpO1xuXG5cdFx0IFx0bGlua0RhdGVQaWNrZXJzKCcjYnN0YXJ0JywgJyNiZW5kJywgJyNiZHVyYXRpb24nKTtcblxuXHRcdCBcdCQoJyNicmVwZWF0dW50aWxfZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKGV4cG9ydHMuZGF0ZVBpY2tlckRhdGVPbmx5KTtcblxuXHRcdFx0Ly9jaGFuZ2UgcmVuZGVyaW5nIG9mIGV2ZW50c1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRSZW5kZXIgPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCl7XG5cdFx0XHRcdGVsZW1lbnQuYWRkQ2xhc3MoXCJmYy1jbGlja2FibGVcIik7XG5cdFx0XHR9O1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAnbScpe1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWQnKS52YWwoZXZlbnQuc3R1ZGVudG5hbWUpO1xuXHRcdFx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdFx0XHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHRcdFx0fWVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0XHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHtcblx0XHRcdFx0XHRcdGV2ZW50OiBldmVudFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYoZXZlbnQucmVwZWF0ID09ICcwJyl7XG5cdFx0XHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiBzdGFydCxcblx0XHRcdFx0XHRlbmQ6IGVuZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgtMSk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvL2JpbmQgbW9yZSBidXR0b25zXG5cdFx0XHQkKCcjYnJlcGVhdCcpLmNoYW5nZShyZXBlYXRDaGFuZ2UpO1xuXG5cdFx0XHQkKCcjc2F2ZUJsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBzYXZlQmxhY2tvdXQpO1xuXG5cdFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZUJsYWNrb3V0KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0U2VyaWVzJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHRibGFja291dFNlcmllcygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNibGFja291dE9jY3VycmVuY2UnKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJyNibGFja291dE9wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHRcdGJsYWNrb3V0T2NjdXJyZW5jZSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoJyNhZHZpc2luZ0J1dHRvbicpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnI21lZXRpbmdPcHRpb24nKS5vZmYoJ2hpZGRlbi5icy5tb2RhbCcpO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZU1lZXRpbmdCdG4nKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge307XG5cdFx0XHRcdGNyZWF0ZU1lZXRpbmdGb3JtKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2JsYWNrb3V0QnV0dG9uJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm9mZignaGlkZGVuLmJzLm1vZGFsJyk7XG5cdFx0XHRcdCQoJyNtZWV0aW5nT3B0aW9uJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0Y3JlYXRlQmxhY2tvdXRGb3JtKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkKCcjbWVldGluZ09wdGlvbicpLm1vZGFsKCdoaWRlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0QnRuJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuXHRcdFx0XHRleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbiA9IHt9O1xuXHRcdFx0XHRjcmVhdGVCbGFja291dEZvcm0oKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdCQoJyNyZXNvbHZlQnV0dG9uJykub24oJ2NsaWNrJywgcmVzb2x2ZUNvbmZsaWN0cyk7XG5cblx0XHRcdGxvYWRDb25mbGljdHMoKTtcblxuXHRcdC8vSWYgdGhlIGN1cnJlbnQgdXNlciBpcyBub3QgYW4gYWR2aXNvciwgYmluZCBsZXNzIGRhdGFcblx0XHR9ZWxzZXtcblxuXHRcdFx0Ly9HZXQgdGhlIGN1cnJlbnQgc3R1ZGVudCdzIG5hbWVcblx0XHRcdGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSA9ICQoJyNjYWxlbmRhclN0dWRlbnROYW1lJykudmFsKCkudHJpbSgpO1xuXG5cdFx0ICAvL1JlbmRlciBibGFja291dHMgdG8gYmFja2dyb3VuZFxuXHRcdCAgZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcblxuXHRcdCAgLy9XaGVuIHJlbmRlcmluZywgdXNlIHRoaXMgY3VzdG9tIGZ1bmN0aW9uIGZvciBibGFja291dHMgYW5kIHN0dWRlbnQgbWVldGluZ3Ncblx0XHQgIGV4cG9ydHMuY2FsZW5kYXJEYXRhLmV2ZW50UmVuZGVyID0gZnVuY3Rpb24oZXZlbnQsIGVsZW1lbnQpe1xuXHRcdCAgICBpZihldmVudC50eXBlID09ICdiJyl7XG5cdFx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHRcdCAgICB9XG5cdFx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ3MnKXtcblx0XHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdFx0ICAgIH1cblx0XHRcdH07XG5cblx0XHQgIC8vVXNlIHRoaXMgbWV0aG9kIGZvciBjbGlja2luZyBvbiBtZWV0aW5nc1xuXHRcdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRDbGljayA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50LCB2aWV3KXtcblx0XHRcdFx0aWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHRcdFx0XHRcdGlmKGV2ZW50LnN0YXJ0LmlzQWZ0ZXIobW9tZW50KCkpKXtcblx0XHRcdFx0XHRcdHNob3dNZWV0aW5nRm9ybShldmVudCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydChcIllvdSBjYW5ub3QgZWRpdCBtZWV0aW5ncyBpbiB0aGUgcGFzdFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHQgIC8vV2hlbiBzZWxlY3RpbmcgbmV3IGFyZWFzLCB1c2UgdGhlIHN0dWRlbnRTZWxlY3QgbWV0aG9kIGluIHRoZSBjYWxlbmRhciBsaWJyYXJ5XG5cdFx0XHRleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3QgPSBzdHVkZW50U2VsZWN0O1xuXG5cdFx0XHQvL1doZW4gdGhlIGNyZWF0ZSBldmVudCBidXR0b24gaXMgY2xpY2tlZCwgc2hvdyB0aGUgbW9kYWwgZm9ybVxuXHRcdFx0JCgnI2NyZWF0ZUV2ZW50Jykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0ICAkKCcjZGVzYycpLmZvY3VzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9FbmFibGUgYW5kIGRpc2FibGUgY2VydGFpbiBmb3JtIGZpZWxkcyBiYXNlZCBvbiB1c2VyXG5cdFx0XHQkKCcjdGl0bGUnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JChcIiNzdGFydFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0JCgnI3N0dWRlbnRpZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI3N0YXJ0X3NwYW5cIikuYWRkQ2xhc3MoJ2RhdGVwaWNrZXItZGlzYWJsZWQnKTtcblx0XHRcdCQoXCIjZW5kXCIpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHQkKFwiI2VuZF9zcGFuXCIpLmFkZENsYXNzKCdkYXRlcGlja2VyLWRpc2FibGVkJyk7XG5cdFx0XHQkKCcjc3R1ZGVudGlkZGl2JykuaGlkZSgpO1xuXHRcdFx0JCgnI3N0YXR1c2RpdicpLmhpZGUoKTtcblx0XHRcdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdFx0XHQvL2JpbmQgdGhlIHJlc2V0IGZvcm0gbWV0aG9kXG5cdFx0XHQkKCcubW9kYWwnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblx0XHR9XG5cblx0XHQvL0JpbmQgY2xpY2sgaGFuZGxlcnMgb24gdGhlIGZvcm1cblx0XHQkKCcjc2F2ZUJ1dHRvbicpLmJpbmQoJ2NsaWNrJywgc2F2ZU1lZXRpbmcpO1xuXHRcdCQoJyNkZWxldGVCdXR0b24nKS5iaW5kKCdjbGljaycsIGRlbGV0ZU1lZXRpbmcpO1xuXHRcdCQoJyNkdXJhdGlvbicpLm9uKCdjaGFuZ2UnLCBjaGFuZ2VEdXJhdGlvbik7XG5cblx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycyB3aXRoIG5vIGJpbmRpbmdcblx0fWVsc2V7XG5cdFx0Ly9mb3IgcmVhZC1vbmx5IGNhbGVuZGFycywgc2V0IHJlbmRlcmluZyB0byBiYWNrZ3JvdW5kXG5cdFx0ZXhwb3J0cy5jYWxlbmRhckRhdGEuZXZlbnRTb3VyY2VzWzFdLnJlbmRlcmluZyA9ICdiYWNrZ3JvdW5kJztcbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5zZWxlY3RhYmxlID0gZmFsc2U7XG5cbiAgICBleHBvcnRzLmNhbGVuZGFyRGF0YS5ldmVudFJlbmRlciA9IGZ1bmN0aW9uKGV2ZW50LCBlbGVtZW50KXtcblx0ICAgIGlmKGV2ZW50LnR5cGUgPT0gJ2InKXtcblx0ICAgICAgICBlbGVtZW50LmFwcGVuZChcIjxkaXYgc3R5bGU9XFxcImNvbG9yOiAjMDAwMDAwOyB6LWluZGV4OiA1O1xcXCI+XCIgKyBldmVudC50aXRsZSArIFwiPC9kaXY+XCIpO1xuXHQgICAgfVxuXHQgICAgaWYoZXZlbnQudHlwZSA9PSAncycpe1xuXHQgICAgXHRlbGVtZW50LmFkZENsYXNzKFwiZmMtZ3JlZW5cIik7XG5cdCAgICB9XG5cdFx0fTtcblx0fVxuXG5cdC8vaW5pdGFsaXplIHRoZSBjYWxlbmRhciFcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKGV4cG9ydHMuY2FsZW5kYXJEYXRhKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCBjYWxlbmRhciBieSBjbG9zaW5nIG1vZGFscyBhbmQgcmVsb2FkaW5nIGRhdGFcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBqUXVlcnkgaWRlbnRpZmllciBvZiB0aGUgZm9ybSB0byBoaWRlIChhbmQgdGhlIHNwaW4pXG4gKiBAcGFyYW0gcmVwb25zZSAtIHRoZSBBeGlvcyByZXBzb25zZSBvYmplY3QgcmVjZWl2ZWRcbiAqL1xudmFyIHJlc2V0Q2FsZW5kYXIgPSBmdW5jdGlvbihlbGVtZW50LCByZXNwb25zZSl7XG5cdC8vaGlkZSB0aGUgZm9ybVxuXHQkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG5cblx0Ly9kaXNwbGF5IHRoZSBtZXNzYWdlIHRvIHRoZSB1c2VyXG5cdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXG5cdC8vcmVmcmVzaCB0aGUgY2FsZW5kYXJcblx0JCgnI2NhbGVuZGFyJykuZnVsbENhbGVuZGFyKCd1bnNlbGVjdCcpO1xuXHQkKCcjY2FsZW5kYXInKS5mdWxsQ2FsZW5kYXIoJ3JlZmV0Y2hFdmVudHMnKTtcblx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0aWYod2luZG93LmFkdmlzb3Ipe1xuXHRcdGxvYWRDb25mbGljdHMoKTtcblx0fVxufVxuXG4vKipcbiAqIEFKQVggbWV0aG9kIHRvIHNhdmUgZGF0YSBmcm9tIGEgZm9ybVxuICpcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhlIGRhdGEgdG9cbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEgb2JqZWN0IHRvIHNlbmRcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIHNvdXJjZSBlbGVtZW50IG9mIHRoZSBkYXRhXG4gKiBAcGFyYW0gYWN0aW9uIC0gdGhlIHN0cmluZyBkZXNjcmlwdGlvbiBvZiB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4U2F2ZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZWxlbWVudCwgYWN0aW9uKXtcblx0Ly9BSkFYIFBPU1QgdG8gc2VydmVyXG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0ICAvL2lmIHJlc3BvbnNlIGlzIDJ4eFxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdH0pXG5cdFx0Ly9pZiByZXNwb25zZSBpcyBub3QgMnh4XG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCBlbGVtZW50LCBlcnJvcik7XG5cdFx0fSk7XG59XG5cbnZhciBhamF4RGVsZXRlID0gZnVuY3Rpb24odXJsLCBkYXRhLCBlbGVtZW50LCBhY3Rpb24sIG5vUmVzZXQsIG5vQ2hvaWNlKXtcblx0Ly9jaGVjayBub1Jlc2V0IHZhcmlhYmxlXG5cdG5vUmVzZXQgfHwgKG5vUmVzZXQgPSBmYWxzZSk7XG5cdG5vQ2hvaWNlIHx8IChub0Nob2ljZSA9IGZhbHNlKTtcblxuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgY29uZmlybWF0aW9uXG5cdGlmKCFub0Nob2ljZSl7XG5cdFx0dmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/XCIpO1xuXHR9ZWxzZXtcblx0XHR2YXIgY2hvaWNlID0gdHJ1ZTtcblx0fVxuXG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cblx0XHQvL2lmIGNvbmZpcm1lZCwgc2hvdyBzcGlubmluZyBpY29uXG5cdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL21ha2UgQUpBWCByZXF1ZXN0IHRvIGRlbGV0ZVxuXHRcdHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYobm9SZXNldCl7XG5cdFx0XHRcdFx0Ly9oaWRlIHBhcmVudCBlbGVtZW50IC0gVE9ETyBURVNUTUVcblx0XHRcdFx0XHQvL2NhbGxlci5wYXJlbnQoKS5wYXJlbnQoKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdFx0JChlbGVtZW50KS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdHJlc2V0Q2FsZW5kYXIoZWxlbWVudCwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcihhY3Rpb24sIGVsZW1lbnQsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2F2ZSBhIG1lZXRpbmdcbiAqL1xudmFyIHNhdmVNZWV0aW5nID0gZnVuY3Rpb24oKXtcblxuXHQvL1Nob3cgdGhlIHNwaW5uaW5nIHN0YXR1cyBpY29uIHdoaWxlIHdvcmtpbmdcblx0JCgnI2NyZWF0ZUV2ZW50c3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHQvL2J1aWxkIHRoZSBkYXRhIG9iamVjdCBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdHN0YXJ0OiBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksIFwiTExMXCIpLmZvcm1hdCgpLFxuXHRcdGVuZDogbW9tZW50KCQoJyNlbmQnKS52YWwoKSwgXCJMTExcIikuZm9ybWF0KCksXG5cdFx0dGl0bGU6ICQoJyN0aXRsZScpLnZhbCgpLFxuXHRcdGRlc2M6ICQoJyNkZXNjJykudmFsKCksXG5cdFx0c3RhdHVzOiAkKCcjc3RhdHVzJykudmFsKClcblx0fTtcblx0ZGF0YS5pZCA9IGV4cG9ydHMuY2FsZW5kYXJBZHZpc29ySUQ7XG5cdGlmKCQoJyNtZWV0aW5nSUQnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEubWVldGluZ2lkID0gJCgnI21lZXRpbmdJRCcpLnZhbCgpO1xuXHR9XG5cdGlmKCQoJyNzdHVkZW50aWR2YWwnKS52YWwoKSA+IDApe1xuXHRcdGRhdGEuc3R1ZGVudGlkID0gJCgnI3N0dWRlbnRpZHZhbCcpLnZhbCgpO1xuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZW1lZXRpbmcnO1xuXG5cdC8vQUpBWCBQT1NUIHRvIHNlcnZlclxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnc2F2ZSBtZWV0aW5nJyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlbGV0ZSBhIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZU1lZXRpbmcgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgdXJsXG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogJCgnI21lZXRpbmdJRCcpLnZhbCgpXG5cdH1cblx0dmFyIHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlbWVldGluZyc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjY3JlYXRlRXZlbnQnLCAnZGVsZXRlIG1lZXRpbmcnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHBvcHVsYXRlIGFuZCBzaG93IHRoZSBtZWV0aW5nIGZvcm0gZm9yIGVkaXRpbmdcbiAqXG4gKiBAcGFyYW0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gZWRpdFxuICovXG52YXIgc2hvd01lZXRpbmdGb3JtID0gZnVuY3Rpb24oZXZlbnQpe1xuXHQkKCcjdGl0bGUnKS52YWwoZXZlbnQudGl0bGUpO1xuXHQkKCcjc3RhcnQnKS52YWwoZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2VuZCcpLnZhbChldmVudC5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2Rlc2MnKS52YWwoZXZlbnQuZGVzYyk7XG5cdGR1cmF0aW9uT3B0aW9ucyhldmVudC5zdGFydCwgZXZlbnQuZW5kKTtcblx0JCgnI21lZXRpbmdJRCcpLnZhbChldmVudC5pZCk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoZXZlbnQuc3R1ZGVudF9pZCk7XG5cdCQoJyNzdGF0dXMnKS52YWwoZXZlbnQuc3RhdHVzKTtcblx0JCgnI2RlbGV0ZUJ1dHRvbicpLnNob3coKTtcblx0JCgnI2NyZWF0ZUV2ZW50JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgYW5kIHNob3cgdGhlIG1lZXRpbmcgZm9ybSBmb3IgY3JlYXRpb25cbiAqXG4gKiBAcGFyYW0gY2FsZW5kYXJTdHVkZW50TmFtZSAtIHN0cmluZyBuYW1lIG9mIHRoZSBzdHVkZW50XG4gKi9cbnZhciBjcmVhdGVNZWV0aW5nRm9ybSA9IGZ1bmN0aW9uKGNhbGVuZGFyU3R1ZGVudE5hbWUpe1xuXG5cdC8vcG9wdWxhdGUgdGhlIHRpdGxlIGF1dG9tYXRpY2FsbHkgZm9yIGEgc3R1ZGVudFxuXHRpZihjYWxlbmRhclN0dWRlbnROYW1lICE9PSB1bmRlZmluZWQpe1xuXHRcdCQoJyN0aXRsZScpLnZhbChjYWxlbmRhclN0dWRlbnROYW1lKTtcblx0fWVsc2V7XG5cdFx0JCgnI3RpdGxlJykudmFsKCcnKTtcblx0fVxuXG5cdC8vU2V0IHN0YXJ0IHRpbWVcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0JCgnI3N0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjc3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGVuZCB0aW1lXG5cdGlmKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDIwKS5mb3JtYXQoJ0xMTCcpKTtcblx0fWVsc2V7XG5cdFx0JCgnI2VuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXG5cdC8vU2V0IGR1cmF0aW9uIG9wdGlvbnNcblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQgPT09IHVuZGVmaW5lZCl7XG5cdFx0ZHVyYXRpb25PcHRpb25zKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLCBtb21lbnQoKS5ob3VyKDgpLm1pbnV0ZSgyMCkpO1xuXHR9ZWxzZXtcblx0XHRkdXJhdGlvbk9wdGlvbnMoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uc3RhcnQsIGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLmVuZCk7XG5cdH1cblxuXHQvL1Jlc2V0IG90aGVyIG9wdGlvbnNcblx0JCgnI21lZXRpbmdJRCcpLnZhbCgtMSk7XG5cdCQoJyNzdHVkZW50aWR2YWwnKS52YWwoLTEpO1xuXG5cdC8vSGlkZSBkZWxldGUgYnV0dG9uXG5cdCQoJyNkZWxldGVCdXR0b24nKS5oaWRlKCk7XG5cblx0Ly9TaG93IHRoZSBtb2RhbCBmb3JtXG5cdCQoJyNjcmVhdGVFdmVudCcpLm1vZGFsKCdzaG93Jyk7XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZvcm0gb24gdGhpcyBwYWdlXG4gKi9cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICAkKHRoaXMpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpO1xuXHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzZXQgZHVyYXRpb24gb3B0aW9ucyBmb3IgdGhlIG1lZXRpbmcgZm9ybVxuICpcbiAqIEBwYXJhbSBzdGFydCAtIGEgbW9tZW50IG9iamVjdCBmb3IgdGhlIHN0YXJ0IHRpbWVcbiAqIEBwYXJhbSBlbmQgLSBhIG1vbWVudCBvYmplY3QgZm9yIHRoZSBlbmRpbmcgdGltZVxuICovXG52YXIgZHVyYXRpb25PcHRpb25zID0gZnVuY3Rpb24oc3RhcnQsIGVuZCl7XG5cdC8vY2xlYXIgdGhlIGxpc3Rcblx0JCgnI2R1cmF0aW9uJykuZW1wdHkoKTtcblxuXHQvL2Fzc3VtZSBhbGwgbWVldGluZ3MgaGF2ZSByb29tIGZvciAyMCBtaW51dGVzXG5cdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzIwJz4yMCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXG5cdC8vaWYgaXQgc3RhcnRzIG9uIG9yIGJlZm9yZSA0OjIwLCBhbGxvdyA0MCBtaW51dGVzIGFzIGFuIG9wdGlvblxuXHRpZihzdGFydC5ob3VyKCkgPCAxNiB8fCAoc3RhcnQuaG91cigpID09IDE2ICYmIHN0YXJ0Lm1pbnV0ZXMoKSA8PSAyMCkpe1xuXHRcdCQoJyNkdXJhdGlvbicpLmFwcGVuZChcIjxvcHRpb24gdmFsdWU9JzQwJz40MCBtaW51dGVzPC9vcHRpb24+XCIpO1xuXHR9XG5cblx0Ly9pZiBpdCBzdGFydHMgb24gb3IgYmVmb3JlIDQ6MDAsIGFsbG93IDYwIG1pbnV0ZXMgYXMgYW4gb3B0aW9uXG5cdGlmKHN0YXJ0LmhvdXIoKSA8IDE2IHx8IChzdGFydC5ob3VyKCkgPT0gMTYgJiYgc3RhcnQubWludXRlcygpIDw9IDApKXtcblx0XHQkKCcjZHVyYXRpb24nKS5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSc2MCc+NjAgbWludXRlczwvb3B0aW9uPlwiKTtcblx0fVxuXG5cdC8vc2V0IGRlZmF1bHQgdmFsdWUgYmFzZWQgb24gZ2l2ZW4gc3BhblxuXHQkKCcjZHVyYXRpb24nKS52YWwoZW5kLmRpZmYoc3RhcnQsIFwibWludXRlc1wiKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxpbmsgdGhlIGRhdGVwaWNrZXJzIHRvZ2V0aGVyXG4gKlxuICogQHBhcmFtIGVsZW0xIC0galF1ZXJ5IG9iamVjdCBmb3IgZmlyc3QgZGF0ZXBpY2tlclxuICogQHBhcmFtIGVsZW0yIC0galF1ZXJ5IG9iamVjdCBmb3Igc2Vjb25kIGRhdGVwaWNrZXJcbiAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBsaW5rRGF0ZVBpY2tlcnMgPSBmdW5jdGlvbihlbGVtMSwgZWxlbTIsIGR1cmF0aW9uKXtcblx0Ly9iaW5kIHRvIGNoYW5nZSBhY3Rpb24gb24gZmlyc3QgZGF0YXBpY2tlclxuXHQkKGVsZW0xICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMiA9IG1vbWVudCgkKGVsZW0yKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0FmdGVyKGRhdGUyKSB8fCBlLmRhdGUuaXNTYW1lKGRhdGUyKSl7XG5cdFx0XHRkYXRlMiA9IGUuZGF0ZS5jbG9uZSgpO1xuXHRcdFx0JChlbGVtMikudmFsKGRhdGUyLmZvcm1hdChcIkxMTFwiKSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL2JpbmQgdG8gY2hhbmdlIGFjdGlvbiBvbiBzZWNvbmQgZGF0ZXBpY2tlclxuXHQkKGVsZW0yICsgXCJfZGF0ZXBpY2tlclwiKS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBkYXRlMSA9IG1vbWVudCgkKGVsZW0xKS52YWwoKSwgJ0xMTCcpO1xuXHRcdGlmKGUuZGF0ZS5pc0JlZm9yZShkYXRlMSkgfHwgZS5kYXRlLmlzU2FtZShkYXRlMSkpe1xuXHRcdFx0ZGF0ZTEgPSBlLmRhdGUuY2xvbmUoKTtcblx0XHRcdCQoZWxlbTEpLnZhbChkYXRlMS5mb3JtYXQoXCJMTExcIikpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgZHVyYXRpb24gb2YgdGhlIG1lZXRpbmdcbiAqL1xudmFyIGNoYW5nZUR1cmF0aW9uID0gZnVuY3Rpb24oKXtcblx0dmFyIG5ld0RhdGUgPSBtb21lbnQoJCgnI3N0YXJ0JykudmFsKCksICdMTEwnKS5hZGQoJCh0aGlzKS52YWwoKSwgXCJtaW51dGVzXCIpO1xuXHQkKCcjZW5kJykudmFsKG5ld0RhdGUuZm9ybWF0KFwiTExMXCIpKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdmVyaWZ5IHRoYXQgdGhlIHN0dWRlbnRzIGFyZSBzZWxlY3RpbmcgbWVldGluZ3MgdGhhdCBhcmVuJ3QgdG9vIGxvbmdcbiAqXG4gKiBAcGFyYW0gc3RhcnQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgc3RhcnQgb2YgdGhlIG1lZXRpbmdcbiAqIEBwYXJhbSBlbmQgLSBtb21lbnQgb2JqZWN0IGZvciB0aGUgZW5kIG9mIHRoZSBtZWV0aW5nXG4gKi9cbnZhciBzdHVkZW50U2VsZWN0ID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuXG5cdC8vV2hlbiBzdHVkZW50cyBzZWxlY3QgYSBtZWV0aW5nLCBkaWZmIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzXG5cdGlmKGVuZC5kaWZmKHN0YXJ0LCAnbWludXRlcycpID4gNjApe1xuXG5cdFx0Ly9pZiBpbnZhbGlkLCB1bnNlbGVjdCBhbmQgc2hvdyBhbiBlcnJvclxuXHRcdGFsZXJ0KFwiTWVldGluZ3MgY2Fubm90IGxhc3QgbG9uZ2VyIHRoYW4gMSBob3VyXCIpO1xuXHRcdCQoJyNjYWxlbmRhcicpLmZ1bGxDYWxlbmRhcigndW5zZWxlY3QnKTtcblx0fWVsc2V7XG5cblx0XHQvL2lmIHZhbGlkLCBzZXQgZGF0YSBpbiB0aGUgc2Vzc2lvbiBhbmQgc2hvdyB0aGUgZm9ybVxuXHRcdGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uID0ge1xuXHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0ZW5kOiBlbmRcblx0XHR9O1xuXHRcdCQoJyNtZWV0aW5nSUQnKS52YWwoLTEpO1xuXHRcdGNyZWF0ZU1lZXRpbmdGb3JtKGV4cG9ydHMuY2FsZW5kYXJTdHVkZW50TmFtZSk7XG5cdH1cbn07XG5cbi8qKlxuICogTG9hZCBjb25mbGljdGluZyBtZWV0aW5ncyBmcm9tIHRoZSBzZXJ2ZXJcbiAqL1xudmFyIGxvYWRDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXG5cdC8vcmVxdWVzdCBjb25mbGljdHMgdmlhIEFKQVhcblx0d2luZG93LmF4aW9zLmdldCgnL2FkdmlzaW5nL2NvbmZsaWN0cycpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXG5cdFx0XHQvL2Rpc2FibGUgZXhpc3RpbmcgY2xpY2sgaGFuZGxlcnNcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdjbGljaycsICcuZWRpdENvbmZsaWN0JywgZWRpdENvbmZsaWN0KTtcblx0XHRcdCQoZG9jdW1lbnQpLm9mZignY2xpY2snLCAnLnJlc29sdmVDb25mbGljdCcsIHJlc29sdmVDb25mbGljdCk7XG5cblx0XHRcdC8vSWYgcmVzcG9uc2UgaXMgMjAwLCBkYXRhIHdhcyByZWNlaXZlZFxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IDIwMCl7XG5cblx0XHRcdFx0Ly9BcHBlbmQgSFRNTCBmb3IgY29uZmxpY3RzIHRvIERPTVxuXHRcdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKS5lbXB0eSgpO1xuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0XHRcdFx0XHQkKCc8ZGl2Lz4nLCB7XG5cdFx0XHRcdFx0XHQnaWQnIDogJ3Jlc29sdmUnK3ZhbHVlLmlkLFxuXHRcdFx0XHRcdFx0J2NsYXNzJzogJ21lZXRpbmctY29uZmxpY3QnLFxuXHRcdFx0XHRcdFx0J2h0bWwnOiBcdCc8cD4mbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIHB1bGwtcmlnaHQgZGVsZXRlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5EZWxldGU8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCcmbmJzcDs8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBwdWxsLXJpZ2h0IGVkaXRDb25mbGljdFwiIGRhdGEtaWQ9Jyt2YWx1ZS5pZCsnPkVkaXQ8L2J1dHRvbj4gJyArXG5cdFx0XHRcdFx0XHRcdFx0XHQnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCByZXNvbHZlQ29uZmxpY3RcIiBkYXRhLWlkPScrdmFsdWUuaWQrJz5LZWVwIE1lZXRpbmc8L2J1dHRvbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdCc8c3BhbiBpZD1cInJlc29sdmUnK3ZhbHVlLmlkKydzcGluXCIgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpbiBmYS1sZyBwdWxsLXJpZ2h0IGhpZGUtc3BpblwiPiZuYnNwOzwvc3Bhbj4nICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxiPicrdmFsdWUudGl0bGUrJzwvYj4gKCcrdmFsdWUuc3RhcnQrJyk8L3A+PGhyPidcblx0XHRcdFx0XHRcdH0pLmFwcGVuZFRvKCcjcmVzb2x2ZUNvbmZsaWN0TWVldGluZ3MnKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly9SZS1yZWdpc3RlciBjbGljayBoYW5kbGVyc1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmRlbGV0ZUNvbmZsaWN0JywgZGVsZXRlQ29uZmxpY3QpO1xuXHRcdFx0XHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmVkaXRDb25mbGljdCcsIGVkaXRDb25mbGljdCk7XG5cdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucmVzb2x2ZUNvbmZsaWN0JywgcmVzb2x2ZUNvbmZsaWN0KTtcblxuXHRcdFx0XHQvL1Nob3cgdGhlIDxkaXY+IGNvbnRhaW5pbmcgY29uZmxpY3RzXG5cdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXG5cdFx0ICAvL0lmIHJlc3BvbnNlIGlzIDIwNCwgbm8gY29uZmxpY3RzIGFyZSBwcmVzZW50XG5cdFx0XHR9ZWxzZSBpZihyZXNwb25zZS5zdGF0dXMgPT0gMjA0KXtcblxuXHRcdFx0XHQvL0hpZGUgdGhlIDxkaXY+IGNvbnRhaW5pbmcgY29uZmxpY3RzXG5cdFx0XHRcdCQoJyNjb25mbGljdGluZ01lZXRpbmdzJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIHJldHJpZXZlIGNvbmZsaWN0aW5nIG1lZXRpbmdzOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIFNhdmUgYmxhY2tvdXRzIGFuZCBibGFja291dCBldmVudHNcbiAqL1xudmFyIHNhdmVCbGFja291dCA9IGZ1bmN0aW9uKCl7XG5cblx0Ly9TaG93IHRoZSBzcGlubmluZyBzdGF0dXMgaWNvbiB3aGlsZSB3b3JraW5nXG5cdCQoJyNjcmVhdGVCbGFja291dHNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9idWlsZCB0aGUgZGF0YSBvYmplY3QgYW5kIHVybDtcblx0dmFyIGRhdGEgPSB7XG5cdFx0YnN0YXJ0OiBtb21lbnQoJCgnI2JzdGFydCcpLnZhbCgpLCAnTExMJykuZm9ybWF0KCksXG5cdFx0YmVuZDogbW9tZW50KCQoJyNiZW5kJykudmFsKCksICdMTEwnKS5mb3JtYXQoKSxcblx0XHRidGl0bGU6ICQoJyNidGl0bGUnKS52YWwoKVxuXHR9O1xuXHR2YXIgdXJsO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9jcmVhdGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhLmJibGFja291dGV2ZW50aWQgPSAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpO1xuXHR9ZWxzZXtcblx0XHR1cmwgPSAnL2FkdmlzaW5nL2NyZWF0ZWJsYWNrb3V0Jztcblx0XHRpZigkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSA+IDApe1xuXHRcdFx0ZGF0YS5iYmxhY2tvdXRpZCA9ICQoJyNiYmxhY2tvdXRpZCcpLnZhbCgpO1xuXHRcdH1cblx0XHRkYXRhLmJyZXBlYXQgPSAkKCcjYnJlcGVhdCcpLnZhbCgpO1xuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMSl7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeT0gJCgnI2JyZXBlYXRkYWlseScpLnZhbCgpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHRcdGlmKCQoJyNicmVwZWF0JykudmFsKCkgPT0gMil7XG5cdFx0XHRkYXRhLmJyZXBlYXRldmVyeSA9ICQoJyNicmVwZWF0d2Vla2x5JykudmFsKCk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c20gPSAkKCcjYnJlcGVhdHdlZWtkYXlzMScpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzdCA9ICQoJyNicmVwZWF0d2Vla2RheXMyJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0d2Vla2RheXN3ID0gJCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0XHRkYXRhLmJyZXBlYXR3ZWVrZGF5c3UgPSAkKCcjYnJlcGVhdHdlZWtkYXlzNCcpLnByb3AoJ2NoZWNrZWQnKTtcblx0XHRcdGRhdGEuYnJlcGVhdHdlZWtkYXlzZiA9ICQoJyNicmVwZWF0d2Vla2RheXM1JykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdFx0ZGF0YS5icmVwZWF0dW50aWwgPSBtb21lbnQoJCgnI2JyZXBlYXR1bnRpbCcpLnZhbCgpLCBcIk1NL0REL1lZWVlcIikuZm9ybWF0KCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4U2F2ZSh1cmwsIGRhdGEsICcjY3JlYXRlQmxhY2tvdXQnLCAnc2F2ZSBibGFja291dCcpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgYmxhY2tvdXQgYW5kIGJsYWNrb3V0IGV2ZW50c1xuICovXG52YXIgZGVsZXRlQmxhY2tvdXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgVVJMIGFuZCBkYXRhIG9iamVjdFxuXHR2YXIgdXJsLCBkYXRhO1xuXHRpZigkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpID4gMCl7XG5cdFx0dXJsID0gJy9hZHZpc2luZy9kZWxldGVibGFja291dGV2ZW50Jztcblx0XHRkYXRhID0geyBiYmxhY2tvdXRldmVudGlkOiAkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbCgpIH07XG5cdH1lbHNle1xuXHRcdHVybCA9ICcvYWR2aXNpbmcvZGVsZXRlYmxhY2tvdXQnO1xuXHRcdGRhdGEgPSB7IGJibGFja291dGlkOiAkKCcjYmJsYWNrb3V0aWQnKS52YWwoKSB9O1xuXHR9XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHRhamF4RGVsZXRlKHVybCwgZGF0YSwgJyNjcmVhdGVCbGFja291dCcsICdkZWxldGUgYmxhY2tvdXQnLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBoYW5kbGluZyB0aGUgY2hhbmdlIG9mIHJlcGVhdCBvcHRpb25zIG9uIHRoZSBibGFja291dCBmb3JtXG4gKi9cbnZhciByZXBlYXRDaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRpZigkKHRoaXMpLnZhbCgpID09IDApe1xuXHRcdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0d2Vla2x5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR1bnRpbGRpdicpLmhpZGUoKTtcblx0fWVsc2UgaWYoJCh0aGlzKS52YWwoKSA9PSAxKXtcblx0XHQkKCcjcmVwZWF0ZGFpbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0XHQkKCcjcmVwZWF0dW50aWxkaXYnKS5zaG93KCk7XG5cdH1lbHNlIGlmKCQodGhpcykudmFsKCkgPT0gMil7XG5cdFx0JCgnI3JlcGVhdGRhaWx5ZGl2JykuaGlkZSgpO1xuXHRcdCQoJyNyZXBlYXR3ZWVrbHlkaXYnKS5zaG93KCk7XG5cdFx0JCgnI3JlcGVhdHVudGlsZGl2Jykuc2hvdygpO1xuXHR9XG59O1xuXG4vKipcbiAqIFNob3cgdGhlIHJlc29sdmUgY29uZmxpY3RzIG1vZGFsIGZvcm1cbiAqL1xudmFyIHJlc29sdmVDb25mbGljdHMgPSBmdW5jdGlvbigpe1xuXHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIGNvbmZsaWN0aW5nIG1lZXRpbmdcbiAqL1xudmFyIGRlbGV0ZUNvbmZsaWN0ID0gZnVuY3Rpb24oKXtcblxuXHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHR2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cdHZhciBkYXRhID0ge1xuXHRcdG1lZXRpbmdpZDogaWRcblx0fVxuXHR2YXIgdXJsID0gJy9hZHZpc2luZy9kZWxldGVtZWV0aW5nJztcblxuXHQvL3NlbmQgQUpBWCBkZWxldGVcblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ2RlbGV0ZSBtZWV0aW5nJywgdHJ1ZSk7XG5cbn07XG5cbi8qKlxuICogRWRpdCBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciBlZGl0Q29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL21lZXRpbmcnO1xuXG5cdC8vc2hvdyBzcGlubmVyIHRvIGxvYWQgbWVldGluZ1xuXHQkKCcjcmVzb2x2ZScrIGlkICsgJ3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0Ly9sb2FkIG1lZXRpbmcgYW5kIGRpc3BsYXkgZm9ybVxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjcmVzb2x2ZScrIGlkICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHQkKCcjcmVzb2x2ZUNvbmZsaWN0JykubW9kYWwoJ2hpZGUnKTtcblx0XHRcdGV2ZW50ID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdGV2ZW50LnN0YXJ0ID0gbW9tZW50KGV2ZW50LnN0YXJ0KTtcblx0XHRcdGV2ZW50LmVuZCA9IG1vbWVudChldmVudC5lbmQpO1xuXHRcdFx0c2hvd01lZXRpbmdGb3JtKGV2ZW50KTtcblx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBtZWV0aW5nJywgJyNyZXNvbHZlJyArIGlkLCBlcnJvcik7XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIFJlc29sdmUgYSBjb25mbGljdGluZyBtZWV0aW5nXG4gKi9cbnZhciByZXNvbHZlQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblx0dmFyIGRhdGEgPSB7XG5cdFx0bWVldGluZ2lkOiBpZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL3Jlc29sdmVjb25mbGljdCc7XG5cblx0YWpheERlbGV0ZSh1cmwsIGRhdGEsICcjcmVzb2x2ZScgKyBpZCwgJ3Jlc29sdmUgbWVldGluZycsIHRydWUsIHRydWUpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgdGhlIGNyZWF0ZSBibGFja291dCBmb3JtXG4gKi9cbnZhciBjcmVhdGVCbGFja291dEZvcm0gPSBmdW5jdGlvbigpe1xuXHQkKCcjYnRpdGxlJykudmFsKFwiXCIpO1xuXHRpZihleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5zdGFydCA9PT0gdW5kZWZpbmVkKXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKG1vbWVudCgpLmhvdXIoOCkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYnN0YXJ0JykudmFsKGV4cG9ydHMuY2FsZW5kYXJTZXNzaW9uLnN0YXJ0LmZvcm1hdChcIkxMTFwiKSk7XG5cdH1cblx0aWYoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZW5kID09PSB1bmRlZmluZWQpe1xuXHRcdCQoJyNiZW5kJykudmFsKG1vbWVudCgpLmhvdXIoOSkubWludXRlKDApLmZvcm1hdCgnTExMJykpO1xuXHR9ZWxzZXtcblx0XHQkKCcjYmVuZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5lbmQuZm9ybWF0KFwiTExMXCIpKTtcblx0fVxuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoLTEpO1xuXHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQkKCcjYnJlcGVhdCcpLnZhbCgwKTtcblx0JCgnI2JyZXBlYXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0JCgnI2RlbGV0ZUJsYWNrb3V0QnV0dG9uJykuaGlkZSgpO1xuXHQkKCcjY3JlYXRlQmxhY2tvdXQnKS5tb2RhbCgnc2hvdycpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXNldCB0aGUgZm9ybSB0byBhIHNpbmdsZSBvY2N1cnJlbmNlXG4gKi9cbnZhciBibGFja291dE9jY3VycmVuY2UgPSBmdW5jdGlvbigpe1xuXHQvL2hpZGUgdGhlIG1vZGFsIGZvcm1cblx0JCgnI2JsYWNrb3V0T3B0aW9uJykubW9kYWwoJ2hpZGUnKTtcblxuXHQvL3NldCBmb3JtIHZhbHVlcyBhbmQgaGlkZSB1bm5lZWRlZCBmaWVsZHNcblx0JCgnI2J0aXRsZScpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC50aXRsZSk7XG5cdCQoJyNic3RhcnQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuc3RhcnQuZm9ybWF0KFwiTExMXCIpKTtcblx0JCgnI2JlbmQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuZW5kLmZvcm1hdChcIkxMTFwiKSk7XG5cdCQoJyNyZXBlYXRkaXYnKS5oaWRlKCk7XG5cdCQoJyNyZXBlYXRkYWlseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHdlZWtseWRpdicpLmhpZGUoKTtcblx0JCgnI3JlcGVhdHVudGlsZGl2JykuaGlkZSgpO1xuXHQkKCcjYmJsYWNrb3V0aWQnKS52YWwoZXhwb3J0cy5jYWxlbmRhclNlc3Npb24uZXZlbnQuYmxhY2tvdXRfaWQpO1xuXHQkKCcjYmJsYWNrb3V0ZXZlbnRpZCcpLnZhbChleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5pZCk7XG5cdCQoJyNkZWxldGVCbGFja291dEJ1dHRvbicpLnNob3coKTtcblxuXHQvL3Nob3cgdGhlIGZvcm1cblx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbG9hZCBhIGJsYWNrb3V0IHNlcmllcyBlZGl0IGZvcm1cbiAqL1xudmFyIGJsYWNrb3V0U2VyaWVzID0gZnVuY3Rpb24oKXtcblx0Ly9oaWRlIHRoZSBtb2RhbCBmb3JtXG4gXHQkKCcjYmxhY2tvdXRPcHRpb24nKS5tb2RhbCgnaGlkZScpO1xuXG5cdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdHZhciBkYXRhID0ge1xuXHRcdGlkOiBleHBvcnRzLmNhbGVuZGFyU2Vzc2lvbi5ldmVudC5ibGFja291dF9pZFxuXHR9XG5cdHZhciB1cmwgPSAnL2FkdmlzaW5nL2JsYWNrb3V0JztcblxuXHR3aW5kb3cuYXhpb3MuZ2V0KHVybCwge1xuXHRcdFx0cGFyYW1zOiBkYXRhXG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHQkKCcjYnRpdGxlJykudmFsKHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cdCBcdFx0JCgnI2JzdGFydCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5zdGFydCwgJ1lZWVktTU0tREQgSEg6bW06c3MnKS5mb3JtYXQoJ0xMTCcpKTtcblx0IFx0XHQkKCcjYmVuZCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5lbmQsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdMTEwnKSk7XG5cdCBcdFx0JCgnI2JibGFja291dGlkJykudmFsKHJlc3BvbnNlLmRhdGEuaWQpO1xuXHQgXHRcdCQoJyNiYmxhY2tvdXRldmVudGlkJykudmFsKC0xKTtcblx0IFx0XHQkKCcjcmVwZWF0ZGl2Jykuc2hvdygpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudmFsKHJlc3BvbnNlLmRhdGEucmVwZWF0X3R5cGUpO1xuXHQgXHRcdCQoJyNicmVwZWF0JykudHJpZ2dlcignY2hhbmdlJyk7XG5cdCBcdFx0aWYocmVzcG9uc2UuZGF0YS5yZXBlYXRfdHlwZSA9PSAxKXtcblx0IFx0XHRcdCQoJyNicmVwZWF0ZGFpbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1lbHNlIGlmIChyZXNwb25zZS5kYXRhLnJlcGVhdF90eXBlID09IDIpe1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrbHknKS52YWwocmVzcG9uc2UuZGF0YS5yZXBlYXRfZXZlcnkpO1xuXHRcdFx0XHR2YXIgcmVwZWF0X2RldGFpbCA9IFN0cmluZyhyZXNwb25zZS5kYXRhLnJlcGVhdF9kZXRhaWwpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czEnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjFcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czInKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjJcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czMnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjNcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czQnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjRcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR3ZWVrZGF5czUnKS5wcm9wKCdjaGVja2VkJywgKHJlcGVhdF9kZXRhaWwuaW5kZXhPZihcIjVcIikgPj0gMCkpO1xuXHQgXHRcdFx0JCgnI2JyZXBlYXR1bnRpbCcpLnZhbChtb21lbnQocmVzcG9uc2UuZGF0YS5yZXBlYXRfdW50aWwsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCdNTS9ERC9ZWVlZJykpO1xuXHQgXHRcdH1cblx0IFx0XHQkKCcjZGVsZXRlQmxhY2tvdXRCdXR0b24nKS5zaG93KCk7XG5cdCBcdFx0JCgnI2NyZWF0ZUJsYWNrb3V0JykubW9kYWwoJ3Nob3cnKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBibGFja291dCBzZXJpZXMnLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgc3R1ZGVudCBpbiB0aGUgZGF0YWJhc2VcbiAqL1xudmFyIG5ld1N0dWRlbnQgPSBmdW5jdGlvbigpe1xuXHQvL3Byb21wdCB0aGUgdXNlciBmb3IgYW4gZUlEIHRvIGFkZCB0byB0aGUgc3lzdGVtXG5cdHZhciBlaWQgPSBwcm9tcHQoXCJFbnRlciB0aGUgc3R1ZGVudCdzIGVJRFwiKTtcblxuXHQvL2J1aWxkIHRoZSBVUkwgYW5kIGRhdGFcblx0dmFyIGRhdGEgPSB7XG5cdFx0ZWlkOiBlaWQsXG5cdH07XG5cdHZhciB1cmwgPSAnL3Byb2ZpbGUvbmV3c3R1ZGVudCc7XG5cblx0Ly9zZW5kIEFKQVggcG9zdFxuXHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0aWYoZXJyb3IucmVzcG9uc2Upe1xuXHRcdFx0XHQvL0lmIHJlc3BvbnNlIGlzIDQyMiwgZXJyb3JzIHdlcmUgcHJvdmlkZWRcblx0XHRcdFx0aWYoZXJyb3IucmVzcG9uc2Uuc3RhdHVzID09IDQyMil7XG5cdFx0XHRcdFx0YWxlcnQoXCJVbmFibGUgdG8gY3JlYXRlIHVzZXI6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YVtcImVpZFwiXSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIGNyZWF0ZSB1c2VyOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9jYWxlbmRhci5qcyIsIndpbmRvdy5WdWUgPSByZXF1aXJlKCd2dWUnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vdXRpbC9zaXRlJyk7XG52YXIgRWNobyA9IHJlcXVpcmUoJ2xhcmF2ZWwtZWNobycpO1xucmVxdWlyZSgnaW9uLXNvdW5kJyk7XG5cbndpbmRvdy5QdXNoZXIgPSByZXF1aXJlKCdwdXNoZXItanMnKTtcblxuLyoqXG4gKiBHcm91cHNlc3Npb24gaW5pdCBmdW5jdGlvblxuICogbXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSB0byBzdGFydFxuICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuXG5cdC8vbG9hZCBpb24tc291bmQgbGlicmFyeVxuXHRpb24uc291bmQoe1xuICAgIHNvdW5kczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcImRvb3JfYmVsbFwiXG4gICAgICAgIH0sXG4gICAgXSxcbiAgICB2b2x1bWU6IDEuMCxcbiAgICBwYXRoOiBcIi9zb3VuZHMvXCIsXG4gICAgcHJlbG9hZDogdHJ1ZVxuXHR9KTtcblxuXHQvL2dldCB1c2VySUQgYW5kIGlzQWR2aXNvciB2YXJpYWJsZXNcblx0d2luZG93LnVzZXJJRCA9IHBhcnNlSW50KCQoJyN1c2VySUQnKS52YWwoKSk7XG5cblx0Ly9yZWdpc3RlciBidXR0b24gY2xpY2tcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5vbignY2xpY2snLCBncm91cFJlZ2lzdGVyQnRuKTtcblxuXHQvL2Rpc2FibGUgYnV0dG9uIGNsaWNrXG5cdCQoJyNncm91cERpc2FibGVCdG4nKS5vbignY2xpY2snLCBncm91cERpc2FibGVCdG4pO1xuXG5cdC8vcmVuZGVyIFZ1ZSBBcHBcblx0d2luZG93LnZtID0gbmV3IFZ1ZSh7XG5cdFx0ZWw6ICcjZ3JvdXBMaXN0Jyxcblx0XHRkYXRhOiB7XG5cdFx0XHRxdWV1ZTogW10sXG5cdFx0XHRhZHZpc29yOiBwYXJzZUludCgkKCcjaXNBZHZpc29yJykudmFsKCkpID09IDEsXG5cdFx0XHR1c2VySUQ6IHBhcnNlSW50KCQoJyN1c2VySUQnKS52YWwoKSksXG5cdFx0XHRvbmxpbmU6IFtdLFxuXHRcdH0sXG5cdFx0bWV0aG9kczoge1xuXHRcdFx0Ly9GdW5jdGlvbiB0byBnZXQgQ1NTIGNsYXNzZXMgZm9yIGEgc3R1ZGVudCBvYmplY3Rcblx0XHRcdGdldENsYXNzOiBmdW5jdGlvbihzKXtcblx0XHRcdFx0cmV0dXJue1xuXHRcdFx0XHRcdCdhbGVydC1pbmZvJzogcy5zdGF0dXMgPT0gMCB8fCBzLnN0YXR1cyA9PSAxLFxuXHRcdFx0XHRcdCdhbGVydC1zdWNjZXNzJzogcy5zdGF0dXMgPT0gMixcblx0XHRcdFx0XHQnZ3JvdXBzZXNzaW9uLW1lJzogcy51c2VyaWQgPT0gdGhpcy51c2VySUQsXG5cdFx0XHRcdFx0J2dyb3Vwc2Vzc2lvbi1vZmZsaW5lJzogJC5pbkFycmF5KHMudXNlcmlkLCB0aGlzLm9ubGluZSkgPT0gLTEsXG5cdFx0XHRcdH07XG5cdFx0XHR9LFxuXHRcdFx0Ly9mdW5jdGlvbiB0byB0YWtlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHR0YWtlU3R1ZGVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IHsgZ2lkOiBldmVudC5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQgfTtcblx0XHRcdFx0dmFyIHVybCA9ICcvZ3JvdXBzZXNzaW9uL3Rha2UnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3Rha2UnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gcHV0IGEgc3R1ZGVudCBiYWNrIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3Rcblx0XHRcdHB1dFN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9wdXQnXG5cdFx0XHRcdGFqYXhQb3N0KHVybCwgZGF0YSwgJ3B1dCcpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly8gZnVuY3Rpb24gdG8gbWFyayBhIHN0dWRlbnQgZG9uZSBvbiB0aGUgbGlzdFxuXHRcdFx0ZG9uZVN0dWRlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0dmFyIGRhdGEgPSB7IGdpZDogZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkIH07XG5cdFx0XHRcdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9kb25lJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdtYXJrIGRvbmUnKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vZnVuY3Rpb24gdG8gZGVsZXRlIGEgc3R1ZGVudCBmcm9tIHRoZSBsaXN0XG5cdFx0XHRkZWxTdHVkZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdHZhciBkYXRhID0geyBnaWQ6IGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZCB9O1xuXHRcdFx0XHR2YXIgdXJsID0gJy9ncm91cHNlc3Npb24vZGVsZXRlJ1xuXHRcdFx0XHRhamF4UG9zdCh1cmwsIGRhdGEsICdkZWxldGUnKTtcblx0XHRcdH0sXG5cdFx0fSxcblx0fSlcblxuXG5cdC8vRW5hYmxlIFB1c2hlciBsb2dnaW5nXG5cdGlmKHdpbmRvdy5lbnYgPT0gXCJsb2NhbFwiIHx8IHdpbmRvdy5lbnYgPT0gXCJzdGFnaW5nXCIpe1xuXHRcdGNvbnNvbGUubG9nKFwiUHVzaGVyIGxvZ2dpbmcgZW5hYmxlZCFcIik7XG5cdFx0UHVzaGVyLmxvZ1RvQ29uc29sZSA9IHRydWU7XG5cdH1cblxuXHQvL0xvYWQgdGhlIEVjaG8gaW5zdGFuY2Ugb24gdGhlIHdpbmRvd1xuXHR3aW5kb3cuRWNobyA9IG5ldyBFY2hvKHtcblx0XHRicm9hZGNhc3RlcjogJ3B1c2hlcicsXG5cdFx0a2V5OiB3aW5kb3cucHVzaGVyS2V5LFxuXHRcdGNsdXN0ZXI6IHdpbmRvdy5wdXNoZXJDbHVzdGVyLFxuXHR9KTtcblxuXHQvL0JpbmQgdG8gdGhlIGNvbm5lY3RlZCBhY3Rpb24gb24gUHVzaGVyIChjYWxsZWQgd2hlbiBjb25uZWN0ZWQpXG5cdHdpbmRvdy5FY2hvLmNvbm5lY3Rvci5wdXNoZXIuY29ubmVjdGlvbi5iaW5kKCdjb25uZWN0ZWQnLCBmdW5jdGlvbigpe1xuXHRcdC8vd2hlbiBjb25uZWN0ZWQsIGRpc2FibGUgdGhlIHNwaW5uZXJcblx0XHQkKCcjZ3JvdXBzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdFx0Ly9Mb2FkIHRoZSBpbml0aWFsIHN0dWRlbnQgcXVldWUgdmlhIEFKQVhcblx0XHR3aW5kb3cuYXhpb3MuZ2V0KCcvZ3JvdXBzZXNzaW9uL3F1ZXVlJylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0d2luZG93LnZtLnF1ZXVlID0gd2luZG93LnZtLnF1ZXVlLmNvbmNhdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0Y2hlY2tCdXR0b25zKHdpbmRvdy52bS5xdWV1ZSk7XG5cdFx0XHRcdGluaXRpYWxDaGVja0Rpbmcod2luZG93LnZtLnF1ZXVlKTtcblx0XHRcdFx0d2luZG93LnZtLnF1ZXVlLnNvcnQoc29ydEZ1bmN0aW9uKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdnZXQgcXVldWUnLCAnJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0pXG5cblx0Ly9Db25uZWN0IHRvIHRoZSBncm91cHNlc3Npb24gY2hhbm5lbFxuXHQvKlxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb24nKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvblJlZ2lzdGVyJywgKGRhdGEpID0+IHtcblxuXHRcdH0pO1xuICovXG5cblx0Ly9Db25uZWN0IHRvIHRoZSBncm91cHNlc3Npb25lbmQgY2hhbm5lbFxuXHR3aW5kb3cuRWNoby5jaGFubmVsKCdncm91cHNlc3Npb25lbmQnKVxuXHRcdC5saXN0ZW4oJ0dyb3Vwc2Vzc2lvbkVuZCcsIChlKSA9PiB7XG5cblx0XHRcdC8vaWYgZW5kaW5nLCByZWRpcmVjdCBiYWNrIHRvIGhvbWUgcGFnZVxuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9ncm91cHNlc3Npb25cIjtcblx0fSk7XG5cblx0d2luZG93LkVjaG8uam9pbigncHJlc2VuY2UnKVxuXHRcdC5oZXJlKCh1c2VycykgPT4ge1xuXHRcdFx0dmFyIGxlbiA9IHVzZXJzLmxlbmd0aDtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdHdpbmRvdy52bS5vbmxpbmUucHVzaCh1c2Vyc1tpXS5pZCk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuam9pbmluZygodXNlcikgPT4ge1xuXHRcdFx0d2luZG93LnZtLm9ubGluZS5wdXNoKHVzZXIuaWQpO1xuXHRcdH0pXG5cdFx0LmxlYXZpbmcoKHVzZXIpID0+IHtcblx0XHRcdHdpbmRvdy52bS5vbmxpbmUuc3BsaWNlKCAkLmluQXJyYXkodXNlci5pZCwgd2luZG93LnZtLm9ubGluZSksIDEpO1xuXHRcdH0pXG5cdFx0Lmxpc3RlbignR3JvdXBzZXNzaW9uUmVnaXN0ZXInLCAoZGF0YSkgPT4ge1xuXHRcdFx0dmFyIHF1ZXVlID0gd2luZG93LnZtLnF1ZXVlO1xuXHRcdFx0dmFyIGZvdW5kID0gZmFsc2U7XG5cdFx0XHR2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuXG5cdFx0XHQvL3VwZGF0ZSB0aGUgcXVldWUgYmFzZWQgb24gcmVzcG9uc2Vcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdGlmKHF1ZXVlW2ldLmlkID09PSBkYXRhLmlkKXtcblx0XHRcdFx0XHRpZihkYXRhLnN0YXR1cyA8IDMpe1xuXHRcdFx0XHRcdFx0cXVldWVbaV0gPSBkYXRhO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0cXVldWUuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdFx0bGVuLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2lmIGVsZW1lbnQgbm90IGZvdW5kIG9uIGN1cnJlbnQgcXVldWUsIHB1c2ggaXQgb24gdG8gdGhlIHF1ZXVlXG5cdFx0XHRpZighZm91bmQpe1xuXHRcdFx0XHRxdWV1ZS5wdXNoKGRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NoZWNrIHRvIHNlZSBpZiBjdXJyZW50IHVzZXIgaXMgb24gcXVldWUgYmVmb3JlIGVuYWJsaW5nIGJ1dHRvblxuXHRcdFx0Y2hlY2tCdXR0b25zKHF1ZXVlKTtcblxuXHRcdFx0Ly9pZiBjdXJyZW50IHVzZXIgaXMgZm91bmQsIGNoZWNrIGZvciBzdGF0dXMgdXBkYXRlIHRvIHBsYXkgc291bmRcblx0XHRcdGlmKGRhdGEudXNlcmlkID09PSB1c2VySUQpe1xuXHRcdFx0XHRjaGVja0RpbmcoZGF0YSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vc29ydCB0aGUgcXVldWUgY29ycmVjdGx5XG5cdFx0XHRxdWV1ZS5zb3J0KHNvcnRGdW5jdGlvbik7XG5cblx0XHRcdC8vdXBkYXRlIFZ1ZSBzdGF0ZSwgbWlnaHQgYmUgdW5uZWNlc3Nhcnlcblx0XHRcdHdpbmRvdy52bS5xdWV1ZSA9IHF1ZXVlO1xuXHRcdH0pO1xuXG59O1xuXG5cbi8qKlxuICogVnVlIGZpbHRlciBmb3Igc3RhdHVzIHRleHRcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBzdHVkZW50IHRvIHJlbmRlclxuICovXG5WdWUuZmlsdGVyKCdzdGF0dXN0ZXh0JywgZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuc3RhdHVzID09PSAwKSByZXR1cm4gXCJORVdcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDEpIHJldHVybiBcIlFVRVVFRFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMikgcmV0dXJuIFwiTUVFVCBXSVRIIFwiICsgZGF0YS5hZHZpc29yO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gMykgcmV0dXJuIFwiREVMQVlcIjtcblx0aWYoZGF0YS5zdGF0dXMgPT09IDQpIHJldHVybiBcIkFCU0VOVFwiO1xuXHRpZihkYXRhLnN0YXR1cyA9PT0gNSkgcmV0dXJuIFwiRE9ORVwiO1xufSk7XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGNsaWNraW5nIG9uIHRoZSByZWdpc3RlciBidXR0b25cbiAqL1xudmFyIGdyb3VwUmVnaXN0ZXJCdG4gPSBmdW5jdGlvbigpe1xuXHQkKCcjZ3JvdXBzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXG5cdHZhciB1cmwgPSAnL2dyb3Vwc2Vzc2lvbi9yZWdpc3Rlcic7XG5cdHdpbmRvdy5heGlvcy5wb3N0KHVybCwge30pXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0c2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG5cdFx0XHRkaXNhYmxlQnV0dG9uKCk7XG5cdFx0XHQkKCcjZ3JvdXBzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3JlZ2lzdGVyJywgJyNncm91cCcsIGVycm9yKTtcblx0XHR9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGFkdmlzb3JzIHRvIGRpc2FibGUgZ3JvdXBzZXNzaW9uXG4gKi9cbnZhciBncm91cERpc2FibGVCdG4gPSBmdW5jdGlvbigpe1xuXHR2YXIgY2hvaWNlID0gY29uZmlybShcIkFyZSB5b3Ugc3VyZT9cIik7XG5cdGlmKGNob2ljZSA9PT0gdHJ1ZSl7XG5cdFx0dmFyIHJlYWxseSA9IGNvbmZpcm0oXCJTZXJpb3VzbHksIHRoaXMgd2lsbCBsb3NlIGFsbCBjdXJyZW50IGRhdGEuIEFyZSB5b3UgcmVhbGx5IHN1cmU/XCIpO1xuXHRcdGlmKHJlYWxseSA9PT0gdHJ1ZSl7XG5cdFx0XHQvL3RoaXMgaXMgYSBiaXQgaGFja3ksIGJ1dCBpdCB3b3Jrc1xuXHRcdFx0dmFyIHRva2VuID0gJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKTtcblx0XHRcdCQoJzxmb3JtIGFjdGlvbj1cIi9ncm91cHNlc3Npb24vZGlzYWJsZVwiIG1ldGhvZD1cIlBPU1RcIi8+Jylcblx0XHRcdFx0LmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJpZFwiIHZhbHVlPVwiJyArIHdpbmRvdy51c2VySUQgKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiX3Rva2VuXCIgdmFsdWU9XCInICsgdG9rZW4gKyAnXCI+JykpXG5cdFx0XHRcdC5hcHBlbmRUbygkKGRvY3VtZW50LmJvZHkpKSAvL2l0IGhhcyB0byBiZSBhZGRlZCBzb21ld2hlcmUgaW50byB0aGUgPGJvZHk+XG5cdFx0XHRcdC5zdWJtaXQoKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBlbmFibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZW5hYmxlQnV0dG9uID0gZnVuY3Rpb24oKXtcblx0JCgnI2dyb3VwUmVnaXN0ZXJCdG4nKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRpc2FibGUgcmVnaXN0cmF0aW9uIGJ1dHRvblxuICovXG52YXIgZGlzYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG5cdCQoJyNncm91cFJlZ2lzdGVyQnRuJykuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBhbmQgc2VlIGlmIHVzZXIgaXMgb24gdGhlIGxpc3QgLSBpZiBub3QsIGRvbid0IGVuYWJsZSBidXR0b25cbiAqL1xudmFyIGNoZWNrQnV0dG9ucyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0dmFyIGZvdW5kTWUgPSBmYWxzZTtcblxuXHQvL2l0ZXJhdGUgdGhyb3VnaCB1c2VycyBvbiBsaXN0LCBsb29raW5nIGZvciBjdXJyZW50IHVzZXJcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHdpbmRvdy51c2VySUQpe1xuXHRcdFx0Zm91bmRNZSA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvL2lmIGZvdW5kLCBkaXNhYmxlIGJ1dHRvbjsgaWYgbm90LCBlbmFibGUgYnV0dG9uXG5cdGlmKGZvdW5kTWUpe1xuXHRcdGRpc2FibGVCdXR0b24oKTtcblx0fWVsc2V7XG5cdFx0ZW5hYmxlQnV0dG9uKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgdXNlciBpcyBiZWNrb25lZCwgaWYgc28sIHBsYXkgc291bmQhXG4gKlxuICogQHBhcmFtIHBlcnNvbiAtIHRoZSBjdXJyZW50IHVzZXIgdG8gY2hlY2tcbiAqL1xudmFyIGNoZWNrRGluZyA9IGZ1bmN0aW9uKHBlcnNvbil7XG5cdGlmKHBlcnNvbi5zdGF0dXMgPT0gMil7XG5cdFx0aW9uLnNvdW5kLnBsYXkoXCJkb29yX2JlbGxcIik7XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcGVyc29uIGhhcyBiZWVuIGJlY2tvbmVkIG9uIGxvYWQ7IGlmIHNvLCBwbGF5IHNvdW5kIVxuICpcbiAqIEBwYXJhbSBxdWV1ZSAtIHRoZSBpbml0aWFsIHF1ZXVlIG9mIHVzZXJzIGxvYWRlZFxuICovXG52YXIgaW5pdGlhbENoZWNrRGluZyA9IGZ1bmN0aW9uKHF1ZXVlKXtcblx0dmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKXtcblx0XHRpZihxdWV1ZVtpXS51c2VyaWQgPT09IHdpbmRvdy51c2VySUQpe1xuXHRcdFx0Y2hlY2tEaW5nKHF1ZXVlW2ldKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIHN0YXR1c1xuICpcbiAqIEBwYXJhbSBhIC0gZmlyc3QgcGVyc29uXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBwZXJzb25cbiAqIEByZXR1cm4gLSBzb3J0aW5nIHZhbHVlIGluZGljYXRpbmcgd2hvIHNob3VsZCBnbyBmaXJzdF9uYW1lXG4gKi9cbnZhciBzb3J0RnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKXtcblx0aWYoYS5zdGF0dXMgPT0gYi5zdGF0dXMpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5zdGF0dXMgPCBiLnN0YXR1cyA/IDEgOiAtMSk7XG59XG5cblxuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBtYWtpbmcgQUpBWCBQT1NUIHJlcXVlc3RzXG4gKlxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gc2VuZCB0b1xuICogQHBhcmFtIGRhdGEgLSB0aGUgZGF0YSBvYmplY3QgdG8gc2VuZFxuICogQHBhcmFtIGFjdGlvbiAtIHRoZSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgYWN0aW9uXG4gKi9cbnZhciBhamF4UG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgYWN0aW9uKXtcblx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcblx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoYWN0aW9uLCAnJywgZXJyb3IpO1xuXHRcdH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZ3JvdXBzZXNzaW9uLmpzIiwidmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbnJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbnJlcXVpcmUoJ2NvZGVtaXJyb3IvbW9kZS94bWwveG1sLmpzJyk7XG5yZXF1aXJlKCdzdW1tZXJub3RlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG5cblx0JCgnI25vdGVzJykuc3VtbWVybm90ZSh7XG5cdFx0Zm9jdXM6IHRydWUsXG5cdFx0dG9vbGJhcjogW1xuXHRcdFx0Ly8gW2dyb3VwTmFtZSwgW2xpc3Qgb2YgYnV0dG9uc11dXG5cdFx0XHRbJ3N0eWxlJywgWydzdHlsZScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnY2xlYXInXV0sXG5cdFx0XHRbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG5cdFx0XHRbJ3BhcmEnLCBbJ3VsJywgJ29sJywgJ3BhcmFncmFwaCddXSxcblx0XHRcdFsnbWlzYycsIFsnZnVsbHNjcmVlbicsICdjb2RldmlldycsICdoZWxwJ11dLFxuXHRcdF0sXG5cdFx0dGFic2l6ZTogMixcblx0XHRjb2RlbWlycm9yOiB7XG5cdFx0XHRtb2RlOiAndGV4dC9odG1sJyxcblx0XHRcdGh0bWxNb2RlOiB0cnVlLFxuXHRcdFx0bGluZU51bWJlcnM6IHRydWUsXG5cdFx0XHR0aGVtZTogJ21vbm9rYWknXG5cdFx0fSxcblx0fSk7XG5cblx0Ly9iaW5kIGNsaWNrIGhhbmRsZXIgZm9yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlUHJvZmlsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cblx0XHQvL3Nob3cgc3Bpbm5pbmcgaWNvblxuXHRcdCQoJyNwcm9maWxlc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuXHRcdC8vYnVpbGQgZGF0YSBhbmQgVVJMXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRmaXJzdF9uYW1lOiAkKCcjZmlyc3RfbmFtZScpLnZhbCgpLFxuXHRcdFx0bGFzdF9uYW1lOiAkKCcjbGFzdF9uYW1lJykudmFsKCksXG5cdFx0fTtcblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHQvL3NlbmQgQUpBWCBwb3N0XG5cdFx0d2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0c2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcblx0XHRcdFx0JCgnI3Byb2ZpbGVzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZUFkdmlzaW5nQnRuJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG5cdFx0XHRcdHNpdGUuaGFuZGxlRXJyb3IoJ3NhdmUgcHJvZmlsZScsICcjcHJvZmlsZScsIGVycm9yKTtcblx0XHRcdH0pXG5cdH0pO1xuXG5cdC8vYmluZCBjbGljayBoYW5kbGVyIGZvciBhZHZpc29yIHNhdmUgYnV0dG9uXG5cdCQoJyNzYXZlQWR2aXNvclByb2ZpbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXG5cdFx0Ly9zaG93IHNwaW5uaW5nIGljb25cblx0XHQkKCcjcHJvZmlsZXNwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cblx0XHQvL2J1aWxkIGRhdGEgYW5kIFVSTFxuXHRcdC8vVE9ETyBURVNUTUVcblx0XHR2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgkKCdmb3JtJylbMF0pO1xuXHRcdGRhdGEuYXBwZW5kKFwibmFtZVwiLCAkKCcjbmFtZScpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcImVtYWlsXCIsICQoJyNlbWFpbCcpLnZhbCgpKTtcblx0XHRkYXRhLmFwcGVuZChcIm9mZmljZVwiLCAkKCcjb2ZmaWNlJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwicGhvbmVcIiwgJCgnI3Bob25lJykudmFsKCkpO1xuXHRcdGRhdGEuYXBwZW5kKFwibm90ZXNcIiwgJCgnI25vdGVzJykudmFsKCkpO1xuXHRcdGlmKCQoJyNwaWMnKS52YWwoKSl7XG5cdFx0XHRkYXRhLmFwcGVuZChcInBpY1wiLCAkKCcjcGljJylbMF0uZmlsZXNbMF0pO1xuXHRcdH1cblx0XHR2YXIgdXJsID0gJy9wcm9maWxlL3VwZGF0ZSc7XG5cblx0XHR3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuXHRcdFx0XHQkKCcjcHJvZmlsZXNwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdCQoJyNwcm9maWxlQWR2aXNpbmdCdG4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG5cdFx0XHRcdHdpbmRvdy5heGlvcy5nZXQoJy9wcm9maWxlL3BpYycpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0JCgnI3BpY3RleHQnKS52YWwocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0XHQkKCcjcGljaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRcdFx0c2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgcGljdHVyZScsICcnLCBlcnJvcik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuXHRcdFx0XHRzaXRlLmhhbmRsZUVycm9yKCdzYXZlIHByb2ZpbGUnLCAnI3Byb2ZpbGUnLCBlcnJvcik7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0Ly9odHRwOi8vd3d3LmFiZWF1dGlmdWxzaXRlLm5ldC93aGlwcGluZy1maWxlLWlucHV0cy1pbnRvLXNoYXBlLXdpdGgtYm9vdHN0cmFwLTMvXG5cdCQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLmJ0bi1maWxlIDpmaWxlJywgZnVuY3Rpb24oKSB7XG5cdCAgdmFyIGlucHV0ID0gJCh0aGlzKSxcblx0ICAgICAgbnVtRmlsZXMgPSBpbnB1dC5nZXQoMCkuZmlsZXMgPyBpbnB1dC5nZXQoMCkuZmlsZXMubGVuZ3RoIDogMSxcblx0ICAgICAgbGFiZWwgPSBpbnB1dC52YWwoKS5yZXBsYWNlKC9cXFxcL2csICcvJykucmVwbGFjZSgvLipcXC8vLCAnJyk7XG5cdCAgaW5wdXQudHJpZ2dlcignZmlsZXNlbGVjdCcsIFtudW1GaWxlcywgbGFiZWxdKTtcblx0fSk7XG5cblx0Ly9iaW5kIHRvIGZpbGVzZWxlY3QgYnV0dG9uXG4gICQoJy5idG4tZmlsZSA6ZmlsZScpLm9uKCdmaWxlc2VsZWN0JywgZnVuY3Rpb24oZXZlbnQsIG51bUZpbGVzLCBsYWJlbCkge1xuXG4gICAgICB2YXIgaW5wdXQgPSAkKHRoaXMpLnBhcmVudHMoJy5pbnB1dC1ncm91cCcpLmZpbmQoJzp0ZXh0Jyk7XG5cdFx0XHR2YXIgbG9nID0gbnVtRmlsZXMgPiAxID8gbnVtRmlsZXMgKyAnIGZpbGVzIHNlbGVjdGVkJyA6IGxhYmVsO1xuXG4gICAgICBpZihpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC52YWwobG9nKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKGxvZyl7XG5cdFx0XHRcdFx0XHRhbGVydChsb2cpO1xuXHRcdFx0XHRcdH1cbiAgICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9wcm9maWxlLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZW1lZXRpbmdcIjtcbiAgICB2YXIgcmV0VXJsID0gXCIvYWRtaW4vbWVldGluZ3NcIjtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIGRhc2hib2FyZC5hamF4ZGVsZXRlKGRhdGEsIHVybCwgcmV0VXJsLCB0cnVlKTtcbiAgfSk7XG5cbiAgJCgnI2ZvcmNlZGVsZXRlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgdXJsID0gXCIvYWRtaW4vZm9yY2VkZWxldGVtZWV0aW5nXCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL21lZXRpbmdzXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvbWVldGluZ2VkaXQuanMiLCIvL2xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2l0ZScpO1xucmVxdWlyZSgnYWRtaW4tbHRlJyk7XG5yZXF1aXJlKCdkYXRhdGFibGVzLm5ldCcpO1xucmVxdWlyZSgnZGF0YXRhYmxlcy5uZXQtYnMnKTtcbnJlcXVpcmUoJ2RldmJyaWRnZS1hdXRvY29tcGxldGUnKTtcblxuLy9vcHRpb25zIGZvciBkYXRhdGFibGVzXG5leHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMgPSB7XG4gIFwicGFnZUxlbmd0aFwiOiA1MCxcbiAgXCJsZW5ndGhDaGFuZ2VcIjogZmFsc2UsXG59XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb25cbiAqIG11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHkgb24gYWxsIGRhdGF0YWJsZXMgcGFnZXNcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIGN1c3RvbSBkYXRhdGFibGVzIG9wdGlvbnNcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSBleHBvcnRzLmRhdGFUYWJsZU9wdGlvbnMpO1xuICAkKCcjdGFibGUnKS5EYXRhVGFibGUob3B0aW9ucyk7XG4gIHNpdGUuY2hlY2tNZXNzYWdlKCk7XG5cbiAgJCgnI2FkbWlubHRlLXRvZ2dsZW1lbnUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnc2lkZWJhci1vcGVuJyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHNhdmUgdmlhIEFKQVhcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGlkIC0gdGhlIGlkIG9mIHRoZSBpdGVtIHRvIGJlIHNhdmUtZGV2XG4gKiBAcGFyYW0gbG9hZHBpY3R1cmUgLSB0cnVlIHRvIHJlbG9hZCBhIHByb2ZpbGUgcGljdHVyZVxuICovXG5leHBvcnRzLmFqYXhzYXZlID0gZnVuY3Rpb24oZGF0YSwgdXJsLCBpZCwgbG9hZHBpY3R1cmUpe1xuICBsb2FkcGljdHVyZSB8fCAobG9hZHBpY3R1cmUgPSBmYWxzZSk7XG4gICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgaWYoaWQubGVuZ3RoID09IDApe1xuICAgICAgICAkKGxvY2F0aW9uKS5hdHRyKCdocmVmJywgcmVzcG9uc2UuZGF0YSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgIGlmKGxvYWRwaWN0dXJlKSBleHBvcnRzLmxvYWRwaWN0dXJlKGlkKTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBzYXZlIHZpYSBBSkFYIG9uIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAqIEBwYXJhbSB1cmwgLSB0aGUgdXJsIHRvIHNlbmQgZGF0YSB0b1xuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgbW9kYWwgZWxlbWVudCB0byBjbG9zZVxuICovXG5leHBvcnRzLmFqYXhtb2RhbHNhdmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIGVsZW1lbnQpe1xuICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAkKCcjc3BpbicpLmFkZENsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICAgICQoZWxlbWVudCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmhhbmRsZUVycm9yKCdzYXZlJywgJyMnLCBlcnJvcilcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsb2FkIGEgcGljdHVyZSB2aWEgQUpBWFxuICpcbiAqIEBwYXJhbSBpZCAtIHRoZSB1c2VyIElEIG9mIHRoZSBwaWN0dXJlIHRvIHJlbG9hZFxuICovXG5leHBvcnRzLmxvYWRwaWN0dXJlID0gZnVuY3Rpb24oaWQpe1xuICB3aW5kb3cuYXhpb3MuZ2V0KCcvcHJvZmlsZS9waWMvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNwaWN0ZXh0JykudmFsKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgJCgnI3BpY2ltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHBpY3R1cmUnLCAnJywgZXJyb3IpO1xuICAgIH0pXG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gcmV0VXJsIC0gdGhlIFVSTCB0byByZXR1cm4gdG8gYWZ0ZXIgZGVsZXRlXG4gKiBAcGFyYW0gc29mdCAtIGJvb2xlYW4gaWYgdGhpcyBpcyBhIHNvZnQgZGVsZXRlIG9yIG5vdFxuICovXG5leHBvcnRzLmFqYXhkZWxldGUgPSBmdW5jdGlvbiAoZGF0YSwgdXJsLCByZXRVcmwsIHNvZnQgPSBmYWxzZSl7XG4gIGlmKHNvZnQpe1xuICAgIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgfWVsc2V7XG4gICAgdmFyIGNob2ljZSA9IGNvbmZpcm0oXCJBcmUgeW91IHN1cmU/IFRoaXMgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgYWxsIHJlbGF0ZWQgcmVjb3Jkcy4gWW91IGNhbm5vdCB1bmRvIHRoaXMgYWN0aW9uLlwiKTtcbiAgfVxuXHRpZihjaG9pY2UgPT09IHRydWUpe1xuICAgICQoJyNzcGluJykucmVtb3ZlQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZGVsZXRlJywgJyMnLCBlcnJvcilcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW0gZnJvbSBhIG1vZGFsIGZvcm1cbiAqXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhIGNvbnRhaW5pbmcgdGhlIGl0ZW0gdG8gZGVsZXRlXG4gKiBAcGFyYW0gdXJsIC0gdGhlIFVSTCB0byBzZW5kIHRoZSBkYXRhIHRvXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBtb2RhbCBlbGVtZW50IHRvIGNsb3NlXG4gKi9cbmV4cG9ydHMuYWpheG1vZGFsZGVsZXRlID0gZnVuY3Rpb24gKGRhdGEsIHVybCwgZWxlbWVudCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB3aW5kb3cuYXhpb3MucG9zdCh1cmwsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICQoJyN0YWJsZScpLkRhdGFUYWJsZSgpLmFqYXgucmVsb2FkKCk7XG4gICAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2RlbGV0ZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc3RvcmUgYSBzb2Z0LWRlbGV0ZWQgaXRlbVxuICpcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGl0ZW0gdG8gYmUgcmVzdG9yZWRcbiAqIEBwYXJhbSB1cmwgLSB0aGUgVVJMIHRvIHNlbmQgdGhhdCBpbmZvcm1hdGlvbiB0b1xuICogQHBhcmFtIHJldFVybCAtIHRoZSBVUkwgdG8gcmV0dXJuIHRvXG4gKi9cbmV4cG9ydHMuYWpheHJlc3RvcmUgPSBmdW5jdGlvbihkYXRhLCB1cmwsIHJldFVybCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcblx0aWYoY2hvaWNlID09PSB0cnVlKXtcbiAgICAkKCcjc3BpbicpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkOiAkKCcjaWQnKS52YWwoKSxcbiAgICB9O1xuICAgIHdpbmRvdy5heGlvcy5wb3N0KHVybCwgZGF0YSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgJChsb2NhdGlvbikuYXR0cignaHJlZicsIHJldFVybCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmVzdG9yZScsICcjJywgZXJyb3IpXG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGF1dG9jb21wbGV0ZSBhIGZpZWxkXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xuZXhwb3J0cy5hamF4YXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oaWQsIHVybCl7XG4gICQoJyMnICsgaWQgKyAnYXV0bycpLmF1dG9jb21wbGV0ZSh7XG5cdCAgICBzZXJ2aWNlVXJsOiB1cmwsXG5cdCAgICBhamF4U2V0dGluZ3M6IHtcblx0ICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdCAgICB9LFxuICAgICAgbWluQ2hhcnM6IDMsXG5cdCAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcblx0ICAgICAgICAkKCcjJyArIGlkKS52YWwoc3VnZ2VzdGlvbi5kYXRhKTtcbiAgICAgICAgICAkKCcjJyArIGlkICsgJ3RleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIHN1Z2dlc3Rpb24uZGF0YSArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KHN1Z2dlc3Rpb24udmFsdWUsIDMwKSk7XG5cdCAgICB9LFxuXHQgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLm1hcChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihkYXRhSXRlbSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGRhdGFJdGVtLnZhbHVlLCBkYXRhOiBkYXRhSXRlbS5kYXRhIH07XG5cdCAgICAgICAgICAgIH0pXG5cdCAgICAgICAgfTtcblx0ICAgIH1cblx0fSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvZGFzaGJvYXJkLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWJsYWNrb3V0XCI7XG4gICAgdmFyIHJldFVybCA9IFwiL2FkbWluL2JsYWNrb3V0c1wiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhkZWxldGUoZGF0YSwgdXJsLCByZXRVcmwpO1xuICB9KTtcblxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2JsYWNrb3V0ZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gIC8vJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIi9hZG1pbi9uZXdzdHVkZW50XCI+TmV3IFN0dWRlbnQ8L2E+Jyk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWdyb3Vwc2Vzc2lvblwiO1xuICAgIHZhciByZXRVcmwgPSBcIi9hZG1pbi9ncm91cHNlc3Npb25zXCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheGRlbGV0ZShkYXRhLCB1cmwsIHJldFVybCk7XG4gIH0pO1xuXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZ3JvdXBzZXNzaW9uZWRpdC5qcyIsInZhciBkYXNoYm9hcmQgPSByZXF1aXJlKCcuLi8uLi91dGlsL2Rhc2hib2FyZCcpO1xudmFyIHNpdGUgPSByZXF1aXJlKCcuLi8uLi91dGlsL3NpdGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcbiAgLy9sb2FkIGN1c3RvbSBidXR0b24gb24gdGhlIGRvbVxuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIGRhc2hib2FyZC5pbml0KCk7XG5cbiAgLy9iaW5kIHNldHRpbmdzIGJ1dHRvbnNcbiAgJCgnLnNldHRpbmdzYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgIH07XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vc2F2ZXNldHRpbmcnO1xuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignc2F2ZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9iaW5kIG5ldyBzZXR0aW5nIGJ1dHRvblxuICAkKCcjbmV3c2V0dGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNob2ljZSA9IHByb21wdChcIkVudGVyIGEgbmFtZSBmb3IgdGhlIG5ldyBzZXR0aW5nOlwiKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGtleTogY2hvaWNlLFxuICAgIH07XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL25ld3NldHRpbmdcIlxuXG4gICAgd2luZG93LmF4aW9zLnBvc3QodXJsLCBkYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQobG9jYXRpb24pLmF0dHIoJ2hyZWYnLCAnL2FkbWluL3NldHRpbmdzJyk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcignY3JlYXRlJywgJycsIGVycm9yKVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvc2V0dGluZ3MuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2RlZ3JlZXByb2dyYW1faWQnKS52YWwoKTtcbiAgb3B0aW9ucy5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL2RlZ3JlZXByb2dyYW1yZXF1aXJlbWVudHMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMuY29sdW1ucyA9IFtcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgICB7J2RhdGEnOiAnbmFtZSd9LFxuICAgIHsnZGF0YSc6ICdjcmVkaXRzJ30sXG4gICAgeydkYXRhJzogJ3NlbWVzdGVyJ30sXG4gICAgeydkYXRhJzogJ29yZGVyaW5nJ30sXG4gICAgeydkYXRhJzogJ25vdGVzJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFszLCBcImFzY1wiXSxcbiAgICBbNCwgXCJhc2NcIl0sXG4gIF07XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xuXG4gICQoXCJkaXYubmV3YnV0dG9uXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIjXCIgaWQ9XCJuZXdcIj5OZXcgRGVncmVlIFJlcXVpcmVtZW50PC9hPicpO1xuXG4gICQoJyNzYXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5vdGVzOiAkKCcjbm90ZXMnKS52YWwoKSxcbiAgICAgIGRlZ3JlZXByb2dyYW1faWQ6ICQoJyNkZWdyZWVwcm9ncmFtX2lkJykudmFsKCksXG4gICAgICBzZW1lc3RlcjogJCgnI3NlbWVzdGVyJykudmFsKCksXG4gICAgICBvcmRlcmluZzogJCgnI29yZGVyaW5nJykudmFsKCksXG4gICAgICBjcmVkaXRzOiAkKCcjY3JlZGl0cycpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdkZWdyZWVyZXF1aXJlbWVudCc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9kZWdyZWVyZXF1aXJlbWVudC8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZWRlZ3JlZXJlcXVpcmVtZW50XCI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBpZDogJCgnI2lkJykudmFsKCksXG4gICAgfTtcbiAgICBkYXNoYm9hcmQuYWpheG1vZGFsZGVsZXRlKGRhdGEsIHVybCwgJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50Zm9ybScpLm9uKCdoaWRkZW4uYnMubW9kYWwnLCByZXNldEZvcm0pO1xuXG4gIHJlc2V0Rm9ybSgpO1xuXG4gICQoJyNuZXcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgICAkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS52YWwoJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykuYXR0cigndmFsdWUnKSk7XG4gICAgJCgnI2RlbGV0ZScpLmhpZGUoKTtcbiAgICAkKCcjZGVncmVlcmVxdWlyZW1lbnRmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZGVncmVlcmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjc2VtZXN0ZXInKS52YWwobWVzc2FnZS5kYXRhLnNlbWVzdGVyKTtcbiAgICAgICAgJCgnI29yZGVyaW5nJykudmFsKG1lc3NhZ2UuZGF0YS5vcmRlcmluZyk7XG4gICAgICAgICQoJyNjcmVkaXRzJykudmFsKG1lc3NhZ2UuZGF0YS5jcmVkaXRzKTtcbiAgICAgICAgJCgnI25vdGVzJykudmFsKG1lc3NhZ2UuZGF0YS5ub3Rlcyk7XG4gICAgICAgICQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLnZhbCgkKCcjZGVncmVlcHJvZ3JhbV9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMicpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNkZWdyZWVyZXF1aXJlbWVudGZvcm0nKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIHNpdGUuaGFuZGxlRXJyb3IoJ3JldHJpZXZlIHJlcXVpcmVtZW50JywgJycsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gIH0pO1xuXG4gICQoJ2lucHV0W25hbWU9cmVxdWlyZWFibGVdJykub24oJ2NoYW5nZScsIHNob3dzZWxlY3RlZCk7XG5cbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2VsZWN0aXZlbGlzdF9pZCcsICcvZWxlY3RpdmVsaXN0cy9lbGVjdGl2ZWxpc3RmZWVkJyk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGljaCBkaXYgdG8gc2hvdyBpbiB0aGUgZm9ybVxuICovXG52YXIgc2hvd3NlbGVjdGVkID0gZnVuY3Rpb24oKXtcbiAgLy9odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjIyMzM2L2pxdWVyeS1nZXQtdmFsdWUtb2Ytc2VsZWN0ZWQtcmFkaW8tYnV0dG9uXG4gIHZhciBzZWxlY3RlZCA9ICQoXCJpbnB1dFtuYW1lPSdyZXF1aXJlYWJsZSddOmNoZWNrZWRcIik7XG4gIGlmIChzZWxlY3RlZC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgIGlmKHNlbGVjdGVkVmFsID09IDEpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWNvdXJzZScpLnNob3coKTtcbiAgICAgIH1cbiAgfVxufVxuXG52YXIgcmVzZXRGb3JtID0gZnVuY3Rpb24oKXtcbiAgc2l0ZS5jbGVhckZvcm1FcnJvcnMoKTtcbiAgJCgnI2lkJykudmFsKFwiXCIpO1xuICAkKCcjc2VtZXN0ZXInKS52YWwoXCJcIik7XG4gICQoJyNvcmRlcmluZycpLnZhbChcIlwiKTtcbiAgJCgnI2NyZWRpdHMnKS52YWwoXCJcIik7XG4gICQoJyNub3RlcycpLnZhbChcIlwiKTtcbiAgJCgnI2RlZ3JlZXByb2dyYW1faWR2aWV3JykudmFsKCQoJyNkZWdyZWVwcm9ncmFtX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAkKCcjY291cnNlX25hbWUnKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWQnKS52YWwoXCItMVwiKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoXCJcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkICgwKSBcIik7XG4gICQoJyNyZXF1aXJlYWJsZTEnKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICQoJyNyZXF1aXJlYWJsZTInKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICQoJyNlbGVjdGl2ZWNvdXJzZScpLmhpZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZGFzaGJvYXJkL2RlZ3JlZXByb2dyYW1kZXRhaWwuanMiLCJ2YXIgZGFzaGJvYXJkID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9kYXNoYm9hcmQnKTtcbnZhciBzaXRlID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9zaXRlJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIG9wdGlvbnMuZG9tID0gJzxcIm5ld2J1dHRvblwiPmZydGlwJztcbiAgdmFyIGlkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICBvcHRpb25zLmFqYXggPSB7XG4gICAgICB1cmw6ICcvYWRtaW4vZWxlY3RpdmVsaXN0Y291cnNlcy8nICsgaWQsXG4gICAgICBkYXRhU3JjOiAnJyxcbiAgfTtcbiAgb3B0aW9ucy5jb2x1bW5zID0gW1xuICAgIHsnZGF0YSc6ICdpZCd9LFxuICAgIHsnZGF0YSc6ICduYW1lJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XVxuICBvcHRpb25zLm9yZGVyID0gW1xuICAgIFsxLCBcImFzY1wiXSxcbiAgXTtcbiAgZGFzaGJvYXJkLmluaXQob3B0aW9ucyk7XG5cbiAgJChcImRpdi5uZXdidXR0b25cIikuaHRtbCgnPGEgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zdWNjZXNzXCIgaHJlZj1cIiNcIiBpZD1cIm5ld1wiPkFkZCBDb3Vyc2U8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgZWxlY3RpdmVsaXN0X2lkOiAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCksXG4gICAgICBjb3Vyc2VfcHJlZml4OiAkKCcjY291cnNlX3ByZWZpeCcpLnZhbCgpLFxuICAgIH07XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWluX251bWJlciA9ICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBkYXRhLmNvdXJzZV9taW5fbnVtYmVyID0gJCgnI2NvdXJzZV9taW5fbnVtYmVyJykudmFsKCk7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbWF4X251bWJlciA9ICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIGlmKGlkLmxlbmd0aCA9PSAwKXtcbiAgICAgIHZhciB1cmwgPSAnL2FkbWluL25ld2VsZWN0aXZlbGlzdGNvdXJzZSc7XG4gICAgfWVsc2V7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9lbGVjdGl2ZWNvdXJzZS8nICsgaWQ7XG4gICAgfVxuICAgIGRhc2hib2FyZC5hamF4bW9kYWxzYXZlKGRhdGEsIHVybCwgJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJyk7XG4gIH0pO1xuXG4gICQoJyNkZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciB1cmwgPSBcIi9hZG1pbi9kZWxldGVlbGVjdGl2ZWNvdXJzZVwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpO1xuICB9KTtcblxuICAkKCcjZWxlY3RpdmVsaXN0Y291cnNlZm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI2VsZWN0aXZlbGlzdGNvdXJzZWZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS52YWwoJCgnI2VsZWN0aXZlbGlzdF9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAkKCcjZGVsZXRlJykuaGlkZSgpO1xuICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgfSk7XG5cbiAgJCgnI3RhYmxlJykub24oJ2NsaWNrJywgJy5lZGl0JywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHVybCA9ICcvYWRtaW4vZWxlY3RpdmVjb3Vyc2UvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjY291cnNlX3ByZWZpeCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX3ByZWZpeCk7XG4gICAgICAgICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21pbl9udW1iZXIpO1xuICAgICAgICBpZihtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpe1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX21heF9udW1iZXIpO1xuICAgICAgICAgICQoJyNyYW5nZTInKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuc2hvdygpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5oaWRlKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICQoJyNjb3Vyc2VfbWF4X251bWJlcicpLnZhbChcIlwiKTtcbiAgICAgICAgICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG4gICAgICAgICQoJyNlbGVjdGl2ZWxpc3Rjb3Vyc2Vmb3JtJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSBlbGVjdGl2ZSBsaXN0IGNvdXJzZScsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgJCgnaW5wdXRbbmFtZT1yYW5nZV0nKS5vbignY2hhbmdlJywgc2hvd3NlbGVjdGVkKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JhbmdlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNzaW5nbGVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICQoJyNjb3Vyc2VyYW5nZScpLmhpZGUoKTtcbiAgICAgIH1lbHNlIGlmKHNlbGVjdGVkVmFsID09IDIpe1xuICAgICAgICAkKCcjc2luZ2xlY291cnNlJykuaGlkZSgpO1xuICAgICAgICAkKCcjY291cnNlcmFuZ2UnKS5zaG93KCk7XG4gICAgICB9XG4gIH1cbn1cblxudmFyIHJlc2V0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gIHNpdGUuY2xlYXJGb3JtRXJyb3JzKCk7XG4gICQoJyNpZCcpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9wcmVmaXgnKS52YWwoXCJcIik7XG4gICQoJyNjb3Vyc2VfbWluX251bWJlcicpLnZhbChcIlwiKTtcbiAgJCgnI2NvdXJzZV9tYXhfbnVtYmVyJykudmFsKFwiXCIpO1xuICAkKCcjcmFuZ2UxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmFuZ2UyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3NpbmdsZWNvdXJzZScpLnNob3coKTtcbiAgJCgnI2NvdXJzZXJhbmdlJykuaGlkZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9kYXNoYm9hcmQvZWxlY3RpdmVsaXN0ZGV0YWlsLmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZGFzaGJvYXJkJyk7XG52YXIgc2l0ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvc2l0ZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpe1xuICB2YXIgb3B0aW9ucyA9IGRhc2hib2FyZC5kYXRhVGFibGVPcHRpb25zO1xuICBvcHRpb25zLmRvbSA9ICc8XCJuZXdidXR0b25cIj5mcnRpcCc7XG4gIHZhciBpZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gIG9wdGlvbnMuYWpheCA9IHtcbiAgICAgIHVybDogJy9hZG1pbi9wbGFucmVxdWlyZW1lbnRzLycgKyBpZCxcbiAgICAgIGRhdGFTcmM6ICcnLFxuICB9O1xuICBvcHRpb25zLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnZWxlY3RpdmVsaXN0X2FiYnInfSxcbiAgICB7J2RhdGEnOiAnY3JlZGl0cyd9LFxuICAgIHsnZGF0YSc6ICdzZW1lc3Rlcid9LFxuICAgIHsnZGF0YSc6ICdvcmRlcmluZyd9LFxuICAgIHsnZGF0YSc6ICdub3Rlcyd9LFxuICAgIHsnZGF0YSc6ICdjYXRhbG9nX2NvdXJzZSd9LFxuICAgIHsnZGF0YSc6ICdjb21wbGV0ZWRfY291cnNlJ30sXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gIF07XG4gIG9wdGlvbnMuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0XFxcIiBocmVmPVxcXCIjXFxcIiBkYXRhLWlkPVxcXCJcIiArIGRhdGEgKyBcIlxcXCIgcm9sZT1cXFwiYnV0dG9uXFxcIj5FZGl0PC9hPlwiO1xuICAgICAgICAgICAgfVxuICB9XTtcbiAgb3B0aW9ucy5vcmRlciA9IFtcbiAgICBbNCwgXCJhc2NcIl0sXG4gICAgWzUsIFwiYXNjXCJdLFxuICBdO1xuICBkYXNoYm9hcmQuaW5pdChvcHRpb25zKTtcblxuICAkKFwiZGl2Lm5ld2J1dHRvblwiKS5odG1sKCc8YSB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXN1Y2Nlc3NcIiBocmVmPVwiI1wiIGlkPVwibmV3XCI+TmV3IFBsYW4gUmVxdWlyZW1lbnQ8L2E+Jyk7XG5cbiAgLy9hZGRlZCBmb3IgbmV3IHNlbWVzdGVycyB0YWJsZVxuICB2YXIgb3B0aW9uczIgPSB7XG4gICAgXCJwYWdlTGVuZ3RoXCI6IDUwLFxuICAgIFwibGVuZ3RoQ2hhbmdlXCI6IGZhbHNlLFxuICB9XG4gIG9wdGlvbnMyLmRvbSA9ICc8XCJuZXdidXR0b24yXCI+ZnJ0aXAnO1xuICBvcHRpb25zMi5hamF4ID0ge1xuICAgICAgdXJsOiAnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIGlkLFxuICAgICAgZGF0YVNyYzogJycsXG4gIH07XG4gIG9wdGlvbnMyLmNvbHVtbnMgPSBbXG4gICAgeydkYXRhJzogJ2lkJ30sXG4gICAgeydkYXRhJzogJ25hbWUnfSxcbiAgICB7J2RhdGEnOiAnb3JkZXJpbmcnfSxcbiAgICB7J2RhdGEnOiAnaWQnfSxcbiAgXTtcbiAgb3B0aW9uczIuY29sdW1uRGVmcyA9IFt7XG4gICAgICAgICAgICBcInRhcmdldHNcIjogLTEsXG4gICAgICAgICAgICBcImRhdGFcIjogJ2lkJyxcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IGZ1bmN0aW9uKGRhdGEsIHR5cGUsIHJvdywgbWV0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCI8YSBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0c2VtXFxcIiBocmVmPVxcXCIvYWRtaW4vcGxhbnMvcGxhbnNlbWVzdGVyL1wiICsgZGF0YSArIFwiXFxcIiByb2xlPVxcXCJidXR0b25cXFwiPkVkaXQ8L2E+XCI7XG4gICAgICAgICAgICB9XG4gIH1dO1xuICBvcHRpb25zMi5vcmRlciA9IFtcbiAgICBbMiwgXCJhc2NcIl0sXG4gIF07XG4gICQoJyN0YWJsZXNlbScpLkRhdGFUYWJsZShvcHRpb25zMik7XG5cbiAgJChcImRpdi5uZXdidXR0b24yXCIpLmh0bWwoJzxhIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIGhyZWY9XCIvYWRtaW4vcGxhbnMvbmV3cGxhbnNlbWVzdGVyLycgKyBpZCArICdcIiBpZD1cIm5ldzJcIj5OZXcgU2VtZXN0ZXI8L2E+Jyk7XG5cbiAgJCgnI3NhdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgbm90ZXM6ICQoJyNub3RlcycpLnZhbCgpLFxuICAgICAgcGxhbl9pZDogJCgnI3BsYW5faWQnKS52YWwoKSxcbiAgICAgIG9yZGVyaW5nOiAkKCcjb3JkZXJpbmcnKS52YWwoKSxcbiAgICAgIGNyZWRpdHM6ICQoJyNjcmVkaXRzJykudmFsKCksXG4gICAgICBzdHVkZW50X2lkOiAkKCcjc3R1ZGVudF9pZCcpLnZhbCgpLFxuICAgIH07XG4gICAgaWYoJCgnI3NlbWVzdGVyX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuc2VtZXN0ZXJfaWQgPSAkKCcjc2VtZXN0ZXJfaWQnKS52YWwoKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRWYWwgPSBzZWxlY3RlZC52YWwoKTtcbiAgICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICAgZGF0YS5jb3Vyc2VfbmFtZSA9ICQoJyNjb3Vyc2VfbmFtZScpLnZhbCgpO1xuICAgICAgICB9ZWxzZSBpZihzZWxlY3RlZFZhbCA9PSAyKXtcbiAgICAgICAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgICAgICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgICAgICAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZigkKCcjY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuY291cnNlX2lkID0gJCgnI2NvdXJzZV9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICBpZigkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuY29tcGxldGVkY291cnNlX2lkID0gJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgpO1xuICAgIH1cbiAgICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgICBpZihpZC5sZW5ndGggPT0gMCl7XG4gICAgICB2YXIgdXJsID0gJy9hZG1pbi9uZXdwbGFucmVxdWlyZW1lbnQnO1xuICAgIH1lbHNle1xuICAgICAgdmFyIHVybCA9ICcvYWRtaW4vcGxhbnJlcXVpcmVtZW50LycgKyBpZDtcbiAgICB9XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbHNhdmUoZGF0YSwgdXJsLCAnI3BsYW5yZXF1aXJlbWVudGZvcm0nKTtcbiAgfSk7XG5cbiAgJCgnI2RlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHVybCA9IFwiL2FkbWluL2RlbGV0ZXBsYW5yZXF1aXJlbWVudFwiO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6ICQoJyNpZCcpLnZhbCgpLFxuICAgIH07XG4gICAgZGFzaGJvYXJkLmFqYXhtb2RhbGRlbGV0ZShkYXRhLCB1cmwsICcjcGxhbnJlcXVpcmVtZW50Zm9ybScpO1xuICB9KTtcblxuICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm9uKCdzaG93bi5icy5tb2RhbCcsIHNob3dzZWxlY3RlZCk7XG5cbiAgJCgnI3BsYW5yZXF1aXJlbWVudGZvcm0nKS5vbignaGlkZGVuLmJzLm1vZGFsJywgcmVzZXRGb3JtKTtcblxuICByZXNldEZvcm0oKTtcblxuICAkKCcjbmV3Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICAgJCgnI3BsYW5faWR2aWV3JykudmFsKCQoJyNwbGFuX2lkdmlldycpLmF0dHIoJ3ZhbHVlJykpO1xuICAgICQoJyNkZWxldGUnKS5oaWRlKCk7XG4gICAgdmFyIHBsYW5pZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgd2luZG93LmF4aW9zLmdldCgnL2FkbWluL3BsYW5zL3BsYW5zZW1lc3RlcnMvJyArIHBsYW5pZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICB2YXIgbGlzdGl0ZW1zID0gJyc7XG4gICAgICAgICQuZWFjaChtZXNzYWdlLmRhdGEsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgIGxpc3RpdGVtcyArPSAnPG9wdGlvbiB2YWx1ZT0nICsgdmFsdWUuaWQgKyAnPicgKyB2YWx1ZS5uYW1lICsnPC9vcHRpb24+JztcbiAgICAgICAgfSk7XG4gICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpLmVuZCgpLmFwcGVuZChsaXN0aXRlbXMpO1xuICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS52YWwoc2VtZXN0ZXJfaWQpO1xuICAgICAgICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9KVxuICB9KTtcblxuICAkKCcjdGFibGUnKS5vbignY2xpY2snLCAnLmVkaXQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgdXJsID0gJy9hZG1pbi9wbGFucmVxdWlyZW1lbnQvJyArIGlkO1xuICAgIHdpbmRvdy5heGlvcy5nZXQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICQoJyNpZCcpLnZhbChtZXNzYWdlLmRhdGEuaWQpO1xuICAgICAgICAkKCcjb3JkZXJpbmcnKS52YWwobWVzc2FnZS5kYXRhLm9yZGVyaW5nKTtcbiAgICAgICAgJCgnI2NyZWRpdHMnKS52YWwobWVzc2FnZS5kYXRhLmNyZWRpdHMpO1xuICAgICAgICAkKCcjbm90ZXMnKS52YWwobWVzc2FnZS5kYXRhLm5vdGVzKTtcbiAgICAgICAgJCgnI2RlZ3JlZXJlcXVpcmVtZW50X2lkJykudmFsKG1lc3NhZ2UuZGF0YS5kZWdyZWVyZXF1aXJlbWVudF9pZCk7XG4gICAgICAgICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgICAgICAgaWYobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJjb3Vyc2VcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI3JlcXVpcmVhYmxlMScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWRjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgICB9ZWxzZSBpZiAobWVzc2FnZS5kYXRhLnR5cGUgPT0gXCJlbGVjdGl2ZWxpc3RcIil7XG4gICAgICAgICAgJCgnI2NvdXJzZV9uYW1lJykudmFsKG1lc3NhZ2UuZGF0YS5jb3Vyc2VfbmFtZSk7XG4gICAgICAgICAgJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbChtZXNzYWdlLmRhdGEuZWxlY3RpdmVsaXN0X2lkKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgbWVzc2FnZS5kYXRhLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KG1lc3NhZ2UuZGF0YS5lbGVjdGl2ZWxpc3RfbmFtZSwgMzApKTtcbiAgICAgICAgICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI2NvdXJzZV9pZCcpLnZhbChtZXNzYWdlLmRhdGEuY291cnNlX2lkKTtcbiAgICAgICAgJCgnI2NvdXJzZV9pZHRleHQnKS5odG1sKFwiU2VsZWN0ZWQ6IChcIiArIG1lc3NhZ2UuZGF0YS5jb3Vyc2VfaWQgKyBcIikgXCIgKyBzaXRlLnRydW5jYXRlVGV4dChtZXNzYWdlLmRhdGEuY2F0YWxvZ19jb3Vyc2UsIDMwKSk7XG4gICAgICAgICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwobWVzc2FnZS5kYXRhLmNvbXBsZXRlZGNvdXJzZV9pZCk7XG4gICAgICAgICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWR0ZXh0JykuaHRtbChcIlNlbGVjdGVkOiAoXCIgKyBtZXNzYWdlLmRhdGEuY29tcGxldGVkY291cnNlX2lkICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQobWVzc2FnZS5kYXRhLmNvbXBsZXRlZF9jb3Vyc2UsIDMwKSk7XG4gICAgICAgICQoJyNkZWxldGUnKS5zaG93KCk7XG5cbiAgICAgICAgdmFyIHNlbWVzdGVyX2lkID0gbWVzc2FnZS5kYXRhLnNlbWVzdGVyX2lkO1xuXG4gICAgICAgIC8vbG9hZCBzZW1lc3RlcnNcbiAgICAgICAgdmFyIHBsYW5pZCA9ICQoJyNwbGFuX2lkJykudmFsKCk7XG4gICAgICAgIHdpbmRvdy5heGlvcy5nZXQoJy9hZG1pbi9wbGFucy9wbGFuc2VtZXN0ZXJzLycgKyBwbGFuaWQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgICAgICB2YXIgbGlzdGl0ZW1zID0gJyc7XG4gICAgICAgICAgICAkLmVhY2gobWVzc2FnZS5kYXRhLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICAgICAgbGlzdGl0ZW1zICs9ICc8b3B0aW9uIHZhbHVlPScgKyB2YWx1ZS5pZCArICc+JyArIHZhbHVlLm5hbWUgKyc8L29wdGlvbj4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcjc2VtZXN0ZXJfaWQnKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKS5lbmQoKS5hcHBlbmQobGlzdGl0ZW1zKTtcbiAgICAgICAgICAgICQoJyNzZW1lc3Rlcl9pZCcpLnZhbChzZW1lc3Rlcl9pZCk7XG4gICAgICAgICAgICAkKCcjcGxhbnJlcXVpcmVtZW50Zm9ybScpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICAgICAgc2l0ZS5oYW5kbGVFcnJvcigncmV0cmlldmUgc2VtZXN0ZXJzJywgJycsIGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBzaXRlLmhhbmRsZUVycm9yKCdyZXRyaWV2ZSByZXF1aXJlbWVudCcsICcnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICB9KTtcblxuICAkKCdpbnB1dFtuYW1lPXJlcXVpcmVhYmxlXScpLm9uKCdjaGFuZ2UnLCBzaG93c2VsZWN0ZWQpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdlbGVjdGl2ZWxpc3RfaWQnLCAnL2VsZWN0aXZlbGlzdHMvZWxlY3RpdmVsaXN0ZmVlZCcpO1xuXG4gIGRhc2hib2FyZC5hamF4YXV0b2NvbXBsZXRlKCdjb3Vyc2VfaWQnLCAnL2NvdXJzZXMvY291cnNlZmVlZCcpO1xuXG4gIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgZGFzaGJvYXJkLmFqYXhhdXRvY29tcGxldGUoJ2NvbXBsZXRlZGNvdXJzZV9pZCcsICcvY29tcGxldGVkY291cnNlcy9jb21wbGV0ZWRjb3Vyc2VmZWVkLycgKyBzdHVkZW50X2lkKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoaWNoIGRpdiB0byBzaG93IGluIHRoZSBmb3JtXG4gKi9cbnZhciBzaG93c2VsZWN0ZWQgPSBmdW5jdGlvbigpe1xuICAvL2h0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MjIzMzYvanF1ZXJ5LWdldC12YWx1ZS1vZi1zZWxlY3RlZC1yYWRpby1idXR0b25cbiAgdmFyIHNlbGVjdGVkID0gJChcImlucHV0W25hbWU9J3JlcXVpcmVhYmxlJ106Y2hlY2tlZFwiKTtcbiAgaWYgKHNlbGVjdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzZWxlY3RlZFZhbCA9IHNlbGVjdGVkLnZhbCgpO1xuICAgICAgaWYoc2VsZWN0ZWRWYWwgPT0gMSl7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLnNob3coKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuaGlkZSgpO1xuICAgICAgfWVsc2UgaWYoc2VsZWN0ZWRWYWwgPT0gMil7XG4gICAgICAgICQoJyNyZXF1aXJlZGNvdXJzZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2VsZWN0aXZlY291cnNlJykuc2hvdygpO1xuICAgICAgfVxuICB9XG59XG5cbnZhciByZXNldEZvcm0gPSBmdW5jdGlvbigpe1xuICBzaXRlLmNsZWFyRm9ybUVycm9ycygpO1xuICAkKCcjaWQnKS52YWwoXCJcIik7XG4gICQoJyNzZW1lc3RlcicpLnZhbChcIlwiKTtcbiAgJCgnI29yZGVyaW5nJykudmFsKFwiXCIpO1xuICAkKCcjY3JlZGl0cycpLnZhbChcIlwiKTtcbiAgJCgnI25vdGVzJykudmFsKFwiXCIpO1xuICAkKCcjZGVncmVlcmVxdWlyZW1lbnRfaWQnKS52YWwoXCJcIik7XG4gICQoJyNwbGFuX2lkdmlldycpLnZhbCgkKCcjcGxhbl9pZHZpZXcnKS5hdHRyKCd2YWx1ZScpKTtcbiAgJCgnI2NvdXJzZV9uYW1lJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkJykudmFsKFwiLTFcIik7XG4gICQoJyNjb21wbGV0ZWRjb3Vyc2VfaWRhdXRvJykudmFsKFwiXCIpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZCAoMCkgXCIpO1xuICAkKCcjcmVxdWlyZWFibGUxJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAkKCcjcmVxdWlyZWFibGUyJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgJCgnI3JlcXVpcmVkY291cnNlJykuc2hvdygpO1xuICAkKCcjZWxlY3RpdmVjb3Vyc2UnKS5oaWRlKCk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3BhZ2VzL2Rhc2hib2FyZC9wbGFuZGV0YWlsLmpzIiwidmFyIHNpdGUgPSByZXF1aXJlKCcuLi91dGlsL3NpdGUnKTtcbndpbmRvdy5WdWUgPSByZXF1aXJlKCd2dWUnKTtcbnZhciBkcmFnZ2FibGUgPSByZXF1aXJlKCd2dWVkcmFnZ2FibGUnKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICB3aW5kb3cudm0gPSBuZXcgVnVlKHtcblx0XHRlbDogJyNmbG93Y2hhcnQnLFxuXHRcdGRhdGE6IHtcbiAgICAgIHNlbWVzdGVyczogW10sXG5cdFx0fSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBlZGl0U2VtZXN0ZXI6IGVkaXRTZW1lc3RlcixcbiAgICAgIHNhdmVTZW1lc3Rlcjogc2F2ZVNlbWVzdGVyLFxuICAgICAgZGVsZXRlU2VtZXN0ZXI6IGRlbGV0ZVNlbWVzdGVyLFxuICAgICAgZHJvcFNlbWVzdGVyOiBkcm9wU2VtZXN0ZXIsXG4gICAgICBkcm9wQ291cnNlOiBkcm9wQ291cnNlLFxuICAgICAgZWRpdENvdXJzZTogZWRpdENvdXJzZSxcbiAgICB9LFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIGRyYWdnYWJsZSxcbiAgICB9LFxuICB9KTtcblxuICBsb2FkRGF0YSgpO1xuXG4gICQoJyNyZXNldCcpLm9uKCdjbGljaycsIGxvYWREYXRhKTtcbiAgJCgnI2FkZC1zZW0nKS5vbignY2xpY2snLCBhZGRTZW1lc3Rlcik7XG5cbiAgJCgnI3NhdmVDb3Vyc2UnKS5vbignY2xpY2snLCBzYXZlQ291cnNlKTtcbiAgJCgnI2RlbGV0ZUNvdXJzZScpLm9uKCdjbGljaycsIGRlbGV0ZUNvdXJzZSk7XG5cbiAgYWpheGF1dG9jb21wbGV0ZSgnZWxlY3RpdmVsaXN0X2lkJywgJy9lbGVjdGl2ZWxpc3RzL2VsZWN0aXZlbGlzdGZlZWQnKTtcblxuICBhamF4YXV0b2NvbXBsZXRlKCdjb3Vyc2VfaWQnLCAnL2NvdXJzZXMvY291cnNlZmVlZCcpO1xuXG4gIHZhciBzdHVkZW50X2lkID0gJCgnI3N0dWRlbnRfaWQnKS52YWwoKTtcbiAgYWpheGF1dG9jb21wbGV0ZSgnY29tcGxldGVkY291cnNlX2lkJywgJy9jb21wbGV0ZWRjb3Vyc2VzL2NvbXBsZXRlZGNvdXJzZWZlZWQvJyArIHN0dWRlbnRfaWQpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzb3J0IGVsZW1lbnRzIGJhc2VkIG9uIHRoZWlyIG9yZGVyaW5nXG4gKlxuICogQHBhcmFtIGEgLSBmaXJzdCBpdGVtXG4gKiBAcGFyYW0gYiAtIHNlY29uZCBpdGVtXG4gKiBAcmV0dXJuIC0gc29ydGluZyB2YWx1ZSBpbmRpY2F0aW5nIHdobyBzaG91bGQgZ28gZmlyc3RcbiAqL1xudmFyIHNvcnRGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpe1xuXHRpZihhLm9yZGVyaW5nID09IGIub3JkZXJpbmcpe1xuXHRcdHJldHVybiAoYS5pZCA8IGIuaWQgPyAtMSA6IDEpO1xuXHR9XG5cdHJldHVybiAoYS5vcmRlcmluZyA8IGIub3JkZXJpbmcgPyAtMSA6IDEpO1xufVxuXG52YXIgbG9hZERhdGEgPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZClcbiAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMgPSByZXNwb25zZS5kYXRhO1xuICAgIHdpbmRvdy52bS5zZW1lc3RlcnMuc29ydChzb3J0RnVuY3Rpb24pO1xuICAgICQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVswXS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1jb2xOdW0nLCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aCk7XG4gICAgd2luZG93LmF4aW9zLmdldCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgJC5lYWNoKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgICAgIHZhciBzZW1lc3RlciA9IHdpbmRvdy52bS5zZW1lc3RlcnMuZmluZChmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudC5pZCA9PSB2YWx1ZS5zZW1lc3Rlcl9pZDtcbiAgICAgICAgfSlcbiAgICAgICAgc2VtZXN0ZXIuY291cnNlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgJC5lYWNoKHdpbmRvdy52bS5zZW1lc3RlcnMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG4gICAgICAgIHZhbHVlLmNvdXJzZXMuc29ydChzb3J0RnVuY3Rpb24pO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5oYW5kbGVFcnJvcignZ2V0IGRhdGEnLCAnJywgZXJyb3IpO1xuICAgIH0pO1xuICB9KVxuICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgIHNpdGUuaGFuZGxlRXJyb3IoJ2dldCBkYXRhJywgJycsIGVycm9yKTtcbiAgfSk7XG59XG5cbnZhciBlZGl0U2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBzZW1pZCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAkKFwiI3NlbS1wYW5lbGVkaXQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuaGlkZSgpO1xufVxuXG52YXIgc2F2ZVNlbWVzdGVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgdmFyIHNlbWlkID0gJChldmVudC50YXJnZXQpLmRhdGEoJ2lkJyk7XG4gIHZhciBkYXRhID0ge1xuICAgIGlkOiBzZW1pZCxcbiAgICBuYW1lOiAkKFwiI3NlbS10ZXh0LVwiICsgc2VtaWQpLnZhbCgpXG4gIH1cbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL3NhdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoXCIjc2VtLXBhbmVsZWRpdC1cIiArIHNlbWlkKS5oaWRlKCk7XG4gICAgICAkKFwiI3NlbS1wYW5lbGhlYWQtXCIgKyBzZW1pZCkuc2hvdygpO1xuICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZGVsZXRlU2VtZXN0ZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHZhciBjaG9pY2UgPSBjb25maXJtKFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgICBpZihjaG9pY2UgPT09IHRydWUpe1xuICAgIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICAgIHZhciBzZW1pZCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKCdpZCcpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQ6IHNlbWlkLFxuICAgIH07XG4gICAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL3NlbWVzdGVycy8nICsgaWQgKyAnL2RlbGV0ZScsIGRhdGEpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB3aW5kb3cudm0uc2VtZXN0ZXJzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICBpZih3aW5kb3cudm0uc2VtZXN0ZXJzW2ldLmlkID09IHNlbWlkKXtcbiAgICAgICAgICAgIHdpbmRvdy52bS5zZW1lc3RlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgICB9KTtcbiAgfVxufVxuXG52YXIgYWRkU2VtZXN0ZXIgPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgdmFyIGRhdGEgPSB7XG4gIH07XG4gIHdpbmRvdy5heGlvcy5wb3N0KCcvZmxvd2NoYXJ0cy9zZW1lc3RlcnMvJyArIGlkICsgJy9hZGQnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIHdpbmRvdy52bS5zZW1lc3RlcnMucHVzaChyZXNwb25zZS5kYXRhKTtcbiAgICAgIC8vVnVlLnNldCh3aW5kb3cudm0uc2VtZXN0ZXJzW3dpbmRvdy52bS5zZW1lc3Rlci5sZW5ndGggLSAxXSwgJ2NvdXJzZXMnLCBuZXcgQXJyYXkoKSk7XG4gICAgICAkKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClbMF0uc3R5bGUuc2V0UHJvcGVydHkoJy0tY29sTnVtJywgd2luZG93LnZtLnNlbWVzdGVycy5sZW5ndGgpO1xuICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKFwiSXRlbSBTYXZlZFwiLCBcInN1Y2Nlc3NcIik7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShcIkFKQVggRXJyb3JcIiwgXCJkYW5nZXJcIik7XG4gICAgfSlcbn1cblxudmFyIGRyb3BTZW1lc3RlciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIG9yZGVyaW5nID0gW107XG4gICQuZWFjaCh3aW5kb3cudm0uc2VtZXN0ZXJzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuICAgIG9yZGVyaW5nLnB1c2goe1xuICAgICAgaWQ6IHZhbHVlLmlkLFxuICAgIH0pO1xuICB9KTtcbiAgdmFyIGRhdGEgPSB7XG4gICAgb3JkZXJpbmc6IG9yZGVyaW5nLFxuICB9XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvc2VtZXN0ZXJzLycgKyBpZCArICcvbW92ZScsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgLy9zaXRlLmRpc3BsYXlNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIFwic3VjY2Vzc1wiKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICBzaXRlLmRpc3BsYXlNZXNzYWdlKFwiQUpBWCBFcnJvclwiLCBcImRhbmdlclwiKTtcbiAgICB9KVxufVxuXG52YXIgZHJvcENvdXJzZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdmFyIG9yZGVyaW5nID0gW107XG4gIHZhciB0b1NlbUluZGV4ID0gJChldmVudC50bykuZGF0YSgnaWQnKTtcbiAgJC5lYWNoKHdpbmRvdy52bS5zZW1lc3RlcnNbdG9TZW1JbmRleF0uY291cnNlcywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcbiAgICBvcmRlcmluZy5wdXNoKHtcbiAgICAgIGlkOiB2YWx1ZS5pZCxcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBkYXRhID0ge1xuICAgIHNlbWVzdGVyX2lkOiB3aW5kb3cudm0uc2VtZXN0ZXJzW3RvU2VtSW5kZXhdLmlkLFxuICAgIGNvdXJzZV9pZDogJChldmVudC5pdGVtKS5kYXRhKCdpZCcpLFxuICAgIG9yZGVyaW5nOiBvcmRlcmluZyxcbiAgfVxuICB2YXIgaWQgPSAkKCcjaWQnKS52YWwoKTtcbiAgd2luZG93LmF4aW9zLnBvc3QoJy9mbG93Y2hhcnRzL2RhdGEvJyArIGlkICsgJy9tb3ZlJywgZGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAvL3NpdGUuZGlzcGxheU1lc3NhZ2UocmVzcG9uc2UuZGF0YSwgXCJzdWNjZXNzXCIpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuZGlzcGxheU1lc3NhZ2UoXCJBSkFYIEVycm9yXCIsIFwiZGFuZ2VyXCIpO1xuICAgIH0pXG59XG5cbnZhciBlZGl0Q291cnNlID0gZnVuY3Rpb24oZXZlbnQpe1xuICB2YXIgY291cnNlSW5kZXggPSAkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKTtcbiAgdmFyIHNlbUluZGV4ID0gJChldmVudC50YXJnZXQpLmRhdGEoJ3NlbScpO1xuICB2YXIgY291cnNlID0gd2luZG93LnZtLnNlbWVzdGVyc1tzZW1JbmRleF0uY291cnNlc1tjb3Vyc2VJbmRleF07XG4gICQoJyNjb3Vyc2VfbmFtZScpLnZhbChjb3Vyc2UubmFtZSk7XG4gICQoJyNjcmVkaXRzJykudmFsKGNvdXJzZS5jcmVkaXRzKTtcbiAgJCgnI25vdGVzJykudmFsKGNvdXJzZS5ub3Rlcyk7XG4gICQoJyNwbGFucmVxdWlyZW1lbnRfaWQnKS52YWwoY291cnNlLmlkKTtcbiAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjZWxlY3RpdmVsaXN0X2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgY291cnNlLmVsZWN0aXZlbGlzdF9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KGNvdXJzZS5lbGVjdGl2ZWxpc3RfbmFtZSwgMzApKTtcbiAgJCgnI2NvdXJzZV9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgY291cnNlLmNvdXJzZV9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KGNvdXJzZS5jb3Vyc2VfbmFtZSwgMzApKTtcbiAgJCgnI2NvbXBsZXRlZGNvdXJzZV9pZGF1dG8nKS52YWwoJycpO1xuICAkKCcjY29tcGxldGVkY291cnNlX2lkdGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgY291cnNlLmNvbXBsZXRlZGNvdXJzZV9pZCArIFwiKSBcIiArIHNpdGUudHJ1bmNhdGVUZXh0KGNvdXJzZS5jb21wbGV0ZWRjb3Vyc2VfbmFtZSwgMzApKTtcbiAgaWYoY291cnNlLmRlZ3JlZXJlcXVpcmVtZW50X2lkIDw9IDApe1xuICAgICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICQoJyNjcmVkaXRzJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAkKCcjZGVsZXRlQ291cnNlJykuc2hvdygpO1xuICB9ZWxzZXtcbiAgICBpZihjb3Vyc2UuZWxlY3RpdmVsaXN0X2lkIDw9IDApe1xuICAgICAgJCgnI2NvdXJzZV9uYW1lJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICB9ZWxzZXtcbiAgICAgICQoJyNjb3Vyc2VfbmFtZScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgIH1cbiAgICAkKCcjY3JlZGl0cycpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgJCgnI2VsZWN0aXZlbGlzdF9pZGF1dG8nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICQoJyNkZWxldGVDb3Vyc2UnKS5oaWRlKCk7XG4gIH1cblxuICAkKCcjZWRpdENvdXJzZScpLm1vZGFsKCdzaG93Jyk7XG59XG5cbnZhciBzYXZlQ291cnNlID0gZnVuY3Rpb24oKXtcbiAgJCgnI3NwaW4nKS5yZW1vdmVDbGFzcygnaGlkZS1zcGluJyk7XG4gIHZhciBpZCA9ICQoJyNpZCcpLnZhbCgpO1xuICB2YXIgcGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB2YXIgZGF0YSA9IHtcbiAgICBub3RlczogJCgnI25vdGVzJykudmFsKCksXG4gIH1cbiAgaWYoJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpLmxlbmd0aCA+IDApe1xuICAgIGRhdGEucGxhbnJlcXVpcmVtZW50X2lkID0gJCgnI3BsYW5yZXF1aXJlbWVudF9pZCcpLnZhbCgpO1xuICB9XG4gIGlmKCQoJyNjb3Vyc2VfaWQnKS52YWwoKSA+IDApe1xuICAgIGRhdGEuY291cnNlX2lkID0gJCgnI2NvdXJzZV9pZCcpLnZhbCgpO1xuICB9XG4gIGlmKCQoJyNjb21wbGV0ZWRjb3Vyc2VfaWQnKS52YWwoKSA+IDApe1xuICAgIGRhdGEuY29tcGxldGVkY291cnNlX2lkID0gJCgnI2NvbXBsZXRlZGNvdXJzZV9pZCcpLnZhbCgpO1xuICB9XG4gIGlmKCEkKCcjY291cnNlX25hbWUnKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGRhdGEuY291cnNlX25hbWUgPSAkKCcjY291cnNlX25hbWUnKS52YWwoKTtcbiAgfVxuICBpZighJCgnI2NyZWRpdHMnKS5pcygnOmRpc2FibGVkJykpe1xuICAgIGRhdGEuY3JlZGl0cyA9ICQoJyNjcmVkaXRzJykudmFsKCk7XG4gIH1cbiAgaWYoISQoJyNlbGVjdGl2ZWxpc3RfaWRhdXRvJykuaXMoJzpkaXNhYmxlZCcpKXtcbiAgICBpZigkKCcjZWxlY3RpdmVsaXN0X2lkJykudmFsKCkgPiAwKXtcbiAgICAgIGRhdGEuZWxlY3RpdmVsaXN0X2lkID0gJCgnI2VsZWN0aXZlbGlzdF9pZCcpLnZhbCgpO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuYXhpb3MucG9zdCgnL2Zsb3djaGFydHMvZGF0YS8nICsgaWQgKyAnL3NhdmUnLCBkYXRhKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICQoJyNlZGl0Q291cnNlJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICQoJyNzcGluJykuYWRkQ2xhc3MoJ2hpZGUtc3BpbicpO1xuICAgICAgc2l0ZS5kaXNwbGF5TWVzc2FnZShyZXNwb25zZS5kYXRhLCBcInN1Y2Nlc3NcIik7XG4gICAgICBsb2FkRGF0YSgpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgIHNpdGUuaGFuZGxlRXJyb3IoXCJzYXZlIGNvdXJzZVwiLCBcIiNlZGl0Q291cnNlXCIsIGVycm9yKTtcbiAgICB9KTtcblxufVxuXG52YXIgZGVsZXRlQ291cnNlID0gZnVuY3Rpb24oZXZlbnQpe1xuICBjb25zb2xlLmxvZygkKGV2ZW50LnRhcmdldCkuZGF0YSgnaWQnKSk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYXV0b2NvbXBsZXRlIGEgZmllbGQgKGR1cGxpY2F0ZWQgZnJvbSBkYXNoYm9hcmQpXG4gKlxuICogQHBhcmFtIGlkIC0gdGhlIElEIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIHVybCAtIHRoZSBVUkwgdG8gcmVxdWVzdCBkYXRhIGZyb21cbiAqL1xudmFyIGFqYXhhdXRvY29tcGxldGUgPSBmdW5jdGlvbihpZCwgdXJsKXtcbiAgJCgnIycgKyBpZCArICdhdXRvJykuYXV0b2NvbXBsZXRlKHtcblx0ICAgIHNlcnZpY2VVcmw6IHVybCxcblx0ICAgIGFqYXhTZXR0aW5nczoge1xuXHQgICAgXHRkYXRhVHlwZTogXCJqc29uXCJcblx0ICAgIH0sXG4gICAgICBtaW5DaGFyczogMyxcblx0ICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuXHQgICAgICAgICQoJyMnICsgaWQpLnZhbChzdWdnZXN0aW9uLmRhdGEpO1xuICAgICAgICAgICQoJyMnICsgaWQgKyAndGV4dCcpLmh0bWwoXCJTZWxlY3RlZDogKFwiICsgc3VnZ2VzdGlvbi5kYXRhICsgXCIpIFwiICsgc2l0ZS50cnVuY2F0ZVRleHQoc3VnZ2VzdGlvbi52YWx1ZSwgMzApKTtcblx0ICAgIH0sXG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQubWFwKHJlc3BvbnNlLmRhdGEsIGZ1bmN0aW9uKGRhdGFJdGVtKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogZGF0YUl0ZW0udmFsdWUsIGRhdGE6IGRhdGFJdGVtLmRhdGEgfTtcblx0ICAgICAgICAgICAgfSlcblx0ICAgICAgICB9O1xuXHQgICAgfVxuXHR9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvcGFnZXMvZmxvd2NoYXJ0LmpzIiwidmFyIGRhc2hib2FyZCA9IHJlcXVpcmUoJy4uL3V0aWwvZGFzaGJvYXJkJyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBvcHRpb25zID0gZGFzaGJvYXJkLmRhdGFUYWJsZU9wdGlvbnM7XG4gIGRhc2hib2FyZC5pbml0KG9wdGlvbnMpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcmVzb3VyY2VzL2Fzc2V0cy9qcy9wYWdlcy9mbG93Y2hhcnRsaXN0LmpzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvc2Fzcy9hcHAuc2Nzc1xuLy8gbW9kdWxlIGlkID0gMjA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL3Nhc3MvZmxvd2NoYXJ0LnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDIwOVxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvKipcbiAqIERpc3BsYXlzIGEgbWVzc2FnZSBmcm9tIHRoZSBmbGFzaGVkIHNlc3Npb24gZGF0YVxuICpcbiAqIHVzZSAkcmVxdWVzdC0+c2Vzc2lvbigpLT5wdXQoJ21lc3NhZ2UnLCB0cmFucygnbWVzc2FnZXMuaXRlbV9zYXZlZCcpKTtcbiAqICAgICAkcmVxdWVzdC0+c2Vzc2lvbigpLT5wdXQoJ3R5cGUnLCAnc3VjY2VzcycpO1xuICogdG8gc2V0IG1lc3NhZ2UgdGV4dCBhbmQgdHlwZVxuICovXG5leHBvcnRzLmRpc3BsYXlNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSl7XG5cdHZhciBodG1sID0gJzxkaXYgaWQ9XCJqYXZhc2NyaXB0TWVzc2FnZVwiIGNsYXNzPVwiYWxlcnQgZmFkZSBpbiBhbGVydC1kaXNtaXNzYWJsZSBhbGVydC0nICsgdHlwZSArICdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWxhYmVsPVwiQ2xvc2VcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjwvYnV0dG9uPjxzcGFuIGNsYXNzPVwiaDRcIj4nICsgbWVzc2FnZSArICc8L3NwYW4+PC9kaXY+Jztcblx0JCgnI21lc3NhZ2UnKS5hcHBlbmQoaHRtbCk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0JChcIiNqYXZhc2NyaXB0TWVzc2FnZVwiKS5hbGVydCgnY2xvc2UnKTtcblx0fSwgMzAwMCk7XG59O1xuXG4vKlxuZXhwb3J0cy5hamF4Y3JzZiA9IGZ1bmN0aW9uKCl7XG5cdCQuYWpheFNldHVwKHtcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuXHRcdH1cblx0fSk7XG59O1xuKi9cblxuLyoqXG4gKiBDbGVhcnMgZXJyb3JzIG9uIGZvcm1zIGJ5IHJlbW92aW5nIGVycm9yIGNsYXNzZXNcbiAqL1xuZXhwb3J0cy5jbGVhckZvcm1FcnJvcnMgPSBmdW5jdGlvbigpe1xuXHQkKCcuZm9ybS1ncm91cCcpLmVhY2goZnVuY3Rpb24gKCl7XG5cdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0JCh0aGlzKS5maW5kKCcuaGVscC1ibG9jaycpLnRleHQoJycpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBTZXRzIGVycm9ycyBvbiBmb3JtcyBiYXNlZCBvbiByZXNwb25zZSBKU09OXG4gKi9cbmV4cG9ydHMuc2V0Rm9ybUVycm9ycyA9IGZ1bmN0aW9uKGpzb24pe1xuXHRleHBvcnRzLmNsZWFyRm9ybUVycm9ycygpO1xuXHQkLmVhY2goanNvbiwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblx0XHQkKCcjJyArIGtleSkucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG5cdFx0JCgnIycgKyBrZXkgKyAnaGVscCcpLnRleHQodmFsdWUuam9pbignICcpKTtcblx0fSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGZvciBtZXNzYWdlcyBpbiB0aGUgZmxhc2ggZGF0YS4gTXVzdCBiZSBjYWxsZWQgZXhwbGljaXRseSBieSB0aGUgcGFnZVxuICovXG5leHBvcnRzLmNoZWNrTWVzc2FnZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKCQoJyNtZXNzYWdlX2ZsYXNoJykubGVuZ3RoKXtcblx0XHR2YXIgbWVzc2FnZSA9ICQoJyNtZXNzYWdlX2ZsYXNoJykudmFsKCk7XG5cdFx0dmFyIHR5cGUgPSAkKCcjbWVzc2FnZV90eXBlX2ZsYXNoJykudmFsKCk7XG5cdFx0ZXhwb3J0cy5kaXNwbGF5TWVzc2FnZShtZXNzYWdlLCB0eXBlKTtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBlcnJvcnMgZnJvbSBBSkFYXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgLSB0aGUgbWVzc2FnZSB0byBkaXNwbGF5IHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBqUXVlcnkgaWRlbnRpZmllciBvZiB0aGUgZWxlbWVudFxuICogQHBhcmFtIGVycm9yIC0gdGhlIEF4aW9zIGVycm9yIHJlY2VpdmVkXG4gKi9cbmV4cG9ydHMuaGFuZGxlRXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlLCBlbGVtZW50LCBlcnJvcil7XG5cdGlmKGVycm9yLnJlc3BvbnNlKXtcblx0XHQvL0lmIHJlc3BvbnNlIGlzIDQyMiwgZXJyb3JzIHdlcmUgcHJvdmlkZWRcblx0XHRpZihlcnJvci5yZXNwb25zZS5zdGF0dXMgPT0gNDIyKXtcblx0XHRcdGV4cG9ydHMuc2V0Rm9ybUVycm9ycyhlcnJvci5yZXNwb25zZS5kYXRhKTtcblx0XHR9ZWxzZXtcblx0XHRcdGFsZXJ0KFwiVW5hYmxlIHRvIFwiICsgbWVzc2FnZSArIFwiOiBcIiArIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xuXHRcdH1cblx0fVxuXG5cdC8vaGlkZSBzcGlubmluZyBpY29uXG5cdGlmKGVsZW1lbnQubGVuZ3RoID4gMCl7XG5cdFx0JChlbGVtZW50ICsgJ3NwaW4nKS5hZGRDbGFzcygnaGlkZS1zcGluJyk7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byB0cnVuY2F0ZSB0ZXh0XG4gKlxuICogQHBhcmFtIHRleHQgLSB0aGUgdGV4dCB0byB0cnVuY2F0ZVxuICogQHBhcmFtIGxlbmd0aCAtIHRoZSBtYXhpbXVtIGxlbmd0aFxuICpcbiAqIGh0dHA6Ly9qc2ZpZGRsZS5uZXQvc2NoYWRlY2svR3BDWkwvXG4gKi9cbmV4cG9ydHMudHJ1bmNhdGVUZXh0ID0gZnVuY3Rpb24odGV4dCwgbGVuZ3RoKXtcblx0aWYodGV4dC5sZW5ndGggPiBsZW5ndGgpe1xuXHRcdHJldHVybiAkLnRyaW0odGV4dCkuc3Vic3RyaW5nKDAsIGxlbmd0aCkuc3BsaXQoXCIgXCIpLnNsaWNlKDAsIC0xKS5qb2luKFwiIFwiKSArIFwiLi4uXCI7XG5cdH1lbHNle1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9yZXNvdXJjZXMvYXNzZXRzL2pzL3V0aWwvc2l0ZS5qcyIsIi8qKlxuICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gZm9yIGVkaXRhYmxlIHRleHQtYm94ZXMgb24gdGhlIHNpdGVcbiAqIE11c3QgYmUgY2FsbGVkIGV4cGxpY2l0bHlcbiAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKXtcblxuICAvL0xvYWQgcmVxdWlyZWQgbGlicmFyaWVzXG4gIHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbiAgcmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL3htbC94bWwuanMnKTtcbiAgcmVxdWlyZSgnc3VtbWVybm90ZScpO1xuXG4gIC8vUmVnaXN0ZXIgY2xpY2sgaGFuZGxlcnMgZm9yIFtlZGl0XSBsaW5rc1xuICAkKCcuZWRpdGFibGUtbGluaycpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vaGlkZSB0aGUgW2VkaXRdIGxpbmtzLCBlbmFibGUgZWRpdG9yLCBhbmQgc2hvdyBTYXZlIGFuZCBDYW5jZWwgYnV0dG9uc1xuICAgICAgJCgnI2VkaXRhYmxlYnV0dG9uLScgKyBpZCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnI2VkaXRhYmxlc2F2ZS0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoe1xuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdG9vbGJhcjogW1xuICAgICAgICAgIC8vIFtncm91cE5hbWUsIFtsaXN0IG9mIGJ1dHRvbnNdXVxuICAgICAgICAgIFsnc3R5bGUnLCBbJ3N0eWxlJywgJ2JvbGQnLCAnaXRhbGljJywgJ3VuZGVybGluZScsICdjbGVhciddXSxcbiAgICAgICAgICBbJ2ZvbnQnLCBbJ3N0cmlrZXRocm91Z2gnLCAnc3VwZXJzY3JpcHQnLCAnc3Vic2NyaXB0JywgJ2xpbmsnXV0sXG4gICAgICAgICAgWydwYXJhJywgWyd1bCcsICdvbCcsICdwYXJhZ3JhcGgnXV0sXG4gICAgICAgICAgWydtaXNjJywgWydmdWxsc2NyZWVuJywgJ2NvZGV2aWV3JywgJ2hlbHAnXV0sXG4gICAgICAgIF0sXG4gICAgICAgIHRhYnNpemU6IDIsXG4gICAgICAgIGNvZGVtaXJyb3I6IHtcbiAgICAgICAgICBtb2RlOiAndGV4dC9odG1sJyxcbiAgICAgICAgICBodG1sTW9kZTogdHJ1ZSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ21vbm9rYWknXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgU2F2ZSBidXR0b25zXG4gICQoJy5lZGl0YWJsZS1zYXZlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvL2dldCBJRCBvZiBpdGVtIGNsaWNrZWRcbiAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcblxuICAgICAgLy9EaXNwbGF5IHNwaW5uZXIgd2hpbGUgQUpBWCBjYWxsIGlzIHBlcmZvcm1lZFxuICAgICAgJCgnI2VkaXRhYmxlc3Bpbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRlLXNwaW4nKTtcblxuICAgICAgLy9HZXQgY29udGVudHMgb2YgZWRpdG9yXG4gICAgICB2YXIgaHRtbFN0cmluZyA9ICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ2NvZGUnKTtcblxuICAgICAgLy9Qb3N0IGNvbnRlbnRzIHRvIHNlcnZlciwgd2FpdCBmb3IgcmVzcG9uc2VcbiAgICAgIHdpbmRvdy5heGlvcy5wb3N0KCcvZWRpdGFibGUvc2F2ZS8nICsgaWQsIHtcbiAgICAgICAgY29udGVudHM6IGh0bWxTdHJpbmdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIC8vSWYgcmVzcG9uc2UgMjAwIHJlY2VpdmVkLCBhc3N1bWUgaXQgc2F2ZWQgYW5kIHJlbG9hZCBwYWdlXG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChcIlVuYWJsZSB0byBzYXZlIGNvbnRlbnQ6IFwiICsgZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9SZWdpc3RlciBjbGljayBoYW5kbGVycyBmb3IgQ2FuY2VsIGJ1dHRvbnNcbiAgJCgnLmVkaXRhYmxlLWNhbmNlbCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy9nZXQgSUQgb2YgaXRlbSBjbGlja2VkXG4gICAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG5cbiAgICAgIC8vUmVzZXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0b3IgYW5kIGRlc3Ryb3kgaXRcbiAgICAgICQoJyNlZGl0YWJsZS0nICsgaWQpLnN1bW1lcm5vdGUoJ3Jlc2V0Jyk7XG4gICAgICAkKCcjZWRpdGFibGUtJyArIGlkKS5zdW1tZXJub3RlKCdkZXN0cm95Jyk7XG5cbiAgICAgIC8vSGlkZSBTYXZlIGFuZCBDYW5jZWwgYnV0dG9ucywgYW5kIHNob3cgW2VkaXRdIGxpbmtcbiAgICAgICQoJyNlZGl0YWJsZWJ1dHRvbi0nICsgaWQpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJyNlZGl0YWJsZXNhdmUtJyArIGlkKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3Jlc291cmNlcy9hc3NldHMvanMvdXRpbC9lZGl0YWJsZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=