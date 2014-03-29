
var Module;
if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    }
    var PACKAGE_NAME = '../build/dav_smallptgpuv1.data';
    var REMOTE_PACKAGE_NAME = (Module['filePackagePrefixURL'] || '') + 'dav_smallptgpuv1.data';
    var REMOTE_PACKAGE_SIZE = 89407;
    var PACKAGE_UUID = '985bf999-e9c8-4db0-8a2b-65db67c0e46f';
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}
Module['FS_createPath']('/', 'scenes', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;
        Module['FS_createPreloadedFile'](this.name, null, byteArray, true, true, function() {
          Module['removeRunDependency']('fp ' + that.name);
        }, function() {
          if (that.audio) {
            Module['removeRunDependency']('fp ' + that.name); // workaround for chromium bug 124926 (still no audio with this, but at least we don't hang)
          } else {
            Module.printErr('Preloading file ' + that.name + ' failed');
          }
        }, false, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        this.requests[this.name] = null;
      },
    };
      new DataRequest(0, 23200, 0, 0).open('GET', '/preprocessed_rendering_kernel.cl');
    new DataRequest(23200, 46403, 0, 0).open('GET', '/preprocessed_rendering_kernel_dl.cl');
    new DataRequest(46403, 47956, 0, 0).open('GET', '/scene_build_complex.pl');
    new DataRequest(47956, 48146, 0, 0).open('GET', '/scenes/caustic.scn');
    new DataRequest(48146, 48439, 0, 0).open('GET', '/scenes/caustic3.scn');
    new DataRequest(48439, 87959, 0, 0).open('GET', '/scenes/complex.scn');
    new DataRequest(87959, 88538, 0, 0).open('GET', '/scenes/cornell_large.scn');
    new DataRequest(88538, 89115, 0, 0).open('GET', '/scenes/cornell.scn');
    new DataRequest(89115, 89407, 0, 0).open('GET', '/scenes/simple.scn');

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/preprocessed_rendering_kernel.cl"].onload();
          DataRequest.prototype.requests["/preprocessed_rendering_kernel_dl.cl"].onload();
          DataRequest.prototype.requests["/scene_build_complex.pl"].onload();
          DataRequest.prototype.requests["/scenes/caustic.scn"].onload();
          DataRequest.prototype.requests["/scenes/caustic3.scn"].onload();
          DataRequest.prototype.requests["/scenes/complex.scn"].onload();
          DataRequest.prototype.requests["/scenes/cornell_large.scn"].onload();
          DataRequest.prototype.requests["/scenes/cornell.scn"].onload();
          DataRequest.prototype.requests["/scenes/simple.scn"].onload();
          Module['removeRunDependency']('datafile_../build/dav_smallptgpuv1.data');

    };
    Module['addRunDependency']('datafile_../build/dav_smallptgpuv1.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

})();

// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(5267);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,49,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,50,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,51,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,52,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,53,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,54,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,55,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,56,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,57,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,116,104,101,32,79,112,101,110,67,76,32,112,105,120,101,108,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,82,101,110,100,101,114,105,110,103,32,116,105,109,101,32,37,46,51,102,32,115,101,99,32,40,112,97,115,115,32,37,100,41,32,32,83,97,109,112,108,101,47,115,101,99,32,32,37,46,49,102,75,10,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,104,101,32,79,112,101,110,67,76,32,115,99,101,110,101,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,104,101,32,79,112,101,110,67,76,32,99,97,109,101,114,97,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,85,115,97,103,101,58,32,37,115,10,0,0,0,0,0,0,85,115,97,103,101,58,32,37,115,32,60,117,115,101,32,67,80,85,47,71,80,85,32,100,101,118,105,99,101,32,40,48,61,67,80,85,32,111,114,32,49,61,71,80,85,41,62,32,60,119,111,114,107,103,114,111,117,112,32,115,105,122,101,32,40,48,61,100,101,102,97,117,108,116,32,118,97,108,117,101,32,111,114,32,97,110,121,116,104,105,110,103,32,62,32,48,32,97,110,100,32,112,111,119,101,114,32,111,102,32,50,41,62,32,60,107,101,114,110,101,108,32,102,105,108,101,32,110,97,109,101,62,32,60,119,105,110,100,111,119,32,119,105,100,116,104,62,32,60,119,105,110,100,111,119,32,104,101,105,103,104,116,62,32,60,115,99,101,110,101,32,102,105,108,101,62,10,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,11,0,0,0,0,0,0,0,64,28,70,0,68,28,70,51,51,35,66,51,51,163,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,63,0,0,128,62,0,0,128,62,0,0,0,0,0,64,28,70,0,180,26,198,51,51,35,66,51,51,163,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,62,0,0,128,62,0,0,64,63,0,0,0,0,0,64,28,70,0,0,72,66,51,51,35,66,0,64,28,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,63,0,0,64,63,0,0,64,63,0,0,0,0,0,64,28,70,0,0,72,66,51,51,35,66,0,8,24,198,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,28,70,0,0,72,66,0,64,28,70,51,51,163,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,63,0,0,64,63,0,0,64,63,0,0,0,0,0,64,28,70,0,0,72,66,154,249,26,198,51,51,163,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,63,0,0,64,63,0,0,64,63,0,0,0,0,0,0,132,65,0,0,216,65,0,0,132,65,0,0,60,66,0,0,0,0,0,0,0,0,0,0,0,0,102,102,102,63,102,102,102,63,102,102,102,63,1,0,0,0,0,0,132,65,0,0,146,66,0,0,132,65,0,0,156,66,0,0,0,0,0,0,0,0,0,0,0,0,102,102,102,63,102,102,102,63,102,102,102,63,2,0,0,0,0,0,224,64,0,0,72,66,51,51,133,66,51,51,163,66,0,0,64,65,0,0,64,65,0,0,64,65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,109,97,108,108,80,84,32,71,80,85,32,86,49,46,54,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,115,10,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,32,73,68,115,10,0,0,0,0,0,0,79,112,101,110,67,76,32,80,108,97,116,102,111,114,109,32,37,100,58,32,37,115,10,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,100,101,118,105,99,101,32,73,68,115,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,100,101,118,105,99,101,32,105,110,102,111,58,32,37,100,10,0,0,0,84,89,80,69,95,65,76,76,0,0,0,0,0,0,0,0,84,89,80,69,95,68,69,70,65,85,76,84,0,0,0,0,84,89,80,69,95,67,80,85,0,0,0,0,0,0,0,0,84,89,80,69,95,71,80,85,0,0,0,0,0,0,0,0,84,89,80,69,95,85,78,75,78,79,87,78,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,84,121,112,101,32,61,32,37,115,10,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,78,97,109,101,32,61,32,37,115,10,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,67,111,109,112,117,116,101,32,117,110,105,116,115,32,61,32,37,117,10,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,77,97,120,46,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,0,0,0,85,110,97,98,108,101,32,116,111,32,115,101,108,101,99,116,32,97,110,32,97,112,112,114,111,112,114,105,97,116,101,32,100,101,118,105,99,101,10,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,10,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,32,105,110,102,111,58,32,37,100,10,0,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,84,121,112,101,32,61,32,37,115,10,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,78,97,109,101,32,61,32,37,115,10,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,67,111,109,112,117,116,101,32,117,110,105,116,115,32,61,32,37,117,10,0,0,0,0,0,0,0,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,77,97,120,46,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,111,109,109,97,110,100,32,113,117,101,117,101,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,115,99,101,110,101,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,97,109,101,114,97,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,115,111,117,114,99,101,115,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,79,112,101,110,67,76,32,107,101,114,110,101,108,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,105,110,102,111,32,115,105,122,101,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,105,110,102,111,58,32,37,100,10,0,0,0,79,112,101,110,67,76,32,80,114,111,103,114,97,109,109,32,66,117,105,108,100,32,76,111,103,58,32,37,115,10,0,0,82,97,100,105,97,110,99,101,71,80,85,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,107,101,114,110,101,108,58,32,37,100,10,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,105,110,102,111,58,32,37,100,10,0,0,0,1,0,0,0,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,48,58,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,48,58,32,102,111,114,99,101,100,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,0,0,0,114,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,101,107,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,104,101,99,107,32,112,111,115,105,116,105,111,110,32,111,110,32,102,105,108,101,32,39,37,115,39,10,0,0,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,32,102,111,114,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,0,82,101,97,100,105,110,103,32,102,105,108,101,32,39,37,115,39,32,40,115,105,122,101,32,37,108,100,32,98,121,116,101,115,41,10,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,102,105,108,101,32,39,37,115,39,32,40,114,101,97,100,32,37,108,100,41,10,0,0,0,0,112,114,101,112,114,111,99,101,115,115,101,100,95,114,101,110,100,101,114,105,110,103,95,107,101,114,110,101,108,95,100,108,46,99,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,111,117,116,112,117,116,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,112,105,120,101,108,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,115,101,101,100,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,104,101,32,79,112,101,110,67,76,32,115,101,101,100,115,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,99,111,108,111,114,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,112,105,120,101,108,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,115,101,101,100,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,101,110,113,117,101,117,101,32,79,112,101,110,67,76,32,119,111,114,107,58,32,37,100,10,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,82,101,97,100,105,110,103,32,115,99,101,110,101,58,32,37,115,10,0,0,0,0,0,0,114,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,58,32,37,115,10,0,0,0,0,0,0,0,0,99,97,109,101,114,97,32,37,102,32,37,102,32,37,102,32,32,37,102,32,37,102,32,37,102,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,54,32,99,97,109,101,114,97,32,112,97,114,97,109,101,116,101,114,115,58,32,37,100,10,0,115,105,122,101,32,37,117,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,115,112,104,101,114,101,32,99,111,117,110,116,58,32,37,100,10,0,0,0,0,0,0,0,0,83,99,101,110,101,32,115,105,122,101,58,32,37,100,10,0,115,112,104,101,114,101,32,37,102,32,32,37,102,32,37,102,32,37,102,32,32,37,102,32,37,102,32,37,102,32,32,37,102,32,37,102,32,37,102,32,32,37,100,10,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,109,97,116,101,114,105,97,108,32,116,121,112,101,32,102,111,114,32,115,112,104,101,114,101,32,35,37,100,58,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,115,112,104,101,114,101,32,35,37,100,58,32,37,100,10,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,225,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,25,0,0,0,0,0,0,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,109,97,108,108,112,116,67,80,85,32,118,49,46,54,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,0,83,109,97,108,108,112,116,71,80,85,32,118,49,46,54,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,105,109,97,103,101,46,112,112,109,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,105,109,97,103,101,32,102,105,108,101,58,32,105,109,97,103,101,46,112,112,109,10,0,0,0,80,51,10,37,100,32,37,100,10,37,100,10,0,0,0,0,37,100,32,37,100,32,37,100,32,0,0,0,0,0,0,0,68,111,110,101,46,10,0,0,0,0,0,0,0,0,0,0,83,101,108,101,99,116,101,100,32,115,112,104,101,114,101,32,37,100,32,40,37,102,32,37,102,32,37,102,41,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,191,0,0,128,191,0,0,128,63,0,0,128,191,0,0,128,63,0,0,128,63,0,0,128,191,0,0,128,63,67,114,101,97,116,105,110,103,32,84,101,120,116,117,114,101,32,49,32,37,100,32,120,32,37,100,46,46,46,10,0,0,193,132,0,0,0,0,0,0,8,25,0,0,0,0,0,0,72,101,108,112,0,0,0,0,104,32,45,32,116,111,103,103,108,101,32,72,101,108,112,0,97,114,114,111,119,32,75,101,121,115,32,45,32,114,111,116,97,116,101,32,99,97,109,101,114,97,32,108,101,102,116,47,114,105,103,104,116,47,117,112,47,100,111,119,110,0,0,0,97,32,97,110,100,32,100,32,45,32,109,111,118,101,32,99,97,109,101,114,97,32,108,101,102,116,32,97,110,100,32,114,105,103,104,116,0,0,0,0,119,32,97,110,100,32,115,32,45,32,109,111,118,101,32,99,97,109,101,114,97,32,102,111,114,119,97,114,100,32,97,110,100,32,98,97,99,107,119,97,114,100,0,0,0,0,0,0,114,32,97,110,100,32,102,32,45,32,109,111,118,101,32,99,97,109,101,114,97,32,117,112,32,97,110,100,32,100,111,119,110,0,0,0,0,0,0,0,80,97,103,101,85,112,32,97,110,100,32,80,97,103,101,68,111,119,110,32,45,32,109,111,118,101,32,99,97,109,101,114,97,32,116,97,114,103,101,116,32,117,112,32,97,110,100,32,100,111,119,110,0,0,0,0,43,32,97,110,100,32,45,32,45,32,116,111,32,115,101,108,101,99,116,32,110,101,120,116,47,112,114,101,118,105,111,117,115,32,111,98,106,101,99,116,0,0,0,0,0,0,0,0,50,44,32,51,44,32,52,44,32,53,44,32,54,44,32,56,44,32,57,32,45,32,116,111,32,109,111,118,101,32,115,101,108,101,99,116,101,100,32,111,98,106,101,99,116,0,0,0,37,115,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
   
  Module["_rand_r"] = _rand_r;
  
  var ___rand_seed=allocate([0x0273459b, 0, 0, 0], "i32", ALLOC_STATIC); 
  Module["_rand"] = _rand;

  
  var GL={counter:1,lastError:0,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],currArrayBuffer:0,currElementArrayBuffer:0,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},packAlignment:4,unpackAlignment:4,init:function () {
        GL.createLog2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
        Browser.moduleContextCreatedCallbacks.push(GL.initExtensions);
      },recordError:function recordError(errorCode) {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },getNewId:function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },MINI_TEMP_BUFFER_SIZE:16,miniTempBuffer:null,miniTempBufferViews:[0],MAX_TEMP_BUFFER_SIZE:2097152,tempVertexBuffers1:[],tempVertexBufferCounters1:[],tempVertexBuffers2:[],tempVertexBufferCounters2:[],numTempVertexBuffersPerSize:64,tempIndexBuffers:[],tempQuadIndexBuffer:null,log2ceilLookup:null,createLog2ceilLookup:function (maxValue) {
        GL.log2ceilLookup = new Uint8Array(maxValue+1);
        var log2 = 0;
        var pow2 = 1;
        GL.log2ceilLookup[0] = 0;
        for(var i = 1; i <= maxValue; ++i) {
          if (i > pow2) {
            pow2 <<= 1;
            ++log2;
          }
          GL.log2ceilLookup[i] = log2;
        }
      },generateTempBuffers:function (quads) {
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        GL.tempVertexBufferCounters1.length = GL.tempVertexBufferCounters2.length = largestIndex+1;
        GL.tempVertexBuffers1.length = GL.tempVertexBuffers2.length = largestIndex+1;
        GL.tempIndexBuffers.length = largestIndex+1;
        for(var i = 0; i <= largestIndex; ++i) {
          GL.tempIndexBuffers[i] = null; // Created on-demand
          GL.tempVertexBufferCounters1[i] = GL.tempVertexBufferCounters2[i] = 0;
          var ringbufferLength = GL.numTempVertexBuffersPerSize;
          GL.tempVertexBuffers1[i] = [];
          GL.tempVertexBuffers2[i] = [];
          var ringbuffer1 = GL.tempVertexBuffers1[i];
          var ringbuffer2 = GL.tempVertexBuffers2[i];
          ringbuffer1.length = ringbuffer2.length = ringbufferLength;
          for(var j = 0; j < ringbufferLength; ++j) {
            ringbuffer1[j] = ringbuffer2[j] = null; // Created on-demand
          }
        }
  
        if (quads) {
          // GL_QUAD indexes can be precalculated
          GL.tempQuadIndexBuffer = GLctx.createBuffer();
          GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.tempQuadIndexBuffer);
          var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
          var quadIndexes = new Uint16Array(numIndexes);
          var i = 0, v = 0;
          while (1) {
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+1;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+3;
            if (i >= numIndexes) break;
            v += 4;
          }
          GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, quadIndexes, GLctx.STATIC_DRAW);
          GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, null);
        }
      },getTempVertexBuffer:function getTempVertexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ringbuffer = GL.tempVertexBuffers1[idx];
        var nextFreeBufferIndex = GL.tempVertexBufferCounters1[idx];
        GL.tempVertexBufferCounters1[idx] = (GL.tempVertexBufferCounters1[idx]+1) & (GL.numTempVertexBuffersPerSize-1);
        var vbo = ringbuffer[nextFreeBufferIndex];
        if (vbo) {
          return vbo;
        }
        var prevVBO = GLctx.getParameter(GLctx.ARRAY_BUFFER_BINDING);
        ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, ringbuffer[nextFreeBufferIndex]);
        GLctx.bufferData(GLctx.ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, prevVBO);
        return ringbuffer[nextFreeBufferIndex];
      },getTempIndexBuffer:function getTempIndexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ibo = GL.tempIndexBuffers[idx];
        if (ibo) {
          return ibo;
        }
        var prevIBO = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
        GL.tempIndexBuffers[idx] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.tempIndexBuffers[idx]);
        GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, prevIBO);
        return GL.tempIndexBuffers[idx];
      },newRenderingFrameStarted:function newRenderingFrameStarted() {
        var vb = GL.tempVertexBuffers1;
        GL.tempVertexBuffers1 = GL.tempVertexBuffers2;
        GL.tempVertexBuffers2 = vb;
        vb = GL.tempVertexBufferCounters1;
        GL.tempVertexBufferCounters1 = GL.tempVertexBufferCounters2;
        GL.tempVertexBufferCounters2 = vb;
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        for(var i = 0; i <= largestIndex; ++i) {
          GL.tempVertexBufferCounters1[i] = 0;
        }
      },findToken:function (source, token) {
        function isIdentChar(ch) {
          if (ch >= 48 && ch <= 57) // 0-9
            return true;
          if (ch >= 65 && ch <= 90) // A-Z
            return true;
          if (ch >= 97 && ch <= 122) // a-z
            return true;
          return false;
        }
        var i = -1;
        do {
          i = source.indexOf(token, i + 1);
          if (i < 0) {
            break;
          }
          if (i > 0 && isIdentChar(source[i - 1])) {
            continue;
          }
          i += token.length;
          if (i < source.length - 1 && isIdentChar(source[i + 1])) {
            continue;
          }
          return true;
        } while (true);
        return false;
      },getSource:function (shader, count, string, length) {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var frag;
          if (length) {
            var len = HEAP32[(((length)+(i*4))>>2)];
            if (len < 0) {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
            } else {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)], len);
            }
          } else {
            frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
          }
          source += frag;
        }
        // Let's see if we need to enable the standard derivatives extension
        type = GLctx.getShaderParameter(GL.shaders[shader], 0x8B4F /* GL_SHADER_TYPE */);
        if (type == 0x8B30 /* GL_FRAGMENT_SHADER */) {
          if (GL.findToken(source, "dFdx") ||
              GL.findToken(source, "dFdy") ||
              GL.findToken(source, "fwidth")) {
            source = "#extension GL_OES_standard_derivatives : enable\n" + source;
            var extension = GLctx.getExtension("OES_standard_derivatives");
          }
        }
        return source;
      },computeImageSize:function (width, height, sizePerPixel, alignment) {
        function roundedToNextMultipleOf(x, y) {
          return Math.floor((x + y - 1) / y) * y
        }
        var plainRowSize = width * sizePerPixel;
        var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
        return (height <= 0) ? 0 :
                 ((height - 1) * alignedRowSize + plainRowSize);
      },get:function (name_, p, type) {
        // Guard against user passing a null pointer.
        // Note that GLES2 spec does not say anything about how passing a null pointer should be treated.
        // Testing on desktop core GL 3, the application crashes on glGetIntegerv to a null pointer, but
        // better to report an error instead of doing anything random.
        if (!p) {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
          return;
        }
        var ret = undefined;
        switch(name_) { // Handle a few trivial GLES values
          case 0x8DFA: // GL_SHADER_COMPILER
            ret = 1;
            break;
          case 0x8DF8: // GL_SHADER_BINARY_FORMATS
            if (type !== 'Integer') {
              GL.recordError(0x0500); // GL_INVALID_ENUM
            }
            return; // Do not write anything to the out pointer, since no binary formats are supported.
          case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
            ret = 0;
            break;
          case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
            // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be queried for length),
            // so implement it ourselves to allow C++ GLES2 code get the length.
            var formats = GLctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
            ret = formats.length;
            break;
          case 0x8B9A: // GL_IMPLEMENTATION_COLOR_READ_TYPE
            ret = 0x1401; // GL_UNSIGNED_BYTE
            break;
          case 0x8B9B: // GL_IMPLEMENTATION_COLOR_READ_FORMAT
            ret = 0x1908; // GL_RGBA
            break;
        }
  
        if (ret === undefined) {
          var result = GLctx.getParameter(name_);
          switch (typeof(result)) {
            case "number":
              ret = result;
              break;
            case "boolean":
              ret = result ? 1 : 0;
              break;
            case "string":
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
            case "object":
              if (result === null) {
                // null is a valid result for some (e.g., which buffer is bound - perhaps nothing is bound), but otherwise
                // can mean an invalid name_, which we need to report as an error
                switch(name_) {
                  case 0x8894: // ARRAY_BUFFER_BINDING
                  case 0x8B8D: // CURRENT_PROGRAM
                  case 0x8895: // ELEMENT_ARRAY_BUFFER_BINDING
                  case 0x8CA6: // FRAMEBUFFER_BINDING
                  case 0x8CA7: // RENDERBUFFER_BINDING
                  case 0x8069: // TEXTURE_BINDING_2D
                  case 0x8514: { // TEXTURE_BINDING_CUBE_MAP
                    ret = 0;
                    break;
                  }
                  default: {
                    GL.recordError(0x0500); // GL_INVALID_ENUM
                    return;
                  }
                }
              } else if (result instanceof Float32Array ||
                         result instanceof Uint32Array ||
                         result instanceof Int32Array ||
                         result instanceof Array) {
                for (var i = 0; i < result.length; ++i) {
                  switch (type) {
                    case 'Integer': HEAP32[(((p)+(i*4))>>2)]=result[i];   break;
                    case 'Float':   HEAPF32[(((p)+(i*4))>>2)]=result[i]; break;
                    case 'Boolean': HEAP8[(((p)+(i))|0)]=result[i] ? 1 : 0;    break;
                    default: throw 'internal glGet error, bad type: ' + type;
                  }
                }
                return;
              } else if (result instanceof WebGLBuffer ||
                         result instanceof WebGLProgram ||
                         result instanceof WebGLFramebuffer ||
                         result instanceof WebGLRenderbuffer ||
                         result instanceof WebGLTexture) {
                ret = result.name | 0;
              } else {
                GL.recordError(0x0500); // GL_INVALID_ENUM
                return;
              }
              break;
            default:
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
          }
        }
  
        switch (type) {
          case 'Integer': HEAP32[((p)>>2)]=ret;    break;
          case 'Float':   HEAPF32[((p)>>2)]=ret;  break;
          case 'Boolean': HEAP8[(p)]=ret ? 1 : 0; break;
          default: throw 'internal glGet error, bad type: ' + type;
        }
      },getTexPixelData:function (type, format, width, height, pixels, internalFormat) {
        var sizePerPixel;
        switch (type) {
          case 0x1401 /* GL_UNSIGNED_BYTE */:
            switch (format) {
              case 0x1906 /* GL_ALPHA */:
              case 0x1909 /* GL_LUMINANCE */:
                sizePerPixel = 1;
                break;
              case 0x1907 /* GL_RGB */:
                sizePerPixel = 3;
                break;
              case 0x1908 /* GL_RGBA */:
                sizePerPixel = 4;
                break;
              case 0x190A /* GL_LUMINANCE_ALPHA */:
                sizePerPixel = 2;
                break;
              default:
                throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x1403 /* GL_UNSIGNED_SHORT */:
            if (format == 0x1902 /* GL_DEPTH_COMPONENT */) {
              sizePerPixel = 2;
            } else {
              throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x1405 /* GL_UNSIGNED_INT */:
            if (format == 0x1902 /* GL_DEPTH_COMPONENT */) {
              sizePerPixel = 4;
            } else {
              throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x84FA /* UNSIGNED_INT_24_8_WEBGL */:
            sizePerPixel = 4;
            break;
          case 0x8363 /* GL_UNSIGNED_SHORT_5_6_5 */:
          case 0x8033 /* GL_UNSIGNED_SHORT_4_4_4_4 */:
          case 0x8034 /* GL_UNSIGNED_SHORT_5_5_5_1 */:
            sizePerPixel = 2;
            break;
          case 0x1406 /* GL_FLOAT */:
            assert(GL.floatExt, 'Must have OES_texture_float to use float textures');
            switch (format) {
              case 0x1907 /* GL_RGB */:
                sizePerPixel = 3*4;
                break;
              case 0x1908 /* GL_RGBA */:
                sizePerPixel = 4*4;
                break;
              default:
                throw 'Invalid format (' + format + ')';
            }
            internalFormat = GLctx.RGBA;
            break;
          default:
            throw 'Invalid type (' + type + ')';
        }
        var bytes = GL.computeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
        if (type == 0x1401 /* GL_UNSIGNED_BYTE */) {
          pixels = HEAPU8.subarray((pixels),(pixels+bytes));
        } else if (type == 0x1406 /* GL_FLOAT */) {
          pixels = HEAPF32.subarray((pixels)>>2,(pixels+bytes)>>2);
        } else if (type == 0x1405 /* GL_UNSIGNED_INT */ || type == 0x84FA /* UNSIGNED_INT_24_8_WEBGL */) {
          pixels = HEAPU32.subarray((pixels)>>2,(pixels+bytes)>>2);
        } else {
          pixels = HEAPU16.subarray((pixels)>>1,(pixels+bytes)>>1);
        }
        return {
          pixels: pixels,
          internalFormat: internalFormat
        }
      },enabledClientAttribIndices:[],enableVertexAttribArray:function enableVertexAttribArray(index) {
        if (!GL.enabledClientAttribIndices[index]) {
          GL.enabledClientAttribIndices[index] = true;
          GLctx.enableVertexAttribArray(index);
        }
      },disableVertexAttribArray:function disableVertexAttribArray(index) {
        if (GL.enabledClientAttribIndices[index]) {
          GL.enabledClientAttribIndices[index] = false;
          GLctx.disableVertexAttribArray(index);
        }
      },initExtensions:function () {
        if (GL.initExtensions.done) return;
        GL.initExtensions.done = true;
  
        if (!Module.useWebGL) return; // an app might link both gl and 2d backends
  
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
          GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i+1);
        }
  
        GL.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
  
        // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist. 
        GL.compressionExt = GLctx.getExtension('WEBGL_compressed_texture_s3tc') ||
                            GLctx.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                            GLctx.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
  
        GL.anisotropicExt = GLctx.getExtension('EXT_texture_filter_anisotropic') ||
                            GLctx.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                            GLctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  
        GL.floatExt = GLctx.getExtension('OES_texture_float');
  
        // Extension available from Firefox 26 and Google Chrome 30
        GL.instancedArraysExt = GLctx.getExtension('ANGLE_instanced_arrays');
        
        // Extension available from Firefox 25 and WebKit
        GL.vaoExt = Module.ctx.getExtension('OES_vertex_array_object');
  
        // These are the 'safe' feature-enabling extensions that don't add any performance impact related to e.g. debugging, and
        // should be enabled by default so that client GLES2/GL code will not need to go through extra hoops to get its stuff working.
        // As new extensions are ratified at http://www.khronos.org/registry/webgl/extensions/ , feel free to add your new extensions
        // here, as long as they don't produce a performance impact for users that might not be using those extensions.
        // E.g. debugging-related extensions should probably be off by default.
        var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives",
                                               "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture",
                                               "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays",
                                               "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc",
                                               "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float",
                                               "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources",
                                               "EXT_shader_texture_lod" ];
  
        function shouldEnableAutomatically(extension) {
          for(var i in automaticallyEnabledExtensions) {
            var include = automaticallyEnabledExtensions[i];
            if (ext.indexOf(include) != -1) {
              return true;
            }
          }
          return false;
        }
  
        var extensions = GLctx.getSupportedExtensions();
        for(var e in extensions) {
          var ext = extensions[e].replace('MOZ_', '').replace('WEBKIT_', '');
          if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
            GLctx.getExtension(ext); // Calling .getExtension enables that extension permanently, no need to store the return value to be enabled.
          }
        }
      },populateUniformTable:function (program) {
        var p = GL.programs[program];
        GL.programInfos[program] = {
          uniforms: {},
          maxUniformLength: 0, // This is eagerly computed below, since we already enumerate all uniforms anyway.
          maxAttributeLength: -1 // This is lazily computed and cached, computed when/if first asked, "-1" meaning not computed yet.
        };
  
        var ptable = GL.programInfos[program];
        var utable = ptable.uniforms;
        // A program's uniform table maps the string name of an uniform to an integer location of that uniform.
        // The global GL.uniforms map maps integer locations to WebGLUniformLocations.
        var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; ++i) {
          var u = GLctx.getActiveUniform(p, i);
  
          var name = u.name;
          ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length+1);
  
          // Strip off any trailing array specifier we might have got, e.g. "[0]".
          if (name.indexOf(']', name.length-1) !== -1) {
            var ls = name.lastIndexOf('[');
            name = name.slice(0, ls);
          }
  
          // Optimize memory usage slightly: If we have an array of uniforms, e.g. 'vec3 colors[3];', then 
          // only store the string 'colors' in utable, and 'colors[0]', 'colors[1]' and 'colors[2]' will be parsed as 'colors'+i.
          // Note that for the GL.uniforms table, we still need to fetch the all WebGLUniformLocations for all the indices.
          var loc = GLctx.getUniformLocation(p, name);
          var id = GL.getNewId(GL.uniforms);
          utable[name] = [u.size, id];
          GL.uniforms[id] = loc;
  
          for (var j = 1; j < u.size; ++j) {
            var n = name + '['+j+']';
            loc = GLctx.getUniformLocation(p, n);
            id = GL.getNewId(GL.uniforms);
  
            GL.uniforms[id] = loc;
          }
        }
      }};function _glPopMatrix() {
      GLImmediate.matricesModified = true;
      GLImmediate.matrixVersion[GLImmediate.currentMatrix] = (GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1)|0;
      GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixStack[GLImmediate.currentMatrix].pop();
    }

  function _glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      var fd = _fileno(stream);
      _fsync(fd);
      return _close(fd);
    }

  
  var GLUT={initTime:null,idleFunc:null,displayFunc:null,keyboardFunc:null,keyboardUpFunc:null,specialFunc:null,specialUpFunc:null,reshapeFunc:null,motionFunc:null,passiveMotionFunc:null,mouseFunc:null,buttons:0,modifiers:0,initWindowWidth:256,initWindowHeight:256,initDisplayMode:18,windowX:0,windowY:0,windowWidth:0,windowHeight:0,requestedAnimationFrame:false,saveModifiers:function (event) {
        GLUT.modifiers = 0;
        if (event['shiftKey'])
          GLUT.modifiers += 1; /* GLUT_ACTIVE_SHIFT */
        if (event['ctrlKey'])
          GLUT.modifiers += 2; /* GLUT_ACTIVE_CTRL */
        if (event['altKey'])
          GLUT.modifiers += 4; /* GLUT_ACTIVE_ALT */
      },onMousemove:function (event) {
        /* Send motion event only if the motion changed, prevents
         * spamming our app with uncessary callback call. It does happen in
         * Chrome on Windows.
         */
        var lastX = Browser.mouseX;
        var lastY = Browser.mouseY;
        Browser.calculateMouseEvent(event);
        var newX = Browser.mouseX;
        var newY = Browser.mouseY;
        if (newX == lastX && newY == lastY) return;
  
        if (GLUT.buttons == 0 && event.target == Module["canvas"] && GLUT.passiveMotionFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('vii', GLUT.passiveMotionFunc, [lastX, lastY]);
        } else if (GLUT.buttons != 0 && GLUT.motionFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('vii', GLUT.motionFunc, [lastX, lastY]);
        }
      },getSpecialKey:function (keycode) {
          var key = null;
          switch (keycode) {
            case 8:  key = 120 /* backspace */; break;
            case 46: key = 111 /* delete */; break;
  
            case 0x70 /*DOM_VK_F1*/: key = 1 /* GLUT_KEY_F1 */; break;
            case 0x71 /*DOM_VK_F2*/: key = 2 /* GLUT_KEY_F2 */; break;
            case 0x72 /*DOM_VK_F3*/: key = 3 /* GLUT_KEY_F3 */; break;
            case 0x73 /*DOM_VK_F4*/: key = 4 /* GLUT_KEY_F4 */; break;
            case 0x74 /*DOM_VK_F5*/: key = 5 /* GLUT_KEY_F5 */; break;
            case 0x75 /*DOM_VK_F6*/: key = 6 /* GLUT_KEY_F6 */; break;
            case 0x76 /*DOM_VK_F7*/: key = 7 /* GLUT_KEY_F7 */; break;
            case 0x77 /*DOM_VK_F8*/: key = 8 /* GLUT_KEY_F8 */; break;
            case 0x78 /*DOM_VK_F9*/: key = 9 /* GLUT_KEY_F9 */; break;
            case 0x79 /*DOM_VK_F10*/: key = 10 /* GLUT_KEY_F10 */; break;
            case 0x7a /*DOM_VK_F11*/: key = 11 /* GLUT_KEY_F11 */; break;
            case 0x7b /*DOM_VK_F12*/: key = 12 /* GLUT_KEY_F12 */; break;
            case 0x25 /*DOM_VK_LEFT*/: key = 100 /* GLUT_KEY_LEFT */; break;
            case 0x26 /*DOM_VK_UP*/: key = 101 /* GLUT_KEY_UP */; break;
            case 0x27 /*DOM_VK_RIGHT*/: key = 102 /* GLUT_KEY_RIGHT */; break;
            case 0x28 /*DOM_VK_DOWN*/: key = 103 /* GLUT_KEY_DOWN */; break;
            case 0x21 /*DOM_VK_PAGE_UP*/: key = 104 /* GLUT_KEY_PAGE_UP */; break;
            case 0x22 /*DOM_VK_PAGE_DOWN*/: key = 105 /* GLUT_KEY_PAGE_DOWN */; break;
            case 0x24 /*DOM_VK_HOME*/: key = 106 /* GLUT_KEY_HOME */; break;
            case 0x23 /*DOM_VK_END*/: key = 107 /* GLUT_KEY_END */; break;
            case 0x2d /*DOM_VK_INSERT*/: key = 108 /* GLUT_KEY_INSERT */; break;
  
            case 16   /*DOM_VK_SHIFT*/:
            case 0x05 /*DOM_VK_LEFT_SHIFT*/:
              key = 112 /* GLUT_KEY_SHIFT_L */;
              break;
            case 0x06 /*DOM_VK_RIGHT_SHIFT*/:
              key = 113 /* GLUT_KEY_SHIFT_R */;
              break;
  
            case 17   /*DOM_VK_CONTROL*/:
            case 0x03 /*DOM_VK_LEFT_CONTROL*/:
              key = 114 /* GLUT_KEY_CONTROL_L */;
              break;
            case 0x04 /*DOM_VK_RIGHT_CONTROL*/:
              key = 115 /* GLUT_KEY_CONTROL_R */;
              break;
  
            case 18   /*DOM_VK_ALT*/:
            case 0x02 /*DOM_VK_LEFT_ALT*/:
              key = 116 /* GLUT_KEY_ALT_L */;
              break;
            case 0x01 /*DOM_VK_RIGHT_ALT*/:
              key = 117 /* GLUT_KEY_ALT_R */;
              break;
          };
          return key;
      },getASCIIKey:function (event) {
        if (event['ctrlKey'] || event['altKey'] || event['metaKey']) return null;
  
        var keycode = event['keyCode'];
  
        /* The exact list is soooo hard to find in a canonical place! */
  
        if (48 <= keycode && keycode <= 57)
          return keycode; // numeric  TODO handle shift?
        if (65 <= keycode && keycode <= 90)
          return event['shiftKey'] ? keycode : keycode + 32;
        if (96 <= keycode && keycode <= 105)
          return keycode - 48; // numpad numbers    
        if (106 <= keycode && keycode <= 111)
          return keycode - 106 + 42; // *,+-./  TODO handle shift?
  
        switch (keycode) {
          case 9:  // tab key
          case 13: // return key
          case 27: // escape
          case 32: // space
          case 61: // equal
            return keycode;
        }
  
        var s = event['shiftKey'];
        switch (keycode) {
          case 186: return s ? 58 : 59; // colon / semi-colon
          case 187: return s ? 43 : 61; // add / equal (these two may be wrong)
          case 188: return s ? 60 : 44; // less-than / comma
          case 189: return s ? 95 : 45; // dash
          case 190: return s ? 62 : 46; // greater-than / period
          case 191: return s ? 63 : 47; // forward slash
          case 219: return s ? 123 : 91; // open bracket
          case 220: return s ? 124 : 47; // back slash
          case 221: return s ? 125 : 93; // close braket
          case 222: return s ? 34 : 39; // single quote
        }
  
        return null;
      },onKeydown:function (event) {
        if (GLUT.specialFunc || GLUT.keyboardFunc) {
          var key = GLUT.getSpecialKey(event['keyCode']);
          if (key !== null) {
            if( GLUT.specialFunc ) {
              event.preventDefault();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.specialFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
          else
          {
            key = GLUT.getASCIIKey(event);
            if( key !== null && GLUT.keyboardFunc ) {
              event.preventDefault();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.keyboardFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
        }
      },onKeyup:function (event) {
        if (GLUT.specialUpFunc || GLUT.keyboardUpFunc) {
          var key = GLUT.getSpecialKey(event['keyCode']);
          if (key !== null) {
            if(GLUT.specialUpFunc) {
              event.preventDefault ();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.specialUpFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
          else
          {
            key = GLUT.getASCIIKey(event);
            if( key !== null && GLUT.keyboardUpFunc ) {
              event.preventDefault ();
              GLUT.saveModifiers(event);
              Runtime.dynCall('viii', GLUT.keyboardUpFunc, [key, Browser.mouseX, Browser.mouseY]);
            }
          }
        }
      },onMouseButtonDown:function (event) {
        Browser.calculateMouseEvent(event);
  
        GLUT.buttons |= (1 << event['button']);
  
        if (event.target == Module["canvas"] && GLUT.mouseFunc) {
          try {
            event.target.setCapture();
          } catch (e) {}
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [event['button'], 0/*GLUT_DOWN*/, Browser.mouseX, Browser.mouseY]);
        }
      },onMouseButtonUp:function (event) {
        Browser.calculateMouseEvent(event);
  
        GLUT.buttons &= ~(1 << event['button']);
  
        if (GLUT.mouseFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [event['button'], 1/*GLUT_UP*/, Browser.mouseX, Browser.mouseY]);
        }
      },onMouseWheel:function (event) {
        Browser.calculateMouseEvent(event);
  
        // cross-browser wheel delta
        var e = window.event || event; // old IE support
        var delta = -Browser.getMouseWheelDelta(event);
  
        var button = 3; // wheel up
        if (delta < 0) {
          button = 4; // wheel down
        }
  
        if (GLUT.mouseFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [button, 0/*GLUT_DOWN*/, Browser.mouseX, Browser.mouseY]);
        }
      },onFullScreenEventChange:function (event) {
        var width;
        var height;
        if (document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
          width = screen["width"];
          height = screen["height"];
        } else {
          width = GLUT.windowWidth;
          height = GLUT.windowHeight;
          // TODO set position
          document.removeEventListener('fullscreenchange', GLUT.onFullScreenEventChange, true);
          document.removeEventListener('mozfullscreenchange', GLUT.onFullScreenEventChange, true);
          document.removeEventListener('webkitfullscreenchange', GLUT.onFullScreenEventChange, true);
        }
        Browser.setCanvasSize(width, height);
        /* Can't call _glutReshapeWindow as that requests cancelling fullscreen. */
        if (GLUT.reshapeFunc) {
          // console.log("GLUT.reshapeFunc (from FS): " + width + ", " + height);
          Runtime.dynCall('vii', GLUT.reshapeFunc, [width, height]);
        }
        _glutPostRedisplay();
      },requestFullScreen:function () {
        var RFS = Module["canvas"]['requestFullscreen'] ||
                  Module["canvas"]['requestFullScreen'] ||
                  Module["canvas"]['mozRequestFullScreen'] ||
                  Module["canvas"]['webkitRequestFullScreen'] ||
                  (function() {});
        RFS.apply(Module["canvas"], []);
      },cancelFullScreen:function () {
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['webkitCancelFullScreen'] ||
                  (function() {});
        CFS.apply(document, []);
      }};function _glutSwapBuffers() {}

  
  
  
  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};
  
  
  function _glEnable(x0) { GLctx.enable(x0) }
  
  function _glDisable(x0) { GLctx.disable(x0) }
  
  function _glIsEnabled(x0) { return GLctx.isEnabled(x0) }
  
  function _glGetBooleanv(name_, p) {
      return GL.get(name_, p, 'Boolean');
    }
  
  function _glGetIntegerv(name_, p) {
      return GL.get(name_, p, 'Integer');
    }
  
  function _glGetString(name_) {
      if (GL.stringCache[name_]) return GL.stringCache[name_];
      var ret; 
      switch(name_) {
        case 0x1F00 /* GL_VENDOR */:
        case 0x1F01 /* GL_RENDERER */:
        case 0x1F02 /* GL_VERSION */:
          ret = allocate(intArrayFromString(GLctx.getParameter(name_)), 'i8', ALLOC_NORMAL);
          break;
        case 0x1F03 /* GL_EXTENSIONS */:
          var exts = GLctx.getSupportedExtensions();
          var gl_exts = [];
          for (i in exts) {
            gl_exts.push(exts[i]);
            gl_exts.push("GL_" + exts[i]);
          }
          ret = allocate(intArrayFromString(gl_exts.join(' ')), 'i8', ALLOC_NORMAL);
          break;
        case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
          ret = allocate(intArrayFromString('OpenGL ES GLSL 1.00 (WebGL)'), 'i8', ALLOC_NORMAL);
          break;
        default:
          GL.recordError(0x0500/*GL_INVALID_ENUM*/);
          return 0;
      }
      GL.stringCache[name_] = ret;
      return ret;
    }
  
  function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }
  
  function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }
  
  function _glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }
  
  function _glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  
  function _glDetachShader(program, shader) {
      GLctx.detachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  
  function _glUseProgram(program) {
      GLctx.useProgram(program ? GL.programs[program] : null);
    }
  
  function _glDeleteProgram(program) {
      var program = GL.programs[program];
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[program] = null;
      GL.programInfos[program] = null;
    }
  
  function _glBindAttribLocation(program, index, name) {
      name = Pointer_stringify(name);
      GLctx.bindAttribLocation(GL.programs[program], index, name);
    }
  
  function _glLinkProgram(program) {
      GLctx.linkProgram(GL.programs[program]);
      GL.programInfos[program] = null; // uniforms no longer keep the same names after linking
      GL.populateUniformTable(program);
    }
  
  function _glBindBuffer(target, buffer) {
      var bufferObj = buffer ? GL.buffers[buffer] : null;
  
      if (target == GLctx.ARRAY_BUFFER) {
        GLImmediate.lastArrayBuffer = GL.currArrayBuffer = buffer;
      } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
        GL.currElementArrayBuffer = buffer;
      }
  
      GLctx.bindBuffer(target, bufferObj);
    }
  
  function _glGetFloatv(name_, p) {
      return GL.get(name_, p, 'Float');
    }
  
  function _glHint(x0, x1) { GLctx.hint(x0, x1) }
  
  function _glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }
  
  function _glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }
  
  function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }
  
  function _glActiveTexture(x0) { GLctx.activeTexture(x0) }var GLEmulation={fogStart:0,fogEnd:1,fogDensity:1,fogColor:null,fogMode:2048,fogEnabled:false,vaos:[],currentVao:null,enabledVertexAttribArrays:{},hasRunInit:false,init:function () {
        // Do not activate immediate/emulation code (e.g. replace glDrawElements) when in FULL_ES2 mode.
        // We do not need full emulation, we instead emulate client-side arrays etc. in FULL_ES2 code in
        // a straightforward manner, and avoid not having a bound buffer be ambiguous between es2 emulation
        // code and legacy gl emulation code.
  
        if (GLEmulation.hasRunInit) {
          return;
        }
        GLEmulation.hasRunInit = true;
  
        GLEmulation.fogColor = new Float32Array(4);
  
        // Add some emulation workarounds
        Module.printErr('WARNING: using emscripten GL emulation. This is a collection of limited workarounds, do not expect it to work.');
        Module.printErr('WARNING: using emscripten GL emulation unsafe opts. If weirdness happens, try -s GL_UNSAFE_OPTS=0');
  
        // XXX some of the capabilities we don't support may lead to incorrect rendering, if we do not emulate them in shaders
        var validCapabilities = {
          0x0B44: 1, // GL_CULL_FACE
          0x0BE2: 1, // GL_BLEND
          0x0BD0: 1, // GL_DITHER,
          0x0B90: 1, // GL_STENCIL_TEST
          0x0B71: 1, // GL_DEPTH_TEST
          0x0C11: 1, // GL_SCISSOR_TEST
          0x8037: 1, // GL_POLYGON_OFFSET_FILL
          0x809E: 1, // GL_SAMPLE_ALPHA_TO_COVERAGE
          0x80A0: 1  // GL_SAMPLE_COVERAGE
        };
  
        var glEnable = _glEnable;
        _glEnable = _emscripten_glEnable = function _glEnable(cap) {
          // Clean up the renderer on any change to the rendering state. The optimization of
          // skipping renderer setup is aimed at the case of multiple glDraw* right after each other
          if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
          if (cap == 0x0B60 /* GL_FOG */) {
            if (GLEmulation.fogEnabled != true) {
              GLImmediate.currentRenderer = null; // Fog parameter is part of the FFP shader state, we must re-lookup the renderer to use.
              GLEmulation.fogEnabled = true;
            }
            return;
          } else if (cap == 0x0de1 /* GL_TEXTURE_2D */) {
            // XXX not according to spec, and not in desktop GL, but works in some GLES1.x apparently, so support
            // it by forwarding to glEnableClientState
            /* Actually, let's not, for now. (This sounds exceedingly broken)
             * This is in gl_ps_workaround2.c.
            _glEnableClientState(cap);
            */
            return;
          } else if (!(cap in validCapabilities)) {
            return;
          }
          glEnable(cap);
        };
  
        var glDisable = _glDisable;
        _glDisable = _emscripten_glDisable = function _glDisable(cap) {
          if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
          if (cap == 0x0B60 /* GL_FOG */) {
            if (GLEmulation.fogEnabled != false) {
              GLImmediate.currentRenderer = null; // Fog parameter is part of the FFP shader state, we must re-lookup the renderer to use.
              GLEmulation.fogEnabled = false;
            }
            return;
          } else if (cap == 0x0de1 /* GL_TEXTURE_2D */) {
            // XXX not according to spec, and not in desktop GL, but works in some GLES1.x apparently, so support
            // it by forwarding to glDisableClientState
            /* Actually, let's not, for now. (This sounds exceedingly broken)
             * This is in gl_ps_workaround2.c.
            _glDisableClientState(cap);
            */
            return;
          } else if (!(cap in validCapabilities)) {
            return;
          }
          glDisable(cap);
        };
        _glIsEnabled = _emscripten_glIsEnabled = function _glIsEnabled(cap) {
          if (cap == 0x0B60 /* GL_FOG */) {
            return GLEmulation.fogEnabled ? 1 : 0;
          } else if (!(cap in validCapabilities)) {
            return 0;
          }
          return GLctx.isEnabled(cap);
        };
  
        var glGetBooleanv = _glGetBooleanv;
        _glGetBooleanv = _emscripten_glGetBooleanv = function _glGetBooleanv(pname, p) {
          var attrib = GLEmulation.getAttributeFromCapability(pname);
          if (attrib !== null) {
            var result = GLImmediate.enabledClientAttributes[attrib];
            HEAP8[(p)]=result === true ? 1 : 0;
            return;
          }
          glGetBooleanv(pname, p);
        };
  
        var glGetIntegerv = _glGetIntegerv;
        _glGetIntegerv = _emscripten_glGetIntegerv = function _glGetIntegerv(pname, params) {
          switch (pname) {
            case 0x84E2: pname = GLctx.MAX_TEXTURE_IMAGE_UNITS /* fake it */; break; // GL_MAX_TEXTURE_UNITS
            case 0x8B4A: { // GL_MAX_VERTEX_UNIFORM_COMPONENTS_ARB
              var result = GLctx.getParameter(GLctx.MAX_VERTEX_UNIFORM_VECTORS);
              HEAP32[((params)>>2)]=result*4; // GLES gives num of 4-element vectors, GL wants individual components, so multiply
              return;
            }
            case 0x8B49: { // GL_MAX_FRAGMENT_UNIFORM_COMPONENTS_ARB
              var result = GLctx.getParameter(GLctx.MAX_FRAGMENT_UNIFORM_VECTORS);
              HEAP32[((params)>>2)]=result*4; // GLES gives num of 4-element vectors, GL wants individual components, so multiply
              return;
            }
            case 0x8B4B: { // GL_MAX_VARYING_FLOATS_ARB
              var result = GLctx.getParameter(GLctx.MAX_VARYING_VECTORS);
              HEAP32[((params)>>2)]=result*4; // GLES gives num of 4-element vectors, GL wants individual components, so multiply
              return;
            }
            case 0x8871: pname = GLctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS /* close enough */; break; // GL_MAX_TEXTURE_COORDS
            case 0x807A: { // GL_VERTEX_ARRAY_SIZE
              var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
              HEAP32[((params)>>2)]=attribute ? attribute.size : 0;
              return;
            }
            case 0x807B: { // GL_VERTEX_ARRAY_TYPE
              var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
              HEAP32[((params)>>2)]=attribute ? attribute.type : 0;
              return;
            }
            case 0x807C: { // GL_VERTEX_ARRAY_STRIDE
              var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
              HEAP32[((params)>>2)]=attribute ? attribute.stride : 0;
              return;
            }
            case 0x8081: { // GL_COLOR_ARRAY_SIZE
              var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
              HEAP32[((params)>>2)]=attribute ? attribute.size : 0;
              return;
            }
            case 0x8082: { // GL_COLOR_ARRAY_TYPE
              var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
              HEAP32[((params)>>2)]=attribute ? attribute.type : 0;
              return;
            }
            case 0x8083: { // GL_COLOR_ARRAY_STRIDE
              var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
              HEAP32[((params)>>2)]=attribute ? attribute.stride : 0;
              return;
            }
            case 0x8088: { // GL_TEXTURE_COORD_ARRAY_SIZE
              var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
              HEAP32[((params)>>2)]=attribute ? attribute.size : 0;
              return;
            }
            case 0x8089: { // GL_TEXTURE_COORD_ARRAY_TYPE
              var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
              HEAP32[((params)>>2)]=attribute ? attribute.type : 0;
              return;
            }
            case 0x808A: { // GL_TEXTURE_COORD_ARRAY_STRIDE
              var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
              HEAP32[((params)>>2)]=attribute ? attribute.stride : 0;
              return;
            }
          }
          glGetIntegerv(pname, params);
        };
  
        var glGetString = _glGetString;
        _glGetString = _emscripten_glGetString = function _glGetString(name_) {
          if (GL.stringCache[name_]) return GL.stringCache[name_];
          switch(name_) {
            case 0x1F03 /* GL_EXTENSIONS */: // Add various extensions that we can support
              var ret = allocate(intArrayFromString(GLctx.getSupportedExtensions().join(' ') +
                     ' GL_EXT_texture_env_combine GL_ARB_texture_env_crossbar GL_ATI_texture_env_combine3 GL_NV_texture_env_combine4 GL_EXT_texture_env_dot3 GL_ARB_multitexture GL_ARB_vertex_buffer_object GL_EXT_framebuffer_object GL_ARB_vertex_program GL_ARB_fragment_program GL_ARB_shading_language_100 GL_ARB_shader_objects GL_ARB_vertex_shader GL_ARB_fragment_shader GL_ARB_texture_cube_map GL_EXT_draw_range_elements' +
                     (GL.compressionExt ? ' GL_ARB_texture_compression GL_EXT_texture_compression_s3tc' : '') +
                     (GL.anisotropicExt ? ' GL_EXT_texture_filter_anisotropic' : '')
              ), 'i8', ALLOC_NORMAL);
              GL.stringCache[name_] = ret;
              return ret;
          }
          return glGetString(name_);
        };
  
        // Do some automatic rewriting to work around GLSL differences. Note that this must be done in
        // tandem with the rest of the program, by itself it cannot suffice.
        // Note that we need to remember shader types for this rewriting, saving sources makes it easier to debug.
        GL.shaderInfos = {};
        var glCreateShader = _glCreateShader;
        _glCreateShader = _emscripten_glCreateShader = function _glCreateShader(shaderType) {
          var id = glCreateShader(shaderType);
          GL.shaderInfos[id] = {
            type: shaderType,
            ftransform: false
          };
          return id;
        };
  
        function ensurePrecision(source) {
          if (!/precision +(low|medium|high)p +float *;/.test(source)) {
            source = 'precision mediump float;\n' + source;
          }
          return source;
        }
  
        var glShaderSource = _glShaderSource;
        _glShaderSource = _emscripten_glShaderSource = function _glShaderSource(shader, count, string, length) {
          var source = GL.getSource(shader, count, string, length);
          // XXX We add attributes and uniforms to shaders. The program can ask for the # of them, and see the
          // ones we generated, potentially confusing it? Perhaps we should hide them.
          if (GL.shaderInfos[shader].type == GLctx.VERTEX_SHADER) {
            // Replace ftransform() with explicit project/modelview transforms, and add position and matrix info.
            var has_pm = source.search(/u_projection/) >= 0;
            var has_mm = source.search(/u_modelView/) >= 0;
            var has_pv = source.search(/a_position/) >= 0;
            var need_pm = 0, need_mm = 0, need_pv = 0;
            var old = source;
            source = source.replace(/ftransform\(\)/g, '(u_projection * u_modelView * a_position)');
            if (old != source) need_pm = need_mm = need_pv = 1;
            old = source;
            source = source.replace(/gl_ProjectionMatrix/g, 'u_projection');
            if (old != source) need_pm = 1;
            old = source;
            source = source.replace(/gl_ModelViewMatrixTranspose\[2\]/g, 'vec4(u_modelView[0][2], u_modelView[1][2], u_modelView[2][2], u_modelView[3][2])'); // XXX extremely inefficient
            if (old != source) need_mm = 1;
            old = source;
            source = source.replace(/gl_ModelViewMatrix/g, 'u_modelView');
            if (old != source) need_mm = 1;
            old = source;
            source = source.replace(/gl_Vertex/g, 'a_position');
            if (old != source) need_pv = 1;
            old = source;
            source = source.replace(/gl_ModelViewProjectionMatrix/g, '(u_projection * u_modelView)');
            if (old != source) need_pm = need_mm = 1;
            if (need_pv && !has_pv) source = 'attribute vec4 a_position; \n' + source;
            if (need_mm && !has_mm) source = 'uniform mat4 u_modelView; \n' + source;
            if (need_pm && !has_pm) source = 'uniform mat4 u_projection; \n' + source;
            GL.shaderInfos[shader].ftransform = need_pm || need_mm || need_pv; // we will need to provide the fixed function stuff as attributes and uniforms
            for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
              // XXX To handle both regular texture mapping and cube mapping, we use vec4 for tex coordinates.
              var old = source;
              var need_vtc = source.search('v_texCoord' + i) == -1;
              source = source.replace(new RegExp('gl_TexCoord\\[' + i + '\\]', 'g'), 'v_texCoord' + i)
                             .replace(new RegExp('gl_MultiTexCoord' + i, 'g'), 'a_texCoord' + i);
              if (source != old) {
                source = 'attribute vec4 a_texCoord' + i + '; \n' + source;
                if (need_vtc) {
                  source = 'varying vec4 v_texCoord' + i + ';   \n' + source;
                }
              }
  
              old = source;
              source = source.replace(new RegExp('gl_TextureMatrix\\[' + i + '\\]', 'g'), 'u_textureMatrix' + i);
              if (source != old) {
                source = 'uniform mat4 u_textureMatrix' + i + '; \n' + source;
              }
            }
            if (source.indexOf('gl_FrontColor') >= 0) {
              source = 'varying vec4 v_color; \n' +
                       source.replace(/gl_FrontColor/g, 'v_color');
            }
            if (source.indexOf('gl_Color') >= 0) {
              source = 'attribute vec4 a_color; \n' +
                       source.replace(/gl_Color/g, 'a_color');
            }
            if (source.indexOf('gl_Normal') >= 0) {
              source = 'attribute vec3 a_normal; \n' +
                       source.replace(/gl_Normal/g, 'a_normal');
            }
            // fog
            if (source.indexOf('gl_FogFragCoord') >= 0) {
              source = 'varying float v_fogFragCoord;   \n' +
                       source.replace(/gl_FogFragCoord/g, 'v_fogFragCoord');
            }
            source = ensurePrecision(source);
          } else { // Fragment shader
            for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
              var old = source;
              source = source.replace(new RegExp('gl_TexCoord\\[' + i + '\\]', 'g'), 'v_texCoord' + i);
              if (source != old) {
                source = 'varying vec4 v_texCoord' + i + ';   \n' + source;
              }
            }
            if (source.indexOf('gl_Color') >= 0) {
              source = 'varying vec4 v_color; \n' + source.replace(/gl_Color/g, 'v_color');
            }
            if (source.indexOf('gl_Fog.color') >= 0) {
              source = 'uniform vec4 u_fogColor;   \n' +
                       source.replace(/gl_Fog.color/g, 'u_fogColor');
            }
            if (source.indexOf('gl_Fog.end') >= 0) {
              source = 'uniform float u_fogEnd;   \n' +
                       source.replace(/gl_Fog.end/g, 'u_fogEnd');
            }
            if (source.indexOf('gl_Fog.scale') >= 0) {
              source = 'uniform float u_fogScale;   \n' +
                       source.replace(/gl_Fog.scale/g, 'u_fogScale');
            }
            if (source.indexOf('gl_Fog.density') >= 0) {
              source = 'uniform float u_fogDensity;   \n' +
                       source.replace(/gl_Fog.density/g, 'u_fogDensity');
            }
            if (source.indexOf('gl_FogFragCoord') >= 0) {
              source = 'varying float v_fogFragCoord;   \n' +
                       source.replace(/gl_FogFragCoord/g, 'v_fogFragCoord');
            }
            source = ensurePrecision(source);
          }
          GLctx.shaderSource(GL.shaders[shader], source);
        };
  
        var glCompileShader = _glCompileShader;
        _glCompileShader = _emscripten_glCompileShader = function _glCompileShader(shader) {
          GLctx.compileShader(GL.shaders[shader]);
        };
  
        GL.programShaders = {};
        var glAttachShader = _glAttachShader;
        _glAttachShader = _emscripten_glAttachShader = function _glAttachShader(program, shader) {
          if (!GL.programShaders[program]) GL.programShaders[program] = [];
          GL.programShaders[program].push(shader);
          glAttachShader(program, shader);
        };
  
        var glDetachShader = _glDetachShader;
        _glDetachShader = _emscripten_glDetachShader = function _glDetachShader(program, shader) {
          var programShader = GL.programShaders[program];
          if (!programShader) {
            Module.printErr('WARNING: _glDetachShader received invalid program: ' + program);
            return;
          }
          var index = programShader.indexOf(shader);
          programShader.splice(index, 1);
          glDetachShader(program, shader);
        };
  
        var glUseProgram = _glUseProgram;
        _glUseProgram = _emscripten_glUseProgram = function _glUseProgram(program) {
          if (GL.currProgram != program) {
            GLImmediate.currentRenderer = null; // This changes the FFP emulation shader program, need to recompute that.
            GL.currProgram = program;
            GLImmediate.fixedFunctionProgram = 0;
            glUseProgram(program);
          }
        }
  
        var glDeleteProgram = _glDeleteProgram;
        _glDeleteProgram = _emscripten_glDeleteProgram = function _glDeleteProgram(program) {
          glDeleteProgram(program);
          if (program == GL.currProgram) {
            GLImmediate.currentRenderer = null; // This changes the FFP emulation shader program, need to recompute that.
            GL.currProgram = 0;
          }
        };
  
        // If attribute 0 was not bound, bind it to 0 for WebGL performance reasons. Track if 0 is free for that.
        var zeroUsedPrograms = {};
        var glBindAttribLocation = _glBindAttribLocation;
        _glBindAttribLocation = _emscripten_glBindAttribLocation = function _glBindAttribLocation(program, index, name) {
          if (index == 0) zeroUsedPrograms[program] = true;
          glBindAttribLocation(program, index, name);
        };
        var glLinkProgram = _glLinkProgram;
        _glLinkProgram = _emscripten_glLinkProgram = function _glLinkProgram(program) {
          if (!(program in zeroUsedPrograms)) {
            GLctx.bindAttribLocation(GL.programs[program], 0, 'a_position');
          }
          glLinkProgram(program);
        };
  
        var glBindBuffer = _glBindBuffer;
        _glBindBuffer = _emscripten_glBindBuffer = function _glBindBuffer(target, buffer) {
          glBindBuffer(target, buffer);
          if (target == GLctx.ARRAY_BUFFER) {
            if (GLEmulation.currentVao) {
              assert(GLEmulation.currentVao.arrayBuffer == buffer || GLEmulation.currentVao.arrayBuffer == 0 || buffer == 0, 'TODO: support for multiple array buffers in vao');
              GLEmulation.currentVao.arrayBuffer = buffer;
            }
          } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
            if (GLEmulation.currentVao) GLEmulation.currentVao.elementArrayBuffer = buffer;
          }
        };
  
        var glGetFloatv = _glGetFloatv;
        _glGetFloatv = _emscripten_glGetFloatv = function _glGetFloatv(pname, params) {
          if (pname == 0x0BA6) { // GL_MODELVIEW_MATRIX
            HEAPF32.set(GLImmediate.matrix[0/*m*/], params >> 2);
          } else if (pname == 0x0BA7) { // GL_PROJECTION_MATRIX
            HEAPF32.set(GLImmediate.matrix[1/*p*/], params >> 2);
          } else if (pname == 0x0BA8) { // GL_TEXTURE_MATRIX
            HEAPF32.set(GLImmediate.matrix[2/*t*/ + GLImmediate.clientActiveTexture], params >> 2);
          } else if (pname == 0x0B66) { // GL_FOG_COLOR
            HEAPF32.set(GLEmulation.fogColor, params >> 2);
          } else if (pname == 0x0B63) { // GL_FOG_START
            HEAPF32[((params)>>2)]=GLEmulation.fogStart;
          } else if (pname == 0x0B64) { // GL_FOG_END
            HEAPF32[((params)>>2)]=GLEmulation.fogEnd;
          } else if (pname == 0x0B62) { // GL_FOG_DENSITY
            HEAPF32[((params)>>2)]=GLEmulation.fogDensity;
          } else if (pname == 0x0B65) { // GL_FOG_MODE
            HEAPF32[((params)>>2)]=GLEmulation.fogMode;
          } else {
            glGetFloatv(pname, params);
          }
        };
  
        var glHint = _glHint;
        _glHint = _emscripten_glHint = function _glHint(target, mode) {
          if (target == 0x84EF) { // GL_TEXTURE_COMPRESSION_HINT
            return;
          }
          glHint(target, mode);
        };
  
        var glEnableVertexAttribArray = _glEnableVertexAttribArray;
        _glEnableVertexAttribArray = _emscripten_glEnableVertexAttribArray = function _glEnableVertexAttribArray(index) {
          glEnableVertexAttribArray(index);
          GLEmulation.enabledVertexAttribArrays[index] = 1;
          if (GLEmulation.currentVao) GLEmulation.currentVao.enabledVertexAttribArrays[index] = 1;
        };
  
        var glDisableVertexAttribArray = _glDisableVertexAttribArray;
        _glDisableVertexAttribArray = _emscripten_glDisableVertexAttribArray = function _glDisableVertexAttribArray(index) {
          glDisableVertexAttribArray(index);
          delete GLEmulation.enabledVertexAttribArrays[index];
          if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledVertexAttribArrays[index];
        };
  
        var glVertexAttribPointer = _glVertexAttribPointer;
        _glVertexAttribPointer = _emscripten_glVertexAttribPointer = function _glVertexAttribPointer(index, size, type, normalized, stride, pointer) {
          glVertexAttribPointer(index, size, type, normalized, stride, pointer);
          if (GLEmulation.currentVao) { // TODO: avoid object creation here? likely not hot though
            GLEmulation.currentVao.vertexAttribPointers[index] = [index, size, type, normalized, stride, pointer];
          }
        };
      },getAttributeFromCapability:function (cap) {
        var attrib = null;
        switch (cap) {
          case 0x0de1: // GL_TEXTURE_2D - XXX not according to spec, and not in desktop GL, but works in some GLES1.x apparently, so support it
            abort("GL_TEXTURE_2D is not a spec-defined capability for gl{Enable,Disable}ClientState.");
            // Fall through:
          case 0x8078: // GL_TEXTURE_COORD_ARRAY
            attrib = GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture; break;
          case 0x8074: // GL_VERTEX_ARRAY
            attrib = GLImmediate.VERTEX; break;
          case 0x8075: // GL_NORMAL_ARRAY
            attrib = GLImmediate.NORMAL; break;
          case 0x8076: // GL_COLOR_ARRAY
            attrib = GLImmediate.COLOR; break;
        }
        return attrib;
      }};var GLImmediate={MapTreeLib:null,spawnMapTreeLib:function () {
        /* A naive implementation of a map backed by an array, and accessed by
         * naive iteration along the array. (hashmap with only one bucket)
         */
        function CNaiveListMap() {
          var list = [];
  
          this.insert = function CNaiveListMap_insert(key, val) {
            if (this.contains(key|0)) return false;
            list.push([key, val]);
            return true;
          };
  
          var __contains_i;
          this.contains = function CNaiveListMap_contains(key) {
            for (__contains_i = 0; __contains_i < list.length; ++__contains_i) {
              if (list[__contains_i][0] === key) return true;
            }
            return false;
          };
  
          var __get_i;
          this.get = function CNaiveListMap_get(key) {
            for (__get_i = 0; __get_i < list.length; ++__get_i) {
              if (list[__get_i][0] === key) return list[__get_i][1];
            }
            return undefined;
          };
        };
  
        /* A tree of map nodes.
          Uses `KeyView`s to allow descending the tree without garbage.
          Example: {
            // Create our map object.
            var map = new ObjTreeMap();
  
            // Grab the static keyView for the map.
            var keyView = map.GetStaticKeyView();
  
            // Let's make a map for:
            // root: <undefined>
            //   1: <undefined>
            //     2: <undefined>
            //       5: "Three, sir!"
            //       3: "Three!"
  
            // Note how we can chain together `Reset` and `Next` to
            // easily descend based on multiple key fragments.
            keyView.Reset().Next(1).Next(2).Next(5).Set("Three, sir!");
            keyView.Reset().Next(1).Next(2).Next(3).Set("Three!");
          }
        */
        function CMapTree() {
          function CNLNode() {
            var map = new CNaiveListMap();
  
            this.child = function CNLNode_child(keyFrag) {
              if (!map.contains(keyFrag|0)) {
                map.insert(keyFrag|0, new CNLNode());
              }
              return map.get(keyFrag|0);
            };
  
            this.value = undefined;
            this.get = function CNLNode_get() {
              return this.value;
            };
  
            this.set = function CNLNode_set(val) {
              this.value = val;
            };
          }
  
          function CKeyView(root) {
            var cur;
  
            this.reset = function CKeyView_reset() {
              cur = root;
              return this;
            };
            this.reset();
  
            this.next = function CKeyView_next(keyFrag) {
              cur = cur.child(keyFrag);
              return this;
            };
  
            this.get = function CKeyView_get() {
              return cur.get();
            };
  
            this.set = function CKeyView_set(val) {
              cur.set(val);
            };
          };
  
          var root;
          var staticKeyView;
  
          this.createKeyView = function CNLNode_createKeyView() {
            return new CKeyView(root);
          }
  
          this.clear = function CNLNode_clear() {
            root = new CNLNode();
            staticKeyView = this.createKeyView();
          };
          this.clear();
  
          this.getStaticKeyView = function CNLNode_getStaticKeyView() {
            staticKeyView.reset();
            return staticKeyView;
          };
        };
  
        // Exports:
        return {
          create: function() {
            return new CMapTree();
          },
        };
      },TexEnvJIT:null,spawnTexEnvJIT:function () {
        // GL defs:
        var GL_TEXTURE0 = 0x84C0;
        var GL_TEXTURE_1D = 0x0DE0;
        var GL_TEXTURE_2D = 0x0DE1;
        var GL_TEXTURE_3D = 0x806f;
        var GL_TEXTURE_CUBE_MAP = 0x8513;
        var GL_TEXTURE_ENV = 0x2300;
        var GL_TEXTURE_ENV_MODE = 0x2200;
        var GL_TEXTURE_ENV_COLOR = 0x2201;
        var GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
        var GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
        var GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
        var GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
        var GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
        var GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
  
        var GL_SRC0_RGB = 0x8580;
        var GL_SRC1_RGB = 0x8581;
        var GL_SRC2_RGB = 0x8582;
  
        var GL_SRC0_ALPHA = 0x8588;
        var GL_SRC1_ALPHA = 0x8589;
        var GL_SRC2_ALPHA = 0x858A;
  
        var GL_OPERAND0_RGB = 0x8590;
        var GL_OPERAND1_RGB = 0x8591;
        var GL_OPERAND2_RGB = 0x8592;
  
        var GL_OPERAND0_ALPHA = 0x8598;
        var GL_OPERAND1_ALPHA = 0x8599;
        var GL_OPERAND2_ALPHA = 0x859A;
  
        var GL_COMBINE_RGB = 0x8571;
        var GL_COMBINE_ALPHA = 0x8572;
  
        var GL_RGB_SCALE = 0x8573;
        var GL_ALPHA_SCALE = 0x0D1C;
  
        // env.mode
        var GL_ADD      = 0x0104;
        var GL_BLEND    = 0x0BE2;
        var GL_REPLACE  = 0x1E01;
        var GL_MODULATE = 0x2100;
        var GL_DECAL    = 0x2101;
        var GL_COMBINE  = 0x8570;
  
        // env.color/alphaCombiner
        //var GL_ADD         = 0x0104;
        //var GL_REPLACE     = 0x1E01;
        //var GL_MODULATE    = 0x2100;
        var GL_SUBTRACT    = 0x84E7;
        var GL_INTERPOLATE = 0x8575;
  
        // env.color/alphaSrc
        var GL_TEXTURE       = 0x1702;
        var GL_CONSTANT      = 0x8576;
        var GL_PRIMARY_COLOR = 0x8577;
        var GL_PREVIOUS      = 0x8578;
  
        // env.color/alphaOp
        var GL_SRC_COLOR           = 0x0300;
        var GL_ONE_MINUS_SRC_COLOR = 0x0301;
        var GL_SRC_ALPHA           = 0x0302;
        var GL_ONE_MINUS_SRC_ALPHA = 0x0303;
  
        var GL_RGB  = 0x1907;
        var GL_RGBA = 0x1908;
  
        // Our defs:
        var TEXENVJIT_NAMESPACE_PREFIX = "tej_";
        // Not actually constant, as they can be changed between JIT passes:
        var TEX_UNIT_UNIFORM_PREFIX = "uTexUnit";
        var TEX_COORD_VARYING_PREFIX = "vTexCoord";
        var PRIM_COLOR_VARYING = "vPrimColor";
        var TEX_MATRIX_UNIFORM_PREFIX = "uTexMatrix";
  
        // Static vars:
        var s_texUnits = null; //[];
        var s_activeTexture = 0;
  
        var s_requiredTexUnitsForPass = [];
  
        // Static funcs:
        function abort(info) {
          assert(false, "[TexEnvJIT] ABORT: " + info);
        }
  
        function abort_noSupport(info) {
          abort("No support: " + info);
        }
  
        function abort_sanity(info) {
          abort("Sanity failure: " + info);
        }
  
        function genTexUnitSampleExpr(texUnitID) {
          var texUnit = s_texUnits[texUnitID];
          var texType = texUnit.getTexType();
  
          var func = null;
          switch (texType) {
            case GL_TEXTURE_1D:
              func = "texture2D";
              break;
            case GL_TEXTURE_2D:
              func = "texture2D";
              break;
            case GL_TEXTURE_3D:
              return abort_noSupport("No support for 3D textures.");
            case GL_TEXTURE_CUBE_MAP:
              func = "textureCube";
              break;
            default:
              return abort_sanity("Unknown texType: 0x" + texType.toString(16));
          }
  
          var texCoordExpr = TEX_COORD_VARYING_PREFIX + texUnitID;
          if (TEX_MATRIX_UNIFORM_PREFIX != null) {
            texCoordExpr = "(" + TEX_MATRIX_UNIFORM_PREFIX + texUnitID + " * " + texCoordExpr + ")";
          }
          return func + "(" + TEX_UNIT_UNIFORM_PREFIX + texUnitID + ", " + texCoordExpr + ".xy)";
        }
  
        function getTypeFromCombineOp(op) {
          switch (op) {
            case GL_SRC_COLOR:
            case GL_ONE_MINUS_SRC_COLOR:
              return "vec3";
            case GL_SRC_ALPHA:
            case GL_ONE_MINUS_SRC_ALPHA:
              return "float";
          }
  
          return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16));
        }
  
        function getCurTexUnit() {
          return s_texUnits[s_activeTexture];
        }
  
        function genCombinerSourceExpr(texUnitID, constantExpr, previousVar,
                                       src, op)
        {
          var srcExpr = null;
          switch (src) {
            case GL_TEXTURE:
              srcExpr = genTexUnitSampleExpr(texUnitID);
              break;
            case GL_CONSTANT:
              srcExpr = constantExpr;
              break;
            case GL_PRIMARY_COLOR:
              srcExpr = PRIM_COLOR_VARYING;
              break;
            case GL_PREVIOUS:
              srcExpr = previousVar;
              break;
            default:
                return abort_noSupport("Unsupported combiner src: 0x" + src.toString(16));
          }
  
          var expr = null;
          switch (op) {
            case GL_SRC_COLOR:
              expr = srcExpr + ".rgb";
              break;
            case GL_ONE_MINUS_SRC_COLOR:
              expr = "(vec3(1.0) - " + srcExpr + ".rgb)";
              break;
            case GL_SRC_ALPHA:
              expr = srcExpr + ".a";
              break;
            case GL_ONE_MINUS_SRC_ALPHA:
              expr = "(1.0 - " + srcExpr + ".a)";
              break;
            default:
              return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16));
          }
  
          return expr;
        }
  
        function valToFloatLiteral(val) {
          if (val == Math.round(val)) return val + '.0';
          return val;
        }
  
  
        // Classes:
        function CTexEnv() {
          this.mode = GL_MODULATE;
          this.colorCombiner = GL_MODULATE;
          this.alphaCombiner = GL_MODULATE;
          this.colorScale = 1;
          this.alphaScale = 1;
          this.envColor = [0, 0, 0, 0];
  
          this.colorSrc = [
            GL_TEXTURE,
            GL_PREVIOUS,
            GL_CONSTANT
          ];
          this.alphaSrc = [
            GL_TEXTURE,
            GL_PREVIOUS,
            GL_CONSTANT
          ];
          this.colorOp = [
            GL_SRC_COLOR,
            GL_SRC_COLOR,
            GL_SRC_ALPHA
          ];
          this.alphaOp = [
            GL_SRC_ALPHA,
            GL_SRC_ALPHA,
            GL_SRC_ALPHA
          ];
  
          // Map GLenums to small values to efficiently pack the enums to bits for tighter access.
          this.traverseKey = {
            // mode
            0x1E01 /* GL_REPLACE */: 0,
            0x2100 /* GL_MODULATE */: 1,
            0x0104 /* GL_ADD */: 2,
            0x0BE2 /* GL_BLEND */: 3,
            0x2101 /* GL_DECAL */: 4,
            0x8570 /* GL_COMBINE */: 5,
  
            // additional color and alpha combiners
            0x84E7 /* GL_SUBTRACT */: 3,
            0x8575 /* GL_INTERPOLATE */: 4,
  
            // color and alpha src
            0x1702 /* GL_TEXTURE */: 0,
            0x8576 /* GL_CONSTANT */: 1,
            0x8577 /* GL_PRIMARY_COLOR */: 2,
            0x8578 /* GL_PREVIOUS */: 3,
  
            // color and alpha op
            0x0300 /* GL_SRC_COLOR */: 0,
            0x0301 /* GL_ONE_MINUS_SRC_COLOR */: 1,
            0x0302 /* GL_SRC_ALPHA */: 2,
            0x0300 /* GL_ONE_MINUS_SRC_ALPHA */: 3
          };
  
          // The tuple (key0,key1,key2) uniquely identifies the state of the variables in CTexEnv.
          // -1 on key0 denotes 'the whole cached key is dirty'
          this.key0 = -1;
          this.key1 = 0;
          this.key2 = 0;
  
          this.computeKey0 = function() {
            var k = this.traverseKey;
            var key = k[this.mode] * 1638400; // 6 distinct values.
            key += k[this.colorCombiner] * 327680; // 5 distinct values.
            key += k[this.alphaCombiner] * 65536; // 5 distinct values.
            // The above three fields have 6*5*5=150 distinct values -> 8 bits.
            key += (this.colorScale-1) * 16384; // 10 bits used.
            key += (this.alphaScale-1) * 4096; // 12 bits used.
            key += k[this.colorSrc[0]] * 1024; // 14
            key += k[this.colorSrc[1]] * 256; // 16
            key += k[this.colorSrc[2]] * 64; // 18
            key += k[this.alphaSrc[0]] * 16; // 20
            key += k[this.alphaSrc[1]] * 4; // 22
            key += k[this.alphaSrc[2]]; // 24 bits used total.
            return key;
          }
          this.computeKey1 = function() {
            var k = this.traverseKey;
            key = k[this.colorOp[0]] * 4096;
            key += k[this.colorOp[1]] * 1024;             
            key += k[this.colorOp[2]] * 256;
            key += k[this.alphaOp[0]] * 16;
            key += k[this.alphaOp[1]] * 4;
            key += k[this.alphaOp[2]];
            return key;            
          }
          // TODO: remove this. The color should not be part of the key!
          this.computeKey2 = function() {
            return this.envColor[0] * 16777216 + this.envColor[1] * 65536 + this.envColor[2] * 256 + 1 + this.envColor[3];
          }
          this.recomputeKey = function() {
            this.key0 = this.computeKey0();
            this.key1 = this.computeKey1();
            this.key2 = this.computeKey2();
          }
          this.invalidateKey = function() {
            this.key0 = -1; // The key of this texture unit must be recomputed when rendering the next time.
            GLImmediate.currentRenderer = null; // The currently used renderer must be re-evaluated at next render.
          }
        }
  
        function CTexUnit() {
          this.env = new CTexEnv();
          this.enabled_tex1D   = false;
          this.enabled_tex2D   = false;
          this.enabled_tex3D   = false;
          this.enabled_texCube = false;
          this.texTypesEnabled = 0; // A bitfield combination of the four flags above, used for fast access to operations.
  
          this.traverseState = function CTexUnit_traverseState(keyView) {
            if (this.texTypesEnabled) {
              if (this.env.key0 == -1) {
                this.env.recomputeKey();
              }
              keyView.next(this.texTypesEnabled | (this.env.key0 << 4));
              keyView.next(this.env.key1);
              keyView.next(this.env.key2);
            } else {
              // For correctness, must traverse a zero value, theoretically a subsequent integer key could collide with this value otherwise.
              keyView.next(0);
            }
          };
        };
  
        // Class impls:
        CTexUnit.prototype.enabled = function CTexUnit_enabled() {
          return this.texTypesEnabled;
        }
  
        CTexUnit.prototype.genPassLines = function CTexUnit_genPassLines(passOutputVar, passInputVar, texUnitID) {
          if (!this.enabled()) {
            return ["vec4 " + passOutputVar + " = " + passInputVar + ";"];
          }
          var lines = this.env.genPassLines(passOutputVar, passInputVar, texUnitID).join('\n');
  
          var texLoadLines = '';
          var texLoadRegex = /(texture.*?\(.*?\))/g;
          var loadCounter = 0;
          var load;
  
          // As an optimization, merge duplicate identical texture loads to one var.
          while(load = texLoadRegex.exec(lines)) {
            var texLoadExpr = load[1];
            var secondOccurrence = lines.slice(load.index+1).indexOf(texLoadExpr);
            if (secondOccurrence != -1) { // And also has a second occurrence of same load expression..
              // Create new var to store the common load.
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + texUnitID + "_";
              var texLoadVar = prefix + 'texload' + loadCounter++;
              var texLoadLine = 'vec4 ' + texLoadVar + ' = ' + texLoadExpr + ';\n';
              texLoadLines += texLoadLine + '\n'; // Store the generated texture load statements in a temp string to not confuse regex search in progress.
              lines = lines.split(texLoadExpr).join(texLoadVar);
              // Reset regex search, since we modified the string.
              texLoadRegex = /(texture.*\(.*\))/g;
            }
          }
          return [texLoadLines + lines];
        }
  
        CTexUnit.prototype.getTexType = function CTexUnit_getTexType() {
          if (this.enabled_texCube) {
            return GL_TEXTURE_CUBE_MAP;
          } else if (this.enabled_tex3D) {
            return GL_TEXTURE_3D;
          } else if (this.enabled_tex2D) {
            return GL_TEXTURE_2D;
          } else if (this.enabled_tex1D) {
            return GL_TEXTURE_1D;
          }
          return 0;
        }
  
        CTexEnv.prototype.genPassLines = function CTexEnv_genPassLines(passOutputVar, passInputVar, texUnitID) {
          switch (this.mode) {
            case GL_REPLACE: {
              /* RGB:
               * Cv = Cs
               * Av = Ap // Note how this is different, and that we'll
               *            need to track the bound texture internalFormat
               *            to get this right.
               *
               * RGBA:
               * Cv = Cs
               * Av = As
               */
              return [
                "vec4 " + passOutputVar + " = " + genTexUnitSampleExpr(texUnitID) + ";",
              ];
            }
            case GL_ADD: {
              /* RGBA:
               * Cv = Cp + Cs
               * Av = ApAs
               */
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + texUnitID + "_";
              var texVar = prefix + "tex";
              var colorVar = prefix + "color";
              var alphaVar = prefix + "alpha";
  
              return [
                "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";",
                "vec3 " + colorVar + " = " + passInputVar + ".rgb + " + texVar + ".rgb;",
                "float " + alphaVar + " = " + passInputVar + ".a * " + texVar + ".a;",
                "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");",
              ];
            }
            case GL_MODULATE: {
              /* RGBA:
               * Cv = CpCs
               * Av = ApAs
               */
              var line = [
                "vec4 " + passOutputVar,
                " = ",
                  passInputVar,
                  " * ",
                  genTexUnitSampleExpr(texUnitID),
                ";",
              ];
              return [line.join("")];
            }
            case GL_DECAL: {
              /* RGBA:
               * Cv = Cp(1 - As) + CsAs
               * Av = Ap
               */
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + texUnitID + "_";
              var texVar = prefix + "tex";
              var colorVar = prefix + "color";
              var alphaVar = prefix + "alpha";
  
              return [
                "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";",
                [
                  "vec3 " + colorVar + " = ",
                    passInputVar + ".rgb * (1.0 - " + texVar + ".a)",
                      " + ",
                    texVar + ".rgb * " + texVar + ".a",
                  ";"
                ].join(""),
                "float " + alphaVar + " = " + passInputVar + ".a;",
                "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");",
              ];
            }
            case GL_BLEND: {
              /* RGBA:
               * Cv = Cp(1 - Cs) + CcCs
               * Av = As
               */
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + texUnitID + "_";
              var texVar = prefix + "tex";
              var colorVar = prefix + "color";
              var alphaVar = prefix + "alpha";
  
              return [
                "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";",
                [
                  "vec3 " + colorVar + " = ",
                    passInputVar + ".rgb * (1.0 - " + texVar + ".rgb)",
                      " + ",
                    PRIM_COLOR_VARYING + ".rgb * " + texVar + ".rgb",
                  ";"
                ].join(""),
                "float " + alphaVar + " = " + texVar + ".a;",
                "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");",
              ];
            }
            case GL_COMBINE: {
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + texUnitID + "_";
              var colorVar = prefix + "color";
              var alphaVar = prefix + "alpha";
              var colorLines = this.genCombinerLines(true, colorVar,
                                                     passInputVar, texUnitID,
                                                     this.colorCombiner, this.colorSrc, this.colorOp);
              var alphaLines = this.genCombinerLines(false, alphaVar,
                                                     passInputVar, texUnitID,
                                                     this.alphaCombiner, this.alphaSrc, this.alphaOp);
  
              // Generate scale, but avoid generating an identity op that multiplies by one.
              var scaledColor = (this.colorScale == 1) ? colorVar : (colorVar + " * " + valToFloatLiteral(this.colorScale));
              var scaledAlpha = (this.alphaScale == 1) ? alphaVar : (alphaVar + " * " + valToFloatLiteral(this.alphaScale));
  
              var line = [
                "vec4 " + passOutputVar,
                " = ",
                  "vec4(",
                      scaledColor,
                      ", ",
                      scaledAlpha,
                  ")",
                ";",
              ].join("");
              return [].concat(colorLines, alphaLines, [line]);
            }
          }
  
          return abort_noSupport("Unsupported TexEnv mode: 0x" + this.mode.toString(16));
        }
  
        CTexEnv.prototype.genCombinerLines = function CTexEnv_getCombinerLines(isColor, outputVar,
                                                                               passInputVar, texUnitID,
                                                                               combiner, srcArr, opArr)
        {
          var argsNeeded = null;
          switch (combiner) {
            case GL_REPLACE:
              argsNeeded = 1;
              break;
  
            case GL_MODULATE:
            case GL_ADD:
            case GL_SUBTRACT:
              argsNeeded = 2;
              break;
  
            case GL_INTERPOLATE:
              argsNeeded = 3;
              break;
  
            default:
              return abort_noSupport("Unsupported combiner: 0x" + combiner.toString(16));
          }
  
          var constantExpr = [
            "vec4(",
              valToFloatLiteral(this.envColor[0]),
              ", ",
              valToFloatLiteral(this.envColor[1]),
              ", ",
              valToFloatLiteral(this.envColor[2]),
              ", ",
              valToFloatLiteral(this.envColor[3]),
            ")",
          ].join("");
          var src0Expr = (argsNeeded >= 1) ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[0], opArr[0])
                                           : null;
          var src1Expr = (argsNeeded >= 2) ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[1], opArr[1])
                                           : null;
          var src2Expr = (argsNeeded >= 3) ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[2], opArr[2])
                                           : null;
  
          var outputType = isColor ? "vec3" : "float";
          var lines = null;
          switch (combiner) {
            case GL_REPLACE: {
              var line = [
                outputType + " " + outputVar,
                " = ",
                  src0Expr,
                ";",
              ];
              lines = [line.join("")];
              break;
            }
            case GL_MODULATE: {
              var line = [
                outputType + " " + outputVar + " = ",
                  src0Expr + " * " + src1Expr,
                ";",
              ];
              lines = [line.join("")];
              break;
            }
            case GL_ADD: {
              var line = [
                outputType + " " + outputVar + " = ",
                  src0Expr + " + " + src1Expr,
                ";",
              ];
              lines = [line.join("")];
              break;
            }
            case GL_SUBTRACT: {
              var line = [
                outputType + " " + outputVar + " = ",
                  src0Expr + " - " + src1Expr,
                ";",
              ];
              lines = [line.join("")];
              break;
            }
            case GL_INTERPOLATE: {
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + texUnitID + "_";
              var arg2Var = prefix + "colorSrc2";
              var arg2Line = getTypeFromCombineOp(this.colorOp[2]) + " " + arg2Var + " = " + src2Expr + ";";
  
              var line = [
                outputType + " " + outputVar,
                " = ",
                  src0Expr + " * " + arg2Var,
                  " + ",
                  src1Expr + " * (1.0 - " + arg2Var + ")",
                ";",
              ];
              lines = [
                arg2Line,
                line.join(""),
              ];
              break;
            }
  
            default:
              return abort_sanity("Unmatched TexEnv.colorCombiner?");
          }
  
          return lines;
        }
  
        return {
          // Exports:
          init: function(gl, specifiedMaxTextureImageUnits) {
            var maxTexUnits = 0;
            if (specifiedMaxTextureImageUnits) {
              maxTexUnits = specifiedMaxTextureImageUnits;
            } else if (gl) {
              maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
            }
            assert(maxTexUnits > 0);
            s_texUnits = [];
            for (var i = 0; i < maxTexUnits; i++) {
              s_texUnits.push(new CTexUnit());
            }
          },
  
          setGLSLVars: function(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix) {
            TEX_UNIT_UNIFORM_PREFIX   = uTexUnitPrefix;
            TEX_COORD_VARYING_PREFIX  = vTexCoordPrefix;
            PRIM_COLOR_VARYING        = vPrimColor;
            TEX_MATRIX_UNIFORM_PREFIX = uTexMatrixPrefix;
          },
  
          genAllPassLines: function(resultDest, indentSize) {
            indentSize = indentSize || 0;
  
            s_requiredTexUnitsForPass.length = 0; // Clear the list.
            var lines = [];
            var lastPassVar = PRIM_COLOR_VARYING;
            for (var i = 0; i < s_texUnits.length; i++) {
              if (!s_texUnits[i].enabled()) continue;
  
              s_requiredTexUnitsForPass.push(i);
  
              var prefix = TEXENVJIT_NAMESPACE_PREFIX + 'env' + i + "_";
              var passOutputVar = prefix + "result";
  
              var newLines = s_texUnits[i].genPassLines(passOutputVar, lastPassVar, i);
              lines = lines.concat(newLines, [""]);
  
              lastPassVar = passOutputVar;
            }
            lines.push(resultDest + " = " + lastPassVar + ";");
  
            var indent = "";
            for (var i = 0; i < indentSize; i++) indent += " ";
  
            var output = indent + lines.join("\n" + indent);
  
            return output;
          },
  
          getUsedTexUnitList: function() {
            return s_requiredTexUnitsForPass;
          },
  
          traverseState: function(keyView) {
            for (var i = 0; i < s_texUnits.length; i++) {
              s_texUnits[i].traverseState(keyView);
            }
          },
  
          getTexUnitType: function(texUnitID) {
            assert(texUnitID >= 0 &&
                   texUnitID < s_texUnits.length);
            return s_texUnits[texUnitID].getTexType();
          },
  
          // Hooks:
          hook_activeTexture: function(texture) {
            s_activeTexture = texture - GL_TEXTURE0;
          },
  
          hook_enable: function(cap) {
            var cur = getCurTexUnit();
            switch (cap) {
              case GL_TEXTURE_1D:
                if (!cur.enabled_tex1D) {
                  GLImmediate.currentRenderer = null; // Renderer state changed, and must be recreated or looked up again.
                  cur.enabled_tex1D = true;
                  cur.texTypesEnabled |= 1;
                }
                break;
              case GL_TEXTURE_2D:
                if (!cur.enabled_tex2D) {
                  GLImmediate.currentRenderer = null;
                  cur.enabled_tex2D = true;
                  cur.texTypesEnabled |= 2;
                }
                break;
              case GL_TEXTURE_3D:
                if (!cur.enabled_tex3D) {
                  GLImmediate.currentRenderer = null;
                  cur.enabled_tex3D = true;
                  cur.texTypesEnabled |= 4;
                }
                break;
              case GL_TEXTURE_CUBE_MAP:
                if (!cur.enabled_texCube) {
                  GLImmediate.currentRenderer = null;
                  cur.enabled_texCube = true;
                  cur.texTypesEnabled |= 8;
                }
                break;
            }
          },
  
          hook_disable: function(cap) {
            var cur = getCurTexUnit();
            switch (cap) {
              case GL_TEXTURE_1D:
                if (cur.enabled_tex1D) {
                  GLImmediate.currentRenderer = null; // Renderer state changed, and must be recreated or looked up again.
                  cur.enabled_tex1D = false;
                  cur.texTypesEnabled &= ~1;
                }
                break;
              case GL_TEXTURE_2D:
                if (cur.enabled_tex2D) {
                  GLImmediate.currentRenderer = null;
                  cur.enabled_tex2D = false;
                  cur.texTypesEnabled &= ~2;
                }
                break;
              case GL_TEXTURE_3D:
                if (cur.enabled_tex3D) {
                  GLImmediate.currentRenderer = null;
                  cur.enabled_tex3D = false;
                  cur.texTypesEnabled &= ~4;
                }
                break;
              case GL_TEXTURE_CUBE_MAP:
                if (cur.enabled_texCube) {
                  GLImmediate.currentRenderer = null;
                  cur.enabled_texCube = false;
                  cur.texTypesEnabled &= ~8;
                }
                break;
            }
          },
  
          hook_texEnvf: function(target, pname, param) {
            if (target != GL_TEXTURE_ENV)
              return;
  
            var env = getCurTexUnit().env;
            switch (pname) {
              case GL_RGB_SCALE:
                if (env.colorScale != param) {
                  env.invalidateKey(); // We changed FFP emulation renderer state.
                  env.colorScale = param;
                }
                break;
              case GL_ALPHA_SCALE:
                if (env.alphaScale != param) {
                  env.invalidateKey();
                  env.alphaScale = param;
                }
                break;
  
              default:
                Module.printErr('WARNING: Unhandled `pname` in call to `glTexEnvf`.');
            }
          },
  
          hook_texEnvi: function(target, pname, param) {
            if (target != GL_TEXTURE_ENV)
              return;
  
            var env = getCurTexUnit().env;
            switch (pname) {
              case GL_TEXTURE_ENV_MODE:
                if (env.mode != param) {
                  env.invalidateKey(); // We changed FFP emulation renderer state.
                  env.mode = param;
                }
                break;
  
              case GL_COMBINE_RGB:
                if (env.colorCombiner != param) {
                  env.invalidateKey();
                  env.colorCombiner = param;
                }
                break;
              case GL_COMBINE_ALPHA:
                if (env.alphaCombiner != param) {
                  env.invalidateKey();
                  env.alphaCombiner = param;
                }
                break;
  
              case GL_SRC0_RGB:
                if (env.colorSrc[0] != param) {
                  env.invalidateKey();
                  env.colorSrc[0] = param;
                }
                break;
              case GL_SRC1_RGB:
                if (env.colorSrc[1] != param) {
                  env.invalidateKey();
                  env.colorSrc[1] = param;
                }
                break;
              case GL_SRC2_RGB:
                if (env.colorSrc[2] != param) {
                  env.invalidateKey();
                  env.colorSrc[2] = param;
                }
                break;
  
              case GL_SRC0_ALPHA:
                if (env.alphaSrc[0] != param) {
                  env.invalidateKey();
                  env.alphaSrc[0] = param;
                }
                break;
              case GL_SRC1_ALPHA:
                if (env.alphaSrc[1] != param) {
                  env.invalidateKey();
                  env.alphaSrc[1] = param;
                }
                break;
              case GL_SRC2_ALPHA:
                if (env.alphaSrc[2] != param) {
                  env.invalidateKey();
                  env.alphaSrc[2] = param;
                }
                break;
  
              case GL_OPERAND0_RGB:
                if (env.colorOp[0] != param) {
                  env.invalidateKey();
                  env.colorOp[0] = param;
                }
                break;
              case GL_OPERAND1_RGB:
                if (env.colorOp[1] != param) {
                  env.invalidateKey();
                  env.colorOp[1] = param;
                }
                break;
              case GL_OPERAND2_RGB:
                if (env.colorOp[2] != param) {
                  env.invalidateKey();
                  env.colorOp[2] = param;
                }
                break;
  
              case GL_OPERAND0_ALPHA:
                if (env.alphaOp[0] != param) {
                  env.invalidateKey();
                  env.alphaOp[0] = param;
                }
                break;
              case GL_OPERAND1_ALPHA:
                if (env.alphaOp[1] != param) {
                  env.invalidateKey();
                  env.alphaOp[1] = param;
                }
                break;
              case GL_OPERAND2_ALPHA:
                if (env.alphaOp[2] != param) {
                  env.invalidateKey();
                  env.alphaOp[2] = param;
                }
                break;
  
              case GL_RGB_SCALE:
                if (env.colorScale != param) {
                  env.invalidateKey();
                  env.colorScale = param;
                }
                break;
              case GL_ALPHA_SCALE:
                if (env.alphaScale != param) {
                  env.invalidateKey();
                  env.alphaScale = param;
                }
                break;
  
              default:
                Module.printErr('WARNING: Unhandled `pname` in call to `glTexEnvi`.');
            }
          },
  
          hook_texEnvfv: function(target, pname, params) {
            if (target != GL_TEXTURE_ENV) return;
  
            var env = getCurTexUnit().env;
            switch (pname) {
              case GL_TEXTURE_ENV_COLOR: {
                for (var i = 0; i < 4; i++) {
                  var param = HEAPF32[(((params)+(i*4))>>2)];
                  if (env.envColor[i] != param) {
                    env.invalidateKey(); // We changed FFP emulation renderer state.
                    env.envColor[i] = param;
                  }
                }
                break
              }
              default:
                Module.printErr('WARNING: Unhandled `pname` in call to `glTexEnvfv`.');
            }
          },
  
          hook_getTexEnviv: function(target, pname, param) {
            if (target != GL_TEXTURE_ENV)
              return;
  
            var env = getCurTexUnit().env;
            switch (pname) {
              case GL_TEXTURE_ENV_MODE:
                HEAP32[((param)>>2)]=env.mode;
                return;
  
              case GL_TEXTURE_ENV_COLOR:
                HEAP32[((param)>>2)]=Math.max(Math.min(env.envColor[0]*255, 255, -255));
                HEAP32[(((param)+(1))>>2)]=Math.max(Math.min(env.envColor[1]*255, 255, -255));
                HEAP32[(((param)+(2))>>2)]=Math.max(Math.min(env.envColor[2]*255, 255, -255));
                HEAP32[(((param)+(3))>>2)]=Math.max(Math.min(env.envColor[3]*255, 255, -255));
                return;
  
              case GL_COMBINE_RGB:
                HEAP32[((param)>>2)]=env.colorCombiner;
                return;
  
              case GL_COMBINE_ALPHA:
                HEAP32[((param)>>2)]=env.alphaCombiner;
                return;
  
              case GL_SRC0_RGB:
                HEAP32[((param)>>2)]=env.colorSrc[0];
                return;
  
              case GL_SRC1_RGB:
                HEAP32[((param)>>2)]=env.colorSrc[1];
                return;
  
              case GL_SRC2_RGB:
                HEAP32[((param)>>2)]=env.colorSrc[2];
                return;
  
              case GL_SRC0_ALPHA:
                HEAP32[((param)>>2)]=env.alphaSrc[0];
                return;
  
              case GL_SRC1_ALPHA:
                HEAP32[((param)>>2)]=env.alphaSrc[1];
                return;
  
              case GL_SRC2_ALPHA:
                HEAP32[((param)>>2)]=env.alphaSrc[2];
                return;
  
              case GL_OPERAND0_RGB:
                HEAP32[((param)>>2)]=env.colorOp[0];
                return;
  
              case GL_OPERAND1_RGB:
                HEAP32[((param)>>2)]=env.colorOp[1];
                return;
  
              case GL_OPERAND2_RGB:
                HEAP32[((param)>>2)]=env.colorOp[2];
                return;
  
              case GL_OPERAND0_ALPHA:
                HEAP32[((param)>>2)]=env.alphaOp[0];
                return;
  
              case GL_OPERAND1_ALPHA:
                HEAP32[((param)>>2)]=env.alphaOp[1];
                return;
  
              case GL_OPERAND2_ALPHA:
                HEAP32[((param)>>2)]=env.alphaOp[2];
                return;
  
              case GL_RGB_SCALE:
                HEAP32[((param)>>2)]=env.colorScale;
                return;
  
              case GL_ALPHA_SCALE:
                HEAP32[((param)>>2)]=env.alphaScale;
                return;
  
              default:
                Module.printErr('WARNING: Unhandled `pname` in call to `glGetTexEnvi`.');
            }
          },
  
          hook_getTexEnvfv: function(target, pname, param) {
            if (target != GL_TEXTURE_ENV)
              return;
  
            var env = getCurTexUnit().env;
            switch (pname) {
              case GL_TEXTURE_ENV_COLOR:
                HEAPF32[((param)>>2)]=env.envColor[0];
                HEAPF32[(((param)+(4))>>2)]=env.envColor[1];
                HEAPF32[(((param)+(8))>>2)]=env.envColor[2];
                HEAPF32[(((param)+(12))>>2)]=env.envColor[3];
                return;
            }
          }
        };
      },vertexData:null,vertexDataU8:null,tempData:null,indexData:null,vertexCounter:0,mode:-1,rendererCache:null,rendererComponents:[],rendererComponentPointer:0,lastRenderer:null,lastArrayBuffer:null,lastProgram:null,lastStride:-1,matrix:[],matrixStack:[],currentMatrix:0,tempMatrix:null,matricesModified:false,useTextureMatrix:false,VERTEX:0,NORMAL:1,COLOR:2,TEXTURE0:3,NUM_ATTRIBUTES:-1,MAX_TEXTURES:-1,totalEnabledClientAttributes:0,enabledClientAttributes:[0,0],clientAttributes:[],liveClientAttributes:[],currentRenderer:null,modifiedClientAttributes:false,clientActiveTexture:0,clientColor:null,usedTexUnitList:[],fixedFunctionProgram:null,setClientAttribute:function setClientAttribute(name, size, type, stride, pointer) {
        var attrib = GLImmediate.clientAttributes[name];
        if (!attrib) {
          for (var i = 0; i <= name; i++) { // keep flat
            if (!GLImmediate.clientAttributes[i]) {
              GLImmediate.clientAttributes[i] = {
                name: name,
                size: size,
                type: type,
                stride: stride,
                pointer: pointer,
                offset: 0
              };
            }
          }
        } else {
          attrib.name = name;
          attrib.size = size;
          attrib.type = type;
          attrib.stride = stride;
          attrib.pointer = pointer;
          attrib.offset = 0;
        }
        GLImmediate.modifiedClientAttributes = true;
      },addRendererComponent:function addRendererComponent(name, size, type) {
        if (!GLImmediate.rendererComponents[name]) {
          GLImmediate.rendererComponents[name] = 1;
          if (GLImmediate.enabledClientAttributes[name]) {
            console.log("Warning: glTexCoord used after EnableClientState for TEXTURE_COORD_ARRAY for TEXTURE0. Disabling TEXTURE_COORD_ARRAY...");
          }
          GLImmediate.enabledClientAttributes[name] = true;
          GLImmediate.setClientAttribute(name, size, type, 0, GLImmediate.rendererComponentPointer);
          GLImmediate.rendererComponentPointer += size * GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
          // We can enable the correct attribute stream index immediately here, since the same attribute in each shader
          // will be bound to this same index.
          GL.enableVertexAttribArray(name);
        } else {
          GLImmediate.rendererComponents[name]++;
        }
      },disableBeginEndClientAttributes:function disableBeginEndClientAttributes() {
        for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
          if (GLImmediate.rendererComponents[i]) GLImmediate.enabledClientAttributes[i] = false;
        }
      },getRenderer:function getRenderer() {
        // If no FFP state has changed that would have forced to re-evaluate which FFP emulation shader to use,
        // we have the currently used renderer in cache, and can immediately return that.
        if (GLImmediate.currentRenderer) {
          return GLImmediate.currentRenderer;
        }
        // return a renderer object given the liveClientAttributes
        // we maintain a cache of renderers, optimized to not generate garbage
        var attributes = GLImmediate.liveClientAttributes;
        var cacheMap = GLImmediate.rendererCache;
        var keyView = cacheMap.getStaticKeyView().reset();
  
        // By attrib state:
        var enabledAttributesKey = 0;
        for (var i = 0; i < attributes.length; i++) {
          enabledAttributesKey |= 1 << attributes[i].name;
        }
  
        // By fog state:
        var fogParam = 0;
        if (GLEmulation.fogEnabled) {
          switch (GLEmulation.fogMode) {
            case 0x0801: // GL_EXP2
              fogParam = 1;
              break;
            case 0x2601: // GL_LINEAR
              fogParam = 2;
              break;
            default: // default to GL_EXP
              fogParam = 3;
              break;
          }
        }
        keyView.next((enabledAttributesKey << 2) | fogParam);
  
          GLImmediate.TexEnvJIT.traverseState(keyView);
  
        // If we don't already have it, create it.
        var renderer = keyView.get();
        if (!renderer) {
          renderer = GLImmediate.createRenderer();
          GLImmediate.currentRenderer = renderer;
          keyView.set(renderer);
          return renderer;
        }
        GLImmediate.currentRenderer = renderer; // Cache the currently used renderer, so later lookups without state changes can get this fast.
        return renderer;
      },createRenderer:function createRenderer(renderer) {
        var useCurrProgram = !!GL.currProgram;
        var hasTextures = false;
        for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
          var texAttribName = GLImmediate.TEXTURE0 + i;
          if (!GLImmediate.enabledClientAttributes[texAttribName])
            continue;
  
          if (!useCurrProgram) {
            if (GLImmediate.TexEnvJIT.getTexUnitType(i) == 0) {
               Runtime.warnOnce("GL_TEXTURE" + i + " coords are supplied, but that texture unit is disabled in the fixed-function pipeline.");
            }
          }
  
          hasTextures = true;
        }
  
        var ret = {
          init: function init() {
            // For fixed-function shader generation.
            var uTexUnitPrefix = 'u_texUnit';
            var aTexCoordPrefix = 'a_texCoord';
            var vTexCoordPrefix = 'v_texCoord';
            var vPrimColor = 'v_color';
            var uTexMatrixPrefix = GLImmediate.useTextureMatrix ? 'u_textureMatrix' : null;
  
            if (useCurrProgram) {
              if (GL.shaderInfos[GL.programShaders[GL.currProgram][0]].type == GLctx.VERTEX_SHADER) {
                this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
                this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
              } else {
                this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
                this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
              }
              this.program = GL.programs[GL.currProgram];
              this.usedTexUnitList = [];
            } else {
              // IMPORTANT NOTE: If you parameterize the shader source based on any runtime values
              // in order to create the least expensive shader possible based on the features being
              // used, you should also update the code in the beginning of getRenderer to make sure
              // that you cache the renderer based on the said parameters.
              if (GLEmulation.fogEnabled) {
                switch (GLEmulation.fogMode) {
                  case 0x0801: // GL_EXP2
                    // fog = exp(-(gl_Fog.density * gl_FogFragCoord)^2)
                    var fogFormula = '  float fog = exp(-u_fogDensity * u_fogDensity * ecDistance * ecDistance); \n';
                    break;
                  case 0x2601: // GL_LINEAR
                    // fog = (gl_Fog.end - gl_FogFragCoord) * gl_fog.scale
                    var fogFormula = '  float fog = (u_fogEnd - ecDistance) * u_fogScale; \n';
                    break;
                  default: // default to GL_EXP
                    // fog = exp(-gl_Fog.density * gl_FogFragCoord)
                    var fogFormula = '  float fog = exp(-u_fogDensity * ecDistance); \n';
                    break;
                }
              }
  
              GLImmediate.TexEnvJIT.setGLSLVars(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix);
              var fsTexEnvPass = GLImmediate.TexEnvJIT.genAllPassLines('gl_FragColor', 2);
  
              var texUnitAttribList = '';
              var texUnitVaryingList = '';
              var texUnitUniformList = '';
              var vsTexCoordInits = '';
              this.usedTexUnitList = GLImmediate.TexEnvJIT.getUsedTexUnitList();
              for (var i = 0; i < this.usedTexUnitList.length; i++) {
                var texUnit = this.usedTexUnitList[i];
                texUnitAttribList += 'attribute vec4 ' + aTexCoordPrefix + texUnit + ';\n';
                texUnitVaryingList += 'varying vec4 ' + vTexCoordPrefix + texUnit + ';\n';
                texUnitUniformList += 'uniform sampler2D ' + uTexUnitPrefix + texUnit + ';\n';
                vsTexCoordInits += '  ' + vTexCoordPrefix + texUnit + ' = ' + aTexCoordPrefix + texUnit + ';\n';
  
                if (GLImmediate.useTextureMatrix) {
                  texUnitUniformList += 'uniform mat4 ' + uTexMatrixPrefix + texUnit + ';\n';
                }
              }
  
              var vsFogVaryingInit = null;
              if (GLEmulation.fogEnabled) {
                vsFogVaryingInit = '  v_fogFragCoord = abs(ecPosition.z);\n';
              }
  
              var vsSource = [
                'attribute vec4 a_position;',
                'attribute vec4 a_color;',
                'varying vec4 v_color;',
                texUnitAttribList,
                texUnitVaryingList,
                (GLEmulation.fogEnabled ? 'varying float v_fogFragCoord;' : null),
                'uniform mat4 u_modelView;',
                'uniform mat4 u_projection;',
                'void main()',
                '{',
                '  vec4 ecPosition = u_modelView * a_position;', // eye-coordinate position
                '  gl_Position = u_projection * ecPosition;',
                '  v_color = a_color;',
                vsTexCoordInits,
                vsFogVaryingInit,
                '}',
                ''
              ].join('\n').replace(/\n\n+/g, '\n');
  
              this.vertexShader = GLctx.createShader(GLctx.VERTEX_SHADER);
              GLctx.shaderSource(this.vertexShader, vsSource);
              GLctx.compileShader(this.vertexShader);
  
              var fogHeaderIfNeeded = null;
              if (GLEmulation.fogEnabled) {
                fogHeaderIfNeeded = [
                  '',
                  'varying float v_fogFragCoord; ',
                  'uniform vec4 u_fogColor;      ',
                  'uniform float u_fogEnd;       ',
                  'uniform float u_fogScale;     ',
                  'uniform float u_fogDensity;   ',
                  'float ffog(in float ecDistance) { ',
                  fogFormula,
                  '  fog = clamp(fog, 0.0, 1.0); ',
                  '  return fog;                 ',
                  '}',
                  '',
                ].join("\n");
              }
  
              var fogPass = null;
              if (GLEmulation.fogEnabled) {
                fogPass = 'gl_FragColor = vec4(mix(u_fogColor.rgb, gl_FragColor.rgb, ffog(v_fogFragCoord)), gl_FragColor.a);\n';
              }
  
              var fsSource = [
                'precision mediump float;',
                texUnitVaryingList,
                texUnitUniformList,
                'varying vec4 v_color;',
                fogHeaderIfNeeded,
                'void main()',
                '{',
                fsTexEnvPass,
                fogPass,
                '}',
                ''
              ].join("\n").replace(/\n\n+/g, '\n');
  
              this.fragmentShader = GLctx.createShader(GLctx.FRAGMENT_SHADER);
              GLctx.shaderSource(this.fragmentShader, fsSource);
              GLctx.compileShader(this.fragmentShader);
  
              this.program = GLctx.createProgram();
              GLctx.attachShader(this.program, this.vertexShader);
              GLctx.attachShader(this.program, this.fragmentShader);
  
              // As optimization, bind all attributes to prespecified locations, so that the FFP emulation
              // code can submit attributes to any generated FFP shader without having to examine each shader in turn.
              // These prespecified locations are only assumed if GL_FFP_ONLY is specified, since user could also create their
              // own shaders that didn't have attributes in the same locations.
              GLctx.bindAttribLocation(this.program, GLImmediate.VERTEX, 'a_position');
              GLctx.bindAttribLocation(this.program, GLImmediate.COLOR, 'a_color');
              GLctx.bindAttribLocation(this.program, GLImmediate.NORMAL, 'a_normal');
              var maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
              for (var i = 0; i < GLImmediate.MAX_TEXTURES && GLImmediate.TEXTURE0 + i < maxVertexAttribs; i++) {
                GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, 'a_texCoord'+i);
                GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, aTexCoordPrefix+i);
              }
              GLctx.linkProgram(this.program);
            }
  
            // Stores an array that remembers which matrix uniforms are up-to-date in this FFP renderer, so they don't need to be resubmitted
            // each time we render with this program.
            this.textureMatrixVersion = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  
            this.positionLocation = GLctx.getAttribLocation(this.program, 'a_position');
  
            this.texCoordLocations = [];
  
            for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
              if (!GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i]) {
                this.texCoordLocations[i] = -1;
                continue;
              }
  
              if (useCurrProgram) {
                this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, 'a_texCoord' + i);
              } else {
                this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, aTexCoordPrefix + i);
              }
            }
            this.colorLocation = GLctx.getAttribLocation(this.program, 'a_color');
            if (!useCurrProgram) {
              // Temporarily switch to the program so we can set our sampler uniforms early.
              var prevBoundProg = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
              GLctx.useProgram(this.program);
              {
                for (var i = 0; i < this.usedTexUnitList.length; i++) {
                  var texUnitID = this.usedTexUnitList[i];
                  var texSamplerLoc = GLctx.getUniformLocation(this.program, uTexUnitPrefix + texUnitID);
                  GLctx.uniform1i(texSamplerLoc, texUnitID);
                }
              }
              // The default color attribute value is not the same as the default for all other attribute streams (0,0,0,1) but (1,1,1,1),
              // so explicitly set it right at start.
              GLctx.vertexAttrib4fv(this.colorLocation, [1,1,1,1]);
              GLctx.useProgram(prevBoundProg);
            }
  
            this.textureMatrixLocations = [];
            for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
              this.textureMatrixLocations[i] = GLctx.getUniformLocation(this.program, 'u_textureMatrix' + i);
            }
            this.normalLocation = GLctx.getAttribLocation(this.program, 'a_normal');
  
            this.modelViewLocation = GLctx.getUniformLocation(this.program, 'u_modelView');
            this.projectionLocation = GLctx.getUniformLocation(this.program, 'u_projection');
  
            this.hasTextures = hasTextures;
            this.hasNormal = GLImmediate.enabledClientAttributes[GLImmediate.NORMAL] &&
                             GLImmediate.clientAttributes[GLImmediate.NORMAL].size > 0 &&
                             this.normalLocation >= 0;
            this.hasColor = (this.colorLocation === 0) || this.colorLocation > 0;
  
            this.floatType = GLctx.FLOAT; // minor optimization
  
            this.fogColorLocation = GLctx.getUniformLocation(this.program, 'u_fogColor');
            this.fogEndLocation = GLctx.getUniformLocation(this.program, 'u_fogEnd');
            this.fogScaleLocation = GLctx.getUniformLocation(this.program, 'u_fogScale');
            this.fogDensityLocation = GLctx.getUniformLocation(this.program, 'u_fogDensity');
            this.hasFog = !!(this.fogColorLocation || this.fogEndLocation ||
                             this.fogScaleLocation || this.fogDensityLocation);
          },
  
          prepare: function prepare() {
            // Calculate the array buffer
            var arrayBuffer;
            if (!GL.currArrayBuffer) {
              var start = GLImmediate.firstVertex*GLImmediate.stride;
              var end = GLImmediate.lastVertex*GLImmediate.stride;
              assert(end <= GL.MAX_TEMP_BUFFER_SIZE, 'too much vertex data');
              arrayBuffer = GL.getTempVertexBuffer(end);
              // TODO: consider using the last buffer we bound, if it was larger. downside is larger buffer, but we might avoid rebinding and preparing
            } else {
              arrayBuffer = GL.currArrayBuffer;
            }
  
            // If the array buffer is unchanged and the renderer as well, then we can avoid all the work here
            // XXX We use some heuristics here, and this may not work in all cases. Try disabling GL_UNSAFE_OPTS if you
            // have odd glitches
            var lastRenderer = GLImmediate.lastRenderer;
            var canSkip = this == lastRenderer &&
                          arrayBuffer == GLImmediate.lastArrayBuffer &&
                          (GL.currProgram || this.program) == GLImmediate.lastProgram &&
                          GLImmediate.stride == GLImmediate.lastStride &&
                          !GLImmediate.matricesModified;
            if (!canSkip && lastRenderer) lastRenderer.cleanup();
            if (!GL.currArrayBuffer) {
              // Bind the array buffer and upload data after cleaning up the previous renderer
  
              if (arrayBuffer != GLImmediate.lastArrayBuffer) {
                GLctx.bindBuffer(GLctx.ARRAY_BUFFER, arrayBuffer);
                GLImmediate.lastArrayBuffer = arrayBuffer;
              }
  
              GLctx.bufferSubData(GLctx.ARRAY_BUFFER, start, GLImmediate.vertexData.subarray(start >> 2, end >> 2));
            }
            if (canSkip) return;
            GLImmediate.lastRenderer = this;
            GLImmediate.lastProgram = GL.currProgram || this.program;
            GLImmediate.lastStride == GLImmediate.stride;
            GLImmediate.matricesModified = false;
  
            if (!GL.currProgram) {
              if (GLImmediate.fixedFunctionProgram != this.program) {
                GLctx.useProgram(this.program);
                GLImmediate.fixedFunctionProgram = this.program;
              }
            }
  
            if (this.modelViewLocation && this.modelViewMatrixVersion != GLImmediate.matrixVersion[0/*m*/]) {
              this.modelViewMatrixVersion = GLImmediate.matrixVersion[0/*m*/];
              GLctx.uniformMatrix4fv(this.modelViewLocation, false, GLImmediate.matrix[0/*m*/]);
            }
            if (this.projectionLocation && this.projectionMatrixVersion != GLImmediate.matrixVersion[1/*p*/]) {
              this.projectionMatrixVersion = GLImmediate.matrixVersion[1/*p*/];
              GLctx.uniformMatrix4fv(this.projectionLocation, false, GLImmediate.matrix[1/*p*/]);
            }
  
            var clientAttributes = GLImmediate.clientAttributes;
            var posAttr = clientAttributes[GLImmediate.VERTEX];
  
  
            if (!GL.currArrayBuffer) {
              GLctx.vertexAttribPointer(GLImmediate.VERTEX, posAttr.size, posAttr.type, false, GLImmediate.stride, posAttr.offset);
              if (this.hasNormal) {
                var normalAttr = clientAttributes[GLImmediate.NORMAL];
                GLctx.vertexAttribPointer(GLImmediate.NORMAL, normalAttr.size, normalAttr.type, true, GLImmediate.stride, normalAttr.offset);
              }
            }
            if (this.hasTextures) {
              for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                if (!GL.currArrayBuffer) {
                  var attribLoc = GLImmediate.TEXTURE0+i;
                  var texAttr = clientAttributes[attribLoc];
                  if (texAttr.size) {
                    GLctx.vertexAttribPointer(attribLoc, texAttr.size, texAttr.type, false, GLImmediate.stride, texAttr.offset);
                  } else {
                    // These two might be dangerous, but let's try them.
                    GLctx.vertexAttrib4f(attribLoc, 0, 0, 0, 1);
                  }
                }
                var t = 2/*t*/+i;
                if (this.textureMatrixLocations[i] && this.textureMatrixVersion[t] != GLImmediate.matrixVersion[t]) { // XXX might we need this even without the condition we are currently in?
                  this.textureMatrixVersion[t] = GLImmediate.matrixVersion[t];
                  GLctx.uniformMatrix4fv(this.textureMatrixLocations[i], false, GLImmediate.matrix[t]);
                }
              }
            }
            if (GLImmediate.enabledClientAttributes[GLImmediate.COLOR]) {
              var colorAttr = clientAttributes[GLImmediate.COLOR];
              if (!GL.currArrayBuffer) {
                GLctx.vertexAttribPointer(GLImmediate.COLOR, colorAttr.size, colorAttr.type, true, GLImmediate.stride, colorAttr.offset);
              }
            }
            if (this.hasFog) {
              if (this.fogColorLocation) GLctx.uniform4fv(this.fogColorLocation, GLEmulation.fogColor);
              if (this.fogEndLocation) GLctx.uniform1f(this.fogEndLocation, GLEmulation.fogEnd);
              if (this.fogScaleLocation) GLctx.uniform1f(this.fogScaleLocation, 1/(GLEmulation.fogEnd - GLEmulation.fogStart));
              if (this.fogDensityLocation) GLctx.uniform1f(this.fogDensityLocation, GLEmulation.fogDensity);
            }
          },
  
          cleanup: function cleanup() {
          }
        };
        ret.init();
        return ret;
      },setupFuncs:function () {
        // Replace some functions with immediate-mode aware versions. If there are no client
        // attributes enabled, and we use webgl-friendly modes (no GL_QUADS), then no need
        // for emulation
        _glDrawArrays = _emscripten_glDrawArrays = function _glDrawArrays(mode, first, count) {
          if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6) {
            GLctx.drawArrays(mode, first, count);
            return;
          }
          GLImmediate.prepareClientAttributes(count, false);
          GLImmediate.mode = mode;
          if (!GL.currArrayBuffer) {
            GLImmediate.vertexData = HEAPF32.subarray((GLImmediate.vertexPointer)>>2,(GLImmediate.vertexPointer + (first+count)*GLImmediate.stride)>>2); // XXX assuming float
            GLImmediate.firstVertex = first;
            GLImmediate.lastVertex = first + count;
          }
          GLImmediate.flush(null, first);
          GLImmediate.mode = -1;
        };
  
        _glDrawElements = _emscripten_glDrawElements = function _glDrawElements(mode, count, type, indices, start, end) { // start, end are given if we come from glDrawRangeElements
          if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6 && GL.currElementArrayBuffer) {
            GLctx.drawElements(mode, count, type, indices);
            return;
          }
          if (!GL.currElementArrayBuffer) {
            assert(type == GLctx.UNSIGNED_SHORT); // We can only emulate buffers of this kind, for now
          }
          console.log("DrawElements doesn't actually prepareClientAttributes properly.");
          GLImmediate.prepareClientAttributes(count, false);
          GLImmediate.mode = mode;
          if (!GL.currArrayBuffer) {
            GLImmediate.firstVertex = end ? start : TOTAL_MEMORY; // if we don't know the start, set an invalid value and we will calculate it later from the indices
            GLImmediate.lastVertex = end ? end+1 : 0;
            GLImmediate.vertexData = HEAPF32.subarray((GLImmediate.vertexPointer)>>2,((end ? GLImmediate.vertexPointer + (end+1)*GLImmediate.stride : TOTAL_MEMORY))>>2); // XXX assuming float
          }
          GLImmediate.flush(count, 0, indices);
          GLImmediate.mode = -1;
        };
  
        // TexEnv stuff needs to be prepared early, so do it here.
        // init() is too late for -O2, since it freezes the GL functions
        // by that point.
        GLImmediate.MapTreeLib = GLImmediate.spawnMapTreeLib();
        GLImmediate.spawnMapTreeLib = null;
  
        GLImmediate.TexEnvJIT = GLImmediate.spawnTexEnvJIT();
        GLImmediate.spawnTexEnvJIT = null;
  
        GLImmediate.setupHooks();
      },setupHooks:function () {
        if (!GLEmulation.hasRunInit) {
          GLEmulation.init();
        }
  
        var glActiveTexture = _glActiveTexture;
        _glActiveTexture = _emscripten_glActiveTexture = function _glActiveTexture(texture) {
          GLImmediate.TexEnvJIT.hook_activeTexture(texture);
          glActiveTexture(texture);
        };
  
        var glEnable = _glEnable;
        _glEnable = _emscripten_glEnable = function _glEnable(cap) {
          GLImmediate.TexEnvJIT.hook_enable(cap);
          glEnable(cap);
        };
        var glDisable = _glDisable;
        _glDisable = _emscripten_glDisable = function _glDisable(cap) {
          GLImmediate.TexEnvJIT.hook_disable(cap);
          glDisable(cap);
        };
  
        var glTexEnvf = (typeof(_glTexEnvf) != 'undefined') ? _glTexEnvf : function(){};
        _glTexEnvf = _emscripten_glTexEnvf = function _glTexEnvf(target, pname, param) {
          GLImmediate.TexEnvJIT.hook_texEnvf(target, pname, param);
          // Don't call old func, since we are the implementor.
          //glTexEnvf(target, pname, param);
        };
        var glTexEnvi = (typeof(_glTexEnvi) != 'undefined') ? _glTexEnvi : function(){};
        _glTexEnvi = _emscripten_glTexEnvi = function _glTexEnvi(target, pname, param) {
          GLImmediate.TexEnvJIT.hook_texEnvi(target, pname, param);
          // Don't call old func, since we are the implementor.
          //glTexEnvi(target, pname, param);
        };
        var glTexEnvfv = (typeof(_glTexEnvfv) != 'undefined') ? _glTexEnvfv : function(){};
        _glTexEnvfv = _emscripten_glTexEnvfv = function _glTexEnvfv(target, pname, param) {
          GLImmediate.TexEnvJIT.hook_texEnvfv(target, pname, param);
          // Don't call old func, since we are the implementor.
          //glTexEnvfv(target, pname, param);
        };
  
        _glGetTexEnviv = function _glGetTexEnviv(target, pname, param) {
          GLImmediate.TexEnvJIT.hook_getTexEnviv(target, pname, param);
        };
  
        _glGetTexEnvfv = function _glGetTexEnvfv(target, pname, param) {
          GLImmediate.TexEnvJIT.hook_getTexEnvfv(target, pname, param);
        };
  
        var glGetIntegerv = _glGetIntegerv;
        _glGetIntegerv = _emscripten_glGetIntegerv = function _glGetIntegerv(pname, params) {
          switch (pname) {
            case 0x8B8D: { // GL_CURRENT_PROGRAM
              // Just query directly so we're working with WebGL objects.
              var cur = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
              if (cur == GLImmediate.fixedFunctionProgram) {
                // Pretend we're not using a program.
                HEAP32[((params)>>2)]=0;
                return;
              }
              break;
            }
          }
          glGetIntegerv(pname, params);
        };
      },initted:false,init:function () {
        Module.printErr('WARNING: using emscripten GL immediate mode emulation. This is very limited in what it supports');
        GLImmediate.initted = true;
  
        if (!Module.useWebGL) return; // a 2D canvas may be currently used TODO: make sure we are actually called in that case
  
        // User can override the maximum number of texture units that we emulate. Using fewer texture units increases runtime performance
        // slightly, so it is advantageous to choose as small value as needed.
        GLImmediate.MAX_TEXTURES = Module['GL_MAX_TEXTURE_IMAGE_UNITS'] || GLctx.getParameter(GLctx.MAX_TEXTURE_IMAGE_UNITS);
  
        GLImmediate.TexEnvJIT.init(GLctx, GLImmediate.MAX_TEXTURES);
  
        GLImmediate.NUM_ATTRIBUTES = 3 /*pos+normal+color attributes*/ + GLImmediate.MAX_TEXTURES;
        GLImmediate.clientAttributes = [];
        GLEmulation.enabledClientAttribIndices = [];
        for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
          GLImmediate.clientAttributes.push({});
          GLEmulation.enabledClientAttribIndices.push(false);
        }
  
        // Initialize matrix library
        // When user sets a matrix, increment a 'version number' on the new data, and when rendering, submit
        // the matrices to the shader program only if they have an old version of the data.
        GLImmediate.matrix = [];
        GLImmediate.matrixStack = [];
        GLImmediate.matrixVersion = [];
        for (var i = 0; i < 2 + GLImmediate.MAX_TEXTURES; i++) { // Modelview, Projection, plus one matrix for each texture coordinate.
          GLImmediate.matrixStack.push([]);
          GLImmediate.matrixVersion.push(0);
          GLImmediate.matrix.push(GLImmediate.matrixLib.mat4.create());
          GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[i]);
        }
  
        // Renderer cache
        GLImmediate.rendererCache = GLImmediate.MapTreeLib.create();
  
        // Buffers for data
        GLImmediate.tempData = new Float32Array(GL.MAX_TEMP_BUFFER_SIZE >> 2);
        GLImmediate.indexData = new Uint16Array(GL.MAX_TEMP_BUFFER_SIZE >> 1);
  
        GLImmediate.vertexDataU8 = new Uint8Array(GLImmediate.tempData.buffer);
  
        GL.generateTempBuffers(true);
  
        GLImmediate.clientColor = new Float32Array([1, 1, 1, 1]);
      },prepareClientAttributes:function prepareClientAttributes(count, beginEnd) {
        // If no client attributes were modified since we were last called, do nothing. Note that this
        // does not work for glBegin/End, where we generate renderer components dynamically and then
        // disable them ourselves, but it does help with glDrawElements/Arrays.
        if (!GLImmediate.modifiedClientAttributes) {
          GLImmediate.vertexCounter = (GLImmediate.stride * count) / 4; // XXX assuming float
          return;
        }
        GLImmediate.modifiedClientAttributes = false;
  
        // The role of prepareClientAttributes is to examine the set of client-side vertex attribute buffers
        // that user code has submitted, and to prepare them to be uploaded to a VBO in GPU memory
        // (since WebGL does not support client-side rendering, i.e. rendering from vertex data in CPU memory)
        // User can submit vertex data generally in three different configurations:
        // 1. Fully planar: all attributes are in their own separate tightly-packed arrays in CPU memory.
        // 2. Fully interleaved: all attributes share a single array where data is interleaved something like (pos,uv,normal), (pos,uv,normal), ...
        // 3. Complex hybrid: Multiple separate arrays that either are sparsely strided, and/or partially interleave vertex attributes.
  
        // For simplicity, we support the case (2) as the fast case. For (1) and (3), we do a memory copy of the
        // vertex data here to prepare a relayouted buffer that is of the structure in case (2). The reason
        // for this is that it allows the emulation code to get away with using just one VBO buffer for rendering,
        // and not have to maintain multiple ones. Therefore cases (1) and (3) will be very slow, and case (2) is fast.
  
        // Detect which case we are in by using a quick heuristic by examining the strides of the buffers. If all the buffers have identical 
        // stride, we assume we have case (2), otherwise we have something more complex.
        var clientStartPointer = 0x7FFFFFFF;
        var bytes = 0; // Total number of bytes taken up by a single vertex.
        var minStride = 0x7FFFFFFF;
        var maxStride = 0;
        var attributes = GLImmediate.liveClientAttributes;
        attributes.length = 0;
        for (var i = 0; i < 3+GLImmediate.MAX_TEXTURES; i++) {
          if (GLImmediate.enabledClientAttributes[i]) {
            var attr = GLImmediate.clientAttributes[i];
            attributes.push(attr);
            clientStartPointer = Math.min(clientStartPointer, attr.pointer);
            attr.sizeBytes = attr.size * GL.byteSizeByType[attr.type - GL.byteSizeByTypeRoot];
            bytes += attr.sizeBytes;
            minStride = Math.min(minStride, attr.stride);
            maxStride = Math.max(maxStride, attr.stride);
          }
        }
  
        if ((minStride != maxStride || maxStride < bytes) && !beginEnd) {
          // We are in cases (1) or (3): slow path, shuffle the data around into a single interleaved vertex buffer.
          // The immediate-mode glBegin()/glEnd() vertex submission gets automatically generated in appropriate layout,
          // so never need to come down this path if that was used.
          if (!GLImmediate.restrideBuffer) GLImmediate.restrideBuffer = _malloc(GL.MAX_TEMP_BUFFER_SIZE);
          var start = GLImmediate.restrideBuffer;
          bytes = 0;
          // calculate restrided offsets and total size
          for (var i = 0; i < attributes.length; i++) {
            var attr = attributes[i];
            var size = attr.sizeBytes;
            if (size % 4 != 0) size += 4 - (size % 4); // align everything
            attr.offset = bytes;
            bytes += size;
          }
          // copy out the data (we need to know the stride for that, and define attr.pointer)
          for (var i = 0; i < attributes.length; i++) {
            var attr = attributes[i];
            var srcStride = Math.max(attr.sizeBytes, attr.stride);
            if ((srcStride & 3) == 0 && (attr.sizeBytes & 3) == 0) {
              var size4 = attr.sizeBytes>>2;
              var srcStride4 = Math.max(attr.sizeBytes, attr.stride)>>2;
              for (var j = 0; j < count; j++) {
                for (var k = 0; k < size4; k++) { // copy in chunks of 4 bytes, our alignment makes this possible
                  HEAP32[((start + attr.offset + bytes*j)>>2) + k] = HEAP32[(attr.pointer>>2) + j*srcStride4 + k];
                }
              }
            } else {
              for (var j = 0; j < count; j++) {
                for (var k = 0; k < attr.sizeBytes; k++) { // source data was not aligned to multiples of 4, must copy byte by byte.
                  HEAP8[start + attr.offset + bytes*j + k] = HEAP8[attr.pointer + j*srcStride + k];
                }
              }
            }
            attr.pointer = start + attr.offset;
          }
          GLImmediate.stride = bytes;
          GLImmediate.vertexPointer = start;
        } else {
          // case (2): fast path, all data is interleaved to a single vertex array so we can get away with a single VBO upload.
          if (GL.currArrayBuffer) {
            GLImmediate.vertexPointer = 0;
          } else {
            GLImmediate.vertexPointer = clientStartPointer;
          }
          for (var i = 0; i < attributes.length; i++) {
            var attr = attributes[i];
            attr.offset = attr.pointer - GLImmediate.vertexPointer; // Compute what will be the offset of this attribute in the VBO after we upload.
          }
          GLImmediate.stride = Math.max(maxStride, bytes);
        }
        if (!beginEnd) {
          GLImmediate.vertexCounter = (GLImmediate.stride * count) / 4; // XXX assuming float
        }
      },flush:function flush(numProvidedIndexes, startIndex, ptr) {
        assert(numProvidedIndexes >= 0 || !numProvidedIndexes);
        startIndex = startIndex || 0;
        ptr = ptr || 0;
  
        var renderer = GLImmediate.getRenderer();
  
        // Generate index data in a format suitable for GLES 2.0/WebGL
        var numVertexes = 4 * GLImmediate.vertexCounter / GLImmediate.stride;
        assert(numVertexes % 1 == 0, "`numVertexes` must be an integer.");
        var emulatedElementArrayBuffer = false;
        var numIndexes = 0;
        if (numProvidedIndexes) {
          numIndexes = numProvidedIndexes;
          if (!GL.currArrayBuffer && GLImmediate.firstVertex > GLImmediate.lastVertex) {
            // Figure out the first and last vertex from the index data
            assert(!GL.currElementArrayBuffer); // If we are going to upload array buffer data, we need to find which range to
                                                // upload based on the indices. If they are in a buffer on the GPU, that is very
                                                // inconvenient! So if you do not have an array buffer, you should also not have
                                                // an element array buffer. But best is to use both buffers!
            for (var i = 0; i < numProvidedIndexes; i++) {
              var currIndex = HEAPU16[(((ptr)+(i*2))>>1)];
              GLImmediate.firstVertex = Math.min(GLImmediate.firstVertex, currIndex);
              GLImmediate.lastVertex = Math.max(GLImmediate.lastVertex, currIndex+1);
            }
          }
          if (!GL.currElementArrayBuffer) {
            // If no element array buffer is bound, then indices is a literal pointer to clientside data
            assert(numProvidedIndexes << 1 <= GL.MAX_TEMP_BUFFER_SIZE, 'too many immediate mode indexes (a)');
            var indexBuffer = GL.getTempIndexBuffer(numProvidedIndexes << 1);
            GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
            GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU16.subarray((ptr)>>1,(ptr + (numProvidedIndexes << 1))>>1));
            ptr = 0;
            emulatedElementArrayBuffer = true;
          }
        } else if (GLImmediate.mode > 6) { // above GL_TRIANGLE_FAN are the non-GL ES modes
          if (GLImmediate.mode != 7) throw 'unsupported immediate mode ' + GLImmediate.mode; // GL_QUADS
          // GLImmediate.firstVertex is the first vertex we want. Quad indexes are in the pattern
          // 0 1 2, 0 2 3, 4 5 6, 4 6 7, so we need to look at index firstVertex * 1.5 to see it.
          // Then since indexes are 2 bytes each, that means 3
          assert(GLImmediate.firstVertex % 4 == 0);
          ptr = GLImmediate.firstVertex*3;
          var numQuads = numVertexes / 4;
          numIndexes = numQuads * 6; // 0 1 2, 0 2 3 pattern
          assert(ptr + (numIndexes << 1) <= GL.MAX_TEMP_BUFFER_SIZE, 'too many immediate mode indexes (b)');
          GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.tempQuadIndexBuffer);
          emulatedElementArrayBuffer = true;
        }
  
        renderer.prepare();
  
        if (numIndexes) {
          GLctx.drawElements(GLctx.TRIANGLES, numIndexes, GLctx.UNSIGNED_SHORT, ptr);
        } else {
          GLctx.drawArrays(GLImmediate.mode, startIndex, numVertexes);
        }
  
        if (emulatedElementArrayBuffer) {
          GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.buffers[GL.currElementArrayBuffer] || null);
        }
  
      }};
  GLImmediate.matrixLib = (function() {
  
  /**
   * @fileoverview gl-matrix - High performance matrix and vector operations for WebGL
   * @author Brandon Jones
   * @version 1.2.4
   */
  
  // Modifed for emscripten: Global scoping etc.
  
  /*
   * Copyright (c) 2011 Brandon Jones
   *
   * This software is provided 'as-is', without any express or implied
   * warranty. In no event will the authors be held liable for any damages
   * arising from the use of this software.
   *
   * Permission is granted to anyone to use this software for any purpose,
   * including commercial applications, and to alter it and redistribute it
   * freely, subject to the following restrictions:
   *
   *    1. The origin of this software must not be misrepresented; you must not
   *    claim that you wrote the original software. If you use this software
   *    in a product, an acknowledgment in the product documentation would be
   *    appreciated but is not required.
   *
   *    2. Altered source versions must be plainly marked as such, and must not
   *    be misrepresented as being the original software.
   *
   *    3. This notice may not be removed or altered from any source
   *    distribution.
   */
  
  
  /**
   * @class 3 Dimensional Vector
   * @name vec3
   */
  var vec3 = {};
  
  /**
   * @class 3x3 Matrix
   * @name mat3
   */
  var mat3 = {};
  
  /**
   * @class 4x4 Matrix
   * @name mat4
   */
  var mat4 = {};
  
  /**
   * @class Quaternion
   * @name quat4
   */
  var quat4 = {};
  
  var MatrixArray = Float32Array;
  
  /*
   * vec3
   */
   
  /**
   * Creates a new instance of a vec3 using the default array type
   * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
   *
   * @param {vec3} [vec] vec3 containing values to initialize with
   *
   * @returns {vec3} New vec3
   */
  vec3.create = function (vec) {
      var dest = new MatrixArray(3);
  
      if (vec) {
          dest[0] = vec[0];
          dest[1] = vec[1];
          dest[2] = vec[2];
      } else {
          dest[0] = dest[1] = dest[2] = 0;
      }
  
      return dest;
  };
  
  /**
   * Copies the values of one vec3 to another
   *
   * @param {vec3} vec vec3 containing values to copy
   * @param {vec3} dest vec3 receiving copied values
   *
   * @returns {vec3} dest
   */
  vec3.set = function (vec, dest) {
      dest[0] = vec[0];
      dest[1] = vec[1];
      dest[2] = vec[2];
  
      return dest;
  };
  
  /**
   * Performs a vector addition
   *
   * @param {vec3} vec First operand
   * @param {vec3} vec2 Second operand
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.add = function (vec, vec2, dest) {
      if (!dest || vec === dest) {
          vec[0] += vec2[0];
          vec[1] += vec2[1];
          vec[2] += vec2[2];
          return vec;
      }
  
      dest[0] = vec[0] + vec2[0];
      dest[1] = vec[1] + vec2[1];
      dest[2] = vec[2] + vec2[2];
      return dest;
  };
  
  /**
   * Performs a vector subtraction
   *
   * @param {vec3} vec First operand
   * @param {vec3} vec2 Second operand
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.subtract = function (vec, vec2, dest) {
      if (!dest || vec === dest) {
          vec[0] -= vec2[0];
          vec[1] -= vec2[1];
          vec[2] -= vec2[2];
          return vec;
      }
  
      dest[0] = vec[0] - vec2[0];
      dest[1] = vec[1] - vec2[1];
      dest[2] = vec[2] - vec2[2];
      return dest;
  };
  
  /**
   * Performs a vector multiplication
   *
   * @param {vec3} vec First operand
   * @param {vec3} vec2 Second operand
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.multiply = function (vec, vec2, dest) {
      if (!dest || vec === dest) {
          vec[0] *= vec2[0];
          vec[1] *= vec2[1];
          vec[2] *= vec2[2];
          return vec;
      }
  
      dest[0] = vec[0] * vec2[0];
      dest[1] = vec[1] * vec2[1];
      dest[2] = vec[2] * vec2[2];
      return dest;
  };
  
  /**
   * Negates the components of a vec3
   *
   * @param {vec3} vec vec3 to negate
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.negate = function (vec, dest) {
      if (!dest) { dest = vec; }
  
      dest[0] = -vec[0];
      dest[1] = -vec[1];
      dest[2] = -vec[2];
      return dest;
  };
  
  /**
   * Multiplies the components of a vec3 by a scalar value
   *
   * @param {vec3} vec vec3 to scale
   * @param {number} val Value to scale by
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.scale = function (vec, val, dest) {
      if (!dest || vec === dest) {
          vec[0] *= val;
          vec[1] *= val;
          vec[2] *= val;
          return vec;
      }
  
      dest[0] = vec[0] * val;
      dest[1] = vec[1] * val;
      dest[2] = vec[2] * val;
      return dest;
  };
  
  /**
   * Generates a unit vector of the same direction as the provided vec3
   * If vector length is 0, returns [0, 0, 0]
   *
   * @param {vec3} vec vec3 to normalize
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.normalize = function (vec, dest) {
      if (!dest) { dest = vec; }
  
      var x = vec[0], y = vec[1], z = vec[2],
          len = Math.sqrt(x * x + y * y + z * z);
  
      if (!len) {
          dest[0] = 0;
          dest[1] = 0;
          dest[2] = 0;
          return dest;
      } else if (len === 1) {
          dest[0] = x;
          dest[1] = y;
          dest[2] = z;
          return dest;
      }
  
      len = 1 / len;
      dest[0] = x * len;
      dest[1] = y * len;
      dest[2] = z * len;
      return dest;
  };
  
  /**
   * Generates the cross product of two vec3s
   *
   * @param {vec3} vec First operand
   * @param {vec3} vec2 Second operand
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.cross = function (vec, vec2, dest) {
      if (!dest) { dest = vec; }
  
      var x = vec[0], y = vec[1], z = vec[2],
          x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];
  
      dest[0] = y * z2 - z * y2;
      dest[1] = z * x2 - x * z2;
      dest[2] = x * y2 - y * x2;
      return dest;
  };
  
  /**
   * Caclulates the length of a vec3
   *
   * @param {vec3} vec vec3 to calculate length of
   *
   * @returns {number} Length of vec
   */
  vec3.length = function (vec) {
      var x = vec[0], y = vec[1], z = vec[2];
      return Math.sqrt(x * x + y * y + z * z);
  };
  
  /**
   * Caclulates the dot product of two vec3s
   *
   * @param {vec3} vec First operand
   * @param {vec3} vec2 Second operand
   *
   * @returns {number} Dot product of vec and vec2
   */
  vec3.dot = function (vec, vec2) {
      return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
  };
  
  /**
   * Generates a unit vector pointing from one vector to another
   *
   * @param {vec3} vec Origin vec3
   * @param {vec3} vec2 vec3 to point to
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.direction = function (vec, vec2, dest) {
      if (!dest) { dest = vec; }
  
      var x = vec[0] - vec2[0],
          y = vec[1] - vec2[1],
          z = vec[2] - vec2[2],
          len = Math.sqrt(x * x + y * y + z * z);
  
      if (!len) {
          dest[0] = 0;
          dest[1] = 0;
          dest[2] = 0;
          return dest;
      }
  
      len = 1 / len;
      dest[0] = x * len;
      dest[1] = y * len;
      dest[2] = z * len;
      return dest;
  };
  
  /**
   * Performs a linear interpolation between two vec3
   *
   * @param {vec3} vec First vector
   * @param {vec3} vec2 Second vector
   * @param {number} lerp Interpolation amount between the two inputs
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.lerp = function (vec, vec2, lerp, dest) {
      if (!dest) { dest = vec; }
  
      dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
      dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
      dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
  
      return dest;
  };
  
  /**
   * Calculates the euclidian distance between two vec3
   *
   * Params:
   * @param {vec3} vec First vector
   * @param {vec3} vec2 Second vector
   *
   * @returns {number} Distance between vec and vec2
   */
  vec3.dist = function (vec, vec2) {
      var x = vec2[0] - vec[0],
          y = vec2[1] - vec[1],
          z = vec2[2] - vec[2];
          
      return Math.sqrt(x*x + y*y + z*z);
  };
  
  /**
   * Projects the specified vec3 from screen space into object space
   * Based on the <a href="http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup">Mesa gluUnProject implementation</a>
   *
   * @param {vec3} vec Screen-space vector to project
   * @param {mat4} view View matrix
   * @param {mat4} proj Projection matrix
   * @param {vec4} viewport Viewport as given to gl.viewport [x, y, width, height]
   * @param {vec3} [dest] vec3 receiving unprojected result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  vec3.unproject = function (vec, view, proj, viewport, dest) {
      if (!dest) { dest = vec; }
  
      var m = mat4.create();
      var v = new MatrixArray(4);
      
      v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
      v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
      v[2] = 2.0 * vec[2] - 1.0;
      v[3] = 1.0;
      
      mat4.multiply(proj, view, m);
      if(!mat4.inverse(m)) { return null; }
      
      mat4.multiplyVec4(m, v);
      if(v[3] === 0.0) { return null; }
  
      dest[0] = v[0] / v[3];
      dest[1] = v[1] / v[3];
      dest[2] = v[2] / v[3];
      
      return dest;
  };
  
  /**
   * Returns a string representation of a vector
   *
   * @param {vec3} vec Vector to represent as a string
   *
   * @returns {string} String representation of vec
   */
  vec3.str = function (vec) {
      return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
  };
  
  /*
   * mat3
   */
  
  /**
   * Creates a new instance of a mat3 using the default array type
   * Any javascript array-like object containing at least 9 numeric elements can serve as a mat3
   *
   * @param {mat3} [mat] mat3 containing values to initialize with
   *
   * @returns {mat3} New mat3
   */
  mat3.create = function (mat) {
      var dest = new MatrixArray(9);
  
      if (mat) {
          dest[0] = mat[0];
          dest[1] = mat[1];
          dest[2] = mat[2];
          dest[3] = mat[3];
          dest[4] = mat[4];
          dest[5] = mat[5];
          dest[6] = mat[6];
          dest[7] = mat[7];
          dest[8] = mat[8];
      }
  
      return dest;
  };
  
  /**
   * Copies the values of one mat3 to another
   *
   * @param {mat3} mat mat3 containing values to copy
   * @param {mat3} dest mat3 receiving copied values
   *
   * @returns {mat3} dest
   */
  mat3.set = function (mat, dest) {
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[8] = mat[8];
      return dest;
  };
  
  /**
   * Sets a mat3 to an identity matrix
   *
   * @param {mat3} dest mat3 to set
   *
   * @returns dest if specified, otherwise a new mat3
   */
  mat3.identity = function (dest) {
      if (!dest) { dest = mat3.create(); }
      dest[0] = 1;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 1;
      dest[5] = 0;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = 1;
      return dest;
  };
  
  /**
   * Transposes a mat3 (flips the values over the diagonal)
   *
   * Params:
   * @param {mat3} mat mat3 to transpose
   * @param {mat3} [dest] mat3 receiving transposed values. If not specified result is written to mat
   *
   * @returns {mat3} dest is specified, mat otherwise
   */
  mat3.transpose = function (mat, dest) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (!dest || mat === dest) {
          var a01 = mat[1], a02 = mat[2],
              a12 = mat[5];
  
          mat[1] = mat[3];
          mat[2] = mat[6];
          mat[3] = a01;
          mat[5] = mat[7];
          mat[6] = a02;
          mat[7] = a12;
          return mat;
      }
  
      dest[0] = mat[0];
      dest[1] = mat[3];
      dest[2] = mat[6];
      dest[3] = mat[1];
      dest[4] = mat[4];
      dest[5] = mat[7];
      dest[6] = mat[2];
      dest[7] = mat[5];
      dest[8] = mat[8];
      return dest;
  };
  
  /**
   * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
   *
   * @param {mat3} mat mat3 containing values to copy
   * @param {mat4} [dest] mat4 receiving copied values
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  mat3.toMat4 = function (mat, dest) {
      if (!dest) { dest = mat4.create(); }
  
      dest[15] = 1;
      dest[14] = 0;
      dest[13] = 0;
      dest[12] = 0;
  
      dest[11] = 0;
      dest[10] = mat[8];
      dest[9] = mat[7];
      dest[8] = mat[6];
  
      dest[7] = 0;
      dest[6] = mat[5];
      dest[5] = mat[4];
      dest[4] = mat[3];
  
      dest[3] = 0;
      dest[2] = mat[2];
      dest[1] = mat[1];
      dest[0] = mat[0];
  
      return dest;
  };
  
  /**
   * Returns a string representation of a mat3
   *
   * @param {mat3} mat mat3 to represent as a string
   *
   * @param {string} String representation of mat
   */
  mat3.str = function (mat) {
      return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
          ', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] +
          ', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
  };
  
  /*
   * mat4
   */
  
  /**
   * Creates a new instance of a mat4 using the default array type
   * Any javascript array-like object containing at least 16 numeric elements can serve as a mat4
   *
   * @param {mat4} [mat] mat4 containing values to initialize with
   *
   * @returns {mat4} New mat4
   */
  mat4.create = function (mat) {
      var dest = new MatrixArray(16);
  
      if (mat) {
          dest[0] = mat[0];
          dest[1] = mat[1];
          dest[2] = mat[2];
          dest[3] = mat[3];
          dest[4] = mat[4];
          dest[5] = mat[5];
          dest[6] = mat[6];
          dest[7] = mat[7];
          dest[8] = mat[8];
          dest[9] = mat[9];
          dest[10] = mat[10];
          dest[11] = mat[11];
          dest[12] = mat[12];
          dest[13] = mat[13];
          dest[14] = mat[14];
          dest[15] = mat[15];
      }
  
      return dest;
  };
  
  /**
   * Copies the values of one mat4 to another
   *
   * @param {mat4} mat mat4 containing values to copy
   * @param {mat4} dest mat4 receiving copied values
   *
   * @returns {mat4} dest
   */
  mat4.set = function (mat, dest) {
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[8] = mat[8];
      dest[9] = mat[9];
      dest[10] = mat[10];
      dest[11] = mat[11];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
      return dest;
  };
  
  /**
   * Sets a mat4 to an identity matrix
   *
   * @param {mat4} dest mat4 to set
   *
   * @returns {mat4} dest
   */
  mat4.identity = function (dest) {
      if (!dest) { dest = mat4.create(); }
      dest[0] = 1;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 0;
      dest[5] = 1;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = 0;
      dest[9] = 0;
      dest[10] = 1;
      dest[11] = 0;
      dest[12] = 0;
      dest[13] = 0;
      dest[14] = 0;
      dest[15] = 1;
      return dest;
  };
  
  /**
   * Transposes a mat4 (flips the values over the diagonal)
   *
   * @param {mat4} mat mat4 to transpose
   * @param {mat4} [dest] mat4 receiving transposed values. If not specified result is written to mat
   *
   * @param {mat4} dest is specified, mat otherwise
   */
  mat4.transpose = function (mat, dest) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (!dest || mat === dest) {
          var a01 = mat[1], a02 = mat[2], a03 = mat[3],
              a12 = mat[6], a13 = mat[7],
              a23 = mat[11];
  
          mat[1] = mat[4];
          mat[2] = mat[8];
          mat[3] = mat[12];
          mat[4] = a01;
          mat[6] = mat[9];
          mat[7] = mat[13];
          mat[8] = a02;
          mat[9] = a12;
          mat[11] = mat[14];
          mat[12] = a03;
          mat[13] = a13;
          mat[14] = a23;
          return mat;
      }
  
      dest[0] = mat[0];
      dest[1] = mat[4];
      dest[2] = mat[8];
      dest[3] = mat[12];
      dest[4] = mat[1];
      dest[5] = mat[5];
      dest[6] = mat[9];
      dest[7] = mat[13];
      dest[8] = mat[2];
      dest[9] = mat[6];
      dest[10] = mat[10];
      dest[11] = mat[14];
      dest[12] = mat[3];
      dest[13] = mat[7];
      dest[14] = mat[11];
      dest[15] = mat[15];
      return dest;
  };
  
  /**
   * Calculates the determinant of a mat4
   *
   * @param {mat4} mat mat4 to calculate determinant of
   *
   * @returns {number} determinant of mat
   */
  mat4.determinant = function (mat) {
      // Cache the matrix values (makes for huge speed increases!)
      var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
          a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
          a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
          a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
  
      return (a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
              a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
              a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
              a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
              a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
              a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33);
  };
  
  /**
   * Calculates the inverse matrix of a mat4
   *
   * @param {mat4} mat mat4 to calculate inverse of
   * @param {mat4} [dest] mat4 receiving inverse matrix. If not specified result is written to mat
   *
   * @param {mat4} dest is specified, mat otherwise, null if matrix cannot be inverted
   */
  mat4.inverse = function (mat, dest) {
      if (!dest) { dest = mat; }
  
      // Cache the matrix values (makes for huge speed increases!)
      var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
          a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
          a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
          a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],
  
          b00 = a00 * a11 - a01 * a10,
          b01 = a00 * a12 - a02 * a10,
          b02 = a00 * a13 - a03 * a10,
          b03 = a01 * a12 - a02 * a11,
          b04 = a01 * a13 - a03 * a11,
          b05 = a02 * a13 - a03 * a12,
          b06 = a20 * a31 - a21 * a30,
          b07 = a20 * a32 - a22 * a30,
          b08 = a20 * a33 - a23 * a30,
          b09 = a21 * a32 - a22 * a31,
          b10 = a21 * a33 - a23 * a31,
          b11 = a22 * a33 - a23 * a32,
  
          d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
          invDet;
  
          // Calculate the determinant
          if (!d) { return null; }
          invDet = 1 / d;
  
      dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
      dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
      dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
      dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
      dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
      dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
      dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
      dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
      dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
      dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
      dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
      dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
      dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
      dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
      dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
      dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
  
      return dest;
  };
  
  /**
   * Copies the upper 3x3 elements of a mat4 into another mat4
   *
   * @param {mat4} mat mat4 containing values to copy
   * @param {mat4} [dest] mat4 receiving copied values
   *
   * @returns {mat4} dest is specified, a new mat4 otherwise
   */
  mat4.toRotationMat = function (mat, dest) {
      if (!dest) { dest = mat4.create(); }
  
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[8] = mat[8];
      dest[9] = mat[9];
      dest[10] = mat[10];
      dest[11] = mat[11];
      dest[12] = 0;
      dest[13] = 0;
      dest[14] = 0;
      dest[15] = 1;
  
      return dest;
  };
  
  /**
   * Copies the upper 3x3 elements of a mat4 into a mat3
   *
   * @param {mat4} mat mat4 containing values to copy
   * @param {mat3} [dest] mat3 receiving copied values
   *
   * @returns {mat3} dest is specified, a new mat3 otherwise
   */
  mat4.toMat3 = function (mat, dest) {
      if (!dest) { dest = mat3.create(); }
  
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[4];
      dest[4] = mat[5];
      dest[5] = mat[6];
      dest[6] = mat[8];
      dest[7] = mat[9];
      dest[8] = mat[10];
  
      return dest;
  };
  
  /**
   * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
   * The resulting matrix is useful for calculating transformed normals
   *
   * Params:
   * @param {mat4} mat mat4 containing values to invert and copy
   * @param {mat3} [dest] mat3 receiving values
   *
   * @returns {mat3} dest is specified, a new mat3 otherwise, null if the matrix cannot be inverted
   */
  mat4.toInverseMat3 = function (mat, dest) {
      // Cache the matrix values (makes for huge speed increases!)
      var a00 = mat[0], a01 = mat[1], a02 = mat[2],
          a10 = mat[4], a11 = mat[5], a12 = mat[6],
          a20 = mat[8], a21 = mat[9], a22 = mat[10],
  
          b01 = a22 * a11 - a12 * a21,
          b11 = -a22 * a10 + a12 * a20,
          b21 = a21 * a10 - a11 * a20,
  
          d = a00 * b01 + a01 * b11 + a02 * b21,
          id;
  
      if (!d) { return null; }
      id = 1 / d;
  
      if (!dest) { dest = mat3.create(); }
  
      dest[0] = b01 * id;
      dest[1] = (-a22 * a01 + a02 * a21) * id;
      dest[2] = (a12 * a01 - a02 * a11) * id;
      dest[3] = b11 * id;
      dest[4] = (a22 * a00 - a02 * a20) * id;
      dest[5] = (-a12 * a00 + a02 * a10) * id;
      dest[6] = b21 * id;
      dest[7] = (-a21 * a00 + a01 * a20) * id;
      dest[8] = (a11 * a00 - a01 * a10) * id;
  
      return dest;
  };
  
  /**
   * Performs a matrix multiplication
   *
   * @param {mat4} mat First operand
   * @param {mat4} mat2 Second operand
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @returns {mat4} dest if specified, mat otherwise
   */
  mat4.multiply = function (mat, mat2, dest) {
      if (!dest) { dest = mat; }
  
      // Cache the matrix values (makes for huge speed increases!)
      var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
          a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
          a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
          a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],
  
          b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3],
          b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7],
          b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11],
          b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
  
      dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
      dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
      dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
      dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
      dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
      dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
      dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
      dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
      dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
      dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
      dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
      dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
      dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
      dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
      dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
      dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
  
      return dest;
  };
  
  /**
   * Transforms a vec3 with the given matrix
   * 4th vector component is implicitly '1'
   *
   * @param {mat4} mat mat4 to transform the vector with
   * @param {vec3} vec vec3 to transform
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec3} dest if specified, vec otherwise
   */
  mat4.multiplyVec3 = function (mat, vec, dest) {
      if (!dest) { dest = vec; }
  
      var x = vec[0], y = vec[1], z = vec[2];
  
      dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
      dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
      dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
  
      return dest;
  };
  
  /**
   * Transforms a vec4 with the given matrix
   *
   * @param {mat4} mat mat4 to transform the vector with
   * @param {vec4} vec vec4 to transform
   * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
   *
   * @returns {vec4} dest if specified, vec otherwise
   */
  mat4.multiplyVec4 = function (mat, vec, dest) {
      if (!dest) { dest = vec; }
  
      var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
  
      dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
      dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
      dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
      dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
  
      return dest;
  };
  
  /**
   * Translates a matrix by the given vector
   *
   * @param {mat4} mat mat4 to translate
   * @param {vec3} vec vec3 specifying the translation
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @returns {mat4} dest if specified, mat otherwise
   */
  mat4.translate = function (mat, vec, dest) {
      var x = vec[0], y = vec[1], z = vec[2],
          a00, a01, a02, a03,
          a10, a11, a12, a13,
          a20, a21, a22, a23;
  
      if (!dest || mat === dest) {
          mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
          mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
          mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
          mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
          return mat;
      }
  
      a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
      a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
      a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];
  
      dest[0] = a00; dest[1] = a01; dest[2] = a02; dest[3] = a03;
      dest[4] = a10; dest[5] = a11; dest[6] = a12; dest[7] = a13;
      dest[8] = a20; dest[9] = a21; dest[10] = a22; dest[11] = a23;
  
      dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
      dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
      dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
      dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
      return dest;
  };
  
  /**
   * Scales a matrix by the given vector
   *
   * @param {mat4} mat mat4 to scale
   * @param {vec3} vec vec3 specifying the scale for each axis
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @param {mat4} dest if specified, mat otherwise
   */
  mat4.scale = function (mat, vec, dest) {
      var x = vec[0], y = vec[1], z = vec[2];
  
      if (!dest || mat === dest) {
          mat[0] *= x;
          mat[1] *= x;
          mat[2] *= x;
          mat[3] *= x;
          mat[4] *= y;
          mat[5] *= y;
          mat[6] *= y;
          mat[7] *= y;
          mat[8] *= z;
          mat[9] *= z;
          mat[10] *= z;
          mat[11] *= z;
          return mat;
      }
  
      dest[0] = mat[0] * x;
      dest[1] = mat[1] * x;
      dest[2] = mat[2] * x;
      dest[3] = mat[3] * x;
      dest[4] = mat[4] * y;
      dest[5] = mat[5] * y;
      dest[6] = mat[6] * y;
      dest[7] = mat[7] * y;
      dest[8] = mat[8] * z;
      dest[9] = mat[9] * z;
      dest[10] = mat[10] * z;
      dest[11] = mat[11] * z;
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
      return dest;
  };
  
  /**
   * Rotates a matrix by the given angle around the specified axis
   * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
   *
   * @param {mat4} mat mat4 to rotate
   * @param {number} angle Angle (in radians) to rotate
   * @param {vec3} axis vec3 representing the axis to rotate around 
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @returns {mat4} dest if specified, mat otherwise
   */
  mat4.rotate = function (mat, angle, axis, dest) {
      var x = axis[0], y = axis[1], z = axis[2],
          len = Math.sqrt(x * x + y * y + z * z),
          s, c, t,
          a00, a01, a02, a03,
          a10, a11, a12, a13,
          a20, a21, a22, a23,
          b00, b01, b02,
          b10, b11, b12,
          b20, b21, b22;
  
      if (!len) { return null; }
      if (len !== 1) {
          len = 1 / len;
          x *= len;
          y *= len;
          z *= len;
      }
  
      s = Math.sin(angle);
      c = Math.cos(angle);
      t = 1 - c;
  
      a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
      a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
      a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];
  
      // Construct the elements of the rotation matrix
      b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
      b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
      b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
  
      if (!dest) {
          dest = mat;
      } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
          dest[12] = mat[12];
          dest[13] = mat[13];
          dest[14] = mat[14];
          dest[15] = mat[15];
      }
  
      // Perform rotation-specific matrix multiplication
      dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
      dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
      dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
      dest[3] = a03 * b00 + a13 * b01 + a23 * b02;
  
      dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
      dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
      dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
      dest[7] = a03 * b10 + a13 * b11 + a23 * b12;
  
      dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
      dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
      dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
      dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
      return dest;
  };
  
  /**
   * Rotates a matrix by the given angle around the X axis
   *
   * @param {mat4} mat mat4 to rotate
   * @param {number} angle Angle (in radians) to rotate
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @returns {mat4} dest if specified, mat otherwise
   */
  mat4.rotateX = function (mat, angle, dest) {
      var s = Math.sin(angle),
          c = Math.cos(angle),
          a10 = mat[4],
          a11 = mat[5],
          a12 = mat[6],
          a13 = mat[7],
          a20 = mat[8],
          a21 = mat[9],
          a22 = mat[10],
          a23 = mat[11];
  
      if (!dest) {
          dest = mat;
      } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
          dest[0] = mat[0];
          dest[1] = mat[1];
          dest[2] = mat[2];
          dest[3] = mat[3];
  
          dest[12] = mat[12];
          dest[13] = mat[13];
          dest[14] = mat[14];
          dest[15] = mat[15];
      }
  
      // Perform axis-specific matrix multiplication
      dest[4] = a10 * c + a20 * s;
      dest[5] = a11 * c + a21 * s;
      dest[6] = a12 * c + a22 * s;
      dest[7] = a13 * c + a23 * s;
  
      dest[8] = a10 * -s + a20 * c;
      dest[9] = a11 * -s + a21 * c;
      dest[10] = a12 * -s + a22 * c;
      dest[11] = a13 * -s + a23 * c;
      return dest;
  };
  
  /**
   * Rotates a matrix by the given angle around the Y axis
   *
   * @param {mat4} mat mat4 to rotate
   * @param {number} angle Angle (in radians) to rotate
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @returns {mat4} dest if specified, mat otherwise
   */
  mat4.rotateY = function (mat, angle, dest) {
      var s = Math.sin(angle),
          c = Math.cos(angle),
          a00 = mat[0],
          a01 = mat[1],
          a02 = mat[2],
          a03 = mat[3],
          a20 = mat[8],
          a21 = mat[9],
          a22 = mat[10],
          a23 = mat[11];
  
      if (!dest) {
          dest = mat;
      } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
          dest[4] = mat[4];
          dest[5] = mat[5];
          dest[6] = mat[6];
          dest[7] = mat[7];
  
          dest[12] = mat[12];
          dest[13] = mat[13];
          dest[14] = mat[14];
          dest[15] = mat[15];
      }
  
      // Perform axis-specific matrix multiplication
      dest[0] = a00 * c + a20 * -s;
      dest[1] = a01 * c + a21 * -s;
      dest[2] = a02 * c + a22 * -s;
      dest[3] = a03 * c + a23 * -s;
  
      dest[8] = a00 * s + a20 * c;
      dest[9] = a01 * s + a21 * c;
      dest[10] = a02 * s + a22 * c;
      dest[11] = a03 * s + a23 * c;
      return dest;
  };
  
  /**
   * Rotates a matrix by the given angle around the Z axis
   *
   * @param {mat4} mat mat4 to rotate
   * @param {number} angle Angle (in radians) to rotate
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
   *
   * @returns {mat4} dest if specified, mat otherwise
   */
  mat4.rotateZ = function (mat, angle, dest) {
      var s = Math.sin(angle),
          c = Math.cos(angle),
          a00 = mat[0],
          a01 = mat[1],
          a02 = mat[2],
          a03 = mat[3],
          a10 = mat[4],
          a11 = mat[5],
          a12 = mat[6],
          a13 = mat[7];
  
      if (!dest) {
          dest = mat;
      } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
          dest[8] = mat[8];
          dest[9] = mat[9];
          dest[10] = mat[10];
          dest[11] = mat[11];
  
          dest[12] = mat[12];
          dest[13] = mat[13];
          dest[14] = mat[14];
          dest[15] = mat[15];
      }
  
      // Perform axis-specific matrix multiplication
      dest[0] = a00 * c + a10 * s;
      dest[1] = a01 * c + a11 * s;
      dest[2] = a02 * c + a12 * s;
      dest[3] = a03 * c + a13 * s;
  
      dest[4] = a00 * -s + a10 * c;
      dest[5] = a01 * -s + a11 * c;
      dest[6] = a02 * -s + a12 * c;
      dest[7] = a03 * -s + a13 * c;
  
      return dest;
  };
  
  /**
   * Generates a frustum matrix with the given bounds
   *
   * @param {number} left Left bound of the frustum
   * @param {number} right Right bound of the frustum
   * @param {number} bottom Bottom bound of the frustum
   * @param {number} top Top bound of the frustum
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum
   * @param {mat4} [dest] mat4 frustum matrix will be written into
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  mat4.frustum = function (left, right, bottom, top, near, far, dest) {
      if (!dest) { dest = mat4.create(); }
      var rl = (right - left),
          tb = (top - bottom),
          fn = (far - near);
      dest[0] = (near * 2) / rl;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 0;
      dest[5] = (near * 2) / tb;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = (right + left) / rl;
      dest[9] = (top + bottom) / tb;
      dest[10] = -(far + near) / fn;
      dest[11] = -1;
      dest[12] = 0;
      dest[13] = 0;
      dest[14] = -(far * near * 2) / fn;
      dest[15] = 0;
      return dest;
  };
  
  /**
   * Generates a perspective projection matrix with the given bounds
   *
   * @param {number} fovy Vertical field of view
   * @param {number} aspect Aspect ratio. typically viewport width/height
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum
   * @param {mat4} [dest] mat4 frustum matrix will be written into
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  mat4.perspective = function (fovy, aspect, near, far, dest) {
      var top = near * Math.tan(fovy * Math.PI / 360.0),
          right = top * aspect;
      return mat4.frustum(-right, right, -top, top, near, far, dest);
  };
  
  /**
   * Generates a orthogonal projection matrix with the given bounds
   *
   * @param {number} left Left bound of the frustum
   * @param {number} right Right bound of the frustum
   * @param {number} bottom Bottom bound of the frustum
   * @param {number} top Top bound of the frustum
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum
   * @param {mat4} [dest] mat4 frustum matrix will be written into
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  mat4.ortho = function (left, right, bottom, top, near, far, dest) {
      if (!dest) { dest = mat4.create(); }
      var rl = (right - left),
          tb = (top - bottom),
          fn = (far - near);
      dest[0] = 2 / rl;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 0;
      dest[5] = 2 / tb;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = 0;
      dest[9] = 0;
      dest[10] = -2 / fn;
      dest[11] = 0;
      dest[12] = -(left + right) / rl;
      dest[13] = -(top + bottom) / tb;
      dest[14] = -(far + near) / fn;
      dest[15] = 1;
      return dest;
  };
  
  /**
   * Generates a look-at matrix with the given eye position, focal point, and up axis
   *
   * @param {vec3} eye Position of the viewer
   * @param {vec3} center Point the viewer is looking at
   * @param {vec3} up vec3 pointing "up"
   * @param {mat4} [dest] mat4 frustum matrix will be written into
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  mat4.lookAt = function (eye, center, up, dest) {
      if (!dest) { dest = mat4.create(); }
  
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
          eyex = eye[0],
          eyey = eye[1],
          eyez = eye[2],
          upx = up[0],
          upy = up[1],
          upz = up[2],
          centerx = center[0],
          centery = center[1],
          centerz = center[2];
  
      if (eyex === centerx && eyey === centery && eyez === centerz) {
          return mat4.identity(dest);
      }
  
      //vec3.direction(eye, center, z);
      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
  
      // normalize (no check needed for 0 because of early return)
      len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
  
      //vec3.normalize(vec3.cross(up, z, x));
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      if (!len) {
          x0 = 0;
          x1 = 0;
          x2 = 0;
      } else {
          len = 1 / len;
          x0 *= len;
          x1 *= len;
          x2 *= len;
      }
  
      //vec3.normalize(vec3.cross(z, x, y));
      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
  
      len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if (!len) {
          y0 = 0;
          y1 = 0;
          y2 = 0;
      } else {
          len = 1 / len;
          y0 *= len;
          y1 *= len;
          y2 *= len;
      }
  
      dest[0] = x0;
      dest[1] = y0;
      dest[2] = z0;
      dest[3] = 0;
      dest[4] = x1;
      dest[5] = y1;
      dest[6] = z1;
      dest[7] = 0;
      dest[8] = x2;
      dest[9] = y2;
      dest[10] = z2;
      dest[11] = 0;
      dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      dest[15] = 1;
  
      return dest;
  };
  
  /**
   * Creates a matrix from a quaternion rotation and vector translation
   * This is equivalent to (but much faster than):
   *
   *     mat4.identity(dest);
   *     mat4.translate(dest, vec);
   *     var quatMat = mat4.create();
   *     quat4.toMat4(quat, quatMat);
   *     mat4.multiply(dest, quatMat);
   *
   * @param {quat4} quat Rotation quaternion
   * @param {vec3} vec Translation vector
   * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to a new mat4
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  mat4.fromRotationTranslation = function (quat, vec, dest) {
      if (!dest) { dest = mat4.create(); }
  
      // Quaternion math
      var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
          x2 = x + x,
          y2 = y + y,
          z2 = z + z,
  
          xx = x * x2,
          xy = x * y2,
          xz = x * z2,
          yy = y * y2,
          yz = y * z2,
          zz = z * z2,
          wx = w * x2,
          wy = w * y2,
          wz = w * z2;
  
      dest[0] = 1 - (yy + zz);
      dest[1] = xy + wz;
      dest[2] = xz - wy;
      dest[3] = 0;
      dest[4] = xy - wz;
      dest[5] = 1 - (xx + zz);
      dest[6] = yz + wx;
      dest[7] = 0;
      dest[8] = xz + wy;
      dest[9] = yz - wx;
      dest[10] = 1 - (xx + yy);
      dest[11] = 0;
      dest[12] = vec[0];
      dest[13] = vec[1];
      dest[14] = vec[2];
      dest[15] = 1;
      
      return dest;
  };
  
  /**
   * Returns a string representation of a mat4
   *
   * @param {mat4} mat mat4 to represent as a string
   *
   * @returns {string} String representation of mat
   */
  mat4.str = function (mat) {
      return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
          ', ' + mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
          ', ' + mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
          ', ' + mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
  };
  
  /*
   * quat4
   */
  
  /**
   * Creates a new instance of a quat4 using the default array type
   * Any javascript array containing at least 4 numeric elements can serve as a quat4
   *
   * @param {quat4} [quat] quat4 containing values to initialize with
   *
   * @returns {quat4} New quat4
   */
  quat4.create = function (quat) {
      var dest = new MatrixArray(4);
  
      if (quat) {
          dest[0] = quat[0];
          dest[1] = quat[1];
          dest[2] = quat[2];
          dest[3] = quat[3];
      }
  
      return dest;
  };
  
  /**
   * Copies the values of one quat4 to another
   *
   * @param {quat4} quat quat4 containing values to copy
   * @param {quat4} dest quat4 receiving copied values
   *
   * @returns {quat4} dest
   */
  quat4.set = function (quat, dest) {
      dest[0] = quat[0];
      dest[1] = quat[1];
      dest[2] = quat[2];
      dest[3] = quat[3];
  
      return dest;
  };
  
  /**
   * Calculates the W component of a quat4 from the X, Y, and Z components.
   * Assumes that quaternion is 1 unit in length. 
   * Any existing W component will be ignored. 
   *
   * @param {quat4} quat quat4 to calculate W component of
   * @param {quat4} [dest] quat4 receiving calculated values. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.calculateW = function (quat, dest) {
      var x = quat[0], y = quat[1], z = quat[2];
  
      if (!dest || quat === dest) {
          quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
          return quat;
      }
      dest[0] = x;
      dest[1] = y;
      dest[2] = z;
      dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
      return dest;
  };
  
  /**
   * Calculates the dot product of two quaternions
   *
   * @param {quat4} quat First operand
   * @param {quat4} quat2 Second operand
   *
   * @return {number} Dot product of quat and quat2
   */
  quat4.dot = function(quat, quat2){
      return quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
  };
  
  /**
   * Calculates the inverse of a quat4
   *
   * @param {quat4} quat quat4 to calculate inverse of
   * @param {quat4} [dest] quat4 receiving inverse values. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.inverse = function(quat, dest) {
      var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3],
          dot = q0*q0 + q1*q1 + q2*q2 + q3*q3,
          invDot = dot ? 1.0/dot : 0;
      
      // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
      
      if(!dest || quat === dest) {
          quat[0] *= -invDot;
          quat[1] *= -invDot;
          quat[2] *= -invDot;
          quat[3] *= invDot;
          return quat;
      }
      dest[0] = -quat[0]*invDot;
      dest[1] = -quat[1]*invDot;
      dest[2] = -quat[2]*invDot;
      dest[3] = quat[3]*invDot;
      return dest;
  };
  
  
  /**
   * Calculates the conjugate of a quat4
   * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
   *
   * @param {quat4} quat quat4 to calculate conjugate of
   * @param {quat4} [dest] quat4 receiving conjugate values. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.conjugate = function (quat, dest) {
      if (!dest || quat === dest) {
          quat[0] *= -1;
          quat[1] *= -1;
          quat[2] *= -1;
          return quat;
      }
      dest[0] = -quat[0];
      dest[1] = -quat[1];
      dest[2] = -quat[2];
      dest[3] = quat[3];
      return dest;
  };
  
  /**
   * Calculates the length of a quat4
   *
   * Params:
   * @param {quat4} quat quat4 to calculate length of
   *
   * @returns Length of quat
   */
  quat4.length = function (quat) {
      var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
      return Math.sqrt(x * x + y * y + z * z + w * w);
  };
  
  /**
   * Generates a unit quaternion of the same direction as the provided quat4
   * If quaternion length is 0, returns [0, 0, 0, 0]
   *
   * @param {quat4} quat quat4 to normalize
   * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.normalize = function (quat, dest) {
      if (!dest) { dest = quat; }
  
      var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
          len = Math.sqrt(x * x + y * y + z * z + w * w);
      if (len === 0) {
          dest[0] = 0;
          dest[1] = 0;
          dest[2] = 0;
          dest[3] = 0;
          return dest;
      }
      len = 1 / len;
      dest[0] = x * len;
      dest[1] = y * len;
      dest[2] = z * len;
      dest[3] = w * len;
  
      return dest;
  };
  
  /**
   * Performs quaternion addition
   *
   * @param {quat4} quat First operand
   * @param {quat4} quat2 Second operand
   * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.add = function (quat, quat2, dest) {
      if(!dest || quat === dest) {
          quat[0] += quat2[0];
          quat[1] += quat2[1];
          quat[2] += quat2[2];
          quat[3] += quat2[3];
          return quat;
      }
      dest[0] = quat[0]+quat2[0];
      dest[1] = quat[1]+quat2[1];
      dest[2] = quat[2]+quat2[2];
      dest[3] = quat[3]+quat2[3];
      return dest;
  };
  
  /**
   * Performs a quaternion multiplication
   *
   * @param {quat4} quat First operand
   * @param {quat4} quat2 Second operand
   * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.multiply = function (quat, quat2, dest) {
      if (!dest) { dest = quat; }
  
      var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
          qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];
  
      dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
  
      return dest;
  };
  
  /**
   * Transforms a vec3 with the given quaternion
   *
   * @param {quat4} quat quat4 to transform the vector with
   * @param {vec3} vec vec3 to transform
   * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
   *
   * @returns dest if specified, vec otherwise
   */
  quat4.multiplyVec3 = function (quat, vec, dest) {
      if (!dest) { dest = vec; }
  
      var x = vec[0], y = vec[1], z = vec[2],
          qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3],
  
          // calculate quat * vec
          ix = qw * x + qy * z - qz * y,
          iy = qw * y + qz * x - qx * z,
          iz = qw * z + qx * y - qy * x,
          iw = -qx * x - qy * y - qz * z;
  
      // calculate result * inverse quat
      dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
      dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
      dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  
      return dest;
  };
  
  /**
   * Multiplies the components of a quaternion by a scalar value
   *
   * @param {quat4} quat to scale
   * @param {number} val Value to scale by
   * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.scale = function (quat, val, dest) {
      if(!dest || quat === dest) {
          quat[0] *= val;
          quat[1] *= val;
          quat[2] *= val;
          quat[3] *= val;
          return quat;
      }
      dest[0] = quat[0]*val;
      dest[1] = quat[1]*val;
      dest[2] = quat[2]*val;
      dest[3] = quat[3]*val;
      return dest;
  };
  
  /**
   * Calculates a 3x3 matrix from the given quat4
   *
   * @param {quat4} quat quat4 to create matrix from
   * @param {mat3} [dest] mat3 receiving operation result
   *
   * @returns {mat3} dest if specified, a new mat3 otherwise
   */
  quat4.toMat3 = function (quat, dest) {
      if (!dest) { dest = mat3.create(); }
  
      var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
          x2 = x + x,
          y2 = y + y,
          z2 = z + z,
  
          xx = x * x2,
          xy = x * y2,
          xz = x * z2,
          yy = y * y2,
          yz = y * z2,
          zz = z * z2,
          wx = w * x2,
          wy = w * y2,
          wz = w * z2;
  
      dest[0] = 1 - (yy + zz);
      dest[1] = xy + wz;
      dest[2] = xz - wy;
  
      dest[3] = xy - wz;
      dest[4] = 1 - (xx + zz);
      dest[5] = yz + wx;
  
      dest[6] = xz + wy;
      dest[7] = yz - wx;
      dest[8] = 1 - (xx + yy);
  
      return dest;
  };
  
  /**
   * Calculates a 4x4 matrix from the given quat4
   *
   * @param {quat4} quat quat4 to create matrix from
   * @param {mat4} [dest] mat4 receiving operation result
   *
   * @returns {mat4} dest if specified, a new mat4 otherwise
   */
  quat4.toMat4 = function (quat, dest) {
      if (!dest) { dest = mat4.create(); }
  
      var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
          x2 = x + x,
          y2 = y + y,
          z2 = z + z,
  
          xx = x * x2,
          xy = x * y2,
          xz = x * z2,
          yy = y * y2,
          yz = y * z2,
          zz = z * z2,
          wx = w * x2,
          wy = w * y2,
          wz = w * z2;
  
      dest[0] = 1 - (yy + zz);
      dest[1] = xy + wz;
      dest[2] = xz - wy;
      dest[3] = 0;
  
      dest[4] = xy - wz;
      dest[5] = 1 - (xx + zz);
      dest[6] = yz + wx;
      dest[7] = 0;
  
      dest[8] = xz + wy;
      dest[9] = yz - wx;
      dest[10] = 1 - (xx + yy);
      dest[11] = 0;
  
      dest[12] = 0;
      dest[13] = 0;
      dest[14] = 0;
      dest[15] = 1;
  
      return dest;
  };
  
  /**
   * Performs a spherical linear interpolation between two quat4
   *
   * @param {quat4} quat First quaternion
   * @param {quat4} quat2 Second quaternion
   * @param {number} slerp Interpolation amount between the two inputs
   * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
   *
   * @returns {quat4} dest if specified, quat otherwise
   */
  quat4.slerp = function (quat, quat2, slerp, dest) {
      if (!dest) { dest = quat; }
  
      var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
          halfTheta,
          sinHalfTheta,
          ratioA,
          ratioB;
  
      if (Math.abs(cosHalfTheta) >= 1.0) {
          if (dest !== quat) {
              dest[0] = quat[0];
              dest[1] = quat[1];
              dest[2] = quat[2];
              dest[3] = quat[3];
          }
          return dest;
      }
  
      halfTheta = Math.acos(cosHalfTheta);
      sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
  
      if (Math.abs(sinHalfTheta) < 0.001) {
          dest[0] = (quat[0] * 0.5 + quat2[0] * 0.5);
          dest[1] = (quat[1] * 0.5 + quat2[1] * 0.5);
          dest[2] = (quat[2] * 0.5 + quat2[2] * 0.5);
          dest[3] = (quat[3] * 0.5 + quat2[3] * 0.5);
          return dest;
      }
  
      ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
      ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;
  
      dest[0] = (quat[0] * ratioA + quat2[0] * ratioB);
      dest[1] = (quat[1] * ratioA + quat2[1] * ratioB);
      dest[2] = (quat[2] * ratioA + quat2[2] * ratioB);
      dest[3] = (quat[3] * ratioA + quat2[3] * ratioB);
  
      return dest;
  };
  
  /**
   * Returns a string representation of a quaternion
   *
   * @param {quat4} quat quat4 to represent as a string
   *
   * @returns {string} String representation of quat
   */
  quat4.str = function (quat) {
      return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
  };
  
  
  return {
    vec3: vec3,
    mat3: mat3,
    mat4: mat4,
    quat4: quat4
  };
  
  })();
  
  ;
  var GLImmediateSetup={};function _glBegin(mode) {
      // Push the old state:
      GLImmediate.enabledClientAttributes_preBegin = GLImmediate.enabledClientAttributes;
      GLImmediate.enabledClientAttributes = [];
  
      GLImmediate.clientAttributes_preBegin = GLImmediate.clientAttributes;
      GLImmediate.clientAttributes = []
      for (var i = 0; i < GLImmediate.clientAttributes_preBegin.length; i++) {
        GLImmediate.clientAttributes.push({});
      }
  
      GLImmediate.mode = mode;
      GLImmediate.vertexCounter = 0;
      var components = GLImmediate.rendererComponents = [];
      for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
        components[i] = 0;
      }
      GLImmediate.rendererComponentPointer = 0;
      GLImmediate.vertexData = GLImmediate.tempData;
    }

  var _sqrt=Math_sqrt;

  
  
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  function _glBindTexture(target, texture) {
      GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }

  function _glVertexPointer(size, type, stride, pointer) {
      GLImmediate.setClientAttribute(GLImmediate.VERTEX, size, type, stride, pointer);
      if (GL.currArrayBuffer) {
        GLctx.vertexAttribPointer(GLImmediate.VERTEX, size, type, false, stride, pointer);
      }
    }

  
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var fd = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return fd === -1 ? 0 : FS.getPtrForStream(FS.getStream(fd));
    }

  
  var CL={cl_init:0,cl_extensions:["KHR_GL_SHARING","KHR_fp16","KHR_fp64"],cl_digits:[1,2,3,4,5,6,7,8,9,0],cl_kernels_sig:{},cl_structs_sig:{},cl_pn_type:[],cl_objects:{},cl_objects_map:{},cl_objects_retains:{},cl_objects_mem_callback:{},init:function () {
        if (CL.cl_init == 0) {
          console.log('%c WebCL-Translator V2.0 ! ', 'background: #222; color: #bada55');
          var nodejs = (typeof window === 'undefined');
          if(nodejs) {
            webcl = require('../webcl');
          }
  
          if (webcl == undefined) {
            alert("Unfortunately your system does not support WebCL. " +
            "Make sure that you have WebKit Samsung or Firefox Nokia plugin");
  
            console.error("Unfortunately your system does not support WebCL.\n");
            console.error("Make sure that you have WebKit Samsung or Firefox Nokia plugin\n");  
          } else {
  
            // Add webcl constant for parser
            // Object.defineProperty(webcl, "SAMPLER"      , { value : 0x1300,writable : false });
            // Object.defineProperty(webcl, "IMAGE2D"      , { value : 0x1301,writable : false });
            // Object.defineProperty(webcl, "IMAGE3D"      , { value : 0x1302,writable : false });          
            // Object.defineProperty(webcl, "UNSIGNED_LONG", { value : 0x1304,writable : false });
            // Object.defineProperty(webcl, "LONG"         , { value : 0x1303,writable : false });
            // Object.defineProperty(webcl, "MAP_READ"     , { value : 0x1   ,writable : false });
            // Object.defineProperty(webcl, "MAP_WRITE"    , { value : 0x2   ,writable : false });
  
            for (var i = 0; i < CL.cl_extensions.length; i ++) {
  
              if (webcl.enableExtension(CL.cl_extensions[i])) {
                console.info("WebCL Init : extension "+CL.cl_extensions[i]+" supported.");
              } else {
                console.info("WebCL Init : extension "+CL.cl_extensions[i]+" not supported !!!");
              }
            }
            CL.cl_init = 1;
          }
        }
  
        return CL.cl_init;
      },udid:function (obj) {    
        var _id;
  
        if (obj !== undefined) {
  
          if ( obj.hasOwnProperty('udid') ) {
           _id = obj.udid;
  
           if (_id !== undefined) {
             return _id;
           }
          }
        }
  
        var _uuid = [];
  
        _uuid[0] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length-1]; // First digit of udid can't be 0
        for (var i = 1; i < 6; i++) _uuid[i] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length];
  
        _id = _uuid.join('');
  
      
        // /!\ Call udid when you add inside cl_objects if you pass object in parameter
        if (obj !== undefined) {
          Object.defineProperty(obj, "udid", { value : _id,writable : false });
          CL.cl_objects[_id]=obj;
        }
  
        return _id;      
      },cast_long:function (arg_size) {
        var _sizelong = [];
        _sizelong.push(((arg_size & 0xFFFFFFFF00000000) >> 32));
        _sizelong.push((arg_size & 0xFFFFFFFF));
        // var _origin = x << 32 | y;
        return new Int32Array(_sizelong);
      },stringType:function (pn_type) {
        switch(pn_type) {
          case webcl.SIGNED_INT8:
            return 'INT8';
          case webcl.SIGNED_INT16:
            return 'INT16';
          case webcl.SIGNED_INT32:
            return 'INT32';
          case webcl.UNSIGNED_INT8:
            return 'UINT8';
          case webcl.UNSIGNED_INT16:
            return 'UINT16';
          case webcl.UNSIGNED_INT32:
            return 'UINT32';
          case 0x1304 /*webcl.UNSIGNED_LONG*/:
            return 'ULONG';
          case 0x1303 /*webcl.SIGNED_LONG*/:
            return 'LONG';       
          case webcl.FLOAT:
            return 'FLOAT';
          case webcl.LOCAL:
            return '__local';   
          case 0x1300 /*webcl.SAMPLER*/:
            return 'sampler_t';   
          case 0x1301 /*webcl.IMAGE2D*/:
            return 'image2d_t';        
          case 0x1302 /*webcl.IMAGE3D*/:
            return 'image3d_t';            
          default:
            if (typeof(pn_type) == "string") return 'struct';
            return 'UNKNOWN';
        }
      },parseType:function (string) {
        var _value = -1;
      
        // First ulong for the webcl validator
        if ( (string.indexOf("ulong") >= 0 ) || (string.indexOf("unsigned long") >= 0 ) ) {
          // \todo : long ???? 
          _value = 0x1304 /*webcl.UNSIGNED_LONG*/;  
        } else if ( string.indexOf("long") >= 0 ) {
          _value = 0x1303 /*webcl.SIGNED_LONG*/;
        } else if (string.indexOf("float") >= 0 ) {
          _value = webcl.FLOAT;
        } else if ( (string.indexOf("uchar") >= 0 ) || (string.indexOf("unsigned char") >= 0 ) ) {
          _value = webcl.UNSIGNED_INT8;
        } else if ( string.indexOf("char") >= 0 ) {
          _value = webcl.SIGNED_INT8;
        } else if ( (string.indexOf("ushort") >= 0 ) || (string.indexOf("unsigned short") >= 0 ) ) {
          _value = webcl.UNSIGNED_INT16;
        } else if ( string.indexOf("short") >= 0 ) {
          _value = webcl.SIGNED_INT16;                     
        } else if ( (string.indexOf("uint") >= 0 ) || (string.indexOf("unsigned int") >= 0 ) ) {
          _value = webcl.UNSIGNED_INT32;          
        } else if ( ( string.indexOf("int") >= 0 ) || ( string.indexOf("enum") >= 0 ) ) {
          _value = webcl.SIGNED_INT32;
        } else if ( string.indexOf("image3d_t") >= 0 ) {
          _value = 0x1302 /*webcl.IMAGE3D*/;        
        } else if ( string.indexOf("image2d_t") >= 0 ) {
          _value = 0x1301 /*webcl.IMAGE2D*/;
        } else if ( string.indexOf("sampler_t") >= 0 ) {
          _value = 0x1300 /*webcl.SAMPLER*/;
        }
  
        return _value;
      },parseStruct:function (kernel_string,struct_name) {
  
        // Experimental parse of Struct
        // Search kernel function like 'struct_name { }' or '{ } struct_name'
        // --------------------------------------------------------------------------------
        // Step 1 : Search pattern struct_name { }
        // Step 2 : if no result : Search pattern { } struct_name
        // Step 3 : if no result : return
        // Step 4 : split by ; // Num of variable of the structure  : int toto; float tata;
        // Step 5 : split by , // Num of variable for each type     : float toto,tata,titi;
        // Step 6 : Search pattern [num] // Array Variable          : float toto[4];
        // Step 7 : Search type of the line
        // Step 8 : if exist add type else search other struct
        // --------------------------------------------------------------------------------
  
        CL.cl_structs_sig[struct_name] = [];
  
        // First search if is #define
        var _re_define = new RegExp("#[\ ]*define[\ ]*"+struct_name+"[\ ]*[A-Za-z0-9_\s]*");
        var _define = kernel_string.match(_re_define);
  
        if (_define != null && _define.length == 1) {
  
          // Get type of the line
          var _str = _define[0];
          var _type = CL.parseType(_str);
          
          if (_type != -1) {
            CL.cl_structs_sig[struct_name].push(_type);
          } else {
            var _lastSpace = _str.lastIndexOf(" ");
            var _res = _str.substr(_lastSpace + 1,_str.length - _lastSpace);
  
            CL.parseStruct(kernel_string,_res);
          }
      
          return;
        }
  
        // Second search if is typedef type name;
        var _re_typedef = new RegExp("typedef[\ ]*[A-Za-z0-9_\s]*[\ ]*"+struct_name+"[\ ]*;");
        var _typedef = kernel_string.match(_re_typedef);
  
        if (_typedef != null && _typedef.length == 1) {
  
          // Get type of the line
          var _str = _typedef[0];
          var _type = CL.parseType(_str);
  
          if (_type != -1) {
            CL.cl_structs_sig[struct_name].push(_type);
          } else {
            _str = _str.replace(/^\s+|\s+$/g, ""); // trim
            var _firstSpace = _str.indexOf(" ");
            var _lastSpace = _str.lastIndexOf(" ");
            var _res = _str.substr(_firstSpace + 1,_lastSpace - _firstSpace - 1);
            
            CL.parseStruct(kernel_string,_res);
          }
          
          return;
        }
  
        // search pattern : struct_name { } ;
        var _re_before = new RegExp(struct_name+"[\ ]"+"\{([^}]+)\}");
  
        // search pattern : { } struct_name;
        var _re_after = new RegExp("\{([^}]+)\}"+"[\ ]"+struct_name);
  
        var _res = kernel_string.match(_re_before);
        var _contains_struct = "";
        
        if (_res != null && _res.length == 2) {
          _contains_struct = _res[1];
        } else {
          _res = kernel_string.match(_re_after);
          if (_res != null && _res.length == 2) {
              _contains_struct = _res[1];
          } else {
            return;
          }
        }
  
        var _var = _contains_struct.split(";");
        for (var i = 0; i < _var.length-1; i++ ) {
          // Need for unsigned int width, height;
          var _subvar = _var[i].split(","); 
          
          // Get type of the line
          var _type = CL.parseType(_var[i]);
        
          // Need for float mu[4];
          var _arrayNum = 0;
          _res = _var[i].match(/[0-9]+/); 
          if (_res != null) _arrayNum = _res;
        
          if ( _type != -1) {
            for (var j = 0; j < Math.max(_subvar.length,_arrayNum) ; j++ ) {
              CL.cl_structs_sig[struct_name].push(_type);
            }
          } else {
            // Search name of the parameter
            var _struct = _subvar[0].replace(/^\s+|\s+$/g, ""); // trim
            var _name = "";
            var _start = _struct.lastIndexOf(" "); 
            for (var j = _start - 1; j >= 0 ; j--) {
              var _chara = _struct.charAt(j);
              if (_chara == ' ' && _name.length > 0) {
                break;
              } else if (_chara != ' ') {
                _name = _chara + _name;
              }
            }
            
            // If struct is unknow search it
            if (!(_name in CL.cl_structs_sig && CL.cl_structs_sig[_name].length > 0)) {
              CL.parseStruct(kernel_string,_name);
            }
  
            for (var j = 0; j < Math.max(_subvar.length,_arrayNum) ; j++ ) {
              CL.cl_structs_sig[struct_name] = CL.cl_structs_sig[struct_name].concat(CL.cl_structs_sig[_name]);  
            }
          }
        }
      },parseKernel:function (kernel_string) {
  
  
        // Experimental parse of Kernel
        // ----------------------------
        //
        // /!\ The minify kernel could be use by the program but some trouble with line
        // /!\ containing macro #define, for the moment only use the minify kernel for 
        // /!\ parsing __kernel and struct
        //
        // Search kernel function like __kernel ... NAME ( p1 , p2 , p3)  
        // --------------------------------------------------------------------------------
        // Step 1 : Minimize kernel removing all the comment and \r \n \t and multispace
        // Step 2 : Search pattern __kernel ... ( ... )
        // Step 3 : For each kernel
        // Step 3 . 1 : Search Open Brace
        // Step 3 . 2 : Search Kernel Name
        // Step 3 . 3 : Search Kernel Parameter
        // Step 3 . 4 : Grab { name : [ param, ... ] }
        // --------------------------------------------------------------------------------
  
        // Remove all comments ...
        var _mini_kernel_string  = kernel_string.replace(/(?:((["'])(?:(?:\\\\)|\\\2|(?!\\\2)\\|(?!\2).|[\n\r])*\2)|(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/[^\n\r]*(?:[\n\r]+|$))|((?:=|:)\s*(?:\/(?:(?:(?!\\*\/).)|\\\\|\\\/|[^\\]\[(?:\\\\|\\\]|[^]])+\])+\/))|((?:\/(?:(?:(?!\\*\/).)|\\\\|\\\/|[^\\]\[(?:\\\\|\\\]|[^]])+\])+\/)[gimy]?\.(?:exec|test|match|search|replace|split)\()|(\.(?:exec|test|match|search|replace|split)\((?:\/(?:(?:(?!\\*\/).)|\\\\|\\\/|[^\\]\[(?:\\\\|\\\]|[^]])+\])+\/))|(<!--(?:(?!-->).)*-->))/g
  , "");
        
        // Remove all char \n \r \t ...
        _mini_kernel_string = _mini_kernel_string.replace(/\n/g, " ");
        _mini_kernel_string = _mini_kernel_string.replace(/\r/g, " ");
  
        // Remove all the multispace
        _mini_kernel_string = _mini_kernel_string.replace(/\s{2,}/g, " ");
  
        // Search pattern : __kernel ... ( ... )
        // var _matches = _mini_kernel_string.match(/__kernel[A-Za-z0-9_\s]+\(([^)]+)\)/g);
        // if (_matches == null) {
        //   console.error("/!\\ Not found kernel !!!");
        //   return;
        // }
  
        // Search kernel (Pattern doesn't work with extra __attribute__)
        var _matches = [];
        var _found = 1;
        var _stringKern = _mini_kernel_string;
        var _security = 50;
  
        // Search all the kernel
        while (_found && _security) {
          // Just in case no more than 50 loop
          _security --;
  
          var _pattern = "__kernel ";
          var _kern = _stringKern.indexOf(_pattern);
  
          if (_kern == -1) {
            _pattern = " kernel ";
            _kern = _stringKern.indexOf(" kernel ");
            if (_kern == -1) { 
              _pattern = "kernel ";
              _kern = _stringKern.indexOf("kernel ");
              if (_kern == -1) {
                _found = 0;
                continue;
              } else if (_kern != 0) {
                console.error("/!\\ Find word 'kernel' but is not a real kernel  .. ("+_kern+")");
                _stringKern = _stringKern.substr(_kern + _pattern.length,_stringKern.length - _kern);
                continue;
              }
            }
          }
  
          _stringKern = _stringKern.substr(_kern + _pattern.length,_stringKern.length - _kern);
   
          var _brace = _stringKern.indexOf("{");
          var _stringKern2 = _stringKern.substr(0,_brace);
          var _braceOpen = _stringKern2.lastIndexOf("(");
          var _braceClose = _stringKern2.lastIndexOf(")");
          var _stringKern3 = _stringKern2.substr(0,_braceOpen).replace(/^\s+|\s+$/g, ""); // trim
          var _space = _stringKern3.lastIndexOf(" ");
  
          _stringKern2 = _stringKern2.substr(_space + 1,_braceClose);
  
          // Add the kernel result like name_kernel(..., ... ,...)
          _matches.push(_stringKern2);
        }
  
        // For each kernel ....
        for (var i = 0; i < _matches.length; i ++) {
          // Search the open Brace
          var _brace = _matches[i].lastIndexOf("(");
  
          // Part before '('
          var _first_part = _matches[i].substr(0,_brace);
          _first_part = _first_part.replace(/^\s+|\s+$/g, ""); // trim
  
          // Part after ')'
          var _second_part = _matches[i].substr(_brace+1,_matches[i].length-_brace-2);
          _second_part = _second_part.replace(/^\s+|\s+$/g, ""); // trim
  
          // Search name part
          var _name = _first_part.substr(_first_part.lastIndexOf(" ") + 1);
  
          // If name already present reparse it may be is another test with not the same num of parameter ....
          if (_name in CL.cl_kernels_sig) {
            delete CL.cl_kernels_sig[_name]
          }
  
          // Search parameter part
          var _param = [];
  
          var _array = _second_part.split(","); 
          for (var j = 0; j < _array.length; j++) {
            var _type = CL.parseType(_array[j]);
  
            if (_array[j].indexOf("__local") >= 0 ) {
              _param.push(webcl.LOCAL);
  
  
            } else if (_type == -1) {
                         
              _array[j] = _array[j].replace(/^\s+|\s+$/g, "");
              _array[j] = _array[j].replace("*", "");
  
              var _start = _array[j].lastIndexOf(" "); 
              if (_start != -1) {
                var _kernels_struct_name = "";
                // Search Parameter type Name
                for (var k = _start - 1; k >= 0 ; k--) {
  
                  var _chara = _array[j].charAt(k);
                  if (_chara == ' ' && _kernels_struct_name.length > 0) {
                    break;
                  } else if (_chara != ' ') {
                    _kernels_struct_name = _chara + _kernels_struct_name;
                  }
                }             
  
                // Parse struct only if is not already inside the map
                if (!(_kernels_struct_name in CL.cl_structs_sig))
                  CL.parseStruct(_mini_kernel_string, _kernels_struct_name);
              
                // Add the name of the struct inside the map of param kernel
                _param.push(_kernels_struct_name);         
  
              } else {
                _param.push(webcl.FLOAT);
              }
  
  
            } else {
              _param.push(_type);
  
            }
          }        
  
          CL.cl_kernels_sig[_name] = _param;
  
        }
  
        return _mini_kernel_string;
  
      },getImageSizeType:function (image) {
        var _sizeType = 0;
  
        
        var _info = CL.cl_objects[image].getInfo();
  
        switch (_info.channelType) {
          case webcl.SNORM_INT8:
          case webcl.SIGNED_INT8:
          case webcl.UNORM_INT8:        
          case webcl.UNSIGNED_INT8:
            _sizeType = 1;
            break;
          case webcl.SNORM_INT16:
          case webcl.SIGNED_INT16:
          case webcl.UNORM_INT16:        
          case webcl.UNSIGNED_INT16:
          case webcl.HALF_FLOAT:
            _sizeType = 2;      
            break;
          case webcl.SIGNED_INT32:
          case webcl.UNSIGNED_INT32:      
          case webcl.FLOAT:
            _sizeType = 4;
            break;
          default:
            console.error("getImageSizeType : This channel type is not yet implemented => "+_info.channelType);
        }
  
        return _sizeType;
      },getImageFormatType:function (image) {
        var _type = 0;
  
  
        var _info = CL.cl_objects[image].getInfo();
  
        switch (_info.channelType) {
          case webcl.SNORM_INT8:
          case webcl.SIGNED_INT8:
            _type = webcl.SIGNED_INT8;
            break;
          case webcl.UNORM_INT8:        
          case webcl.UNSIGNED_INT8:
            _type = webcl.UNSIGNED_INT8;
            break;
          case webcl.SNORM_INT16:
          case webcl.SIGNED_INT16:
            _type = webcl.SIGNED_INT16;
            break;
          case webcl.UNORM_INT16:        
          case webcl.UNSIGNED_INT16:
            _type = webcl.UNSIGNED_INT16;
            break;
          case webcl.SIGNED_INT32:
            _type = webcl.SIGNED_INT32;
          case webcl.UNSIGNED_INT32:
            _type = webcl.UNSIGNED_INT32;
            break;        
          case webcl.FLOAT:
            _type = webcl.FLOAT;
            break;
          default:
            console.error("getImageFormatType : This channel type is not yet implemented => "+_info.channelType);
        }
  
        return _type;
      },getImageSizeOrder:function (image) {
        var _sizeOrder = 0;
  
  
        var _info = CL.cl_objects[image].getInfo();
  
        switch (_info.channelOrder) {
          case webcl.R:
          case webcl.A:
          case webcl.INTENSITY:
          case webcl.LUMINANCE:
            _sizeOrder = 1;
            break;
          case webcl.RG:
          case webcl.RA:
            _sizeOrder = 2;
            break;
          case webcl.RGB:
            _sizeOrder = 3;
            break; 
          case webcl.RGBA:
          case webcl.BGRA:
          case webcl.ARGB:      
            _sizeOrder = 4;
            break;        
          default:
            console.error("getImageFormatType : This channel order is not yet implemented => "+_info.channelOrder);
        }
  
        return _sizeOrder;
      },getHostPtrArray:function (size,type) { 
  
        var _host_ptr = null;
  
        if (type.length == 0) {
        }
  
        if (type.length == 1) {
          switch(type[0][0]) {
            case webcl.SIGNED_INT8:
              _host_ptr = new Int8Array( size );
              break;
            case webcl.SIGNED_INT16:
              _host_ptr = new Int16Array( size >> 1 );
              break;
            case webcl.SIGNED_INT32:
              _host_ptr = new Int32Array( size >> 2 );
              break;
            case webcl.UNSIGNED_INT8:
              _host_ptr = new Uint8Array( size );
              break;
            case webcl.UNSIGNED_INT16:
              _host_ptr = new Uint16Array( size >> 1 );
              break;
            case webcl.UNSIGNED_INT32:
              _host_ptr = new Uint32Array( size >> 2 );
              break;         
            default:
              _host_ptr = new Float32Array( size >> 2 );
              break;
          }
        } else {
          _host_ptr = new Float32Array( size >> 2 );
        }
  
        return _host_ptr;
      },getCopyPointerToArray:function (ptr,size,type) { 
  
        var _host_ptr = null;
  
        if (type.length == 0) {
        }
  
        if (type.length == 1) {
          switch(type[0][0]) {
            case webcl.SIGNED_INT8:
              _host_ptr = new Int8Array( HEAP8.subarray((ptr),(ptr+size)) );
              break;
            case webcl.SIGNED_INT16:
              _host_ptr = new Int16Array( HEAP16.subarray((ptr)>>1,(ptr+size)>>1) );
              break;
            case webcl.SIGNED_INT32:
              _host_ptr = new Int32Array( HEAP32.subarray((ptr)>>2,(ptr+size)>>2) );
              break;
            case webcl.UNSIGNED_INT8:
              _host_ptr = new Uint8Array( HEAPU8.subarray((ptr),(ptr+size)) );
              break;
            case webcl.UNSIGNED_INT16:
              _host_ptr = new Uint16Array( HEAPU16.subarray((ptr)>>1,(ptr+size)>>1) );
              break;
            case webcl.UNSIGNED_INT32:
              _host_ptr = new Uint32Array( HEAPU32.subarray((ptr)>>2,(ptr+size)>>2) );
              break;         
            default:
              _host_ptr = new Float32Array( HEAPF32.subarray((ptr)>>2,(ptr+size)>>2) );
              break;
          }
        } else {
          _host_ptr = new Float32Array( HEAPF32.subarray((ptr)>>2,(ptr+size)>>2) );
          
          // console.info("------");
          // _host_ptr = new DataView(new ArrayBuffer(size));
  
          // var _offset = 0;
          // for (var i = 0; i < type.length; i++) {
          //   var _type = type[i][0];
          //   var _num = type[i][1];
          //   switch(_type) {
          //     case webcl.SIGNED_INT8:
          //       _host_ptr.setInt8(_offset,new Int8Array( HEAP8.subarray((ptr+_offset),(ptr+_offset+_num)) ));
          //       console.info("setInt8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
          //       _offset += _num;
          //       break;
          //     case webcl.SIGNED_INT16:
          //       _host_ptr.setInt16(_offset,new Int16Array( HEAP16.subarray((ptr+_offset)>>1,(ptr+_offset+_num*2)>>1) ));
          //       console.info("setInt16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
          //       _offset += 2*_num;
          //       break;
          //     case webcl.SIGNED_INT32:
          //       _host_ptr.setInt32(_offset,new Int32Array( HEAP32.subarray((ptr+_offset)>>2,(ptr+_offset+_num*4)>>2) ));
          //       console.info("setInt32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
          //       _offset += 4*_num;
          //       break;
          //     case webcl.UNSIGNED_INT8:
          //       _host_ptr.setUint8(_offset,new Uint8Array( HEAPU8.subarray((ptr+_offset),(ptr+_offset+_num)) ));
          //       console.info("setUint8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
          //       _offset += _num;
          //       break;
          //     case webcl.UNSIGNED_INT16:
          //       host_ptr.setUint16(_offset,new Uint16Array( HEAPU16.subarray((ptr+_offset)>>1,(ptr+_offset+_num*2)>>1) ));
          //       console.info("setUint16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
          //       _offset += 2*_num;
          //       break;
          //     case webcl.UNSIGNED_INT32:
          //       _host_ptr.setUint32(_offset,new Uint32Array( HEAPU32.subarray((ptr+_offset)>>2,(ptr+_offset+_num*4)>>2) ));
          //       console.info("setUint32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
          //       _offset += 4*_num;
          //       break;         
          //     default:
          //       _host_ptr.setFloat32(_offset,new Float32Array( HEAPF32.subarray((ptr+_offset)>>2,(ptr+_offset+_num*4)>>2) ));
          //       console.info("setFloat32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
          //       _offset += 4*_num;
          //       break;
          //   }
          // }
        }
  
        return _host_ptr;
      },getReferencePointerToArray:function (ptr,size,type) {  
        var _host_ptr = null;
  
        if (type.length == 0) {
        }
  
        if (type.length == 1) {
          switch(type[0][0]) {
            case webcl.SIGNED_INT8:
              _host_ptr = HEAP8.subarray((ptr),(ptr+size));
              break;
            case webcl.SIGNED_INT16:
              _host_ptr = HEAP16.subarray((ptr)>>1,(ptr+size)>>1);
              break;
            case webcl.SIGNED_INT32:
              _host_ptr = HEAP32.subarray((ptr)>>2,(ptr+size)>>2);
              break;
            case webcl.UNSIGNED_INT8:
              _host_ptr = HEAPU8.subarray((ptr),(ptr+size));
              break;
            case webcl.UNSIGNED_INT16:
              _host_ptr = HEAPU16.subarray((ptr)>>1,(ptr+size)>>1);
              break;
            case webcl.UNSIGNED_INT32:
              _host_ptr = HEAPU32.subarray((ptr)>>2,(ptr+size)>>2);
              break;         
            default:
              _host_ptr = HEAPF32.subarray((ptr)>>2,(ptr+size)>>2);
              break;
          }
        } else {
          _host_ptr = HEAPF32.subarray((ptr)>>2,(ptr+size)>>2);
          
          // console.info("------");
          // _host_ptr = new DataView(new ArrayBuffer(size));
  
          // var _offset = 0;
          // for (var i = 0; i < type.length; i++) {
          //   var _type = type[i][0];
          //   var _num = type[i][1];
          //   switch(_type) {
          //     case webcl.SIGNED_INT8:
          //       _host_ptr.setInt8(_offset,HEAP8.subarray((ptr+_offset),(ptr+_offset+_num)) );
          //       console.info("setInt8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
          //       _offset += _num;
          //       break;
          //     case webcl.SIGNED_INT16:
          //       _host_ptr.setInt16(_offset,HEAP16.subarray((ptr+_offset)>>1,(ptr+_offset+_num*2)>>1) );
          //       console.info("setInt16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
          //       _offset += 2*_num;
          //       break;
          //     case webcl.SIGNED_INT32:
          //       _host_ptr.setInt32(_offset,HEAP32.subarray((ptr+_offset)>>2,(ptr+_offset+_num*4)>>2) );
          //       console.info("setInt32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
          //       _offset += 4*_num;
          //       break;
          //     case webcl.UNSIGNED_INT8:
          //       _host_ptr.setUint8(_offset,HEAPU8.subarray((ptr+_offset),(ptr+_offset+_num)) );
          //       console.info("setUint8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
          //       _offset += _num;
          //       break;
          //     case webcl.UNSIGNED_INT16:
          //       host_ptr.setUint16(_offset,HEAPU16.subarray((ptr+_offset)>>1,(ptr+_offset+_num*2)>>1) );
          //       console.info("setUint16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
          //       _offset += 2*_num;
          //       break;
          //     case webcl.UNSIGNED_INT32:
          //       _host_ptr.setUint32(_offset,HEAPU32.subarray((ptr+_offset)>>2,(ptr+_offset+_num*4)>>2) );
          //       console.info("setUint32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
          //       _offset += 4*_num;
          //       break;         
          //     default:
          //       _host_ptr.setFloat32(_offset,HEAPF32.subarray((ptr+_offset)>>2,(ptr+_offset+_num*4)>>2) );
          //       console.info("setFloat32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
          //       _offset += 4*_num;
          //       break;
          //   }
          // }
        }
  
        return _host_ptr;
      },catchError:function (e) {
        console.error(e);
        var _error = -1;
  
        if (e instanceof WebCLException) {
          var _str=e.message;
          var _n=_str.lastIndexOf(" ");
          _error = _str.substr(_n+1,_str.length-_n-1);
        }
        
        return _error;
      }};function _clGetPlatformIDs(num_entries,platforms,num_platforms) {
  
  
      // Init webcl variable if necessary
      if (CL.init() == 0) {
        return webcl.INVALID_VALUE;
      }
  
      if ( num_entries == 0 && platforms != 0) {
        return webcl.INVALID_VALUE;
      }
  
      if ( num_platforms == 0 && platforms == 0) {
        return webcl.INVALID_VALUE;
      }
  
      var _platforms = null;
  
      try { 
  
        _platforms = webcl.getPlatforms();
  
      } catch (e) {
        var _error = CL.catchError(e);
  
        return _error;
      }
  
      if (num_platforms != 0) {
        HEAP32[((num_platforms)>>2)]=_platforms.length /* Num of platforms */;
      } 
  
      if (platforms != 0) {
        for (var i = 0; i < Math.min(num_entries,_platforms.length); i++) {
          var _id = CL.udid(_platforms[i]);
          HEAP32[(((platforms)+(i*4))>>2)]=_id;
        }
      }
  
      return webcl.SUCCESS;
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _glClear(x0) { GLctx.clear(x0) }

  function _clGetDeviceInfo(device,param_name,param_value_size,param_value,param_value_size_ret) {
  
    
      var  _info = null;
  
      try { 
  
          var _object = CL.cl_objects[device];
     
        switch (param_name) {
          case 0x102B /*CL_DEVICE_NAME*/ :
            var _type = _object.getInfo(webcl.DEVICE_TYPE);
            switch (_type) {
              case webcl.DEVICE_TYPE_CPU:
                _info = "WEBCL_DEVICE_CPU";
              break;
              case webcl.DEVICE_TYPE_GPU:
                _info = "WEBCL_DEVICE_GPU";
              break;
              case webcl.DEVICE_TYPE_ACCELERATOR:
                _info = "WEBCL_DEVICE_ACCELERATOR";
              break;
              case webcl.DEVICE_TYPE_DEFAULT:
                _info = "WEBCL_DEVICE_DEFAULT";
              break;
            }
          break;
          case 0x102C /*CL_DEVICE_VENDOR*/ :
            _info = "WEBCL_DEVICE_VENDOR";
          break;
          case 0x100B /*CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE*/ :
            _info = 0;
          break;
          case 0x1030 /*CL_DEVICE_EXTENSIONS*/ :
            _info = webcl.getSupportedExtensions().join(' ') ; 
          break;
          case 0x101A /*CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE*/ :
            _info = _object.getInfo(webcl.DEVICE_MEM_BASE_ADDR_ALIGN) >> 3;
          break;
          default:
            _info = _object.getInfo(param_name);
        }  
      } catch (e) {
        var _error = CL.catchError(e);
  
        if (param_value != 0) {
          HEAP32[((param_value)>>2)]=0;
        }
      
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
  
        return _error;
      }
          
      if(typeof(_info) == "number") {
  
        if (param_value_size == 8) {
          if (param_value != 0) (tempI64 = [_info>>>0,((+(Math_abs(_info))) >= 1.0 ? (_info > 0.0 ? ((Math_min((+(Math_floor((_info)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((_info - +(((~~(_info)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((param_value)>>2)]=tempI64[0],HEAP32[(((param_value)+(4))>>2)]=tempI64[1]);
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=8;
        } else {
          if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
        } 
        
      } else if(typeof(_info) == "boolean") {
  
        if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
  
      } else if(typeof(_info) == "string") {
  
        if (param_name != webcl.DEVICE_PROFILE) _info += " ";
        if (param_value != 0) writeStringToMemory(_info, param_value);
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length + 1;
  
      } else if(typeof(_info) == "object") {
  
        if (_info instanceof Array) {
         
          for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
            if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_info[i];
          }
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length * 4;
        
        } else if (_info instanceof WebCLPlatform) {
       
          var _id = CL.udid(_info);
          if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
        
        } else if (_info == null) {
  
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=0;
  
        } else {
          return webcl.INVALID_VALUE;
        }
      } else {
        return webcl.INVALID_VALUE;
      }
  
      return webcl.SUCCESS;
    }

  function _clEnqueueNDRangeKernel(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
  
      var _event = null;
      var _event_wait_list;
      var _local_work_size;
  
      // \todo need to be remove when webkit will be support null
      /**** **** **** **** **** **** **** ****/
      if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
        _event_wait_list = num_events_in_wait_list > 0 ? [] : null;
        _local_work_size = (local_work_size != 0) ? [] : null;
      } else {
        _event_wait_list = [];
        _local_work_size = [];
      }
  
  
      var _global_work_offset = [];
      var _global_work_size = [];
      
  
      for (var i = 0; i < work_dim; i++) {
        _global_work_size.push(HEAP32[(((global_work_size)+(i*4))>>2)]);
  
        if (global_work_offset != 0)
          _global_work_offset.push(HEAP32[(((global_work_offset)+(i*4))>>2)]);
        else
          _global_work_offset.push(0);
  
        if (local_work_size != 0)
          _local_work_size.push(HEAP32[(((local_work_size)+(i*4))>>2)]);
      }
  
      for (var i = 0; i < num_events_in_wait_list; i++) {
        var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
         
        _event_wait_list.push(CL.cl_objects[_event_wait]);
      }
             
      try { 
        
        if (event != 0) {
          _event = new WebCLEvent();
        }
  
        CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event);  
         
        if (event != 0) { 
          HEAP32[((event)>>2)]=CL.udid(_event);
        }
  
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
      
      return webcl.SUCCESS;    
  
    }


  function _emscripten_get_now() {
      if (!_emscripten_get_now.actual) {
        if (ENVIRONMENT_IS_NODE) {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() {
            var t = process['hrtime']();
            return t[0] * 1e3 + t[1] / 1e6;
          }
        } else if (typeof dateNow !== 'undefined') {
          _emscripten_get_now.actual = dateNow;
        } else if (ENVIRONMENT_IS_WEB && window['performance'] && window['performance']['now']) {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() { return window['performance']['now'](); };
        } else {
          _emscripten_get_now.actual = Date.now;
        }
      }
      return _emscripten_get_now.actual();
    }

  function _glutInitWindowSize(width, height) {
      Browser.setCanvasSize( GLUT.initWindowWidth = width,
                             GLUT.initWindowHeight = height );
    }

  function _glutSpecialFunc(func) {
      GLUT.specialFunc = func;
    }

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  function _clSetKernelArg(kernel,arg_index,arg_size,arg_value) {
      if (CL.cl_objects[kernel].sig.length < arg_index) {
        return webcl.INVALID_KERNEL;          
      }
  
      var _kernel = CL.cl_objects[kernel];
  
      var _posarg = arg_index;
  
      var _sig = _kernel.sig[_posarg];
      
      try {
  
        // LOCAL ARG
        if (_sig == webcl.LOCAL) {
  
          var _array = new Uint32Array([arg_size]);
  
          _kernel.setArg(_posarg,_array);
  
  
        } else {
  
          var _value = HEAP32[((arg_value)>>2)];
  
          // WEBCL OBJECT ARG
          if (_value in CL.cl_objects) {
  
            _kernel.setArg(_posarg,CL.cl_objects[_value]);
            
            if (! (CL.cl_objects[_value] instanceof WebCLSampler)) {
  
            }
            
          } else {
  
            var _array = CL.getReferencePointerToArray(arg_value,arg_size,[[_sig,1]]);
           
            _kernel.setArg(_posarg,_array);
  
          }
        }
      } catch (e) {
  
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
  
      return webcl.SUCCESS;
    }

  
  
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }

  function _glutCreateWindow(name) {
      var contextAttributes = {
        antialias: ((GLUT.initDisplayMode & 0x0080 /*GLUT_MULTISAMPLE*/) != 0),
        depth: ((GLUT.initDisplayMode & 0x0010 /*GLUT_DEPTH*/) != 0),
        stencil: ((GLUT.initDisplayMode & 0x0020 /*GLUT_STENCIL*/) != 0)
      };
      Module.ctx = Browser.createContext(Module['canvas'], true, true, contextAttributes);
      return Module.ctx ? 1 /* a new GLUT window ID for the created context */ : 0 /* failure */;
    }

  function _glutInit(argcp, argv) {
      // Ignore arguments
      GLUT.initTime = Date.now();
  
      var isTouchDevice = 'ontouchstart' in document.documentElement;
  
      window.addEventListener("keydown", GLUT.onKeydown, true);
      window.addEventListener("keyup", GLUT.onKeyup, true);
      if (isTouchDevice) {
        window.addEventListener("touchmove", GLUT.onMousemove, true);
        window.addEventListener("touchstart", GLUT.onMouseButtonDown, true);
        window.addEventListener("touchend", GLUT.onMouseButtonUp, true);
      } else {
        window.addEventListener("mousemove", GLUT.onMousemove, true);
        window.addEventListener("mousedown", GLUT.onMouseButtonDown, true);
        window.addEventListener("mouseup", GLUT.onMouseButtonUp, true);
        // IE9, Chrome, Safari, Opera
        window.addEventListener("mousewheel", GLUT.onMouseWheel, true);
        // Firefox
        window.addEventListener("DOMMouseScroll", GLUT.onMouseWheel, true);
      }
  
      Browser.resizeListeners.push(function(width, height) {
        if (GLUT.reshapeFunc) {
        	Runtime.dynCall('vii', GLUT.reshapeFunc, [width, height]);
        }
      });
  
      __ATEXIT__.push({ func: function() {
        window.removeEventListener("keydown", GLUT.onKeydown, true);
        window.removeEventListener("keyup", GLUT.onKeyup, true);
        if (isTouchDevice) {
          window.removeEventListener("touchmove", GLUT.onMousemove, true);
          window.removeEventListener("touchstart", GLUT.onMouseButtonDown, true);
          window.removeEventListener("touchend", GLUT.onMouseButtonUp, true);
        } else {
          window.removeEventListener("mousemove", GLUT.onMousemove, true);
          window.removeEventListener("mousedown", GLUT.onMouseButtonDown, true);
          window.removeEventListener("mouseup", GLUT.onMouseButtonUp, true);
          // IE9, Chrome, Safari, Opera
          window.removeEventListener("mousewheel", GLUT.onMouseWheel, true);
          // Firefox
          window.removeEventListener("DOMMouseScroll", GLUT.onMouseWheel, true);
        }
        Module["canvas"].width = Module["canvas"].height = 1;
      } });
    }

  function _glTexCoord2i(u, v) {
      assert(GLImmediate.mode >= 0); // must be in begin/end
      GLImmediate.vertexData[GLImmediate.vertexCounter++] = u;
      GLImmediate.vertexData[GLImmediate.vertexCounter++] = v;
      GLImmediate.addRendererComponent(GLImmediate.TEXTURE0, 2, GLctx.FLOAT);
    }

  function _clGetPlatformInfo(platform,param_name,param_value_size,param_value,param_value_size_ret) {
      
  
    
      var _info = null;
    
      try { 
  
  
        switch (param_name) {
          case 0x0902 /*CL_PLATFORM_NAME*/ :
            _info = "WEBCL_PLATFORM_NAME";
          break;
          case 0x0903 /*CL_PLATFORM_VENDOR*/ :
            _info = "WEBCL_PLATFORM_VENDOR";
          break;
            case 0x0904 /*CL_PLATFORM_EXTENSIONS*/ :
            _info = "WEBCL_PLATFORM_EXTENSIONS";
          break;
          default:
            _info = CL.cl_objects[platform].getInfo(param_name);  
        }      
      } catch (e) {
        
        var _error = CL.catchError(e);
        var _info = "undefined";
  
        if (param_value != 0) {
          writeStringToMemory(_info, param_value);
        }
    
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=_info.length + 1;
        }
  
        return _error;
      }
  
      if (param_name == webcl.PLATFORM_VERSION) _info += " "; 
      
      if (param_value != 0) {
        writeStringToMemory(_info, param_value);
      }
    
      if (param_value_size_ret != 0) {
        HEAP32[((param_value_size_ret)>>2)]=_info.length + 1;
      }
  
      return webcl.SUCCESS;
  
    }

  function _clEnqueueReadBuffer(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
    
      var _block = blocking_read ? true : false;
      var _event = null;
      var _event_wait_list = [];
      var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);
    
      for (var i = 0; i < num_events_in_wait_list; i++) {
        var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
  
        _event_wait_list.push(CL.cl_objects[_event_wait]);
      } 
  
      try {
  
        if (event != 0) {
          _event = new WebCLEvent();
          CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],_block,offset,cb,_host_ptr,_event_wait_list,_event);
        } else {
          CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],_block,offset,cb,_host_ptr,_event_wait_list);
        }
         
        
        if (event != 0) {
          HEAP32[((event)>>2)]=CL.udid(_event);
        }
  
      } catch (e) {
        var _error = CL.catchError(e);
          
  
        return _error;
      }
  
      return webcl.SUCCESS;    
    }

  function _glutInitWindowPosition(x, y) {
      // Ignore for now
    }

  function _clGetContextInfo(context,param_name,param_value_size,param_value,param_value_size_ret) {
  
  
      var _info = null;
  
      try { 
  
  
        if (param_name == 0x1080 /* CL_CONTEXT_REFERENCE_COUNT */) {
          _info = 0;
  
          if (context in CL.cl_objects) {
            _info++;
          }
  
          if (context in CL.cl_objects_retains) {
            _info+=CL.cl_objects_retains[context];
          }
  
        }  else if (param_name == 0x1082 /* CL_CONTEXT_PROPERTIES */) {
        
          _info = "WebCLContextProperties";
  
        } else {
  
          _info = CL.cl_objects[context].getInfo(param_name);
  
        }
        
  
      } catch (e) {
        var _error = CL.catchError(e);
  
        if (param_value != 0) {
          HEAP32[((param_value)>>2)]=0;
        }
      
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
  
        return _error;
      }
      
       if (_info == "WebCLContextProperties") {
  
        var _size = 0;
  
        if (param_value != 0) {
  
          if ( CL.cl_objects[context].hasOwnProperty('properties') ) {
            var _properties = CL.cl_objects[context].properties;
  
            for (elt in _properties) {
              HEAP32[(((param_value)+(_size*4))>>2)]=_properties[elt];
              _size ++;
  
            }
          }
        }
  
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_size*4;
  
      } else if(typeof(_info) == "number") {
  
        if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
  
      } else if(typeof(_info) == "boolean") {
  
        if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
  
      } else if(typeof(_info) == "object") {
  
        if (_info instanceof WebCLPlatform) {
       
          var _id = CL.udid(_info);
          if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
  
        } else if (_info instanceof Array) {
  
          for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
            var _id = CL.udid(_info[i]);
            if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_id;
          }
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length*4;
  
        } else if (_info == null) {
  
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=0;
  
        } else {
          return webcl.INVALID_VALUE;
        }
      } else {
        return webcl.INVALID_VALUE;
      }
  
      return webcl.SUCCESS;
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
                if (next === 0) return i > 0 ? fields : fields-1; // we failed to read the full length of this field
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }
  
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
  
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }function _fscanf(stream, format, varargs) {
      // int fscanf(FILE *restrict stream, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        return -1;
      }
      var buffer = [];
      function get() {
        var c = _fgetc(stream);
        buffer.push(c);
        return c;
      };
      function unget() {
        _ungetc(buffer.pop(), stream);
      };
      return __scanString(format, get, unget, varargs);
    }

  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.textures);
        var texture = GLctx.createTexture();
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }

  function _clReleaseMemObject(memobj) {
  
      // If is an object retain don't release it until retains > 0...
      if (memobj in CL.cl_objects_retains) {
  
        var _retain = CL.cl_objects_retains[memobj] - 1;
  
        CL.cl_objects_retains[memobj] = _retain;
  
        if (_retain >= 0) {
          
          // Call the callback 
          if (memobj in CL.cl_objects_mem_callback) {
            if (CL.cl_objects_mem_callback[memobj].length > 0)
              CL.cl_objects_mem_callback[memobj].pop()();
          }
  
          return webcl.SUCCESS;
        }
      }
  
      try {
  
        // Call the callback 
        if (memobj in CL.cl_objects_mem_callback) {
          if (CL.cl_objects_mem_callback[memobj].length > 0)
            CL.cl_objects_mem_callback[memobj].pop()();
        }
  
        CL.cl_objects[memobj].release();
        delete CL.cl_objects[memobj];  
  
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
      return webcl.SUCCESS;
    }

  
  function _clEnqueueWriteBuffer(command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
      
      var _event = null;
      var _block = blocking_write ? true : false;
      var _event_wait_list = [];
      var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);
  
      for (var i = 0; i < num_events_in_wait_list; i++) {
        var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
  
        _event_wait_list.push(CL.cl_objects[_event_wait]);
      } 
  
      try {
  
        if (event != 0) {
           _event = new WebCLEvent();
        
          CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],_block,offset,cb,_host_ptr,_event_wait_list,_event);    
          
        } else {
  
          CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],_block,offset,cb,_host_ptr,_event_wait_list);    
        }
  
        if (event != 0) {
          HEAP32[((event)>>2)]=CL.udid(_event);
        }
  
      } catch (e) {
        var _error = CL.catchError(e);
   
  
        return _error;
      }
  
  
      return webcl.SUCCESS;  
    }function _clCreateBuffer(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      
  
      var _id = null;
      var _buffer = null;
  
      // Context must be created
      
      var _flags;
  
      if (flags_i64_1 & webcl.MEM_READ_WRITE) {
        _flags = webcl.MEM_READ_WRITE;
      } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
        _flags = webcl.MEM_WRITE_ONLY;
      } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
        _flags = webcl.MEM_READ_ONLY;
      } else {
        _flags |= webcl.MEM_READ_WRITE;
      }
  
      var _host_ptr = null;
  
      if ( host_ptr != 0 ) _host_ptr = CL.getCopyPointerToArray(host_ptr,size,CL.cl_pn_type); 
      else if (
        (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR  */) ||
        (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR   */) ||
        (flags_i64_1 & (1 << 3) /* CL_MEM_USE_HOST_PTR    */)
        ) {
        _host_ptr = CL.getHostPtrArray(size,CL.cl_pn_type);
      } 
  
      try {
  
      
        if (_host_ptr != null) {
          _buffer = CL.cl_objects[context].createBuffer(_flags,size,_host_ptr);
        } else
          _buffer = CL.cl_objects[context].createBuffer(_flags,size);
  
      } catch (e) {
        var _error = CL.catchError(e);
      
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        
        return 0; // NULL Pointer
      }
  
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
  
      // Add flags property
      Object.defineProperty(_buffer, "flags", { value : flags_i64_1,writable : false });
      _id = CL.udid(_buffer);
    
      // \todo need to be remove when firefox will be support hot_ptr
      /**** **** **** **** **** **** **** ****/
      if (_host_ptr != null) {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
          // Search command
          var commandqueue = null;
          for (var obj in CL.cl_objects) {
            if (CL.cl_objects[obj] instanceof WebCLCommandQueue) {
              commandqueue = CL.cl_objects[obj];
              break;
            }
          }
          
          if (commandqueue != null) {
            _clEnqueueWriteBuffer(obj,_id,true,0,size,host_ptr,0,0,0);
          } else {
            if (cl_errcode_ret != 0) {
              HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
            }
  
            return 0; 
          }
        }
      }
      /**** **** **** **** **** **** **** ****/
  
  
      return _id;
    }

  function _clGetProgramBuildInfo(program,device,param_name,param_value_size,param_value,param_value_size_ret) {
  
      var _info = null;
  
      try { 
  
  
        _info = CL.cl_objects[program].getBuildInfo(CL.cl_objects[device], param_name);
  
      } catch (e) {
        var _error = CL.catchError(e);
  
        if (param_value != 0) {
          HEAP32[((param_value)>>2)]=0;
        }
  
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
  
        return _error;
      }
  
      if(typeof(_info) == "number") {
  
        if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
  
      } else if(typeof(_info) == "string") {
        if (param_value != 0) {
          writeStringToMemory(_info, param_value);
        }
      
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=_info.length + 1;
        }
      } else {
        return webcl.INVALID_VALUE;
      }
  
      return webcl.SUCCESS;
    }

  function _glTexCoordPointer(size, type, stride, pointer) {
      GLImmediate.setClientAttribute(GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture, size, type, stride, pointer);
      if (GL.currArrayBuffer) {
        var loc = GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture;
        GLctx.vertexAttribPointer(loc, size, type, false, stride, pointer);
      }
    }

  function _glColor4f(r, g, b, a) {
      r = Math.max(Math.min(r, 1), 0);
      g = Math.max(Math.min(g, 1), 0);
      b = Math.max(Math.min(b, 1), 0);
      a = Math.max(Math.min(a, 1), 0);
  
      // TODO: make ub the default, not f, save a few mathops
      if (GLImmediate.mode >= 0) {
        var start = GLImmediate.vertexCounter << 2;
        GLImmediate.vertexDataU8[start + 0] = r * 255;
        GLImmediate.vertexDataU8[start + 1] = g * 255;
        GLImmediate.vertexDataU8[start + 2] = b * 255;
        GLImmediate.vertexDataU8[start + 3] = a * 255;
        GLImmediate.vertexCounter++;
        GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE);
      } else {
        GLImmediate.clientColor[0] = r;
        GLImmediate.clientColor[1] = g;
        GLImmediate.clientColor[2] = b;
        GLImmediate.clientColor[3] = a;
        GLctx.vertexAttrib4fv(GLImmediate.COLOR, GLImmediate.clientColor);
      }
    }

  function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      if (pixels) {
        var data = GL.getTexPixelData(type, format, width, height, pixels, -1);
        pixels = data.pixels;
      } else {
        pixels = null;
      }
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
    }

  function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      if (pixels) {
        var data = GL.getTexPixelData(type, format, width, height, pixels, internalFormat);
        pixels = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixels = null;
      }
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
    }


  function _clGetDeviceIDs(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
      // Assume the device_type is i32 
      assert(device_type_i64_2 == 0, 'Invalid device_type i64');
  
      
      // Init webcl variable if necessary
      if (CL.init() == 0) {
        return webcl.INVALID_VALUE;
      }
  
      if ( num_entries == 0 && devices != 0) {
        return webcl.INVALID_VALUE;
      }
  
      if ( num_devices == 0 && devices == 0) {
        return webcl.INVALID_VALUE;
      }
  
      if ( platform != 0 && !(platform in CL.cl_objects)) {
        return webcl.INVALID_PLATFORM;  
      }
  
      var _device = null;
  
      try {
  
        // If platform is NULL use the first platform found ...
        if (platform == 0) {
          var _platforms = webcl.getPlatforms();
          if (_platforms.length == 0) {
            return webcl.INVALID_PLATFORM;  
          }
  
          // Create a new UDID 
          platform = CL.udid(_platforms[0]);
        } 
  
        var _platform = CL.cl_objects[platform];
  
        // Fix -1 type
        if (device_type_i64_1 == -1) device_type_i64_1 = webcl.DEVICE_TYPE_ALL;
  
  
        _devices = _platform.getDevices(device_type_i64_1);
  
      } catch (e) {
  
        var _error = CL.catchError(e);
  
        return _error;
      }
  
      if (num_devices != 0) {
        HEAP32[((num_devices)>>2)]=_devices.length /* Num of device */;
      } 
  
      if (devices != 0) {
        for (var i = 0; i < Math.min(num_entries,_devices.length); i++) {
          var _id = CL.udid(_devices[i]);
          HEAP32[(((devices)+(i*4))>>2)]=_id;
        }
      }
  
      return webcl.SUCCESS;
  
    }

  function ___errno_location() {
      return ___errno_state;
    }

   
  Module["_memset"] = _memset;

  function _glEnd() {
      GLImmediate.prepareClientAttributes(GLImmediate.rendererComponents[GLImmediate.VERTEX], true);
      GLImmediate.firstVertex = 0;
      GLImmediate.lastVertex = GLImmediate.vertexCounter / (GLImmediate.stride >> 2);
      GLImmediate.flush();
      GLImmediate.disableBeginEndClientAttributes();
      GLImmediate.mode = -1;
  
      // Pop the old state:
      GLImmediate.enabledClientAttributes = GLImmediate.enabledClientAttributes_preBegin;
      GLImmediate.clientAttributes = GLImmediate.clientAttributes_preBegin;
      GLImmediate.currentRenderer = null; // The set of active client attributes changed, we must re-lookup the renderer to use.
      GLImmediate.modifiedClientAttributes = true;
    }

  function _abort() {
      Module['abort']();
    }


  function _clCreateContext(properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret) {
  
      // Init webcl variable if necessary
      if (CL.init() == 0) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
        }
  
        return 0; // NULL Pointer      
      }
      
      var _id = null;
      var _context = null;
  
      try { 
  
        var _platform = null;
        var _devices = [];
        var _glclSharedContext = false;
  
        // Verify the device, theorically on OpenCL there are CL_INVALID_VALUE when devices or num_devices is null,
        // WebCL can work using default device / platform, we check only if parameter are set.
        for (var i = 0; i < num_devices; i++) {
          var _idxDevice = HEAP32[(((devices)+(i*4))>>2)];
            _devices.push(CL.cl_objects[_idxDevice]);
        }
  
        // Verify the property
        var _propertiesCounter = 0;
        var _properties = [];
  
        if (properties != 0) {
          while(1) {
            var _readprop = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
            _properties.push(_readprop);
  
            if (_readprop == 0) break;
  
            switch (_readprop) {
              case webcl.CONTEXT_PLATFORM:
                _propertiesCounter ++;
                var _idxPlatform = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
                _properties.push(_idxPlatform);
  
                  _platform = CL.cl_objects[_idxPlatform];
                break;
  
              // /!\ This part, it's for the CL_GL_Interop
              case (0x200B) /*CL_WGL_HDC_KHR*/:
              case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
              case (0x2008) /*CL_GL_CONTEXT_KHR*/:
              case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
                _propertiesCounter ++;
                _glclSharedContext = true;
                
                break;
  
              default:
                if (cl_errcode_ret != 0) {
                  HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_PROPERTY;
                }
  
                return 0; 
            };
  
            _propertiesCounter ++;
          }
        }
  
        if (num_devices > 0) {
          if (_glclSharedContext && (navigator.userAgent.toLowerCase().indexOf('firefox') == -1) ) {       
  
            _context = webcl.createContext(Module.ctx,_devices); 
            
          } else {
          
            _context = webcl.createContext(_devices);  
  
          }
        } else if (_platform != null) {
          
          if (_glclSharedContext && (navigator.userAgent.toLowerCase().indexOf('firefox') == -1) ) {
            _context = webcl.createContext(Module.ctx,_platform);  
          } else {
            _context = webcl.createContext(_platform);  
          }
  
        } else {
          // If no device and no platfomr peek the first one
          
          // Search platform
          for (var obj in CL.cl_objects) {
            if (CL.cl_objects[obj] instanceof WebCLPlatform) {
              _platform = CL.cl_objects[obj];
              break;
            }
          }
          if (_platform == null) {
            var _platforms = webcl.getPlatforms();
  
            _platform = _platforms[0];
          
            CL.udid(_platforms[i]);         
          }
  
          if (_glclSharedContext) {
            _context = webcl.createContext(Module.ctx,_platform);  
          } else {
            _context = webcl.createContext(_platform);  
          }    
        }
  
      } catch (e) {
        var _error = CL.catchError(e);
      
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
  
        return 0; // NULL Pointer
      }
  
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
  
      _id = CL.udid(_context);
  
      // Add properties array for getInfo
      Object.defineProperty(_context, "properties", { value : _properties,writable : false });
  
  
      return _id;
    }

  function _clCreateKernel(program,kernel_name,cl_errcode_ret) {
      
  
      var _id = null;
      var _kernel = null;
      var _name = (kernel_name == 0) ? "" : Pointer_stringify(kernel_name);
  
      // program must be created
      try {
      
  
        _kernel = CL.cl_objects[program].createKernel(_name);
        
        Object.defineProperty(_kernel, "name", { value : _name,writable : false });
        Object.defineProperty(_kernel, "sig", { value : CL.cl_kernels_sig[_name],writable : false });
  
  
        
      } catch (e) {
        var _error = CL.catchError(e);
      
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
  
        return 0; // NULL Pointer
      }
  
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
  
      _id = CL.udid(_kernel);
  
  
      return _id;
    }

  function _clGetKernelWorkGroupInfo(kernel,device,param_name,param_value_size,param_value,param_value_size_ret) {
  
      try {
  
        var _info = CL.cl_objects[kernel].getWorkGroupInfo(CL.cl_objects[device], param_name);
  
        if(typeof(_info) == "number") {
  
          if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
  
        } else if (_info instanceof Int32Array) {
         
          for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
            if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_info[i];
          }
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length * 4;
        
        } else {
  
          console.error("clGetKernelWorkGroupInfo: unknow type of info '"+_info+"'")
          
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=0;
  
        }
  
      } catch (e) {
        var _error = CL.catchError(e);
  
        if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=0;
        
        return _error;
      }
  
      return webcl.SUCCESS;
    }

  function _clCreateCommandQueue(context,device,properties_1,properties_2,cl_errcode_ret) {
      // Assume the properties is i32 
      assert(properties_2 == 0, 'Invalid properties i64');
  
  
      var _id = null;
      var _command = null;
  
      // Context must be created
  
      // Context must be created
  
      try { 
  
  
        _command = CL.cl_objects[context].createCommandQueue(CL.cl_objects[device],properties_1);
  
      } catch (e) {
        var _error = CL.catchError(e);
      
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
  
        return 0; // NULL Pointer
      }
  
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
  
      _id = CL.udid(_command);
  
  
      return _id;
    }

  function _glutIdleFunc(func) {
      function callback() {
        if (GLUT.idleFunc) {
          Runtime.dynCall('v', GLUT.idleFunc);
          Browser.safeSetTimeout(callback, 0);
        }
      }
      if (!GLUT.idleFunc) {
        Browser.safeSetTimeout(callback, 0);
      }
      GLUT.idleFunc = func;
    }


  function _clBuildProgram(program,num_devices,device_list,options,pfn_notify,user_data) {
  
      try {
  
        var _devices = [];
        var _option = (options == 0) ? "" : Pointer_stringify(options); 
  
        if (_option) {
          // Add space after -D
          _option = _option.replace(/-D/g, "-D ");
  
          // Remove all the multispace
          _option = _option.replace(/\s{2,}/g, " ");
        }
  
        if (device_list != 0 && num_devices > 0 ) {
          for (var i = 0; i < num_devices ; i++) {
            var _device = HEAP32[(((device_list)+(i*4))>>2)]
              _devices.push(CL.cl_objects[_device]);
          }
        }
  
        // If device_list is NULL value, the program executable is built for all devices associated with program.
        if (_devices.length == 0) {
          _devices = CL.cl_objects[program].getInfo(webcl.PROGRAM_DEVICES); 
        }
  
        var _callback = null
        if (pfn_notify != 0) {
          /**
           * Description
           * @return 
           */
          _callback = function() { 
            console.info("\nCall ( clBuildProgram ) callback function : FUNCTION_TABLE["+pfn_notify+"]("+program+", "+user_data+")");
            FUNCTION_TABLE[pfn_notify](program, user_data) 
          };
        }
  
        
        CL.cl_objects[program].build(_devices,_option,_callback);
  
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
  
      return webcl.SUCCESS;      
  
    }


  
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var fd = _fileno(stream);
      var ret = _lseek(fd, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStreamFromPtr(stream);
      stream.eof = false;
      return 0;
    }

  function _glutDisplayFunc(func) {
      GLUT.displayFunc = func;
    }

  function _glutPostRedisplay() {
      if (GLUT.displayFunc && !GLUT.requestedAnimationFrame) {
        GLUT.requestedAnimationFrame = true;
        Browser.requestAnimationFrame(function() {
          GLUT.requestedAnimationFrame = false;
          if (ABORT) return;
          Runtime.dynCall('v', GLUT.displayFunc);
        });
      }
    }

  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }


  
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStreamFromPtr(stream);
      if (streamObj) streamObj.error = false;
    }

  function _glLoadIdentity() {
      GLImmediate.matricesModified = true;
      GLImmediate.matrixVersion[GLImmediate.currentMatrix] = (GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1)|0;
      GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[GLImmediate.currentMatrix]);
    }

  var _sin=Math_sin;

  function _glBlendFunc(x0, x1) { GLctx.blendFunc(x0, x1) }

  
  function _emscripten_glColor4f(r, g, b, a) {
      r = Math.max(Math.min(r, 1), 0);
      g = Math.max(Math.min(g, 1), 0);
      b = Math.max(Math.min(b, 1), 0);
      a = Math.max(Math.min(a, 1), 0);
  
      // TODO: make ub the default, not f, save a few mathops
      if (GLImmediate.mode >= 0) {
        var start = GLImmediate.vertexCounter << 2;
        GLImmediate.vertexDataU8[start + 0] = r * 255;
        GLImmediate.vertexDataU8[start + 1] = g * 255;
        GLImmediate.vertexDataU8[start + 2] = b * 255;
        GLImmediate.vertexDataU8[start + 3] = a * 255;
        GLImmediate.vertexCounter++;
        GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE);
      } else {
        GLImmediate.clientColor[0] = r;
        GLImmediate.clientColor[1] = g;
        GLImmediate.clientColor[2] = b;
        GLImmediate.clientColor[3] = a;
        GLctx.vertexAttrib4fv(GLImmediate.COLOR, GLImmediate.clientColor);
      }
    }function _glColor3f(r, g, b) {
      _emscripten_glColor4f(r, g, b, 1);
    }

  function _glVertex3f(x, y, z) {
      assert(GLImmediate.mode >= 0); // must be in begin/end
      GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
      GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
      GLImmediate.vertexData[GLImmediate.vertexCounter++] = z || 0;
      assert(GLImmediate.vertexCounter << 2 < GL.MAX_TEMP_BUFFER_SIZE);
      GLImmediate.addRendererComponent(GLImmediate.VERTEX, 3, GLctx.FLOAT);
    }

  function _clCreateProgramWithSource(context,count,strings,lengths,cl_errcode_ret) {
      
  
      var _id = null;
      var _program = null;
  
      // Context must be created
  
      try {
        
        var _string = "";
  
        for (var i = 0; i < count; i++) {
          if (lengths) {
            var _len = HEAP32[(((lengths)+(i*4))>>2)];
            if (_len < 0) {
              _string += Pointer_stringify(HEAP32[(((strings)+(i*4))>>2)]);   
            } else {
              _string += Pointer_stringify(HEAP32[(((strings)+(i*4))>>2)], _len);   
            }
          } else {
            _string += Pointer_stringify(HEAP32[(((strings)+(i*4))>>2)]); 
          }
        }
  
        CL.parseKernel(_string);
  
  
        _program = CL.cl_objects[context].createProgram(_string);
    
      } catch (e) {
        var _error = CL.catchError(e);
  
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
  
        return 0; // NULL Pointer
      }
  
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
  
      _id = CL.udid(_program);
  
  
      return _id;
    }

  
  function _glutReshapeWindow(width, height) {
      GLUT.cancelFullScreen();
      Browser.setCanvasSize(width, height);
      if (GLUT.reshapeFunc) {
        Runtime.dynCall('vii', GLUT.reshapeFunc, [width, height]);
      }
      _glutPostRedisplay();
    }function _glutMainLoop() {
      _glutReshapeWindow(Module['canvas'].width, Module['canvas'].height);
      _glutPostRedisplay();
      throw 'SimulateInfiniteLoop';
    }

  function _glEnableClientState(cap) {
      var attrib = GLEmulation.getAttributeFromCapability(cap);
      if (attrib === null) {
        Module.printErr('WARNING: unhandled clientstate: ' + cap);
        return;
      }
      if (!GLImmediate.enabledClientAttributes[attrib]) {
        GLImmediate.enabledClientAttributes[attrib] = true;
        GLImmediate.totalEnabledClientAttributes++;
        GLImmediate.currentRenderer = null; // Will need to change current renderer, since the set of active vertex pointers changed.
        // In GL_FFP_ONLY mode, attributes are bound to the same index in each FFP emulation shader, so we can immediately apply the change here.
        GL.enableVertexAttribArray(attrib);
        if (GLEmulation.currentVao) GLEmulation.currentVao.enabledClientStates[cap] = 1;
        GLImmediate.modifiedClientAttributes = true;
      }
    }


  function _glClientActiveTexture(texture) {
      GLImmediate.clientActiveTexture = texture - 0x84C0; // GL_TEXTURE0
    }

  var _cos=Math_cos;

  function _glTexParameteri(x0, x1, x2) { GLctx.texParameteri(x0, x1, x2) }

  function _glPushMatrix() {
      GLImmediate.matricesModified = true;
      GLImmediate.matrixVersion[GLImmediate.currentMatrix] = (GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1)|0;
      GLImmediate.matrixStack[GLImmediate.currentMatrix].push(
          Array.prototype.slice.call(GLImmediate.matrix[GLImmediate.currentMatrix]));
    }

  function _glMatrixMode(mode) {
      if (mode == 0x1700 /* GL_MODELVIEW */) {
        GLImmediate.currentMatrix = 0/*m*/;
      } else if (mode == 0x1701 /* GL_PROJECTION */) {
        GLImmediate.currentMatrix = 1/*p*/;
      } else if (mode == 0x1702) { // GL_TEXTURE
        GLImmediate.useTextureMatrix = true;
        GLImmediate.currentMatrix = 2/*t*/ + GLImmediate.clientActiveTexture;
      } else {
        throw "Wrong mode " + mode + " passed to glMatrixMode";
      }
    }

  function _glutReshapeFunc(func) {
      GLUT.reshapeFunc = func;
    }

  function _glOrtho(left, right, bottom, top_, nearVal, farVal) {
      GLImmediate.matricesModified = true;
      GLImmediate.matrixVersion[GLImmediate.currentMatrix] = (GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1)|0;
      GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix],
          GLImmediate.matrixLib.mat4.ortho(left, right, bottom, top_, nearVal, farVal));
    }

  function _clFinish(command_queue) {
  
  
      try {
  
        CL.cl_objects[command_queue].finish();
  
      } catch (e) {
        var _error = CL.catchError(e);
  
        return _error;
      }
  
  
      return webcl.SUCCESS;
    }

  function _glViewport(x0, x1, x2, x3) { GLctx.viewport(x0, x1, x2, x3) }

  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
  
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
  
      // Apply sign.
      ret *= multiplier;
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
  
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
  
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)),ret>>>0)|0);
      }
  
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }

  function _glutInitDisplayMode(mode) {
      GLUT.initDisplayMode = mode;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _glutKeyboardFunc(func) {
      GLUT.keyboardFunc = func;
    }


var GLctx; GL.init()
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
GLImmediate.setupFuncs(); Browser.moduleContextCreatedCallbacks.push(function() { GLImmediate.init() });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
GLEmulation.init();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'almost asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var ___rand_seed=env.___rand_seed|0;
  var _stderr=env._stderr|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = +env.NaN, inf = +env.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var nullFunc_vii=env.nullFunc_vii;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_v=env.nullFunc_v;
  var invoke_vii=env.invoke_vii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var _glUseProgram=env._glUseProgram;
  var _fread=env._fread;
  var _clEnqueueNDRangeKernel=env._clEnqueueNDRangeKernel;
  var _clCreateContext=env._clCreateContext;
  var _glDeleteProgram=env._glDeleteProgram;
  var _clCreateProgramWithSource=env._clCreateProgramWithSource;
  var _glBindBuffer=env._glBindBuffer;
  var _fsync=env._fsync;
  var _sbrk=env._sbrk;
  var _glBlendFunc=env._glBlendFunc;
  var _glutReshapeWindow=env._glutReshapeWindow;
  var _glDisableVertexAttribArray=env._glDisableVertexAttribArray;
  var _glCreateShader=env._glCreateShader;
  var _glutSwapBuffers=env._glutSwapBuffers;
  var _sysconf=env._sysconf;
  var _close=env._close;
  var _rewind=env._rewind;
  var _cos=env._cos;
  var _glTexCoord2i=env._glTexCoord2i;
  var _clCreateCommandQueue=env._clCreateCommandQueue;
  var _glLoadIdentity=env._glLoadIdentity;
  var _write=env._write;
  var _ftell=env._ftell;
  var _glutSpecialFunc=env._glutSpecialFunc;
  var _glShaderSource=env._glShaderSource;
  var _glOrtho=env._glOrtho;
  var _glVertexPointer=env._glVertexPointer;
  var _glGetBooleanv=env._glGetBooleanv;
  var _glutCreateWindow=env._glutCreateWindow;
  var __getFloat=env.__getFloat;
  var _glVertexAttribPointer=env._glVertexAttribPointer;
  var _glHint=env._glHint;
  var _send=env._send;
  var _glutDisplayFunc=env._glutDisplayFunc;
  var _glBegin=env._glBegin;
  var _clGetProgramBuildInfo=env._clGetProgramBuildInfo;
  var _glutInitDisplayMode=env._glutInitDisplayMode;
  var _strtol=env._strtol;
  var _glViewport=env._glViewport;
  var _fscanf=env._fscanf;
  var ___setErrNo=env.___setErrNo;
  var _glutPostRedisplay=env._glutPostRedisplay;
  var _clGetPlatformInfo=env._clGetPlatformInfo;
  var _glutReshapeFunc=env._glutReshapeFunc;
  var _glEnable=env._glEnable;
  var _printf=env._printf;
  var _glGenTextures=env._glGenTextures;
  var _sprintf=env._sprintf;
  var _glGetIntegerv=env._glGetIntegerv;
  var _glGetString=env._glGetString;
  var _glutMainLoop=env._glutMainLoop;
  var _glPushMatrix=env._glPushMatrix;
  var _emscripten_get_now=env._emscripten_get_now;
  var _glAttachShader=env._glAttachShader;
  var _read=env._read;
  var _clSetKernelArg=env._clSetKernelArg;
  var _fwrite=env._fwrite;
  var _time=env._time;
  var _glColor3f=env._glColor3f;
  var _glDetachShader=env._glDetachShader;
  var _glutInitWindowPosition=env._glutInitWindowPosition;
  var _exit=env._exit;
  var _glColor4f=env._glColor4f;
  var _lseek=env._lseek;
  var _atoi=env._atoi;
  var _glEnableClientState=env._glEnableClientState;
  var _pwrite=env._pwrite;
  var _open=env._open;
  var _glClearColor=env._glClearColor;
  var _glIsEnabled=env._glIsEnabled;
  var _glBindTexture=env._glBindTexture;
  var _snprintf=env._snprintf;
  var _clReleaseMemObject=env._clReleaseMemObject;
  var _clGetPlatformIDs=env._clGetPlatformIDs;
  var _glutIdleFunc=env._glutIdleFunc;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _clFinish=env._clFinish;
  var _fseek=env._fseek;
  var _clGetDeviceIDs=env._clGetDeviceIDs;
  var _glutInit=env._glutInit;
  var __parseInt=env.__parseInt;
  var _glActiveTexture=env._glActiveTexture;
  var _glGetFloatv=env._glGetFloatv;
  var _clGetKernelWorkGroupInfo=env._clGetKernelWorkGroupInfo;
  var _clCreateBuffer=env._clCreateBuffer;
  var _glTexCoordPointer=env._glTexCoordPointer;
  var _recv=env._recv;
  var _glCompileShader=env._glCompileShader;
  var _glEnableVertexAttribArray=env._glEnableVertexAttribArray;
  var _abort=env._abort;
  var _clBuildProgram=env._clBuildProgram;
  var _glTexImage2D=env._glTexImage2D;
  var _isspace=env._isspace;
  var _fopen=env._fopen;
  var _clGetContextInfo=env._clGetContextInfo;
  var _clCreateKernel=env._clCreateKernel;
  var _sin=env._sin;
  var _glutKeyboardFunc=env._glutKeyboardFunc;
  var _ungetc=env._ungetc;
  var _clEnqueueWriteBuffer=env._clEnqueueWriteBuffer;
  var _clGetDeviceInfo=env._clGetDeviceInfo;
  var _fprintf=env._fprintf;
  var __reallyNegative=env.__reallyNegative;
  var _glutInitWindowSize=env._glutInitWindowSize;
  var _glClear=env._glClear;
  var _fileno=env._fileno;
  var _glPopMatrix=env._glPopMatrix;
  var _glMatrixMode=env._glMatrixMode;
  var __exit=env.__exit;
  var _glBindAttribLocation=env._glBindAttribLocation;
  var _emscripten_glColor4f=env._emscripten_glColor4f;
  var _glVertex3f=env._glVertex3f;
  var _pread=env._pread;
  var _mkport=env._mkport;
  var _glEnd=env._glEnd;
  var _glLinkProgram=env._glLinkProgram;
  var _fflush=env._fflush;
  var _clEnqueueReadBuffer=env._clEnqueueReadBuffer;
  var ___errno_location=env.___errno_location;
  var _fgetc=env._fgetc;
  var __scanString=env.__scanString;
  var _glClientActiveTexture=env._glClientActiveTexture;
  var _fclose=env._fclose;
  var _glDisable=env._glDisable;
  var _glTexParameteri=env._glTexParameteri;
  var __formatString=env.__formatString;
  var _sqrt=env._sqrt;
  var _glTexSubImage2D=env._glTexSubImage2D;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
STACKTOP = (STACKTOP + 7)&-8;
  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
  HEAP8[tempDoublePtr+4|0] = HEAP8[ptr+4|0];
  HEAP8[tempDoublePtr+5|0] = HEAP8[ptr+5|0];
  HEAP8[tempDoublePtr+6|0] = HEAP8[ptr+6|0];
  HEAP8[tempDoublePtr+7|0] = HEAP8[ptr+7|0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}

function setTempRet1(value) {
  value = value|0;
  tempRet1 = value;
}

function setTempRet2(value) {
  value = value|0;
  tempRet2 = value;
}

function setTempRet3(value) {
  value = value|0;
  tempRet3 = value;
}

function setTempRet4(value) {
  value = value|0;
  tempRet4 = value;
}

function setTempRet5(value) {
  value = value|0;
  tempRet5 = value;
}

function setTempRet6(value) {
  value = value|0;
  tempRet6 = value;
}

function setTempRet7(value) {
  value = value|0;
  tempRet7 = value;
}

function setTempRet8(value) {
  value = value|0;
  tempRet8 = value;
}

function setTempRet9(value) {
  value = value|0;
  tempRet9 = value;
}

function _UpdateRendering() {
 var $0 = 0.0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0, $108 = 0.0, $109 = 0.0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0;
 var $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
 var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
 var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0.0, $66 = 0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0, $71 = 0;
 var $72 = 0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $elapsedTime = 0.0, $elapsedTime1 = 0.0, $k = 0.0, $sampleSec = 0.0, $samples = 0, $startSampleCount = 0, $startTime = 0.0, $status = 0, $tresholdTime = 0.0, $vararg_buffer = 0;
 var $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer13 = 0, $vararg_buffer16 = 0, $vararg_buffer19 = 0, $vararg_buffer22 = 0, $vararg_buffer25 = 0, $vararg_buffer28 = 0, $vararg_buffer4 = 0, $vararg_buffer7 = 0, $vararg_ptr31 = 0, $vararg_ptr32 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $vararg_buffer28 = sp + 24|0;
 $vararg_buffer25 = sp + 88|0;
 $vararg_buffer22 = sp + 8|0;
 $vararg_buffer19 = sp + 48|0;
 $vararg_buffer16 = sp + 80|0;
 $vararg_buffer13 = sp + 96|0;
 $vararg_buffer10 = sp + 112|0;
 $vararg_buffer7 = sp + 64|0;
 $vararg_buffer4 = sp + 56|0;
 $vararg_buffer1 = sp + 16|0;
 $vararg_buffer = sp + 120|0;
 $0 = (+_WallClockTime());
 $startTime = $0;
 $1 = HEAP32[8>>2]|0;
 $startSampleCount = $1;
 $2 = HEAP32[16>>2]|0;
 $3 = (_clSetKernelArg(($2|0),0,4,(24|0))|0);
 $status = $3;
 $4 = $status;
 $5 = ($4|0)!=(0);
 if ($5) {
  $6 = HEAP32[_stderr>>2]|0;
  $7 = $status;
  HEAP32[$vararg_buffer>>2] = $7;
  (_fprintf(($6|0),(32|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 }
 $8 = HEAP32[16>>2]|0;
 $9 = (_clSetKernelArg(($8|0),1,4,(72|0))|0);
 $status = $9;
 $10 = $status;
 $11 = ($10|0)!=(0);
 if ($11) {
  $12 = HEAP32[_stderr>>2]|0;
  $13 = $status;
  HEAP32[$vararg_buffer1>>2] = $13;
  (_fprintf(($12|0),(80|0),($vararg_buffer1|0))|0);
  _exit(-1);
  // unreachable;
 }
 $14 = HEAP32[16>>2]|0;
 $15 = (_clSetKernelArg(($14|0),2,4,(120|0))|0);
 $status = $15;
 $16 = $status;
 $17 = ($16|0)!=(0);
 if ($17) {
  $18 = HEAP32[_stderr>>2]|0;
  $19 = $status;
  HEAP32[$vararg_buffer4>>2] = $19;
  (_fprintf(($18|0),(128|0),($vararg_buffer4|0))|0);
  _exit(-1);
  // unreachable;
 }
 $20 = HEAP32[16>>2]|0;
 $21 = (_clSetKernelArg(($20|0),3,4,(168|0))|0);
 $status = $21;
 $22 = $status;
 $23 = ($22|0)!=(0);
 if ($23) {
  $24 = HEAP32[_stderr>>2]|0;
  $25 = $status;
  HEAP32[$vararg_buffer7>>2] = $25;
  (_fprintf(($24|0),(176|0),($vararg_buffer7|0))|0);
  _exit(-1);
  // unreachable;
 }
 $26 = HEAP32[16>>2]|0;
 $27 = (_clSetKernelArg(($26|0),4,4,(216|0))|0);
 $status = $27;
 $28 = $status;
 $29 = ($28|0)!=(0);
 if ($29) {
  $30 = HEAP32[_stderr>>2]|0;
  $31 = $status;
  HEAP32[$vararg_buffer10>>2] = $31;
  (_fprintf(($30|0),(224|0),($vararg_buffer10|0))|0);
  _exit(-1);
  // unreachable;
 }
 $32 = HEAP32[16>>2]|0;
 $33 = (_clSetKernelArg(($32|0),5,4,(3368|0))|0);
 $status = $33;
 $34 = $status;
 $35 = ($34|0)!=(0);
 if ($35) {
  $36 = HEAP32[_stderr>>2]|0;
  $37 = $status;
  HEAP32[$vararg_buffer13>>2] = $37;
  (_fprintf(($36|0),(264|0),($vararg_buffer13|0))|0);
  _exit(-1);
  // unreachable;
 }
 $38 = HEAP32[16>>2]|0;
 $39 = (_clSetKernelArg(($38|0),6,4,(3376|0))|0);
 $status = $39;
 $40 = $status;
 $41 = ($40|0)!=(0);
 if ($41) {
  $42 = HEAP32[_stderr>>2]|0;
  $43 = $status;
  HEAP32[$vararg_buffer16>>2] = $43;
  (_fprintf(($42|0),(304|0),($vararg_buffer16|0))|0);
  _exit(-1);
  // unreachable;
 }
 $44 = HEAP32[16>>2]|0;
 $45 = (_clSetKernelArg(($44|0),7,4,(8|0))|0);
 $status = $45;
 $46 = $status;
 $47 = ($46|0)!=(0);
 if ($47) {
  $48 = HEAP32[_stderr>>2]|0;
  $49 = $status;
  HEAP32[$vararg_buffer19>>2] = $49;
  (_fprintf(($48|0),(344|0),($vararg_buffer19|0))|0);
  _exit(-1);
  // unreachable;
 }
 $50 = HEAP32[16>>2]|0;
 $51 = (_clSetKernelArg(($50|0),8,4,(384|0))|0);
 $status = $51;
 $52 = $status;
 $53 = ($52|0)!=(0);
 if ($53) {
  $54 = HEAP32[_stderr>>2]|0;
  $55 = $status;
  HEAP32[$vararg_buffer22>>2] = $55;
  (_fprintf(($54|0),(392|0),($vararg_buffer22|0))|0);
  _exit(-1);
  // unreachable;
 }
 $56 = HEAP32[8>>2]|0;
 $57 = ($56|0)<(20);
 if ($57) {
  _ExecuteKernel();
  $58 = HEAP32[8>>2]|0;
  $59 = (($58) + 1)|0;
  HEAP32[8>>2] = $59;
 } else {
  $60 = HEAP32[8>>2]|0;
  $61 = (($60) - 20)|0;
  $62 = ($61|0)<(100);
  if ($62) {
   $63 = HEAP32[8>>2]|0;
   $64 = (($63) - 20)|0;
   $66 = $64;
  } else {
   $66 = 100;
  }
  $65 = (+($66|0));
  $67 = $65 / 100.0;
  $k = $67;
  $68 = $k;
  $69 = 0.5 * $68;
  $tresholdTime = $69;
  while(1) {
   _ExecuteKernel();
   $70 = HEAP32[432>>2]|0;
   (_clFinish(($70|0))|0);
   $71 = HEAP32[8>>2]|0;
   $72 = (($71) + 1)|0;
   HEAP32[8>>2] = $72;
   $73 = (+_WallClockTime());
   $74 = $startTime;
   $75 = $73 - $74;
   $76 = $75;
   $elapsedTime = $76;
   $77 = $elapsedTime;
   $78 = $tresholdTime;
   $79 = $77 > $78;
   if ($79) {
    break;
   }
  }
 }
 $80 = HEAP32[432>>2]|0;
 $81 = HEAP32[384>>2]|0;
 $82 = HEAP32[3368>>2]|0;
 $83 = HEAP32[3376>>2]|0;
 $84 = Math_imul($82, $83)|0;
 $85 = $84<<2;
 $86 = HEAP32[3760>>2]|0;
 $87 = (_clEnqueueReadBuffer(($80|0),($81|0),1,0,($85|0),($86|0),0,(0|0),(0|0))|0);
 $status = $87;
 $88 = $status;
 $89 = ($88|0)!=(0);
 if ($89) {
  $90 = HEAP32[_stderr>>2]|0;
  $91 = $status;
  HEAP32[$vararg_buffer25>>2] = $91;
  (_fprintf(($90|0),(440|0),($vararg_buffer25|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  $92 = (+_WallClockTime());
  $93 = $startTime;
  $94 = $92 - $93;
  $elapsedTime1 = $94;
  $95 = HEAP32[8>>2]|0;
  $96 = $startSampleCount;
  $97 = (($95) - ($96))|0;
  $samples = $97;
  $98 = $samples;
  $99 = HEAP32[3376>>2]|0;
  $100 = Math_imul($98, $99)|0;
  $101 = HEAP32[3368>>2]|0;
  $102 = Math_imul($100, $101)|0;
  $103 = (+($102|0));
  $104 = $elapsedTime1;
  $105 = $103 / $104;
  $sampleSec = $105;
  $106 = $elapsedTime1;
  $107 = HEAP32[8>>2]|0;
  $108 = $sampleSec;
  $109 = $108 / 1000.0;
  HEAPF64[tempDoublePtr>>3]=$106;HEAP32[$vararg_buffer28>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_buffer28+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr31 = (($vararg_buffer28) + 8|0);
  HEAP32[$vararg_ptr31>>2] = $107;
  $vararg_ptr32 = (($vararg_buffer28) + 12|0);
  HEAPF64[tempDoublePtr>>3]=$109;HEAP32[$vararg_ptr32>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr32+4>>2]=HEAP32[tempDoublePtr+4>>2];
  (_sprintf((3896|0),(488|0),($vararg_buffer28|0))|0);
  STACKTOP = sp;return;
 }
}
function _ReInitScene() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $status = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 HEAP32[8>>2] = 0;
 $0 = HEAP32[432>>2]|0;
 $1 = HEAP32[120>>2]|0;
 $2 = HEAP32[216>>2]|0;
 $3 = ($2*44)|0;
 $4 = HEAP32[544>>2]|0;
 $5 = (_clEnqueueWriteBuffer(($0|0),($1|0),1,0,($3|0),($4|0),0,(0|0),(0|0))|0);
 $status = $5;
 $6 = $status;
 $7 = ($6|0)!=(0);
 if ($7) {
  $8 = HEAP32[_stderr>>2]|0;
  $9 = $status;
  HEAP32[$vararg_buffer>>2] = $9;
  (_fprintf(($8|0),(552|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function _ReInit($reallocBuffers) {
 $reallocBuffers = $reallocBuffers|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $status = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $0 = $reallocBuffers;
 $1 = $0;
 $2 = ($1|0)!=(0);
 if ($2) {
  _FreeBuffers();
  _UpdateCamera();
  _AllocateBuffers();
 } else {
  _UpdateCamera();
 }
 $3 = HEAP32[432>>2]|0;
 $4 = HEAP32[168>>2]|0;
 $5 = (_clEnqueueWriteBuffer(($3|0),($4|0),1,0,60,(600|0),0,(0|0),(0|0))|0);
 $status = $5;
 $6 = $status;
 $7 = ($6|0)!=(0);
 if ($7) {
  $8 = HEAP32[_stderr>>2]|0;
  $9 = $status;
  HEAP32[$vararg_buffer>>2] = $9;
  (_fprintf(($8|0),(664|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  HEAP32[8>>2] = 0;
  STACKTOP = sp;return;
 }
}
function _main($argc,$argv) {
 $argc = $argc|0;
 $argv = $argv|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = 0;
 $1 = $argc;
 $2 = $argv;
 HEAP32[3784>>2] = 0;
 $3 = HEAP32[_stderr>>2]|0;
 $4 = $2;
 $5 = HEAP32[$4>>2]|0;
 HEAP32[$vararg_buffer>>2] = $5;
 (_fprintf(($3|0),(712|0),($vararg_buffer|0))|0);
 $6 = HEAP32[_stderr>>2]|0;
 $7 = $2;
 $8 = HEAP32[$7>>2]|0;
 HEAP32[$vararg_buffer1>>2] = $8;
 (_fprintf(($6|0),(728|0),($vararg_buffer1|0))|0);
 $9 = $1;
 $10 = ($9|0)==(7);
 if ($10) {
  $11 = $2;
  $12 = (($11) + 4|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = (_atoi(($13|0))|0);
  HEAP32[912>>2] = $14;
  $15 = $2;
  $16 = (($15) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = (_atoi(($17|0))|0);
  HEAP32[920>>2] = $18;
  $19 = $2;
  $20 = (($19) + 12|0);
  $21 = HEAP32[$20>>2]|0;
  HEAP32[928>>2] = $21;
  $22 = $2;
  $23 = (($22) + 16|0);
  $24 = HEAP32[$23>>2]|0;
  $25 = (_atoi(($24|0))|0);
  HEAP32[3368>>2] = $25;
  $26 = $2;
  $27 = (($26) + 20|0);
  $28 = HEAP32[$27>>2]|0;
  $29 = (_atoi(($28|0))|0);
  HEAP32[3376>>2] = $29;
  $30 = $2;
  $31 = (($30) + 24|0);
  $32 = HEAP32[$31>>2]|0;
  _ReadScene($32);
  _UpdateCamera();
  _SetUpOpenCL();
  $35 = $1;
  $36 = $2;
  _InitGlut($35,$36,1336);
  _glutMainLoop();
  STACKTOP = sp;return 0;
 }
 $33 = $1;
 $34 = ($33|0)==(1);
 if (!($34)) {
  _exit(-1);
  // unreachable;
 }
 HEAP32[544>>2] = 936;
 HEAP32[216>>2] = 9;
 HEAPF32[600>>2] = 50.0;
 HEAPF32[((600 + 4|0))>>2] = 45.0;
 HEAPF32[((600 + 8|0))>>2] = 205.600006103515625;
 HEAPF32[((600 + 12|0))>>2] = 50.0;
 HEAPF32[((600 + 16|0))>>2] = 44.95738983154296875;
 HEAPF32[((600 + 20|0))>>2] = 204.600006103515625;
 _UpdateCamera();
 _SetUpOpenCL();
 $35 = $1;
 $36 = $2;
 _InitGlut($35,$36,1336);
 _glutMainLoop();
 STACKTOP = sp;return 0;
}
function _SetUpOpenCL() {
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
 var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
 var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
 var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buf = 0, $buf4 = 0, $buildLog = 0, $cprops = 0, $cps = 0, $dType = 0, $deviceCount = 0, $deviceFound = 0, $deviceListSize = 0, $devices = 0;
 var $gsize = 0, $gsize6 = 0, $gsize7 = 0, $i = 0, $i1 = 0, $numPlatforms = 0, $pbuf = 0, $platform = 0, $platforms = 0, $prop = 0, $retValSize = 0, $selectedDevice = 0, $sources = 0, $status = 0, $stype = 0, $stype3 = 0, $type = 0, $type2 = 0, $units = 0, $units5 = 0;
 var $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer100 = 0, $vararg_buffer103 = 0, $vararg_buffer106 = 0, $vararg_buffer109 = 0, $vararg_buffer112 = 0, $vararg_buffer13 = 0, $vararg_buffer17 = 0, $vararg_buffer20 = 0, $vararg_buffer24 = 0, $vararg_buffer27 = 0, $vararg_buffer3 = 0, $vararg_buffer31 = 0, $vararg_buffer34 = 0, $vararg_buffer38 = 0, $vararg_buffer40 = 0, $vararg_buffer42 = 0, $vararg_buffer45 = 0;
 var $vararg_buffer48 = 0, $vararg_buffer5 = 0, $vararg_buffer52 = 0, $vararg_buffer55 = 0, $vararg_buffer59 = 0, $vararg_buffer62 = 0, $vararg_buffer66 = 0, $vararg_buffer69 = 0, $vararg_buffer73 = 0, $vararg_buffer76 = 0, $vararg_buffer79 = 0, $vararg_buffer8 = 0, $vararg_buffer82 = 0, $vararg_buffer85 = 0, $vararg_buffer88 = 0, $vararg_buffer91 = 0, $vararg_buffer94 = 0, $vararg_buffer97 = 0, $vararg_ptr16 = 0, $vararg_ptr23 = 0;
 var $vararg_ptr30 = 0, $vararg_ptr37 = 0, $vararg_ptr51 = 0, $vararg_ptr58 = 0, $vararg_ptr65 = 0, $vararg_ptr7 = 0, $vararg_ptr72 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1168|0;
 $vararg_buffer112 = sp + 56|0;
 $vararg_buffer109 = sp + 296|0;
 $vararg_buffer106 = sp + 8|0;
 $vararg_buffer103 = sp + 144|0;
 $vararg_buffer100 = sp + 152|0;
 $vararg_buffer97 = sp + 16|0;
 $vararg_buffer94 = sp + 40|0;
 $vararg_buffer91 = sp + 48|0;
 $vararg_buffer88 = sp + 328|0;
 $vararg_buffer85 = sp + 64|0;
 $vararg_buffer82 = sp + 72|0;
 $vararg_buffer79 = sp + 80|0;
 $vararg_buffer76 = sp + 88|0;
 $vararg_buffer73 = sp + 96|0;
 $vararg_buffer69 = sp + 104|0;
 $vararg_buffer66 = sp + 240|0;
 $vararg_buffer62 = sp + 256|0;
 $vararg_buffer59 = sp + 272|0;
 $vararg_buffer55 = sp + 288|0;
 $vararg_buffer52 = sp + 304|0;
 $vararg_buffer48 = sp + 320|0;
 $vararg_buffer45 = sp + 160|0;
 $vararg_buffer42 = sp + 168|0;
 $vararg_buffer40 = sp + 176|0;
 $vararg_buffer38 = sp + 184|0;
 $vararg_buffer34 = sp + 192|0;
 $vararg_buffer31 = sp + 200|0;
 $vararg_buffer27 = sp + 208|0;
 $vararg_buffer24 = sp + 216|0;
 $vararg_buffer20 = sp + 224|0;
 $vararg_buffer17 = sp + 24|0;
 $vararg_buffer13 = sp;
 $vararg_buffer10 = sp + 112|0;
 $vararg_buffer8 = sp + 120|0;
 $vararg_buffer5 = sp + 248|0;
 $vararg_buffer3 = sp + 32|0;
 $vararg_buffer1 = sp + 128|0;
 $vararg_buffer = sp + 264|0;
 $dType = sp + 136|0;
 $numPlatforms = sp + 400|0;
 $status = sp + 396|0;
 $pbuf = sp + 556|0;
 $devices = sp + 408|0;
 $deviceCount = sp + 368|0;
 $selectedDevice = sp + 380|0;
 $type = sp + 312|0;
 $buf = sp + 656|0;
 $units = sp + 540|0;
 $gsize = sp + 340|0;
 $cps = sp + 544|0;
 $deviceListSize = sp + 376|0;
 $type2 = sp + 232|0;
 $buf4 = sp + 912|0;
 $units5 = sp + 344|0;
 $gsize6 = sp + 364|0;
 $prop = sp + 280|0;
 $sources = sp + 372|0;
 $retValSize = sp + 392|0;
 $gsize7 = sp + 352|0;
 $0 = HEAP32[912>>2]|0;
 $1 = ($0|0)!=(0);
 if ($1) {
  $2 = $dType;
  $3 = $2;
  HEAP32[$3>>2] = 4;
  $4 = (($2) + 4)|0;
  $5 = $4;
  HEAP32[$5>>2] = 0;
 } else {
  $6 = $dType;
  $7 = $6;
  HEAP32[$7>>2] = 2;
  $8 = (($6) + 4)|0;
  $9 = $8;
  HEAP32[$9>>2] = 0;
 }
 $platform = 0;
 $10 = (_clGetPlatformIDs(0,(0|0),($numPlatforms|0))|0);
 HEAP32[$status>>2] = $10;
 $11 = HEAP32[$status>>2]|0;
 $12 = ($11|0)!=(0);
 if ($12) {
  $13 = HEAP32[_stderr>>2]|0;
  (_fprintf(($13|0),(1384|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 }
 $14 = HEAP32[$numPlatforms>>2]|0;
 $15 = ($14>>>0)>(0);
 do {
  if ($15) {
   $16 = HEAP32[$numPlatforms>>2]|0;
   $17 = $16<<2;
   $18 = (_malloc($17)|0);
   $platforms = $18;
   $19 = HEAP32[$numPlatforms>>2]|0;
   $20 = $platforms;
   $21 = (_clGetPlatformIDs(($19|0),($20|0),(0|0))|0);
   HEAP32[$status>>2] = $21;
   $22 = HEAP32[$status>>2]|0;
   $23 = ($22|0)!=(0);
   if ($23) {
    $24 = HEAP32[_stderr>>2]|0;
    (_fprintf(($24|0),(1416|0),($vararg_buffer1|0))|0);
    _exit(-1);
    // unreachable;
   }
   $i = 0;
   while(1) {
    $25 = $i;
    $26 = HEAP32[$numPlatforms>>2]|0;
    $27 = ($25>>>0)<($26>>>0);
    if (!($27)) {
     label = 15;
     break;
    }
    $28 = $i;
    $29 = $platforms;
    $30 = (($29) + ($28<<2)|0);
    $31 = HEAP32[$30>>2]|0;
    $32 = (_clGetPlatformInfo(($31|0),2307,100,($pbuf|0),(0|0))|0);
    HEAP32[$status>>2] = $32;
    $33 = HEAP32[$numPlatforms>>2]|0;
    $34 = $platforms;
    $35 = (_clGetPlatformIDs(($33|0),($34|0),(0|0))|0);
    HEAP32[$status>>2] = $35;
    $36 = HEAP32[$status>>2]|0;
    $37 = ($36|0)!=(0);
    if ($37) {
     label = 12;
     break;
    }
    $39 = HEAP32[_stderr>>2]|0;
    $40 = $i;
    HEAP32[$vararg_buffer5>>2] = $40;
    $vararg_ptr7 = (($vararg_buffer5) + 4|0);
    HEAP32[$vararg_ptr7>>2] = $pbuf;
    (_fprintf(($39|0),(1456|0),($vararg_buffer5|0))|0);
    $41 = $i;
    $42 = (($41) + 1)|0;
    $i = $42;
   }
   if ((label|0) == 12) {
    $38 = HEAP32[_stderr>>2]|0;
    (_fprintf(($38|0),(1416|0),($vararg_buffer3|0))|0);
    _exit(-1);
    // unreachable;
   }
   else if ((label|0) == 15) {
    $43 = $platforms;
    $44 = HEAP32[$43>>2]|0;
    $platform = $44;
    $45 = $platforms;
    _free($45);
    break;
   }
  }
 } while(0);
 $46 = $platform;
 $47 = (_clGetDeviceIDs(($46|0),-1,0,32,($devices|0),($deviceCount|0))|0);
 HEAP32[$status>>2] = $47;
 $48 = HEAP32[$status>>2]|0;
 $49 = ($48|0)!=(0);
 if ($49) {
  $50 = HEAP32[_stderr>>2]|0;
  (_fprintf(($50|0),(1480|0),($vararg_buffer8|0))|0);
  _exit(-1);
  // unreachable;
 }
 $deviceFound = 0;
 $i1 = 0;
 while(1) {
  $51 = $i1;
  $52 = HEAP32[$deviceCount>>2]|0;
  $53 = ($51>>>0)<($52>>>0);
  if (!($53)) {
   break;
  }
  $54 = $type;
  $55 = $54;
  HEAP32[$55>>2] = 0;
  $56 = (($54) + 4)|0;
  $57 = $56;
  HEAP32[$57>>2] = 0;
  $58 = $i1;
  $59 = (($devices) + ($58<<2)|0);
  $60 = HEAP32[$59>>2]|0;
  $61 = (_clGetDeviceInfo(($60|0),4096,8,($type|0),(0|0))|0);
  HEAP32[$status>>2] = $61;
  $62 = HEAP32[$status>>2]|0;
  $63 = ($62|0)!=(0);
  if ($63) {
   $64 = HEAP32[_stderr>>2]|0;
   $65 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer10>>2] = $65;
   (_fprintf(($64|0),(1520|0),($vararg_buffer10|0))|0);
  }
  $66 = $type;
  $67 = $66;
  $68 = HEAP32[$67>>2]|0;
  $69 = (($66) + 4)|0;
  $70 = $69;
  $71 = HEAP32[$70>>2]|0;
  if ((($68|0) == 1)) {
   if ((($71|0) == 0)) {
    $stype = 1576;
   } else {
    label = 37;
   }
  } else if ((($68|0) == 2)) {
   if ((($71|0) == 0)) {
    $stype = 1592;
    $72 = HEAP32[912>>2]|0;
    $73 = ($72|0)!=(0);
    if (!($73)) {
     $74 = $deviceFound;
     $75 = ($74|0)!=(0);
     if (!($75)) {
      $76 = $i1;
      $77 = (($devices) + ($76<<2)|0);
      $78 = HEAP32[$77>>2]|0;
      HEAP32[$selectedDevice>>2] = $78;
      $deviceFound = 1;
     }
    }
   } else {
    label = 37;
   }
  } else if ((($68|0) == 4)) {
   if ((($71|0) == 0)) {
    $stype = 1608;
    $79 = HEAP32[912>>2]|0;
    $80 = ($79|0)!=(0);
    if ($80) {
     $81 = $deviceFound;
     $82 = ($81|0)!=(0);
     if (!($82)) {
      $83 = $i1;
      $84 = (($devices) + ($83<<2)|0);
      $85 = HEAP32[$84>>2]|0;
      HEAP32[$selectedDevice>>2] = $85;
      $deviceFound = 1;
     }
    }
   } else {
    label = 37;
   }
  } else if ((($68|0) == -1)) {
   if ((($71|0) == 0)) {
    $stype = 1560;
   } else {
    label = 37;
   }
  } else {
   label = 37;
  }
  if ((label|0) == 37) {
   label = 0;
   $stype = 1624;
  }
  $86 = HEAP32[_stderr>>2]|0;
  $87 = $i1;
  $88 = $stype;
  HEAP32[$vararg_buffer13>>2] = $87;
  $vararg_ptr16 = (($vararg_buffer13) + 4|0);
  HEAP32[$vararg_ptr16>>2] = $88;
  (_fprintf(($86|0),(1640|0),($vararg_buffer13|0))|0);
  $89 = $i1;
  $90 = (($devices) + ($89<<2)|0);
  $91 = HEAP32[$90>>2]|0;
  $92 = (_clGetDeviceInfo(($91|0),4139,256,($buf|0),(0|0))|0);
  HEAP32[$status>>2] = $92;
  $93 = HEAP32[$status>>2]|0;
  $94 = ($93|0)!=(0);
  if ($94) {
   $95 = HEAP32[_stderr>>2]|0;
   $96 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer17>>2] = $96;
   (_fprintf(($95|0),(1520|0),($vararg_buffer17|0))|0);
  }
  $97 = HEAP32[_stderr>>2]|0;
  $98 = $i1;
  HEAP32[$vararg_buffer20>>2] = $98;
  $vararg_ptr23 = (($vararg_buffer20) + 4|0);
  HEAP32[$vararg_ptr23>>2] = $buf;
  (_fprintf(($97|0),(1672|0),($vararg_buffer20|0))|0);
  HEAP32[$units>>2] = 0;
  $99 = $i1;
  $100 = (($devices) + ($99<<2)|0);
  $101 = HEAP32[$100>>2]|0;
  $102 = (_clGetDeviceInfo(($101|0),4098,4,($units|0),(0|0))|0);
  HEAP32[$status>>2] = $102;
  $103 = HEAP32[$status>>2]|0;
  $104 = ($103|0)!=(0);
  if ($104) {
   $105 = HEAP32[_stderr>>2]|0;
   $106 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer24>>2] = $106;
   (_fprintf(($105|0),(1520|0),($vararg_buffer24|0))|0);
  }
  $107 = HEAP32[_stderr>>2]|0;
  $108 = $i1;
  $109 = HEAP32[$units>>2]|0;
  HEAP32[$vararg_buffer27>>2] = $108;
  $vararg_ptr30 = (($vararg_buffer27) + 4|0);
  HEAP32[$vararg_ptr30>>2] = $109;
  (_fprintf(($107|0),(1704|0),($vararg_buffer27|0))|0);
  HEAP32[$gsize>>2] = 0;
  $110 = $i1;
  $111 = (($devices) + ($110<<2)|0);
  $112 = HEAP32[$111>>2]|0;
  $113 = (_clGetDeviceInfo(($112|0),4100,4,($gsize|0),(0|0))|0);
  HEAP32[$status>>2] = $113;
  $114 = HEAP32[$status>>2]|0;
  $115 = ($114|0)!=(0);
  if ($115) {
   $116 = HEAP32[_stderr>>2]|0;
   $117 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer31>>2] = $117;
   (_fprintf(($116|0),(1520|0),($vararg_buffer31|0))|0);
  }
  $118 = HEAP32[_stderr>>2]|0;
  $119 = $i1;
  $120 = HEAP32[$gsize>>2]|0;
  HEAP32[$vararg_buffer34>>2] = $119;
  $vararg_ptr37 = (($vararg_buffer34) + 4|0);
  HEAP32[$vararg_ptr37>>2] = $120;
  (_fprintf(($118|0),(1744|0),($vararg_buffer34|0))|0);
  $121 = $i1;
  $122 = (($121) + 1)|0;
  $i1 = $122;
 }
 $123 = $deviceFound;
 $124 = ($123|0)!=(0);
 if (!($124)) {
  $125 = HEAP32[_stderr>>2]|0;
  (_fprintf(($125|0),(1792|0),($vararg_buffer38|0))|0);
  _exit(-1);
  // unreachable;
 }
 HEAP32[$cps>>2] = 4228;
 $126 = (($cps) + 4|0);
 $127 = $platform;
 $128 = $127;
 HEAP32[$126>>2] = $128;
 $129 = (($126) + 4|0);
 HEAP32[$129>>2] = 0;
 $130 = $platform;
 $131 = (0|0)==($130|0);
 if ($131) {
  $132 = 0;
 } else {
  $132 = $cps;
 }
 $cprops = $132;
 $133 = $cprops;
 $134 = (_clCreateContext(($133|0),1,($selectedDevice|0),(0|0),(0|0),($status|0))|0);
 HEAP32[1832>>2] = $134;
 $135 = HEAP32[$status>>2]|0;
 $136 = ($135|0)!=(0);
 if ($136) {
  $137 = HEAP32[_stderr>>2]|0;
  (_fprintf(($137|0),(1840|0),($vararg_buffer40|0))|0);
  _exit(-1);
  // unreachable;
 }
 $138 = HEAP32[1832>>2]|0;
 $139 = (_clGetContextInfo(($138|0),4225,32,($devices|0),($deviceListSize|0))|0);
 HEAP32[$status>>2] = $139;
 $140 = HEAP32[$status>>2]|0;
 $141 = ($140|0)!=(0);
 if ($141) {
  $142 = HEAP32[_stderr>>2]|0;
  $143 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer42>>2] = $143;
  (_fprintf(($142|0),(1872|0),($vararg_buffer42|0))|0);
  _exit(-1);
  // unreachable;
 }
 $i1 = 0;
 while(1) {
  $144 = $i1;
  $145 = HEAP32[$deviceListSize>>2]|0;
  $146 = (($145>>>0) / 4)&-1;
  $147 = ($144>>>0)<($146>>>0);
  if (!($147)) {
   break;
  }
  $148 = $type2;
  $149 = $148;
  HEAP32[$149>>2] = 0;
  $150 = (($148) + 4)|0;
  $151 = $150;
  HEAP32[$151>>2] = 0;
  $152 = $i1;
  $153 = (($devices) + ($152<<2)|0);
  $154 = HEAP32[$153>>2]|0;
  $155 = (_clGetDeviceInfo(($154|0),4096,8,($type2|0),(0|0))|0);
  HEAP32[$status>>2] = $155;
  $156 = HEAP32[$status>>2]|0;
  $157 = ($156|0)!=(0);
  if ($157) {
   $158 = HEAP32[_stderr>>2]|0;
   $159 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer45>>2] = $159;
   (_fprintf(($158|0),(1520|0),($vararg_buffer45|0))|0);
  }
  $160 = $type2;
  $161 = $160;
  $162 = HEAP32[$161>>2]|0;
  $163 = (($160) + 4)|0;
  $164 = $163;
  $165 = HEAP32[$164>>2]|0;
  if ((($162|0) == 1)) {
   if ((($165|0) == 0)) {
    $stype3 = 1576;
   } else {
    label = 68;
   }
  } else if ((($162|0) == 2)) {
   if ((($165|0) == 0)) {
    $stype3 = 1592;
   } else {
    label = 68;
   }
  } else if ((($162|0) == 4)) {
   if ((($165|0) == 0)) {
    $stype3 = 1608;
   } else {
    label = 68;
   }
  } else if ((($162|0) == -1)) {
   if ((($165|0) == 0)) {
    $stype3 = 1560;
   } else {
    label = 68;
   }
  } else {
   label = 68;
  }
  if ((label|0) == 68) {
   label = 0;
   $stype3 = 1624;
  }
  $166 = HEAP32[_stderr>>2]|0;
  $167 = $i1;
  $168 = $stype3;
  HEAP32[$vararg_buffer48>>2] = $167;
  $vararg_ptr51 = (($vararg_buffer48) + 4|0);
  HEAP32[$vararg_ptr51>>2] = $168;
  (_fprintf(($166|0),(1912|0),($vararg_buffer48|0))|0);
  $169 = $i1;
  $170 = (($devices) + ($169<<2)|0);
  $171 = HEAP32[$170>>2]|0;
  $172 = (_clGetDeviceInfo(($171|0),4139,256,($buf4|0),(0|0))|0);
  HEAP32[$status>>2] = $172;
  $173 = HEAP32[$status>>2]|0;
  $174 = ($173|0)!=(0);
  if ($174) {
   $175 = HEAP32[_stderr>>2]|0;
   $176 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer52>>2] = $176;
   (_fprintf(($175|0),(1520|0),($vararg_buffer52|0))|0);
  }
  $177 = HEAP32[_stderr>>2]|0;
  $178 = $i1;
  HEAP32[$vararg_buffer55>>2] = $178;
  $vararg_ptr58 = (($vararg_buffer55) + 4|0);
  HEAP32[$vararg_ptr58>>2] = $buf4;
  (_fprintf(($177|0),(1952|0),($vararg_buffer55|0))|0);
  HEAP32[$units5>>2] = 0;
  $179 = $i1;
  $180 = (($devices) + ($179<<2)|0);
  $181 = HEAP32[$180>>2]|0;
  $182 = (_clGetDeviceInfo(($181|0),4098,4,($units5|0),(0|0))|0);
  HEAP32[$status>>2] = $182;
  $183 = HEAP32[$status>>2]|0;
  $184 = ($183|0)!=(0);
  if ($184) {
   $185 = HEAP32[_stderr>>2]|0;
   $186 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer59>>2] = $186;
   (_fprintf(($185|0),(1520|0),($vararg_buffer59|0))|0);
  }
  $187 = HEAP32[_stderr>>2]|0;
  $188 = $i1;
  $189 = HEAP32[$units5>>2]|0;
  HEAP32[$vararg_buffer62>>2] = $188;
  $vararg_ptr65 = (($vararg_buffer62) + 4|0);
  HEAP32[$vararg_ptr65>>2] = $189;
  (_fprintf(($187|0),(1992|0),($vararg_buffer62|0))|0);
  HEAP32[$gsize6>>2] = 0;
  $190 = $i1;
  $191 = (($devices) + ($190<<2)|0);
  $192 = HEAP32[$191>>2]|0;
  $193 = (_clGetDeviceInfo(($192|0),4100,4,($gsize6|0),(0|0))|0);
  HEAP32[$status>>2] = $193;
  $194 = HEAP32[$status>>2]|0;
  $195 = ($194|0)!=(0);
  if ($195) {
   $196 = HEAP32[_stderr>>2]|0;
   $197 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer66>>2] = $197;
   (_fprintf(($196|0),(1520|0),($vararg_buffer66|0))|0);
  }
  $198 = HEAP32[_stderr>>2]|0;
  $199 = $i1;
  $200 = HEAP32[$gsize6>>2]|0;
  HEAP32[$vararg_buffer69>>2] = $199;
  $vararg_ptr72 = (($vararg_buffer69) + 4|0);
  HEAP32[$vararg_ptr72>>2] = $200;
  (_fprintf(($198|0),(2048|0),($vararg_buffer69|0))|0);
  $201 = $i1;
  $202 = (($201) + 1)|0;
  $i1 = $202;
 }
 $203 = $prop;
 $204 = $203;
 HEAP32[$204>>2] = 0;
 $205 = (($203) + 4)|0;
 $206 = $205;
 HEAP32[$206>>2] = 0;
 $207 = HEAP32[1832>>2]|0;
 $208 = HEAP32[$devices>>2]|0;
 $209 = $prop;
 $210 = $209;
 $211 = HEAP32[$210>>2]|0;
 $212 = (($209) + 4)|0;
 $213 = $212;
 $214 = HEAP32[$213>>2]|0;
 $215 = (_clCreateCommandQueue(($207|0),($208|0),($211|0),($214|0),($status|0))|0);
 HEAP32[432>>2] = $215;
 $216 = HEAP32[$status>>2]|0;
 $217 = ($216|0)!=(0);
 if ($217) {
  $218 = HEAP32[_stderr>>2]|0;
  $219 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer73>>2] = $219;
  (_fprintf(($218|0),(2104|0),($vararg_buffer73|0))|0);
  _exit(-1);
  // unreachable;
 }
 $220 = HEAP32[1832>>2]|0;
 $221 = HEAP32[216>>2]|0;
 $222 = ($221*44)|0;
 $223 = (_clCreateBuffer(($220|0),4,0,($222|0),(0|0),($status|0))|0);
 HEAP32[120>>2] = $223;
 $224 = HEAP32[$status>>2]|0;
 $225 = ($224|0)!=(0);
 if ($225) {
  $226 = HEAP32[_stderr>>2]|0;
  $227 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer76>>2] = $227;
  (_fprintf(($226|0),(2152|0),($vararg_buffer76|0))|0);
  _exit(-1);
  // unreachable;
 }
 $228 = HEAP32[432>>2]|0;
 $229 = HEAP32[120>>2]|0;
 $230 = HEAP32[216>>2]|0;
 $231 = ($230*44)|0;
 $232 = HEAP32[544>>2]|0;
 $233 = (_clEnqueueWriteBuffer(($228|0),($229|0),1,0,($231|0),($232|0),0,(0|0),(0|0))|0);
 HEAP32[$status>>2] = $233;
 $234 = HEAP32[$status>>2]|0;
 $235 = ($234|0)!=(0);
 if ($235) {
  $236 = HEAP32[_stderr>>2]|0;
  $237 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer79>>2] = $237;
  (_fprintf(($236|0),(552|0),($vararg_buffer79|0))|0);
  _exit(-1);
  // unreachable;
 }
 $238 = HEAP32[1832>>2]|0;
 $239 = (_clCreateBuffer(($238|0),4,0,60,(0|0),($status|0))|0);
 HEAP32[168>>2] = $239;
 $240 = HEAP32[$status>>2]|0;
 $241 = ($240|0)!=(0);
 if ($241) {
  $242 = HEAP32[_stderr>>2]|0;
  $243 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer82>>2] = $243;
  (_fprintf(($242|0),(2200|0),($vararg_buffer82|0))|0);
  _exit(-1);
  // unreachable;
 }
 $244 = HEAP32[432>>2]|0;
 $245 = HEAP32[168>>2]|0;
 $246 = (_clEnqueueWriteBuffer(($244|0),($245|0),1,0,60,(600|0),0,(0|0),(0|0))|0);
 HEAP32[$status>>2] = $246;
 $247 = HEAP32[$status>>2]|0;
 $248 = ($247|0)!=(0);
 if ($248) {
  $249 = HEAP32[_stderr>>2]|0;
  $250 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer85>>2] = $250;
  (_fprintf(($249|0),(664|0),($vararg_buffer85|0))|0);
  _exit(-1);
  // unreachable;
 }
 _AllocateBuffers();
 $251 = HEAP32[928>>2]|0;
 $252 = (_ReadSources($251)|0);
 HEAP32[$sources>>2] = $252;
 $253 = HEAP32[1832>>2]|0;
 $254 = (_clCreateProgramWithSource(($253|0),1,($sources|0),(0|0),($status|0))|0);
 HEAP32[2248>>2] = $254;
 $255 = HEAP32[$status>>2]|0;
 $256 = ($255|0)!=(0);
 if ($256) {
  $257 = HEAP32[_stderr>>2]|0;
  $258 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer88>>2] = $258;
  (_fprintf(($257|0),(2256|0),($vararg_buffer88|0))|0);
  _exit(-1);
  // unreachable;
 }
 $259 = HEAP32[2248>>2]|0;
 $260 = (_clBuildProgram(($259|0),1,($devices|0),(2304|0),(0|0),(0|0))|0);
 HEAP32[$status>>2] = $260;
 $261 = HEAP32[$status>>2]|0;
 $262 = ($261|0)!=(0);
 if ($262) {
  $263 = HEAP32[_stderr>>2]|0;
  $264 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer91>>2] = $264;
  (_fprintf(($263|0),(2312|0),($vararg_buffer91|0))|0);
  $265 = HEAP32[2248>>2]|0;
  $266 = HEAP32[$devices>>2]|0;
  $267 = (_clGetProgramBuildInfo(($265|0),($266|0),4483,0,(0|0),($retValSize|0))|0);
  HEAP32[$status>>2] = $267;
  $268 = HEAP32[$status>>2]|0;
  $269 = ($268|0)!=(0);
  if ($269) {
   $270 = HEAP32[_stderr>>2]|0;
   $271 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer94>>2] = $271;
   (_fprintf(($270|0),(2352|0),($vararg_buffer94|0))|0);
   _exit(-1);
   // unreachable;
  }
  $272 = HEAP32[$retValSize>>2]|0;
  $273 = (($272) + 1)|0;
  $274 = (_malloc($273)|0);
  $buildLog = $274;
  $275 = HEAP32[2248>>2]|0;
  $276 = HEAP32[$devices>>2]|0;
  $277 = HEAP32[$retValSize>>2]|0;
  $278 = $buildLog;
  $279 = (_clGetProgramBuildInfo(($275|0),($276|0),4483,($277|0),($278|0),(0|0))|0);
  HEAP32[$status>>2] = $279;
  $280 = HEAP32[$status>>2]|0;
  $281 = ($280|0)!=(0);
  if ($281) {
   $282 = HEAP32[_stderr>>2]|0;
   $283 = HEAP32[$status>>2]|0;
   HEAP32[$vararg_buffer97>>2] = $283;
   (_fprintf(($282|0),(2400|0),($vararg_buffer97|0))|0);
   _exit(-1);
   // unreachable;
  } else {
   $284 = HEAP32[$retValSize>>2]|0;
   $285 = $buildLog;
   $286 = (($285) + ($284)|0);
   HEAP8[$286] = 0;
   $287 = HEAP32[_stderr>>2]|0;
   $288 = $buildLog;
   HEAP32[$vararg_buffer100>>2] = $288;
   (_fprintf(($287|0),(2440|0),($vararg_buffer100|0))|0);
   _exit(-1);
   // unreachable;
  }
 }
 $289 = HEAP32[2248>>2]|0;
 $290 = (_clCreateKernel(($289|0),(2472|0),($status|0))|0);
 HEAP32[16>>2] = $290;
 $291 = HEAP32[$status>>2]|0;
 $292 = ($291|0)!=(0);
 if ($292) {
  $293 = HEAP32[_stderr>>2]|0;
  $294 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer103>>2] = $294;
  (_fprintf(($293|0),(2488|0),($vararg_buffer103|0))|0);
  _exit(-1);
  // unreachable;
 }
 HEAP32[$gsize7>>2] = 0;
 $295 = HEAP32[16>>2]|0;
 $296 = HEAP32[$devices>>2]|0;
 $297 = (_clGetKernelWorkGroupInfo(($295|0),($296|0),4528,4,($gsize7|0),(0|0))|0);
 HEAP32[$status>>2] = $297;
 $298 = HEAP32[$status>>2]|0;
 $299 = ($298|0)!=(0);
 if ($299) {
  $300 = HEAP32[_stderr>>2]|0;
  $301 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer106>>2] = $301;
  (_fprintf(($300|0),(2528|0),($vararg_buffer106|0))|0);
  _exit(-1);
  // unreachable;
 }
 $302 = HEAP32[$gsize7>>2]|0;
 HEAP32[2584>>2] = $302;
 $303 = HEAP32[_stderr>>2]|0;
 $304 = HEAP32[2584>>2]|0;
 HEAP32[$vararg_buffer109>>2] = $304;
 (_fprintf(($303|0),(2592|0),($vararg_buffer109|0))|0);
 $305 = HEAP32[920>>2]|0;
 $306 = ($305|0)>(0);
 if (!($306)) {
  STACKTOP = sp;return;
 }
 $307 = HEAP32[_stderr>>2]|0;
 $308 = HEAP32[920>>2]|0;
 HEAP32[$vararg_buffer112>>2] = $308;
 (_fprintf(($307|0),(2640|0),($vararg_buffer112|0))|0);
 $309 = HEAP32[920>>2]|0;
 HEAP32[2584>>2] = $309;
 STACKTOP = sp;return;
}
function _ReadSources($fileName) {
 $fileName = $fileName|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $file = 0, $res = 0, $size = 0, $src = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer14 = 0, $vararg_buffer4 = 0, $vararg_buffer7 = 0, $vararg_ptr13 = 0, $vararg_ptr17 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $vararg_buffer14 = sp + 40|0;
 $vararg_buffer10 = sp + 24|0;
 $vararg_buffer7 = sp + 32|0;
 $vararg_buffer4 = sp + 16|0;
 $vararg_buffer1 = sp;
 $vararg_buffer = sp + 8|0;
 $0 = $fileName;
 $1 = $0;
 $2 = (_fopen(($1|0),(2696|0))|0);
 $file = $2;
 $3 = $file;
 $4 = ($3|0)!=(0|0);
 if (!($4)) {
  $5 = HEAP32[_stderr>>2]|0;
  $6 = $0;
  HEAP32[$vararg_buffer>>2] = $6;
  (_fprintf(($5|0),(2704|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 }
 $7 = $file;
 $8 = (_fseek(($7|0),0,2)|0);
 $9 = ($8|0)!=(0);
 if ($9) {
  $10 = HEAP32[_stderr>>2]|0;
  $11 = $0;
  HEAP32[$vararg_buffer1>>2] = $11;
  (_fprintf(($10|0),(2736|0),($vararg_buffer1|0))|0);
  _exit(-1);
  // unreachable;
 }
 $12 = $file;
 $13 = (_ftell(($12|0))|0);
 $size = $13;
 $14 = $size;
 $15 = ($14|0)==(0);
 if ($15) {
  $16 = HEAP32[_stderr>>2]|0;
  $17 = $0;
  HEAP32[$vararg_buffer4>>2] = $17;
  (_fprintf(($16|0),(2768|0),($vararg_buffer4|0))|0);
  _exit(-1);
  // unreachable;
 }
 $18 = $file;
 _rewind(($18|0));
 $19 = $size;
 $20 = $19;
 $21 = (($20) + 1)|0;
 $22 = (_malloc($21)|0);
 $src = $22;
 $23 = $src;
 $24 = ($23|0)!=(0|0);
 if (!($24)) {
  $25 = HEAP32[_stderr>>2]|0;
  $26 = $0;
  HEAP32[$vararg_buffer7>>2] = $26;
  (_fprintf(($25|0),(2808|0),($vararg_buffer7|0))|0);
  _exit(-1);
  // unreachable;
 }
 $27 = HEAP32[_stderr>>2]|0;
 $28 = $0;
 $29 = $size;
 HEAP32[$vararg_buffer10>>2] = $28;
 $vararg_ptr13 = (($vararg_buffer10) + 4|0);
 HEAP32[$vararg_ptr13>>2] = $29;
 (_fprintf(($27|0),(2856|0),($vararg_buffer10|0))|0);
 $30 = $src;
 $31 = $size;
 $32 = $31;
 $33 = $file;
 $34 = (_fread(($30|0),1,($32|0),($33|0))|0);
 $res = $34;
 $35 = $res;
 $36 = $size;
 $37 = $36;
 $38 = ($35|0)!=($37|0);
 if ($38) {
  $39 = HEAP32[_stderr>>2]|0;
  $40 = $0;
  $41 = $res;
  HEAP32[$vararg_buffer14>>2] = $40;
  $vararg_ptr17 = (($vararg_buffer14) + 4|0);
  HEAP32[$vararg_ptr17>>2] = $41;
  (_fprintf(($39|0),(2896|0),($vararg_buffer14|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  $42 = $size;
  $43 = $src;
  $44 = (($43) + ($42)|0);
  HEAP8[$44] = 0;
  $45 = $file;
  (_fclose(($45|0))|0);
  $46 = $src;
  STACKTOP = sp;return ($46|0);
 }
 return 0|0;
}
function _AllocateBuffers() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $9 = 0, $i = 0, $pixelCount = 0, $sizeBytes = 0, $status = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer4 = 0, $vararg_buffer7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $vararg_buffer7 = sp + 24|0;
 $vararg_buffer4 = sp + 8|0;
 $vararg_buffer1 = sp;
 $vararg_buffer = sp + 16|0;
 $status = sp + 28|0;
 $0 = HEAP32[3368>>2]|0;
 $1 = HEAP32[3376>>2]|0;
 $2 = Math_imul($0, $1)|0;
 $pixelCount = $2;
 $3 = $pixelCount;
 $4 = ($3*12)|0;
 $5 = (_malloc($4)|0);
 HEAP32[2976>>2] = $5;
 $6 = $pixelCount;
 $7 = $6<<2;
 $8 = $7<<1;
 $9 = (_malloc($8)|0);
 HEAP32[2984>>2] = $9;
 $i = 0;
 while(1) {
  $10 = $i;
  $11 = $pixelCount;
  $12 = $11<<1;
  $13 = ($10|0)<($12|0);
  if (!($13)) {
   break;
  }
  $14 = (_rand()|0);
  $15 = $i;
  $16 = HEAP32[2984>>2]|0;
  $17 = (($16) + ($15<<2)|0);
  HEAP32[$17>>2] = $14;
  $18 = $i;
  $19 = HEAP32[2984>>2]|0;
  $20 = (($19) + ($18<<2)|0);
  $21 = HEAP32[$20>>2]|0;
  $22 = ($21>>>0)<(2);
  if ($22) {
   $23 = $i;
   $24 = HEAP32[2984>>2]|0;
   $25 = (($24) + ($23<<2)|0);
   HEAP32[$25>>2] = 2;
  }
  $26 = $i;
  $27 = (($26) + 1)|0;
  $i = $27;
 }
 $28 = $pixelCount;
 $29 = $28<<2;
 $30 = (_malloc($29)|0);
 HEAP32[3760>>2] = $30;
 $i = 0;
 while(1) {
  $31 = $i;
  $32 = $pixelCount;
  $33 = ($31|0)<($32|0);
  if (!($33)) {
   break;
  }
  $34 = $i;
  $35 = $i;
  $36 = HEAP32[3760>>2]|0;
  $37 = (($36) + ($35<<2)|0);
  HEAP32[$37>>2] = $34;
  $38 = $i;
  $39 = (($38) + 1)|0;
  $i = $39;
 }
 $40 = HEAP32[3368>>2]|0;
 $41 = ($40*12)|0;
 $42 = HEAP32[3376>>2]|0;
 $43 = Math_imul($41, $42)|0;
 $sizeBytes = $43;
 $44 = HEAP32[1832>>2]|0;
 $45 = $sizeBytes;
 $46 = (_clCreateBuffer(($44|0),1,0,($45|0),(0|0),($status|0))|0);
 HEAP32[24>>2] = $46;
 $47 = HEAP32[$status>>2]|0;
 $48 = ($47|0)!=(0);
 if ($48) {
  $49 = HEAP32[_stderr>>2]|0;
  $50 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer>>2] = $50;
  (_fprintf(($49|0),(2992|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 }
 $51 = HEAP32[3368>>2]|0;
 $52 = $51<<2;
 $53 = HEAP32[3376>>2]|0;
 $54 = Math_imul($52, $53)|0;
 $sizeBytes = $54;
 $55 = HEAP32[1832>>2]|0;
 $56 = $sizeBytes;
 $57 = (_clCreateBuffer(($55|0),2,0,($56|0),(0|0),($status|0))|0);
 HEAP32[384>>2] = $57;
 $58 = HEAP32[$status>>2]|0;
 $59 = ($58|0)!=(0);
 if ($59) {
  $60 = HEAP32[_stderr>>2]|0;
  $61 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer1>>2] = $61;
  (_fprintf(($60|0),(3040|0),($vararg_buffer1|0))|0);
  _exit(-1);
  // unreachable;
 }
 $62 = HEAP32[3368>>2]|0;
 $63 = $62<<2;
 $64 = HEAP32[3376>>2]|0;
 $65 = Math_imul($63, $64)|0;
 $66 = $65<<1;
 $sizeBytes = $66;
 $67 = HEAP32[1832>>2]|0;
 $68 = $sizeBytes;
 $69 = (_clCreateBuffer(($67|0),1,0,($68|0),(0|0),($status|0))|0);
 HEAP32[72>>2] = $69;
 $70 = HEAP32[$status>>2]|0;
 $71 = ($70|0)!=(0);
 if ($71) {
  $72 = HEAP32[_stderr>>2]|0;
  $73 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer4>>2] = $73;
  (_fprintf(($72|0),(3088|0),($vararg_buffer4|0))|0);
  _exit(-1);
  // unreachable;
 }
 $74 = HEAP32[432>>2]|0;
 $75 = HEAP32[72>>2]|0;
 $76 = $sizeBytes;
 $77 = HEAP32[2984>>2]|0;
 $78 = (_clEnqueueWriteBuffer(($74|0),($75|0),1,0,($76|0),($77|0),0,(0|0),(0|0))|0);
 HEAP32[$status>>2] = $78;
 $79 = HEAP32[$status>>2]|0;
 $80 = ($79|0)!=(0);
 if ($80) {
  $81 = HEAP32[_stderr>>2]|0;
  $82 = HEAP32[$status>>2]|0;
  HEAP32[$vararg_buffer7>>2] = $82;
  (_fprintf(($81|0),(3136|0),($vararg_buffer7|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function _FreeBuffers() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $status = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $vararg_buffer4 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = HEAP32[24>>2]|0;
 $1 = (_clReleaseMemObject(($0|0))|0);
 $status = $1;
 $2 = $status;
 $3 = ($2|0)!=(0);
 if ($3) {
  $4 = HEAP32[_stderr>>2]|0;
  $5 = $status;
  HEAP32[$vararg_buffer>>2] = $5;
  (_fprintf(($4|0),(3184|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 }
 $6 = HEAP32[384>>2]|0;
 $7 = (_clReleaseMemObject(($6|0))|0);
 $status = $7;
 $8 = $status;
 $9 = ($8|0)!=(0);
 if ($9) {
  $10 = HEAP32[_stderr>>2]|0;
  $11 = $status;
  HEAP32[$vararg_buffer1>>2] = $11;
  (_fprintf(($10|0),(3232|0),($vararg_buffer1|0))|0);
  _exit(-1);
  // unreachable;
 }
 $12 = HEAP32[72>>2]|0;
 $13 = (_clReleaseMemObject(($12|0))|0);
 $status = $13;
 $14 = $status;
 $15 = ($14|0)!=(0);
 if ($15) {
  $16 = HEAP32[_stderr>>2]|0;
  $17 = $status;
  HEAP32[$vararg_buffer4>>2] = $17;
  (_fprintf(($16|0),(3280|0),($vararg_buffer4|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  $18 = HEAP32[2984>>2]|0;
  _free($18);
  $19 = HEAP32[2976>>2]|0;
  _free($19);
  $20 = HEAP32[3760>>2]|0;
  _free($20);
  STACKTOP = sp;return;
 }
}
function _ExecuteKernel() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $globalThreads = 0, $localThreads = 0, $status = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $globalThreads = sp + 12|0;
 $localThreads = sp + 8|0;
 $0 = HEAP32[3368>>2]|0;
 $1 = HEAP32[3376>>2]|0;
 $2 = Math_imul($0, $1)|0;
 HEAP32[$globalThreads>>2] = $2;
 $3 = HEAP32[$globalThreads>>2]|0;
 $4 = HEAP32[2584>>2]|0;
 $5 = (($3>>>0) % ($4>>>0))&-1;
 $6 = ($5|0)!=(0);
 if ($6) {
  $7 = HEAP32[$globalThreads>>2]|0;
  $8 = HEAP32[2584>>2]|0;
  $9 = (($7>>>0) / ($8>>>0))&-1;
  $10 = (($9) + 1)|0;
  $11 = HEAP32[2584>>2]|0;
  $12 = Math_imul($10, $11)|0;
  HEAP32[$globalThreads>>2] = $12;
 }
 $13 = HEAP32[2584>>2]|0;
 HEAP32[$localThreads>>2] = $13;
 $14 = HEAP32[432>>2]|0;
 $15 = HEAP32[16>>2]|0;
 $16 = (_clEnqueueNDRangeKernel(($14|0),($15|0),1,(0|0),($globalThreads|0),($localThreads|0),0,(0|0),(0|0))|0);
 $status = $16;
 $17 = $status;
 $18 = ($17|0)!=(0);
 if ($18) {
  $19 = HEAP32[_stderr>>2]|0;
  $20 = $status;
  HEAP32[$vararg_buffer>>2] = $20;
  (_fprintf(($19|0),(3328|0),($vararg_buffer|0))|0);
  _exit(-1);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function _WallClockTime() {
 var $0 = 0.0, $1 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (+_emscripten_get_now());
 $1 = $0 / 1000.0;
 STACKTOP = sp;return (+$1);
}
function _ReadScene($fileName) {
 $fileName = $fileName|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $8 = 0, $9 = 0, $c = 0, $c1 = 0, $f = 0;
 var $i = 0, $mat = 0, $s = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer12 = 0, $vararg_buffer15 = 0, $vararg_buffer18 = 0, $vararg_buffer21 = 0, $vararg_buffer24 = 0, $vararg_buffer37 = 0, $vararg_buffer4 = 0, $vararg_buffer41 = 0, $vararg_ptr10 = 0, $vararg_ptr11 = 0, $vararg_ptr27 = 0, $vararg_ptr28 = 0, $vararg_ptr29 = 0, $vararg_ptr30 = 0, $vararg_ptr31 = 0;
 var $vararg_ptr32 = 0, $vararg_ptr33 = 0, $vararg_ptr34 = 0, $vararg_ptr35 = 0, $vararg_ptr36 = 0, $vararg_ptr40 = 0, $vararg_ptr44 = 0, $vararg_ptr7 = 0, $vararg_ptr8 = 0, $vararg_ptr9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 176|0;
 $vararg_buffer41 = sp + 128|0;
 $vararg_buffer37 = sp + 8|0;
 $vararg_buffer24 = sp + 32|0;
 $vararg_buffer21 = sp + 112|0;
 $vararg_buffer18 = sp + 120|0;
 $vararg_buffer15 = sp;
 $vararg_buffer12 = sp + 24|0;
 $vararg_buffer4 = sp + 88|0;
 $vararg_buffer1 = sp + 80|0;
 $vararg_buffer = sp + 16|0;
 $mat = sp + 136|0;
 $0 = $fileName;
 $1 = HEAP32[_stderr>>2]|0;
 $2 = $0;
 HEAP32[$vararg_buffer>>2] = $2;
 (_fprintf(($1|0),(3384|0),($vararg_buffer|0))|0);
 $3 = $0;
 $4 = (_fopen(($3|0),(3408|0))|0);
 $f = $4;
 $5 = $f;
 $6 = ($5|0)!=(0|0);
 if (!($6)) {
  $7 = HEAP32[_stderr>>2]|0;
  $8 = $0;
  HEAP32[$vararg_buffer1>>2] = $8;
  (_fprintf(($7|0),(3416|0),($vararg_buffer1|0))|0);
  _exit(-1);
  // unreachable;
 }
 $9 = $f;
 HEAP32[$vararg_buffer4>>2] = 600;
 $vararg_ptr7 = (($vararg_buffer4) + 4|0);
 HEAP32[$vararg_ptr7>>2] = ((600 + 4|0));
 $vararg_ptr8 = (($vararg_buffer4) + 8|0);
 HEAP32[$vararg_ptr8>>2] = ((600 + 8|0));
 $vararg_ptr9 = (($vararg_buffer4) + 12|0);
 HEAP32[$vararg_ptr9>>2] = ((600 + 12|0));
 $vararg_ptr10 = (($vararg_buffer4) + 16|0);
 HEAP32[$vararg_ptr10>>2] = ((600 + 16|0));
 $vararg_ptr11 = (($vararg_buffer4) + 20|0);
 HEAP32[$vararg_ptr11>>2] = ((600 + 20|0));
 $10 = (_fscanf(($9|0),(3448|0),($vararg_buffer4|0))|0);
 $c = $10;
 $11 = $c;
 $12 = ($11|0)!=(6);
 if ($12) {
  $13 = HEAP32[_stderr>>2]|0;
  $14 = $c;
  HEAP32[$vararg_buffer12>>2] = $14;
  (_fprintf(($13|0),(3480|0),($vararg_buffer12|0))|0);
  _exit(-1);
  // unreachable;
 }
 $15 = $f;
 HEAP32[$vararg_buffer15>>2] = 216;
 $16 = (_fscanf(($15|0),(3520|0),($vararg_buffer15|0))|0);
 $c = $16;
 $17 = $c;
 $18 = ($17|0)!=(1);
 if ($18) {
  $19 = HEAP32[_stderr>>2]|0;
  $20 = $c;
  HEAP32[$vararg_buffer18>>2] = $20;
  (_fprintf(($19|0),(3536|0),($vararg_buffer18|0))|0);
  _exit(-1);
  // unreachable;
 }
 $21 = HEAP32[_stderr>>2]|0;
 $22 = HEAP32[216>>2]|0;
 HEAP32[$vararg_buffer21>>2] = $22;
 (_fprintf(($21|0),(3576|0),($vararg_buffer21|0))|0);
 $23 = HEAP32[216>>2]|0;
 $24 = ($23*44)|0;
 $25 = (_malloc($24)|0);
 HEAP32[544>>2] = $25;
 $i = 0;
 while(1) {
  $26 = $i;
  $27 = HEAP32[216>>2]|0;
  $28 = ($26>>>0)<($27>>>0);
  if (!($28)) {
   label = 18;
   break;
  }
  $29 = $i;
  $30 = HEAP32[544>>2]|0;
  $31 = (($30) + (($29*44)|0)|0);
  $s = $31;
  $32 = $f;
  $33 = $s;
  $34 = $s;
  $35 = (($34) + 4|0);
  $36 = $s;
  $37 = (($36) + 4|0);
  $38 = (($37) + 4|0);
  $39 = $s;
  $40 = (($39) + 4|0);
  $41 = (($40) + 8|0);
  $42 = $s;
  $43 = (($42) + 16|0);
  $44 = $s;
  $45 = (($44) + 16|0);
  $46 = (($45) + 4|0);
  $47 = $s;
  $48 = (($47) + 16|0);
  $49 = (($48) + 8|0);
  $50 = $s;
  $51 = (($50) + 28|0);
  $52 = $s;
  $53 = (($52) + 28|0);
  $54 = (($53) + 4|0);
  $55 = $s;
  $56 = (($55) + 28|0);
  $57 = (($56) + 8|0);
  HEAP32[$vararg_buffer24>>2] = $33;
  $vararg_ptr27 = (($vararg_buffer24) + 4|0);
  HEAP32[$vararg_ptr27>>2] = $35;
  $vararg_ptr28 = (($vararg_buffer24) + 8|0);
  HEAP32[$vararg_ptr28>>2] = $38;
  $vararg_ptr29 = (($vararg_buffer24) + 12|0);
  HEAP32[$vararg_ptr29>>2] = $41;
  $vararg_ptr30 = (($vararg_buffer24) + 16|0);
  HEAP32[$vararg_ptr30>>2] = $43;
  $vararg_ptr31 = (($vararg_buffer24) + 20|0);
  HEAP32[$vararg_ptr31>>2] = $46;
  $vararg_ptr32 = (($vararg_buffer24) + 24|0);
  HEAP32[$vararg_ptr32>>2] = $49;
  $vararg_ptr33 = (($vararg_buffer24) + 28|0);
  HEAP32[$vararg_ptr33>>2] = $51;
  $vararg_ptr34 = (($vararg_buffer24) + 32|0);
  HEAP32[$vararg_ptr34>>2] = $54;
  $vararg_ptr35 = (($vararg_buffer24) + 36|0);
  HEAP32[$vararg_ptr35>>2] = $57;
  $vararg_ptr36 = (($vararg_buffer24) + 40|0);
  HEAP32[$vararg_ptr36>>2] = $mat;
  $58 = (_fscanf(($32|0),(3592|0),($vararg_buffer24|0))|0);
  $c1 = $58;
  $59 = HEAP32[$mat>>2]|0;
  if ((($59|0) == 0)) {
   $60 = $s;
   $61 = (($60) + 40|0);
   HEAP32[$61>>2] = 0;
  } else if ((($59|0) == 1)) {
   $62 = $s;
   $63 = (($62) + 40|0);
   HEAP32[$63>>2] = 1;
  } else if ((($59|0) == 2)) {
   $64 = $s;
   $65 = (($64) + 40|0);
   HEAP32[$65>>2] = 2;
  } else {
   label = 13;
   break;
  }
  $69 = $c1;
  $70 = ($69|0)!=(11);
  if ($70) {
   label = 15;
   break;
  }
  $74 = $i;
  $75 = (($74) + 1)|0;
  $i = $75;
 }
 if ((label|0) == 13) {
  $66 = HEAP32[_stderr>>2]|0;
  $67 = $i;
  $68 = HEAP32[$mat>>2]|0;
  HEAP32[$vararg_buffer37>>2] = $67;
  $vararg_ptr40 = (($vararg_buffer37) + 4|0);
  HEAP32[$vararg_ptr40>>2] = $68;
  (_fprintf(($66|0),(3640|0),($vararg_buffer37|0))|0);
  _exit(-1);
  // unreachable;
 }
 else if ((label|0) == 15) {
  $71 = HEAP32[_stderr>>2]|0;
  $72 = $i;
  $73 = $c1;
  HEAP32[$vararg_buffer41>>2] = $72;
  $vararg_ptr44 = (($vararg_buffer41) + 4|0);
  HEAP32[$vararg_ptr44>>2] = $73;
  (_fprintf(($71|0),(3696|0),($vararg_buffer41|0))|0);
  _exit(-1);
  // unreachable;
 }
 else if ((label|0) == 18) {
  $76 = $f;
  (_fclose(($76|0))|0);
  STACKTOP = sp;return;
 }
}
function _UpdateCamera() {
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0.0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0.0;
 var $116 = 0.0, $117 = 0.0, $118 = 0.0, $119 = 0.0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0.0, $123 = 0.0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0.0, $129 = 0.0, $13 = 0.0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0.0;
 var $134 = 0.0, $135 = 0.0, $136 = 0.0, $137 = 0.0, $138 = 0.0, $139 = 0.0, $14 = 0.0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0.0, $144 = 0.0, $145 = 0.0, $146 = 0.0, $147 = 0.0, $148 = 0.0, $149 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0;
 var $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0, $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0.0;
 var $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0.0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0.0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0;
 var $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0.0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $64 = 0.0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0.0, $70 = 0.0, $71 = 0.0;
 var $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0, $81 = 0.0, $82 = 0.0, $83 = 0, $84 = 0.0, $85 = 0.0, $86 = 0.0, $87 = 0.0, $88 = 0.0, $89 = 0.0, $9 = 0.0;
 var $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $fov = 0.0, $k = 0.0, $k2 = 0.0, $k3 = 0.0, $k5 = 0.0, $k6 = 0.0, $l = 0.0, $l1 = 0.0, $l4 = 0.0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $0 = +HEAPF32[((600 + 12|0))>>2];
 $1 = +HEAPF32[600>>2];
 $2 = $0 - $1;
 HEAPF32[((600 + 24|0))>>2] = $2;
 $3 = +HEAPF32[((600 + 16|0))>>2];
 $4 = +HEAPF32[((600 + 4|0))>>2];
 $5 = $3 - $4;
 HEAPF32[((600 + 28|0))>>2] = $5;
 $6 = +HEAPF32[((600 + 20|0))>>2];
 $7 = +HEAPF32[((600 + 8|0))>>2];
 $8 = $6 - $7;
 HEAPF32[((600 + 32|0))>>2] = $8;
 $9 = +HEAPF32[((600 + 24|0))>>2];
 $10 = +HEAPF32[((600 + 24|0))>>2];
 $11 = $9 * $10;
 $12 = +HEAPF32[((600 + 28|0))>>2];
 $13 = +HEAPF32[((600 + 28|0))>>2];
 $14 = $12 * $13;
 $15 = $11 + $14;
 $16 = +HEAPF32[((600 + 32|0))>>2];
 $17 = +HEAPF32[((600 + 32|0))>>2];
 $18 = $16 * $17;
 $19 = $15 + $18;
 $20 = $19;
 $21 = (+Math_sqrt((+$20)));
 $22 = 1.0 / $21;
 $23 = $22;
 $l = $23;
 $24 = $l;
 $k = $24;
 $25 = $k;
 $26 = +HEAPF32[((600 + 24|0))>>2];
 $27 = $25 * $26;
 HEAPF32[((600 + 24|0))>>2] = $27;
 $28 = $k;
 $29 = +HEAPF32[((600 + 28|0))>>2];
 $30 = $28 * $29;
 HEAPF32[((600 + 28|0))>>2] = $30;
 $31 = $k;
 $32 = +HEAPF32[((600 + 32|0))>>2];
 $33 = $31 * $32;
 HEAPF32[((600 + 32|0))>>2] = $33;
 $fov = 0.785398185253143310546;
 $34 = +HEAPF32[((600 + 28|0))>>2];
 $35 = +HEAPF32[((3728 + 8|0))>>2];
 $36 = $34 * $35;
 $37 = +HEAPF32[((600 + 32|0))>>2];
 $38 = +HEAPF32[((3728 + 4|0))>>2];
 $39 = $37 * $38;
 $40 = $36 - $39;
 HEAPF32[((600 + 36|0))>>2] = $40;
 $41 = +HEAPF32[((600 + 32|0))>>2];
 $42 = +HEAPF32[3728>>2];
 $43 = $41 * $42;
 $44 = +HEAPF32[((600 + 24|0))>>2];
 $45 = +HEAPF32[((3728 + 8|0))>>2];
 $46 = $44 * $45;
 $47 = $43 - $46;
 HEAPF32[((600 + 40|0))>>2] = $47;
 $48 = +HEAPF32[((600 + 24|0))>>2];
 $49 = +HEAPF32[((3728 + 4|0))>>2];
 $50 = $48 * $49;
 $51 = +HEAPF32[((600 + 28|0))>>2];
 $52 = +HEAPF32[3728>>2];
 $53 = $51 * $52;
 $54 = $50 - $53;
 HEAPF32[((600 + 44|0))>>2] = $54;
 $55 = +HEAPF32[((600 + 36|0))>>2];
 $56 = +HEAPF32[((600 + 36|0))>>2];
 $57 = $55 * $56;
 $58 = +HEAPF32[((600 + 40|0))>>2];
 $59 = +HEAPF32[((600 + 40|0))>>2];
 $60 = $58 * $59;
 $61 = $57 + $60;
 $62 = +HEAPF32[((600 + 44|0))>>2];
 $63 = +HEAPF32[((600 + 44|0))>>2];
 $64 = $62 * $63;
 $65 = $61 + $64;
 $66 = $65;
 $67 = (+Math_sqrt((+$66)));
 $68 = 1.0 / $67;
 $69 = $68;
 $l1 = $69;
 $70 = $l1;
 $k2 = $70;
 $71 = $k2;
 $72 = +HEAPF32[((600 + 36|0))>>2];
 $73 = $71 * $72;
 HEAPF32[((600 + 36|0))>>2] = $73;
 $74 = $k2;
 $75 = +HEAPF32[((600 + 40|0))>>2];
 $76 = $74 * $75;
 HEAPF32[((600 + 40|0))>>2] = $76;
 $77 = $k2;
 $78 = +HEAPF32[((600 + 44|0))>>2];
 $79 = $77 * $78;
 HEAPF32[((600 + 44|0))>>2] = $79;
 $80 = HEAP32[3368>>2]|0;
 $81 = (+($80|0));
 $82 = $81 * 0.785398185253143310546;
 $83 = HEAP32[3376>>2]|0;
 $84 = (+($83|0));
 $85 = $82 / $84;
 $k3 = $85;
 $86 = $k3;
 $87 = +HEAPF32[((600 + 36|0))>>2];
 $88 = $86 * $87;
 HEAPF32[((600 + 36|0))>>2] = $88;
 $89 = $k3;
 $90 = +HEAPF32[((600 + 40|0))>>2];
 $91 = $89 * $90;
 HEAPF32[((600 + 40|0))>>2] = $91;
 $92 = $k3;
 $93 = +HEAPF32[((600 + 44|0))>>2];
 $94 = $92 * $93;
 HEAPF32[((600 + 44|0))>>2] = $94;
 $95 = +HEAPF32[((600 + 40|0))>>2];
 $96 = +HEAPF32[((600 + 32|0))>>2];
 $97 = $95 * $96;
 $98 = +HEAPF32[((600 + 44|0))>>2];
 $99 = +HEAPF32[((600 + 28|0))>>2];
 $100 = $98 * $99;
 $101 = $97 - $100;
 HEAPF32[((600 + 48|0))>>2] = $101;
 $102 = +HEAPF32[((600 + 44|0))>>2];
 $103 = +HEAPF32[((600 + 24|0))>>2];
 $104 = $102 * $103;
 $105 = +HEAPF32[((600 + 36|0))>>2];
 $106 = +HEAPF32[((600 + 32|0))>>2];
 $107 = $105 * $106;
 $108 = $104 - $107;
 HEAPF32[((600 + 52|0))>>2] = $108;
 $109 = +HEAPF32[((600 + 36|0))>>2];
 $110 = +HEAPF32[((600 + 28|0))>>2];
 $111 = $109 * $110;
 $112 = +HEAPF32[((600 + 40|0))>>2];
 $113 = +HEAPF32[((600 + 24|0))>>2];
 $114 = $112 * $113;
 $115 = $111 - $114;
 HEAPF32[((600 + 56|0))>>2] = $115;
 $116 = +HEAPF32[((600 + 48|0))>>2];
 $117 = +HEAPF32[((600 + 48|0))>>2];
 $118 = $116 * $117;
 $119 = +HEAPF32[((600 + 52|0))>>2];
 $120 = +HEAPF32[((600 + 52|0))>>2];
 $121 = $119 * $120;
 $122 = $118 + $121;
 $123 = +HEAPF32[((600 + 56|0))>>2];
 $124 = +HEAPF32[((600 + 56|0))>>2];
 $125 = $123 * $124;
 $126 = $122 + $125;
 $127 = $126;
 $128 = (+Math_sqrt((+$127)));
 $129 = 1.0 / $128;
 $130 = $129;
 $l4 = $130;
 $131 = $l4;
 $k5 = $131;
 $132 = $k5;
 $133 = +HEAPF32[((600 + 48|0))>>2];
 $134 = $132 * $133;
 HEAPF32[((600 + 48|0))>>2] = $134;
 $135 = $k5;
 $136 = +HEAPF32[((600 + 52|0))>>2];
 $137 = $135 * $136;
 HEAPF32[((600 + 52|0))>>2] = $137;
 $138 = $k5;
 $139 = +HEAPF32[((600 + 56|0))>>2];
 $140 = $138 * $139;
 HEAPF32[((600 + 56|0))>>2] = $140;
 $k6 = 0.785398185253143310546;
 $141 = $k6;
 $142 = +HEAPF32[((600 + 48|0))>>2];
 $143 = $141 * $142;
 HEAPF32[((600 + 48|0))>>2] = $143;
 $144 = $k6;
 $145 = +HEAPF32[((600 + 52|0))>>2];
 $146 = $144 * $145;
 HEAPF32[((600 + 52|0))>>2] = $146;
 $147 = $k6;
 $148 = +HEAPF32[((600 + 56|0))>>2];
 $149 = $147 * $148;
 HEAPF32[((600 + 56|0))>>2] = $149;
 STACKTOP = sp;return;
}
function _idleFunc() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 _UpdateRendering();
 _glutPostRedisplay();
 STACKTOP = sp;return;
}
function _displayFunc() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 _glClear(16384);
 $0 = HEAP32[3744>>2]|0;
 _glEnable(($0|0));
 $1 = HEAP32[3744>>2]|0;
 $2 = HEAP32[3752>>2]|0;
 _glBindTexture(($1|0),($2|0));
 $3 = HEAP32[3760>>2]|0;
 $4 = ($3|0)!=(0|0);
 if ($4) {
  $5 = HEAP32[3744>>2]|0;
  $6 = HEAP32[3368>>2]|0;
  $7 = HEAP32[3376>>2]|0;
  $8 = HEAP32[3768>>2]|0;
  $9 = HEAP32[3776>>2]|0;
  $10 = HEAP32[3760>>2]|0;
  _glTexSubImage2D(($5|0),0,0,0,($6|0),($7|0),($8|0),($9|0),($10|0));
 }
 _glBegin(5);
 _glColor3f(1.0,1.0,1.0);
 _glTexCoord2i(0,0);
 _glVertex3f(0.0,0.0,0.0);
 _glColor3f(1.0,1.0,1.0);
 _glTexCoord2i(0,1);
 $11 = HEAP32[3376>>2]|0;
 $12 = (+($11|0));
 _glVertex3f(0.0,(+$12),0.0);
 _glColor3f(1.0,1.0,1.0);
 _glTexCoord2i(1,0);
 $13 = HEAP32[3368>>2]|0;
 $14 = (+($13|0));
 _glVertex3f((+$14),0.0,0.0);
 _glColor3f(1.0,1.0,1.0);
 _glTexCoord2i(1,1);
 $15 = HEAP32[3368>>2]|0;
 $16 = (+($15|0));
 $17 = HEAP32[3376>>2]|0;
 $18 = (+($17|0));
 _glVertex3f((+$16),(+$18),0.0);
 _glEnd();
 $19 = HEAP32[3744>>2]|0;
 _glDisable(($19|0));
 $20 = HEAP32[3744>>2]|0;
 _glBindTexture(($20|0),0);
 _glColor3f(1.0,1.0,1.0);
 $21 = HEAP32[3784>>2]|0;
 $22 = ($21|0)!=(0);
 if ($22) {
  _PrintString(3792,3800);
 } else {
  _PrintString(3792,3848);
 }
 _glColor3f(1.0,1.0,1.0);
 _PrintString(3792,3896);
 $23 = HEAP32[4152>>2]|0;
 $24 = ($23|0)!=(0);
 if (!($24)) {
  _glutSwapBuffers();
  STACKTOP = sp;return;
 }
 _glPushMatrix();
 _glLoadIdentity();
 _glOrtho(-0.5,639.5,-0.5,479.5,-1.0,1.0);
 _PrintHelp();
 _glPopMatrix();
 _glutSwapBuffers();
 STACKTOP = sp;return;
}
function _PrintString($font,$string) {
 $font = $font|0;
 $string = $string|0;
 var $0 = 0, $1 = 0, $2 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $0 = $font;
 $1 = $string;
 $2 = $1;
 HEAP32[$vararg_buffer>>2] = $2;
 (_printf((4768|0),($vararg_buffer|0))|0);
 STACKTOP = sp;return;
}
function _reshapeFunc($newWidth,$newHeight) {
 $newWidth = $newWidth|0;
 $newHeight = $newHeight|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0.0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $newWidth;
 $1 = $newHeight;
 $2 = $0;
 HEAP32[3368>>2] = $2;
 $3 = $1;
 HEAP32[3376>>2] = $3;
 $4 = HEAP32[3368>>2]|0;
 $5 = HEAP32[3376>>2]|0;
 _glViewport(0,0,($4|0),($5|0));
 _glLoadIdentity();
 $6 = HEAP32[3368>>2]|0;
 $7 = (+($6|0));
 $8 = $7 - 1.0;
 $9 = $8;
 $10 = HEAP32[3376>>2]|0;
 $11 = (+($10|0));
 $12 = $11 - 1.0;
 $13 = $12;
 _glOrtho(0.0,(+$9),0.0,(+$13),-1.0,1.0);
 _ReInit(1);
 _glutPostRedisplay();
 STACKTOP = sp;return;
}
function _keyFunc($key,$x,$y) {
 $key = $key|0;
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0;
 var $116 = 0.0, $117 = 0, $118 = 0.0, $119 = 0.0, $12 = 0, $120 = 0.0, $121 = 0, $122 = 0.0, $123 = 0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0.0, $129 = 0.0, $13 = 0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0.0;
 var $134 = 0.0, $135 = 0.0, $136 = 0, $137 = 0.0, $138 = 0.0, $139 = 0, $14 = 0, $140 = 0.0, $141 = 0, $142 = 0.0, $143 = 0.0, $144 = 0, $145 = 0.0, $146 = 0.0, $147 = 0.0, $148 = 0.0, $149 = 0, $15 = 0, $150 = 0.0, $151 = 0.0;
 var $152 = 0, $153 = 0.0, $154 = 0, $155 = 0.0, $156 = 0.0, $157 = 0, $158 = 0.0, $159 = 0.0, $16 = 0, $160 = 0.0, $161 = 0.0, $162 = 0, $163 = 0.0, $164 = 0.0, $165 = 0.0, $166 = 0, $167 = 0.0, $168 = 0.0, $169 = 0.0, $17 = 0;
 var $170 = 0.0, $171 = 0.0, $172 = 0.0, $173 = 0, $174 = 0.0, $175 = 0.0, $176 = 0.0, $177 = 0, $178 = 0.0, $179 = 0.0, $18 = 0, $180 = 0.0, $181 = 0.0, $182 = 0.0, $183 = 0.0, $184 = 0, $185 = 0.0, $186 = 0.0, $187 = 0, $188 = 0.0;
 var $189 = 0, $19 = 0, $190 = 0.0, $191 = 0.0, $192 = 0, $193 = 0.0, $194 = 0.0, $195 = 0.0, $196 = 0.0, $197 = 0, $198 = 0.0, $199 = 0.0, $2 = 0, $20 = 0, $200 = 0.0, $201 = 0, $202 = 0.0, $203 = 0.0, $204 = 0.0, $205 = 0.0;
 var $206 = 0.0, $207 = 0.0, $208 = 0, $209 = 0.0, $21 = 0, $210 = 0.0, $211 = 0.0, $212 = 0, $213 = 0.0, $214 = 0.0, $215 = 0.0, $216 = 0.0, $217 = 0.0, $218 = 0.0, $219 = 0, $22 = 0, $220 = 0.0, $221 = 0.0, $222 = 0, $223 = 0.0;
 var $224 = 0, $225 = 0.0, $226 = 0.0, $227 = 0, $228 = 0.0, $229 = 0.0, $23 = 0, $230 = 0.0, $231 = 0.0, $232 = 0, $233 = 0.0, $234 = 0.0, $235 = 0.0, $236 = 0, $237 = 0.0, $238 = 0.0, $239 = 0.0, $24 = 0, $240 = 0.0, $241 = 0.0;
 var $242 = 0.0, $243 = 0, $244 = 0.0, $245 = 0.0, $246 = 0.0, $247 = 0, $248 = 0.0, $249 = 0.0, $25 = 0, $250 = 0.0, $251 = 0.0, $252 = 0.0, $253 = 0.0, $254 = 0.0, $255 = 0.0, $256 = 0.0, $257 = 0.0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0.0, $269 = 0.0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0.0, $276 = 0.0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0.0, $283 = 0.0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0.0;
 var $297 = 0.0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0.0, $304 = 0.0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0.0, $311 = 0.0, $312 = 0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0.0, $317 = 0.0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0.0, $323 = 0.0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0.0, $33 = 0, $330 = 0.0, $331 = 0;
 var $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0.0, $337 = 0.0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0.0, $344 = 0.0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0;
 var $350 = 0.0, $351 = 0.0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0, $48 = 0.0;
 var $49 = 0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0, $54 = 0.0, $55 = 0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0, $60 = 0.0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $64 = 0.0, $65 = 0.0, $66 = 0.0;
 var $67 = 0.0, $68 = 0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0, $72 = 0.0, $73 = 0, $74 = 0.0, $75 = 0.0, $76 = 0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0, $80 = 0.0, $81 = 0, $82 = 0.0, $83 = 0.0, $84 = 0;
 var $85 = 0.0, $86 = 0, $87 = 0.0, $88 = 0.0, $89 = 0, $9 = 0, $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0, $99 = 0.0, $dir = 0, $dir10 = 0, $dir4 = 0, $dir8 = 0;
 var $f = 0, $k = 0.0, $k11 = 0.0, $k3 = 0.0, $k6 = 0.0, $k7 = 0.0, $k9 = 0.0, $l = 0.0, $l5 = 0.0, $p = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer12 = 0, $vararg_buffer18 = 0, $vararg_buffer5 = 0, $vararg_ptr15 = 0, $vararg_ptr16 = 0, $vararg_ptr17 = 0, $vararg_ptr21 = 0;
 var $vararg_ptr22 = 0, $vararg_ptr23 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, $vararg_ptr8 = 0, $vararg_ptr9 = 0, $x1 = 0, $y2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 224|0;
 $vararg_buffer18 = sp + 48|0;
 $vararg_buffer12 = sp;
 $vararg_buffer10 = sp + 104|0;
 $vararg_buffer5 = sp + 32|0;
 $vararg_buffer1 = sp + 80|0;
 $vararg_buffer = sp + 96|0;
 $dir = sp + 108|0;
 $dir4 = sp + 168|0;
 $dir8 = sp + 192|0;
 $dir10 = sp + 120|0;
 $0 = $key;
 $1 = $x;
 $2 = $y;
 $3 = $0;
 $4 = $3&255;
 switch ($4|0) {
 case 112:  {
  $5 = (_fopen((4160|0),(4176|0))|0);
  $f = $5;
  $6 = $f;
  $7 = ($6|0)!=(0|0);
  if ($7) {
   $9 = $f;
   $10 = HEAP32[3368>>2]|0;
   $11 = HEAP32[3376>>2]|0;
   HEAP32[$vararg_buffer1>>2] = $10;
   $vararg_ptr3 = (($vararg_buffer1) + 4|0);
   HEAP32[$vararg_ptr3>>2] = $11;
   $vararg_ptr4 = (($vararg_buffer1) + 8|0);
   HEAP32[$vararg_ptr4>>2] = 255;
   (_fprintf(($9|0),(4224|0),($vararg_buffer1|0))|0);
   $12 = HEAP32[3376>>2]|0;
   $13 = (($12) - 1)|0;
   $y2 = $13;
   while(1) {
    $14 = $y2;
    $15 = ($14|0)>=(0);
    if (!($15)) {
     break;
    }
    $16 = $y2;
    $17 = HEAP32[3368>>2]|0;
    $18 = Math_imul($16, $17)|0;
    $19 = HEAP32[3760>>2]|0;
    $20 = (($19) + ($18<<2)|0);
    $p = $20;
    $x1 = 0;
    while(1) {
     $21 = $x1;
     $22 = HEAP32[3368>>2]|0;
     $23 = ($21|0)<($22|0);
     if (!($23)) {
      break;
     }
     $24 = $f;
     $25 = $p;
     $26 = HEAP8[$25]|0;
     $27 = $26&255;
     $28 = $p;
     $29 = (($28) + 1|0);
     $30 = HEAP8[$29]|0;
     $31 = $30&255;
     $32 = $p;
     $33 = (($32) + 2|0);
     $34 = HEAP8[$33]|0;
     $35 = $34&255;
     HEAP32[$vararg_buffer5>>2] = $27;
     $vararg_ptr8 = (($vararg_buffer5) + 4|0);
     HEAP32[$vararg_ptr8>>2] = $31;
     $vararg_ptr9 = (($vararg_buffer5) + 8|0);
     HEAP32[$vararg_ptr9>>2] = $35;
     (_fprintf(($24|0),(4240|0),($vararg_buffer5|0))|0);
     $36 = $x1;
     $37 = (($36) + 1)|0;
     $x1 = $37;
     $38 = $p;
     $39 = (($38) + 4|0);
     $p = $39;
    }
    $40 = $y2;
    $41 = (($40) + -1)|0;
    $y2 = $41;
   }
   $42 = $f;
   (_fclose(($42|0))|0);
  } else {
   $8 = HEAP32[_stderr>>2]|0;
   (_fprintf(($8|0),(4184|0),($vararg_buffer|0))|0);
  }
  STACKTOP = sp;return;
  break;
 }
 case 27:  {
  $43 = HEAP32[_stderr>>2]|0;
  (_fprintf(($43|0),(4256|0),($vararg_buffer10|0))|0);
  _exit(0);
  // unreachable;
  break;
 }
 case 32:  {
  _ReInit(1);
  STACKTOP = sp;return;
  break;
 }
 case 97:  {
  ;HEAP32[$dir+0>>2]=HEAP32[((600 + 36|0))+0>>2]|0;HEAP32[$dir+4>>2]=HEAP32[((600 + 36|0))+4>>2]|0;HEAP32[$dir+8>>2]=HEAP32[((600 + 36|0))+8>>2]|0;
  $44 = +HEAPF32[$dir>>2];
  $45 = +HEAPF32[$dir>>2];
  $46 = $44 * $45;
  $47 = (($dir) + 4|0);
  $48 = +HEAPF32[$47>>2];
  $49 = (($dir) + 4|0);
  $50 = +HEAPF32[$49>>2];
  $51 = $48 * $50;
  $52 = $46 + $51;
  $53 = (($dir) + 8|0);
  $54 = +HEAPF32[$53>>2];
  $55 = (($dir) + 8|0);
  $56 = +HEAPF32[$55>>2];
  $57 = $54 * $56;
  $58 = $52 + $57;
  $59 = $58;
  $60 = (+Math_sqrt((+$59)));
  $61 = 1.0 / $60;
  $62 = $61;
  $l = $62;
  $63 = $l;
  $k = $63;
  $64 = $k;
  $65 = +HEAPF32[$dir>>2];
  $66 = $64 * $65;
  HEAPF32[$dir>>2] = $66;
  $67 = $k;
  $68 = (($dir) + 4|0);
  $69 = +HEAPF32[$68>>2];
  $70 = $67 * $69;
  $71 = (($dir) + 4|0);
  HEAPF32[$71>>2] = $70;
  $72 = $k;
  $73 = (($dir) + 8|0);
  $74 = +HEAPF32[$73>>2];
  $75 = $72 * $74;
  $76 = (($dir) + 8|0);
  HEAPF32[$76>>2] = $75;
  $k3 = -10.0;
  $77 = $k3;
  $78 = +HEAPF32[$dir>>2];
  $79 = $77 * $78;
  HEAPF32[$dir>>2] = $79;
  $80 = $k3;
  $81 = (($dir) + 4|0);
  $82 = +HEAPF32[$81>>2];
  $83 = $80 * $82;
  $84 = (($dir) + 4|0);
  HEAPF32[$84>>2] = $83;
  $85 = $k3;
  $86 = (($dir) + 8|0);
  $87 = +HEAPF32[$86>>2];
  $88 = $85 * $87;
  $89 = (($dir) + 8|0);
  HEAPF32[$89>>2] = $88;
  $90 = +HEAPF32[600>>2];
  $91 = +HEAPF32[$dir>>2];
  $92 = $90 + $91;
  HEAPF32[600>>2] = $92;
  $93 = +HEAPF32[((600 + 4|0))>>2];
  $94 = (($dir) + 4|0);
  $95 = +HEAPF32[$94>>2];
  $96 = $93 + $95;
  HEAPF32[((600 + 4|0))>>2] = $96;
  $97 = +HEAPF32[((600 + 8|0))>>2];
  $98 = (($dir) + 8|0);
  $99 = +HEAPF32[$98>>2];
  $100 = $97 + $99;
  HEAPF32[((600 + 8|0))>>2] = $100;
  $101 = +HEAPF32[((600 + 12|0))>>2];
  $102 = +HEAPF32[$dir>>2];
  $103 = $101 + $102;
  HEAPF32[((600 + 12|0))>>2] = $103;
  $104 = +HEAPF32[((600 + 16|0))>>2];
  $105 = (($dir) + 4|0);
  $106 = +HEAPF32[$105>>2];
  $107 = $104 + $106;
  HEAPF32[((600 + 16|0))>>2] = $107;
  $108 = +HEAPF32[((600 + 20|0))>>2];
  $109 = (($dir) + 8|0);
  $110 = +HEAPF32[$109>>2];
  $111 = $108 + $110;
  HEAPF32[((600 + 20|0))>>2] = $111;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 100:  {
  ;HEAP32[$dir4+0>>2]=HEAP32[((600 + 36|0))+0>>2]|0;HEAP32[$dir4+4>>2]=HEAP32[((600 + 36|0))+4>>2]|0;HEAP32[$dir4+8>>2]=HEAP32[((600 + 36|0))+8>>2]|0;
  $112 = +HEAPF32[$dir4>>2];
  $113 = +HEAPF32[$dir4>>2];
  $114 = $112 * $113;
  $115 = (($dir4) + 4|0);
  $116 = +HEAPF32[$115>>2];
  $117 = (($dir4) + 4|0);
  $118 = +HEAPF32[$117>>2];
  $119 = $116 * $118;
  $120 = $114 + $119;
  $121 = (($dir4) + 8|0);
  $122 = +HEAPF32[$121>>2];
  $123 = (($dir4) + 8|0);
  $124 = +HEAPF32[$123>>2];
  $125 = $122 * $124;
  $126 = $120 + $125;
  $127 = $126;
  $128 = (+Math_sqrt((+$127)));
  $129 = 1.0 / $128;
  $130 = $129;
  $l5 = $130;
  $131 = $l5;
  $k6 = $131;
  $132 = $k6;
  $133 = +HEAPF32[$dir4>>2];
  $134 = $132 * $133;
  HEAPF32[$dir4>>2] = $134;
  $135 = $k6;
  $136 = (($dir4) + 4|0);
  $137 = +HEAPF32[$136>>2];
  $138 = $135 * $137;
  $139 = (($dir4) + 4|0);
  HEAPF32[$139>>2] = $138;
  $140 = $k6;
  $141 = (($dir4) + 8|0);
  $142 = +HEAPF32[$141>>2];
  $143 = $140 * $142;
  $144 = (($dir4) + 8|0);
  HEAPF32[$144>>2] = $143;
  $k7 = 10.0;
  $145 = $k7;
  $146 = +HEAPF32[$dir4>>2];
  $147 = $145 * $146;
  HEAPF32[$dir4>>2] = $147;
  $148 = $k7;
  $149 = (($dir4) + 4|0);
  $150 = +HEAPF32[$149>>2];
  $151 = $148 * $150;
  $152 = (($dir4) + 4|0);
  HEAPF32[$152>>2] = $151;
  $153 = $k7;
  $154 = (($dir4) + 8|0);
  $155 = +HEAPF32[$154>>2];
  $156 = $153 * $155;
  $157 = (($dir4) + 8|0);
  HEAPF32[$157>>2] = $156;
  $158 = +HEAPF32[600>>2];
  $159 = +HEAPF32[$dir4>>2];
  $160 = $158 + $159;
  HEAPF32[600>>2] = $160;
  $161 = +HEAPF32[((600 + 4|0))>>2];
  $162 = (($dir4) + 4|0);
  $163 = +HEAPF32[$162>>2];
  $164 = $161 + $163;
  HEAPF32[((600 + 4|0))>>2] = $164;
  $165 = +HEAPF32[((600 + 8|0))>>2];
  $166 = (($dir4) + 8|0);
  $167 = +HEAPF32[$166>>2];
  $168 = $165 + $167;
  HEAPF32[((600 + 8|0))>>2] = $168;
  $169 = +HEAPF32[((600 + 12|0))>>2];
  $170 = +HEAPF32[$dir4>>2];
  $171 = $169 + $170;
  HEAPF32[((600 + 12|0))>>2] = $171;
  $172 = +HEAPF32[((600 + 16|0))>>2];
  $173 = (($dir4) + 4|0);
  $174 = +HEAPF32[$173>>2];
  $175 = $172 + $174;
  HEAPF32[((600 + 16|0))>>2] = $175;
  $176 = +HEAPF32[((600 + 20|0))>>2];
  $177 = (($dir4) + 8|0);
  $178 = +HEAPF32[$177>>2];
  $179 = $176 + $178;
  HEAPF32[((600 + 20|0))>>2] = $179;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 119:  {
  ;HEAP32[$dir8+0>>2]=HEAP32[((600 + 24|0))+0>>2]|0;HEAP32[$dir8+4>>2]=HEAP32[((600 + 24|0))+4>>2]|0;HEAP32[$dir8+8>>2]=HEAP32[((600 + 24|0))+8>>2]|0;
  $k9 = 10.0;
  $180 = $k9;
  $181 = +HEAPF32[$dir8>>2];
  $182 = $180 * $181;
  HEAPF32[$dir8>>2] = $182;
  $183 = $k9;
  $184 = (($dir8) + 4|0);
  $185 = +HEAPF32[$184>>2];
  $186 = $183 * $185;
  $187 = (($dir8) + 4|0);
  HEAPF32[$187>>2] = $186;
  $188 = $k9;
  $189 = (($dir8) + 8|0);
  $190 = +HEAPF32[$189>>2];
  $191 = $188 * $190;
  $192 = (($dir8) + 8|0);
  HEAPF32[$192>>2] = $191;
  $193 = +HEAPF32[600>>2];
  $194 = +HEAPF32[$dir8>>2];
  $195 = $193 + $194;
  HEAPF32[600>>2] = $195;
  $196 = +HEAPF32[((600 + 4|0))>>2];
  $197 = (($dir8) + 4|0);
  $198 = +HEAPF32[$197>>2];
  $199 = $196 + $198;
  HEAPF32[((600 + 4|0))>>2] = $199;
  $200 = +HEAPF32[((600 + 8|0))>>2];
  $201 = (($dir8) + 8|0);
  $202 = +HEAPF32[$201>>2];
  $203 = $200 + $202;
  HEAPF32[((600 + 8|0))>>2] = $203;
  $204 = +HEAPF32[((600 + 12|0))>>2];
  $205 = +HEAPF32[$dir8>>2];
  $206 = $204 + $205;
  HEAPF32[((600 + 12|0))>>2] = $206;
  $207 = +HEAPF32[((600 + 16|0))>>2];
  $208 = (($dir8) + 4|0);
  $209 = +HEAPF32[$208>>2];
  $210 = $207 + $209;
  HEAPF32[((600 + 16|0))>>2] = $210;
  $211 = +HEAPF32[((600 + 20|0))>>2];
  $212 = (($dir8) + 8|0);
  $213 = +HEAPF32[$212>>2];
  $214 = $211 + $213;
  HEAPF32[((600 + 20|0))>>2] = $214;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 115:  {
  ;HEAP32[$dir10+0>>2]=HEAP32[((600 + 24|0))+0>>2]|0;HEAP32[$dir10+4>>2]=HEAP32[((600 + 24|0))+4>>2]|0;HEAP32[$dir10+8>>2]=HEAP32[((600 + 24|0))+8>>2]|0;
  $k11 = -10.0;
  $215 = $k11;
  $216 = +HEAPF32[$dir10>>2];
  $217 = $215 * $216;
  HEAPF32[$dir10>>2] = $217;
  $218 = $k11;
  $219 = (($dir10) + 4|0);
  $220 = +HEAPF32[$219>>2];
  $221 = $218 * $220;
  $222 = (($dir10) + 4|0);
  HEAPF32[$222>>2] = $221;
  $223 = $k11;
  $224 = (($dir10) + 8|0);
  $225 = +HEAPF32[$224>>2];
  $226 = $223 * $225;
  $227 = (($dir10) + 8|0);
  HEAPF32[$227>>2] = $226;
  $228 = +HEAPF32[600>>2];
  $229 = +HEAPF32[$dir10>>2];
  $230 = $228 + $229;
  HEAPF32[600>>2] = $230;
  $231 = +HEAPF32[((600 + 4|0))>>2];
  $232 = (($dir10) + 4|0);
  $233 = +HEAPF32[$232>>2];
  $234 = $231 + $233;
  HEAPF32[((600 + 4|0))>>2] = $234;
  $235 = +HEAPF32[((600 + 8|0))>>2];
  $236 = (($dir10) + 8|0);
  $237 = +HEAPF32[$236>>2];
  $238 = $235 + $237;
  HEAPF32[((600 + 8|0))>>2] = $238;
  $239 = +HEAPF32[((600 + 12|0))>>2];
  $240 = +HEAPF32[$dir10>>2];
  $241 = $239 + $240;
  HEAPF32[((600 + 12|0))>>2] = $241;
  $242 = +HEAPF32[((600 + 16|0))>>2];
  $243 = (($dir10) + 4|0);
  $244 = +HEAPF32[$243>>2];
  $245 = $242 + $244;
  HEAPF32[((600 + 16|0))>>2] = $245;
  $246 = +HEAPF32[((600 + 20|0))>>2];
  $247 = (($dir10) + 8|0);
  $248 = +HEAPF32[$247>>2];
  $249 = $246 + $248;
  HEAPF32[((600 + 20|0))>>2] = $249;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 114:  {
  $250 = +HEAPF32[((600 + 4|0))>>2];
  $251 = $250 + 10.0;
  HEAPF32[((600 + 4|0))>>2] = $251;
  $252 = +HEAPF32[((600 + 16|0))>>2];
  $253 = $252 + 10.0;
  HEAPF32[((600 + 16|0))>>2] = $253;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 102:  {
  $254 = +HEAPF32[((600 + 4|0))>>2];
  $255 = $254 - 10.0;
  HEAPF32[((600 + 4|0))>>2] = $255;
  $256 = +HEAPF32[((600 + 16|0))>>2];
  $257 = $256 - 10.0;
  HEAPF32[((600 + 16|0))>>2] = $257;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 43:  {
  $258 = HEAP32[4264>>2]|0;
  $259 = (($258) + 1)|0;
  $260 = HEAP32[216>>2]|0;
  $261 = (($259>>>0) % ($260>>>0))&-1;
  HEAP32[4264>>2] = $261;
  $262 = HEAP32[_stderr>>2]|0;
  $263 = HEAP32[4264>>2]|0;
  $264 = HEAP32[4264>>2]|0;
  $265 = HEAP32[544>>2]|0;
  $266 = (($265) + (($264*44)|0)|0);
  $267 = (($266) + 4|0);
  $268 = +HEAPF32[$267>>2];
  $269 = $268;
  $270 = HEAP32[4264>>2]|0;
  $271 = HEAP32[544>>2]|0;
  $272 = (($271) + (($270*44)|0)|0);
  $273 = (($272) + 4|0);
  $274 = (($273) + 4|0);
  $275 = +HEAPF32[$274>>2];
  $276 = $275;
  $277 = HEAP32[4264>>2]|0;
  $278 = HEAP32[544>>2]|0;
  $279 = (($278) + (($277*44)|0)|0);
  $280 = (($279) + 4|0);
  $281 = (($280) + 8|0);
  $282 = +HEAPF32[$281>>2];
  $283 = $282;
  HEAP32[$vararg_buffer12>>2] = $263;
  $vararg_ptr15 = (($vararg_buffer12) + 4|0);
  HEAPF64[tempDoublePtr>>3]=$269;HEAP32[$vararg_ptr15>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr15+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr16 = (($vararg_buffer12) + 12|0);
  HEAPF64[tempDoublePtr>>3]=$276;HEAP32[$vararg_ptr16>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr16+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr17 = (($vararg_buffer12) + 20|0);
  HEAPF64[tempDoublePtr>>3]=$283;HEAP32[$vararg_ptr17>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr17+4>>2]=HEAP32[tempDoublePtr+4>>2];
  (_fprintf(($262|0),(4272|0),($vararg_buffer12|0))|0);
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 45:  {
  $284 = HEAP32[4264>>2]|0;
  $285 = HEAP32[216>>2]|0;
  $286 = (($285) - 1)|0;
  $287 = (($284) + ($286))|0;
  $288 = HEAP32[216>>2]|0;
  $289 = (($287>>>0) % ($288>>>0))&-1;
  HEAP32[4264>>2] = $289;
  $290 = HEAP32[_stderr>>2]|0;
  $291 = HEAP32[4264>>2]|0;
  $292 = HEAP32[4264>>2]|0;
  $293 = HEAP32[544>>2]|0;
  $294 = (($293) + (($292*44)|0)|0);
  $295 = (($294) + 4|0);
  $296 = +HEAPF32[$295>>2];
  $297 = $296;
  $298 = HEAP32[4264>>2]|0;
  $299 = HEAP32[544>>2]|0;
  $300 = (($299) + (($298*44)|0)|0);
  $301 = (($300) + 4|0);
  $302 = (($301) + 4|0);
  $303 = +HEAPF32[$302>>2];
  $304 = $303;
  $305 = HEAP32[4264>>2]|0;
  $306 = HEAP32[544>>2]|0;
  $307 = (($306) + (($305*44)|0)|0);
  $308 = (($307) + 4|0);
  $309 = (($308) + 8|0);
  $310 = +HEAPF32[$309>>2];
  $311 = $310;
  HEAP32[$vararg_buffer18>>2] = $291;
  $vararg_ptr21 = (($vararg_buffer18) + 4|0);
  HEAPF64[tempDoublePtr>>3]=$297;HEAP32[$vararg_ptr21>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr21+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr22 = (($vararg_buffer18) + 12|0);
  HEAPF64[tempDoublePtr>>3]=$304;HEAP32[$vararg_ptr22>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr22+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr23 = (($vararg_buffer18) + 20|0);
  HEAPF64[tempDoublePtr>>3]=$311;HEAP32[$vararg_ptr23>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr23+4>>2]=HEAP32[tempDoublePtr+4>>2];
  (_fprintf(($290|0),(4272|0),($vararg_buffer18|0))|0);
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 52:  {
  $312 = HEAP32[4264>>2]|0;
  $313 = HEAP32[544>>2]|0;
  $314 = (($313) + (($312*44)|0)|0);
  $315 = (($314) + 4|0);
  $316 = +HEAPF32[$315>>2];
  $317 = $316 - 5.0;
  HEAPF32[$315>>2] = $317;
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 54:  {
  $318 = HEAP32[4264>>2]|0;
  $319 = HEAP32[544>>2]|0;
  $320 = (($319) + (($318*44)|0)|0);
  $321 = (($320) + 4|0);
  $322 = +HEAPF32[$321>>2];
  $323 = $322 + 5.0;
  HEAPF32[$321>>2] = $323;
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 56:  {
  $324 = HEAP32[4264>>2]|0;
  $325 = HEAP32[544>>2]|0;
  $326 = (($325) + (($324*44)|0)|0);
  $327 = (($326) + 4|0);
  $328 = (($327) + 8|0);
  $329 = +HEAPF32[$328>>2];
  $330 = $329 - 5.0;
  HEAPF32[$328>>2] = $330;
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 50:  {
  $331 = HEAP32[4264>>2]|0;
  $332 = HEAP32[544>>2]|0;
  $333 = (($332) + (($331*44)|0)|0);
  $334 = (($333) + 4|0);
  $335 = (($334) + 8|0);
  $336 = +HEAPF32[$335>>2];
  $337 = $336 + 5.0;
  HEAPF32[$335>>2] = $337;
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 57:  {
  $338 = HEAP32[4264>>2]|0;
  $339 = HEAP32[544>>2]|0;
  $340 = (($339) + (($338*44)|0)|0);
  $341 = (($340) + 4|0);
  $342 = (($341) + 4|0);
  $343 = +HEAPF32[$342>>2];
  $344 = $343 + 5.0;
  HEAPF32[$342>>2] = $344;
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 51:  {
  $345 = HEAP32[4264>>2]|0;
  $346 = HEAP32[544>>2]|0;
  $347 = (($346) + (($345*44)|0)|0);
  $348 = (($347) + 4|0);
  $349 = (($348) + 4|0);
  $350 = +HEAPF32[$349>>2];
  $351 = $350 - 5.0;
  HEAPF32[$349>>2] = $351;
  _ReInitScene();
  STACKTOP = sp;return;
  break;
 }
 case 104:  {
  $352 = HEAP32[4152>>2]|0;
  $353 = ($352|0)!=(0);
  $354 = $353 ^ 1;
  $355 = $354&1;
  HEAP32[4152>>2] = $355;
  STACKTOP = sp;return;
  break;
 }
 default: {
  STACKTOP = sp;return;
 }
 }
}
function _specialFunc($key,$x,$y) {
 $key = $key|0;
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $100 = 0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0, $105 = 0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0, $114 = 0.0, $115 = 0.0;
 var $116 = 0.0, $117 = 0, $118 = 0, $119 = 0.0, $12 = 0, $120 = 0.0, $121 = 0.0, $122 = 0, $123 = 0.0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0, $128 = 0.0, $129 = 0.0, $13 = 0.0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0.0;
 var $134 = 0.0, $135 = 0.0, $136 = 0.0, $137 = 0.0, $138 = 0, $139 = 0.0, $14 = 0.0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0.0, $144 = 0.0, $145 = 0, $146 = 0.0, $147 = 0.0, $148 = 0.0, $149 = 0, $15 = 0.0, $150 = 0.0, $151 = 0.0;
 var $152 = 0.0, $153 = 0, $154 = 0, $155 = 0.0, $156 = 0.0, $157 = 0.0, $158 = 0, $159 = 0.0, $16 = 0, $160 = 0.0, $161 = 0.0, $162 = 0, $163 = 0.0, $164 = 0.0, $165 = 0.0, $166 = 0, $167 = 0, $168 = 0.0, $169 = 0.0, $17 = 0;
 var $170 = 0.0, $171 = 0, $172 = 0.0, $173 = 0.0, $174 = 0.0, $175 = 0.0, $176 = 0, $177 = 0.0, $178 = 0.0, $179 = 0.0, $18 = 0.0, $180 = 0.0, $181 = 0.0, $182 = 0.0, $183 = 0.0, $184 = 0.0, $185 = 0.0, $186 = 0.0, $187 = 0, $188 = 0.0;
 var $189 = 0.0, $19 = 0.0, $190 = 0.0, $191 = 0.0, $192 = 0.0, $193 = 0.0, $194 = 0, $195 = 0.0, $196 = 0.0, $197 = 0.0, $198 = 0, $199 = 0.0, $2 = 0, $20 = 0.0, $200 = 0.0, $201 = 0.0, $202 = 0, $203 = 0, $204 = 0.0, $205 = 0.0;
 var $206 = 0.0, $207 = 0, $208 = 0.0, $209 = 0.0, $21 = 0.0, $210 = 0.0, $211 = 0.0, $22 = 0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0, $27 = 0.0, $28 = 0.0, $29 = 0, $3 = 0, $30 = 0, $31 = 0.0, $32 = 0.0, $33 = 0.0;
 var $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0.0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0, $48 = 0.0, $49 = 0.0, $5 = 0.0, $50 = 0.0, $51 = 0;
 var $52 = 0, $53 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $64 = 0, $65 = 0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0, $7 = 0;
 var $70 = 0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0, $83 = 0, $84 = 0.0, $85 = 0.0, $86 = 0.0, $87 = 0.0, $88 = 0.0;
 var $89 = 0, $9 = 0.0, $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $t = 0, $t1 = 0, $t2 = 0, $t3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $t = sp + 48|0;
 $t1 = sp + 12|0;
 $t2 = sp;
 $t3 = sp + 28|0;
 $0 = $key;
 $1 = $x;
 $2 = $y;
 $3 = $0;
 switch ($3|0) {
 case 102:  {
  ;HEAP32[$t3+0>>2]=HEAP32[((600 + 12|0))+0>>2]|0;HEAP32[$t3+4>>2]=HEAP32[((600 + 12|0))+4>>2]|0;HEAP32[$t3+8>>2]=HEAP32[((600 + 12|0))+8>>2]|0;
  $159 = +HEAPF32[$t3>>2];
  $160 = +HEAPF32[600>>2];
  $161 = $159 - $160;
  HEAPF32[$t3>>2] = $161;
  $162 = (($t3) + 4|0);
  $163 = +HEAPF32[$162>>2];
  $164 = +HEAPF32[((600 + 4|0))>>2];
  $165 = $163 - $164;
  $166 = (($t3) + 4|0);
  HEAPF32[$166>>2] = $165;
  $167 = (($t3) + 8|0);
  $168 = +HEAPF32[$167>>2];
  $169 = +HEAPF32[((600 + 8|0))>>2];
  $170 = $168 - $169;
  $171 = (($t3) + 8|0);
  HEAPF32[$171>>2] = $170;
  $172 = +HEAPF32[$t3>>2];
  $173 = $172;
  $174 = (+Math_cos(0.0349065850398865909487));
  $175 = $173 * $174;
  $176 = (($t3) + 8|0);
  $177 = +HEAPF32[$176>>2];
  $178 = $177;
  $179 = (+Math_sin(0.0349065850398865909487));
  $180 = $178 * $179;
  $181 = $175 - $180;
  $182 = $181;
  HEAPF32[$t3>>2] = $182;
  $183 = +HEAPF32[$t3>>2];
  $184 = $183;
  $185 = (+Math_sin(0.0349065850398865909487));
  $186 = $184 * $185;
  $187 = (($t3) + 8|0);
  $188 = +HEAPF32[$187>>2];
  $189 = $188;
  $190 = (+Math_cos(0.0349065850398865909487));
  $191 = $189 * $190;
  $192 = $186 + $191;
  $193 = $192;
  $194 = (($t3) + 8|0);
  HEAPF32[$194>>2] = $193;
  $195 = +HEAPF32[$t3>>2];
  $196 = +HEAPF32[600>>2];
  $197 = $195 + $196;
  HEAPF32[$t3>>2] = $197;
  $198 = (($t3) + 4|0);
  $199 = +HEAPF32[$198>>2];
  $200 = +HEAPF32[((600 + 4|0))>>2];
  $201 = $199 + $200;
  $202 = (($t3) + 4|0);
  HEAPF32[$202>>2] = $201;
  $203 = (($t3) + 8|0);
  $204 = +HEAPF32[$203>>2];
  $205 = +HEAPF32[((600 + 8|0))>>2];
  $206 = $204 + $205;
  $207 = (($t3) + 8|0);
  HEAPF32[$207>>2] = $206;
  ;HEAP32[((600 + 12|0))+0>>2]=HEAP32[$t3+0>>2]|0;HEAP32[((600 + 12|0))+4>>2]=HEAP32[$t3+4>>2]|0;HEAP32[((600 + 12|0))+8>>2]=HEAP32[$t3+8>>2]|0;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 104:  {
  $208 = +HEAPF32[((600 + 16|0))>>2];
  $209 = $208 + 10.0;
  HEAPF32[((600 + 16|0))>>2] = $209;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 105:  {
  $210 = +HEAPF32[((600 + 16|0))>>2];
  $211 = $210 - 10.0;
  HEAPF32[((600 + 16|0))>>2] = $211;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 101:  {
  ;HEAP32[$t+0>>2]=HEAP32[((600 + 12|0))+0>>2]|0;HEAP32[$t+4>>2]=HEAP32[((600 + 12|0))+4>>2]|0;HEAP32[$t+8>>2]=HEAP32[((600 + 12|0))+8>>2]|0;
  $4 = +HEAPF32[$t>>2];
  $5 = +HEAPF32[600>>2];
  $6 = $4 - $5;
  HEAPF32[$t>>2] = $6;
  $7 = (($t) + 4|0);
  $8 = +HEAPF32[$7>>2];
  $9 = +HEAPF32[((600 + 4|0))>>2];
  $10 = $8 - $9;
  $11 = (($t) + 4|0);
  HEAPF32[$11>>2] = $10;
  $12 = (($t) + 8|0);
  $13 = +HEAPF32[$12>>2];
  $14 = +HEAPF32[((600 + 8|0))>>2];
  $15 = $13 - $14;
  $16 = (($t) + 8|0);
  HEAPF32[$16>>2] = $15;
  $17 = (($t) + 4|0);
  $18 = +HEAPF32[$17>>2];
  $19 = $18;
  $20 = (+Math_cos(-0.0349065850398865909487));
  $21 = $19 * $20;
  $22 = (($t) + 8|0);
  $23 = +HEAPF32[$22>>2];
  $24 = $23;
  $25 = (+Math_sin(-0.0349065850398865909487));
  $26 = $24 * $25;
  $27 = $21 + $26;
  $28 = $27;
  $29 = (($t) + 4|0);
  HEAPF32[$29>>2] = $28;
  $30 = (($t) + 4|0);
  $31 = +HEAPF32[$30>>2];
  $32 = -$31;
  $33 = $32;
  $34 = (+Math_sin(-0.0349065850398865909487));
  $35 = $33 * $34;
  $36 = (($t) + 8|0);
  $37 = +HEAPF32[$36>>2];
  $38 = $37;
  $39 = (+Math_cos(-0.0349065850398865909487));
  $40 = $38 * $39;
  $41 = $35 + $40;
  $42 = $41;
  $43 = (($t) + 8|0);
  HEAPF32[$43>>2] = $42;
  $44 = +HEAPF32[$t>>2];
  $45 = +HEAPF32[600>>2];
  $46 = $44 + $45;
  HEAPF32[$t>>2] = $46;
  $47 = (($t) + 4|0);
  $48 = +HEAPF32[$47>>2];
  $49 = +HEAPF32[((600 + 4|0))>>2];
  $50 = $48 + $49;
  $51 = (($t) + 4|0);
  HEAPF32[$51>>2] = $50;
  $52 = (($t) + 8|0);
  $53 = +HEAPF32[$52>>2];
  $54 = +HEAPF32[((600 + 8|0))>>2];
  $55 = $53 + $54;
  $56 = (($t) + 8|0);
  HEAPF32[$56>>2] = $55;
  ;HEAP32[((600 + 12|0))+0>>2]=HEAP32[$t+0>>2]|0;HEAP32[((600 + 12|0))+4>>2]=HEAP32[$t+4>>2]|0;HEAP32[((600 + 12|0))+8>>2]=HEAP32[$t+8>>2]|0;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 103:  {
  ;HEAP32[$t1+0>>2]=HEAP32[((600 + 12|0))+0>>2]|0;HEAP32[$t1+4>>2]=HEAP32[((600 + 12|0))+4>>2]|0;HEAP32[$t1+8>>2]=HEAP32[((600 + 12|0))+8>>2]|0;
  $57 = +HEAPF32[$t1>>2];
  $58 = +HEAPF32[600>>2];
  $59 = $57 - $58;
  HEAPF32[$t1>>2] = $59;
  $60 = (($t1) + 4|0);
  $61 = +HEAPF32[$60>>2];
  $62 = +HEAPF32[((600 + 4|0))>>2];
  $63 = $61 - $62;
  $64 = (($t1) + 4|0);
  HEAPF32[$64>>2] = $63;
  $65 = (($t1) + 8|0);
  $66 = +HEAPF32[$65>>2];
  $67 = +HEAPF32[((600 + 8|0))>>2];
  $68 = $66 - $67;
  $69 = (($t1) + 8|0);
  HEAPF32[$69>>2] = $68;
  $70 = (($t1) + 4|0);
  $71 = +HEAPF32[$70>>2];
  $72 = $71;
  $73 = (+Math_cos(0.0349065850398865909487));
  $74 = $72 * $73;
  $75 = (($t1) + 8|0);
  $76 = +HEAPF32[$75>>2];
  $77 = $76;
  $78 = (+Math_sin(0.0349065850398865909487));
  $79 = $77 * $78;
  $80 = $74 + $79;
  $81 = $80;
  $82 = (($t1) + 4|0);
  HEAPF32[$82>>2] = $81;
  $83 = (($t1) + 4|0);
  $84 = +HEAPF32[$83>>2];
  $85 = -$84;
  $86 = $85;
  $87 = (+Math_sin(0.0349065850398865909487));
  $88 = $86 * $87;
  $89 = (($t1) + 8|0);
  $90 = +HEAPF32[$89>>2];
  $91 = $90;
  $92 = (+Math_cos(0.0349065850398865909487));
  $93 = $91 * $92;
  $94 = $88 + $93;
  $95 = $94;
  $96 = (($t1) + 8|0);
  HEAPF32[$96>>2] = $95;
  $97 = +HEAPF32[$t1>>2];
  $98 = +HEAPF32[600>>2];
  $99 = $97 + $98;
  HEAPF32[$t1>>2] = $99;
  $100 = (($t1) + 4|0);
  $101 = +HEAPF32[$100>>2];
  $102 = +HEAPF32[((600 + 4|0))>>2];
  $103 = $101 + $102;
  $104 = (($t1) + 4|0);
  HEAPF32[$104>>2] = $103;
  $105 = (($t1) + 8|0);
  $106 = +HEAPF32[$105>>2];
  $107 = +HEAPF32[((600 + 8|0))>>2];
  $108 = $106 + $107;
  $109 = (($t1) + 8|0);
  HEAPF32[$109>>2] = $108;
  ;HEAP32[((600 + 12|0))+0>>2]=HEAP32[$t1+0>>2]|0;HEAP32[((600 + 12|0))+4>>2]=HEAP32[$t1+4>>2]|0;HEAP32[((600 + 12|0))+8>>2]=HEAP32[$t1+8>>2]|0;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 case 100:  {
  ;HEAP32[$t2+0>>2]=HEAP32[((600 + 12|0))+0>>2]|0;HEAP32[$t2+4>>2]=HEAP32[((600 + 12|0))+4>>2]|0;HEAP32[$t2+8>>2]=HEAP32[((600 + 12|0))+8>>2]|0;
  $110 = +HEAPF32[$t2>>2];
  $111 = +HEAPF32[600>>2];
  $112 = $110 - $111;
  HEAPF32[$t2>>2] = $112;
  $113 = (($t2) + 4|0);
  $114 = +HEAPF32[$113>>2];
  $115 = +HEAPF32[((600 + 4|0))>>2];
  $116 = $114 - $115;
  $117 = (($t2) + 4|0);
  HEAPF32[$117>>2] = $116;
  $118 = (($t2) + 8|0);
  $119 = +HEAPF32[$118>>2];
  $120 = +HEAPF32[((600 + 8|0))>>2];
  $121 = $119 - $120;
  $122 = (($t2) + 8|0);
  HEAPF32[$122>>2] = $121;
  $123 = +HEAPF32[$t2>>2];
  $124 = $123;
  $125 = (+Math_cos(-0.0349065850398865909487));
  $126 = $124 * $125;
  $127 = (($t2) + 8|0);
  $128 = +HEAPF32[$127>>2];
  $129 = $128;
  $130 = (+Math_sin(-0.0349065850398865909487));
  $131 = $129 * $130;
  $132 = $126 - $131;
  $133 = $132;
  HEAPF32[$t2>>2] = $133;
  $134 = +HEAPF32[$t2>>2];
  $135 = $134;
  $136 = (+Math_sin(-0.0349065850398865909487));
  $137 = $135 * $136;
  $138 = (($t2) + 8|0);
  $139 = +HEAPF32[$138>>2];
  $140 = $139;
  $141 = (+Math_cos(-0.0349065850398865909487));
  $142 = $140 * $141;
  $143 = $137 + $142;
  $144 = $143;
  $145 = (($t2) + 8|0);
  HEAPF32[$145>>2] = $144;
  $146 = +HEAPF32[$t2>>2];
  $147 = +HEAPF32[600>>2];
  $148 = $146 + $147;
  HEAPF32[$t2>>2] = $148;
  $149 = (($t2) + 4|0);
  $150 = +HEAPF32[$149>>2];
  $151 = +HEAPF32[((600 + 4|0))>>2];
  $152 = $150 + $151;
  $153 = (($t2) + 4|0);
  HEAPF32[$153>>2] = $152;
  $154 = (($t2) + 8|0);
  $155 = +HEAPF32[$154>>2];
  $156 = +HEAPF32[((600 + 8|0))>>2];
  $157 = $155 + $156;
  $158 = (($t2) + 8|0);
  HEAPF32[$158>>2] = $157;
  ;HEAP32[((600 + 12|0))+0>>2]=HEAP32[$t2+0>>2]|0;HEAP32[((600 + 12|0))+4>>2]=HEAP32[$t2+4>>2]|0;HEAP32[((600 + 12|0))+8>>2]=HEAP32[$t2+8>>2]|0;
  _ReInit(0);
  STACKTOP = sp;return;
  break;
 }
 default: {
  STACKTOP = sp;return;
 }
 }
}
function _InitGlut($argc,$argv,$windowTittle) {
 $argc = $argc|0;
 $argv = $argv|0;
 $windowTittle = $windowTittle|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = sp + 8|0;
 HEAP32[$0>>2] = $argc;
 $1 = $argv;
 $2 = $windowTittle;
 $3 = HEAP32[3368>>2]|0;
 $4 = HEAP32[3376>>2]|0;
 _glutInitWindowSize(($3|0),($4|0));
 _glutInitWindowPosition(0,0);
 _glutInitDisplayMode(2);
 $5 = $1;
 _glutInit(($0|0),($5|0));
 $6 = $2;
 (_glutCreateWindow(($6|0))|0);
 $7 = HEAP32[3368>>2]|0;
 $8 = HEAP32[3376>>2]|0;
 (_SetupGraphics($7,$8)|0);
 _glutReshapeFunc((1|0));
 _glutKeyboardFunc((1|0));
 _glutSpecialFunc((2|0));
 _glutDisplayFunc((1|0));
 _glutIdleFunc((2|0));
 $9 = HEAP32[3368>>2]|0;
 $10 = HEAP32[3376>>2]|0;
 _glViewport(0,0,($9|0),($10|0));
 _glLoadIdentity();
 $11 = HEAP32[3368>>2]|0;
 $12 = (+($11|0));
 $13 = $12 - 1.0;
 $14 = $13;
 $15 = HEAP32[3376>>2]|0;
 $16 = (+($15|0));
 $17 = $16 - 1.0;
 $18 = $17;
 _glOrtho(0.0,(+$14),0.0,(+$18),-1.0,1.0);
 STACKTOP = sp;return;
}
function _SetupGraphics($width,$height) {
 $width = $width|0;
 $height = $height|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0.0, $12 = 0, $13 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $width;
 $1 = $height;
 $2 = $0;
 $3 = $1;
 _CreateTexture($2,$3);
 _glClearColor(0.0,0.0,0.0,0.0);
 _glDisable(2929);
 _glActiveTexture(33984);
 $4 = $0;
 $5 = $1;
 _glViewport(0,0,($4|0),($5|0));
 _glMatrixMode(5888);
 _glLoadIdentity();
 _glMatrixMode(5889);
 _glLoadIdentity();
 HEAPF32[((4304 + 24|0))>>2] = 0.0;
 HEAPF32[((4304 + 28|0))>>2] = 0.0;
 $6 = $0;
 $7 = (+($6>>>0));
 HEAPF32[((4304 + 16|0))>>2] = $7;
 HEAPF32[((4304 + 20|0))>>2] = 0.0;
 $8 = $0;
 $9 = (+($8>>>0));
 HEAPF32[((4304 + 8|0))>>2] = $9;
 $10 = $1;
 $11 = (+($10>>>0));
 HEAPF32[((4304 + 12|0))>>2] = $11;
 HEAPF32[4304>>2] = 0.0;
 $12 = $1;
 $13 = (+($12>>>0));
 HEAPF32[((4304 + 4|0))>>2] = $13;
 _glEnableClientState(32884);
 _glEnableClientState(32888);
 _glVertexPointer(2,5126,0,(4336|0));
 _glClientActiveTexture(33984);
 _glTexCoordPointer(2,5126,0,(4304|0));
 STACKTOP = sp;return 0;
}
function _CreateTexture($width,$height) {
 $width = $width|0;
 $height = $height|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $0 = $width;
 $1 = $height;
 $2 = $0;
 $3 = $1;
 HEAP32[$vararg_buffer>>2] = $2;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $3;
 (_printf((4368|0),($vararg_buffer|0))|0);
 $4 = HEAP32[4400>>2]|0;
 _glActiveTexture(($4|0));
 _glGenTextures(1,(3752|0));
 $5 = HEAP32[3744>>2]|0;
 $6 = HEAP32[3752>>2]|0;
 _glBindTexture(($5|0),($6|0));
 $7 = HEAP32[3744>>2]|0;
 _glTexParameteri(($7|0),10240,9728);
 $8 = HEAP32[3744>>2]|0;
 _glTexParameteri(($8|0),10241,9728);
 $9 = HEAP32[3744>>2]|0;
 $10 = HEAP32[4408>>2]|0;
 $11 = $0;
 $12 = $1;
 $13 = HEAP32[3768>>2]|0;
 $14 = HEAP32[3776>>2]|0;
 _glTexImage2D(($9|0),0,($10|0),($11|0),($12|0),0,($13|0),($14|0),(0|0));
 $15 = HEAP32[3744>>2]|0;
 _glBindTexture(($15|0),0);
 STACKTOP = sp;return;
}
function _PrintHelp() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 _glEnable(3042);
 _glBlendFunc(770,771);
 _glColor4f(0.0,0.0,0.5,0.5);
 _glColor3f(1.0,1.0,1.0);
 _PrintString(3792,4416);
 _PrintString(3792,4424);
 _PrintString(3792,4440);
 _PrintString(3792,4488);
 _PrintString(3792,4528);
 _PrintString(3792,4576);
 _PrintString(3792,4616);
 _PrintString(3792,4672);
 _PrintString(3792,4720);
 _glDisable(3042);
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $970$phi = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0;
 var $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0;
 var $F5$0$i = 0, $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$phi = 0, $R$0$i$phi = 0, $R$0$i18 = 0, $R$0$i18$phi = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$phi = 0;
 var $RP$0$i$phi = 0, $RP$0$i17 = 0, $RP$0$i17$phi = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0, $T$013$i$i$phi = 0, $T$024$i = 0, $T$024$i$phi = 0, $T$051$i$i = 0, $T$051$i$i$phi = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $i$02$i$i$phi = 0, $idx$0$i = 0;
 var $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0;
 var $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rsize$329$i$phi = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0;
 var $t$228$i = 0, $t$228$i$phi = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$330$i = 0, $v$330$i$phi = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[4776>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((4776 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((4776 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[4776>>2] = $22;
     } else {
      $23 = HEAP32[((4776 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((4776 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((4776 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((4776 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[4776>>2] = $74;
      } else {
       $75 = HEAP32[((4776 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((4776 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((4776 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((4776 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[4776>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[4776>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((4776 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((4776 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((4776 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((4776 + 8|0))>>2] = $81;
     HEAP32[((4776 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((4776 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((4776 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((4776 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $RP$0$i$phi = $173;$R$0$i$phi = $174;$RP$0$i = $RP$0$i$phi;$R$0$i = $R$0$i$phi;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((4776 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((4776 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((4776 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((4776 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((4776 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((4776 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((4776 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((4776 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((4776 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((4776 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[4776>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[4776>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((4776 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((4776 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((4776 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((4776 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((4776 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((4776 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((4776 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((4776 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $v$330$i$phi = $t$2$v$3$i;$t$228$i$phi = $338;$rsize$329$i$phi = $$rsize$3$i;$v$330$i = $v$330$i$phi;$t$228$i = $t$228$i$phi;$rsize$329$i = $rsize$329$i$phi;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $v$330$i$phi = $t$2$v$3$i;$rsize$329$i$phi = $$rsize$3$i;$t$228$i = $341;$v$330$i = $v$330$i$phi;$rsize$329$i = $rsize$329$i$phi;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((4776 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((4776 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $RP$0$i17$phi = $371;$R$0$i18$phi = $372;$RP$0$i17 = $RP$0$i17$phi;$R$0$i18 = $R$0$i18$phi;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((4776 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((4776 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((4776 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((4776 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((4776 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((4776 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((4776 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((4776 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[4776>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          if ($431) {
           $432 = $428 | $429;
           HEAP32[4776>>2] = $432;
           $$sum14$pre$i = (($426) + 2)|0;
           $$pre$i25 = ((4776 + ($$sum14$pre$i<<2)|0) + 40|0);
           $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
          } else {
           $$sum17$i = (($426) + 2)|0;
           $433 = ((4776 + ($$sum17$i<<2)|0) + 40|0);
           $434 = HEAP32[$433>>2]|0;
           $435 = HEAP32[((4776 + 16|0))>>2]|0;
           $436 = ($434>>>0)<($435>>>0);
           if ($436) {
            _abort();
            // unreachable;
           } else {
            $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
           }
          }
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((4776 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((4776 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((4776 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L225: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $T$024$i$phi = $489;$K12$025$i = $487;$T$024$i = $T$024$i$phi;
            }
           }
           $496 = HEAP32[((4776 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((4776 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((4776 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((4776 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((4776 + 20|0))>>2] = $516;
   HEAP32[((4776 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((4776 + 8|0))>>2] = 0;
   HEAP32[((4776 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((4776 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((4776 + 12|0))>>2] = $530;
  $531 = HEAP32[((4776 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((4776 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[5248>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((5248 + 8|0))>>2] = $540;
    HEAP32[((5248 + 4|0))>>2] = $540;
    HEAP32[((5248 + 12|0))>>2] = -1;
    HEAP32[((5248 + 16|0))>>2] = -1;
    HEAP32[((5248 + 20|0))>>2] = 0;
    HEAP32[((4776 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[5248>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((5248 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((4776 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((4776 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((4776 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((4776 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((4776 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((4776 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((5248 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((4776 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((4776 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((5248 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((4776 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((4776 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((4776 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((4776 + 432|0))>>2] = $633;
  $634 = HEAP32[((4776 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((4776 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((4776 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((4776 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((4776 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((4776 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((4776 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((4776 + 460|0))>>2] = 0;
    $641 = HEAP32[5248>>2]|0;
    HEAP32[((4776 + 36|0))>>2] = $641;
    HEAP32[((4776 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((4776 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((4776 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((4776 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i$phi = $646;$i$02$i$i = $i$02$i$i$phi;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((4776 + 24|0))>>2] = $654;
    HEAP32[((4776 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((5248 + 16|0))>>2]|0;
    HEAP32[((4776 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((4776 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((4776 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((4776 + 24|0))>>2] = $684;
       HEAP32[((4776 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((5248 + 16|0))>>2]|0;
       HEAP32[((4776 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((4776 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((4776 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((4776 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((4776 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L348: do {
       if ($730) {
        $731 = HEAP32[((4776 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((4776 + 12|0))>>2] = $732;
        HEAP32[((4776 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((4776 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((4776 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((4776 + 8|0))>>2] = $738;
         HEAP32[((4776 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((4776 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           if (!($755)) {
            $756 = HEAP32[((4776 + 16|0))>>2]|0;
            $757 = ($750>>>0)<($756>>>0);
            if ($757) {
             _abort();
             // unreachable;
            }
            $758 = (($750) + 12|0);
            $759 = HEAP32[$758>>2]|0;
            $760 = ($759|0)==($721|0);
            if (!($760)) {
             _abort();
             // unreachable;
            }
           }
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[4776>>2]|0;
            $765 = $764 & $763;
            HEAP32[4776>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           if ($766) {
            $$pre57$i$i = (($752) + 8|0);
            $$pre$phi58$i$iZ2D = $$pre57$i$i;
           } else {
            $767 = HEAP32[((4776 + 16|0))>>2]|0;
            $768 = ($752>>>0)<($767>>>0);
            if ($768) {
             _abort();
             // unreachable;
            }
            $769 = (($752) + 8|0);
            $770 = HEAP32[$769>>2]|0;
            $771 = ($770|0)==($721|0);
            if ($771) {
             $$pre$phi58$i$iZ2D = $769;
            } else {
             _abort();
             // unreachable;
            }
           }
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $RP$0$i$i$phi = $794;$R$0$i$i$phi = $795;$RP$0$i$i = $RP$0$i$i$phi;$R$0$i$i = $R$0$i$i$phi;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((4776 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((4776 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if (!($802)) {
            $$sum30$i$i = (($tsize$246$i) + 28)|0;
            $$sum113$i = (($$sum30$i$i) + ($720))|0;
            $803 = (($tbase$247$i) + ($$sum113$i)|0);
            $804 = HEAP32[$803>>2]|0;
            $805 = ((4776 + ($804<<2)|0) + 304|0);
            $806 = HEAP32[$805>>2]|0;
            $807 = ($721|0)==($806|0);
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if ($cond$i$i) {
              $808 = 1 << $804;
              $809 = $808 ^ -1;
              $810 = HEAP32[((4776 + 4|0))>>2]|0;
              $811 = $810 & $809;
              HEAP32[((4776 + 4|0))>>2] = $811;
              break;
             }
            } else {
             $812 = HEAP32[((4776 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break;
             }
            }
            $819 = HEAP32[((4776 + 16|0))>>2]|0;
            $820 = ($R$1$i$i>>>0)<($819>>>0);
            if ($820) {
             _abort();
             // unreachable;
            }
            $821 = (($R$1$i$i) + 24|0);
            HEAP32[$821>>2] = $774;
            $$sum3132$i$i = $720 | 16;
            $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
            $822 = (($tbase$247$i) + ($$sum114$i)|0);
            $823 = HEAP32[$822>>2]|0;
            $824 = ($823|0)==(0|0);
            do {
             if (!($824)) {
              $825 = HEAP32[((4776 + 16|0))>>2]|0;
              $826 = ($823>>>0)<($825>>>0);
              if ($826) {
               _abort();
               // unreachable;
              } else {
               $827 = (($R$1$i$i) + 16|0);
               HEAP32[$827>>2] = $823;
               $828 = (($823) + 24|0);
               HEAP32[$828>>2] = $R$1$i$i;
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
            $829 = (($tbase$247$i) + ($$sum115$i)|0);
            $830 = HEAP32[$829>>2]|0;
            $831 = ($830|0)==(0|0);
            if (!($831)) {
             $832 = HEAP32[((4776 + 16|0))>>2]|0;
             $833 = ($830>>>0)<($832>>>0);
             if ($833) {
              _abort();
              // unreachable;
             } else {
              $834 = (($R$1$i$i) + 20|0);
              HEAP32[$834>>2] = $830;
              $835 = (($830) + 24|0);
              HEAP32[$835>>2] = $R$1$i$i;
              break;
             }
            }
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((4776 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[4776>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         if ($851) {
          $852 = $848 | $849;
          HEAP32[4776>>2] = $852;
          $$sum26$pre$i$i = (($846) + 2)|0;
          $$pre$i25$i = ((4776 + ($$sum26$pre$i$i<<2)|0) + 40|0);
          $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
         } else {
          $$sum29$i$i = (($846) + 2)|0;
          $853 = ((4776 + ($$sum29$i$i<<2)|0) + 40|0);
          $854 = HEAP32[$853>>2]|0;
          $855 = HEAP32[((4776 + 16|0))>>2]|0;
          $856 = ($854>>>0)<($855>>>0);
          if ($856) {
           _abort();
           // unreachable;
          } else {
           $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
          }
         }
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        if ($861) {
         $I7$0$i$i = 0;
        } else {
         $862 = ($qsize$0$i$i>>>0)>(16777215);
         if ($862) {
          $I7$0$i$i = 31;
         } else {
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        }
        $885 = ((4776 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((4776 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((4776 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L445: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L445;
           } else {
            $T$051$i$i$phi = $909;$K8$052$i$i = $907;$T$051$i$i = $T$051$i$i$phi;
           }
          }
          $916 = HEAP32[((4776 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L348;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((4776 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((4776 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((4776 + 24|0))>>2] = $958;
    HEAP32[((4776 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((5248 + 16|0))>>2]|0;
    HEAP32[((4776 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((4776 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((4776 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((4776 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((4776 + 448|0))+12>>2]|0;
    HEAP32[((4776 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((4776 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((4776 + 460|0))>>2] = 0;
    HEAP32[((4776 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970$phi = $969;$970 = $970$phi;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((4776 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[4776>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      if ($990) {
       $991 = $987 | $988;
       HEAP32[4776>>2] = $991;
       $$sum10$pre$i$i = (($985) + 2)|0;
       $$pre$i$i = ((4776 + ($$sum10$pre$i$i<<2)|0) + 40|0);
       $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
      } else {
       $$sum11$i$i = (($985) + 2)|0;
       $992 = ((4776 + ($$sum11$i$i<<2)|0) + 40|0);
       $993 = HEAP32[$992>>2]|0;
       $994 = HEAP32[((4776 + 16|0))>>2]|0;
       $995 = ($993>>>0)<($994>>>0);
       if ($995) {
        _abort();
        // unreachable;
       } else {
        $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((4776 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((4776 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((4776 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L499: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L499;
        } else {
         $T$013$i$i$phi = $1048;$K2$014$i$i = $1046;$T$013$i$i = $T$013$i$i$phi;
        }
       }
       $1055 = HEAP32[((4776 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((4776 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((4776 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((4776 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((4776 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((4776 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$0$phi = 0, $R$1 = 0, $R7$0 = 0, $R7$0$phi = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$phi = 0, $RP9$0 = 0, $RP9$0$phi = 0, $T$0$lcssa = 0, $T$056 = 0, $T$056$phi = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0;
 var $sp$0$in$i$phi = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((4776 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((4776 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((4776 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((4776 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[4776>>2]|0;
     $36 = $35 & $34;
     HEAP32[4776>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $RP$0$phi = $63;$R$0$phi = $64;$RP$0 = $RP$0$phi;$R$0 = $R$0$phi;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((4776 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((4776 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((4776 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((4776 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((4776 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((4776 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((4776 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((4776 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((4776 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((4776 + 12|0))>>2] = $122;
   HEAP32[((4776 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((4776 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((4776 + 20|0))>>2] = 0;
   HEAP32[((4776 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((4776 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((4776 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((4776 + 8|0))>>2] = $130;
   HEAP32[((4776 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((4776 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((4776 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[4776>>2]|0;
     $154 = $153 & $152;
     HEAP32[4776>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((4776 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $RP9$0$phi = $183;$R7$0$phi = $184;$RP9$0 = $RP9$0$phi;$R7$0 = $R7$0$phi;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((4776 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((4776 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((4776 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((4776 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((4776 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((4776 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((4776 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((4776 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((4776 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((4776 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((4776 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((4776 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[4776>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[4776>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((4776 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((4776 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((4776 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((4776 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((4776 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((4776 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L205: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L205;
      } else {
       $T$056$phi = $299;$K19$057 = $297;$T$056 = $T$056$phi;
      }
     }
     $306 = HEAP32[((4776 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((4776 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((4776 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((4776 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((4776 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i$phi = $324;$sp$0$in$i = $sp$0$in$i$phi;
  }
 }
 HEAP32[((4776 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function runPostSets() {
 
}
function _rand_r(seedp) {
    seedp = seedp|0; 
    var val = 0;
    val = ((Math_imul(((HEAP32[((seedp)>>2)])|0), 31010991)|0) + 0x676e6177 ) & 2147483647; // assumes RAND_MAX is in bit mask form (power of 2 minus 1)
    HEAP32[((seedp)>>2)]=val;
    return val|0;
}
function _rand() {
    return _rand_r(___rand_seed)|0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[(curr)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[(dest)]=((HEAP8[(src)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[(dest)]=((HEAP8[(src)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[(ptr)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[(ptr)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}

// EMSCRIPTEN_END_FUNCS

  
  function dynCall_vii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    FUNCTION_TABLE_vii[index&1](a1|0,a2|0);
  }


  function dynCall_viii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    FUNCTION_TABLE_viii[index&3](a1|0,a2|0,a3|0);
  }


  function dynCall_v(index) {
    index = index|0;
    
    FUNCTION_TABLE_v[index&3]();
  }

function b0(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_vii(0); }
  function b1(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_viii(1); }
  function b2() { ; nullFunc_v(2); }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_vii = [b0,_reshapeFunc];
  var FUNCTION_TABLE_viii = [b1,_keyFunc,_specialFunc,b1];
  var FUNCTION_TABLE_v = [b2,_displayFunc,_idleFunc,b2];

  return { _strlen: _strlen, _free: _free, _main: _main, _rand_r: _rand_r, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _rand: _rand, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_vii: dynCall_vii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "nullFunc_vii": nullFunc_vii, "nullFunc_viii": nullFunc_viii, "nullFunc_v": nullFunc_v, "invoke_vii": invoke_vii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "_glUseProgram": _glUseProgram, "_fread": _fread, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clCreateContext": _clCreateContext, "_glDeleteProgram": _glDeleteProgram, "_clCreateProgramWithSource": _clCreateProgramWithSource, "_glBindBuffer": _glBindBuffer, "_fsync": _fsync, "_sbrk": _sbrk, "_glBlendFunc": _glBlendFunc, "_glutReshapeWindow": _glutReshapeWindow, "_glDisableVertexAttribArray": _glDisableVertexAttribArray, "_glCreateShader": _glCreateShader, "_glutSwapBuffers": _glutSwapBuffers, "_sysconf": _sysconf, "_close": _close, "_rewind": _rewind, "_cos": _cos, "_glTexCoord2i": _glTexCoord2i, "_clCreateCommandQueue": _clCreateCommandQueue, "_glLoadIdentity": _glLoadIdentity, "_write": _write, "_ftell": _ftell, "_glutSpecialFunc": _glutSpecialFunc, "_glShaderSource": _glShaderSource, "_glOrtho": _glOrtho, "_glVertexPointer": _glVertexPointer, "_glGetBooleanv": _glGetBooleanv, "_glutCreateWindow": _glutCreateWindow, "__getFloat": __getFloat, "_glVertexAttribPointer": _glVertexAttribPointer, "_glHint": _glHint, "_send": _send, "_glutDisplayFunc": _glutDisplayFunc, "_glBegin": _glBegin, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "_glutInitDisplayMode": _glutInitDisplayMode, "_strtol": _strtol, "_glViewport": _glViewport, "_fscanf": _fscanf, "___setErrNo": ___setErrNo, "_glutPostRedisplay": _glutPostRedisplay, "_clGetPlatformInfo": _clGetPlatformInfo, "_glutReshapeFunc": _glutReshapeFunc, "_glEnable": _glEnable, "_printf": _printf, "_glGenTextures": _glGenTextures, "_sprintf": _sprintf, "_glGetIntegerv": _glGetIntegerv, "_glGetString": _glGetString, "_glutMainLoop": _glutMainLoop, "_glPushMatrix": _glPushMatrix, "_emscripten_get_now": _emscripten_get_now, "_glAttachShader": _glAttachShader, "_read": _read, "_clSetKernelArg": _clSetKernelArg, "_fwrite": _fwrite, "_time": _time, "_glColor3f": _glColor3f, "_glDetachShader": _glDetachShader, "_glutInitWindowPosition": _glutInitWindowPosition, "_exit": _exit, "_glColor4f": _glColor4f, "_lseek": _lseek, "_atoi": _atoi, "_glEnableClientState": _glEnableClientState, "_pwrite": _pwrite, "_open": _open, "_glClearColor": _glClearColor, "_glIsEnabled": _glIsEnabled, "_glBindTexture": _glBindTexture, "_snprintf": _snprintf, "_clReleaseMemObject": _clReleaseMemObject, "_clGetPlatformIDs": _clGetPlatformIDs, "_glutIdleFunc": _glutIdleFunc, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_clFinish": _clFinish, "_fseek": _fseek, "_clGetDeviceIDs": _clGetDeviceIDs, "_glutInit": _glutInit, "__parseInt": __parseInt, "_glActiveTexture": _glActiveTexture, "_glGetFloatv": _glGetFloatv, "_clGetKernelWorkGroupInfo": _clGetKernelWorkGroupInfo, "_clCreateBuffer": _clCreateBuffer, "_glTexCoordPointer": _glTexCoordPointer, "_recv": _recv, "_glCompileShader": _glCompileShader, "_glEnableVertexAttribArray": _glEnableVertexAttribArray, "_abort": _abort, "_clBuildProgram": _clBuildProgram, "_glTexImage2D": _glTexImage2D, "_isspace": _isspace, "_fopen": _fopen, "_clGetContextInfo": _clGetContextInfo, "_clCreateKernel": _clCreateKernel, "_sin": _sin, "_glutKeyboardFunc": _glutKeyboardFunc, "_ungetc": _ungetc, "_clEnqueueWriteBuffer": _clEnqueueWriteBuffer, "_clGetDeviceInfo": _clGetDeviceInfo, "_fprintf": _fprintf, "__reallyNegative": __reallyNegative, "_glutInitWindowSize": _glutInitWindowSize, "_glClear": _glClear, "_fileno": _fileno, "_glPopMatrix": _glPopMatrix, "_glMatrixMode": _glMatrixMode, "__exit": __exit, "_glBindAttribLocation": _glBindAttribLocation, "_emscripten_glColor4f": _emscripten_glColor4f, "_glVertex3f": _glVertex3f, "_pread": _pread, "_mkport": _mkport, "_glEnd": _glEnd, "_glLinkProgram": _glLinkProgram, "_fflush": _fflush, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "___errno_location": ___errno_location, "_fgetc": _fgetc, "__scanString": __scanString, "_glClientActiveTexture": _glClientActiveTexture, "_fclose": _fclose, "_glDisable": _glDisable, "_glTexParameteri": _glTexParameteri, "__formatString": __formatString, "_sqrt": _sqrt, "_glTexSubImage2D": _glTexSubImage2D, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "___rand_seed": ___rand_seed, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _rand_r = Module["_rand_r"] = asm["_rand_r"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _rand = Module["_rand"] = asm["_rand"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



//# sourceMappingURL=dav_smallptgpuv1.js.map