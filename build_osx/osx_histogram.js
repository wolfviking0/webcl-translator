
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
    var PACKAGE_NAME = '../build/osx_histogram.data';
    var REMOTE_PACKAGE_NAME = (Module['filePackagePrefixURL'] || '') + 'osx_histogram.data';
    var REMOTE_PACKAGE_SIZE = 22183;
    var PACKAGE_UUID = '3a20c661-8bef-4780-98b4-0d50a1e85aea';
  
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
      new DataRequest(0, 11765, 0, 0).open('GET', '/gpu_histogram_buffer.cl');
    new DataRequest(11765, 22183, 0, 0).open('GET', '/gpu_histogram_image.cl');

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/gpu_histogram_buffer.cl"].onload();
          DataRequest.prototype.requests["/gpu_histogram_image.cl"].onload();
          Module['removeRunDependency']('datafile_../build/osx_histogram.data');

    };
    Module['addRunDependency']('datafile_../build/osx_histogram.data');
  
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
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
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
    return rawList ? list : ret + flushList();
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
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 104857600;
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

STATICTOP = STATIC_BASE + Runtime.alignMemory(2851);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([103,112,117,95,104,105,115,116,111,103,114,97,109,95,98,117,102,102,101,114,46,99,108,0,103,112,117,95,104,105,115,116,111,103,114,97,109,95,105,109,97,103,101,46,99,108,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,10,0,84,101,115,116,105,110,103,32,72,105,115,116,111,103,114,97,109,32,119,105,116,104,32,66,117,102,102,101,114,115,10,0,114,101,97,100,95,107,101,114,110,101,108,95,102,114,111,109,95,102,105,108,101,40,41,32,102,97,105,108,101,100,46,32,40,37,115,41,32,102,105,108,101,32,110,111,116,32,102,111,117,110,100,10,0,0,0,0,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,0,0,0,0,0,0,99,108,66,117,105,108,100,80,114,111,103,114,97,109,40,41,32,102,97,105,108,101,100,46,10,0,0,0,0,0,0,0,76,111,103,58,10,37,115,10,0,0,0,0,0,0,0,0,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,117,110,111,114,109,56,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,99,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,118,111,105,100,32,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,117,110,111,114,109,56,40,41,46,32,40,37,100,41,10,0,0,0,0,0,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,102,112,49,54,0,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,99,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,118,111,105,100,32,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,102,112,49,54,40,41,46,32,40,37,100,41,10,0,0,0,0,0,0,0,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,102,112,51,50,0,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,99,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,118,111,105,100,32,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,102,112,51,50,40,41,46,32,40,37,100,41,10,0,0,0,0,0,0,0,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,117,110,111,114,109,56,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,99,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,118,111,105,100,32,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,117,110,111,114,109,56,40,41,46,32,40,37,100,41,10,0,0,0,0,0,0,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,102,112,0,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,99,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,118,111,105,100,32,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,102,112,40,41,46,32,40,37,100,41,10,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,117,110,111,114,109,56,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,65,32,109,105,110,46,32,111,102,32,50,53,54,32,119,111,114,107,45,105,116,101,109,115,32,105,110,32,119,111,114,107,45,103,114,111,117,112,32,105,115,32,110,101,101,100,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,117,110,111,114,109,56,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,117,110,111,114,109,56,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,0,99,108,69,110,113,117,101,117,101,82,101,97,100,66,117,102,102,101,114,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,0,0,0,0,82,71,66,65,32,56,45,98,105,116,0,0,0,0,0,0,232,3,0,0,0,0,0,0,80,101,114,102,111,114,109,97,110,99,101,32,78,117,109,98,101,114,32,84,105,109,101,32,116,111,32,99,111,109,112,117,116,101,32,82,71,66,65,32,117,110,111,114,109,56,32,104,105,115,116,111,103,114,97,109,10,32,40,105,110,32,37,115,44,32,37,115,41,58,32,37,103,10,0,0,0,0,0,0,109,115,0,0,0,0,0,0,108,111,119,101,114,32,105,115,32,98,101,116,116,101,114,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,102,112,51,50,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,0,0,65,32,109,105,110,46,32,111,102,32,50,53,54,32,119,111,114,107,45,105,116,101,109,115,32,105,110,32,119,111,114,107,45,103,114,111,117,112,32,105,115,32,110,101,101,100,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,102,112,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,0,0,0,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,115,117,109,95,112,97,114,116,105,97,108,95,114,101,115,117,108,116,115,95,102,112,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,0,0,0,0,0,82,71,66,65,32,102,112,51,50,0,0,0,0,0,0,0,80,101,114,102,111,114,109,97,110,99,101,32,78,117,109,98,101,114,32,84,105,109,101,32,116,111,32,99,111,109,112,117,116,101,32,82,71,66,65,32,102,112,51,50,32,104,105,115,116,111,103,114,97,109,10,32,40,105,110,32,37,115,44,32,37,115,41,58,32,37,103,10,0,0,0,0,0,0,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,10,0,0,84,101,115,116,105,110,103,32,72,105,115,116,111,103,114,97,109,32,119,105,116,104,32,73,109,97,103,101,115,10,0,0,104,105,115,116,111,103,114,97,109,95,105,109,97,103,101,95,114,103,98,97,95,117,110,111,114,109,56,0,0,0,0,0,104,105,115,116,111,103,114,97,109,95,105,109,97,103,101,95,114,103,98,97,95,102,112,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,99,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,118,111,105,100,32,104,105,115,116,111,103,114,97,109,95,105,109,97,103,101,95,114,103,98,97,95,102,112,40,41,46,32,40,37,100,41,10,0,0,0,99,108,67,114,101,97,116,101,73,109,97,103,101,50,68,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,40,41,32,102,97,105,108,101,100,32,102,111,114,32,104,105,115,116,111,103,114,97,109,95,114,103,98,97,95,102,112,32,107,101,114,110,101,108,46,32,40,37,100,41,10,0,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,0,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,99,108,95,107,104,114,95,108,111,99,97,108,95,105,110,116,51,50,95,98,97,115,101,95,97,116,111,109,105,99,115,0,84,104,101,32,99,108,95,107,104,114,95,108,111,99,97,108,95,105,110,116,51,50,95,98,97,115,101,95,97,116,111,109,105,99,115,32,101,120,116,101,110,115,105,111,110,32,114,101,113,117,105,114,101,100,32,98,121,32,116,104,105,115,32,101,120,97,109,112,108,101,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,40,41,32,102,97,105,108,101,100,46,32,40,37,100,41,10,0,0,0,0,37,115,58,32,118,101,114,105,102,121,95,104,105,115,116,111,103,114,97,109,95,114,101,115,117,108,116,115,32,102,97,105,108,101,100,32,102,111,114,32,105,110,100,120,32,61,32,37,100,44,32,103,112,117,32,114,101,115,117,108,116,32,61,32,37,100,44,32,101,120,112,101,99,116,101,100,32,114,101,115,117,108,116,32,61,32,37,100,10,0,0,0,0,0,0,0,37,115,58,32,118,101,114,105,102,105,101,100,10,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




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


  function _llvm_lifetime_end() {}

  
   
  Module["_rand_r"] = _rand_r;
  
  var ___rand_seed=allocate([0x0273459b, 0, 0, 0], "i32", ALLOC_STATIC); 
  Module["_rand"] = _rand;

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
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

  
  
  var GL={counter:1,lastError:0,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},packAlignment:4,unpackAlignment:4,init:function () {
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
      }};var CL={cl_init:0,cl_extensions:["KHR_GL_SHARING","KHR_fp16","KHR_fp64"],cl_digits:[1,2,3,4,5,6,7,8,9,0],cl_kernels_sig:{},cl_structs_sig:{},cl_pn_type:[],cl_objects:{},cl_objects_map:{},cl_objects_retains:{},cl_objects_mem_callback:{},init:function () {
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
        var _security = 10;
  
        // Search all the kernel
        while (_found && _security) {
          // Just in case no more than 10 loop
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
      }};function _clGetDeviceIDs(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
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

  function _srand(seed) {
      HEAP32[((___rand_seed)>>2)]=seed
    }

  function _clReleaseKernel(kernel) {
  
      // If is an object retain don't release it until retains > 0...
      if (kernel in CL.cl_objects_retains) {
  
        var _retain = CL.cl_objects_retains[kernel] - 1;
  
        CL.cl_objects_retains[kernel] = _retain;
  
        if (_retain >= 0) {
          return webcl.SUCCESS;
        }
      }
  
  
      try {
  
        CL.cl_objects[kernel].release();
          
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
      delete CL.cl_objects[kernel];
  
  
      return webcl.SUCCESS;
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

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
          if (_glclSharedContext) {       
            if (_devices.length == 1) {
              _context = webcl.createContext(Module.ctx,_devices[0]); 
            } else {
              _context = webcl.createContext(Module.ctx,_devices); 
            }
          } else {
          
            if (_devices.length == 1) {
              _context = webcl.createContext(_devices[0]); 
            } else {
              _context = webcl.createContext(_devices);  
            }
          }
        } else if (_platform != null) {
          
          if (_glclSharedContext) {
            _context = webcl.createContext(Module.ctx,_platform);  
          } else {
            _context = webcl.createContext(_platform);  
          }
  
        } else {
  
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
          }
  
          return 0; // NULL Pointer      
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

  
  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
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
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      return FS.getStreamFromPtr(stream).fd;
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

  function _clBuildProgram(program,num_devices,device_list,options,pfn_notify,user_data) {
  
      try {
  
        var _devices = [];
        var _option = (options == 0) ? "" : Pointer_stringify(options); 
  
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


  function _clGetDeviceInfo(device,param_name,param_value_size,param_value,param_value_size_ret) {
  
    
      var  _info = null;
  
      try { 
  
          var _object = CL.cl_objects[device];
  
        switch (param_name) {
          case 0x1001 /*CL_DEVICE_VENDOR_ID*/ :
            _info = parseInt(CL.udid(_object));
          break;
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

  function _clEnqueueNDRangeKernel(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
  
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

  function _clReleaseProgram(program) {
  
  
      // If is an object retain don't release it until retains > 0...
      if (program in CL.cl_objects_retains) {
  
        var _retain = CL.cl_objects_retains[program] - 1;
  
        CL.cl_objects_retains[program] = _retain;
  
        if (_retain >= 0) {
          return webcl.SUCCESS;
        }
      }
  
      try {
  
          CL.cl_objects[program].release();
          delete CL.cl_objects[program]; 
  
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
  
      return webcl.SUCCESS;
  
    }

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
        HEAP32[(((buf)+(12))>>2)]=stat.mode;
        HEAP32[(((buf)+(16))>>2)]=stat.nlink;
        HEAP32[(((buf)+(20))>>2)]=stat.uid;
        HEAP32[(((buf)+(24))>>2)]=stat.gid;
        HEAP32[(((buf)+(28))>>2)]=stat.rdev;
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size;
        HEAP32[(((buf)+(40))>>2)]=4096;
        HEAP32[(((buf)+(44))>>2)]=stat.blocks;
        HEAP32[(((buf)+(48))>>2)]=Math.floor(stat.atime.getTime() / 1000);
        HEAP32[(((buf)+(52))>>2)]=0;
        HEAP32[(((buf)+(56))>>2)]=Math.floor(stat.mtime.getTime() / 1000);
        HEAP32[(((buf)+(60))>>2)]=0;
        HEAP32[(((buf)+(64))>>2)]=Math.floor(stat.ctime.getTime() / 1000);
        HEAP32[(((buf)+(68))>>2)]=0;
        HEAP32[(((buf)+(72))>>2)]=stat.ino;
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
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

  function _clReleaseCommandQueue(command_queue) {
  
      // If is an object retain don't release it until retains > 0...
      if (command_queue in CL.cl_objects_retains) {
  
        var _retain = CL.cl_objects_retains[command_queue] - 1;
  
        CL.cl_objects_retains[command_queue] = _retain;
  
        if (_retain >= 0) {
          return webcl.SUCCESS;
        }
      }
  
      try {
  
          CL.cl_objects[command_queue].release();
          delete CL.cl_objects[command_queue];  
  
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
      return webcl.SUCCESS;
    }

  
  function _close(fildes) {
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
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      var fd = _fileno(stream);
      _fsync(fd);
      return _close(fd);
    }

  function _clReleaseContext(context) {
  
  
      // If is an object retain don't release it until retains > 0...
      if (context in CL.cl_objects_retains) {
  
        var _retain = CL.cl_objects_retains[context] - 1;
  
        CL.cl_objects_retains[context] = _retain;
  
        if (_retain >= 0) {
          return webcl.SUCCESS;
        }
      }
  
      try {
  
          CL.cl_objects[context].release();
          delete CL.cl_objects[context];     
  
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
      return webcl.SUCCESS;
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

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _strstr(ptr1, ptr2) {
      var check = 0, start;
      do {
        if (!check) {
          start = ptr1;
          check = ptr2;
        }
        var curr1 = HEAP8[((ptr1++)|0)];
        var curr2 = HEAP8[((check++)|0)];
        if (curr2 == 0) return start;
        if (curr2 != curr1) {
          // rewind to one character after start, to find ez in eeez
          ptr1 = start + 1;
          check = 0;
        }
      } while (curr1);
      return 0;
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

  function ___errno_location() {
      return ___errno_state;
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

  function _clCreateImage2D(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      
  
      var _id = null;
      var _image = null;
  
      // Context must be created
      
      var _flags;
  
      if (flags_i64_1 & webcl.MEM_READ_WRITE) {
        _flags = webcl.MEM_READ_WRITE;
      } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
        _flags = webcl.MEM_WRITE_ONLY;
      } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
        _flags = webcl.MEM_READ_ONLY;
      } else {
        _flags |= webcl.MEM_WRITE_ONLY
      }
  
      var _host_ptr = null;
      var _channel_order = webcl.RGBA;
      var _channel_type = webcl.UNORM_INT8;
  
      if (image_format != 0) {
        _channel_order = HEAP32[((image_format)>>2)];
        _channel_type = HEAP32[(((image_format)+(4))>>2)];
      } else {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_IMAGE_FORMAT_DESCRIPTOR;
        }
  
  
        return 0; 
      }
  
      var _type = webcl.FLOAT;
      var _sizeType = 4;
      var _sizeOrder = 1;    
  
      switch (_channel_type) {
        case webcl.SNORM_INT8:
        case webcl.SIGNED_INT8:
          _sizeType = 1;
          _type = webcl.SIGNED_INT8;
          break;
        case webcl.UNORM_INT8:        
        case webcl.UNSIGNED_INT8:
          _sizeType = 1;
          _type = webcl.UNSIGNED_INT8;
          break;
        case webcl.SNORM_INT16:
        case webcl.SIGNED_INT16:
          _sizeType = 2;
          _type = webcl.SIGNED_INT16;
          break;
        case webcl.UNORM_INT16:        
        case webcl.UNSIGNED_INT16:
        case webcl.HALF_FLOAT:
          _sizeType = 2;      
          _type = webcl.UNSIGNED_INT16;
          break;
        case webcl.SIGNED_INT32:
          _sizeType = 4;
          _type = webcl.SIGNED_INT32;
        case webcl.UNSIGNED_INT32:
          _sizeType = 4;
          _type = webcl.UNSIGNED_INT32;
          break;        
        case webcl.FLOAT:
          _sizeType = 4;
          _type = webcl.FLOAT;
          break;
        default:
          console.error("clCreateImage2D : This channel type is not yet implemented => "+_channel_type);
      }
  
      switch (_channel_order) {
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
          console.error("clCreateImage2D : This channel order is not yet implemented => "+_channel_order);
      }
  
      var _size = image_width * image_height * _sizeOrder;
  
      console.info("/!\\ clCreateImage2D : Compute the size of ptr with image Info '"+_size+"'... need to be more tested");
  
      if ( host_ptr != 0 ) _host_ptr = CL.getCopyPointerToArray(host_ptr,_size,_type); 
      else if (
        (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR  */) ||
        (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR   */) ||
        (flags_i64_1 & (1 << 3) /* CL_MEM_USE_HOST_PTR    */)
        ) {
        _host_ptr = CL.getHostPtrArray(_size,_type);
      } 
  
      var _descriptor = { channelOrder:_channel_order, channelType:_channel_type, width:image_width, height:image_height, rowPitch:image_row_pitch }
  
      try {
  
  
        if (_host_ptr != null)
          _image = CL.cl_objects[context].createImage(_flags,_descriptor,_host_ptr);
        else
          _image = CL.cl_objects[context].createImage(_flags,_descriptor);
  
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
      Object.defineProperty(_image, "flags", { value : flags_i64_1,writable : false });
      _id = CL.udid(_image);
  
  
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

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _llvm_lifetime_start() {}
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
var GLctx; GL.init()
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
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

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
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
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_iii=env.nullFunc_iii;
  var invoke_ii=env.invoke_ii;
  var invoke_iii=env.invoke_iii;
  var _llvm_lifetime_start=env._llvm_lifetime_start;
  var _clReleaseProgram=env._clReleaseProgram;
  var _send=env._send;
  var _fread=env._fread;
  var _clReleaseKernel=env._clReleaseKernel;
  var _clReleaseContext=env._clReleaseContext;
  var _open=env._open;
  var _clEnqueueNDRangeKernel=env._clEnqueueNDRangeKernel;
  var _clCreateContext=env._clCreateContext;
  var _clEnqueueWriteBuffer=env._clEnqueueWriteBuffer;
  var _clCreateProgramWithSource=env._clCreateProgramWithSource;
  var _clGetProgramBuildInfo=env._clGetProgramBuildInfo;
  var _time=env._time;
  var _pwrite=env._pwrite;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var _clReleaseMemObject=env._clReleaseMemObject;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var _pread=env._pread;
  var _read=env._read;
  var _sysconf=env._sysconf;
  var _srand=env._srand;
  var _close=env._close;
  var __formatString=env.__formatString;
  var _clFinish=env._clFinish;
  var _clCreateCommandQueue=env._clCreateCommandQueue;
  var _clGetDeviceIDs=env._clGetDeviceIDs;
  var _fclose=env._fclose;
  var _clReleaseCommandQueue=env._clReleaseCommandQueue;
  var __reallyNegative=env.__reallyNegative;
  var _clGetDeviceInfo=env._clGetDeviceInfo;
  var _write=env._write;
  var _fflush=env._fflush;
  var _fsync=env._fsync;
  var ___errno_location=env.___errno_location;
  var _clCreateBuffer=env._clCreateBuffer;
  var _stat=env._stat;
  var _recv=env._recv;
  var _printf=env._printf;
  var _mkport=env._mkport;
  var _clCreateKernel=env._clCreateKernel;
  var _clSetKernelArg=env._clSetKernelArg;
  var _abort=env._abort;
  var _fwrite=env._fwrite;
  var _emscripten_get_now=env._emscripten_get_now;
  var _clBuildProgram=env._clBuildProgram;
  var _fprintf=env._fprintf;
  var _strstr=env._strstr;
  var _llvm_lifetime_end=env._llvm_lifetime_end;
  var _fopen=env._fopen;
  var _clEnqueueReadBuffer=env._clEnqueueReadBuffer;
  var _clGetKernelWorkGroupInfo=env._clGetKernelWorkGroupInfo;
  var _clCreateImage2D=env._clCreateImage2D;
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

function _test_histogram_with_buffers($context,$queue,$device) {
 $context = $context|0;
 $queue = $queue|0;
 $device = $device|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0.0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0.0, $218 = 0.0, $219 = 0.0, $22 = 0, $220 = 0.0, $221 = 0.0, $222 = 0.0, $223 = 0.0, $224 = 0.0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0.0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0;
 var $333 = 0, $334 = 0, $335 = 0.0, $336 = 0.0, $337 = 0.0, $338 = 0.0, $339 = 0.0, $34 = 0, $340 = 0.0, $341 = 0.0, $342 = 0.0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0;
 var $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buffer = 0;
 var $err = 0, $expanded = 0, $expanded121 = 0, $expanded122 = 0, $expanded123 = 0, $expanded124 = 0, $expanded125 = 0, $expanded126 = 0, $expanded127 = 0, $expanded128 = 0, $expanded129 = 0, $expanded130 = 0, $expanded131 = 0, $expanded132 = 0, $expanded133 = 0, $expanded134 = 0, $expanded135 = 0, $expanded136 = 0, $expanded137 = 0, $expanded138 = 0;
 var $expanded139 = 0, $expanded140 = 0, $expanded141 = 0, $expanded142 = 0, $expanded143 = 0, $expanded144 = 0, $expanded145 = 0, $expanded146 = 0, $expanded147 = 0, $expanded148 = 0, $expanded149 = 0, $expanded150 = 0, $expanded151 = 0, $expanded152 = 0, $expanded153 = 0, $expanded154 = 0, $expanded155 = 0, $expanded156 = 0, $expanded157 = 0, $expanded158 = 0;
 var $expanded159 = 0, $expanded160 = 0, $expanded161 = 0, $expanded162 = 0, $expanded163 = 0, $expanded164 = 0, $expanded165 = 0, $expanded166 = 0, $expanded167 = 0, $expanded168 = 0, $expanded169 = 0, $expanded170 = 0, $expanded171 = 0, $expanded172 = 0, $expanded173 = 0, $expanded174 = 0, $expanded175 = 0, $expanded176 = 0, $expanded177 = 0, $expanded178 = 0;
 var $expanded179 = 0, $expanded180 = 0, $expanded181 = 0, $expanded182 = 0, $expanded183 = 0, $expanded184 = 0, $expanded185 = 0, $expanded186 = 0, $expanded187 = 0, $expanded188 = 0, $expanded189 = 0, $expanded190 = 0, $expanded191 = 0, $expanded192 = 0, $expanded193 = 0, $expanded194 = 0, $expanded195 = 0, $expanded196 = 0, $expanded197 = 0, $expanded198 = 0;
 var $expanded199 = 0, $expanded200 = 0, $expanded201 = 0, $gep = 0, $gep273 = 0, $gep305 = 0, $gep308 = 0, $gep_int = 0, $gep_int202 = 0, $gep_int203 = 0, $gep_int204 = 0, $gep_int205 = 0, $gep_int206 = 0, $gep_int207 = 0, $gep_int208 = 0, $gep_int209 = 0, $gep_int210 = 0, $gep_int211 = 0, $gep_int212 = 0, $gep_int213 = 0;
 var $gep_int214 = 0, $gep_int215 = 0, $gep_int216 = 0, $gep_int217 = 0, $gep_int218 = 0, $gep_int219 = 0, $gep_int220 = 0, $gep_int221 = 0, $gep_int222 = 0, $gep_int223 = 0, $gep_int224 = 0, $gep_int225 = 0, $gep_int226 = 0, $gep_int227 = 0, $gep_int228 = 0, $gep_int229 = 0, $gep_int230 = 0, $gep_int231 = 0, $gep_int232 = 0, $gep_int233 = 0;
 var $gep_int234 = 0, $gep_int235 = 0, $gep_int236 = 0, $gep_int237 = 0, $gep_int238 = 0, $gep_int239 = 0, $gep_int240 = 0, $gep_int241 = 0, $gep_int242 = 0, $gep_int243 = 0, $gep_int244 = 0, $gep_int245 = 0, $gep_int246 = 0, $gep_int247 = 0, $gep_int248 = 0, $gep_int249 = 0, $gep_int250 = 0, $gep_int251 = 0, $gep_int252 = 0, $gep_int253 = 0;
 var $gep_int254 = 0, $gep_int255 = 0, $gep_int256 = 0, $gep_int257 = 0, $gep_int258 = 0, $gep_int259 = 0, $gep_int260 = 0, $gep_int261 = 0, $gep_int262 = 0, $gep_int263 = 0, $gep_int264 = 0, $gep_int265 = 0, $gep_int266 = 0, $gep_int267 = 0, $gep_int268 = 0, $gep_int269 = 0, $gep_int270 = 0, $gep_int271 = 0, $gep_int272 = 0, $gep_int274 = 0;
 var $gep_int275 = 0, $gep_int276 = 0, $gep_int277 = 0, $gep_int278 = 0, $gep_int279 = 0, $gep_int280 = 0, $gep_int281 = 0, $gep_int282 = 0, $gep_int283 = 0, $gep_int284 = 0, $gep_int285 = 0, $gep_int286 = 0, $gep_int287 = 0, $gep_int288 = 0, $gep_int289 = 0, $gep_int290 = 0, $gep_int291 = 0, $gep_int292 = 0, $gep_int293 = 0, $gep_int294 = 0;
 var $gep_int295 = 0, $gep_int296 = 0, $gep_int297 = 0, $gep_int298 = 0, $gep_int299 = 0, $gep_int300 = 0, $gep_int301 = 0, $gep_int302 = 0, $gep_int303 = 0, $gep_int304 = 0, $gep_int306 = 0, $gep_int307 = 0, $gep_int309 = 0, $global_work_size = 0, $gpu_histogram_results = 0, $histogram_buffer = 0, $histogram_rgba_fp16 = 0, $histogram_rgba_fp32 = 0, $histogram_rgba_unorm8 = 0, $histogram_sum_partial_results_fp = 0;
 var $histogram_sum_partial_results_unorm8 = 0, $i = 0, $image_data_fp32 = 0, $image_data_unorm8 = 0, $image_height = 0, $image_width = 0, $input_image_fp32 = 0, $input_image_unorm8 = 0, $local_work_size = 0, $num_groups = 0, $partial_global_work_size = 0, $partial_histogram_buffer = 0, $partial_local_work_size = 0, $program = 0, $ref_histogram_results = 0, $source = 0, $src_len = 0, $t = 0.0, $t1 = 0.0, $t2 = 0.0;
 var $t3 = 0.0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer103 = 0, $vararg_buffer107 = 0, $vararg_buffer111 = 0, $vararg_buffer115 = 0, $vararg_buffer14 = 0, $vararg_buffer17 = 0, $vararg_buffer21 = 0, $vararg_buffer25 = 0, $vararg_buffer29 = 0, $vararg_buffer33 = 0, $vararg_buffer37 = 0, $vararg_buffer4 = 0, $vararg_buffer41 = 0, $vararg_buffer45 = 0, $vararg_buffer49 = 0, $vararg_buffer53 = 0;
 var $vararg_buffer57 = 0, $vararg_buffer61 = 0, $vararg_buffer65 = 0, $vararg_buffer69 = 0, $vararg_buffer7 = 0, $vararg_buffer73 = 0, $vararg_buffer77 = 0, $vararg_buffer81 = 0, $vararg_buffer87 = 0, $vararg_buffer91 = 0, $vararg_buffer95 = 0, $vararg_buffer99 = 0, $vararg_func = 0, $vararg_func102 = 0, $vararg_func106 = 0, $vararg_func110 = 0, $vararg_func114 = 0, $vararg_func120 = 0, $vararg_func13 = 0, $vararg_func16 = 0;
 var $vararg_func20 = 0, $vararg_func24 = 0, $vararg_func28 = 0, $vararg_func3 = 0, $vararg_func32 = 0, $vararg_func36 = 0, $vararg_func40 = 0, $vararg_func44 = 0, $vararg_func48 = 0, $vararg_func52 = 0, $vararg_func56 = 0, $vararg_func6 = 0, $vararg_func60 = 0, $vararg_func64 = 0, $vararg_func68 = 0, $vararg_func72 = 0, $vararg_func76 = 0, $vararg_func80 = 0, $vararg_func86 = 0, $vararg_func9 = 0;
 var $vararg_func90 = 0, $vararg_func94 = 0, $vararg_func98 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast100 = 0, $vararg_lifetime_bitcast104 = 0, $vararg_lifetime_bitcast108 = 0, $vararg_lifetime_bitcast11 = 0, $vararg_lifetime_bitcast112 = 0, $vararg_lifetime_bitcast116 = 0, $vararg_lifetime_bitcast15 = 0, $vararg_lifetime_bitcast18 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast22 = 0, $vararg_lifetime_bitcast26 = 0, $vararg_lifetime_bitcast30 = 0, $vararg_lifetime_bitcast34 = 0, $vararg_lifetime_bitcast38 = 0, $vararg_lifetime_bitcast42 = 0, $vararg_lifetime_bitcast46 = 0;
 var $vararg_lifetime_bitcast5 = 0, $vararg_lifetime_bitcast50 = 0, $vararg_lifetime_bitcast54 = 0, $vararg_lifetime_bitcast58 = 0, $vararg_lifetime_bitcast62 = 0, $vararg_lifetime_bitcast66 = 0, $vararg_lifetime_bitcast70 = 0, $vararg_lifetime_bitcast74 = 0, $vararg_lifetime_bitcast78 = 0, $vararg_lifetime_bitcast8 = 0, $vararg_lifetime_bitcast82 = 0, $vararg_lifetime_bitcast88 = 0, $vararg_lifetime_bitcast92 = 0, $vararg_lifetime_bitcast96 = 0, $vararg_ptr = 0, $vararg_ptr101 = 0, $vararg_ptr105 = 0, $vararg_ptr109 = 0, $vararg_ptr113 = 0, $vararg_ptr117 = 0;
 var $vararg_ptr118 = 0, $vararg_ptr119 = 0, $vararg_ptr12 = 0, $vararg_ptr19 = 0, $vararg_ptr23 = 0, $vararg_ptr27 = 0, $vararg_ptr31 = 0, $vararg_ptr35 = 0, $vararg_ptr39 = 0, $vararg_ptr43 = 0, $vararg_ptr47 = 0, $vararg_ptr51 = 0, $vararg_ptr55 = 0, $vararg_ptr59 = 0, $vararg_ptr63 = 0, $vararg_ptr67 = 0, $vararg_ptr71 = 0, $vararg_ptr75 = 0, $vararg_ptr79 = 0, $vararg_ptr83 = 0;
 var $vararg_ptr84 = 0, $vararg_ptr85 = 0, $vararg_ptr89 = 0, $vararg_ptr93 = 0, $vararg_ptr97 = 0, $workgroup_size = 0, label = 0, sp = 0, u$106 = 0, u$116 = 0, u$12 = 0, u$120 = 0, u$129 = 0, u$133 = 0, u$134 = 0, u$135 = 0, u$136 = 0, u$137 = 0, u$138 = 0, u$139 = 0;
 var u$144 = 0, u$148 = 0, u$152 = 0, u$165 = 0, u$175 = 0, u$179 = 0, u$188 = 0, u$19 = 0, u$196 = 0, u$203 = 0, u$210 = 0, u$212 = 0, u$221 = 0, u$225 = 0, u$226 = 0, u$227 = 0, u$228 = 0, u$229 = 0, u$230 = 0, u$231 = 0;
 var u$236 = 0, u$240 = 0, u$244 = 0, u$257 = 0, u$266 = 0, u$270 = 0, u$279 = 0, u$28 = 0, u$287 = 0, u$294 = 0, u$301 = 0, u$307 = 0, u$308 = 0, u$309 = 0, u$310 = 0, u$311 = 0, u$312 = 0, u$313 = 0, u$314 = 0, u$315 = 0;
 var u$316 = 0, u$37 = 0, u$39 = 0, u$42 = 0, u$51 = 0, u$6 = 0, u$60 = 0, u$69 = 0, u$78 = 0, u$87 = 0, u$9 = 0, u$96 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer115 = sp;
 $vararg_lifetime_bitcast116 = $vararg_buffer115;
 $vararg_buffer111 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast112 = $vararg_buffer111;
 $vararg_buffer107 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast108 = $vararg_buffer107;
 $vararg_buffer103 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast104 = $vararg_buffer103;
 $vararg_buffer99 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast100 = $vararg_buffer99;
 $vararg_buffer95 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast96 = $vararg_buffer95;
 $vararg_buffer91 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast92 = $vararg_buffer91;
 $vararg_buffer87 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast88 = $vararg_buffer87;
 $vararg_buffer81 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast82 = $vararg_buffer81;
 $vararg_buffer77 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast78 = $vararg_buffer77;
 $vararg_buffer73 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast74 = $vararg_buffer73;
 $vararg_buffer69 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast70 = $vararg_buffer69;
 $vararg_buffer65 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast66 = $vararg_buffer65;
 $vararg_buffer61 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast62 = $vararg_buffer61;
 $vararg_buffer57 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast58 = $vararg_buffer57;
 $vararg_buffer53 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast54 = $vararg_buffer53;
 $vararg_buffer49 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast50 = $vararg_buffer49;
 $vararg_buffer45 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast46 = $vararg_buffer45;
 $vararg_buffer41 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast42 = $vararg_buffer41;
 $vararg_buffer37 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast38 = $vararg_buffer37;
 $vararg_buffer33 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast34 = $vararg_buffer33;
 $vararg_buffer29 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast30 = $vararg_buffer29;
 $vararg_buffer25 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast26 = $vararg_buffer25;
 $vararg_buffer21 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast22 = $vararg_buffer21;
 $vararg_buffer17 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast18 = $vararg_buffer17;
 $vararg_buffer14 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast15 = $vararg_buffer14;
 $vararg_buffer10 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast11 = $vararg_buffer10;
 $vararg_buffer7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast8 = $vararg_buffer7;
 $vararg_buffer4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast5 = $vararg_buffer4;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 
 
 
 $image_width = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $image_height = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $global_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $local_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $partial_global_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $partial_local_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $workgroup_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $num_groups = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 $input_image_unorm8 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $input_image_fp32 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $histogram_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $partial_histogram_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $src_len = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $source = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 $err = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 2048|0;
 
 
 $2 = $context;
 $3 = $queue;
 HEAP32[$4>>2] = $device;
 HEAP32[$image_width>>2] = 1920;
 HEAP32[$image_height>>2] = 1080;
 
 $expanded = 1;
 $vararg_func = $expanded;
 $gep_int = 56;
 $expanded121 = $gep_int;
 u$6 = _printf($expanded121|0,$vararg_buffer|0)|0;
 
 
 $expanded122 = 1;
 $vararg_func3 = $expanded122;
 $gep_int202 = 88;
 $expanded123 = $gep_int202;
 u$9 = _printf($expanded123|0,$vararg_buffer1|0)|0;
 
 
 $expanded124 = 1;
 $vararg_func6 = $expanded124;
 $gep_int203 = 56;
 $expanded125 = $gep_int203;
 u$12 = _printf($expanded125|0,$vararg_buffer4|0)|0;
 
 $expanded126 = 1;
 $5 = _time(0)|0;
 _srand($5|0);
 $gep_int204 = $source;
 $6 = $gep_int204;
 $gep_int205 = $src_len;
 $7 = $gep_int205;
 $gep_int206 = 8;
 $expanded127 = $gep_int206;
 $8 = _read_kernel_from_file($expanded127,$6,$7)|0;
 HEAP32[$err>>2] = $8;
 $9 = HEAP32[$err>>2]|0;
 $10 = ($9|0)!=(0);
 
 if ($10) {
  
  $gep_int207 = $vararg_buffer7;
  $vararg_ptr = $gep_int207;
  $gep_int208 = 8;
  $expanded128 = $gep_int208;
  HEAP32[$vararg_ptr>>2] = $expanded128;
  $expanded129 = 1;
  $vararg_func9 = $expanded129;
  $gep_int209 = 120;
  $expanded130 = $gep_int209;
  u$19 = _printf($expanded130|0,$vararg_buffer7|0)|0;
  
  $1 = 1;
  
  $359 = $1;
  STACKTOP = sp;return $359|0;
 }
 $11 = $2;
 $gep_int210 = $source;
 $12 = $gep_int210;
 $gep_int211 = $src_len;
 $13 = $gep_int211;
 $14 = _clCreateProgramWithSource($11|0,1,$12|0,$13|0,$err|0)|0;
 $program = $14;
 $15 = $program;
 $16 = ($15|0)!=(0);
 
 do {
  if ($16) {
   $17 = HEAP32[$err>>2]|0;
   $18 = ($17|0)!=(0);
   
   if ($18) {
    break;
   }
   $gep_int214 = $source;
   $20 = $gep_int214;
   $21 = HEAP32[$20>>2]|0;
   _free($21);
   $22 = $program;
   $23 = _clBuildProgram($22|0,1,$4|0,0,0,0)|0;
   HEAP32[$err>>2] = $23;
   $24 = HEAP32[$err>>2]|0;
   $25 = ($24|0)!=(0);
   
   if ($25) {
    $26 = $buffer;
    _memset($26|0,0,2048)|0;
    
    $expanded133 = 1;
    $vararg_func16 = $expanded133;
    $gep_int215 = 224;
    $expanded134 = $gep_int215;
    u$37 = _printf($expanded134|0,$vararg_buffer14|0)|0;
    
    $27 = $program;
    $28 = HEAP32[$4>>2]|0;
    $gep_int216 = $buffer;
    $29 = $gep_int216;
    u$39 = _clGetProgramBuildInfo($27|0,$28|0,4483,2048,$29|0,0)|0;
    $gep_int217 = $buffer;
    $30 = $gep_int217;
    
    $gep_int218 = $vararg_buffer17;
    $vararg_ptr19 = $gep_int218;
    HEAP32[$vararg_ptr19>>2] = $30;
    $expanded135 = 1;
    $vararg_func20 = $expanded135;
    $gep_int219 = 256;
    $expanded136 = $gep_int219;
    u$42 = _printf($expanded136|0,$vararg_buffer17|0)|0;
    
    $1 = 1;
    
    $359 = $1;
    STACKTOP = sp;return $359|0;
   }
   $31 = $program;
   $gep_int220 = 272;
   $expanded137 = $gep_int220;
   $32 = _clCreateKernel($31|0,$expanded137|0,$err|0)|0;
   $histogram_rgba_unorm8 = $32;
   $33 = $histogram_rgba_unorm8;
   $34 = ($33|0)!=(0);
   
   do {
    if ($34) {
     $35 = HEAP32[$err>>2]|0;
     $36 = ($35|0)!=(0);
     
     if ($36) {
      break;
     }
     $38 = $program;
     $gep_int223 = 376;
     $expanded140 = $gep_int223;
     $39 = _clCreateKernel($38|0,$expanded140|0,$err|0)|0;
     $histogram_rgba_fp16 = $39;
     $40 = $histogram_rgba_fp16;
     $41 = ($40|0)!=(0);
     
     do {
      if ($41) {
       $42 = HEAP32[$err>>2]|0;
       $43 = ($42|0)!=(0);
       
       if ($43) {
        break;
       }
       $45 = $program;
       $gep_int226 = 480;
       $expanded143 = $gep_int226;
       $46 = _clCreateKernel($45|0,$expanded143|0,$err|0)|0;
       $histogram_rgba_fp32 = $46;
       $47 = $histogram_rgba_fp16;
       $48 = ($47|0)!=(0);
       
       do {
        if ($48) {
         $49 = HEAP32[$err>>2]|0;
         $50 = ($49|0)!=(0);
         
         if ($50) {
          break;
         }
         $52 = $program;
         $gep_int229 = 584;
         $expanded146 = $gep_int229;
         $53 = _clCreateKernel($52|0,$expanded146|0,$err|0)|0;
         $histogram_sum_partial_results_unorm8 = $53;
         $54 = $histogram_sum_partial_results_unorm8;
         $55 = ($54|0)!=(0);
         
         do {
          if ($55) {
           $56 = HEAP32[$err>>2]|0;
           $57 = ($56|0)!=(0);
           
           if ($57) {
            break;
           }
           $59 = $program;
           $gep_int232 = 720;
           $expanded149 = $gep_int232;
           $60 = _clCreateKernel($59|0,$expanded149|0,$err|0)|0;
           $histogram_sum_partial_results_fp = $60;
           $61 = $histogram_sum_partial_results_fp;
           $62 = ($61|0)!=(0);
           
           do {
            if ($62) {
             $63 = HEAP32[$err>>2]|0;
             $64 = ($63|0)!=(0);
             
             if ($64) {
              break;
             }
             $66 = $2;
             $67 = _clCreateBuffer($66|0,2,0,3084,0,$err|0)|0;
             HEAP32[$histogram_buffer>>2] = $67;
             $68 = HEAP32[$histogram_buffer>>2]|0;
             $69 = ($68|0)!=(0);
             
             do {
              if ($69) {
               $70 = HEAP32[$err>>2]|0;
               $71 = ($70|0)!=(0);
               
               if ($71) {
                break;
               }
               $73 = HEAP32[$image_width>>2]|0;
               $74 = HEAP32[$image_height>>2]|0;
               $75 = _create_image_data_unorm8($73,$74)|0;
               $image_data_unorm8 = $75;
               $76 = $2;
               $77 = HEAP32[$image_width>>2]|0;
               $78 = HEAP32[$image_height>>2]|0;
               $79 = Math_imul($77, $78)|0;
               $80 = $79<<2;
               $81 = $80;
               $82 = $image_data_unorm8;
               $83 = _clCreateBuffer($76|0,36,0,$81|0,$82|0,$err|0)|0;
               HEAP32[$input_image_unorm8>>2] = $83;
               $84 = HEAP32[$input_image_unorm8>>2]|0;
               $85 = ($84|0)!=(0);
               
               do {
                if ($85) {
                 $86 = HEAP32[$err>>2]|0;
                 $87 = ($86|0)!=(0);
                 
                 if ($87) {
                  break;
                 }
                 $89 = HEAP32[$image_width>>2]|0;
                 $90 = HEAP32[$image_height>>2]|0;
                 $91 = _create_image_data_fp32($89,$90)|0;
                 $image_data_fp32 = $91;
                 $92 = $2;
                 $93 = HEAP32[$image_width>>2]|0;
                 $94 = HEAP32[$image_height>>2]|0;
                 $95 = Math_imul($93, $94)|0;
                 $96 = $95<<2;
                 $97 = $96<<2;
                 $98 = $image_data_fp32;
                 $99 = _clCreateBuffer($92|0,36,0,$97|0,$98|0,$err|0)|0;
                 HEAP32[$input_image_fp32>>2] = $99;
                 $100 = HEAP32[$input_image_fp32>>2]|0;
                 $101 = ($100|0)!=(0);
                 
                 do {
                  if ($101) {
                   $102 = HEAP32[$err>>2]|0;
                   $103 = ($102|0)!=(0);
                   
                   if ($103) {
                    break;
                   }
                   $105 = $histogram_rgba_unorm8;
                   $106 = HEAP32[$4>>2]|0;
                   $107 = $workgroup_size;
                   u$120 = _clGetKernelWorkGroupInfo($105|0,$106|0,4528,4,$107|0,0)|0;
                   $108 = HEAP32[$image_width>>2]|0;
                   $109 = HEAP32[$image_height>>2]|0;
                   $110 = Math_imul($108, $109)|0;
                   $111 = HEAP32[$workgroup_size>>2]|0;
                   $112 = (($110) + ($111))|0;
                   $113 = (($112) - 1)|0;
                   $114 = HEAP32[$workgroup_size>>2]|0;
                   $115 = (($113>>>0) / ($114>>>0))&-1;
                   HEAP32[$num_groups>>2] = $115;
                   $116 = HEAP32[$num_groups>>2]|0;
                   $117 = HEAP32[$workgroup_size>>2]|0;
                   $118 = Math_imul($116, $117)|0;
                   $gep_int241 = $global_work_size;
                   $119 = $gep_int241;
                   HEAP32[$119>>2] = $118;
                   $120 = HEAP32[$workgroup_size>>2]|0;
                   $gep_int242 = $local_work_size;
                   $121 = $gep_int242;
                   HEAP32[$121>>2] = $120;
                   $122 = $2;
                   $123 = HEAP32[$num_groups>>2]|0;
                   $124 = ($123*257)|0;
                   $125 = ($124*3)|0;
                   $126 = $125<<2;
                   $127 = _clCreateBuffer($122|0,1,0,$126|0,0,$err|0)|0;
                   HEAP32[$partial_histogram_buffer>>2] = $127;
                   $128 = HEAP32[$partial_histogram_buffer>>2]|0;
                   $129 = ($128|0)!=(0);
                   
                   do {
                    if ($129) {
                     $130 = HEAP32[$err>>2]|0;
                     $131 = ($130|0)!=(0);
                     
                     if ($131) {
                      break;
                     }
                     $133 = $histogram_rgba_unorm8;
                     $134 = $input_image_unorm8;
                     u$133 = _clSetKernelArg($133|0,0,4,$134|0)|0;
                     $135 = $histogram_rgba_unorm8;
                     $136 = $image_width;
                     u$134 = _clSetKernelArg($135|0,1,4,$136|0)|0;
                     $137 = $histogram_rgba_unorm8;
                     $138 = $image_height;
                     u$135 = _clSetKernelArg($137|0,2,4,$138|0)|0;
                     $139 = $histogram_rgba_unorm8;
                     $140 = $partial_histogram_buffer;
                     u$136 = _clSetKernelArg($139|0,3,4,$140|0)|0;
                     $141 = $histogram_sum_partial_results_unorm8;
                     $142 = $partial_histogram_buffer;
                     u$137 = _clSetKernelArg($141|0,0,4,$142|0)|0;
                     $143 = $histogram_sum_partial_results_unorm8;
                     $144 = $num_groups;
                     u$138 = _clSetKernelArg($143|0,1,4,$144|0)|0;
                     $145 = $histogram_sum_partial_results_unorm8;
                     $146 = $histogram_buffer;
                     u$139 = _clSetKernelArg($145|0,2,4,$146|0)|0;
                     $147 = $3;
                     $148 = $histogram_rgba_unorm8;
                     $gep_int245 = $global_work_size;
                     $149 = $gep_int245;
                     $gep_int246 = $local_work_size;
                     $150 = $gep_int246;
                     $151 = _clEnqueueNDRangeKernel($147|0,$148|0,1,0,$149|0,$150|0,0,0,0)|0;
                     HEAP32[$err>>2] = $151;
                     $152 = HEAP32[$err>>2]|0;
                     $153 = ($152|0)!=(0);
                     
                     if ($153) {
                      $154 = HEAP32[$err>>2]|0;
                      
                      $gep_int247 = $vararg_buffer57;
                      $vararg_ptr59 = $gep_int247;
                      HEAP32[$vararg_ptr59>>2] = $154;
                      $expanded160 = 1;
                      $vararg_func60 = $expanded160;
                      $gep_int248 = 880;
                      $expanded161 = $gep_int248;
                      u$144 = _printf($expanded161|0,$vararg_buffer57|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                     $155 = $histogram_sum_partial_results_unorm8;
                     $156 = HEAP32[$4>>2]|0;
                     $157 = $workgroup_size;
                     u$148 = _clGetKernelWorkGroupInfo($155|0,$156|0,4528,4,$157|0,0)|0;
                     $158 = HEAP32[$workgroup_size>>2]|0;
                     $159 = ($158>>>0)<(256);
                     
                     if ($159) {
                      $160 = HEAP32[$workgroup_size>>2]|0;
                      
                      $gep_int249 = $vararg_buffer61;
                      $vararg_ptr63 = $gep_int249;
                      HEAP32[$vararg_ptr63>>2] = $160;
                      $expanded162 = 1;
                      $vararg_func64 = $expanded162;
                      $gep_int250 = 952;
                      $expanded163 = $gep_int250;
                      u$152 = _printf($expanded163|0,$vararg_buffer61|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                     $gep_int251 = $partial_global_work_size;
                     $161 = $gep_int251;
                     HEAP32[$161>>2] = 768;
                     $162 = HEAP32[$workgroup_size>>2]|0;
                     $163 = ($162>>>0)>(256);
                     
                     if ($163) {
                      
                      $165 = 256;
                     } else {
                      $164 = HEAP32[$workgroup_size>>2]|0;
                      
                      $165 = $164;
                     }
                     
                     $gep_int252 = $partial_local_work_size;
                     $166 = $gep_int252;
                     HEAP32[$166>>2] = $165;
                     $167 = $3;
                     $168 = $histogram_sum_partial_results_unorm8;
                     $gep_int253 = $partial_global_work_size;
                     $169 = $gep_int253;
                     $gep_int254 = $partial_local_work_size;
                     $170 = $gep_int254;
                     $171 = _clEnqueueNDRangeKernel($167|0,$168|0,1,0,$169|0,$170|0,0,0,0)|0;
                     HEAP32[$err>>2] = $171;
                     $172 = HEAP32[$err>>2]|0;
                     $173 = ($172|0)!=(0);
                     
                     if ($173) {
                      $174 = HEAP32[$err>>2]|0;
                      
                      $gep_int255 = $vararg_buffer65;
                      $vararg_ptr67 = $gep_int255;
                      HEAP32[$vararg_ptr67>>2] = $174;
                      $expanded164 = 1;
                      $vararg_func68 = $expanded164;
                      $gep_int256 = 1056;
                      $expanded165 = $gep_int256;
                      u$165 = _printf($expanded165|0,$vararg_buffer65|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                     $175 = $image_data_unorm8;
                     $176 = HEAP32[$image_width>>2]|0;
                     $177 = HEAP32[$image_height>>2]|0;
                     $178 = _generate_reference_histogram_results_unorm8($175,$176,$177)|0;
                     $179 = $178;
                     $ref_histogram_results = $179;
                     $180 = _malloc(3084)|0;
                     $181 = $180;
                     $gpu_histogram_results = $181;
                     $182 = $3;
                     $183 = HEAP32[$histogram_buffer>>2]|0;
                     $184 = $gpu_histogram_results;
                     $185 = $184;
                     $186 = _clEnqueueReadBuffer($182|0,$183|0,1,0,3072,$185|0,0,0,0)|0;
                     HEAP32[$err>>2] = $186;
                     $187 = HEAP32[$err>>2]|0;
                     $188 = ($187|0)!=(0);
                     
                     if ($188) {
                      $189 = HEAP32[$err>>2]|0;
                      
                      $gep_int257 = $vararg_buffer69;
                      $vararg_ptr71 = $gep_int257;
                      HEAP32[$vararg_ptr71>>2] = $189;
                      $expanded166 = 1;
                      $vararg_func72 = $expanded166;
                      $gep_int258 = 1144;
                      $expanded167 = $gep_int258;
                      u$175 = _printf($expanded167|0,$vararg_buffer69|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                     $190 = $gpu_histogram_results;
                     $191 = $ref_histogram_results;
                     $gep_int259 = 1184;
                     $expanded168 = $gep_int259;
                     u$179 = _verify_histogram_results($expanded168,$190,$191,768)|0;
                     $expanded169 = 2;
                     $192 = _emscripten_get_now()|0;
                     $193 = +($192|0);
                     $t1 = $193;
                     $i = 0;
                     
                     while(1) {
                      $194 = $i;
                      $expanded170 = 1200;
                      $195 = HEAP32[1200>>2]|0;
                      $196 = ($194|0)<($195|0);
                      
                      if (!($196)) {
                       label = 54;
                       break;
                      }
                      $197 = $3;
                      $198 = $histogram_rgba_unorm8;
                      $gep_int260 = $global_work_size;
                      $199 = $gep_int260;
                      $gep_int261 = $local_work_size;
                      $200 = $gep_int261;
                      $201 = _clEnqueueNDRangeKernel($197|0,$198|0,1,0,$199|0,$200|0,0,0,0)|0;
                      HEAP32[$err>>2] = $201;
                      $202 = HEAP32[$err>>2]|0;
                      $203 = ($202|0)!=(0);
                      
                      if ($203) {
                       label = 49;
                       break;
                      }
                      $205 = $3;
                      $206 = $histogram_sum_partial_results_unorm8;
                      $gep_int264 = $partial_global_work_size;
                      $207 = $gep_int264;
                      $gep_int265 = $partial_local_work_size;
                      $208 = $gep_int265;
                      $209 = _clEnqueueNDRangeKernel($205|0,$206|0,1,0,$207|0,$208|0,0,0,0)|0;
                      HEAP32[$err>>2] = $209;
                      $210 = HEAP32[$err>>2]|0;
                      $211 = ($210|0)!=(0);
                      
                      if ($211) {
                       label = 51;
                       break;
                      }
                      
                      $213 = $i;
                      $214 = (($213) + 1)|0;
                      $i = $214;
                      
                     }
                     if ((label|0) == 49) {
                      $204 = HEAP32[$err>>2]|0;
                      
                      $gep_int262 = $vararg_buffer73;
                      $vararg_ptr75 = $gep_int262;
                      HEAP32[$vararg_ptr75>>2] = $204;
                      $expanded171 = 1;
                      $vararg_func76 = $expanded171;
                      $gep_int263 = 880;
                      $expanded172 = $gep_int263;
                      u$188 = _printf($expanded172|0,$vararg_buffer73|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                     else if ((label|0) == 51) {
                      $212 = HEAP32[$err>>2]|0;
                      
                      $gep_int266 = $vararg_buffer77;
                      $vararg_ptr79 = $gep_int266;
                      HEAP32[$vararg_ptr79>>2] = $212;
                      $expanded173 = 1;
                      $vararg_func80 = $expanded173;
                      $gep_int267 = 1056;
                      $expanded174 = $gep_int267;
                      u$196 = _printf($expanded174|0,$vararg_buffer77|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                     else if ((label|0) == 54) {
                      $215 = $3;
                      u$203 = _clFinish($215|0)|0;
                      $expanded175 = 2;
                      $216 = _emscripten_get_now()|0;
                      $217 = +($216|0);
                      $t2 = $217;
                      $218 = $t2;
                      $219 = $t1;
                      $220 = $218 - $219;
                      $221 = 0.00100000004749745130538940429688 * $220;
                      $222 = $221;
                      $t = $222;
                      $223 = $t;
                      $224 = 1.000000e+03 * $223;
                      
                      $gep_int268 = $vararg_buffer81;
                      $vararg_ptr83 = $gep_int268;
                      $gep_int269 = 1288;
                      $expanded176 = $gep_int269;
                      HEAP32[$vararg_ptr83>>2] = $expanded176;
                      $gep_int270 = $vararg_buffer81;
                      $gep = (($gep_int270) + 4)|0;
                      $vararg_ptr84 = $gep;
                      $gep_int271 = 1296;
                      $expanded177 = $gep_int271;
                      HEAP32[$vararg_ptr84>>2] = $expanded177;
                      $gep_int272 = $vararg_buffer81;
                      $gep273 = (($gep_int272) + 8)|0;
                      $vararg_ptr85 = $gep273;
                      HEAPF64[tempDoublePtr>>3]=$224;HEAP32[$vararg_ptr85>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr85+4>>2]=HEAP32[tempDoublePtr+4>>2];
                      $expanded178 = 1;
                      $vararg_func86 = $expanded178;
                      $gep_int274 = 1208;
                      $expanded179 = $gep_int274;
                      u$210 = _printf($expanded179|0,$vararg_buffer81|0)|0;
                      
                      $225 = $histogram_rgba_fp32;
                      $226 = HEAP32[$4>>2]|0;
                      $227 = $workgroup_size;
                      u$212 = _clGetKernelWorkGroupInfo($225|0,$226|0,4528,4,$227|0,0)|0;
                      $228 = HEAP32[$image_width>>2]|0;
                      $229 = HEAP32[$image_height>>2]|0;
                      $230 = Math_imul($228, $229)|0;
                      $231 = HEAP32[$workgroup_size>>2]|0;
                      $232 = (($230) + ($231))|0;
                      $233 = (($232) - 1)|0;
                      $234 = HEAP32[$workgroup_size>>2]|0;
                      $235 = (($233>>>0) / ($234>>>0))&-1;
                      HEAP32[$num_groups>>2] = $235;
                      $236 = HEAP32[$num_groups>>2]|0;
                      $237 = HEAP32[$workgroup_size>>2]|0;
                      $238 = Math_imul($236, $237)|0;
                      $gep_int275 = $global_work_size;
                      $239 = $gep_int275;
                      HEAP32[$239>>2] = $238;
                      $240 = HEAP32[$workgroup_size>>2]|0;
                      $gep_int276 = $local_work_size;
                      $241 = $gep_int276;
                      HEAP32[$241>>2] = $240;
                      $242 = $2;
                      $243 = HEAP32[$num_groups>>2]|0;
                      $244 = ($243*257)|0;
                      $245 = ($244*3)|0;
                      $246 = $245<<2;
                      $247 = _clCreateBuffer($242|0,1,0,$246|0,0,$err|0)|0;
                      HEAP32[$partial_histogram_buffer>>2] = $247;
                      $248 = HEAP32[$partial_histogram_buffer>>2]|0;
                      $249 = ($248|0)!=(0);
                      
                      do {
                       if ($249) {
                        $250 = HEAP32[$err>>2]|0;
                        $251 = ($250|0)!=(0);
                        
                        if ($251) {
                         break;
                        }
                        $253 = $histogram_rgba_fp32;
                        $254 = $input_image_fp32;
                        u$225 = _clSetKernelArg($253|0,0,4,$254|0)|0;
                        $255 = $histogram_rgba_fp32;
                        $256 = $image_width;
                        u$226 = _clSetKernelArg($255|0,1,4,$256|0)|0;
                        $257 = $histogram_rgba_fp32;
                        $258 = $image_height;
                        u$227 = _clSetKernelArg($257|0,2,4,$258|0)|0;
                        $259 = $histogram_rgba_fp32;
                        $260 = $partial_histogram_buffer;
                        u$228 = _clSetKernelArg($259|0,3,4,$260|0)|0;
                        $261 = $histogram_sum_partial_results_fp;
                        $262 = $partial_histogram_buffer;
                        u$229 = _clSetKernelArg($261|0,0,4,$262|0)|0;
                        $263 = $histogram_sum_partial_results_fp;
                        $264 = $num_groups;
                        u$230 = _clSetKernelArg($263|0,1,4,$264|0)|0;
                        $265 = $histogram_sum_partial_results_fp;
                        $266 = $histogram_buffer;
                        u$231 = _clSetKernelArg($265|0,2,4,$266|0)|0;
                        $267 = $3;
                        $268 = $histogram_rgba_fp32;
                        $gep_int279 = $global_work_size;
                        $269 = $gep_int279;
                        $gep_int280 = $local_work_size;
                        $270 = $gep_int280;
                        $271 = _clEnqueueNDRangeKernel($267|0,$268|0,1,0,$269|0,$270|0,0,0,0)|0;
                        HEAP32[$err>>2] = $271;
                        $272 = HEAP32[$err>>2]|0;
                        $273 = ($272|0)!=(0);
                        
                        if ($273) {
                         $274 = HEAP32[$err>>2]|0;
                         
                         $gep_int281 = $vararg_buffer91;
                         $vararg_ptr93 = $gep_int281;
                         HEAP32[$vararg_ptr93>>2] = $274;
                         $expanded182 = 1;
                         $vararg_func94 = $expanded182;
                         $gep_int282 = 1312;
                         $expanded183 = $gep_int282;
                         u$236 = _printf($expanded183|0,$vararg_buffer91|0)|0;
                         
                         $1 = 1;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                        $275 = $histogram_sum_partial_results_fp;
                        $276 = HEAP32[$4>>2]|0;
                        $277 = $workgroup_size;
                        u$240 = _clGetKernelWorkGroupInfo($275|0,$276|0,4528,4,$277|0,0)|0;
                        $278 = HEAP32[$workgroup_size>>2]|0;
                        $279 = ($278>>>0)<(256);
                        
                        if ($279) {
                         $280 = HEAP32[$workgroup_size>>2]|0;
                         
                         $gep_int283 = $vararg_buffer95;
                         $vararg_ptr97 = $gep_int283;
                         HEAP32[$vararg_ptr97>>2] = $280;
                         $expanded184 = 1;
                         $vararg_func98 = $expanded184;
                         $gep_int284 = 1384;
                         $expanded185 = $gep_int284;
                         u$244 = _printf($expanded185|0,$vararg_buffer95|0)|0;
                         
                         $1 = 1;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                        $gep_int285 = $partial_global_work_size;
                        $281 = $gep_int285;
                        HEAP32[$281>>2] = 768;
                        $282 = HEAP32[$workgroup_size>>2]|0;
                        $283 = ($282>>>0)>(256);
                        
                        if ($283) {
                         
                         $285 = 256;
                        } else {
                         $284 = HEAP32[$workgroup_size>>2]|0;
                         
                         $285 = $284;
                        }
                        
                        $gep_int286 = $partial_local_work_size;
                        $286 = $gep_int286;
                        HEAP32[$286>>2] = $285;
                        $287 = $3;
                        $288 = $histogram_sum_partial_results_fp;
                        $gep_int287 = $partial_global_work_size;
                        $289 = $gep_int287;
                        $gep_int288 = $partial_local_work_size;
                        $290 = $gep_int288;
                        $291 = _clEnqueueNDRangeKernel($287|0,$288|0,1,0,$289|0,$290|0,0,0,0)|0;
                        HEAP32[$err>>2] = $291;
                        $292 = HEAP32[$err>>2]|0;
                        $293 = ($292|0)!=(0);
                        
                        if ($293) {
                         $294 = HEAP32[$err>>2]|0;
                         
                         $gep_int289 = $vararg_buffer99;
                         $vararg_ptr101 = $gep_int289;
                         HEAP32[$vararg_ptr101>>2] = $294;
                         $expanded186 = 1;
                         $vararg_func102 = $expanded186;
                         $gep_int290 = 1488;
                         $expanded187 = $gep_int290;
                         u$257 = _printf($expanded187|0,$vararg_buffer99|0)|0;
                         
                         $1 = 1;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                        $295 = $image_data_fp32;
                        $296 = HEAP32[$image_width>>2]|0;
                        $297 = HEAP32[$image_height>>2]|0;
                        $298 = _generate_reference_histogram_results_fp32($295,$296,$297)|0;
                        $299 = $298;
                        $ref_histogram_results = $299;
                        $300 = $3;
                        $301 = HEAP32[$histogram_buffer>>2]|0;
                        $302 = $gpu_histogram_results;
                        $303 = $302;
                        $304 = _clEnqueueReadBuffer($300|0,$301|0,1,0,3084,$303|0,0,0,0)|0;
                        HEAP32[$err>>2] = $304;
                        $305 = HEAP32[$err>>2]|0;
                        $306 = ($305|0)!=(0);
                        
                        if ($306) {
                         $307 = HEAP32[$err>>2]|0;
                         
                         $gep_int291 = $vararg_buffer103;
                         $vararg_ptr105 = $gep_int291;
                         HEAP32[$vararg_ptr105>>2] = $307;
                         $expanded188 = 1;
                         $vararg_func106 = $expanded188;
                         $gep_int292 = 1144;
                         $expanded189 = $gep_int292;
                         u$266 = _printf($expanded189|0,$vararg_buffer103|0)|0;
                         
                         $1 = 1;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                        $308 = $gpu_histogram_results;
                        $309 = $ref_histogram_results;
                        $gep_int293 = 1576;
                        $expanded190 = $gep_int293;
                        u$270 = _verify_histogram_results($expanded190,$308,$309,771)|0;
                        $expanded191 = 2;
                        $310 = _emscripten_get_now()|0;
                        $311 = +($310|0);
                        $t1 = $311;
                        $i = 0;
                        
                        while(1) {
                         $312 = $i;
                         $expanded192 = 1200;
                         $313 = HEAP32[1200>>2]|0;
                         $314 = ($312|0)<($313|0);
                         
                         if (!($314)) {
                          label = 76;
                          break;
                         }
                         $315 = $3;
                         $316 = $histogram_rgba_fp32;
                         $gep_int294 = $global_work_size;
                         $317 = $gep_int294;
                         $gep_int295 = $local_work_size;
                         $318 = $gep_int295;
                         $319 = _clEnqueueNDRangeKernel($315|0,$316|0,1,0,$317|0,$318|0,0,0,0)|0;
                         HEAP32[$err>>2] = $319;
                         $320 = HEAP32[$err>>2]|0;
                         $321 = ($320|0)!=(0);
                         
                         if ($321) {
                          label = 71;
                          break;
                         }
                         $323 = $3;
                         $324 = $histogram_sum_partial_results_fp;
                         $gep_int298 = $partial_global_work_size;
                         $325 = $gep_int298;
                         $gep_int299 = $partial_local_work_size;
                         $326 = $gep_int299;
                         $327 = _clEnqueueNDRangeKernel($323|0,$324|0,1,0,$325|0,$326|0,0,0,0)|0;
                         HEAP32[$err>>2] = $327;
                         $328 = HEAP32[$err>>2]|0;
                         $329 = ($328|0)!=(0);
                         
                         if ($329) {
                          label = 73;
                          break;
                         }
                         
                         $331 = $i;
                         $332 = (($331) + 1)|0;
                         $i = $332;
                         
                        }
                        if ((label|0) == 71) {
                         $322 = HEAP32[$err>>2]|0;
                         
                         $gep_int296 = $vararg_buffer107;
                         $vararg_ptr109 = $gep_int296;
                         HEAP32[$vararg_ptr109>>2] = $322;
                         $expanded193 = 1;
                         $vararg_func110 = $expanded193;
                         $gep_int297 = 1312;
                         $expanded194 = $gep_int297;
                         u$279 = _printf($expanded194|0,$vararg_buffer107|0)|0;
                         
                         $1 = 1;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                        else if ((label|0) == 73) {
                         $330 = HEAP32[$err>>2]|0;
                         
                         $gep_int300 = $vararg_buffer111;
                         $vararg_ptr113 = $gep_int300;
                         HEAP32[$vararg_ptr113>>2] = $330;
                         $expanded195 = 1;
                         $vararg_func114 = $expanded195;
                         $gep_int301 = 1488;
                         $expanded196 = $gep_int301;
                         u$287 = _printf($expanded196|0,$vararg_buffer111|0)|0;
                         
                         $1 = 1;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                        else if ((label|0) == 76) {
                         $333 = $3;
                         u$294 = _clFinish($333|0)|0;
                         $expanded197 = 2;
                         $334 = _emscripten_get_now()|0;
                         $335 = +($334|0);
                         $t2 = $335;
                         $336 = $t2;
                         $337 = $t1;
                         $338 = $336 - $337;
                         $339 = 0.00100000004749745130538940429688 * $338;
                         $340 = $339;
                         $t3 = $340;
                         $341 = $t3;
                         $342 = 1.000000e+03 * $341;
                         
                         $gep_int302 = $vararg_buffer115;
                         $vararg_ptr117 = $gep_int302;
                         $gep_int303 = 1288;
                         $expanded198 = $gep_int303;
                         HEAP32[$vararg_ptr117>>2] = $expanded198;
                         $gep_int304 = $vararg_buffer115;
                         $gep305 = (($gep_int304) + 4)|0;
                         $vararg_ptr118 = $gep305;
                         $gep_int306 = 1296;
                         $expanded199 = $gep_int306;
                         HEAP32[$vararg_ptr118>>2] = $expanded199;
                         $gep_int307 = $vararg_buffer115;
                         $gep308 = (($gep_int307) + 8)|0;
                         $vararg_ptr119 = $gep308;
                         HEAPF64[tempDoublePtr>>3]=$342;HEAP32[$vararg_ptr119>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr119+4>>2]=HEAP32[tempDoublePtr+4>>2];
                         $expanded200 = 1;
                         $vararg_func120 = $expanded200;
                         $gep_int309 = 1592;
                         $expanded201 = $gep_int309;
                         u$301 = _printf($expanded201|0,$vararg_buffer115|0)|0;
                         
                         $343 = $ref_histogram_results;
                         $344 = $343;
                         _free($344);
                         $345 = $gpu_histogram_results;
                         $346 = $345;
                         _free($346);
                         $347 = $image_data_unorm8;
                         _free($347);
                         $348 = $image_data_fp32;
                         _free($348);
                         $349 = $histogram_rgba_unorm8;
                         u$307 = _clReleaseKernel($349|0)|0;
                         $350 = $histogram_rgba_fp16;
                         u$308 = _clReleaseKernel($350|0)|0;
                         $351 = $histogram_rgba_fp32;
                         u$309 = _clReleaseKernel($351|0)|0;
                         $352 = $histogram_sum_partial_results_unorm8;
                         u$310 = _clReleaseKernel($352|0)|0;
                         $353 = $histogram_sum_partial_results_fp;
                         u$311 = _clReleaseKernel($353|0)|0;
                         $354 = $program;
                         u$312 = _clReleaseProgram($354|0)|0;
                         $355 = HEAP32[$partial_histogram_buffer>>2]|0;
                         u$313 = _clReleaseMemObject($355|0)|0;
                         $356 = HEAP32[$histogram_buffer>>2]|0;
                         u$314 = _clReleaseMemObject($356|0)|0;
                         $357 = HEAP32[$input_image_unorm8>>2]|0;
                         u$315 = _clReleaseMemObject($357|0)|0;
                         $358 = HEAP32[$input_image_fp32>>2]|0;
                         u$316 = _clReleaseMemObject($358|0)|0;
                         $1 = 0;
                         
                         $359 = $1;
                         STACKTOP = sp;return $359|0;
                        }
                       }
                      } while(0);
                      $252 = HEAP32[$err>>2]|0;
                      
                      $gep_int277 = $vararg_buffer87;
                      $vararg_ptr89 = $gep_int277;
                      HEAP32[$vararg_ptr89>>2] = $252;
                      $expanded180 = 1;
                      $vararg_func90 = $expanded180;
                      $gep_int278 = 848;
                      $expanded181 = $gep_int278;
                      u$221 = _printf($expanded181|0,$vararg_buffer87|0)|0;
                      
                      $1 = 1;
                      
                      $359 = $1;
                      STACKTOP = sp;return $359|0;
                     }
                    }
                   } while(0);
                   $132 = HEAP32[$err>>2]|0;
                   
                   $gep_int243 = $vararg_buffer53;
                   $vararg_ptr55 = $gep_int243;
                   HEAP32[$vararg_ptr55>>2] = $132;
                   $expanded158 = 1;
                   $vararg_func56 = $expanded158;
                   $gep_int244 = 848;
                   $expanded159 = $gep_int244;
                   u$129 = _printf($expanded159|0,$vararg_buffer53|0)|0;
                   
                   $1 = 1;
                   
                   $359 = $1;
                   STACKTOP = sp;return $359|0;
                  }
                 } while(0);
                 $104 = HEAP32[$err>>2]|0;
                 
                 $gep_int239 = $vararg_buffer49;
                 $vararg_ptr51 = $gep_int239;
                 HEAP32[$vararg_ptr51>>2] = $104;
                 $expanded156 = 1;
                 $vararg_func52 = $expanded156;
                 $gep_int240 = 848;
                 $expanded157 = $gep_int240;
                 u$116 = _printf($expanded157|0,$vararg_buffer49|0)|0;
                 
                 $1 = 1;
                 
                 $359 = $1;
                 STACKTOP = sp;return $359|0;
                }
               } while(0);
               $88 = HEAP32[$err>>2]|0;
               
               $gep_int237 = $vararg_buffer45;
               $vararg_ptr47 = $gep_int237;
               HEAP32[$vararg_ptr47>>2] = $88;
               $expanded154 = 1;
               $vararg_func48 = $expanded154;
               $gep_int238 = 848;
               $expanded155 = $gep_int238;
               u$106 = _printf($expanded155|0,$vararg_buffer45|0)|0;
               
               $1 = 1;
               
               $359 = $1;
               STACKTOP = sp;return $359|0;
              }
             } while(0);
             $72 = HEAP32[$err>>2]|0;
             
             $gep_int235 = $vararg_buffer41;
             $vararg_ptr43 = $gep_int235;
             HEAP32[$vararg_ptr43>>2] = $72;
             $expanded152 = 1;
             $vararg_func44 = $expanded152;
             $gep_int236 = 848;
             $expanded153 = $gep_int236;
             u$96 = _printf($expanded153|0,$vararg_buffer41|0)|0;
             
             $1 = 1;
             
             $359 = $1;
             STACKTOP = sp;return $359|0;
            }
           } while(0);
           $65 = HEAP32[$err>>2]|0;
           
           $gep_int233 = $vararg_buffer37;
           $vararg_ptr39 = $gep_int233;
           HEAP32[$vararg_ptr39>>2] = $65;
           $expanded150 = 1;
           $vararg_func40 = $expanded150;
           $gep_int234 = 760;
           $expanded151 = $gep_int234;
           u$87 = _printf($expanded151|0,$vararg_buffer37|0)|0;
           
           $1 = 1;
           
           $359 = $1;
           STACKTOP = sp;return $359|0;
          }
         } while(0);
         $58 = HEAP32[$err>>2]|0;
         
         $gep_int230 = $vararg_buffer33;
         $vararg_ptr35 = $gep_int230;
         HEAP32[$vararg_ptr35>>2] = $58;
         $expanded147 = 1;
         $vararg_func36 = $expanded147;
         $gep_int231 = 624;
         $expanded148 = $gep_int231;
         u$78 = _printf($expanded148|0,$vararg_buffer33|0)|0;
         
         $1 = 1;
         
         $359 = $1;
         STACKTOP = sp;return $359|0;
        }
       } while(0);
       $51 = HEAP32[$err>>2]|0;
       
       $gep_int227 = $vararg_buffer29;
       $vararg_ptr31 = $gep_int227;
       HEAP32[$vararg_ptr31>>2] = $51;
       $expanded144 = 1;
       $vararg_func32 = $expanded144;
       $gep_int228 = 504;
       $expanded145 = $gep_int228;
       u$69 = _printf($expanded145|0,$vararg_buffer29|0)|0;
       
       $1 = 1;
       
       $359 = $1;
       STACKTOP = sp;return $359|0;
      }
     } while(0);
     $44 = HEAP32[$err>>2]|0;
     
     $gep_int224 = $vararg_buffer25;
     $vararg_ptr27 = $gep_int224;
     HEAP32[$vararg_ptr27>>2] = $44;
     $expanded141 = 1;
     $vararg_func28 = $expanded141;
     $gep_int225 = 400;
     $expanded142 = $gep_int225;
     u$60 = _printf($expanded142|0,$vararg_buffer25|0)|0;
     
     $1 = 1;
     
     $359 = $1;
     STACKTOP = sp;return $359|0;
    }
   } while(0);
   $37 = HEAP32[$err>>2]|0;
   
   $gep_int221 = $vararg_buffer21;
   $vararg_ptr23 = $gep_int221;
   HEAP32[$vararg_ptr23>>2] = $37;
   $expanded138 = 1;
   $vararg_func24 = $expanded138;
   $gep_int222 = 296;
   $expanded139 = $gep_int222;
   u$51 = _printf($expanded139|0,$vararg_buffer21|0)|0;
   
   $1 = 1;
   
   $359 = $1;
   STACKTOP = sp;return $359|0;
  }
 } while(0);
 $19 = HEAP32[$err>>2]|0;
 
 $gep_int212 = $vararg_buffer10;
 $vararg_ptr12 = $gep_int212;
 HEAP32[$vararg_ptr12>>2] = $19;
 $expanded131 = 1;
 $vararg_func13 = $expanded131;
 $gep_int213 = 176;
 $expanded132 = $gep_int213;
 u$28 = _printf($expanded132|0,$vararg_buffer10|0)|0;
 
 $1 = 1;
 
 $359 = $1;
 STACKTOP = sp;return $359|0;
}
function _read_kernel_from_file($filename,$source,$len) {
 $filename = $filename|0;
 $source = $source|0;
 $len = $len|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $fh = 0, $file_len = 0, $gep = 0, $gep3 = 0, $gep_int = 0, $gep_int1 = 0, $gep_int2 = 0, $statbuf = 0, label = 0, sp = 0, u$11 = 0, u$13 = 0;
 var u$7 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0;
 
 
 
 
 $statbuf = sp + 32|0;
 
 
 $2 = $filename;
 $3 = $source;
 $4 = $len;
 $5 = $2;
 $gep_int = 2352;
 $expanded = $gep_int;
 $6 = _fopen($5|0,$expanded|0)|0;
 $fh = $6;
 $7 = $fh;
 $8 = ($7|0)==(0);
 
 if ($8) {
  $1 = -1;
  
  $27 = $1;
  STACKTOP = sp;return $27|0;
 } else {
  $9 = $2;
  u$7 = _stat($9|0,$statbuf|0)|0;
  $gep_int1 = $statbuf;
  $gep = (($gep_int1) + 36)|0;
  $10 = $gep;
  $11 = HEAP32[$10>>2]|0;
  $file_len = $11;
  $12 = $file_len;
  $13 = $4;
  HEAP32[$13>>2] = $12;
  $14 = $file_len;
  $15 = (($14) + 1)|0;
  $16 = _malloc($15)|0;
  $17 = $3;
  HEAP32[$17>>2] = $16;
  $18 = $3;
  $19 = HEAP32[$18>>2]|0;
  $20 = $file_len;
  $21 = $fh;
  u$11 = _fread($19|0,$20|0,1,$21|0)|0;
  $22 = $file_len;
  $23 = $3;
  $24 = HEAP32[$23>>2]|0;
  $gep_int2 = $24;
  $gep3 = (($gep_int2) + ($22))|0;
  $25 = $gep3;
  HEAP8[$25] = 0;
  $26 = $fh;
  u$13 = _fclose($26|0)|0;
  $1 = 0;
  
  $27 = $1;
  STACKTOP = sp;return $27|0;
 }
 return 0|0;
}
function _create_image_data_unorm8($w,$h) {
 $w = $w|0;
 $h = $h|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $gep = 0, $gep_int = 0, $i = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 
 
 
 
 $1 = $w;
 $2 = $h;
 $3 = $1;
 $4 = $2;
 $5 = Math_imul($3, $4)|0;
 $6 = $5<<2;
 $7 = _malloc($6)|0;
 $p = $7;
 $i = 0;
 
 while(1) {
  $8 = $i;
  $9 = $1;
  $10 = $2;
  $11 = Math_imul($9, $10)|0;
  $12 = $11<<2;
  $13 = ($8|0)<($12|0);
  
  if (!($13)) {
   break;
  }
  $14 = _rand()|0;
  $15 = $14 & 255;
  $16 = $15&255;
  $17 = $i;
  $18 = $p;
  $gep_int = $18;
  $gep = (($gep_int) + ($17))|0;
  $19 = $gep;
  HEAP8[$19] = $16;
  
  $20 = $i;
  $21 = (($20) + 1)|0;
  $i = $21;
  
 }
 $22 = $p;
 STACKTOP = sp;return $22|0;
}
function _create_image_data_fp32($w,$h) {
 $w = $w|0;
 $h = $h|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0.0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $gep = 0, $gep_array = 0, $gep_int = 0, $i = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 
 
 
 
 $1 = $w;
 $2 = $h;
 $3 = $1;
 $4 = $2;
 $5 = Math_imul($3, $4)|0;
 $6 = $5<<2;
 $7 = $6<<2;
 $8 = _malloc($7)|0;
 $9 = $8;
 $p = $9;
 $i = 0;
 
 while(1) {
  $10 = $i;
  $11 = $1;
  $12 = $2;
  $13 = Math_imul($11, $12)|0;
  $14 = $13<<2;
  $15 = ($10|0)<($14|0);
  
  if (!($15)) {
   break;
  }
  $16 = _rand()|0;
  $17 = +($16|0);
  $18 = $17 / 2147483648.0;
  $19 = $i;
  $20 = $p;
  $gep_int = $20;
  $gep_array = $19<<2;
  $gep = (($gep_int) + ($gep_array))|0;
  $21 = $gep;
  HEAPF32[$21>>2] = $18;
  
  $22 = $i;
  $23 = (($22) + 1)|0;
  $i = $23;
  
 }
 $24 = $p;
 $25 = $24;
 STACKTOP = sp;return $25|0;
}
function _generate_reference_histogram_results_unorm8($image_data,$w,$h) {
 $image_data = $image_data|0;
 $w = $w|0;
 $h = $h|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $8 = 0, $9 = 0, $gep = 0, $gep11 = 0, $gep13 = 0, $gep16 = 0, $gep2 = 0, $gep4 = 0, $gep6 = 0, $gep9 = 0, $gep_array = 0, $gep_array15 = 0, $gep_array8 = 0;
 var $gep_int = 0, $gep_int1 = 0, $gep_int10 = 0, $gep_int12 = 0, $gep_int14 = 0, $gep_int3 = 0, $gep_int5 = 0, $gep_int7 = 0, $i = 0, $img = 0, $indx = 0, $indx1 = 0, $indx2 = 0, $ptr = 0, $ref_histogram_results = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 
 
 
 
 
 
 
 
 
 
 $1 = $image_data;
 $2 = $w;
 $3 = $h;
 $4 = _malloc(3072)|0;
 $5 = $4;
 $ref_histogram_results = $5;
 $6 = $1;
 $img = $6;
 $7 = $ref_histogram_results;
 $ptr = $7;
 $8 = $ref_histogram_results;
 $9 = $8;
 _memset($9|0,0,3072)|0;
 $i = 0;
 
 while(1) {
  $10 = $i;
  $11 = $2;
  $12 = $3;
  $13 = Math_imul($11, $12)|0;
  $14 = $13<<2;
  $15 = ($10|0)<($14|0);
  
  if (!($15)) {
   break;
  }
  $16 = $i;
  $17 = $img;
  $gep_int = $17;
  $gep = (($gep_int) + ($16))|0;
  $18 = $gep;
  $19 = HEAP8[$18]|0;
  $20 = $19&255;
  $indx = $20;
  $21 = $indx;
  $22 = $ptr;
  $gep_int1 = $22;
  $gep_array = $21<<2;
  $gep2 = (($gep_int1) + ($gep_array))|0;
  $23 = $gep2;
  $24 = HEAP32[$23>>2]|0;
  $25 = (($24) + 1)|0;
  HEAP32[$23>>2] = $25;
  
  $26 = $i;
  $27 = (($26) + 4)|0;
  $i = $27;
  
 }
 $28 = $ptr;
 $gep_int3 = $28;
 $gep4 = (($gep_int3) + 1024)|0;
 $29 = $gep4;
 $ptr = $29;
 $i = 1;
 
 while(1) {
  $30 = $i;
  $31 = $2;
  $32 = $3;
  $33 = Math_imul($31, $32)|0;
  $34 = $33<<2;
  $35 = ($30|0)<($34|0);
  
  if (!($35)) {
   break;
  }
  $36 = $i;
  $37 = $img;
  $gep_int5 = $37;
  $gep6 = (($gep_int5) + ($36))|0;
  $38 = $gep6;
  $39 = HEAP8[$38]|0;
  $40 = $39&255;
  $indx1 = $40;
  $41 = $indx1;
  $42 = $ptr;
  $gep_int7 = $42;
  $gep_array8 = $41<<2;
  $gep9 = (($gep_int7) + ($gep_array8))|0;
  $43 = $gep9;
  $44 = HEAP32[$43>>2]|0;
  $45 = (($44) + 1)|0;
  HEAP32[$43>>2] = $45;
  
  $46 = $i;
  $47 = (($46) + 4)|0;
  $i = $47;
  
 }
 $48 = $ptr;
 $gep_int10 = $48;
 $gep11 = (($gep_int10) + 1024)|0;
 $49 = $gep11;
 $ptr = $49;
 $i = 2;
 
 while(1) {
  $50 = $i;
  $51 = $2;
  $52 = $3;
  $53 = Math_imul($51, $52)|0;
  $54 = $53<<2;
  $55 = ($50|0)<($54|0);
  
  if (!($55)) {
   break;
  }
  $56 = $i;
  $57 = $img;
  $gep_int12 = $57;
  $gep13 = (($gep_int12) + ($56))|0;
  $58 = $gep13;
  $59 = HEAP8[$58]|0;
  $60 = $59&255;
  $indx2 = $60;
  $61 = $indx2;
  $62 = $ptr;
  $gep_int14 = $62;
  $gep_array15 = $61<<2;
  $gep16 = (($gep_int14) + ($gep_array15))|0;
  $63 = $gep16;
  $64 = HEAP32[$63>>2]|0;
  $65 = (($64) + 1)|0;
  HEAP32[$63>>2] = $65;
  
  $66 = $i;
  $67 = (($66) + 4)|0;
  $i = $67;
  
 }
 $68 = $ref_histogram_results;
 $69 = $68;
 STACKTOP = sp;return $69|0;
}
function _verify_histogram_results($str,$gpu_histogram_results,$ref_histogram_results,$num_entries) {
 $str = $str|0;
 $gpu_histogram_results = $gpu_histogram_results|0;
 $ref_histogram_results = $ref_histogram_results|0;
 $num_entries = $num_entries|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $expanded10 = 0, $expanded8 = 0, $expanded9 = 0, $gep = 0, $gep13 = 0, $gep16 = 0, $gep19 = 0, $gep22 = 0;
 var $gep24 = 0, $gep26 = 0, $gep_array = 0, $gep_array12 = 0, $gep_array15 = 0, $gep_array18 = 0, $gep_int = 0, $gep_int11 = 0, $gep_int14 = 0, $gep_int17 = 0, $gep_int20 = 0, $gep_int21 = 0, $gep_int23 = 0, $gep_int25 = 0, $gep_int27 = 0, $gep_int28 = 0, $gep_int29 = 0, $i = 0, $vararg_buffer = 0, $vararg_buffer4 = 0;
 var $vararg_func = 0, $vararg_func7 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast5 = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr6 = 0, label = 0, sp = 0, u$13 = 0, u$22 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer4 = sp;
 $vararg_lifetime_bitcast5 = $vararg_buffer4;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 
 
 
 $2 = $str;
 $3 = $gpu_histogram_results;
 $4 = $ref_histogram_results;
 $5 = $num_entries;
 $i = 0;
 
 while(1) {
  $6 = $i;
  $7 = $5;
  $8 = ($6|0)<($7|0);
  
  if (!($8)) {
   label = 7;
   break;
  }
  $9 = $i;
  $10 = $3;
  $gep_int = $10;
  $gep_array = $9<<2;
  $gep = (($gep_int) + ($gep_array))|0;
  $11 = $gep;
  $12 = HEAP32[$11>>2]|0;
  $13 = $i;
  $14 = $4;
  $gep_int11 = $14;
  $gep_array12 = $13<<2;
  $gep13 = (($gep_int11) + ($gep_array12))|0;
  $15 = $gep13;
  $16 = HEAP32[$15>>2]|0;
  $17 = ($12|0)!=($16|0);
  
  if ($17) {
   label = 4;
   break;
  }
  
  $28 = $i;
  $29 = (($28) + 1)|0;
  $i = $29;
  
 }
 if ((label|0) == 4) {
  $18 = $2;
  $19 = $i;
  $20 = $i;
  $21 = $3;
  $gep_int14 = $21;
  $gep_array15 = $20<<2;
  $gep16 = (($gep_int14) + ($gep_array15))|0;
  $22 = $gep16;
  $23 = HEAP32[$22>>2]|0;
  $24 = $i;
  $25 = $4;
  $gep_int17 = $25;
  $gep_array18 = $24<<2;
  $gep19 = (($gep_int17) + ($gep_array18))|0;
  $26 = $gep19;
  $27 = HEAP32[$26>>2]|0;
  
  $gep_int20 = $vararg_buffer;
  $vararg_ptr = $gep_int20;
  HEAP32[$vararg_ptr>>2] = $18;
  $gep_int21 = $vararg_buffer;
  $gep22 = (($gep_int21) + 4)|0;
  $vararg_ptr1 = $gep22;
  HEAP32[$vararg_ptr1>>2] = $19;
  $gep_int23 = $vararg_buffer;
  $gep24 = (($gep_int23) + 8)|0;
  $vararg_ptr2 = $gep24;
  HEAP32[$vararg_ptr2>>2] = $23;
  $gep_int25 = $vararg_buffer;
  $gep26 = (($gep_int25) + 12)|0;
  $vararg_ptr3 = $gep26;
  HEAP32[$vararg_ptr3>>2] = $27;
  $expanded = 1;
  $vararg_func = $expanded;
  $gep_int27 = 2240;
  $expanded8 = $gep_int27;
  u$13 = _printf($expanded8|0,$vararg_buffer|0)|0;
  
  $1 = -1;
  
  $31 = $1;
  STACKTOP = sp;return $31|0;
 }
 else if ((label|0) == 7) {
  $30 = $2;
  
  $gep_int28 = $vararg_buffer4;
  $vararg_ptr6 = $gep_int28;
  HEAP32[$vararg_ptr6>>2] = $30;
  $expanded9 = 1;
  $vararg_func7 = $expanded9;
  $gep_int29 = 2336;
  $expanded10 = $gep_int29;
  u$22 = _printf($expanded10|0,$vararg_buffer4|0)|0;
  
  $1 = 0;
  
  $31 = $1;
  STACKTOP = sp;return $31|0;
 }
 return 0|0;
}
function _generate_reference_histogram_results_fp32($image_data,$w,$h) {
 $image_data = $image_data|0;
 $w = $w|0;
 $h = $h|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0.0;
 var $46 = 0.0, $47 = 0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $9 = 0, $f = 0.0, $f1 = 0.0, $f3 = 0.0, $gep = 0, $gep11 = 0, $gep13 = 0, $gep16 = 0, $gep19 = 0, $gep3 = 0, $gep5 = 0, $gep8 = 0, $gep_array = 0, $gep_array10 = 0, $gep_array15 = 0, $gep_array18 = 0;
 var $gep_array2 = 0, $gep_array7 = 0, $gep_int = 0, $gep_int1 = 0, $gep_int12 = 0, $gep_int14 = 0, $gep_int17 = 0, $gep_int4 = 0, $gep_int6 = 0, $gep_int9 = 0, $i = 0, $img = 0, $indx = 0, $indx2 = 0, $indx4 = 0, $ptr = 0, $ref_histogram_results = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 104|0;
 
 
 
 
 
 
 
 
 
 
 
 
 
 $1 = $image_data;
 $2 = $w;
 $3 = $h;
 $4 = _malloc(3084)|0;
 $5 = $4;
 $ref_histogram_results = $5;
 $6 = $1;
 $7 = $6;
 $img = $7;
 $8 = $ref_histogram_results;
 $ptr = $8;
 $9 = $ref_histogram_results;
 $10 = $9;
 _memset($10|0,0,3084)|0;
 $i = 0;
 
 while(1) {
  $11 = $i;
  $12 = $2;
  $13 = $3;
  $14 = Math_imul($12, $13)|0;
  $15 = $14<<2;
  $16 = ($11|0)<($15|0);
  
  if (!($16)) {
   break;
  }
  $17 = $i;
  $18 = $img;
  $gep_int = $18;
  $gep_array = $17<<2;
  $gep = (($gep_int) + ($gep_array))|0;
  $19 = $gep;
  $20 = +HEAPF32[$19>>2];
  $f = $20;
  $21 = $f;
  $22 = $21 > 1.000000e+00;
  
  if ($22) {
   $f = 1.000000e+00;
   
  }
  $23 = $f;
  $24 = $23 * 2.560000e+02;
  $f = $24;
  $25 = $f;
  $26 = ~~(($25))>>>0;
  $indx = $26;
  $27 = $indx;
  $28 = $ptr;
  $gep_int1 = $28;
  $gep_array2 = $27<<2;
  $gep3 = (($gep_int1) + ($gep_array2))|0;
  $29 = $gep3;
  $30 = HEAP32[$29>>2]|0;
  $31 = (($30) + 1)|0;
  HEAP32[$29>>2] = $31;
  
  $32 = $i;
  $33 = (($32) + 4)|0;
  $i = $33;
  
 }
 $34 = $ptr;
 $gep_int4 = $34;
 $gep5 = (($gep_int4) + 1028)|0;
 $35 = $gep5;
 $ptr = $35;
 $i = 1;
 
 while(1) {
  $36 = $i;
  $37 = $2;
  $38 = $3;
  $39 = Math_imul($37, $38)|0;
  $40 = $39<<2;
  $41 = ($36|0)<($40|0);
  
  if (!($41)) {
   break;
  }
  $42 = $i;
  $43 = $img;
  $gep_int6 = $43;
  $gep_array7 = $42<<2;
  $gep8 = (($gep_int6) + ($gep_array7))|0;
  $44 = $gep8;
  $45 = +HEAPF32[$44>>2];
  $f1 = $45;
  $46 = $f1;
  $47 = $46 > 1.000000e+00;
  
  if ($47) {
   $f1 = 1.000000e+00;
   
  }
  $48 = $f1;
  $49 = $48 * 2.560000e+02;
  $f1 = $49;
  $50 = $f1;
  $51 = ~~(($50))>>>0;
  $indx2 = $51;
  $52 = $indx2;
  $53 = $ptr;
  $gep_int9 = $53;
  $gep_array10 = $52<<2;
  $gep11 = (($gep_int9) + ($gep_array10))|0;
  $54 = $gep11;
  $55 = HEAP32[$54>>2]|0;
  $56 = (($55) + 1)|0;
  HEAP32[$54>>2] = $56;
  
  $57 = $i;
  $58 = (($57) + 4)|0;
  $i = $58;
  
 }
 $59 = $ptr;
 $gep_int12 = $59;
 $gep13 = (($gep_int12) + 1028)|0;
 $60 = $gep13;
 $ptr = $60;
 $i = 2;
 
 while(1) {
  $61 = $i;
  $62 = $2;
  $63 = $3;
  $64 = Math_imul($62, $63)|0;
  $65 = $64<<2;
  $66 = ($61|0)<($65|0);
  
  if (!($66)) {
   break;
  }
  $67 = $i;
  $68 = $img;
  $gep_int14 = $68;
  $gep_array15 = $67<<2;
  $gep16 = (($gep_int14) + ($gep_array15))|0;
  $69 = $gep16;
  $70 = +HEAPF32[$69>>2];
  $f3 = $70;
  $71 = $f3;
  $72 = $71 > 1.000000e+00;
  
  if ($72) {
   $f3 = 1.000000e+00;
   
  }
  $73 = $f3;
  $74 = $73 * 2.560000e+02;
  $f3 = $74;
  $75 = $f3;
  $76 = ~~(($75))>>>0;
  $indx4 = $76;
  $77 = $indx4;
  $78 = $ptr;
  $gep_int17 = $78;
  $gep_array18 = $77<<2;
  $gep19 = (($gep_int17) + ($gep_array18))|0;
  $79 = $gep19;
  $80 = HEAP32[$79>>2]|0;
  $81 = (($80) + 1)|0;
  HEAP32[$79>>2] = $81;
  
  $82 = $i;
  $83 = (($82) + 4)|0;
  $i = $83;
  
 }
 $84 = $ref_histogram_results;
 $85 = $84;
 STACKTOP = sp;return $85|0;
}
function _test_histogram_with_images($context,$queue,$device) {
 $context = $context|0;
 $queue = $queue|0;
 $device = $device|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0.0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0.0, $246 = 0.0, $247 = 0.0, $248 = 0.0, $249 = 0.0, $25 = 0, $250 = 0.0, $251 = 0.0, $252 = 0.0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0;
 var $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0;
 var $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0;
 var $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0.0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0;
 var $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0.0, $401 = 0.0, $402 = 0.0, $403 = 0.0, $404 = 0.0;
 var $405 = 0.0, $406 = 0.0, $407 = 0.0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0;
 var $423 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0;
 var $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0;
 var $97 = 0, $98 = 0, $99 = 0, $buffer = 0, $err = 0, $expanded = 0, $expanded117 = 0, $expanded118 = 0, $expanded119 = 0, $expanded120 = 0, $expanded121 = 0, $expanded122 = 0, $expanded123 = 0, $expanded124 = 0, $expanded125 = 0, $expanded126 = 0, $expanded127 = 0, $expanded128 = 0, $expanded129 = 0, $expanded130 = 0;
 var $expanded131 = 0, $expanded132 = 0, $expanded133 = 0, $expanded134 = 0, $expanded135 = 0, $expanded136 = 0, $expanded137 = 0, $expanded138 = 0, $expanded139 = 0, $expanded140 = 0, $expanded141 = 0, $expanded142 = 0, $expanded143 = 0, $expanded144 = 0, $expanded145 = 0, $expanded146 = 0, $expanded147 = 0, $expanded148 = 0, $expanded149 = 0, $expanded150 = 0;
 var $expanded151 = 0, $expanded152 = 0, $expanded153 = 0, $expanded154 = 0, $expanded155 = 0, $expanded156 = 0, $expanded157 = 0, $expanded158 = 0, $expanded159 = 0, $expanded160 = 0, $expanded161 = 0, $expanded162 = 0, $expanded163 = 0, $expanded164 = 0, $expanded165 = 0, $expanded166 = 0, $expanded167 = 0, $expanded168 = 0, $expanded169 = 0, $expanded170 = 0;
 var $expanded171 = 0, $expanded172 = 0, $expanded173 = 0, $expanded174 = 0, $expanded175 = 0, $expanded176 = 0, $expanded177 = 0, $expanded178 = 0, $expanded179 = 0, $expanded180 = 0, $expanded181 = 0, $expanded182 = 0, $expanded183 = 0, $expanded184 = 0, $expanded185 = 0, $expanded186 = 0, $expanded187 = 0, $expanded188 = 0, $expanded189 = 0, $expanded190 = 0;
 var $expanded191 = 0, $expanded192 = 0, $expanded193 = 0, $expanded194 = 0, $gep = 0, $gep233 = 0, $gep238 = 0, $gep241 = 0, $gep244 = 0, $gep248 = 0, $gep250 = 0, $gep255 = 0, $gep257 = 0, $gep259 = 0, $gep262 = 0, $gep266 = 0, $gep268 = 0, $gep297 = 0, $gep300 = 0, $gep304 = 0;
 var $gep307 = 0, $gep310 = 0, $gep314 = 0, $gep316 = 0, $gep321 = 0, $gep323 = 0, $gep325 = 0, $gep328 = 0, $gep332 = 0, $gep334 = 0, $gep363 = 0, $gep366 = 0, $gep_int = 0, $gep_int195 = 0, $gep_int196 = 0, $gep_int197 = 0, $gep_int198 = 0, $gep_int199 = 0, $gep_int200 = 0, $gep_int201 = 0;
 var $gep_int202 = 0, $gep_int203 = 0, $gep_int204 = 0, $gep_int205 = 0, $gep_int206 = 0, $gep_int207 = 0, $gep_int208 = 0, $gep_int209 = 0, $gep_int210 = 0, $gep_int211 = 0, $gep_int212 = 0, $gep_int213 = 0, $gep_int214 = 0, $gep_int215 = 0, $gep_int216 = 0, $gep_int217 = 0, $gep_int218 = 0, $gep_int219 = 0, $gep_int220 = 0, $gep_int221 = 0;
 var $gep_int222 = 0, $gep_int223 = 0, $gep_int224 = 0, $gep_int225 = 0, $gep_int226 = 0, $gep_int227 = 0, $gep_int228 = 0, $gep_int229 = 0, $gep_int230 = 0, $gep_int231 = 0, $gep_int232 = 0, $gep_int234 = 0, $gep_int235 = 0, $gep_int236 = 0, $gep_int237 = 0, $gep_int239 = 0, $gep_int240 = 0, $gep_int242 = 0, $gep_int243 = 0, $gep_int245 = 0;
 var $gep_int246 = 0, $gep_int247 = 0, $gep_int249 = 0, $gep_int251 = 0, $gep_int252 = 0, $gep_int253 = 0, $gep_int254 = 0, $gep_int256 = 0, $gep_int258 = 0, $gep_int260 = 0, $gep_int261 = 0, $gep_int263 = 0, $gep_int264 = 0, $gep_int265 = 0, $gep_int267 = 0, $gep_int269 = 0, $gep_int270 = 0, $gep_int271 = 0, $gep_int272 = 0, $gep_int273 = 0;
 var $gep_int274 = 0, $gep_int275 = 0, $gep_int276 = 0, $gep_int277 = 0, $gep_int278 = 0, $gep_int279 = 0, $gep_int280 = 0, $gep_int281 = 0, $gep_int282 = 0, $gep_int283 = 0, $gep_int284 = 0, $gep_int285 = 0, $gep_int286 = 0, $gep_int287 = 0, $gep_int288 = 0, $gep_int289 = 0, $gep_int290 = 0, $gep_int291 = 0, $gep_int292 = 0, $gep_int293 = 0;
 var $gep_int294 = 0, $gep_int295 = 0, $gep_int296 = 0, $gep_int298 = 0, $gep_int299 = 0, $gep_int301 = 0, $gep_int302 = 0, $gep_int303 = 0, $gep_int305 = 0, $gep_int306 = 0, $gep_int308 = 0, $gep_int309 = 0, $gep_int311 = 0, $gep_int312 = 0, $gep_int313 = 0, $gep_int315 = 0, $gep_int317 = 0, $gep_int318 = 0, $gep_int319 = 0, $gep_int320 = 0;
 var $gep_int322 = 0, $gep_int324 = 0, $gep_int326 = 0, $gep_int327 = 0, $gep_int329 = 0, $gep_int330 = 0, $gep_int331 = 0, $gep_int333 = 0, $gep_int335 = 0, $gep_int336 = 0, $gep_int337 = 0, $gep_int338 = 0, $gep_int339 = 0, $gep_int340 = 0, $gep_int341 = 0, $gep_int342 = 0, $gep_int343 = 0, $gep_int344 = 0, $gep_int345 = 0, $gep_int346 = 0;
 var $gep_int347 = 0, $gep_int348 = 0, $gep_int349 = 0, $gep_int350 = 0, $gep_int351 = 0, $gep_int352 = 0, $gep_int353 = 0, $gep_int354 = 0, $gep_int355 = 0, $gep_int356 = 0, $gep_int357 = 0, $gep_int358 = 0, $gep_int359 = 0, $gep_int360 = 0, $gep_int361 = 0, $gep_int362 = 0, $gep_int364 = 0, $gep_int365 = 0, $gep_int367 = 0, $global_work_size = 0;
 var $gpu_histogram_results = 0, $gsize = 0, $gsize1 = 0, $histogram_buffer = 0, $histogram_rgba_fp = 0, $histogram_rgba_unorm8 = 0, $histogram_sum_partial_results_fp = 0, $histogram_sum_partial_results_unorm8 = 0, $i = 0, $image_data_fp32 = 0, $image_data_unorm8 = 0, $image_format = 0, $image_height = 0, $image_width = 0, $input_image_fp32 = 0, $input_image_unorm8 = 0, $local_work_size = 0, $num_groups = 0, $partial_global_work_size = 0, $partial_histogram_buffer = 0;
 var $partial_local_work_size = 0, $program = 0, $ref_histogram_results = 0, $source = 0, $src_len = 0, $t = 0.0, $t1 = 0.0, $t2 = 0.0, $t3 = 0.0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer103 = 0, $vararg_buffer107 = 0, $vararg_buffer111 = 0, $vararg_buffer14 = 0, $vararg_buffer17 = 0, $vararg_buffer21 = 0, $vararg_buffer25 = 0, $vararg_buffer29 = 0;
 var $vararg_buffer33 = 0, $vararg_buffer37 = 0, $vararg_buffer4 = 0, $vararg_buffer41 = 0, $vararg_buffer45 = 0, $vararg_buffer49 = 0, $vararg_buffer53 = 0, $vararg_buffer57 = 0, $vararg_buffer61 = 0, $vararg_buffer65 = 0, $vararg_buffer69 = 0, $vararg_buffer7 = 0, $vararg_buffer73 = 0, $vararg_buffer77 = 0, $vararg_buffer83 = 0, $vararg_buffer87 = 0, $vararg_buffer91 = 0, $vararg_buffer95 = 0, $vararg_buffer99 = 0, $vararg_func = 0;
 var $vararg_func102 = 0, $vararg_func106 = 0, $vararg_func110 = 0, $vararg_func116 = 0, $vararg_func13 = 0, $vararg_func16 = 0, $vararg_func20 = 0, $vararg_func24 = 0, $vararg_func28 = 0, $vararg_func3 = 0, $vararg_func32 = 0, $vararg_func36 = 0, $vararg_func40 = 0, $vararg_func44 = 0, $vararg_func48 = 0, $vararg_func52 = 0, $vararg_func56 = 0, $vararg_func6 = 0, $vararg_func60 = 0, $vararg_func64 = 0;
 var $vararg_func68 = 0, $vararg_func72 = 0, $vararg_func76 = 0, $vararg_func82 = 0, $vararg_func86 = 0, $vararg_func9 = 0, $vararg_func90 = 0, $vararg_func94 = 0, $vararg_func98 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast100 = 0, $vararg_lifetime_bitcast104 = 0, $vararg_lifetime_bitcast108 = 0, $vararg_lifetime_bitcast11 = 0, $vararg_lifetime_bitcast112 = 0, $vararg_lifetime_bitcast15 = 0, $vararg_lifetime_bitcast18 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast22 = 0, $vararg_lifetime_bitcast26 = 0;
 var $vararg_lifetime_bitcast30 = 0, $vararg_lifetime_bitcast34 = 0, $vararg_lifetime_bitcast38 = 0, $vararg_lifetime_bitcast42 = 0, $vararg_lifetime_bitcast46 = 0, $vararg_lifetime_bitcast5 = 0, $vararg_lifetime_bitcast50 = 0, $vararg_lifetime_bitcast54 = 0, $vararg_lifetime_bitcast58 = 0, $vararg_lifetime_bitcast62 = 0, $vararg_lifetime_bitcast66 = 0, $vararg_lifetime_bitcast70 = 0, $vararg_lifetime_bitcast74 = 0, $vararg_lifetime_bitcast78 = 0, $vararg_lifetime_bitcast8 = 0, $vararg_lifetime_bitcast84 = 0, $vararg_lifetime_bitcast88 = 0, $vararg_lifetime_bitcast92 = 0, $vararg_lifetime_bitcast96 = 0, $vararg_ptr = 0;
 var $vararg_ptr101 = 0, $vararg_ptr105 = 0, $vararg_ptr109 = 0, $vararg_ptr113 = 0, $vararg_ptr114 = 0, $vararg_ptr115 = 0, $vararg_ptr12 = 0, $vararg_ptr19 = 0, $vararg_ptr23 = 0, $vararg_ptr27 = 0, $vararg_ptr31 = 0, $vararg_ptr35 = 0, $vararg_ptr39 = 0, $vararg_ptr43 = 0, $vararg_ptr47 = 0, $vararg_ptr51 = 0, $vararg_ptr55 = 0, $vararg_ptr59 = 0, $vararg_ptr63 = 0, $vararg_ptr67 = 0;
 var $vararg_ptr71 = 0, $vararg_ptr75 = 0, $vararg_ptr79 = 0, $vararg_ptr80 = 0, $vararg_ptr81 = 0, $vararg_ptr85 = 0, $vararg_ptr89 = 0, $vararg_ptr93 = 0, $vararg_ptr97 = 0, $workgroup_size = 0, label = 0, sp = 0, u$111 = 0, u$115 = 0, u$12 = 0, u$140 = 0, u$144 = 0, u$145 = 0, u$146 = 0, u$147 = 0;
 var u$148 = 0, u$153 = 0, u$157 = 0, u$161 = 0, u$174 = 0, u$184 = 0, u$188 = 0, u$19 = 0, u$197 = 0, u$205 = 0, u$212 = 0, u$219 = 0, u$221 = 0, u$246 = 0, u$250 = 0, u$251 = 0, u$252 = 0, u$253 = 0, u$254 = 0, u$259 = 0;
 var u$263 = 0, u$267 = 0, u$28 = 0, u$280 = 0, u$289 = 0, u$293 = 0, u$302 = 0, u$310 = 0, u$317 = 0, u$324 = 0, u$330 = 0, u$331 = 0, u$332 = 0, u$333 = 0, u$334 = 0, u$335 = 0, u$336 = 0, u$337 = 0, u$338 = 0, u$37 = 0;
 var u$39 = 0, u$42 = 0, u$51 = 0, u$6 = 0, u$60 = 0, u$69 = 0, u$78 = 0, u$87 = 0, u$9 = 0, u$99 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer111 = sp;
 $vararg_lifetime_bitcast112 = $vararg_buffer111;
 $vararg_buffer107 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast108 = $vararg_buffer107;
 $vararg_buffer103 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast104 = $vararg_buffer103;
 $vararg_buffer99 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast100 = $vararg_buffer99;
 $vararg_buffer95 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast96 = $vararg_buffer95;
 $vararg_buffer91 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast92 = $vararg_buffer91;
 $vararg_buffer87 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast88 = $vararg_buffer87;
 $vararg_buffer83 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast84 = $vararg_buffer83;
 $vararg_buffer77 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast78 = $vararg_buffer77;
 $vararg_buffer73 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast74 = $vararg_buffer73;
 $vararg_buffer69 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast70 = $vararg_buffer69;
 $vararg_buffer65 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast66 = $vararg_buffer65;
 $vararg_buffer61 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast62 = $vararg_buffer61;
 $vararg_buffer57 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast58 = $vararg_buffer57;
 $vararg_buffer53 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast54 = $vararg_buffer53;
 $vararg_buffer49 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast50 = $vararg_buffer49;
 $vararg_buffer45 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast46 = $vararg_buffer45;
 $vararg_buffer41 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast42 = $vararg_buffer41;
 $vararg_buffer37 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast38 = $vararg_buffer37;
 $vararg_buffer33 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast34 = $vararg_buffer33;
 $vararg_buffer29 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast30 = $vararg_buffer29;
 $vararg_buffer25 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast26 = $vararg_buffer25;
 $vararg_buffer21 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast22 = $vararg_buffer21;
 $vararg_buffer17 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast18 = $vararg_buffer17;
 $vararg_buffer14 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast15 = $vararg_buffer14;
 $vararg_buffer10 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast11 = $vararg_buffer10;
 $vararg_buffer7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast8 = $vararg_buffer7;
 $vararg_buffer4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast5 = $vararg_buffer4;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 
 
 $image_format = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 $global_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $local_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $partial_global_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $partial_local_work_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $workgroup_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $num_groups = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 $input_image_unorm8 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $input_image_fp32 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $histogram_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $partial_histogram_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $src_len = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $source = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 $err = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 2048|0;
 $gsize = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $gsize1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $2 = $context;
 $3 = $queue;
 HEAP32[$4>>2] = $device;
 $image_width = 1920;
 $image_height = 1080;
 
 $expanded = 1;
 $vararg_func = $expanded;
 $gep_int = 1672;
 $expanded117 = $gep_int;
 u$6 = _printf($expanded117|0,$vararg_buffer|0)|0;
 
 
 $expanded118 = 1;
 $vararg_func3 = $expanded118;
 $gep_int195 = 1704;
 $expanded119 = $gep_int195;
 u$9 = _printf($expanded119|0,$vararg_buffer1|0)|0;
 
 
 $expanded120 = 1;
 $vararg_func6 = $expanded120;
 $gep_int196 = 1672;
 $expanded121 = $gep_int196;
 u$12 = _printf($expanded121|0,$vararg_buffer4|0)|0;
 
 $expanded122 = 1;
 $5 = _time(0)|0;
 _srand($5|0);
 $gep_int197 = $source;
 $6 = $gep_int197;
 $gep_int198 = $src_len;
 $7 = $gep_int198;
 $gep_int199 = 32;
 $expanded123 = $gep_int199;
 $8 = _read_kernel_from_file($expanded123,$6,$7)|0;
 HEAP32[$err>>2] = $8;
 $9 = HEAP32[$err>>2]|0;
 $10 = ($9|0)!=(0);
 
 if ($10) {
  
  $gep_int200 = $vararg_buffer7;
  $vararg_ptr = $gep_int200;
  $gep_int201 = 32;
  $expanded124 = $gep_int201;
  HEAP32[$vararg_ptr>>2] = $expanded124;
  $expanded125 = 1;
  $vararg_func9 = $expanded125;
  $gep_int202 = 120;
  $expanded126 = $gep_int202;
  u$19 = _printf($expanded126|0,$vararg_buffer7|0)|0;
  
  $1 = 1;
  
  $423 = $1;
  STACKTOP = sp;return $423|0;
 }
 $11 = $2;
 $gep_int203 = $source;
 $12 = $gep_int203;
 $gep_int204 = $src_len;
 $13 = $gep_int204;
 $14 = _clCreateProgramWithSource($11|0,1,$12|0,$13|0,$err|0)|0;
 $program = $14;
 $15 = $program;
 $16 = ($15|0)!=(0);
 
 do {
  if ($16) {
   $17 = HEAP32[$err>>2]|0;
   $18 = ($17|0)!=(0);
   
   if ($18) {
    break;
   }
   $gep_int207 = $source;
   $20 = $gep_int207;
   $21 = HEAP32[$20>>2]|0;
   _free($21);
   $22 = $program;
   $23 = _clBuildProgram($22|0,1,$4|0,0,0,0)|0;
   HEAP32[$err>>2] = $23;
   $24 = HEAP32[$err>>2]|0;
   $25 = ($24|0)!=(0);
   
   if ($25) {
    $26 = $buffer;
    _memset($26|0,0,2048)|0;
    
    $expanded129 = 1;
    $vararg_func16 = $expanded129;
    $gep_int208 = 224;
    $expanded130 = $gep_int208;
    u$37 = _printf($expanded130|0,$vararg_buffer14|0)|0;
    
    $27 = $program;
    $28 = HEAP32[$4>>2]|0;
    $gep_int209 = $buffer;
    $29 = $gep_int209;
    u$39 = _clGetProgramBuildInfo($27|0,$28|0,4483,2048,$29|0,0)|0;
    $gep_int210 = $buffer;
    $30 = $gep_int210;
    
    $gep_int211 = $vararg_buffer17;
    $vararg_ptr19 = $gep_int211;
    HEAP32[$vararg_ptr19>>2] = $30;
    $expanded131 = 1;
    $vararg_func20 = $expanded131;
    $gep_int212 = 256;
    $expanded132 = $gep_int212;
    u$42 = _printf($expanded132|0,$vararg_buffer17|0)|0;
    
    $1 = 1;
    
    $423 = $1;
    STACKTOP = sp;return $423|0;
   }
   $31 = $program;
   $gep_int213 = 1736;
   $expanded133 = $gep_int213;
   $32 = _clCreateKernel($31|0,$expanded133|0,$err|0)|0;
   $histogram_rgba_unorm8 = $32;
   $33 = $histogram_rgba_unorm8;
   $34 = ($33|0)!=(0);
   
   do {
    if ($34) {
     $35 = HEAP32[$err>>2]|0;
     $36 = ($35|0)!=(0);
     
     if ($36) {
      break;
     }
     $38 = $program;
     $gep_int216 = 1768;
     $expanded136 = $gep_int216;
     $39 = _clCreateKernel($38|0,$expanded136|0,$err|0)|0;
     $histogram_rgba_fp = $39;
     $40 = $histogram_rgba_fp;
     $41 = ($40|0)!=(0);
     
     do {
      if ($41) {
       $42 = HEAP32[$err>>2]|0;
       $43 = ($42|0)!=(0);
       
       if ($43) {
        break;
       }
       $45 = $program;
       $gep_int219 = 584;
       $expanded139 = $gep_int219;
       $46 = _clCreateKernel($45|0,$expanded139|0,$err|0)|0;
       $histogram_sum_partial_results_unorm8 = $46;
       $47 = $histogram_sum_partial_results_unorm8;
       $48 = ($47|0)!=(0);
       
       do {
        if ($48) {
         $49 = HEAP32[$err>>2]|0;
         $50 = ($49|0)!=(0);
         
         if ($50) {
          break;
         }
         $52 = $program;
         $gep_int222 = 720;
         $expanded142 = $gep_int222;
         $53 = _clCreateKernel($52|0,$expanded142|0,$err|0)|0;
         $histogram_sum_partial_results_fp = $53;
         $54 = $histogram_sum_partial_results_fp;
         $55 = ($54|0)!=(0);
         
         do {
          if ($55) {
           $56 = HEAP32[$err>>2]|0;
           $57 = ($56|0)!=(0);
           
           if ($57) {
            break;
           }
           $59 = $2;
           $60 = _clCreateBuffer($59|0,2,0,3084,0,$err|0)|0;
           HEAP32[$histogram_buffer>>2] = $60;
           $61 = HEAP32[$histogram_buffer>>2]|0;
           $62 = ($61|0)!=(0);
           
           do {
            if ($62) {
             $63 = HEAP32[$err>>2]|0;
             $64 = ($63|0)!=(0);
             
             if ($64) {
              break;
             }
             $gep_int227 = $image_format;
             $66 = $gep_int227;
             HEAP32[$66>>2] = 4277;
             $gep_int228 = $image_format;
             $gep = (($gep_int228) + 4)|0;
             $67 = $gep;
             HEAP32[$67>>2] = 4306;
             $68 = $image_width;
             $69 = $image_height;
             $70 = _create_image_data_unorm8($68,$69)|0;
             $image_data_unorm8 = $70;
             $71 = $2;
             $72 = $image_width;
             $73 = $image_height;
             $74 = $image_data_unorm8;
             $75 = _clCreateImage2D($71|0,36,0,$image_format|0,$72|0,$73|0,0,$74|0,$err|0)|0;
             HEAP32[$input_image_unorm8>>2] = $75;
             $76 = HEAP32[$input_image_unorm8>>2]|0;
             $77 = ($76|0)!=(0);
             
             do {
              if ($77) {
               $78 = HEAP32[$err>>2]|0;
               $79 = ($78|0)!=(0);
               
               if ($79) {
                break;
               }
               $gep_int231 = $image_format;
               $81 = $gep_int231;
               HEAP32[$81>>2] = 4277;
               $gep_int232 = $image_format;
               $gep233 = (($gep_int232) + 4)|0;
               $82 = $gep233;
               HEAP32[$82>>2] = 4318;
               $83 = $image_width;
               $84 = $image_height;
               $85 = _create_image_data_fp32($83,$84)|0;
               $image_data_fp32 = $85;
               $86 = $2;
               $87 = $image_width;
               $88 = $image_height;
               $89 = $image_data_fp32;
               $90 = _clCreateImage2D($86|0,36,0,$image_format|0,$87|0,$88|0,0,$89|0,$err|0)|0;
               HEAP32[$input_image_fp32>>2] = $90;
               $91 = HEAP32[$input_image_fp32>>2]|0;
               $92 = ($91|0)!=(0);
               
               do {
                if ($92) {
                 $93 = HEAP32[$err>>2]|0;
                 $94 = ($93|0)!=(0);
                 
                 if ($94) {
                  break;
                 }
                 $96 = $histogram_rgba_unorm8;
                 $97 = HEAP32[$4>>2]|0;
                 $98 = $workgroup_size;
                 u$115 = _clGetKernelWorkGroupInfo($96|0,$97|0,4528,4,$98|0,0)|0;
                 $99 = HEAP32[$workgroup_size>>2]|0;
                 $100 = ($99>>>0)<=(256);
                 
                 if ($100) {
                  $gep_int236 = $gsize;
                  $101 = $gep_int236;
                  HEAP32[$101>>2] = 16;
                  $102 = HEAP32[$workgroup_size>>2]|0;
                  $103 = (($102>>>0) / 16)&-1;
                  $gep_int237 = $gsize;
                  $gep238 = (($gep_int237) + 4)|0;
                  $104 = $gep238;
                  HEAP32[$104>>2] = $103;
                  
                 } else {
                  $105 = HEAP32[$workgroup_size>>2]|0;
                  $106 = ($105>>>0)<=(1024);
                  
                  if ($106) {
                   $107 = HEAP32[$workgroup_size>>2]|0;
                   $108 = (($107>>>0) / 16)&-1;
                   $gep_int239 = $gsize;
                   $109 = $gep_int239;
                   HEAP32[$109>>2] = $108;
                   $gep_int240 = $gsize;
                   $gep241 = (($gep_int240) + 4)|0;
                   $110 = $gep241;
                   HEAP32[$110>>2] = 16;
                   
                  } else {
                   $111 = HEAP32[$workgroup_size>>2]|0;
                   $112 = (($111>>>0) / 32)&-1;
                   $gep_int242 = $gsize;
                   $113 = $gep_int242;
                   HEAP32[$113>>2] = $112;
                   $gep_int243 = $gsize;
                   $gep244 = (($gep_int243) + 4)|0;
                   $114 = $gep244;
                   HEAP32[$114>>2] = 32;
                   
                  }
                  
                 }
                 $gep_int245 = $gsize;
                 $115 = $gep_int245;
                 $116 = HEAP32[$115>>2]|0;
                 $gep_int246 = $local_work_size;
                 $117 = $gep_int246;
                 HEAP32[$117>>2] = $116;
                 $gep_int247 = $gsize;
                 $gep248 = (($gep_int247) + 4)|0;
                 $118 = $gep248;
                 $119 = HEAP32[$118>>2]|0;
                 $gep_int249 = $local_work_size;
                 $gep250 = (($gep_int249) + 4)|0;
                 $120 = $gep250;
                 HEAP32[$120>>2] = $119;
                 $121 = $image_width;
                 $gep_int251 = $gsize;
                 $122 = $gep_int251;
                 $123 = HEAP32[$122>>2]|0;
                 $124 = (($121) + ($123))|0;
                 $125 = (($124) - 1)|0;
                 $gep_int252 = $gsize;
                 $126 = $gep_int252;
                 $127 = HEAP32[$126>>2]|0;
                 $128 = (($125>>>0) / ($127>>>0))&-1;
                 $gep_int253 = $global_work_size;
                 $129 = $gep_int253;
                 HEAP32[$129>>2] = $128;
                 $130 = $image_height;
                 $gep_int254 = $gsize;
                 $gep255 = (($gep_int254) + 4)|0;
                 $131 = $gep255;
                 $132 = HEAP32[$131>>2]|0;
                 $133 = (($130) + ($132))|0;
                 $134 = (($133) - 1)|0;
                 $gep_int256 = $gsize;
                 $gep257 = (($gep_int256) + 4)|0;
                 $135 = $gep257;
                 $136 = HEAP32[$135>>2]|0;
                 $137 = (($134>>>0) / ($136>>>0))&-1;
                 $gep_int258 = $global_work_size;
                 $gep259 = (($gep_int258) + 4)|0;
                 $138 = $gep259;
                 HEAP32[$138>>2] = $137;
                 $gep_int260 = $global_work_size;
                 $139 = $gep_int260;
                 $140 = HEAP32[$139>>2]|0;
                 $gep_int261 = $global_work_size;
                 $gep262 = (($gep_int261) + 4)|0;
                 $141 = $gep262;
                 $142 = HEAP32[$141>>2]|0;
                 $143 = Math_imul($140, $142)|0;
                 HEAP32[$num_groups>>2] = $143;
                 $gep_int263 = $gsize;
                 $144 = $gep_int263;
                 $145 = HEAP32[$144>>2]|0;
                 $gep_int264 = $global_work_size;
                 $146 = $gep_int264;
                 $147 = HEAP32[$146>>2]|0;
                 $148 = Math_imul($147, $145)|0;
                 HEAP32[$146>>2] = $148;
                 $gep_int265 = $gsize;
                 $gep266 = (($gep_int265) + 4)|0;
                 $149 = $gep266;
                 $150 = HEAP32[$149>>2]|0;
                 $gep_int267 = $global_work_size;
                 $gep268 = (($gep_int267) + 4)|0;
                 $151 = $gep268;
                 $152 = HEAP32[$151>>2]|0;
                 $153 = Math_imul($152, $150)|0;
                 HEAP32[$151>>2] = $153;
                 $154 = $2;
                 $155 = HEAP32[$num_groups>>2]|0;
                 $156 = ($155*257)|0;
                 $157 = ($156*3)|0;
                 $158 = $157<<2;
                 $159 = _clCreateBuffer($154|0,1,0,$158|0,0,$err|0)|0;
                 HEAP32[$partial_histogram_buffer>>2] = $159;
                 $160 = HEAP32[$partial_histogram_buffer>>2]|0;
                 $161 = ($160|0)!=(0);
                 
                 do {
                  if ($161) {
                   $162 = HEAP32[$err>>2]|0;
                   $163 = ($162|0)!=(0);
                   
                   if ($163) {
                    break;
                   }
                   $165 = $histogram_rgba_unorm8;
                   $166 = $input_image_unorm8;
                   u$144 = _clSetKernelArg($165|0,0,4,$166|0)|0;
                   $167 = $histogram_rgba_unorm8;
                   $168 = $partial_histogram_buffer;
                   u$145 = _clSetKernelArg($167|0,1,4,$168|0)|0;
                   $169 = $histogram_sum_partial_results_unorm8;
                   $170 = $partial_histogram_buffer;
                   u$146 = _clSetKernelArg($169|0,0,4,$170|0)|0;
                   $171 = $histogram_sum_partial_results_unorm8;
                   $172 = $num_groups;
                   u$147 = _clSetKernelArg($171|0,1,4,$172|0)|0;
                   $173 = $histogram_sum_partial_results_unorm8;
                   $174 = $histogram_buffer;
                   u$148 = _clSetKernelArg($173|0,2,4,$174|0)|0;
                   $175 = $3;
                   $176 = $histogram_rgba_unorm8;
                   $gep_int271 = $global_work_size;
                   $177 = $gep_int271;
                   $gep_int272 = $local_work_size;
                   $178 = $gep_int272;
                   $179 = _clEnqueueNDRangeKernel($175|0,$176|0,2,0,$177|0,$178|0,0,0,0)|0;
                   HEAP32[$err>>2] = $179;
                   $180 = HEAP32[$err>>2]|0;
                   $181 = ($180|0)!=(0);
                   
                   if ($181) {
                    $182 = HEAP32[$err>>2]|0;
                    
                    $gep_int273 = $vararg_buffer53;
                    $vararg_ptr55 = $gep_int273;
                    HEAP32[$vararg_ptr55>>2] = $182;
                    $expanded153 = 1;
                    $vararg_func56 = $expanded153;
                    $gep_int274 = 880;
                    $expanded154 = $gep_int274;
                    u$153 = _printf($expanded154|0,$vararg_buffer53|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                   $183 = $histogram_sum_partial_results_unorm8;
                   $184 = HEAP32[$4>>2]|0;
                   $185 = $workgroup_size;
                   u$157 = _clGetKernelWorkGroupInfo($183|0,$184|0,4528,4,$185|0,0)|0;
                   $186 = HEAP32[$workgroup_size>>2]|0;
                   $187 = ($186>>>0)<(256);
                   
                   if ($187) {
                    $188 = HEAP32[$workgroup_size>>2]|0;
                    
                    $gep_int275 = $vararg_buffer57;
                    $vararg_ptr59 = $gep_int275;
                    HEAP32[$vararg_ptr59>>2] = $188;
                    $expanded155 = 1;
                    $vararg_func60 = $expanded155;
                    $gep_int276 = 952;
                    $expanded156 = $gep_int276;
                    u$161 = _printf($expanded156|0,$vararg_buffer57|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                   $gep_int277 = $partial_global_work_size;
                   $189 = $gep_int277;
                   HEAP32[$189>>2] = 768;
                   $190 = HEAP32[$workgroup_size>>2]|0;
                   $191 = ($190>>>0)>(256);
                   
                   if ($191) {
                    
                    $193 = 256;
                   } else {
                    $192 = HEAP32[$workgroup_size>>2]|0;
                    
                    $193 = $192;
                   }
                   
                   $gep_int278 = $partial_local_work_size;
                   $194 = $gep_int278;
                   HEAP32[$194>>2] = $193;
                   $195 = $3;
                   $196 = $histogram_sum_partial_results_unorm8;
                   $gep_int279 = $partial_global_work_size;
                   $197 = $gep_int279;
                   $gep_int280 = $partial_local_work_size;
                   $198 = $gep_int280;
                   $199 = _clEnqueueNDRangeKernel($195|0,$196|0,1,0,$197|0,$198|0,0,0,0)|0;
                   HEAP32[$err>>2] = $199;
                   $200 = HEAP32[$err>>2]|0;
                   $201 = ($200|0)!=(0);
                   
                   if ($201) {
                    $202 = HEAP32[$err>>2]|0;
                    
                    $gep_int281 = $vararg_buffer61;
                    $vararg_ptr63 = $gep_int281;
                    HEAP32[$vararg_ptr63>>2] = $202;
                    $expanded157 = 1;
                    $vararg_func64 = $expanded157;
                    $gep_int282 = 1488;
                    $expanded158 = $gep_int282;
                    u$174 = _printf($expanded158|0,$vararg_buffer61|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                   $203 = $image_data_unorm8;
                   $204 = $image_width;
                   $205 = $image_height;
                   $206 = _generate_reference_histogram_results_unorm8($203,$204,$205)|0;
                   $207 = $206;
                   $ref_histogram_results = $207;
                   $208 = _malloc(3084)|0;
                   $209 = $208;
                   $gpu_histogram_results = $209;
                   $210 = $3;
                   $211 = HEAP32[$histogram_buffer>>2]|0;
                   $212 = $gpu_histogram_results;
                   $213 = $212;
                   $214 = _clEnqueueReadBuffer($210|0,$211|0,1,0,3072,$213|0,0,0,0)|0;
                   HEAP32[$err>>2] = $214;
                   $215 = HEAP32[$err>>2]|0;
                   $216 = ($215|0)!=(0);
                   
                   if ($216) {
                    $217 = HEAP32[$err>>2]|0;
                    
                    $gep_int283 = $vararg_buffer65;
                    $vararg_ptr67 = $gep_int283;
                    HEAP32[$vararg_ptr67>>2] = $217;
                    $expanded159 = 1;
                    $vararg_func68 = $expanded159;
                    $gep_int284 = 1144;
                    $expanded160 = $gep_int284;
                    u$184 = _printf($expanded160|0,$vararg_buffer65|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                   $218 = $gpu_histogram_results;
                   $219 = $ref_histogram_results;
                   $gep_int285 = 1184;
                   $expanded161 = $gep_int285;
                   u$188 = _verify_histogram_results($expanded161,$218,$219,768)|0;
                   $expanded162 = 2;
                   $220 = _emscripten_get_now()|0;
                   $221 = +($220|0);
                   $t1 = $221;
                   $i = 0;
                   
                   while(1) {
                    $222 = $i;
                    $expanded163 = 1200;
                    $223 = HEAP32[1200>>2]|0;
                    $224 = ($222|0)<($223|0);
                    
                    if (!($224)) {
                     label = 57;
                     break;
                    }
                    $225 = $3;
                    $226 = $histogram_rgba_unorm8;
                    $gep_int286 = $global_work_size;
                    $227 = $gep_int286;
                    $gep_int287 = $local_work_size;
                    $228 = $gep_int287;
                    $229 = _clEnqueueNDRangeKernel($225|0,$226|0,2,0,$227|0,$228|0,0,0,0)|0;
                    HEAP32[$err>>2] = $229;
                    $230 = HEAP32[$err>>2]|0;
                    $231 = ($230|0)!=(0);
                    
                    if ($231) {
                     label = 52;
                     break;
                    }
                    $233 = $3;
                    $234 = $histogram_sum_partial_results_unorm8;
                    $gep_int290 = $partial_global_work_size;
                    $235 = $gep_int290;
                    $gep_int291 = $partial_local_work_size;
                    $236 = $gep_int291;
                    $237 = _clEnqueueNDRangeKernel($233|0,$234|0,1,0,$235|0,$236|0,0,0,0)|0;
                    HEAP32[$err>>2] = $237;
                    $238 = HEAP32[$err>>2]|0;
                    $239 = ($238|0)!=(0);
                    
                    if ($239) {
                     label = 54;
                     break;
                    }
                    
                    $241 = $i;
                    $242 = (($241) + 1)|0;
                    $i = $242;
                    
                   }
                   if ((label|0) == 52) {
                    $232 = HEAP32[$err>>2]|0;
                    
                    $gep_int288 = $vararg_buffer69;
                    $vararg_ptr71 = $gep_int288;
                    HEAP32[$vararg_ptr71>>2] = $232;
                    $expanded164 = 1;
                    $vararg_func72 = $expanded164;
                    $gep_int289 = 880;
                    $expanded165 = $gep_int289;
                    u$197 = _printf($expanded165|0,$vararg_buffer69|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                   else if ((label|0) == 54) {
                    $240 = HEAP32[$err>>2]|0;
                    
                    $gep_int292 = $vararg_buffer73;
                    $vararg_ptr75 = $gep_int292;
                    HEAP32[$vararg_ptr75>>2] = $240;
                    $expanded166 = 1;
                    $vararg_func76 = $expanded166;
                    $gep_int293 = 1488;
                    $expanded167 = $gep_int293;
                    u$205 = _printf($expanded167|0,$vararg_buffer73|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                   else if ((label|0) == 57) {
                    $243 = $3;
                    u$212 = _clFinish($243|0)|0;
                    $expanded168 = 2;
                    $244 = _emscripten_get_now()|0;
                    $245 = +($244|0);
                    $t2 = $245;
                    $246 = $t2;
                    $247 = $t1;
                    $248 = $246 - $247;
                    $249 = 0.00100000004749745130538940429688 * $248;
                    $250 = $249;
                    $t = $250;
                    $251 = $t;
                    $252 = 1.000000e+03 * $251;
                    
                    $gep_int294 = $vararg_buffer77;
                    $vararg_ptr79 = $gep_int294;
                    $gep_int295 = 1288;
                    $expanded169 = $gep_int295;
                    HEAP32[$vararg_ptr79>>2] = $expanded169;
                    $gep_int296 = $vararg_buffer77;
                    $gep297 = (($gep_int296) + 4)|0;
                    $vararg_ptr80 = $gep297;
                    $gep_int298 = 1296;
                    $expanded170 = $gep_int298;
                    HEAP32[$vararg_ptr80>>2] = $expanded170;
                    $gep_int299 = $vararg_buffer77;
                    $gep300 = (($gep_int299) + 8)|0;
                    $vararg_ptr81 = $gep300;
                    HEAPF64[tempDoublePtr>>3]=$252;HEAP32[$vararg_ptr81>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr81+4>>2]=HEAP32[tempDoublePtr+4>>2];
                    $expanded171 = 1;
                    $vararg_func82 = $expanded171;
                    $gep_int301 = 1208;
                    $expanded172 = $gep_int301;
                    u$219 = _printf($expanded172|0,$vararg_buffer77|0)|0;
                    
                    $253 = $histogram_rgba_fp;
                    $254 = HEAP32[$4>>2]|0;
                    $255 = $workgroup_size;
                    u$221 = _clGetKernelWorkGroupInfo($253|0,$254|0,4528,4,$255|0,0)|0;
                    $256 = HEAP32[$workgroup_size>>2]|0;
                    $257 = ($256>>>0)<=(256);
                    
                    if ($257) {
                     $gep_int302 = $gsize1;
                     $258 = $gep_int302;
                     HEAP32[$258>>2] = 16;
                     $259 = HEAP32[$workgroup_size>>2]|0;
                     $260 = (($259>>>0) / 16)&-1;
                     $gep_int303 = $gsize1;
                     $gep304 = (($gep_int303) + 4)|0;
                     $261 = $gep304;
                     HEAP32[$261>>2] = $260;
                     
                    } else {
                     $262 = HEAP32[$workgroup_size>>2]|0;
                     $263 = ($262>>>0)<=(1024);
                     
                     if ($263) {
                      $264 = HEAP32[$workgroup_size>>2]|0;
                      $265 = (($264>>>0) / 16)&-1;
                      $gep_int305 = $gsize1;
                      $266 = $gep_int305;
                      HEAP32[$266>>2] = $265;
                      $gep_int306 = $gsize1;
                      $gep307 = (($gep_int306) + 4)|0;
                      $267 = $gep307;
                      HEAP32[$267>>2] = 16;
                      
                     } else {
                      $268 = HEAP32[$workgroup_size>>2]|0;
                      $269 = (($268>>>0) / 32)&-1;
                      $gep_int308 = $gsize1;
                      $270 = $gep_int308;
                      HEAP32[$270>>2] = $269;
                      $gep_int309 = $gsize1;
                      $gep310 = (($gep_int309) + 4)|0;
                      $271 = $gep310;
                      HEAP32[$271>>2] = 32;
                      
                     }
                     
                    }
                    $gep_int311 = $gsize1;
                    $272 = $gep_int311;
                    $273 = HEAP32[$272>>2]|0;
                    $gep_int312 = $local_work_size;
                    $274 = $gep_int312;
                    HEAP32[$274>>2] = $273;
                    $gep_int313 = $gsize1;
                    $gep314 = (($gep_int313) + 4)|0;
                    $275 = $gep314;
                    $276 = HEAP32[$275>>2]|0;
                    $gep_int315 = $local_work_size;
                    $gep316 = (($gep_int315) + 4)|0;
                    $277 = $gep316;
                    HEAP32[$277>>2] = $276;
                    $278 = $image_width;
                    $gep_int317 = $gsize1;
                    $279 = $gep_int317;
                    $280 = HEAP32[$279>>2]|0;
                    $281 = (($278) + ($280))|0;
                    $282 = (($281) - 1)|0;
                    $gep_int318 = $gsize1;
                    $283 = $gep_int318;
                    $284 = HEAP32[$283>>2]|0;
                    $285 = (($282>>>0) / ($284>>>0))&-1;
                    $gep_int319 = $global_work_size;
                    $286 = $gep_int319;
                    HEAP32[$286>>2] = $285;
                    $287 = $image_height;
                    $gep_int320 = $gsize1;
                    $gep321 = (($gep_int320) + 4)|0;
                    $288 = $gep321;
                    $289 = HEAP32[$288>>2]|0;
                    $290 = (($287) + ($289))|0;
                    $291 = (($290) - 1)|0;
                    $gep_int322 = $gsize1;
                    $gep323 = (($gep_int322) + 4)|0;
                    $292 = $gep323;
                    $293 = HEAP32[$292>>2]|0;
                    $294 = (($291>>>0) / ($293>>>0))&-1;
                    $gep_int324 = $global_work_size;
                    $gep325 = (($gep_int324) + 4)|0;
                    $295 = $gep325;
                    HEAP32[$295>>2] = $294;
                    $gep_int326 = $global_work_size;
                    $296 = $gep_int326;
                    $297 = HEAP32[$296>>2]|0;
                    $gep_int327 = $global_work_size;
                    $gep328 = (($gep_int327) + 4)|0;
                    $298 = $gep328;
                    $299 = HEAP32[$298>>2]|0;
                    $300 = Math_imul($297, $299)|0;
                    HEAP32[$num_groups>>2] = $300;
                    $gep_int329 = $gsize1;
                    $301 = $gep_int329;
                    $302 = HEAP32[$301>>2]|0;
                    $gep_int330 = $global_work_size;
                    $303 = $gep_int330;
                    $304 = HEAP32[$303>>2]|0;
                    $305 = Math_imul($304, $302)|0;
                    HEAP32[$303>>2] = $305;
                    $gep_int331 = $gsize1;
                    $gep332 = (($gep_int331) + 4)|0;
                    $306 = $gep332;
                    $307 = HEAP32[$306>>2]|0;
                    $gep_int333 = $global_work_size;
                    $gep334 = (($gep_int333) + 4)|0;
                    $308 = $gep334;
                    $309 = HEAP32[$308>>2]|0;
                    $310 = Math_imul($309, $307)|0;
                    HEAP32[$308>>2] = $310;
                    $311 = $2;
                    $312 = HEAP32[$num_groups>>2]|0;
                    $313 = ($312*257)|0;
                    $314 = ($313*3)|0;
                    $315 = $314<<2;
                    $316 = _clCreateBuffer($311|0,1,0,$315|0,0,$err|0)|0;
                    HEAP32[$partial_histogram_buffer>>2] = $316;
                    $317 = HEAP32[$partial_histogram_buffer>>2]|0;
                    $318 = ($317|0)!=(0);
                    
                    do {
                     if ($318) {
                      $319 = HEAP32[$err>>2]|0;
                      $320 = ($319|0)!=(0);
                      
                      if ($320) {
                       break;
                      }
                      $322 = $histogram_rgba_fp;
                      $323 = $input_image_fp32;
                      u$250 = _clSetKernelArg($322|0,0,4,$323|0)|0;
                      $324 = $histogram_rgba_fp;
                      $325 = $partial_histogram_buffer;
                      u$251 = _clSetKernelArg($324|0,1,4,$325|0)|0;
                      $326 = $histogram_sum_partial_results_fp;
                      $327 = $partial_histogram_buffer;
                      u$252 = _clSetKernelArg($326|0,0,4,$327|0)|0;
                      $328 = $histogram_sum_partial_results_fp;
                      $329 = $num_groups;
                      u$253 = _clSetKernelArg($328|0,1,4,$329|0)|0;
                      $330 = $histogram_sum_partial_results_fp;
                      $331 = $histogram_buffer;
                      u$254 = _clSetKernelArg($330|0,2,4,$331|0)|0;
                      $332 = $3;
                      $333 = $histogram_rgba_fp;
                      $gep_int337 = $global_work_size;
                      $334 = $gep_int337;
                      $gep_int338 = $local_work_size;
                      $335 = $gep_int338;
                      $336 = _clEnqueueNDRangeKernel($332|0,$333|0,2,0,$334|0,$335|0,0,0,0)|0;
                      HEAP32[$err>>2] = $336;
                      $337 = HEAP32[$err>>2]|0;
                      $338 = ($337|0)!=(0);
                      
                      if ($338) {
                       $339 = HEAP32[$err>>2]|0;
                       
                       $gep_int339 = $vararg_buffer87;
                       $vararg_ptr89 = $gep_int339;
                       HEAP32[$vararg_ptr89>>2] = $339;
                       $expanded175 = 1;
                       $vararg_func90 = $expanded175;
                       $gep_int340 = 1904;
                       $expanded176 = $gep_int340;
                       u$259 = _printf($expanded176|0,$vararg_buffer87|0)|0;
                       
                       $1 = 1;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                      $340 = $histogram_sum_partial_results_fp;
                      $341 = HEAP32[$4>>2]|0;
                      $342 = $workgroup_size;
                      u$263 = _clGetKernelWorkGroupInfo($340|0,$341|0,4528,4,$342|0,0)|0;
                      $343 = HEAP32[$workgroup_size>>2]|0;
                      $344 = ($343>>>0)<(256);
                      
                      if ($344) {
                       $345 = HEAP32[$workgroup_size>>2]|0;
                       
                       $gep_int341 = $vararg_buffer91;
                       $vararg_ptr93 = $gep_int341;
                       HEAP32[$vararg_ptr93>>2] = $345;
                       $expanded177 = 1;
                       $vararg_func94 = $expanded177;
                       $gep_int342 = 1384;
                       $expanded178 = $gep_int342;
                       u$267 = _printf($expanded178|0,$vararg_buffer91|0)|0;
                       
                       $1 = 1;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                      $gep_int343 = $partial_global_work_size;
                      $346 = $gep_int343;
                      HEAP32[$346>>2] = 768;
                      $347 = HEAP32[$workgroup_size>>2]|0;
                      $348 = ($347>>>0)>(256);
                      
                      if ($348) {
                       
                       $350 = 256;
                      } else {
                       $349 = HEAP32[$workgroup_size>>2]|0;
                       
                       $350 = $349;
                      }
                      
                      $gep_int344 = $partial_local_work_size;
                      $351 = $gep_int344;
                      HEAP32[$351>>2] = $350;
                      $352 = $3;
                      $353 = $histogram_sum_partial_results_fp;
                      $gep_int345 = $partial_global_work_size;
                      $354 = $gep_int345;
                      $gep_int346 = $partial_local_work_size;
                      $355 = $gep_int346;
                      $356 = _clEnqueueNDRangeKernel($352|0,$353|0,1,0,$354|0,$355|0,0,0,0)|0;
                      HEAP32[$err>>2] = $356;
                      $357 = HEAP32[$err>>2]|0;
                      $358 = ($357|0)!=(0);
                      
                      if ($358) {
                       $359 = HEAP32[$err>>2]|0;
                       
                       $gep_int347 = $vararg_buffer95;
                       $vararg_ptr97 = $gep_int347;
                       HEAP32[$vararg_ptr97>>2] = $359;
                       $expanded179 = 1;
                       $vararg_func98 = $expanded179;
                       $gep_int348 = 1488;
                       $expanded180 = $gep_int348;
                       u$280 = _printf($expanded180|0,$vararg_buffer95|0)|0;
                       
                       $1 = 1;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                      $360 = $image_data_fp32;
                      $361 = $image_width;
                      $362 = $image_height;
                      $363 = _generate_reference_histogram_results_fp32($360,$361,$362)|0;
                      $364 = $363;
                      $ref_histogram_results = $364;
                      $365 = $3;
                      $366 = HEAP32[$histogram_buffer>>2]|0;
                      $367 = $gpu_histogram_results;
                      $368 = $367;
                      $369 = _clEnqueueReadBuffer($365|0,$366|0,1,0,3084,$368|0,0,0,0)|0;
                      HEAP32[$err>>2] = $369;
                      $370 = HEAP32[$err>>2]|0;
                      $371 = ($370|0)!=(0);
                      
                      if ($371) {
                       $372 = HEAP32[$err>>2]|0;
                       
                       $gep_int349 = $vararg_buffer99;
                       $vararg_ptr101 = $gep_int349;
                       HEAP32[$vararg_ptr101>>2] = $372;
                       $expanded181 = 1;
                       $vararg_func102 = $expanded181;
                       $gep_int350 = 1144;
                       $expanded182 = $gep_int350;
                       u$289 = _printf($expanded182|0,$vararg_buffer99|0)|0;
                       
                       $1 = 1;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                      $373 = $gpu_histogram_results;
                      $374 = $ref_histogram_results;
                      $gep_int351 = 1576;
                      $expanded183 = $gep_int351;
                      u$293 = _verify_histogram_results($expanded183,$373,$374,771)|0;
                      $expanded184 = 2;
                      $375 = _emscripten_get_now()|0;
                      $376 = +($375|0);
                      $t1 = $376;
                      $i = 0;
                      
                      while(1) {
                       $377 = $i;
                       $expanded185 = 1200;
                       $378 = HEAP32[1200>>2]|0;
                       $379 = ($377|0)<($378|0);
                       
                       if (!($379)) {
                        label = 85;
                        break;
                       }
                       $380 = $3;
                       $381 = $histogram_rgba_fp;
                       $gep_int352 = $global_work_size;
                       $382 = $gep_int352;
                       $gep_int353 = $local_work_size;
                       $383 = $gep_int353;
                       $384 = _clEnqueueNDRangeKernel($380|0,$381|0,2,0,$382|0,$383|0,0,0,0)|0;
                       HEAP32[$err>>2] = $384;
                       $385 = HEAP32[$err>>2]|0;
                       $386 = ($385|0)!=(0);
                       
                       if ($386) {
                        label = 80;
                        break;
                       }
                       $388 = $3;
                       $389 = $histogram_sum_partial_results_fp;
                       $gep_int356 = $partial_global_work_size;
                       $390 = $gep_int356;
                       $gep_int357 = $partial_local_work_size;
                       $391 = $gep_int357;
                       $392 = _clEnqueueNDRangeKernel($388|0,$389|0,1,0,$390|0,$391|0,0,0,0)|0;
                       HEAP32[$err>>2] = $392;
                       $393 = HEAP32[$err>>2]|0;
                       $394 = ($393|0)!=(0);
                       
                       if ($394) {
                        label = 82;
                        break;
                       }
                       
                       $396 = $i;
                       $397 = (($396) + 1)|0;
                       $i = $397;
                       
                      }
                      if ((label|0) == 80) {
                       $387 = HEAP32[$err>>2]|0;
                       
                       $gep_int354 = $vararg_buffer103;
                       $vararg_ptr105 = $gep_int354;
                       HEAP32[$vararg_ptr105>>2] = $387;
                       $expanded186 = 1;
                       $vararg_func106 = $expanded186;
                       $gep_int355 = 1904;
                       $expanded187 = $gep_int355;
                       u$302 = _printf($expanded187|0,$vararg_buffer103|0)|0;
                       
                       $1 = 1;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                      else if ((label|0) == 82) {
                       $395 = HEAP32[$err>>2]|0;
                       
                       $gep_int358 = $vararg_buffer107;
                       $vararg_ptr109 = $gep_int358;
                       HEAP32[$vararg_ptr109>>2] = $395;
                       $expanded188 = 1;
                       $vararg_func110 = $expanded188;
                       $gep_int359 = 1488;
                       $expanded189 = $gep_int359;
                       u$310 = _printf($expanded189|0,$vararg_buffer107|0)|0;
                       
                       $1 = 1;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                      else if ((label|0) == 85) {
                       $398 = $3;
                       u$317 = _clFinish($398|0)|0;
                       $expanded190 = 2;
                       $399 = _emscripten_get_now()|0;
                       $400 = +($399|0);
                       $t2 = $400;
                       $401 = $t2;
                       $402 = $t1;
                       $403 = $401 - $402;
                       $404 = 0.00100000004749745130538940429688 * $403;
                       $405 = $404;
                       $t3 = $405;
                       $406 = $t3;
                       $407 = 1.000000e+03 * $406;
                       
                       $gep_int360 = $vararg_buffer111;
                       $vararg_ptr113 = $gep_int360;
                       $gep_int361 = 1288;
                       $expanded191 = $gep_int361;
                       HEAP32[$vararg_ptr113>>2] = $expanded191;
                       $gep_int362 = $vararg_buffer111;
                       $gep363 = (($gep_int362) + 4)|0;
                       $vararg_ptr114 = $gep363;
                       $gep_int364 = 1296;
                       $expanded192 = $gep_int364;
                       HEAP32[$vararg_ptr114>>2] = $expanded192;
                       $gep_int365 = $vararg_buffer111;
                       $gep366 = (($gep_int365) + 8)|0;
                       $vararg_ptr115 = $gep366;
                       HEAPF64[tempDoublePtr>>3]=$407;HEAP32[$vararg_ptr115>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr115+4>>2]=HEAP32[tempDoublePtr+4>>2];
                       $expanded193 = 1;
                       $vararg_func116 = $expanded193;
                       $gep_int367 = 1592;
                       $expanded194 = $gep_int367;
                       u$324 = _printf($expanded194|0,$vararg_buffer111|0)|0;
                       
                       $408 = $ref_histogram_results;
                       $409 = $408;
                       _free($409);
                       $410 = $gpu_histogram_results;
                       $411 = $410;
                       _free($411);
                       $412 = $image_data_unorm8;
                       _free($412);
                       $413 = $image_data_fp32;
                       _free($413);
                       $414 = $histogram_rgba_unorm8;
                       u$330 = _clReleaseKernel($414|0)|0;
                       $415 = $histogram_rgba_fp;
                       u$331 = _clReleaseKernel($415|0)|0;
                       $416 = $histogram_sum_partial_results_unorm8;
                       u$332 = _clReleaseKernel($416|0)|0;
                       $417 = $histogram_sum_partial_results_fp;
                       u$333 = _clReleaseKernel($417|0)|0;
                       $418 = $program;
                       u$334 = _clReleaseProgram($418|0)|0;
                       $419 = HEAP32[$partial_histogram_buffer>>2]|0;
                       u$335 = _clReleaseMemObject($419|0)|0;
                       $420 = HEAP32[$histogram_buffer>>2]|0;
                       u$336 = _clReleaseMemObject($420|0)|0;
                       $421 = HEAP32[$input_image_unorm8>>2]|0;
                       u$337 = _clReleaseMemObject($421|0)|0;
                       $422 = HEAP32[$input_image_fp32>>2]|0;
                       u$338 = _clReleaseMemObject($422|0)|0;
                       $1 = 0;
                       
                       $423 = $1;
                       STACKTOP = sp;return $423|0;
                      }
                     }
                    } while(0);
                    $321 = HEAP32[$err>>2]|0;
                    
                    $gep_int335 = $vararg_buffer83;
                    $vararg_ptr85 = $gep_int335;
                    HEAP32[$vararg_ptr85>>2] = $321;
                    $expanded173 = 1;
                    $vararg_func86 = $expanded173;
                    $gep_int336 = 848;
                    $expanded174 = $gep_int336;
                    u$246 = _printf($expanded174|0,$vararg_buffer83|0)|0;
                    
                    $1 = 1;
                    
                    $423 = $1;
                    STACKTOP = sp;return $423|0;
                   }
                  }
                 } while(0);
                 $164 = HEAP32[$err>>2]|0;
                 
                 $gep_int269 = $vararg_buffer49;
                 $vararg_ptr51 = $gep_int269;
                 HEAP32[$vararg_ptr51>>2] = $164;
                 $expanded151 = 1;
                 $vararg_func52 = $expanded151;
                 $gep_int270 = 848;
                 $expanded152 = $gep_int270;
                 u$140 = _printf($expanded152|0,$vararg_buffer49|0)|0;
                 
                 $1 = 1;
                 
                 $423 = $1;
                 STACKTOP = sp;return $423|0;
                }
               } while(0);
               $95 = HEAP32[$err>>2]|0;
               
               $gep_int234 = $vararg_buffer45;
               $vararg_ptr47 = $gep_int234;
               HEAP32[$vararg_ptr47>>2] = $95;
               $expanded149 = 1;
               $vararg_func48 = $expanded149;
               $gep_int235 = 1872;
               $expanded150 = $gep_int235;
               u$111 = _printf($expanded150|0,$vararg_buffer45|0)|0;
               
               $1 = 1;
               
               $423 = $1;
               STACKTOP = sp;return $423|0;
              }
             } while(0);
             $80 = HEAP32[$err>>2]|0;
             
             $gep_int229 = $vararg_buffer41;
             $vararg_ptr43 = $gep_int229;
             HEAP32[$vararg_ptr43>>2] = $80;
             $expanded147 = 1;
             $vararg_func44 = $expanded147;
             $gep_int230 = 1872;
             $expanded148 = $gep_int230;
             u$99 = _printf($expanded148|0,$vararg_buffer41|0)|0;
             
             $1 = 1;
             
             $423 = $1;
             STACKTOP = sp;return $423|0;
            }
           } while(0);
           $65 = HEAP32[$err>>2]|0;
           
           $gep_int225 = $vararg_buffer37;
           $vararg_ptr39 = $gep_int225;
           HEAP32[$vararg_ptr39>>2] = $65;
           $expanded145 = 1;
           $vararg_func40 = $expanded145;
           $gep_int226 = 848;
           $expanded146 = $gep_int226;
           u$87 = _printf($expanded146|0,$vararg_buffer37|0)|0;
           
           $1 = 1;
           
           $423 = $1;
           STACKTOP = sp;return $423|0;
          }
         } while(0);
         $58 = HEAP32[$err>>2]|0;
         
         $gep_int223 = $vararg_buffer33;
         $vararg_ptr35 = $gep_int223;
         HEAP32[$vararg_ptr35>>2] = $58;
         $expanded143 = 1;
         $vararg_func36 = $expanded143;
         $gep_int224 = 760;
         $expanded144 = $gep_int224;
         u$78 = _printf($expanded144|0,$vararg_buffer33|0)|0;
         
         $1 = 1;
         
         $423 = $1;
         STACKTOP = sp;return $423|0;
        }
       } while(0);
       $51 = HEAP32[$err>>2]|0;
       
       $gep_int220 = $vararg_buffer29;
       $vararg_ptr31 = $gep_int220;
       HEAP32[$vararg_ptr31>>2] = $51;
       $expanded140 = 1;
       $vararg_func32 = $expanded140;
       $gep_int221 = 624;
       $expanded141 = $gep_int221;
       u$69 = _printf($expanded141|0,$vararg_buffer29|0)|0;
       
       $1 = 1;
       
       $423 = $1;
       STACKTOP = sp;return $423|0;
      }
     } while(0);
     $44 = HEAP32[$err>>2]|0;
     
     $gep_int217 = $vararg_buffer25;
     $vararg_ptr27 = $gep_int217;
     HEAP32[$vararg_ptr27>>2] = $44;
     $expanded137 = 1;
     $vararg_func28 = $expanded137;
     $gep_int218 = 1792;
     $expanded138 = $gep_int218;
     u$60 = _printf($expanded138|0,$vararg_buffer25|0)|0;
     
     $1 = 1;
     
     $423 = $1;
     STACKTOP = sp;return $423|0;
    }
   } while(0);
   $37 = HEAP32[$err>>2]|0;
   
   $gep_int214 = $vararg_buffer21;
   $vararg_ptr23 = $gep_int214;
   HEAP32[$vararg_ptr23>>2] = $37;
   $expanded134 = 1;
   $vararg_func24 = $expanded134;
   $gep_int215 = 296;
   $expanded135 = $gep_int215;
   u$51 = _printf($expanded135|0,$vararg_buffer21|0)|0;
   
   $1 = 1;
   
   $423 = $1;
   STACKTOP = sp;return $423|0;
  }
 } while(0);
 $19 = HEAP32[$err>>2]|0;
 
 $gep_int205 = $vararg_buffer10;
 $vararg_ptr12 = $gep_int205;
 HEAP32[$vararg_ptr12>>2] = $19;
 $expanded127 = 1;
 $vararg_func13 = $expanded127;
 $gep_int206 = 176;
 $expanded128 = $gep_int206;
 u$28 = _printf($expanded128|0,$vararg_buffer10|0)|0;
 
 $1 = 1;
 
 $423 = $1;
 STACKTOP = sp;return $423|0;
}
function _main($argc,$argv) {
 $argc = $argc|0;
 $argv = $argv|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $context = 0, $device = 0, $err = 0, $expanded = 0, $expanded16 = 0, $expanded17 = 0, $expanded18 = 0, $expanded19 = 0, $expanded20 = 0, $expanded21 = 0, $expanded22 = 0;
 var $expanded23 = 0, $expanded24 = 0, $expanded25 = 0, $extensions_string = 0, $gep_int = 0, $gep_int26 = 0, $gep_int27 = 0, $gep_int28 = 0, $gep_int29 = 0, $gep_int30 = 0, $gep_int31 = 0, $gep_int32 = 0, $gep_int33 = 0, $gep_int34 = 0, $param_value_size_ret = 0, $queue = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer12 = 0, $vararg_buffer5 = 0;
 var $vararg_buffer8 = 0, $vararg_func = 0, $vararg_func11 = 0, $vararg_func15 = 0, $vararg_func4 = 0, $vararg_func7 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast13 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast6 = 0, $vararg_lifetime_bitcast9 = 0, $vararg_ptr = 0, $vararg_ptr10 = 0, $vararg_ptr14 = 0, $vararg_ptr3 = 0, label = 0, sp = 0, u$15 = 0, u$20 = 0, u$24 = 0;
 var u$34 = 0, u$43 = 0, u$53 = 0, u$54 = 0, u$7 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer12 = sp;
 $vararg_lifetime_bitcast13 = $vararg_buffer12;
 $vararg_buffer8 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast9 = $vararg_buffer8;
 $vararg_buffer5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast6 = $vararg_buffer5;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 $device = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 
 $param_value_size_ret = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $err = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $1 = 0;
 $2 = $argc;
 $3 = $argv;
 $4 = _clGetDeviceIDs(0,4,0,1,$device|0,0)|0;
 HEAP32[$err>>2] = $4;
 $5 = HEAP32[$err>>2]|0;
 $6 = ($5|0)!=(0);
 
 if ($6) {
  $7 = HEAP32[$err>>2]|0;
  
  $gep_int = $vararg_buffer;
  $vararg_ptr = $gep_int;
  HEAP32[$vararg_ptr>>2] = $7;
  $expanded = 1;
  $vararg_func = $expanded;
  $gep_int26 = 1976;
  $expanded16 = $gep_int26;
  u$7 = _printf($expanded16|0,$vararg_buffer|0)|0;
  
  $1 = 1;
  
  $49 = $1;
  STACKTOP = sp;return $49|0;
 }
 $8 = HEAP32[$device>>2]|0;
 $9 = _clGetDeviceInfo($8|0,4144,0,0,$param_value_size_ret|0)|0;
 HEAP32[$err>>2] = $9;
 $10 = HEAP32[$err>>2]|0;
 $11 = ($10|0)!=(0);
 
 if ($11) {
  $12 = HEAP32[$err>>2]|0;
  
  $gep_int27 = $vararg_buffer1;
  $vararg_ptr3 = $gep_int27;
  HEAP32[$vararg_ptr3>>2] = $12;
  $expanded17 = 1;
  $vararg_func4 = $expanded17;
  $gep_int28 = 2008;
  $expanded18 = $gep_int28;
  u$15 = _printf($expanded18|0,$vararg_buffer1|0)|0;
  
  $1 = 1;
  
  $49 = $1;
  STACKTOP = sp;return $49|0;
 }
 $13 = HEAP32[$param_value_size_ret>>2]|0;
 $14 = _malloc($13)|0;
 $extensions_string = $14;
 $15 = HEAP32[$device>>2]|0;
 $16 = HEAP32[$param_value_size_ret>>2]|0;
 $17 = $extensions_string;
 u$20 = _clGetDeviceInfo($15|0,4144,$16|0,$17|0,0)|0;
 $18 = $extensions_string;
 $gep_int29 = 2040;
 $expanded19 = $gep_int29;
 $19 = _strstr($18|0,$expanded19|0)|0;
 $20 = ($19|0)!=(0);
 
 if (!($20)) {
  $21 = $extensions_string;
  _free($21);
  
  $expanded20 = 1;
  $vararg_func7 = $expanded20;
  $gep_int30 = 2072;
  $expanded21 = $gep_int30;
  u$24 = _printf($expanded21|0,$vararg_buffer5|0)|0;
  
  $1 = 1;
  
  $49 = $1;
  STACKTOP = sp;return $49|0;
 }
 $22 = $extensions_string;
 _free($22);
 $23 = _clCreateContext(0,1,$device|0,0,0,$err|0)|0;
 $context = $23;
 $24 = $context;
 $25 = ($24|0)!=(0);
 
 do {
  if ($25) {
   $26 = HEAP32[$err>>2]|0;
   $27 = ($26|0)!=(0);
   
   if ($27) {
    break;
   }
   $29 = $context;
   $30 = HEAP32[$device>>2]|0;
   $31 = _clCreateCommandQueue($29|0,$30|0,0,0,$err|0)|0;
   $queue = $31;
   $32 = $queue;
   $33 = ($32|0)!=(0);
   
   do {
    if ($33) {
     $34 = HEAP32[$err>>2]|0;
     $35 = ($34|0)!=(0);
     
     if ($35) {
      break;
     }
     $37 = $context;
     $38 = $queue;
     $39 = HEAP32[$device>>2]|0;
     $40 = _test_histogram_with_buffers($37,$38,$39)|0;
     $41 = ($40|0)==(1);
     
     if ($41) {
      $1 = 1;
      
      $49 = $1;
      STACKTOP = sp;return $49|0;
     }
     $42 = $context;
     $43 = $queue;
     $44 = HEAP32[$device>>2]|0;
     $45 = _test_histogram_with_images($42,$43,$44)|0;
     $46 = ($45|0)==(1);
     
     if ($46) {
      $1 = 1;
      
      $49 = $1;
      STACKTOP = sp;return $49|0;
     } else {
      $47 = $queue;
      u$53 = _clReleaseCommandQueue($47|0)|0;
      $48 = $context;
      u$54 = _clReleaseContext($48|0)|0;
      $1 = 0;
      
      $49 = $1;
      STACKTOP = sp;return $49|0;
     }
    }
   } while(0);
   $36 = HEAP32[$err>>2]|0;
   
   $gep_int33 = $vararg_buffer12;
   $vararg_ptr14 = $gep_int33;
   HEAP32[$vararg_ptr14>>2] = $36;
   $expanded24 = 1;
   $vararg_func15 = $expanded24;
   $gep_int34 = 2200;
   $expanded25 = $gep_int34;
   u$43 = _printf($expanded25|0,$vararg_buffer12|0)|0;
   
   $1 = 1;
   
   $49 = $1;
   STACKTOP = sp;return $49|0;
  }
 } while(0);
 $28 = HEAP32[$err>>2]|0;
 
 $gep_int31 = $vararg_buffer8;
 $vararg_ptr10 = $gep_int31;
 HEAP32[$vararg_ptr10>>2] = $28;
 $expanded22 = 1;
 $vararg_func11 = $expanded22;
 $gep_int32 = 2168;
 $expanded23 = $gep_int32;
 u$34 = _printf($expanded23|0,$vararg_buffer8|0)|0;
 
 $1 = 1;
 
 $49 = $1;
 STACKTOP = sp;return $49|0;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$c$i$i = 0, $$c7$i$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i24$i = 0, $$pre$i27 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i25$iZ2D = 0, $$pre$phi$i28Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi62$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre61$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0;
 var $$sum$i$i = 0, $$sum$i$i$i = 0, $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2536 = 0, $$sum$i34 = 0, $$sum$i37 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i26 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum107$i = 0, $$sum108$i = 0;
 var $$sum109$i = 0, $$sum11 = 0, $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$pre$i$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum12$i26$i = 0, $$sum120$i = 0, $$sum13$i = 0;
 var $$sum13$i$i = 0, $$sum1314 = 0, $$sum14$i = 0, $$sum14$i$i = 0, $$sum15$i$i = 0, $$sum15$pre$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum19$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0;
 var $$sum2$pre$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0, $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$i$i = 0, $$sum27$pre$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i29 = 0, $$sum30$i$i = 0, $$sum31$i$i = 0, $$sum3233$i$i = 0, $$sum34$i$i = 0, $$sum3637$i$i = 0, $$sum3940$i$i = 0, $$sum4 = 0;
 var $$sum4$i = 0, $$sum4$i30 = 0, $$sum41$i$i = 0, $$sum44$i$i = 0, $$sum45$i$i = 0, $$sum46$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum6$i = 0, $$sum67 = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$sum9$pre = 0, $$tsize$1$i = 0, $$v$0$i = 0, $1 = 0, $10 = 0, $100 = 0;
 var $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0;
 var $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0;
 var $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0;
 var $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0;
 var $1073 = 0, $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $1080 = 0, $1081 = 0, $1082 = 0, $1083 = 0, $1084 = 0, $1085 = 0, $1086 = 0, $1087 = 0, $1088 = 0, $1089 = 0, $109 = 0, $1090 = 0;
 var $1091 = 0, $1092 = 0, $1093 = 0, $1094 = 0, $1095 = 0, $1096 = 0, $1097 = 0, $1098 = 0, $1099 = 0, $11 = 0, $110 = 0, $1100 = 0, $1101 = 0, $1102 = 0, $1103 = 0, $1104 = 0, $1105 = 0, $1106 = 0, $1107 = 0, $1108 = 0;
 var $1109 = 0, $111 = 0, $1110 = 0, $1111 = 0, $1112 = 0, $1113 = 0, $1114 = 0, $1115 = 0, $1115$phi = 0, $1116 = 0, $1117 = 0, $1118 = 0, $1119 = 0, $112 = 0, $1120 = 0, $1121 = 0, $1122 = 0, $1123 = 0, $1124 = 0, $1125 = 0;
 var $1126 = 0, $1127 = 0, $1128 = 0, $1129 = 0, $113 = 0, $1130 = 0, $1131 = 0, $1132 = 0, $1133 = 0, $1134 = 0, $1135 = 0, $1136 = 0, $1137 = 0, $1138 = 0, $1139 = 0, $114 = 0, $1140 = 0, $1141 = 0, $1142 = 0, $1143 = 0;
 var $1144 = 0, $1145 = 0, $1146 = 0, $1147 = 0, $1148 = 0, $1149 = 0, $115 = 0, $1150 = 0, $1151 = 0, $1152 = 0, $1153 = 0, $1154 = 0, $1155 = 0, $1156 = 0, $1157 = 0, $1158 = 0, $1159 = 0, $116 = 0, $1160 = 0, $1161 = 0;
 var $1162 = 0, $1163 = 0, $1164 = 0, $1165 = 0, $1166 = 0, $1167 = 0, $1168 = 0, $1169 = 0, $117 = 0, $1170 = 0, $1171 = 0, $1172 = 0, $1173 = 0, $1174 = 0, $1175 = 0, $1176 = 0, $1177 = 0, $1178 = 0, $1179 = 0, $118 = 0;
 var $1180 = 0, $1181 = 0, $1182 = 0, $1183 = 0, $1184 = 0, $1185 = 0, $1186 = 0, $1187 = 0, $1188 = 0, $1189 = 0, $119 = 0, $1190 = 0, $1191 = 0, $1192 = 0, $1193 = 0, $1194 = 0, $1195 = 0, $1196 = 0, $1197 = 0, $1198 = 0;
 var $1199 = 0, $12 = 0, $120 = 0, $1200 = 0, $1201 = 0, $1202 = 0, $1203 = 0, $1204 = 0, $1205 = 0, $1206 = 0, $1207 = 0, $1208 = 0, $1209 = 0, $121 = 0, $1210 = 0, $1211 = 0, $1212 = 0, $1213 = 0, $1214 = 0, $1215 = 0;
 var $1216 = 0, $1217 = 0, $1218 = 0, $1219 = 0, $122 = 0, $1220 = 0, $1221 = 0, $1222 = 0, $1223 = 0, $1224 = 0, $1225 = 0, $1226 = 0, $1227 = 0, $1228 = 0, $1229 = 0, $123 = 0, $1230 = 0, $1231 = 0, $1232 = 0, $1233 = 0;
 var $1234 = 0, $1235 = 0, $1236 = 0, $1237 = 0, $1238 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0;
 var $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0;
 var $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0;
 var $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0;
 var $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0;
 var $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0;
 var $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0;
 var $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0;
 var $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0;
 var $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0;
 var $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0;
 var $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0;
 var $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0;
 var $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0;
 var $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0;
 var $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0;
 var $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0;
 var $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0;
 var $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0;
 var $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0;
 var $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0;
 var $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0;
 var $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0;
 var $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0;
 var $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0;
 var $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0;
 var $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0;
 var $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0;
 var $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0;
 var $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0;
 var $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0;
 var $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0;
 var $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0;
 var $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0;
 var $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0;
 var $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0;
 var $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0;
 var $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0;
 var $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0;
 var $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0;
 var $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0;
 var $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0;
 var $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0;
 var $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0;
 var $F5$0$i = 0, $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$027$i = 0, $K2$015$i$i = 0, $K8$056$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$phi = 0, $R$0$i$phi = 0, $R$0$i20 = 0, $R$0$i20$phi = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i22 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$phi = 0;
 var $RP$0$i$phi = 0, $RP$0$i19 = 0, $RP$0$i19$phi = 0, $T$0$c$i$i = 0, $T$0$c8$i$i = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$014$i$i = 0, $T$014$i$i$phi = 0, $T$026$i = 0, $T$026$i$phi = 0, $T$055$i$i = 0, $T$055$i$i$phi = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i23 = 0, $expanded = 0, $expanded1 = 0;
 var $expanded10 = 0, $expanded100 = 0, $expanded101 = 0, $expanded102 = 0, $expanded103 = 0, $expanded104 = 0, $expanded105 = 0, $expanded106 = 0, $expanded107 = 0, $expanded108 = 0, $expanded109 = 0, $expanded11 = 0, $expanded110 = 0, $expanded111 = 0, $expanded112 = 0, $expanded113 = 0, $expanded114 = 0, $expanded115 = 0, $expanded116 = 0, $expanded117 = 0;
 var $expanded118 = 0, $expanded119 = 0, $expanded12 = 0, $expanded120 = 0, $expanded121 = 0, $expanded122 = 0, $expanded123 = 0, $expanded124 = 0, $expanded125 = 0, $expanded126 = 0, $expanded127 = 0, $expanded128 = 0, $expanded129 = 0, $expanded13 = 0, $expanded130 = 0, $expanded131 = 0, $expanded132 = 0, $expanded133 = 0, $expanded134 = 0, $expanded135 = 0;
 var $expanded136 = 0, $expanded137 = 0, $expanded138 = 0, $expanded139 = 0, $expanded14 = 0, $expanded140 = 0, $expanded141 = 0, $expanded142 = 0, $expanded143 = 0, $expanded144 = 0, $expanded145 = 0, $expanded146 = 0, $expanded147 = 0, $expanded148 = 0, $expanded149 = 0, $expanded15 = 0, $expanded150 = 0, $expanded151 = 0, $expanded152 = 0, $expanded153 = 0;
 var $expanded154 = 0, $expanded155 = 0, $expanded156 = 0, $expanded157 = 0, $expanded158 = 0, $expanded159 = 0, $expanded16 = 0, $expanded160 = 0, $expanded161 = 0, $expanded162 = 0, $expanded163 = 0, $expanded164 = 0, $expanded165 = 0, $expanded166 = 0, $expanded167 = 0, $expanded168 = 0, $expanded169 = 0, $expanded17 = 0, $expanded170 = 0, $expanded171 = 0;
 var $expanded172 = 0, $expanded173 = 0, $expanded174 = 0, $expanded175 = 0, $expanded176 = 0, $expanded177 = 0, $expanded178 = 0, $expanded179 = 0, $expanded18 = 0, $expanded180 = 0, $expanded181 = 0, $expanded182 = 0, $expanded183 = 0, $expanded184 = 0, $expanded185 = 0, $expanded186 = 0, $expanded187 = 0, $expanded188 = 0, $expanded189 = 0, $expanded19 = 0;
 var $expanded190 = 0, $expanded191 = 0, $expanded192 = 0, $expanded193 = 0, $expanded194 = 0, $expanded195 = 0, $expanded196 = 0, $expanded197 = 0, $expanded198 = 0, $expanded199 = 0, $expanded2 = 0, $expanded20 = 0, $expanded200 = 0, $expanded201 = 0, $expanded202 = 0, $expanded203 = 0, $expanded204 = 0, $expanded205 = 0, $expanded206 = 0, $expanded207 = 0;
 var $expanded208 = 0, $expanded209 = 0, $expanded21 = 0, $expanded210 = 0, $expanded211 = 0, $expanded212 = 0, $expanded213 = 0, $expanded214 = 0, $expanded215 = 0, $expanded216 = 0, $expanded217 = 0, $expanded218 = 0, $expanded219 = 0, $expanded22 = 0, $expanded220 = 0, $expanded221 = 0, $expanded222 = 0, $expanded223 = 0, $expanded224 = 0, $expanded225 = 0;
 var $expanded226 = 0, $expanded227 = 0, $expanded228 = 0, $expanded229 = 0, $expanded23 = 0, $expanded230 = 0, $expanded231 = 0, $expanded232 = 0, $expanded233 = 0, $expanded234 = 0, $expanded235 = 0, $expanded236 = 0, $expanded237 = 0, $expanded238 = 0, $expanded239 = 0, $expanded24 = 0, $expanded240 = 0, $expanded241 = 0, $expanded242 = 0, $expanded243 = 0;
 var $expanded244 = 0, $expanded245 = 0, $expanded246 = 0, $expanded247 = 0, $expanded248 = 0, $expanded249 = 0, $expanded25 = 0, $expanded250 = 0, $expanded251 = 0, $expanded252 = 0, $expanded253 = 0, $expanded254 = 0, $expanded255 = 0, $expanded256 = 0, $expanded257 = 0, $expanded258 = 0, $expanded259 = 0, $expanded26 = 0, $expanded260 = 0, $expanded261 = 0;
 var $expanded262 = 0, $expanded263 = 0, $expanded264 = 0, $expanded265 = 0, $expanded266 = 0, $expanded267 = 0, $expanded268 = 0, $expanded269 = 0, $expanded27 = 0, $expanded270 = 0, $expanded271 = 0, $expanded272 = 0, $expanded273 = 0, $expanded274 = 0, $expanded275 = 0, $expanded276 = 0, $expanded277 = 0, $expanded278 = 0, $expanded279 = 0, $expanded28 = 0;
 var $expanded280 = 0, $expanded281 = 0, $expanded282 = 0, $expanded283 = 0, $expanded284 = 0, $expanded285 = 0, $expanded286 = 0, $expanded287 = 0, $expanded288 = 0, $expanded289 = 0, $expanded29 = 0, $expanded290 = 0, $expanded291 = 0, $expanded292 = 0, $expanded293 = 0, $expanded294 = 0, $expanded295 = 0, $expanded296 = 0, $expanded297 = 0, $expanded298 = 0;
 var $expanded299 = 0, $expanded3 = 0, $expanded30 = 0, $expanded300 = 0, $expanded301 = 0, $expanded302 = 0, $expanded303 = 0, $expanded304 = 0, $expanded305 = 0, $expanded306 = 0, $expanded307 = 0, $expanded308 = 0, $expanded309 = 0, $expanded31 = 0, $expanded310 = 0, $expanded311 = 0, $expanded312 = 0, $expanded313 = 0, $expanded314 = 0, $expanded315 = 0;
 var $expanded316 = 0, $expanded317 = 0, $expanded318 = 0, $expanded319 = 0, $expanded32 = 0, $expanded320 = 0, $expanded321 = 0, $expanded322 = 0, $expanded323 = 0, $expanded324 = 0, $expanded325 = 0, $expanded326 = 0, $expanded327 = 0, $expanded328 = 0, $expanded329 = 0, $expanded33 = 0, $expanded330 = 0, $expanded331 = 0, $expanded332 = 0, $expanded333 = 0;
 var $expanded334 = 0, $expanded335 = 0, $expanded336 = 0, $expanded337 = 0, $expanded338 = 0, $expanded339 = 0, $expanded34 = 0, $expanded340 = 0, $expanded35 = 0, $expanded36 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded4 = 0, $expanded40 = 0, $expanded41 = 0, $expanded42 = 0, $expanded43 = 0, $expanded44 = 0, $expanded45 = 0;
 var $expanded46 = 0, $expanded47 = 0, $expanded48 = 0, $expanded49 = 0, $expanded5 = 0, $expanded50 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded54 = 0, $expanded55 = 0, $expanded56 = 0, $expanded57 = 0, $expanded58 = 0, $expanded59 = 0, $expanded6 = 0, $expanded60 = 0, $expanded61 = 0, $expanded62 = 0, $expanded63 = 0;
 var $expanded64 = 0, $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded68 = 0, $expanded69 = 0, $expanded7 = 0, $expanded70 = 0, $expanded71 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded75 = 0, $expanded76 = 0, $expanded77 = 0, $expanded78 = 0, $expanded79 = 0, $expanded8 = 0, $expanded80 = 0, $expanded81 = 0;
 var $expanded82 = 0, $expanded83 = 0, $expanded84 = 0, $expanded85 = 0, $expanded86 = 0, $expanded87 = 0, $expanded88 = 0, $expanded89 = 0, $expanded9 = 0, $expanded90 = 0, $expanded91 = 0, $expanded92 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0, $expanded96 = 0, $expanded97 = 0, $expanded98 = 0, $expanded99 = 0, $gep = 0;
 var $gep1000 = 0, $gep1002 = 0, $gep1004 = 0, $gep1006 = 0, $gep1008 = 0, $gep1012 = 0, $gep1014 = 0, $gep1016 = 0, $gep1018 = 0, $gep1020 = 0, $gep1022 = 0, $gep1024 = 0, $gep1026 = 0, $gep1028 = 0, $gep1030 = 0, $gep1032 = 0, $gep1034 = 0, $gep1036 = 0, $gep1038 = 0, $gep1040 = 0;
 var $gep1042 = 0, $gep1044 = 0, $gep1046 = 0, $gep1048 = 0, $gep1050 = 0, $gep1052 = 0, $gep1054 = 0, $gep1056 = 0, $gep1058 = 0, $gep1060 = 0, $gep1062 = 0, $gep1064 = 0, $gep1066 = 0, $gep1068 = 0, $gep1070 = 0, $gep1072 = 0, $gep1074 = 0, $gep1076 = 0, $gep1078 = 0, $gep1081 = 0;
 var $gep1083 = 0, $gep1085 = 0, $gep1087 = 0, $gep1089 = 0, $gep1091 = 0, $gep1093 = 0, $gep1095 = 0, $gep1097 = 0, $gep1099 = 0, $gep1101 = 0, $gep1103 = 0, $gep1105 = 0, $gep1107 = 0, $gep1109 = 0, $gep1111 = 0, $gep1113 = 0, $gep1115 = 0, $gep1117 = 0, $gep1119 = 0, $gep1121 = 0;
 var $gep1123 = 0, $gep1125 = 0, $gep1127 = 0, $gep1129 = 0, $gep1131 = 0, $gep1133 = 0, $gep1135 = 0, $gep1137 = 0, $gep1139 = 0, $gep1143 = 0, $gep1145 = 0, $gep1147 = 0, $gep1149 = 0, $gep1151 = 0, $gep1153 = 0, $gep1155 = 0, $gep1157 = 0, $gep1159 = 0, $gep1161 = 0, $gep1163 = 0;
 var $gep1165 = 0, $gep1167 = 0, $gep1169 = 0, $gep1171 = 0, $gep1173 = 0, $gep1175 = 0, $gep1177 = 0, $gep1179 = 0, $gep1181 = 0, $gep1183 = 0, $gep1185 = 0, $gep1187 = 0, $gep1189 = 0, $gep1191 = 0, $gep1193 = 0, $gep1195 = 0, $gep1197 = 0, $gep1199 = 0, $gep1201 = 0, $gep1203 = 0;
 var $gep1205 = 0, $gep1207 = 0, $gep1209 = 0, $gep1211 = 0, $gep1213 = 0, $gep1215 = 0, $gep1217 = 0, $gep1219 = 0, $gep1221 = 0, $gep342 = 0, $gep344 = 0, $gep346 = 0, $gep348 = 0, $gep351 = 0, $gep353 = 0, $gep355 = 0, $gep357 = 0, $gep359 = 0, $gep361 = 0, $gep363 = 0;
 var $gep365 = 0, $gep367 = 0, $gep369 = 0, $gep372 = 0, $gep374 = 0, $gep376 = 0, $gep378 = 0, $gep380 = 0, $gep382 = 0, $gep384 = 0, $gep386 = 0, $gep388 = 0, $gep390 = 0, $gep394 = 0, $gep396 = 0, $gep398 = 0, $gep400 = 0, $gep402 = 0, $gep404 = 0, $gep406 = 0;
 var $gep408 = 0, $gep410 = 0, $gep412 = 0, $gep414 = 0, $gep416 = 0, $gep418 = 0, $gep420 = 0, $gep422 = 0, $gep424 = 0, $gep426 = 0, $gep428 = 0, $gep430 = 0, $gep432 = 0, $gep434 = 0, $gep436 = 0, $gep438 = 0, $gep440 = 0, $gep442 = 0, $gep444 = 0, $gep446 = 0;
 var $gep448 = 0, $gep450 = 0, $gep452 = 0, $gep454 = 0, $gep456 = 0, $gep458 = 0, $gep460 = 0, $gep462 = 0, $gep464 = 0, $gep466 = 0, $gep468 = 0, $gep470 = 0, $gep472 = 0, $gep474 = 0, $gep476 = 0, $gep478 = 0, $gep480 = 0, $gep482 = 0, $gep484 = 0, $gep486 = 0;
 var $gep488 = 0, $gep490 = 0, $gep492 = 0, $gep494 = 0, $gep496 = 0, $gep498 = 0, $gep500 = 0, $gep502 = 0, $gep506 = 0, $gep508 = 0, $gep510 = 0, $gep512 = 0, $gep514 = 0, $gep516 = 0, $gep518 = 0, $gep520 = 0, $gep522 = 0, $gep524 = 0, $gep526 = 0, $gep528 = 0;
 var $gep530 = 0, $gep532 = 0, $gep534 = 0, $gep536 = 0, $gep538 = 0, $gep540 = 0, $gep542 = 0, $gep544 = 0, $gep546 = 0, $gep548 = 0, $gep550 = 0, $gep552 = 0, $gep554 = 0, $gep556 = 0, $gep558 = 0, $gep560 = 0, $gep562 = 0, $gep564 = 0, $gep566 = 0, $gep568 = 0;
 var $gep570 = 0, $gep572 = 0, $gep574 = 0, $gep576 = 0, $gep578 = 0, $gep580 = 0, $gep582 = 0, $gep584 = 0, $gep586 = 0, $gep588 = 0, $gep590 = 0, $gep592 = 0, $gep594 = 0, $gep596 = 0, $gep598 = 0, $gep600 = 0, $gep602 = 0, $gep604 = 0, $gep606 = 0, $gep608 = 0;
 var $gep610 = 0, $gep612 = 0, $gep614 = 0, $gep616 = 0, $gep618 = 0, $gep620 = 0, $gep622 = 0, $gep624 = 0, $gep628 = 0, $gep630 = 0, $gep632 = 0, $gep634 = 0, $gep636 = 0, $gep638 = 0, $gep640 = 0, $gep642 = 0, $gep644 = 0, $gep646 = 0, $gep648 = 0, $gep650 = 0;
 var $gep652 = 0, $gep654 = 0, $gep656 = 0, $gep658 = 0, $gep660 = 0, $gep662 = 0, $gep664 = 0, $gep666 = 0, $gep668 = 0, $gep670 = 0, $gep672 = 0, $gep674 = 0, $gep676 = 0, $gep678 = 0, $gep680 = 0, $gep682 = 0, $gep684 = 0, $gep686 = 0, $gep688 = 0, $gep690 = 0;
 var $gep692 = 0, $gep694 = 0, $gep696 = 0, $gep698 = 0, $gep700 = 0, $gep702 = 0, $gep704 = 0, $gep706 = 0, $gep708 = 0, $gep710 = 0, $gep712 = 0, $gep714 = 0, $gep716 = 0, $gep718 = 0, $gep720 = 0, $gep722 = 0, $gep724 = 0, $gep726 = 0, $gep728 = 0, $gep730 = 0;
 var $gep732 = 0, $gep734 = 0, $gep737 = 0, $gep739 = 0, $gep741 = 0, $gep743 = 0, $gep745 = 0, $gep747 = 0, $gep750 = 0, $gep752 = 0, $gep754 = 0, $gep756 = 0, $gep758 = 0, $gep760 = 0, $gep763 = 0, $gep765 = 0, $gep767 = 0, $gep769 = 0, $gep771 = 0, $gep773 = 0;
 var $gep775 = 0, $gep777 = 0, $gep779 = 0, $gep781 = 0, $gep783 = 0, $gep785 = 0, $gep787 = 0, $gep789 = 0, $gep791 = 0, $gep793 = 0, $gep795 = 0, $gep797 = 0, $gep799 = 0, $gep801 = 0, $gep803 = 0, $gep805 = 0, $gep808 = 0, $gep810 = 0, $gep812 = 0, $gep814 = 0;
 var $gep816 = 0, $gep818 = 0, $gep820 = 0, $gep822 = 0, $gep824 = 0, $gep826 = 0, $gep828 = 0, $gep830 = 0, $gep832 = 0, $gep834 = 0, $gep836 = 0, $gep838 = 0, $gep841 = 0, $gep843 = 0, $gep845 = 0, $gep847 = 0, $gep849 = 0, $gep851 = 0, $gep853 = 0, $gep855 = 0;
 var $gep857 = 0, $gep859 = 0, $gep861 = 0, $gep863 = 0, $gep865 = 0, $gep867 = 0, $gep869 = 0, $gep871 = 0, $gep873 = 0, $gep876 = 0, $gep878 = 0, $gep880 = 0, $gep882 = 0, $gep884 = 0, $gep886 = 0, $gep888 = 0, $gep890 = 0, $gep892 = 0, $gep894 = 0, $gep896 = 0;
 var $gep898 = 0, $gep900 = 0, $gep902 = 0, $gep904 = 0, $gep906 = 0, $gep908 = 0, $gep910 = 0, $gep912 = 0, $gep914 = 0, $gep916 = 0, $gep918 = 0, $gep920 = 0, $gep922 = 0, $gep924 = 0, $gep926 = 0, $gep928 = 0, $gep932 = 0, $gep934 = 0, $gep936 = 0, $gep938 = 0;
 var $gep940 = 0, $gep942 = 0, $gep944 = 0, $gep946 = 0, $gep948 = 0, $gep950 = 0, $gep952 = 0, $gep954 = 0, $gep956 = 0, $gep958 = 0, $gep960 = 0, $gep962 = 0, $gep964 = 0, $gep966 = 0, $gep968 = 0, $gep970 = 0, $gep972 = 0, $gep974 = 0, $gep976 = 0, $gep978 = 0;
 var $gep980 = 0, $gep982 = 0, $gep984 = 0, $gep986 = 0, $gep988 = 0, $gep990 = 0, $gep992 = 0, $gep994 = 0, $gep996 = 0, $gep998 = 0, $gep_array = 0, $gep_array1007 = 0, $gep_array1013 = 0, $gep_array1017 = 0, $gep_array1029 = 0, $gep_array1053 = 0, $gep_array1138 = 0, $gep_array1144 = 0, $gep_array1148 = 0, $gep_array1160 = 0;
 var $gep_array1184 = 0, $gep_array345 = 0, $gep_array362 = 0, $gep_array366 = 0, $gep_array389 = 0, $gep_array395 = 0, $gep_array399 = 0, $gep_array417 = 0, $gep_array453 = 0, $gep_array501 = 0, $gep_array507 = 0, $gep_array511 = 0, $gep_array531 = 0, $gep_array539 = 0, $gep_array543 = 0, $gep_array579 = 0, $gep_array623 = 0, $gep_array629 = 0, $gep_array633 = 0, $gep_array645 = 0;
 var $gep_array669 = 0, $gep_array813 = 0, $gep_array817 = 0, $gep_array821 = 0, $gep_array923 = 0, $gep_array965 = 0, $gep_int = 0, $gep_int1001 = 0, $gep_int1003 = 0, $gep_int1005 = 0, $gep_int1009 = 0, $gep_int1010 = 0, $gep_int1011 = 0, $gep_int1015 = 0, $gep_int1019 = 0, $gep_int1021 = 0, $gep_int1023 = 0, $gep_int1025 = 0, $gep_int1027 = 0, $gep_int1031 = 0;
 var $gep_int1033 = 0, $gep_int1035 = 0, $gep_int1037 = 0, $gep_int1039 = 0, $gep_int1041 = 0, $gep_int1043 = 0, $gep_int1045 = 0, $gep_int1047 = 0, $gep_int1049 = 0, $gep_int1051 = 0, $gep_int1055 = 0, $gep_int1057 = 0, $gep_int1059 = 0, $gep_int1061 = 0, $gep_int1063 = 0, $gep_int1065 = 0, $gep_int1067 = 0, $gep_int1069 = 0, $gep_int1071 = 0, $gep_int1073 = 0;
 var $gep_int1075 = 0, $gep_int1077 = 0, $gep_int1079 = 0, $gep_int1080 = 0, $gep_int1082 = 0, $gep_int1084 = 0, $gep_int1086 = 0, $gep_int1088 = 0, $gep_int1090 = 0, $gep_int1092 = 0, $gep_int1094 = 0, $gep_int1096 = 0, $gep_int1098 = 0, $gep_int1100 = 0, $gep_int1102 = 0, $gep_int1104 = 0, $gep_int1106 = 0, $gep_int1108 = 0, $gep_int1110 = 0, $gep_int1112 = 0;
 var $gep_int1114 = 0, $gep_int1116 = 0, $gep_int1118 = 0, $gep_int1120 = 0, $gep_int1122 = 0, $gep_int1124 = 0, $gep_int1126 = 0, $gep_int1128 = 0, $gep_int1130 = 0, $gep_int1132 = 0, $gep_int1134 = 0, $gep_int1136 = 0, $gep_int1140 = 0, $gep_int1141 = 0, $gep_int1142 = 0, $gep_int1146 = 0, $gep_int1150 = 0, $gep_int1152 = 0, $gep_int1154 = 0, $gep_int1156 = 0;
 var $gep_int1158 = 0, $gep_int1162 = 0, $gep_int1164 = 0, $gep_int1166 = 0, $gep_int1168 = 0, $gep_int1170 = 0, $gep_int1172 = 0, $gep_int1174 = 0, $gep_int1176 = 0, $gep_int1178 = 0, $gep_int1180 = 0, $gep_int1182 = 0, $gep_int1186 = 0, $gep_int1188 = 0, $gep_int1190 = 0, $gep_int1192 = 0, $gep_int1194 = 0, $gep_int1196 = 0, $gep_int1198 = 0, $gep_int1200 = 0;
 var $gep_int1202 = 0, $gep_int1204 = 0, $gep_int1206 = 0, $gep_int1208 = 0, $gep_int1210 = 0, $gep_int1212 = 0, $gep_int1214 = 0, $gep_int1216 = 0, $gep_int1218 = 0, $gep_int1220 = 0, $gep_int341 = 0, $gep_int343 = 0, $gep_int347 = 0, $gep_int349 = 0, $gep_int350 = 0, $gep_int352 = 0, $gep_int354 = 0, $gep_int356 = 0, $gep_int358 = 0, $gep_int360 = 0;
 var $gep_int364 = 0, $gep_int368 = 0, $gep_int370 = 0, $gep_int371 = 0, $gep_int373 = 0, $gep_int375 = 0, $gep_int377 = 0, $gep_int379 = 0, $gep_int381 = 0, $gep_int383 = 0, $gep_int385 = 0, $gep_int387 = 0, $gep_int391 = 0, $gep_int392 = 0, $gep_int393 = 0, $gep_int397 = 0, $gep_int401 = 0, $gep_int403 = 0, $gep_int405 = 0, $gep_int407 = 0;
 var $gep_int409 = 0, $gep_int411 = 0, $gep_int413 = 0, $gep_int415 = 0, $gep_int419 = 0, $gep_int421 = 0, $gep_int423 = 0, $gep_int425 = 0, $gep_int427 = 0, $gep_int429 = 0, $gep_int431 = 0, $gep_int433 = 0, $gep_int435 = 0, $gep_int437 = 0, $gep_int439 = 0, $gep_int441 = 0, $gep_int443 = 0, $gep_int445 = 0, $gep_int447 = 0, $gep_int449 = 0;
 var $gep_int451 = 0, $gep_int455 = 0, $gep_int457 = 0, $gep_int459 = 0, $gep_int461 = 0, $gep_int463 = 0, $gep_int465 = 0, $gep_int467 = 0, $gep_int469 = 0, $gep_int471 = 0, $gep_int473 = 0, $gep_int475 = 0, $gep_int477 = 0, $gep_int479 = 0, $gep_int481 = 0, $gep_int483 = 0, $gep_int485 = 0, $gep_int487 = 0, $gep_int489 = 0, $gep_int491 = 0;
 var $gep_int493 = 0, $gep_int495 = 0, $gep_int497 = 0, $gep_int499 = 0, $gep_int503 = 0, $gep_int504 = 0, $gep_int505 = 0, $gep_int509 = 0, $gep_int513 = 0, $gep_int515 = 0, $gep_int517 = 0, $gep_int519 = 0, $gep_int521 = 0, $gep_int523 = 0, $gep_int525 = 0, $gep_int527 = 0, $gep_int529 = 0, $gep_int533 = 0, $gep_int535 = 0, $gep_int537 = 0;
 var $gep_int541 = 0, $gep_int545 = 0, $gep_int547 = 0, $gep_int549 = 0, $gep_int551 = 0, $gep_int553 = 0, $gep_int555 = 0, $gep_int557 = 0, $gep_int559 = 0, $gep_int561 = 0, $gep_int563 = 0, $gep_int565 = 0, $gep_int567 = 0, $gep_int569 = 0, $gep_int571 = 0, $gep_int573 = 0, $gep_int575 = 0, $gep_int577 = 0, $gep_int581 = 0, $gep_int583 = 0;
 var $gep_int585 = 0, $gep_int587 = 0, $gep_int589 = 0, $gep_int591 = 0, $gep_int593 = 0, $gep_int595 = 0, $gep_int597 = 0, $gep_int599 = 0, $gep_int601 = 0, $gep_int603 = 0, $gep_int605 = 0, $gep_int607 = 0, $gep_int609 = 0, $gep_int611 = 0, $gep_int613 = 0, $gep_int615 = 0, $gep_int617 = 0, $gep_int619 = 0, $gep_int621 = 0, $gep_int625 = 0;
 var $gep_int626 = 0, $gep_int627 = 0, $gep_int631 = 0, $gep_int635 = 0, $gep_int637 = 0, $gep_int639 = 0, $gep_int641 = 0, $gep_int643 = 0, $gep_int647 = 0, $gep_int649 = 0, $gep_int651 = 0, $gep_int653 = 0, $gep_int655 = 0, $gep_int657 = 0, $gep_int659 = 0, $gep_int661 = 0, $gep_int663 = 0, $gep_int665 = 0, $gep_int667 = 0, $gep_int671 = 0;
 var $gep_int673 = 0, $gep_int675 = 0, $gep_int677 = 0, $gep_int679 = 0, $gep_int681 = 0, $gep_int683 = 0, $gep_int685 = 0, $gep_int687 = 0, $gep_int689 = 0, $gep_int691 = 0, $gep_int693 = 0, $gep_int695 = 0, $gep_int697 = 0, $gep_int699 = 0, $gep_int701 = 0, $gep_int703 = 0, $gep_int705 = 0, $gep_int707 = 0, $gep_int709 = 0, $gep_int711 = 0;
 var $gep_int713 = 0, $gep_int715 = 0, $gep_int717 = 0, $gep_int719 = 0, $gep_int721 = 0, $gep_int723 = 0, $gep_int725 = 0, $gep_int727 = 0, $gep_int729 = 0, $gep_int731 = 0, $gep_int733 = 0, $gep_int735 = 0, $gep_int736 = 0, $gep_int738 = 0, $gep_int740 = 0, $gep_int742 = 0, $gep_int744 = 0, $gep_int746 = 0, $gep_int748 = 0, $gep_int749 = 0;
 var $gep_int751 = 0, $gep_int753 = 0, $gep_int755 = 0, $gep_int757 = 0, $gep_int759 = 0, $gep_int761 = 0, $gep_int762 = 0, $gep_int764 = 0, $gep_int766 = 0, $gep_int768 = 0, $gep_int770 = 0, $gep_int772 = 0, $gep_int774 = 0, $gep_int776 = 0, $gep_int778 = 0, $gep_int780 = 0, $gep_int782 = 0, $gep_int784 = 0, $gep_int786 = 0, $gep_int788 = 0;
 var $gep_int790 = 0, $gep_int792 = 0, $gep_int794 = 0, $gep_int796 = 0, $gep_int798 = 0, $gep_int800 = 0, $gep_int802 = 0, $gep_int804 = 0, $gep_int806 = 0, $gep_int807 = 0, $gep_int809 = 0, $gep_int811 = 0, $gep_int815 = 0, $gep_int819 = 0, $gep_int823 = 0, $gep_int825 = 0, $gep_int827 = 0, $gep_int829 = 0, $gep_int831 = 0, $gep_int833 = 0;
 var $gep_int835 = 0, $gep_int837 = 0, $gep_int839 = 0, $gep_int840 = 0, $gep_int842 = 0, $gep_int844 = 0, $gep_int846 = 0, $gep_int848 = 0, $gep_int850 = 0, $gep_int852 = 0, $gep_int854 = 0, $gep_int856 = 0, $gep_int858 = 0, $gep_int860 = 0, $gep_int862 = 0, $gep_int864 = 0, $gep_int866 = 0, $gep_int868 = 0, $gep_int870 = 0, $gep_int872 = 0;
 var $gep_int874 = 0, $gep_int875 = 0, $gep_int877 = 0, $gep_int879 = 0, $gep_int881 = 0, $gep_int883 = 0, $gep_int885 = 0, $gep_int887 = 0, $gep_int889 = 0, $gep_int891 = 0, $gep_int893 = 0, $gep_int895 = 0, $gep_int897 = 0, $gep_int899 = 0, $gep_int901 = 0, $gep_int903 = 0, $gep_int905 = 0, $gep_int907 = 0, $gep_int909 = 0, $gep_int911 = 0;
 var $gep_int913 = 0, $gep_int915 = 0, $gep_int917 = 0, $gep_int919 = 0, $gep_int921 = 0, $gep_int925 = 0, $gep_int927 = 0, $gep_int929 = 0, $gep_int930 = 0, $gep_int931 = 0, $gep_int933 = 0, $gep_int935 = 0, $gep_int937 = 0, $gep_int939 = 0, $gep_int941 = 0, $gep_int943 = 0, $gep_int945 = 0, $gep_int947 = 0, $gep_int949 = 0, $gep_int951 = 0;
 var $gep_int953 = 0, $gep_int955 = 0, $gep_int957 = 0, $gep_int959 = 0, $gep_int961 = 0, $gep_int963 = 0, $gep_int967 = 0, $gep_int969 = 0, $gep_int971 = 0, $gep_int973 = 0, $gep_int975 = 0, $gep_int977 = 0, $gep_int979 = 0, $gep_int981 = 0, $gep_int983 = 0, $gep_int985 = 0, $gep_int987 = 0, $gep_int989 = 0, $gep_int991 = 0, $gep_int993 = 0;
 var $gep_int995 = 0, $gep_int997 = 0, $gep_int999 = 0, $i$02$i$i = 0, $i$02$i$i$phi = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i31 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond2$i = 0, $or$cond21$i = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0;
 var $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i17 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$331$i = 0, $rsize$331$i$phi = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$i = 0;
 var $ssize$2$i = 0, $t$0$i = 0, $t$0$i16 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$230$i = 0, $t$230$i$phi = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i18 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$332$i = 0;
 var $v$332$i$phi = 0, label = 0, sp = 0, u$318 = 0;
 sp = STACKTOP;
 $1 = ($bytes>>>0)<(245);
 
 do {
  if ($1) {
   $2 = ($bytes>>>0)<(11);
   
   if ($2) {
    $5 = 16;
   } else {
    $3 = (($bytes) + 11)|0;
    $4 = $3 & -8;
    
    $5 = $4;
   }
   
   $6 = $5 >>> 3;
   $expanded1 = 2360;
   $gep_int = 2360;
   $expanded = $gep_int;
   $7 = HEAP32[$expanded>>2]|0;
   $8 = $7 >>> $6;
   $9 = $8 & 3;
   $10 = ($9|0)==(0);
   
   if (!($10)) {
    $11 = $8 & 1;
    $12 = $11 ^ 1;
    $13 = (($12) + ($6))|0;
    $14 = $13 << 1;
    $expanded2 = 2360;
    $gep_int341 = 2360;
    $gep = (($gep_int341) + 40)|0;
    $gep_array = $14<<2;
    $gep342 = (($gep) + ($gep_array))|0;
    $15 = $gep342;
    $16 = $15;
    $$sum11 = (($14) + 2)|0;
    $expanded3 = 2360;
    $gep_int343 = 2360;
    $gep344 = (($gep_int343) + 40)|0;
    $gep_array345 = $$sum11<<2;
    $gep346 = (($gep344) + ($gep_array345))|0;
    $17 = $gep346;
    $18 = HEAP32[$17>>2]|0;
    $gep_int347 = $18;
    $gep348 = (($gep_int347) + 8)|0;
    $19 = $gep348;
    $20 = HEAP32[$19>>2]|0;
    $21 = ($16|0)==($20|0);
    
    do {
     if ($21) {
      $22 = 1 << $13;
      $23 = $22 ^ -1;
      $24 = $7 & $23;
      $expanded5 = 2360;
      $gep_int349 = 2360;
      $expanded4 = $gep_int349;
      HEAP32[$expanded4>>2] = $24;
      
     } else {
      $25 = $20;
      $expanded7 = 2360;
      $gep_int350 = 2360;
      $gep351 = (($gep_int350) + 16)|0;
      $expanded6 = $gep351;
      $26 = HEAP32[$expanded6>>2]|0;
      $27 = ($25>>>0)<($26>>>0);
      
      if ($27) {
       _abort();
       // unreachable
      }
      $gep_int352 = $20;
      $gep353 = (($gep_int352) + 12)|0;
      $28 = $gep353;
      $29 = HEAP32[$28>>2]|0;
      $30 = ($29|0)==($18|0);
      
      if ($30) {
       HEAP32[$28>>2] = $16;
       HEAP32[$17>>2] = $20;
       
       break;
      } else {
       _abort();
       // unreachable
      }
     }
    } while(0);
    $31 = $13 << 3;
    $32 = $31 | 3;
    $gep_int354 = $18;
    $gep355 = (($gep_int354) + 4)|0;
    $33 = $gep355;
    HEAP32[$33>>2] = $32;
    $34 = $18;
    $$sum1314 = $31 | 4;
    $gep_int356 = $18;
    $gep357 = (($gep_int356) + ($$sum1314))|0;
    $35 = $gep357;
    $36 = $35;
    $37 = HEAP32[$35>>2]|0;
    $38 = $37 | 1;
    HEAP32[$35>>2] = $38;
    $39 = $19;
    
    $mem$0 = $39;
    
    STACKTOP = sp;return $mem$0|0;
   }
   $expanded9 = 2360;
   $gep_int358 = 2360;
   $gep359 = (($gep_int358) + 8)|0;
   $expanded8 = $gep359;
   $40 = HEAP32[$expanded8>>2]|0;
   $41 = ($5>>>0)>($40>>>0);
   
   if (!($41)) {
    $nb$0 = $5;
    break;
   }
   $42 = ($8|0)==(0);
   
   if (!($42)) {
    $43 = $8 << $6;
    $44 = 2 << $6;
    $45 = (0 - ($44))|0;
    $46 = $44 | $45;
    $47 = $43 & $46;
    $48 = (0 - ($47))|0;
    $49 = $47 & $48;
    $50 = (($49) + -1)|0;
    $51 = $50 >>> 12;
    $52 = $51 & 16;
    $53 = $50 >>> $52;
    $54 = $53 >>> 5;
    $55 = $54 & 8;
    $56 = $55 | $52;
    $57 = $53 >>> $55;
    $58 = $57 >>> 2;
    $59 = $58 & 4;
    $60 = $56 | $59;
    $61 = $57 >>> $59;
    $62 = $61 >>> 1;
    $63 = $62 & 2;
    $64 = $60 | $63;
    $65 = $61 >>> $63;
    $66 = $65 >>> 1;
    $67 = $66 & 1;
    $68 = $64 | $67;
    $69 = $65 >>> $67;
    $70 = (($68) + ($69))|0;
    $71 = $70 << 1;
    $expanded10 = 2360;
    $gep_int360 = 2360;
    $gep361 = (($gep_int360) + 40)|0;
    $gep_array362 = $71<<2;
    $gep363 = (($gep361) + ($gep_array362))|0;
    $72 = $gep363;
    $73 = $72;
    $$sum4 = (($71) + 2)|0;
    $expanded11 = 2360;
    $gep_int364 = 2360;
    $gep365 = (($gep_int364) + 40)|0;
    $gep_array366 = $$sum4<<2;
    $gep367 = (($gep365) + ($gep_array366))|0;
    $74 = $gep367;
    $75 = HEAP32[$74>>2]|0;
    $gep_int368 = $75;
    $gep369 = (($gep_int368) + 8)|0;
    $76 = $gep369;
    $77 = HEAP32[$76>>2]|0;
    $78 = ($73|0)==($77|0);
    
    do {
     if ($78) {
      $79 = 1 << $70;
      $80 = $79 ^ -1;
      $81 = $7 & $80;
      $expanded13 = 2360;
      $gep_int370 = 2360;
      $expanded12 = $gep_int370;
      HEAP32[$expanded12>>2] = $81;
      
     } else {
      $82 = $77;
      $expanded15 = 2360;
      $gep_int371 = 2360;
      $gep372 = (($gep_int371) + 16)|0;
      $expanded14 = $gep372;
      $83 = HEAP32[$expanded14>>2]|0;
      $84 = ($82>>>0)<($83>>>0);
      
      if ($84) {
       _abort();
       // unreachable
      }
      $gep_int373 = $77;
      $gep374 = (($gep_int373) + 12)|0;
      $85 = $gep374;
      $86 = HEAP32[$85>>2]|0;
      $87 = ($86|0)==($75|0);
      
      if ($87) {
       HEAP32[$85>>2] = $73;
       HEAP32[$74>>2] = $77;
       
       break;
      } else {
       _abort();
       // unreachable
      }
     }
    } while(0);
    $88 = $70 << 3;
    $89 = (($88) - ($5))|0;
    $90 = $5 | 3;
    $gep_int375 = $75;
    $gep376 = (($gep_int375) + 4)|0;
    $91 = $gep376;
    HEAP32[$91>>2] = $90;
    $92 = $75;
    $gep_int377 = $75;
    $gep378 = (($gep_int377) + ($5))|0;
    $93 = $gep378;
    $94 = $93;
    $95 = $89 | 1;
    $$sum67 = $5 | 4;
    $gep_int379 = $75;
    $gep380 = (($gep_int379) + ($$sum67))|0;
    $96 = $gep380;
    $97 = $96;
    HEAP32[$96>>2] = $95;
    $gep_int381 = $75;
    $gep382 = (($gep_int381) + ($88))|0;
    $98 = $gep382;
    $99 = $98;
    HEAP32[$98>>2] = $89;
    $expanded17 = 2360;
    $gep_int383 = 2360;
    $gep384 = (($gep_int383) + 8)|0;
    $expanded16 = $gep384;
    $100 = HEAP32[$expanded16>>2]|0;
    $101 = ($100|0)==(0);
    
    if (!($101)) {
     $expanded19 = 2360;
     $gep_int385 = 2360;
     $gep386 = (($gep_int385) + 20)|0;
     $expanded18 = $gep386;
     $102 = HEAP32[$expanded18>>2]|0;
     $103 = $100 >>> 3;
     $104 = $103 << 1;
     $expanded20 = 2360;
     $gep_int387 = 2360;
     $gep388 = (($gep_int387) + 40)|0;
     $gep_array389 = $104<<2;
     $gep390 = (($gep388) + ($gep_array389))|0;
     $105 = $gep390;
     $106 = $105;
     $expanded22 = 2360;
     $gep_int391 = 2360;
     $expanded21 = $gep_int391;
     $107 = HEAP32[$expanded21>>2]|0;
     $108 = 1 << $103;
     $109 = $107 & $108;
     $110 = ($109|0)==(0);
     
     do {
      if ($110) {
       $111 = $107 | $108;
       $expanded24 = 2360;
       $gep_int392 = 2360;
       $expanded23 = $gep_int392;
       HEAP32[$expanded23>>2] = $111;
       $$sum9$pre = (($104) + 2)|0;
       $expanded25 = 2360;
       $gep_int393 = 2360;
       $gep394 = (($gep_int393) + 40)|0;
       $gep_array395 = $$sum9$pre<<2;
       $gep396 = (($gep394) + ($gep_array395))|0;
       $$pre = $gep396;
       
       $$pre$phiZ2D = $$pre;$F4$0 = $106;
      } else {
       $$sum10 = (($104) + 2)|0;
       $expanded26 = 2360;
       $gep_int397 = 2360;
       $gep398 = (($gep_int397) + 40)|0;
       $gep_array399 = $$sum10<<2;
       $gep400 = (($gep398) + ($gep_array399))|0;
       $112 = $gep400;
       $113 = HEAP32[$112>>2]|0;
       $114 = $113;
       $expanded28 = 2360;
       $gep_int401 = 2360;
       $gep402 = (($gep_int401) + 16)|0;
       $expanded27 = $gep402;
       $115 = HEAP32[$expanded27>>2]|0;
       $116 = ($114>>>0)<($115>>>0);
       
       if (!($116)) {
        $$pre$phiZ2D = $112;$F4$0 = $113;
        break;
       }
       _abort();
       // unreachable
      }
     } while(0);
     
     
     HEAP32[$$pre$phiZ2D>>2] = $102;
     $gep_int403 = $F4$0;
     $gep404 = (($gep_int403) + 12)|0;
     $117 = $gep404;
     HEAP32[$117>>2] = $102;
     $gep_int405 = $102;
     $gep406 = (($gep_int405) + 8)|0;
     $118 = $gep406;
     HEAP32[$118>>2] = $F4$0;
     $gep_int407 = $102;
     $gep408 = (($gep_int407) + 12)|0;
     $119 = $gep408;
     HEAP32[$119>>2] = $106;
     
    }
    $expanded30 = 2360;
    $gep_int409 = 2360;
    $gep410 = (($gep_int409) + 8)|0;
    $expanded29 = $gep410;
    HEAP32[$expanded29>>2] = $89;
    $expanded32 = 2360;
    $gep_int411 = 2360;
    $gep412 = (($gep_int411) + 20)|0;
    $expanded31 = $gep412;
    HEAP32[$expanded31>>2] = $94;
    $120 = $76;
    
    $mem$0 = $120;
    
    STACKTOP = sp;return $mem$0|0;
   }
   $expanded34 = 2360;
   $gep_int413 = 2360;
   $gep414 = (($gep_int413) + 4)|0;
   $expanded33 = $gep414;
   $121 = HEAP32[$expanded33>>2]|0;
   $122 = ($121|0)==(0);
   
   if ($122) {
    $nb$0 = $5;
    break;
   }
   $123 = (0 - ($121))|0;
   $124 = $121 & $123;
   $125 = (($124) + -1)|0;
   $126 = $125 >>> 12;
   $127 = $126 & 16;
   $128 = $125 >>> $127;
   $129 = $128 >>> 5;
   $130 = $129 & 8;
   $131 = $130 | $127;
   $132 = $128 >>> $130;
   $133 = $132 >>> 2;
   $134 = $133 & 4;
   $135 = $131 | $134;
   $136 = $132 >>> $134;
   $137 = $136 >>> 1;
   $138 = $137 & 2;
   $139 = $135 | $138;
   $140 = $136 >>> $138;
   $141 = $140 >>> 1;
   $142 = $141 & 1;
   $143 = $139 | $142;
   $144 = $140 >>> $142;
   $145 = (($143) + ($144))|0;
   $expanded35 = 2360;
   $gep_int415 = 2360;
   $gep416 = (($gep_int415) + 304)|0;
   $gep_array417 = $145<<2;
   $gep418 = (($gep416) + ($gep_array417))|0;
   $146 = $gep418;
   $147 = HEAP32[$146>>2]|0;
   $gep_int419 = $147;
   $gep420 = (($gep_int419) + 4)|0;
   $148 = $gep420;
   $149 = HEAP32[$148>>2]|0;
   $150 = $149 & -8;
   $151 = (($150) - ($5))|0;
   
   $rsize$0$i = $151;$t$0$i = $147;$v$0$i = $147;
   while(1) {
    
    
    
    $gep_int421 = $t$0$i;
    $gep422 = (($gep_int421) + 16)|0;
    $152 = $gep422;
    $153 = HEAP32[$152>>2]|0;
    $154 = ($153|0)==(0);
    
    if ($154) {
     $gep_int423 = $t$0$i;
     $gep424 = (($gep_int423) + 20)|0;
     $155 = $gep424;
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==(0);
     
     if ($157) {
      break;
     } else {
      $158 = $156;
     }
    } else {
     $158 = $153;
    }
    
    $gep_int425 = $158;
    $gep426 = (($gep_int425) + 4)|0;
    $159 = $gep426;
    $160 = HEAP32[$159>>2]|0;
    $161 = $160 & -8;
    $162 = (($161) - ($5))|0;
    $163 = ($162>>>0)<($rsize$0$i>>>0);
    $$rsize$0$i = $163 ? $162 : $rsize$0$i;
    $$v$0$i = $163 ? $158 : $v$0$i;
    
    $rsize$0$i = $$rsize$0$i;$t$0$i = $158;$v$0$i = $$v$0$i;
   }
   $164 = $v$0$i;
   $expanded37 = 2360;
   $gep_int427 = 2360;
   $gep428 = (($gep_int427) + 16)|0;
   $expanded36 = $gep428;
   $165 = HEAP32[$expanded36>>2]|0;
   $166 = ($164>>>0)<($165>>>0);
   
   if ($166) {
    _abort();
    // unreachable
   }
   $gep_int429 = $v$0$i;
   $gep430 = (($gep_int429) + ($5))|0;
   $167 = $gep430;
   $168 = $167;
   $169 = ($164>>>0)<($167>>>0);
   
   if (!($169)) {
    _abort();
    // unreachable
   }
   $gep_int431 = $v$0$i;
   $gep432 = (($gep_int431) + 24)|0;
   $170 = $gep432;
   $171 = HEAP32[$170>>2]|0;
   $gep_int433 = $v$0$i;
   $gep434 = (($gep_int433) + 12)|0;
   $172 = $gep434;
   $173 = HEAP32[$172>>2]|0;
   $174 = ($173|0)==($v$0$i|0);
   
   do {
    if ($174) {
     $gep_int441 = $v$0$i;
     $gep442 = (($gep_int441) + 20)|0;
     $185 = $gep442;
     $186 = HEAP32[$185>>2]|0;
     $187 = ($186|0)==(0);
     
     if ($187) {
      $gep_int443 = $v$0$i;
      $gep444 = (($gep_int443) + 16)|0;
      $188 = $gep444;
      $189 = HEAP32[$188>>2]|0;
      $190 = ($189|0)==(0);
      
      if ($190) {
       $R$1$i = 0;
       break;
      } else {
       $R$0$i = $189;$RP$0$i = $188;
      }
     } else {
      $R$0$i = $186;$RP$0$i = $185;
     }
     while(1) {
      
      
      $gep_int445 = $R$0$i;
      $gep446 = (($gep_int445) + 20)|0;
      $191 = $gep446;
      $192 = HEAP32[$191>>2]|0;
      $193 = ($192|0)==(0);
      
      if (!($193)) {
       $RP$0$i$phi = $191;$R$0$i$phi = $192;$RP$0$i = $RP$0$i$phi;$R$0$i = $R$0$i$phi;
       continue;
      }
      $gep_int447 = $R$0$i;
      $gep448 = (($gep_int447) + 16)|0;
      $194 = $gep448;
      $195 = HEAP32[$194>>2]|0;
      $196 = ($195|0)==(0);
      
      if ($196) {
       break;
      } else {
       $R$0$i = $195;$RP$0$i = $194;
      }
     }
     $197 = $RP$0$i;
     $198 = ($197>>>0)<($165>>>0);
     
     if ($198) {
      _abort();
      // unreachable
     } else {
      HEAP32[$RP$0$i>>2] = 0;
      
      $R$1$i = $R$0$i;
      break;
     }
    } else {
     $gep_int435 = $v$0$i;
     $gep436 = (($gep_int435) + 8)|0;
     $175 = $gep436;
     $176 = HEAP32[$175>>2]|0;
     $177 = $176;
     $178 = ($177>>>0)<($165>>>0);
     
     if ($178) {
      _abort();
      // unreachable
     }
     $gep_int437 = $176;
     $gep438 = (($gep_int437) + 12)|0;
     $179 = $gep438;
     $180 = HEAP32[$179>>2]|0;
     $181 = ($180|0)==($v$0$i|0);
     
     if (!($181)) {
      _abort();
      // unreachable
     }
     $gep_int439 = $173;
     $gep440 = (($gep_int439) + 8)|0;
     $182 = $gep440;
     $183 = HEAP32[$182>>2]|0;
     $184 = ($183|0)==($v$0$i|0);
     
     if ($184) {
      HEAP32[$179>>2] = $173;
      HEAP32[$182>>2] = $176;
      
      $R$1$i = $173;
      break;
     } else {
      _abort();
      // unreachable
     }
    }
   } while(0);
   
   $199 = ($171|0)==(0);
   
   L78: do {
    if (!($199)) {
     $gep_int449 = $v$0$i;
     $gep450 = (($gep_int449) + 28)|0;
     $200 = $gep450;
     $201 = HEAP32[$200>>2]|0;
     $expanded38 = 2360;
     $gep_int451 = 2360;
     $gep452 = (($gep_int451) + 304)|0;
     $gep_array453 = $201<<2;
     $gep454 = (($gep452) + ($gep_array453))|0;
     $202 = $gep454;
     $203 = HEAP32[$202>>2]|0;
     $204 = ($v$0$i|0)==($203|0);
     
     do {
      if ($204) {
       HEAP32[$202>>2] = $R$1$i;
       $cond$i = ($R$1$i|0)==(0);
       
       if (!($cond$i)) {
        break;
       }
       $205 = 1 << $201;
       $206 = $205 ^ -1;
       $expanded40 = 2360;
       $gep_int455 = 2360;
       $gep456 = (($gep_int455) + 4)|0;
       $expanded39 = $gep456;
       $207 = HEAP32[$expanded39>>2]|0;
       $208 = $207 & $206;
       $expanded42 = 2360;
       $gep_int457 = 2360;
       $gep458 = (($gep_int457) + 4)|0;
       $expanded41 = $gep458;
       HEAP32[$expanded41>>2] = $208;
       
       break L78;
      } else {
       $209 = $171;
       $expanded44 = 2360;
       $gep_int459 = 2360;
       $gep460 = (($gep_int459) + 16)|0;
       $expanded43 = $gep460;
       $210 = HEAP32[$expanded43>>2]|0;
       $211 = ($209>>>0)<($210>>>0);
       
       if ($211) {
        _abort();
        // unreachable
       }
       $gep_int461 = $171;
       $gep462 = (($gep_int461) + 16)|0;
       $212 = $gep462;
       $213 = HEAP32[$212>>2]|0;
       $214 = ($213|0)==($v$0$i|0);
       
       if ($214) {
        HEAP32[$212>>2] = $R$1$i;
        
       } else {
        $gep_int463 = $171;
        $gep464 = (($gep_int463) + 20)|0;
        $215 = $gep464;
        HEAP32[$215>>2] = $R$1$i;
        
       }
       $216 = ($R$1$i|0)==(0);
       
       if ($216) {
        break L78;
       }
      }
     } while(0);
     $217 = $R$1$i;
     $expanded46 = 2360;
     $gep_int465 = 2360;
     $gep466 = (($gep_int465) + 16)|0;
     $expanded45 = $gep466;
     $218 = HEAP32[$expanded45>>2]|0;
     $219 = ($217>>>0)<($218>>>0);
     
     if ($219) {
      _abort();
      // unreachable
     }
     $gep_int467 = $R$1$i;
     $gep468 = (($gep_int467) + 24)|0;
     $220 = $gep468;
     HEAP32[$220>>2] = $171;
     $gep_int469 = $v$0$i;
     $gep470 = (($gep_int469) + 16)|0;
     $221 = $gep470;
     $222 = HEAP32[$221>>2]|0;
     $223 = ($222|0)==(0);
     
     do {
      if (!($223)) {
       $224 = $222;
       $expanded48 = 2360;
       $gep_int471 = 2360;
       $gep472 = (($gep_int471) + 16)|0;
       $expanded47 = $gep472;
       $225 = HEAP32[$expanded47>>2]|0;
       $226 = ($224>>>0)<($225>>>0);
       
       if ($226) {
        _abort();
        // unreachable
       } else {
        $gep_int473 = $R$1$i;
        $gep474 = (($gep_int473) + 16)|0;
        $227 = $gep474;
        HEAP32[$227>>2] = $222;
        $gep_int475 = $222;
        $gep476 = (($gep_int475) + 24)|0;
        $228 = $gep476;
        HEAP32[$228>>2] = $R$1$i;
        
        break;
       }
      }
     } while(0);
     $gep_int477 = $v$0$i;
     $gep478 = (($gep_int477) + 20)|0;
     $229 = $gep478;
     $230 = HEAP32[$229>>2]|0;
     $231 = ($230|0)==(0);
     
     if ($231) {
      break;
     }
     $232 = $230;
     $expanded50 = 2360;
     $gep_int479 = 2360;
     $gep480 = (($gep_int479) + 16)|0;
     $expanded49 = $gep480;
     $233 = HEAP32[$expanded49>>2]|0;
     $234 = ($232>>>0)<($233>>>0);
     
     if ($234) {
      _abort();
      // unreachable
     } else {
      $gep_int481 = $R$1$i;
      $gep482 = (($gep_int481) + 20)|0;
      $235 = $gep482;
      HEAP32[$235>>2] = $230;
      $gep_int483 = $230;
      $gep484 = (($gep_int483) + 24)|0;
      $236 = $gep484;
      HEAP32[$236>>2] = $R$1$i;
      
      break;
     }
    }
   } while(0);
   $237 = ($rsize$0$i>>>0)<(16);
   
   if ($237) {
    $238 = (($rsize$0$i) + ($5))|0;
    $239 = $238 | 3;
    $gep_int485 = $v$0$i;
    $gep486 = (($gep_int485) + 4)|0;
    $240 = $gep486;
    HEAP32[$240>>2] = $239;
    $$sum4$i = (($238) + 4)|0;
    $gep_int487 = $v$0$i;
    $gep488 = (($gep_int487) + ($$sum4$i))|0;
    $241 = $gep488;
    $242 = $241;
    $243 = HEAP32[$241>>2]|0;
    $244 = $243 | 1;
    HEAP32[$241>>2] = $244;
    
   } else {
    $245 = $5 | 3;
    $gep_int489 = $v$0$i;
    $gep490 = (($gep_int489) + 4)|0;
    $246 = $gep490;
    HEAP32[$246>>2] = $245;
    $247 = $rsize$0$i | 1;
    $$sum$i37 = $5 | 4;
    $gep_int491 = $v$0$i;
    $gep492 = (($gep_int491) + ($$sum$i37))|0;
    $248 = $gep492;
    $249 = $248;
    HEAP32[$248>>2] = $247;
    $$sum1$i = (($rsize$0$i) + ($5))|0;
    $gep_int493 = $v$0$i;
    $gep494 = (($gep_int493) + ($$sum1$i))|0;
    $250 = $gep494;
    $251 = $250;
    HEAP32[$250>>2] = $rsize$0$i;
    $expanded52 = 2360;
    $gep_int495 = 2360;
    $gep496 = (($gep_int495) + 8)|0;
    $expanded51 = $gep496;
    $252 = HEAP32[$expanded51>>2]|0;
    $253 = ($252|0)==(0);
    
    if (!($253)) {
     $expanded54 = 2360;
     $gep_int497 = 2360;
     $gep498 = (($gep_int497) + 20)|0;
     $expanded53 = $gep498;
     $254 = HEAP32[$expanded53>>2]|0;
     $255 = $252 >>> 3;
     $256 = $255 << 1;
     $expanded55 = 2360;
     $gep_int499 = 2360;
     $gep500 = (($gep_int499) + 40)|0;
     $gep_array501 = $256<<2;
     $gep502 = (($gep500) + ($gep_array501))|0;
     $257 = $gep502;
     $258 = $257;
     $expanded57 = 2360;
     $gep_int503 = 2360;
     $expanded56 = $gep_int503;
     $259 = HEAP32[$expanded56>>2]|0;
     $260 = 1 << $255;
     $261 = $259 & $260;
     $262 = ($261|0)==(0);
     
     do {
      if ($262) {
       $263 = $259 | $260;
       $expanded59 = 2360;
       $gep_int504 = 2360;
       $expanded58 = $gep_int504;
       HEAP32[$expanded58>>2] = $263;
       $$sum2$pre$i = (($256) + 2)|0;
       $expanded60 = 2360;
       $gep_int505 = 2360;
       $gep506 = (($gep_int505) + 40)|0;
       $gep_array507 = $$sum2$pre$i<<2;
       $gep508 = (($gep506) + ($gep_array507))|0;
       $$pre$i = $gep508;
       
       $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $258;
      } else {
       $$sum3$i = (($256) + 2)|0;
       $expanded61 = 2360;
       $gep_int509 = 2360;
       $gep510 = (($gep_int509) + 40)|0;
       $gep_array511 = $$sum3$i<<2;
       $gep512 = (($gep510) + ($gep_array511))|0;
       $264 = $gep512;
       $265 = HEAP32[$264>>2]|0;
       $266 = $265;
       $expanded63 = 2360;
       $gep_int513 = 2360;
       $gep514 = (($gep_int513) + 16)|0;
       $expanded62 = $gep514;
       $267 = HEAP32[$expanded62>>2]|0;
       $268 = ($266>>>0)<($267>>>0);
       
       if (!($268)) {
        $$pre$phi$iZ2D = $264;$F1$0$i = $265;
        break;
       }
       _abort();
       // unreachable
      }
     } while(0);
     
     
     HEAP32[$$pre$phi$iZ2D>>2] = $254;
     $gep_int515 = $F1$0$i;
     $gep516 = (($gep_int515) + 12)|0;
     $269 = $gep516;
     HEAP32[$269>>2] = $254;
     $gep_int517 = $254;
     $gep518 = (($gep_int517) + 8)|0;
     $270 = $gep518;
     HEAP32[$270>>2] = $F1$0$i;
     $gep_int519 = $254;
     $gep520 = (($gep_int519) + 12)|0;
     $271 = $gep520;
     HEAP32[$271>>2] = $258;
     
    }
    $expanded65 = 2360;
    $gep_int521 = 2360;
    $gep522 = (($gep_int521) + 8)|0;
    $expanded64 = $gep522;
    HEAP32[$expanded64>>2] = $rsize$0$i;
    $expanded67 = 2360;
    $gep_int523 = 2360;
    $gep524 = (($gep_int523) + 20)|0;
    $expanded66 = $gep524;
    HEAP32[$expanded66>>2] = $168;
    
   }
   $gep_int525 = $v$0$i;
   $gep526 = (($gep_int525) + 8)|0;
   $272 = $gep526;
   $273 = $272;
   
   $mem$0 = $273;
   
   STACKTOP = sp;return $mem$0|0;
  } else {
   $274 = ($bytes>>>0)>(4294967231);
   
   if ($274) {
    $nb$0 = -1;
    break;
   }
   $275 = (($bytes) + 11)|0;
   $276 = $275 & -8;
   $expanded69 = 2360;
   $gep_int527 = 2360;
   $gep528 = (($gep_int527) + 4)|0;
   $expanded68 = $gep528;
   $277 = HEAP32[$expanded68>>2]|0;
   $278 = ($277|0)==(0);
   
   if ($278) {
    $nb$0 = $276;
    break;
   }
   $279 = (0 - ($276))|0;
   $280 = $275 >>> 8;
   $281 = ($280|0)==(0);
   
   do {
    if ($281) {
     $idx$0$i = 0;
    } else {
     $282 = ($276>>>0)>(16777215);
     
     if ($282) {
      $idx$0$i = 31;
      break;
     }
     $283 = (($280) + 1048320)|0;
     $284 = $283 >>> 16;
     $285 = $284 & 8;
     $286 = $280 << $285;
     $287 = (($286) + 520192)|0;
     $288 = $287 >>> 16;
     $289 = $288 & 4;
     $290 = $289 | $285;
     $291 = $286 << $289;
     $292 = (($291) + 245760)|0;
     $293 = $292 >>> 16;
     $294 = $293 & 2;
     $295 = $290 | $294;
     $296 = (14 - ($295))|0;
     $297 = $291 << $294;
     $298 = $297 >>> 15;
     $299 = (($296) + ($298))|0;
     $300 = $299 << 1;
     $301 = (($299) + 7)|0;
     $302 = $276 >>> $301;
     $303 = $302 & 1;
     $304 = $303 | $300;
     
     $idx$0$i = $304;
    }
   } while(0);
   
   $expanded70 = 2360;
   $gep_int529 = 2360;
   $gep530 = (($gep_int529) + 304)|0;
   $gep_array531 = $idx$0$i<<2;
   $gep532 = (($gep530) + ($gep_array531))|0;
   $305 = $gep532;
   $306 = HEAP32[$305>>2]|0;
   $307 = ($306|0)==(0);
   
   L126: do {
    if ($307) {
     $rsize$2$i = $279;$t$1$i = 0;$v$2$i = 0;
    } else {
     $308 = ($idx$0$i|0)==(31);
     
     if ($308) {
      $311 = 0;
     } else {
      $309 = $idx$0$i >>> 1;
      $310 = (25 - ($309))|0;
      
      $311 = $310;
     }
     
     $312 = $276 << $311;
     
     $rsize$0$i17 = $279;$rst$0$i = 0;$sizebits$0$i = $312;$t$0$i16 = $306;$v$0$i18 = 0;
     while(1) {
      
      
      
      
      
      $gep_int533 = $t$0$i16;
      $gep534 = (($gep_int533) + 4)|0;
      $313 = $gep534;
      $314 = HEAP32[$313>>2]|0;
      $315 = $314 & -8;
      $316 = (($315) - ($276))|0;
      $317 = ($316>>>0)<($rsize$0$i17>>>0);
      
      if ($317) {
       $318 = ($315|0)==($276|0);
       
       if ($318) {
        $rsize$2$i = $316;$t$1$i = $t$0$i16;$v$2$i = $t$0$i16;
        break L126;
       } else {
        $rsize$1$i = $316;$v$1$i = $t$0$i16;
       }
      } else {
       $rsize$1$i = $rsize$0$i17;$v$1$i = $v$0$i18;
      }
      
      
      $gep_int535 = $t$0$i16;
      $gep536 = (($gep_int535) + 20)|0;
      $319 = $gep536;
      $320 = HEAP32[$319>>2]|0;
      $321 = $sizebits$0$i >>> 31;
      $gep_int537 = $t$0$i16;
      $gep538 = (($gep_int537) + 16)|0;
      $gep_array539 = $321<<2;
      $gep540 = (($gep538) + ($gep_array539))|0;
      $322 = $gep540;
      $323 = HEAP32[$322>>2]|0;
      $324 = ($320|0)==(0);
      $325 = ($320|0)==($323|0);
      $or$cond$i = $324 | $325;
      $rst$1$i = $or$cond$i ? $rst$0$i : $320;
      $326 = ($323|0)==(0);
      $327 = $sizebits$0$i << 1;
      
      if ($326) {
       $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
       break;
      } else {
       $rsize$0$i17 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $327;$t$0$i16 = $323;$v$0$i18 = $v$1$i;
      }
     }
    }
   } while(0);
   
   
   
   $328 = ($t$1$i|0)==(0);
   $329 = ($v$2$i|0)==(0);
   $or$cond21$i = $328 & $329;
   
   if ($or$cond21$i) {
    $330 = 2 << $idx$0$i;
    $331 = (0 - ($330))|0;
    $332 = $330 | $331;
    $333 = $277 & $332;
    $334 = ($333|0)==(0);
    
    if ($334) {
     $nb$0 = $276;
     break;
    }
    $335 = (0 - ($333))|0;
    $336 = $333 & $335;
    $337 = (($336) + -1)|0;
    $338 = $337 >>> 12;
    $339 = $338 & 16;
    $340 = $337 >>> $339;
    $341 = $340 >>> 5;
    $342 = $341 & 8;
    $343 = $342 | $339;
    $344 = $340 >>> $342;
    $345 = $344 >>> 2;
    $346 = $345 & 4;
    $347 = $343 | $346;
    $348 = $344 >>> $346;
    $349 = $348 >>> 1;
    $350 = $349 & 2;
    $351 = $347 | $350;
    $352 = $348 >>> $350;
    $353 = $352 >>> 1;
    $354 = $353 & 1;
    $355 = $351 | $354;
    $356 = $352 >>> $354;
    $357 = (($355) + ($356))|0;
    $expanded71 = 2360;
    $gep_int541 = 2360;
    $gep542 = (($gep_int541) + 304)|0;
    $gep_array543 = $357<<2;
    $gep544 = (($gep542) + ($gep_array543))|0;
    $358 = $gep544;
    $359 = HEAP32[$358>>2]|0;
    
    $t$2$ph$i = $359;
   } else {
    $t$2$ph$i = $t$1$i;
   }
   
   $360 = ($t$2$ph$i|0)==(0);
   
   if ($360) {
    $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
   } else {
    $rsize$331$i = $rsize$2$i;$t$230$i = $t$2$ph$i;$v$332$i = $v$2$i;
    while(1) {
     
     
     
     $gep_int545 = $t$230$i;
     $gep546 = (($gep_int545) + 4)|0;
     $361 = $gep546;
     $362 = HEAP32[$361>>2]|0;
     $363 = $362 & -8;
     $364 = (($363) - ($276))|0;
     $365 = ($364>>>0)<($rsize$331$i>>>0);
     $$rsize$3$i = $365 ? $364 : $rsize$331$i;
     $t$2$v$3$i = $365 ? $t$230$i : $v$332$i;
     $gep_int547 = $t$230$i;
     $gep548 = (($gep_int547) + 16)|0;
     $366 = $gep548;
     $367 = HEAP32[$366>>2]|0;
     $368 = ($367|0)==(0);
     
     if (!($368)) {
      $v$332$i$phi = $t$2$v$3$i;$t$230$i$phi = $367;$rsize$331$i$phi = $$rsize$3$i;$v$332$i = $v$332$i$phi;$t$230$i = $t$230$i$phi;$rsize$331$i = $rsize$331$i$phi;
      continue;
     }
     $gep_int549 = $t$230$i;
     $gep550 = (($gep_int549) + 20)|0;
     $369 = $gep550;
     $370 = HEAP32[$369>>2]|0;
     $371 = ($370|0)==(0);
     
     if ($371) {
      $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
      break;
     } else {
      $v$332$i$phi = $t$2$v$3$i;$rsize$331$i$phi = $$rsize$3$i;$t$230$i = $370;$v$332$i = $v$332$i$phi;$rsize$331$i = $rsize$331$i$phi;
     }
    }
   }
   
   
   $372 = ($v$3$lcssa$i|0)==(0);
   
   if ($372) {
    $nb$0 = $276;
    break;
   }
   $expanded73 = 2360;
   $gep_int551 = 2360;
   $gep552 = (($gep_int551) + 8)|0;
   $expanded72 = $gep552;
   $373 = HEAP32[$expanded72>>2]|0;
   $374 = (($373) - ($276))|0;
   $375 = ($rsize$3$lcssa$i>>>0)<($374>>>0);
   
   if (!($375)) {
    $nb$0 = $276;
    break;
   }
   $376 = $v$3$lcssa$i;
   $expanded75 = 2360;
   $gep_int553 = 2360;
   $gep554 = (($gep_int553) + 16)|0;
   $expanded74 = $gep554;
   $377 = HEAP32[$expanded74>>2]|0;
   $378 = ($376>>>0)<($377>>>0);
   
   if ($378) {
    _abort();
    // unreachable
   }
   $gep_int555 = $v$3$lcssa$i;
   $gep556 = (($gep_int555) + ($276))|0;
   $379 = $gep556;
   $380 = $379;
   $381 = ($376>>>0)<($379>>>0);
   
   if (!($381)) {
    _abort();
    // unreachable
   }
   $gep_int557 = $v$3$lcssa$i;
   $gep558 = (($gep_int557) + 24)|0;
   $382 = $gep558;
   $383 = HEAP32[$382>>2]|0;
   $gep_int559 = $v$3$lcssa$i;
   $gep560 = (($gep_int559) + 12)|0;
   $384 = $gep560;
   $385 = HEAP32[$384>>2]|0;
   $386 = ($385|0)==($v$3$lcssa$i|0);
   
   do {
    if ($386) {
     $gep_int567 = $v$3$lcssa$i;
     $gep568 = (($gep_int567) + 20)|0;
     $397 = $gep568;
     $398 = HEAP32[$397>>2]|0;
     $399 = ($398|0)==(0);
     
     if ($399) {
      $gep_int569 = $v$3$lcssa$i;
      $gep570 = (($gep_int569) + 16)|0;
      $400 = $gep570;
      $401 = HEAP32[$400>>2]|0;
      $402 = ($401|0)==(0);
      
      if ($402) {
       $R$1$i22 = 0;
       break;
      } else {
       $R$0$i20 = $401;$RP$0$i19 = $400;
      }
     } else {
      $R$0$i20 = $398;$RP$0$i19 = $397;
     }
     while(1) {
      
      
      $gep_int571 = $R$0$i20;
      $gep572 = (($gep_int571) + 20)|0;
      $403 = $gep572;
      $404 = HEAP32[$403>>2]|0;
      $405 = ($404|0)==(0);
      
      if (!($405)) {
       $RP$0$i19$phi = $403;$R$0$i20$phi = $404;$RP$0$i19 = $RP$0$i19$phi;$R$0$i20 = $R$0$i20$phi;
       continue;
      }
      $gep_int573 = $R$0$i20;
      $gep574 = (($gep_int573) + 16)|0;
      $406 = $gep574;
      $407 = HEAP32[$406>>2]|0;
      $408 = ($407|0)==(0);
      
      if ($408) {
       break;
      } else {
       $R$0$i20 = $407;$RP$0$i19 = $406;
      }
     }
     $409 = $RP$0$i19;
     $410 = ($409>>>0)<($377>>>0);
     
     if ($410) {
      _abort();
      // unreachable
     } else {
      HEAP32[$RP$0$i19>>2] = 0;
      
      $R$1$i22 = $R$0$i20;
      break;
     }
    } else {
     $gep_int561 = $v$3$lcssa$i;
     $gep562 = (($gep_int561) + 8)|0;
     $387 = $gep562;
     $388 = HEAP32[$387>>2]|0;
     $389 = $388;
     $390 = ($389>>>0)<($377>>>0);
     
     if ($390) {
      _abort();
      // unreachable
     }
     $gep_int563 = $388;
     $gep564 = (($gep_int563) + 12)|0;
     $391 = $gep564;
     $392 = HEAP32[$391>>2]|0;
     $393 = ($392|0)==($v$3$lcssa$i|0);
     
     if (!($393)) {
      _abort();
      // unreachable
     }
     $gep_int565 = $385;
     $gep566 = (($gep_int565) + 8)|0;
     $394 = $gep566;
     $395 = HEAP32[$394>>2]|0;
     $396 = ($395|0)==($v$3$lcssa$i|0);
     
     if ($396) {
      HEAP32[$391>>2] = $385;
      HEAP32[$394>>2] = $388;
      
      $R$1$i22 = $385;
      break;
     } else {
      _abort();
      // unreachable
     }
    }
   } while(0);
   
   $411 = ($383|0)==(0);
   
   L176: do {
    if (!($411)) {
     $gep_int575 = $v$3$lcssa$i;
     $gep576 = (($gep_int575) + 28)|0;
     $412 = $gep576;
     $413 = HEAP32[$412>>2]|0;
     $expanded76 = 2360;
     $gep_int577 = 2360;
     $gep578 = (($gep_int577) + 304)|0;
     $gep_array579 = $413<<2;
     $gep580 = (($gep578) + ($gep_array579))|0;
     $414 = $gep580;
     $415 = HEAP32[$414>>2]|0;
     $416 = ($v$3$lcssa$i|0)==($415|0);
     
     do {
      if ($416) {
       HEAP32[$414>>2] = $R$1$i22;
       $cond$i23 = ($R$1$i22|0)==(0);
       
       if (!($cond$i23)) {
        break;
       }
       $417 = 1 << $413;
       $418 = $417 ^ -1;
       $expanded78 = 2360;
       $gep_int581 = 2360;
       $gep582 = (($gep_int581) + 4)|0;
       $expanded77 = $gep582;
       $419 = HEAP32[$expanded77>>2]|0;
       $420 = $419 & $418;
       $expanded80 = 2360;
       $gep_int583 = 2360;
       $gep584 = (($gep_int583) + 4)|0;
       $expanded79 = $gep584;
       HEAP32[$expanded79>>2] = $420;
       
       break L176;
      } else {
       $421 = $383;
       $expanded82 = 2360;
       $gep_int585 = 2360;
       $gep586 = (($gep_int585) + 16)|0;
       $expanded81 = $gep586;
       $422 = HEAP32[$expanded81>>2]|0;
       $423 = ($421>>>0)<($422>>>0);
       
       if ($423) {
        _abort();
        // unreachable
       }
       $gep_int587 = $383;
       $gep588 = (($gep_int587) + 16)|0;
       $424 = $gep588;
       $425 = HEAP32[$424>>2]|0;
       $426 = ($425|0)==($v$3$lcssa$i|0);
       
       if ($426) {
        HEAP32[$424>>2] = $R$1$i22;
        
       } else {
        $gep_int589 = $383;
        $gep590 = (($gep_int589) + 20)|0;
        $427 = $gep590;
        HEAP32[$427>>2] = $R$1$i22;
        
       }
       $428 = ($R$1$i22|0)==(0);
       
       if ($428) {
        break L176;
       }
      }
     } while(0);
     $429 = $R$1$i22;
     $expanded84 = 2360;
     $gep_int591 = 2360;
     $gep592 = (($gep_int591) + 16)|0;
     $expanded83 = $gep592;
     $430 = HEAP32[$expanded83>>2]|0;
     $431 = ($429>>>0)<($430>>>0);
     
     if ($431) {
      _abort();
      // unreachable
     }
     $gep_int593 = $R$1$i22;
     $gep594 = (($gep_int593) + 24)|0;
     $432 = $gep594;
     HEAP32[$432>>2] = $383;
     $gep_int595 = $v$3$lcssa$i;
     $gep596 = (($gep_int595) + 16)|0;
     $433 = $gep596;
     $434 = HEAP32[$433>>2]|0;
     $435 = ($434|0)==(0);
     
     do {
      if (!($435)) {
       $436 = $434;
       $expanded86 = 2360;
       $gep_int597 = 2360;
       $gep598 = (($gep_int597) + 16)|0;
       $expanded85 = $gep598;
       $437 = HEAP32[$expanded85>>2]|0;
       $438 = ($436>>>0)<($437>>>0);
       
       if ($438) {
        _abort();
        // unreachable
       } else {
        $gep_int599 = $R$1$i22;
        $gep600 = (($gep_int599) + 16)|0;
        $439 = $gep600;
        HEAP32[$439>>2] = $434;
        $gep_int601 = $434;
        $gep602 = (($gep_int601) + 24)|0;
        $440 = $gep602;
        HEAP32[$440>>2] = $R$1$i22;
        
        break;
       }
      }
     } while(0);
     $gep_int603 = $v$3$lcssa$i;
     $gep604 = (($gep_int603) + 20)|0;
     $441 = $gep604;
     $442 = HEAP32[$441>>2]|0;
     $443 = ($442|0)==(0);
     
     if ($443) {
      break;
     }
     $444 = $442;
     $expanded88 = 2360;
     $gep_int605 = 2360;
     $gep606 = (($gep_int605) + 16)|0;
     $expanded87 = $gep606;
     $445 = HEAP32[$expanded87>>2]|0;
     $446 = ($444>>>0)<($445>>>0);
     
     if ($446) {
      _abort();
      // unreachable
     } else {
      $gep_int607 = $R$1$i22;
      $gep608 = (($gep_int607) + 20)|0;
      $447 = $gep608;
      HEAP32[$447>>2] = $442;
      $gep_int609 = $442;
      $gep610 = (($gep_int609) + 24)|0;
      $448 = $gep610;
      HEAP32[$448>>2] = $R$1$i22;
      
      break;
     }
    }
   } while(0);
   $449 = ($rsize$3$lcssa$i>>>0)<(16);
   
   L204: do {
    if ($449) {
     $450 = (($rsize$3$lcssa$i) + ($276))|0;
     $451 = $450 | 3;
     $gep_int611 = $v$3$lcssa$i;
     $gep612 = (($gep_int611) + 4)|0;
     $452 = $gep612;
     HEAP32[$452>>2] = $451;
     $$sum19$i = (($450) + 4)|0;
     $gep_int613 = $v$3$lcssa$i;
     $gep614 = (($gep_int613) + ($$sum19$i))|0;
     $453 = $gep614;
     $454 = $453;
     $455 = HEAP32[$453>>2]|0;
     $456 = $455 | 1;
     HEAP32[$453>>2] = $456;
     
    } else {
     $457 = $276 | 3;
     $gep_int615 = $v$3$lcssa$i;
     $gep616 = (($gep_int615) + 4)|0;
     $458 = $gep616;
     HEAP32[$458>>2] = $457;
     $459 = $rsize$3$lcssa$i | 1;
     $$sum$i2536 = $276 | 4;
     $gep_int617 = $v$3$lcssa$i;
     $gep618 = (($gep_int617) + ($$sum$i2536))|0;
     $460 = $gep618;
     $461 = $460;
     HEAP32[$460>>2] = $459;
     $$sum1$i26 = (($rsize$3$lcssa$i) + ($276))|0;
     $gep_int619 = $v$3$lcssa$i;
     $gep620 = (($gep_int619) + ($$sum1$i26))|0;
     $462 = $gep620;
     $463 = $462;
     HEAP32[$462>>2] = $rsize$3$lcssa$i;
     $464 = $rsize$3$lcssa$i >>> 3;
     $465 = ($rsize$3$lcssa$i>>>0)<(256);
     
     if ($465) {
      $466 = $464 << 1;
      $expanded89 = 2360;
      $gep_int621 = 2360;
      $gep622 = (($gep_int621) + 40)|0;
      $gep_array623 = $466<<2;
      $gep624 = (($gep622) + ($gep_array623))|0;
      $467 = $gep624;
      $468 = $467;
      $expanded91 = 2360;
      $gep_int625 = 2360;
      $expanded90 = $gep_int625;
      $469 = HEAP32[$expanded90>>2]|0;
      $470 = 1 << $464;
      $471 = $469 & $470;
      $472 = ($471|0)==(0);
      
      do {
       if ($472) {
        $473 = $469 | $470;
        $expanded93 = 2360;
        $gep_int626 = 2360;
        $expanded92 = $gep_int626;
        HEAP32[$expanded92>>2] = $473;
        $$sum15$pre$i = (($466) + 2)|0;
        $expanded94 = 2360;
        $gep_int627 = 2360;
        $gep628 = (($gep_int627) + 40)|0;
        $gep_array629 = $$sum15$pre$i<<2;
        $gep630 = (($gep628) + ($gep_array629))|0;
        $$pre$i27 = $gep630;
        
        $$pre$phi$i28Z2D = $$pre$i27;$F5$0$i = $468;
       } else {
        $$sum18$i = (($466) + 2)|0;
        $expanded95 = 2360;
        $gep_int631 = 2360;
        $gep632 = (($gep_int631) + 40)|0;
        $gep_array633 = $$sum18$i<<2;
        $gep634 = (($gep632) + ($gep_array633))|0;
        $474 = $gep634;
        $475 = HEAP32[$474>>2]|0;
        $476 = $475;
        $expanded97 = 2360;
        $gep_int635 = 2360;
        $gep636 = (($gep_int635) + 16)|0;
        $expanded96 = $gep636;
        $477 = HEAP32[$expanded96>>2]|0;
        $478 = ($476>>>0)<($477>>>0);
        
        if (!($478)) {
         $$pre$phi$i28Z2D = $474;$F5$0$i = $475;
         break;
        }
        _abort();
        // unreachable
       }
      } while(0);
      
      
      HEAP32[$$pre$phi$i28Z2D>>2] = $380;
      $gep_int637 = $F5$0$i;
      $gep638 = (($gep_int637) + 12)|0;
      $479 = $gep638;
      HEAP32[$479>>2] = $380;
      $$sum16$i = (($276) + 8)|0;
      $gep_int639 = $v$3$lcssa$i;
      $gep640 = (($gep_int639) + ($$sum16$i))|0;
      $480 = $gep640;
      $481 = $480;
      HEAP32[$480>>2] = $F5$0$i;
      $$sum17$i = (($276) + 12)|0;
      $gep_int641 = $v$3$lcssa$i;
      $gep642 = (($gep_int641) + ($$sum17$i))|0;
      $482 = $gep642;
      $483 = $482;
      HEAP32[$482>>2] = $468;
      
      break;
     }
     $484 = $379;
     $485 = $rsize$3$lcssa$i >>> 8;
     $486 = ($485|0)==(0);
     
     do {
      if ($486) {
       $I7$0$i = 0;
      } else {
       $487 = ($rsize$3$lcssa$i>>>0)>(16777215);
       
       if ($487) {
        $I7$0$i = 31;
        break;
       }
       $488 = (($485) + 1048320)|0;
       $489 = $488 >>> 16;
       $490 = $489 & 8;
       $491 = $485 << $490;
       $492 = (($491) + 520192)|0;
       $493 = $492 >>> 16;
       $494 = $493 & 4;
       $495 = $494 | $490;
       $496 = $491 << $494;
       $497 = (($496) + 245760)|0;
       $498 = $497 >>> 16;
       $499 = $498 & 2;
       $500 = $495 | $499;
       $501 = (14 - ($500))|0;
       $502 = $496 << $499;
       $503 = $502 >>> 15;
       $504 = (($501) + ($503))|0;
       $505 = $504 << 1;
       $506 = (($504) + 7)|0;
       $507 = $rsize$3$lcssa$i >>> $506;
       $508 = $507 & 1;
       $509 = $508 | $505;
       
       $I7$0$i = $509;
      }
     } while(0);
     
     $expanded98 = 2360;
     $gep_int643 = 2360;
     $gep644 = (($gep_int643) + 304)|0;
     $gep_array645 = $I7$0$i<<2;
     $gep646 = (($gep644) + ($gep_array645))|0;
     $510 = $gep646;
     $$sum2$i = (($276) + 28)|0;
     $gep_int647 = $v$3$lcssa$i;
     $gep648 = (($gep_int647) + ($$sum2$i))|0;
     $511 = $gep648;
     $512 = $511;
     HEAP32[$511>>2] = $I7$0$i;
     $$sum3$i29 = (($276) + 16)|0;
     $gep_int649 = $v$3$lcssa$i;
     $gep650 = (($gep_int649) + ($$sum3$i29))|0;
     $513 = $gep650;
     $$sum4$i30 = (($276) + 20)|0;
     $gep_int651 = $v$3$lcssa$i;
     $gep652 = (($gep_int651) + ($$sum4$i30))|0;
     $514 = $gep652;
     $515 = $514;
     HEAP32[$514>>2] = 0;
     $516 = $513;
     HEAP32[$513>>2] = 0;
     $expanded100 = 2360;
     $gep_int653 = 2360;
     $gep654 = (($gep_int653) + 4)|0;
     $expanded99 = $gep654;
     $517 = HEAP32[$expanded99>>2]|0;
     $518 = 1 << $I7$0$i;
     $519 = $517 & $518;
     $520 = ($519|0)==(0);
     
     if ($520) {
      $521 = $517 | $518;
      $expanded102 = 2360;
      $gep_int655 = 2360;
      $gep656 = (($gep_int655) + 4)|0;
      $expanded101 = $gep656;
      HEAP32[$expanded101>>2] = $521;
      HEAP32[$510>>2] = $484;
      $522 = $510;
      $$sum5$i = (($276) + 24)|0;
      $gep_int657 = $v$3$lcssa$i;
      $gep658 = (($gep_int657) + ($$sum5$i))|0;
      $523 = $gep658;
      $524 = $523;
      HEAP32[$523>>2] = $522;
      $$sum6$i = (($276) + 12)|0;
      $gep_int659 = $v$3$lcssa$i;
      $gep660 = (($gep_int659) + ($$sum6$i))|0;
      $525 = $gep660;
      $526 = $525;
      HEAP32[$525>>2] = $484;
      $$sum7$i = (($276) + 8)|0;
      $gep_int661 = $v$3$lcssa$i;
      $gep662 = (($gep_int661) + ($$sum7$i))|0;
      $527 = $gep662;
      $528 = $527;
      HEAP32[$527>>2] = $484;
      
      break;
     }
     $529 = HEAP32[$510>>2]|0;
     $530 = ($I7$0$i|0)==(31);
     
     if ($530) {
      $533 = 0;
     } else {
      $531 = $I7$0$i >>> 1;
      $532 = (25 - ($531))|0;
      
      $533 = $532;
     }
     
     $gep_int663 = $529;
     $gep664 = (($gep_int663) + 4)|0;
     $534 = $gep664;
     $535 = HEAP32[$534>>2]|0;
     $536 = $535 & -8;
     $537 = ($536|0)==($rsize$3$lcssa$i|0);
     
     L224: do {
      if ($537) {
       $T$0$lcssa$i = $529;
      } else {
       $538 = $rsize$3$lcssa$i << $533;
       
       $K12$027$i = $538;$T$026$i = $529;
       while(1) {
        
        
        $544 = $K12$027$i >>> 31;
        $gep_int667 = $T$026$i;
        $gep668 = (($gep_int667) + 16)|0;
        $gep_array669 = $544<<2;
        $gep670 = (($gep668) + ($gep_array669))|0;
        $545 = $gep670;
        $546 = HEAP32[$545>>2]|0;
        $547 = ($546|0)==(0);
        
        if ($547) {
         break;
        }
        $539 = $K12$027$i << 1;
        $gep_int665 = $546;
        $gep666 = (($gep_int665) + 4)|0;
        $540 = $gep666;
        $541 = HEAP32[$540>>2]|0;
        $542 = $541 & -8;
        $543 = ($542|0)==($rsize$3$lcssa$i|0);
        
        if ($543) {
         $T$0$lcssa$i = $546;
         break L224;
        } else {
         $T$026$i$phi = $546;$K12$027$i = $539;$T$026$i = $T$026$i$phi;
        }
       }
       $548 = $545;
       $expanded104 = 2360;
       $gep_int671 = 2360;
       $gep672 = (($gep_int671) + 16)|0;
       $expanded103 = $gep672;
       $549 = HEAP32[$expanded103>>2]|0;
       $550 = ($548>>>0)<($549>>>0);
       
       if ($550) {
        _abort();
        // unreachable
       } else {
        HEAP32[$545>>2] = $484;
        $$sum12$i = (($276) + 24)|0;
        $gep_int673 = $v$3$lcssa$i;
        $gep674 = (($gep_int673) + ($$sum12$i))|0;
        $551 = $gep674;
        $552 = $551;
        HEAP32[$551>>2] = $T$026$i;
        $$sum13$i = (($276) + 12)|0;
        $gep_int675 = $v$3$lcssa$i;
        $gep676 = (($gep_int675) + ($$sum13$i))|0;
        $553 = $gep676;
        $554 = $553;
        HEAP32[$553>>2] = $484;
        $$sum14$i = (($276) + 8)|0;
        $gep_int677 = $v$3$lcssa$i;
        $gep678 = (($gep_int677) + ($$sum14$i))|0;
        $555 = $gep678;
        $556 = $555;
        HEAP32[$555>>2] = $484;
        
        break L204;
       }
      }
     } while(0);
     
     $gep_int679 = $T$0$lcssa$i;
     $gep680 = (($gep_int679) + 8)|0;
     $557 = $gep680;
     $558 = HEAP32[$557>>2]|0;
     $559 = $T$0$lcssa$i;
     $expanded106 = 2360;
     $gep_int681 = 2360;
     $gep682 = (($gep_int681) + 16)|0;
     $expanded105 = $gep682;
     $560 = HEAP32[$expanded105>>2]|0;
     $561 = ($559>>>0)<($560>>>0);
     
     if ($561) {
      _abort();
      // unreachable
     }
     $562 = $558;
     $563 = ($562>>>0)<($560>>>0);
     
     if ($563) {
      _abort();
      // unreachable
     } else {
      $gep_int683 = $558;
      $gep684 = (($gep_int683) + 12)|0;
      $564 = $gep684;
      HEAP32[$564>>2] = $484;
      HEAP32[$557>>2] = $484;
      $$sum9$i = (($276) + 8)|0;
      $gep_int685 = $v$3$lcssa$i;
      $gep686 = (($gep_int685) + ($$sum9$i))|0;
      $565 = $gep686;
      $566 = $565;
      HEAP32[$565>>2] = $558;
      $$sum10$i = (($276) + 12)|0;
      $gep_int687 = $v$3$lcssa$i;
      $gep688 = (($gep_int687) + ($$sum10$i))|0;
      $567 = $gep688;
      $568 = $567;
      HEAP32[$567>>2] = $T$0$lcssa$i;
      $$sum11$i = (($276) + 24)|0;
      $gep_int689 = $v$3$lcssa$i;
      $gep690 = (($gep_int689) + ($$sum11$i))|0;
      $569 = $gep690;
      $570 = $569;
      HEAP32[$569>>2] = 0;
      
      break;
     }
    }
   } while(0);
   $gep_int691 = $v$3$lcssa$i;
   $gep692 = (($gep_int691) + 8)|0;
   $571 = $gep692;
   $572 = $571;
   
   $mem$0 = $572;
   
   STACKTOP = sp;return $mem$0|0;
  }
 } while(0);
 
 $expanded108 = 2360;
 $gep_int693 = 2360;
 $gep694 = (($gep_int693) + 8)|0;
 $expanded107 = $gep694;
 $573 = HEAP32[$expanded107>>2]|0;
 $574 = ($nb$0>>>0)>($573>>>0);
 
 if (!($574)) {
  $575 = (($573) - ($nb$0))|0;
  $expanded110 = 2360;
  $gep_int695 = 2360;
  $gep696 = (($gep_int695) + 20)|0;
  $expanded109 = $gep696;
  $576 = HEAP32[$expanded109>>2]|0;
  $577 = ($575>>>0)>(15);
  
  if ($577) {
   $578 = $576;
   $gep_int697 = $576;
   $gep698 = (($gep_int697) + ($nb$0))|0;
   $579 = $gep698;
   $580 = $579;
   $expanded112 = 2360;
   $gep_int699 = 2360;
   $gep700 = (($gep_int699) + 20)|0;
   $expanded111 = $gep700;
   HEAP32[$expanded111>>2] = $580;
   $expanded114 = 2360;
   $gep_int701 = 2360;
   $gep702 = (($gep_int701) + 8)|0;
   $expanded113 = $gep702;
   HEAP32[$expanded113>>2] = $575;
   $581 = $575 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $gep_int703 = $576;
   $gep704 = (($gep_int703) + ($$sum2))|0;
   $582 = $gep704;
   $583 = $582;
   HEAP32[$582>>2] = $581;
   $gep_int705 = $576;
   $gep706 = (($gep_int705) + ($573))|0;
   $584 = $gep706;
   $585 = $584;
   HEAP32[$584>>2] = $575;
   $586 = $nb$0 | 3;
   $gep_int707 = $576;
   $gep708 = (($gep_int707) + 4)|0;
   $587 = $gep708;
   HEAP32[$587>>2] = $586;
   
  } else {
   $expanded116 = 2360;
   $gep_int709 = 2360;
   $gep710 = (($gep_int709) + 8)|0;
   $expanded115 = $gep710;
   HEAP32[$expanded115>>2] = 0;
   $expanded118 = 2360;
   $gep_int711 = 2360;
   $gep712 = (($gep_int711) + 20)|0;
   $expanded117 = $gep712;
   HEAP32[$expanded117>>2] = 0;
   $588 = $573 | 3;
   $gep_int713 = $576;
   $gep714 = (($gep_int713) + 4)|0;
   $589 = $gep714;
   HEAP32[$589>>2] = $588;
   $590 = $576;
   $$sum1 = (($573) + 4)|0;
   $gep_int715 = $576;
   $gep716 = (($gep_int715) + ($$sum1))|0;
   $591 = $gep716;
   $592 = $591;
   $593 = HEAP32[$591>>2]|0;
   $594 = $593 | 1;
   HEAP32[$591>>2] = $594;
   
  }
  $gep_int717 = $576;
  $gep718 = (($gep_int717) + 8)|0;
  $595 = $gep718;
  $596 = $595;
  
  $mem$0 = $596;
  
  STACKTOP = sp;return $mem$0|0;
 }
 $expanded120 = 2360;
 $gep_int719 = 2360;
 $gep720 = (($gep_int719) + 12)|0;
 $expanded119 = $gep720;
 $597 = HEAP32[$expanded119>>2]|0;
 $598 = ($nb$0>>>0)<($597>>>0);
 
 if ($598) {
  $599 = (($597) - ($nb$0))|0;
  $expanded122 = 2360;
  $gep_int721 = 2360;
  $gep722 = (($gep_int721) + 12)|0;
  $expanded121 = $gep722;
  HEAP32[$expanded121>>2] = $599;
  $expanded124 = 2360;
  $gep_int723 = 2360;
  $gep724 = (($gep_int723) + 24)|0;
  $expanded123 = $gep724;
  $600 = HEAP32[$expanded123>>2]|0;
  $601 = $600;
  $gep_int725 = $600;
  $gep726 = (($gep_int725) + ($nb$0))|0;
  $602 = $gep726;
  $603 = $602;
  $expanded126 = 2360;
  $gep_int727 = 2360;
  $gep728 = (($gep_int727) + 24)|0;
  $expanded125 = $gep728;
  HEAP32[$expanded125>>2] = $603;
  $604 = $599 | 1;
  $$sum = (($nb$0) + 4)|0;
  $gep_int729 = $600;
  $gep730 = (($gep_int729) + ($$sum))|0;
  $605 = $gep730;
  $606 = $605;
  HEAP32[$605>>2] = $604;
  $607 = $nb$0 | 3;
  $gep_int731 = $600;
  $gep732 = (($gep_int731) + 4)|0;
  $608 = $gep732;
  HEAP32[$608>>2] = $607;
  $gep_int733 = $600;
  $gep734 = (($gep_int733) + 8)|0;
  $609 = $gep734;
  $610 = $609;
  
  $mem$0 = $610;
  
  STACKTOP = sp;return $mem$0|0;
 }
 $expanded128 = 2832;
 $gep_int735 = 2832;
 $expanded127 = $gep_int735;
 $611 = HEAP32[$expanded127>>2]|0;
 $612 = ($611|0)==(0);
 
 do {
  if ($612) {
   $613 = _sysconf(30)|0;
   $614 = (($613) + -1)|0;
   $615 = $614 & $613;
   $616 = ($615|0)==(0);
   
   if ($616) {
    $expanded130 = 2832;
    $gep_int736 = 2832;
    $gep737 = (($gep_int736) + 8)|0;
    $expanded129 = $gep737;
    HEAP32[$expanded129>>2] = $613;
    $expanded132 = 2832;
    $gep_int738 = 2832;
    $gep739 = (($gep_int738) + 4)|0;
    $expanded131 = $gep739;
    HEAP32[$expanded131>>2] = $613;
    $expanded134 = 2832;
    $gep_int740 = 2832;
    $gep741 = (($gep_int740) + 12)|0;
    $expanded133 = $gep741;
    HEAP32[$expanded133>>2] = -1;
    $expanded136 = 2832;
    $gep_int742 = 2832;
    $gep743 = (($gep_int742) + 16)|0;
    $expanded135 = $gep743;
    HEAP32[$expanded135>>2] = -1;
    $expanded138 = 2832;
    $gep_int744 = 2832;
    $gep745 = (($gep_int744) + 20)|0;
    $expanded137 = $gep745;
    HEAP32[$expanded137>>2] = 0;
    $expanded140 = 2360;
    $gep_int746 = 2360;
    $gep747 = (($gep_int746) + 444)|0;
    $expanded139 = $gep747;
    HEAP32[$expanded139>>2] = 0;
    $expanded141 = 1;
    $617 = _time(0)|0;
    $618 = $617 & -16;
    $619 = $618 ^ 1431655768;
    $expanded143 = 2832;
    $gep_int748 = 2832;
    $expanded142 = $gep_int748;
    HEAP32[$expanded142>>2] = $619;
    
    break;
   } else {
    _abort();
    // unreachable
   }
  }
 } while(0);
 $620 = (($nb$0) + 48)|0;
 $expanded145 = 2832;
 $gep_int749 = 2832;
 $gep750 = (($gep_int749) + 8)|0;
 $expanded144 = $gep750;
 $621 = HEAP32[$expanded144>>2]|0;
 $622 = (($nb$0) + 47)|0;
 $623 = (($621) + ($622))|0;
 $624 = (0 - ($621))|0;
 $625 = $623 & $624;
 $626 = ($625>>>0)>($nb$0>>>0);
 
 if (!($626)) {
  $mem$0 = 0;
  
  STACKTOP = sp;return $mem$0|0;
 }
 $expanded147 = 2360;
 $gep_int751 = 2360;
 $gep752 = (($gep_int751) + 440)|0;
 $expanded146 = $gep752;
 $627 = HEAP32[$expanded146>>2]|0;
 $628 = ($627|0)==(0);
 
 do {
  if (!($628)) {
   $expanded149 = 2360;
   $gep_int753 = 2360;
   $gep754 = (($gep_int753) + 432)|0;
   $expanded148 = $gep754;
   $629 = HEAP32[$expanded148>>2]|0;
   $630 = (($629) + ($625))|0;
   $631 = ($630>>>0)<=($629>>>0);
   $632 = ($630>>>0)>($627>>>0);
   $or$cond1$i = $631 | $632;
   
   if ($or$cond1$i) {
    $mem$0 = 0;
   } else {
    break;
   }
   
   STACKTOP = sp;return $mem$0|0;
  }
 } while(0);
 $expanded151 = 2360;
 $gep_int755 = 2360;
 $gep756 = (($gep_int755) + 444)|0;
 $expanded150 = $gep756;
 $633 = HEAP32[$expanded150>>2]|0;
 $634 = $633 & 4;
 $635 = ($634|0)==(0);
 
 L269: do {
  if ($635) {
   $expanded153 = 2360;
   $gep_int757 = 2360;
   $gep758 = (($gep_int757) + 24)|0;
   $expanded152 = $gep758;
   $636 = HEAP32[$expanded152>>2]|0;
   $637 = ($636|0)==(0);
   
   L271: do {
    if ($637) {
     label = 182;
    } else {
     $638 = $636;
     $expanded155 = 2360;
     $gep_int759 = 2360;
     $gep760 = (($gep_int759) + 448)|0;
     $expanded154 = $gep760;
     
     $sp$0$i$i = $expanded154;
     while(1) {
      
      $gep_int761 = $sp$0$i$i;
      $639 = $gep_int761;
      $640 = HEAP32[$639>>2]|0;
      $641 = ($640>>>0)>($638>>>0);
      
      if (!($641)) {
       $gep_int762 = $sp$0$i$i;
       $gep763 = (($gep_int762) + 4)|0;
       $642 = $gep763;
       $643 = HEAP32[$642>>2]|0;
       $gep_int764 = $640;
       $gep765 = (($gep_int764) + ($643))|0;
       $644 = $gep765;
       $645 = ($644>>>0)>($638>>>0);
       
       if ($645) {
        break;
       }
      }
      $gep_int766 = $sp$0$i$i;
      $gep767 = (($gep_int766) + 8)|0;
      $646 = $gep767;
      $647 = HEAP32[$646>>2]|0;
      $648 = ($647|0)==(0);
      
      if ($648) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $647;
      }
     }
     $649 = ($sp$0$i$i|0)==(0);
     
     if ($649) {
      label = 182;
      break;
     }
     $expanded165 = 2360;
     $gep_int774 = 2360;
     $gep775 = (($gep_int774) + 12)|0;
     $expanded164 = $gep775;
     $672 = HEAP32[$expanded164>>2]|0;
     $673 = (($623) - ($672))|0;
     $674 = $673 & $624;
     $675 = ($674>>>0)<(2147483647);
     
     if (!($675)) {
      $tsize$0323841$i = 0;
      break;
     }
     $676 = _sbrk($674|0)|0;
     $677 = HEAP32[$639>>2]|0;
     $678 = HEAP32[$642>>2]|0;
     $gep_int776 = $677;
     $gep777 = (($gep_int776) + ($678))|0;
     $679 = $gep777;
     $680 = ($676|0)==($679|0);
     $$3$i = $680 ? $674 : 0;
     $expanded166 = -1;
     $$4$i = $680 ? $676 : $expanded166;
     
     $br$0$i = $676;$ssize$1$i = $674;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
     label = 191;
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $650 = _sbrk(0)|0;
     $expanded156 = -1;
     $651 = ($650|0)==($expanded156|0);
     
     if ($651) {
      $tsize$0323841$i = 0;
      break;
     }
     $652 = $650;
     $expanded158 = 2832;
     $gep_int768 = 2832;
     $gep769 = (($gep_int768) + 4)|0;
     $expanded157 = $gep769;
     $653 = HEAP32[$expanded157>>2]|0;
     $654 = (($653) + -1)|0;
     $655 = $654 & $652;
     $656 = ($655|0)==(0);
     
     if ($656) {
      $ssize$0$i = $625;
     } else {
      $657 = (($654) + ($652))|0;
      $658 = (0 - ($653))|0;
      $659 = $657 & $658;
      $660 = (($625) - ($652))|0;
      $661 = (($660) + ($659))|0;
      
      $ssize$0$i = $661;
     }
     
     $expanded160 = 2360;
     $gep_int770 = 2360;
     $gep771 = (($gep_int770) + 432)|0;
     $expanded159 = $gep771;
     $662 = HEAP32[$expanded159>>2]|0;
     $663 = (($662) + ($ssize$0$i))|0;
     $664 = ($ssize$0$i>>>0)>($nb$0>>>0);
     $665 = ($ssize$0$i>>>0)<(2147483647);
     $or$cond$i31 = $664 & $665;
     
     if (!($or$cond$i31)) {
      $tsize$0323841$i = 0;
      break;
     }
     $expanded162 = 2360;
     $gep_int772 = 2360;
     $gep773 = (($gep_int772) + 440)|0;
     $expanded161 = $gep773;
     $666 = HEAP32[$expanded161>>2]|0;
     $667 = ($666|0)==(0);
     
     if (!($667)) {
      $668 = ($663>>>0)<=($662>>>0);
      $669 = ($663>>>0)>($666>>>0);
      $or$cond2$i = $668 | $669;
      
      if ($or$cond2$i) {
       $tsize$0323841$i = 0;
       break;
      }
     }
     $670 = _sbrk($ssize$0$i|0)|0;
     $671 = ($670|0)==($650|0);
     $ssize$0$$i = $671 ? $ssize$0$i : 0;
     $expanded163 = -1;
     $$$i = $671 ? $650 : $expanded163;
     
     $br$0$i = $670;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
     label = 191;
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     
     
     
     
     $681 = (0 - ($ssize$1$i))|0;
     $expanded167 = -1;
     $682 = ($tbase$0$i|0)==($expanded167|0);
     
     if (!($682)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $expanded168 = -1;
     $683 = ($br$0$i|0)!=($expanded168|0);
     $684 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $683 & $684;
     $685 = ($ssize$1$i>>>0)<($620>>>0);
     $or$cond6$i = $or$cond5$i & $685;
     
     do {
      if ($or$cond6$i) {
       $expanded170 = 2832;
       $gep_int778 = 2832;
       $gep779 = (($gep_int778) + 8)|0;
       $expanded169 = $gep779;
       $686 = HEAP32[$expanded169>>2]|0;
       $687 = (($622) - ($ssize$1$i))|0;
       $688 = (($687) + ($686))|0;
       $689 = (0 - ($686))|0;
       $690 = $688 & $689;
       $691 = ($690>>>0)<(2147483647);
       
       if (!($691)) {
        $ssize$2$i = $ssize$1$i;
        break;
       }
       $692 = _sbrk($690|0)|0;
       $expanded171 = -1;
       $693 = ($692|0)==($expanded171|0);
       
       if ($693) {
        u$318 = _sbrk($681|0)|0;
        
        $tsize$0323841$i = $tsize$0$i;
        break L291;
       } else {
        $694 = (($690) + ($ssize$1$i))|0;
        
        $ssize$2$i = $694;
        break;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     
     $expanded172 = -1;
     $695 = ($br$0$i|0)==($expanded172|0);
     
     if ($695) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   
   $expanded174 = 2360;
   $gep_int780 = 2360;
   $gep781 = (($gep_int780) + 444)|0;
   $expanded173 = $gep781;
   $696 = HEAP32[$expanded173>>2]|0;
   $697 = $696 | 4;
   $expanded176 = 2360;
   $gep_int782 = 2360;
   $gep783 = (($gep_int782) + 444)|0;
   $expanded175 = $gep783;
   HEAP32[$expanded175>>2] = $697;
   
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 do {
  if ((label|0) == 199) {
   
   $698 = ($625>>>0)<(2147483647);
   
   if (!($698)) {
    break;
   }
   $699 = _sbrk($625|0)|0;
   $700 = _sbrk(0)|0;
   $expanded177 = -1;
   $notlhs$i = ($699|0)!=($expanded177|0);
   $expanded178 = -1;
   $notrhs$i = ($700|0)!=($expanded178|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $701 = ($699>>>0)<($700>>>0);
   $or$cond9$i = $or$cond8$not$i & $701;
   
   if (!($or$cond9$i)) {
    break;
   }
   $702 = $700;
   $703 = $699;
   $704 = (($702) - ($703))|0;
   $705 = (($nb$0) + 40)|0;
   $706 = ($704>>>0)>($705>>>0);
   $$tsize$1$i = $706 ? $704 : $tsize$1$i;
   
   if ($706) {
    $tbase$247$i = $699;$tsize$246$i = $$tsize$1$i;
    label = 202;
   }
  }
 } while(0);
 do {
  if ((label|0) == 202) {
   
   
   $expanded180 = 2360;
   $gep_int784 = 2360;
   $gep785 = (($gep_int784) + 432)|0;
   $expanded179 = $gep785;
   $707 = HEAP32[$expanded179>>2]|0;
   $708 = (($707) + ($tsize$246$i))|0;
   $expanded182 = 2360;
   $gep_int786 = 2360;
   $gep787 = (($gep_int786) + 432)|0;
   $expanded181 = $gep787;
   HEAP32[$expanded181>>2] = $708;
   $expanded184 = 2360;
   $gep_int788 = 2360;
   $gep789 = (($gep_int788) + 436)|0;
   $expanded183 = $gep789;
   $709 = HEAP32[$expanded183>>2]|0;
   $710 = ($708>>>0)>($709>>>0);
   
   if ($710) {
    $expanded186 = 2360;
    $gep_int790 = 2360;
    $gep791 = (($gep_int790) + 436)|0;
    $expanded185 = $gep791;
    HEAP32[$expanded185>>2] = $708;
    
   }
   $expanded188 = 2360;
   $gep_int792 = 2360;
   $gep793 = (($gep_int792) + 24)|0;
   $expanded187 = $gep793;
   $711 = HEAP32[$expanded187>>2]|0;
   $712 = ($711|0)==(0);
   $expanded217 = 2360;
   $gep_int794 = 2360;
   $gep795 = (($gep_int794) + 448)|0;
   $expanded216 = $gep795;
   
   L311: do {
    if ($712) {
     $expanded190 = 2360;
     $gep_int796 = 2360;
     $gep797 = (($gep_int796) + 16)|0;
     $expanded189 = $gep797;
     $713 = HEAP32[$expanded189>>2]|0;
     $714 = ($713|0)==(0);
     $715 = ($tbase$247$i>>>0)<($713>>>0);
     $or$cond10$i = $714 | $715;
     
     if ($or$cond10$i) {
      $expanded192 = 2360;
      $gep_int798 = 2360;
      $gep799 = (($gep_int798) + 16)|0;
      $expanded191 = $gep799;
      HEAP32[$expanded191>>2] = $tbase$247$i;
      
     }
     $expanded194 = 2360;
     $gep_int800 = 2360;
     $gep801 = (($gep_int800) + 448)|0;
     $expanded193 = $gep801;
     HEAP32[$expanded193>>2] = $tbase$247$i;
     $expanded196 = 2360;
     $gep_int802 = 2360;
     $gep803 = (($gep_int802) + 452)|0;
     $expanded195 = $gep803;
     HEAP32[$expanded195>>2] = $tsize$246$i;
     $expanded198 = 2360;
     $gep_int804 = 2360;
     $gep805 = (($gep_int804) + 460)|0;
     $expanded197 = $gep805;
     HEAP32[$expanded197>>2] = 0;
     $expanded200 = 2832;
     $gep_int806 = 2832;
     $expanded199 = $gep_int806;
     $716 = HEAP32[$expanded199>>2]|0;
     $expanded202 = 2360;
     $gep_int807 = 2360;
     $gep808 = (($gep_int807) + 36)|0;
     $expanded201 = $gep808;
     HEAP32[$expanded201>>2] = $716;
     $expanded204 = 2360;
     $gep_int809 = 2360;
     $gep810 = (($gep_int809) + 32)|0;
     $expanded203 = $gep810;
     HEAP32[$expanded203>>2] = -1;
     
     $i$02$i$i = 0;
     while(1) {
      
      $717 = $i$02$i$i << 1;
      $expanded205 = 2360;
      $gep_int811 = 2360;
      $gep812 = (($gep_int811) + 40)|0;
      $gep_array813 = $717<<2;
      $gep814 = (($gep812) + ($gep_array813))|0;
      $718 = $gep814;
      $719 = $718;
      $$sum$i$i = (($717) + 3)|0;
      $expanded206 = 2360;
      $gep_int815 = 2360;
      $gep816 = (($gep_int815) + 40)|0;
      $gep_array817 = $$sum$i$i<<2;
      $gep818 = (($gep816) + ($gep_array817))|0;
      $720 = $gep818;
      HEAP32[$720>>2] = $719;
      $$sum1$i$i = (($717) + 2)|0;
      $expanded207 = 2360;
      $gep_int819 = 2360;
      $gep820 = (($gep_int819) + 40)|0;
      $gep_array821 = $$sum1$i$i<<2;
      $gep822 = (($gep820) + ($gep_array821))|0;
      $721 = $gep822;
      HEAP32[$721>>2] = $719;
      $722 = (($i$02$i$i) + 1)|0;
      $723 = ($722>>>0)<(32);
      
      if ($723) {
       $i$02$i$i$phi = $722;$i$02$i$i = $i$02$i$i$phi;
      } else {
       break;
      }
     }
     $724 = (($tsize$246$i) + -40)|0;
     $gep_int823 = $tbase$247$i;
     $gep824 = (($gep_int823) + 8)|0;
     $725 = $gep824;
     $726 = $725;
     $727 = $726 & 7;
     $728 = ($727|0)==(0);
     
     if ($728) {
      $731 = 0;
     } else {
      $729 = (0 - ($726))|0;
      $730 = $729 & 7;
      
      $731 = $730;
     }
     
     $gep_int825 = $tbase$247$i;
     $gep826 = (($gep_int825) + ($731))|0;
     $732 = $gep826;
     $733 = $732;
     $734 = (($724) - ($731))|0;
     $expanded209 = 2360;
     $gep_int827 = 2360;
     $gep828 = (($gep_int827) + 24)|0;
     $expanded208 = $gep828;
     HEAP32[$expanded208>>2] = $733;
     $expanded211 = 2360;
     $gep_int829 = 2360;
     $gep830 = (($gep_int829) + 12)|0;
     $expanded210 = $gep830;
     HEAP32[$expanded210>>2] = $734;
     $735 = $734 | 1;
     $$sum$i14$i = (($731) + 4)|0;
     $gep_int831 = $tbase$247$i;
     $gep832 = (($gep_int831) + ($$sum$i14$i))|0;
     $736 = $gep832;
     $737 = $736;
     HEAP32[$736>>2] = $735;
     $$sum2$i$i = (($tsize$246$i) + -36)|0;
     $gep_int833 = $tbase$247$i;
     $gep834 = (($gep_int833) + ($$sum2$i$i))|0;
     $738 = $gep834;
     $739 = $738;
     HEAP32[$738>>2] = 40;
     $expanded213 = 2832;
     $gep_int835 = 2832;
     $gep836 = (($gep_int835) + 16)|0;
     $expanded212 = $gep836;
     $740 = HEAP32[$expanded212>>2]|0;
     $expanded215 = 2360;
     $gep_int837 = 2360;
     $gep838 = (($gep_int837) + 28)|0;
     $expanded214 = $gep838;
     HEAP32[$expanded214>>2] = $740;
     
    } else {
     $sp$075$i = $expanded216;
     while(1) {
      
      $gep_int839 = $sp$075$i;
      $741 = $gep_int839;
      $742 = HEAP32[$741>>2]|0;
      $gep_int840 = $sp$075$i;
      $gep841 = (($gep_int840) + 4)|0;
      $743 = $gep841;
      $744 = HEAP32[$743>>2]|0;
      $gep_int842 = $742;
      $gep843 = (($gep_int842) + ($744))|0;
      $745 = $gep843;
      $746 = ($tbase$247$i|0)==($745|0);
      
      if ($746) {
       label = 214;
       break;
      }
      $gep_int844 = $sp$075$i;
      $gep845 = (($gep_int844) + 8)|0;
      $747 = $gep845;
      $748 = HEAP32[$747>>2]|0;
      $749 = ($748|0)==(0);
      
      if ($749) {
       break;
      } else {
       $sp$075$i = $748;
      }
     }
     do {
      if ((label|0) == 214) {
       $gep_int846 = $sp$075$i;
       $gep847 = (($gep_int846) + 12)|0;
       $750 = $gep847;
       $751 = HEAP32[$750>>2]|0;
       $752 = $751 & 8;
       $753 = ($752|0)==(0);
       
       if (!($753)) {
        break;
       }
       $754 = $711;
       $755 = ($754>>>0)>=($742>>>0);
       $756 = ($754>>>0)<($tbase$247$i>>>0);
       $or$cond49$i = $755 & $756;
       
       if (!($or$cond49$i)) {
        break;
       }
       $757 = (($744) + ($tsize$246$i))|0;
       HEAP32[$743>>2] = $757;
       $expanded219 = 2360;
       $gep_int848 = 2360;
       $gep849 = (($gep_int848) + 12)|0;
       $expanded218 = $gep849;
       $758 = HEAP32[$expanded218>>2]|0;
       $759 = (($758) + ($tsize$246$i))|0;
       $gep_int850 = $711;
       $gep851 = (($gep_int850) + 8)|0;
       $760 = $gep851;
       $761 = $760;
       $762 = $761 & 7;
       $763 = ($762|0)==(0);
       
       if ($763) {
        $766 = 0;
       } else {
        $764 = (0 - ($761))|0;
        $765 = $764 & 7;
        
        $766 = $765;
       }
       
       $gep_int852 = $711;
       $gep853 = (($gep_int852) + ($766))|0;
       $767 = $gep853;
       $768 = $767;
       $769 = (($759) - ($766))|0;
       $expanded221 = 2360;
       $gep_int854 = 2360;
       $gep855 = (($gep_int854) + 24)|0;
       $expanded220 = $gep855;
       HEAP32[$expanded220>>2] = $768;
       $expanded223 = 2360;
       $gep_int856 = 2360;
       $gep857 = (($gep_int856) + 12)|0;
       $expanded222 = $gep857;
       HEAP32[$expanded222>>2] = $769;
       $770 = $769 | 1;
       $$sum$i18$i = (($766) + 4)|0;
       $gep_int858 = $711;
       $gep859 = (($gep_int858) + ($$sum$i18$i))|0;
       $771 = $gep859;
       $772 = $771;
       HEAP32[$771>>2] = $770;
       $$sum2$i19$i = (($759) + 4)|0;
       $gep_int860 = $711;
       $gep861 = (($gep_int860) + ($$sum2$i19$i))|0;
       $773 = $gep861;
       $774 = $773;
       HEAP32[$773>>2] = 40;
       $expanded225 = 2832;
       $gep_int862 = 2832;
       $gep863 = (($gep_int862) + 16)|0;
       $expanded224 = $gep863;
       $775 = HEAP32[$expanded224>>2]|0;
       $expanded227 = 2360;
       $gep_int864 = 2360;
       $gep865 = (($gep_int864) + 28)|0;
       $expanded226 = $gep865;
       HEAP32[$expanded226>>2] = $775;
       
       break L311;
      }
     } while(0);
     $expanded229 = 2360;
     $gep_int866 = 2360;
     $gep867 = (($gep_int866) + 16)|0;
     $expanded228 = $gep867;
     $776 = HEAP32[$expanded228>>2]|0;
     $777 = ($tbase$247$i>>>0)<($776>>>0);
     
     if ($777) {
      $expanded231 = 2360;
      $gep_int868 = 2360;
      $gep869 = (($gep_int868) + 16)|0;
      $expanded230 = $gep869;
      HEAP32[$expanded230>>2] = $tbase$247$i;
      
     }
     $gep_int870 = $tbase$247$i;
     $gep871 = (($gep_int870) + ($tsize$246$i))|0;
     $778 = $gep871;
     $expanded233 = 2360;
     $gep_int872 = 2360;
     $gep873 = (($gep_int872) + 448)|0;
     $expanded232 = $gep873;
     
     $sp$168$i = $expanded232;
     while(1) {
      
      $gep_int874 = $sp$168$i;
      $779 = $gep_int874;
      $780 = HEAP32[$779>>2]|0;
      $781 = ($780|0)==($778|0);
      
      if ($781) {
       label = 224;
       break;
      }
      $gep_int875 = $sp$168$i;
      $gep876 = (($gep_int875) + 8)|0;
      $782 = $gep876;
      $783 = HEAP32[$782>>2]|0;
      $784 = ($783|0)==(0);
      
      if ($784) {
       break;
      } else {
       $sp$168$i = $783;
      }
     }
     do {
      if ((label|0) == 224) {
       $gep_int877 = $sp$168$i;
       $gep878 = (($gep_int877) + 12)|0;
       $785 = $gep878;
       $786 = HEAP32[$785>>2]|0;
       $787 = $786 & 8;
       $788 = ($787|0)==(0);
       
       if (!($788)) {
        break;
       }
       HEAP32[$779>>2] = $tbase$247$i;
       $gep_int879 = $sp$168$i;
       $gep880 = (($gep_int879) + 4)|0;
       $789 = $gep880;
       $790 = HEAP32[$789>>2]|0;
       $791 = (($790) + ($tsize$246$i))|0;
       HEAP32[$789>>2] = $791;
       $gep_int881 = $tbase$247$i;
       $gep882 = (($gep_int881) + 8)|0;
       $792 = $gep882;
       $793 = $792;
       $794 = $793 & 7;
       $795 = ($794|0)==(0);
       
       if ($795) {
        $798 = 0;
       } else {
        $796 = (0 - ($793))|0;
        $797 = $796 & 7;
        
        $798 = $797;
       }
       
       $gep_int883 = $tbase$247$i;
       $gep884 = (($gep_int883) + ($798))|0;
       $799 = $gep884;
       $$sum107$i = (($tsize$246$i) + 8)|0;
       $gep_int885 = $tbase$247$i;
       $gep886 = (($gep_int885) + ($$sum107$i))|0;
       $800 = $gep886;
       $801 = $800;
       $802 = $801 & 7;
       $803 = ($802|0)==(0);
       
       if ($803) {
        $806 = 0;
       } else {
        $804 = (0 - ($801))|0;
        $805 = $804 & 7;
        
        $806 = $805;
       }
       
       $$sum108$i = (($806) + ($tsize$246$i))|0;
       $gep_int887 = $tbase$247$i;
       $gep888 = (($gep_int887) + ($$sum108$i))|0;
       $807 = $gep888;
       $808 = $807;
       $809 = $807;
       $810 = $799;
       $811 = (($809) - ($810))|0;
       $$sum$i21$i = (($798) + ($nb$0))|0;
       $gep_int889 = $tbase$247$i;
       $gep890 = (($gep_int889) + ($$sum$i21$i))|0;
       $812 = $gep890;
       $813 = $812;
       $814 = (($811) - ($nb$0))|0;
       $815 = $nb$0 | 3;
       $$sum1$i22$i = (($798) + 4)|0;
       $gep_int891 = $tbase$247$i;
       $gep892 = (($gep_int891) + ($$sum1$i22$i))|0;
       $816 = $gep892;
       $817 = $816;
       HEAP32[$816>>2] = $815;
       $expanded235 = 2360;
       $gep_int893 = 2360;
       $gep894 = (($gep_int893) + 24)|0;
       $expanded234 = $gep894;
       $818 = HEAP32[$expanded234>>2]|0;
       $819 = ($808|0)==($818|0);
       
       L348: do {
        if ($819) {
         $expanded237 = 2360;
         $gep_int895 = 2360;
         $gep896 = (($gep_int895) + 12)|0;
         $expanded236 = $gep896;
         $820 = HEAP32[$expanded236>>2]|0;
         $821 = (($820) + ($814))|0;
         $expanded239 = 2360;
         $gep_int897 = 2360;
         $gep898 = (($gep_int897) + 12)|0;
         $expanded238 = $gep898;
         HEAP32[$expanded238>>2] = $821;
         $expanded241 = 2360;
         $gep_int899 = 2360;
         $gep900 = (($gep_int899) + 24)|0;
         $expanded240 = $gep900;
         HEAP32[$expanded240>>2] = $813;
         $822 = $821 | 1;
         $$sum46$i$i = (($$sum$i21$i) + 4)|0;
         $gep_int901 = $tbase$247$i;
         $gep902 = (($gep_int901) + ($$sum46$i$i))|0;
         $823 = $gep902;
         $824 = $823;
         HEAP32[$823>>2] = $822;
         
        } else {
         $expanded243 = 2360;
         $gep_int903 = 2360;
         $gep904 = (($gep_int903) + 20)|0;
         $expanded242 = $gep904;
         $825 = HEAP32[$expanded242>>2]|0;
         $826 = ($808|0)==($825|0);
         
         if ($826) {
          $expanded245 = 2360;
          $gep_int905 = 2360;
          $gep906 = (($gep_int905) + 8)|0;
          $expanded244 = $gep906;
          $827 = HEAP32[$expanded244>>2]|0;
          $828 = (($827) + ($814))|0;
          $expanded247 = 2360;
          $gep_int907 = 2360;
          $gep908 = (($gep_int907) + 8)|0;
          $expanded246 = $gep908;
          HEAP32[$expanded246>>2] = $828;
          $expanded249 = 2360;
          $gep_int909 = 2360;
          $gep910 = (($gep_int909) + 20)|0;
          $expanded248 = $gep910;
          HEAP32[$expanded248>>2] = $813;
          $829 = $828 | 1;
          $$sum44$i$i = (($$sum$i21$i) + 4)|0;
          $gep_int911 = $tbase$247$i;
          $gep912 = (($gep_int911) + ($$sum44$i$i))|0;
          $830 = $gep912;
          $831 = $830;
          HEAP32[$830>>2] = $829;
          $$sum45$i$i = (($828) + ($$sum$i21$i))|0;
          $gep_int913 = $tbase$247$i;
          $gep914 = (($gep_int913) + ($$sum45$i$i))|0;
          $832 = $gep914;
          $833 = $832;
          HEAP32[$832>>2] = $828;
          
          break;
         }
         $$sum2$i23$i = (($tsize$246$i) + 4)|0;
         $$sum109$i = (($$sum2$i23$i) + ($806))|0;
         $gep_int915 = $tbase$247$i;
         $gep916 = (($gep_int915) + ($$sum109$i))|0;
         $834 = $gep916;
         $835 = $834;
         $836 = HEAP32[$834>>2]|0;
         $837 = $836 & 3;
         $838 = ($837|0)==(1);
         
         if ($838) {
          $839 = $836 & -8;
          $840 = $836 >>> 3;
          $841 = ($836>>>0)<(256);
          
          L356: do {
           if ($841) {
            $$sum3940$i$i = $806 | 8;
            $$sum119$i = (($$sum3940$i$i) + ($tsize$246$i))|0;
            $gep_int917 = $tbase$247$i;
            $gep918 = (($gep_int917) + ($$sum119$i))|0;
            $842 = $gep918;
            $843 = $842;
            $844 = HEAP32[$842>>2]|0;
            $$sum41$i$i = (($tsize$246$i) + 12)|0;
            $$sum120$i = (($$sum41$i$i) + ($806))|0;
            $gep_int919 = $tbase$247$i;
            $gep920 = (($gep_int919) + ($$sum120$i))|0;
            $845 = $gep920;
            $846 = $845;
            $847 = HEAP32[$845>>2]|0;
            $848 = $840 << 1;
            $expanded250 = 2360;
            $gep_int921 = 2360;
            $gep922 = (($gep_int921) + 40)|0;
            $gep_array923 = $848<<2;
            $gep924 = (($gep922) + ($gep_array923))|0;
            $849 = $gep924;
            $850 = $849;
            $851 = ($844|0)==($850|0);
            
            do {
             if (!($851)) {
              $852 = $844;
              $expanded252 = 2360;
              $gep_int925 = 2360;
              $gep926 = (($gep_int925) + 16)|0;
              $expanded251 = $gep926;
              $853 = HEAP32[$expanded251>>2]|0;
              $854 = ($852>>>0)<($853>>>0);
              
              if ($854) {
               _abort();
               // unreachable
              }
              $gep_int927 = $844;
              $gep928 = (($gep_int927) + 12)|0;
              $855 = $gep928;
              $856 = HEAP32[$855>>2]|0;
              $857 = ($856|0)==($808|0);
              
              if ($857) {
               break;
              }
              _abort();
              // unreachable
             }
            } while(0);
            $858 = ($847|0)==($844|0);
            
            if ($858) {
             $859 = 1 << $840;
             $860 = $859 ^ -1;
             $expanded254 = 2360;
             $gep_int929 = 2360;
             $expanded253 = $gep_int929;
             $861 = HEAP32[$expanded253>>2]|0;
             $862 = $861 & $860;
             $expanded256 = 2360;
             $gep_int930 = 2360;
             $expanded255 = $gep_int930;
             HEAP32[$expanded255>>2] = $862;
             
             break;
            }
            $863 = ($847|0)==($850|0);
            
            do {
             if ($863) {
              $gep_int931 = $847;
              $gep932 = (($gep_int931) + 8)|0;
              $$pre61$i$i = $gep932;
              
              $$pre$phi62$i$iZ2D = $$pre61$i$i;
             } else {
              $864 = $847;
              $expanded258 = 2360;
              $gep_int933 = 2360;
              $gep934 = (($gep_int933) + 16)|0;
              $expanded257 = $gep934;
              $865 = HEAP32[$expanded257>>2]|0;
              $866 = ($864>>>0)<($865>>>0);
              
              if ($866) {
               _abort();
               // unreachable
              }
              $gep_int935 = $847;
              $gep936 = (($gep_int935) + 8)|0;
              $867 = $gep936;
              $868 = HEAP32[$867>>2]|0;
              $869 = ($868|0)==($808|0);
              
              if ($869) {
               $$pre$phi62$i$iZ2D = $867;
               break;
              }
              _abort();
              // unreachable
             }
            } while(0);
            
            $gep_int937 = $844;
            $gep938 = (($gep_int937) + 12)|0;
            $870 = $gep938;
            HEAP32[$870>>2] = $847;
            HEAP32[$$pre$phi62$i$iZ2D>>2] = $844;
            
           } else {
            $871 = $807;
            $$sum34$i$i = $806 | 24;
            $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
            $gep_int939 = $tbase$247$i;
            $gep940 = (($gep_int939) + ($$sum110$i))|0;
            $872 = $gep940;
            $873 = $872;
            $874 = HEAP32[$872>>2]|0;
            $$sum5$i$i = (($tsize$246$i) + 12)|0;
            $$sum111$i = (($$sum5$i$i) + ($806))|0;
            $gep_int941 = $tbase$247$i;
            $gep942 = (($gep_int941) + ($$sum111$i))|0;
            $875 = $gep942;
            $876 = $875;
            $877 = HEAP32[$875>>2]|0;
            $878 = ($877|0)==($871|0);
            
            do {
             if ($878) {
              $$sum67$i$i = $806 | 16;
              $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
              $gep_int951 = $tbase$247$i;
              $gep952 = (($gep_int951) + ($$sum117$i))|0;
              $891 = $gep952;
              $892 = $891;
              $893 = HEAP32[$891>>2]|0;
              $894 = ($893|0)==(0);
              
              if ($894) {
               $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
               $gep_int953 = $tbase$247$i;
               $gep954 = (($gep_int953) + ($$sum118$i))|0;
               $895 = $gep954;
               $896 = $895;
               $897 = HEAP32[$895>>2]|0;
               $898 = ($897|0)==(0);
               
               if ($898) {
                $R$1$i$i = 0;
                break;
               } else {
                $R$0$i$i = $897;$RP$0$i$i = $896;
               }
              } else {
               $R$0$i$i = $893;$RP$0$i$i = $892;
              }
              while(1) {
               
               
               $gep_int955 = $R$0$i$i;
               $gep956 = (($gep_int955) + 20)|0;
               $899 = $gep956;
               $900 = HEAP32[$899>>2]|0;
               $901 = ($900|0)==(0);
               
               if (!($901)) {
                $RP$0$i$i$phi = $899;$R$0$i$i$phi = $900;$RP$0$i$i = $RP$0$i$i$phi;$R$0$i$i = $R$0$i$i$phi;
                continue;
               }
               $gep_int957 = $R$0$i$i;
               $gep958 = (($gep_int957) + 16)|0;
               $902 = $gep958;
               $903 = HEAP32[$902>>2]|0;
               $904 = ($903|0)==(0);
               
               if ($904) {
                break;
               } else {
                $R$0$i$i = $903;$RP$0$i$i = $902;
               }
              }
              $905 = $RP$0$i$i;
              $expanded262 = 2360;
              $gep_int959 = 2360;
              $gep960 = (($gep_int959) + 16)|0;
              $expanded261 = $gep960;
              $906 = HEAP32[$expanded261>>2]|0;
              $907 = ($905>>>0)<($906>>>0);
              
              if ($907) {
               _abort();
               // unreachable
              } else {
               HEAP32[$RP$0$i$i>>2] = 0;
               
               $R$1$i$i = $R$0$i$i;
               break;
              }
             } else {
              $$sum3637$i$i = $806 | 8;
              $$sum112$i = (($$sum3637$i$i) + ($tsize$246$i))|0;
              $gep_int943 = $tbase$247$i;
              $gep944 = (($gep_int943) + ($$sum112$i))|0;
              $879 = $gep944;
              $880 = $879;
              $881 = HEAP32[$879>>2]|0;
              $882 = $881;
              $expanded260 = 2360;
              $gep_int945 = 2360;
              $gep946 = (($gep_int945) + 16)|0;
              $expanded259 = $gep946;
              $883 = HEAP32[$expanded259>>2]|0;
              $884 = ($882>>>0)<($883>>>0);
              
              if ($884) {
               _abort();
               // unreachable
              }
              $gep_int947 = $881;
              $gep948 = (($gep_int947) + 12)|0;
              $885 = $gep948;
              $886 = HEAP32[$885>>2]|0;
              $887 = ($886|0)==($871|0);
              
              if (!($887)) {
               _abort();
               // unreachable
              }
              $gep_int949 = $877;
              $gep950 = (($gep_int949) + 8)|0;
              $888 = $gep950;
              $889 = HEAP32[$888>>2]|0;
              $890 = ($889|0)==($871|0);
              
              if ($890) {
               HEAP32[$885>>2] = $877;
               HEAP32[$888>>2] = $881;
               
               $R$1$i$i = $877;
               break;
              } else {
               _abort();
               // unreachable
              }
             }
            } while(0);
            
            $908 = ($874|0)==(0);
            
            if ($908) {
             break;
            }
            $$sum31$i$i = (($tsize$246$i) + 28)|0;
            $$sum113$i = (($$sum31$i$i) + ($806))|0;
            $gep_int961 = $tbase$247$i;
            $gep962 = (($gep_int961) + ($$sum113$i))|0;
            $909 = $gep962;
            $910 = $909;
            $911 = HEAP32[$909>>2]|0;
            $expanded263 = 2360;
            $gep_int963 = 2360;
            $gep964 = (($gep_int963) + 304)|0;
            $gep_array965 = $911<<2;
            $gep966 = (($gep964) + ($gep_array965))|0;
            $912 = $gep966;
            $913 = HEAP32[$912>>2]|0;
            $914 = ($871|0)==($913|0);
            
            do {
             if ($914) {
              HEAP32[$912>>2] = $R$1$i$i;
              $cond$i$i = ($R$1$i$i|0)==(0);
              
              if (!($cond$i$i)) {
               break;
              }
              $915 = 1 << $911;
              $916 = $915 ^ -1;
              $expanded265 = 2360;
              $gep_int967 = 2360;
              $gep968 = (($gep_int967) + 4)|0;
              $expanded264 = $gep968;
              $917 = HEAP32[$expanded264>>2]|0;
              $918 = $917 & $916;
              $expanded267 = 2360;
              $gep_int969 = 2360;
              $gep970 = (($gep_int969) + 4)|0;
              $expanded266 = $gep970;
              HEAP32[$expanded266>>2] = $918;
              
              break L356;
             } else {
              $919 = $874;
              $expanded269 = 2360;
              $gep_int971 = 2360;
              $gep972 = (($gep_int971) + 16)|0;
              $expanded268 = $gep972;
              $920 = HEAP32[$expanded268>>2]|0;
              $921 = ($919>>>0)<($920>>>0);
              
              if ($921) {
               _abort();
               // unreachable
              }
              $gep_int973 = $874;
              $gep974 = (($gep_int973) + 16)|0;
              $922 = $gep974;
              $923 = HEAP32[$922>>2]|0;
              $924 = ($923|0)==($871|0);
              
              if ($924) {
               HEAP32[$922>>2] = $R$1$i$i;
               
              } else {
               $gep_int975 = $874;
               $gep976 = (($gep_int975) + 20)|0;
               $925 = $gep976;
               HEAP32[$925>>2] = $R$1$i$i;
               
              }
              $926 = ($R$1$i$i|0)==(0);
              
              if ($926) {
               break L356;
              }
             }
            } while(0);
            $927 = $R$1$i$i;
            $expanded271 = 2360;
            $gep_int977 = 2360;
            $gep978 = (($gep_int977) + 16)|0;
            $expanded270 = $gep978;
            $928 = HEAP32[$expanded270>>2]|0;
            $929 = ($927>>>0)<($928>>>0);
            
            if ($929) {
             _abort();
             // unreachable
            }
            $gep_int979 = $R$1$i$i;
            $gep980 = (($gep_int979) + 24)|0;
            $930 = $gep980;
            HEAP32[$930>>2] = $874;
            $$sum3233$i$i = $806 | 16;
            $$sum114$i = (($$sum3233$i$i) + ($tsize$246$i))|0;
            $gep_int981 = $tbase$247$i;
            $gep982 = (($gep_int981) + ($$sum114$i))|0;
            $931 = $gep982;
            $932 = $931;
            $933 = HEAP32[$931>>2]|0;
            $934 = ($933|0)==(0);
            
            do {
             if (!($934)) {
              $935 = $933;
              $expanded273 = 2360;
              $gep_int983 = 2360;
              $gep984 = (($gep_int983) + 16)|0;
              $expanded272 = $gep984;
              $936 = HEAP32[$expanded272>>2]|0;
              $937 = ($935>>>0)<($936>>>0);
              
              if ($937) {
               _abort();
               // unreachable
              } else {
               $gep_int985 = $R$1$i$i;
               $gep986 = (($gep_int985) + 16)|0;
               $938 = $gep986;
               HEAP32[$938>>2] = $933;
               $gep_int987 = $933;
               $gep988 = (($gep_int987) + 24)|0;
               $939 = $gep988;
               HEAP32[$939>>2] = $R$1$i$i;
               
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3233$i$i))|0;
            $gep_int989 = $tbase$247$i;
            $gep990 = (($gep_int989) + ($$sum115$i))|0;
            $940 = $gep990;
            $941 = $940;
            $942 = HEAP32[$940>>2]|0;
            $943 = ($942|0)==(0);
            
            if ($943) {
             break;
            }
            $944 = $942;
            $expanded275 = 2360;
            $gep_int991 = 2360;
            $gep992 = (($gep_int991) + 16)|0;
            $expanded274 = $gep992;
            $945 = HEAP32[$expanded274>>2]|0;
            $946 = ($944>>>0)<($945>>>0);
            
            if ($946) {
             _abort();
             // unreachable
            } else {
             $gep_int993 = $R$1$i$i;
             $gep994 = (($gep_int993) + 20)|0;
             $947 = $gep994;
             HEAP32[$947>>2] = $942;
             $gep_int995 = $942;
             $gep996 = (($gep_int995) + 24)|0;
             $948 = $gep996;
             HEAP32[$948>>2] = $R$1$i$i;
             
             break;
            }
           }
          } while(0);
          $$sum9$i$i = $839 | $806;
          $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
          $gep_int997 = $tbase$247$i;
          $gep998 = (($gep_int997) + ($$sum116$i))|0;
          $949 = $gep998;
          $950 = $949;
          $951 = (($839) + ($814))|0;
          
          $oldfirst$0$i$i = $950;$qsize$0$i$i = $951;
         } else {
          $oldfirst$0$i$i = $808;$qsize$0$i$i = $814;
         }
         
         
         $gep_int999 = $oldfirst$0$i$i;
         $gep1000 = (($gep_int999) + 4)|0;
         $952 = $gep1000;
         $953 = HEAP32[$952>>2]|0;
         $954 = $953 & -2;
         HEAP32[$952>>2] = $954;
         $955 = $qsize$0$i$i | 1;
         $$sum10$i$i = (($$sum$i21$i) + 4)|0;
         $gep_int1001 = $tbase$247$i;
         $gep1002 = (($gep_int1001) + ($$sum10$i$i))|0;
         $956 = $gep1002;
         $957 = $956;
         HEAP32[$956>>2] = $955;
         $$sum11$i$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
         $gep_int1003 = $tbase$247$i;
         $gep1004 = (($gep_int1003) + ($$sum11$i$i))|0;
         $958 = $gep1004;
         $959 = $958;
         HEAP32[$958>>2] = $qsize$0$i$i;
         $960 = $qsize$0$i$i >>> 3;
         $961 = ($qsize$0$i$i>>>0)<(256);
         
         if ($961) {
          $962 = $960 << 1;
          $expanded276 = 2360;
          $gep_int1005 = 2360;
          $gep1006 = (($gep_int1005) + 40)|0;
          $gep_array1007 = $962<<2;
          $gep1008 = (($gep1006) + ($gep_array1007))|0;
          $963 = $gep1008;
          $964 = $963;
          $expanded278 = 2360;
          $gep_int1009 = 2360;
          $expanded277 = $gep_int1009;
          $965 = HEAP32[$expanded277>>2]|0;
          $966 = 1 << $960;
          $967 = $965 & $966;
          $968 = ($967|0)==(0);
          
          do {
           if ($968) {
            $969 = $965 | $966;
            $expanded280 = 2360;
            $gep_int1010 = 2360;
            $expanded279 = $gep_int1010;
            HEAP32[$expanded279>>2] = $969;
            $$sum27$pre$i$i = (($962) + 2)|0;
            $expanded281 = 2360;
            $gep_int1011 = 2360;
            $gep1012 = (($gep_int1011) + 40)|0;
            $gep_array1013 = $$sum27$pre$i$i<<2;
            $gep1014 = (($gep1012) + ($gep_array1013))|0;
            $$pre$i24$i = $gep1014;
            
            $$pre$phi$i25$iZ2D = $$pre$i24$i;$F4$0$i$i = $964;
           } else {
            $$sum30$i$i = (($962) + 2)|0;
            $expanded282 = 2360;
            $gep_int1015 = 2360;
            $gep1016 = (($gep_int1015) + 40)|0;
            $gep_array1017 = $$sum30$i$i<<2;
            $gep1018 = (($gep1016) + ($gep_array1017))|0;
            $970 = $gep1018;
            $971 = HEAP32[$970>>2]|0;
            $972 = $971;
            $expanded284 = 2360;
            $gep_int1019 = 2360;
            $gep1020 = (($gep_int1019) + 16)|0;
            $expanded283 = $gep1020;
            $973 = HEAP32[$expanded283>>2]|0;
            $974 = ($972>>>0)<($973>>>0);
            
            if (!($974)) {
             $$pre$phi$i25$iZ2D = $970;$F4$0$i$i = $971;
             break;
            }
            _abort();
            // unreachable
           }
          } while(0);
          
          
          HEAP32[$$pre$phi$i25$iZ2D>>2] = $813;
          $gep_int1021 = $F4$0$i$i;
          $gep1022 = (($gep_int1021) + 12)|0;
          $975 = $gep1022;
          HEAP32[$975>>2] = $813;
          $$sum28$i$i = (($$sum$i21$i) + 8)|0;
          $gep_int1023 = $tbase$247$i;
          $gep1024 = (($gep_int1023) + ($$sum28$i$i))|0;
          $976 = $gep1024;
          $977 = $976;
          HEAP32[$976>>2] = $F4$0$i$i;
          $$sum29$i$i = (($$sum$i21$i) + 12)|0;
          $gep_int1025 = $tbase$247$i;
          $gep1026 = (($gep_int1025) + ($$sum29$i$i))|0;
          $978 = $gep1026;
          $979 = $978;
          HEAP32[$978>>2] = $964;
          
          break;
         }
         $980 = $812;
         $981 = $qsize$0$i$i >>> 8;
         $982 = ($981|0)==(0);
         
         do {
          if ($982) {
           $I7$0$i$i = 0;
          } else {
           $983 = ($qsize$0$i$i>>>0)>(16777215);
           
           if ($983) {
            $I7$0$i$i = 31;
            break;
           }
           $984 = (($981) + 1048320)|0;
           $985 = $984 >>> 16;
           $986 = $985 & 8;
           $987 = $981 << $986;
           $988 = (($987) + 520192)|0;
           $989 = $988 >>> 16;
           $990 = $989 & 4;
           $991 = $990 | $986;
           $992 = $987 << $990;
           $993 = (($992) + 245760)|0;
           $994 = $993 >>> 16;
           $995 = $994 & 2;
           $996 = $991 | $995;
           $997 = (14 - ($996))|0;
           $998 = $992 << $995;
           $999 = $998 >>> 15;
           $1000 = (($997) + ($999))|0;
           $1001 = $1000 << 1;
           $1002 = (($1000) + 7)|0;
           $1003 = $qsize$0$i$i >>> $1002;
           $1004 = $1003 & 1;
           $1005 = $1004 | $1001;
           
           $I7$0$i$i = $1005;
          }
         } while(0);
         
         $expanded285 = 2360;
         $gep_int1027 = 2360;
         $gep1028 = (($gep_int1027) + 304)|0;
         $gep_array1029 = $I7$0$i$i<<2;
         $gep1030 = (($gep1028) + ($gep_array1029))|0;
         $1006 = $gep1030;
         $$sum12$i26$i = (($$sum$i21$i) + 28)|0;
         $gep_int1031 = $tbase$247$i;
         $gep1032 = (($gep_int1031) + ($$sum12$i26$i))|0;
         $1007 = $gep1032;
         $1008 = $1007;
         HEAP32[$1007>>2] = $I7$0$i$i;
         $$sum13$i$i = (($$sum$i21$i) + 16)|0;
         $gep_int1033 = $tbase$247$i;
         $gep1034 = (($gep_int1033) + ($$sum13$i$i))|0;
         $1009 = $gep1034;
         $$sum14$i$i = (($$sum$i21$i) + 20)|0;
         $gep_int1035 = $tbase$247$i;
         $gep1036 = (($gep_int1035) + ($$sum14$i$i))|0;
         $1010 = $gep1036;
         $1011 = $1010;
         HEAP32[$1010>>2] = 0;
         $1012 = $1009;
         HEAP32[$1009>>2] = 0;
         $expanded287 = 2360;
         $gep_int1037 = 2360;
         $gep1038 = (($gep_int1037) + 4)|0;
         $expanded286 = $gep1038;
         $1013 = HEAP32[$expanded286>>2]|0;
         $1014 = 1 << $I7$0$i$i;
         $1015 = $1013 & $1014;
         $1016 = ($1015|0)==(0);
         
         if ($1016) {
          $1017 = $1013 | $1014;
          $expanded289 = 2360;
          $gep_int1039 = 2360;
          $gep1040 = (($gep_int1039) + 4)|0;
          $expanded288 = $gep1040;
          HEAP32[$expanded288>>2] = $1017;
          HEAP32[$1006>>2] = $980;
          $1018 = $1006;
          $$sum15$i$i = (($$sum$i21$i) + 24)|0;
          $gep_int1041 = $tbase$247$i;
          $gep1042 = (($gep_int1041) + ($$sum15$i$i))|0;
          $1019 = $gep1042;
          $1020 = $1019;
          HEAP32[$1019>>2] = $1018;
          $$sum16$i$i = (($$sum$i21$i) + 12)|0;
          $gep_int1043 = $tbase$247$i;
          $gep1044 = (($gep_int1043) + ($$sum16$i$i))|0;
          $1021 = $gep1044;
          $1022 = $1021;
          HEAP32[$1021>>2] = $980;
          $$sum17$i$i = (($$sum$i21$i) + 8)|0;
          $gep_int1045 = $tbase$247$i;
          $gep1046 = (($gep_int1045) + ($$sum17$i$i))|0;
          $1023 = $gep1046;
          $1024 = $1023;
          HEAP32[$1023>>2] = $980;
          
          break;
         }
         $1025 = HEAP32[$1006>>2]|0;
         $1026 = ($I7$0$i$i|0)==(31);
         
         if ($1026) {
          $1029 = 0;
         } else {
          $1027 = $I7$0$i$i >>> 1;
          $1028 = (25 - ($1027))|0;
          
          $1029 = $1028;
         }
         
         $gep_int1047 = $1025;
         $gep1048 = (($gep_int1047) + 4)|0;
         $1030 = $gep1048;
         $1031 = HEAP32[$1030>>2]|0;
         $1032 = $1031 & -8;
         $1033 = ($1032|0)==($qsize$0$i$i|0);
         
         L445: do {
          if ($1033) {
           $T$0$lcssa$i28$i = $1025;
          } else {
           $1034 = $qsize$0$i$i << $1029;
           
           $K8$056$i$i = $1034;$T$055$i$i = $1025;
           while(1) {
            
            
            $1040 = $K8$056$i$i >>> 31;
            $gep_int1051 = $T$055$i$i;
            $gep1052 = (($gep_int1051) + 16)|0;
            $gep_array1053 = $1040<<2;
            $gep1054 = (($gep1052) + ($gep_array1053))|0;
            $1041 = $gep1054;
            $1042 = HEAP32[$1041>>2]|0;
            $1043 = ($1042|0)==(0);
            
            if ($1043) {
             break;
            }
            $1035 = $K8$056$i$i << 1;
            $gep_int1049 = $1042;
            $gep1050 = (($gep_int1049) + 4)|0;
            $1036 = $gep1050;
            $1037 = HEAP32[$1036>>2]|0;
            $1038 = $1037 & -8;
            $1039 = ($1038|0)==($qsize$0$i$i|0);
            
            if ($1039) {
             $T$0$lcssa$i28$i = $1042;
             break L445;
            } else {
             $T$055$i$i$phi = $1042;$K8$056$i$i = $1035;$T$055$i$i = $T$055$i$i$phi;
            }
           }
           $1044 = $1041;
           $expanded291 = 2360;
           $gep_int1055 = 2360;
           $gep1056 = (($gep_int1055) + 16)|0;
           $expanded290 = $gep1056;
           $1045 = HEAP32[$expanded290>>2]|0;
           $1046 = ($1044>>>0)<($1045>>>0);
           
           if ($1046) {
            _abort();
            // unreachable
           } else {
            HEAP32[$1041>>2] = $980;
            $$sum24$i$i = (($$sum$i21$i) + 24)|0;
            $gep_int1057 = $tbase$247$i;
            $gep1058 = (($gep_int1057) + ($$sum24$i$i))|0;
            $1047 = $gep1058;
            $1048 = $1047;
            HEAP32[$1047>>2] = $T$055$i$i;
            $$sum25$i$i = (($$sum$i21$i) + 12)|0;
            $gep_int1059 = $tbase$247$i;
            $gep1060 = (($gep_int1059) + ($$sum25$i$i))|0;
            $1049 = $gep1060;
            $1050 = $1049;
            HEAP32[$1049>>2] = $980;
            $$sum26$i$i = (($$sum$i21$i) + 8)|0;
            $gep_int1061 = $tbase$247$i;
            $gep1062 = (($gep_int1061) + ($$sum26$i$i))|0;
            $1051 = $gep1062;
            $1052 = $1051;
            HEAP32[$1051>>2] = $980;
            
            break L348;
           }
          }
         } while(0);
         
         $gep_int1063 = $T$0$lcssa$i28$i;
         $gep1064 = (($gep_int1063) + 8)|0;
         $1053 = $gep1064;
         $1054 = HEAP32[$1053>>2]|0;
         $1055 = $T$0$lcssa$i28$i;
         $expanded293 = 2360;
         $gep_int1065 = 2360;
         $gep1066 = (($gep_int1065) + 16)|0;
         $expanded292 = $gep1066;
         $1056 = HEAP32[$expanded292>>2]|0;
         $1057 = ($1055>>>0)<($1056>>>0);
         
         if ($1057) {
          _abort();
          // unreachable
         }
         $1058 = $1054;
         $1059 = ($1058>>>0)<($1056>>>0);
         
         if ($1059) {
          _abort();
          // unreachable
         } else {
          $gep_int1067 = $1054;
          $gep1068 = (($gep_int1067) + 12)|0;
          $1060 = $gep1068;
          HEAP32[$1060>>2] = $980;
          HEAP32[$1053>>2] = $980;
          $$sum21$i$i = (($$sum$i21$i) + 8)|0;
          $gep_int1069 = $tbase$247$i;
          $gep1070 = (($gep_int1069) + ($$sum21$i$i))|0;
          $1061 = $gep1070;
          $1062 = $1061;
          HEAP32[$1061>>2] = $1054;
          $$sum22$i$i = (($$sum$i21$i) + 12)|0;
          $gep_int1071 = $tbase$247$i;
          $gep1072 = (($gep_int1071) + ($$sum22$i$i))|0;
          $1063 = $gep1072;
          $1064 = $1063;
          HEAP32[$1063>>2] = $T$0$lcssa$i28$i;
          $$sum23$i$i = (($$sum$i21$i) + 24)|0;
          $gep_int1073 = $tbase$247$i;
          $gep1074 = (($gep_int1073) + ($$sum23$i$i))|0;
          $1065 = $gep1074;
          $1066 = $1065;
          HEAP32[$1065>>2] = 0;
          
          break;
         }
        }
       } while(0);
       $$sum1819$i$i = $798 | 8;
       $gep_int1075 = $tbase$247$i;
       $gep1076 = (($gep_int1075) + ($$sum1819$i$i))|0;
       $1067 = $gep1076;
       
       $mem$0 = $1067;
       
       STACKTOP = sp;return $mem$0|0;
      }
     } while(0);
     $1068 = $711;
     $expanded295 = 2360;
     $gep_int1077 = 2360;
     $gep1078 = (($gep_int1077) + 448)|0;
     $expanded294 = $gep1078;
     
     $sp$0$i$i$i = $expanded294;
     while(1) {
      
      $gep_int1079 = $sp$0$i$i$i;
      $1069 = $gep_int1079;
      $1070 = HEAP32[$1069>>2]|0;
      $1071 = ($1070>>>0)>($1068>>>0);
      
      if (!($1071)) {
       $gep_int1080 = $sp$0$i$i$i;
       $gep1081 = (($gep_int1080) + 4)|0;
       $1072 = $gep1081;
       $1073 = HEAP32[$1072>>2]|0;
       $gep_int1082 = $1070;
       $gep1083 = (($gep_int1082) + ($1073))|0;
       $1074 = $gep1083;
       $1075 = ($1074>>>0)>($1068>>>0);
       
       if ($1075) {
        break;
       }
      }
      $gep_int1084 = $sp$0$i$i$i;
      $gep1085 = (($gep_int1084) + 8)|0;
      $1076 = $gep1085;
      $1077 = HEAP32[$1076>>2]|0;
      
      $sp$0$i$i$i = $1077;
     }
     $$sum$i15$i = (($1073) + -47)|0;
     $$sum1$i16$i = (($1073) + -39)|0;
     $gep_int1086 = $1070;
     $gep1087 = (($gep_int1086) + ($$sum1$i16$i))|0;
     $1078 = $gep1087;
     $1079 = $1078;
     $1080 = $1079 & 7;
     $1081 = ($1080|0)==(0);
     
     if ($1081) {
      $1084 = 0;
     } else {
      $1082 = (0 - ($1079))|0;
      $1083 = $1082 & 7;
      
      $1084 = $1083;
     }
     
     $$sum2$i17$i = (($$sum$i15$i) + ($1084))|0;
     $gep_int1088 = $1070;
     $gep1089 = (($gep_int1088) + ($$sum2$i17$i))|0;
     $1085 = $gep1089;
     $gep_int1090 = $711;
     $gep1091 = (($gep_int1090) + 16)|0;
     $1086 = $gep1091;
     $1087 = $1086;
     $1088 = ($1085>>>0)<($1087>>>0);
     $1089 = $1088 ? $1068 : $1085;
     $gep_int1092 = $1089;
     $gep1093 = (($gep_int1092) + 8)|0;
     $1090 = $gep1093;
     $1091 = $1090;
     $1092 = (($tsize$246$i) + -40)|0;
     $gep_int1094 = $tbase$247$i;
     $gep1095 = (($gep_int1094) + 8)|0;
     $1093 = $gep1095;
     $1094 = $1093;
     $1095 = $1094 & 7;
     $1096 = ($1095|0)==(0);
     
     if ($1096) {
      $1099 = 0;
     } else {
      $1097 = (0 - ($1094))|0;
      $1098 = $1097 & 7;
      
      $1099 = $1098;
     }
     
     $gep_int1096 = $tbase$247$i;
     $gep1097 = (($gep_int1096) + ($1099))|0;
     $1100 = $gep1097;
     $1101 = $1100;
     $1102 = (($1092) - ($1099))|0;
     $expanded297 = 2360;
     $gep_int1098 = 2360;
     $gep1099 = (($gep_int1098) + 24)|0;
     $expanded296 = $gep1099;
     HEAP32[$expanded296>>2] = $1101;
     $expanded299 = 2360;
     $gep_int1100 = 2360;
     $gep1101 = (($gep_int1100) + 12)|0;
     $expanded298 = $gep1101;
     HEAP32[$expanded298>>2] = $1102;
     $1103 = $1102 | 1;
     $$sum$i$i$i = (($1099) + 4)|0;
     $gep_int1102 = $tbase$247$i;
     $gep1103 = (($gep_int1102) + ($$sum$i$i$i))|0;
     $1104 = $gep1103;
     $1105 = $1104;
     HEAP32[$1104>>2] = $1103;
     $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
     $gep_int1104 = $tbase$247$i;
     $gep1105 = (($gep_int1104) + ($$sum2$i$i$i))|0;
     $1106 = $gep1105;
     $1107 = $1106;
     HEAP32[$1106>>2] = 40;
     $expanded301 = 2832;
     $gep_int1106 = 2832;
     $gep1107 = (($gep_int1106) + 16)|0;
     $expanded300 = $gep1107;
     $1108 = HEAP32[$expanded300>>2]|0;
     $expanded303 = 2360;
     $gep_int1108 = 2360;
     $gep1109 = (($gep_int1108) + 28)|0;
     $expanded302 = $gep1109;
     HEAP32[$expanded302>>2] = $1108;
     $gep_int1110 = $1089;
     $gep1111 = (($gep_int1110) + 4)|0;
     $1109 = $gep1111;
     $1110 = $1109;
     HEAP32[$1109>>2] = 27;
     $expanded306 = 2360;
     $gep_int1112 = 2360;
     $gep1113 = (($gep_int1112) + 448)|0;
     $expanded305 = $gep1113;
     $expanded304 = $expanded305;
     ;HEAP32[$1090+0>>2]=HEAP32[$expanded304+0>>2]|0;HEAP32[$1090+4>>2]=HEAP32[$expanded304+4>>2]|0;HEAP32[$1090+8>>2]=HEAP32[$expanded304+8>>2]|0;HEAP32[$1090+12>>2]=HEAP32[$expanded304+12>>2]|0;
     $expanded308 = 2360;
     $gep_int1114 = 2360;
     $gep1115 = (($gep_int1114) + 448)|0;
     $expanded307 = $gep1115;
     HEAP32[$expanded307>>2] = $tbase$247$i;
     $expanded310 = 2360;
     $gep_int1116 = 2360;
     $gep1117 = (($gep_int1116) + 452)|0;
     $expanded309 = $gep1117;
     HEAP32[$expanded309>>2] = $tsize$246$i;
     $expanded312 = 2360;
     $gep_int1118 = 2360;
     $gep1119 = (($gep_int1118) + 460)|0;
     $expanded311 = $gep1119;
     HEAP32[$expanded311>>2] = 0;
     $expanded314 = 2360;
     $gep_int1120 = 2360;
     $gep1121 = (($gep_int1120) + 456)|0;
     $expanded313 = $gep1121;
     HEAP32[$expanded313>>2] = $1091;
     $gep_int1122 = $1089;
     $gep1123 = (($gep_int1122) + 28)|0;
     $1111 = $gep1123;
     $1112 = $1111;
     HEAP32[$1111>>2] = 7;
     $gep_int1124 = $1089;
     $gep1125 = (($gep_int1124) + 32)|0;
     $1113 = $gep1125;
     $1114 = ($1113>>>0)<($1074>>>0);
     
     if ($1114) {
      $1115 = $1112;
      while(1) {
       
       $gep_int1126 = $1115;
       $gep1127 = (($gep_int1126) + 4)|0;
       $1116 = $gep1127;
       HEAP32[$1116>>2] = 7;
       $gep_int1128 = $1115;
       $gep1129 = (($gep_int1128) + 8)|0;
       $1117 = $gep1129;
       $1118 = $1117;
       $1119 = ($1118>>>0)<($1074>>>0);
       
       if ($1119) {
        $1115$phi = $1116;$1115 = $1115$phi;
       } else {
        break;
       }
      }
     }
     $1120 = ($1089|0)==($1068|0);
     
     if ($1120) {
      break;
     }
     $1121 = $1089;
     $1122 = $711;
     $1123 = (($1121) - ($1122))|0;
     $gep_int1130 = $711;
     $gep1131 = (($gep_int1130) + ($1123))|0;
     $1124 = $gep1131;
     $$sum3$i$i = (($1123) + 4)|0;
     $gep_int1132 = $711;
     $gep1133 = (($gep_int1132) + ($$sum3$i$i))|0;
     $1125 = $gep1133;
     $1126 = $1125;
     $1127 = HEAP32[$1125>>2]|0;
     $1128 = $1127 & -2;
     HEAP32[$1125>>2] = $1128;
     $1129 = $1123 | 1;
     $gep_int1134 = $711;
     $gep1135 = (($gep_int1134) + 4)|0;
     $1130 = $gep1135;
     HEAP32[$1130>>2] = $1129;
     $1131 = $1124;
     HEAP32[$1124>>2] = $1123;
     $1132 = $1123 >>> 3;
     $1133 = ($1123>>>0)<(256);
     
     if ($1133) {
      $1134 = $1132 << 1;
      $expanded315 = 2360;
      $gep_int1136 = 2360;
      $gep1137 = (($gep_int1136) + 40)|0;
      $gep_array1138 = $1134<<2;
      $gep1139 = (($gep1137) + ($gep_array1138))|0;
      $1135 = $gep1139;
      $1136 = $1135;
      $expanded317 = 2360;
      $gep_int1140 = 2360;
      $expanded316 = $gep_int1140;
      $1137 = HEAP32[$expanded316>>2]|0;
      $1138 = 1 << $1132;
      $1139 = $1137 & $1138;
      $1140 = ($1139|0)==(0);
      
      do {
       if ($1140) {
        $1141 = $1137 | $1138;
        $expanded319 = 2360;
        $gep_int1141 = 2360;
        $expanded318 = $gep_int1141;
        HEAP32[$expanded318>>2] = $1141;
        $$sum11$pre$i$i = (($1134) + 2)|0;
        $expanded320 = 2360;
        $gep_int1142 = 2360;
        $gep1143 = (($gep_int1142) + 40)|0;
        $gep_array1144 = $$sum11$pre$i$i<<2;
        $gep1145 = (($gep1143) + ($gep_array1144))|0;
        $$pre$i$i = $gep1145;
        
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $1136;
       } else {
        $$sum12$i$i = (($1134) + 2)|0;
        $expanded321 = 2360;
        $gep_int1146 = 2360;
        $gep1147 = (($gep_int1146) + 40)|0;
        $gep_array1148 = $$sum12$i$i<<2;
        $gep1149 = (($gep1147) + ($gep_array1148))|0;
        $1142 = $gep1149;
        $1143 = HEAP32[$1142>>2]|0;
        $1144 = $1143;
        $expanded323 = 2360;
        $gep_int1150 = 2360;
        $gep1151 = (($gep_int1150) + 16)|0;
        $expanded322 = $gep1151;
        $1145 = HEAP32[$expanded322>>2]|0;
        $1146 = ($1144>>>0)<($1145>>>0);
        
        if (!($1146)) {
         $$pre$phi$i$iZ2D = $1142;$F$0$i$i = $1143;
         break;
        }
        _abort();
        // unreachable
       }
      } while(0);
      
      
      HEAP32[$$pre$phi$i$iZ2D>>2] = $711;
      $gep_int1152 = $F$0$i$i;
      $gep1153 = (($gep_int1152) + 12)|0;
      $1147 = $gep1153;
      HEAP32[$1147>>2] = $711;
      $gep_int1154 = $711;
      $gep1155 = (($gep_int1154) + 8)|0;
      $1148 = $gep1155;
      HEAP32[$1148>>2] = $F$0$i$i;
      $gep_int1156 = $711;
      $gep1157 = (($gep_int1156) + 12)|0;
      $1149 = $gep1157;
      HEAP32[$1149>>2] = $1136;
      
      break;
     }
     $1150 = $711;
     $1151 = $1123 >>> 8;
     $1152 = ($1151|0)==(0);
     
     do {
      if ($1152) {
       $I1$0$i$i = 0;
      } else {
       $1153 = ($1123>>>0)>(16777215);
       
       if ($1153) {
        $I1$0$i$i = 31;
        break;
       }
       $1154 = (($1151) + 1048320)|0;
       $1155 = $1154 >>> 16;
       $1156 = $1155 & 8;
       $1157 = $1151 << $1156;
       $1158 = (($1157) + 520192)|0;
       $1159 = $1158 >>> 16;
       $1160 = $1159 & 4;
       $1161 = $1160 | $1156;
       $1162 = $1157 << $1160;
       $1163 = (($1162) + 245760)|0;
       $1164 = $1163 >>> 16;
       $1165 = $1164 & 2;
       $1166 = $1161 | $1165;
       $1167 = (14 - ($1166))|0;
       $1168 = $1162 << $1165;
       $1169 = $1168 >>> 15;
       $1170 = (($1167) + ($1169))|0;
       $1171 = $1170 << 1;
       $1172 = (($1170) + 7)|0;
       $1173 = $1123 >>> $1172;
       $1174 = $1173 & 1;
       $1175 = $1174 | $1171;
       
       $I1$0$i$i = $1175;
      }
     } while(0);
     
     $expanded324 = 2360;
     $gep_int1158 = 2360;
     $gep1159 = (($gep_int1158) + 304)|0;
     $gep_array1160 = $I1$0$i$i<<2;
     $gep1161 = (($gep1159) + ($gep_array1160))|0;
     $1176 = $gep1161;
     $gep_int1162 = $711;
     $gep1163 = (($gep_int1162) + 28)|0;
     $1177 = $gep1163;
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1177>>2] = $I1$0$c$i$i;
     $gep_int1164 = $711;
     $gep1165 = (($gep_int1164) + 20)|0;
     $1178 = $gep1165;
     HEAP32[$1178>>2] = 0;
     $gep_int1166 = $711;
     $gep1167 = (($gep_int1166) + 16)|0;
     $1179 = $gep1167;
     HEAP32[$1179>>2] = 0;
     $expanded326 = 2360;
     $gep_int1168 = 2360;
     $gep1169 = (($gep_int1168) + 4)|0;
     $expanded325 = $gep1169;
     $1180 = HEAP32[$expanded325>>2]|0;
     $1181 = 1 << $I1$0$i$i;
     $1182 = $1180 & $1181;
     $1183 = ($1182|0)==(0);
     
     if ($1183) {
      $1184 = $1180 | $1181;
      $expanded328 = 2360;
      $gep_int1170 = 2360;
      $gep1171 = (($gep_int1170) + 4)|0;
      $expanded327 = $gep1171;
      HEAP32[$expanded327>>2] = $1184;
      HEAP32[$1176>>2] = $1150;
      $gep_int1172 = $711;
      $gep1173 = (($gep_int1172) + 24)|0;
      $1185 = $gep1173;
      $$c$i$i = $1176;
      HEAP32[$1185>>2] = $$c$i$i;
      $gep_int1174 = $711;
      $gep1175 = (($gep_int1174) + 12)|0;
      $1186 = $gep1175;
      HEAP32[$1186>>2] = $711;
      $gep_int1176 = $711;
      $gep1177 = (($gep_int1176) + 8)|0;
      $1187 = $gep1177;
      HEAP32[$1187>>2] = $711;
      
      break;
     }
     $1188 = HEAP32[$1176>>2]|0;
     $1189 = ($I1$0$i$i|0)==(31);
     
     if ($1189) {
      $1192 = 0;
     } else {
      $1190 = $I1$0$i$i >>> 1;
      $1191 = (25 - ($1190))|0;
      
      $1192 = $1191;
     }
     
     $gep_int1178 = $1188;
     $gep1179 = (($gep_int1178) + 4)|0;
     $1193 = $gep1179;
     $1194 = HEAP32[$1193>>2]|0;
     $1195 = $1194 & -8;
     $1196 = ($1195|0)==($1123|0);
     
     L499: do {
      if ($1196) {
       $T$0$lcssa$i$i = $1188;
      } else {
       $1197 = $1123 << $1192;
       
       $K2$015$i$i = $1197;$T$014$i$i = $1188;
       while(1) {
        
        
        $1203 = $K2$015$i$i >>> 31;
        $gep_int1182 = $T$014$i$i;
        $gep1183 = (($gep_int1182) + 16)|0;
        $gep_array1184 = $1203<<2;
        $gep1185 = (($gep1183) + ($gep_array1184))|0;
        $1204 = $gep1185;
        $1205 = HEAP32[$1204>>2]|0;
        $1206 = ($1205|0)==(0);
        
        if ($1206) {
         break;
        }
        $1198 = $K2$015$i$i << 1;
        $gep_int1180 = $1205;
        $gep1181 = (($gep_int1180) + 4)|0;
        $1199 = $gep1181;
        $1200 = HEAP32[$1199>>2]|0;
        $1201 = $1200 & -8;
        $1202 = ($1201|0)==($1123|0);
        
        if ($1202) {
         $T$0$lcssa$i$i = $1205;
         break L499;
        } else {
         $T$014$i$i$phi = $1205;$K2$015$i$i = $1198;$T$014$i$i = $T$014$i$i$phi;
        }
       }
       $1207 = $1204;
       $expanded330 = 2360;
       $gep_int1186 = 2360;
       $gep1187 = (($gep_int1186) + 16)|0;
       $expanded329 = $gep1187;
       $1208 = HEAP32[$expanded329>>2]|0;
       $1209 = ($1207>>>0)<($1208>>>0);
       
       if ($1209) {
        _abort();
        // unreachable
       } else {
        HEAP32[$1204>>2] = $1150;
        $gep_int1188 = $711;
        $gep1189 = (($gep_int1188) + 24)|0;
        $1210 = $gep1189;
        $T$0$c8$i$i = $T$014$i$i;
        HEAP32[$1210>>2] = $T$0$c8$i$i;
        $gep_int1190 = $711;
        $gep1191 = (($gep_int1190) + 12)|0;
        $1211 = $gep1191;
        HEAP32[$1211>>2] = $711;
        $gep_int1192 = $711;
        $gep1193 = (($gep_int1192) + 8)|0;
        $1212 = $gep1193;
        HEAP32[$1212>>2] = $711;
        
        break L311;
       }
      }
     } while(0);
     
     $gep_int1194 = $T$0$lcssa$i$i;
     $gep1195 = (($gep_int1194) + 8)|0;
     $1213 = $gep1195;
     $1214 = HEAP32[$1213>>2]|0;
     $1215 = $T$0$lcssa$i$i;
     $expanded332 = 2360;
     $gep_int1196 = 2360;
     $gep1197 = (($gep_int1196) + 16)|0;
     $expanded331 = $gep1197;
     $1216 = HEAP32[$expanded331>>2]|0;
     $1217 = ($1215>>>0)<($1216>>>0);
     
     if ($1217) {
      _abort();
      // unreachable
     }
     $1218 = $1214;
     $1219 = ($1218>>>0)<($1216>>>0);
     
     if ($1219) {
      _abort();
      // unreachable
     } else {
      $gep_int1198 = $1214;
      $gep1199 = (($gep_int1198) + 12)|0;
      $1220 = $gep1199;
      HEAP32[$1220>>2] = $1150;
      HEAP32[$1213>>2] = $1150;
      $gep_int1200 = $711;
      $gep1201 = (($gep_int1200) + 8)|0;
      $1221 = $gep1201;
      $$c7$i$i = $1214;
      HEAP32[$1221>>2] = $$c7$i$i;
      $gep_int1202 = $711;
      $gep1203 = (($gep_int1202) + 12)|0;
      $1222 = $gep1203;
      $T$0$c$i$i = $T$0$lcssa$i$i;
      HEAP32[$1222>>2] = $T$0$c$i$i;
      $gep_int1204 = $711;
      $gep1205 = (($gep_int1204) + 24)|0;
      $1223 = $gep1205;
      HEAP32[$1223>>2] = 0;
      
      break;
     }
    }
   } while(0);
   $expanded334 = 2360;
   $gep_int1206 = 2360;
   $gep1207 = (($gep_int1206) + 12)|0;
   $expanded333 = $gep1207;
   $1224 = HEAP32[$expanded333>>2]|0;
   $1225 = ($1224>>>0)>($nb$0>>>0);
   
   if (!($1225)) {
    break;
   }
   $1226 = (($1224) - ($nb$0))|0;
   $expanded336 = 2360;
   $gep_int1208 = 2360;
   $gep1209 = (($gep_int1208) + 12)|0;
   $expanded335 = $gep1209;
   HEAP32[$expanded335>>2] = $1226;
   $expanded338 = 2360;
   $gep_int1210 = 2360;
   $gep1211 = (($gep_int1210) + 24)|0;
   $expanded337 = $gep1211;
   $1227 = HEAP32[$expanded337>>2]|0;
   $1228 = $1227;
   $gep_int1212 = $1227;
   $gep1213 = (($gep_int1212) + ($nb$0))|0;
   $1229 = $gep1213;
   $1230 = $1229;
   $expanded340 = 2360;
   $gep_int1214 = 2360;
   $gep1215 = (($gep_int1214) + 24)|0;
   $expanded339 = $gep1215;
   HEAP32[$expanded339>>2] = $1230;
   $1231 = $1226 | 1;
   $$sum$i34 = (($nb$0) + 4)|0;
   $gep_int1216 = $1227;
   $gep1217 = (($gep_int1216) + ($$sum$i34))|0;
   $1232 = $gep1217;
   $1233 = $1232;
   HEAP32[$1232>>2] = $1231;
   $1234 = $nb$0 | 3;
   $gep_int1218 = $1227;
   $gep1219 = (($gep_int1218) + 4)|0;
   $1235 = $gep1219;
   HEAP32[$1235>>2] = $1234;
   $gep_int1220 = $1227;
   $gep1221 = (($gep_int1220) + 8)|0;
   $1236 = $gep1221;
   $1237 = $1236;
   
   $mem$0 = $1237;
   
   STACKTOP = sp;return $mem$0|0;
  }
 } while(0);
 $1238 = ___errno_location()|0;
 HEAP32[$1238>>2] = 12;
 
 $mem$0 = 0;
 
 STACKTOP = sp;return $mem$0|0;
}
function _free($mem) {
 $mem = $mem|0;
 var $$c = 0, $$c15 = 0, $$pre = 0, $$pre$phi83Z2D = 0, $$pre$phi85Z2D = 0, $$pre$phiZ2D = 0, $$pre82 = 0, $$pre84 = 0, $$sum = 0, $$sum10 = 0, $$sum19$pre = 0, $$sum20 = 0, $$sum21 = 0, $$sum22 = 0, $$sum23 = 0, $$sum2829 = 0, $$sum3 = 0, $$sum34 = 0, $$sum35 = 0, $$sum37 = 0;
 var $$sum38 = 0, $$sum39 = 0, $$sum4 = 0, $$sum40 = 0, $$sum41 = 0, $$sum42 = 0, $$sum43 = 0, $$sum44 = 0, $$sum47 = 0, $$sum48 = 0, $$sum6 = 0, $$sum78 = 0, $$sum9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
 var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
 var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0;
 var $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0;
 var $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0;
 var $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
 var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
 var $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0;
 var $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0;
 var $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0;
 var $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$072 = 0;
 var $R$0 = 0, $R$0$phi = 0, $R$1 = 0, $R7$0 = 0, $R7$0$phi = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$phi = 0, $RP9$0 = 0, $RP9$0$phi = 0, $T$0$c = 0, $T$0$c16 = 0, $T$0$lcssa = 0, $T$071 = 0, $T$071$phi = 0, $cond = 0, $cond69 = 0, $expanded = 0, $expanded1 = 0, $expanded10 = 0;
 var $expanded100 = 0, $expanded101 = 0, $expanded11 = 0, $expanded12 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded16 = 0, $expanded17 = 0, $expanded18 = 0, $expanded19 = 0, $expanded2 = 0, $expanded20 = 0, $expanded21 = 0, $expanded22 = 0, $expanded23 = 0, $expanded24 = 0, $expanded25 = 0, $expanded26 = 0, $expanded27 = 0;
 var $expanded28 = 0, $expanded29 = 0, $expanded3 = 0, $expanded30 = 0, $expanded31 = 0, $expanded32 = 0, $expanded33 = 0, $expanded34 = 0, $expanded35 = 0, $expanded36 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded4 = 0, $expanded40 = 0, $expanded41 = 0, $expanded42 = 0, $expanded43 = 0, $expanded44 = 0, $expanded45 = 0;
 var $expanded46 = 0, $expanded47 = 0, $expanded48 = 0, $expanded49 = 0, $expanded5 = 0, $expanded50 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded54 = 0, $expanded55 = 0, $expanded56 = 0, $expanded57 = 0, $expanded58 = 0, $expanded59 = 0, $expanded6 = 0, $expanded60 = 0, $expanded61 = 0, $expanded62 = 0, $expanded63 = 0;
 var $expanded64 = 0, $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded68 = 0, $expanded69 = 0, $expanded7 = 0, $expanded70 = 0, $expanded71 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded75 = 0, $expanded76 = 0, $expanded77 = 0, $expanded78 = 0, $expanded79 = 0, $expanded8 = 0, $expanded80 = 0, $expanded81 = 0;
 var $expanded82 = 0, $expanded83 = 0, $expanded84 = 0, $expanded85 = 0, $expanded86 = 0, $expanded87 = 0, $expanded88 = 0, $expanded89 = 0, $expanded9 = 0, $expanded90 = 0, $expanded91 = 0, $expanded92 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0, $expanded96 = 0, $expanded97 = 0, $expanded98 = 0, $expanded99 = 0, $gep = 0;
 var $gep103 = 0, $gep105 = 0, $gep107 = 0, $gep109 = 0, $gep111 = 0, $gep113 = 0, $gep115 = 0, $gep117 = 0, $gep118 = 0, $gep120 = 0, $gep124 = 0, $gep126 = 0, $gep128 = 0, $gep130 = 0, $gep132 = 0, $gep134 = 0, $gep136 = 0, $gep138 = 0, $gep140 = 0, $gep142 = 0;
 var $gep144 = 0, $gep146 = 0, $gep148 = 0, $gep150 = 0, $gep152 = 0, $gep154 = 0, $gep156 = 0, $gep158 = 0, $gep160 = 0, $gep162 = 0, $gep164 = 0, $gep166 = 0, $gep168 = 0, $gep170 = 0, $gep172 = 0, $gep174 = 0, $gep176 = 0, $gep178 = 0, $gep180 = 0, $gep182 = 0;
 var $gep184 = 0, $gep186 = 0, $gep188 = 0, $gep190 = 0, $gep192 = 0, $gep194 = 0, $gep196 = 0, $gep198 = 0, $gep200 = 0, $gep202 = 0, $gep204 = 0, $gep206 = 0, $gep208 = 0, $gep210 = 0, $gep212 = 0, $gep214 = 0, $gep216 = 0, $gep218 = 0, $gep220 = 0, $gep222 = 0;
 var $gep224 = 0, $gep226 = 0, $gep228 = 0, $gep230 = 0, $gep234 = 0, $gep236 = 0, $gep238 = 0, $gep240 = 0, $gep242 = 0, $gep244 = 0, $gep246 = 0, $gep248 = 0, $gep250 = 0, $gep252 = 0, $gep254 = 0, $gep256 = 0, $gep258 = 0, $gep260 = 0, $gep262 = 0, $gep264 = 0;
 var $gep266 = 0, $gep268 = 0, $gep270 = 0, $gep272 = 0, $gep274 = 0, $gep276 = 0, $gep278 = 0, $gep280 = 0, $gep282 = 0, $gep284 = 0, $gep286 = 0, $gep288 = 0, $gep290 = 0, $gep292 = 0, $gep294 = 0, $gep296 = 0, $gep298 = 0, $gep300 = 0, $gep302 = 0, $gep304 = 0;
 var $gep306 = 0, $gep308 = 0, $gep310 = 0, $gep312 = 0, $gep314 = 0, $gep318 = 0, $gep320 = 0, $gep322 = 0, $gep324 = 0, $gep326 = 0, $gep328 = 0, $gep330 = 0, $gep332 = 0, $gep334 = 0, $gep336 = 0, $gep338 = 0, $gep340 = 0, $gep342 = 0, $gep344 = 0, $gep346 = 0;
 var $gep348 = 0, $gep350 = 0, $gep352 = 0, $gep354 = 0, $gep356 = 0, $gep358 = 0, $gep360 = 0, $gep362 = 0, $gep364 = 0, $gep366 = 0, $gep368 = 0, $gep370 = 0, $gep372 = 0, $gep374 = 0, $gep376 = 0, $gep378 = 0, $gep380 = 0, $gep382 = 0, $gep384 = 0, $gep386 = 0;
 var $gep388 = 0, $gep390 = 0, $gep_array = 0, $gep_array151 = 0, $gep_array225 = 0, $gep_array267 = 0, $gep_array313 = 0, $gep_array319 = 0, $gep_array323 = 0, $gep_array335 = 0, $gep_array359 = 0, $gep_int = 0, $gep_int102 = 0, $gep_int104 = 0, $gep_int106 = 0, $gep_int108 = 0, $gep_int110 = 0, $gep_int112 = 0, $gep_int114 = 0, $gep_int116 = 0;
 var $gep_int119 = 0, $gep_int121 = 0, $gep_int122 = 0, $gep_int123 = 0, $gep_int125 = 0, $gep_int127 = 0, $gep_int129 = 0, $gep_int131 = 0, $gep_int133 = 0, $gep_int135 = 0, $gep_int137 = 0, $gep_int139 = 0, $gep_int141 = 0, $gep_int143 = 0, $gep_int145 = 0, $gep_int147 = 0, $gep_int149 = 0, $gep_int153 = 0, $gep_int155 = 0, $gep_int157 = 0;
 var $gep_int159 = 0, $gep_int161 = 0, $gep_int163 = 0, $gep_int165 = 0, $gep_int167 = 0, $gep_int169 = 0, $gep_int171 = 0, $gep_int173 = 0, $gep_int175 = 0, $gep_int177 = 0, $gep_int179 = 0, $gep_int181 = 0, $gep_int183 = 0, $gep_int185 = 0, $gep_int187 = 0, $gep_int189 = 0, $gep_int191 = 0, $gep_int193 = 0, $gep_int195 = 0, $gep_int197 = 0;
 var $gep_int199 = 0, $gep_int201 = 0, $gep_int203 = 0, $gep_int205 = 0, $gep_int207 = 0, $gep_int209 = 0, $gep_int211 = 0, $gep_int213 = 0, $gep_int215 = 0, $gep_int217 = 0, $gep_int219 = 0, $gep_int221 = 0, $gep_int223 = 0, $gep_int227 = 0, $gep_int229 = 0, $gep_int231 = 0, $gep_int232 = 0, $gep_int233 = 0, $gep_int235 = 0, $gep_int237 = 0;
 var $gep_int239 = 0, $gep_int241 = 0, $gep_int243 = 0, $gep_int245 = 0, $gep_int247 = 0, $gep_int249 = 0, $gep_int251 = 0, $gep_int253 = 0, $gep_int255 = 0, $gep_int257 = 0, $gep_int259 = 0, $gep_int261 = 0, $gep_int263 = 0, $gep_int265 = 0, $gep_int269 = 0, $gep_int271 = 0, $gep_int273 = 0, $gep_int275 = 0, $gep_int277 = 0, $gep_int279 = 0;
 var $gep_int281 = 0, $gep_int283 = 0, $gep_int285 = 0, $gep_int287 = 0, $gep_int289 = 0, $gep_int291 = 0, $gep_int293 = 0, $gep_int295 = 0, $gep_int297 = 0, $gep_int299 = 0, $gep_int301 = 0, $gep_int303 = 0, $gep_int305 = 0, $gep_int307 = 0, $gep_int309 = 0, $gep_int311 = 0, $gep_int315 = 0, $gep_int316 = 0, $gep_int317 = 0, $gep_int321 = 0;
 var $gep_int325 = 0, $gep_int327 = 0, $gep_int329 = 0, $gep_int331 = 0, $gep_int333 = 0, $gep_int337 = 0, $gep_int339 = 0, $gep_int341 = 0, $gep_int343 = 0, $gep_int345 = 0, $gep_int347 = 0, $gep_int349 = 0, $gep_int351 = 0, $gep_int353 = 0, $gep_int355 = 0, $gep_int357 = 0, $gep_int361 = 0, $gep_int363 = 0, $gep_int365 = 0, $gep_int367 = 0;
 var $gep_int369 = 0, $gep_int371 = 0, $gep_int373 = 0, $gep_int375 = 0, $gep_int377 = 0, $gep_int379 = 0, $gep_int381 = 0, $gep_int383 = 0, $gep_int385 = 0, $gep_int387 = 0, $gep_int389 = 0, $p$0 = 0, $phitmp = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, $sp$0$in$i$phi = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($mem|0)==(0);
 
 if ($1) {
  STACKTOP = sp;return;
 }
 $gep_int = $mem;
 $gep = (($gep_int) + -8)|0;
 $2 = $gep;
 $3 = $2;
 $expanded1 = 2360;
 $gep_int102 = 2360;
 $gep103 = (($gep_int102) + 16)|0;
 $expanded = $gep103;
 $4 = HEAP32[$expanded>>2]|0;
 $5 = ($2>>>0)<($4>>>0);
 
 if ($5) {
  _abort();
  // unreachable
 }
 $gep_int104 = $mem;
 $gep105 = (($gep_int104) + -4)|0;
 $6 = $gep105;
 $7 = $6;
 $8 = HEAP32[$6>>2]|0;
 $9 = $8 & 3;
 $10 = ($9|0)==(1);
 
 if ($10) {
  _abort();
  // unreachable
 }
 $11 = $8 & -8;
 $$sum = (($11) + -8)|0;
 $gep_int106 = $mem;
 $gep107 = (($gep_int106) + ($$sum))|0;
 $12 = $gep107;
 $13 = $12;
 $14 = $8 & 1;
 $15 = ($14|0)==(0);
 
 L10: do {
  if ($15) {
   $16 = $2;
   $17 = HEAP32[$2>>2]|0;
   $18 = ($9|0)==(0);
   
   if ($18) {
    STACKTOP = sp;return;
   }
   $$sum3 = (-8 - ($17))|0;
   $gep_int108 = $mem;
   $gep109 = (($gep_int108) + ($$sum3))|0;
   $19 = $gep109;
   $20 = $19;
   $21 = (($17) + ($11))|0;
   $22 = ($19>>>0)<($4>>>0);
   
   if ($22) {
    _abort();
    // unreachable
   }
   $expanded3 = 2360;
   $gep_int110 = 2360;
   $gep111 = (($gep_int110) + 20)|0;
   $expanded2 = $gep111;
   $23 = HEAP32[$expanded2>>2]|0;
   $24 = ($20|0)==($23|0);
   
   if ($24) {
    $$sum4 = (($11) + -4)|0;
    $gep_int183 = $mem;
    $gep184 = (($gep_int183) + ($$sum4))|0;
    $130 = $gep184;
    $131 = $130;
    $132 = HEAP32[$130>>2]|0;
    $133 = $132 & 3;
    $134 = ($133|0)==(3);
    
    if (!($134)) {
     $p$0 = $20;$psize$0 = $21;
     break;
    }
    $expanded23 = 2360;
    $gep_int185 = 2360;
    $gep186 = (($gep_int185) + 8)|0;
    $expanded22 = $gep186;
    HEAP32[$expanded22>>2] = $21;
    $135 = HEAP32[$130>>2]|0;
    $136 = $135 & -2;
    HEAP32[$130>>2] = $136;
    $137 = $21 | 1;
    $$sum35 = (($$sum3) + 4)|0;
    $gep_int187 = $mem;
    $gep188 = (($gep_int187) + ($$sum35))|0;
    $138 = $gep188;
    $139 = $138;
    HEAP32[$138>>2] = $137;
    $140 = $12;
    HEAP32[$12>>2] = $21;
    
    STACKTOP = sp;return;
   }
   $25 = $17 >>> 3;
   $26 = ($17>>>0)<(256);
   
   if ($26) {
    $$sum47 = (($$sum3) + 8)|0;
    $gep_int112 = $mem;
    $gep113 = (($gep_int112) + ($$sum47))|0;
    $27 = $gep113;
    $28 = $27;
    $29 = HEAP32[$27>>2]|0;
    $$sum48 = (($$sum3) + 12)|0;
    $gep_int114 = $mem;
    $gep115 = (($gep_int114) + ($$sum48))|0;
    $30 = $gep115;
    $31 = $30;
    $32 = HEAP32[$30>>2]|0;
    $33 = $25 << 1;
    $expanded4 = 2360;
    $gep_int116 = 2360;
    $gep117 = (($gep_int116) + 40)|0;
    $gep_array = $33<<2;
    $gep118 = (($gep117) + ($gep_array))|0;
    $34 = $gep118;
    $35 = $34;
    $36 = ($29|0)==($35|0);
    
    do {
     if (!($36)) {
      $37 = $29;
      $38 = ($37>>>0)<($4>>>0);
      
      if ($38) {
       _abort();
       // unreachable
      }
      $gep_int119 = $29;
      $gep120 = (($gep_int119) + 12)|0;
      $39 = $gep120;
      $40 = HEAP32[$39>>2]|0;
      $41 = ($40|0)==($20|0);
      
      if ($41) {
       break;
      }
      _abort();
      // unreachable
     }
    } while(0);
    $42 = ($32|0)==($29|0);
    
    if ($42) {
     $43 = 1 << $25;
     $44 = $43 ^ -1;
     $expanded6 = 2360;
     $gep_int121 = 2360;
     $expanded5 = $gep_int121;
     $45 = HEAP32[$expanded5>>2]|0;
     $46 = $45 & $44;
     $expanded8 = 2360;
     $gep_int122 = 2360;
     $expanded7 = $gep_int122;
     HEAP32[$expanded7>>2] = $46;
     
     $p$0 = $20;$psize$0 = $21;
     break;
    }
    $47 = ($32|0)==($35|0);
    
    do {
     if ($47) {
      $gep_int123 = $32;
      $gep124 = (($gep_int123) + 8)|0;
      $$pre84 = $gep124;
      
      $$pre$phi85Z2D = $$pre84;
     } else {
      $48 = $32;
      $49 = ($48>>>0)<($4>>>0);
      
      if ($49) {
       _abort();
       // unreachable
      }
      $gep_int125 = $32;
      $gep126 = (($gep_int125) + 8)|0;
      $50 = $gep126;
      $51 = HEAP32[$50>>2]|0;
      $52 = ($51|0)==($20|0);
      
      if ($52) {
       $$pre$phi85Z2D = $50;
       break;
      }
      _abort();
      // unreachable
     }
    } while(0);
    
    $gep_int127 = $29;
    $gep128 = (($gep_int127) + 12)|0;
    $53 = $gep128;
    HEAP32[$53>>2] = $32;
    HEAP32[$$pre$phi85Z2D>>2] = $29;
    
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $54 = $19;
   $$sum37 = (($$sum3) + 24)|0;
   $gep_int129 = $mem;
   $gep130 = (($gep_int129) + ($$sum37))|0;
   $55 = $gep130;
   $56 = $55;
   $57 = HEAP32[$55>>2]|0;
   $$sum38 = (($$sum3) + 12)|0;
   $gep_int131 = $mem;
   $gep132 = (($gep_int131) + ($$sum38))|0;
   $58 = $gep132;
   $59 = $58;
   $60 = HEAP32[$58>>2]|0;
   $61 = ($60|0)==($54|0);
   
   do {
    if ($61) {
     $$sum40 = (($$sum3) + 20)|0;
     $gep_int139 = $mem;
     $gep140 = (($gep_int139) + ($$sum40))|0;
     $73 = $gep140;
     $74 = $73;
     $75 = HEAP32[$73>>2]|0;
     $76 = ($75|0)==(0);
     
     if ($76) {
      $$sum39 = (($$sum3) + 16)|0;
      $gep_int141 = $mem;
      $gep142 = (($gep_int141) + ($$sum39))|0;
      $77 = $gep142;
      $78 = $77;
      $79 = HEAP32[$77>>2]|0;
      $80 = ($79|0)==(0);
      
      if ($80) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $79;$RP$0 = $78;
      }
     } else {
      $R$0 = $75;$RP$0 = $74;
     }
     while(1) {
      
      
      $gep_int143 = $R$0;
      $gep144 = (($gep_int143) + 20)|0;
      $81 = $gep144;
      $82 = HEAP32[$81>>2]|0;
      $83 = ($82|0)==(0);
      
      if (!($83)) {
       $RP$0$phi = $81;$R$0$phi = $82;$RP$0 = $RP$0$phi;$R$0 = $R$0$phi;
       continue;
      }
      $gep_int145 = $R$0;
      $gep146 = (($gep_int145) + 16)|0;
      $84 = $gep146;
      $85 = HEAP32[$84>>2]|0;
      $86 = ($85|0)==(0);
      
      if ($86) {
       break;
      } else {
       $R$0 = $85;$RP$0 = $84;
      }
     }
     $87 = $RP$0;
     $88 = ($87>>>0)<($4>>>0);
     
     if ($88) {
      _abort();
      // unreachable
     } else {
      HEAP32[$RP$0>>2] = 0;
      
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum44 = (($$sum3) + 8)|0;
     $gep_int133 = $mem;
     $gep134 = (($gep_int133) + ($$sum44))|0;
     $62 = $gep134;
     $63 = $62;
     $64 = HEAP32[$62>>2]|0;
     $65 = $64;
     $66 = ($65>>>0)<($4>>>0);
     
     if ($66) {
      _abort();
      // unreachable
     }
     $gep_int135 = $64;
     $gep136 = (($gep_int135) + 12)|0;
     $67 = $gep136;
     $68 = HEAP32[$67>>2]|0;
     $69 = ($68|0)==($54|0);
     
     if (!($69)) {
      _abort();
      // unreachable
     }
     $gep_int137 = $60;
     $gep138 = (($gep_int137) + 8)|0;
     $70 = $gep138;
     $71 = HEAP32[$70>>2]|0;
     $72 = ($71|0)==($54|0);
     
     if ($72) {
      HEAP32[$67>>2] = $60;
      HEAP32[$70>>2] = $64;
      
      $R$1 = $60;
      break;
     } else {
      _abort();
      // unreachable
     }
    }
   } while(0);
   
   $89 = ($57|0)==(0);
   
   if ($89) {
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $$sum41 = (($$sum3) + 28)|0;
   $gep_int147 = $mem;
   $gep148 = (($gep_int147) + ($$sum41))|0;
   $90 = $gep148;
   $91 = $90;
   $92 = HEAP32[$90>>2]|0;
   $expanded9 = 2360;
   $gep_int149 = 2360;
   $gep150 = (($gep_int149) + 304)|0;
   $gep_array151 = $92<<2;
   $gep152 = (($gep150) + ($gep_array151))|0;
   $93 = $gep152;
   $94 = HEAP32[$93>>2]|0;
   $95 = ($54|0)==($94|0);
   
   do {
    if ($95) {
     HEAP32[$93>>2] = $R$1;
     $cond = ($R$1|0)==(0);
     
     if (!($cond)) {
      break;
     }
     $96 = 1 << $92;
     $97 = $96 ^ -1;
     $expanded11 = 2360;
     $gep_int153 = 2360;
     $gep154 = (($gep_int153) + 4)|0;
     $expanded10 = $gep154;
     $98 = HEAP32[$expanded10>>2]|0;
     $99 = $98 & $97;
     $expanded13 = 2360;
     $gep_int155 = 2360;
     $gep156 = (($gep_int155) + 4)|0;
     $expanded12 = $gep156;
     HEAP32[$expanded12>>2] = $99;
     
     $p$0 = $20;$psize$0 = $21;
     break L10;
    } else {
     $100 = $57;
     $expanded15 = 2360;
     $gep_int157 = 2360;
     $gep158 = (($gep_int157) + 16)|0;
     $expanded14 = $gep158;
     $101 = HEAP32[$expanded14>>2]|0;
     $102 = ($100>>>0)<($101>>>0);
     
     if ($102) {
      _abort();
      // unreachable
     }
     $gep_int159 = $57;
     $gep160 = (($gep_int159) + 16)|0;
     $103 = $gep160;
     $104 = HEAP32[$103>>2]|0;
     $105 = ($104|0)==($54|0);
     
     if ($105) {
      HEAP32[$103>>2] = $R$1;
      
     } else {
      $gep_int161 = $57;
      $gep162 = (($gep_int161) + 20)|0;
      $106 = $gep162;
      HEAP32[$106>>2] = $R$1;
      
     }
     $107 = ($R$1|0)==(0);
     
     if ($107) {
      $p$0 = $20;$psize$0 = $21;
      break L10;
     }
    }
   } while(0);
   $108 = $R$1;
   $expanded17 = 2360;
   $gep_int163 = 2360;
   $gep164 = (($gep_int163) + 16)|0;
   $expanded16 = $gep164;
   $109 = HEAP32[$expanded16>>2]|0;
   $110 = ($108>>>0)<($109>>>0);
   
   if ($110) {
    _abort();
    // unreachable
   }
   $gep_int165 = $R$1;
   $gep166 = (($gep_int165) + 24)|0;
   $111 = $gep166;
   HEAP32[$111>>2] = $57;
   $$sum42 = (($$sum3) + 16)|0;
   $gep_int167 = $mem;
   $gep168 = (($gep_int167) + ($$sum42))|0;
   $112 = $gep168;
   $113 = $112;
   $114 = HEAP32[$112>>2]|0;
   $115 = ($114|0)==(0);
   
   do {
    if (!($115)) {
     $116 = $114;
     $expanded19 = 2360;
     $gep_int169 = 2360;
     $gep170 = (($gep_int169) + 16)|0;
     $expanded18 = $gep170;
     $117 = HEAP32[$expanded18>>2]|0;
     $118 = ($116>>>0)<($117>>>0);
     
     if ($118) {
      _abort();
      // unreachable
     } else {
      $gep_int171 = $R$1;
      $gep172 = (($gep_int171) + 16)|0;
      $119 = $gep172;
      HEAP32[$119>>2] = $114;
      $gep_int173 = $114;
      $gep174 = (($gep_int173) + 24)|0;
      $120 = $gep174;
      HEAP32[$120>>2] = $R$1;
      
      break;
     }
    }
   } while(0);
   $$sum43 = (($$sum3) + 20)|0;
   $gep_int175 = $mem;
   $gep176 = (($gep_int175) + ($$sum43))|0;
   $121 = $gep176;
   $122 = $121;
   $123 = HEAP32[$121>>2]|0;
   $124 = ($123|0)==(0);
   
   if ($124) {
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $125 = $123;
   $expanded21 = 2360;
   $gep_int177 = 2360;
   $gep178 = (($gep_int177) + 16)|0;
   $expanded20 = $gep178;
   $126 = HEAP32[$expanded20>>2]|0;
   $127 = ($125>>>0)<($126>>>0);
   
   if ($127) {
    _abort();
    // unreachable
   } else {
    $gep_int179 = $R$1;
    $gep180 = (($gep_int179) + 20)|0;
    $128 = $gep180;
    HEAP32[$128>>2] = $123;
    $gep_int181 = $123;
    $gep182 = (($gep_int181) + 24)|0;
    $129 = $gep182;
    HEAP32[$129>>2] = $R$1;
    
    $p$0 = $20;$psize$0 = $21;
    break;
   }
  } else {
   $p$0 = $3;$psize$0 = $11;
  }
 } while(0);
 
 
 $141 = $p$0;
 $142 = ($141>>>0)<($12>>>0);
 
 if (!($142)) {
  _abort();
  // unreachable
 }
 $$sum34 = (($11) + -4)|0;
 $gep_int189 = $mem;
 $gep190 = (($gep_int189) + ($$sum34))|0;
 $143 = $gep190;
 $144 = $143;
 $145 = HEAP32[$143>>2]|0;
 $146 = $145 & 1;
 $phitmp = ($146|0)==(0);
 
 if ($phitmp) {
  _abort();
  // unreachable
 }
 $147 = $145 & 2;
 $148 = ($147|0)==(0);
 
 do {
  if ($148) {
   $expanded25 = 2360;
   $gep_int191 = 2360;
   $gep192 = (($gep_int191) + 24)|0;
   $expanded24 = $gep192;
   $149 = HEAP32[$expanded24>>2]|0;
   $150 = ($13|0)==($149|0);
   
   if ($150) {
    $expanded27 = 2360;
    $gep_int193 = 2360;
    $gep194 = (($gep_int193) + 12)|0;
    $expanded26 = $gep194;
    $151 = HEAP32[$expanded26>>2]|0;
    $152 = (($151) + ($psize$0))|0;
    $expanded29 = 2360;
    $gep_int195 = 2360;
    $gep196 = (($gep_int195) + 12)|0;
    $expanded28 = $gep196;
    HEAP32[$expanded28>>2] = $152;
    $expanded31 = 2360;
    $gep_int197 = 2360;
    $gep198 = (($gep_int197) + 24)|0;
    $expanded30 = $gep198;
    HEAP32[$expanded30>>2] = $p$0;
    $153 = $152 | 1;
    $gep_int199 = $p$0;
    $gep200 = (($gep_int199) + 4)|0;
    $154 = $gep200;
    HEAP32[$154>>2] = $153;
    $expanded33 = 2360;
    $gep_int201 = 2360;
    $gep202 = (($gep_int201) + 20)|0;
    $expanded32 = $gep202;
    $155 = HEAP32[$expanded32>>2]|0;
    $156 = ($p$0|0)==($155|0);
    
    if (!($156)) {
     STACKTOP = sp;return;
    }
    $expanded35 = 2360;
    $gep_int203 = 2360;
    $gep204 = (($gep_int203) + 20)|0;
    $expanded34 = $gep204;
    HEAP32[$expanded34>>2] = 0;
    $expanded37 = 2360;
    $gep_int205 = 2360;
    $gep206 = (($gep_int205) + 8)|0;
    $expanded36 = $gep206;
    HEAP32[$expanded36>>2] = 0;
    
    STACKTOP = sp;return;
   }
   $expanded39 = 2360;
   $gep_int207 = 2360;
   $gep208 = (($gep_int207) + 20)|0;
   $expanded38 = $gep208;
   $157 = HEAP32[$expanded38>>2]|0;
   $158 = ($13|0)==($157|0);
   
   if ($158) {
    $expanded41 = 2360;
    $gep_int209 = 2360;
    $gep210 = (($gep_int209) + 8)|0;
    $expanded40 = $gep210;
    $159 = HEAP32[$expanded40>>2]|0;
    $160 = (($159) + ($psize$0))|0;
    $expanded43 = 2360;
    $gep_int211 = 2360;
    $gep212 = (($gep_int211) + 8)|0;
    $expanded42 = $gep212;
    HEAP32[$expanded42>>2] = $160;
    $expanded45 = 2360;
    $gep_int213 = 2360;
    $gep214 = (($gep_int213) + 20)|0;
    $expanded44 = $gep214;
    HEAP32[$expanded44>>2] = $p$0;
    $161 = $160 | 1;
    $gep_int215 = $p$0;
    $gep216 = (($gep_int215) + 4)|0;
    $162 = $gep216;
    HEAP32[$162>>2] = $161;
    $gep_int217 = $p$0;
    $gep218 = (($gep_int217) + ($160))|0;
    $163 = $gep218;
    $164 = $163;
    HEAP32[$163>>2] = $160;
    
    STACKTOP = sp;return;
   }
   $165 = $145 & -8;
   $166 = (($165) + ($psize$0))|0;
   $167 = $145 >>> 3;
   $168 = ($145>>>0)<(256);
   
   L112: do {
    if ($168) {
     $gep_int219 = $mem;
     $gep220 = (($gep_int219) + ($11))|0;
     $169 = $gep220;
     $170 = $169;
     $171 = HEAP32[$169>>2]|0;
     $$sum2829 = $11 | 4;
     $gep_int221 = $mem;
     $gep222 = (($gep_int221) + ($$sum2829))|0;
     $172 = $gep222;
     $173 = $172;
     $174 = HEAP32[$172>>2]|0;
     $175 = $167 << 1;
     $expanded46 = 2360;
     $gep_int223 = 2360;
     $gep224 = (($gep_int223) + 40)|0;
     $gep_array225 = $175<<2;
     $gep226 = (($gep224) + ($gep_array225))|0;
     $176 = $gep226;
     $177 = $176;
     $178 = ($171|0)==($177|0);
     
     do {
      if (!($178)) {
       $179 = $171;
       $expanded48 = 2360;
       $gep_int227 = 2360;
       $gep228 = (($gep_int227) + 16)|0;
       $expanded47 = $gep228;
       $180 = HEAP32[$expanded47>>2]|0;
       $181 = ($179>>>0)<($180>>>0);
       
       if ($181) {
        _abort();
        // unreachable
       }
       $gep_int229 = $171;
       $gep230 = (($gep_int229) + 12)|0;
       $182 = $gep230;
       $183 = HEAP32[$182>>2]|0;
       $184 = ($183|0)==($13|0);
       
       if ($184) {
        break;
       }
       _abort();
       // unreachable
      }
     } while(0);
     $185 = ($174|0)==($171|0);
     
     if ($185) {
      $186 = 1 << $167;
      $187 = $186 ^ -1;
      $expanded50 = 2360;
      $gep_int231 = 2360;
      $expanded49 = $gep_int231;
      $188 = HEAP32[$expanded49>>2]|0;
      $189 = $188 & $187;
      $expanded52 = 2360;
      $gep_int232 = 2360;
      $expanded51 = $gep_int232;
      HEAP32[$expanded51>>2] = $189;
      
      break;
     }
     $190 = ($174|0)==($177|0);
     
     do {
      if ($190) {
       $gep_int233 = $174;
       $gep234 = (($gep_int233) + 8)|0;
       $$pre82 = $gep234;
       
       $$pre$phi83Z2D = $$pre82;
      } else {
       $191 = $174;
       $expanded54 = 2360;
       $gep_int235 = 2360;
       $gep236 = (($gep_int235) + 16)|0;
       $expanded53 = $gep236;
       $192 = HEAP32[$expanded53>>2]|0;
       $193 = ($191>>>0)<($192>>>0);
       
       if ($193) {
        _abort();
        // unreachable
       }
       $gep_int237 = $174;
       $gep238 = (($gep_int237) + 8)|0;
       $194 = $gep238;
       $195 = HEAP32[$194>>2]|0;
       $196 = ($195|0)==($13|0);
       
       if ($196) {
        $$pre$phi83Z2D = $194;
        break;
       }
       _abort();
       // unreachable
      }
     } while(0);
     
     $gep_int239 = $171;
     $gep240 = (($gep_int239) + 12)|0;
     $197 = $gep240;
     HEAP32[$197>>2] = $174;
     HEAP32[$$pre$phi83Z2D>>2] = $171;
     
    } else {
     $198 = $12;
     $$sum6 = (($11) + 16)|0;
     $gep_int241 = $mem;
     $gep242 = (($gep_int241) + ($$sum6))|0;
     $199 = $gep242;
     $200 = $199;
     $201 = HEAP32[$199>>2]|0;
     $$sum78 = $11 | 4;
     $gep_int243 = $mem;
     $gep244 = (($gep_int243) + ($$sum78))|0;
     $202 = $gep244;
     $203 = $202;
     $204 = HEAP32[$202>>2]|0;
     $205 = ($204|0)==($198|0);
     
     do {
      if ($205) {
       $$sum10 = (($11) + 12)|0;
       $gep_int253 = $mem;
       $gep254 = (($gep_int253) + ($$sum10))|0;
       $218 = $gep254;
       $219 = $218;
       $220 = HEAP32[$218>>2]|0;
       $221 = ($220|0)==(0);
       
       if ($221) {
        $$sum9 = (($11) + 8)|0;
        $gep_int255 = $mem;
        $gep256 = (($gep_int255) + ($$sum9))|0;
        $222 = $gep256;
        $223 = $222;
        $224 = HEAP32[$222>>2]|0;
        $225 = ($224|0)==(0);
        
        if ($225) {
         $R7$1 = 0;
         break;
        } else {
         $R7$0 = $224;$RP9$0 = $223;
        }
       } else {
        $R7$0 = $220;$RP9$0 = $219;
       }
       while(1) {
        
        
        $gep_int257 = $R7$0;
        $gep258 = (($gep_int257) + 20)|0;
        $226 = $gep258;
        $227 = HEAP32[$226>>2]|0;
        $228 = ($227|0)==(0);
        
        if (!($228)) {
         $RP9$0$phi = $226;$R7$0$phi = $227;$RP9$0 = $RP9$0$phi;$R7$0 = $R7$0$phi;
         continue;
        }
        $gep_int259 = $R7$0;
        $gep260 = (($gep_int259) + 16)|0;
        $229 = $gep260;
        $230 = HEAP32[$229>>2]|0;
        $231 = ($230|0)==(0);
        
        if ($231) {
         break;
        } else {
         $R7$0 = $230;$RP9$0 = $229;
        }
       }
       $232 = $RP9$0;
       $expanded58 = 2360;
       $gep_int261 = 2360;
       $gep262 = (($gep_int261) + 16)|0;
       $expanded57 = $gep262;
       $233 = HEAP32[$expanded57>>2]|0;
       $234 = ($232>>>0)<($233>>>0);
       
       if ($234) {
        _abort();
        // unreachable
       } else {
        HEAP32[$RP9$0>>2] = 0;
        
        $R7$1 = $R7$0;
        break;
       }
      } else {
       $gep_int245 = $mem;
       $gep246 = (($gep_int245) + ($11))|0;
       $206 = $gep246;
       $207 = $206;
       $208 = HEAP32[$206>>2]|0;
       $209 = $208;
       $expanded56 = 2360;
       $gep_int247 = 2360;
       $gep248 = (($gep_int247) + 16)|0;
       $expanded55 = $gep248;
       $210 = HEAP32[$expanded55>>2]|0;
       $211 = ($209>>>0)<($210>>>0);
       
       if ($211) {
        _abort();
        // unreachable
       }
       $gep_int249 = $208;
       $gep250 = (($gep_int249) + 12)|0;
       $212 = $gep250;
       $213 = HEAP32[$212>>2]|0;
       $214 = ($213|0)==($198|0);
       
       if (!($214)) {
        _abort();
        // unreachable
       }
       $gep_int251 = $204;
       $gep252 = (($gep_int251) + 8)|0;
       $215 = $gep252;
       $216 = HEAP32[$215>>2]|0;
       $217 = ($216|0)==($198|0);
       
       if ($217) {
        HEAP32[$212>>2] = $204;
        HEAP32[$215>>2] = $208;
        
        $R7$1 = $204;
        break;
       } else {
        _abort();
        // unreachable
       }
      }
     } while(0);
     
     $235 = ($201|0)==(0);
     
     if ($235) {
      break;
     }
     $$sum21 = (($11) + 20)|0;
     $gep_int263 = $mem;
     $gep264 = (($gep_int263) + ($$sum21))|0;
     $236 = $gep264;
     $237 = $236;
     $238 = HEAP32[$236>>2]|0;
     $expanded59 = 2360;
     $gep_int265 = 2360;
     $gep266 = (($gep_int265) + 304)|0;
     $gep_array267 = $238<<2;
     $gep268 = (($gep266) + ($gep_array267))|0;
     $239 = $gep268;
     $240 = HEAP32[$239>>2]|0;
     $241 = ($198|0)==($240|0);
     
     do {
      if ($241) {
       HEAP32[$239>>2] = $R7$1;
       $cond69 = ($R7$1|0)==(0);
       
       if (!($cond69)) {
        break;
       }
       $242 = 1 << $238;
       $243 = $242 ^ -1;
       $expanded61 = 2360;
       $gep_int269 = 2360;
       $gep270 = (($gep_int269) + 4)|0;
       $expanded60 = $gep270;
       $244 = HEAP32[$expanded60>>2]|0;
       $245 = $244 & $243;
       $expanded63 = 2360;
       $gep_int271 = 2360;
       $gep272 = (($gep_int271) + 4)|0;
       $expanded62 = $gep272;
       HEAP32[$expanded62>>2] = $245;
       
       break L112;
      } else {
       $246 = $201;
       $expanded65 = 2360;
       $gep_int273 = 2360;
       $gep274 = (($gep_int273) + 16)|0;
       $expanded64 = $gep274;
       $247 = HEAP32[$expanded64>>2]|0;
       $248 = ($246>>>0)<($247>>>0);
       
       if ($248) {
        _abort();
        // unreachable
       }
       $gep_int275 = $201;
       $gep276 = (($gep_int275) + 16)|0;
       $249 = $gep276;
       $250 = HEAP32[$249>>2]|0;
       $251 = ($250|0)==($198|0);
       
       if ($251) {
        HEAP32[$249>>2] = $R7$1;
        
       } else {
        $gep_int277 = $201;
        $gep278 = (($gep_int277) + 20)|0;
        $252 = $gep278;
        HEAP32[$252>>2] = $R7$1;
        
       }
       $253 = ($R7$1|0)==(0);
       
       if ($253) {
        break L112;
       }
      }
     } while(0);
     $254 = $R7$1;
     $expanded67 = 2360;
     $gep_int279 = 2360;
     $gep280 = (($gep_int279) + 16)|0;
     $expanded66 = $gep280;
     $255 = HEAP32[$expanded66>>2]|0;
     $256 = ($254>>>0)<($255>>>0);
     
     if ($256) {
      _abort();
      // unreachable
     }
     $gep_int281 = $R7$1;
     $gep282 = (($gep_int281) + 24)|0;
     $257 = $gep282;
     HEAP32[$257>>2] = $201;
     $$sum22 = (($11) + 8)|0;
     $gep_int283 = $mem;
     $gep284 = (($gep_int283) + ($$sum22))|0;
     $258 = $gep284;
     $259 = $258;
     $260 = HEAP32[$258>>2]|0;
     $261 = ($260|0)==(0);
     
     do {
      if (!($261)) {
       $262 = $260;
       $expanded69 = 2360;
       $gep_int285 = 2360;
       $gep286 = (($gep_int285) + 16)|0;
       $expanded68 = $gep286;
       $263 = HEAP32[$expanded68>>2]|0;
       $264 = ($262>>>0)<($263>>>0);
       
       if ($264) {
        _abort();
        // unreachable
       } else {
        $gep_int287 = $R7$1;
        $gep288 = (($gep_int287) + 16)|0;
        $265 = $gep288;
        HEAP32[$265>>2] = $260;
        $gep_int289 = $260;
        $gep290 = (($gep_int289) + 24)|0;
        $266 = $gep290;
        HEAP32[$266>>2] = $R7$1;
        
        break;
       }
      }
     } while(0);
     $$sum23 = (($11) + 12)|0;
     $gep_int291 = $mem;
     $gep292 = (($gep_int291) + ($$sum23))|0;
     $267 = $gep292;
     $268 = $267;
     $269 = HEAP32[$267>>2]|0;
     $270 = ($269|0)==(0);
     
     if ($270) {
      break;
     }
     $271 = $269;
     $expanded71 = 2360;
     $gep_int293 = 2360;
     $gep294 = (($gep_int293) + 16)|0;
     $expanded70 = $gep294;
     $272 = HEAP32[$expanded70>>2]|0;
     $273 = ($271>>>0)<($272>>>0);
     
     if ($273) {
      _abort();
      // unreachable
     } else {
      $gep_int295 = $R7$1;
      $gep296 = (($gep_int295) + 20)|0;
      $274 = $gep296;
      HEAP32[$274>>2] = $269;
      $gep_int297 = $269;
      $gep298 = (($gep_int297) + 24)|0;
      $275 = $gep298;
      HEAP32[$275>>2] = $R7$1;
      
      break;
     }
    }
   } while(0);
   $276 = $166 | 1;
   $gep_int299 = $p$0;
   $gep300 = (($gep_int299) + 4)|0;
   $277 = $gep300;
   HEAP32[$277>>2] = $276;
   $gep_int301 = $p$0;
   $gep302 = (($gep_int301) + ($166))|0;
   $278 = $gep302;
   $279 = $278;
   HEAP32[$278>>2] = $166;
   $expanded73 = 2360;
   $gep_int303 = 2360;
   $gep304 = (($gep_int303) + 20)|0;
   $expanded72 = $gep304;
   $280 = HEAP32[$expanded72>>2]|0;
   $281 = ($p$0|0)==($280|0);
   
   if (!($281)) {
    $psize$1 = $166;
    break;
   }
   $expanded75 = 2360;
   $gep_int305 = 2360;
   $gep306 = (($gep_int305) + 8)|0;
   $expanded74 = $gep306;
   HEAP32[$expanded74>>2] = $166;
   
   STACKTOP = sp;return;
  } else {
   $282 = $145 & -2;
   HEAP32[$143>>2] = $282;
   $283 = $psize$0 | 1;
   $gep_int307 = $p$0;
   $gep308 = (($gep_int307) + 4)|0;
   $284 = $gep308;
   HEAP32[$284>>2] = $283;
   $gep_int309 = $p$0;
   $gep310 = (($gep_int309) + ($psize$0))|0;
   $285 = $gep310;
   $286 = $285;
   HEAP32[$285>>2] = $psize$0;
   
   $psize$1 = $psize$0;
  }
 } while(0);
 
 $287 = $psize$1 >>> 3;
 $288 = ($psize$1>>>0)<(256);
 
 if ($288) {
  $289 = $287 << 1;
  $expanded76 = 2360;
  $gep_int311 = 2360;
  $gep312 = (($gep_int311) + 40)|0;
  $gep_array313 = $289<<2;
  $gep314 = (($gep312) + ($gep_array313))|0;
  $290 = $gep314;
  $291 = $290;
  $expanded78 = 2360;
  $gep_int315 = 2360;
  $expanded77 = $gep_int315;
  $292 = HEAP32[$expanded77>>2]|0;
  $293 = 1 << $287;
  $294 = $292 & $293;
  $295 = ($294|0)==(0);
  
  do {
   if ($295) {
    $296 = $292 | $293;
    $expanded80 = 2360;
    $gep_int316 = 2360;
    $expanded79 = $gep_int316;
    HEAP32[$expanded79>>2] = $296;
    $$sum19$pre = (($289) + 2)|0;
    $expanded81 = 2360;
    $gep_int317 = 2360;
    $gep318 = (($gep_int317) + 40)|0;
    $gep_array319 = $$sum19$pre<<2;
    $gep320 = (($gep318) + ($gep_array319))|0;
    $$pre = $gep320;
    
    $$pre$phiZ2D = $$pre;$F16$0 = $291;
   } else {
    $$sum20 = (($289) + 2)|0;
    $expanded82 = 2360;
    $gep_int321 = 2360;
    $gep322 = (($gep_int321) + 40)|0;
    $gep_array323 = $$sum20<<2;
    $gep324 = (($gep322) + ($gep_array323))|0;
    $297 = $gep324;
    $298 = HEAP32[$297>>2]|0;
    $299 = $298;
    $expanded84 = 2360;
    $gep_int325 = 2360;
    $gep326 = (($gep_int325) + 16)|0;
    $expanded83 = $gep326;
    $300 = HEAP32[$expanded83>>2]|0;
    $301 = ($299>>>0)<($300>>>0);
    
    if (!($301)) {
     $$pre$phiZ2D = $297;$F16$0 = $298;
     break;
    }
    _abort();
    // unreachable
   }
  } while(0);
  
  
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $gep_int327 = $F16$0;
  $gep328 = (($gep_int327) + 12)|0;
  $302 = $gep328;
  HEAP32[$302>>2] = $p$0;
  $gep_int329 = $p$0;
  $gep330 = (($gep_int329) + 8)|0;
  $303 = $gep330;
  HEAP32[$303>>2] = $F16$0;
  $gep_int331 = $p$0;
  $gep332 = (($gep_int331) + 12)|0;
  $304 = $gep332;
  HEAP32[$304>>2] = $291;
  
  STACKTOP = sp;return;
 }
 $305 = $p$0;
 $306 = $psize$1 >>> 8;
 $307 = ($306|0)==(0);
 
 do {
  if ($307) {
   $I18$0 = 0;
  } else {
   $308 = ($psize$1>>>0)>(16777215);
   
   if ($308) {
    $I18$0 = 31;
    break;
   }
   $309 = (($306) + 1048320)|0;
   $310 = $309 >>> 16;
   $311 = $310 & 8;
   $312 = $306 << $311;
   $313 = (($312) + 520192)|0;
   $314 = $313 >>> 16;
   $315 = $314 & 4;
   $316 = $315 | $311;
   $317 = $312 << $315;
   $318 = (($317) + 245760)|0;
   $319 = $318 >>> 16;
   $320 = $319 & 2;
   $321 = $316 | $320;
   $322 = (14 - ($321))|0;
   $323 = $317 << $320;
   $324 = $323 >>> 15;
   $325 = (($322) + ($324))|0;
   $326 = $325 << 1;
   $327 = (($325) + 7)|0;
   $328 = $psize$1 >>> $327;
   $329 = $328 & 1;
   $330 = $329 | $326;
   
   $I18$0 = $330;
  }
 } while(0);
 
 $expanded85 = 2360;
 $gep_int333 = 2360;
 $gep334 = (($gep_int333) + 304)|0;
 $gep_array335 = $I18$0<<2;
 $gep336 = (($gep334) + ($gep_array335))|0;
 $331 = $gep336;
 $gep_int337 = $p$0;
 $gep338 = (($gep_int337) + 28)|0;
 $332 = $gep338;
 $I18$0$c = $I18$0;
 HEAP32[$332>>2] = $I18$0$c;
 $gep_int339 = $p$0;
 $gep340 = (($gep_int339) + 20)|0;
 $333 = $gep340;
 HEAP32[$333>>2] = 0;
 $gep_int341 = $p$0;
 $gep342 = (($gep_int341) + 16)|0;
 $334 = $gep342;
 HEAP32[$334>>2] = 0;
 $expanded87 = 2360;
 $gep_int343 = 2360;
 $gep344 = (($gep_int343) + 4)|0;
 $expanded86 = $gep344;
 $335 = HEAP32[$expanded86>>2]|0;
 $336 = 1 << $I18$0;
 $337 = $335 & $336;
 $338 = ($337|0)==(0);
 
 L199: do {
  if ($338) {
   $339 = $335 | $336;
   $expanded89 = 2360;
   $gep_int345 = 2360;
   $gep346 = (($gep_int345) + 4)|0;
   $expanded88 = $gep346;
   HEAP32[$expanded88>>2] = $339;
   HEAP32[$331>>2] = $305;
   $gep_int347 = $p$0;
   $gep348 = (($gep_int347) + 24)|0;
   $340 = $gep348;
   $$c = $331;
   HEAP32[$340>>2] = $$c;
   $gep_int349 = $p$0;
   $gep350 = (($gep_int349) + 12)|0;
   $341 = $gep350;
   HEAP32[$341>>2] = $p$0;
   $gep_int351 = $p$0;
   $gep352 = (($gep_int351) + 8)|0;
   $342 = $gep352;
   HEAP32[$342>>2] = $p$0;
   
  } else {
   $343 = HEAP32[$331>>2]|0;
   $344 = ($I18$0|0)==(31);
   
   if ($344) {
    $347 = 0;
   } else {
    $345 = $I18$0 >>> 1;
    $346 = (25 - ($345))|0;
    
    $347 = $346;
   }
   
   $gep_int353 = $343;
   $gep354 = (($gep_int353) + 4)|0;
   $348 = $gep354;
   $349 = HEAP32[$348>>2]|0;
   $350 = $349 & -8;
   $351 = ($350|0)==($psize$1|0);
   
   L204: do {
    if ($351) {
     $T$0$lcssa = $343;
    } else {
     $352 = $psize$1 << $347;
     
     $K19$072 = $352;$T$071 = $343;
     while(1) {
      
      
      $358 = $K19$072 >>> 31;
      $gep_int357 = $T$071;
      $gep358 = (($gep_int357) + 16)|0;
      $gep_array359 = $358<<2;
      $gep360 = (($gep358) + ($gep_array359))|0;
      $359 = $gep360;
      $360 = HEAP32[$359>>2]|0;
      $361 = ($360|0)==(0);
      
      if ($361) {
       break;
      }
      $353 = $K19$072 << 1;
      $gep_int355 = $360;
      $gep356 = (($gep_int355) + 4)|0;
      $354 = $gep356;
      $355 = HEAP32[$354>>2]|0;
      $356 = $355 & -8;
      $357 = ($356|0)==($psize$1|0);
      
      if ($357) {
       $T$0$lcssa = $360;
       break L204;
      } else {
       $T$071$phi = $360;$K19$072 = $353;$T$071 = $T$071$phi;
      }
     }
     $362 = $359;
     $expanded91 = 2360;
     $gep_int361 = 2360;
     $gep362 = (($gep_int361) + 16)|0;
     $expanded90 = $gep362;
     $363 = HEAP32[$expanded90>>2]|0;
     $364 = ($362>>>0)<($363>>>0);
     
     if ($364) {
      _abort();
      // unreachable
     } else {
      HEAP32[$359>>2] = $305;
      $gep_int363 = $p$0;
      $gep364 = (($gep_int363) + 24)|0;
      $365 = $gep364;
      $T$0$c16 = $T$071;
      HEAP32[$365>>2] = $T$0$c16;
      $gep_int365 = $p$0;
      $gep366 = (($gep_int365) + 12)|0;
      $366 = $gep366;
      HEAP32[$366>>2] = $p$0;
      $gep_int367 = $p$0;
      $gep368 = (($gep_int367) + 8)|0;
      $367 = $gep368;
      HEAP32[$367>>2] = $p$0;
      
      break L199;
     }
    }
   } while(0);
   
   $gep_int369 = $T$0$lcssa;
   $gep370 = (($gep_int369) + 8)|0;
   $368 = $gep370;
   $369 = HEAP32[$368>>2]|0;
   $370 = $T$0$lcssa;
   $expanded93 = 2360;
   $gep_int371 = 2360;
   $gep372 = (($gep_int371) + 16)|0;
   $expanded92 = $gep372;
   $371 = HEAP32[$expanded92>>2]|0;
   $372 = ($370>>>0)<($371>>>0);
   
   if ($372) {
    _abort();
    // unreachable
   }
   $373 = $369;
   $374 = ($373>>>0)<($371>>>0);
   
   if ($374) {
    _abort();
    // unreachable
   } else {
    $gep_int373 = $369;
    $gep374 = (($gep_int373) + 12)|0;
    $375 = $gep374;
    HEAP32[$375>>2] = $305;
    HEAP32[$368>>2] = $305;
    $gep_int375 = $p$0;
    $gep376 = (($gep_int375) + 8)|0;
    $376 = $gep376;
    $$c15 = $369;
    HEAP32[$376>>2] = $$c15;
    $gep_int377 = $p$0;
    $gep378 = (($gep_int377) + 12)|0;
    $377 = $gep378;
    $T$0$c = $T$0$lcssa;
    HEAP32[$377>>2] = $T$0$c;
    $gep_int379 = $p$0;
    $gep380 = (($gep_int379) + 24)|0;
    $378 = $gep380;
    HEAP32[$378>>2] = 0;
    
    break;
   }
  }
 } while(0);
 $expanded95 = 2360;
 $gep_int381 = 2360;
 $gep382 = (($gep_int381) + 32)|0;
 $expanded94 = $gep382;
 $379 = HEAP32[$expanded94>>2]|0;
 $380 = (($379) + -1)|0;
 $expanded97 = 2360;
 $gep_int383 = 2360;
 $gep384 = (($gep_int383) + 32)|0;
 $expanded96 = $gep384;
 HEAP32[$expanded96>>2] = $380;
 $381 = ($380|0)==(0);
 $expanded99 = 2360;
 $gep_int385 = 2360;
 $gep386 = (($gep_int385) + 456)|0;
 $expanded98 = $gep386;
 
 if ($381) {
  $sp$0$in$i = $expanded98;
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $382 = ($sp$0$i|0)==(0);
  $gep_int387 = $sp$0$i;
  $gep388 = (($gep_int387) + 8)|0;
  $383 = $gep388;
  
  if ($382) {
   break;
  } else {
   $sp$0$in$i$phi = $383;$sp$0$in$i = $sp$0$in$i$phi;
  }
 }
 $expanded101 = 2360;
 $gep_int389 = 2360;
 $gep390 = (($gep_int389) + 32)|0;
 $expanded100 = $gep390;
 HEAP32[$expanded100>>2] = -1;
 
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

// EMSCRIPTEN_END_FUNCS

  
  function dynCall_ii(index,a1) {
    index = index|0;
    a1=a1|0;
    return FUNCTION_TABLE_ii[index&3](a1|0)|0;
  }


  function dynCall_iii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    return FUNCTION_TABLE_iii[index&1](a1|0,a2|0)|0;
  }

function b0(p0) { p0 = p0|0; nullFunc_ii(0);return 0; }
  function _time__wrapper(p0) { p0 = p0|0; return _time(p0|0)|0; }
  function _emscripten_get_now__wrapper(p0) { p0 = p0|0; return _emscripten_get_now(p0|0)|0; }
  function b1(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_iii(1);return 0; }
  function _printf__wrapper(p0,p1) { p0 = p0|0;p1 = p1|0; return _printf(p0|0,p1|0)|0; }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_ii = [b0,_time__wrapper,_emscripten_get_now__wrapper,b0];
  var FUNCTION_TABLE_iii = [b1,_printf__wrapper];

  return { _strlen: _strlen, _free: _free, _main: _main, _rand_r: _rand_r, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _rand: _rand, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_ii: dynCall_ii, dynCall_iii: dynCall_iii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "nullFunc_ii": nullFunc_ii, "nullFunc_iii": nullFunc_iii, "invoke_ii": invoke_ii, "invoke_iii": invoke_iii, "_llvm_lifetime_start": _llvm_lifetime_start, "_clReleaseProgram": _clReleaseProgram, "_send": _send, "_fread": _fread, "_clReleaseKernel": _clReleaseKernel, "_clReleaseContext": _clReleaseContext, "_open": _open, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clCreateContext": _clCreateContext, "_clEnqueueWriteBuffer": _clEnqueueWriteBuffer, "_clCreateProgramWithSource": _clCreateProgramWithSource, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "_time": _time, "_pwrite": _pwrite, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_clReleaseMemObject": _clReleaseMemObject, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_pread": _pread, "_read": _read, "_sysconf": _sysconf, "_srand": _srand, "_close": _close, "__formatString": __formatString, "_clFinish": _clFinish, "_clCreateCommandQueue": _clCreateCommandQueue, "_clGetDeviceIDs": _clGetDeviceIDs, "_fclose": _fclose, "_clReleaseCommandQueue": _clReleaseCommandQueue, "__reallyNegative": __reallyNegative, "_clGetDeviceInfo": _clGetDeviceInfo, "_write": _write, "_fflush": _fflush, "_fsync": _fsync, "___errno_location": ___errno_location, "_clCreateBuffer": _clCreateBuffer, "_stat": _stat, "_recv": _recv, "_printf": _printf, "_mkport": _mkport, "_clCreateKernel": _clCreateKernel, "_clSetKernelArg": _clSetKernelArg, "_abort": _abort, "_fwrite": _fwrite, "_emscripten_get_now": _emscripten_get_now, "_clBuildProgram": _clBuildProgram, "_fprintf": _fprintf, "_strstr": _strstr, "_llvm_lifetime_end": _llvm_lifetime_end, "_fopen": _fopen, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "_clGetKernelWorkGroupInfo": _clGetKernelWorkGroupInfo, "_clCreateImage2D": _clCreateImage2D, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "___rand_seed": ___rand_seed, "NaN": NaN, "Infinity": Infinity }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _rand_r = Module["_rand_r"] = asm["_rand_r"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _rand = Module["_rand"] = asm["_rand"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];

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

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

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



//@ sourceMappingURL=osx_histogram.js.map