// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
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
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
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
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
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
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
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
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
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
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
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
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
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
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
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
//                   'array' for JavaScript arrays and typed arrays).
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
    var func = globalScope['Module']['_' + ident]; // closure exported function
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
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
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
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
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
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
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
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
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
    HEAP8[(((buffer)+(i))|0)]=chr
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
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
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
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 15136;
var _stdout;
var _stdin;
var _stderr;
__ATINIT__ = __ATINIT__.concat([
  { func: function() { __GLOBAL__I_a() } }
]);
var ___fsmu8;
var ___dso_handle;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZNSt13runtime_errorC1EPKc;
var __ZNSt13runtime_errorD1Ev;
var __ZNSt12length_errorD1Ev;
var __ZNSt3__16localeC1Ev;
var __ZNSt3__16localeC1ERKS0_;
var __ZNSt3__16localeD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,8,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,24,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,9,0,0,0,8,0,0,0,3,0,0,0,8,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,3,0,0,0,3,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,9,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,9,0,0,0,8,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,99,108,66,117,105,108,100,80,114,111,103,114,97,109,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,69,114,114,111,114,32,105,110,32,107,101,114,110,101,108,58,32,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,114,101,97,100,105,110,103,32,67,111,110,118,111,108,117,116,105,111,110,46,99,108,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,67,111,110,118,111,108,117,116,105,111,110,46,99,108,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,32,40,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,69,82,82,79,82,58,32,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,78,111,32,67,80,85,32,100,101,118,105,99,101,32,102,111,117,110,100,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,58,32,0,0,0,0,0,0,114,0,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,37,112,0,0,0,0,0,0,69,120,101,99,117,116,101,100,32,112,114,111,103,114,97,109,32,115,117,99,99,101,115,102,117,108,108,121,46,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,0,0,32,0,0,0,0,0,0,0,99,108,69,110,113,117,101,117,101,82,101,97,100,66,117,102,102,101,114,0,0,0,0,0,67,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,0,0,118,101,99,116,111,114,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,0,0,37,46,48,76,102,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,111,117,116,112,117,116,83,105,103,110,97,108,41,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,109,97,115,107,41,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,105,110,112,117,116,83,105,103,110,97,108,41,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,99,111,110,118,111,108,118,101,0,0,0,0,0,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,73,68,115,0,0,0,0,0,0,0,0,69,114,114,111,114,32,111,99,99,117,114,101,100,32,100,117,114,105,110,103,32,99,111,110,116,101,120,116,32,117,115,101,58,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,36,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,32,0,0,0,118,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,36,0,0,204,0,0,0,168,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,36,0,0,74,0,0,0,14,1,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,36,0,0,94,0,0,0,8,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,36,0,0,94,0,0,0,20,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,36,0,0,174,0,0,0,86,0,0,0,50,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,36,0,0,242,0,0,0,192,0,0,0,50,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,36,0,0,166,0,0,0,194,0,0,0,50,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,36,0,0,8,1,0,0,144,0,0,0,50,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,37,0,0,6,1,0,0,16,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,37,0,0,164,0,0,0,110,0,0,0,50,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,37,0,0,40,0,0,0,112,0,0,0,50,0,0,0,124,0,0,0,4,0,0,0,30,0,0,0,6,0,0,0,20,0,0,0,54,0,0,0,2,0,0,0,248,255,255,255,152,37,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,37,0,0,252,0,0,0,234,0,0,0,50,0,0,0,20,0,0,0,16,0,0,0,58,0,0,0,26,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,192,37,0,0,72,0,0,0,108,0,0,0,120,0,0,0,126,0,0,0,66,0,0,0,44,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,37,0,0,80,0,0,0,196,0,0,0,50,0,0,0,50,0,0,0,40,0,0,0,8,0,0,0,40,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,37,0,0,60,0,0,0,68,0,0,0,50,0,0,0,42,0,0,0,86,0,0,0,12,0,0,0,56,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,38,0,0,0,1,0,0,2,0,0,0,50,0,0,0,24,0,0,0,32,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,38,0,0,48,0,0,0,218,0,0,0,50,0,0,0,38,0,0,0,14,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,38,0,0,222,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,38,0,0,28,0,0,0,142,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,38,0,0,6,0,0,0,180,0,0,0,50,0,0,0,8,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,38,0,0,98,0,0,0,18,0,0,0,50,0,0,0,22,0,0,0,26,0,0,0,32,0,0,0,24,0,0,0,22,0,0,0,8,0,0,0,6,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,38,0,0,42,0,0,0,24,0,0,0,50,0,0,0,46,0,0,0,44,0,0,0,36,0,0,0,38,0,0,0,28,0,0,0,42,0,0,0,34,0,0,0,52,0,0,0,50,0,0,0,48,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,38,0,0,54,0,0,0,4,0,0,0,50,0,0,0,76,0,0,0,68,0,0,0,62,0,0,0,64,0,0,0,56,0,0,0,66,0,0,0,60,0,0,0,74,0,0,0,72,0,0,0,70,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,38,0,0,76,0,0,0,92,0,0,0,50,0,0,0,14,0,0,0,16,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,38,0,0,26,0,0,0,182,0,0,0,50,0,0,0,22,0,0,0,18,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,0,0,240,0,0,0,134,0,0,0,50,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,64,0,0,0,4,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,39,0,0,186,0,0,0,62,0,0,0,50,0,0,0,2,0,0,0,8,0,0,0,8,0,0,0,110,0,0,0,100,0,0,0,18,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,39,0,0,186,0,0,0,136,0,0,0,50,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,130,0,0,0,46,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,39,0,0,186,0,0,0,156,0,0,0,50,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,39,0,0,186,0,0,0,36,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,39,0,0,58,0,0,0,126,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,39,0,0,186,0,0,0,82,0,0,0,50,0,0,0,20,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,16,0,0,0,30,0,0,0,24,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,39,0,0,12,1,0,0,38,0,0,0,50,0,0,0,2,0,0,0,4,0,0,0,20,0,0,0,36,0,0,0,8,0,0,0,6,0,0,0,28,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,39,0,0,70,0,0,0,230,0,0,0,80,0,0,0,2,0,0,0,14,0,0,0,34,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,0,0,186,0,0,0,88,0,0,0,50,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,40,0,0,186,0,0,0,170,0,0,0,50,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,40,0,0,130,0,0,0,246,0,0,0,16,0,0,0,22,0,0,0,16,0,0,0,12,0,0,0,90,0,0,0,104,0,0,0,32,0,0,0,28,0,0,0,26,0,0,0,32,0,0,0,42,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,40,0,0,10,0,0,0,120,0,0,0,60,0,0,0,40,0,0,0,30,0,0,0,8,0,0,0,52,0,0,0,88,0,0,0,18,0,0,0,6,0,0,0,10,0,0,0,28,0,0,0,16,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,40,0,0,100,0,0,0,202,0,0,0,2,0,0,0,2,0,0,0,14,0,0,0,34,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,56,40,0,0,160,0,0,0,184,0,0,0,148,255,255,255,148,255,255,255,56,40,0,0,102,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,104,40,0,0,46,0,0,0,216,0,0,0,252,255,255,255,252,255,255,255,104,40,0,0,150,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,128,40,0,0,224,0,0,0,248,0,0,0,252,255,255,255,252,255,255,255,128,40,0,0,108,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,152,40,0,0,90,0,0,0,16,1,0,0,248,255,255,255,248,255,255,255,152,40,0,0,188,0,0,0,244,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,176,40,0,0,106,0,0,0,212,0,0,0,248,255,255,255,248,255,255,255,176,40,0,0,140,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,40,0,0,220,0,0,0,66,0,0,0,42,0,0,0,26,0,0,0,18,0,0,0,14,0,0,0,48,0,0,0,88,0,0,0,18,0,0,0,94,0,0,0,10,0,0,0,18,0,0,0,16,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,40,0,0,210,0,0,0,190,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,41,0,0,2,1,0,0,238,0,0,0,4,0,0,0,22,0,0,0,16,0,0,0,12,0,0,0,60,0,0,0,104,0,0,0,32,0,0,0,28,0,0,0,26,0,0,0,32,0,0,0,42,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,41,0,0,158,0,0,0,214,0,0,0,34,0,0,0,40,0,0,0,30,0,0,0,8,0,0,0,92,0,0,0,88,0,0,0,18,0,0,0,6,0,0,0,10,0,0,0,28,0,0,0,16,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,41,0,0,232,0,0,0,148,0,0,0,50,0,0,0,70,0,0,0,122,0,0,0,38,0,0,0,82,0,0,0,6,0,0,0,28,0,0,0,54,0,0,0,20,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,41,0,0,104,0,0,0,56,0,0,0,50,0,0,0,116,0,0,0,4,0,0,0,68,0,0,0,76,0,0,0,78,0,0,0,22,0,0,0,118,0,0,0,52,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,41,0,0,236,0,0,0,116,0,0,0,50,0,0,0,14,0,0,0,62,0,0,0,48,0,0,0,44,0,0,0,80,0,0,0,54,0,0,0,96,0,0,0,58,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,41,0,0,78,0,0,0,178,0,0,0,50,0,0,0,106,0,0,0,112,0,0,0,26,0,0,0,74,0,0,0,24,0,0,0,18,0,0,0,82,0,0,0,72,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,41,0,0,200,0,0,0,72,0,0,0,62,0,0,0,22,0,0,0,16,0,0,0,12,0,0,0,90,0,0,0,104,0,0,0,32,0,0,0,74,0,0,0,84,0,0,0,12,0,0,0,42,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,41,0,0,14,0,0,0,226,0,0,0,66,0,0,0,40,0,0,0,30,0,0,0,8,0,0,0,52,0,0,0,88,0,0,0,18,0,0,0,58,0,0,0,24,0,0,0,4,0,0,0,16,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,41,0,0,4,1,0,0,206,0,0,0,64,0,0,0,154,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,60,20,0,0,68,42,0,0,88,42,0,0,80,20,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,232,23,0,0,0,0,0,0,248,23,0,0,0,0,0,0,8,24,0,0,248,35,0,0,0,0,0,0,0,0,0,0,24,24,0,0,248,35,0,0,0,0,0,0,0,0,0,0,40,24,0,0,248,35,0,0,0,0,0,0,0,0,0,0,64,24,0,0,64,36,0,0,0,0,0,0,0,0,0,0,88,24,0,0,248,35,0,0,0,0,0,0,0,0,0,0,104,24,0,0,176,23,0,0,128,24,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,32,41,0,0,0,0,0,0,176,23,0,0,200,24,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,40,41,0,0,0,0,0,0,176,23,0,0,16,25,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,48,41,0,0,0,0,0,0,176,23,0,0,88,25,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,56,41,0,0,0,0,0,0,0,0,0,0,160,25,0,0,72,38,0,0,0,0,0,0,0,0,0,0,208,25,0,0,72,38,0,0,0,0,0,0,176,23,0,0,0,26,0,0,0,0,0,0,1,0,0,0,80,40,0,0,0,0,0,0,176,23,0,0,24,26,0,0,0,0,0,0,1,0,0,0,80,40,0,0,0,0,0,0,176,23,0,0,48,26,0,0,0,0,0,0,1,0,0,0,88,40,0,0,0,0,0,0,176,23,0,0,72,26,0,0,0,0,0,0,1,0,0,0,88,40,0,0,0,0,0,0,176,23,0,0,96,26,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,208,41,0,0,0,8,0,0,176,23,0,0,168,26,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,208,41,0,0,0,8,0,0,176,23,0,0,240,26,0,0,0,0,0,0,3,0,0,0,128,39,0,0,2,0,0,0,80,36,0,0,2,0,0,0,224,39,0,0,0,8,0,0,176,23,0,0,56,27,0,0,0,0,0,0,3,0,0,0,128,39,0,0,2,0,0,0,80,36,0,0,2,0,0,0,232,39,0,0,0,8,0,0,0,0,0,0,128,27,0,0,128,39,0,0,0,0,0,0,0,0,0,0,152,27,0,0,128,39,0,0,0,0,0,0,176,23,0,0,176,27,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,96,40,0,0,2,0,0,0,176,23,0,0,200,27,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,96,40,0,0,2,0,0,0,0,0,0,0,224,27,0,0,0,0,0,0,248,27,0,0,216,40,0,0,0,0,0,0,176,23,0,0,24,28,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,248,36,0,0,0,0,0,0,176,23,0,0,96,28,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,16,37,0,0,0,0,0,0,176,23,0,0,168,28,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,40,37,0,0,0,0,0,0,176,23,0,0,240,28,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,64,37,0,0,0,0,0,0,0,0,0,0,56,29,0,0,128,39,0,0,0,0,0,0,0,0,0,0,80,29,0,0,128,39,0,0,0,0,0,0,176,23,0,0,104,29,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,232,40,0,0,2,0,0,0,176,23,0,0,144,29,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,232,40,0,0,2,0,0,0,176,23,0,0,184,29,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,232,40,0,0,2,0,0,0,176,23,0,0,224,29,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,232,40,0,0,2,0,0,0,0,0,0,0,8,30,0,0,72,40,0,0,0,0,0,0,0,0,0,0,32,30,0,0,128,39,0,0,0,0,0,0,176,23,0,0,56,30,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,200,41,0,0,2,0,0,0,176,23,0,0,80,30,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,200,41,0,0,2,0,0,0,0,0,0,0,104,30,0,0,0,0,0,0,144,30,0,0,0,0,0,0,184,30,0,0,240,40,0,0,0,0,0,0,0,0,0,0,216,30,0,0].concat([96,39,0,0,0,0,0,0,0,0,0,0,0,31,0,0,96,39,0,0,0,0,0,0,0,0,0,0,40,31,0,0,0,0,0,0,96,31,0,0,0,0,0,0,152,31,0,0,0,0,0,0,184,31,0,0,176,40,0,0,0,0,0,0,0,0,0,0,232,31,0,0,0,0,0,0,8,32,0,0,0,0,0,0,40,32,0,0,0,0,0,0,72,32,0,0,176,23,0,0,96,32,0,0,0,0,0,0,1,0,0,0,216,36,0,0,3,244,255,255,176,23,0,0,144,32,0,0,0,0,0,0,1,0,0,0,232,36,0,0,3,244,255,255,176,23,0,0,192,32,0,0,0,0,0,0,1,0,0,0,216,36,0,0,3,244,255,255,176,23,0,0,240,32,0,0,0,0,0,0,1,0,0,0,232,36,0,0,3,244,255,255,0,0,0,0,32,33,0,0,40,40,0,0,0,0,0,0,0,0,0,0,80,33,0,0,32,36,0,0,0,0,0,0,0,0,0,0,104,33,0,0,0,0,0,0,128,33,0,0,48,40,0,0,0,0,0,0,0,0,0,0,152,33,0,0,32,40,0,0,0,0,0,0,0,0,0,0,184,33,0,0,40,40,0,0,0,0,0,0,0,0,0,0,216,33,0,0,0,0,0,0,248,33,0,0,0,0,0,0,24,34,0,0,0,0,0,0,56,34,0,0,176,23,0,0,88,34,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,192,41,0,0,2,0,0,0,176,23,0,0,120,34,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,192,41,0,0,2,0,0,0,176,23,0,0,152,34,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,192,41,0,0,2,0,0,0,176,23,0,0,184,34,0,0,0,0,0,0,2,0,0,0,128,39,0,0,2,0,0,0,192,41,0,0,2,0,0,0,0,0,0,0,216,34,0,0,0,0,0,0,240,34,0,0,0,0,0,0,8,35,0,0,0,0,0,0,32,35,0,0,32,40,0,0,0,0,0,0,0,0,0,0,56,35,0,0,40,40,0,0,0,0,0,0,0,0,0,0,80,35,0,0,24,42,0,0,0,0,0,0,0,0,0,0,120,35,0,0,24,42,0,0,0,0,0,0,0,0,0,0,160,35,0,0,40,42,0,0,0,0,0,0,0,0,0,0,200,35,0,0,240,35,0,0,0,0,0,0,108,0,0,0,0,0,0,0,176,40,0,0,106,0,0,0,212,0,0,0,148,255,255,255,148,255,255,255,176,40,0,0,140,0,0,0,52,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(260);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(132);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(64);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(154);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(10);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(260);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(254);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(64);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(154);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(28);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(10);
HEAP32[((9200)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9208)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9216)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9232)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9248)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9264)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9280)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9296)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9432)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9448)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9704)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9720)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9800)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9808)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9952)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9968)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10112)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10128)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10208)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10216)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10224)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10240)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10256)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10272)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10280)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10288)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10296)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10312)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10320)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10328)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10336)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10440)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10456)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10472)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10480)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10496)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10512)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10528)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10536)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10544)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10552)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10688)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10696)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10704)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10712)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10728)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10744)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10760)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10776)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10792)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
__ZNSt13runtime_errorC1EPKc = 46;
__ZNSt13runtime_errorD1Ev = 74;
__ZNSt12length_errorD1Ev = (94);
__ZNSt3__16localeC1Ev = 228;
__ZNSt3__16localeC1ERKS0_ = 30;
__ZNSt3__16localeD1Ev = 162;
__ZNSt8bad_castC1Ev = 44;
__ZNSt8bad_castD1Ev = 204;
}
if (!awaitingMemoryInitializer) runPostSets();
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
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
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
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
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
          var img = new Image();
          img.onload = function() {
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
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
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
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
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
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
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
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
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
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
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
        xhr.onload = function() {
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
      }};var CL={address_space:{GENERAL:0,GLOBAL:1,LOCAL:2,CONSTANT:4,PRIVATE:8},data_type:{FLOAT:16,INT:32,UINT:64},ctx:[],webcl_mozilla:0,webcl_webkit:0,ctx_clean:0,cmdQueue:[],cmdQueue_clean:0,programs:[],programs_clean:0,kernels:[],kernels_name:[],kernels_sig:[],kernels_clean:0,buffers:[],buffers_clean:0,platforms:[],devices:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",isFloat:function (ptr,size) {
        console.error("CL.isFloat not must be called any more ... use the parse of kernel string !!! \n");
        console.error("But may be the kernel source is not yet parse !!! \n");
        var v_int = HEAP32[((ptr)>>2)]; 
        var v_float = HEAPF32[((ptr)>>2)]; 
        // If the value is 0
        if ( v_int == 0 ) {
          // If is an array
          if (size > 1) {
            v_int = HEAP32[(((ptr)+(size - 1))>>2)]; 
            v_float = HEAPF32[(((ptr)+(size - 1))>>2)];     
          } else { 
            // Use float by default 
            return 1;
          }                
        }
        // If we read int and is float we have a very big value 1e8
        if (Math.abs(v_int) > 100000000) {
          return 1;
        }
        return 0;      
      },parseKernel:function (kernelstring) {
        // Experimental parse of Kernel
        // Search kernel function like __kernel ... NAME ( p1 , p2 , p3)  
        // Step 1 : Search __kernel
        // Step 2 : Search kernel name (before the open brace)
        // Step 3 : Search brace '(' and ')'
        // Step 4 : Split all inside the brace by ',' after removing all space
        // Step 5 : For each parameter search Adress Space and Data Type
        //
        // --------------------------------------------------------------------
        //
        // \note Work only with one kernel ....
        var kernel_struct = [];
        kernelstring = kernelstring.replace(/\n/g, " ");
        kernelstring = kernelstring.replace(/\r/g, " ");
        kernelstring = kernelstring.replace(/\t/g, " ");
        // Search kernel function __kernel 
        var kernel_start = kernelstring.indexOf("__kernel");
        kernelstring = kernelstring.substr(kernel_start,kernelstring.length-kernel_start);
        var brace_start = kernelstring.indexOf("(");
        var brace_end = kernelstring.indexOf(")");  
        var kernels_name = "";
        // Search kernel Name
        for (var i = brace_start - 1; i >= 0 ; i--) {
          var chara = kernelstring.charAt(i);
          if (chara == ' ' && kernels_name.length > 0) {
            break;
          } else if (chara != ' ') {
            kernels_name = chara + kernels_name;
          }
        }
        kernelstring = kernelstring.substr(brace_start + 1,brace_end - brace_start - 1);
        kernelstring = kernelstring.replace(/\ /g, "");
        var kernel_parameter = kernelstring.split(",");
        console.info("Kernel NAME : " + kernels_name);      
        console.info("Kernel PARAMETER NUM : "+kernel_parameter.length);
        kernel_struct [ kernels_name ] = [];
        for (var i = 0; i < kernel_parameter.length; i ++) {
            var value = 0;
            var string = kernel_parameter[i]
            // Adress space
            // __global, __local, __constant, __private. 
            if (string.indexOf("__local") >= 0 ) {
              value |= CL.address_space.LOCAL;
            }
            // Data Type
            // float, uchar, unsigned char, uint, unsigned int, int. 
            if (string.indexOf("float") >= 0 ) {
              value |= CL.data_type.FLOAT;
            } else if (string.indexOf("uchar") >= 0 ) {
              value |= CL.data_type.UINT;
            } else if (string.indexOf("unsigned char") >= 0 ) {
              value |= CL.data_type.UINT;
            } else if (string.indexOf("uint") >= 0 ) {
              value |= CL.data_type.UINT;
            } else if (string.indexOf("unsigned int") >= 0 ) {
              value |= CL.data_type.UINT;
            } else if (string.indexOf("int") >= 0 ) {
              value |= CL.data_type.INT;
            }
            kernel_struct [ kernels_name ].push(value);
        }
        return kernel_struct;
      },getDeviceName:function (type) {
        switch (type) {
          case 2 : return "CPU_DEVICE";
          case 4 : return "GPU_DEVICE";
          default : return "UNKNOW_DEVICE";
        }
      },getAllDevices:function (platform) {
        var res = [];
        if (platform >= CL.platforms.length || platform < 0 ) {
            console.error("getAllDevices: Invalid platform : "+plat);
            return res; 
        }
        if (CL.webcl_mozilla == 1) {
          res = res.concat(CL.platforms[platform].getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL));
        } else {
          //platforms[platform].getDevices(DEVICE_TYPE_ALL); // DEVICE_TYPE_ALL not work on webkit not normal
          res = res.concat(CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_GPU));
          res = res.concat(CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_CPU));  
        }    
        return res;
      },catchError:function (name,e) {
        var str=""+e;
        var n=str.lastIndexOf(" ");
        var error = str.substr(n+1,str.length-n-2);
        console.error("CATCH: "+name+": "+e);
        return error;
      }};function _clGetPlatformIDs(num_entries,platform_ids,num_platforms) {
      if (CL.webcl_webkit == 0 && CL.webcl_mozilla == 0) {
        if (window.WebCL == undefined) {
          if(typeof(webcl) === "undefined") {
            console.log(CL.errorMessage);
            return -1;/*CL_DEVICE_NOT_FOUND*/;
          } else {
            window.WebCL = webcl
            CL.webcl_webkit = 1;
          }
        } else {
          CL.webcl_mozilla = 1;
        }
      }
      var browser = (CL.webcl_mozilla == 1) ? "Mozilla" : "Webkit";
      console.info("Webcl implemented for "+browser);
      try { 
        // Get the platform
        var platforms = (CL.webcl_mozilla == 1) ? WebCL.getPlatformIDs() : WebCL.getPlatforms();
        // If platforms is not NULL, the num_entries must be greater than zero.
        // If both num_platforms and platforms are NULL.
        if ( (num_entries == 0 && platform_ids) != 0 || (num_platforms == 0 && platforms.length == 0) ) {
          return -30;/*CL_INVALID_VALUE*/
        }
        if (platform_ids == 0) {
          // If num_platforms is not null, we put the value inside
          HEAP32[((num_platforms)>>2)]=platforms.length /* Num of devices */;
          return 0;/*CL_SUCCESS*/
        } 
        console.info("clGetPlatformID: Platforms:");
        for (var i = 0; i < platforms.length; i++) {
          // The number of OpenCL platforms returned is the mininum of the value specified by num_entries or the number of OpenCL platforms available.
          if (num_entries != 0 && i >= num_entries) break;
          CL.platforms.push(platforms[i]);
          var plat = platforms[i];
          var name = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (WebCL.CL_PLATFORM_NAME) : "Not Visible"/*plat.getInfo (WebCL.PLATFORM_NAME)*/;
          var vendor = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (WebCL.CL_PLATFORM_VENDOR) : "Not Visible"/*plat.getInfo (WebCL.PLATFORM_VENDOR)*/;
          var version = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (WebCL.CL_PLATFORM_VERSION) : plat.getInfo (WebCL.PLATFORM_VERSION);
          var extensions = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (WebCL.CL_PLATFORM_EXTENSIONS) : "Not Visible"/*plat.getInfo (WebCL.PLATFORM_EXTENSIONS)*/;
          var profile = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (WebCL.CL_PLATFORM_PROFILE) : plat.getInfo (WebCL.PLATFORM_PROFILE);
          console.info("\t"+i+": name: " + name);              
          console.info("\t"+i+": vendor: " + vendor);              
          console.info("\t"+i+": version: " + version);
          console.info("\t"+i+": profile: " + profile);
          console.info("\t"+i+": extensions: " + extensions);
        }
        // If num_platforms is not null, we put the value inside
        if (num_platforms != 0) {
          HEAP32[((num_platforms)>>2)]=CL.platforms.length /* Num of devices */;
        }
        // Add indices in array platforms (+1) for don't have platforms with id == 0
        for (var i = 0; i < CL.platforms.length; i++) {
          HEAP32[(((platform_ids)+(i*4))>>2)]=i+1;
        }
        return 0;/*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetPlatformID",e);
      }
    }
  function _clGetDeviceIDs(platform, device_type_i64_1, device_type_i64_2, num_entries, devices_ids, num_devices) {
      if (CL.webcl_webkit == 0 && CL.webcl_mozilla == 0) {
        if (window.WebCL == undefined) {
          if(typeof(webcl) === "undefined") {
            console.log(CL.errorMessage);
            return -1;/*CL_DEVICE_NOT_FOUND*/;
          } else {
            window.WebCL = webcl
            CL.webcl_webkit = 1;
          }
        } else {
          CL.webcl_mozilla = 1;
        }
      }
      var browser = (CL.webcl_mozilla == 1) ? "Mozilla" : "Webkit";
      console.info("Webcl implemented for "+browser);
      // Assume the device type is i32 
      assert(device_type_i64_2 == 0, 'Invalid flags i64');
      try { 
        // If platform is NULL, the behavior is implementation-defined
        if (platform == 0 && CL.platforms.length == 0) {
            // Get the platform
            var platforms = (CL.webcl_mozilla == 1) ? WebCL.getPlatformIDs() : WebCL.getPlatforms();
            if (platforms.length > 0) {
              CL.platforms.push(platforms[0]);
            } else {
              console.error("clGetDeviceIDs: Invalid platform : "+platform);
              return -32; /* CL_INVALID_PLATFORM */ 
            }      
        } else {              
          platform -= 1;
        }
        var alldev = CL.getAllDevices(platform);
        // If devices_ids is not NULL, the num_entries must be greater than zero.
        if ((num_entries == 0 && device_type_i64_1 == 0) || (alldev.length == 0 && device_type_i64_1 == 0)) {
          console.error("clGetDeviceIDs: Invalid value : "+num_entries);
          return -30;/*CL_INVALID_VALUE*/
        }
        if ( alldev.length > 0 && device_type_i64_1 == 0) {
          console.error("clGetDeviceIDs: Invalid device type : "+device_type_i64_1);
          return -31;/*CL_INVALID_DEVICE_TYPE*/
        }
        var map = {};
        var mapcount = 0;
        for (var i = 0 ; i < alldev.length; i++ ) {
          var type = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(WebCL.CL_DEVICE_TYPE) : alldev[i].getInfo(WebCL.DEVICE_TYPE);
          if (type == device_type_i64_1 || device_type_i64_1 == -1) { 
             var name = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(WebCL.CL_DEVICE_NAME) : CL.getDeviceName(type);
             map[name] = alldev[i];
             mapcount ++;
          }    
        }
        if (mapcount == 0) {
          var alldev = CL.getAllDevices(platform);
          for (var i = 0 ; i < alldev.length; i++) {
            var name = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(WebCL.CL_DEVICE_NAME) : /*alldev[i].getInfo(WebCL.DEVICE_NAME) ;*/CL.getDeviceName(alldev[i].getInfo(WebCL.DEVICE_TYPE));
            map[name] = alldev[i];
            mapcount ++;
          }       
        }
        if (devices_ids == 0) {
          HEAP32[((num_devices)>>2)]=mapcount /* Num of devices */;
          return 0;/*CL_SUCCESS*/
        }
        console.info("clGetDeviceIDs: Devices:");
        for (var name in map) {
          CL.devices.push(map[name]);
          console.info("\t"+CL.devices.length-1+": name: " + name);
        }
        if (CL.devices.length == 0 ) {
          return -31;/*CL_INVALID_DEVICE_TYPE*/
        }
        if (num_entries > 0 && CL.devices.length > num_entries) {
          return -30;/*CL_INVALID_VALUE*/
        }
        // If devices is not null, we put the value inside
        if (num_devices != 0) {
          HEAP32[((num_devices)>>2)]=CL.devices.length /* Num of devices */;
        }
        // Add indices in array devices (+1) for don't have devices with id == 0
        for (var i = 0; i < CL.devices.length; i++) {
          HEAP32[(((devices_ids)+(i*4))>>2)]=i+1;
        }
        return 0;/*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetDeviceIDs",e);
      }
    }
  function _clCreateContext(properties, num_devices, devices, pfn_notify, user_data, errcode_ret) {
      if (CL.platforms.length == 0) {
        console.error("clCreateContext: Invalid platform");
        HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
        return 0; // Null pointer    
      }
      try {
        var prop = [];
        if (properties != 0) {
          var i = 0;
          while(1) {
            var readprop = HEAP32[(((properties)+(i*4))>>2)];
            if (readprop == 0) break;
            switch(readprop) {
              case (4228) /*CL_CONTEXT_PLATFORM*/ :
                // property platform
                prop.push(WebCL.CL_CONTEXT_PLATFORM);
                i++;
                // get platform id
                readprop = HEAP32[(((properties)+(i*4))>>2)] - 1;
                if (readprop >= CL.platforms.length || readprop < 0 ) {
                  console.error("clCreateContext: Invalid context : "+ctx);
                  HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
                  return 0; // Null pointer    
                } else {
                  prop.push(CL.platforms[readprop]);
                }             
              break;
              default:
                console.error("clCreateContext : Param not yet implemented or unknow : "+param_name);
                HEAP32[((errcode_ret)>>2)]=-30 /* CL_INVALID_VALUE */;
                return 0; // Null pointer    
            }
            i++;  
          }        
        }
        if (prop.length == 0) {
          prop = [WebCL.CL_CONTEXT_PLATFORM, CL.platforms[0]];     
        }
        if (num_devices > CL.devices.length || CL.devices.length == 0) {
          console.error("clCreateContext: Invalid num devices : "+num_devices);
          HEAP32[((errcode_ret)>>2)]=-33 /* CL_INVALID_DEVICE */;  
          return 0;
        }
        // \todo will be better to use the devices list in parameter ...
        var devices_tab = [];
        for (var i = 0; i < num_devices; i++) {
          devices_tab[i] = CL.devices[i];
        } 
        // Use default platform
        if (CL.webcl_mozilla == 1) {
          CL.ctx.push(WebCL.createContext(prop, devices_tab/*[CL.devices[0],CL.devices[1]]*/));  
        } else {
          CL.ctx.push(WebCL.createContext({platform: prop[1], devices: devices_tab, deviceType: devices_tab[0].getInfo(WebCL.DEVICE_TYPE), shareGroup: 1, hint: null}));
        }
        // Return the pos of the context +1
        return CL.ctx.length;
      } catch (e) {    
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContext",e);
        return 0; // Null pointer    
      }
    }
  function ___gxx_personality_v0() {
    }
  function _clCreateProgramWithSource(context, count, strings, lengths, errcode_ret) {
      var ctx = context - 1;
      if (ctx >= CL.ctx.length || ctx < 0 ) {
        console.error("clCreateProgramWithSource: Invalid context : "+ctx);
        HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
        return 0; // Null pointer    
      }
      var sourceIdx = HEAP32[((strings)>>2)]
      var kernel = Pointer_stringify(sourceIdx); 
      CL.kernels_sig = CL.parseKernel(kernel);
      try {
        // \todo set the properties 
        if (CL.webcl_mozilla == 1) {
          CL.programs.push(CL.ctx[ctx].createProgramWithSource(kernel));
        } else {
          CL.programs.push(CL.ctx[ctx].createProgram(kernel));
        }
        // Return the pos of the queue +1
        return CL.programs.length;
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateProgramWithSource",e);
        return 0; // Null pointer
      }
    }
  function _clBuildProgram(program, num_devices, device_list, options, pfn_notify, user_data) {
      var prog = program - 1;
      if (prog >= CL.programs.length || prog < 0 ) {
        console.error("clBuildProgram: Invalid program : "+prog);
        return -44; /* CL_INVALID_PROGRAM */
      }
      try {
        if (num_devices > CL.devices.length || CL.devices.length == 0) {
          console.error("clBuildProgram: Invalid num devices : "+num_devices);
          return -33; /* CL_INVALID_DEVICE */;  
        }
        var devices_tab = [];
        if (num_devices == 0 || device_list == 0) {
          devices_tab[0] = CL.devices[0];
        } else {
          // \todo will be better to use the devices list in parameter ...
          for (var i = 0; i < num_devices; i++) {
            devices_tab[i] = CL.devices[i];
          }
        }    
        var opt = "";
        if (CL.webcl_mozilla == 1) {
          CL.programs[prog].buildProgram (devices_tab, opt);
        } else { 
          CL.programs[prog].build(devices_tab);
        }
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clBuildProgram",e);
      }
    }
  function _clGetProgramBuildInfo(program, device, param_name, param_value_size, param_value, param_value_size_ret) {
      var prog = program - 1;
      if (prog >= CL.programs.length || prog < 0 ) {
        console.error("clGetProgramBuildInfo: Invalid program : "+prog);
        return -44; /* CL_INVALID_PROGRAM */
      }           
      // \todo the type is a number but why i except have a Array ??? Will must be an array ???
      var idx = HEAP32[((device)>>2)] - 1;
      if (idx >= CL.devices.length || idx < 0 ) {
        console.error("clGetProgramBuildInfo: Invalid device : "+idx);
        return -33; /* CL_INVALID_DEVICE */  
      }
      try {
        var res = "";
        switch (param_name) {
          case 0x1181 /*CL_PROGRAM_BUILD_STATUS*/:
          res = CL.programs[prog].getProgramBuildInfo (CL.devices[idx], WebCL.CL_PROGRAM_BUILD_STATUS);
          break;
        case 0x1182 /*CL_PROGRAM_BUILD_OPTIONS*/:
          res = CL.programs[prog].getProgramBuildInfo (CL.devices[idx], WebCL.CL_PROGRAM_BUILD_OPTIONS);
          break;
        case 0x1183 /*CL_PROGRAM_BUILD_LOG*/:
          res = CL.programs[prog].getProgramBuildInfo (CL.devices[idx], WebCL.CL_PROGRAM_BUILD_LOG);
          break;
        };
        HEAP32[((param_value_size_ret)>>2)]=res.length;
        writeStringToMemory(res,param_value);
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clGetProgramBuildInfo",e);
      }
    }
  function _clCreateKernel(program, kernels_name, errcode_ret) {
      var prog = program - 1;
      if (prog >= CL.programs.length || prog < 0 ) {
        console.error("clCreateKernel: Invalid program : "+prog);
        HEAP32[((errcode_ret)>>2)]=-44;
        return 0; // Null pointer   
      }           
      try {
        var name = Pointer_stringify(kernels_name);
        CL.kernels.push(CL.programs[prog].createKernel(name));
        // Add the name of the kernel for search the kernel sig after...
        CL.kernels_name.push(name);
        console.info("Kernel '"+name+"', has "+CL.kernels_sig[name].length+ " parameters !!!!");
        // Return the pos of the queue +1
        return CL.kernels.length;
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateKernel",e);
        return 0; // Null pointer    
      }
    }
  function _clCreateCommandQueue(context, devices, properties, errcode_ret) {
      var ctx = context - 1;
      if (ctx >= CL.ctx.length || ctx < 0 ) {
          console.error("clCreateCommandQueue: Invalid context : "+ctx);
          HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
          return 0; // Null pointer    
      }
      try {
        var idx = devices;//HEAP32[((devices)>>2)];
        if (idx == 0) {
          // Create a command-queue on the first device available if idx == 0
          console.error("\\todo clCreateCommandQueue() : idx = 0 : Need work on that ")
          var devices = CL.getAllDevices(0);
          CL.devices.push(devices[0]);
        }
        idx = idx - 1;
        if (idx >= CL.devices.length || idx < 0 ) {
          console.error("clCreateCommandQueue: Invalid device : "+idx);
          HEAP32[((errcode_ret)>>2)]=-33 /* CL_INVALID_DEVICE */;  
          return 0; // Null pointer    
        }
        // \todo set the properties 
        CL.cmdQueue.push(CL.ctx[ctx].createCommandQueue(CL.devices[idx], 0));
        // Return the pos of the queue +1
        return CL.cmdQueue.length;
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateCommandQueue",e);
        return 0; // Null pointer    
      }
    }
  function _clCreateBuffer(context, flags_i64_1, flags_i64_2, size, host_ptr, errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      var ctx = context - 1;
      if (ctx >= CL.ctx.length || ctx < 0 ) {
        console.error("clCreateBuffer: Invalid context : "+ctx);
        HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
        return 0; // Null pointer    
      }
      try {
        switch (flags_i64_1) {
          case (1 << 0) /* CL_MEM_READ_WRITE */:
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_WRITE : WebCL.MEM_READ_WRITE;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 1) /* CL_MEM_WRITE_ONLY */:
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_WRITE_ONLY : WebCL.MEM_WRITE_ONLY;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 2) /* CL_MEM_READ_ONLY */:
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_ONLY : WebCL.MEM_READ_ONLY;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 3) /* CL_MEM_USE_HOST_PTR */:
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_USE_HOST_PTR : WebCL.MEM_USE_HOST_PTR;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */:
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_ALLOC_HOST_PTR : WebCL.MEM_ALLOC_HOST_PTR;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 5) /* CL_MEM_COPY_HOST_PTR */:
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_COPY_HOST_PTR : WebCL.MEM_COPY_HOST_PTR;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (((1 << 2)|(1 << 5))) /* CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR */:
            if (host_ptr == 0) {
              console.error("clCreateBuffer: CL_MEM_COPY_HOST_PTR can't be use with null host_ptr parameter");
              HEAP32[((errcode_ret)>>2)]=-37 /* CL_INVALID_HOST_PTR */;
              return 0;     
            }
            var macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_ONLY : WebCL.MEM_READ_ONLY;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            // CL_MEM_COPY_HOST_PTR Doesn't work we pass element via enqueue buffer
            if (CL.cmdQueue.length == 0) {
              console.error("clCreateBuffer: Invalid command queue : "+CL.cmdQueue.length);
              HEAP32[((errcode_ret)>>2)]=-36 /* CL_INVALID_COMMAND_QUEUE */;
              return 0;
            }
            if (CL.buffers.length == 0) {
              console.error("clCreateBuffer: Invalid buffers : "+CL.buffers.length);
              HEAP32[((errcode_ret)>>2)]=-38 /* CL_INVALID_MEM_OBJECT */;
              return 0;
            }
            // \warning experimental stuff
            var name = CL.kernels_name[0];
            var sig = CL.kernels_sig[name];
            var isFloat = sig[CL.buffers.length-1] & CL.data_type.FLOAT;
            var isUint = sig[CL.buffers.length-1] & CL.data_type.UINT;
            var isInt = sig[CL.buffers.length-1] & CL.data_type.INT;
            var vector;    
            if (isFloat) {
              vector = new Float32Array(size / 4);
            } else if (isUint) {
              vector = new Uint32Array(size / 4);
            } else if (isInt) {
              vector = new Int32Array(size / 4);
            } else {
              console.error("clCreateBuffer: Unknow ouptut type : "+sig[CL.buffers.length-1]);
            }
            for (var i = 0; i < (size / 4); i++) {
              if (isFloat) {
                vector[i] = HEAPF32[(((host_ptr)+(i*4))>>2)];
              } else {
                vector[i] = HEAP32[(((host_ptr)+(i*4))>>2)];
              }
            }
            CL.cmdQueue[CL.cmdQueue.length-1].enqueueWriteBuffer(CL.buffers[CL.buffers.length-1], 1, 0, size, vector , []);    
            break;
          default:
            console.error("clCreateBuffer: flag not yet implemented "+flags_i64_1);
            HEAP32[((errcode_ret)>>2)]=-30 /* CL_INVALID_VALUE */;
            return 0;
        };
        HEAP32[((errcode_ret)>>2)]=0 /* CL_SUCCESS */;
        return CL.buffers.length;
      } catch(e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateBuffer",e);
        return 0;
      }
    }
  function _clSetKernelArg(kernel, arg_index, arg_size, arg_value) {
      var ker = kernel - 1;
      if (ker >= CL.kernels.length || ker < 0 ) {
        console.error("clSetKernelArg: Invalid kernel : "+ker);
        return -48; /* CL_INVALID_KERNEL */
      }
      try {  
        var name = CL.kernels_name[ker];
        console.info("clSetKernelArg : "+arg_index);
        console.info("clSetKernelArg Kernel Name : "+name);
        // \todo problem what is arg_value is buffer or just value ??? hard to say ....
        // \todo i suppose the arg_index correspond with the order of the buffer creation if is 
        // not inside the buffers array size we take the value
        if (CL.kernels_sig[name].length <= 0 && arg_index > CL.kernels_sig[name].length) {
          console.error("clSetKernelArg: Invalid signature : "+CL.kernels_sig[name].length);
          return -1; /* CL_FAILED */
        }
        var isFloat = CL.kernels_sig[name][arg_index] & CL.data_type.FLOAT;
        var isLocal = CL.kernels_sig[name][arg_index] & CL.address_space.LOCAL;
        console.info("Parameter "+arg_index+" isFloat : "+isFloat+" - isLocal : "+isLocal);
        var value;
        if (isLocal) {
          ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArgLocal(arg_index,arg_size) : CL.kernels[ker].setArg(arg_index,arg_size,WebCLKernelArgumentTypes.LOCAL_MEMORY_SIZE);
        } else if (arg_size > 4) {
          value = new Array(arg_size/4);
          for (var i = 0; i < arg_size/4; i++) {
            if (isFloat) {
              value[i] = HEAPF32[(((arg_value)+(i*4))>>2)];   
            } else {
              value[i] = HEAP32[(((arg_value)+(i*4))>>2)];
            }
          }
          var type;
          if ( CL.webcl_webkit == 1 ) {
            if (arg_size/4 == 2)
              type = WebCLKernelArgumentTypes.VEC2;
            if (arg_size/4 == 3)
              type = WebCLKernelArgumentTypes.VEC3;
            if (arg_size/4 == 4)
              type = WebCLKernelArgumentTypes.VEC4;
          }
          if (isFloat) {    
            //CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.FLOAT | type);
          } else {          
            //CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.INT | type);
          } 
        } else {     
          if (isFloat) {
            value = HEAPF32[((arg_value)>>2)];
          } else {
            value = HEAP32[((arg_value)>>2)];
          }
          if (arg_index >= 0 && arg_index < CL.buffers.length) {
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,CL.buffers[arg_index]) : CL.kernels[ker].setArg(arg_index,CL.buffers[arg_index]);
          } else {
            if (isFloat) { 
              ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.FLOAT);
            } else {
              ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.INT);
            }            
          }        
        }
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clSetKernelArg",e);
      }
    }
  function _clEnqueueNDRangeKernel(command_queue, kernel, work_dim, global_work_offset, global_work_size, local_work_size, num_events_in_wait_list, event_wait_list, event) {
      var queue = command_queue - 1;
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clEnqueueNDRangeKernel: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var ker = kernel - 1;
      if (ker >= CL.kernels.length || ker < 0 ) {
        console.error("clEnqueueNDRangeKernel: Invalid kernel : "+ker);
        return -48; /* CL_INVALID_KERNEL */
      }
      var value_local_work_size;
      var value_global_work_size;
      if (CL.webcl_mozilla == 1) {
        value_local_work_size = [];
        value_global_work_size = [];
      } else {
        value_local_work_size = new Int32Array(work_dim);
        value_global_work_size = new Int32Array(work_dim);
      }
      for (var i = 0 ; i < work_dim; i++) {
        value_local_work_size[i] = HEAP32[(((local_work_size)+(i*4))>>2)];
        value_global_work_size[i] = HEAP32[(((global_work_size)+(i*4))>>2)];
      }
  //#if 0
      var global = "";
      var local = "";
      for (var i = 0 ; i < work_dim; i++){
        global += value_global_work_size[i];
        local += value_local_work_size[i];
        if (i != work_dim -1) {
          global += " , ";
          local += " , ";
        }
      }
      console.info("Global [ "+ global +" ]")
      console.info("Local [ "+ local +" ]")
  //#endif
      // empty “localWS” array because give some trouble on CPU mode with mac
      // value_local_work_size = [];  
      try {
        // \todo how add some event inside the array
        if (CL.webcl_mozilla == 1) {
          CL.cmdQueue[queue].enqueueNDRangeKernel(CL.kernels[ker],work_dim,/*global_work_offset*/[],value_global_work_size,value_local_work_size,[]);
        } else {
          CL.cmdQueue[queue].enqueueNDRangeKernel(CL.kernels[ker], /*global_work_offset*/ null, value_global_work_size, value_local_work_size);
        }
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueNDRangeKernel",e);
      }
    }
  function _clEnqueueReadBuffer(command_queue, buffer, blocking_read, offset, size, results, num_events_in_wait_list, event_wait_list, event) {
      var queue = command_queue - 1;
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clEnqueueReadBuffer: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var buff = buffer - 1;
      if (buff >= CL.buffers.length || buff < 0 ) {
        console.error("clEnqueueReadBuffer: Invalid buffer : "+buff);
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      try {
        // \warning experimental stuff
        var name = CL.kernels_name[0];
        var sig = CL.kernels_sig[name];
        var isFloat = sig[buff] & CL.data_type.FLOAT;
        var isUint = sig[buff] & CL.data_type.UINT;
        var isInt = sig[buff] & CL.data_type.INT;
        if (sig.length == 0 || buff > sig.length) {
          console.error("clEnqueueReadBuffer: Invalid signature : "+buff);
          return -1; /* CL_FAILED */     
        }
        var vector;    
        if (isFloat) {
          vector = new Float32Array(size / 4);
        } else if (isUint) {
          vector = new Uint32Array(size / 4);
        } else if (isInt) {
          vector = new Int32Array(size / 4);
        } else {
          console.error("clEnqueueReadBuffer: Unknow ouptut type : "+sig[buff]);
          return -1; /* CL_FAILED */     
        }
        CL.cmdQueue[queue].enqueueReadBuffer (CL.buffers[buff], blocking_read == 1 ? true : false, offset, size, vector, []);
        for (var i = 0; i < (size / 4); i++) {
          if (isFloat) {
            HEAPF32[(((results)+(i*4))>>2)]=vector[i];  
          } else {
            HEAP32[(((results)+(i*4))>>2)]=vector[i];  
          }         
        }
        console.log(vector);
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueReadBuffer",e);
      }
    }
  function __ZSt9terminatev() {
      _exit(-1234);
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
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
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
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
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
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
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) return 0;
      var bytesRead = _read(stream, ptr, bytesToRead);
      var streamObj = FS.streams[stream];
      if (bytesRead == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        if (bytesRead < bytesToRead) streamObj.eof = true;
        return Math.floor(bytesRead / size);
      }
    }
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }var _fseeko=_fseek;
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }var _ftello=_ftell;
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isCreate || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id;
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        });
      } else {
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        });
      }
      return id;
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
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  Module["_strlen"] = _strlen;
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var _llvm_memset_p0i8_i64=_memset;
  function _pthread_mutex_lock() {}
  function _pthread_mutex_unlock() {}
  function _pthread_cond_broadcast() {
      return 0;
    }
  function _pthread_cond_wait() {
      return 0;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      if (FS.streams[stream]) {
        c = unSign(c & 0xFF);
        FS.streams[stream].ungotten.push(c);
        return c;
      } else {
        return -1;
      }
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _read(stream, _fgetc.ret, 1);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  Module["_strcpy"] = _strcpy;
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
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
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
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
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
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
    }function _snprintf(s, n, format, varargs) {
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
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }var _isxdigit_l=_isxdigit;
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
        __scanString.whiteSpace['\v'] = 1;
        __scanString.whiteSpace['\f'] = 1;
        __scanString.whiteSpace['\r'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
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
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
          formatIndex += 2;
          continue;
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
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
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
                (tempI64 = [parseInt(text, 10)>>>0,((Math.min((+(Math.floor((parseInt(text, 10))/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
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
        } else if (format[formatIndex] in __scanString.whiteSpace) {
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
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function __Z7catopenPKci() { throw 'catopen not implemented' }
  function __Z7catgetsP8_nl_catdiiPKc() { throw 'catgets not implemented' }
  function __Z8catcloseP8_nl_catd() { throw 'catclose not implemented' }
  function _newlocale(mask, locale, base) {
      return 0;
    }
  function _freelocale(locale) {}
  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i]
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function _strftime(s, maxsize, format, timeptr) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      // TODO: Implement.
      return 0;
    }var _strftime_l=_strftime;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
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
      start = str;
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;
  function _uselocale(locale) {
      return 0;
    }
  function ___locale_mb_cur_max() { throw '__locale_mb_cur_max not implemented' }
  var _llvm_va_start=undefined;
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsprintf(s, format, va_arg) {
      return _sprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
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
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
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
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
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
function invoke_viiiiif(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiif"](index,a1,a2,a3,a4,a5,a6);
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
function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
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
function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiif(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiif"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env.___fsmu8|0;var t=env._stdout|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.min;var am=env.invoke_viiiii;var an=env.invoke_viiiiiii;var ao=env.invoke_vi;var ap=env.invoke_vii;var aq=env.invoke_iii;var ar=env.invoke_iiiiii;var as=env.invoke_ii;var at=env.invoke_iiii;var au=env.invoke_viiiiif;var av=env.invoke_viii;var aw=env.invoke_viiiiiiii;var ax=env.invoke_v;var ay=env.invoke_iiiiiiiii;var az=env.invoke_viiiiiiiii;var aA=env.invoke_viiiiiif;var aB=env.invoke_viiiiii;var aC=env.invoke_iiiii;var aD=env.invoke_viiii;var aE=env._llvm_lifetime_end;var aF=env._lseek;var aG=env.__scanString;var aH=env._fclose;var aI=env._pthread_mutex_lock;var aJ=env.___cxa_end_catch;var aK=env.__isFloat;var aL=env._strtoull;var aM=env._fflush;var aN=env._clGetPlatformIDs;var aO=env._fwrite;var aP=env._send;var aQ=env._isspace;var aR=env._read;var aS=env._fsync;var aT=env._newlocale;var aU=env.___gxx_personality_v0;var aV=env._pthread_cond_wait;var aW=env.___cxa_rethrow;var aX=env.___resumeException;var aY=env._llvm_va_end;var aZ=env._vsscanf;var a_=env._snprintf;var a$=env._clGetDeviceIDs;var a0=env._fgetc;var a1=env._atexit;var a2=env._clCreateContext;var a3=env.___cxa_free_exception;var a4=env._close;var a5=env.__Z8catcloseP8_nl_catd;var a6=env._clCreateBuffer;var a7=env.___setErrNo;var a8=env._isxdigit;var a9=env._ftell;var ba=env._exit;var bb=env._sprintf;var bc=env.___ctype_b_loc;var bd=env._freelocale;var be=env.__Z7catopenPKci;var bf=env._asprintf;var bg=env.___cxa_is_number_type;var bh=env.___cxa_does_inherit;var bi=env.___locale_mb_cur_max;var bj=env.___cxa_begin_catch;var bk=env._recv;var bl=env.__parseInt64;var bm=env.__ZSt18uncaught_exceptionv;var bn=env.___cxa_call_unexpected;var bo=env.__exit;var bp=env._strftime;var bq=env.___cxa_throw;var br=env._llvm_eh_exception;var bs=env._pread;var bt=env._fopen;var bu=env._open;var bv=env._clEnqueueNDRangeKernel;var bw=env.___cxa_find_matching_catch;var bx=env._clSetKernelArg;var by=env.__formatString;var bz=env._pthread_cond_broadcast;var bA=env._clEnqueueReadBuffer;var bB=env.__ZSt9terminatev;var bC=env._pthread_mutex_unlock;var bD=env._sbrk;var bE=env.___errno_location;var bF=env._strerror;var bG=env._llvm_lifetime_start;var bH=env._clGetProgramBuildInfo;var bI=env._ungetc;var bJ=env._vsprintf;var bK=env._uselocale;var bL=env._vsnprintf;var bM=env._sscanf;var bN=env._sysconf;var bO=env._fread;var bP=env._abort;var bQ=env._isdigit;var bR=env._strtoll;var bS=env.__reallyNegative;var bT=env._clCreateCommandQueue;var bU=env._clBuildProgram;var bV=env.__Z7catgetsP8_nl_catdiiPKc;var bW=env._fseek;var bX=env._write;var bY=env.___cxa_allocate_exception;var bZ=env.___cxa_pure_virtual;var b_=env._clCreateKernel;var b$=env._vasprintf;var b0=env._clCreateProgramWithSource;var b1=env.___ctype_toupper_loc;var b2=env.___ctype_tolower_loc;var b3=env._pwrite;var b4=env._strerror_r;var b5=env._time;
// EMSCRIPTEN_START_FUNCS
function co(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cp(){return i|0}function cq(a){a=a|0;i=a}function cr(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function cs(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function ct(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function cu(a){a=a|0;K=a}function cv(a){a=a|0;L=a}function cw(a){a=a|0;M=a}function cx(a){a=a|0;N=a}function cy(a){a=a|0;O=a}function cz(a){a=a|0;P=a}function cA(a){a=a|0;Q=a}function cB(a){a=a|0;R=a}function cC(a){a=a|0;S=a}function cD(a){a=a|0;T=a}function cE(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;i=i+8|0;d=e|0;e=cF(cF(14744,2752)|0,a)|0;ed(d,e+(c[(c[e>>2]|0)-12>>2]|0)|0);a=iZ(d,14648)|0;b=ca[c[(c[a>>2]|0)+28>>2]&63](a,10)|0;iQ(d);fp(e,b)|0;e$(e)|0;ba(1)}function cF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;eZ(g,b);do{if((a[g|0]&1)!=0){k=k3(d|0)|0;l=b;m=c[(c[l>>2]|0)-12>>2]|0;n=b;c[h>>2]=c[n+(m+24)>>2];o=d+k|0;k=(c[n+(m+4)>>2]&176|0)==32?o:d;p=n+m|0;q=n+(m+76)|0;m=c[q>>2]|0;if((m|0)==-1){ed(f,p);r=iZ(f,14648)|0;s=ca[c[(c[r>>2]|0)+28>>2]&63](r,32)|0;iQ(f);c[q>>2]=s<<24>>24;t=s}else{t=m&255}da(j,h,d,k,o,p,t);if((c[j>>2]|0)!=0){break}p=c[(c[l>>2]|0)-12>>2]|0;es(n+p|0,c[n+(p+16)>>2]|5)}}while(0);e_(g);i=e;return b|0}function cG(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;d=i;i=i+16728|0;b=d|0;e=d+8|0;f=d+16|0;g=d+24|0;h=d+32|0;j=d+40|0;k=d+48|0;l=d+56|0;m=d+64|0;n=d+72|0;o=d+80|0;p=d+88|0;q=d+96|0;r=d+104|0;s=d+120|0;t=d+312|0;u=d+328|0;v=d+336|0;w=d+344|0;x=aN(0,0,m|0)|0;c[l>>2]=x;if((x|0)==0){y=((c[m>>2]|0)==0)<<31>>31}else{y=x}cH(y,2728);y=c[m>>2]|0;x=i;i=i+(y<<2)|0;i=i+7>>3<<3;z=x;x=aN(y|0,z|0,0)|0;c[l>>2]=x;if((x|0)==0){A=((c[m>>2]|0)==0)<<31>>31}else{A=x}cH(A,2728);L25:do{if((c[m>>2]|0)!=0){A=0;while(1){B=z+(A<<2)|0;x=a$(c[B>>2]|0,2,0,0,0,n|0)|0;c[l>>2]=x;if((x|0)==(-1|0)|(x|0)==0){C=c[n>>2]|0;if((C|0)!=0){break}}else{cH(x,1840)}A=A+1|0;if(A>>>0>=(c[m>>2]|0)>>>0){break L25}}A=i;i=i+(C<<2)|0;i=i+7>>3<<3;x=A;A=a$(c[B>>2]|0,2,0,C|0,x|0,0)|0;c[l>>2]=A;cH(A,1840);A=r|0;c[A>>2]=4228;c[r+4>>2]=c[B>>2];c[r+8>>2]=0;y=a2(A|0,c[n>>2]|0,x|0,2,0,l|0)|0;cH(c[l>>2]|0,1312);A=s;D=s+108|0;E=s|0;F=s;G=s+8|0;H=s;c[E>>2]=10820;I=s+108|0;c[I>>2]=10840;c[s+4>>2]=0;ee(s+108|0,G);c[s+180>>2]=0;c[s+184>>2]=-1;c[E>>2]=5180;c[D>>2]=5200;cY(G);J=s+72|0;do{if((c[J>>2]|0)==0){K=bt(1296,1776)|0;c[J>>2]=K;if((K|0)==0){L=50;break}c[s+96>>2]=8;M=K}else{L=50}}while(0);if((L|0)==50){K=c[(c[H>>2]|0)-12>>2]|0;es(A+K|0,c[A+(K+16)>>2]|4);M=c[J>>2]|0}cH(((M|0)==0)<<31>>31,1128);c[j>>2]=c[A+((c[(c[H>>2]|0)-12>>2]|0)+24)>>2];c[k>>2]=0;cO(t,j,k);K=a[t]|0;if((K&1)==0){N=t+1|0}else{N=c[t+8>>2]|0}c[u>>2]=N;O=K&255;if((O&1|0)==0){P=O>>>1}else{P=c[t+4>>2]|0}c[v>>2]=P;O=b0(y|0,1,u|0,v|0,l|0)|0;cH(c[l>>2]|0,824);K=bU(O|0,c[n>>2]|0,x|0,0,0,0)|0;c[l>>2]=K;if((K|0)!=0){K=c[x>>2]|0;Q=w|0;bH(O|0,K|0,4483,16384,Q|0,0)|0;K=cF(14920,624)|0;ed(g,K+(c[(c[K>>2]|0)-12>>2]|0)|0);R=iZ(g,14648)|0;S=ca[c[(c[R>>2]|0)+28>>2]&63](R,10)|0;iQ(g);fp(K,S)|0;e$(K)|0;cF(14920,Q)|0;cH(c[l>>2]|0,520)}Q=b_(O|0,2712,l|0)|0;cH(c[l>>2]|0,2520);O=bT(y|0,c[x>>2]|0,0,0,l|0)|0;cH(c[l>>2]|0,2232);c[o>>2]=a6(y|0,36,0,256,120,l|0)|0;cH(c[l>>2]|0,2104);c[q>>2]=a6(y|0,36,0,36,80,l|0)|0;cH(c[l>>2]|0,2016);c[p>>2]=a6(y|0,2,0,144,0,l|0)|0;cH(c[l>>2]|0,1968);c[l>>2]=bx(Q|0,0,4,o|0)|0;K=bx(Q|0,1,4,q|0)|0;c[l>>2]=c[l>>2]|K;K=bx(Q|0,2,4,p|0)|0;c[l>>2]=c[l>>2]|K;K=bx(Q|0,3,4,10912)|0;c[l>>2]=c[l>>2]|K;K=bx(Q|0,4,4,10904)|0;S=c[l>>2]|K;c[l>>2]=S;cH(S,1944);S=bv(O|0,Q|0,1,0,3208,3216,0,0,0)|0;c[l>>2]=S;cH(S,1912);S=bA(O|0,c[p>>2]|0,1,0,144,11112,0,0,0)|0;c[l>>2]=S;cH(S,1864);S=0;do{cF(fo(14744,c[11112+(S<<2)>>2]|0)|0,1856)|0;cF(fo(14744,c[11136+(S<<2)>>2]|0)|0,1856)|0;cF(fo(14744,c[11160+(S<<2)>>2]|0)|0,1856)|0;cF(fo(14744,c[11184+(S<<2)>>2]|0)|0,1856)|0;cF(fo(14744,c[11208+(S<<2)>>2]|0)|0,1856)|0;cF(fo(14744,c[11232+(S<<2)>>2]|0)|0,1856)|0;ed(f,(c[(c[3686]|0)-12>>2]|0)+14744|0);O=iZ(f,14648)|0;Q=ca[c[(c[O>>2]|0)+28>>2]&63](O,10)|0;iQ(f);fp(14744,Q)|0;e$(14744)|0;S=S+1|0;}while(S>>>0<6);ed(e,(c[(c[3686]|0)-12>>2]|0)+14744|0);S=iZ(e,14648)|0;y=ca[c[(c[S>>2]|0)+28>>2]&63](S,10)|0;iQ(e);fp(14744,y)|0;e$(14744)|0;y=cF(14744,1808)|0;ed(b,y+(c[(c[y>>2]|0)-12>>2]|0)|0);S=iZ(b,14648)|0;x=ca[c[(c[S>>2]|0)+28>>2]&63](S,10)|0;iQ(b);fp(y,x)|0;e$(y)|0;dQ(t);c[E>>2]=5180;c[I>>2]=5200;cS(G);eC(F,6108);ec(D);i=d;return 0}}while(0);d=cF(14744,1680)|0;ed(h,d+(c[(c[d>>2]|0)-12>>2]|0)|0);t=iZ(h,14648)|0;b=ca[c[(c[t>>2]|0)+28>>2]&63](t,10)|0;iQ(h);fp(d,b)|0;e$(d)|0;ba(-1|0);return 0}function cH(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+8|0;e=d|0;if((a|0)==0){i=d;return}d=cF(fn(cF(cF(cF(14920,1584)|0,b)|0,1536)|0,a)|0,1504)|0;ed(e,d+(c[(c[d>>2]|0)-12>>2]|0)|0);a=iZ(e,14648)|0;b=ca[c[(c[a>>2]|0)+28>>2]&63](a,10)|0;iQ(e);fp(d,b)|0;e$(d)|0;ba(1)}function cI(a){a=a|0;c[a>>2]=5180;c[a+108>>2]=5200;cS(a+8|0);eC(a,6108);ec(a+108|0);return}function cJ(a){a=a|0;cS(a);return}function cK(a){a=a|0;cS(a);kW(a);return}function cL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;cc[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=iZ(d,14344)|0;d=e;c[b+68>>2]=d;f=b+98|0;g=a[f]&1;h=cc[c[(c[e>>2]|0)+28>>2]&255](d)|0;a[f]=h&1;if((g&255|0)==(h&1|0)){return}g=b+96|0;k2(b+8|0,0,24);f=(a[g]&1)!=0;if(h){h=b+32|0;do{if(f){d=c[h>>2]|0;if((d|0)==0){break}kX(d)}}while(0);d=b+97|0;a[g]=a[d]&1;e=b+60|0;c[b+52>>2]=c[e>>2];i=b+56|0;c[h>>2]=c[i>>2];c[e>>2]=0;c[i>>2]=0;a[d]=0;return}do{if(!f){d=b+32|0;i=c[d>>2]|0;if((i|0)==(b+44|0)){break}e=c[b+52>>2]|0;c[b+60>>2]=e;c[b+56>>2]=i;a[b+97|0]=0;c[d>>2]=kT(e)|0;a[g]=1;return}}while(0);g=c[b+52>>2]|0;c[b+60>>2]=g;c[b+56>>2]=kT(g)|0;a[b+97|0]=1;return}function cM(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b|0;g=b+96|0;k2(b+8|0,0,24);do{if((a[g]&1)!=0){h=c[b+32>>2]|0;if((h|0)==0){break}kX(h)}}while(0);h=b+97|0;do{if((a[h]&1)!=0){i=c[b+56>>2]|0;if((i|0)==0){break}kX(i)}}while(0);i=b+52|0;c[i>>2]=e;do{if(e>>>0>8){j=a[b+98|0]|0;if((j&1)==0|(d|0)==0){c[b+32>>2]=kT(e)|0;a[g]=1;k=j;break}else{c[b+32>>2]=d;a[g]=0;k=j;break}}else{c[b+32>>2]=b+44;c[i>>2]=8;a[g]=0;k=a[b+98|0]|0}}while(0);if((k&1)!=0){c[b+60>>2]=0;c[b+56>>2]=0;a[h]=0;return f|0}k=(e|0)<8?8:e;c[b+60>>2]=k;if((d|0)!=0&k>>>0>7){c[b+56>>2]=d;a[h]=0;return f|0}else{c[b+56>>2]=kT(k)|0;a[h]=1;return f|0}return 0}function cN(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;e=i;f=d;d=i;i=i+16|0;c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];c[d+8>>2]=c[f+8>>2];c[d+12>>2]=c[f+12>>2];f=b+64|0;do{if((c[f>>2]|0)!=0){if((cc[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if((bW(c[f>>2]|0,c[d+8>>2]|0,0)|0)==0){g=d;h=c[g+4>>2]|0;j=b+72|0;c[j>>2]=c[g>>2];c[j+4>>2]=h;h=a;j=d;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];i=e;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;i=e;return}}}while(0);d=a;c[d>>2]=0;c[d+4>>2]=0;d=a+8|0;c[d>>2]=-1;c[d+4>>2]=-1;i=e;return}function cO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[g>>2];k2(b|0,0,12);g=d|0;d=e|0;e=c[g>>2]|0;L194:while(1){do{if((e|0)==0){h=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){h=e;break}if((cc[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){h=e;break}c[g>>2]=0;h=0}}while(0);j=(h|0)==0;k=c[d>>2]|0;do{if((k|0)==0){l=246}else{if((c[k+12>>2]|0)!=(c[k+16>>2]|0)){if(j){break}else{l=264;break L194}}if((cc[c[(c[k>>2]|0)+36>>2]&255](k)|0)==-1){c[d>>2]=0;l=246;break}else{if(j^(k|0)==0){break}else{l=266;break L194}}}}while(0);if((l|0)==246){l=0;if(j){l=265;break}}k=h+12|0;m=c[k>>2]|0;n=h+16|0;if((m|0)==(c[n>>2]|0)){o=(cc[c[(c[h>>2]|0)+36>>2]&255](h)|0)&255}else{o=a[m]|0}dT(b,o);m=c[k>>2]|0;if((m|0)==(c[n>>2]|0)){n=c[(c[h>>2]|0)+40>>2]|0;cc[n&255](h)|0;e=h;continue}else{c[k>>2]=m+1;e=h;continue}}if((l|0)==264){i=f;return}else if((l|0)==265){i=f;return}else if((l|0)==266){i=f;return}}function cP(a){a=a|0;c[a>>2]=5180;c[a+108>>2]=5200;cS(a+8|0);eC(a,6108);ec(a+108|0);kW(a);return}function cQ(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=5180;e=b+(d+108)|0;c[e>>2]=5200;cS(b+(d+8)|0);eC(a,6108);ec(e);return}function cR(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=5180;e=b+(d+108)|0;c[e>>2]=5200;cS(b+(d+8)|0);eC(a,6108);ec(e);kW(a);return}function cS(b){b=b|0;var d=0,e=0;c[b>>2]=5416;d=b+64|0;e=c[d>>2]|0;do{if((e|0)!=0){cV(b)|0;if((aH(e|0)|0)!=0){break}c[d>>2]=0}}while(0);do{if((a[b+96|0]&1)!=0){d=c[b+32>>2]|0;if((d|0)==0){break}kX(d)}}while(0);do{if((a[b+97|0]&1)!=0){d=c[b+56>>2]|0;if((d|0)==0){break}kX(d)}}while(0);ei(b|0);return}function cT(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;g=c[b+68>>2]|0;if((g|0)==0){h=bY(4)|0;kq(h);bq(h|0,9232,138)}h=cc[c[(c[g>>2]|0)+24>>2]&255](g)|0;g=b+64|0;do{if((c[g>>2]|0)!=0){i=(h|0)>0;if(!(i|(d|0)==0&(e|0)==0)){break}if((cc[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if(f>>>0>=3){j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}j=c[g>>2]|0;if(i){i=lf(h,(h|0)<0?-1:0,d,e)|0;k=i}else{k=0}if((bW(j|0,k|0,f|0)|0)==0){j=a9(c[g>>2]|0)|0;i=b+72|0;l=c[i+4>>2]|0;m=a;c[m>>2]=c[i>>2];c[m+4>>2]=l;l=a+8|0;c[l>>2]=j;c[l+4>>2]=(j|0)<0?-1:0;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}}}while(0);b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;return}function cU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((c[b+64>>2]|0)==0){e=-1;return e|0}f=b+12|0;g=c[f>>2]|0;if((c[b+8>>2]|0)>>>0>=g>>>0){e=-1;return e|0}if((d|0)==-1){c[f>>2]=g-1;e=0;return e|0}h=g-1|0;do{if((c[b+88>>2]&16|0)==0){if((d<<24>>24|0)==(a[h]|0)){break}else{e=-1}return e|0}}while(0);c[f>>2]=h;a[h]=d&255;e=d;return e|0}function cV(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=f;h=b+64|0;if((c[h>>2]|0)==0){j=0;i=d;return j|0}k=b+68|0;l=c[k>>2]|0;if((l|0)==0){m=bY(4)|0;kq(m);bq(m|0,9232,138);return 0}m=b+92|0;n=c[m>>2]|0;do{if((n&16|0)==0){if((n&8|0)==0){break}o=b+80|0;p=c[o+4>>2]|0;c[f>>2]=c[o>>2];c[f+4>>2]=p;do{if((a[b+98|0]&1)==0){p=cc[c[(c[l>>2]|0)+24>>2]&255](l)|0;o=b+36|0;q=c[o>>2]|0;r=(c[b+40>>2]|0)-q|0;if((p|0)>0){s=(ag((c[b+16>>2]|0)-(c[b+12>>2]|0)|0,p)|0)+r|0;t=0;break}p=c[b+12>>2]|0;if((p|0)==(c[b+16>>2]|0)){s=r;t=0;break}u=c[k>>2]|0;v=b+32|0;w=cb[c[(c[u>>2]|0)+32>>2]&31](u,g,c[v>>2]|0,q,p-(c[b+8>>2]|0)|0)|0;s=r-w+(c[o>>2]|0)-(c[v>>2]|0)|0;t=1}else{s=(c[b+16>>2]|0)-(c[b+12>>2]|0)|0;t=0}}while(0);if((bW(c[h>>2]|0,-s|0,1)|0)!=0){j=-1;i=d;return j|0}if(t){v=b+72|0;o=c[f+4>>2]|0;c[v>>2]=c[f>>2];c[v+4>>2]=o}o=c[b+32>>2]|0;c[b+40>>2]=o;c[b+36>>2]=o;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[m>>2]=0}else{do{if((c[b+24>>2]|0)!=(c[b+20>>2]|0)){if((ca[c[(c[b>>2]|0)+52>>2]&63](b,-1)|0)==-1){j=-1}else{break}i=d;return j|0}}while(0);o=b+72|0;v=b+32|0;w=b+52|0;while(1){r=c[k>>2]|0;p=c[v>>2]|0;q=cb[c[(c[r>>2]|0)+20>>2]&31](r,o,p,p+(c[w>>2]|0)|0,e)|0;p=c[v>>2]|0;r=(c[e>>2]|0)-p|0;if((aO(p|0,1,r|0,c[h>>2]|0)|0)!=(r|0)){j=-1;x=368;break}if((q|0)==2){j=-1;x=369;break}else if((q|0)!=1){x=353;break}}if((x|0)==353){if((aM(c[h>>2]|0)|0)==0){break}else{j=-1}i=d;return j|0}else if((x|0)==368){i=d;return j|0}else if((x|0)==369){i=d;return j|0}}}while(0);j=0;i=d;return j|0}function cW(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=b+64|0;if((c[h>>2]|0)==0){j=-1;i=e;return j|0}k=b+92|0;if((c[k>>2]&8|0)==0){c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;if((a[b+98|0]&1)==0){l=c[b+56>>2]|0;m=l+(c[b+60>>2]|0)|0;c[b+8>>2]=l;c[b+12>>2]=m;c[b+16>>2]=m;n=m}else{m=c[b+32>>2]|0;l=m+(c[b+52>>2]|0)|0;c[b+8>>2]=m;c[b+12>>2]=l;c[b+16>>2]=l;n=l}c[k>>2]=8;o=1;p=n;q=b+12|0}else{n=b+12|0;o=0;p=c[n>>2]|0;q=n}if((p|0)==0){n=f+1|0;c[b+8>>2]=f;c[q>>2]=n;c[b+16>>2]=n;r=n}else{r=p}p=c[b+16>>2]|0;if(o){s=0}else{o=(p-(c[b+8>>2]|0)|0)/2&-1;s=o>>>0>4?4:o}o=b+16|0;do{if((r|0)==(p|0)){n=b+8|0;k1(c[n>>2]|0,r+(-s|0)|0,s|0);if((a[b+98|0]&1)!=0){k=c[n>>2]|0;l=bO(k+s|0,1,(c[o>>2]|0)-s-k|0,c[h>>2]|0)|0;if((l|0)==0){t=-1;u=n;break}k=c[n>>2]|0;m=k+s|0;c[q>>2]=m;c[o>>2]=k+(l+s);t=d[m]|0;u=n;break}m=b+32|0;l=b+36|0;k=c[l>>2]|0;v=b+40|0;k1(c[m>>2]|0,k|0,(c[v>>2]|0)-k|0);k=c[m>>2]|0;w=k+((c[v>>2]|0)-(c[l>>2]|0))|0;c[l>>2]=w;if((k|0)==(b+44|0)){x=8}else{x=c[b+52>>2]|0}y=k+x|0;c[v>>2]=y;k=b+60|0;z=(c[k>>2]|0)-s|0;A=y-w|0;y=b+72|0;B=y;C=b+80|0;D=c[B+4>>2]|0;c[C>>2]=c[B>>2];c[C+4>>2]=D;D=bO(w|0,1,(A>>>0<z>>>0?A:z)|0,c[h>>2]|0)|0;if((D|0)==0){t=-1;u=n;break}z=c[b+68>>2]|0;if((z|0)==0){A=bY(4)|0;kq(A);bq(A|0,9232,138);return 0}A=(c[l>>2]|0)+D|0;c[v>>2]=A;D=c[n>>2]|0;if((ci[c[(c[z>>2]|0)+16>>2]&31](z,y,c[m>>2]|0,A,l,D+s|0,D+(c[k>>2]|0)|0,g)|0)==3){k=c[m>>2]|0;m=c[v>>2]|0;c[n>>2]=k;c[q>>2]=k;c[o>>2]=m;t=d[k]|0;u=n;break}k=c[g>>2]|0;m=c[n>>2]|0;v=m+s|0;if((k|0)==(v|0)){t=-1;u=n;break}c[n>>2]=m;c[q>>2]=v;c[o>>2]=k;t=d[v]|0;u=n}else{t=d[r]|0;u=b+8|0}}while(0);if((c[u>>2]|0)!=(f|0)){j=t;i=e;return j|0}c[u>>2]=0;c[q>>2]=0;c[o>>2]=0;j=t;i=e;return j|0}function cX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+24|0;f=e|0;g=e+8|0;h=e+16|0;j=b+64|0;if((c[j>>2]|0)==0){k=-1;i=e;return k|0}l=b+92|0;if((c[l>>2]&16|0)==0){c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;m=c[b+52>>2]|0;do{if(m>>>0>8){if((a[b+98|0]&1)==0){n=c[b+56>>2]|0;o=n+((c[b+60>>2]|0)-1)|0;c[b+24>>2]=n;c[b+20>>2]=n;c[b+28>>2]=o;p=n;q=o;break}else{o=c[b+32>>2]|0;n=o+(m-1)|0;c[b+24>>2]=o;c[b+20>>2]=o;c[b+28>>2]=n;p=o;q=n;break}}else{c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;p=0;q=0}}while(0);c[l>>2]=16;r=p;s=q;t=b+20|0;u=b+28|0}else{q=b+20|0;p=b+28|0;r=c[q>>2]|0;s=c[p>>2]|0;t=q;u=p}p=(d|0)==-1;q=b+24|0;l=c[q>>2]|0;if(p){v=r;w=l}else{if((l|0)==0){c[q>>2]=f;c[t>>2]=f;c[u>>2]=f+1;x=f}else{x=l}a[x]=d&255;x=(c[q>>2]|0)+1|0;c[q>>2]=x;v=c[t>>2]|0;w=x}x=b+24|0;if((w|0)!=(v|0)){L393:do{if((a[b+98|0]&1)==0){q=b+32|0;l=c[q>>2]|0;c[g>>2]=l;f=b+68|0;m=c[f>>2]|0;if((m|0)==0){y=bY(4)|0;z=y;kq(z);bq(y|0,9232,138);return 0}n=b+72|0;o=b+52|0;A=m;m=v;B=w;C=l;while(1){l=ci[c[(c[A>>2]|0)+12>>2]&31](A,n,m,B,h,C,C+(c[o>>2]|0)|0,g)|0;D=c[t>>2]|0;if((c[h>>2]|0)==(D|0)){k=-1;E=441;break}if((l|0)==3){E=426;break}if(l>>>0>=2){k=-1;E=437;break}F=c[q>>2]|0;G=(c[g>>2]|0)-F|0;if((aO(F|0,1,G|0,c[j>>2]|0)|0)!=(G|0)){k=-1;E=438;break}if((l|0)!=1){break L393}l=c[h>>2]|0;G=c[x>>2]|0;c[t>>2]=l;c[u>>2]=G;F=l+(G-l)|0;c[x>>2]=F;G=c[f>>2]|0;if((G|0)==0){E=436;break}A=G;m=l;B=F;C=c[q>>2]|0}if((E|0)==441){i=e;return k|0}else if((E|0)==426){q=(c[x>>2]|0)-D|0;if((aO(D|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}else if((E|0)==436){y=bY(4)|0;z=y;kq(z);bq(y|0,9232,138);return 0}else if((E|0)==437){i=e;return k|0}else if((E|0)==438){i=e;return k|0}}else{q=w-v|0;if((aO(v|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}}while(0);c[x>>2]=r;c[t>>2]=r;c[u>>2]=s}k=p?0:d;i=e;return k|0}function cY(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+16|0;e=d|0;f=d+8|0;ej(b|0);c[b>>2]=5416;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=0;g=b+68|0;h=b+4|0;k2(b+52|0,0,47);iP(e,h);j=iR(e,14344)|0;iQ(e);if(j){iP(f,h);c[g>>2]=iZ(f,14344)|0;iQ(f);f=c[g>>2]|0;a[b+98|0]=(cc[c[(c[f>>2]|0)+28>>2]&255](f)|0)&1}cd[c[(c[b>>2]|0)+12>>2]&63](b,0,4096)|0;i=d;return}function cZ(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;dr(14088,c[o>>2]|0,14144);c[3752]=5372;c[3754]=5392;c[3753]=0;h=c[1340]|0;ee(15008+h|0,14088);c[h+15080>>2]=0;c[h+15084>>2]=-1;h=c[t>>2]|0;ej(13992);c[3498]=5592;c[3506]=h;iP(g,13996);h=iZ(g,14344)|0;j=h;iQ(g);c[3507]=j;c[3508]=14152;a[14036]=(cc[c[(c[h>>2]|0)+28>>2]&255](j)|0)&1;c[3686]=5276;c[3687]=5296;j=c[1316]|0;ee(14744+j|0,13992);h=j+72|0;c[14744+h>>2]=0;g=j+76|0;c[14744+g>>2]=-1;k=c[r>>2]|0;ej(14040);c[3510]=5592;c[3518]=k;iP(f,14044);k=iZ(f,14344)|0;l=k;iQ(f);c[3519]=l;c[3520]=14160;a[14084]=(cc[c[(c[k>>2]|0)+28>>2]&255](l)|0)&1;c[3730]=5276;c[3731]=5296;ee(14920+j|0,14040);c[14920+h>>2]=0;c[14920+g>>2]=-1;l=c[(c[(c[3730]|0)-12>>2]|0)+14944>>2]|0;c[3708]=5276;c[3709]=5296;ee(14832+j|0,l);c[14832+h>>2]=0;c[14832+g>>2]=-1;c[(c[(c[3752]|0)-12>>2]|0)+15080>>2]=14744;g=(c[(c[3730]|0)-12>>2]|0)+14924|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[3730]|0)-12>>2]|0)+14992>>2]=14744;c3(13936,c[o>>2]|0,14168);c[3664]=5324;c[3666]=5344;c[3665]=0;g=c[1328]|0;ee(14656+g|0,13936);c[g+14728>>2]=0;c[g+14732>>2]=-1;g=c[t>>2]|0;eJ(13840);c[3460]=5520;c[3468]=g;iP(e,13844);g=iZ(e,14336)|0;h=g;iQ(e);c[3469]=h;c[3470]=14176;a[13884]=(cc[c[(c[g>>2]|0)+28>>2]&255](h)|0)&1;c[3594]=5228;c[3595]=5248;h=c[1304]|0;ee(14376+h|0,13840);g=h+72|0;c[14376+g>>2]=0;e=h+76|0;c[14376+e>>2]=-1;l=c[r>>2]|0;eJ(13888);c[3472]=5520;c[3480]=l;iP(d,13892);l=iZ(d,14336)|0;j=l;iQ(d);c[3481]=j;c[3482]=14184;a[13932]=(cc[c[(c[l>>2]|0)+28>>2]&255](j)|0)&1;c[3638]=5228;c[3639]=5248;ee(14552+h|0,13888);c[14552+g>>2]=0;c[14552+e>>2]=-1;j=c[(c[(c[3638]|0)-12>>2]|0)+14576>>2]|0;c[3616]=5228;c[3617]=5248;ee(14464+h|0,j);c[14464+g>>2]=0;c[14464+e>>2]=-1;c[(c[(c[3664]|0)-12>>2]|0)+14728>>2]=14376;e=(c[(c[3638]|0)-12>>2]|0)+14556|0;c[e>>2]=c[e>>2]|8192;c[(c[(c[3638]|0)-12>>2]|0)+14624>>2]=14376;i=b;return}function c_(a){a=a|0;eI(a|0);return}function c$(a){a=a|0;eI(a|0);kW(a);return}function c0(b,d){b=b|0;d=d|0;var e=0;cc[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=iZ(d,14336)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cc[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function c1(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cb[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aO(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=493;break}if((l|0)==2){m=-1;n=491;break}else if((l|0)!=1){n=489;break}}if((n|0)==491){i=b;return m|0}else if((n|0)==493){i=b;return m|0}else if((n|0)==489){m=((aM(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}return 0}function c2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+4|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;c[g>>2]=d;c[m>>2]=l;L455:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=ci[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=509;break}if((y|0)==3){B=500;break}if(y>>>0>=2){A=-1;B=512;break}x=(c[h>>2]|0)-t|0;if((aO(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=508;break}if((y|0)!=1){break L455}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y>>2<<2)|0;c[m>>2]=C;v=y;w=C}if((B|0)==500){if((aO(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==512){i=e;return A|0}else if((B|0)==508){i=e;return A|0}else if((B|0)==509){i=e;return A|0}}else{if((aO(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function c3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;eJ(b|0);c[b>>2]=5920;c[b+32>>2]=d;c[b+40>>2]=e;iP(g,b+4|0);e=iZ(g,14336)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cc[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cc[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){iQ(g);i=f;return}hY(424);iQ(g);i=f;return}function c4(a){a=a|0;eI(a|0);return}function c5(a){a=a|0;eI(a|0);kW(a);return}function c6(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=iZ(d,14336)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cc[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cc[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}hY(424);return}function c7(a){a=a|0;return dk(a,0)|0}function c8(a){a=a|0;return dk(a,1)|0}function c9(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}c[h>>2]=d;k=c[b+36>>2]|0;l=f|0;m=ci[c[(c[k>>2]|0)+12>>2]&31](k,c[b+40>>2]|0,h,h+4|0,e+24|0,l,f+8|0,g)|0;if((m|0)==2|(m|0)==1){j=-1;i=e;return j|0}else if((m|0)==3){a[l]=d&255;c[g>>2]=f+1}f=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=l>>>0){j=d;n=538;break}m=b-1|0;c[g>>2]=m;if((bI(a[m]|0,c[f>>2]|0)|0)==-1){j=-1;n=537;break}}if((n|0)==537){i=e;return j|0}else if((n|0)==538){i=e;return j|0}return 0}function da(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((cd[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){dZ(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((cd[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){dQ(l);break}c[m>>2]=0;c[b>>2]=0;dQ(l);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((cd[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function db(a){a=a|0;e$(14744)|0;e$(14832)|0;e1(14376)|0;e1(14464)|0;return}function dc(a){a=a|0;return}function dd(a){a=a|0;return}function de(a){a=a|0;var b=0;b=a+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;return}function df(a){a=a|0;return c[a+4>>2]|0}function dg(a){a=a|0;return c[a+4>>2]|0}function dh(a){a=a|0;c[a>>2]=5128;return}function di(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function dj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function dk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=c[b+44>>2]|0;l=(k|0)>1?k:1;L550:do{if((l|0)>0){k=b+32|0;m=0;while(1){n=a0(c[k>>2]|0)|0;if((n|0)==-1){o=-1;break}a[f+m|0]=n&255;m=m+1|0;if((m|0)>=(l|0)){break L550}}i=e;return o|0}}while(0);L557:do{if((a[b+48|0]&1)==0){m=b+40|0;k=b+36|0;n=f|0;p=g+4|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[k>>2]|0;w=f+r|0;x=ci[c[(c[t>>2]|0)+16>>2]&31](t,s,n,w,h,g,p,j)|0;if((x|0)==2){o=-1;y=603;break}else if((x|0)==3){y=595;break}else if((x|0)!=1){z=r;break L557}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=605;break}v=a0(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=607;break}a[w]=v&255;r=r+1|0}if((y|0)==603){i=e;return o|0}else if((y|0)==605){i=e;return o|0}else if((y|0)==595){c[g>>2]=a[n]|0;z=r;break}else if((y|0)==607){i=e;return o|0}}else{c[g>>2]=a[f|0]|0;z=l}}while(0);L571:do{if(!d){l=b+32|0;y=z;while(1){if((y|0)<=0){break L571}j=y-1|0;if((bI(a[f+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;break}else{y=j}}i=e;return o|0}}while(0);o=c[g>>2]|0;i=e;return o|0}function dl(a){a=a|0;ei(a|0);return}function dm(a){a=a|0;ei(a|0);kW(a);return}function dn(b,d){b=b|0;d=d|0;var e=0;cc[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=iZ(d,14344)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cc[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function dp(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cb[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aO(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=618;break}if((l|0)==2){m=-1;n=619;break}else if((l|0)!=1){n=615;break}}if((n|0)==615){m=((aM(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==619){i=b;return m|0}else if((n|0)==618){i=b;return m|0}return 0}function dq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+1|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;a[g]=d&255;c[m>>2]=l;L594:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=ci[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=639;break}if((y|0)==3){B=626;break}if(y>>>0>=2){A=-1;B=636;break}x=(c[h>>2]|0)-t|0;if((aO(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=638;break}if((y|0)!=1){break L594}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y)|0;c[m>>2]=C;v=y;w=C}if((B|0)==626){if((aO(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==636){i=e;return A|0}else if((B|0)==638){i=e;return A|0}else if((B|0)==639){i=e;return A|0}}else{if((aO(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;ej(b|0);c[b>>2]=5992;c[b+32>>2]=d;c[b+40>>2]=e;iP(g,b+4|0);e=iZ(g,14344)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cc[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cc[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){iQ(g);i=f;return}hY(424);iQ(g);i=f;return}function ds(a){a=a|0;ei(a|0);return}function dt(a){a=a|0;ei(a|0);kW(a);return}function du(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=iZ(d,14344)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cc[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cc[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}hY(424);return}function dv(a){a=a|0;return dy(a,0)|0}function dw(a){a=a|0;return dy(a,1)|0}function dx(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}k=d&255;a[h]=k;l=c[b+36>>2]|0;m=f|0;n=ci[c[(c[l>>2]|0)+12>>2]&31](l,c[b+40>>2]|0,h,h+1|0,e+24|0,m,f+8|0,g)|0;if((n|0)==3){a[m]=k;c[g>>2]=f+1}else if((n|0)==2|(n|0)==1){j=-1;i=e;return j|0}n=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=m>>>0){j=d;o=665;break}f=b-1|0;c[g>>2]=f;if((bI(a[f]|0,c[n>>2]|0)|0)==-1){j=-1;o=664;break}}if((o|0)==664){i=e;return j|0}else if((o|0)==665){i=e;return j|0}return 0}function dy(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[b+44>>2]|0;m=(l|0)>1?l:1;L644:do{if((m|0)>0){l=b+32|0;n=0;while(1){o=a0(c[l>>2]|0)|0;if((o|0)==-1){p=-1;break}a[g+n|0]=o&255;n=n+1|0;if((n|0)>=(m|0)){break L644}}i=f;return p|0}}while(0);L651:do{if((a[b+48|0]&1)==0){n=b+40|0;l=b+36|0;o=g|0;q=h+1|0;r=b+32|0;s=m;while(1){t=c[n>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[l>>2]|0;x=g+s|0;y=ci[c[(c[u>>2]|0)+16>>2]&31](u,t,o,x,j,h,q,k)|0;if((y|0)==3){z=677;break}else if((y|0)==2){p=-1;z=686;break}else if((y|0)!=1){A=s;break L651}y=c[n>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){p=-1;z=688;break}w=a0(c[r>>2]|0)|0;if((w|0)==-1){p=-1;z=689;break}a[x]=w&255;s=s+1|0}if((z|0)==677){a[h]=a[o]|0;A=s;break}else if((z|0)==686){i=f;return p|0}else if((z|0)==688){i=f;return p|0}else if((z|0)==689){i=f;return p|0}}else{a[h]=a[g|0]|0;A=m}}while(0);L665:do{if(!e){m=b+32|0;z=A;while(1){if((z|0)<=0){break L665}k=z-1|0;if((bI(d[g+k|0]|0|0,c[m>>2]|0)|0)==-1){p=-1;break}else{z=k}}i=f;return p|0}}while(0);p=d[h]|0;i=f;return p|0}function dz(){cZ(0);a1(146,15096|0,u|0)|0;return}function dA(a){a=a|0;var b=0,d=0;b=a+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){d=0;return d|0}b8[c[(c[a>>2]|0)+8>>2]&511](a);d=1;return d|0}function dB(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=3360;d=a+4|0;if((d|0)==0){return}a=k3(b|0)|0;e=kT(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;k4(a|0,b|0)|0;return}function dC(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3360;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;kW(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;kW(e);return}kX(d);e=a;kW(e);return}function dD(a){a=a|0;var b=0;c[a>>2]=3360;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}kX(a);return}function dE(b,d){b=b|0;d=d|0;var e=0,f=0;c[b>>2]=3296;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=k3(f|0)|0;b=kT(d+13|0)|0;c[b+4>>2]=d;c[b>>2]=d;d=b+12|0;c[e>>2]=d;c[b+8>>2]=0;k4(d|0,f|0)|0;return}function dF(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=3296;d=a+4|0;if((d|0)==0){return}a=k3(b|0)|0;e=kT(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;k4(a|0,b|0)|0;return}function dG(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3296;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;kW(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;kW(e);return}kX(d);e=a;kW(e);return}function dH(a){a=a|0;var b=0;c[a>>2]=3296;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}kX(a);return}function dI(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3360;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;kW(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;kW(e);return}kX(d);e=a;kW(e);return}function dJ(a){a=a|0;kW(a);return}function dK(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;cf[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function dL(a,b,c){a=a|0;b=b|0;c=c|0;b=bF(c|0)|0;dY(a,b,k3(b|0)|0);return}function dM(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;if((l|0)==0){m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];k2(h|0,0,12);i=g;return}n=d[h]|0;if((n&1|0)==0){o=n>>>1}else{o=c[f+4>>2]|0}if((o|0)==0){p=l}else{dS(f,1768)|0;p=c[k>>2]|0}k=c[e+4>>2]|0;cf[c[(c[k>>2]|0)+24>>2]&7](j,k,p);p=a[j]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}k=p&255;if((k&1|0)==0){r=k>>>1}else{r=c[j+4>>2]|0}dU(f,q,r)|0;dQ(j);m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];k2(h|0,0,12);i=g;return}function dN(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+32|0;f=b;b=i;i=i+8|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];f=e|0;g=e+16|0;dY(g,d,k3(d|0)|0);dM(f,b,g);dE(a|0,f);dQ(f);dQ(g);c[a>>2]=5488;g=b;b=a+8|0;a=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=a;i=e;return}function dO(a){a=a|0;dH(a|0);kW(a);return}function dP(a){a=a|0;dH(a|0);return}function dQ(b){b=b|0;if((a[b]&1)==0){return}kW(c[b+8>>2]|0);return}function dR(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=k3(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}d$(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}k1(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function dS(a,b){a=a|0;b=b|0;return dU(a,b,k3(b|0)|0)|0}function dT(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){em(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}a[k+i|0]=d;d=i+1|0;a[k+d|0]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function dU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){d$(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}i=k+j|0;k0(i|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function dV(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;if((c[a>>2]|0)==1){do{aV(10856,10848)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;b8[d&511](b);h;c[a>>2]=-1;i;bz(10856)|0;return}function dW(a){a=a|0;a=bY(8)|0;dB(a,696);c[a>>2]=3328;bq(a|0,9264,34)}function dX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if((f|0)==-1){dW(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=kS(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}k0(g|0,e|0,f)|0;a[g+f|0]=0;return}function dY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((e|0)==-1){dW(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0;k0(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=kS(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;k0(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function dZ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==-1){dW(0)}if(d>>>0<11){a[b]=d<<1&255;f=b+1|0}else{g=d+16&-16;h=kS(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=d;f=h}k2(f|0,e|0,d|0);a[f+d|0]=0;return}function d_(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((d|0)==-1){dW(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{if(g>>>0>h>>>0){p=kS(k)|0}else{p=kS(k)|0}h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;k0(l|0,m|0,h)|0;if(n){kW(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function d$(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){dW(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=kS(o)|0;if((g|0)!=0){k0(e|0,k|0,g)|0}if((i|0)!=0){n=e+g|0;k0(n|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g)|0;l=k+(h+g)|0;k0(n|0,l|0,f)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}kW(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function d0(a,b){a=a|0;b=b|0;return}function d1(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function d2(a){a=a|0;return 0}function d3(a){a=a|0;return 0}function d4(a){a=a|0;return-1|0}function d5(a,b){a=a|0;b=b|0;return-1|0}function d6(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function d7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function d8(b){b=b|0;if((a[b]&1)==0){return}kW(c[b+8>>2]|0);return}function d9(a,b){a=a|0;b=b|0;return ea(a,b,km(b)|0)|0}function ea(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}eq(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}ko(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function eb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){er(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}c[k+(i<<2)>>2]=d;d=i+1|0;c[k+(d<<2)>>2]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function ec(a){a=a|0;et(a|0);return}function ed(a,b){a=a|0;b=b|0;iP(a,b+28|0);return}function ee(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0&1;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;k2(a+32|0,0,40);if((b|0)==0){return}iY(b);return}function ef(a){a=a|0;et(a|0);return}function eg(a){a=a|0;c[a>>2]=5056;iQ(a+4|0);kW(a);return}function eh(a){a=a|0;c[a>>2]=5056;iQ(a+4|0);return}function ei(a){a=a|0;c[a>>2]=5056;iQ(a+4|0);return}function ej(a){a=a|0;c[a>>2]=5056;iY(a+4|0);k2(a+8|0,0,24);return}function ek(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=cc[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((k|0)==-1){g=d;m=1007;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=1009;break}}if((m|0)==1007){return g|0}else if((m|0)==1009){return g|0}return 0}function el(a){a=a|0;var b=0,e=0;if((cc[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function em(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){dW(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=kS(n)|0;if((g|0)!=0){k0(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g)|0;i=j+(h+g)|0;k0(m|0,i|0,f)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}kW(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function en(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741822){dW(0)}if(e>>>0<2){a[b]=e<<1&255;f=b+4|0;g=kn(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=kS(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=kn(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function eo(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741822){dW(0)}if(d>>>0<2){a[b]=d<<1&255;f=b+4|0;g=kp(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=kS(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=kp(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function ep(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(d>>>0>1073741822){dW(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;if(f>>>0>g>>>0){o=kS(d)|0}else{o=kS(d)|0}d=h&1;if(d<<24>>24==0){p=b+4|0}else{p=c[b+8>>2]|0}k=o;l=p;m=d<<24>>24!=0;n=1}d=h&255;if((d&1|0)==0){q=d>>>1}else{q=c[b+4>>2]|0}kn(k,l,q+1|0)|0;if(m){kW(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=k;return}else{a[e]=i<<1&255;return}}function eq(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741821-d|0)>>>0<e>>>0){dW(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=kS(o<<2)|0;if((g|0)!=0){kn(e,k,g)|0}if((i|0)!=0){n=e+(g<<2)|0;kn(n,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g<<2)|0;l=k+(h+g<<2)|0;kn(n,l,f)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}kW(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function er(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741821-d|0)>>>0<e>>>0){dW(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=kS(n<<2)|0;if((g|0)!=0){kn(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g<<2)|0;i=j+(h+g<<2)|0;kn(m,i,f)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}kW(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function es(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=bY(16)|0;if(!(a[10992]|0)){dh(13296);c[3324]=4824;a1(70,13296,u|0)|0;a[10992]=1}b=k7(13296,0,32)|0;d=K;c[f>>2]=b&0|1;c[f+4>>2]=d&-1;dN(e,f,1784);c[e>>2]=4008;bq(e|0,9808,28)}function et(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=3984;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;if((b|0)!=0){f=b;do{f=f-1|0;cf[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);}while((f|0)!=0)}iQ(a+28|0);kN(c[d>>2]|0);kN(c[e>>2]|0);kN(c[a+48>>2]|0);kN(c[a+60>>2]|0);return}function eu(a,b){a=a|0;b=b|0;return-1|0}function ev(a,b){a=a|0;b=b|0;return}function ew(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function ex(a){a=a|0;return 0}function ey(a){a=a|0;return 0}function ez(a){a=a|0;return-1|0}function eA(a,b){a=a|0;b=b|0;return-1|0}function eB(a,b){a=a|0;b=b|0;return-1|0}function eC(a,b){a=a|0;b=b|0;return}function eD(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function eE(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function eF(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((ca[c[(c[g>>2]|0)+52>>2]&63](b,d[l]|0)|0)==-1){h=k;n=1151;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=1149;break}}if((n|0)==1149){return h|0}else if((n|0)==1151){return h|0}return 0}function eG(a){a=a|0;c[a>>2]=4984;iQ(a+4|0);kW(a);return}function eH(a){a=a|0;c[a>>2]=4984;iQ(a+4|0);return}function eI(a){a=a|0;c[a>>2]=4984;iQ(a+4|0);return}function eJ(a){a=a|0;c[a>>2]=4984;iY(a+4|0);k2(a+8|0,0,24);return}function eK(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=cc[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((j|0)==-1){f=b;l=1164;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=1163;break}}if((l|0)==1164){return f|0}else if((l|0)==1163){return f|0}return 0}function eL(a){a=a|0;var b=0,d=0;if((cc[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function eM(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((ca[c[(c[e>>2]|0)+52>>2]&63](a,c[j>>2]|0)|0)==-1){f=i;l=1178;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=1180;break}}if((l|0)==1180){return f|0}else if((l|0)==1178){return f|0}return 0}function eN(a){a=a|0;et(a+8|0);kW(a);return}function eO(a){a=a|0;et(a+8|0);return}function eP(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;et(b+(d+8)|0);kW(b+d|0);return}function eQ(a){a=a|0;et(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function eR(a){a=a|0;et(a+8|0);kW(a);return}function eS(a){a=a|0;et(a+8|0);return}function eT(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;et(b+(d+8)|0);kW(b+d|0);return}function eU(a){a=a|0;et(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function eV(a){a=a|0;et(a+4|0);kW(a);return}function eW(a){a=a|0;et(a+4|0);return}function eX(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;et(b+(d+4)|0);kW(b+d|0);return}function eY(a){a=a|0;et(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function eZ(b,d){b=b|0;d=d|0;var e=0,f=0;e=b|0;a[e]=0;c[b+4>>2]=d;b=c[(c[d>>2]|0)-12>>2]|0;f=d;if((c[f+(b+16)>>2]|0)!=0){return}d=c[f+(b+72)>>2]|0;if((d|0)!=0){e$(d)|0}a[e]=1;return}function e_(a){a=a|0;e2(a);return}function e$(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){e$(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cc[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;es(h+k|0,c[h+(k+16)>>2]|1)}}while(0);e2(e);i=d;return b|0}function e0(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){return}else{aW()}}function e1(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){e1(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cc[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;es(h+k|0,c[h+(k+16)>>2]|1)}}while(0);fq(e);i=d;return b|0}function e2(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bm()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cc[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;es(d+b|0,c[d+(b+16)>>2]|1);return}function e3(a){a=a|0;return 2040|0}function e4(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1316:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=1269;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=1270;break}if(l<<24>>24<k<<24>>24){i=1;j=1268;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L1316}else{b=k;h=l}}if((j|0)==1270){return i|0}else if((j|0)==1269){return i|0}else if((j|0)==1268){return i|0}}}while(0);i=(g|0)!=(d|0)&1;return i|0}function e5(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function e6(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1335:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=1285;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=1286;break}if((l|0)<(k|0)){i=1;j=1284;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L1335}else{a=k;h=l}}if((j|0)==1285){return i|0}else if((j|0)==1284){return i|0}else if((j|0)==1286){return i|0}}}while(0);i=(g|0)!=(d|0)&1;return i|0}function e7(a){a=a|0;et(a+4|0);kW(a);return}function e8(a){a=a|0;et(a+4|0);return}function e9(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;et(b+(d+4)|0);kW(b+d|0);return}function fa(a){a=a|0;et(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function fb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){dY(a,2352,35);return}else{dL(a,b|0,c);return}}function fc(a){a=a|0;dd(a|0);return}function fd(a){a=a|0;dP(a|0);kW(a);return}function fe(a){a=a|0;dP(a|0);return}function ff(a){a=a|0;et(a);kW(a);return}function fg(a){a=a|0;dd(a|0);kW(a);return}function fh(a){a=a|0;dc(a|0);kW(a);return}function fi(a){a=a|0;dc(a|0);return}function fj(a){a=a|0;dc(a|0);return}function fk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;do{if((g|0)==-1){dW(b);h=1310}else{if(g>>>0>=11){h=1310;break}a[b]=g<<1&255;i=b+1|0}}while(0);if((h|0)==1310){h=g+16&-16;j=kS(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=g;i=j}if((e|0)==(f|0)){k=i;a[k]=0;return}j=f+(-d|0)|0;d=i;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=i+j|0;a[k]=0;return}function fl(a){a=a|0;dc(a|0);kW(a);return}function fm(a){a=a|0;dc(a|0);return}function fn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;if((p|0)!=0){e$(p)|0}a[l]=1;iP(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=iZ(j,14296)|0;iQ(j);q=c[(c[m>>2]|0)-12>>2]|0;r=c[o+(q+24)>>2]|0;s=o+(q+76)|0;t=c[s>>2]|0;if((t|0)==-1){iP(g,o+(q+28)|0);u=iZ(g,14648)|0;v=ca[c[(c[u>>2]|0)+28>>2]&63](u,32)|0;iQ(g);c[s>>2]=v<<24>>24;w=v}else{w=t&255}t=c[(c[p>>2]|0)+16>>2]|0;c[f>>2]=r;cl[t&63](k,p,f,o+q|0,w,d);if((c[k>>2]|0)!=0){break}q=c[(c[m>>2]|0)-12>>2]|0;es(o+q|0,c[o+(q+16)>>2]|5)}}while(0);e2(h);i=e;return b|0}function fo(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;if((p|0)!=0){e$(p)|0}a[l]=1;iP(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=iZ(j,14296)|0;iQ(j);q=c[(c[m>>2]|0)-12>>2]|0;r=c[o+(q+24)>>2]|0;s=o+(q+76)|0;t=c[s>>2]|0;if((t|0)==-1){iP(g,o+(q+28)|0);u=iZ(g,14648)|0;v=ca[c[(c[u>>2]|0)+28>>2]&63](u,32)|0;iQ(g);c[s>>2]=v<<24>>24;w=v}else{w=t&255}t=c[(c[p>>2]|0)+24>>2]|0;c[f>>2]=r;cl[t&63](k,p,f,o+q|0,w,d);if((c[k>>2]|0)!=0){break}q=c[(c[m>>2]|0)-12>>2]|0;es(o+q|0,c[o+(q+16)>>2]|5)}}while(0);e2(h);i=e;return b|0}function fp(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+8|0;f=e|0;g=f|0;a[g]=0;c[f+4>>2]=b;h=b;j=c[(c[h>>2]|0)-12>>2]|0;k=b;do{if((c[k+(j+16)>>2]|0)==0){l=c[k+(j+72)>>2]|0;if((l|0)!=0){e$(l)|0}a[g]=1;l=c[k+((c[(c[h>>2]|0)-12>>2]|0)+24)>>2]|0;m=l;if((l|0)==0){n=m}else{o=l+24|0;p=c[o>>2]|0;if((p|0)==(c[l+28>>2]|0)){q=ca[c[(c[l>>2]|0)+52>>2]&63](m,d&255)|0}else{c[o>>2]=p+1;a[p]=d;q=d&255}n=(q|0)==-1?0:m}if((n|0)!=0){break}m=c[(c[h>>2]|0)-12>>2]|0;es(k+m|0,c[k+(m+16)>>2]|1)}}while(0);e2(f);i=e;return b|0}function fq(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bm()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cc[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;es(d+b|0,c[d+(b+16)>>2]|1);return}function fr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function fs(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741822){dW(b)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=kS(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function ft(a){a=a|0;dc(a|0);kW(a);return}function fu(a){a=a|0;dc(a|0);return}function fv(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12&-1;n=l|0;do{if(m>>>0>100){o=kM(m)|0;if((o|0)!=0){p=o;q=o;break}k$();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){z=r;break}if((cc[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){A=z;B=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((cc[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){C=m;break}c[b>>2]=0;C=0}else{C=m}}while(0);A=c[u>>2]|0;B=C}D=(B|0)==0;if(!((r^D)&(s|0)!=0)){break}m=c[A+12>>2]|0;if((m|0)==(c[A+16>>2]|0)){E=(cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[m]|0}if(k){F=E}else{F=ca[c[(c[e>>2]|0)+12>>2]&63](h,E)|0}do{if(n){G=x;H=s}else{m=t+1|0;L1517:do{if(k){y=s;o=x;w=p;v=0;I=f;while(1){do{if((a[w]|0)==1){J=I;if((a[J]&1)==0){K=I+1|0}else{K=c[I+8>>2]|0}if(F<<24>>24!=(a[K+t|0]|0)){a[w]=0;L=v;M=o;N=y-1|0;break}O=d[J]|0;if((O&1|0)==0){P=O>>>1}else{P=c[I+4>>2]|0}if((P|0)!=(m|0)){L=1;M=o;N=y;break}a[w]=2;L=1;M=o+1|0;N=y-1|0}else{L=v;M=o;N=y}}while(0);O=I+12|0;if((O|0)==(g|0)){Q=N;R=M;S=L;break L1517}y=N;o=M;w=w+1|0;v=L;I=O}}else{I=s;v=x;w=p;o=0;y=f;while(1){do{if((a[w]|0)==1){O=y;if((a[O]&1)==0){T=y+1|0}else{T=c[y+8>>2]|0}if(F<<24>>24!=(ca[c[(c[e>>2]|0)+12>>2]&63](h,a[T+t|0]|0)|0)<<24>>24){a[w]=0;U=o;V=v;W=I-1|0;break}J=d[O]|0;if((J&1|0)==0){X=J>>>1}else{X=c[y+4>>2]|0}if((X|0)!=(m|0)){U=1;V=v;W=I;break}a[w]=2;U=1;V=v+1|0;W=I-1|0}else{U=o;V=v;W=I}}while(0);J=y+12|0;if((J|0)==(g|0)){Q=W;R=V;S=U;break L1517}I=W;v=V;w=w+1|0;o=U;y=J}}}while(0);if(!S){G=R;H=Q;break}m=c[u>>2]|0;y=m+12|0;o=c[y>>2]|0;if((o|0)==(c[m+16>>2]|0)){w=c[(c[m>>2]|0)+40>>2]|0;cc[w&255](m)|0}else{c[y>>2]=o+1}if((R+Q|0)>>>0<2|n){G=R;H=Q;break}o=t+1|0;y=R;m=p;w=f;while(1){do{if((a[m]|0)==2){v=d[w]|0;if((v&1|0)==0){Y=v>>>1}else{Y=c[w+4>>2]|0}if((Y|0)==(o|0)){Z=y;break}a[m]=0;Z=y-1|0}else{Z=y}}while(0);v=w+12|0;if((v|0)==(g|0)){G=Z;H=Q;break}else{y=Z;m=m+1|0;w=v}}}}while(0);t=t+1|0;x=G;s=H}do{if((A|0)==0){_=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){_=A;break}if((cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[u>>2]=0;_=0;break}else{_=c[u>>2]|0;break}}}while(0);u=(_|0)==0;do{if(D){$=1520}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(u){break}else{$=1522;break}}if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[b>>2]=0;$=1520;break}else{if(u^(B|0)==0){break}else{$=1522;break}}}}while(0);if(($|0)==1520){if(u){$=1522}}if(($|0)==1522){c[j>>2]=c[j>>2]|2}L1596:do{if(n){$=1527}else{u=f;B=p;while(1){if((a[B]|0)==2){aa=u;break L1596}b=u+12|0;if((b|0)==(g|0)){$=1527;break L1596}u=b;B=B+1|0}}}while(0);if(($|0)==1527){c[j>>2]=c[j>>2]|4;aa=g}if((q|0)==0){i=l;return aa|0}kN(q);i=l;return aa|0}function fw(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];b7[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}ed(r,g);q=r|0;r=c[q>>2]|0;if((c[3662]|0)!=-1){c[m>>2]=14648;c[m+4>>2]=12;c[m+8>>2]=0;dV(14648,m,96)}m=(c[3663]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;dA(n)|0;ed(s,g);n=s|0;p=c[n>>2]|0;if((c[3566]|0)!=-1){c[l>>2]=14264;c[l+4>>2]=12;c[l+8>>2]=0;dV(14264,l,96)}d=(c[3567]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;dA(z)|0;z=t|0;A=x;b9[c[(c[A>>2]|0)+24>>2]&127](z,y);b9[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(fv(e,u,z,t+24|0,o,h,1)|0)==(z|0)&1;c[b>>2]=c[e>>2];dQ(t+12|0);dQ(t|0);i=k;return}}while(0);o=bY(4)|0;kq(o);bq(o|0,9232,138)}}while(0);k=bY(4)|0;kq(k);bq(k|0,9232,138)}function fx(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[10864+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[10864+i|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function fy(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n-4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L1706:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}k=(e-h|0)>1?h+1|0:h;j=n+4|0;q=a[k]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(j>>>0<b>>>0){h=k;n=j;m=r;i=s}else{t=r;u=s;break L1706}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}function fz(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==64){u=8}else if((t|0)==0){u=0}else{u=10}t=l|0;fB(n,h,t,m);h=o|0;k2(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L1729:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cc[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=1645}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L1729}}if((cc[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=1645;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L1729}}}}while(0);if((y|0)==1645){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((fx(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cc[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=fA(h,c[p>>2]|0,j,u)|0;fy(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L1774:do{if(C){y=1675}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=1675;break L1774}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);do{if((y|0)==1675){if(l){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;dQ(n);i=e;return}function fA(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bE()|0)>>2]|0;c[(bE()|0)>>2]=0;if(a[10984]|0){l=c[3322]|0}else{m=aT(1,1888,0)|0;c[3322]=m;a[10984]=1;l=m}m=bR(b|0,h|0,f|0,l|0)|0;l=K;f=c[(bE()|0)>>2]|0;if((f|0)==0){c[(bE()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((f|0)==34|((l|0)<(d|0)|(l|0)==(d|0)&m>>>0<-2147483648>>>0)|((l|0)>(h|0)|(l|0)==(h|0)&m>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(l|0)>(e|0)|(l|0)==(e|0)&m>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function fB(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;ed(k,d);d=k|0;k=c[d>>2]|0;if((c[3662]|0)!=-1){c[j>>2]=14648;c[j+4>>2]=12;c[j+8>>2]=0;dV(14648,j,96)}j=(c[3663]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+32>>2]|0;cm[o&15](n,10864,10890,e)|0;n=c[d>>2]|0;if((c[3566]|0)!=-1){c[h>>2]=14264;c[h+4>>2]=12;c[h+8>>2]=0;dV(14264,h,96)}o=(c[3567]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;a[f]=cc[c[(c[p>>2]|0)+16>>2]&255](q)|0;b9[c[(c[p>>2]|0)+20>>2]&127](b,q);q=c[d>>2]|0;dA(q)|0;i=g;return}}while(0);o=bY(4)|0;kq(o);bq(o|0,9232,138)}}while(0);g=bY(4)|0;kq(g);bq(g|0,9232,138)}function fC(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l|0;fB(n,h,t,m);h=o|0;k2(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L1834:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cc[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=1732}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L1834}}if((cc[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=1732;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L1834}}}}while(0);if((y|0)==1732){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((fx(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cc[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=fD(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;fy(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L1879:do{if(C){y=1762}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=1762;break L1879}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);do{if((y|0)==1762){if(l){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;dQ(n);i=e;return}function fD(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}l=c[(bE()|0)>>2]|0;c[(bE()|0)>>2]=0;if(a[10984]|0){m=c[3322]|0}else{n=aT(1,1888,0)|0;c[3322]=n;a[10984]=1;m=n}n=bR(b|0,h|0,f|0,m|0)|0;m=K;f=c[(bE()|0)>>2]|0;if((f|0)==0){c[(bE()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}if((f|0)!=34){j=m;k=n;i=g;return(K=j,k)|0}c[e>>2]=4;e=0;f=(m|0)>(e|0)|(m|0)==(e|0)&n>>>0>0>>>0;j=f?2147483647:-2147483648;k=f?-1:0;i=g;return(K=j,k)|0}function fE(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=i;i=i+280|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=f+96|0;r=f+104|0;s=f+264|0;t=f+272|0;u=c[j+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=m|0;fB(o,j,u,n);j=p|0;k2(j|0,0,40);c[q>>2]=j;p=r|0;c[s>>2]=p;c[t>>2]=0;m=g|0;g=h|0;h=a[n]|0;n=c[m>>2]|0;L1918:while(1){do{if((n|0)==0){w=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){w=n;break}if((cc[c[(c[n>>2]|0)+36>>2]&255](n)|0)!=-1){w=n;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;y=c[g>>2]|0;do{if((y|0)==0){z=1801}else{if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(x){A=y;B=0;break}else{C=y;D=0;break L1918}}if((cc[c[(c[y>>2]|0)+36>>2]&255](y)|0)==-1){c[g>>2]=0;z=1801;break}else{E=(y|0)==0;if(x^E){A=y;B=E;break}else{C=y;D=E;break L1918}}}}while(0);if((z|0)==1801){z=0;if(x){C=0;D=1;break}else{A=0;B=1}}y=w+12|0;E=c[y>>2]|0;F=w+16|0;if((E|0)==(c[F>>2]|0)){G=(cc[c[(c[w>>2]|0)+36>>2]&255](w)|0)&255}else{G=a[E]|0}if((fx(G,v,j,q,t,h,o,p,s,u)|0)!=0){C=A;D=B;break}E=c[y>>2]|0;if((E|0)==(c[F>>2]|0)){F=c[(c[w>>2]|0)+40>>2]|0;cc[F&255](w)|0;n=w;continue}else{c[y>>2]=E+1;n=w;continue}}n=d[o]|0;if((n&1|0)==0){H=n>>>1}else{H=c[o+4>>2]|0}do{if((H|0)!=0){n=c[s>>2]|0;if((n-r|0)>=160){break}B=c[t>>2]|0;c[s>>2]=n+4;c[n>>2]=B}}while(0);b[l>>1]=fF(j,c[q>>2]|0,k,v)|0;fy(o,p,c[s>>2]|0,k);do{if(x){I=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){I=w;break}if((cc[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){I=w;break}c[m>>2]=0;I=0}}while(0);m=(I|0)==0;L1963:do{if(D){z=1831}else{do{if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((cc[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){break}c[g>>2]=0;z=1831;break L1963}}while(0);if(!(m^(C|0)==0)){break}J=e|0;c[J>>2]=I;dQ(o);i=f;return}}while(0);do{if((z|0)==1831){if(m){break}J=e|0;c[J>>2]=I;dQ(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;J=e|0;c[J>>2]=I;dQ(o);i=f;return}function fF(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bE()|0)>>2]|0;c[(bE()|0)>>2]=0;if(a[10984]|0){l=c[3322]|0}else{m=aT(1,1888,0)|0;c[3322]=m;a[10984]=1;l=m}m=aL(b|0,h|0,f|0,l|0)|0;l=K;f=c[(bE()|0)>>2]|0;if((f|0)==0){c[(bE()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m&65535;i=g;return j|0}return 0}function fG(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l|0;fB(n,h,t,m);h=o|0;k2(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2007:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cc[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=1874}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2007}}if((cc[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=1874;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2007}}}}while(0);if((y|0)==1874){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((fx(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cc[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=fH(h,c[p>>2]|0,j,u)|0;fy(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2052:do{if(C){y=1904}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=1904;break L2052}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);do{if((y|0)==1904){if(l){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;dQ(n);i=e;return}function fH(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bE()|0)>>2]|0;c[(bE()|0)>>2]=0;if(a[10984]|0){l=c[3322]|0}else{m=aT(1,1888,0)|0;c[3322]=m;a[10984]=1;l=m}m=aL(b|0,h|0,f|0,l|0)|0;l=K;f=c[(bE()|0)>>2]|0;if((f|0)==0){c[(bE()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function fI(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l|0;fB(n,h,t,m);h=o|0;k2(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2096:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cc[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=1947}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2096}}if((cc[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=1947;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2096}}}}while(0);if((y|0)==1947){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((fx(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cc[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=fJ(h,c[p>>2]|0,j,u)|0;fy(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2141:do{if(C){y=1977}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=1977;break L2141}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);do{if((y|0)==1977){if(l){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;dQ(n);i=e;return}function fJ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bE()|0)>>2]|0;c[(bE()|0)>>2]=0;if(a[10984]|0){l=c[3322]|0}else{m=aT(1,1888,0)|0;c[3322]=m;a[10984]=1;l=m}m=aL(b|0,h|0,f|0,l|0)|0;l=K;f=c[(bE()|0)>>2]|0;if((f|0)==0){c[(bE()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function fK(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l|0;fB(n,h,t,m);h=o|0;k2(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2185:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cc[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2020}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2185}}if((cc[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2020;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2185}}}}while(0);if((y|0)==2020){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((fx(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cc[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=fL(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;fy(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cc[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2230:do{if(C){y=2050}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2050;break L2230}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);do{if((y|0)==2050){if(l){break}I=b|0;c[I>>2]=H;dQ(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;dQ(n);i=e;return}function fL(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[(bE()|0)>>2]|0;c[(bE()|0)>>2]=0;if(a[10984]|0){m=c[3322]|0}else{n=aT(1,1888,0)|0;c[3322]=n;a[10984]=1;m=n}n=aL(b|0,h|0,f|0,m|0)|0;o=K;p=c[(bE()|0)>>2]|0;if((p|0)==0){c[(bE()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((p|0)!=34){j=o;k=n;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(K=j,k)|0}function fM(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0.0,M=0,N=0.0,O=0,P=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;fN(p,j,w,n,o);j=e+72|0;k2(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L2263:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cc[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2083}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){D=B;E=0;break}else{F=B;G=0;break L2263}}if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2083;break}else{H=(B|0)==0;if(A^H){D=B;E=H;break}else{F=B;G=H;break L2263}}}}while(0);if((C|0)==2083){C=0;if(A){F=0;G=1;break}else{D=0;E=1}}B=z+12|0;H=c[B>>2]|0;I=z+16|0;if((H|0)==(c[I>>2]|0)){J=(cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{J=a[H]|0}if((fO(J,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){F=D;G=E;break}H=c[B>>2]|0;if((H|0)==(c[I>>2]|0)){I=c[(c[z>>2]|0)+40>>2]|0;cc[I&255](z)|0;o=z;continue}else{c[B>>2]=H+1;o=z;continue}}o=d[p]|0;if((o&1|0)==0){K=o>>>1}else{K=c[p+4>>2]|0}do{if((K|0)!=0){if((a[u]&1)==0){break}o=c[s>>2]|0;if((o-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=E}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;L=0.0}else{if(a[10984]|0){M=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;M=q}N=+k_(j,m,M);if((c[m>>2]|0)==(t|0)){L=N;break}else{c[k>>2]=4;L=0.0;break}}}while(0);g[l>>2]=L;fy(p,x,c[s>>2]|0,k);do{if(A){O=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){O=z;break}if((cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){O=z;break}c[y>>2]=0;O=0}}while(0);y=(O|0)==0;L2321:do{if(G){C=2123}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((cc[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2123;break L2321}}while(0);if(!(y^(F|0)==0)){break}P=b|0;c[P>>2]=O;dQ(p);i=e;return}}while(0);do{if((C|0)==2123){if(y){break}P=b|0;c[P>>2]=O;dQ(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;P=b|0;c[P>>2]=O;dQ(p);i=e;return}function fN(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;ed(l,d);d=l|0;l=c[d>>2]|0;if((c[3662]|0)!=-1){c[k>>2]=14648;c[k+4>>2]=12;c[k+8>>2]=0;dV(14648,k,96)}k=(c[3663]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;cm[p&15](o,10864,10896,e)|0;o=c[d>>2]|0;if((c[3566]|0)!=-1){c[j>>2]=14264;c[j+4>>2]=12;c[j+8>>2]=0;dV(14264,j,96)}p=(c[3567]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;a[f]=cc[c[(c[s>>2]|0)+12>>2]&255](r)|0;a[g]=cc[c[(c[s>>2]|0)+16>>2]&255](r)|0;b9[c[(c[q>>2]|0)+20>>2]&127](b,r);r=c[d>>2]|0;dA(r)|0;i=h;return}}while(0);p=bY(4)|0;kq(p);bq(p|0,9232,138)}}while(0);h=bY(4)|0;kq(h);bq(h|0,9232,138)}function fO(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+32|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((a[j]|0)==b<<24>>24){u=j;break}else{j=j+1|0}}j=u-o|0;if((j|0)>31){r=-1;return r|0}o=a[10864+j|0]|0;do{if((j|0)==25|(j|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=o;r=0;return r|0}else if((j|0)==22|(j|0)==23){a[f]=80}else{u=a[f]|0;if((o&95|0)!=(u<<24>>24|0)){break}a[f]=u|-128;if((a[e]&1)==0){break}a[e]=0;u=d[k]|0;if((u&1|0)==0){v=u>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}u=c[m>>2]|0;if((u-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=b}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=o}if((j|0)>21){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function fP(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0.0,M=0,N=0.0,O=0,P=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;fN(p,j,w,n,o);j=e+72|0;k2(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L2424:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cc[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2212}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){D=B;E=0;break}else{F=B;G=0;break L2424}}if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2212;break}else{H=(B|0)==0;if(A^H){D=B;E=H;break}else{F=B;G=H;break L2424}}}}while(0);if((C|0)==2212){C=0;if(A){F=0;G=1;break}else{D=0;E=1}}B=z+12|0;H=c[B>>2]|0;I=z+16|0;if((H|0)==(c[I>>2]|0)){J=(cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{J=a[H]|0}if((fO(J,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){F=D;G=E;break}H=c[B>>2]|0;if((H|0)==(c[I>>2]|0)){I=c[(c[z>>2]|0)+40>>2]|0;cc[I&255](z)|0;o=z;continue}else{c[B>>2]=H+1;o=z;continue}}o=d[p]|0;if((o&1|0)==0){K=o>>>1}else{K=c[p+4>>2]|0}do{if((K|0)!=0){if((a[u]&1)==0){break}o=c[s>>2]|0;if((o-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=E}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;L=0.0}else{if(a[10984]|0){M=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;M=q}N=+k_(j,m,M);if((c[m>>2]|0)==(t|0)){L=N;break}c[k>>2]=4;L=0.0}}while(0);h[l>>3]=L;fy(p,x,c[s>>2]|0,k);do{if(A){O=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){O=z;break}if((cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){O=z;break}c[y>>2]=0;O=0}}while(0);y=(O|0)==0;L2480:do{if(G){C=2251}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((cc[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2251;break L2480}}while(0);if(!(y^(F|0)==0)){break}P=b|0;c[P>>2]=O;dQ(p);i=e;return}}while(0);do{if((C|0)==2251){if(y){break}P=b|0;c[P>>2]=O;dQ(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;P=b|0;c[P>>2]=O;dQ(p);i=e;return}function fQ(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0.0,M=0,N=0.0,O=0,P=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;fN(p,j,w,n,o);j=e+72|0;k2(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L2494:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cc[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2270}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){D=B;E=0;break}else{F=B;G=0;break L2494}}if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2270;break}else{H=(B|0)==0;if(A^H){D=B;E=H;break}else{F=B;G=H;break L2494}}}}while(0);if((C|0)==2270){C=0;if(A){F=0;G=1;break}else{D=0;E=1}}B=z+12|0;H=c[B>>2]|0;I=z+16|0;if((H|0)==(c[I>>2]|0)){J=(cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{J=a[H]|0}if((fO(J,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){F=D;G=E;break}H=c[B>>2]|0;if((H|0)==(c[I>>2]|0)){I=c[(c[z>>2]|0)+40>>2]|0;cc[I&255](z)|0;o=z;continue}else{c[B>>2]=H+1;o=z;continue}}o=d[p]|0;if((o&1|0)==0){K=o>>>1}else{K=c[p+4>>2]|0}do{if((K|0)!=0){if((a[u]&1)==0){break}o=c[s>>2]|0;if((o-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=E}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;L=0.0}else{if(a[10984]|0){M=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;M=q}N=+k_(j,m,M);if((c[m>>2]|0)==(t|0)){L=N;break}c[k>>2]=4;L=0.0}}while(0);h[l>>3]=L;fy(p,x,c[s>>2]|0,k);do{if(A){O=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){O=z;break}if((cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){O=z;break}c[y>>2]=0;O=0}}while(0);y=(O|0)==0;L2550:do{if(G){C=2309}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((cc[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2309;break L2550}}while(0);if(!(y^(F|0)==0)){break}P=b|0;c[P>>2]=O;dQ(p);i=e;return}}while(0);do{if((C|0)==2309){if(y){break}P=b|0;c[P>>2]=O;dQ(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;P=b|0;c[P>>2]=O;dQ(p);i=e;return}function fR(a){a=a|0;dc(a|0);kW(a);return}function fS(a){a=a|0;dc(a|0);return}function fT(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+64|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+48|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;k2(m|0,0,12);ed(n,g);g=n|0;n=c[g>>2]|0;if((c[3662]|0)!=-1){c[k>>2]=14648;c[k+4>>2]=12;c[k+8>>2]=0;dV(14648,k,96)}k=(c[3663]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+32>>2]|0;cm[x&15](v,10864,10890,w)|0;v=c[g>>2]|0;dA(v)|0;v=o|0;k2(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L2574:while(1){do{if((z|0)==0){A=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){A=z;break}if((cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);C=(A|0)==0;D=c[y>>2]|0;do{if((D|0)==0){E=2338}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){F=D;G=0;break}else{H=D;I=0;break L2574}}if((cc[c[(c[D>>2]|0)+36>>2]&255](D)|0)==-1){c[y>>2]=0;E=2338;break}else{J=(D|0)==0;if(C^J){F=D;G=J;break}else{H=D;I=J;break L2574}}}}while(0);if((E|0)==2338){E=0;if(C){H=0;I=1;break}else{F=0;G=1}}D=A+12|0;J=c[D>>2]|0;K=A+16|0;if((J|0)==(c[K>>2]|0)){L=(cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{L=a[J]|0}if((fx(L,16,v,p,s,0,m,x,r,w)|0)!=0){H=F;I=G;break}J=c[D>>2]|0;if((J|0)==(c[K>>2]|0)){K=c[(c[A>>2]|0)+40>>2]|0;cc[K&255](A)|0;z=A;continue}else{c[D>>2]=J+1;z=A;continue}}a[o+39|0]=0;if(a[10984]|0){M=c[3322]|0}else{z=aT(1,1888,0)|0;c[3322]=z;a[10984]=1;M=z}if((fU(v,M,1800,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}do{if(C){N=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){N=A;break}if((cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)!=-1){N=A;break}c[u>>2]=0;N=0}}while(0);u=(N|0)==0;L2619:do{if(I){E=2369}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((cc[c[(c[H>>2]|0)+36>>2]&255](H)|0)!=-1){break}c[y>>2]=0;E=2369;break L2619}}while(0);if(!(u^(H|0)==0)){break}O=b|0;c[O>>2]=N;dQ(m);i=d;return}}while(0);do{if((E|0)==2369){if(u){break}O=b|0;c[O>>2]=N;dQ(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;O=b|0;c[O>>2]=N;dQ(m);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function fU(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bK(b|0)|0;b=aZ(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bK(h|0)|0;i=f;return b|0}function fV(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];b7[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==0){a[j]=0}else if((w|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}ed(r,g);q=r|0;r=c[q>>2]|0;if((c[3660]|0)!=-1){c[m>>2]=14640;c[m+4>>2]=12;c[m+8>>2]=0;dV(14640,m,96)}m=(c[3661]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;dA(n)|0;ed(s,g);n=s|0;p=c[n>>2]|0;if((c[3564]|0)!=-1){c[l>>2]=14256;c[l+4>>2]=12;c[l+8>>2]=0;dV(14256,l,96)}d=(c[3565]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;dA(z)|0;z=t|0;A=x;b9[c[(c[A>>2]|0)+24>>2]&127](z,y);b9[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(fW(e,u,z,t+24|0,o,h,1)|0)==(z|0)&1;c[b>>2]=c[e>>2];d8(t+12|0);d8(t|0);i=k;return}}while(0);o=bY(4)|0;kq(o);bq(o|0,9232,138)}}while(0);k=bY(4)|0;kq(k);bq(k|0,9232,138)}function fW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12&-1;n=l|0;do{if(m>>>0>100){o=kM(m)|0;if((o|0)!=0){p=o;q=o;break}k$();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){A=cc[c[(c[r>>2]|0)+36>>2]&255](r)|0}else{A=c[m>>2]|0}if((A|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){B=z;C=0}else{y=c[m+12>>2]|0;if((y|0)==(c[m+16>>2]|0)){D=cc[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{D=c[y>>2]|0}if((D|0)==-1){c[b>>2]=0;E=0}else{E=m}B=c[u>>2]|0;C=E}F=(C|0)==0;if(!((r^F)&(s|0)!=0)){break}r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){G=cc[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{G=c[r>>2]|0}if(k){H=G}else{H=ca[c[(c[e>>2]|0)+28>>2]&63](h,G)|0}do{if(n){I=x;J=s}else{r=t+1|0;L2718:do{if(k){m=s;y=x;o=p;w=0;v=f;while(1){do{if((a[o]|0)==1){K=v;if((a[K]&1)==0){L=v+4|0}else{L=c[v+8>>2]|0}if((H|0)!=(c[L+(t<<2)>>2]|0)){a[o]=0;M=w;N=y;O=m-1|0;break}P=d[K]|0;if((P&1|0)==0){Q=P>>>1}else{Q=c[v+4>>2]|0}if((Q|0)!=(r|0)){M=1;N=y;O=m;break}a[o]=2;M=1;N=y+1|0;O=m-1|0}else{M=w;N=y;O=m}}while(0);P=v+12|0;if((P|0)==(g|0)){R=O;S=N;T=M;break L2718}m=O;y=N;o=o+1|0;w=M;v=P}}else{v=s;w=x;o=p;y=0;m=f;while(1){do{if((a[o]|0)==1){P=m;if((a[P]&1)==0){U=m+4|0}else{U=c[m+8>>2]|0}if((H|0)!=(ca[c[(c[e>>2]|0)+28>>2]&63](h,c[U+(t<<2)>>2]|0)|0)){a[o]=0;V=y;W=w;X=v-1|0;break}K=d[P]|0;if((K&1|0)==0){Y=K>>>1}else{Y=c[m+4>>2]|0}if((Y|0)!=(r|0)){V=1;W=w;X=v;break}a[o]=2;V=1;W=w+1|0;X=v-1|0}else{V=y;W=w;X=v}}while(0);K=m+12|0;if((K|0)==(g|0)){R=X;S=W;T=V;break L2718}v=X;w=W;o=o+1|0;y=V;m=K}}}while(0);if(!T){I=S;J=R;break}r=c[u>>2]|0;m=r+12|0;y=c[m>>2]|0;if((y|0)==(c[r+16>>2]|0)){o=c[(c[r>>2]|0)+40>>2]|0;cc[o&255](r)|0}else{c[m>>2]=y+4}if((S+R|0)>>>0<2|n){I=S;J=R;break}y=t+1|0;m=S;r=p;o=f;while(1){do{if((a[r]|0)==2){w=d[o]|0;if((w&1|0)==0){Z=w>>>1}else{Z=c[o+4>>2]|0}if((Z|0)==(y|0)){_=m;break}a[r]=0;_=m-1|0}else{_=m}}while(0);w=o+12|0;if((w|0)==(g|0)){I=_;J=R;break}else{m=_;r=r+1|0;o=w}}}}while(0);t=t+1|0;x=I;s=J}do{if((B|0)==0){$=1}else{J=c[B+12>>2]|0;if((J|0)==(c[B+16>>2]|0)){aa=cc[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{aa=c[J>>2]|0}if((aa|0)==-1){c[u>>2]=0;$=1;break}else{$=(c[u>>2]|0)==0;break}}}while(0);do{if(F){ab=2508}else{u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){ac=cc[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{ac=c[u>>2]|0}if((ac|0)==-1){c[b>>2]=0;ab=2508;break}else{if($^(C|0)==0){break}else{ab=2510;break}}}}while(0);if((ab|0)==2508){if($){ab=2510}}if((ab|0)==2510){c[j>>2]=c[j>>2]|2}L2799:do{if(n){ab=2515}else{$=f;C=p;while(1){if((a[C]|0)==2){ad=$;break L2799}b=$+12|0;if((b|0)==(g|0)){ab=2515;break L2799}$=b;C=C+1|0}}}while(0);if((ab|0)==2515){c[j>>2]=c[j>>2]|4;ad=g}if((q|0)==0){i=l;return ad|0}kN(q);i=l;return ad|0}function fX(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==64){t=8}else if((s|0)==8){t=16}else{t=10}s=k|0;f$(m,g,s,l);g=n|0;k2(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L2817:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cc[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=2539}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=2539;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L2817}}}}while(0);if((y|0)==2539){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((fY(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cc[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=fA(g,c[o>>2]|0,h,t)|0;fy(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=2570}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cc[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=2570;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;dQ(m);i=b;return}}while(0);do{if((y|0)==2570){if(k){break}L=a|0;c[L>>2]=I;dQ(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;dQ(m);i=b;return}function fY(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[10864+m|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[10864+m|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function fZ(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==64){t=8}else if((s|0)==8){t=16}else{t=10}s=k|0;f$(m,g,s,l);g=n|0;k2(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L2932:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cc[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=2629}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=2629;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L2932}}}}while(0);if((y|0)==2629){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((fY(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cc[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=fD(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=K;fy(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=2660}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=cc[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;y=2660;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;dQ(m);i=b;return}}while(0);do{if((y|0)==2660){if(k){break}M=a|0;c[M>>2]=I;dQ(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;dQ(m);i=b;return}function f_(a,e,f,g,h,j,k){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}t=l|0;f$(n,h,t,m);h=o|0;k2(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L3001:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=cc[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=2684}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=cc[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=2684;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L3001}}}}while(0);if((z|0)==2684){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((fY(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;cc[G&255](v)|0;m=v;continue}else{c[w>>2]=A+4;m=v;continue}}m=d[n]|0;if((m&1|0)==0){I=m>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=D}}while(0);b[k>>1]=fF(h,c[p>>2]|0,j,u)|0;fy(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=2715}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=cc[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=2715;break}if(!(l^(E|0)==0)){break}M=a|0;c[M>>2]=J;dQ(n);i=e;return}}while(0);do{if((z|0)==2715){if(l){break}M=a|0;c[M>>2]=J;dQ(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;M=a|0;c[M>>2]=J;dQ(n);i=e;return}function f$(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;ed(j,b);b=j|0;j=c[b>>2]|0;if((c[3660]|0)!=-1){c[h>>2]=14640;c[h+4>>2]=12;c[h+8>>2]=0;dV(14640,h,96)}h=(c[3661]|0)-1|0;k=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-k>>2>>>0>h>>>0){l=c[k+(h<<2)>>2]|0;if((l|0)==0){break}m=l;n=c[(c[l>>2]|0)+48>>2]|0;cm[n&15](m,10864,10890,d)|0;m=c[b>>2]|0;if((c[3564]|0)!=-1){c[g>>2]=14256;c[g+4>>2]=12;c[g+8>>2]=0;dV(14256,g,96)}n=(c[3565]|0)-1|0;l=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-l>>2>>>0>n>>>0){o=c[l+(n<<2)>>2]|0;if((o|0)==0){break}p=o;c[e>>2]=cc[c[(c[o>>2]|0)+16>>2]&255](p)|0;b9[c[(c[o>>2]|0)+20>>2]&127](a,p);p=c[b>>2]|0;dA(p)|0;i=f;return}}while(0);n=bY(4)|0;kq(n);bq(n|0,9232,138)}}while(0);f=bY(4)|0;kq(f);bq(f|0,9232,138)}function f0(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==64){t=8}else if((s|0)==8){t=16}else{t=10}s=k|0;f$(m,g,s,l);g=n|0;k2(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L3090:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cc[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=2756}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=2756;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L3090}}}}while(0);if((y|0)==2756){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((fY(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cc[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=fH(g,c[o>>2]|0,h,t)|0;fy(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=2787}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cc[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=2787;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;dQ(m);i=b;return}}while(0);do{if((y|0)==2787){if(k){break}L=a|0;c[L>>2]=I;dQ(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;dQ(m);i=b;return}function f1(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k|0;f$(m,g,s,l);g=n|0;k2(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L3159:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cc[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=2811}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=2811;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L3159}}}}while(0);if((y|0)==2811){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((fY(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cc[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=fJ(g,c[o>>2]|0,h,t)|0;fy(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=2842}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cc[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=2842;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;dQ(m);i=b;return}}while(0);do{if((y|0)==2842){if(k){break}L=a|0;c[L>>2]=I;dQ(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;dQ(m);i=b;return}function f2(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==64){t=8}else if((s|0)==8){t=16}else if((s|0)==0){t=0}else{t=10}s=k|0;f$(m,g,s,l);g=n|0;k2(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L3228:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cc[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=2866}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cc[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=2866;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L3228}}}}while(0);if((y|0)==2866){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((fY(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cc[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=fL(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=K;fy(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=2897}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=cc[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;y=2897;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;dQ(m);i=b;return}}while(0);do{if((y|0)==2897){if(k){break}M=a|0;c[M>>2]=I;dQ(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;dQ(m);i=b;return}function f3(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if((b|0)==(i|0)){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+128|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((c[j>>2]|0)==(b|0)){u=j;break}else{j=j+4|0}}j=u-o|0;o=j>>2;if((j|0)>124){r=-1;return r|0}u=a[10864+o|0]|0;do{if((o|0)==25|(o|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=u;r=0;return r|0}else if((o|0)==22|(o|0)==23){a[f]=80}else{b=a[f]|0;if((u&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){v=b>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}t=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=t}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=u}if((j|0)>84){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function f4(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0.0,Q=0,R=0,S=0,T=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;f5(p,j,w,n,o);j=e+168|0;k2(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L3360:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cc[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);C=(z|0)==0;A=c[f>>2]|0;do{if((A|0)==0){D=2969}else{E=c[A+12>>2]|0;if((E|0)==(c[A+16>>2]|0)){F=cc[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=2969;break}else{E=(A|0)==0;if(C^E){G=A;H=E;break}else{I=A;J=E;break L3360}}}}while(0);if((D|0)==2969){D=0;if(C){I=0;J=1;break}else{G=0;H=1}}A=z+12|0;E=c[A>>2]|0;K=z+16|0;if((E|0)==(c[K>>2]|0)){L=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[E>>2]|0}if((f3(L,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){I=G;J=H;break}E=c[A>>2]|0;if((E|0)==(c[K>>2]|0)){K=c[(c[z>>2]|0)+40>>2]|0;cc[K&255](z)|0;o=z;continue}else{c[A>>2]=E+4;o=z;continue}}o=d[p]|0;if((o&1|0)==0){M=o>>>1}else{M=c[p+4>>2]|0}do{if((M|0)!=0){if((a[u]&1)==0){break}o=c[s>>2]|0;if((o-r|0)>=160){break}H=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=H}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;N=0.0}else{if(a[10984]|0){O=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;O=q}P=+k_(j,m,O);if((c[m>>2]|0)==(t|0)){N=P;break}else{c[k>>2]=4;N=0.0;break}}}while(0);g[l>>2]=N;fy(p,x,c[s>>2]|0,k);do{if(C){Q=0}else{s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){R=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{R=c[s>>2]|0}if((R|0)!=-1){Q=z;break}c[y>>2]=0;Q=0}}while(0);y=(Q|0)==0;do{if(J){D=3010}else{z=c[I+12>>2]|0;if((z|0)==(c[I+16>>2]|0)){S=cc[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{S=c[z>>2]|0}if((S|0)==-1){c[f>>2]=0;D=3010;break}if(!(y^(I|0)==0)){break}T=b|0;c[T>>2]=Q;dQ(p);i=e;return}}while(0);do{if((D|0)==3010){if(y){break}T=b|0;c[T>>2]=Q;dQ(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;T=b|0;c[T>>2]=Q;dQ(p);i=e;return}function f5(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;ed(k,b);b=k|0;k=c[b>>2]|0;if((c[3660]|0)!=-1){c[j>>2]=14640;c[j+4>>2]=12;c[j+8>>2]=0;dV(14640,j,96)}j=(c[3661]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;cm[o&15](n,10864,10896,d)|0;n=c[b>>2]|0;if((c[3564]|0)!=-1){c[h>>2]=14256;c[h+4>>2]=12;c[h+8>>2]=0;dV(14256,h,96)}o=(c[3565]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=p;c[e>>2]=cc[c[(c[r>>2]|0)+12>>2]&255](q)|0;c[f>>2]=cc[c[(c[r>>2]|0)+16>>2]&255](q)|0;b9[c[(c[p>>2]|0)+20>>2]&127](a,q);q=c[b>>2]|0;dA(q)|0;i=g;return}}while(0);o=bY(4)|0;kq(o);bq(o|0,9232,138)}}while(0);g=bY(4)|0;kq(g);bq(g|0,9232,138)}function f6(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0.0,Q=0,R=0,S=0,T=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;f5(p,j,w,n,o);j=e+168|0;k2(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L3458:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cc[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);C=(z|0)==0;A=c[f>>2]|0;do{if((A|0)==0){D=3048}else{E=c[A+12>>2]|0;if((E|0)==(c[A+16>>2]|0)){F=cc[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=3048;break}else{E=(A|0)==0;if(C^E){G=A;H=E;break}else{I=A;J=E;break L3458}}}}while(0);if((D|0)==3048){D=0;if(C){I=0;J=1;break}else{G=0;H=1}}A=z+12|0;E=c[A>>2]|0;K=z+16|0;if((E|0)==(c[K>>2]|0)){L=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[E>>2]|0}if((f3(L,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){I=G;J=H;break}E=c[A>>2]|0;if((E|0)==(c[K>>2]|0)){K=c[(c[z>>2]|0)+40>>2]|0;cc[K&255](z)|0;o=z;continue}else{c[A>>2]=E+4;o=z;continue}}o=d[p]|0;if((o&1|0)==0){M=o>>>1}else{M=c[p+4>>2]|0}do{if((M|0)!=0){if((a[u]&1)==0){break}o=c[s>>2]|0;if((o-r|0)>=160){break}H=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=H}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;N=0.0}else{if(a[10984]|0){O=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;O=q}P=+k_(j,m,O);if((c[m>>2]|0)==(t|0)){N=P;break}c[k>>2]=4;N=0.0}}while(0);h[l>>3]=N;fy(p,x,c[s>>2]|0,k);do{if(C){Q=0}else{s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){R=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{R=c[s>>2]|0}if((R|0)!=-1){Q=z;break}c[y>>2]=0;Q=0}}while(0);y=(Q|0)==0;do{if(J){D=3088}else{z=c[I+12>>2]|0;if((z|0)==(c[I+16>>2]|0)){S=cc[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{S=c[z>>2]|0}if((S|0)==-1){c[f>>2]=0;D=3088;break}if(!(y^(I|0)==0)){break}T=b|0;c[T>>2]=Q;dQ(p);i=e;return}}while(0);do{if((D|0)==3088){if(y){break}T=b|0;c[T>>2]=Q;dQ(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;T=b|0;c[T>>2]=Q;dQ(p);i=e;return}function f7(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0.0,Q=0,R=0,S=0,T=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;f5(p,j,w,n,o);j=e+168|0;k2(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L3533:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cc[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);C=(z|0)==0;A=c[f>>2]|0;do{if((A|0)==0){D=3108}else{E=c[A+12>>2]|0;if((E|0)==(c[A+16>>2]|0)){F=cc[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=3108;break}else{E=(A|0)==0;if(C^E){G=A;H=E;break}else{I=A;J=E;break L3533}}}}while(0);if((D|0)==3108){D=0;if(C){I=0;J=1;break}else{G=0;H=1}}A=z+12|0;E=c[A>>2]|0;K=z+16|0;if((E|0)==(c[K>>2]|0)){L=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[E>>2]|0}if((f3(L,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){I=G;J=H;break}E=c[A>>2]|0;if((E|0)==(c[K>>2]|0)){K=c[(c[z>>2]|0)+40>>2]|0;cc[K&255](z)|0;o=z;continue}else{c[A>>2]=E+4;o=z;continue}}o=d[p]|0;if((o&1|0)==0){M=o>>>1}else{M=c[p+4>>2]|0}do{if((M|0)!=0){if((a[u]&1)==0){break}o=c[s>>2]|0;if((o-r|0)>=160){break}H=c[t>>2]|0;c[s>>2]=o+4;c[o>>2]=H}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;N=0.0}else{if(a[10984]|0){O=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;O=q}P=+k_(j,m,O);if((c[m>>2]|0)==(t|0)){N=P;break}c[k>>2]=4;N=0.0}}while(0);h[l>>3]=N;fy(p,x,c[s>>2]|0,k);do{if(C){Q=0}else{s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){R=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{R=c[s>>2]|0}if((R|0)!=-1){Q=z;break}c[y>>2]=0;Q=0}}while(0);y=(Q|0)==0;do{if(J){D=3148}else{z=c[I+12>>2]|0;if((z|0)==(c[I+16>>2]|0)){S=cc[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{S=c[z>>2]|0}if((S|0)==-1){c[f>>2]=0;D=3148;break}if(!(y^(I|0)==0)){break}T=b|0;c[T>>2]=Q;dQ(p);i=e;return}}while(0);do{if((D|0)==3148){if(y){break}T=b|0;c[T>>2]=Q;dQ(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;T=b|0;c[T>>2]=Q;dQ(p);i=e;return}function f8(a){a=a|0;dc(a|0);kW(a);return}function f9(a){a=a|0;dc(a|0);return}function ga(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;d=i;i=i+136|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+120|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;k2(m|0,0,12);ed(n,g);g=n|0;n=c[g>>2]|0;if((c[3660]|0)!=-1){c[k>>2]=14640;c[k+4>>2]=12;c[k+8>>2]=0;dV(14640,k,96)}k=(c[3661]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+48>>2]|0;cm[x&15](v,10864,10890,w)|0;v=c[g>>2]|0;dA(v)|0;v=o|0;k2(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L3618:while(1){do{if((z|0)==0){A=0}else{C=c[z+12>>2]|0;if((C|0)==(c[z+16>>2]|0)){D=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{D=c[C>>2]|0}if((D|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);E=(A|0)==0;C=c[y>>2]|0;do{if((C|0)==0){F=3178}else{G=c[C+12>>2]|0;if((G|0)==(c[C+16>>2]|0)){H=cc[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[y>>2]=0;F=3178;break}else{G=(C|0)==0;if(E^G){I=C;J=G;break}else{K=C;L=G;break L3618}}}}while(0);if((F|0)==3178){F=0;if(E){K=0;L=1;break}else{I=0;J=1}}C=A+12|0;G=c[C>>2]|0;M=A+16|0;if((G|0)==(c[M>>2]|0)){N=cc[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{N=c[G>>2]|0}if((fY(N,16,v,p,s,0,m,x,r,w)|0)!=0){K=I;L=J;break}G=c[C>>2]|0;if((G|0)==(c[M>>2]|0)){M=c[(c[A>>2]|0)+40>>2]|0;cc[M&255](A)|0;z=A;continue}else{c[C>>2]=G+4;z=A;continue}}a[o+39|0]=0;if(a[10984]|0){O=c[3322]|0}else{z=aT(1,1888,0)|0;c[3322]=z;a[10984]=1;O=z}if((fU(v,O,1800,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}do{if(E){P=0}else{z=c[A+12>>2]|0;if((z|0)==(c[A+16>>2]|0)){Q=cc[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{Q=c[z>>2]|0}if((Q|0)!=-1){P=A;break}c[u>>2]=0;P=0}}while(0);u=(P|0)==0;do{if(L){F=3210}else{v=c[K+12>>2]|0;if((v|0)==(c[K+16>>2]|0)){R=cc[c[(c[K>>2]|0)+36>>2]&255](K)|0}else{R=c[v>>2]|0}if((R|0)==-1){c[y>>2]=0;F=3210;break}if(!(u^(K|0)==0)){break}S=b|0;c[S>>2]=P;dQ(m);i=d;return}}while(0);do{if((F|0)==3210){if(u){break}S=b|0;c[S>>2]=P;dQ(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;S=b|0;c[S>>2]=P;dQ(m);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function gb(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[3192]|0;a[q+1|0]=a[3193|0]|0;a[q+2|0]=a[3194|0]|0;a[q+3|0]=a[3195|0]|0;a[q+4|0]=a[3196|0]|0;a[q+5|0]=a[3197|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=20;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=20;break}x=k+2|0}else if((q|0)==32){x=h}else{y=20}}while(0);if((y|0)==20){x=u}y=l|0;ed(o,f);gf(u,x,h,y,m,n,o);dA(c[o>>2]|0)|0;c[p>>2]=c[e>>2];da(b,p,y,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gc(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=43;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=43;break}x=l+2|0}else if((h|0)==32){x=j}else{y=43}}while(0);if((y|0)==43){x=u}y=m|0;ed(p,f);gf(u,x,j,y,n,o,p);dA(c[p>>2]|0)|0;c[q>>2]=c[e>>2];da(b,q,y,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gd(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cl[o&63](b,d,l,f,g,h&1);i=j;return}ed(m,f);f=m|0;m=c[f>>2]|0;if((c[3566]|0)!=-1){c[k>>2]=14264;c[k+4>>2]=12;c[k+8>>2]=0;dV(14264,k,96)}k=(c[3567]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;dA(o)|0;o=c[l>>2]|0;if(h){b9[c[o+24>>2]&127](n,d)}else{b9[c[o+28>>2]&127](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){p=d+1|0;q=p;r=p;s=n+8|0}else{p=n+8|0;q=c[p>>2]|0;r=d+1|0;s=p}p=e|0;d=n+4|0;t=q;u=l;while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}l=u&255;if((t|0)==(v+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){break}l=a[t]|0;w=c[p>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)!=(c[w+28>>2]|0)){c[x>>2]=y+1;a[y]=l;break}if((ca[c[(c[w>>2]|0)+52>>2]&63](w,l&255)|0)!=-1){break}c[p>>2]=0}}while(0);t=t+1|0;u=a[o]|0}c[b>>2]=c[p>>2];dQ(n);i=j;return}}while(0);j=bY(4)|0;kq(j);bq(j|0,9232,138)}function ge(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bK(b|0)|0;b=bJ(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bK(h|0)|0;i=f;return b|0}function gf(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3662]|0)!=-1){c[n>>2]=14648;c[n+4>>2]=12;c[n+8>>2]=0;dV(14648,n,96)}n=(c[3663]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}r=k;s=c[p>>2]|0;if((c[3566]|0)!=-1){c[m>>2]=14264;c[m+4>>2]=12;c[m+8>>2]=0;dV(14264,m,96)}m=(c[3567]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}t=s;b9[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;cm[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=ca[c[(c[k>>2]|0)+28>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=ca[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+1;a[y]=q;q=ca[c[(c[p>>2]|0)+28>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cc[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1;a[I]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0&1)+D|0;H=0}}while(0);F=ca[c[(c[p>>2]|0)+28>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-1|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=a[J]|0;a[J]=a[K]|0;a[K]=C;J=J+1|0;K=K-1|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;dQ(o);i=l;return}else{L=g+(e-b)|0;c[h>>2]=L;dQ(o);i=l;return}}function gg(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[3192]|0;a[q+1|0]=a[3193|0]|0;a[q+2|0]=a[3194|0]|0;a[q+3|0]=a[3195|0]|0;a[q+4|0]=a[3196|0]|0;a[q+5|0]=a[3197|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=156;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=156;break}x=k+2|0}else if((q|0)==32){x=h}else{y=156}}while(0);if((y|0)==156){x=u}y=l|0;ed(o,f);gf(u,x,h,y,m,n,o);dA(c[o>>2]|0)|0;c[p>>2]=c[e>>2];da(b,p,y,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==32){x=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=179;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=179;break}x=l+2|0}else{y=179}}while(0);if((y|0)==179){x=u}y=m|0;ed(p,f);gf(u,x,j,y,n,o,p);dA(c[p>>2]|0)|0;c[q>>2]=c[e>>2];da(b,q,y,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gi(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[10984]|0){z=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;z=l}if(y){A=gj(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{A=gj(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[10984]|0;if(y){if(z){C=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;C=l}D=gk(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[3322]|0}else{z=aT(1,1888,0)|0;c[3322]=z;a[10984]=1;E=z}D=gk(m,E,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}k$();z=c[m>>2]|0;F=D;G=z;H=z}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){I=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){J=230;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){J=230;break}I=H+2|0}else if((D|0)==32){I=A}else{J=230}}while(0);if((J|0)==230){I=H}do{if((H|0)==(k|0)){K=n|0;L=0;M=k}else{J=kM(F<<1)|0;if((J|0)!=0){K=J;L=J;M=H;break}k$();K=0;L=0;M=c[m>>2]|0}}while(0);ed(q,f);gm(M,I,A,K,o,p,q);dA(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];da(r,s,K,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((L|0)!=0){kN(L)}if((G|0)==0){i=d;return}kN(G);i=d;return}function gj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=bK(d|0)|0;d=bL(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}bK(j|0)|0;i=g;return d|0}function gk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bK(b|0)|0;b=b$(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bK(h|0)|0;i=f;return b|0}function gl(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[10984]|0){z=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;z=l}if(y){A=gj(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{A=gj(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[10984]|0;if(y){if(z){C=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;C=l}D=gk(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[3322]|0}else{z=aT(1,1888,0)|0;c[3322]=z;a[10984]=1;E=z}D=gk(m,E,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}k$();z=c[m>>2]|0;F=D;G=z;H=z}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){I=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){J=316;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){J=316;break}I=H+2|0}else if((D|0)==32){I=A}else{J=316}}while(0);if((J|0)==316){I=H}do{if((H|0)==(k|0)){K=n|0;L=0;M=k}else{J=kM(F<<1)|0;if((J|0)!=0){K=J;L=J;M=H;break}k$();K=0;L=0;M=c[m>>2]|0}}while(0);ed(q,f);gm(M,I,A,K,o,p,q);dA(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];da(r,s,K,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((L|0)!=0){kN(L)}if((G|0)==0){i=d;return}kN(G);i=d;return}function gm(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3662]|0)!=-1){c[n>>2]=14648;c[n+4>>2]=12;c[n+8>>2]=0;dV(14648,n,96)}n=(c[3663]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}r=k;s=c[p>>2]|0;if((c[3566]|0)!=-1){c[m>>2]=14264;c[m+4>>2]=12;c[m+8>>2]=0;dV(14264,m,96)}m=(c[3567]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}t=s;b9[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=ca[c[(c[k>>2]|0)+28>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=m;v=b+1|0}else{v=b}m=f;L419:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=370;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=370;break}p=k;n=ca[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=ca[c[(c[p>>2]|0)+28>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L419}u=a[q]|0;if(a[10984]|0){A=c[3322]|0}else{p=aT(1,1888,0)|0;c[3322]=p;a[10984]=1;A=p}if((a8(u<<24>>24|0,A|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=370}}while(0);L434:do{if((x|0)==370){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L434}A=a[w]|0;if(a[10984]|0){B=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;B=q}if((bQ(A<<24>>24|0,B|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=370}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){C=v>>>1}else{C=c[o+4>>2]|0}do{if((C|0)==0){v=c[j>>2]|0;B=c[(c[k>>2]|0)+32>>2]|0;cm[B&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){D=z;E=v}else{break}do{v=a[D]|0;a[D]=a[E]|0;a[E]=v;D=D+1|0;E=E-1|0;}while(D>>>0<E>>>0)}}while(0);v=cc[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){B=x+1|0;A=o+4|0;q=o+8|0;n=k;u=0;p=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?B:c[q>>2]|0)+p|0]|0)>0){if((u|0)!=(a[(G?B:c[q>>2]|0)+p|0]|0)){H=p;I=u;break}J=c[j>>2]|0;c[j>>2]=J+1;a[J]=v;J=d[w]|0;H=(p>>>0<(((J&1|0)==0?J>>>1:c[A>>2]|0)-1|0)>>>0&1)+p|0;I=0}else{H=p;I=u}}while(0);G=ca[c[(c[n>>2]|0)+28>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){u=I+1|0;p=H;F=G}else{break}}}F=g+(z-b)|0;p=c[j>>2]|0;if((F|0)==(p|0)){break}u=p-1|0;if(F>>>0<u>>>0){K=F;L=u}else{break}do{u=a[K]|0;a[K]=a[L]|0;a[L]=u;K=K+1|0;L=L-1|0;}while(K>>>0<L>>>0)}}while(0);L473:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=ca[c[(c[L>>2]|0)+28>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+1;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L473}}L=cc[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+1;a[H]=L;M=K+1|0}else{M=y}}while(0);cm[c[(c[k>>2]|0)+32>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;dQ(o);i=l;return}N=g+(e-b)|0;c[h>>2]=N;dQ(o);i=l;return}function gn(a){a=a|0;dc(a|0);kW(a);return}function go(a){a=a|0;dc(a|0);return}function gp(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[3192]|0;a[q+1|0]=a[3193|0]|0;a[q+2|0]=a[3194|0]|0;a[q+3|0]=a[3195|0]|0;a[q+4|0]=a[3196|0]|0;a[q+5|0]=a[3197|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=435;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=435;break}x=k+2|0}else{y=435}}while(0);if((y|0)==435){x=u}y=l|0;ed(o,f);gs(u,x,h,y,m,n,o);dA(c[o>>2]|0)|0;c[p>>2]=c[e>>2];gt(b,p,y,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gq(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[3200]|0;a[o+1|0]=a[3201|0]|0;a[o+2|0]=a[3202|0]|0;a[o+3|0]=a[3203|0]|0;a[o+4|0]=a[3204|0]|0;a[o+5|0]=a[3205|0]|0;p=k|0;if(a[10984]|0){q=c[3322]|0}else{r=aT(1,1888,0)|0;c[3322]=r;a[10984]=1;q=r}r=ge(p,q,o,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+r|0;o=c[f+4>>2]&176;do{if((o|0)==16){q=a[p]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){s=k+1|0;break}if(!((r|0)>1&q<<24>>24==48)){t=448;break}q=a[k+1|0]|0;if(!((q<<24>>24|0)==120|(q<<24>>24|0)==88)){t=448;break}s=k+2|0}else if((o|0)==32){s=h}else{t=448}}while(0);if((t|0)==448){s=p}ed(m,f);t=m|0;m=c[t>>2]|0;if((c[3662]|0)!=-1){c[j>>2]=14648;c[j+4>>2]=12;c[j+8>>2]=0;dV(14648,j,96)}j=(c[3663]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){q=c[o+(j<<2)>>2]|0;if((q|0)==0){break}u=q;v=c[t>>2]|0;dA(v)|0;v=l|0;w=c[(c[q>>2]|0)+32>>2]|0;cm[w&15](u,p,h,v)|0;u=l+r|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;da(b,n,v,x,u,f,g);i=d;return}x=l+(s-k)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;da(b,n,v,x,u,f,g);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function gr(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cl[o&63](b,d,l,f,g,h&1);i=j;return}ed(m,f);f=m|0;m=c[f>>2]|0;if((c[3564]|0)!=-1){c[k>>2]=14256;c[k+4>>2]=12;c[k+8>>2]=0;dV(14256,k,96)}k=(c[3565]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;dA(o)|0;o=c[l>>2]|0;if(h){b9[c[o+24>>2]&127](n,d)}else{b9[c[o+28>>2]&127](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;p=l;q=l;r=n+8|0}else{l=n+8|0;p=c[l>>2]|0;q=n+4|0;r=l}l=e|0;s=p;t=o;while(1){if((t&1)==0){u=q}else{u=c[r>>2]|0}o=t&255;if((o&1|0)==0){v=o>>>1}else{v=c[q>>2]|0}if((s|0)==(u+(v<<2)|0)){break}o=c[s>>2]|0;w=c[l>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)==(c[w+28>>2]|0)){z=ca[c[(c[w>>2]|0)+52>>2]&63](w,o)|0}else{c[x>>2]=y+4;c[y>>2]=o;z=o}if((z|0)!=-1){break}c[l>>2]=0}}while(0);s=s+4|0;t=a[d]|0}c[b>>2]=c[l>>2];d8(n);i=j;return}}while(0);j=bY(4)|0;kq(j);bq(j|0,9232,138)}function gs(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3660]|0)!=-1){c[n>>2]=14640;c[n+4>>2]=12;c[n+8>>2]=0;dV(14640,n,96)}n=(c[3661]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}r=k;s=c[p>>2]|0;if((c[3564]|0)!=-1){c[m>>2]=14256;c[m+4>>2]=12;c[m+8>>2]=0;dV(14256,m,96)}m=(c[3565]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}t=s;b9[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;cm[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=ca[c[(c[k>>2]|0)+44>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=ca[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+4;c[y>>2]=q;q=ca[c[(c[p>>2]|0)+44>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cc[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0&1)+D|0;H=0}}while(0);F=ca[c[(c[p>>2]|0)+44>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b<<2)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-4|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=c[J>>2]|0;c[J>>2]=c[K>>2];c[K>>2]=C;J=J+4|0;K=K-4|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;dQ(o);i=l;return}else{L=g+(e-b<<2)|0;c[h>>2]=L;dQ(o);i=l;return}}function gt(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cd[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){eo(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((cd[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){d8(l);break}c[m>>2]=0;c[b>>2]=0;d8(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((cd[c[(c[d>>2]|0)+48>>2]&63](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function gu(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=l|0;if(a[10984]|0){w=c[3322]|0}else{v=aT(1,1888,0)|0;c[3322]=v;a[10984]=1;w=v}v=ge(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=591;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=591;break}x=l+2|0}else if((h|0)==32){x=j}else{y=591}}while(0);if((y|0)==591){x=u}y=m|0;ed(p,f);gs(u,x,j,y,n,o,p);dA(c[p>>2]|0)|0;c[q>>2]=c[e>>2];gt(b,q,y,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gv(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[3192]|0;a[q+1|0]=a[3193|0]|0;a[q+2|0]=a[3194|0]|0;a[q+3|0]=a[3195|0]|0;a[q+4|0]=a[3196|0]|0;a[q+5|0]=a[3197|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=614;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=614;break}x=k+2|0}else{y=614}}while(0);if((y|0)==614){x=u}y=l|0;ed(o,f);gs(u,x,h,y,m,n,o);dA(c[o>>2]|0)|0;c[p>>2]=c[e>>2];gt(b,p,y,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gw(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;if(a[10984]|0){w=c[3322]|0}else{t=aT(1,1888,0)|0;c[3322]=t;a[10984]=1;w=t}t=ge(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=637;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=637;break}x=l+2|0}else if((h|0)==32){x=j}else{y=637}}while(0);if((y|0)==637){x=u}y=m|0;ed(p,f);gs(u,x,j,y,n,o,p);dA(c[p>>2]|0)|0;c[q>>2]=c[e>>2];gt(b,q,y,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gx(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[10984]|0){z=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;z=l}if(y){A=gj(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{A=gj(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[10984]|0;if(y){if(z){C=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;C=l}D=gk(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[3322]|0}else{z=aT(1,1888,0)|0;c[3322]=z;a[10984]=1;E=z}D=gk(m,E,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}k$();z=c[m>>2]|0;F=D;G=z;H=z}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==32){I=A}else if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){I=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){J=688;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){J=688;break}I=H+2|0}else{J=688}}while(0);if((J|0)==688){I=H}do{if((H|0)==(k|0)){K=n|0;L=0;M=k}else{J=kM(F<<3)|0;D=J;if((J|0)!=0){K=D;L=D;M=H;break}k$();K=D;L=D;M=c[m>>2]|0}}while(0);ed(q,f);gz(M,I,A,K,o,p,q);dA(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];gt(r,s,K,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((L|0)!=0){kN(L)}if((G|0)==0){i=d;return}kN(G);i=d;return}function gy(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[10984]|0){z=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;z=l}if(y){A=gj(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{A=gj(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[10984]|0;if(y){if(z){C=c[3322]|0}else{l=aT(1,1888,0)|0;c[3322]=l;a[10984]=1;C=l}D=gk(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[3322]|0}else{z=aT(1,1888,0)|0;c[3322]=z;a[10984]=1;E=z}D=gk(m,E,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}k$();z=c[m>>2]|0;F=D;G=z;H=z}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){I=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){J=757;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){J=757;break}I=H+2|0}else if((D|0)==32){I=A}else{J=757}}while(0);if((J|0)==757){I=H}do{if((H|0)==(k|0)){K=n|0;L=0;M=k}else{J=kM(F<<3)|0;D=J;if((J|0)!=0){K=D;L=D;M=H;break}k$();K=D;L=D;M=c[m>>2]|0}}while(0);ed(q,f);gz(M,I,A,K,o,p,q);dA(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];gt(r,s,K,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((L|0)!=0){kN(L)}if((G|0)==0){i=d;return}kN(G);i=d;return}function gz(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3660]|0)!=-1){c[n>>2]=14640;c[n+4>>2]=12;c[n+8>>2]=0;dV(14640,n,96)}n=(c[3661]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bY(4)|0;s=r;kq(s);bq(r|0,9232,138)}r=k;s=c[p>>2]|0;if((c[3564]|0)!=-1){c[m>>2]=14256;c[m+4>>2]=12;c[m+8>>2]=0;dV(14256,m,96)}m=(c[3565]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bY(4)|0;u=t;kq(u);bq(t|0,9232,138)}t=s;b9[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=ca[c[(c[k>>2]|0)+44>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=m;v=b+1|0}else{v=b}m=f;L951:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=811;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=811;break}p=k;n=ca[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=ca[c[(c[p>>2]|0)+44>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L951}u=a[q]|0;if(a[10984]|0){A=c[3322]|0}else{p=aT(1,1888,0)|0;c[3322]=p;a[10984]=1;A=p}if((a8(u<<24>>24|0,A|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=811}}while(0);L966:do{if((x|0)==811){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L966}A=a[w]|0;if(a[10984]|0){B=c[3322]|0}else{q=aT(1,1888,0)|0;c[3322]=q;a[10984]=1;B=q}if((bQ(A<<24>>24|0,B|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=811}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){C=v>>>1}else{C=c[o+4>>2]|0}do{if((C|0)==0){v=c[j>>2]|0;B=c[(c[k>>2]|0)+48>>2]|0;cm[B&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z<<2)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){D=z;E=v}else{break}do{v=a[D]|0;a[D]=a[E]|0;a[E]=v;D=D+1|0;E=E-1|0;}while(D>>>0<E>>>0)}}while(0);v=cc[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){B=x+1|0;A=o+4|0;q=o+8|0;n=k;u=0;p=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?B:c[q>>2]|0)+p|0]|0)>0){if((u|0)!=(a[(G?B:c[q>>2]|0)+p|0]|0)){H=p;I=u;break}J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=v;J=d[w]|0;H=(p>>>0<(((J&1|0)==0?J>>>1:c[A>>2]|0)-1|0)>>>0&1)+p|0;I=0}else{H=p;I=u}}while(0);G=ca[c[(c[n>>2]|0)+44>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){u=I+1|0;p=H;F=G}else{break}}}F=g+(z-b<<2)|0;p=c[j>>2]|0;if((F|0)==(p|0)){break}u=p-4|0;if(F>>>0<u>>>0){K=F;L=u}else{break}do{u=c[K>>2]|0;c[K>>2]=c[L>>2];c[L>>2]=u;K=K+4|0;L=L-4|0;}while(K>>>0<L>>>0)}}while(0);L1005:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=ca[c[(c[L>>2]|0)+44>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1005}}L=cc[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+4;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);cm[c[(c[k>>2]|0)+48>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M<<2)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;dQ(o);i=l;return}N=g+(e-b<<2)|0;c[h>>2]=N;dQ(o);i=l;return}function gA(a){a=a|0;return 2}function gB(a){a=a|0;dc(a|0);kW(a);return}function gC(a){a=a|0;dc(a|0);return}function gD(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];gG(a,b,k,l,f,g,h,3184,3192);i=j;return}function gE(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cc[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}gG(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function gF(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[3200]|0;a[o+1|0]=a[3201|0]|0;a[o+2|0]=a[3202|0]|0;a[o+3|0]=a[3203|0]|0;a[o+4|0]=a[3204|0]|0;a[o+5|0]=a[3205|0]|0;p=k|0;if(a[10984]|0){q=c[3322]|0}else{r=aT(1,1888,0)|0;c[3322]=r;a[10984]=1;q=r}r=ge(p,q,o,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+r|0;o=c[f+4>>2]&176;do{if((o|0)==16){q=a[p]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){s=k+1|0;break}if(!((r|0)>1&q<<24>>24==48)){t=875;break}q=a[k+1|0]|0;if(!((q<<24>>24|0)==120|(q<<24>>24|0)==88)){t=875;break}s=k+2|0}else if((o|0)==32){s=h}else{t=875}}while(0);if((t|0)==875){s=p}ed(m,f);t=m|0;m=c[t>>2]|0;if((c[3660]|0)!=-1){c[j>>2]=14640;c[j+4>>2]=12;c[j+8>>2]=0;dV(14640,j,96)}j=(c[3661]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){q=c[o+(j<<2)>>2]|0;if((q|0)==0){break}u=q;v=c[t>>2]|0;dA(v)|0;v=l|0;w=c[(c[q>>2]|0)+48>>2]|0;cm[w&15](u,p,h,v)|0;u=l+(r<<2)|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;gt(b,n,v,x,u,f,g);i=d;return}x=l+(s-k<<2)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;gt(b,n,v,x,u,f,g);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function gG(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;ed(p,h);t=p|0;p=c[t>>2]|0;if((c[3662]|0)!=-1){c[o>>2]=14648;c[o+4>>2]=12;c[o+8>>2]=0;dV(14648,o,96)}o=(c[3663]|0)-1|0;u=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-u>>2>>>0>o>>>0){v=c[u+(o<<2)>>2]|0;if((v|0)==0){break}w=v;x=c[t>>2]|0;dA(x)|0;c[j>>2]=0;x=f|0;L1066:do{if((l|0)==(m|0)){y=954}else{z=g|0;A=v;B=v+8|0;C=v;D=e;E=r|0;F=s|0;G=q|0;H=l;I=0;L1068:while(1){J=I;while(1){if((J|0)!=0){y=954;break L1066}K=c[x>>2]|0;do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}if((cc[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){L=K;break}c[x>>2]=0;L=0}}while(0);K=(L|0)==0;M=c[z>>2]|0;L1078:do{if((M|0)==0){y=907}else{do{if((c[M+12>>2]|0)==(c[M+16>>2]|0)){if((cc[c[(c[M>>2]|0)+36>>2]&255](M)|0)!=-1){break}c[z>>2]=0;y=907;break L1078}}while(0);if(K){N=M}else{y=908;break L1068}}}while(0);if((y|0)==907){y=0;if(K){y=908;break L1068}else{N=0}}if((cd[c[(c[A>>2]|0)+36>>2]&63](w,a[H]|0,0)|0)<<24>>24==37){y=911;break}M=a[H]|0;if(M<<24>>24>-1){O=c[B>>2]|0;if((b[O+(M<<24>>24<<1)>>1]&8192)!=0){P=H;y=922;break}}Q=L+12|0;M=c[Q>>2]|0;R=L+16|0;if((M|0)==(c[R>>2]|0)){S=(cc[c[(c[L>>2]|0)+36>>2]&255](L)|0)&255}else{S=a[M]|0}M=ca[c[(c[C>>2]|0)+12>>2]&63](w,S)|0;if(M<<24>>24==(ca[c[(c[C>>2]|0)+12>>2]&63](w,a[H]|0)|0)<<24>>24){y=949;break}c[j>>2]=4;J=4}L1096:do{if((y|0)==922){while(1){y=0;J=P+1|0;if((J|0)==(m|0)){T=m;break}M=a[J]|0;if(M<<24>>24<=-1){T=J;break}if((b[O+(M<<24>>24<<1)>>1]&8192)==0){T=J;break}else{P=J;y=922}}K=L;J=N;while(1){do{if((K|0)==0){U=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){U=K;break}if((cc[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){U=K;break}c[x>>2]=0;U=0}}while(0);M=(U|0)==0;do{if((J|0)==0){y=935}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(M){V=J;break}else{W=T;break L1096}}if((cc[c[(c[J>>2]|0)+36>>2]&255](J)|0)==-1){c[z>>2]=0;y=935;break}else{if(M^(J|0)==0){V=J;break}else{W=T;break L1096}}}}while(0);if((y|0)==935){y=0;if(M){W=T;break L1096}else{V=0}}X=U+12|0;Y=c[X>>2]|0;Z=U+16|0;if((Y|0)==(c[Z>>2]|0)){_=(cc[c[(c[U>>2]|0)+36>>2]&255](U)|0)&255}else{_=a[Y]|0}if(_<<24>>24<=-1){W=T;break L1096}if((b[(c[B>>2]|0)+(_<<24>>24<<1)>>1]&8192)==0){W=T;break L1096}Y=c[X>>2]|0;if((Y|0)==(c[Z>>2]|0)){Z=c[(c[U>>2]|0)+40>>2]|0;cc[Z&255](U)|0;K=U;J=V;continue}else{c[X>>2]=Y+1;K=U;J=V;continue}}}else if((y|0)==911){y=0;J=H+1|0;if((J|0)==(m|0)){y=912;break L1068}K=cd[c[(c[A>>2]|0)+36>>2]&63](w,a[J]|0,0)|0;if((K<<24>>24|0)==69|(K<<24>>24|0)==48){Y=H+2|0;if((Y|0)==(m|0)){y=915;break L1068}$=K;aa=cd[c[(c[A>>2]|0)+36>>2]&63](w,a[Y]|0,0)|0;ab=Y}else{$=0;aa=K;ab=J}J=c[(c[D>>2]|0)+36>>2]|0;c[E>>2]=L;c[F>>2]=N;cj[J&7](q,e,r,s,h,j,k,aa,$);c[x>>2]=c[G>>2];W=ab+1|0}else if((y|0)==949){y=0;J=c[Q>>2]|0;if((J|0)==(c[R>>2]|0)){K=c[(c[L>>2]|0)+40>>2]|0;cc[K&255](L)|0}else{c[Q>>2]=J+1}W=H+1|0}}while(0);if((W|0)==(m|0)){y=954;break L1066}H=W;I=c[j>>2]|0}if((y|0)==908){c[j>>2]=4;ac=L;break}else if((y|0)==912){c[j>>2]=4;ac=L;break}else if((y|0)==915){c[j>>2]=4;ac=L;break}}}while(0);if((y|0)==954){ac=c[x>>2]|0}w=f|0;do{if((ac|0)!=0){if((c[ac+12>>2]|0)!=(c[ac+16>>2]|0)){break}if((cc[c[(c[ac>>2]|0)+36>>2]&255](ac)|0)!=-1){break}c[w>>2]=0}}while(0);x=c[w>>2]|0;v=(x|0)==0;I=g|0;H=c[I>>2]|0;L1154:do{if((H|0)==0){y=964}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((cc[c[(c[H>>2]|0)+36>>2]&255](H)|0)!=-1){break}c[I>>2]=0;y=964;break L1154}}while(0);if(!v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);do{if((y|0)==964){if(v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ad=d|0;c[ad>>2]=x;i=n;return}}while(0);n=bY(4)|0;kq(n);bq(n|0,9232,138)}function gH(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;ed(m,f);f=m|0;m=c[f>>2]|0;if((c[3662]|0)!=-1){c[l>>2]=14648;c[l+4>>2]=12;c[l+8>>2]=0;dV(14648,l,96)}l=(c[3663]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dA(o)|0;o=c[e>>2]|0;q=b+8|0;r=cc[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(fv(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12&-1|0)%7&-1;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bY(4)|0;kq(j);bq(j|0,9232,138)}function gI(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;ed(m,f);f=m|0;m=c[f>>2]|0;if((c[3662]|0)!=-1){c[l>>2]=14648;c[l+4>>2]=12;c[l+8>>2]=0;dV(14648,l,96)}l=(c[3663]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dA(o)|0;o=c[e>>2]|0;q=b+8|0;r=cc[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(fv(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12&-1|0)%12&-1;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bY(4)|0;kq(j);bq(j|0,9232,138)}function gJ(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;ed(l,f);f=l|0;l=c[f>>2]|0;if((c[3662]|0)!=-1){c[k>>2]=14648;c[k+4>>2]=12;c[k+8>>2]=0;dV(14648,k,96)}k=(c[3663]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;dA(n)|0;c[j>>2]=c[e>>2];n=gO(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=bY(4)|0;kq(b);bq(b|0,9232,138)}function gK(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;ed(z,g);_=z|0;z=c[_>>2]|0;if((c[3662]|0)!=-1){c[y>>2]=14648;c[y+4>>2]=12;c[y+8>>2]=0;dV(14648,y,96)}y=(c[3663]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;dA(aa)|0;aa=k<<24>>24;L1218:do{if((aa|0)==121){c[n>>2]=c[f>>2];ac=gO(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ac|0)<69){ad=ac+2e3|0}else{ad=(ac-69|0)>>>0<31?ac+1900|0:ac}c[j+20>>2]=ad-1900}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=gO(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==100|(aa|0)==101){ac=j+12|0;c[v>>2]=c[f>>2];ae=gO(e,v,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ae-1|0)>>>0>=31){break}c[ac>>2]=ae;break L1218}}while(0);c[h>>2]=af|4}else if((aa|0)==106){c[s>>2]=c[f>>2];ae=gO(e,s,h,ab,3)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<366){c[j+28>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==119){c[o>>2]=c[f>>2];ac=gO(e,o,h,ab,1)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<7){c[j+24>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==120){ae=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];b7[ae&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==84){ae=e|0;c[S>>2]=c[ae>>2];c[T>>2]=c[f>>2];gG(R,d,S,T,g,h,j,3136,3144);c[ae>>2]=c[R>>2]}else if((aa|0)==109){c[r>>2]=c[f>>2];ae=(gO(e,r,h,ab,2)|0)-1|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<12){c[j+16>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==73){ac=j+8|0;c[t>>2]=c[f>>2];ae=gO(e,t,h,ab,2)|0;ag=c[h>>2]|0;do{if((ag&4|0)==0){if((ae-1|0)>>>0>=12){break}c[ac>>2]=ae;break L1218}}while(0);c[h>>2]=ag|4}else if((aa|0)==88){ae=d+8|0;ac=cc[c[(c[ae>>2]|0)+24>>2]&255](ae)|0;ae=e|0;c[X>>2]=c[ae>>2];c[Y>>2]=c[f>>2];af=ac;ah=a[ac]|0;if((ah&1)==0){ai=af+1|0;aj=af+1|0}else{af=c[ac+8>>2]|0;ai=af;aj=af}af=ah&255;if((af&1|0)==0){ak=af>>>1}else{ak=c[ac+4>>2]|0}gG(W,d,X,Y,g,h,j,aj,ai+ak|0);c[ae>>2]=c[W>>2]}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ae=c[f>>2]|0;ac=d+8|0;af=cc[c[(c[ac>>2]|0)+4>>2]&255](ac)|0;c[w>>2]=ae;ae=(fv(e,w,af,af+288|0,ab,h,0)|0)-af|0;if((ae|0)>=288){break}c[j+16>>2]=((ae|0)/12&-1|0)%12&-1}else if((aa|0)==99){ae=d+8|0;af=cc[c[(c[ae>>2]|0)+12>>2]&255](ae)|0;ae=e|0;c[B>>2]=c[ae>>2];c[C>>2]=c[f>>2];ac=af;ah=a[af]|0;if((ah&1)==0){al=ac+1|0;am=ac+1|0}else{ac=c[af+8>>2]|0;al=ac;am=ac}ac=ah&255;if((ac&1|0)==0){an=ac>>>1}else{an=c[af+4>>2]|0}gG(A,d,B,C,g,h,j,am,al+an|0);c[ae>>2]=c[A>>2]}else if((aa|0)==77){c[q>>2]=c[f>>2];ae=gO(e,q,h,ab,2)|0;af=c[h>>2]|0;if((af&4|0)==0&(ae|0)<60){c[j+4>>2]=ae;break}else{c[h>>2]=af|4;break}}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];gL(0,e,J,h,ab)}else if((aa|0)==68){af=e|0;c[E>>2]=c[af>>2];c[F>>2]=c[f>>2];gG(D,d,E,F,g,h,j,3176,3184);c[af>>2]=c[D>>2]}else if((aa|0)==70){af=e|0;c[H>>2]=c[af>>2];c[I>>2]=c[f>>2];gG(G,d,H,I,g,h,j,3168,3176);c[af>>2]=c[G>>2]}else if((aa|0)==72){c[u>>2]=c[f>>2];af=gO(e,u,h,ab,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(af|0)<24){c[j+8>>2]=af;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==112){c[K>>2]=c[f>>2];gM(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ae=e|0;c[M>>2]=c[ae>>2];c[N>>2]=c[f>>2];gG(L,d,M,N,g,h,j,3152,3163);c[ae>>2]=c[L>>2]}else if((aa|0)==82){ae=e|0;c[P>>2]=c[ae>>2];c[Q>>2]=c[f>>2];gG(O,d,P,Q,g,h,j,3144,3149);c[ae>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ae=gO(e,p,h,ab,2)|0;af=c[h>>2]|0;if((af&4|0)==0&(ae|0)<61){c[j>>2]=ae;break}else{c[h>>2]=af|4;break}}else if((aa|0)==97|(aa|0)==65){af=c[f>>2]|0;ae=d+8|0;ac=cc[c[c[ae>>2]>>2]&255](ae)|0;c[x>>2]=af;af=(fv(e,x,ac,ac+168|0,ab,h,0)|0)-ac|0;if((af|0)>=168){break}c[j+24>>2]=((af|0)/12&-1|0)%7&-1}else if((aa|0)==37){c[Z>>2]=c[f>>2];gN(0,e,Z,h,ab)}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=bY(4)|0;kq(l);bq(l|0,9232,138)}function gL(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L1299:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((cc[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L1308:do{if((l|0)==0){m=1093}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((cc[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[e>>2]=0;m=1093;break L1308}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L1299}}}while(0);if((m|0)==1093){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(cc[c[(c[l>>2]|0)+36>>2]&255](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cc[u&255](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((cc[c[(c[o>>2]|0)+36>>2]&255](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=1112}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((cc[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[e>>2]=0;m=1112;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==1112){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function gM(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cc[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=fv(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function gN(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((cc[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L1382:do{if((e|0)==0){k=1150}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cc[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[j>>2]=0;k=1150;break L1382}}while(0);if(d){l=e;m=0}else{k=1151}}}while(0);if((k|0)==1150){if(d){k=1151}else{l=0;m=1}}if((k|0)==1151){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(cc[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{n=a[e]|0}if((cd[c[(c[g>>2]|0)+36>>2]&63](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;cc[d&255](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((cc[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=1170}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((cc[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[j>>2]=0;k=1170;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==1170){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function gO(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((cc[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L1436:do{if((e|0)==0){m=1190}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cc[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[l>>2]=0;m=1190;break L1436}}while(0);if(d){n=e}else{m=1191}}}while(0);if((m|0)==1190){if(d){m=1191}else{n=0}}if((m|0)==1191){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(cc[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(cd[c[(c[d>>2]|0)+36>>2]&63](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cc[u&255](r)|0;v=q;w=h;x=n}else{c[s>>2]=t+1;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((cc[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((cc[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=1220;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=(cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=1236;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=1237;break}s=((cd[c[(c[d>>2]|0)+36>>2]&63](g,E,0)|0)<<24>>24)+(y*10&-1)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;cc[G&255](r)|0;v=s;w=q;x=B;continue}else{c[u>>2]=F+1;v=s;w=q;x=B;continue}}if((m|0)==1236){i=j;return o|0}else if((m|0)==1237){i=j;return o|0}else if((m|0)==1220){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L1495:do{if(D){m=1230}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[l>>2]=0;m=1230;break L1495}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==1230){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function gP(a){a=a|0;return 2}function gQ(a){a=a|0;dc(a|0);kW(a);return}function gR(a){a=a|0;dc(a|0);return}function gS(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];gU(a,b,k,l,f,g,h,3104,3136);i=j;return}function gT(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cc[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}gU(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function gU(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+48|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=l+40|0;ed(n,f);r=n|0;n=c[r>>2]|0;if((c[3660]|0)!=-1){c[m>>2]=14640;c[m+4>>2]=12;c[m+8>>2]=0;dV(14640,m,96)}m=(c[3661]|0)-1|0;s=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-s>>2>>>0>m>>>0){t=c[s+(m<<2)>>2]|0;if((t|0)==0){break}u=t;v=c[r>>2]|0;dA(v)|0;c[g>>2]=0;v=d|0;L1529:do{if((j|0)==(k|0)){w=1321}else{x=e|0;y=t;z=t;A=t;B=b;C=p|0;D=q|0;E=o|0;F=j;G=0;L1531:while(1){H=G;while(1){if((H|0)!=0){w=1321;break L1529}I=c[v>>2]|0;do{if((I|0)==0){J=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){L=cc[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{L=c[K>>2]|0}if((L|0)!=-1){J=I;break}c[v>>2]=0;J=0}}while(0);I=(J|0)==0;K=c[x>>2]|0;do{if((K|0)==0){w=1273}else{M=c[K+12>>2]|0;if((M|0)==(c[K+16>>2]|0)){N=cc[c[(c[K>>2]|0)+36>>2]&255](K)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[x>>2]=0;w=1273;break}else{if(I^(K|0)==0){O=K;break}else{w=1275;break L1531}}}}while(0);if((w|0)==1273){w=0;if(I){w=1275;break L1531}else{O=0}}if((cd[c[(c[y>>2]|0)+52>>2]&63](u,c[F>>2]|0,0)|0)<<24>>24==37){w=1278;break}if(cd[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[F>>2]|0)|0){P=F;w=1288;break}Q=J+12|0;K=c[Q>>2]|0;R=J+16|0;if((K|0)==(c[R>>2]|0)){S=cc[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[K>>2]|0}K=ca[c[(c[A>>2]|0)+28>>2]&63](u,S)|0;if((K|0)==(ca[c[(c[A>>2]|0)+28>>2]&63](u,c[F>>2]|0)|0)){w=1316;break}c[g>>2]=4;H=4}L1563:do{if((w|0)==1316){w=0;H=c[Q>>2]|0;if((H|0)==(c[R>>2]|0)){K=c[(c[J>>2]|0)+40>>2]|0;cc[K&255](J)|0}else{c[Q>>2]=H+4}T=F+4|0}else if((w|0)==1288){while(1){w=0;H=P+4|0;if((H|0)==(k|0)){U=k;break}if(cd[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[H>>2]|0)|0){P=H;w=1288}else{U=H;break}}I=J;H=O;while(1){do{if((I|0)==0){V=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){W=cc[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{W=c[K>>2]|0}if((W|0)!=-1){V=I;break}c[v>>2]=0;V=0}}while(0);K=(V|0)==0;do{if((H|0)==0){w=1303}else{M=c[H+12>>2]|0;if((M|0)==(c[H+16>>2]|0)){X=cc[c[(c[H>>2]|0)+36>>2]&255](H)|0}else{X=c[M>>2]|0}if((X|0)==-1){c[x>>2]=0;w=1303;break}else{if(K^(H|0)==0){Y=H;break}else{T=U;break L1563}}}}while(0);if((w|0)==1303){w=0;if(K){T=U;break L1563}else{Y=0}}M=V+12|0;Z=c[M>>2]|0;_=V+16|0;if((Z|0)==(c[_>>2]|0)){$=cc[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{$=c[Z>>2]|0}if(!(cd[c[(c[z>>2]|0)+12>>2]&63](u,8192,$)|0)){T=U;break L1563}Z=c[M>>2]|0;if((Z|0)==(c[_>>2]|0)){_=c[(c[V>>2]|0)+40>>2]|0;cc[_&255](V)|0;I=V;H=Y;continue}else{c[M>>2]=Z+4;I=V;H=Y;continue}}}else if((w|0)==1278){w=0;H=F+4|0;if((H|0)==(k|0)){w=1279;break L1531}I=cd[c[(c[y>>2]|0)+52>>2]&63](u,c[H>>2]|0,0)|0;if((I<<24>>24|0)==69|(I<<24>>24|0)==48){Z=F+8|0;if((Z|0)==(k|0)){w=1282;break L1531}aa=I;ab=cd[c[(c[y>>2]|0)+52>>2]&63](u,c[Z>>2]|0,0)|0;ac=Z}else{aa=0;ab=I;ac=H}H=c[(c[B>>2]|0)+36>>2]|0;c[C>>2]=J;c[D>>2]=O;cj[H&7](o,b,p,q,f,g,h,ab,aa);c[v>>2]=c[E>>2];T=ac+4|0}}while(0);if((T|0)==(k|0)){w=1321;break L1529}F=T;G=c[g>>2]|0}if((w|0)==1282){c[g>>2]=4;ad=J;break}else if((w|0)==1275){c[g>>2]=4;ad=J;break}else if((w|0)==1279){c[g>>2]=4;ad=J;break}}}while(0);if((w|0)==1321){ad=c[v>>2]|0}u=d|0;do{if((ad|0)!=0){t=c[ad+12>>2]|0;if((t|0)==(c[ad+16>>2]|0)){ae=cc[c[(c[ad>>2]|0)+36>>2]&255](ad)|0}else{ae=c[t>>2]|0}if((ae|0)!=-1){break}c[u>>2]=0}}while(0);v=c[u>>2]|0;t=(v|0)==0;G=e|0;F=c[G>>2]|0;do{if((F|0)==0){w=1334}else{E=c[F+12>>2]|0;if((E|0)==(c[F+16>>2]|0)){af=cc[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{af=c[E>>2]|0}if((af|0)==-1){c[G>>2]=0;w=1334;break}if(!(t^(F|0)==0)){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);do{if((w|0)==1334){if(t){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ag=a|0;c[ag>>2]=v;i=l;return}}while(0);l=bY(4)|0;kq(l);bq(l|0,9232,138)}function gV(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;ed(m,f);f=m|0;m=c[f>>2]|0;if((c[3660]|0)!=-1){c[l>>2]=14640;c[l+4>>2]=12;c[l+8>>2]=0;dV(14640,l,96)}l=(c[3661]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dA(o)|0;o=c[e>>2]|0;q=b+8|0;r=cc[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(fW(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12&-1|0)%7&-1;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bY(4)|0;kq(j);bq(j|0,9232,138)}function gW(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;ed(m,f);f=m|0;m=c[f>>2]|0;if((c[3660]|0)!=-1){c[l>>2]=14640;c[l+4>>2]=12;c[l+8>>2]=0;dV(14640,l,96)}l=(c[3661]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dA(o)|0;o=c[e>>2]|0;q=b+8|0;r=cc[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(fW(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12&-1|0)%12&-1;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bY(4)|0;kq(j);bq(j|0,9232,138)}function gX(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;ed(l,f);f=l|0;l=c[f>>2]|0;if((c[3660]|0)!=-1){c[k>>2]=14640;c[k+4>>2]=12;c[k+8>>2]=0;dV(14640,k,96)}k=(c[3661]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;dA(n)|0;c[j>>2]=c[e>>2];n=g0(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=bY(4)|0;kq(b);bq(b|0,9232,138)}function gY(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L1687:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=cc[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=1394}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=cc[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=1394;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L1687}}}}while(0);if((m|0)==1394){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=cc[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{s=c[k>>2]|0}if(!(cd[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;cc[u&255](k)|0;continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=cc[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=1416}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=cc[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=1416;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==1416){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function gZ(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;ed(z,g);_=z|0;z=c[_>>2]|0;if((c[3660]|0)!=-1){c[y>>2]=14640;c[y+4>>2]=12;c[y+8>>2]=0;dV(14640,y,96)}y=(c[3661]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;dA(aa)|0;aa=k<<24>>24;L1752:do{if((aa|0)==121){c[n>>2]=c[f>>2];ac=g0(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ac|0)<69){ad=ac+2e3|0}else{ad=(ac-69|0)>>>0<31?ac+1900|0:ac}c[j+20>>2]=ad-1900}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=g0(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==37){c[Z>>2]=c[f>>2];g$(0,e,Z,h,ab)}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];gY(0,e,J,h,ab)}else if((aa|0)==84){ac=e|0;c[S>>2]=c[ac>>2];c[T>>2]=c[f>>2];gU(R,d,S,T,g,h,j,2968,3e3);c[ac>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ac=g0(e,o,h,ab,1)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<7){c[j+24>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==72){c[u>>2]=c[f>>2];ae=g0(e,u,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<24){c[j+8>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==112){c[K>>2]=c[f>>2];g_(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ac=e|0;c[M>>2]=c[ac>>2];c[N>>2]=c[f>>2];gU(L,d,M,N,g,h,j,3024,3068);c[ac>>2]=c[L>>2]}else if((aa|0)==82){ac=e|0;c[P>>2]=c[ac>>2];c[Q>>2]=c[f>>2];gU(O,d,P,Q,g,h,j,3e3,3020);c[ac>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ac=g0(e,p,h,ab,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<61){c[j>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==73){ae=j+8|0;c[t>>2]=c[f>>2];ac=g0(e,t,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ac-1|0)>>>0>=12){break}c[ae>>2]=ac;break L1752}}while(0);c[h>>2]=af|4}else if((aa|0)==106){c[s>>2]=c[f>>2];ac=g0(e,s,h,ab,3)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<366){c[j+28>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==100|(aa|0)==101){ae=j+12|0;c[v>>2]=c[f>>2];ac=g0(e,v,h,ab,2)|0;ag=c[h>>2]|0;do{if((ag&4|0)==0){if((ac-1|0)>>>0>=31){break}c[ae>>2]=ac;break L1752}}while(0);c[h>>2]=ag|4}else if((aa|0)==120){ac=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];b7[ac&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==68){ac=e|0;c[E>>2]=c[ac>>2];c[F>>2]=c[f>>2];gU(D,d,E,F,g,h,j,3072,3104);c[ac>>2]=c[D>>2]}else if((aa|0)==70){ac=e|0;c[H>>2]=c[ac>>2];c[I>>2]=c[f>>2];gU(G,d,H,I,g,h,j,2936,2968);c[ac>>2]=c[G>>2]}else if((aa|0)==77){c[q>>2]=c[f>>2];ac=g0(e,q,h,ab,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<60){c[j+4>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==97|(aa|0)==65){ae=c[f>>2]|0;ac=d+8|0;af=cc[c[c[ac>>2]>>2]&255](ac)|0;c[x>>2]=ae;ae=(fW(e,x,af,af+168|0,ab,h,0)|0)-af|0;if((ae|0)>=168){break}c[j+24>>2]=((ae|0)/12&-1|0)%7&-1}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ae=c[f>>2]|0;af=d+8|0;ac=cc[c[(c[af>>2]|0)+4>>2]&255](af)|0;c[w>>2]=ae;ae=(fW(e,w,ac,ac+288|0,ab,h,0)|0)-ac|0;if((ae|0)>=288){break}c[j+16>>2]=((ae|0)/12&-1|0)%12&-1}else if((aa|0)==99){ae=d+8|0;ac=cc[c[(c[ae>>2]|0)+12>>2]&255](ae)|0;ae=e|0;c[B>>2]=c[ae>>2];c[C>>2]=c[f>>2];af=a[ac]|0;if((af&1)==0){ah=ac+4|0;ai=ac+4|0}else{aj=c[ac+8>>2]|0;ah=aj;ai=aj}aj=af&255;if((aj&1|0)==0){ak=aj>>>1}else{ak=c[ac+4>>2]|0}gU(A,d,B,C,g,h,j,ai,ah+(ak<<2)|0);c[ae>>2]=c[A>>2]}else if((aa|0)==109){c[r>>2]=c[f>>2];ae=(g0(e,r,h,ab,2)|0)-1|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<12){c[j+16>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==88){ac=d+8|0;ae=cc[c[(c[ac>>2]|0)+24>>2]&255](ac)|0;ac=e|0;c[X>>2]=c[ac>>2];c[Y>>2]=c[f>>2];aj=a[ae]|0;if((aj&1)==0){al=ae+4|0;am=ae+4|0}else{af=c[ae+8>>2]|0;al=af;am=af}af=aj&255;if((af&1|0)==0){an=af>>>1}else{an=c[ae+4>>2]|0}gU(W,d,X,Y,g,h,j,am,al+(an<<2)|0);c[ac>>2]=c[W>>2]}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=bY(4)|0;kq(l);bq(l|0,9232,138)}function g_(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cc[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=fW(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function g$(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=cc[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=1529}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=cc[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=1529;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=1531;break}}}}while(0);if((l|0)==1529){if(h){l=1531}else{n=0;o=1}}if((l|0)==1531){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=cc[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{p=c[d>>2]|0}if((cd[c[(c[f>>2]|0)+52>>2]&63](f,p,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;cc[h&255](p)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=cc[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=1553}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=cc[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=1553;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==1553){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function g0(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=cc[c[(c[a>>2]|0)+36>>2]&255](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=1575}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=cc[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=1575;break}else{if(j^(b|0)==0){o=b;break}else{m=1577;break}}}}while(0);if((m|0)==1575){if(j){m=1577}else{o=0}}if((m|0)==1577){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=cc[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{q=c[b>>2]|0}b=e;if(!(cd[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(cd[c[(c[j>>2]|0)+52>>2]&63](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;cc[r&255](q)|0;s=n;t=f;u=o}else{c[a>>2]=k+4;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=cc[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=cc[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=cc[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{D=c[f>>2]|0}if(!(cd[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=1627;break}f=((cd[c[(c[j>>2]|0)+52>>2]&63](e,D,0)|0)<<24>>24)+(v*10&-1)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;cc[q&255](n)|0;s=f;t=o;u=z;continue}else{c[k>>2]=a+4;s=f;t=o;u=z;continue}}if((m|0)==1627){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=cc[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=1621}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=1621;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==1621){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function g1(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2];f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=bp(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=ca[c[(c[s>>2]|0)+52>>2]&63](s,m&255)|0}else{c[l>>2]=j+1;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function g2(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2];e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400;hS(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=ca[c[(c[o>>2]|0)+52>>2]&63](o,l)|0}else{c[k>>2]=d+4;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function g3(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bd(b|0)}dc(a|0);kW(a);return}function g4(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bd(b|0)}dc(a|0);return}function g5(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bd(b|0)}dc(a|0);kW(a);return}function g6(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bd(b|0)}dc(a|0);return}function g7(a){a=a|0;return 127}function g8(a){a=a|0;return 127}function g9(a){a=a|0;return 0}function ha(a){a=a|0;return 127}function hb(a){a=a|0;return 127}function hc(a){a=a|0;return 0}function hd(a){a=a|0;return 2147483647}function he(a){a=a|0;return 2147483647}function hf(a){a=a|0;return 0}function hg(a){a=a|0;return 2147483647}function hh(a){a=a|0;return 2147483647}function hi(a){a=a|0;return 0}function hj(a){a=a|0;return}function hk(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hl(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hm(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hn(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function ho(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hp(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hq(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hr(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hs(a){a=a|0;dc(a|0);kW(a);return}function ht(a){a=a|0;dc(a|0);return}function hu(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hv(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hw(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hx(a,b){a=a|0;b=b|0;dZ(a,1,45);return}function hy(a){a=a|0;dc(a|0);kW(a);return}function hz(a){a=a|0;dc(a|0);return}function hA(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hB(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hC(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hD(a,b){a=a|0;b=b|0;dZ(a,1,45);return}function hE(a){a=a|0;dc(a|0);kW(a);return}function hF(a){a=a|0;dc(a|0);return}function hG(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hH(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hI(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hJ(a,b){a=a|0;b=b|0;eo(a,1,45);return}function hK(a){a=a|0;dc(a|0);kW(a);return}function hL(a){a=a|0;dc(a|0);return}function hM(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hN(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hO(a,b){a=a|0;b=b|0;k2(a|0,0,12);return}function hP(a,b){a=a|0;b=b|0;eo(a,1,45);return}function hQ(a){a=a|0;dc(a|0);kW(a);return}function hR(a){a=a|0;dc(a|0);return}function hS(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;bp(n|0,100,o|0,f|0,c[g>>2]|0)|0;c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=bK(c[g>>2]|0)|0;g=kr(d,m,n,l)|0;if((f|0)!=0){bK(f|0)|0}if((g|0)==-1){hY(1328)}else{c[e>>2]=d+(g<<2);i=j;return}}function hT(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+280|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=d+176|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=172;w=m+100|0;ed(p,h);m=p|0;x=c[m>>2]|0;if((c[3662]|0)!=-1){c[l>>2]=14648;c[l+4>>2]=12;c[l+8>>2]=0;dV(14648,l,96)}l=(c[3663]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2];do{if(hU(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+32>>2]|0;cm[E&15](A,2920,2930,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>98){I=kM(H+2|0)|0;if((I|0)!=0){J=I;K=I;break}k$();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+10|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((a[O]|0)==(a[N]|0)){P=O;break}else{O=O+1|0}}a[M]=a[2920+(P-I)|0]|0;O=N+1|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((bM(E|0,2072,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((K|0)==0){break}kN(K);break}N=bY(8)|0;dF(N,2e3);bq(N|0,9248,22)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){S=z;break}if((cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[C>>2]|0;do{if((z|0)==0){T=1773}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{T=1775;break}}if((cc[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[C>>2]=0;T=1773;break}else{if(A^(z|0)==0){break}else{T=1775;break}}}}while(0);if((T|0)==1773){if(A){T=1775}}if((T|0)==1775){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;dA(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}b8[c[v>>2]&511](z);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function hU(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0;q=i;i=i+440|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2];r=q|0;s=q+400|0;t=q+408|0;u=q+416|0;v=q+424|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=r|0;k2(w|0,0,12);E=x;F=y;G=z;H=A;k2(E|0,0,12);k2(F|0,0,12);k2(G|0,0,12);k2(H|0,0,12);h_(g,h,s,t,u,v,x,y,z,B);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=f|0;f=m+8|0;m=z+1|0;I=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+4|0;P=x+8|0;Q=A+1|0;R=A+4|0;S=A+8|0;T=s+3|0;U=n+4|0;n=v+4|0;V=p;p=172;W=D;X=D;D=r+400|0;r=0;Y=0;L2182:while(1){Z=c[g>>2]|0;do{if((Z|0)==0){_=0}else{if((c[Z+12>>2]|0)!=(c[Z+16>>2]|0)){_=Z;break}if((cc[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)==-1){c[g>>2]=0;_=0;break}else{_=c[g>>2]|0;break}}}while(0);Z=(_|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=1800}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=2052;break L2182}}if((cc[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=1800;break}else{if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=2052;break L2182}}}}while(0);if((aa|0)==1800){aa=0;if(Z){ac=p;ad=W;ae=X;af=r;aa=2052;break}else{ab=0}}$=a[s+Y|0]|0;do{if(($|0)==1){if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=2052;break L2182}ag=c[g>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){ai=(cc[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{ai=a[ah]|0}if(ai<<24>>24<=-1){aa=1825;break L2182}if((b[(c[f>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){aa=1825;break L2182}ah=c[g>>2]|0;ag=ah+12|0;aj=c[ag>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=(cc[c[(c[ah>>2]|0)+40>>2]&255](ah)|0)&255}else{c[ag>>2]=aj+1;ak=a[aj]|0}dT(A,ak);aa=1826}else if(($|0)==0){aa=1826}else if(($|0)==3){aj=a[F]|0;ag=aj&255;ah=(ag&1|0)==0?ag>>>1:c[L>>2]|0;ag=a[G]|0;al=ag&255;am=(al&1|0)==0?al>>>1:c[I>>2]|0;if((ah|0)==(-am|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}al=(ah|0)==0;ah=c[g>>2]|0;at=c[ah+12>>2]|0;au=c[ah+16>>2]|0;av=(at|0)==(au|0);if(!(al|(am|0)==0)){if(av){am=(cc[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aw=c[g>>2]|0;ax=am;ay=a[F]|0;az=aw;aA=c[aw+12>>2]|0;aB=c[aw+16>>2]|0}else{ax=a[at]|0;ay=aj;az=ah;aA=at;aB=au}au=az+12|0;aw=(aA|0)==(aB|0);if(ax<<24>>24==(a[(ay&1)==0?K:c[M>>2]|0]|0)){if(aw){am=c[(c[az>>2]|0)+40>>2]|0;cc[am&255](az)|0}else{c[au>>2]=aA+1}au=d[F]|0;an=((au&1|0)==0?au>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(aw){aC=(cc[c[(c[az>>2]|0)+36>>2]&255](az)|0)&255}else{aC=a[aA]|0}if(aC<<24>>24!=(a[(a[G]&1)==0?m:c[J>>2]|0]|0)){aa=1892;break L2182}aw=c[g>>2]|0;au=aw+12|0;am=c[au>>2]|0;if((am|0)==(c[aw+16>>2]|0)){aD=c[(c[aw>>2]|0)+40>>2]|0;cc[aD&255](aw)|0}else{c[au>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(al){if(av){al=(cc[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aE=al;aF=a[G]|0}else{aE=a[at]|0;aF=ag}if(aE<<24>>24!=(a[(aF&1)==0?m:c[J>>2]|0]|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}ag=c[g>>2]|0;al=ag+12|0;am=c[al>>2]|0;if((am|0)==(c[ag+16>>2]|0)){au=c[(c[ag>>2]|0)+40>>2]|0;cc[au&255](ag)|0}else{c[al>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(av){av=(cc[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aG=av;aH=a[F]|0}else{aG=a[at]|0;aH=aj}if(aG<<24>>24!=(a[(aH&1)==0?K:c[M>>2]|0]|0)){a[l]=1;an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}aj=c[g>>2]|0;at=aj+12|0;av=c[at>>2]|0;if((av|0)==(c[aj+16>>2]|0)){ah=c[(c[aj>>2]|0)+40>>2]|0;cc[ah&255](aj)|0}else{c[at>>2]=av+1}av=d[F]|0;an=((av&1|0)==0?av>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V}else if(($|0)==2){if(!((r|0)!=0|Y>>>0<2)){if((Y|0)==2){aI=(a[T]|0)!=0}else{aI=0}if(!(N|aI)){an=0;ao=D;ap=X;aq=W;ar=p;as=V;break}}av=a[E]|0;at=(av&1)==0?j:c[P>>2]|0;L2278:do{if((Y|0)==0){aJ=at}else{if((d[s+(Y-1)|0]|0)>=2){aJ=at;break}aj=av&255;ah=at+((aj&1|0)==0?aj>>>1:c[O>>2]|0)|0;aj=at;while(1){if((aj|0)==(ah|0)){aK=ah;break}am=a[aj]|0;if(am<<24>>24<=-1){aK=aj;break}if((b[(c[f>>2]|0)+(am<<24>>24<<1)>>1]&8192)==0){aK=aj;break}else{aj=aj+1|0}}aj=aK-at|0;ah=a[H]|0;am=ah&255;al=(am&1|0)==0?am>>>1:c[R>>2]|0;if(aj>>>0>al>>>0){aJ=at;break}am=(ah&1)==0?Q:c[S>>2]|0;ah=am+al|0;if((aK|0)==(at|0)){aJ=at;break}ag=at;au=am+(al-aj)|0;while(1){if((a[au]|0)!=(a[ag]|0)){aJ=at;break L2278}aj=au+1|0;if((aj|0)==(ah|0)){aJ=aK;break}else{ag=ag+1|0;au=aj}}}}while(0);au=av&255;L2292:do{if((aJ|0)==(at+((au&1|0)==0?au>>>1:c[O>>2]|0)|0)){aL=aJ}else{ag=ab;ah=aJ;while(1){aj=c[g>>2]|0;do{if((aj|0)==0){aM=0}else{if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){aM=aj;break}if((cc[c[(c[aj>>2]|0)+36>>2]&255](aj)|0)==-1){c[g>>2]=0;aM=0;break}else{aM=c[g>>2]|0;break}}}while(0);aj=(aM|0)==0;do{if((ag|0)==0){aa=1921}else{if((c[ag+12>>2]|0)!=(c[ag+16>>2]|0)){if(aj){aN=ag;break}else{aL=ah;break L2292}}if((cc[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)==-1){c[e>>2]=0;aa=1921;break}else{if(aj){aN=ag;break}else{aL=ah;break L2292}}}}while(0);if((aa|0)==1921){aa=0;if(aj){aL=ah;break L2292}else{aN=0}}al=c[g>>2]|0;am=c[al+12>>2]|0;if((am|0)==(c[al+16>>2]|0)){aO=(cc[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aO=a[am]|0}if(aO<<24>>24!=(a[ah]|0)){aL=ah;break L2292}am=c[g>>2]|0;al=am+12|0;aw=c[al>>2]|0;if((aw|0)==(c[am+16>>2]|0)){aD=c[(c[am>>2]|0)+40>>2]|0;cc[aD&255](am)|0}else{c[al>>2]=aw+1}aw=ah+1|0;al=a[E]|0;am=al&255;if((aw|0)==(((al&1)==0?j:c[P>>2]|0)+((am&1|0)==0?am>>>1:c[O>>2]|0)|0)){aL=aw;break}else{ag=aN;ah=aw}}}}while(0);if(!N){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}au=a[E]|0;at=au&255;if((aL|0)==(((au&1)==0?j:c[P>>2]|0)+((at&1|0)==0?at>>>1:c[O>>2]|0)|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V}else{aa=1934;break L2182}}else if(($|0)==4){at=0;au=D;av=X;ah=W;ag=p;aw=V;L2327:while(1){am=c[g>>2]|0;do{if((am|0)==0){aP=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aP=am;break}if((cc[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;aP=0;break}else{aP=c[g>>2]|0;break}}}while(0);am=(aP|0)==0;al=c[e>>2]|0;do{if((al|0)==0){aa=1947}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){if(am){break}else{break L2327}}if((cc[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[e>>2]=0;aa=1947;break}else{if(am){break}else{break L2327}}}}while(0);if((aa|0)==1947){aa=0;if(am){break}}al=c[g>>2]|0;aD=c[al+12>>2]|0;if((aD|0)==(c[al+16>>2]|0)){aQ=(cc[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aQ=a[aD]|0}do{if(aQ<<24>>24>-1){if((b[(c[f>>2]|0)+(aQ<<24>>24<<1)>>1]&2048)==0){aa=1966;break}aD=c[o>>2]|0;if((aD|0)==(aw|0)){al=(c[U>>2]|0)!=172;aR=c[h>>2]|0;aS=aw-aR|0;aT=aS>>>0<2147483647?aS<<1:-1;aU=kO(al?aR:0,aT)|0;if((aU|0)==0){k$()}do{if(al){c[h>>2]=aU;aV=aU}else{aR=c[h>>2]|0;c[h>>2]=aU;if((aR|0)==0){aV=aU;break}b8[c[U>>2]&511](aR);aV=c[h>>2]|0}}while(0);c[U>>2]=84;aU=aV+aS|0;c[o>>2]=aU;aW=(c[h>>2]|0)+aT|0;aX=aU}else{aW=aw;aX=aD}c[o>>2]=aX+1;a[aX]=aQ;aY=at+1|0;aZ=au;a_=av;a$=ah;a0=ag;a1=aW}else{aa=1966}}while(0);if((aa|0)==1966){aa=0;am=d[w]|0;if((((am&1|0)==0?am>>>1:c[n>>2]|0)|0)==0|(at|0)==0){break}if(aQ<<24>>24!=(a[u]|0)){break}if((av|0)==(au|0)){am=av-ah|0;aU=am>>>0<2147483647?am<<1:-1;if((ag|0)==172){a2=0}else{a2=ah}al=kO(a2,aU)|0;aj=al;if((al|0)==0){k$()}a3=aj+(aU>>>2<<2)|0;a4=aj+(am>>2<<2)|0;a5=aj;a6=84}else{a3=au;a4=av;a5=ah;a6=ag}c[a4>>2]=at;aY=0;aZ=a3;a_=a4+4|0;a$=a5;a0=a6;a1=aw}aj=c[g>>2]|0;am=aj+12|0;aU=c[am>>2]|0;if((aU|0)==(c[aj+16>>2]|0)){al=c[(c[aj>>2]|0)+40>>2]|0;cc[al&255](aj)|0;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}else{c[am>>2]=aU+1;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}}if((ah|0)==(av|0)|(at|0)==0){a7=au;a8=av;a9=ah;ba=ag}else{if((av|0)==(au|0)){aU=av-ah|0;am=aU>>>0<2147483647?aU<<1:-1;if((ag|0)==172){bb=0}else{bb=ah}aj=kO(bb,am)|0;al=aj;if((aj|0)==0){k$()}bc=al+(am>>>2<<2)|0;bd=al+(aU>>2<<2)|0;be=al;bf=84}else{bc=au;bd=av;be=ah;bf=ag}c[bd>>2]=at;a7=bc;a8=bd+4|0;a9=be;ba=bf}if((c[B>>2]|0)>0){al=c[g>>2]|0;do{if((al|0)==0){bg=0}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){bg=al;break}if((cc[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[g>>2]=0;bg=0;break}else{bg=c[g>>2]|0;break}}}while(0);al=(bg|0)==0;at=c[e>>2]|0;do{if((at|0)==0){aa=1999}else{if((c[at+12>>2]|0)!=(c[at+16>>2]|0)){if(al){bh=at;break}else{aa=2006;break L2182}}if((cc[c[(c[at>>2]|0)+36>>2]&255](at)|0)==-1){c[e>>2]=0;aa=1999;break}else{if(al){bh=at;break}else{aa=2006;break L2182}}}}while(0);if((aa|0)==1999){aa=0;if(al){aa=2006;break L2182}else{bh=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bi=(cc[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bi=a[ag]|0}if(bi<<24>>24!=(a[t]|0)){aa=2006;break L2182}ag=c[g>>2]|0;at=ag+12|0;ah=c[at>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){av=c[(c[ag>>2]|0)+40>>2]|0;cc[av&255](ag)|0;bj=aw;bk=bh}else{c[at>>2]=ah+1;bj=aw;bk=bh}while(1){ah=c[g>>2]|0;do{if((ah|0)==0){bl=0}else{if((c[ah+12>>2]|0)!=(c[ah+16>>2]|0)){bl=ah;break}if((cc[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)==-1){c[g>>2]=0;bl=0;break}else{bl=c[g>>2]|0;break}}}while(0);ah=(bl|0)==0;do{if((bk|0)==0){aa=2022}else{if((c[bk+12>>2]|0)!=(c[bk+16>>2]|0)){if(ah){bm=bk;break}else{aa=2030;break L2182}}if((cc[c[(c[bk>>2]|0)+36>>2]&255](bk)|0)==-1){c[e>>2]=0;aa=2022;break}else{if(ah){bm=bk;break}else{aa=2030;break L2182}}}}while(0);if((aa|0)==2022){aa=0;if(ah){aa=2030;break L2182}else{bm=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bn=(cc[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bn=a[ag]|0}if(bn<<24>>24<=-1){aa=2030;break L2182}if((b[(c[f>>2]|0)+(bn<<24>>24<<1)>>1]&2048)==0){aa=2030;break L2182}ag=c[o>>2]|0;if((ag|0)==(bj|0)){at=(c[U>>2]|0)!=172;av=c[h>>2]|0;au=bj-av|0;aU=au>>>0<2147483647?au<<1:-1;am=kO(at?av:0,aU)|0;if((am|0)==0){k$()}do{if(at){c[h>>2]=am;bo=am}else{av=c[h>>2]|0;c[h>>2]=am;if((av|0)==0){bo=am;break}b8[c[U>>2]&511](av);bo=c[h>>2]|0}}while(0);c[U>>2]=84;am=bo+au|0;c[o>>2]=am;bp=(c[h>>2]|0)+aU|0;bq=am}else{bp=bj;bq=ag}am=c[g>>2]|0;at=c[am+12>>2]|0;if((at|0)==(c[am+16>>2]|0)){ah=(cc[c[(c[am>>2]|0)+36>>2]&255](am)|0)&255;br=ah;bs=c[o>>2]|0}else{br=a[at]|0;bs=bq}c[o>>2]=bs+1;a[bs]=br;at=(c[B>>2]|0)-1|0;c[B>>2]=at;ah=c[g>>2]|0;am=ah+12|0;av=c[am>>2]|0;if((av|0)==(c[ah+16>>2]|0)){aj=c[(c[ah>>2]|0)+40>>2]|0;cc[aj&255](ah)|0}else{c[am>>2]=av+1}if((at|0)>0){bj=bp;bk=bm}else{bt=bp;break}}}else{bt=aw}if((c[o>>2]|0)==(c[h>>2]|0)){aa=2050;break L2182}else{an=r;ao=a7;ap=a8;aq=a9;ar=ba;as=bt}}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V}}while(0);L2481:do{if((aa|0)==1826){aa=0;if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=2052;break L2182}else{bu=ab}while(1){$=c[g>>2]|0;do{if(($|0)==0){bv=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){bv=$;break}if((cc[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[g>>2]=0;bv=0;break}else{bv=c[g>>2]|0;break}}}while(0);$=(bv|0)==0;do{if((bu|0)==0){aa=1839}else{if((c[bu+12>>2]|0)!=(c[bu+16>>2]|0)){if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2481}}if((cc[c[(c[bu>>2]|0)+36>>2]&255](bu)|0)==-1){c[e>>2]=0;aa=1839;break}else{if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2481}}}}while(0);if((aa|0)==1839){aa=0;if($){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2481}else{bw=0}}ag=c[g>>2]|0;aU=c[ag+12>>2]|0;if((aU|0)==(c[ag+16>>2]|0)){bx=(cc[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{bx=a[aU]|0}if(bx<<24>>24<=-1){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2481}if((b[(c[f>>2]|0)+(bx<<24>>24<<1)>>1]&8192)==0){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2481}aU=c[g>>2]|0;ag=aU+12|0;au=c[ag>>2]|0;if((au|0)==(c[aU+16>>2]|0)){by=(cc[c[(c[aU>>2]|0)+40>>2]&255](aU)|0)&255}else{c[ag>>2]=au+1;by=a[au]|0}dT(A,by);bu=bw}}}while(0);aw=Y+1|0;if(aw>>>0<4){V=as;p=ar;W=aq;X=ap;D=ao;r=an;Y=aw}else{ac=ar;ad=aq;ae=ap;af=an;aa=2052;break}}L2518:do{if((aa|0)==1825){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==1892){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==1934){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==2006){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==2030){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==2050){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==2052){L2526:do{if((af|0)!=0){an=af;ap=af+1|0;aq=af+8|0;ar=af+4|0;Y=1;L2528:while(1){r=d[an]|0;if((r&1|0)==0){bC=r>>>1}else{bC=c[ar>>2]|0}if(Y>>>0>=bC>>>0){break L2526}r=c[g>>2]|0;do{if((r|0)==0){bD=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){bD=r;break}if((cc[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[g>>2]=0;bD=0;break}else{bD=c[g>>2]|0;break}}}while(0);r=(bD|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=2070}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(r){break}else{break L2528}}if((cc[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=2070;break}else{if(r){break}else{break L2528}}}}while(0);if((aa|0)==2070){aa=0;if(r){break}}$=c[g>>2]|0;ao=c[$+12>>2]|0;if((ao|0)==(c[$+16>>2]|0)){bE=(cc[c[(c[$>>2]|0)+36>>2]&255]($)|0)&255}else{bE=a[ao]|0}if((a[an]&1)==0){bF=ap}else{bF=c[aq>>2]|0}if(bE<<24>>24!=(a[bF+Y|0]|0)){break}ao=Y+1|0;$=c[g>>2]|0;D=$+12|0;X=c[D>>2]|0;if((X|0)==(c[$+16>>2]|0)){as=c[(c[$>>2]|0)+40>>2]|0;cc[as&255]($)|0;Y=ao;continue}else{c[D>>2]=X+1;Y=ao;continue}}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac;break L2518}}while(0);if((ad|0)==(ae|0)){bz=1;bA=ae;bB=ac;break}c[C>>2]=0;fy(v,ad,ae,C);if((c[C>>2]|0)==0){bz=1;bA=ad;bB=ac;break}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac}}while(0);dQ(A);dQ(z);dQ(y);dQ(x);dQ(v);if((bA|0)==0){i=q;return bz|0}b8[bB&511](bA);i=q;return bz|0}function hV(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){em(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function hW(a){a=a|0;dc(a|0);kW(a);return}function hX(a){a=a|0;dc(a|0);return}function hY(a){a=a|0;var b=0;b=bY(8)|0;dF(b,a);bq(b|0,9248,22)}function hZ(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+160|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=172;u=m+100|0;ed(p,h);m=p|0;v=c[m>>2]|0;if((c[3662]|0)!=-1){c[l>>2]=14648;c[l+4>>2]=12;c[l+8>>2]=0;dV(14648,l,96)}l=(c[3663]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(hU(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){a[k+1|0]=0;a[B]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){dT(k,ca[c[(c[B>>2]|0)+28>>2]&63](y,45)|0)}x=ca[c[(c[B>>2]|0)+28>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-1|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((a[C]|0)==x<<24>>24){C=C+1|0}else{break}}hV(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){D=B;break}if((cc[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){E=2150}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){break}else{E=2152;break}}if((cc[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[z>>2]=0;E=2150;break}else{if(x^(A|0)==0){break}else{E=2152;break}}}}while(0);if((E|0)==2150){if(x){E=2152}}if((E|0)==2152){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;dA(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}b8[c[t>>2]&511](A);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function h_(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3780]|0)!=-1){c[p>>2]=15120;c[p+4>>2]=12;c[p+8>>2]=0;dV(15120,p,96)}p=(c[3781]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=bY(4)|0;L=K;kq(L);bq(K|0,9232,138)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=bY(4)|0;L=K;kq(L);bq(K|0,9232,138)}K=b;b9[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;b9[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){a[l+1|0]=0;a[q]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d_(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];k2(s|0,0,12);dQ(r);b9[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d_(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];k2(u|0,0,12);dQ(t);t=b;a[f]=cc[c[(c[t>>2]|0)+12>>2]&255](K)|0;a[g]=cc[c[(c[t>>2]|0)+16>>2]&255](K)|0;b9[c[(c[L>>2]|0)+20>>2]&127](v,K);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d_(h,0);c[t>>2]=c[w>>2];c[t+4>>2]=c[w+4>>2];c[t+8>>2]=c[w+8>>2];k2(w|0,0,12);dQ(v);b9[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d_(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];k2(y|0,0,12);dQ(x);M=cc[c[(c[b>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3782]|0)!=-1){c[o>>2]=15128;c[o+4>>2]=12;c[o+8>>2]=0;dV(15128,o,96)}o=(c[3783]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=bY(4)|0;O=N;kq(O);bq(N|0,9232,138)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=bY(4)|0;O=N;kq(O);bq(N|0,9232,138)}N=K;b9[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;b9[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){a[l+1|0]=0;a[z]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d_(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];k2(B|0,0,12);dQ(A);b9[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d_(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];k2(E|0,0,12);dQ(D);D=K;a[f]=cc[c[(c[D>>2]|0)+12>>2]&255](N)|0;a[g]=cc[c[(c[D>>2]|0)+16>>2]&255](N)|0;b9[c[(c[O>>2]|0)+20>>2]&127](F,N);D=h;if((a[D]&1)==0){a[h+1|0]=0;a[D]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d_(h,0);c[D>>2]=c[G>>2];c[D+4>>2]=c[G+4>>2];c[D+8>>2]=c[G+8>>2];k2(G|0,0,12);dQ(F);b9[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){a[j+1|0]=0;a[O]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d_(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];k2(I|0,0,12);dQ(H);M=cc[c[(c[K>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function h$(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+600|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=d+496|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=172;w=m+400|0;ed(p,h);m=p|0;x=c[m>>2]|0;if((c[3660]|0)!=-1){c[l>>2]=14640;c[l+4>>2]=12;c[l+8>>2]=0;dV(14640,l,96)}l=(c[3661]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2];do{if(h0(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+48>>2]|0;cm[E&15](A,2904,2914,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>392){I=kM((H>>2)+2|0)|0;if((I|0)!=0){J=I;K=I;break}k$();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+40|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((c[O>>2]|0)==(c[N>>2]|0)){P=O;break}else{O=O+4|0}}a[M]=a[2904+(P-I>>2)|0]|0;O=N+4|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((bM(E|0,2072,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((K|0)==0){break}kN(K);break}N=bY(8)|0;dF(N,2e3);bq(N|0,9248,22)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){T=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{T=c[N>>2]|0}if((T|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[C>>2]|0;do{if((z|0)==0){U=2268}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){V=cc[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{V=c[N>>2]|0}if((V|0)==-1){c[C>>2]=0;U=2268;break}else{if(A^(z|0)==0){break}else{U=2270;break}}}}while(0);if((U|0)==2268){if(A){U=2270}}if((U|0)==2270){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;dA(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}b8[c[v>>2]&511](z);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function h0(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0;p=i;i=i+448|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2];q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;k2(w|0,0,12);D=x;E=y;F=z;G=A;k2(D|0,0,12);k2(E|0,0,12);k2(F|0,0,12);k2(G|0,0,12);h5(f,g,s,t,u,v,x,y,z,B);g=m|0;c[n>>2]=c[g>>2];f=b|0;b=e|0;e=l;H=z+4|0;I=z+8|0;J=y+4|0;K=y+8|0;L=(h&512|0)!=0;h=x+4|0;M=x+8|0;N=A+4|0;O=A+8|0;P=s+3|0;Q=v+4|0;R=172;S=o;T=o;o=r+400|0;r=0;U=0;L2786:while(1){V=c[f>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=cc[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[f>>2]=0;W=1;break}else{W=(c[f>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=2296}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=cc[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=2296;break}else{if(W^(V|0)==0){$=V;break}else{aa=R;ab=S;ac=T;ad=r;Z=2536;break L2786}}}}while(0);if((Z|0)==2296){Z=0;if(W){aa=R;ab=S;ac=T;ad=r;Z=2536;break}else{$=0}}V=a[s+U|0]|0;L2810:do{if((V|0)==1){if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=2536;break L2786}X=c[f>>2]|0;ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){af=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{af=c[ae>>2]|0}if(!(cd[c[(c[e>>2]|0)+12>>2]&63](l,8192,af)|0)){Z=2320;break L2786}ae=c[f>>2]|0;X=ae+12|0;ag=c[X>>2]|0;if((ag|0)==(c[ae+16>>2]|0)){ah=cc[c[(c[ae>>2]|0)+40>>2]&255](ae)|0}else{c[X>>2]=ag+4;ah=c[ag>>2]|0}eb(A,ah);Z=2321}else if((V|0)==0){Z=2321}else if((V|0)==3){ag=a[E]|0;X=ag&255;ae=(X&1|0)==0;ai=a[F]|0;aj=ai&255;ak=(aj&1|0)==0;if(((ae?X>>>1:c[J>>2]|0)|0)==(-(ak?aj>>>1:c[H>>2]|0)|0)){al=r;am=o;an=T;ao=S;ap=R;break}do{if(((ae?X>>>1:c[J>>2]|0)|0)!=0){if(((ak?aj>>>1:c[H>>2]|0)|0)==0){break}aq=c[f>>2]|0;ar=c[aq+12>>2]|0;if((ar|0)==(c[aq+16>>2]|0)){as=cc[c[(c[aq>>2]|0)+36>>2]&255](aq)|0;at=as;au=a[E]|0}else{at=c[ar>>2]|0;au=ag}ar=c[f>>2]|0;as=ar+12|0;aq=c[as>>2]|0;av=(aq|0)==(c[ar+16>>2]|0);if((at|0)==(c[((au&1)==0?J:c[K>>2]|0)>>2]|0)){if(av){aw=c[(c[ar>>2]|0)+40>>2]|0;cc[aw&255](ar)|0}else{c[as>>2]=aq+4}as=d[E]|0;al=((as&1|0)==0?as>>>1:c[J>>2]|0)>>>0>1?y:r;am=o;an=T;ao=S;ap=R;break L2810}if(av){ax=cc[c[(c[ar>>2]|0)+36>>2]&255](ar)|0}else{ax=c[aq>>2]|0}if((ax|0)!=(c[((a[F]&1)==0?H:c[I>>2]|0)>>2]|0)){Z=2386;break L2786}aq=c[f>>2]|0;ar=aq+12|0;av=c[ar>>2]|0;if((av|0)==(c[aq+16>>2]|0)){as=c[(c[aq>>2]|0)+40>>2]|0;cc[as&255](aq)|0}else{c[ar>>2]=av+4}a[k]=1;av=d[F]|0;al=((av&1|0)==0?av>>>1:c[H>>2]|0)>>>0>1?z:r;am=o;an=T;ao=S;ap=R;break L2810}}while(0);aj=c[f>>2]|0;ak=c[aj+12>>2]|0;av=(ak|0)==(c[aj+16>>2]|0);if(((ae?X>>>1:c[J>>2]|0)|0)==0){if(av){ar=cc[c[(c[aj>>2]|0)+36>>2]&255](aj)|0;ay=ar;az=a[F]|0}else{ay=c[ak>>2]|0;az=ai}if((ay|0)!=(c[((az&1)==0?H:c[I>>2]|0)>>2]|0)){al=r;am=o;an=T;ao=S;ap=R;break}ar=c[f>>2]|0;aq=ar+12|0;as=c[aq>>2]|0;if((as|0)==(c[ar+16>>2]|0)){aw=c[(c[ar>>2]|0)+40>>2]|0;cc[aw&255](ar)|0}else{c[aq>>2]=as+4}a[k]=1;as=d[F]|0;al=((as&1|0)==0?as>>>1:c[H>>2]|0)>>>0>1?z:r;am=o;an=T;ao=S;ap=R;break}if(av){av=cc[c[(c[aj>>2]|0)+36>>2]&255](aj)|0;aA=av;aB=a[E]|0}else{aA=c[ak>>2]|0;aB=ag}if((aA|0)!=(c[((aB&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;al=r;am=o;an=T;ao=S;ap=R;break}ak=c[f>>2]|0;av=ak+12|0;aj=c[av>>2]|0;if((aj|0)==(c[ak+16>>2]|0)){as=c[(c[ak>>2]|0)+40>>2]|0;cc[as&255](ak)|0}else{c[av>>2]=aj+4}aj=d[E]|0;al=((aj&1|0)==0?aj>>>1:c[J>>2]|0)>>>0>1?y:r;am=o;an=T;ao=S;ap=R}else if((V|0)==2){if(!((r|0)!=0|U>>>0<2)){if((U|0)==2){aC=(a[P]|0)!=0}else{aC=0}if(!(L|aC)){al=0;am=o;an=T;ao=S;ap=R;break}}aj=a[D]|0;av=(aj&1)==0?h:c[M>>2]|0;L2882:do{if((U|0)==0){aD=av;aE=aj;aF=$}else{if((d[s+(U-1)|0]|0)<2){aG=av;aH=aj}else{aD=av;aE=aj;aF=$;break}while(1){ak=aH&255;if((aG|0)==(((aH&1)==0?h:c[M>>2]|0)+(((ak&1|0)==0?ak>>>1:c[h>>2]|0)<<2)|0)){aI=aH;break}if(!(cd[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[aG>>2]|0)|0)){Z=2397;break}aG=aG+4|0;aH=a[D]|0}if((Z|0)==2397){Z=0;aI=a[D]|0}ak=(aI&1)==0;as=aG-(ak?h:c[M>>2]|0)>>2;aq=a[G]|0;ar=aq&255;aw=(ar&1|0)==0;L2892:do{if(as>>>0<=(aw?ar>>>1:c[N>>2]|0)>>>0){aJ=(aq&1)==0;aK=(aJ?N:c[O>>2]|0)+((aw?ar>>>1:c[N>>2]|0)-as<<2)|0;aL=(aJ?N:c[O>>2]|0)+((aw?ar>>>1:c[N>>2]|0)<<2)|0;if((aK|0)==(aL|0)){aD=aG;aE=aI;aF=$;break L2882}else{aM=aK;aN=ak?h:c[M>>2]|0}while(1){if((c[aM>>2]|0)!=(c[aN>>2]|0)){break L2892}aK=aM+4|0;if((aK|0)==(aL|0)){aD=aG;aE=aI;aF=$;break L2882}aM=aK;aN=aN+4|0}}}while(0);aD=ak?h:c[M>>2]|0;aE=aI;aF=$}}while(0);L2899:while(1){aj=aE&255;if((aD|0)==(((aE&1)==0?h:c[M>>2]|0)+(((aj&1|0)==0?aj>>>1:c[h>>2]|0)<<2)|0)){break}aj=c[f>>2]|0;do{if((aj|0)==0){aO=1}else{av=c[aj+12>>2]|0;if((av|0)==(c[aj+16>>2]|0)){aP=cc[c[(c[aj>>2]|0)+36>>2]&255](aj)|0}else{aP=c[av>>2]|0}if((aP|0)==-1){c[f>>2]=0;aO=1;break}else{aO=(c[f>>2]|0)==0;break}}}while(0);do{if((aF|0)==0){Z=2418}else{aj=c[aF+12>>2]|0;if((aj|0)==(c[aF+16>>2]|0)){aQ=cc[c[(c[aF>>2]|0)+36>>2]&255](aF)|0}else{aQ=c[aj>>2]|0}if((aQ|0)==-1){c[b>>2]=0;Z=2418;break}else{if(aO^(aF|0)==0){aR=aF;break}else{break L2899}}}}while(0);if((Z|0)==2418){Z=0;if(aO){break}else{aR=0}}aj=c[f>>2]|0;ak=c[aj+12>>2]|0;if((ak|0)==(c[aj+16>>2]|0)){aS=cc[c[(c[aj>>2]|0)+36>>2]&255](aj)|0}else{aS=c[ak>>2]|0}if((aS|0)!=(c[aD>>2]|0)){break}ak=c[f>>2]|0;aj=ak+12|0;av=c[aj>>2]|0;if((av|0)==(c[ak+16>>2]|0)){ag=c[(c[ak>>2]|0)+40>>2]|0;cc[ag&255](ak)|0}else{c[aj>>2]=av+4}aD=aD+4|0;aE=a[D]|0;aF=aR}if(!L){al=r;am=o;an=T;ao=S;ap=R;break}av=a[D]|0;aj=av&255;if((aD|0)==(((av&1)==0?h:c[M>>2]|0)+(((aj&1|0)==0?aj>>>1:c[h>>2]|0)<<2)|0)){al=r;am=o;an=T;ao=S;ap=R}else{Z=2430;break L2786}}else if((V|0)==4){aj=0;av=o;ak=T;ag=S;ai=R;L2935:while(1){X=c[f>>2]|0;do{if((X|0)==0){aT=1}else{ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aU=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aU=c[ae>>2]|0}if((aU|0)==-1){c[f>>2]=0;aT=1;break}else{aT=(c[f>>2]|0)==0;break}}}while(0);X=c[b>>2]|0;do{if((X|0)==0){Z=2444}else{ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aV=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aV=c[ae>>2]|0}if((aV|0)==-1){c[b>>2]=0;Z=2444;break}else{if(aT^(X|0)==0){break}else{break L2935}}}}while(0);if((Z|0)==2444){Z=0;if(aT){break}}X=c[f>>2]|0;ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aW=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aW=c[ae>>2]|0}if(cd[c[(c[e>>2]|0)+12>>2]&63](l,2048,aW)|0){ae=c[n>>2]|0;if((ae|0)==(c[q>>2]|0)){h6(m,n,q);aX=c[n>>2]|0}else{aX=ae}c[n>>2]=aX+4;c[aX>>2]=aW;aY=aj+1|0;aZ=av;a_=ak;a$=ag;a0=ai}else{ae=d[w]|0;if((((ae&1|0)==0?ae>>>1:c[Q>>2]|0)|0)==0|(aj|0)==0){break}if((aW|0)!=(c[u>>2]|0)){break}if((ak|0)==(av|0)){ae=(ai|0)!=172;X=ak-ag|0;ar=X>>>0<2147483647?X<<1:-1;if(ae){a1=ag}else{a1=0}ae=kO(a1,ar)|0;aw=ae;if((ae|0)==0){k$()}a2=aw+(ar>>>2<<2)|0;a3=aw+(X>>2<<2)|0;a4=aw;a5=84}else{a2=av;a3=ak;a4=ag;a5=ai}c[a3>>2]=aj;aY=0;aZ=a2;a_=a3+4|0;a$=a4;a0=a5}aw=c[f>>2]|0;X=aw+12|0;ar=c[X>>2]|0;if((ar|0)==(c[aw+16>>2]|0)){ae=c[(c[aw>>2]|0)+40>>2]|0;cc[ae&255](aw)|0;aj=aY;av=aZ;ak=a_;ag=a$;ai=a0;continue}else{c[X>>2]=ar+4;aj=aY;av=aZ;ak=a_;ag=a$;ai=a0;continue}}if((ag|0)==(ak|0)|(aj|0)==0){a6=av;a7=ak;a8=ag;a9=ai}else{if((ak|0)==(av|0)){ar=(ai|0)!=172;X=ak-ag|0;aw=X>>>0<2147483647?X<<1:-1;if(ar){ba=ag}else{ba=0}ar=kO(ba,aw)|0;ae=ar;if((ar|0)==0){k$()}bb=ae+(aw>>>2<<2)|0;bc=ae+(X>>2<<2)|0;bd=ae;be=84}else{bb=av;bc=ak;bd=ag;be=ai}c[bc>>2]=aj;a6=bb;a7=bc+4|0;a8=bd;a9=be}ae=c[B>>2]|0;if((ae|0)>0){X=c[f>>2]|0;do{if((X|0)==0){bf=1}else{aw=c[X+12>>2]|0;if((aw|0)==(c[X+16>>2]|0)){bg=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{bg=c[aw>>2]|0}if((bg|0)==-1){c[f>>2]=0;bf=1;break}else{bf=(c[f>>2]|0)==0;break}}}while(0);X=c[b>>2]|0;do{if((X|0)==0){Z=2493}else{aj=c[X+12>>2]|0;if((aj|0)==(c[X+16>>2]|0)){bh=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{bh=c[aj>>2]|0}if((bh|0)==-1){c[b>>2]=0;Z=2493;break}else{if(bf^(X|0)==0){bi=X;break}else{Z=2499;break L2786}}}}while(0);if((Z|0)==2493){Z=0;if(bf){Z=2499;break L2786}else{bi=0}}X=c[f>>2]|0;aj=c[X+12>>2]|0;if((aj|0)==(c[X+16>>2]|0)){bj=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{bj=c[aj>>2]|0}if((bj|0)!=(c[t>>2]|0)){Z=2499;break L2786}aj=c[f>>2]|0;X=aj+12|0;ai=c[X>>2]|0;if((ai|0)==(c[aj+16>>2]|0)){ag=c[(c[aj>>2]|0)+40>>2]|0;cc[ag&255](aj)|0;bk=bi;bl=ae}else{c[X>>2]=ai+4;bk=bi;bl=ae}while(1){ai=c[f>>2]|0;do{if((ai|0)==0){bm=1}else{X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){bn=cc[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{bn=c[X>>2]|0}if((bn|0)==-1){c[f>>2]=0;bm=1;break}else{bm=(c[f>>2]|0)==0;break}}}while(0);do{if((bk|0)==0){Z=2516}else{ai=c[bk+12>>2]|0;if((ai|0)==(c[bk+16>>2]|0)){bo=cc[c[(c[bk>>2]|0)+36>>2]&255](bk)|0}else{bo=c[ai>>2]|0}if((bo|0)==-1){c[b>>2]=0;Z=2516;break}else{if(bm^(bk|0)==0){bp=bk;break}else{Z=2523;break L2786}}}}while(0);if((Z|0)==2516){Z=0;if(bm){Z=2523;break L2786}else{bp=0}}ai=c[f>>2]|0;X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){bq=cc[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{bq=c[X>>2]|0}if(!(cd[c[(c[e>>2]|0)+12>>2]&63](l,2048,bq)|0)){Z=2523;break L2786}if((c[n>>2]|0)==(c[q>>2]|0)){h6(m,n,q)}X=c[f>>2]|0;ai=c[X+12>>2]|0;if((ai|0)==(c[X+16>>2]|0)){br=cc[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{br=c[ai>>2]|0}ai=c[n>>2]|0;c[n>>2]=ai+4;c[ai>>2]=br;ai=bl-1|0;c[B>>2]=ai;X=c[f>>2]|0;aj=X+12|0;ag=c[aj>>2]|0;if((ag|0)==(c[X+16>>2]|0)){ak=c[(c[X>>2]|0)+40>>2]|0;cc[ak&255](X)|0}else{c[aj>>2]=ag+4}if((ai|0)>0){bk=bp;bl=ai}else{break}}}if((c[n>>2]|0)==(c[g>>2]|0)){Z=2534;break L2786}else{al=r;am=a6;an=a7;ao=a8;ap=a9}}else{al=r;am=o;an=T;ao=S;ap=R}}while(0);L3079:do{if((Z|0)==2321){Z=0;if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=2536;break L2786}else{bs=$}while(1){V=c[f>>2]|0;do{if((V|0)==0){bt=1}else{ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bu=cc[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bu=c[ae>>2]|0}if((bu|0)==-1){c[f>>2]=0;bt=1;break}else{bt=(c[f>>2]|0)==0;break}}}while(0);do{if((bs|0)==0){Z=2335}else{V=c[bs+12>>2]|0;if((V|0)==(c[bs+16>>2]|0)){bv=cc[c[(c[bs>>2]|0)+36>>2]&255](bs)|0}else{bv=c[V>>2]|0}if((bv|0)==-1){c[b>>2]=0;Z=2335;break}else{if(bt^(bs|0)==0){bw=bs;break}else{al=r;am=o;an=T;ao=S;ap=R;break L3079}}}}while(0);if((Z|0)==2335){Z=0;if(bt){al=r;am=o;an=T;ao=S;ap=R;break L3079}else{bw=0}}V=c[f>>2]|0;ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bx=cc[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bx=c[ae>>2]|0}if(!(cd[c[(c[e>>2]|0)+12>>2]&63](l,8192,bx)|0)){al=r;am=o;an=T;ao=S;ap=R;break L3079}ae=c[f>>2]|0;V=ae+12|0;ai=c[V>>2]|0;if((ai|0)==(c[ae+16>>2]|0)){by=cc[c[(c[ae>>2]|0)+40>>2]&255](ae)|0}else{c[V>>2]=ai+4;by=c[ai>>2]|0}eb(A,by);bs=bw}}}while(0);ai=U+1|0;if(ai>>>0<4){R=ap;S=ao;T=an;o=am;r=al;U=ai}else{aa=ap;ab=ao;ac=an;ad=al;Z=2536;break}}L3116:do{if((Z|0)==2534){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==2536){L3119:do{if((ad|0)!=0){al=ad;an=ad+4|0;ao=ad+8|0;ap=1;L3121:while(1){U=d[al]|0;if((U&1|0)==0){bC=U>>>1}else{bC=c[an>>2]|0}if(ap>>>0>=bC>>>0){break L3119}U=c[f>>2]|0;do{if((U|0)==0){bD=1}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bE=cc[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bE=c[r>>2]|0}if((bE|0)==-1){c[f>>2]=0;bD=1;break}else{bD=(c[f>>2]|0)==0;break}}}while(0);U=c[b>>2]|0;do{if((U|0)==0){Z=2555}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bF=cc[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bF=c[r>>2]|0}if((bF|0)==-1){c[b>>2]=0;Z=2555;break}else{if(bD^(U|0)==0){break}else{break L3121}}}}while(0);if((Z|0)==2555){Z=0;if(bD){break}}U=c[f>>2]|0;r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bG=cc[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bG=c[r>>2]|0}if((a[al]&1)==0){bH=an}else{bH=c[ao>>2]|0}if((bG|0)!=(c[bH+(ap<<2)>>2]|0)){break}r=ap+1|0;U=c[f>>2]|0;am=U+12|0;o=c[am>>2]|0;if((o|0)==(c[U+16>>2]|0)){T=c[(c[U>>2]|0)+40>>2]|0;cc[T&255](U)|0;ap=r;continue}else{c[am>>2]=o+4;ap=r;continue}}c[j>>2]=c[j>>2]|4;bz=0;bA=ab;bB=aa;break L3116}}while(0);if((ab|0)==(ac|0)){bz=1;bA=ac;bB=aa;break}c[C>>2]=0;fy(v,ab,ac,C);if((c[C>>2]|0)==0){bz=1;bA=ab;bB=aa;break}c[j>>2]=c[j>>2]|4;bz=0;bA=ab;bB=aa}else if((Z|0)==2386){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==2499){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==2523){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==2320){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==2430){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}}while(0);d8(A);d8(z);d8(y);d8(x);dQ(v);if((bA|0)==0){i=p;return bz|0}b8[bB&511](bA);i=p;return bz|0}function h1(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+456|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=172;u=m+400|0;ed(p,h);m=p|0;v=c[m>>2]|0;if((c[3660]|0)!=-1){c[l>>2]=14640;c[l+4>>2]=12;c[l+8>>2]=0;dV(14640,l,96)}l=(c[3661]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(h0(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){c[k+4>>2]=0;a[B]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){eb(k,ca[c[(c[B>>2]|0)+44>>2]&63](y,45)|0)}x=ca[c[(c[B>>2]|0)+44>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-4|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((c[C>>2]|0)==(x|0)){C=C+4|0}else{break}}h2(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){F=cc[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{F=c[E>>2]|0}if((F|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){G=2610}else{B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){H=cc[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{H=c[B>>2]|0}if((H|0)==-1){c[z>>2]=0;G=2610;break}else{if(x^(A|0)==0){break}else{G=2612;break}}}}while(0);if((G|0)==2610){if(x){G=2612}}if((G|0)==2612){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;dA(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}b8[c[t>>2]&511](A);i=d;return}}while(0);d=bY(4)|0;kq(d);bq(d|0,9232,138)}function h2(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){er(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=j+((e-4+(-g|0)|0)>>>2)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function h3(a){a=a|0;dc(a|0);kW(a);return}function h4(a){a=a|0;dc(a|0);return}
function h5(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3776]|0)!=-1){c[p>>2]=15104;c[p+4>>2]=12;c[p+8>>2]=0;dV(15104,p,96)}p=(c[3777]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=bY(4)|0;L=K;kq(L);bq(K|0,9232,138)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=bY(4)|0;L=K;kq(L);bq(K|0,9232,138)}K=b;b9[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;b9[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){c[l+4>>2]=0;a[q]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}ep(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];k2(s|0,0,12);d8(r);b9[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}ep(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];k2(u|0,0,12);d8(t);t=b;c[f>>2]=cc[c[(c[t>>2]|0)+12>>2]&255](K)|0;c[g>>2]=cc[c[(c[t>>2]|0)+16>>2]&255](K)|0;b9[c[(c[b>>2]|0)+20>>2]&127](v,K);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d_(h,0);c[b>>2]=c[w>>2];c[b+4>>2]=c[w+4>>2];c[b+8>>2]=c[w+8>>2];k2(w|0,0,12);dQ(v);b9[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){c[j+4>>2]=0;a[L]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}ep(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];k2(y|0,0,12);d8(x);M=cc[c[(c[t>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3778]|0)!=-1){c[o>>2]=15112;c[o+4>>2]=12;c[o+8>>2]=0;dV(15112,o,96)}o=(c[3779]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=bY(4)|0;O=N;kq(O);bq(N|0,9232,138)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=bY(4)|0;O=N;kq(O);bq(N|0,9232,138)}N=K;b9[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;b9[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){c[l+4>>2]=0;a[z]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}ep(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];k2(B|0,0,12);d8(A);b9[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}ep(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];k2(E|0,0,12);d8(D);D=K;c[f>>2]=cc[c[(c[D>>2]|0)+12>>2]&255](N)|0;c[g>>2]=cc[c[(c[D>>2]|0)+16>>2]&255](N)|0;b9[c[(c[K>>2]|0)+20>>2]&127](F,N);K=h;if((a[K]&1)==0){a[h+1|0]=0;a[K]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d_(h,0);c[K>>2]=c[G>>2];c[K+4>>2]=c[G+4>>2];c[K+8>>2]=c[G+8>>2];k2(G|0,0,12);dQ(F);b9[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){c[j+4>>2]=0;a[O]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}ep(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];k2(I|0,0,12);d8(H);M=cc[c[(c[D>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function h6(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=172;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=kO(k,j)|0;k=a;if((a|0)==0){k$()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}b8[c[e>>2]&511](a);l=c[g>>2]|0}}while(0);c[e>>2]=84;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function h7(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+280|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+232|0;p=e+240|0;q=e+248|0;r=e+256|0;s=e+264|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+100|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a_(E|0,100,1960,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){if(a[10984]|0){H=c[3322]|0}else{E=aT(1,1888,0)|0;c[3322]=E;a[10984]=1;H=E}E=gk(n,H,1960,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;I=c[n>>2]|0;if((I|0)==0){k$();J=c[n>>2]|0}else{J=I}I=kM(E)|0;if((I|0)!=0){K=I;L=E;M=J;N=I;break}k$();K=0;L=E;M=J;N=0}else{K=F;L=G;M=0;N=0}}while(0);ed(o,j);G=o|0;F=c[G>>2]|0;if((c[3662]|0)!=-1){c[m>>2]=14648;c[m+4>>2]=12;c[m+8>>2]=0;dV(14648,m,96)}m=(c[3663]|0)-1|0;J=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-J>>2>>>0>m>>>0){H=c[J+(m<<2)>>2]|0;if((H|0)==0){break}E=H;I=c[n>>2]|0;O=I+L|0;P=c[(c[H>>2]|0)+32>>2]|0;cm[P&15](E,I,O,K)|0;if((L|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}k2(t|0,0,12);k2(v|0,0,12);k2(x|0,0,12);h8(g,Q,o,p,q,r,s,u,w,y);O=z|0;I=c[y>>2]|0;if((L|0)>(I|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(L-I<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+I|0;do{if(P>>>0>100){H=kM(P)|0;if((H|0)!=0){W=H;X=H;break}k$();W=0;X=0}else{W=O;X=0}}while(0);h9(W,A,C,c[j+4>>2]|0,K,K+L|0,E,Q,p,a[q]|0,a[r]|0,s,u,w,I);c[D>>2]=c[f>>2];da(b,D,W,c[A>>2]|0,c[C>>2]|0,j,k);if((X|0)!=0){kN(X)}dQ(w);dQ(u);dQ(s);O=c[G>>2]|0;dA(O)|0;if((N|0)!=0){kN(N)}if((M|0)==0){i=e;return}kN(M);i=e;return}}while(0);e=bY(4)|0;kq(e);bq(e|0,9232,138)}function h8(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3780]|0)!=-1){c[p>>2]=15120;c[p+4>>2]=12;c[p+8>>2]=0;dV(15120,p,96)}p=(c[3781]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=bY(4)|0;R=Q;kq(R);bq(Q|0,9232,138)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=bY(4)|0;R=Q;kq(R);bq(Q|0,9232,138)}Q=e;R=c[e>>2]|0;if(d){b9[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;b9[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){a[l+1|0]=0;a[r]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d_(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];k2(t|0,0,12);dQ(s)}else{b9[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;b9[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){a[l+1|0]=0;a[v]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d_(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];k2(x|0,0,12);dQ(w)}w=e;a[g]=cc[c[(c[w>>2]|0)+12>>2]&255](Q)|0;a[h]=cc[c[(c[w>>2]|0)+16>>2]&255](Q)|0;w=e;b9[c[(c[w>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d_(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];k2(z|0,0,12);dQ(y);b9[c[(c[w>>2]|0)+24>>2]&127](A,Q);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d_(k,0);c[w>>2]=c[B>>2];c[w+4>>2]=c[B+4>>2];c[w+8>>2]=c[B+8>>2];k2(B|0,0,12);dQ(A);S=cc[c[(c[e>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3782]|0)!=-1){c[o>>2]=15128;c[o+4>>2]=12;c[o+8>>2]=0;dV(15128,o,96)}o=(c[3783]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=bY(4)|0;U=T;kq(U);bq(T|0,9232,138)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=bY(4)|0;U=T;kq(U);bq(T|0,9232,138)}T=P;U=c[P>>2]|0;if(d){b9[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;b9[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){a[l+1|0]=0;a[E]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d_(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];k2(G|0,0,12);dQ(F)}else{b9[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;b9[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d_(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];k2(K|0,0,12);dQ(J)}J=P;a[g]=cc[c[(c[J>>2]|0)+12>>2]&255](T)|0;a[h]=cc[c[(c[J>>2]|0)+16>>2]&255](T)|0;J=P;b9[c[(c[J>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d_(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];k2(M|0,0,12);dQ(L);b9[c[(c[J>>2]|0)+24>>2]&127](N,T);J=k;if((a[J]&1)==0){a[k+1|0]=0;a[J]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d_(k,0);c[J>>2]=c[O>>2];c[J+4>>2]=c[O+4>>2];c[J+8>>2]=c[O+8>>2];k2(O|0,0,12);dQ(N);S=cc[c[(c[P>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function h9(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;do{if((H|0)==2){I=a[q]|0;J=I&255;K=(J&1|0)==0;if(K){L=J>>>1}else{L=c[z>>2]|0}if((L|0)==0|x){M=G;break}if((I&1)==0){N=y;O=y}else{I=c[A>>2]|0;N=I;O=I}if(K){P=J>>>1}else{P=c[z>>2]|0}J=N+P|0;K=c[f>>2]|0;if((O|0)==(J|0)){Q=K}else{I=O;R=K;while(1){a[R]=a[I]|0;K=I+1|0;S=R+1|0;if((K|0)==(J|0)){Q=S;break}else{I=K;R=S}}}c[f>>2]=Q;M=G}else if((H|0)==4){R=c[f>>2]|0;I=k?G+1|0:G;J=I;while(1){if(J>>>0>=i>>>0){break}S=a[J]|0;if(S<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(S<<24>>24<<1)>>1]&2048)==0){break}else{J=J+1|0}}S=J;if(B){if(J>>>0>I>>>0){K=I+(-S|0)|0;S=K>>>0<o>>>0?o:K;K=S+r|0;T=J;U=r;V=R;while(1){W=T-1|0;X=a[W]|0;c[f>>2]=V+1;a[V]=X;X=U-1|0;Y=(X|0)>0;if(!(W>>>0>I>>>0&Y)){break}T=W;U=X;V=c[f>>2]|0}V=J+S|0;if(Y){Z=K;_=V;$=259}else{aa=0;ab=K;ac=V}}else{Z=r;_=J;$=259}if(($|0)==259){$=0;aa=ca[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;ab=Z;ac=_}V=c[f>>2]|0;c[f>>2]=V+1;if((ab|0)>0){U=ab;T=V;while(1){a[T]=aa;X=U-1|0;W=c[f>>2]|0;c[f>>2]=W+1;if((X|0)>0){U=X;T=W}else{ad=W;break}}}else{ad=V}a[ad]=m;ae=ac}else{ae=J}if((ae|0)==(I|0)){T=ca[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;U=c[f>>2]|0;c[f>>2]=U+1;a[U]=T}else{T=a[C]|0;U=T&255;if((U&1|0)==0){af=U>>>1}else{af=c[F>>2]|0}if((af|0)==0){ag=ae;ah=0;ai=0;aj=-1}else{if((T&1)==0){ak=D}else{ak=c[E>>2]|0}ag=ae;ah=0;ai=0;aj=a[ak]|0}while(1){do{if((ah|0)==(aj|0)){T=c[f>>2]|0;c[f>>2]=T+1;a[T]=n;T=ai+1|0;U=a[C]|0;K=U&255;if((K&1|0)==0){al=K>>>1}else{al=c[F>>2]|0}if(T>>>0>=al>>>0){am=aj;an=T;ao=0;break}K=(U&1)==0;if(K){ap=D}else{ap=c[E>>2]|0}if((a[ap+T|0]|0)==127){am=-1;an=T;ao=0;break}if(K){aq=D}else{aq=c[E>>2]|0}am=a[aq+T|0]|0;an=T;ao=0}else{am=aj;an=ai;ao=ah}}while(0);T=ag-1|0;K=a[T]|0;U=c[f>>2]|0;c[f>>2]=U+1;a[U]=K;if((T|0)==(I|0)){break}else{ag=T;ah=ao+1|0;ai=an;aj=am}}}J=c[f>>2]|0;if((R|0)==(J|0)){M=I;break}V=J-1|0;if(R>>>0<V>>>0){ar=R;as=V}else{M=I;break}while(1){V=a[ar]|0;a[ar]=a[as]|0;a[as]=V;V=ar+1|0;J=as-1|0;if(V>>>0<J>>>0){ar=V;as=J}else{M=I;break}}}else if((H|0)==0){c[e>>2]=c[f>>2];M=G}else if((H|0)==1){c[e>>2]=c[f>>2];I=ca[c[(c[s>>2]|0)+28>>2]&63](j,32)|0;R=c[f>>2]|0;c[f>>2]=R+1;a[R]=I;M=G}else if((H|0)==3){I=a[t]|0;R=I&255;if((R&1|0)==0){at=R>>>1}else{at=c[w>>2]|0}if((at|0)==0){M=G;break}if((I&1)==0){au=u}else{au=c[v>>2]|0}I=a[au]|0;R=c[f>>2]|0;c[f>>2]=R+1;a[R]=I;M=G}else{M=G}}while(0);H=h+1|0;if(H>>>0<4){G=M;h=H}else{break}}h=a[t]|0;t=h&255;M=(t&1|0)==0;if(M){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(M){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;if((aw|0)==(w|0)){az=ay}else{ax=ay;ay=aw;while(1){a[ax]=a[ay]|0;aw=ax+1|0;t=ay+1|0;if((t|0)==(w|0)){az=aw;break}else{ax=aw;ay=t}}}c[f>>2]=az}az=g&176;if((az|0)==32){c[e>>2]=c[f>>2];return}else if((az|0)==16){return}else{c[e>>2]=d;return}}function ia(a){a=a|0;dc(a|0);kW(a);return}function ib(a){a=a|0;dc(a|0);return}function ic(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+100|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;ed(m,h);B=m|0;C=c[B>>2]|0;if((c[3662]|0)!=-1){c[l>>2]=14648;c[l+4>>2]=12;c[l+8>>2]=0;dV(14648,l,96)}l=(c[3663]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=k;I=a[H]|0;J=I&255;if((J&1|0)==0){K=J>>>1}else{K=c[k+4>>2]|0}if((K|0)==0){L=0}else{if((I&1)==0){M=G+1|0}else{M=c[k+8>>2]|0}I=a[M]|0;L=I<<24>>24==(ca[c[(c[E>>2]|0)+28>>2]&63](F,45)|0)<<24>>24}k2(r|0,0,12);k2(t|0,0,12);k2(v|0,0,12);h8(g,L,m,n,o,p,q,s,u,w);E=x|0;I=a[H]|0;J=I&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[k+4>>2]|0}P=c[w>>2]|0;if((O|0)>(P|0)){if(N){Q=J>>>1}else{Q=c[k+4>>2]|0}J=d[v]|0;if((J&1|0)==0){R=J>>>1}else{R=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){S=J>>>1}else{S=c[s+4>>2]|0}T=(Q-P<<1|1)+R+S|0}else{J=d[v]|0;if((J&1|0)==0){U=J>>>1}else{U=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){V=J>>>1}else{V=c[s+4>>2]|0}T=U+2+V|0}J=T+P|0;do{if(J>>>0>100){N=kM(J)|0;if((N|0)!=0){W=N;X=N;Y=I;break}k$();W=0;X=0;Y=a[H]|0}else{W=E;X=0;Y=I}}while(0);if((Y&1)==0){Z=G+1|0;_=G+1|0}else{I=c[k+8>>2]|0;Z=I;_=I}I=Y&255;if((I&1|0)==0){$=I>>>1}else{$=c[k+4>>2]|0}h9(W,y,z,c[h+4>>2]|0,_,Z+$|0,F,L,n,a[o]|0,a[p]|0,q,s,u,P);c[A>>2]=c[f>>2];da(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){dQ(u);dQ(s);dQ(q);aa=c[B>>2]|0;ab=aa|0;ac=dA(ab)|0;i=e;return}kN(X);dQ(u);dQ(s);dQ(q);aa=c[B>>2]|0;ab=aa|0;ac=dA(ab)|0;i=e;return}}while(0);e=bY(4)|0;kq(e);bq(e|0,9232,138)}function id(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+576|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+528|0;p=e+536|0;q=e+544|0;r=e+552|0;s=e+560|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+400|0;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a_(E|0,100,1960,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){if(a[10984]|0){H=c[3322]|0}else{E=aT(1,1888,0)|0;c[3322]=E;a[10984]=1;H=E}E=gk(n,H,1960,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;I=c[n>>2]|0;if((I|0)==0){k$();J=c[n>>2]|0}else{J=I}I=kM(E<<2)|0;K=I;if((I|0)!=0){L=K;M=E;N=J;O=K;break}k$();L=K;M=E;N=J;O=K}else{L=F;M=G;N=0;O=0}}while(0);ed(o,j);G=o|0;F=c[G>>2]|0;if((c[3660]|0)!=-1){c[m>>2]=14640;c[m+4>>2]=12;c[m+8>>2]=0;dV(14640,m,96)}m=(c[3661]|0)-1|0;J=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-J>>2>>>0>m>>>0){H=c[J+(m<<2)>>2]|0;if((H|0)==0){break}K=H;E=c[n>>2]|0;I=E+M|0;P=c[(c[H>>2]|0)+48>>2]|0;cm[P&15](K,E,I,L)|0;if((M|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}k2(t|0,0,12);k2(v|0,0,12);k2(x|0,0,12);ie(g,Q,o,p,q,r,s,u,w,y);I=z|0;E=c[y>>2]|0;if((M|0)>(E|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(M-E<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+E|0;do{if(P>>>0>100){H=kM(P<<2)|0;W=H;if((H|0)!=0){X=W;Y=W;break}k$();X=W;Y=W}else{X=I;Y=0}}while(0);ig(X,A,C,c[j+4>>2]|0,L,L+(M<<2)|0,K,Q,p,c[q>>2]|0,c[r>>2]|0,s,u,w,E);c[D>>2]=c[f>>2];gt(b,D,X,c[A>>2]|0,c[C>>2]|0,j,k);if((Y|0)!=0){kN(Y)}d8(w);d8(u);dQ(s);I=c[G>>2]|0;dA(I)|0;if((O|0)!=0){kN(O)}if((N|0)==0){i=e;return}kN(N);i=e;return}}while(0);e=bY(4)|0;kq(e);bq(e|0,9232,138)}function ie(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3776]|0)!=-1){c[p>>2]=15104;c[p+4>>2]=12;c[p+8>>2]=0;dV(15104,p,96)}p=(c[3777]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=bY(4)|0;R=Q;kq(R);bq(Q|0,9232,138)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=bY(4)|0;R=Q;kq(R);bq(Q|0,9232,138)}Q=e;R=c[e>>2]|0;if(d){b9[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;b9[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){c[l+4>>2]=0;a[r]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}ep(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];k2(t|0,0,12);d8(s)}else{b9[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;b9[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){c[l+4>>2]=0;a[v]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}ep(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];k2(x|0,0,12);d8(w)}w=e;c[g>>2]=cc[c[(c[w>>2]|0)+12>>2]&255](Q)|0;c[h>>2]=cc[c[(c[w>>2]|0)+16>>2]&255](Q)|0;b9[c[(c[e>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d_(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];k2(z|0,0,12);dQ(y);b9[c[(c[e>>2]|0)+24>>2]&127](A,Q);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}ep(k,0);c[e>>2]=c[B>>2];c[e+4>>2]=c[B+4>>2];c[e+8>>2]=c[B+8>>2];k2(B|0,0,12);d8(A);S=cc[c[(c[w>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3778]|0)!=-1){c[o>>2]=15112;c[o+4>>2]=12;c[o+8>>2]=0;dV(15112,o,96)}o=(c[3779]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=bY(4)|0;U=T;kq(U);bq(T|0,9232,138)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=bY(4)|0;U=T;kq(U);bq(T|0,9232,138)}T=P;U=c[P>>2]|0;if(d){b9[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;b9[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){c[l+4>>2]=0;a[E]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}ep(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];k2(G|0,0,12);d8(F)}else{b9[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;b9[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}ep(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];k2(K|0,0,12);d8(J)}J=P;c[g>>2]=cc[c[(c[J>>2]|0)+12>>2]&255](T)|0;c[h>>2]=cc[c[(c[J>>2]|0)+16>>2]&255](T)|0;b9[c[(c[P>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d_(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];k2(M|0,0,12);dQ(L);b9[c[(c[P>>2]|0)+24>>2]&127](N,T);P=k;if((a[P]&1)==0){c[k+4>>2]=0;a[P]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}ep(k,0);c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];k2(O|0,0,12);d8(N);S=cc[c[(c[J>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function ig(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;do{if((D|0)==0){c[d>>2]=c[e>>2];E=n}else if((D|0)==4){F=c[e>>2]|0;G=j?n+4|0:n;H=G;while(1){if(H>>>0>=h>>>0){break}if(cd[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[H>>2]|0)|0){H=H+4|0}else{break}}if(y){if(H>>>0>G>>>0){I=H;J=q;do{I=I-4|0;K=c[I>>2]|0;L=c[e>>2]|0;c[e>>2]=L+4;c[L>>2]=K;J=J-1|0;M=(J|0)>0;}while(I>>>0>G>>>0&M);if(M){N=J;O=I;P=533}else{Q=0;R=J;S=I}}else{N=q;O=H;P=533}if((P|0)==533){P=0;Q=ca[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;R=N;S=O}K=c[e>>2]|0;c[e>>2]=K+4;if((R|0)>0){L=R;T=K;while(1){c[T>>2]=Q;U=L-1|0;V=c[e>>2]|0;c[e>>2]=V+4;if((U|0)>0){L=U;T=V}else{W=V;break}}}else{W=K}c[W>>2]=l;X=S}else{X=H}if((X|0)==(G|0)){T=ca[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;L=c[e>>2]|0;c[e>>2]=L+4;c[L>>2]=T}else{T=a[z]|0;L=T&255;if((L&1|0)==0){Y=L>>>1}else{Y=c[C>>2]|0}if((Y|0)==0){Z=X;_=0;$=0;aa=-1}else{if((T&1)==0){ab=A}else{ab=c[B>>2]|0}Z=X;_=0;$=0;aa=a[ab]|0}while(1){do{if((_|0)==(aa|0)){T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=m;T=$+1|0;L=a[z]|0;I=L&255;if((I&1|0)==0){ac=I>>>1}else{ac=c[C>>2]|0}if(T>>>0>=ac>>>0){ad=aa;ae=T;af=0;break}I=(L&1)==0;if(I){ag=A}else{ag=c[B>>2]|0}if((a[ag+T|0]|0)==127){ad=-1;ae=T;af=0;break}if(I){ah=A}else{ah=c[B>>2]|0}ad=a[ah+T|0]|0;ae=T;af=0}else{ad=aa;ae=$;af=_}}while(0);T=Z-4|0;I=c[T>>2]|0;L=c[e>>2]|0;c[e>>2]=L+4;c[L>>2]=I;if((T|0)==(G|0)){break}else{Z=T;_=af+1|0;$=ae;aa=ad}}}H=c[e>>2]|0;if((F|0)==(H|0)){E=G;break}K=H-4|0;if(F>>>0<K>>>0){ai=F;aj=K}else{E=G;break}while(1){K=c[ai>>2]|0;c[ai>>2]=c[aj>>2];c[aj>>2]=K;K=ai+4|0;H=aj-4|0;if(K>>>0<H>>>0){ai=K;aj=H}else{E=G;break}}}else if((D|0)==3){G=a[s]|0;F=G&255;if((F&1|0)==0){ak=F>>>1}else{ak=c[t>>2]|0}if((ak|0)==0){E=n;break}if((G&1)==0){al=t}else{al=c[u>>2]|0}G=c[al>>2]|0;F=c[e>>2]|0;c[e>>2]=F+4;c[F>>2]=G;E=n}else if((D|0)==2){G=a[p]|0;F=G&255;H=(F&1|0)==0;if(H){am=F>>>1}else{am=c[w>>2]|0}if((am|0)==0|v){E=n;break}if((G&1)==0){an=w;ao=w;ap=w}else{G=c[x>>2]|0;an=G;ao=G;ap=G}if(H){aq=F>>>1}else{aq=c[w>>2]|0}F=an+(aq<<2)|0;H=c[e>>2]|0;if((ao|0)==(F|0)){ar=H}else{G=(an+(aq-1<<2)+(-ap|0)|0)>>>2;K=ao;T=H;while(1){c[T>>2]=c[K>>2];I=K+4|0;if((I|0)==(F|0)){break}K=I;T=T+4|0}ar=H+(G+1<<2)|0}c[e>>2]=ar;E=n}else if((D|0)==1){c[d>>2]=c[e>>2];T=ca[c[(c[r>>2]|0)+44>>2]&63](i,32)|0;K=c[e>>2]|0;c[e>>2]=K+4;c[K>>2]=T;E=n}else{E=n}}while(0);D=g+1|0;if(D>>>0<4){n=E;g=D}else{break}}g=a[s]|0;s=g&255;E=(s&1|0)==0;if(E){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(E){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;E=au+4|0;if((E|0)==(t|0)){ax=s}else{au=((at+(aw-2<<2)+(-av|0)|0)>>>2)+1|0;av=s;aw=E;while(1){c[av>>2]=c[aw>>2];E=aw+4|0;if((E|0)==(t|0)){break}else{av=av+4|0;aw=E}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==32){c[d>>2]=c[e>>2];return}else if((ax|0)==16){return}else{c[d>>2]=b;return}}function ih(a){a=a|0;dc(a|0);kW(a);return}function ii(a){a=a|0;dc(a|0);return}function ij(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=be(f|0,200)|0;return d>>>(((d|0)!=-1&1)>>>0)|0}function ik(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+400|0;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;ed(m,h);B=m|0;C=c[B>>2]|0;if((c[3660]|0)!=-1){c[l>>2]=14640;c[l+4>>2]=12;c[l+8>>2]=0;dV(14640,l,96)}l=(c[3661]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=a[G]|0;I=H&255;if((I&1|0)==0){J=I>>>1}else{J=c[k+4>>2]|0}if((J|0)==0){K=0}else{if((H&1)==0){L=k+4|0}else{L=c[k+8>>2]|0}H=c[L>>2]|0;K=(H|0)==(ca[c[(c[E>>2]|0)+44>>2]&63](F,45)|0)}k2(r|0,0,12);k2(t|0,0,12);k2(v|0,0,12);ie(g,K,m,n,o,p,q,s,u,w);E=x|0;H=a[G]|0;I=H&255;M=(I&1|0)==0;if(M){N=I>>>1}else{N=c[k+4>>2]|0}O=c[w>>2]|0;if((N|0)>(O|0)){if(M){P=I>>>1}else{P=c[k+4>>2]|0}I=d[v]|0;if((I&1|0)==0){Q=I>>>1}else{Q=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){R=I>>>1}else{R=c[s+4>>2]|0}S=(P-O<<1|1)+Q+R|0}else{I=d[v]|0;if((I&1|0)==0){T=I>>>1}else{T=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){U=I>>>1}else{U=c[s+4>>2]|0}S=T+2+U|0}I=S+O|0;do{if(I>>>0>100){M=kM(I<<2)|0;V=M;if((M|0)!=0){W=V;X=V;Y=H;break}k$();W=V;X=V;Y=a[G]|0}else{W=E;X=0;Y=H}}while(0);if((Y&1)==0){Z=k+4|0;_=k+4|0}else{H=c[k+8>>2]|0;Z=H;_=H}H=Y&255;if((H&1|0)==0){$=H>>>1}else{$=c[k+4>>2]|0}ig(W,y,z,c[h+4>>2]|0,_,Z+($<<2)|0,F,K,n,c[o>>2]|0,c[p>>2]|0,q,s,u,O);c[A>>2]=c[f>>2];gt(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){d8(u);d8(s);dQ(q);aa=c[B>>2]|0;ab=aa|0;ac=dA(ab)|0;i=e;return}kN(X);d8(u);d8(s);dQ(q);aa=c[B>>2]|0;ab=aa|0;ac=dA(ab)|0;i=e;return}}while(0);e=bY(4)|0;kq(e);bq(e|0,9232,138)}function il(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+16|0;j=d|0;k=j;k2(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=p;do{dT(j,a[q]|0);q=q+1|0;}while(q>>>0<h>>>0);q=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){r=q;s=665;break}t=c[j+8>>2]|0;u=q}else{r=(e|0)==-1?-1:e<<1;s=665}}while(0);if((s|0)==665){t=j+1|0;u=r}r=bV(u|0,f|0,g|0,t|0)|0;k2(l|0,0,12);l=k3(r|0)|0;t=r+l|0;if((l|0)>0){v=r}else{dQ(j);i=d;return}do{dT(b,a[v]|0);v=v+1|0;}while(v>>>0<t>>>0);dQ(j);i=d;return}function im(a,b){a=a|0;b=b|0;a5(((b|0)==-1?-1:b<<1)|0)|0;return}function io(a){a=a|0;dc(a|0);kW(a);return}function ip(a){a=a|0;dc(a|0);return}function iq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=be(f|0,200)|0;return d>>>(((d|0)!=-1&1)>>>0)|0}function ir(a,b){a=a|0;b=b|0;a5(((b|0)==-1?-1:b<<1)|0)|0;return}function is(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;k2(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=4928;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;L803:do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=z;C=4928;while(1){c[m>>2]=x;D=(ci[c[C+12>>2]&31](w,j,x,h,m,y,A,l)|0)==2;E=c[m>>2]|0;if(D|(E|0)==(x|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){D=y;do{dT(r,a[D]|0);D=D+1|0;}while(D>>>0<(c[l>>2]|0)>>>0);F=c[m>>2]|0}else{F=E}if(F>>>0>=h>>>0){break L803}x=F;C=c[B>>2]|0}B=bY(8)|0;dF(B,1328);bq(B|0,9248,22)}}while(0);dc(t|0);if((a[s]&1)==0){G=r+1|0}else{G=c[r+8>>2]|0}s=bV(((e|0)==-1?-1:e<<1)|0,f|0,g|0,G|0)|0;k2(v|0,0,12);v=u|0;c[u+4>>2]=0;c[u>>2]=4872;G=k3(s|0)|0;g=s+G|0;if((G|0)<1){H=u|0;dc(H);dQ(r);i=d;return}G=u;f=g;e=o|0;t=o+128|0;o=s;s=4872;while(1){c[q>>2]=o;F=(ci[c[s+16>>2]&31](v,n,o,(f-o|0)>32?o+32|0:g,q,e,t,p)|0)==2;h=c[q>>2]|0;if(F|(h|0)==(o|0)){break}if(e>>>0<(c[p>>2]|0)>>>0){F=e;do{eb(b,c[F>>2]|0);F=F+4|0;}while(F>>>0<(c[p>>2]|0)>>>0);I=c[q>>2]|0}else{I=h}if(I>>>0>=g>>>0){J=733;break}o=I;s=c[G>>2]|0}if((J|0)==733){H=u|0;dc(H);dQ(r);i=d;return}d=bY(8)|0;dF(d,1328);bq(d|0,9248,22)}function it(a){a=a|0;var b=0;c[a>>2]=4392;b=c[a+8>>2]|0;if((b|0)!=0){bd(b|0)}dc(a|0);return}function iu(a){a=a|0;a=bY(8)|0;dB(a,1936);c[a>>2]=3328;bq(a|0,9264,34)}function iv(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1;c[b>>2]=4648;d=b+8|0;I=b+12|0;a[b+136|0]=1;J=b+24|0;K=J;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J+112;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J-1|0;}while((J|0)!=0);dY(b+144|0,1888,1);J=c[d>>2]|0;d=c[I>>2]|0;if((J|0)!=(d|0)){c[I>>2]=d+(((d-4+(-J|0)|0)>>>2^-1)<<2)}c[3355]=0;c[3354]=4352;if((c[3582]|0)!=-1){c[H>>2]=14328;c[H+4>>2]=12;c[H+8>>2]=0;dV(14328,H,96)}iM(b,13416,(c[3583]|0)-1|0);c[3353]=0;c[3352]=4312;if((c[3580]|0)!=-1){c[G>>2]=14320;c[G+4>>2]=12;c[G+8>>2]=0;dV(14320,G,96)}iM(b,13408,(c[3581]|0)-1|0);c[3405]=0;c[3404]=4760;c[3406]=0;a[13628]=0;c[3406]=c[(bc()|0)>>2];if((c[3662]|0)!=-1){c[F>>2]=14648;c[F+4>>2]=12;c[F+8>>2]=0;dV(14648,F,96)}iM(b,13616,(c[3663]|0)-1|0);c[3403]=0;c[3402]=4680;if((c[3660]|0)!=-1){c[E>>2]=14640;c[E+4>>2]=12;c[E+8>>2]=0;dV(14640,E,96)}iM(b,13608,(c[3661]|0)-1|0);c[3357]=0;c[3356]=4448;if((c[3586]|0)!=-1){c[D>>2]=14344;c[D+4>>2]=12;c[D+8>>2]=0;dV(14344,D,96)}iM(b,13424,(c[3587]|0)-1|0);c[723]=0;c[722]=4392;c[724]=0;if((c[3584]|0)!=-1){c[C>>2]=14336;c[C+4>>2]=12;c[C+8>>2]=0;dV(14336,C,96)}iM(b,2888,(c[3585]|0)-1|0);c[3359]=0;c[3358]=4504;if((c[3588]|0)!=-1){c[B>>2]=14352;c[B+4>>2]=12;c[B+8>>2]=0;dV(14352,B,96)}iM(b,13432,(c[3589]|0)-1|0);c[3361]=0;c[3360]=4560;if((c[3590]|0)!=-1){c[A>>2]=14360;c[A+4>>2]=12;c[A+8>>2]=0;dV(14360,A,96)}iM(b,13440,(c[3591]|0)-1|0);c[3335]=0;c[3334]=3856;a[13344]=46;a[13345]=44;k2(13348,0,12);if((c[3566]|0)!=-1){c[z>>2]=14264;c[z+4>>2]=12;c[z+8>>2]=0;dV(14264,z,96)}iM(b,13336,(c[3567]|0)-1|0);c[715]=0;c[714]=3808;c[716]=46;c[717]=44;k2(2872,0,12);if((c[3564]|0)!=-1){c[y>>2]=14256;c[y+4>>2]=12;c[y+8>>2]=0;dV(14256,y,96)}iM(b,2856,(c[3565]|0)-1|0);c[3351]=0;c[3350]=4240;if((c[3578]|0)!=-1){c[x>>2]=14312;c[x+4>>2]=12;c[x+8>>2]=0;dV(14312,x,96)}iM(b,13400,(c[3579]|0)-1|0);c[3349]=0;c[3348]=4168;if((c[3576]|0)!=-1){c[w>>2]=14304;c[w+4>>2]=12;c[w+8>>2]=0;dV(14304,w,96)}iM(b,13392,(c[3577]|0)-1|0);c[3347]=0;c[3346]=4104;if((c[3574]|0)!=-1){c[v>>2]=14296;c[v+4>>2]=12;c[v+8>>2]=0;dV(14296,v,96)}iM(b,13384,(c[3575]|0)-1|0);c[3345]=0;c[3344]=4040;if((c[3572]|0)!=-1){c[u>>2]=14288;c[u+4>>2]=12;c[u+8>>2]=0;dV(14288,u,96)}iM(b,13376,(c[3573]|0)-1|0);c[3415]=0;c[3414]=5856;if((c[3782]|0)!=-1){c[t>>2]=15128;c[t+4>>2]=12;c[t+8>>2]=0;dV(15128,t,96)}iM(b,13656,(c[3783]|0)-1|0);c[3413]=0;c[3412]=5792;if((c[3780]|0)!=-1){c[s>>2]=15120;c[s+4>>2]=12;c[s+8>>2]=0;dV(15120,s,96)}iM(b,13648,(c[3781]|0)-1|0);c[3411]=0;c[3410]=5728;if((c[3778]|0)!=-1){c[r>>2]=15112;c[r+4>>2]=12;c[r+8>>2]=0;dV(15112,r,96)}iM(b,13640,(c[3779]|0)-1|0);c[3409]=0;c[3408]=5664;if((c[3776]|0)!=-1){c[q>>2]=15104;c[q+4>>2]=12;c[q+8>>2]=0;dV(15104,q,96)}iM(b,13632,(c[3777]|0)-1|0);c[3333]=0;c[3332]=3512;if((c[3554]|0)!=-1){c[p>>2]=14216;c[p+4>>2]=12;c[p+8>>2]=0;dV(14216,p,96)}iM(b,13328,(c[3555]|0)-1|0);c[3331]=0;c[3330]=3472;if((c[3552]|0)!=-1){c[o>>2]=14208;c[o+4>>2]=12;c[o+8>>2]=0;dV(14208,o,96)}iM(b,13320,(c[3553]|0)-1|0);c[3329]=0;c[3328]=3432;if((c[3550]|0)!=-1){c[n>>2]=14200;c[n+4>>2]=12;c[n+8>>2]=0;dV(14200,n,96)}iM(b,13312,(c[3551]|0)-1|0);c[3327]=0;c[3326]=3392;if((c[3548]|0)!=-1){c[m>>2]=14192;c[m+4>>2]=12;c[m+8>>2]=0;dV(14192,m,96)}iM(b,13304,(c[3549]|0)-1|0);c[711]=0;c[710]=3712;c[712]=3760;if((c[3562]|0)!=-1){c[l>>2]=14248;c[l+4>>2]=12;c[l+8>>2]=0;dV(14248,l,96)}iM(b,2840,(c[3563]|0)-1|0);c[707]=0;c[706]=3616;c[708]=3664;if((c[3560]|0)!=-1){c[k>>2]=14240;c[k+4>>2]=12;c[k+8>>2]=0;dV(14240,k,96)}iM(b,2824,(c[3561]|0)-1|0);c[703]=0;c[702]=4616;if(a[10984]|0){N=c[3322]|0}else{k=aT(1,1888,0)|0;c[3322]=k;a[10984]=1;N=k}c[704]=N;c[702]=3584;if((c[3558]|0)!=-1){c[j>>2]=14232;c[j+4>>2]=12;c[j+8>>2]=0;dV(14232,j,96)}iM(b,2808,(c[3559]|0)-1|0);c[699]=0;c[698]=4616;if(a[10984]|0){O=c[3322]|0}else{j=aT(1,1888,0)|0;c[3322]=j;a[10984]=1;O=j}c[700]=O;c[698]=3552;if((c[3556]|0)!=-1){c[h>>2]=14224;c[h+4>>2]=12;c[h+8>>2]=0;dV(14224,h,96)}iM(b,2792,(c[3557]|0)-1|0);c[3343]=0;c[3342]=3944;if((c[3570]|0)!=-1){c[g>>2]=14280;c[g+4>>2]=12;c[g+8>>2]=0;dV(14280,g,96)}iM(b,13368,(c[3571]|0)-1|0);c[3341]=0;c[3340]=3904;if((c[3568]|0)!=-1){c[f>>2]=14272;c[f+4>>2]=12;c[f+8>>2]=0;dV(14272,f,96)}iM(b,13360,(c[3569]|0)-1|0);i=e;return}function iw(a,b){a=a|0;b=b|0;return b|0}function ix(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function iy(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function iz(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function iA(a){a=a|0;return 1}function iB(a){a=a|0;return 1}function iC(a){a=a|0;return 1}function iD(a,b){a=a|0;b=b|0;return b<<24>>24|0}function iE(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function iF(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function iG(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function iH(a){a=a|0;c[a+4>>2]=(I=c[3592]|0,c[3592]=I+1,I)+1;return}function iI(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function iJ(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=((e-4+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function iK(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function iL(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function iM(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;de(b|0);e=a+8|0;f=a+12|0;a=c[f>>2]|0;g=e|0;h=c[g>>2]|0;i=a-h>>2;do{if(i>>>0>d>>>0){j=h}else{k=d+1|0;if(i>>>0<k>>>0){kg(e,k-i|0);j=c[g>>2]|0;break}if(i>>>0<=k>>>0){j=h;break}l=h+(k<<2)|0;if((l|0)==(a|0)){j=h;break}c[f>>2]=a+(((a-4+(-l|0)|0)>>>2^-1)<<2);j=h}}while(0);h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=j;n=m+(d<<2)|0;c[n>>2]=b;return}dA(h|0)|0;m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}function iN(a){a=a|0;iO(a);kW(a);return}function iO(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c[b>>2]=4648;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((e|0)!=(g|0)){h=0;i=g;g=e;while(1){e=c[i+(h<<2)>>2]|0;if((e|0)==0){j=g;k=i}else{l=e|0;dA(l)|0;j=c[d>>2]|0;k=c[f>>2]|0}l=h+1|0;if(l>>>0<j-k>>2>>>0){h=l;i=k;g=j}else{break}}}dQ(b+144|0);j=c[f>>2]|0;if((j|0)==0){m=b|0;dc(m);return}f=c[d>>2]|0;if((j|0)!=(f|0)){c[d>>2]=f+(((f-4+(-j|0)|0)>>>2^-1)<<2)}if((j|0)==(b+24|0)){a[b+136|0]=0;m=b|0;dc(m);return}else{kW(j);m=b|0;dc(m);return}}function iP(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;c[a>>2]=d;de(d|0);return}function iQ(a){a=a|0;dA(c[a>>2]|0)|0;return}function iR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;dV(a,e,96)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=0;i=d;return g|0}g=(c[b+(e<<2)>>2]|0)!=0;i=d;return g|0}function iS(a){a=a|0;dc(a|0);kW(a);return}function iT(a){a=a|0;if((a|0)==0){return}b8[c[(c[a>>2]|0)+4>>2]&511](a);return}function iU(a){a=a|0;dc(a|0);kW(a);return}function iV(b){b=b|0;var d=0;c[b>>2]=4760;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}kX(d)}}while(0);dc(b|0);kW(b);return}function iW(b){b=b|0;var d=0;c[b>>2]=4760;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}kX(d)}}while(0);dc(b|0);return}function iX(a){a=a|0;dc(a|0);kW(a);return}function iY(b){b=b|0;var d=0,e=0;if(a[10968]|0){d=c[3314]|0}else{if(a[10976]|0){e=c[c[3316]>>2]|0}else{iv(13448,1);c[3318]=13448;c[3316]=13272;a[10976]=1;e=13448}c[3320]=e;de(e|0);c[3314]=13280;a[10968]=1;d=13280}e=c[d>>2]|0;c[b>>2]=e;de(e|0);return}function iZ(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;dV(a,e,96)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=bY(4)|0;h=g;kq(h);bq(g|0,9232,138);return 0}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=bY(4)|0;h=g;kq(h);bq(g|0,9232,138);return 0}else{i=d;return f|0}return 0}function i_(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[(bc()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function i$(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[(bc()|0)>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function i0(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[(bc()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=984;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=985;break}else{h=e}}if((i|0)==984){return g|0}else if((i|0)==985){return g|0}return 0}function i1(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=994;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=996;break}if((b[(c[(bc()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=995;break}else{a=a+4|0}}if((h|0)==994){return g|0}else if((h|0)==995){return g|0}else if((h|0)==996){return g|0}return 0}function i2(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(b1()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function i3(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(b1()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function i4(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(b2()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function i5(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(b2()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function i6(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(b1()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function i7(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(b1()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function i8(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(b2()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function i9(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(b2()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function ja(a){a=a|0;var b=0;c[a>>2]=4392;b=c[a+8>>2]|0;if((b|0)!=0){bd(b|0)}dc(a|0);kW(a);return}function jb(a){a=a|0;return 0}function jc(a){a=a|0;dc(a|0);kW(a);return}function jd(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jo(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function je(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;l=i;i=i+8|0;m=l|0;n=m;o=i;i=i+1|0;i=i+7>>3<<3;p=e;while(1){if((p|0)==(f|0)){q=f;break}if((c[p>>2]|0)==0){q=p;break}else{p=p+4|0}}c[k>>2]=h;c[g>>2]=e;L1218:do{if((e|0)==(f|0)|(h|0)==(j|0)){r=e}else{p=d;s=j;t=b+8|0;u=o|0;v=h;w=e;x=q;while(1){y=c[p+4>>2]|0;c[m>>2]=c[p>>2];c[m+4>>2]=y;y=bK(c[t>>2]|0)|0;z=ku(v,g,x-w>>2,s-v|0,d)|0;if((y|0)!=0){bK(y|0)|0}if((z|0)==0){A=1;B=1119;break}else if((z|0)==(-1|0)){B=1082;break}y=(c[k>>2]|0)+z|0;c[k>>2]=y;if((y|0)==(j|0)){B=1115;break}if((x|0)==(f|0)){C=f;D=y;E=c[g>>2]|0}else{y=bK(c[t>>2]|0)|0;z=kt(u,0,d)|0;if((y|0)!=0){bK(y|0)|0}if((z|0)==-1){A=2;B=1121;break}y=c[k>>2]|0;if(z>>>0>(s-y|0)>>>0){A=1;B=1122;break}L1236:do{if((z|0)!=0){F=z;G=u;H=y;while(1){I=a[G]|0;c[k>>2]=H+1;a[H]=I;I=F-1|0;if((I|0)==0){break L1236}F=I;G=G+1|0;H=c[k>>2]|0}}}while(0);y=(c[g>>2]|0)+4|0;c[g>>2]=y;z=y;while(1){if((z|0)==(f|0)){J=f;break}if((c[z>>2]|0)==0){J=z;break}else{z=z+4|0}}C=J;D=c[k>>2]|0;E=y}if((E|0)==(f|0)|(D|0)==(j|0)){r=E;break L1218}else{v=D;w=E;x=C}}if((B|0)==1119){i=l;return A|0}else if((B|0)==1121){i=l;return A|0}else if((B|0)==1122){i=l;return A|0}else if((B|0)==1115){r=c[g>>2]|0;break}else if((B|0)==1082){c[k>>2]=v;L1253:do{if((w|0)==(c[g>>2]|0)){K=w}else{x=w;u=v;while(1){s=c[x>>2]|0;p=bK(c[t>>2]|0)|0;z=kt(u,s,n)|0;if((p|0)!=0){bK(p|0)|0}if((z|0)==-1){K=x;break L1253}p=(c[k>>2]|0)+z|0;c[k>>2]=p;z=x+4|0;if((z|0)==(c[g>>2]|0)){K=z;break}else{x=z;u=p}}}}while(0);c[g>>2]=K;A=2;i=l;return A|0}}}while(0);A=(r|0)!=(f|0)&1;i=l;return A|0}function jf(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L1270:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=w;x=v;w=bK(c[s>>2]|0)|0;y=kf(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){bK(w|0)|0}if((y|0)==(-1|0)){z=1137;break}else if((y|0)==0){A=2;z=1173;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){z=1169;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=bK(c[s>>2]|0)|0;F=ke(w,y,1,d)|0;if((E|0)!=0){bK(E|0)|0}if((F|0)!=0){A=2;z=1177;break}c[k>>2]=(c[k>>2]|0)+4;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L1270}else{t=C;u=D;v=B}}if((z|0)==1169){q=c[g>>2]|0;break}else if((z|0)==1137){c[k>>2]=t;L1295:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=bK(c[s>>2]|0)|0;E=ke(v,r,x-r|0,n)|0;if((o|0)!=0){bK(o|0)|0}if((E|0)==0){I=r+1|0}else if((E|0)==(-1|0)){z=1148;break}else if((E|0)==(-2|0)){z=1149;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L1295}else{v=E;r=I}}if((z|0)==1148){c[g>>2]=r;A=2;i=l;return A|0}else if((z|0)==1149){c[g>>2]=r;A=1;i=l;return A|0}}}while(0);c[g>>2]=H;A=(H|0)!=(f|0)&1;i=l;return A|0}else if((z|0)==1173){i=l;return A|0}else if((z|0)==1177){i=l;return A|0}}}while(0);A=(q|0)!=(f|0)&1;i=l;return A|0}function jg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;j=bK(c[b+8>>2]|0)|0;b=kt(e,0,d)|0;if((j|0)!=0){bK(j|0)|0}L1322:do{if((b|0)==(-1|0)|(b|0)==0){k=2}else{j=b-1|0;d=c[g>>2]|0;if(j>>>0>(f-d|0)>>>0){k=1;break}if((j|0)==0){k=0;break}else{l=j;m=e;n=d}while(1){d=a[m]|0;c[g>>2]=n+1;a[n]=d;d=l-1|0;if((d|0)==0){k=0;break L1322}l=d;m=m+1|0;n=c[g>>2]|0}}}while(0);i=h;return k|0}function jh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a+8|0;a=bK(c[b>>2]|0)|0;d=ks(0,0,1)|0;if((a|0)!=0){bK(a|0)|0}if((d|0)!=0){e=-1;return e|0}d=c[b>>2]|0;if((d|0)==0){e=1;return e|0}e=bK(d|0)|0;d=bi()|0;if((e|0)==0){f=(d|0)==1;g=f&1;return g|0}bK(e|0)|0;f=(d|0)==1;g=f&1;return g|0}function ji(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=d;d=0;j=0;while(1){k=bK(c[i>>2]|0)|0;l=kd(a,h-a|0,b)|0;if((k|0)!=0){bK(k|0)|0}if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;m=1235;break}else if((l|0)==0){n=1;o=a+1|0}else{n=l;o=a+l|0}l=n+d|0;k=j+1|0;if(k>>>0>=f>>>0|(o|0)==(e|0)){g=l;m=1233;break}else{a=o;d=l;j=k}}if((m|0)==1235){return g|0}else if((m|0)==1233){return g|0}return 0}function jj(a){a=a|0;var b=0,d=0,e=0;b=c[a+8>>2]|0;do{if((b|0)==0){d=1}else{a=bK(b|0)|0;e=bi()|0;if((a|0)==0){d=e;break}bK(a|0)|0;d=e}}while(0);return d|0}function jk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function jl(a){a=a|0;return 0}function jm(a){a=a|0;return 0}function jn(a){a=a|0;return 4}function jo(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L1385:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=1288;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=1283;break L1385}c[j>>2]=p+1;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=1280;break L1385}c[j>>2]=p+1;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=1279;break L1385}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=1290;break L1385}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=1281;break L1385}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=1284;break L1385}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=1285;break L1385}if((d-(c[j>>2]|0)|0)<4){m=1;o=1278;break L1385}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=1286;break L1385}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=1282;break}}if((o|0)==1281){return m|0}else if((o|0)==1282){return m|0}else if((o|0)==1283){return m|0}else if((o|0)==1284){return m|0}else if((o|0)==1285){return m|0}else if((o|0)==1286){return m|0}else if((o|0)==1288){return m|0}else if((o|0)==1290){return m|0}else if((o|0)==1278){return m|0}else if((o|0)==1279){return m|0}else if((o|0)==1280){return m|0}return 0}function jp(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L1430:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L1432:while(1){if(e>>>0>=i>>>0){o=n;break L1430}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=1334;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1}else{if((p&255)<194){r=2;s=1335;break L1432}if((p&255)<224){if((h-n|0)<2){r=1;s=1336;break L1432}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=1337;break L1432}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=1338;break L1432}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2;break}if((p&255)<240){if((h-n|0)<3){r=1;s=1339;break L1432}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=1340;break L1432}}else if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=1341;break L1432}}else{if((u&-64)<<24>>24!=-128){r=2;s=1352;break L1432}}v=t&255;if((v&192|0)!=128){r=2;s=1346;break L1432}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=1349;break L1432}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3;break}if((p&255)>=245){r=2;s=1342;break L1432}if((h-n|0)<4){r=1;s=1343;break L1432}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==240){if((t+112&255)>=48){r=2;s=1333;break L1432}}else if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=1350;break L1432}}else{if((t&-64)<<24>>24!=-128){r=2;s=1351;break L1432}}w=v&255;if((w&192|0)!=128){r=2;s=1344;break L1432}v=u&255;if((v&192|0)!=128){r=2;s=1345;break L1432}if((l-e|0)<4){r=1;s=1348;break L1432}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=1347;break L1432}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L1430}}if((s|0)==1333){return r|0}else if((s|0)==1334){return r|0}else if((s|0)==1335){return r|0}else if((s|0)==1336){return r|0}else if((s|0)==1337){return r|0}else if((s|0)==1338){return r|0}else if((s|0)==1339){return r|0}else if((s|0)==1340){return r|0}else if((s|0)==1341){return r|0}else if((s|0)==1342){return r|0}else if((s|0)==1343){return r|0}else if((s|0)==1344){return r|0}else if((s|0)==1345){return r|0}else if((s|0)==1346){return r|0}else if((s|0)==1347){return r|0}else if((s|0)==1348){return r|0}else if((s|0)==1349){return r|0}else if((s|0)==1350){return r|0}else if((s|0)==1351){return r|0}else if((s|0)==1352){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0&1;return r|0}function jq(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L1499:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L1501:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L1499}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L1499}if((k&255)<224){if((g-j|0)<2){m=j;break L1499}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L1499}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L1499}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L1499}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==224){if((p&-32)<<24>>24!=-96){s=1373;break L1501}}else if((l|0)==237){if((p&-32)<<24>>24!=-128){s=1375;break L1501}}else{if((p&-64)<<24>>24!=-128){s=1377;break L1501}}t=r&255;if((t&192|0)!=128){m=j;break L1499}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L1499}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L1499}u=j;if((g-u|0)<4){m=j;break L1499}if((e-i|0)>>>0<2){m=j;break L1499}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==240){if((t+112&255)>=48){s=1386;break L1501}}else if((l|0)==244){if((t&-16)<<24>>24!=-128){s=1388;break L1501}}else{if((t&-64)<<24>>24!=-128){s=1390;break L1501}}v=p&255;if((v&192|0)!=128){m=j;break L1499}p=r&255;if((p&192|0)!=128){m=j;break L1499}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L1499}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L1499}}if((s|0)==1373){w=q-b|0;return w|0}else if((s|0)==1375){w=q-b|0;return w|0}else if((s|0)==1377){w=q-b|0;return w|0}else if((s|0)==1386){w=u-b|0;return w|0}else if((s|0)==1388){w=u-b|0;return w|0}else if((s|0)==1390){w=u-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function jr(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jp(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function js(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jq(c,d,e,1114111,0)|0}function jt(a){a=a|0;dc(a|0);kW(a);return}function ju(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jz(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function jv(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function jw(a){a=a|0;return 0}function jx(a){a=a|0;return 0}function jy(a){a=a|0;return 4}function jz(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L1570:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=1433;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=1438;break L1570}c[h>>2]=b+1;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=1435;break L1570}c[h>>2]=b+1;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=1434;break L1570}c[h>>2]=b+1;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=1439;break L1570}c[h>>2]=b+1;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=1432;break}}if((l|0)==1433){return k|0}else if((l|0)==1434){return k|0}else if((l|0)==1439){return k|0}else if((l|0)==1432){return k|0}else if((l|0)==1438){return k|0}else if((l|0)==1435){return k|0}return 0}function jA(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L1602:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L1604:while(1){if(k>>>0>=h>>>0){m=b;break L1602}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=1499;break L1604}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1}else{if((n&255)<194){p=2;q=1492;break L1604}if((n&255)<224){if((g-b|0)<2){p=1;q=1493;break L1604}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=1486;break L1604}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=1484;break L1604}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2;break}if((n&255)<240){if((g-b|0)<3){p=1;q=1485;break L1604}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=1482;break L1604}}else if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=1487;break L1604}}else{if((s&-64)<<24>>24!=-128){p=2;q=1496;break L1604}}t=r&255;if((t&192|0)!=128){p=2;q=1497;break L1604}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=1498;break L1604}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3;break}if((n&255)>=245){p=2;q=1494;break L1604}if((g-b|0)<4){p=1;q=1495;break L1604}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=1489;break L1604}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=1490;break L1604}}else{if((r&-64)<<24>>24!=-128){p=2;q=1491;break L1604}}u=t&255;if((u&192|0)!=128){p=2;q=1480;break L1604}t=s&255;if((t&192|0)!=128){p=2;q=1481;break L1604}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=1488;break L1604}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L1602}}if((q|0)==1480){return p|0}else if((q|0)==1481){return p|0}else if((q|0)==1482){return p|0}else if((q|0)==1484){return p|0}else if((q|0)==1485){return p|0}else if((q|0)==1486){return p|0}else if((q|0)==1487){return p|0}else if((q|0)==1488){return p|0}else if((q|0)==1489){return p|0}else if((q|0)==1490){return p|0}else if((q|0)==1491){return p|0}else if((q|0)==1492){return p|0}else if((q|0)==1493){return p|0}else if((q|0)==1494){return p|0}else if((q|0)==1495){return p|0}else if((q|0)==1496){return p|0}else if((q|0)==1497){return p|0}else if((q|0)==1498){return p|0}else if((q|0)==1499){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0&1;return p|0}function jB(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L1669:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L1671:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L1669}n=j+1|0}else{if((k&255)<194){m=j;break L1669}if((k&255)<224){if((g-j|0)<2){m=j;break L1669}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L1669}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L1669}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L1669}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==224){if((o&-32)<<24>>24!=-96){r=1520;break L1671}}else if((l|0)==237){if((o&-32)<<24>>24!=-128){r=1522;break L1671}}else{if((o&-64)<<24>>24!=-128){r=1524;break L1671}}s=q&255;if((s&192|0)!=128){m=j;break L1669}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L1669}n=j+3|0;break}if((k&255)>=245){m=j;break L1669}t=j;if((g-t|0)<4){m=j;break L1669}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==240){if((s+112&255)>=48){r=1532;break L1671}}else if((l|0)==244){if((s&-16)<<24>>24!=-128){r=1534;break L1671}}else{if((s&-64)<<24>>24!=-128){r=1536;break L1671}}u=o&255;if((u&192|0)!=128){m=j;break L1669}o=q&255;if((o&192|0)!=128){m=j;break L1669}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L1669}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L1669}i=i+1|0;j=n}if((r|0)==1520){v=p-b|0;return v|0}else if((r|0)==1522){v=p-b|0;return v|0}else if((r|0)==1524){v=p-b|0;return v|0}else if((r|0)==1532){v=t-b|0;return v|0}else if((r|0)==1534){v=t-b|0;return v|0}else if((r|0)==1536){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function jC(b){b=b|0;return a[b+8|0]|0}function jD(a){a=a|0;return c[a+8>>2]|0}function jE(b){b=b|0;return a[b+9|0]|0}function jF(a){a=a|0;return c[a+12>>2]|0}function jG(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jA(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function jH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jB(c,d,e,1114111,0)|0}function jI(a){a=a|0;dc(a|0);kW(a);return}function jJ(a){a=a|0;dc(a|0);kW(a);return}function jK(a){a=a|0;c[a>>2]=3856;dQ(a+12|0);dc(a|0);kW(a);return}function jL(a){a=a|0;c[a>>2]=3856;dQ(a+12|0);dc(a|0);return}function jM(a){a=a|0;c[a>>2]=3808;dQ(a+16|0);dc(a|0);kW(a);return}function jN(a){a=a|0;c[a>>2]=3808;dQ(a+16|0);dc(a|0);return}function jO(a,b){a=a|0;b=b|0;dX(a,b+12|0);return}function jP(a,b){a=a|0;b=b|0;dX(a,b+16|0);return}function jQ(a,b){a=a|0;b=b|0;dY(a,1760,4);return}function jR(a,b){a=a|0;b=b|0;en(a,1736,km(1736)|0);return}function jS(a,b){a=a|0;b=b|0;dY(a,1728,5);return}function jT(a,b){a=a|0;b=b|0;en(a,1704,km(1704)|0);return}function jU(b){b=b|0;var d=0;if(a[11064]|0){d=c[3440]|0;return d|0}if(!(a[10952]|0)){k2(12800|0,0|0,168|0);a1(274,0,u|0)|0;a[10952]=1}dR(12800,2224)|0;dR(12812,2216)|0;dR(12824,2208)|0;dR(12836,2192)|0;dR(12848,2176)|0;dR(12860,2168)|0;dR(12872,2152)|0;dR(12884,2144)|0;dR(12896,2136)|0;dR(12908,2096)|0;dR(12920,2088)|0;dR(12932,2080)|0;dR(12944,2064)|0;dR(12956,2056)|0;c[3440]=12800;a[11064]=1;d=12800;return d|0}function jV(b){b=b|0;var d=0;if(a[11008]|0){d=c[3418]|0;return d|0}if(!(a[10928]|0)){k2(12056|0,0|0,168|0);a1(152,0,u|0)|0;a[10928]=1}d9(12056,2640)|0;d9(12068,2608)|0;d9(12080,2576)|0;d9(12092,2536)|0;d9(12104,2480)|0;d9(12116,2448)|0;d9(12128,2408)|0;d9(12140,2392)|0;d9(12152,2336)|0;d9(12164,2320)|0;d9(12176,2304)|0;d9(12188,2288)|0;d9(12200,2272)|0;d9(12212,2256)|0;c[3418]=12056;a[11008]=1;d=12056;return d|0}function jW(b){b=b|0;var d=0;if(a[11056]|0){d=c[3438]|0;return d|0}if(!(a[10944]|0)){k2(12512|0,0|0,288|0);a1(176,0,u|0)|0;a[10944]=1}dR(12512,600)|0;dR(12524,584)|0;dR(12536,576)|0;dR(12548,568)|0;dR(12560,560)|0;dR(12572,552)|0;dR(12584,544)|0;dR(12596,536)|0;dR(12608,504)|0;dR(12620,496)|0;dR(12632,480)|0;dR(12644,464)|0;dR(12656,416)|0;dR(12668,408)|0;dR(12680,400)|0;dR(12692,392)|0;dR(12704,560)|0;dR(12716,384)|0;dR(12728,376)|0;dR(12740,2704)|0;dR(12752,2696)|0;dR(12764,2688)|0;dR(12776,2680)|0;dR(12788,2672)|0;c[3438]=12512;a[11056]=1;d=12512;return d|0}function jX(b){b=b|0;var d=0;if(a[11e3]|0){d=c[3416]|0;return d|0}if(!(a[10920]|0)){k2(11768|0,0|0,288|0);a1(124,0,u|0)|0;a[10920]=1}d9(11768,1216)|0;d9(11780,1176)|0;d9(11792,1152)|0;d9(11804,1104)|0;d9(11816,760)|0;d9(11828,1080)|0;d9(11840,1056)|0;d9(11852,1024)|0;d9(11864,984)|0;d9(11876,952)|0;d9(11888,912)|0;d9(11900,872)|0;d9(11912,856)|0;d9(11924,808)|0;d9(11936,792)|0;d9(11948,776)|0;d9(11960,760)|0;d9(11972,744)|0;d9(11984,728)|0;d9(11996,712)|0;d9(12008,680)|0;d9(12020,664)|0;d9(12032,648)|0;d9(12044,608)|0;c[3416]=11768;a[11e3]=1;d=11768;return d|0}function jY(b){b=b|0;var d=0;if(a[11072]|0){d=c[3442]|0;return d|0}if(!(a[10960]|0)){k2(12968|0,0|0,288|0);a1(122,0,u|0)|0;a[10960]=1}dR(12968,1256)|0;dR(12980,1248)|0;c[3442]=12968;a[11072]=1;d=12968;return d|0}function jZ(b){b=b|0;var d=0;if(a[11016]|0){d=c[3420]|0;return d|0}if(!(a[10936]|0)){k2(12224|0,0|0,288|0);a1(250,0,u|0)|0;a[10936]=1}d9(12224,1280)|0;d9(12236,1264)|0;c[3420]=12224;a[11016]=1;d=12224;return d|0}function j_(b){b=b|0;if(a[11080]|0){return 13776}dY(13776,1664,8);a1(266,13776,u|0)|0;a[11080]=1;return 13776}function j$(b){b=b|0;if(a[11024]|0){return 13688}en(13688,1624,km(1624)|0);a1(198,13688,u|0)|0;a[11024]=1;return 13688}function j0(b){b=b|0;if(a[11104]|0){return 13824}dY(13824,1592,8);a1(266,13824,u|0)|0;a[11104]=1;return 13824}function j1(b){b=b|0;if(a[11048]|0){return 13736}en(13736,1544,km(1544)|0);a1(198,13736,u|0)|0;a[11048]=1;return 13736}function j2(b){b=b|0;if(a[11096]|0){return 13808}dY(13808,1512,20);a1(266,13808,u|0)|0;a[11096]=1;return 13808}function j3(b){b=b|0;if(a[11040]|0){return 13720}en(13720,1416,km(1416)|0);a1(198,13720,u|0)|0;a[11040]=1;return 13720}function j4(b){b=b|0;if(a[11088]|0){return 13792}dY(13792,1400,11);a1(266,13792,u|0)|0;a[11088]=1;return 13792}function j5(b){b=b|0;if(a[11032]|0){return 13704}en(13704,1352,km(1352)|0);a1(198,13704,u|0)|0;a[11032]=1;return 13704}function j6(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;b8[f&511](a);return}else{f=c[(c[d>>2]|0)+(e-1)>>2]|0;b8[f&511](a);return}}function j7(a){a=a|0;d8(12500);d8(12488);d8(12476);d8(12464);d8(12452);d8(12440);d8(12428);d8(12416);d8(12404);d8(12392);d8(12380);d8(12368);d8(12356);d8(12344);d8(12332);d8(12320);d8(12308);d8(12296);d8(12284);d8(12272);d8(12260);d8(12248);d8(12236);d8(12224);return}function j8(a){a=a|0;dQ(13244);dQ(13232);dQ(13220);dQ(13208);dQ(13196);dQ(13184);dQ(13172);dQ(13160);dQ(13148);dQ(13136);dQ(13124);dQ(13112);dQ(13100);dQ(13088);dQ(13076);dQ(13064);dQ(13052);dQ(13040);dQ(13028);dQ(13016);dQ(13004);dQ(12992);dQ(12980);dQ(12968);return}function j9(a){a=a|0;d8(12044);d8(12032);d8(12020);d8(12008);d8(11996);d8(11984);d8(11972);d8(11960);d8(11948);d8(11936);d8(11924);d8(11912);d8(11900);d8(11888);d8(11876);d8(11864);d8(11852);d8(11840);d8(11828);d8(11816);d8(11804);d8(11792);d8(11780);d8(11768);return}function ka(a){a=a|0;dQ(12788);dQ(12776);dQ(12764);dQ(12752);dQ(12740);dQ(12728);dQ(12716);dQ(12704);dQ(12692);dQ(12680);dQ(12668);dQ(12656);dQ(12644);dQ(12632);dQ(12620);dQ(12608);dQ(12596);dQ(12584);dQ(12572);dQ(12560);dQ(12548);dQ(12536);dQ(12524);dQ(12512);return}function kb(a){a=a|0;d8(12212);d8(12200);d8(12188);d8(12176);d8(12164);d8(12152);d8(12140);d8(12128);d8(12116);d8(12104);d8(12092);d8(12080);d8(12068);d8(12056);return}function kc(a){a=a|0;dQ(12956);dQ(12944);dQ(12932);dQ(12920);dQ(12908);dQ(12896);dQ(12884);dQ(12872);dQ(12860);dQ(12848);dQ(12836);dQ(12824);dQ(12812);dQ(12800);return}function kd(a,b,c){a=a|0;b=b|0;c=c|0;return ke(0,a,b,(c|0)!=0?c:11288)|0}function ke(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?11280:f)|0;f=c[j>>2]|0;L1848:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0&1;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L1848}o=d+1|0;p=c[s+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L1864:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L1848}else{t=o;u=p;v=q;w=l}while(1){t=t+1|0;u=(w&255)-128|u<<6;v=v-1|0;if((u|0)>=0){break}if((v|0)==0){r=u;break L1864}w=a[t]|0;if(((w&255)-128|0)>>>0>63){break L1848}}c[j>>2]=0;c[m>>2]=u;k=e-v|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(bE()|0)>>2]=138;k=-1;i=g;return k|0}function kf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L1879:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L1879}z=y?s:x;A=t-z|0;x=kr(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L1879}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L1890:do{if((r|0)==0){D=n}else{if((p|0)==0|(o|0)==0){D=n;break}else{E=p;F=o;G=n;H=q;I=r}while(1){J=ke(H,I,F,f)|0;if((J+2|0)>>>0<3){break}A=(c[j>>2]|0)+J|0;c[j>>2]=A;B=E-1|0;C=G+1|0;if((B|0)==0|(F|0)==(J|0)){D=C;break L1890}else{E=B;F=F-J|0;G=C;H=H+4|0;I=A}}if((J|0)==0){c[j>>2]=0;D=G;break}else if((J|0)==(-1|0)){D=-1;break}else{c[f>>2]=0;D=G;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=c[j>>2];i=g;return D|0}function kg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}k=l+4|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b+16|0;k=b|0;l=c[k>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){iu(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=1726}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=1726;break}a[l]=1;p=j;q=h}}while(0);if((o|0)==1726){p=kS(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;do{if((d|0)==0){r=0}else{c[d>>2]=0;r=d}d=r+4|0;n=n-1|0;}while((n|0)!=0);n=p+(q<<2)|0;q=c[k>>2]|0;r=(c[f>>2]|0)-q|0;o=p+(g-(r>>2)<<2)|0;g=o;p=q;k0(g|0,p|0,r)|0;c[k>>2]=o;c[f>>2]=d;c[e>>2]=n;if((q|0)==0){return}if((q|0)==(j|0)){a[b+128|0]=0;return}else{kW(p);return}}function kh(a){a=a|0;return}function ki(a){a=a|0;return}function kj(a){a=a|0;return 1896|0}function kk(a){a=a|0;return}function kl(a){a=a|0;return}function km(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function kn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((d|0)==0){return a|0}else{e=b;f=d;g=a}while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}return a|0}function ko(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}else{f=d}do{f=f-1|0;c[a+(f<<2)>>2]=c[b+(f<<2)>>2];}while((f|0)!=0);return a|0}else{if(e){return a|0}else{g=b;h=d;i=a}while(1){d=h-1|0;c[i>>2]=c[g>>2];if((d|0)==0){break}else{g=g+4|0;h=d;i=i+4|0}}return a|0}return 0}function kp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((d|0)==0){return a|0}else{e=d;f=a}while(1){d=e-1|0;c[f>>2]=b;if((d|0)==0){break}else{e=d;f=f+4|0}}return a|0}function kq(a){a=a|0;c[a>>2]=3264;return}function kr(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;h=c[e>>2]|0;do{if((g|0)==0){i=1773}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=1773;break}if((b|0)==0){l=k;m=h;n=f;i=1784;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=1804}}while(0);if((i|0)==1773){if((b|0)==0){t=h;u=f;i=1775}else{v=h;w=b;x=f;i=1774}}L1980:while(1){if((i|0)==1804){i=0;h=d[p]|0;g=h>>>3;if((g-16|g+(o>>26))>>>0>7){i=1805;break}g=p+1|0;y=h-128|o<<6;do{if((y|0)<0){h=(d[g]|0)-128|0;if(h>>>0>63){i=1808;break L1980}k=p+2|0;z=h|y<<6;if((z|0)>=0){A=z;B=k;break}h=(d[k]|0)-128|0;if(h>>>0>63){i=1811;break L1980}A=h|z<<6;B=p+3|0}else{A=y;B=g}}while(0);c[q>>2]=A;v=B;w=q+4|0;x=r-1|0;i=1774;continue}else if((i|0)==1775){i=0;g=a[t]|0;do{if(((g&255)-1|0)>>>0<127){if((t&3|0)!=0){C=t;D=u;E=g;break}h=c[t>>2]|0;if(((h-16843009|h)&-2139062144|0)==0){F=u;G=t}else{C=t;D=u;E=h&255;break}do{G=G+4|0;F=F-4|0;H=c[G>>2]|0;}while(((H-16843009|H)&-2139062144|0)==0);C=G;D=F;E=H&255}else{C=t;D=u;E=g}}while(0);g=E&255;if((g-1|0)>>>0<127){t=C+1|0;u=D-1|0;i=1775;continue}h=g-194|0;if(h>>>0>50){I=D;J=b;K=C;i=1815;break}l=c[s+(h<<2)>>2]|0;m=C+1|0;n=D;i=1784;continue}else if((i|0)==1774){i=0;if((x|0)==0){L=f;i=1823;break}else{M=x;N=w;O=v}while(1){h=a[O]|0;do{if(((h&255)-1|0)>>>0<127){if((O&3|0)==0&M>>>0>3){P=M;Q=N;R=O}else{S=O;T=N;U=M;V=h;break}while(1){W=c[R>>2]|0;if(((W-16843009|W)&-2139062144|0)!=0){i=1798;break}c[Q>>2]=W&255;c[Q+4>>2]=d[R+1|0]|0;c[Q+8>>2]=d[R+2|0]|0;X=R+4|0;Y=Q+16|0;c[Q+12>>2]=d[R+3|0]|0;Z=P-4|0;if(Z>>>0>3){P=Z;Q=Y;R=X}else{i=1799;break}}if((i|0)==1798){i=0;S=R;T=Q;U=P;V=W&255;break}else if((i|0)==1799){i=0;S=X;T=Y;U=Z;V=a[X]|0;break}}else{S=O;T=N;U=M;V=h}}while(0);_=V&255;if((_-1|0)>>>0>=127){break}c[T>>2]=_;h=U-1|0;if((h|0)==0){L=f;i=1826;break L1980}else{M=h;N=T+4|0;O=S+1|0}}h=_-194|0;if(h>>>0>50){I=U;J=T;K=S;i=1815;break}o=c[s+(h<<2)>>2]|0;p=S+1|0;q=T;r=U;i=1804;continue}else if((i|0)==1784){i=0;h=(d[m]|0)>>>3;if((h-16|h+(l>>26))>>>0>7){i=1785;break}h=m+1|0;do{if((l&33554432|0)==0){$=h}else{if(((d[h]|0)-128|0)>>>0>63){i=1788;break L1980}g=m+2|0;if((l&524288|0)==0){$=g;break}if(((d[g]|0)-128|0)>>>0>63){i=1791;break L1980}$=m+3|0}}while(0);t=$;u=n-1|0;i=1775;continue}}if((i|0)==1805){aa=o;ab=p-1|0;ac=q;ad=r;i=1814}else if((i|0)==1785){aa=l;ab=m-1|0;ac=b;ad=n;i=1814}else if((i|0)==1808){aa=y;ab=p-1|0;ac=q;ad=r;i=1814}else if((i|0)==1811){aa=z;ab=p-1|0;ac=q;ad=r;i=1814}else if((i|0)==1791){aa=l;ab=m-1|0;ac=b;ad=n;i=1814}else if((i|0)==1788){aa=l;ab=m-1|0;ac=b;ad=n;i=1814}else if((i|0)==1823){return L|0}else if((i|0)==1826){return L|0}if((i|0)==1814){if((aa|0)==0){I=ad;J=ac;K=ab;i=1815}else{ae=ac;af=ab}}do{if((i|0)==1815){if((a[K]|0)!=0){ae=J;af=K;break}if((J|0)!=0){c[J>>2]=0;c[e>>2]=0}L=f-I|0;return L|0}}while(0);c[(bE()|0)>>2]=138;if((ae|0)==0){L=-1;return L|0}c[e>>2]=af;L=-1;return L|0}function ks(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0&1;i=g;return j|0}k=m-194|0;if(k>>>0>50){break}m=e+1|0;n=c[s+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>(((f*6&-1)-6|0)>>>0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m-16|m+(n>>26))>>>0>7){break}m=k-128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)-128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)-128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(bE()|0)>>2]=138;j=-1;i=g;return j|0}function kt(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[(bE()|0)>>2]=138;f=-1;return f|0}return 0}function ku(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L2101:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L2101}x=w?r:s;y=s-x|0;w=kv(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L2101}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L2112:do{if((q|0)==0){B=m}else{if((o|0)==0|(n|0)==0){B=m;break}else{C=o;D=n;E=m;F=p;G=q}while(1){H=kt(F,c[G>>2]|0,0)|0;if((H+1|0)>>>0<2){break}y=(c[h>>2]|0)+4|0;c[h>>2]=y;z=D-1|0;A=E+1|0;if((C|0)==(H|0)|(z|0)==0){B=A;break L2112}else{C=C-H|0;D=z;E=A;F=F+H|0;G=y}}if((H|0)!=0){B=-1;break}c[h>>2]=0;B=E}}while(0);if(!k){i=f;return B|0}c[b>>2]=c[h>>2];i=f;return B|0}function kv(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=kt(j,o,0)|0;if((k|0)==-1){l=-1;p=1915;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=1918;break}else{m=k;n=h;o=r}}if((p|0)==1915){i=f;return l|0}else if((p|0)==1918){i=f;return l|0}}L2138:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L2138}if(q>>>0>127){j=kt(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L2138}}i=f;return l|0}else{s=e;t=b}}while(0);L2150:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=1911;break}if(m>>>0>127){n=kt(b,m,0)|0;if((n|0)==-1){l=-1;p=1920;break}if(n>>>0>u>>>0){p=1907;break}o=c[w>>2]|0;kt(v,o,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L2150}else{u=z;v=y;w=m}}if((p|0)==1907){l=e-u|0;i=f;return l|0}else if((p|0)==1920){i=f;return l|0}else if((p|0)==1911){a[v]=0;x=u;break}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function kw(a){a=a|0;kW(a);return}function kx(a){a=a|0;kh(a|0);return}function ky(a){a=a|0;kh(a|0);kW(a);return}function kz(a){a=a|0;kh(a|0);kW(a);return}function kA(a){a=a|0;kh(a|0);kW(a);return}function kB(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kC(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function kD(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=kG(b,10792,10776,-1)|0;j=h;if((h|0)==0){g=0;break}k2(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;cn[c[(c[h>>2]|0)+28>>2]&31](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2];g=1}}while(0);i=e;return g|0}function kE(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;cn[c[(c[g>>2]|0)+28>>2]&31](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kF(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;cn[c[(c[j>>2]|0)+28>>2]&31](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;cn[c[(c[j>>2]|0)+28>>2]&31](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=1997;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=1996;break}}if((m|0)==1997){return}else if((m|0)==1996){return}}function kG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;k2(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;cl[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}b6[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else{o=0}}while(0);i=f;return o|0}function kH(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L2305:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L2307:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;cl[c[(c[v>>2]|0)+20>>2]&63](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L2307}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=2041;break L2305}if((c[o>>2]&2|0)==0){B=2041;break L2305}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=2040}else{D=x;B=2037}}else{D=0;B=2037}}while(0);do{if((B|0)==2037){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)!=1){C=D;B=2040;break}if((c[d+24>>2]|0)!=2){C=D;B=2040;break}a[d+54|0]=1;if(D){B=2041}else{B=2042}}}while(0);if((B|0)==2040){if(C){B=2041}else{B=2042}}if((B|0)==2041){c[i>>2]=3;return}else if((B|0)==2042){c[i>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;b6[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=2084;break}if((c[b>>2]|0)==1){B=2070;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;b6[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=2069;break}}if((B|0)==2084){return}else if((B|0)==2069){return}else if((B|0)==2070){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=2080;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=2073;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;b6[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=2083;break}}if((B|0)==2080){return}else if((B|0)==2083){return}else if((B|0)==2073){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=2068;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;b6[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=2077;break}}if((B|0)==2068){return}else if((B|0)==2077){return}}function kI(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;b6[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;cl[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=2097}else{if((a[j]&1)==0){m=1;n=2097}}L2407:do{if((n|0)==2097){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=2100;break}a[d+54|0]=1;if(m){break L2407}}else{n=2100}}while(0);if((n|0)==2100){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function kJ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function kK(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;cl[c[(c[p>>2]|0)+20>>2]&63](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L2454:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;do{if((a[p]&1)!=0){break L2454}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L2454}}else{if((c[o>>2]|0)==1){break L2454}if((c[q>>2]&2|0)==0){break L2454}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;cl[c[(c[u>>2]|0)+20>>2]&63](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;}while(s>>>0<n>>>0)}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function kL(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;cl[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function kM(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[2824]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=11336+(h<<2)|0;j=11336+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[2824]=e&(1<<g^-1)}else{if(l>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{bP();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[2826]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=11336+(p<<2)|0;m=11336+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[2824]=e&(1<<r^-1)}else{if(l>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{bP();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[2826]|0;if((l|0)!=0){q=c[2829]|0;d=l>>>3;l=d<<1;f=11336+(l<<2)|0;k=c[2824]|0;h=1<<d;do{if((k&h|0)==0){c[2824]=k|h;s=f;t=11336+(l+2<<2)|0}else{d=11336+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[2828]|0)>>>0){s=g;t=d;break}bP();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[2826]=m;c[2829]=e;n=i;return n|0}l=c[2825]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[11600+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[2828]|0;if(r>>>0<i>>>0){bP();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){bP();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){bP();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){bP();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){bP();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{bP();return 0;return 0}}}while(0);L2596:do{if((e|0)!=0){f=d+28|0;i=11600+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[2825]=c[2825]&(1<<c[f>>2]^-1);break L2596}else{if(e>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L2596}}}while(0);if(v>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[2826]|0;if((f|0)!=0){e=c[2829]|0;i=f>>>3;f=i<<1;q=11336+(f<<2)|0;k=c[2824]|0;g=1<<i;do{if((k&g|0)==0){c[2824]=k|g;y=q;z=11336+(f+2<<2)|0}else{i=11336+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[2828]|0)>>>0){y=l;z=i;break}bP();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[2826]=p;c[2829]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[2825]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[11600+(A<<2)>>2]|0;L2644:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L2644}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[11600+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[2826]|0)-g|0)>>>0){o=g;break}q=K;m=c[2828]|0;if(q>>>0<m>>>0){bP();return 0;return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){bP();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){bP();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){bP();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){bP();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{bP();return 0;return 0}}}while(0);L2694:do{if((e|0)!=0){i=K+28|0;m=11600+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[2825]=c[2825]&(1<<c[i>>2]^-1);break L2694}else{if(e>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L2694}}}while(0);if(L>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=11336+(e<<2)|0;r=c[2824]|0;j=1<<i;do{if((r&j|0)==0){c[2824]=r|j;O=m;P=11336+(e+2<<2)|0}else{i=11336+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[2828]|0)>>>0){O=d;P=i;break}bP();return 0;return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=11600+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[2825]|0;l=1<<Q;if((m&l|0)==0){c[2825]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=2336;break}else{l=l<<1;m=j}}if((T|0)==2336){if(S>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[2828]|0;if(m>>>0<i>>>0){bP();return 0;return 0}if(j>>>0<i>>>0){bP();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[2826]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[2829]|0;if(S>>>0>15){R=J;c[2829]=R+o;c[2826]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[2826]=0;c[2829]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[2827]|0;if(o>>>0<J>>>0){S=J-o|0;c[2827]=S;J=c[2830]|0;K=J;c[2830]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[2814]|0)==0){J=bN(8)|0;if((J-1&J|0)==0){c[2816]=J;c[2815]=J;c[2817]=-1;c[2818]=2097152;c[2819]=0;c[2935]=0;c[2814]=(b5(0)|0)&-16^1431655768;break}else{bP();return 0;return 0}}}while(0);J=o+48|0;S=c[2816]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[2934]|0;do{if((O|0)!=0){P=c[2932]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L2786:do{if((c[2935]&4|0)==0){O=c[2830]|0;L2788:do{if((O|0)==0){T=2366}else{L=O;P=11744;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=2366;break L2788}else{P=M}}if((P|0)==0){T=2366;break}L=R-(c[2827]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bD(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=2375}}while(0);do{if((T|0)==2366){O=bD(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[2815]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[2932]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[2934]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bD($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=2375}}while(0);L2808:do{if((T|0)==2375){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=2386;break L2786}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[2816]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bD(O|0)|0)==-1){bD(m|0)|0;W=Y;break L2808}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=2386;break L2786}}}while(0);c[2935]=c[2935]|4;ad=W;T=2383}else{ad=0;T=2383}}while(0);do{if((T|0)==2383){if(S>>>0>=2147483647){break}W=bD(S|0)|0;Z=bD(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=2386}}}while(0);do{if((T|0)==2386){ad=(c[2932]|0)+aa|0;c[2932]=ad;if(ad>>>0>(c[2933]|0)>>>0){c[2933]=ad}ad=c[2830]|0;L2828:do{if((ad|0)==0){S=c[2828]|0;if((S|0)==0|ab>>>0<S>>>0){c[2828]=ab}c[2936]=ab;c[2937]=aa;c[2939]=0;c[2833]=c[2814];c[2832]=-1;S=0;do{Y=S<<1;ac=11336+(Y<<2)|0;c[11336+(Y+3<<2)>>2]=ac;c[11336+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[2830]=ab+ae;c[2827]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[2831]=c[2818]}else{S=11744;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=2398;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==2398){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[2830]|0;Y=(c[2827]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[2830]=Z+ai;c[2827]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[2831]=c[2818];break L2828}}while(0);if(ab>>>0<(c[2828]|0)>>>0){c[2828]=ab}S=ab+aa|0;Y=11744;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=2408;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==2408){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[2830]|0)){J=(c[2827]|0)+K|0;c[2827]=J;c[2830]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[2829]|0)){J=(c[2826]|0)+K|0;c[2826]=J;c[2829]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L2873:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=11336+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}bP();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[2824]=c[2824]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}bP();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){bP();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{bP();return 0;return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=11600+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[2825]=c[2825]&(1<<c[P>>2]^-1);break L2873}else{if(m>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L2873}}}while(0);if(an>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=11336+(V<<2)|0;P=c[2824]|0;m=1<<J;do{if((P&m|0)==0){c[2824]=P|m;as=X;at=11336+(V+2<<2)|0}else{J=11336+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[2828]|0)>>>0){as=U;at=J;break}bP();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=11600+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[2825]|0;Q=1<<au;if((X&Q|0)==0){c[2825]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=2481;break}else{Q=Q<<1;X=m}}if((T|0)==2481){if(aw>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[2828]|0;if(X>>>0<$>>>0){bP();return 0;return 0}if(m>>>0<$>>>0){bP();return 0;return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=11744;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[2830]=ab+aB;c[2827]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[2831]=c[2818];c[ac+4>>2]=27;c[W>>2]=c[2936];c[W+4>>2]=c[11748>>2];c[W+8>>2]=c[11752>>2];c[W+12>>2]=c[11756>>2];c[2936]=ab;c[2937]=aa;c[2939]=0;c[2938]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=11336+(K<<2)|0;S=c[2824]|0;m=1<<W;do{if((S&m|0)==0){c[2824]=S|m;aC=Z;aD=11336+(K+2<<2)|0}else{W=11336+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[2828]|0)>>>0){aC=Q;aD=W;break}bP();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=11600+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[2825]|0;Q=1<<aE;if((Z&Q|0)==0){c[2825]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=2516;break}else{Q=Q<<1;Z=m}}if((T|0)==2516){if(aG>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[2828]|0;if(Z>>>0<m>>>0){bP();return 0;return 0}if(_>>>0<m>>>0){bP();return 0;return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[2827]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[2827]=_;ad=c[2830]|0;Q=ad;c[2830]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(bE()|0)>>2]=12;n=0;return n|0}function kN(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[2828]|0;if(b>>>0<e>>>0){bP()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){bP()}h=f&-8;i=a+(h-8)|0;j=i;L3045:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){bP()}if((n|0)==(c[2829]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[2826]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=11336+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){bP()}if((c[k+12>>2]|0)==(n|0)){break}bP()}}while(0);if((s|0)==(k|0)){c[2824]=c[2824]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){bP()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}bP()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){bP()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){bP()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){bP()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{bP()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=11600+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[2825]=c[2825]&(1<<c[v>>2]^-1);q=n;r=o;break L3045}else{if(p>>>0<(c[2828]|0)>>>0){bP()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L3045}}}while(0);if(A>>>0<(c[2828]|0)>>>0){bP()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2828]|0)>>>0){bP()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[2828]|0)>>>0){bP()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){bP()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){bP()}do{if((e&2|0)==0){if((j|0)==(c[2830]|0)){B=(c[2827]|0)+r|0;c[2827]=B;c[2830]=q;c[q+4>>2]=B|1;if((q|0)==(c[2829]|0)){c[2829]=0;c[2826]=0}if(B>>>0<=(c[2831]|0)>>>0){return}kP(0)|0;return}if((j|0)==(c[2829]|0)){B=(c[2826]|0)+r|0;c[2826]=B;c[2829]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L3150:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=11336+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[2828]|0)>>>0){bP()}if((c[u+12>>2]|0)==(j|0)){break}bP()}}while(0);if((g|0)==(u|0)){c[2824]=c[2824]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[2828]|0)>>>0){bP()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}bP()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[2828]|0)>>>0){bP()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[2828]|0)>>>0){bP()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){bP()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{bP()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=11600+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[2825]=c[2825]&(1<<c[t>>2]^-1);break L3150}else{if(f>>>0<(c[2828]|0)>>>0){bP()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L3150}}}while(0);if(E>>>0<(c[2828]|0)>>>0){bP()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[2828]|0)>>>0){bP()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[2828]|0)>>>0){bP()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[2829]|0)){H=B;break}c[2826]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=11336+(d<<2)|0;A=c[2824]|0;E=1<<r;do{if((A&E|0)==0){c[2824]=A|E;I=e;J=11336+(d+2<<2)|0}else{r=11336+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[2828]|0)>>>0){I=h;J=r;break}bP()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=11600+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[2825]|0;d=1<<K;do{if((r&d|0)==0){c[2825]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=2695;break}else{A=A<<1;J=E}}if((N|0)==2695){if(M>>>0<(c[2828]|0)>>>0){bP()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[2828]|0;if(J>>>0<E>>>0){bP()}if(B>>>0<E>>>0){bP()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[2832]|0)-1|0;c[2832]=q;if((q|0)==0){O=11752}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[2832]=-1;return}function kO(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=kM(b)|0;return d|0}if(b>>>0>4294967231){c[(bE()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=kQ(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=kM(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;k0(f|0,a|0,e)|0;kN(a);d=f;return d|0}function kP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[2814]|0)==0){b=bN(8)|0;if((b-1&b|0)==0){c[2816]=b;c[2815]=b;c[2817]=-1;c[2818]=2097152;c[2819]=0;c[2935]=0;c[2814]=(b5(0)|0)&-16^1431655768;break}else{bP();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[2830]|0;if((b|0)==0){d=0;return d|0}e=c[2827]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[2816]|0;g=ag((((-40-a-1+e+f|0)>>>0)/(f>>>0)>>>0)-1|0,f)|0;h=b;i=11744;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bD(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bD(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bD(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[2932]=(c[2932]|0)-j;h=c[2830]|0;m=(c[2827]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[2830]=j+o;c[2827]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[2831]=c[2818];d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[2827]|0)>>>0<=(c[2831]|0)>>>0){d=0;return d|0}c[2831]=-1;d=0;return d|0}function kQ(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[2828]|0;if(g>>>0<j>>>0){bP();return 0;return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){bP();return 0;return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){bP();return 0;return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[2816]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;kR(g+b|0,k);n=a;return n|0}if((i|0)==(c[2830]|0)){k=(c[2827]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[2830]=g+b;c[2827]=l;n=a;return n|0}if((i|0)==(c[2829]|0)){l=(c[2826]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[2826]=q;c[2829]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L3371:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=11336+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){bP();return 0;return 0}if((c[l+12>>2]|0)==(i|0)){break}bP();return 0;return 0}}while(0);if((k|0)==(l|0)){c[2824]=c[2824]&(1<<e^-1);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){bP();return 0;return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}bP();return 0;return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){bP();return 0;return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){bP();return 0;return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){bP();return 0;return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{bP();return 0;return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=11600+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[2825]=c[2825]&(1<<c[t>>2]^-1);break L3371}else{if(s>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L3371}}}while(0);if(y>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[2828]|0)>>>0){bP();return 0;return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;kR(g+b|0,q);n=a;return n|0}return 0}function kR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L3447:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[2828]|0;if(i>>>0<l>>>0){bP()}if((j|0)==(c[2829]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[2826]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=11336+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){bP()}if((c[p+12>>2]|0)==(j|0)){break}bP()}}while(0);if((q|0)==(p|0)){c[2824]=c[2824]&(1<<m^-1);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){bP()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}bP()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){bP()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){bP()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){bP()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{bP()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=11600+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[2825]=c[2825]&(1<<c[t>>2]^-1);n=j;o=k;break L3447}else{if(m>>>0<(c[2828]|0)>>>0){bP()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L3447}}}while(0);if(y>>>0<(c[2828]|0)>>>0){bP()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2828]|0)>>>0){bP()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[2828]|0)>>>0){bP()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[2828]|0;if(e>>>0<a>>>0){bP()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[2830]|0)){A=(c[2827]|0)+o|0;c[2827]=A;c[2830]=n;c[n+4>>2]=A|1;if((n|0)!=(c[2829]|0)){return}c[2829]=0;c[2826]=0;return}if((f|0)==(c[2829]|0)){A=(c[2826]|0)+o|0;c[2826]=A;c[2829]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L3546:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=11336+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){bP()}if((c[g+12>>2]|0)==(f|0)){break}bP()}}while(0);if((t|0)==(g|0)){c[2824]=c[2824]&(1<<s^-1);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){bP()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}bP()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){bP()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){bP()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){bP()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{bP()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=11600+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[2825]=c[2825]&(1<<c[l>>2]^-1);break L3546}else{if(m>>>0<(c[2828]|0)>>>0){bP()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L3546}}}while(0);if(C>>>0<(c[2828]|0)>>>0){bP()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[2828]|0)>>>0){bP()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[2828]|0)>>>0){bP()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[2829]|0)){F=A;break}c[2826]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=11336+(z<<2)|0;C=c[2824]|0;b=1<<o;do{if((C&b|0)==0){c[2824]=C|b;G=y;H=11336+(z+2<<2)|0}else{o=11336+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[2828]|0)>>>0){G=d;H=o;break}bP()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=11600+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[2825]|0;z=1<<I;if((o&z|0)==0){c[2825]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=3001;break}else{I=I<<1;J=G}}if((L|0)==3001){if(K>>>0<(c[2828]|0)>>>0){bP()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[2828]|0;if(J>>>0<I>>>0){bP()}if(L>>>0<I>>>0){bP()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function kS(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=kM(b)|0;if((d|0)!=0){e=3045;break}a=(I=c[3784]|0,c[3784]=I+0,I);if((a|0)==0){break}ch[a&3]()}if((e|0)==3045){return d|0}d=bY(4)|0;c[d>>2]=3232;bq(d|0,9216,32);return 0}function kT(a){a=a|0;return kS(a)|0}function kU(a){a=a|0;return}function kV(a){a=a|0;return 1608|0}function kW(a){a=a|0;if((a|0)!=0){kN(a)}return}function kX(a){a=a|0;kW(a);return}function kY(a){a=a|0;kW(a);return}function kZ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((aQ(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10&-1)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=3073}else{if((e|0)>0){v=0.0;w=e;x=l;y=3073}else{z=0.0;A=0.0}}if((y|0)==3073){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10&-1)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10&-1)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(bE()|0)>>2]=34;N=1.0;O=8;P=511;y=3090}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=3090}}if((y|0)==3090){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=3090}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function k_(a,b,c){a=a|0;b=b|0;c=c|0;return+(+kZ(a,b))}function k$(){var a=0;a=bY(4)|0;c[a>>2]=3232;bq(a|0,9216,32)}function k0(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function k1(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{k0(b,c,d)|0}}function k2(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function k3(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function k4(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function k5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function k6(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function k7(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function k8(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function k9(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function la(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function lb(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function lc(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c)|0;f=a>>>16;a=(e>>>16)+(ag(d,f)|0)|0;d=b>>>16;b=ag(d,c)|0;return(K=(a>>>16)+(ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function ld(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=k6(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=k6((li(i,b,k6(g^c,h^d,g,h)|0,K,0)|0)^a,K^e,a,e)|0;return(K=K,f)|0}function le(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=k6(h^a,j^b,h,j)|0;b=K;a=k6(k^d,l^e,k,l)|0;li(m,b,a,K,g)|0;a=k6(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,a)|0}function lf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=lc(e,a)|0;f=K;return(K=(ag(b,a)|0)+(ag(d,e)|0)+f|f&0,c&-1|0)|0}function lg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=li(a,b,c,d,0)|0;return(K=K,e)|0}function lh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;li(a,b,d,e,g)|0;i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function li(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a&-1;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((lb(l|0)|0)>>>0);return(K=n,o)|0}p=(la(l|0)|0)-(la(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(la(l|0)|0)-(la(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(la(j|0)|0)+33-(la(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a&-1|0;return(K=n,o)|0}else{p=lb(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d&-1|0;d=k|e&0;e=k5(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;k6(e,k,j,a)|0;b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=k6(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(J|0)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function lj(){bZ()}function lk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;b6[a&7](b|0,c|0,d|0,e|0,f|0)}function ll(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;b7[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function lm(a,b){a=a|0;b=b|0;b8[a&511](b|0)}function ln(a,b,c){a=a|0;b=b|0;c=c|0;b9[a&127](b|0,c|0)}function lo(a,b,c){a=a|0;b=b|0;c=c|0;return ca[a&63](b|0,c|0)|0}function lp(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return cb[a&31](b|0,c|0,d|0,e|0,f|0)|0}function lq(a,b){a=a|0;b=b|0;return cc[a&255](b|0)|0}function lr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cd[a&63](b|0,c|0,d|0)|0}function ls(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ce[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function lt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;cf[a&7](b|0,c|0,d|0)}function lu(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;cg[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function lv(a){a=a|0;ch[a&3]()}function lw(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return ci[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function lx(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;cj[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function ly(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ck[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function lz(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;cl[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function lA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return cm[a&15](b|0,c|0,d|0,e|0)|0}function lB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;cn[a&31](b|0,c|0,d|0,e|0)}function lC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0)}function lD(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(1)}function lE(a){a=a|0;ah(2)}function lF(a,b){a=a|0;b=b|0;ah(3)}function lG(a,b){a=a|0;b=b|0;ah(4);return 0}function lH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(5);return 0}function lI(a){a=a|0;ah(6);return 0}function lJ(a,b,c){a=a|0;b=b|0;c=c|0;ah(7);return 0}function lK(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(8)}function lL(a,b,c){a=a|0;b=b|0;c=c|0;ah(9)}function lM(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(10)}function lN(){ah(11)}function lO(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(12);return 0}function lP(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(13)}function lQ(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(14)}function lR(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(15)}function lS(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(16);return 0}function lT(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17)}
// EMSCRIPTEN_END_FUNCS
var b6=[lC,lC,kI,lC,kC,lC,kH,lC];var b7=[lD,lD,gJ,lD,gS,lD,gV,lD,ik,lD,gw,lD,gu,lD,ic,lD,gD,lD,gI,lD,gW,lD,gh,lD,ga,lD,gH,lD,f0,lD,gT,lD,gc,lD,f2,lD,fZ,lD,f_,lD,fT,lD,f1,lD,fX,lD,fV,lD,f7,lD,f6,lD,f4,lD,gX,lD,fG,lD,gE,lD,fK,lD,fC,lD,fE,lD,fI,lD,fz,lD,fQ,lD,fP,lD,fM,lD,fw,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD,lD];var b8=[lE,lE,io,lE,ft,lE,go,lE,dI,lE,eh,lE,iH,lE,ds,lE,g5,lE,f8,lE,dC,lE,dH,lE,fR,lE,fi,lE,fe,lE,cR,lE,kU,lE,dD,lE,iS,lE,iV,lE,gR,lE,fS,lE,kq,lE,e8,lE,ii,lE,iT,lE,eP,lE,fu,lE,hE,lE,iO,lE,jL,lE,iX,lE,kk,lE,cK,lE,jK,lE,fc,lE,c5,lE,dH,lE,fm,lE,ht,lE,jN,lE,iU,lE,kN,lE,ia,lE,jJ,lE,eS,lE,fl,lE,dD,lE,j6,lE,f9,lE,dd,lE,cQ,lE,hF,lE,eO,lE,eY,lE,g3,lE,gQ,lE,ff,lE,hy,lE,kY,lE,eg,lE,j8,lE,j9,lE,iN,lE,e9,lE,eH,lE,kz,lE,ja,lE,jc,lE,ki,lE,eQ,lE,fd,lE,hQ,lE,db,lE,hK,lE,fa,lE,kb,lE,kl,lE,jt,lE,dl,lE,cI,lE,iQ,lE,g4,lE,hX,lE,kw,lE,jI,lE,hj,lE,ib,lE,ka,lE,hs,lE,gn,lE,fh,lE,cP,lE,fj,lE,eU,lE,dO,lE,h3,lE,hW,lE,jM,lE,d8,lE,c4,lE,dJ,lE,ki,lE,kA,lE,eX,lE,dP,lE,eN,lE,dm,lE,e7,lE,ih,lE,cJ,lE,et,lE,eW,lE,dt,lE,iY,lE,fg,lE,hL,lE,gB,lE,hz,lE,c$,lE,it,lE,h4,lE,eT,lE,eG,lE,eV,lE,j7,lE,gC,lE,ky,lE,ip,lE,c_,lE,kx,lE,g6,lE,hR,lE,dQ,lE,iW,lE,dG,lE,eR,lE,kc,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE,lE];var b9=[lF,lF,jS,lF,c0,lF,hO,lF,jP,lF,hp,lF,jO,lF,im,lF,ev,lF,hx,lF,hq,lF,hJ,lF,hw,lF,hu,lF,hP,lF,iP,lF,hn,lF,dn,lF,hr,lF,hM,lF,jR,lF,cL,lF,hB,lF,dF,lF,hA,lF,jT,lF,ho,lF,hD,lF,jQ,lF,hm,lF,d0,lF,c6,lF,ir,lF,du,lF,hG,lF,hl,lF,hk,lF,hv,lF,hH,lF,hI,lF,hC,lF,hN,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF,lF];var ca=[lG,lG,i6,lG,dx,lG,iD,lG,iw,lG,eu,lG,c9,lG,dq,lG,i2,lG,cU,lG,i8,lG,eB,lG,i4,lG,cX,lG,d5,lG,c2,lG,eA,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG,lG];var cb=[lH,lH,jk,lH,ji,lH,jH,lH,iz,lH,iJ,lH,js,lH,e6,lH,iL,lH,iG,lH,jg,lH,e4,lH,jv,lH,lH,lH,lH,lH,lH,lH];var cc=[lI,lI,j5,lI,he,lI,d4,lI,jX,lI,el,lI,j3,lI,ha,lI,jh,lI,jn,lI,gA,lI,jV,lI,dw,lI,eL,lI,ez,lI,j$,lI,jZ,lI,jw,lI,kj,lI,dg,lI,jF,lI,jC,lI,j_,lI,jm,lI,cV,lI,jD,lI,d2,lI,hi,lI,j0,lI,dv,lI,c1,lI,hb,lI,jb,lI,j4,lI,jy,lI,hg,lI,jU,lI,c7,lI,jx,lI,jj,lI,e3,lI,g9,lI,c8,lI,jE,lI,d3,lI,ex,lI,dp,lI,cW,lI,hc,lI,iC,lI,iB,lI,kV,lI,ey,lI,g7,lI,jW,lI,iA,lI,g8,lI,df,lI,hd,lI,hf,lI,jY,lI,hh,lI,gP,lI,j2,lI,j1,lI,jl,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI,lI];var cd=[lJ,lJ,e5,lJ,i7,lJ,i5,lJ,kD,lJ,iE,lJ,fr,lJ,dK,lJ,eF,lJ,ek,lJ,i_,lJ,ew,lJ,iq,lJ,cM,lJ,iF,lJ,i3,lJ,eK,lJ,dj,lJ,i9,lJ,ij,lJ,d1,lJ,eM,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ,lJ];var ce=[lK,lK,gy,lK,gx,lK,gl,lK,gi,lK,lK,lK,lK,lK,lK,lK];var cf=[lL,lL,di,lL,fb,lL,lL,lL];var cg=[lM,lM,g2,lM,g1,lM,hT,lM,h$,lM,hZ,lM,h1,lM,lM,lM];var ch=[lN,lN,lj,lN];var ci=[lO,lO,ix,lO,jf,lO,jr,lO,iy,lO,ju,lO,jG,lO,je,lO,jd,lO,lO,lO,lO,lO,lO,lO,lO,lO,lO,lO,lO,lO,lO,lO];var cj=[lP,lP,gZ,lP,gK,lP,lP,lP];var ck=[lQ,lQ,id,lQ,h7,lQ,lQ,lQ];var cl=[lR,lR,kK,lR,gv,lR,gp,lR,gr,lR,kL,lR,gF,lR,il,lR,eD,lR,cT,lR,gq,lR,gd,lR,gg,lR,gb,lR,kJ,lR,d6,lR,is,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR,lR];var cm=[lS,lS,i$,lS,i0,lS,iK,lS,iI,lS,i1,lS,lS,lS,lS,lS];var cn=[lT,lT,cE,lT,kE,lT,kF,lT,d7,lT,kB,lT,eE,lT,cN,lT,fs,lT,fk,lT,lT,lT,lT,lT,lT,lT,lT,lT,lT,lT,lT,lT];return{_strlen:k3,_free:kN,_main:cG,_realloc:kO,_memmove:k1,__GLOBAL__I_a:dz,_memset:k2,_malloc:kM,_memcpy:k0,_strcpy:k4,stackAlloc:co,stackSave:cp,stackRestore:cq,setThrew:cr,setTempRet0:cu,setTempRet1:cv,setTempRet2:cw,setTempRet3:cx,setTempRet4:cy,setTempRet5:cz,setTempRet6:cA,setTempRet7:cB,setTempRet8:cC,setTempRet9:cD,dynCall_viiiii:lk,dynCall_viiiiiii:ll,dynCall_vi:lm,dynCall_vii:ln,dynCall_iii:lo,dynCall_iiiiii:lp,dynCall_ii:lq,dynCall_iiii:lr,dynCall_viiiiif:ls,dynCall_viii:lt,dynCall_viiiiiiii:lu,dynCall_v:lv,dynCall_iiiiiiiii:lw,dynCall_viiiiiiiii:lx,dynCall_viiiiiif:ly,dynCall_viiiiii:lz,dynCall_iiiii:lA,dynCall_viiii:lB}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "__isFloat": __isFloat, "_strtoull": _strtoull, "_fflush": _fflush, "_clGetPlatformIDs": _clGetPlatformIDs, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_read": _read, "_fsync": _fsync, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_clGetDeviceIDs": _clGetDeviceIDs, "_fgetc": _fgetc, "_atexit": _atexit, "_clCreateContext": _clCreateContext, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "_clCreateBuffer": _clCreateBuffer, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "_asprintf": _asprintf, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___locale_mb_cur_max": ___locale_mb_cur_max, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_call_unexpected": ___cxa_call_unexpected, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_llvm_eh_exception": _llvm_eh_exception, "_pread": _pread, "_fopen": _fopen, "_open": _open, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_clSetKernelArg": _clSetKernelArg, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "__ZSt9terminatev": __ZSt9terminatev, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_llvm_lifetime_start": _llvm_lifetime_start, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "_ungetc": _ungetc, "_vsprintf": _vsprintf, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_isdigit": _isdigit, "_strtoll": _strtoll, "__reallyNegative": __reallyNegative, "_clCreateCommandQueue": _clCreateCommandQueue, "_clBuildProgram": _clBuildProgram, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "_fseek": _fseek, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_pure_virtual": ___cxa_pure_virtual, "_clCreateKernel": _clCreateKernel, "_vasprintf": _vasprintf, "_clCreateProgramWithSource": _clCreateProgramWithSource, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "___fsmu8": ___fsmu8, "_stdout": _stdout, "___dso_handle": ___dso_handle }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiif = Module["dynCall_viiiiif"] = asm["dynCall_viiiiif"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiif = Module["dynCall_viiiiiif"] = asm["dynCall_viiiiiif"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
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
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
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
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
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
