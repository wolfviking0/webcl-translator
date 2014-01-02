
var Module;
if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
    function fetchRemotePackage(packageName, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        if (event.loaded && event.total) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: event.total
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
      fetchRemotePackage('book_spmv.data', function(data) {
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
      new DataRequest(0, 40949, 0, 0).open('GET', '/spmv.mm');
    new DataRequest(40949, 62165, 0, 0).open('GET', '/spmv.cl');
    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    }
    var PACKAGE_NAME = '../../../build/book_spmv.data';
    var REMOTE_PACKAGE_NAME = 'book_spmv.data';
    var PACKAGE_UUID = '541a1575-a1ca-49aa-92d2-7b1b57cbe471';
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/spmv.mm"].onload();
          DataRequest.prototype.requests["/spmv.cl"].onload();
          Module['removeRunDependency']('datafile_../../../build/book_spmv.data');
    };
    Module['addRunDependency']('datafile_../../../build/book_spmv.data');
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
// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
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
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
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
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
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
  Module['print'] = print;
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
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
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
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
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
    if (vararg) return 8;
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
    if (type.name_[0] === '[') {
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
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
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
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
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
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
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
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
  try {
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
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
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
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
    var first = true;
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
      return rawList ? list : ret + flushList();
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
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
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
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
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
if (!Math['imul']) Math['imul'] = function imul(a, b) {
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
STATICTOP = STATIC_BASE + 5240;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var ___progname;
var _warnx;
/* memory initializer */ allocate([111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,115,0,0,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,99,0,0,0,0,0,0,0,160,18,0,0,0,0,0,0,63,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,111,112,116,105,111,110,32,100,111,101,115,110,39,116,32,116,97,107,101,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,46,42,115,0,160,16,0,0,0,0,0,0,0,0,0,0,104,0,0,0,144,16,0,0,0,0,0,0,0,0,0,0,97,0,0,0,64,16,0,0,0,0,0,0,0,0,0,0,99,0,0,0,24,16,0,0,0,0,0,0,0,0,0,0,103,0,0,0,248,15,0,0,0,0,0,0,0,0,0,0,76,0,0,0,216,15,0,0,0,0,0,0,0,0,0,0,65,0,0,0,128,15,0,0,0,0,0,0,0,0,0,0,118,0,0,0,104,15,0,0,1,0,0,0,0,0,0,0,108,0,0,0,72,15,0,0,1,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,112,109,118,46,99,108,0,116,105,108,101,100,95,115,112,109,118,95,107,101,114,110,101,108,95,76,83,0,0,0,0,116,105,108,101,100,95,115,112,109,118,95,107,101,114,110,101,108,95,65,87,71,67,0,0,0,4,0,0,0,0,0,0,248,16,0,0,0,0,0,0,1,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,115,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,99,0,0,0,0,255,255,255,255,0,0,0,0,97,109,98,105,103,117,111,117,115,32,111,112,116,105,111,110,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,67,111,110,116,101,120,116,0,0,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,80,114,111,103,114,97,109,0,0,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,75,101,114,110,101,108,0,99,108,82,101,108,101,97,115,101,67,111,109,109,97,110,100,81,117,101,117,101,0,0,0,99,108,82,101,108,101,97,115,101,77,101,109,79,98,106,101,99,116,40,111,117,116,112,117,116,41,0,0,0,0,0,0,32,32,45,65,44,32,45,45,97,119,103,99,32,32,32,32,32,32,32,32,32,85,115,101,32,39,97,115,121,110,99,45,119,111,114,107,45,103,114,111,117,112,45,99,111,112,121,39,32,107,101,114,110,101,108,32,116,111,32,115,111,108,118,101,32,112,114,111,98,108,101,109,46,10,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,77,101,109,79,98,106,101,99,116,40,109,97,116,114,105,120,41,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,77,101,109,79,98,106,101,99,116,40,105,110,112,117,116,41,0,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,69,118,101,110,116,40,49,41,0,0,0,0,0,0,0,99,108,82,101,108,101,97,115,101,69,118,101,110,116,40,48,41,0,0,0,0,0,0,0,99,108,70,105,110,105,115,104,0,0,0,0,0,0,0,0,114,97,119,95,105,121,0,0,99,108,69,110,113,117,101,117,101,85,110,109,97,112,77,101,109,79,98,106,101,99,116,40,111,117,116,112,117,116,41,0,99,108,69,110,113,117,101,117,101,85,110,109,97,112,77,101,109,79,98,106,101,99,116,40,105,110,112,117,116,41,0,0,40,109,97,116,114,105,120,32,37,115,41,10,0,0,0,0,97,118,103,32,101,114,114,111,114,32,61,32,37,108,101,44,32,0,0,0,0,0,0,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,0,0,32,32,45,76,44,32,45,45,108,115,32,32,32,32,32,32,32,32,32,32,32,85,115,101,32,39,108,111,97,100,45,115,116,111,114,101,39,32,107,101,114,110,101,108,32,116,111,32,115,111,108,118,101,32,112,114,111,98,108,101,109,46,10,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,57,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,56,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,55,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,54,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,53,41,0,0,0,0,0,0,0,114,97,119,95,105,120,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,52,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,51,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,50,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,49,41,0,0,0,0,0,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,40,48,41,0,0,0,0,0,0,0,32,75,101,114,110,101,108,32,84,121,112,101,32,40,100,101,102,97,117,108,116,32,105,115,32,45,65,32,102,111,114,32,65,67,67,69,76,69,82,65,84,79,82,32,100,101,118,105,99,101,44,32,45,76,32,111,116,104,101,114,119,105,115,101,41,58,10,0,0,0,0,0,99,108,69,110,113,117,101,117,101,85,110,109,97,112,77,101,109,79,98,106,101,99,116,40,111,117,116,112,117,116,95,97,114,114,97,121,41,0,0,0,99,108,69,110,113,117,101,117,101,85,110,109,97,112,77,101,109,79,98,106,101,99,116,40,105,110,112,117,116,95,97,114,114,97,121,41,0,0,0,0,99,108,69,110,113,117,101,117,101,85,110,109,97,112,77,101,109,79,98,106,101,99,116,40,116,105,108,101,98,117,102,102,101,114,41,0,0,0,0,0,99,108,69,110,113,117,101,117,101,77,97,112,66,117,102,102,101,114,40,111,117,116,112,117,116,95,97,114,114,97,121,41,0,0,0,0,0,0,0,0,99,108,69,110,113,117,101,117,101,77,97,112,66,117,102,102,101,114,40,116,105,108,101,98,117,102,102,101,114,41,0,0,70,97,105,108,101,100,32,97,108,108,111,99,97,116,105,111,110,32,111,102,32,37,108,108,100,32,98,121,116,101,115,32,102,111,114,32,37,115,10,0,99,108,69,110,113,117,101,117,101,77,97,112,66,117,102,102,101,114,40,105,110,112,117,116,95,97,114,114,97,121,41,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,111,117,116,112,117,116,95,98,117,102,102,101,114,41,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,109,97,116,114,105,120,95,98,117,102,102,101,114,41,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,105,110,112,117,116,95,98,117,102,102,101,114,41,0,0,0,0,105,110,115,117,102,102,105,99,105,101,110,116,32,109,101,109,111,114,121,32,116,111,32,112,101,114,102,111,114,109,32,116,104,105,115,32,119,111,114,107,108,111,97,100,46,10,0,0,32,32,45,97,44,32,45,45,97,99,99,101,108,32,32,32,32,32,32,32,32,85,115,101,32,65,67,67,69,76,69,82,65,84,79,82,32,100,101,118,105,99,101,32,102,111,114,32,107,101,114,110,101,108,32,99,111,109,112,117,116,97,116,105,111,110,115,46,10,0,0,0,111,117,116,112,117,116,95,97,114,114,97,121,95,118,101,114,105,102,121,0,0,0,0,0,99,111,101,114,99,105,110,103,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,116,111,32,102,105,116,32,119,105,116,104,105,110,32,104,97,114,100,119,97,114,101,32,108,105,109,105,116,115,46,32,32,78,101,119,32,115,105,122,101,32,105,115,32,37,100,10,0,0,0,0,0,0,0,0,99,108,71,101,116,75,101,114,110,101,108,87,111,114,107,71,114,111,117,112,73,110,102,111,40,67,76,95,75,69,82,78,69,76,95,76,79,67,65,76,95,77,69,77,95,83,73,90,69,41,0,0,0,0,0,0,80,79,83,73,88,76,89,95,67,79,82,82,69,67,84,0,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,40,67,76,95,68,69,86,73,67,69,95,76,79,67,65,76,95,77,69,77,95,83,73,90,69,41,0,0,0,0,0,0,0,99,108,71,101,116,75,101,114,110,101,108,87,111,114,107,71,114,111,117,112,73,110,102,111,40,67,76,95,75,69,82,78,69,76,95,87,79,82,75,95,71,82,79,85,80,95,83,73,90,69,41,0,0,0,0,0,37,100,32,37,100,32,37,100,10,0,0,0,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,40,67,76,95,68,69,86,73,67,69,95,77,69,77,95,66,65,83,69,95,65,68,68,82,95,65,76,73,71,78,41,0,0,107,101,114,110,101,108,95,97,119,103,99,0,0,0,0,0,107,101,114,110,101,108,95,108,115,0,0,0,0,0,0,0,87,101,39,108,108,32,114,117,110,32,107,101,114,110,101,108,32,37,115,32,111,110,32,100,101,118,105,99,101,32,37,115,10,0,0,0,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,40,67,76,95,68,69,86,73,67,69,95,78,65,77,69,41,0,100,101,118,105,99,101,32,110,97,109,101,0,0,0,0,0,32,32,45,103,44,32,45,45,103,112,117,32,32,32,32,32,32,32,32,32,32,85,115,101,32,71,80,85,32,100,101,118,105,99,101,32,102,111,114,32,107,101,114,110,101,108,32,99,111,109,112,117,116,97,116,105,111,110,115,46,10,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,40,115,105,122,101,32,111,102,32,67,76,95,68,69,86,73,67,69,95,78,65,77,69,41,0,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,0,0,99,108,66,117,105,108,100,80,114,111,103,114,97,109,0,0,103,101,110,101,114,97,108,0,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,97,100,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,32,102,114,111,109,32,102,105,108,101,33,10,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,0,110,111,32,100,101,118,105,99,101,115,32,111,102,32,116,104,101,32,114,101,113,117,101,115,116,101,100,32,116,121,112,101,32,119,101,114,101,32,102,111,117,110,100,32,111,110,32,116,104,105,115,32,115,121,115,116,101,109,46,32,32,76,101,97,118,105,110,103,46,46,46,10,0,0,0,0,0,0,0,0,110,111,32,100,101,118,105,99,101,115,32,111,102,32,97,110,121,32,107,105,110,100,32,119,101,114,101,32,102,111,117,110,100,32,111,110,32,116,104,105,115,32,115,121,115,116,101,109,46,32,32,76,101,97,118,105,110,103,46,46,46,10,0,0,32,32,45,99,44,32,45,45,99,112,117,32,32,32,32,32,32,32,32,32,32,85,115,101,32,67,80,85,32,100,101,118,105,99,101,32,102,111,114,32,107,101,114,110,101,108,32,99,111,109,112,117,116,97,116,105,111,110,115,46,10,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,40,100,101,118,105,99,101,32,116,121,112,101,41,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,40,108,105,115,116,32,111,102,32,100,101,118,105,99,101,32,73,68,115,41,0,0,0,0,0,0,116,109,112,100,101,118,105,99,101,115,0,0,0,0,0,0,100,101,118,105,99,101,32,115,116,114,117,99,116,117,114,101,0,0,0,0,0,0,0,0,112,97,116,116,101,114,110,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,40,110,117,109,98,101,114,32,111,102,32,100,101,118,105,99,101,115,41,0,0,0,0,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,73,110,102,111,40,112,108,97,116,102,111,114,109,32,110,97,109,101,41,0,0,0,0,0,0,0,0,112,108,97,116,102,111,114,109,32,110,97,109,101,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,73,110,102,111,40,115,105,122,101,32,111,102,32,112,108,97,116,102,111,114,109,32,110,97,109,101,41,0,0,0,0,0,0,0,0,37,115,32,0,0,0,0,0,99,111,109,109,97,110,100,32,108,105,110,101,58,32,0,0,10,0,0,0,0,0,0,0,32,68,101,118,105,99,101,32,84,121,112,101,58,10,0,0,91,83,84,65,82,84,32,82,85,78,93,10,0,0,0,0,101,101,107,33,10,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,32,73,68,115,40,80,108,97,116,102,111,114,109,32,73,68,115,41,0,42,115,101,103,95,119,111,114,107,115,112,97,99,101,0,0,116,101,109,112,95,112,108,97,116,102,111,114,109,95,105,100,95,97,114,114,97,121,0,0,114,111,119,95,99,117,114,114,0,0,0,0,0,0,0,0,98,117,102,102,101,114,0,0,114,111,119,95,115,116,97,114,116,0,0,0,0,0,0,0,101,114,114,111,114,32,114,101,97,100,105,110,103,32,109,97,116,114,105,120,32,109,97,114,107,101,116,32,102,111,114,109,97,116,32,104,101,97,100,101,114,32,108,105,110,101,10,0,112,108,97,116,102,111,114,109,0,0,0,0,0,0,0,0,40,109,103,115,45,62,115,108,97,98,95,115,116,97,114,116,114,111,119,41,0,0,0,0,70,97,105,108,101,100,32,97,108,108,111,99,97,116,105,111,110,32,111,102,32,37,108,108,100,32,98,121,116,101,115,32,102,111,114,32,37,115,10,0,99,111,101,114,99,105,110,103,32,103,112,117,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,116,111,32,102,105,116,32,119,105,116,104,105,110,32,104,97,114,100,119,97,114,101,32,108,105,109,105,116,115,46,32,32,78,101,119,32,115,105,122,101,32,105,115,32,37,100,10,0,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,73,68,115,40,110,117,109,95,112,108,97,116,102,111,114,109,115,41,0,99,111,101,114,115,105,110,103,32,103,112,117,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,116,111,32,110,101,120,116,32,108,111,119,101,114,32,112,111,119,101,114,32,111,102,32,50,44,32,119,104,105,99,104,32,105,115,32,37,100,10,0,0,0,0,0,37,115,32,102,97,105,108,101,100,46,32,114,99,32,61,32,37,100,10,0,0,0,0,0,99,111,101,114,99,105,110,103,32,103,112,117,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,116,111,32,77,73,78,32,87,79,82,75,32,71,82,79,85,80,32,83,73,90,69,44,32,119,104,105,99,104,32,105,115,32,49,54,10,0,0,0,0,0,0,0,37,115,58,32,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,39,37,115,39,46,10,0,0,99,111,101,114,99,105,110,103,32,103,112,117,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,116,111,32,77,65,88,32,87,79,82,75,32,71,82,79,85,80,32,83,73,90,69,44,32,119,104,105,99,104,32,105,115,32,37,100,10,0,0,0,0,0,0,0,84,114,121,32,39,37,115,32,45,45,104,101,108,112,39,32,102,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,46,10,0,0,115,108,97,98,95,115,116,97,114,116,114,111,119,0,0,0,78,111,116,101,58,32,60,109,97,116,114,105,120,102,105,108,101,62,32,115,104,111,117,108,100,32,105,110,99,108,117,100,101,32,116,104,101,32,114,101,108,97,116,105,118,101,32,112,97,116,104,32,102,114,111,109,32,116,104,105,115,32,101,120,101,99,117,116,97,98,108,101,46,10,0,0,0,0,0,0,104,97,99,103,76,65,108,58,102,58,0,0,0,0,0,0,37,115,58,32,0,0,0,0,114,111,119,95,105,110,100,101,120,95,97,114,114,97,121,0,102,105,108,101,110,97,109,101,0,0,0,0,0,0,0,0,120,95,105,110,100,101,120,95,97,114,114,97,121,0,0,0,108,119,103,115,105,122,101,0,100,97,116,97,95,97,114,114,97,121,0,0,0,0,0,0,118,101,114,105,102,121,0,0,110,120,32,61,32,37,100,44,32,110,121,32,61,32,37,100,44,32,110,111,110,95,122,101,114,111,32,61,32,37,100,44,32,100,101,110,115,105,116,121,32,61,32,37,102,10,0,0,37,49,57,115,32,37,49,57,115,32,37,49,57,115,32,37,49,57,115,32,37,49,57,115,10,0,0,0,0,0,0,0,97,119,103,99,0,0,0,0,108,105,110,101,95,120,95,105,110,100,101,120,95,97,114,114,97,121,91,105,93,0,0,0,108,115,0,0,0,0,0,0,108,105,110,101,95,100,97,116,97,95,97,114,114,97,121,91,105,93,0,0,0,0,0,0,103,112,117,0,0,0,0,0,101,120,112,108,105,99,105,116,95,122,101,114,111,95,99,111,117,110,116,32,61,32,37,100,10,0,0,0,0,0,0,0,99,112,117,0,0,0,0,0,103,97,112,32,105,110,32,116,104,101,32,105,110,112,117,116,32,40,110,111,110,45,105,110,118,101,114,116,105,98,108,101,32,109,97,116,114,105,120,41,58,32,105,32,61,32,37,100,44,32,105,121,32,61,32,37,100,44,32,99,117,114,114,121,32,61,32,37,100,10,0,0,97,99,99,101,108,0,0,0,37,108,102,10,0,0,0,0,104,101,108,112,0,0,0,0,37,100,32,37,100,10,0,0,85,115,97,103,101,58,32,115,112,109,118,32,45,102,32,60,109,97,116,114,105,120,102,105,108,101,62,32,91,100,101,118,105,99,101,95,116,121,112,101,93,32,91,107,101,114,110,101,108,95,116,121,112,101,93,32,91,111,112,116,105,111,110,115,93,10,0,0,0,0,0,0,115,112,109,118,46,109,109,0,99,111,117,110,116,95,97,114,114,97,121,0,0,0,0,0,32,32,45,104,44,32,45,45,104,101,108,112,32,32,32,32,32,32,32,32,32,80,114,105,110,116,32,116,104,105,115,32,117,115,97,103,101,32,109,101,115,115,97,103,101,46,10,0,108,105,110,101,95,120,95,105,110,100,101,120,95,97,114,114,97,121,0,0,0,0,0,0,32,32,45,108,44,32,45,45,108,119,103,115,105,122,101,32,91,110,93,32,32,83,112,101,99,105,102,121,32,108,111,99,97,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,102,111,114,32,71,80,85,32,117,115,101,32,40,99,111,101,114,99,101,100,32,116,111,32,112,111,119,101,114,32,111,102,32,50,41,46,10,0,0,0,0,0,0,0,0,108,105,110,101,95,100,97,116,97,95,97,114,114,97,121,0,32,79,112,116,105,111,110,115,32,40,97,108,108,32,111,112,116,105,111,110,115,32,100,101,102,97,117,108,116,32,116,111,32,39,110,111,116,32,115,101,108,101,99,116,101,100,39,41,58,10,0,0,0,0,0,0,109,97,108,108,111,99,32,102,97,105,108,101,100,10,0,0,67,111,117,108,100,110,39,116,32,111,112,101,110,32,37,115,10,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,114,97,119,95,100,97,116,97,0,0,0,0,0,0,0,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,109,97,120,116,114,105,120,32,102,105,108,101,32,37,115,10,0,0,114,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
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
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
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
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
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
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
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
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
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
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
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
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
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
            current = current.mount.root;
          }
          // follow symlinks
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
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
          FS.FSNode.prototype = {};
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
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
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
        fd_start = fd_start || 1;
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
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
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
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
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
        var lookup = FS.lookupPath(path, { follow: false });
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
        mode = typeof mode === 'undefined' ? 0666 : mode;
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
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
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
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
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
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
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
          this.stack = stackTrace();
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
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
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
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
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
      }};
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
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
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
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
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
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
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
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
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
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
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
          } else {
            var precision = 6; // Standard default.
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
              HEAP32[((ptr)>>2)]=ret.length
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
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
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
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
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
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
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
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
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
      stream = FS.getStream(stream);
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
      var streamObj = FS.getStream(stream);
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
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___libgenSplitName(path) {
      if (path === 0 || HEAP8[(path)] === 0) {
        // Null or empty results in '.'.
        var me = ___libgenSplitName;
        if (!me.ret) {
          me.ret = allocate([46, 0], 'i8', ALLOC_NORMAL);
        }
        return [me.ret, -1];
      } else {
        var slash = 47;
        var allSlashes = true;
        var slashPositions = [];
        for (var i = 0; HEAP8[(((path)+(i))|0)] !== 0; i++) {
          if (HEAP8[(((path)+(i))|0)] === slash) {
            slashPositions.push(i);
          } else {
            allSlashes = false;
          }
        }
        var length = i;
        if (allSlashes) {
          // All slashes result in a single slash.
          HEAP8[(((path)+(1))|0)]=0
          return [path, -1];
        } else {
          // Strip trailing slashes.
          while (slashPositions.length &&
                 slashPositions[slashPositions.length - 1] == length - 1) {
            HEAP8[(((path)+(slashPositions.pop(i)))|0)]=0
            length--;
          }
          return [path, slashPositions.pop()];
        }
      }
    }function _basename(path) {
      // char *basename(char *path);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/basename.html
      var result = ___libgenSplitName(path);
      return result[0] + result[1] + 1;
    }
  function _chdir(path) {
      // int chdir(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/chdir.html
      // NOTE: The path argument may be a string, to simplify fchdir().
      if (typeof path !== 'string') path = Pointer_stringify(path);
      try {
        FS.chdir(path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _dirname(path) {
      // char *dirname(char *path);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/dirname.html
      var result = ___libgenSplitName(path);
      if (result[1] == 0) {
        HEAP8[(((result[0])+(1))|0)]=0
      } else if (result[1] !== -1) {
        HEAP8[(((result[0])+(result[1]))|0)]=0
      }
      return result[0];
    }
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
        HEAP32[((endptr)>>2)]=str
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
        return tempRet0 = (tempDouble=ret,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0),ret>>>0;
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while (HEAP8[(((psrc)+(i-1))|0)]);
      return pdest|0;
    }
  var GL={counter:1,lastError:0,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],currArrayBuffer:0,currElementArrayBuffer:0,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},packAlignment:4,unpackAlignment:4,init:function () {
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
      },MINI_TEMP_BUFFER_SIZE:16,miniTempBuffer:null,miniTempBufferViews:[0],MAX_TEMP_BUFFER_SIZE:2097152,tempBufferIndexLookup:null,tempVertexBuffers:null,tempIndexBuffers:null,tempQuadIndexBuffer:null,generateTempBuffers:function (quads) {
        GL.tempBufferIndexLookup = new Uint8Array(GL.MAX_TEMP_BUFFER_SIZE+1);
        GL.tempVertexBuffers = [];
        GL.tempIndexBuffers = [];
        var last = -1, curr = -1;
        var size = 1;
        for (var i = 0; i <= GL.MAX_TEMP_BUFFER_SIZE; i++) {
          if (i > size) {
            size <<= 1;
          }
          if (size != last) {
            curr++;
            GL.tempVertexBuffers[curr] = Module.ctx.createBuffer();
            Module.ctx.bindBuffer(Module.ctx.ARRAY_BUFFER, GL.tempVertexBuffers[curr]);
            Module.ctx.bufferData(Module.ctx.ARRAY_BUFFER, size, Module.ctx.DYNAMIC_DRAW);
            Module.ctx.bindBuffer(Module.ctx.ARRAY_BUFFER, null);
            GL.tempIndexBuffers[curr] = Module.ctx.createBuffer();
            Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, GL.tempIndexBuffers[curr]);
            Module.ctx.bufferData(Module.ctx.ELEMENT_ARRAY_BUFFER, size, Module.ctx.DYNAMIC_DRAW);
            Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, null);
            last = size;
          }
          GL.tempBufferIndexLookup[i] = curr;
        }
        if (quads) {
          // GL_QUAD indexes can be precalculated
          GL.tempQuadIndexBuffer = Module.ctx.createBuffer();
          Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, GL.tempQuadIndexBuffer);
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
          Module.ctx.bufferData(Module.ctx.ELEMENT_ARRAY_BUFFER, quadIndexes, Module.ctx.STATIC_DRAW);
          Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, null);
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
        type = Module.ctx.getShaderParameter(GL.shaders[shader], 0x8B4F /* GL_SHADER_TYPE */);
        if (type == 0x8B30 /* GL_FRAGMENT_SHADER */) {
          if (GL.findToken(source, "dFdx") ||
              GL.findToken(source, "dFdy") ||
              GL.findToken(source, "fwidth")) {
            source = "#extension GL_OES_standard_derivatives : enable\n" + source;
            var extension = Module.ctx.getExtension("OES_standard_derivatives");
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
        var ret = undefined;
        switch(name_) { // Handle a few trivial GLES values
          case 0x8DFA: // GL_SHADER_COMPILER
            ret = 1;
            break;
          case 0x8DF8: // GL_SHADER_BINARY_FORMATS
            if (type === 'Integer') {
              // fall through, see gles2_conformance.cpp
            } else {
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
            }
          case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
            ret = 0;
            break;
          case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
            // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be queried for length),
            // so implement it ourselves to allow C++ GLES2 code get the length.
            var formats = Module.ctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
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
          var result = Module.ctx.getParameter(name_);
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
                GL.recordError(0x0500); // GL_INVALID_ENUM
                return;
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
            internalFormat = Module.ctx.RGBA;
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
      },initExtensions:function () {
        if (GL.initExtensions.done) return;
        GL.initExtensions.done = true;
        if (!Module.useWebGL) return; // an app might link both gl and 2d backends
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
          GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i+1);
        }
        GL.maxVertexAttribs = Module.ctx.getParameter(Module.ctx.MAX_VERTEX_ATTRIBS);
        // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist. 
        GL.compressionExt = Module.ctx.getExtension('WEBGL_compressed_texture_s3tc') ||
                            Module.ctx.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                            Module.ctx.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
        GL.anisotropicExt = Module.ctx.getExtension('EXT_texture_filter_anisotropic') ||
                            Module.ctx.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                            Module.ctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        GL.floatExt = Module.ctx.getExtension('OES_texture_float');
        // Tested on WebKit and FF25
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
                                               "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources" ];
        function shouldEnableAutomatically(extension) {
          for(var i in automaticallyEnabledExtensions) {
            var include = automaticallyEnabledExtensions[i];
            if (ext.indexOf(include) != -1) {
              return true;
            }
          }
          return false;
        }
        var extensions = Module.ctx.getSupportedExtensions();
        for(var e in extensions) {
          var ext = extensions[e].replace('MOZ_', '').replace('WEBKIT_', '');
          if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
            Module.ctx.getExtension(ext); // Calling .getExtension enables that extension permanently, no need to store the return value to be enabled.
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
        var numUniforms = Module.ctx.getProgramParameter(p, Module.ctx.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; ++i) {
          var u = Module.ctx.getActiveUniform(p, i);
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
          var loc = Module.ctx.getUniformLocation(p, name);
          var id = GL.getNewId(GL.uniforms);
          utable[name] = [u.size, id];
          GL.uniforms[id] = loc;
          for (var j = 1; j < u.size; ++j) {
            var n = name + '['+j+']';
            loc = Module.ctx.getUniformLocation(p, n);
            id = GL.getNewId(GL.uniforms);
            GL.uniforms[id] = loc;
          }
        }
      }};var CL={cl_init:0,cl_extensions:["KHR_GL_SHARING","KHR_fp16","KHR_fp64"],cl_digits:[1,2,3,4,5,6,7,8,9,0],cl_kernels_sig:{},cl_structs_sig:{},cl_pn_type:[],cl_objects:{},cl_objects_map:{},cl_objects_retains:{},cl_elapsed_time:0,cl_objects_counter:0,init:function () {
        if (CL.cl_init == 0) {
          console.log('%c WebCL-Translator V2.0 by Anthony Liot & Steven Eliuk ! ', 'background: #222; color: #bada55');
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
            webcl["SAMPLER"]          = 0x1300;
            webcl["IMAGE2D"]          = 0x1301;
            webcl["UNSIGNED_LONG"]    = 0x1302;
            webcl["MAP_READ"]         = 0x1; 
            webcl["MAP_WRITE"]        = 0x2;
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
          CL.cl_objects_counter++;
          //console.info("Counter++ HashMap Object : " + CL.cl_objects_counter + " - Udid : " + _id);
        }
        return _id;      
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
          case webcl.UNSIGNED_LONG:
            return 'ULONG';          
          case webcl.FLOAT:
            return 'FLOAT';
          case webcl.LOCAL:
            return '__local';   
          case webcl.SAMPLER:
            return 'sampler_t';   
          case webcl.IMAGE2D:
            return 'image2d_t';          
          default:
            if (typeof(pn_type) == "string") return 'struct';
            return 'UNKNOWN';
        }
      },parseType:function (string) {
        var _value = -1;
        // First ulong for the webcl validator
        if ( (string.indexOf("ulong") >= 0 ) || (string.indexOf("unsigned long") >= 0 ) ) {
          // \todo : long ???? 
          _value = webcl.UNSIGNED_LONG;  
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
        } else if ( string.indexOf("image2d_t") >= 0 ) {
          _value = webcl.IMAGE2D;
        } else if ( string.indexOf("sampler_t") >= 0 ) {
          _value = webcl.SAMPLER;
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
        var _security = 10;
        // Search all the kernel
        while (_found && _security) {
          // Just in case no more than 10 loop
          _security --;
          var _kern = _stringKern.indexOf("__kernel");
          if (_kern == -1) {
            _found = 0;
            continue;
          }
          _stringKern = _stringKern.substr(_kern + 8,_stringKern.length - _kern);
          var _brace = _stringKern.indexOf("{");
          var _stringKern2 = _stringKern.substr(0,_brace);
          var _braceOpen = _stringKern2.lastIndexOf("(");
          var _braceClose = _stringKern2.lastIndexOf(")");
          var _stringKern3 = _stringKern2.substr(0,_braceOpen);
          var _space = _stringKern3.lastIndexOf(" ");
          _stringKern2 = _stringKern2.substr(_space,_braceClose);
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
          // Do not reparse again if the file was already parse (ie: Reduce sample)
          if (_name in CL.cl_kernels_sig) return;
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
        for (var name in CL.cl_kernels_sig) {
          var _length = CL.cl_kernels_sig[name].length;
          var _str = "";
          for (var i = 0; i < _length ; i++) {
            var _type = CL.cl_kernels_sig[name][i];
            _str += _type + "("+CL.stringType(_type)+")";
            if (i < _length - 1) _str += ", ";
          }
          console.info("Kernel " + name + "(" + _length + ")");  
          console.info("\t" + _str);  
        }
        for (var name in CL.cl_structs_sig) {
          var _length = CL.cl_structs_sig[name].length;
          var _str = "";
          for (var i = 0; i < _length ; i++) {
            var _type = CL.cl_structs_sig[name][i];
            _str += _type + "("+CL.stringType(_type)+")";
            if (i < _length - 1) _str += ", ";
          }
          console.info("\n\tStruct " + name + "(" + _length + ")");  
          console.info("\t\t" + _str);              
        }
        return _mini_kernel_string;
      },getImageSizeType:function (image) {
        var _sizeType = 0;
        var _info = CL.cl_objects[image].getInfo(webcl.IMAGE_FORMAT);
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
        var _info = CL.cl_objects[image].getInfo(webcl.IMAGE_FORMAT);
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
            _type = SIGNED_INT32;
          case webcl.UNSIGNED_INT32:
            _type = UNSIGNED_INT32;
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
        var _info = CL.cl_objects[image].getInfo(webcl.IMAGE_FORMAT);
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
  function _clGetPlatformInfo(platform,param_name,param_value_size,param_value,param_value_size_ret) {
      var _info = null;
      try { 
        _info = CL.cl_objects[platform].getInfo(param_name);
      } catch (e) {
        var _error = CL.catchError(e);
        var _info = "undefined";
        if (param_value != 0) {
          writeStringToMemory(_info, param_value);
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=_info.length;
        }
        return _error;
      }
      if (param_value != 0) {
        writeStringToMemory(_info, param_value);
      }
      if (param_value_size_ret != 0) {
        HEAP32[((param_value_size_ret)>>2)]=_info.length;
      }
      return webcl.SUCCESS;
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
  function _clGetDeviceInfo(device,param_name,param_value_size,param_value,param_value_size_ret) {
      var  _info = null;
      try { 
          var _object = CL.cl_objects[device];
          _info = _object.getInfo(param_name);
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
          if (param_value != 0) (tempI64 = [_info>>>0,(Math_abs(_info) >= 1 ? (_info > 0 ? Math_min(Math_floor((_info)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((_info - +(((~~(_info)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((param_value)>>2)]=tempI64[0],HEAP32[(((param_value)+(4))>>2)]=tempI64[1]);
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=8;
        } else {
          if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
        } 
      } else if(typeof(_info) == "boolean") {
        if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
      } else if(typeof(_info) == "string") {
        if (param_value != 0) writeStringToMemory(_info, param_value);
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length;
      } else if(typeof(_info) == "object") {
        if (_info instanceof Int32Array) {
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
  function _clCreateContext(properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret) {
      // Init webcl variable if necessary
      if (CL.init() == 0) {
        return webcl.INVALID_VALUE;
      }
      var _id = null;
      var _context = null;
      try { 
        var _platform = null;
        var _devices = [];
        var _deviceType = null;
        var _glclSharedContext = false;
        // Verify the device, theorically on OpenCL there are CL_INVALID_VALUE when devices or num_devices is null,
        // WebCL can work using default device / platform, we check only if parameter are set.
        for (var i = 0; i < num_devices; i++) {
          var _idxDevice = HEAP32[(((devices)+(i*4))>>2)];
            _devices.push(CL.cl_objects[_idxDevice]);
        }
        // Verify the property
        if (properties != 0) {
          var _propertiesCounter = 0;
          while(1) {
            var _readprop = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
            if (_readprop == 0) break;
            switch (_readprop) {
              case webcl.CONTEXT_PLATFORM:
                _propertiesCounter ++;
                var _idxPlatform = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
                  _platform = CL.cl_objects[_idxPlatform];
                break;
              // /!\ This part, it's for the CL_GL_Interop
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
        var _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
        if (_glclSharedContext)
          _context = webcl.createContext(Module.ctx, _prop);
        else
          _context = webcl.createContext(_prop);
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
      return _id;
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
  function _clBuildProgram(program,num_devices,device_list,options,pfn_notify,user_data) {
      try {
        var _devices = [];
        var _option = (options == 0) ? "" : Pointer_stringify(options); 
        // \todo need to be remove when webkit work with -D
        // if (navigator.userAgent.toLowerCase().indexOf('firefox') == -1) {
        //   _option = _option.replace(/-D/g, "-D ");
        //   _option = _option.replace(/-D\s{2,}/g, "-D ");
        // }
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
          _callback = function() { FUNCTION_TABLE[pfn_notify](program, user_data) };
        }
        CL.cl_objects[program].build(_devices,_option,_callback);
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;      
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
  function _clEnqueueWriteBuffer(command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
      var _event_wait_list = [];
      var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);
      for (var i = 0; i < num_events_in_wait_list; i++) {
        var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
        _event_wait_list.push(CL.cl_objects[_event_wait]);
      } 
      try {
        if (event != 0) {
          var _event = new WebCLEvent();
          CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event);    
          HEAP32[((event)>>2)]=CL.udid(_event);
        } else {
          CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list);    
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
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
        }
        return 0; 
      }
      var _host_ptr = null;
      if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
        _host_ptr = new ArrayBuffer(size);
      } else if ( (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) || (host_ptr != 0 && (flags_i64_1 & (1 << 3) /* CL_MEM_USE_HOST_PTR */)) ) {      
        _host_ptr = CL.getCopyPointerToArray(host_ptr,size,CL.cl_pn_type);      
      } else if (flags_i64_1 & ~_flags) {
        console.error("clCreateBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
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
  function _clEnqueueReadBuffer(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
      var _event_wait_list = [];
      var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);
      for (var i = 0; i < num_events_in_wait_list; i++) {
        var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
        _event_wait_list.push(CL.cl_objects[_event_wait]);
      } 
      try {
        if (event != 0) {
          var _event = new WebCLEvent();
          CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event);
          HEAP32[((event)>>2)]=CL.udid(_event);
        } else {
          CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list);
        } 
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;    
    }function _clEnqueueMapBuffer(command_queue,buffer,blocking_map,map_flags_i64_1,map_flags_i64_2,offset,cb,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
      // Assume the map_flags is i32 
      assert(map_flags_i64_2 == 0, 'Invalid map flags i64');
      var mapped_ptr = _malloc(cb);
      // { SIZE , BLOCKING_MAP , OFFSET }
      CL.cl_objects_map[mapped_ptr] = {"size":cb,"blocking":blocking_map,"offset":offset,"mode":map_flags_i64_1};
      if (CL.cl_objects_map[mapped_ptr]["mode"] == webcl.MAP_READ) {
        // Call write buffer .... may be add try ... catch
        _clEnqueueReadBuffer(command_queue,buffer,CL.cl_objects_map[mapped_ptr]["blocking"],CL.cl_objects_map[mapped_ptr]["offset"],CL.cl_objects_map[mapped_ptr]["size"],mapped_ptr,num_events_in_wait_list,event_wait_list,event);
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=webcl.SUCCESS;
      }
      return mapped_ptr;
    }
  function _clEnqueueUnmapMemObject(command_queue,memobj,mapped_ptr,num_events_in_wait_list,event_wait_list,event) {
      if (CL.cl_objects_map[mapped_ptr]["mode"] == webcl.MAP_WRITE) {
        // Call write buffer .... may be add try ... catch
        _clEnqueueWriteBuffer(command_queue,memobj,CL.cl_objects_map[mapped_ptr]["blocking"],CL.cl_objects_map[mapped_ptr]["offset"],CL.cl_objects_map[mapped_ptr]["size"],mapped_ptr,num_events_in_wait_list,event_wait_list,event);
      }
      // Remove the object from the map
      delete CL.cl_objects[mapped_ptr];
      // Free malloc
      _free(mapped_ptr);
      return webcl.SUCCESS; 
    }
  function _clWaitForEvents(num_events,event_list) {
      var _events = [];
      for (var i = 0; i < num_events; i++) {
        var _event = HEAP32[(((event_list)+(i*4))>>2)];
        _events.push(CL.cl_objects[_event]) 
      }
      try {
        webcl.waitForEvents(_events);
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;
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
    }var _llvm_memset_p0i8_i32=_memset;
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
  function _clEnqueueNDRangeKernel(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
      var _event_wait_list = [];
      var _global_work_offset = [];
      var _global_work_size = [];
      var _local_work_size = [];
      for (var i = 0; i < work_dim; i++) {
        _global_work_size.push(HEAP32[(((global_work_size)+(i*4))>>2)]);
        if (global_work_offset != 0)
          _global_work_offset.push(HEAP32[(((global_work_offset)+(i*4))>>2)]);
        if (local_work_size != 0)
          _local_work_size.push(HEAP32[(((local_work_size)+(i*4))>>2)]);
      }
      for (var i = 0; i < num_events_in_wait_list; i++) {
        var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
        _event_wait_list.push(CL.cl_objects[_event_wait]);
      }
      try { 
        if (event != 0) {
          var _event = new WebCLEvent();
          CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event);  
          HEAP32[((event)>>2)]=CL.udid(_event);
        } else {
          CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list);  
        }
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;    
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
  function _clReleaseEvent(event) {
      // If is an object retain don't release it ...
      if (event in CL.cl_objects_retains) {
        return webcl.SUCCESS;
      }
      try {
        CL.cl_objects[event].release();
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      delete CL.cl_objects[event];
      CL.cl_objects_counter--;
      return webcl.SUCCESS;
    }
  function _clReleaseMemObject(memobj) {
      // If is an object retain don't release it ...
      if (memobj in CL.cl_objects_retains) {
        return webcl.SUCCESS;
      }
      try {
        CL.cl_objects[memobj].release();
        delete CL.cl_objects[memobj];
        CL.cl_objects_counter--;
        //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + memobj);
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;
    }
  function _clReleaseCommandQueue(command_queue) {
      // If is an object retain don't release it ...
      if (command_queue in CL.cl_objects_retains) {
        return webcl.SUCCESS;
      }
      try {
          CL.cl_objects[command_queue].release();
          delete CL.cl_objects[command_queue];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + command_queue);
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;
    }
  function _clReleaseKernel(kernel) {
      // If is an object retain don't release it ...
      if (kernel in CL.cl_objects_retains) {
        return webcl.SUCCESS;
      }
      try {
        CL.cl_objects[kernel].release();
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      delete CL.cl_objects[kernel];
      CL.cl_objects_counter--;
      return webcl.SUCCESS;
    }
  function _clReleaseProgram(program) {
      // If is an object retain don't release it ...
      if (program in CL.cl_objects_retains) {
        return webcl.SUCCESS;
      }
      try {
          CL.cl_objects[program].release();
          delete CL.cl_objects[program];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + program);
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;
    }
  function _clReleaseContext(context) {
      // If is an object retain don't release it ...
      if (context in CL.cl_objects_retains) {
        return webcl.SUCCESS;
      }
      try {
          CL.cl_objects[context].release();
          delete CL.cl_objects[context];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + context);
      } catch (e) {
        var _error = CL.catchError(e);
        return _error;
      }
      return webcl.SUCCESS;
    }
  function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      path = typeof path !== 'string' ? Pointer_stringify(path) : path;
      try {
        var stat = dontResolveLastLink ? FS.lstat(path) : FS.stat(path);
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode
        HEAP32[(((buf)+(16))>>2)]=stat.nlink
        HEAP32[(((buf)+(20))>>2)]=stat.uid
        HEAP32[(((buf)+(24))>>2)]=stat.gid
        HEAP32[(((buf)+(28))>>2)]=stat.rdev
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size
        HEAP32[(((buf)+(40))>>2)]=4096
        HEAP32[(((buf)+(44))>>2)]=stat.blocks
        HEAP32[(((buf)+(48))>>2)]=Math.floor(stat.atime.getTime() / 1000)
        HEAP32[(((buf)+(52))>>2)]=0
        HEAP32[(((buf)+(56))>>2)]=Math.floor(stat.mtime.getTime() / 1000)
        HEAP32[(((buf)+(60))>>2)]=0
        HEAP32[(((buf)+(64))>>2)]=Math.floor(stat.ctime.getTime() / 1000)
        HEAP32[(((buf)+(68))>>2)]=0
        HEAP32[(((buf)+(72))>>2)]=stat.ino
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }
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
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
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
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
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
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
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
          Module.ctx = ctx;
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
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
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
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
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
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
GL.init()
___buildEnvironment(ENV);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,__warnx,0];
// EMSCRIPTEN_START_FUNCS
function _matrix_gen($mgs){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+288)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $data_present;
 var $symmetric;
 var $preferred_alignment;
 var $preferred_alignment_by_elements;
 var $inputMTX;
 var $i;
 var $j;
 var $tmp=sp;
 var $pattern_flag=(sp)+(24);
 var $symmetric_flag=(sp)+(48);
 var $count_array=(sp)+(72);
 var $line_data_array=(sp)+(80);
 var $line_x_index_array=(sp)+(88);
 var $raw_data=(sp)+(96);
 var $raw_ix=(sp)+(104);
 var $raw_iy=(sp)+(112);
 var $curry;
 var $actual_non_zero;
 var $explicit_zero_count;
 var $ix=(sp)+(120);
 var $iy=(sp)+(128);
 var $data;
 var $double_data=(sp)+(136);
 var $density;
 var $min_compute_units;
 var $index;
 var $nslabs_base;
 var $target_workpacket;
 var $candidate_row;
 var $target_value;
 var $slabsize;
 var $slab_threshhold;
 var $nslabs;
 var $expected_nslabs;
 var $temp;
 var $biggest_slab;
 var $smallest_slab;
 var $totpackets;
 var $totslabs;
 var $row_start=(sp)+(144);
 var $row_curr=(sp)+(152);
 var $realdata;
 var $totaldata;
 var $current_slab;
 var $slab_ptr;
 var $seg_index;
 var $k;
 var $temp_count;
 var $acctg_maxcount;
 var $acctg_avgcount;
 var $nteams;
 var $jloop;
 var $foo;
 var $kk;
 var $count=(sp)+(160);
 var $maxcount;
 var $sum;
 var $countdex;
 var $first_team_offset;
 var $packet_offset;
 var $packet_count;
 var $kk1;
 var $count2=(sp)+(224);
 var $maxcount3;
 var $sum4;
 var $countdex5;
 var $tempmaxcount;
 var $tempavgcount;
 var $tempcount;
 var $npackets;
 var $curr_input_offset;
 var $next_input_offset;
 $2=$mgs;
 var $3=$2;
 var $4=(($3+52)|0);
 var $5=HEAP32[(($4)>>2)];
 $preferred_alignment=$5;
 var $6=$preferred_alignment;
 var $7=(((($6>>>0))/(4))&-1);
 $preferred_alignment_by_elements=$7;
 var $8=$preferred_alignment_by_elements;
 var $9=($8>>>0)<16;
 if($9){label=2;break;}else{label=3;break;}
 case 2: 
 $preferred_alignment_by_elements=16;
 label=3;break;
 case 3: 
 var $12=$2;
 var $13=(($12+48)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=_fopen($14,4704);
 $inputMTX=$15;
 var $16=$inputMTX;
 var $17=($16|0)==0;
 if($17){label=4;break;}else{label=5;break;}
 case 4: 
 var $19=$2;
 var $20=(($19+48)|0);
 var $21=HEAP32[(($20)>>2)];
 var $22=_printf(4672,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$21,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 5: 
 var $24=$inputMTX;
 var $25=(($tmp)|0);
 var $26=(($tmp)|0);
 var $27=(($tmp)|0);
 var $28=(($pattern_flag)|0);
 var $29=(($symmetric_flag)|0);
 var $30=_fscanf($24,4024,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$25,HEAP32[(((tempVarArgs)+(8))>>2)]=$26,HEAP32[(((tempVarArgs)+(16))>>2)]=$27,HEAP32[(((tempVarArgs)+(24))>>2)]=$28,HEAP32[(((tempVarArgs)+(32))>>2)]=$29,tempVarArgs)); STACKTOP=tempVarArgs;
 var $31=5!=($30|0);
 if($31){label=6;break;}else{label=7;break;}
 case 6: 
 var $33=HEAP32[((_stderr)>>2)];
 var $34=_fprintf($33,3224,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 7: 
 var $36=(($pattern_flag)|0);
 var $37=_strcmp($36,2888);
 $data_present=$37;
 var $38=(($symmetric_flag)|0);
 var $39=_strcmp($38,2456);
 $symmetric=$39;
 var $40=$inputMTX;
 var $41=$2;
 var $42=(($41+36)|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=$2;
 var $45=(($44+40)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=$2;
 var $48=(($47+44)|0);
 var $49=HEAP32[(($48)>>2)];
 var $50=_fscanf($40,2112,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$43,HEAP32[(((tempVarArgs)+(8))>>2)]=$46,HEAP32[(((tempVarArgs)+(16))>>2)]=$49,tempVarArgs)); STACKTOP=tempVarArgs;
 label=8;break;
 case 8: 
 var $52=$raw_ix;
 var $53=$preferred_alignment;
 var $54=$2;
 var $55=(($54+44)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=HEAP32[(($56)>>2)];
 var $58=($57<<2);
 var $59=_posix_memalign($52,$53,$58);
 var $60=HEAP32[(($raw_ix)>>2)];
 var $61=($60|0)==0;
 if($61){label=9;break;}else{label=10;break;}
 case 9: 
 var $63=$2;
 var $64=(($63+44)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=HEAP32[(($65)>>2)];
 var $67=($66<<2);
 var $68$0=$67;
 var $68$1=0;
 var $$etemp$1=1152;
 var $$etemp$0=1544;
 var $69=_printf($$etemp$0,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$68$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$68$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$1,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 10: 
 var $71=$raw_iy;
 var $72=$preferred_alignment;
 var $73=$2;
 var $74=(($73+44)|0);
 var $75=HEAP32[(($74)>>2)];
 var $76=HEAP32[(($75)>>2)];
 var $77=($76<<2);
 var $78=_posix_memalign($71,$72,$77);
 var $79=HEAP32[(($raw_iy)>>2)];
 var $80=($79|0)==0;
 if($80){label=11;break;}else{label=12;break;}
 case 11: 
 var $82=$2;
 var $83=(($82+44)|0);
 var $84=HEAP32[(($83)>>2)];
 var $85=HEAP32[(($84)>>2)];
 var $86=($85<<2);
 var $87$0=$86;
 var $87$1=0;
 var $$etemp$3=832;
 var $$etemp$2=1544;
 var $88=_printf($$etemp$2,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$87$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$87$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$3,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 12: 
 var $90=$raw_data;
 var $91=$preferred_alignment;
 var $92=$2;
 var $93=(($92+44)|0);
 var $94=HEAP32[(($93)>>2)];
 var $95=HEAP32[(($94)>>2)];
 var $96=($95<<2);
 var $97=_posix_memalign($90,$91,$96);
 var $98=HEAP32[(($raw_data)>>2)];
 var $99=($98|0)==0;
 if($99){label=13;break;}else{label=14;break;}
 case 13: 
 var $101=$2;
 var $102=(($101+44)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=HEAP32[(($103)>>2)];
 var $105=($104<<2);
 var $106$0=$105;
 var $106$1=0;
 var $$etemp$5=4656;
 var $$etemp$4=1544;
 var $107=_printf($$etemp$4,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$106$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$106$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$5,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 14: 
 var $109=$line_data_array;
 var $110=$preferred_alignment;
 var $111=$2;
 var $112=(($111+40)|0);
 var $113=HEAP32[(($112)>>2)];
 var $114=HEAP32[(($113)>>2)];
 var $115=($114<<2);
 var $116=_posix_memalign($109,$110,$115);
 var $117=HEAP32[(($line_data_array)>>2)];
 var $118=($117|0)==0;
 if($118){label=15;break;}else{label=16;break;}
 case 15: 
 var $120=$2;
 var $121=(($120+40)|0);
 var $122=HEAP32[(($121)>>2)];
 var $123=HEAP32[(($122)>>2)];
 var $124=($123<<2);
 var $125$0=$124;
 var $125$1=0;
 var $$etemp$7=4536;
 var $$etemp$6=1544;
 var $126=_printf($$etemp$6,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$125$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$125$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$7,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 16: 
 var $128=$line_x_index_array;
 var $129=$preferred_alignment;
 var $130=$2;
 var $131=(($130+40)|0);
 var $132=HEAP32[(($131)>>2)];
 var $133=HEAP32[(($132)>>2)];
 var $134=($133<<2);
 var $135=_posix_memalign($128,$129,$134);
 var $136=HEAP32[(($line_x_index_array)>>2)];
 var $137=($136|0)==0;
 if($137){label=17;break;}else{label=18;break;}
 case 17: 
 var $139=$2;
 var $140=(($139+40)|0);
 var $141=HEAP32[(($140)>>2)];
 var $142=HEAP32[(($141)>>2)];
 var $143=($142<<2);
 var $144$0=$143;
 var $144$1=0;
 var $$etemp$9=4416;
 var $$etemp$8=1544;
 var $145=_printf($$etemp$8,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$144$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$144$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$9,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 18: 
 var $147=$count_array;
 var $148=$preferred_alignment;
 var $149=$2;
 var $150=(($149+40)|0);
 var $151=HEAP32[(($150)>>2)];
 var $152=HEAP32[(($151)>>2)];
 var $153=($152<<2);
 var $154=_posix_memalign($147,$148,$153);
 var $155=HEAP32[(($count_array)>>2)];
 var $156=($155|0)==0;
 if($156){label=19;break;}else{label=20;break;}
 case 19: 
 var $158=$2;
 var $159=(($158+40)|0);
 var $160=HEAP32[(($159)>>2)];
 var $161=HEAP32[(($160)>>2)];
 var $162=($161<<2);
 var $163$0=$162;
 var $163$1=0;
 var $$etemp$11=4352;
 var $$etemp$10=1544;
 var $164=_printf($$etemp$10,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$163$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$163$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$11,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 20: 
 $i=0;
 label=21;break;
 case 21: 
 var $167=$i;
 var $168=$2;
 var $169=(($168+40)|0);
 var $170=HEAP32[(($169)>>2)];
 var $171=HEAP32[(($170)>>2)];
 var $172=($167>>>0)<($171>>>0);
 if($172){label=22;break;}else{label=24;break;}
 case 22: 
 var $174=$i;
 var $175=HEAP32[(($count_array)>>2)];
 var $176=(($175+($174<<2))|0);
 HEAP32[(($176)>>2)]=0;
 label=23;break;
 case 23: 
 var $178=$i;
 var $179=((($178)+(1))|0);
 $i=$179;
 label=21;break;
 case 24: 
 $actual_non_zero=0;
 $curry=0;
 $explicit_zero_count=0;
 $i=0;
 label=25;break;
 case 25: 
 var $182=$i;
 var $183=$2;
 var $184=(($183+44)|0);
 var $185=HEAP32[(($184)>>2)];
 var $186=HEAP32[(($185)>>2)];
 var $187=($182>>>0)<($186>>>0);
 if($187){label=26;break;}else{label=44;break;}
 case 26: 
 var $189=$inputMTX;
 var $190=_fscanf($189,4264,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$ix,HEAP32[(((tempVarArgs)+(8))>>2)]=$iy,tempVarArgs)); STACKTOP=tempVarArgs;
 var $191=$i;
 var $192=($191|0)==0;
 if($192){label=27;break;}else{label=28;break;}
 case 27: 
 var $194=HEAP32[(($iy)>>2)];
 var $195=((($194)-(1))|0);
 $curry=$195;
 label=28;break;
 case 28: 
 var $197=$data_present;
 var $198=($197|0)!=0;
 if($198){label=29;break;}else{label=30;break;}
 case 29: 
 var $200=$inputMTX;
 var $201=_fscanf($200,4248,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$double_data,tempVarArgs)); STACKTOP=tempVarArgs;
 var $202=HEAPF64[(($double_data)>>3)];
 var $203=$202;
 $data=$203;
 label=31;break;
 case 30: 
 var $205=_rand();
 var $206=$205&32767;
 var $207=($206|0);
 var $208=($207)*((0.0010000000474974513));
 var $209=($208)-(15);
 $data=$209;
 label=31;break;
 case 31: 
 var $211=$data_present;
 var $212=($211|0)!=0;
 if($212){label=32;break;}else{label=34;break;}
 case 32: 
 var $214=$data;
 var $215=$214;
 var $216=$215==0;
 if($216){label=33;break;}else{label=34;break;}
 case 33: 
 var $218=$explicit_zero_count;
 var $219=((($218)+(1))|0);
 $explicit_zero_count=$219;
 label=42;break;
 case 34: 
 var $221=HEAP32[(($ix)>>2)];
 var $222=((($221)-(1))|0);
 HEAP32[(($ix)>>2)]=$222;
 var $223=HEAP32[(($iy)>>2)];
 var $224=((($223)-(1))|0);
 HEAP32[(($iy)>>2)]=$224;
 var $225=HEAP32[(($ix)>>2)];
 var $226=$actual_non_zero;
 var $227=HEAP32[(($raw_ix)>>2)];
 var $228=(($227+($226<<2))|0);
 HEAP32[(($228)>>2)]=$225;
 var $229=HEAP32[(($iy)>>2)];
 var $230=$actual_non_zero;
 var $231=HEAP32[(($raw_iy)>>2)];
 var $232=(($231+($230<<2))|0);
 HEAP32[(($232)>>2)]=$229;
 var $233=$data;
 var $234=$actual_non_zero;
 var $235=HEAP32[(($raw_data)>>2)];
 var $236=(($235+($234<<2))|0);
 HEAPF32[(($236)>>2)]=$233;
 var $237=$actual_non_zero;
 var $238=((($237)+(1))|0);
 $actual_non_zero=$238;
 var $239=HEAP32[(($iy)>>2)];
 var $240=HEAP32[(($count_array)>>2)];
 var $241=(($240+($239<<2))|0);
 var $242=HEAP32[(($241)>>2)];
 var $243=((($242)+(1))|0);
 HEAP32[(($241)>>2)]=$243;
 var $244=$symmetric;
 var $245=($244|0)!=0;
 if($245){label=35;break;}else{label=37;break;}
 case 35: 
 var $247=HEAP32[(($ix)>>2)];
 var $248=HEAP32[(($iy)>>2)];
 var $249=($247|0)!=($248|0);
 if($249){label=36;break;}else{label=37;break;}
 case 36: 
 var $251=HEAP32[(($ix)>>2)];
 var $252=HEAP32[(($count_array)>>2)];
 var $253=(($252+($251<<2))|0);
 var $254=HEAP32[(($253)>>2)];
 var $255=((($254)+(1))|0);
 HEAP32[(($253)>>2)]=$255;
 label=37;break;
 case 37: 
 var $257=HEAP32[(($iy)>>2)];
 var $258=$curry;
 var $259=($257|0)!=($258|0);
 if($259){label=38;break;}else{label=41;break;}
 case 38: 
 var $261=HEAP32[(($iy)>>2)];
 var $262=$curry;
 var $263=((($262)+(1))|0);
 var $264=($261|0)!=($263|0);
 if($264){label=39;break;}else{label=40;break;}
 case 39: 
 var $266=$actual_non_zero;
 var $267=HEAP32[(($iy)>>2)];
 var $268=$curry;
 var $269=_printf(4168,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$266,HEAP32[(((tempVarArgs)+(8))>>2)]=$267,HEAP32[(((tempVarArgs)+(16))>>2)]=$268,tempVarArgs)); STACKTOP=tempVarArgs;
 label=40;break;
 case 40: 
 var $271=HEAP32[(($iy)>>2)];
 $curry=$271;
 label=41;break;
 case 41: 
 label=42;break;
 case 42: 
 label=43;break;
 case 43: 
 var $275=$i;
 var $276=((($275)+(1))|0);
 $i=$276;
 label=25;break;
 case 44: 
 var $278=$explicit_zero_count;
 var $279=($278|0)!=0;
 if($279){label=45;break;}else{label=46;break;}
 case 45: 
 var $281=$explicit_zero_count;
 var $282=_printf(4128,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$281,tempVarArgs)); STACKTOP=tempVarArgs;
 label=46;break;
 case 46: 
 var $284=$actual_non_zero;
 var $285=$2;
 var $286=(($285+44)|0);
 var $287=HEAP32[(($286)>>2)];
 HEAP32[(($287)>>2)]=$284;
 $i=0;
 label=47;break;
 case 47: 
 var $289=$i;
 var $290=$2;
 var $291=(($290+40)|0);
 var $292=HEAP32[(($291)>>2)];
 var $293=HEAP32[(($292)>>2)];
 var $294=($289>>>0)<($293>>>0);
 if($294){label=48;break;}else{label=54;break;}
 case 48: 
 var $296=$i;
 var $297=HEAP32[(($line_data_array)>>2)];
 var $298=(($297+($296<<2))|0);
 var $299=$298;
 var $300=$preferred_alignment;
 var $301=$i;
 var $302=HEAP32[(($count_array)>>2)];
 var $303=(($302+($301<<2))|0);
 var $304=HEAP32[(($303)>>2)];
 var $305=($304<<2);
 var $306=_posix_memalign($299,$300,$305);
 var $307=$i;
 var $308=HEAP32[(($line_data_array)>>2)];
 var $309=(($308+($307<<2))|0);
 var $310=HEAP32[(($309)>>2)];
 var $311=($310|0)==0;
 if($311){label=49;break;}else{label=50;break;}
 case 49: 
 var $313=$i;
 var $314=HEAP32[(($count_array)>>2)];
 var $315=(($314+($313<<2))|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=($316<<2);
 var $318$0=$317;
 var $318$1=0;
 var $$etemp$13=4096;
 var $$etemp$12=1544;
 var $319=_printf($$etemp$12,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$318$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$318$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$13,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 50: 
 var $321=$i;
 var $322=HEAP32[(($line_x_index_array)>>2)];
 var $323=(($322+($321<<2))|0);
 var $324=$323;
 var $325=$preferred_alignment;
 var $326=$i;
 var $327=HEAP32[(($count_array)>>2)];
 var $328=(($327+($326<<2))|0);
 var $329=HEAP32[(($328)>>2)];
 var $330=($329<<2);
 var $331=_posix_memalign($324,$325,$330);
 var $332=$i;
 var $333=HEAP32[(($line_x_index_array)>>2)];
 var $334=(($333+($332<<2))|0);
 var $335=HEAP32[(($334)>>2)];
 var $336=($335|0)==0;
 if($336){label=51;break;}else{label=52;break;}
 case 51: 
 var $338=$i;
 var $339=HEAP32[(($count_array)>>2)];
 var $340=(($339+($338<<2))|0);
 var $341=HEAP32[(($340)>>2)];
 var $342=($341<<2);
 var $343$0=$342;
 var $343$1=0;
 var $$etemp$15=4064;
 var $$etemp$14=1544;
 var $344=_printf($$etemp$14,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$343$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$343$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$15,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 52: 
 var $346=$i;
 var $347=HEAP32[(($count_array)>>2)];
 var $348=(($347+($346<<2))|0);
 HEAP32[(($348)>>2)]=0;
 label=53;break;
 case 53: 
 var $350=$i;
 var $351=((($350)+(1))|0);
 $i=$351;
 label=47;break;
 case 54: 
 $i=0;
 label=55;break;
 case 55: 
 var $354=$i;
 var $355=$2;
 var $356=(($355+44)|0);
 var $357=HEAP32[(($356)>>2)];
 var $358=HEAP32[(($357)>>2)];
 var $359=($354>>>0)<($358>>>0);
 if($359){label=56;break;}else{label=61;break;}
 case 56: 
 var $361=$i;
 var $362=HEAP32[(($raw_data)>>2)];
 var $363=(($362+($361<<2))|0);
 var $364=HEAPF32[(($363)>>2)];
 var $365=$i;
 var $366=HEAP32[(($raw_iy)>>2)];
 var $367=(($366+($365<<2))|0);
 var $368=HEAP32[(($367)>>2)];
 var $369=HEAP32[(($count_array)>>2)];
 var $370=(($369+($368<<2))|0);
 var $371=HEAP32[(($370)>>2)];
 var $372=$i;
 var $373=HEAP32[(($raw_iy)>>2)];
 var $374=(($373+($372<<2))|0);
 var $375=HEAP32[(($374)>>2)];
 var $376=HEAP32[(($line_data_array)>>2)];
 var $377=(($376+($375<<2))|0);
 var $378=HEAP32[(($377)>>2)];
 var $379=(($378+($371<<2))|0);
 HEAPF32[(($379)>>2)]=$364;
 var $380=$i;
 var $381=HEAP32[(($raw_ix)>>2)];
 var $382=(($381+($380<<2))|0);
 var $383=HEAP32[(($382)>>2)];
 var $384=$i;
 var $385=HEAP32[(($raw_iy)>>2)];
 var $386=(($385+($384<<2))|0);
 var $387=HEAP32[(($386)>>2)];
 var $388=HEAP32[(($count_array)>>2)];
 var $389=(($388+($387<<2))|0);
 var $390=HEAP32[(($389)>>2)];
 var $391=$i;
 var $392=HEAP32[(($raw_iy)>>2)];
 var $393=(($392+($391<<2))|0);
 var $394=HEAP32[(($393)>>2)];
 var $395=HEAP32[(($line_x_index_array)>>2)];
 var $396=(($395+($394<<2))|0);
 var $397=HEAP32[(($396)>>2)];
 var $398=(($397+($390<<2))|0);
 HEAP32[(($398)>>2)]=$383;
 var $399=$i;
 var $400=HEAP32[(($raw_iy)>>2)];
 var $401=(($400+($399<<2))|0);
 var $402=HEAP32[(($401)>>2)];
 var $403=HEAP32[(($count_array)>>2)];
 var $404=(($403+($402<<2))|0);
 var $405=HEAP32[(($404)>>2)];
 var $406=((($405)+(1))|0);
 HEAP32[(($404)>>2)]=$406;
 var $407=$symmetric;
 var $408=($407|0)!=0;
 if($408){label=57;break;}else{label=59;break;}
 case 57: 
 var $410=$i;
 var $411=HEAP32[(($raw_ix)>>2)];
 var $412=(($411+($410<<2))|0);
 var $413=HEAP32[(($412)>>2)];
 var $414=$i;
 var $415=HEAP32[(($raw_iy)>>2)];
 var $416=(($415+($414<<2))|0);
 var $417=HEAP32[(($416)>>2)];
 var $418=($413|0)!=($417|0);
 if($418){label=58;break;}else{label=59;break;}
 case 58: 
 var $420=$i;
 var $421=HEAP32[(($raw_data)>>2)];
 var $422=(($421+($420<<2))|0);
 var $423=HEAPF32[(($422)>>2)];
 var $424=$i;
 var $425=HEAP32[(($raw_ix)>>2)];
 var $426=(($425+($424<<2))|0);
 var $427=HEAP32[(($426)>>2)];
 var $428=HEAP32[(($count_array)>>2)];
 var $429=(($428+($427<<2))|0);
 var $430=HEAP32[(($429)>>2)];
 var $431=$i;
 var $432=HEAP32[(($raw_ix)>>2)];
 var $433=(($432+($431<<2))|0);
 var $434=HEAP32[(($433)>>2)];
 var $435=HEAP32[(($line_data_array)>>2)];
 var $436=(($435+($434<<2))|0);
 var $437=HEAP32[(($436)>>2)];
 var $438=(($437+($430<<2))|0);
 HEAPF32[(($438)>>2)]=$423;
 var $439=$i;
 var $440=HEAP32[(($raw_iy)>>2)];
 var $441=(($440+($439<<2))|0);
 var $442=HEAP32[(($441)>>2)];
 var $443=$i;
 var $444=HEAP32[(($raw_ix)>>2)];
 var $445=(($444+($443<<2))|0);
 var $446=HEAP32[(($445)>>2)];
 var $447=HEAP32[(($count_array)>>2)];
 var $448=(($447+($446<<2))|0);
 var $449=HEAP32[(($448)>>2)];
 var $450=$i;
 var $451=HEAP32[(($raw_ix)>>2)];
 var $452=(($451+($450<<2))|0);
 var $453=HEAP32[(($452)>>2)];
 var $454=HEAP32[(($line_x_index_array)>>2)];
 var $455=(($454+($453<<2))|0);
 var $456=HEAP32[(($455)>>2)];
 var $457=(($456+($449<<2))|0);
 HEAP32[(($457)>>2)]=$442;
 var $458=$i;
 var $459=HEAP32[(($raw_ix)>>2)];
 var $460=(($459+($458<<2))|0);
 var $461=HEAP32[(($460)>>2)];
 var $462=HEAP32[(($count_array)>>2)];
 var $463=(($462+($461<<2))|0);
 var $464=HEAP32[(($463)>>2)];
 var $465=((($464)+(1))|0);
 HEAP32[(($463)>>2)]=$465;
 label=59;break;
 case 59: 
 label=60;break;
 case 60: 
 var $468=$i;
 var $469=((($468)+(1))|0);
 $i=$469;
 label=55;break;
 case 61: 
 var $471=$2;
 var $472=(($471+44)|0);
 var $473=HEAP32[(($472)>>2)];
 HEAP32[(($473)>>2)]=0;
 $i=0;
 label=62;break;
 case 62: 
 var $475=$i;
 var $476=$2;
 var $477=(($476+40)|0);
 var $478=HEAP32[(($477)>>2)];
 var $479=HEAP32[(($478)>>2)];
 var $480=($475>>>0)<($479>>>0);
 if($480){label=63;break;}else{label=65;break;}
 case 63: 
 var $482=$i;
 var $483=HEAP32[(($count_array)>>2)];
 var $484=(($483+($482<<2))|0);
 var $485=HEAP32[(($484)>>2)];
 var $486=$2;
 var $487=(($486+44)|0);
 var $488=HEAP32[(($487)>>2)];
 var $489=HEAP32[(($488)>>2)];
 var $490=((($489)+($485))|0);
 HEAP32[(($488)>>2)]=$490;
 label=64;break;
 case 64: 
 var $492=$i;
 var $493=((($492)+(1))|0);
 $i=$493;
 label=62;break;
 case 65: 
 var $495=$2;
 var $496=(($495+44)|0);
 var $497=HEAP32[(($496)>>2)];
 var $498=HEAP32[(($497)>>2)];
 var $499=($498>>>0);
 var $500=$2;
 var $501=(($500+36)|0);
 var $502=HEAP32[(($501)>>2)];
 var $503=HEAP32[(($502)>>2)];
 var $504=($503>>>0);
 var $505=$2;
 var $506=(($505+40)|0);
 var $507=HEAP32[(($506)>>2)];
 var $508=HEAP32[(($507)>>2)];
 var $509=($508>>>0);
 var $510=($504)*($509);
 var $511=($499)/($510);
 $density=$511;
 var $512=$2;
 var $513=(($512+36)|0);
 var $514=HEAP32[(($513)>>2)];
 var $515=HEAP32[(($514)>>2)];
 var $516=$2;
 var $517=(($516+40)|0);
 var $518=HEAP32[(($517)>>2)];
 var $519=HEAP32[(($518)>>2)];
 var $520=$2;
 var $521=(($520+44)|0);
 var $522=HEAP32[(($521)>>2)];
 var $523=HEAP32[(($522)>>2)];
 var $524=$density;
 var $525=_printf(3976,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$515,HEAP32[(((tempVarArgs)+(8))>>2)]=$519,HEAP32[(((tempVarArgs)+(16))>>2)]=$523,HEAPF64[(((tempVarArgs)+(24))>>3)]=$524,tempVarArgs)); STACKTOP=tempVarArgs;
 var $526=$2;
 var $527=(($526+40)|0);
 var $528=HEAP32[(($527)>>2)];
 var $529=HEAP32[(($528)>>2)];
 var $530=$preferred_alignment_by_elements;
 var $531=((($530)-(1))|0);
 var $532=((($529)+($531))|0);
 var $533=$preferred_alignment_by_elements;
 var $534=((($533)-(1))|0);
 var $535=$534^-1;
 var $536=$532&$535;
 var $537=$2;
 var $538=(($537+28)|0);
 var $539=HEAP32[(($538)>>2)];
 HEAP32[(($539)>>2)]=$536;
 var $540=$2;
 var $541=(($540+28)|0);
 var $542=HEAP32[(($541)>>2)];
 var $543=HEAP32[(($542)>>2)];
 var $544=$preferred_alignment_by_elements;
 var $545=($543>>>0)<($544>>>0);
 if($545){label=66;break;}else{label=67;break;}
 case 66: 
 var $547=$preferred_alignment_by_elements;
 var $548=$2;
 var $549=(($548+28)|0);
 var $550=HEAP32[(($549)>>2)];
 HEAP32[(($550)>>2)]=$547;
 label=67;break;
 case 67: 
 var $552=$2;
 var $553=(($552+28)|0);
 var $554=HEAP32[(($553)>>2)];
 var $555=HEAP32[(($554)>>2)];
 var $556=$preferred_alignment_by_elements;
 var $557=((($555)+($556))|0);
 var $558=((($557)-(1))|0);
 var $559=$preferred_alignment_by_elements;
 var $560=(((($558>>>0))/(($559>>>0)))&-1);
 $min_compute_units=$560;
 var $561=$2;
 var $562=(($561+56)|0);
 var $563=HEAP32[(($562)>>2)];
 var $564=HEAP32[(($563)>>2)];
 var $565=$min_compute_units;
 var $566=($564>>>0)>($565>>>0);
 if($566){label=68;break;}else{label=69;break;}
 case 68: 
 var $568=$min_compute_units;
 var $569=$2;
 var $570=(($569+56)|0);
 var $571=HEAP32[(($570)>>2)];
 HEAP32[(($571)>>2)]=$568;
 label=69;break;
 case 69: 
 var $573=HEAP32[(($raw_ix)>>2)];
 var $574=$573;
 _free($574);
 var $575=HEAP32[(($raw_iy)>>2)];
 var $576=$575;
 _free($576);
 var $577=HEAP32[(($raw_data)>>2)];
 var $578=$577;
 _free($578);
 var $579=$2;
 var $580=(($579+20)|0);
 var $581=HEAP32[(($580)>>2)];
 var $582=$581;
 var $583=$preferred_alignment;
 var $584=$2;
 var $585=(($584+44)|0);
 var $586=HEAP32[(($585)>>2)];
 var $587=HEAP32[(($586)>>2)];
 var $588=($587<<2);
 var $589=_posix_memalign($582,$583,$588);
 var $590=$2;
 var $591=(($590+20)|0);
 var $592=HEAP32[(($591)>>2)];
 var $593=HEAP32[(($592)>>2)];
 var $594=($593|0)==0;
 if($594){label=70;break;}else{label=71;break;}
 case 70: 
 var $596=$2;
 var $597=(($596+44)|0);
 var $598=HEAP32[(($597)>>2)];
 var $599=HEAP32[(($598)>>2)];
 var $600=($599<<2);
 var $601$0=$600;
 var $601$1=0;
 var $$etemp$17=3952;
 var $$etemp$16=1544;
 var $602=_printf($$etemp$16,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$601$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$601$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$17,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 71: 
 var $604=$2;
 var $605=(($604+16)|0);
 var $606=HEAP32[(($605)>>2)];
 var $607=$606;
 var $608=$preferred_alignment;
 var $609=$2;
 var $610=(($609+44)|0);
 var $611=HEAP32[(($610)>>2)];
 var $612=HEAP32[(($611)>>2)];
 var $613=((($612)+(1))|0);
 var $614=($613<<2);
 var $615=_posix_memalign($607,$608,$614);
 var $616=$2;
 var $617=(($616+16)|0);
 var $618=HEAP32[(($617)>>2)];
 var $619=HEAP32[(($618)>>2)];
 var $620=($619|0)==0;
 if($620){label=72;break;}else{label=73;break;}
 case 72: 
 var $622=$2;
 var $623=(($622+44)|0);
 var $624=HEAP32[(($623)>>2)];
 var $625=HEAP32[(($624)>>2)];
 var $626=((($625)+(1))|0);
 var $627=($626<<2);
 var $628$0=$627;
 var $628$1=0;
 var $$etemp$19=3928;
 var $$etemp$18=1544;
 var $629=_printf($$etemp$18,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$628$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$628$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$19,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 73: 
 var $631=$2;
 var $632=(($631+12)|0);
 var $633=HEAP32[(($632)>>2)];
 var $634=$633;
 var $635=$preferred_alignment;
 var $636=$2;
 var $637=(($636+28)|0);
 var $638=HEAP32[(($637)>>2)];
 var $639=HEAP32[(($638)>>2)];
 var $640=((($639)+(1))|0);
 var $641=($640<<2);
 var $642=_posix_memalign($634,$635,$641);
 var $643=$2;
 var $644=(($643+12)|0);
 var $645=HEAP32[(($644)>>2)];
 var $646=HEAP32[(($645)>>2)];
 var $647=($646|0)==0;
 if($647){label=74;break;}else{label=75;break;}
 case 74: 
 var $649=$2;
 var $650=(($649+28)|0);
 var $651=HEAP32[(($650)>>2)];
 var $652=HEAP32[(($651)>>2)];
 var $653=((($652)+(1))|0);
 var $654=($653<<2);
 var $655$0=$654;
 var $655$1=0;
 var $$etemp$21=3896;
 var $$etemp$20=1544;
 var $656=_printf($$etemp$20,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$655$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$655$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$21,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 75: 
 $index=0;
 $i=0;
 label=76;break;
 case 76: 
 var $659=$i;
 var $660=$2;
 var $661=(($660+40)|0);
 var $662=HEAP32[(($661)>>2)];
 var $663=HEAP32[(($662)>>2)];
 var $664=($659>>>0)<($663>>>0);
 if($664){label=77;break;}else{label=83;break;}
 case 77: 
 var $666=$index;
 var $667=$i;
 var $668=$2;
 var $669=(($668+12)|0);
 var $670=HEAP32[(($669)>>2)];
 var $671=HEAP32[(($670)>>2)];
 var $672=(($671+($667<<2))|0);
 HEAP32[(($672)>>2)]=$666;
 $j=0;
 label=78;break;
 case 78: 
 var $674=$j;
 var $675=$i;
 var $676=HEAP32[(($count_array)>>2)];
 var $677=(($676+($675<<2))|0);
 var $678=HEAP32[(($677)>>2)];
 var $679=($674>>>0)<($678>>>0);
 if($679){label=79;break;}else{label=81;break;}
 case 79: 
 var $681=$j;
 var $682=$i;
 var $683=HEAP32[(($line_data_array)>>2)];
 var $684=(($683+($682<<2))|0);
 var $685=HEAP32[(($684)>>2)];
 var $686=(($685+($681<<2))|0);
 var $687=HEAPF32[(($686)>>2)];
 var $688=$index;
 var $689=$2;
 var $690=(($689+20)|0);
 var $691=HEAP32[(($690)>>2)];
 var $692=HEAP32[(($691)>>2)];
 var $693=(($692+($688<<2))|0);
 HEAPF32[(($693)>>2)]=$687;
 var $694=$j;
 var $695=$i;
 var $696=HEAP32[(($line_x_index_array)>>2)];
 var $697=(($696+($695<<2))|0);
 var $698=HEAP32[(($697)>>2)];
 var $699=(($698+($694<<2))|0);
 var $700=HEAP32[(($699)>>2)];
 var $701=$index;
 var $702=$2;
 var $703=(($702+16)|0);
 var $704=HEAP32[(($703)>>2)];
 var $705=HEAP32[(($704)>>2)];
 var $706=(($705+($701<<2))|0);
 HEAP32[(($706)>>2)]=$700;
 var $707=$index;
 var $708=((($707)+(1))|0);
 $index=$708;
 label=80;break;
 case 80: 
 var $710=$j;
 var $711=((($710)+(1))|0);
 $j=$711;
 label=78;break;
 case 81: 
 label=82;break;
 case 82: 
 var $714=$i;
 var $715=((($714)+(1))|0);
 $i=$715;
 label=76;break;
 case 83: 
 var $717=$2;
 var $718=(($717+40)|0);
 var $719=HEAP32[(($718)>>2)];
 var $720=HEAP32[(($719)>>2)];
 $i=$720;
 label=84;break;
 case 84: 
 var $722=$i;
 var $723=$2;
 var $724=(($723+28)|0);
 var $725=HEAP32[(($724)>>2)];
 var $726=HEAP32[(($725)>>2)];
 var $727=($722>>>0)<=($726>>>0);
 if($727){label=85;break;}else{label=87;break;}
 case 85: 
 var $729=$2;
 var $730=(($729+44)|0);
 var $731=HEAP32[(($730)>>2)];
 var $732=HEAP32[(($731)>>2)];
 var $733=$i;
 var $734=$2;
 var $735=(($734+12)|0);
 var $736=HEAP32[(($735)>>2)];
 var $737=HEAP32[(($736)>>2)];
 var $738=(($737+($733<<2))|0);
 HEAP32[(($738)>>2)]=$732;
 label=86;break;
 case 86: 
 var $740=$i;
 var $741=((($740)+(1))|0);
 $i=$741;
 label=84;break;
 case 87: 
 $i=0;
 label=88;break;
 case 88: 
 var $744=$i;
 var $745=$2;
 var $746=(($745+40)|0);
 var $747=HEAP32[(($746)>>2)];
 var $748=HEAP32[(($747)>>2)];
 var $749=($744>>>0)<($748>>>0);
 if($749){label=89;break;}else{label=93;break;}
 case 89: 
 var $751=$i;
 var $752=HEAP32[(($count_array)>>2)];
 var $753=(($752+($751<<2))|0);
 var $754=HEAP32[(($753)>>2)];
 var $755=($754|0)!=0;
 if($755){label=90;break;}else{label=91;break;}
 case 90: 
 var $757=$i;
 var $758=HEAP32[(($line_data_array)>>2)];
 var $759=(($758+($757<<2))|0);
 var $760=HEAP32[(($759)>>2)];
 var $761=$760;
 _free($761);
 var $762=$i;
 var $763=HEAP32[(($line_x_index_array)>>2)];
 var $764=(($763+($762<<2))|0);
 var $765=HEAP32[(($764)>>2)];
 var $766=$765;
 _free($766);
 label=91;break;
 case 91: 
 label=92;break;
 case 92: 
 var $769=$i;
 var $770=((($769)+(1))|0);
 $i=$770;
 label=88;break;
 case 93: 
 var $772=HEAP32[(($line_data_array)>>2)];
 var $773=$772;
 _free($773);
 var $774=HEAP32[(($line_x_index_array)>>2)];
 var $775=$774;
 _free($775);
 var $776=HEAP32[(($count_array)>>2)];
 var $777=$776;
 _free($777);
 var $778=$2;
 var $779=(($778+60)|0);
 var $780=HEAP32[(($779)>>2)];
 var $781=($780|0)==2;
 if($781){label=94;break;}else{label=95;break;}
 case 94: 
 var $783=$2;
 var $784=(($783+68)|0);
 var $785=HEAP32[(($784)>>2)];
 var $786=(((($785>>>0))/(64))&-1);
 var $787=$2;
 var $788=(($787+64)|0);
 var $789=HEAP32[(($788)>>2)];
 HEAP32[(($789)>>2)]=$786;
 label=95;break;
 case 95: 
 var $791=$2;
 var $792=(($791+60)|0);
 var $793=HEAP32[(($792)>>2)];
 var $794=($793|0)==1;
 if($794){label=96;break;}else{label=97;break;}
 case 96: 
 var $796=$2;
 var $797=(($796+64)|0);
 var $798=HEAP32[(($797)>>2)];
 HEAP32[(($798)>>2)]=65536;
 label=97;break;
 case 97: 
 var $800=$2;
 var $801=(($800+64)|0);
 var $802=HEAP32[(($801)>>2)];
 var $803=HEAP32[(($802)>>2)];
 var $804=$2;
 var $805=(($804+36)|0);
 var $806=HEAP32[(($805)>>2)];
 var $807=HEAP32[(($806)>>2)];
 var $808=($803>>>0)>($807>>>0);
 if($808){label=98;break;}else{label=99;break;}
 case 98: 
 var $810=$2;
 var $811=(($810+36)|0);
 var $812=HEAP32[(($811)>>2)];
 var $813=HEAP32[(($812)>>2)];
 var $814=$2;
 var $815=(($814+64)|0);
 var $816=HEAP32[(($815)>>2)];
 HEAP32[(($816)>>2)]=$813;
 label=99;break;
 case 99: 
 var $818=$2;
 var $819=(($818+64)|0);
 var $820=HEAP32[(($819)>>2)];
 var $821=HEAP32[(($820)>>2)];
 var $822=($821>>>0)>65536;
 if($822){label=100;break;}else{label=101;break;}
 case 100: 
 var $824=$2;
 var $825=(($824+64)|0);
 var $826=HEAP32[(($825)>>2)];
 HEAP32[(($826)>>2)]=65536;
 label=101;break;
 case 101: 
 label=102;break;
 case 102: 
 var $829=$2;
 var $830=(($829+64)|0);
 var $831=HEAP32[(($830)>>2)];
 var $832=HEAP32[(($831)>>2)];
 var $833=$2;
 var $834=(($833+64)|0);
 var $835=HEAP32[(($834)>>2)];
 var $836=HEAP32[(($835)>>2)];
 var $837=((($836)-(1))|0);
 var $838=$832&$837;
 var $839=($838|0)!=0;
 if($839){label=103;break;}else{label=104;break;}
 case 103: 
 var $841=$2;
 var $842=(($841+64)|0);
 var $843=HEAP32[(($842)>>2)];
 var $844=HEAP32[(($843)>>2)];
 var $845=((($844)+(1))|0);
 HEAP32[(($843)>>2)]=$845;
 label=102;break;
 case 104: 
 var $847=$2;
 var $848=(($847+36)|0);
 var $849=HEAP32[(($848)>>2)];
 var $850=HEAP32[(($849)>>2)];
 var $851=$2;
 var $852=(($851+64)|0);
 var $853=HEAP32[(($852)>>2)];
 var $854=HEAP32[(($853)>>2)];
 var $855=((($854)-(1))|0);
 var $856=((($850)+($855))|0);
 var $857=$2;
 var $858=(($857+64)|0);
 var $859=HEAP32[(($858)>>2)];
 var $860=HEAP32[(($859)>>2)];
 var $861=((($860)-(1))|0);
 var $862=$861^-1;
 var $863=$856&$862;
 var $864=$2;
 var $865=(($864+24)|0);
 var $866=HEAP32[(($865)>>2)];
 HEAP32[(($866)>>2)]=$863;
 var $867=$2;
 var $868=(($867+56)|0);
 var $869=HEAP32[(($868)>>2)];
 var $870=HEAP32[(($869)>>2)];
 $nslabs_base=$870;
 $nslabs=0;
 var $871=$2;
 var $872=(($871+60)|0);
 var $873=HEAP32[(($872)>>2)];
 var $874=($873|0)==2;
 if($874){label=105;break;}else{label=137;break;}
 case 105: 
 var $876=$2;
 var $877=(($876+68)|0);
 var $878=HEAP32[(($877)>>2)];
 var $879=(((($878>>>0))/(4))&-1);
 var $880=((($879)*(7))&-1);
 var $881=(((($880>>>0))/(16))&-1);
 var $882=((($881)-(1))|0);
 $slab_threshhold=$882;
 var $883=$preferred_alignment_by_elements;
 var $884=((($883)-(1))|0);
 var $885=$884^-1;
 var $886=$slab_threshhold;
 var $887=$886&$885;
 $slab_threshhold=$887;
 var $888=$2;
 var $889=(($888+28)|0);
 var $890=HEAP32[(($889)>>2)];
 var $891=HEAP32[(($890)>>2)];
 var $892=$slab_threshhold;
 var $893=(((($891>>>0))/(($892>>>0)))&-1);
 $expected_nslabs=$893;
 var $894=$expected_nslabs;
 var $895=$nslabs_base;
 var $896=($894>>>0)<($895>>>0);
 if($896){label=106;break;}else{label=107;break;}
 case 106: 
 var $898=$nslabs_base;
 $expected_nslabs=$898;
 label=107;break;
 case 107: 
 var $900=$2;
 var $901=(($900+44)|0);
 var $902=HEAP32[(($901)>>2)];
 var $903=HEAP32[(($902)>>2)];
 var $904=$expected_nslabs;
 var $905=(((($903>>>0))/(($904>>>0)))&-1);
 $target_workpacket=$905;
 var $906=$2;
 var $907=(($906+68)|0);
 var $908=HEAP32[(($907)>>2)];
 var $909=(((($908>>>0))/(8192))&-1);
 var $910=$2;
 var $911=(($910+72)|0);
 var $912=HEAP32[(($911)>>2)];
 HEAP32[(($912)>>2)]=$909;
 label=108;break;
 case 108: 
 var $914=$2;
 var $915=(($914+72)|0);
 var $916=HEAP32[(($915)>>2)];
 var $917=HEAP32[(($916)>>2)];
 var $918=$2;
 var $919=(($918+72)|0);
 var $920=HEAP32[(($919)>>2)];
 var $921=HEAP32[(($920)>>2)];
 var $922=((($921)-(1))|0);
 var $923=$917&$922;
 var $924=($923|0)!=0;
 if($924){label=109;break;}else{label=110;break;}
 case 109: 
 var $926=$2;
 var $927=(($926+72)|0);
 var $928=HEAP32[(($927)>>2)];
 var $929=HEAP32[(($928)>>2)];
 var $930=((($929)+(1))|0);
 HEAP32[(($928)>>2)]=$930;
 label=108;break;
 case 110: 
 $candidate_row=0;
 var $932=$target_workpacket;
 $target_value=$932;
 $slabsize=0;
 label=111;break;
 case 111: 
 var $934=$candidate_row;
 var $935=$2;
 var $936=(($935+28)|0);
 var $937=HEAP32[(($936)>>2)];
 var $938=HEAP32[(($937)>>2)];
 var $939=($934>>>0)<($938>>>0);
 if($939){label=112;break;}else{label=119;break;}
 case 112: 
 label=113;break;
 case 113: 
 var $942=$candidate_row;
 var $943=$2;
 var $944=(($943+12)|0);
 var $945=HEAP32[(($944)>>2)];
 var $946=HEAP32[(($945)>>2)];
 var $947=(($946+($942<<2))|0);
 var $948=HEAP32[(($947)>>2)];
 var $949=$target_value;
 var $950=($948>>>0)<($949>>>0);
 if($950){label=114;break;}else{var $965=0;label=116;break;}
 case 114: 
 var $952=$slabsize;
 var $953=$preferred_alignment_by_elements;
 var $954=((($952)+($953))|0);
 var $955=$slab_threshhold;
 var $956=($954>>>0)<($955>>>0);
 if($956){label=115;break;}else{var $965=0;label=116;break;}
 case 115: 
 var $958=$candidate_row;
 var $959=$2;
 var $960=(($959+28)|0);
 var $961=HEAP32[(($960)>>2)];
 var $962=HEAP32[(($961)>>2)];
 var $963=($958>>>0)<($962>>>0);
 var $965=$963;label=116;break;
 case 116: 
 var $965;
 if($965){label=117;break;}else{label=118;break;}
 case 117: 
 var $967=$preferred_alignment_by_elements;
 var $968=$candidate_row;
 var $969=((($968)+($967))|0);
 $candidate_row=$969;
 var $970=$preferred_alignment_by_elements;
 var $971=$slabsize;
 var $972=((($971)+($970))|0);
 $slabsize=$972;
 label=113;break;
 case 118: 
 var $974=$nslabs;
 var $975=((($974)+(1))|0);
 $nslabs=$975;
 $slabsize=0;
 var $976=$candidate_row;
 var $977=$2;
 var $978=(($977+12)|0);
 var $979=HEAP32[(($978)>>2)];
 var $980=HEAP32[(($979)>>2)];
 var $981=(($980+($976<<2))|0);
 var $982=HEAP32[(($981)>>2)];
 var $983=$target_workpacket;
 var $984=((($982)+($983))|0);
 $target_value=$984;
 label=111;break;
 case 119: 
 var $986=$2;
 var $987=(($986+32)|0);
 var $988=HEAP32[(($987)>>2)];
 var $989=$988;
 var $990=$preferred_alignment;
 var $991=$nslabs;
 var $992=((($991)+(1))|0);
 var $993=($992<<2);
 var $994=_posix_memalign($989,$990,$993);
 var $995=$2;
 var $996=(($995+32)|0);
 var $997=HEAP32[(($996)>>2)];
 var $998=HEAP32[(($997)>>2)];
 var $999=($998|0)==0;
 if($999){label=120;break;}else{label=121;break;}
 case 120: 
 var $1001=$nslabs;
 var $1002=((($1001)+(1))|0);
 var $1003=($1002<<2);
 var $1004$0=$1003;
 var $1004$1=0;
 var $$etemp$23=3776;
 var $$etemp$22=1544;
 var $1005=_printf($$etemp$22,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1004$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1004$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$23,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 121: 
 var $1007=$2;
 var $1008=(($1007+32)|0);
 var $1009=HEAP32[(($1008)>>2)];
 var $1010=HEAP32[(($1009)>>2)];
 var $1011=(($1010)|0);
 HEAP32[(($1011)>>2)]=0;
 var $1012=$2;
 var $1013=(($1012+28)|0);
 var $1014=HEAP32[(($1013)>>2)];
 var $1015=HEAP32[(($1014)>>2)];
 var $1016=$nslabs;
 var $1017=$2;
 var $1018=(($1017+32)|0);
 var $1019=HEAP32[(($1018)>>2)];
 var $1020=HEAP32[(($1019)>>2)];
 var $1021=(($1020+($1016<<2))|0);
 HEAP32[(($1021)>>2)]=$1015;
 $candidate_row=0;
 var $1022=$target_workpacket;
 $target_value=$1022;
 $slabsize=0;
 $nslabs=0;
 label=122;break;
 case 122: 
 var $1024=$candidate_row;
 var $1025=$2;
 var $1026=(($1025+28)|0);
 var $1027=HEAP32[(($1026)>>2)];
 var $1028=HEAP32[(($1027)>>2)];
 var $1029=($1024>>>0)<($1028>>>0);
 if($1029){label=123;break;}else{label=130;break;}
 case 123: 
 label=124;break;
 case 124: 
 var $1032=$candidate_row;
 var $1033=$2;
 var $1034=(($1033+12)|0);
 var $1035=HEAP32[(($1034)>>2)];
 var $1036=HEAP32[(($1035)>>2)];
 var $1037=(($1036+($1032<<2))|0);
 var $1038=HEAP32[(($1037)>>2)];
 var $1039=$target_value;
 var $1040=($1038>>>0)<($1039>>>0);
 if($1040){label=125;break;}else{var $1053=0;label=127;break;}
 case 125: 
 var $1042=$slabsize;
 var $1043=$slab_threshhold;
 var $1044=($1042>>>0)<($1043>>>0);
 if($1044){label=126;break;}else{var $1053=0;label=127;break;}
 case 126: 
 var $1046=$candidate_row;
 var $1047=$2;
 var $1048=(($1047+28)|0);
 var $1049=HEAP32[(($1048)>>2)];
 var $1050=HEAP32[(($1049)>>2)];
 var $1051=($1046>>>0)<($1050>>>0);
 var $1053=$1051;label=127;break;
 case 127: 
 var $1053;
 if($1053){label=128;break;}else{label=129;break;}
 case 128: 
 var $1055=$preferred_alignment_by_elements;
 var $1056=$candidate_row;
 var $1057=((($1056)+($1055))|0);
 $candidate_row=$1057;
 var $1058=$preferred_alignment_by_elements;
 var $1059=$slabsize;
 var $1060=((($1059)+($1058))|0);
 $slabsize=$1060;
 label=124;break;
 case 129: 
 var $1062=$nslabs;
 var $1063=((($1062)+(1))|0);
 $nslabs=$1063;
 $slabsize=0;
 var $1064=$candidate_row;
 var $1065=$nslabs;
 var $1066=$2;
 var $1067=(($1066+32)|0);
 var $1068=HEAP32[(($1067)>>2)];
 var $1069=HEAP32[(($1068)>>2)];
 var $1070=(($1069+($1065<<2))|0);
 HEAP32[(($1070)>>2)]=$1064;
 var $1071=$candidate_row;
 var $1072=$2;
 var $1073=(($1072+12)|0);
 var $1074=HEAP32[(($1073)>>2)];
 var $1075=HEAP32[(($1074)>>2)];
 var $1076=(($1075+($1071<<2))|0);
 var $1077=HEAP32[(($1076)>>2)];
 var $1078=$target_workpacket;
 var $1079=((($1077)+($1078))|0);
 $target_value=$1079;
 label=122;break;
 case 130: 
 var $1081=$2;
 var $1082=(($1081+76)|0);
 var $1083=HEAP32[(($1082)>>2)];
 HEAP32[(($1083)>>2)]=0;
 $i=0;
 label=131;break;
 case 131: 
 var $1085=$i;
 var $1086=$nslabs;
 var $1087=($1085>>>0)<($1086>>>0);
 if($1087){label=132;break;}else{label=136;break;}
 case 132: 
 var $1089=$i;
 var $1090=((($1089)+(1))|0);
 var $1091=$2;
 var $1092=(($1091+32)|0);
 var $1093=HEAP32[(($1092)>>2)];
 var $1094=HEAP32[(($1093)>>2)];
 var $1095=(($1094+($1090<<2))|0);
 var $1096=HEAP32[(($1095)>>2)];
 var $1097=$i;
 var $1098=$2;
 var $1099=(($1098+32)|0);
 var $1100=HEAP32[(($1099)>>2)];
 var $1101=HEAP32[(($1100)>>2)];
 var $1102=(($1101+($1097<<2))|0);
 var $1103=HEAP32[(($1102)>>2)];
 var $1104=((($1096)-($1103))|0);
 var $1105=$2;
 var $1106=(($1105+76)|0);
 var $1107=HEAP32[(($1106)>>2)];
 var $1108=HEAP32[(($1107)>>2)];
 var $1109=($1104>>>0)>($1108>>>0);
 if($1109){label=133;break;}else{label=134;break;}
 case 133: 
 var $1111=$i;
 var $1112=((($1111)+(1))|0);
 var $1113=$2;
 var $1114=(($1113+32)|0);
 var $1115=HEAP32[(($1114)>>2)];
 var $1116=HEAP32[(($1115)>>2)];
 var $1117=(($1116+($1112<<2))|0);
 var $1118=HEAP32[(($1117)>>2)];
 var $1119=$i;
 var $1120=$2;
 var $1121=(($1120+32)|0);
 var $1122=HEAP32[(($1121)>>2)];
 var $1123=HEAP32[(($1122)>>2)];
 var $1124=(($1123+($1119<<2))|0);
 var $1125=HEAP32[(($1124)>>2)];
 var $1126=((($1118)-($1125))|0);
 var $1127=$2;
 var $1128=(($1127+76)|0);
 var $1129=HEAP32[(($1128)>>2)];
 HEAP32[(($1129)>>2)]=$1126;
 label=134;break;
 case 134: 
 label=135;break;
 case 135: 
 var $1132=$i;
 var $1133=((($1132)+(1))|0);
 $i=$1133;
 label=131;break;
 case 136: 
 label=179;break;
 case 137: 
 var $1136=$2;
 var $1137=(($1136+80)|0);
 var $ld$24$0=(($1137)|0);
 var $1138$0=HEAP32[(($ld$24$0)>>2)];
 var $ld$25$1=(($1137+4)|0);
 var $1138$1=HEAP32[(($ld$25$1)>>2)];
 var $$etemp$26$0=4;
 var $$etemp$26$1=0;
 var $1139=(($1138$0|0) == ($$etemp$26$0|0)) & (($1138$1|0) == ($$etemp$26$1|0));
 if($1139){label=138;break;}else{label=162;break;}
 case 138: 
 var $1141=$2;
 var $1142=(($1141+88)|0);
 var $1143=HEAP32[(($1142)>>2)];
 var $1144=HEAP32[(($1143)>>2)];
 var $1145=($1144|0)>1024;
 if($1145){label=139;break;}else{label=140;break;}
 case 139: 
 var $1147=_printf(3664,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1024,tempVarArgs)); STACKTOP=tempVarArgs;
 var $1148=$2;
 var $1149=(($1148+88)|0);
 var $1150=HEAP32[(($1149)>>2)];
 HEAP32[(($1150)>>2)]=1024;
 label=140;break;
 case 140: 
 var $1152=$2;
 var $1153=(($1152+88)|0);
 var $1154=HEAP32[(($1153)>>2)];
 var $1155=HEAP32[(($1154)>>2)];
 var $1156=($1155|0)<16;
 if($1156){label=141;break;}else{label=142;break;}
 case 141: 
 var $1158=_printf(3560,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $1159=$2;
 var $1160=(($1159+88)|0);
 var $1161=HEAP32[(($1160)>>2)];
 HEAP32[(($1161)>>2)]=16;
 label=142;break;
 case 142: 
 var $1163=$2;
 var $1164=(($1163+88)|0);
 var $1165=HEAP32[(($1164)>>2)];
 var $1166=HEAP32[(($1165)>>2)];
 var $1167=$2;
 var $1168=(($1167+88)|0);
 var $1169=HEAP32[(($1168)>>2)];
 var $1170=HEAP32[(($1169)>>2)];
 var $1171=((($1170)-(1))|0);
 var $1172=$1166&$1171;
 var $1173=($1172|0)!=0;
 if($1173){label=143;break;}else{label=147;break;}
 case 143: 
 label=144;break;
 case 144: 
 var $1176=$2;
 var $1177=(($1176+88)|0);
 var $1178=HEAP32[(($1177)>>2)];
 var $1179=HEAP32[(($1178)>>2)];
 var $1180=$2;
 var $1181=(($1180+88)|0);
 var $1182=HEAP32[(($1181)>>2)];
 var $1183=HEAP32[(($1182)>>2)];
 var $1184=((($1183)-(1))|0);
 var $1185=$1179&$1184;
 var $1186=($1185|0)!=0;
 if($1186){label=145;break;}else{label=146;break;}
 case 145: 
 var $1188=$2;
 var $1189=(($1188+88)|0);
 var $1190=HEAP32[(($1189)>>2)];
 var $1191=HEAP32[(($1190)>>2)];
 var $1192=((($1191)-(1))|0);
 HEAP32[(($1190)>>2)]=$1192;
 label=144;break;
 case 146: 
 var $1194=$2;
 var $1195=(($1194+88)|0);
 var $1196=HEAP32[(($1195)>>2)];
 var $1197=HEAP32[(($1196)>>2)];
 var $1198=_printf(3464,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1197,tempVarArgs)); STACKTOP=tempVarArgs;
 label=147;break;
 case 147: 
 var $1200=$2;
 var $1201=(($1200+88)|0);
 var $1202=HEAP32[(($1201)>>2)];
 var $1203=HEAP32[(($1202)>>2)];
 var $1204=$2;
 var $1205=(($1204+92)|0);
 var $1206=HEAP32[(($1205)>>2)];
 var $1207=($1203|0)>($1206|0);
 if($1207){label=148;break;}else{label=152;break;}
 case 148: 
 label=149;break;
 case 149: 
 var $1210=$2;
 var $1211=(($1210+88)|0);
 var $1212=HEAP32[(($1211)>>2)];
 var $1213=HEAP32[(($1212)>>2)];
 var $1214=$2;
 var $1215=(($1214+92)|0);
 var $1216=HEAP32[(($1215)>>2)];
 var $1217=($1213|0)>($1216|0);
 if($1217){label=150;break;}else{label=151;break;}
 case 150: 
 var $1219=$2;
 var $1220=(($1219+88)|0);
 var $1221=HEAP32[(($1220)>>2)];
 var $1222=HEAP32[(($1221)>>2)];
 var $1223=(((($1222|0))/(2))&-1);
 HEAP32[(($1221)>>2)]=$1223;
 label=149;break;
 case 151: 
 var $1225=$2;
 var $1226=(($1225+88)|0);
 var $1227=HEAP32[(($1226)>>2)];
 var $1228=HEAP32[(($1227)>>2)];
 var $1229=_printf(3352,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1228,tempVarArgs)); STACKTOP=tempVarArgs;
 label=152;break;
 case 152: 
 var $1231=$2;
 var $1232=(($1231+28)|0);
 var $1233=HEAP32[(($1232)>>2)];
 var $1234=HEAP32[(($1233)>>2)];
 var $1235=$2;
 var $1236=(($1235+88)|0);
 var $1237=HEAP32[(($1236)>>2)];
 var $1238=HEAP32[(($1237)>>2)];
 var $1239=((($1234)+($1238))|0);
 var $1240=((($1239)-(1))|0);
 var $1241=$2;
 var $1242=(($1241+88)|0);
 var $1243=HEAP32[(($1242)>>2)];
 var $1244=HEAP32[(($1243)>>2)];
 var $1245=(((($1240>>>0))/(($1244>>>0)))&-1);
 $nslabs=$1245;
 label=153;break;
 case 153: 
 var $1247=$nslabs;
 var $1248=$2;
 var $1249=(($1248+56)|0);
 var $1250=HEAP32[(($1249)>>2)];
 var $1251=HEAP32[(($1250)>>2)];
 var $1252=($1247>>>0)<($1251>>>0);
 if($1252){label=154;break;}else{label=155;break;}
 case 154: 
 var $1254=$2;
 var $1255=(($1254+88)|0);
 var $1256=HEAP32[(($1255)>>2)];
 var $1257=HEAP32[(($1256)>>2)];
 var $1258=(((($1257|0))/(2))&-1);
 HEAP32[(($1256)>>2)]=$1258;
 var $1259=$2;
 var $1260=(($1259+28)|0);
 var $1261=HEAP32[(($1260)>>2)];
 var $1262=HEAP32[(($1261)>>2)];
 var $1263=$2;
 var $1264=(($1263+88)|0);
 var $1265=HEAP32[(($1264)>>2)];
 var $1266=HEAP32[(($1265)>>2)];
 var $1267=((($1262)+($1266))|0);
 var $1268=((($1267)-(1))|0);
 var $1269=$2;
 var $1270=(($1269+88)|0);
 var $1271=HEAP32[(($1270)>>2)];
 var $1272=HEAP32[(($1271)>>2)];
 var $1273=(((($1268>>>0))/(($1272>>>0)))&-1);
 $nslabs=$1273;
 label=153;break;
 case 155: 
 var $1275=$2;
 var $1276=(($1275+32)|0);
 var $1277=HEAP32[(($1276)>>2)];
 var $1278=$1277;
 var $1279=$preferred_alignment;
 var $1280=$nslabs;
 var $1281=((($1280)+(1))|0);
 var $1282=($1281<<2);
 var $1283=_posix_memalign($1278,$1279,$1282);
 var $1284=$2;
 var $1285=(($1284+32)|0);
 var $1286=HEAP32[(($1285)>>2)];
 var $1287=HEAP32[(($1286)>>2)];
 var $1288=($1287|0)==0;
 if($1288){label=156;break;}else{label=157;break;}
 case 156: 
 var $1290=$nslabs;
 var $1291=((($1290)+(1))|0);
 var $1292=($1291<<2);
 var $1293$0=$1292;
 var $1293$1=0;
 var $$etemp$28=3288;
 var $$etemp$27=1544;
 var $1294=_printf($$etemp$27,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1293$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1293$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$28,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 157: 
 $i=0;
 label=158;break;
 case 158: 
 var $1297=$i;
 var $1298=$nslabs;
 var $1299=($1297>>>0)<($1298>>>0);
 if($1299){label=159;break;}else{label=161;break;}
 case 159: 
 var $1301=$2;
 var $1302=(($1301+88)|0);
 var $1303=HEAP32[(($1302)>>2)];
 var $1304=HEAP32[(($1303)>>2)];
 var $1305=$i;
 var $1306=(Math_imul($1304,$1305)|0);
 var $1307=$i;
 var $1308=$2;
 var $1309=(($1308+32)|0);
 var $1310=HEAP32[(($1309)>>2)];
 var $1311=HEAP32[(($1310)>>2)];
 var $1312=(($1311+($1307<<2))|0);
 HEAP32[(($1312)>>2)]=$1306;
 label=160;break;
 case 160: 
 var $1314=$i;
 var $1315=((($1314)+(1))|0);
 $i=$1315;
 label=158;break;
 case 161: 
 var $1317=$2;
 var $1318=(($1317+28)|0);
 var $1319=HEAP32[(($1318)>>2)];
 var $1320=HEAP32[(($1319)>>2)];
 var $1321=$nslabs;
 var $1322=$2;
 var $1323=(($1322+32)|0);
 var $1324=HEAP32[(($1323)>>2)];
 var $1325=HEAP32[(($1324)>>2)];
 var $1326=(($1325+($1321<<2))|0);
 HEAP32[(($1326)>>2)]=$1320;
 var $1327=$2;
 var $1328=(($1327+88)|0);
 var $1329=HEAP32[(($1328)>>2)];
 var $1330=HEAP32[(($1329)>>2)];
 var $1331=$2;
 var $1332=(($1331+76)|0);
 var $1333=HEAP32[(($1332)>>2)];
 HEAP32[(($1333)>>2)]=$1330;
 label=178;break;
 case 162: 
 var $1335=$2;
 var $1336=(($1335+56)|0);
 var $1337=HEAP32[(($1336)>>2)];
 var $1338=HEAP32[(($1337)>>2)];
 $nslabs=$1338;
 label=163;break;
 case 163: 
 var $1340=$2;
 var $1341=(($1340+28)|0);
 var $1342=HEAP32[(($1341)>>2)];
 var $1343=HEAP32[(($1342)>>2)];
 var $1344=$nslabs;
 var $1345=(((($1343>>>0))/(($1344>>>0)))&-1);
 var $1346=$2;
 var $1347=(($1346+68)|0);
 var $1348=HEAP32[(($1347)>>2)];
 var $1349=(((($1348>>>0))/(4))&-1);
 var $1350=($1345>>>0)>=($1349>>>0);
 if($1350){label=164;break;}else{label=165;break;}
 case 164: 
 var $1352=$nslabs;
 var $1353=($1352<<1);
 $nslabs=$1353;
 label=163;break;
 case 165: 
 var $1355=$2;
 var $1356=(($1355+32)|0);
 var $1357=HEAP32[(($1356)>>2)];
 var $1358=$1357;
 var $1359=$preferred_alignment;
 var $1360=$nslabs;
 var $1361=((($1360)+(1))|0);
 var $1362=($1361<<2);
 var $1363=_posix_memalign($1358,$1359,$1362);
 var $1364=$2;
 var $1365=(($1364+32)|0);
 var $1366=HEAP32[(($1365)>>2)];
 var $1367=HEAP32[(($1366)>>2)];
 var $1368=($1367|0)==0;
 if($1368){label=166;break;}else{label=167;break;}
 case 166: 
 var $1370=$nslabs;
 var $1371=((($1370)+(1))|0);
 var $1372=($1371<<2);
 var $1373$0=$1372;
 var $1373$1=0;
 var $$etemp$30=3288;
 var $$etemp$29=1544;
 var $1374=_printf($$etemp$29,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1373$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1373$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$30,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 167: 
 $i=0;
 label=168;break;
 case 168: 
 var $1377=$i;
 var $1378=$nslabs;
 var $1379=($1377>>>0)<=($1378>>>0);
 if($1379){label=169;break;}else{label=171;break;}
 case 169: 
 var $1381=$2;
 var $1382=(($1381+28)|0);
 var $1383=HEAP32[(($1382)>>2)];
 var $1384=HEAP32[(($1383)>>2)];
 var $1385=$preferred_alignment_by_elements;
 var $1386=(((($1384>>>0))/(($1385>>>0)))&-1);
 var $1387=$i;
 var $1388=(Math_imul($1386,$1387)|0);
 var $1389=$nslabs;
 var $1390=(((($1388>>>0))/(($1389>>>0)))&-1);
 var $1391=$preferred_alignment_by_elements;
 var $1392=(Math_imul($1390,$1391)|0);
 var $1393=$i;
 var $1394=$2;
 var $1395=(($1394+32)|0);
 var $1396=HEAP32[(($1395)>>2)];
 var $1397=HEAP32[(($1396)>>2)];
 var $1398=(($1397+($1393<<2))|0);
 HEAP32[(($1398)>>2)]=$1392;
 label=170;break;
 case 170: 
 var $1400=$i;
 var $1401=((($1400)+(1))|0);
 $i=$1401;
 label=168;break;
 case 171: 
 var $1403=$2;
 var $1404=(($1403+76)|0);
 var $1405=HEAP32[(($1404)>>2)];
 HEAP32[(($1405)>>2)]=0;
 $i=0;
 label=172;break;
 case 172: 
 var $1407=$i;
 var $1408=$nslabs;
 var $1409=($1407>>>0)<($1408>>>0);
 if($1409){label=173;break;}else{label=177;break;}
 case 173: 
 var $1411=$i;
 var $1412=((($1411)+(1))|0);
 var $1413=$2;
 var $1414=(($1413+32)|0);
 var $1415=HEAP32[(($1414)>>2)];
 var $1416=HEAP32[(($1415)>>2)];
 var $1417=(($1416+($1412<<2))|0);
 var $1418=HEAP32[(($1417)>>2)];
 var $1419=$i;
 var $1420=$2;
 var $1421=(($1420+32)|0);
 var $1422=HEAP32[(($1421)>>2)];
 var $1423=HEAP32[(($1422)>>2)];
 var $1424=(($1423+($1419<<2))|0);
 var $1425=HEAP32[(($1424)>>2)];
 var $1426=((($1418)-($1425))|0);
 $temp=$1426;
 var $1427=$2;
 var $1428=(($1427+76)|0);
 var $1429=HEAP32[(($1428)>>2)];
 var $1430=HEAP32[(($1429)>>2)];
 var $1431=$temp;
 var $1432=($1430>>>0)<($1431>>>0);
 if($1432){label=174;break;}else{label=175;break;}
 case 174: 
 var $1434=$temp;
 var $1435=$2;
 var $1436=(($1435+76)|0);
 var $1437=HEAP32[(($1436)>>2)];
 HEAP32[(($1437)>>2)]=$1434;
 label=175;break;
 case 175: 
 label=176;break;
 case 176: 
 var $1440=$i;
 var $1441=((($1440)+(1))|0);
 $i=$1441;
 label=172;break;
 case 177: 
 label=178;break;
 case 178: 
 label=179;break;
 case 179: 
 $biggest_slab=0;
 $smallest_slab=2147483647;
 $totpackets=0;
 $totslabs=0;
 var $1445=$row_start;
 var $1446=$preferred_alignment;
 var $1447=$2;
 var $1448=(($1447+76)|0);
 var $1449=HEAP32[(($1448)>>2)];
 var $1450=HEAP32[(($1449)>>2)];
 var $1451=((($1450)+(1))|0);
 var $1452=($1451<<2);
 var $1453=_posix_memalign($1445,$1446,$1452);
 var $1454=HEAP32[(($row_start)>>2)];
 var $1455=($1454|0)==0;
 if($1455){label=180;break;}else{label=181;break;}
 case 180: 
 var $1457=$2;
 var $1458=(($1457+76)|0);
 var $1459=HEAP32[(($1458)>>2)];
 var $1460=HEAP32[(($1459)>>2)];
 var $1461=((($1460)+(1))|0);
 var $1462=($1461<<2);
 var $1463$0=$1462;
 var $1463$1=0;
 var $$etemp$32=3208;
 var $$etemp$31=1544;
 var $1464=_printf($$etemp$31,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1463$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1463$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$32,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 181: 
 var $1466=$row_curr;
 var $1467=$preferred_alignment;
 var $1468=$2;
 var $1469=(($1468+76)|0);
 var $1470=HEAP32[(($1469)>>2)];
 var $1471=HEAP32[(($1470)>>2)];
 var $1472=($1471<<2);
 var $1473=_posix_memalign($1466,$1467,$1472);
 var $1474=HEAP32[(($row_curr)>>2)];
 var $1475=($1474|0)==0;
 if($1475){label=182;break;}else{label=183;break;}
 case 182: 
 var $1477=$2;
 var $1478=(($1477+76)|0);
 var $1479=HEAP32[(($1478)>>2)];
 var $1480=HEAP32[(($1479)>>2)];
 var $1481=($1480<<2);
 var $1482$0=$1481;
 var $1482$1=0;
 var $$etemp$34=3184;
 var $$etemp$33=1544;
 var $1483=_printf($$etemp$33,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1482$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1482$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$34,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 183: 
 $realdata=0;
 $totaldata=0;
 $current_slab=0;
 var $1485=$2;
 var $1486=(($1485+60)|0);
 var $1487=HEAP32[(($1486)>>2)];
 var $1488=($1487|0)==2;
 if($1488){var $1495=1;label=185;break;}else{label=184;break;}
 case 184: 
 var $1490=$2;
 var $1491=(($1490+80)|0);
 var $ld$35$0=(($1491)|0);
 var $1492$0=HEAP32[(($ld$35$0)>>2)];
 var $ld$36$1=(($1491+4)|0);
 var $1492$1=HEAP32[(($ld$36$1)>>2)];
 var $$etemp$37$0=4;
 var $$etemp$37$1=0;
 var $1493=(($1492$0|0) != ($$etemp$37$0|0)) | (($1492$1|0) != ($$etemp$37$1|0));
 var $1495=$1493;label=185;break;
 case 185: 
 var $1495;
 var $1496=($1495?0:2);
 var $1497=$2;
 var $1498=(($1497+8)|0);
 var $1499=HEAP32[(($1498)>>2)];
 HEAP32[(($1499)>>2)]=$1496;
 var $1500=$2;
 var $1501=(($1500+44)|0);
 var $1502=HEAP32[(($1501)>>2)];
 var $1503=HEAP32[(($1502)>>2)];
 var $1504=($1503>>>0)>16;
 if($1504){label=186;break;}else{label=187;break;}
 case 186: 
 var $1506=$2;
 var $1507=(($1506+44)|0);
 var $1508=HEAP32[(($1507)>>2)];
 var $1509=HEAP32[(($1508)>>2)];
 var $1512=$1509;label=188;break;
 case 187: 
 var $1512=16;label=188;break;
 case 188: 
 var $1512;
 $temp_count=$1512;
 var $1513=$2;
 var $1514=(($1513+4)|0);
 var $1515=HEAP32[(($1514)>>2)];
 var $1516=$1515;
 var $1517=$preferred_alignment;
 var $1518=$temp_count;
 var $1519=(((($1518>>>0))/(2))&-1);
 var $1520=($1519<<7);
 var $1521=_posix_memalign($1516,$1517,$1520);
 var $1522=$2;
 var $1523=(($1522+4)|0);
 var $1524=HEAP32[(($1523)>>2)];
 var $1525=HEAP32[(($1524)>>2)];
 var $1526=($1525|0)==0;
 if($1526){label=189;break;}else{label=190;break;}
 case 189: 
 var $1528=$temp_count;
 var $1529=(((($1528>>>0))/(2))&-1);
 var $1530=($1529<<7);
 var $1531$0=$1530;
 var $1531$1=0;
 var $$etemp$39=3144;
 var $$etemp$38=1544;
 var $1532=_printf($$etemp$38,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1531$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1531$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$39,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 190: 
 $i=0;
 label=191;break;
 case 191: 
 var $1535=$i;
 var $1536=$temp_count;
 var $1537=$1536>>>1;
 var $1538=($1535>>>0)<($1537>>>0);
 if($1538){label=192;break;}else{label=198;break;}
 case 192: 
 $j=0;
 label=193;break;
 case 193: 
 var $1541=$j;
 var $1542=($1541>>>0)<16;
 if($1542){label=194;break;}else{label=196;break;}
 case 194: 
 var $1544=$j;
 var $1545=$i;
 var $1546=$2;
 var $1547=(($1546+4)|0);
 var $1548=HEAP32[(($1547)>>2)];
 var $1549=HEAP32[(($1548)>>2)];
 var $1550=(($1549+($1545<<7))|0);
 var $1551=(($1550+32)|0);
 var $1552=(($1551+($1544<<1))|0);
 HEAP16[(($1552)>>1)]=0;
 var $1553=$j;
 var $1554=$i;
 var $1555=$2;
 var $1556=(($1555+4)|0);
 var $1557=HEAP32[(($1556)>>2)];
 var $1558=HEAP32[(($1557)>>2)];
 var $1559=(($1558+($1554<<7))|0);
 var $1560=(($1559+64)|0);
 var $1561=(($1560+($1553<<2))|0);
 HEAPF32[(($1561)>>2)]=0;
 label=195;break;
 case 195: 
 var $1563=$j;
 var $1564=((($1563)+(1))|0);
 $j=$1564;
 label=193;break;
 case 196: 
 label=197;break;
 case 197: 
 var $1567=$i;
 var $1568=((($1567)+(1))|0);
 $i=$1568;
 label=191;break;
 case 198: 
 var $1570=$nslabs;
 var $1571=$2;
 var $1572=(($1571+96)|0);
 var $1573=HEAP32[(($1572)>>2)];
 HEAP32[(($1573)>>2)]=$1570;
 var $1574=$2;
 var $1575=(($1574+96)|0);
 var $1576=HEAP32[(($1575)>>2)];
 var $1577=HEAP32[(($1576)>>2)];
 var $1578=((($1577)+(1))|0);
 var $1579=((($1578)*(12))&-1);
 var $1580=$2;
 var $1581=(($1580+100)|0);
 var $1582=HEAP32[(($1581)>>2)];
 HEAP32[(($1582)>>2)]=$1579;
 var $1583=$2;
 var $1584=(($1583+100)|0);
 var $1585=HEAP32[(($1584)>>2)];
 var $1586=HEAP32[(($1585)>>2)];
 var $1587=((($1586)+(128))|0);
 HEAP32[(($1585)>>2)]=$1587;
 var $1588=$2;
 var $1589=(($1588+100)|0);
 var $1590=HEAP32[(($1589)>>2)];
 var $1591=HEAP32[(($1590)>>2)];
 var $1592=(((($1591>>>0))/(128))&-1);
 HEAP32[(($1590)>>2)]=$1592;
 var $1593=$2;
 var $1594=(($1593+100)|0);
 var $1595=HEAP32[(($1594)>>2)];
 var $1596=HEAP32[(($1595)>>2)];
 var $1597=($1596<<7);
 HEAP32[(($1595)>>2)]=$1597;
 var $1598=$2;
 var $1599=(($1598+4)|0);
 var $1600=HEAP32[(($1599)>>2)];
 var $1601=HEAP32[(($1600)>>2)];
 var $1602=$1601;
 var $1603=$2;
 var $1604=(($1603)|0);
 var $1605=HEAP32[(($1604)>>2)];
 HEAP32[(($1605)>>2)]=$1602;
 var $1606=$2;
 var $1607=(($1606+100)|0);
 var $1608=HEAP32[(($1607)>>2)];
 var $1609=HEAP32[(($1608)>>2)];
 var $1610=(((($1609>>>0))/(128))&-1);
 var $1611=$2;
 var $1612=(($1611+4)|0);
 var $1613=HEAP32[(($1612)>>2)];
 var $1614=HEAP32[(($1613)>>2)];
 var $1615=(($1614+($1610<<7))|0);
 $slab_ptr=$1615;
 $seg_index=0;
 $acctg_maxcount=0;
 $acctg_avgcount=0;
 $i=0;
 label=199;break;
 case 199: 
 var $1617=$i;
 var $1618=$2;
 var $1619=(($1618+96)|0);
 var $1620=HEAP32[(($1619)>>2)];
 var $1621=HEAP32[(($1620)>>2)];
 var $1622=($1617>>>0)<($1621>>>0);
 if($1622){label=200;break;}else{label=323;break;}
 case 200: 
 var $1624=$2;
 var $1625=(($1624+88)|0);
 var $1626=HEAP32[(($1625)>>2)];
 var $1627=HEAP32[(($1626)>>2)];
 var $1628=(((($1627|0))/(16))&-1);
 $nteams=$1628;
 var $1629=$2;
 var $1630=(($1629+100)|0);
 var $1631=HEAP32[(($1630)>>2)];
 var $1632=HEAP32[(($1631)>>2)];
 var $1633=(((($1632>>>0))/(128))&-1);
 var $1634=$current_slab;
 var $1635=$2;
 var $1636=(($1635)|0);
 var $1637=HEAP32[(($1636)>>2)];
 var $1638=HEAP32[(($1637)>>2)];
 var $1639=(($1638+((($1634)*(12))&-1))|0);
 var $1640=(($1639)|0);
 HEAP32[(($1640)>>2)]=$1633;
 var $1641=$i;
 var $1642=$2;
 var $1643=(($1642+32)|0);
 var $1644=HEAP32[(($1643)>>2)];
 var $1645=HEAP32[(($1644)>>2)];
 var $1646=(($1645+($1641<<2))|0);
 var $1647=HEAP32[(($1646)>>2)];
 var $1648=$2;
 var $1649=(($1648+32)|0);
 var $1650=HEAP32[(($1649)>>2)];
 var $1651=HEAP32[(($1650)>>2)];
 var $1652=(($1651)|0);
 var $1653=HEAP32[(($1652)>>2)];
 var $1654=((($1647)-($1653))|0);
 var $1655=$current_slab;
 var $1656=$2;
 var $1657=(($1656)|0);
 var $1658=HEAP32[(($1657)>>2)];
 var $1659=HEAP32[(($1658)>>2)];
 var $1660=(($1659+((($1655)*(12))&-1))|0);
 var $1661=(($1660+4)|0);
 HEAP32[(($1661)>>2)]=$1654;
 var $1662=$i;
 var $1663=((($1662)+(1))|0);
 var $1664=$2;
 var $1665=(($1664+32)|0);
 var $1666=HEAP32[(($1665)>>2)];
 var $1667=HEAP32[(($1666)>>2)];
 var $1668=(($1667+($1663<<2))|0);
 var $1669=HEAP32[(($1668)>>2)];
 var $1670=$i;
 var $1671=$2;
 var $1672=(($1671+32)|0);
 var $1673=HEAP32[(($1672)>>2)];
 var $1674=HEAP32[(($1673)>>2)];
 var $1675=(($1674+($1670<<2))|0);
 var $1676=HEAP32[(($1675)>>2)];
 var $1677=((($1669)-($1676))|0);
 var $1678=$current_slab;
 var $1679=$2;
 var $1680=(($1679)|0);
 var $1681=HEAP32[(($1680)>>2)];
 var $1682=HEAP32[(($1681)>>2)];
 var $1683=(($1682+((($1678)*(12))&-1))|0);
 var $1684=(($1683+8)|0);
 HEAP32[(($1684)>>2)]=$1677;
 var $1685=$i;
 var $1686=$2;
 var $1687=(($1686+32)|0);
 var $1688=HEAP32[(($1687)>>2)];
 var $1689=HEAP32[(($1688)>>2)];
 var $1690=(($1689+($1685<<2))|0);
 var $1691=HEAP32[(($1690)>>2)];
 var $1692=$2;
 var $1693=(($1692+12)|0);
 var $1694=HEAP32[(($1693)>>2)];
 var $1695=HEAP32[(($1694)>>2)];
 var $1696=(($1695+($1691<<2))|0);
 var $1697=HEAP32[(($1696)>>2)];
 var $1698=$i;
 var $1699=((($1698)+(1))|0);
 var $1700=$2;
 var $1701=(($1700+32)|0);
 var $1702=HEAP32[(($1701)>>2)];
 var $1703=HEAP32[(($1702)>>2)];
 var $1704=(($1703+($1699<<2))|0);
 var $1705=HEAP32[(($1704)>>2)];
 var $1706=$2;
 var $1707=(($1706+12)|0);
 var $1708=HEAP32[(($1707)>>2)];
 var $1709=HEAP32[(($1708)>>2)];
 var $1710=(($1709+($1705<<2))|0);
 var $1711=HEAP32[(($1710)>>2)];
 var $1712=($1697|0)==($1711|0);
 if($1712){label=201;break;}else{label=213;break;}
 case 201: 
 var $1714=$2;
 var $1715=(($1714+8)|0);
 var $1716=HEAP32[(($1715)>>2)];
 var $1717=HEAP32[(($1716)>>2)];
 var $1718=($1717>>>0)>0;
 if($1718){label=202;break;}else{label=203;break;}
 case 202: 
 var $1720=$2;
 var $1721=(($1720+8)|0);
 var $1722=HEAP32[(($1721)>>2)];
 var $1723=HEAP32[(($1722)>>2)];
 var $1726=$1723;label=204;break;
 case 203: 
 var $1726=1;label=204;break;
 case 204: 
 var $1726;
 $jloop=$1726;
 $j=0;
 label=205;break;
 case 205: 
 var $1728=$j;
 var $1729=$jloop;
 var $1730=($1728>>>0)<($1729>>>0);
 if($1730){label=206;break;}else{label=212;break;}
 case 206: 
 var $1732=$seg_index;
 var $1733=$slab_ptr;
 var $1734=(($1733+($1732<<7))|0);
 var $1735=$1734;
 $foo=$1735;
 $k=0;
 label=207;break;
 case 207: 
 var $1737=$k;
 var $1738=($1737>>>0)<32;
 if($1738){label=208;break;}else{label=210;break;}
 case 208: 
 var $1740=$k;
 var $1741=$foo;
 var $1742=(($1741+($1740<<2))|0);
 HEAP32[(($1742)>>2)]=0;
 label=209;break;
 case 209: 
 var $1744=$k;
 var $1745=((($1744)+(1))|0);
 $k=$1745;
 label=207;break;
 case 210: 
 var $1747=$seg_index;
 var $1748=((($1747)+(1))|0);
 $seg_index=$1748;
 var $1749=$2;
 var $1750=(($1749+100)|0);
 var $1751=HEAP32[(($1750)>>2)];
 var $1752=HEAP32[(($1751)>>2)];
 var $1753=((($1752)+(128))|0);
 HEAP32[(($1751)>>2)]=$1753;
 label=211;break;
 case 211: 
 var $1755=$j;
 var $1756=((($1755)+(1))|0);
 $j=$1756;
 label=205;break;
 case 212: 
 label=321;break;
 case 213: 
 $j=0;
 label=214;break;
 case 214: 
 var $1760=$j;
 var $1761=$i;
 var $1762=((($1761)+(1))|0);
 var $1763=$2;
 var $1764=(($1763+32)|0);
 var $1765=HEAP32[(($1764)>>2)];
 var $1766=HEAP32[(($1765)>>2)];
 var $1767=(($1766+($1762<<2))|0);
 var $1768=HEAP32[(($1767)>>2)];
 var $1769=$i;
 var $1770=$2;
 var $1771=(($1770+32)|0);
 var $1772=HEAP32[(($1771)>>2)];
 var $1773=HEAP32[(($1772)>>2)];
 var $1774=(($1773+($1769<<2))|0);
 var $1775=HEAP32[(($1774)>>2)];
 var $1776=((($1768)-($1775))|0);
 var $1777=($1760>>>0)<=($1776>>>0);
 if($1777){label=215;break;}else{label=217;break;}
 case 215: 
 var $1779=$i;
 var $1780=$2;
 var $1781=(($1780+32)|0);
 var $1782=HEAP32[(($1781)>>2)];
 var $1783=HEAP32[(($1782)>>2)];
 var $1784=(($1783+($1779<<2))|0);
 var $1785=HEAP32[(($1784)>>2)];
 var $1786=$j;
 var $1787=((($1785)+($1786))|0);
 var $1788=$2;
 var $1789=(($1788+12)|0);
 var $1790=HEAP32[(($1789)>>2)];
 var $1791=HEAP32[(($1790)>>2)];
 var $1792=(($1791+($1787<<2))|0);
 var $1793=HEAP32[(($1792)>>2)];
 var $1794=$j;
 var $1795=HEAP32[(($row_start)>>2)];
 var $1796=(($1795+($1794<<2))|0);
 HEAP32[(($1796)>>2)]=$1793;
 label=216;break;
 case 216: 
 var $1798=$j;
 var $1799=((($1798)+(1))|0);
 $j=$1799;
 label=214;break;
 case 217: 
 var $1801=$2;
 var $1802=(($1801+80)|0);
 var $ld$40$0=(($1802)|0);
 var $1803$0=HEAP32[(($ld$40$0)>>2)];
 var $ld$41$1=(($1802+4)|0);
 var $1803$1=HEAP32[(($ld$41$1)>>2)];
 var $$etemp$42$0=4;
 var $$etemp$42$1=0;
 var $1804=(($1803$0|0) != ($$etemp$42$0|0)) | (($1803$1|0) != ($$etemp$42$1|0));
 if($1804){label=219;break;}else{label=218;break;}
 case 218: 
 var $1806=$2;
 var $1807=(($1806+60)|0);
 var $1808=HEAP32[(($1807)>>2)];
 var $1809=($1808|0)==2;
 if($1809){label=219;break;}else{label=261;break;}
 case 219: 
 $j=0;
 label=220;break;
 case 220: 
 var $1812=$j;
 var $1813=$2;
 var $1814=(($1813+24)|0);
 var $1815=HEAP32[(($1814)>>2)];
 var $1816=HEAP32[(($1815)>>2)];
 var $1817=($1812>>>0)<($1816>>>0);
 if($1817){label=221;break;}else{label=260;break;}
 case 221: 
 $k=0;
 label=222;break;
 case 222: 
 var $1820=$k;
 var $1821=$i;
 var $1822=((($1821)+(1))|0);
 var $1823=$2;
 var $1824=(($1823+32)|0);
 var $1825=HEAP32[(($1824)>>2)];
 var $1826=HEAP32[(($1825)>>2)];
 var $1827=(($1826+($1822<<2))|0);
 var $1828=HEAP32[(($1827)>>2)];
 var $1829=$i;
 var $1830=$2;
 var $1831=(($1830+32)|0);
 var $1832=HEAP32[(($1831)>>2)];
 var $1833=HEAP32[(($1832)>>2)];
 var $1834=(($1833+($1829<<2))|0);
 var $1835=HEAP32[(($1834)>>2)];
 var $1836=((($1828)-($1835))|0);
 var $1837=($1820>>>0)<($1836>>>0);
 if($1837){label=223;break;}else{label=258;break;}
 case 223: 
 $kk=0;
 label=224;break;
 case 224: 
 var $1840=$kk;
 var $1841=($1840>>>0)<16;
 if($1841){label=225;break;}else{label=232;break;}
 case 225: 
 var $1843=$kk;
 var $1844=(($count+($1843<<2))|0);
 HEAP32[(($1844)>>2)]=0;
 var $1845=$k;
 var $1846=$kk;
 var $1847=((($1845)+($1846))|0);
 var $1848=HEAP32[(($row_start)>>2)];
 var $1849=(($1848+($1847<<2))|0);
 var $1850=HEAP32[(($1849)>>2)];
 var $1851=$k;
 var $1852=$kk;
 var $1853=((($1851)+($1852))|0);
 var $1854=HEAP32[(($row_curr)>>2)];
 var $1855=(($1854+($1853<<2))|0);
 HEAP32[(($1855)>>2)]=$1850;
 label=226;break;
 case 226: 
 var $1857=$k;
 var $1858=$kk;
 var $1859=((($1857)+($1858))|0);
 var $1860=HEAP32[(($row_curr)>>2)];
 var $1861=(($1860+($1859<<2))|0);
 var $1862=HEAP32[(($1861)>>2)];
 var $1863=$2;
 var $1864=(($1863+16)|0);
 var $1865=HEAP32[(($1864)>>2)];
 var $1866=HEAP32[(($1865)>>2)];
 var $1867=(($1866+($1862<<2))|0);
 var $1868=HEAP32[(($1867)>>2)];
 var $1869=$j;
 var $1870=$2;
 var $1871=(($1870+64)|0);
 var $1872=HEAP32[(($1871)>>2)];
 var $1873=HEAP32[(($1872)>>2)];
 var $1874=((($1869)+($1873))|0);
 var $1875=($1868>>>0)<($1874>>>0);
 if($1875){label=227;break;}else{var $1903=0;label=228;break;}
 case 227: 
 var $1877=$k;
 var $1878=$kk;
 var $1879=((($1877)+($1878))|0);
 var $1880=HEAP32[(($row_curr)>>2)];
 var $1881=(($1880+($1879<<2))|0);
 var $1882=HEAP32[(($1881)>>2)];
 var $1883=$i;
 var $1884=$2;
 var $1885=(($1884+32)|0);
 var $1886=HEAP32[(($1885)>>2)];
 var $1887=HEAP32[(($1886)>>2)];
 var $1888=(($1887+($1883<<2))|0);
 var $1889=HEAP32[(($1888)>>2)];
 var $1890=$k;
 var $1891=((($1889)+($1890))|0);
 var $1892=$kk;
 var $1893=((($1891)+($1892))|0);
 var $1894=((($1893)+(1))|0);
 var $1895=$2;
 var $1896=(($1895+12)|0);
 var $1897=HEAP32[(($1896)>>2)];
 var $1898=HEAP32[(($1897)>>2)];
 var $1899=(($1898+($1894<<2))|0);
 var $1900=HEAP32[(($1899)>>2)];
 var $1901=($1882>>>0)<($1900>>>0);
 var $1903=$1901;label=228;break;
 case 228: 
 var $1903;
 if($1903){label=229;break;}else{label=230;break;}
 case 229: 
 var $1905=$k;
 var $1906=$kk;
 var $1907=((($1905)+($1906))|0);
 var $1908=HEAP32[(($row_curr)>>2)];
 var $1909=(($1908+($1907<<2))|0);
 var $1910=HEAP32[(($1909)>>2)];
 var $1911=((($1910)+(1))|0);
 HEAP32[(($1909)>>2)]=$1911;
 var $1912=$kk;
 var $1913=(($count+($1912<<2))|0);
 var $1914=HEAP32[(($1913)>>2)];
 var $1915=((($1914)+(1))|0);
 HEAP32[(($1913)>>2)]=$1915;
 label=226;break;
 case 230: 
 label=231;break;
 case 231: 
 var $1918=$kk;
 var $1919=((($1918)+(1))|0);
 $kk=$1919;
 label=224;break;
 case 232: 
 $maxcount=0;
 $kk=0;
 label=233;break;
 case 233: 
 var $1922=$kk;
 var $1923=($1922>>>0)<16;
 if($1923){label=234;break;}else{label=238;break;}
 case 234: 
 var $1925=$kk;
 var $1926=(($count+($1925<<2))|0);
 var $1927=HEAP32[(($1926)>>2)];
 var $1928=$maxcount;
 var $1929=($1927>>>0)>($1928>>>0);
 if($1929){label=235;break;}else{label=236;break;}
 case 235: 
 var $1931=$kk;
 var $1932=(($count+($1931<<2))|0);
 var $1933=HEAP32[(($1932)>>2)];
 $maxcount=$1933;
 label=236;break;
 case 236: 
 label=237;break;
 case 237: 
 var $1936=$kk;
 var $1937=((($1936)+(1))|0);
 $kk=$1937;
 label=233;break;
 case 238: 
 $sum=0;
 $kk=0;
 label=239;break;
 case 239: 
 var $1940=$kk;
 var $1941=($1940>>>0)<16;
 if($1941){label=240;break;}else{label=242;break;}
 case 240: 
 var $1943=$kk;
 var $1944=(($count+($1943<<2))|0);
 var $1945=HEAP32[(($1944)>>2)];
 var $1946=$sum;
 var $1947=((($1946)+($1945))|0);
 $sum=$1947;
 label=241;break;
 case 241: 
 var $1949=$kk;
 var $1950=((($1949)+(1))|0);
 $kk=$1950;
 label=239;break;
 case 242: 
 var $1952=$sum;
 var $1953=$realdata;
 var $1954=((($1953)+($1952))|0);
 $realdata=$1954;
 var $1955=$maxcount;
 var $1956=($1955<<4);
 var $1957=$totaldata;
 var $1958=((($1957)+($1956))|0);
 $totaldata=$1958;
 $countdex=0;
 label=243;break;
 case 243: 
 var $1960=$countdex;
 var $1961=$maxcount;
 var $1962=($1960>>>0)<($1961>>>0);
 if($1962){label=244;break;}else{label=252;break;}
 case 244: 
 var $1964=$j;
 var $1965=$seg_index;
 var $1966=$slab_ptr;
 var $1967=(($1966+($1965<<7))|0);
 var $1968=(($1967)|0);
 HEAP32[(($1968)>>2)]=$1964;
 var $1969=$k;
 var $1970=$seg_index;
 var $1971=$slab_ptr;
 var $1972=(($1971+($1970<<7))|0);
 var $1973=(($1972+12)|0);
 HEAP32[(($1973)>>2)]=$1969;
 $kk=0;
 label=245;break;
 case 245: 
 var $1975=$kk;
 var $1976=($1975>>>0)<16;
 if($1976){label=246;break;}else{label=250;break;}
 case 246: 
 var $1978=$countdex;
 var $1979=$kk;
 var $1980=(($count+($1979<<2))|0);
 var $1981=HEAP32[(($1980)>>2)];
 var $1982=($1978>>>0)<($1981>>>0);
 if($1982){label=247;break;}else{label=248;break;}
 case 247: 
 var $1984=$k;
 var $1985=$kk;
 var $1986=((($1984)+($1985))|0);
 var $1987=HEAP32[(($row_start)>>2)];
 var $1988=(($1987+($1986<<2))|0);
 var $1989=HEAP32[(($1988)>>2)];
 var $1990=$countdex;
 var $1991=((($1989)+($1990))|0);
 var $1992=$2;
 var $1993=(($1992+16)|0);
 var $1994=HEAP32[(($1993)>>2)];
 var $1995=HEAP32[(($1994)>>2)];
 var $1996=(($1995+($1991<<2))|0);
 var $1997=HEAP32[(($1996)>>2)];
 var $1998=$2;
 var $1999=(($1998+64)|0);
 var $2000=HEAP32[(($1999)>>2)];
 var $2001=HEAP32[(($2000)>>2)];
 var $2002=((($2001)-(1))|0);
 var $2003=$1997&$2002;
 var $2004=(($2003)&65535);
 var $2005=$kk;
 var $2006=$seg_index;
 var $2007=$slab_ptr;
 var $2008=(($2007+($2006<<7))|0);
 var $2009=(($2008+32)|0);
 var $2010=(($2009+($2005<<1))|0);
 HEAP16[(($2010)>>1)]=$2004;
 var $2011=$k;
 var $2012=$kk;
 var $2013=((($2011)+($2012))|0);
 var $2014=HEAP32[(($row_start)>>2)];
 var $2015=(($2014+($2013<<2))|0);
 var $2016=HEAP32[(($2015)>>2)];
 var $2017=$countdex;
 var $2018=((($2016)+($2017))|0);
 var $2019=$2;
 var $2020=(($2019+20)|0);
 var $2021=HEAP32[(($2020)>>2)];
 var $2022=HEAP32[(($2021)>>2)];
 var $2023=(($2022+($2018<<2))|0);
 var $2024=HEAPF32[(($2023)>>2)];
 var $2025=$kk;
 var $2026=$seg_index;
 var $2027=$slab_ptr;
 var $2028=(($2027+($2026<<7))|0);
 var $2029=(($2028+64)|0);
 var $2030=(($2029+($2025<<2))|0);
 HEAPF32[(($2030)>>2)]=$2024;
 label=248;break;
 case 248: 
 label=249;break;
 case 249: 
 var $2033=$kk;
 var $2034=((($2033)+(1))|0);
 $kk=$2034;
 label=245;break;
 case 250: 
 var $2036=$seg_index;
 var $2037=((($2036)+(1))|0);
 $seg_index=$2037;
 var $2038=$2;
 var $2039=(($2038+100)|0);
 var $2040=HEAP32[(($2039)>>2)];
 var $2041=HEAP32[(($2040)>>2)];
 var $2042=((($2041)+(128))|0);
 HEAP32[(($2040)>>2)]=$2042;
 label=251;break;
 case 251: 
 var $2044=$countdex;
 var $2045=((($2044)+(1))|0);
 $countdex=$2045;
 label=243;break;
 case 252: 
 $kk=0;
 label=253;break;
 case 253: 
 var $2048=$kk;
 var $2049=($2048>>>0)<16;
 if($2049){label=254;break;}else{label=256;break;}
 case 254: 
 var $2051=$k;
 var $2052=$kk;
 var $2053=((($2051)+($2052))|0);
 var $2054=HEAP32[(($row_curr)>>2)];
 var $2055=(($2054+($2053<<2))|0);
 var $2056=HEAP32[(($2055)>>2)];
 var $2057=$k;
 var $2058=$kk;
 var $2059=((($2057)+($2058))|0);
 var $2060=HEAP32[(($row_start)>>2)];
 var $2061=(($2060+($2059<<2))|0);
 HEAP32[(($2061)>>2)]=$2056;
 label=255;break;
 case 255: 
 var $2063=$kk;
 var $2064=((($2063)+(1))|0);
 $kk=$2064;
 label=253;break;
 case 256: 
 label=257;break;
 case 257: 
 var $2067=$k;
 var $2068=((($2067)+(16))|0);
 $k=$2068;
 label=222;break;
 case 258: 
 label=259;break;
 case 259: 
 var $2071=$2;
 var $2072=(($2071+64)|0);
 var $2073=HEAP32[(($2072)>>2)];
 var $2074=HEAP32[(($2073)>>2)];
 var $2075=$j;
 var $2076=((($2075)+($2074))|0);
 $j=$2076;
 label=220;break;
 case 260: 
 label=320;break;
 case 261: 
 var $2079=$seg_index;
 var $2080=$slab_ptr;
 var $2081=(($2080+($2079<<7))|0);
 var $2082=$2081;
 $first_team_offset=$2082;
 $j=0;
 label=262;break;
 case 262: 
 var $2084=$j;
 var $2085=$2;
 var $2086=(($2085+8)|0);
 var $2087=HEAP32[(($2086)>>2)];
 var $2088=HEAP32[(($2087)>>2)];
 var $2089=($2084>>>0)<($2088>>>0);
 if($2089){label=263;break;}else{label=265;break;}
 case 263: 
 var $2091=$seg_index;
 var $2092=((($2091)+(1))|0);
 $seg_index=$2092;
 var $2093=$2;
 var $2094=(($2093+100)|0);
 var $2095=HEAP32[(($2094)>>2)];
 var $2096=HEAP32[(($2095)>>2)];
 var $2097=((($2096)+(128))|0);
 HEAP32[(($2095)>>2)]=$2097;
 label=264;break;
 case 264: 
 var $2099=$j;
 var $2100=((($2099)+(1))|0);
 $j=$2100;
 label=262;break;
 case 265: 
 $packet_offset=0;
 $k=0;
 label=266;break;
 case 266: 
 var $2103=$k;
 var $2104=$i;
 var $2105=((($2104)+(1))|0);
 var $2106=$2;
 var $2107=(($2106+32)|0);
 var $2108=HEAP32[(($2107)>>2)];
 var $2109=HEAP32[(($2108)>>2)];
 var $2110=(($2109+($2105<<2))|0);
 var $2111=HEAP32[(($2110)>>2)];
 var $2112=$i;
 var $2113=$2;
 var $2114=(($2113+32)|0);
 var $2115=HEAP32[(($2114)>>2)];
 var $2116=HEAP32[(($2115)>>2)];
 var $2117=(($2116+($2112<<2))|0);
 var $2118=HEAP32[(($2117)>>2)];
 var $2119=((($2111)-($2118))|0);
 var $2120=($2103>>>0)<($2119>>>0);
 if($2120){label=267;break;}else{label=309;break;}
 case 267: 
 $packet_count=0;
 $j=0;
 label=268;break;
 case 268: 
 var $2123=$j;
 var $2124=$2;
 var $2125=(($2124+24)|0);
 var $2126=HEAP32[(($2125)>>2)];
 var $2127=HEAP32[(($2126)>>2)];
 var $2128=($2123>>>0)<($2127>>>0);
 if($2128){label=269;break;}else{label=304;break;}
 case 269: 
 $kk1=0;
 label=270;break;
 case 270: 
 var $2131=$kk1;
 var $2132=($2131>>>0)<16;
 if($2132){label=271;break;}else{label=278;break;}
 case 271: 
 var $2134=$kk1;
 var $2135=(($count2+($2134<<2))|0);
 HEAP32[(($2135)>>2)]=0;
 var $2136=$k;
 var $2137=$kk1;
 var $2138=((($2136)+($2137))|0);
 var $2139=HEAP32[(($row_start)>>2)];
 var $2140=(($2139+($2138<<2))|0);
 var $2141=HEAP32[(($2140)>>2)];
 var $2142=$k;
 var $2143=$kk1;
 var $2144=((($2142)+($2143))|0);
 var $2145=HEAP32[(($row_curr)>>2)];
 var $2146=(($2145+($2144<<2))|0);
 HEAP32[(($2146)>>2)]=$2141;
 label=272;break;
 case 272: 
 var $2148=$k;
 var $2149=$kk1;
 var $2150=((($2148)+($2149))|0);
 var $2151=HEAP32[(($row_curr)>>2)];
 var $2152=(($2151+($2150<<2))|0);
 var $2153=HEAP32[(($2152)>>2)];
 var $2154=$2;
 var $2155=(($2154+16)|0);
 var $2156=HEAP32[(($2155)>>2)];
 var $2157=HEAP32[(($2156)>>2)];
 var $2158=(($2157+($2153<<2))|0);
 var $2159=HEAP32[(($2158)>>2)];
 var $2160=$j;
 var $2161=$2;
 var $2162=(($2161+64)|0);
 var $2163=HEAP32[(($2162)>>2)];
 var $2164=HEAP32[(($2163)>>2)];
 var $2165=((($2160)+($2164))|0);
 var $2166=($2159>>>0)<($2165>>>0);
 if($2166){label=273;break;}else{var $2194=0;label=274;break;}
 case 273: 
 var $2168=$k;
 var $2169=$kk1;
 var $2170=((($2168)+($2169))|0);
 var $2171=HEAP32[(($row_curr)>>2)];
 var $2172=(($2171+($2170<<2))|0);
 var $2173=HEAP32[(($2172)>>2)];
 var $2174=$i;
 var $2175=$2;
 var $2176=(($2175+32)|0);
 var $2177=HEAP32[(($2176)>>2)];
 var $2178=HEAP32[(($2177)>>2)];
 var $2179=(($2178+($2174<<2))|0);
 var $2180=HEAP32[(($2179)>>2)];
 var $2181=$k;
 var $2182=((($2180)+($2181))|0);
 var $2183=$kk1;
 var $2184=((($2182)+($2183))|0);
 var $2185=((($2184)+(1))|0);
 var $2186=$2;
 var $2187=(($2186+12)|0);
 var $2188=HEAP32[(($2187)>>2)];
 var $2189=HEAP32[(($2188)>>2)];
 var $2190=(($2189+($2185<<2))|0);
 var $2191=HEAP32[(($2190)>>2)];
 var $2192=($2173>>>0)<($2191>>>0);
 var $2194=$2192;label=274;break;
 case 274: 
 var $2194;
 if($2194){label=275;break;}else{label=276;break;}
 case 275: 
 var $2196=$k;
 var $2197=$kk1;
 var $2198=((($2196)+($2197))|0);
 var $2199=HEAP32[(($row_curr)>>2)];
 var $2200=(($2199+($2198<<2))|0);
 var $2201=HEAP32[(($2200)>>2)];
 var $2202=((($2201)+(1))|0);
 HEAP32[(($2200)>>2)]=$2202;
 var $2203=$kk1;
 var $2204=(($count2+($2203<<2))|0);
 var $2205=HEAP32[(($2204)>>2)];
 var $2206=((($2205)+(1))|0);
 HEAP32[(($2204)>>2)]=$2206;
 label=272;break;
 case 276: 
 label=277;break;
 case 277: 
 var $2209=$kk1;
 var $2210=((($2209)+(1))|0);
 $kk1=$2210;
 label=270;break;
 case 278: 
 $maxcount3=0;
 $kk1=0;
 label=279;break;
 case 279: 
 var $2213=$kk1;
 var $2214=($2213>>>0)<16;
 if($2214){label=280;break;}else{label=284;break;}
 case 280: 
 var $2216=$kk1;
 var $2217=(($count2+($2216<<2))|0);
 var $2218=HEAP32[(($2217)>>2)];
 var $2219=$maxcount3;
 var $2220=($2218>>>0)>($2219>>>0);
 if($2220){label=281;break;}else{label=282;break;}
 case 281: 
 var $2222=$kk1;
 var $2223=(($count2+($2222<<2))|0);
 var $2224=HEAP32[(($2223)>>2)];
 $maxcount3=$2224;
 label=282;break;
 case 282: 
 label=283;break;
 case 283: 
 var $2227=$kk1;
 var $2228=((($2227)+(1))|0);
 $kk1=$2228;
 label=279;break;
 case 284: 
 $sum4=0;
 $kk1=0;
 label=285;break;
 case 285: 
 var $2231=$kk1;
 var $2232=($2231>>>0)<16;
 if($2232){label=286;break;}else{label=288;break;}
 case 286: 
 var $2234=$kk1;
 var $2235=(($count2+($2234<<2))|0);
 var $2236=HEAP32[(($2235)>>2)];
 var $2237=$sum4;
 var $2238=((($2237)+($2236))|0);
 $sum4=$2238;
 label=287;break;
 case 287: 
 var $2240=$kk1;
 var $2241=((($2240)+(1))|0);
 $kk1=$2241;
 label=285;break;
 case 288: 
 var $2243=$sum4;
 var $2244=$realdata;
 var $2245=((($2244)+($2243))|0);
 $realdata=$2245;
 var $2246=$maxcount3;
 var $2247=($2246<<4);
 var $2248=$totaldata;
 var $2249=((($2248)+($2247))|0);
 $totaldata=$2249;
 $countdex5=0;
 label=289;break;
 case 289: 
 var $2251=$countdex5;
 var $2252=$maxcount3;
 var $2253=($2251>>>0)<($2252>>>0);
 if($2253){label=290;break;}else{label=298;break;}
 case 290: 
 var $2255=$j;
 var $2256=$seg_index;
 var $2257=$slab_ptr;
 var $2258=(($2257+($2256<<7))|0);
 var $2259=(($2258)|0);
 HEAP32[(($2259)>>2)]=$2255;
 var $2260=$k;
 var $2261=$seg_index;
 var $2262=$slab_ptr;
 var $2263=(($2262+($2261<<7))|0);
 var $2264=(($2263+12)|0);
 HEAP32[(($2264)>>2)]=$2260;
 $kk1=0;
 label=291;break;
 case 291: 
 var $2266=$kk1;
 var $2267=($2266>>>0)<16;
 if($2267){label=292;break;}else{label=296;break;}
 case 292: 
 var $2269=$countdex5;
 var $2270=$kk1;
 var $2271=(($count2+($2270<<2))|0);
 var $2272=HEAP32[(($2271)>>2)];
 var $2273=($2269>>>0)<($2272>>>0);
 if($2273){label=293;break;}else{label=294;break;}
 case 293: 
 var $2275=$k;
 var $2276=$kk1;
 var $2277=((($2275)+($2276))|0);
 var $2278=HEAP32[(($row_start)>>2)];
 var $2279=(($2278+($2277<<2))|0);
 var $2280=HEAP32[(($2279)>>2)];
 var $2281=$countdex5;
 var $2282=((($2280)+($2281))|0);
 var $2283=$2;
 var $2284=(($2283+16)|0);
 var $2285=HEAP32[(($2284)>>2)];
 var $2286=HEAP32[(($2285)>>2)];
 var $2287=(($2286+($2282<<2))|0);
 var $2288=HEAP32[(($2287)>>2)];
 var $2289=$2;
 var $2290=(($2289+64)|0);
 var $2291=HEAP32[(($2290)>>2)];
 var $2292=HEAP32[(($2291)>>2)];
 var $2293=((($2292)-(1))|0);
 var $2294=$2288&$2293;
 var $2295=(($2294)&65535);
 var $2296=$kk1;
 var $2297=$seg_index;
 var $2298=$slab_ptr;
 var $2299=(($2298+($2297<<7))|0);
 var $2300=(($2299+32)|0);
 var $2301=(($2300+($2296<<1))|0);
 HEAP16[(($2301)>>1)]=$2295;
 var $2302=$k;
 var $2303=$kk1;
 var $2304=((($2302)+($2303))|0);
 var $2305=HEAP32[(($row_start)>>2)];
 var $2306=(($2305+($2304<<2))|0);
 var $2307=HEAP32[(($2306)>>2)];
 var $2308=$countdex5;
 var $2309=((($2307)+($2308))|0);
 var $2310=$2;
 var $2311=(($2310+20)|0);
 var $2312=HEAP32[(($2311)>>2)];
 var $2313=HEAP32[(($2312)>>2)];
 var $2314=(($2313+($2309<<2))|0);
 var $2315=HEAPF32[(($2314)>>2)];
 var $2316=$kk1;
 var $2317=$seg_index;
 var $2318=$slab_ptr;
 var $2319=(($2318+($2317<<7))|0);
 var $2320=(($2319+64)|0);
 var $2321=(($2320+($2316<<2))|0);
 HEAPF32[(($2321)>>2)]=$2315;
 label=294;break;
 case 294: 
 label=295;break;
 case 295: 
 var $2324=$kk1;
 var $2325=((($2324)+(1))|0);
 $kk1=$2325;
 label=291;break;
 case 296: 
 var $2327=$seg_index;
 var $2328=((($2327)+(1))|0);
 $seg_index=$2328;
 var $2329=$packet_count;
 var $2330=((($2329)+(1))|0);
 $packet_count=$2330;
 var $2331=$2;
 var $2332=(($2331+100)|0);
 var $2333=HEAP32[(($2332)>>2)];
 var $2334=HEAP32[(($2333)>>2)];
 var $2335=((($2334)+(128))|0);
 HEAP32[(($2333)>>2)]=$2335;
 label=297;break;
 case 297: 
 var $2337=$countdex5;
 var $2338=((($2337)+(1))|0);
 $countdex5=$2338;
 label=289;break;
 case 298: 
 $kk1=0;
 label=299;break;
 case 299: 
 var $2341=$kk1;
 var $2342=($2341>>>0)<16;
 if($2342){label=300;break;}else{label=302;break;}
 case 300: 
 var $2344=$k;
 var $2345=$kk1;
 var $2346=((($2344)+($2345))|0);
 var $2347=HEAP32[(($row_curr)>>2)];
 var $2348=(($2347+($2346<<2))|0);
 var $2349=HEAP32[(($2348)>>2)];
 var $2350=$k;
 var $2351=$kk1;
 var $2352=((($2350)+($2351))|0);
 var $2353=HEAP32[(($row_start)>>2)];
 var $2354=(($2353+($2352<<2))|0);
 HEAP32[(($2354)>>2)]=$2349;
 label=301;break;
 case 301: 
 var $2356=$kk1;
 var $2357=((($2356)+(1))|0);
 $kk1=$2357;
 label=299;break;
 case 302: 
 label=303;break;
 case 303: 
 var $2360=$2;
 var $2361=(($2360+64)|0);
 var $2362=HEAP32[(($2361)>>2)];
 var $2363=HEAP32[(($2362)>>2)];
 var $2364=$j;
 var $2365=((($2364)+($2363))|0);
 $j=$2365;
 label=268;break;
 case 304: 
 var $2367=$packet_offset;
 var $2368=($2367|0)>65535;
 if($2368){label=306;break;}else{label=305;break;}
 case 305: 
 var $2370=$packet_count;
 var $2371=($2370|0)>65535;
 if($2371){label=306;break;}else{label=307;break;}
 case 306: 
 var $2373=_printf(3104,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $1=-1;
 label=341;break;
 case 307: 
 var $2375=$packet_offset;
 var $2376=($2375<<16);
 var $2377=$packet_count;
 var $2378=((($2376)+($2377))|0);
 var $2379=$k;
 var $2380=$2379>>>4;
 var $2381=$first_team_offset;
 var $2382=(($2381+($2380<<2))|0);
 HEAP32[(($2382)>>2)]=$2378;
 var $2383=$packet_count;
 var $2384=$packet_offset;
 var $2385=((($2384)+($2383))|0);
 $packet_offset=$2385;
 label=308;break;
 case 308: 
 var $2387=$k;
 var $2388=((($2387)+(16))|0);
 $k=$2388;
 label=266;break;
 case 309: 
 var $2390=$i;
 var $2391=((($2390)+(1))|0);
 var $2392=$2;
 var $2393=(($2392+32)|0);
 var $2394=HEAP32[(($2393)>>2)];
 var $2395=HEAP32[(($2394)>>2)];
 var $2396=(($2395+($2391<<2))|0);
 var $2397=HEAP32[(($2396)>>2)];
 var $2398=$i;
 var $2399=$2;
 var $2400=(($2399+32)|0);
 var $2401=HEAP32[(($2400)>>2)];
 var $2402=HEAP32[(($2401)>>2)];
 var $2403=(($2402+($2398<<2))|0);
 var $2404=HEAP32[(($2403)>>2)];
 var $2405=((($2397)-($2404))|0);
 $k=$2405;
 label=310;break;
 case 310: 
 var $2407=$k;
 var $2408=$nteams;
 var $2409=($2408<<4);
 var $2410=($2407>>>0)<($2409>>>0);
 if($2410){label=311;break;}else{label=313;break;}
 case 311: 
 var $2412=$k;
 var $2413=$2412>>>4;
 var $2414=$first_team_offset;
 var $2415=(($2414+($2413<<2))|0);
 HEAP32[(($2415)>>2)]=0;
 label=312;break;
 case 312: 
 var $2417=$k;
 var $2418=((($2417)+(16))|0);
 $k=$2418;
 label=310;break;
 case 313: 
 $tempmaxcount=0;
 $tempavgcount=0;
 $k=0;
 label=314;break;
 case 314: 
 var $2421=$k;
 var $2422=$nteams;
 var $2423=($2421>>>0)<($2422>>>0);
 if($2423){label=315;break;}else{label=319;break;}
 case 315: 
 var $2425=$k;
 var $2426=$first_team_offset;
 var $2427=(($2426+($2425<<2))|0);
 var $2428=HEAP32[(($2427)>>2)];
 var $2429=(((($2428|0))%(65536))&-1);
 $tempcount=$2429;
 var $2430=$tempcount;
 var $2431=$tempavgcount;
 var $2432=((($2431)+($2430))|0);
 $tempavgcount=$2432;
 var $2433=$tempcount;
 var $2434=$tempmaxcount;
 var $2435=($2433|0)>($2434|0);
 if($2435){label=316;break;}else{label=317;break;}
 case 316: 
 var $2437=$tempcount;
 $tempmaxcount=$2437;
 label=317;break;
 case 317: 
 label=318;break;
 case 318: 
 var $2440=$k;
 var $2441=((($2440)+(1))|0);
 $k=$2441;
 label=314;break;
 case 319: 
 var $2443=$tempavgcount;
 var $2444=($2443|0);
 var $2445=$nteams;
 var $2446=($2445>>>0);
 var $2447=($2444)/($2446);
 var $2448=$acctg_avgcount;
 var $2449=($2448)+($2447);
 $acctg_avgcount=$2449;
 var $2450=$tempmaxcount;
 var $2451=$acctg_maxcount;
 var $2452=((($2451)+($2450))|0);
 $acctg_maxcount=$2452;
 label=320;break;
 case 320: 
 label=321;break;
 case 321: 
 var $2455=$current_slab;
 var $2456=((($2455)+(1))|0);
 $current_slab=$2456;
 label=322;break;
 case 322: 
 var $2458=$i;
 var $2459=((($2458)+(1))|0);
 $i=$2459;
 label=199;break;
 case 323: 
 var $2461=HEAP32[(($row_start)>>2)];
 var $2462=$2461;
 _free($2462);
 var $2463=HEAP32[(($row_curr)>>2)];
 var $2464=$2463;
 _free($2464);
 var $2465=$2;
 var $2466=(($2465+100)|0);
 var $2467=HEAP32[(($2466)>>2)];
 var $2468=HEAP32[(($2467)>>2)];
 var $2469=(((($2468>>>0))/(128))&-1);
 var $2470=$current_slab;
 var $2471=$2;
 var $2472=(($2471)|0);
 var $2473=HEAP32[(($2472)>>2)];
 var $2474=HEAP32[(($2473)>>2)];
 var $2475=(($2474+((($2470)*(12))&-1))|0);
 var $2476=(($2475)|0);
 HEAP32[(($2476)>>2)]=$2469;
 var $2477=$2;
 var $2478=(($2477+96)|0);
 var $2479=HEAP32[(($2478)>>2)];
 var $2480=HEAP32[(($2479)>>2)];
 var $2481=$2;
 var $2482=(($2481+32)|0);
 var $2483=HEAP32[(($2482)>>2)];
 var $2484=HEAP32[(($2483)>>2)];
 var $2485=(($2484+($2480<<2))|0);
 var $2486=HEAP32[(($2485)>>2)];
 var $2487=$2;
 var $2488=(($2487+32)|0);
 var $2489=HEAP32[(($2488)>>2)];
 var $2490=HEAP32[(($2489)>>2)];
 var $2491=(($2490)|0);
 var $2492=HEAP32[(($2491)>>2)];
 var $2493=((($2486)-($2492))|0);
 var $2494=$current_slab;
 var $2495=$2;
 var $2496=(($2495)|0);
 var $2497=HEAP32[(($2496)>>2)];
 var $2498=HEAP32[(($2497)>>2)];
 var $2499=(($2498+((($2494)*(12))&-1))|0);
 var $2500=(($2499+4)|0);
 HEAP32[(($2500)>>2)]=$2493;
 var $2501=$current_slab;
 var $2502=$2;
 var $2503=(($2502)|0);
 var $2504=HEAP32[(($2503)>>2)];
 var $2505=HEAP32[(($2504)>>2)];
 var $2506=(($2505+((($2501)*(12))&-1))|0);
 var $2507=(($2506+8)|0);
 HEAP32[(($2507)>>2)]=0;
 $i=0;
 label=324;break;
 case 324: 
 var $2509=$i;
 var $2510=$2;
 var $2511=(($2510+96)|0);
 var $2512=HEAP32[(($2511)>>2)];
 var $2513=HEAP32[(($2512)>>2)];
 var $2514=($2509>>>0)<($2513>>>0);
 if($2514){label=325;break;}else{label=331;break;}
 case 325: 
 var $2516=$i;
 var $2517=((($2516)+(1))|0);
 var $2518=$2;
 var $2519=(($2518)|0);
 var $2520=HEAP32[(($2519)>>2)];
 var $2521=HEAP32[(($2520)>>2)];
 var $2522=(($2521+((($2517)*(12))&-1))|0);
 var $2523=(($2522)|0);
 var $2524=HEAP32[(($2523)>>2)];
 var $2525=$i;
 var $2526=$2;
 var $2527=(($2526)|0);
 var $2528=HEAP32[(($2527)>>2)];
 var $2529=HEAP32[(($2528)>>2)];
 var $2530=(($2529+((($2525)*(12))&-1))|0);
 var $2531=(($2530)|0);
 var $2532=HEAP32[(($2531)>>2)];
 var $2533=((($2524)-($2532))|0);
 $npackets=$2533;
 var $2534=$npackets;
 var $2535=$smallest_slab;
 var $2536=($2534>>>0)<($2535>>>0);
 if($2536){label=326;break;}else{label=327;break;}
 case 326: 
 var $2538=$npackets;
 $smallest_slab=$2538;
 label=327;break;
 case 327: 
 var $2540=$npackets;
 var $2541=$biggest_slab;
 var $2542=($2540>>>0)>($2541>>>0);
 if($2542){label=328;break;}else{label=329;break;}
 case 328: 
 var $2544=$npackets;
 $biggest_slab=$2544;
 label=329;break;
 case 329: 
 var $2546=$npackets;
 var $2547=$totpackets;
 var $2548=((($2547)+($2546))|0);
 $totpackets=$2548;
 var $2549=$totslabs;
 var $2550=((($2549)+(1))|0);
 $totslabs=$2550;
 var $2551=$npackets;
 var $2552=$2;
 var $2553=(($2552+8)|0);
 var $2554=HEAP32[(($2553)>>2)];
 var $2555=HEAP32[(($2554)>>2)];
 var $2556=((($2551)-($2555))|0);
 var $2557=$i;
 var $2558=$2;
 var $2559=(($2558)|0);
 var $2560=HEAP32[(($2559)>>2)];
 var $2561=HEAP32[(($2560)>>2)];
 var $2562=(($2561+((($2557)*(12))&-1))|0);
 var $2563=(($2562)|0);
 var $2564=HEAP32[(($2563)>>2)];
 var $2565=$2;
 var $2566=(($2565+8)|0);
 var $2567=HEAP32[(($2566)>>2)];
 var $2568=HEAP32[(($2567)>>2)];
 var $2569=((($2564)+($2568))|0);
 var $2570=$2;
 var $2571=(($2570+4)|0);
 var $2572=HEAP32[(($2571)>>2)];
 var $2573=HEAP32[(($2572)>>2)];
 var $2574=(($2573+($2569<<7))|0);
 var $2575=(($2574+8)|0);
 HEAP32[(($2575)>>2)]=$2556;
 label=330;break;
 case 330: 
 var $2577=$i;
 var $2578=((($2577)+(1))|0);
 $i=$2578;
 label=324;break;
 case 331: 
 var $2580=$2;
 var $2581=(($2580+100)|0);
 var $2582=HEAP32[(($2581)>>2)];
 var $2583=HEAP32[(($2582)>>2)];
 var $2584=((($2583)+(4096))|0);
 HEAP32[(($2582)>>2)]=$2584;
 $i=0;
 label=332;break;
 case 332: 
 var $2586=$i;
 var $2587=$2;
 var $2588=(($2587+96)|0);
 var $2589=HEAP32[(($2588)>>2)];
 var $2590=HEAP32[(($2589)>>2)];
 var $2591=($2586>>>0)<($2590>>>0);
 if($2591){label=333;break;}else{label=340;break;}
 case 333: 
 var $2593=$i;
 var $2594=$2;
 var $2595=(($2594)|0);
 var $2596=HEAP32[(($2595)>>2)];
 var $2597=HEAP32[(($2596)>>2)];
 var $2598=(($2597+((($2593)*(12))&-1))|0);
 var $2599=(($2598)|0);
 var $2600=HEAP32[(($2599)>>2)];
 var $2601=$2;
 var $2602=(($2601+4)|0);
 var $2603=HEAP32[(($2602)>>2)];
 var $2604=HEAP32[(($2603)>>2)];
 var $2605=(($2604+($2600<<7))|0);
 $slab_ptr=$2605;
 var $2606=$i;
 var $2607=((($2606)+(1))|0);
 var $2608=$2;
 var $2609=(($2608)|0);
 var $2610=HEAP32[(($2609)>>2)];
 var $2611=HEAP32[(($2610)>>2)];
 var $2612=(($2611+((($2607)*(12))&-1))|0);
 var $2613=(($2612)|0);
 var $2614=HEAP32[(($2613)>>2)];
 var $2615=$i;
 var $2616=$2;
 var $2617=(($2616)|0);
 var $2618=HEAP32[(($2617)>>2)];
 var $2619=HEAP32[(($2618)>>2)];
 var $2620=(($2619+((($2615)*(12))&-1))|0);
 var $2621=(($2620)|0);
 var $2622=HEAP32[(($2621)>>2)];
 var $2623=((($2614)-($2622))|0);
 $seg_index=$2623;
 var $2624=$seg_index;
 var $2625=((($2624)-(1))|0);
 $seg_index=$2625;
 var $2626=$seg_index;
 var $2627=$slab_ptr;
 var $2628=(($2627+($2626<<7))|0);
 var $2629=(($2628)|0);
 var $2630=HEAP32[(($2629)>>2)];
 $curr_input_offset=$2630;
 $next_input_offset=0;
 label=334;break;
 case 334: 
 var $2632=$seg_index;
 var $2633=$2;
 var $2634=(($2633+8)|0);
 var $2635=HEAP32[(($2634)>>2)];
 var $2636=HEAP32[(($2635)>>2)];
 var $2637=($2632|0)>=($2636|0);
 if($2637){label=335;break;}else{label=338;break;}
 case 335: 
 var $2639=$seg_index;
 var $2640=$slab_ptr;
 var $2641=(($2640+($2639<<7))|0);
 var $2642=(($2641)|0);
 var $2643=HEAP32[(($2642)>>2)];
 var $2644=$curr_input_offset;
 var $2645=($2643>>>0)<($2644>>>0);
 if($2645){label=336;break;}else{label=337;break;}
 case 336: 
 var $2647=$curr_input_offset;
 $next_input_offset=$2647;
 var $2648=$seg_index;
 var $2649=$slab_ptr;
 var $2650=(($2649+($2648<<7))|0);
 var $2651=(($2650)|0);
 var $2652=HEAP32[(($2651)>>2)];
 $curr_input_offset=$2652;
 label=337;break;
 case 337: 
 var $2654=$next_input_offset;
 var $2655=$seg_index;
 var $2656=$slab_ptr;
 var $2657=(($2656+($2655<<7))|0);
 var $2658=(($2657+4)|0);
 HEAP32[(($2658)>>2)]=$2654;
 var $2659=$seg_index;
 var $2660=((($2659)-(1))|0);
 $seg_index=$2660;
 label=334;break;
 case 338: 
 label=339;break;
 case 339: 
 var $2663=$i;
 var $2664=((($2663)+(1))|0);
 $i=$2664;
 label=332;break;
 case 340: 
 $1=0;
 label=341;break;
 case 341: 
 var $2667=$1;
 STACKTOP=sp;return $2667;
  default: assert(0, "bad label: " + label);
 }
}
function _usage(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $2=_printf(4272,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $3=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $4=_printf(3792,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $5=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $6=_printf(3072,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $7=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $8=_printf(2712,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $9=_printf(2296,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $10=_printf(1760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $11=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $12=_printf(1280,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $13=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $14=_printf(968,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $15=_printf(624,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $16=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $17=_printf(4552,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $18=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $19=_printf(4440,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $20=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $21=_printf(4368,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $22=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 STACKTOP=sp;return;
}
function _main($argc,$argv){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+720)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $rc=sp;
 var $return_size=(sp)+(8);
 var $column_span=(sp)+(16);
 var $kernel_source_file=(sp)+(24);
 var $kernel_name_LS=(sp)+(32);
 var $kernel_name_AWGC=(sp)+(56);
 var $kernel_name=(sp)+(80);
 var $nx=(sp)+(112);
 var $ny=(sp)+(120);
 var $non_zero=(sp)+(128);
 var $nx_pad=(sp)+(136);
 var $nyround=(sp)+(144);
 var $slab_startrow=(sp)+(152);
 var $segcachesize=(sp)+(160);
 var $max_slabheight=(sp)+(168);
 var $i;
 var $j;
 var $pdex;
 var $ddex;
 var $param_value_size_ret=(sp)+(176);
 var $opt;
 var $option_index=(sp)+(184);
 var $long_options=(sp)+(192);
 var $name;
 var $preferred_alignment=(sp)+(352);
 var $num_platforms=(sp)+(360);
 var $platform=(sp)+(368);
 var $buffer=(sp)+(376);
 var $temp_platform_id_array=(sp)+(384);
 var $tmpdevices=(sp)+(392);
 var $accel_found;
 var $gpu_found;
 var $cpu_found;
 var $device_found;
 var $properties=(sp)+(400);
 var $kernel_source=(sp)+(416);
 var $command_queue_properties=(sp)+(424);
 var $kernel_wg_size=(sp)+(432);
 var $total_local_mem=(sp)+(440);
 var $used_local_mem=(sp)+(448);
 var $local_mem_size=(sp)+(456);
 var $max_compute_units=(sp)+(464);
 var $mgs=(sp)+(472);
 var $nslabs_round=(sp)+(576);
 var $memsize=(sp)+(584);
 var $seg_workspace=(sp)+(592);
 var $matrix_header=(sp)+(600);
 var $num_header_packets=(sp)+(608);
 var $row_index_array=(sp)+(616);
 var $x_index_array=(sp)+(624);
 var $data_array=(sp)+(632);
 var $ndims;
 var $team_size=(sp)+(640);
 var $global_work_size=(sp)+(648);
 var $local_work_size=(sp)+(664);
 var $max_aggregate_local_work_group_size;
 var $aggregate_local_work_group_size;
 var $input_array;
 var $output_array;
 var $output_array_verify=(sp)+(680);
 var $tilebuffer;
 var $input_buffer=(sp)+(688);
 var $matrix_buffer=(sp)+(696);
 var $output_buffer=(sp)+(704);
 var $input_buffer_size;
 var $matrix_buffer_size;
 var $events=(sp)+(712);
 var $output_buffer_size;
 var $rval;
 var $t;
 var $lb;
 var $ub;
 var $sum;
 var $diffsum;
 var $a;
 var $b;
 var $abs_a;
 var $delta;
 var $retval;
 $1=0;
 $2=$argc;
 $3=$argv;
 HEAP32[(($column_span)>>2)]=0;
 var $4=$kernel_source_file;
 assert(8 % 1 === 0);(_memcpy($4, 336, 8)|0);
 var $5=$kernel_name_LS;
 assert(21 % 1 === 0);(_memcpy($5, 344, 21)|0);
 var $6=$kernel_name_AWGC;
 assert(23 % 1 === 0);(_memcpy($6, 368, 23)|0);
 HEAP32[(($slab_startrow)>>2)]=0;
 $pdex=0;
 $ddex=0;
 var $7=$long_options;
 assert(160 % 1 === 0);(_memcpy($7, 176, 160)|0);
 var $8=$3;
 var $9=(($8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=_basename($10);
 $name=$11;
 var $12=$3;
 var $13=(($12)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=_dirname($14);
 var $16=_chdir($15);
 label=2;break;
 case 2: 
 var $18=$2;
 var $19=$3;
 var $20=(($long_options)|0);
 var $21=_getopt_long($18,$19,3872,$20,$option_index);
 $opt=$21;
 var $22=$opt;
 var $23=($22|0)==-1;
 if($23){label=3;break;}else{label=4;break;}
 case 3: 
 label=15;break;
 case 4: 
 var $26=$opt;
 switch(($26|0)){case 65:{ label=10;break;}case 108:{ label=11;break;}case 102:{ label=12;break;}case 63:{ label=13;break;}case 104:{ label=5;break;}case 97:{ label=6;break;}case 99:{ label=7;break;}case 103:{ label=8;break;}case 76:{ label=9;break;}default:{label=14;break;}}break;
 case 5: 
 _usage();
 _exit(0);
 throw "Reached an unreachable!";
 case 6: 
 var $$etemp$0$0=8;
 var $$etemp$0$1=0;
 var $st$1$0=408;
 HEAP32[(($st$1$0)>>2)]=$$etemp$0$0;
 var $st$2$1=412;
 HEAP32[(($st$2$1)>>2)]=$$etemp$0$1;
 label=14;break;
 case 7: 
 var $$etemp$3$0=2;
 var $$etemp$3$1=0;
 var $st$4$0=408;
 HEAP32[(($st$4$0)>>2)]=$$etemp$3$0;
 var $st$5$1=412;
 HEAP32[(($st$5$1)>>2)]=$$etemp$3$1;
 label=14;break;
 case 8: 
 var $$etemp$6$0=4;
 var $$etemp$6$1=0;
 var $st$7$0=408;
 HEAP32[(($st$7$0)>>2)]=$$etemp$6$0;
 var $st$8$1=412;
 HEAP32[(($st$8$1)>>2)]=$$etemp$6$1;
 label=14;break;
 case 9: 
 HEAP32[((4752)>>2)]=1;
 label=14;break;
 case 10: 
 HEAP32[((4752)>>2)]=2;
 label=14;break;
 case 11: 
 var $34=HEAP32[((4720)>>2)];
 var $35=_atoi($34);
 HEAP32[((392)>>2)]=$35;
 label=14;break;
 case 12: 
 var $37=HEAP32[((4720)>>2)];
 var $38=_strlen($37);
 var $39=((($38)+(1))|0);
 var $40=_posix_memalign(400,128,$39);
 var $41=HEAP32[((400)>>2)];
 var $42=HEAP32[((4720)>>2)];
 var $43=_strcpy($41,$42);
 label=14;break;
 case 13: 
 var $45=$name;
 var $46=_printf(3736,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$45,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 14: 
 label=2;break;
 case 15: 
 var $49=HEAP32[((104)>>2)];
 var $50=$2;
 var $51=($49|0)!=($50|0);
 if($51){label=16;break;}else{label=17;break;}
 case 16: 
 var $53=$name;
 var $54=HEAP32[((104)>>2)];
 var $55=$3;
 var $56=(($55+($54<<2))|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=_printf(3632,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$53,HEAP32[(((tempVarArgs)+(8))>>2)]=$57,tempVarArgs)); STACKTOP=tempVarArgs;
 var $59=$name;
 var $60=_printf(3736,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$59,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 17: 
 HEAP32[(($preferred_alignment)>>2)]=16;
 var $62=_clGetPlatformIDs(0,0,$num_platforms);
 HEAP32[(($rc)>>2)]=$62;
 var $63=HEAP32[(($rc)>>2)];
 var $64=($63|0)!=0;
 if($64){label=18;break;}else{label=19;break;}
 case 18: 
 var $66=HEAP32[(($rc)>>2)];
 var $67=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=3432,HEAP32[(((tempVarArgs)+(8))>>2)]=$66,tempVarArgs)); STACKTOP=tempVarArgs;
 label=19;break;
 case 19: 
 var $69=$platform;
 var $70=HEAP32[(($preferred_alignment)>>2)];
 var $71=HEAP32[(($num_platforms)>>2)];
 var $72=((($71)*(28))&-1);
 var $73=_posix_memalign($69,$70,$72);
 var $74=HEAP32[(($platform)>>2)];
 var $75=($74|0)==0;
 if($75){label=20;break;}else{label=21;break;}
 case 20: 
 var $77=HEAP32[(($num_platforms)>>2)];
 var $78=((($77)*(28))&-1);
 var $79$0=$78;
 var $79$1=0;
 var $$etemp$10=3272;
 var $$etemp$9=3312;
 var $80=_printf($$etemp$9,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$79$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$79$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$10,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 21: 
 var $82=$buffer;
 var $83=HEAP32[(($preferred_alignment)>>2)];
 var $84=HEAP32[(($num_platforms)>>2)];
 var $85=($84<<2);
 var $86=_posix_memalign($82,$83,$85);
 var $87=HEAP32[(($buffer)>>2)];
 var $88=($87|0)==0;
 if($88){label=22;break;}else{label=23;break;}
 case 22: 
 var $90=HEAP32[(($num_platforms)>>2)];
 var $91=($90<<2);
 var $92$0=$91;
 var $92$1=0;
 var $$etemp$12=3200;
 var $$etemp$11=3312;
 var $93=_printf($$etemp$11,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$92$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$92$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$12,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 23: 
 var $95=$temp_platform_id_array;
 var $96=HEAP32[(($preferred_alignment)>>2)];
 var $97=HEAP32[(($num_platforms)>>2)];
 var $98=($97<<2);
 var $99=_posix_memalign($95,$96,$98);
 var $100=HEAP32[(($temp_platform_id_array)>>2)];
 var $101=($100|0)==0;
 if($101){label=24;break;}else{label=25;break;}
 case 24: 
 var $103=HEAP32[(($num_platforms)>>2)];
 var $104=($103<<2);
 var $105$0=$104;
 var $105$1=0;
 var $$etemp$14=3160;
 var $$etemp$13=3312;
 var $106=_printf($$etemp$13,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$105$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$105$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$14,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 25: 
 var $108=HEAP32[(($num_platforms)>>2)];
 var $109=HEAP32[(($temp_platform_id_array)>>2)];
 var $110=_clGetPlatformIDs($108,$109,0);
 HEAP32[(($rc)>>2)]=$110;
 var $111=HEAP32[(($rc)>>2)];
 var $112=($111|0)!=0;
 if($112){label=26;break;}else{label=27;break;}
 case 26: 
 var $114=HEAP32[(($rc)>>2)];
 var $115=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=3112,HEAP32[(((tempVarArgs)+(8))>>2)]=$114,tempVarArgs)); STACKTOP=tempVarArgs;
 label=27;break;
 case 27: 
 $i=0;
 label=28;break;
 case 28: 
 var $118=$i;
 var $119=HEAP32[(($num_platforms)>>2)];
 var $120=($118>>>0)<($119>>>0);
 if($120){label=29;break;}else{label=31;break;}
 case 29: 
 var $122=$i;
 var $123=HEAP32[(($temp_platform_id_array)>>2)];
 var $124=(($123+($122<<2))|0);
 var $125=HEAP32[(($124)>>2)];
 var $126=$i;
 var $127=HEAP32[(($platform)>>2)];
 var $128=(($127+((($126)*(28))&-1))|0);
 var $129=(($128+4)|0);
 HEAP32[(($129)>>2)]=$125;
 label=30;break;
 case 30: 
 var $131=$i;
 var $132=((($131)+(1))|0);
 $i=$132;
 label=28;break;
 case 31: 
 var $134=HEAP32[(($temp_platform_id_array)>>2)];
 var $135=$134;
 _free($135);
 var $136=_printf(3088,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $137=_printf(3048,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $i=0;
 label=32;break;
 case 32: 
 var $139=$i;
 var $140=$2;
 var $141=($139>>>0)<($140>>>0);
 if($141){label=33;break;}else{label=35;break;}
 case 33: 
 var $143=$i;
 var $144=$3;
 var $145=(($144+($143<<2))|0);
 var $146=HEAP32[(($145)>>2)];
 var $147=_printf(3040,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$146,tempVarArgs)); STACKTOP=tempVarArgs;
 label=34;break;
 case 34: 
 var $149=$i;
 var $150=((($149)+(1))|0);
 $i=$150;
 label=32;break;
 case 35: 
 var $152=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $i=0;
 label=36;break;
 case 36: 
 var $154=$i;
 var $155=HEAP32[(($num_platforms)>>2)];
 var $156=($154>>>0)<($155>>>0);
 if($156){label=37;break;}else{label=59;break;}
 case 37: 
 var $158=$i;
 var $159=HEAP32[(($platform)>>2)];
 var $160=(($159+((($158)*(28))&-1))|0);
 var $161=(($160+4)|0);
 var $162=HEAP32[(($161)>>2)];
 var $163=_clGetPlatformInfo($162,2306,0,0,$param_value_size_ret);
 HEAP32[(($rc)>>2)]=$163;
 var $164=HEAP32[(($rc)>>2)];
 var $165=($164|0)!=0;
 if($165){label=38;break;}else{label=39;break;}
 case 38: 
 var $167=HEAP32[(($rc)>>2)];
 var $168=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2992,HEAP32[(((tempVarArgs)+(8))>>2)]=$167,tempVarArgs)); STACKTOP=tempVarArgs;
 label=39;break;
 case 39: 
 var $170=$i;
 var $171=HEAP32[(($platform)>>2)];
 var $172=(($171+((($170)*(28))&-1))|0);
 var $173=(($172)|0);
 var $174=HEAP32[(($preferred_alignment)>>2)];
 var $175=HEAP32[(($param_value_size_ret)>>2)];
 var $176=_posix_memalign($173,$174,$175);
 var $177=$i;
 var $178=HEAP32[(($platform)>>2)];
 var $179=(($178+((($177)*(28))&-1))|0);
 var $180=(($179)|0);
 var $181=HEAP32[(($180)>>2)];
 var $182=($181|0)==0;
 if($182){label=40;break;}else{label=41;break;}
 case 40: 
 var $184=HEAP32[(($param_value_size_ret)>>2)];
 var $185$0=$184;
 var $185$1=0;
 var $$etemp$16=2976;
 var $$etemp$15=3312;
 var $186=_printf($$etemp$15,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$185$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$185$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$16,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 41: 
 var $188=$i;
 var $189=HEAP32[(($platform)>>2)];
 var $190=(($189+((($188)*(28))&-1))|0);
 var $191=(($190+4)|0);
 var $192=HEAP32[(($191)>>2)];
 var $193=HEAP32[(($param_value_size_ret)>>2)];
 var $194=$i;
 var $195=HEAP32[(($platform)>>2)];
 var $196=(($195+((($194)*(28))&-1))|0);
 var $197=(($196)|0);
 var $198=HEAP32[(($197)>>2)];
 var $199=_clGetPlatformInfo($192,2306,$193,$198,0);
 HEAP32[(($rc)>>2)]=$199;
 var $200=HEAP32[(($rc)>>2)];
 var $201=($200|0)!=0;
 if($201){label=42;break;}else{label=43;break;}
 case 42: 
 var $203=HEAP32[(($rc)>>2)];
 var $204=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2936,HEAP32[(((tempVarArgs)+(8))>>2)]=$203,tempVarArgs)); STACKTOP=tempVarArgs;
 label=43;break;
 case 43: 
 var $206=$i;
 var $207=HEAP32[(($platform)>>2)];
 var $208=(($207+((($206)*(28))&-1))|0);
 var $209=(($208+4)|0);
 var $210=HEAP32[(($209)>>2)];
 var $211=$i;
 var $212=HEAP32[(($platform)>>2)];
 var $213=(($212+((($211)*(28))&-1))|0);
 var $214=(($213+8)|0);
 var $$etemp$17$0=-1;
 var $$etemp$17$1=0;
 var $215=_clGetDeviceIDs($210,$$etemp$17$0,$$etemp$17$1,0,0,$214);
 HEAP32[(($rc)>>2)]=$215;
 var $216=HEAP32[(($rc)>>2)];
 var $217=($216|0)!=0;
 if($217){label=44;break;}else{label=45;break;}
 case 44: 
 var $219=HEAP32[(($rc)>>2)];
 var $220=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2896,HEAP32[(((tempVarArgs)+(8))>>2)]=$219,tempVarArgs)); STACKTOP=tempVarArgs;
 label=45;break;
 case 45: 
 var $222=$i;
 var $223=HEAP32[(($platform)>>2)];
 var $224=(($223+((($222)*(28))&-1))|0);
 var $225=(($224+12)|0);
 var $226=$225;
 var $227=HEAP32[(($preferred_alignment)>>2)];
 var $228=$i;
 var $229=HEAP32[(($platform)>>2)];
 var $230=(($229+((($228)*(28))&-1))|0);
 var $231=(($230+8)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=((($232)*(24))&-1);
 var $234=_posix_memalign($226,$227,$233);
 var $235=$i;
 var $236=HEAP32[(($platform)>>2)];
 var $237=(($236+((($235)*(28))&-1))|0);
 var $238=(($237+12)|0);
 var $239=HEAP32[(($238)>>2)];
 var $240=($239|0)==0;
 if($240){label=46;break;}else{label=47;break;}
 case 46: 
 var $242=$i;
 var $243=HEAP32[(($platform)>>2)];
 var $244=(($243+((($242)*(28))&-1))|0);
 var $245=(($244+8)|0);
 var $246=HEAP32[(($245)>>2)];
 var $247=((($246)*(24))&-1);
 var $248$0=$247;
 var $248$1=0;
 var $$etemp$19=2864;
 var $$etemp$18=3312;
 var $249=_printf($$etemp$18,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$248$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$248$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$19,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 47: 
 var $251=$tmpdevices;
 var $252=HEAP32[(($preferred_alignment)>>2)];
 var $253=$i;
 var $254=HEAP32[(($platform)>>2)];
 var $255=(($254+((($253)*(28))&-1))|0);
 var $256=(($255+8)|0);
 var $257=HEAP32[(($256)>>2)];
 var $258=($257<<2);
 var $259=_posix_memalign($251,$252,$258);
 var $260=HEAP32[(($tmpdevices)>>2)];
 var $261=($260|0)==0;
 if($261){label=48;break;}else{label=49;break;}
 case 48: 
 var $263=$i;
 var $264=HEAP32[(($platform)>>2)];
 var $265=(($264+((($263)*(28))&-1))|0);
 var $266=(($265+8)|0);
 var $267=HEAP32[(($266)>>2)];
 var $268=($267<<2);
 var $269$0=$268;
 var $269$1=0;
 var $$etemp$21=2848;
 var $$etemp$20=3312;
 var $270=_printf($$etemp$20,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$269$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$269$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$21,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 49: 
 var $272=$i;
 var $273=HEAP32[(($platform)>>2)];
 var $274=(($273+((($272)*(28))&-1))|0);
 var $275=(($274+4)|0);
 var $276=HEAP32[(($275)>>2)];
 var $277=$i;
 var $278=HEAP32[(($platform)>>2)];
 var $279=(($278+((($277)*(28))&-1))|0);
 var $280=(($279+8)|0);
 var $281=HEAP32[(($280)>>2)];
 var $282=HEAP32[(($tmpdevices)>>2)];
 var $$etemp$22$0=-1;
 var $$etemp$22$1=0;
 var $283=_clGetDeviceIDs($276,$$etemp$22$0,$$etemp$22$1,$281,$282,0);
 HEAP32[(($rc)>>2)]=$283;
 var $284=HEAP32[(($rc)>>2)];
 var $285=($284|0)!=0;
 if($285){label=50;break;}else{label=51;break;}
 case 50: 
 var $287=HEAP32[(($rc)>>2)];
 var $288=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2808,HEAP32[(((tempVarArgs)+(8))>>2)]=$287,tempVarArgs)); STACKTOP=tempVarArgs;
 label=51;break;
 case 51: 
 $j=0;
 label=52;break;
 case 52: 
 var $291=$j;
 var $292=$i;
 var $293=HEAP32[(($platform)>>2)];
 var $294=(($293+((($292)*(28))&-1))|0);
 var $295=(($294+8)|0);
 var $296=HEAP32[(($295)>>2)];
 var $297=($291>>>0)<($296>>>0);
 if($297){label=53;break;}else{label=57;break;}
 case 53: 
 var $299=$j;
 var $300=HEAP32[(($tmpdevices)>>2)];
 var $301=(($300+($299<<2))|0);
 var $302=HEAP32[(($301)>>2)];
 var $303=$j;
 var $304=$i;
 var $305=HEAP32[(($platform)>>2)];
 var $306=(($305+((($304)*(28))&-1))|0);
 var $307=(($306+12)|0);
 var $308=HEAP32[(($307)>>2)];
 var $309=(($308+((($303)*(24))&-1))|0);
 var $310=(($309)|0);
 HEAP32[(($310)>>2)]=$302;
 var $311=$j;
 var $312=$i;
 var $313=HEAP32[(($platform)>>2)];
 var $314=(($313+((($312)*(28))&-1))|0);
 var $315=(($314+12)|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=(($316+((($311)*(24))&-1))|0);
 var $318=(($317)|0);
 var $319=HEAP32[(($318)>>2)];
 var $320=$j;
 var $321=$i;
 var $322=HEAP32[(($platform)>>2)];
 var $323=(($322+((($321)*(28))&-1))|0);
 var $324=(($323+12)|0);
 var $325=HEAP32[(($324)>>2)];
 var $326=(($325+((($320)*(24))&-1))|0);
 var $327=(($326+8)|0);
 var $328=$327;
 var $329=_clGetDeviceInfo($319,4096,8,$328,0);
 HEAP32[(($rc)>>2)]=$329;
 var $330=HEAP32[(($rc)>>2)];
 var $331=($330|0)!=0;
 if($331){label=54;break;}else{label=55;break;}
 case 54: 
 var $333=HEAP32[(($rc)>>2)];
 var $334=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2776,HEAP32[(((tempVarArgs)+(8))>>2)]=$333,tempVarArgs)); STACKTOP=tempVarArgs;
 label=55;break;
 case 55: 
 label=56;break;
 case 56: 
 var $337=$j;
 var $338=((($337)+(1))|0);
 $j=$338;
 label=52;break;
 case 57: 
 var $340=HEAP32[(($tmpdevices)>>2)];
 var $341=$340;
 _free($341);
 label=58;break;
 case 58: 
 var $343=$i;
 var $344=((($343)+(1))|0);
 $i=$344;
 label=36;break;
 case 59: 
 var $ld$23$0=408;
 var $346$0=HEAP32[(($ld$23$0)>>2)];
 var $ld$24$1=412;
 var $346$1=HEAP32[(($ld$24$1)>>2)];
 var $$etemp$25$0=1;
 var $$etemp$25$1=0;
 var $347=(($346$0|0) == ($$etemp$25$0|0)) & (($346$1|0) == ($$etemp$25$1|0));
 if($347){label=60;break;}else{label=98;break;}
 case 60: 
 $accel_found=0;
 $i=0;
 label=61;break;
 case 61: 
 var $350=$i;
 var $351=HEAP32[(($num_platforms)>>2)];
 var $352=($350>>>0)<($351>>>0);
 if($352){label=62;break;}else{label=70;break;}
 case 62: 
 $j=0;
 label=63;break;
 case 63: 
 var $355=$j;
 var $356=$i;
 var $357=HEAP32[(($platform)>>2)];
 var $358=(($357+((($356)*(28))&-1))|0);
 var $359=(($358+8)|0);
 var $360=HEAP32[(($359)>>2)];
 var $361=($355>>>0)<($360>>>0);
 if($361){label=64;break;}else{label=68;break;}
 case 64: 
 var $363=$j;
 var $364=$i;
 var $365=HEAP32[(($platform)>>2)];
 var $366=(($365+((($364)*(28))&-1))|0);
 var $367=(($366+12)|0);
 var $368=HEAP32[(($367)>>2)];
 var $369=(($368+((($363)*(24))&-1))|0);
 var $370=(($369+8)|0);
 var $ld$26$0=(($370)|0);
 var $371$0=HEAP32[(($ld$26$0)>>2)];
 var $ld$27$1=(($370+4)|0);
 var $371$1=HEAP32[(($ld$27$1)>>2)];
 var $$etemp$28$0=8;
 var $$etemp$28$1=0;
 var $372=(($371$0|0) == ($$etemp$28$0|0)) & (($371$1|0) == ($$etemp$28$1|0));
 if($372){label=65;break;}else{label=66;break;}
 case 65: 
 $accel_found=1;
 var $374=$i;
 $pdex=$374;
 var $375=$j;
 $ddex=$375;
 label=66;break;
 case 66: 
 label=67;break;
 case 67: 
 var $378=$j;
 var $379=((($378)+(1))|0);
 $j=$379;
 label=63;break;
 case 68: 
 label=69;break;
 case 69: 
 var $382=$i;
 var $383=((($382)+(1))|0);
 $i=$383;
 label=61;break;
 case 70: 
 var $385=$accel_found;
 var $386=($385|0)!=0;
 if($386){label=97;break;}else{label=71;break;}
 case 71: 
 $gpu_found=0;
 $i=0;
 label=72;break;
 case 72: 
 var $389=$i;
 var $390=HEAP32[(($num_platforms)>>2)];
 var $391=($389>>>0)<($390>>>0);
 if($391){label=73;break;}else{label=82;break;}
 case 73: 
 $j=0;
 label=74;break;
 case 74: 
 var $394=$j;
 var $395=$i;
 var $396=HEAP32[(($platform)>>2)];
 var $397=(($396+((($395)*(28))&-1))|0);
 var $398=(($397+8)|0);
 var $399=HEAP32[(($398)>>2)];
 var $400=($394>>>0)<($399>>>0);
 if($400){label=75;break;}else{label=80;break;}
 case 75: 
 var $402=$gpu_found;
 var $403=($402|0)==0;
 if($403){label=76;break;}else{label=78;break;}
 case 76: 
 var $405=$j;
 var $406=$i;
 var $407=HEAP32[(($platform)>>2)];
 var $408=(($407+((($406)*(28))&-1))|0);
 var $409=(($408+12)|0);
 var $410=HEAP32[(($409)>>2)];
 var $411=(($410+((($405)*(24))&-1))|0);
 var $412=(($411+8)|0);
 var $ld$29$0=(($412)|0);
 var $413$0=HEAP32[(($ld$29$0)>>2)];
 var $ld$30$1=(($412+4)|0);
 var $413$1=HEAP32[(($ld$30$1)>>2)];
 var $$etemp$31$0=4;
 var $$etemp$31$1=0;
 var $414=(($413$0|0) == ($$etemp$31$0|0)) & (($413$1|0) == ($$etemp$31$1|0));
 if($414){label=77;break;}else{label=78;break;}
 case 77: 
 $gpu_found=1;
 var $416=$i;
 $pdex=$416;
 var $417=$j;
 $ddex=$417;
 label=78;break;
 case 78: 
 label=79;break;
 case 79: 
 var $420=$j;
 var $421=((($420)+(1))|0);
 $j=$421;
 label=74;break;
 case 80: 
 label=81;break;
 case 81: 
 var $424=$i;
 var $425=((($424)+(1))|0);
 $i=$425;
 label=72;break;
 case 82: 
 var $427=$gpu_found;
 var $428=($427|0)!=0;
 if($428){label=96;break;}else{label=83;break;}
 case 83: 
 $cpu_found=0;
 $i=0;
 label=84;break;
 case 84: 
 var $431=$i;
 var $432=HEAP32[(($num_platforms)>>2)];
 var $433=($431>>>0)<($432>>>0);
 if($433){label=85;break;}else{label=93;break;}
 case 85: 
 $j=0;
 label=86;break;
 case 86: 
 var $436=$j;
 var $437=$i;
 var $438=HEAP32[(($platform)>>2)];
 var $439=(($438+((($437)*(28))&-1))|0);
 var $440=(($439+8)|0);
 var $441=HEAP32[(($440)>>2)];
 var $442=($436>>>0)<($441>>>0);
 if($442){label=87;break;}else{label=91;break;}
 case 87: 
 var $444=$j;
 var $445=$i;
 var $446=HEAP32[(($platform)>>2)];
 var $447=(($446+((($445)*(28))&-1))|0);
 var $448=(($447+12)|0);
 var $449=HEAP32[(($448)>>2)];
 var $450=(($449+((($444)*(24))&-1))|0);
 var $451=(($450+8)|0);
 var $ld$32$0=(($451)|0);
 var $452$0=HEAP32[(($ld$32$0)>>2)];
 var $ld$33$1=(($451+4)|0);
 var $452$1=HEAP32[(($ld$33$1)>>2)];
 var $$etemp$34$0=2;
 var $$etemp$34$1=0;
 var $453=(($452$0|0) == ($$etemp$34$0|0)) & (($452$1|0) == ($$etemp$34$1|0));
 if($453){label=88;break;}else{label=89;break;}
 case 88: 
 $cpu_found=1;
 var $455=$i;
 $pdex=$455;
 var $456=$j;
 $ddex=$456;
 label=89;break;
 case 89: 
 label=90;break;
 case 90: 
 var $459=$j;
 var $460=((($459)+(1))|0);
 $j=$460;
 label=86;break;
 case 91: 
 label=92;break;
 case 92: 
 var $463=$i;
 var $464=((($463)+(1))|0);
 $i=$464;
 label=84;break;
 case 93: 
 var $466=$cpu_found;
 var $467=($466|0)!=0;
 if($467){label=95;break;}else{label=94;break;}
 case 94: 
 var $469=HEAP32[((_stderr)>>2)];
 var $470=_fprintf($469,2648,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $471=HEAP32[((_stderr)>>2)];
 var $472=_fflush($471);
 _exit(1);
 throw "Reached an unreachable!";
 case 95: 
 label=96;break;
 case 96: 
 label=97;break;
 case 97: 
 label=111;break;
 case 98: 
 $device_found=0;
 $i=0;
 label=99;break;
 case 99: 
 var $478=$i;
 var $479=HEAP32[(($num_platforms)>>2)];
 var $480=($478>>>0)<($479>>>0);
 if($480){label=100;break;}else{label=108;break;}
 case 100: 
 $j=0;
 label=101;break;
 case 101: 
 var $483=$j;
 var $484=$i;
 var $485=HEAP32[(($platform)>>2)];
 var $486=(($485+((($484)*(28))&-1))|0);
 var $487=(($486+8)|0);
 var $488=HEAP32[(($487)>>2)];
 var $489=($483>>>0)<($488>>>0);
 if($489){label=102;break;}else{label=106;break;}
 case 102: 
 var $491=$j;
 var $492=$i;
 var $493=HEAP32[(($platform)>>2)];
 var $494=(($493+((($492)*(28))&-1))|0);
 var $495=(($494+12)|0);
 var $496=HEAP32[(($495)>>2)];
 var $497=(($496+((($491)*(24))&-1))|0);
 var $498=(($497+8)|0);
 var $ld$35$0=(($498)|0);
 var $499$0=HEAP32[(($ld$35$0)>>2)];
 var $ld$36$1=(($498+4)|0);
 var $499$1=HEAP32[(($ld$36$1)>>2)];
 var $ld$37$0=408;
 var $500$0=HEAP32[(($ld$37$0)>>2)];
 var $ld$38$1=412;
 var $500$1=HEAP32[(($ld$38$1)>>2)];
 var $501=(($499$0|0) == ($500$0|0)) & (($499$1|0) == ($500$1|0));
 if($501){label=103;break;}else{label=104;break;}
 case 103: 
 $device_found=1;
 var $503=$i;
 $pdex=$503;
 var $504=$j;
 $ddex=$504;
 label=104;break;
 case 104: 
 label=105;break;
 case 105: 
 var $507=$j;
 var $508=((($507)+(1))|0);
 $j=$508;
 label=101;break;
 case 106: 
 label=107;break;
 case 107: 
 var $511=$i;
 var $512=((($511)+(1))|0);
 $i=$512;
 label=99;break;
 case 108: 
 var $514=$device_found;
 var $515=($514|0)==0;
 if($515){label=109;break;}else{label=110;break;}
 case 109: 
 var $517=HEAP32[((_stderr)>>2)];
 var $518=_fprintf($517,2568,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $519=HEAP32[((_stderr)>>2)];
 var $520=_fflush($519);
 _exit(1);
 throw "Reached an unreachable!";
 case 110: 
 label=111;break;
 case 111: 
 var $523=HEAP32[((4752)>>2)];
 var $524=($523|0)==0;
 if($524){label=112;break;}else{label=113;break;}
 case 112: 
 var $526=$ddex;
 var $527=$pdex;
 var $528=HEAP32[(($platform)>>2)];
 var $529=(($528+((($527)*(28))&-1))|0);
 var $530=(($529+12)|0);
 var $531=HEAP32[(($530)>>2)];
 var $532=(($531+((($526)*(24))&-1))|0);
 var $533=(($532+8)|0);
 var $ld$39$0=(($533)|0);
 var $534$0=HEAP32[(($ld$39$0)>>2)];
 var $ld$40$1=(($533+4)|0);
 var $534$1=HEAP32[(($ld$40$1)>>2)];
 var $$etemp$41$0=8;
 var $$etemp$41$1=0;
 var $535=(($534$0|0) == ($$etemp$41$0|0)) & (($534$1|0) == ($$etemp$41$1|0));
 var $536=($535?2:1);
 HEAP32[((4752)>>2)]=$536;
 label=113;break;
 case 113: 
 var $538=(($properties)|0);
 HEAP32[(($538)>>2)]=4228;
 var $539=$pdex;
 var $540=HEAP32[(($platform)>>2)];
 var $541=(($540+((($539)*(28))&-1))|0);
 var $542=(($541+4)|0);
 var $543=HEAP32[(($542)>>2)];
 var $544=$543;
 var $545=(($properties+4)|0);
 HEAP32[(($545)>>2)]=$544;
 var $546=(($properties+8)|0);
 HEAP32[(($546)>>2)]=0;
 var $547=(($properties)|0);
 var $548=$ddex;
 var $549=$pdex;
 var $550=HEAP32[(($platform)>>2)];
 var $551=(($550+((($549)*(28))&-1))|0);
 var $552=(($551+12)|0);
 var $553=HEAP32[(($552)>>2)];
 var $554=(($553+((($548)*(24))&-1))|0);
 var $555=(($554)|0);
 var $556=_clCreateContext($547,1,$555,0,0,$rc);
 var $557=$pdex;
 var $558=HEAP32[(($platform)>>2)];
 var $559=(($558+((($557)*(28))&-1))|0);
 var $560=(($559+16)|0);
 HEAP32[(($560)>>2)]=$556;
 var $561=HEAP32[(($rc)>>2)];
 var $562=($561|0)!=0;
 if($562){label=114;break;}else{label=115;break;}
 case 114: 
 var $564=HEAP32[(($rc)>>2)];
 var $565=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2552,HEAP32[(((tempVarArgs)+(8))>>2)]=$564,tempVarArgs)); STACKTOP=tempVarArgs;
 label=115;break;
 case 115: 
 var $567=HEAP32[((4752)>>2)];
 if(($567|0)==1){ label=116;break;}else if(($567|0)==2){ label=117;break;}else{label=118;break;}
 case 116: 
 var $569=(($kernel_name)|0);
 var $570=(($kernel_name_LS)|0);
 var $571=_strcpy($569,$570);
 label=118;break;
 case 117: 
 var $573=(($kernel_name)|0);
 var $574=(($kernel_name_AWGC)|0);
 var $575=_strcpy($573,$574);
 label=118;break;
 case 118: 
 var $577=(($kernel_source_file)|0);
 var $578=_load_program_source($577);
 HEAP32[(($kernel_source)>>2)]=$578;
 var $579=HEAP32[(($kernel_source)>>2)];
 var $580=($579|0)==0;
 if($580){label=119;break;}else{label=120;break;}
 case 119: 
 var $582=HEAP32[((_stderr)>>2)];
 var $583=_fprintf($582,2496,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 120: 
 var $585=$pdex;
 var $586=HEAP32[(($platform)>>2)];
 var $587=(($586+((($585)*(28))&-1))|0);
 var $588=(($587+16)|0);
 var $589=HEAP32[(($588)>>2)];
 var $590=_clCreateProgramWithSource($589,1,$kernel_source,0,$rc);
 var $591=$pdex;
 var $592=HEAP32[(($platform)>>2)];
 var $593=(($592+((($591)*(28))&-1))|0);
 var $594=(($593+20)|0);
 HEAP32[(($594)>>2)]=$590;
 var $595=HEAP32[(($rc)>>2)];
 var $596=($595|0)!=0;
 if($596){label=121;break;}else{label=122;break;}
 case 121: 
 var $598=HEAP32[(($rc)>>2)];
 var $599=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2464,HEAP32[(((tempVarArgs)+(8))>>2)]=$598,tempVarArgs)); STACKTOP=tempVarArgs;
 label=122;break;
 case 122: 
 var $601=HEAP32[(($kernel_source)>>2)];
 _free($601);
 var $602=$pdex;
 var $603=HEAP32[(($platform)>>2)];
 var $604=(($603+((($602)*(28))&-1))|0);
 var $605=(($604+20)|0);
 var $606=HEAP32[(($605)>>2)];
 var $607=$ddex;
 var $608=$pdex;
 var $609=HEAP32[(($platform)>>2)];
 var $610=(($609+((($608)*(28))&-1))|0);
 var $611=(($610+12)|0);
 var $612=HEAP32[(($611)>>2)];
 var $613=(($612+((($607)*(24))&-1))|0);
 var $614=(($613)|0);
 var $615=_clBuildProgram($606,1,$614,4760,0,0);
 HEAP32[(($rc)>>2)]=$615;
 var $616=HEAP32[(($rc)>>2)];
 var $617=($616|0)!=0;
 if($617){label=123;break;}else{label=124;break;}
 case 123: 
 var $619=HEAP32[(($rc)>>2)];
 var $620=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2440,HEAP32[(((tempVarArgs)+(8))>>2)]=$619,tempVarArgs)); STACKTOP=tempVarArgs;
 label=124;break;
 case 124: 
 var $622=$pdex;
 var $623=HEAP32[(($platform)>>2)];
 var $624=(($623+((($622)*(28))&-1))|0);
 var $625=(($624+20)|0);
 var $626=HEAP32[(($625)>>2)];
 var $627=(($kernel_name)|0);
 var $628=_clCreateKernel($626,$627,$rc);
 var $629=$pdex;
 var $630=HEAP32[(($platform)>>2)];
 var $631=(($630+((($629)*(28))&-1))|0);
 var $632=(($631+24)|0);
 HEAP32[(($632)>>2)]=$628;
 var $633=HEAP32[(($rc)>>2)];
 var $634=($633|0)!=0;
 if($634){label=125;break;}else{label=126;break;}
 case 125: 
 var $636=HEAP32[(($rc)>>2)];
 var $637=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2424,HEAP32[(((tempVarArgs)+(8))>>2)]=$636,tempVarArgs)); STACKTOP=tempVarArgs;
 label=126;break;
 case 126: 
 var $639=$pdex;
 var $640=HEAP32[(($platform)>>2)];
 var $641=(($640+((($639)*(28))&-1))|0);
 var $642=(($641+16)|0);
 var $643=HEAP32[(($642)>>2)];
 var $644=$ddex;
 var $645=$pdex;
 var $646=HEAP32[(($platform)>>2)];
 var $647=(($646+((($645)*(28))&-1))|0);
 var $648=(($647+12)|0);
 var $649=HEAP32[(($648)>>2)];
 var $650=(($649+((($644)*(24))&-1))|0);
 var $651=(($650)|0);
 var $652=HEAP32[(($651)>>2)];
 var $$etemp$42$0=1;
 var $$etemp$42$1=0;
 var $653=_clCreateCommandQueue($643,$652,$$etemp$42$0,$$etemp$42$1,$rc);
 var $654=$ddex;
 var $655=$pdex;
 var $656=HEAP32[(($platform)>>2)];
 var $657=(($656+((($655)*(28))&-1))|0);
 var $658=(($657+12)|0);
 var $659=HEAP32[(($658)>>2)];
 var $660=(($659+((($654)*(24))&-1))|0);
 var $661=(($660+16)|0);
 HEAP32[(($661)>>2)]=$653;
 var $662=HEAP32[(($rc)>>2)];
 var $663=($662|0)!=0;
 if($663){label=127;break;}else{label=128;break;}
 case 127: 
 var $665=HEAP32[(($rc)>>2)];
 var $666=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2400,HEAP32[(((tempVarArgs)+(8))>>2)]=$665,tempVarArgs)); STACKTOP=tempVarArgs;
 label=128;break;
 case 128: 
 var $668=$ddex;
 var $669=$pdex;
 var $670=HEAP32[(($platform)>>2)];
 var $671=(($670+((($669)*(28))&-1))|0);
 var $672=(($671+12)|0);
 var $673=HEAP32[(($672)>>2)];
 var $674=(($673+((($668)*(24))&-1))|0);
 var $675=(($674)|0);
 var $676=HEAP32[(($675)>>2)];
 var $677=_clGetDeviceInfo($676,4139,0,0,$param_value_size_ret);
 HEAP32[(($rc)>>2)]=$677;
 var $678=HEAP32[(($rc)>>2)];
 var $679=($678|0)!=0;
 if($679){label=129;break;}else{label=130;break;}
 case 129: 
 var $681=HEAP32[(($rc)>>2)];
 var $682=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2360,HEAP32[(((tempVarArgs)+(8))>>2)]=$681,tempVarArgs)); STACKTOP=tempVarArgs;
 label=130;break;
 case 130: 
 var $684=$ddex;
 var $685=$pdex;
 var $686=HEAP32[(($platform)>>2)];
 var $687=(($686+((($685)*(28))&-1))|0);
 var $688=(($687+12)|0);
 var $689=HEAP32[(($688)>>2)];
 var $690=(($689+((($684)*(24))&-1))|0);
 var $691=(($690+20)|0);
 var $692=HEAP32[(($preferred_alignment)>>2)];
 var $693=HEAP32[(($param_value_size_ret)>>2)];
 var $694=_posix_memalign($691,$692,$693);
 var $695=$ddex;
 var $696=$pdex;
 var $697=HEAP32[(($platform)>>2)];
 var $698=(($697+((($696)*(28))&-1))|0);
 var $699=(($698+12)|0);
 var $700=HEAP32[(($699)>>2)];
 var $701=(($700+((($695)*(24))&-1))|0);
 var $702=(($701+20)|0);
 var $703=HEAP32[(($702)>>2)];
 var $704=($703|0)==0;
 if($704){label=131;break;}else{label=132;break;}
 case 131: 
 var $706=HEAP32[(($param_value_size_ret)>>2)];
 var $707$0=$706;
 var $707$1=0;
 var $$etemp$44=2280;
 var $$etemp$43=3312;
 var $708=_printf($$etemp$43,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$707$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$707$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$44,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 132: 
 var $710=$ddex;
 var $711=$pdex;
 var $712=HEAP32[(($platform)>>2)];
 var $713=(($712+((($711)*(28))&-1))|0);
 var $714=(($713+12)|0);
 var $715=HEAP32[(($714)>>2)];
 var $716=(($715+((($710)*(24))&-1))|0);
 var $717=(($716)|0);
 var $718=HEAP32[(($717)>>2)];
 var $719=HEAP32[(($param_value_size_ret)>>2)];
 var $720=$ddex;
 var $721=$pdex;
 var $722=HEAP32[(($platform)>>2)];
 var $723=(($722+((($721)*(28))&-1))|0);
 var $724=(($723+12)|0);
 var $725=HEAP32[(($724)>>2)];
 var $726=(($725+((($720)*(24))&-1))|0);
 var $727=(($726+20)|0);
 var $728=HEAP32[(($727)>>2)];
 var $729=_clGetDeviceInfo($718,4139,$719,$728,0);
 HEAP32[(($rc)>>2)]=$729;
 var $730=HEAP32[(($rc)>>2)];
 var $731=($730|0)!=0;
 if($731){label=133;break;}else{label=134;break;}
 case 133: 
 var $733=HEAP32[(($rc)>>2)];
 var $734=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2248,HEAP32[(((tempVarArgs)+(8))>>2)]=$733,tempVarArgs)); STACKTOP=tempVarArgs;
 label=134;break;
 case 134: 
 var $736=HEAP32[((4752)>>2)];
 var $737=($736|0)==1;
 var $738=($737?2192:2176);
 var $739=$ddex;
 var $740=$pdex;
 var $741=HEAP32[(($platform)>>2)];
 var $742=(($741+((($740)*(28))&-1))|0);
 var $743=(($742+12)|0);
 var $744=HEAP32[(($743)>>2)];
 var $745=(($744+((($739)*(24))&-1))|0);
 var $746=(($745+20)|0);
 var $747=HEAP32[(($746)>>2)];
 var $748=_printf(2208,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$738,HEAP32[(((tempVarArgs)+(8))>>2)]=$747,tempVarArgs)); STACKTOP=tempVarArgs;
 var $749=$ddex;
 var $750=$pdex;
 var $751=HEAP32[(($platform)>>2)];
 var $752=(($751+((($750)*(28))&-1))|0);
 var $753=(($752+12)|0);
 var $754=HEAP32[(($753)>>2)];
 var $755=(($754+((($749)*(24))&-1))|0);
 var $756=(($755)|0);
 var $757=HEAP32[(($756)>>2)];
 var $758=$preferred_alignment;
 var $759=_clGetDeviceInfo($757,4121,4,$758,0);
 HEAP32[(($rc)>>2)]=$759;
 var $760=HEAP32[(($rc)>>2)];
 var $761=($760|0)!=0;
 if($761){label=135;break;}else{label=136;break;}
 case 135: 
 var $763=HEAP32[(($rc)>>2)];
 var $764=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2128,HEAP32[(((tempVarArgs)+(8))>>2)]=$763,tempVarArgs)); STACKTOP=tempVarArgs;
 label=136;break;
 case 136: 
 var $766=HEAP32[(($preferred_alignment)>>2)];
 var $767=($766>>>0)>1024;
 if($767){label=137;break;}else{label=138;break;}
 case 137: 
 HEAP32[(($preferred_alignment)>>2)]=1024;
 label=138;break;
 case 138: 
 var $770=HEAP32[(($preferred_alignment)>>2)];
 var $771=(((($770>>>0))/(8))&-1);
 HEAP32[(($preferred_alignment)>>2)]=$771;
 var $772=$ddex;
 var $773=$pdex;
 var $774=HEAP32[(($platform)>>2)];
 var $775=(($774+((($773)*(28))&-1))|0);
 var $776=(($775+12)|0);
 var $777=HEAP32[(($776)>>2)];
 var $778=(($777+((($772)*(24))&-1))|0);
 var $779=(($778)|0);
 var $780=HEAP32[(($779)>>2)];
 var $781=$command_queue_properties;
 var $782=_clGetDeviceInfo($780,4138,8,$781,0);
 var $ld$45$0=(($command_queue_properties)|0);
 var $783$0=HEAP32[(($ld$45$0)>>2)];
 var $ld$46$1=(($command_queue_properties+4)|0);
 var $783$1=HEAP32[(($ld$46$1)>>2)];
 var $$etemp$47$0=1;
 var $$etemp$47$1=0;
 var $784$0=$783$0&$$etemp$47$0;
 var $784$1=$783$1&$$etemp$47$1;
 var $st$48$0=(($command_queue_properties)|0);
 HEAP32[(($st$48$0)>>2)]=$784$0;
 var $st$49$1=(($command_queue_properties+4)|0);
 HEAP32[(($st$49$1)>>2)]=$784$1;
 var $785=$pdex;
 var $786=HEAP32[(($platform)>>2)];
 var $787=(($786+((($785)*(28))&-1))|0);
 var $788=(($787+24)|0);
 var $789=HEAP32[(($788)>>2)];
 var $790=$ddex;
 var $791=$pdex;
 var $792=HEAP32[(($platform)>>2)];
 var $793=(($792+((($791)*(28))&-1))|0);
 var $794=(($793+12)|0);
 var $795=HEAP32[(($794)>>2)];
 var $796=(($795+((($790)*(24))&-1))|0);
 var $797=(($796)|0);
 var $798=HEAP32[(($797)>>2)];
 var $799=$kernel_wg_size;
 var $800=(($return_size)|0);
 var $801=_clGetKernelWorkGroupInfo($789,$798,4528,4,$799,$800);
 HEAP32[(($rc)>>2)]=$801;
 var $802=HEAP32[(($rc)>>2)];
 var $803=($802|0)!=0;
 if($803){label=139;break;}else{label=140;break;}
 case 139: 
 var $805=HEAP32[(($rc)>>2)];
 var $806=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2056,HEAP32[(((tempVarArgs)+(8))>>2)]=$805,tempVarArgs)); STACKTOP=tempVarArgs;
 label=140;break;
 case 140: 
 var $808=$ddex;
 var $809=$pdex;
 var $810=HEAP32[(($platform)>>2)];
 var $811=(($810+((($809)*(28))&-1))|0);
 var $812=(($811+12)|0);
 var $813=HEAP32[(($812)>>2)];
 var $814=(($813+((($808)*(24))&-1))|0);
 var $815=(($814)|0);
 var $816=HEAP32[(($815)>>2)];
 var $817=$total_local_mem;
 var $818=_clGetDeviceInfo($816,4131,8,$817,0);
 HEAP32[(($rc)>>2)]=$818;
 var $819=HEAP32[(($rc)>>2)];
 var $820=($819|0)!=0;
 if($820){label=141;break;}else{label=142;break;}
 case 141: 
 var $822=HEAP32[(($rc)>>2)];
 var $823=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=2008,HEAP32[(((tempVarArgs)+(8))>>2)]=$822,tempVarArgs)); STACKTOP=tempVarArgs;
 label=142;break;
 case 142: 
 var $825=$pdex;
 var $826=HEAP32[(($platform)>>2)];
 var $827=(($826+((($825)*(28))&-1))|0);
 var $828=(($827+24)|0);
 var $829=HEAP32[(($828)>>2)];
 var $830=$ddex;
 var $831=$pdex;
 var $832=HEAP32[(($platform)>>2)];
 var $833=(($832+((($831)*(28))&-1))|0);
 var $834=(($833+12)|0);
 var $835=HEAP32[(($834)>>2)];
 var $836=(($835+((($830)*(24))&-1))|0);
 var $837=(($836)|0);
 var $838=HEAP32[(($837)>>2)];
 var $839=$used_local_mem;
 var $840=_clGetKernelWorkGroupInfo($829,$838,4530,8,$839,0);
 HEAP32[(($rc)>>2)]=$840;
 var $841=HEAP32[(($rc)>>2)];
 var $842=($841|0)!=0;
 if($842){label=143;break;}else{label=144;break;}
 case 143: 
 var $844=HEAP32[(($rc)>>2)];
 var $845=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1936,HEAP32[(((tempVarArgs)+(8))>>2)]=$844,tempVarArgs)); STACKTOP=tempVarArgs;
 label=144;break;
 case 144: 
 var $ld$50$0=(($total_local_mem)|0);
 var $847$0=HEAP32[(($ld$50$0)>>2)];
 var $ld$51$1=(($total_local_mem+4)|0);
 var $847$1=HEAP32[(($ld$51$1)>>2)];
 var $ld$52$0=(($used_local_mem)|0);
 var $848$0=HEAP32[(($ld$52$0)>>2)];
 var $ld$53$1=(($used_local_mem+4)|0);
 var $848$1=HEAP32[(($ld$53$1)>>2)];
 var $849$0=_i64Subtract($847$0,$847$1,$848$0,$848$1);var $849$1=tempRet0;
 var $st$54$0=(($local_mem_size)|0);
 HEAP32[(($st$54$0)>>2)]=$849$0;
 var $st$55$1=(($local_mem_size+4)|0);
 HEAP32[(($st$55$1)>>2)]=$849$1;
 var $850=$ddex;
 var $851=$pdex;
 var $852=HEAP32[(($platform)>>2)];
 var $853=(($852+((($851)*(28))&-1))|0);
 var $854=(($853+12)|0);
 var $855=HEAP32[(($854)>>2)];
 var $856=(($855+((($850)*(24))&-1))|0);
 var $857=(($856)|0);
 var $858=HEAP32[(($857)>>2)];
 var $859=$max_compute_units;
 var $860=_clGetDeviceInfo($858,4098,4,$859,0);
 HEAP32[(($row_index_array)>>2)]=0;
 HEAP32[(($x_index_array)>>2)]=0;
 HEAP32[(($data_array)>>2)]=0;
 var $861=(($mgs)|0);
 HEAP32[(($861)>>2)]=$matrix_header;
 var $862=(($mgs+4)|0);
 HEAP32[(($862)>>2)]=$seg_workspace;
 var $863=(($mgs+8)|0);
 HEAP32[(($863)>>2)]=$num_header_packets;
 var $864=(($mgs+12)|0);
 HEAP32[(($864)>>2)]=$row_index_array;
 var $865=(($mgs+16)|0);
 HEAP32[(($865)>>2)]=$x_index_array;
 var $866=(($mgs+20)|0);
 HEAP32[(($866)>>2)]=$data_array;
 var $867=(($mgs+24)|0);
 HEAP32[(($867)>>2)]=$nx_pad;
 var $868=(($mgs+28)|0);
 HEAP32[(($868)>>2)]=$nyround;
 var $869=(($mgs+32)|0);
 HEAP32[(($869)>>2)]=$slab_startrow;
 var $870=(($mgs+36)|0);
 HEAP32[(($870)>>2)]=$nx;
 var $871=(($mgs+40)|0);
 HEAP32[(($871)>>2)]=$ny;
 var $872=(($mgs+44)|0);
 HEAP32[(($872)>>2)]=$non_zero;
 var $873=HEAP32[((400)>>2)];
 var $874=(($mgs+48)|0);
 HEAP32[(($874)>>2)]=$873;
 var $875=HEAP32[(($preferred_alignment)>>2)];
 var $876=(($mgs+52)|0);
 HEAP32[(($876)>>2)]=$875;
 var $877=(($mgs+56)|0);
 HEAP32[(($877)>>2)]=$max_compute_units;
 var $878=HEAP32[((4752)>>2)];
 var $879=(($mgs+60)|0);
 HEAP32[(($879)>>2)]=$878;
 var $880=(($mgs+64)|0);
 HEAP32[(($880)>>2)]=$column_span;
 var $ld$56$0=(($local_mem_size)|0);
 var $881$0=HEAP32[(($ld$56$0)>>2)];
 var $ld$57$1=(($local_mem_size+4)|0);
 var $881$1=HEAP32[(($ld$57$1)>>2)];
 var $882$0=$881$0;
 var $882=$882$0;
 var $883=(($mgs+68)|0);
 HEAP32[(($883)>>2)]=$882;
 var $884=(($mgs+72)|0);
 HEAP32[(($884)>>2)]=$segcachesize;
 var $885=(($mgs+76)|0);
 HEAP32[(($885)>>2)]=$max_slabheight;
 var $886=$ddex;
 var $887=$pdex;
 var $888=HEAP32[(($platform)>>2)];
 var $889=(($888+((($887)*(28))&-1))|0);
 var $890=(($889+12)|0);
 var $891=HEAP32[(($890)>>2)];
 var $892=(($891+((($886)*(24))&-1))|0);
 var $893=(($892+8)|0);
 var $ld$58$0=(($893)|0);
 var $894$0=HEAP32[(($ld$58$0)>>2)];
 var $ld$59$1=(($893+4)|0);
 var $894$1=HEAP32[(($ld$59$1)>>2)];
 var $895=(($mgs+80)|0);
 var $st$60$0=(($895)|0);
 HEAP32[(($st$60$0)>>2)]=$894$0;
 var $st$61$1=(($895+4)|0);
 HEAP32[(($st$61$1)>>2)]=$894$1;
 var $896=(($mgs+88)|0);
 HEAP32[(($896)>>2)]=392;
 var $897=HEAP32[(($kernel_wg_size)>>2)];
 var $898=(($mgs+92)|0);
 HEAP32[(($898)>>2)]=$897;
 var $899=(($mgs+96)|0);
 HEAP32[(($899)>>2)]=$nslabs_round;
 var $900=(($mgs+100)|0);
 HEAP32[(($900)>>2)]=$memsize;
 var $901=_matrix_gen($mgs);
 HEAP32[(($rc)>>2)]=$901;
 var $902=HEAP32[((4752)>>2)];
 var $903=($902|0)==2;
 if($903){label=145;break;}else{label=146;break;}
 case 145: 
 $ndims=1;
 var $905=HEAP32[(($nslabs_round)>>2)];
 var $906=(($global_work_size)|0);
 HEAP32[(($906)>>2)]=$905;
 var $907=(($local_work_size)|0);
 HEAP32[(($907)>>2)]=1;
 label=159;break;
 case 146: 
 $ndims=2;
 var $909=$ddex;
 var $910=$pdex;
 var $911=HEAP32[(($platform)>>2)];
 var $912=(($911+((($910)*(28))&-1))|0);
 var $913=(($912+12)|0);
 var $914=HEAP32[(($913)>>2)];
 var $915=(($914+((($909)*(24))&-1))|0);
 var $916=(($915+8)|0);
 var $ld$62$0=(($916)|0);
 var $917$0=HEAP32[(($ld$62$0)>>2)];
 var $ld$63$1=(($916+4)|0);
 var $917$1=HEAP32[(($ld$63$1)>>2)];
 var $$etemp$64$0=4;
 var $$etemp$64$1=0;
 var $918=(($917$0|0) == ($$etemp$64$0|0)) & (($917$1|0) == ($$etemp$64$1|0));
 var $919=($918?16:1);
 HEAP32[(($team_size)>>2)]=$919;
 var $920=HEAP32[(($nslabs_round)>>2)];
 var $921=(($global_work_size+4)|0);
 HEAP32[(($921)>>2)]=$920;
 var $922=(($local_work_size+4)|0);
 HEAP32[(($922)>>2)]=1;
 var $923=$ddex;
 var $924=$pdex;
 var $925=HEAP32[(($platform)>>2)];
 var $926=(($925+((($924)*(28))&-1))|0);
 var $927=(($926+12)|0);
 var $928=HEAP32[(($927)>>2)];
 var $929=(($928+((($923)*(24))&-1))|0);
 var $930=(($929+8)|0);
 var $ld$65$0=(($930)|0);
 var $931$0=HEAP32[(($ld$65$0)>>2)];
 var $ld$66$1=(($930+4)|0);
 var $931$1=HEAP32[(($ld$66$1)>>2)];
 var $$etemp$67$0=4;
 var $$etemp$67$1=0;
 var $932=(($931$0|0) == ($$etemp$67$0|0)) & (($931$1|0) == ($$etemp$67$1|0));
 if($932){label=147;break;}else{label=148;break;}
 case 147: 
 var $934=HEAP32[((392)>>2)];
 var $937=$934;label=149;break;
 case 148: 
 var $937=1;label=149;break;
 case 149: 
 var $937;
 var $938=(($local_work_size)|0);
 HEAP32[(($938)>>2)]=$937;
 var $939=(($global_work_size)|0);
 HEAP32[(($939)>>2)]=$937;
 $max_aggregate_local_work_group_size=0;
 $aggregate_local_work_group_size=1;
 $i=0;
 label=150;break;
 case 150: 
 var $941=$i;
 var $942=$ndims;
 var $943=($941>>>0)<($942>>>0);
 if($943){label=151;break;}else{label=153;break;}
 case 151: 
 var $945=$i;
 var $946=(($local_work_size+($945<<2))|0);
 var $947=HEAP32[(($946)>>2)];
 var $948=$aggregate_local_work_group_size;
 var $949=(Math_imul($948,$947)|0);
 $aggregate_local_work_group_size=$949;
 label=152;break;
 case 152: 
 var $951=$i;
 var $952=((($951)+(1))|0);
 $i=$952;
 label=150;break;
 case 153: 
 var $954=$aggregate_local_work_group_size;
 $max_aggregate_local_work_group_size=$954;
 var $955=$max_aggregate_local_work_group_size;
 var $956=HEAP32[(($kernel_wg_size)>>2)];
 var $957=($955|0)>($956|0);
 if($957){label=154;break;}else{label=158;break;}
 case 154: 
 label=155;break;
 case 155: 
 var $960=$max_aggregate_local_work_group_size;
 var $961=HEAP32[(($kernel_wg_size)>>2)];
 var $962=($960|0)>($961|0);
 if($962){label=156;break;}else{label=157;break;}
 case 156: 
 var $964=(($local_work_size)|0);
 var $965=HEAP32[(($964)>>2)];
 var $966=(((($965>>>0))/(2))&-1);
 HEAP32[(($964)>>2)]=$966;
 var $967=HEAP32[((392)>>2)];
 var $968=(((($967|0))/(2))&-1);
 HEAP32[((392)>>2)]=$968;
 var $969=$max_aggregate_local_work_group_size;
 var $970=(((($969|0))/(2))&-1);
 $max_aggregate_local_work_group_size=$970;
 label=155;break;
 case 157: 
 var $972=HEAP32[((392)>>2)];
 var $973=_printf(1856,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$972,tempVarArgs)); STACKTOP=tempVarArgs;
 label=158;break;
 case 158: 
 label=159;break;
 case 159: 
 var $976=$output_array_verify;
 var $977=HEAP32[(($preferred_alignment)>>2)];
 var $978=HEAP32[(($nyround)>>2)];
 var $979=($978<<2);
 var $980=_posix_memalign($976,$977,$979);
 var $981=HEAP32[(($output_array_verify)>>2)];
 var $982=($981|0)==0;
 if($982){label=160;break;}else{label=161;break;}
 case 160: 
 var $984=HEAP32[(($nyround)>>2)];
 var $985=($984<<2);
 var $986$0=$985;
 var $986$1=0;
 var $$etemp$69=1832;
 var $$etemp$68=3312;
 var $987=_printf($$etemp$68,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$986$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$986$1,HEAP32[(((tempVarArgs)+(16))>>2)]=$$etemp$69,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 161: 
 var $989=HEAP32[(($output_array_verify)>>2)];
 var $990=($989|0)==0;
 if($990){label=162;break;}else{label=163;break;}
 case 162: 
 var $992=HEAP32[((_stderr)>>2)];
 var $993=_fprintf($992,1712,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $994=HEAP32[((_stderr)>>2)];
 var $995=_fflush($994);
 _exit(1);
 throw "Reached an unreachable!";
 case 163: 
 var $997=HEAP32[(($nx_pad)>>2)];
 var $998=($997<<2);
 $input_buffer_size=$998;
 var $999=$pdex;
 var $1000=HEAP32[(($platform)>>2)];
 var $1001=(($1000+((($999)*(28))&-1))|0);
 var $1002=(($1001+16)|0);
 var $1003=HEAP32[(($1002)>>2)];
 var $1004=$input_buffer_size;
 var $$etemp$70$0=16;
 var $$etemp$70$1=0;
 var $1005=_clCreateBuffer($1003,$$etemp$70$0,$$etemp$70$1,$1004,0,$rc);
 HEAP32[(($input_buffer)>>2)]=$1005;
 var $1006=HEAP32[(($rc)>>2)];
 var $1007=($1006|0)!=0;
 if($1007){label=164;break;}else{label=165;break;}
 case 164: 
 var $1009=HEAP32[(($rc)>>2)];
 var $1010=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1680,HEAP32[(((tempVarArgs)+(8))>>2)]=$1009,tempVarArgs)); STACKTOP=tempVarArgs;
 label=165;break;
 case 165: 
 var $1012=HEAP32[(($memsize)>>2)];
 $matrix_buffer_size=$1012;
 var $1013=$pdex;
 var $1014=HEAP32[(($platform)>>2)];
 var $1015=(($1014+((($1013)*(28))&-1))|0);
 var $1016=(($1015+16)|0);
 var $1017=HEAP32[(($1016)>>2)];
 var $1018=$matrix_buffer_size;
 var $$etemp$71$0=16;
 var $$etemp$71$1=0;
 var $1019=_clCreateBuffer($1017,$$etemp$71$0,$$etemp$71$1,$1018,0,$rc);
 HEAP32[(($matrix_buffer)>>2)]=$1019;
 var $1020=HEAP32[(($rc)>>2)];
 var $1021=($1020|0)!=0;
 if($1021){label=166;break;}else{label=167;break;}
 case 166: 
 var $1023=HEAP32[(($rc)>>2)];
 var $1024=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1648,HEAP32[(((tempVarArgs)+(8))>>2)]=$1023,tempVarArgs)); STACKTOP=tempVarArgs;
 label=167;break;
 case 167: 
 var $1026=HEAP32[(($nslabs_round)>>2)];
 var $1027=HEAP32[(($slab_startrow)>>2)];
 var $1028=(($1027+($1026<<2))|0);
 var $1029=HEAP32[(($1028)>>2)];
 var $1030=HEAP32[(($slab_startrow)>>2)];
 var $1031=(($1030)|0);
 var $1032=HEAP32[(($1031)>>2)];
 var $1033=((($1029)-($1032))|0);
 var $1034=($1033<<2);
 $output_buffer_size=$1034;
 var $1035=$pdex;
 var $1036=HEAP32[(($platform)>>2)];
 var $1037=(($1036+((($1035)*(28))&-1))|0);
 var $1038=(($1037+16)|0);
 var $1039=HEAP32[(($1038)>>2)];
 var $1040=$output_buffer_size;
 var $$etemp$72$0=16;
 var $$etemp$72$1=0;
 var $1041=_clCreateBuffer($1039,$$etemp$72$0,$$etemp$72$1,$1040,0,$rc);
 HEAP32[(($output_buffer)>>2)]=$1041;
 var $1042=HEAP32[(($rc)>>2)];
 var $1043=($1042|0)!=0;
 if($1043){label=168;break;}else{label=169;break;}
 case 168: 
 var $1045=HEAP32[(($rc)>>2)];
 var $1046=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1616,HEAP32[(((tempVarArgs)+(8))>>2)]=$1045,tempVarArgs)); STACKTOP=tempVarArgs;
 label=169;break;
 case 169: 
 var $1048=$ddex;
 var $1049=$pdex;
 var $1050=HEAP32[(($platform)>>2)];
 var $1051=(($1050+((($1049)*(28))&-1))|0);
 var $1052=(($1051+12)|0);
 var $1053=HEAP32[(($1052)>>2)];
 var $1054=(($1053+((($1048)*(24))&-1))|0);
 var $1055=(($1054+16)|0);
 var $1056=HEAP32[(($1055)>>2)];
 var $1057=HEAP32[(($input_buffer)>>2)];
 var $1058=$input_buffer_size;
 var $$etemp$73$0=2;
 var $$etemp$73$1=0;
 var $1059=_clEnqueueMapBuffer($1056,$1057,1,$$etemp$73$0,$$etemp$73$1,0,$1058,0,0,0,$rc);
 var $1060=$1059;
 $input_array=$1060;
 var $1061=HEAP32[(($rc)>>2)];
 var $1062=($1061|0)!=0;
 if($1062){label=170;break;}else{label=171;break;}
 case 170: 
 var $1064=HEAP32[(($rc)>>2)];
 var $1065=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1584,HEAP32[(((tempVarArgs)+(8))>>2)]=$1064,tempVarArgs)); STACKTOP=tempVarArgs;
 label=171;break;
 case 171: 
 var $1067=$ddex;
 var $1068=$pdex;
 var $1069=HEAP32[(($platform)>>2)];
 var $1070=(($1069+((($1068)*(28))&-1))|0);
 var $1071=(($1070+12)|0);
 var $1072=HEAP32[(($1071)>>2)];
 var $1073=(($1072+((($1067)*(24))&-1))|0);
 var $1074=(($1073+16)|0);
 var $1075=HEAP32[(($1074)>>2)];
 var $1076=HEAP32[(($matrix_buffer)>>2)];
 var $1077=$matrix_buffer_size;
 var $$etemp$74$0=2;
 var $$etemp$74$1=0;
 var $1078=_clEnqueueMapBuffer($1075,$1076,1,$$etemp$74$0,$$etemp$74$1,0,$1077,0,0,0,$rc);
 var $1079=$1078;
 $tilebuffer=$1079;
 var $1080=HEAP32[(($rc)>>2)];
 var $1081=($1080|0)!=0;
 if($1081){label=172;break;}else{label=173;break;}
 case 172: 
 var $1083=HEAP32[(($rc)>>2)];
 var $1084=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1512,HEAP32[(((tempVarArgs)+(8))>>2)]=$1083,tempVarArgs)); STACKTOP=tempVarArgs;
 label=173;break;
 case 173: 
 var $1086=$ddex;
 var $1087=$pdex;
 var $1088=HEAP32[(($platform)>>2)];
 var $1089=(($1088+((($1087)*(28))&-1))|0);
 var $1090=(($1089+12)|0);
 var $1091=HEAP32[(($1090)>>2)];
 var $1092=(($1091+((($1086)*(24))&-1))|0);
 var $1093=(($1092+16)|0);
 var $1094=HEAP32[(($1093)>>2)];
 var $1095=HEAP32[(($output_buffer)>>2)];
 var $1096=$output_buffer_size;
 var $$etemp$75$0=2;
 var $$etemp$75$1=0;
 var $1097=_clEnqueueMapBuffer($1094,$1095,1,$$etemp$75$0,$$etemp$75$1,0,$1096,0,0,0,$rc);
 var $1098=$1097;
 $output_array=$1098;
 var $1099=HEAP32[(($rc)>>2)];
 var $1100=($1099|0)!=0;
 if($1100){label=174;break;}else{label=175;break;}
 case 174: 
 var $1102=HEAP32[(($rc)>>2)];
 var $1103=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1472,HEAP32[(((tempVarArgs)+(8))>>2)]=$1102,tempVarArgs)); STACKTOP=tempVarArgs;
 label=175;break;
 case 175: 
 var $1105=$tilebuffer;
 var $1106=$1105;
 var $1107=HEAP32[(($seg_workspace)>>2)];
 var $1108=$1107;
 var $1109=HEAP32[(($nslabs_round)>>2)];
 var $1110=HEAP32[(($matrix_header)>>2)];
 var $1111=(($1110+((($1109)*(12))&-1))|0);
 var $1112=(($1111)|0);
 var $1113=HEAP32[(($1112)>>2)];
 var $1114=($1113<<7);
 assert($1114 % 1 === 0);(_memcpy($1106, $1108, $1114)|0);
 var $1115=$ddex;
 var $1116=$pdex;
 var $1117=HEAP32[(($platform)>>2)];
 var $1118=(($1117+((($1116)*(28))&-1))|0);
 var $1119=(($1118+12)|0);
 var $1120=HEAP32[(($1119)>>2)];
 var $1121=(($1120+((($1115)*(24))&-1))|0);
 var $1122=(($1121+16)|0);
 var $1123=HEAP32[(($1122)>>2)];
 var $1124=HEAP32[(($matrix_buffer)>>2)];
 var $1125=$tilebuffer;
 var $1126=$1125;
 var $1127=(($events)|0);
 var $1128=_clEnqueueUnmapMemObject($1123,$1124,$1126,0,0,$1127);
 HEAP32[(($rc)>>2)]=$1128;
 var $1129=HEAP32[(($rc)>>2)];
 var $1130=($1129|0)!=0;
 if($1130){label=176;break;}else{label=177;break;}
 case 176: 
 var $1132=HEAP32[(($rc)>>2)];
 var $1133=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1432,HEAP32[(((tempVarArgs)+(8))>>2)]=$1132,tempVarArgs)); STACKTOP=tempVarArgs;
 label=177;break;
 case 177: 
 var $1135=(($events)|0);
 var $1136=_clWaitForEvents(1,$1135);
 $i=0;
 label=178;break;
 case 178: 
 var $1138=$i;
 var $1139=HEAP32[(($nx)>>2)];
 var $1140=($1138>>>0)<($1139>>>0);
 if($1140){label=179;break;}else{label=181;break;}
 case 179: 
 var $1142=_rand();
 var $1143=$1142&32767;
 var $1144=($1143|0);
 var $1145=($1144)*((0.0010000000474974513));
 var $1146=($1145)-(15);
 $rval=$1146;
 var $1147=$rval;
 var $1148=$i;
 var $1149=$input_array;
 var $1150=(($1149+($1148<<2))|0);
 HEAPF32[(($1150)>>2)]=$1147;
 label=180;break;
 case 180: 
 var $1152=$i;
 var $1153=((($1152)+(1))|0);
 $i=$1153;
 label=178;break;
 case 181: 
 var $1155=$output_array;
 var $1156=$1155;
 var $1157=$output_buffer_size;
 _memset($1156, 0, $1157)|0;
 var $1158=$ddex;
 var $1159=$pdex;
 var $1160=HEAP32[(($platform)>>2)];
 var $1161=(($1160+((($1159)*(28))&-1))|0);
 var $1162=(($1161+12)|0);
 var $1163=HEAP32[(($1162)>>2)];
 var $1164=(($1163+((($1158)*(24))&-1))|0);
 var $1165=(($1164+16)|0);
 var $1166=HEAP32[(($1165)>>2)];
 var $1167=HEAP32[(($input_buffer)>>2)];
 var $1168=$input_array;
 var $1169=$1168;
 var $1170=(($events)|0);
 var $1171=_clEnqueueUnmapMemObject($1166,$1167,$1169,0,0,$1170);
 HEAP32[(($rc)>>2)]=$1171;
 var $1172=HEAP32[(($rc)>>2)];
 var $1173=($1172|0)!=0;
 if($1173){label=182;break;}else{label=183;break;}
 case 182: 
 var $1175=HEAP32[(($rc)>>2)];
 var $1176=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1392,HEAP32[(((tempVarArgs)+(8))>>2)]=$1175,tempVarArgs)); STACKTOP=tempVarArgs;
 label=183;break;
 case 183: 
 var $1178=$ddex;
 var $1179=$pdex;
 var $1180=HEAP32[(($platform)>>2)];
 var $1181=(($1180+((($1179)*(28))&-1))|0);
 var $1182=(($1181+12)|0);
 var $1183=HEAP32[(($1182)>>2)];
 var $1184=(($1183+((($1178)*(24))&-1))|0);
 var $1185=(($1184+16)|0);
 var $1186=HEAP32[(($1185)>>2)];
 var $1187=HEAP32[(($output_buffer)>>2)];
 var $1188=$output_array;
 var $1189=$1188;
 var $1190=(($events+4)|0);
 var $1191=_clEnqueueUnmapMemObject($1186,$1187,$1189,0,0,$1190);
 HEAP32[(($rc)>>2)]=$1191;
 var $1192=HEAP32[(($rc)>>2)];
 var $1193=($1192|0)!=0;
 if($1193){label=184;break;}else{label=185;break;}
 case 184: 
 var $1195=HEAP32[(($rc)>>2)];
 var $1196=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1352,HEAP32[(((tempVarArgs)+(8))>>2)]=$1195,tempVarArgs)); STACKTOP=tempVarArgs;
 label=185;break;
 case 185: 
 var $1198=(($events)|0);
 var $1199=_clWaitForEvents(2,$1198);
 var $1200=$pdex;
 var $1201=HEAP32[(($platform)>>2)];
 var $1202=(($1201+((($1200)*(28))&-1))|0);
 var $1203=(($1202+24)|0);
 var $1204=HEAP32[(($1203)>>2)];
 var $1205=$input_buffer;
 var $1206=_clSetKernelArg($1204,0,4,$1205);
 HEAP32[(($rc)>>2)]=$1206;
 var $1207=HEAP32[(($rc)>>2)];
 var $1208=($1207|0)!=0;
 if($1208){label=186;break;}else{label=187;break;}
 case 186: 
 var $1210=HEAP32[(($rc)>>2)];
 var $1211=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1256,HEAP32[(((tempVarArgs)+(8))>>2)]=$1210,tempVarArgs)); STACKTOP=tempVarArgs;
 label=187;break;
 case 187: 
 var $1213=$pdex;
 var $1214=HEAP32[(($platform)>>2)];
 var $1215=(($1214+((($1213)*(28))&-1))|0);
 var $1216=(($1215+24)|0);
 var $1217=HEAP32[(($1216)>>2)];
 var $1218=$output_buffer;
 var $1219=_clSetKernelArg($1217,1,4,$1218);
 HEAP32[(($rc)>>2)]=$1219;
 var $1220=HEAP32[(($rc)>>2)];
 var $1221=($1220|0)!=0;
 if($1221){label=188;break;}else{label=189;break;}
 case 188: 
 var $1223=HEAP32[(($rc)>>2)];
 var $1224=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1232,HEAP32[(((tempVarArgs)+(8))>>2)]=$1223,tempVarArgs)); STACKTOP=tempVarArgs;
 label=189;break;
 case 189: 
 var $1226=$pdex;
 var $1227=HEAP32[(($platform)>>2)];
 var $1228=(($1227+((($1226)*(28))&-1))|0);
 var $1229=(($1228+24)|0);
 var $1230=HEAP32[(($1229)>>2)];
 var $1231=$matrix_buffer;
 var $1232=_clSetKernelArg($1230,2,4,$1231);
 HEAP32[(($rc)>>2)]=$1232;
 var $1233=HEAP32[(($rc)>>2)];
 var $1234=($1233|0)!=0;
 if($1234){label=190;break;}else{label=191;break;}
 case 190: 
 var $1236=HEAP32[(($rc)>>2)];
 var $1237=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1208,HEAP32[(((tempVarArgs)+(8))>>2)]=$1236,tempVarArgs)); STACKTOP=tempVarArgs;
 label=191;break;
 case 191: 
 var $1239=$pdex;
 var $1240=HEAP32[(($platform)>>2)];
 var $1241=(($1240+((($1239)*(28))&-1))|0);
 var $1242=(($1241+24)|0);
 var $1243=HEAP32[(($1242)>>2)];
 var $1244=$column_span;
 var $1245=_clSetKernelArg($1243,3,4,$1244);
 HEAP32[(($rc)>>2)]=$1245;
 var $1246=HEAP32[(($rc)>>2)];
 var $1247=($1246|0)!=0;
 if($1247){label=192;break;}else{label=193;break;}
 case 192: 
 var $1249=HEAP32[(($rc)>>2)];
 var $1250=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1184,HEAP32[(((tempVarArgs)+(8))>>2)]=$1249,tempVarArgs)); STACKTOP=tempVarArgs;
 label=193;break;
 case 193: 
 var $1252=$pdex;
 var $1253=HEAP32[(($platform)>>2)];
 var $1254=(($1253+((($1252)*(28))&-1))|0);
 var $1255=(($1254+24)|0);
 var $1256=HEAP32[(($1255)>>2)];
 var $1257=$max_slabheight;
 var $1258=_clSetKernelArg($1256,4,4,$1257);
 HEAP32[(($rc)>>2)]=$1258;
 var $1259=HEAP32[(($rc)>>2)];
 var $1260=($1259|0)!=0;
 if($1260){label=194;break;}else{label=195;break;}
 case 194: 
 var $1262=HEAP32[(($rc)>>2)];
 var $1263=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1160,HEAP32[(((tempVarArgs)+(8))>>2)]=$1262,tempVarArgs)); STACKTOP=tempVarArgs;
 label=195;break;
 case 195: 
 var $1265=HEAP32[((4752)>>2)];
 var $1266=($1265|0)==1;
 if($1266){label=196;break;}else{label=203;break;}
 case 196: 
 var $1268=$pdex;
 var $1269=HEAP32[(($platform)>>2)];
 var $1270=(($1269+((($1268)*(28))&-1))|0);
 var $1271=(($1270+24)|0);
 var $1272=HEAP32[(($1271)>>2)];
 var $1273=$team_size;
 var $1274=_clSetKernelArg($1272,5,4,$1273);
 HEAP32[(($rc)>>2)]=$1274;
 var $1275=HEAP32[(($rc)>>2)];
 var $1276=($1275|0)!=0;
 if($1276){label=197;break;}else{label=198;break;}
 case 197: 
 var $1278=HEAP32[(($rc)>>2)];
 var $1279=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1128,HEAP32[(((tempVarArgs)+(8))>>2)]=$1278,tempVarArgs)); STACKTOP=tempVarArgs;
 label=198;break;
 case 198: 
 var $1281=$pdex;
 var $1282=HEAP32[(($platform)>>2)];
 var $1283=(($1282+((($1281)*(28))&-1))|0);
 var $1284=(($1283+24)|0);
 var $1285=HEAP32[(($1284)>>2)];
 var $1286=$num_header_packets;
 var $1287=_clSetKernelArg($1285,6,4,$1286);
 HEAP32[(($rc)>>2)]=$1287;
 var $1288=HEAP32[(($rc)>>2)];
 var $1289=($1288|0)!=0;
 if($1289){label=199;break;}else{label=200;break;}
 case 199: 
 var $1291=HEAP32[(($rc)>>2)];
 var $1292=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1104,HEAP32[(((tempVarArgs)+(8))>>2)]=$1291,tempVarArgs)); STACKTOP=tempVarArgs;
 label=200;break;
 case 200: 
 var $1294=$pdex;
 var $1295=HEAP32[(($platform)>>2)];
 var $1296=(($1295+((($1294)*(28))&-1))|0);
 var $1297=(($1296+24)|0);
 var $1298=HEAP32[(($1297)>>2)];
 var $1299=HEAP32[(($max_slabheight)>>2)];
 var $1300=($1299<<2);
 var $1301=_clSetKernelArg($1298,7,$1300,0);
 HEAP32[(($rc)>>2)]=$1301;
 var $1302=HEAP32[(($rc)>>2)];
 var $1303=($1302|0)!=0;
 if($1303){label=201;break;}else{label=202;break;}
 case 201: 
 var $1305=HEAP32[(($rc)>>2)];
 var $1306=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1080,HEAP32[(((tempVarArgs)+(8))>>2)]=$1305,tempVarArgs)); STACKTOP=tempVarArgs;
 label=202;break;
 case 202: 
 label=214;break;
 case 203: 
 var $1309=$pdex;
 var $1310=HEAP32[(($platform)>>2)];
 var $1311=(($1310+((($1309)*(28))&-1))|0);
 var $1312=(($1311+24)|0);
 var $1313=HEAP32[(($1312)>>2)];
 var $1314=$segcachesize;
 var $1315=_clSetKernelArg($1313,5,4,$1314);
 HEAP32[(($rc)>>2)]=$1315;
 var $1316=HEAP32[(($rc)>>2)];
 var $1317=($1316|0)!=0;
 if($1317){label=204;break;}else{label=205;break;}
 case 204: 
 var $1319=HEAP32[(($rc)>>2)];
 var $1320=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1128,HEAP32[(((tempVarArgs)+(8))>>2)]=$1319,tempVarArgs)); STACKTOP=tempVarArgs;
 label=205;break;
 case 205: 
 var $1322=$pdex;
 var $1323=HEAP32[(($platform)>>2)];
 var $1324=(($1323+((($1322)*(28))&-1))|0);
 var $1325=(($1324+24)|0);
 var $1326=HEAP32[(($1325)>>2)];
 var $1327=$num_header_packets;
 var $1328=_clSetKernelArg($1326,6,4,$1327);
 HEAP32[(($rc)>>2)]=$1328;
 var $1329=HEAP32[(($rc)>>2)];
 var $1330=($1329|0)!=0;
 if($1330){label=206;break;}else{label=207;break;}
 case 206: 
 var $1332=HEAP32[(($rc)>>2)];
 var $1333=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1104,HEAP32[(((tempVarArgs)+(8))>>2)]=$1332,tempVarArgs)); STACKTOP=tempVarArgs;
 label=207;break;
 case 207: 
 var $1335=$pdex;
 var $1336=HEAP32[(($platform)>>2)];
 var $1337=(($1336+((($1335)*(28))&-1))|0);
 var $1338=(($1337+24)|0);
 var $1339=HEAP32[(($1338)>>2)];
 var $1340=HEAP32[(($column_span)>>2)];
 var $1341=($1340<<1);
 var $1342=($1341<<2);
 var $1343=_clSetKernelArg($1339,7,$1342,0);
 HEAP32[(($rc)>>2)]=$1343;
 var $1344=HEAP32[(($rc)>>2)];
 var $1345=($1344|0)!=0;
 if($1345){label=208;break;}else{label=209;break;}
 case 208: 
 var $1347=HEAP32[(($rc)>>2)];
 var $1348=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1080,HEAP32[(((tempVarArgs)+(8))>>2)]=$1347,tempVarArgs)); STACKTOP=tempVarArgs;
 label=209;break;
 case 209: 
 var $1350=$pdex;
 var $1351=HEAP32[(($platform)>>2)];
 var $1352=(($1351+((($1350)*(28))&-1))|0);
 var $1353=(($1352+24)|0);
 var $1354=HEAP32[(($1353)>>2)];
 var $1355=HEAP32[(($max_slabheight)>>2)];
 var $1356=($1355<<2);
 var $1357=_clSetKernelArg($1354,8,$1356,0);
 HEAP32[(($rc)>>2)]=$1357;
 var $1358=HEAP32[(($rc)>>2)];
 var $1359=($1358|0)!=0;
 if($1359){label=210;break;}else{label=211;break;}
 case 210: 
 var $1361=HEAP32[(($rc)>>2)];
 var $1362=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1056,HEAP32[(((tempVarArgs)+(8))>>2)]=$1361,tempVarArgs)); STACKTOP=tempVarArgs;
 label=211;break;
 case 211: 
 var $1364=$pdex;
 var $1365=HEAP32[(($platform)>>2)];
 var $1366=(($1365+((($1364)*(28))&-1))|0);
 var $1367=(($1366+24)|0);
 var $1368=HEAP32[(($1367)>>2)];
 var $1369=HEAP32[(($segcachesize)>>2)];
 var $1370=($1369<<7);
 var $1371=_clSetKernelArg($1368,9,$1370,0);
 HEAP32[(($rc)>>2)]=$1371;
 var $1372=HEAP32[(($rc)>>2)];
 var $1373=($1372|0)!=0;
 if($1373){label=212;break;}else{label=213;break;}
 case 212: 
 var $1375=HEAP32[(($rc)>>2)];
 var $1376=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1032,HEAP32[(((tempVarArgs)+(8))>>2)]=$1375,tempVarArgs)); STACKTOP=tempVarArgs;
 label=213;break;
 case 213: 
 label=214;break;
 case 214: 
 var $1379=$ddex;
 var $1380=$pdex;
 var $1381=HEAP32[(($platform)>>2)];
 var $1382=(($1381+((($1380)*(28))&-1))|0);
 var $1383=(($1382+12)|0);
 var $1384=HEAP32[(($1383)>>2)];
 var $1385=(($1384+((($1379)*(24))&-1))|0);
 var $1386=(($1385+16)|0);
 var $1387=HEAP32[(($1386)>>2)];
 var $1388=$pdex;
 var $1389=HEAP32[(($platform)>>2)];
 var $1390=(($1389+((($1388)*(28))&-1))|0);
 var $1391=(($1390+24)|0);
 var $1392=HEAP32[(($1391)>>2)];
 var $1393=$ndims;
 var $1394=(($global_work_size)|0);
 var $1395=(($local_work_size)|0);
 var $1396=(($events)|0);
 var $1397=_clEnqueueNDRangeKernel($1387,$1392,$1393,0,$1394,$1395,0,0,$1396);
 HEAP32[(($rc)>>2)]=$1397;
 var $1398=HEAP32[(($rc)>>2)];
 var $1399=($1398|0)!=0;
 if($1399){label=215;break;}else{label=216;break;}
 case 215: 
 var $1401=HEAP32[(($rc)>>2)];
 var $1402=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=944,HEAP32[(((tempVarArgs)+(8))>>2)]=$1401,tempVarArgs)); STACKTOP=tempVarArgs;
 label=216;break;
 case 216: 
 var $1404=(($events)|0);
 var $1405=_clWaitForEvents(1,$1404);
 var $1406=$ddex;
 var $1407=$pdex;
 var $1408=HEAP32[(($platform)>>2)];
 var $1409=(($1408+((($1407)*(28))&-1))|0);
 var $1410=(($1409+12)|0);
 var $1411=HEAP32[(($1410)>>2)];
 var $1412=(($1411+((($1406)*(24))&-1))|0);
 var $1413=(($1412+16)|0);
 var $1414=HEAP32[(($1413)>>2)];
 var $1415=HEAP32[(($output_buffer)>>2)];
 var $1416=$output_buffer_size;
 var $$etemp$76$0=3;
 var $$etemp$76$1=0;
 var $1417=_clEnqueueMapBuffer($1414,$1415,1,$$etemp$76$0,$$etemp$76$1,0,$1416,0,0,0,$rc);
 var $1418=$1417;
 $output_array=$1418;
 var $1419=HEAP32[(($rc)>>2)];
 var $1420=($1419|0)!=0;
 if($1420){label=217;break;}else{label=218;break;}
 case 217: 
 var $1422=HEAP32[(($rc)>>2)];
 var $1423=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1472,HEAP32[(((tempVarArgs)+(8))>>2)]=$1422,tempVarArgs)); STACKTOP=tempVarArgs;
 label=218;break;
 case 218: 
 var $1425=$ddex;
 var $1426=$pdex;
 var $1427=HEAP32[(($platform)>>2)];
 var $1428=(($1427+((($1426)*(28))&-1))|0);
 var $1429=(($1428+12)|0);
 var $1430=HEAP32[(($1429)>>2)];
 var $1431=(($1430+((($1425)*(24))&-1))|0);
 var $1432=(($1431+16)|0);
 var $1433=HEAP32[(($1432)>>2)];
 var $1434=HEAP32[(($input_buffer)>>2)];
 var $1435=$input_buffer_size;
 var $$etemp$77$0=3;
 var $$etemp$77$1=0;
 var $1436=_clEnqueueMapBuffer($1433,$1434,1,$$etemp$77$0,$$etemp$77$1,0,$1435,0,0,0,$rc);
 var $1437=$1436;
 $input_array=$1437;
 var $1438=HEAP32[(($rc)>>2)];
 var $1439=($1438|0)!=0;
 if($1439){label=219;break;}else{label=220;break;}
 case 219: 
 var $1441=HEAP32[(($rc)>>2)];
 var $1442=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=1584,HEAP32[(((tempVarArgs)+(8))>>2)]=$1441,tempVarArgs)); STACKTOP=tempVarArgs;
 label=220;break;
 case 220: 
 HEAP32[(($rc)>>2)]=0;
 $i=0;
 label=221;break;
 case 221: 
 var $1445=$i;
 var $1446=HEAP32[(($ny)>>2)];
 var $1447=($1445>>>0)<($1446>>>0);
 if($1447){label=222;break;}else{label=228;break;}
 case 222: 
 $t=0;
 var $1449=$i;
 var $1450=HEAP32[(($row_index_array)>>2)];
 var $1451=(($1450+($1449<<2))|0);
 var $1452=HEAP32[(($1451)>>2)];
 $lb=$1452;
 var $1453=$i;
 var $1454=((($1453)+(1))|0);
 var $1455=HEAP32[(($row_index_array)>>2)];
 var $1456=(($1455+($1454<<2))|0);
 var $1457=HEAP32[(($1456)>>2)];
 $ub=$1457;
 var $1458=$lb;
 $j=$1458;
 label=223;break;
 case 223: 
 var $1460=$j;
 var $1461=$ub;
 var $1462=($1460>>>0)<($1461>>>0);
 if($1462){label=224;break;}else{label=226;break;}
 case 224: 
 var $1464=$j;
 var $1465=HEAP32[(($data_array)>>2)];
 var $1466=(($1465+($1464<<2))|0);
 var $1467=HEAPF32[(($1466)>>2)];
 var $1468=$j;
 var $1469=HEAP32[(($x_index_array)>>2)];
 var $1470=(($1469+($1468<<2))|0);
 var $1471=HEAP32[(($1470)>>2)];
 var $1472=$input_array;
 var $1473=(($1472+($1471<<2))|0);
 var $1474=HEAPF32[(($1473)>>2)];
 var $1475=($1467)*($1474);
 var $1476=$t;
 var $1477=($1476)+($1475);
 $t=$1477;
 label=225;break;
 case 225: 
 var $1479=$j;
 var $1480=((($1479)+(1))|0);
 $j=$1480;
 label=223;break;
 case 226: 
 var $1482=$t;
 var $1483=$i;
 var $1484=HEAP32[(($output_array_verify)>>2)];
 var $1485=(($1484+($1483<<2))|0);
 HEAPF32[(($1485)>>2)]=$1482;
 label=227;break;
 case 227: 
 var $1487=$i;
 var $1488=((($1487)+(1))|0);
 $i=$1488;
 label=221;break;
 case 228: 
 $sum=0;
 $diffsum=0;
 $i=0;
 label=229;break;
 case 229: 
 var $1491=$i;
 var $1492=HEAP32[(($ny)>>2)];
 var $1493=($1491>>>0)<($1492>>>0);
 if($1493){label=230;break;}else{label=238;break;}
 case 230: 
 var $1495=$i;
 var $1496=HEAP32[(($output_array_verify)>>2)];
 var $1497=(($1496+($1495<<2))|0);
 var $1498=HEAPF32[(($1497)>>2)];
 $a=$1498;
 var $1499=$i;
 var $1500=$output_array;
 var $1501=(($1500+($1499<<2))|0);
 var $1502=HEAPF32[(($1501)>>2)];
 $b=$1502;
 var $1503=$a;
 var $1504=$1503;
 $abs_a=$1504;
 var $1505=$a;
 var $1506=$1505;
 var $1507=$b;
 var $1508=$1507;
 var $1509=($1506)-($1508);
 $delta=$1509;
 var $1510=$abs_a;
 var $1511=$1510<0;
 if($1511){label=231;break;}else{label=232;break;}
 case 231: 
 var $1513=$abs_a;
 var $1514=((-.0))-($1513);
 var $1518=$1514;label=233;break;
 case 232: 
 var $1516=$abs_a;
 var $1518=$1516;label=233;break;
 case 233: 
 var $1518;
 $abs_a=$1518;
 var $1519=$delta;
 var $1520=$1519<0;
 if($1520){label=234;break;}else{label=235;break;}
 case 234: 
 var $1522=$delta;
 var $1523=((-.0))-($1522);
 var $1527=$1523;label=236;break;
 case 235: 
 var $1525=$delta;
 var $1527=$1525;label=236;break;
 case 236: 
 var $1527;
 $delta=$1527;
 var $1528=$abs_a;
 var $1529=$sum;
 var $1530=($1529)+($1528);
 $sum=$1530;
 var $1531=$delta;
 var $1532=$diffsum;
 var $1533=($1532)+($1531);
 $diffsum=$1533;
 label=237;break;
 case 237: 
 var $1535=$i;
 var $1536=((($1535)+(1))|0);
 $i=$1536;
 label=229;break;
 case 238: 
 var $1538=$diffsum;
 var $1539=$sum;
 var $1540=($1538)/($1539);
 var $1541=_printf(920,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$1540,tempVarArgs)); STACKTOP=tempVarArgs;
 var $1542=$diffsum;
 var $1543=$sum;
 var $1544=($1542)/($1543);
 var $1545=$1544>(0.0001);
 if($1545){label=239;break;}else{label=240;break;}
 case 239: 
 HEAP32[(($rc)>>2)]=-1;
 label=240;break;
 case 240: 
 var $1548=HEAP32[((400)>>2)];
 var $1549=_printf(904,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1548,tempVarArgs)); STACKTOP=tempVarArgs;
 var $1550=HEAP32[(($rc)>>2)];
 $retval=$1550;
 var $1551=$ddex;
 var $1552=$pdex;
 var $1553=HEAP32[(($platform)>>2)];
 var $1554=(($1553+((($1552)*(28))&-1))|0);
 var $1555=(($1554+12)|0);
 var $1556=HEAP32[(($1555)>>2)];
 var $1557=(($1556+((($1551)*(24))&-1))|0);
 var $1558=(($1557+16)|0);
 var $1559=HEAP32[(($1558)>>2)];
 var $1560=HEAP32[(($input_buffer)>>2)];
 var $1561=$input_array;
 var $1562=$1561;
 var $1563=_clEnqueueUnmapMemObject($1559,$1560,$1562,0,0,0);
 HEAP32[(($rc)>>2)]=$1563;
 var $1564=HEAP32[(($rc)>>2)];
 var $1565=($1564|0)!=0;
 if($1565){label=241;break;}else{label=242;break;}
 case 241: 
 var $1567=HEAP32[(($rc)>>2)];
 var $1568=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=872,HEAP32[(((tempVarArgs)+(8))>>2)]=$1567,tempVarArgs)); STACKTOP=tempVarArgs;
 label=242;break;
 case 242: 
 var $1570=$ddex;
 var $1571=$pdex;
 var $1572=HEAP32[(($platform)>>2)];
 var $1573=(($1572+((($1571)*(28))&-1))|0);
 var $1574=(($1573+12)|0);
 var $1575=HEAP32[(($1574)>>2)];
 var $1576=(($1575+((($1570)*(24))&-1))|0);
 var $1577=(($1576+16)|0);
 var $1578=HEAP32[(($1577)>>2)];
 var $1579=HEAP32[(($output_buffer)>>2)];
 var $1580=$output_array;
 var $1581=$1580;
 var $1582=_clEnqueueUnmapMemObject($1578,$1579,$1581,0,0,0);
 HEAP32[(($rc)>>2)]=$1582;
 var $1583=HEAP32[(($rc)>>2)];
 var $1584=($1583|0)!=0;
 if($1584){label=243;break;}else{label=244;break;}
 case 243: 
 var $1586=HEAP32[(($rc)>>2)];
 var $1587=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=840,HEAP32[(((tempVarArgs)+(8))>>2)]=$1586,tempVarArgs)); STACKTOP=tempVarArgs;
 label=244;break;
 case 244: 
 var $1589=$ddex;
 var $1590=$pdex;
 var $1591=HEAP32[(($platform)>>2)];
 var $1592=(($1591+((($1590)*(28))&-1))|0);
 var $1593=(($1592+12)|0);
 var $1594=HEAP32[(($1593)>>2)];
 var $1595=(($1594+((($1589)*(24))&-1))|0);
 var $1596=(($1595+16)|0);
 var $1597=HEAP32[(($1596)>>2)];
 var $1598=_clFinish($1597);
 HEAP32[(($rc)>>2)]=$1598;
 var $1599=HEAP32[(($rc)>>2)];
 var $1600=($1599|0)!=0;
 if($1600){label=245;break;}else{label=246;break;}
 case 245: 
 var $1602=HEAP32[(($rc)>>2)];
 var $1603=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=816,HEAP32[(((tempVarArgs)+(8))>>2)]=$1602,tempVarArgs)); STACKTOP=tempVarArgs;
 label=246;break;
 case 246: 
 var $1605=(($events)|0);
 var $1606=HEAP32[(($1605)>>2)];
 var $1607=_clReleaseEvent($1606);
 HEAP32[(($rc)>>2)]=$1607;
 var $1608=HEAP32[(($rc)>>2)];
 var $1609=($1608|0)!=0;
 if($1609){label=247;break;}else{label=248;break;}
 case 247: 
 var $1611=HEAP32[(($rc)>>2)];
 var $1612=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=792,HEAP32[(((tempVarArgs)+(8))>>2)]=$1611,tempVarArgs)); STACKTOP=tempVarArgs;
 label=248;break;
 case 248: 
 var $1614=(($events+4)|0);
 var $1615=HEAP32[(($1614)>>2)];
 var $1616=_clReleaseEvent($1615);
 HEAP32[(($rc)>>2)]=$1616;
 var $1617=HEAP32[(($rc)>>2)];
 var $1618=($1617|0)!=0;
 if($1618){label=249;break;}else{label=250;break;}
 case 249: 
 var $1620=HEAP32[(($rc)>>2)];
 var $1621=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=768,HEAP32[(((tempVarArgs)+(8))>>2)]=$1620,tempVarArgs)); STACKTOP=tempVarArgs;
 label=250;break;
 case 250: 
 var $1623=HEAP32[(($input_buffer)>>2)];
 var $1624=_clReleaseMemObject($1623);
 HEAP32[(($rc)>>2)]=$1624;
 var $1625=HEAP32[(($rc)>>2)];
 var $1626=($1625|0)!=0;
 if($1626){label=251;break;}else{label=252;break;}
 case 251: 
 var $1628=HEAP32[(($rc)>>2)];
 var $1629=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=736,HEAP32[(((tempVarArgs)+(8))>>2)]=$1628,tempVarArgs)); STACKTOP=tempVarArgs;
 label=252;break;
 case 252: 
 var $1631=HEAP32[(($matrix_buffer)>>2)];
 var $1632=_clReleaseMemObject($1631);
 HEAP32[(($rc)>>2)]=$1632;
 var $1633=HEAP32[(($rc)>>2)];
 var $1634=($1633|0)!=0;
 if($1634){label=253;break;}else{label=254;break;}
 case 253: 
 var $1636=HEAP32[(($rc)>>2)];
 var $1637=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=704,HEAP32[(((tempVarArgs)+(8))>>2)]=$1636,tempVarArgs)); STACKTOP=tempVarArgs;
 label=254;break;
 case 254: 
 var $1639=HEAP32[(($output_buffer)>>2)];
 var $1640=_clReleaseMemObject($1639);
 HEAP32[(($rc)>>2)]=$1640;
 var $1641=HEAP32[(($rc)>>2)];
 var $1642=($1641|0)!=0;
 if($1642){label=255;break;}else{label=256;break;}
 case 255: 
 var $1644=HEAP32[(($rc)>>2)];
 var $1645=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=592,HEAP32[(((tempVarArgs)+(8))>>2)]=$1644,tempVarArgs)); STACKTOP=tempVarArgs;
 label=256;break;
 case 256: 
 var $1647=$ddex;
 var $1648=$pdex;
 var $1649=HEAP32[(($platform)>>2)];
 var $1650=(($1649+((($1648)*(28))&-1))|0);
 var $1651=(($1650+12)|0);
 var $1652=HEAP32[(($1651)>>2)];
 var $1653=(($1652+((($1647)*(24))&-1))|0);
 var $1654=(($1653+16)|0);
 var $1655=HEAP32[(($1654)>>2)];
 var $1656=_clReleaseCommandQueue($1655);
 HEAP32[(($rc)>>2)]=$1656;
 var $1657=HEAP32[(($rc)>>2)];
 var $1658=($1657|0)!=0;
 if($1658){label=257;break;}else{label=258;break;}
 case 257: 
 var $1660=HEAP32[(($rc)>>2)];
 var $1661=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=568,HEAP32[(((tempVarArgs)+(8))>>2)]=$1660,tempVarArgs)); STACKTOP=tempVarArgs;
 label=258;break;
 case 258: 
 var $1663=$pdex;
 var $1664=HEAP32[(($platform)>>2)];
 var $1665=(($1664+((($1663)*(28))&-1))|0);
 var $1666=(($1665+24)|0);
 var $1667=HEAP32[(($1666)>>2)];
 var $1668=_clReleaseKernel($1667);
 HEAP32[(($rc)>>2)]=$1668;
 var $1669=HEAP32[(($rc)>>2)];
 var $1670=($1669|0)!=0;
 if($1670){label=259;break;}else{label=260;break;}
 case 259: 
 var $1672=HEAP32[(($rc)>>2)];
 var $1673=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=552,HEAP32[(((tempVarArgs)+(8))>>2)]=$1672,tempVarArgs)); STACKTOP=tempVarArgs;
 label=260;break;
 case 260: 
 var $1675=$pdex;
 var $1676=HEAP32[(($platform)>>2)];
 var $1677=(($1676+((($1675)*(28))&-1))|0);
 var $1678=(($1677+20)|0);
 var $1679=HEAP32[(($1678)>>2)];
 var $1680=_clReleaseProgram($1679);
 HEAP32[(($rc)>>2)]=$1680;
 var $1681=HEAP32[(($rc)>>2)];
 var $1682=($1681|0)!=0;
 if($1682){label=261;break;}else{label=262;break;}
 case 261: 
 var $1684=HEAP32[(($rc)>>2)];
 var $1685=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=528,HEAP32[(((tempVarArgs)+(8))>>2)]=$1684,tempVarArgs)); STACKTOP=tempVarArgs;
 label=262;break;
 case 262: 
 var $1687=$pdex;
 var $1688=HEAP32[(($platform)>>2)];
 var $1689=(($1688+((($1687)*(28))&-1))|0);
 var $1690=(($1689+16)|0);
 var $1691=HEAP32[(($1690)>>2)];
 var $1692=_clReleaseContext($1691);
 HEAP32[(($rc)>>2)]=$1692;
 var $1693=HEAP32[(($rc)>>2)];
 var $1694=($1693|0)!=0;
 if($1694){label=263;break;}else{label=264;break;}
 case 263: 
 var $1696=HEAP32[(($rc)>>2)];
 var $1697=_printf(3536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=504,HEAP32[(((tempVarArgs)+(8))>>2)]=$1696,tempVarArgs)); STACKTOP=tempVarArgs;
 label=264;break;
 case 264: 
 var $1699=HEAP32[(($data_array)>>2)];
 var $1700=$1699;
 _free($1700);
 var $1701=HEAP32[(($x_index_array)>>2)];
 var $1702=$1701;
 _free($1702);
 var $1703=HEAP32[(($row_index_array)>>2)];
 var $1704=$1703;
 _free($1704);
 var $1705=HEAP32[(($slab_startrow)>>2)];
 var $1706=$1705;
 _free($1706);
 var $1707=HEAP32[(($seg_workspace)>>2)];
 var $1708=$1707;
 _free($1708);
 var $1709=HEAP32[(($output_array_verify)>>2)];
 var $1710=$1709;
 _free($1710);
 var $1711=$ddex;
 var $1712=$pdex;
 var $1713=HEAP32[(($platform)>>2)];
 var $1714=(($1713+((($1712)*(28))&-1))|0);
 var $1715=(($1714+12)|0);
 var $1716=HEAP32[(($1715)>>2)];
 var $1717=(($1716+((($1711)*(24))&-1))|0);
 var $1718=(($1717+20)|0);
 var $1719=HEAP32[(($1718)>>2)];
 _free($1719);
 $i=0;
 label=265;break;
 case 265: 
 var $1721=$i;
 var $1722=HEAP32[(($num_platforms)>>2)];
 var $1723=($1721>>>0)<($1722>>>0);
 if($1723){label=266;break;}else{label=268;break;}
 case 266: 
 var $1725=$i;
 var $1726=HEAP32[(($platform)>>2)];
 var $1727=(($1726+((($1725)*(28))&-1))|0);
 var $1728=(($1727+12)|0);
 var $1729=HEAP32[(($1728)>>2)];
 var $1730=$1729;
 _free($1730);
 label=267;break;
 case 267: 
 var $1732=$i;
 var $1733=((($1732)+(1))|0);
 $i=$1733;
 label=265;break;
 case 268: 
 $i=0;
 label=269;break;
 case 269: 
 var $1736=$i;
 var $1737=HEAP32[(($num_platforms)>>2)];
 var $1738=($1736>>>0)<($1737>>>0);
 if($1738){label=270;break;}else{label=272;break;}
 case 270: 
 var $1740=$i;
 var $1741=HEAP32[(($platform)>>2)];
 var $1742=(($1741+((($1740)*(28))&-1))|0);
 var $1743=(($1742)|0);
 var $1744=HEAP32[(($1743)>>2)];
 _free($1744);
 label=271;break;
 case 271: 
 var $1746=$i;
 var $1747=((($1746)+(1))|0);
 $i=$1747;
 label=269;break;
 case 272: 
 var $1749=HEAP32[(($buffer)>>2)];
 var $1750=$1749;
 _free($1750);
 var $1751=HEAP32[(($platform)>>2)];
 var $1752=$1751;
 _free($1752);
 var $1753=$retval;
 STACKTOP=sp;return $1753;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
function _load_program_source($filename){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+80)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $statbuf=sp;
 var $fh;
 var $source;
 $2=$filename;
 var $3=$2;
 var $4=_fopen($3,4648);
 $fh=$4;
 var $5=$fh;
 var $6=($5|0)==0;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 var $8=HEAP32[((_stderr)>>2)];
 var $9=$2;
 var $10=_fprintf($8,4624,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$9,tempVarArgs)); STACKTOP=tempVarArgs;
 $1=0;
 label=6;break;
 case 3: 
 var $12=$2;
 var $13=_stat($12,$statbuf);
 var $14=(($statbuf+36)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=((($15)+(1))|0);
 var $17=_malloc($16);
 $source=$17;
 var $18=$source;
 var $19=($18|0)==0;
 if($19){label=4;break;}else{label=5;break;}
 case 4: 
 var $21=HEAP32[((_stderr)>>2)];
 var $22=_fprintf($21,4608,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $1=0;
 label=6;break;
 case 5: 
 var $24=$source;
 var $25=(($statbuf+36)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=$fh;
 var $28=_fread($24,$26,1,$27);
 var $29=(($statbuf+36)|0);
 var $30=HEAP32[(($29)>>2)];
 var $31=$source;
 var $32=(($31+$30)|0);
 HEAP8[($32)]=0;
 var $33=$source;
 $1=$33;
 label=6;break;
 case 6: 
 var $35=$1;
 STACKTOP=sp;return $35;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($bytes>>>0)<245;
 if($1){label=2;break;}else{label=78;break;}
 case 2: 
 var $3=($bytes>>>0)<11;
 if($3){var $8=16;label=4;break;}else{label=3;break;}
 case 3: 
 var $5=((($bytes)+(11))|0);
 var $6=$5&-8;
 var $8=$6;label=4;break;
 case 4: 
 var $8;
 var $9=$8>>>3;
 var $10=HEAP32[((4776)>>2)];
 var $11=$10>>>($9>>>0);
 var $12=$11&3;
 var $13=($12|0)==0;
 if($13){label=12;break;}else{label=5;break;}
 case 5: 
 var $15=$11&1;
 var $16=$15^1;
 var $17=((($16)+($9))|0);
 var $18=$17<<1;
 var $19=((4816+($18<<2))|0);
 var $20=$19;
 var $_sum111=((($18)+(2))|0);
 var $21=((4816+($_sum111<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+8)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($20|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6: 
 var $27=1<<$17;
 var $28=$27^-1;
 var $29=$10&$28;
 HEAP32[((4776)>>2)]=$29;
 label=11;break;
 case 7: 
 var $31=$24;
 var $32=HEAP32[((4792)>>2)];
 var $33=($31>>>0)<($32>>>0);
 if($33){label=10;break;}else{label=8;break;}
 case 8: 
 var $35=(($24+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==($22|0);
 if($37){label=9;break;}else{label=10;break;}
 case 9: 
 HEAP32[(($35)>>2)]=$20;
 HEAP32[(($21)>>2)]=$24;
 label=11;break;
 case 10: 
 _abort();
 throw "Reached an unreachable!";
 case 11: 
 var $40=$17<<3;
 var $41=$40|3;
 var $42=(($22+4)|0);
 HEAP32[(($42)>>2)]=$41;
 var $43=$22;
 var $_sum113114=$40|4;
 var $44=(($43+$_sum113114)|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46|1;
 HEAP32[(($45)>>2)]=$47;
 var $48=$23;
 var $mem_0=$48;label=341;break;
 case 12: 
 var $50=HEAP32[((4784)>>2)];
 var $51=($8>>>0)>($50>>>0);
 if($51){label=13;break;}else{var $nb_0=$8;label=160;break;}
 case 13: 
 var $53=($11|0)==0;
 if($53){label=27;break;}else{label=14;break;}
 case 14: 
 var $55=$11<<$9;
 var $56=2<<$9;
 var $57=(((-$56))|0);
 var $58=$56|$57;
 var $59=$55&$58;
 var $60=(((-$59))|0);
 var $61=$59&$60;
 var $62=((($61)-(1))|0);
 var $63=$62>>>12;
 var $64=$63&16;
 var $65=$62>>>($64>>>0);
 var $66=$65>>>5;
 var $67=$66&8;
 var $68=$67|$64;
 var $69=$65>>>($67>>>0);
 var $70=$69>>>2;
 var $71=$70&4;
 var $72=$68|$71;
 var $73=$69>>>($71>>>0);
 var $74=$73>>>1;
 var $75=$74&2;
 var $76=$72|$75;
 var $77=$73>>>($75>>>0);
 var $78=$77>>>1;
 var $79=$78&1;
 var $80=$76|$79;
 var $81=$77>>>($79>>>0);
 var $82=((($80)+($81))|0);
 var $83=$82<<1;
 var $84=((4816+($83<<2))|0);
 var $85=$84;
 var $_sum104=((($83)+(2))|0);
 var $86=((4816+($_sum104<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($85|0)==($89|0);
 if($90){label=15;break;}else{label=16;break;}
 case 15: 
 var $92=1<<$82;
 var $93=$92^-1;
 var $94=$10&$93;
 HEAP32[((4776)>>2)]=$94;
 label=20;break;
 case 16: 
 var $96=$89;
 var $97=HEAP32[((4792)>>2)];
 var $98=($96>>>0)<($97>>>0);
 if($98){label=19;break;}else{label=17;break;}
 case 17: 
 var $100=(($89+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==($87|0);
 if($102){label=18;break;}else{label=19;break;}
 case 18: 
 HEAP32[(($100)>>2)]=$85;
 HEAP32[(($86)>>2)]=$89;
 label=20;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 var $105=$82<<3;
 var $106=((($105)-($8))|0);
 var $107=$8|3;
 var $108=(($87+4)|0);
 HEAP32[(($108)>>2)]=$107;
 var $109=$87;
 var $110=(($109+$8)|0);
 var $111=$110;
 var $112=$106|1;
 var $_sum106107=$8|4;
 var $113=(($109+$_sum106107)|0);
 var $114=$113;
 HEAP32[(($114)>>2)]=$112;
 var $115=(($109+$105)|0);
 var $116=$115;
 HEAP32[(($116)>>2)]=$106;
 var $117=HEAP32[((4784)>>2)];
 var $118=($117|0)==0;
 if($118){label=26;break;}else{label=21;break;}
 case 21: 
 var $120=HEAP32[((4796)>>2)];
 var $121=$117>>>3;
 var $122=$121<<1;
 var $123=((4816+($122<<2))|0);
 var $124=$123;
 var $125=HEAP32[((4776)>>2)];
 var $126=1<<$121;
 var $127=$125&$126;
 var $128=($127|0)==0;
 if($128){label=22;break;}else{label=23;break;}
 case 22: 
 var $130=$125|$126;
 HEAP32[((4776)>>2)]=$130;
 var $_sum109_pre=((($122)+(2))|0);
 var $_pre=((4816+($_sum109_pre<<2))|0);
 var $F4_0=$124;var $_pre_phi=$_pre;label=25;break;
 case 23: 
 var $_sum110=((($122)+(2))|0);
 var $132=((4816+($_sum110<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=$133;
 var $135=HEAP32[((4792)>>2)];
 var $136=($134>>>0)<($135>>>0);
 if($136){label=24;break;}else{var $F4_0=$133;var $_pre_phi=$132;label=25;break;}
 case 24: 
 _abort();
 throw "Reached an unreachable!";
 case 25: 
 var $_pre_phi;
 var $F4_0;
 HEAP32[(($_pre_phi)>>2)]=$120;
 var $139=(($F4_0+12)|0);
 HEAP32[(($139)>>2)]=$120;
 var $140=(($120+8)|0);
 HEAP32[(($140)>>2)]=$F4_0;
 var $141=(($120+12)|0);
 HEAP32[(($141)>>2)]=$124;
 label=26;break;
 case 26: 
 HEAP32[((4784)>>2)]=$106;
 HEAP32[((4796)>>2)]=$111;
 var $143=$88;
 var $mem_0=$143;label=341;break;
 case 27: 
 var $145=HEAP32[((4780)>>2)];
 var $146=($145|0)==0;
 if($146){var $nb_0=$8;label=160;break;}else{label=28;break;}
 case 28: 
 var $148=(((-$145))|0);
 var $149=$145&$148;
 var $150=((($149)-(1))|0);
 var $151=$150>>>12;
 var $152=$151&16;
 var $153=$150>>>($152>>>0);
 var $154=$153>>>5;
 var $155=$154&8;
 var $156=$155|$152;
 var $157=$153>>>($155>>>0);
 var $158=$157>>>2;
 var $159=$158&4;
 var $160=$156|$159;
 var $161=$157>>>($159>>>0);
 var $162=$161>>>1;
 var $163=$162&2;
 var $164=$160|$163;
 var $165=$161>>>($163>>>0);
 var $166=$165>>>1;
 var $167=$166&1;
 var $168=$164|$167;
 var $169=$165>>>($167>>>0);
 var $170=((($168)+($169))|0);
 var $171=((5080+($170<<2))|0);
 var $172=HEAP32[(($171)>>2)];
 var $173=(($172+4)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=$174&-8;
 var $176=((($175)-($8))|0);
 var $t_0_i=$172;var $v_0_i=$172;var $rsize_0_i=$176;label=29;break;
 case 29: 
 var $rsize_0_i;
 var $v_0_i;
 var $t_0_i;
 var $178=(($t_0_i+16)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=($179|0)==0;
 if($180){label=30;break;}else{var $185=$179;label=31;break;}
 case 30: 
 var $182=(($t_0_i+20)|0);
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=32;break;}else{var $185=$183;label=31;break;}
 case 31: 
 var $185;
 var $186=(($185+4)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=$187&-8;
 var $189=((($188)-($8))|0);
 var $190=($189>>>0)<($rsize_0_i>>>0);
 var $_rsize_0_i=($190?$189:$rsize_0_i);
 var $_v_0_i=($190?$185:$v_0_i);
 var $t_0_i=$185;var $v_0_i=$_v_0_i;var $rsize_0_i=$_rsize_0_i;label=29;break;
 case 32: 
 var $192=$v_0_i;
 var $193=HEAP32[((4792)>>2)];
 var $194=($192>>>0)<($193>>>0);
 if($194){label=76;break;}else{label=33;break;}
 case 33: 
 var $196=(($192+$8)|0);
 var $197=$196;
 var $198=($192>>>0)<($196>>>0);
 if($198){label=34;break;}else{label=76;break;}
 case 34: 
 var $200=(($v_0_i+24)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($v_0_i+12)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=($203|0)==($v_0_i|0);
 if($204){label=40;break;}else{label=35;break;}
 case 35: 
 var $206=(($v_0_i+8)|0);
 var $207=HEAP32[(($206)>>2)];
 var $208=$207;
 var $209=($208>>>0)<($193>>>0);
 if($209){label=39;break;}else{label=36;break;}
 case 36: 
 var $211=(($207+12)|0);
 var $212=HEAP32[(($211)>>2)];
 var $213=($212|0)==($v_0_i|0);
 if($213){label=37;break;}else{label=39;break;}
 case 37: 
 var $215=(($203+8)|0);
 var $216=HEAP32[(($215)>>2)];
 var $217=($216|0)==($v_0_i|0);
 if($217){label=38;break;}else{label=39;break;}
 case 38: 
 HEAP32[(($211)>>2)]=$203;
 HEAP32[(($215)>>2)]=$207;
 var $R_1_i=$203;label=47;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $220=(($v_0_i+20)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=($221|0)==0;
 if($222){label=41;break;}else{var $R_0_i=$221;var $RP_0_i=$220;label=42;break;}
 case 41: 
 var $224=(($v_0_i+16)|0);
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){var $R_1_i=0;label=47;break;}else{var $R_0_i=$225;var $RP_0_i=$224;label=42;break;}
 case 42: 
 var $RP_0_i;
 var $R_0_i;
 var $227=(($R_0_i+20)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=($228|0)==0;
 if($229){label=43;break;}else{var $R_0_i=$228;var $RP_0_i=$227;label=42;break;}
 case 43: 
 var $231=(($R_0_i+16)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==0;
 if($233){label=44;break;}else{var $R_0_i=$232;var $RP_0_i=$231;label=42;break;}
 case 44: 
 var $235=$RP_0_i;
 var $236=($235>>>0)<($193>>>0);
 if($236){label=46;break;}else{label=45;break;}
 case 45: 
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=47;break;
 case 46: 
 _abort();
 throw "Reached an unreachable!";
 case 47: 
 var $R_1_i;
 var $240=($201|0)==0;
 if($240){label=67;break;}else{label=48;break;}
 case 48: 
 var $242=(($v_0_i+28)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=((5080+($243<<2))|0);
 var $245=HEAP32[(($244)>>2)];
 var $246=($v_0_i|0)==($245|0);
 if($246){label=49;break;}else{label=51;break;}
 case 49: 
 HEAP32[(($244)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=50;break;}else{label=57;break;}
 case 50: 
 var $248=HEAP32[(($242)>>2)];
 var $249=1<<$248;
 var $250=$249^-1;
 var $251=HEAP32[((4780)>>2)];
 var $252=$251&$250;
 HEAP32[((4780)>>2)]=$252;
 label=67;break;
 case 51: 
 var $254=$201;
 var $255=HEAP32[((4792)>>2)];
 var $256=($254>>>0)<($255>>>0);
 if($256){label=55;break;}else{label=52;break;}
 case 52: 
 var $258=(($201+16)|0);
 var $259=HEAP32[(($258)>>2)];
 var $260=($259|0)==($v_0_i|0);
 if($260){label=53;break;}else{label=54;break;}
 case 53: 
 HEAP32[(($258)>>2)]=$R_1_i;
 label=56;break;
 case 54: 
 var $263=(($201+20)|0);
 HEAP32[(($263)>>2)]=$R_1_i;
 label=56;break;
 case 55: 
 _abort();
 throw "Reached an unreachable!";
 case 56: 
 var $266=($R_1_i|0)==0;
 if($266){label=67;break;}else{label=57;break;}
 case 57: 
 var $268=$R_1_i;
 var $269=HEAP32[((4792)>>2)];
 var $270=($268>>>0)<($269>>>0);
 if($270){label=66;break;}else{label=58;break;}
 case 58: 
 var $272=(($R_1_i+24)|0);
 HEAP32[(($272)>>2)]=$201;
 var $273=(($v_0_i+16)|0);
 var $274=HEAP32[(($273)>>2)];
 var $275=($274|0)==0;
 if($275){label=62;break;}else{label=59;break;}
 case 59: 
 var $277=$274;
 var $278=HEAP32[((4792)>>2)];
 var $279=($277>>>0)<($278>>>0);
 if($279){label=61;break;}else{label=60;break;}
 case 60: 
 var $281=(($R_1_i+16)|0);
 HEAP32[(($281)>>2)]=$274;
 var $282=(($274+24)|0);
 HEAP32[(($282)>>2)]=$R_1_i;
 label=62;break;
 case 61: 
 _abort();
 throw "Reached an unreachable!";
 case 62: 
 var $285=(($v_0_i+20)|0);
 var $286=HEAP32[(($285)>>2)];
 var $287=($286|0)==0;
 if($287){label=67;break;}else{label=63;break;}
 case 63: 
 var $289=$286;
 var $290=HEAP32[((4792)>>2)];
 var $291=($289>>>0)<($290>>>0);
 if($291){label=65;break;}else{label=64;break;}
 case 64: 
 var $293=(($R_1_i+20)|0);
 HEAP32[(($293)>>2)]=$286;
 var $294=(($286+24)|0);
 HEAP32[(($294)>>2)]=$R_1_i;
 label=67;break;
 case 65: 
 _abort();
 throw "Reached an unreachable!";
 case 66: 
 _abort();
 throw "Reached an unreachable!";
 case 67: 
 var $298=($rsize_0_i>>>0)<16;
 if($298){label=68;break;}else{label=69;break;}
 case 68: 
 var $300=((($rsize_0_i)+($8))|0);
 var $301=$300|3;
 var $302=(($v_0_i+4)|0);
 HEAP32[(($302)>>2)]=$301;
 var $_sum4_i=((($300)+(4))|0);
 var $303=(($192+$_sum4_i)|0);
 var $304=$303;
 var $305=HEAP32[(($304)>>2)];
 var $306=$305|1;
 HEAP32[(($304)>>2)]=$306;
 label=77;break;
 case 69: 
 var $308=$8|3;
 var $309=(($v_0_i+4)|0);
 HEAP32[(($309)>>2)]=$308;
 var $310=$rsize_0_i|1;
 var $_sum_i137=$8|4;
 var $311=(($192+$_sum_i137)|0);
 var $312=$311;
 HEAP32[(($312)>>2)]=$310;
 var $_sum1_i=((($rsize_0_i)+($8))|0);
 var $313=(($192+$_sum1_i)|0);
 var $314=$313;
 HEAP32[(($314)>>2)]=$rsize_0_i;
 var $315=HEAP32[((4784)>>2)];
 var $316=($315|0)==0;
 if($316){label=75;break;}else{label=70;break;}
 case 70: 
 var $318=HEAP32[((4796)>>2)];
 var $319=$315>>>3;
 var $320=$319<<1;
 var $321=((4816+($320<<2))|0);
 var $322=$321;
 var $323=HEAP32[((4776)>>2)];
 var $324=1<<$319;
 var $325=$323&$324;
 var $326=($325|0)==0;
 if($326){label=71;break;}else{label=72;break;}
 case 71: 
 var $328=$323|$324;
 HEAP32[((4776)>>2)]=$328;
 var $_sum2_pre_i=((($320)+(2))|0);
 var $_pre_i=((4816+($_sum2_pre_i<<2))|0);
 var $F1_0_i=$322;var $_pre_phi_i=$_pre_i;label=74;break;
 case 72: 
 var $_sum3_i=((($320)+(2))|0);
 var $330=((4816+($_sum3_i<<2))|0);
 var $331=HEAP32[(($330)>>2)];
 var $332=$331;
 var $333=HEAP32[((4792)>>2)];
 var $334=($332>>>0)<($333>>>0);
 if($334){label=73;break;}else{var $F1_0_i=$331;var $_pre_phi_i=$330;label=74;break;}
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $_pre_phi_i;
 var $F1_0_i;
 HEAP32[(($_pre_phi_i)>>2)]=$318;
 var $337=(($F1_0_i+12)|0);
 HEAP32[(($337)>>2)]=$318;
 var $338=(($318+8)|0);
 HEAP32[(($338)>>2)]=$F1_0_i;
 var $339=(($318+12)|0);
 HEAP32[(($339)>>2)]=$322;
 label=75;break;
 case 75: 
 HEAP32[((4784)>>2)]=$rsize_0_i;
 HEAP32[((4796)>>2)]=$197;
 label=77;break;
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $342=(($v_0_i+8)|0);
 var $343=$342;
 var $344=($342|0)==0;
 if($344){var $nb_0=$8;label=160;break;}else{var $mem_0=$343;label=341;break;}
 case 78: 
 var $346=($bytes>>>0)>4294967231;
 if($346){var $nb_0=-1;label=160;break;}else{label=79;break;}
 case 79: 
 var $348=((($bytes)+(11))|0);
 var $349=$348&-8;
 var $350=HEAP32[((4780)>>2)];
 var $351=($350|0)==0;
 if($351){var $nb_0=$349;label=160;break;}else{label=80;break;}
 case 80: 
 var $353=(((-$349))|0);
 var $354=$348>>>8;
 var $355=($354|0)==0;
 if($355){var $idx_0_i=0;label=83;break;}else{label=81;break;}
 case 81: 
 var $357=($349>>>0)>16777215;
 if($357){var $idx_0_i=31;label=83;break;}else{label=82;break;}
 case 82: 
 var $359=((($354)+(1048320))|0);
 var $360=$359>>>16;
 var $361=$360&8;
 var $362=$354<<$361;
 var $363=((($362)+(520192))|0);
 var $364=$363>>>16;
 var $365=$364&4;
 var $366=$365|$361;
 var $367=$362<<$365;
 var $368=((($367)+(245760))|0);
 var $369=$368>>>16;
 var $370=$369&2;
 var $371=$366|$370;
 var $372=(((14)-($371))|0);
 var $373=$367<<$370;
 var $374=$373>>>15;
 var $375=((($372)+($374))|0);
 var $376=$375<<1;
 var $377=((($375)+(7))|0);
 var $378=$349>>>($377>>>0);
 var $379=$378&1;
 var $380=$379|$376;
 var $idx_0_i=$380;label=83;break;
 case 83: 
 var $idx_0_i;
 var $382=((5080+($idx_0_i<<2))|0);
 var $383=HEAP32[(($382)>>2)];
 var $384=($383|0)==0;
 if($384){var $v_2_i=0;var $rsize_2_i=$353;var $t_1_i=0;label=90;break;}else{label=84;break;}
 case 84: 
 var $386=($idx_0_i|0)==31;
 if($386){var $391=0;label=86;break;}else{label=85;break;}
 case 85: 
 var $388=$idx_0_i>>>1;
 var $389=(((25)-($388))|0);
 var $391=$389;label=86;break;
 case 86: 
 var $391;
 var $392=$349<<$391;
 var $v_0_i118=0;var $rsize_0_i117=$353;var $t_0_i116=$383;var $sizebits_0_i=$392;var $rst_0_i=0;label=87;break;
 case 87: 
 var $rst_0_i;
 var $sizebits_0_i;
 var $t_0_i116;
 var $rsize_0_i117;
 var $v_0_i118;
 var $394=(($t_0_i116+4)|0);
 var $395=HEAP32[(($394)>>2)];
 var $396=$395&-8;
 var $397=((($396)-($349))|0);
 var $398=($397>>>0)<($rsize_0_i117>>>0);
 if($398){label=88;break;}else{var $v_1_i=$v_0_i118;var $rsize_1_i=$rsize_0_i117;label=89;break;}
 case 88: 
 var $400=($396|0)==($349|0);
 if($400){var $v_2_i=$t_0_i116;var $rsize_2_i=$397;var $t_1_i=$t_0_i116;label=90;break;}else{var $v_1_i=$t_0_i116;var $rsize_1_i=$397;label=89;break;}
 case 89: 
 var $rsize_1_i;
 var $v_1_i;
 var $402=(($t_0_i116+20)|0);
 var $403=HEAP32[(($402)>>2)];
 var $404=$sizebits_0_i>>>31;
 var $405=(($t_0_i116+16+($404<<2))|0);
 var $406=HEAP32[(($405)>>2)];
 var $407=($403|0)==0;
 var $408=($403|0)==($406|0);
 var $or_cond_i=$407|$408;
 var $rst_1_i=($or_cond_i?$rst_0_i:$403);
 var $409=($406|0)==0;
 var $410=$sizebits_0_i<<1;
 if($409){var $v_2_i=$v_1_i;var $rsize_2_i=$rsize_1_i;var $t_1_i=$rst_1_i;label=90;break;}else{var $v_0_i118=$v_1_i;var $rsize_0_i117=$rsize_1_i;var $t_0_i116=$406;var $sizebits_0_i=$410;var $rst_0_i=$rst_1_i;label=87;break;}
 case 90: 
 var $t_1_i;
 var $rsize_2_i;
 var $v_2_i;
 var $411=($t_1_i|0)==0;
 var $412=($v_2_i|0)==0;
 var $or_cond21_i=$411&$412;
 if($or_cond21_i){label=91;break;}else{var $t_2_ph_i=$t_1_i;label=93;break;}
 case 91: 
 var $414=2<<$idx_0_i;
 var $415=(((-$414))|0);
 var $416=$414|$415;
 var $417=$350&$416;
 var $418=($417|0)==0;
 if($418){var $nb_0=$349;label=160;break;}else{label=92;break;}
 case 92: 
 var $420=(((-$417))|0);
 var $421=$417&$420;
 var $422=((($421)-(1))|0);
 var $423=$422>>>12;
 var $424=$423&16;
 var $425=$422>>>($424>>>0);
 var $426=$425>>>5;
 var $427=$426&8;
 var $428=$427|$424;
 var $429=$425>>>($427>>>0);
 var $430=$429>>>2;
 var $431=$430&4;
 var $432=$428|$431;
 var $433=$429>>>($431>>>0);
 var $434=$433>>>1;
 var $435=$434&2;
 var $436=$432|$435;
 var $437=$433>>>($435>>>0);
 var $438=$437>>>1;
 var $439=$438&1;
 var $440=$436|$439;
 var $441=$437>>>($439>>>0);
 var $442=((($440)+($441))|0);
 var $443=((5080+($442<<2))|0);
 var $444=HEAP32[(($443)>>2)];
 var $t_2_ph_i=$444;label=93;break;
 case 93: 
 var $t_2_ph_i;
 var $445=($t_2_ph_i|0)==0;
 if($445){var $rsize_3_lcssa_i=$rsize_2_i;var $v_3_lcssa_i=$v_2_i;label=96;break;}else{var $t_228_i=$t_2_ph_i;var $rsize_329_i=$rsize_2_i;var $v_330_i=$v_2_i;label=94;break;}
 case 94: 
 var $v_330_i;
 var $rsize_329_i;
 var $t_228_i;
 var $446=(($t_228_i+4)|0);
 var $447=HEAP32[(($446)>>2)];
 var $448=$447&-8;
 var $449=((($448)-($349))|0);
 var $450=($449>>>0)<($rsize_329_i>>>0);
 var $_rsize_3_i=($450?$449:$rsize_329_i);
 var $t_2_v_3_i=($450?$t_228_i:$v_330_i);
 var $451=(($t_228_i+16)|0);
 var $452=HEAP32[(($451)>>2)];
 var $453=($452|0)==0;
 if($453){label=95;break;}else{var $t_228_i=$452;var $rsize_329_i=$_rsize_3_i;var $v_330_i=$t_2_v_3_i;label=94;break;}
 case 95: 
 var $454=(($t_228_i+20)|0);
 var $455=HEAP32[(($454)>>2)];
 var $456=($455|0)==0;
 if($456){var $rsize_3_lcssa_i=$_rsize_3_i;var $v_3_lcssa_i=$t_2_v_3_i;label=96;break;}else{var $t_228_i=$455;var $rsize_329_i=$_rsize_3_i;var $v_330_i=$t_2_v_3_i;label=94;break;}
 case 96: 
 var $v_3_lcssa_i;
 var $rsize_3_lcssa_i;
 var $457=($v_3_lcssa_i|0)==0;
 if($457){var $nb_0=$349;label=160;break;}else{label=97;break;}
 case 97: 
 var $459=HEAP32[((4784)>>2)];
 var $460=((($459)-($349))|0);
 var $461=($rsize_3_lcssa_i>>>0)<($460>>>0);
 if($461){label=98;break;}else{var $nb_0=$349;label=160;break;}
 case 98: 
 var $463=$v_3_lcssa_i;
 var $464=HEAP32[((4792)>>2)];
 var $465=($463>>>0)<($464>>>0);
 if($465){label=158;break;}else{label=99;break;}
 case 99: 
 var $467=(($463+$349)|0);
 var $468=$467;
 var $469=($463>>>0)<($467>>>0);
 if($469){label=100;break;}else{label=158;break;}
 case 100: 
 var $471=(($v_3_lcssa_i+24)|0);
 var $472=HEAP32[(($471)>>2)];
 var $473=(($v_3_lcssa_i+12)|0);
 var $474=HEAP32[(($473)>>2)];
 var $475=($474|0)==($v_3_lcssa_i|0);
 if($475){label=106;break;}else{label=101;break;}
 case 101: 
 var $477=(($v_3_lcssa_i+8)|0);
 var $478=HEAP32[(($477)>>2)];
 var $479=$478;
 var $480=($479>>>0)<($464>>>0);
 if($480){label=105;break;}else{label=102;break;}
 case 102: 
 var $482=(($478+12)|0);
 var $483=HEAP32[(($482)>>2)];
 var $484=($483|0)==($v_3_lcssa_i|0);
 if($484){label=103;break;}else{label=105;break;}
 case 103: 
 var $486=(($474+8)|0);
 var $487=HEAP32[(($486)>>2)];
 var $488=($487|0)==($v_3_lcssa_i|0);
 if($488){label=104;break;}else{label=105;break;}
 case 104: 
 HEAP32[(($482)>>2)]=$474;
 HEAP32[(($486)>>2)]=$478;
 var $R_1_i122=$474;label=113;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 var $491=(($v_3_lcssa_i+20)|0);
 var $492=HEAP32[(($491)>>2)];
 var $493=($492|0)==0;
 if($493){label=107;break;}else{var $R_0_i120=$492;var $RP_0_i119=$491;label=108;break;}
 case 107: 
 var $495=(($v_3_lcssa_i+16)|0);
 var $496=HEAP32[(($495)>>2)];
 var $497=($496|0)==0;
 if($497){var $R_1_i122=0;label=113;break;}else{var $R_0_i120=$496;var $RP_0_i119=$495;label=108;break;}
 case 108: 
 var $RP_0_i119;
 var $R_0_i120;
 var $498=(($R_0_i120+20)|0);
 var $499=HEAP32[(($498)>>2)];
 var $500=($499|0)==0;
 if($500){label=109;break;}else{var $R_0_i120=$499;var $RP_0_i119=$498;label=108;break;}
 case 109: 
 var $502=(($R_0_i120+16)|0);
 var $503=HEAP32[(($502)>>2)];
 var $504=($503|0)==0;
 if($504){label=110;break;}else{var $R_0_i120=$503;var $RP_0_i119=$502;label=108;break;}
 case 110: 
 var $506=$RP_0_i119;
 var $507=($506>>>0)<($464>>>0);
 if($507){label=112;break;}else{label=111;break;}
 case 111: 
 HEAP32[(($RP_0_i119)>>2)]=0;
 var $R_1_i122=$R_0_i120;label=113;break;
 case 112: 
 _abort();
 throw "Reached an unreachable!";
 case 113: 
 var $R_1_i122;
 var $511=($472|0)==0;
 if($511){label=133;break;}else{label=114;break;}
 case 114: 
 var $513=(($v_3_lcssa_i+28)|0);
 var $514=HEAP32[(($513)>>2)];
 var $515=((5080+($514<<2))|0);
 var $516=HEAP32[(($515)>>2)];
 var $517=($v_3_lcssa_i|0)==($516|0);
 if($517){label=115;break;}else{label=117;break;}
 case 115: 
 HEAP32[(($515)>>2)]=$R_1_i122;
 var $cond_i123=($R_1_i122|0)==0;
 if($cond_i123){label=116;break;}else{label=123;break;}
 case 116: 
 var $519=HEAP32[(($513)>>2)];
 var $520=1<<$519;
 var $521=$520^-1;
 var $522=HEAP32[((4780)>>2)];
 var $523=$522&$521;
 HEAP32[((4780)>>2)]=$523;
 label=133;break;
 case 117: 
 var $525=$472;
 var $526=HEAP32[((4792)>>2)];
 var $527=($525>>>0)<($526>>>0);
 if($527){label=121;break;}else{label=118;break;}
 case 118: 
 var $529=(($472+16)|0);
 var $530=HEAP32[(($529)>>2)];
 var $531=($530|0)==($v_3_lcssa_i|0);
 if($531){label=119;break;}else{label=120;break;}
 case 119: 
 HEAP32[(($529)>>2)]=$R_1_i122;
 label=122;break;
 case 120: 
 var $534=(($472+20)|0);
 HEAP32[(($534)>>2)]=$R_1_i122;
 label=122;break;
 case 121: 
 _abort();
 throw "Reached an unreachable!";
 case 122: 
 var $537=($R_1_i122|0)==0;
 if($537){label=133;break;}else{label=123;break;}
 case 123: 
 var $539=$R_1_i122;
 var $540=HEAP32[((4792)>>2)];
 var $541=($539>>>0)<($540>>>0);
 if($541){label=132;break;}else{label=124;break;}
 case 124: 
 var $543=(($R_1_i122+24)|0);
 HEAP32[(($543)>>2)]=$472;
 var $544=(($v_3_lcssa_i+16)|0);
 var $545=HEAP32[(($544)>>2)];
 var $546=($545|0)==0;
 if($546){label=128;break;}else{label=125;break;}
 case 125: 
 var $548=$545;
 var $549=HEAP32[((4792)>>2)];
 var $550=($548>>>0)<($549>>>0);
 if($550){label=127;break;}else{label=126;break;}
 case 126: 
 var $552=(($R_1_i122+16)|0);
 HEAP32[(($552)>>2)]=$545;
 var $553=(($545+24)|0);
 HEAP32[(($553)>>2)]=$R_1_i122;
 label=128;break;
 case 127: 
 _abort();
 throw "Reached an unreachable!";
 case 128: 
 var $556=(($v_3_lcssa_i+20)|0);
 var $557=HEAP32[(($556)>>2)];
 var $558=($557|0)==0;
 if($558){label=133;break;}else{label=129;break;}
 case 129: 
 var $560=$557;
 var $561=HEAP32[((4792)>>2)];
 var $562=($560>>>0)<($561>>>0);
 if($562){label=131;break;}else{label=130;break;}
 case 130: 
 var $564=(($R_1_i122+20)|0);
 HEAP32[(($564)>>2)]=$557;
 var $565=(($557+24)|0);
 HEAP32[(($565)>>2)]=$R_1_i122;
 label=133;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $569=($rsize_3_lcssa_i>>>0)<16;
 if($569){label=134;break;}else{label=135;break;}
 case 134: 
 var $571=((($rsize_3_lcssa_i)+($349))|0);
 var $572=$571|3;
 var $573=(($v_3_lcssa_i+4)|0);
 HEAP32[(($573)>>2)]=$572;
 var $_sum19_i=((($571)+(4))|0);
 var $574=(($463+$_sum19_i)|0);
 var $575=$574;
 var $576=HEAP32[(($575)>>2)];
 var $577=$576|1;
 HEAP32[(($575)>>2)]=$577;
 label=159;break;
 case 135: 
 var $579=$349|3;
 var $580=(($v_3_lcssa_i+4)|0);
 HEAP32[(($580)>>2)]=$579;
 var $581=$rsize_3_lcssa_i|1;
 var $_sum_i125136=$349|4;
 var $582=(($463+$_sum_i125136)|0);
 var $583=$582;
 HEAP32[(($583)>>2)]=$581;
 var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
 var $584=(($463+$_sum1_i126)|0);
 var $585=$584;
 HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
 var $586=$rsize_3_lcssa_i>>>3;
 var $587=($rsize_3_lcssa_i>>>0)<256;
 if($587){label=136;break;}else{label=141;break;}
 case 136: 
 var $589=$586<<1;
 var $590=((4816+($589<<2))|0);
 var $591=$590;
 var $592=HEAP32[((4776)>>2)];
 var $593=1<<$586;
 var $594=$592&$593;
 var $595=($594|0)==0;
 if($595){label=137;break;}else{label=138;break;}
 case 137: 
 var $597=$592|$593;
 HEAP32[((4776)>>2)]=$597;
 var $_sum15_pre_i=((($589)+(2))|0);
 var $_pre_i127=((4816+($_sum15_pre_i<<2))|0);
 var $F5_0_i=$591;var $_pre_phi_i128=$_pre_i127;label=140;break;
 case 138: 
 var $_sum18_i=((($589)+(2))|0);
 var $599=((4816+($_sum18_i<<2))|0);
 var $600=HEAP32[(($599)>>2)];
 var $601=$600;
 var $602=HEAP32[((4792)>>2)];
 var $603=($601>>>0)<($602>>>0);
 if($603){label=139;break;}else{var $F5_0_i=$600;var $_pre_phi_i128=$599;label=140;break;}
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 var $_pre_phi_i128;
 var $F5_0_i;
 HEAP32[(($_pre_phi_i128)>>2)]=$468;
 var $606=(($F5_0_i+12)|0);
 HEAP32[(($606)>>2)]=$468;
 var $_sum16_i=((($349)+(8))|0);
 var $607=(($463+$_sum16_i)|0);
 var $608=$607;
 HEAP32[(($608)>>2)]=$F5_0_i;
 var $_sum17_i=((($349)+(12))|0);
 var $609=(($463+$_sum17_i)|0);
 var $610=$609;
 HEAP32[(($610)>>2)]=$591;
 label=159;break;
 case 141: 
 var $612=$467;
 var $613=$rsize_3_lcssa_i>>>8;
 var $614=($613|0)==0;
 if($614){var $I7_0_i=0;label=144;break;}else{label=142;break;}
 case 142: 
 var $616=($rsize_3_lcssa_i>>>0)>16777215;
 if($616){var $I7_0_i=31;label=144;break;}else{label=143;break;}
 case 143: 
 var $618=((($613)+(1048320))|0);
 var $619=$618>>>16;
 var $620=$619&8;
 var $621=$613<<$620;
 var $622=((($621)+(520192))|0);
 var $623=$622>>>16;
 var $624=$623&4;
 var $625=$624|$620;
 var $626=$621<<$624;
 var $627=((($626)+(245760))|0);
 var $628=$627>>>16;
 var $629=$628&2;
 var $630=$625|$629;
 var $631=(((14)-($630))|0);
 var $632=$626<<$629;
 var $633=$632>>>15;
 var $634=((($631)+($633))|0);
 var $635=$634<<1;
 var $636=((($634)+(7))|0);
 var $637=$rsize_3_lcssa_i>>>($636>>>0);
 var $638=$637&1;
 var $639=$638|$635;
 var $I7_0_i=$639;label=144;break;
 case 144: 
 var $I7_0_i;
 var $641=((5080+($I7_0_i<<2))|0);
 var $_sum2_i=((($349)+(28))|0);
 var $642=(($463+$_sum2_i)|0);
 var $643=$642;
 HEAP32[(($643)>>2)]=$I7_0_i;
 var $_sum3_i129=((($349)+(16))|0);
 var $644=(($463+$_sum3_i129)|0);
 var $_sum4_i130=((($349)+(20))|0);
 var $645=(($463+$_sum4_i130)|0);
 var $646=$645;
 HEAP32[(($646)>>2)]=0;
 var $647=$644;
 HEAP32[(($647)>>2)]=0;
 var $648=HEAP32[((4780)>>2)];
 var $649=1<<$I7_0_i;
 var $650=$648&$649;
 var $651=($650|0)==0;
 if($651){label=145;break;}else{label=146;break;}
 case 145: 
 var $653=$648|$649;
 HEAP32[((4780)>>2)]=$653;
 HEAP32[(($641)>>2)]=$612;
 var $654=$641;
 var $_sum5_i=((($349)+(24))|0);
 var $655=(($463+$_sum5_i)|0);
 var $656=$655;
 HEAP32[(($656)>>2)]=$654;
 var $_sum6_i=((($349)+(12))|0);
 var $657=(($463+$_sum6_i)|0);
 var $658=$657;
 HEAP32[(($658)>>2)]=$612;
 var $_sum7_i=((($349)+(8))|0);
 var $659=(($463+$_sum7_i)|0);
 var $660=$659;
 HEAP32[(($660)>>2)]=$612;
 label=159;break;
 case 146: 
 var $662=HEAP32[(($641)>>2)];
 var $663=($I7_0_i|0)==31;
 if($663){var $668=0;label=148;break;}else{label=147;break;}
 case 147: 
 var $665=$I7_0_i>>>1;
 var $666=(((25)-($665))|0);
 var $668=$666;label=148;break;
 case 148: 
 var $668;
 var $669=$rsize_3_lcssa_i<<$668;
 var $K12_0_i=$669;var $T_0_i=$662;label=149;break;
 case 149: 
 var $T_0_i;
 var $K12_0_i;
 var $671=(($T_0_i+4)|0);
 var $672=HEAP32[(($671)>>2)];
 var $673=$672&-8;
 var $674=($673|0)==($rsize_3_lcssa_i|0);
 if($674){label=154;break;}else{label=150;break;}
 case 150: 
 var $676=$K12_0_i>>>31;
 var $677=(($T_0_i+16+($676<<2))|0);
 var $678=HEAP32[(($677)>>2)];
 var $679=($678|0)==0;
 var $680=$K12_0_i<<1;
 if($679){label=151;break;}else{var $K12_0_i=$680;var $T_0_i=$678;label=149;break;}
 case 151: 
 var $682=$677;
 var $683=HEAP32[((4792)>>2)];
 var $684=($682>>>0)<($683>>>0);
 if($684){label=153;break;}else{label=152;break;}
 case 152: 
 HEAP32[(($677)>>2)]=$612;
 var $_sum12_i=((($349)+(24))|0);
 var $686=(($463+$_sum12_i)|0);
 var $687=$686;
 HEAP32[(($687)>>2)]=$T_0_i;
 var $_sum13_i=((($349)+(12))|0);
 var $688=(($463+$_sum13_i)|0);
 var $689=$688;
 HEAP32[(($689)>>2)]=$612;
 var $_sum14_i=((($349)+(8))|0);
 var $690=(($463+$_sum14_i)|0);
 var $691=$690;
 HEAP32[(($691)>>2)]=$612;
 label=159;break;
 case 153: 
 _abort();
 throw "Reached an unreachable!";
 case 154: 
 var $694=(($T_0_i+8)|0);
 var $695=HEAP32[(($694)>>2)];
 var $696=$T_0_i;
 var $697=HEAP32[((4792)>>2)];
 var $698=($696>>>0)<($697>>>0);
 if($698){label=157;break;}else{label=155;break;}
 case 155: 
 var $700=$695;
 var $701=($700>>>0)<($697>>>0);
 if($701){label=157;break;}else{label=156;break;}
 case 156: 
 var $703=(($695+12)|0);
 HEAP32[(($703)>>2)]=$612;
 HEAP32[(($694)>>2)]=$612;
 var $_sum9_i=((($349)+(8))|0);
 var $704=(($463+$_sum9_i)|0);
 var $705=$704;
 HEAP32[(($705)>>2)]=$695;
 var $_sum10_i=((($349)+(12))|0);
 var $706=(($463+$_sum10_i)|0);
 var $707=$706;
 HEAP32[(($707)>>2)]=$T_0_i;
 var $_sum11_i=((($349)+(24))|0);
 var $708=(($463+$_sum11_i)|0);
 var $709=$708;
 HEAP32[(($709)>>2)]=0;
 label=159;break;
 case 157: 
 _abort();
 throw "Reached an unreachable!";
 case 158: 
 _abort();
 throw "Reached an unreachable!";
 case 159: 
 var $711=(($v_3_lcssa_i+8)|0);
 var $712=$711;
 var $713=($711|0)==0;
 if($713){var $nb_0=$349;label=160;break;}else{var $mem_0=$712;label=341;break;}
 case 160: 
 var $nb_0;
 var $714=HEAP32[((4784)>>2)];
 var $715=($nb_0>>>0)>($714>>>0);
 if($715){label=165;break;}else{label=161;break;}
 case 161: 
 var $717=((($714)-($nb_0))|0);
 var $718=HEAP32[((4796)>>2)];
 var $719=($717>>>0)>15;
 if($719){label=162;break;}else{label=163;break;}
 case 162: 
 var $721=$718;
 var $722=(($721+$nb_0)|0);
 var $723=$722;
 HEAP32[((4796)>>2)]=$723;
 HEAP32[((4784)>>2)]=$717;
 var $724=$717|1;
 var $_sum102=((($nb_0)+(4))|0);
 var $725=(($721+$_sum102)|0);
 var $726=$725;
 HEAP32[(($726)>>2)]=$724;
 var $727=(($721+$714)|0);
 var $728=$727;
 HEAP32[(($728)>>2)]=$717;
 var $729=$nb_0|3;
 var $730=(($718+4)|0);
 HEAP32[(($730)>>2)]=$729;
 label=164;break;
 case 163: 
 HEAP32[((4784)>>2)]=0;
 HEAP32[((4796)>>2)]=0;
 var $732=$714|3;
 var $733=(($718+4)|0);
 HEAP32[(($733)>>2)]=$732;
 var $734=$718;
 var $_sum101=((($714)+(4))|0);
 var $735=(($734+$_sum101)|0);
 var $736=$735;
 var $737=HEAP32[(($736)>>2)];
 var $738=$737|1;
 HEAP32[(($736)>>2)]=$738;
 label=164;break;
 case 164: 
 var $740=(($718+8)|0);
 var $741=$740;
 var $mem_0=$741;label=341;break;
 case 165: 
 var $743=HEAP32[((4788)>>2)];
 var $744=($nb_0>>>0)<($743>>>0);
 if($744){label=166;break;}else{label=167;break;}
 case 166: 
 var $746=((($743)-($nb_0))|0);
 HEAP32[((4788)>>2)]=$746;
 var $747=HEAP32[((4800)>>2)];
 var $748=$747;
 var $749=(($748+$nb_0)|0);
 var $750=$749;
 HEAP32[((4800)>>2)]=$750;
 var $751=$746|1;
 var $_sum=((($nb_0)+(4))|0);
 var $752=(($748+$_sum)|0);
 var $753=$752;
 HEAP32[(($753)>>2)]=$751;
 var $754=$nb_0|3;
 var $755=(($747+4)|0);
 HEAP32[(($755)>>2)]=$754;
 var $756=(($747+8)|0);
 var $757=$756;
 var $mem_0=$757;label=341;break;
 case 167: 
 var $759=HEAP32[((4728)>>2)];
 var $760=($759|0)==0;
 if($760){label=168;break;}else{label=171;break;}
 case 168: 
 var $762=_sysconf(30);
 var $763=((($762)-(1))|0);
 var $764=$763&$762;
 var $765=($764|0)==0;
 if($765){label=170;break;}else{label=169;break;}
 case 169: 
 _abort();
 throw "Reached an unreachable!";
 case 170: 
 HEAP32[((4736)>>2)]=$762;
 HEAP32[((4732)>>2)]=$762;
 HEAP32[((4740)>>2)]=-1;
 HEAP32[((4744)>>2)]=-1;
 HEAP32[((4748)>>2)]=0;
 HEAP32[((5220)>>2)]=0;
 var $767=_time(0);
 var $768=$767&-16;
 var $769=$768^1431655768;
 HEAP32[((4728)>>2)]=$769;
 label=171;break;
 case 171: 
 var $771=((($nb_0)+(48))|0);
 var $772=HEAP32[((4736)>>2)];
 var $773=((($nb_0)+(47))|0);
 var $774=((($772)+($773))|0);
 var $775=(((-$772))|0);
 var $776=$774&$775;
 var $777=($776>>>0)>($nb_0>>>0);
 if($777){label=172;break;}else{var $mem_0=0;label=341;break;}
 case 172: 
 var $779=HEAP32[((5216)>>2)];
 var $780=($779|0)==0;
 if($780){label=174;break;}else{label=173;break;}
 case 173: 
 var $782=HEAP32[((5208)>>2)];
 var $783=((($782)+($776))|0);
 var $784=($783>>>0)<=($782>>>0);
 var $785=($783>>>0)>($779>>>0);
 var $or_cond1_i=$784|$785;
 if($or_cond1_i){var $mem_0=0;label=341;break;}else{label=174;break;}
 case 174: 
 var $787=HEAP32[((5220)>>2)];
 var $788=$787&4;
 var $789=($788|0)==0;
 if($789){label=175;break;}else{var $tsize_1_i=0;label=198;break;}
 case 175: 
 var $791=HEAP32[((4800)>>2)];
 var $792=($791|0)==0;
 if($792){label=181;break;}else{label=176;break;}
 case 176: 
 var $794=$791;
 var $sp_0_i_i=5224;label=177;break;
 case 177: 
 var $sp_0_i_i;
 var $796=(($sp_0_i_i)|0);
 var $797=HEAP32[(($796)>>2)];
 var $798=($797>>>0)>($794>>>0);
 if($798){label=179;break;}else{label=178;break;}
 case 178: 
 var $800=(($sp_0_i_i+4)|0);
 var $801=HEAP32[(($800)>>2)];
 var $802=(($797+$801)|0);
 var $803=($802>>>0)>($794>>>0);
 if($803){label=180;break;}else{label=179;break;}
 case 179: 
 var $805=(($sp_0_i_i+8)|0);
 var $806=HEAP32[(($805)>>2)];
 var $807=($806|0)==0;
 if($807){label=181;break;}else{var $sp_0_i_i=$806;label=177;break;}
 case 180: 
 var $808=($sp_0_i_i|0)==0;
 if($808){label=181;break;}else{label=188;break;}
 case 181: 
 var $809=_sbrk(0);
 var $810=($809|0)==-1;
 if($810){var $tsize_0303639_i=0;label=197;break;}else{label=182;break;}
 case 182: 
 var $812=$809;
 var $813=HEAP32[((4732)>>2)];
 var $814=((($813)-(1))|0);
 var $815=$814&$812;
 var $816=($815|0)==0;
 if($816){var $ssize_0_i=$776;label=184;break;}else{label=183;break;}
 case 183: 
 var $818=((($814)+($812))|0);
 var $819=(((-$813))|0);
 var $820=$818&$819;
 var $821=((($776)-($812))|0);
 var $822=((($821)+($820))|0);
 var $ssize_0_i=$822;label=184;break;
 case 184: 
 var $ssize_0_i;
 var $824=HEAP32[((5208)>>2)];
 var $825=((($824)+($ssize_0_i))|0);
 var $826=($ssize_0_i>>>0)>($nb_0>>>0);
 var $827=($ssize_0_i>>>0)<2147483647;
 var $or_cond_i131=$826&$827;
 if($or_cond_i131){label=185;break;}else{var $tsize_0303639_i=0;label=197;break;}
 case 185: 
 var $829=HEAP32[((5216)>>2)];
 var $830=($829|0)==0;
 if($830){label=187;break;}else{label=186;break;}
 case 186: 
 var $832=($825>>>0)<=($824>>>0);
 var $833=($825>>>0)>($829>>>0);
 var $or_cond2_i=$832|$833;
 if($or_cond2_i){var $tsize_0303639_i=0;label=197;break;}else{label=187;break;}
 case 187: 
 var $835=_sbrk($ssize_0_i);
 var $836=($835|0)==($809|0);
 var $ssize_0__i=($836?$ssize_0_i:0);
 var $__i=($836?$809:-1);
 var $tbase_0_i=$__i;var $tsize_0_i=$ssize_0__i;var $br_0_i=$835;var $ssize_1_i=$ssize_0_i;label=190;break;
 case 188: 
 var $838=HEAP32[((4788)>>2)];
 var $839=((($774)-($838))|0);
 var $840=$839&$775;
 var $841=($840>>>0)<2147483647;
 if($841){label=189;break;}else{var $tsize_0303639_i=0;label=197;break;}
 case 189: 
 var $843=_sbrk($840);
 var $844=HEAP32[(($796)>>2)];
 var $845=HEAP32[(($800)>>2)];
 var $846=(($844+$845)|0);
 var $847=($843|0)==($846|0);
 var $_3_i=($847?$840:0);
 var $_4_i=($847?$843:-1);
 var $tbase_0_i=$_4_i;var $tsize_0_i=$_3_i;var $br_0_i=$843;var $ssize_1_i=$840;label=190;break;
 case 190: 
 var $ssize_1_i;
 var $br_0_i;
 var $tsize_0_i;
 var $tbase_0_i;
 var $849=(((-$ssize_1_i))|0);
 var $850=($tbase_0_i|0)==-1;
 if($850){label=191;break;}else{var $tsize_244_i=$tsize_0_i;var $tbase_245_i=$tbase_0_i;label=201;break;}
 case 191: 
 var $852=($br_0_i|0)!=-1;
 var $853=($ssize_1_i>>>0)<2147483647;
 var $or_cond5_i=$852&$853;
 var $854=($ssize_1_i>>>0)<($771>>>0);
 var $or_cond6_i=$or_cond5_i&$854;
 if($or_cond6_i){label=192;break;}else{var $ssize_2_i=$ssize_1_i;label=196;break;}
 case 192: 
 var $856=HEAP32[((4736)>>2)];
 var $857=((($773)-($ssize_1_i))|0);
 var $858=((($857)+($856))|0);
 var $859=(((-$856))|0);
 var $860=$858&$859;
 var $861=($860>>>0)<2147483647;
 if($861){label=193;break;}else{var $ssize_2_i=$ssize_1_i;label=196;break;}
 case 193: 
 var $863=_sbrk($860);
 var $864=($863|0)==-1;
 if($864){label=195;break;}else{label=194;break;}
 case 194: 
 var $866=((($860)+($ssize_1_i))|0);
 var $ssize_2_i=$866;label=196;break;
 case 195: 
 var $868=_sbrk($849);
 var $tsize_0303639_i=$tsize_0_i;label=197;break;
 case 196: 
 var $ssize_2_i;
 var $870=($br_0_i|0)==-1;
 if($870){var $tsize_0303639_i=$tsize_0_i;label=197;break;}else{var $tsize_244_i=$ssize_2_i;var $tbase_245_i=$br_0_i;label=201;break;}
 case 197: 
 var $tsize_0303639_i;
 var $871=HEAP32[((5220)>>2)];
 var $872=$871|4;
 HEAP32[((5220)>>2)]=$872;
 var $tsize_1_i=$tsize_0303639_i;label=198;break;
 case 198: 
 var $tsize_1_i;
 var $874=($776>>>0)<2147483647;
 if($874){label=199;break;}else{label=340;break;}
 case 199: 
 var $876=_sbrk($776);
 var $877=_sbrk(0);
 var $notlhs_i=($876|0)!=-1;
 var $notrhs_i=($877|0)!=-1;
 var $or_cond8_not_i=$notrhs_i&$notlhs_i;
 var $878=($876>>>0)<($877>>>0);
 var $or_cond9_i=$or_cond8_not_i&$878;
 if($or_cond9_i){label=200;break;}else{label=340;break;}
 case 200: 
 var $879=$877;
 var $880=$876;
 var $881=((($879)-($880))|0);
 var $882=((($nb_0)+(40))|0);
 var $883=($881>>>0)>($882>>>0);
 var $_tsize_1_i=($883?$881:$tsize_1_i);
 var $_tbase_1_i=($883?$876:-1);
 var $884=($_tbase_1_i|0)==-1;
 if($884){label=340;break;}else{var $tsize_244_i=$_tsize_1_i;var $tbase_245_i=$_tbase_1_i;label=201;break;}
 case 201: 
 var $tbase_245_i;
 var $tsize_244_i;
 var $885=HEAP32[((5208)>>2)];
 var $886=((($885)+($tsize_244_i))|0);
 HEAP32[((5208)>>2)]=$886;
 var $887=HEAP32[((5212)>>2)];
 var $888=($886>>>0)>($887>>>0);
 if($888){label=202;break;}else{label=203;break;}
 case 202: 
 HEAP32[((5212)>>2)]=$886;
 label=203;break;
 case 203: 
 var $890=HEAP32[((4800)>>2)];
 var $891=($890|0)==0;
 if($891){label=204;break;}else{var $sp_067_i=5224;label=211;break;}
 case 204: 
 var $893=HEAP32[((4792)>>2)];
 var $894=($893|0)==0;
 var $895=($tbase_245_i>>>0)<($893>>>0);
 var $or_cond10_i=$894|$895;
 if($or_cond10_i){label=205;break;}else{label=206;break;}
 case 205: 
 HEAP32[((4792)>>2)]=$tbase_245_i;
 label=206;break;
 case 206: 
 HEAP32[((5224)>>2)]=$tbase_245_i;
 HEAP32[((5228)>>2)]=$tsize_244_i;
 HEAP32[((5236)>>2)]=0;
 var $897=HEAP32[((4728)>>2)];
 HEAP32[((4812)>>2)]=$897;
 HEAP32[((4808)>>2)]=-1;
 var $i_02_i_i=0;label=207;break;
 case 207: 
 var $i_02_i_i;
 var $899=$i_02_i_i<<1;
 var $900=((4816+($899<<2))|0);
 var $901=$900;
 var $_sum_i_i=((($899)+(3))|0);
 var $902=((4816+($_sum_i_i<<2))|0);
 HEAP32[(($902)>>2)]=$901;
 var $_sum1_i_i=((($899)+(2))|0);
 var $903=((4816+($_sum1_i_i<<2))|0);
 HEAP32[(($903)>>2)]=$901;
 var $904=((($i_02_i_i)+(1))|0);
 var $905=($904>>>0)<32;
 if($905){var $i_02_i_i=$904;label=207;break;}else{label=208;break;}
 case 208: 
 var $906=((($tsize_244_i)-(40))|0);
 var $907=(($tbase_245_i+8)|0);
 var $908=$907;
 var $909=$908&7;
 var $910=($909|0)==0;
 if($910){var $914=0;label=210;break;}else{label=209;break;}
 case 209: 
 var $912=(((-$908))|0);
 var $913=$912&7;
 var $914=$913;label=210;break;
 case 210: 
 var $914;
 var $915=(($tbase_245_i+$914)|0);
 var $916=$915;
 var $917=((($906)-($914))|0);
 HEAP32[((4800)>>2)]=$916;
 HEAP32[((4788)>>2)]=$917;
 var $918=$917|1;
 var $_sum_i14_i=((($914)+(4))|0);
 var $919=(($tbase_245_i+$_sum_i14_i)|0);
 var $920=$919;
 HEAP32[(($920)>>2)]=$918;
 var $_sum2_i_i=((($tsize_244_i)-(36))|0);
 var $921=(($tbase_245_i+$_sum2_i_i)|0);
 var $922=$921;
 HEAP32[(($922)>>2)]=40;
 var $923=HEAP32[((4744)>>2)];
 HEAP32[((4804)>>2)]=$923;
 label=338;break;
 case 211: 
 var $sp_067_i;
 var $924=(($sp_067_i)|0);
 var $925=HEAP32[(($924)>>2)];
 var $926=(($sp_067_i+4)|0);
 var $927=HEAP32[(($926)>>2)];
 var $928=(($925+$927)|0);
 var $929=($tbase_245_i|0)==($928|0);
 if($929){label=213;break;}else{label=212;break;}
 case 212: 
 var $931=(($sp_067_i+8)|0);
 var $932=HEAP32[(($931)>>2)];
 var $933=($932|0)==0;
 if($933){label=218;break;}else{var $sp_067_i=$932;label=211;break;}
 case 213: 
 var $934=(($sp_067_i+12)|0);
 var $935=HEAP32[(($934)>>2)];
 var $936=$935&8;
 var $937=($936|0)==0;
 if($937){label=214;break;}else{label=218;break;}
 case 214: 
 var $939=$890;
 var $940=($939>>>0)>=($925>>>0);
 var $941=($939>>>0)<($tbase_245_i>>>0);
 var $or_cond47_i=$940&$941;
 if($or_cond47_i){label=215;break;}else{label=218;break;}
 case 215: 
 var $943=((($927)+($tsize_244_i))|0);
 HEAP32[(($926)>>2)]=$943;
 var $944=HEAP32[((4800)>>2)];
 var $945=HEAP32[((4788)>>2)];
 var $946=((($945)+($tsize_244_i))|0);
 var $947=$944;
 var $948=(($944+8)|0);
 var $949=$948;
 var $950=$949&7;
 var $951=($950|0)==0;
 if($951){var $955=0;label=217;break;}else{label=216;break;}
 case 216: 
 var $953=(((-$949))|0);
 var $954=$953&7;
 var $955=$954;label=217;break;
 case 217: 
 var $955;
 var $956=(($947+$955)|0);
 var $957=$956;
 var $958=((($946)-($955))|0);
 HEAP32[((4800)>>2)]=$957;
 HEAP32[((4788)>>2)]=$958;
 var $959=$958|1;
 var $_sum_i18_i=((($955)+(4))|0);
 var $960=(($947+$_sum_i18_i)|0);
 var $961=$960;
 HEAP32[(($961)>>2)]=$959;
 var $_sum2_i19_i=((($946)+(4))|0);
 var $962=(($947+$_sum2_i19_i)|0);
 var $963=$962;
 HEAP32[(($963)>>2)]=40;
 var $964=HEAP32[((4744)>>2)];
 HEAP32[((4804)>>2)]=$964;
 label=338;break;
 case 218: 
 var $965=HEAP32[((4792)>>2)];
 var $966=($tbase_245_i>>>0)<($965>>>0);
 if($966){label=219;break;}else{label=220;break;}
 case 219: 
 HEAP32[((4792)>>2)]=$tbase_245_i;
 label=220;break;
 case 220: 
 var $968=(($tbase_245_i+$tsize_244_i)|0);
 var $sp_160_i=5224;label=221;break;
 case 221: 
 var $sp_160_i;
 var $970=(($sp_160_i)|0);
 var $971=HEAP32[(($970)>>2)];
 var $972=($971|0)==($968|0);
 if($972){label=223;break;}else{label=222;break;}
 case 222: 
 var $974=(($sp_160_i+8)|0);
 var $975=HEAP32[(($974)>>2)];
 var $976=($975|0)==0;
 if($976){label=304;break;}else{var $sp_160_i=$975;label=221;break;}
 case 223: 
 var $977=(($sp_160_i+12)|0);
 var $978=HEAP32[(($977)>>2)];
 var $979=$978&8;
 var $980=($979|0)==0;
 if($980){label=224;break;}else{label=304;break;}
 case 224: 
 HEAP32[(($970)>>2)]=$tbase_245_i;
 var $982=(($sp_160_i+4)|0);
 var $983=HEAP32[(($982)>>2)];
 var $984=((($983)+($tsize_244_i))|0);
 HEAP32[(($982)>>2)]=$984;
 var $985=(($tbase_245_i+8)|0);
 var $986=$985;
 var $987=$986&7;
 var $988=($987|0)==0;
 if($988){var $993=0;label=226;break;}else{label=225;break;}
 case 225: 
 var $990=(((-$986))|0);
 var $991=$990&7;
 var $993=$991;label=226;break;
 case 226: 
 var $993;
 var $994=(($tbase_245_i+$993)|0);
 var $_sum93_i=((($tsize_244_i)+(8))|0);
 var $995=(($tbase_245_i+$_sum93_i)|0);
 var $996=$995;
 var $997=$996&7;
 var $998=($997|0)==0;
 if($998){var $1003=0;label=228;break;}else{label=227;break;}
 case 227: 
 var $1000=(((-$996))|0);
 var $1001=$1000&7;
 var $1003=$1001;label=228;break;
 case 228: 
 var $1003;
 var $_sum94_i=((($1003)+($tsize_244_i))|0);
 var $1004=(($tbase_245_i+$_sum94_i)|0);
 var $1005=$1004;
 var $1006=$1004;
 var $1007=$994;
 var $1008=((($1006)-($1007))|0);
 var $_sum_i21_i=((($993)+($nb_0))|0);
 var $1009=(($tbase_245_i+$_sum_i21_i)|0);
 var $1010=$1009;
 var $1011=((($1008)-($nb_0))|0);
 var $1012=$nb_0|3;
 var $_sum1_i22_i=((($993)+(4))|0);
 var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
 var $1014=$1013;
 HEAP32[(($1014)>>2)]=$1012;
 var $1015=HEAP32[((4800)>>2)];
 var $1016=($1005|0)==($1015|0);
 if($1016){label=229;break;}else{label=230;break;}
 case 229: 
 var $1018=HEAP32[((4788)>>2)];
 var $1019=((($1018)+($1011))|0);
 HEAP32[((4788)>>2)]=$1019;
 HEAP32[((4800)>>2)]=$1010;
 var $1020=$1019|1;
 var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
 var $1021=(($tbase_245_i+$_sum46_i_i)|0);
 var $1022=$1021;
 HEAP32[(($1022)>>2)]=$1020;
 label=303;break;
 case 230: 
 var $1024=HEAP32[((4796)>>2)];
 var $1025=($1005|0)==($1024|0);
 if($1025){label=231;break;}else{label=232;break;}
 case 231: 
 var $1027=HEAP32[((4784)>>2)];
 var $1028=((($1027)+($1011))|0);
 HEAP32[((4784)>>2)]=$1028;
 HEAP32[((4796)>>2)]=$1010;
 var $1029=$1028|1;
 var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
 var $1030=(($tbase_245_i+$_sum44_i_i)|0);
 var $1031=$1030;
 HEAP32[(($1031)>>2)]=$1029;
 var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
 var $1032=(($tbase_245_i+$_sum45_i_i)|0);
 var $1033=$1032;
 HEAP32[(($1033)>>2)]=$1028;
 label=303;break;
 case 232: 
 var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
 var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
 var $1035=(($tbase_245_i+$_sum95_i)|0);
 var $1036=$1035;
 var $1037=HEAP32[(($1036)>>2)];
 var $1038=$1037&3;
 var $1039=($1038|0)==1;
 if($1039){label=233;break;}else{var $oldfirst_0_i_i=$1005;var $qsize_0_i_i=$1011;label=280;break;}
 case 233: 
 var $1041=$1037&-8;
 var $1042=$1037>>>3;
 var $1043=($1037>>>0)<256;
 if($1043){label=234;break;}else{label=246;break;}
 case 234: 
 var $_sum3940_i_i=$1003|8;
 var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
 var $1045=(($tbase_245_i+$_sum105_i)|0);
 var $1046=$1045;
 var $1047=HEAP32[(($1046)>>2)];
 var $_sum41_i_i=((($tsize_244_i)+(12))|0);
 var $_sum106_i=((($_sum41_i_i)+($1003))|0);
 var $1048=(($tbase_245_i+$_sum106_i)|0);
 var $1049=$1048;
 var $1050=HEAP32[(($1049)>>2)];
 var $1051=$1042<<1;
 var $1052=((4816+($1051<<2))|0);
 var $1053=$1052;
 var $1054=($1047|0)==($1053|0);
 if($1054){label=237;break;}else{label=235;break;}
 case 235: 
 var $1056=$1047;
 var $1057=HEAP32[((4792)>>2)];
 var $1058=($1056>>>0)<($1057>>>0);
 if($1058){label=245;break;}else{label=236;break;}
 case 236: 
 var $1060=(($1047+12)|0);
 var $1061=HEAP32[(($1060)>>2)];
 var $1062=($1061|0)==($1005|0);
 if($1062){label=237;break;}else{label=245;break;}
 case 237: 
 var $1063=($1050|0)==($1047|0);
 if($1063){label=238;break;}else{label=239;break;}
 case 238: 
 var $1065=1<<$1042;
 var $1066=$1065^-1;
 var $1067=HEAP32[((4776)>>2)];
 var $1068=$1067&$1066;
 HEAP32[((4776)>>2)]=$1068;
 label=279;break;
 case 239: 
 var $1070=($1050|0)==($1053|0);
 if($1070){label=240;break;}else{label=241;break;}
 case 240: 
 var $_pre56_i_i=(($1050+8)|0);
 var $_pre_phi57_i_i=$_pre56_i_i;label=243;break;
 case 241: 
 var $1072=$1050;
 var $1073=HEAP32[((4792)>>2)];
 var $1074=($1072>>>0)<($1073>>>0);
 if($1074){label=244;break;}else{label=242;break;}
 case 242: 
 var $1076=(($1050+8)|0);
 var $1077=HEAP32[(($1076)>>2)];
 var $1078=($1077|0)==($1005|0);
 if($1078){var $_pre_phi57_i_i=$1076;label=243;break;}else{label=244;break;}
 case 243: 
 var $_pre_phi57_i_i;
 var $1079=(($1047+12)|0);
 HEAP32[(($1079)>>2)]=$1050;
 HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
 label=279;break;
 case 244: 
 _abort();
 throw "Reached an unreachable!";
 case 245: 
 _abort();
 throw "Reached an unreachable!";
 case 246: 
 var $1081=$1004;
 var $_sum34_i_i=$1003|24;
 var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
 var $1082=(($tbase_245_i+$_sum96_i)|0);
 var $1083=$1082;
 var $1084=HEAP32[(($1083)>>2)];
 var $_sum5_i_i=((($tsize_244_i)+(12))|0);
 var $_sum97_i=((($_sum5_i_i)+($1003))|0);
 var $1085=(($tbase_245_i+$_sum97_i)|0);
 var $1086=$1085;
 var $1087=HEAP32[(($1086)>>2)];
 var $1088=($1087|0)==($1081|0);
 if($1088){label=252;break;}else{label=247;break;}
 case 247: 
 var $_sum3637_i_i=$1003|8;
 var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
 var $1090=(($tbase_245_i+$_sum98_i)|0);
 var $1091=$1090;
 var $1092=HEAP32[(($1091)>>2)];
 var $1093=$1092;
 var $1094=HEAP32[((4792)>>2)];
 var $1095=($1093>>>0)<($1094>>>0);
 if($1095){label=251;break;}else{label=248;break;}
 case 248: 
 var $1097=(($1092+12)|0);
 var $1098=HEAP32[(($1097)>>2)];
 var $1099=($1098|0)==($1081|0);
 if($1099){label=249;break;}else{label=251;break;}
 case 249: 
 var $1101=(($1087+8)|0);
 var $1102=HEAP32[(($1101)>>2)];
 var $1103=($1102|0)==($1081|0);
 if($1103){label=250;break;}else{label=251;break;}
 case 250: 
 HEAP32[(($1097)>>2)]=$1087;
 HEAP32[(($1101)>>2)]=$1092;
 var $R_1_i_i=$1087;label=259;break;
 case 251: 
 _abort();
 throw "Reached an unreachable!";
 case 252: 
 var $_sum67_i_i=$1003|16;
 var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
 var $1106=(($tbase_245_i+$_sum103_i)|0);
 var $1107=$1106;
 var $1108=HEAP32[(($1107)>>2)];
 var $1109=($1108|0)==0;
 if($1109){label=253;break;}else{var $R_0_i_i=$1108;var $RP_0_i_i=$1107;label=254;break;}
 case 253: 
 var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
 var $1111=(($tbase_245_i+$_sum104_i)|0);
 var $1112=$1111;
 var $1113=HEAP32[(($1112)>>2)];
 var $1114=($1113|0)==0;
 if($1114){var $R_1_i_i=0;label=259;break;}else{var $R_0_i_i=$1113;var $RP_0_i_i=$1112;label=254;break;}
 case 254: 
 var $RP_0_i_i;
 var $R_0_i_i;
 var $1115=(($R_0_i_i+20)|0);
 var $1116=HEAP32[(($1115)>>2)];
 var $1117=($1116|0)==0;
 if($1117){label=255;break;}else{var $R_0_i_i=$1116;var $RP_0_i_i=$1115;label=254;break;}
 case 255: 
 var $1119=(($R_0_i_i+16)|0);
 var $1120=HEAP32[(($1119)>>2)];
 var $1121=($1120|0)==0;
 if($1121){label=256;break;}else{var $R_0_i_i=$1120;var $RP_0_i_i=$1119;label=254;break;}
 case 256: 
 var $1123=$RP_0_i_i;
 var $1124=HEAP32[((4792)>>2)];
 var $1125=($1123>>>0)<($1124>>>0);
 if($1125){label=258;break;}else{label=257;break;}
 case 257: 
 HEAP32[(($RP_0_i_i)>>2)]=0;
 var $R_1_i_i=$R_0_i_i;label=259;break;
 case 258: 
 _abort();
 throw "Reached an unreachable!";
 case 259: 
 var $R_1_i_i;
 var $1129=($1084|0)==0;
 if($1129){label=279;break;}else{label=260;break;}
 case 260: 
 var $_sum31_i_i=((($tsize_244_i)+(28))|0);
 var $_sum99_i=((($_sum31_i_i)+($1003))|0);
 var $1131=(($tbase_245_i+$_sum99_i)|0);
 var $1132=$1131;
 var $1133=HEAP32[(($1132)>>2)];
 var $1134=((5080+($1133<<2))|0);
 var $1135=HEAP32[(($1134)>>2)];
 var $1136=($1081|0)==($1135|0);
 if($1136){label=261;break;}else{label=263;break;}
 case 261: 
 HEAP32[(($1134)>>2)]=$R_1_i_i;
 var $cond_i_i=($R_1_i_i|0)==0;
 if($cond_i_i){label=262;break;}else{label=269;break;}
 case 262: 
 var $1138=HEAP32[(($1132)>>2)];
 var $1139=1<<$1138;
 var $1140=$1139^-1;
 var $1141=HEAP32[((4780)>>2)];
 var $1142=$1141&$1140;
 HEAP32[((4780)>>2)]=$1142;
 label=279;break;
 case 263: 
 var $1144=$1084;
 var $1145=HEAP32[((4792)>>2)];
 var $1146=($1144>>>0)<($1145>>>0);
 if($1146){label=267;break;}else{label=264;break;}
 case 264: 
 var $1148=(($1084+16)|0);
 var $1149=HEAP32[(($1148)>>2)];
 var $1150=($1149|0)==($1081|0);
 if($1150){label=265;break;}else{label=266;break;}
 case 265: 
 HEAP32[(($1148)>>2)]=$R_1_i_i;
 label=268;break;
 case 266: 
 var $1153=(($1084+20)|0);
 HEAP32[(($1153)>>2)]=$R_1_i_i;
 label=268;break;
 case 267: 
 _abort();
 throw "Reached an unreachable!";
 case 268: 
 var $1156=($R_1_i_i|0)==0;
 if($1156){label=279;break;}else{label=269;break;}
 case 269: 
 var $1158=$R_1_i_i;
 var $1159=HEAP32[((4792)>>2)];
 var $1160=($1158>>>0)<($1159>>>0);
 if($1160){label=278;break;}else{label=270;break;}
 case 270: 
 var $1162=(($R_1_i_i+24)|0);
 HEAP32[(($1162)>>2)]=$1084;
 var $_sum3233_i_i=$1003|16;
 var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
 var $1163=(($tbase_245_i+$_sum100_i)|0);
 var $1164=$1163;
 var $1165=HEAP32[(($1164)>>2)];
 var $1166=($1165|0)==0;
 if($1166){label=274;break;}else{label=271;break;}
 case 271: 
 var $1168=$1165;
 var $1169=HEAP32[((4792)>>2)];
 var $1170=($1168>>>0)<($1169>>>0);
 if($1170){label=273;break;}else{label=272;break;}
 case 272: 
 var $1172=(($R_1_i_i+16)|0);
 HEAP32[(($1172)>>2)]=$1165;
 var $1173=(($1165+24)|0);
 HEAP32[(($1173)>>2)]=$R_1_i_i;
 label=274;break;
 case 273: 
 _abort();
 throw "Reached an unreachable!";
 case 274: 
 var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
 var $1176=(($tbase_245_i+$_sum101_i)|0);
 var $1177=$1176;
 var $1178=HEAP32[(($1177)>>2)];
 var $1179=($1178|0)==0;
 if($1179){label=279;break;}else{label=275;break;}
 case 275: 
 var $1181=$1178;
 var $1182=HEAP32[((4792)>>2)];
 var $1183=($1181>>>0)<($1182>>>0);
 if($1183){label=277;break;}else{label=276;break;}
 case 276: 
 var $1185=(($R_1_i_i+20)|0);
 HEAP32[(($1185)>>2)]=$1178;
 var $1186=(($1178+24)|0);
 HEAP32[(($1186)>>2)]=$R_1_i_i;
 label=279;break;
 case 277: 
 _abort();
 throw "Reached an unreachable!";
 case 278: 
 _abort();
 throw "Reached an unreachable!";
 case 279: 
 var $_sum9_i_i=$1041|$1003;
 var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
 var $1190=(($tbase_245_i+$_sum102_i)|0);
 var $1191=$1190;
 var $1192=((($1041)+($1011))|0);
 var $oldfirst_0_i_i=$1191;var $qsize_0_i_i=$1192;label=280;break;
 case 280: 
 var $qsize_0_i_i;
 var $oldfirst_0_i_i;
 var $1194=(($oldfirst_0_i_i+4)|0);
 var $1195=HEAP32[(($1194)>>2)];
 var $1196=$1195&-2;
 HEAP32[(($1194)>>2)]=$1196;
 var $1197=$qsize_0_i_i|1;
 var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
 var $1198=(($tbase_245_i+$_sum10_i_i)|0);
 var $1199=$1198;
 HEAP32[(($1199)>>2)]=$1197;
 var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
 var $1200=(($tbase_245_i+$_sum11_i_i)|0);
 var $1201=$1200;
 HEAP32[(($1201)>>2)]=$qsize_0_i_i;
 var $1202=$qsize_0_i_i>>>3;
 var $1203=($qsize_0_i_i>>>0)<256;
 if($1203){label=281;break;}else{label=286;break;}
 case 281: 
 var $1205=$1202<<1;
 var $1206=((4816+($1205<<2))|0);
 var $1207=$1206;
 var $1208=HEAP32[((4776)>>2)];
 var $1209=1<<$1202;
 var $1210=$1208&$1209;
 var $1211=($1210|0)==0;
 if($1211){label=282;break;}else{label=283;break;}
 case 282: 
 var $1213=$1208|$1209;
 HEAP32[((4776)>>2)]=$1213;
 var $_sum27_pre_i_i=((($1205)+(2))|0);
 var $_pre_i24_i=((4816+($_sum27_pre_i_i<<2))|0);
 var $F4_0_i_i=$1207;var $_pre_phi_i25_i=$_pre_i24_i;label=285;break;
 case 283: 
 var $_sum30_i_i=((($1205)+(2))|0);
 var $1215=((4816+($_sum30_i_i<<2))|0);
 var $1216=HEAP32[(($1215)>>2)];
 var $1217=$1216;
 var $1218=HEAP32[((4792)>>2)];
 var $1219=($1217>>>0)<($1218>>>0);
 if($1219){label=284;break;}else{var $F4_0_i_i=$1216;var $_pre_phi_i25_i=$1215;label=285;break;}
 case 284: 
 _abort();
 throw "Reached an unreachable!";
 case 285: 
 var $_pre_phi_i25_i;
 var $F4_0_i_i;
 HEAP32[(($_pre_phi_i25_i)>>2)]=$1010;
 var $1222=(($F4_0_i_i+12)|0);
 HEAP32[(($1222)>>2)]=$1010;
 var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
 var $1223=(($tbase_245_i+$_sum28_i_i)|0);
 var $1224=$1223;
 HEAP32[(($1224)>>2)]=$F4_0_i_i;
 var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
 var $1225=(($tbase_245_i+$_sum29_i_i)|0);
 var $1226=$1225;
 HEAP32[(($1226)>>2)]=$1207;
 label=303;break;
 case 286: 
 var $1228=$1009;
 var $1229=$qsize_0_i_i>>>8;
 var $1230=($1229|0)==0;
 if($1230){var $I7_0_i_i=0;label=289;break;}else{label=287;break;}
 case 287: 
 var $1232=($qsize_0_i_i>>>0)>16777215;
 if($1232){var $I7_0_i_i=31;label=289;break;}else{label=288;break;}
 case 288: 
 var $1234=((($1229)+(1048320))|0);
 var $1235=$1234>>>16;
 var $1236=$1235&8;
 var $1237=$1229<<$1236;
 var $1238=((($1237)+(520192))|0);
 var $1239=$1238>>>16;
 var $1240=$1239&4;
 var $1241=$1240|$1236;
 var $1242=$1237<<$1240;
 var $1243=((($1242)+(245760))|0);
 var $1244=$1243>>>16;
 var $1245=$1244&2;
 var $1246=$1241|$1245;
 var $1247=(((14)-($1246))|0);
 var $1248=$1242<<$1245;
 var $1249=$1248>>>15;
 var $1250=((($1247)+($1249))|0);
 var $1251=$1250<<1;
 var $1252=((($1250)+(7))|0);
 var $1253=$qsize_0_i_i>>>($1252>>>0);
 var $1254=$1253&1;
 var $1255=$1254|$1251;
 var $I7_0_i_i=$1255;label=289;break;
 case 289: 
 var $I7_0_i_i;
 var $1257=((5080+($I7_0_i_i<<2))|0);
 var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
 var $1258=(($tbase_245_i+$_sum12_i26_i)|0);
 var $1259=$1258;
 HEAP32[(($1259)>>2)]=$I7_0_i_i;
 var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
 var $1260=(($tbase_245_i+$_sum13_i_i)|0);
 var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
 var $1261=(($tbase_245_i+$_sum14_i_i)|0);
 var $1262=$1261;
 HEAP32[(($1262)>>2)]=0;
 var $1263=$1260;
 HEAP32[(($1263)>>2)]=0;
 var $1264=HEAP32[((4780)>>2)];
 var $1265=1<<$I7_0_i_i;
 var $1266=$1264&$1265;
 var $1267=($1266|0)==0;
 if($1267){label=290;break;}else{label=291;break;}
 case 290: 
 var $1269=$1264|$1265;
 HEAP32[((4780)>>2)]=$1269;
 HEAP32[(($1257)>>2)]=$1228;
 var $1270=$1257;
 var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
 var $1271=(($tbase_245_i+$_sum15_i_i)|0);
 var $1272=$1271;
 HEAP32[(($1272)>>2)]=$1270;
 var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
 var $1273=(($tbase_245_i+$_sum16_i_i)|0);
 var $1274=$1273;
 HEAP32[(($1274)>>2)]=$1228;
 var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
 var $1275=(($tbase_245_i+$_sum17_i_i)|0);
 var $1276=$1275;
 HEAP32[(($1276)>>2)]=$1228;
 label=303;break;
 case 291: 
 var $1278=HEAP32[(($1257)>>2)];
 var $1279=($I7_0_i_i|0)==31;
 if($1279){var $1284=0;label=293;break;}else{label=292;break;}
 case 292: 
 var $1281=$I7_0_i_i>>>1;
 var $1282=(((25)-($1281))|0);
 var $1284=$1282;label=293;break;
 case 293: 
 var $1284;
 var $1285=$qsize_0_i_i<<$1284;
 var $K8_0_i_i=$1285;var $T_0_i27_i=$1278;label=294;break;
 case 294: 
 var $T_0_i27_i;
 var $K8_0_i_i;
 var $1287=(($T_0_i27_i+4)|0);
 var $1288=HEAP32[(($1287)>>2)];
 var $1289=$1288&-8;
 var $1290=($1289|0)==($qsize_0_i_i|0);
 if($1290){label=299;break;}else{label=295;break;}
 case 295: 
 var $1292=$K8_0_i_i>>>31;
 var $1293=(($T_0_i27_i+16+($1292<<2))|0);
 var $1294=HEAP32[(($1293)>>2)];
 var $1295=($1294|0)==0;
 var $1296=$K8_0_i_i<<1;
 if($1295){label=296;break;}else{var $K8_0_i_i=$1296;var $T_0_i27_i=$1294;label=294;break;}
 case 296: 
 var $1298=$1293;
 var $1299=HEAP32[((4792)>>2)];
 var $1300=($1298>>>0)<($1299>>>0);
 if($1300){label=298;break;}else{label=297;break;}
 case 297: 
 HEAP32[(($1293)>>2)]=$1228;
 var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
 var $1302=(($tbase_245_i+$_sum24_i_i)|0);
 var $1303=$1302;
 HEAP32[(($1303)>>2)]=$T_0_i27_i;
 var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
 var $1304=(($tbase_245_i+$_sum25_i_i)|0);
 var $1305=$1304;
 HEAP32[(($1305)>>2)]=$1228;
 var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
 var $1306=(($tbase_245_i+$_sum26_i_i)|0);
 var $1307=$1306;
 HEAP32[(($1307)>>2)]=$1228;
 label=303;break;
 case 298: 
 _abort();
 throw "Reached an unreachable!";
 case 299: 
 var $1310=(($T_0_i27_i+8)|0);
 var $1311=HEAP32[(($1310)>>2)];
 var $1312=$T_0_i27_i;
 var $1313=HEAP32[((4792)>>2)];
 var $1314=($1312>>>0)<($1313>>>0);
 if($1314){label=302;break;}else{label=300;break;}
 case 300: 
 var $1316=$1311;
 var $1317=($1316>>>0)<($1313>>>0);
 if($1317){label=302;break;}else{label=301;break;}
 case 301: 
 var $1319=(($1311+12)|0);
 HEAP32[(($1319)>>2)]=$1228;
 HEAP32[(($1310)>>2)]=$1228;
 var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
 var $1320=(($tbase_245_i+$_sum21_i_i)|0);
 var $1321=$1320;
 HEAP32[(($1321)>>2)]=$1311;
 var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
 var $1322=(($tbase_245_i+$_sum22_i_i)|0);
 var $1323=$1322;
 HEAP32[(($1323)>>2)]=$T_0_i27_i;
 var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
 var $1324=(($tbase_245_i+$_sum23_i_i)|0);
 var $1325=$1324;
 HEAP32[(($1325)>>2)]=0;
 label=303;break;
 case 302: 
 _abort();
 throw "Reached an unreachable!";
 case 303: 
 var $_sum1819_i_i=$993|8;
 var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
 var $mem_0=$1326;label=341;break;
 case 304: 
 var $1327=$890;
 var $sp_0_i_i_i=5224;label=305;break;
 case 305: 
 var $sp_0_i_i_i;
 var $1329=(($sp_0_i_i_i)|0);
 var $1330=HEAP32[(($1329)>>2)];
 var $1331=($1330>>>0)>($1327>>>0);
 if($1331){label=307;break;}else{label=306;break;}
 case 306: 
 var $1333=(($sp_0_i_i_i+4)|0);
 var $1334=HEAP32[(($1333)>>2)];
 var $1335=(($1330+$1334)|0);
 var $1336=($1335>>>0)>($1327>>>0);
 if($1336){label=308;break;}else{label=307;break;}
 case 307: 
 var $1338=(($sp_0_i_i_i+8)|0);
 var $1339=HEAP32[(($1338)>>2)];
 var $sp_0_i_i_i=$1339;label=305;break;
 case 308: 
 var $_sum_i15_i=((($1334)-(47))|0);
 var $_sum1_i16_i=((($1334)-(39))|0);
 var $1340=(($1330+$_sum1_i16_i)|0);
 var $1341=$1340;
 var $1342=$1341&7;
 var $1343=($1342|0)==0;
 if($1343){var $1348=0;label=310;break;}else{label=309;break;}
 case 309: 
 var $1345=(((-$1341))|0);
 var $1346=$1345&7;
 var $1348=$1346;label=310;break;
 case 310: 
 var $1348;
 var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
 var $1349=(($1330+$_sum2_i17_i)|0);
 var $1350=(($890+16)|0);
 var $1351=$1350;
 var $1352=($1349>>>0)<($1351>>>0);
 var $1353=($1352?$1327:$1349);
 var $1354=(($1353+8)|0);
 var $1355=$1354;
 var $1356=((($tsize_244_i)-(40))|0);
 var $1357=(($tbase_245_i+8)|0);
 var $1358=$1357;
 var $1359=$1358&7;
 var $1360=($1359|0)==0;
 if($1360){var $1364=0;label=312;break;}else{label=311;break;}
 case 311: 
 var $1362=(((-$1358))|0);
 var $1363=$1362&7;
 var $1364=$1363;label=312;break;
 case 312: 
 var $1364;
 var $1365=(($tbase_245_i+$1364)|0);
 var $1366=$1365;
 var $1367=((($1356)-($1364))|0);
 HEAP32[((4800)>>2)]=$1366;
 HEAP32[((4788)>>2)]=$1367;
 var $1368=$1367|1;
 var $_sum_i_i_i=((($1364)+(4))|0);
 var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
 var $1370=$1369;
 HEAP32[(($1370)>>2)]=$1368;
 var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
 var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
 var $1372=$1371;
 HEAP32[(($1372)>>2)]=40;
 var $1373=HEAP32[((4744)>>2)];
 HEAP32[((4804)>>2)]=$1373;
 var $1374=(($1353+4)|0);
 var $1375=$1374;
 HEAP32[(($1375)>>2)]=27;
 assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[((5224)>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((5228)>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((5232)>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((5236)>>2)];
 HEAP32[((5224)>>2)]=$tbase_245_i;
 HEAP32[((5228)>>2)]=$tsize_244_i;
 HEAP32[((5236)>>2)]=0;
 HEAP32[((5232)>>2)]=$1355;
 var $1376=(($1353+28)|0);
 var $1377=$1376;
 HEAP32[(($1377)>>2)]=7;
 var $1378=(($1353+32)|0);
 var $1379=($1378>>>0)<($1335>>>0);
 if($1379){var $1380=$1377;label=313;break;}else{label=314;break;}
 case 313: 
 var $1380;
 var $1381=(($1380+4)|0);
 HEAP32[(($1381)>>2)]=7;
 var $1382=(($1380+8)|0);
 var $1383=$1382;
 var $1384=($1383>>>0)<($1335>>>0);
 if($1384){var $1380=$1381;label=313;break;}else{label=314;break;}
 case 314: 
 var $1385=($1353|0)==($1327|0);
 if($1385){label=338;break;}else{label=315;break;}
 case 315: 
 var $1387=$1353;
 var $1388=$890;
 var $1389=((($1387)-($1388))|0);
 var $1390=(($1327+$1389)|0);
 var $_sum3_i_i=((($1389)+(4))|0);
 var $1391=(($1327+$_sum3_i_i)|0);
 var $1392=$1391;
 var $1393=HEAP32[(($1392)>>2)];
 var $1394=$1393&-2;
 HEAP32[(($1392)>>2)]=$1394;
 var $1395=$1389|1;
 var $1396=(($890+4)|0);
 HEAP32[(($1396)>>2)]=$1395;
 var $1397=$1390;
 HEAP32[(($1397)>>2)]=$1389;
 var $1398=$1389>>>3;
 var $1399=($1389>>>0)<256;
 if($1399){label=316;break;}else{label=321;break;}
 case 316: 
 var $1401=$1398<<1;
 var $1402=((4816+($1401<<2))|0);
 var $1403=$1402;
 var $1404=HEAP32[((4776)>>2)];
 var $1405=1<<$1398;
 var $1406=$1404&$1405;
 var $1407=($1406|0)==0;
 if($1407){label=317;break;}else{label=318;break;}
 case 317: 
 var $1409=$1404|$1405;
 HEAP32[((4776)>>2)]=$1409;
 var $_sum11_pre_i_i=((($1401)+(2))|0);
 var $_pre_i_i=((4816+($_sum11_pre_i_i<<2))|0);
 var $F_0_i_i=$1403;var $_pre_phi_i_i=$_pre_i_i;label=320;break;
 case 318: 
 var $_sum12_i_i=((($1401)+(2))|0);
 var $1411=((4816+($_sum12_i_i<<2))|0);
 var $1412=HEAP32[(($1411)>>2)];
 var $1413=$1412;
 var $1414=HEAP32[((4792)>>2)];
 var $1415=($1413>>>0)<($1414>>>0);
 if($1415){label=319;break;}else{var $F_0_i_i=$1412;var $_pre_phi_i_i=$1411;label=320;break;}
 case 319: 
 _abort();
 throw "Reached an unreachable!";
 case 320: 
 var $_pre_phi_i_i;
 var $F_0_i_i;
 HEAP32[(($_pre_phi_i_i)>>2)]=$890;
 var $1418=(($F_0_i_i+12)|0);
 HEAP32[(($1418)>>2)]=$890;
 var $1419=(($890+8)|0);
 HEAP32[(($1419)>>2)]=$F_0_i_i;
 var $1420=(($890+12)|0);
 HEAP32[(($1420)>>2)]=$1403;
 label=338;break;
 case 321: 
 var $1422=$890;
 var $1423=$1389>>>8;
 var $1424=($1423|0)==0;
 if($1424){var $I1_0_i_i=0;label=324;break;}else{label=322;break;}
 case 322: 
 var $1426=($1389>>>0)>16777215;
 if($1426){var $I1_0_i_i=31;label=324;break;}else{label=323;break;}
 case 323: 
 var $1428=((($1423)+(1048320))|0);
 var $1429=$1428>>>16;
 var $1430=$1429&8;
 var $1431=$1423<<$1430;
 var $1432=((($1431)+(520192))|0);
 var $1433=$1432>>>16;
 var $1434=$1433&4;
 var $1435=$1434|$1430;
 var $1436=$1431<<$1434;
 var $1437=((($1436)+(245760))|0);
 var $1438=$1437>>>16;
 var $1439=$1438&2;
 var $1440=$1435|$1439;
 var $1441=(((14)-($1440))|0);
 var $1442=$1436<<$1439;
 var $1443=$1442>>>15;
 var $1444=((($1441)+($1443))|0);
 var $1445=$1444<<1;
 var $1446=((($1444)+(7))|0);
 var $1447=$1389>>>($1446>>>0);
 var $1448=$1447&1;
 var $1449=$1448|$1445;
 var $I1_0_i_i=$1449;label=324;break;
 case 324: 
 var $I1_0_i_i;
 var $1451=((5080+($I1_0_i_i<<2))|0);
 var $1452=(($890+28)|0);
 var $I1_0_c_i_i=$I1_0_i_i;
 HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
 var $1453=(($890+20)|0);
 HEAP32[(($1453)>>2)]=0;
 var $1454=(($890+16)|0);
 HEAP32[(($1454)>>2)]=0;
 var $1455=HEAP32[((4780)>>2)];
 var $1456=1<<$I1_0_i_i;
 var $1457=$1455&$1456;
 var $1458=($1457|0)==0;
 if($1458){label=325;break;}else{label=326;break;}
 case 325: 
 var $1460=$1455|$1456;
 HEAP32[((4780)>>2)]=$1460;
 HEAP32[(($1451)>>2)]=$1422;
 var $1461=(($890+24)|0);
 var $_c_i_i=$1451;
 HEAP32[(($1461)>>2)]=$_c_i_i;
 var $1462=(($890+12)|0);
 HEAP32[(($1462)>>2)]=$890;
 var $1463=(($890+8)|0);
 HEAP32[(($1463)>>2)]=$890;
 label=338;break;
 case 326: 
 var $1465=HEAP32[(($1451)>>2)];
 var $1466=($I1_0_i_i|0)==31;
 if($1466){var $1471=0;label=328;break;}else{label=327;break;}
 case 327: 
 var $1468=$I1_0_i_i>>>1;
 var $1469=(((25)-($1468))|0);
 var $1471=$1469;label=328;break;
 case 328: 
 var $1471;
 var $1472=$1389<<$1471;
 var $K2_0_i_i=$1472;var $T_0_i_i=$1465;label=329;break;
 case 329: 
 var $T_0_i_i;
 var $K2_0_i_i;
 var $1474=(($T_0_i_i+4)|0);
 var $1475=HEAP32[(($1474)>>2)];
 var $1476=$1475&-8;
 var $1477=($1476|0)==($1389|0);
 if($1477){label=334;break;}else{label=330;break;}
 case 330: 
 var $1479=$K2_0_i_i>>>31;
 var $1480=(($T_0_i_i+16+($1479<<2))|0);
 var $1481=HEAP32[(($1480)>>2)];
 var $1482=($1481|0)==0;
 var $1483=$K2_0_i_i<<1;
 if($1482){label=331;break;}else{var $K2_0_i_i=$1483;var $T_0_i_i=$1481;label=329;break;}
 case 331: 
 var $1485=$1480;
 var $1486=HEAP32[((4792)>>2)];
 var $1487=($1485>>>0)<($1486>>>0);
 if($1487){label=333;break;}else{label=332;break;}
 case 332: 
 HEAP32[(($1480)>>2)]=$1422;
 var $1489=(($890+24)|0);
 var $T_0_c8_i_i=$T_0_i_i;
 HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
 var $1490=(($890+12)|0);
 HEAP32[(($1490)>>2)]=$890;
 var $1491=(($890+8)|0);
 HEAP32[(($1491)>>2)]=$890;
 label=338;break;
 case 333: 
 _abort();
 throw "Reached an unreachable!";
 case 334: 
 var $1494=(($T_0_i_i+8)|0);
 var $1495=HEAP32[(($1494)>>2)];
 var $1496=$T_0_i_i;
 var $1497=HEAP32[((4792)>>2)];
 var $1498=($1496>>>0)<($1497>>>0);
 if($1498){label=337;break;}else{label=335;break;}
 case 335: 
 var $1500=$1495;
 var $1501=($1500>>>0)<($1497>>>0);
 if($1501){label=337;break;}else{label=336;break;}
 case 336: 
 var $1503=(($1495+12)|0);
 HEAP32[(($1503)>>2)]=$1422;
 HEAP32[(($1494)>>2)]=$1422;
 var $1504=(($890+8)|0);
 var $_c7_i_i=$1495;
 HEAP32[(($1504)>>2)]=$_c7_i_i;
 var $1505=(($890+12)|0);
 var $T_0_c_i_i=$T_0_i_i;
 HEAP32[(($1505)>>2)]=$T_0_c_i_i;
 var $1506=(($890+24)|0);
 HEAP32[(($1506)>>2)]=0;
 label=338;break;
 case 337: 
 _abort();
 throw "Reached an unreachable!";
 case 338: 
 var $1507=HEAP32[((4788)>>2)];
 var $1508=($1507>>>0)>($nb_0>>>0);
 if($1508){label=339;break;}else{label=340;break;}
 case 339: 
 var $1510=((($1507)-($nb_0))|0);
 HEAP32[((4788)>>2)]=$1510;
 var $1511=HEAP32[((4800)>>2)];
 var $1512=$1511;
 var $1513=(($1512+$nb_0)|0);
 var $1514=$1513;
 HEAP32[((4800)>>2)]=$1514;
 var $1515=$1510|1;
 var $_sum_i134=((($nb_0)+(4))|0);
 var $1516=(($1512+$_sum_i134)|0);
 var $1517=$1516;
 HEAP32[(($1517)>>2)]=$1515;
 var $1518=$nb_0|3;
 var $1519=(($1511+4)|0);
 HEAP32[(($1519)>>2)]=$1518;
 var $1520=(($1511+8)|0);
 var $1521=$1520;
 var $mem_0=$1521;label=341;break;
 case 340: 
 var $1522=___errno_location();
 HEAP32[(($1522)>>2)]=12;
 var $mem_0=0;label=341;break;
 case 341: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($mem|0)==0;
 if($1){label=140;break;}else{label=2;break;}
 case 2: 
 var $3=((($mem)-(8))|0);
 var $4=$3;
 var $5=HEAP32[((4792)>>2)];
 var $6=($3>>>0)<($5>>>0);
 if($6){label=139;break;}else{label=3;break;}
 case 3: 
 var $8=((($mem)-(4))|0);
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=$10&3;
 var $12=($11|0)==1;
 if($12){label=139;break;}else{label=4;break;}
 case 4: 
 var $14=$10&-8;
 var $_sum=((($14)-(8))|0);
 var $15=(($mem+$_sum)|0);
 var $16=$15;
 var $17=$10&1;
 var $18=($17|0)==0;
 if($18){label=5;break;}else{var $p_0=$4;var $psize_0=$14;label=56;break;}
 case 5: 
 var $20=$3;
 var $21=HEAP32[(($20)>>2)];
 var $22=($11|0)==0;
 if($22){label=140;break;}else{label=6;break;}
 case 6: 
 var $_sum232=(((-8)-($21))|0);
 var $24=(($mem+$_sum232)|0);
 var $25=$24;
 var $26=((($21)+($14))|0);
 var $27=($24>>>0)<($5>>>0);
 if($27){label=139;break;}else{label=7;break;}
 case 7: 
 var $29=HEAP32[((4796)>>2)];
 var $30=($25|0)==($29|0);
 if($30){label=54;break;}else{label=8;break;}
 case 8: 
 var $32=$21>>>3;
 var $33=($21>>>0)<256;
 if($33){label=9;break;}else{label=21;break;}
 case 9: 
 var $_sum276=((($_sum232)+(8))|0);
 var $35=(($mem+$_sum276)|0);
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $_sum277=((($_sum232)+(12))|0);
 var $38=(($mem+$_sum277)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=$32<<1;
 var $42=((4816+($41<<2))|0);
 var $43=$42;
 var $44=($37|0)==($43|0);
 if($44){label=12;break;}else{label=10;break;}
 case 10: 
 var $46=$37;
 var $47=($46>>>0)<($5>>>0);
 if($47){label=20;break;}else{label=11;break;}
 case 11: 
 var $49=(($37+12)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)==($25|0);
 if($51){label=12;break;}else{label=20;break;}
 case 12: 
 var $52=($40|0)==($37|0);
 if($52){label=13;break;}else{label=14;break;}
 case 13: 
 var $54=1<<$32;
 var $55=$54^-1;
 var $56=HEAP32[((4776)>>2)];
 var $57=$56&$55;
 HEAP32[((4776)>>2)]=$57;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 14: 
 var $59=($40|0)==($43|0);
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre305=(($40+8)|0);
 var $_pre_phi306=$_pre305;label=18;break;
 case 16: 
 var $61=$40;
 var $62=($61>>>0)<($5>>>0);
 if($62){label=19;break;}else{label=17;break;}
 case 17: 
 var $64=(($40+8)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=($65|0)==($25|0);
 if($66){var $_pre_phi306=$64;label=18;break;}else{label=19;break;}
 case 18: 
 var $_pre_phi306;
 var $67=(($37+12)|0);
 HEAP32[(($67)>>2)]=$40;
 HEAP32[(($_pre_phi306)>>2)]=$37;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 _abort();
 throw "Reached an unreachable!";
 case 21: 
 var $69=$24;
 var $_sum266=((($_sum232)+(24))|0);
 var $70=(($mem+$_sum266)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $_sum267=((($_sum232)+(12))|0);
 var $73=(($mem+$_sum267)|0);
 var $74=$73;
 var $75=HEAP32[(($74)>>2)];
 var $76=($75|0)==($69|0);
 if($76){label=27;break;}else{label=22;break;}
 case 22: 
 var $_sum273=((($_sum232)+(8))|0);
 var $78=(($mem+$_sum273)|0);
 var $79=$78;
 var $80=HEAP32[(($79)>>2)];
 var $81=$80;
 var $82=($81>>>0)<($5>>>0);
 if($82){label=26;break;}else{label=23;break;}
 case 23: 
 var $84=(($80+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=($85|0)==($69|0);
 if($86){label=24;break;}else{label=26;break;}
 case 24: 
 var $88=(($75+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($89|0)==($69|0);
 if($90){label=25;break;}else{label=26;break;}
 case 25: 
 HEAP32[(($84)>>2)]=$75;
 HEAP32[(($88)>>2)]=$80;
 var $R_1=$75;label=34;break;
 case 26: 
 _abort();
 throw "Reached an unreachable!";
 case 27: 
 var $_sum269=((($_sum232)+(20))|0);
 var $93=(($mem+$_sum269)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=28;break;}else{var $R_0=$95;var $RP_0=$94;label=29;break;}
 case 28: 
 var $_sum268=((($_sum232)+(16))|0);
 var $98=(($mem+$_sum268)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==0;
 if($101){var $R_1=0;label=34;break;}else{var $R_0=$100;var $RP_0=$99;label=29;break;}
 case 29: 
 var $RP_0;
 var $R_0;
 var $102=(($R_0+20)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==0;
 if($104){label=30;break;}else{var $R_0=$103;var $RP_0=$102;label=29;break;}
 case 30: 
 var $106=(($R_0+16)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=($107|0)==0;
 if($108){label=31;break;}else{var $R_0=$107;var $RP_0=$106;label=29;break;}
 case 31: 
 var $110=$RP_0;
 var $111=($110>>>0)<($5>>>0);
 if($111){label=33;break;}else{label=32;break;}
 case 32: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=34;break;
 case 33: 
 _abort();
 throw "Reached an unreachable!";
 case 34: 
 var $R_1;
 var $115=($72|0)==0;
 if($115){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=35;break;}
 case 35: 
 var $_sum270=((($_sum232)+(28))|0);
 var $117=(($mem+$_sum270)|0);
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=((5080+($119<<2))|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=($69|0)==($121|0);
 if($122){label=36;break;}else{label=38;break;}
 case 36: 
 HEAP32[(($120)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=37;break;}else{label=44;break;}
 case 37: 
 var $124=HEAP32[(($118)>>2)];
 var $125=1<<$124;
 var $126=$125^-1;
 var $127=HEAP32[((4780)>>2)];
 var $128=$127&$126;
 HEAP32[((4780)>>2)]=$128;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 38: 
 var $130=$72;
 var $131=HEAP32[((4792)>>2)];
 var $132=($130>>>0)<($131>>>0);
 if($132){label=42;break;}else{label=39;break;}
 case 39: 
 var $134=(($72+16)|0);
 var $135=HEAP32[(($134)>>2)];
 var $136=($135|0)==($69|0);
 if($136){label=40;break;}else{label=41;break;}
 case 40: 
 HEAP32[(($134)>>2)]=$R_1;
 label=43;break;
 case 41: 
 var $139=(($72+20)|0);
 HEAP32[(($139)>>2)]=$R_1;
 label=43;break;
 case 42: 
 _abort();
 throw "Reached an unreachable!";
 case 43: 
 var $142=($R_1|0)==0;
 if($142){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=44;break;}
 case 44: 
 var $144=$R_1;
 var $145=HEAP32[((4792)>>2)];
 var $146=($144>>>0)<($145>>>0);
 if($146){label=53;break;}else{label=45;break;}
 case 45: 
 var $148=(($R_1+24)|0);
 HEAP32[(($148)>>2)]=$72;
 var $_sum271=((($_sum232)+(16))|0);
 var $149=(($mem+$_sum271)|0);
 var $150=$149;
 var $151=HEAP32[(($150)>>2)];
 var $152=($151|0)==0;
 if($152){label=49;break;}else{label=46;break;}
 case 46: 
 var $154=$151;
 var $155=HEAP32[((4792)>>2)];
 var $156=($154>>>0)<($155>>>0);
 if($156){label=48;break;}else{label=47;break;}
 case 47: 
 var $158=(($R_1+16)|0);
 HEAP32[(($158)>>2)]=$151;
 var $159=(($151+24)|0);
 HEAP32[(($159)>>2)]=$R_1;
 label=49;break;
 case 48: 
 _abort();
 throw "Reached an unreachable!";
 case 49: 
 var $_sum272=((($_sum232)+(20))|0);
 var $162=(($mem+$_sum272)|0);
 var $163=$162;
 var $164=HEAP32[(($163)>>2)];
 var $165=($164|0)==0;
 if($165){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=50;break;}
 case 50: 
 var $167=$164;
 var $168=HEAP32[((4792)>>2)];
 var $169=($167>>>0)<($168>>>0);
 if($169){label=52;break;}else{label=51;break;}
 case 51: 
 var $171=(($R_1+20)|0);
 HEAP32[(($171)>>2)]=$164;
 var $172=(($164+24)|0);
 HEAP32[(($172)>>2)]=$R_1;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 52: 
 _abort();
 throw "Reached an unreachable!";
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_sum233=((($14)-(4))|0);
 var $176=(($mem+$_sum233)|0);
 var $177=$176;
 var $178=HEAP32[(($177)>>2)];
 var $179=$178&3;
 var $180=($179|0)==3;
 if($180){label=55;break;}else{var $p_0=$25;var $psize_0=$26;label=56;break;}
 case 55: 
 HEAP32[((4784)>>2)]=$26;
 var $182=HEAP32[(($177)>>2)];
 var $183=$182&-2;
 HEAP32[(($177)>>2)]=$183;
 var $184=$26|1;
 var $_sum264=((($_sum232)+(4))|0);
 var $185=(($mem+$_sum264)|0);
 var $186=$185;
 HEAP32[(($186)>>2)]=$184;
 var $187=$15;
 HEAP32[(($187)>>2)]=$26;
 label=140;break;
 case 56: 
 var $psize_0;
 var $p_0;
 var $189=$p_0;
 var $190=($189>>>0)<($15>>>0);
 if($190){label=57;break;}else{label=139;break;}
 case 57: 
 var $_sum263=((($14)-(4))|0);
 var $192=(($mem+$_sum263)|0);
 var $193=$192;
 var $194=HEAP32[(($193)>>2)];
 var $195=$194&1;
 var $phitmp=($195|0)==0;
 if($phitmp){label=139;break;}else{label=58;break;}
 case 58: 
 var $197=$194&2;
 var $198=($197|0)==0;
 if($198){label=59;break;}else{label=112;break;}
 case 59: 
 var $200=HEAP32[((4800)>>2)];
 var $201=($16|0)==($200|0);
 if($201){label=60;break;}else{label=62;break;}
 case 60: 
 var $203=HEAP32[((4788)>>2)];
 var $204=((($203)+($psize_0))|0);
 HEAP32[((4788)>>2)]=$204;
 HEAP32[((4800)>>2)]=$p_0;
 var $205=$204|1;
 var $206=(($p_0+4)|0);
 HEAP32[(($206)>>2)]=$205;
 var $207=HEAP32[((4796)>>2)];
 var $208=($p_0|0)==($207|0);
 if($208){label=61;break;}else{label=140;break;}
 case 61: 
 HEAP32[((4796)>>2)]=0;
 HEAP32[((4784)>>2)]=0;
 label=140;break;
 case 62: 
 var $211=HEAP32[((4796)>>2)];
 var $212=($16|0)==($211|0);
 if($212){label=63;break;}else{label=64;break;}
 case 63: 
 var $214=HEAP32[((4784)>>2)];
 var $215=((($214)+($psize_0))|0);
 HEAP32[((4784)>>2)]=$215;
 HEAP32[((4796)>>2)]=$p_0;
 var $216=$215|1;
 var $217=(($p_0+4)|0);
 HEAP32[(($217)>>2)]=$216;
 var $218=(($189+$215)|0);
 var $219=$218;
 HEAP32[(($219)>>2)]=$215;
 label=140;break;
 case 64: 
 var $221=$194&-8;
 var $222=((($221)+($psize_0))|0);
 var $223=$194>>>3;
 var $224=($194>>>0)<256;
 if($224){label=65;break;}else{label=77;break;}
 case 65: 
 var $226=(($mem+$14)|0);
 var $227=$226;
 var $228=HEAP32[(($227)>>2)];
 var $_sum257258=$14|4;
 var $229=(($mem+$_sum257258)|0);
 var $230=$229;
 var $231=HEAP32[(($230)>>2)];
 var $232=$223<<1;
 var $233=((4816+($232<<2))|0);
 var $234=$233;
 var $235=($228|0)==($234|0);
 if($235){label=68;break;}else{label=66;break;}
 case 66: 
 var $237=$228;
 var $238=HEAP32[((4792)>>2)];
 var $239=($237>>>0)<($238>>>0);
 if($239){label=76;break;}else{label=67;break;}
 case 67: 
 var $241=(($228+12)|0);
 var $242=HEAP32[(($241)>>2)];
 var $243=($242|0)==($16|0);
 if($243){label=68;break;}else{label=76;break;}
 case 68: 
 var $244=($231|0)==($228|0);
 if($244){label=69;break;}else{label=70;break;}
 case 69: 
 var $246=1<<$223;
 var $247=$246^-1;
 var $248=HEAP32[((4776)>>2)];
 var $249=$248&$247;
 HEAP32[((4776)>>2)]=$249;
 label=110;break;
 case 70: 
 var $251=($231|0)==($234|0);
 if($251){label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre303=(($231+8)|0);
 var $_pre_phi304=$_pre303;label=74;break;
 case 72: 
 var $253=$231;
 var $254=HEAP32[((4792)>>2)];
 var $255=($253>>>0)<($254>>>0);
 if($255){label=75;break;}else{label=73;break;}
 case 73: 
 var $257=(($231+8)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=($258|0)==($16|0);
 if($259){var $_pre_phi304=$257;label=74;break;}else{label=75;break;}
 case 74: 
 var $_pre_phi304;
 var $260=(($228+12)|0);
 HEAP32[(($260)>>2)]=$231;
 HEAP32[(($_pre_phi304)>>2)]=$228;
 label=110;break;
 case 75: 
 _abort();
 throw "Reached an unreachable!";
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $262=$15;
 var $_sum235=((($14)+(16))|0);
 var $263=(($mem+$_sum235)|0);
 var $264=$263;
 var $265=HEAP32[(($264)>>2)];
 var $_sum236237=$14|4;
 var $266=(($mem+$_sum236237)|0);
 var $267=$266;
 var $268=HEAP32[(($267)>>2)];
 var $269=($268|0)==($262|0);
 if($269){label=83;break;}else{label=78;break;}
 case 78: 
 var $271=(($mem+$14)|0);
 var $272=$271;
 var $273=HEAP32[(($272)>>2)];
 var $274=$273;
 var $275=HEAP32[((4792)>>2)];
 var $276=($274>>>0)<($275>>>0);
 if($276){label=82;break;}else{label=79;break;}
 case 79: 
 var $278=(($273+12)|0);
 var $279=HEAP32[(($278)>>2)];
 var $280=($279|0)==($262|0);
 if($280){label=80;break;}else{label=82;break;}
 case 80: 
 var $282=(($268+8)|0);
 var $283=HEAP32[(($282)>>2)];
 var $284=($283|0)==($262|0);
 if($284){label=81;break;}else{label=82;break;}
 case 81: 
 HEAP32[(($278)>>2)]=$268;
 HEAP32[(($282)>>2)]=$273;
 var $R7_1=$268;label=90;break;
 case 82: 
 _abort();
 throw "Reached an unreachable!";
 case 83: 
 var $_sum239=((($14)+(12))|0);
 var $287=(($mem+$_sum239)|0);
 var $288=$287;
 var $289=HEAP32[(($288)>>2)];
 var $290=($289|0)==0;
 if($290){label=84;break;}else{var $R7_0=$289;var $RP9_0=$288;label=85;break;}
 case 84: 
 var $_sum238=((($14)+(8))|0);
 var $292=(($mem+$_sum238)|0);
 var $293=$292;
 var $294=HEAP32[(($293)>>2)];
 var $295=($294|0)==0;
 if($295){var $R7_1=0;label=90;break;}else{var $R7_0=$294;var $RP9_0=$293;label=85;break;}
 case 85: 
 var $RP9_0;
 var $R7_0;
 var $296=(($R7_0+20)|0);
 var $297=HEAP32[(($296)>>2)];
 var $298=($297|0)==0;
 if($298){label=86;break;}else{var $R7_0=$297;var $RP9_0=$296;label=85;break;}
 case 86: 
 var $300=(($R7_0+16)|0);
 var $301=HEAP32[(($300)>>2)];
 var $302=($301|0)==0;
 if($302){label=87;break;}else{var $R7_0=$301;var $RP9_0=$300;label=85;break;}
 case 87: 
 var $304=$RP9_0;
 var $305=HEAP32[((4792)>>2)];
 var $306=($304>>>0)<($305>>>0);
 if($306){label=89;break;}else{label=88;break;}
 case 88: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=90;break;
 case 89: 
 _abort();
 throw "Reached an unreachable!";
 case 90: 
 var $R7_1;
 var $310=($265|0)==0;
 if($310){label=110;break;}else{label=91;break;}
 case 91: 
 var $_sum250=((($14)+(20))|0);
 var $312=(($mem+$_sum250)|0);
 var $313=$312;
 var $314=HEAP32[(($313)>>2)];
 var $315=((5080+($314<<2))|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=($262|0)==($316|0);
 if($317){label=92;break;}else{label=94;break;}
 case 92: 
 HEAP32[(($315)>>2)]=$R7_1;
 var $cond298=($R7_1|0)==0;
 if($cond298){label=93;break;}else{label=100;break;}
 case 93: 
 var $319=HEAP32[(($313)>>2)];
 var $320=1<<$319;
 var $321=$320^-1;
 var $322=HEAP32[((4780)>>2)];
 var $323=$322&$321;
 HEAP32[((4780)>>2)]=$323;
 label=110;break;
 case 94: 
 var $325=$265;
 var $326=HEAP32[((4792)>>2)];
 var $327=($325>>>0)<($326>>>0);
 if($327){label=98;break;}else{label=95;break;}
 case 95: 
 var $329=(($265+16)|0);
 var $330=HEAP32[(($329)>>2)];
 var $331=($330|0)==($262|0);
 if($331){label=96;break;}else{label=97;break;}
 case 96: 
 HEAP32[(($329)>>2)]=$R7_1;
 label=99;break;
 case 97: 
 var $334=(($265+20)|0);
 HEAP32[(($334)>>2)]=$R7_1;
 label=99;break;
 case 98: 
 _abort();
 throw "Reached an unreachable!";
 case 99: 
 var $337=($R7_1|0)==0;
 if($337){label=110;break;}else{label=100;break;}
 case 100: 
 var $339=$R7_1;
 var $340=HEAP32[((4792)>>2)];
 var $341=($339>>>0)<($340>>>0);
 if($341){label=109;break;}else{label=101;break;}
 case 101: 
 var $343=(($R7_1+24)|0);
 HEAP32[(($343)>>2)]=$265;
 var $_sum251=((($14)+(8))|0);
 var $344=(($mem+$_sum251)|0);
 var $345=$344;
 var $346=HEAP32[(($345)>>2)];
 var $347=($346|0)==0;
 if($347){label=105;break;}else{label=102;break;}
 case 102: 
 var $349=$346;
 var $350=HEAP32[((4792)>>2)];
 var $351=($349>>>0)<($350>>>0);
 if($351){label=104;break;}else{label=103;break;}
 case 103: 
 var $353=(($R7_1+16)|0);
 HEAP32[(($353)>>2)]=$346;
 var $354=(($346+24)|0);
 HEAP32[(($354)>>2)]=$R7_1;
 label=105;break;
 case 104: 
 _abort();
 throw "Reached an unreachable!";
 case 105: 
 var $_sum252=((($14)+(12))|0);
 var $357=(($mem+$_sum252)|0);
 var $358=$357;
 var $359=HEAP32[(($358)>>2)];
 var $360=($359|0)==0;
 if($360){label=110;break;}else{label=106;break;}
 case 106: 
 var $362=$359;
 var $363=HEAP32[((4792)>>2)];
 var $364=($362>>>0)<($363>>>0);
 if($364){label=108;break;}else{label=107;break;}
 case 107: 
 var $366=(($R7_1+20)|0);
 HEAP32[(($366)>>2)]=$359;
 var $367=(($359+24)|0);
 HEAP32[(($367)>>2)]=$R7_1;
 label=110;break;
 case 108: 
 _abort();
 throw "Reached an unreachable!";
 case 109: 
 _abort();
 throw "Reached an unreachable!";
 case 110: 
 var $371=$222|1;
 var $372=(($p_0+4)|0);
 HEAP32[(($372)>>2)]=$371;
 var $373=(($189+$222)|0);
 var $374=$373;
 HEAP32[(($374)>>2)]=$222;
 var $375=HEAP32[((4796)>>2)];
 var $376=($p_0|0)==($375|0);
 if($376){label=111;break;}else{var $psize_1=$222;label=113;break;}
 case 111: 
 HEAP32[((4784)>>2)]=$222;
 label=140;break;
 case 112: 
 var $379=$194&-2;
 HEAP32[(($193)>>2)]=$379;
 var $380=$psize_0|1;
 var $381=(($p_0+4)|0);
 HEAP32[(($381)>>2)]=$380;
 var $382=(($189+$psize_0)|0);
 var $383=$382;
 HEAP32[(($383)>>2)]=$psize_0;
 var $psize_1=$psize_0;label=113;break;
 case 113: 
 var $psize_1;
 var $385=$psize_1>>>3;
 var $386=($psize_1>>>0)<256;
 if($386){label=114;break;}else{label=119;break;}
 case 114: 
 var $388=$385<<1;
 var $389=((4816+($388<<2))|0);
 var $390=$389;
 var $391=HEAP32[((4776)>>2)];
 var $392=1<<$385;
 var $393=$391&$392;
 var $394=($393|0)==0;
 if($394){label=115;break;}else{label=116;break;}
 case 115: 
 var $396=$391|$392;
 HEAP32[((4776)>>2)]=$396;
 var $_sum248_pre=((($388)+(2))|0);
 var $_pre=((4816+($_sum248_pre<<2))|0);
 var $F16_0=$390;var $_pre_phi=$_pre;label=118;break;
 case 116: 
 var $_sum249=((($388)+(2))|0);
 var $398=((4816+($_sum249<<2))|0);
 var $399=HEAP32[(($398)>>2)];
 var $400=$399;
 var $401=HEAP32[((4792)>>2)];
 var $402=($400>>>0)<($401>>>0);
 if($402){label=117;break;}else{var $F16_0=$399;var $_pre_phi=$398;label=118;break;}
 case 117: 
 _abort();
 throw "Reached an unreachable!";
 case 118: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$p_0;
 var $405=(($F16_0+12)|0);
 HEAP32[(($405)>>2)]=$p_0;
 var $406=(($p_0+8)|0);
 HEAP32[(($406)>>2)]=$F16_0;
 var $407=(($p_0+12)|0);
 HEAP32[(($407)>>2)]=$390;
 label=140;break;
 case 119: 
 var $409=$p_0;
 var $410=$psize_1>>>8;
 var $411=($410|0)==0;
 if($411){var $I18_0=0;label=122;break;}else{label=120;break;}
 case 120: 
 var $413=($psize_1>>>0)>16777215;
 if($413){var $I18_0=31;label=122;break;}else{label=121;break;}
 case 121: 
 var $415=((($410)+(1048320))|0);
 var $416=$415>>>16;
 var $417=$416&8;
 var $418=$410<<$417;
 var $419=((($418)+(520192))|0);
 var $420=$419>>>16;
 var $421=$420&4;
 var $422=$421|$417;
 var $423=$418<<$421;
 var $424=((($423)+(245760))|0);
 var $425=$424>>>16;
 var $426=$425&2;
 var $427=$422|$426;
 var $428=(((14)-($427))|0);
 var $429=$423<<$426;
 var $430=$429>>>15;
 var $431=((($428)+($430))|0);
 var $432=$431<<1;
 var $433=((($431)+(7))|0);
 var $434=$psize_1>>>($433>>>0);
 var $435=$434&1;
 var $436=$435|$432;
 var $I18_0=$436;label=122;break;
 case 122: 
 var $I18_0;
 var $438=((5080+($I18_0<<2))|0);
 var $439=(($p_0+28)|0);
 var $I18_0_c=$I18_0;
 HEAP32[(($439)>>2)]=$I18_0_c;
 var $440=(($p_0+20)|0);
 HEAP32[(($440)>>2)]=0;
 var $441=(($p_0+16)|0);
 HEAP32[(($441)>>2)]=0;
 var $442=HEAP32[((4780)>>2)];
 var $443=1<<$I18_0;
 var $444=$442&$443;
 var $445=($444|0)==0;
 if($445){label=123;break;}else{label=124;break;}
 case 123: 
 var $447=$442|$443;
 HEAP32[((4780)>>2)]=$447;
 HEAP32[(($438)>>2)]=$409;
 var $448=(($p_0+24)|0);
 var $_c=$438;
 HEAP32[(($448)>>2)]=$_c;
 var $449=(($p_0+12)|0);
 HEAP32[(($449)>>2)]=$p_0;
 var $450=(($p_0+8)|0);
 HEAP32[(($450)>>2)]=$p_0;
 label=136;break;
 case 124: 
 var $452=HEAP32[(($438)>>2)];
 var $453=($I18_0|0)==31;
 if($453){var $458=0;label=126;break;}else{label=125;break;}
 case 125: 
 var $455=$I18_0>>>1;
 var $456=(((25)-($455))|0);
 var $458=$456;label=126;break;
 case 126: 
 var $458;
 var $459=$psize_1<<$458;
 var $K19_0=$459;var $T_0=$452;label=127;break;
 case 127: 
 var $T_0;
 var $K19_0;
 var $461=(($T_0+4)|0);
 var $462=HEAP32[(($461)>>2)];
 var $463=$462&-8;
 var $464=($463|0)==($psize_1|0);
 if($464){label=132;break;}else{label=128;break;}
 case 128: 
 var $466=$K19_0>>>31;
 var $467=(($T_0+16+($466<<2))|0);
 var $468=HEAP32[(($467)>>2)];
 var $469=($468|0)==0;
 var $470=$K19_0<<1;
 if($469){label=129;break;}else{var $K19_0=$470;var $T_0=$468;label=127;break;}
 case 129: 
 var $472=$467;
 var $473=HEAP32[((4792)>>2)];
 var $474=($472>>>0)<($473>>>0);
 if($474){label=131;break;}else{label=130;break;}
 case 130: 
 HEAP32[(($467)>>2)]=$409;
 var $476=(($p_0+24)|0);
 var $T_0_c245=$T_0;
 HEAP32[(($476)>>2)]=$T_0_c245;
 var $477=(($p_0+12)|0);
 HEAP32[(($477)>>2)]=$p_0;
 var $478=(($p_0+8)|0);
 HEAP32[(($478)>>2)]=$p_0;
 label=136;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 var $481=(($T_0+8)|0);
 var $482=HEAP32[(($481)>>2)];
 var $483=$T_0;
 var $484=HEAP32[((4792)>>2)];
 var $485=($483>>>0)<($484>>>0);
 if($485){label=135;break;}else{label=133;break;}
 case 133: 
 var $487=$482;
 var $488=($487>>>0)<($484>>>0);
 if($488){label=135;break;}else{label=134;break;}
 case 134: 
 var $490=(($482+12)|0);
 HEAP32[(($490)>>2)]=$409;
 HEAP32[(($481)>>2)]=$409;
 var $491=(($p_0+8)|0);
 var $_c244=$482;
 HEAP32[(($491)>>2)]=$_c244;
 var $492=(($p_0+12)|0);
 var $T_0_c=$T_0;
 HEAP32[(($492)>>2)]=$T_0_c;
 var $493=(($p_0+24)|0);
 HEAP32[(($493)>>2)]=0;
 label=136;break;
 case 135: 
 _abort();
 throw "Reached an unreachable!";
 case 136: 
 var $495=HEAP32[((4808)>>2)];
 var $496=((($495)-(1))|0);
 HEAP32[((4808)>>2)]=$496;
 var $497=($496|0)==0;
 if($497){var $sp_0_in_i=5232;label=137;break;}else{label=140;break;}
 case 137: 
 var $sp_0_in_i;
 var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
 var $498=($sp_0_i|0)==0;
 var $499=(($sp_0_i+8)|0);
 if($498){label=138;break;}else{var $sp_0_in_i=$499;label=137;break;}
 case 138: 
 HEAP32[((4808)>>2)]=-1;
 label=140;break;
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
function _internal_memalign($alignment,$bytes){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($alignment>>>0)<16;
 var $_alignment=($1?16:$alignment);
 var $2=((($_alignment)-(1))|0);
 var $3=$2&$_alignment;
 var $4=($3|0)==0;
 if($4){var $_1=$_alignment;label=3;break;}else{var $a_0=16;label=2;break;}
 case 2: 
 var $a_0;
 var $5=($a_0>>>0)<($_alignment>>>0);
 var $6=$a_0<<1;
 if($5){var $a_0=$6;label=2;break;}else{var $_1=$a_0;label=3;break;}
 case 3: 
 var $_1;
 var $7=(((-64)-($_1))|0);
 var $8=($7>>>0)>($bytes>>>0);
 if($8){label=5;break;}else{label=4;break;}
 case 4: 
 var $10=___errno_location();
 HEAP32[(($10)>>2)]=12;
 var $mem_0=0;label=18;break;
 case 5: 
 var $12=($bytes>>>0)<11;
 if($12){var $17=16;label=7;break;}else{label=6;break;}
 case 6: 
 var $14=((($bytes)+(11))|0);
 var $15=$14&-8;
 var $17=$15;label=7;break;
 case 7: 
 var $17;
 var $18=((($_1)+(12))|0);
 var $19=((($18)+($17))|0);
 var $20=_malloc($19);
 var $21=($20|0)==0;
 if($21){var $mem_0=0;label=18;break;}else{label=8;break;}
 case 8: 
 var $23=((($20)-(8))|0);
 var $24=$23;
 var $25=$20;
 var $26=((($_1)-(1))|0);
 var $27=$25&$26;
 var $28=($27|0)==0;
 if($28){var $p_0=$24;label=14;break;}else{label=9;break;}
 case 9: 
 var $30=(($20+$26)|0);
 var $31=$30;
 var $32=(((-$_1))|0);
 var $33=$31&$32;
 var $34=$33;
 var $35=((($34)-(8))|0);
 var $36=$35;
 var $37=$23;
 var $38=((($36)-($37))|0);
 var $39=($38>>>0)>15;
 if($39){var $43=$35;label=11;break;}else{label=10;break;}
 case 10: 
 var $_sum3=((($_1)-(8))|0);
 var $41=(($34+$_sum3)|0);
 var $43=$41;label=11;break;
 case 11: 
 var $43;
 var $44=$43;
 var $45=$43;
 var $46=((($45)-($37))|0);
 var $47=((($20)-(4))|0);
 var $48=$47;
 var $49=HEAP32[(($48)>>2)];
 var $50=$49&-8;
 var $51=((($50)-($46))|0);
 var $52=$49&3;
 var $53=($52|0)==0;
 if($53){label=12;break;}else{label=13;break;}
 case 12: 
 var $55=$23;
 var $56=HEAP32[(($55)>>2)];
 var $57=((($56)+($46))|0);
 var $58=$43;
 HEAP32[(($58)>>2)]=$57;
 var $59=(($43+4)|0);
 var $60=$59;
 HEAP32[(($60)>>2)]=$51;
 var $p_0=$44;label=14;break;
 case 13: 
 var $62=(($43+4)|0);
 var $63=$62;
 var $64=HEAP32[(($63)>>2)];
 var $65=$64&1;
 var $66=$51|$65;
 var $67=$66|2;
 HEAP32[(($63)>>2)]=$67;
 var $_sum4=((($51)+(4))|0);
 var $68=(($43+$_sum4)|0);
 var $69=$68;
 var $70=HEAP32[(($69)>>2)];
 var $71=$70|1;
 HEAP32[(($69)>>2)]=$71;
 var $72=HEAP32[(($48)>>2)];
 var $73=$72&1;
 var $74=$46|$73;
 var $75=$74|2;
 HEAP32[(($48)>>2)]=$75;
 var $_sum6=((($46)-(4))|0);
 var $76=(($20+$_sum6)|0);
 var $77=$76;
 var $78=HEAP32[(($77)>>2)];
 var $79=$78|1;
 HEAP32[(($77)>>2)]=$79;
 _dispose_chunk($24,$46);
 var $p_0=$44;label=14;break;
 case 14: 
 var $p_0;
 var $81=(($p_0+4)|0);
 var $82=HEAP32[(($81)>>2)];
 var $83=$82&3;
 var $84=($83|0)==0;
 if($84){label=17;break;}else{label=15;break;}
 case 15: 
 var $86=$82&-8;
 var $87=((($17)+(16))|0);
 var $88=($86>>>0)>($87>>>0);
 if($88){label=16;break;}else{label=17;break;}
 case 16: 
 var $90=((($86)-($17))|0);
 var $91=$p_0;
 var $92=(($91+$17)|0);
 var $93=$92;
 var $94=$82&1;
 var $95=$17|$94;
 var $96=$95|2;
 HEAP32[(($81)>>2)]=$96;
 var $_sum1=$17|4;
 var $97=(($91+$_sum1)|0);
 var $98=$97;
 var $99=$90|3;
 HEAP32[(($98)>>2)]=$99;
 var $_sum2=$86|4;
 var $100=(($91+$_sum2)|0);
 var $101=$100;
 var $102=HEAP32[(($101)>>2)];
 var $103=$102|1;
 HEAP32[(($101)>>2)]=$103;
 _dispose_chunk($93,$90);
 label=17;break;
 case 17: 
 var $105=(($p_0+8)|0);
 var $106=$105;
 var $mem_0=$106;label=18;break;
 case 18: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
function _posix_memalign($pp,$alignment,$bytes){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($alignment|0)==8;
 if($1){label=2;break;}else{label=3;break;}
 case 2: 
 var $3=_malloc($bytes);
 var $mem_0=$3;label=7;break;
 case 3: 
 var $5=$alignment>>>2;
 var $6=$alignment&3;
 var $7=($6|0)!=0;
 var $8=($5|0)==0;
 var $or_cond=$7|$8;
 if($or_cond){var $_0=22;label=9;break;}else{label=4;break;}
 case 4: 
 var $10=((($5)+(1073741823))|0);
 var $11=$10&$5;
 var $12=($11|0)==0;
 if($12){label=5;break;}else{var $_0=22;label=9;break;}
 case 5: 
 var $14=(((-64)-($alignment))|0);
 var $15=($14>>>0)<($bytes>>>0);
 if($15){var $_0=12;label=9;break;}else{label=6;break;}
 case 6: 
 var $17=($alignment>>>0)<16;
 var $_alignment=($17?16:$alignment);
 var $18=_internal_memalign($_alignment,$bytes);
 var $mem_0=$18;label=7;break;
 case 7: 
 var $mem_0;
 var $20=($mem_0|0)==0;
 if($20){var $_0=12;label=9;break;}else{label=8;break;}
 case 8: 
 HEAP32[(($pp)>>2)]=$mem_0;
 var $_0=0;label=9;break;
 case 9: 
 var $_0;
 return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function _dispose_chunk($p,$psize){
 var label=0;
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$p;
 var $2=(($1+$psize)|0);
 var $3=$2;
 var $4=(($p+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=$5&1;
 var $7=($6|0)==0;
 if($7){label=2;break;}else{var $_0=$p;var $_0277=$psize;label=54;break;}
 case 2: 
 var $9=(($p)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$5&3;
 var $12=($11|0)==0;
 if($12){label=134;break;}else{label=3;break;}
 case 3: 
 var $14=(((-$10))|0);
 var $15=(($1+$14)|0);
 var $16=$15;
 var $17=((($10)+($psize))|0);
 var $18=HEAP32[((4792)>>2)];
 var $19=($15>>>0)<($18>>>0);
 if($19){label=53;break;}else{label=4;break;}
 case 4: 
 var $21=HEAP32[((4796)>>2)];
 var $22=($16|0)==($21|0);
 if($22){label=51;break;}else{label=5;break;}
 case 5: 
 var $24=$10>>>3;
 var $25=($10>>>0)<256;
 if($25){label=6;break;}else{label=18;break;}
 case 6: 
 var $_sum35=(((8)-($10))|0);
 var $27=(($1+$_sum35)|0);
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $_sum36=(((12)-($10))|0);
 var $30=(($1+$_sum36)|0);
 var $31=$30;
 var $32=HEAP32[(($31)>>2)];
 var $33=$24<<1;
 var $34=((4816+($33<<2))|0);
 var $35=$34;
 var $36=($29|0)==($35|0);
 if($36){label=9;break;}else{label=7;break;}
 case 7: 
 var $38=$29;
 var $39=($38>>>0)<($18>>>0);
 if($39){label=17;break;}else{label=8;break;}
 case 8: 
 var $41=(($29+12)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=($42|0)==($16|0);
 if($43){label=9;break;}else{label=17;break;}
 case 9: 
 var $44=($32|0)==($29|0);
 if($44){label=10;break;}else{label=11;break;}
 case 10: 
 var $46=1<<$24;
 var $47=$46^-1;
 var $48=HEAP32[((4776)>>2)];
 var $49=$48&$47;
 HEAP32[((4776)>>2)]=$49;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 11: 
 var $51=($32|0)==($35|0);
 if($51){label=12;break;}else{label=13;break;}
 case 12: 
 var $_pre62=(($32+8)|0);
 var $_pre_phi63=$_pre62;label=15;break;
 case 13: 
 var $53=$32;
 var $54=($53>>>0)<($18>>>0);
 if($54){label=16;break;}else{label=14;break;}
 case 14: 
 var $56=(($32+8)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=($57|0)==($16|0);
 if($58){var $_pre_phi63=$56;label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre_phi63;
 var $59=(($29+12)|0);
 HEAP32[(($59)>>2)]=$32;
 HEAP32[(($_pre_phi63)>>2)]=$29;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 16: 
 _abort();
 throw "Reached an unreachable!";
 case 17: 
 _abort();
 throw "Reached an unreachable!";
 case 18: 
 var $61=$15;
 var $_sum26=(((24)-($10))|0);
 var $62=(($1+$_sum26)|0);
 var $63=$62;
 var $64=HEAP32[(($63)>>2)];
 var $_sum27=(((12)-($10))|0);
 var $65=(($1+$_sum27)|0);
 var $66=$65;
 var $67=HEAP32[(($66)>>2)];
 var $68=($67|0)==($61|0);
 if($68){label=24;break;}else{label=19;break;}
 case 19: 
 var $_sum33=(((8)-($10))|0);
 var $70=(($1+$_sum33)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $73=$72;
 var $74=($73>>>0)<($18>>>0);
 if($74){label=23;break;}else{label=20;break;}
 case 20: 
 var $76=(($72+12)|0);
 var $77=HEAP32[(($76)>>2)];
 var $78=($77|0)==($61|0);
 if($78){label=21;break;}else{label=23;break;}
 case 21: 
 var $80=(($67+8)|0);
 var $81=HEAP32[(($80)>>2)];
 var $82=($81|0)==($61|0);
 if($82){label=22;break;}else{label=23;break;}
 case 22: 
 HEAP32[(($76)>>2)]=$67;
 HEAP32[(($80)>>2)]=$72;
 var $R_1=$67;label=31;break;
 case 23: 
 _abort();
 throw "Reached an unreachable!";
 case 24: 
 var $_sum28=(((16)-($10))|0);
 var $_sum29=((($_sum28)+(4))|0);
 var $85=(($1+$_sum29)|0);
 var $86=$85;
 var $87=HEAP32[(($86)>>2)];
 var $88=($87|0)==0;
 if($88){label=25;break;}else{var $R_0=$87;var $RP_0=$86;label=26;break;}
 case 25: 
 var $90=(($1+$_sum28)|0);
 var $91=$90;
 var $92=HEAP32[(($91)>>2)];
 var $93=($92|0)==0;
 if($93){var $R_1=0;label=31;break;}else{var $R_0=$92;var $RP_0=$91;label=26;break;}
 case 26: 
 var $RP_0;
 var $R_0;
 var $94=(($R_0+20)|0);
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=27;break;}else{var $R_0=$95;var $RP_0=$94;label=26;break;}
 case 27: 
 var $98=(($R_0+16)|0);
 var $99=HEAP32[(($98)>>2)];
 var $100=($99|0)==0;
 if($100){label=28;break;}else{var $R_0=$99;var $RP_0=$98;label=26;break;}
 case 28: 
 var $102=$RP_0;
 var $103=($102>>>0)<($18>>>0);
 if($103){label=30;break;}else{label=29;break;}
 case 29: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=31;break;
 case 30: 
 _abort();
 throw "Reached an unreachable!";
 case 31: 
 var $R_1;
 var $107=($64|0)==0;
 if($107){var $_0=$16;var $_0277=$17;label=54;break;}else{label=32;break;}
 case 32: 
 var $_sum30=(((28)-($10))|0);
 var $109=(($1+$_sum30)|0);
 var $110=$109;
 var $111=HEAP32[(($110)>>2)];
 var $112=((5080+($111<<2))|0);
 var $113=HEAP32[(($112)>>2)];
 var $114=($61|0)==($113|0);
 if($114){label=33;break;}else{label=35;break;}
 case 33: 
 HEAP32[(($112)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=34;break;}else{label=41;break;}
 case 34: 
 var $116=HEAP32[(($110)>>2)];
 var $117=1<<$116;
 var $118=$117^-1;
 var $119=HEAP32[((4780)>>2)];
 var $120=$119&$118;
 HEAP32[((4780)>>2)]=$120;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 35: 
 var $122=$64;
 var $123=HEAP32[((4792)>>2)];
 var $124=($122>>>0)<($123>>>0);
 if($124){label=39;break;}else{label=36;break;}
 case 36: 
 var $126=(($64+16)|0);
 var $127=HEAP32[(($126)>>2)];
 var $128=($127|0)==($61|0);
 if($128){label=37;break;}else{label=38;break;}
 case 37: 
 HEAP32[(($126)>>2)]=$R_1;
 label=40;break;
 case 38: 
 var $131=(($64+20)|0);
 HEAP32[(($131)>>2)]=$R_1;
 label=40;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $134=($R_1|0)==0;
 if($134){var $_0=$16;var $_0277=$17;label=54;break;}else{label=41;break;}
 case 41: 
 var $136=$R_1;
 var $137=HEAP32[((4792)>>2)];
 var $138=($136>>>0)<($137>>>0);
 if($138){label=50;break;}else{label=42;break;}
 case 42: 
 var $140=(($R_1+24)|0);
 HEAP32[(($140)>>2)]=$64;
 var $_sum31=(((16)-($10))|0);
 var $141=(($1+$_sum31)|0);
 var $142=$141;
 var $143=HEAP32[(($142)>>2)];
 var $144=($143|0)==0;
 if($144){label=46;break;}else{label=43;break;}
 case 43: 
 var $146=$143;
 var $147=HEAP32[((4792)>>2)];
 var $148=($146>>>0)<($147>>>0);
 if($148){label=45;break;}else{label=44;break;}
 case 44: 
 var $150=(($R_1+16)|0);
 HEAP32[(($150)>>2)]=$143;
 var $151=(($143+24)|0);
 HEAP32[(($151)>>2)]=$R_1;
 label=46;break;
 case 45: 
 _abort();
 throw "Reached an unreachable!";
 case 46: 
 var $_sum32=((($_sum31)+(4))|0);
 var $154=(($1+$_sum32)|0);
 var $155=$154;
 var $156=HEAP32[(($155)>>2)];
 var $157=($156|0)==0;
 if($157){var $_0=$16;var $_0277=$17;label=54;break;}else{label=47;break;}
 case 47: 
 var $159=$156;
 var $160=HEAP32[((4792)>>2)];
 var $161=($159>>>0)<($160>>>0);
 if($161){label=49;break;}else{label=48;break;}
 case 48: 
 var $163=(($R_1+20)|0);
 HEAP32[(($163)>>2)]=$156;
 var $164=(($156+24)|0);
 HEAP32[(($164)>>2)]=$R_1;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 49: 
 _abort();
 throw "Reached an unreachable!";
 case 50: 
 _abort();
 throw "Reached an unreachable!";
 case 51: 
 var $_sum=((($psize)+(4))|0);
 var $168=(($1+$_sum)|0);
 var $169=$168;
 var $170=HEAP32[(($169)>>2)];
 var $171=$170&3;
 var $172=($171|0)==3;
 if($172){label=52;break;}else{var $_0=$16;var $_0277=$17;label=54;break;}
 case 52: 
 HEAP32[((4784)>>2)]=$17;
 var $174=HEAP32[(($169)>>2)];
 var $175=$174&-2;
 HEAP32[(($169)>>2)]=$175;
 var $176=$17|1;
 var $_sum24=(((4)-($10))|0);
 var $177=(($1+$_sum24)|0);
 var $178=$177;
 HEAP32[(($178)>>2)]=$176;
 var $179=$2;
 HEAP32[(($179)>>2)]=$17;
 label=134;break;
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_0277;
 var $_0;
 var $181=HEAP32[((4792)>>2)];
 var $182=($2>>>0)<($181>>>0);
 if($182){label=133;break;}else{label=55;break;}
 case 55: 
 var $_sum1=((($psize)+(4))|0);
 var $184=(($1+$_sum1)|0);
 var $185=$184;
 var $186=HEAP32[(($185)>>2)];
 var $187=$186&2;
 var $188=($187|0)==0;
 if($188){label=56;break;}else{label=109;break;}
 case 56: 
 var $190=HEAP32[((4800)>>2)];
 var $191=($3|0)==($190|0);
 if($191){label=57;break;}else{label=59;break;}
 case 57: 
 var $193=HEAP32[((4788)>>2)];
 var $194=((($193)+($_0277))|0);
 HEAP32[((4788)>>2)]=$194;
 HEAP32[((4800)>>2)]=$_0;
 var $195=$194|1;
 var $196=(($_0+4)|0);
 HEAP32[(($196)>>2)]=$195;
 var $197=HEAP32[((4796)>>2)];
 var $198=($_0|0)==($197|0);
 if($198){label=58;break;}else{label=134;break;}
 case 58: 
 HEAP32[((4796)>>2)]=0;
 HEAP32[((4784)>>2)]=0;
 label=134;break;
 case 59: 
 var $201=HEAP32[((4796)>>2)];
 var $202=($3|0)==($201|0);
 if($202){label=60;break;}else{label=61;break;}
 case 60: 
 var $204=HEAP32[((4784)>>2)];
 var $205=((($204)+($_0277))|0);
 HEAP32[((4784)>>2)]=$205;
 HEAP32[((4796)>>2)]=$_0;
 var $206=$205|1;
 var $207=(($_0+4)|0);
 HEAP32[(($207)>>2)]=$206;
 var $208=$_0;
 var $209=(($208+$205)|0);
 var $210=$209;
 HEAP32[(($210)>>2)]=$205;
 label=134;break;
 case 61: 
 var $212=$186&-8;
 var $213=((($212)+($_0277))|0);
 var $214=$186>>>3;
 var $215=($186>>>0)<256;
 if($215){label=62;break;}else{label=74;break;}
 case 62: 
 var $_sum20=((($psize)+(8))|0);
 var $217=(($1+$_sum20)|0);
 var $218=$217;
 var $219=HEAP32[(($218)>>2)];
 var $_sum21=((($psize)+(12))|0);
 var $220=(($1+$_sum21)|0);
 var $221=$220;
 var $222=HEAP32[(($221)>>2)];
 var $223=$214<<1;
 var $224=((4816+($223<<2))|0);
 var $225=$224;
 var $226=($219|0)==($225|0);
 if($226){label=65;break;}else{label=63;break;}
 case 63: 
 var $228=$219;
 var $229=($228>>>0)<($181>>>0);
 if($229){label=73;break;}else{label=64;break;}
 case 64: 
 var $231=(($219+12)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==($3|0);
 if($233){label=65;break;}else{label=73;break;}
 case 65: 
 var $234=($222|0)==($219|0);
 if($234){label=66;break;}else{label=67;break;}
 case 66: 
 var $236=1<<$214;
 var $237=$236^-1;
 var $238=HEAP32[((4776)>>2)];
 var $239=$238&$237;
 HEAP32[((4776)>>2)]=$239;
 label=107;break;
 case 67: 
 var $241=($222|0)==($225|0);
 if($241){label=68;break;}else{label=69;break;}
 case 68: 
 var $_pre60=(($222+8)|0);
 var $_pre_phi61=$_pre60;label=71;break;
 case 69: 
 var $243=$222;
 var $244=($243>>>0)<($181>>>0);
 if($244){label=72;break;}else{label=70;break;}
 case 70: 
 var $246=(($222+8)|0);
 var $247=HEAP32[(($246)>>2)];
 var $248=($247|0)==($3|0);
 if($248){var $_pre_phi61=$246;label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre_phi61;
 var $249=(($219+12)|0);
 HEAP32[(($249)>>2)]=$222;
 HEAP32[(($_pre_phi61)>>2)]=$219;
 label=107;break;
 case 72: 
 _abort();
 throw "Reached an unreachable!";
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $251=$2;
 var $_sum2=((($psize)+(24))|0);
 var $252=(($1+$_sum2)|0);
 var $253=$252;
 var $254=HEAP32[(($253)>>2)];
 var $_sum3=((($psize)+(12))|0);
 var $255=(($1+$_sum3)|0);
 var $256=$255;
 var $257=HEAP32[(($256)>>2)];
 var $258=($257|0)==($251|0);
 if($258){label=80;break;}else{label=75;break;}
 case 75: 
 var $_sum18=((($psize)+(8))|0);
 var $260=(($1+$_sum18)|0);
 var $261=$260;
 var $262=HEAP32[(($261)>>2)];
 var $263=$262;
 var $264=($263>>>0)<($181>>>0);
 if($264){label=79;break;}else{label=76;break;}
 case 76: 
 var $266=(($262+12)|0);
 var $267=HEAP32[(($266)>>2)];
 var $268=($267|0)==($251|0);
 if($268){label=77;break;}else{label=79;break;}
 case 77: 
 var $270=(($257+8)|0);
 var $271=HEAP32[(($270)>>2)];
 var $272=($271|0)==($251|0);
 if($272){label=78;break;}else{label=79;break;}
 case 78: 
 HEAP32[(($266)>>2)]=$257;
 HEAP32[(($270)>>2)]=$262;
 var $R7_1=$257;label=87;break;
 case 79: 
 _abort();
 throw "Reached an unreachable!";
 case 80: 
 var $_sum5=((($psize)+(20))|0);
 var $275=(($1+$_sum5)|0);
 var $276=$275;
 var $277=HEAP32[(($276)>>2)];
 var $278=($277|0)==0;
 if($278){label=81;break;}else{var $R7_0=$277;var $RP9_0=$276;label=82;break;}
 case 81: 
 var $_sum4=((($psize)+(16))|0);
 var $280=(($1+$_sum4)|0);
 var $281=$280;
 var $282=HEAP32[(($281)>>2)];
 var $283=($282|0)==0;
 if($283){var $R7_1=0;label=87;break;}else{var $R7_0=$282;var $RP9_0=$281;label=82;break;}
 case 82: 
 var $RP9_0;
 var $R7_0;
 var $284=(($R7_0+20)|0);
 var $285=HEAP32[(($284)>>2)];
 var $286=($285|0)==0;
 if($286){label=83;break;}else{var $R7_0=$285;var $RP9_0=$284;label=82;break;}
 case 83: 
 var $288=(($R7_0+16)|0);
 var $289=HEAP32[(($288)>>2)];
 var $290=($289|0)==0;
 if($290){label=84;break;}else{var $R7_0=$289;var $RP9_0=$288;label=82;break;}
 case 84: 
 var $292=$RP9_0;
 var $293=($292>>>0)<($181>>>0);
 if($293){label=86;break;}else{label=85;break;}
 case 85: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=87;break;
 case 86: 
 _abort();
 throw "Reached an unreachable!";
 case 87: 
 var $R7_1;
 var $297=($254|0)==0;
 if($297){label=107;break;}else{label=88;break;}
 case 88: 
 var $_sum15=((($psize)+(28))|0);
 var $299=(($1+$_sum15)|0);
 var $300=$299;
 var $301=HEAP32[(($300)>>2)];
 var $302=((5080+($301<<2))|0);
 var $303=HEAP32[(($302)>>2)];
 var $304=($251|0)==($303|0);
 if($304){label=89;break;}else{label=91;break;}
 case 89: 
 HEAP32[(($302)>>2)]=$R7_1;
 var $cond53=($R7_1|0)==0;
 if($cond53){label=90;break;}else{label=97;break;}
 case 90: 
 var $306=HEAP32[(($300)>>2)];
 var $307=1<<$306;
 var $308=$307^-1;
 var $309=HEAP32[((4780)>>2)];
 var $310=$309&$308;
 HEAP32[((4780)>>2)]=$310;
 label=107;break;
 case 91: 
 var $312=$254;
 var $313=HEAP32[((4792)>>2)];
 var $314=($312>>>0)<($313>>>0);
 if($314){label=95;break;}else{label=92;break;}
 case 92: 
 var $316=(($254+16)|0);
 var $317=HEAP32[(($316)>>2)];
 var $318=($317|0)==($251|0);
 if($318){label=93;break;}else{label=94;break;}
 case 93: 
 HEAP32[(($316)>>2)]=$R7_1;
 label=96;break;
 case 94: 
 var $321=(($254+20)|0);
 HEAP32[(($321)>>2)]=$R7_1;
 label=96;break;
 case 95: 
 _abort();
 throw "Reached an unreachable!";
 case 96: 
 var $324=($R7_1|0)==0;
 if($324){label=107;break;}else{label=97;break;}
 case 97: 
 var $326=$R7_1;
 var $327=HEAP32[((4792)>>2)];
 var $328=($326>>>0)<($327>>>0);
 if($328){label=106;break;}else{label=98;break;}
 case 98: 
 var $330=(($R7_1+24)|0);
 HEAP32[(($330)>>2)]=$254;
 var $_sum16=((($psize)+(16))|0);
 var $331=(($1+$_sum16)|0);
 var $332=$331;
 var $333=HEAP32[(($332)>>2)];
 var $334=($333|0)==0;
 if($334){label=102;break;}else{label=99;break;}
 case 99: 
 var $336=$333;
 var $337=HEAP32[((4792)>>2)];
 var $338=($336>>>0)<($337>>>0);
 if($338){label=101;break;}else{label=100;break;}
 case 100: 
 var $340=(($R7_1+16)|0);
 HEAP32[(($340)>>2)]=$333;
 var $341=(($333+24)|0);
 HEAP32[(($341)>>2)]=$R7_1;
 label=102;break;
 case 101: 
 _abort();
 throw "Reached an unreachable!";
 case 102: 
 var $_sum17=((($psize)+(20))|0);
 var $344=(($1+$_sum17)|0);
 var $345=$344;
 var $346=HEAP32[(($345)>>2)];
 var $347=($346|0)==0;
 if($347){label=107;break;}else{label=103;break;}
 case 103: 
 var $349=$346;
 var $350=HEAP32[((4792)>>2)];
 var $351=($349>>>0)<($350>>>0);
 if($351){label=105;break;}else{label=104;break;}
 case 104: 
 var $353=(($R7_1+20)|0);
 HEAP32[(($353)>>2)]=$346;
 var $354=(($346+24)|0);
 HEAP32[(($354)>>2)]=$R7_1;
 label=107;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 _abort();
 throw "Reached an unreachable!";
 case 107: 
 var $358=$213|1;
 var $359=(($_0+4)|0);
 HEAP32[(($359)>>2)]=$358;
 var $360=$_0;
 var $361=(($360+$213)|0);
 var $362=$361;
 HEAP32[(($362)>>2)]=$213;
 var $363=HEAP32[((4796)>>2)];
 var $364=($_0|0)==($363|0);
 if($364){label=108;break;}else{var $_1=$213;label=110;break;}
 case 108: 
 HEAP32[((4784)>>2)]=$213;
 label=134;break;
 case 109: 
 var $367=$186&-2;
 HEAP32[(($185)>>2)]=$367;
 var $368=$_0277|1;
 var $369=(($_0+4)|0);
 HEAP32[(($369)>>2)]=$368;
 var $370=$_0;
 var $371=(($370+$_0277)|0);
 var $372=$371;
 HEAP32[(($372)>>2)]=$_0277;
 var $_1=$_0277;label=110;break;
 case 110: 
 var $_1;
 var $374=$_1>>>3;
 var $375=($_1>>>0)<256;
 if($375){label=111;break;}else{label=116;break;}
 case 111: 
 var $377=$374<<1;
 var $378=((4816+($377<<2))|0);
 var $379=$378;
 var $380=HEAP32[((4776)>>2)];
 var $381=1<<$374;
 var $382=$380&$381;
 var $383=($382|0)==0;
 if($383){label=112;break;}else{label=113;break;}
 case 112: 
 var $385=$380|$381;
 HEAP32[((4776)>>2)]=$385;
 var $_sum13_pre=((($377)+(2))|0);
 var $_pre=((4816+($_sum13_pre<<2))|0);
 var $F16_0=$379;var $_pre_phi=$_pre;label=115;break;
 case 113: 
 var $_sum14=((($377)+(2))|0);
 var $387=((4816+($_sum14<<2))|0);
 var $388=HEAP32[(($387)>>2)];
 var $389=$388;
 var $390=HEAP32[((4792)>>2)];
 var $391=($389>>>0)<($390>>>0);
 if($391){label=114;break;}else{var $F16_0=$388;var $_pre_phi=$387;label=115;break;}
 case 114: 
 _abort();
 throw "Reached an unreachable!";
 case 115: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$_0;
 var $394=(($F16_0+12)|0);
 HEAP32[(($394)>>2)]=$_0;
 var $395=(($_0+8)|0);
 HEAP32[(($395)>>2)]=$F16_0;
 var $396=(($_0+12)|0);
 HEAP32[(($396)>>2)]=$379;
 label=134;break;
 case 116: 
 var $398=$_0;
 var $399=$_1>>>8;
 var $400=($399|0)==0;
 if($400){var $I19_0=0;label=119;break;}else{label=117;break;}
 case 117: 
 var $402=($_1>>>0)>16777215;
 if($402){var $I19_0=31;label=119;break;}else{label=118;break;}
 case 118: 
 var $404=((($399)+(1048320))|0);
 var $405=$404>>>16;
 var $406=$405&8;
 var $407=$399<<$406;
 var $408=((($407)+(520192))|0);
 var $409=$408>>>16;
 var $410=$409&4;
 var $411=$410|$406;
 var $412=$407<<$410;
 var $413=((($412)+(245760))|0);
 var $414=$413>>>16;
 var $415=$414&2;
 var $416=$411|$415;
 var $417=(((14)-($416))|0);
 var $418=$412<<$415;
 var $419=$418>>>15;
 var $420=((($417)+($419))|0);
 var $421=$420<<1;
 var $422=((($420)+(7))|0);
 var $423=$_1>>>($422>>>0);
 var $424=$423&1;
 var $425=$424|$421;
 var $I19_0=$425;label=119;break;
 case 119: 
 var $I19_0;
 var $427=((5080+($I19_0<<2))|0);
 var $428=(($_0+28)|0);
 var $I19_0_c=$I19_0;
 HEAP32[(($428)>>2)]=$I19_0_c;
 var $429=(($_0+20)|0);
 HEAP32[(($429)>>2)]=0;
 var $430=(($_0+16)|0);
 HEAP32[(($430)>>2)]=0;
 var $431=HEAP32[((4780)>>2)];
 var $432=1<<$I19_0;
 var $433=$431&$432;
 var $434=($433|0)==0;
 if($434){label=120;break;}else{label=121;break;}
 case 120: 
 var $436=$431|$432;
 HEAP32[((4780)>>2)]=$436;
 HEAP32[(($427)>>2)]=$398;
 var $437=(($_0+24)|0);
 var $_c=$427;
 HEAP32[(($437)>>2)]=$_c;
 var $438=(($_0+12)|0);
 HEAP32[(($438)>>2)]=$_0;
 var $439=(($_0+8)|0);
 HEAP32[(($439)>>2)]=$_0;
 label=134;break;
 case 121: 
 var $441=HEAP32[(($427)>>2)];
 var $442=($I19_0|0)==31;
 if($442){var $447=0;label=123;break;}else{label=122;break;}
 case 122: 
 var $444=$I19_0>>>1;
 var $445=(((25)-($444))|0);
 var $447=$445;label=123;break;
 case 123: 
 var $447;
 var $448=$_1<<$447;
 var $K20_0=$448;var $T_0=$441;label=124;break;
 case 124: 
 var $T_0;
 var $K20_0;
 var $450=(($T_0+4)|0);
 var $451=HEAP32[(($450)>>2)];
 var $452=$451&-8;
 var $453=($452|0)==($_1|0);
 if($453){label=129;break;}else{label=125;break;}
 case 125: 
 var $455=$K20_0>>>31;
 var $456=(($T_0+16+($455<<2))|0);
 var $457=HEAP32[(($456)>>2)];
 var $458=($457|0)==0;
 var $459=$K20_0<<1;
 if($458){label=126;break;}else{var $K20_0=$459;var $T_0=$457;label=124;break;}
 case 126: 
 var $461=$456;
 var $462=HEAP32[((4792)>>2)];
 var $463=($461>>>0)<($462>>>0);
 if($463){label=128;break;}else{label=127;break;}
 case 127: 
 HEAP32[(($456)>>2)]=$398;
 var $465=(($_0+24)|0);
 var $T_0_c10=$T_0;
 HEAP32[(($465)>>2)]=$T_0_c10;
 var $466=(($_0+12)|0);
 HEAP32[(($466)>>2)]=$_0;
 var $467=(($_0+8)|0);
 HEAP32[(($467)>>2)]=$_0;
 label=134;break;
 case 128: 
 _abort();
 throw "Reached an unreachable!";
 case 129: 
 var $470=(($T_0+8)|0);
 var $471=HEAP32[(($470)>>2)];
 var $472=$T_0;
 var $473=HEAP32[((4792)>>2)];
 var $474=($472>>>0)<($473>>>0);
 if($474){label=132;break;}else{label=130;break;}
 case 130: 
 var $476=$471;
 var $477=($476>>>0)<($473>>>0);
 if($477){label=132;break;}else{label=131;break;}
 case 131: 
 var $479=(($471+12)|0);
 HEAP32[(($479)>>2)]=$398;
 HEAP32[(($470)>>2)]=$398;
 var $480=(($_0+8)|0);
 var $_c9=$471;
 HEAP32[(($480)>>2)]=$_c9;
 var $481=(($_0+12)|0);
 var $T_0_c=$T_0;
 HEAP32[(($481)>>2)]=$T_0_c;
 var $482=(($_0+24)|0);
 HEAP32[(($482)>>2)]=0;
 label=134;break;
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 _abort();
 throw "Reached an unreachable!";
 case 134: 
 return;
  default: assert(0, "bad label: " + label);
 }
}
function _getopt_internal($nargc,$nargv,$options,$long_options,$idx,$flags){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($options|0)==0;
 if($1){var $_059=-1;label=106;break;}else{label=2;break;}
 case 2: 
 var $3=HEAP32[((104)>>2)];
 var $4=($3|0)==0;
 if($4){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[((4712)>>2)]=1;
 HEAP32[((104)>>2)]=1;
 var $11=1;var $10=1;label=5;break;
 case 4: 
 var $_pre110=HEAP32[((4712)>>2)];
 var $6=HEAP32[((464)>>2)];
 var $7=($6|0)==-1;
 var $8=($_pre110|0)!=0;
 var $or_cond=$7|$8;
 if($or_cond){var $11=$_pre110;var $10=$3;label=5;break;}else{var $18=$6;var $17=$_pre110;var $16=$3;label=6;break;}
 case 5: 
 var $10;
 var $11;
 var $12=_getenv(1992);
 var $13=($12|0)!=0;
 var $14=($13&1);
 HEAP32[((464)>>2)]=$14;
 var $18=$14;var $17=$11;var $16=$10;label=6;break;
 case 6: 
 var $16;
 var $17;
 var $18;
 var $19=HEAP8[($options)];
 var $20=(($19<<24)>>24)==45;
 if($20){label=7;break;}else{label=8;break;}
 case 7: 
 var $21=$flags|2;
 var $_0119=$21;label=9;break;
 case 8: 
 var $23=($18|0)!=0;
 var $24=(($19<<24)>>24)==43;
 var $or_cond61=$23|$24;
 var $25=$flags&-2;
 var $_flags=($or_cond61?$25:$flags);
 var $cond=(($19<<24)>>24)==43;
 if($cond){var $_0119=$_flags;label=9;break;}else{var $_060=$options;var $_0120=$_flags;label=10;break;}
 case 9: 
 var $_0119;
 var $27=(($options+1)|0);
 var $_060=$27;var $_0120=$_0119;label=10;break;
 case 10: 
 var $_0120;
 var $_060;
 HEAP32[((4720)>>2)]=0;
 var $29=($17|0)==0;
 if($29){var $32=$16;label=13;break;}else{label=11;break;}
 case 11: 
 HEAP32[((128)>>2)]=-1;
 HEAP32[((120)>>2)]=-1;
 var $31=$16;var $_pr=$17;label=12;break;
 case 12: 
 var $_pr;
 var $31;
 var $phitmp=($_pr|0)==0;
 if($phitmp){var $32=$31;label=13;break;}else{var $37=$31;label=14;break;}
 case 13: 
 var $32;
 var $33=HEAP32[((88)>>2)];
 var $34=HEAP8[($33)];
 var $35=(($34<<24)>>24)==0;
 if($35){var $37=$32;label=14;break;}else{var $187=$33;var $186=$32;label=63;break;}
 case 14: 
 var $37;
 HEAP32[((4712)>>2)]=0;
 var $38=($37|0)<($nargc|0);
 if($38){label=28;break;}else{label=15;break;}
 case 15: 
 HEAP32[((88)>>2)]=4768;
 var $40=HEAP32[((128)>>2)];
 var $41=($40|0)==-1;
 var $42=HEAP32[((120)>>2)];
 if($41){label=25;break;}else{label=16;break;}
 case 16: 
 var $44=((($40)-($42))|0);
 var $45=((($37)-($40))|0);
 var $46=(((($44|0))%(($45|0)))&-1);
 var $47=($46|0)==0;
 if($47){var $_0_lcssa_i_i=$45;label=18;break;}else{var $_06_i_i=$45;var $c_07_i_i=$46;label=17;break;}
 case 17: 
 var $c_07_i_i;
 var $_06_i_i;
 var $48=(((($_06_i_i|0))%(($c_07_i_i|0)))&-1);
 var $49=($48|0)==0;
 if($49){var $_0_lcssa_i_i=$c_07_i_i;label=18;break;}else{var $_06_i_i=$c_07_i_i;var $c_07_i_i=$48;label=17;break;}
 case 18: 
 var $_0_lcssa_i_i;
 var $50=((($37)-($42))|0);
 var $51=(((($50|0))/(($_0_lcssa_i_i|0)))&-1);
 var $52=($_0_lcssa_i_i|0)>0;
 if($52){label=19;break;}else{var $69=$40;var $68=$42;var $67=$37;label=24;break;}
 case 19: 
 var $53=($51|0)>0;
 var $54=(((-$44))|0);
 if($53){var $i_026_us_i=0;label=22;break;}else{var $69=$40;var $68=$42;var $67=$37;label=24;break;}
 case 20: 
 var $56=((($i_026_us_i)+(1))|0);
 var $57=($56|0)<($_0_lcssa_i_i|0);
 if($57){var $i_026_us_i=$56;label=22;break;}else{label=23;break;}
 case 21: 
 var $59;
 var $pos_025_us_i;
 var $j_024_us_i;
 var $60=($pos_025_us_i|0)<($40|0);
 var $pos_1_p_us_i=($60?$45:$54);
 var $pos_1_us_i=((($pos_1_p_us_i)+($pos_025_us_i))|0);
 var $61=(($nargv+($pos_1_us_i<<2))|0);
 var $62=HEAP32[(($61)>>2)];
 HEAP32[(($61)>>2)]=$59;
 HEAP32[(($66)>>2)]=$62;
 var $63=((($j_024_us_i)+(1))|0);
 var $64=($63|0)<($51|0);
 if($64){var $j_024_us_i=$63;var $pos_025_us_i=$pos_1_us_i;var $59=$62;label=21;break;}else{label=20;break;}
 case 22: 
 var $i_026_us_i;
 var $65=((($i_026_us_i)+($40))|0);
 var $66=(($nargv+($65<<2))|0);
 var $_pre_i=HEAP32[(($66)>>2)];
 var $j_024_us_i=0;var $pos_025_us_i=$65;var $59=$_pre_i;label=21;break;
 case 23: 
 var $_pre99=HEAP32[((128)>>2)];
 var $_pre100=HEAP32[((120)>>2)];
 var $_pre101=HEAP32[((104)>>2)];
 var $69=$_pre99;var $68=$_pre100;var $67=$_pre101;label=24;break;
 case 24: 
 var $67;
 var $68;
 var $69;
 var $70=((($68)-($69))|0);
 var $71=((($70)+($67))|0);
 HEAP32[((104)>>2)]=$71;
 label=27;break;
 case 25: 
 var $73=($42|0)==-1;
 if($73){label=27;break;}else{label=26;break;}
 case 26: 
 HEAP32[((104)>>2)]=$42;
 label=27;break;
 case 27: 
 HEAP32[((128)>>2)]=-1;
 HEAP32[((120)>>2)]=-1;
 var $_059=-1;label=106;break;
 case 28: 
 var $77=(($nargv+($37<<2))|0);
 var $78=HEAP32[(($77)>>2)];
 HEAP32[((88)>>2)]=$78;
 var $79=HEAP8[($78)];
 var $80=(($79<<24)>>24)==45;
 if($80){label=29;break;}else{label=31;break;}
 case 29: 
 var $82=(($78+1)|0);
 var $83=HEAP8[($82)];
 var $84=(($83<<24)>>24)==0;
 if($84){label=30;break;}else{label=47;break;}
 case 30: 
 var $86=_strchr($_060,45);
 var $87=($86|0)==0;
 if($87){label=31;break;}else{label=47;break;}
 case 31: 
 HEAP32[((88)>>2)]=4768;
 var $89=$_0120&2;
 var $90=($89|0)==0;
 if($90){label=33;break;}else{label=32;break;}
 case 32: 
 var $92=((($37)+(1))|0);
 HEAP32[((104)>>2)]=$92;
 var $93=HEAP32[(($77)>>2)];
 HEAP32[((4720)>>2)]=$93;
 var $_059=1;label=106;break;
 case 33: 
 var $95=$_0120&1;
 var $96=($95|0)==0;
 if($96){var $_059=-1;label=106;break;}else{label=34;break;}
 case 34: 
 var $98=HEAP32[((120)>>2)];
 var $99=($98|0)==-1;
 if($99){label=35;break;}else{label=36;break;}
 case 35: 
 HEAP32[((120)>>2)]=$37;
 var $134=$37;var $_pr_pre=0;label=46;break;
 case 36: 
 var $102=HEAP32[((128)>>2)];
 var $103=($102|0)==-1;
 if($103){var $134=$37;var $_pr_pre=0;label=46;break;}else{label=37;break;}
 case 37: 
 var $105=((($102)-($98))|0);
 var $106=((($37)-($102))|0);
 var $107=(((($105|0))%(($106|0)))&-1);
 var $108=($107|0)==0;
 if($108){var $_0_lcssa_i_i66=$106;label=39;break;}else{var $_06_i_i64=$106;var $c_07_i_i63=$107;label=38;break;}
 case 38: 
 var $c_07_i_i63;
 var $_06_i_i64;
 var $109=(((($_06_i_i64|0))%(($c_07_i_i63|0)))&-1);
 var $110=($109|0)==0;
 if($110){var $_0_lcssa_i_i66=$c_07_i_i63;label=39;break;}else{var $_06_i_i64=$c_07_i_i63;var $c_07_i_i63=$109;label=38;break;}
 case 39: 
 var $_0_lcssa_i_i66;
 var $111=((($37)-($98))|0);
 var $112=(((($111|0))/(($_0_lcssa_i_i66|0)))&-1);
 var $113=($_0_lcssa_i_i66|0)>0;
 if($113){label=40;break;}else{var $130=$37;var $129=$102;var $128=$98;var $_pr_pre_pre=0;label=45;break;}
 case 40: 
 var $114=($112|0)>0;
 var $115=(((-$105))|0);
 if($114){var $i_026_us_i73=0;label=43;break;}else{var $130=$37;var $129=$102;var $128=$98;var $_pr_pre_pre=0;label=45;break;}
 case 41: 
 var $117=((($i_026_us_i73)+(1))|0);
 var $118=($117|0)<($_0_lcssa_i_i66|0);
 if($118){var $i_026_us_i73=$117;label=43;break;}else{label=44;break;}
 case 42: 
 var $120;
 var $pos_025_us_i69;
 var $j_024_us_i70;
 var $121=($pos_025_us_i69|0)<($102|0);
 var $pos_1_p_us_i71=($121?$106:$115);
 var $pos_1_us_i72=((($pos_1_p_us_i71)+($pos_025_us_i69))|0);
 var $122=(($nargv+($pos_1_us_i72<<2))|0);
 var $123=HEAP32[(($122)>>2)];
 HEAP32[(($122)>>2)]=$120;
 HEAP32[(($127)>>2)]=$123;
 var $124=((($j_024_us_i70)+(1))|0);
 var $125=($124|0)<($112|0);
 if($125){var $j_024_us_i70=$124;var $pos_025_us_i69=$pos_1_us_i72;var $120=$123;label=42;break;}else{label=41;break;}
 case 43: 
 var $i_026_us_i73;
 var $126=((($i_026_us_i73)+($102))|0);
 var $127=(($nargv+($126<<2))|0);
 var $_pre_i74=HEAP32[(($127)>>2)];
 var $j_024_us_i70=0;var $pos_025_us_i69=$126;var $120=$_pre_i74;label=42;break;
 case 44: 
 var $_pre96=HEAP32[((104)>>2)];
 var $_pre97=HEAP32[((128)>>2)];
 var $_pre98=HEAP32[((120)>>2)];
 var $_pr_pre_pre_pre=HEAP32[((4712)>>2)];
 var $130=$_pre96;var $129=$_pre97;var $128=$_pre98;var $_pr_pre_pre=$_pr_pre_pre_pre;label=45;break;
 case 45: 
 var $_pr_pre_pre;
 var $128;
 var $129;
 var $130;
 var $131=((($130)-($129))|0);
 var $132=((($131)+($128))|0);
 HEAP32[((120)>>2)]=$132;
 HEAP32[((128)>>2)]=-1;
 var $134=$130;var $_pr_pre=$_pr_pre_pre;label=46;break;
 case 46: 
 var $_pr_pre;
 var $134;
 var $135=((($134)+(1))|0);
 HEAP32[((104)>>2)]=$135;
 var $31=$135;var $_pr=$_pr_pre;label=12;break;
 case 47: 
 var $136=HEAP32[((120)>>2)];
 var $137=($136|0)!=-1;
 var $138=HEAP32[((128)>>2)];
 var $139=($138|0)==-1;
 var $or_cond3=$137&$139;
 if($or_cond3){label=48;break;}else{var $143=$83;var $142=$138;label=49;break;}
 case 48: 
 HEAP32[((128)>>2)]=$37;
 var $_pre=HEAP8[($82)];
 var $143=$_pre;var $142=$37;label=49;break;
 case 49: 
 var $142;
 var $143;
 var $144=(($143<<24)>>24)==0;
 if($144){var $187=$78;var $186=$37;label=63;break;}else{label=50;break;}
 case 50: 
 HEAP32[((88)>>2)]=$82;
 var $146=HEAP8[($82)];
 var $147=(($146<<24)>>24)==45;
 if($147){label=51;break;}else{var $187=$82;var $186=$37;label=63;break;}
 case 51: 
 var $149=(($78+2)|0);
 var $150=HEAP8[($149)];
 var $151=(($150<<24)>>24)==0;
 if($151){label=52;break;}else{var $187=$82;var $186=$37;label=63;break;}
 case 52: 
 var $153=((($37)+(1))|0);
 HEAP32[((104)>>2)]=$153;
 HEAP32[((88)>>2)]=4768;
 var $154=($142|0)==-1;
 if($154){label=62;break;}else{label=53;break;}
 case 53: 
 var $156=((($142)-($136))|0);
 var $157=((($153)-($142))|0);
 var $158=(((($156|0))%(($157|0)))&-1);
 var $159=($158|0)==0;
 if($159){var $_0_lcssa_i_i80=$157;label=55;break;}else{var $_06_i_i78=$157;var $c_07_i_i77=$158;label=54;break;}
 case 54: 
 var $c_07_i_i77;
 var $_06_i_i78;
 var $160=(((($_06_i_i78|0))%(($c_07_i_i77|0)))&-1);
 var $161=($160|0)==0;
 if($161){var $_0_lcssa_i_i80=$c_07_i_i77;label=55;break;}else{var $_06_i_i78=$c_07_i_i77;var $c_07_i_i77=$160;label=54;break;}
 case 55: 
 var $_0_lcssa_i_i80;
 var $162=((($153)-($136))|0);
 var $163=(((($162|0))/(($_0_lcssa_i_i80|0)))&-1);
 var $164=($_0_lcssa_i_i80|0)>0;
 if($164){label=56;break;}else{var $181=$142;var $180=$136;var $179=$153;label=61;break;}
 case 56: 
 var $165=($163|0)>0;
 var $166=(((-$156))|0);
 if($165){var $i_026_us_i87=0;label=59;break;}else{var $181=$142;var $180=$136;var $179=$153;label=61;break;}
 case 57: 
 var $168=((($i_026_us_i87)+(1))|0);
 var $169=($168|0)<($_0_lcssa_i_i80|0);
 if($169){var $i_026_us_i87=$168;label=59;break;}else{label=60;break;}
 case 58: 
 var $171;
 var $pos_025_us_i83;
 var $j_024_us_i84;
 var $172=($pos_025_us_i83|0)<($142|0);
 var $pos_1_p_us_i85=($172?$157:$166);
 var $pos_1_us_i86=((($pos_1_p_us_i85)+($pos_025_us_i83))|0);
 var $173=(($nargv+($pos_1_us_i86<<2))|0);
 var $174=HEAP32[(($173)>>2)];
 HEAP32[(($173)>>2)]=$171;
 HEAP32[(($178)>>2)]=$174;
 var $175=((($j_024_us_i84)+(1))|0);
 var $176=($175|0)<($163|0);
 if($176){var $j_024_us_i84=$175;var $pos_025_us_i83=$pos_1_us_i86;var $171=$174;label=58;break;}else{label=57;break;}
 case 59: 
 var $i_026_us_i87;
 var $177=((($i_026_us_i87)+($142))|0);
 var $178=(($nargv+($177<<2))|0);
 var $_pre_i88=HEAP32[(($178)>>2)];
 var $j_024_us_i84=0;var $pos_025_us_i83=$177;var $171=$_pre_i88;label=58;break;
 case 60: 
 var $_pre93=HEAP32[((128)>>2)];
 var $_pre94=HEAP32[((120)>>2)];
 var $_pre95=HEAP32[((104)>>2)];
 var $181=$_pre93;var $180=$_pre94;var $179=$_pre95;label=61;break;
 case 61: 
 var $179;
 var $180;
 var $181;
 var $182=((($180)-($181))|0);
 var $183=((($182)+($179))|0);
 HEAP32[((104)>>2)]=$183;
 label=62;break;
 case 62: 
 HEAP32[((128)>>2)]=-1;
 HEAP32[((120)>>2)]=-1;
 var $_059=-1;label=106;break;
 case 63: 
 var $186;
 var $187;
 var $188=($long_options|0)!=0;
 if($188){label=64;break;}else{var $209=$187;label=73;break;}
 case 64: 
 var $190=(($nargv+($186<<2))|0);
 var $191=HEAP32[(($190)>>2)];
 var $192=($187|0)==($191|0);
 if($192){var $209=$187;label=73;break;}else{label=65;break;}
 case 65: 
 var $194=HEAP8[($187)];
 var $195=(($194<<24)>>24)==45;
 if($195){label=68;break;}else{label=66;break;}
 case 66: 
 var $197=$_0120&4;
 var $198=($197|0)==0;
 if($198){var $209=$187;label=73;break;}else{label=67;break;}
 case 67: 
 var $cond125=(($194<<24)>>24)==58;
 if($cond125){var $short_too_0=0;label=70;break;}else{label=69;break;}
 case 68: 
 var $200=(($187+1)|0);
 HEAP32[((88)>>2)]=$200;
 var $short_too_0=0;label=70;break;
 case 69: 
 var $202=(($194<<24)>>24);
 var $203=_strchr($_060,$202);
 var $not_=($203|0)!=0;
 var $_=($not_&1);
 var $short_too_0=$_;label=70;break;
 case 70: 
 var $short_too_0;
 var $205=_parse_long_options($nargv,$_060,$long_options,$idx,$short_too_0);
 var $206=($205|0)==-1;
 if($206){label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre113=HEAP32[((88)>>2)];
 var $209=$_pre113;label=73;break;
 case 72: 
 HEAP32[((88)>>2)]=4768;
 var $_059=$205;label=106;break;
 case 73: 
 var $209;
 var $210=(($209+1)|0);
 HEAP32[((88)>>2)]=$210;
 var $211=HEAP8[($209)];
 var $212=(($211<<24)>>24);
 if((($211<<24)>>24)==45){ label=74;break;}else if((($211<<24)>>24)==58){ label=78;break;}else{label=75;break;}
 case 74: 
 var $214=HEAP8[($210)];
 var $215=(($214<<24)>>24)==0;
 if($215){label=75;break;}else{label=80;break;}
 case 75: 
 var $217=_strchr($_060,$212);
 var $218=($217|0)==0;
 if($218){label=76;break;}else{label=84;break;}
 case 76: 
 var $220=(($211<<24)>>24)==45;
 if($220){label=77;break;}else{label=78;break;}
 case 77: 
 var $_pre115=HEAP8[($210)];
 var $221=(($_pre115<<24)>>24)==0;
 if($221){var $_059=-1;label=106;break;}else{label=80;break;}
 case 78: 
 var $_pr123_pr=HEAP8[($210)];
 var $222=(($_pr123_pr<<24)>>24)==0;
 if($222){label=79;break;}else{label=80;break;}
 case 79: 
 var $224=HEAP32[((104)>>2)];
 var $225=((($224)+(1))|0);
 HEAP32[((104)>>2)]=$225;
 label=80;break;
 case 80: 
 var $226=HEAP32[((112)>>2)];
 var $227=($226|0)==0;
 if($227){label=83;break;}else{label=81;break;}
 case 81: 
 var $229=HEAP8[($_060)];
 var $230=(($229<<24)>>24)==58;
 if($230){label=83;break;}else{label=82;break;}
 case 82: 
 __warnx(440,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$212,tempVarArgs)); STACKTOP=tempVarArgs;
 label=83;break;
 case 83: 
 HEAP32[((96)>>2)]=$212;
 var $_059=63;label=106;break;
 case 84: 
 var $234=(($211<<24)>>24)==87;
 var $or_cond62=$188&$234;
 var $235=(($217+1)|0);
 var $236=HEAP8[($235)];
 var $237=(($236<<24)>>24)==59;
 var $or_cond126=$or_cond62&$237;
 if($or_cond126){label=85;break;}else{label=93;break;}
 case 85: 
 var $239=HEAP8[($210)];
 var $240=(($239<<24)>>24)==0;
 if($240){label=86;break;}else{label=92;break;}
 case 86: 
 var $242=HEAP32[((104)>>2)];
 var $243=((($242)+(1))|0);
 HEAP32[((104)>>2)]=$243;
 var $244=($243|0)<($nargc|0);
 if($244){label=91;break;}else{label=87;break;}
 case 87: 
 HEAP32[((88)>>2)]=4768;
 var $246=HEAP32[((112)>>2)];
 var $247=($246|0)==0;
 if($247){label=90;break;}else{label=88;break;}
 case 88: 
 var $249=HEAP8[($_060)];
 var $250=(($249<<24)>>24)==58;
 if($250){label=90;break;}else{label=89;break;}
 case 89: 
 __warnx(48,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$212,tempVarArgs)); STACKTOP=tempVarArgs;
 label=90;break;
 case 90: 
 HEAP32[((96)>>2)]=$212;
 var $253=HEAP8[($_060)];
 var $254=(($253<<24)>>24)==58;
 var $255=($254?58:63);
 var $_059=$255;label=106;break;
 case 91: 
 var $257=(($nargv+($243<<2))|0);
 var $258=HEAP32[(($257)>>2)];
 HEAP32[((88)>>2)]=$258;
 label=92;break;
 case 92: 
 var $260=_parse_long_options($nargv,$_060,$long_options,$idx,0);
 HEAP32[((88)>>2)]=4768;
 var $_059=$260;label=106;break;
 case 93: 
 var $261=(($236<<24)>>24)==58;
 if($261){label=96;break;}else{label=94;break;}
 case 94: 
 var $263=HEAP8[($210)];
 var $264=(($263<<24)>>24)==0;
 if($264){label=95;break;}else{var $_059=$212;label=106;break;}
 case 95: 
 var $266=HEAP32[((104)>>2)];
 var $267=((($266)+(1))|0);
 HEAP32[((104)>>2)]=$267;
 var $_059=$212;label=106;break;
 case 96: 
 HEAP32[((4720)>>2)]=0;
 var $269=HEAP8[($210)];
 var $270=(($269<<24)>>24)==0;
 if($270){label=98;break;}else{label=97;break;}
 case 97: 
 HEAP32[((4720)>>2)]=$210;
 label=105;break;
 case 98: 
 var $273=(($217+2)|0);
 var $274=HEAP8[($273)];
 var $275=(($274<<24)>>24)==58;
 if($275){label=105;break;}else{label=99;break;}
 case 99: 
 var $277=HEAP32[((104)>>2)];
 var $278=((($277)+(1))|0);
 HEAP32[((104)>>2)]=$278;
 var $279=($278|0)<($nargc|0);
 if($279){label=104;break;}else{label=100;break;}
 case 100: 
 HEAP32[((88)>>2)]=4768;
 var $281=HEAP32[((112)>>2)];
 var $282=($281|0)==0;
 if($282){label=103;break;}else{label=101;break;}
 case 101: 
 var $284=HEAP8[($_060)];
 var $285=(($284<<24)>>24)==58;
 if($285){label=103;break;}else{label=102;break;}
 case 102: 
 __warnx(48,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$212,tempVarArgs)); STACKTOP=tempVarArgs;
 label=103;break;
 case 103: 
 HEAP32[((96)>>2)]=$212;
 var $288=HEAP8[($_060)];
 var $289=(($288<<24)>>24)==58;
 var $290=($289?58:63);
 var $_059=$290;label=106;break;
 case 104: 
 var $292=(($nargv+($278<<2))|0);
 var $293=HEAP32[(($292)>>2)];
 HEAP32[((4720)>>2)]=$293;
 label=105;break;
 case 105: 
 HEAP32[((88)>>2)]=4768;
 var $294=HEAP32[((104)>>2)];
 var $295=((($294)+(1))|0);
 HEAP32[((104)>>2)]=$295;
 var $_059=$212;label=106;break;
 case 106: 
 var $_059;
 STACKTOP=sp;return $_059;
  default: assert(0, "bad label: " + label);
 }
}
function _getopt_long($nargc,$nargv,$options,$long_options,$idx){
 var label=0;
 var $1=_getopt_internal($nargc,$nargv,$options,$long_options,$idx,1);
 return $1;
}
function _parse_long_options($nargv,$options,$long_options,$idx,$short_too){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=HEAP32[((88)>>2)];
 var $2=HEAP32[((104)>>2)];
 var $3=((($2)+(1))|0);
 HEAP32[((104)>>2)]=$3;
 var $4=_strchr($1,61);
 var $5=($4|0)==0;
 if($5){label=3;break;}else{label=2;break;}
 case 2: 
 var $7=$4;
 var $8=$1;
 var $9=((($7)-($8))|0);
 var $10=(($4+1)|0);
 var $current_argv_len_0=$9;var $has_equal_0=$10;label=4;break;
 case 3: 
 var $12=_strlen($1);
 var $current_argv_len_0=$12;var $has_equal_0=0;label=4;break;
 case 4: 
 var $has_equal_0;
 var $current_argv_len_0;
 var $14=(($long_options)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)==0;
 if($16){label=37;break;}else{label=5;break;}
 case 5: 
 var $17=($short_too|0)!=0;
 var $18=($current_argv_len_0|0)==1;
 var $or_cond63=$17&$18;
 if($or_cond63){var $i_065_us=0;var $19=$15;label=6;break;}else{var $i_065=0;var $match_066=-1;var $29=$15;label=9;break;}
 case 6: 
 var $19;
 var $i_065_us;
 var $lhsc=HEAP8[($1)];
 var $rhsc=HEAP8[($19)];
 var $20=(($lhsc<<24)>>24)==(($rhsc<<24)>>24);
 if($20){label=7;break;}else{label=8;break;}
 case 7: 
 var $22=_strlen($19);
 var $23=($22|0)==1;
 if($23){var $match_2=$i_065_us;label=17;break;}else{label=8;break;}
 case 8: 
 var $25=((($i_065_us)+(1))|0);
 var $26=(($long_options+($25<<4))|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=($27|0)==0;
 if($28){label=37;break;}else{var $i_065_us=$25;var $19=$27;label=6;break;}
 case 9: 
 var $29;
 var $match_066;
 var $i_065;
 var $30=_strncmp($1,$29,$current_argv_len_0);
 var $31=($30|0)==0;
 if($31){label=10;break;}else{var $match_1=$match_066;label=16;break;}
 case 10: 
 var $33=_strlen($29);
 var $34=($33|0)==($current_argv_len_0|0);
 if($34){var $match_2=$i_065;label=17;break;}else{label=11;break;}
 case 11: 
 var $36=($match_066|0)==-1;
 if($36){var $match_1=$i_065;label=16;break;}else{label=12;break;}
 case 12: 
 var $37=HEAP32[((112)>>2)];
 var $38=($37|0)==0;
 if($38){label=15;break;}else{label=13;break;}
 case 13: 
 var $40=HEAP8[($options)];
 var $41=(($40<<24)>>24)==58;
 if($41){label=15;break;}else{label=14;break;}
 case 14: 
 __warnx(472,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$current_argv_len_0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1,tempVarArgs)); STACKTOP=tempVarArgs;
 label=15;break;
 case 15: 
 HEAP32[((96)>>2)]=0;
 var $_0=63;label=47;break;
 case 16: 
 var $match_1;
 var $45=((($i_065)+(1))|0);
 var $46=(($long_options+($45<<4))|0);
 var $47=HEAP32[(($46)>>2)];
 var $48=($47|0)==0;
 if($48){var $match_2=$match_1;label=17;break;}else{var $i_065=$45;var $match_066=$match_1;var $29=$47;label=9;break;}
 case 17: 
 var $match_2;
 var $49=($match_2|0)==-1;
 if($49){label=37;break;}else{label=18;break;}
 case 18: 
 var $51=(($long_options+($match_2<<4)+4)|0);
 var $52=HEAP32[(($51)>>2)];
 var $53=($52|0)!=0;
 var $54=($has_equal_0|0)==0;
 var $or_cond64=$53|$54;
 if($or_cond64){label=25;break;}else{label=19;break;}
 case 19: 
 var $56=HEAP32[((112)>>2)];
 var $57=($56|0)==0;
 if($57){label=22;break;}else{label=20;break;}
 case 20: 
 var $59=HEAP8[($options)];
 var $60=(($59<<24)>>24)==58;
 if($60){label=22;break;}else{label=21;break;}
 case 21: 
 __warnx(136,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$current_argv_len_0,HEAP32[(((tempVarArgs)+(8))>>2)]=$1,tempVarArgs)); STACKTOP=tempVarArgs;
 label=22;break;
 case 22: 
 var $63=(($long_options+($match_2<<4)+8)|0);
 var $64=HEAP32[(($63)>>2)];
 var $65=($64|0)==0;
 if($65){label=23;break;}else{var $storemerge62=0;label=24;break;}
 case 23: 
 var $67=(($long_options+($match_2<<4)+12)|0);
 var $68=HEAP32[(($67)>>2)];
 var $storemerge62=$68;label=24;break;
 case 24: 
 var $storemerge62;
 HEAP32[((96)>>2)]=$storemerge62;
 var $70=HEAP8[($options)];
 var $71=(($70<<24)>>24)==58;
 var $72=($71?58:63);
 var $_0=$72;label=47;break;
 case 25: 
 var $_off=((($52)-(1))|0);
 var $switch=($_off>>>0)<2;
 if($switch){label=26;break;}else{label=30;break;}
 case 26: 
 if($54){label=28;break;}else{label=27;break;}
 case 27: 
 HEAP32[((4720)>>2)]=$has_equal_0;
 label=30;break;
 case 28: 
 var $77=($52|0)==1;
 if($77){label=29;break;}else{label=30;break;}
 case 29: 
 var $79=((($2)+(2))|0);
 HEAP32[((104)>>2)]=$79;
 var $80=(($nargv+($3<<2))|0);
 var $81=HEAP32[(($80)>>2)];
 HEAP32[((4720)>>2)]=$81;
 label=30;break;
 case 30: 
 var $82=HEAP32[(($51)>>2)];
 var $83=($82|0)==1;
 var $84=HEAP32[((4720)>>2)];
 var $85=($84|0)==0;
 var $or_cond=$83&$85;
 if($or_cond){label=31;break;}else{label=43;break;}
 case 31: 
 var $87=HEAP32[((112)>>2)];
 var $88=($87|0)==0;
 if($88){label=34;break;}else{label=32;break;}
 case 32: 
 var $90=HEAP8[($options)];
 var $91=(($90<<24)>>24)==58;
 if($91){label=34;break;}else{label=33;break;}
 case 33: 
 __warnx(8,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1,tempVarArgs)); STACKTOP=tempVarArgs;
 label=34;break;
 case 34: 
 var $94=(($long_options+($match_2<<4)+8)|0);
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=35;break;}else{var $storemerge=0;label=36;break;}
 case 35: 
 var $98=(($long_options+($match_2<<4)+12)|0);
 var $99=HEAP32[(($98)>>2)];
 var $storemerge=$99;label=36;break;
 case 36: 
 var $storemerge;
 HEAP32[((96)>>2)]=$storemerge;
 var $100=HEAP32[((104)>>2)];
 var $101=((($100)-(1))|0);
 HEAP32[((104)>>2)]=$101;
 var $102=HEAP8[($options)];
 var $103=(($102<<24)>>24)==58;
 var $104=($103?58:63);
 var $_0=$104;label=47;break;
 case 37: 
 var $105=($short_too|0)==0;
 if($105){label=39;break;}else{label=38;break;}
 case 38: 
 HEAP32[((104)>>2)]=$2;
 var $_0=-1;label=47;break;
 case 39: 
 var $108=HEAP32[((112)>>2)];
 var $109=($108|0)==0;
 if($109){label=42;break;}else{label=40;break;}
 case 40: 
 var $111=HEAP8[($options)];
 var $112=(($111<<24)>>24)==58;
 if($112){label=42;break;}else{label=41;break;}
 case 41: 
 __warnx(416,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1,tempVarArgs)); STACKTOP=tempVarArgs;
 label=42;break;
 case 42: 
 HEAP32[((96)>>2)]=0;
 var $_0=63;label=47;break;
 case 43: 
 var $116=($idx|0)==0;
 if($116){label=45;break;}else{label=44;break;}
 case 44: 
 HEAP32[(($idx)>>2)]=$match_2;
 label=45;break;
 case 45: 
 var $119=(($long_options+($match_2<<4)+8)|0);
 var $120=HEAP32[(($119)>>2)];
 var $121=($120|0)==0;
 var $122=(($long_options+($match_2<<4)+12)|0);
 var $123=HEAP32[(($122)>>2)];
 if($121){var $_0=$123;label=47;break;}else{label=46;break;}
 case 46: 
 HEAP32[(($120)>>2)]=$123;
 var $_0=0;label=47;break;
 case 47: 
 var $_0;
 STACKTOP=sp;return $_0;
  default: assert(0, "bad label: " + label);
 }
}
function __warnx($fmt,varrp){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $ap=sp;
 var $1=(($ap)|0);
 var $2=$ap;
 HEAP32[(($2)>>2)]=varrp;HEAP32[((($2)+(4))>>2)]=0;
 var $3=__vwarnx($fmt,$1);
 STACKTOP=sp;return;
}
function __vwarnx($fmt,$ap){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=HEAP32[((_stderr)>>2)];
 var $2=HEAP32[((___progname)>>2)];
 var $3=_fprintf($1,3888,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$2,tempVarArgs)); STACKTOP=tempVarArgs;
 var $4=($fmt|0)==0;
 if($4){label=3;break;}else{label=2;break;}
 case 2: 
 var $6=_vfprintf($1,$fmt,$ap);
 label=3;break;
 case 3: 
 var $fputc=_fputc(10,$1);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }
}
// EMSCRIPTEN_END_FUNCS
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return tempRet0 = h,l|0;
  }
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return tempRet0 = h,l|0;
  }
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
  }
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
  }
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
  }
function _llvm_ctlz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = HEAP8[(((ctlz_i8)+(x >>> 24))|0)];
    if ((ret|0) < 8) return ret|0;
    ret = HEAP8[(((ctlz_i8)+((x >> 16)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = HEAP8[(((ctlz_i8)+((x >> 8)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 16)|0;
    return (HEAP8[(((ctlz_i8)+(x&0xff))|0)] + 24)|0;
  }
/* PRE_ASM */ var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = HEAP8[(((cttz_i8)+(x & 0xff))|0)];
    if ((ret|0) < 8) return ret|0;
    ret = HEAP8[(((cttz_i8)+((x >> 8)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = HEAP8[(((cttz_i8)+((x >> 16)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 16)|0;
    return (HEAP8[(((cttz_i8)+(x >>> 24))|0)] + 24)|0;
  }
/* PRE_ASM */ var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return (tempRet0 = tempRet0, $10$0) | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return (tempRet0 = tempRet0, $1$0) | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================
// EMSCRIPTEN_END_FUNCS
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
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
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
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
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    Module['calledRun'] = true;
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
  throw 'abort() at ' + stackTrace();
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
//@ sourceMappingURL=book_spmv.js.map