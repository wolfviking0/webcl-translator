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
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
STATICTOP = STATIC_BASE + 15088;
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
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,104,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,120,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,114,0,0,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,74,97,110,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,69,114,114,111,114,32,105,110,32,107,101,114,110,101,108,58,32,0,0,0,0,0,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,67,76,32,112,114,111,103,114,97,109,32,102,114,111,109,32,115,111,117,114,99,101,46,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,32,102,111,114,32,114,101,97,100,105,110,103,58,32,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,109,97,110,100,81,117,101,117,101,32,102,111,114,32,100,101,118,105,99,101,32,48,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,100,101,118,105,99,101,32,73,68,115,0,0,0,0,0,0,0,0,78,111,32,100,101,118,105,99,101,115,32,97,118,97,105,108,97,98,108,101,46,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,99,97,108,108,32,116,111,32,99,108,71,101,116,67,111,110,116,101,120,116,73,110,102,111,40,46,46,46,44,71,76,95,67,79,78,84,69,88,84,95,68,69,86,73,67,69,83,44,46,46,46,41,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,110,32,79,112,101,110,67,76,32,71,80,85,32,111,114,32,67,80,85,32,99,111,110,116,101,120,116,46,0,0,69,120,101,99,117,116,101,100,32,112,114,111,103,114,97,109,32,115,117,99,99,101,115,102,117,108,108,121,46,0,0,0,32,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,114,101,115,117,108,116,32,98,117,102,102,101,114,46,0,0,0,0,118,101,99,116,111,114,0,0,69,114,114,111,114,32,113,117,101,117,105,110,103,32,107,101,114,110,101,108,32,102,111,114,32,101,120,101,99,117,116,105,111,110,46,0,0,0,0,0,37,46,48,76,102,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,69,114,114,111,114,32,115,101,116,116,105,110,103,32,107,101,114,110,101,108,32,97,114,103,117,109,101,110,116,115,46,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,107,101,114,110,101,108,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,104,101,108,108,111,95,107,101,114,110,101,108,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,58,32,0,0,0,0,0,0,104,101,108,108,111,95,119,111,114,108,100,95,50,46,99,108,0,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,46,0,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,69,114,114,111,114,32,99,114,101,97,116,105,110,103,32,109,101,109,111,114,121,32,111,98,106,101,99,116,115,46,0,0,67,111,117,108,100,32,110,111,116,32,99,114,101,97,116,101,32,71,80,85,32,99,111,110,116,101,120,116,44,32,116,114,121,105,110,103,32,67,80,85,46,46,46,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,102,105,110,100,32,97,110,121,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,115,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,46,0,0,32,0,0,0,118,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,46,0,0,198,0,0,0,164,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,46,0,0,72,0,0,0,10,1,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,46,0,0,94,0,0,0,8,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,46,0,0,94,0,0,0,22,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,46,0,0,170,0,0,0,84,0,0,0,48,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,46,0,0,238,0,0,0,188,0,0,0,48,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,46,0,0,162,0,0,0,190,0,0,0,48,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,4,1,0,0,142,0,0,0,48,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,47,0,0,2,1,0,0,18,0,0,0,48,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,47,0,0,160,0,0,0,110,0,0,0,48,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,47,0,0,40,0,0,0,112,0,0,0,48,0,0,0,124,0,0,0,4,0,0,0,28,0,0,0,6,0,0,0,20,0,0,0,54,0,0,0,2,0,0,0,248,255,255,255,216,47,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,248,0,0,0,230,0,0,0,48,0,0,0,20,0,0,0,16,0,0,0,58,0,0,0,24,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,0,48,0,0,72,0,0,0,108,0,0,0,120,0,0,0,128,0,0,0,66,0,0,0,44,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,48,0,0,78,0,0,0,192,0,0,0,48,0,0,0,50,0,0,0,40,0,0,0,8,0,0,0,38,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,48,0,0,60,0,0,0,68,0,0,0,48,0,0,0,42,0,0,0,86,0,0,0,12,0,0,0,54,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,48,0,0,252,0,0,0,2,0,0,0,48,0,0,0,26,0,0,0,34,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,48,0,0,46,0,0,0,214,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,48,0,0,220,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,48,0,0,28,0,0,0,140,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,48,0,0,6,0,0,0,176,0,0,0,48,0,0,0,28,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,48,0,0,98,0,0,0,20,0,0,0,48,0,0,0,20,0,0,0,24,0,0,0,32,0,0,0,22,0,0,0,30,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,48,0,0,42,0,0,0,24,0,0,0,48,0,0,0,46,0,0,0,44,0,0,0,36,0,0,0,38,0,0,0,26,0,0,0,42,0,0,0,34,0,0,0,52,0,0,0,50,0,0,0,48,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,0,0,54,0,0,0,4,0,0,0,48,0,0,0,76,0,0,0,68,0,0,0,62,0,0,0,64,0,0,0,56,0,0,0,66,0,0,0,60,0,0,0,74,0,0,0,72,0,0,0,70,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,49,0,0,74,0,0,0,92,0,0,0,48,0,0,0,14,0,0,0,16,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,0,0,26,0,0,0,178,0,0,0,48,0,0,0,22,0,0,0,18,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,49,0,0,236,0,0,0,134,0,0,0,48,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,64,0,0,0,4,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,49,0,0,182,0,0,0,62,0,0,0,48,0,0,0,2,0,0,0,8,0,0,0,8,0,0,0,110,0,0,0,100,0,0,0,18,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,49,0,0,182,0,0,0,136,0,0,0,48,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,132,0,0,0,46,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,49,0,0,182,0,0,0,154,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,49,0,0,182,0,0,0,36,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,49,0,0,58,0,0,0,126,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,49,0,0,182,0,0,0,80,0,0,0,48,0,0,0,22,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,16,0,0,0,32,0,0,0,26,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,8,1,0,0,38,0,0,0,48,0,0,0,2,0,0,0,4,0,0,0,22,0,0,0,38,0,0,0,8,0,0,0,6,0,0,0,28,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,48,50,0,0,208,0,0,0,196,0,0,0,200,255,255,255,200,255,255,255,48,50,0,0,34,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,50,0,0,70,0,0,0,226,0,0,0,80,0,0,0,2,0,0,0,16,0,0,0,36,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,50,0,0,182,0,0,0,86,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,50,0,0,182,0,0,0,166,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,50,0,0,50,0,0,0,218,0,0,0,58,0,0,0,40,0,0,0,26,0,0,0,2,0,0,0,52,0,0,0,88,0,0,0,20,0,0,0,126,0,0,0,10,0,0,0,28,0,0,0,18,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,50,0,0,130,0,0,0,242,0,0,0,72,0,0,0,24,0,0,0,14,0,0,0,12,0,0,0,90,0,0,0,104,0,0,0,34,0,0,0,28,0,0,0,26,0,0,0,36,0,0,0,42,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,50,0,0,10,0,0,0,120,0,0,0,58,0,0,0,40,0,0,0,32,0,0,0,8,0,0,0,52,0,0,0,88,0,0,0,20,0,0,0,6,0,0,0,10,0,0,0,32,0,0,0,18,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,152,50,0,0,158,0,0,0,180,0,0,0,148,255,255,255,148,255,255,255,152,50,0,0,102,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,200,50,0,0,44,0,0,0,212,0,0,0,252,255,255,255,252,255,255,255,200,50,0,0,148,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,224,50,0,0,222,0,0,0,244,0,0,0,252,255,255,255,252,255,255,255,224,50,0,0,108,0,0,0,202,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,248,50,0,0,88,0,0,0,12,1,0,0,248,255,255,255,248,255,255,255,248,50,0,0,184,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,16,51,0,0,106,0,0,0,206,0,0,0,248,255,255,255,248,255,255,255,16,51,0,0,138,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,51,0,0,216,0,0,0,66,0,0,0,40,0,0,0,30,0,0,0,16,0,0,0,14,0,0,0,48,0,0,0,88,0,0,0,20,0,0,0,94,0,0,0,10,0,0,0,20,0,0,0,18,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,51,0,0,204,0,0,0,186,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,51,0,0,254,0,0,0,234,0,0,0,14,0,0,0,24,0,0,0,14,0,0,0,12,0,0,0,60,0,0,0,104,0,0,0,34,0,0,0,28,0,0,0,26,0,0,0,36,0,0,0,42,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,51,0,0,156,0,0,0,210,0,0,0,34,0,0,0,40,0,0,0,32,0,0,0,8,0,0,0,92,0,0,0,88,0,0,0,20,0,0,0,6,0,0,0,10,0,0,0,32,0,0,0,18,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,51,0,0,228,0,0,0,146,0,0,0,48,0,0,0,70,0,0,0,122,0,0,0,44,0,0,0,78,0,0,0,4,0,0,0,30,0,0,0,54,0,0,0,22,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,51,0,0,104,0,0,0,56,0,0,0,48,0,0,0,116,0,0,0,4,0,0,0,64,0,0,0,18,0,0,0,74,0,0,0,24,0,0,0,118,0,0,0,50,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,51,0,0,232,0,0,0,116,0,0,0,48,0,0,0,14,0,0,0,62,0,0,0,46,0,0,0,42,0,0,0,76,0,0,0,52,0,0,0,96,0,0,0,56,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,0,0,76,0,0,0,174,0,0,0,48,0,0,0,106,0,0,0,112,0,0,0,28,0,0,0,70,0,0,0,26,0,0,0,20,0,0,0,82,0,0,0,68,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,52,0,0,90,0,0,0,16,0,0,0,6,0,0,0,24,0,0,0,14,0,0,0,12,0,0,0,90,0,0,0,104,0,0,0,34,0,0,0,74,0,0,0,84,0,0,0,12,0,0,0,42,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,52,0,0,14,0,0,0,224,0,0,0,62,0,0,0,40,0,0,0,32,0,0,0,8,0,0,0,52,0,0,0,88,0,0,0,20,0,0,0,58,0,0,0,24,0,0,0,4,0,0,0,18,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,52,0,0,0,1,0,0,200,0,0,0,64,0,0,0,152,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53].concat([99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,111,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,152,33,0,0,0,0,0,0,168,33,0,0,0,0,0,0,184,33,0,0,56,46,0,0,0,0,0,0,0,0,0,0,200,33,0,0,56,46,0,0,0,0,0,0,0,0,0,0,216,33,0,0,56,46,0,0,0,0,0,0,0,0,0,0,240,33,0,0,128,46,0,0,0,0,0,0,0,0,0,0,8,34,0,0,56,46,0,0,0,0,0,0,0,0,0,0,24,34,0,0,112,33,0,0,48,34,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,128,51,0,0,0,0,0,0,112,33,0,0,120,34,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,136,51,0,0,0,0,0,0,112,33,0,0,192,34,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,144,51,0,0,0,0,0,0,112,33,0,0,8,35,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,152,51,0,0,0,0,0,0,0,0,0,0,80,35,0,0,136,48,0,0,0,0,0,0,0,0,0,0,128,35,0,0,136,48,0,0,0,0,0,0,112,33,0,0,176,35,0,0,0,0,0,0,1,0,0,0,176,50,0,0,0,0,0,0,112,33,0,0,200,35,0,0,0,0,0,0,1,0,0,0,176,50,0,0,0,0,0,0,112,33,0,0,224,35,0,0,0,0,0,0,1,0,0,0,184,50,0,0,0,0,0,0,112,33,0,0,248,35,0,0,0,0,0,0,1,0,0,0,184,50,0,0,0,0,0,0,112,33,0,0,16,36,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,48,52,0,0,0,8,0,0,112,33,0,0,88,36,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,48,52,0,0,0,8,0,0,112,33,0,0,160,36,0,0,0,0,0,0,3,0,0,0,192,49,0,0,2,0,0,0,144,46,0,0,2,0,0,0,32,50,0,0,0,8,0,0,112,33,0,0,232,36,0,0,0,0,0,0,3,0,0,0,192,49,0,0,2,0,0,0,144,46,0,0,2,0,0,0,40,50,0,0,0,8,0,0,0,0,0,0,48,37,0,0,192,49,0,0,0,0,0,0,0,0,0,0,72,37,0,0,192,49,0,0,0,0,0,0,112,33,0,0,96,37,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,192,50,0,0,2,0,0,0,112,33,0,0,120,37,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,192,50,0,0,2,0,0,0,0,0,0,0,144,37,0,0,0,0,0,0,168,37,0,0,56,51,0,0,0,0,0,0,112,33,0,0,200,37,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,56,47,0,0,0,0,0,0,112,33,0,0,16,38,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,80,47,0,0,0,0,0,0,112,33,0,0,88,38,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,104,47,0,0,0,0,0,0,112,33,0,0,160,38,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,128,47,0,0,0,0,0,0,0,0,0,0,232,38,0,0,192,49,0,0,0,0,0,0,0,0,0,0,0,39,0,0,192,49,0,0,0,0,0,0,112,33,0,0,24,39,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,72,51,0,0,2,0,0,0,112,33,0,0,64,39,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,72,51,0,0,2,0,0,0,112,33,0,0,104,39,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,72,51,0,0,2,0,0,0,112,33,0,0,144,39,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,72,51,0,0,2,0,0,0,0,0,0,0,184,39,0,0,168,50,0,0,0,0,0,0,0,0,0,0,208,39,0,0,192,49,0,0,0,0,0,0,112,33,0,0,232,39,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,40,52,0,0,2,0,0,0,112,33,0,0,0,40,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,40,52,0,0,2,0,0,0,0,0,0,0,24,40,0,0,0,0,0,0,64,40,0,0,0,0,0,0,104,40,0,0,224,50,0,0,0,0,0,0,0,0,0,0,176,40,0,0,80,51,0,0,0,0,0,0,0,0,0,0,208,40,0,0,160,49,0,0,0,0,0,0,0,0,0,0,248,40,0,0,160,49,0,0,0,0,0,0,0,0,0,0,32,41,0,0,136,50,0,0,0,0,0,0,0,0,0,0,104,41,0,0,0,0,0,0,160,41,0,0,0,0,0,0,216,41,0,0,0,0,0,0,248,41,0,0,16,51,0,0,0,0,0,0,0,0,0,0,40,42,0,0,0,0,0,0,72,42,0,0,0,0,0,0,104,42,0,0,0,0,0,0,136,42,0,0,112,33,0,0,160,42,0,0,0,0,0,0,1,0,0,0,24,47,0,0,3,244,255,255,112,33,0,0,208,42,0,0,0,0,0,0,1,0,0,0,40,47,0,0,3,244,255,255,112,33,0,0,0,43,0,0,0,0,0,0,1,0,0,0,24,47,0,0,3,244,255,255,112,33,0,0,48,43,0,0,0,0,0,0,1,0,0,0,40,47,0,0,3,244,255,255,0,0,0,0,96,43,0,0,136,50,0,0,0,0,0,0,0,0,0,0,144,43,0,0,96,46,0,0,0,0,0,0,0,0,0,0,168,43,0,0,0,0,0,0,192,43,0,0,144,50,0,0,0,0,0,0,0,0,0,0,216,43,0,0,128,50,0,0,0,0,0,0,0,0,0,0,248,43,0,0,136,50,0,0,0,0,0,0,0,0,0,0,24,44,0,0,0,0,0,0,56,44,0,0,0,0,0,0,88,44,0,0,0,0,0,0,120,44,0,0,112,33,0,0,152,44,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,32,52,0,0,2,0,0,0,112,33,0,0,184,44,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,32,52,0,0,2,0,0,0,112,33,0,0,216,44,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,32,52,0,0,2,0,0,0,112,33,0,0,248,44,0,0,0,0,0,0,2,0,0,0,192,49,0,0,2,0,0,0,32,52,0,0,2,0,0,0,0,0,0,0,24,45,0,0,0,0,0,0,48,45,0,0,0,0,0,0,72,45,0,0,0,0,0,0,96,45,0,0,128,50,0,0,0,0,0,0,0,0,0,0,120,45,0,0,136,50,0,0,0,0,0,0,0,0,0,0,144,45,0,0,120,52,0,0,0,0,0,0,0,0,0,0,184,45,0,0,120,52,0,0,0,0,0,0,0,0,0,0,224,45,0,0,136,52,0,0,0,0,0,0,0,0,0,0,8,46,0,0,48,46,0,0,0,0,0,0,56,0,0,0,0,0,0,0,224,50,0,0,222,0,0,0,244,0,0,0,200,255,255,255,200,255,255,255,224,50,0,0,108,0,0,0,202,0,0,0,108,0,0,0,0,0,0,0,16,51,0,0,106,0,0,0,206,0,0,0,148,255,255,255,148,255,255,255,16,51,0,0,138,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(256);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(132);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(64);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(152);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(2);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(256);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(250);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(64);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(152);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(8);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(30);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(4);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(10);
HEAP32[((11824)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((11832)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((11840)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((11856)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((11872)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((11888)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((11904)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((11920)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12056)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12072)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12328)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12344)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12424)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12432)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12576)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12592)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12736)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12752)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12832)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12840)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12848)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12864)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12880)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12896)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12912)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12928)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12936)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12944)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12952)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((12968)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12976)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12984)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((12992)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13096)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13112)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13128)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13136)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13152)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13168)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13184)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13192)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13200)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13208)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13344)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13352)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13360)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((13368)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13384)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13400)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13416)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13432)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((13448)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
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
        if (Browser.initted) return;
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
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
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
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
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
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};var CL={ctx:[],ctx_clean:0,cmdQueue:[],enqueueFloat:[],cmdQueue_clean:0,programs:[],programs_clean:0,kernels:[],kernels_clean:0,buffers:[],buffers_clean:0,platforms:[],devices:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",isFloat:function (ptr,size) {
  // #if OPENCL_DEBUG
  //       console.info("isFloat() check pointer : ");
  // #endif  
        var v_int = HEAP32[((ptr)>>2)]; 
        var v_float = HEAPF32[((ptr)>>2)]; 
        // If the value is 0
        if ( v_int == 0 ) {
  // #if OPENCL_DEBUG
  //         console.info("\tisFloat() value is null check is array");
  // #endif  
          // If is an array
          if (size > 1) {
            v_int = HEAP32[(((ptr)+(size - 1))>>2)]; 
            v_float = HEAPF32[(((ptr)+(size - 1))>>2)]; 
  // #if OPENCL_DEBUG
  //           console.info("\tisFloat() value is array, check the last element");
  // #endif          
          } else {
  // #if OPENCL_DEBUG
  //           console.info("\tisFloat() value is not array, use float by default");
  // #endif     
            // Use float by default 
            return 1;
          }                
        }
        // If we read int and is float we have a very big value 1e8
        if (Math.abs(v_int) > 100000000) {
  // #if OPENCL_DEBUG
  //        console.info("\tisFloat() value is not an int, is float "+v_int+ " vs "+v_float);
  // #endif     
          return 1;
        }
  // #if OPENCL_DEBUG
  //       console.info("\tisFloat() value is an int "+v_int+ " vs "+v_float);
  // #endif     
        return 0;      
      },catchError:function (name,e) {
        var str=""+e;
        var n=str.lastIndexOf(" ");
        var error = str.substr(n+1,str.length-n-2);
        console.error("CATCH: "+name+": "+e);
        return error;
      }};function _clGetPlatformIDs(num_entries,platform_ids,num_platforms) {
      if (window.WebCL == undefined) {
        console.log(CL.errorMessage);
        return -1;/*CL_DEVICE_NOT_FOUND*/;
      }
      try { 
        // Get the platform
        var platforms = WebCL.getPlatformIDs();
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
          var name = plat.getPlatformInfo (WebCL.CL_PLATFORM_NAME);
          var vendor = plat.getPlatformInfo (WebCL.CL_PLATFORM_VENDOR);
          var version = plat.getPlatformInfo (WebCL.CL_PLATFORM_VERSION);
          var extensions = plat.getPlatformInfo (WebCL.CL_PLATFORM_EXTENSIONS);
          console.info("\t"+i+": name: " + name);              
          console.info("\t"+i+": vendor: " + vendor);              
          console.info("\t"+i+": version: " + version);
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
  function _clCreateContextFromType(properties, device_type_i64_1, device_type_i64_2, pfn_notify, private_info, cb, user_data, user_data, errcode_ret) {
      if (CL.platforms.length == 0) {
        console.error("clCreateContextFromType: Invalid platform");
        HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
        return 0; // Null pointer    
      }
      // Assume the device type is i32 
      assert(device_type_i64_2 == 0, 'Invalid flags i64');
      try {
        var prop = [];
        var plat = -1;
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
                  console.error("clCreateContextFromType: Invalid context : "+ctx);
                  HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
                  return 0; // Null pointer    
                } else {
                  plat = readprop;
                  prop.push(CL.platforms[readprop]);
                }             
              break;
              default:
                console.error("clCreateContextFromType : Param not yet implemented or unknow : "+param_name);
                HEAP32[((errcode_ret)>>2)]=-30 /* CL_INVALID_VALUE */;
                return 0; // Null pointer    
            }
            i++;  
          }        
        }
        if (prop.length == 0) {
          prop = [WebCL.CL_CONTEXT_PLATFORM, CL.platforms[0]];
          plat = 0;   
        }
        // \todo en faire une function si le device n'existe pas
        var alldev = CL.platforms[plat].getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL);
        var mapcount = 0;
        for (var i = 0 ; i < alldev.length; i++ ) {
          var type = alldev[i].getDeviceInfo(WebCL.CL_DEVICE_TYPE);
          if (type == device_type_i64_1 || device_type_i64_1 == -1) {
             mapcount ++;
          }        
        }
        if (mapcount >= 1) {        
          CL.ctx.push(WebCL.createContextFromType(prop, device_type_i64_1));
        } else {
          // Use default platform
          CL.ctx.push(WebCL.createContextFromType(prop, WebCL.CL_DEVICE_TYPE_DEFAULT));
        }
        // Return the pos of the context +1
        return CL.ctx.length;
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContext",e);
        return 0; // Null pointer    
      }
    }
  function _clGetContextInfo(context, param_name, param_value_size, param_value, param_value_size_ret) {
      var ctx = context - 1;
      if (ctx >= CL.ctx.length || ctx < 0 ) {
          console.error("clGetContextInfo: Invalid context : "+ctx);
          return -34; /* CL_INVALID_CONTEXT */ 
      }
      try {
        var res;
        var size;
        switch (param_name) {
          case (0x1081) /* CL_CONTEXT_DEVICES */:
            res = CL.ctx[ctx].getContextInfo(WebCL.CL_CONTEXT_DEVICES);
            // Must verify if size of device is same as param_value°size
            if (param_value != 0) {
              for (var i = 0 ; i < res.length; i++) {
                CL.devices.push(res[i]);
                HEAP32[(((param_value)+(i*4))>>2)]=CL.devices.length;
              }
            }
            size = res.length * 4;
            break;
          case (0x1082) /* CL_CONTEXT_PROPERTIES */:
            res = CL.ctx[ctx].getContextInfo(WebCL.CL_CONTEXT_PROPERTIES);
            // \todo add in param_value the properties list
            size = res.length * 4;          
            break;
          case (0x1080) /* CL_CONTEXT_REFERENCE_COUNT */:
            res = CL.ctx[ctx].getContextInfo(WebCL.CL_CONTEXT_REFERENCE_COUNT); // return cl_uint
            size = 1;
            HEAP32[((param_value)>>2)]=res;
            break;
          default:
            console.error("clGetContextInfo : Param not yet implemented or unknow : "+param_name);
            return -30; /* CL_INVALID_VALUE */ 
        };
        if (param_value_size < size && param_value != 0) {
          console.error("clGetContextInfo : Size of param_value "+pvs+" is less than size compute "+size);
          return -30; /* CL_INVALID_VALUE */              
        }
        HEAP32[((param_value_size_ret)>>2)]=size;
        return 0;/*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetContextInfo",e);
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
          var devices = CL.platforms[platform].getDeviceIDs(WebCL.CL_DEVICE_TYPE_DEFAULT);
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
      try {
        // \todo set the properties 
        CL.programs.push(CL.ctx[ctx].createProgramWithSource(kernel));
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
        CL.programs[prog].buildProgram (devices_tab, opt);
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
  function _clReleaseProgram(program) {
      var prog = program - 1 - CL.programs_clean;
      if (prog >= CL.programs.length || prog < 0 ) {
        console.error("clReleaseProgram: Invalid program : "+prog);
        return -44; /* CL_INVALID_PROGRAM */
      }           
      CL.programs.splice(prog, 1);
      if (CL.programs.length == 0) {
        CL.programs_clean = 0;
      } else {
        CL.programs_clean++;
      }
      console.message("clReleaseProgram: Release program : "+prog);
      return 0;/*CL_SUCCESS*/
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
    }function __ZSt9terminatev() {
      _exit(-1234);
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
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_READ_WRITE,size));
            break;
          case (1 << 1) /* CL_MEM_WRITE_ONLY */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_WRITE_ONLY,size));
            break;
          case (1 << 2) /* CL_MEM_READ_ONLY */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_READ_ONLY,size));
            break;
          case (1 << 3) /* CL_MEM_USE_HOST_PTR */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_USE_HOST_PTR,size));
            break;
          case (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_ALLOC_HOST_PTR,size));
            break;
          case (1 << 5) /* CL_MEM_COPY_HOST_PTR */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_COPY_HOST_PTR,size));
            break;
          case (((1 << 2)|(1 << 5))) /* CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR */:
            if (host_ptr == 0) {
              console.error("clCreateBuffer: CL_MEM_COPY_HOST_PTR can't be use with null host_ptr parameter");
              HEAP32[((errcode_ret)>>2)]=-37 /* CL_INVALID_HOST_PTR */;
              return 0;     
            }
            CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_READ_ONLY,size));
            // CL_MEM_COPY_HOST_PTR Doesn't work we pass element via enqueue buffer
            if (CL.cmdQueue.length == 0) {
              console.error("clCreateBuffer: Invalid command queue : "+CL.cmdQueue.length);
              HEAP32[((errcode_ret)>>2)]=-36 /* CL_INVALID_COMMAND_QUEUE */;
              return 0;
            }
            if (CL.buffers.length == 0) {
              console.error("clCreateBuffer: Invalid command queue : "+CL.buffers.length);
              HEAP32[((errcode_ret)>>2)]=-38 /* CL_INVALID_MEM_OBJECT */;
              return 0;
            }
            var isFloat = CL.isFloat(host_ptr,size);
            if (isFloat) {
              CL.enqueueFloat[CL.cmdQueue.length-1] = 1; // Enqueue is float type
              vector = new Float32Array(size / 4);
            } else {
              CL.enqueueFloat[CL.cmdQueue.length-1] = 0; // Enqueue is int type
              vector = new Uint32Array(size / 4);
            }
            //var str_vector = "clEnqueueWriteBuffer : vector(";
            for (var i = 0; i < (size / 4); i++) {
              if (CL.enqueueFloat[CL.cmdQueue.length-1]) {
                vector[i] = HEAPF32[(((host_ptr)+(i*4))>>2)];
              } else {
                vector[i] = HEAP32[(((host_ptr)+(i*4))>>2)];
              }
              //str_vector += vector[i] + ",";
            }
            //str_vector = str_vector.substr(0,str_vector.length - 1) + ")";
            //console.info(str_vector);
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
  function _clReleaseMemObject(memobj) {
      var buff = memobj - 1 - CL.buffers_clean;
      if (buff >= CL.buffers.length || buff < 0 ) {
        console.error("clReleaseMemObject: Invalid command queue : "+buff);
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      CL.buffers.splice(buff, 1);
      if (CL.buffers.length == 0) {
        CL.buffers_clean = 0;
      } else {
        CL.buffers_clean++;
      }
      console.message("clReleaseMemObject: Release Memory Object : "+buff);
      return 0;/*CL_SUCCESS*/
    }
  function _clReleaseCommandQueue(command_queue) {
      var queue = command_queue - 1 - CL.cmdQueue_clean;
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clReleaseCommandQueue: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      CL.cmdQueue.splice(queue, 1);
      if (CL.cmdQueue.length == 0) {
        CL.cmdQueue_clean = 0;
      } else {
        CL.cmdQueue_clean++;
      }
      console.message("clReleaseCommandQueue: Release command queue : "+queue);
      return 0;/*CL_SUCCESS*/
    }
  function _clReleaseKernel(kernel) {
      var ker = kernel - 1 - CL.kernels_clean;
      if (ker >= CL.kernels.length || ker < 0 ) {
        console.error("clReleaseKernel: Invalid kernel : "+ker);
        return -48; /* CL_INVALID_KERNEL */
      }
      CL.kernels.splice(ker, 1);
      if (CL.kernels.length == 0) {
        CL.kernels_clean = 0;
      } else {
        CL.kernels_clean++;
      }    
      console.message("clReleaseKernel: Release kernel : "+ker);
      return 0;/*CL_SUCCESS*/
    }
  function _clReleaseContext(context) {
      var ctx = context - 1 - CL.ctx_clean;
      if (ctx >= CL.ctx.length || ctx < 0 ) {
        console.error("clReleaseContext: Invalid context : "+ctx);
        return -34; /* CL_INVALID_CONTEXT */
      }        
      CL.ctx.splice(ctx, 1);
      if (CL.ctx.length == 0) {
        CL.ctx_clean = 0;
      } else {
        CL.ctx_clean++;
      }
      console.message("clReleaseContext: Release context : "+ctx);
      return 0;/*CL_SUCCESS*/
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _clCreateKernel(program, kernel_name, errcode_ret) {
      var prog = program - 1;
      if (prog >= CL.programs.length || prog < 0 ) {
        console.error("clCreateKernel: Invalid program : "+prog);
        HEAP32[((errcode_ret)>>2)]=-44;
        return 0; // Null pointer   
      }           
      try {
        //console.log("kernel_name : "+Pointer_stringify(kernel_name));
        var name = Pointer_stringify(kernel_name);
        CL.kernels.push(CL.programs[prog].createKernel(name));
        // Return the pos of the queue +1
        return CL.kernels.length;
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateKernel",e);
        return 0; // Null pointer    
      }
    }
  function _clSetKernelArg(kernel, arg_index, arg_size, arg_value) {
      var ker = kernel - 1;
      if (ker >= CL.kernels.length || ker < 0 ) {
        console.error("clSetKernelArg: Invalid kernel : "+ker);
        return -48; /* CL_INVALID_KERNEL */
      }
      try {  
        // \todo problem what is arg_value is buffer or just value ??? hard to say ....
        // \todo i suppose the arg_index correspond with the order of the buffer creation if is 
        // not inside the buffers array size we take the value
        var isFloat = CL.isFloat(arg_value,arg_size);
        var isNull = (HEAP32[((arg_value)>>2)] == 0);
        //console.log("clSetKernelArg : isFloat = "+isFloat);
        var value;
        if (isNull == 1) {
          CL.kernels[ker].setKernelArgLocal(arg_index,arg_size);
        } else if (arg_size > 4) {
          value = [];
          for (var i = 0; i < arg_size/4; i++) {
            if (isFloat == 1) {
              value[i] = HEAPF32[(((arg_value)+(i*4))>>2)];   
            } else {
              value[i] = HEAP32[(((arg_value)+(i*4))>>2)];
            }
            //console.log("clSetKernelArg : value["+i+"] = "+value[i]);       
          }
          if (isFloat == 1) {
            CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V);
          } else {
            CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V);
          }      
        } else {     
          if (isFloat == 1) {
            value = HEAPF32[((arg_value)>>2)];
          } else {
            value = HEAP32[((arg_value)>>2)];
          }
          //console.log("clSetKernelArg : value = "+value);   
          if (arg_index >= 0 && arg_index < CL.buffers.length) {
            CL.kernels[ker].setKernelArg(arg_index,CL.buffers[arg_index]);
          } else {
            if (isFloat == 1) { 
              CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT);
            } else {
              CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT);
            }
          }
        }
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clSetKernelArg",e);
      }
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
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
      var value_local_work_size = [];
      var value_global_work_size = [];
      for (var i = 0 ; i < work_dim; i++) {
        value_local_work_size[i] = HEAP32[(((local_work_size)+(i*4))>>2)];
        value_global_work_size[i] = HEAP32[(((global_work_size)+(i*4))>>2)];
      }
      // empty “localWS” array because give some trouble on CPU mode with mac
      value_local_work_size = [];  
      try {
        // \todo how add some event inside the array
        CL.cmdQueue[queue].enqueueNDRangeKernel(CL.kernels[ker],work_dim,[],value_global_work_size,value_local_work_size,[]);
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
        var vector;    
        if (CL.enqueueFloat[queue]) {
          vector = new Float32Array(size / 4);
        } else {
          vector = new Uint32Array(size / 4);
        }
        CL.cmdQueue[queue].enqueueReadBuffer (CL.buffers[buff], blocking_read == 1 ? true : false, offset, size, vector, []);
        //var str_vector = "clEnqueueReadBuffer : vector(";
        for (var i = 0; i < (size / 4); i++) {
          if (CL.enqueueFloat[queue]) {
            HEAPF32[(((results)+(i*4))>>2)]=vector[i];  
            //str_vector += HEAPF32[(((results)+(i*4))>>2)] + ",";
          } else {
            HEAP32[(((results)+(i*4))>>2)]=vector[i];  
            //str_vector += HEAP32[(((results)+(i*4))>>2)] + ",";
          }         
        }
        //str_vector = str_vector.substr(0,str_vector.length - 1) + ")";
        //console.info("clEnqueueReadBuffer: Vector "+str_vector+" - Size : "+vector.length+"");
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueReadBuffer",e);
      }
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
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
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
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
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
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
  var _llvm_memset_p0i8_i64=_memset;
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
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env._stdout|0;var t=env.___fsmu8|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.copyTempDouble;var am=env.copyTempFloat;var an=env.min;var ao=env.invoke_viiiii;var ap=env.invoke_viiiiiii;var aq=env.invoke_vi;var ar=env.invoke_vii;var as=env.invoke_iii;var at=env.invoke_iiiiii;var au=env.invoke_ii;var av=env.invoke_iiii;var aw=env.invoke_viiiiif;var ax=env.invoke_viii;var ay=env.invoke_viiiiiiii;var az=env.invoke_v;var aA=env.invoke_iiiiiiiii;var aB=env.invoke_viiiiiiiii;var aC=env.invoke_viiiiiif;var aD=env.invoke_viiiiii;var aE=env.invoke_iiiii;var aF=env.invoke_viiii;var aG=env._llvm_lifetime_end;var aH=env._lseek;var aI=env.__scanString;var aJ=env._fclose;var aK=env._pthread_mutex_lock;var aL=env.___cxa_end_catch;var aM=env.__isFloat;var aN=env._strtoull;var aO=env._fflush;var aP=env._clGetPlatformIDs;var aQ=env._fwrite;var aR=env._send;var aS=env._isspace;var aT=env._clReleaseCommandQueue;var aU=env._read;var aV=env._clGetContextInfo;var aW=env._fsync;var aX=env._newlocale;var aY=env.___gxx_personality_v0;var aZ=env._pthread_cond_wait;var a_=env.___cxa_rethrow;var a$=env.___resumeException;var a0=env._llvm_va_end;var a1=env._vsscanf;var a2=env._snprintf;var a3=env._fgetc;var a4=env._clReleaseMemObject;var a5=env._clReleaseContext;var a6=env._atexit;var a7=env.___cxa_free_exception;var a8=env._close;var a9=env.__Z8catcloseP8_nl_catd;var ba=env._llvm_lifetime_start;var bb=env.___setErrNo;var bc=env._clCreateContextFromType;var bd=env._isxdigit;var be=env._ftell;var bf=env._exit;var bg=env._sprintf;var bh=env.___ctype_b_loc;var bi=env._freelocale;var bj=env.__Z7catopenPKci;var bk=env._asprintf;var bl=env.___cxa_is_number_type;var bm=env.___cxa_does_inherit;var bn=env.___locale_mb_cur_max;var bo=env.___cxa_begin_catch;var bp=env._recv;var bq=env.__parseInt64;var br=env.__ZSt18uncaught_exceptionv;var bs=env.___cxa_call_unexpected;var bt=env.__exit;var bu=env._strftime;var bv=env.___cxa_throw;var bw=env._clReleaseKernel;var bx=env._llvm_eh_exception;var by=env._pread;var bz=env._fopen;var bA=env._open;var bB=env._clEnqueueNDRangeKernel;var bC=env._clReleaseProgram;var bD=env.___cxa_find_matching_catch;var bE=env._clSetKernelArg;var bF=env.__formatString;var bG=env._pthread_cond_broadcast;var bH=env._clEnqueueReadBuffer;var bI=env.__ZSt9terminatev;var bJ=env._pthread_mutex_unlock;var bK=env._sbrk;var bL=env.___errno_location;var bM=env._strerror;var bN=env._clCreateBuffer;var bO=env._clGetProgramBuildInfo;var bP=env._ungetc;var bQ=env._vsprintf;var bR=env._uselocale;var bS=env._vsnprintf;var bT=env._sscanf;var bU=env._sysconf;var bV=env._fread;var bW=env._abort;var bX=env._isdigit;var bY=env._strtoll;var bZ=env.__reallyNegative;var b_=env._clCreateCommandQueue;var b$=env._clBuildProgram;var b0=env.__Z7catgetsP8_nl_catdiiPKc;var b1=env._fseek;var b2=env._write;var b3=env.___cxa_allocate_exception;var b4=env._clCreateKernel;var b5=env._vasprintf;var b6=env._clCreateProgramWithSource;var b7=env.___ctype_toupper_loc;var b8=env.___ctype_tolower_loc;var b9=env._pwrite;var ca=env._strerror_r;var cb=env._time;
// EMSCRIPTEN_START_FUNCS
function cu(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cv(){return i|0}function cw(a){a=a|0;i=a}function cx(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function cy(a){a=a|0;K=a}function cz(a){a=a|0;L=a}function cA(a){a=a|0;M=a}function cB(a){a=a|0;N=a}function cC(a){a=a|0;O=a}function cD(a){a=a|0;P=a}function cE(a){a=a|0;Q=a}function cF(a){a=a|0;R=a}function cG(a){a=a|0;S=a}function cH(a){a=a|0;T=a}function cI(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+8|0;e=d|0;c[e>>2]=-1;if((aV(a|0,4225,0,0,e|0)|0)!=0){cK(14640,1464);f=0;i=d;return f|0}g=c[e>>2]|0;if((g|0)==0){cK(14640,1144);f=0;i=d;return f|0}h=kv(g&-4)|0;g=h;if((aV(a|0,4225,c[e>>2]|0,h|0,0)|0)!=0){if((h|0)!=0){kz(h)}cK(14640,1112);f=0;i=d;return f|0}e=b_(a|0,c[g>>2]|0,0,0,0)|0;if((e|0)==0){kz(h);cK(14640,920);f=0;i=d;return f|0}else{c[b>>2]=c[g>>2]|0;kz(h);f=e;i=d;return f|0}return 0}function cJ(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;i=i+88|0;b=a|0;d=a+16|0;e=a+32|0;f=a+48|0;g=a+56|0;h=a+64|0;j=a+72|0;k=aP(1,h|0,g|0)|0;c[f>>2]=k;if((k|0)!=0|(c[g>>2]|0)==0){g=cK(14640,2648)|0;k=c[g+((c[(c[g>>2]|0)-12>>2]|0)+28|0)>>2]|0;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3592]|0)!=-1){c[e>>2]=14368;c[e+4>>2]=12;c[e+8>>2]=0;d3(14368,e,96)}e=(c[3593]|0)-1|0;m=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-m>>2>>>0>e>>>0){n=c[m+(e<<2)>>2]|0;if((n|0)==0){break}o=cg[c[(c[n>>2]|0)+28>>2]&63](n,10)|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){ce[c[(c[k>>2]|0)+8>>2]&511](k)}fg(g,o);eS(g);p=0;i=a;return p|0}}while(0);g=b3(4)|0;c[g>>2]=5688;bv(g|0,11856,198);return 0}g=j|0;c[g>>2]=4228;c[j+4>>2]=c[h>>2]|0;c[j+8>>2]=0;j=bc(g|0,4,0,0,0,f|0)|0;if((c[f>>2]|0)==0){p=j;i=a;return p|0}j=cK(14464,2600)|0;h=c[j+((c[(c[j>>2]|0)-12>>2]|0)+28|0)>>2]|0;k=h+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;if((c[3592]|0)!=-1){c[d>>2]=14368;c[d+4>>2]=12;c[d+8>>2]=0;d3(14368,d,96)}d=(c[3593]|0)-1|0;l=c[h+8>>2]|0;do{if((c[h+12>>2]|0)-l>>2>>>0>d>>>0){e=c[l+(d<<2)>>2]|0;if((e|0)==0){break}m=cg[c[(c[e>>2]|0)+28>>2]&63](e,10)|0;if(((I=c[k>>2]|0,c[k>>2]=I+ -1,I)|0)==0){ce[c[(c[h>>2]|0)+8>>2]&511](h)}fg(j,m);eS(j);m=bc(g|0,2,0,0,0,f|0)|0;if((c[f>>2]|0)==0){p=m;i=a;return p|0}m=cK(14640,1624)|0;e=c[m+((c[(c[m>>2]|0)-12>>2]|0)+28|0)>>2]|0;o=e+4|0;I=c[o>>2]|0,c[o>>2]=I+1,I;if((c[3592]|0)!=-1){c[b>>2]=14368;c[b+4>>2]=12;c[b+8>>2]=0;d3(14368,b,96)}n=(c[3593]|0)-1|0;q=c[e+8>>2]|0;do{if((c[e+12>>2]|0)-q>>2>>>0>n>>>0){r=c[q+(n<<2)>>2]|0;if((r|0)==0){break}s=cg[c[(c[r>>2]|0)+28>>2]&63](r,10)|0;if(((I=c[o>>2]|0,c[o>>2]=I+ -1,I)|0)==0){ce[c[(c[e>>2]|0)+8>>2]&511](e)}fg(m,s);eS(m);p=0;i=a;return p|0}}while(0);m=b3(4)|0;c[m>>2]=5688;bv(m|0,11856,198);return 0}}while(0);p=b3(4)|0;c[p>>2]=5688;bv(p|0,11856,198);return 0}function cK(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+48|0;f=e|0;g=e+8|0;h=e+24|0;j=e+32|0;k=e+40|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16|0)>>2]|0)==0){p=c[o+(n+72|0)>>2]|0;if((p|0)!=0){eS(p)}a[l]=1;p=kG(d|0)|0;q=c[(c[m>>2]|0)-12>>2]|0;c[j>>2]=c[o+(q+24|0)>>2]|0;r=d+p|0;p=(c[o+(q+4|0)>>2]&176|0)==32?r:d;s=o+q|0;t=o+(q+76|0)|0;u=c[t>>2]|0;v=u&255;L75:do{if((u|0)==-1){w=c[o+(q+28|0)>>2]|0;x=w+4|0;I=c[x>>2]|0,c[x>>2]=I+1,I;if((c[3592]|0)!=-1){c[g>>2]=14368;c[g+4>>2]=12;c[g+8>>2]=0;d3(14368,g,96)}y=(c[3593]|0)-1|0;z=c[w+8>>2]|0;do{if((c[w+12>>2]|0)-z>>2>>>0>y>>>0){A=c[z+(y<<2)>>2]|0;if((A|0)==0){break}B=cg[c[(c[A>>2]|0)+28>>2]&63](A,32)|0;if(((I=c[x>>2]|0,c[x>>2]=I+ -1,I)|0)==0){ce[c[(c[w>>2]|0)+8>>2]&511](w)}c[t>>2]=B<<24>>24;C=B;break L75}}while(0);w=b3(4)|0;c[w>>2]=5688;bv(w|0,11856,198);return 0}else{C=v}}while(0);de(k,j,d,p,r,s,C);if((c[k>>2]|0)!=0){break}v=c[(c[m>>2]|0)-12>>2]|0;t=o+(v+16|0)|0;q=c[t>>2]|5;c[t>>2]=q;if((q&c[o+(v+20|0)>>2]|0)==0){break}v=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}q=kK(4688,0,32)|0;t=K;c[f>>2]=q&0|1;c[f+4>>2]=t&-1|0;d2(v,f,1592);c[v>>2]=6432;bv(v|0,12432,28);return 0}}while(0);eU(h);i=e;return b|0}function cL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;f=i;i=i+72|0;g=f|0;h=f+16|0;j=f+32|0;k=f+48|0;l=f+56|0;m=l;n=i;i=i+188|0;i=i+7>>3<<3;o=i;i=i+136|0;p=i;i=i+12|0;i=i+7>>3<<3;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+16384|0;s=n;t=n+108|0;u=n|0;v=n+8|0;w=v|0;x=n;c[u>>2]=13516;y=n+108|0;c[y>>2]=13536;c[n+4>>2]=0;c[n+132>>2]=v;c[n+124>>2]=0;c[n+128>>2]=0;c[n+112>>2]=4098;c[n+120>>2]=0;c[n+116>>2]=6;z=n+136|0;kD(n+140|0,0,40);if(a[14952]|0){A=c[1162]|0}else{if(a[14960]|0){B=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;B=4952}c[1168]=B;C=B+4|0;I=c[C>>2]|0,c[C>>2]=I+1,I;c[1162]=4672;a[14952]=1;A=4672}C=c[A>>2]|0;c[z>>2]=C;z=C+4|0;I=c[z>>2]|0,c[z>>2]=I+1,I;c[n+180>>2]=0;c[n+184>>2]=-1;c[u>>2]=7676;c[t>>2]=7696;df(v);t=n+72|0;do{if((c[t>>2]|0)==0){z=bz(e|0,136)|0;c[t>>2]=z;if((z|0)==0){D=113;break}c[n+96>>2]=8;D=143}else{D=113}}while(0);L114:do{if((D|0)==113){z=c[(c[x>>2]|0)-12>>2]|0;C=s+(z+16|0)|0;A=c[C>>2]|0;B=A|4;E=(c[s+(z+24|0)>>2]|0)==0;c[C>>2]=E?A|5:B;if((c[s+(z+20|0)>>2]&(E&1|B)|0)!=0){B=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}E=kK(4688,0,32)|0;z=K;c[k>>2]=E&0|1;c[k+4>>2]=z&-1|0;d2(B,k,1592);c[B>>2]=6432;bv(B|0,12432,28);return 0}if((c[t>>2]|0)!=0){D=143;break}B=cK(cK(14640,608)|0,e)|0;z=c[B+((c[(c[B>>2]|0)-12>>2]|0)+28|0)>>2]|0;E=z+4|0;I=c[E>>2]|0,c[E>>2]=I+1,I;if((c[3592]|0)!=-1){c[j>>2]=14368;c[j+4>>2]=12;c[j+8>>2]=0;d3(14368,j,96)}A=(c[3593]|0)-1|0;C=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-C>>2>>>0>A>>>0){F=c[C+(A<<2)>>2]|0;if((F|0)==0){break}G=cg[c[(c[F>>2]|0)+28>>2]&63](F,10)|0;if(((I=c[E>>2]|0,c[E>>2]=I+ -1,I)|0)==0){ce[c[(c[z>>2]|0)+8>>2]&511](z)}fg(B,G);eS(B);H=0;break L114}}while(0);B=b3(4)|0;c[B>>2]=5688;bv(B|0,11856,198);return 0}}while(0);if((D|0)==143){D=o+56|0;j=o|0;e=o;t=o+4|0;c[j>>2]=13476;k=o+56|0;c[k>>2]=13496;c[o+80>>2]=t;c[o+72>>2]=0;c[o+76>>2]=0;c[o+60>>2]=4098;c[o+68>>2]=0;c[o+64>>2]=6;s=o+84|0;kD(o+88|0,0,40);if(a[14952]|0){J=c[1162]|0}else{if(a[14960]|0){L=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;L=4952}c[1168]=L;x=L+4|0;I=c[x>>2]|0,c[x>>2]=I+1,I;c[1162]=4672;a[14952]=1;J=4672}x=c[J>>2]|0;c[s>>2]=x;s=x+4|0;I=c[s>>2]|0,c[s>>2]=I+1,I;c[o+128>>2]=0;c[o+132>>2]=-1;c[j>>2]=7252;c[D>>2]=7272;D=t|0;c[D>>2]=7600;if(a[14952]|0){M=c[1162]|0}else{if(a[14960]|0){N=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;N=4952}c[1168]=N;s=N+4|0;I=c[s>>2]|0,c[s>>2]=I+1,I;c[1162]=4672;a[14952]=1;M=4672}s=o+8|0;N=c[M>>2]|0;c[s>>2]=N;M=N+4|0;I=c[M>>2]|0,c[M>>2]=I+1,I;M=o+12|0;kD(M|0,0,24);c[D>>2]=7456;D=o+36|0;N=o+48|0;x=o+52|0;kD(o+36|0,0,16);c[x>>2]=16;kD(m|0,0,12);c$(t,l);if((a[m]&1)!=0){ky(c[l+8>>2]|0)}eW(e,w);w=p;e=c[x>>2]|0;do{if((e&16|0)==0){if((e&8|0)==0){kD(w|0,0,12);break}x=c[M>>2]|0;l=c[o+20>>2]|0;m=x;t=l-m|0;if((t|0)==-1){d4(0);return 0}if(t>>>0<11){a[w]=t<<1&255;O=p+1|0}else{J=t+16&-16;L=ku(J)|0;c[p+8>>2]=L;c[p>>2]=J|1;c[p+4>>2]=t;O=L}if((x|0)==(l|0)){P=O}else{L=l+(-m|0)|0;m=O;t=x;while(1){a[m]=a[t]|0;x=t+1|0;if((x|0)==(l|0)){break}else{m=m+1|0;t=x}}P=O+L|0}a[P]=0}else{t=c[N>>2]|0;m=c[o+28>>2]|0;if(t>>>0<m>>>0){c[N>>2]=m;Q=m}else{Q=t}t=c[o+24>>2]|0;m=t;l=Q-m|0;if((l|0)==-1){d4(0);return 0}if(l>>>0<11){a[w]=l<<1&255;R=p+1|0}else{x=l+16&-16;J=ku(x)|0;c[p+8>>2]=J;c[p>>2]=x|1;c[p+4>>2]=l;R=J}if((t|0)==(Q|0)){S=R}else{J=Q+(-m|0)|0;m=R;l=t;while(1){a[m]=a[l]|0;t=l+1|0;if((t|0)==(Q|0)){break}else{m=m+1|0;l=t}}S=R+J|0}a[S]=0}}while(0);if((a[w]&1)==0){T=p+1|0}else{T=c[p+8>>2]|0}c[q>>2]=T;T=b6(b|0,1,q|0,0,0)|0;L210:do{if((T|0)==0){q=cK(14640,400)|0;b=c[q+((c[(c[q>>2]|0)-12>>2]|0)+28|0)>>2]|0;S=b+4|0;I=c[S>>2]|0,c[S>>2]=I+1,I;if((c[3592]|0)!=-1){c[h>>2]=14368;c[h+4>>2]=12;c[h+8>>2]=0;d3(14368,h,96)}R=(c[3593]|0)-1|0;Q=c[b+8>>2]|0;do{if((c[b+12>>2]|0)-Q>>2>>>0>R>>>0){N=c[Q+(R<<2)>>2]|0;if((N|0)==0){break}P=cg[c[(c[N>>2]|0)+28>>2]&63](N,10)|0;if(((I=c[S>>2]|0,c[S>>2]=I+ -1,I)|0)==0){ce[c[(c[b>>2]|0)+8>>2]&511](b)}fg(q,P);eS(q);U=0;break L210}}while(0);q=b3(4)|0;c[q>>2]=5688;bv(q|0,11856,198);return 0}else{if((b$(T|0,0,0,0,0,0)|0)==0){U=T;break}q=r|0;bO(T|0,d|0,4483,16384,q|0,0);b=cK(14640,272)|0;S=c[b+((c[(c[b>>2]|0)-12>>2]|0)+28|0)>>2]|0;R=S+4|0;I=c[R>>2]|0,c[R>>2]=I+1,I;if((c[3592]|0)!=-1){c[g>>2]=14368;c[g+4>>2]=12;c[g+8>>2]=0;d3(14368,g,96)}Q=(c[3593]|0)-1|0;J=c[S+8>>2]|0;do{if((c[S+12>>2]|0)-J>>2>>>0>Q>>>0){P=c[J+(Q<<2)>>2]|0;if((P|0)==0){break}N=cg[c[(c[P>>2]|0)+28>>2]&63](P,10)|0;if(((I=c[R>>2]|0,c[R>>2]=I+ -1,I)|0)==0){ce[c[(c[S>>2]|0)+8>>2]&511](S)}fg(b,N);eS(b);cK(14640,q);bC(T|0);U=0;break L210}}while(0);q=b3(4)|0;c[q>>2]=5688;bv(q|0,11856,198);return 0}}while(0);if((a[w]&1)!=0){ky(c[p+8>>2]|0)}c[j>>2]=7252;c[k>>2]=7272;k=o+4|0;c[k>>2]=7456;if((a[D]&1)!=0){ky(c[o+44>>2]|0)}c[k>>2]=7600;k=c[s>>2]|0;s=k+4|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){ce[c[(c[k>>2]|0)+8>>2]&511](k|0)}er(o+56|0);H=U}c[u>>2]=7676;c[y>>2]=7696;c4(v);er(n+108|0);i=f;return H|0}function cM(b){b=b|0;var d=0,e=0,f=0;c[b>>2]=7252;c[b+56>>2]=7272;d=b+4|0;c[d>>2]=7456;if((a[b+36|0]&1)!=0){ky(c[b+44>>2]|0)}c[d>>2]=7600;d=c[b+8>>2]|0;e=d+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){f=b+56|0;er(f);return}ce[c[(c[d>>2]|0)+8>>2]&511](d|0);f=b+56|0;er(f);return}function cN(a){a=a|0;c[a>>2]=7676;c[a+108>>2]=7696;c4(a+8|0);er(a+108|0);return}function cO(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=c[f>>2]|0;if((g|0)!=0){a4(g|0)}g=c[f+4>>2]|0;if((g|0)!=0){a4(g|0)}g=c[f+8>>2]|0;if((g|0)!=0){a4(g|0)}if((b|0)!=0){aT(b|0)}if((e|0)!=0){bw(e|0)}if((d|0)!=0){bC(d|0)}if((a|0)==0){return}a5(a|0);return}function cP(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f|0;c[b>>2]=bN(a|0,36,0,4e3,d|0,0)|0;d=b+4|0;c[d>>2]=bN(a|0,36,0,4e3,e|0,0)|0;e=bN(a|0,1,0,4e3,0,0)|0;c[b+8>>2]=e;do{if((c[b>>2]|0)!=0){if((c[d>>2]|0)==0|(e|0)==0){break}else{h=1}i=f;return h|0}}while(0);e=cK(14640,2568)|0;d=c[e+((c[(c[e>>2]|0)-12>>2]|0)+28|0)>>2]|0;b=d+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;if((c[3592]|0)!=-1){c[g>>2]=14368;c[g+4>>2]=12;c[g+8>>2]=0;d3(14368,g,96)}g=(c[3593]|0)-1|0;a=c[d+8>>2]|0;do{if((c[d+12>>2]|0)-a>>2>>>0>g>>>0){j=c[a+(g<<2)>>2]|0;if((j|0)==0){break}k=cg[c[(c[j>>2]|0)+28>>2]&63](j,10)|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)==0){ce[c[(c[d>>2]|0)+8>>2]&511](d)}fg(e,k);eS(e);h=0;i=f;return h|0}}while(0);h=b3(4)|0;c[h>>2]=5688;bv(h|0,11856,198);return 0}function cQ(b){b=b|0;var d=0,e=0,f=0,g=0;c[b>>2]=7252;c[b+56>>2]=7272;d=b+4|0;c[d>>2]=7456;if((a[b+36|0]&1)!=0){ky(c[b+44>>2]|0)}c[d>>2]=7600;d=c[b+8>>2]|0;e=d+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){f=b+56|0;er(f);g=b;ky(g);return}ce[c[(c[d>>2]|0)+8>>2]&511](d|0);f=b+56|0;er(f);g=b;ky(g);return}function cR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=i;i=i+12152|0;a=b|0;d=b+16|0;e=b+32|0;f=b+48|0;h=b+64|0;j=b+80|0;k=b+96|0;l=b+112|0;m=b+120|0;n=b+136|0;o=b+4136|0;p=b+8136|0;q=b+12136|0;r=b+12144|0;c[l>>2]=0;s=m;kD(s|0,0,12);t=cJ()|0;if((t|0)==0){u=cK(14640,2352)|0;v=c[u+((c[(c[u>>2]|0)-12>>2]|0)+28|0)>>2]|0;w=v+4|0;I=c[w>>2]|0,c[w>>2]=I+1,I;if((c[3592]|0)!=-1){c[k>>2]=14368;c[k+4>>2]=12;c[k+8>>2]=0;d3(14368,k,96)}k=(c[3593]|0)-1|0;x=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-x>>2>>>0>k>>>0){y=c[x+(k<<2)>>2]|0;if((y|0)==0){break}z=cg[c[(c[y>>2]|0)+28>>2]&63](y,10)|0;if(((I=c[w>>2]|0,c[w>>2]=I+ -1,I)|0)==0){ce[c[(c[v>>2]|0)+8>>2]&511](v)}fg(u,z);eS(u);A=1;i=b;return A|0}}while(0);u=b3(4)|0;c[u>>2]=5688;bv(u|0,11856,198);return 0}u=cI(t,l)|0;if((u|0)==0){v=c[m+8>>2]|0;if((v|0)!=0){a4(v|0)}a5(t|0);A=1;i=b;return A|0}v=cL(t,c[l>>2]|0,2064)|0;if((v|0)==0){cO(t,u,0,0,m|0);A=1;i=b;return A|0}l=b4(v|0,1944,0)|0;if((l|0)==0){w=cK(14640,1872)|0;k=c[w+((c[(c[w>>2]|0)-12>>2]|0)+28|0)>>2]|0;x=k+4|0;I=c[x>>2]|0,c[x>>2]=I+1,I;if((c[3592]|0)!=-1){c[j>>2]=14368;c[j+4>>2]=12;c[j+8>>2]=0;d3(14368,j,96)}j=(c[3593]|0)-1|0;z=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-z>>2>>>0>j>>>0){y=c[z+(j<<2)>>2]|0;if((y|0)==0){break}B=cg[c[(c[y>>2]|0)+28>>2]&63](y,10)|0;if(((I=c[x>>2]|0,c[x>>2]=I+ -1,I)|0)==0){ce[c[(c[k>>2]|0)+8>>2]&511](k)}fg(w,B);eS(w);cO(t,u,v,0,m|0);A=1;i=b;return A|0}}while(0);w=b3(4)|0;c[w>>2]=5688;bv(w|0,11856,198);return 0}else{C=0}do{g[o+(C<<2)>>2]=+(C|0);g[p+(C<<2)>>2]=+(C<<1|0);C=C+1|0;}while(!((C|0)>=1e3));C=m|0;if(!(cP(t,C,o|0,p|0)|0)){cO(t,u,v,l,C);A=1;i=b;return A|0}p=bE(l|0,0,4,s|0)|0;s=bE(l|0,1,4,m+4|0)|p;p=m+8|0;if((s|bE(l|0,2,4,p|0)|0)!=0){s=cK(14640,1824)|0;m=c[s+((c[(c[s>>2]|0)-12>>2]|0)+28|0)>>2]|0;o=m+4|0;I=c[o>>2]|0,c[o>>2]=I+1,I;if((c[3592]|0)!=-1){c[h>>2]=14368;c[h+4>>2]=12;c[h+8>>2]=0;d3(14368,h,96)}h=(c[3593]|0)-1|0;w=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-w>>2>>>0>h>>>0){k=c[w+(h<<2)>>2]|0;if((k|0)==0){break}x=cg[c[(c[k>>2]|0)+28>>2]&63](k,10)|0;if(((I=c[o>>2]|0,c[o>>2]=I+ -1,I)|0)==0){ce[c[(c[m>>2]|0)+8>>2]&511](m)}fg(s,x);eS(s);cO(t,u,v,l,C);A=1;i=b;return A|0}}while(0);s=b3(4)|0;c[s>>2]=5688;bv(s|0,11856,198);return 0}s=q|0;c[s>>2]=1e3;q=r|0;c[q>>2]=1;if((bB(u|0,l|0,1,0,s|0,q|0,0,0,0)|0)!=0){q=cK(14640,1760)|0;s=c[q+((c[(c[q>>2]|0)-12>>2]|0)+28|0)>>2]|0;r=s+4|0;I=c[r>>2]|0,c[r>>2]=I+1,I;if((c[3592]|0)!=-1){c[f>>2]=14368;c[f+4>>2]=12;c[f+8>>2]=0;d3(14368,f,96)}f=(c[3593]|0)-1|0;m=c[s+8>>2]|0;do{if((c[s+12>>2]|0)-m>>2>>>0>f>>>0){o=c[m+(f<<2)>>2]|0;if((o|0)==0){break}h=cg[c[(c[o>>2]|0)+28>>2]&63](o,10)|0;if(((I=c[r>>2]|0,c[r>>2]=I+ -1,I)|0)==0){ce[c[(c[s>>2]|0)+8>>2]&511](s)}fg(q,h);eS(q);cO(t,u,v,l,C);A=1;i=b;return A|0}}while(0);q=b3(4)|0;c[q>>2]=5688;bv(q|0,11856,198);return 0}if((bH(u|0,c[p>>2]|0,1,0,4e3,n|0,0,0,0)|0)==0){D=0}else{p=cK(14640,1720)|0;q=c[p+((c[(c[p>>2]|0)-12>>2]|0)+28|0)>>2]|0;s=q+4|0;I=c[s>>2]|0,c[s>>2]=I+1,I;if((c[3592]|0)!=-1){c[e>>2]=14368;c[e+4>>2]=12;c[e+8>>2]=0;d3(14368,e,96)}e=(c[3593]|0)-1|0;r=c[q+8>>2]|0;do{if((c[q+12>>2]|0)-r>>2>>>0>e>>>0){f=c[r+(e<<2)>>2]|0;if((f|0)==0){break}m=cg[c[(c[f>>2]|0)+28>>2]&63](f,10)|0;if(((I=c[s>>2]|0,c[s>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q)}fg(p,m);eS(p);cO(t,u,v,l,C);A=1;i=b;return A|0}}while(0);p=b3(4)|0;c[p>>2]=5688;bv(p|0,11856,198);return 0}do{cK(eV(14464,+g[n+(D<<2)>>2])|0,1704);D=D+1|0;}while(!((D|0)>=1e3));D=c[14464+((c[(c[3616]|0)-12>>2]|0)+28|0)>>2]|0;n=D+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;if((c[3592]|0)!=-1){c[d>>2]=14368;c[d+4>>2]=12;c[d+8>>2]=0;d3(14368,d,96)}d=(c[3593]|0)-1|0;p=c[D+8>>2]|0;do{if((c[D+12>>2]|0)-p>>2>>>0>d>>>0){q=c[p+(d<<2)>>2]|0;if((q|0)==0){break}s=cg[c[(c[q>>2]|0)+28>>2]&63](q,10)|0;if(((I=c[n>>2]|0,c[n>>2]=I+ -1,I)|0)==0){ce[c[(c[D>>2]|0)+8>>2]&511](D)}fg(14464,s);eS(14464);s=cK(14464,1672)|0;q=c[s+((c[(c[s>>2]|0)-12>>2]|0)+28|0)>>2]|0;e=q+4|0;I=c[e>>2]|0,c[e>>2]=I+1,I;if((c[3592]|0)!=-1){c[a>>2]=14368;c[a+4>>2]=12;c[a+8>>2]=0;d3(14368,a,96)}r=(c[3593]|0)-1|0;m=c[q+8>>2]|0;do{if((c[q+12>>2]|0)-m>>2>>>0>r>>>0){f=c[m+(r<<2)>>2]|0;if((f|0)==0){break}h=cg[c[(c[f>>2]|0)+28>>2]&63](f,10)|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q)}fg(s,h);eS(s);cO(t,u,v,l,C);A=0;i=b;return A|0}}while(0);s=b3(4)|0;c[s>>2]=5688;bv(s|0,11856,198);return 0}}while(0);A=b3(4)|0;c[A>>2]=5688;bv(A|0,11856,198);return 0}function cS(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;i=d+44|0;j=c[i>>2]|0;k=d+24|0;l=c[k>>2]|0;if(j>>>0<l>>>0){c[i>>2]=l;m=l}else{m=j}j=h&24;do{if((j|0)==24){if((g|0)==2){n=436;break}else if((g|0)==0){o=0;p=0;break}else if((g|0)!=1){n=440;break}i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else if((j|0)==0){i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else{if((g|0)==2){n=436;break}else if((g|0)==0){o=0;p=0;break}else if((g|0)!=1){n=440;break}if((h&8|0)==0){i=l-(c[d+20>>2]|0)|0;o=(i|0)<0?-1:0;p=i;break}else{i=(c[d+12>>2]|0)-(c[d+8>>2]|0)|0;o=(i|0)<0?-1:0;p=i;break}}}while(0);if((n|0)==440){g=b;c[g>>2]=0;c[g+4>>2]=0;g=b+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}if((n|0)==436){n=d+32|0;if((a[n]&1)==0){q=n+1|0}else{q=c[d+40>>2]|0}n=m-q|0;o=(n|0)<0?-1:0;p=n}n=kI(p,o,e,f)|0;f=K;e=0;do{if(!((f|0)<(e|0)|(f|0)==(e|0)&n>>>0<0>>>0)){o=d+32|0;if((a[o]&1)==0){r=o+1|0}else{r=c[d+40>>2]|0}o=m-r|0;p=(o|0)<0?-1:0;if((p|0)<(f|0)|(p|0)==(f|0)&o>>>0<n>>>0){break}o=h&8;do{if(!((n|0)==0&(f|0)==0)){do{if((o|0)!=0){if((c[d+12>>2]|0)!=0){break}p=b;c[p>>2]=0;c[p+4>>2]=0;p=b+8|0;c[p>>2]=-1;c[p+4>>2]=-1;return}}while(0);if(!((h&16|0)!=0&(l|0)==0)){break}p=b;c[p>>2]=0;c[p+4>>2]=0;p=b+8|0;c[p>>2]=-1;c[p+4>>2]=-1;return}}while(0);if((o|0)!=0){c[d+12>>2]=(c[d+8>>2]|0)+n|0;c[d+16>>2]=m}if((h&16|0)!=0){c[k>>2]=(c[d+20>>2]|0)+n|0}p=b;c[p>>2]=0;c[p+4>>2]=0;p=b+8|0;c[p>>2]=n;c[p+4>>2]=f;return}}while(0);f=b;c[f>>2]=0;c[f+4>>2]=0;f=b+8|0;c[f>>2]=-1;c[f+4>>2]=-1;return}function cT(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0;b=a+44|0;e=c[b>>2]|0;f=c[a+24>>2]|0;if(e>>>0<f>>>0){c[b>>2]=f;g=f}else{g=e}if((c[a+48>>2]&8|0)==0){h=-1;return h|0}e=a+16|0;f=c[e>>2]|0;b=c[a+12>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;i=g}else{i=f}if(b>>>0>=i>>>0){h=-1;return h|0}h=d[b]|0;return h|0}function cU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+44|0;f=c[e>>2]|0;g=c[b+24>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;h=g}else{h=f}f=b+8|0;g=c[f>>2]|0;e=b+12|0;i=c[e>>2]|0;if(g>>>0>=i>>>0){j=-1;return j|0}if((d|0)==-1){c[f>>2]=g;c[e>>2]=i-1|0;c[b+16>>2]=h;j=0;return j|0}k=i-1|0;do{if((c[b+48>>2]&16|0)==0){if((d<<24>>24|0)==(a[k]|0|0)){break}else{j=-1}return j|0}}while(0);c[f>>2]=g;c[e>>2]=k;c[b+16>>2]=h;a[k]=d&255;j=d;return j|0}function cV(b){b=b|0;var d=0,e=0,f=0,g=0;d=b;e=c[(c[b>>2]|0)-12>>2]|0;c[d+e>>2]=7252;b=d+(e+56|0)|0;c[b>>2]=7272;f=d+(e+4|0)|0;c[f>>2]=7456;if((a[d+(e+36|0)|0]&1)!=0){ky(c[d+(e+44|0)>>2]|0)}c[f>>2]=7600;f=c[d+(e+8|0)>>2]|0;e=f+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){g=b;er(g);return}ce[c[(c[f>>2]|0)+8>>2]&511](f|0);g=b;er(g);return}function cW(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b;e=c[(c[b>>2]|0)-12>>2]|0;b=d+e|0;c[b>>2]=7252;f=d+(e+56|0)|0;c[f>>2]=7272;g=d+(e+4|0)|0;c[g>>2]=7456;if((a[d+(e+36|0)|0]&1)!=0){ky(c[d+(e+44|0)>>2]|0)}c[g>>2]=7600;g=c[d+(e+8|0)>>2]|0;e=g+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){h=f;er(h);ky(b);return}ce[c[(c[g>>2]|0)+8>>2]&511](g|0);h=f;er(h);ky(b);return}function cX(b){b=b|0;var d=0;d=b|0;c[d>>2]=7456;if((a[b+32|0]&1)!=0){ky(c[b+40>>2]|0)}c[d>>2]=7600;d=c[b+4>>2]|0;b=d+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[d>>2]|0)+8>>2]&511](d|0);return}function cY(b){b=b|0;var d=0,e=0,f=0;d=b|0;c[d>>2]=7456;if((a[b+32|0]&1)!=0){ky(c[b+40>>2]|0)}c[d>>2]=7600;d=c[b+4>>2]|0;e=d+4|0;if(((I=c[e>>2]|0,c[e>>2]=I+ -1,I)|0)!=0){f=b;ky(f);return}ce[c[(c[d>>2]|0)+8>>2]&511](d|0);f=b;ky(f);return}function cZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d;d=i;i=i+16|0;c[d>>2]=c[g>>2]|0;c[d+4>>2]=c[g+4>>2]|0;c[d+8>>2]=c[g+8>>2]|0;c[d+12>>2]=c[g+12>>2]|0;g=d+8|0;cr[c[(c[b>>2]|0)+16>>2]&63](a,b,c[g>>2]|0,c[g+4>>2]|0,0,e);i=f;return}function c_(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;if((d|0)==-1){e=0;return e|0}f=b|0;g=b+12|0;h=b+8|0;i=(c[g>>2]|0)-(c[h>>2]|0)|0;j=b+24|0;k=c[j>>2]|0;l=b+28|0;m=c[l>>2]|0;if((k|0)==(m|0)){n=b+48|0;if((c[n>>2]&16|0)==0){e=-1;return e|0}o=b+20|0;p=c[o>>2]|0;q=k-p|0;r=b+44|0;s=(c[r>>2]|0)-p|0;p=b+32|0;t=p;u=p;v=a[u]|0;if((v&1)==0){w=10;x=v}else{v=c[p>>2]|0;w=(v&-2)-1|0;x=v&255}v=x&255;if((v&1|0)==0){y=v>>>1}else{y=c[b+36>>2]|0}if((y|0)==(w|0)){en(p,w,1,w,w,0,0);z=a[u]|0}else{z=x}if((z&1)==0){A=t+1|0}else{A=c[b+40>>2]|0}a[A+y|0]=0;z=y+1|0;a[A+z|0]=0;A=a[u]|0;if((A&1)==0){y=z<<1&255;a[u]=y;B=y}else{c[b+36>>2]=z;B=A}if((B&1)==0){C=10;D=B}else{B=c[p>>2]|0;C=(B&-2)-1|0;D=B&255}B=D&255;if((B&1|0)==0){E=B>>>1}else{E=c[b+36>>2]|0}do{if(E>>>0<C>>>0){B=C-E|0;d0(p,B,0)}else{if((D&1)==0){a[C+(t+1)|0]=0;a[u]=C<<1&255;break}else{a[(c[b+40>>2]|0)+C|0]=0;c[b+36>>2]=C;break}}}while(0);C=a[u]|0;if((C&1)==0){F=t+1|0}else{F=c[b+40>>2]|0}t=C&255;if((t&1|0)==0){G=t>>>1}else{G=c[b+36>>2]|0}t=F+G|0;c[o>>2]=F;c[l>>2]=t;l=F+q|0;c[j>>2]=l;q=F+s|0;c[r>>2]=q;H=l;I=t;J=q;K=n}else{H=k;I=m;J=c[b+44>>2]|0;K=b+48|0}m=H+1|0;k=m>>>0<J>>>0?J:m;c[b+44>>2]=k;if((c[K>>2]&8|0)!=0){K=b+32|0;if((a[K]&1)==0){L=K+1|0}else{L=c[b+40>>2]|0}c[h>>2]=L;c[g>>2]=L+i|0;c[b+16>>2]=k}if((H|0)==(I|0)){e=cg[c[(c[b>>2]|0)+52>>2]&63](f,d&255)|0;return e|0}else{c[j>>2]=m;a[H]=d&255;e=d&255;return e|0}return 0}function c$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=b+32|0;d_(e,d);d=b+44|0;c[d>>2]=0;f=b+48|0;g=c[f>>2]|0;if((g&8|0)!=0){h=e;i=a[e]|0;j=(i&1)==0;if(j){k=h+1|0}else{k=c[b+40>>2]|0}l=i&255;if((l&1|0)==0){m=l>>>1}else{m=c[b+36>>2]|0}l=k+m|0;c[d>>2]=l;if(j){n=h+1|0;o=h+1|0}else{h=c[b+40>>2]|0;n=h;o=h}c[b+8>>2]=o;c[b+12>>2]=n;c[b+16>>2]=l}if((g&16|0)==0){return}g=e;l=e;n=a[l]|0;o=n&255;if((o&1|0)==0){p=o>>>1}else{p=c[b+36>>2]|0}if((n&1)==0){c[d>>2]=p+(g+1)|0;q=10;r=n}else{c[d>>2]=(c[b+40>>2]|0)+p|0;d=c[e>>2]|0;q=(d&-2)-1|0;r=d&255}d=r&255;if((d&1|0)==0){s=d>>>1}else{s=c[b+36>>2]|0}do{if(s>>>0<q>>>0){d=q-s|0;d0(e,d,0)}else{if((r&1)==0){a[q+(g+1)|0]=0;a[l]=q<<1&255;break}else{a[(c[b+40>>2]|0)+q|0]=0;c[b+36>>2]=q;break}}}while(0);q=a[l]|0;if((q&1)==0){t=g+1|0;u=g+1|0}else{g=c[b+40>>2]|0;t=g;u=g}g=q&255;if((g&1|0)==0){v=g>>>1}else{v=c[b+36>>2]|0}g=b+24|0;c[g>>2]=u;c[b+20>>2]=u;c[b+28>>2]=t+v|0;if((c[f>>2]&3|0)==0){return}c[g>>2]=u+p|0;return}function c0(a){a=a|0;c4(a);return}function c1(a){a=a|0;c[a>>2]=7676;c[a+108>>2]=7696;c4(a+8|0);er(a+108|0);ky(a);return}function c2(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;c[b+d>>2]=7676;a=b+(d+108|0)|0;c[a>>2]=7696;c4(b+(d+8|0)|0);er(a);return}function c3(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=7676;e=b+(d+108|0)|0;c[e>>2]=7696;c4(b+(d+8|0)|0);er(e);ky(a);return}function c4(b){b=b|0;var d=0,e=0,f=0;d=b|0;c[d>>2]=7912;e=b+64|0;f=c[e>>2]|0;do{if((f|0)!=0){db(b);if((aJ(f|0)|0)!=0){break}c[e>>2]=0}}while(0);do{if((a[b+96|0]&1)!=0){e=c[b+32>>2]|0;if((e|0)==0){break}kz(e)}}while(0);do{if((a[b+97|0]&1)!=0){e=c[b+56>>2]|0;if((e|0)==0){break}kz(e)}}while(0);c[d>>2]=7600;d=c[b+4>>2]|0;b=d+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[d>>2]|0)+8>>2]&511](d|0);return}function c5(a){a=a|0;c4(a);ky(a);return}function c6(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b|0;g=b+96|0;kD(b+8|0,0,24);do{if((a[g]&1)!=0){h=c[b+32>>2]|0;if((h|0)==0){break}kz(h)}}while(0);h=b+97|0;do{if((a[h]&1)!=0){i=c[b+56>>2]|0;if((i|0)==0){break}kz(i)}}while(0);i=b+52|0;c[i>>2]=e;do{if(e>>>0>8){j=b+98|0;if((a[j]&1)==0|(d|0)==0){c[b+32>>2]=kv(e)|0;a[g]=1;k=j;break}else{c[b+32>>2]=d;a[g]=0;k=j;break}}else{c[b+32>>2]=b+44|0;c[i>>2]=8;a[g]=0;k=b+98|0}}while(0);if((a[k]&1)!=0){c[b+60>>2]=0;c[b+56>>2]=0;a[h]=0;return f|0}k=(e|0)<8?8:e;c[b+60>>2]=k;if((d|0)!=0&k>>>0>7){c[b+56>>2]=d;a[h]=0;return f|0}else{c[b+56>>2]=kv(k)|0;a[h]=1;return f|0}return 0}function c7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;e=i;f=d;d=i;i=i+16|0;c[d>>2]=c[f>>2]|0;c[d+4>>2]=c[f+4>>2]|0;c[d+8>>2]=c[f+8>>2]|0;c[d+12>>2]=c[f+12>>2]|0;f=b+64|0;do{if((c[f>>2]|0)!=0){if((ci[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if((b1(c[f>>2]|0,c[d+8>>2]|0,0)|0)==0){g=d;h=c[g+4>>2]|0;j=b+72|0;c[j>>2]=c[g>>2]|0;c[j+4>>2]=h;h=a;j=d;c[h>>2]=c[j>>2]|0;c[h+4>>2]=c[j+4>>2]|0;c[h+8>>2]=c[j+8>>2]|0;c[h+12>>2]=c[j+12>>2]|0;i=e;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;i=e;return}}}while(0);d=a;c[d>>2]=0;c[d+4>>2]=0;d=a+8|0;c[d>>2]=-1;c[d+4>>2]=-1;i=e;return}function c8(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e|0;ci[c[(c[b>>2]|0)+24>>2]&255](b);g=c[d>>2]|0;if((c[3516]|0)!=-1){c[f>>2]=14064;c[f+4>>2]=12;c[f+8>>2]=0;d3(14064,f,96)}f=(c[3517]|0)-1|0;d=c[g+8>>2]|0;if((c[g+12>>2]|0)-d>>2>>>0<=f>>>0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}g=c[d+(f<<2)>>2]|0;if((g|0)==0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}h=g;c[b+68>>2]=h;j=b+98|0;f=a[j]&1;d=ci[c[(c[g>>2]|0)+28>>2]&255](h)|0;a[j]=d&1;if((f&255|0)==(d&1|0)){i=e;return}f=b+96|0;kD(b+8|0,0,24);j=(a[f]&1)!=0;if(d){d=b+32|0;do{if(j){h=c[d>>2]|0;if((h|0)==0){break}kz(h)}}while(0);h=b+97|0;a[f]=a[h]&1;g=b+60|0;c[b+52>>2]=c[g>>2]|0;k=b+56|0;c[d>>2]=c[k>>2]|0;c[g>>2]=0;c[k>>2]=0;a[h]=0;i=e;return}do{if(!j){h=b+32|0;k=c[h>>2]|0;if((k|0)==(b+44|0)){break}g=c[b+52>>2]|0;c[b+60>>2]=g;c[b+56>>2]=k;a[b+97|0]=0;c[h>>2]=kv(g)|0;a[f]=1;i=e;return}}while(0);f=c[b+52>>2]|0;c[b+60>>2]=f;c[b+56>>2]=kv(f)|0;a[b+97|0]=1;i=e;return}function c9(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;g=c[b+68>>2]|0;if((g|0)==0){h=b3(4)|0;c[h>>2]=5688;bv(h|0,11856,198)}h=ci[c[(c[g>>2]|0)+24>>2]&255](g)|0;g=b+64|0;do{if((c[g>>2]|0)!=0){i=(h|0)>0;if(!(i|(d|0)==0&(e|0)==0)){break}if((ci[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if(f>>>0>=3){j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}j=c[g>>2]|0;if(i){i=kS(h,(h|0)<0?-1:0,d,e)|0;k=i}else{k=0}if((b1(j|0,k|0,f|0)|0)==0){j=be(c[g>>2]|0)|0;i=b+72|0;l=c[i+4>>2]|0;m=a;c[m>>2]=c[i>>2]|0;c[m+4>>2]=l;l=a+8|0;c[l>>2]=j;c[l+4>>2]=(j|0)<0?-1:0;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}}}while(0);b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;return}function da(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((c[b+64>>2]|0)==0){e=-1;return e|0}f=b+12|0;g=c[f>>2]|0;if((c[b+8>>2]|0)>>>0>=g>>>0){e=-1;return e|0}if((d|0)==-1){c[f>>2]=g-1|0;e=0;return e|0}h=g-1|0;do{if((c[b+88>>2]&16|0)==0){if((d<<24>>24|0)==(a[h]|0|0)){break}else{e=-1}return e|0}}while(0);c[f>>2]=h;a[h]=d&255;e=d;return e|0}function db(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=f;h=b+64|0;if((c[h>>2]|0)==0){j=0;i=d;return j|0}k=b+68|0;l=c[k>>2]|0;if((l|0)==0){m=b3(4)|0;c[m>>2]=5688;bv(m|0,11856,198);return 0}m=b+92|0;n=c[m>>2]|0;do{if((n&16|0)==0){if((n&8|0)==0){break}o=b+80|0;p=c[o+4>>2]|0;c[f>>2]=c[o>>2]|0;c[f+4>>2]=p;do{if((a[b+98|0]&1)==0){p=ci[c[(c[l>>2]|0)+24>>2]&255](l)|0;o=b+36|0;q=c[o>>2]|0;r=(c[b+40>>2]|0)-q|0;if((p|0)>0){s=ag((c[b+16>>2]|0)-(c[b+12>>2]|0)|0,p)+r|0;t=0;break}p=c[b+12>>2]|0;if((p|0)==(c[b+16>>2]|0)){s=r;t=0;break}u=c[k>>2]|0;v=b+32|0;w=ch[c[(c[u>>2]|0)+32>>2]&31](u,g,c[v>>2]|0,q,p-(c[b+8>>2]|0)|0)|0;s=((r-w|0)+(c[o>>2]|0)|0)-(c[v>>2]|0)|0;t=1}else{s=(c[b+16>>2]|0)-(c[b+12>>2]|0)|0;t=0}}while(0);if((b1(c[h>>2]|0,-s|0,1)|0)!=0){j=-1;i=d;return j|0}if(t){v=b+72|0;o=c[f+4>>2]|0;c[v>>2]=c[f>>2]|0;c[v+4>>2]=o}o=c[b+32>>2]|0;c[b+40>>2]=o;c[b+36>>2]=o;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[m>>2]=0}else{do{if((c[b+24>>2]|0)!=(c[b+20>>2]|0)){if((cg[c[(c[b>>2]|0)+52>>2]&63](b,-1)|0)==-1){j=-1}else{break}i=d;return j|0}}while(0);o=b+72|0;v=b+32|0;w=b+52|0;while(1){r=c[k>>2]|0;p=c[v>>2]|0;q=ch[c[(c[r>>2]|0)+20>>2]&31](r,o,p,p+(c[w>>2]|0)|0,e)|0;p=c[v>>2]|0;r=(c[e>>2]|0)-p|0;if((aQ(p|0,1,r|0,c[h>>2]|0)|0)!=(r|0)){j=-1;x=745;break}if((q|0)==2){j=-1;x=744;break}else if((q|0)!=1){x=730;break}}if((x|0)==730){if((aO(c[h>>2]|0)|0)==0){break}else{j=-1}i=d;return j|0}else if((x|0)==744){i=d;return j|0}else if((x|0)==745){i=d;return j|0}}}while(0);j=0;i=d;return j|0}function dc(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=b+64|0;if((c[h>>2]|0)==0){j=-1;i=e;return j|0}k=b+92|0;if((c[k>>2]&8|0)==0){c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;if((a[b+98|0]&1)==0){l=c[b+56>>2]|0;m=l+(c[b+60>>2]|0)|0;c[b+8>>2]=l;c[b+12>>2]=m;c[b+16>>2]=m;n=m}else{m=c[b+32>>2]|0;l=m+(c[b+52>>2]|0)|0;c[b+8>>2]=m;c[b+12>>2]=l;c[b+16>>2]=l;n=l}c[k>>2]=8;o=1;p=n;q=b+12|0}else{n=b+12|0;o=0;p=c[n>>2]|0;q=n}if((p|0)==0){n=f+1|0;c[b+8>>2]=f;c[q>>2]=n;c[b+16>>2]=n;r=n}else{r=p}p=c[b+16>>2]|0;if(o){s=0}else{o=(p-(c[b+8>>2]|0)|0)/2&-1;s=o>>>0>4?4:o}o=b+16|0;do{if((r|0)==(p|0)){n=b+8|0;kF(c[n>>2]|0,r+(-s|0)|0,s|0);if((a[b+98|0]&1)!=0){k=c[n>>2]|0;l=bV(k+s|0,1,((c[o>>2]|0)-s|0)-k|0,c[h>>2]|0)|0;if((l|0)==0){t=-1;u=n;break}k=c[n>>2]|0;m=k+s|0;c[q>>2]=m;c[o>>2]=k+(l+s|0)|0;t=d[m]|0;u=n;break}m=b+32|0;l=b+36|0;k=c[l>>2]|0;v=b+40|0;kF(c[m>>2]|0,k|0,(c[v>>2]|0)-k|0);k=c[m>>2]|0;w=k+((c[v>>2]|0)-(c[l>>2]|0)|0)|0;c[l>>2]=w;if((k|0)==(b+44|0)){x=8}else{x=c[b+52>>2]|0}y=k+x|0;c[v>>2]=y;k=b+60|0;z=(c[k>>2]|0)-s|0;A=y-w|0;y=b+72|0;B=y;C=b+80|0;D=c[B+4>>2]|0;c[C>>2]=c[B>>2]|0;c[C+4>>2]=D;D=bV(w|0,1,(A>>>0<z>>>0?A:z)|0,c[h>>2]|0)|0;if((D|0)==0){t=-1;u=n;break}z=c[b+68>>2]|0;if((z|0)==0){A=b3(4)|0;c[A>>2]=5688;bv(A|0,11856,198);return 0}A=(c[l>>2]|0)+D|0;c[v>>2]=A;D=c[n>>2]|0;if((co[c[(c[z>>2]|0)+16>>2]&31](z,y,c[m>>2]|0,A,l,D+s|0,D+(c[k>>2]|0)|0,g)|0)==3){k=c[m>>2]|0;m=c[v>>2]|0;c[n>>2]=k;c[q>>2]=k;c[o>>2]=m;t=d[k]|0;u=n;break}k=c[g>>2]|0;m=c[n>>2]|0;v=m+s|0;if((k|0)==(v|0)){t=-1;u=n;break}c[n>>2]=m;c[q>>2]=v;c[o>>2]=k;t=d[v]|0;u=n}else{t=d[r]|0;u=b+8|0}}while(0);if((c[u>>2]|0)!=(f|0)){j=t;i=e;return j|0}c[u>>2]=0;c[q>>2]=0;c[o>>2]=0;j=t;i=e;return j|0}function dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+24|0;f=e|0;g=e+8|0;h=e+16|0;j=b+64|0;if((c[j>>2]|0)==0){k=-1;i=e;return k|0}l=b+92|0;if((c[l>>2]&16|0)==0){c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;m=c[b+52>>2]|0;do{if(m>>>0>8){if((a[b+98|0]&1)==0){n=c[b+56>>2]|0;o=n+((c[b+60>>2]|0)-1|0)|0;c[b+24>>2]=n;c[b+20>>2]=n;c[b+28>>2]=o;p=n;q=o;break}else{o=c[b+32>>2]|0;n=o+(m-1|0)|0;c[b+24>>2]=o;c[b+20>>2]=o;c[b+28>>2]=n;p=o;q=n;break}}else{c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;p=0;q=0}}while(0);c[l>>2]=16;r=p;s=q;t=b+20|0;u=b+28|0}else{q=b+20|0;p=b+28|0;r=c[q>>2]|0;s=c[p>>2]|0;t=q;u=p}p=(d|0)==-1;q=b+24|0;l=c[q>>2]|0;if(p){v=r;w=l}else{if((l|0)==0){c[q>>2]=f;c[t>>2]=f;c[u>>2]=f+1|0;x=f}else{x=l}a[x]=d&255;x=(c[q>>2]|0)+1|0;c[q>>2]=x;v=c[t>>2]|0;w=x}x=b+24|0;if((w|0)!=(v|0)){L901:do{if((a[b+98|0]&1)==0){q=b+32|0;l=c[q>>2]|0;c[g>>2]=l;f=b+68|0;m=c[f>>2]|0;if((m|0)==0){y=b3(4)|0;z=y;c[z>>2]=5688;bv(y|0,11856,198);return 0}n=b+72|0;o=b+52|0;A=m;m=v;B=w;C=l;while(1){l=co[c[(c[A>>2]|0)+12>>2]&31](A,n,m,B,h,C,C+(c[o>>2]|0)|0,g)|0;D=c[t>>2]|0;if((c[h>>2]|0)==(D|0)){k=-1;E=816;break}if((l|0)==3){E=803;break}if(l>>>0>=2){k=-1;E=812;break}F=c[q>>2]|0;G=(c[g>>2]|0)-F|0;if((aQ(F|0,1,G|0,c[j>>2]|0)|0)!=(G|0)){k=-1;E=818;break}if((l|0)!=1){break L901}l=c[h>>2]|0;G=c[x>>2]|0;c[t>>2]=l;c[u>>2]=G;F=l+(G-l|0)|0;c[x>>2]=F;G=c[f>>2]|0;if((G|0)==0){E=819;break}A=G;m=l;B=F;C=c[q>>2]|0}if((E|0)==812){i=e;return k|0}else if((E|0)==803){q=(c[x>>2]|0)-D|0;if((aQ(D|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}else if((E|0)==816){i=e;return k|0}else if((E|0)==818){i=e;return k|0}else if((E|0)==819){y=b3(4)|0;z=y;c[z>>2]=5688;bv(y|0,11856,198);return 0}}else{q=w-v|0;if((aQ(v|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}}while(0);c[x>>2]=r;c[t>>2]=r;c[u>>2]=s}k=p?0:d;i=e;return k|0}function de(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2]|0;l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((cj[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){if(q>>>0<11){h=q<<1&255;e=l;a[e]=h;r=l+1|0;s=h;t=e}else{e=q+16&-16;h=ku(e)|0;c[l+8>>2]=h;g=e|1;c[l>>2]=g;c[l+4>>2]=q;r=h;s=g&255;t=l}kD(r|0,j|0,q|0);a[r+q|0]=0;if((s&1)==0){u=l+1|0}else{u=c[l+8>>2]|0}if((cj[c[(c[d>>2]|0)+48>>2]&63](d,u,q)|0)==(q|0)){if((a[t]&1)==0){break}ky(c[l+8>>2]|0);break}c[m>>2]=0;c[b>>2]=0;if((a[t]&1)==0){i=k;return}ky(c[l+8>>2]|0);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((cj[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function df(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;i=i+32|0;e=d|0;f=d+16|0;g=b|0;c[g>>2]=7600;if(a[14952]|0){h=c[1162]|0}else{if(a[14960]|0){j=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;j=4952}c[1168]=j;k=j+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;c[1162]=4672;a[14952]=1;h=4672}k=b+4|0;j=c[h>>2]|0;c[k>>2]=j;h=j+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;kD(b+8|0,0,24);c[g>>2]=7912;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=0;g=b+68|0;h=b+98|0;kD(b+52|0,0,47);j=c[k>>2]|0;l=j+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3516]|0)!=-1){c[f>>2]=14064;c[f+4>>2]=12;c[f+8>>2]=0;d3(14064,f,96)}f=(c[3517]|0)-1|0;m=c[j+8>>2]|0;if((c[j+12>>2]|0)-m>>2>>>0>f>>>0){n=(c[m+(f<<2)>>2]|0)!=0}else{n=0}if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){ce[c[(c[j>>2]|0)+8>>2]&511](j|0)}L981:do{if(n){j=c[k>>2]|0;l=j+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3516]|0)!=-1){c[e>>2]=14064;c[e+4>>2]=12;c[e+8>>2]=0;d3(14064,e,96)}f=(c[3517]|0)-1|0;m=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-m>>2>>>0>f>>>0){o=c[m+(f<<2)>>2]|0;if((o|0)==0){break}c[g>>2]=o;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)==0){ce[c[(c[j>>2]|0)+8>>2]&511](j|0)}o=c[g>>2]|0;a[h]=ci[c[(c[o>>2]|0)+28>>2]&255](o)&1;break L981}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}}while(0);cj[c[(c[b>>2]|0)+12>>2]&63](b,0,4096);i=d;return}function dg(a){a=a|0;var b=0;c[a>>2]=7528;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);return}function dh(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=7528;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;ky(e);return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);e=a;ky(e);return}function di(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=ch[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aQ(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=903;break}if((l|0)==2){m=-1;n=902;break}else if((l|0)!=1){n=899;break}}if((n|0)==903){i=b;return m|0}else if((n|0)==899){m=((aO(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==902){i=b;return m|0}return 0}function dj(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,p=0,q=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;dV(13792,c[o>>2]|0,13864);c[3682]=7868;c[3684]=7888;c[3683]=0;c[3690]=13792;c[3688]=0;c[3689]=0;c[3685]=4098;c[3687]=0;c[3686]=6;kD(14768,0,40);if(a[14952]|0){d=c[1162]|0}else{if(a[14960]|0){e=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;e=4952}c[1168]=e;b=e+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;c[1162]=4672;a[14952]=1;d=4672}b=c[d>>2]|0;c[3691]=b;d=b+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;c[3702]=0;c[3703]=-1;dA(13696,c[s>>2]|0,13872);c[3616]=7772;c[3617]=7792;c[3623]=13696;c[3621]=0;c[3622]=0;c[3618]=4098;c[3620]=0;c[3619]=6;kD(14500,0,40);if(a[14952]|0){f=c[1162]|0}else{if(a[14960]|0){g=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;g=4952}c[1168]=g;d=g+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;c[1162]=4672;a[14952]=1;f=4672}d=c[f>>2]|0;c[3624]=d;f=d+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;c[3635]=0;c[3636]=-1;dA(13744,c[r>>2]|0,13880);c[3660]=7772;c[3661]=7792;c[3667]=13744;c[3665]=0;c[3666]=0;c[3662]=4098;c[3664]=0;c[3663]=6;kD(14676,0,40);if(a[14952]|0){h=c[1162]|0}else{if(a[14960]|0){i=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;i=4952}c[1168]=i;f=i+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;c[1162]=4672;a[14952]=1;h=4672}f=c[h>>2]|0;c[3668]=f;h=f+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;c[3679]=0;c[3680]=-1;h=c[14640+((c[(c[3660]|0)-12>>2]|0)+24|0)>>2]|0;c[3638]=7772;c[3639]=7792;c[3645]=h;c[3643]=(h|0)==0&1;c[3644]=0;c[3640]=4098;c[3642]=0;c[3641]=6;kD(14588,0,40);if(a[14952]|0){j=c[1162]|0}else{if(a[14960]|0){k=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;k=4952}c[1168]=k;h=k+4|0;I=c[h>>2]|0,c[h>>2]=I+1,I;c[1162]=4672;a[14952]=1;j=4672}h=c[j>>2]|0;c[3646]=h;j=h+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;c[3657]=0;c[3658]=-1;c[14728+((c[(c[3682]|0)-12>>2]|0)+72|0)>>2]=14464;j=14640+((c[(c[3660]|0)-12>>2]|0)+4|0)|0;c[j>>2]=c[j>>2]|8192;c[14640+((c[(c[3660]|0)-12>>2]|0)+72|0)>>2]=14464;dy(13640,c[o>>2]|0,13888);c[3594]=7820;c[3596]=7840;c[3595]=0;c[3602]=13640;c[3600]=0;c[3601]=0;c[3597]=4098;c[3599]=0;c[3598]=6;kD(14416,0,40);if(a[14952]|0){l=c[1162]|0}else{if(a[14960]|0){m=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;m=4952}c[1168]=m;j=m+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;c[1162]=4672;a[14952]=1;l=4672}j=c[l>>2]|0;c[3603]=j;l=j+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[3614]=0;c[3615]=-1;dl(13544,c[s>>2]|0,13896);c[3524]=7724;c[3525]=7744;c[3531]=13544;c[3529]=0;c[3530]=0;c[3526]=4098;c[3528]=0;c[3527]=6;kD(14132,0,40);if(a[14952]|0){n=c[1162]|0}else{if(a[14960]|0){p=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;p=4952}c[1168]=p;l=p+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[1162]=4672;a[14952]=1;n=4672}l=c[n>>2]|0;c[3532]=l;n=l+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;c[3543]=0;c[3544]=-1;dl(13592,c[r>>2]|0,13904);c[3568]=7724;c[3569]=7744;c[3575]=13592;c[3573]=0;c[3574]=0;c[3570]=4098;c[3572]=0;c[3571]=6;kD(14308,0,40);if(a[14952]|0){q=c[1162]|0}else{if(a[14960]|0){t=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;t=4952}c[1168]=t;n=t+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;c[1162]=4672;a[14952]=1;q=4672}n=c[q>>2]|0;c[3576]=n;q=n+4|0;I=c[q>>2]|0,c[q>>2]=I+1,I;c[3587]=0;c[3588]=-1;q=c[14272+((c[(c[3568]|0)-12>>2]|0)+24|0)>>2]|0;c[3546]=7724;c[3547]=7744;c[3553]=q;c[3551]=(q|0)==0&1;c[3552]=0;c[3548]=4098;c[3550]=0;c[3549]=6;kD(14220,0,40);if(a[14952]|0){u=c[1162]|0;v=u|0;w=c[v>>2]|0;x=w;c[3554]=x;y=w+4|0;z=(I=c[y>>2]|0,c[y>>2]=I+1,I);c[3565]=0;c[3566]=-1;A=c[3594]|0;B=A-12|0;C=B;D=c[C>>2]|0;E=D+72|0;F=E+14376|0;G=F;c[G>>2]=14096;H=c[3568]|0;J=H-12|0;K=J;L=c[K>>2]|0;M=L+4|0;N=M+14272|0;O=N;P=c[O>>2]|0;Q=P|8192;c[O>>2]=Q;R=c[3568]|0;S=R-12|0;T=S;U=c[T>>2]|0;V=U+72|0;W=V+14272|0;X=W;c[X>>2]=14096;return}if(a[14960]|0){Y=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;Y=4952}c[1168]=Y;q=Y+4|0;I=c[q>>2]|0,c[q>>2]=I+1,I;c[1162]=4672;a[14952]=1;u=4672;v=u|0;w=c[v>>2]|0;x=w;c[3554]=x;y=w+4|0;z=(I=c[y>>2]|0,c[y>>2]=I+1,I);c[3565]=0;c[3566]=-1;A=c[3594]|0;B=A-12|0;C=B;D=c[C>>2]|0;E=D+72|0;F=E+14376|0;G=F;c[G>>2]=14096;H=c[3568]|0;J=H-12|0;K=J;L=c[K>>2]|0;M=L+4|0;N=M+14272|0;O=N;P=c[O>>2]|0;Q=P|8192;c[O>>2]=Q;R=c[3568]|0;S=R-12|0;T=S;U=c[T>>2]|0;V=U+72|0;W=V+14272|0;X=W;c[X>>2]=14096;return}function dk(a){a=a|0;eS(14464);eS(14552);eT(14096);eT(14184);return}function dl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+16|0;g=f|0;h=b|0;c[h>>2]=7528;if(a[14952]|0){j=c[1162]|0}else{if(a[14960]|0){k=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;k=4952}c[1168]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[1162]=4672;a[14952]=1;j=4672}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;kD(b+8|0,0,24);c[h>>2]=8016;c[b+32>>2]=d;d=b+36|0;h=c[l>>2]|0;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3514]|0)!=-1){c[g>>2]=14056;c[g+4>>2]=12;c[g+8>>2]=0;d3(14056,g,96)}g=(c[3515]|0)-1|0;j=c[h+8>>2]|0;do{if((c[h+12>>2]|0)-j>>2>>>0>g>>>0){k=c[j+(g<<2)>>2]|0;if((k|0)==0){break}m=k;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){c[d>>2]=m;n=b+40|0;c[n>>2]=e;o=b+44|0;p=k;q=c[p>>2]|0;r=q+28|0;s=c[r>>2]|0;t=ci[s&255](m)|0;u=t&1;a[o]=u;i=f;return}ce[c[(c[h>>2]|0)+8>>2]&511](h|0);c[d>>2]=m;n=b+40|0;c[n>>2]=e;o=b+44|0;p=k;q=c[p>>2]|0;r=q+28|0;s=c[r>>2]|0;t=ci[s&255](m)|0;u=t&1;a[o]=u;i=f;return}}while(0);f=b3(4)|0;c[f>>2]=5688;bv(f|0,11856,198)}function dm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+16|0;f=e|0;ci[c[(c[b>>2]|0)+24>>2]&255](b);g=c[d>>2]|0;if((c[3514]|0)!=-1){c[f>>2]=14056;c[f+4>>2]=12;c[f+8>>2]=0;d3(14056,f,96)}f=(c[3515]|0)-1|0;d=c[g+8>>2]|0;if((c[g+12>>2]|0)-d>>2>>>0<=f>>>0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}g=c[d+(f<<2)>>2]|0;if((g|0)==0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}else{h=g;c[b+36>>2]=h;a[b+44|0]=ci[c[(c[g>>2]|0)+28>>2]&255](h)&1;i=e;return}}function dn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+4|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;c[g>>2]=d;c[m>>2]=l;L1129:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=co[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=1028;break}if((y|0)==3){B=1015;break}if(y>>>0>=2){A=-1;B=1026;break}x=(c[h>>2]|0)-t|0;if((aQ(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=1024;break}if((y|0)!=1){break L1129}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y>>2<<2)|0;c[m>>2]=C;v=y;w=C}if((B|0)==1028){i=e;return A|0}else if((B|0)==1015){if((aQ(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==1024){i=e;return A|0}else if((B|0)==1026){i=e;return A|0}}else{if((aQ(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dp(a){a=a|0;var b=0;c[a>>2]=7528;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);return}function dq(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=7528;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;ky(e);return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);e=a;ky(e);return}function dr(a){a=a|0;return du(a,0)|0}function ds(a){a=a|0;return du(a,1)|0}function dt(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}c[h>>2]=d;k=c[b+36>>2]|0;l=f|0;m=co[c[(c[k>>2]|0)+12>>2]&31](k,c[b+40>>2]|0,h,h+4|0,e+24|0,l,f+8|0,g)|0;if((m|0)==2|(m|0)==1){j=-1;i=e;return j|0}else if((m|0)==3){a[l]=d&255;c[g>>2]=f+1|0}f=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=l>>>0){j=d;n=1051;break}m=b-1|0;c[g>>2]=m;if((bP(a[m]|0|0,c[f>>2]|0)|0)==-1){j=-1;n=1048;break}}if((n|0)==1048){i=e;return j|0}else if((n|0)==1051){i=e;return j|0}return 0}function du(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=c[b+44>>2]|0;l=(k|0)>1?k:1;L1176:do{if((l|0)>0){k=b+32|0;m=0;while(1){n=a3(c[k>>2]|0)|0;if((n|0)==-1){o=-1;break}a[f+m|0]=n&255;m=m+1|0;if((m|0)>=(l|0)){break L1176}}i=e;return o|0}}while(0);L1183:do{if((a[b+48|0]&1)==0){m=b+40|0;k=b+36|0;n=f|0;p=g+4|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[k>>2]|0;w=f+r|0;x=co[c[(c[t>>2]|0)+16>>2]&31](t,s,n,w,h,g,p,j)|0;if((x|0)==3){y=1062;break}else if((x|0)==2){o=-1;y=1074;break}else if((x|0)!=1){z=r;break L1183}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=1071;break}v=a3(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=1070;break}a[w]=v&255;r=r+1|0}if((y|0)==1062){c[g>>2]=a[n]|0;z=r;break}else if((y|0)==1074){i=e;return o|0}else if((y|0)==1070){i=e;return o|0}else if((y|0)==1071){i=e;return o|0}}else{c[g>>2]=a[f|0]|0;z=l}}while(0);L1197:do{if(!d){l=b+32|0;y=z;while(1){if((y|0)<=0){break L1197}j=y-1|0;if((bP(a[f+j|0]|0|0,c[l>>2]|0)|0)==-1){o=-1;break}else{y=j}}i=e;return o|0}}while(0);o=c[g>>2]|0;i=e;return o|0}function dv(a){a=a|0;var b=0;c[a>>2]=7600;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);return}function dw(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=7600;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;ky(e);return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);e=a;ky(e);return}function dx(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=ch[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aQ(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=1092;break}if((l|0)==2){m=-1;n=1091;break}else if((l|0)!=1){n=1089;break}}if((n|0)==1091){i=b;return m|0}else if((n|0)==1092){i=b;return m|0}else if((n|0)==1089){m=((aO(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}return 0}function dy(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;g=f|0;h=b|0;c[h>>2]=7528;if(a[14952]|0){j=c[1162]|0}else{if(a[14960]|0){k=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;k=4952}c[1168]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[1162]=4672;a[14952]=1;j=4672}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;kD(b+8|0,0,24);c[h>>2]=8416;c[b+32>>2]=d;c[b+40>>2]=e;e=c[l>>2]|0;l=e+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3514]|0)!=-1){c[g>>2]=14056;c[g+4>>2]=12;c[g+8>>2]=0;d3(14056,g,96)}g=(c[3515]|0)-1|0;d=c[e+8>>2]|0;do{if((c[e+12>>2]|0)-d>>2>>>0>g>>>0){h=c[d+(g<<2)>>2]|0;if((h|0)==0){break}j=h;k=b+36|0;c[k>>2]=j;m=b+44|0;c[m>>2]=ci[c[(c[h>>2]|0)+24>>2]&255](j)|0;j=c[k>>2]|0;a[b+48|0]=ci[c[(c[j>>2]|0)+28>>2]&255](j)&1;if((c[m>>2]|0)<=8){if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){i=f;return}ce[c[(c[e>>2]|0)+8>>2]&511](e|0);i=f;return}m=b3(8)|0;c[m>>2]=5720;j=m+4|0;if((j|0)!=0){k=kv(50)|0;c[k+4>>2]=37;c[k>>2]=37;h=k+12|0;c[j>>2]=h;c[k+8>>2]=0;kE(h|0,168,38)}bv(m|0,11872,72)}}while(0);f=b3(4)|0;c[f>>2]=5688;bv(f|0,11856,198)}function dz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+16|0;f=e|0;g=c[d>>2]|0;if((c[3514]|0)!=-1){c[f>>2]=14056;c[f+4>>2]=12;c[f+8>>2]=0;d3(14056,f,96)}f=(c[3515]|0)-1|0;d=c[g+8>>2]|0;if((c[g+12>>2]|0)-d>>2>>>0<=f>>>0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}g=c[d+(f<<2)>>2]|0;if((g|0)==0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}h=g;j=b+36|0;c[j>>2]=h;f=b+44|0;c[f>>2]=ci[c[(c[g>>2]|0)+24>>2]&255](h)|0;h=c[j>>2]|0;a[b+48|0]=ci[c[(c[h>>2]|0)+28>>2]&255](h)&1;if((c[f>>2]|0)>8){hM(168)}else{i=e;return}}function dA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+16|0;g=f|0;h=b|0;c[h>>2]=7600;if(a[14952]|0){j=c[1162]|0}else{if(a[14960]|0){k=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;k=4952}c[1168]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[1162]=4672;a[14952]=1;j=4672}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;kD(b+8|0,0,24);c[h>>2]=8088;c[b+32>>2]=d;d=b+36|0;h=c[l>>2]|0;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3516]|0)!=-1){c[g>>2]=14064;c[g+4>>2]=12;c[g+8>>2]=0;d3(14064,g,96)}g=(c[3517]|0)-1|0;j=c[h+8>>2]|0;do{if((c[h+12>>2]|0)-j>>2>>>0>g>>>0){k=c[j+(g<<2)>>2]|0;if((k|0)==0){break}m=k;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){c[d>>2]=m;n=b+40|0;c[n>>2]=e;o=b+44|0;p=k;q=c[p>>2]|0;r=q+28|0;s=c[r>>2]|0;t=ci[s&255](m)|0;u=t&1;a[o]=u;i=f;return}ce[c[(c[h>>2]|0)+8>>2]&511](h|0);c[d>>2]=m;n=b+40|0;c[n>>2]=e;o=b+44|0;p=k;q=c[p>>2]|0;r=q+28|0;s=c[r>>2]|0;t=ci[s&255](m)|0;u=t&1;a[o]=u;i=f;return}}while(0);f=b3(4)|0;c[f>>2]=5688;bv(f|0,11856,198)}function dB(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+16|0;f=e|0;ci[c[(c[b>>2]|0)+24>>2]&255](b);g=c[d>>2]|0;if((c[3516]|0)!=-1){c[f>>2]=14064;c[f+4>>2]=12;c[f+8>>2]=0;d3(14064,f,96)}f=(c[3517]|0)-1|0;d=c[g+8>>2]|0;if((c[g+12>>2]|0)-d>>2>>>0<=f>>>0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}g=c[d+(f<<2)>>2]|0;if((g|0)==0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}else{h=g;c[b+36>>2]=h;a[b+44|0]=ci[c[(c[g>>2]|0)+28>>2]&255](h)&1;i=e;return}}function dC(a){a=a|0;return c[a+4>>2]|0}function dD(a){a=a|0;return c[a+4>>2]|0}function dE(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function dF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function dG(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+1|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;a[g]=d&255;c[m>>2]=l;L1310:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=co[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=1192;break}if((y|0)==3){B=1182;break}if(y>>>0>=2){A=-1;B=1191;break}x=(c[h>>2]|0)-t|0;if((aQ(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=1193;break}if((y|0)!=1){break L1310}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y|0)|0;c[m>>2]=C;v=y;w=C}if((B|0)==1192){i=e;return A|0}else if((B|0)==1193){i=e;return A|0}else if((B|0)==1191){i=e;return A|0}else if((B|0)==1182){if((aQ(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}else{if((aQ(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dH(a){a=a|0;var b=0;c[a>>2]=7600;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);return}function dI(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=7600;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;ky(e);return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);e=a;ky(e);return}function dJ(a){a=a|0;return dM(a,0)|0}function dK(a){a=a|0;return dM(a,1)|0}function dL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}k=d&255;a[h]=k;l=c[b+36>>2]|0;m=f|0;n=co[c[(c[l>>2]|0)+12>>2]&31](l,c[b+40>>2]|0,h,h+1|0,e+24|0,m,f+8|0,g)|0;if((n|0)==3){a[m]=k;c[g>>2]=f+1|0}else if((n|0)==2|(n|0)==1){j=-1;i=e;return j|0}n=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=m>>>0){j=d;o=1217;break}f=b-1|0;c[g>>2]=f;if((bP(a[f]|0|0,c[n>>2]|0)|0)==-1){j=-1;o=1215;break}}if((o|0)==1215){i=e;return j|0}else if((o|0)==1217){i=e;return j|0}return 0}function dM(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[b+44>>2]|0;m=(l|0)>1?l:1;L1357:do{if((m|0)>0){l=b+32|0;n=0;while(1){o=a3(c[l>>2]|0)|0;if((o|0)==-1){p=-1;break}a[g+n|0]=o&255;n=n+1|0;if((n|0)>=(m|0)){break L1357}}i=f;return p|0}}while(0);L1364:do{if((a[b+48|0]&1)==0){n=b+40|0;l=b+36|0;o=g|0;q=h+1|0;r=b+32|0;s=m;while(1){t=c[n>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[l>>2]|0;x=g+s|0;y=co[c[(c[u>>2]|0)+16>>2]&31](u,t,o,x,j,h,q,k)|0;if((y|0)==3){z=1229;break}else if((y|0)==2){p=-1;z=1241;break}else if((y|0)!=1){A=s;break L1364}y=c[n>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){p=-1;z=1237;break}w=a3(c[r>>2]|0)|0;if((w|0)==-1){p=-1;z=1238;break}a[x]=w&255;s=s+1|0}if((z|0)==1229){a[h]=a[o]|0;A=s;break}else if((z|0)==1237){i=f;return p|0}else if((z|0)==1238){i=f;return p|0}else if((z|0)==1241){i=f;return p|0}}else{a[h]=a[g|0]|0;A=m}}while(0);L1378:do{if(!e){m=b+32|0;z=A;while(1){if((z|0)<=0){break L1378}k=z-1|0;if((bP(d[g+k|0]|0|0,c[m>>2]|0)|0)==-1){p=-1;break}else{z=k}}i=f;return p|0}}while(0);p=d[h]|0;i=f;return p|0}function dN(){dj(0);a6(144,14816,u|0);return}function dO(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=5784;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;ky(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;ky(e);return}kz(d);e=a;ky(e);return}function dP(a){a=a|0;var b=0;c[a>>2]=5784;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}kz(a);return}function dQ(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=5720;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;ky(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;ky(e);return}kz(d);e=a;ky(e);return}function dR(a){a=a|0;var b=0;c[a>>2]=5720;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}kz(a);return}function dS(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=5784;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;ky(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;ky(e);return}kz(d);e=a;ky(e);return}function dT(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;cl[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function dU(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;do{if((l|0)!=0){m=d[h]|0;if((m&1|0)==0){n=m>>>1}else{n=c[f+4>>2]|0}if((n|0)==0){o=l}else{d1(f,2056,2);o=c[k>>2]|0}m=c[e+4>>2]|0;cl[c[(c[m>>2]|0)+24>>2]&7](j,m,o);m=j;p=a[m]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}r=p&255;if((r&1|0)==0){s=r>>>1}else{s=c[j+4>>2]|0}d1(f,q,s);if((a[m]&1)==0){break}ky(c[j+8>>2]|0)}}while(0);j=b;c[j>>2]=c[h>>2]|0;c[j+4>>2]=c[h+4>>2]|0;c[j+8>>2]=c[h+8>>2]|0;kD(h|0,0,12);i=g;return}function dV(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;g=f|0;h=b|0;c[h>>2]=7600;if(a[14952]|0){j=c[1162]|0}else{if(a[14960]|0){k=c[c[1164]>>2]|0}else{ik(4952,1);c[1166]=4952;c[1164]=4664;a[14960]=1;k=4952}c[1168]=k;l=k+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;c[1162]=4672;a[14952]=1;j=4672}l=b+4|0;k=c[j>>2]|0;c[l>>2]=k;j=k+4|0;I=c[j>>2]|0,c[j>>2]=I+1,I;kD(b+8|0,0,24);c[h>>2]=8488;c[b+32>>2]=d;c[b+40>>2]=e;e=c[l>>2]|0;l=e+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;if((c[3516]|0)!=-1){c[g>>2]=14064;c[g+4>>2]=12;c[g+8>>2]=0;d3(14064,g,96)}g=(c[3517]|0)-1|0;d=c[e+8>>2]|0;do{if((c[e+12>>2]|0)-d>>2>>>0>g>>>0){h=c[d+(g<<2)>>2]|0;if((h|0)==0){break}j=h;k=b+36|0;c[k>>2]=j;m=b+44|0;c[m>>2]=ci[c[(c[h>>2]|0)+24>>2]&255](j)|0;j=c[k>>2]|0;a[b+48|0]=ci[c[(c[j>>2]|0)+28>>2]&255](j)&1;if((c[m>>2]|0)<=8){if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){i=f;return}ce[c[(c[e>>2]|0)+8>>2]&511](e|0);i=f;return}m=b3(8)|0;c[m>>2]=5720;j=m+4|0;if((j|0)!=0){k=kv(50)|0;c[k+4>>2]=37;c[k>>2]=37;h=k+12|0;c[j>>2]=h;c[k+8>>2]=0;kE(h|0,168,38)}bv(m|0,11872,72)}}while(0);f=b3(4)|0;c[f>>2]=5688;bv(f|0,11856,198)}function dW(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+16|0;f=e|0;g=c[d>>2]|0;if((c[3516]|0)!=-1){c[f>>2]=14064;c[f+4>>2]=12;c[f+8>>2]=0;d3(14064,f,96)}f=(c[3517]|0)-1|0;d=c[g+8>>2]|0;if((c[g+12>>2]|0)-d>>2>>>0<=f>>>0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}g=c[d+(f<<2)>>2]|0;if((g|0)==0){h=b3(4)|0;j=h;c[j>>2]=5688;bv(h|0,11856,198)}h=g;j=b+36|0;c[j>>2]=h;f=b+44|0;c[f>>2]=ci[c[(c[g>>2]|0)+24>>2]&255](h)|0;h=c[j>>2]|0;a[b+48|0]=ci[c[(c[h>>2]|0)+28>>2]&255](h)&1;if((c[f>>2]|0)>8){hM(168)}else{i=e;return}}function dX(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=5720;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;ky(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;ky(e);return}kz(d);e=a;ky(e);return}function dY(a){a=a|0;var b=0;c[a>>2]=5720;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}kz(a);return}function dZ(b){b=b|0;if((a[b]&1)==0){return}ky(c[b+8>>2]|0);return}function d_(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(d|0)){return b|0}e=a[d]|0;if((e&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}g=e&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}d=b;g=b;e=a[g]|0;if((e&1)==0){i=10;j=e}else{e=c[b>>2]|0;i=(e&-2)-1|0;j=e&255}if(i>>>0<h>>>0){e=j&255;if((e&1|0)==0){k=e>>>1}else{k=c[b+4>>2]|0}em(b,i,h-i|0,k,0,k,h,f);return b|0}if((j&1)==0){l=d+1|0}else{l=c[b+8>>2]|0}kF(l|0,f|0,h|0);a[l+h|0]=0;if((a[g]&1)==0){a[g]=h<<1&255;return b|0}else{c[b+4>>2]=h;return b|0}return 0}function d$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=kG(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}em(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}kF(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function d0(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){en(b,h,(d-h|0)+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}kD(l+j|0,e|0,d|0);e=j+d|0;if((a[f]&1)==0){a[f]=e<<1&255}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function d1(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){em(b,h,(e-h|0)+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}kE(k+j|0,d|0,e);d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function d2(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;i=i+32|0;g=d;d=i;i=i+8|0;c[d>>2]=c[g>>2]|0;c[d+4>>2]=c[g+4>>2]|0;g=f|0;h=f+16|0;j=kG(e|0)|0;if((j|0)==-1){d4(0)}if(j>>>0<11){a[h]=j<<1&255;k=h+1|0}else{l=j+16&-16;m=ku(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}kE(k|0,e|0,j);a[k+j|0]=0;dU(g,d,h);j=b|0;c[j>>2]=5720;k=b+4|0;e=g;if((k|0)!=0){if((a[e]&1)==0){n=g+1|0}else{n=c[g+8>>2]|0}m=kG(n|0)|0;l=kv(m+13|0)|0;c[l+4>>2]=m;c[l>>2]=m;m=l+12|0;c[k>>2]=m;c[l+8>>2]=0;kH(m|0,n|0)}if((a[e]&1)!=0){ky(c[g+8>>2]|0)}if((a[h]&1)==0){c[j>>2]=7984;o=b+8|0;p=d;q=o;r=p|0;s=c[r>>2]|0;t=p+4|0;u=c[t>>2]|0;v=q|0;c[v>>2]=s;w=q+4|0;c[w>>2]=u;i=f;return}ky(c[h+8>>2]|0);c[j>>2]=7984;o=b+8|0;p=d;q=o;r=p|0;s=c[r>>2]|0;t=p+4|0;u=c[t>>2]|0;v=q|0;c[v>>2]=s;w=q+4|0;c[w>>2]=u;i=f;return}function d3(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;L1642:do{if((c[a>>2]|0)==1){while(1){aZ(13856,13848);if((c[a>>2]|0)!=1){break L1642}}}}while(0);if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;ce[d&511](b);h;c[a>>2]=-1;i;bG(13856);return}function d4(a){a=a|0;var b=0,d=0,e=0;a=b3(8)|0;c[a>>2]=5784;b=a+4|0;if((b|0)!=0){d=kv(25)|0;c[d+4>>2]=12;c[d>>2]=12;e=d+12|0;c[b>>2]=e;c[d+8>>2]=0;kE(e|0,344,13)}c[a>>2]=5752;bv(a|0,11888,94)}function d5(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;if((d|0)==-1){d4(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0;p=i}else{if(g>>>0>h>>>0){q=ku(k)|0}else{q=ku(k)|0}h=a[f]|0;g=h&1;if(g<<24>>24==0){r=e+1|0}else{r=c[b+8>>2]|0}l=q;m=r;n=g<<24>>24!=0;o=1;p=h}h=p&255;if((h&1|0)==0){s=h>>>1}else{s=c[b+4>>2]|0}kE(l|0,m|0,s+1|0);if(n){ky(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function d6(a,b){a=a|0;b=b|0;return}function d7(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function d8(a){a=a|0;return 0}function d9(a){a=a|0;return 0}function ea(a){a=a|0;return-1|0}function eb(a,b){a=a|0;b=b|0;return-1|0}function ec(a,b){a=a|0;b=b|0;return-1|0}function ed(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function ee(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2]|0;c[d+4>>2]=c[b+4>>2]|0;c[d+8>>2]=c[b+8>>2]|0;c[d+12>>2]=c[b+12>>2]|0;b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function ef(b){b=b|0;if((a[b]&1)==0){return}ky(c[b+8>>2]|0);return}function eg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}ep(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}i=(e|0)==0;L1731:do{if(k-d>>2>>>0<e>>>0){if(i){break}else{l=e}while(1){l=l-1|0;c[k+(l<<2)>>2]=c[d+(l<<2)>>2]|0;if((l|0)==0){break L1731}}}else{if(i){break}else{m=d;n=e;o=k}while(1){j=n-1|0;c[o>>2]=c[m>>2]|0;if((j|0)==0){break L1731}else{m=m+4|0;n=j;o=o+4|0}}}}while(0);c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function eh(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=7600;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;ky(e);return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);e=a;ky(e);return}function ei(a){a=a|0;var b=0;c[a>>2]=7600;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);return}function ej(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1|0;l=a[k]|0}else{k=ci[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((k|0)==-1){g=d;m=1579;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=1581;break}}if((m|0)==1579){return g|0}else if((m|0)==1581){return g|0}return 0}function ek(a){a=a|0;var b=0,e=0;if((ci[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1|0;b=d[a]|0;return b|0}function el(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1|0;a[e]=m}else{if((cg[c[(c[g>>2]|0)+52>>2]&63](b,d[l]|0)|0)==-1){h=k;n=1595;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=1596;break}}if((n|0)==1596){return h|0}else if((n|0)==1595){return h|0}return 0}function em(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){d4(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=ku(o)|0;if((g|0)!=0){kE(e|0,k|0,g)}if((i|0)!=0){kE(e+g|0,j|0,i)}j=f-h|0;if((j|0)!=(g|0)){kE(e+(i+g|0)|0,k+(h+g|0)|0,j-g|0)}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}ky(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function en(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){d4(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=ku(n)|0;if((g|0)!=0){kE(e|0,j|0,g)}m=f-h|0;if((m|0)!=(g|0)){kE(e+(i+g|0)|0,j+(h+g|0)|0,m-g|0)}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}ky(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function eo(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(d>>>0>1073741822){d4(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0;o=h}else{h=j<<2;if(f>>>0>g>>>0){p=ku(h)|0}else{p=ku(h)|0}h=a[e]|0;g=h&1;if(g<<24>>24==0){q=b+4|0}else{q=c[b+8>>2]|0}k=p;l=q;m=g<<24>>24!=0;n=1;o=h}h=o&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;L1866:do{if((h|0)!=0){r=l;o=h;g=k;while(1){q=o-1|0;c[g>>2]=c[r>>2]|0;if((q|0)==0){break L1866}else{r=r+4|0;o=q;g=g+4|0}}}}while(0);if(m){ky(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=k;return}else{a[e]=i<<1&255;return}}function ep(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;if((1073741821-d|0)>>>0<e>>>0){d4(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=ku(o<<2)|0;L1890:do{if((g|0)!=0){n=k;l=g;m=e;while(1){p=l-1|0;c[m>>2]=c[n>>2]|0;if((p|0)==0){break L1890}else{n=n+4|0;l=p;m=m+4|0}}}}while(0);L1894:do{if((i|0)!=0){m=j;l=i;n=e+(g<<2)|0;while(1){p=l-1|0;c[n>>2]=c[m>>2]|0;if((p|0)==0){break L1894}else{m=m+4|0;l=p;n=n+4|0}}}}while(0);j=f-h|0;L1899:do{if((j|0)!=(g|0)){f=k+(h+g<<2)|0;n=j-g|0;l=e+(i+g<<2)|0;while(1){m=n-1|0;c[l>>2]=c[f>>2]|0;if((m|0)==0){break L1899}else{f=f+4|0;n=m;l=l+4|0}}}}while(0);if((d|0)==1){q=b+8|0;c[q>>2]=e;r=o|1;s=b|0;c[s>>2]=r;t=j+i|0;u=b+4|0;c[u>>2]=t;v=e+(t<<2)|0;c[v>>2]=0;return}ky(k);q=b+8|0;c[q>>2]=e;r=o|1;s=b|0;c[s>>2]=r;t=j+i|0;u=b+4|0;c[u>>2]=t;v=e+(t<<2)|0;c[v>>2]=0;return}function eq(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((1073741821-d|0)>>>0<e>>>0){d4(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=ku(n<<2)|0;L1920:do{if((g|0)!=0){m=j;k=g;l=e;while(1){o=k-1|0;c[l>>2]=c[m>>2]|0;if((o|0)==0){break L1920}else{m=m+4|0;k=o;l=l+4|0}}}}while(0);l=f-h|0;L1924:do{if((l|0)!=(g|0)){f=j+(h+g<<2)|0;k=l-g|0;m=e+(i+g<<2)|0;while(1){o=k-1|0;c[m>>2]=c[f>>2]|0;if((o|0)==0){break L1924}else{f=f+4|0;k=o;m=m+4|0}}}}while(0);if((d|0)==1){p=b+8|0;c[p>>2]=e;q=n|1;r=b|0;c[r>>2]=q;return}ky(j);p=b+8|0;c[p>>2]=e;q=n|1;r=b|0;c[r>>2]=q;return}function er(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=6408;b=c[a+40>>2]|0;L1934:do{if((b|0)!=0){d=a+32|0;e=a+36|0;f=b;while(1){f=f-1|0;cl[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);if((f|0)==0){break L1934}}}}while(0);b=c[a+28>>2]|0;f=b+4|0;if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[b>>2]|0)+8>>2]&511](b)}kp(c[a+32>>2]|0);kp(c[a+36>>2]|0);kp(c[a+48>>2]|0);kp(c[a+60>>2]|0);return}function es(a,b){a=a|0;b=b|0;return}function et(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function eu(a){a=a|0;return 0}function ev(a){a=a|0;return 0}function ew(a){a=a|0;return-1|0}function ex(a,b){a=a|0;b=b|0;return-1|0}function ey(a,b){a=a|0;b=b|0;return-1|0}function ez(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function eA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2]|0;c[d+4>>2]=c[b+4>>2]|0;c[d+8>>2]=c[b+8>>2]|0;c[d+12>>2]=c[b+12>>2]|0;b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function eB(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=7528;b=c[a+4>>2]|0;d=b+4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){e=a;ky(e);return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);e=a;ky(e);return}function eC(a){a=a|0;var b=0;c[a>>2]=7528;b=c[a+4>>2]|0;a=b+4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)|0)!=0){return}ce[c[(c[b>>2]|0)+8>>2]&511](b|0);return}function eD(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4|0;k=c[j>>2]|0}else{j=ci[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((j|0)==-1){f=b;l=1742;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=1741;break}}if((l|0)==1742){return f|0}else if((l|0)==1741){return f|0}return 0}function eE(a){a=a|0;var b=0,d=0;if((ci[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4|0;b=c[a>>2]|0;return b|0}function eF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4|0;c[b>>2]=k}else{if((cg[c[(c[e>>2]|0)+52>>2]&63](a,c[j>>2]|0)|0)==-1){f=i;l=1757;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=1756;break}}if((l|0)==1756){return f|0}else if((l|0)==1757){return f|0}return 0}function eG(a){a=a|0;er(a+8|0);ky(a);return}function eH(a){a=a|0;er(a+8|0);return}function eI(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;er(b+(d+8|0)|0);ky(b+d|0);return}function eJ(a){a=a|0;er(a+((c[(c[a>>2]|0)-12>>2]|0)+8|0)|0);return}function eK(a){a=a|0;er(a+8|0);ky(a);return}function eL(a){a=a|0;er(a+8|0);return}function eM(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;er(b+(d+8|0)|0);ky(b+d|0);return}function eN(a){a=a|0;er(a+((c[(c[a>>2]|0)-12>>2]|0)+8|0)|0);return}function eO(a){a=a|0;er(a+4|0);ky(a);return}function eP(a){a=a|0;er(a+4|0);return}function eQ(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;er(b+(d+4|0)|0);ky(b+d|0);return}function eR(a){a=a|0;er(a+((c[(c[a>>2]|0)-12>>2]|0)+4|0)|0);return}function eS(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=b;h=c[(c[g>>2]|0)-12>>2]|0;j=b;if((c[j+(h+24|0)>>2]|0)==0){i=d;return b|0}k=f|0;a[k]=0;c[f+4>>2]=b;do{if((c[j+(h+16|0)>>2]|0)==0){l=c[j+(h+72|0)>>2]|0;if((l|0)!=0){eS(l)}a[k]=1;l=c[j+((c[(c[g>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((ci[c[(c[l>>2]|0)+24>>2]&255](l)|0)!=-1){break}l=c[(c[g>>2]|0)-12>>2]|0;m=j+(l+16|0)|0;n=c[m>>2]|1;c[m>>2]=n;if((n&c[j+(l+20|0)>>2]|0)==0){break}l=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}n=kK(4688,0,32)|0;m=K;c[e>>2]=n&0|1;c[e+4>>2]=m&-1|0;d2(l,e,1592);c[l>>2]=6432;bv(l|0,12432,28);return 0}}while(0);eU(f);i=d;return b|0}function eT(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=b;h=c[(c[g>>2]|0)-12>>2]|0;j=b;if((c[j+(h+24|0)>>2]|0)==0){i=d;return b|0}k=f|0;a[k]=0;c[f+4>>2]=b;do{if((c[j+(h+16|0)>>2]|0)==0){l=c[j+(h+72|0)>>2]|0;if((l|0)!=0){eT(l)}a[k]=1;l=c[j+((c[(c[g>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((ci[c[(c[l>>2]|0)+24>>2]&255](l)|0)!=-1){break}l=c[(c[g>>2]|0)-12>>2]|0;m=j+(l+16|0)|0;n=c[m>>2]|1;c[m>>2]=n;if((n&c[j+(l+20|0)>>2]|0)==0){break}l=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}n=kK(4688,0,32)|0;m=K;c[e>>2]=n&0|1;c[e+4>>2]=m&-1|0;d2(l,e,1592);c[l>>2]=6432;bv(l|0,12432,28);return 0}}while(0);fh(f);i=d;return b|0}function eU(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+8|0;e=d|0;f=b+4|0;b=c[f>>2]|0;g=c[(c[b>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24|0)>>2]|0)==0){i=d;return}if((c[h+(g+16|0)>>2]|0)!=0){i=d;return}if((c[h+(g+4|0)>>2]&8192|0)==0){i=d;return}if(br()|0){i=d;return}g=c[f>>2]|0;h=c[g+((c[(c[g>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((ci[c[(c[h>>2]|0)+24>>2]&255](h)|0)!=-1){i=d;return}h=c[f>>2]|0;f=c[(c[h>>2]|0)-12>>2]|0;g=h;h=g+(f+16|0)|0;b=c[h>>2]|1;c[h>>2]=b;if((b&c[g+(f+20|0)>>2]|0)==0){i=d;return}d=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}f=kK(4688,0,32)|0;g=K;c[e>>2]=f&0|1;c[e+4>>2]=g&-1|0;d2(d,e,1592);c[d>>2]=6432;bv(d|0,12432,28)}function eV(b,d){b=b|0;d=+d;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0;e=i;i=i+64|0;f=e|0;g=e+8|0;h=e+24|0;j=e+40|0;k=e+48|0;l=e+56|0;m=k|0;a[m]=0;c[k+4>>2]=b;n=b;o=c[(c[n>>2]|0)-12>>2]|0;p=b;L2069:do{if((c[p+(o+16|0)>>2]|0)==0){q=c[p+(o+72|0)>>2]|0;if((q|0)!=0){eS(q)}a[m]=1;q=c[p+((c[(c[n>>2]|0)-12>>2]|0)+28|0)>>2]|0;r=q+4|0;I=c[r>>2]|0,c[r>>2]=I+1,I;if((c[3504]|0)!=-1){c[h>>2]=14016;c[h+4>>2]=12;c[h+8>>2]=0;d3(14016,h,96)}s=(c[3505]|0)-1|0;t=c[q+8>>2]|0;do{if((c[q+12>>2]|0)-t>>2>>>0>s>>>0){u=c[t+(s<<2)>>2]|0;if((u|0)==0){break}v=u;if(((I=c[r>>2]|0,c[r>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q)}w=c[(c[n>>2]|0)-12>>2]|0;x=c[p+(w+24|0)>>2]|0;y=p+w|0;z=p+(w+76|0)|0;A=c[z>>2]|0;B=A&255;L2083:do{if((A|0)==-1){C=c[p+(w+28|0)>>2]|0;D=C+4|0;I=c[D>>2]|0,c[D>>2]=I+1,I;if((c[3592]|0)!=-1){c[g>>2]=14368;c[g+4>>2]=12;c[g+8>>2]=0;d3(14368,g,96)}E=(c[3593]|0)-1|0;F=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-F>>2>>>0>E>>>0){G=c[F+(E<<2)>>2]|0;if((G|0)==0){break}H=cg[c[(c[G>>2]|0)+28>>2]&63](G,32)|0;if(((I=c[D>>2]|0,c[D>>2]=I+ -1,I)|0)==0){ce[c[(c[C>>2]|0)+8>>2]&511](C)}c[z>>2]=H<<24>>24;J=H;break L2083}}while(0);C=b3(4)|0;c[C>>2]=5688;bv(C|0,11856,198);return 0}else{J=B}}while(0);B=c[(c[u>>2]|0)+32>>2]|0;c[j>>2]=x;ck[B&15](l,v,j,y,J,d);if((c[l>>2]|0)!=0){break L2069}B=c[(c[n>>2]|0)-12>>2]|0;z=p+(B+16|0)|0;w=c[z>>2]|5;c[z>>2]=w;if((w&c[p+(B+20|0)>>2]|0)==0){break L2069}B=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}w=kK(4688,0,32)|0;z=K;c[f>>2]=w&0|1;c[f+4>>2]=z&-1|0;d2(B,f,1592);c[B>>2]=6432;bv(B|0,12432,28);return 0}}while(0);q=b3(4)|0;c[q>>2]=5688;bv(q|0,11856,198);return 0}}while(0);eU(k);i=e;return b|0}function eW(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+24|0;g=f|0;h=f+8|0;j=f+16|0;k=j|0;a[k]=0;c[j+4>>2]=b;l=b;m=c[(c[l>>2]|0)-12>>2]|0;n=b;do{if((c[n+(m+16|0)>>2]|0)==0){o=c[n+(m+72|0)>>2]|0;if((o|0)!=0){eS(o)}a[k]=1;o=c[(c[l>>2]|0)-12>>2]|0;if((e|0)==0){p=n+(o+16|0)|0;q=c[p>>2]|1;c[p>>2]=q;if((q&c[n+(o+20|0)>>2]|0)==0){break}q=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}p=kK(4688,0,32)|0;r=K;c[g>>2]=p&0|1;c[g+4>>2]=r&-1|0;d2(q,g,1592);c[q>>2]=6432;bv(q|0,12432,28);return 0}q=e;r=c[n+(o+24|0)>>2]|0;o=0;while(1){p=c[q+12>>2]|0;if((p|0)==(c[q+16>>2]|0)){s=ci[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{s=d[p]|0}p=(s|0)==-1?0:q;if((p|0)==0){break}t=p+12|0;u=c[t>>2]|0;v=p+16|0;if((u|0)==(c[v>>2]|0)){w=ci[c[(c[p>>2]|0)+36>>2]&255](p)&255}else{w=a[u]|0}if((r|0)==0){break}u=r+24|0;x=c[u>>2]|0;if((x|0)==(c[r+28>>2]|0)){y=cg[c[(c[r>>2]|0)+52>>2]&63](r,w&255)|0}else{c[u>>2]=x+1|0;a[x]=w;y=w&255}x=(y|0)==-1?0:r;if((x|0)==0){break}u=c[t>>2]|0;if((u|0)==(c[v>>2]|0)){v=c[(c[p>>2]|0)+40>>2]|0;ci[v&255](p)}else{c[t>>2]=u+1|0}q=p;r=x;o=o+1|0}if((o|0)!=0){break}r=c[(c[l>>2]|0)-12>>2]|0;q=n+(r+16|0)|0;x=c[q>>2]|0;p=x|4;u=(c[n+(r+24|0)>>2]|0)==0;c[q>>2]=u?x|5:p;if((c[n+(r+20|0)>>2]&(u&1|p)|0)==0){break}p=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}u=kK(4688,0,32)|0;r=K;c[h>>2]=u&0|1;c[h+4>>2]=r&-1|0;d2(p,h,1592);c[p>>2]=6432;bv(p|0,12432,28);return 0}}while(0);eU(j);i=f;return b|0}function eX(a){a=a|0;return 1808}function eY(a){a=a|0;return}function eZ(a){a=a|0;return}function e_(a){a=a|0;return}function e$(a){a=a|0;return}function e0(a){a=a|0;return}function e1(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L2164:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=1967;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=1965;break}if(l<<24>>24<k<<24>>24){i=1;j=1966;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L2164}else{b=k;h=l}}if((j|0)==1966){return i|0}else if((j|0)==1965){return i|0}else if((j|0)==1967){return i|0}}}while(0);i=(g|0)!=(d|0)&1;return i|0}function e2(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function e3(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L2183:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=1983;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=1984;break}if((l|0)<(k|0)){i=1;j=1982;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L2183}else{a=k;h=l}}if((j|0)==1984){return i|0}else if((j|0)==1982){return i|0}else if((j|0)==1983){return i|0}}}while(0);i=(g|0)!=(d|0)&1;return i|0}function e4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function e5(a){a=a|0;er(a+4|0);ky(a);return}function e6(a){a=a|0;er(a+4|0);return}function e7(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;er(b+(d+4|0)|0);ky(b+d|0);return}function e8(a){a=a|0;er(a+((c[(c[a>>2]|0)-12>>2]|0)+4|0)|0);return}function e9(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=5720;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;ky(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;ky(e);return}kz(d);e=a;ky(e);return}function fa(a){a=a|0;var b=0;c[a>>2]=5720;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}kz(a);return}function fb(a){a=a|0;er(a);ky(a);return}function fc(a){a=a|0;ky(a);return}function fd(a){a=a|0;ky(a);return}function fe(a){a=a|0;ky(a);return}function ff(a){a=a|0;ky(a);return}function fg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=g|0;a[h]=0;c[g+4>>2]=b;j=b;k=c[(c[j>>2]|0)-12>>2]|0;l=b;do{if((c[l+(k+16|0)>>2]|0)==0){m=c[l+(k+72|0)>>2]|0;if((m|0)!=0){eS(m)}a[h]=1;m=c[l+((c[(c[j>>2]|0)-12>>2]|0)+24|0)>>2]|0;n=m;if((m|0)==0){o=n}else{p=m+24|0;q=c[p>>2]|0;if((q|0)==(c[m+28>>2]|0)){r=cg[c[(c[m>>2]|0)+52>>2]&63](n,d&255)|0}else{c[p>>2]=q+1|0;a[q]=d;r=d&255}o=(r|0)==-1?0:n}if((o|0)!=0){break}n=c[(c[j>>2]|0)-12>>2]|0;q=l+(n+16|0)|0;p=c[q>>2]|1;c[q>>2]=p;if((p&c[l+(n+20|0)>>2]|0)==0){break}n=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}p=kK(4688,0,32)|0;q=K;c[f>>2]=p&0|1;c[f+4>>2]=q&-1|0;d2(n,f,1592);c[n>>2]=6432;bv(n|0,12432,28);return 0}}while(0);eU(g);i=e;return b|0}function fh(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+8|0;e=d|0;f=b+4|0;b=c[f>>2]|0;g=c[(c[b>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24|0)>>2]|0)==0){i=d;return}if((c[h+(g+16|0)>>2]|0)!=0){i=d;return}if((c[h+(g+4|0)>>2]&8192|0)==0){i=d;return}if(br()|0){i=d;return}g=c[f>>2]|0;h=c[g+((c[(c[g>>2]|0)-12>>2]|0)+24|0)>>2]|0;if((ci[c[(c[h>>2]|0)+24>>2]&255](h)|0)!=-1){i=d;return}h=c[f>>2]|0;f=c[(c[h>>2]|0)-12>>2]|0;g=h;h=g+(f+16|0)|0;b=c[h>>2]|1;c[h>>2]=b;if((b&c[g+(f+20|0)>>2]|0)==0){i=d;return}d=b3(16)|0;if(!(a[14976]|0)){c[1172]=7296;a[14976]=1}f=kK(4688,0,32)|0;g=K;c[e>>2]=f&0|1;c[e+4>>2]=g&-1|0;d2(d,e,1592);c[d>>2]=6432;bv(d|0,12432,28)}function fi(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e|0)==1){d=ku(48)|0;c[b+8>>2]=d;c[b>>2]=49;c[b+4>>2]=35;kE(d|0,2152,35);a[d+35|0]=0;return}d=bM(e|0)|0;e=kG(d|0)|0;if((e|0)==-1){d4(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0}else{g=e+16&-16;h=ku(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=e;f=h}kE(f|0,d|0,e);a[f+e|0]=0;return}function fj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;if((g|0)==-1){d4(0)}if(g>>>0<11){a[b]=g<<1&255;h=b+1|0}else{i=g+16&-16;j=ku(i)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=g;h=j}if((e|0)==(f|0)){k=h;a[k]=0;return}j=f+(-d|0)|0;d=h;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=h+j|0;a[k]=0;return}function fk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741822){d4(0)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=ku(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=((f-4|0)+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2]|0;e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function fl(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;i=i+96|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+88|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;t=c[(c[d>>2]|0)+16>>2]|0;u=e|0;c[p>>2]=c[u>>2]|0;c[q>>2]=c[f>>2]|0;cd[t&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[u>>2]=q;u=c[n>>2]|0;if((u|0)==1){a[j]=1}else if((u|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}q=g+28|0;g=c[q>>2]|0;u=g+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;if((c[3592]|0)!=-1){c[m>>2]=14368;c[m+4>>2]=12;c[m+8>>2]=0;d3(14368,m,96)}m=(c[3593]|0)-1|0;n=c[g+8>>2]|0;do{if((c[g+12>>2]|0)-n>>2>>>0>m>>>0){o=c[n+(m<<2)>>2]|0;if((o|0)==0){break}p=o;if(((I=c[u>>2]|0,c[u>>2]=I+ -1,I)|0)==0){ce[c[(c[g>>2]|0)+8>>2]&511](g)}o=c[q>>2]|0;d=o+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;if((c[3496]|0)!=-1){c[l>>2]=13984;c[l+4>>2]=12;c[l+8>>2]=0;d3(13984,l,96)}t=(c[3497]|0)-1|0;v=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-v>>2>>>0>t>>>0){w=c[v+(t<<2)>>2]|0;if((w|0)==0){break}x=w;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)==0){ce[c[(c[o>>2]|0)+8>>2]&511](o)}y=r|0;z=w;cf[c[(c[z>>2]|0)+24>>2]&127](y,x);cf[c[(c[z>>2]|0)+28>>2]&127](r+12|0,x);c[s>>2]=c[f>>2]|0;a[j]=(fm(e,s,y,r+24|0,p,h,1)|0)==(y|0)&1;c[b>>2]=c[e>>2]|0;if((a[r+12|0]&1)!=0){ky(c[r+20>>2]|0)}if((a[r]&1)==0){i=k;return}ky(c[r+8>>2]|0);i=k;return}}while(0);p=b3(4)|0;c[p>>2]=5688;bv(p|0,11856,198)}}while(0);k=b3(4)|0;c[k>>2]=5688;bv(k|0,11856,198)}function fm(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2]|0;m=(g-f|0)/12&-1;n=l|0;do{if(m>>>0>100){o=ko(m)|0;if((o|0)!=0){p=o;q=o;break}o=b3(4)|0;c[o>>2]=5656;bv(o|0,11840,32);return 0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);L2364:do{if(n){r=m;s=0}else{o=m;t=0;u=p;v=f;while(1){w=d[v]|0;if((w&1|0)==0){x=w>>>1}else{x=c[v+4>>2]|0}if((x|0)==0){a[u]=2;y=t+1|0;z=o-1|0}else{a[u]=1;y=t;z=o}w=v+12|0;if((w|0)==(g|0)){r=z;s=y;break L2364}else{o=z;t=y;u=u+1|0;v=w}}}}while(0);y=b|0;b=e|0;e=h;z=0;x=s;s=r;while(1){r=c[y>>2]|0;do{if((r|0)==0){A=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){A=r;break}if((ci[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[y>>2]=0;A=0;break}else{A=c[y>>2]|0;break}}}while(0);r=(A|0)==0;m=c[b>>2]|0;if((m|0)==0){B=A;C=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((ci[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){D=m;break}c[b>>2]=0;D=0}else{D=m}}while(0);B=c[y>>2]|0;C=D}E=(C|0)==0;if(!((r^E)&(s|0)!=0)){break}m=c[B+12>>2]|0;if((m|0)==(c[B+16>>2]|0)){F=ci[c[(c[B>>2]|0)+36>>2]&255](B)&255}else{F=a[m]|0}if(k){G=F}else{G=cg[c[(c[e>>2]|0)+12>>2]&63](h,F)|0}L2403:do{if(n){H=x;I=s}else{m=z+1|0;L2405:do{if(k){v=s;u=x;t=p;o=0;w=f;while(1){do{if((a[t]|0)==1){J=w;if((a[J]&1)==0){K=w+1|0}else{K=c[w+8>>2]|0}if(G<<24>>24!=(a[K+z|0]|0)){a[t]=0;L=o;M=u;N=v-1|0;break}O=d[J]|0;if((O&1|0)==0){P=O>>>1}else{P=c[w+4>>2]|0}if((P|0)!=(m|0)){L=1;M=u;N=v;break}a[t]=2;L=1;M=u+1|0;N=v-1|0}else{L=o;M=u;N=v}}while(0);O=w+12|0;if((O|0)==(g|0)){Q=N;R=M;S=L;break L2405}v=N;u=M;t=t+1|0;o=L;w=O}}else{w=s;o=x;t=p;u=0;v=f;while(1){do{if((a[t]|0)==1){O=v;if((a[O]&1)==0){T=v+1|0}else{T=c[v+8>>2]|0}if(G<<24>>24!=cg[c[(c[e>>2]|0)+12>>2]&63](h,a[T+z|0]|0)<<24>>24){a[t]=0;U=u;V=o;W=w-1|0;break}J=d[O]|0;if((J&1|0)==0){X=J>>>1}else{X=c[v+4>>2]|0}if((X|0)!=(m|0)){U=1;V=o;W=w;break}a[t]=2;U=1;V=o+1|0;W=w-1|0}else{U=u;V=o;W=w}}while(0);J=v+12|0;if((J|0)==(g|0)){Q=W;R=V;S=U;break L2405}w=W;o=V;t=t+1|0;u=U;v=J}}}while(0);if(!S){H=R;I=Q;break}m=c[y>>2]|0;v=m+12|0;u=c[v>>2]|0;if((u|0)==(c[m+16>>2]|0)){t=c[(c[m>>2]|0)+40>>2]|0;ci[t&255](m)}else{c[v>>2]=u+1|0}if((R+Q|0)>>>0<2|n){H=R;I=Q;break}u=z+1|0;v=R;m=p;t=f;while(1){do{if((a[m]|0)==2){o=d[t]|0;if((o&1|0)==0){Y=o>>>1}else{Y=c[t+4>>2]|0}if((Y|0)==(u|0)){Z=v;break}a[m]=0;Z=v-1|0}else{Z=v}}while(0);o=t+12|0;if((o|0)==(g|0)){H=Z;I=Q;break L2403}else{v=Z;m=m+1|0;t=o}}}}while(0);z=z+1|0;x=H;s=I}do{if((B|0)==0){_=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){_=B;break}if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[y>>2]=0;_=0;break}else{_=c[y>>2]|0;break}}}while(0);y=(_|0)==0;do{if(E){$=2239}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(y){break}else{$=2241;break}}if((ci[c[(c[C>>2]|0)+36>>2]&255](C)|0)==-1){c[b>>2]=0;$=2239;break}else{if(y^(C|0)==0){break}else{$=2241;break}}}}while(0);if(($|0)==2239){if(y){$=2241}}if(($|0)==2241){c[j>>2]=c[j>>2]|2}L2484:do{if(n){$=2246}else{y=f;C=p;while(1){if((a[C]|0)==2){aa=y;break L2484}b=y+12|0;if((b|0)==(g|0)){$=2246;break L2484}y=b;C=C+1|0}}}while(0);if(($|0)==2246){c[j>>2]=c[j>>2]|4;aa=g}if((q|0)==0){i=l;return aa|0}kp(q);i=l;return aa|0}function fn(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1|0;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4|0;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[i+14824|0]|0;s=c[g>>2]|0;c[g>>2]=s+1|0;a[s]=m;q=0;return q|0}else if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}}while(0);if((n-f|0)<39){f=a[i+14824|0]|0;c[g>>2]=n+1|0;a[n]=f}c[h>>2]=(c[h>>2]|0)+1|0;q=0;return q|0}function fo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}while(1){k=c[m>>2]|0;c[m>>2]=c[n>>2]|0;c[n>>2]=k;k=m+4|0;j=n-4|0;if(k>>>0<j>>>0){m=k;n=j}else{break}}l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L2564:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}j=(e-h|0)>1?h+1|0:h;k=n+4|0;q=a[j]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(k>>>0<b>>>0){h=j;n=k;m=r;i=s}else{t=r;u=s;break L2564}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}function fp(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l|0;fr(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2587:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((ci[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2333}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2587}}if((ci[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2333;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2587}}}}while(0);if((y|0)==2333){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=ci[c[(c[v>>2]|0)+36>>2]&255](v)&255}else{F=a[D]|0}if((fn(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;ci[E&255](v);m=v;continue}else{c[x>>2]=D+1|0;m=v;continue}}m=n;A=d[m]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4|0;c[A>>2]=z}}while(0);c[k>>2]=fq(h,c[p>>2]|0,j,u)|0;fo(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((ci[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2632:do{if(C){y=2365}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2365;break L2632}}while(0);if(!(l^(B|0)==0)){y=2367}}}while(0);if((y|0)==2365){if(l){y=2367}}if((y|0)==2367){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fq(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[bL()>>2]|0;c[bL()>>2]=0;if(a[14968]|0){l=c[1170]|0}else{m=aX(1,1712,0)|0;c[1170]=m;a[14968]=1;l=m}m=bY(b|0,h|0,f|0,l|0)|0;l=K;f=c[bL()>>2]|0;if((f|0)==0){c[bL()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((f|0)==34|((l|0)<(d|0)|(l|0)==(d|0)&m>>>0<-2147483648>>>0)|((l|0)>(h|0)|(l|0)==(h|0)&m>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(l|0)>(e|0)|(l|0)==(e|0)&m>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function fr(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+32|0;h=g|0;j=g+16|0;k=c[d+28>>2]|0;d=k+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;if((c[3592]|0)!=-1){c[j>>2]=14368;c[j+4>>2]=12;c[j+8>>2]=0;d3(14368,j,96)}j=(c[3593]|0)-1|0;l=k+12|0;m=k+8|0;n=c[m>>2]|0;do{if((c[l>>2]|0)-n>>2>>>0>j>>>0){o=c[n+(j<<2)>>2]|0;if((o|0)==0){break}p=o;q=c[(c[o>>2]|0)+32>>2]|0;cs[q&15](p,14824,14850,e);if((c[3496]|0)!=-1){c[h>>2]=13984;c[h+4>>2]=12;c[h+8>>2]=0;d3(13984,h,96)}p=(c[3497]|0)-1|0;q=c[m>>2]|0;do{if((c[l>>2]|0)-q>>2>>>0>p>>>0){o=c[q+(p<<2)>>2]|0;if((o|0)==0){break}r=o;a[f]=ci[c[(c[o>>2]|0)+16>>2]&255](r)|0;cf[c[(c[o>>2]|0)+20>>2]&127](b,r);if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){i=g;return}ce[c[(c[k>>2]|0)+8>>2]&511](k);i=g;return}}while(0);p=b3(4)|0;c[p>>2]=5688;bv(p|0,11856,198)}}while(0);g=b3(4)|0;c[g>>2]=5688;bv(g|0,11856,198)}function fs(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==64){u=8}else if((t|0)==0){u=0}else{u=10}t=l|0;fr(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2699:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((ci[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2429}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2699}}if((ci[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2429;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2699}}}}while(0);if((y|0)==2429){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=ci[c[(c[v>>2]|0)+36>>2]&255](v)&255}else{F=a[D]|0}if((fn(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;ci[E&255](v);m=v;continue}else{c[x>>2]=D+1|0;m=v;continue}}m=n;A=d[m]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4|0;c[A>>2]=z}}while(0);s=ft(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;fo(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((ci[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2744:do{if(C){y=2461}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2461;break L2744}}while(0);if(!(l^(B|0)==0)){y=2463}}}while(0);if((y|0)==2461){if(l){y=2463}}if((y|0)==2463){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function ft(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}l=c[bL()>>2]|0;c[bL()>>2]=0;if(a[14968]|0){m=c[1170]|0}else{n=aX(1,1712,0)|0;c[1170]=n;a[14968]=1;m=n}n=bY(b|0,h|0,f|0,m|0)|0;m=K;f=c[bL()>>2]|0;if((f|0)==0){c[bL()>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}if((f|0)!=34){j=m;k=n;i=g;return(K=j,k)|0}c[e>>2]=4;e=0;f=(m|0)>(e|0)|(m|0)==(e|0)&n>>>0>0>>>0;j=f?2147483647:-2147483648;k=f?-1:0;i=g;return(K=j,k)|0}function fu(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;f=i;i=i+280|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2]|0;m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2]|0;m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=f+96|0;r=f+104|0;s=f+264|0;t=f+272|0;u=c[j+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==8){v=16}else if((u|0)==64){v=8}else{v=10}u=m|0;fr(o,j,u,n);j=p|0;kD(j|0,0,40);c[q>>2]=j;p=r|0;c[s>>2]=p;c[t>>2]=0;m=g|0;g=h|0;h=a[n]|0;n=c[m>>2]|0;L2786:while(1){do{if((n|0)==0){w=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){w=n;break}if((ci[c[(c[n>>2]|0)+36>>2]&255](n)|0)!=-1){w=n;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;y=c[g>>2]|0;do{if((y|0)==0){z=2501}else{if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(x){A=y;B=0;break}else{C=y;D=0;break L2786}}if((ci[c[(c[y>>2]|0)+36>>2]&255](y)|0)==-1){c[g>>2]=0;z=2501;break}else{E=(y|0)==0;if(x^E){A=y;B=E;break}else{C=y;D=E;break L2786}}}}while(0);if((z|0)==2501){z=0;if(x){C=0;D=1;break}else{A=0;B=1}}y=w+12|0;E=c[y>>2]|0;F=w+16|0;if((E|0)==(c[F>>2]|0)){G=ci[c[(c[w>>2]|0)+36>>2]&255](w)&255}else{G=a[E]|0}if((fn(G,v,j,q,t,h,o,p,s,u)|0)!=0){C=A;D=B;break}E=c[y>>2]|0;if((E|0)==(c[F>>2]|0)){F=c[(c[w>>2]|0)+40>>2]|0;ci[F&255](w);n=w;continue}else{c[y>>2]=E+1|0;n=w;continue}}n=o;B=d[n]|0;if((B&1|0)==0){H=B>>>1}else{H=c[o+4>>2]|0}do{if((H|0)!=0){B=c[s>>2]|0;if((B-r|0)>=160){break}A=c[t>>2]|0;c[s>>2]=B+4|0;c[B>>2]=A}}while(0);b[l>>1]=fv(j,c[q>>2]|0,k,v)|0;fo(o,p,c[s>>2]|0,k);do{if(x){I=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){I=w;break}if((ci[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){I=w;break}c[m>>2]=0;I=0}}while(0);m=(I|0)==0;L2831:do{if(D){z=2533}else{do{if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((ci[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){break}c[g>>2]=0;z=2533;break L2831}}while(0);if(!(m^(C|0)==0)){z=2535}}}while(0);if((z|0)==2533){if(m){z=2535}}if((z|0)==2535){c[k>>2]=c[k>>2]|2}c[e>>2]=I;if((a[n]&1)==0){i=f;return}ky(c[o+8>>2]|0);i=f;return}function fv(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[bL()>>2]|0;c[bL()>>2]=0;if(a[14968]|0){l=c[1170]|0}else{m=aX(1,1712,0)|0;c[1170]=m;a[14968]=1;l=m}m=aN(b|0,h|0,f|0,l|0)|0;l=K;f=c[bL()>>2]|0;if((f|0)==0){c[bL()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m&65535;i=g;return j|0}return 0}function fw(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l|0;fr(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2878:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((ci[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2577}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2878}}if((ci[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2577;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2878}}}}while(0);if((y|0)==2577){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=ci[c[(c[v>>2]|0)+36>>2]&255](v)&255}else{F=a[D]|0}if((fn(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;ci[E&255](v);m=v;continue}else{c[x>>2]=D+1|0;m=v;continue}}m=n;A=d[m]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4|0;c[A>>2]=z}}while(0);c[k>>2]=fx(h,c[p>>2]|0,j,u)|0;fo(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((ci[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2923:do{if(C){y=2609}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2609;break L2923}}while(0);if(!(l^(B|0)==0)){y=2611}}}while(0);if((y|0)==2609){if(l){y=2611}}if((y|0)==2611){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fx(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[bL()>>2]|0;c[bL()>>2]=0;if(a[14968]|0){l=c[1170]|0}else{m=aX(1,1712,0)|0;c[1170]=m;a[14968]=1;l=m}m=aN(b|0,h|0,f|0,l|0)|0;l=K;f=c[bL()>>2]|0;if((f|0)==0){c[bL()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function fy(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l|0;fr(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2970:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((ci[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2653}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2970}}if((ci[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2653;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2970}}}}while(0);if((y|0)==2653){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=ci[c[(c[v>>2]|0)+36>>2]&255](v)&255}else{F=a[D]|0}if((fn(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;ci[E&255](v);m=v;continue}else{c[x>>2]=D+1|0;m=v;continue}}m=n;A=d[m]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4|0;c[A>>2]=z}}while(0);c[k>>2]=fz(h,c[p>>2]|0,j,u)|0;fo(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((ci[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L3015:do{if(C){y=2685}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2685;break L3015}}while(0);if(!(l^(B|0)==0)){y=2687}}}while(0);if((y|0)==2685){if(l){y=2687}}if((y|0)==2687){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fz(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[bL()>>2]|0;c[bL()>>2]=0;if(a[14968]|0){l=c[1170]|0}else{m=aX(1,1712,0)|0;c[1170]=m;a[14968]=1;l=m}m=aN(b|0,h|0,f|0,l|0)|0;l=K;f=c[bL()>>2]|0;if((f|0)==0){c[bL()>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((f|0)==34|(l>>>0>d>>>0|l>>>0==d>>>0&m>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function fA(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l|0;fr(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L3062:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((ci[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2729}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L3062}}if((ci[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2729;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L3062}}}}while(0);if((y|0)==2729){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=ci[c[(c[v>>2]|0)+36>>2]&255](v)&255}else{F=a[D]|0}if((fn(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;ci[E&255](v);m=v;continue}else{c[x>>2]=D+1|0;m=v;continue}}m=n;A=d[m]|0;if((A&1|0)==0){G=A>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){A=c[r>>2]|0;if((A-q|0)>=160){break}z=c[s>>2]|0;c[r>>2]=A+4|0;c[A>>2]=z}}while(0);s=fB(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;fo(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((ci[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L3107:do{if(C){y=2761}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2761;break L3107}}while(0);if(!(l^(B|0)==0)){y=2763}}}while(0);if((y|0)==2761){if(l){y=2763}}if((y|0)==2763){c[j>>2]=c[j>>2]|2}c[b>>2]=H;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fB(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[bL()>>2]|0;c[bL()>>2]=0;if(a[14968]|0){m=c[1170]|0}else{n=aX(1,1712,0)|0;c[1170]=n;a[14968]=1;m=n}n=aN(b|0,h|0,f|0,m|0)|0;o=K;p=c[bL()>>2]|0;if((p|0)==0){c[bL()>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((p|0)!=34){j=o;k=n;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(K=j,k)|0}function fC(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0.0,M=0.0,N=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2]|0;m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;fD(p,j,w,n,o);j=e+72|0;kD(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L3143:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((ci[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2795}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){D=B;E=0;break}else{F=B;G=0;break L3143}}if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2795;break}else{H=(B|0)==0;if(A^H){D=B;E=H;break}else{F=B;G=H;break L3143}}}}while(0);if((C|0)==2795){C=0;if(A){F=0;G=1;break}else{D=0;E=1}}B=z+12|0;H=c[B>>2]|0;I=z+16|0;if((H|0)==(c[I>>2]|0)){J=ci[c[(c[z>>2]|0)+36>>2]&255](z)&255}else{J=a[H]|0}if((fE(J,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){F=D;G=E;break}H=c[B>>2]|0;if((H|0)==(c[I>>2]|0)){I=c[(c[z>>2]|0)+40>>2]|0;ci[I&255](z);o=z;continue}else{c[B>>2]=H+1|0;o=z;continue}}o=p;E=d[o]|0;if((E&1|0)==0){K=E>>>1}else{K=c[p+4>>2]|0}do{if((K|0)!=0){if((a[u]&1)==0){break}E=c[s>>2]|0;if((E-r|0)>=160){break}D=c[t>>2]|0;c[s>>2]=E+4|0;c[E>>2]=D}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;L=0.0}else{if(!(a[14968]|0)){c[1170]=aX(1,1712,0)|0;a[14968]=1}M=+kB(j,m);if((c[m>>2]|0)==(t|0)){L=M;break}else{c[k>>2]=4;L=0.0;break}}}while(0);g[l>>2]=L;fo(p,x,c[s>>2]|0,k);do{if(A){N=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){N=z;break}if((ci[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){N=z;break}c[y>>2]=0;N=0}}while(0);y=(N|0)==0;L3199:do{if(G){C=2835}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((ci[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2835;break L3199}}while(0);if(!(y^(F|0)==0)){C=2837}}}while(0);if((C|0)==2835){if(y){C=2837}}if((C|0)==2837){c[k>>2]=c[k>>2]|2}c[b>>2]=N;if((a[o]&1)==0){i=e;return}ky(c[p+8>>2]|0);i=e;return}function fD(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;i=i+32|0;j=h|0;k=h+16|0;l=c[d+28>>2]|0;d=l+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;if((c[3592]|0)!=-1){c[k>>2]=14368;c[k+4>>2]=12;c[k+8>>2]=0;d3(14368,k,96)}k=(c[3593]|0)-1|0;m=l+12|0;n=l+8|0;o=c[n>>2]|0;do{if((c[m>>2]|0)-o>>2>>>0>k>>>0){p=c[o+(k<<2)>>2]|0;if((p|0)==0){break}q=p;r=c[(c[p>>2]|0)+32>>2]|0;cs[r&15](q,14824,14856,e);if((c[3496]|0)!=-1){c[j>>2]=13984;c[j+4>>2]=12;c[j+8>>2]=0;d3(13984,j,96)}q=(c[3497]|0)-1|0;r=c[n>>2]|0;do{if((c[m>>2]|0)-r>>2>>>0>q>>>0){p=c[r+(q<<2)>>2]|0;if((p|0)==0){break}s=p;t=p;a[f]=ci[c[(c[t>>2]|0)+12>>2]&255](s)|0;a[g]=ci[c[(c[t>>2]|0)+16>>2]&255](s)|0;cf[c[(c[p>>2]|0)+20>>2]&127](b,s);if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)!=0){i=h;return}ce[c[(c[l>>2]|0)+8>>2]&511](l);i=h;return}}while(0);q=b3(4)|0;c[q>>2]=5688;bv(q|0,11856,198)}}while(0);h=b3(4)|0;c[h>>2]=5688;bv(h|0,11856,198)}function fE(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1|0;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4|0;c[s>>2]=i;r=0;return r|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4|0;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+32|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((a[j]|0)==b<<24>>24){u=j;break}else{j=j+1|0}}j=u-o|0;if((j|0)>31){r=-1;return r|0}o=a[j+14824|0]|0;do{if((j|0)==22|(j|0)==23){a[f]=80}else if((j|0)==25|(j|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1|0;a[p]=o;r=0;return r|0}else{u=a[f]|0;if((o&95|0)!=(u<<24>>24|0)){break}a[f]=u|-128;if((a[e]&1)==0){break}a[e]=0;u=d[k]|0;if((u&1|0)==0){v=u>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}u=c[m>>2]|0;if((u-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=u+4|0;c[u>>2]=b}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1|0;a[m]=o}if((j|0)>21){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1|0;r=0;return r|0}function fF(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0.0,M=0.0,N=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2]|0;m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;fD(p,j,w,n,o);j=e+72|0;kD(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L3309:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((ci[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2931}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){D=B;E=0;break}else{F=B;G=0;break L3309}}if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2931;break}else{H=(B|0)==0;if(A^H){D=B;E=H;break}else{F=B;G=H;break L3309}}}}while(0);if((C|0)==2931){C=0;if(A){F=0;G=1;break}else{D=0;E=1}}B=z+12|0;H=c[B>>2]|0;I=z+16|0;if((H|0)==(c[I>>2]|0)){J=ci[c[(c[z>>2]|0)+36>>2]&255](z)&255}else{J=a[H]|0}if((fE(J,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){F=D;G=E;break}H=c[B>>2]|0;if((H|0)==(c[I>>2]|0)){I=c[(c[z>>2]|0)+40>>2]|0;ci[I&255](z);o=z;continue}else{c[B>>2]=H+1|0;o=z;continue}}o=p;E=d[o]|0;if((E&1|0)==0){K=E>>>1}else{K=c[p+4>>2]|0}do{if((K|0)!=0){if((a[u]&1)==0){break}E=c[s>>2]|0;if((E-r|0)>=160){break}D=c[t>>2]|0;c[s>>2]=E+4|0;c[E>>2]=D}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;L=0.0}else{if(!(a[14968]|0)){c[1170]=aX(1,1712,0)|0;a[14968]=1}M=+kB(j,m);if((c[m>>2]|0)==(t|0)){L=M;break}c[k>>2]=4;L=0.0}}while(0);h[l>>3]=L;fo(p,x,c[s>>2]|0,k);do{if(A){N=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){N=z;break}if((ci[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){N=z;break}c[y>>2]=0;N=0}}while(0);y=(N|0)==0;L3363:do{if(G){C=2970}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((ci[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=2970;break L3363}}while(0);if(!(y^(F|0)==0)){C=2972}}}while(0);if((C|0)==2970){if(y){C=2972}}if((C|0)==2972){c[k>>2]=c[k>>2]|2}c[b>>2]=N;if((a[o]&1)==0){i=e;return}ky(c[p+8>>2]|0);i=e;return}function fG(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0.0,M=0.0,N=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2]|0;m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;fD(p,j,w,n,o);j=e+72|0;kD(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L3380:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((ci[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2990}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){D=B;E=0;break}else{F=B;G=0;break L3380}}if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2990;break}else{H=(B|0)==0;if(A^H){D=B;E=H;break}else{F=B;G=H;break L3380}}}}while(0);if((C|0)==2990){C=0;if(A){F=0;G=1;break}else{D=0;E=1}}B=z+12|0;H=c[B>>2]|0;I=z+16|0;if((H|0)==(c[I>>2]|0)){J=ci[c[(c[z>>2]|0)+36>>2]&255](z)&255}else{J=a[H]|0}if((fE(J,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){F=D;G=E;break}H=c[B>>2]|0;if((H|0)==(c[I>>2]|0)){I=c[(c[z>>2]|0)+40>>2]|0;ci[I&255](z);o=z;continue}else{c[B>>2]=H+1|0;o=z;continue}}o=p;E=d[o]|0;if((E&1|0)==0){K=E>>>1}else{K=c[p+4>>2]|0}do{if((K|0)!=0){if((a[u]&1)==0){break}E=c[s>>2]|0;if((E-r|0)>=160){break}D=c[t>>2]|0;c[s>>2]=E+4|0;c[E>>2]=D}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;L=0.0}else{if(!(a[14968]|0)){c[1170]=aX(1,1712,0)|0;a[14968]=1}M=+kB(j,m);if((c[m>>2]|0)==(t|0)){L=M;break}c[k>>2]=4;L=0.0}}while(0);h[l>>3]=L;fo(p,x,c[s>>2]|0,k);do{if(A){N=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){N=z;break}if((ci[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){N=z;break}c[y>>2]=0;N=0}}while(0);y=(N|0)==0;L3434:do{if(G){C=3029}else{do{if((c[F+12>>2]|0)==(c[F+16>>2]|0)){if((ci[c[(c[F>>2]|0)+36>>2]&255](F)|0)!=-1){break}c[f>>2]=0;C=3029;break L3434}}while(0);if(!(y^(F|0)==0)){C=3031}}}while(0);if((C|0)==3029){if(y){C=3031}}if((C|0)==3031){c[k>>2]=c[k>>2]|2}c[b>>2]=N;if((a[o]&1)==0){i=e;return}ky(c[p+8>>2]|0);i=e;return}function fH(a){a=a|0;return}function fI(a){a=a|0;ky(a);return}function fJ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;d=i;i=i+64|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2]|0;k=d|0;l=d+16|0;m=d+48|0;n=m;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;kD(n|0,0,12);t=c[g+28>>2]|0;g=t+4|0;I=c[g>>2]|0,c[g>>2]=I+1,I;if((c[3592]|0)!=-1){c[k>>2]=14368;c[k+4>>2]=12;c[k+8>>2]=0;d3(14368,k,96)}k=(c[3593]|0)-1|0;u=c[t+8>>2]|0;do{if((c[t+12>>2]|0)-u>>2>>>0>k>>>0){v=c[u+(k<<2)>>2]|0;if((v|0)==0){break}w=v;x=l|0;y=c[(c[v>>2]|0)+32>>2]|0;cs[y&15](w,14824,14850,x);if(((I=c[g>>2]|0,c[g>>2]=I+ -1,I)|0)==0){ce[c[(c[t>>2]|0)+8>>2]&511](t)}w=o|0;kD(w|0,0,40);c[p>>2]=w;y=q|0;c[r>>2]=y;c[s>>2]=0;v=e|0;z=f|0;A=c[v>>2]|0;L13:while(1){do{if((A|0)==0){C=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){C=A;break}if((ci[c[(c[A>>2]|0)+36>>2]&255](A)|0)!=-1){C=A;break}c[v>>2]=0;C=0}}while(0);D=(C|0)==0;E=c[z>>2]|0;do{if((E|0)==0){F=24}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(D){G=E;H=0;break}else{J=E;K=0;break L13}}if((ci[c[(c[E>>2]|0)+36>>2]&255](E)|0)==-1){c[z>>2]=0;F=24;break}else{L=(E|0)==0;if(D^L){G=E;H=L;break}else{J=E;K=L;break L13}}}}while(0);if((F|0)==24){F=0;if(D){J=0;K=1;break}else{G=0;H=1}}E=C+12|0;L=c[E>>2]|0;M=C+16|0;if((L|0)==(c[M>>2]|0)){N=ci[c[(c[C>>2]|0)+36>>2]&255](C)&255}else{N=a[L]|0}if((fn(N,16,w,p,s,0,m,y,r,x)|0)!=0){J=G;K=H;break}L=c[E>>2]|0;if((L|0)==(c[M>>2]|0)){M=c[(c[C>>2]|0)+40>>2]|0;ci[M&255](C);A=C;continue}else{c[E>>2]=L+1|0;A=C;continue}}a[o+39|0]=0;if(a[14968]|0){O=c[1170]|0}else{A=aX(1,1712,0)|0;c[1170]=A;a[14968]=1;O=A}if((fK(w,O,1584,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}do{if(D){P=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){P=C;break}if((ci[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){P=C;break}c[v>>2]=0;P=0}}while(0);v=(P|0)==0;L58:do{if(K){F=56}else{do{if((c[J+12>>2]|0)==(c[J+16>>2]|0)){if((ci[c[(c[J>>2]|0)+36>>2]&255](J)|0)!=-1){break}c[z>>2]=0;F=56;break L58}}while(0);if(!(v^(J|0)==0)){F=58}}}while(0);if((F|0)==56){if(v){F=58}}if((F|0)==58){c[h>>2]=c[h>>2]|2}c[b>>2]=P;if((a[n]&1)==0){i=d;return}ky(c[m+8>>2]|0);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function fK(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bR(b|0)|0;b=a1(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bR(h|0);i=f;return b|0}function fL(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;i=i+96|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+88|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;t=c[(c[d>>2]|0)+16>>2]|0;u=e|0;c[p>>2]=c[u>>2]|0;c[q>>2]=c[f>>2]|0;cd[t&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[u>>2]=q;u=c[n>>2]|0;if((u|0)==0){a[j]=0}else if((u|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}q=g+28|0;g=c[q>>2]|0;u=g+4|0;I=c[u>>2]|0,c[u>>2]=I+1,I;if((c[3590]|0)!=-1){c[m>>2]=14360;c[m+4>>2]=12;c[m+8>>2]=0;d3(14360,m,96)}m=(c[3591]|0)-1|0;n=c[g+8>>2]|0;do{if((c[g+12>>2]|0)-n>>2>>>0>m>>>0){o=c[n+(m<<2)>>2]|0;if((o|0)==0){break}p=o;if(((I=c[u>>2]|0,c[u>>2]=I+ -1,I)|0)==0){ce[c[(c[g>>2]|0)+8>>2]&511](g)}o=c[q>>2]|0;d=o+4|0;I=c[d>>2]|0,c[d>>2]=I+1,I;if((c[3494]|0)!=-1){c[l>>2]=13976;c[l+4>>2]=12;c[l+8>>2]=0;d3(13976,l,96)}t=(c[3495]|0)-1|0;v=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-v>>2>>>0>t>>>0){w=c[v+(t<<2)>>2]|0;if((w|0)==0){break}x=w;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)|0)==0){ce[c[(c[o>>2]|0)+8>>2]&511](o)}y=r|0;z=w;cf[c[(c[z>>2]|0)+24>>2]&127](y,x);cf[c[(c[z>>2]|0)+28>>2]&127](r+12|0,x);c[s>>2]=c[f>>2]|0;a[j]=(fN(e,s,y,r+24|0,p,h,1)|0)==(y|0)&1;c[b>>2]=c[e>>2]|0;if((a[r+12|0]&1)!=0){ky(c[r+20>>2]|0)}if((a[r]&1)==0){i=k;return}ky(c[r+8>>2]|0);i=k;return}}while(0);p=b3(4)|0;c[p>>2]=5688;bv(p|0,11856,198)}}while(0);k=b3(4)|0;c[k>>2]=5688;bv(k|0,11856,198)}function fM(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;fQ(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L129:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=ci[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=137}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=137;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L129}}}}while(0);if((z|0)==137){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((fO(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;ci[G&255](v);m=v;continue}else{c[w>>2]=A+4|0;m=v;continue}}m=n;D=d[m]|0;if((D&1|0)==0){I=D>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4|0;c[D>>2]=C}}while(0);c[k>>2]=fq(h,c[p>>2]|0,j,u)|0;fo(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=170}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=ci[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=170;break}else{if(l^(E|0)==0){break}else{z=172;break}}}}while(0);if((z|0)==170){if(l){z=172}}if((z|0)==172){c[j>>2]=c[j>>2]|2}c[b>>2]=J;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fN(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2]|0;m=(g-f|0)/12&-1;n=l|0;do{if(m>>>0>100){o=ko(m)|0;if((o|0)!=0){p=o;q=o;break}o=b3(4)|0;c[o>>2]=5656;bv(o|0,11840,32);return 0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);L201:do{if(n){r=m;s=0}else{o=m;t=0;u=p;v=f;while(1){w=d[v]|0;if((w&1|0)==0){x=w>>>1}else{x=c[v+4>>2]|0}if((x|0)==0){a[u]=2;y=t+1|0;z=o-1|0}else{a[u]=1;y=t;z=o}w=v+12|0;if((w|0)==(g|0)){r=z;s=y;break L201}else{o=z;t=y;u=u+1|0;v=w}}}}while(0);y=b|0;b=e|0;e=h;z=0;x=s;s=r;while(1){r=c[y>>2]|0;do{if((r|0)==0){A=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){B=ci[c[(c[r>>2]|0)+36>>2]&255](r)|0}else{B=c[m>>2]|0}if((B|0)==-1){c[y>>2]=0;A=0;break}else{A=c[y>>2]|0;break}}}while(0);r=(A|0)==0;m=c[b>>2]|0;if((m|0)==0){C=A;D=0}else{v=c[m+12>>2]|0;if((v|0)==(c[m+16>>2]|0)){E=ci[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{E=c[v>>2]|0}if((E|0)==-1){c[b>>2]=0;F=0}else{F=m}C=c[y>>2]|0;D=F}G=(D|0)==0;if(!((r^G)&(s|0)!=0)){break}r=c[C+12>>2]|0;if((r|0)==(c[C+16>>2]|0)){H=ci[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{H=c[r>>2]|0}if(k){I=H}else{I=cg[c[(c[e>>2]|0)+28>>2]&63](h,H)|0}L243:do{if(n){J=x;K=s}else{r=z+1|0;m=s;v=x;u=p;t=0;o=f;while(1){do{if((a[u]|0)==1){w=o;if((a[w]&1)==0){L=o+4|0}else{L=c[o+8>>2]|0}M=c[L+(z<<2)>>2]|0;if(k){N=M}else{N=cg[c[(c[e>>2]|0)+28>>2]&63](h,M)|0}if((I|0)!=(N|0)){a[u]=0;O=t;P=v;Q=m-1|0;break}M=d[w]|0;if((M&1|0)==0){R=M>>>1}else{R=c[o+4>>2]|0}if((R|0)!=(r|0)){O=1;P=v;Q=m;break}a[u]=2;O=1;P=v+1|0;Q=m-1|0}else{O=t;P=v;Q=m}}while(0);M=o+12|0;if((M|0)==(g|0)){break}m=Q;v=P;u=u+1|0;t=O;o=M}if(!O){J=P;K=Q;break}o=c[y>>2]|0;t=o+12|0;u=c[t>>2]|0;if((u|0)==(c[o+16>>2]|0)){v=c[(c[o>>2]|0)+40>>2]|0;ci[v&255](o)}else{c[t>>2]=u+4|0}if((P+Q|0)>>>0<2|n){J=P;K=Q;break}u=z+1|0;t=P;o=p;v=f;while(1){do{if((a[o]|0)==2){m=d[v]|0;if((m&1|0)==0){S=m>>>1}else{S=c[v+4>>2]|0}if((S|0)==(u|0)){T=t;break}a[o]=0;T=t-1|0}else{T=t}}while(0);m=v+12|0;if((m|0)==(g|0)){J=T;K=Q;break L243}else{t=T;o=o+1|0;v=m}}}}while(0);z=z+1|0;x=J;s=K}do{if((C|0)==0){U=1}else{K=c[C+12>>2]|0;if((K|0)==(c[C+16>>2]|0)){V=ci[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{V=c[K>>2]|0}if((V|0)==-1){c[y>>2]=0;U=1;break}else{U=(c[y>>2]|0)==0;break}}}while(0);do{if(G){W=261}else{y=c[D+12>>2]|0;if((y|0)==(c[D+16>>2]|0)){X=ci[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{X=c[y>>2]|0}if((X|0)==-1){c[b>>2]=0;W=261;break}else{if(U^(D|0)==0){break}else{W=263;break}}}}while(0);if((W|0)==261){if(U){W=263}}if((W|0)==263){c[j>>2]=c[j>>2]|2}L309:do{if(n){W=268}else{U=f;D=p;while(1){if((a[D]|0)==2){Y=U;break L309}b=U+12|0;if((b|0)==(g|0)){W=268;break L309}U=b;D=D+1|0}}}while(0);if((W|0)==268){c[j>>2]=c[j>>2]|4;Y=g}if((q|0)==0){i=l;return Y|0}kp(q);i=l;return Y|0}function fO(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1|0;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4|0;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[m+14824|0]|0;b=c[g>>2]|0;c[g>>2]=b+1|0;a[b]=s;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[m+14824|0]|0;c[g>>2]=n+1|0;a[n]=f}c[h>>2]=(c[h>>2]|0)+1|0;q=0;return q|0}function fP(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;fQ(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L373:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=ci[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=327}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=327;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L373}}}}while(0);if((z|0)==327){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((fO(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;ci[G&255](v);m=v;continue}else{c[w>>2]=A+4|0;m=v;continue}}m=n;D=d[m]|0;if((D&1|0)==0){I=D>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4|0;c[D>>2]=C}}while(0);s=ft(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;fo(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){L=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{L=c[r>>2]|0}if((L|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=360}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){M=ci[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{M=c[v>>2]|0}if((M|0)==-1){c[f>>2]=0;z=360;break}else{if(l^(E|0)==0){break}else{z=362;break}}}}while(0);if((z|0)==360){if(l){z=362}}if((z|0)==362){c[j>>2]=c[j>>2]|2}c[b>>2]=J;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fQ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+32|0;g=f|0;h=f+16|0;j=c[b+28>>2]|0;b=j+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;if((c[3590]|0)!=-1){c[h>>2]=14360;c[h+4>>2]=12;c[h+8>>2]=0;d3(14360,h,96)}h=(c[3591]|0)-1|0;k=j+12|0;l=j+8|0;m=c[l>>2]|0;do{if((c[k>>2]|0)-m>>2>>>0>h>>>0){n=c[m+(h<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+48>>2]|0;cs[p&15](o,14824,14850,d);if((c[3494]|0)!=-1){c[g>>2]=13976;c[g+4>>2]=12;c[g+8>>2]=0;d3(13976,g,96)}o=(c[3495]|0)-1|0;p=c[l>>2]|0;do{if((c[k>>2]|0)-p>>2>>>0>o>>>0){n=c[p+(o<<2)>>2]|0;if((n|0)==0){break}q=n;c[e>>2]=ci[c[(c[n>>2]|0)+16>>2]&255](q)|0;cf[c[(c[n>>2]|0)+20>>2]&127](a,q);if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){i=f;return}ce[c[(c[j>>2]|0)+8>>2]&511](j);i=f;return}}while(0);o=b3(4)|0;c[o>>2]=5688;bv(o|0,11856,198)}}while(0);f=b3(4)|0;c[f>>2]=5688;bv(f|0,11856,198)}function fR(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;f=i;i=i+352|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2]|0;m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2]|0;m=f|0;n=f+104|0;o=f+112|0;p=f+128|0;q=f+168|0;r=f+176|0;s=f+336|0;t=f+344|0;u=c[j+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=m|0;fQ(o,j,u,n);j=p|0;kD(j|0,0,40);c[q>>2]=j;p=r|0;c[s>>2]=p;c[t>>2]=0;m=g|0;g=h|0;h=c[n>>2]|0;n=c[m>>2]|0;L469:while(1){do{if((n|0)==0){w=0}else{x=c[n+12>>2]|0;if((x|0)==(c[n+16>>2]|0)){y=ci[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{y=c[x>>2]|0}if((y|0)!=-1){w=n;break}c[m>>2]=0;w=0}}while(0);z=(w|0)==0;x=c[g>>2]|0;do{if((x|0)==0){A=408}else{B=c[x+12>>2]|0;if((B|0)==(c[x+16>>2]|0)){C=ci[c[(c[x>>2]|0)+36>>2]&255](x)|0}else{C=c[B>>2]|0}if((C|0)==-1){c[g>>2]=0;A=408;break}else{B=(x|0)==0;if(z^B){D=x;E=B;break}else{F=x;G=B;break L469}}}}while(0);if((A|0)==408){A=0;if(z){F=0;G=1;break}else{D=0;E=1}}x=w+12|0;B=c[x>>2]|0;H=w+16|0;if((B|0)==(c[H>>2]|0)){I=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{I=c[B>>2]|0}if((fO(I,v,j,q,t,h,o,p,s,u)|0)!=0){F=D;G=E;break}B=c[x>>2]|0;if((B|0)==(c[H>>2]|0)){H=c[(c[w>>2]|0)+40>>2]|0;ci[H&255](w);n=w;continue}else{c[x>>2]=B+4|0;n=w;continue}}n=o;E=d[n]|0;if((E&1|0)==0){J=E>>>1}else{J=c[o+4>>2]|0}do{if((J|0)!=0){E=c[s>>2]|0;if((E-r|0)>=160){break}D=c[t>>2]|0;c[s>>2]=E+4|0;c[E>>2]=D}}while(0);b[l>>1]=fv(j,c[q>>2]|0,k,v)|0;fo(o,p,c[s>>2]|0,k);do{if(z){K=0}else{s=c[w+12>>2]|0;if((s|0)==(c[w+16>>2]|0)){L=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{L=c[s>>2]|0}if((L|0)!=-1){K=w;break}c[m>>2]=0;K=0}}while(0);m=(K|0)==0;do{if(G){A=441}else{w=c[F+12>>2]|0;if((w|0)==(c[F+16>>2]|0)){M=ci[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{M=c[w>>2]|0}if((M|0)==-1){c[g>>2]=0;A=441;break}else{if(m^(F|0)==0){break}else{A=443;break}}}}while(0);if((A|0)==441){if(m){A=443}}if((A|0)==443){c[k>>2]=c[k>>2]|2}c[e>>2]=K;if((a[n]&1)==0){i=f;return}ky(c[o+8>>2]|0);i=f;return}function fS(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;fQ(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L541:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=ci[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=466}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=466;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L541}}}}while(0);if((z|0)==466){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((fO(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;ci[G&255](v);m=v;continue}else{c[w>>2]=A+4|0;m=v;continue}}m=n;D=d[m]|0;if((D&1|0)==0){I=D>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4|0;c[D>>2]=C}}while(0);c[k>>2]=fx(h,c[p>>2]|0,j,u)|0;fo(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=499}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=ci[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=499;break}else{if(l^(E|0)==0){break}else{z=501;break}}}}while(0);if((z|0)==499){if(l){z=501}}if((z|0)==501){c[j>>2]=c[j>>2]|2}c[b>>2]=J;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fT(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;fQ(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L613:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=ci[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=524}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=524;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L613}}}}while(0);if((z|0)==524){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((fO(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;ci[G&255](v);m=v;continue}else{c[w>>2]=A+4|0;m=v;continue}}m=n;D=d[m]|0;if((D&1|0)==0){I=D>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4|0;c[D>>2]=C}}while(0);c[k>>2]=fz(h,c[p>>2]|0,j,u)|0;fo(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=557}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=ci[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=557;break}else{if(l^(E|0)==0){break}else{z=559;break}}}}while(0);if((z|0)==557){if(l){z=559}}if((z|0)==559){c[j>>2]=c[j>>2]|2}c[b>>2]=J;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fU(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2]|0;l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;fQ(n,h,t,m);h=o|0;kD(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L685:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=ci[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=582}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=ci[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=582;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L685}}}}while(0);if((z|0)==582){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((fO(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;ci[G&255](v);m=v;continue}else{c[w>>2]=A+4|0;m=v;continue}}m=n;D=d[m]|0;if((D&1|0)==0){I=D>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){D=c[r>>2]|0;if((D-q|0)>=160){break}C=c[s>>2]|0;c[r>>2]=D+4|0;c[D>>2]=C}}while(0);s=fB(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;fo(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){L=ci[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{L=c[r>>2]|0}if((L|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=615}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){M=ci[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{M=c[v>>2]|0}if((M|0)==-1){c[f>>2]=0;z=615;break}else{if(l^(E|0)==0){break}else{z=617;break}}}}while(0);if((z|0)==615){if(l){z=617}}if((z|0)==617){c[j>>2]=c[j>>2]|2}c[b>>2]=J;if((a[m]&1)==0){i=e;return}ky(c[n+8>>2]|0);i=e;return}function fV(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if((b|0)==(i|0)){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1|0;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4|0;c[s>>2]=i;r=0;return r|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4|0;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+128|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((c[j>>2]|0)==(b|0)){u=j;break}else{j=j+4|0}}j=u-o|0;o=j>>2;if((j|0)>124){r=-1;return r|0}u=a[o+14824|0]|0;do{if((o|0)==22|(o|0)==23){a[f]=80}else if((o|0)==25|(o|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1|0;a[p]=u;r=0;return r|0}else{b=a[f]|0;if((u&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){v=b>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}t=c[n>>2]|0;c[m>>2]=b+4|0;c[b>>2]=t}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1|0;a[m]=u}if((j|0)>84){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1|0;r=0;return r|0}function fW(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0.0,P=0,Q=0,R=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2]|0;m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;fX(p,j,w,n,o);j=e+168|0;kD(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L820:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=ci[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);C=(z|0)==0;A=c[f>>2]|0;do{if((A|0)==0){D=688}else{E=c[A+12>>2]|0;if((E|0)==(c[A+16>>2]|0)){F=ci[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=688;break}else{E=(A|0)==0;if(C^E){G=A;H=E;break}else{I=A;J=E;break L820}}}}while(0);if((D|0)==688){D=0;if(C){I=0;J=1;break}else{G=0;H=1}}A=z+12|0;E=c[A>>2]|0;K=z+16|0;if((E|0)==(c[K>>2]|0)){L=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[E>>2]|0}if((fV(L,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){I=G;J=H;break}E=c[A>>2]|0;if((E|0)==(c[K>>2]|0)){K=c[(c[z>>2]|0)+40>>2]|0;ci[K&255](z);o=z;continue}else{c[A>>2]=E+4|0;o=z;continue}}o=p;H=d[o]|0;if((H&1|0)==0){M=H>>>1}else{M=c[p+4>>2]|0}do{if((M|0)!=0){if((a[u]&1)==0){break}H=c[s>>2]|0;if((H-r|0)>=160){break}G=c[t>>2]|0;c[s>>2]=H+4|0;c[H>>2]=G}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;N=0.0}else{if(!(a[14968]|0)){c[1170]=aX(1,1712,0)|0;a[14968]=1}O=+kB(j,m);if((c[m>>2]|0)==(t|0)){N=O;break}else{c[k>>2]=4;N=0.0;break}}}while(0);g[l>>2]=N;fo(p,x,c[s>>2]|0,k);do{if(C){P=0}else{s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){Q=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{Q=c[s>>2]|0}if((Q|0)!=-1){P=z;break}c[y>>2]=0;P=0}}while(0);y=(P|0)==0;do{if(J){D=729}else{z=c[I+12>>2]|0;if((z|0)==(c[I+16>>2]|0)){R=ci[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{R=c[z>>2]|0}if((R|0)==-1){c[f>>2]=0;D=729;break}else{if(y^(I|0)==0){break}else{D=731;break}}}}while(0);if((D|0)==729){if(y){D=731}}if((D|0)==731){c[k>>2]=c[k>>2]|2}c[b>>2]=P;if((a[o]&1)==0){i=e;return}ky(c[p+8>>2]|0);i=e;return}function fX(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;i=i+32|0;h=g|0;j=g+16|0;k=c[b+28>>2]|0;b=k+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;if((c[3590]|0)!=-1){c[j>>2]=14360;c[j+4>>2]=12;c[j+8>>2]=0;d3(14360,j,96)}j=(c[3591]|0)-1|0;l=k+12|0;m=k+8|0;n=c[m>>2]|0;do{if((c[l>>2]|0)-n>>2>>>0>j>>>0){o=c[n+(j<<2)>>2]|0;if((o|0)==0){break}p=o;q=c[(c[o>>2]|0)+48>>2]|0;cs[q&15](p,14824,14856,d);if((c[3494]|0)!=-1){c[h>>2]=13976;c[h+4>>2]=12;c[h+8>>2]=0;d3(13976,h,96)}p=(c[3495]|0)-1|0;q=c[m>>2]|0;do{if((c[l>>2]|0)-q>>2>>>0>p>>>0){o=c[q+(p<<2)>>2]|0;if((o|0)==0){break}r=o;s=o;c[e>>2]=ci[c[(c[s>>2]|0)+12>>2]&255](r)|0;c[f>>2]=ci[c[(c[s>>2]|0)+16>>2]&255](r)|0;cf[c[(c[o>>2]|0)+20>>2]&127](a,r);if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){i=g;return}ce[c[(c[k>>2]|0)+8>>2]&511](k);i=g;return}}while(0);p=b3(4)|0;c[p>>2]=5688;bv(p|0,11856,198)}}while(0);g=b3(4)|0;c[g>>2]=5688;bv(g|0,11856,198)}function fY(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0.0,P=0,Q=0,R=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2]|0;m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;fX(p,j,w,n,o);j=e+168|0;kD(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L923:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=ci[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);C=(z|0)==0;A=c[f>>2]|0;do{if((A|0)==0){D=774}else{E=c[A+12>>2]|0;if((E|0)==(c[A+16>>2]|0)){F=ci[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=774;break}else{E=(A|0)==0;if(C^E){G=A;H=E;break}else{I=A;J=E;break L923}}}}while(0);if((D|0)==774){D=0;if(C){I=0;J=1;break}else{G=0;H=1}}A=z+12|0;E=c[A>>2]|0;K=z+16|0;if((E|0)==(c[K>>2]|0)){L=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[E>>2]|0}if((fV(L,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){I=G;J=H;break}E=c[A>>2]|0;if((E|0)==(c[K>>2]|0)){K=c[(c[z>>2]|0)+40>>2]|0;ci[K&255](z);o=z;continue}else{c[A>>2]=E+4|0;o=z;continue}}o=p;H=d[o]|0;if((H&1|0)==0){M=H>>>1}else{M=c[p+4>>2]|0}do{if((M|0)!=0){if((a[u]&1)==0){break}H=c[s>>2]|0;if((H-r|0)>=160){break}G=c[t>>2]|0;c[s>>2]=H+4|0;c[H>>2]=G}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;N=0.0}else{if(!(a[14968]|0)){c[1170]=aX(1,1712,0)|0;a[14968]=1}O=+kB(j,m);if((c[m>>2]|0)==(t|0)){N=O;break}c[k>>2]=4;N=0.0}}while(0);h[l>>3]=N;fo(p,x,c[s>>2]|0,k);do{if(C){P=0}else{s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){Q=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{Q=c[s>>2]|0}if((Q|0)!=-1){P=z;break}c[y>>2]=0;P=0}}while(0);y=(P|0)==0;do{if(J){D=814}else{z=c[I+12>>2]|0;if((z|0)==(c[I+16>>2]|0)){R=ci[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{R=c[z>>2]|0}if((R|0)==-1){c[f>>2]=0;D=814;break}else{if(y^(I|0)==0){break}else{D=816;break}}}}while(0);if((D|0)==814){if(y){D=816}}if((D|0)==816){c[k>>2]=c[k>>2]|2}c[b>>2]=P;if((a[o]&1)==0){i=e;return}ky(c[p+8>>2]|0);i=e;return}function fZ(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0.0,P=0,Q=0,R=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2]|0;m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;fX(p,j,w,n,o);j=e+168|0;kD(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L999:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=ci[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);C=(z|0)==0;A=c[f>>2]|0;do{if((A|0)==0){D=835}else{E=c[A+12>>2]|0;if((E|0)==(c[A+16>>2]|0)){F=ci[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=835;break}else{E=(A|0)==0;if(C^E){G=A;H=E;break}else{I=A;J=E;break L999}}}}while(0);if((D|0)==835){D=0;if(C){I=0;J=1;break}else{G=0;H=1}}A=z+12|0;E=c[A>>2]|0;K=z+16|0;if((E|0)==(c[K>>2]|0)){L=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[E>>2]|0}if((fV(L,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){I=G;J=H;break}E=c[A>>2]|0;if((E|0)==(c[K>>2]|0)){K=c[(c[z>>2]|0)+40>>2]|0;ci[K&255](z);o=z;continue}else{c[A>>2]=E+4|0;o=z;continue}}o=p;H=d[o]|0;if((H&1|0)==0){M=H>>>1}else{M=c[p+4>>2]|0}do{if((M|0)!=0){if((a[u]&1)==0){break}H=c[s>>2]|0;if((H-r|0)>=160){break}G=c[t>>2]|0;c[s>>2]=H+4|0;c[H>>2]=G}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;N=0.0}else{if(!(a[14968]|0)){c[1170]=aX(1,1712,0)|0;a[14968]=1}O=+kB(j,m);if((c[m>>2]|0)==(t|0)){N=O;break}c[k>>2]=4;N=0.0}}while(0);h[l>>3]=N;fo(p,x,c[s>>2]|0,k);do{if(C){P=0}else{s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){Q=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{Q=c[s>>2]|0}if((Q|0)!=-1){P=z;break}c[y>>2]=0;P=0}}while(0);y=(P|0)==0;do{if(J){D=875}else{z=c[I+12>>2]|0;if((z|0)==(c[I+16>>2]|0)){R=ci[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{R=c[z>>2]|0}if((R|0)==-1){c[f>>2]=0;D=875;break}else{if(y^(I|0)==0){break}else{D=877;break}}}}while(0);if((D|0)==875){if(y){D=877}}if((D|0)==877){c[k>>2]=c[k>>2]|2}c[b>>2]=P;if((a[o]&1)==0){i=e;return}ky(c[p+8>>2]|0);i=e;return}function f_(a){a=a|0;return}function f$(a){a=a|0;ky(a);return}function f0(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[5456]|0;a[q+1|0]=a[5457|0]|0;a[q+2|0]=a[5458|0]|0;a[q+3|0]=a[5459|0]|0;a[q+4|0]=a[5460|0]|0;a[q+5|0]=a[5461|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;if(a[14968]|0){w=c[1170]|0}else{t=aX(1,1712,0)|0;c[1170]=t;a[14968]=1;w=t}t=f3(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=904;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=904;break}x=k+2|0}else{y=904}}while(0);if((y|0)==904){x=u}y=l|0;l=o|0;k=c[f+28>>2]|0;c[l>>2]=k;t=k+4|0;I=c[t>>2]|0,c[t>>2]=I+1,I;f7(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;de(b,p,y,D,E,f,g);i=d;return}ce[c[(c[o>>2]|0)+8>>2]&511](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;de(b,p,y,D,E,f,g);i=d;return}function f1(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+136|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2]|0;k=d|0;l=d+16|0;m=d+120|0;n=m;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;kD(n|0,0,12);t=c[g+28>>2]|0;g=t+4|0;I=c[g>>2]|0,c[g>>2]=I+1,I;if((c[3590]|0)!=-1){c[k>>2]=14360;c[k+4>>2]=12;c[k+8>>2]=0;d3(14360,k,96)}k=(c[3591]|0)-1|0;u=c[t+8>>2]|0;do{if((c[t+12>>2]|0)-u>>2>>>0>k>>>0){v=c[u+(k<<2)>>2]|0;if((v|0)==0){break}w=v;x=l|0;y=c[(c[v>>2]|0)+48>>2]|0;cs[y&15](w,14824,14850,x);if(((I=c[g>>2]|0,c[g>>2]=I+ -1,I)|0)==0){ce[c[(c[t>>2]|0)+8>>2]&511](t)}w=o|0;kD(w|0,0,40);c[p>>2]=w;y=q|0;c[r>>2]=y;c[s>>2]=0;v=e|0;z=f|0;A=c[v>>2]|0;L1121:while(1){do{if((A|0)==0){C=0}else{D=c[A+12>>2]|0;if((D|0)==(c[A+16>>2]|0)){E=ci[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{E=c[D>>2]|0}if((E|0)!=-1){C=A;break}c[v>>2]=0;C=0}}while(0);F=(C|0)==0;D=c[z>>2]|0;do{if((D|0)==0){G=936}else{H=c[D+12>>2]|0;if((H|0)==(c[D+16>>2]|0)){J=ci[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{J=c[H>>2]|0}if((J|0)==-1){c[z>>2]=0;G=936;break}else{H=(D|0)==0;if(F^H){K=D;L=H;break}else{M=D;N=H;break L1121}}}}while(0);if((G|0)==936){G=0;if(F){M=0;N=1;break}else{K=0;L=1}}D=C+12|0;H=c[D>>2]|0;O=C+16|0;if((H|0)==(c[O>>2]|0)){P=ci[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{P=c[H>>2]|0}if((fO(P,16,w,p,s,0,m,y,r,x)|0)!=0){M=K;N=L;break}H=c[D>>2]|0;if((H|0)==(c[O>>2]|0)){O=c[(c[C>>2]|0)+40>>2]|0;ci[O&255](C);A=C;continue}else{c[D>>2]=H+4|0;A=C;continue}}a[o+39|0]=0;if(a[14968]|0){Q=c[1170]|0}else{A=aX(1,1712,0)|0;c[1170]=A;a[14968]=1;Q=A}if((fK(w,Q,1584,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}do{if(F){R=0}else{A=c[C+12>>2]|0;if((A|0)==(c[C+16>>2]|0)){S=ci[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{S=c[A>>2]|0}if((S|0)!=-1){R=C;break}c[v>>2]=0;R=0}}while(0);v=(R|0)==0;do{if(N){G=969}else{w=c[M+12>>2]|0;if((w|0)==(c[M+16>>2]|0)){T=ci[c[(c[M>>2]|0)+36>>2]&255](M)|0}else{T=c[w>>2]|0}if((T|0)==-1){c[z>>2]=0;G=969;break}else{if(v^(M|0)==0){break}else{G=971;break}}}}while(0);if((G|0)==969){if(v){G=971}}if((G|0)==971){c[h>>2]=c[h>>2]|2}c[b>>2]=R;if((a[n]&1)==0){i=d;return}ky(c[m+8>>2]|0);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function f2(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+40|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+16|0;m=j+24|0;if((c[f+4>>2]&1|0)==0){n=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2]|0;cr[n&63](b,d,l,f,g,h&1);i=j;return}g=c[f+28>>2]|0;f=g+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3496]|0)!=-1){c[k>>2]=13984;c[k+4>>2]=12;c[k+8>>2]=0;d3(13984,k,96)}k=(c[3497]|0)-1|0;l=c[g+8>>2]|0;do{if((c[g+12>>2]|0)-l>>2>>>0>k>>>0){d=c[l+(k<<2)>>2]|0;if((d|0)==0){break}n=d;if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[g>>2]|0)+8>>2]&511](g)}o=c[d>>2]|0;if(h){cf[c[o+24>>2]&127](m,n)}else{cf[c[o+28>>2]&127](m,n)}n=m;o=m;d=a[o]|0;if((d&1)==0){p=n+1|0;q=p;r=p;s=m+8|0}else{p=m+8|0;q=c[p>>2]|0;r=n+1|0;s=p}p=e|0;n=m+4|0;t=q;u=d;while(1){v=(u&1)==0;if(v){w=r}else{w=c[s>>2]|0}d=u&255;if((t|0)==(w+((d&1|0)==0?d>>>1:c[n>>2]|0)|0)){break}d=a[t]|0;x=c[p>>2]|0;do{if((x|0)!=0){y=x+24|0;z=c[y>>2]|0;if((z|0)!=(c[x+28>>2]|0)){c[y>>2]=z+1|0;a[z]=d;break}if((cg[c[(c[x>>2]|0)+52>>2]&63](x,d&255)|0)!=-1){break}c[p>>2]=0}}while(0);t=t+1|0;u=a[o]|0}c[b>>2]=c[p>>2]|0;if(v){i=j;return}ky(c[s>>2]|0);i=j;return}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}function f3(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bR(b|0)|0;b=bQ(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bR(h|0);i=f;return b|0}function f4(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;if(a[14968]|0){w=c[1170]|0}else{t=aX(1,1712,0)|0;c[1170]=t;a[14968]=1;w=t}t=f3(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=1043;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1043;break}x=l+2|0}else if((h|0)==32){x=j}else{y=1043}}while(0);if((y|0)==1043){x=u}y=m|0;m=p|0;h=c[f+28>>2]|0;c[m>>2]=h;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;f7(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;de(b,q,y,D,E,f,g);i=d;return}ce[c[(c[p>>2]|0)+8>>2]&511](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;de(b,q,y,D,E,f,g);i=d;return}function f5(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[5456]|0;a[q+1|0]=a[5457|0]|0;a[q+2|0]=a[5458|0]|0;a[q+3|0]=a[5459|0]|0;a[q+4|0]=a[5460|0]|0;a[q+5|0]=a[5461|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;if(a[14968]|0){w=c[1170]|0}else{t=aX(1,1712,0)|0;c[1170]=t;a[14968]=1;w=t}t=f3(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=1072;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1072;break}x=k+2|0}else{y=1072}}while(0);if((y|0)==1072){x=u}y=l|0;l=o|0;k=c[f+28>>2]|0;c[l>>2]=k;t=k+4|0;I=c[t>>2]|0,c[t>>2]=I+1,I;f7(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;de(b,p,y,D,E,f,g);i=d;return}ce[c[(c[o>>2]|0)+8>>2]&511](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;de(b,p,y,D,E,f,g);i=d;return}function f6(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;if(a[14968]|0){w=c[1170]|0}else{t=aX(1,1712,0)|0;c[1170]=t;a[14968]=1;w=t}t=f3(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){y=1101;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1101;break}x=l+2|0}else if((h|0)==32){x=j}else{y=1101}}while(0);if((y|0)==1101){x=u}y=m|0;m=p|0;h=c[f+28>>2]|0;c[m>>2]=h;l=h+4|0;I=c[l>>2]|0,c[l>>2]=I+1,I;f7(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;de(b,q,y,D,E,f,g);i=d;return}ce[c[(c[p>>2]|0)+8>>2]&511](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;de(b,q,y,D,E,f,g);i=d;return}function f7(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3592]|0)!=-1){c[n>>2]=14368;c[n+4>>2]=12;c[n+8>>2]=0;d3(14368,n,96)}n=(c[3593]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}r=k;s=c[p>>2]|0;if((c[3496]|0)!=-1){c[m>>2]=13984;c[m+4>>2]=12;c[m+8>>2]=0;d3(13984,m,96)}m=(c[3497]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}t=s;cf[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}L1362:do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;cs[p&15](r,b,f,g);c[j>>2]=g+(f-b|0)|0}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cg[c[(c[k>>2]|0)+28>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cg[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+1|0;a[y]=q;q=cg[c[(c[p>>2]|0)+28>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+1|0;a[n]=q;x=w+2|0}else{x=w}}while(0);L1377:do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}while(1){q=a[z]|0;a[z]=a[A]|0;a[A]=q;q=z+1|0;n=A-1|0;if(q>>>0<n>>>0){z=q;A=n}else{break L1377}}}}while(0);n=ci[c[(c[s>>2]|0)+16>>2]&255](t)|0;L1383:do{if(x>>>0<f>>>0){q=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?q:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?q:c[B>>2]|0)+D|0]|0|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1|0;a[I]=n;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0&1)+D|0;H=0}}while(0);F=cg[c[(c[p>>2]|0)+28>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1|0;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break L1383}}}}while(0);n=g+(x-b|0)|0;E=c[j>>2]|0;if((n|0)==(E|0)){break}D=E-1|0;if(n>>>0<D>>>0){J=n;K=D}else{break}while(1){D=a[J]|0;a[J]=a[K]|0;a[K]=D;D=J+1|0;n=K-1|0;if(D>>>0<n>>>0){J=D;K=n}else{break L1362}}}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0}else{L=g+(e-b|0)|0}c[h>>2]=L;if((a[m]&1)==0){i=l;return}ky(c[o+8>>2]|0);i=l;return}function f8(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[14968]|0){z=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;z=l}if(y){A=f9(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{A=f9(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[14968]|0;if(y){if(z){C=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;C=l}D=ga(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[1170]|0}else{z=aX(1,1712,0)|0;c[1170]=z;a[14968]=1;E=z}D=ga(m,E,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}z=b3(4)|0;c[z>>2]=5656;bv(z|0,11840,32)}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==32){J=A}else if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){J=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){K=1214;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){K=1214;break}J=H+2|0}else{K=1214}}while(0);if((K|0)==1214){J=H}do{if((H|0)==(k|0)){L=n|0;M=0;N=k}else{K=ko(F<<1)|0;if((K|0)!=0){L=K;M=K;N=c[m>>2]|0;break}K=b3(4)|0;c[K>>2]=5656;bv(K|0,11840,32)}}while(0);m=q|0;F=c[f+28>>2]|0;c[m>>2]=F;k=F+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;gb(N,J,A,L,o,p,q);q=c[m>>2]|0;m=q+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q|0)}q=e|0;c[s>>2]=c[q>>2]|0;de(r,s,L,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((M|0)!=0){kp(M)}if((G|0)==0){i=d;return}kp(G);i=d;return}function f9(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=bR(d|0)|0;d=bS(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}bR(j|0);i=g;return d|0}function ga(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bR(b|0)|0;b=b5(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bR(h|0);i=f;return b|0}function gb(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3592]|0)!=-1){c[n>>2]=14368;c[n+4>>2]=12;c[n+8>>2]=0;d3(14368,n,96)}n=(c[3593]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}r=k;s=c[p>>2]|0;if((c[3496]|0)!=-1){c[m>>2]=13984;c[m+4>>2]=12;c[m+8>>2]=0;d3(13984,m,96)}m=(c[3497]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}t=s;cf[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cg[c[(c[k>>2]|0)+28>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+1|0;a[u]=m;v=b+1|0}else{v=b}m=f;L1523:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=1291;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=1291;break}p=k;n=cg[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+1|0;a[q]=n;n=v+2|0;q=cg[c[(c[p>>2]|0)+28>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1|0;a[u]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L1523}u=a[q]|0;if(a[14968]|0){A=c[1170]|0}else{p=aX(1,1712,0)|0;c[1170]=p;a[14968]=1;A=p}if((bd(u<<24>>24|0,A|0)|0)==0){y=q;z=n;break L1523}else{q=q+1|0}}}else{w=v;x=1291}}while(0);L1538:do{if((x|0)==1291){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L1538}A=a[w]|0;if(a[14968]|0){B=c[1170]|0}else{q=aX(1,1712,0)|0;c[1170]=q;a[14968]=1;B=q}if((bX(A<<24>>24|0,B|0)|0)==0){y=w;z=v;break L1538}else{w=w+1|0;x=1291}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){C=v>>>1}else{C=c[o+4>>2]|0}L1553:do{if((C|0)==0){v=c[j>>2]|0;B=c[(c[k>>2]|0)+32>>2]|0;cs[B&15](r,z,y,v);c[j>>2]=(c[j>>2]|0)+(y-z|0)|0}else{L1555:do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){D=z;E=v}else{break}while(1){v=a[D]|0;a[D]=a[E]|0;a[E]=v;v=D+1|0;B=E-1|0;if(v>>>0<B>>>0){D=v;E=B}else{break L1555}}}}while(0);B=ci[c[(c[s>>2]|0)+16>>2]&255](t)|0;L1561:do{if(z>>>0<y>>>0){v=x+1|0;A=o+4|0;q=o+8|0;n=k;u=0;p=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[q>>2]|0)+p|0]|0)>0){if((u|0)!=(a[(G?v:c[q>>2]|0)+p|0]|0|0)){H=p;I=u;break}J=c[j>>2]|0;c[j>>2]=J+1|0;a[J]=B;J=d[w]|0;H=(p>>>0<(((J&1|0)==0?J>>>1:c[A>>2]|0)-1|0)>>>0&1)+p|0;I=0}else{H=p;I=u}}while(0);G=cg[c[(c[n>>2]|0)+28>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1|0;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){u=I+1|0;p=H;F=G}else{break L1561}}}}while(0);B=g+(z-b|0)|0;F=c[j>>2]|0;if((B|0)==(F|0)){break}p=F-1|0;if(B>>>0<p>>>0){K=B;L=p}else{break}while(1){p=a[K]|0;a[K]=a[L]|0;a[L]=p;p=K+1|0;B=L-1|0;if(p>>>0<B>>>0){K=p;L=B}else{break L1553}}}}while(0);L1577:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cg[c[(c[L>>2]|0)+28>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+1|0;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1577}}L=ci[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+1|0;a[H]=L;M=K+1|0}else{M=y}}while(0);cs[c[(c[k>>2]|0)+32>>2]&15](r,M,f,c[j>>2]|0);r=(c[j>>2]|0)+(m-M|0)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r}else{N=g+(e-b|0)|0}c[h>>2]=N;if((a[w]&1)==0){i=l;return}ky(c[o+8>>2]|0);i=l;return}function gc(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[14968]|0){z=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;z=l}if(y){A=f9(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{A=f9(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[14968]|0;if(y){if(z){C=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;C=l}D=ga(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[1170]|0}else{z=aX(1,1712,0)|0;c[1170]=z;a[14968]=1;E=z}D=ga(m,E,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}z=b3(4)|0;c[z>>2]=5656;bv(z|0,11840,32)}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){J=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){K=1384;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){K=1384;break}J=H+2|0}else if((D|0)==32){J=A}else{K=1384}}while(0);if((K|0)==1384){J=H}do{if((H|0)==(k|0)){L=n|0;M=0;N=k}else{K=ko(F<<1)|0;if((K|0)!=0){L=K;M=K;N=c[m>>2]|0;break}K=b3(4)|0;c[K>>2]=5656;bv(K|0,11840,32)}}while(0);m=q|0;F=c[f+28>>2]|0;c[m>>2]=F;k=F+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;gb(N,J,A,L,o,p,q);q=c[m>>2]|0;m=q+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q|0)}q=e|0;c[s>>2]=c[q>>2]|0;de(r,s,L,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((M|0)!=0){kp(M)}if((G|0)==0){i=d;return}kp(G);i=d;return}function gd(a){a=a|0;return}function ge(a){a=a|0;ky(a);return}function gf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[5456]|0;a[q+1|0]=a[5457|0]|0;a[q+2|0]=a[5458|0]|0;a[q+3|0]=a[5459|0]|0;a[q+4|0]=a[5460|0]|0;a[q+5|0]=a[5461|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;if(a[14968]|0){w=c[1170]|0}else{v=aX(1,1712,0)|0;c[1170]=v;a[14968]=1;w=v}v=f3(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1430;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1430;break}x=k+2|0}else if((q|0)==32){x=h}else{y=1430}}while(0);if((y|0)==1430){x=u}y=l|0;l=o|0;q=c[f+28>>2]|0;c[l>>2]=q;k=q+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;gk(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gl(b,p,y,D,E,f,g);i=d;return}ce[c[(c[o>>2]|0)+8>>2]&511](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gl(b,p,y,D,E,f,g);i=d;return}function gg(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+96|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+16|0;a[n]=a[5464]|0;a[n+1|0]=a[5465|0]|0;a[n+2|0]=a[5466|0]|0;a[n+3|0]=a[5467|0]|0;a[n+4|0]=a[5468|0]|0;a[n+5|0]=a[5469|0]|0;o=k|0;if(a[14968]|0){p=c[1170]|0}else{q=aX(1,1712,0)|0;c[1170]=q;a[14968]=1;p=q}q=f3(o,p,n,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+q|0;n=c[f+4>>2]&176;do{if((n|0)==32){r=h}else if((n|0)==16){p=a[o]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){r=k+1|0;break}if(!((q|0)>1&p<<24>>24==48)){s=1449;break}p=a[k+1|0]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){s=1449;break}r=k+2|0}else{s=1449}}while(0);if((s|0)==1449){r=o}s=c[f+28>>2]|0;n=s+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;if((c[3592]|0)!=-1){c[j>>2]=14368;c[j+4>>2]=12;c[j+8>>2]=0;d3(14368,j,96)}j=(c[3593]|0)-1|0;p=c[s+8>>2]|0;do{if((c[s+12>>2]|0)-p>>2>>>0>j>>>0){t=c[p+(j<<2)>>2]|0;if((t|0)==0){break}u=t;if(((I=c[n>>2]|0,c[n>>2]=I+ -1,I)|0)==0){ce[c[(c[s>>2]|0)+8>>2]&511](s)}v=l|0;w=c[(c[t>>2]|0)+32>>2]|0;cs[w&15](u,o,h,v);u=l+q|0;if((r|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=m|0;c[A>>2]=z;de(b,m,v,x,u,f,g);i=d;return}x=l+(r-k|0)|0;y=e|0;z=c[y>>2]|0;A=m|0;c[A>>2]=z;de(b,m,v,x,u,f,g);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function gh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;j=i;i=i+40|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+16|0;m=j+24|0;if((c[f+4>>2]&1|0)==0){n=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2]|0;cr[n&63](b,d,l,f,g,h&1);i=j;return}g=c[f+28>>2]|0;f=g+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3494]|0)!=-1){c[k>>2]=13976;c[k+4>>2]=12;c[k+8>>2]=0;d3(13976,k,96)}k=(c[3495]|0)-1|0;l=c[g+8>>2]|0;do{if((c[g+12>>2]|0)-l>>2>>>0>k>>>0){d=c[l+(k<<2)>>2]|0;if((d|0)==0){break}n=d;if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[g>>2]|0)+8>>2]&511](g)}o=c[d>>2]|0;if(h){cf[c[o+24>>2]&127](m,n)}else{cf[c[o+28>>2]&127](m,n)}n=m;o=a[n]|0;if((o&1)==0){d=m+4|0;p=d;q=d;r=m+8|0}else{d=m+8|0;p=c[d>>2]|0;q=m+4|0;r=d}d=e|0;s=p;t=o;while(1){u=(t&1)==0;if(u){v=q}else{v=c[r>>2]|0}o=t&255;if((o&1|0)==0){w=o>>>1}else{w=c[q>>2]|0}if((s|0)==(v+(w<<2)|0)){break}o=c[s>>2]|0;x=c[d>>2]|0;do{if((x|0)!=0){y=x+24|0;z=c[y>>2]|0;if((z|0)==(c[x+28>>2]|0)){A=cg[c[(c[x>>2]|0)+52>>2]&63](x,o)|0}else{c[y>>2]=z+4|0;c[z>>2]=o;A=o}if((A|0)!=-1){break}c[d>>2]=0}}while(0);s=s+4|0;t=a[n]|0}c[b>>2]=c[d>>2]|0;if(u){i=j;return}ky(c[r>>2]|0);i=j;return}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}function gi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=l|0;if(a[14968]|0){w=c[1170]|0}else{v=aX(1,1712,0)|0;c[1170]=v;a[14968]=1;w=v}v=f3(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==32){x=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1526;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1526;break}x=l+2|0}else{y=1526}}while(0);if((y|0)==1526){x=u}y=m|0;m=p|0;l=c[f+28>>2]|0;c[m>>2]=l;v=l+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;gk(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gl(b,q,y,D,E,f,g);i=d;return}ce[c[(c[p>>2]|0)+8>>2]&511](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gl(b,q,y,D,E,f,g);i=d;return}function gj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[5456]|0;a[q+1|0]=a[5457|0]|0;a[q+2|0]=a[5458|0]|0;a[q+3|0]=a[5459|0]|0;a[q+4|0]=a[5460|0]|0;a[q+5|0]=a[5461|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=k|0;if(a[14968]|0){w=c[1170]|0}else{v=aX(1,1712,0)|0;c[1170]=v;a[14968]=1;w=v}v=f3(u,w,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==32){x=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1555;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1555;break}x=k+2|0}else{y=1555}}while(0);if((y|0)==1555){x=u}y=l|0;l=o|0;k=c[f+28>>2]|0;c[l>>2]=k;v=k+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;gk(u,x,h,y,m,n,o);o=c[l>>2]|0;l=o+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gl(b,p,y,D,E,f,g);i=d;return}ce[c[(c[o>>2]|0)+8>>2]&511](o|0);z=e|0;A=c[z>>2]|0;C=p|0;c[C>>2]=A;D=c[m>>2]|0;E=c[n>>2]|0;gl(b,p,y,D,E,f,g);i=d;return}function gk(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3590]|0)!=-1){c[n>>2]=14360;c[n+4>>2]=12;c[n+8>>2]=0;d3(14360,n,96)}n=(c[3591]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}r=k;s=c[p>>2]|0;if((c[3494]|0)!=-1){c[m>>2]=13976;c[m+4>>2]=12;c[m+8>>2]=0;d3(13976,m,96)}m=(c[3495]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}t=s;cf[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}L1882:do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;cs[p&15](r,b,f,g);c[j>>2]=g+(f-b<<2)|0}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cg[c[(c[k>>2]|0)+44>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+4|0;c[p>>2]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cg[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+4|0;c[y>>2]=q;q=cg[c[(c[p>>2]|0)+44>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+4|0;c[n>>2]=q;x=w+2|0}else{x=w}}while(0);L1897:do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}while(1){q=a[z]|0;a[z]=a[A]|0;a[A]=q;q=z+1|0;n=A-1|0;if(q>>>0<n>>>0){z=q;A=n}else{break L1897}}}}while(0);n=ci[c[(c[s>>2]|0)+16>>2]&255](t)|0;L1903:do{if(x>>>0<f>>>0){q=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?q:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?q:c[B>>2]|0)+D|0]|0|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4|0;c[I>>2]=n;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0&1)+D|0;H=0}}while(0);F=cg[c[(c[p>>2]|0)+44>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4|0;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break L1903}}}}while(0);n=g+(x-b<<2)|0;E=c[j>>2]|0;if((n|0)==(E|0)){break}D=E-4|0;if(n>>>0<D>>>0){J=n;K=D}else{break}while(1){D=c[J>>2]|0;c[J>>2]=c[K>>2]|0;c[K>>2]=D;D=J+4|0;n=K-4|0;if(D>>>0<n>>>0){J=D;K=n}else{break L1882}}}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0}else{L=g+(e-b<<2)|0}c[h>>2]=L;if((a[m]&1)==0){i=l;return}ky(c[o+8>>2]|0);i=l;return}function gl(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2]|0;l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cj[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){if(q>>>0>1073741822){d4(0)}if(q>>>0<2){a[l]=q<<1&255;r=1;s=l+4|0}else{g=q+4&-4;e=ku(g<<2)|0;c[l+8>>2]=e;c[l>>2]=g|1;c[l+4>>2]=q;r=q;s=e}e=r;g=s;while(1){h=e-1|0;c[g>>2]=j;if((h|0)==0){break}else{e=h;g=g+4|0}}c[s+(q<<2)>>2]=0;g=c[m>>2]|0;e=l;if((a[e]&1)==0){t=l+4|0}else{t=c[l+8>>2]|0}if((cj[c[(c[g>>2]|0)+48>>2]&63](g,t,q)|0)==(q|0)){if((a[e]&1)==0){u=g;break}ky(c[l+8>>2]|0);u=g;break}c[m>>2]=0;c[b>>2]=0;if((a[e]&1)==0){i=k;return}ky(c[l+8>>2]|0);i=k;return}else{u=d}}while(0);d=n-o|0;o=d>>2;do{if((d|0)>0){if((cj[c[(c[u>>2]|0)+48>>2]&63](u,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=u;i=k;return}function gm(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;if(a[14968]|0){w=c[1170]|0}else{v=aX(1,1712,0)|0;c[1170]=v;a[14968]=1;w=v}v=f3(u,w,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==32){x=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){x=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){y=1676;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){y=1676;break}x=l+2|0}else{y=1676}}while(0);if((y|0)==1676){x=u}y=m|0;m=p|0;l=c[f+28>>2]|0;c[m>>2]=l;v=l+4|0;I=c[v>>2]|0,c[v>>2]=I+1,I;gk(u,x,j,y,n,o,p);p=c[m>>2]|0;m=p+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)!=0){z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gl(b,q,y,D,E,f,g);i=d;return}ce[c[(c[p>>2]|0)+8>>2]&511](p|0);z=e|0;A=c[z>>2]|0;C=q|0;c[C>>2]=A;D=c[n>>2]|0;E=c[o>>2]|0;gl(b,q,y,D,E,f,g);i=d;return}function gn(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[14968]|0){z=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;z=l}if(y){A=f9(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{A=f9(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[14968]|0;if(y){if(z){C=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;C=l}D=ga(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[1170]|0}else{z=aX(1,1712,0)|0;c[1170]=z;a[14968]=1;E=z}D=ga(m,E,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}z=b3(4)|0;c[z>>2]=5656;bv(z|0,11840,32)}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==32){J=A}else if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){J=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){K=1733;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){K=1733;break}J=H+2|0}else{K=1733}}while(0);if((K|0)==1733){J=H}do{if((H|0)==(k|0)){L=n|0;M=0;N=k}else{K=ko(F<<3)|0;D=K;if((K|0)!=0){L=D;M=D;N=c[m>>2]|0;break}D=b3(4)|0;c[D>>2]=5656;bv(D|0,11840,32)}}while(0);m=q|0;F=c[f+28>>2]|0;c[m>>2]=F;k=F+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;go(N,J,A,L,o,p,q);q=c[m>>2]|0;m=q+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q|0)}q=e|0;c[s>>2]=c[q>>2]|0;gl(r,s,L,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((M|0)!=0){kp(M)}if((G|0)==0){i=d;return}kp(G);i=d;return}function go(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3590]|0)!=-1){c[n>>2]=14360;c[n+4>>2]=12;c[n+8>>2]=0;d3(14360,n,96)}n=(c[3591]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b3(4)|0;s=r;c[s>>2]=5688;bv(r|0,11856,198)}r=k;s=c[p>>2]|0;if((c[3494]|0)!=-1){c[m>>2]=13976;c[m+4>>2]=12;c[m+8>>2]=0;d3(13976,m,96)}m=(c[3495]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b3(4)|0;u=t;c[u>>2]=5688;bv(t|0,11856,198)}t=s;cf[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cg[c[(c[k>>2]|0)+44>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+4|0;c[u>>2]=m;v=b+1|0}else{v=b}m=f;L2108:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=1793;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=1793;break}p=k;n=cg[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+4|0;c[q>>2]=n;n=v+2|0;q=cg[c[(c[p>>2]|0)+44>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4|0;c[u>>2]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L2108}u=a[q]|0;if(a[14968]|0){A=c[1170]|0}else{p=aX(1,1712,0)|0;c[1170]=p;a[14968]=1;A=p}if((bd(u<<24>>24|0,A|0)|0)==0){y=q;z=n;break L2108}else{q=q+1|0}}}else{w=v;x=1793}}while(0);L2123:do{if((x|0)==1793){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L2123}A=a[w]|0;if(a[14968]|0){B=c[1170]|0}else{q=aX(1,1712,0)|0;c[1170]=q;a[14968]=1;B=q}if((bX(A<<24>>24|0,B|0)|0)==0){y=w;z=v;break L2123}else{w=w+1|0;x=1793}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){C=v>>>1}else{C=c[o+4>>2]|0}L2138:do{if((C|0)==0){v=c[j>>2]|0;B=c[(c[k>>2]|0)+48>>2]|0;cs[B&15](r,z,y,v);c[j>>2]=(c[j>>2]|0)+(y-z<<2)|0}else{L2140:do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){D=z;E=v}else{break}while(1){v=a[D]|0;a[D]=a[E]|0;a[E]=v;v=D+1|0;B=E-1|0;if(v>>>0<B>>>0){D=v;E=B}else{break L2140}}}}while(0);B=ci[c[(c[s>>2]|0)+16>>2]&255](t)|0;L2146:do{if(z>>>0<y>>>0){v=x+1|0;A=o+4|0;q=o+8|0;n=k;u=0;p=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[q>>2]|0)+p|0]|0)>0){if((u|0)!=(a[(G?v:c[q>>2]|0)+p|0]|0|0)){H=p;I=u;break}J=c[j>>2]|0;c[j>>2]=J+4|0;c[J>>2]=B;J=d[w]|0;H=(p>>>0<(((J&1|0)==0?J>>>1:c[A>>2]|0)-1|0)>>>0&1)+p|0;I=0}else{H=p;I=u}}while(0);G=cg[c[(c[n>>2]|0)+44>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4|0;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){u=I+1|0;p=H;F=G}else{break L2146}}}}while(0);B=g+(z-b<<2)|0;F=c[j>>2]|0;if((B|0)==(F|0)){break}p=F-4|0;if(B>>>0<p>>>0){K=B;L=p}else{break}while(1){p=c[K>>2]|0;c[K>>2]=c[L>>2]|0;c[L>>2]=p;p=K+4|0;B=L-4|0;if(p>>>0<B>>>0){K=p;L=B}else{break L2138}}}}while(0);L2162:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cg[c[(c[L>>2]|0)+44>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+4|0;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L2162}}L=ci[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+4|0;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);cs[c[(c[k>>2]|0)+48>>2]&15](r,M,f,c[j>>2]|0);r=(c[j>>2]|0)+(m-M<<2)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r}else{N=g+(e-b<<2)|0}c[h>>2]=N;if((a[w]&1)==0){i=l;return}ky(c[o+8>>2]|0);i=l;return}function gp(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;if(a[14968]|0){z=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;z=l}if(y){A=f9(k,30,z,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{A=f9(k,30,z,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((A|0)>29){z=a[14968]|0;if(y){if(z){C=c[1170]|0}else{l=aX(1,1712,0)|0;c[1170]=l;a[14968]=1;C=l}D=ga(m,C,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2]|0,h[B+8>>3]=j,B)|0)|0}else{if(z){E=c[1170]|0}else{z=aX(1,1712,0)|0;c[1170]=z;a[14968]=1;E=z}D=ga(m,E,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}z=c[m>>2]|0;if((z|0)!=0){F=D;G=z;H=z;break}z=b3(4)|0;c[z>>2]=5656;bv(z|0,11840,32)}else{F=A;G=0;H=c[m>>2]|0}}while(0);A=H+F|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[H]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){J=H+1|0;break}if(!((F|0)>1&u<<24>>24==48)){K=1886;break}u=a[H+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){K=1886;break}J=H+2|0}else if((D|0)==32){J=A}else{K=1886}}while(0);if((K|0)==1886){J=H}do{if((H|0)==(k|0)){L=n|0;M=0;N=k}else{K=ko(F<<3)|0;D=K;if((K|0)!=0){L=D;M=D;N=c[m>>2]|0;break}D=b3(4)|0;c[D>>2]=5656;bv(D|0,11840,32)}}while(0);m=q|0;F=c[f+28>>2]|0;c[m>>2]=F;k=F+4|0;I=c[k>>2]|0,c[k>>2]=I+1,I;go(N,J,A,L,o,p,q);q=c[m>>2]|0;m=q+4|0;if(((I=c[m>>2]|0,c[m>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q|0)}q=e|0;c[s>>2]=c[q>>2]|0;gl(r,s,L,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((M|0)!=0){kp(M)}if((G|0)==0){i=d;return}kp(G);i=d;return}function gq(a){a=a|0;return}function gr(a){a=a|0;return 2}function gs(a){a=a|0;ky(a);return}function gt(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2]|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+8|0;c[k>>2]=c[d>>2]|0;c[l>>2]=c[e>>2]|0;gw(a,b,k,l,f,g,h,5448,5456);i=j;return}function gu(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=k|0;m=k+8|0;n=d+8|0;o=ci[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2]|0;c[m>>2]=c[f>>2]|0;f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}gw(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function gv(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+208|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+16|0;a[n]=a[5464]|0;a[n+1|0]=a[5465|0]|0;a[n+2|0]=a[5466|0]|0;a[n+3|0]=a[5467|0]|0;a[n+4|0]=a[5468|0]|0;a[n+5|0]=a[5469|0]|0;o=k|0;if(a[14968]|0){p=c[1170]|0}else{q=aX(1,1712,0)|0;c[1170]=q;a[14968]=1;p=q}q=f3(o,p,n,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+q|0;n=c[f+4>>2]&176;do{if((n|0)==32){r=h}else if((n|0)==16){p=a[o]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){r=k+1|0;break}if(!((q|0)>1&p<<24>>24==48)){s=1931;break}p=a[k+1|0]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){s=1931;break}r=k+2|0}else{s=1931}}while(0);if((s|0)==1931){r=o}s=c[f+28>>2]|0;n=s+4|0;I=c[n>>2]|0,c[n>>2]=I+1,I;if((c[3590]|0)!=-1){c[j>>2]=14360;c[j+4>>2]=12;c[j+8>>2]=0;d3(14360,j,96)}j=(c[3591]|0)-1|0;p=c[s+8>>2]|0;do{if((c[s+12>>2]|0)-p>>2>>>0>j>>>0){t=c[p+(j<<2)>>2]|0;if((t|0)==0){break}u=t;if(((I=c[n>>2]|0,c[n>>2]=I+ -1,I)|0)==0){ce[c[(c[s>>2]|0)+8>>2]&511](s)}v=l|0;w=c[(c[t>>2]|0)+48>>2]|0;cs[w&15](u,o,h,v);u=l+(q<<2)|0;if((r|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=m|0;c[A>>2]=z;gl(b,m,v,x,u,f,g);i=d;return}x=l+(r-k<<2)|0;y=e|0;z=c[y>>2]|0;A=m|0;c[A>>2]=z;gl(b,m,v,x,u,f,g);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function gw(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0;n=i;i=i+40|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2]|0;o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2]|0;o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=c[h+28>>2]|0;t=s+4|0;I=c[t>>2]|0,c[t>>2]=I+1,I;if((c[3592]|0)!=-1){c[o>>2]=14368;c[o+4>>2]=12;c[o+8>>2]=0;d3(14368,o,96)}o=(c[3593]|0)-1|0;u=c[s+8>>2]|0;do{if((c[s+12>>2]|0)-u>>2>>>0>o>>>0){v=c[u+(o<<2)>>2]|0;if((v|0)==0){break}w=v;if(((I=c[t>>2]|0,c[t>>2]=I+ -1,I)|0)==0){ce[c[(c[s>>2]|0)+8>>2]&511](s)}c[j>>2]=0;x=f|0;L2316:do{if((l|0)==(m|0)){y=2018}else{z=g|0;A=v;B=v+8|0;C=v;D=e;E=q|0;F=r|0;G=p|0;H=l;J=0;L2318:while(1){K=J;while(1){if((K|0)!=0){y=2018;break L2316}L=c[x>>2]|0;do{if((L|0)==0){M=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){M=L;break}if((ci[c[(c[L>>2]|0)+36>>2]&255](L)|0)!=-1){M=L;break}c[x>>2]=0;M=0}}while(0);L=(M|0)==0;N=c[z>>2]|0;L2328:do{if((N|0)==0){y=1969}else{do{if((c[N+12>>2]|0)==(c[N+16>>2]|0)){if((ci[c[(c[N>>2]|0)+36>>2]&255](N)|0)!=-1){break}c[z>>2]=0;y=1969;break L2328}}while(0);if(L){O=N}else{y=1970;break L2318}}}while(0);if((y|0)==1969){y=0;if(L){y=1970;break L2318}else{O=0}}if(cj[c[(c[A>>2]|0)+36>>2]&63](w,a[H]|0,0)<<24>>24==37){y=1975;break}N=a[H]|0;if(N<<24>>24>-1){P=c[B>>2]|0;if((b[P+(N<<24>>24<<1)>>1]&8192)!=0){Q=H;y=1986;break}}R=M+12|0;N=c[R>>2]|0;S=M+16|0;if((N|0)==(c[S>>2]|0)){T=ci[c[(c[M>>2]|0)+36>>2]&255](M)&255}else{T=a[N]|0}N=cg[c[(c[C>>2]|0)+12>>2]&63](w,T)|0;if(N<<24>>24==cg[c[(c[C>>2]|0)+12>>2]&63](w,a[H]|0)<<24>>24){y=2013;break}c[j>>2]=4;K=4}L2346:do{if((y|0)==1986){while(1){y=0;K=Q+1|0;if((K|0)==(m|0)){U=m;break}N=a[K]|0;if(N<<24>>24<=-1){U=K;break}if((b[P+(N<<24>>24<<1)>>1]&8192)==0){U=K;break}else{Q=K;y=1986}}L=M;K=O;while(1){do{if((L|0)==0){V=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){V=L;break}if((ci[c[(c[L>>2]|0)+36>>2]&255](L)|0)!=-1){V=L;break}c[x>>2]=0;V=0}}while(0);N=(V|0)==0;do{if((K|0)==0){y=1999}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){if(N){W=K;break}else{X=U;break L2346}}if((ci[c[(c[K>>2]|0)+36>>2]&255](K)|0)==-1){c[z>>2]=0;y=1999;break}else{if(N^(K|0)==0){W=K;break}else{X=U;break L2346}}}}while(0);if((y|0)==1999){y=0;if(N){X=U;break L2346}else{W=0}}Y=V+12|0;Z=c[Y>>2]|0;_=V+16|0;if((Z|0)==(c[_>>2]|0)){$=ci[c[(c[V>>2]|0)+36>>2]&255](V)&255}else{$=a[Z]|0}if($<<24>>24<=-1){X=U;break L2346}if((b[(c[B>>2]|0)+($<<24>>24<<1)>>1]&8192)==0){X=U;break L2346}Z=c[Y>>2]|0;if((Z|0)==(c[_>>2]|0)){_=c[(c[V>>2]|0)+40>>2]|0;ci[_&255](V);L=V;K=W;continue}else{c[Y>>2]=Z+1|0;L=V;K=W;continue}}}else if((y|0)==1975){y=0;K=H+1|0;if((K|0)==(m|0)){y=1976;break L2318}L=cj[c[(c[A>>2]|0)+36>>2]&63](w,a[K]|0,0)|0;if((L<<24>>24|0)==69|(L<<24>>24|0)==48){Z=H+2|0;if((Z|0)==(m|0)){y=1979;break L2318}aa=L;ab=cj[c[(c[A>>2]|0)+36>>2]&63](w,a[Z]|0,0)|0;ac=Z}else{aa=0;ab=L;ac=K}K=c[(c[D>>2]|0)+36>>2]|0;c[E>>2]=M;c[F>>2]=O;cp[K&7](p,e,q,r,h,j,k,ab,aa);c[x>>2]=c[G>>2]|0;X=ac+1|0}else if((y|0)==2013){y=0;K=c[R>>2]|0;if((K|0)==(c[S>>2]|0)){L=c[(c[M>>2]|0)+40>>2]|0;ci[L&255](M)}else{c[R>>2]=K+1|0}X=H+1|0}}while(0);if((X|0)==(m|0)){y=2018;break L2316}H=X;J=c[j>>2]|0}if((y|0)==1976){c[j>>2]=4;ad=M;break}else if((y|0)==1979){c[j>>2]=4;ad=M;break}else if((y|0)==1970){c[j>>2]=4;ad=M;break}}}while(0);if((y|0)==2018){ad=c[x>>2]|0}w=f|0;do{if((ad|0)!=0){if((c[ad+12>>2]|0)!=(c[ad+16>>2]|0)){break}if((ci[c[(c[ad>>2]|0)+36>>2]&255](ad)|0)!=-1){break}c[w>>2]=0}}while(0);x=c[w>>2]|0;v=(x|0)==0;J=g|0;H=c[J>>2]|0;L2404:do{if((H|0)==0){y=2028}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((ci[c[(c[H>>2]|0)+36>>2]&255](H)|0)!=-1){break}c[J>>2]=0;y=2028;break L2404}}while(0);if(!v){break}ae=d|0;c[ae>>2]=x;i=n;return}}while(0);do{if((y|0)==2028){if(v){break}ae=d|0;c[ae>>2]=x;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ae=d|0;c[ae>>2]=x;i=n;return}}while(0);n=b3(4)|0;c[n>>2]=5688;bv(n|0,11856,198)}function gx(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+24|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2]|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+8|0;m=c[f+28>>2]|0;f=m+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3592]|0)!=-1){c[l>>2]=14368;c[l+4>>2]=12;c[l+8>>2]=0;d3(14368,l,96)}l=(c[3593]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[m>>2]|0)+8>>2]&511](m)}p=c[e>>2]|0;q=b+8|0;r=ci[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=p;p=(fm(d,k,r,r+168|0,o,g,0)|0)-r|0;if((p|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((p|0)/12&-1|0)%7;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}function gy(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+24|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2]|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+8|0;m=c[f+28>>2]|0;f=m+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3592]|0)!=-1){c[l>>2]=14368;c[l+4>>2]=12;c[l+8>>2]=0;d3(14368,l,96)}l=(c[3593]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[m>>2]|0)+8>>2]&511](m)}p=c[e>>2]|0;q=b+8|0;r=ci[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=p;p=(fm(d,k,r,r+288|0,o,g,0)|0)-r|0;if((p|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((p|0)/12&-1|0)%12;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}function gz(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+24|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2]|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=b|0;k=b+8|0;l=c[f+28>>2]|0;f=l+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3592]|0)!=-1){c[k>>2]=14368;c[k+4>>2]=12;c[k+8>>2]=0;d3(14368,k,96)}k=(c[3593]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[l>>2]|0)+8>>2]&511](l)}c[j>>2]=c[e>>2]|0;o=gE(d,j,g,n,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((o|0)<69){s=o+2e3|0}else{s=(o-69|0)>>>0<31?o+1900|0:o}c[h+20>>2]=s-1900|0;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=b3(4)|0;c[b>>2]=5688;bv(b|0,11856,198)}function gA(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+320|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2]|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;M=l+208|0;N=l+216|0;O=l+224|0;P=l+232|0;Q=l+240|0;R=l+248|0;S=l+256|0;T=l+264|0;U=l+272|0;V=l+280|0;W=l+288|0;X=l+296|0;Y=l+304|0;Z=l+312|0;c[h>>2]=0;_=c[g+28>>2]|0;$=_+4|0;I=c[$>>2]|0,c[$>>2]=I+1,I;if((c[3592]|0)!=-1){c[y>>2]=14368;c[y+4>>2]=12;c[y+8>>2]=0;d3(14368,y,96)}y=(c[3593]|0)-1|0;aa=c[_+8>>2]|0;do{if((c[_+12>>2]|0)-aa>>2>>>0>y>>>0){ab=c[aa+(y<<2)>>2]|0;if((ab|0)==0){break}ac=ab;if(((I=c[$>>2]|0,c[$>>2]=I+ -1,I)|0)==0){ce[c[(c[_>>2]|0)+8>>2]&511](_)}ab=k<<24>>24;L2480:do{if((ab|0)==84){ad=e|0;c[S>>2]=c[ad>>2]|0;c[T>>2]=c[f>>2]|0;gw(R,d,S,T,g,h,j,5400,5408);c[ad>>2]=c[R>>2]|0}else if((ab|0)==119){c[o>>2]=c[f>>2]|0;ad=gE(e,o,h,ac,1)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ad|0)<7){c[j+24>>2]=ad;break}else{c[h>>2]=ae|4;break}}else if((ab|0)==110|(ab|0)==116){c[J>>2]=c[f>>2]|0;gB(0,e,J,h,ac)}else if((ab|0)==114){ae=e|0;c[M>>2]=c[ae>>2]|0;c[N>>2]=c[f>>2]|0;gw(L,d,M,N,g,h,j,5416,5427);c[ae>>2]=c[L>>2]|0}else if((ab|0)==70){ae=e|0;c[G>>2]=c[ae>>2]|0;c[H>>2]=c[f>>2]|0;gw(F,d,G,H,g,h,j,5432,5440);c[ae>>2]=c[F>>2]|0}else if((ab|0)==88){ae=d+8|0;ad=ci[c[(c[ae>>2]|0)+24>>2]&255](ae)|0;ae=e|0;c[X>>2]=c[ae>>2]|0;c[Y>>2]=c[f>>2]|0;af=ad;ag=a[ad]|0;if((ag&1)==0){ah=af+1|0;ai=af+1|0}else{af=c[ad+8>>2]|0;ah=af;ai=af}af=ag&255;if((af&1|0)==0){aj=af>>>1}else{aj=c[ad+4>>2]|0}gw(W,d,X,Y,g,h,j,ai,ah+aj|0);c[ae>>2]=c[W>>2]|0}else if((ab|0)==82){ae=e|0;c[P>>2]=c[ae>>2]|0;c[Q>>2]=c[f>>2]|0;gw(O,d,P,Q,g,h,j,5408,5413);c[ae>>2]=c[O>>2]|0}else if((ab|0)==83){c[p>>2]=c[f>>2]|0;ae=gE(e,p,h,ac,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ae|0)<61){c[j>>2]=ae;break}else{c[h>>2]=ad|4;break}}else if((ab|0)==99){ad=d+8|0;ae=ci[c[(c[ad>>2]|0)+12>>2]&255](ad)|0;ad=e|0;c[A>>2]=c[ad>>2]|0;c[B>>2]=c[f>>2]|0;af=ae;ag=a[ae]|0;if((ag&1)==0){ak=af+1|0;al=af+1|0}else{af=c[ae+8>>2]|0;ak=af;al=af}af=ag&255;if((af&1|0)==0){am=af>>>1}else{am=c[ae+4>>2]|0}gw(z,d,A,B,g,h,j,al,ak+am|0);c[ad>>2]=c[z>>2]|0}else if((ab|0)==109){c[r>>2]=c[f>>2]|0;ad=(gE(e,r,h,ac,2)|0)-1|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ad|0)<12){c[j+16>>2]=ad;break}else{c[h>>2]=ae|4;break}}else if((ab|0)==106){c[s>>2]=c[f>>2]|0;ae=gE(e,s,h,ac,3)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ae|0)<366){c[j+28>>2]=ae;break}else{c[h>>2]=ad|4;break}}else if((ab|0)==100|(ab|0)==101){ad=j+12|0;c[v>>2]=c[f>>2]|0;ae=gE(e,v,h,ac,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ae-1|0)>>>0>=31){break}c[ad>>2]=ae;break L2480}}while(0);c[h>>2]=af|4}else if((ab|0)==112){c[K>>2]=c[f>>2]|0;gC(d,j+8|0,e,K,h,ac)}else if((ab|0)==98|(ab|0)==66|(ab|0)==104){ae=c[f>>2]|0;ad=d+8|0;ag=ci[c[(c[ad>>2]|0)+4>>2]&255](ad)|0;c[w>>2]=ae;ae=(fm(e,w,ag,ag+288|0,ac,h,0)|0)-ag|0;if((ae|0)>=288){break}c[j+16>>2]=((ae|0)/12&-1|0)%12}else if((ab|0)==73){ae=j+8|0;c[t>>2]=c[f>>2]|0;ag=gE(e,t,h,ac,2)|0;ad=c[h>>2]|0;do{if((ad&4|0)==0){if((ag-1|0)>>>0>=12){break}c[ae>>2]=ag;break L2480}}while(0);c[h>>2]=ad|4}else if((ab|0)==97|(ab|0)==65){ag=c[f>>2]|0;ae=d+8|0;af=ci[c[c[ae>>2]>>2]&255](ae)|0;c[x>>2]=ag;ag=(fm(e,x,af,af+168|0,ac,h,0)|0)-af|0;if((ag|0)>=168){break}c[j+24>>2]=((ag|0)/12&-1|0)%7}else if((ab|0)==77){c[q>>2]=c[f>>2]|0;ag=gE(e,q,h,ac,2)|0;af=c[h>>2]|0;if((af&4|0)==0&(ag|0)<60){c[j+4>>2]=ag;break}else{c[h>>2]=af|4;break}}else if((ab|0)==120){af=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2]|0;c[V>>2]=c[f>>2]|0;cd[af&127](b,d,U,V,g,h,j);i=l;return}else if((ab|0)==72){c[u>>2]=c[f>>2]|0;af=gE(e,u,h,ac,2)|0;ag=c[h>>2]|0;if((ag&4|0)==0&(af|0)<24){c[j+8>>2]=af;break}else{c[h>>2]=ag|4;break}}else if((ab|0)==89){c[m>>2]=c[f>>2]|0;ag=gE(e,m,h,ac,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ag-1900|0}else if((ab|0)==37){c[Z>>2]=c[f>>2]|0;gD(0,e,Z,h,ac)}else if((ab|0)==121){c[n>>2]=c[f>>2]|0;ag=gE(e,n,h,ac,4)|0;if((c[h>>2]&4|0)!=0){break}if((ag|0)<69){an=ag+2e3|0}else{an=(ag-69|0)>>>0<31?ag+1900|0:ag}c[j+20>>2]=an-1900|0}else if((ab|0)==68){ag=e|0;c[D>>2]=c[ag>>2]|0;c[E>>2]=c[f>>2]|0;gw(C,d,D,E,g,h,j,5440,5448);c[ag>>2]=c[C>>2]|0}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2]|0;i=l;return}}while(0);l=b3(4)|0;c[l>>2]=5688;bv(l|0,11856,198)}function gB(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2]|0;j=e|0;e=f|0;f=h+8|0;L2561:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((ci[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L2570:do{if((l|0)==0){m=2173}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((ci[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[e>>2]=0;m=2173;break L2570}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L2561}}}while(0);if((m|0)==2173){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=ci[c[(c[l>>2]|0)+36>>2]&255](l)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;ci[u&255](r);continue}else{c[l>>2]=t+1|0;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((ci[c[(c[o>>2]|0)+36>>2]&255](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=2192}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((ci[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[e>>2]=0;m=2192;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==2192){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function gC(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2]|0;k=j|0;l=a+8|0;a=ci[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2]|0;f=fm(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12|0;i=j;return}function gD(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2]|0;h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((ci[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L2644:do{if((e|0)==0){k=2230}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((ci[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[j>>2]=0;k=2230;break L2644}}while(0);if(d){l=e;m=0}else{k=2231}}}while(0);if((k|0)==2230){if(d){k=2231}else{l=0;m=1}}if((k|0)==2231){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=ci[c[(c[d>>2]|0)+36>>2]&255](d)&255}else{n=a[e]|0}if(cj[c[(c[g>>2]|0)+36>>2]&63](g,n,0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;ci[d&255](n)}else{c[g>>2]=e+1|0}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((ci[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=2250}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((ci[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[j>>2]=0;k=2250;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==2250){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function gE(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((ci[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L2698:do{if((e|0)==0){m=2270}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((ci[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[l>>2]=0;m=2270;break L2698}}while(0);if(d){n=e}else{m=2271}}}while(0);if((m|0)==2270){if(d){m=2271}else{n=0}}if((m|0)==2271){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=ci[c[(c[d>>2]|0)+36>>2]&255](d)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=cj[c[(c[d>>2]|0)+36>>2]&63](g,p,0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;ci[u&255](r);v=q;w=h;x=n}else{c[s>>2]=t+1|0;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((ci[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((ci[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=2300;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=ci[c[(c[A>>2]|0)+36>>2]&255](A)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=2314;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=2313;break}s=(cj[c[(c[d>>2]|0)+36>>2]&63](g,E,0)<<24>>24)+(y*10&-1)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;ci[G&255](r);v=s;w=q;x=B;continue}else{c[u>>2]=F+1|0;v=s;w=q;x=B;continue}}if((m|0)==2300){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((ci[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L2755:do{if(D){m=2310}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((ci[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[l>>2]=0;m=2310;break L2755}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==2310){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}else if((m|0)==2313){i=j;return o|0}else if((m|0)==2314){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function gF(a){a=a|0;return}function gG(a){a=a|0;return 2}function gH(a){a=a|0;ky(a);return}function gI(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2]|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+8|0;c[k>>2]=c[d>>2]|0;c[l>>2]=c[e>>2]|0;gK(a,b,k,l,f,g,h,5368,5400);i=j;return}function gJ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=k|0;m=k+8|0;n=d+8|0;o=ci[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2]|0;c[m>>2]=c[f>>2]|0;f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}gK(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function gK(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0;l=i;i=i+40|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2]|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2]|0;m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=c[f+28>>2]|0;r=q+4|0;I=c[r>>2]|0,c[r>>2]=I+1,I;if((c[3590]|0)!=-1){c[m>>2]=14360;c[m+4>>2]=12;c[m+8>>2]=0;d3(14360,m,96)}m=(c[3591]|0)-1|0;s=c[q+8>>2]|0;do{if((c[q+12>>2]|0)-s>>2>>>0>m>>>0){t=c[s+(m<<2)>>2]|0;if((t|0)==0){break}u=t;if(((I=c[r>>2]|0,c[r>>2]=I+ -1,I)|0)==0){ce[c[(c[q>>2]|0)+8>>2]&511](q)}c[g>>2]=0;v=d|0;L2794:do{if((j|0)==(k|0)){w=2405}else{x=e|0;y=t;z=t;A=t;B=b;C=o|0;D=p|0;E=n|0;F=j;G=0;L2796:while(1){H=G;while(1){if((H|0)!=0){w=2405;break L2794}J=c[v>>2]|0;do{if((J|0)==0){K=0}else{L=c[J+12>>2]|0;if((L|0)==(c[J+16>>2]|0)){M=ci[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{M=c[L>>2]|0}if((M|0)!=-1){K=J;break}c[v>>2]=0;K=0}}while(0);J=(K|0)==0;L=c[x>>2]|0;do{if((L|0)==0){w=2355}else{N=c[L+12>>2]|0;if((N|0)==(c[L+16>>2]|0)){O=ci[c[(c[L>>2]|0)+36>>2]&255](L)|0}else{O=c[N>>2]|0}if((O|0)==-1){c[x>>2]=0;w=2355;break}else{if(J^(L|0)==0){P=L;break}else{w=2357;break L2796}}}}while(0);if((w|0)==2355){w=0;if(J){w=2357;break L2796}else{P=0}}if(cj[c[(c[y>>2]|0)+52>>2]&63](u,c[F>>2]|0,0)<<24>>24==37){w=2362;break}if(cj[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[F>>2]|0)|0){Q=F;w=2372;break}R=K+12|0;L=c[R>>2]|0;S=K+16|0;if((L|0)==(c[S>>2]|0)){T=ci[c[(c[K>>2]|0)+36>>2]&255](K)|0}else{T=c[L>>2]|0}L=cg[c[(c[A>>2]|0)+28>>2]&63](u,T)|0;if((L|0)==(cg[c[(c[A>>2]|0)+28>>2]&63](u,c[F>>2]|0)|0)){w=2400;break}c[g>>2]=4;H=4}L2828:do{if((w|0)==2400){w=0;H=c[R>>2]|0;if((H|0)==(c[S>>2]|0)){L=c[(c[K>>2]|0)+40>>2]|0;ci[L&255](K)}else{c[R>>2]=H+4|0}U=F+4|0}else if((w|0)==2362){w=0;H=F+4|0;if((H|0)==(k|0)){w=2363;break L2796}L=cj[c[(c[y>>2]|0)+52>>2]&63](u,c[H>>2]|0,0)|0;if((L<<24>>24|0)==69|(L<<24>>24|0)==48){N=F+8|0;if((N|0)==(k|0)){w=2366;break L2796}V=L;W=cj[c[(c[y>>2]|0)+52>>2]&63](u,c[N>>2]|0,0)|0;X=N}else{V=0;W=L;X=H}H=c[(c[B>>2]|0)+36>>2]|0;c[C>>2]=K;c[D>>2]=P;cp[H&7](n,b,o,p,f,g,h,W,V);c[v>>2]=c[E>>2]|0;U=X+4|0}else if((w|0)==2372){while(1){w=0;H=Q+4|0;if((H|0)==(k|0)){Y=k;break}if(cj[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[H>>2]|0)|0){Q=H;w=2372}else{Y=H;break}}J=K;H=P;while(1){do{if((J|0)==0){Z=0}else{L=c[J+12>>2]|0;if((L|0)==(c[J+16>>2]|0)){_=ci[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{_=c[L>>2]|0}if((_|0)!=-1){Z=J;break}c[v>>2]=0;Z=0}}while(0);L=(Z|0)==0;do{if((H|0)==0){w=2387}else{N=c[H+12>>2]|0;if((N|0)==(c[H+16>>2]|0)){$=ci[c[(c[H>>2]|0)+36>>2]&255](H)|0}else{$=c[N>>2]|0}if(($|0)==-1){c[x>>2]=0;w=2387;break}else{if(L^(H|0)==0){aa=H;break}else{U=Y;break L2828}}}}while(0);if((w|0)==2387){w=0;if(L){U=Y;break L2828}else{aa=0}}N=Z+12|0;ab=c[N>>2]|0;ac=Z+16|0;if((ab|0)==(c[ac>>2]|0)){ad=ci[c[(c[Z>>2]|0)+36>>2]&255](Z)|0}else{ad=c[ab>>2]|0}if(!(cj[c[(c[z>>2]|0)+12>>2]&63](u,8192,ad)|0)){U=Y;break L2828}ab=c[N>>2]|0;if((ab|0)==(c[ac>>2]|0)){ac=c[(c[Z>>2]|0)+40>>2]|0;ci[ac&255](Z);J=Z;H=aa;continue}else{c[N>>2]=ab+4|0;J=Z;H=aa;continue}}}}while(0);if((U|0)==(k|0)){w=2405;break L2794}F=U;G=c[g>>2]|0}if((w|0)==2357){c[g>>2]=4;ae=K;break}else if((w|0)==2366){c[g>>2]=4;ae=K;break}else if((w|0)==2363){c[g>>2]=4;ae=K;break}}}while(0);if((w|0)==2405){ae=c[v>>2]|0}u=d|0;do{if((ae|0)!=0){t=c[ae+12>>2]|0;if((t|0)==(c[ae+16>>2]|0)){af=ci[c[(c[ae>>2]|0)+36>>2]&255](ae)|0}else{af=c[t>>2]|0}if((af|0)!=-1){break}c[u>>2]=0}}while(0);v=c[u>>2]|0;t=(v|0)==0;G=e|0;F=c[G>>2]|0;do{if((F|0)==0){w=2418}else{z=c[F+12>>2]|0;if((z|0)==(c[F+16>>2]|0)){ag=ci[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{ag=c[z>>2]|0}if((ag|0)==-1){c[G>>2]=0;w=2418;break}if(!(t^(F|0)==0)){break}ah=a|0;c[ah>>2]=v;i=l;return}}while(0);do{if((w|0)==2418){if(t){break}ah=a|0;c[ah>>2]=v;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ah=a|0;c[ah>>2]=v;i=l;return}}while(0);l=b3(4)|0;c[l>>2]=5688;bv(l|0,11856,198)}function gL(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+24|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2]|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+8|0;m=c[f+28>>2]|0;f=m+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3590]|0)!=-1){c[l>>2]=14360;c[l+4>>2]=12;c[l+8>>2]=0;d3(14360,l,96)}l=(c[3591]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[m>>2]|0)+8>>2]&511](m)}p=c[e>>2]|0;q=b+8|0;r=ci[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=p;p=(fN(d,k,r,r+168|0,o,g,0)|0)-r|0;if((p|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((p|0)/12&-1|0)%7;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}function gM(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+24|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2]|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2]|0;k=j|0;l=j+8|0;m=c[f+28>>2]|0;f=m+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3590]|0)!=-1){c[l>>2]=14360;c[l+4>>2]=12;c[l+8>>2]=0;d3(14360,l,96)}l=(c[3591]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[m>>2]|0)+8>>2]&511](m)}p=c[e>>2]|0;q=b+8|0;r=ci[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=p;p=(fN(d,k,r,r+288|0,o,g,0)|0)-r|0;if((p|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((p|0)/12&-1|0)%12;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b3(4)|0;c[j>>2]=5688;bv(j|0,11856,198)}function gN(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+24|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2]|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2]|0;j=b|0;k=b+8|0;l=c[f+28>>2]|0;f=l+4|0;I=c[f>>2]|0,c[f>>2]=I+1,I;if((c[3590]|0)!=-1){c[k>>2]=14360;c[k+4>>2]=12;c[k+8>>2]=0;d3(14360,k,96)}k=(c[3591]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}if(((I=c[f>>2]|0,c[f>>2]=I+ -1,I)|0)==0){ce[c[(c[l>>2]|0)+8>>2]&511](l)}c[j>>2]=c[e>>2]|0;o=gS(d,j,g,n,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((o|0)<69){s=o+2e3|0}else{s=(o-69|0)>>>0<31?o+1900|0:o}c[h+20>>2]=s-1900|0;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=b3(4)|0;c[b>>2]=5688;bv(b|0,11856,198)}function gO(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+320|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2]|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;M=l+208|0;N=l+216|0;O=l+224|0;P=l+232|0;Q=l+240|0;R=l+248|0;S=l+256|0;T=l+264|0;U=l+272|0;V=l+280|0;W=l+288|0;X=l+296|0;Y=l+304|0;Z=l+312|0;c[h>>2]=0;_=c[g+28>>2]|0;$=_+4|0;I=c[$>>2]|0,c[$>>2]=I+1,I;if((c[3590]|0)!=-1){c[y>>2]=14360;c[y+4>>2]=12;c[y+8>>2]=0;d3(14360,y,96)}y=(c[3591]|0)-1|0;aa=c[_+8>>2]|0;do{if((c[_+12>>2]|0)-aa>>2>>>0>y>>>0){ab=c[aa+(y<<2)>>2]|0;if((ab|0)==0){break}ac=ab;if(((I=c[$>>2]|0,c[$>>2]=I+ -1,I)|0)==0){ce[c[(c[_>>2]|0)+8>>2]&511](_)}ab=k<<24>>24;L2970:do{if((ab|0)==120){ad=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2]|0;c[V>>2]=c[f>>2]|0;cd[ad&127](b,d,U,V,g,h,j);i=l;return}else if((ab|0)==88){ad=d+8|0;ae=ci[c[(c[ad>>2]|0)+24>>2]&255](ad)|0;ad=e|0;c[X>>2]=c[ad>>2]|0;c[Y>>2]=c[f>>2]|0;af=a[ae]|0;if((af&1)==0){ag=ae+4|0;ah=ae+4|0}else{ai=c[ae+8>>2]|0;ag=ai;ah=ai}ai=af&255;if((ai&1|0)==0){aj=ai>>>1}else{aj=c[ae+4>>2]|0}gK(W,d,X,Y,g,h,j,ah,ag+(aj<<2)|0);c[ad>>2]=c[W>>2]|0}else if((ab|0)==70){ad=e|0;c[G>>2]=c[ad>>2]|0;c[H>>2]=c[f>>2]|0;gK(F,d,G,H,g,h,j,5200,5232);c[ad>>2]=c[F>>2]|0}else if((ab|0)==99){ad=d+8|0;ae=ci[c[(c[ad>>2]|0)+12>>2]&255](ad)|0;ad=e|0;c[A>>2]=c[ad>>2]|0;c[B>>2]=c[f>>2]|0;ai=a[ae]|0;if((ai&1)==0){ak=ae+4|0;al=ae+4|0}else{af=c[ae+8>>2]|0;ak=af;al=af}af=ai&255;if((af&1|0)==0){am=af>>>1}else{am=c[ae+4>>2]|0}gK(z,d,A,B,g,h,j,al,ak+(am<<2)|0);c[ad>>2]=c[z>>2]|0}else if((ab|0)==68){ad=e|0;c[D>>2]=c[ad>>2]|0;c[E>>2]=c[f>>2]|0;gK(C,d,D,E,g,h,j,5336,5368);c[ad>>2]=c[C>>2]|0}else if((ab|0)==72){c[u>>2]=c[f>>2]|0;ad=gS(e,u,h,ac,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ad|0)<24){c[j+8>>2]=ad;break}else{c[h>>2]=ae|4;break}}else if((ab|0)==84){ae=e|0;c[S>>2]=c[ae>>2]|0;c[T>>2]=c[f>>2]|0;gK(R,d,S,T,g,h,j,5232,5264);c[ae>>2]=c[R>>2]|0}else if((ab|0)==73){ae=j+8|0;c[t>>2]=c[f>>2]|0;ad=gS(e,t,h,ac,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ad-1|0)>>>0>=12){break}c[ae>>2]=ad;break L2970}}while(0);c[h>>2]=af|4}else if((ab|0)==114){ad=e|0;c[M>>2]=c[ad>>2]|0;c[N>>2]=c[f>>2]|0;gK(L,d,M,N,g,h,j,5288,5332);c[ad>>2]=c[L>>2]|0}else if((ab|0)==82){ad=e|0;c[P>>2]=c[ad>>2]|0;c[Q>>2]=c[f>>2]|0;gK(O,d,P,Q,g,h,j,5264,5284);c[ad>>2]=c[O>>2]|0}else if((ab|0)==83){c[p>>2]=c[f>>2]|0;ad=gS(e,p,h,ac,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ad|0)<61){c[j>>2]=ad;break}else{c[h>>2]=ae|4;break}}else if((ab|0)==110|(ab|0)==116){c[J>>2]=c[f>>2]|0;gP(0,e,J,h,ac)}else if((ab|0)==112){c[K>>2]=c[f>>2]|0;gQ(d,j+8|0,e,K,h,ac)}else if((ab|0)==97|(ab|0)==65){ae=c[f>>2]|0;ad=d+8|0;ai=ci[c[c[ad>>2]>>2]&255](ad)|0;c[x>>2]=ae;ae=(fN(e,x,ai,ai+168|0,ac,h,0)|0)-ai|0;if((ae|0)>=168){break}c[j+24>>2]=((ae|0)/12&-1|0)%7}else if((ab|0)==98|(ab|0)==66|(ab|0)==104){ae=c[f>>2]|0;ai=d+8|0;ad=ci[c[(c[ai>>2]|0)+4>>2]&255](ai)|0;c[w>>2]=ae;ae=(fN(e,w,ad,ad+288|0,ac,h,0)|0)-ad|0;if((ae|0)>=288){break}c[j+16>>2]=((ae|0)/12&-1|0)%12}else if((ab|0)==121){c[n>>2]=c[f>>2]|0;ae=gS(e,n,h,ac,4)|0;if((c[h>>2]&4|0)!=0){break}if((ae|0)<69){an=ae+2e3|0}else{an=(ae-69|0)>>>0<31?ae+1900|0:ae}c[j+20>>2]=an-1900|0}else if((ab|0)==109){c[r>>2]=c[f>>2]|0;ae=(gS(e,r,h,ac,2)|0)-1|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ae|0)<12){c[j+16>>2]=ae;break}else{c[h>>2]=ad|4;break}}else if((ab|0)==37){c[Z>>2]=c[f>>2]|0;gR(0,e,Z,h,ac)}else if((ab|0)==100|(ab|0)==101){ad=j+12|0;c[v>>2]=c[f>>2]|0;ae=gS(e,v,h,ac,2)|0;ai=c[h>>2]|0;do{if((ai&4|0)==0){if((ae-1|0)>>>0>=31){break}c[ad>>2]=ae;break L2970}}while(0);c[h>>2]=ai|4}else if((ab|0)==106){c[s>>2]=c[f>>2]|0;ae=gS(e,s,h,ac,3)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ae|0)<366){c[j+28>>2]=ae;break}else{c[h>>2]=ad|4;break}}else if((ab|0)==77){c[q>>2]=c[f>>2]|0;ad=gS(e,q,h,ac,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ad|0)<60){c[j+4>>2]=ad;break}else{c[h>>2]=ae|4;break}}else if((ab|0)==119){c[o>>2]=c[f>>2]|0;ae=gS(e,o,h,ac,1)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ae|0)<7){c[j+24>>2]=ae;break}else{c[h>>2]=ad|4;break}}else if((ab|0)==89){c[m>>2]=c[f>>2]|0;ad=gS(e,m,h,ac,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ad-1900|0}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2]|0;i=l;return}}while(0);l=b3(4)|0;c[l>>2]=5688;bv(l|0,11856,198)}
function gP(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2]|0;g=b|0;b=d|0;d=f;L3051:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=ci[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=2567}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=ci[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=2567;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L3051}}}}while(0);if((m|0)==2567){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=ci[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{s=c[k>>2]|0}if(!(cj[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;ci[u&255](k);continue}else{c[h>>2]=t+4|0;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=ci[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=2589}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=ci[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=2589;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==2589){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function gQ(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2]|0;k=j|0;l=a+8|0;a=ci[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2]|0;f=fN(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12|0;i=j;return}function gR(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2]|0;g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=ci[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=2629}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=ci[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=2629;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=2631;break}}}}while(0);if((l|0)==2629){if(h){l=2631}else{n=0;o=1}}if((l|0)==2631){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=ci[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{p=c[d>>2]|0}if(cj[c[(c[f>>2]|0)+52>>2]&63](f,p,0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;ci[h&255](p)}else{c[f>>2]=d+4|0}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=ci[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=2653}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=ci[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=2653;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==2653){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function gS(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2]|0;h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=ci[c[(c[a>>2]|0)+36>>2]&255](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=2675}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=ci[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=2675;break}else{if(j^(b|0)==0){o=b;break}else{m=2677;break}}}}while(0);if((m|0)==2675){if(j){m=2677}else{o=0}}if((m|0)==2677){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=ci[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{q=c[b>>2]|0}b=e;if(!(cj[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=cj[c[(c[j>>2]|0)+52>>2]&63](e,q,0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;ci[r&255](q);s=n;t=f;u=o}else{c[a>>2]=k+4|0;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=ci[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=ci[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=ci[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{D=c[f>>2]|0}if(!(cj[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=2727;break}f=(cj[c[(c[j>>2]|0)+52>>2]&63](e,D,0)<<24>>24)+(v*10&-1)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;ci[q&255](n);s=f;t=o;u=z;continue}else{c[k>>2]=a+4|0;s=f;t=o;u=z;continue}}if((m|0)==2727){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=ci[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=2721}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=2721;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==2721){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function gT(a){a=a|0;var b=0,d=0;b=a;d=c[a+8>>2]|0;if((d|0)==0){ky(b);return}bi(d|0);ky(b);return}function gU(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)==0){return}bi(b|0);return}function gV(a){a=a|0;return}function gW(a){a=a|0;return 127}function gX(a){a=a|0;return 127}function gY(a){a=a|0;return 0}function gZ(a){a=a|0;return}function g_(a){a=a|0;return 127}function g$(a){a=a|0;return 127}function g0(a){a=a|0;return 0}function g1(a){a=a|0;return}function g2(a){a=a|0;return 2147483647}function g3(a){a=a|0;return 2147483647}function g4(a){a=a|0;return 0}function g5(a){a=a|0;return}function g6(a){a=a|0;return 2147483647}function g7(a){a=a|0;return 2147483647}function g8(a){a=a|0;return 0}function g9(a){a=a|0;return}function ha(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hb(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hc(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hd(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function he(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hf(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hg(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hh(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hi(b,c){b=b|0;c=c|0;c=b;a[b]=2;a[c+1|0]=45;a[c+2|0]=0;return}function hj(b,c){b=b|0;c=c|0;c=b;a[b]=2;a[c+1|0]=45;a[c+2|0]=0;return}function hk(b,d){b=b|0;d=d|0;a[b]=2;d=b+4|0;c[d>>2]=45;c[d+4>>2]=0;return}function hl(b,d){b=b|0;d=d|0;a[b]=2;d=b+4|0;c[d>>2]=45;c[d+4>>2]=0;return}function hm(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2]|0;f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=bu(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=cg[c[(c[s>>2]|0)+52>>2]&63](s,m&255)|0}else{c[l>>2]=j+1|0;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function hn(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2]|0;e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400|0;hH(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=cg[c[(c[o>>2]|0)+52>>2]&63](o,l)|0}else{c[k>>2]=d+4|0;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function ho(a){a=a|0;ky(a);return}function hp(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hq(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hr(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hs(a){a=a|0;ky(a);return}function ht(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hu(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hv(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hw(a){a=a|0;ky(a);return}function hx(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hy(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hz(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hA(a){a=a|0;ky(a);return}function hB(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hC(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hD(a,b){a=a|0;b=b|0;kD(a|0,0,12);return}function hE(a){a=a|0;ky(a);return}function hF(a){a=a|0;var b=0,d=0;b=a;d=c[a+8>>2]|0;if((d|0)==0){ky(b);return}bi(d|0);ky(b);return}function hG(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)==0){return}bi(b|0);return}function hH(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;bu(n|0,100,o|0,f|0,c[g>>2]|0);c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=bR(c[g>>2]|0)|0;g=j5(d,m,n,l)|0;if((f|0)!=0){bR(f|0)}if((g|0)==-1){hM(1168)}else{c[e>>2]=d+(g<<2)|0;i=j;return}}function hI(a){a=a|0;return}function hJ(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;d=i;i=i+280|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=d+176|0;u=n|0;c[u>>2]=m|0;v=n+4|0;c[v>>2]=168;w=p|0;x=c[h+28>>2]|0;c[w>>2]=x;y=x+4|0;I=c[y>>2]|0,c[y>>2]=I+1,I;y=c[w>>2]|0;if((c[3592]|0)!=-1){c[l>>2]=14368;c[l+4>>2]=12;c[l+8>>2]=0;d3(14368,l,96)}l=(c[3593]|0)-1|0;x=c[y+8>>2]|0;do{if((c[y+12>>2]|0)-x>>2>>>0>l>>>0){z=c[x+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2]|0;do{if(hK(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,m+100|0)|0){D=s|0;E=c[(c[z>>2]|0)+32>>2]|0;cs[E&15](A,5184,5194,D);E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>98){J=ko(H+2|0)|0;if((J|0)!=0){K=J;L=J;break}J=b3(4)|0;c[J>>2]=5656;bv(J|0,11840,32)}else{K=E;L=0}}while(0);if((a[q]&1)==0){M=K}else{a[K]=45;M=K+1|0}L20:do{if(G>>>0<F>>>0){H=s+10|0;J=s;N=M;O=G;while(1){P=D;while(1){if((P|0)==(H|0)){Q=H;break}if((a[P]|0)==(a[O]|0)){Q=P;break}else{P=P+1|0}}a[N]=a[5184+(Q-J|0)|0]|0;P=O+1|0;R=N+1|0;if(P>>>0<(c[o>>2]|0)>>>0){N=R;O=P}else{S=R;break L20}}}else{S=M}}while(0);a[S]=0;if((bT(E|0,1912,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((L|0)==0){break}kp(L);break}D=b3(8)|0;c[D>>2]=5720;G=D+4|0;if((G|0)!=0){F=kv(28)|0;c[F+4>>2]=15;c[F>>2]=15;O=F+12|0;c[G>>2]=O;c[F+8>>2]=0;kE(O|0,1856,16)}bv(D|0,11872,72)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){T=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){T=z;break}if((ci[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){T=z;break}c[A>>2]=0;T=0}}while(0);A=(T|0)==0;z=c[C>>2]|0;do{if((z|0)==0){U=47}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{U=49;break}}if((ci[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[C>>2]=0;U=47;break}else{if(A^(z|0)==0){break}else{U=49;break}}}}while(0);if((U|0)==47){if(A){U=49}}if((U|0)==49){c[j>>2]=c[j>>2]|2}c[b>>2]=T;z=c[w>>2]|0;C=z+4|0;if(((I=c[C>>2]|0,c[C>>2]=I+ -1,I)|0)==0){ce[c[(c[z>>2]|0)+8>>2]&511](z|0)}z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}ce[c[v>>2]&511](z);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function hK(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0;q=i;i=i+440|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2]|0;r=q|0;s=q+400|0;t=q+408|0;u=q+416|0;v=q+424|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=r|0;kD(w|0,0,12);E=x;F=y;G=z;H=A;kD(E|0,0,12);kD(F|0,0,12);kD(G|0,0,12);kD(H|0,0,12);hQ(g,h,s,t,u,v,x,y,z,B);h=n|0;c[o>>2]=c[h>>2]|0;g=e|0;e=f|0;f=m+8|0;m=A+1|0;I=A+8|0;J=A|0;K=A+4|0;A=z+1|0;L=z+4|0;M=z+8|0;N=y+1|0;O=y+4|0;P=y+8|0;Q=(j&512|0)!=0;j=x+1|0;R=x+4|0;S=x+8|0;x=s+3|0;T=n+4|0;n=v+4|0;U=p;p=168;V=D;W=D;D=r+400|0;r=0;X=0;L70:while(1){Y=c[g>>2]|0;do{if((Y|0)==0){Z=0}else{if((c[Y+12>>2]|0)!=(c[Y+16>>2]|0)){Z=Y;break}if((ci[c[(c[Y>>2]|0)+36>>2]&255](Y)|0)==-1){c[g>>2]=0;Z=0;break}else{Z=c[g>>2]|0;break}}}while(0);Y=(Z|0)==0;_=c[e>>2]|0;do{if((_|0)==0){$=78}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){if(Y){aa=_;break}else{ab=p;ac=V;ad=W;ae=r;$=376;break L70}}if((ci[c[(c[_>>2]|0)+36>>2]&255](_)|0)==-1){c[e>>2]=0;$=78;break}else{if(Y){aa=_;break}else{ab=p;ac=V;ad=W;ae=r;$=376;break L70}}}}while(0);if(($|0)==78){$=0;if(Y){ab=p;ac=V;ad=W;ae=r;$=376;break}else{aa=0}}_=a[s+X|0]|0;do{if((_|0)==4){af=a[u]|0;ag=0;ah=D;ai=W;aj=V;ak=p;al=U;L94:while(1){am=c[g>>2]|0;do{if((am|0)==0){an=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){an=am;break}if((ci[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;an=0;break}else{an=c[g>>2]|0;break}}}while(0);am=(an|0)==0;ao=c[e>>2]|0;do{if((ao|0)==0){$=268}else{if((c[ao+12>>2]|0)!=(c[ao+16>>2]|0)){if(am){break}else{break L94}}if((ci[c[(c[ao>>2]|0)+36>>2]&255](ao)|0)==-1){c[e>>2]=0;$=268;break}else{if(am){break}else{break L94}}}}while(0);if(($|0)==268){$=0;if(am){break}}ao=c[g>>2]|0;ap=c[ao+12>>2]|0;if((ap|0)==(c[ao+16>>2]|0)){aq=ci[c[(c[ao>>2]|0)+36>>2]&255](ao)&255}else{aq=a[ap]|0}do{if(aq<<24>>24>-1){if((b[(c[f>>2]|0)+(aq<<24>>24<<1)>>1]&2048)==0){$=288;break}ap=c[o>>2]|0;if((ap|0)==(al|0)){ao=(c[T>>2]|0)!=168;ar=c[h>>2]|0;as=al-ar|0;at=as>>>0<2147483647?as<<1:-1;au=kq(ao?ar:0,at)|0;if((au|0)==0){$=278;break L70}do{if(ao){c[h>>2]=au;av=au}else{ar=c[h>>2]|0;c[h>>2]=au;if((ar|0)==0){av=au;break}ce[c[T>>2]&511](ar);av=c[h>>2]|0}}while(0);c[T>>2]=82;au=av+as|0;c[o>>2]=au;aw=(c[h>>2]|0)+at|0;ax=au}else{aw=al;ax=ap}c[o>>2]=ax+1|0;a[ax]=aq;ay=ag+1|0;az=ah;aA=ai;aB=aj;aC=ak;aD=aw}else{$=288}}while(0);if(($|0)==288){$=0;am=d[w]|0;if(!((ag|0)!=0&(((am&1|0)==0?am>>>1:c[n>>2]|0)|0)!=0&aq<<24>>24==af<<24>>24)){break}if((ai|0)==(ah|0)){am=ai-aj|0;au=am>>>0<2147483647?am<<1:-1;if((ak|0)==168){aE=0}else{aE=aj}ao=kq(aE,au)|0;ar=ao;if((ao|0)==0){$=293;break L70}aF=ar+(au>>>2<<2)|0;aG=ar+(am>>2<<2)|0;aH=ar;aI=82}else{aF=ah;aG=ai;aH=aj;aI=ak}c[aG>>2]=ag;ay=0;az=aF;aA=aG+4|0;aB=aH;aC=aI;aD=al}ar=c[g>>2]|0;am=ar+12|0;au=c[am>>2]|0;if((au|0)==(c[ar+16>>2]|0)){ao=c[(c[ar>>2]|0)+40>>2]|0;ci[ao&255](ar);ag=ay;ah=az;ai=aA;aj=aB;ak=aC;al=aD;continue}else{c[am>>2]=au+1|0;ag=ay;ah=az;ai=aA;aj=aB;ak=aC;al=aD;continue}}if((aj|0)==(ai|0)|(ag|0)==0){aJ=ah;aK=ai;aL=aj;aM=ak}else{if((ai|0)==(ah|0)){af=ai-aj|0;au=af>>>0<2147483647?af<<1:-1;if((ak|0)==168){aN=0}else{aN=aj}am=kq(aN,au)|0;ar=am;if((am|0)==0){$=305;break L70}aO=ar+(au>>>2<<2)|0;aP=ar+(af>>2<<2)|0;aQ=ar;aR=82}else{aO=ah;aP=ai;aQ=aj;aR=ak}c[aP>>2]=ag;aJ=aO;aK=aP+4|0;aL=aQ;aM=aR}L159:do{if((c[B>>2]|0)>0){ar=c[g>>2]|0;do{if((ar|0)==0){aS=0}else{if((c[ar+12>>2]|0)!=(c[ar+16>>2]|0)){aS=ar;break}if((ci[c[(c[ar>>2]|0)+36>>2]&255](ar)|0)==-1){c[g>>2]=0;aS=0;break}else{aS=c[g>>2]|0;break}}}while(0);ar=(aS|0)==0;af=c[e>>2]|0;do{if((af|0)==0){$=322}else{if((c[af+12>>2]|0)!=(c[af+16>>2]|0)){if(ar){aT=af;break}else{$=329;break L70}}if((ci[c[(c[af>>2]|0)+36>>2]&255](af)|0)==-1){c[e>>2]=0;$=322;break}else{if(ar){aT=af;break}else{$=329;break L70}}}}while(0);if(($|0)==322){$=0;if(ar){$=329;break L70}else{aT=0}}af=c[g>>2]|0;au=c[af+12>>2]|0;if((au|0)==(c[af+16>>2]|0)){aU=ci[c[(c[af>>2]|0)+36>>2]&255](af)&255}else{aU=a[au]|0}if(aU<<24>>24!=(a[t]|0)){$=329;break L70}au=c[g>>2]|0;af=au+12|0;am=c[af>>2]|0;if((am|0)==(c[au+16>>2]|0)){ao=c[(c[au>>2]|0)+40>>2]|0;ci[ao&255](au);aV=al;aW=aT}else{c[af>>2]=am+1|0;aV=al;aW=aT}while(1){am=c[g>>2]|0;do{if((am|0)==0){aX=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aX=am;break}if((ci[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;aX=0;break}else{aX=c[g>>2]|0;break}}}while(0);am=(aX|0)==0;do{if((aW|0)==0){$=345}else{if((c[aW+12>>2]|0)!=(c[aW+16>>2]|0)){if(am){aY=aW;break}else{$=353;break L70}}if((ci[c[(c[aW>>2]|0)+36>>2]&255](aW)|0)==-1){c[e>>2]=0;$=345;break}else{if(am){aY=aW;break}else{$=353;break L70}}}}while(0);if(($|0)==345){$=0;if(am){$=353;break L70}else{aY=0}}ap=c[g>>2]|0;at=c[ap+12>>2]|0;if((at|0)==(c[ap+16>>2]|0)){aZ=ci[c[(c[ap>>2]|0)+36>>2]&255](ap)&255}else{aZ=a[at]|0}if(aZ<<24>>24<=-1){$=353;break L70}if((b[(c[f>>2]|0)+(aZ<<24>>24<<1)>>1]&2048)==0){$=353;break L70}at=c[o>>2]|0;if((at|0)==(aV|0)){ap=(c[T>>2]|0)!=168;as=c[h>>2]|0;af=aV-as|0;au=af>>>0<2147483647?af<<1:-1;ao=kq(ap?as:0,au)|0;if((ao|0)==0){$=356;break L70}do{if(ap){c[h>>2]=ao;a_=ao}else{as=c[h>>2]|0;c[h>>2]=ao;if((as|0)==0){a_=ao;break}ce[c[T>>2]&511](as);a_=c[h>>2]|0}}while(0);c[T>>2]=82;ao=a_+af|0;c[o>>2]=ao;a$=(c[h>>2]|0)+au|0;a0=ao}else{a$=aV;a0=at}ao=c[g>>2]|0;ap=c[ao+12>>2]|0;if((ap|0)==(c[ao+16>>2]|0)){am=ci[c[(c[ao>>2]|0)+36>>2]&255](ao)&255;a1=am;a2=c[o>>2]|0}else{a1=a[ap]|0;a2=a0}c[o>>2]=a2+1|0;a[a2]=a1;ap=(c[B>>2]|0)-1|0;c[B>>2]=ap;am=c[g>>2]|0;ao=am+12|0;as=c[ao>>2]|0;if((as|0)==(c[am+16>>2]|0)){a3=c[(c[am>>2]|0)+40>>2]|0;ci[a3&255](am)}else{c[ao>>2]=as+1|0}if((ap|0)>0){aV=a$;aW=aY}else{a4=a$;break L159}}}else{a4=al}}while(0);if((c[o>>2]|0)==(c[h>>2]|0)){$=374;break L70}else{a5=r;a6=aJ;a7=aK;a8=aL;a9=aM;ba=a4}}else if((_|0)==1){if((X|0)==3){ab=p;ac=V;ad=W;ae=r;$=376;break L70}al=c[g>>2]|0;ag=c[al+12>>2]|0;if((ag|0)==(c[al+16>>2]|0)){bb=ci[c[(c[al>>2]|0)+36>>2]&255](al)&255}else{bb=a[ag]|0}if(bb<<24>>24<=-1){$=130;break L70}if((b[(c[f>>2]|0)+(bb<<24>>24<<1)>>1]&8192)==0){$=130;break L70}ag=c[g>>2]|0;al=ag+12|0;ak=c[al>>2]|0;if((ak|0)==(c[ag+16>>2]|0)){bc=ci[c[(c[ag>>2]|0)+40>>2]&255](ag)&255}else{c[al>>2]=ak+1|0;bc=a[ak]|0}ak=a[H]|0;if((ak&1)==0){bd=10;be=ak}else{ak=c[J>>2]|0;bd=(ak&-2)-1|0;be=ak&255}ak=be&255;al=(ak&1|0)==0?ak>>>1:c[K>>2]|0;if((al|0)==(bd|0)){if((bd|0)==-3){$=118;break L70}ak=(be&1)==0?m:c[I>>2]|0;do{if(bd>>>0<2147483631){ag=bd+1|0;aj=bd<<1;ai=ag>>>0<aj>>>0?aj:ag;if(ai>>>0<11){bf=11;break}bf=ai+16&-16}else{bf=-2}}while(0);ai=ku(bf)|0;kE(ai|0,ak|0,bd);if((bd|0)!=10){ky(ak)}c[I>>2]=ai;ag=bf|1;c[J>>2]=ag;bg=ag&255;bh=ai}else{bg=be;bh=c[I>>2]|0}ai=(bg&1)==0?m:bh;a[ai+al|0]=bc;ag=al+1|0;a[ai+ag|0]=0;if((a[H]&1)==0){a[H]=ag<<1&255;$=131;break}else{c[K>>2]=ag;$=131;break}}else if((_|0)==0){$=131}else if((_|0)==3){ag=a[F]|0;ai=ag&255;aj=(ai&1|0)==0?ai>>>1:c[O>>2]|0;ai=a[G]|0;ah=ai&255;ar=(ah&1|0)==0?ah>>>1:c[L>>2]|0;if((aj|0)==(-ar|0)){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break}ah=(aj|0)==0;aj=c[g>>2]|0;ap=c[aj+12>>2]|0;as=c[aj+16>>2]|0;ao=(ap|0)==(as|0);if(!(ah|(ar|0)==0)){if(ao){ar=ci[c[(c[aj>>2]|0)+36>>2]&255](aj)&255;am=c[g>>2]|0;bi=ar;bj=a[F]|0;bk=am;bl=c[am+12>>2]|0;bm=c[am+16>>2]|0}else{bi=a[ap]|0;bj=ag;bk=aj;bl=ap;bm=as}as=bk+12|0;am=(bl|0)==(bm|0);if(bi<<24>>24==(a[(bj&1)==0?N:c[P>>2]|0]|0)){if(am){ar=c[(c[bk>>2]|0)+40>>2]|0;ci[ar&255](bk)}else{c[as>>2]=bl+1|0}as=d[F]|0;a5=((as&1|0)==0?as>>>1:c[O>>2]|0)>>>0>1?y:r;a6=D;a7=W;a8=V;a9=p;ba=U;break}if(am){bn=ci[c[(c[bk>>2]|0)+36>>2]&255](bk)&255}else{bn=a[bl]|0}if(bn<<24>>24!=(a[(a[G]&1)==0?A:c[M>>2]|0]|0)){$=213;break L70}am=c[g>>2]|0;as=am+12|0;ar=c[as>>2]|0;if((ar|0)==(c[am+16>>2]|0)){a3=c[(c[am>>2]|0)+40>>2]|0;ci[a3&255](am)}else{c[as>>2]=ar+1|0}a[l]=1;ar=d[G]|0;a5=((ar&1|0)==0?ar>>>1:c[L>>2]|0)>>>0>1?z:r;a6=D;a7=W;a8=V;a9=p;ba=U;break}if(ah){if(ao){ah=ci[c[(c[aj>>2]|0)+36>>2]&255](aj)&255;bo=ah;bp=a[G]|0}else{bo=a[ap]|0;bp=ai}if(bo<<24>>24!=(a[(bp&1)==0?A:c[M>>2]|0]|0)){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break}ai=c[g>>2]|0;ah=ai+12|0;ar=c[ah>>2]|0;if((ar|0)==(c[ai+16>>2]|0)){as=c[(c[ai>>2]|0)+40>>2]|0;ci[as&255](ai)}else{c[ah>>2]=ar+1|0}a[l]=1;ar=d[G]|0;a5=((ar&1|0)==0?ar>>>1:c[L>>2]|0)>>>0>1?z:r;a6=D;a7=W;a8=V;a9=p;ba=U;break}if(ao){ao=ci[c[(c[aj>>2]|0)+36>>2]&255](aj)&255;bq=ao;br=a[F]|0}else{bq=a[ap]|0;br=ag}if(bq<<24>>24!=(a[(br&1)==0?N:c[P>>2]|0]|0)){a[l]=1;a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break}ag=c[g>>2]|0;ap=ag+12|0;ao=c[ap>>2]|0;if((ao|0)==(c[ag+16>>2]|0)){aj=c[(c[ag>>2]|0)+40>>2]|0;ci[aj&255](ag)}else{c[ap>>2]=ao+1|0}ao=d[F]|0;a5=((ao&1|0)==0?ao>>>1:c[O>>2]|0)>>>0>1?y:r;a6=D;a7=W;a8=V;a9=p;ba=U}else if((_|0)==2){if(!((r|0)!=0|X>>>0<2)){if((X|0)==2){bs=(a[x]|0)!=0}else{bs=0}if(!(Q|bs)){a5=0;a6=D;a7=W;a8=V;a9=p;ba=U;break}}ao=a[E]|0;ap=(ao&1)==0?j:c[S>>2]|0;L331:do{if((X|0)==0){bt=ap}else{if((d[s+(X-1|0)|0]|0)>=2){bt=ap;break}ag=ao&255;aj=ap+((ag&1|0)==0?ag>>>1:c[R>>2]|0)|0;ag=ap;while(1){if((ag|0)==(aj|0)){bu=aj;break}ar=a[ag]|0;if(ar<<24>>24<=-1){bu=ag;break}if((b[(c[f>>2]|0)+(ar<<24>>24<<1)>>1]&8192)==0){bu=ag;break}else{ag=ag+1|0}}ag=bu-ap|0;aj=a[H]|0;ar=aj&255;ah=(ar&1|0)==0?ar>>>1:c[K>>2]|0;if(ag>>>0>ah>>>0){bt=ap;break}ar=(aj&1)==0?m:c[I>>2]|0;aj=ar+ah|0;if((bu|0)==(ap|0)){bt=ap;break}ai=ap;as=ar+(ah-ag|0)|0;while(1){if((a[as]|0)!=(a[ai]|0)){bt=ap;break L331}ag=as+1|0;if((ag|0)==(aj|0)){bt=bu;break L331}else{ai=ai+1|0;as=ag}}}}while(0);al=ao&255;L345:do{if((bt|0)==(ap+((al&1|0)==0?al>>>1:c[R>>2]|0)|0)){bv=bt}else{ak=aa;as=bt;while(1){ai=c[g>>2]|0;do{if((ai|0)==0){bw=0}else{if((c[ai+12>>2]|0)!=(c[ai+16>>2]|0)){bw=ai;break}if((ci[c[(c[ai>>2]|0)+36>>2]&255](ai)|0)==-1){c[g>>2]=0;bw=0;break}else{bw=c[g>>2]|0;break}}}while(0);ai=(bw|0)==0;do{if((ak|0)==0){$=242}else{if((c[ak+12>>2]|0)!=(c[ak+16>>2]|0)){if(ai){bx=ak;break}else{bv=as;break L345}}if((ci[c[(c[ak>>2]|0)+36>>2]&255](ak)|0)==-1){c[e>>2]=0;$=242;break}else{if(ai){bx=ak;break}else{bv=as;break L345}}}}while(0);if(($|0)==242){$=0;if(ai){bv=as;break L345}else{bx=0}}at=c[g>>2]|0;au=c[at+12>>2]|0;if((au|0)==(c[at+16>>2]|0)){by=ci[c[(c[at>>2]|0)+36>>2]&255](at)&255}else{by=a[au]|0}if(by<<24>>24!=(a[as]|0)){bv=as;break L345}au=c[g>>2]|0;at=au+12|0;af=c[at>>2]|0;if((af|0)==(c[au+16>>2]|0)){aj=c[(c[au>>2]|0)+40>>2]|0;ci[aj&255](au)}else{c[at>>2]=af+1|0}af=as+1|0;at=a[E]|0;au=at&255;if((af|0)==(((at&1)==0?j:c[S>>2]|0)+((au&1|0)==0?au>>>1:c[R>>2]|0)|0)){bv=af;break L345}else{ak=bx;as=af}}}}while(0);if(!Q){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break}al=a[E]|0;ap=al&255;if((bv|0)==(((al&1)==0?j:c[S>>2]|0)+((ap&1|0)==0?ap>>>1:c[R>>2]|0)|0)){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U}else{$=255;break L70}}else{a5=r;a6=D;a7=W;a8=V;a9=p;ba=U}}while(0);L380:do{if(($|0)==131){$=0;if((X|0)==3){ab=p;ac=V;ad=W;ae=r;$=376;break L70}else{bz=aa}while(1){_=c[g>>2]|0;do{if((_|0)==0){bA=0}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){bA=_;break}if((ci[c[(c[_>>2]|0)+36>>2]&255](_)|0)==-1){c[g>>2]=0;bA=0;break}else{bA=c[g>>2]|0;break}}}while(0);_=(bA|0)==0;do{if((bz|0)==0){$=144}else{if((c[bz+12>>2]|0)!=(c[bz+16>>2]|0)){if(_){bB=bz;break}else{a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break L380}}if((ci[c[(c[bz>>2]|0)+36>>2]&255](bz)|0)==-1){c[e>>2]=0;$=144;break}else{if(_){bB=bz;break}else{a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break L380}}}}while(0);if(($|0)==144){$=0;if(_){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break L380}else{bB=0}}Y=c[g>>2]|0;ap=c[Y+12>>2]|0;if((ap|0)==(c[Y+16>>2]|0)){bC=ci[c[(c[Y>>2]|0)+36>>2]&255](Y)&255}else{bC=a[ap]|0}if(bC<<24>>24<=-1){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break L380}if((b[(c[f>>2]|0)+(bC<<24>>24<<1)>>1]&8192)==0){a5=r;a6=D;a7=W;a8=V;a9=p;ba=U;break L380}ap=c[g>>2]|0;Y=ap+12|0;al=c[Y>>2]|0;if((al|0)==(c[ap+16>>2]|0)){bD=ci[c[(c[ap>>2]|0)+40>>2]&255](ap)&255}else{c[Y>>2]=al+1|0;bD=a[al]|0}al=a[H]|0;if((al&1)==0){bE=10;bF=al}else{al=c[J>>2]|0;bE=(al&-2)-1|0;bF=al&255}al=bF&255;Y=(al&1|0)==0?al>>>1:c[K>>2]|0;if((Y|0)==(bE|0)){if((bE|0)==-3){$=161;break L70}al=(bF&1)==0?m:c[I>>2]|0;do{if(bE>>>0<2147483631){ap=bE+1|0;ao=bE<<1;as=ap>>>0<ao>>>0?ao:ap;if(as>>>0<11){bG=11;break}bG=as+16&-16}else{bG=-2}}while(0);_=ku(bG)|0;kE(_|0,al|0,bE);if((bE|0)!=10){ky(al)}c[I>>2]=_;as=bG|1;c[J>>2]=as;bH=as&255;bI=_}else{bH=bF;bI=c[I>>2]|0}_=(bH&1)==0?m:bI;a[_+Y|0]=bD;as=Y+1|0;a[_+as|0]=0;if((a[H]&1)==0){a[H]=as<<1&255;bz=bB;continue}else{c[K>>2]=as;bz=bB;continue}}}}while(0);as=X+1|0;if(as>>>0<4){U=ba;p=a9;V=a8;W=a7;D=a6;r=a5;X=as}else{ab=a9;ac=a8;ad=a7;ae=a5;$=376;break}}L436:do{if(($|0)==118){d4(0);return 0}else if(($|0)==130){c[k>>2]=c[k>>2]|4;bJ=0;bK=V;bL=p}else if(($|0)==161){d4(0);return 0}else if(($|0)==213){c[k>>2]=c[k>>2]|4;bJ=0;bK=V;bL=p}else if(($|0)==255){c[k>>2]=c[k>>2]|4;bJ=0;bK=V;bL=p}else if(($|0)==278){kC();return 0}else if(($|0)==293){kC();return 0}else if(($|0)==305){kC();return 0}else if(($|0)==329){c[k>>2]=c[k>>2]|4;bJ=0;bK=aL;bL=aM}else if(($|0)==353){c[k>>2]=c[k>>2]|4;bJ=0;bK=aL;bL=aM}else if(($|0)==356){kC();return 0}else if(($|0)==374){c[k>>2]=c[k>>2]|4;bJ=0;bK=aL;bL=aM}else if(($|0)==376){L456:do{if((ae|0)!=0){a5=ae;a7=ae+1|0;a8=ae+8|0;a9=ae+4|0;X=1;L458:while(1){r=d[a5]|0;if((r&1|0)==0){bM=r>>>1}else{bM=c[a9>>2]|0}if(X>>>0>=bM>>>0){break L456}r=c[g>>2]|0;do{if((r|0)==0){bN=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){bN=r;break}if((ci[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[g>>2]=0;bN=0;break}else{bN=c[g>>2]|0;break}}}while(0);r=(bN|0)==0;Y=c[e>>2]|0;do{if((Y|0)==0){$=394}else{if((c[Y+12>>2]|0)!=(c[Y+16>>2]|0)){if(r){break}else{break L458}}if((ci[c[(c[Y>>2]|0)+36>>2]&255](Y)|0)==-1){c[e>>2]=0;$=394;break}else{if(r){break}else{break L458}}}}while(0);if(($|0)==394){$=0;if(r){break}}Y=c[g>>2]|0;al=c[Y+12>>2]|0;if((al|0)==(c[Y+16>>2]|0)){bO=ci[c[(c[Y>>2]|0)+36>>2]&255](Y)&255}else{bO=a[al]|0}if((a[a5]&1)==0){bP=a7}else{bP=c[a8>>2]|0}if(bO<<24>>24!=(a[bP+X|0]|0)){break}al=X+1|0;Y=c[g>>2]|0;a6=Y+12|0;D=c[a6>>2]|0;if((D|0)==(c[Y+16>>2]|0)){W=c[(c[Y>>2]|0)+40>>2]|0;ci[W&255](Y);X=al;continue}else{c[a6>>2]=D+1|0;X=al;continue}}c[k>>2]=c[k>>2]|4;bJ=0;bK=ac;bL=ab;break L436}}while(0);if((ac|0)==(ad|0)){bJ=1;bK=ad;bL=ab;break}c[C>>2]=0;fo(v,ac,ad,C);if((c[C>>2]|0)==0){bJ=1;bK=ac;bL=ab;break}c[k>>2]=c[k>>2]|4;bJ=0;bK=ac;bL=ab}}while(0);if((a[H]&1)!=0){ky(c[I>>2]|0)}if((a[G]&1)!=0){ky(c[M>>2]|0)}if((a[F]&1)!=0){ky(c[P>>2]|0)}if((a[E]&1)!=0){ky(c[S>>2]|0)}if((a[w]&1)!=0){ky(c[v+8>>2]|0)}if((bK|0)==0){i=q;return bJ|0}ce[bL&511](bK);i=q;return bJ|0}function hL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){en(b,k,(j+h|0)-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g|0)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function hM(a){a=a|0;var b=0,d=0,e=0,f=0;b=b3(8)|0;c[b>>2]=5720;d=b+4|0;if((d|0)==0){bv(b|0,11872,72)}e=kG(a|0)|0;f=kv(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;e=f+12|0;c[d>>2]=e;c[f+8>>2]=0;kH(e|0,a|0);bv(b|0,11872,72)}function hN(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0;d=i;i=i+160|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=n|0;c[s>>2]=m|0;t=n+4|0;c[t>>2]=168;u=p|0;v=c[h+28>>2]|0;c[u>>2]=v;w=v+4|0;I=c[w>>2]|0,c[w>>2]=I+1,I;w=c[u>>2]|0;if((c[3592]|0)!=-1){c[l>>2]=14368;c[l+4>>2]=12;c[l+8>>2]=0;d3(14368,l,96)}l=(c[3593]|0)-1|0;v=c[w+8>>2]|0;do{if((c[w+12>>2]|0)-v>>2>>>0>l>>>0){x=c[v+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(hK(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,m+100|0)|0){B=k;if((a[B]&1)==0){a[k+1|0]=0;a[B]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}C=x;do{if((a[q]&1)!=0){x=cg[c[(c[C>>2]|0)+28>>2]&63](y,45)|0;D=a[B]|0;if((D&1)==0){E=10;F=D}else{D=c[k>>2]|0;E=(D&-2)-1|0;F=D&255}D=F&255;if((D&1|0)==0){G=D>>>1}else{G=c[k+4>>2]|0}if((G|0)==(E|0)){en(k,E,1,E,E,0,0);H=a[B]|0}else{H=F}if((H&1)==0){J=k+1|0}else{J=c[k+8>>2]|0}a[J+G|0]=x;x=G+1|0;a[J+x|0]=0;if((a[B]&1)==0){a[B]=x<<1&255;break}else{c[k+4>>2]=x;break}}}while(0);B=cg[c[(c[C>>2]|0)+28>>2]&63](y,48)|0;x=c[o>>2]|0;D=x-1|0;K=c[s>>2]|0;while(1){if(K>>>0>=D>>>0){break}if((a[K]|0)==B<<24>>24){K=K+1|0}else{break}}hL(k,K,x)}B=e|0;D=c[B>>2]|0;do{if((D|0)==0){L=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){L=D;break}if((ci[c[(c[D>>2]|0)+36>>2]&255](D)|0)!=-1){L=D;break}c[B>>2]=0;L=0}}while(0);B=(L|0)==0;do{if((A|0)==0){M=500}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(B){break}else{M=502;break}}if((ci[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[z>>2]=0;M=500;break}else{if(B^(A|0)==0){break}else{M=502;break}}}}while(0);if((M|0)==500){if(B){M=502}}if((M|0)==502){c[j>>2]=c[j>>2]|2}c[b>>2]=L;A=c[u>>2]|0;z=A+4|0;if(((I=c[z>>2]|0,c[z>>2]=I+ -1,I)|0)==0){ce[c[(c[A>>2]|0)+8>>2]&511](A|0)}A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}ce[c[t>>2]&511](A);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function hO(a){a=a|0;return}function hP(a){a=a|0;ky(a);return}function hQ(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3720]|0)!=-1){c[p>>2]=14880;c[p+4>>2]=12;c[p+8>>2]=0;d3(14880,p,96)}p=(c[3721]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=b3(4)|0;L=K;c[L>>2]=5688;bv(K|0,11856,198)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=b3(4)|0;L=K;c[L>>2]=5688;bv(K|0,11856,198)}K=b;cf[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;cf[c[(c[L>>2]|0)+32>>2]&127](r,K);r=l;if((a[r]&1)==0){a[l+1|0]=0;a[r]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d5(l,0);c[r>>2]=c[s>>2]|0;c[r+4>>2]=c[s+4>>2]|0;c[r+8>>2]=c[s+8>>2]|0;kD(s|0,0,12);cf[c[(c[L>>2]|0)+28>>2]&127](t,K);t=k;if((a[t]&1)==0){a[k+1|0]=0;a[t]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d5(k,0);c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;kD(u|0,0,12);u=b;a[f]=ci[c[(c[u>>2]|0)+12>>2]&255](K)|0;a[g]=ci[c[(c[u>>2]|0)+16>>2]&255](K)|0;cf[c[(c[L>>2]|0)+20>>2]&127](v,K);v=h;if((a[v]&1)==0){a[h+1|0]=0;a[v]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d5(h,0);c[v>>2]=c[w>>2]|0;c[v+4>>2]=c[w+4>>2]|0;c[v+8>>2]=c[w+8>>2]|0;kD(w|0,0,12);cf[c[(c[L>>2]|0)+24>>2]&127](x,K);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d5(j,0);c[x>>2]=c[y>>2]|0;c[x+4>>2]=c[y+4>>2]|0;c[x+8>>2]=c[y+8>>2]|0;kD(y|0,0,12);M=ci[c[(c[b>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3722]|0)!=-1){c[o>>2]=14888;c[o+4>>2]=12;c[o+8>>2]=0;d3(14888,o,96)}o=(c[3723]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=b3(4)|0;O=N;c[O>>2]=5688;bv(N|0,11856,198)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=b3(4)|0;O=N;c[O>>2]=5688;bv(N|0,11856,198)}N=K;cf[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;cf[c[(c[O>>2]|0)+32>>2]&127](A,N);A=l;if((a[A]&1)==0){a[l+1|0]=0;a[A]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d5(l,0);c[A>>2]=c[B>>2]|0;c[A+4>>2]=c[B+4>>2]|0;c[A+8>>2]=c[B+8>>2]|0;kD(B|0,0,12);cf[c[(c[O>>2]|0)+28>>2]&127](D,N);D=k;if((a[D]&1)==0){a[k+1|0]=0;a[D]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d5(k,0);c[D>>2]=c[E>>2]|0;c[D+4>>2]=c[E+4>>2]|0;c[D+8>>2]=c[E+8>>2]|0;kD(E|0,0,12);E=K;a[f]=ci[c[(c[E>>2]|0)+12>>2]&255](N)|0;a[g]=ci[c[(c[E>>2]|0)+16>>2]&255](N)|0;cf[c[(c[O>>2]|0)+20>>2]&127](F,N);F=h;if((a[F]&1)==0){a[h+1|0]=0;a[F]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d5(h,0);c[F>>2]=c[G>>2]|0;c[F+4>>2]=c[G+4>>2]|0;c[F+8>>2]=c[G+8>>2]|0;kD(G|0,0,12);cf[c[(c[O>>2]|0)+24>>2]&127](H,N);H=j;if((a[H]&1)==0){a[j+1|0]=0;a[H]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d5(j,0);c[H>>2]=c[I>>2]|0;c[H+4>>2]=c[I+4>>2]|0;c[H+8>>2]=c[I+8>>2]|0;kD(I|0,0,12);M=ci[c[(c[K>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function hR(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;d=i;i=i+600|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=d+496|0;u=n|0;c[u>>2]=m|0;v=n+4|0;c[v>>2]=168;w=p|0;x=c[h+28>>2]|0;c[w>>2]=x;y=x+4|0;I=c[y>>2]|0,c[y>>2]=I+1,I;y=c[w>>2]|0;if((c[3590]|0)!=-1){c[l>>2]=14360;c[l+4>>2]=12;c[l+8>>2]=0;d3(14360,l,96)}l=(c[3591]|0)-1|0;x=c[y+8>>2]|0;do{if((c[y+12>>2]|0)-x>>2>>>0>l>>>0){z=c[x+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2]|0;do{if(hS(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,m+400|0)|0){D=s|0;E=c[(c[z>>2]|0)+48>>2]|0;cs[E&15](A,5168,5178,D);E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>392){J=ko((H>>2)+2|0)|0;if((J|0)!=0){K=J;L=J;break}J=b3(4)|0;c[J>>2]=5656;bv(J|0,11840,32)}else{K=E;L=0}}while(0);if((a[q]&1)==0){M=K}else{a[K]=45;M=K+1|0}L709:do{if(G>>>0<F>>>0){H=s+40|0;J=s;N=M;O=G;while(1){P=D;while(1){if((P|0)==(H|0)){Q=H;break}if((c[P>>2]|0)==(c[O>>2]|0)){Q=P;break}else{P=P+4|0}}a[N]=a[5168+(Q-J>>2)|0]|0;P=O+4|0;R=N+1|0;if(P>>>0<(c[o>>2]|0)>>>0){N=R;O=P}else{S=R;break L709}}}else{S=M}}while(0);a[S]=0;if((bT(E|0,1912,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((L|0)==0){break}kp(L);break}D=b3(8)|0;c[D>>2]=5720;G=D+4|0;if((G|0)!=0){F=kv(28)|0;c[F+4>>2]=15;c[F>>2]=15;O=F+12|0;c[G>>2]=O;c[F+8>>2]=0;kE(O|0,1856,16)}bv(D|0,11872,72)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){T=0}else{D=c[z+12>>2]|0;if((D|0)==(c[z+16>>2]|0)){U=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{U=c[D>>2]|0}if((U|0)!=-1){T=z;break}c[A>>2]=0;T=0}}while(0);A=(T|0)==0;z=c[C>>2]|0;do{if((z|0)==0){V=622}else{D=c[z+12>>2]|0;if((D|0)==(c[z+16>>2]|0)){W=ci[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{W=c[D>>2]|0}if((W|0)==-1){c[C>>2]=0;V=622;break}else{if(A^(z|0)==0){break}else{V=624;break}}}}while(0);if((V|0)==622){if(A){V=624}}if((V|0)==624){c[j>>2]=c[j>>2]|2}c[b>>2]=T;z=c[w>>2]|0;C=z+4|0;if(((I=c[C>>2]|0,c[C>>2]=I+ -1,I)|0)==0){ce[c[(c[z>>2]|0)+8>>2]&511](z|0)}z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}ce[c[v>>2]&511](z);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function hS(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0;p=i;i=i+448|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2]|0;q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;kD(w|0,0,12);D=x;E=y;F=z;G=A;kD(D|0,0,12);kD(E|0,0,12);kD(F|0,0,12);kD(G|0,0,12);hV(f,g,s,t,u,v,x,y,z,B);g=m|0;c[n>>2]=c[g>>2]|0;f=b|0;b=e|0;e=l;H=A+4|0;I=A+8|0;J=A|0;K=z+4|0;L=z+8|0;M=y+4|0;N=y+8|0;O=(h&512|0)!=0;h=x+4|0;P=x+8|0;x=s+3|0;Q=v+4|0;R=168;S=o;T=o;o=r+400|0;r=0;U=0;L761:while(1){V=c[f>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=ci[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[f>>2]=0;W=1;break}else{W=(c[f>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=654}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=ci[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=654;break}else{if(W^(V|0)==0){$=V;break}else{aa=R;ab=S;ac=T;ad=r;Z=920;break L761}}}}while(0);if((Z|0)==654){Z=0;if(W){aa=R;ab=S;ac=T;ad=r;Z=920;break}else{$=0}}V=a[s+U|0]|0;L785:do{if((V|0)==2){if(!((r|0)!=0|U>>>0<2)){if((U|0)==2){ae=(a[x]|0)!=0}else{ae=0}if(!(O|ae)){af=0;ag=o;ah=T;ai=S;aj=R;break}}X=a[D]|0;ak=(X&1)==0?h:c[P>>2]|0;L793:do{if((U|0)==0){al=ak;am=X;an=$}else{if((d[s+(U-1|0)|0]|0)<2){ao=ak;ap=X}else{al=ak;am=X;an=$;break}while(1){aq=ap&255;if((ao|0)==(((ap&1)==0?h:c[P>>2]|0)+(((aq&1|0)==0?aq>>>1:c[h>>2]|0)<<2)|0)){ar=ap;break}if(!(cj[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[ao>>2]|0)|0)){Z=779;break}ao=ao+4|0;ap=a[D]|0}if((Z|0)==779){Z=0;ar=a[D]|0}aq=(ar&1)==0;as=ao-(aq?h:c[P>>2]|0)>>2;at=a[G]|0;au=at&255;av=(au&1|0)==0;L803:do{if(as>>>0<=(av?au>>>1:c[H>>2]|0)>>>0){aw=(at&1)==0;ax=(aw?H:c[I>>2]|0)+((av?au>>>1:c[H>>2]|0)-as<<2)|0;ay=(aw?H:c[I>>2]|0)+((av?au>>>1:c[H>>2]|0)<<2)|0;if((ax|0)==(ay|0)){al=ao;am=ar;an=$;break L793}else{az=ax;aA=aq?h:c[P>>2]|0}while(1){if((c[az>>2]|0)!=(c[aA>>2]|0)){break L803}ax=az+4|0;if((ax|0)==(ay|0)){al=ao;am=ar;an=$;break L793}az=ax;aA=aA+4|0}}}while(0);al=aq?h:c[P>>2]|0;am=ar;an=$}}while(0);L810:while(1){X=am&255;if((al|0)==(((am&1)==0?h:c[P>>2]|0)+(((X&1|0)==0?X>>>1:c[h>>2]|0)<<2)|0)){break}X=c[f>>2]|0;do{if((X|0)==0){aB=1}else{ak=c[X+12>>2]|0;if((ak|0)==(c[X+16>>2]|0)){aC=ci[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aC=c[ak>>2]|0}if((aC|0)==-1){c[f>>2]=0;aB=1;break}else{aB=(c[f>>2]|0)==0;break}}}while(0);do{if((an|0)==0){Z=800}else{X=c[an+12>>2]|0;if((X|0)==(c[an+16>>2]|0)){aD=ci[c[(c[an>>2]|0)+36>>2]&255](an)|0}else{aD=c[X>>2]|0}if((aD|0)==-1){c[b>>2]=0;Z=800;break}else{if(aB^(an|0)==0){aE=an;break}else{break L810}}}}while(0);if((Z|0)==800){Z=0;if(aB){break}else{aE=0}}X=c[f>>2]|0;aq=c[X+12>>2]|0;if((aq|0)==(c[X+16>>2]|0)){aF=ci[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aF=c[aq>>2]|0}if((aF|0)!=(c[al>>2]|0)){break}aq=c[f>>2]|0;X=aq+12|0;ak=c[X>>2]|0;if((ak|0)==(c[aq+16>>2]|0)){au=c[(c[aq>>2]|0)+40>>2]|0;ci[au&255](aq)}else{c[X>>2]=ak+4|0}al=al+4|0;am=a[D]|0;an=aE}if(!O){af=r;ag=o;ah=T;ai=S;aj=R;break}ak=a[D]|0;X=ak&255;if((al|0)==(((ak&1)==0?h:c[P>>2]|0)+(((X&1|0)==0?X>>>1:c[h>>2]|0)<<2)|0)){af=r;ag=o;ah=T;ai=S;aj=R}else{Z=812;break L761}}else if((V|0)==4){X=0;ak=o;aq=T;au=S;av=R;L846:while(1){as=c[f>>2]|0;do{if((as|0)==0){aG=1}else{at=c[as+12>>2]|0;if((at|0)==(c[as+16>>2]|0)){aH=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{aH=c[at>>2]|0}if((aH|0)==-1){c[f>>2]=0;aG=1;break}else{aG=(c[f>>2]|0)==0;break}}}while(0);as=c[b>>2]|0;do{if((as|0)==0){Z=826}else{at=c[as+12>>2]|0;if((at|0)==(c[as+16>>2]|0)){aI=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{aI=c[at>>2]|0}if((aI|0)==-1){c[b>>2]=0;Z=826;break}else{if(aG^(as|0)==0){break}else{break L846}}}}while(0);if((Z|0)==826){Z=0;if(aG){break}}as=c[f>>2]|0;at=c[as+12>>2]|0;if((at|0)==(c[as+16>>2]|0)){aJ=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{aJ=c[at>>2]|0}if(cj[c[(c[e>>2]|0)+12>>2]&63](l,2048,aJ)|0){at=c[n>>2]|0;if((at|0)==(c[q>>2]|0)){hY(m,n,q);aK=c[n>>2]|0}else{aK=at}c[n>>2]=aK+4|0;c[aK>>2]=aJ;aL=X+1|0;aM=ak;aN=aq;aO=au;aP=av}else{at=d[w]|0;if((((at&1|0)==0?at>>>1:c[Q>>2]|0)|0)==0|(X|0)==0){break}if((aJ|0)!=(c[u>>2]|0)){break}if((aq|0)==(ak|0)){at=(av|0)!=168;as=aq-au|0;ay=as>>>0<2147483647?as<<1:-1;if(at){aQ=au}else{aQ=0}at=kq(aQ,ay)|0;ax=at;if((at|0)==0){Z=843;break L761}aR=ax+(ay>>>2<<2)|0;aS=ax+(as>>2<<2)|0;aT=ax;aU=82}else{aR=ak;aS=aq;aT=au;aU=av}c[aS>>2]=X;aL=0;aM=aR;aN=aS+4|0;aO=aT;aP=aU}ax=c[f>>2]|0;as=ax+12|0;ay=c[as>>2]|0;if((ay|0)==(c[ax+16>>2]|0)){at=c[(c[ax>>2]|0)+40>>2]|0;ci[at&255](ax);X=aL;ak=aM;aq=aN;au=aO;av=aP;continue}else{c[as>>2]=ay+4|0;X=aL;ak=aM;aq=aN;au=aO;av=aP;continue}}if((au|0)==(aq|0)|(X|0)==0){aV=ak;aW=aq;aX=au;aY=av}else{if((aq|0)==(ak|0)){ay=(av|0)!=168;as=aq-au|0;ax=as>>>0<2147483647?as<<1:-1;if(ay){aZ=au}else{aZ=0}ay=kq(aZ,ax)|0;at=ay;if((ay|0)==0){Z=857;break L761}a_=at+(ax>>>2<<2)|0;a$=at+(as>>2<<2)|0;a0=at;a1=82}else{a_=ak;a$=aq;a0=au;a1=av}c[a$>>2]=X;aV=a_;aW=a$+4|0;aX=a0;aY=a1}at=c[B>>2]|0;L912:do{if((at|0)>0){as=c[f>>2]|0;do{if((as|0)==0){a2=1}else{ax=c[as+12>>2]|0;if((ax|0)==(c[as+16>>2]|0)){a3=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{a3=c[ax>>2]|0}if((a3|0)==-1){c[f>>2]=0;a2=1;break}else{a2=(c[f>>2]|0)==0;break}}}while(0);as=c[b>>2]|0;do{if((as|0)==0){Z=877}else{ax=c[as+12>>2]|0;if((ax|0)==(c[as+16>>2]|0)){a4=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{a4=c[ax>>2]|0}if((a4|0)==-1){c[b>>2]=0;Z=877;break}else{if(a2^(as|0)==0){a5=as;break}else{Z=883;break L761}}}}while(0);if((Z|0)==877){Z=0;if(a2){Z=883;break L761}else{a5=0}}as=c[f>>2]|0;ax=c[as+12>>2]|0;if((ax|0)==(c[as+16>>2]|0)){a6=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{a6=c[ax>>2]|0}if((a6|0)!=(c[t>>2]|0)){Z=883;break L761}ax=c[f>>2]|0;as=ax+12|0;ay=c[as>>2]|0;if((ay|0)==(c[ax+16>>2]|0)){aw=c[(c[ax>>2]|0)+40>>2]|0;ci[aw&255](ax);a7=a5;a8=at}else{c[as>>2]=ay+4|0;a7=a5;a8=at}while(1){ay=c[f>>2]|0;do{if((ay|0)==0){a9=1}else{as=c[ay+12>>2]|0;if((as|0)==(c[ay+16>>2]|0)){ba=ci[c[(c[ay>>2]|0)+36>>2]&255](ay)|0}else{ba=c[as>>2]|0}if((ba|0)==-1){c[f>>2]=0;a9=1;break}else{a9=(c[f>>2]|0)==0;break}}}while(0);do{if((a7|0)==0){Z=900}else{ay=c[a7+12>>2]|0;if((ay|0)==(c[a7+16>>2]|0)){bb=ci[c[(c[a7>>2]|0)+36>>2]&255](a7)|0}else{bb=c[ay>>2]|0}if((bb|0)==-1){c[b>>2]=0;Z=900;break}else{if(a9^(a7|0)==0){bc=a7;break}else{Z=907;break L761}}}}while(0);if((Z|0)==900){Z=0;if(a9){Z=907;break L761}else{bc=0}}ay=c[f>>2]|0;as=c[ay+12>>2]|0;if((as|0)==(c[ay+16>>2]|0)){bd=ci[c[(c[ay>>2]|0)+36>>2]&255](ay)|0}else{bd=c[as>>2]|0}if(!(cj[c[(c[e>>2]|0)+12>>2]&63](l,2048,bd)|0)){Z=907;break L761}if((c[n>>2]|0)==(c[q>>2]|0)){hY(m,n,q)}as=c[f>>2]|0;ay=c[as+12>>2]|0;if((ay|0)==(c[as+16>>2]|0)){be=ci[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{be=c[ay>>2]|0}ay=c[n>>2]|0;c[n>>2]=ay+4|0;c[ay>>2]=be;ay=a8-1|0;c[B>>2]=ay;as=c[f>>2]|0;ax=as+12|0;aw=c[ax>>2]|0;if((aw|0)==(c[as+16>>2]|0)){bf=c[(c[as>>2]|0)+40>>2]|0;ci[bf&255](as)}else{c[ax>>2]=aw+4|0}if((ay|0)>0){a7=bc;a8=ay}else{break L912}}}}while(0);if((c[n>>2]|0)==(c[g>>2]|0)){Z=918;break L761}else{af=r;ag=aV;ah=aW;ai=aX;aj=aY}}else if((V|0)==1){if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=920;break L761}at=c[f>>2]|0;X=c[at+12>>2]|0;if((X|0)==(c[at+16>>2]|0)){bg=ci[c[(c[at>>2]|0)+36>>2]&255](at)|0}else{bg=c[X>>2]|0}if(!(cj[c[(c[e>>2]|0)+12>>2]&63](l,8192,bg)|0)){Z=695;break L761}X=c[f>>2]|0;at=X+12|0;av=c[at>>2]|0;if((av|0)==(c[X+16>>2]|0)){bh=ci[c[(c[X>>2]|0)+40>>2]&255](X)|0}else{c[at>>2]=av+4|0;bh=c[av>>2]|0}av=a[G]|0;if((av&1)==0){bi=1;bj=av}else{av=c[J>>2]|0;bi=(av&-2)-1|0;bj=av&255}av=bj&255;at=(av&1|0)==0?av>>>1:c[H>>2]|0;if((at|0)==(bi|0)){eq(A,bi,1,bi,bi,0,0);bk=a[G]|0}else{bk=bj}av=(bk&1)==0?H:c[I>>2]|0;c[av+(at<<2)>>2]=bh;X=at+1|0;c[av+(X<<2)>>2]=0;if((a[G]&1)==0){a[G]=X<<1&255;Z=696;break}else{c[H>>2]=X;Z=696;break}}else if((V|0)==0){Z=696}else if((V|0)==3){X=a[E]|0;av=X&255;at=(av&1|0)==0;au=a[F]|0;aq=au&255;ak=(aq&1|0)==0;if(((at?av>>>1:c[M>>2]|0)|0)==(-(ak?aq>>>1:c[K>>2]|0)|0)){af=r;ag=o;ah=T;ai=S;aj=R;break}do{if(((at?av>>>1:c[M>>2]|0)|0)!=0){if(((ak?aq>>>1:c[K>>2]|0)|0)==0){break}ay=c[f>>2]|0;aw=c[ay+12>>2]|0;if((aw|0)==(c[ay+16>>2]|0)){ax=ci[c[(c[ay>>2]|0)+36>>2]&255](ay)|0;bl=ax;bm=a[E]|0}else{bl=c[aw>>2]|0;bm=X}aw=c[f>>2]|0;ax=aw+12|0;ay=c[ax>>2]|0;as=(ay|0)==(c[aw+16>>2]|0);if((bl|0)==(c[((bm&1)==0?M:c[N>>2]|0)>>2]|0)){if(as){bf=c[(c[aw>>2]|0)+40>>2]|0;ci[bf&255](aw)}else{c[ax>>2]=ay+4|0}ax=d[E]|0;af=((ax&1|0)==0?ax>>>1:c[M>>2]|0)>>>0>1?y:r;ag=o;ah=T;ai=S;aj=R;break L785}if(as){bn=ci[c[(c[aw>>2]|0)+36>>2]&255](aw)|0}else{bn=c[ay>>2]|0}if((bn|0)!=(c[((a[F]&1)==0?K:c[L>>2]|0)>>2]|0)){Z=768;break L761}ay=c[f>>2]|0;aw=ay+12|0;as=c[aw>>2]|0;if((as|0)==(c[ay+16>>2]|0)){ax=c[(c[ay>>2]|0)+40>>2]|0;ci[ax&255](ay)}else{c[aw>>2]=as+4|0}a[k]=1;as=d[F]|0;af=((as&1|0)==0?as>>>1:c[K>>2]|0)>>>0>1?z:r;ag=o;ah=T;ai=S;aj=R;break L785}}while(0);aq=c[f>>2]|0;ak=c[aq+12>>2]|0;as=(ak|0)==(c[aq+16>>2]|0);if(((at?av>>>1:c[M>>2]|0)|0)==0){if(as){aw=ci[c[(c[aq>>2]|0)+36>>2]&255](aq)|0;bo=aw;bp=a[F]|0}else{bo=c[ak>>2]|0;bp=au}if((bo|0)!=(c[((bp&1)==0?K:c[L>>2]|0)>>2]|0)){af=r;ag=o;ah=T;ai=S;aj=R;break}aw=c[f>>2]|0;ay=aw+12|0;ax=c[ay>>2]|0;if((ax|0)==(c[aw+16>>2]|0)){bf=c[(c[aw>>2]|0)+40>>2]|0;ci[bf&255](aw)}else{c[ay>>2]=ax+4|0}a[k]=1;ax=d[F]|0;af=((ax&1|0)==0?ax>>>1:c[K>>2]|0)>>>0>1?z:r;ag=o;ah=T;ai=S;aj=R;break}if(as){as=ci[c[(c[aq>>2]|0)+36>>2]&255](aq)|0;bq=as;br=a[E]|0}else{bq=c[ak>>2]|0;br=X}if((bq|0)!=(c[((br&1)==0?M:c[N>>2]|0)>>2]|0)){a[k]=1;af=r;ag=o;ah=T;ai=S;aj=R;break}ak=c[f>>2]|0;as=ak+12|0;aq=c[as>>2]|0;if((aq|0)==(c[ak+16>>2]|0)){ax=c[(c[ak>>2]|0)+40>>2]|0;ci[ax&255](ak)}else{c[as>>2]=aq+4|0}aq=d[E]|0;af=((aq&1|0)==0?aq>>>1:c[M>>2]|0)>>>0>1?y:r;ag=o;ah=T;ai=S;aj=R}else{af=r;ag=o;ah=T;ai=S;aj=R}}while(0);L1060:do{if((Z|0)==696){Z=0;if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=920;break L761}else{bs=$}while(1){V=c[f>>2]|0;do{if((V|0)==0){bt=1}else{aq=c[V+12>>2]|0;if((aq|0)==(c[V+16>>2]|0)){bu=ci[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bu=c[aq>>2]|0}if((bu|0)==-1){c[f>>2]=0;bt=1;break}else{bt=(c[f>>2]|0)==0;break}}}while(0);do{if((bs|0)==0){Z=710}else{V=c[bs+12>>2]|0;if((V|0)==(c[bs+16>>2]|0)){bv=ci[c[(c[bs>>2]|0)+36>>2]&255](bs)|0}else{bv=c[V>>2]|0}if((bv|0)==-1){c[b>>2]=0;Z=710;break}else{if(bt^(bs|0)==0){bw=bs;break}else{af=r;ag=o;ah=T;ai=S;aj=R;break L1060}}}}while(0);if((Z|0)==710){Z=0;if(bt){af=r;ag=o;ah=T;ai=S;aj=R;break L1060}else{bw=0}}V=c[f>>2]|0;aq=c[V+12>>2]|0;if((aq|0)==(c[V+16>>2]|0)){bx=ci[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bx=c[aq>>2]|0}if(!(cj[c[(c[e>>2]|0)+12>>2]&63](l,8192,bx)|0)){af=r;ag=o;ah=T;ai=S;aj=R;break L1060}aq=c[f>>2]|0;V=aq+12|0;as=c[V>>2]|0;if((as|0)==(c[aq+16>>2]|0)){by=ci[c[(c[aq>>2]|0)+40>>2]&255](aq)|0}else{c[V>>2]=as+4|0;by=c[as>>2]|0}as=a[G]|0;if((as&1)==0){bz=1;bA=as}else{as=c[J>>2]|0;bz=(as&-2)-1|0;bA=as&255}as=bA&255;V=(as&1|0)==0?as>>>1:c[H>>2]|0;if((V|0)==(bz|0)){eq(A,bz,1,bz,bz,0,0);bB=a[G]|0}else{bB=bA}as=(bB&1)==0?H:c[I>>2]|0;c[as+(V<<2)>>2]=by;aq=V+1|0;c[as+(aq<<2)>>2]=0;if((a[G]&1)==0){a[G]=aq<<1&255;bs=bw;continue}else{c[H>>2]=aq;bs=bw;continue}}}}while(0);X=U+1|0;if(X>>>0<4){R=aj;S=ai;T=ah;o=ag;r=af;U=X}else{aa=aj;ab=ai;ac=ah;ad=af;Z=920;break}}L1107:do{if((Z|0)==907){c[j>>2]=c[j>>2]|4;bC=0;bD=aX;bE=aY}else if((Z|0)==918){c[j>>2]=c[j>>2]|4;bC=0;bD=aX;bE=aY}else if((Z|0)==920){L1111:do{if((ad|0)!=0){af=ad;ah=ad+4|0;ai=ad+8|0;aj=1;L1113:while(1){U=d[af]|0;if((U&1|0)==0){bF=U>>>1}else{bF=c[ah>>2]|0}if(aj>>>0>=bF>>>0){break L1111}U=c[f>>2]|0;do{if((U|0)==0){bG=1}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bH=ci[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bH=c[r>>2]|0}if((bH|0)==-1){c[f>>2]=0;bG=1;break}else{bG=(c[f>>2]|0)==0;break}}}while(0);U=c[b>>2]|0;do{if((U|0)==0){Z=939}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bI=ci[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bI=c[r>>2]|0}if((bI|0)==-1){c[b>>2]=0;Z=939;break}else{if(bG^(U|0)==0){break}else{break L1113}}}}while(0);if((Z|0)==939){Z=0;if(bG){break}}U=c[f>>2]|0;r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bJ=ci[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bJ=c[r>>2]|0}if((a[af]&1)==0){bK=ah}else{bK=c[ai>>2]|0}if((bJ|0)!=(c[bK+(aj<<2)>>2]|0)){break}r=aj+1|0;U=c[f>>2]|0;ag=U+12|0;o=c[ag>>2]|0;if((o|0)==(c[U+16>>2]|0)){T=c[(c[U>>2]|0)+40>>2]|0;ci[T&255](U);aj=r;continue}else{c[ag>>2]=o+4|0;aj=r;continue}}c[j>>2]=c[j>>2]|4;bC=0;bD=ab;bE=aa;break L1107}}while(0);if((ab|0)==(ac|0)){bC=1;bD=ac;bE=aa;break}c[C>>2]=0;fo(v,ab,ac,C);if((c[C>>2]|0)==0){bC=1;bD=ab;bE=aa;break}c[j>>2]=c[j>>2]|4;bC=0;bD=ab;bE=aa}else if((Z|0)==768){c[j>>2]=c[j>>2]|4;bC=0;bD=S;bE=R}else if((Z|0)==812){c[j>>2]=c[j>>2]|4;bC=0;bD=S;bE=R}else if((Z|0)==843){kC();return 0}else if((Z|0)==857){kC();return 0}else if((Z|0)==883){c[j>>2]=c[j>>2]|4;bC=0;bD=aX;bE=aY}else if((Z|0)==695){c[j>>2]=c[j>>2]|4;bC=0;bD=S;bE=R}}while(0);if((a[G]&1)!=0){ky(c[I>>2]|0)}if((a[F]&1)!=0){ky(c[L>>2]|0)}if((a[E]&1)!=0){ky(c[N>>2]|0)}if((a[D]&1)!=0){ky(c[P>>2]|0)}if((a[w]&1)!=0){ky(c[v+8>>2]|0)}if((bD|0)==0){i=p;return bC|0}ce[bE&511](bD);i=p;return bC|0}function hT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){eq(b,k,(j+h|0)-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=(j+(((e-4|0)+(-g|0)|0)>>>2)|0)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2]|0;m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function hU(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+456|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2]|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=n|0;c[s>>2]=m|0;t=n+4|0;c[t>>2]=168;u=p|0;v=c[h+28>>2]|0;c[u>>2]=v;w=v+4|0;I=c[w>>2]|0,c[w>>2]=I+1,I;w=c[u>>2]|0;if((c[3590]|0)!=-1){c[l>>2]=14360;c[l+4>>2]=12;c[l+8>>2]=0;d3(14360,l,96)}l=(c[3591]|0)-1|0;v=c[w+8>>2]|0;do{if((c[w+12>>2]|0)-v>>2>>>0>l>>>0){x=c[v+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(hS(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,m+400|0)|0){B=k;if((a[B]&1)==0){c[k+4>>2]=0;a[B]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}C=x;do{if((a[q]&1)!=0){x=cg[c[(c[C>>2]|0)+44>>2]&63](y,45)|0;D=a[B]|0;if((D&1)==0){E=1;F=D}else{D=c[k>>2]|0;E=(D&-2)-1|0;F=D&255}D=F&255;if((D&1|0)==0){G=D>>>1}else{G=c[k+4>>2]|0}if((G|0)==(E|0)){eq(k,E,1,E,E,0,0);H=a[B]|0}else{H=F}if((H&1)==0){J=k+4|0}else{J=c[k+8>>2]|0}c[J+(G<<2)>>2]=x;x=G+1|0;c[J+(x<<2)>>2]=0;if((a[B]&1)==0){a[B]=x<<1&255;break}else{c[k+4>>2]=x;break}}}while(0);B=cg[c[(c[C>>2]|0)+44>>2]&63](y,48)|0;x=c[o>>2]|0;D=x-4|0;K=c[s>>2]|0;while(1){if(K>>>0>=D>>>0){break}if((c[K>>2]|0)==(B|0)){K=K+4|0}else{break}}hT(k,K,x)}B=e|0;D=c[B>>2]|0;do{if((D|0)==0){L=0}else{y=c[D+12>>2]|0;if((y|0)==(c[D+16>>2]|0)){M=ci[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{M=c[y>>2]|0}if((M|0)!=-1){L=D;break}c[B>>2]=0;L=0}}while(0);B=(L|0)==0;do{if((A|0)==0){N=1040}else{D=c[A+12>>2]|0;if((D|0)==(c[A+16>>2]|0)){O=ci[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{O=c[D>>2]|0}if((O|0)==-1){c[z>>2]=0;N=1040;break}else{if(B^(A|0)==0){break}else{N=1042;break}}}}while(0);if((N|0)==1040){if(B){N=1042}}if((N|0)==1042){c[j>>2]=c[j>>2]|2}c[b>>2]=L;A=c[u>>2]|0;z=A+4|0;if(((I=c[z>>2]|0,c[z>>2]=I+ -1,I)|0)==0){ce[c[(c[A>>2]|0)+8>>2]&511](A|0)}A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}ce[c[t>>2]&511](A);i=d;return}}while(0);d=b3(4)|0;c[d>>2]=5688;bv(d|0,11856,198)}function hV(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3716]|0)!=-1){c[p>>2]=14864;c[p+4>>2]=12;c[p+8>>2]=0;d3(14864,p,96)}p=(c[3717]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=b3(4)|0;L=K;c[L>>2]=5688;bv(K|0,11856,198)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=b3(4)|0;L=K;c[L>>2]=5688;bv(K|0,11856,198)}K=b;cf[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;cf[c[(c[L>>2]|0)+32>>2]&127](r,K);r=l;if((a[r]&1)==0){c[l+4>>2]=0;a[r]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eo(l,0);c[r>>2]=c[s>>2]|0;c[r+4>>2]=c[s+4>>2]|0;c[r+8>>2]=c[s+8>>2]|0;kD(s|0,0,12);cf[c[(c[L>>2]|0)+28>>2]&127](t,K);t=k;if((a[t]&1)==0){c[k+4>>2]=0;a[t]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eo(k,0);c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;kD(u|0,0,12);u=b;c[f>>2]=ci[c[(c[u>>2]|0)+12>>2]&255](K)|0;c[g>>2]=ci[c[(c[u>>2]|0)+16>>2]&255](K)|0;cf[c[(c[b>>2]|0)+20>>2]&127](v,K);v=h;if((a[v]&1)==0){a[h+1|0]=0;a[v]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d5(h,0);c[v>>2]=c[w>>2]|0;c[v+4>>2]=c[w+4>>2]|0;c[v+8>>2]=c[w+8>>2]|0;kD(w|0,0,12);cf[c[(c[L>>2]|0)+24>>2]&127](x,K);x=j;if((a[x]&1)==0){c[j+4>>2]=0;a[x]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}eo(j,0);c[x>>2]=c[y>>2]|0;c[x+4>>2]=c[y+4>>2]|0;c[x+8>>2]=c[y+8>>2]|0;kD(y|0,0,12);M=ci[c[(c[u>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3718]|0)!=-1){c[o>>2]=14872;c[o+4>>2]=12;c[o+8>>2]=0;d3(14872,o,96)}o=(c[3719]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=b3(4)|0;O=N;c[O>>2]=5688;bv(N|0,11856,198)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=b3(4)|0;O=N;c[O>>2]=5688;bv(N|0,11856,198)}N=K;cf[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;cf[c[(c[O>>2]|0)+32>>2]&127](A,N);A=l;if((a[A]&1)==0){c[l+4>>2]=0;a[A]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eo(l,0);c[A>>2]=c[B>>2]|0;c[A+4>>2]=c[B+4>>2]|0;c[A+8>>2]=c[B+8>>2]|0;kD(B|0,0,12);cf[c[(c[O>>2]|0)+28>>2]&127](D,N);D=k;if((a[D]&1)==0){c[k+4>>2]=0;a[D]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eo(k,0);c[D>>2]=c[E>>2]|0;c[D+4>>2]=c[E+4>>2]|0;c[D+8>>2]=c[E+8>>2]|0;kD(E|0,0,12);E=K;c[f>>2]=ci[c[(c[E>>2]|0)+12>>2]&255](N)|0;c[g>>2]=ci[c[(c[E>>2]|0)+16>>2]&255](N)|0;cf[c[(c[K>>2]|0)+20>>2]&127](F,N);F=h;if((a[F]&1)==0){a[h+1|0]=0;a[F]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}d5(h,0);c[F>>2]=c[G>>2]|0;c[F+4>>2]=c[G+4>>2]|0;c[F+8>>2]=c[G+8>>2]|0;kD(G|0,0,12);cf[c[(c[O>>2]|0)+24>>2]&127](H,N);H=j;if((a[H]&1)==0){c[j+4>>2]=0;a[H]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}eo(j,0);c[H>>2]=c[I>>2]|0;c[H+4>>2]=c[I+4>>2]|0;c[H+8>>2]=c[I+8>>2]|0;kD(I|0,0,12);M=ci[c[(c[E>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function hW(a){a=a|0;return}function hX(a){a=a|0;ky(a);return}function hY(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=168;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=kq(k,j)|0;k=a;if((a|0)==0){kC()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}ce[c[e>>2]&511](a);l=c[g>>2]|0}}while(0);c[e>>2]=82;c[b>>2]=l+(i<<2)|0;c[d>>2]=(c[g>>2]|0)+(j>>>2<<2)|0;return}function hZ(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+280|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=e|0;n=e+120|0;o=e+232|0;p=e+240|0;q=e+248|0;r=e+256|0;s=e+264|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+100|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a2(E|0,100,1800,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){if(a[14968]|0){H=c[1170]|0}else{E=aX(1,1712,0)|0;c[1170]=E;a[14968]=1;H=E}E=ga(n,H,1800,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;J=c[n>>2]|0;if((J|0)==0){K=b3(4)|0;c[K>>2]=5656;bv(K|0,11840,32)}K=ko(E)|0;if((K|0)!=0){L=K;M=E;N=J;O=K;break}K=b3(4)|0;c[K>>2]=5656;bv(K|0,11840,32)}else{L=F;M=G;N=0;O=0}}while(0);G=o|0;F=c[j+28>>2]|0;c[G>>2]=F;H=F+4|0;I=c[H>>2]|0,c[H>>2]=I+1,I;H=c[G>>2]|0;if((c[3592]|0)!=-1){c[m>>2]=14368;c[m+4>>2]=12;c[m+8>>2]=0;d3(14368,m,96)}m=(c[3593]|0)-1|0;F=c[H+8>>2]|0;do{if((c[H+12>>2]|0)-F>>2>>>0>m>>>0){K=c[F+(m<<2)>>2]|0;if((K|0)==0){break}J=K;E=c[n>>2]|0;P=E+M|0;Q=c[(c[K>>2]|0)+32>>2]|0;cs[Q&15](J,E,P,L);if((M|0)==0){R=0}else{R=(a[c[n>>2]|0]|0)==45}kD(t|0,0,12);kD(v|0,0,12);kD(x|0,0,12);h_(g,R,o,p,q,r,s,u,w,y);P=z|0;E=c[y>>2]|0;if((M|0)>(E|0)){Q=d[x]|0;if((Q&1|0)==0){S=Q>>>1}else{S=c[w+4>>2]|0}Q=d[v]|0;if((Q&1|0)==0){T=Q>>>1}else{T=c[u+4>>2]|0}U=((M-E<<1|1)+S|0)+T|0}else{Q=d[x]|0;if((Q&1|0)==0){V=Q>>>1}else{V=c[w+4>>2]|0}Q=d[v]|0;if((Q&1|0)==0){W=Q>>>1}else{W=c[u+4>>2]|0}U=(V+2|0)+W|0}Q=U+E|0;do{if(Q>>>0>100){K=ko(Q)|0;if((K|0)!=0){X=K;Y=K;break}K=b3(4)|0;c[K>>2]=5656;bv(K|0,11840,32)}else{X=P;Y=0}}while(0);h0(X,A,C,c[j+4>>2]|0,L,L+M|0,J,R,p,a[q]|0,a[r]|0,s,u,w,E);c[D>>2]=c[f>>2]|0;de(b,D,X,c[A>>2]|0,c[C>>2]|0,j,k);if((Y|0)!=0){kp(Y)}if((a[x]&1)!=0){ky(c[w+8>>2]|0)}if((a[v]&1)!=0){ky(c[u+8>>2]|0)}if((a[t]&1)!=0){ky(c[s+8>>2]|0)}P=c[G>>2]|0;Q=P+4|0;if(((I=c[Q>>2]|0,c[Q>>2]=I+ -1,I)|0)==0){ce[c[(c[P>>2]|0)+8>>2]&511](P|0)}if((O|0)!=0){kp(O)}if((N|0)==0){i=e;return}kp(N);i=e;return}}while(0);e=b3(4)|0;c[e>>2]=5688;bv(e|0,11856,198)}function h_(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3720]|0)!=-1){c[p>>2]=14880;c[p+4>>2]=12;c[p+8>>2]=0;d3(14880,p,96)}p=(c[3721]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=b3(4)|0;R=Q;c[R>>2]=5688;bv(Q|0,11856,198)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=b3(4)|0;R=Q;c[R>>2]=5688;bv(Q|0,11856,198)}Q=e;R=c[e>>2]|0;if(d){cf[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;cf[c[(c[e>>2]|0)+32>>2]&127](s,Q);s=l;if((a[s]&1)==0){a[l+1|0]=0;a[s]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d5(l,0);c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;kD(t|0,0,12)}else{cf[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;cf[c[(c[e>>2]|0)+28>>2]&127](w,Q);w=l;if((a[w]&1)==0){a[l+1|0]=0;a[w]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d5(l,0);c[w>>2]=c[x>>2]|0;c[w+4>>2]=c[x+4>>2]|0;c[w+8>>2]=c[x+8>>2]|0;kD(x|0,0,12)}x=e;a[g]=ci[c[(c[x>>2]|0)+12>>2]&255](Q)|0;a[h]=ci[c[(c[x>>2]|0)+16>>2]&255](Q)|0;x=e;cf[c[(c[x>>2]|0)+20>>2]&127](y,Q);y=j;if((a[y]&1)==0){a[j+1|0]=0;a[y]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d5(j,0);c[y>>2]=c[z>>2]|0;c[y+4>>2]=c[z+4>>2]|0;c[y+8>>2]=c[z+8>>2]|0;kD(z|0,0,12);cf[c[(c[x>>2]|0)+24>>2]&127](A,Q);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d5(k,0);c[A>>2]=c[B>>2]|0;c[A+4>>2]=c[B+4>>2]|0;c[A+8>>2]=c[B+8>>2]|0;kD(B|0,0,12);S=ci[c[(c[e>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3722]|0)!=-1){c[o>>2]=14888;c[o+4>>2]=12;c[o+8>>2]=0;d3(14888,o,96)}o=(c[3723]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=b3(4)|0;U=T;c[U>>2]=5688;bv(T|0,11856,198)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=b3(4)|0;U=T;c[U>>2]=5688;bv(T|0,11856,198)}T=P;U=c[P>>2]|0;if(d){cf[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;cf[c[(c[P>>2]|0)+32>>2]&127](F,T);F=l;if((a[F]&1)==0){a[l+1|0]=0;a[F]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d5(l,0);c[F>>2]=c[G>>2]|0;c[F+4>>2]=c[G+4>>2]|0;c[F+8>>2]=c[G+8>>2]|0;kD(G|0,0,12)}else{cf[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;cf[c[(c[P>>2]|0)+28>>2]&127](J,T);J=l;if((a[J]&1)==0){a[l+1|0]=0;a[J]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}d5(l,0);c[J>>2]=c[K>>2]|0;c[J+4>>2]=c[K+4>>2]|0;c[J+8>>2]=c[K+8>>2]|0;kD(K|0,0,12)}K=P;a[g]=ci[c[(c[K>>2]|0)+12>>2]&255](T)|0;a[h]=ci[c[(c[K>>2]|0)+16>>2]&255](T)|0;K=P;cf[c[(c[K>>2]|0)+20>>2]&127](L,T);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d5(j,0);c[L>>2]=c[M>>2]|0;c[L+4>>2]=c[M+4>>2]|0;c[L+8>>2]=c[M+8>>2]|0;kD(M|0,0,12);cf[c[(c[K>>2]|0)+24>>2]&127](N,T);N=k;if((a[N]&1)==0){a[k+1|0]=0;a[N]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}d5(k,0);c[N>>2]=c[O>>2]|0;c[N+4>>2]=c[O+4>>2]|0;c[N+8>>2]=c[O+8>>2]|0;kD(O|0,0,12);S=ci[c[(c[P>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function h$(a){a=a|0;return}function h0(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;L1520:do{if((H|0)==0){c[e>>2]=c[f>>2]|0;I=G}else if((H|0)==1){c[e>>2]=c[f>>2]|0;J=cg[c[(c[s>>2]|0)+28>>2]&63](j,32)|0;K=c[f>>2]|0;c[f>>2]=K+1|0;a[K]=J;I=G}else if((H|0)==3){J=a[t]|0;K=J&255;if((K&1|0)==0){L=K>>>1}else{L=c[w>>2]|0}if((L|0)==0){I=G;break}if((J&1)==0){M=u}else{M=c[v>>2]|0}J=a[M]|0;K=c[f>>2]|0;c[f>>2]=K+1|0;a[K]=J;I=G}else if((H|0)==2){J=a[q]|0;K=J&255;N=(K&1|0)==0;if(N){O=K>>>1}else{O=c[z>>2]|0}if((O|0)==0|x){I=G;break}if((J&1)==0){P=y;Q=y}else{J=c[A>>2]|0;P=J;Q=J}if(N){R=K>>>1}else{R=c[z>>2]|0}K=P+R|0;N=c[f>>2]|0;L1545:do{if((Q|0)==(K|0)){S=N}else{J=Q;T=N;while(1){a[T]=a[J]|0;U=J+1|0;V=T+1|0;if((U|0)==(K|0)){S=V;break L1545}else{J=U;T=V}}}}while(0);c[f>>2]=S;I=G}else if((H|0)==4){K=c[f>>2]|0;N=k?G+1|0:G;T=N;while(1){if(T>>>0>=i>>>0){break}J=a[T]|0;if(J<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(J<<24>>24<<1)>>1]&2048)==0){break}else{T=T+1|0}}J=T;if(B){if(T>>>0>N>>>0){V=N+(-J|0)|0;J=V>>>0<o>>>0?o:V;V=J+r|0;U=T;W=r;X=K;while(1){Y=U-1|0;Z=a[Y]|0;c[f>>2]=X+1|0;a[X]=Z;Z=W-1|0;_=(Z|0)>0;if(!(Y>>>0>N>>>0&_)){break}U=Y;W=Z;X=c[f>>2]|0}X=T+J|0;if(_){$=V;aa=X;ab=1306}else{ac=0;ad=V;ae=X}}else{$=r;aa=T;ab=1306}if((ab|0)==1306){ab=0;ac=cg[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;ad=$;ae=aa}X=c[f>>2]|0;c[f>>2]=X+1|0;L1566:do{if((ad|0)>0){W=ad;U=X;while(1){a[U]=ac;Z=W-1|0;Y=c[f>>2]|0;c[f>>2]=Y+1|0;if((Z|0)>0){W=Z;U=Y}else{af=Y;break L1566}}}else{af=X}}while(0);a[af]=m;ag=ae}else{ag=T}L1571:do{if((ag|0)==(N|0)){X=cg[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;V=c[f>>2]|0;c[f>>2]=V+1|0;a[V]=X}else{X=a[C]|0;V=X&255;if((V&1|0)==0){ah=V>>>1}else{ah=c[F>>2]|0}if((ah|0)==0){ai=ag;aj=0;ak=0;al=-1}else{if((X&1)==0){am=D}else{am=c[E>>2]|0}ai=ag;aj=0;ak=0;al=a[am]|0}while(1){do{if((aj|0)==(al|0)){X=c[f>>2]|0;c[f>>2]=X+1|0;a[X]=n;X=ak+1|0;V=a[C]|0;J=V&255;if((J&1|0)==0){an=J>>>1}else{an=c[F>>2]|0}if(X>>>0>=an>>>0){ao=al;ap=X;aq=0;break}J=(V&1)==0;if(J){ar=D}else{ar=c[E>>2]|0}if((a[ar+X|0]|0)==127){ao=-1;ap=X;aq=0;break}if(J){as=D}else{as=c[E>>2]|0}ao=a[as+X|0]|0;ap=X;aq=0}else{ao=al;ap=ak;aq=aj}}while(0);X=ai-1|0;J=a[X]|0;V=c[f>>2]|0;c[f>>2]=V+1|0;a[V]=J;if((X|0)==(N|0)){break L1571}else{ai=X;aj=aq+1|0;ak=ap;al=ao}}}}while(0);T=c[f>>2]|0;if((K|0)==(T|0)){I=N;break}X=T-1|0;if(K>>>0<X>>>0){at=K;au=X}else{I=N;break}while(1){X=a[at]|0;a[at]=a[au]|0;a[au]=X;X=at+1|0;T=au-1|0;if(X>>>0<T>>>0){at=X;au=T}else{I=N;break L1520}}}else{I=G}}while(0);H=h+1|0;if(H>>>0<4){G=I;h=H}else{break}}h=a[t]|0;t=h&255;I=(t&1|0)==0;if(I){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(I){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;L1619:do{if((aw|0)==(w|0)){az=ay}else{ax=ay;t=aw;while(1){a[ax]=a[t]|0;I=ax+1|0;u=t+1|0;if((u|0)==(w|0)){az=I;break L1619}else{ax=I;t=u}}}}while(0);c[f>>2]=az}az=g&176;if((az|0)==32){c[e>>2]=c[f>>2]|0;return}else if((az|0)==16){return}else{c[e>>2]=d;return}}function h1(a){a=a|0;ky(a);return}function h2(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+100|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;B=m|0;C=c[h+28>>2]|0;c[B>>2]=C;D=C+4|0;I=c[D>>2]|0,c[D>>2]=I+1,I;D=c[B>>2]|0;if((c[3592]|0)!=-1){c[l>>2]=14368;c[l+4>>2]=12;c[l+8>>2]=0;d3(14368,l,96)}l=(c[3593]|0)-1|0;C=c[D+8>>2]|0;do{if((c[D+12>>2]|0)-C>>2>>>0>l>>>0){E=c[C+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=k;J=a[H]|0;K=J&255;if((K&1|0)==0){L=K>>>1}else{L=c[k+4>>2]|0}if((L|0)==0){M=0}else{if((J&1)==0){N=G+1|0}else{N=c[k+8>>2]|0}J=a[N]|0;M=J<<24>>24==cg[c[(c[E>>2]|0)+28>>2]&63](F,45)<<24>>24}kD(r|0,0,12);kD(t|0,0,12);kD(v|0,0,12);h_(g,M,m,n,o,p,q,s,u,w);E=x|0;J=a[H]|0;K=J&255;O=(K&1|0)==0;if(O){P=K>>>1}else{P=c[k+4>>2]|0}Q=c[w>>2]|0;if((P|0)>(Q|0)){if(O){R=K>>>1}else{R=c[k+4>>2]|0}K=d[v]|0;if((K&1|0)==0){S=K>>>1}else{S=c[u+4>>2]|0}K=d[t]|0;if((K&1|0)==0){T=K>>>1}else{T=c[s+4>>2]|0}U=((R-Q<<1|1)+S|0)+T|0}else{K=d[v]|0;if((K&1|0)==0){V=K>>>1}else{V=c[u+4>>2]|0}K=d[t]|0;if((K&1|0)==0){W=K>>>1}else{W=c[s+4>>2]|0}U=(V+2|0)+W|0}K=U+Q|0;do{if(K>>>0>100){O=ko(K)|0;if((O|0)!=0){X=O;Y=O;Z=a[H]|0;break}O=b3(4)|0;c[O>>2]=5656;bv(O|0,11840,32)}else{X=E;Y=0;Z=J}}while(0);if((Z&1)==0){_=G+1|0;$=G+1|0}else{J=c[k+8>>2]|0;_=J;$=J}J=Z&255;if((J&1|0)==0){aa=J>>>1}else{aa=c[k+4>>2]|0}h0(X,y,z,c[h+4>>2]|0,$,_+aa|0,F,M,n,a[o]|0,a[p]|0,q,s,u,Q);c[A>>2]=c[f>>2]|0;de(b,A,X,c[y>>2]|0,c[z>>2]|0,h,j);if((Y|0)!=0){kp(Y)}if((a[v]&1)!=0){ky(c[u+8>>2]|0)}if((a[t]&1)!=0){ky(c[s+8>>2]|0)}if((a[r]&1)!=0){ky(c[q+8>>2]|0)}J=c[B>>2]|0;E=J+4|0;if(((I=c[E>>2]|0,c[E>>2]=I+ -1,I)|0)!=0){i=e;return}ce[c[(c[J>>2]|0)+8>>2]&511](J|0);i=e;return}}while(0);e=b3(4)|0;c[e>>2]=5688;bv(e|0,11856,198)}function h3(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;e=i;i=i+576|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2]|0;m=e|0;n=e+120|0;o=e+528|0;p=e+536|0;q=e+544|0;r=e+552|0;s=e+560|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+400|0;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a2(E|0,100,1800,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){if(a[14968]|0){H=c[1170]|0}else{E=aX(1,1712,0)|0;c[1170]=E;a[14968]=1;H=E}E=ga(n,H,1800,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;J=c[n>>2]|0;if((J|0)==0){K=b3(4)|0;c[K>>2]=5656;bv(K|0,11840,32)}K=ko(E<<2)|0;L=K;if((K|0)!=0){M=L;N=E;O=J;P=L;break}L=b3(4)|0;c[L>>2]=5656;bv(L|0,11840,32)}else{M=F;N=G;O=0;P=0}}while(0);G=o|0;F=c[j+28>>2]|0;c[G>>2]=F;H=F+4|0;I=c[H>>2]|0,c[H>>2]=I+1,I;H=c[G>>2]|0;if((c[3590]|0)!=-1){c[m>>2]=14360;c[m+4>>2]=12;c[m+8>>2]=0;d3(14360,m,96)}m=(c[3591]|0)-1|0;F=c[H+8>>2]|0;do{if((c[H+12>>2]|0)-F>>2>>>0>m>>>0){L=c[F+(m<<2)>>2]|0;if((L|0)==0){break}J=L;E=c[n>>2]|0;K=E+N|0;Q=c[(c[L>>2]|0)+48>>2]|0;cs[Q&15](J,E,K,M);if((N|0)==0){R=0}else{R=(a[c[n>>2]|0]|0)==45}kD(t|0,0,12);kD(v|0,0,12);kD(x|0,0,12);h4(g,R,o,p,q,r,s,u,w,y);K=z|0;E=c[y>>2]|0;if((N|0)>(E|0)){Q=d[x]|0;if((Q&1|0)==0){S=Q>>>1}else{S=c[w+4>>2]|0}Q=d[v]|0;if((Q&1|0)==0){T=Q>>>1}else{T=c[u+4>>2]|0}U=((N-E<<1|1)+S|0)+T|0}else{Q=d[x]|0;if((Q&1|0)==0){V=Q>>>1}else{V=c[w+4>>2]|0}Q=d[v]|0;if((Q&1|0)==0){W=Q>>>1}else{W=c[u+4>>2]|0}U=(V+2|0)+W|0}Q=U+E|0;do{if(Q>>>0>100){L=ko(Q<<2)|0;X=L;if((L|0)!=0){Y=X;Z=X;break}X=b3(4)|0;c[X>>2]=5656;bv(X|0,11840,32)}else{Y=K;Z=0}}while(0);h5(Y,A,C,c[j+4>>2]|0,M,M+(N<<2)|0,J,R,p,c[q>>2]|0,c[r>>2]|0,s,u,w,E);c[D>>2]=c[f>>2]|0;gl(b,D,Y,c[A>>2]|0,c[C>>2]|0,j,k);if((Z|0)!=0){kp(Z)}if((a[x]&1)!=0){ky(c[w+8>>2]|0)}if((a[v]&1)!=0){ky(c[u+8>>2]|0)}if((a[t]&1)!=0){ky(c[s+8>>2]|0)}K=c[G>>2]|0;Q=K+4|0;if(((I=c[Q>>2]|0,c[Q>>2]=I+ -1,I)|0)==0){ce[c[(c[K>>2]|0)+8>>2]&511](K|0)}if((P|0)!=0){kp(P)}if((O|0)==0){i=e;return}kp(O);i=e;return}}while(0);e=b3(4)|0;c[e>>2]=5688;bv(e|0,11856,198)}function h4(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3716]|0)!=-1){c[p>>2]=14864;c[p+4>>2]=12;c[p+8>>2]=0;d3(14864,p,96)}p=(c[3717]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=b3(4)|0;R=Q;c[R>>2]=5688;bv(Q|0,11856,198)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=b3(4)|0;R=Q;c[R>>2]=5688;bv(Q|0,11856,198)}Q=e;R=c[e>>2]|0;if(d){cf[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;cf[c[(c[e>>2]|0)+32>>2]&127](s,Q);s=l;if((a[s]&1)==0){c[l+4>>2]=0;a[s]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eo(l,0);c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;kD(t|0,0,12)}else{cf[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;cf[c[(c[e>>2]|0)+28>>2]&127](w,Q);w=l;if((a[w]&1)==0){c[l+4>>2]=0;a[w]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eo(l,0);c[w>>2]=c[x>>2]|0;c[w+4>>2]=c[x+4>>2]|0;c[w+8>>2]=c[x+8>>2]|0;kD(x|0,0,12)}x=e;c[g>>2]=ci[c[(c[x>>2]|0)+12>>2]&255](Q)|0;c[h>>2]=ci[c[(c[x>>2]|0)+16>>2]&255](Q)|0;cf[c[(c[e>>2]|0)+20>>2]&127](y,Q);y=j;if((a[y]&1)==0){a[j+1|0]=0;a[y]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d5(j,0);c[y>>2]=c[z>>2]|0;c[y+4>>2]=c[z+4>>2]|0;c[y+8>>2]=c[z+8>>2]|0;kD(z|0,0,12);cf[c[(c[e>>2]|0)+24>>2]&127](A,Q);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eo(k,0);c[A>>2]=c[B>>2]|0;c[A+4>>2]=c[B+4>>2]|0;c[A+8>>2]=c[B+8>>2]|0;kD(B|0,0,12);S=ci[c[(c[x>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3718]|0)!=-1){c[o>>2]=14872;c[o+4>>2]=12;c[o+8>>2]=0;d3(14872,o,96)}o=(c[3719]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=b3(4)|0;U=T;c[U>>2]=5688;bv(T|0,11856,198)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=b3(4)|0;U=T;c[U>>2]=5688;bv(T|0,11856,198)}T=P;U=c[P>>2]|0;if(d){cf[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;cf[c[(c[P>>2]|0)+32>>2]&127](F,T);F=l;if((a[F]&1)==0){c[l+4>>2]=0;a[F]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eo(l,0);c[F>>2]=c[G>>2]|0;c[F+4>>2]=c[G+4>>2]|0;c[F+8>>2]=c[G+8>>2]|0;kD(G|0,0,12)}else{cf[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;cf[c[(c[P>>2]|0)+28>>2]&127](J,T);J=l;if((a[J]&1)==0){c[l+4>>2]=0;a[J]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eo(l,0);c[J>>2]=c[K>>2]|0;c[J+4>>2]=c[K+4>>2]|0;c[J+8>>2]=c[K+8>>2]|0;kD(K|0,0,12)}K=P;c[g>>2]=ci[c[(c[K>>2]|0)+12>>2]&255](T)|0;c[h>>2]=ci[c[(c[K>>2]|0)+16>>2]&255](T)|0;cf[c[(c[P>>2]|0)+20>>2]&127](L,T);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}d5(j,0);c[L>>2]=c[M>>2]|0;c[L+4>>2]=c[M+4>>2]|0;c[L+8>>2]=c[M+8>>2]|0;kD(M|0,0,12);cf[c[(c[P>>2]|0)+24>>2]&127](N,T);N=k;if((a[N]&1)==0){c[k+4>>2]=0;a[N]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eo(k,0);c[N>>2]=c[O>>2]|0;c[N+4>>2]=c[O+4>>2]|0;c[N+8>>2]=c[O+8>>2]|0;kD(O|0,0,12);S=ci[c[(c[K>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function h5(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;L1867:do{if((D|0)==0){c[d>>2]=c[e>>2]|0;E=n}else if((D|0)==1){c[d>>2]=c[e>>2]|0;F=cg[c[(c[r>>2]|0)+44>>2]&63](i,32)|0;G=c[e>>2]|0;c[e>>2]=G+4|0;c[G>>2]=F;E=n}else if((D|0)==3){F=a[s]|0;G=F&255;if((G&1|0)==0){H=G>>>1}else{H=c[t>>2]|0}if((H|0)==0){E=n;break}if((F&1)==0){I=t}else{I=c[u>>2]|0}F=c[I>>2]|0;G=c[e>>2]|0;c[e>>2]=G+4|0;c[G>>2]=F;E=n}else if((D|0)==2){F=a[p]|0;G=F&255;J=(G&1|0)==0;if(J){K=G>>>1}else{K=c[w>>2]|0}if((K|0)==0|v){E=n;break}if((F&1)==0){L=w;M=w;N=w}else{F=c[x>>2]|0;L=F;M=F;N=F}if(J){O=G>>>1}else{O=c[w>>2]|0}G=L+(O<<2)|0;J=c[e>>2]|0;if((M|0)==(G|0)){P=J}else{F=((L+(O-1<<2)|0)+(-N|0)|0)>>>2;Q=M;R=J;while(1){c[R>>2]=c[Q>>2]|0;S=Q+4|0;if((S|0)==(G|0)){break}Q=S;R=R+4|0}P=J+(F+1<<2)|0}c[e>>2]=P;E=n}else if((D|0)==4){R=c[e>>2]|0;Q=j?n+4|0:n;G=Q;while(1){if(G>>>0>=h>>>0){break}if(cj[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[G>>2]|0)|0){G=G+4|0}else{break}}if(y){if(G>>>0>Q>>>0){F=G;J=q;while(1){T=F-4|0;S=c[T>>2]|0;U=c[e>>2]|0;c[e>>2]=U+4|0;c[U>>2]=S;V=J-1|0;W=(V|0)>0;if(T>>>0>Q>>>0&W){F=T;J=V}else{break}}if(W){X=V;Y=T;Z=1610}else{_=0;$=V;aa=T}}else{X=q;Y=G;Z=1610}if((Z|0)==1610){Z=0;_=cg[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;$=X;aa=Y}J=c[e>>2]|0;c[e>>2]=J+4|0;L1914:do{if(($|0)>0){F=$;S=J;while(1){c[S>>2]=_;U=F-1|0;ab=c[e>>2]|0;c[e>>2]=ab+4|0;if((U|0)>0){F=U;S=ab}else{ac=ab;break L1914}}}else{ac=J}}while(0);c[ac>>2]=l;ad=aa}else{ad=G}L1919:do{if((ad|0)==(Q|0)){J=cg[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;S=c[e>>2]|0;c[e>>2]=S+4|0;c[S>>2]=J}else{J=a[z]|0;S=J&255;if((S&1|0)==0){ae=S>>>1}else{ae=c[C>>2]|0}if((ae|0)==0){af=ad;ag=0;ah=0;ai=-1}else{if((J&1)==0){aj=A}else{aj=c[B>>2]|0}af=ad;ag=0;ah=0;ai=a[aj]|0}while(1){do{if((ag|0)==(ai|0)){J=c[e>>2]|0;c[e>>2]=J+4|0;c[J>>2]=m;J=ah+1|0;S=a[z]|0;F=S&255;if((F&1|0)==0){ak=F>>>1}else{ak=c[C>>2]|0}if(J>>>0>=ak>>>0){al=ai;am=J;an=0;break}F=(S&1)==0;if(F){ao=A}else{ao=c[B>>2]|0}if((a[ao+J|0]|0)==127){al=-1;am=J;an=0;break}if(F){ap=A}else{ap=c[B>>2]|0}al=a[ap+J|0]|0;am=J;an=0}else{al=ai;am=ah;an=ag}}while(0);J=af-4|0;F=c[J>>2]|0;S=c[e>>2]|0;c[e>>2]=S+4|0;c[S>>2]=F;if((J|0)==(Q|0)){break L1919}else{af=J;ag=an+1|0;ah=am;ai=al}}}}while(0);G=c[e>>2]|0;if((R|0)==(G|0)){E=Q;break}J=G-4|0;if(R>>>0<J>>>0){aq=R;ar=J}else{E=Q;break}while(1){J=c[aq>>2]|0;c[aq>>2]=c[ar>>2]|0;c[ar>>2]=J;J=aq+4|0;G=ar-4|0;if(J>>>0<G>>>0){aq=J;ar=G}else{E=Q;break L1867}}}else{E=n}}while(0);D=g+1|0;if(D>>>0<4){n=E;g=D}else{break}}g=a[s]|0;s=g&255;E=(s&1|0)==0;if(E){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(E){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;E=au+4|0;if((E|0)==(t|0)){ax=s}else{au=(((at+(aw-2<<2)|0)+(-av|0)|0)>>>2)+1|0;av=s;aw=E;while(1){c[av>>2]=c[aw>>2]|0;E=aw+4|0;if((E|0)==(t|0)){break}else{av=av+4|0;aw=E}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==32){c[d>>2]=c[e>>2]|0;return}else if((ax|0)==16){return}else{c[d>>2]=b;return}}function h6(a){a=a|0;return}function h7(a){a=a|0;return}function h8(a){a=a|0;ky(a);return}function h9(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bj(f|0,200)|0;return d>>>(((d|0)!=-1&1)>>>0)|0}function ia(a,b){a=a|0;b=b|0;a9(((b|0)==-1?-1:b<<1)|0);return}function ib(a){a=a|0;ky(a);return}function ic(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bj(f|0,200)|0;return d>>>(((d|0)!=-1&1)>>>0)|0}function id(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2]|0;l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+400|0;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;B=m|0;C=c[h+28>>2]|0;c[B>>2]=C;D=C+4|0;I=c[D>>2]|0,c[D>>2]=I+1,I;D=c[B>>2]|0;if((c[3590]|0)!=-1){c[l>>2]=14360;c[l+4>>2]=12;c[l+8>>2]=0;d3(14360,l,96)}l=(c[3591]|0)-1|0;C=c[D+8>>2]|0;do{if((c[D+12>>2]|0)-C>>2>>>0>l>>>0){E=c[C+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=a[G]|0;J=H&255;if((J&1|0)==0){K=J>>>1}else{K=c[k+4>>2]|0}if((K|0)==0){L=0}else{if((H&1)==0){M=k+4|0}else{M=c[k+8>>2]|0}H=c[M>>2]|0;L=(H|0)==(cg[c[(c[E>>2]|0)+44>>2]&63](F,45)|0)}kD(r|0,0,12);kD(t|0,0,12);kD(v|0,0,12);h4(g,L,m,n,o,p,q,s,u,w);E=x|0;H=a[G]|0;J=H&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[k+4>>2]|0}P=c[w>>2]|0;if((O|0)>(P|0)){if(N){Q=J>>>1}else{Q=c[k+4>>2]|0}J=d[v]|0;if((J&1|0)==0){R=J>>>1}else{R=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){S=J>>>1}else{S=c[s+4>>2]|0}T=((Q-P<<1|1)+R|0)+S|0}else{J=d[v]|0;if((J&1|0)==0){U=J>>>1}else{U=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){V=J>>>1}else{V=c[s+4>>2]|0}T=(U+2|0)+V|0}J=T+P|0;do{if(J>>>0>100){N=ko(J<<2)|0;W=N;if((N|0)!=0){X=W;Y=W;Z=a[G]|0;break}W=b3(4)|0;c[W>>2]=5656;bv(W|0,11840,32)}else{X=E;Y=0;Z=H}}while(0);if((Z&1)==0){_=k+4|0;$=k+4|0}else{H=c[k+8>>2]|0;_=H;$=H}H=Z&255;if((H&1|0)==0){aa=H>>>1}else{aa=c[k+4>>2]|0}h5(X,y,z,c[h+4>>2]|0,$,_+(aa<<2)|0,F,L,n,c[o>>2]|0,c[p>>2]|0,q,s,u,P);c[A>>2]=c[f>>2]|0;gl(b,A,X,c[y>>2]|0,c[z>>2]|0,h,j);if((Y|0)!=0){kp(Y)}if((a[v]&1)!=0){ky(c[u+8>>2]|0)}if((a[t]&1)!=0){ky(c[s+8>>2]|0)}if((a[r]&1)!=0){ky(c[q+8>>2]|0)}H=c[B>>2]|0;E=H+4|0;if(((I=c[E>>2]|0,c[E>>2]=I+ -1,I)|0)!=0){i=e;return}ce[c[(c[H>>2]|0)+8>>2]&511](H|0);i=e;return}}while(0);e=b3(4)|0;c[e>>2]=5688;bv(e|0,11856,198)}function ie(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+16|0;j=d|0;k=j;kD(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=j+1|0;o=j+8|0;m=j|0;n=j+4|0;r=p;s=0;while(1){t=a[r]|0;if((s&1)==0){u=10;v=s}else{w=c[m>>2]|0;u=(w&-2)-1|0;v=w&255}w=v&255;x=(w&1|0)==0?w>>>1:c[n>>2]|0;if((x|0)==(u|0)){if((u|0)==-3){y=1763;break}w=(v&1)==0?q:c[o>>2]|0;do{if(u>>>0<2147483631){z=u+1|0;A=u<<1;B=z>>>0<A>>>0?A:z;if(B>>>0<11){C=11;break}C=B+16&-16}else{C=-2}}while(0);B=ku(C)|0;kE(B|0,w|0,u);if((u|0)!=10){ky(w)}c[o>>2]=B;B=C|1;c[m>>2]=B;D=B&255}else{D=v}B=(D&1)==0?q:c[o>>2]|0;a[B+x|0]=t;z=x+1|0;a[B+z|0]=0;B=a[k]|0;if((B&1)==0){A=z<<1&255;a[k]=A;E=A}else{c[n>>2]=z;E=B}B=r+1|0;if(B>>>0<h>>>0){r=B;s=E}else{y=1776;break}}if((y|0)==1763){d4(0)}else if((y|0)==1776){s=(e|0)==-1?-1:e<<1;if((E&1)==0){F=s;y=1781;break}G=c[j+8>>2]|0;H=s;break}}else{F=(e|0)==-1?-1:e<<1;y=1781}}while(0);if((y|0)==1781){G=j+1|0;H=F}F=b0(H|0,f|0,g|0,G|0)|0;kD(l|0,0,12);G=kG(F|0)|0;g=F+G|0;L2121:do{if((G|0)>0){f=b+1|0;H=b+4|0;y=b+8|0;e=b|0;E=F;h=0;while(1){D=a[E]|0;if((h&1)==0){I=10;J=h}else{v=c[e>>2]|0;I=(v&-2)-1|0;J=v&255}v=J&255;if((v&1|0)==0){K=v>>>1}else{K=c[H>>2]|0}if((K|0)==(I|0)){en(b,I,1,I,I,0,0);L=a[l]|0}else{L=J}if((L&1)==0){M=f}else{M=c[y>>2]|0}a[M+K|0]=D;D=K+1|0;a[M+D|0]=0;v=a[l]|0;if((v&1)==0){C=D<<1&255;a[l]=C;N=C}else{c[H>>2]=D;N=v}v=E+1|0;if(v>>>0<g>>>0){E=v;h=N}else{break L2121}}}}while(0);if((a[k]&1)==0){i=d;return}ky(c[j+8>>2]|0);i=d;return}function ig(a,b){a=a|0;b=b|0;a9(((b|0)==-1?-1:b<<1)|0);return}function ih(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;kD(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=7400;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=r+1|0;C=r+8|0;D=r|0;E=r+4|0;F=z;G=7400;L2161:while(1){c[m>>2]=F;H=(co[c[G+12>>2]&31](w,j,F,h,m,y,A,l)|0)==2;I=c[m>>2]|0;if(H|(I|0)==(F|0)){J=1823;break}if(y>>>0<(c[l>>2]|0)>>>0){H=y;K=a[s]|0;while(1){L=a[H]|0;if((K&1)==0){M=10;N=K}else{O=c[D>>2]|0;M=(O&-2)-1|0;N=O&255}O=N&255;P=(O&1|0)==0?O>>>1:c[E>>2]|0;if((P|0)==(M|0)){if((M|0)==-3){J=1833;break L2161}O=(N&1)==0?x:c[C>>2]|0;do{if(M>>>0<2147483631){Q=M+1|0;R=M<<1;S=Q>>>0<R>>>0?R:Q;if(S>>>0<11){T=11;break}T=S+16&-16}else{T=-2}}while(0);S=ku(T)|0;kE(S|0,O|0,M);if((M|0)!=10){ky(O)}c[C>>2]=S;S=T|1;c[D>>2]=S;U=S&255}else{U=N}S=(U&1)==0?x:c[C>>2]|0;a[S+P|0]=L;Q=P+1|0;a[S+Q|0]=0;S=a[s]|0;if((S&1)==0){R=Q<<1&255;a[s]=R;V=R}else{c[E>>2]=Q;V=S}S=H+1|0;if(S>>>0<(c[l>>2]|0)>>>0){H=S;K=V}else{break}}W=c[m>>2]|0}else{W=I}if(W>>>0>=h>>>0){J=1849;break}F=W;G=c[B>>2]|0}if((J|0)==1849){B=(e|0)==-1?-1:e<<1;if((a[s]&1)==0){X=B;J=1856;break}Y=c[r+8>>2]|0;Z=B;break}else if((J|0)==1823){B=b3(8)|0;c[B>>2]=5720;G=B+4|0;if((G|0)!=0){F=kv(33)|0;c[F+4>>2]=20;c[F>>2]=20;E=F+12|0;c[G>>2]=E;c[F+8>>2]=0;kE(E|0,1168,21)}bv(B|0,11872,72)}else if((J|0)==1833){d4(0)}}else{X=(e|0)==-1?-1:e<<1;J=1856}}while(0);if((J|0)==1856){Y=r+1|0;Z=X}X=b0(Z|0,f|0,g|0,Y|0)|0;kD(v|0,0,12);Y=u|0;c[u+4>>2]=0;c[u>>2]=7344;g=kG(X|0)|0;f=X+g|0;L2206:do{if((g|0)>=1){Z=u;J=f;e=o|0;W=o+128|0;h=b+4|0;m=b+8|0;V=b|0;l=X;U=0;N=7344;while(1){c[q>>2]=l;T=(co[c[N+16>>2]&31](Y,n,l,(J-l|0)>32?l+32|0:f,q,e,W,p)|0)==2;M=c[q>>2]|0;if(T|(M|0)==(l|0)){break}if(e>>>0<(c[p>>2]|0)>>>0){T=e;j=U;while(1){w=c[T>>2]|0;if((j&1)==0){_=1;$=j}else{z=c[V>>2]|0;_=(z&-2)-1|0;$=z&255}z=$&255;if((z&1|0)==0){aa=z>>>1}else{aa=c[h>>2]|0}if((aa|0)==(_|0)){eq(b,_,1,_,_,0,0);ab=a[v]|0}else{ab=$}if((ab&1)==0){ac=h}else{ac=c[m>>2]|0}c[ac+(aa<<2)>>2]=w;w=aa+1|0;c[ac+(w<<2)>>2]=0;z=a[v]|0;if((z&1)==0){k=w<<1&255;a[v]=k;ad=k}else{c[h>>2]=w;ad=z}z=T+4|0;if(z>>>0<(c[p>>2]|0)>>>0){T=z;j=ad}else{break}}ae=c[q>>2]|0;af=ad}else{ae=M;af=U}if(ae>>>0>=f>>>0){break L2206}l=ae;U=af;N=c[Z>>2]|0}Z=b3(8)|0;c[Z>>2]=5720;N=Z+4|0;if((N|0)!=0){U=kv(33)|0;c[U+4>>2]=20;c[U>>2]=20;l=U+12|0;c[N>>2]=l;c[U+8>>2]=0;kE(l|0,1168,21)}bv(Z|0,11872,72)}}while(0);if((a[s]&1)==0){i=d;return}ky(c[r+8>>2]|0);i=d;return}function ii(a){a=a|0;var b=0;c[a>>2]=6816;b=c[a+8>>2]|0;if((b|0)==0){return}bi(b|0);return}function ij(b){b=b|0;var d=0,e=0,f=0,g=0;b=b3(8)|0;c[b>>2]=5784;d=b+4|0;if((d|0)==0){e=b;c[e>>2]=5752;bv(b|0,11888,94)}f=kv(19)|0;c[f+4>>2]=6;c[f>>2]=6;g=f+12|0;c[d>>2]=g;c[f+8>>2]=0;a[g]=a[1752]|0;a[g+1|0]=a[1753|0]|0;a[g+2|0]=a[1754|0]|0;a[g+3|0]=a[1755|0]|0;a[g+4|0]=a[1756|0]|0;a[g+5|0]=a[1757|0]|0;a[g+6|0]=a[1758|0]|0;e=b;c[e>>2]=5752;bv(b|0,11888,94)}function ik(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1|0;c[b>>2]=7072;d=b+8|0;J=d|0;K=b+12|0;a[b+136|0]=1;L=b+24|0;M=L;c[K>>2]=M;c[J>>2]=M;c[b+16>>2]=L+112|0;L=28;N=M;while(1){if((N|0)==0){O=0}else{c[N>>2]=0;O=c[K>>2]|0}P=O+4|0;c[K>>2]=P;M=L-1|0;if((M|0)==0){break}else{L=M;N=P}}N=b+144|0;b=N;a[N]=2;a[b+1|0]=67;a[b+2|0]=0;b=c[J>>2]|0;if((b|0)!=(P|0)){c[K>>2]=O+(-((O+(-b|0)|0)>>>2)<<2)|0}c[1227]=0;c[1226]=6776;if((c[3512]|0)!=-1){c[H>>2]=14048;c[H+4>>2]=12;c[H+8>>2]=0;d3(14048,H,96)}H=c[3513]|0;b=H-1|0;I=c[1227]|0,c[1227]=I+1,I;O=c[K>>2]|0;P=c[J>>2]|0;N=O-P>>2;do{if(N>>>0>b>>>0){Q=P}else{if(N>>>0<H>>>0){jZ(d,H-N|0);Q=c[J>>2]|0;break}if(N>>>0<=H>>>0){Q=P;break}L=P+(H<<2)|0;if((L|0)==(O|0)){Q=P;break}c[K>>2]=O+((((O-4|0)+(-L|0)|0)>>>2^-1)<<2)|0;Q=P}}while(0);P=c[Q+(b<<2)>>2]|0;do{if((P|0)!=0){Q=P+4|0;if(((I=c[Q>>2]|0,c[Q>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[P>>2]|0)+8>>2]&511](P|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4904;c[1225]=0;c[1224]=6736;if((c[3510]|0)!=-1){c[G>>2]=14040;c[G+4>>2]=12;c[G+8>>2]=0;d3(14040,G,96)}G=c[3511]|0;b=G-1|0;I=c[1225]|0,c[1225]=I+1,I;P=c[K>>2]|0;Q=c[J>>2]|0;O=P-Q>>2;do{if(O>>>0>b>>>0){R=Q}else{if(O>>>0<G>>>0){jZ(d,G-O|0);R=c[J>>2]|0;break}if(O>>>0<=G>>>0){R=Q;break}H=Q+(G<<2)|0;if((H|0)==(P|0)){R=Q;break}c[K>>2]=P+((((P-4|0)+(-H|0)|0)>>>2^-1)<<2)|0;R=Q}}while(0);Q=c[R+(b<<2)>>2]|0;do{if((Q|0)!=0){R=Q+4|0;if(((I=c[R>>2]|0,c[R>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[Q>>2]|0)+8>>2]&511](Q|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4896;c[1281]=0;c[1280]=7184;c[1282]=0;a[5132]=0;c[1282]=c[bh()>>2]|0;if((c[3592]|0)!=-1){c[F>>2]=14368;c[F+4>>2]=12;c[F+8>>2]=0;d3(14368,F,96)}F=c[3593]|0;b=F-1|0;I=c[1281]|0,c[1281]=I+1,I;Q=c[K>>2]|0;R=c[J>>2]|0;P=Q-R>>2;do{if(P>>>0>b>>>0){S=R}else{if(P>>>0<F>>>0){jZ(d,F-P|0);S=c[J>>2]|0;break}if(P>>>0<=F>>>0){S=R;break}G=R+(F<<2)|0;if((G|0)==(Q|0)){S=R;break}c[K>>2]=Q+((((Q-4|0)+(-G|0)|0)>>>2^-1)<<2)|0;S=R}}while(0);R=c[S+(b<<2)>>2]|0;do{if((R|0)!=0){S=R+4|0;if(((I=c[S>>2]|0,c[S>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[R>>2]|0)+8>>2]&511](R|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=5120;c[1279]=0;c[1278]=7104;if((c[3590]|0)!=-1){c[E>>2]=14360;c[E+4>>2]=12;c[E+8>>2]=0;d3(14360,E,96)}E=c[3591]|0;b=E-1|0;I=c[1279]|0,c[1279]=I+1,I;R=c[K>>2]|0;S=c[J>>2]|0;Q=R-S>>2;do{if(Q>>>0>b>>>0){T=S}else{if(Q>>>0<E>>>0){jZ(d,E-Q|0);T=c[J>>2]|0;break}if(Q>>>0<=E>>>0){T=S;break}F=S+(E<<2)|0;if((F|0)==(R|0)){T=S;break}c[K>>2]=R+((((R-4|0)+(-F|0)|0)>>>2^-1)<<2)|0;T=S}}while(0);S=c[T+(b<<2)>>2]|0;do{if((S|0)!=0){T=S+4|0;if(((I=c[T>>2]|0,c[T>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[S>>2]|0)+8>>2]&511](S|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=5112;c[1233]=0;c[1232]=6872;if((c[3516]|0)!=-1){c[D>>2]=14064;c[D+4>>2]=12;c[D+8>>2]=0;d3(14064,D,96)}D=c[3517]|0;b=D-1|0;I=c[1233]|0,c[1233]=I+1,I;S=c[K>>2]|0;T=c[J>>2]|0;R=S-T>>2;do{if(R>>>0>b>>>0){U=T}else{if(R>>>0<D>>>0){jZ(d,D-R|0);U=c[J>>2]|0;break}if(R>>>0<=D>>>0){U=T;break}E=T+(D<<2)|0;if((E|0)==(S|0)){U=T;break}c[K>>2]=S+((((S-4|0)+(-E|0)|0)>>>2^-1)<<2)|0;U=T}}while(0);T=c[U+(b<<2)>>2]|0;do{if((T|0)!=0){U=T+4|0;if(((I=c[U>>2]|0,c[U>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[T>>2]|0)+8>>2]&511](T|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4928;c[1229]=0;c[1228]=6816;c[1230]=0;if((c[3514]|0)!=-1){c[C>>2]=14056;c[C+4>>2]=12;c[C+8>>2]=0;d3(14056,C,96)}C=c[3515]|0;b=C-1|0;I=c[1229]|0,c[1229]=I+1,I;T=c[K>>2]|0;U=c[J>>2]|0;S=T-U>>2;do{if(S>>>0>b>>>0){V=U}else{if(S>>>0<C>>>0){jZ(d,C-S|0);V=c[J>>2]|0;break}if(S>>>0<=C>>>0){V=U;break}D=U+(C<<2)|0;if((D|0)==(T|0)){V=U;break}c[K>>2]=T+((((T-4|0)+(-D|0)|0)>>>2^-1)<<2)|0;V=U}}while(0);U=c[V+(b<<2)>>2]|0;do{if((U|0)!=0){V=U+4|0;if(((I=c[V>>2]|0,c[V>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[U>>2]|0)+8>>2]&511](U|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4912;c[1235]=0;c[1234]=6928;if((c[3518]|0)!=-1){c[B>>2]=14072;c[B+4>>2]=12;c[B+8>>2]=0;d3(14072,B,96)}B=c[3519]|0;b=B-1|0;I=c[1235]|0,c[1235]=I+1,I;U=c[K>>2]|0;V=c[J>>2]|0;T=U-V>>2;do{if(T>>>0>b>>>0){W=V}else{if(T>>>0<B>>>0){jZ(d,B-T|0);W=c[J>>2]|0;break}if(T>>>0<=B>>>0){W=V;break}C=V+(B<<2)|0;if((C|0)==(U|0)){W=V;break}c[K>>2]=U+((((U-4|0)+(-C|0)|0)>>>2^-1)<<2)|0;W=V}}while(0);V=c[W+(b<<2)>>2]|0;do{if((V|0)!=0){W=V+4|0;if(((I=c[W>>2]|0,c[W>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[V>>2]|0)+8>>2]&511](V|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4936;c[1237]=0;c[1236]=6984;if((c[3520]|0)!=-1){c[A>>2]=14080;c[A+4>>2]=12;c[A+8>>2]=0;d3(14080,A,96)}A=c[3521]|0;b=A-1|0;I=c[1237]|0,c[1237]=I+1,I;V=c[K>>2]|0;W=c[J>>2]|0;U=V-W>>2;do{if(U>>>0>b>>>0){X=W}else{if(U>>>0<A>>>0){jZ(d,A-U|0);X=c[J>>2]|0;break}if(U>>>0<=A>>>0){X=W;break}B=W+(A<<2)|0;if((B|0)==(V|0)){X=W;break}c[K>>2]=V+((((V-4|0)+(-B|0)|0)>>>2^-1)<<2)|0;X=W}}while(0);W=c[X+(b<<2)>>2]|0;do{if((W|0)!=0){X=W+4|0;if(((I=c[X>>2]|0,c[X>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[W>>2]|0)+8>>2]&511](W|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4944;c[1207]=0;c[1206]=6280;a[4832]=46;a[4833]=44;kD(4836,0,12);if((c[3496]|0)!=-1){c[z>>2]=13984;c[z+4>>2]=12;c[z+8>>2]=0;d3(13984,z,96)}z=c[3497]|0;b=z-1|0;I=c[1207]|0,c[1207]=I+1,I;W=c[K>>2]|0;X=c[J>>2]|0;V=W-X>>2;do{if(V>>>0>b>>>0){Y=X}else{if(V>>>0<z>>>0){jZ(d,z-V|0);Y=c[J>>2]|0;break}if(V>>>0<=z>>>0){Y=X;break}A=X+(z<<2)|0;if((A|0)==(W|0)){Y=X;break}c[K>>2]=W+((((W-4|0)+(-A|0)|0)>>>2^-1)<<2)|0;Y=X}}while(0);X=c[Y+(b<<2)>>2]|0;do{if((X|0)!=0){Y=X+4|0;if(((I=c[Y>>2]|0,c[Y>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[X>>2]|0)+8>>2]&511](X|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4824;c[1199]=0;c[1198]=6232;c[1200]=46;c[1201]=44;kD(4808,0,12);if((c[3494]|0)!=-1){c[y>>2]=13976;c[y+4>>2]=12;c[y+8>>2]=0;d3(13976,y,96)}y=c[3495]|0;b=y-1|0;I=c[1199]|0,c[1199]=I+1,I;X=c[K>>2]|0;Y=c[J>>2]|0;W=X-Y>>2;do{if(W>>>0>b>>>0){Z=Y}else{if(W>>>0<y>>>0){jZ(d,y-W|0);Z=c[J>>2]|0;break}if(W>>>0<=y>>>0){Z=Y;break}z=Y+(y<<2)|0;if((z|0)==(X|0)){Z=Y;break}c[K>>2]=X+((((X-4|0)+(-z|0)|0)>>>2^-1)<<2)|0;Z=Y}}while(0);Y=c[Z+(b<<2)>>2]|0;do{if((Y|0)!=0){Z=Y+4|0;if(((I=c[Z>>2]|0,c[Z>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[Y>>2]|0)+8>>2]&511](Y|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4792;c[1223]=0;c[1222]=6664;if((c[3508]|0)!=-1){c[x>>2]=14032;c[x+4>>2]=12;c[x+8>>2]=0;d3(14032,x,96)}x=c[3509]|0;b=x-1|0;I=c[1223]|0,c[1223]=I+1,I;Y=c[K>>2]|0;Z=c[J>>2]|0;X=Y-Z>>2;do{if(X>>>0>b>>>0){_=Z}else{if(X>>>0<x>>>0){jZ(d,x-X|0);_=c[J>>2]|0;break}if(X>>>0<=x>>>0){_=Z;break}y=Z+(x<<2)|0;if((y|0)==(Y|0)){_=Z;break}c[K>>2]=Y+((((Y-4|0)+(-y|0)|0)>>>2^-1)<<2)|0;_=Z}}while(0);Z=c[_+(b<<2)>>2]|0;do{if((Z|0)!=0){_=Z+4|0;if(((I=c[_>>2]|0,c[_>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[Z>>2]|0)+8>>2]&511](Z|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4888;c[1221]=0;c[1220]=6592;if((c[3506]|0)!=-1){c[w>>2]=14024;c[w+4>>2]=12;c[w+8>>2]=0;d3(14024,w,96)}w=c[3507]|0;b=w-1|0;I=c[1221]|0,c[1221]=I+1,I;Z=c[K>>2]|0;_=c[J>>2]|0;Y=Z-_>>2;do{if(Y>>>0>b>>>0){$=_}else{if(Y>>>0<w>>>0){jZ(d,w-Y|0);$=c[J>>2]|0;break}if(Y>>>0<=w>>>0){$=_;break}x=_+(w<<2)|0;if((x|0)==(Z|0)){$=_;break}c[K>>2]=Z+((((Z-4|0)+(-x|0)|0)>>>2^-1)<<2)|0;$=_}}while(0);_=c[$+(b<<2)>>2]|0;do{if((_|0)!=0){$=_+4|0;if(((I=c[$>>2]|0,c[$>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[_>>2]|0)+8>>2]&511](_|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4880;c[1219]=0;c[1218]=6528;if((c[3504]|0)!=-1){c[v>>2]=14016;c[v+4>>2]=12;c[v+8>>2]=0;d3(14016,v,96)}v=c[3505]|0;b=v-1|0;I=c[1219]|0,c[1219]=I+1,I;_=c[K>>2]|0;$=c[J>>2]|0;Z=_-$>>2;do{if(Z>>>0>b>>>0){aa=$}else{if(Z>>>0<v>>>0){jZ(d,v-Z|0);aa=c[J>>2]|0;break}if(Z>>>0<=v>>>0){aa=$;break}w=$+(v<<2)|0;if((w|0)==(_|0)){aa=$;break}c[K>>2]=_+((((_-4|0)+(-w|0)|0)>>>2^-1)<<2)|0;aa=$}}while(0);$=c[aa+(b<<2)>>2]|0;do{if(($|0)!=0){aa=$+4|0;if(((I=c[aa>>2]|0,c[aa>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[$>>2]|0)+8>>2]&511]($|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4872;c[1217]=0;c[1216]=6464;if((c[3502]|0)!=-1){c[u>>2]=14008;c[u+4>>2]=12;c[u+8>>2]=0;d3(14008,u,96)}u=c[3503]|0;b=u-1|0;I=c[1217]|0,c[1217]=I+1,I;$=c[K>>2]|0;aa=c[J>>2]|0;_=$-aa>>2;do{if(_>>>0>b>>>0){ab=aa}else{if(_>>>0<u>>>0){jZ(d,u-_|0);ab=c[J>>2]|0;break}if(_>>>0<=u>>>0){ab=aa;break}v=aa+(u<<2)|0;if((v|0)==($|0)){ab=aa;break}c[K>>2]=$+(((($-4|0)+(-v|0)|0)>>>2^-1)<<2)|0;ab=aa}}while(0);aa=c[ab+(b<<2)>>2]|0;do{if((aa|0)!=0){ab=aa+4|0;if(((I=c[ab>>2]|0,c[ab>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[aa>>2]|0)+8>>2]&511](aa|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4864;c[1291]=0;c[1290]=8352;if((c[3722]|0)!=-1){c[t>>2]=14888;c[t+4>>2]=12;c[t+8>>2]=0;d3(14888,t,96)}t=c[3723]|0;b=t-1|0;I=c[1291]|0,c[1291]=I+1,I;aa=c[K>>2]|0;ab=c[J>>2]|0;$=aa-ab>>2;do{if($>>>0>b>>>0){ac=ab}else{if($>>>0<t>>>0){jZ(d,t-$|0);ac=c[J>>2]|0;break}if($>>>0<=t>>>0){ac=ab;break}u=ab+(t<<2)|0;if((u|0)==(aa|0)){ac=ab;break}c[K>>2]=aa+((((aa-4|0)+(-u|0)|0)>>>2^-1)<<2)|0;ac=ab}}while(0);ab=c[ac+(b<<2)>>2]|0;do{if((ab|0)!=0){ac=ab+4|0;if(((I=c[ac>>2]|0,c[ac>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ab>>2]|0)+8>>2]&511](ab|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=5160;c[1289]=0;c[1288]=8288;if((c[3720]|0)!=-1){c[s>>2]=14880;c[s+4>>2]=12;c[s+8>>2]=0;d3(14880,s,96)}s=c[3721]|0;b=s-1|0;I=c[1289]|0,c[1289]=I+1,I;ab=c[K>>2]|0;ac=c[J>>2]|0;aa=ab-ac>>2;do{if(aa>>>0>b>>>0){ad=ac}else{if(aa>>>0<s>>>0){jZ(d,s-aa|0);ad=c[J>>2]|0;break}if(aa>>>0<=s>>>0){ad=ac;break}t=ac+(s<<2)|0;if((t|0)==(ab|0)){ad=ac;break}c[K>>2]=ab+((((ab-4|0)+(-t|0)|0)>>>2^-1)<<2)|0;ad=ac}}while(0);ac=c[ad+(b<<2)>>2]|0;do{if((ac|0)!=0){ad=ac+4|0;if(((I=c[ad>>2]|0,c[ad>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ac>>2]|0)+8>>2]&511](ac|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=5152;c[1287]=0;c[1286]=8224;if((c[3718]|0)!=-1){c[r>>2]=14872;c[r+4>>2]=12;c[r+8>>2]=0;d3(14872,r,96)}r=c[3719]|0;b=r-1|0;I=c[1287]|0,c[1287]=I+1,I;ac=c[K>>2]|0;ad=c[J>>2]|0;ab=ac-ad>>2;do{if(ab>>>0>b>>>0){ae=ad}else{if(ab>>>0<r>>>0){jZ(d,r-ab|0);ae=c[J>>2]|0;break}if(ab>>>0<=r>>>0){ae=ad;break}s=ad+(r<<2)|0;if((s|0)==(ac|0)){ae=ad;break}c[K>>2]=ac+((((ac-4|0)+(-s|0)|0)>>>2^-1)<<2)|0;ae=ad}}while(0);ad=c[ae+(b<<2)>>2]|0;do{if((ad|0)!=0){ae=ad+4|0;if(((I=c[ae>>2]|0,c[ae>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ad>>2]|0)+8>>2]&511](ad|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=5144;c[1285]=0;c[1284]=8160;if((c[3716]|0)!=-1){c[q>>2]=14864;c[q+4>>2]=12;c[q+8>>2]=0;d3(14864,q,96)}q=c[3717]|0;b=q-1|0;I=c[1285]|0,c[1285]=I+1,I;ad=c[K>>2]|0;ae=c[J>>2]|0;ac=ad-ae>>2;do{if(ac>>>0>b>>>0){af=ae}else{if(ac>>>0<q>>>0){jZ(d,q-ac|0);af=c[J>>2]|0;break}if(ac>>>0<=q>>>0){af=ae;break}r=ae+(q<<2)|0;if((r|0)==(ad|0)){af=ae;break}c[K>>2]=ad+((((ad-4|0)+(-r|0)|0)>>>2^-1)<<2)|0;af=ae}}while(0);ae=c[af+(b<<2)>>2]|0;do{if((ae|0)!=0){af=ae+4|0;if(((I=c[af>>2]|0,c[af>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ae>>2]|0)+8>>2]&511](ae|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=5136;c[1181]=0;c[1180]=5936;if((c[3484]|0)!=-1){c[p>>2]=13936;c[p+4>>2]=12;c[p+8>>2]=0;d3(13936,p,96)}p=c[3485]|0;b=p-1|0;I=c[1181]|0,c[1181]=I+1,I;ae=c[K>>2]|0;af=c[J>>2]|0;ad=ae-af>>2;do{if(ad>>>0>b>>>0){ag=af}else{if(ad>>>0<p>>>0){jZ(d,p-ad|0);ag=c[J>>2]|0;break}if(ad>>>0<=p>>>0){ag=af;break}q=af+(p<<2)|0;if((q|0)==(ae|0)){ag=af;break}c[K>>2]=ae+((((ae-4|0)+(-q|0)|0)>>>2^-1)<<2)|0;ag=af}}while(0);af=c[ag+(b<<2)>>2]|0;do{if((af|0)!=0){ag=af+4|0;if(((I=c[ag>>2]|0,c[ag>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[af>>2]|0)+8>>2]&511](af|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4720;c[1179]=0;c[1178]=5896;if((c[3482]|0)!=-1){c[o>>2]=13928;c[o+4>>2]=12;c[o+8>>2]=0;d3(13928,o,96)}o=c[3483]|0;b=o-1|0;I=c[1179]|0,c[1179]=I+1,I;af=c[K>>2]|0;ag=c[J>>2]|0;ae=af-ag>>2;do{if(ae>>>0>b>>>0){ah=ag}else{if(ae>>>0<o>>>0){jZ(d,o-ae|0);ah=c[J>>2]|0;break}if(ae>>>0<=o>>>0){ah=ag;break}p=ag+(o<<2)|0;if((p|0)==(af|0)){ah=ag;break}c[K>>2]=af+((((af-4|0)+(-p|0)|0)>>>2^-1)<<2)|0;ah=ag}}while(0);ag=c[ah+(b<<2)>>2]|0;do{if((ag|0)!=0){ah=ag+4|0;if(((I=c[ah>>2]|0,c[ah>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ag>>2]|0)+8>>2]&511](ag|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4712;c[1177]=0;c[1176]=5856;if((c[3480]|0)!=-1){c[n>>2]=13920;c[n+4>>2]=12;c[n+8>>2]=0;d3(13920,n,96)}n=c[3481]|0;b=n-1|0;I=c[1177]|0,c[1177]=I+1,I;ag=c[K>>2]|0;ah=c[J>>2]|0;af=ag-ah>>2;do{if(af>>>0>b>>>0){ai=ah}else{if(af>>>0<n>>>0){jZ(d,n-af|0);ai=c[J>>2]|0;break}if(af>>>0<=n>>>0){ai=ah;break}o=ah+(n<<2)|0;if((o|0)==(ag|0)){ai=ah;break}c[K>>2]=ag+((((ag-4|0)+(-o|0)|0)>>>2^-1)<<2)|0;ai=ah}}while(0);ah=c[ai+(b<<2)>>2]|0;do{if((ah|0)!=0){ai=ah+4|0;if(((I=c[ai>>2]|0,c[ai>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ah>>2]|0)+8>>2]&511](ah|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4704;c[1175]=0;c[1174]=5816;if((c[3478]|0)!=-1){c[m>>2]=13912;c[m+4>>2]=12;c[m+8>>2]=0;d3(13912,m,96)}m=c[3479]|0;b=m-1|0;I=c[1175]|0,c[1175]=I+1,I;ah=c[K>>2]|0;ai=c[J>>2]|0;ag=ah-ai>>2;do{if(ag>>>0>b>>>0){aj=ai}else{if(ag>>>0<m>>>0){jZ(d,m-ag|0);aj=c[J>>2]|0;break}if(ag>>>0<=m>>>0){aj=ai;break}n=ai+(m<<2)|0;if((n|0)==(ah|0)){aj=ai;break}c[K>>2]=ah+((((ah-4|0)+(-n|0)|0)>>>2^-1)<<2)|0;aj=ai}}while(0);ai=c[aj+(b<<2)>>2]|0;do{if((ai|0)!=0){aj=ai+4|0;if(((I=c[aj>>2]|0,c[aj>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ai>>2]|0)+8>>2]&511](ai|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4696;c[1195]=0;c[1194]=6136;c[1196]=6184;if((c[3492]|0)!=-1){c[l>>2]=13968;c[l+4>>2]=12;c[l+8>>2]=0;d3(13968,l,96)}l=c[3493]|0;b=l-1|0;I=c[1195]|0,c[1195]=I+1,I;ai=c[K>>2]|0;aj=c[J>>2]|0;ah=ai-aj>>2;do{if(ah>>>0>b>>>0){ak=aj}else{if(ah>>>0<l>>>0){jZ(d,l-ah|0);ak=c[J>>2]|0;break}if(ah>>>0<=l>>>0){ak=aj;break}m=aj+(l<<2)|0;if((m|0)==(ai|0)){ak=aj;break}c[K>>2]=ai+((((ai-4|0)+(-m|0)|0)>>>2^-1)<<2)|0;ak=aj}}while(0);aj=c[ak+(b<<2)>>2]|0;do{if((aj|0)!=0){ak=aj+4|0;if(((I=c[ak>>2]|0,c[ak>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[aj>>2]|0)+8>>2]&511](aj|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4776;c[1191]=0;c[1190]=6040;c[1192]=6088;if((c[3490]|0)!=-1){c[k>>2]=13960;c[k+4>>2]=12;c[k+8>>2]=0;d3(13960,k,96)}k=c[3491]|0;b=k-1|0;I=c[1191]|0,c[1191]=I+1,I;aj=c[K>>2]|0;ak=c[J>>2]|0;ai=aj-ak>>2;do{if(ai>>>0>b>>>0){al=ak}else{if(ai>>>0<k>>>0){jZ(d,k-ai|0);al=c[J>>2]|0;break}if(ai>>>0<=k>>>0){al=ak;break}l=ak+(k<<2)|0;if((l|0)==(aj|0)){al=ak;break}c[K>>2]=aj+((((aj-4|0)+(-l|0)|0)>>>2^-1)<<2)|0;al=ak}}while(0);ak=c[al+(b<<2)>>2]|0;do{if((ak|0)!=0){al=ak+4|0;if(((I=c[al>>2]|0,c[al>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ak>>2]|0)+8>>2]&511](ak|0)}}while(0);c[(c[J>>2]|0)+(b<<2)>>2]=4760;c[1187]=0;c[1186]=7040;if(a[14968]|0){am=c[1170]|0}else{b=aX(1,1712,0)|0;c[1170]=b;a[14968]=1;am=b}c[1188]=am;c[1186]=6008;if((c[3488]|0)!=-1){c[j>>2]=13952;c[j+4>>2]=12;c[j+8>>2]=0;d3(13952,j,96)}j=c[3489]|0;am=j-1|0;I=c[1187]|0,c[1187]=I+1,I;b=c[K>>2]|0;ak=c[J>>2]|0;al=b-ak>>2;do{if(al>>>0>am>>>0){an=ak}else{if(al>>>0<j>>>0){jZ(d,j-al|0);an=c[J>>2]|0;break}if(al>>>0<=j>>>0){an=ak;break}aj=ak+(j<<2)|0;if((aj|0)==(b|0)){an=ak;break}c[K>>2]=b+((((b-4|0)+(-aj|0)|0)>>>2^-1)<<2)|0;an=ak}}while(0);ak=c[an+(am<<2)>>2]|0;do{if((ak|0)!=0){an=ak+4|0;if(((I=c[an>>2]|0,c[an>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ak>>2]|0)+8>>2]&511](ak|0)}}while(0);c[(c[J>>2]|0)+(am<<2)>>2]=4744;c[1183]=0;c[1182]=7040;if(a[14968]|0){ao=c[1170]|0}else{am=aX(1,1712,0)|0;c[1170]=am;a[14968]=1;ao=am}c[1184]=ao;c[1182]=5976;if((c[3486]|0)!=-1){c[h>>2]=13944;c[h+4>>2]=12;c[h+8>>2]=0;d3(13944,h,96)}h=c[3487]|0;ao=h-1|0;I=c[1183]|0,c[1183]=I+1,I;am=c[K>>2]|0;ak=c[J>>2]|0;an=am-ak>>2;do{if(an>>>0>ao>>>0){ap=ak}else{if(an>>>0<h>>>0){jZ(d,h-an|0);ap=c[J>>2]|0;break}if(an>>>0<=h>>>0){ap=ak;break}b=ak+(h<<2)|0;if((b|0)==(am|0)){ap=ak;break}c[K>>2]=am+((((am-4|0)+(-b|0)|0)>>>2^-1)<<2)|0;ap=ak}}while(0);ak=c[ap+(ao<<2)>>2]|0;do{if((ak|0)!=0){ap=ak+4|0;if(((I=c[ap>>2]|0,c[ap>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ak>>2]|0)+8>>2]&511](ak|0)}}while(0);c[(c[J>>2]|0)+(ao<<2)>>2]=4728;c[1215]=0;c[1214]=6368;if((c[3500]|0)!=-1){c[g>>2]=14e3;c[g+4>>2]=12;c[g+8>>2]=0;d3(14e3,g,96)}g=c[3501]|0;ao=g-1|0;I=c[1215]|0,c[1215]=I+1,I;ak=c[K>>2]|0;ap=c[J>>2]|0;am=ak-ap>>2;do{if(am>>>0>ao>>>0){aq=ap}else{if(am>>>0<g>>>0){jZ(d,g-am|0);aq=c[J>>2]|0;break}if(am>>>0<=g>>>0){aq=ap;break}h=ap+(g<<2)|0;if((h|0)==(ak|0)){aq=ap;break}c[K>>2]=ak+((((ak-4|0)+(-h|0)|0)>>>2^-1)<<2)|0;aq=ap}}while(0);ap=c[aq+(ao<<2)>>2]|0;do{if((ap|0)!=0){aq=ap+4|0;if(((I=c[aq>>2]|0,c[aq>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[ap>>2]|0)+8>>2]&511](ap|0)}}while(0);c[(c[J>>2]|0)+(ao<<2)>>2]=4856;c[1213]=0;c[1212]=6328;if((c[3498]|0)!=-1){c[f>>2]=13992;c[f+4>>2]=12;c[f+8>>2]=0;d3(13992,f,96)}f=c[3499]|0;ao=f-1|0;I=c[1213]|0,c[1213]=I+1,I;ap=c[K>>2]|0;aq=c[J>>2]|0;ak=ap-aq>>2;do{if(ak>>>0>ao>>>0){ar=aq}else{if(ak>>>0<f>>>0){jZ(d,f-ak|0);ar=c[J>>2]|0;break}if(ak>>>0<=f>>>0){ar=aq;break}g=aq+(f<<2)|0;if((g|0)==(ap|0)){ar=aq;break}c[K>>2]=ap+((((ap-4|0)+(-g|0)|0)>>>2^-1)<<2)|0;ar=aq}}while(0);aq=c[ar+(ao<<2)>>2]|0;if((aq|0)==0){as=c[J>>2]|0;at=as+(ao<<2)|0;c[at>>2]=4848;i=e;return}ar=aq+4|0;if(((I=c[ar>>2]|0,c[ar>>2]=I+ -1,I)|0)!=0){as=c[J>>2]|0;at=as+(ao<<2)|0;c[at>>2]=4848;i=e;return}ce[c[(c[aq>>2]|0)+8>>2]&511](aq|0);as=c[J>>2]|0;at=as+(ao<<2)|0;c[at>>2]=4848;i=e;return}function il(a,b){a=a|0;b=b|0;return b|0}function im(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function io(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function ip(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function iq(a){a=a|0;return 1}function ir(a){a=a|0;return 1}function is(a){a=a|0;return 1}function it(a,b){a=a|0;b=b|0;return b<<24>>24|0}function iu(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function iv(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function iw(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function ix(a){a=a|0;c[a+4>>2]=(I=c[3522]|0,c[3522]=I+1,I)+1|0;return}function iy(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function iz(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=(((e-4|0)+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function iA(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function iB(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function iC(a){a=a|0;iD(a);ky(a);return}function iD(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c[b>>2]=7072;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;L2770:do{if((e|0)==(g|0)){h=e}else{i=0;j=g;while(1){k=c[j+(i<<2)>>2]|0;do{if((k|0)!=0){l=k+4|0;if(((I=c[l>>2]|0,c[l>>2]=I+ -1,I)|0)!=0){break}ce[c[(c[k>>2]|0)+8>>2]&511](k|0)}}while(0);k=i+1|0;l=c[f>>2]|0;if(k>>>0<(c[d>>2]|0)-l>>2>>>0){i=k;j=l}else{h=l;break L2770}}}}while(0);if((a[b+144|0]&1)==0){m=h}else{ky(c[b+152>>2]|0);m=c[f>>2]|0}if((m|0)==0){return}f=c[d>>2]|0;if((m|0)!=(f|0)){c[d>>2]=f+((((f-4|0)+(-m|0)|0)>>>2^-1)<<2)|0}if((m|0)==(b+24|0)){a[b+136|0]=0;return}else{ky(m);return}}function iE(a){a=a|0;ky(a);return}function iF(a){a=a|0;if((a|0)==0){return}ce[c[(c[a>>2]|0)+4>>2]&511](a);return}function iG(a){a=a|0;ky(a);return}function iH(b){b=b|0;var d=0;c[b>>2]=7184;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}kz(d)}}while(0);ky(b);return}function iI(b){b=b|0;var d=0;c[b>>2]=7184;d=c[b+8>>2]|0;if((d|0)==0){return}if((a[b+12|0]&1)==0){return}kz(d);return}function iJ(a){a=a|0;ky(a);return}function iK(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[bh()>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function iL(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[bh()>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function iM(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[bh()>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=2429;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=2430;break}else{h=e}}if((i|0)==2429){return g|0}else if((i|0)==2430){return g|0}return 0}function iN(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=2439;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=2438;break}if((b[(c[bh()>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=2440;break}else{a=a+4|0}}if((h|0)==2438){return g|0}else if((h|0)==2439){return g|0}else if((h|0)==2440){return g|0}return 0}function iO(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[b7()>>2]|0)+(b<<2)>>2]|0;return d|0}function iP(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[b7()>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function iQ(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[b8()>>2]|0)+(b<<2)>>2]|0;return d|0}function iR(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[b8()>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function iS(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[b7()>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function iT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[b7()>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function iU(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[b8()>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function iV(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[b8()>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function iW(a){a=a|0;var b=0,d=0;c[a>>2]=6816;b=c[a+8>>2]|0;if((b|0)==0){d=a;ky(d);return}bi(b|0);d=a;ky(d);return}function iX(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=e;while(1){if((d|0)==(f|0)){k=f;break}if((c[d>>2]|0)==0){k=d;break}else{d=d+4|0}}c[j>>2]=h;c[g>>2]=e;L2925:do{if((e|0)==(f|0)|(h|0)==(i|0)){l=e}else{d=i;m=b+8|0;n=h;o=e;p=k;while(1){q=bR(c[m>>2]|0)|0;r=j7(n,g,p-o>>2,d-n|0,0)|0;if((q|0)!=0){bR(q|0)}if((r|0)==0){s=1;t=2544;break}else if((r|0)==(-1|0)){t=2520;break}q=(c[j>>2]|0)+r|0;c[j>>2]=q;if((q|0)==(i|0)){t=2539;break}if((p|0)==(f|0)){u=f;v=q;w=c[g>>2]|0}else{q=bR(c[m>>2]|0)|0;if((q|0)!=0){bR(q|0)}q=c[j>>2]|0;if((q|0)==(i|0)){s=1;t=2542;break}c[j>>2]=q+1|0;a[q]=0;q=(c[g>>2]|0)+4|0;c[g>>2]=q;r=q;while(1){if((r|0)==(f|0)){x=f;break}if((c[r>>2]|0)==0){x=r;break}else{r=r+4|0}}u=x;v=c[j>>2]|0;w=q}if((w|0)==(f|0)|(v|0)==(i|0)){l=w;break L2925}else{n=v;o=w;p=u}}if((t|0)==2542){return s|0}else if((t|0)==2544){return s|0}else if((t|0)==2520){c[j>>2]=n;L2950:do{if((o|0)==(c[g>>2]|0)){y=o}else{p=o;d=n;while(1){r=c[p>>2]|0;z=bR(c[m>>2]|0)|0;A=j6(d,r,0)|0;if((z|0)!=0){bR(z|0)}if((A|0)==-1){y=p;break L2950}z=(c[j>>2]|0)+A|0;c[j>>2]=z;A=p+4|0;if((A|0)==(c[g>>2]|0)){y=A;break L2950}else{p=A;d=z}}}}while(0);c[g>>2]=y;s=2;return s|0}else if((t|0)==2539){l=c[g>>2]|0;break}}}while(0);s=(l|0)!=(f|0)&1;return s|0}function iY(a){a=a|0;return 0}function iZ(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1|0;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1|0;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1|0;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L11:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=30;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=31;break L11}c[j>>2]=p+1|0;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=32;break L11}c[j>>2]=p+1|0;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=33;break L11}c[j>>2]=p+1|0;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=38;break L11}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=39;break L11}c[j>>2]=p+1|0;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=34;break L11}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=35;break L11}if((d-(c[j>>2]|0)|0)<4){m=1;o=36;break L11}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=37;break L11}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1|0;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1|0;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1|0;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=40;break}}if((o|0)==30){return m|0}else if((o|0)==31){return m|0}else if((o|0)==32){return m|0}else if((o|0)==33){return m|0}else if((o|0)==34){return m|0}else if((o|0)==35){return m|0}else if((o|0)==36){return m|0}else if((o|0)==37){return m|0}else if((o|0)==38){return m|0}else if((o|0)==39){return m|0}else if((o|0)==40){return m|0}return 0}function i_(a){a=a|0;ky(a);return}function i$(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=iZ(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1)|0;c[j>>2]=g+((c[k>>2]|0)-g|0)|0;i=b;return l|0}function i0(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=ja(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d|0)|0;c[j>>2]=g+((c[k>>2]|0)-g>>1<<1)|0;i=b;return l|0}function i1(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L56:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2]|0;c[m+4>>2]=w;x=v;w=bR(c[s>>2]|0)|0;y=j4(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){bR(w|0)}if((y|0)==(-1|0)){z=53;break}else if((y|0)==0){A=2;z=83;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){z=75;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=bR(c[s>>2]|0)|0;F=j3(w,y,1,d)|0;if((E|0)!=0){bR(E|0)}if((F|0)!=0){A=2;z=81;break}c[k>>2]=(c[k>>2]|0)+4|0;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L56}else{t=C;u=D;v=B}}if((z|0)==75){q=c[g>>2]|0;break}else if((z|0)==53){c[k>>2]=t;L79:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=bR(c[s>>2]|0)|0;E=j3(v,r,x-r|0,n)|0;if((o|0)!=0){bR(o|0)}if((E|0)==0){I=r+1|0}else if((E|0)==(-1|0)){z=59;break}else if((E|0)==(-2|0)){z=60;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L79}else{v=E;r=I}}if((z|0)==59){c[g>>2]=r;A=2;i=l;return A|0}else if((z|0)==60){c[g>>2]=r;A=1;i=l;return A|0}}}while(0);c[g>>2]=H;A=(H|0)!=(f|0)&1;i=l;return A|0}else if((z|0)==81){i=l;return A|0}else if((z|0)==83){i=l;return A|0}}}while(0);A=(q|0)!=(f|0)&1;i=l;return A|0}function i2(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;d=bR(c[a+8>>2]|0)|0;if((d|0)==0){return 0}bR(d|0);return 0}function i3(a){a=a|0;var b=0,d=0,e=0;b=a+8|0;a=bR(c[b>>2]|0)|0;if((a|0)!=0){bR(a|0)}a=c[b>>2]|0;if((a|0)==0){return 1}b=bR(a|0)|0;a=bn()|0;if((b|0)==0){d=(a|0)==1;e=d&1;return e|0}bR(b|0);d=(a|0)==1;e=d&1;return e|0}function i4(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=(b|0)!=0?b:112;b=d;d=0;j=0;while(1){k=bR(c[i>>2]|0)|0;l=j3(0,b,h-b|0,a)|0;if((k|0)!=0){bR(k|0)}if((l|0)==0){m=1;n=b+1|0}else if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;o=120;break}else{m=l;n=b+l|0}l=m+d|0;k=j+1|0;if(k>>>0>=f>>>0|(n|0)==(e|0)){g=l;o=121;break}else{b=n;d=l;j=k}}if((o|0)==120){return g|0}else if((o|0)==121){return g|0}return 0}function i5(a){a=a|0;var b=0,d=0,e=0;b=c[a+8>>2]|0;do{if((b|0)==0){d=1}else{a=bR(b|0)|0;e=bn()|0;if((a|0)==0){d=e;break}bR(a|0);d=e}}while(0);return d|0}function i6(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function i7(a){a=a|0;return 0}function i8(a){a=a|0;return 0}function i9(a){a=a|0;return 4}function ja(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L154:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L156:while(1){if(e>>>0>=i>>>0){o=n;break L154}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=199;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1|0}else{if((p&255)<194){r=2;s=195;break L156}if((p&255)<224){if((h-n|0)<2){r=1;s=196;break L156}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=197;break L156}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=198;break L156}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2|0;break}if((p&255)<240){if((h-n|0)<3){r=1;s=189;break L156}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=190;break L156}}else if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=191;break L156}}else{if((u&-64)<<24>>24!=-128){r=2;s=192;break L156}}v=t&255;if((v&192|0)!=128){r=2;s=193;break L156}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=194;break L156}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3|0;break}if((p&255)>=245){r=2;s=179;break L156}if((h-n|0)<4){r=1;s=180;break L156}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==240){if((t+112&255)>=48){r=2;s=181;break L156}}else if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=182;break L156}}else{if((t&-64)<<24>>24!=-128){r=2;s=183;break L156}}w=v&255;if((w&192|0)!=128){r=2;s=184;break L156}v=u&255;if((v&192|0)!=128){r=2;s=185;break L156}if((l-e|0)<4){r=1;s=186;break L156}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=187;break L156}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4|0}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L154}}if((s|0)==179){return r|0}else if((s|0)==180){return r|0}else if((s|0)==181){return r|0}else if((s|0)==182){return r|0}else if((s|0)==183){return r|0}else if((s|0)==184){return r|0}else if((s|0)==185){return r|0}else if((s|0)==186){return r|0}else if((s|0)==187){return r|0}else if((s|0)==189){return r|0}else if((s|0)==190){return r|0}else if((s|0)==191){return r|0}else if((s|0)==192){return r|0}else if((s|0)==193){return r|0}else if((s|0)==194){return r|0}else if((s|0)==195){return r|0}else if((s|0)==196){return r|0}else if((s|0)==197){return r|0}else if((s|0)==198){return r|0}else if((s|0)==199){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0&1;return r|0}function jb(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L223:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L225:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L223}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L223}if((k&255)<224){if((g-j|0)<2){m=j;break L223}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L223}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L223}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L223}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==237){if((p&-32)<<24>>24!=-128){s=222;break L225}}else if((l|0)==224){if((p&-32)<<24>>24!=-96){s=220;break L225}}else{if((p&-64)<<24>>24!=-128){s=224;break L225}}t=r&255;if((t&192|0)!=128){m=j;break L223}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L223}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L223}u=j;if((g-u|0)<4){m=j;break L223}if((e-i|0)>>>0<2){m=j;break L223}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==240){if((t+112&255)>=48){s=233;break L225}}else if((l|0)==244){if((t&-16)<<24>>24!=-128){s=235;break L225}}else{if((t&-64)<<24>>24!=-128){s=237;break L225}}v=p&255;if((v&192|0)!=128){m=j;break L223}p=r&255;if((p&192|0)!=128){m=j;break L223}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L223}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L223}}if((s|0)==222){w=q-b|0;return w|0}else if((s|0)==220){w=q-b|0;return w|0}else if((s|0)==235){w=u-b|0;return w|0}else if((s|0)==237){w=u-b|0;return w|0}else if((s|0)==224){w=q-b|0;return w|0}else if((s|0)==233){w=u-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function jc(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1|0;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1|0;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1|0;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L286:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=277;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=276;break L286}c[h>>2]=b+1|0;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=271;break L286}c[h>>2]=b+1|0;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1|0;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=278;break L286}c[h>>2]=b+1|0;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1|0;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1|0;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=275;break L286}c[h>>2]=b+1|0;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1|0;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1|0;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1|0;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=272;break}}if((l|0)==278){return k|0}else if((l|0)==275){return k|0}else if((l|0)==276){return k|0}else if((l|0)==277){return k|0}else if((l|0)==272){return k|0}else if((l|0)==271){return k|0}return 0}function jd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jb(c,d,e,1114111,0)|0}function je(a){a=a|0;ky(a);return}function jf(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jc(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2)|0;c[j>>2]=g+((c[k>>2]|0)-g|0)|0;i=b;return l|0}function jg(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jl(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d|0)|0;c[j>>2]=g+((c[k>>2]|0)-g>>2<<2)|0;i=b;return l|0}function jh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function ji(a){a=a|0;return 0}function jj(a){a=a|0;return 0}function jk(a){a=a|0;return 4}function jl(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L326:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L328:while(1){if(k>>>0>=h>>>0){m=b;break L326}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=328;break L328}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1|0}else{if((n&255)<194){p=2;q=329;break L328}if((n&255)<224){if((g-b|0)<2){p=1;q=330;break L328}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=331;break L328}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=340;break L328}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2|0;break}if((n&255)<240){if((g-b|0)<3){p=1;q=343;break L328}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=337;break L328}}else if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=338;break L328}}else{if((s&-64)<<24>>24!=-128){p=2;q=344;break L328}}t=r&255;if((t&192|0)!=128){p=2;q=327;break L328}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=345;break L328}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3|0;break}if((n&255)>=245){p=2;q=335;break L328}if((g-b|0)<4){p=1;q=336;break L328}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=341;break L328}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=346;break L328}}else{if((r&-64)<<24>>24!=-128){p=2;q=333;break L328}}u=t&255;if((u&192|0)!=128){p=2;q=334;break L328}t=s&255;if((t&192|0)!=128){p=2;q=339;break L328}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=332;break L328}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4|0}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L326}}if((q|0)==327){return p|0}else if((q|0)==328){return p|0}else if((q|0)==329){return p|0}else if((q|0)==330){return p|0}else if((q|0)==331){return p|0}else if((q|0)==332){return p|0}else if((q|0)==333){return p|0}else if((q|0)==334){return p|0}else if((q|0)==335){return p|0}else if((q|0)==336){return p|0}else if((q|0)==337){return p|0}else if((q|0)==338){return p|0}else if((q|0)==339){return p|0}else if((q|0)==340){return p|0}else if((q|0)==341){return p|0}else if((q|0)==343){return p|0}else if((q|0)==344){return p|0}else if((q|0)==345){return p|0}else if((q|0)==346){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0&1;return p|0}function jm(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L393:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L395:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L393}n=j+1|0}else{if((k&255)<194){m=j;break L393}if((k&255)<224){if((g-j|0)<2){m=j;break L393}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L393}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L393}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L393}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==237){if((o&-32)<<24>>24!=-128){r=369;break L395}}else if((l|0)==224){if((o&-32)<<24>>24!=-96){r=367;break L395}}else{if((o&-64)<<24>>24!=-128){r=371;break L395}}s=q&255;if((s&192|0)!=128){m=j;break L393}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L393}n=j+3|0;break}if((k&255)>=245){m=j;break L393}t=j;if((g-t|0)<4){m=j;break L393}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==240){if((s+112&255)>=48){r=379;break L395}}else if((l|0)==244){if((s&-16)<<24>>24!=-128){r=381;break L395}}else{if((s&-64)<<24>>24!=-128){r=383;break L395}}u=o&255;if((u&192|0)!=128){m=j;break L393}o=q&255;if((o&192|0)!=128){m=j;break L393}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L393}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L393}i=i+1|0;j=n}if((r|0)==367){v=p-b|0;return v|0}else if((r|0)==371){v=p-b|0;return v|0}else if((r|0)==381){v=t-b|0;return v|0}else if((r|0)==369){v=p-b|0;return v|0}else if((r|0)==379){v=t-b|0;return v|0}else if((r|0)==383){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function jn(b){b=b|0;return a[b+8|0]|0}function jo(a){a=a|0;return c[a+8>>2]|0}function jp(b){b=b|0;return a[b+9|0]|0}function jq(a){a=a|0;return c[a+12>>2]|0}function jr(b,c){b=b|0;c=c|0;c=b;a[b]=8;b=c+1|0;C=1702195828;a[b]=C&255;C=C>>8;a[b+1|0]=C&255;C=C>>8;a[b+2|0]=C&255;C=C>>8;a[b+3|0]=C&255;a[c+5|0]=0;return}function js(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jm(c,d,e,1114111,0)|0}function jt(a){a=a|0;ky(a);return}function ju(a){a=a|0;ky(a);return}function jv(b){b=b|0;var d=0;c[b>>2]=6280;if((a[b+12|0]&1)==0){d=b;ky(d);return}ky(c[b+20>>2]|0);d=b;ky(d);return}function jw(b){b=b|0;c[b>>2]=6280;if((a[b+12|0]&1)==0){return}ky(c[b+20>>2]|0);return}function jx(b){b=b|0;var d=0;c[b>>2]=6232;if((a[b+16|0]&1)==0){d=b;ky(d);return}ky(c[b+24>>2]|0);d=b;ky(d);return}function jy(b){b=b|0;c[b>>2]=6232;if((a[b+16|0]&1)==0){return}ky(c[b+24>>2]|0);return}function jz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=ku(32)|0;d=b;c[a+8>>2]=d;c[a>>2]=9;c[a+4>>2]=4;a=1560;e=4;f=d;while(1){d=e-1|0;c[f>>2]=c[a>>2]|0;if((d|0)==0){break}else{a=a+4|0;e=d;f=f+4|0}}c[b+16>>2]=0;return}function jA(b,c){b=b|0;c=c|0;c=b;a[b]=10;b=c+1|0;a[b]=a[1552]|0;a[b+1|0]=a[1553|0]|0;a[b+2|0]=a[1554|0]|0;a[b+3|0]=a[1555|0]|0;a[b+4|0]=a[1556|0]|0;a[c+6|0]=0;return}function jB(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=ku(32)|0;d=b;c[a+8>>2]=d;c[a>>2]=9;c[a+4>>2]=5;a=1528;e=5;f=d;while(1){d=e-1|0;c[f>>2]=c[a>>2]|0;if((d|0)==0){break}else{a=a+4|0;e=d;f=f+4|0}}c[b+20>>2]=0;return}function jC(b){b=b|0;var d=0;if(a[15048]|0){d=c[1392]|0;return d|0}if(!(a[14936]|0)){kD(4192,0,168);a6(270,0,u|0);a[14936]=1}d$(4192,2048);d$(4204,2040);d$(4216,2032);d$(4228,2016);d$(4240,2e3);d$(4252,1992);d$(4264,1976);d$(4276,1968);d$(4288,1960);d$(4300,1936);d$(4312,1928);d$(4324,1920);d$(4336,1904);d$(4348,1896);c[1392]=4192;a[15048]=1;d=4192;return d|0}function jD(b){b=b|0;var d=0;if(a[14992]|0){d=c[1370]|0;return d|0}if(!(a[14912]|0)){kD(3448,0,168);a6(150,0,u|0);a[14912]=1}eg(3448,2496,6);eg(3460,2464,6);eg(3472,2432,7);eg(3484,2392,9);eg(3496,2312,8);eg(3508,2280,6);eg(3520,2240,8);eg(3532,2224,3);eg(3544,2208,3);eg(3556,2192,3);eg(3568,2136,3);eg(3580,2120,3);eg(3592,2104,3);eg(3604,2088,3);c[1370]=3448;a[14992]=1;d=3448;return d|0}function jE(b){b=b|0;var d=0;if(a[15040]|0){d=c[1390]|0;return d|0}if(!(a[14928]|0)){kD(3904,0,288);a6(172,0,u|0);a[14928]=1}d$(3904,376);d$(3916,360);d$(3928,336);d$(3940,328);d$(3952,320);d$(3964,312);d$(3976,304);d$(3988,296);d$(4e3,256);d$(4012,248);d$(4024,232);d$(4036,216);d$(4048,208);d$(4060,160);d$(4072,152);d$(4084,144);d$(4096,320);d$(4108,128);d$(4120,120);d$(4132,2560);d$(4144,2552);d$(4156,2544);d$(4168,2536);d$(4180,2528);c[1390]=3904;a[15040]=1;d=3904;return d|0}function jF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d+12|0;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2]|0;c[f+4>>2]=c[e+4>>2]|0;c[f+8>>2]=c[e+8>>2]|0;return}e=c[d+20>>2]|0;f=c[d+16>>2]|0;if((f|0)==-1){d4(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=ku(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}kE(g|0,e|0,f);a[g+f|0]=0;return}function jG(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d+16|0;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2]|0;c[f+4>>2]=c[e+4>>2]|0;c[f+8>>2]=c[e+8>>2]|0;return}e=c[d+24>>2]|0;f=c[d+20>>2]|0;if((f|0)==-1){d4(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=ku(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}kE(g|0,e|0,f);a[g+f|0]=0;return}function jH(b){b=b|0;var d=0;if(a[14984]|0){d=c[1368]|0;return d|0}if(!(a[14904]|0)){kD(3160,0,288);a6(124,0,u|0);a[14904]=1}eg(3160,1032,7);eg(3172,992,8);eg(3184,968,5);eg(3196,896,5);eg(3208,544,3);eg(3220,872,4);eg(3232,848,4);eg(3244,816,6);eg(3256,776,9);eg(3268,744,7);eg(3280,704,8);eg(3292,664,8);eg(3304,648,3);eg(3316,592,3);eg(3328,576,3);eg(3340,560,3);eg(3352,544,3);eg(3364,528,3);eg(3376,512,3);eg(3388,496,3);eg(3400,480,3);eg(3412,464,3);eg(3424,448,3);eg(3436,384,3);c[1368]=3160;a[14984]=1;d=3160;return d|0}function jI(b){b=b|0;var d=0;if(a[15056]|0){d=c[1394]|0;return d|0}if(!(a[14944]|0)){kD(4360,0,288);a6(122,0,u|0);a[14944]=1}d$(4360,1072);d$(4372,1064);c[1394]=4360;a[15056]=1;d=4360;return d|0}function jJ(b){b=b|0;var d=0;if(a[15e3]|0){d=c[1372]|0;return d|0}if(!(a[14920]|0)){kD(3616,0,288);a6(246,0,u|0);a[14920]=1}eg(3616,1096,2);eg(3628,1080,2);c[1372]=3616;a[15e3]=1;d=3616;return d|0}function jK(b){b=b|0;var c=0;if(a[15064]|0){return 5584}a[5584]=16;b=5585;c=b|0;C=623865125;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;c=b+4|0;C=2032480100;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;a[5593]=0;a6(262,5584,u|0);a[15064]=1;return 5584}function jL(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[15008]|0){return 5496}b=ku(48)|0;d=b;c[1376]=d;c[1374]=13;c[1375]=8;e=1424;f=8;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2]|0;if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+32>>2]=0;a6(194,5496,u|0);a[15008]=1;return 5496}function jM(b){b=b|0;var c=0;if(a[15088]|0){return 5632}a[5632]=16;b=5633;c=b|0;C=624576549;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;c=b+4|0;C=1394948685;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;a[5641]=0;a6(262,5632,u|0);a[15088]=1;return 5632}function jN(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[15032]|0){return 5544}b=ku(48)|0;d=b;c[1388]=d;c[1386]=13;c[1387]=8;e=1368;f=8;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2]|0;if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+32>>2]=0;a6(194,5544,u|0);a[15032]=1;return 5544}function jO(b){b=b|0;if(a[15080]|0){return 5616}b=ku(32)|0;c[1406]=b;c[1404]=33;c[1405]=20;kE(b|0,1344,20);a[b+20|0]=0;a6(262,5616,u|0);a[15080]=1;return 5616}function jP(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[15024]|0){return 5528}b=ku(96)|0;d=b;c[1384]=d;c[1382]=25;c[1383]=20;e=1256;f=20;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2]|0;if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+80>>2]=0;a6(194,5528,u|0);a[15024]=1;return 5528}function jQ(b){b=b|0;if(a[15072]|0){return 5600}b=ku(16)|0;c[1402]=b;c[1400]=17;c[1401]=11;kE(b|0,1240,11);a[b+11|0]=0;a6(262,5600,u|0);a[15072]=1;return 5600}function jR(b){b=b|0;var d=0,e=0,f=0,g=0;if(a[15016]|0){return 5512}b=ku(48)|0;d=b;c[1380]=d;c[1378]=13;c[1379]=11;e=1192;f=11;g=d;while(1){d=f-1|0;c[g>>2]=c[e>>2]|0;if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}c[b+44>>2]=0;a6(194,5512,u|0);a[15016]=1;return 5512}function jS(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;ce[f&511](a);return}else{f=c[(c[d>>2]|0)+(e-1|0)>>2]|0;ce[f&511](a);return}}function jT(b){b=b|0;var d=0;b=3904;while(1){d=b-12|0;if((a[d]&1)!=0){ky(c[b-12+8>>2]|0)}if((d|0)==3616){break}else{b=d}}return}function jU(b){b=b|0;var d=0;b=4648;while(1){d=b-12|0;if((a[d]&1)!=0){ky(c[b-12+8>>2]|0)}if((d|0)==4360){break}else{b=d}}return}function jV(b){b=b|0;var d=0;b=3448;while(1){d=b-12|0;if((a[d]&1)!=0){ky(c[b-12+8>>2]|0)}if((d|0)==3160){break}else{b=d}}return}function jW(b){b=b|0;var d=0;b=4192;while(1){d=b-12|0;if((a[d]&1)!=0){ky(c[b-12+8>>2]|0)}if((d|0)==3904){break}else{b=d}}return}function jX(b){b=b|0;if((a[3604]&1)!=0){ky(c[903]|0)}if((a[3592]&1)!=0){ky(c[900]|0)}if((a[3580]&1)!=0){ky(c[897]|0)}if((a[3568]&1)!=0){ky(c[894]|0)}if((a[3556]&1)!=0){ky(c[891]|0)}if((a[3544]&1)!=0){ky(c[888]|0)}if((a[3532]&1)!=0){ky(c[885]|0)}if((a[3520]&1)!=0){ky(c[882]|0)}if((a[3508]&1)!=0){ky(c[879]|0)}if((a[3496]&1)!=0){ky(c[876]|0)}if((a[3484]&1)!=0){ky(c[873]|0)}if((a[3472]&1)!=0){ky(c[870]|0)}if((a[3460]&1)!=0){ky(c[867]|0)}if((a[3448]&1)==0){return}ky(c[864]|0);return}function jY(b){b=b|0;if((a[4348]&1)!=0){ky(c[1089]|0)}if((a[4336]&1)!=0){ky(c[1086]|0)}if((a[4324]&1)!=0){ky(c[1083]|0)}if((a[4312]&1)!=0){ky(c[1080]|0)}if((a[4300]&1)!=0){ky(c[1077]|0)}if((a[4288]&1)!=0){ky(c[1074]|0)}if((a[4276]&1)!=0){ky(c[1071]|0)}if((a[4264]&1)!=0){ky(c[1068]|0)}if((a[4252]&1)!=0){ky(c[1065]|0)}if((a[4240]&1)!=0){ky(c[1062]|0)}if((a[4228]&1)!=0){ky(c[1059]|0)}if((a[4216]&1)!=0){ky(c[1056]|0)}if((a[4204]&1)!=0){ky(c[1053]|0)}if((a[4192]&1)==0){return}ky(c[1050]|0);return}function jZ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;while(1){if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}g=l+4|0;c[f>>2]=g;m=j-1|0;if((m|0)==0){break}else{j=m;k=g}}return}k=b+16|0;j=b|0;l=c[j>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){ij(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=650}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=650;break}a[l]=1;p=k;q=h}}while(0);if((o|0)==650){p=ku(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;while(1){if((d|0)==0){r=0}else{c[d>>2]=0;r=d}s=r+4|0;o=n-1|0;if((o|0)==0){break}else{n=o;d=s}}d=c[j>>2]|0;n=(c[f>>2]|0)-d|0;r=p+(g-(n>>2)<<2)|0;g=d;kE(r|0,g|0,n);c[j>>2]=r;c[f>>2]=s;c[e>>2]=p+(q<<2)|0;if((d|0)==0){return}if((d|0)==(k|0)){a[b+128|0]=0;return}else{ky(g);return}}function j_(a){a=a|0;return}function j$(a){a=a|0;return 1608}function j0(a){a=a|0;return}function j1(a){a=a|0;return}function j2(a){a=a|0;return}function j3(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?104:f)|0;f=c[j>>2]|0;L776:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0&1;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L776}o=d+1|0;p=c[t+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L794:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L776}else{s=o;u=p;v=q;w=l}while(1){l=s+1|0;x=(w&255)-128|u<<6;y=v-1|0;if((x|0)>=0){break}if((y|0)==0){r=x;break L794}n=a[l]|0;if(((n&255)-128|0)>>>0>63){break L776}else{s=l;u=x;v=y;w=n}}c[j>>2]=0;c[m>>2]=x;k=e-y|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[bL()>>2]=138;k=-1;i=g;return k|0}function j4(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L807:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L807}z=y?s:x;A=t-z|0;x=j5(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L807}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L818:do{if((r|0)==0){D=n;E=r}else{if((p|0)==0|(o|0)==0){D=n;E=r;break}else{F=p;G=o;H=n;I=q;J=r}while(1){K=j3(I,J,G,f)|0;if((K+2|0)>>>0<3){break}A=J+K|0;c[j>>2]=A;B=F-1|0;C=H+1|0;if((B|0)==0|(G|0)==(K|0)){D=C;E=A;break L818}else{F=B;G=G-K|0;H=C;I=I+4|0;J=A}}if((K|0)==(-1|0)){D=-1;E=J;break}else if((K|0)==0){c[j>>2]=0;D=H;E=0;break}else{c[f>>2]=0;D=H;E=J;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=E;i=g;return D|0}function j5(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0;h=c[e>>2]|0;do{if((g|0)==0){i=718}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=718;break}if((b|0)==0){l=k;m=h;n=f;i=729;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=749}}while(0);if((i|0)==718){if((b|0)==0){s=h;u=f;i=720}else{v=h;w=b;x=f;i=719}}L839:while(1){if((i|0)==719){i=0;if((x|0)==0){y=f;i=768;break}else{z=x;A=w;B=v}while(1){h=a[B]|0;do{if(((h&255)-1|0)>>>0<127){if((B&3|0)==0&z>>>0>3){C=z;D=A;E=B}else{F=B;G=A;H=z;I=h;break}while(1){J=c[E>>2]|0;if(((J-16843009|J)&-2139062144|0)!=0){i=743;break}c[D>>2]=J&255;c[D+4>>2]=d[E+1|0]|0;c[D+8>>2]=d[E+2|0]|0;K=E+4|0;L=D+16|0;c[D+12>>2]=d[E+3|0]|0;M=C-4|0;if(M>>>0>3){C=M;D=L;E=K}else{i=744;break}}if((i|0)==744){i=0;F=K;G=L;H=M;I=a[K]|0;break}else if((i|0)==743){i=0;F=E;G=D;H=C;I=J&255;break}}else{F=B;G=A;H=z;I=h}}while(0);N=I&255;if((N-1|0)>>>0>=127){break}c[G>>2]=N;h=H-1|0;if((h|0)==0){y=f;i=769;break L839}else{z=h;A=G+4|0;B=F+1|0}}h=N-194|0;if(h>>>0>50){O=H;P=G;Q=F;i=760;break}o=c[t+(h<<2)>>2]|0;p=F+1|0;q=G;r=H;i=749;continue}else if((i|0)==729){i=0;h=(d[m]|0)>>>3;if((h-16|h+(l>>26))>>>0>7){i=730;break}h=m+1|0;do{if((l&33554432|0)==0){R=h}else{if(((d[h]|0)-128|0)>>>0>63){i=733;break L839}g=m+2|0;if((l&524288|0)==0){R=g;break}if(((d[g]|0)-128|0)>>>0>63){i=736;break L839}R=m+3|0}}while(0);s=R;u=n-1|0;i=720;continue}else if((i|0)==749){i=0;h=d[p]|0;g=h>>>3;if((g-16|g+(o>>26))>>>0>7){i=750;break}g=p+1|0;S=h-128|o<<6;do{if((S|0)<0){h=(d[g]|0)-128|0;if(h>>>0>63){i=753;break L839}k=p+2|0;T=h|S<<6;if((T|0)>=0){U=T;V=k;break}h=(d[k]|0)-128|0;if(h>>>0>63){i=756;break L839}U=h|T<<6;V=p+3|0}else{U=S;V=g}}while(0);c[q>>2]=U;v=V;w=q+4|0;x=r-1|0;i=719;continue}else if((i|0)==720){i=0;g=a[s]|0;do{if(((g&255)-1|0)>>>0<127){if((s&3|0)!=0){W=s;X=u;Y=g;break}h=c[s>>2]|0;if(((h-16843009|h)&-2139062144|0)==0){Z=u;_=s}else{W=s;X=u;Y=h&255;break}while(1){$=_+4|0;aa=Z-4|0;ab=c[$>>2]|0;if(((ab-16843009|ab)&-2139062144|0)==0){Z=aa;_=$}else{break}}W=$;X=aa;Y=ab&255}else{W=s;X=u;Y=g}}while(0);g=Y&255;if((g-1|0)>>>0<127){s=W+1|0;u=X-1|0;i=720;continue}h=g-194|0;if(h>>>0>50){O=X;P=b;Q=W;i=760;break}l=c[t+(h<<2)>>2]|0;m=W+1|0;n=X;i=729;continue}}if((i|0)==750){ac=o;ad=p-1|0;ae=q;af=r;i=759}else if((i|0)==733){ac=l;ad=m-1|0;ae=b;af=n;i=759}else if((i|0)==753){ac=S;ad=p-1|0;ae=q;af=r;i=759}else if((i|0)==756){ac=T;ad=p-1|0;ae=q;af=r;i=759}else if((i|0)==736){ac=l;ad=m-1|0;ae=b;af=n;i=759}else if((i|0)==730){ac=l;ad=m-1|0;ae=b;af=n;i=759}else if((i|0)==768){return y|0}else if((i|0)==769){return y|0}if((i|0)==759){if((ac|0)==0){O=af;P=ae;Q=ad;i=760}else{ag=ae;ah=ad}}do{if((i|0)==760){if((a[Q]|0)!=0){ag=P;ah=Q;break}if((P|0)!=0){c[P>>2]=0;c[e>>2]=0}y=f-O|0;return y|0}}while(0);c[bL()>>2]=138;if((ag|0)==0){y=-1;return y|0}c[e>>2]=ah;y=-1;return y|0}function j6(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[bL()>>2]=138;f=-1;return f|0}return 0}function j7(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L929:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L929}x=w?r:s;y=s-x|0;w=j8(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L929}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L940:do{if((q|0)==0){B=m;C=q}else{if((o|0)==0|(n|0)==0){B=m;C=q;break}else{D=o;E=n;F=m;G=p;H=q}while(1){I=j6(G,c[H>>2]|0,0)|0;if((I+1|0)>>>0<2){break}y=H+4|0;c[h>>2]=y;z=E-1|0;A=F+1|0;if((D|0)==(I|0)|(z|0)==0){B=A;C=y;break L940}else{D=D-I|0;E=z;F=A;G=G+I|0;H=y}}if((I|0)!=0){B=-1;C=H;break}c[h>>2]=0;B=F;C=0}}while(0);if(!k){i=f;return B|0}c[b>>2]=C;i=f;return B|0}function j8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=j6(j,o,0)|0;if((k|0)==-1){l=-1;p=835;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=836;break}else{m=k;n=h;o=r}}if((p|0)==835){i=f;return l|0}else if((p|0)==836){i=f;return l|0}}L966:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L966}if(q>>>0>127){j=j6(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L966}}i=f;return l|0}else{s=e;t=b}}while(0);L978:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=831;break}if(m>>>0>127){n=j6(b,m,0)|0;if((n|0)==-1){l=-1;p=834;break}if(n>>>0>u>>>0){p=827;break}o=c[w>>2]|0;j6(v,o,0);y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L978}else{u=z;v=y;w=m}}if((p|0)==831){a[v]=0;x=u;break}else if((p|0)==827){l=e-u|0;i=f;return l|0}else if((p|0)==834){i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function j9(a){a=a|0;ky(a);return}function ka(a){a=a|0;ky(a);return}function kb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kc(a){a=a|0;ky(a);return}function kd(a){a=a|0;ky(a);return}function ke(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=kh(b,13448,13432,-1)|0;j=h;if((h|0)==0){g=0;break}kD(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;ct[c[(c[h>>2]|0)+28>>2]&31](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2]|0;g=1}}while(0);i=e;return g|0}function kf(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;ct[c[(c[g>>2]|0)+28>>2]&31](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;ct[c[(c[j>>2]|0)+28>>2]&31](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;ct[c[(c[j>>2]|0)+28>>2]&31](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=896;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=900;break}}if((m|0)==896){return}else if((m|0)==900){return}}function kh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;kD(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;cr[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}cc[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else{o=0}}while(0);i=f;return o|0}function ki(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L1105:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L1107:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;cr[c[(c[v>>2]|0)+20>>2]&63](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L1107}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=939;break L1105}if((c[o>>2]&2|0)==0){B=939;break L1105}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=938}else{D=x;B=935}}else{D=0;B=935}}while(0);do{if((B|0)==935){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1|0;if((c[d+36>>2]|0)!=1){C=D;B=938;break}if((c[d+24>>2]|0)!=2){C=D;B=938;break}a[d+54|0]=1;if(D){B=939}else{B=940}}}while(0);if((B|0)==938){if(C){B=939}else{B=940}}if((B|0)==940){c[i>>2]=4;return}else if((B|0)==939){c[i>>2]=3;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;cc[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=979;break}if((c[b>>2]|0)==1){B=980;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;cc[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=981;break}}if((B|0)==979){return}else if((B|0)==980){return}else if((B|0)==981){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=976;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=977;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;cc[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=978;break}}if((B|0)==976){return}else if((B|0)==977){return}else if((B|0)==978){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=967;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;cc[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=968;break}}if((B|0)==967){return}else if((B|0)==968){return}}function kj(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;cc[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;cr[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=995}else{if((a[j]&1)==0){m=1;n=995}}L1207:do{if((n|0)==995){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=998;break}a[d+54|0]=1;if(m){break L1207}}else{n=998}}while(0);if((n|0)==998){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function kk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function kl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function km(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;cr[c[(c[p>>2]|0)+20>>2]&63](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L1281:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;while(1){if((a[p]&1)!=0){break L1281}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L1281}}else{if((c[o>>2]|0)==1){break L1281}if((c[q>>2]&2|0)==0){break L1281}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;cr[c[(c[u>>2]|0)+20>>2]&63](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;if(s>>>0>=n>>>0){break L1281}}}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function kn(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;cr[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function ko(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[672]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=2728+(h<<2)|0;j=2728+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[672]=e&(1<<g^-1)}else{if(l>>>0<(c[676]|0)>>>0){bW();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{bW();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[674]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=2728+(p<<2)|0;m=2728+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[672]=e&(1<<r^-1)}else{if(l>>>0<(c[676]|0)>>>0){bW();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{bW();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[674]|0;if((l|0)!=0){q=c[677]|0;d=l>>>3;l=d<<1;f=2728+(l<<2)|0;k=c[672]|0;h=1<<d;do{if((k&h|0)==0){c[672]=k|h;s=f;t=2728+(l+2<<2)|0}else{d=2728+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[676]|0)>>>0){s=g;t=d;break}bW();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[674]=m;c[677]=e;n=i;return n|0}l=c[673]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[2992+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[676]|0;if(r>>>0<i>>>0){bW();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){bW();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){bW();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){bW();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){bW();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{bW();return 0;return 0}}}while(0);L1423:do{if((e|0)!=0){f=d+28|0;i=2992+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[673]=c[673]&(1<<c[f>>2]^-1);break L1423}else{if(e>>>0<(c[676]|0)>>>0){bW();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L1423}}}while(0);if(v>>>0<(c[676]|0)>>>0){bW();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[674]|0;if((f|0)!=0){e=c[677]|0;i=f>>>3;f=i<<1;q=2728+(f<<2)|0;k=c[672]|0;g=1<<i;do{if((k&g|0)==0){c[672]=k|g;y=q;z=2728+(f+2<<2)|0}else{i=2728+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[676]|0)>>>0){y=l;z=i;break}bW();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[674]=p;c[677]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[673]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[2992+(A<<2)>>2]|0;L1471:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L1471}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break L1471}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[2992+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}L1486:do{if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break L1486}else{p=r;m=i;q=e}}}}while(0);if((K|0)==0){o=g;break}if(J>>>0>=((c[674]|0)-g|0)>>>0){o=g;break}k=K;q=c[676]|0;if(k>>>0<q>>>0){bW();return 0;return 0}m=k+g|0;p=m;if(k>>>0>=m>>>0){bW();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<q>>>0){bW();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<q>>>0){bW();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){bW();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{bW();return 0;return 0}}}while(0);L1521:do{if((e|0)!=0){i=K+28|0;q=2992+(c[i>>2]<<2)|0;do{if((K|0)==(c[q>>2]|0)){c[q>>2]=L;if((L|0)!=0){break}c[673]=c[673]&(1<<c[i>>2]^-1);break L1521}else{if(e>>>0<(c[676]|0)>>>0){bW();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L1521}}}while(0);if(L>>>0<(c[676]|0)>>>0){bW();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=k+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[k+(g|4)>>2]=J|1;c[k+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;q=2728+(e<<2)|0;r=c[672]|0;j=1<<i;do{if((r&j|0)==0){c[672]=r|j;O=q;P=2728+(e+2<<2)|0}else{i=2728+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[676]|0)>>>0){O=d;P=i;break}bW();return 0;return 0}}while(0);c[P>>2]=p;c[O+12>>2]=p;c[k+(g+8|0)>>2]=O;c[k+(g+12|0)>>2]=q;break}e=m;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=2992+(Q<<2)|0;c[k+(g+28|0)>>2]=Q;c[k+(g+20|0)>>2]=0;c[k+(g+16|0)>>2]=0;q=c[673]|0;l=1<<Q;if((q&l|0)==0){c[673]=q|l;c[j>>2]=e;c[k+(g+24|0)>>2]=j;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;q=c[j>>2]|0;while(1){if((c[q+4>>2]&-8|0)==(J|0)){break}S=q+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=1255;break}else{l=l<<1;q=j}}if((T|0)==1255){if(S>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[S>>2]=e;c[k+(g+24|0)>>2]=q;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}}l=q+8|0;j=c[l>>2]|0;i=c[676]|0;if(q>>>0<i>>>0){bW();return 0;return 0}if(j>>>0<i>>>0){bW();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[k+(g+8|0)>>2]=j;c[k+(g+12|0)>>2]=q;c[k+(g+24|0)>>2]=0;break}}}while(0);k=K+8|0;if((k|0)==0){o=g;break}else{n=k}return n|0}}while(0);K=c[674]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[677]|0;if(S>>>0>15){R=J;c[677]=R+o|0;c[674]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[674]=0;c[677]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[675]|0;if(o>>>0<J>>>0){S=J-o|0;c[675]=S;J=c[678]|0;K=J;c[678]=K+o|0;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[20]|0)==0){J=bU(8)|0;if((J-1&J|0)==0){c[22]=J;c[21]=J;c[23]=-1;c[24]=2097152;c[25]=0;c[783]=0;c[20]=cb(0)&-16^1431655768;break}else{bW();return 0;return 0}}}while(0);J=o+48|0;S=c[22]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[782]|0;do{if((O|0)!=0){P=c[780]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L1613:do{if((c[783]&4|0)==0){O=c[678]|0;L1615:do{if((O|0)==0){T=1285}else{L=O;P=3136;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=1285;break L1615}else{P=M}}if((P|0)==0){T=1285;break}L=R-(c[675]|0)&Q;if(L>>>0>=2147483647){W=0;break}q=bK(L|0)|0;e=(q|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?q:-1;Y=e?L:0;Z=q;_=L;T=1294}}while(0);do{if((T|0)==1285){O=bK(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[21]|0;q=L-1|0;if((q&g|0)==0){$=S}else{$=(S-g|0)+(q+g&-L)|0}L=c[780]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}q=c[782]|0;if((q|0)!=0){if(g>>>0<=L>>>0|g>>>0>q>>>0){W=0;break}}q=bK($|0)|0;g=(q|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=q;_=$;T=1294}}while(0);L1635:do{if((T|0)==1294){q=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=1305;break L1613}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[22]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bK(O|0)|0)==-1){bK(q|0);W=Y;break L1635}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=1305;break L1613}}}while(0);c[783]=c[783]|4;ad=W;T=1302}else{ad=0;T=1302}}while(0);do{if((T|0)==1302){if(S>>>0>=2147483647){break}W=bK(S|0)|0;Z=bK(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=1305}}}while(0);do{if((T|0)==1305){ad=(c[780]|0)+aa|0;c[780]=ad;if(ad>>>0>(c[781]|0)>>>0){c[781]=ad}ad=c[678]|0;L1655:do{if((ad|0)==0){S=c[676]|0;if((S|0)==0|ab>>>0<S>>>0){c[676]=ab}c[784]=ab;c[785]=aa;c[787]=0;c[681]=c[20]|0;c[680]=-1;S=0;do{Y=S<<1;ac=2728+(Y<<2)|0;c[2728+(Y+3<<2)>>2]=ac;c[2728+(Y+2<<2)>>2]=ac;S=S+1|0;}while(!(S>>>0>=32));S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[678]=ab+ae|0;c[675]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[679]=c[24]|0}else{S=3136;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=1317;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==1317){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa|0;ac=c[678]|0;Y=(c[675]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[678]=Z+ai|0;c[675]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[679]=c[24]|0;break L1655}}while(0);if(ab>>>0<(c[676]|0)>>>0){c[676]=ab}S=ab+aa|0;Y=3136;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1327;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1327){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa|0;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa|0)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=(S-(ab+ak|0)|0)-o|0;c[ab+(ak+4|0)>>2]=o|3;do{if((Z|0)==(c[678]|0)){J=(c[675]|0)+K|0;c[675]=J;c[678]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[677]|0)){J=(c[674]|0)+K|0;c[674]=J;c[677]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1700:do{if(X>>>0<256){U=c[ab+((al|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+al|0)>>2]|0;R=2728+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[676]|0)>>>0){bW();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}bW();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[672]=c[672]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[676]|0)>>>0){bW();return 0;return 0}q=Q+8|0;if((c[q>>2]|0)==(Z|0)){am=q;break}bW();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;q=c[ab+((al|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+al|0)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa|0)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa|0)>>2]|0;if(g>>>0<(c[676]|0)>>>0){bW();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){bW();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{bW();return 0;return 0}}}while(0);if((q|0)==0){break}P=ab+((aa+28|0)+al|0)|0;U=2992+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[673]=c[673]&(1<<c[P>>2]^-1);break L1700}else{if(q>>>0<(c[676]|0)>>>0){bW();return 0;return 0}Q=q+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[q+20>>2]=an}if((an|0)==0){break L1700}}}while(0);if(an>>>0<(c[676]|0)>>>0){bW();return 0;return 0}c[an+24>>2]=q;R=al|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa|0)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=ar|1;c[ab+(ar+W|0)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=2728+(V<<2)|0;P=c[672]|0;q=1<<J;do{if((P&q|0)==0){c[672]=P|q;as=X;at=2728+(V+2<<2)|0}else{J=2728+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[676]|0)>>>0){as=U;at=J;break}bW();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8|0)>>2]=as;c[ab+(W+12|0)>>2]=X;break}V=ac;q=ar>>>8;do{if((q|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(q+1048320|0)>>>16&8;$=q<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=2992+(au<<2)|0;c[ab+(W+28|0)>>2]=au;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[673]|0;Q=1<<au;if((X&Q|0)==0){c[673]=X|Q;c[q>>2]=V;c[ab+(W+24|0)>>2]=q;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[q>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;q=c[aw>>2]|0;if((q|0)==0){T=1400;break}else{Q=Q<<1;X=q}}if((T|0)==1400){if(aw>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;q=c[Q>>2]|0;$=c[676]|0;if(X>>>0<$>>>0){bW();return 0;return 0}if(q>>>0<$>>>0){bW();return 0;return 0}else{c[q+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=q;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=3136;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39|0)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+((ay-47|0)+aA|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=(aa-40|0)-aB|0;c[678]=ab+aB|0;c[675]=_;c[ab+(aB+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[679]=c[24]|0;c[ac+4>>2]=27;c[W>>2]=c[784]|0;c[W+4>>2]=c[3140>>2]|0;c[W+8>>2]=c[3144>>2]|0;c[W+12>>2]=c[3148>>2]|0;c[784]=ab;c[785]=aa;c[787]=0;c[786]=W;W=ac+28|0;c[W>>2]=7;L1819:do{if((ac+32|0)>>>0<az>>>0){_=W;while(1){K=_+4|0;c[K>>2]=7;if((_+8|0)>>>0<az>>>0){_=K}else{break L1819}}}}while(0);if((ac|0)==(Y|0)){break}W=ac-ad|0;_=Y+(W+4|0)|0;c[_>>2]=c[_>>2]&-2;c[ad+4>>2]=W|1;c[Y+W>>2]=W;_=W>>>3;if(W>>>0<256){K=_<<1;Z=2728+(K<<2)|0;S=c[672]|0;q=1<<_;do{if((S&q|0)==0){c[672]=S|q;aC=Z;aD=2728+(K+2<<2)|0}else{_=2728+(K+2<<2)|0;Q=c[_>>2]|0;if(Q>>>0>=(c[676]|0)>>>0){aC=Q;aD=_;break}bW();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;q=W>>>8;do{if((q|0)==0){aE=0}else{if(W>>>0>16777215){aE=31;break}S=(q+1048320|0)>>>16&8;Y=q<<S;ac=(Y+520192|0)>>>16&4;_=Y<<ac;Y=(_+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(_<<Y>>>15)|0;aE=W>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=2992+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[673]|0;Q=1<<aE;if((Z&Q|0)==0){c[673]=Z|Q;c[q>>2]=K;c[ad+24>>2]=q;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=W<<aF;Z=c[q>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(W|0)){break}aG=Z+16+(Q>>>31<<2)|0;q=c[aG>>2]|0;if((q|0)==0){T=1435;break}else{Q=Q<<1;Z=q}}if((T|0)==1435){if(aG>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;W=c[Q>>2]|0;q=c[676]|0;if(Z>>>0<q>>>0){bW();return 0;return 0}if(W>>>0<q>>>0){bW();return 0;return 0}else{c[W+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=W;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[675]|0;if(ad>>>0<=o>>>0){break}W=ad-o|0;c[675]=W;ad=c[678]|0;Q=ad;c[678]=Q+o|0;c[Q+(o+4|0)>>2]=W|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[bL()>>2]=12;n=0;return n|0}function kp(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[676]|0;if(b>>>0<e>>>0){bW()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){bW()}h=f&-8;i=a+(h-8|0)|0;j=i;L1872:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){bW()}if((n|0)==(c[677]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[674]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=2728+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){bW()}if((c[k+12>>2]|0)==(n|0)){break}bW()}}while(0);if((s|0)==(k|0)){c[672]=c[672]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){bW()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}bW()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){bW()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){bW()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){bW()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{bW()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=2992+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[673]=c[673]&(1<<c[v>>2]^-1);q=n;r=o;break L1872}else{if(p>>>0<(c[676]|0)>>>0){bW()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1872}}}while(0);if(A>>>0<(c[676]|0)>>>0){bW()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[676]|0)>>>0){bW()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[676]|0)>>>0){bW()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){bW()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){bW()}do{if((e&2|0)==0){if((j|0)==(c[678]|0)){B=(c[675]|0)+r|0;c[675]=B;c[678]=q;c[q+4>>2]=B|1;if((q|0)==(c[677]|0)){c[677]=0;c[674]=0}if(B>>>0<=(c[679]|0)>>>0){return}kr(0);return}if((j|0)==(c[677]|0)){B=(c[674]|0)+r|0;c[674]=B;c[677]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1977:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=2728+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[676]|0)>>>0){bW()}if((c[u+12>>2]|0)==(j|0)){break}bW()}}while(0);if((g|0)==(u|0)){c[672]=c[672]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[676]|0)>>>0){bW()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}bW()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[676]|0)>>>0){bW()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[676]|0)>>>0){bW()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){bW()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{bW()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=2992+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[673]=c[673]&(1<<c[t>>2]^-1);break L1977}else{if(f>>>0<(c[676]|0)>>>0){bW()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1977}}}while(0);if(E>>>0<(c[676]|0)>>>0){bW()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[676]|0)>>>0){bW()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[676]|0)>>>0){bW()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[677]|0)){H=B;break}c[674]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=2728+(d<<2)|0;A=c[672]|0;E=1<<r;do{if((A&E|0)==0){c[672]=A|E;I=e;J=2728+(d+2<<2)|0}else{r=2728+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[676]|0)>>>0){I=h;J=r;break}bW()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=2992+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[673]|0;d=1<<K;do{if((r&d|0)==0){c[673]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1614;break}else{A=A<<1;J=E}}if((N|0)==1614){if(M>>>0<(c[676]|0)>>>0){bW()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[676]|0;if(J>>>0<E>>>0){bW()}if(B>>>0<E>>>0){bW()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[680]|0)-1|0;c[680]=q;if((q|0)==0){O=3144}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[680]=-1;return}function kq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=ko(b)|0;return d|0}if(b>>>0>4294967231){c[bL()>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=ks(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=ko(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;kE(f|0,a|0,g>>>0<b>>>0?g:b);kp(a);d=f;return d|0}function kr(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[20]|0)==0){b=bU(8)|0;if((b-1&b|0)==0){c[22]=b;c[21]=b;c[23]=-1;c[24]=2097152;c[25]=0;c[783]=0;c[20]=cb(0)&-16^1431655768;break}else{bW();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[678]|0;if((b|0)==0){d=0;return d|0}e=c[675]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[22]|0;g=ag(((((((-40-a|0)-1|0)+e|0)+f|0)>>>0)/(f>>>0)>>>0)-1|0,f);h=b;i=3136;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bK(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bK(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bK(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j|0;c[780]=(c[780]|0)-j|0;h=c[678]|0;m=(c[675]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[678]=j+o|0;c[675]=n;c[j+(o+4|0)>>2]=n|1;c[j+(m+4|0)>>2]=40;c[679]=c[24]|0;d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[675]|0)>>>0<=(c[679]|0)>>>0){d=0;return d|0}c[679]=-1;d=0;return d|0}function ks(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[676]|0;if(g>>>0<j>>>0){bW();return 0;return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){bW();return 0;return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){bW();return 0;return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[22]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=k|3;c[l>>2]=c[l>>2]|1;kt(g+b|0,k);n=a;return n|0}if((i|0)==(c[678]|0)){k=(c[675]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=l|1;c[678]=g+b|0;c[675]=l;n=a;return n|0}if((i|0)==(c[677]|0)){l=(c[674]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4|0)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4|0)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4|0)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[674]=q;c[677]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L2198:do{if(m>>>0<256){l=c[g+(f+8|0)>>2]|0;k=c[g+(f+12|0)>>2]|0;o=2728+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){bW();return 0;return 0}if((c[l+12>>2]|0)==(i|0)){break}bW();return 0;return 0}}while(0);if((k|0)==(l|0)){c[672]=c[672]&(1<<e^-1);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){bW();return 0;return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}bW();return 0;return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24|0)>>2]|0;t=c[g+(f+12|0)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20|0)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16|0)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){bW();return 0;return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8|0)>>2]|0;if(u>>>0<j>>>0){bW();return 0;return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){bW();return 0;return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{bW();return 0;return 0}}}while(0);if((s|0)==0){break}t=g+(f+28|0)|0;l=2992+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[673]=c[673]&(1<<c[t>>2]^-1);break L2198}else{if(s>>>0<(c[676]|0)>>>0){bW();return 0;return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L2198}}}while(0);if(y>>>0<(c[676]|0)>>>0){bW();return 0;return 0}c[y+24>>2]=s;o=c[g+(f+16|0)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20|0)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[676]|0)>>>0){bW();return 0;return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4|0)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;kt(g+b|0,q);n=a;return n|0}return 0}function kt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L2274:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[676]|0;if(i>>>0<l>>>0){bW()}if((j|0)==(c[677]|0)){m=d+(b+4|0)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[674]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h|0)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h|0)>>2]|0;q=c[d+(12-h|0)>>2]|0;r=2728+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){bW()}if((c[p+12>>2]|0)==(j|0)){break}bW()}}while(0);if((q|0)==(p|0)){c[672]=c[672]&(1<<m^-1);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){bW()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}bW()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h|0)>>2]|0;t=c[d+(12-h|0)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4|0)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){bW()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h|0)>>2]|0;if(v>>>0<l>>>0){bW()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){bW()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{bW()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h|0)|0;l=2992+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[673]=c[673]&(1<<c[t>>2]^-1);n=j;o=k;break L2274}else{if(m>>>0<(c[676]|0)>>>0){bW()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L2274}}}while(0);if(y>>>0<(c[676]|0)>>>0){bW()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[676]|0)>>>0){bW()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4|0)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[676]|0)>>>0){bW()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[676]|0;if(e>>>0<a>>>0){bW()}y=d+(b+4|0)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[678]|0)){A=(c[675]|0)+o|0;c[675]=A;c[678]=n;c[n+4>>2]=A|1;if((n|0)!=(c[677]|0)){return}c[677]=0;c[674]=0;return}if((f|0)==(c[677]|0)){A=(c[674]|0)+o|0;c[674]=A;c[677]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L2373:do{if(z>>>0<256){g=c[d+(b+8|0)>>2]|0;t=c[d+(b+12|0)>>2]|0;h=2728+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){bW()}if((c[g+12>>2]|0)==(f|0)){break}bW()}}while(0);if((t|0)==(g|0)){c[672]=c[672]&(1<<s^-1);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){bW()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}bW()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24|0)>>2]|0;l=c[d+(b+12|0)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20|0)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16|0)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){bW()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8|0)>>2]|0;if(i>>>0<a>>>0){bW()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){bW()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{bW()}}}while(0);if((m|0)==0){break}l=d+(b+28|0)|0;g=2992+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[673]=c[673]&(1<<c[l>>2]^-1);break L2373}else{if(m>>>0<(c[676]|0)>>>0){bW()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L2373}}}while(0);if(C>>>0<(c[676]|0)>>>0){bW()}c[C+24>>2]=m;h=c[d+(b+16|0)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[676]|0)>>>0){bW()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20|0)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[676]|0)>>>0){bW()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[677]|0)){F=A;break}c[674]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=2728+(z<<2)|0;C=c[672]|0;b=1<<o;do{if((C&b|0)==0){c[672]=C|b;G=y;H=2728+(z+2<<2)|0}else{o=2728+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[676]|0)>>>0){G=d;H=o;break}bW()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=(14-(b|H|z)|0)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=2992+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[673]|0;z=1<<I;if((o&z|0)==0){c[673]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=1920;break}else{I=I<<1;J=G}}if((L|0)==1920){if(K>>>0<(c[676]|0)>>>0){bW()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[676]|0;if(J>>>0<I>>>0){bW()}if(L>>>0<I>>>0){bW()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function ku(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=ko(b)|0;if((d|0)!=0){e=1964;break}a=(I=c[3724]|0,c[3724]=I+0,I);if((a|0)==0){break}cn[a&1]()}if((e|0)==1964){return d|0}d=b3(4)|0;c[d>>2]=5656;bv(d|0,11840,32);return 0}function kv(a){a=a|0;return ku(a)|0}function kw(a){a=a|0;return}function kx(a){a=a|0;return 1408}function ky(a){a=a|0;if((a|0)!=0){kp(a)}return}function kz(a){a=a|0;ky(a);return}function kA(a){a=a|0;ky(a);return}function kB(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((aS(a[e]|0|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=((f*10&-1)-48|0)+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=1992}else{if((e|0)>0){v=0.0;w=e;x=l;y=1992}else{z=0.0;A=0.0}}if((y|0)==1992){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=((m*10&-1)-48|0)+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;L2536:do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=((I*10&-1)-48|0)+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break L2536}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[bL()>>2]=34;N=1.0;O=8;P=511;y=2009}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=2009}}L2548:do{if((y|0)==2009){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break L2548}else{N=R;O=O+8|0;P=m;y=2009}}}}while(0);if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function kC(){var a=0;a=b3(4)|0;c[a>>2]=5656;bv(a|0,11840,32)}function kD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function kE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2]|0;b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function kF(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{kE(b,c,d)}}function kG(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function kH(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function kI(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function kJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function kK(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function kL(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function kM(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function kN(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function kO(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function kP(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c);f=a>>>16;a=(e>>>16)+ag(d,f)|0;d=b>>>16;b=ag(d,c);return(K=((a>>>16)+ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,0|(a+b<<16|e&65535))|0}function kQ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=kJ(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=kJ(kV(i,b,kJ(g^c,h^d,g,h)|0,K,0)^a,K^e,a,e)|0;return(K=K,f)|0}function kR(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=kJ(h^a,j^b,h,j)|0;b=K;kV(m,b,kJ(k^d,l^e,k,l)|0,K,g);l=kJ(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,l)|0}function kS(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=kP(e,a)|0;f=K;return(K=(ag(b,a)+ag(d,e)|0)+f|f&0,0|c&-1)|0}function kT(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=kV(a,b,c,d,0)|0;return(K=K,e)|0}function kU(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;kV(a,b,d,e,g);i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function kV(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a&-1;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=0|a&-1;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((kO(l|0)|0)>>>0);return(K=n,o)|0}p=(kN(l|0)|0)-(kN(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=0|a&-1;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(kN(l|0)|0)-(kN(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=0|a&-1;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=((kN(j|0)|0)+33|0)-(kN(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=0|a&-1;return(K=n,o)|0}else{p=kO(j|0)|0;n=0|i>>>(p>>>0);o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=0|d&-1;d=k|e&0;e=kI(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=0|(u<<1|i>>>31);a=u>>>31|v<<1|0;kJ(e,k,j,a);b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=kJ(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=0|E;c[f+4>>2]=D|0}n=(0|J)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function kW(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;cc[a&7](b|0,c|0,d|0,e|0,f|0)}function kX(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;cd[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function kY(a,b){a=a|0;b=b|0;ce[a&511](b|0)}function kZ(a,b,c){a=a|0;b=b|0;c=c|0;cf[a&127](b|0,c|0)}function k_(a,b,c){a=a|0;b=b|0;c=c|0;return cg[a&63](b|0,c|0)|0}function k$(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return ch[a&31](b|0,c|0,d|0,e|0,f|0)|0}function k0(a,b){a=a|0;b=b|0;return ci[a&255](b|0)|0}function k1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cj[a&63](b|0,c|0,d|0)|0}function k2(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ck[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function k3(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;cl[a&7](b|0,c|0,d|0)}function k4(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;cm[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function k5(a){a=a|0;cn[a&1]()}function k6(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return co[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function k7(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;cp[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function k8(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;cq[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function k9(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;cr[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function la(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return cs[a&15](b|0,c|0,d|0,e|0)|0}function lb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ct[a&31](b|0,c|0,d|0,e|0)}function lc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0)}function ld(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(1)}function le(a){a=a|0;ah(2)}function lf(a,b){a=a|0;b=b|0;ah(3)}function lg(a,b){a=a|0;b=b|0;ah(4);return 0}function lh(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(5);return 0}function li(a){a=a|0;ah(6);return 0}function lj(a,b,c){a=a|0;b=b|0;c=c|0;ah(7);return 0}function lk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(8)}function ll(a,b,c){a=a|0;b=b|0;c=c|0;ah(9)}function lm(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(10)}function ln(){ah(11)}function lo(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(12);return 0}function lp(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(13)}function lq(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(14)}function lr(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(15)}function ls(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(16);return 0}function lt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17)}
// EMSCRIPTEN_END_FUNCS
var cc=[lc,lc,kj,lc,kk,lc,ki,lc];var cd=[ld,ld,gz,ld,gI,ld,gL,ld,id,ld,gm,ld,gi,ld,h2,ld,gt,ld,gy,ld,gM,ld,f1,ld,gx,ld,fS,ld,gJ,ld,f6,ld,f4,ld,fU,ld,fP,ld,fR,ld,fJ,ld,fT,ld,fM,ld,fL,ld,fZ,ld,fY,ld,fW,ld,gN,ld,fw,ld,gu,ld,fA,ld,fs,ld,fu,ld,fy,ld,fp,ld,fG,ld,fF,ld,fC,ld,fl,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld];var ce=[le,le,ib,le,ff,le,gd,le,dS,le,ei,le,ix,le,dH,le,dq,le,hF,le,f$,le,dO,le,fI,le,eZ,le,fa,le,c3,le,kw,le,cV,le,iE,le,iH,le,gF,le,fH,le,e6,le,h6,le,iF,le,cX,le,eI,le,e0,le,hw,le,iD,le,jw,le,iJ,le,j1,le,c5,le,jv,le,eY,le,dR,le,e$,le,gV,le,jy,le,iG,le,kp,le,h1,le,ju,le,eL,le,dp,le,fe,le,dP,le,jS,le,f_,le,cW,le,c2,le,g1,le,eH,le,eR,le,gT,le,gH,le,fb,le,hs,le,kA,le,eh,le,jU,le,jV,le,iC,le,e7,le,eC,le,kc,le,iW,le,i_,le,eJ,le,e9,le,hE,le,dk,le,hA,le,e8,le,jX,le,j2,le,je,le,dv,le,cN,le,gU,le,hO,le,j9,le,jt,le,hI,le,h$,le,jW,le,ho,le,ge,le,fd,le,c1,le,e_,le,eN,le,dX,le,hX,le,hP,le,jx,le,ef,le,cQ,le,j_,le,kd,le,eQ,le,dY,le,eG,le,cM,le,dw,le,e5,le,h8,le,c0,le,cY,le,er,le,eP,le,dI,le,fc,le,g5,le,gs,le,gZ,le,dh,le,ii,le,hW,le,eM,le,eB,le,eO,le,jT,le,gq,le,ka,le,h7,le,dg,le,j0,le,hG,le,g9,le,dZ,le,iI,le,dQ,le,eK,le,jY,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le,le];var cf=[lf,lf,jA,lf,hD,lf,dz,lf,jG,lf,hf,lf,jF,lf,dm,lf,ia,lf,hy,lf,hi,lf,hg,lf,hk,lf,hr,lf,hp,lf,hl,lf,hd,lf,dB,lf,hh,lf,jz,lf,c8,lf,hu,lf,hB,lf,ht,lf,jB,lf,he,lf,hj,lf,jr,lf,hc,lf,d6,lf,ig,lf,dW,lf,hx,lf,hb,lf,ha,lf,hq,lf,es,lf,hz,lf,hv,lf,hC,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf];var cg=[lg,lg,iS,lg,dL,lg,it,lg,il,lg,ec,lg,dt,lg,dG,lg,iO,lg,c_,lg,da,lg,iU,lg,ey,lg,iQ,lg,cU,lg,dd,lg,eb,lg,dn,lg,ex,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg,lg];var ch=[lh,lh,i6,lh,i4,lh,js,lh,ip,lh,iz,lh,jd,lh,e3,lh,iB,lh,iw,lh,i2,lh,e1,lh,jh,lh,lh,lh,lh,lh,lh,lh];var ci=[li,li,jR,li,g3,li,ea,li,jH,li,ek,li,jP,li,g_,li,i3,li,i9,li,gr,li,jD,li,dK,li,eE,li,ew,li,jL,li,jJ,li,ji,li,j$,li,dD,li,jq,li,jn,li,jK,li,i8,li,db,li,jo,li,d8,li,g8,li,jM,li,dJ,li,di,li,g$,li,iY,li,jQ,li,jk,li,g6,li,jC,li,dr,li,jj,li,i5,li,eX,li,gY,li,ds,li,jp,li,d9,li,eu,li,dx,li,dc,li,g0,li,is,li,ir,li,kx,li,ev,li,gW,li,jE,li,iq,li,gX,li,dC,li,g2,li,g4,li,jI,li,g7,li,gG,li,cT,li,jO,li,jN,li,i7,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li,li];var cj=[lj,lj,e2,lj,iT,lj,iR,lj,ke,lj,h9,lj,iu,lj,e4,lj,dT,lj,el,lj,ej,lj,iK,lj,et,lj,ic,lj,iv,lj,c6,lj,iP,lj,eD,lj,dF,lj,iV,lj,d7,lj,eF,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj,lj];var ck=[lk,lk,gp,lk,gn,lk,gc,lk,f8,lk,lk,lk,lk,lk,lk,lk];var cl=[ll,ll,dE,ll,fi,ll,ll,ll];var cm=[lm,lm,hn,lm,hm,lm,hJ,lm,hR,lm,hN,lm,hU,lm,lm,lm];var cn=[ln,ln];var co=[lo,lo,im,lo,i1,lo,i0,lo,io,lo,jf,lo,jg,lo,iX,lo,i$,lo,lo,lo,lo,lo,lo,lo,lo,lo,lo,lo,lo,lo,lo,lo];var cp=[lp,lp,gO,lp,gA,lp,lp,lp];var cq=[lq,lq,h3,lq,hZ,lq,lq,lq];var cr=[lr,lr,km,lr,gj,lr,gf,lr,kn,lr,gv,lr,ie,lr,ez,lr,c9,lr,gg,lr,f2,lr,f5,lr,f0,lr,cS,lr,gh,lr,kl,lr,ed,lr,ih,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr,lr];var cs=[ls,ls,iL,ls,iM,ls,iA,ls,iy,ls,iN,ls,ls,ls,ls,ls];var ct=[lt,lt,cZ,lt,kf,lt,kg,lt,ee,lt,kb,lt,eA,lt,c7,lt,fk,lt,fj,lt,lt,lt,lt,lt,lt,lt,lt,lt,lt,lt,lt,lt];return{_strlen:kG,_free:kp,_main:cR,_realloc:kq,_memmove:kF,__GLOBAL__I_a:dN,_memset:kD,_malloc:ko,_memcpy:kE,_strcpy:kH,stackAlloc:cu,stackSave:cv,stackRestore:cw,setThrew:cx,setTempRet0:cy,setTempRet1:cz,setTempRet2:cA,setTempRet3:cB,setTempRet4:cC,setTempRet5:cD,setTempRet6:cE,setTempRet7:cF,setTempRet8:cG,setTempRet9:cH,dynCall_viiiii:kW,dynCall_viiiiiii:kX,dynCall_vi:kY,dynCall_vii:kZ,dynCall_iii:k_,dynCall_iiiiii:k$,dynCall_ii:k0,dynCall_iiii:k1,dynCall_viiiiif:k2,dynCall_viii:k3,dynCall_viiiiiiii:k4,dynCall_v:k5,dynCall_iiiiiiiii:k6,dynCall_viiiiiiiii:k7,dynCall_viiiiiif:k8,dynCall_viiiiii:k9,dynCall_iiiii:la,dynCall_viiii:lb}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "copyTempDouble": copyTempDouble, "copyTempFloat": copyTempFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "__isFloat": __isFloat, "_strtoull": _strtoull, "_fflush": _fflush, "_clGetPlatformIDs": _clGetPlatformIDs, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_clReleaseCommandQueue": _clReleaseCommandQueue, "_read": _read, "_clGetContextInfo": _clGetContextInfo, "_fsync": _fsync, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "_clReleaseMemObject": _clReleaseMemObject, "_clReleaseContext": _clReleaseContext, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "_llvm_lifetime_start": _llvm_lifetime_start, "___setErrNo": ___setErrNo, "_clCreateContextFromType": _clCreateContextFromType, "_isxdigit": _isxdigit, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "_asprintf": _asprintf, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___locale_mb_cur_max": ___locale_mb_cur_max, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_call_unexpected": ___cxa_call_unexpected, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_clReleaseKernel": _clReleaseKernel, "_llvm_eh_exception": _llvm_eh_exception, "_pread": _pread, "_fopen": _fopen, "_open": _open, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clReleaseProgram": _clReleaseProgram, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_clSetKernelArg": _clSetKernelArg, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "__ZSt9terminatev": __ZSt9terminatev, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_clCreateBuffer": _clCreateBuffer, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "_ungetc": _ungetc, "_vsprintf": _vsprintf, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_isdigit": _isdigit, "_strtoll": _strtoll, "__reallyNegative": __reallyNegative, "_clCreateCommandQueue": _clCreateCommandQueue, "_clBuildProgram": _clBuildProgram, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "_fseek": _fseek, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "_clCreateKernel": _clCreateKernel, "_vasprintf": _vasprintf, "_clCreateProgramWithSource": _clCreateProgramWithSource, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "_stdout": _stdout, "___fsmu8": ___fsmu8, "___dso_handle": ___dso_handle }, buffer);
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
