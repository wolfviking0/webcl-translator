
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
    var PACKAGE_NAME = '../build/osx_reduce.data';
    var REMOTE_PACKAGE_NAME = (Module['filePackagePrefixURL'] || '') + 'osx_reduce.data';
    var REMOTE_PACKAGE_SIZE = 43642;
    var PACKAGE_UUID = '78a0b707-d2bf-4199-bd2d-2036c8d8f1cf';
  
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
      new DataRequest(0, 6961, 0, 0).open('GET', '/reduce_float_kernel.cl');
    new DataRequest(6961, 14189, 0, 0).open('GET', '/reduce_float2_kernel.cl');
    new DataRequest(14189, 21875, 0, 0).open('GET', '/reduce_float4_kernel.cl');
    new DataRequest(21875, 28803, 0, 0).open('GET', '/reduce_int_kernel.cl');
    new DataRequest(28803, 35995, 0, 0).open('GET', '/reduce_int2_kernel.cl');
    new DataRequest(35995, 43642, 0, 0).open('GET', '/reduce_int4_kernel.cl');

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/reduce_float_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_float2_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_float4_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_int_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_int2_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_int4_kernel.cl"].onload();
          Module['removeRunDependency']('datafile_../build/osx_reduce.data');

    };
    Module['addRunDependency']('datafile_../build/osx_reduce.data');
  
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
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 52428800;
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

