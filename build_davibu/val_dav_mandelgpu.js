
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
    var PACKAGE_NAME = '../build/val_dav_mandelgpu.data';
    var REMOTE_PACKAGE_NAME = (Module['filePackagePrefixURL'] || '') + 'val_dav_mandelgpu.data';
    var REMOTE_PACKAGE_SIZE = 12318;
    var PACKAGE_UUID = 'c329f385-e181-4311-a46b-d1f3c47357a1';
  
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
      new DataRequest(0, 0, 0, 0).open('GET', '/rendering_kernel_float4.cl');
    new DataRequest(0, 12318, 0, 0).open('GET', '/rendering_kernel.cl');

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/rendering_kernel_float4.cl"].onload();
          DataRequest.prototype.requests["/rendering_kernel.cl"].onload();
          Module['removeRunDependency']('datafile_../build/val_dav_mandelgpu.data');

    };
    Module['addRunDependency']('datafile_../build/val_dav_mandelgpu.data');
  
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

STATICTOP = STATIC_BASE + Runtime.alignMemory(3371);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,111,117,116,112,117,116,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,111,117,116,112,117,116,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,49,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,50,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,101,110,113,117,101,117,101,32,79,112,101,110,67,76,32,119,111,114,107,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,97,105,116,32,116,104,101,32,101,110,100,32,111,102,32,79,112,101,110,67,76,32,101,120,101,99,117,116,105,111,110,58,32,37,100,10,0,70,97,105,108,101,100,32,116,111,32,116,104,101,32,79,112,101,110,67,76,32,111,117,116,112,117,116,32,98,117,102,102,101,114,58,32,37,100,10,0,82,101,110,100,101,114,105,110,103,32,116,105,109,101,58,32,37,46,51,102,32,115,101,99,115,32,40,83,97,109,112,108,101,47,115,101,99,32,37,46,49,102,75,32,77,97,120,46,32,73,116,101,114,97,116,105,111,110,115,32,37,100,41,0,85,115,97,103,101,58,32,37,115,10,0,0,0,0,0,0,85,115,97,103,101,58,32,37,115,32,60,117,115,101,32,67,80,85,32,100,101,118,105,99,101,32,40,48,32,111,114,32,49,41,62,32,32,60,117,115,101,32,71,80,85,32,100,101,118,105,99,101,32,40,48,32,111,114,32,49,41,62,32,60,107,101,114,110,101,108,32,102,105,108,101,32,110,97,109,101,62,32,60,119,105,110,100,111,119,32,119,105,100,116,104,62,32,60,119,105,110,100,111,119,32,104,101,105,103,104,116,62,32,60,109,97,120,46,32,105,116,101,114,97,116,105,111,110,115,62,10,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,64,7,0,0,0,0,0,0,77,97,110,100,101,108,71,80,85,32,86,49,46,51,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,115,10,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,32,73,68,115,10,0,0,0,0,0,0,79,112,101,110,67,76,32,80,108,97,116,102,111,114,109,32,37,100,58,32,37,115,10,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,10,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,32,105,110,102,111,32,115,105,122,101,58,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,32,102,111,114,32,79,112,101,110,67,76,32,100,101,118,105,99,101,32,108,105,115,116,58,32,37,100,10,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,32,105,110,102,111,58,32,37,100,10,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,100,101,118,105,99,101,32,105,110,102,111,58,32,37,100,10,0,0,0,84,89,80,69,95,65,76,76,0,0,0,0,0,0,0,0,84,89,80,69,95,68,69,70,65,85,76,84,0,0,0,0,84,89,80,69,95,67,80,85,0,0,0,0,0,0,0,0,84,89,80,69,95,71,80,85,0,0,0,0,0,0,0,0,84,89,80,69,95,85,78,75,78,79,87,78,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,84,121,112,101,32,61,32,37,115,10,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,78,97,109,101,32,61,32,37,115,10,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,67,111,109,112,117,116,101,32,117,110,105,116,115,32,61,32,37,117,10,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,77,97,120,46,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,117,10,0,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,115,111,117,114,99,101,115,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,79,112,101,110,67,76,32,107,101,114,110,101,108,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,105,110,102,111,32,115,105,122,101,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,105,110,102,111,58,32,37,100,10,0,0,0,79,112,101,110,67,76,32,80,114,111,103,114,97,109,109,32,66,117,105,108,100,32,76,111,103,58,32,37,115,10,0,0,109,97,110,100,101,108,71,80,85,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,107,101,114,110,101,108,58,32,37,100,10,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,105,110,102,111,58,32,37,100,10,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,48,58,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,111,109,109,97,110,100,32,113,117,101,117,101,58,32,37,100,10,0,0,0,0,0,0,114,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,101,107,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,104,101,99,107,32,112,111,115,105,116,105,111,110,32,111,110,32,102,105,108,101,32,39,37,115,39,10,0,0,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,32,102,111,114,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,0,82,101,97,100,105,110,103,32,102,105,108,101,32,39,37,115,39,32,40,115,105,122,101,32,37,108,100,32,98,121,116,101,115,41,10,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,102,105,108,101,32,39,37,115,39,32,40,114,101,97,100,32,37,108,100,41,10,0,0,0,0,114,101,110,100,101,114,105,110,103,95,107,101,114,110,101,108,95,102,108,111,97,116,52,46,99,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,191,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,225,13,0,0,0,0,0,0,9,25,0,0,0,0,0,0,1,20,0,0,0,0,0,0,77,97,110,100,101,108,67,80,85,32,86,49,46,51,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,0,0,77,97,110,100,101,108,71,80,85,32,86,49,46,51,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,0,0,1,0,0,0,0,0,0,0,105,109,97,103,101,46,112,112,109,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,105,109,97,103,101,32,102,105,108,101,58,32,105,109,97,103,101,46,112,112,109,10,0,0,0,80,51,10,37,100,32,37,100,10,37,100,10,0,0,0,0,37,100,32,37,100,32,37,100,32,0,0,0,0,0,0,0,68,111,110,101,46,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,191,0,0,128,191,0,0,128,63,0,0,128,191,0,0,128,63,0,0,128,63,0,0,128,191,0,0,128,63,67,114,101,97,116,105,110,103,32,84,101,120,116,117,114,101,32,49,32,37,100,32,120,32,37,100,46,46,46,10,0,0,193,132,0,0,0,0,0,0,9,25,0,0,0,0,0,0,72,101,108,112,0,0,0,0,104,32,45,32,116,111,103,103,108,101,32,72,101,108,112,0,97,114,114,111,119,32,75,101,121,115,32,45,32,109,111,118,101,32,108,101,102,116,47,114,105,103,104,116,47,117,112,47,100,111,119,110,0,0,0,0,80,97,103,101,85,112,32,97,110,100,32,80,97,103,101,68,111,119,110,32,45,32,122,111,111,109,32,105,110,47,111,117,116,0,0,0,0,0,0,0,77,111,117,115,101,32,98,117,116,116,111,110,32,48,32,43,32,77,111,117,115,101,32,88,44,32,89,32,45,32,109,111,118,101,32,108,101,102,116,47,114,105,103,104,116,47,117,112,47,100,111,119,110,0,0,0,77,111,117,115,101,32,98,117,116,116,111,110,32,50,32,43,32,77,111,117,115,101,32,88,32,45,32,122,111,111,109,32,105,110,47,111,117,116,0,0,43,32,45,32,105,110,99,114,101,97,115,101,32,116,104,101,32,109,97,120,46,32,105,110,116,101,114,97,116,105,111,110,115,32,98,121,32,51,50,0,45,32,45,32,100,101,99,114,101,97,115,101,32,116,104,101,32,109,97,120,46,32,105,110,116,101,114,97,116,105,111,110,115,32,98,121,32,51,50,0,37,115,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




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

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  
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
      }};function _glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

  
  
  
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
      return FS.getStreamFromPtr(stream).fd;
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      var fd = _fileno(stream);
      _fsync(fd);
      return _close(fd);
    }

  function _glPopMatrix() {
      GLImmediate.matricesModified = true;
      GLImmediate.matrixVersion[GLImmediate.currentMatrix] = (GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1)|0;
      GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixStack[GLImmediate.currentMatrix].pop();
    }

  
  var GLUT={initTime:null,idleFunc:null,displayFunc:null,keyboardFunc:null,keyboardUpFunc:null,specialFunc:null,specialUpFunc:null,reshapeFunc:null,motionFunc:null,passiveMotionFunc:null,mouseFunc:null,buttons:0,modifiers:0,initWindowWidth:256,initWindowHeight:256,initDisplayMode:18,windowX:0,windowY:0,windowWidth:0,windowHeight:0,saveModifiers:function (event) {
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

  
  var CL={cl_init:0,cl_extensions:["KHR_GL_SHARING","KHR_fp16","KHR_fp64"],cl_digits:[1,2,3,4,5,6,7,8,9,0],cl_kernels_sig:{},cl_structs_sig:{},cl_pn_type:[],cl_objects:{},cl_objects_map:{},cl_objects_retains:{},cl_objects_mem_callback:{},cl_validator:{},cl_validator_argsize:{},init:function () {
        if (CL.cl_init == 0) {
          console.log('%c WebCL-Translator + Validator V2.0 ! ', 'background: #222; color: #bada55');
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
  
          var _param_validator = [];
          var _param_argsize_validator = [];
          var _array = _second_part.split(","); 
          for (var j = 0; j < _array.length; j++) {
            var _type = CL.parseType(_array[j]);
  
            if (_array[j].indexOf("__local") >= 0 ) {
              _param.push(webcl.LOCAL);
  
              if (_array[j].indexOf("ulong _wcl") == -1 ) {
                _param_validator.push(_param.length - 1);
              } else {
                _param_argsize_validator.push(_param.length - 1);
              }
  
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
  
              if (_array[j].indexOf("ulong _wcl") == -1 ) {
                _param_validator.push(_param.length - 1);
              } else {
                _param_argsize_validator.push(_param.length - 1);
              }
  
            } else {
              _param.push(_type);
  
              if (_array[j].indexOf("ulong _wcl") == -1 ) {
                _param_validator.push(_param.length - 1);
              } else {
                _param_argsize_validator.push(_param.length - 1);
              }
            }
          }        
  
          CL.cl_kernels_sig[_name] = _param;
  
          CL.cl_validator[_name] = _param_validator;
          CL.cl_validator_argsize[_name] = _param_argsize_validator;
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

  function _glutMotionFunc(func) {
      GLUT.motionFunc = func;
    }

  function _clSetKernelArg(kernel,arg_index,arg_size,arg_value) {
      if (CL.cl_objects[kernel].sig.length < arg_index) {
        return webcl.INVALID_KERNEL;          
      }
  
      var _kernel = CL.cl_objects[kernel];
  
      var _posarg = _kernel.val_param[arg_index];
  
      var _sig = _kernel.sig[_posarg];
      
      try {
  
        // LOCAL ARG
        if (_sig == webcl.LOCAL) {
  
          var _array = new Uint32Array([arg_size]);
  
          _kernel.setArg(_posarg,_array);
  
          var _sizearg = CL.cast_long(arg_size);
  
          if (_kernel.val_param_argsize.indexOf(_posarg+1) >= 0) {
            _kernel.setArg(_posarg+1,_sizearg);
          }
  
        } else {
  
          var _value = HEAP32[((arg_value)>>2)];
  
          // WEBCL OBJECT ARG
          if (_value in CL.cl_objects) {
  
            _kernel.setArg(_posarg,CL.cl_objects[_value]);
            
            if (! (CL.cl_objects[_value] instanceof WebCLSampler)) {
  
            
              var _size = CL.cl_objects[_value].getInfo(webcl.MEM_SIZE);
              var _sizearg = CL.cast_long(_size);
  
              if (_kernel.val_param_argsize.indexOf(_posarg+1) >= 0) {
                _kernel.setArg(_posarg+1,_sizearg);
              }
            }
            
          } else {
  
            var _array = CL.getReferencePointerToArray(arg_value,arg_size,[[_sig,1]]);
           
            _kernel.setArg(_posarg,_array);
  
            var _sizearg = CL.cast_long(arg_size);
  
            if (_kernel.val_param_argsize.indexOf(_posarg+1) >= 0) {
              _kernel.setArg(_posarg+1,_sizearg);
            }
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

  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.textures);
        var texture = GLctx.createTexture();
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }

  function _glutMouseFunc(func) {
      GLUT.mouseFunc = func;
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

  function _abort() {
      Module['abort']();
    }

  function _glTexCoordPointer(size, type, stride, pointer) {
      GLImmediate.setClientAttribute(GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture, size, type, stride, pointer);
      if (GL.currArrayBuffer) {
        var loc = GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture;
        GLctx.vertexAttribPointer(loc, size, type, false, stride, pointer);
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


  function ___errno_location() {
      return ___errno_state;
    }


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

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;


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

  function _clCreateKernel(program,kernel_name,cl_errcode_ret) {
      
  
      var _id = null;
      var _kernel = null;
      var _name = (kernel_name == 0) ? "" : Pointer_stringify(kernel_name);
  
      // program must be created
      try {
      
  
        _kernel = CL.cl_objects[program].createKernel(_name);
        
        Object.defineProperty(_kernel, "name", { value : _name,writable : false });
        Object.defineProperty(_kernel, "sig", { value : CL.cl_kernels_sig[_name],writable : false });
  
        Object.defineProperty(_kernel, "val_param", { value : CL.cl_validator[_name],writable : false });
        Object.defineProperty(_kernel, "val_param_argsize", { value : CL.cl_validator_argsize[_name],writable : false });
  
        
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


  function _llvm_lifetime_start() {}

  function _clCreateContextFromType(properties,device_type_i64_1,device_type_i64_2,pfn_notify,user_data,cl_errcode_ret) {
      // Assume the device_type is i32 
      assert(device_type_i64_2 == 0, 'Invalid device_type i64');
      
  
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
        var _deviceType = device_type_i64_1;
        var _glclSharedContext = false;
        var _properties = [];
  
        // Verify the property
        if (properties != 0) {
          var _propertiesCounter = 0;
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
  
        if (_deviceType != 0 && _platform != null) {
  
          if (_glclSharedContext) {
            _context = webcl.createContext(Module.ctx, _platform,_deviceType);  
          } else {
            _context = webcl.createContext(_platform,_deviceType);  
          }
              
        } else if (_deviceType != 0) {
  
          if (_glclSharedContext) {
            _context = webcl.createContext(Module.ctx,_deviceType);  
          } else {
            _context = webcl.createContext(_deviceType);  
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

  function _clReleaseEvent(event) {
  
      // If is an object retain don't release it until retains > 0...
      if (event in CL.cl_objects_retains) {
  
        var _retain = CL.cl_objects_retains[event] - 1;
  
        CL.cl_objects_retains[event] = _retain;
  
        if (_retain >= 0) {
          return webcl.SUCCESS;
        }
      }
  
  
      try {
  
        CL.cl_objects[event].release();
          
      } catch (e) {
        var _error = CL.catchError(e);
  
  
        return _error;
      }
  
      delete CL.cl_objects[event];
  
  
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
      if (GLUT.displayFunc) {
        Browser.requestAnimationFrame(function() {
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

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
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

  function _glutInitDisplayMode(mode) {
      GLUT.initDisplayMode = mode;
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

  function _glutKeyboardFunc(func) {
      GLUT.keyboardFunc = func;
    }

  function _glutBitmapHelvetica18() {
  Module['printErr']('missing function: glutBitmapHelvetica18'); abort(-1);
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
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an different type, which will fail?");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
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

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
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
  var _glutBitmapHelvetica18=env._glutBitmapHelvetica18|0;
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
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_v=env.nullFunc_v;
  var nullFunc_iii=env.nullFunc_iii;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_vii=env.invoke_vii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var _glUseProgram=env._glUseProgram;
  var _fread=env._fread;
  var _clEnqueueNDRangeKernel=env._clEnqueueNDRangeKernel;
  var _glDeleteProgram=env._glDeleteProgram;
  var _clCreateProgramWithSource=env._clCreateProgramWithSource;
  var _glBindBuffer=env._glBindBuffer;
  var _ftell=env._ftell;
  var _sbrk=env._sbrk;
  var _glBlendFunc=env._glBlendFunc;
  var _glutReshapeWindow=env._glutReshapeWindow;
  var _glDisableVertexAttribArray=env._glDisableVertexAttribArray;
  var _glCreateShader=env._glCreateShader;
  var _glutSwapBuffers=env._glutSwapBuffers;
  var _sysconf=env._sysconf;
  var _close=env._close;
  var _rewind=env._rewind;
  var _glTexCoord2i=env._glTexCoord2i;
  var _clCreateCommandQueue=env._clCreateCommandQueue;
  var _clCreateContextFromType=env._clCreateContextFromType;
  var _write=env._write;
  var _fsync=env._fsync;
  var _glutSpecialFunc=env._glutSpecialFunc;
  var _glShaderSource=env._glShaderSource;
  var _glOrtho=env._glOrtho;
  var _glutMotionFunc=env._glutMotionFunc;
  var _glVertexPointer=env._glVertexPointer;
  var _glGetBooleanv=env._glGetBooleanv;
  var _glutCreateWindow=env._glutCreateWindow;
  var _llvm_lifetime_end=env._llvm_lifetime_end;
  var _glVertexAttribPointer=env._glVertexAttribPointer;
  var _glHint=env._glHint;
  var _send=env._send;
  var _glutDisplayFunc=env._glutDisplayFunc;
  var _glBegin=env._glBegin;
  var _clGetProgramBuildInfo=env._clGetProgramBuildInfo;
  var _glutInitDisplayMode=env._glutInitDisplayMode;
  var _strtol=env._strtol;
  var _glViewport=env._glViewport;
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
  var _clEnqueueReadBuffer=env._clEnqueueReadBuffer;
  var _clReleaseEvent=env._clReleaseEvent;
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
  var ___errno_location=env.___errno_location;
  var _clGetPlatformIDs=env._clGetPlatformIDs;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fseek=env._fseek;
  var _glutMouseFunc=env._glutMouseFunc;
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
  var _llvm_lifetime_start=env._llvm_lifetime_start;
  var _fclose=env._fclose;
  var _glutKeyboardFunc=env._glutKeyboardFunc;
  var _glTexParameteri=env._glTexParameteri;
  var _clEnqueueWriteBuffer=env._clEnqueueWriteBuffer;
  var _glLinkProgram=env._glLinkProgram;
  var _fprintf=env._fprintf;
  var __reallyNegative=env.__reallyNegative;
  var _glutInitWindowSize=env._glutInitWindowSize;
  var _glClear=env._glClear;
  var _fileno=env._fileno;
  var _glPopMatrix=env._glPopMatrix;
  var _glMatrixMode=env._glMatrixMode;
  var __exit=env.__exit;
  var _clWaitForEvents=env._clWaitForEvents;
  var _glBindAttribLocation=env._glBindAttribLocation;
  var _emscripten_glColor4f=env._emscripten_glColor4f;
  var _glVertex3f=env._glVertex3f;
  var _pread=env._pread;
  var _mkport=env._mkport;
  var _glEnd=env._glEnd;
  var _clGetDeviceInfo=env._clGetDeviceInfo;
  var _fflush=env._fflush;
  var _exit=env._exit;
  var _clReleaseMemObject=env._clReleaseMemObject;
  var _glClientActiveTexture=env._glClientActiveTexture;
  var _glutInit=env._glutInit;
  var _glDisable=env._glDisable;
  var _glLoadIdentity=env._glLoadIdentity;
  var __formatString=env.__formatString;
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

function __Z11FreeBuffersv() {
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $expanded = 0, $expanded1 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $gep_int = 0, $gep_int5 = 0, $status = 0, $vararg_buffer = 0, $vararg_func = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0;
 var label = 0, sp = 0, u$4 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer = sp;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 $expanded = 16;
 $1 = HEAP32[16>>2]|0;
 $2 = _clReleaseMemObject($1|0)|0;
 $status = $2;
 $3 = $status;
 $4 = ($3|0)!=(0);
 
 if ($4) {
  $expanded1 = _stderr;
  $5 = HEAP32[_stderr>>2]|0;
  $6 = $status;
  
  $gep_int = $vararg_buffer;
  $vararg_ptr = $gep_int;
  HEAP32[$vararg_ptr>>2] = $6;
  $expanded2 = 1;
  $vararg_func = $expanded2;
  $gep_int5 = 24;
  $expanded3 = $gep_int5;
  u$4 = _fprintf($5|0,$expanded3|0,$vararg_buffer|0)|0;
  
  _exit(-1);
  // unreachable
 } else {
  $expanded4 = 2200;
  $7 = HEAP32[2200>>2]|0;
  $8 = $7;
  _free($8);
  STACKTOP = sp;return;
 }
}
function __Z15AllocateBuffersv() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $expanded = 0, $expanded1 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $gep_int = 0, $gep_int10 = 0, $pixelCount = 0, $sizeBytes = 0, $status = 0, $vararg_buffer = 0, $vararg_func = 0, $vararg_lifetime_bitcast = 0;
 var $vararg_ptr = 0, label = 0, sp = 0, u$8 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer = sp;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 $status = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $expanded = 1896;
 $1 = HEAP32[1896>>2]|0;
 $expanded1 = 1904;
 $2 = HEAP32[1904>>2]|0;
 $3 = Math_imul($1, $2)|0;
 $pixelCount = $3;
 $4 = $pixelCount;
 $5 = (($4|0) / 4)&-1;
 $6 = (($5) + 1)|0;
 $7 = $6<<2;
 $sizeBytes = $7;
 $8 = $sizeBytes;
 $9 = _malloc($8)|0;
 $10 = $9;
 $expanded2 = 2200;
 HEAP32[2200>>2] = $10;
 $expanded3 = 2200;
 $11 = HEAP32[2200>>2]|0;
 $12 = $11;
 $13 = $sizeBytes;
 _memset($12|0,-1,$13|0)|0;
 $expanded4 = 72;
 $14 = HEAP32[72>>2]|0;
 $15 = $sizeBytes;
 $expanded5 = 2200;
 $16 = HEAP32[2200>>2]|0;
 $17 = $16;
 $18 = _clCreateBuffer($14|0,10,0,$15|0,$17|0,$status|0)|0;
 $expanded6 = 16;
 HEAP32[16>>2] = $18;
 $19 = HEAP32[$status>>2]|0;
 $20 = ($19|0)!=(0);
 
 if ($20) {
  $expanded7 = _stderr;
  $21 = HEAP32[_stderr>>2]|0;
  $22 = HEAP32[$status>>2]|0;
  
  $gep_int = $vararg_buffer;
  $vararg_ptr = $gep_int;
  HEAP32[$vararg_ptr>>2] = $22;
  $expanded8 = 1;
  $vararg_func = $expanded8;
  $gep_int10 = 80;
  $expanded9 = $gep_int10;
  u$8 = _fprintf($21|0,$expanded9|0,$vararg_buffer|0)|0;
  
  _exit(-1);
  // unreachable
 } else {
  STACKTOP = sp;return;
 }
}
function __Z12UpdateMandelv() {
 var $1 = 0.0, $10 = 0, $100 = 0.0, $101 = 0, $102 = 0, $103 = 0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0;
 var $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
 var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
 var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
 var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0.0, $99 = 0.0, $elapsedTime = 0.0, $events = 0, $expanded = 0, $expanded100 = 0, $expanded101 = 0, $expanded102 = 0, $expanded103 = 0, $expanded104 = 0, $expanded43 = 0, $expanded44 = 0;
 var $expanded45 = 0, $expanded46 = 0, $expanded47 = 0, $expanded48 = 0, $expanded49 = 0, $expanded50 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded54 = 0, $expanded55 = 0, $expanded56 = 0, $expanded57 = 0, $expanded58 = 0, $expanded59 = 0, $expanded60 = 0, $expanded61 = 0, $expanded62 = 0, $expanded63 = 0, $expanded64 = 0;
 var $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded68 = 0, $expanded69 = 0, $expanded70 = 0, $expanded71 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded75 = 0, $expanded76 = 0, $expanded77 = 0, $expanded78 = 0, $expanded79 = 0, $expanded80 = 0, $expanded81 = 0, $expanded82 = 0, $expanded83 = 0, $expanded84 = 0;
 var $expanded85 = 0, $expanded86 = 0, $expanded87 = 0, $expanded88 = 0, $expanded89 = 0, $expanded90 = 0, $expanded91 = 0, $expanded92 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0, $expanded96 = 0, $expanded97 = 0, $expanded98 = 0, $expanded99 = 0, $gep = 0, $gep143 = 0, $gep146 = 0, $gep148 = 0, $gep_int = 0;
 var $gep_int105 = 0, $gep_int106 = 0, $gep_int107 = 0, $gep_int108 = 0, $gep_int109 = 0, $gep_int110 = 0, $gep_int111 = 0, $gep_int112 = 0, $gep_int113 = 0, $gep_int114 = 0, $gep_int115 = 0, $gep_int116 = 0, $gep_int117 = 0, $gep_int118 = 0, $gep_int119 = 0, $gep_int120 = 0, $gep_int121 = 0, $gep_int122 = 0, $gep_int123 = 0, $gep_int124 = 0;
 var $gep_int125 = 0, $gep_int126 = 0, $gep_int127 = 0, $gep_int128 = 0, $gep_int129 = 0, $gep_int130 = 0, $gep_int131 = 0, $gep_int132 = 0, $gep_int133 = 0, $gep_int134 = 0, $gep_int135 = 0, $gep_int136 = 0, $gep_int137 = 0, $gep_int138 = 0, $gep_int139 = 0, $gep_int140 = 0, $gep_int141 = 0, $gep_int142 = 0, $gep_int144 = 0, $gep_int145 = 0;
 var $gep_int147 = 0, $gep_int149 = 0, $gep_int150 = 0, $globalThreads = 0, $localThreads = 0, $sampleSec = 0.0, $startTime = 0.0, $status = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer13 = 0, $vararg_buffer17 = 0, $vararg_buffer21 = 0, $vararg_buffer25 = 0, $vararg_buffer29 = 0, $vararg_buffer33 = 0, $vararg_buffer37 = 0, $vararg_buffer5 = 0, $vararg_buffer9 = 0, $vararg_func = 0;
 var $vararg_func12 = 0, $vararg_func16 = 0, $vararg_func20 = 0, $vararg_func24 = 0, $vararg_func28 = 0, $vararg_func32 = 0, $vararg_func36 = 0, $vararg_func4 = 0, $vararg_func42 = 0, $vararg_func8 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast10 = 0, $vararg_lifetime_bitcast14 = 0, $vararg_lifetime_bitcast18 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast22 = 0, $vararg_lifetime_bitcast26 = 0, $vararg_lifetime_bitcast30 = 0, $vararg_lifetime_bitcast34 = 0, $vararg_lifetime_bitcast38 = 0;
 var $vararg_lifetime_bitcast6 = 0, $vararg_ptr = 0, $vararg_ptr11 = 0, $vararg_ptr15 = 0, $vararg_ptr19 = 0, $vararg_ptr23 = 0, $vararg_ptr27 = 0, $vararg_ptr3 = 0, $vararg_ptr31 = 0, $vararg_ptr35 = 0, $vararg_ptr39 = 0, $vararg_ptr40 = 0, $vararg_ptr41 = 0, $vararg_ptr7 = 0, label = 0, sp = 0, u$13 = 0, u$21 = 0, u$29 = 0, u$37 = 0;
 var u$45 = 0, u$5 = 0, u$53 = 0, u$66 = 0, u$74 = 0, u$78 = 0, u$83 = 0, u$87 = 0, u$94 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $vararg_buffer37 = sp;
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
 $vararg_buffer13 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast14 = $vararg_buffer13;
 $vararg_buffer9 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast10 = $vararg_buffer9;
 $vararg_buffer5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast6 = $vararg_buffer5;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 $events = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $globalThreads = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $localThreads = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 $1 = +__Z13WallClockTimev();
 $startTime = $1;
 $expanded = 128;
 $2 = HEAP32[128>>2]|0;
 $gep_int = 16;
 $expanded43 = $gep_int;
 $3 = _clSetKernelArg($2|0,0,4,$expanded43|0)|0;
 $status = $3;
 $4 = $status;
 $5 = ($4|0)!=(0);
 
 if ($5) {
  $expanded44 = _stderr;
  $6 = HEAP32[_stderr>>2]|0;
  $7 = $status;
  
  $gep_int105 = $vararg_buffer;
  $vararg_ptr = $gep_int105;
  HEAP32[$vararg_ptr>>2] = $7;
  $expanded45 = 1;
  $vararg_func = $expanded45;
  $gep_int106 = 136;
  $expanded46 = $gep_int106;
  u$5 = _fprintf($6|0,$expanded46|0,$vararg_buffer|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded47 = 128;
 $8 = HEAP32[128>>2]|0;
 $gep_int107 = 1896;
 $expanded48 = $gep_int107;
 $9 = _clSetKernelArg($8|0,1,4,$expanded48|0)|0;
 $status = $9;
 $10 = $status;
 $11 = ($10|0)!=(0);
 
 if ($11) {
  $expanded49 = _stderr;
  $12 = HEAP32[_stderr>>2]|0;
  $13 = $status;
  
  $gep_int108 = $vararg_buffer1;
  $vararg_ptr3 = $gep_int108;
  HEAP32[$vararg_ptr3>>2] = $13;
  $expanded50 = 1;
  $vararg_func4 = $expanded50;
  $gep_int109 = 176;
  $expanded51 = $gep_int109;
  u$13 = _fprintf($12|0,$expanded51|0,$vararg_buffer1|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded52 = 128;
 $14 = HEAP32[128>>2]|0;
 $gep_int110 = 1904;
 $expanded53 = $gep_int110;
 $15 = _clSetKernelArg($14|0,2,4,$expanded53|0)|0;
 $status = $15;
 $16 = $status;
 $17 = ($16|0)!=(0);
 
 if ($17) {
  $expanded54 = _stderr;
  $18 = HEAP32[_stderr>>2]|0;
  $19 = $status;
  
  $gep_int111 = $vararg_buffer5;
  $vararg_ptr7 = $gep_int111;
  HEAP32[$vararg_ptr7>>2] = $19;
  $expanded55 = 1;
  $vararg_func8 = $expanded55;
  $gep_int112 = 176;
  $expanded56 = $gep_int112;
  u$21 = _fprintf($18|0,$expanded56|0,$vararg_buffer5|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded57 = 128;
 $20 = HEAP32[128>>2]|0;
 $gep_int113 = 1912;
 $expanded58 = $gep_int113;
 $21 = _clSetKernelArg($20|0,3,4,$expanded58|0)|0;
 $status = $21;
 $22 = $status;
 $23 = ($22|0)!=(0);
 
 if ($23) {
  $expanded59 = _stderr;
  $24 = HEAP32[_stderr>>2]|0;
  $25 = $status;
  
  $gep_int114 = $vararg_buffer9;
  $vararg_ptr11 = $gep_int114;
  HEAP32[$vararg_ptr11>>2] = $25;
  $expanded60 = 1;
  $vararg_func12 = $expanded60;
  $gep_int115 = 176;
  $expanded61 = $gep_int115;
  u$29 = _fprintf($24|0,$expanded61|0,$vararg_buffer9|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded62 = 128;
 $26 = HEAP32[128>>2]|0;
 $gep_int116 = 1920;
 $expanded63 = $gep_int116;
 $27 = _clSetKernelArg($26|0,4,4,$expanded63|0)|0;
 $status = $27;
 $28 = $status;
 $29 = ($28|0)!=(0);
 
 if ($29) {
  $expanded64 = _stderr;
  $30 = HEAP32[_stderr>>2]|0;
  $31 = $status;
  
  $gep_int117 = $vararg_buffer13;
  $vararg_ptr15 = $gep_int117;
  HEAP32[$vararg_ptr15>>2] = $31;
  $expanded65 = 1;
  $vararg_func16 = $expanded65;
  $gep_int118 = 176;
  $expanded66 = $gep_int118;
  u$37 = _fprintf($30|0,$expanded66|0,$vararg_buffer13|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded67 = 128;
 $32 = HEAP32[128>>2]|0;
 $gep_int119 = 1928;
 $expanded68 = $gep_int119;
 $33 = _clSetKernelArg($32|0,5,4,$expanded68|0)|0;
 $status = $33;
 $34 = $status;
 $35 = ($34|0)!=(0);
 
 if ($35) {
  $expanded69 = _stderr;
  $36 = HEAP32[_stderr>>2]|0;
  $37 = $status;
  
  $gep_int120 = $vararg_buffer17;
  $vararg_ptr19 = $gep_int120;
  HEAP32[$vararg_ptr19>>2] = $37;
  $expanded70 = 1;
  $vararg_func20 = $expanded70;
  $gep_int121 = 176;
  $expanded71 = $gep_int121;
  u$45 = _fprintf($36|0,$expanded71|0,$vararg_buffer17|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded72 = 128;
 $38 = HEAP32[128>>2]|0;
 $gep_int122 = 1936;
 $expanded73 = $gep_int122;
 $39 = _clSetKernelArg($38|0,6,4,$expanded73|0)|0;
 $status = $39;
 $40 = $status;
 $41 = ($40|0)!=(0);
 
 if ($41) {
  $expanded74 = _stderr;
  $42 = HEAP32[_stderr>>2]|0;
  $43 = $status;
  
  $gep_int123 = $vararg_buffer21;
  $vararg_ptr23 = $gep_int123;
  HEAP32[$vararg_ptr23>>2] = $43;
  $expanded75 = 1;
  $vararg_func24 = $expanded75;
  $gep_int124 = 176;
  $expanded76 = $gep_int124;
  u$53 = _fprintf($42|0,$expanded76|0,$vararg_buffer21|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded77 = 1896;
 $44 = HEAP32[1896>>2]|0;
 $expanded78 = 1904;
 $45 = HEAP32[1904>>2]|0;
 $46 = Math_imul($44, $45)|0;
 $47 = (($46|0) / 4)&-1;
 $48 = (($47) + 1)|0;
 $gep_int125 = $globalThreads;
 $49 = $gep_int125;
 HEAP32[$49>>2] = $48;
 $gep_int126 = $globalThreads;
 $50 = $gep_int126;
 $51 = HEAP32[$50>>2]|0;
 $expanded79 = 8;
 $52 = HEAP32[8>>2]|0;
 $53 = (($51>>>0) % ($52>>>0))&-1;
 $54 = ($53|0)!=(0);
 
 if ($54) {
  $gep_int127 = $globalThreads;
  $55 = $gep_int127;
  $56 = HEAP32[$55>>2]|0;
  $expanded80 = 8;
  $57 = HEAP32[8>>2]|0;
  $58 = (($56>>>0) / ($57>>>0))&-1;
  $59 = (($58) + 1)|0;
  $expanded81 = 8;
  $60 = HEAP32[8>>2]|0;
  $61 = Math_imul($59, $60)|0;
  $gep_int128 = $globalThreads;
  $62 = $gep_int128;
  HEAP32[$62>>2] = $61;
  
 }
 $expanded82 = 8;
 $63 = HEAP32[8>>2]|0;
 $gep_int129 = $localThreads;
 $64 = $gep_int129;
 HEAP32[$64>>2] = $63;
 $expanded83 = 216;
 $65 = HEAP32[216>>2]|0;
 $expanded84 = 128;
 $66 = HEAP32[128>>2]|0;
 $gep_int130 = $globalThreads;
 $67 = $gep_int130;
 $gep_int131 = $localThreads;
 $68 = $gep_int131;
 $gep_int132 = $events;
 $69 = $gep_int132;
 $70 = _clEnqueueNDRangeKernel($65|0,$66|0,1,0,$67|0,$68|0,0,0,$69|0)|0;
 $status = $70;
 $71 = $status;
 $72 = ($71|0)!=(0);
 
 if ($72) {
  $expanded85 = _stderr;
  $73 = HEAP32[_stderr>>2]|0;
  $74 = $status;
  
  $gep_int133 = $vararg_buffer25;
  $vararg_ptr27 = $gep_int133;
  HEAP32[$vararg_ptr27>>2] = $74;
  $expanded86 = 1;
  $vararg_func28 = $expanded86;
  $gep_int134 = 224;
  $expanded87 = $gep_int134;
  u$66 = _fprintf($73|0,$expanded87|0,$vararg_buffer25|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $gep_int135 = $events;
 $75 = $gep_int135;
 $76 = _clWaitForEvents(1,$75|0)|0;
 $status = $76;
 $77 = $status;
 $78 = ($77|0)!=(0);
 
 if ($78) {
  $expanded88 = _stderr;
  $79 = HEAP32[_stderr>>2]|0;
  $80 = $status;
  
  $gep_int136 = $vararg_buffer29;
  $vararg_ptr31 = $gep_int136;
  HEAP32[$vararg_ptr31>>2] = $80;
  $expanded89 = 1;
  $vararg_func32 = $expanded89;
  $gep_int137 = 264;
  $expanded90 = $gep_int137;
  u$74 = _fprintf($79|0,$expanded90|0,$vararg_buffer29|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $gep_int138 = $events;
 $81 = $gep_int138;
 $82 = HEAP32[$81>>2]|0;
 u$78 = _clReleaseEvent($82|0)|0;
 $expanded91 = 216;
 $83 = HEAP32[216>>2]|0;
 $expanded92 = 16;
 $84 = HEAP32[16>>2]|0;
 $expanded93 = 1896;
 $85 = HEAP32[1896>>2]|0;
 $expanded94 = 1904;
 $86 = HEAP32[1904>>2]|0;
 $87 = Math_imul($85, $86)|0;
 $expanded95 = 2200;
 $88 = HEAP32[2200>>2]|0;
 $89 = $88;
 $gep_int139 = $events;
 $gep = (($gep_int139) + 4)|0;
 $90 = $gep;
 $91 = _clEnqueueReadBuffer($83|0,$84|0,1,0,$87|0,$89|0,0,0,$90|0)|0;
 $status = $91;
 $92 = $status;
 $93 = ($92|0)!=(0);
 
 if ($93) {
  $expanded96 = _stderr;
  $94 = HEAP32[_stderr>>2]|0;
  $95 = $status;
  
  $gep_int140 = $vararg_buffer33;
  $vararg_ptr35 = $gep_int140;
  HEAP32[$vararg_ptr35>>2] = $95;
  $expanded97 = 1;
  $vararg_func36 = $expanded97;
  $gep_int141 = 312;
  $expanded98 = $gep_int141;
  u$83 = _fprintf($94|0,$expanded98|0,$vararg_buffer33|0)|0;
  
  _exit(-1);
  // unreachable
 } else {
  $gep_int142 = $events;
  $gep143 = (($gep_int142) + 4)|0;
  $96 = $gep143;
  $97 = HEAP32[$96>>2]|0;
  u$87 = _clReleaseEvent($97|0)|0;
  $98 = +__Z13WallClockTimev();
  $99 = $startTime;
  $100 = $98 - $99;
  $elapsedTime = $100;
  $expanded99 = 1904;
  $101 = HEAP32[1904>>2]|0;
  $expanded100 = 1896;
  $102 = HEAP32[1896>>2]|0;
  $103 = Math_imul($101, $102)|0;
  $104 = +($103|0);
  $105 = $elapsedTime;
  $106 = $104 / $105;
  $sampleSec = $106;
  $107 = $elapsedTime;
  $108 = $sampleSec;
  $109 = $108 / 1.000000e+03;
  $expanded101 = 1936;
  $110 = HEAP32[1936>>2]|0;
  
  $gep_int144 = $vararg_buffer37;
  $vararg_ptr39 = $gep_int144;
  HEAPF64[tempDoublePtr>>3]=$107;HEAP32[$vararg_ptr39>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr39+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $gep_int145 = $vararg_buffer37;
  $gep146 = (($gep_int145) + 8)|0;
  $vararg_ptr40 = $gep146;
  HEAPF64[tempDoublePtr>>3]=$109;HEAP32[$vararg_ptr40>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr40+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $gep_int147 = $vararg_buffer37;
  $gep148 = (($gep_int147) + 16)|0;
  $vararg_ptr41 = $gep148;
  HEAP32[$vararg_ptr41>>2] = $110;
  $expanded102 = 2;
  $vararg_func42 = $expanded102;
  $gep_int149 = 1944;
  $expanded103 = $gep_int149;
  $gep_int150 = 352;
  $expanded104 = $gep_int150;
  u$94 = _sprintf($expanded103|0,$expanded104|0,$vararg_buffer37|0)|0;
  
  STACKTOP = sp;return;
 }
}
function _main($argc,$argv) {
 $argc = $argc|0;
 $argv = $argv|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $expanded = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded16 = 0, $expanded17 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $gep = 0, $gep25 = 0, $gep27 = 0, $gep29 = 0, $gep31 = 0, $gep33 = 0;
 var $gep_int = 0, $gep_int18 = 0, $gep_int19 = 0, $gep_int20 = 0, $gep_int21 = 0, $gep_int22 = 0, $gep_int23 = 0, $gep_int24 = 0, $gep_int26 = 0, $gep_int28 = 0, $gep_int30 = 0, $gep_int32 = 0, $gep_int34 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_func = 0, $vararg_func4 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast2 = 0, $vararg_ptr = 0;
 var $vararg_ptr3 = 0, label = 0, sp = 0, u$10 = 0, u$6 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer1 = sp;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 $1 = 0;
 $2 = $argc;
 $3 = $argv;
 $expanded = 1888;
 HEAP32[1888>>2] = 0;
 $expanded5 = _stderr;
 $4 = HEAP32[_stderr>>2]|0;
 $5 = $3;
 $gep_int = $5;
 $6 = $gep_int;
 $7 = HEAP32[$6>>2]|0;
 
 $gep_int18 = $vararg_buffer;
 $vararg_ptr = $gep_int18;
 HEAP32[$vararg_ptr>>2] = $7;
 $expanded6 = 1;
 $vararg_func = $expanded6;
 $gep_int19 = 416;
 $expanded7 = $gep_int19;
 u$6 = _fprintf($4|0,$expanded7|0,$vararg_buffer|0)|0;
 
 $expanded8 = _stderr;
 $8 = HEAP32[_stderr>>2]|0;
 $9 = $3;
 $gep_int20 = $9;
 $10 = $gep_int20;
 $11 = HEAP32[$10>>2]|0;
 
 $gep_int21 = $vararg_buffer1;
 $vararg_ptr3 = $gep_int21;
 HEAP32[$vararg_ptr3>>2] = $11;
 $expanded9 = 1;
 $vararg_func4 = $expanded9;
 $gep_int22 = 432;
 $expanded10 = $gep_int22;
 u$10 = _fprintf($8|0,$expanded10|0,$vararg_buffer1|0)|0;
 
 $12 = $2;
 $13 = ($12|0)==(7);
 
 if ($13) {
  $14 = $3;
  $gep_int23 = $14;
  $gep = (($gep_int23) + 4)|0;
  $15 = $gep;
  $16 = HEAP32[$15>>2]|0;
  $17 = _atoi($16|0)|0;
  $expanded11 = 568;
  HEAP32[568>>2] = $17;
  $18 = $3;
  $gep_int24 = $18;
  $gep25 = (($gep_int24) + 8)|0;
  $19 = $gep25;
  $20 = HEAP32[$19>>2]|0;
  $21 = _atoi($20|0)|0;
  $expanded12 = 576;
  HEAP32[576>>2] = $21;
  $22 = $3;
  $gep_int26 = $22;
  $gep27 = (($gep_int26) + 12)|0;
  $23 = $gep27;
  $24 = HEAP32[$23>>2]|0;
  $expanded13 = 584;
  HEAP32[584>>2] = $24;
  $25 = $3;
  $gep_int28 = $25;
  $gep29 = (($gep_int28) + 16)|0;
  $26 = $gep29;
  $27 = HEAP32[$26>>2]|0;
  $28 = _atoi($27|0)|0;
  $expanded14 = 1896;
  HEAP32[1896>>2] = $28;
  $29 = $3;
  $gep_int30 = $29;
  $gep31 = (($gep_int30) + 20)|0;
  $30 = $gep31;
  $31 = HEAP32[$30>>2]|0;
  $32 = _atoi($31|0)|0;
  $expanded15 = 1904;
  HEAP32[1904>>2] = $32;
  $33 = $3;
  $gep_int32 = $33;
  $gep33 = (($gep_int32) + 24)|0;
  $34 = $gep33;
  $35 = HEAP32[$34>>2]|0;
  $36 = _atoi($35|0)|0;
  $expanded16 = 1936;
  HEAP32[1936>>2] = $36;
  
  __ZL11SetUpOpenCLv();
  __Z12UpdateMandelv();
  $39 = $2;
  $40 = $3;
  $gep_int34 = 592;
  $expanded17 = $gep_int34;
  __Z8InitGlutiPPcS_($39,$40,$expanded17);
  _glutMainLoop();
  STACKTOP = sp;return 0;
 }
 $37 = $2;
 $38 = ($37|0)!=(1);
 
 if ($38) {
  _exit(-1);
  // unreachable
 }
 
 __ZL11SetUpOpenCLv();
 __Z12UpdateMandelv();
 $39 = $2;
 $40 = $3;
 $gep_int34 = 592;
 $expanded17 = $gep_int34;
 __Z8InitGlutiPPcS_($39,$40,$expanded17);
 _glutMainLoop();
 STACKTOP = sp;return 0;
}
function __ZL11SetUpOpenCLv() {
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0;
 var $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0;
 var $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0;
 var $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0;
 var $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buf = 0, $buildLog = 0, $cprops = 0, $cps = 0, $dType = 0, $deviceListSize = 0;
 var $expanded = 0, $expanded100 = 0, $expanded101 = 0, $expanded102 = 0, $expanded103 = 0, $expanded104 = 0, $expanded105 = 0, $expanded106 = 0, $expanded107 = 0, $expanded108 = 0, $expanded109 = 0, $expanded110 = 0, $expanded111 = 0, $expanded112 = 0, $expanded113 = 0, $expanded114 = 0, $expanded115 = 0, $expanded116 = 0, $expanded117 = 0, $expanded118 = 0;
 var $expanded119 = 0, $expanded120 = 0, $expanded121 = 0, $expanded122 = 0, $expanded123 = 0, $expanded124 = 0, $expanded125 = 0, $expanded126 = 0, $expanded127 = 0, $expanded128 = 0, $expanded129 = 0, $expanded130 = 0, $expanded131 = 0, $expanded132 = 0, $expanded133 = 0, $expanded134 = 0, $expanded135 = 0, $expanded136 = 0, $expanded137 = 0, $expanded138 = 0;
 var $expanded139 = 0, $expanded140 = 0, $expanded141 = 0, $expanded142 = 0, $expanded143 = 0, $expanded144 = 0, $expanded145 = 0, $expanded146 = 0, $expanded147 = 0, $expanded148 = 0, $expanded149 = 0, $expanded150 = 0, $expanded151 = 0, $expanded152 = 0, $expanded153 = 0, $expanded154 = 0, $expanded155 = 0, $expanded156 = 0, $expanded157 = 0, $expanded158 = 0;
 var $expanded159 = 0, $expanded160 = 0, $expanded161 = 0, $expanded162 = 0, $expanded163 = 0, $expanded164 = 0, $expanded165 = 0, $expanded166 = 0, $expanded167 = 0, $expanded168 = 0, $expanded169 = 0, $expanded170 = 0, $expanded171 = 0, $expanded172 = 0, $expanded173 = 0, $expanded174 = 0, $expanded175 = 0, $expanded176 = 0, $expanded177 = 0, $expanded178 = 0;
 var $expanded179 = 0, $expanded180 = 0, $expanded181 = 0, $expanded182 = 0, $expanded183 = 0, $expanded184 = 0, $expanded185 = 0, $expanded186 = 0, $expanded187 = 0, $expanded188 = 0, $expanded189 = 0, $expanded190 = 0, $expanded191 = 0, $expanded192 = 0, $expanded193 = 0, $expanded194 = 0, $expanded195 = 0, $expanded196 = 0, $expanded197 = 0, $expanded198 = 0;
 var $expanded199 = 0, $expanded200 = 0, $expanded201 = 0, $expanded202 = 0, $expanded203 = 0, $expanded204 = 0, $expanded205 = 0, $expanded206 = 0, $expanded207 = 0, $expanded208 = 0, $expanded98 = 0, $expanded99 = 0, $gep = 0, $gep216 = 0, $gep221 = 0, $gep223 = 0, $gep234 = 0, $gep244 = 0, $gep248 = 0, $gep254 = 0;
 var $gep258 = 0, $gep263 = 0, $gep267 = 0, $gep272 = 0, $gep285 = 0, $gep_array = 0, $gep_array233 = 0, $gep_array247 = 0, $gep_array257 = 0, $gep_array266 = 0, $gep_int = 0, $gep_int209 = 0, $gep_int210 = 0, $gep_int211 = 0, $gep_int212 = 0, $gep_int213 = 0, $gep_int214 = 0, $gep_int215 = 0, $gep_int217 = 0, $gep_int218 = 0;
 var $gep_int219 = 0, $gep_int220 = 0, $gep_int222 = 0, $gep_int224 = 0, $gep_int225 = 0, $gep_int226 = 0, $gep_int227 = 0, $gep_int228 = 0, $gep_int229 = 0, $gep_int230 = 0, $gep_int231 = 0, $gep_int232 = 0, $gep_int235 = 0, $gep_int236 = 0, $gep_int237 = 0, $gep_int238 = 0, $gep_int239 = 0, $gep_int240 = 0, $gep_int241 = 0, $gep_int242 = 0;
 var $gep_int243 = 0, $gep_int245 = 0, $gep_int246 = 0, $gep_int249 = 0, $gep_int250 = 0, $gep_int251 = 0, $gep_int252 = 0, $gep_int253 = 0, $gep_int255 = 0, $gep_int256 = 0, $gep_int259 = 0, $gep_int260 = 0, $gep_int261 = 0, $gep_int262 = 0, $gep_int264 = 0, $gep_int265 = 0, $gep_int268 = 0, $gep_int269 = 0, $gep_int270 = 0, $gep_int271 = 0;
 var $gep_int273 = 0, $gep_int274 = 0, $gep_int275 = 0, $gep_int276 = 0, $gep_int277 = 0, $gep_int278 = 0, $gep_int279 = 0, $gep_int280 = 0, $gep_int281 = 0, $gep_int282 = 0, $gep_int283 = 0, $gep_int284 = 0, $gep_int286 = 0, $gep_int287 = 0, $gep_int288 = 0, $gep_int289 = 0, $gep_int290 = 0, $gep_int291 = 0, $gep_int292 = 0, $gep_int293 = 0;
 var $gep_int294 = 0, $gep_int295 = 0, $gep_int296 = 0, $gep_int297 = 0, $gep_int298 = 0, $gsize = 0, $gsize2 = 0, $i = 0, $i1 = 0, $numPlatforms = 0, $pbuf = 0, $platform = 0, $platforms = 0, $prop = 0, $retValSize = 0, $sources = 0, $status = 0, $stype = 0, $type = 0, $units = 0;
 var $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer11 = 0, $vararg_buffer14 = 0, $vararg_buffer18 = 0, $vararg_buffer22 = 0, $vararg_buffer26 = 0, $vararg_buffer30 = 0, $vararg_buffer35 = 0, $vararg_buffer39 = 0, $vararg_buffer4 = 0, $vararg_buffer44 = 0, $vararg_buffer48 = 0, $vararg_buffer53 = 0, $vararg_buffer57 = 0, $vararg_buffer62 = 0, $vararg_buffer66 = 0, $vararg_buffer7 = 0, $vararg_buffer70 = 0, $vararg_buffer74 = 0;
 var $vararg_buffer78 = 0, $vararg_buffer82 = 0, $vararg_buffer86 = 0, $vararg_buffer90 = 0, $vararg_buffer94 = 0, $vararg_func = 0, $vararg_func10 = 0, $vararg_func13 = 0, $vararg_func17 = 0, $vararg_func21 = 0, $vararg_func25 = 0, $vararg_func29 = 0, $vararg_func3 = 0, $vararg_func34 = 0, $vararg_func38 = 0, $vararg_func43 = 0, $vararg_func47 = 0, $vararg_func52 = 0, $vararg_func56 = 0, $vararg_func6 = 0;
 var $vararg_func61 = 0, $vararg_func65 = 0, $vararg_func69 = 0, $vararg_func73 = 0, $vararg_func77 = 0, $vararg_func81 = 0, $vararg_func85 = 0, $vararg_func89 = 0, $vararg_func93 = 0, $vararg_func97 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast12 = 0, $vararg_lifetime_bitcast15 = 0, $vararg_lifetime_bitcast19 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast23 = 0, $vararg_lifetime_bitcast27 = 0, $vararg_lifetime_bitcast31 = 0, $vararg_lifetime_bitcast36 = 0, $vararg_lifetime_bitcast40 = 0;
 var $vararg_lifetime_bitcast45 = 0, $vararg_lifetime_bitcast49 = 0, $vararg_lifetime_bitcast5 = 0, $vararg_lifetime_bitcast54 = 0, $vararg_lifetime_bitcast58 = 0, $vararg_lifetime_bitcast63 = 0, $vararg_lifetime_bitcast67 = 0, $vararg_lifetime_bitcast71 = 0, $vararg_lifetime_bitcast75 = 0, $vararg_lifetime_bitcast79 = 0, $vararg_lifetime_bitcast8 = 0, $vararg_lifetime_bitcast83 = 0, $vararg_lifetime_bitcast87 = 0, $vararg_lifetime_bitcast91 = 0, $vararg_lifetime_bitcast95 = 0, $vararg_ptr = 0, $vararg_ptr16 = 0, $vararg_ptr20 = 0, $vararg_ptr24 = 0, $vararg_ptr28 = 0;
 var $vararg_ptr32 = 0, $vararg_ptr33 = 0, $vararg_ptr37 = 0, $vararg_ptr41 = 0, $vararg_ptr42 = 0, $vararg_ptr46 = 0, $vararg_ptr50 = 0, $vararg_ptr51 = 0, $vararg_ptr55 = 0, $vararg_ptr59 = 0, $vararg_ptr60 = 0, $vararg_ptr64 = 0, $vararg_ptr68 = 0, $vararg_ptr72 = 0, $vararg_ptr76 = 0, $vararg_ptr80 = 0, $vararg_ptr84 = 0, $vararg_ptr88 = 0, $vararg_ptr9 = 0, $vararg_ptr92 = 0;
 var $vararg_ptr96 = 0, label = 0, sp = 0, u$103 = 0, u$124 = 0, u$130 = 0, u$136 = 0, u$143 = 0, u$149 = 0, u$156 = 0, u$162 = 0, u$173 = 0, u$181 = 0, u$187 = 0, u$196 = 0, u$203 = 0, u$21 = 0, u$211 = 0, u$220 = 0, u$227 = 0;
 var u$235 = 0, u$30 = 0, u$41 = 0, u$48 = 0, u$66 = 0, u$74 = 0, u$82 = 0, u$90 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer94 = sp;
 $vararg_lifetime_bitcast95 = $vararg_buffer94;
 $vararg_buffer90 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast91 = $vararg_buffer90;
 $vararg_buffer86 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast87 = $vararg_buffer86;
 $vararg_buffer82 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast83 = $vararg_buffer82;
 $vararg_buffer78 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast79 = $vararg_buffer78;
 $vararg_buffer74 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast75 = $vararg_buffer74;
 $vararg_buffer70 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast71 = $vararg_buffer70;
 $vararg_buffer66 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast67 = $vararg_buffer66;
 $vararg_buffer62 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast63 = $vararg_buffer62;
 $vararg_buffer57 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast58 = $vararg_buffer57;
 $vararg_buffer53 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast54 = $vararg_buffer53;
 $vararg_buffer48 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast49 = $vararg_buffer48;
 $vararg_buffer44 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast45 = $vararg_buffer44;
 $vararg_buffer39 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast40 = $vararg_buffer39;
 $vararg_buffer35 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast36 = $vararg_buffer35;
 $vararg_buffer30 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast31 = $vararg_buffer30;
 $vararg_buffer26 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast27 = $vararg_buffer26;
 $vararg_buffer22 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast23 = $vararg_buffer22;
 $vararg_buffer18 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast19 = $vararg_buffer18;
 $vararg_buffer14 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast15 = $vararg_buffer14;
 $vararg_buffer11 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast12 = $vararg_buffer11;
 $vararg_buffer7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast8 = $vararg_buffer7;
 $vararg_buffer4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast5 = $vararg_buffer4;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $dType = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $numPlatforms = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $status = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 
 $pbuf = STACKTOP; STACKTOP = STACKTOP + 104|0;
 $cps = STACKTOP; STACKTOP = STACKTOP + 16|0;
 
 $deviceListSize = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $type = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $buf = STACKTOP; STACKTOP = STACKTOP + 256|0;
 $units = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $gsize = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $sources = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $retValSize = STACKTOP; STACKTOP = STACKTOP + 8|0;
 
 $gsize2 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $prop = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $expanded = 568;
 $1 = HEAP32[568>>2]|0;
 $2 = ($1|0)!=(0);
 
 if ($2) {
  $expanded98 = 576;
  $3 = HEAP32[576>>2]|0;
  $4 = ($3|0)!=(0);
  
  if ($4) {
   $5 = $dType;
   $6 = $5;
   HEAP32[$6>>2] = -1;
   $7 = (($5) + 4)|0;
   $8 = $7;
   HEAP32[$8>>2] = 0;
   
  } else {
   $9 = $dType;
   $10 = $9;
   HEAP32[$10>>2] = 2;
   $11 = (($9) + 4)|0;
   $12 = $11;
   HEAP32[$12>>2] = 0;
   
  }
  
 } else {
  $expanded99 = 576;
  $13 = HEAP32[576>>2]|0;
  $14 = ($13|0)!=(0);
  
  if ($14) {
   $15 = $dType;
   $16 = $15;
   HEAP32[$16>>2] = 4;
   $17 = (($15) + 4)|0;
   $18 = $17;
   HEAP32[$18>>2] = 0;
   
  } else {
   $19 = $dType;
   $20 = $19;
   HEAP32[$20>>2] = 1;
   $21 = (($19) + 4)|0;
   $22 = $21;
   HEAP32[$22>>2] = 0;
   
  }
  
 }
 $platform = 0;
 $23 = _clGetPlatformIDs(0,0,$numPlatforms|0)|0;
 HEAP32[$status>>2] = $23;
 $24 = HEAP32[$status>>2]|0;
 $25 = ($24|0)!=(0);
 
 if ($25) {
  $expanded100 = _stderr;
  $26 = HEAP32[_stderr>>2]|0;
  
  $expanded101 = 1;
  $vararg_func = $expanded101;
  $gep_int = 640;
  $expanded102 = $gep_int;
  u$21 = _fprintf($26|0,$expanded102|0,$vararg_buffer|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $27 = HEAP32[$numPlatforms>>2]|0;
 $28 = ($27>>>0)>(0);
 
 do {
  if ($28) {
   $29 = HEAP32[$numPlatforms>>2]|0;
   $30 = $29<<2;
   $31 = _malloc($30)|0;
   $32 = $31;
   $platforms = $32;
   $33 = HEAP32[$numPlatforms>>2]|0;
   $34 = $platforms;
   $35 = _clGetPlatformIDs($33|0,$34|0,0)|0;
   HEAP32[$status>>2] = $35;
   $36 = HEAP32[$status>>2]|0;
   $37 = ($36|0)!=(0);
   
   if ($37) {
    $expanded103 = _stderr;
    $38 = HEAP32[_stderr>>2]|0;
    
    $expanded104 = 1;
    $vararg_func3 = $expanded104;
    $gep_int209 = 672;
    $expanded105 = $gep_int209;
    u$30 = _fprintf($38|0,$expanded105|0,$vararg_buffer1|0)|0;
    
    _exit(-1);
    // unreachable
   }
   $i = 0;
   
   while(1) {
    $39 = $i;
    $40 = HEAP32[$numPlatforms>>2]|0;
    $41 = ($39>>>0)<($40>>>0);
    
    if (!($41)) {
     label = 21;
     break;
    }
    $42 = $i;
    $43 = $platforms;
    $gep_int210 = $43;
    $gep_array = $42<<2;
    $gep = (($gep_int210) + ($gep_array))|0;
    $44 = $gep;
    $45 = HEAP32[$44>>2]|0;
    $gep_int211 = $pbuf;
    $46 = $gep_int211;
    $47 = _clGetPlatformInfo($45|0,2307,100,$46|0,0)|0;
    HEAP32[$status>>2] = $47;
    $48 = HEAP32[$numPlatforms>>2]|0;
    $49 = $platforms;
    $50 = _clGetPlatformIDs($48|0,$49|0,0)|0;
    HEAP32[$status>>2] = $50;
    $51 = HEAP32[$status>>2]|0;
    $52 = ($51|0)!=(0);
    
    if ($52) {
     label = 18;
     break;
    }
    $expanded109 = _stderr;
    $54 = HEAP32[_stderr>>2]|0;
    $55 = $i;
    $gep_int213 = $pbuf;
    $56 = $gep_int213;
    
    $gep_int214 = $vararg_buffer7;
    $vararg_ptr = $gep_int214;
    HEAP32[$vararg_ptr>>2] = $55;
    $gep_int215 = $vararg_buffer7;
    $gep216 = (($gep_int215) + 4)|0;
    $vararg_ptr9 = $gep216;
    HEAP32[$vararg_ptr9>>2] = $56;
    $expanded110 = 1;
    $vararg_func10 = $expanded110;
    $gep_int217 = 712;
    $expanded111 = $gep_int217;
    u$48 = _fprintf($54|0,$expanded111|0,$vararg_buffer7|0)|0;
    
    
    $57 = $i;
    $58 = (($57) + 1)|0;
    $i = $58;
    
   }
   if ((label|0) == 18) {
    $expanded106 = _stderr;
    $53 = HEAP32[_stderr>>2]|0;
    
    $expanded107 = 1;
    $vararg_func6 = $expanded107;
    $gep_int212 = 672;
    $expanded108 = $gep_int212;
    u$41 = _fprintf($53|0,$expanded108|0,$vararg_buffer4|0)|0;
    
    _exit(-1);
    // unreachable
   }
   else if ((label|0) == 21) {
    $59 = $platforms;
    $gep_int218 = $59;
    $60 = $gep_int218;
    $61 = HEAP32[$60>>2]|0;
    $platform = $61;
    $62 = $platforms;
    $63 = $62;
    _free($63);
    
    break;
   }
  }
 } while(0);
 $gep_int219 = $cps;
 $64 = $gep_int219;
 HEAP32[$64>>2] = 4228;
 $gep_int220 = $64;
 $gep221 = (($gep_int220) + 4)|0;
 $65 = $gep221;
 $66 = $platform;
 $67 = $66;
 HEAP32[$65>>2] = $67;
 $gep_int222 = $65;
 $gep223 = (($gep_int222) + 4)|0;
 $68 = $gep223;
 HEAP32[$68>>2] = 0;
 $69 = $platform;
 $70 = (0)==($69|0);
 
 if ($70) {
  
  $72 = 0;
 } else {
  $gep_int224 = $cps;
  $71 = $gep_int224;
  
  $72 = $71;
 }
 
 $cprops = $72;
 $73 = $cprops;
 $74 = $dType;
 $75 = $74;
 $76 = HEAP32[$75>>2]|0;
 $77 = (($74) + 4)|0;
 $78 = $77;
 $79 = HEAP32[$78>>2]|0;
 $80 = _clCreateContextFromType($73|0,$76|0,$79|0,0,0,$status|0)|0;
 $expanded112 = 72;
 HEAP32[72>>2] = $80;
 $81 = HEAP32[$status>>2]|0;
 $82 = ($81|0)!=(0);
 
 if ($82) {
  $expanded113 = _stderr;
  $83 = HEAP32[_stderr>>2]|0;
  
  $expanded114 = 1;
  $vararg_func13 = $expanded114;
  $gep_int225 = 736;
  $expanded115 = $gep_int225;
  u$66 = _fprintf($83|0,$expanded115|0,$vararg_buffer11|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded116 = 72;
 $84 = HEAP32[72>>2]|0;
 $85 = _clGetContextInfo($84|0,4225,0,0,$deviceListSize|0)|0;
 HEAP32[$status>>2] = $85;
 $86 = HEAP32[$status>>2]|0;
 $87 = ($86|0)!=(0);
 
 if ($87) {
  $expanded117 = _stderr;
  $88 = HEAP32[_stderr>>2]|0;
  $89 = HEAP32[$status>>2]|0;
  
  $gep_int226 = $vararg_buffer14;
  $vararg_ptr16 = $gep_int226;
  HEAP32[$vararg_ptr16>>2] = $89;
  $expanded118 = 1;
  $vararg_func17 = $expanded118;
  $gep_int227 = 768;
  $expanded119 = $gep_int227;
  u$74 = _fprintf($88|0,$expanded119|0,$vararg_buffer14|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $90 = HEAP32[$deviceListSize>>2]|0;
 $91 = _malloc($90)|0;
 $92 = $91;
 $expanded120 = 816;
 HEAP32[816>>2] = $92;
 $expanded121 = 816;
 $93 = HEAP32[816>>2]|0;
 $94 = ($93|0)==(0);
 
 if ($94) {
  $expanded122 = _stderr;
  $95 = HEAP32[_stderr>>2]|0;
  $96 = HEAP32[$status>>2]|0;
  
  $gep_int228 = $vararg_buffer18;
  $vararg_ptr20 = $gep_int228;
  HEAP32[$vararg_ptr20>>2] = $96;
  $expanded123 = 1;
  $vararg_func21 = $expanded123;
  $gep_int229 = 824;
  $expanded124 = $gep_int229;
  u$82 = _fprintf($95|0,$expanded124|0,$vararg_buffer18|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded125 = 72;
 $97 = HEAP32[72>>2]|0;
 $98 = HEAP32[$deviceListSize>>2]|0;
 $expanded126 = 816;
 $99 = HEAP32[816>>2]|0;
 $100 = $99;
 $101 = _clGetContextInfo($97|0,4225,$98|0,$100|0,0)|0;
 HEAP32[$status>>2] = $101;
 $102 = HEAP32[$status>>2]|0;
 $103 = ($102|0)!=(0);
 
 if ($103) {
  $expanded127 = _stderr;
  $104 = HEAP32[_stderr>>2]|0;
  $105 = HEAP32[$status>>2]|0;
  
  $gep_int230 = $vararg_buffer22;
  $vararg_ptr24 = $gep_int230;
  HEAP32[$vararg_ptr24>>2] = $105;
  $expanded128 = 1;
  $vararg_func25 = $expanded128;
  $gep_int231 = 880;
  $expanded129 = $gep_int231;
  u$90 = _fprintf($104|0,$expanded129|0,$vararg_buffer22|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $i1 = 0;
 
 while(1) {
  $106 = $i1;
  $107 = HEAP32[$deviceListSize>>2]|0;
  $108 = (($107>>>0) / 4)&-1;
  $109 = ($106>>>0)<($108>>>0);
  
  if (!($109)) {
   break;
  }
  $110 = $type;
  $111 = $110;
  HEAP32[$111>>2] = 0;
  $112 = (($110) + 4)|0;
  $113 = $112;
  HEAP32[$113>>2] = 0;
  $114 = $i1;
  $expanded130 = 816;
  $115 = HEAP32[816>>2]|0;
  $gep_int232 = $115;
  $gep_array233 = $114<<2;
  $gep234 = (($gep_int232) + ($gep_array233))|0;
  $116 = $gep234;
  $117 = HEAP32[$116>>2]|0;
  $118 = $type;
  $119 = _clGetDeviceInfo($117|0,4096,8,$118|0,0)|0;
  HEAP32[$status>>2] = $119;
  $120 = HEAP32[$status>>2]|0;
  $121 = ($120|0)!=(0);
  
  if ($121) {
   $expanded131 = _stderr;
   $122 = HEAP32[_stderr>>2]|0;
   $123 = HEAP32[$status>>2]|0;
   
   $gep_int235 = $vararg_buffer26;
   $vararg_ptr28 = $gep_int235;
   HEAP32[$vararg_ptr28>>2] = $123;
   $expanded132 = 1;
   $vararg_func29 = $expanded132;
   $gep_int236 = 920;
   $expanded133 = $gep_int236;
   u$103 = _fprintf($122|0,$expanded133|0,$vararg_buffer26|0)|0;
   
   
  }
  $124 = $type;
  $125 = $124;
  $126 = HEAP32[$125>>2]|0;
  $127 = (($124) + 4)|0;
  $128 = $127;
  $129 = HEAP32[$128>>2]|0;
  
  do {
   if ((($126|0) == 1)) {
    
    if (!((($129|0) == 0))) {
     label = 46;
     break;
    }
    $gep_int238 = 976;
    $expanded135 = $gep_int238;
    $stype = $expanded135;
    
   } else if ((($126|0) == 2)) {
    
    if (!((($129|0) == 0))) {
     label = 46;
     break;
    }
    $gep_int239 = 992;
    $expanded136 = $gep_int239;
    $stype = $expanded136;
    
   } else if ((($126|0) == 4)) {
    
    if (!((($129|0) == 0))) {
     label = 46;
     break;
    }
    $gep_int240 = 1008;
    $expanded137 = $gep_int240;
    $stype = $expanded137;
    
   } else if ((($126|0) == -1)) {
    
    if (!((($129|0) == 0))) {
     label = 46;
     break;
    }
    $gep_int237 = 960;
    $expanded134 = $gep_int237;
    $stype = $expanded134;
    
   } else {
    label = 46;
   }
  } while(0);
  if ((label|0) == 46) {
   label = 0;
   $gep_int241 = 1024;
   $expanded138 = $gep_int241;
   $stype = $expanded138;
   
  }
  $expanded139 = _stderr;
  $130 = HEAP32[_stderr>>2]|0;
  $131 = $i1;
  $132 = $stype;
  
  $gep_int242 = $vararg_buffer30;
  $vararg_ptr32 = $gep_int242;
  HEAP32[$vararg_ptr32>>2] = $131;
  $gep_int243 = $vararg_buffer30;
  $gep244 = (($gep_int243) + 4)|0;
  $vararg_ptr33 = $gep244;
  HEAP32[$vararg_ptr33>>2] = $132;
  $expanded140 = 1;
  $vararg_func34 = $expanded140;
  $gep_int245 = 1040;
  $expanded141 = $gep_int245;
  u$124 = _fprintf($130|0,$expanded141|0,$vararg_buffer30|0)|0;
  
  $133 = $i1;
  $expanded142 = 816;
  $134 = HEAP32[816>>2]|0;
  $gep_int246 = $134;
  $gep_array247 = $133<<2;
  $gep248 = (($gep_int246) + ($gep_array247))|0;
  $135 = $gep248;
  $136 = HEAP32[$135>>2]|0;
  $137 = $buf;
  $138 = _clGetDeviceInfo($136|0,4139,256,$137|0,0)|0;
  HEAP32[$status>>2] = $138;
  $139 = HEAP32[$status>>2]|0;
  $140 = ($139|0)!=(0);
  
  if ($140) {
   $expanded143 = _stderr;
   $141 = HEAP32[_stderr>>2]|0;
   $142 = HEAP32[$status>>2]|0;
   
   $gep_int249 = $vararg_buffer35;
   $vararg_ptr37 = $gep_int249;
   HEAP32[$vararg_ptr37>>2] = $142;
   $expanded144 = 1;
   $vararg_func38 = $expanded144;
   $gep_int250 = 920;
   $expanded145 = $gep_int250;
   u$130 = _fprintf($141|0,$expanded145|0,$vararg_buffer35|0)|0;
   
   
  }
  $expanded146 = _stderr;
  $143 = HEAP32[_stderr>>2]|0;
  $144 = $i1;
  $gep_int251 = $buf;
  $145 = $gep_int251;
  
  $gep_int252 = $vararg_buffer39;
  $vararg_ptr41 = $gep_int252;
  HEAP32[$vararg_ptr41>>2] = $144;
  $gep_int253 = $vararg_buffer39;
  $gep254 = (($gep_int253) + 4)|0;
  $vararg_ptr42 = $gep254;
  HEAP32[$vararg_ptr42>>2] = $145;
  $expanded147 = 1;
  $vararg_func43 = $expanded147;
  $gep_int255 = 1072;
  $expanded148 = $gep_int255;
  u$136 = _fprintf($143|0,$expanded148|0,$vararg_buffer39|0)|0;
  
  HEAP32[$units>>2] = 0;
  $146 = $i1;
  $expanded149 = 816;
  $147 = HEAP32[816>>2]|0;
  $gep_int256 = $147;
  $gep_array257 = $146<<2;
  $gep258 = (($gep_int256) + ($gep_array257))|0;
  $148 = $gep258;
  $149 = HEAP32[$148>>2]|0;
  $150 = $units;
  $151 = _clGetDeviceInfo($149|0,4098,4,$150|0,0)|0;
  HEAP32[$status>>2] = $151;
  $152 = HEAP32[$status>>2]|0;
  $153 = ($152|0)!=(0);
  
  if ($153) {
   $expanded150 = _stderr;
   $154 = HEAP32[_stderr>>2]|0;
   $155 = HEAP32[$status>>2]|0;
   
   $gep_int259 = $vararg_buffer44;
   $vararg_ptr46 = $gep_int259;
   HEAP32[$vararg_ptr46>>2] = $155;
   $expanded151 = 1;
   $vararg_func47 = $expanded151;
   $gep_int260 = 920;
   $expanded152 = $gep_int260;
   u$143 = _fprintf($154|0,$expanded152|0,$vararg_buffer44|0)|0;
   
   
  }
  $expanded153 = _stderr;
  $156 = HEAP32[_stderr>>2]|0;
  $157 = $i1;
  $158 = HEAP32[$units>>2]|0;
  
  $gep_int261 = $vararg_buffer48;
  $vararg_ptr50 = $gep_int261;
  HEAP32[$vararg_ptr50>>2] = $157;
  $gep_int262 = $vararg_buffer48;
  $gep263 = (($gep_int262) + 4)|0;
  $vararg_ptr51 = $gep263;
  HEAP32[$vararg_ptr51>>2] = $158;
  $expanded154 = 1;
  $vararg_func52 = $expanded154;
  $gep_int264 = 1104;
  $expanded155 = $gep_int264;
  u$149 = _fprintf($156|0,$expanded155|0,$vararg_buffer48|0)|0;
  
  HEAP32[$gsize>>2] = 0;
  $159 = $i1;
  $expanded156 = 816;
  $160 = HEAP32[816>>2]|0;
  $gep_int265 = $160;
  $gep_array266 = $159<<2;
  $gep267 = (($gep_int265) + ($gep_array266))|0;
  $161 = $gep267;
  $162 = HEAP32[$161>>2]|0;
  $163 = $gsize;
  $164 = _clGetDeviceInfo($162|0,4100,4,$163|0,0)|0;
  HEAP32[$status>>2] = $164;
  $165 = HEAP32[$status>>2]|0;
  $166 = ($165|0)!=(0);
  
  if ($166) {
   $expanded157 = _stderr;
   $167 = HEAP32[_stderr>>2]|0;
   $168 = HEAP32[$status>>2]|0;
   
   $gep_int268 = $vararg_buffer53;
   $vararg_ptr55 = $gep_int268;
   HEAP32[$vararg_ptr55>>2] = $168;
   $expanded158 = 1;
   $vararg_func56 = $expanded158;
   $gep_int269 = 920;
   $expanded159 = $gep_int269;
   u$156 = _fprintf($167|0,$expanded159|0,$vararg_buffer53|0)|0;
   
   
  }
  $expanded160 = _stderr;
  $169 = HEAP32[_stderr>>2]|0;
  $170 = $i1;
  $171 = HEAP32[$gsize>>2]|0;
  
  $gep_int270 = $vararg_buffer57;
  $vararg_ptr59 = $gep_int270;
  HEAP32[$vararg_ptr59>>2] = $170;
  $gep_int271 = $vararg_buffer57;
  $gep272 = (($gep_int271) + 4)|0;
  $vararg_ptr60 = $gep272;
  HEAP32[$vararg_ptr60>>2] = $171;
  $expanded161 = 1;
  $vararg_func61 = $expanded161;
  $gep_int273 = 1144;
  $expanded162 = $gep_int273;
  u$162 = _fprintf($169|0,$expanded162|0,$vararg_buffer57|0)|0;
  
  
  $172 = $i1;
  $173 = (($172) + 1)|0;
  $i1 = $173;
  
 }
 __Z15AllocateBuffersv();
 $expanded163 = 584;
 $174 = HEAP32[584>>2]|0;
 $175 = __ZL11ReadSourcesPKc($174)|0;
 HEAP32[$sources>>2] = $175;
 $expanded164 = 72;
 $176 = HEAP32[72>>2]|0;
 $177 = _clCreateProgramWithSource($176|0,1,$sources|0,0,$status|0)|0;
 $expanded165 = 1192;
 HEAP32[1192>>2] = $177;
 $178 = HEAP32[$status>>2]|0;
 $179 = ($178|0)!=(0);
 
 if ($179) {
  $expanded166 = _stderr;
  $180 = HEAP32[_stderr>>2]|0;
  $181 = HEAP32[$status>>2]|0;
  
  $gep_int274 = $vararg_buffer62;
  $vararg_ptr64 = $gep_int274;
  HEAP32[$vararg_ptr64>>2] = $181;
  $expanded167 = 1;
  $vararg_func65 = $expanded167;
  $gep_int275 = 1200;
  $expanded168 = $gep_int275;
  u$173 = _fprintf($180|0,$expanded168|0,$vararg_buffer62|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded169 = 1192;
 $182 = HEAP32[1192>>2]|0;
 $expanded170 = 816;
 $183 = HEAP32[816>>2]|0;
 $184 = _clBuildProgram($182|0,1,$183|0,0,0,0)|0;
 HEAP32[$status>>2] = $184;
 $185 = HEAP32[$status>>2]|0;
 $186 = ($185|0)!=(0);
 
 if ($186) {
  $expanded171 = _stderr;
  $187 = HEAP32[_stderr>>2]|0;
  $188 = HEAP32[$status>>2]|0;
  
  $gep_int276 = $vararg_buffer66;
  $vararg_ptr68 = $gep_int276;
  HEAP32[$vararg_ptr68>>2] = $188;
  $expanded172 = 1;
  $vararg_func69 = $expanded172;
  $gep_int277 = 1248;
  $expanded173 = $gep_int277;
  u$181 = _fprintf($187|0,$expanded173|0,$vararg_buffer66|0)|0;
  
  $expanded174 = 1192;
  $189 = HEAP32[1192>>2]|0;
  $expanded175 = 816;
  $190 = HEAP32[816>>2]|0;
  $gep_int278 = $190;
  $191 = $gep_int278;
  $192 = HEAP32[$191>>2]|0;
  $193 = _clGetProgramBuildInfo($189|0,$192|0,4483,0,0,$retValSize|0)|0;
  HEAP32[$status>>2] = $193;
  $194 = HEAP32[$status>>2]|0;
  $195 = ($194|0)!=(0);
  
  if ($195) {
   $expanded176 = _stderr;
   $196 = HEAP32[_stderr>>2]|0;
   $197 = HEAP32[$status>>2]|0;
   
   $gep_int279 = $vararg_buffer70;
   $vararg_ptr72 = $gep_int279;
   HEAP32[$vararg_ptr72>>2] = $197;
   $expanded177 = 1;
   $vararg_func73 = $expanded177;
   $gep_int280 = 1288;
   $expanded178 = $gep_int280;
   u$187 = _fprintf($196|0,$expanded178|0,$vararg_buffer70|0)|0;
   
   _exit(-1);
   // unreachable
  }
  $198 = HEAP32[$retValSize>>2]|0;
  $199 = (($198) + 1)|0;
  $200 = _malloc($199)|0;
  $buildLog = $200;
  $expanded179 = 1192;
  $201 = HEAP32[1192>>2]|0;
  $expanded180 = 816;
  $202 = HEAP32[816>>2]|0;
  $gep_int281 = $202;
  $203 = $gep_int281;
  $204 = HEAP32[$203>>2]|0;
  $205 = HEAP32[$retValSize>>2]|0;
  $206 = $buildLog;
  $207 = _clGetProgramBuildInfo($201|0,$204|0,4483,$205|0,$206|0,0)|0;
  HEAP32[$status>>2] = $207;
  $208 = HEAP32[$status>>2]|0;
  $209 = ($208|0)!=(0);
  
  if ($209) {
   $expanded181 = _stderr;
   $210 = HEAP32[_stderr>>2]|0;
   $211 = HEAP32[$status>>2]|0;
   
   $gep_int282 = $vararg_buffer74;
   $vararg_ptr76 = $gep_int282;
   HEAP32[$vararg_ptr76>>2] = $211;
   $expanded182 = 1;
   $vararg_func77 = $expanded182;
   $gep_int283 = 1336;
   $expanded183 = $gep_int283;
   u$196 = _fprintf($210|0,$expanded183|0,$vararg_buffer74|0)|0;
   
   _exit(-1);
   // unreachable
  } else {
   $212 = HEAP32[$retValSize>>2]|0;
   $213 = $buildLog;
   $gep_int284 = $213;
   $gep285 = (($gep_int284) + ($212))|0;
   $214 = $gep285;
   HEAP8[$214] = 0;
   $expanded184 = _stderr;
   $215 = HEAP32[_stderr>>2]|0;
   $216 = $buildLog;
   
   $gep_int286 = $vararg_buffer78;
   $vararg_ptr80 = $gep_int286;
   HEAP32[$vararg_ptr80>>2] = $216;
   $expanded185 = 1;
   $vararg_func81 = $expanded185;
   $gep_int287 = 1376;
   $expanded186 = $gep_int287;
   u$203 = _fprintf($215|0,$expanded186|0,$vararg_buffer78|0)|0;
   
   _exit(-1);
   // unreachable
  }
 }
 $expanded187 = 1192;
 $217 = HEAP32[1192>>2]|0;
 $gep_int288 = 1408;
 $expanded188 = $gep_int288;
 $218 = _clCreateKernel($217|0,$expanded188|0,$status|0)|0;
 $expanded189 = 128;
 HEAP32[128>>2] = $218;
 $219 = HEAP32[$status>>2]|0;
 $220 = ($219|0)!=(0);
 
 if ($220) {
  $expanded190 = _stderr;
  $221 = HEAP32[_stderr>>2]|0;
  $222 = HEAP32[$status>>2]|0;
  
  $gep_int289 = $vararg_buffer82;
  $vararg_ptr84 = $gep_int289;
  HEAP32[$vararg_ptr84>>2] = $222;
  $expanded191 = 1;
  $vararg_func85 = $expanded191;
  $gep_int290 = 1424;
  $expanded192 = $gep_int290;
  u$211 = _fprintf($221|0,$expanded192|0,$vararg_buffer82|0)|0;
  
  _exit(-1);
  // unreachable
 }
 HEAP32[$gsize2>>2] = 0;
 $expanded193 = 128;
 $223 = HEAP32[128>>2]|0;
 $expanded194 = 816;
 $224 = HEAP32[816>>2]|0;
 $gep_int291 = $224;
 $225 = $gep_int291;
 $226 = HEAP32[$225>>2]|0;
 $227 = $gsize2;
 $228 = _clGetKernelWorkGroupInfo($223|0,$226|0,4528,4,$227|0,0)|0;
 HEAP32[$status>>2] = $228;
 $229 = HEAP32[$status>>2]|0;
 $230 = ($229|0)!=(0);
 
 if ($230) {
  $expanded195 = _stderr;
  $231 = HEAP32[_stderr>>2]|0;
  $232 = HEAP32[$status>>2]|0;
  
  $gep_int292 = $vararg_buffer86;
  $vararg_ptr88 = $gep_int292;
  HEAP32[$vararg_ptr88>>2] = $232;
  $expanded196 = 1;
  $vararg_func89 = $expanded196;
  $gep_int293 = 1464;
  $expanded197 = $gep_int293;
  u$220 = _fprintf($231|0,$expanded197|0,$vararg_buffer86|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $233 = HEAP32[$gsize2>>2]|0;
 $expanded198 = 8;
 HEAP32[8>>2] = $233;
 $expanded199 = _stderr;
 $234 = HEAP32[_stderr>>2]|0;
 $expanded200 = 8;
 $235 = HEAP32[8>>2]|0;
 
 $gep_int294 = $vararg_buffer90;
 $vararg_ptr92 = $gep_int294;
 HEAP32[$vararg_ptr92>>2] = $235;
 $expanded201 = 1;
 $vararg_func93 = $expanded201;
 $gep_int295 = 1520;
 $expanded202 = $gep_int295;
 u$227 = _fprintf($234|0,$expanded202|0,$vararg_buffer90|0)|0;
 
 $236 = $prop;
 $237 = $236;
 HEAP32[$237>>2] = 0;
 $238 = (($236) + 4)|0;
 $239 = $238;
 HEAP32[$239>>2] = 0;
 $expanded203 = 72;
 $240 = HEAP32[72>>2]|0;
 $expanded204 = 816;
 $241 = HEAP32[816>>2]|0;
 $gep_int296 = $241;
 $242 = $gep_int296;
 $243 = HEAP32[$242>>2]|0;
 $244 = $prop;
 $245 = $244;
 $246 = HEAP32[$245>>2]|0;
 $247 = (($244) + 4)|0;
 $248 = $247;
 $249 = HEAP32[$248>>2]|0;
 $250 = _clCreateCommandQueue($240|0,$243|0,$246|0,$249|0,$status|0)|0;
 $expanded205 = 216;
 HEAP32[216>>2] = $250;
 $251 = HEAP32[$status>>2]|0;
 $252 = ($251|0)!=(0);
 
 if ($252) {
  $expanded206 = _stderr;
  $253 = HEAP32[_stderr>>2]|0;
  $254 = HEAP32[$status>>2]|0;
  
  $gep_int297 = $vararg_buffer94;
  $vararg_ptr96 = $gep_int297;
  HEAP32[$vararg_ptr96>>2] = $254;
  $expanded207 = 1;
  $vararg_func97 = $expanded207;
  $gep_int298 = 1568;
  $expanded208 = $gep_int298;
  u$235 = _fprintf($253|0,$expanded208|0,$vararg_buffer94|0)|0;
  
  _exit(-1);
  // unreachable
 } else {
  STACKTOP = sp;return;
 }
}
function __ZL11ReadSourcesPKc($fileName) {
 $fileName = $fileName|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $expanded23 = 0, $expanded24 = 0, $expanded25 = 0, $expanded26 = 0, $expanded27 = 0, $expanded28 = 0, $expanded29 = 0, $expanded30 = 0, $expanded31 = 0, $expanded32 = 0, $expanded33 = 0, $expanded34 = 0;
 var $expanded35 = 0, $expanded36 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded40 = 0, $file = 0, $gep = 0, $gep54 = 0, $gep57 = 0, $gep_int = 0, $gep_int41 = 0, $gep_int42 = 0, $gep_int43 = 0, $gep_int44 = 0, $gep_int45 = 0, $gep_int46 = 0, $gep_int47 = 0, $gep_int48 = 0, $gep_int49 = 0;
 var $gep_int50 = 0, $gep_int51 = 0, $gep_int52 = 0, $gep_int53 = 0, $gep_int55 = 0, $gep_int56 = 0, $res = 0, $size = 0, $src = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer13 = 0, $vararg_buffer18 = 0, $vararg_buffer5 = 0, $vararg_buffer9 = 0, $vararg_func = 0, $vararg_func12 = 0, $vararg_func17 = 0, $vararg_func22 = 0, $vararg_func4 = 0;
 var $vararg_func8 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast10 = 0, $vararg_lifetime_bitcast14 = 0, $vararg_lifetime_bitcast19 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast6 = 0, $vararg_ptr = 0, $vararg_ptr11 = 0, $vararg_ptr15 = 0, $vararg_ptr16 = 0, $vararg_ptr20 = 0, $vararg_ptr21 = 0, $vararg_ptr3 = 0, $vararg_ptr7 = 0, label = 0, sp = 0, u$12 = 0, u$20 = 0, u$29 = 0;
 var u$36 = 0, u$43 = 0, u$48 = 0, u$5 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer18 = sp;
 $vararg_lifetime_bitcast19 = $vararg_buffer18;
 $vararg_buffer13 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast14 = $vararg_buffer13;
 $vararg_buffer9 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast10 = $vararg_buffer9;
 $vararg_buffer5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast6 = $vararg_buffer5;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 
 
 $1 = $fileName;
 $2 = $1;
 $gep_int = 1616;
 $expanded = $gep_int;
 $3 = _fopen($2|0,$expanded|0)|0;
 $file = $3;
 $4 = $file;
 $5 = ($4|0)!=(0);
 
 if (!($5)) {
  $expanded23 = _stderr;
  $6 = HEAP32[_stderr>>2]|0;
  $7 = $1;
  
  $gep_int41 = $vararg_buffer;
  $vararg_ptr = $gep_int41;
  HEAP32[$vararg_ptr>>2] = $7;
  $expanded24 = 1;
  $vararg_func = $expanded24;
  $gep_int42 = 1624;
  $expanded25 = $gep_int42;
  u$5 = _fprintf($6|0,$expanded25|0,$vararg_buffer|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $8 = $file;
 $9 = _fseek($8|0,0,2)|0;
 $10 = ($9|0)!=(0);
 
 if ($10) {
  $expanded26 = _stderr;
  $11 = HEAP32[_stderr>>2]|0;
  $12 = $1;
  
  $gep_int43 = $vararg_buffer1;
  $vararg_ptr3 = $gep_int43;
  HEAP32[$vararg_ptr3>>2] = $12;
  $expanded27 = 1;
  $vararg_func4 = $expanded27;
  $gep_int44 = 1656;
  $expanded28 = $gep_int44;
  u$12 = _fprintf($11|0,$expanded28|0,$vararg_buffer1|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $13 = $file;
 $14 = _ftell($13|0)|0;
 $size = $14;
 $15 = $size;
 $16 = ($15|0)==(0);
 
 if ($16) {
  $expanded29 = _stderr;
  $17 = HEAP32[_stderr>>2]|0;
  $18 = $1;
  
  $gep_int45 = $vararg_buffer5;
  $vararg_ptr7 = $gep_int45;
  HEAP32[$vararg_ptr7>>2] = $18;
  $expanded30 = 1;
  $vararg_func8 = $expanded30;
  $gep_int46 = 1688;
  $expanded31 = $gep_int46;
  u$20 = _fprintf($17|0,$expanded31|0,$vararg_buffer5|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $19 = $file;
 _rewind($19|0);
 $20 = $size;
 $21 = $20;
 $22 = (($21) + 1)|0;
 $23 = _malloc($22)|0;
 $src = $23;
 $24 = $src;
 $25 = ($24|0)!=(0);
 
 if (!($25)) {
  $expanded32 = _stderr;
  $26 = HEAP32[_stderr>>2]|0;
  $27 = $1;
  
  $gep_int47 = $vararg_buffer9;
  $vararg_ptr11 = $gep_int47;
  HEAP32[$vararg_ptr11>>2] = $27;
  $expanded33 = 1;
  $vararg_func12 = $expanded33;
  $gep_int48 = 1728;
  $expanded34 = $gep_int48;
  u$29 = _fprintf($26|0,$expanded34|0,$vararg_buffer9|0)|0;
  
  _exit(-1);
  // unreachable
 }
 $expanded35 = _stderr;
 $28 = HEAP32[_stderr>>2]|0;
 $29 = $1;
 $30 = $size;
 
 $gep_int49 = $vararg_buffer13;
 $vararg_ptr15 = $gep_int49;
 HEAP32[$vararg_ptr15>>2] = $29;
 $gep_int50 = $vararg_buffer13;
 $gep = (($gep_int50) + 4)|0;
 $vararg_ptr16 = $gep;
 HEAP32[$vararg_ptr16>>2] = $30;
 $expanded36 = 1;
 $vararg_func17 = $expanded36;
 $gep_int51 = 1776;
 $expanded37 = $gep_int51;
 u$36 = _fprintf($28|0,$expanded37|0,$vararg_buffer13|0)|0;
 
 $31 = $src;
 $32 = $size;
 $33 = $32;
 $34 = $file;
 $35 = _fread($31|0,1,$33|0,$34|0)|0;
 $res = $35;
 $36 = $res;
 $37 = $size;
 $38 = $37;
 $39 = ($36|0)!=($38|0);
 
 if ($39) {
  $expanded38 = _stderr;
  $40 = HEAP32[_stderr>>2]|0;
  $41 = $1;
  $42 = $res;
  
  $gep_int52 = $vararg_buffer18;
  $vararg_ptr20 = $gep_int52;
  HEAP32[$vararg_ptr20>>2] = $41;
  $gep_int53 = $vararg_buffer18;
  $gep54 = (($gep_int53) + 4)|0;
  $vararg_ptr21 = $gep54;
  HEAP32[$vararg_ptr21>>2] = $42;
  $expanded39 = 1;
  $vararg_func22 = $expanded39;
  $gep_int55 = 1816;
  $expanded40 = $gep_int55;
  u$43 = _fprintf($40|0,$expanded40|0,$vararg_buffer18|0)|0;
  
  _exit(-1);
  // unreachable
 } else {
  $43 = $size;
  $44 = $src;
  $gep_int56 = $44;
  $gep57 = (($gep_int56) + ($43))|0;
  $45 = $gep57;
  HEAP8[$45] = 0;
  $46 = $file;
  u$48 = _fclose($46|0)|0;
  $47 = $src;
  STACKTOP = sp;return $47|0;
 }
 return 0|0;
}
function __Z13WallClockTimev() {
 var $1 = 0.0, $2 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = +_emscripten_get_now();
 $2 = $1 / 1.000000e+03;
 STACKTOP = sp;return +$2;
}
function __Z11displayFuncv() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0.0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $expanded1 = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded16 = 0, $expanded17 = 0, $expanded18 = 0, $expanded19 = 0, $expanded2 = 0, $expanded20 = 0;
 var $expanded21 = 0, $expanded22 = 0, $expanded23 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $gep_int = 0, $gep_int24 = 0, $gep_int25 = 0, $gep_int26 = 0, $gep_int27 = 0, $gep_int28 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 __Z12UpdateMandelv();
 _glClear(16384);
 $expanded = 2216;
 $1 = HEAP32[2216>>2]|0;
 _glEnable($1|0);
 $expanded1 = 2216;
 $2 = HEAP32[2216>>2]|0;
 $expanded2 = 2208;
 $3 = HEAP32[2208>>2]|0;
 _glBindTexture($2|0,$3|0);
 $expanded3 = 2200;
 $4 = HEAP32[2200>>2]|0;
 $5 = ($4|0)!=(0);
 
 if ($5) {
  $expanded4 = 2216;
  $6 = HEAP32[2216>>2]|0;
  $expanded5 = 1896;
  $7 = HEAP32[1896>>2]|0;
  $expanded6 = 1904;
  $8 = HEAP32[1904>>2]|0;
  $expanded7 = 2224;
  $9 = HEAP32[2224>>2]|0;
  $expanded8 = 2232;
  $10 = HEAP32[2232>>2]|0;
  $expanded9 = 2200;
  $11 = HEAP32[2200>>2]|0;
  $12 = $11;
  _glTexSubImage2D($6|0,0,0,0,$7|0,$8|0,$9|0,$10|0,$12|0);
  
 }
 _glBegin(5);
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 _glTexCoord2i(0,0);
 _glVertex3f(0.000000e+00,0.000000e+00,0.000000e+00);
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 _glTexCoord2i(0,1);
 $expanded10 = 1904;
 $13 = HEAP32[1904>>2]|0;
 $14 = +($13|0);
 _glVertex3f(0.000000e+00,+$14,0.000000e+00);
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 _glTexCoord2i(1,0);
 $expanded11 = 1896;
 $15 = HEAP32[1896>>2]|0;
 $16 = +($15|0);
 _glVertex3f(+$16,0.000000e+00,0.000000e+00);
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 _glTexCoord2i(1,1);
 $expanded12 = 1896;
 $17 = HEAP32[1896>>2]|0;
 $18 = +($17|0);
 $expanded13 = 1904;
 $19 = HEAP32[1904>>2]|0;
 $20 = +($19|0);
 _glVertex3f(+$18,+$20,0.000000e+00);
 _glEnd();
 $expanded14 = 2216;
 $21 = HEAP32[2216>>2]|0;
 _glDisable($21|0);
 $expanded15 = 2216;
 $22 = HEAP32[2216>>2]|0;
 _glBindTexture($22|0,0);
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 $expanded16 = 1888;
 $23 = HEAP32[1888>>2]|0;
 $24 = ($23|0)!=(0);
 
 if ($24) {
  $gep_int = _glutBitmapHelvetica18;
  $expanded17 = $gep_int;
  $gep_int24 = 2240;
  $expanded18 = $gep_int24;
  __ZL11PrintStringPvPKc($expanded17,$expanded18);
  
 } else {
  $gep_int25 = _glutBitmapHelvetica18;
  $expanded19 = $gep_int25;
  $gep_int26 = 2288;
  $expanded20 = $gep_int26;
  __ZL11PrintStringPvPKc($expanded19,$expanded20);
  
 }
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 $gep_int27 = _glutBitmapHelvetica18;
 $expanded21 = $gep_int27;
 $gep_int28 = 1944;
 $expanded22 = $gep_int28;
 __ZL11PrintStringPvPKc($expanded21,$expanded22);
 $expanded23 = 2336;
 $25 = HEAP32[2336>>2]|0;
 $26 = ($25|0)!=(0);
 
 if (!($26)) {
  _glutSwapBuffers();
  STACKTOP = sp;return;
 }
 _glPushMatrix();
 _glLoadIdentity();
 _glOrtho(-5.000000e-01,6.395000e+02,-5.000000e-01,4.795000e+02,-1.000000e+00,1.000000e+00);
 __ZL9PrintHelpv();
 _glPopMatrix();
 
 _glutSwapBuffers();
 STACKTOP = sp;return;
}
function __ZL11PrintStringPvPKc($font,$string) {
 $font = $font|0;
 $string = $string|0;
 var $1 = 0, $2 = 0, $3 = 0, $expanded = 0, $expanded1 = 0, $gep_int = 0, $gep_int2 = 0, $vararg_buffer = 0, $vararg_func = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, label = 0, sp = 0, u$4 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer = sp;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 $1 = $font;
 $2 = $string;
 $3 = $2;
 
 $gep_int = $vararg_buffer;
 $vararg_ptr = $gep_int;
 HEAP32[$vararg_ptr>>2] = $3;
 $expanded = 1;
 $vararg_func = $expanded;
 $gep_int2 = 2872;
 $expanded1 = $gep_int2;
 u$4 = _printf($expanded1|0,$vararg_buffer|0)|0;
 
 STACKTOP = sp;return;
}
function __ZL9PrintHelpv() {
 var $expanded = 0, $expanded1 = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $gep_int = 0, $gep_int16 = 0, $gep_int17 = 0, $gep_int18 = 0;
 var $gep_int19 = 0, $gep_int20 = 0, $gep_int21 = 0, $gep_int22 = 0, $gep_int23 = 0, $gep_int24 = 0, $gep_int25 = 0, $gep_int26 = 0, $gep_int27 = 0, $gep_int28 = 0, $gep_int29 = 0, $gep_int30 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 _glEnable(3042);
 _glBlendFunc(770,771);
 _glColor4f(0.000000e+00,0.000000e+00,5.000000e-01,5.000000e-01);
 _glColor3f(1.000000e+00,1.000000e+00,1.000000e+00);
 $gep_int = _glutBitmapHelvetica18;
 $expanded = $gep_int;
 $gep_int16 = 2592;
 $expanded1 = $gep_int16;
 __ZL11PrintStringPvPKc($expanded,$expanded1);
 $gep_int17 = _glutBitmapHelvetica18;
 $expanded2 = $gep_int17;
 $gep_int18 = 2600;
 $expanded3 = $gep_int18;
 __ZL11PrintStringPvPKc($expanded2,$expanded3);
 $gep_int19 = _glutBitmapHelvetica18;
 $expanded4 = $gep_int19;
 $gep_int20 = 2616;
 $expanded5 = $gep_int20;
 __ZL11PrintStringPvPKc($expanded4,$expanded5);
 $gep_int21 = _glutBitmapHelvetica18;
 $expanded6 = $gep_int21;
 $gep_int22 = 2656;
 $expanded7 = $gep_int22;
 __ZL11PrintStringPvPKc($expanded6,$expanded7);
 $gep_int23 = _glutBitmapHelvetica18;
 $expanded8 = $gep_int23;
 $gep_int24 = 2696;
 $expanded9 = $gep_int24;
 __ZL11PrintStringPvPKc($expanded8,$expanded9);
 $gep_int25 = _glutBitmapHelvetica18;
 $expanded10 = $gep_int25;
 $gep_int26 = 2752;
 $expanded11 = $gep_int26;
 __ZL11PrintStringPvPKc($expanded10,$expanded11);
 $gep_int27 = _glutBitmapHelvetica18;
 $expanded12 = $gep_int27;
 $gep_int28 = 2792;
 $expanded13 = $gep_int28;
 __ZL11PrintStringPvPKc($expanded12,$expanded13);
 $gep_int29 = _glutBitmapHelvetica18;
 $expanded14 = $gep_int29;
 $gep_int30 = 2832;
 $expanded15 = $gep_int30;
 __ZL11PrintStringPvPKc($expanded14,$expanded15);
 _glDisable(3042);
 STACKTOP = sp;return;
}
function __Z11reshapeFuncii($newWidth,$newHeight) {
 $newWidth = $newWidth|0;
 $newHeight = $newHeight|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $expanded = 0, $expanded1 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 
 
 $1 = $newWidth;
 $2 = $newHeight;
 $3 = $1;
 $expanded = 1896;
 HEAP32[1896>>2] = $3;
 $expanded1 = 1896;
 $4 = HEAP32[1896>>2]|0;
 $5 = (($4|0) % 4)&-1;
 $6 = ($5|0)!=(0);
 
 if ($6) {
  $expanded2 = 1896;
  $7 = HEAP32[1896>>2]|0;
  $8 = (($7|0) / 4)&-1;
  $9 = (($8) + 1)|0;
  $10 = $9<<2;
  $expanded3 = 1896;
  HEAP32[1896>>2] = $10;
  
 }
 $11 = $2;
 $expanded4 = 1904;
 HEAP32[1904>>2] = $11;
 $expanded5 = 1896;
 $12 = HEAP32[1896>>2]|0;
 $expanded6 = 1904;
 $13 = HEAP32[1904>>2]|0;
 _glViewport(0,0,$12|0,$13|0);
 _glLoadIdentity();
 $expanded7 = 1896;
 $14 = HEAP32[1896>>2]|0;
 $15 = +($14|0);
 $16 = $15 - 5.000000e-01;
 $17 = $16;
 $expanded8 = 1904;
 $18 = HEAP32[1904>>2]|0;
 $19 = +($18|0);
 $20 = $19 - 5.000000e-01;
 $21 = $20;
 _glOrtho(-5.000000e-01,+$17,-5.000000e-01,+$21,-1.000000e+00,1.000000e+00);
 __Z11FreeBuffersv();
 __Z15AllocateBuffersv();
 _glutPostRedisplay();
 STACKTOP = sp;return;
}
function __Z7keyFunchii($key,$x,$y) {
 $key = $key|0;
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $expanded15 = 0, $expanded16 = 0, $expanded17 = 0, $expanded18 = 0, $expanded19 = 0;
 var $expanded20 = 0, $expanded21 = 0, $expanded22 = 0, $expanded23 = 0, $expanded24 = 0, $expanded25 = 0, $expanded26 = 0, $expanded27 = 0, $expanded28 = 0, $expanded29 = 0, $expanded30 = 0, $expanded31 = 0, $expanded32 = 0, $expanded33 = 0, $expanded34 = 0, $expanded35 = 0, $expanded36 = 0, $expanded37 = 0, $f = 0, $gep = 0;
 var $gep43 = 0, $gep46 = 0, $gep49 = 0, $gep51 = 0, $gep54 = 0, $gep_array = 0, $gep_int = 0, $gep_int38 = 0, $gep_int39 = 0, $gep_int40 = 0, $gep_int41 = 0, $gep_int42 = 0, $gep_int44 = 0, $gep_int45 = 0, $gep_int47 = 0, $gep_int48 = 0, $gep_int50 = 0, $gep_int52 = 0, $gep_int53 = 0, $gep_int55 = 0;
 var $needRedisplay = 0, $p = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer12 = 0, $vararg_buffer6 = 0, $vararg_func = 0, $vararg_func11 = 0, $vararg_func14 = 0, $vararg_func5 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast13 = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast7 = 0, $vararg_ptr = 0, $vararg_ptr10 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, $vararg_ptr8 = 0, $vararg_ptr9 = 0;
 var $x1 = 0, $y2 = 0, label = 0, sp = 0, u$15 = 0, u$28 = 0, u$37 = 0, u$42 = 0, u$8 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer12 = sp;
 $vararg_lifetime_bitcast13 = $vararg_buffer12;
 $vararg_buffer6 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast7 = $vararg_buffer6;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 
 
 
 
 
 
 $1 = $key;
 $2 = $x;
 $3 = $y;
 $needRedisplay = 1;
 $4 = $1;
 $5 = $4&255;
 
 switch ($5|0) {
 case 115:  {
  $gep_int = 2344;
  $expanded = $gep_int;
  $gep_int38 = 2360;
  $expanded15 = $gep_int38;
  $6 = _fopen($expanded|0,$expanded15|0)|0;
  $f = $6;
  $7 = $f;
  $8 = ($7|0)!=(0);
  
  if ($8) {
   $10 = $f;
   $expanded19 = 1896;
   $11 = HEAP32[1896>>2]|0;
   $expanded20 = 1904;
   $12 = HEAP32[1904>>2]|0;
   
   $gep_int40 = $vararg_buffer1;
   $vararg_ptr = $gep_int40;
   HEAP32[$vararg_ptr>>2] = $11;
   $gep_int41 = $vararg_buffer1;
   $gep = (($gep_int41) + 4)|0;
   $vararg_ptr3 = $gep;
   HEAP32[$vararg_ptr3>>2] = $12;
   $gep_int42 = $vararg_buffer1;
   $gep43 = (($gep_int42) + 8)|0;
   $vararg_ptr4 = $gep43;
   HEAP32[$vararg_ptr4>>2] = 255;
   $expanded21 = 1;
   $vararg_func5 = $expanded21;
   $gep_int44 = 2408;
   $expanded22 = $gep_int44;
   u$15 = _fprintf($10|0,$expanded22|0,$vararg_buffer1|0)|0;
   
   $expanded23 = 1904;
   $13 = HEAP32[1904>>2]|0;
   $14 = (($13) - 1)|0;
   $y2 = $14;
   
   while(1) {
    $15 = $y2;
    $16 = ($15|0)>=(0);
    
    if (!($16)) {
     break;
    }
    $17 = $y2;
    $expanded24 = 1896;
    $18 = HEAP32[1896>>2]|0;
    $19 = Math_imul($17, $18)|0;
    $20 = (($19|0) / 4)&-1;
    $expanded25 = 2200;
    $21 = HEAP32[2200>>2]|0;
    $gep_int45 = $21;
    $gep_array = $20<<2;
    $gep46 = (($gep_int45) + ($gep_array))|0;
    $22 = $gep46;
    $23 = $22;
    $p = $23;
    $x1 = 0;
    
    while(1) {
     $24 = $x1;
     $expanded26 = 1896;
     $25 = HEAP32[1896>>2]|0;
     $26 = ($24|0)<($25|0);
     
     if (!($26)) {
      break;
     }
     $27 = $f;
     $28 = $p;
     $29 = HEAP8[$28]|0;
     $30 = $29&255;
     $31 = $p;
     $32 = HEAP8[$31]|0;
     $33 = $32&255;
     $34 = $p;
     $35 = HEAP8[$34]|0;
     $36 = $35&255;
     
     $gep_int47 = $vararg_buffer6;
     $vararg_ptr8 = $gep_int47;
     HEAP32[$vararg_ptr8>>2] = $30;
     $gep_int48 = $vararg_buffer6;
     $gep49 = (($gep_int48) + 4)|0;
     $vararg_ptr9 = $gep49;
     HEAP32[$vararg_ptr9>>2] = $33;
     $gep_int50 = $vararg_buffer6;
     $gep51 = (($gep_int50) + 8)|0;
     $vararg_ptr10 = $gep51;
     HEAP32[$vararg_ptr10>>2] = $36;
     $expanded27 = 1;
     $vararg_func11 = $expanded27;
     $gep_int52 = 2424;
     $expanded28 = $gep_int52;
     u$28 = _fprintf($27|0,$expanded28|0,$vararg_buffer6|0)|0;
     
     
     $37 = $x1;
     $38 = (($37) + 1)|0;
     $x1 = $38;
     $39 = $p;
     $gep_int53 = $39;
     $gep54 = (($gep_int53) + 1)|0;
     $40 = $gep54;
     $p = $40;
     
    }
    
    $41 = $y2;
    $42 = (($41) + -1)|0;
    $y2 = $42;
    
   }
   $43 = $f;
   u$37 = _fclose($43|0)|0;
   
  } else {
   $expanded16 = _stderr;
   $9 = HEAP32[_stderr>>2]|0;
   
   $expanded17 = 1;
   $vararg_func = $expanded17;
   $gep_int39 = 2368;
   $expanded18 = $gep_int39;
   u$8 = _fprintf($9|0,$expanded18|0,$vararg_buffer|0)|0;
   
   
  }
  $needRedisplay = 0;
  
  break;
 }
 case 81: case 113: case 27:  {
  $expanded29 = _stderr;
  $44 = HEAP32[_stderr>>2]|0;
  
  $expanded30 = 1;
  $vararg_func14 = $expanded30;
  $gep_int55 = 2440;
  $expanded31 = $gep_int55;
  u$42 = _fprintf($44|0,$expanded31|0,$vararg_buffer12|0)|0;
  
  _exit(0);
  // unreachable
  break;
 }
 case 43:  {
  $expanded32 = 1936;
  $45 = HEAP32[1936>>2]|0;
  $46 = (($45) + 32)|0;
  $expanded33 = 1936;
  HEAP32[1936>>2] = $46;
  
  break;
 }
 case 45:  {
  $expanded34 = 1936;
  $47 = HEAP32[1936>>2]|0;
  $48 = (($47) - 32)|0;
  $expanded35 = 1936;
  HEAP32[1936>>2] = $48;
  
  break;
 }
 case 32:  {
  
  break;
 }
 case 104:  {
  $expanded36 = 2336;
  $49 = HEAP32[2336>>2]|0;
  $50 = ($49|0)!=(0);
  $51 = $50 ^ 1;
  $52 = $51&1;
  $expanded37 = 2336;
  HEAP32[2336>>2] = $52;
  
  break;
 }
 default: {
  $needRedisplay = 0;
  
 }
 }
 $53 = $needRedisplay;
 $54 = ($53|0)!=(0);
 
 if (!($54)) {
  STACKTOP = sp;return;
 }
 __Z12UpdateMandelv();
 __Z11displayFuncv();
 
 STACKTOP = sp;return;
}
function __Z11specialFunciii($key,$x,$y) {
 $key = $key|0;
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0, $3 = 0;
 var $4 = 0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $expanded = 0, $expanded1 = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0;
 var $expanded8 = 0, $expanded9 = 0, $needRedisplay = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 
 
 
 
 $1 = $key;
 $2 = $x;
 $3 = $y;
 $needRedisplay = 1;
 $4 = $1;
 
 switch ($4|0) {
 case 102:  {
  $expanded9 = 1912;
  $17 = +HEAPF32[1912>>2];
  $18 = $17 * 0.02500000037252902984619140625;
  $expanded10 = 1920;
  $19 = +HEAPF32[1920>>2];
  $20 = $19 + $18;
  $expanded11 = 1920;
  HEAPF32[1920>>2] = $20;
  
  break;
 }
 case 100:  {
  $expanded6 = 1912;
  $13 = +HEAPF32[1912>>2];
  $14 = $13 * 0.02500000037252902984619140625;
  $expanded7 = 1920;
  $15 = +HEAPF32[1920>>2];
  $16 = $15 - $14;
  $expanded8 = 1920;
  HEAPF32[1920>>2] = $16;
  
  break;
 }
 case 104:  {
  $expanded12 = 1912;
  $21 = +HEAPF32[1912>>2];
  $22 = $21 * 0.89999997615814208984375;
  $expanded13 = 1912;
  HEAPF32[1912>>2] = $22;
  
  break;
 }
 case 101:  {
  $expanded = 1912;
  $5 = +HEAPF32[1912>>2];
  $6 = $5 * 0.02500000037252902984619140625;
  $expanded1 = 1928;
  $7 = +HEAPF32[1928>>2];
  $8 = $7 + $6;
  $expanded2 = 1928;
  HEAPF32[1928>>2] = $8;
  
  break;
 }
 case 105:  {
  $expanded14 = 1912;
  $23 = +HEAPF32[1912>>2];
  $24 = $23 * 1.10000002384185791015625;
  $expanded15 = 1912;
  HEAPF32[1912>>2] = $24;
  
  break;
 }
 case 103:  {
  $expanded3 = 1912;
  $9 = +HEAPF32[1912>>2];
  $10 = $9 * 0.02500000037252902984619140625;
  $expanded4 = 1928;
  $11 = +HEAPF32[1928>>2];
  $12 = $11 - $10;
  $expanded5 = 1928;
  HEAPF32[1928>>2] = $12;
  
  break;
 }
 default: {
  $needRedisplay = 0;
  
 }
 }
 $25 = $needRedisplay;
 $26 = ($25|0)!=(0);
 
 if (!($26)) {
  STACKTOP = sp;return;
 }
 __Z12UpdateMandelv();
 __Z11displayFuncv();
 
 STACKTOP = sp;return;
}
function __Z9mouseFunciiii($button,$state,$x,$y) {
 $button = $button|0;
 $state = $state|0;
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $expanded = 0, $expanded1 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 
 
 
 
 $1 = $button;
 $2 = $state;
 $3 = $x;
 $4 = $y;
 $5 = $1;
 $6 = ($5|0)==(0);
 
 if ($6) {
  $7 = $2;
  $8 = ($7|0)==(0);
  
  if ($8) {
   $9 = $3;
   $expanded = 2448;
   HEAP32[2448>>2] = $9;
   $10 = $4;
   $expanded1 = 2456;
   HEAP32[2456>>2] = $10;
   $expanded2 = 2464;
   HEAP32[2464>>2] = 1;
   
  } else {
   $11 = $2;
   $12 = ($11|0)==(1);
   
   if ($12) {
    $expanded3 = 2464;
    HEAP32[2464>>2] = 0;
    
   }
   
  }
  
  STACKTOP = sp;return;
 }
 $13 = $1;
 $14 = ($13|0)==(2);
 
 if ($14) {
  $15 = $2;
  $16 = ($15|0)==(0);
  
  if ($16) {
   $17 = $3;
   $expanded4 = 2448;
   HEAP32[2448>>2] = $17;
   $18 = $4;
   $expanded5 = 2456;
   HEAP32[2456>>2] = $18;
   $expanded6 = 2472;
   HEAP32[2472>>2] = 1;
   
  } else {
   $19 = $2;
   $20 = ($19|0)==(1);
   
   if ($20) {
    $expanded7 = 2472;
    HEAP32[2472>>2] = 0;
    
   }
   
  }
  
 }
 
 STACKTOP = sp;return;
}
function __Z10motionFuncii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0.0, $27 = 0.0;
 var $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0, $44 = 0.0, $45 = 0.0;
 var $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $distX = 0, $distX1 = 0, $distY = 0, $expanded = 0, $expanded1 = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0;
 var $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded16 = 0, $expanded17 = 0, $expanded18 = 0, $expanded19 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $needRedisplay = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 
 
 
 
 
 
 $1 = $x;
 $2 = $y;
 $needRedisplay = 1;
 $expanded = 2464;
 $3 = HEAP32[2464>>2]|0;
 $4 = ($3|0)!=(0);
 
 if ($4) {
  $5 = $1;
  $expanded1 = 2448;
  $6 = HEAP32[2448>>2]|0;
  $7 = (($5) - ($6))|0;
  $distX = $7;
  $8 = $2;
  $expanded2 = 2456;
  $9 = HEAP32[2456>>2]|0;
  $10 = (($8) - ($9))|0;
  $distY = $10;
  $11 = $distX;
  $12 = +($11|0);
  $13 = 4.000000e+01 * $12;
  $expanded3 = 1896;
  $14 = HEAP32[1896>>2]|0;
  $15 = +($14|0);
  $16 = $13 / $15;
  $expanded4 = 1912;
  $17 = +HEAPF32[1912>>2];
  $18 = $16 * $17;
  $19 = $18 * 0.02500000037252902984619140625;
  $expanded5 = 1920;
  $20 = +HEAPF32[1920>>2];
  $21 = $20 - $19;
  $expanded6 = 1920;
  HEAPF32[1920>>2] = $21;
  $22 = $distY;
  $23 = +($22|0);
  $24 = 4.000000e+01 * $23;
  $expanded7 = 1904;
  $25 = HEAP32[1904>>2]|0;
  $26 = +($25|0);
  $27 = $24 / $26;
  $expanded8 = 1912;
  $28 = +HEAPF32[1912>>2];
  $29 = $27 * $28;
  $30 = $29 * 0.02500000037252902984619140625;
  $expanded9 = 1928;
  $31 = +HEAPF32[1928>>2];
  $32 = $31 + $30;
  $expanded10 = 1928;
  HEAPF32[1928>>2] = $32;
  $33 = $1;
  $expanded11 = 2448;
  HEAP32[2448>>2] = $33;
  $34 = $2;
  $expanded12 = 2456;
  HEAP32[2456>>2] = $34;
  
 } else {
  $expanded13 = 2472;
  $35 = HEAP32[2472>>2]|0;
  $36 = ($35|0)!=(0);
  
  if ($36) {
   $37 = $1;
   $expanded14 = 2448;
   $38 = HEAP32[2448>>2]|0;
   $39 = (($37) - ($38))|0;
   $distX1 = $39;
   $40 = $distX1;
   $41 = +($40|0);
   $42 = 2.000000e+00 * $41;
   $expanded15 = 1896;
   $43 = HEAP32[1896>>2]|0;
   $44 = +($43|0);
   $45 = $42 / $44;
   $46 = 1.000000e+00 - $45;
   $expanded16 = 1912;
   $47 = +HEAPF32[1912>>2];
   $48 = $47 * $46;
   $expanded17 = 1912;
   HEAPF32[1912>>2] = $48;
   $49 = $1;
   $expanded18 = 2448;
   HEAP32[2448>>2] = $49;
   $50 = $2;
   $expanded19 = 2456;
   HEAP32[2456>>2] = $50;
   
  } else {
   $needRedisplay = 0;
   
  }
  
 }
 $51 = $needRedisplay;
 $52 = ($51|0)!=(0);
 
 if (!($52)) {
  STACKTOP = sp;return;
 }
 _glutPostRedisplay();
 
 STACKTOP = sp;return;
}
function __Z8InitGlutiPPcS_($argc,$argv,$windowTittle) {
 $argc = $argc|0;
 $argv = $argv|0;
 $windowTittle = $windowTittle|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $expanded1 = 0, $expanded2 = 0, $expanded3 = 0, label = 0, sp = 0, u$7 = 0, u$8 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = sp;
 
 
 HEAP32[$1>>2] = $argc;
 $2 = $argv;
 $3 = $windowTittle;
 $expanded = 1896;
 $4 = HEAP32[1896>>2]|0;
 $expanded1 = 1904;
 $5 = HEAP32[1904>>2]|0;
 _glutInitWindowSize($4|0,$5|0);
 _glutInitWindowPosition(0,0);
 _glutInitDisplayMode(2);
 $6 = $2;
 _glutInit($1|0,$6|0);
 $7 = $3;
 u$7 = _glutCreateWindow($7|0)|0;
 $expanded2 = 1896;
 $8 = HEAP32[1896>>2]|0;
 $expanded3 = 1904;
 $9 = HEAP32[1904>>2]|0;
 u$8 = __ZL13SetupGraphicsjj($8,$9)|0;
 _glutReshapeFunc(1);
 _glutKeyboardFunc(1);
 _glutSpecialFunc(2);
 _glutDisplayFunc(1);
 _glutMouseFunc(1);
 _glutMotionFunc(2);
 _glMatrixMode(5889);
 STACKTOP = sp;return;
}
function __ZL13SetupGraphicsjj($width,$height) {
 $width = $width|0;
 $height = $height|0;
 var $1 = 0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0.0, $9 = 0, $expanded = 0, $expanded1 = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0, $expanded13 = 0;
 var $expanded14 = 0, $expanded15 = 0, $expanded16 = 0, $expanded17 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $gep = 0, $gep19 = 0, $gep21 = 0, $gep23 = 0, $gep25 = 0, $gep27 = 0, $gep30 = 0, $gep_int = 0;
 var $gep_int18 = 0, $gep_int20 = 0, $gep_int22 = 0, $gep_int24 = 0, $gep_int26 = 0, $gep_int28 = 0, $gep_int29 = 0, $gep_int31 = 0, $gep_int32 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 
 
 $1 = $width;
 $2 = $height;
 $3 = $1;
 $4 = $2;
 __ZL13CreateTexturejj($3,$4);
 _glClearColor(0.000000e+00,0.000000e+00,0.000000e+00,0.000000e+00);
 _glDisable(2929);
 _glActiveTexture(33984);
 $5 = $1;
 $6 = $2;
 _glViewport(0,0,$5|0,$6|0);
 _glMatrixMode(5888);
 _glLoadIdentity();
 _glMatrixMode(5889);
 _glLoadIdentity();
 $expanded1 = 2480;
 $gep_int = 2480;
 $gep = (($gep_int) + 24)|0;
 $expanded = $gep;
 HEAPF32[$expanded>>2] = 0.000000e+00;
 $expanded3 = 2480;
 $gep_int18 = 2480;
 $gep19 = (($gep_int18) + 28)|0;
 $expanded2 = $gep19;
 HEAPF32[$expanded2>>2] = 0.000000e+00;
 $7 = $1;
 $8 = +($7>>>0);
 $expanded5 = 2480;
 $gep_int20 = 2480;
 $gep21 = (($gep_int20) + 16)|0;
 $expanded4 = $gep21;
 HEAPF32[$expanded4>>2] = $8;
 $expanded7 = 2480;
 $gep_int22 = 2480;
 $gep23 = (($gep_int22) + 20)|0;
 $expanded6 = $gep23;
 HEAPF32[$expanded6>>2] = 0.000000e+00;
 $9 = $1;
 $10 = +($9>>>0);
 $expanded9 = 2480;
 $gep_int24 = 2480;
 $gep25 = (($gep_int24) + 8)|0;
 $expanded8 = $gep25;
 HEAPF32[$expanded8>>2] = $10;
 $11 = $2;
 $12 = +($11>>>0);
 $expanded11 = 2480;
 $gep_int26 = 2480;
 $gep27 = (($gep_int26) + 12)|0;
 $expanded10 = $gep27;
 HEAPF32[$expanded10>>2] = $12;
 $expanded13 = 2480;
 $gep_int28 = 2480;
 $expanded12 = $gep_int28;
 HEAPF32[$expanded12>>2] = 0.000000e+00;
 $13 = $2;
 $14 = +($13>>>0);
 $expanded15 = 2480;
 $gep_int29 = 2480;
 $gep30 = (($gep_int29) + 4)|0;
 $expanded14 = $gep30;
 HEAPF32[$expanded14>>2] = $14;
 _glEnableClientState(32884);
 _glEnableClientState(32888);
 $gep_int31 = 2512;
 $expanded16 = $gep_int31;
 _glVertexPointer(2,5126,0,$expanded16|0);
 _glClientActiveTexture(33984);
 $gep_int32 = 2480;
 $expanded17 = $gep_int32;
 _glTexCoordPointer(2,5126,0,$expanded17|0);
 STACKTOP = sp;return 0;
}
function __ZL13CreateTexturejj($width,$height) {
 $width = $width|0;
 $height = $height|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $expanded = 0, $expanded10 = 0, $expanded11 = 0, $expanded12 = 0;
 var $expanded13 = 0, $expanded2 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $expanded9 = 0, $gep = 0, $gep_int = 0, $gep_int14 = 0, $gep_int15 = 0, $vararg_buffer = 0, $vararg_func = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 var u$5 = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer = sp;
 $vararg_lifetime_bitcast = $vararg_buffer;
 
 
 $1 = $width;
 $2 = $height;
 $3 = $1;
 $4 = $2;
 
 $gep_int = $vararg_buffer;
 $vararg_ptr = $gep_int;
 HEAP32[$vararg_ptr>>2] = $3;
 $gep_int14 = $vararg_buffer;
 $gep = (($gep_int14) + 4)|0;
 $vararg_ptr1 = $gep;
 HEAP32[$vararg_ptr1>>2] = $4;
 $expanded = 1;
 $vararg_func = $expanded;
 $gep_int15 = 2544;
 $expanded2 = $gep_int15;
 u$5 = _printf($expanded2|0,$vararg_buffer|0)|0;
 
 $expanded3 = 2576;
 $5 = HEAP32[2576>>2]|0;
 _glActiveTexture($5|0);
 $expanded4 = 2208;
 _glGenTextures(1,$expanded4|0);
 $expanded5 = 2216;
 $6 = HEAP32[2216>>2]|0;
 $expanded6 = 2208;
 $7 = HEAP32[2208>>2]|0;
 _glBindTexture($6|0,$7|0);
 $expanded7 = 2216;
 $8 = HEAP32[2216>>2]|0;
 _glTexParameteri($8|0,10240,9728);
 $expanded8 = 2216;
 $9 = HEAP32[2216>>2]|0;
 _glTexParameteri($9|0,10241,9728);
 $expanded9 = 2216;
 $10 = HEAP32[2216>>2]|0;
 $expanded10 = 2584;
 $11 = HEAP32[2584>>2]|0;
 $12 = $1;
 $13 = $2;
 $expanded11 = 2224;
 $14 = HEAP32[2224>>2]|0;
 $expanded12 = 2232;
 $15 = HEAP32[2232>>2]|0;
 _glTexImage2D($10|0,0,$11|0,$12|0,$13|0,0,$14|0,$15|0,0);
 $expanded13 = 2216;
 $16 = HEAP32[2216>>2]|0;
 _glBindTexture($16|0,0);
 STACKTOP = sp;return;
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
 var $expanded334 = 0, $expanded335 = 0, $expanded336 = 0, $expanded337 = 0, $expanded338 = 0, $expanded339 = 0, $expanded34 = 0, $expanded35 = 0, $expanded36 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded4 = 0, $expanded40 = 0, $expanded41 = 0, $expanded42 = 0, $expanded43 = 0, $expanded44 = 0, $expanded45 = 0, $expanded46 = 0;
 var $expanded47 = 0, $expanded48 = 0, $expanded49 = 0, $expanded5 = 0, $expanded50 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded54 = 0, $expanded55 = 0, $expanded56 = 0, $expanded57 = 0, $expanded58 = 0, $expanded59 = 0, $expanded6 = 0, $expanded60 = 0, $expanded61 = 0, $expanded62 = 0, $expanded63 = 0, $expanded64 = 0;
 var $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded68 = 0, $expanded69 = 0, $expanded7 = 0, $expanded70 = 0, $expanded71 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded75 = 0, $expanded76 = 0, $expanded77 = 0, $expanded78 = 0, $expanded79 = 0, $expanded8 = 0, $expanded80 = 0, $expanded81 = 0, $expanded82 = 0;
 var $expanded83 = 0, $expanded84 = 0, $expanded85 = 0, $expanded86 = 0, $expanded87 = 0, $expanded88 = 0, $expanded89 = 0, $expanded9 = 0, $expanded90 = 0, $expanded91 = 0, $expanded92 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0, $expanded96 = 0, $expanded97 = 0, $expanded98 = 0, $expanded99 = 0, $gep = 0, $gep1001 = 0;
 var $gep1003 = 0, $gep1005 = 0, $gep1007 = 0, $gep1011 = 0, $gep1013 = 0, $gep1015 = 0, $gep1017 = 0, $gep1019 = 0, $gep1021 = 0, $gep1023 = 0, $gep1025 = 0, $gep1027 = 0, $gep1029 = 0, $gep1031 = 0, $gep1033 = 0, $gep1035 = 0, $gep1037 = 0, $gep1039 = 0, $gep1041 = 0, $gep1043 = 0;
 var $gep1045 = 0, $gep1047 = 0, $gep1049 = 0, $gep1051 = 0, $gep1053 = 0, $gep1055 = 0, $gep1057 = 0, $gep1059 = 0, $gep1061 = 0, $gep1063 = 0, $gep1065 = 0, $gep1067 = 0, $gep1069 = 0, $gep1071 = 0, $gep1073 = 0, $gep1075 = 0, $gep1077 = 0, $gep1080 = 0, $gep1082 = 0, $gep1084 = 0;
 var $gep1086 = 0, $gep1088 = 0, $gep1090 = 0, $gep1092 = 0, $gep1094 = 0, $gep1096 = 0, $gep1098 = 0, $gep1100 = 0, $gep1102 = 0, $gep1104 = 0, $gep1106 = 0, $gep1108 = 0, $gep1110 = 0, $gep1112 = 0, $gep1114 = 0, $gep1116 = 0, $gep1118 = 0, $gep1120 = 0, $gep1122 = 0, $gep1124 = 0;
 var $gep1126 = 0, $gep1128 = 0, $gep1130 = 0, $gep1132 = 0, $gep1134 = 0, $gep1136 = 0, $gep1138 = 0, $gep1142 = 0, $gep1144 = 0, $gep1146 = 0, $gep1148 = 0, $gep1150 = 0, $gep1152 = 0, $gep1154 = 0, $gep1156 = 0, $gep1158 = 0, $gep1160 = 0, $gep1162 = 0, $gep1164 = 0, $gep1166 = 0;
 var $gep1168 = 0, $gep1170 = 0, $gep1172 = 0, $gep1174 = 0, $gep1176 = 0, $gep1178 = 0, $gep1180 = 0, $gep1182 = 0, $gep1184 = 0, $gep1186 = 0, $gep1188 = 0, $gep1190 = 0, $gep1192 = 0, $gep1194 = 0, $gep1196 = 0, $gep1198 = 0, $gep1200 = 0, $gep1202 = 0, $gep1204 = 0, $gep1206 = 0;
 var $gep1208 = 0, $gep1210 = 0, $gep1212 = 0, $gep1214 = 0, $gep1216 = 0, $gep1218 = 0, $gep1220 = 0, $gep341 = 0, $gep343 = 0, $gep345 = 0, $gep347 = 0, $gep350 = 0, $gep352 = 0, $gep354 = 0, $gep356 = 0, $gep358 = 0, $gep360 = 0, $gep362 = 0, $gep364 = 0, $gep366 = 0;
 var $gep368 = 0, $gep371 = 0, $gep373 = 0, $gep375 = 0, $gep377 = 0, $gep379 = 0, $gep381 = 0, $gep383 = 0, $gep385 = 0, $gep387 = 0, $gep389 = 0, $gep393 = 0, $gep395 = 0, $gep397 = 0, $gep399 = 0, $gep401 = 0, $gep403 = 0, $gep405 = 0, $gep407 = 0, $gep409 = 0;
 var $gep411 = 0, $gep413 = 0, $gep415 = 0, $gep417 = 0, $gep419 = 0, $gep421 = 0, $gep423 = 0, $gep425 = 0, $gep427 = 0, $gep429 = 0, $gep431 = 0, $gep433 = 0, $gep435 = 0, $gep437 = 0, $gep439 = 0, $gep441 = 0, $gep443 = 0, $gep445 = 0, $gep447 = 0, $gep449 = 0;
 var $gep451 = 0, $gep453 = 0, $gep455 = 0, $gep457 = 0, $gep459 = 0, $gep461 = 0, $gep463 = 0, $gep465 = 0, $gep467 = 0, $gep469 = 0, $gep471 = 0, $gep473 = 0, $gep475 = 0, $gep477 = 0, $gep479 = 0, $gep481 = 0, $gep483 = 0, $gep485 = 0, $gep487 = 0, $gep489 = 0;
 var $gep491 = 0, $gep493 = 0, $gep495 = 0, $gep497 = 0, $gep499 = 0, $gep501 = 0, $gep505 = 0, $gep507 = 0, $gep509 = 0, $gep511 = 0, $gep513 = 0, $gep515 = 0, $gep517 = 0, $gep519 = 0, $gep521 = 0, $gep523 = 0, $gep525 = 0, $gep527 = 0, $gep529 = 0, $gep531 = 0;
 var $gep533 = 0, $gep535 = 0, $gep537 = 0, $gep539 = 0, $gep541 = 0, $gep543 = 0, $gep545 = 0, $gep547 = 0, $gep549 = 0, $gep551 = 0, $gep553 = 0, $gep555 = 0, $gep557 = 0, $gep559 = 0, $gep561 = 0, $gep563 = 0, $gep565 = 0, $gep567 = 0, $gep569 = 0, $gep571 = 0;
 var $gep573 = 0, $gep575 = 0, $gep577 = 0, $gep579 = 0, $gep581 = 0, $gep583 = 0, $gep585 = 0, $gep587 = 0, $gep589 = 0, $gep591 = 0, $gep593 = 0, $gep595 = 0, $gep597 = 0, $gep599 = 0, $gep601 = 0, $gep603 = 0, $gep605 = 0, $gep607 = 0, $gep609 = 0, $gep611 = 0;
 var $gep613 = 0, $gep615 = 0, $gep617 = 0, $gep619 = 0, $gep621 = 0, $gep623 = 0, $gep627 = 0, $gep629 = 0, $gep631 = 0, $gep633 = 0, $gep635 = 0, $gep637 = 0, $gep639 = 0, $gep641 = 0, $gep643 = 0, $gep645 = 0, $gep647 = 0, $gep649 = 0, $gep651 = 0, $gep653 = 0;
 var $gep655 = 0, $gep657 = 0, $gep659 = 0, $gep661 = 0, $gep663 = 0, $gep665 = 0, $gep667 = 0, $gep669 = 0, $gep671 = 0, $gep673 = 0, $gep675 = 0, $gep677 = 0, $gep679 = 0, $gep681 = 0, $gep683 = 0, $gep685 = 0, $gep687 = 0, $gep689 = 0, $gep691 = 0, $gep693 = 0;
 var $gep695 = 0, $gep697 = 0, $gep699 = 0, $gep701 = 0, $gep703 = 0, $gep705 = 0, $gep707 = 0, $gep709 = 0, $gep711 = 0, $gep713 = 0, $gep715 = 0, $gep717 = 0, $gep719 = 0, $gep721 = 0, $gep723 = 0, $gep725 = 0, $gep727 = 0, $gep729 = 0, $gep731 = 0, $gep733 = 0;
 var $gep736 = 0, $gep738 = 0, $gep740 = 0, $gep742 = 0, $gep744 = 0, $gep746 = 0, $gep749 = 0, $gep751 = 0, $gep753 = 0, $gep755 = 0, $gep757 = 0, $gep759 = 0, $gep762 = 0, $gep764 = 0, $gep766 = 0, $gep768 = 0, $gep770 = 0, $gep772 = 0, $gep774 = 0, $gep776 = 0;
 var $gep778 = 0, $gep780 = 0, $gep782 = 0, $gep784 = 0, $gep786 = 0, $gep788 = 0, $gep790 = 0, $gep792 = 0, $gep794 = 0, $gep796 = 0, $gep798 = 0, $gep800 = 0, $gep802 = 0, $gep804 = 0, $gep807 = 0, $gep809 = 0, $gep811 = 0, $gep813 = 0, $gep815 = 0, $gep817 = 0;
 var $gep819 = 0, $gep821 = 0, $gep823 = 0, $gep825 = 0, $gep827 = 0, $gep829 = 0, $gep831 = 0, $gep833 = 0, $gep835 = 0, $gep837 = 0, $gep840 = 0, $gep842 = 0, $gep844 = 0, $gep846 = 0, $gep848 = 0, $gep850 = 0, $gep852 = 0, $gep854 = 0, $gep856 = 0, $gep858 = 0;
 var $gep860 = 0, $gep862 = 0, $gep864 = 0, $gep866 = 0, $gep868 = 0, $gep870 = 0, $gep872 = 0, $gep875 = 0, $gep877 = 0, $gep879 = 0, $gep881 = 0, $gep883 = 0, $gep885 = 0, $gep887 = 0, $gep889 = 0, $gep891 = 0, $gep893 = 0, $gep895 = 0, $gep897 = 0, $gep899 = 0;
 var $gep901 = 0, $gep903 = 0, $gep905 = 0, $gep907 = 0, $gep909 = 0, $gep911 = 0, $gep913 = 0, $gep915 = 0, $gep917 = 0, $gep919 = 0, $gep921 = 0, $gep923 = 0, $gep925 = 0, $gep927 = 0, $gep931 = 0, $gep933 = 0, $gep935 = 0, $gep937 = 0, $gep939 = 0, $gep941 = 0;
 var $gep943 = 0, $gep945 = 0, $gep947 = 0, $gep949 = 0, $gep951 = 0, $gep953 = 0, $gep955 = 0, $gep957 = 0, $gep959 = 0, $gep961 = 0, $gep963 = 0, $gep965 = 0, $gep967 = 0, $gep969 = 0, $gep971 = 0, $gep973 = 0, $gep975 = 0, $gep977 = 0, $gep979 = 0, $gep981 = 0;
 var $gep983 = 0, $gep985 = 0, $gep987 = 0, $gep989 = 0, $gep991 = 0, $gep993 = 0, $gep995 = 0, $gep997 = 0, $gep999 = 0, $gep_array = 0, $gep_array1006 = 0, $gep_array1012 = 0, $gep_array1016 = 0, $gep_array1028 = 0, $gep_array1052 = 0, $gep_array1137 = 0, $gep_array1143 = 0, $gep_array1147 = 0, $gep_array1159 = 0, $gep_array1183 = 0;
 var $gep_array344 = 0, $gep_array361 = 0, $gep_array365 = 0, $gep_array388 = 0, $gep_array394 = 0, $gep_array398 = 0, $gep_array416 = 0, $gep_array452 = 0, $gep_array500 = 0, $gep_array506 = 0, $gep_array510 = 0, $gep_array530 = 0, $gep_array538 = 0, $gep_array542 = 0, $gep_array578 = 0, $gep_array622 = 0, $gep_array628 = 0, $gep_array632 = 0, $gep_array644 = 0, $gep_array668 = 0;
 var $gep_array812 = 0, $gep_array816 = 0, $gep_array820 = 0, $gep_array922 = 0, $gep_array964 = 0, $gep_int = 0, $gep_int1000 = 0, $gep_int1002 = 0, $gep_int1004 = 0, $gep_int1008 = 0, $gep_int1009 = 0, $gep_int1010 = 0, $gep_int1014 = 0, $gep_int1018 = 0, $gep_int1020 = 0, $gep_int1022 = 0, $gep_int1024 = 0, $gep_int1026 = 0, $gep_int1030 = 0, $gep_int1032 = 0;
 var $gep_int1034 = 0, $gep_int1036 = 0, $gep_int1038 = 0, $gep_int1040 = 0, $gep_int1042 = 0, $gep_int1044 = 0, $gep_int1046 = 0, $gep_int1048 = 0, $gep_int1050 = 0, $gep_int1054 = 0, $gep_int1056 = 0, $gep_int1058 = 0, $gep_int1060 = 0, $gep_int1062 = 0, $gep_int1064 = 0, $gep_int1066 = 0, $gep_int1068 = 0, $gep_int1070 = 0, $gep_int1072 = 0, $gep_int1074 = 0;
 var $gep_int1076 = 0, $gep_int1078 = 0, $gep_int1079 = 0, $gep_int1081 = 0, $gep_int1083 = 0, $gep_int1085 = 0, $gep_int1087 = 0, $gep_int1089 = 0, $gep_int1091 = 0, $gep_int1093 = 0, $gep_int1095 = 0, $gep_int1097 = 0, $gep_int1099 = 0, $gep_int1101 = 0, $gep_int1103 = 0, $gep_int1105 = 0, $gep_int1107 = 0, $gep_int1109 = 0, $gep_int1111 = 0, $gep_int1113 = 0;
 var $gep_int1115 = 0, $gep_int1117 = 0, $gep_int1119 = 0, $gep_int1121 = 0, $gep_int1123 = 0, $gep_int1125 = 0, $gep_int1127 = 0, $gep_int1129 = 0, $gep_int1131 = 0, $gep_int1133 = 0, $gep_int1135 = 0, $gep_int1139 = 0, $gep_int1140 = 0, $gep_int1141 = 0, $gep_int1145 = 0, $gep_int1149 = 0, $gep_int1151 = 0, $gep_int1153 = 0, $gep_int1155 = 0, $gep_int1157 = 0;
 var $gep_int1161 = 0, $gep_int1163 = 0, $gep_int1165 = 0, $gep_int1167 = 0, $gep_int1169 = 0, $gep_int1171 = 0, $gep_int1173 = 0, $gep_int1175 = 0, $gep_int1177 = 0, $gep_int1179 = 0, $gep_int1181 = 0, $gep_int1185 = 0, $gep_int1187 = 0, $gep_int1189 = 0, $gep_int1191 = 0, $gep_int1193 = 0, $gep_int1195 = 0, $gep_int1197 = 0, $gep_int1199 = 0, $gep_int1201 = 0;
 var $gep_int1203 = 0, $gep_int1205 = 0, $gep_int1207 = 0, $gep_int1209 = 0, $gep_int1211 = 0, $gep_int1213 = 0, $gep_int1215 = 0, $gep_int1217 = 0, $gep_int1219 = 0, $gep_int340 = 0, $gep_int342 = 0, $gep_int346 = 0, $gep_int348 = 0, $gep_int349 = 0, $gep_int351 = 0, $gep_int353 = 0, $gep_int355 = 0, $gep_int357 = 0, $gep_int359 = 0, $gep_int363 = 0;
 var $gep_int367 = 0, $gep_int369 = 0, $gep_int370 = 0, $gep_int372 = 0, $gep_int374 = 0, $gep_int376 = 0, $gep_int378 = 0, $gep_int380 = 0, $gep_int382 = 0, $gep_int384 = 0, $gep_int386 = 0, $gep_int390 = 0, $gep_int391 = 0, $gep_int392 = 0, $gep_int396 = 0, $gep_int400 = 0, $gep_int402 = 0, $gep_int404 = 0, $gep_int406 = 0, $gep_int408 = 0;
 var $gep_int410 = 0, $gep_int412 = 0, $gep_int414 = 0, $gep_int418 = 0, $gep_int420 = 0, $gep_int422 = 0, $gep_int424 = 0, $gep_int426 = 0, $gep_int428 = 0, $gep_int430 = 0, $gep_int432 = 0, $gep_int434 = 0, $gep_int436 = 0, $gep_int438 = 0, $gep_int440 = 0, $gep_int442 = 0, $gep_int444 = 0, $gep_int446 = 0, $gep_int448 = 0, $gep_int450 = 0;
 var $gep_int454 = 0, $gep_int456 = 0, $gep_int458 = 0, $gep_int460 = 0, $gep_int462 = 0, $gep_int464 = 0, $gep_int466 = 0, $gep_int468 = 0, $gep_int470 = 0, $gep_int472 = 0, $gep_int474 = 0, $gep_int476 = 0, $gep_int478 = 0, $gep_int480 = 0, $gep_int482 = 0, $gep_int484 = 0, $gep_int486 = 0, $gep_int488 = 0, $gep_int490 = 0, $gep_int492 = 0;
 var $gep_int494 = 0, $gep_int496 = 0, $gep_int498 = 0, $gep_int502 = 0, $gep_int503 = 0, $gep_int504 = 0, $gep_int508 = 0, $gep_int512 = 0, $gep_int514 = 0, $gep_int516 = 0, $gep_int518 = 0, $gep_int520 = 0, $gep_int522 = 0, $gep_int524 = 0, $gep_int526 = 0, $gep_int528 = 0, $gep_int532 = 0, $gep_int534 = 0, $gep_int536 = 0, $gep_int540 = 0;
 var $gep_int544 = 0, $gep_int546 = 0, $gep_int548 = 0, $gep_int550 = 0, $gep_int552 = 0, $gep_int554 = 0, $gep_int556 = 0, $gep_int558 = 0, $gep_int560 = 0, $gep_int562 = 0, $gep_int564 = 0, $gep_int566 = 0, $gep_int568 = 0, $gep_int570 = 0, $gep_int572 = 0, $gep_int574 = 0, $gep_int576 = 0, $gep_int580 = 0, $gep_int582 = 0, $gep_int584 = 0;
 var $gep_int586 = 0, $gep_int588 = 0, $gep_int590 = 0, $gep_int592 = 0, $gep_int594 = 0, $gep_int596 = 0, $gep_int598 = 0, $gep_int600 = 0, $gep_int602 = 0, $gep_int604 = 0, $gep_int606 = 0, $gep_int608 = 0, $gep_int610 = 0, $gep_int612 = 0, $gep_int614 = 0, $gep_int616 = 0, $gep_int618 = 0, $gep_int620 = 0, $gep_int624 = 0, $gep_int625 = 0;
 var $gep_int626 = 0, $gep_int630 = 0, $gep_int634 = 0, $gep_int636 = 0, $gep_int638 = 0, $gep_int640 = 0, $gep_int642 = 0, $gep_int646 = 0, $gep_int648 = 0, $gep_int650 = 0, $gep_int652 = 0, $gep_int654 = 0, $gep_int656 = 0, $gep_int658 = 0, $gep_int660 = 0, $gep_int662 = 0, $gep_int664 = 0, $gep_int666 = 0, $gep_int670 = 0, $gep_int672 = 0;
 var $gep_int674 = 0, $gep_int676 = 0, $gep_int678 = 0, $gep_int680 = 0, $gep_int682 = 0, $gep_int684 = 0, $gep_int686 = 0, $gep_int688 = 0, $gep_int690 = 0, $gep_int692 = 0, $gep_int694 = 0, $gep_int696 = 0, $gep_int698 = 0, $gep_int700 = 0, $gep_int702 = 0, $gep_int704 = 0, $gep_int706 = 0, $gep_int708 = 0, $gep_int710 = 0, $gep_int712 = 0;
 var $gep_int714 = 0, $gep_int716 = 0, $gep_int718 = 0, $gep_int720 = 0, $gep_int722 = 0, $gep_int724 = 0, $gep_int726 = 0, $gep_int728 = 0, $gep_int730 = 0, $gep_int732 = 0, $gep_int734 = 0, $gep_int735 = 0, $gep_int737 = 0, $gep_int739 = 0, $gep_int741 = 0, $gep_int743 = 0, $gep_int745 = 0, $gep_int747 = 0, $gep_int748 = 0, $gep_int750 = 0;
 var $gep_int752 = 0, $gep_int754 = 0, $gep_int756 = 0, $gep_int758 = 0, $gep_int760 = 0, $gep_int761 = 0, $gep_int763 = 0, $gep_int765 = 0, $gep_int767 = 0, $gep_int769 = 0, $gep_int771 = 0, $gep_int773 = 0, $gep_int775 = 0, $gep_int777 = 0, $gep_int779 = 0, $gep_int781 = 0, $gep_int783 = 0, $gep_int785 = 0, $gep_int787 = 0, $gep_int789 = 0;
 var $gep_int791 = 0, $gep_int793 = 0, $gep_int795 = 0, $gep_int797 = 0, $gep_int799 = 0, $gep_int801 = 0, $gep_int803 = 0, $gep_int805 = 0, $gep_int806 = 0, $gep_int808 = 0, $gep_int810 = 0, $gep_int814 = 0, $gep_int818 = 0, $gep_int822 = 0, $gep_int824 = 0, $gep_int826 = 0, $gep_int828 = 0, $gep_int830 = 0, $gep_int832 = 0, $gep_int834 = 0;
 var $gep_int836 = 0, $gep_int838 = 0, $gep_int839 = 0, $gep_int841 = 0, $gep_int843 = 0, $gep_int845 = 0, $gep_int847 = 0, $gep_int849 = 0, $gep_int851 = 0, $gep_int853 = 0, $gep_int855 = 0, $gep_int857 = 0, $gep_int859 = 0, $gep_int861 = 0, $gep_int863 = 0, $gep_int865 = 0, $gep_int867 = 0, $gep_int869 = 0, $gep_int871 = 0, $gep_int873 = 0;
 var $gep_int874 = 0, $gep_int876 = 0, $gep_int878 = 0, $gep_int880 = 0, $gep_int882 = 0, $gep_int884 = 0, $gep_int886 = 0, $gep_int888 = 0, $gep_int890 = 0, $gep_int892 = 0, $gep_int894 = 0, $gep_int896 = 0, $gep_int898 = 0, $gep_int900 = 0, $gep_int902 = 0, $gep_int904 = 0, $gep_int906 = 0, $gep_int908 = 0, $gep_int910 = 0, $gep_int912 = 0;
 var $gep_int914 = 0, $gep_int916 = 0, $gep_int918 = 0, $gep_int920 = 0, $gep_int924 = 0, $gep_int926 = 0, $gep_int928 = 0, $gep_int929 = 0, $gep_int930 = 0, $gep_int932 = 0, $gep_int934 = 0, $gep_int936 = 0, $gep_int938 = 0, $gep_int940 = 0, $gep_int942 = 0, $gep_int944 = 0, $gep_int946 = 0, $gep_int948 = 0, $gep_int950 = 0, $gep_int952 = 0;
 var $gep_int954 = 0, $gep_int956 = 0, $gep_int958 = 0, $gep_int960 = 0, $gep_int962 = 0, $gep_int966 = 0, $gep_int968 = 0, $gep_int970 = 0, $gep_int972 = 0, $gep_int974 = 0, $gep_int976 = 0, $gep_int978 = 0, $gep_int980 = 0, $gep_int982 = 0, $gep_int984 = 0, $gep_int986 = 0, $gep_int988 = 0, $gep_int990 = 0, $gep_int992 = 0, $gep_int994 = 0;
 var $gep_int996 = 0, $gep_int998 = 0, $i$02$i$i = 0, $i$02$i$i$phi = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i31 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond2$i = 0, $or$cond21$i = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0;
 var $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i17 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$331$i = 0, $rsize$331$i$phi = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0;
 var $t$0$i = 0, $t$0$i16 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$230$i = 0, $t$230$i$phi = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i18 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$332$i = 0, $v$332$i$phi = 0;
 var label = 0, sp = 0, u$318 = 0;
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
   $expanded1 = 2880;
   $gep_int = 2880;
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
    $expanded2 = 2880;
    $gep_int340 = 2880;
    $gep = (($gep_int340) + 40)|0;
    $gep_array = $14<<2;
    $gep341 = (($gep) + ($gep_array))|0;
    $15 = $gep341;
    $16 = $15;
    $$sum11 = (($14) + 2)|0;
    $expanded3 = 2880;
    $gep_int342 = 2880;
    $gep343 = (($gep_int342) + 40)|0;
    $gep_array344 = $$sum11<<2;
    $gep345 = (($gep343) + ($gep_array344))|0;
    $17 = $gep345;
    $18 = HEAP32[$17>>2]|0;
    $gep_int346 = $18;
    $gep347 = (($gep_int346) + 8)|0;
    $19 = $gep347;
    $20 = HEAP32[$19>>2]|0;
    $21 = ($16|0)==($20|0);
    
    do {
     if ($21) {
      $22 = 1 << $13;
      $23 = $22 ^ -1;
      $24 = $7 & $23;
      $expanded5 = 2880;
      $gep_int348 = 2880;
      $expanded4 = $gep_int348;
      HEAP32[$expanded4>>2] = $24;
      
     } else {
      $25 = $20;
      $expanded7 = 2880;
      $gep_int349 = 2880;
      $gep350 = (($gep_int349) + 16)|0;
      $expanded6 = $gep350;
      $26 = HEAP32[$expanded6>>2]|0;
      $27 = ($25>>>0)<($26>>>0);
      
      if ($27) {
       _abort();
       // unreachable
      }
      $gep_int351 = $20;
      $gep352 = (($gep_int351) + 12)|0;
      $28 = $gep352;
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
    $gep_int353 = $18;
    $gep354 = (($gep_int353) + 4)|0;
    $33 = $gep354;
    HEAP32[$33>>2] = $32;
    $34 = $18;
    $$sum1314 = $31 | 4;
    $gep_int355 = $18;
    $gep356 = (($gep_int355) + ($$sum1314))|0;
    $35 = $gep356;
    $36 = $35;
    $37 = HEAP32[$35>>2]|0;
    $38 = $37 | 1;
    HEAP32[$35>>2] = $38;
    $39 = $19;
    
    $mem$0 = $39;
    
    STACKTOP = sp;return $mem$0|0;
   }
   $expanded9 = 2880;
   $gep_int357 = 2880;
   $gep358 = (($gep_int357) + 8)|0;
   $expanded8 = $gep358;
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
    $expanded10 = 2880;
    $gep_int359 = 2880;
    $gep360 = (($gep_int359) + 40)|0;
    $gep_array361 = $71<<2;
    $gep362 = (($gep360) + ($gep_array361))|0;
    $72 = $gep362;
    $73 = $72;
    $$sum4 = (($71) + 2)|0;
    $expanded11 = 2880;
    $gep_int363 = 2880;
    $gep364 = (($gep_int363) + 40)|0;
    $gep_array365 = $$sum4<<2;
    $gep366 = (($gep364) + ($gep_array365))|0;
    $74 = $gep366;
    $75 = HEAP32[$74>>2]|0;
    $gep_int367 = $75;
    $gep368 = (($gep_int367) + 8)|0;
    $76 = $gep368;
    $77 = HEAP32[$76>>2]|0;
    $78 = ($73|0)==($77|0);
    
    do {
     if ($78) {
      $79 = 1 << $70;
      $80 = $79 ^ -1;
      $81 = $7 & $80;
      $expanded13 = 2880;
      $gep_int369 = 2880;
      $expanded12 = $gep_int369;
      HEAP32[$expanded12>>2] = $81;
      
     } else {
      $82 = $77;
      $expanded15 = 2880;
      $gep_int370 = 2880;
      $gep371 = (($gep_int370) + 16)|0;
      $expanded14 = $gep371;
      $83 = HEAP32[$expanded14>>2]|0;
      $84 = ($82>>>0)<($83>>>0);
      
      if ($84) {
       _abort();
       // unreachable
      }
      $gep_int372 = $77;
      $gep373 = (($gep_int372) + 12)|0;
      $85 = $gep373;
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
    $gep_int374 = $75;
    $gep375 = (($gep_int374) + 4)|0;
    $91 = $gep375;
    HEAP32[$91>>2] = $90;
    $92 = $75;
    $gep_int376 = $75;
    $gep377 = (($gep_int376) + ($5))|0;
    $93 = $gep377;
    $94 = $93;
    $95 = $89 | 1;
    $$sum67 = $5 | 4;
    $gep_int378 = $75;
    $gep379 = (($gep_int378) + ($$sum67))|0;
    $96 = $gep379;
    $97 = $96;
    HEAP32[$96>>2] = $95;
    $gep_int380 = $75;
    $gep381 = (($gep_int380) + ($88))|0;
    $98 = $gep381;
    $99 = $98;
    HEAP32[$98>>2] = $89;
    $expanded17 = 2880;
    $gep_int382 = 2880;
    $gep383 = (($gep_int382) + 8)|0;
    $expanded16 = $gep383;
    $100 = HEAP32[$expanded16>>2]|0;
    $101 = ($100|0)==(0);
    
    if (!($101)) {
     $expanded19 = 2880;
     $gep_int384 = 2880;
     $gep385 = (($gep_int384) + 20)|0;
     $expanded18 = $gep385;
     $102 = HEAP32[$expanded18>>2]|0;
     $103 = $100 >>> 3;
     $104 = $103 << 1;
     $expanded20 = 2880;
     $gep_int386 = 2880;
     $gep387 = (($gep_int386) + 40)|0;
     $gep_array388 = $104<<2;
     $gep389 = (($gep387) + ($gep_array388))|0;
     $105 = $gep389;
     $106 = $105;
     $expanded22 = 2880;
     $gep_int390 = 2880;
     $expanded21 = $gep_int390;
     $107 = HEAP32[$expanded21>>2]|0;
     $108 = 1 << $103;
     $109 = $107 & $108;
     $110 = ($109|0)==(0);
     
     do {
      if ($110) {
       $111 = $107 | $108;
       $expanded24 = 2880;
       $gep_int391 = 2880;
       $expanded23 = $gep_int391;
       HEAP32[$expanded23>>2] = $111;
       $$sum9$pre = (($104) + 2)|0;
       $expanded25 = 2880;
       $gep_int392 = 2880;
       $gep393 = (($gep_int392) + 40)|0;
       $gep_array394 = $$sum9$pre<<2;
       $gep395 = (($gep393) + ($gep_array394))|0;
       $$pre = $gep395;
       
       $$pre$phiZ2D = $$pre;$F4$0 = $106;
      } else {
       $$sum10 = (($104) + 2)|0;
       $expanded26 = 2880;
       $gep_int396 = 2880;
       $gep397 = (($gep_int396) + 40)|0;
       $gep_array398 = $$sum10<<2;
       $gep399 = (($gep397) + ($gep_array398))|0;
       $112 = $gep399;
       $113 = HEAP32[$112>>2]|0;
       $114 = $113;
       $expanded28 = 2880;
       $gep_int400 = 2880;
       $gep401 = (($gep_int400) + 16)|0;
       $expanded27 = $gep401;
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
     $gep_int402 = $F4$0;
     $gep403 = (($gep_int402) + 12)|0;
     $117 = $gep403;
     HEAP32[$117>>2] = $102;
     $gep_int404 = $102;
     $gep405 = (($gep_int404) + 8)|0;
     $118 = $gep405;
     HEAP32[$118>>2] = $F4$0;
     $gep_int406 = $102;
     $gep407 = (($gep_int406) + 12)|0;
     $119 = $gep407;
     HEAP32[$119>>2] = $106;
     
    }
    $expanded30 = 2880;
    $gep_int408 = 2880;
    $gep409 = (($gep_int408) + 8)|0;
    $expanded29 = $gep409;
    HEAP32[$expanded29>>2] = $89;
    $expanded32 = 2880;
    $gep_int410 = 2880;
    $gep411 = (($gep_int410) + 20)|0;
    $expanded31 = $gep411;
    HEAP32[$expanded31>>2] = $94;
    $120 = $76;
    
    $mem$0 = $120;
    
    STACKTOP = sp;return $mem$0|0;
   }
   $expanded34 = 2880;
   $gep_int412 = 2880;
   $gep413 = (($gep_int412) + 4)|0;
   $expanded33 = $gep413;
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
   $expanded35 = 2880;
   $gep_int414 = 2880;
   $gep415 = (($gep_int414) + 304)|0;
   $gep_array416 = $145<<2;
   $gep417 = (($gep415) + ($gep_array416))|0;
   $146 = $gep417;
   $147 = HEAP32[$146>>2]|0;
   $gep_int418 = $147;
   $gep419 = (($gep_int418) + 4)|0;
   $148 = $gep419;
   $149 = HEAP32[$148>>2]|0;
   $150 = $149 & -8;
   $151 = (($150) - ($5))|0;
   
   $rsize$0$i = $151;$t$0$i = $147;$v$0$i = $147;
   while(1) {
    
    
    
    $gep_int420 = $t$0$i;
    $gep421 = (($gep_int420) + 16)|0;
    $152 = $gep421;
    $153 = HEAP32[$152>>2]|0;
    $154 = ($153|0)==(0);
    
    if ($154) {
     $gep_int422 = $t$0$i;
     $gep423 = (($gep_int422) + 20)|0;
     $155 = $gep423;
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
    
    $gep_int424 = $158;
    $gep425 = (($gep_int424) + 4)|0;
    $159 = $gep425;
    $160 = HEAP32[$159>>2]|0;
    $161 = $160 & -8;
    $162 = (($161) - ($5))|0;
    $163 = ($162>>>0)<($rsize$0$i>>>0);
    $$rsize$0$i = $163 ? $162 : $rsize$0$i;
    $$v$0$i = $163 ? $158 : $v$0$i;
    
    $rsize$0$i = $$rsize$0$i;$t$0$i = $158;$v$0$i = $$v$0$i;
   }
   $164 = $v$0$i;
   $expanded37 = 2880;
   $gep_int426 = 2880;
   $gep427 = (($gep_int426) + 16)|0;
   $expanded36 = $gep427;
   $165 = HEAP32[$expanded36>>2]|0;
   $166 = ($164>>>0)<($165>>>0);
   
   if ($166) {
    _abort();
    // unreachable
   }
   $gep_int428 = $v$0$i;
   $gep429 = (($gep_int428) + ($5))|0;
   $167 = $gep429;
   $168 = $167;
   $169 = ($164>>>0)<($167>>>0);
   
   if (!($169)) {
    _abort();
    // unreachable
   }
   $gep_int430 = $v$0$i;
   $gep431 = (($gep_int430) + 24)|0;
   $170 = $gep431;
   $171 = HEAP32[$170>>2]|0;
   $gep_int432 = $v$0$i;
   $gep433 = (($gep_int432) + 12)|0;
   $172 = $gep433;
   $173 = HEAP32[$172>>2]|0;
   $174 = ($173|0)==($v$0$i|0);
   
   do {
    if ($174) {
     $gep_int440 = $v$0$i;
     $gep441 = (($gep_int440) + 20)|0;
     $185 = $gep441;
     $186 = HEAP32[$185>>2]|0;
     $187 = ($186|0)==(0);
     
     if ($187) {
      $gep_int442 = $v$0$i;
      $gep443 = (($gep_int442) + 16)|0;
      $188 = $gep443;
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
      
      
      $gep_int444 = $R$0$i;
      $gep445 = (($gep_int444) + 20)|0;
      $191 = $gep445;
      $192 = HEAP32[$191>>2]|0;
      $193 = ($192|0)==(0);
      
      if (!($193)) {
       $RP$0$i$phi = $191;$R$0$i$phi = $192;$RP$0$i = $RP$0$i$phi;$R$0$i = $R$0$i$phi;
       continue;
      }
      $gep_int446 = $R$0$i;
      $gep447 = (($gep_int446) + 16)|0;
      $194 = $gep447;
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
     $gep_int434 = $v$0$i;
     $gep435 = (($gep_int434) + 8)|0;
     $175 = $gep435;
     $176 = HEAP32[$175>>2]|0;
     $177 = $176;
     $178 = ($177>>>0)<($165>>>0);
     
     if ($178) {
      _abort();
      // unreachable
     }
     $gep_int436 = $176;
     $gep437 = (($gep_int436) + 12)|0;
     $179 = $gep437;
     $180 = HEAP32[$179>>2]|0;
     $181 = ($180|0)==($v$0$i|0);
     
     if (!($181)) {
      _abort();
      // unreachable
     }
     $gep_int438 = $173;
     $gep439 = (($gep_int438) + 8)|0;
     $182 = $gep439;
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
     $gep_int448 = $v$0$i;
     $gep449 = (($gep_int448) + 28)|0;
     $200 = $gep449;
     $201 = HEAP32[$200>>2]|0;
     $expanded38 = 2880;
     $gep_int450 = 2880;
     $gep451 = (($gep_int450) + 304)|0;
     $gep_array452 = $201<<2;
     $gep453 = (($gep451) + ($gep_array452))|0;
     $202 = $gep453;
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
       $expanded40 = 2880;
       $gep_int454 = 2880;
       $gep455 = (($gep_int454) + 4)|0;
       $expanded39 = $gep455;
       $207 = HEAP32[$expanded39>>2]|0;
       $208 = $207 & $206;
       $expanded42 = 2880;
       $gep_int456 = 2880;
       $gep457 = (($gep_int456) + 4)|0;
       $expanded41 = $gep457;
       HEAP32[$expanded41>>2] = $208;
       
       break L78;
      } else {
       $209 = $171;
       $expanded44 = 2880;
       $gep_int458 = 2880;
       $gep459 = (($gep_int458) + 16)|0;
       $expanded43 = $gep459;
       $210 = HEAP32[$expanded43>>2]|0;
       $211 = ($209>>>0)<($210>>>0);
       
       if ($211) {
        _abort();
        // unreachable
       }
       $gep_int460 = $171;
       $gep461 = (($gep_int460) + 16)|0;
       $212 = $gep461;
       $213 = HEAP32[$212>>2]|0;
       $214 = ($213|0)==($v$0$i|0);
       
       if ($214) {
        HEAP32[$212>>2] = $R$1$i;
        
       } else {
        $gep_int462 = $171;
        $gep463 = (($gep_int462) + 20)|0;
        $215 = $gep463;
        HEAP32[$215>>2] = $R$1$i;
        
       }
       $216 = ($R$1$i|0)==(0);
       
       if ($216) {
        break L78;
       }
      }
     } while(0);
     $217 = $R$1$i;
     $expanded46 = 2880;
     $gep_int464 = 2880;
     $gep465 = (($gep_int464) + 16)|0;
     $expanded45 = $gep465;
     $218 = HEAP32[$expanded45>>2]|0;
     $219 = ($217>>>0)<($218>>>0);
     
     if ($219) {
      _abort();
      // unreachable
     }
     $gep_int466 = $R$1$i;
     $gep467 = (($gep_int466) + 24)|0;
     $220 = $gep467;
     HEAP32[$220>>2] = $171;
     $gep_int468 = $v$0$i;
     $gep469 = (($gep_int468) + 16)|0;
     $221 = $gep469;
     $222 = HEAP32[$221>>2]|0;
     $223 = ($222|0)==(0);
     
     do {
      if (!($223)) {
       $224 = $222;
       $expanded48 = 2880;
       $gep_int470 = 2880;
       $gep471 = (($gep_int470) + 16)|0;
       $expanded47 = $gep471;
       $225 = HEAP32[$expanded47>>2]|0;
       $226 = ($224>>>0)<($225>>>0);
       
       if ($226) {
        _abort();
        // unreachable
       } else {
        $gep_int472 = $R$1$i;
        $gep473 = (($gep_int472) + 16)|0;
        $227 = $gep473;
        HEAP32[$227>>2] = $222;
        $gep_int474 = $222;
        $gep475 = (($gep_int474) + 24)|0;
        $228 = $gep475;
        HEAP32[$228>>2] = $R$1$i;
        
        break;
       }
      }
     } while(0);
     $gep_int476 = $v$0$i;
     $gep477 = (($gep_int476) + 20)|0;
     $229 = $gep477;
     $230 = HEAP32[$229>>2]|0;
     $231 = ($230|0)==(0);
     
     if ($231) {
      break;
     }
     $232 = $230;
     $expanded50 = 2880;
     $gep_int478 = 2880;
     $gep479 = (($gep_int478) + 16)|0;
     $expanded49 = $gep479;
     $233 = HEAP32[$expanded49>>2]|0;
     $234 = ($232>>>0)<($233>>>0);
     
     if ($234) {
      _abort();
      // unreachable
     } else {
      $gep_int480 = $R$1$i;
      $gep481 = (($gep_int480) + 20)|0;
      $235 = $gep481;
      HEAP32[$235>>2] = $230;
      $gep_int482 = $230;
      $gep483 = (($gep_int482) + 24)|0;
      $236 = $gep483;
      HEAP32[$236>>2] = $R$1$i;
      
      break;
     }
    }
   } while(0);
   $237 = ($rsize$0$i>>>0)<(16);
   
   if ($237) {
    $238 = (($rsize$0$i) + ($5))|0;
    $239 = $238 | 3;
    $gep_int484 = $v$0$i;
    $gep485 = (($gep_int484) + 4)|0;
    $240 = $gep485;
    HEAP32[$240>>2] = $239;
    $$sum4$i = (($238) + 4)|0;
    $gep_int486 = $v$0$i;
    $gep487 = (($gep_int486) + ($$sum4$i))|0;
    $241 = $gep487;
    $242 = $241;
    $243 = HEAP32[$241>>2]|0;
    $244 = $243 | 1;
    HEAP32[$241>>2] = $244;
    
   } else {
    $245 = $5 | 3;
    $gep_int488 = $v$0$i;
    $gep489 = (($gep_int488) + 4)|0;
    $246 = $gep489;
    HEAP32[$246>>2] = $245;
    $247 = $rsize$0$i | 1;
    $$sum$i37 = $5 | 4;
    $gep_int490 = $v$0$i;
    $gep491 = (($gep_int490) + ($$sum$i37))|0;
    $248 = $gep491;
    $249 = $248;
    HEAP32[$248>>2] = $247;
    $$sum1$i = (($rsize$0$i) + ($5))|0;
    $gep_int492 = $v$0$i;
    $gep493 = (($gep_int492) + ($$sum1$i))|0;
    $250 = $gep493;
    $251 = $250;
    HEAP32[$250>>2] = $rsize$0$i;
    $expanded52 = 2880;
    $gep_int494 = 2880;
    $gep495 = (($gep_int494) + 8)|0;
    $expanded51 = $gep495;
    $252 = HEAP32[$expanded51>>2]|0;
    $253 = ($252|0)==(0);
    
    if (!($253)) {
     $expanded54 = 2880;
     $gep_int496 = 2880;
     $gep497 = (($gep_int496) + 20)|0;
     $expanded53 = $gep497;
     $254 = HEAP32[$expanded53>>2]|0;
     $255 = $252 >>> 3;
     $256 = $255 << 1;
     $expanded55 = 2880;
     $gep_int498 = 2880;
     $gep499 = (($gep_int498) + 40)|0;
     $gep_array500 = $256<<2;
     $gep501 = (($gep499) + ($gep_array500))|0;
     $257 = $gep501;
     $258 = $257;
     $expanded57 = 2880;
     $gep_int502 = 2880;
     $expanded56 = $gep_int502;
     $259 = HEAP32[$expanded56>>2]|0;
     $260 = 1 << $255;
     $261 = $259 & $260;
     $262 = ($261|0)==(0);
     
     do {
      if ($262) {
       $263 = $259 | $260;
       $expanded59 = 2880;
       $gep_int503 = 2880;
       $expanded58 = $gep_int503;
       HEAP32[$expanded58>>2] = $263;
       $$sum2$pre$i = (($256) + 2)|0;
       $expanded60 = 2880;
       $gep_int504 = 2880;
       $gep505 = (($gep_int504) + 40)|0;
       $gep_array506 = $$sum2$pre$i<<2;
       $gep507 = (($gep505) + ($gep_array506))|0;
       $$pre$i = $gep507;
       
       $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $258;
      } else {
       $$sum3$i = (($256) + 2)|0;
       $expanded61 = 2880;
       $gep_int508 = 2880;
       $gep509 = (($gep_int508) + 40)|0;
       $gep_array510 = $$sum3$i<<2;
       $gep511 = (($gep509) + ($gep_array510))|0;
       $264 = $gep511;
       $265 = HEAP32[$264>>2]|0;
       $266 = $265;
       $expanded63 = 2880;
       $gep_int512 = 2880;
       $gep513 = (($gep_int512) + 16)|0;
       $expanded62 = $gep513;
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
     $gep_int514 = $F1$0$i;
     $gep515 = (($gep_int514) + 12)|0;
     $269 = $gep515;
     HEAP32[$269>>2] = $254;
     $gep_int516 = $254;
     $gep517 = (($gep_int516) + 8)|0;
     $270 = $gep517;
     HEAP32[$270>>2] = $F1$0$i;
     $gep_int518 = $254;
     $gep519 = (($gep_int518) + 12)|0;
     $271 = $gep519;
     HEAP32[$271>>2] = $258;
     
    }
    $expanded65 = 2880;
    $gep_int520 = 2880;
    $gep521 = (($gep_int520) + 8)|0;
    $expanded64 = $gep521;
    HEAP32[$expanded64>>2] = $rsize$0$i;
    $expanded67 = 2880;
    $gep_int522 = 2880;
    $gep523 = (($gep_int522) + 20)|0;
    $expanded66 = $gep523;
    HEAP32[$expanded66>>2] = $168;
    
   }
   $gep_int524 = $v$0$i;
   $gep525 = (($gep_int524) + 8)|0;
   $272 = $gep525;
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
   $expanded69 = 2880;
   $gep_int526 = 2880;
   $gep527 = (($gep_int526) + 4)|0;
   $expanded68 = $gep527;
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
   
   $expanded70 = 2880;
   $gep_int528 = 2880;
   $gep529 = (($gep_int528) + 304)|0;
   $gep_array530 = $idx$0$i<<2;
   $gep531 = (($gep529) + ($gep_array530))|0;
   $305 = $gep531;
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
      
      
      
      
      
      $gep_int532 = $t$0$i16;
      $gep533 = (($gep_int532) + 4)|0;
      $313 = $gep533;
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
      
      
      $gep_int534 = $t$0$i16;
      $gep535 = (($gep_int534) + 20)|0;
      $319 = $gep535;
      $320 = HEAP32[$319>>2]|0;
      $321 = $sizebits$0$i >>> 31;
      $gep_int536 = $t$0$i16;
      $gep537 = (($gep_int536) + 16)|0;
      $gep_array538 = $321<<2;
      $gep539 = (($gep537) + ($gep_array538))|0;
      $322 = $gep539;
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
    $expanded71 = 2880;
    $gep_int540 = 2880;
    $gep541 = (($gep_int540) + 304)|0;
    $gep_array542 = $357<<2;
    $gep543 = (($gep541) + ($gep_array542))|0;
    $358 = $gep543;
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
     
     
     
     $gep_int544 = $t$230$i;
     $gep545 = (($gep_int544) + 4)|0;
     $361 = $gep545;
     $362 = HEAP32[$361>>2]|0;
     $363 = $362 & -8;
     $364 = (($363) - ($276))|0;
     $365 = ($364>>>0)<($rsize$331$i>>>0);
     $$rsize$3$i = $365 ? $364 : $rsize$331$i;
     $t$2$v$3$i = $365 ? $t$230$i : $v$332$i;
     $gep_int546 = $t$230$i;
     $gep547 = (($gep_int546) + 16)|0;
     $366 = $gep547;
     $367 = HEAP32[$366>>2]|0;
     $368 = ($367|0)==(0);
     
     if (!($368)) {
      $v$332$i$phi = $t$2$v$3$i;$t$230$i$phi = $367;$rsize$331$i$phi = $$rsize$3$i;$v$332$i = $v$332$i$phi;$t$230$i = $t$230$i$phi;$rsize$331$i = $rsize$331$i$phi;
      continue;
     }
     $gep_int548 = $t$230$i;
     $gep549 = (($gep_int548) + 20)|0;
     $369 = $gep549;
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
   $expanded73 = 2880;
   $gep_int550 = 2880;
   $gep551 = (($gep_int550) + 8)|0;
   $expanded72 = $gep551;
   $373 = HEAP32[$expanded72>>2]|0;
   $374 = (($373) - ($276))|0;
   $375 = ($rsize$3$lcssa$i>>>0)<($374>>>0);
   
   if (!($375)) {
    $nb$0 = $276;
    break;
   }
   $376 = $v$3$lcssa$i;
   $expanded75 = 2880;
   $gep_int552 = 2880;
   $gep553 = (($gep_int552) + 16)|0;
   $expanded74 = $gep553;
   $377 = HEAP32[$expanded74>>2]|0;
   $378 = ($376>>>0)<($377>>>0);
   
   if ($378) {
    _abort();
    // unreachable
   }
   $gep_int554 = $v$3$lcssa$i;
   $gep555 = (($gep_int554) + ($276))|0;
   $379 = $gep555;
   $380 = $379;
   $381 = ($376>>>0)<($379>>>0);
   
   if (!($381)) {
    _abort();
    // unreachable
   }
   $gep_int556 = $v$3$lcssa$i;
   $gep557 = (($gep_int556) + 24)|0;
   $382 = $gep557;
   $383 = HEAP32[$382>>2]|0;
   $gep_int558 = $v$3$lcssa$i;
   $gep559 = (($gep_int558) + 12)|0;
   $384 = $gep559;
   $385 = HEAP32[$384>>2]|0;
   $386 = ($385|0)==($v$3$lcssa$i|0);
   
   do {
    if ($386) {
     $gep_int566 = $v$3$lcssa$i;
     $gep567 = (($gep_int566) + 20)|0;
     $397 = $gep567;
     $398 = HEAP32[$397>>2]|0;
     $399 = ($398|0)==(0);
     
     if ($399) {
      $gep_int568 = $v$3$lcssa$i;
      $gep569 = (($gep_int568) + 16)|0;
      $400 = $gep569;
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
      
      
      $gep_int570 = $R$0$i20;
      $gep571 = (($gep_int570) + 20)|0;
      $403 = $gep571;
      $404 = HEAP32[$403>>2]|0;
      $405 = ($404|0)==(0);
      
      if (!($405)) {
       $RP$0$i19$phi = $403;$R$0$i20$phi = $404;$RP$0$i19 = $RP$0$i19$phi;$R$0$i20 = $R$0$i20$phi;
       continue;
      }
      $gep_int572 = $R$0$i20;
      $gep573 = (($gep_int572) + 16)|0;
      $406 = $gep573;
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
     $gep_int560 = $v$3$lcssa$i;
     $gep561 = (($gep_int560) + 8)|0;
     $387 = $gep561;
     $388 = HEAP32[$387>>2]|0;
     $389 = $388;
     $390 = ($389>>>0)<($377>>>0);
     
     if ($390) {
      _abort();
      // unreachable
     }
     $gep_int562 = $388;
     $gep563 = (($gep_int562) + 12)|0;
     $391 = $gep563;
     $392 = HEAP32[$391>>2]|0;
     $393 = ($392|0)==($v$3$lcssa$i|0);
     
     if (!($393)) {
      _abort();
      // unreachable
     }
     $gep_int564 = $385;
     $gep565 = (($gep_int564) + 8)|0;
     $394 = $gep565;
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
     $gep_int574 = $v$3$lcssa$i;
     $gep575 = (($gep_int574) + 28)|0;
     $412 = $gep575;
     $413 = HEAP32[$412>>2]|0;
     $expanded76 = 2880;
     $gep_int576 = 2880;
     $gep577 = (($gep_int576) + 304)|0;
     $gep_array578 = $413<<2;
     $gep579 = (($gep577) + ($gep_array578))|0;
     $414 = $gep579;
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
       $expanded78 = 2880;
       $gep_int580 = 2880;
       $gep581 = (($gep_int580) + 4)|0;
       $expanded77 = $gep581;
       $419 = HEAP32[$expanded77>>2]|0;
       $420 = $419 & $418;
       $expanded80 = 2880;
       $gep_int582 = 2880;
       $gep583 = (($gep_int582) + 4)|0;
       $expanded79 = $gep583;
       HEAP32[$expanded79>>2] = $420;
       
       break L176;
      } else {
       $421 = $383;
       $expanded82 = 2880;
       $gep_int584 = 2880;
       $gep585 = (($gep_int584) + 16)|0;
       $expanded81 = $gep585;
       $422 = HEAP32[$expanded81>>2]|0;
       $423 = ($421>>>0)<($422>>>0);
       
       if ($423) {
        _abort();
        // unreachable
       }
       $gep_int586 = $383;
       $gep587 = (($gep_int586) + 16)|0;
       $424 = $gep587;
       $425 = HEAP32[$424>>2]|0;
       $426 = ($425|0)==($v$3$lcssa$i|0);
       
       if ($426) {
        HEAP32[$424>>2] = $R$1$i22;
        
       } else {
        $gep_int588 = $383;
        $gep589 = (($gep_int588) + 20)|0;
        $427 = $gep589;
        HEAP32[$427>>2] = $R$1$i22;
        
       }
       $428 = ($R$1$i22|0)==(0);
       
       if ($428) {
        break L176;
       }
      }
     } while(0);
     $429 = $R$1$i22;
     $expanded84 = 2880;
     $gep_int590 = 2880;
     $gep591 = (($gep_int590) + 16)|0;
     $expanded83 = $gep591;
     $430 = HEAP32[$expanded83>>2]|0;
     $431 = ($429>>>0)<($430>>>0);
     
     if ($431) {
      _abort();
      // unreachable
     }
     $gep_int592 = $R$1$i22;
     $gep593 = (($gep_int592) + 24)|0;
     $432 = $gep593;
     HEAP32[$432>>2] = $383;
     $gep_int594 = $v$3$lcssa$i;
     $gep595 = (($gep_int594) + 16)|0;
     $433 = $gep595;
     $434 = HEAP32[$433>>2]|0;
     $435 = ($434|0)==(0);
     
     do {
      if (!($435)) {
       $436 = $434;
       $expanded86 = 2880;
       $gep_int596 = 2880;
       $gep597 = (($gep_int596) + 16)|0;
       $expanded85 = $gep597;
       $437 = HEAP32[$expanded85>>2]|0;
       $438 = ($436>>>0)<($437>>>0);
       
       if ($438) {
        _abort();
        // unreachable
       } else {
        $gep_int598 = $R$1$i22;
        $gep599 = (($gep_int598) + 16)|0;
        $439 = $gep599;
        HEAP32[$439>>2] = $434;
        $gep_int600 = $434;
        $gep601 = (($gep_int600) + 24)|0;
        $440 = $gep601;
        HEAP32[$440>>2] = $R$1$i22;
        
        break;
       }
      }
     } while(0);
     $gep_int602 = $v$3$lcssa$i;
     $gep603 = (($gep_int602) + 20)|0;
     $441 = $gep603;
     $442 = HEAP32[$441>>2]|0;
     $443 = ($442|0)==(0);
     
     if ($443) {
      break;
     }
     $444 = $442;
     $expanded88 = 2880;
     $gep_int604 = 2880;
     $gep605 = (($gep_int604) + 16)|0;
     $expanded87 = $gep605;
     $445 = HEAP32[$expanded87>>2]|0;
     $446 = ($444>>>0)<($445>>>0);
     
     if ($446) {
      _abort();
      // unreachable
     } else {
      $gep_int606 = $R$1$i22;
      $gep607 = (($gep_int606) + 20)|0;
      $447 = $gep607;
      HEAP32[$447>>2] = $442;
      $gep_int608 = $442;
      $gep609 = (($gep_int608) + 24)|0;
      $448 = $gep609;
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
     $gep_int610 = $v$3$lcssa$i;
     $gep611 = (($gep_int610) + 4)|0;
     $452 = $gep611;
     HEAP32[$452>>2] = $451;
     $$sum19$i = (($450) + 4)|0;
     $gep_int612 = $v$3$lcssa$i;
     $gep613 = (($gep_int612) + ($$sum19$i))|0;
     $453 = $gep613;
     $454 = $453;
     $455 = HEAP32[$453>>2]|0;
     $456 = $455 | 1;
     HEAP32[$453>>2] = $456;
     
    } else {
     $457 = $276 | 3;
     $gep_int614 = $v$3$lcssa$i;
     $gep615 = (($gep_int614) + 4)|0;
     $458 = $gep615;
     HEAP32[$458>>2] = $457;
     $459 = $rsize$3$lcssa$i | 1;
     $$sum$i2536 = $276 | 4;
     $gep_int616 = $v$3$lcssa$i;
     $gep617 = (($gep_int616) + ($$sum$i2536))|0;
     $460 = $gep617;
     $461 = $460;
     HEAP32[$460>>2] = $459;
     $$sum1$i26 = (($rsize$3$lcssa$i) + ($276))|0;
     $gep_int618 = $v$3$lcssa$i;
     $gep619 = (($gep_int618) + ($$sum1$i26))|0;
     $462 = $gep619;
     $463 = $462;
     HEAP32[$462>>2] = $rsize$3$lcssa$i;
     $464 = $rsize$3$lcssa$i >>> 3;
     $465 = ($rsize$3$lcssa$i>>>0)<(256);
     
     if ($465) {
      $466 = $464 << 1;
      $expanded89 = 2880;
      $gep_int620 = 2880;
      $gep621 = (($gep_int620) + 40)|0;
      $gep_array622 = $466<<2;
      $gep623 = (($gep621) + ($gep_array622))|0;
      $467 = $gep623;
      $468 = $467;
      $expanded91 = 2880;
      $gep_int624 = 2880;
      $expanded90 = $gep_int624;
      $469 = HEAP32[$expanded90>>2]|0;
      $470 = 1 << $464;
      $471 = $469 & $470;
      $472 = ($471|0)==(0);
      
      do {
       if ($472) {
        $473 = $469 | $470;
        $expanded93 = 2880;
        $gep_int625 = 2880;
        $expanded92 = $gep_int625;
        HEAP32[$expanded92>>2] = $473;
        $$sum15$pre$i = (($466) + 2)|0;
        $expanded94 = 2880;
        $gep_int626 = 2880;
        $gep627 = (($gep_int626) + 40)|0;
        $gep_array628 = $$sum15$pre$i<<2;
        $gep629 = (($gep627) + ($gep_array628))|0;
        $$pre$i27 = $gep629;
        
        $$pre$phi$i28Z2D = $$pre$i27;$F5$0$i = $468;
       } else {
        $$sum18$i = (($466) + 2)|0;
        $expanded95 = 2880;
        $gep_int630 = 2880;
        $gep631 = (($gep_int630) + 40)|0;
        $gep_array632 = $$sum18$i<<2;
        $gep633 = (($gep631) + ($gep_array632))|0;
        $474 = $gep633;
        $475 = HEAP32[$474>>2]|0;
        $476 = $475;
        $expanded97 = 2880;
        $gep_int634 = 2880;
        $gep635 = (($gep_int634) + 16)|0;
        $expanded96 = $gep635;
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
      $gep_int636 = $F5$0$i;
      $gep637 = (($gep_int636) + 12)|0;
      $479 = $gep637;
      HEAP32[$479>>2] = $380;
      $$sum16$i = (($276) + 8)|0;
      $gep_int638 = $v$3$lcssa$i;
      $gep639 = (($gep_int638) + ($$sum16$i))|0;
      $480 = $gep639;
      $481 = $480;
      HEAP32[$480>>2] = $F5$0$i;
      $$sum17$i = (($276) + 12)|0;
      $gep_int640 = $v$3$lcssa$i;
      $gep641 = (($gep_int640) + ($$sum17$i))|0;
      $482 = $gep641;
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
     
     $expanded98 = 2880;
     $gep_int642 = 2880;
     $gep643 = (($gep_int642) + 304)|0;
     $gep_array644 = $I7$0$i<<2;
     $gep645 = (($gep643) + ($gep_array644))|0;
     $510 = $gep645;
     $$sum2$i = (($276) + 28)|0;
     $gep_int646 = $v$3$lcssa$i;
     $gep647 = (($gep_int646) + ($$sum2$i))|0;
     $511 = $gep647;
     $512 = $511;
     HEAP32[$511>>2] = $I7$0$i;
     $$sum3$i29 = (($276) + 16)|0;
     $gep_int648 = $v$3$lcssa$i;
     $gep649 = (($gep_int648) + ($$sum3$i29))|0;
     $513 = $gep649;
     $$sum4$i30 = (($276) + 20)|0;
     $gep_int650 = $v$3$lcssa$i;
     $gep651 = (($gep_int650) + ($$sum4$i30))|0;
     $514 = $gep651;
     $515 = $514;
     HEAP32[$514>>2] = 0;
     $516 = $513;
     HEAP32[$513>>2] = 0;
     $expanded100 = 2880;
     $gep_int652 = 2880;
     $gep653 = (($gep_int652) + 4)|0;
     $expanded99 = $gep653;
     $517 = HEAP32[$expanded99>>2]|0;
     $518 = 1 << $I7$0$i;
     $519 = $517 & $518;
     $520 = ($519|0)==(0);
     
     if ($520) {
      $521 = $517 | $518;
      $expanded102 = 2880;
      $gep_int654 = 2880;
      $gep655 = (($gep_int654) + 4)|0;
      $expanded101 = $gep655;
      HEAP32[$expanded101>>2] = $521;
      HEAP32[$510>>2] = $484;
      $522 = $510;
      $$sum5$i = (($276) + 24)|0;
      $gep_int656 = $v$3$lcssa$i;
      $gep657 = (($gep_int656) + ($$sum5$i))|0;
      $523 = $gep657;
      $524 = $523;
      HEAP32[$523>>2] = $522;
      $$sum6$i = (($276) + 12)|0;
      $gep_int658 = $v$3$lcssa$i;
      $gep659 = (($gep_int658) + ($$sum6$i))|0;
      $525 = $gep659;
      $526 = $525;
      HEAP32[$525>>2] = $484;
      $$sum7$i = (($276) + 8)|0;
      $gep_int660 = $v$3$lcssa$i;
      $gep661 = (($gep_int660) + ($$sum7$i))|0;
      $527 = $gep661;
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
     
     $gep_int662 = $529;
     $gep663 = (($gep_int662) + 4)|0;
     $534 = $gep663;
     $535 = HEAP32[$534>>2]|0;
     $536 = $535 & -8;
     $537 = ($536|0)==($rsize$3$lcssa$i|0);
     
     L225: do {
      if ($537) {
       $T$0$lcssa$i = $529;
      } else {
       $538 = $rsize$3$lcssa$i << $533;
       
       $K12$027$i = $538;$T$026$i = $529;
       while(1) {
        
        
        $544 = $K12$027$i >>> 31;
        $gep_int666 = $T$026$i;
        $gep667 = (($gep_int666) + 16)|0;
        $gep_array668 = $544<<2;
        $gep669 = (($gep667) + ($gep_array668))|0;
        $545 = $gep669;
        $546 = HEAP32[$545>>2]|0;
        $547 = ($546|0)==(0);
        
        if ($547) {
         break;
        }
        $539 = $K12$027$i << 1;
        $gep_int664 = $546;
        $gep665 = (($gep_int664) + 4)|0;
        $540 = $gep665;
        $541 = HEAP32[$540>>2]|0;
        $542 = $541 & -8;
        $543 = ($542|0)==($rsize$3$lcssa$i|0);
        
        if ($543) {
         $T$0$lcssa$i = $546;
         break L225;
        } else {
         $T$026$i$phi = $546;$K12$027$i = $539;$T$026$i = $T$026$i$phi;
        }
       }
       $548 = $545;
       $expanded104 = 2880;
       $gep_int670 = 2880;
       $gep671 = (($gep_int670) + 16)|0;
       $expanded103 = $gep671;
       $549 = HEAP32[$expanded103>>2]|0;
       $550 = ($548>>>0)<($549>>>0);
       
       if ($550) {
        _abort();
        // unreachable
       } else {
        HEAP32[$545>>2] = $484;
        $$sum12$i = (($276) + 24)|0;
        $gep_int672 = $v$3$lcssa$i;
        $gep673 = (($gep_int672) + ($$sum12$i))|0;
        $551 = $gep673;
        $552 = $551;
        HEAP32[$551>>2] = $T$026$i;
        $$sum13$i = (($276) + 12)|0;
        $gep_int674 = $v$3$lcssa$i;
        $gep675 = (($gep_int674) + ($$sum13$i))|0;
        $553 = $gep675;
        $554 = $553;
        HEAP32[$553>>2] = $484;
        $$sum14$i = (($276) + 8)|0;
        $gep_int676 = $v$3$lcssa$i;
        $gep677 = (($gep_int676) + ($$sum14$i))|0;
        $555 = $gep677;
        $556 = $555;
        HEAP32[$555>>2] = $484;
        
        break L204;
       }
      }
     } while(0);
     
     $gep_int678 = $T$0$lcssa$i;
     $gep679 = (($gep_int678) + 8)|0;
     $557 = $gep679;
     $558 = HEAP32[$557>>2]|0;
     $559 = $T$0$lcssa$i;
     $expanded106 = 2880;
     $gep_int680 = 2880;
     $gep681 = (($gep_int680) + 16)|0;
     $expanded105 = $gep681;
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
      $gep_int682 = $558;
      $gep683 = (($gep_int682) + 12)|0;
      $564 = $gep683;
      HEAP32[$564>>2] = $484;
      HEAP32[$557>>2] = $484;
      $$sum9$i = (($276) + 8)|0;
      $gep_int684 = $v$3$lcssa$i;
      $gep685 = (($gep_int684) + ($$sum9$i))|0;
      $565 = $gep685;
      $566 = $565;
      HEAP32[$565>>2] = $558;
      $$sum10$i = (($276) + 12)|0;
      $gep_int686 = $v$3$lcssa$i;
      $gep687 = (($gep_int686) + ($$sum10$i))|0;
      $567 = $gep687;
      $568 = $567;
      HEAP32[$567>>2] = $T$0$lcssa$i;
      $$sum11$i = (($276) + 24)|0;
      $gep_int688 = $v$3$lcssa$i;
      $gep689 = (($gep_int688) + ($$sum11$i))|0;
      $569 = $gep689;
      $570 = $569;
      HEAP32[$569>>2] = 0;
      
      break;
     }
    }
   } while(0);
   $gep_int690 = $v$3$lcssa$i;
   $gep691 = (($gep_int690) + 8)|0;
   $571 = $gep691;
   $572 = $571;
   
   $mem$0 = $572;
   
   STACKTOP = sp;return $mem$0|0;
  }
 } while(0);
 
 $expanded108 = 2880;
 $gep_int692 = 2880;
 $gep693 = (($gep_int692) + 8)|0;
 $expanded107 = $gep693;
 $573 = HEAP32[$expanded107>>2]|0;
 $574 = ($nb$0>>>0)>($573>>>0);
 
 if (!($574)) {
  $575 = (($573) - ($nb$0))|0;
  $expanded110 = 2880;
  $gep_int694 = 2880;
  $gep695 = (($gep_int694) + 20)|0;
  $expanded109 = $gep695;
  $576 = HEAP32[$expanded109>>2]|0;
  $577 = ($575>>>0)>(15);
  
  if ($577) {
   $578 = $576;
   $gep_int696 = $576;
   $gep697 = (($gep_int696) + ($nb$0))|0;
   $579 = $gep697;
   $580 = $579;
   $expanded112 = 2880;
   $gep_int698 = 2880;
   $gep699 = (($gep_int698) + 20)|0;
   $expanded111 = $gep699;
   HEAP32[$expanded111>>2] = $580;
   $expanded114 = 2880;
   $gep_int700 = 2880;
   $gep701 = (($gep_int700) + 8)|0;
   $expanded113 = $gep701;
   HEAP32[$expanded113>>2] = $575;
   $581 = $575 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $gep_int702 = $576;
   $gep703 = (($gep_int702) + ($$sum2))|0;
   $582 = $gep703;
   $583 = $582;
   HEAP32[$582>>2] = $581;
   $gep_int704 = $576;
   $gep705 = (($gep_int704) + ($573))|0;
   $584 = $gep705;
   $585 = $584;
   HEAP32[$584>>2] = $575;
   $586 = $nb$0 | 3;
   $gep_int706 = $576;
   $gep707 = (($gep_int706) + 4)|0;
   $587 = $gep707;
   HEAP32[$587>>2] = $586;
   
  } else {
   $expanded116 = 2880;
   $gep_int708 = 2880;
   $gep709 = (($gep_int708) + 8)|0;
   $expanded115 = $gep709;
   HEAP32[$expanded115>>2] = 0;
   $expanded118 = 2880;
   $gep_int710 = 2880;
   $gep711 = (($gep_int710) + 20)|0;
   $expanded117 = $gep711;
   HEAP32[$expanded117>>2] = 0;
   $588 = $573 | 3;
   $gep_int712 = $576;
   $gep713 = (($gep_int712) + 4)|0;
   $589 = $gep713;
   HEAP32[$589>>2] = $588;
   $590 = $576;
   $$sum1 = (($573) + 4)|0;
   $gep_int714 = $576;
   $gep715 = (($gep_int714) + ($$sum1))|0;
   $591 = $gep715;
   $592 = $591;
   $593 = HEAP32[$591>>2]|0;
   $594 = $593 | 1;
   HEAP32[$591>>2] = $594;
   
  }
  $gep_int716 = $576;
  $gep717 = (($gep_int716) + 8)|0;
  $595 = $gep717;
  $596 = $595;
  
  $mem$0 = $596;
  
  STACKTOP = sp;return $mem$0|0;
 }
 $expanded120 = 2880;
 $gep_int718 = 2880;
 $gep719 = (($gep_int718) + 12)|0;
 $expanded119 = $gep719;
 $597 = HEAP32[$expanded119>>2]|0;
 $598 = ($nb$0>>>0)<($597>>>0);
 
 if ($598) {
  $599 = (($597) - ($nb$0))|0;
  $expanded122 = 2880;
  $gep_int720 = 2880;
  $gep721 = (($gep_int720) + 12)|0;
  $expanded121 = $gep721;
  HEAP32[$expanded121>>2] = $599;
  $expanded124 = 2880;
  $gep_int722 = 2880;
  $gep723 = (($gep_int722) + 24)|0;
  $expanded123 = $gep723;
  $600 = HEAP32[$expanded123>>2]|0;
  $601 = $600;
  $gep_int724 = $600;
  $gep725 = (($gep_int724) + ($nb$0))|0;
  $602 = $gep725;
  $603 = $602;
  $expanded126 = 2880;
  $gep_int726 = 2880;
  $gep727 = (($gep_int726) + 24)|0;
  $expanded125 = $gep727;
  HEAP32[$expanded125>>2] = $603;
  $604 = $599 | 1;
  $$sum = (($nb$0) + 4)|0;
  $gep_int728 = $600;
  $gep729 = (($gep_int728) + ($$sum))|0;
  $605 = $gep729;
  $606 = $605;
  HEAP32[$605>>2] = $604;
  $607 = $nb$0 | 3;
  $gep_int730 = $600;
  $gep731 = (($gep_int730) + 4)|0;
  $608 = $gep731;
  HEAP32[$608>>2] = $607;
  $gep_int732 = $600;
  $gep733 = (($gep_int732) + 8)|0;
  $609 = $gep733;
  $610 = $609;
  
  $mem$0 = $610;
  
  STACKTOP = sp;return $mem$0|0;
 }
 $expanded128 = 3352;
 $gep_int734 = 3352;
 $expanded127 = $gep_int734;
 $611 = HEAP32[$expanded127>>2]|0;
 $612 = ($611|0)==(0);
 
 do {
  if ($612) {
   $613 = _sysconf(30)|0;
   $614 = (($613) + -1)|0;
   $615 = $614 & $613;
   $616 = ($615|0)==(0);
   
   if ($616) {
    $expanded130 = 3352;
    $gep_int735 = 3352;
    $gep736 = (($gep_int735) + 8)|0;
    $expanded129 = $gep736;
    HEAP32[$expanded129>>2] = $613;
    $expanded132 = 3352;
    $gep_int737 = 3352;
    $gep738 = (($gep_int737) + 4)|0;
    $expanded131 = $gep738;
    HEAP32[$expanded131>>2] = $613;
    $expanded134 = 3352;
    $gep_int739 = 3352;
    $gep740 = (($gep_int739) + 12)|0;
    $expanded133 = $gep740;
    HEAP32[$expanded133>>2] = -1;
    $expanded136 = 3352;
    $gep_int741 = 3352;
    $gep742 = (($gep_int741) + 16)|0;
    $expanded135 = $gep742;
    HEAP32[$expanded135>>2] = -1;
    $expanded138 = 3352;
    $gep_int743 = 3352;
    $gep744 = (($gep_int743) + 20)|0;
    $expanded137 = $gep744;
    HEAP32[$expanded137>>2] = 0;
    $expanded140 = 2880;
    $gep_int745 = 2880;
    $gep746 = (($gep_int745) + 444)|0;
    $expanded139 = $gep746;
    HEAP32[$expanded139>>2] = 0;
    $617 = _time(0)|0;
    $618 = $617 & -16;
    $619 = $618 ^ 1431655768;
    $expanded142 = 3352;
    $gep_int747 = 3352;
    $expanded141 = $gep_int747;
    HEAP32[$expanded141>>2] = $619;
    
    break;
   } else {
    _abort();
    // unreachable
   }
  }
 } while(0);
 $620 = (($nb$0) + 48)|0;
 $expanded144 = 3352;
 $gep_int748 = 3352;
 $gep749 = (($gep_int748) + 8)|0;
 $expanded143 = $gep749;
 $621 = HEAP32[$expanded143>>2]|0;
 $622 = (($nb$0) + 47)|0;
 $623 = (($621) + ($622))|0;
 $624 = (0 - ($621))|0;
 $625 = $623 & $624;
 $626 = ($625>>>0)>($nb$0>>>0);
 
 if (!($626)) {
  $mem$0 = 0;
  
  STACKTOP = sp;return $mem$0|0;
 }
 $expanded146 = 2880;
 $gep_int750 = 2880;
 $gep751 = (($gep_int750) + 440)|0;
 $expanded145 = $gep751;
 $627 = HEAP32[$expanded145>>2]|0;
 $628 = ($627|0)==(0);
 
 do {
  if (!($628)) {
   $expanded148 = 2880;
   $gep_int752 = 2880;
   $gep753 = (($gep_int752) + 432)|0;
   $expanded147 = $gep753;
   $629 = HEAP32[$expanded147>>2]|0;
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
 $expanded150 = 2880;
 $gep_int754 = 2880;
 $gep755 = (($gep_int754) + 444)|0;
 $expanded149 = $gep755;
 $633 = HEAP32[$expanded149>>2]|0;
 $634 = $633 & 4;
 $635 = ($634|0)==(0);
 
 L269: do {
  if ($635) {
   $expanded152 = 2880;
   $gep_int756 = 2880;
   $gep757 = (($gep_int756) + 24)|0;
   $expanded151 = $gep757;
   $636 = HEAP32[$expanded151>>2]|0;
   $637 = ($636|0)==(0);
   
   L271: do {
    if ($637) {
     label = 182;
    } else {
     $638 = $636;
     $expanded154 = 2880;
     $gep_int758 = 2880;
     $gep759 = (($gep_int758) + 448)|0;
     $expanded153 = $gep759;
     
     $sp$0$i$i = $expanded153;
     while(1) {
      
      $gep_int760 = $sp$0$i$i;
      $639 = $gep_int760;
      $640 = HEAP32[$639>>2]|0;
      $641 = ($640>>>0)>($638>>>0);
      
      if (!($641)) {
       $gep_int761 = $sp$0$i$i;
       $gep762 = (($gep_int761) + 4)|0;
       $642 = $gep762;
       $643 = HEAP32[$642>>2]|0;
       $gep_int763 = $640;
       $gep764 = (($gep_int763) + ($643))|0;
       $644 = $gep764;
       $645 = ($644>>>0)>($638>>>0);
       
       if ($645) {
        break;
       }
      }
      $gep_int765 = $sp$0$i$i;
      $gep766 = (($gep_int765) + 8)|0;
      $646 = $gep766;
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
     $expanded164 = 2880;
     $gep_int773 = 2880;
     $gep774 = (($gep_int773) + 12)|0;
     $expanded163 = $gep774;
     $672 = HEAP32[$expanded163>>2]|0;
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
     $gep_int775 = $677;
     $gep776 = (($gep_int775) + ($678))|0;
     $679 = $gep776;
     $680 = ($676|0)==($679|0);
     $$3$i = $680 ? $674 : 0;
     $expanded165 = -1;
     $$4$i = $680 ? $676 : $expanded165;
     
     $br$0$i = $676;$ssize$1$i = $674;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
     label = 191;
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $650 = _sbrk(0)|0;
     $expanded155 = -1;
     $651 = ($650|0)==($expanded155|0);
     
     if ($651) {
      $tsize$0323841$i = 0;
      break;
     }
     $652 = $650;
     $expanded157 = 3352;
     $gep_int767 = 3352;
     $gep768 = (($gep_int767) + 4)|0;
     $expanded156 = $gep768;
     $653 = HEAP32[$expanded156>>2]|0;
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
     
     $expanded159 = 2880;
     $gep_int769 = 2880;
     $gep770 = (($gep_int769) + 432)|0;
     $expanded158 = $gep770;
     $662 = HEAP32[$expanded158>>2]|0;
     $663 = (($662) + ($ssize$0$i))|0;
     $664 = ($ssize$0$i>>>0)>($nb$0>>>0);
     $665 = ($ssize$0$i>>>0)<(2147483647);
     $or$cond$i31 = $664 & $665;
     
     if (!($or$cond$i31)) {
      $tsize$0323841$i = 0;
      break;
     }
     $expanded161 = 2880;
     $gep_int771 = 2880;
     $gep772 = (($gep_int771) + 440)|0;
     $expanded160 = $gep772;
     $666 = HEAP32[$expanded160>>2]|0;
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
     $expanded162 = -1;
     $$$i = $671 ? $650 : $expanded162;
     
     $br$0$i = $670;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
     label = 191;
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     
     
     
     
     $681 = (0 - ($ssize$1$i))|0;
     $expanded166 = -1;
     $682 = ($tbase$0$i|0)==($expanded166|0);
     
     if (!($682)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $expanded167 = -1;
     $683 = ($br$0$i|0)!=($expanded167|0);
     $684 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $683 & $684;
     $685 = ($ssize$1$i>>>0)<($620>>>0);
     $or$cond6$i = $or$cond5$i & $685;
     
     do {
      if ($or$cond6$i) {
       $expanded169 = 3352;
       $gep_int777 = 3352;
       $gep778 = (($gep_int777) + 8)|0;
       $expanded168 = $gep778;
       $686 = HEAP32[$expanded168>>2]|0;
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
       $expanded170 = -1;
       $693 = ($692|0)==($expanded170|0);
       
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
     
     $expanded171 = -1;
     $695 = ($br$0$i|0)==($expanded171|0);
     
     if ($695) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   
   $expanded173 = 2880;
   $gep_int779 = 2880;
   $gep780 = (($gep_int779) + 444)|0;
   $expanded172 = $gep780;
   $696 = HEAP32[$expanded172>>2]|0;
   $697 = $696 | 4;
   $expanded175 = 2880;
   $gep_int781 = 2880;
   $gep782 = (($gep_int781) + 444)|0;
   $expanded174 = $gep782;
   HEAP32[$expanded174>>2] = $697;
   
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
   $expanded176 = -1;
   $notlhs$i = ($699|0)!=($expanded176|0);
   $expanded177 = -1;
   $notrhs$i = ($700|0)!=($expanded177|0);
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
   
   
   $expanded179 = 2880;
   $gep_int783 = 2880;
   $gep784 = (($gep_int783) + 432)|0;
   $expanded178 = $gep784;
   $707 = HEAP32[$expanded178>>2]|0;
   $708 = (($707) + ($tsize$246$i))|0;
   $expanded181 = 2880;
   $gep_int785 = 2880;
   $gep786 = (($gep_int785) + 432)|0;
   $expanded180 = $gep786;
   HEAP32[$expanded180>>2] = $708;
   $expanded183 = 2880;
   $gep_int787 = 2880;
   $gep788 = (($gep_int787) + 436)|0;
   $expanded182 = $gep788;
   $709 = HEAP32[$expanded182>>2]|0;
   $710 = ($708>>>0)>($709>>>0);
   
   if ($710) {
    $expanded185 = 2880;
    $gep_int789 = 2880;
    $gep790 = (($gep_int789) + 436)|0;
    $expanded184 = $gep790;
    HEAP32[$expanded184>>2] = $708;
    
   }
   $expanded187 = 2880;
   $gep_int791 = 2880;
   $gep792 = (($gep_int791) + 24)|0;
   $expanded186 = $gep792;
   $711 = HEAP32[$expanded186>>2]|0;
   $712 = ($711|0)==(0);
   $expanded216 = 2880;
   $gep_int793 = 2880;
   $gep794 = (($gep_int793) + 448)|0;
   $expanded215 = $gep794;
   
   L311: do {
    if ($712) {
     $expanded189 = 2880;
     $gep_int795 = 2880;
     $gep796 = (($gep_int795) + 16)|0;
     $expanded188 = $gep796;
     $713 = HEAP32[$expanded188>>2]|0;
     $714 = ($713|0)==(0);
     $715 = ($tbase$247$i>>>0)<($713>>>0);
     $or$cond10$i = $714 | $715;
     
     if ($or$cond10$i) {
      $expanded191 = 2880;
      $gep_int797 = 2880;
      $gep798 = (($gep_int797) + 16)|0;
      $expanded190 = $gep798;
      HEAP32[$expanded190>>2] = $tbase$247$i;
      
     }
     $expanded193 = 2880;
     $gep_int799 = 2880;
     $gep800 = (($gep_int799) + 448)|0;
     $expanded192 = $gep800;
     HEAP32[$expanded192>>2] = $tbase$247$i;
     $expanded195 = 2880;
     $gep_int801 = 2880;
     $gep802 = (($gep_int801) + 452)|0;
     $expanded194 = $gep802;
     HEAP32[$expanded194>>2] = $tsize$246$i;
     $expanded197 = 2880;
     $gep_int803 = 2880;
     $gep804 = (($gep_int803) + 460)|0;
     $expanded196 = $gep804;
     HEAP32[$expanded196>>2] = 0;
     $expanded199 = 3352;
     $gep_int805 = 3352;
     $expanded198 = $gep_int805;
     $716 = HEAP32[$expanded198>>2]|0;
     $expanded201 = 2880;
     $gep_int806 = 2880;
     $gep807 = (($gep_int806) + 36)|0;
     $expanded200 = $gep807;
     HEAP32[$expanded200>>2] = $716;
     $expanded203 = 2880;
     $gep_int808 = 2880;
     $gep809 = (($gep_int808) + 32)|0;
     $expanded202 = $gep809;
     HEAP32[$expanded202>>2] = -1;
     
     $i$02$i$i = 0;
     while(1) {
      
      $717 = $i$02$i$i << 1;
      $expanded204 = 2880;
      $gep_int810 = 2880;
      $gep811 = (($gep_int810) + 40)|0;
      $gep_array812 = $717<<2;
      $gep813 = (($gep811) + ($gep_array812))|0;
      $718 = $gep813;
      $719 = $718;
      $$sum$i$i = (($717) + 3)|0;
      $expanded205 = 2880;
      $gep_int814 = 2880;
      $gep815 = (($gep_int814) + 40)|0;
      $gep_array816 = $$sum$i$i<<2;
      $gep817 = (($gep815) + ($gep_array816))|0;
      $720 = $gep817;
      HEAP32[$720>>2] = $719;
      $$sum1$i$i = (($717) + 2)|0;
      $expanded206 = 2880;
      $gep_int818 = 2880;
      $gep819 = (($gep_int818) + 40)|0;
      $gep_array820 = $$sum1$i$i<<2;
      $gep821 = (($gep819) + ($gep_array820))|0;
      $721 = $gep821;
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
     $gep_int822 = $tbase$247$i;
     $gep823 = (($gep_int822) + 8)|0;
     $725 = $gep823;
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
     
     $gep_int824 = $tbase$247$i;
     $gep825 = (($gep_int824) + ($731))|0;
     $732 = $gep825;
     $733 = $732;
     $734 = (($724) - ($731))|0;
     $expanded208 = 2880;
     $gep_int826 = 2880;
     $gep827 = (($gep_int826) + 24)|0;
     $expanded207 = $gep827;
     HEAP32[$expanded207>>2] = $733;
     $expanded210 = 2880;
     $gep_int828 = 2880;
     $gep829 = (($gep_int828) + 12)|0;
     $expanded209 = $gep829;
     HEAP32[$expanded209>>2] = $734;
     $735 = $734 | 1;
     $$sum$i14$i = (($731) + 4)|0;
     $gep_int830 = $tbase$247$i;
     $gep831 = (($gep_int830) + ($$sum$i14$i))|0;
     $736 = $gep831;
     $737 = $736;
     HEAP32[$736>>2] = $735;
     $$sum2$i$i = (($tsize$246$i) + -36)|0;
     $gep_int832 = $tbase$247$i;
     $gep833 = (($gep_int832) + ($$sum2$i$i))|0;
     $738 = $gep833;
     $739 = $738;
     HEAP32[$738>>2] = 40;
     $expanded212 = 3352;
     $gep_int834 = 3352;
     $gep835 = (($gep_int834) + 16)|0;
     $expanded211 = $gep835;
     $740 = HEAP32[$expanded211>>2]|0;
     $expanded214 = 2880;
     $gep_int836 = 2880;
     $gep837 = (($gep_int836) + 28)|0;
     $expanded213 = $gep837;
     HEAP32[$expanded213>>2] = $740;
     
    } else {
     $sp$075$i = $expanded215;
     while(1) {
      
      $gep_int838 = $sp$075$i;
      $741 = $gep_int838;
      $742 = HEAP32[$741>>2]|0;
      $gep_int839 = $sp$075$i;
      $gep840 = (($gep_int839) + 4)|0;
      $743 = $gep840;
      $744 = HEAP32[$743>>2]|0;
      $gep_int841 = $742;
      $gep842 = (($gep_int841) + ($744))|0;
      $745 = $gep842;
      $746 = ($tbase$247$i|0)==($745|0);
      
      if ($746) {
       label = 214;
       break;
      }
      $gep_int843 = $sp$075$i;
      $gep844 = (($gep_int843) + 8)|0;
      $747 = $gep844;
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
       $gep_int845 = $sp$075$i;
       $gep846 = (($gep_int845) + 12)|0;
       $750 = $gep846;
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
       $expanded218 = 2880;
       $gep_int847 = 2880;
       $gep848 = (($gep_int847) + 12)|0;
       $expanded217 = $gep848;
       $758 = HEAP32[$expanded217>>2]|0;
       $759 = (($758) + ($tsize$246$i))|0;
       $gep_int849 = $711;
       $gep850 = (($gep_int849) + 8)|0;
       $760 = $gep850;
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
       
       $gep_int851 = $711;
       $gep852 = (($gep_int851) + ($766))|0;
       $767 = $gep852;
       $768 = $767;
       $769 = (($759) - ($766))|0;
       $expanded220 = 2880;
       $gep_int853 = 2880;
       $gep854 = (($gep_int853) + 24)|0;
       $expanded219 = $gep854;
       HEAP32[$expanded219>>2] = $768;
       $expanded222 = 2880;
       $gep_int855 = 2880;
       $gep856 = (($gep_int855) + 12)|0;
       $expanded221 = $gep856;
       HEAP32[$expanded221>>2] = $769;
       $770 = $769 | 1;
       $$sum$i18$i = (($766) + 4)|0;
       $gep_int857 = $711;
       $gep858 = (($gep_int857) + ($$sum$i18$i))|0;
       $771 = $gep858;
       $772 = $771;
       HEAP32[$771>>2] = $770;
       $$sum2$i19$i = (($759) + 4)|0;
       $gep_int859 = $711;
       $gep860 = (($gep_int859) + ($$sum2$i19$i))|0;
       $773 = $gep860;
       $774 = $773;
       HEAP32[$773>>2] = 40;
       $expanded224 = 3352;
       $gep_int861 = 3352;
       $gep862 = (($gep_int861) + 16)|0;
       $expanded223 = $gep862;
       $775 = HEAP32[$expanded223>>2]|0;
       $expanded226 = 2880;
       $gep_int863 = 2880;
       $gep864 = (($gep_int863) + 28)|0;
       $expanded225 = $gep864;
       HEAP32[$expanded225>>2] = $775;
       
       break L311;
      }
     } while(0);
     $expanded228 = 2880;
     $gep_int865 = 2880;
     $gep866 = (($gep_int865) + 16)|0;
     $expanded227 = $gep866;
     $776 = HEAP32[$expanded227>>2]|0;
     $777 = ($tbase$247$i>>>0)<($776>>>0);
     
     if ($777) {
      $expanded230 = 2880;
      $gep_int867 = 2880;
      $gep868 = (($gep_int867) + 16)|0;
      $expanded229 = $gep868;
      HEAP32[$expanded229>>2] = $tbase$247$i;
      
     }
     $gep_int869 = $tbase$247$i;
     $gep870 = (($gep_int869) + ($tsize$246$i))|0;
     $778 = $gep870;
     $expanded232 = 2880;
     $gep_int871 = 2880;
     $gep872 = (($gep_int871) + 448)|0;
     $expanded231 = $gep872;
     
     $sp$168$i = $expanded231;
     while(1) {
      
      $gep_int873 = $sp$168$i;
      $779 = $gep_int873;
      $780 = HEAP32[$779>>2]|0;
      $781 = ($780|0)==($778|0);
      
      if ($781) {
       label = 224;
       break;
      }
      $gep_int874 = $sp$168$i;
      $gep875 = (($gep_int874) + 8)|0;
      $782 = $gep875;
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
       $gep_int876 = $sp$168$i;
       $gep877 = (($gep_int876) + 12)|0;
       $785 = $gep877;
       $786 = HEAP32[$785>>2]|0;
       $787 = $786 & 8;
       $788 = ($787|0)==(0);
       
       if (!($788)) {
        break;
       }
       HEAP32[$779>>2] = $tbase$247$i;
       $gep_int878 = $sp$168$i;
       $gep879 = (($gep_int878) + 4)|0;
       $789 = $gep879;
       $790 = HEAP32[$789>>2]|0;
       $791 = (($790) + ($tsize$246$i))|0;
       HEAP32[$789>>2] = $791;
       $gep_int880 = $tbase$247$i;
       $gep881 = (($gep_int880) + 8)|0;
       $792 = $gep881;
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
       
       $gep_int882 = $tbase$247$i;
       $gep883 = (($gep_int882) + ($798))|0;
       $799 = $gep883;
       $$sum107$i = (($tsize$246$i) + 8)|0;
       $gep_int884 = $tbase$247$i;
       $gep885 = (($gep_int884) + ($$sum107$i))|0;
       $800 = $gep885;
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
       $gep_int886 = $tbase$247$i;
       $gep887 = (($gep_int886) + ($$sum108$i))|0;
       $807 = $gep887;
       $808 = $807;
       $809 = $807;
       $810 = $799;
       $811 = (($809) - ($810))|0;
       $$sum$i21$i = (($798) + ($nb$0))|0;
       $gep_int888 = $tbase$247$i;
       $gep889 = (($gep_int888) + ($$sum$i21$i))|0;
       $812 = $gep889;
       $813 = $812;
       $814 = (($811) - ($nb$0))|0;
       $815 = $nb$0 | 3;
       $$sum1$i22$i = (($798) + 4)|0;
       $gep_int890 = $tbase$247$i;
       $gep891 = (($gep_int890) + ($$sum1$i22$i))|0;
       $816 = $gep891;
       $817 = $816;
       HEAP32[$816>>2] = $815;
       $expanded234 = 2880;
       $gep_int892 = 2880;
       $gep893 = (($gep_int892) + 24)|0;
       $expanded233 = $gep893;
       $818 = HEAP32[$expanded233>>2]|0;
       $819 = ($808|0)==($818|0);
       
       L348: do {
        if ($819) {
         $expanded236 = 2880;
         $gep_int894 = 2880;
         $gep895 = (($gep_int894) + 12)|0;
         $expanded235 = $gep895;
         $820 = HEAP32[$expanded235>>2]|0;
         $821 = (($820) + ($814))|0;
         $expanded238 = 2880;
         $gep_int896 = 2880;
         $gep897 = (($gep_int896) + 12)|0;
         $expanded237 = $gep897;
         HEAP32[$expanded237>>2] = $821;
         $expanded240 = 2880;
         $gep_int898 = 2880;
         $gep899 = (($gep_int898) + 24)|0;
         $expanded239 = $gep899;
         HEAP32[$expanded239>>2] = $813;
         $822 = $821 | 1;
         $$sum46$i$i = (($$sum$i21$i) + 4)|0;
         $gep_int900 = $tbase$247$i;
         $gep901 = (($gep_int900) + ($$sum46$i$i))|0;
         $823 = $gep901;
         $824 = $823;
         HEAP32[$823>>2] = $822;
         
        } else {
         $expanded242 = 2880;
         $gep_int902 = 2880;
         $gep903 = (($gep_int902) + 20)|0;
         $expanded241 = $gep903;
         $825 = HEAP32[$expanded241>>2]|0;
         $826 = ($808|0)==($825|0);
         
         if ($826) {
          $expanded244 = 2880;
          $gep_int904 = 2880;
          $gep905 = (($gep_int904) + 8)|0;
          $expanded243 = $gep905;
          $827 = HEAP32[$expanded243>>2]|0;
          $828 = (($827) + ($814))|0;
          $expanded246 = 2880;
          $gep_int906 = 2880;
          $gep907 = (($gep_int906) + 8)|0;
          $expanded245 = $gep907;
          HEAP32[$expanded245>>2] = $828;
          $expanded248 = 2880;
          $gep_int908 = 2880;
          $gep909 = (($gep_int908) + 20)|0;
          $expanded247 = $gep909;
          HEAP32[$expanded247>>2] = $813;
          $829 = $828 | 1;
          $$sum44$i$i = (($$sum$i21$i) + 4)|0;
          $gep_int910 = $tbase$247$i;
          $gep911 = (($gep_int910) + ($$sum44$i$i))|0;
          $830 = $gep911;
          $831 = $830;
          HEAP32[$830>>2] = $829;
          $$sum45$i$i = (($828) + ($$sum$i21$i))|0;
          $gep_int912 = $tbase$247$i;
          $gep913 = (($gep_int912) + ($$sum45$i$i))|0;
          $832 = $gep913;
          $833 = $832;
          HEAP32[$832>>2] = $828;
          
          break;
         }
         $$sum2$i23$i = (($tsize$246$i) + 4)|0;
         $$sum109$i = (($$sum2$i23$i) + ($806))|0;
         $gep_int914 = $tbase$247$i;
         $gep915 = (($gep_int914) + ($$sum109$i))|0;
         $834 = $gep915;
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
            $gep_int916 = $tbase$247$i;
            $gep917 = (($gep_int916) + ($$sum119$i))|0;
            $842 = $gep917;
            $843 = $842;
            $844 = HEAP32[$842>>2]|0;
            $$sum41$i$i = (($tsize$246$i) + 12)|0;
            $$sum120$i = (($$sum41$i$i) + ($806))|0;
            $gep_int918 = $tbase$247$i;
            $gep919 = (($gep_int918) + ($$sum120$i))|0;
            $845 = $gep919;
            $846 = $845;
            $847 = HEAP32[$845>>2]|0;
            $848 = $840 << 1;
            $expanded249 = 2880;
            $gep_int920 = 2880;
            $gep921 = (($gep_int920) + 40)|0;
            $gep_array922 = $848<<2;
            $gep923 = (($gep921) + ($gep_array922))|0;
            $849 = $gep923;
            $850 = $849;
            $851 = ($844|0)==($850|0);
            
            do {
             if (!($851)) {
              $852 = $844;
              $expanded251 = 2880;
              $gep_int924 = 2880;
              $gep925 = (($gep_int924) + 16)|0;
              $expanded250 = $gep925;
              $853 = HEAP32[$expanded250>>2]|0;
              $854 = ($852>>>0)<($853>>>0);
              
              if ($854) {
               _abort();
               // unreachable
              }
              $gep_int926 = $844;
              $gep927 = (($gep_int926) + 12)|0;
              $855 = $gep927;
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
             $expanded253 = 2880;
             $gep_int928 = 2880;
             $expanded252 = $gep_int928;
             $861 = HEAP32[$expanded252>>2]|0;
             $862 = $861 & $860;
             $expanded255 = 2880;
             $gep_int929 = 2880;
             $expanded254 = $gep_int929;
             HEAP32[$expanded254>>2] = $862;
             
             break;
            }
            $863 = ($847|0)==($850|0);
            
            do {
             if ($863) {
              $gep_int930 = $847;
              $gep931 = (($gep_int930) + 8)|0;
              $$pre61$i$i = $gep931;
              
              $$pre$phi62$i$iZ2D = $$pre61$i$i;
             } else {
              $864 = $847;
              $expanded257 = 2880;
              $gep_int932 = 2880;
              $gep933 = (($gep_int932) + 16)|0;
              $expanded256 = $gep933;
              $865 = HEAP32[$expanded256>>2]|0;
              $866 = ($864>>>0)<($865>>>0);
              
              if ($866) {
               _abort();
               // unreachable
              }
              $gep_int934 = $847;
              $gep935 = (($gep_int934) + 8)|0;
              $867 = $gep935;
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
            
            $gep_int936 = $844;
            $gep937 = (($gep_int936) + 12)|0;
            $870 = $gep937;
            HEAP32[$870>>2] = $847;
            HEAP32[$$pre$phi62$i$iZ2D>>2] = $844;
            
           } else {
            $871 = $807;
            $$sum34$i$i = $806 | 24;
            $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
            $gep_int938 = $tbase$247$i;
            $gep939 = (($gep_int938) + ($$sum110$i))|0;
            $872 = $gep939;
            $873 = $872;
            $874 = HEAP32[$872>>2]|0;
            $$sum5$i$i = (($tsize$246$i) + 12)|0;
            $$sum111$i = (($$sum5$i$i) + ($806))|0;
            $gep_int940 = $tbase$247$i;
            $gep941 = (($gep_int940) + ($$sum111$i))|0;
            $875 = $gep941;
            $876 = $875;
            $877 = HEAP32[$875>>2]|0;
            $878 = ($877|0)==($871|0);
            
            do {
             if ($878) {
              $$sum67$i$i = $806 | 16;
              $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
              $gep_int950 = $tbase$247$i;
              $gep951 = (($gep_int950) + ($$sum117$i))|0;
              $891 = $gep951;
              $892 = $891;
              $893 = HEAP32[$891>>2]|0;
              $894 = ($893|0)==(0);
              
              if ($894) {
               $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
               $gep_int952 = $tbase$247$i;
               $gep953 = (($gep_int952) + ($$sum118$i))|0;
               $895 = $gep953;
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
               
               
               $gep_int954 = $R$0$i$i;
               $gep955 = (($gep_int954) + 20)|0;
               $899 = $gep955;
               $900 = HEAP32[$899>>2]|0;
               $901 = ($900|0)==(0);
               
               if (!($901)) {
                $RP$0$i$i$phi = $899;$R$0$i$i$phi = $900;$RP$0$i$i = $RP$0$i$i$phi;$R$0$i$i = $R$0$i$i$phi;
                continue;
               }
               $gep_int956 = $R$0$i$i;
               $gep957 = (($gep_int956) + 16)|0;
               $902 = $gep957;
               $903 = HEAP32[$902>>2]|0;
               $904 = ($903|0)==(0);
               
               if ($904) {
                break;
               } else {
                $R$0$i$i = $903;$RP$0$i$i = $902;
               }
              }
              $905 = $RP$0$i$i;
              $expanded261 = 2880;
              $gep_int958 = 2880;
              $gep959 = (($gep_int958) + 16)|0;
              $expanded260 = $gep959;
              $906 = HEAP32[$expanded260>>2]|0;
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
              $gep_int942 = $tbase$247$i;
              $gep943 = (($gep_int942) + ($$sum112$i))|0;
              $879 = $gep943;
              $880 = $879;
              $881 = HEAP32[$879>>2]|0;
              $882 = $881;
              $expanded259 = 2880;
              $gep_int944 = 2880;
              $gep945 = (($gep_int944) + 16)|0;
              $expanded258 = $gep945;
              $883 = HEAP32[$expanded258>>2]|0;
              $884 = ($882>>>0)<($883>>>0);
              
              if ($884) {
               _abort();
               // unreachable
              }
              $gep_int946 = $881;
              $gep947 = (($gep_int946) + 12)|0;
              $885 = $gep947;
              $886 = HEAP32[$885>>2]|0;
              $887 = ($886|0)==($871|0);
              
              if (!($887)) {
               _abort();
               // unreachable
              }
              $gep_int948 = $877;
              $gep949 = (($gep_int948) + 8)|0;
              $888 = $gep949;
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
            $gep_int960 = $tbase$247$i;
            $gep961 = (($gep_int960) + ($$sum113$i))|0;
            $909 = $gep961;
            $910 = $909;
            $911 = HEAP32[$909>>2]|0;
            $expanded262 = 2880;
            $gep_int962 = 2880;
            $gep963 = (($gep_int962) + 304)|0;
            $gep_array964 = $911<<2;
            $gep965 = (($gep963) + ($gep_array964))|0;
            $912 = $gep965;
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
              $expanded264 = 2880;
              $gep_int966 = 2880;
              $gep967 = (($gep_int966) + 4)|0;
              $expanded263 = $gep967;
              $917 = HEAP32[$expanded263>>2]|0;
              $918 = $917 & $916;
              $expanded266 = 2880;
              $gep_int968 = 2880;
              $gep969 = (($gep_int968) + 4)|0;
              $expanded265 = $gep969;
              HEAP32[$expanded265>>2] = $918;
              
              break L356;
             } else {
              $919 = $874;
              $expanded268 = 2880;
              $gep_int970 = 2880;
              $gep971 = (($gep_int970) + 16)|0;
              $expanded267 = $gep971;
              $920 = HEAP32[$expanded267>>2]|0;
              $921 = ($919>>>0)<($920>>>0);
              
              if ($921) {
               _abort();
               // unreachable
              }
              $gep_int972 = $874;
              $gep973 = (($gep_int972) + 16)|0;
              $922 = $gep973;
              $923 = HEAP32[$922>>2]|0;
              $924 = ($923|0)==($871|0);
              
              if ($924) {
               HEAP32[$922>>2] = $R$1$i$i;
               
              } else {
               $gep_int974 = $874;
               $gep975 = (($gep_int974) + 20)|0;
               $925 = $gep975;
               HEAP32[$925>>2] = $R$1$i$i;
               
              }
              $926 = ($R$1$i$i|0)==(0);
              
              if ($926) {
               break L356;
              }
             }
            } while(0);
            $927 = $R$1$i$i;
            $expanded270 = 2880;
            $gep_int976 = 2880;
            $gep977 = (($gep_int976) + 16)|0;
            $expanded269 = $gep977;
            $928 = HEAP32[$expanded269>>2]|0;
            $929 = ($927>>>0)<($928>>>0);
            
            if ($929) {
             _abort();
             // unreachable
            }
            $gep_int978 = $R$1$i$i;
            $gep979 = (($gep_int978) + 24)|0;
            $930 = $gep979;
            HEAP32[$930>>2] = $874;
            $$sum3233$i$i = $806 | 16;
            $$sum114$i = (($$sum3233$i$i) + ($tsize$246$i))|0;
            $gep_int980 = $tbase$247$i;
            $gep981 = (($gep_int980) + ($$sum114$i))|0;
            $931 = $gep981;
            $932 = $931;
            $933 = HEAP32[$931>>2]|0;
            $934 = ($933|0)==(0);
            
            do {
             if (!($934)) {
              $935 = $933;
              $expanded272 = 2880;
              $gep_int982 = 2880;
              $gep983 = (($gep_int982) + 16)|0;
              $expanded271 = $gep983;
              $936 = HEAP32[$expanded271>>2]|0;
              $937 = ($935>>>0)<($936>>>0);
              
              if ($937) {
               _abort();
               // unreachable
              } else {
               $gep_int984 = $R$1$i$i;
               $gep985 = (($gep_int984) + 16)|0;
               $938 = $gep985;
               HEAP32[$938>>2] = $933;
               $gep_int986 = $933;
               $gep987 = (($gep_int986) + 24)|0;
               $939 = $gep987;
               HEAP32[$939>>2] = $R$1$i$i;
               
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3233$i$i))|0;
            $gep_int988 = $tbase$247$i;
            $gep989 = (($gep_int988) + ($$sum115$i))|0;
            $940 = $gep989;
            $941 = $940;
            $942 = HEAP32[$940>>2]|0;
            $943 = ($942|0)==(0);
            
            if ($943) {
             break;
            }
            $944 = $942;
            $expanded274 = 2880;
            $gep_int990 = 2880;
            $gep991 = (($gep_int990) + 16)|0;
            $expanded273 = $gep991;
            $945 = HEAP32[$expanded273>>2]|0;
            $946 = ($944>>>0)<($945>>>0);
            
            if ($946) {
             _abort();
             // unreachable
            } else {
             $gep_int992 = $R$1$i$i;
             $gep993 = (($gep_int992) + 20)|0;
             $947 = $gep993;
             HEAP32[$947>>2] = $942;
             $gep_int994 = $942;
             $gep995 = (($gep_int994) + 24)|0;
             $948 = $gep995;
             HEAP32[$948>>2] = $R$1$i$i;
             
             break;
            }
           }
          } while(0);
          $$sum9$i$i = $839 | $806;
          $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
          $gep_int996 = $tbase$247$i;
          $gep997 = (($gep_int996) + ($$sum116$i))|0;
          $949 = $gep997;
          $950 = $949;
          $951 = (($839) + ($814))|0;
          
          $oldfirst$0$i$i = $950;$qsize$0$i$i = $951;
         } else {
          $oldfirst$0$i$i = $808;$qsize$0$i$i = $814;
         }
         
         
         $gep_int998 = $oldfirst$0$i$i;
         $gep999 = (($gep_int998) + 4)|0;
         $952 = $gep999;
         $953 = HEAP32[$952>>2]|0;
         $954 = $953 & -2;
         HEAP32[$952>>2] = $954;
         $955 = $qsize$0$i$i | 1;
         $$sum10$i$i = (($$sum$i21$i) + 4)|0;
         $gep_int1000 = $tbase$247$i;
         $gep1001 = (($gep_int1000) + ($$sum10$i$i))|0;
         $956 = $gep1001;
         $957 = $956;
         HEAP32[$956>>2] = $955;
         $$sum11$i$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
         $gep_int1002 = $tbase$247$i;
         $gep1003 = (($gep_int1002) + ($$sum11$i$i))|0;
         $958 = $gep1003;
         $959 = $958;
         HEAP32[$958>>2] = $qsize$0$i$i;
         $960 = $qsize$0$i$i >>> 3;
         $961 = ($qsize$0$i$i>>>0)<(256);
         
         if ($961) {
          $962 = $960 << 1;
          $expanded275 = 2880;
          $gep_int1004 = 2880;
          $gep1005 = (($gep_int1004) + 40)|0;
          $gep_array1006 = $962<<2;
          $gep1007 = (($gep1005) + ($gep_array1006))|0;
          $963 = $gep1007;
          $964 = $963;
          $expanded277 = 2880;
          $gep_int1008 = 2880;
          $expanded276 = $gep_int1008;
          $965 = HEAP32[$expanded276>>2]|0;
          $966 = 1 << $960;
          $967 = $965 & $966;
          $968 = ($967|0)==(0);
          
          do {
           if ($968) {
            $969 = $965 | $966;
            $expanded279 = 2880;
            $gep_int1009 = 2880;
            $expanded278 = $gep_int1009;
            HEAP32[$expanded278>>2] = $969;
            $$sum27$pre$i$i = (($962) + 2)|0;
            $expanded280 = 2880;
            $gep_int1010 = 2880;
            $gep1011 = (($gep_int1010) + 40)|0;
            $gep_array1012 = $$sum27$pre$i$i<<2;
            $gep1013 = (($gep1011) + ($gep_array1012))|0;
            $$pre$i24$i = $gep1013;
            
            $$pre$phi$i25$iZ2D = $$pre$i24$i;$F4$0$i$i = $964;
           } else {
            $$sum30$i$i = (($962) + 2)|0;
            $expanded281 = 2880;
            $gep_int1014 = 2880;
            $gep1015 = (($gep_int1014) + 40)|0;
            $gep_array1016 = $$sum30$i$i<<2;
            $gep1017 = (($gep1015) + ($gep_array1016))|0;
            $970 = $gep1017;
            $971 = HEAP32[$970>>2]|0;
            $972 = $971;
            $expanded283 = 2880;
            $gep_int1018 = 2880;
            $gep1019 = (($gep_int1018) + 16)|0;
            $expanded282 = $gep1019;
            $973 = HEAP32[$expanded282>>2]|0;
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
          $gep_int1020 = $F4$0$i$i;
          $gep1021 = (($gep_int1020) + 12)|0;
          $975 = $gep1021;
          HEAP32[$975>>2] = $813;
          $$sum28$i$i = (($$sum$i21$i) + 8)|0;
          $gep_int1022 = $tbase$247$i;
          $gep1023 = (($gep_int1022) + ($$sum28$i$i))|0;
          $976 = $gep1023;
          $977 = $976;
          HEAP32[$976>>2] = $F4$0$i$i;
          $$sum29$i$i = (($$sum$i21$i) + 12)|0;
          $gep_int1024 = $tbase$247$i;
          $gep1025 = (($gep_int1024) + ($$sum29$i$i))|0;
          $978 = $gep1025;
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
         
         $expanded284 = 2880;
         $gep_int1026 = 2880;
         $gep1027 = (($gep_int1026) + 304)|0;
         $gep_array1028 = $I7$0$i$i<<2;
         $gep1029 = (($gep1027) + ($gep_array1028))|0;
         $1006 = $gep1029;
         $$sum12$i26$i = (($$sum$i21$i) + 28)|0;
         $gep_int1030 = $tbase$247$i;
         $gep1031 = (($gep_int1030) + ($$sum12$i26$i))|0;
         $1007 = $gep1031;
         $1008 = $1007;
         HEAP32[$1007>>2] = $I7$0$i$i;
         $$sum13$i$i = (($$sum$i21$i) + 16)|0;
         $gep_int1032 = $tbase$247$i;
         $gep1033 = (($gep_int1032) + ($$sum13$i$i))|0;
         $1009 = $gep1033;
         $$sum14$i$i = (($$sum$i21$i) + 20)|0;
         $gep_int1034 = $tbase$247$i;
         $gep1035 = (($gep_int1034) + ($$sum14$i$i))|0;
         $1010 = $gep1035;
         $1011 = $1010;
         HEAP32[$1010>>2] = 0;
         $1012 = $1009;
         HEAP32[$1009>>2] = 0;
         $expanded286 = 2880;
         $gep_int1036 = 2880;
         $gep1037 = (($gep_int1036) + 4)|0;
         $expanded285 = $gep1037;
         $1013 = HEAP32[$expanded285>>2]|0;
         $1014 = 1 << $I7$0$i$i;
         $1015 = $1013 & $1014;
         $1016 = ($1015|0)==(0);
         
         if ($1016) {
          $1017 = $1013 | $1014;
          $expanded288 = 2880;
          $gep_int1038 = 2880;
          $gep1039 = (($gep_int1038) + 4)|0;
          $expanded287 = $gep1039;
          HEAP32[$expanded287>>2] = $1017;
          HEAP32[$1006>>2] = $980;
          $1018 = $1006;
          $$sum15$i$i = (($$sum$i21$i) + 24)|0;
          $gep_int1040 = $tbase$247$i;
          $gep1041 = (($gep_int1040) + ($$sum15$i$i))|0;
          $1019 = $gep1041;
          $1020 = $1019;
          HEAP32[$1019>>2] = $1018;
          $$sum16$i$i = (($$sum$i21$i) + 12)|0;
          $gep_int1042 = $tbase$247$i;
          $gep1043 = (($gep_int1042) + ($$sum16$i$i))|0;
          $1021 = $gep1043;
          $1022 = $1021;
          HEAP32[$1021>>2] = $980;
          $$sum17$i$i = (($$sum$i21$i) + 8)|0;
          $gep_int1044 = $tbase$247$i;
          $gep1045 = (($gep_int1044) + ($$sum17$i$i))|0;
          $1023 = $gep1045;
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
         
         $gep_int1046 = $1025;
         $gep1047 = (($gep_int1046) + 4)|0;
         $1030 = $gep1047;
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
            $gep_int1050 = $T$055$i$i;
            $gep1051 = (($gep_int1050) + 16)|0;
            $gep_array1052 = $1040<<2;
            $gep1053 = (($gep1051) + ($gep_array1052))|0;
            $1041 = $gep1053;
            $1042 = HEAP32[$1041>>2]|0;
            $1043 = ($1042|0)==(0);
            
            if ($1043) {
             break;
            }
            $1035 = $K8$056$i$i << 1;
            $gep_int1048 = $1042;
            $gep1049 = (($gep_int1048) + 4)|0;
            $1036 = $gep1049;
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
           $expanded290 = 2880;
           $gep_int1054 = 2880;
           $gep1055 = (($gep_int1054) + 16)|0;
           $expanded289 = $gep1055;
           $1045 = HEAP32[$expanded289>>2]|0;
           $1046 = ($1044>>>0)<($1045>>>0);
           
           if ($1046) {
            _abort();
            // unreachable
           } else {
            HEAP32[$1041>>2] = $980;
            $$sum24$i$i = (($$sum$i21$i) + 24)|0;
            $gep_int1056 = $tbase$247$i;
            $gep1057 = (($gep_int1056) + ($$sum24$i$i))|0;
            $1047 = $gep1057;
            $1048 = $1047;
            HEAP32[$1047>>2] = $T$055$i$i;
            $$sum25$i$i = (($$sum$i21$i) + 12)|0;
            $gep_int1058 = $tbase$247$i;
            $gep1059 = (($gep_int1058) + ($$sum25$i$i))|0;
            $1049 = $gep1059;
            $1050 = $1049;
            HEAP32[$1049>>2] = $980;
            $$sum26$i$i = (($$sum$i21$i) + 8)|0;
            $gep_int1060 = $tbase$247$i;
            $gep1061 = (($gep_int1060) + ($$sum26$i$i))|0;
            $1051 = $gep1061;
            $1052 = $1051;
            HEAP32[$1051>>2] = $980;
            
            break L348;
           }
          }
         } while(0);
         
         $gep_int1062 = $T$0$lcssa$i28$i;
         $gep1063 = (($gep_int1062) + 8)|0;
         $1053 = $gep1063;
         $1054 = HEAP32[$1053>>2]|0;
         $1055 = $T$0$lcssa$i28$i;
         $expanded292 = 2880;
         $gep_int1064 = 2880;
         $gep1065 = (($gep_int1064) + 16)|0;
         $expanded291 = $gep1065;
         $1056 = HEAP32[$expanded291>>2]|0;
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
          $gep_int1066 = $1054;
          $gep1067 = (($gep_int1066) + 12)|0;
          $1060 = $gep1067;
          HEAP32[$1060>>2] = $980;
          HEAP32[$1053>>2] = $980;
          $$sum21$i$i = (($$sum$i21$i) + 8)|0;
          $gep_int1068 = $tbase$247$i;
          $gep1069 = (($gep_int1068) + ($$sum21$i$i))|0;
          $1061 = $gep1069;
          $1062 = $1061;
          HEAP32[$1061>>2] = $1054;
          $$sum22$i$i = (($$sum$i21$i) + 12)|0;
          $gep_int1070 = $tbase$247$i;
          $gep1071 = (($gep_int1070) + ($$sum22$i$i))|0;
          $1063 = $gep1071;
          $1064 = $1063;
          HEAP32[$1063>>2] = $T$0$lcssa$i28$i;
          $$sum23$i$i = (($$sum$i21$i) + 24)|0;
          $gep_int1072 = $tbase$247$i;
          $gep1073 = (($gep_int1072) + ($$sum23$i$i))|0;
          $1065 = $gep1073;
          $1066 = $1065;
          HEAP32[$1065>>2] = 0;
          
          break;
         }
        }
       } while(0);
       $$sum1819$i$i = $798 | 8;
       $gep_int1074 = $tbase$247$i;
       $gep1075 = (($gep_int1074) + ($$sum1819$i$i))|0;
       $1067 = $gep1075;
       
       $mem$0 = $1067;
       
       STACKTOP = sp;return $mem$0|0;
      }
     } while(0);
     $1068 = $711;
     $expanded294 = 2880;
     $gep_int1076 = 2880;
     $gep1077 = (($gep_int1076) + 448)|0;
     $expanded293 = $gep1077;
     
     $sp$0$i$i$i = $expanded293;
     while(1) {
      
      $gep_int1078 = $sp$0$i$i$i;
      $1069 = $gep_int1078;
      $1070 = HEAP32[$1069>>2]|0;
      $1071 = ($1070>>>0)>($1068>>>0);
      
      if (!($1071)) {
       $gep_int1079 = $sp$0$i$i$i;
       $gep1080 = (($gep_int1079) + 4)|0;
       $1072 = $gep1080;
       $1073 = HEAP32[$1072>>2]|0;
       $gep_int1081 = $1070;
       $gep1082 = (($gep_int1081) + ($1073))|0;
       $1074 = $gep1082;
       $1075 = ($1074>>>0)>($1068>>>0);
       
       if ($1075) {
        break;
       }
      }
      $gep_int1083 = $sp$0$i$i$i;
      $gep1084 = (($gep_int1083) + 8)|0;
      $1076 = $gep1084;
      $1077 = HEAP32[$1076>>2]|0;
      
      $sp$0$i$i$i = $1077;
     }
     $$sum$i15$i = (($1073) + -47)|0;
     $$sum1$i16$i = (($1073) + -39)|0;
     $gep_int1085 = $1070;
     $gep1086 = (($gep_int1085) + ($$sum1$i16$i))|0;
     $1078 = $gep1086;
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
     $gep_int1087 = $1070;
     $gep1088 = (($gep_int1087) + ($$sum2$i17$i))|0;
     $1085 = $gep1088;
     $gep_int1089 = $711;
     $gep1090 = (($gep_int1089) + 16)|0;
     $1086 = $gep1090;
     $1087 = $1086;
     $1088 = ($1085>>>0)<($1087>>>0);
     $1089 = $1088 ? $1068 : $1085;
     $gep_int1091 = $1089;
     $gep1092 = (($gep_int1091) + 8)|0;
     $1090 = $gep1092;
     $1091 = $1090;
     $1092 = (($tsize$246$i) + -40)|0;
     $gep_int1093 = $tbase$247$i;
     $gep1094 = (($gep_int1093) + 8)|0;
     $1093 = $gep1094;
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
     
     $gep_int1095 = $tbase$247$i;
     $gep1096 = (($gep_int1095) + ($1099))|0;
     $1100 = $gep1096;
     $1101 = $1100;
     $1102 = (($1092) - ($1099))|0;
     $expanded296 = 2880;
     $gep_int1097 = 2880;
     $gep1098 = (($gep_int1097) + 24)|0;
     $expanded295 = $gep1098;
     HEAP32[$expanded295>>2] = $1101;
     $expanded298 = 2880;
     $gep_int1099 = 2880;
     $gep1100 = (($gep_int1099) + 12)|0;
     $expanded297 = $gep1100;
     HEAP32[$expanded297>>2] = $1102;
     $1103 = $1102 | 1;
     $$sum$i$i$i = (($1099) + 4)|0;
     $gep_int1101 = $tbase$247$i;
     $gep1102 = (($gep_int1101) + ($$sum$i$i$i))|0;
     $1104 = $gep1102;
     $1105 = $1104;
     HEAP32[$1104>>2] = $1103;
     $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
     $gep_int1103 = $tbase$247$i;
     $gep1104 = (($gep_int1103) + ($$sum2$i$i$i))|0;
     $1106 = $gep1104;
     $1107 = $1106;
     HEAP32[$1106>>2] = 40;
     $expanded300 = 3352;
     $gep_int1105 = 3352;
     $gep1106 = (($gep_int1105) + 16)|0;
     $expanded299 = $gep1106;
     $1108 = HEAP32[$expanded299>>2]|0;
     $expanded302 = 2880;
     $gep_int1107 = 2880;
     $gep1108 = (($gep_int1107) + 28)|0;
     $expanded301 = $gep1108;
     HEAP32[$expanded301>>2] = $1108;
     $gep_int1109 = $1089;
     $gep1110 = (($gep_int1109) + 4)|0;
     $1109 = $gep1110;
     $1110 = $1109;
     HEAP32[$1109>>2] = 27;
     $expanded305 = 2880;
     $gep_int1111 = 2880;
     $gep1112 = (($gep_int1111) + 448)|0;
     $expanded304 = $gep1112;
     $expanded303 = $expanded304;
     ;HEAP32[$1090+0>>2]=HEAP32[$expanded303+0>>2]|0;HEAP32[$1090+4>>2]=HEAP32[$expanded303+4>>2]|0;HEAP32[$1090+8>>2]=HEAP32[$expanded303+8>>2]|0;HEAP32[$1090+12>>2]=HEAP32[$expanded303+12>>2]|0;
     $expanded307 = 2880;
     $gep_int1113 = 2880;
     $gep1114 = (($gep_int1113) + 448)|0;
     $expanded306 = $gep1114;
     HEAP32[$expanded306>>2] = $tbase$247$i;
     $expanded309 = 2880;
     $gep_int1115 = 2880;
     $gep1116 = (($gep_int1115) + 452)|0;
     $expanded308 = $gep1116;
     HEAP32[$expanded308>>2] = $tsize$246$i;
     $expanded311 = 2880;
     $gep_int1117 = 2880;
     $gep1118 = (($gep_int1117) + 460)|0;
     $expanded310 = $gep1118;
     HEAP32[$expanded310>>2] = 0;
     $expanded313 = 2880;
     $gep_int1119 = 2880;
     $gep1120 = (($gep_int1119) + 456)|0;
     $expanded312 = $gep1120;
     HEAP32[$expanded312>>2] = $1091;
     $gep_int1121 = $1089;
     $gep1122 = (($gep_int1121) + 28)|0;
     $1111 = $gep1122;
     $1112 = $1111;
     HEAP32[$1111>>2] = 7;
     $gep_int1123 = $1089;
     $gep1124 = (($gep_int1123) + 32)|0;
     $1113 = $gep1124;
     $1114 = ($1113>>>0)<($1074>>>0);
     
     if ($1114) {
      $1115 = $1112;
      while(1) {
       
       $gep_int1125 = $1115;
       $gep1126 = (($gep_int1125) + 4)|0;
       $1116 = $gep1126;
       HEAP32[$1116>>2] = 7;
       $gep_int1127 = $1115;
       $gep1128 = (($gep_int1127) + 8)|0;
       $1117 = $gep1128;
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
     $gep_int1129 = $711;
     $gep1130 = (($gep_int1129) + ($1123))|0;
     $1124 = $gep1130;
     $$sum3$i$i = (($1123) + 4)|0;
     $gep_int1131 = $711;
     $gep1132 = (($gep_int1131) + ($$sum3$i$i))|0;
     $1125 = $gep1132;
     $1126 = $1125;
     $1127 = HEAP32[$1125>>2]|0;
     $1128 = $1127 & -2;
     HEAP32[$1125>>2] = $1128;
     $1129 = $1123 | 1;
     $gep_int1133 = $711;
     $gep1134 = (($gep_int1133) + 4)|0;
     $1130 = $gep1134;
     HEAP32[$1130>>2] = $1129;
     $1131 = $1124;
     HEAP32[$1124>>2] = $1123;
     $1132 = $1123 >>> 3;
     $1133 = ($1123>>>0)<(256);
     
     if ($1133) {
      $1134 = $1132 << 1;
      $expanded314 = 2880;
      $gep_int1135 = 2880;
      $gep1136 = (($gep_int1135) + 40)|0;
      $gep_array1137 = $1134<<2;
      $gep1138 = (($gep1136) + ($gep_array1137))|0;
      $1135 = $gep1138;
      $1136 = $1135;
      $expanded316 = 2880;
      $gep_int1139 = 2880;
      $expanded315 = $gep_int1139;
      $1137 = HEAP32[$expanded315>>2]|0;
      $1138 = 1 << $1132;
      $1139 = $1137 & $1138;
      $1140 = ($1139|0)==(0);
      
      do {
       if ($1140) {
        $1141 = $1137 | $1138;
        $expanded318 = 2880;
        $gep_int1140 = 2880;
        $expanded317 = $gep_int1140;
        HEAP32[$expanded317>>2] = $1141;
        $$sum11$pre$i$i = (($1134) + 2)|0;
        $expanded319 = 2880;
        $gep_int1141 = 2880;
        $gep1142 = (($gep_int1141) + 40)|0;
        $gep_array1143 = $$sum11$pre$i$i<<2;
        $gep1144 = (($gep1142) + ($gep_array1143))|0;
        $$pre$i$i = $gep1144;
        
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $1136;
       } else {
        $$sum12$i$i = (($1134) + 2)|0;
        $expanded320 = 2880;
        $gep_int1145 = 2880;
        $gep1146 = (($gep_int1145) + 40)|0;
        $gep_array1147 = $$sum12$i$i<<2;
        $gep1148 = (($gep1146) + ($gep_array1147))|0;
        $1142 = $gep1148;
        $1143 = HEAP32[$1142>>2]|0;
        $1144 = $1143;
        $expanded322 = 2880;
        $gep_int1149 = 2880;
        $gep1150 = (($gep_int1149) + 16)|0;
        $expanded321 = $gep1150;
        $1145 = HEAP32[$expanded321>>2]|0;
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
      $gep_int1151 = $F$0$i$i;
      $gep1152 = (($gep_int1151) + 12)|0;
      $1147 = $gep1152;
      HEAP32[$1147>>2] = $711;
      $gep_int1153 = $711;
      $gep1154 = (($gep_int1153) + 8)|0;
      $1148 = $gep1154;
      HEAP32[$1148>>2] = $F$0$i$i;
      $gep_int1155 = $711;
      $gep1156 = (($gep_int1155) + 12)|0;
      $1149 = $gep1156;
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
     
     $expanded323 = 2880;
     $gep_int1157 = 2880;
     $gep1158 = (($gep_int1157) + 304)|0;
     $gep_array1159 = $I1$0$i$i<<2;
     $gep1160 = (($gep1158) + ($gep_array1159))|0;
     $1176 = $gep1160;
     $gep_int1161 = $711;
     $gep1162 = (($gep_int1161) + 28)|0;
     $1177 = $gep1162;
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1177>>2] = $I1$0$c$i$i;
     $gep_int1163 = $711;
     $gep1164 = (($gep_int1163) + 20)|0;
     $1178 = $gep1164;
     HEAP32[$1178>>2] = 0;
     $gep_int1165 = $711;
     $gep1166 = (($gep_int1165) + 16)|0;
     $1179 = $gep1166;
     HEAP32[$1179>>2] = 0;
     $expanded325 = 2880;
     $gep_int1167 = 2880;
     $gep1168 = (($gep_int1167) + 4)|0;
     $expanded324 = $gep1168;
     $1180 = HEAP32[$expanded324>>2]|0;
     $1181 = 1 << $I1$0$i$i;
     $1182 = $1180 & $1181;
     $1183 = ($1182|0)==(0);
     
     if ($1183) {
      $1184 = $1180 | $1181;
      $expanded327 = 2880;
      $gep_int1169 = 2880;
      $gep1170 = (($gep_int1169) + 4)|0;
      $expanded326 = $gep1170;
      HEAP32[$expanded326>>2] = $1184;
      HEAP32[$1176>>2] = $1150;
      $gep_int1171 = $711;
      $gep1172 = (($gep_int1171) + 24)|0;
      $1185 = $gep1172;
      $$c$i$i = $1176;
      HEAP32[$1185>>2] = $$c$i$i;
      $gep_int1173 = $711;
      $gep1174 = (($gep_int1173) + 12)|0;
      $1186 = $gep1174;
      HEAP32[$1186>>2] = $711;
      $gep_int1175 = $711;
      $gep1176 = (($gep_int1175) + 8)|0;
      $1187 = $gep1176;
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
     
     $gep_int1177 = $1188;
     $gep1178 = (($gep_int1177) + 4)|0;
     $1193 = $gep1178;
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
        $gep_int1181 = $T$014$i$i;
        $gep1182 = (($gep_int1181) + 16)|0;
        $gep_array1183 = $1203<<2;
        $gep1184 = (($gep1182) + ($gep_array1183))|0;
        $1204 = $gep1184;
        $1205 = HEAP32[$1204>>2]|0;
        $1206 = ($1205|0)==(0);
        
        if ($1206) {
         break;
        }
        $1198 = $K2$015$i$i << 1;
        $gep_int1179 = $1205;
        $gep1180 = (($gep_int1179) + 4)|0;
        $1199 = $gep1180;
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
       $expanded329 = 2880;
       $gep_int1185 = 2880;
       $gep1186 = (($gep_int1185) + 16)|0;
       $expanded328 = $gep1186;
       $1208 = HEAP32[$expanded328>>2]|0;
       $1209 = ($1207>>>0)<($1208>>>0);
       
       if ($1209) {
        _abort();
        // unreachable
       } else {
        HEAP32[$1204>>2] = $1150;
        $gep_int1187 = $711;
        $gep1188 = (($gep_int1187) + 24)|0;
        $1210 = $gep1188;
        $T$0$c8$i$i = $T$014$i$i;
        HEAP32[$1210>>2] = $T$0$c8$i$i;
        $gep_int1189 = $711;
        $gep1190 = (($gep_int1189) + 12)|0;
        $1211 = $gep1190;
        HEAP32[$1211>>2] = $711;
        $gep_int1191 = $711;
        $gep1192 = (($gep_int1191) + 8)|0;
        $1212 = $gep1192;
        HEAP32[$1212>>2] = $711;
        
        break L311;
       }
      }
     } while(0);
     
     $gep_int1193 = $T$0$lcssa$i$i;
     $gep1194 = (($gep_int1193) + 8)|0;
     $1213 = $gep1194;
     $1214 = HEAP32[$1213>>2]|0;
     $1215 = $T$0$lcssa$i$i;
     $expanded331 = 2880;
     $gep_int1195 = 2880;
     $gep1196 = (($gep_int1195) + 16)|0;
     $expanded330 = $gep1196;
     $1216 = HEAP32[$expanded330>>2]|0;
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
      $gep_int1197 = $1214;
      $gep1198 = (($gep_int1197) + 12)|0;
      $1220 = $gep1198;
      HEAP32[$1220>>2] = $1150;
      HEAP32[$1213>>2] = $1150;
      $gep_int1199 = $711;
      $gep1200 = (($gep_int1199) + 8)|0;
      $1221 = $gep1200;
      $$c7$i$i = $1214;
      HEAP32[$1221>>2] = $$c7$i$i;
      $gep_int1201 = $711;
      $gep1202 = (($gep_int1201) + 12)|0;
      $1222 = $gep1202;
      $T$0$c$i$i = $T$0$lcssa$i$i;
      HEAP32[$1222>>2] = $T$0$c$i$i;
      $gep_int1203 = $711;
      $gep1204 = (($gep_int1203) + 24)|0;
      $1223 = $gep1204;
      HEAP32[$1223>>2] = 0;
      
      break;
     }
    }
   } while(0);
   $expanded333 = 2880;
   $gep_int1205 = 2880;
   $gep1206 = (($gep_int1205) + 12)|0;
   $expanded332 = $gep1206;
   $1224 = HEAP32[$expanded332>>2]|0;
   $1225 = ($1224>>>0)>($nb$0>>>0);
   
   if (!($1225)) {
    break;
   }
   $1226 = (($1224) - ($nb$0))|0;
   $expanded335 = 2880;
   $gep_int1207 = 2880;
   $gep1208 = (($gep_int1207) + 12)|0;
   $expanded334 = $gep1208;
   HEAP32[$expanded334>>2] = $1226;
   $expanded337 = 2880;
   $gep_int1209 = 2880;
   $gep1210 = (($gep_int1209) + 24)|0;
   $expanded336 = $gep1210;
   $1227 = HEAP32[$expanded336>>2]|0;
   $1228 = $1227;
   $gep_int1211 = $1227;
   $gep1212 = (($gep_int1211) + ($nb$0))|0;
   $1229 = $gep1212;
   $1230 = $1229;
   $expanded339 = 2880;
   $gep_int1213 = 2880;
   $gep1214 = (($gep_int1213) + 24)|0;
   $expanded338 = $gep1214;
   HEAP32[$expanded338>>2] = $1230;
   $1231 = $1226 | 1;
   $$sum$i34 = (($nb$0) + 4)|0;
   $gep_int1215 = $1227;
   $gep1216 = (($gep_int1215) + ($$sum$i34))|0;
   $1232 = $gep1216;
   $1233 = $1232;
   HEAP32[$1232>>2] = $1231;
   $1234 = $nb$0 | 3;
   $gep_int1217 = $1227;
   $gep1218 = (($gep_int1217) + 4)|0;
   $1235 = $gep1218;
   HEAP32[$1235>>2] = $1234;
   $gep_int1219 = $1227;
   $gep1220 = (($gep_int1219) + 8)|0;
   $1236 = $gep1220;
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
 $expanded1 = 2880;
 $gep_int102 = 2880;
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
   $expanded3 = 2880;
   $gep_int110 = 2880;
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
    $expanded23 = 2880;
    $gep_int185 = 2880;
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
    $expanded4 = 2880;
    $gep_int116 = 2880;
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
     $expanded6 = 2880;
     $gep_int121 = 2880;
     $expanded5 = $gep_int121;
     $45 = HEAP32[$expanded5>>2]|0;
     $46 = $45 & $44;
     $expanded8 = 2880;
     $gep_int122 = 2880;
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
   $expanded9 = 2880;
   $gep_int149 = 2880;
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
     $expanded11 = 2880;
     $gep_int153 = 2880;
     $gep154 = (($gep_int153) + 4)|0;
     $expanded10 = $gep154;
     $98 = HEAP32[$expanded10>>2]|0;
     $99 = $98 & $97;
     $expanded13 = 2880;
     $gep_int155 = 2880;
     $gep156 = (($gep_int155) + 4)|0;
     $expanded12 = $gep156;
     HEAP32[$expanded12>>2] = $99;
     
     $p$0 = $20;$psize$0 = $21;
     break L10;
    } else {
     $100 = $57;
     $expanded15 = 2880;
     $gep_int157 = 2880;
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
   $expanded17 = 2880;
   $gep_int163 = 2880;
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
     $expanded19 = 2880;
     $gep_int169 = 2880;
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
   $expanded21 = 2880;
   $gep_int177 = 2880;
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
   $expanded25 = 2880;
   $gep_int191 = 2880;
   $gep192 = (($gep_int191) + 24)|0;
   $expanded24 = $gep192;
   $149 = HEAP32[$expanded24>>2]|0;
   $150 = ($13|0)==($149|0);
   
   if ($150) {
    $expanded27 = 2880;
    $gep_int193 = 2880;
    $gep194 = (($gep_int193) + 12)|0;
    $expanded26 = $gep194;
    $151 = HEAP32[$expanded26>>2]|0;
    $152 = (($151) + ($psize$0))|0;
    $expanded29 = 2880;
    $gep_int195 = 2880;
    $gep196 = (($gep_int195) + 12)|0;
    $expanded28 = $gep196;
    HEAP32[$expanded28>>2] = $152;
    $expanded31 = 2880;
    $gep_int197 = 2880;
    $gep198 = (($gep_int197) + 24)|0;
    $expanded30 = $gep198;
    HEAP32[$expanded30>>2] = $p$0;
    $153 = $152 | 1;
    $gep_int199 = $p$0;
    $gep200 = (($gep_int199) + 4)|0;
    $154 = $gep200;
    HEAP32[$154>>2] = $153;
    $expanded33 = 2880;
    $gep_int201 = 2880;
    $gep202 = (($gep_int201) + 20)|0;
    $expanded32 = $gep202;
    $155 = HEAP32[$expanded32>>2]|0;
    $156 = ($p$0|0)==($155|0);
    
    if (!($156)) {
     STACKTOP = sp;return;
    }
    $expanded35 = 2880;
    $gep_int203 = 2880;
    $gep204 = (($gep_int203) + 20)|0;
    $expanded34 = $gep204;
    HEAP32[$expanded34>>2] = 0;
    $expanded37 = 2880;
    $gep_int205 = 2880;
    $gep206 = (($gep_int205) + 8)|0;
    $expanded36 = $gep206;
    HEAP32[$expanded36>>2] = 0;
    
    STACKTOP = sp;return;
   }
   $expanded39 = 2880;
   $gep_int207 = 2880;
   $gep208 = (($gep_int207) + 20)|0;
   $expanded38 = $gep208;
   $157 = HEAP32[$expanded38>>2]|0;
   $158 = ($13|0)==($157|0);
   
   if ($158) {
    $expanded41 = 2880;
    $gep_int209 = 2880;
    $gep210 = (($gep_int209) + 8)|0;
    $expanded40 = $gep210;
    $159 = HEAP32[$expanded40>>2]|0;
    $160 = (($159) + ($psize$0))|0;
    $expanded43 = 2880;
    $gep_int211 = 2880;
    $gep212 = (($gep_int211) + 8)|0;
    $expanded42 = $gep212;
    HEAP32[$expanded42>>2] = $160;
    $expanded45 = 2880;
    $gep_int213 = 2880;
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
   
   L113: do {
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
     $expanded46 = 2880;
     $gep_int223 = 2880;
     $gep224 = (($gep_int223) + 40)|0;
     $gep_array225 = $175<<2;
     $gep226 = (($gep224) + ($gep_array225))|0;
     $176 = $gep226;
     $177 = $176;
     $178 = ($171|0)==($177|0);
     
     do {
      if (!($178)) {
       $179 = $171;
       $expanded48 = 2880;
       $gep_int227 = 2880;
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
      $expanded50 = 2880;
      $gep_int231 = 2880;
      $expanded49 = $gep_int231;
      $188 = HEAP32[$expanded49>>2]|0;
      $189 = $188 & $187;
      $expanded52 = 2880;
      $gep_int232 = 2880;
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
       $expanded54 = 2880;
       $gep_int235 = 2880;
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
       $expanded58 = 2880;
       $gep_int261 = 2880;
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
       $expanded56 = 2880;
       $gep_int247 = 2880;
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
     $expanded59 = 2880;
     $gep_int265 = 2880;
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
       $expanded61 = 2880;
       $gep_int269 = 2880;
       $gep270 = (($gep_int269) + 4)|0;
       $expanded60 = $gep270;
       $244 = HEAP32[$expanded60>>2]|0;
       $245 = $244 & $243;
       $expanded63 = 2880;
       $gep_int271 = 2880;
       $gep272 = (($gep_int271) + 4)|0;
       $expanded62 = $gep272;
       HEAP32[$expanded62>>2] = $245;
       
       break L113;
      } else {
       $246 = $201;
       $expanded65 = 2880;
       $gep_int273 = 2880;
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
        break L113;
       }
      }
     } while(0);
     $254 = $R7$1;
     $expanded67 = 2880;
     $gep_int279 = 2880;
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
       $expanded69 = 2880;
       $gep_int285 = 2880;
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
     $expanded71 = 2880;
     $gep_int293 = 2880;
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
   $expanded73 = 2880;
   $gep_int303 = 2880;
   $gep304 = (($gep_int303) + 20)|0;
   $expanded72 = $gep304;
   $280 = HEAP32[$expanded72>>2]|0;
   $281 = ($p$0|0)==($280|0);
   
   if (!($281)) {
    $psize$1 = $166;
    break;
   }
   $expanded75 = 2880;
   $gep_int305 = 2880;
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
  $expanded76 = 2880;
  $gep_int311 = 2880;
  $gep312 = (($gep_int311) + 40)|0;
  $gep_array313 = $289<<2;
  $gep314 = (($gep312) + ($gep_array313))|0;
  $290 = $gep314;
  $291 = $290;
  $expanded78 = 2880;
  $gep_int315 = 2880;
  $expanded77 = $gep_int315;
  $292 = HEAP32[$expanded77>>2]|0;
  $293 = 1 << $287;
  $294 = $292 & $293;
  $295 = ($294|0)==(0);
  
  do {
   if ($295) {
    $296 = $292 | $293;
    $expanded80 = 2880;
    $gep_int316 = 2880;
    $expanded79 = $gep_int316;
    HEAP32[$expanded79>>2] = $296;
    $$sum19$pre = (($289) + 2)|0;
    $expanded81 = 2880;
    $gep_int317 = 2880;
    $gep318 = (($gep_int317) + 40)|0;
    $gep_array319 = $$sum19$pre<<2;
    $gep320 = (($gep318) + ($gep_array319))|0;
    $$pre = $gep320;
    
    $$pre$phiZ2D = $$pre;$F16$0 = $291;
   } else {
    $$sum20 = (($289) + 2)|0;
    $expanded82 = 2880;
    $gep_int321 = 2880;
    $gep322 = (($gep_int321) + 40)|0;
    $gep_array323 = $$sum20<<2;
    $gep324 = (($gep322) + ($gep_array323))|0;
    $297 = $gep324;
    $298 = HEAP32[$297>>2]|0;
    $299 = $298;
    $expanded84 = 2880;
    $gep_int325 = 2880;
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
 
 $expanded85 = 2880;
 $gep_int333 = 2880;
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
 $expanded87 = 2880;
 $gep_int343 = 2880;
 $gep344 = (($gep_int343) + 4)|0;
 $expanded86 = $gep344;
 $335 = HEAP32[$expanded86>>2]|0;
 $336 = 1 << $I18$0;
 $337 = $335 & $336;
 $338 = ($337|0)==(0);
 
 L199: do {
  if ($338) {
   $339 = $335 | $336;
   $expanded89 = 2880;
   $gep_int345 = 2880;
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
     $expanded91 = 2880;
     $gep_int361 = 2880;
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
   $expanded93 = 2880;
   $gep_int371 = 2880;
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
 $expanded95 = 2880;
 $gep_int381 = 2880;
 $gep382 = (($gep_int381) + 32)|0;
 $expanded94 = $gep382;
 $379 = HEAP32[$expanded94>>2]|0;
 $380 = (($379) + -1)|0;
 $expanded97 = 2880;
 $gep_int383 = 2880;
 $gep384 = (($gep_int383) + 32)|0;
 $expanded96 = $gep384;
 HEAP32[$expanded96>>2] = $380;
 $381 = ($380|0)==(0);
 $expanded99 = 2880;
 $gep_int385 = 2880;
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
 $expanded101 = 2880;
 $gep_int389 = 2880;
 $gep390 = (($gep_int389) + 32)|0;
 $expanded100 = $gep390;
 HEAP32[$expanded100>>2] = -1;
 
 STACKTOP = sp;return;
}
function runPostSets() {
 
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

  
  function dynCall_vii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    FUNCTION_TABLE_vii[index&3](a1|0,a2|0);
  }


  function dynCall_iiii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    return FUNCTION_TABLE_iiii[index&3](a1|0,a2|0,a3|0)|0;
  }


  function dynCall_viii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    FUNCTION_TABLE_viii[index&3](a1|0,a2|0,a3|0);
  }


  function dynCall_v(index) {
    index = index|0;
    
    FUNCTION_TABLE_v[index&1]();
  }


  function dynCall_iii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    return FUNCTION_TABLE_iii[index&1](a1|0,a2|0)|0;
  }


  function dynCall_viiii(index,a1,a2,a3,a4) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    FUNCTION_TABLE_viiii[index&1](a1|0,a2|0,a3|0,a4|0);
  }

function b0(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_vii(0); }
  function b1(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(1);return 0; }
  function _fprintf__wrapper(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; return _fprintf(p0|0,p1|0,p2|0)|0; }
  function _sprintf__wrapper(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; return _sprintf(p0|0,p1|0,p2|0)|0; }
  function b2(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_viii(2); }
  function b3() { ; nullFunc_v(3); }
  function b4(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_iii(4);return 0; }
  function _printf__wrapper(p0,p1) { p0 = p0|0;p1 = p1|0; return _printf(p0|0,p1|0)|0; }
  function b5(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; nullFunc_viiii(5); }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_vii = [b0,__Z11reshapeFuncii,__Z10motionFuncii,b0];
  var FUNCTION_TABLE_iiii = [b1,_fprintf__wrapper,_sprintf__wrapper,b1];
  var FUNCTION_TABLE_viii = [b2,__Z7keyFunchii,__Z11specialFunciii,b2];
  var FUNCTION_TABLE_v = [b3,__Z11displayFuncv];
  var FUNCTION_TABLE_iii = [b4,_printf__wrapper];
  var FUNCTION_TABLE_viiii = [b5,__Z9mouseFunciiii];

  return { _strlen: _strlen, _free: _free, _main: _main, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_vii: dynCall_vii, dynCall_iiii: dynCall_iiii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "nullFunc_vii": nullFunc_vii, "nullFunc_iiii": nullFunc_iiii, "nullFunc_viii": nullFunc_viii, "nullFunc_v": nullFunc_v, "nullFunc_iii": nullFunc_iii, "nullFunc_viiii": nullFunc_viiii, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_glUseProgram": _glUseProgram, "_fread": _fread, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_glDeleteProgram": _glDeleteProgram, "_clCreateProgramWithSource": _clCreateProgramWithSource, "_glBindBuffer": _glBindBuffer, "_ftell": _ftell, "_sbrk": _sbrk, "_glBlendFunc": _glBlendFunc, "_glutReshapeWindow": _glutReshapeWindow, "_glDisableVertexAttribArray": _glDisableVertexAttribArray, "_glCreateShader": _glCreateShader, "_glutSwapBuffers": _glutSwapBuffers, "_sysconf": _sysconf, "_close": _close, "_rewind": _rewind, "_glTexCoord2i": _glTexCoord2i, "_clCreateCommandQueue": _clCreateCommandQueue, "_clCreateContextFromType": _clCreateContextFromType, "_write": _write, "_fsync": _fsync, "_glutSpecialFunc": _glutSpecialFunc, "_glShaderSource": _glShaderSource, "_glOrtho": _glOrtho, "_glutMotionFunc": _glutMotionFunc, "_glVertexPointer": _glVertexPointer, "_glGetBooleanv": _glGetBooleanv, "_glutCreateWindow": _glutCreateWindow, "_llvm_lifetime_end": _llvm_lifetime_end, "_glVertexAttribPointer": _glVertexAttribPointer, "_glHint": _glHint, "_send": _send, "_glutDisplayFunc": _glutDisplayFunc, "_glBegin": _glBegin, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "_glutInitDisplayMode": _glutInitDisplayMode, "_strtol": _strtol, "_glViewport": _glViewport, "___setErrNo": ___setErrNo, "_glutPostRedisplay": _glutPostRedisplay, "_clGetPlatformInfo": _clGetPlatformInfo, "_glutReshapeFunc": _glutReshapeFunc, "_glEnable": _glEnable, "_printf": _printf, "_glGenTextures": _glGenTextures, "_sprintf": _sprintf, "_glGetIntegerv": _glGetIntegerv, "_glGetString": _glGetString, "_glutMainLoop": _glutMainLoop, "_glPushMatrix": _glPushMatrix, "_emscripten_get_now": _emscripten_get_now, "_glAttachShader": _glAttachShader, "_read": _read, "_clSetKernelArg": _clSetKernelArg, "_fwrite": _fwrite, "_time": _time, "_glColor3f": _glColor3f, "_glDetachShader": _glDetachShader, "_glutInitWindowPosition": _glutInitWindowPosition, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "_clReleaseEvent": _clReleaseEvent, "_glColor4f": _glColor4f, "_lseek": _lseek, "_atoi": _atoi, "_glEnableClientState": _glEnableClientState, "_pwrite": _pwrite, "_open": _open, "_glClearColor": _glClearColor, "_glIsEnabled": _glIsEnabled, "_glBindTexture": _glBindTexture, "_snprintf": _snprintf, "___errno_location": ___errno_location, "_clGetPlatformIDs": _clGetPlatformIDs, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fseek": _fseek, "_glutMouseFunc": _glutMouseFunc, "__parseInt": __parseInt, "_glActiveTexture": _glActiveTexture, "_glGetFloatv": _glGetFloatv, "_clGetKernelWorkGroupInfo": _clGetKernelWorkGroupInfo, "_clCreateBuffer": _clCreateBuffer, "_glTexCoordPointer": _glTexCoordPointer, "_recv": _recv, "_glCompileShader": _glCompileShader, "_glEnableVertexAttribArray": _glEnableVertexAttribArray, "_abort": _abort, "_clBuildProgram": _clBuildProgram, "_glTexImage2D": _glTexImage2D, "_isspace": _isspace, "_fopen": _fopen, "_clGetContextInfo": _clGetContextInfo, "_clCreateKernel": _clCreateKernel, "_llvm_lifetime_start": _llvm_lifetime_start, "_fclose": _fclose, "_glutKeyboardFunc": _glutKeyboardFunc, "_glTexParameteri": _glTexParameteri, "_clEnqueueWriteBuffer": _clEnqueueWriteBuffer, "_glLinkProgram": _glLinkProgram, "_fprintf": _fprintf, "__reallyNegative": __reallyNegative, "_glutInitWindowSize": _glutInitWindowSize, "_glClear": _glClear, "_fileno": _fileno, "_glPopMatrix": _glPopMatrix, "_glMatrixMode": _glMatrixMode, "__exit": __exit, "_clWaitForEvents": _clWaitForEvents, "_glBindAttribLocation": _glBindAttribLocation, "_emscripten_glColor4f": _emscripten_glColor4f, "_glVertex3f": _glVertex3f, "_pread": _pread, "_mkport": _mkport, "_glEnd": _glEnd, "_clGetDeviceInfo": _clGetDeviceInfo, "_fflush": _fflush, "_exit": _exit, "_clReleaseMemObject": _clReleaseMemObject, "_glClientActiveTexture": _glClientActiveTexture, "_glutInit": _glutInit, "_glDisable": _glDisable, "_glLoadIdentity": _glLoadIdentity, "__formatString": __formatString, "_glTexSubImage2D": _glTexSubImage2D, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_glutBitmapHelvetica18": _glutBitmapHelvetica18, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

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



//@ sourceMappingURL=val_dav_mandelgpu.js.map