STATICTOP = STATIC_BASE + Runtime.alignMemory(2171);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([99,112,117,0,0,0,0,0,103,112,117,0,0,0,0,0,102,108,111,97,116,50,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,102,108,111,97,116,52,0,0,102,108,111,97,116,0,0,0,105,110,116,50,0,0,0,0,105,110,116,52,0,0,0,0,105,110,116,0,0,0,0,0,0,0,16,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,99,97,116,101,32,97,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,100,101,118,105,99,101,32,105,110,102,111,33,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,67,111,110,110,101,99,116,105,110,103,32,116,111,32,37,115,32,37,115,46,46,46,10,0,114,101,100,117,99,101,95,105,110,116,52,95,107,101,114,110,101,108,46,99,108,0,0,0,114,101,100,117,99,101,95,102,108,111,97,116,52,95,107,101,114,110,101,108,46,99,108,0,114,101,100,117,99,101,95,105,110,116,50,95,107,101,114,110,101,108,46,99,108,0,0,0,114,101,100,117,99,101,95,102,108,111,97,116,50,95,107,101,114,110,101,108,46,99,108,0,114,101,100,117,99,101,95,105,110,116,95,107,101,114,110,101,108,46,99,108,0,0,0,0,114,101,100,117,99,101,95,102,108,111,97,116,95,107,101,114,110,101,108,46,99,108,0,0,73,110,118,97,108,105,100,32,99,104,97,110,110,101,108,32,99,111,117,110,116,32,115,112,101,99,105,102,105,101,100,33,10,0,0,0,0,0,0,0,76,111,97,100,105,110,103,32,112,114,111,103,114,97,109,32,39,37,115,39,46,46,46,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,97,100,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,32,102,114,111,109,32,102,105,108,101,33,10,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,112,117,116,101,32,99,111,110,116,101,120,116,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,109,97,110,100,32,99,111,109,109,97,110,100,115,33,10,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,105,110,112,117,116,32,98,117,102,102,101,114,32,111,110,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,111,32,115,111,117,114,99,101,32,97,114,114,97,121,33,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,112,97,114,116,105,97,108,32,115,117,109,32,98,117,102,102,101,114,32,111,110,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,114,101,115,117,108,116,32,98,117,102,102,101,114,32,111,110,32,100,101,118,105,99,101,33,10,0,0,0,0,0,35,100,101,102,105,110,101,32,71,82,79,85,80,95,83,73,90,69,0,0,0,0,0,0,35,100,101,102,105,110,101,32,79,80,69,82,65,84,73,79,78,83,0,0,0,0,0,0,37,115,32,40,37,100,41,32,10,37,115,32,40,37,100,41,10,10,37,115,10,0,0,0,37,115,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,33,10,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,112,114,111,103,114,97,109,32,101,120,101,99,117,116,97,98,108,101,33,10,0,0,0,0,0,114,101,100,117,99,101,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,107,101,114,110,101,108,33,10,0,0,0,0,0,0,0,0,80,97,115,115,91,37,52,100,93,32,71,108,111,98,97,108,91,37,52,100,93,32,76,111,99,97,108,91,37,52,100,93,32,71,114,111,117,112,115,91,37,52,100,93,32,87,111,114,107,73,116,101,109,115,91,37,52,100,93,32,79,112,101,114,97,116,105,111,110,115,91,37,100,93,32,69,110,116,114,105,101,115,91,37,100,93,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,115,101,116,32,107,101,114,110,101,108,32,97,114,103,117,109,101,110,116,115,33,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,101,120,101,99,117,116,101,32,107,101,114,110,101,108,33,10,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,119,97,105,116,32,102,111,114,32,99,111,109,109,97,110,100,32,113,117,101,117,101,32,116,111,32,102,105,110,105,115,104,33,32,37,100,10,0,0,84,105,109,105,110,103,32,37,100,32,105,116,101,114,97,116,105,111,110,115,32,111,102,32,114,101,100,117,99,116,105,111,110,32,119,105,116,104,32,37,100,32,101,108,101,109,101,110,116,115,32,111,102,32,116,121,112,101,32,37,115,37,115,46,46,46,10,0,0,0,0,0,232,3,0,0,0,0,0,0,32,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,69,120,101,99,32,84,105,109,101,58,32,32,37,46,50,102,32,109,115,10,0,0,0,0,84,104,114,111,117,103,104,112,117,116,58,32,37,46,50,102,32,71,66,47,115,101,99,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,98,97,99,107,32,114,101,115,117,108,116,115,32,102,114,111,109,32,116,104,101,32,100,101,118,105,99,101,33,10,0,0,0,0,82,101,115,117,108,116,91,37,100,93,32,37,100,32,33,61,32,37,100,10,0,0,0,0,69,114,114,111,114,58,32,32,73,110,99,111,114,114,101,99,116,32,114,101,115,117,108,116,115,32,111,98,116,97,105,110,101,100,33,32,77,97,120,32,101,114,114,111,114,32,61,32,37,102,10,0,0,0,0,0,82,101,115,117,108,116,115,32,86,97,108,105,100,97,116,101,100,33,10,0,0,0,0,0,82,101,115,117,108,116,91,37,100,93,32,37,102,32,33,61,32,37,102,10,0,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




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

   
  Module["_memset"] = _memset;

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

  var _llvm_memset_p0i8_i32=_memset;

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
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
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

  var _fabs=Math_abs;

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
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
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
            var canvasContainer = canvas.parentNode;
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

  function _clCreateBuffer(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
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
  var _fabs=env._fabs;
  var _llvm_lifetime_start=env._llvm_lifetime_start;
  var _clReleaseProgram=env._clReleaseProgram;
  var _send=env._send;
  var _fread=env._fread;
  var _clReleaseKernel=env._clReleaseKernel;
  var _clReleaseContext=env._clReleaseContext;
  var ___setErrNo=env.___setErrNo;
  var _clEnqueueNDRangeKernel=env._clEnqueueNDRangeKernel;
  var _clCreateContext=env._clCreateContext;
  var _clEnqueueWriteBuffer=env._clEnqueueWriteBuffer;
  var _clCreateProgramWithSource=env._clCreateProgramWithSource;
  var _clGetProgramBuildInfo=env._clGetProgramBuildInfo;
  var _time=env._time;
  var _pwrite=env._pwrite;
  var _open=env._open;
  var _sbrk=env._sbrk;
  var _snprintf=env._snprintf;
  var _clReleaseMemObject=env._clReleaseMemObject;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var _pread=env._pread;
  var _read=env._read;
  var _sysconf=env._sysconf;
  var __formatString=env.__formatString;
  var _clFinish=env._clFinish;
  var _clCreateCommandQueue=env._clCreateCommandQueue;
  var _printf=env._printf;
  var _sprintf=env._sprintf;
  var __reallyNegative=env.__reallyNegative;
  var _clGetDeviceInfo=env._clGetDeviceInfo;
  var _write=env._write;
  var _fflush=env._fflush;
  var ___errno_location=env.___errno_location;
  var _clCreateBuffer=env._clCreateBuffer;
  var _stat=env._stat;
  var _recv=env._recv;
  var _clGetDeviceIDs=env._clGetDeviceIDs;
  var _mkport=env._mkport;
  var _clCreateKernel=env._clCreateKernel;
  var _clSetKernelArg=env._clSetKernelArg;
  var _abort=env._abort;
  var _fwrite=env._fwrite;
  var _emscripten_get_now=env._emscripten_get_now;
  var _clBuildProgram=env._clBuildProgram;
  var _fprintf=env._fprintf;
  var _clReleaseCommandQueue=env._clReleaseCommandQueue;
  var _llvm_lifetime_end=env._llvm_lifetime_end;
  var _fopen=env._fopen;
  var _clEnqueueReadBuffer=env._clEnqueueReadBuffer;
  var _strstr=env._strstr;
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

function _reduce_validate_float($data,$size,$result) {
 $data = $data|0;
 $size = $size|0;
 $result = $result|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0, $27 = 0.0;
 var $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0, $8 = 0, $9 = 0, $c = 0.0, $i = 0, $sum = 0.0, $t = 0.0, $y = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $1 = $data;
 $2 = $size;
 $3 = $result;
 $4 = $1;
 $5 = ($4);
 $6 = +HEAPF32[$5>>2];
 $sum = $6;
 $c = 0.0;
 $i = 1;
 while(1) {
  $7 = $i;
  $8 = $2;
  $9 = ($7|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = $1;
  $12 = (($11) + ($10<<2)|0);
  $13 = +HEAPF32[$12>>2];
  $14 = $c;
  $15 = $13 - $14;
  $y = $15;
  $16 = $sum;
  $17 = $y;
  $18 = $16 + $17;
  $t = $18;
  $19 = $t;
  $20 = $sum;
  $21 = $19 - $20;
  $22 = $y;
  $23 = $21 - $22;
  $c = $23;
  $24 = $t;
  $sum = $24;
  $25 = $i;
  $26 = (($25) + 1)|0;
  $i = $26;
 }
 $27 = $sum;
 $28 = $3;
 $29 = ($28);
 HEAPF32[$29>>2] = $27;
 STACKTOP = sp;return;
}
function _reduce_validate_float2($data,$size,$result) {
 $data = $data|0;
 $size = $size|0;
 $result = $result|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0.0, $25 = 0, $26 = 0.0, $27 = 0.0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0.0, $35 = 0, $36 = 0.0, $37 = 0.0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0.0, $42 = 0, $43 = 0.0, $44 = 0.0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0.0, $49 = 0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0, $53 = 0.0, $54 = 0, $55 = 0, $56 = 0.0, $57 = 0.0, $58 = 0, $59 = 0.0, $6 = 0, $60 = 0.0, $61 = 0, $62 = 0, $63 = 0.0;
 var $64 = 0, $65 = 0, $66 = 0.0, $67 = 0.0, $68 = 0, $69 = 0.0, $7 = 0.0, $70 = 0.0, $71 = 0, $72 = 0, $73 = 0.0, $74 = 0, $75 = 0, $76 = 0, $77 = 0.0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $9 = 0, $c = 0, $i = 0, $t = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56|0;
 $c = sp + 32|0;
 $y = sp + 40|0;
 $t = sp + 48|0;
 $1 = $data;
 $2 = $size;
 $3 = $result;
 $4 = $c;
 ;HEAP32[$4+0>>2]=0|0;HEAP32[$4+4>>2]=0|0;
 $5 = $1;
 $6 = ($5);
 $7 = +HEAPF32[$6>>2];
 $8 = $3;
 $9 = ($8);
 HEAPF32[$9>>2] = $7;
 $10 = $1;
 $11 = (($10) + 4|0);
 $12 = +HEAPF32[$11>>2];
 $13 = $3;
 $14 = (($13) + 4|0);
 HEAPF32[$14>>2] = $12;
 $i = 1;
 while(1) {
  $15 = $i;
  $16 = $2;
  $17 = ($15|0)<($16|0);
  if (!($17)) {
   break;
  }
  $18 = ($y);
  $19 = $i;
  $20 = $19<<1;
  $21 = (($20) + 0)|0;
  $22 = $1;
  $23 = (($22) + ($21<<2)|0);
  $24 = +HEAPF32[$23>>2];
  $25 = ($c);
  $26 = +HEAPF32[$25>>2];
  $27 = $24 - $26;
  HEAPF32[$18>>2] = $27;
  $28 = (($18) + 4|0);
  $29 = $i;
  $30 = $29<<1;
  $31 = (($30) + 1)|0;
  $32 = $1;
  $33 = (($32) + ($31<<2)|0);
  $34 = +HEAPF32[$33>>2];
  $35 = (($c) + 4|0);
  $36 = +HEAPF32[$35>>2];
  $37 = $34 - $36;
  HEAPF32[$28>>2] = $37;
  $38 = ($t);
  $39 = $3;
  $40 = ($39);
  $41 = +HEAPF32[$40>>2];
  $42 = ($y);
  $43 = +HEAPF32[$42>>2];
  $44 = $41 + $43;
  HEAPF32[$38>>2] = $44;
  $45 = (($38) + 4|0);
  $46 = $3;
  $47 = (($46) + 4|0);
  $48 = +HEAPF32[$47>>2];
  $49 = (($y) + 4|0);
  $50 = +HEAPF32[$49>>2];
  $51 = $48 + $50;
  HEAPF32[$45>>2] = $51;
  $52 = ($t);
  $53 = +HEAPF32[$52>>2];
  $54 = $3;
  $55 = ($54);
  $56 = +HEAPF32[$55>>2];
  $57 = $53 - $56;
  $58 = ($y);
  $59 = +HEAPF32[$58>>2];
  $60 = $57 - $59;
  $61 = ($c);
  HEAPF32[$61>>2] = $60;
  $62 = (($t) + 4|0);
  $63 = +HEAPF32[$62>>2];
  $64 = $3;
  $65 = (($64) + 4|0);
  $66 = +HEAPF32[$65>>2];
  $67 = $63 - $66;
  $68 = (($y) + 4|0);
  $69 = +HEAPF32[$68>>2];
  $70 = $67 - $69;
  $71 = (($c) + 4|0);
  HEAPF32[$71>>2] = $70;
  $72 = ($t);
  $73 = +HEAPF32[$72>>2];
  $74 = $3;
  $75 = ($74);
  HEAPF32[$75>>2] = $73;
  $76 = (($t) + 4|0);
  $77 = +HEAPF32[$76>>2];
  $78 = $3;
  $79 = (($78) + 4|0);
  HEAPF32[$79>>2] = $77;
  $80 = $i;
  $81 = (($80) + 1)|0;
  $i = $81;
 }
 STACKTOP = sp;return;
}
function _reduce_validate_float4($data,$size,$result) {
 $data = $data|0;
 $size = $size|0;
 $result = $result|0;
 var $1 = 0, $10 = 0, $100 = 0.0, $101 = 0.0, $102 = 0, $103 = 0.0, $104 = 0.0, $105 = 0, $106 = 0, $107 = 0.0, $108 = 0, $109 = 0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0, $113 = 0.0, $114 = 0.0, $115 = 0, $116 = 0;
 var $117 = 0.0, $118 = 0, $119 = 0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0, $123 = 0.0, $124 = 0.0, $125 = 0, $126 = 0, $127 = 0.0, $128 = 0, $129 = 0, $13 = 0, $130 = 0.0, $131 = 0.0, $132 = 0, $133 = 0.0, $134 = 0.0;
 var $135 = 0, $136 = 0, $137 = 0.0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0.0, $142 = 0, $143 = 0, $144 = 0, $145 = 0.0, $146 = 0, $147 = 0, $148 = 0, $149 = 0.0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $16 = 0, $17 = 0.0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0.0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0.0, $35 = 0, $36 = 0.0, $37 = 0.0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0.0, $45 = 0, $46 = 0.0, $47 = 0.0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0.0, $55 = 0, $56 = 0.0, $57 = 0.0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0.0, $65 = 0, $66 = 0.0, $67 = 0.0, $68 = 0, $69 = 0;
 var $7 = 0.0, $70 = 0, $71 = 0.0, $72 = 0, $73 = 0.0, $74 = 0.0, $75 = 0, $76 = 0, $77 = 0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0.0, $81 = 0.0, $82 = 0, $83 = 0, $84 = 0, $85 = 0.0, $86 = 0, $87 = 0.0;
 var $88 = 0.0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0.0, $93 = 0, $94 = 0.0, $95 = 0.0, $96 = 0, $97 = 0.0, $98 = 0, $99 = 0, $c = 0, $i = 0, $t = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $c = sp + 32|0;
 $y = sp + 48|0;
 $t = sp + 64|0;
 $1 = $data;
 $2 = $size;
 $3 = $result;
 $4 = $c;
 ;HEAP32[$4+0>>2]=0|0;HEAP32[$4+4>>2]=0|0;HEAP32[$4+8>>2]=0|0;HEAP32[$4+12>>2]=0|0;
 $5 = $1;
 $6 = ($5);
 $7 = +HEAPF32[$6>>2];
 $8 = $3;
 $9 = ($8);
 HEAPF32[$9>>2] = $7;
 $10 = $1;
 $11 = (($10) + 4|0);
 $12 = +HEAPF32[$11>>2];
 $13 = $3;
 $14 = (($13) + 4|0);
 HEAPF32[$14>>2] = $12;
 $15 = $1;
 $16 = (($15) + 8|0);
 $17 = +HEAPF32[$16>>2];
 $18 = $3;
 $19 = (($18) + 8|0);
 HEAPF32[$19>>2] = $17;
 $20 = $1;
 $21 = (($20) + 12|0);
 $22 = +HEAPF32[$21>>2];
 $23 = $3;
 $24 = (($23) + 12|0);
 HEAPF32[$24>>2] = $22;
 $i = 1;
 while(1) {
  $25 = $i;
  $26 = $2;
  $27 = ($25|0)<($26|0);
  if (!($27)) {
   break;
  }
  $28 = ($y);
  $29 = $i;
  $30 = $29<<2;
  $31 = (($30) + 0)|0;
  $32 = $1;
  $33 = (($32) + ($31<<2)|0);
  $34 = +HEAPF32[$33>>2];
  $35 = ($c);
  $36 = +HEAPF32[$35>>2];
  $37 = $34 - $36;
  HEAPF32[$28>>2] = $37;
  $38 = (($28) + 4|0);
  $39 = $i;
  $40 = $39<<2;
  $41 = (($40) + 1)|0;
  $42 = $1;
  $43 = (($42) + ($41<<2)|0);
  $44 = +HEAPF32[$43>>2];
  $45 = (($c) + 4|0);
  $46 = +HEAPF32[$45>>2];
  $47 = $44 - $46;
  HEAPF32[$38>>2] = $47;
  $48 = (($38) + 4|0);
  $49 = $i;
  $50 = $49<<2;
  $51 = (($50) + 2)|0;
  $52 = $1;
  $53 = (($52) + ($51<<2)|0);
  $54 = +HEAPF32[$53>>2];
  $55 = (($c) + 8|0);
  $56 = +HEAPF32[$55>>2];
  $57 = $54 - $56;
  HEAPF32[$48>>2] = $57;
  $58 = (($48) + 4|0);
  $59 = $i;
  $60 = $59<<2;
  $61 = (($60) + 3)|0;
  $62 = $1;
  $63 = (($62) + ($61<<2)|0);
  $64 = +HEAPF32[$63>>2];
  $65 = (($c) + 12|0);
  $66 = +HEAPF32[$65>>2];
  $67 = $64 - $66;
  HEAPF32[$58>>2] = $67;
  $68 = ($t);
  $69 = $3;
  $70 = ($69);
  $71 = +HEAPF32[$70>>2];
  $72 = ($y);
  $73 = +HEAPF32[$72>>2];
  $74 = $71 + $73;
  HEAPF32[$68>>2] = $74;
  $75 = (($68) + 4|0);
  $76 = $3;
  $77 = (($76) + 4|0);
  $78 = +HEAPF32[$77>>2];
  $79 = (($y) + 4|0);
  $80 = +HEAPF32[$79>>2];
  $81 = $78 + $80;
  HEAPF32[$75>>2] = $81;
  $82 = (($75) + 4|0);
  $83 = $3;
  $84 = (($83) + 8|0);
  $85 = +HEAPF32[$84>>2];
  $86 = (($y) + 8|0);
  $87 = +HEAPF32[$86>>2];
  $88 = $85 + $87;
  HEAPF32[$82>>2] = $88;
  $89 = (($82) + 4|0);
  $90 = $3;
  $91 = (($90) + 12|0);
  $92 = +HEAPF32[$91>>2];
  $93 = (($y) + 12|0);
  $94 = +HEAPF32[$93>>2];
  $95 = $92 + $94;
  HEAPF32[$89>>2] = $95;
  $96 = ($t);
  $97 = +HEAPF32[$96>>2];
  $98 = $3;
  $99 = ($98);
  $100 = +HEAPF32[$99>>2];
  $101 = $97 - $100;
  $102 = ($y);
  $103 = +HEAPF32[$102>>2];
  $104 = $101 - $103;
  $105 = ($c);
  HEAPF32[$105>>2] = $104;
  $106 = (($t) + 4|0);
  $107 = +HEAPF32[$106>>2];
  $108 = $3;
  $109 = (($108) + 4|0);
  $110 = +HEAPF32[$109>>2];
  $111 = $107 - $110;
  $112 = (($y) + 4|0);
  $113 = +HEAPF32[$112>>2];
  $114 = $111 - $113;
  $115 = (($c) + 4|0);
  HEAPF32[$115>>2] = $114;
  $116 = (($t) + 8|0);
  $117 = +HEAPF32[$116>>2];
  $118 = $3;
  $119 = (($118) + 8|0);
  $120 = +HEAPF32[$119>>2];
  $121 = $117 - $120;
  $122 = (($y) + 8|0);
  $123 = +HEAPF32[$122>>2];
  $124 = $121 - $123;
  $125 = (($c) + 8|0);
  HEAPF32[$125>>2] = $124;
  $126 = (($t) + 12|0);
  $127 = +HEAPF32[$126>>2];
  $128 = $3;
  $129 = (($128) + 12|0);
  $130 = +HEAPF32[$129>>2];
  $131 = $127 - $130;
  $132 = (($y) + 12|0);
  $133 = +HEAPF32[$132>>2];
  $134 = $131 - $133;
  $135 = (($c) + 12|0);
  HEAPF32[$135>>2] = $134;
  $136 = ($t);
  $137 = +HEAPF32[$136>>2];
  $138 = $3;
  $139 = ($138);
  HEAPF32[$139>>2] = $137;
  $140 = (($t) + 4|0);
  $141 = +HEAPF32[$140>>2];
  $142 = $3;
  $143 = (($142) + 4|0);
  HEAPF32[$143>>2] = $141;
  $144 = (($t) + 8|0);
  $145 = +HEAPF32[$144>>2];
  $146 = $3;
  $147 = (($146) + 8|0);
  HEAPF32[$147>>2] = $145;
  $148 = (($t) + 12|0);
  $149 = +HEAPF32[$148>>2];
  $150 = $3;
  $151 = (($150) + 12|0);
  HEAPF32[$151>>2] = $149;
  $152 = $i;
  $153 = (($152) + 1)|0;
  $i = $153;
 }
 STACKTOP = sp;return;
}
function _reduce_validate_int($data,$size,$result) {
 $data = $data|0;
 $size = $size|0;
 $result = $result|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c = 0, $i = 0, $sum = 0, $t = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $1 = $data;
 $2 = $size;
 $3 = $result;
 $4 = $1;
 $5 = ($4);
 $6 = HEAP32[$5>>2]|0;
 $sum = $6;
 $c = 0;
 $i = 1;
 while(1) {
  $7 = $i;
  $8 = $2;
  $9 = ($7|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = $1;
  $12 = (($11) + ($10<<2)|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = $c;
  $15 = (($13) - ($14))|0;
  $y = $15;
  $16 = $sum;
  $17 = $y;
  $18 = (($16) + ($17))|0;
  $t = $18;
  $19 = $t;
  $20 = $sum;
  $21 = (($19) - ($20))|0;
  $22 = $y;
  $23 = (($21) - ($22))|0;
  $c = $23;
  $24 = $t;
  $sum = $24;
  $25 = $i;
  $26 = (($25) + 1)|0;
  $i = $26;
 }
 $27 = $sum;
 $28 = $3;
 $29 = ($28);
 HEAP32[$29>>2] = $27;
 STACKTOP = sp;return;
}
function _reduce_validate_int2($data,$size,$result) {
 $data = $data|0;
 $size = $size|0;
 $result = $result|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $9 = 0, $c = 0, $i = 0, $t = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56|0;
 $c = sp + 32|0;
 $y = sp + 40|0;
 $t = sp + 48|0;
 $1 = $data;
 $2 = $size;
 $3 = $result;
 $4 = $c;
 ;HEAP32[$4+0>>2]=0|0;HEAP32[$4+4>>2]=0|0;
 $5 = $1;
 $6 = ($5);
 $7 = HEAP32[$6>>2]|0;
 $8 = $3;
 $9 = ($8);
 HEAP32[$9>>2] = $7;
 $10 = $1;
 $11 = (($10) + 4|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $3;
 $14 = (($13) + 4|0);
 HEAP32[$14>>2] = $12;
 $i = 1;
 while(1) {
  $15 = $i;
  $16 = $2;
  $17 = ($15|0)<($16|0);
  if (!($17)) {
   break;
  }
  $18 = ($y);
  $19 = $i;
  $20 = $19<<1;
  $21 = (($20) + 0)|0;
  $22 = $1;
  $23 = (($22) + ($21<<2)|0);
  $24 = HEAP32[$23>>2]|0;
  $25 = ($c);
  $26 = HEAP32[$25>>2]|0;
  $27 = (($24) - ($26))|0;
  HEAP32[$18>>2] = $27;
  $28 = (($18) + 4|0);
  $29 = $i;
  $30 = $29<<1;
  $31 = (($30) + 1)|0;
  $32 = $1;
  $33 = (($32) + ($31<<2)|0);
  $34 = HEAP32[$33>>2]|0;
  $35 = (($c) + 4|0);
  $36 = HEAP32[$35>>2]|0;
  $37 = (($34) - ($36))|0;
  HEAP32[$28>>2] = $37;
  $38 = ($t);
  $39 = $3;
  $40 = ($39);
  $41 = HEAP32[$40>>2]|0;
  $42 = ($y);
  $43 = HEAP32[$42>>2]|0;
  $44 = (($41) + ($43))|0;
  HEAP32[$38>>2] = $44;
  $45 = (($38) + 4|0);
  $46 = $3;
  $47 = (($46) + 4|0);
  $48 = HEAP32[$47>>2]|0;
  $49 = (($y) + 4|0);
  $50 = HEAP32[$49>>2]|0;
  $51 = (($48) + ($50))|0;
  HEAP32[$45>>2] = $51;
  $52 = ($t);
  $53 = HEAP32[$52>>2]|0;
  $54 = $3;
  $55 = ($54);
  $56 = HEAP32[$55>>2]|0;
  $57 = (($53) - ($56))|0;
  $58 = ($y);
  $59 = HEAP32[$58>>2]|0;
  $60 = (($57) - ($59))|0;
  $61 = ($c);
  HEAP32[$61>>2] = $60;
  $62 = (($t) + 4|0);
  $63 = HEAP32[$62>>2]|0;
  $64 = $3;
  $65 = (($64) + 4|0);
  $66 = HEAP32[$65>>2]|0;
  $67 = (($63) - ($66))|0;
  $68 = (($y) + 4|0);
  $69 = HEAP32[$68>>2]|0;
  $70 = (($67) - ($69))|0;
  $71 = (($c) + 4|0);
  HEAP32[$71>>2] = $70;
  $72 = ($t);
  $73 = HEAP32[$72>>2]|0;
  $74 = $3;
  $75 = ($74);
  HEAP32[$75>>2] = $73;
  $76 = (($t) + 4|0);
  $77 = HEAP32[$76>>2]|0;
  $78 = $3;
  $79 = (($78) + 4|0);
  HEAP32[$79>>2] = $77;
  $80 = $i;
  $81 = (($80) + 1)|0;
  $i = $81;
 }
 STACKTOP = sp;return;
}
function _reduce_validate_int4($data,$size,$result) {
 $data = $data|0;
 $size = $size|0;
 $result = $result|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $c = 0, $i = 0, $t = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $c = sp + 32|0;
 $y = sp + 48|0;
 $t = sp + 64|0;
 $1 = $data;
 $2 = $size;
 $3 = $result;
 $4 = $c;
 ;HEAP32[$4+0>>2]=0|0;HEAP32[$4+4>>2]=0|0;HEAP32[$4+8>>2]=0|0;HEAP32[$4+12>>2]=0|0;
 $5 = $1;
 $6 = ($5);
 $7 = HEAP32[$6>>2]|0;
 $8 = $3;
 $9 = ($8);
 HEAP32[$9>>2] = $7;
 $10 = $1;
 $11 = (($10) + 4|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $3;
 $14 = (($13) + 4|0);
 HEAP32[$14>>2] = $12;
 $15 = $1;
 $16 = (($15) + 8|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = $3;
 $19 = (($18) + 8|0);
 HEAP32[$19>>2] = $17;
 $20 = $1;
 $21 = (($20) + 12|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = $3;
 $24 = (($23) + 12|0);
 HEAP32[$24>>2] = $22;
 $i = 1;
 while(1) {
  $25 = $i;
  $26 = $2;
  $27 = ($25|0)<($26|0);
  if (!($27)) {
   break;
  }
  $28 = ($y);
  $29 = $i;
  $30 = $29<<2;
  $31 = (($30) + 0)|0;
  $32 = $1;
  $33 = (($32) + ($31<<2)|0);
  $34 = HEAP32[$33>>2]|0;
  $35 = ($c);
  $36 = HEAP32[$35>>2]|0;
  $37 = (($34) - ($36))|0;
  HEAP32[$28>>2] = $37;
  $38 = (($28) + 4|0);
  $39 = $i;
  $40 = $39<<2;
  $41 = (($40) + 1)|0;
  $42 = $1;
  $43 = (($42) + ($41<<2)|0);
  $44 = HEAP32[$43>>2]|0;
  $45 = (($c) + 4|0);
  $46 = HEAP32[$45>>2]|0;
  $47 = (($44) - ($46))|0;
  HEAP32[$38>>2] = $47;
  $48 = (($38) + 4|0);
  $49 = $i;
  $50 = $49<<2;
  $51 = (($50) + 2)|0;
  $52 = $1;
  $53 = (($52) + ($51<<2)|0);
  $54 = HEAP32[$53>>2]|0;
  $55 = (($c) + 8|0);
  $56 = HEAP32[$55>>2]|0;
  $57 = (($54) - ($56))|0;
  HEAP32[$48>>2] = $57;
  $58 = (($48) + 4|0);
  $59 = $i;
  $60 = $59<<2;
  $61 = (($60) + 3)|0;
  $62 = $1;
  $63 = (($62) + ($61<<2)|0);
  $64 = HEAP32[$63>>2]|0;
  $65 = (($c) + 12|0);
  $66 = HEAP32[$65>>2]|0;
  $67 = (($64) - ($66))|0;
  HEAP32[$58>>2] = $67;
  $68 = ($t);
  $69 = $3;
  $70 = ($69);
  $71 = HEAP32[$70>>2]|0;
  $72 = ($y);
  $73 = HEAP32[$72>>2]|0;
  $74 = (($71) + ($73))|0;
  HEAP32[$68>>2] = $74;
  $75 = (($68) + 4|0);
  $76 = $3;
  $77 = (($76) + 4|0);
  $78 = HEAP32[$77>>2]|0;
  $79 = (($y) + 4|0);
  $80 = HEAP32[$79>>2]|0;
  $81 = (($78) + ($80))|0;
  HEAP32[$75>>2] = $81;
  $82 = (($75) + 4|0);
  $83 = $3;
  $84 = (($83) + 8|0);
  $85 = HEAP32[$84>>2]|0;
  $86 = (($y) + 8|0);
  $87 = HEAP32[$86>>2]|0;
  $88 = (($85) + ($87))|0;
  HEAP32[$82>>2] = $88;
  $89 = (($82) + 4|0);
  $90 = $3;
  $91 = (($90) + 12|0);
  $92 = HEAP32[$91>>2]|0;
  $93 = (($y) + 12|0);
  $94 = HEAP32[$93>>2]|0;
  $95 = (($92) + ($94))|0;
  HEAP32[$89>>2] = $95;
  $96 = ($t);
  $97 = HEAP32[$96>>2]|0;
  $98 = $3;
  $99 = ($98);
  $100 = HEAP32[$99>>2]|0;
  $101 = (($97) - ($100))|0;
  $102 = ($y);
  $103 = HEAP32[$102>>2]|0;
  $104 = (($101) - ($103))|0;
  $105 = ($c);
  HEAP32[$105>>2] = $104;
  $106 = (($t) + 4|0);
  $107 = HEAP32[$106>>2]|0;
  $108 = $3;
  $109 = (($108) + 4|0);
  $110 = HEAP32[$109>>2]|0;
  $111 = (($107) - ($110))|0;
  $112 = (($y) + 4|0);
  $113 = HEAP32[$112>>2]|0;
  $114 = (($111) - ($113))|0;
  $115 = (($c) + 4|0);
  HEAP32[$115>>2] = $114;
  $116 = (($t) + 8|0);
  $117 = HEAP32[$116>>2]|0;
  $118 = $3;
  $119 = (($118) + 8|0);
  $120 = HEAP32[$119>>2]|0;
  $121 = (($117) - ($120))|0;
  $122 = (($y) + 8|0);
  $123 = HEAP32[$122>>2]|0;
  $124 = (($121) - ($123))|0;
  $125 = (($c) + 8|0);
  HEAP32[$125>>2] = $124;
  $126 = (($t) + 12|0);
  $127 = HEAP32[$126>>2]|0;
  $128 = $3;
  $129 = (($128) + 12|0);
  $130 = HEAP32[$129>>2]|0;
  $131 = (($127) - ($130))|0;
  $132 = (($y) + 12|0);
  $133 = HEAP32[$132>>2]|0;
  $134 = (($131) - ($133))|0;
  $135 = (($c) + 12|0);
  HEAP32[$135>>2] = $134;
  $136 = ($t);
  $137 = HEAP32[$136>>2]|0;
  $138 = $3;
  $139 = ($138);
  HEAP32[$139>>2] = $137;
  $140 = (($t) + 4|0);
  $141 = HEAP32[$140>>2]|0;
  $142 = $3;
  $143 = (($142) + 4|0);
  HEAP32[$143>>2] = $141;
  $144 = (($t) + 8|0);
  $145 = HEAP32[$144>>2]|0;
  $146 = $3;
  $147 = (($146) + 8|0);
  HEAP32[$147>>2] = $145;
  $148 = (($t) + 12|0);
  $149 = HEAP32[$148>>2]|0;
  $150 = $3;
  $151 = (($150) + 12|0);
  HEAP32[$151>>2] = $149;
  $152 = $i;
  $153 = (($152) + 1)|0;
  $i = $153;
 }
 STACKTOP = sp;return;
}
function _create_reduction_pass_counts($count,$max_group_size,$max_groups,$max_work_items,$pass_count,$group_counts,$work_item_counts,$operation_counts,$entry_counts) {
 $count = $count|0;
 $max_group_size = $max_group_size|0;
 $max_groups = $max_groups|0;
 $max_work_items = $max_work_items|0;
 $pass_count = $pass_count|0;
 $group_counts = $group_counts|0;
 $work_item_counts = $work_item_counts|0;
 $operation_counts = $operation_counts|0;
 $entry_counts = $entry_counts|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $groups = 0, $groups3 = 0, $level = 0, $max_levels = 0, $s = 0, $work_items = 0, $work_items1 = 0;
 var $work_items2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 136|0;
 $1 = $count;
 $2 = $max_group_size;
 $3 = $max_groups;
 $4 = $max_work_items;
 $5 = $pass_count;
 $6 = $group_counts;
 $7 = $work_item_counts;
 $8 = $operation_counts;
 $9 = $entry_counts;
 $10 = $1;
 $11 = $4;
 $12 = $11<<1;
 $13 = ($10|0)<($12|0);
 if ($13) {
  $14 = $1;
  $15 = (($14|0) / 2)&-1;
  $17 = $15;
 } else {
  $16 = $4;
  $17 = $16;
 }
 $work_items = $17;
 $18 = $1;
 $19 = ($18|0)<(1);
 if ($19) {
  $work_items = 1;
 }
 $20 = $1;
 $21 = $work_items;
 $22 = $21<<1;
 $23 = (($20|0) / ($22|0))&-1;
 $groups = $23;
 $24 = $3;
 $25 = $groups;
 $26 = ($24|0)<($25|0);
 if ($26) {
  $27 = $3;
  $29 = $27;
 } else {
  $28 = $groups;
  $29 = $28;
 }
 $groups = $29;
 $max_levels = 1;
 $30 = $groups;
 $s = $30;
 while(1) {
  $31 = $s;
  $32 = ($31|0)>(1);
  if (!($32)) {
   break;
  }
  $33 = $s;
  $34 = $4;
  $35 = $34<<1;
  $36 = ($33|0)<($35|0);
  if ($36) {
   $37 = $s;
   $38 = (($37|0) / 2)&-1;
   $40 = $38;
  } else {
   $39 = $4;
   $40 = $39;
  }
  $work_items1 = $40;
  $41 = $s;
  $42 = $work_items1;
  $43 = $42<<1;
  $44 = (($41|0) / ($43|0))&-1;
  $s = $44;
  $45 = $max_levels;
  $46 = (($45) + 1)|0;
  $max_levels = $46;
 }
 $47 = $max_levels;
 $48 = $47<<2;
 $49 = (_malloc($48)|0);
 $50 = $49;
 $51 = $6;
 HEAP32[$51>>2] = $50;
 $52 = $max_levels;
 $53 = $52<<2;
 $54 = (_malloc($53)|0);
 $55 = $54;
 $56 = $7;
 HEAP32[$56>>2] = $55;
 $57 = $max_levels;
 $58 = $57<<2;
 $59 = (_malloc($58)|0);
 $60 = $59;
 $61 = $8;
 HEAP32[$61>>2] = $60;
 $62 = $max_levels;
 $63 = $62<<2;
 $64 = (_malloc($63)|0);
 $65 = $64;
 $66 = $9;
 HEAP32[$66>>2] = $65;
 $67 = $max_levels;
 $68 = $5;
 HEAP32[$68>>2] = $67;
 $69 = $groups;
 $70 = $6;
 $71 = HEAP32[$70>>2]|0;
 $72 = ($71);
 HEAP32[$72>>2] = $69;
 $73 = $work_items;
 $74 = $7;
 $75 = HEAP32[$74>>2]|0;
 $76 = ($75);
 HEAP32[$76>>2] = $73;
 $77 = $8;
 $78 = HEAP32[$77>>2]|0;
 $79 = ($78);
 HEAP32[$79>>2] = 1;
 $80 = $1;
 $81 = $9;
 $82 = HEAP32[$81>>2]|0;
 $83 = ($82);
 HEAP32[$83>>2] = $80;
 $84 = $2;
 $85 = $work_items;
 $86 = ($84|0)<($85|0);
 if ($86) {
  $87 = $work_items;
  $88 = $8;
  $89 = HEAP32[$88>>2]|0;
  $90 = ($89);
  HEAP32[$90>>2] = $87;
  $91 = $2;
  $92 = $7;
  $93 = HEAP32[$92>>2]|0;
  $94 = ($93);
  HEAP32[$94>>2] = $91;
 }
 $95 = $groups;
 $s = $95;
 $level = 1;
 while(1) {
  $96 = $s;
  $97 = ($96|0)>(1);
  if (!($97)) {
   break;
  }
  $98 = $s;
  $99 = $4;
  $100 = $99<<1;
  $101 = ($98|0)<($100|0);
  if ($101) {
   $102 = $s;
   $103 = (($102|0) / 2)&-1;
   $105 = $103;
  } else {
   $104 = $4;
   $105 = $104;
  }
  $work_items2 = $105;
  $106 = $s;
  $107 = $work_items2;
  $108 = $107<<1;
  $109 = (($106|0) / ($108|0))&-1;
  $groups3 = $109;
  $110 = $3;
  $111 = $groups3;
  $112 = ($110|0)<($111|0);
  if ($112) {
   $113 = $3;
   $115 = $113;
  } else {
   $114 = $groups3;
   $115 = $114;
  }
  $groups3 = $115;
  $116 = $groups3;
  $117 = $level;
  $118 = $6;
  $119 = HEAP32[$118>>2]|0;
  $120 = (($119) + ($117<<2)|0);
  HEAP32[$120>>2] = $116;
  $121 = $work_items2;
  $122 = $level;
  $123 = $7;
  $124 = HEAP32[$123>>2]|0;
  $125 = (($124) + ($122<<2)|0);
  HEAP32[$125>>2] = $121;
  $126 = $level;
  $127 = $8;
  $128 = HEAP32[$127>>2]|0;
  $129 = (($128) + ($126<<2)|0);
  HEAP32[$129>>2] = 1;
  $130 = $s;
  $131 = $level;
  $132 = $9;
  $133 = HEAP32[$132>>2]|0;
  $134 = (($133) + ($131<<2)|0);
  HEAP32[$134>>2] = $130;
  $135 = $2;
  $136 = $work_items2;
  $137 = ($135|0)<($136|0);
  if ($137) {
   $138 = $work_items2;
   $139 = $level;
   $140 = $8;
   $141 = HEAP32[$140>>2]|0;
   $142 = (($141) + ($139<<2)|0);
   HEAP32[$142>>2] = $138;
   $143 = $2;
   $144 = $level;
   $145 = $7;
   $146 = HEAP32[$145>>2]|0;
   $147 = (($146) + ($144<<2)|0);
   HEAP32[$147>>2] = $143;
  }
  $148 = $s;
  $149 = $work_items2;
  $150 = $149<<1;
  $151 = (($148|0) / ($150|0))&-1;
  $s = $151;
  $152 = $level;
  $153 = (($152) + 1)|0;
  $level = $153;
 }
 STACKTOP = sp;return;
}
function _main($argc,$argv) {
 $argc = $argc|0;
 $argv = $argv|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0;
 var $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0;
 var $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0;
 var $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0.0;
 var $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0;
 var $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0;
 var $423 = 0, $424 = 0.0, $425 = 0.0, $426 = 0.0, $427 = 0.0, $428 = 0.0, $429 = 0.0, $43 = 0, $430 = 0.0, $431 = 0, $432 = 0.0, $433 = 0.0, $434 = 0, $435 = 0.0, $436 = 0.0, $437 = 0, $438 = 0.0, $439 = 0.0, $44 = 0, $440 = 0.0;
 var $441 = 0.0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0;
 var $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0;
 var $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0;
 var $496 = 0, $497 = 0, $498 = 0.0, $499 = 0.0, $5 = 0, $50 = 0, $500 = 0.0, $501 = 0.0, $502 = 0.0, $503 = 0, $504 = 0.0, $505 = 0.0, $506 = 0.0, $507 = 0, $508 = 0, $509 = 0.0, $51 = 0, $510 = 0.0, $511 = 0, $512 = 0;
 var $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0.0, $525 = 0.0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0;
 var $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0.0, $546 = 0.0, $547 = 0, $548 = 0, $549 = 0.0;
 var $55 = 0, $550 = 0.0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0.0, $559 = 0, $56 = 0, $560 = 0, $561 = 0.0, $562 = 0.0, $563 = 0.0, $564 = 0.0, $565 = 0.0, $566 = 0.0, $567 = 0.0;
 var $568 = 0, $569 = 0.0, $57 = 0, $570 = 0.0, $571 = 0.0, $572 = 0, $573 = 0, $574 = 0.0, $575 = 0.0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0.0, $584 = 0.0, $585 = 0;
 var $586 = 0, $587 = 0.0, $588 = 0.0, $589 = 0, $59 = 0, $590 = 0, $591 = 0.0, $592 = 0.0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0;
 var $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0;
 var $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0.0, $84 = 0.0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0.0, $92 = 0.0, $93 = 0;
 var $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $block_source = 0, $buffer_size = 0, $build_log = 0, $c = 0, $commands = 0, $computed_result = 0, $context = 0, $device_id = 0, $device_name = 0, $diff = 0.0, $diff7 = 0.0, $entries = 0, $entry_counts = 0, $err = 0;
 var $error = 0.0, $error6 = 0.0, $filename = 0, $float_data = 0, $global = 0, $global1 = 0, $group_counts = 0, $i = 0, $input_buffer = 0, $input_data = 0, $integer_data = 0, $k = 0, $kernels = 0, $length = 0, $local = 0, $local2 = 0, $max_workgroup_size = 0, $operation_counts = 0, $operations = 0, $output_buffer = 0;
 var $partials_buffer = 0, $pass_count = 0, $pass_input = 0, $pass_output = 0, $pass_swap = 0, $programs = 0, $reference = 0, $reference3 = 0, $result = 0, $result4 = 0, $returned_size = 0, $shared_size = 0, $source = 0, $source_length = 0, $t = 0.0, $t1 = 0.0, $t2 = 0.0, $typesize = 0, $use_gpu = 0, $v = 0;
 var $v5 = 0.0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer103 = 0, $vararg_buffer106 = 0, $vararg_buffer108 = 0, $vararg_buffer110 = 0, $vararg_buffer112 = 0, $vararg_buffer117 = 0, $vararg_buffer12 = 0, $vararg_buffer120 = 0, $vararg_buffer122 = 0, $vararg_buffer14 = 0, $vararg_buffer17 = 0, $vararg_buffer19 = 0, $vararg_buffer21 = 0, $vararg_buffer23 = 0, $vararg_buffer25 = 0, $vararg_buffer27 = 0;
 var $vararg_buffer29 = 0, $vararg_buffer3 = 0, $vararg_buffer31 = 0, $vararg_buffer33 = 0, $vararg_buffer40 = 0, $vararg_buffer43 = 0, $vararg_buffer45 = 0, $vararg_buffer48 = 0, $vararg_buffer5 = 0, $vararg_buffer50 = 0, $vararg_buffer53 = 0, $vararg_buffer55 = 0, $vararg_buffer64 = 0, $vararg_buffer66 = 0, $vararg_buffer68 = 0, $vararg_buffer7 = 0, $vararg_buffer71 = 0, $vararg_buffer73 = 0, $vararg_buffer79 = 0, $vararg_buffer81 = 0;
 var $vararg_buffer83 = 0, $vararg_buffer86 = 0, $vararg_buffer89 = 0, $vararg_buffer92 = 0, $vararg_buffer94 = 0, $vararg_buffer96 = 0, $vararg_buffer98 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast104 = 0, $vararg_lifetime_bitcast107 = 0, $vararg_lifetime_bitcast109 = 0, $vararg_lifetime_bitcast11 = 0, $vararg_lifetime_bitcast111 = 0, $vararg_lifetime_bitcast113 = 0, $vararg_lifetime_bitcast118 = 0, $vararg_lifetime_bitcast121 = 0, $vararg_lifetime_bitcast123 = 0, $vararg_lifetime_bitcast13 = 0, $vararg_lifetime_bitcast15 = 0, $vararg_lifetime_bitcast18 = 0;
 var $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast20 = 0, $vararg_lifetime_bitcast22 = 0, $vararg_lifetime_bitcast24 = 0, $vararg_lifetime_bitcast26 = 0, $vararg_lifetime_bitcast28 = 0, $vararg_lifetime_bitcast30 = 0, $vararg_lifetime_bitcast32 = 0, $vararg_lifetime_bitcast34 = 0, $vararg_lifetime_bitcast4 = 0, $vararg_lifetime_bitcast41 = 0, $vararg_lifetime_bitcast44 = 0, $vararg_lifetime_bitcast46 = 0, $vararg_lifetime_bitcast49 = 0, $vararg_lifetime_bitcast51 = 0, $vararg_lifetime_bitcast54 = 0, $vararg_lifetime_bitcast56 = 0, $vararg_lifetime_bitcast6 = 0, $vararg_lifetime_bitcast65 = 0, $vararg_lifetime_bitcast67 = 0;
 var $vararg_lifetime_bitcast69 = 0, $vararg_lifetime_bitcast72 = 0, $vararg_lifetime_bitcast74 = 0, $vararg_lifetime_bitcast8 = 0, $vararg_lifetime_bitcast80 = 0, $vararg_lifetime_bitcast82 = 0, $vararg_lifetime_bitcast84 = 0, $vararg_lifetime_bitcast87 = 0, $vararg_lifetime_bitcast90 = 0, $vararg_lifetime_bitcast93 = 0, $vararg_lifetime_bitcast95 = 0, $vararg_lifetime_bitcast97 = 0, $vararg_lifetime_bitcast99 = 0, $vararg_ptr = 0, $vararg_ptr100 = 0, $vararg_ptr101 = 0, $vararg_ptr102 = 0, $vararg_ptr105 = 0, $vararg_ptr114 = 0, $vararg_ptr115 = 0;
 var $vararg_ptr116 = 0, $vararg_ptr119 = 0, $vararg_ptr16 = 0, $vararg_ptr35 = 0, $vararg_ptr36 = 0, $vararg_ptr37 = 0, $vararg_ptr38 = 0, $vararg_ptr39 = 0, $vararg_ptr42 = 0, $vararg_ptr47 = 0, $vararg_ptr52 = 0, $vararg_ptr57 = 0, $vararg_ptr58 = 0, $vararg_ptr59 = 0, $vararg_ptr60 = 0, $vararg_ptr61 = 0, $vararg_ptr62 = 0, $vararg_ptr63 = 0, $vararg_ptr70 = 0, $vararg_ptr75 = 0;
 var $vararg_ptr76 = 0, $vararg_ptr77 = 0, $vararg_ptr78 = 0, $vararg_ptr85 = 0, $vararg_ptr88 = 0, $vararg_ptr9 = 0, $vararg_ptr91 = 0, $vendor_name = 0, $work_item_counts = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $vararg_buffer122 = sp;
 $vararg_lifetime_bitcast123 = $vararg_buffer122;
 $vararg_buffer120 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast121 = $vararg_buffer120;
 $vararg_buffer117 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast118 = $vararg_buffer117;
 $vararg_buffer112 = STACKTOP; STACKTOP = STACKTOP + 24|0;
 $vararg_lifetime_bitcast113 = $vararg_buffer112;
 $vararg_buffer110 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast111 = $vararg_buffer110;
 $vararg_buffer108 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast109 = $vararg_buffer108;
 $vararg_buffer106 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast107 = $vararg_buffer106;
 $vararg_buffer103 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast104 = $vararg_buffer103;
 $vararg_buffer98 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast99 = $vararg_buffer98;
 $vararg_buffer96 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast97 = $vararg_buffer96;
 $vararg_buffer94 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast95 = $vararg_buffer94;
 $vararg_buffer92 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast93 = $vararg_buffer92;
 $vararg_buffer89 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast90 = $vararg_buffer89;
 $vararg_buffer86 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast87 = $vararg_buffer86;
 $vararg_buffer83 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast84 = $vararg_buffer83;
 $vararg_buffer81 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast82 = $vararg_buffer81;
 $vararg_buffer79 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast80 = $vararg_buffer79;
 $vararg_buffer73 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast74 = $vararg_buffer73;
 $vararg_buffer71 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast72 = $vararg_buffer71;
 $vararg_buffer68 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast69 = $vararg_buffer68;
 $vararg_buffer66 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast67 = $vararg_buffer66;
 $vararg_buffer64 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast65 = $vararg_buffer64;
 $vararg_buffer55 = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $vararg_lifetime_bitcast56 = $vararg_buffer55;
 $vararg_buffer53 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast54 = $vararg_buffer53;
 $vararg_buffer50 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast51 = $vararg_buffer50;
 $vararg_buffer48 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast49 = $vararg_buffer48;
 $vararg_buffer45 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast46 = $vararg_buffer45;
 $vararg_buffer43 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast44 = $vararg_buffer43;
 $vararg_buffer40 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast41 = $vararg_buffer40;
 $vararg_buffer33 = STACKTOP; STACKTOP = STACKTOP + 24|0;
 $vararg_lifetime_bitcast34 = $vararg_buffer33;
 $vararg_buffer31 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast32 = $vararg_buffer31;
 $vararg_buffer29 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast30 = $vararg_buffer29;
 $vararg_buffer27 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast28 = $vararg_buffer27;
 $vararg_buffer25 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast26 = $vararg_buffer25;
 $vararg_buffer23 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast24 = $vararg_buffer23;
 $vararg_buffer21 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast22 = $vararg_buffer21;
 $vararg_buffer19 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast20 = $vararg_buffer19;
 $vararg_buffer17 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast18 = $vararg_buffer17;
 $vararg_buffer14 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast15 = $vararg_buffer14;
 $vararg_buffer12 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast13 = $vararg_buffer12;
 $vararg_buffer10 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast11 = $vararg_buffer10;
 $vararg_buffer7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast8 = $vararg_buffer7;
 $vararg_buffer5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast6 = $vararg_buffer5;
 $vararg_buffer3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast4 = $vararg_buffer3;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $err = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $device_id = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $pass_count = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $group_counts = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $work_item_counts = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $operation_counts = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $entry_counts = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $returned_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $max_workgroup_size = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vendor_name = STACKTOP; STACKTOP = STACKTOP + 1024|0;
 $device_name = STACKTOP; STACKTOP = STACKTOP + 1024|0;
 $block_source = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $length = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $build_log = STACKTOP; STACKTOP = STACKTOP + 2048|0;
 $pass_input = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $pass_output = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $global = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $local = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $entries = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $global1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $local2 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $reference = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $result = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $reference3 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $result4 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $1 = 0;
 $2 = $argc;
 $3 = $argv;
 $t1 = 0.0;
 $t2 = 0.0;
 HEAP32[$pass_count>>2] = 0;
 HEAP32[$group_counts>>2] = 0;
 HEAP32[$work_item_counts>>2] = 0;
 HEAP32[$operation_counts>>2] = 0;
 HEAP32[$entry_counts>>2] = 0;
 $use_gpu = 1;
 $i = 0;
 while(1) {
  $4 = $i;
  $5 = $2;
  $6 = ($4|0)<($5|0);
  if ($6) {
   $7 = $3;
   $8 = ($7|0)!=(0|0);
   $9 = $8;
  } else {
   $9 = 0;
  }
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = $3;
  $12 = (($11) + ($10<<2)|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ($13|0)!=(0|0);
  if ($14) {
   $15 = $i;
   $16 = $3;
   $17 = (($16) + ($15<<2)|0);
   $18 = HEAP32[$17>>2]|0;
   $19 = (_strstr(($18|0),((8)|0))|0);
   $20 = ($19|0)!=(0|0);
   if ($20) {
    $use_gpu = 0;
   } else {
    $21 = $i;
    $22 = $3;
    $23 = (($22) + ($21<<2)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = (_strstr(($24|0),((16)|0))|0);
    $26 = ($25|0)!=(0|0);
    if ($26) {
     $use_gpu = 1;
    } else {
     $27 = $i;
     $28 = $3;
     $29 = (($28) + ($27<<2)|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = (_strstr(($30|0),((24)|0))|0);
     $32 = ($31|0)!=(0|0);
     if ($32) {
      HEAP8[(32)] = 0;
      HEAP32[(40)>>2] = 2;
     } else {
      $33 = $i;
      $34 = $3;
      $35 = (($34) + ($33<<2)|0);
      $36 = HEAP32[$35>>2]|0;
      $37 = (_strstr(($36|0),((48)|0))|0);
      $38 = ($37|0)!=(0|0);
      if ($38) {
       HEAP8[(32)] = 0;
       HEAP32[(40)>>2] = 4;
      } else {
       $39 = $i;
       $40 = $3;
       $41 = (($40) + ($39<<2)|0);
       $42 = HEAP32[$41>>2]|0;
       $43 = (_strstr(($42|0),((56)|0))|0);
       $44 = ($43|0)!=(0|0);
       if ($44) {
        HEAP8[(32)] = 0;
        HEAP32[(40)>>2] = 1;
       } else {
        $45 = $i;
        $46 = $3;
        $47 = (($46) + ($45<<2)|0);
        $48 = HEAP32[$47>>2]|0;
        $49 = (_strstr(($48|0),((64)|0))|0);
        $50 = ($49|0)!=(0|0);
        if ($50) {
         HEAP8[(32)] = 1;
         HEAP32[(40)>>2] = 2;
        } else {
         $51 = $i;
         $52 = $3;
         $53 = (($52) + ($51<<2)|0);
         $54 = HEAP32[$53>>2]|0;
         $55 = (_strstr(($54|0),((72)|0))|0);
         $56 = ($55|0)!=(0|0);
         if ($56) {
          HEAP8[(32)] = 1;
          HEAP32[(40)>>2] = 4;
         } else {
          $57 = $i;
          $58 = $3;
          $59 = (($58) + ($57<<2)|0);
          $60 = HEAP32[$59>>2]|0;
          $61 = (_strstr(($60|0),((80)|0))|0);
          $62 = ($61|0)!=(0|0);
          if ($62) {
           HEAP8[(32)] = 1;
           HEAP32[(40)>>2] = 1;
          }
         }
        }
       }
      }
     }
    }
   }
  } else {
  }
  $63 = $i;
  $64 = (($63) + 1)|0;
  $i = $64;
 }
 $65 = HEAP32[(88)>>2]|0;
 $66 = HEAP32[(40)>>2]|0;
 $67 = Math_imul($65, $66)|0;
 $68 = $67<<2;
 $69 = (_malloc($68)|0);
 $70 = $69;
 $float_data = $70;
 $71 = HEAP32[(88)>>2]|0;
 $72 = HEAP32[(40)>>2]|0;
 $73 = Math_imul($71, $72)|0;
 $74 = $73<<2;
 $75 = (_malloc($74)|0);
 $76 = $75;
 $integer_data = $76;
 $i = 0;
 while(1) {
  $77 = $i;
  $78 = HEAP32[(88)>>2]|0;
  $79 = HEAP32[(40)>>2]|0;
  $80 = Math_imul($78, $79)|0;
  $81 = ($77|0)<($80|0);
  if (!($81)) {
   break;
  }
  $82 = (_rand()|0);
  $83 = (+($82|0));
  $84 = $83 / 2147483648.0;
  $85 = $i;
  $86 = $float_data;
  $87 = (($86) + ($85<<2)|0);
  HEAPF32[$87>>2] = $84;
  $88 = $i;
  $89 = $float_data;
  $90 = (($89) + ($88<<2)|0);
  $91 = +HEAPF32[$90>>2];
  $92 = 255.0 * $91;
  $93 = (~~(($92)));
  $94 = $i;
  $95 = $integer_data;
  $96 = (($95) + ($94<<2)|0);
  HEAP32[$96>>2] = $93;
  $97 = $i;
  $98 = (($97) + 1)|0;
  $i = $98;
 }
 $99 = $use_gpu;
 $100 = ($99|0)!=(0);
 $101 = $100 ? 4 : 2;
 $102 = ($101|0)<(0);
 $103 = $102 << 31 >> 31;
 $104 = (_clGetDeviceIDs((0|0),($101|0),($103|0),1,($device_id|0),(0|0))|0);
 HEAP32[$err>>2] = $104;
 $105 = HEAP32[$err>>2]|0;
 $106 = ($105|0)!=(0);
 if ($106) {
  (_printf(((96)|0),($vararg_buffer|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 HEAP32[$returned_size>>2] = 0;
 HEAP32[$max_workgroup_size>>2] = 0;
 $107 = HEAP32[$device_id>>2]|0;
 $108 = $max_workgroup_size;
 $109 = (_clGetDeviceInfo(($107|0),4100,4,($108|0),($returned_size|0))|0);
 HEAP32[$err>>2] = $109;
 $110 = HEAP32[$err>>2]|0;
 $111 = ($110|0)!=(0);
 if ($111) {
  (_printf(((144)|0),($vararg_buffer1|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $112 = $vendor_name;
 _memset(($112|0),0,1024)|0;
 $113 = $device_name;
 _memset(($113|0),0,1024)|0;
 $114 = HEAP32[$device_id>>2]|0;
 $115 = ($vendor_name);
 $116 = (_clGetDeviceInfo(($114|0),4140,1024,($115|0),($returned_size|0))|0);
 HEAP32[$err>>2] = $116;
 $117 = HEAP32[$device_id>>2]|0;
 $118 = ($device_name);
 $119 = (_clGetDeviceInfo(($117|0),4139,1024,($118|0),($returned_size|0))|0);
 $120 = HEAP32[$err>>2]|0;
 $121 = $120 | $119;
 HEAP32[$err>>2] = $121;
 $122 = HEAP32[$err>>2]|0;
 $123 = ($122|0)!=(0);
 if ($123) {
  (_printf(((144)|0),($vararg_buffer3|0))|0);
 }
 (_printf(((184)|0),($vararg_buffer5|0))|0);
 $124 = ($vendor_name);
 $125 = ($device_name);
 $vararg_ptr = ($vararg_buffer7);
 HEAP32[$vararg_ptr>>2] = $124;
 $vararg_ptr9 = (($vararg_buffer7) + 4|0);
 HEAP32[$vararg_ptr9>>2] = $125;
 (_printf(((256)|0),($vararg_buffer7|0))|0);
 $126 = HEAP8[(32)]|0;
 $127 = $126&1;
 $128 = $127 ? 4 : 4;
 $typesize = $128;
 $filename = 0;
 $129 = HEAP32[(40)>>2]|0;
 if ((($129|0) == 4)) {
  $130 = HEAP8[(32)]|0;
  $131 = $130&1;
  $132 = $131 ? (280) : (304);
  $filename = $132;
 } else if ((($129|0) == 2)) {
  $133 = HEAP8[(32)]|0;
  $134 = $133&1;
  $135 = $134 ? (328) : (352);
  $filename = $135;
 } else if ((($129|0) == 1)) {
  $136 = HEAP8[(32)]|0;
  $137 = $136&1;
  $138 = $137 ? (376) : (400);
  $filename = $138;
 } else {
  (_printf(((424)|0),($vararg_buffer10|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 (_printf(((184)|0),($vararg_buffer12|0))|0);
 $139 = $filename;
 $vararg_ptr16 = ($vararg_buffer14);
 HEAP32[$vararg_ptr16>>2] = $139;
 (_printf(((464)|0),($vararg_buffer14|0))|0);
 (_printf(((184)|0),($vararg_buffer17|0))|0);
 $140 = $filename;
 $141 = (_load_program_source($140)|0);
 $source = $141;
 $142 = $source;
 $143 = ($142|0)!=(0|0);
 if (!($143)) {
  (_printf(((496)|0),($vararg_buffer19|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $144 = (_clCreateContext((0|0),1,($device_id|0),(0|0),(0|0),($err|0))|0);
 $context = $144;
 $145 = $context;
 $146 = ($145|0)!=(0|0);
 if (!($146)) {
  (_printf(((552)|0),($vararg_buffer21|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $147 = $context;
 $148 = HEAP32[$device_id>>2]|0;
 $149 = (_clCreateCommandQueue(($147|0),($148|0),0,0,($err|0))|0);
 $commands = $149;
 $150 = $commands;
 $151 = ($150|0)!=(0|0);
 if (!($151)) {
  (_printf(((600)|0),($vararg_buffer23|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $152 = $typesize;
 $153 = HEAP32[(88)>>2]|0;
 $154 = Math_imul($152, $153)|0;
 $155 = HEAP32[(40)>>2]|0;
 $156 = Math_imul($154, $155)|0;
 $buffer_size = $156;
 $157 = $context;
 $158 = $buffer_size;
 $159 = (_clCreateBuffer(($157|0),1,0,($158|0),(0|0),(0|0))|0);
 $input_buffer = $159;
 $160 = $input_buffer;
 $161 = ($160|0)!=(0|0);
 if (!($161)) {
  (_printf(((648)|0),($vararg_buffer25|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $162 = HEAP8[(32)]|0;
 $163 = $162&1;
 if ($163) {
  $164 = $integer_data;
  $165 = $164;
  $168 = $165;
 } else {
  $166 = $float_data;
  $167 = $166;
  $168 = $167;
 }
 $input_data = $168;
 $169 = $commands;
 $170 = $input_buffer;
 $171 = $buffer_size;
 $172 = $input_data;
 $173 = (_clEnqueueWriteBuffer(($169|0),($170|0),1,0,($171|0),($172|0),0,(0|0),(0|0))|0);
 HEAP32[$err>>2] = $173;
 $174 = HEAP32[$err>>2]|0;
 $175 = ($174|0)!=(0);
 if ($175) {
  (_printf(((704)|0),($vararg_buffer27|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $176 = $context;
 $177 = $buffer_size;
 $178 = (_clCreateBuffer(($176|0),1,0,($177|0),(0|0),(0|0))|0);
 $partials_buffer = $178;
 $179 = $partials_buffer;
 $180 = ($179|0)!=(0|0);
 if (!($180)) {
  (_printf(((752)|0),($vararg_buffer29|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $181 = $context;
 $182 = $buffer_size;
 $183 = (_clCreateBuffer(($181|0),1,0,($182|0),(0|0),(0|0))|0);
 $output_buffer = $183;
 $184 = $output_buffer;
 $185 = ($184|0)!=(0|0);
 if (!($185)) {
  (_printf(((816)|0),($vararg_buffer31|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 $186 = HEAP32[(88)>>2]|0;
 $187 = HEAP32[$max_workgroup_size>>2]|0;
 _create_reduction_pass_counts($186,$187,64,64,$pass_count,$group_counts,$work_item_counts,$operation_counts,$entry_counts);
 $188 = HEAP32[$pass_count>>2]|0;
 $189 = $188<<2;
 $190 = (_malloc($189)|0);
 $191 = $190;
 $programs = $191;
 $192 = $programs;
 $193 = $192;
 $194 = HEAP32[$pass_count>>2]|0;
 $195 = $194<<2;
 _memset(($193|0),0,($195|0))|0;
 $196 = HEAP32[$pass_count>>2]|0;
 $197 = $196<<2;
 $198 = (_malloc($197)|0);
 $199 = $198;
 $kernels = $199;
 $200 = $kernels;
 $201 = $200;
 $202 = HEAP32[$pass_count>>2]|0;
 $203 = $202<<2;
 _memset(($201|0),0,($203|0))|0;
 $i = 0;
 while(1) {
  $204 = $i;
  $205 = HEAP32[$pass_count>>2]|0;
  $206 = ($204|0)<($205|0);
  if (!($206)) {
   label = 76;
   break;
  }
  $207 = $source;
  $208 = (_strlen(($207|0))|0);
  $209 = (($208) + 1024)|0;
  $210 = (_malloc($209)|0);
  HEAP32[$block_source>>2] = $210;
  $211 = $source;
  $212 = (_strlen(($211|0))|0);
  $213 = (($212) + 1024)|0;
  $source_length = $213;
  $214 = HEAP32[$block_source>>2]|0;
  $215 = $source_length;
  _memset(($214|0),0,($215|0))|0;
  $216 = HEAP32[$block_source>>2]|0;
  $217 = $i;
  $218 = HEAP32[$group_counts>>2]|0;
  $219 = (($218) + ($217<<2)|0);
  $220 = HEAP32[$219>>2]|0;
  $221 = $i;
  $222 = HEAP32[$operation_counts>>2]|0;
  $223 = (($222) + ($221<<2)|0);
  $224 = HEAP32[$223>>2]|0;
  $225 = $source;
  $vararg_ptr35 = ($vararg_buffer33);
  HEAP32[$vararg_ptr35>>2] = (872);
  $vararg_ptr36 = (($vararg_buffer33) + 4|0);
  HEAP32[$vararg_ptr36>>2] = $220;
  $vararg_ptr37 = (($vararg_buffer33) + 8|0);
  HEAP32[$vararg_ptr37>>2] = (896);
  $vararg_ptr38 = (($vararg_buffer33) + 12|0);
  HEAP32[$vararg_ptr38>>2] = $224;
  $vararg_ptr39 = (($vararg_buffer33) + 16|0);
  HEAP32[$vararg_ptr39>>2] = $225;
  (_sprintf(($216|0),((920)|0),($vararg_buffer33|0))|0);
  $226 = $context;
  $227 = (_clCreateProgramWithSource(($226|0),1,($block_source|0),(0|0),($err|0))|0);
  $228 = $i;
  $229 = $programs;
  $230 = (($229) + ($228<<2)|0);
  HEAP32[$230>>2] = $227;
  $231 = $i;
  $232 = $programs;
  $233 = (($232) + ($231<<2)|0);
  $234 = HEAP32[$233>>2]|0;
  $235 = ($234|0)!=(0|0);
  if (!($235)) {
   label = 68;
   break;
  }
  $236 = HEAP32[$err>>2]|0;
  $237 = ($236|0)!=(0);
  if ($237) {
   label = 68;
   break;
  }
  $239 = $i;
  $240 = $programs;
  $241 = (($240) + ($239<<2)|0);
  $242 = HEAP32[$241>>2]|0;
  $243 = (_clBuildProgram(($242|0),0,(0|0),(0|0),(0|0),(0|0))|0);
  HEAP32[$err>>2] = $243;
  $244 = HEAP32[$err>>2]|0;
  $245 = ($244|0)!=(0);
  if ($245) {
   label = 70;
   break;
  }
  $254 = $i;
  $255 = $programs;
  $256 = (($255) + ($254<<2)|0);
  $257 = HEAP32[$256>>2]|0;
  $258 = (_clCreateKernel(($257|0),((1048)|0),($err|0))|0);
  $259 = $i;
  $260 = $kernels;
  $261 = (($260) + ($259<<2)|0);
  HEAP32[$261>>2] = $258;
  $262 = $i;
  $263 = $kernels;
  $264 = (($263) + ($262<<2)|0);
  $265 = HEAP32[$264>>2]|0;
  $266 = ($265|0)!=(0|0);
  if (!($266)) {
   label = 73;
   break;
  }
  $267 = HEAP32[$err>>2]|0;
  $268 = ($267|0)!=(0);
  if ($268) {
   label = 73;
   break;
  }
  $269 = HEAP32[$block_source>>2]|0;
  _free($269);
  $270 = $i;
  $271 = (($270) + 1)|0;
  $i = $271;
 }
 if ((label|0) == 68) {
  $238 = HEAP32[$block_source>>2]|0;
  $vararg_ptr42 = ($vararg_buffer40);
  HEAP32[$vararg_ptr42>>2] = $238;
  (_printf(((944)|0),($vararg_buffer40|0))|0);
  (_printf(((952)|0),($vararg_buffer43|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 else if ((label|0) == 70) {
  $246 = HEAP32[$block_source>>2]|0;
  $vararg_ptr47 = ($vararg_buffer45);
  HEAP32[$vararg_ptr47>>2] = $246;
  (_printf(((944)|0),($vararg_buffer45|0))|0);
  (_printf(((1000)|0),($vararg_buffer48|0))|0);
  $247 = $i;
  $248 = $programs;
  $249 = (($248) + ($247<<2)|0);
  $250 = HEAP32[$249>>2]|0;
  $251 = HEAP32[$device_id>>2]|0;
  $252 = ($build_log);
  (_clGetProgramBuildInfo(($250|0),($251|0),4483,2048,($252|0),($length|0))|0);
  $253 = ($build_log);
  $vararg_ptr52 = ($vararg_buffer50);
  HEAP32[$vararg_ptr52>>2] = $253;
  (_printf(((944)|0),($vararg_buffer50|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 else if ((label|0) == 73) {
  (_printf(((1056)|0),($vararg_buffer53|0))|0);
  $1 = 1;
  $626 = $1;
  STACKTOP = sp;return ($626|0);
 }
 else if ((label|0) == 76) {
  $272 = $output_buffer;
  HEAP32[$pass_input>>2] = $272;
  $273 = $input_buffer;
  HEAP32[$pass_output>>2] = $273;
  $i = 0;
  while(1) {
   $274 = $i;
   $275 = HEAP32[$pass_count>>2]|0;
   $276 = ($274|0)<($275|0);
   if (!($276)) {
    label = 86;
    break;
   }
   $277 = $i;
   $278 = HEAP32[$group_counts>>2]|0;
   $279 = (($278) + ($277<<2)|0);
   $280 = HEAP32[$279>>2]|0;
   $281 = $i;
   $282 = HEAP32[$work_item_counts>>2]|0;
   $283 = (($282) + ($281<<2)|0);
   $284 = HEAP32[$283>>2]|0;
   $285 = Math_imul($280, $284)|0;
   HEAP32[$global>>2] = $285;
   $286 = $i;
   $287 = HEAP32[$work_item_counts>>2]|0;
   $288 = (($287) + ($286<<2)|0);
   $289 = HEAP32[$288>>2]|0;
   HEAP32[$local>>2] = $289;
   $290 = $i;
   $291 = HEAP32[$operation_counts>>2]|0;
   $292 = (($291) + ($290<<2)|0);
   $293 = HEAP32[$292>>2]|0;
   $operations = $293;
   $294 = $i;
   $295 = HEAP32[$entry_counts>>2]|0;
   $296 = (($295) + ($294<<2)|0);
   $297 = HEAP32[$296>>2]|0;
   HEAP32[$entries>>2] = $297;
   $298 = $typesize;
   $299 = HEAP32[(40)>>2]|0;
   $300 = Math_imul($298, $299)|0;
   $301 = HEAP32[$local>>2]|0;
   $302 = Math_imul($300, $301)|0;
   $303 = $operations;
   $304 = Math_imul($302, $303)|0;
   $shared_size = $304;
   $305 = $i;
   $306 = HEAP32[$global>>2]|0;
   $307 = HEAP32[$local>>2]|0;
   $308 = $i;
   $309 = HEAP32[$group_counts>>2]|0;
   $310 = (($309) + ($308<<2)|0);
   $311 = HEAP32[$310>>2]|0;
   $312 = $i;
   $313 = HEAP32[$work_item_counts>>2]|0;
   $314 = (($313) + ($312<<2)|0);
   $315 = HEAP32[$314>>2]|0;
   $316 = $operations;
   $317 = HEAP32[$entries>>2]|0;
   $vararg_ptr57 = ($vararg_buffer55);
   HEAP32[$vararg_ptr57>>2] = $305;
   $vararg_ptr58 = (($vararg_buffer55) + 4|0);
   HEAP32[$vararg_ptr58>>2] = $306;
   $vararg_ptr59 = (($vararg_buffer55) + 8|0);
   HEAP32[$vararg_ptr59>>2] = $307;
   $vararg_ptr60 = (($vararg_buffer55) + 12|0);
   HEAP32[$vararg_ptr60>>2] = $311;
   $vararg_ptr61 = (($vararg_buffer55) + 16|0);
   HEAP32[$vararg_ptr61>>2] = $315;
   $vararg_ptr62 = (($vararg_buffer55) + 20|0);
   HEAP32[$vararg_ptr62>>2] = $316;
   $vararg_ptr63 = (($vararg_buffer55) + 24|0);
   HEAP32[$vararg_ptr63>>2] = $317;
   (_printf(((1104)|0),($vararg_buffer55|0))|0);
   $318 = HEAP32[$pass_input>>2]|0;
   $pass_swap = $318;
   $319 = HEAP32[$pass_output>>2]|0;
   HEAP32[$pass_input>>2] = $319;
   $320 = $pass_swap;
   HEAP32[$pass_output>>2] = $320;
   HEAP32[$err>>2] = 0;
   $321 = $i;
   $322 = $kernels;
   $323 = (($322) + ($321<<2)|0);
   $324 = HEAP32[$323>>2]|0;
   $325 = $pass_output;
   $326 = (_clSetKernelArg(($324|0),0,4,($325|0))|0);
   $327 = HEAP32[$err>>2]|0;
   $328 = $327 | $326;
   HEAP32[$err>>2] = $328;
   $329 = $i;
   $330 = $kernels;
   $331 = (($330) + ($329<<2)|0);
   $332 = HEAP32[$331>>2]|0;
   $333 = $pass_input;
   $334 = (_clSetKernelArg(($332|0),1,4,($333|0))|0);
   $335 = HEAP32[$err>>2]|0;
   $336 = $335 | $334;
   HEAP32[$err>>2] = $336;
   $337 = $i;
   $338 = $kernels;
   $339 = (($338) + ($337<<2)|0);
   $340 = HEAP32[$339>>2]|0;
   $341 = $shared_size;
   $342 = (_clSetKernelArg(($340|0),2,($341|0),(0|0))|0);
   $343 = HEAP32[$err>>2]|0;
   $344 = $343 | $342;
   HEAP32[$err>>2] = $344;
   $345 = $i;
   $346 = $kernels;
   $347 = (($346) + ($345<<2)|0);
   $348 = HEAP32[$347>>2]|0;
   $349 = $entries;
   $350 = (_clSetKernelArg(($348|0),3,4,($349|0))|0);
   $351 = HEAP32[$err>>2]|0;
   $352 = $351 | $350;
   HEAP32[$err>>2] = $352;
   $353 = HEAP32[$err>>2]|0;
   $354 = ($353|0)!=(0);
   if ($354) {
    label = 79;
    break;
   }
   $355 = HEAP32[$pass_input>>2]|0;
   $356 = $input_buffer;
   $357 = ($355|0)==($356|0);
   if ($357) {
    $358 = $partials_buffer;
    HEAP32[$pass_input>>2] = $358;
   }
   HEAP32[$err>>2] = 0;
   $359 = $commands;
   $360 = $i;
   $361 = $kernels;
   $362 = (($361) + ($360<<2)|0);
   $363 = HEAP32[$362>>2]|0;
   $364 = (_clEnqueueNDRangeKernel(($359|0),($363|0),1,(0|0),($global|0),($local|0),0,(0|0),(0|0))|0);
   $365 = HEAP32[$err>>2]|0;
   $366 = $365 | $364;
   HEAP32[$err>>2] = $366;
   $367 = HEAP32[$err>>2]|0;
   $368 = ($367|0)!=(0);
   if ($368) {
    label = 83;
    break;
   }
   $369 = $i;
   $370 = (($369) + 1)|0;
   $i = $370;
  }
  if ((label|0) == 79) {
   (_printf(((1192)|0),($vararg_buffer64|0))|0);
   $1 = 1;
   $626 = $1;
   STACKTOP = sp;return ($626|0);
  }
  else if ((label|0) == 83) {
   (_printf(((1232)|0),($vararg_buffer66|0))|0);
   $1 = 1;
   $626 = $1;
   STACKTOP = sp;return ($626|0);
  }
  else if ((label|0) == 86) {
   $371 = $commands;
   $372 = (_clFinish(($371|0))|0);
   HEAP32[$err>>2] = $372;
   $373 = HEAP32[$err>>2]|0;
   $374 = ($373|0)!=(0);
   if ($374) {
    $375 = HEAP32[$err>>2]|0;
    $vararg_ptr70 = ($vararg_buffer68);
    HEAP32[$vararg_ptr70>>2] = $375;
    (_printf(((1272)|0),($vararg_buffer68|0))|0);
    $1 = 1;
    $626 = $1;
    STACKTOP = sp;return ($626|0);
   }
   (_printf(((184)|0),($vararg_buffer71|0))|0);
   $376 = HEAP32[(1400)>>2]|0;
   $377 = HEAP32[(88)>>2]|0;
   $378 = HEAP8[(32)]|0;
   $379 = $378&1;
   $380 = $379 ? (80) : (56);
   $381 = HEAP32[(40)>>2]|0;
   $382 = ($381|0)<=(1);
   if ($382) {
    $386 = (1408);
   } else {
    $383 = HEAP32[(40)>>2]|0;
    $384 = ($383|0)==(2);
    $385 = $384 ? (1416) : (1424);
    $386 = $385;
   }
   $vararg_ptr75 = ($vararg_buffer73);
   HEAP32[$vararg_ptr75>>2] = $376;
   $vararg_ptr76 = (($vararg_buffer73) + 4|0);
   HEAP32[$vararg_ptr76>>2] = $377;
   $vararg_ptr77 = (($vararg_buffer73) + 8|0);
   HEAP32[$vararg_ptr77>>2] = $380;
   $vararg_ptr78 = (($vararg_buffer73) + 12|0);
   HEAP32[$vararg_ptr78>>2] = $386;
   (_printf(((1328)|0),($vararg_buffer73|0))|0);
   (_printf(((184)|0),($vararg_buffer79|0))|0);
   HEAP32[$err>>2] = 0;
   $387 = (+_current_time());
   $t1 = $387;
   $k = 0;
   L138: while(1) {
    $388 = $k;
    $389 = HEAP32[(1400)>>2]|0;
    $390 = ($388|0)<($389|0);
    if (!($390)) {
     break;
    }
    $i = 0;
    while(1) {
     $391 = $i;
     $392 = HEAP32[$pass_count>>2]|0;
     $393 = ($391|0)<($392|0);
     if (!($393)) {
      break;
     }
     $394 = $i;
     $395 = HEAP32[$group_counts>>2]|0;
     $396 = (($395) + ($394<<2)|0);
     $397 = HEAP32[$396>>2]|0;
     $398 = $i;
     $399 = HEAP32[$work_item_counts>>2]|0;
     $400 = (($399) + ($398<<2)|0);
     $401 = HEAP32[$400>>2]|0;
     $402 = Math_imul($397, $401)|0;
     HEAP32[$global1>>2] = $402;
     $403 = $i;
     $404 = HEAP32[$work_item_counts>>2]|0;
     $405 = (($404) + ($403<<2)|0);
     $406 = HEAP32[$405>>2]|0;
     HEAP32[$local2>>2] = $406;
     $407 = $commands;
     $408 = $i;
     $409 = $kernels;
     $410 = (($409) + ($408<<2)|0);
     $411 = HEAP32[$410>>2]|0;
     $412 = (_clEnqueueNDRangeKernel(($407|0),($411|0),1,(0|0),($global1|0),($local2|0),0,(0|0),(0|0))|0);
     HEAP32[$err>>2] = $412;
     $413 = HEAP32[$err>>2]|0;
     $414 = ($413|0)!=(0);
     if ($414) {
      label = 96;
      break L138;
     }
     $415 = $i;
     $416 = (($415) + 1)|0;
     $i = $416;
    }
    $417 = $k;
    $418 = (($417) + 1)|0;
    $k = $418;
   }
   if ((label|0) == 96) {
    (_printf(((1232)|0),($vararg_buffer81|0))|0);
    $1 = 1;
    $626 = $1;
    STACKTOP = sp;return ($626|0);
   }
   $419 = $commands;
   $420 = (_clFinish(($419|0))|0);
   HEAP32[$err>>2] = $420;
   $421 = HEAP32[$err>>2]|0;
   $422 = ($421|0)!=(0);
   if ($422) {
    $423 = HEAP32[$err>>2]|0;
    $vararg_ptr85 = ($vararg_buffer83);
    HEAP32[$vararg_ptr85>>2] = $423;
    (_printf(((1272)|0),($vararg_buffer83|0))|0);
    $1 = 1;
    $626 = $1;
    STACKTOP = sp;return ($626|0);
   }
   $424 = (+_current_time());
   $t2 = $424;
   $425 = $t2;
   $426 = $t1;
   $427 = (+_subtract_time_in_seconds($425,$426));
   $428 = $427;
   $t = $428;
   $429 = $t;
   $430 = 1000.0 * $429;
   $431 = HEAP32[(1400)>>2]|0;
   $432 = (+($431|0));
   $433 = $430 / $432;
   $vararg_ptr88 = ($vararg_buffer86);
   HEAPF64[tempDoublePtr>>3]=$433;HEAP32[$vararg_ptr88>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr88+4>>2]=HEAP32[tempDoublePtr+4>>2];
   (_printf(((1432)|0),($vararg_buffer86|0))|0);
   $434 = $buffer_size;
   $435 = (+($434>>>0));
   $436 = 1.00000000000000006228E-9 * $435;
   $437 = HEAP32[(1400)>>2]|0;
   $438 = (+($437|0));
   $439 = $436 * $438;
   $440 = $t;
   $441 = $439 / $440;
   $vararg_ptr91 = ($vararg_buffer89);
   HEAPF64[tempDoublePtr>>3]=$441;HEAP32[$vararg_ptr91>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr91+4>>2]=HEAP32[tempDoublePtr+4>>2];
   (_printf(((1456)|0),($vararg_buffer89|0))|0);
   (_printf(((184)|0),($vararg_buffer92|0))|0);
   $442 = $typesize;
   $443 = HEAP32[(40)>>2]|0;
   $444 = Math_imul($442, $443)|0;
   $445 = (_malloc($444)|0);
   $computed_result = $445;
   $446 = $computed_result;
   $447 = $typesize;
   $448 = HEAP32[(40)>>2]|0;
   $449 = Math_imul($447, $448)|0;
   _memset(($446|0),0,($449|0))|0;
   $450 = $commands;
   $451 = HEAP32[$pass_output>>2]|0;
   $452 = $typesize;
   $453 = HEAP32[(40)>>2]|0;
   $454 = Math_imul($452, $453)|0;
   $455 = $computed_result;
   $456 = (_clEnqueueReadBuffer(($450|0),($451|0),1,0,($454|0),($455|0),0,(0|0),(0|0))|0);
   HEAP32[$err>>2] = $456;
   $457 = HEAP32[$err>>2]|0;
   $458 = ($457|0)!=(0);
   if ($458) {
    (_printf(((1488)|0),($vararg_buffer94|0))|0);
    $1 = 1;
    $626 = $1;
    STACKTOP = sp;return ($626|0);
   }
   $459 = HEAP8[(32)]|0;
   $460 = $459&1;
   do {
    if ($460) {
     $461 = $reference;
     ;HEAP32[$461+0>>2]=0|0;HEAP32[$461+4>>2]=0|0;HEAP32[$461+8>>2]=0|0;HEAP32[$461+12>>2]=0|0;
     $462 = HEAP32[(40)>>2]|0;
     if ((($462|0) == 4)) {
      $463 = $integer_data;
      $464 = HEAP32[(88)>>2]|0;
      $465 = ($reference);
      _reduce_validate_int4($463,$464,$465);
     } else if ((($462|0) == 2)) {
      $466 = $integer_data;
      $467 = HEAP32[(88)>>2]|0;
      $468 = ($reference);
      _reduce_validate_int2($466,$467,$468);
     } else if ((($462|0) == 1)) {
      $469 = $integer_data;
      $470 = HEAP32[(88)>>2]|0;
      $471 = ($reference);
      _reduce_validate_int($469,$470,$471);
     } else {
      (_printf(((424)|0),($vararg_buffer96|0))|0);
      $1 = 1;
      $626 = $1;
      STACKTOP = sp;return ($626|0);
     }
     $472 = $result;
     ;HEAP32[$472+0>>2]=0|0;HEAP32[$472+4>>2]=0|0;HEAP32[$472+8>>2]=0|0;HEAP32[$472+12>>2]=0|0;
     $c = 0;
     while(1) {
      $473 = $c;
      $474 = HEAP32[(40)>>2]|0;
      $475 = ($473|0)<($474|0);
      if (!($475)) {
       break;
      }
      $476 = $c;
      $477 = $computed_result;
      $478 = $477;
      $479 = (($478) + ($476<<2)|0);
      $480 = HEAP32[$479>>2]|0;
      $v = $480;
      $481 = $v;
      $482 = $c;
      $483 = (($result) + ($482<<2)|0);
      $484 = HEAP32[$483>>2]|0;
      $485 = (($484) + ($481))|0;
      HEAP32[$483>>2] = $485;
      $486 = $c;
      $487 = (($486) + 1)|0;
      $c = $487;
     }
     $error = 0.0;
     $diff = 0.0;
     $c = 0;
     while(1) {
      $488 = $c;
      $489 = HEAP32[(40)>>2]|0;
      $490 = ($488|0)<($489|0);
      if (!($490)) {
       break;
      }
      $491 = $c;
      $492 = (($reference) + ($491<<2)|0);
      $493 = HEAP32[$492>>2]|0;
      $494 = $c;
      $495 = (($result) + ($494<<2)|0);
      $496 = HEAP32[$495>>2]|0;
      $497 = (($493) - ($496))|0;
      $498 = (+($497|0));
      $499 = (+Math_abs((+$498)));
      $500 = $499;
      $diff = $500;
      $501 = $diff;
      $502 = $error;
      $503 = $501 > $502;
      if ($503) {
       $504 = $diff;
       $506 = $504;
      } else {
       $505 = $error;
       $506 = $505;
      }
      $error = $506;
      $507 = $c;
      $508 = (($507) + 1)|0;
      $c = $508;
     }
     $509 = $error;
     $510 = $509;
     $511 = $510 > 9.99999999999999954748E-7;
     if (!($511)) {
      (_printf(((1624)|0),($vararg_buffer106|0))|0);
      (_printf(((184)|0),($vararg_buffer108|0))|0);
      break;
     }
     $c = 0;
     while(1) {
      $512 = $c;
      $513 = HEAP32[(40)>>2]|0;
      $514 = ($512|0)<($513|0);
      if (!($514)) {
       break;
      }
      $515 = $c;
      $516 = $c;
      $517 = (($reference) + ($516<<2)|0);
      $518 = HEAP32[$517>>2]|0;
      $519 = $c;
      $520 = (($result) + ($519<<2)|0);
      $521 = HEAP32[$520>>2]|0;
      $vararg_ptr100 = ($vararg_buffer98);
      HEAP32[$vararg_ptr100>>2] = $515;
      $vararg_ptr101 = (($vararg_buffer98) + 4|0);
      HEAP32[$vararg_ptr101>>2] = $518;
      $vararg_ptr102 = (($vararg_buffer98) + 8|0);
      HEAP32[$vararg_ptr102>>2] = $521;
      (_printf(((1544)|0),($vararg_buffer98|0))|0);
      $522 = $c;
      $523 = (($522) + 1)|0;
      $c = $523;
     }
     $524 = $error;
     $525 = $524;
     $vararg_ptr105 = ($vararg_buffer103);
     HEAPF64[tempDoublePtr>>3]=$525;HEAP32[$vararg_ptr105>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr105+4>>2]=HEAP32[tempDoublePtr+4>>2];
     (_printf(((1568)|0),($vararg_buffer103|0))|0);
     $1 = 1;
     $626 = $1;
     STACKTOP = sp;return ($626|0);
    } else {
     $526 = $reference3;
     ;HEAP32[$526+0>>2]=0|0;HEAP32[$526+4>>2]=0|0;HEAP32[$526+8>>2]=0|0;HEAP32[$526+12>>2]=0|0;
     $527 = HEAP32[(40)>>2]|0;
     if ((($527|0) == 4)) {
      $528 = $float_data;
      $529 = HEAP32[(88)>>2]|0;
      $530 = ($reference3);
      _reduce_validate_float4($528,$529,$530);
     } else if ((($527|0) == 2)) {
      $531 = $float_data;
      $532 = HEAP32[(88)>>2]|0;
      $533 = ($reference3);
      _reduce_validate_float2($531,$532,$533);
     } else if ((($527|0) == 1)) {
      $534 = $float_data;
      $535 = HEAP32[(88)>>2]|0;
      $536 = ($reference3);
      _reduce_validate_float($534,$535,$536);
     } else {
      (_printf(((424)|0),($vararg_buffer110|0))|0);
      $1 = 1;
      $626 = $1;
      STACKTOP = sp;return ($626|0);
     }
     $537 = $result4;
     ;HEAP32[$537+0>>2]=0|0;HEAP32[$537+4>>2]=0|0;HEAP32[$537+8>>2]=0|0;HEAP32[$537+12>>2]=0|0;
     $c = 0;
     while(1) {
      $538 = $c;
      $539 = HEAP32[(40)>>2]|0;
      $540 = ($538|0)<($539|0);
      if (!($540)) {
       break;
      }
      $541 = $c;
      $542 = $computed_result;
      $543 = $542;
      $544 = (($543) + ($541<<2)|0);
      $545 = +HEAPF32[$544>>2];
      $v5 = $545;
      $546 = $v5;
      $547 = $c;
      $548 = (($result4) + ($547<<2)|0);
      $549 = +HEAPF32[$548>>2];
      $550 = $549 + $546;
      HEAPF32[$548>>2] = $550;
      $551 = $c;
      $552 = (($551) + 1)|0;
      $c = $552;
     }
     $error6 = 0.0;
     $diff7 = 0.0;
     $c = 0;
     while(1) {
      $553 = $c;
      $554 = HEAP32[(40)>>2]|0;
      $555 = ($553|0)<($554|0);
      if (!($555)) {
       break;
      }
      $556 = $c;
      $557 = (($reference3) + ($556<<2)|0);
      $558 = +HEAPF32[$557>>2];
      $559 = $c;
      $560 = (($result4) + ($559<<2)|0);
      $561 = +HEAPF32[$560>>2];
      $562 = $558 - $561;
      $563 = $562;
      $564 = (+Math_abs((+$563)));
      $565 = $564;
      $diff7 = $565;
      $566 = $diff7;
      $567 = $error6;
      $568 = $566 > $567;
      if ($568) {
       $569 = $diff7;
       $571 = $569;
      } else {
       $570 = $error6;
       $571 = $570;
      }
      $error6 = $571;
      $572 = $c;
      $573 = (($572) + 1)|0;
      $c = $573;
     }
     $574 = $error6;
     $575 = $574;
     $576 = $575 > 9.99999999999999954748E-7;
     if (!($576)) {
      (_printf(((1624)|0),($vararg_buffer120|0))|0);
      (_printf(((184)|0),($vararg_buffer122|0))|0);
      break;
     }
     $c = 0;
     while(1) {
      $577 = $c;
      $578 = HEAP32[(40)>>2]|0;
      $579 = ($577|0)<($578|0);
      if (!($579)) {
       break;
      }
      $580 = $c;
      $581 = $c;
      $582 = (($reference3) + ($581<<2)|0);
      $583 = +HEAPF32[$582>>2];
      $584 = $583;
      $585 = $c;
      $586 = (($result4) + ($585<<2)|0);
      $587 = +HEAPF32[$586>>2];
      $588 = $587;
      $vararg_ptr114 = ($vararg_buffer112);
      HEAP32[$vararg_ptr114>>2] = $580;
      $vararg_ptr115 = (($vararg_buffer112) + 4|0);
      HEAPF64[tempDoublePtr>>3]=$584;HEAP32[$vararg_ptr115>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr115+4>>2]=HEAP32[tempDoublePtr+4>>2];
      $vararg_ptr116 = (($vararg_buffer112) + 12|0);
      HEAPF64[tempDoublePtr>>3]=$588;HEAP32[$vararg_ptr116>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr116+4>>2]=HEAP32[tempDoublePtr+4>>2];
      (_printf(((1648)|0),($vararg_buffer112|0))|0);
      $589 = $c;
      $590 = (($589) + 1)|0;
      $c = $590;
     }
     $591 = $error6;
     $592 = $591;
     $vararg_ptr119 = ($vararg_buffer117);
     HEAPF64[tempDoublePtr>>3]=$592;HEAP32[$vararg_ptr119>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr119+4>>2]=HEAP32[tempDoublePtr+4>>2];
     (_printf(((1568)|0),($vararg_buffer117|0))|0);
     $1 = 1;
     $626 = $1;
     STACKTOP = sp;return ($626|0);
    }
   } while(0);
   $i = 0;
   while(1) {
    $593 = $i;
    $594 = HEAP32[$pass_count>>2]|0;
    $595 = ($593|0)<($594|0);
    if (!($595)) {
     break;
    }
    $596 = $i;
    $597 = $kernels;
    $598 = (($597) + ($596<<2)|0);
    $599 = HEAP32[$598>>2]|0;
    (_clReleaseKernel(($599|0))|0);
    $600 = $i;
    $601 = $programs;
    $602 = (($601) + ($600<<2)|0);
    $603 = HEAP32[$602>>2]|0;
    (_clReleaseProgram(($603|0))|0);
    $604 = $i;
    $605 = (($604) + 1)|0;
    $i = $605;
   }
   $606 = $input_buffer;
   (_clReleaseMemObject(($606|0))|0);
   $607 = $output_buffer;
   (_clReleaseMemObject(($607|0))|0);
   $608 = $partials_buffer;
   (_clReleaseMemObject(($608|0))|0);
   $609 = $commands;
   (_clReleaseCommandQueue(($609|0))|0);
   $610 = $context;
   (_clReleaseContext(($610|0))|0);
   $611 = HEAP32[$group_counts>>2]|0;
   $612 = $611;
   _free($612);
   $613 = HEAP32[$work_item_counts>>2]|0;
   $614 = $613;
   _free($614);
   $615 = HEAP32[$operation_counts>>2]|0;
   $616 = $615;
   _free($616);
   $617 = HEAP32[$entry_counts>>2]|0;
   $618 = $617;
   _free($618);
   $619 = $computed_result;
   _free($619);
   $620 = $kernels;
   $621 = $620;
   _free($621);
   $622 = $float_data;
   $623 = $622;
   _free($623);
   $624 = $integer_data;
   $625 = $624;
   _free($625);
   $1 = 0;
   $626 = $1;
   STACKTOP = sp;return ($626|0);
  }
 }
 return 0|0;
}
function _load_program_source($filename) {
 $filename = $filename|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $fh = 0, $source = 0, $statbuf = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0;
 $statbuf = sp + 16|0;
 $2 = $filename;
 $3 = $2;
 $4 = (_fopen(($3|0),((1672)|0))|0);
 $fh = $4;
 $5 = $fh;
 $6 = ($5|0)==(0|0);
 if ($6) {
  $1 = 0;
  $21 = $1;
  STACKTOP = sp;return ($21|0);
 } else {
  $7 = $2;
  (_stat(($7|0),($statbuf|0))|0);
  $8 = (($statbuf) + 36|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = (($9) + 1)|0;
  $11 = (_malloc($10)|0);
  $source = $11;
  $12 = $source;
  $13 = (($statbuf) + 36|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = $fh;
  (_fread(($12|0),($14|0),1,($15|0))|0);
  $16 = (($statbuf) + 36|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $source;
  $19 = (($18) + ($17)|0);
  HEAP8[$19] = 0;
  $20 = $source;
  $1 = $20;
  $21 = $1;
  STACKTOP = sp;return ($21|0);
 }
 return 0|0;
}
function _subtract_time_in_seconds($endtime,$starttime) {
 $endtime = +$endtime;
 $starttime = +$starttime;
 var $1 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $endtime;
 $2 = $starttime;
 $3 = $1;
 $4 = $2;
 $5 = $3 - $4;
 $6 = 0.00100000004749745130539 * $5;
 STACKTOP = sp;return (+$6);
}
function _current_time() {
 var $1 = 0, $2 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = (_emscripten_get_now()|0);
 $2 = (+($1|0));
 STACKTOP = sp;return (+$2);
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$c$i$i = 0, $$c6$i$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0;
 var $$sum$i$i = 0, $$sum$i$i$i = 0, $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0;
 var $$sum108$i = 0, $$sum109$i = 0, $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0;
 var $$sum13$i$i = 0, $$sum14$i$i = 0, $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0;
 var $$sum21$i$i = 0, $$sum22$i$i = 0, $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0;
 var $$sum4$i28 = 0, $$sum40$i$i = 0, $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $1 = 0, $10 = 0, $100 = 0;
 var $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0;
 var $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0;
 var $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0;
 var $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0;
 var $1073 = 0, $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $1080 = 0, $1081 = 0, $1082 = 0, $1083 = 0, $1084 = 0, $1085 = 0, $1086 = 0, $1087 = 0, $1088 = 0, $1089 = 0, $109 = 0, $1090 = 0;
 var $1091 = 0, $1092 = 0, $1093 = 0, $1094 = 0, $1095 = 0, $1096 = 0, $1097 = 0, $1098 = 0, $1099 = 0, $11 = 0, $110 = 0, $1100 = 0, $1101 = 0, $1102 = 0, $1103 = 0, $1104 = 0, $1105 = 0, $1106 = 0, $1107 = 0, $1108 = 0;
 var $1109 = 0, $111 = 0, $1110 = 0, $1111 = 0, $1112 = 0, $1113 = 0, $1114 = 0, $1114$phi = 0, $1115 = 0, $1116 = 0, $1117 = 0, $1118 = 0, $1119 = 0, $112 = 0, $1120 = 0, $1121 = 0, $1122 = 0, $1123 = 0, $1124 = 0, $1125 = 0;
 var $1126 = 0, $1127 = 0, $1128 = 0, $1129 = 0, $113 = 0, $1130 = 0, $1131 = 0, $1132 = 0, $1133 = 0, $1134 = 0, $1135 = 0, $1136 = 0, $1137 = 0, $1138 = 0, $1139 = 0, $114 = 0, $1140 = 0, $1141 = 0, $1142 = 0, $1143 = 0;
 var $1144 = 0, $1145 = 0, $1146 = 0, $1147 = 0, $1148 = 0, $1149 = 0, $115 = 0, $1150 = 0, $1151 = 0, $1152 = 0, $1153 = 0, $1154 = 0, $1155 = 0, $1156 = 0, $1157 = 0, $1158 = 0, $1159 = 0, $116 = 0, $1160 = 0, $1161 = 0;
 var $1162 = 0, $1163 = 0, $1164 = 0, $1165 = 0, $1166 = 0, $1167 = 0, $1168 = 0, $1169 = 0, $117 = 0, $1170 = 0, $1171 = 0, $1172 = 0, $1173 = 0, $1174 = 0, $1175 = 0, $1176 = 0, $1177 = 0, $1178 = 0, $1179 = 0, $118 = 0;
 var $1180 = 0, $1181 = 0, $1182 = 0, $1183 = 0, $1184 = 0, $1185 = 0, $1186 = 0, $1187 = 0, $1188 = 0, $1189 = 0, $119 = 0, $1190 = 0, $1191 = 0, $1192 = 0, $1193 = 0, $1194 = 0, $1195 = 0, $1196 = 0, $1197 = 0, $1198 = 0;
 var $1199 = 0, $12 = 0, $120 = 0, $1200 = 0, $1201 = 0, $1202 = 0, $1203 = 0, $1204 = 0, $1205 = 0, $1206 = 0, $1207 = 0, $1208 = 0, $1209 = 0, $121 = 0, $1210 = 0, $1211 = 0, $1212 = 0, $1213 = 0, $1214 = 0, $1215 = 0;
 var $1216 = 0, $1217 = 0, $1218 = 0, $1219 = 0, $122 = 0, $1220 = 0, $1221 = 0, $1222 = 0, $1223 = 0, $1224 = 0, $1225 = 0, $1226 = 0, $1227 = 0, $1228 = 0, $1229 = 0, $123 = 0, $1230 = 0, $1231 = 0, $1232 = 0, $1233 = 0;
 var $1234 = 0, $1235 = 0, $1236 = 0, $1237 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
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
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$phi = 0, $R$0$i$phi = 0, $R$0$i18 = 0, $R$0$i18$phi = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$phi = 0, $RP$0$i$phi = 0;
 var $RP$0$i17 = 0, $RP$0$i17$phi = 0, $T$0$c$i$i = 0, $T$0$c7$i$i = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0, $T$013$i$i$phi = 0, $T$024$i = 0, $T$024$i$phi = 0, $T$051$i$i = 0, $T$051$i$i$phi = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $i$02$i$i$phi = 0;
 var $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0;
 var $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rsize$329$i$phi = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0;
 var $t$2$v$3$i = 0, $t$228$i = 0, $t$228$i$phi = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$330$i = 0, $v$330$i$phi = 0, label = 0, sp = 0;
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
   $7 = HEAP32[((1680))>>2]|0;
   $8 = $7 >>> $6;
   $9 = $8 & 3;
   $10 = ($9|0)==(0);
   if (!($10)) {
    $11 = $8 & 1;
    $12 = $11 ^ 1;
    $13 = (($12) + ($6))|0;
    $14 = $13 << 1;
    $15 = (((1680) + ($14<<2)|0) + 40|0);
    $16 = $15;
    $$sum10 = (($14) + 2)|0;
    $17 = (((1680) + ($$sum10<<2)|0) + 40|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = (($18) + 8|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = ($16|0)==($20|0);
    do {
     if ($21) {
      $22 = 1 << $13;
      $23 = $22 ^ -1;
      $24 = $7 & $23;
      HEAP32[((1680))>>2] = $24;
     } else {
      $25 = $20;
      $26 = HEAP32[(((1680) + 16|0))>>2]|0;
      $27 = ($25>>>0)<($26>>>0);
      if ($27) {
       _abort();
       // unreachable;
      }
      $28 = (($20) + 12|0);
      $29 = HEAP32[$28>>2]|0;
      $30 = ($29|0)==($18|0);
      if ($30) {
       HEAP32[$28>>2] = $16;
       HEAP32[$17>>2] = $20;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $31 = $13 << 3;
    $32 = $31 | 3;
    $33 = (($18) + 4|0);
    HEAP32[$33>>2] = $32;
    $34 = $18;
    $$sum1112 = $31 | 4;
    $35 = (($34) + ($$sum1112)|0);
    $36 = $35;
    $37 = HEAP32[$36>>2]|0;
    $38 = $37 | 1;
    HEAP32[$36>>2] = $38;
    $39 = $19;
    $mem$0 = $39;
    STACKTOP = sp;return ($mem$0|0);
   }
   $40 = HEAP32[(((1680) + 8|0))>>2]|0;
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
    $72 = (((1680) + ($71<<2)|0) + 40|0);
    $73 = $72;
    $$sum4 = (($71) + 2)|0;
    $74 = (((1680) + ($$sum4<<2)|0) + 40|0);
    $75 = HEAP32[$74>>2]|0;
    $76 = (($75) + 8|0);
    $77 = HEAP32[$76>>2]|0;
    $78 = ($73|0)==($77|0);
    do {
     if ($78) {
      $79 = 1 << $70;
      $80 = $79 ^ -1;
      $81 = $7 & $80;
      HEAP32[((1680))>>2] = $81;
     } else {
      $82 = $77;
      $83 = HEAP32[(((1680) + 16|0))>>2]|0;
      $84 = ($82>>>0)<($83>>>0);
      if ($84) {
       _abort();
       // unreachable;
      }
      $85 = (($77) + 12|0);
      $86 = HEAP32[$85>>2]|0;
      $87 = ($86|0)==($75|0);
      if ($87) {
       HEAP32[$85>>2] = $73;
       HEAP32[$74>>2] = $77;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $88 = $70 << 3;
    $89 = (($88) - ($5))|0;
    $90 = $5 | 3;
    $91 = (($75) + 4|0);
    HEAP32[$91>>2] = $90;
    $92 = $75;
    $93 = (($92) + ($5)|0);
    $94 = $93;
    $95 = $89 | 1;
    $$sum56 = $5 | 4;
    $96 = (($92) + ($$sum56)|0);
    $97 = $96;
    HEAP32[$97>>2] = $95;
    $98 = (($92) + ($88)|0);
    $99 = $98;
    HEAP32[$99>>2] = $89;
    $100 = HEAP32[(((1680) + 8|0))>>2]|0;
    $101 = ($100|0)==(0);
    if (!($101)) {
     $102 = HEAP32[(((1680) + 20|0))>>2]|0;
     $103 = $100 >>> 3;
     $104 = $103 << 1;
     $105 = (((1680) + ($104<<2)|0) + 40|0);
     $106 = $105;
     $107 = HEAP32[((1680))>>2]|0;
     $108 = 1 << $103;
     $109 = $107 & $108;
     $110 = ($109|0)==(0);
     do {
      if ($110) {
       $111 = $107 | $108;
       HEAP32[((1680))>>2] = $111;
       $$sum8$pre = (($104) + 2)|0;
       $$pre = (((1680) + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $106;
      } else {
       $$sum9 = (($104) + 2)|0;
       $112 = (((1680) + ($$sum9<<2)|0) + 40|0);
       $113 = HEAP32[$112>>2]|0;
       $114 = $113;
       $115 = HEAP32[(((1680) + 16|0))>>2]|0;
       $116 = ($114>>>0)<($115>>>0);
       if (!($116)) {
        $$pre$phiZ2D = $112;$F4$0 = $113;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     HEAP32[$$pre$phiZ2D>>2] = $102;
     $117 = (($F4$0) + 12|0);
     HEAP32[$117>>2] = $102;
     $118 = (($102) + 8|0);
     HEAP32[$118>>2] = $F4$0;
     $119 = (($102) + 12|0);
     HEAP32[$119>>2] = $106;
    }
    HEAP32[(((1680) + 8|0))>>2] = $89;
    HEAP32[(((1680) + 20|0))>>2] = $94;
    $120 = $76;
    $mem$0 = $120;
    STACKTOP = sp;return ($mem$0|0);
   }
   $121 = HEAP32[(((1680) + 4|0))>>2]|0;
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
   $146 = (((1680) + ($145<<2)|0) + 304|0);
   $147 = HEAP32[$146>>2]|0;
   $148 = (($147) + 4|0);
   $149 = HEAP32[$148>>2]|0;
   $150 = $149 & -8;
   $151 = (($150) - ($5))|0;
   $rsize$0$i = $151;$t$0$i = $147;$v$0$i = $147;
   while(1) {
    $152 = (($t$0$i) + 16|0);
    $153 = HEAP32[$152>>2]|0;
    $154 = ($153|0)==(0|0);
    if ($154) {
     $155 = (($t$0$i) + 20|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==(0|0);
     if ($157) {
      break;
     } else {
      $158 = $156;
     }
    } else {
     $158 = $153;
    }
    $159 = (($158) + 4|0);
    $160 = HEAP32[$159>>2]|0;
    $161 = $160 & -8;
    $162 = (($161) - ($5))|0;
    $163 = ($162>>>0)<($rsize$0$i>>>0);
    $$rsize$0$i = $163 ? $162 : $rsize$0$i;
    $$v$0$i = $163 ? $158 : $v$0$i;
    $rsize$0$i = $$rsize$0$i;$t$0$i = $158;$v$0$i = $$v$0$i;
   }
   $164 = $v$0$i;
   $165 = HEAP32[(((1680) + 16|0))>>2]|0;
   $166 = ($164>>>0)<($165>>>0);
   if ($166) {
    _abort();
    // unreachable;
   }
   $167 = (($164) + ($5)|0);
   $168 = $167;
   $169 = ($164>>>0)<($167>>>0);
   if (!($169)) {
    _abort();
    // unreachable;
   }
   $170 = (($v$0$i) + 24|0);
   $171 = HEAP32[$170>>2]|0;
   $172 = (($v$0$i) + 12|0);
   $173 = HEAP32[$172>>2]|0;
   $174 = ($173|0)==($v$0$i|0);
   do {
    if ($174) {
     $185 = (($v$0$i) + 20|0);
     $186 = HEAP32[$185>>2]|0;
     $187 = ($186|0)==(0|0);
     if ($187) {
      $188 = (($v$0$i) + 16|0);
      $189 = HEAP32[$188>>2]|0;
      $190 = ($189|0)==(0|0);
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
      $191 = (($R$0$i) + 20|0);
      $192 = HEAP32[$191>>2]|0;
      $193 = ($192|0)==(0|0);
      if (!($193)) {
       $RP$0$i$phi = $191;$R$0$i$phi = $192;$RP$0$i = $RP$0$i$phi;$R$0$i = $R$0$i$phi;
       continue;
      }
      $194 = (($R$0$i) + 16|0);
      $195 = HEAP32[$194>>2]|0;
      $196 = ($195|0)==(0|0);
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
      // unreachable;
     } else {
      HEAP32[$RP$0$i>>2] = 0;
      $R$1$i = $R$0$i;
      break;
     }
    } else {
     $175 = (($v$0$i) + 8|0);
     $176 = HEAP32[$175>>2]|0;
     $177 = $176;
     $178 = ($177>>>0)<($165>>>0);
     if ($178) {
      _abort();
      // unreachable;
     }
     $179 = (($176) + 12|0);
     $180 = HEAP32[$179>>2]|0;
     $181 = ($180|0)==($v$0$i|0);
     if (!($181)) {
      _abort();
      // unreachable;
     }
     $182 = (($173) + 8|0);
     $183 = HEAP32[$182>>2]|0;
     $184 = ($183|0)==($v$0$i|0);
     if ($184) {
      HEAP32[$179>>2] = $173;
      HEAP32[$182>>2] = $176;
      $R$1$i = $173;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $199 = ($171|0)==(0|0);
   L78: do {
    if (!($199)) {
     $200 = (($v$0$i) + 28|0);
     $201 = HEAP32[$200>>2]|0;
     $202 = (((1680) + ($201<<2)|0) + 304|0);
     $203 = HEAP32[$202>>2]|0;
     $204 = ($v$0$i|0)==($203|0);
     do {
      if ($204) {
       HEAP32[$202>>2] = $R$1$i;
       $cond$i = ($R$1$i|0)==(0|0);
       if (!($cond$i)) {
        break;
       }
       $205 = 1 << $201;
       $206 = $205 ^ -1;
       $207 = HEAP32[(((1680) + 4|0))>>2]|0;
       $208 = $207 & $206;
       HEAP32[(((1680) + 4|0))>>2] = $208;
       break L78;
      } else {
       $209 = $171;
       $210 = HEAP32[(((1680) + 16|0))>>2]|0;
       $211 = ($209>>>0)<($210>>>0);
       if ($211) {
        _abort();
        // unreachable;
       }
       $212 = (($171) + 16|0);
       $213 = HEAP32[$212>>2]|0;
       $214 = ($213|0)==($v$0$i|0);
       if ($214) {
        HEAP32[$212>>2] = $R$1$i;
       } else {
        $215 = (($171) + 20|0);
        HEAP32[$215>>2] = $R$1$i;
       }
       $216 = ($R$1$i|0)==(0|0);
       if ($216) {
        break L78;
       }
      }
     } while(0);
     $217 = $R$1$i;
     $218 = HEAP32[(((1680) + 16|0))>>2]|0;
     $219 = ($217>>>0)<($218>>>0);
     if ($219) {
      _abort();
      // unreachable;
     }
     $220 = (($R$1$i) + 24|0);
     HEAP32[$220>>2] = $171;
     $221 = (($v$0$i) + 16|0);
     $222 = HEAP32[$221>>2]|0;
     $223 = ($222|0)==(0|0);
     do {
      if (!($223)) {
       $224 = $222;
       $225 = HEAP32[(((1680) + 16|0))>>2]|0;
       $226 = ($224>>>0)<($225>>>0);
       if ($226) {
        _abort();
        // unreachable;
       } else {
        $227 = (($R$1$i) + 16|0);
        HEAP32[$227>>2] = $222;
        $228 = (($222) + 24|0);
        HEAP32[$228>>2] = $R$1$i;
        break;
       }
      }
     } while(0);
     $229 = (($v$0$i) + 20|0);
     $230 = HEAP32[$229>>2]|0;
     $231 = ($230|0)==(0|0);
     if ($231) {
      break;
     }
     $232 = $230;
     $233 = HEAP32[(((1680) + 16|0))>>2]|0;
     $234 = ($232>>>0)<($233>>>0);
     if ($234) {
      _abort();
      // unreachable;
     } else {
      $235 = (($R$1$i) + 20|0);
      HEAP32[$235>>2] = $230;
      $236 = (($230) + 24|0);
      HEAP32[$236>>2] = $R$1$i;
      break;
     }
    }
   } while(0);
   $237 = ($rsize$0$i>>>0)<(16);
   if ($237) {
    $238 = (($rsize$0$i) + ($5))|0;
    $239 = $238 | 3;
    $240 = (($v$0$i) + 4|0);
    HEAP32[$240>>2] = $239;
    $$sum4$i = (($238) + 4)|0;
    $241 = (($164) + ($$sum4$i)|0);
    $242 = $241;
    $243 = HEAP32[$242>>2]|0;
    $244 = $243 | 1;
    HEAP32[$242>>2] = $244;
   } else {
    $245 = $5 | 3;
    $246 = (($v$0$i) + 4|0);
    HEAP32[$246>>2] = $245;
    $247 = $rsize$0$i | 1;
    $$sum$i35 = $5 | 4;
    $248 = (($164) + ($$sum$i35)|0);
    $249 = $248;
    HEAP32[$249>>2] = $247;
    $$sum1$i = (($rsize$0$i) + ($5))|0;
    $250 = (($164) + ($$sum1$i)|0);
    $251 = $250;
    HEAP32[$251>>2] = $rsize$0$i;
    $252 = HEAP32[(((1680) + 8|0))>>2]|0;
    $253 = ($252|0)==(0);
    if (!($253)) {
     $254 = HEAP32[(((1680) + 20|0))>>2]|0;
     $255 = $252 >>> 3;
     $256 = $255 << 1;
     $257 = (((1680) + ($256<<2)|0) + 40|0);
     $258 = $257;
     $259 = HEAP32[((1680))>>2]|0;
     $260 = 1 << $255;
     $261 = $259 & $260;
     $262 = ($261|0)==(0);
     do {
      if ($262) {
       $263 = $259 | $260;
       HEAP32[((1680))>>2] = $263;
       $$sum2$pre$i = (($256) + 2)|0;
       $$pre$i = (((1680) + ($$sum2$pre$i<<2)|0) + 40|0);
       $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $258;
      } else {
       $$sum3$i = (($256) + 2)|0;
       $264 = (((1680) + ($$sum3$i<<2)|0) + 40|0);
       $265 = HEAP32[$264>>2]|0;
       $266 = $265;
       $267 = HEAP32[(((1680) + 16|0))>>2]|0;
       $268 = ($266>>>0)<($267>>>0);
       if (!($268)) {
        $$pre$phi$iZ2D = $264;$F1$0$i = $265;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     HEAP32[$$pre$phi$iZ2D>>2] = $254;
     $269 = (($F1$0$i) + 12|0);
     HEAP32[$269>>2] = $254;
     $270 = (($254) + 8|0);
     HEAP32[$270>>2] = $F1$0$i;
     $271 = (($254) + 12|0);
     HEAP32[$271>>2] = $258;
    }
    HEAP32[(((1680) + 8|0))>>2] = $rsize$0$i;
    HEAP32[(((1680) + 20|0))>>2] = $168;
   }
   $272 = (($v$0$i) + 8|0);
   $273 = $272;
   $mem$0 = $273;
   STACKTOP = sp;return ($mem$0|0);
  } else {
   $274 = ($bytes>>>0)>(4294967231);
   if ($274) {
    $nb$0 = -1;
    break;
   }
   $275 = (($bytes) + 11)|0;
   $276 = $275 & -8;
   $277 = HEAP32[(((1680) + 4|0))>>2]|0;
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
   $305 = (((1680) + ($idx$0$i<<2)|0) + 304|0);
   $306 = HEAP32[$305>>2]|0;
   $307 = ($306|0)==(0|0);
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
     $rsize$0$i15 = $279;$rst$0$i = 0;$sizebits$0$i = $312;$t$0$i14 = $306;$v$0$i16 = 0;
     while(1) {
      $313 = (($t$0$i14) + 4|0);
      $314 = HEAP32[$313>>2]|0;
      $315 = $314 & -8;
      $316 = (($315) - ($276))|0;
      $317 = ($316>>>0)<($rsize$0$i15>>>0);
      if ($317) {
       $318 = ($315|0)==($276|0);
       if ($318) {
        $rsize$2$i = $316;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
        break L126;
       } else {
        $rsize$1$i = $316;$v$1$i = $t$0$i14;
       }
      } else {
       $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
      }
      $319 = (($t$0$i14) + 20|0);
      $320 = HEAP32[$319>>2]|0;
      $321 = $sizebits$0$i >>> 31;
      $322 = ((($t$0$i14) + ($321<<2)|0) + 16|0);
      $323 = HEAP32[$322>>2]|0;
      $324 = ($320|0)==(0|0);
      $325 = ($320|0)==($323|0);
      $or$cond$i = $324 | $325;
      $rst$1$i = $or$cond$i ? $rst$0$i : $320;
      $326 = ($323|0)==(0|0);
      $327 = $sizebits$0$i << 1;
      if ($326) {
       $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
       break;
      } else {
       $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $327;$t$0$i14 = $323;$v$0$i16 = $v$1$i;
      }
     }
    }
   } while(0);
   $328 = ($t$1$i|0)==(0|0);
   $329 = ($v$2$i|0)==(0|0);
   $or$cond19$i = $328 & $329;
   if ($or$cond19$i) {
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
    $358 = (((1680) + ($357<<2)|0) + 304|0);
    $359 = HEAP32[$358>>2]|0;
    $t$2$ph$i = $359;
   } else {
    $t$2$ph$i = $t$1$i;
   }
   $360 = ($t$2$ph$i|0)==(0|0);
   if ($360) {
    $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
   } else {
    $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
    while(1) {
     $361 = (($t$228$i) + 4|0);
     $362 = HEAP32[$361>>2]|0;
     $363 = $362 & -8;
     $364 = (($363) - ($276))|0;
     $365 = ($364>>>0)<($rsize$329$i>>>0);
     $$rsize$3$i = $365 ? $364 : $rsize$329$i;
     $t$2$v$3$i = $365 ? $t$228$i : $v$330$i;
     $366 = (($t$228$i) + 16|0);
     $367 = HEAP32[$366>>2]|0;
     $368 = ($367|0)==(0|0);
     if (!($368)) {
      $v$330$i$phi = $t$2$v$3$i;$t$228$i$phi = $367;$rsize$329$i$phi = $$rsize$3$i;$v$330$i = $v$330$i$phi;$t$228$i = $t$228$i$phi;$rsize$329$i = $rsize$329$i$phi;
      continue;
     }
     $369 = (($t$228$i) + 20|0);
     $370 = HEAP32[$369>>2]|0;
     $371 = ($370|0)==(0|0);
     if ($371) {
      $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
      break;
     } else {
      $v$330$i$phi = $t$2$v$3$i;$rsize$329$i$phi = $$rsize$3$i;$t$228$i = $370;$v$330$i = $v$330$i$phi;$rsize$329$i = $rsize$329$i$phi;
     }
    }
   }
   $372 = ($v$3$lcssa$i|0)==(0|0);
   if ($372) {
    $nb$0 = $276;
    break;
   }
   $373 = HEAP32[(((1680) + 8|0))>>2]|0;
   $374 = (($373) - ($276))|0;
   $375 = ($rsize$3$lcssa$i>>>0)<($374>>>0);
   if (!($375)) {
    $nb$0 = $276;
    break;
   }
   $376 = $v$3$lcssa$i;
   $377 = HEAP32[(((1680) + 16|0))>>2]|0;
   $378 = ($376>>>0)<($377>>>0);
   if ($378) {
    _abort();
    // unreachable;
   }
   $379 = (($376) + ($276)|0);
   $380 = $379;
   $381 = ($376>>>0)<($379>>>0);
   if (!($381)) {
    _abort();
    // unreachable;
   }
   $382 = (($v$3$lcssa$i) + 24|0);
   $383 = HEAP32[$382>>2]|0;
   $384 = (($v$3$lcssa$i) + 12|0);
   $385 = HEAP32[$384>>2]|0;
   $386 = ($385|0)==($v$3$lcssa$i|0);
   do {
    if ($386) {
     $397 = (($v$3$lcssa$i) + 20|0);
     $398 = HEAP32[$397>>2]|0;
     $399 = ($398|0)==(0|0);
     if ($399) {
      $400 = (($v$3$lcssa$i) + 16|0);
      $401 = HEAP32[$400>>2]|0;
      $402 = ($401|0)==(0|0);
      if ($402) {
       $R$1$i20 = 0;
       break;
      } else {
       $R$0$i18 = $401;$RP$0$i17 = $400;
      }
     } else {
      $R$0$i18 = $398;$RP$0$i17 = $397;
     }
     while(1) {
      $403 = (($R$0$i18) + 20|0);
      $404 = HEAP32[$403>>2]|0;
      $405 = ($404|0)==(0|0);
      if (!($405)) {
       $RP$0$i17$phi = $403;$R$0$i18$phi = $404;$RP$0$i17 = $RP$0$i17$phi;$R$0$i18 = $R$0$i18$phi;
       continue;
      }
      $406 = (($R$0$i18) + 16|0);
      $407 = HEAP32[$406>>2]|0;
      $408 = ($407|0)==(0|0);
      if ($408) {
       break;
      } else {
       $R$0$i18 = $407;$RP$0$i17 = $406;
      }
     }
     $409 = $RP$0$i17;
     $410 = ($409>>>0)<($377>>>0);
     if ($410) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0$i17>>2] = 0;
      $R$1$i20 = $R$0$i18;
      break;
     }
    } else {
     $387 = (($v$3$lcssa$i) + 8|0);
     $388 = HEAP32[$387>>2]|0;
     $389 = $388;
     $390 = ($389>>>0)<($377>>>0);
     if ($390) {
      _abort();
      // unreachable;
     }
     $391 = (($388) + 12|0);
     $392 = HEAP32[$391>>2]|0;
     $393 = ($392|0)==($v$3$lcssa$i|0);
     if (!($393)) {
      _abort();
      // unreachable;
     }
     $394 = (($385) + 8|0);
     $395 = HEAP32[$394>>2]|0;
     $396 = ($395|0)==($v$3$lcssa$i|0);
     if ($396) {
      HEAP32[$391>>2] = $385;
      HEAP32[$394>>2] = $388;
      $R$1$i20 = $385;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $411 = ($383|0)==(0|0);
   L176: do {
    if (!($411)) {
     $412 = (($v$3$lcssa$i) + 28|0);
     $413 = HEAP32[$412>>2]|0;
     $414 = (((1680) + ($413<<2)|0) + 304|0);
     $415 = HEAP32[$414>>2]|0;
     $416 = ($v$3$lcssa$i|0)==($415|0);
     do {
      if ($416) {
       HEAP32[$414>>2] = $R$1$i20;
       $cond$i21 = ($R$1$i20|0)==(0|0);
       if (!($cond$i21)) {
        break;
       }
       $417 = 1 << $413;
       $418 = $417 ^ -1;
       $419 = HEAP32[(((1680) + 4|0))>>2]|0;
       $420 = $419 & $418;
       HEAP32[(((1680) + 4|0))>>2] = $420;
       break L176;
      } else {
       $421 = $383;
       $422 = HEAP32[(((1680) + 16|0))>>2]|0;
       $423 = ($421>>>0)<($422>>>0);
       if ($423) {
        _abort();
        // unreachable;
       }
       $424 = (($383) + 16|0);
       $425 = HEAP32[$424>>2]|0;
       $426 = ($425|0)==($v$3$lcssa$i|0);
       if ($426) {
        HEAP32[$424>>2] = $R$1$i20;
       } else {
        $427 = (($383) + 20|0);
        HEAP32[$427>>2] = $R$1$i20;
       }
       $428 = ($R$1$i20|0)==(0|0);
       if ($428) {
        break L176;
       }
      }
     } while(0);
     $429 = $R$1$i20;
     $430 = HEAP32[(((1680) + 16|0))>>2]|0;
     $431 = ($429>>>0)<($430>>>0);
     if ($431) {
      _abort();
      // unreachable;
     }
     $432 = (($R$1$i20) + 24|0);
     HEAP32[$432>>2] = $383;
     $433 = (($v$3$lcssa$i) + 16|0);
     $434 = HEAP32[$433>>2]|0;
     $435 = ($434|0)==(0|0);
     do {
      if (!($435)) {
       $436 = $434;
       $437 = HEAP32[(((1680) + 16|0))>>2]|0;
       $438 = ($436>>>0)<($437>>>0);
       if ($438) {
        _abort();
        // unreachable;
       } else {
        $439 = (($R$1$i20) + 16|0);
        HEAP32[$439>>2] = $434;
        $440 = (($434) + 24|0);
        HEAP32[$440>>2] = $R$1$i20;
        break;
       }
      }
     } while(0);
     $441 = (($v$3$lcssa$i) + 20|0);
     $442 = HEAP32[$441>>2]|0;
     $443 = ($442|0)==(0|0);
     if ($443) {
      break;
     }
     $444 = $442;
     $445 = HEAP32[(((1680) + 16|0))>>2]|0;
     $446 = ($444>>>0)<($445>>>0);
     if ($446) {
      _abort();
      // unreachable;
     } else {
      $447 = (($R$1$i20) + 20|0);
      HEAP32[$447>>2] = $442;
      $448 = (($442) + 24|0);
      HEAP32[$448>>2] = $R$1$i20;
      break;
     }
    }
   } while(0);
   $449 = ($rsize$3$lcssa$i>>>0)<(16);
   L204: do {
    if ($449) {
     $450 = (($rsize$3$lcssa$i) + ($276))|0;
     $451 = $450 | 3;
     $452 = (($v$3$lcssa$i) + 4|0);
     HEAP32[$452>>2] = $451;
     $$sum18$i = (($450) + 4)|0;
     $453 = (($376) + ($$sum18$i)|0);
     $454 = $453;
     $455 = HEAP32[$454>>2]|0;
     $456 = $455 | 1;
     HEAP32[$454>>2] = $456;
    } else {
     $457 = $276 | 3;
     $458 = (($v$3$lcssa$i) + 4|0);
     HEAP32[$458>>2] = $457;
     $459 = $rsize$3$lcssa$i | 1;
     $$sum$i2334 = $276 | 4;
     $460 = (($376) + ($$sum$i2334)|0);
     $461 = $460;
     HEAP32[$461>>2] = $459;
     $$sum1$i24 = (($rsize$3$lcssa$i) + ($276))|0;
     $462 = (($376) + ($$sum1$i24)|0);
     $463 = $462;
     HEAP32[$463>>2] = $rsize$3$lcssa$i;
     $464 = $rsize$3$lcssa$i >>> 3;
     $465 = ($rsize$3$lcssa$i>>>0)<(256);
     if ($465) {
      $466 = $464 << 1;
      $467 = (((1680) + ($466<<2)|0) + 40|0);
      $468 = $467;
      $469 = HEAP32[((1680))>>2]|0;
      $470 = 1 << $464;
      $471 = $469 & $470;
      $472 = ($471|0)==(0);
      do {
       if ($472) {
        $473 = $469 | $470;
        HEAP32[((1680))>>2] = $473;
        $$sum14$pre$i = (($466) + 2)|0;
        $$pre$i25 = (((1680) + ($$sum14$pre$i<<2)|0) + 40|0);
        $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $468;
       } else {
        $$sum17$i = (($466) + 2)|0;
        $474 = (((1680) + ($$sum17$i<<2)|0) + 40|0);
        $475 = HEAP32[$474>>2]|0;
        $476 = $475;
        $477 = HEAP32[(((1680) + 16|0))>>2]|0;
        $478 = ($476>>>0)<($477>>>0);
        if (!($478)) {
         $$pre$phi$i26Z2D = $474;$F5$0$i = $475;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i26Z2D>>2] = $380;
      $479 = (($F5$0$i) + 12|0);
      HEAP32[$479>>2] = $380;
      $$sum15$i = (($276) + 8)|0;
      $480 = (($376) + ($$sum15$i)|0);
      $481 = $480;
      HEAP32[$481>>2] = $F5$0$i;
      $$sum16$i = (($276) + 12)|0;
      $482 = (($376) + ($$sum16$i)|0);
      $483 = $482;
      HEAP32[$483>>2] = $468;
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
     $510 = (((1680) + ($I7$0$i<<2)|0) + 304|0);
     $$sum2$i = (($276) + 28)|0;
     $511 = (($376) + ($$sum2$i)|0);
     $512 = $511;
     HEAP32[$512>>2] = $I7$0$i;
     $$sum3$i27 = (($276) + 16)|0;
     $513 = (($376) + ($$sum3$i27)|0);
     $$sum4$i28 = (($276) + 20)|0;
     $514 = (($376) + ($$sum4$i28)|0);
     $515 = $514;
     HEAP32[$515>>2] = 0;
     $516 = $513;
     HEAP32[$516>>2] = 0;
     $517 = HEAP32[(((1680) + 4|0))>>2]|0;
     $518 = 1 << $I7$0$i;
     $519 = $517 & $518;
     $520 = ($519|0)==(0);
     if ($520) {
      $521 = $517 | $518;
      HEAP32[(((1680) + 4|0))>>2] = $521;
      HEAP32[$510>>2] = $484;
      $522 = $510;
      $$sum5$i = (($276) + 24)|0;
      $523 = (($376) + ($$sum5$i)|0);
      $524 = $523;
      HEAP32[$524>>2] = $522;
      $$sum6$i = (($276) + 12)|0;
      $525 = (($376) + ($$sum6$i)|0);
      $526 = $525;
      HEAP32[$526>>2] = $484;
      $$sum7$i = (($276) + 8)|0;
      $527 = (($376) + ($$sum7$i)|0);
      $528 = $527;
      HEAP32[$528>>2] = $484;
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
     $534 = (($529) + 4|0);
     $535 = HEAP32[$534>>2]|0;
     $536 = $535 & -8;
     $537 = ($536|0)==($rsize$3$lcssa$i|0);
     L225: do {
      if ($537) {
       $T$0$lcssa$i = $529;
      } else {
       $538 = $rsize$3$lcssa$i << $533;
       $K12$025$i = $538;$T$024$i = $529;
       while(1) {
        $544 = $K12$025$i >>> 31;
        $545 = ((($T$024$i) + ($544<<2)|0) + 16|0);
        $546 = HEAP32[$545>>2]|0;
        $547 = ($546|0)==(0|0);
        if ($547) {
         break;
        }
        $539 = $K12$025$i << 1;
        $540 = (($546) + 4|0);
        $541 = HEAP32[$540>>2]|0;
        $542 = $541 & -8;
        $543 = ($542|0)==($rsize$3$lcssa$i|0);
        if ($543) {
         $T$0$lcssa$i = $546;
         break L225;
        } else {
         $T$024$i$phi = $546;$K12$025$i = $539;$T$024$i = $T$024$i$phi;
        }
       }
       $548 = $545;
       $549 = HEAP32[(((1680) + 16|0))>>2]|0;
       $550 = ($548>>>0)<($549>>>0);
       if ($550) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$545>>2] = $484;
        $$sum11$i = (($276) + 24)|0;
        $551 = (($376) + ($$sum11$i)|0);
        $552 = $551;
        HEAP32[$552>>2] = $T$024$i;
        $$sum12$i = (($276) + 12)|0;
        $553 = (($376) + ($$sum12$i)|0);
        $554 = $553;
        HEAP32[$554>>2] = $484;
        $$sum13$i = (($276) + 8)|0;
        $555 = (($376) + ($$sum13$i)|0);
        $556 = $555;
        HEAP32[$556>>2] = $484;
        break L204;
       }
      }
     } while(0);
     $557 = (($T$0$lcssa$i) + 8|0);
     $558 = HEAP32[$557>>2]|0;
     $559 = $T$0$lcssa$i;
     $560 = HEAP32[(((1680) + 16|0))>>2]|0;
     $561 = ($559>>>0)<($560>>>0);
     if ($561) {
      _abort();
      // unreachable;
     }
     $562 = $558;
     $563 = ($562>>>0)<($560>>>0);
     if ($563) {
      _abort();
      // unreachable;
     } else {
      $564 = (($558) + 12|0);
      HEAP32[$564>>2] = $484;
      HEAP32[$557>>2] = $484;
      $$sum8$i = (($276) + 8)|0;
      $565 = (($376) + ($$sum8$i)|0);
      $566 = $565;
      HEAP32[$566>>2] = $558;
      $$sum9$i = (($276) + 12)|0;
      $567 = (($376) + ($$sum9$i)|0);
      $568 = $567;
      HEAP32[$568>>2] = $T$0$lcssa$i;
      $$sum10$i = (($276) + 24)|0;
      $569 = (($376) + ($$sum10$i)|0);
      $570 = $569;
      HEAP32[$570>>2] = 0;
      break;
     }
    }
   } while(0);
   $571 = (($v$3$lcssa$i) + 8|0);
   $572 = $571;
   $mem$0 = $572;
   STACKTOP = sp;return ($mem$0|0);
  }
 } while(0);
 $573 = HEAP32[(((1680) + 8|0))>>2]|0;
 $574 = ($nb$0>>>0)>($573>>>0);
 if (!($574)) {
  $575 = (($573) - ($nb$0))|0;
  $576 = HEAP32[(((1680) + 20|0))>>2]|0;
  $577 = ($575>>>0)>(15);
  if ($577) {
   $578 = $576;
   $579 = (($578) + ($nb$0)|0);
   $580 = $579;
   HEAP32[(((1680) + 20|0))>>2] = $580;
   HEAP32[(((1680) + 8|0))>>2] = $575;
   $581 = $575 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $582 = (($578) + ($$sum2)|0);
   $583 = $582;
   HEAP32[$583>>2] = $581;
   $584 = (($578) + ($573)|0);
   $585 = $584;
   HEAP32[$585>>2] = $575;
   $586 = $nb$0 | 3;
   $587 = (($576) + 4|0);
   HEAP32[$587>>2] = $586;
  } else {
   HEAP32[(((1680) + 8|0))>>2] = 0;
   HEAP32[(((1680) + 20|0))>>2] = 0;
   $588 = $573 | 3;
   $589 = (($576) + 4|0);
   HEAP32[$589>>2] = $588;
   $590 = $576;
   $$sum1 = (($573) + 4)|0;
   $591 = (($590) + ($$sum1)|0);
   $592 = $591;
   $593 = HEAP32[$592>>2]|0;
   $594 = $593 | 1;
   HEAP32[$592>>2] = $594;
  }
  $595 = (($576) + 8|0);
  $596 = $595;
  $mem$0 = $596;
  STACKTOP = sp;return ($mem$0|0);
 }
 $597 = HEAP32[(((1680) + 12|0))>>2]|0;
 $598 = ($nb$0>>>0)<($597>>>0);
 if ($598) {
  $599 = (($597) - ($nb$0))|0;
  HEAP32[(((1680) + 12|0))>>2] = $599;
  $600 = HEAP32[(((1680) + 24|0))>>2]|0;
  $601 = $600;
  $602 = (($601) + ($nb$0)|0);
  $603 = $602;
  HEAP32[(((1680) + 24|0))>>2] = $603;
  $604 = $599 | 1;
  $$sum = (($nb$0) + 4)|0;
  $605 = (($601) + ($$sum)|0);
  $606 = $605;
  HEAP32[$606>>2] = $604;
  $607 = $nb$0 | 3;
  $608 = (($600) + 4|0);
  HEAP32[$608>>2] = $607;
  $609 = (($600) + 8|0);
  $610 = $609;
  $mem$0 = $610;
  STACKTOP = sp;return ($mem$0|0);
 }
 $611 = HEAP32[((2152))>>2]|0;
 $612 = ($611|0)==(0);
 do {
  if ($612) {
   $613 = (_sysconf(30)|0);
   $614 = (($613) + -1)|0;
   $615 = $614 & $613;
   $616 = ($615|0)==(0);
   if ($616) {
    HEAP32[(((2152) + 8|0))>>2] = $613;
    HEAP32[(((2152) + 4|0))>>2] = $613;
    HEAP32[(((2152) + 12|0))>>2] = -1;
    HEAP32[(((2152) + 16|0))>>2] = -1;
    HEAP32[(((2152) + 20|0))>>2] = 0;
    HEAP32[(((1680) + 444|0))>>2] = 0;
    $617 = (_time((0|0))|0);
    $618 = $617 & -16;
    $619 = $618 ^ 1431655768;
    HEAP32[((2152))>>2] = $619;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $620 = (($nb$0) + 48)|0;
 $621 = HEAP32[(((2152) + 8|0))>>2]|0;
 $622 = (($nb$0) + 47)|0;
 $623 = (($621) + ($622))|0;
 $624 = (0 - ($621))|0;
 $625 = $623 & $624;
 $626 = ($625>>>0)>($nb$0>>>0);
 if (!($626)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $627 = HEAP32[(((1680) + 440|0))>>2]|0;
 $628 = ($627|0)==(0);
 do {
  if (!($628)) {
   $629 = HEAP32[(((1680) + 432|0))>>2]|0;
   $630 = (($629) + ($625))|0;
   $631 = ($630>>>0)<=($629>>>0);
   $632 = ($630>>>0)>($627>>>0);
   $or$cond1$i = $631 | $632;
   if ($or$cond1$i) {
    $mem$0 = 0;
   } else {
    break;
   }
   STACKTOP = sp;return ($mem$0|0);
  }
 } while(0);
 $633 = HEAP32[(((1680) + 444|0))>>2]|0;
 $634 = $633 & 4;
 $635 = ($634|0)==(0);
 L269: do {
  if ($635) {
   $636 = HEAP32[(((1680) + 24|0))>>2]|0;
   $637 = ($636|0)==(0|0);
   L271: do {
    if ($637) {
     label = 182;
    } else {
     $638 = $636;
     $sp$0$i$i = (((1680) + 448|0));
     while(1) {
      $639 = ($sp$0$i$i);
      $640 = HEAP32[$639>>2]|0;
      $641 = ($640>>>0)>($638>>>0);
      if (!($641)) {
       $642 = (($sp$0$i$i) + 4|0);
       $643 = HEAP32[$642>>2]|0;
       $644 = (($640) + ($643)|0);
       $645 = ($644>>>0)>($638>>>0);
       if ($645) {
        break;
       }
      }
      $646 = (($sp$0$i$i) + 8|0);
      $647 = HEAP32[$646>>2]|0;
      $648 = ($647|0)==(0|0);
      if ($648) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $647;
      }
     }
     $649 = ($sp$0$i$i|0)==(0|0);
     if ($649) {
      label = 182;
      break;
     }
     $672 = HEAP32[(((1680) + 12|0))>>2]|0;
     $673 = (($623) - ($672))|0;
     $674 = $673 & $624;
     $675 = ($674>>>0)<(2147483647);
     if (!($675)) {
      $tsize$0323841$i = 0;
      break;
     }
     $676 = (_sbrk(($674|0))|0);
     $677 = HEAP32[$639>>2]|0;
     $678 = HEAP32[$642>>2]|0;
     $679 = (($677) + ($678)|0);
     $680 = ($676|0)==($679|0);
     $$3$i = $680 ? $674 : 0;
     $$4$i = $680 ? $676 : (-1);
     $br$0$i = $676;$ssize$1$i = $674;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
     label = 191;
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $650 = (_sbrk(0)|0);
     $651 = ($650|0)==((-1)|0);
     if ($651) {
      $tsize$0323841$i = 0;
      break;
     }
     $652 = $650;
     $653 = HEAP32[(((2152) + 4|0))>>2]|0;
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
     $662 = HEAP32[(((1680) + 432|0))>>2]|0;
     $663 = (($662) + ($ssize$0$i))|0;
     $664 = ($ssize$0$i>>>0)>($nb$0>>>0);
     $665 = ($ssize$0$i>>>0)<(2147483647);
     $or$cond$i29 = $664 & $665;
     if (!($or$cond$i29)) {
      $tsize$0323841$i = 0;
      break;
     }
     $666 = HEAP32[(((1680) + 440|0))>>2]|0;
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
     $670 = (_sbrk(($ssize$0$i|0))|0);
     $671 = ($670|0)==($650|0);
     $ssize$0$$i = $671 ? $ssize$0$i : 0;
     $$$i = $671 ? $650 : (-1);
     $br$0$i = $670;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
     label = 191;
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $681 = (0 - ($ssize$1$i))|0;
     $682 = ($tbase$0$i|0)==((-1)|0);
     if (!($682)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $683 = ($br$0$i|0)!=((-1)|0);
     $684 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $683 & $684;
     $685 = ($ssize$1$i>>>0)<($620>>>0);
     $or$cond6$i = $or$cond5$i & $685;
     do {
      if ($or$cond6$i) {
       $686 = HEAP32[(((2152) + 8|0))>>2]|0;
       $687 = (($622) - ($ssize$1$i))|0;
       $688 = (($687) + ($686))|0;
       $689 = (0 - ($686))|0;
       $690 = $688 & $689;
       $691 = ($690>>>0)<(2147483647);
       if (!($691)) {
        $ssize$2$i = $ssize$1$i;
        break;
       }
       $692 = (_sbrk(($690|0))|0);
       $693 = ($692|0)==((-1)|0);
       if ($693) {
        (_sbrk(($681|0))|0);
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
     $695 = ($br$0$i|0)==((-1)|0);
     if ($695) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $696 = HEAP32[(((1680) + 444|0))>>2]|0;
   $697 = $696 | 4;
   HEAP32[(((1680) + 444|0))>>2] = $697;
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
   $699 = (_sbrk(($625|0))|0);
   $700 = (_sbrk(0)|0);
   $notlhs$i = ($699|0)!=((-1)|0);
   $notrhs$i = ($700|0)!=((-1)|0);
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
   $707 = HEAP32[(((1680) + 432|0))>>2]|0;
   $708 = (($707) + ($tsize$246$i))|0;
   HEAP32[(((1680) + 432|0))>>2] = $708;
   $709 = HEAP32[(((1680) + 436|0))>>2]|0;
   $710 = ($708>>>0)>($709>>>0);
   if ($710) {
    HEAP32[(((1680) + 436|0))>>2] = $708;
   }
   $711 = HEAP32[(((1680) + 24|0))>>2]|0;
   $712 = ($711|0)==(0|0);
   L311: do {
    if ($712) {
     $713 = HEAP32[(((1680) + 16|0))>>2]|0;
     $714 = ($713|0)==(0|0);
     $715 = ($tbase$247$i>>>0)<($713>>>0);
     $or$cond10$i = $714 | $715;
     if ($or$cond10$i) {
      HEAP32[(((1680) + 16|0))>>2] = $tbase$247$i;
     }
     HEAP32[(((1680) + 448|0))>>2] = $tbase$247$i;
     HEAP32[(((1680) + 452|0))>>2] = $tsize$246$i;
     HEAP32[(((1680) + 460|0))>>2] = 0;
     $716 = HEAP32[((2152))>>2]|0;
     HEAP32[(((1680) + 36|0))>>2] = $716;
     HEAP32[(((1680) + 32|0))>>2] = -1;
     $i$02$i$i = 0;
     while(1) {
      $717 = $i$02$i$i << 1;
      $718 = (((1680) + ($717<<2)|0) + 40|0);
      $719 = $718;
      $$sum$i$i = (($717) + 3)|0;
      $720 = (((1680) + ($$sum$i$i<<2)|0) + 40|0);
      HEAP32[$720>>2] = $719;
      $$sum1$i$i = (($717) + 2)|0;
      $721 = (((1680) + ($$sum1$i$i<<2)|0) + 40|0);
      HEAP32[$721>>2] = $719;
      $722 = (($i$02$i$i) + 1)|0;
      $exitcond$i$i = ($722|0)==(32);
      if ($exitcond$i$i) {
       break;
      } else {
       $i$02$i$i$phi = $722;$i$02$i$i = $i$02$i$i$phi;
      }
     }
     $723 = (($tsize$246$i) + -40)|0;
     $724 = (($tbase$247$i) + 8|0);
     $725 = $724;
     $726 = $725 & 7;
     $727 = ($726|0)==(0);
     if ($727) {
      $730 = 0;
     } else {
      $728 = (0 - ($725))|0;
      $729 = $728 & 7;
      $730 = $729;
     }
     $731 = (($tbase$247$i) + ($730)|0);
     $732 = $731;
     $733 = (($723) - ($730))|0;
     HEAP32[(((1680) + 24|0))>>2] = $732;
     HEAP32[(((1680) + 12|0))>>2] = $733;
     $734 = $733 | 1;
     $$sum$i14$i = (($730) + 4)|0;
     $735 = (($tbase$247$i) + ($$sum$i14$i)|0);
     $736 = $735;
     HEAP32[$736>>2] = $734;
     $$sum2$i$i = (($tsize$246$i) + -36)|0;
     $737 = (($tbase$247$i) + ($$sum2$i$i)|0);
     $738 = $737;
     HEAP32[$738>>2] = 40;
     $739 = HEAP32[(((2152) + 16|0))>>2]|0;
     HEAP32[(((1680) + 28|0))>>2] = $739;
    } else {
     $sp$075$i = (((1680) + 448|0));
     while(1) {
      $740 = ($sp$075$i);
      $741 = HEAP32[$740>>2]|0;
      $742 = (($sp$075$i) + 4|0);
      $743 = HEAP32[$742>>2]|0;
      $744 = (($741) + ($743)|0);
      $745 = ($tbase$247$i|0)==($744|0);
      if ($745) {
       label = 214;
       break;
      }
      $746 = (($sp$075$i) + 8|0);
      $747 = HEAP32[$746>>2]|0;
      $748 = ($747|0)==(0|0);
      if ($748) {
       break;
      } else {
       $sp$075$i = $747;
      }
     }
     do {
      if ((label|0) == 214) {
       $749 = (($sp$075$i) + 12|0);
       $750 = HEAP32[$749>>2]|0;
       $751 = $750 & 8;
       $752 = ($751|0)==(0);
       if (!($752)) {
        break;
       }
       $753 = $711;
       $754 = ($753>>>0)>=($741>>>0);
       $755 = ($753>>>0)<($tbase$247$i>>>0);
       $or$cond49$i = $754 & $755;
       if (!($or$cond49$i)) {
        break;
       }
       $756 = (($743) + ($tsize$246$i))|0;
       HEAP32[$742>>2] = $756;
       $757 = HEAP32[(((1680) + 12|0))>>2]|0;
       $758 = (($757) + ($tsize$246$i))|0;
       $759 = (($711) + 8|0);
       $760 = $759;
       $761 = $760 & 7;
       $762 = ($761|0)==(0);
       if ($762) {
        $765 = 0;
       } else {
        $763 = (0 - ($760))|0;
        $764 = $763 & 7;
        $765 = $764;
       }
       $766 = (($753) + ($765)|0);
       $767 = $766;
       $768 = (($758) - ($765))|0;
       HEAP32[(((1680) + 24|0))>>2] = $767;
       HEAP32[(((1680) + 12|0))>>2] = $768;
       $769 = $768 | 1;
       $$sum$i18$i = (($765) + 4)|0;
       $770 = (($753) + ($$sum$i18$i)|0);
       $771 = $770;
       HEAP32[$771>>2] = $769;
       $$sum2$i19$i = (($758) + 4)|0;
       $772 = (($753) + ($$sum2$i19$i)|0);
       $773 = $772;
       HEAP32[$773>>2] = 40;
       $774 = HEAP32[(((2152) + 16|0))>>2]|0;
       HEAP32[(((1680) + 28|0))>>2] = $774;
       break L311;
      }
     } while(0);
     $775 = HEAP32[(((1680) + 16|0))>>2]|0;
     $776 = ($tbase$247$i>>>0)<($775>>>0);
     if ($776) {
      HEAP32[(((1680) + 16|0))>>2] = $tbase$247$i;
     }
     $777 = (($tbase$247$i) + ($tsize$246$i)|0);
     $sp$168$i = (((1680) + 448|0));
     while(1) {
      $778 = ($sp$168$i);
      $779 = HEAP32[$778>>2]|0;
      $780 = ($779|0)==($777|0);
      if ($780) {
       label = 224;
       break;
      }
      $781 = (($sp$168$i) + 8|0);
      $782 = HEAP32[$781>>2]|0;
      $783 = ($782|0)==(0|0);
      if ($783) {
       break;
      } else {
       $sp$168$i = $782;
      }
     }
     do {
      if ((label|0) == 224) {
       $784 = (($sp$168$i) + 12|0);
       $785 = HEAP32[$784>>2]|0;
       $786 = $785 & 8;
       $787 = ($786|0)==(0);
       if (!($787)) {
        break;
       }
       HEAP32[$778>>2] = $tbase$247$i;
       $788 = (($sp$168$i) + 4|0);
       $789 = HEAP32[$788>>2]|0;
       $790 = (($789) + ($tsize$246$i))|0;
       HEAP32[$788>>2] = $790;
       $791 = (($tbase$247$i) + 8|0);
       $792 = $791;
       $793 = $792 & 7;
       $794 = ($793|0)==(0);
       if ($794) {
        $797 = 0;
       } else {
        $795 = (0 - ($792))|0;
        $796 = $795 & 7;
        $797 = $796;
       }
       $798 = (($tbase$247$i) + ($797)|0);
       $$sum107$i = (($tsize$246$i) + 8)|0;
       $799 = (($tbase$247$i) + ($$sum107$i)|0);
       $800 = $799;
       $801 = $800 & 7;
       $802 = ($801|0)==(0);
       if ($802) {
        $805 = 0;
       } else {
        $803 = (0 - ($800))|0;
        $804 = $803 & 7;
        $805 = $804;
       }
       $$sum108$i = (($805) + ($tsize$246$i))|0;
       $806 = (($tbase$247$i) + ($$sum108$i)|0);
       $807 = $806;
       $808 = $806;
       $809 = $798;
       $810 = (($808) - ($809))|0;
       $$sum$i21$i = (($797) + ($nb$0))|0;
       $811 = (($tbase$247$i) + ($$sum$i21$i)|0);
       $812 = $811;
       $813 = (($810) - ($nb$0))|0;
       $814 = $nb$0 | 3;
       $$sum1$i22$i = (($797) + 4)|0;
       $815 = (($tbase$247$i) + ($$sum1$i22$i)|0);
       $816 = $815;
       HEAP32[$816>>2] = $814;
       $817 = HEAP32[(((1680) + 24|0))>>2]|0;
       $818 = ($807|0)==($817|0);
       L348: do {
        if ($818) {
         $819 = HEAP32[(((1680) + 12|0))>>2]|0;
         $820 = (($819) + ($813))|0;
         HEAP32[(((1680) + 12|0))>>2] = $820;
         HEAP32[(((1680) + 24|0))>>2] = $812;
         $821 = $820 | 1;
         $$sum42$i$i = (($$sum$i21$i) + 4)|0;
         $822 = (($tbase$247$i) + ($$sum42$i$i)|0);
         $823 = $822;
         HEAP32[$823>>2] = $821;
        } else {
         $824 = HEAP32[(((1680) + 20|0))>>2]|0;
         $825 = ($807|0)==($824|0);
         if ($825) {
          $826 = HEAP32[(((1680) + 8|0))>>2]|0;
          $827 = (($826) + ($813))|0;
          HEAP32[(((1680) + 8|0))>>2] = $827;
          HEAP32[(((1680) + 20|0))>>2] = $812;
          $828 = $827 | 1;
          $$sum40$i$i = (($$sum$i21$i) + 4)|0;
          $829 = (($tbase$247$i) + ($$sum40$i$i)|0);
          $830 = $829;
          HEAP32[$830>>2] = $828;
          $$sum41$i$i = (($827) + ($$sum$i21$i))|0;
          $831 = (($tbase$247$i) + ($$sum41$i$i)|0);
          $832 = $831;
          HEAP32[$832>>2] = $827;
          break;
         }
         $$sum2$i23$i = (($tsize$246$i) + 4)|0;
         $$sum109$i = (($$sum2$i23$i) + ($805))|0;
         $833 = (($tbase$247$i) + ($$sum109$i)|0);
         $834 = $833;
         $835 = HEAP32[$834>>2]|0;
         $836 = $835 & 3;
         $837 = ($836|0)==(1);
         if ($837) {
          $838 = $835 & -8;
          $839 = $835 >>> 3;
          $840 = ($835>>>0)<(256);
          L356: do {
           if ($840) {
            $$sum3738$i$i = $805 | 8;
            $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
            $841 = (($tbase$247$i) + ($$sum119$i)|0);
            $842 = $841;
            $843 = HEAP32[$842>>2]|0;
            $$sum39$i$i = (($tsize$246$i) + 12)|0;
            $$sum120$i = (($$sum39$i$i) + ($805))|0;
            $844 = (($tbase$247$i) + ($$sum120$i)|0);
            $845 = $844;
            $846 = HEAP32[$845>>2]|0;
            $847 = $839 << 1;
            $848 = (((1680) + ($847<<2)|0) + 40|0);
            $849 = $848;
            $850 = ($843|0)==($849|0);
            do {
             if (!($850)) {
              $851 = $843;
              $852 = HEAP32[(((1680) + 16|0))>>2]|0;
              $853 = ($851>>>0)<($852>>>0);
              if ($853) {
               _abort();
               // unreachable;
              }
              $854 = (($843) + 12|0);
              $855 = HEAP32[$854>>2]|0;
              $856 = ($855|0)==($807|0);
              if ($856) {
               break;
              }
              _abort();
              // unreachable;
             }
            } while(0);
            $857 = ($846|0)==($843|0);
            if ($857) {
             $858 = 1 << $839;
             $859 = $858 ^ -1;
             $860 = HEAP32[((1680))>>2]|0;
             $861 = $860 & $859;
             HEAP32[((1680))>>2] = $861;
             break;
            }
            $862 = ($846|0)==($849|0);
            do {
             if ($862) {
              $$pre57$i$i = (($846) + 8|0);
              $$pre$phi58$i$iZ2D = $$pre57$i$i;
             } else {
              $863 = $846;
              $864 = HEAP32[(((1680) + 16|0))>>2]|0;
              $865 = ($863>>>0)<($864>>>0);
              if ($865) {
               _abort();
               // unreachable;
              }
              $866 = (($846) + 8|0);
              $867 = HEAP32[$866>>2]|0;
              $868 = ($867|0)==($807|0);
              if ($868) {
               $$pre$phi58$i$iZ2D = $866;
               break;
              }
              _abort();
              // unreachable;
             }
            } while(0);
            $869 = (($843) + 12|0);
            HEAP32[$869>>2] = $846;
            HEAP32[$$pre$phi58$i$iZ2D>>2] = $843;
           } else {
            $870 = $806;
            $$sum34$i$i = $805 | 24;
            $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
            $871 = (($tbase$247$i) + ($$sum110$i)|0);
            $872 = $871;
            $873 = HEAP32[$872>>2]|0;
            $$sum5$i$i = (($tsize$246$i) + 12)|0;
            $$sum111$i = (($$sum5$i$i) + ($805))|0;
            $874 = (($tbase$247$i) + ($$sum111$i)|0);
            $875 = $874;
            $876 = HEAP32[$875>>2]|0;
            $877 = ($876|0)==($870|0);
            do {
             if ($877) {
              $$sum67$i$i = $805 | 16;
              $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
              $890 = (($tbase$247$i) + ($$sum117$i)|0);
              $891 = $890;
              $892 = HEAP32[$891>>2]|0;
              $893 = ($892|0)==(0|0);
              if ($893) {
               $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
               $894 = (($tbase$247$i) + ($$sum118$i)|0);
               $895 = $894;
               $896 = HEAP32[$895>>2]|0;
               $897 = ($896|0)==(0|0);
               if ($897) {
                $R$1$i$i = 0;
                break;
               } else {
                $R$0$i$i = $896;$RP$0$i$i = $895;
               }
              } else {
               $R$0$i$i = $892;$RP$0$i$i = $891;
              }
              while(1) {
               $898 = (($R$0$i$i) + 20|0);
               $899 = HEAP32[$898>>2]|0;
               $900 = ($899|0)==(0|0);
               if (!($900)) {
                $RP$0$i$i$phi = $898;$R$0$i$i$phi = $899;$RP$0$i$i = $RP$0$i$i$phi;$R$0$i$i = $R$0$i$i$phi;
                continue;
               }
               $901 = (($R$0$i$i) + 16|0);
               $902 = HEAP32[$901>>2]|0;
               $903 = ($902|0)==(0|0);
               if ($903) {
                break;
               } else {
                $R$0$i$i = $902;$RP$0$i$i = $901;
               }
              }
              $904 = $RP$0$i$i;
              $905 = HEAP32[(((1680) + 16|0))>>2]|0;
              $906 = ($904>>>0)<($905>>>0);
              if ($906) {
               _abort();
               // unreachable;
              } else {
               HEAP32[$RP$0$i$i>>2] = 0;
               $R$1$i$i = $R$0$i$i;
               break;
              }
             } else {
              $$sum3536$i$i = $805 | 8;
              $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
              $878 = (($tbase$247$i) + ($$sum112$i)|0);
              $879 = $878;
              $880 = HEAP32[$879>>2]|0;
              $881 = $880;
              $882 = HEAP32[(((1680) + 16|0))>>2]|0;
              $883 = ($881>>>0)<($882>>>0);
              if ($883) {
               _abort();
               // unreachable;
              }
              $884 = (($880) + 12|0);
              $885 = HEAP32[$884>>2]|0;
              $886 = ($885|0)==($870|0);
              if (!($886)) {
               _abort();
               // unreachable;
              }
              $887 = (($876) + 8|0);
              $888 = HEAP32[$887>>2]|0;
              $889 = ($888|0)==($870|0);
              if ($889) {
               HEAP32[$884>>2] = $876;
               HEAP32[$887>>2] = $880;
               $R$1$i$i = $876;
               break;
              } else {
               _abort();
               // unreachable;
              }
             }
            } while(0);
            $907 = ($873|0)==(0|0);
            if ($907) {
             break;
            }
            $$sum30$i$i = (($tsize$246$i) + 28)|0;
            $$sum113$i = (($$sum30$i$i) + ($805))|0;
            $908 = (($tbase$247$i) + ($$sum113$i)|0);
            $909 = $908;
            $910 = HEAP32[$909>>2]|0;
            $911 = (((1680) + ($910<<2)|0) + 304|0);
            $912 = HEAP32[$911>>2]|0;
            $913 = ($870|0)==($912|0);
            do {
             if ($913) {
              HEAP32[$911>>2] = $R$1$i$i;
              $cond$i$i = ($R$1$i$i|0)==(0|0);
              if (!($cond$i$i)) {
               break;
              }
              $914 = 1 << $910;
              $915 = $914 ^ -1;
              $916 = HEAP32[(((1680) + 4|0))>>2]|0;
              $917 = $916 & $915;
              HEAP32[(((1680) + 4|0))>>2] = $917;
              break L356;
             } else {
              $918 = $873;
              $919 = HEAP32[(((1680) + 16|0))>>2]|0;
              $920 = ($918>>>0)<($919>>>0);
              if ($920) {
               _abort();
               // unreachable;
              }
              $921 = (($873) + 16|0);
              $922 = HEAP32[$921>>2]|0;
              $923 = ($922|0)==($870|0);
              if ($923) {
               HEAP32[$921>>2] = $R$1$i$i;
              } else {
               $924 = (($873) + 20|0);
               HEAP32[$924>>2] = $R$1$i$i;
              }
              $925 = ($R$1$i$i|0)==(0|0);
              if ($925) {
               break L356;
              }
             }
            } while(0);
            $926 = $R$1$i$i;
            $927 = HEAP32[(((1680) + 16|0))>>2]|0;
            $928 = ($926>>>0)<($927>>>0);
            if ($928) {
             _abort();
             // unreachable;
            }
            $929 = (($R$1$i$i) + 24|0);
            HEAP32[$929>>2] = $873;
            $$sum3132$i$i = $805 | 16;
            $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
            $930 = (($tbase$247$i) + ($$sum114$i)|0);
            $931 = $930;
            $932 = HEAP32[$931>>2]|0;
            $933 = ($932|0)==(0|0);
            do {
             if (!($933)) {
              $934 = $932;
              $935 = HEAP32[(((1680) + 16|0))>>2]|0;
              $936 = ($934>>>0)<($935>>>0);
              if ($936) {
               _abort();
               // unreachable;
              } else {
               $937 = (($R$1$i$i) + 16|0);
               HEAP32[$937>>2] = $932;
               $938 = (($932) + 24|0);
               HEAP32[$938>>2] = $R$1$i$i;
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
            $939 = (($tbase$247$i) + ($$sum115$i)|0);
            $940 = $939;
            $941 = HEAP32[$940>>2]|0;
            $942 = ($941|0)==(0|0);
            if ($942) {
             break;
            }
            $943 = $941;
            $944 = HEAP32[(((1680) + 16|0))>>2]|0;
            $945 = ($943>>>0)<($944>>>0);
            if ($945) {
             _abort();
             // unreachable;
            } else {
             $946 = (($R$1$i$i) + 20|0);
             HEAP32[$946>>2] = $941;
             $947 = (($941) + 24|0);
             HEAP32[$947>>2] = $R$1$i$i;
             break;
            }
           }
          } while(0);
          $$sum9$i$i = $838 | $805;
          $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
          $948 = (($tbase$247$i) + ($$sum116$i)|0);
          $949 = $948;
          $950 = (($838) + ($813))|0;
          $oldfirst$0$i$i = $949;$qsize$0$i$i = $950;
         } else {
          $oldfirst$0$i$i = $807;$qsize$0$i$i = $813;
         }
         $951 = (($oldfirst$0$i$i) + 4|0);
         $952 = HEAP32[$951>>2]|0;
         $953 = $952 & -2;
         HEAP32[$951>>2] = $953;
         $954 = $qsize$0$i$i | 1;
         $$sum10$i$i = (($$sum$i21$i) + 4)|0;
         $955 = (($tbase$247$i) + ($$sum10$i$i)|0);
         $956 = $955;
         HEAP32[$956>>2] = $954;
         $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
         $957 = (($tbase$247$i) + ($$sum11$i24$i)|0);
         $958 = $957;
         HEAP32[$958>>2] = $qsize$0$i$i;
         $959 = $qsize$0$i$i >>> 3;
         $960 = ($qsize$0$i$i>>>0)<(256);
         if ($960) {
          $961 = $959 << 1;
          $962 = (((1680) + ($961<<2)|0) + 40|0);
          $963 = $962;
          $964 = HEAP32[((1680))>>2]|0;
          $965 = 1 << $959;
          $966 = $964 & $965;
          $967 = ($966|0)==(0);
          do {
           if ($967) {
            $968 = $964 | $965;
            HEAP32[((1680))>>2] = $968;
            $$sum26$pre$i$i = (($961) + 2)|0;
            $$pre$i25$i = (((1680) + ($$sum26$pre$i$i<<2)|0) + 40|0);
            $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $963;
           } else {
            $$sum29$i$i = (($961) + 2)|0;
            $969 = (((1680) + ($$sum29$i$i<<2)|0) + 40|0);
            $970 = HEAP32[$969>>2]|0;
            $971 = $970;
            $972 = HEAP32[(((1680) + 16|0))>>2]|0;
            $973 = ($971>>>0)<($972>>>0);
            if (!($973)) {
             $$pre$phi$i26$iZ2D = $969;$F4$0$i$i = $970;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i26$iZ2D>>2] = $812;
          $974 = (($F4$0$i$i) + 12|0);
          HEAP32[$974>>2] = $812;
          $$sum27$i$i = (($$sum$i21$i) + 8)|0;
          $975 = (($tbase$247$i) + ($$sum27$i$i)|0);
          $976 = $975;
          HEAP32[$976>>2] = $F4$0$i$i;
          $$sum28$i$i = (($$sum$i21$i) + 12)|0;
          $977 = (($tbase$247$i) + ($$sum28$i$i)|0);
          $978 = $977;
          HEAP32[$978>>2] = $963;
          break;
         }
         $979 = $811;
         $980 = $qsize$0$i$i >>> 8;
         $981 = ($980|0)==(0);
         do {
          if ($981) {
           $I7$0$i$i = 0;
          } else {
           $982 = ($qsize$0$i$i>>>0)>(16777215);
           if ($982) {
            $I7$0$i$i = 31;
            break;
           }
           $983 = (($980) + 1048320)|0;
           $984 = $983 >>> 16;
           $985 = $984 & 8;
           $986 = $980 << $985;
           $987 = (($986) + 520192)|0;
           $988 = $987 >>> 16;
           $989 = $988 & 4;
           $990 = $989 | $985;
           $991 = $986 << $989;
           $992 = (($991) + 245760)|0;
           $993 = $992 >>> 16;
           $994 = $993 & 2;
           $995 = $990 | $994;
           $996 = (14 - ($995))|0;
           $997 = $991 << $994;
           $998 = $997 >>> 15;
           $999 = (($996) + ($998))|0;
           $1000 = $999 << 1;
           $1001 = (($999) + 7)|0;
           $1002 = $qsize$0$i$i >>> $1001;
           $1003 = $1002 & 1;
           $1004 = $1003 | $1000;
           $I7$0$i$i = $1004;
          }
         } while(0);
         $1005 = (((1680) + ($I7$0$i$i<<2)|0) + 304|0);
         $$sum12$i$i = (($$sum$i21$i) + 28)|0;
         $1006 = (($tbase$247$i) + ($$sum12$i$i)|0);
         $1007 = $1006;
         HEAP32[$1007>>2] = $I7$0$i$i;
         $$sum13$i$i = (($$sum$i21$i) + 16)|0;
         $1008 = (($tbase$247$i) + ($$sum13$i$i)|0);
         $$sum14$i$i = (($$sum$i21$i) + 20)|0;
         $1009 = (($tbase$247$i) + ($$sum14$i$i)|0);
         $1010 = $1009;
         HEAP32[$1010>>2] = 0;
         $1011 = $1008;
         HEAP32[$1011>>2] = 0;
         $1012 = HEAP32[(((1680) + 4|0))>>2]|0;
         $1013 = 1 << $I7$0$i$i;
         $1014 = $1012 & $1013;
         $1015 = ($1014|0)==(0);
         if ($1015) {
          $1016 = $1012 | $1013;
          HEAP32[(((1680) + 4|0))>>2] = $1016;
          HEAP32[$1005>>2] = $979;
          $1017 = $1005;
          $$sum15$i$i = (($$sum$i21$i) + 24)|0;
          $1018 = (($tbase$247$i) + ($$sum15$i$i)|0);
          $1019 = $1018;
          HEAP32[$1019>>2] = $1017;
          $$sum16$i$i = (($$sum$i21$i) + 12)|0;
          $1020 = (($tbase$247$i) + ($$sum16$i$i)|0);
          $1021 = $1020;
          HEAP32[$1021>>2] = $979;
          $$sum17$i$i = (($$sum$i21$i) + 8)|0;
          $1022 = (($tbase$247$i) + ($$sum17$i$i)|0);
          $1023 = $1022;
          HEAP32[$1023>>2] = $979;
          break;
         }
         $1024 = HEAP32[$1005>>2]|0;
         $1025 = ($I7$0$i$i|0)==(31);
         if ($1025) {
          $1028 = 0;
         } else {
          $1026 = $I7$0$i$i >>> 1;
          $1027 = (25 - ($1026))|0;
          $1028 = $1027;
         }
         $1029 = (($1024) + 4|0);
         $1030 = HEAP32[$1029>>2]|0;
         $1031 = $1030 & -8;
         $1032 = ($1031|0)==($qsize$0$i$i|0);
         L445: do {
          if ($1032) {
           $T$0$lcssa$i28$i = $1024;
          } else {
           $1033 = $qsize$0$i$i << $1028;
           $K8$052$i$i = $1033;$T$051$i$i = $1024;
           while(1) {
            $1039 = $K8$052$i$i >>> 31;
            $1040 = ((($T$051$i$i) + ($1039<<2)|0) + 16|0);
            $1041 = HEAP32[$1040>>2]|0;
            $1042 = ($1041|0)==(0|0);
            if ($1042) {
             break;
            }
            $1034 = $K8$052$i$i << 1;
            $1035 = (($1041) + 4|0);
            $1036 = HEAP32[$1035>>2]|0;
            $1037 = $1036 & -8;
            $1038 = ($1037|0)==($qsize$0$i$i|0);
            if ($1038) {
             $T$0$lcssa$i28$i = $1041;
             break L445;
            } else {
             $T$051$i$i$phi = $1041;$K8$052$i$i = $1034;$T$051$i$i = $T$051$i$i$phi;
            }
           }
           $1043 = $1040;
           $1044 = HEAP32[(((1680) + 16|0))>>2]|0;
           $1045 = ($1043>>>0)<($1044>>>0);
           if ($1045) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$1040>>2] = $979;
            $$sum23$i$i = (($$sum$i21$i) + 24)|0;
            $1046 = (($tbase$247$i) + ($$sum23$i$i)|0);
            $1047 = $1046;
            HEAP32[$1047>>2] = $T$051$i$i;
            $$sum24$i$i = (($$sum$i21$i) + 12)|0;
            $1048 = (($tbase$247$i) + ($$sum24$i$i)|0);
            $1049 = $1048;
            HEAP32[$1049>>2] = $979;
            $$sum25$i$i = (($$sum$i21$i) + 8)|0;
            $1050 = (($tbase$247$i) + ($$sum25$i$i)|0);
            $1051 = $1050;
            HEAP32[$1051>>2] = $979;
            break L348;
           }
          }
         } while(0);
         $1052 = (($T$0$lcssa$i28$i) + 8|0);
         $1053 = HEAP32[$1052>>2]|0;
         $1054 = $T$0$lcssa$i28$i;
         $1055 = HEAP32[(((1680) + 16|0))>>2]|0;
         $1056 = ($1054>>>0)<($1055>>>0);
         if ($1056) {
          _abort();
          // unreachable;
         }
         $1057 = $1053;
         $1058 = ($1057>>>0)<($1055>>>0);
         if ($1058) {
          _abort();
          // unreachable;
         } else {
          $1059 = (($1053) + 12|0);
          HEAP32[$1059>>2] = $979;
          HEAP32[$1052>>2] = $979;
          $$sum20$i$i = (($$sum$i21$i) + 8)|0;
          $1060 = (($tbase$247$i) + ($$sum20$i$i)|0);
          $1061 = $1060;
          HEAP32[$1061>>2] = $1053;
          $$sum21$i$i = (($$sum$i21$i) + 12)|0;
          $1062 = (($tbase$247$i) + ($$sum21$i$i)|0);
          $1063 = $1062;
          HEAP32[$1063>>2] = $T$0$lcssa$i28$i;
          $$sum22$i$i = (($$sum$i21$i) + 24)|0;
          $1064 = (($tbase$247$i) + ($$sum22$i$i)|0);
          $1065 = $1064;
          HEAP32[$1065>>2] = 0;
          break;
         }
        }
       } while(0);
       $$sum1819$i$i = $797 | 8;
       $1066 = (($tbase$247$i) + ($$sum1819$i$i)|0);
       $mem$0 = $1066;
       STACKTOP = sp;return ($mem$0|0);
      }
     } while(0);
     $1067 = $711;
     $sp$0$i$i$i = (((1680) + 448|0));
     while(1) {
      $1068 = ($sp$0$i$i$i);
      $1069 = HEAP32[$1068>>2]|0;
      $1070 = ($1069>>>0)>($1067>>>0);
      if (!($1070)) {
       $1071 = (($sp$0$i$i$i) + 4|0);
       $1072 = HEAP32[$1071>>2]|0;
       $1073 = (($1069) + ($1072)|0);
       $1074 = ($1073>>>0)>($1067>>>0);
       if ($1074) {
        break;
       }
      }
      $1075 = (($sp$0$i$i$i) + 8|0);
      $1076 = HEAP32[$1075>>2]|0;
      $sp$0$i$i$i = $1076;
     }
     $$sum$i15$i = (($1072) + -47)|0;
     $$sum1$i16$i = (($1072) + -39)|0;
     $1077 = (($1069) + ($$sum1$i16$i)|0);
     $1078 = $1077;
     $1079 = $1078 & 7;
     $1080 = ($1079|0)==(0);
     if ($1080) {
      $1083 = 0;
     } else {
      $1081 = (0 - ($1078))|0;
      $1082 = $1081 & 7;
      $1083 = $1082;
     }
     $$sum2$i17$i = (($$sum$i15$i) + ($1083))|0;
     $1084 = (($1069) + ($$sum2$i17$i)|0);
     $1085 = (($711) + 16|0);
     $1086 = $1085;
     $1087 = ($1084>>>0)<($1086>>>0);
     $1088 = $1087 ? $1067 : $1084;
     $1089 = (($1088) + 8|0);
     $1090 = $1089;
     $1091 = (($tsize$246$i) + -40)|0;
     $1092 = (($tbase$247$i) + 8|0);
     $1093 = $1092;
     $1094 = $1093 & 7;
     $1095 = ($1094|0)==(0);
     if ($1095) {
      $1098 = 0;
     } else {
      $1096 = (0 - ($1093))|0;
      $1097 = $1096 & 7;
      $1098 = $1097;
     }
     $1099 = (($tbase$247$i) + ($1098)|0);
     $1100 = $1099;
     $1101 = (($1091) - ($1098))|0;
     HEAP32[(((1680) + 24|0))>>2] = $1100;
     HEAP32[(((1680) + 12|0))>>2] = $1101;
     $1102 = $1101 | 1;
     $$sum$i$i$i = (($1098) + 4)|0;
     $1103 = (($tbase$247$i) + ($$sum$i$i$i)|0);
     $1104 = $1103;
     HEAP32[$1104>>2] = $1102;
     $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
     $1105 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
     $1106 = $1105;
     HEAP32[$1106>>2] = 40;
     $1107 = HEAP32[(((2152) + 16|0))>>2]|0;
     HEAP32[(((1680) + 28|0))>>2] = $1107;
     $1108 = (($1088) + 4|0);
     $1109 = $1108;
     HEAP32[$1109>>2] = 27;
     ;HEAP32[$1089+0>>2]=HEAP32[((((1680) + 448|0)))+0>>2]|0;HEAP32[$1089+4>>2]=HEAP32[((((1680) + 448|0)))+4>>2]|0;HEAP32[$1089+8>>2]=HEAP32[((((1680) + 448|0)))+8>>2]|0;HEAP32[$1089+12>>2]=HEAP32[((((1680) + 448|0)))+12>>2]|0;
     HEAP32[(((1680) + 448|0))>>2] = $tbase$247$i;
     HEAP32[(((1680) + 452|0))>>2] = $tsize$246$i;
     HEAP32[(((1680) + 460|0))>>2] = 0;
     HEAP32[(((1680) + 456|0))>>2] = $1090;
     $1110 = (($1088) + 28|0);
     $1111 = $1110;
     HEAP32[$1111>>2] = 7;
     $1112 = (($1088) + 32|0);
     $1113 = ($1112>>>0)<($1073>>>0);
     if ($1113) {
      $1114 = $1111;
      while(1) {
       $1115 = (($1114) + 4|0);
       HEAP32[$1115>>2] = 7;
       $1116 = (($1114) + 8|0);
       $1117 = $1116;
       $1118 = ($1117>>>0)<($1073>>>0);
       if ($1118) {
        $1114$phi = $1115;$1114 = $1114$phi;
       } else {
        break;
       }
      }
     }
     $1119 = ($1088|0)==($1067|0);
     if ($1119) {
      break;
     }
     $1120 = $1088;
     $1121 = $711;
     $1122 = (($1120) - ($1121))|0;
     $1123 = (($1067) + ($1122)|0);
     $$sum3$i$i = (($1122) + 4)|0;
     $1124 = (($1067) + ($$sum3$i$i)|0);
     $1125 = $1124;
     $1126 = HEAP32[$1125>>2]|0;
     $1127 = $1126 & -2;
     HEAP32[$1125>>2] = $1127;
     $1128 = $1122 | 1;
     $1129 = (($711) + 4|0);
     HEAP32[$1129>>2] = $1128;
     $1130 = $1123;
     HEAP32[$1130>>2] = $1122;
     $1131 = $1122 >>> 3;
     $1132 = ($1122>>>0)<(256);
     if ($1132) {
      $1133 = $1131 << 1;
      $1134 = (((1680) + ($1133<<2)|0) + 40|0);
      $1135 = $1134;
      $1136 = HEAP32[((1680))>>2]|0;
      $1137 = 1 << $1131;
      $1138 = $1136 & $1137;
      $1139 = ($1138|0)==(0);
      do {
       if ($1139) {
        $1140 = $1136 | $1137;
        HEAP32[((1680))>>2] = $1140;
        $$sum10$pre$i$i = (($1133) + 2)|0;
        $$pre$i$i = (((1680) + ($$sum10$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $1135;
       } else {
        $$sum11$i$i = (($1133) + 2)|0;
        $1141 = (((1680) + ($$sum11$i$i<<2)|0) + 40|0);
        $1142 = HEAP32[$1141>>2]|0;
        $1143 = $1142;
        $1144 = HEAP32[(((1680) + 16|0))>>2]|0;
        $1145 = ($1143>>>0)<($1144>>>0);
        if (!($1145)) {
         $$pre$phi$i$iZ2D = $1141;$F$0$i$i = $1142;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $711;
      $1146 = (($F$0$i$i) + 12|0);
      HEAP32[$1146>>2] = $711;
      $1147 = (($711) + 8|0);
      HEAP32[$1147>>2] = $F$0$i$i;
      $1148 = (($711) + 12|0);
      HEAP32[$1148>>2] = $1135;
      break;
     }
     $1149 = $711;
     $1150 = $1122 >>> 8;
     $1151 = ($1150|0)==(0);
     do {
      if ($1151) {
       $I1$0$i$i = 0;
      } else {
       $1152 = ($1122>>>0)>(16777215);
       if ($1152) {
        $I1$0$i$i = 31;
        break;
       }
       $1153 = (($1150) + 1048320)|0;
       $1154 = $1153 >>> 16;
       $1155 = $1154 & 8;
       $1156 = $1150 << $1155;
       $1157 = (($1156) + 520192)|0;
       $1158 = $1157 >>> 16;
       $1159 = $1158 & 4;
       $1160 = $1159 | $1155;
       $1161 = $1156 << $1159;
       $1162 = (($1161) + 245760)|0;
       $1163 = $1162 >>> 16;
       $1164 = $1163 & 2;
       $1165 = $1160 | $1164;
       $1166 = (14 - ($1165))|0;
       $1167 = $1161 << $1164;
       $1168 = $1167 >>> 15;
       $1169 = (($1166) + ($1168))|0;
       $1170 = $1169 << 1;
       $1171 = (($1169) + 7)|0;
       $1172 = $1122 >>> $1171;
       $1173 = $1172 & 1;
       $1174 = $1173 | $1170;
       $I1$0$i$i = $1174;
      }
     } while(0);
     $1175 = (((1680) + ($I1$0$i$i<<2)|0) + 304|0);
     $1176 = (($711) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1176>>2] = $I1$0$c$i$i;
     $1177 = (($711) + 20|0);
     HEAP32[$1177>>2] = 0;
     $1178 = (($711) + 16|0);
     HEAP32[$1178>>2] = 0;
     $1179 = HEAP32[(((1680) + 4|0))>>2]|0;
     $1180 = 1 << $I1$0$i$i;
     $1181 = $1179 & $1180;
     $1182 = ($1181|0)==(0);
     if ($1182) {
      $1183 = $1179 | $1180;
      HEAP32[(((1680) + 4|0))>>2] = $1183;
      HEAP32[$1175>>2] = $1149;
      $1184 = (($711) + 24|0);
      $$c$i$i = $1175;
      HEAP32[$1184>>2] = $$c$i$i;
      $1185 = (($711) + 12|0);
      HEAP32[$1185>>2] = $711;
      $1186 = (($711) + 8|0);
      HEAP32[$1186>>2] = $711;
      break;
     }
     $1187 = HEAP32[$1175>>2]|0;
     $1188 = ($I1$0$i$i|0)==(31);
     if ($1188) {
      $1191 = 0;
     } else {
      $1189 = $I1$0$i$i >>> 1;
      $1190 = (25 - ($1189))|0;
      $1191 = $1190;
     }
     $1192 = (($1187) + 4|0);
     $1193 = HEAP32[$1192>>2]|0;
     $1194 = $1193 & -8;
     $1195 = ($1194|0)==($1122|0);
     L499: do {
      if ($1195) {
       $T$0$lcssa$i$i = $1187;
      } else {
       $1196 = $1122 << $1191;
       $K2$014$i$i = $1196;$T$013$i$i = $1187;
       while(1) {
        $1202 = $K2$014$i$i >>> 31;
        $1203 = ((($T$013$i$i) + ($1202<<2)|0) + 16|0);
        $1204 = HEAP32[$1203>>2]|0;
        $1205 = ($1204|0)==(0|0);
        if ($1205) {
         break;
        }
        $1197 = $K2$014$i$i << 1;
        $1198 = (($1204) + 4|0);
        $1199 = HEAP32[$1198>>2]|0;
        $1200 = $1199 & -8;
        $1201 = ($1200|0)==($1122|0);
        if ($1201) {
         $T$0$lcssa$i$i = $1204;
         break L499;
        } else {
         $T$013$i$i$phi = $1204;$K2$014$i$i = $1197;$T$013$i$i = $T$013$i$i$phi;
        }
       }
       $1206 = $1203;
       $1207 = HEAP32[(((1680) + 16|0))>>2]|0;
       $1208 = ($1206>>>0)<($1207>>>0);
       if ($1208) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1203>>2] = $1149;
        $1209 = (($711) + 24|0);
        $T$0$c7$i$i = $T$013$i$i;
        HEAP32[$1209>>2] = $T$0$c7$i$i;
        $1210 = (($711) + 12|0);
        HEAP32[$1210>>2] = $711;
        $1211 = (($711) + 8|0);
        HEAP32[$1211>>2] = $711;
        break L311;
       }
      }
     } while(0);
     $1212 = (($T$0$lcssa$i$i) + 8|0);
     $1213 = HEAP32[$1212>>2]|0;
     $1214 = $T$0$lcssa$i$i;
     $1215 = HEAP32[(((1680) + 16|0))>>2]|0;
     $1216 = ($1214>>>0)<($1215>>>0);
     if ($1216) {
      _abort();
      // unreachable;
     }
     $1217 = $1213;
     $1218 = ($1217>>>0)<($1215>>>0);
     if ($1218) {
      _abort();
      // unreachable;
     } else {
      $1219 = (($1213) + 12|0);
      HEAP32[$1219>>2] = $1149;
      HEAP32[$1212>>2] = $1149;
      $1220 = (($711) + 8|0);
      $$c6$i$i = $1213;
      HEAP32[$1220>>2] = $$c6$i$i;
      $1221 = (($711) + 12|0);
      $T$0$c$i$i = $T$0$lcssa$i$i;
      HEAP32[$1221>>2] = $T$0$c$i$i;
      $1222 = (($711) + 24|0);
      HEAP32[$1222>>2] = 0;
      break;
     }
    }
   } while(0);
   $1223 = HEAP32[(((1680) + 12|0))>>2]|0;
   $1224 = ($1223>>>0)>($nb$0>>>0);
   if (!($1224)) {
    break;
   }
   $1225 = (($1223) - ($nb$0))|0;
   HEAP32[(((1680) + 12|0))>>2] = $1225;
   $1226 = HEAP32[(((1680) + 24|0))>>2]|0;
   $1227 = $1226;
   $1228 = (($1227) + ($nb$0)|0);
   $1229 = $1228;
   HEAP32[(((1680) + 24|0))>>2] = $1229;
   $1230 = $1225 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1231 = (($1227) + ($$sum$i32)|0);
   $1232 = $1231;
   HEAP32[$1232>>2] = $1230;
   $1233 = $nb$0 | 3;
   $1234 = (($1226) + 4|0);
   HEAP32[$1234>>2] = $1233;
   $1235 = (($1226) + 8|0);
   $1236 = $1235;
   $mem$0 = $1236;
   STACKTOP = sp;return ($mem$0|0);
  }
 } while(0);
 $1237 = (___errno_location()|0);
 HEAP32[$1237>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$c = 0, $$c12 = 0, $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0;
 var $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
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
 var $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0;
 var $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0;
 var $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0;
 var $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0;
 var $K19$057 = 0, $R$0 = 0, $R$0$phi = 0, $R$1 = 0, $R7$0 = 0, $R7$0$phi = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$phi = 0, $RP9$0 = 0, $RP9$0$phi = 0, $T$0$c = 0, $T$0$c13 = 0, $T$0$lcssa = 0, $T$056 = 0, $T$056$phi = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0;
 var $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, $sp$0$in$i$phi = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($mem|0)==(0|0);
 if ($1) {
  STACKTOP = sp;return;
 }
 $2 = (($mem) + -8|0);
 $3 = $2;
 $4 = HEAP32[(((1680) + 16|0))>>2]|0;
 $5 = ($2>>>0)<($4>>>0);
 if ($5) {
  _abort();
  // unreachable;
 }
 $6 = (($mem) + -4|0);
 $7 = $6;
 $8 = HEAP32[$7>>2]|0;
 $9 = $8 & 3;
 $10 = ($9|0)==(1);
 if ($10) {
  _abort();
  // unreachable;
 }
 $11 = $8 & -8;
 $$sum = (($11) + -8)|0;
 $12 = (($mem) + ($$sum)|0);
 $13 = $12;
 $14 = $8 & 1;
 $15 = ($14|0)==(0);
 L10: do {
  if ($15) {
   $16 = $2;
   $17 = HEAP32[$16>>2]|0;
   $18 = ($9|0)==(0);
   if ($18) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($17))|0;
   $19 = (($mem) + ($$sum2)|0);
   $20 = $19;
   $21 = (($17) + ($11))|0;
   $22 = ($19>>>0)<($4>>>0);
   if ($22) {
    _abort();
    // unreachable;
   }
   $23 = HEAP32[(((1680) + 20|0))>>2]|0;
   $24 = ($20|0)==($23|0);
   if ($24) {
    $$sum3 = (($11) + -4)|0;
    $130 = (($mem) + ($$sum3)|0);
    $131 = $130;
    $132 = HEAP32[$131>>2]|0;
    $133 = $132 & 3;
    $134 = ($133|0)==(3);
    if (!($134)) {
     $p$0 = $20;$psize$0 = $21;
     break;
    }
    HEAP32[(((1680) + 8|0))>>2] = $21;
    $135 = HEAP32[$131>>2]|0;
    $136 = $135 & -2;
    HEAP32[$131>>2] = $136;
    $137 = $21 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $138 = (($mem) + ($$sum26)|0);
    $139 = $138;
    HEAP32[$139>>2] = $137;
    $140 = $12;
    HEAP32[$140>>2] = $21;
    STACKTOP = sp;return;
   }
   $25 = $17 >>> 3;
   $26 = ($17>>>0)<(256);
   if ($26) {
    $$sum36 = (($$sum2) + 8)|0;
    $27 = (($mem) + ($$sum36)|0);
    $28 = $27;
    $29 = HEAP32[$28>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $30 = (($mem) + ($$sum37)|0);
    $31 = $30;
    $32 = HEAP32[$31>>2]|0;
    $33 = $25 << 1;
    $34 = (((1680) + ($33<<2)|0) + 40|0);
    $35 = $34;
    $36 = ($29|0)==($35|0);
    do {
     if (!($36)) {
      $37 = $29;
      $38 = ($37>>>0)<($4>>>0);
      if ($38) {
       _abort();
       // unreachable;
      }
      $39 = (($29) + 12|0);
      $40 = HEAP32[$39>>2]|0;
      $41 = ($40|0)==($20|0);
      if ($41) {
       break;
      }
      _abort();
      // unreachable;
     }
    } while(0);
    $42 = ($32|0)==($29|0);
    if ($42) {
     $43 = 1 << $25;
     $44 = $43 ^ -1;
     $45 = HEAP32[((1680))>>2]|0;
     $46 = $45 & $44;
     HEAP32[((1680))>>2] = $46;
     $p$0 = $20;$psize$0 = $21;
     break;
    }
    $47 = ($32|0)==($35|0);
    do {
     if ($47) {
      $$pre69 = (($32) + 8|0);
      $$pre$phi70Z2D = $$pre69;
     } else {
      $48 = $32;
      $49 = ($48>>>0)<($4>>>0);
      if ($49) {
       _abort();
       // unreachable;
      }
      $50 = (($32) + 8|0);
      $51 = HEAP32[$50>>2]|0;
      $52 = ($51|0)==($20|0);
      if ($52) {
       $$pre$phi70Z2D = $50;
       break;
      }
      _abort();
      // unreachable;
     }
    } while(0);
    $53 = (($29) + 12|0);
    HEAP32[$53>>2] = $32;
    HEAP32[$$pre$phi70Z2D>>2] = $29;
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $54 = $19;
   $$sum28 = (($$sum2) + 24)|0;
   $55 = (($mem) + ($$sum28)|0);
   $56 = $55;
   $57 = HEAP32[$56>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $58 = (($mem) + ($$sum29)|0);
   $59 = $58;
   $60 = HEAP32[$59>>2]|0;
   $61 = ($60|0)==($54|0);
   do {
    if ($61) {
     $$sum31 = (($$sum2) + 20)|0;
     $73 = (($mem) + ($$sum31)|0);
     $74 = $73;
     $75 = HEAP32[$74>>2]|0;
     $76 = ($75|0)==(0|0);
     if ($76) {
      $$sum30 = (($$sum2) + 16)|0;
      $77 = (($mem) + ($$sum30)|0);
      $78 = $77;
      $79 = HEAP32[$78>>2]|0;
      $80 = ($79|0)==(0|0);
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
      $81 = (($R$0) + 20|0);
      $82 = HEAP32[$81>>2]|0;
      $83 = ($82|0)==(0|0);
      if (!($83)) {
       $RP$0$phi = $81;$R$0$phi = $82;$RP$0 = $RP$0$phi;$R$0 = $R$0$phi;
       continue;
      }
      $84 = (($R$0) + 16|0);
      $85 = HEAP32[$84>>2]|0;
      $86 = ($85|0)==(0|0);
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
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $62 = (($mem) + ($$sum35)|0);
     $63 = $62;
     $64 = HEAP32[$63>>2]|0;
     $65 = $64;
     $66 = ($65>>>0)<($4>>>0);
     if ($66) {
      _abort();
      // unreachable;
     }
     $67 = (($64) + 12|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = ($68|0)==($54|0);
     if (!($69)) {
      _abort();
      // unreachable;
     }
     $70 = (($60) + 8|0);
     $71 = HEAP32[$70>>2]|0;
     $72 = ($71|0)==($54|0);
     if ($72) {
      HEAP32[$67>>2] = $60;
      HEAP32[$70>>2] = $64;
      $R$1 = $60;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $89 = ($57|0)==(0|0);
   if ($89) {
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $$sum32 = (($$sum2) + 28)|0;
   $90 = (($mem) + ($$sum32)|0);
   $91 = $90;
   $92 = HEAP32[$91>>2]|0;
   $93 = (((1680) + ($92<<2)|0) + 304|0);
   $94 = HEAP32[$93>>2]|0;
   $95 = ($54|0)==($94|0);
   do {
    if ($95) {
     HEAP32[$93>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if (!($cond)) {
      break;
     }
     $96 = 1 << $92;
     $97 = $96 ^ -1;
     $98 = HEAP32[(((1680) + 4|0))>>2]|0;
     $99 = $98 & $97;
     HEAP32[(((1680) + 4|0))>>2] = $99;
     $p$0 = $20;$psize$0 = $21;
     break L10;
    } else {
     $100 = $57;
     $101 = HEAP32[(((1680) + 16|0))>>2]|0;
     $102 = ($100>>>0)<($101>>>0);
     if ($102) {
      _abort();
      // unreachable;
     }
     $103 = (($57) + 16|0);
     $104 = HEAP32[$103>>2]|0;
     $105 = ($104|0)==($54|0);
     if ($105) {
      HEAP32[$103>>2] = $R$1;
     } else {
      $106 = (($57) + 20|0);
      HEAP32[$106>>2] = $R$1;
     }
     $107 = ($R$1|0)==(0|0);
     if ($107) {
      $p$0 = $20;$psize$0 = $21;
      break L10;
     }
    }
   } while(0);
   $108 = $R$1;
   $109 = HEAP32[(((1680) + 16|0))>>2]|0;
   $110 = ($108>>>0)<($109>>>0);
   if ($110) {
    _abort();
    // unreachable;
   }
   $111 = (($R$1) + 24|0);
   HEAP32[$111>>2] = $57;
   $$sum33 = (($$sum2) + 16)|0;
   $112 = (($mem) + ($$sum33)|0);
   $113 = $112;
   $114 = HEAP32[$113>>2]|0;
   $115 = ($114|0)==(0|0);
   do {
    if (!($115)) {
     $116 = $114;
     $117 = HEAP32[(((1680) + 16|0))>>2]|0;
     $118 = ($116>>>0)<($117>>>0);
     if ($118) {
      _abort();
      // unreachable;
     } else {
      $119 = (($R$1) + 16|0);
      HEAP32[$119>>2] = $114;
      $120 = (($114) + 24|0);
      HEAP32[$120>>2] = $R$1;
      break;
     }
    }
   } while(0);
   $$sum34 = (($$sum2) + 20)|0;
   $121 = (($mem) + ($$sum34)|0);
   $122 = $121;
   $123 = HEAP32[$122>>2]|0;
   $124 = ($123|0)==(0|0);
   if ($124) {
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $125 = $123;
   $126 = HEAP32[(((1680) + 16|0))>>2]|0;
   $127 = ($125>>>0)<($126>>>0);
   if ($127) {
    _abort();
    // unreachable;
   } else {
    $128 = (($R$1) + 20|0);
    HEAP32[$128>>2] = $123;
    $129 = (($123) + 24|0);
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
  // unreachable;
 }
 $$sum25 = (($11) + -4)|0;
 $143 = (($mem) + ($$sum25)|0);
 $144 = $143;
 $145 = HEAP32[$144>>2]|0;
 $146 = $145 & 1;
 $147 = ($146|0)==(0);
 if ($147) {
  _abort();
  // unreachable;
 }
 $148 = $145 & 2;
 $149 = ($148|0)==(0);
 do {
  if ($149) {
   $150 = HEAP32[(((1680) + 24|0))>>2]|0;
   $151 = ($13|0)==($150|0);
   if ($151) {
    $152 = HEAP32[(((1680) + 12|0))>>2]|0;
    $153 = (($152) + ($psize$0))|0;
    HEAP32[(((1680) + 12|0))>>2] = $153;
    HEAP32[(((1680) + 24|0))>>2] = $p$0;
    $154 = $153 | 1;
    $155 = (($p$0) + 4|0);
    HEAP32[$155>>2] = $154;
    $156 = HEAP32[(((1680) + 20|0))>>2]|0;
    $157 = ($p$0|0)==($156|0);
    if (!($157)) {
     STACKTOP = sp;return;
    }
    HEAP32[(((1680) + 20|0))>>2] = 0;
    HEAP32[(((1680) + 8|0))>>2] = 0;
    STACKTOP = sp;return;
   }
   $158 = HEAP32[(((1680) + 20|0))>>2]|0;
   $159 = ($13|0)==($158|0);
   if ($159) {
    $160 = HEAP32[(((1680) + 8|0))>>2]|0;
    $161 = (($160) + ($psize$0))|0;
    HEAP32[(((1680) + 8|0))>>2] = $161;
    HEAP32[(((1680) + 20|0))>>2] = $p$0;
    $162 = $161 | 1;
    $163 = (($p$0) + 4|0);
    HEAP32[$163>>2] = $162;
    $164 = (($141) + ($161)|0);
    $165 = $164;
    HEAP32[$165>>2] = $161;
    STACKTOP = sp;return;
   }
   $166 = $145 & -8;
   $167 = (($166) + ($psize$0))|0;
   $168 = $145 >>> 3;
   $169 = ($145>>>0)<(256);
   L112: do {
    if ($169) {
     $170 = (($mem) + ($11)|0);
     $171 = $170;
     $172 = HEAP32[$171>>2]|0;
     $$sum2324 = $11 | 4;
     $173 = (($mem) + ($$sum2324)|0);
     $174 = $173;
     $175 = HEAP32[$174>>2]|0;
     $176 = $168 << 1;
     $177 = (((1680) + ($176<<2)|0) + 40|0);
     $178 = $177;
     $179 = ($172|0)==($178|0);
     do {
      if (!($179)) {
       $180 = $172;
       $181 = HEAP32[(((1680) + 16|0))>>2]|0;
       $182 = ($180>>>0)<($181>>>0);
       if ($182) {
        _abort();
        // unreachable;
       }
       $183 = (($172) + 12|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==($13|0);
       if ($185) {
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     $186 = ($175|0)==($172|0);
     if ($186) {
      $187 = 1 << $168;
      $188 = $187 ^ -1;
      $189 = HEAP32[((1680))>>2]|0;
      $190 = $189 & $188;
      HEAP32[((1680))>>2] = $190;
      break;
     }
     $191 = ($175|0)==($178|0);
     do {
      if ($191) {
       $$pre67 = (($175) + 8|0);
       $$pre$phi68Z2D = $$pre67;
      } else {
       $192 = $175;
       $193 = HEAP32[(((1680) + 16|0))>>2]|0;
       $194 = ($192>>>0)<($193>>>0);
       if ($194) {
        _abort();
        // unreachable;
       }
       $195 = (($175) + 8|0);
       $196 = HEAP32[$195>>2]|0;
       $197 = ($196|0)==($13|0);
       if ($197) {
        $$pre$phi68Z2D = $195;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     $198 = (($172) + 12|0);
     HEAP32[$198>>2] = $175;
     HEAP32[$$pre$phi68Z2D>>2] = $172;
    } else {
     $199 = $12;
     $$sum5 = (($11) + 16)|0;
     $200 = (($mem) + ($$sum5)|0);
     $201 = $200;
     $202 = HEAP32[$201>>2]|0;
     $$sum67 = $11 | 4;
     $203 = (($mem) + ($$sum67)|0);
     $204 = $203;
     $205 = HEAP32[$204>>2]|0;
     $206 = ($205|0)==($199|0);
     do {
      if ($206) {
       $$sum9 = (($11) + 12)|0;
       $219 = (($mem) + ($$sum9)|0);
       $220 = $219;
       $221 = HEAP32[$220>>2]|0;
       $222 = ($221|0)==(0|0);
       if ($222) {
        $$sum8 = (($11) + 8)|0;
        $223 = (($mem) + ($$sum8)|0);
        $224 = $223;
        $225 = HEAP32[$224>>2]|0;
        $226 = ($225|0)==(0|0);
        if ($226) {
         $R7$1 = 0;
         break;
        } else {
         $R7$0 = $225;$RP9$0 = $224;
        }
       } else {
        $R7$0 = $221;$RP9$0 = $220;
       }
       while(1) {
        $227 = (($R7$0) + 20|0);
        $228 = HEAP32[$227>>2]|0;
        $229 = ($228|0)==(0|0);
        if (!($229)) {
         $RP9$0$phi = $227;$R7$0$phi = $228;$RP9$0 = $RP9$0$phi;$R7$0 = $R7$0$phi;
         continue;
        }
        $230 = (($R7$0) + 16|0);
        $231 = HEAP32[$230>>2]|0;
        $232 = ($231|0)==(0|0);
        if ($232) {
         break;
        } else {
         $R7$0 = $231;$RP9$0 = $230;
        }
       }
       $233 = $RP9$0;
       $234 = HEAP32[(((1680) + 16|0))>>2]|0;
       $235 = ($233>>>0)<($234>>>0);
       if ($235) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP9$0>>2] = 0;
        $R7$1 = $R7$0;
        break;
       }
      } else {
       $207 = (($mem) + ($11)|0);
       $208 = $207;
       $209 = HEAP32[$208>>2]|0;
       $210 = $209;
       $211 = HEAP32[(((1680) + 16|0))>>2]|0;
       $212 = ($210>>>0)<($211>>>0);
       if ($212) {
        _abort();
        // unreachable;
       }
       $213 = (($209) + 12|0);
       $214 = HEAP32[$213>>2]|0;
       $215 = ($214|0)==($199|0);
       if (!($215)) {
        _abort();
        // unreachable;
       }
       $216 = (($205) + 8|0);
       $217 = HEAP32[$216>>2]|0;
       $218 = ($217|0)==($199|0);
       if ($218) {
        HEAP32[$213>>2] = $205;
        HEAP32[$216>>2] = $209;
        $R7$1 = $205;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $236 = ($202|0)==(0|0);
     if ($236) {
      break;
     }
     $$sum18 = (($11) + 20)|0;
     $237 = (($mem) + ($$sum18)|0);
     $238 = $237;
     $239 = HEAP32[$238>>2]|0;
     $240 = (((1680) + ($239<<2)|0) + 304|0);
     $241 = HEAP32[$240>>2]|0;
     $242 = ($199|0)==($241|0);
     do {
      if ($242) {
       HEAP32[$240>>2] = $R7$1;
       $cond54 = ($R7$1|0)==(0|0);
       if (!($cond54)) {
        break;
       }
       $243 = 1 << $239;
       $244 = $243 ^ -1;
       $245 = HEAP32[(((1680) + 4|0))>>2]|0;
       $246 = $245 & $244;
       HEAP32[(((1680) + 4|0))>>2] = $246;
       break L112;
      } else {
       $247 = $202;
       $248 = HEAP32[(((1680) + 16|0))>>2]|0;
       $249 = ($247>>>0)<($248>>>0);
       if ($249) {
        _abort();
        // unreachable;
       }
       $250 = (($202) + 16|0);
       $251 = HEAP32[$250>>2]|0;
       $252 = ($251|0)==($199|0);
       if ($252) {
        HEAP32[$250>>2] = $R7$1;
       } else {
        $253 = (($202) + 20|0);
        HEAP32[$253>>2] = $R7$1;
       }
       $254 = ($R7$1|0)==(0|0);
       if ($254) {
        break L112;
       }
      }
     } while(0);
     $255 = $R7$1;
     $256 = HEAP32[(((1680) + 16|0))>>2]|0;
     $257 = ($255>>>0)<($256>>>0);
     if ($257) {
      _abort();
      // unreachable;
     }
     $258 = (($R7$1) + 24|0);
     HEAP32[$258>>2] = $202;
     $$sum19 = (($11) + 8)|0;
     $259 = (($mem) + ($$sum19)|0);
     $260 = $259;
     $261 = HEAP32[$260>>2]|0;
     $262 = ($261|0)==(0|0);
     do {
      if (!($262)) {
       $263 = $261;
       $264 = HEAP32[(((1680) + 16|0))>>2]|0;
       $265 = ($263>>>0)<($264>>>0);
       if ($265) {
        _abort();
        // unreachable;
       } else {
        $266 = (($R7$1) + 16|0);
        HEAP32[$266>>2] = $261;
        $267 = (($261) + 24|0);
        HEAP32[$267>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($11) + 12)|0;
     $268 = (($mem) + ($$sum20)|0);
     $269 = $268;
     $270 = HEAP32[$269>>2]|0;
     $271 = ($270|0)==(0|0);
     if ($271) {
      break;
     }
     $272 = $270;
     $273 = HEAP32[(((1680) + 16|0))>>2]|0;
     $274 = ($272>>>0)<($273>>>0);
     if ($274) {
      _abort();
      // unreachable;
     } else {
      $275 = (($R7$1) + 20|0);
      HEAP32[$275>>2] = $270;
      $276 = (($270) + 24|0);
      HEAP32[$276>>2] = $R7$1;
      break;
     }
    }
   } while(0);
   $277 = $167 | 1;
   $278 = (($p$0) + 4|0);
   HEAP32[$278>>2] = $277;
   $279 = (($141) + ($167)|0);
   $280 = $279;
   HEAP32[$280>>2] = $167;
   $281 = HEAP32[(((1680) + 20|0))>>2]|0;
   $282 = ($p$0|0)==($281|0);
   if (!($282)) {
    $psize$1 = $167;
    break;
   }
   HEAP32[(((1680) + 8|0))>>2] = $167;
   STACKTOP = sp;return;
  } else {
   $283 = $145 & -2;
   HEAP32[$144>>2] = $283;
   $284 = $psize$0 | 1;
   $285 = (($p$0) + 4|0);
   HEAP32[$285>>2] = $284;
   $286 = (($141) + ($psize$0)|0);
   $287 = $286;
   HEAP32[$287>>2] = $psize$0;
   $psize$1 = $psize$0;
  }
 } while(0);
 $288 = $psize$1 >>> 3;
 $289 = ($psize$1>>>0)<(256);
 if ($289) {
  $290 = $288 << 1;
  $291 = (((1680) + ($290<<2)|0) + 40|0);
  $292 = $291;
  $293 = HEAP32[((1680))>>2]|0;
  $294 = 1 << $288;
  $295 = $293 & $294;
  $296 = ($295|0)==(0);
  do {
   if ($296) {
    $297 = $293 | $294;
    HEAP32[((1680))>>2] = $297;
    $$sum16$pre = (($290) + 2)|0;
    $$pre = (((1680) + ($$sum16$pre<<2)|0) + 40|0);
    $$pre$phiZ2D = $$pre;$F16$0 = $292;
   } else {
    $$sum17 = (($290) + 2)|0;
    $298 = (((1680) + ($$sum17<<2)|0) + 40|0);
    $299 = HEAP32[$298>>2]|0;
    $300 = $299;
    $301 = HEAP32[(((1680) + 16|0))>>2]|0;
    $302 = ($300>>>0)<($301>>>0);
    if (!($302)) {
     $$pre$phiZ2D = $298;$F16$0 = $299;
     break;
    }
    _abort();
    // unreachable;
   }
  } while(0);
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $303 = (($F16$0) + 12|0);
  HEAP32[$303>>2] = $p$0;
  $304 = (($p$0) + 8|0);
  HEAP32[$304>>2] = $F16$0;
  $305 = (($p$0) + 12|0);
  HEAP32[$305>>2] = $292;
  STACKTOP = sp;return;
 }
 $306 = $p$0;
 $307 = $psize$1 >>> 8;
 $308 = ($307|0)==(0);
 do {
  if ($308) {
   $I18$0 = 0;
  } else {
   $309 = ($psize$1>>>0)>(16777215);
   if ($309) {
    $I18$0 = 31;
    break;
   }
   $310 = (($307) + 1048320)|0;
   $311 = $310 >>> 16;
   $312 = $311 & 8;
   $313 = $307 << $312;
   $314 = (($313) + 520192)|0;
   $315 = $314 >>> 16;
   $316 = $315 & 4;
   $317 = $316 | $312;
   $318 = $313 << $316;
   $319 = (($318) + 245760)|0;
   $320 = $319 >>> 16;
   $321 = $320 & 2;
   $322 = $317 | $321;
   $323 = (14 - ($322))|0;
   $324 = $318 << $321;
   $325 = $324 >>> 15;
   $326 = (($323) + ($325))|0;
   $327 = $326 << 1;
   $328 = (($326) + 7)|0;
   $329 = $psize$1 >>> $328;
   $330 = $329 & 1;
   $331 = $330 | $327;
   $I18$0 = $331;
  }
 } while(0);
 $332 = (((1680) + ($I18$0<<2)|0) + 304|0);
 $333 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$333>>2] = $I18$0$c;
 $334 = (($p$0) + 20|0);
 HEAP32[$334>>2] = 0;
 $335 = (($p$0) + 16|0);
 HEAP32[$335>>2] = 0;
 $336 = HEAP32[(((1680) + 4|0))>>2]|0;
 $337 = 1 << $I18$0;
 $338 = $336 & $337;
 $339 = ($338|0)==(0);
 L199: do {
  if ($339) {
   $340 = $336 | $337;
   HEAP32[(((1680) + 4|0))>>2] = $340;
   HEAP32[$332>>2] = $306;
   $341 = (($p$0) + 24|0);
   $$c = $332;
   HEAP32[$341>>2] = $$c;
   $342 = (($p$0) + 12|0);
   HEAP32[$342>>2] = $p$0;
   $343 = (($p$0) + 8|0);
   HEAP32[$343>>2] = $p$0;
  } else {
   $344 = HEAP32[$332>>2]|0;
   $345 = ($I18$0|0)==(31);
   if ($345) {
    $348 = 0;
   } else {
    $346 = $I18$0 >>> 1;
    $347 = (25 - ($346))|0;
    $348 = $347;
   }
   $349 = (($344) + 4|0);
   $350 = HEAP32[$349>>2]|0;
   $351 = $350 & -8;
   $352 = ($351|0)==($psize$1|0);
   L205: do {
    if ($352) {
     $T$0$lcssa = $344;
    } else {
     $353 = $psize$1 << $348;
     $K19$057 = $353;$T$056 = $344;
     while(1) {
      $359 = $K19$057 >>> 31;
      $360 = ((($T$056) + ($359<<2)|0) + 16|0);
      $361 = HEAP32[$360>>2]|0;
      $362 = ($361|0)==(0|0);
      if ($362) {
       break;
      }
      $354 = $K19$057 << 1;
      $355 = (($361) + 4|0);
      $356 = HEAP32[$355>>2]|0;
      $357 = $356 & -8;
      $358 = ($357|0)==($psize$1|0);
      if ($358) {
       $T$0$lcssa = $361;
       break L205;
      } else {
       $T$056$phi = $361;$K19$057 = $354;$T$056 = $T$056$phi;
      }
     }
     $363 = $360;
     $364 = HEAP32[(((1680) + 16|0))>>2]|0;
     $365 = ($363>>>0)<($364>>>0);
     if ($365) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$360>>2] = $306;
      $366 = (($p$0) + 24|0);
      $T$0$c13 = $T$056;
      HEAP32[$366>>2] = $T$0$c13;
      $367 = (($p$0) + 12|0);
      HEAP32[$367>>2] = $p$0;
      $368 = (($p$0) + 8|0);
      HEAP32[$368>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $369 = (($T$0$lcssa) + 8|0);
   $370 = HEAP32[$369>>2]|0;
   $371 = $T$0$lcssa;
   $372 = HEAP32[(((1680) + 16|0))>>2]|0;
   $373 = ($371>>>0)<($372>>>0);
   if ($373) {
    _abort();
    // unreachable;
   }
   $374 = $370;
   $375 = ($374>>>0)<($372>>>0);
   if ($375) {
    _abort();
    // unreachable;
   } else {
    $376 = (($370) + 12|0);
    HEAP32[$376>>2] = $306;
    HEAP32[$369>>2] = $306;
    $377 = (($p$0) + 8|0);
    $$c12 = $370;
    HEAP32[$377>>2] = $$c12;
    $378 = (($p$0) + 12|0);
    $T$0$c = $T$0$lcssa;
    HEAP32[$378>>2] = $T$0$c;
    $379 = (($p$0) + 24|0);
    HEAP32[$379>>2] = 0;
    break;
   }
  }
 } while(0);
 $380 = HEAP32[(((1680) + 32|0))>>2]|0;
 $381 = (($380) + -1)|0;
 HEAP32[(((1680) + 32|0))>>2] = $381;
 $382 = ($381|0)==(0);
 if ($382) {
  $sp$0$in$i = (((1680) + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $383 = ($sp$0$i|0)==(0|0);
  $384 = (($sp$0$i) + 8|0);
  if ($383) {
   break;
  } else {
   $sp$0$in$i$phi = $384;$sp$0$in$i = $sp$0$in$i$phi;
  }
 }
 HEAP32[(((1680) + 32|0))>>2] = -1;
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

  

  // EMSCRIPTEN_END_FUNCS
  

  return { _strlen: _strlen, _free: _free, _main: _main, _rand_r: _rand_r, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _rand: _rand, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9 };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_fabs": _fabs, "_llvm_lifetime_start": _llvm_lifetime_start, "_clReleaseProgram": _clReleaseProgram, "_send": _send, "_fread": _fread, "_clReleaseKernel": _clReleaseKernel, "_clReleaseContext": _clReleaseContext, "___setErrNo": ___setErrNo, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clCreateContext": _clCreateContext, "_clEnqueueWriteBuffer": _clEnqueueWriteBuffer, "_clCreateProgramWithSource": _clCreateProgramWithSource, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "_time": _time, "_pwrite": _pwrite, "_open": _open, "_sbrk": _sbrk, "_snprintf": _snprintf, "_clReleaseMemObject": _clReleaseMemObject, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_pread": _pread, "_read": _read, "_sysconf": _sysconf, "__formatString": __formatString, "_clFinish": _clFinish, "_clCreateCommandQueue": _clCreateCommandQueue, "_printf": _printf, "_sprintf": _sprintf, "__reallyNegative": __reallyNegative, "_clGetDeviceInfo": _clGetDeviceInfo, "_write": _write, "_fflush": _fflush, "___errno_location": ___errno_location, "_clCreateBuffer": _clCreateBuffer, "_stat": _stat, "_recv": _recv, "_clGetDeviceIDs": _clGetDeviceIDs, "_mkport": _mkport, "_clCreateKernel": _clCreateKernel, "_clSetKernelArg": _clSetKernelArg, "_abort": _abort, "_fwrite": _fwrite, "_emscripten_get_now": _emscripten_get_now, "_clBuildProgram": _clBuildProgram, "_fprintf": _fprintf, "_clReleaseCommandQueue": _clReleaseCommandQueue, "_llvm_lifetime_end": _llvm_lifetime_end, "_fopen": _fopen, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "_strstr": _strstr, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "___rand_seed": ___rand_seed, "NaN": NaN, "Infinity": Infinity }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _rand_r = Module["_rand_r"] = asm["_rand_r"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _rand = Module["_rand"] = asm["_rand"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];

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



//# sourceMappingURL=osx_reduce.js.map