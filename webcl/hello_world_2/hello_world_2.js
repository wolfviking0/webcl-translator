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
  module.exports = Module;
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
  this['Module'] = Module;
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
  this['Module'] = Module;
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
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
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
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 15248;
var _stdout;
var _stdin;
var _stderr;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });
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
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,240,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,100,101,118,105,99,101,32,73,68,115,0,0,0,0,0,0,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,78,111,32,100,101,118,105,99,101,115,32,97,118,97,105,108,97,98,108,101,46,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,70,97,105,108,101,100,32,99,97,108,108,32,116,111,32,99,108,71,101,116,67,111,110,116,101,120,116,73,110,102,111,40,46,46,46,44,71,76,95,67,79,78,84,69,88,84,95,68,69,86,73,67,69,83,44,46,46,46,41,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,110,32,79,112,101,110,67,76,32,71,80,85,32,111,114,32,67,80,85,32,99,111,110,116,101,120,116,46,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,32,46,46,46,0,0,0,0,32,99,111,110,116,101,120,116,44,32,116,114,121,105,110,103,32,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,99,114,101,97,116,101,32,0,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,69,120,101,99,117,116,101,100,32,112,114,111,103,114,97,109,32,115,117,99,99,101,115,102,117,108,108,121,46,0,0,0,32,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,114,101,115,117,108,116,32,98,117,102,102,101,114,46,0,0,0,0,69,114,114,111,114,32,113,117,101,117,105,110,103,32,107,101,114,110,101,108,32,102,111,114,32,101,120,101,99,117,116,105,111,110,46,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,69,114,114,111,114,32,115,101,116,116,105,110,103,32,107,101,114,110,101,108,32,97,114,103,117,109,101,110,116,115,46,0,37,112,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,107,101,114,110,101,108,0,67,80,85,0,0,0,0,0,104,101,108,108,111,95,107,101,114,110,101,108,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,104,101,108,108,111,95,119,111,114,108,100,95,50,46,99,108,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,46,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,103,112,117,0,0,0,0,0,37,46,48,76,102,0,0,0,99,112,117,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,69,114,114,111,114,32,99,114,101,97,116,105,110,103,32,109,101,109,111,114,121,32,111,98,106,101,99,116,115,46,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,69,114,114,111,114,32,105,110,32,107,101,114,110,101,108,58,32,0,0,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,67,76,32,112,114,111,103,114,97,109,32,102,114,111,109,32,115,111,117,114,99,101,46,0,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,32,102,111,114,32,114,101,97,100,105,110,103,58,32,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,109,97,110,100,81,117,101,117,101,32,102,111,114,32,100,101,118,105,99,101,32,48,0,0,0,0,0,0,71,80,85,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,102,105,110,100,32,97,110,121,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,115,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,200,36,0,0,34,0,0,0,128,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,36,0,0,214,0,0,0,178,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,36,0,0,80,0,0,0,26,1,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,36,0,0,102,0,0,0,8,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,37,0,0,102,0,0,0,22,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,37,0,0,184,0,0,0,92,0,0,0,56,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,37,0,0,254,0,0,0,202,0,0,0,56,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,37,0,0,176,0,0,0,204,0,0,0,56,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,37,0,0,20,1,0,0,154,0,0,0,56,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,38,0,0,18,1,0,0,18,0,0,0,56,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,38,0,0,174,0,0,0,120,0,0,0,56,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,38,0,0,44,0,0,0,122,0,0,0,56,0,0,0,124,0,0,0,4,0,0,0,30,0,0,0,6,0,0,0,20,0,0,0,54,0,0,0,2,0,0,0,248,255,255,255,96,38,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,38,0,0,8,1,0,0,248,0,0,0,56,0,0,0,20,0,0,0,16,0,0,0,58,0,0,0,26,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,136,38,0,0,72,0,0,0,108,0,0,0,120,0,0,0,128,0,0,0,66,0,0,0,44,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,38,0,0,86,0,0,0,206,0,0,0,56,0,0,0,50,0,0,0,40,0,0,0,8,0,0,0,42,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,38,0,0,68,0,0,0,76,0,0,0,56,0,0,0,42,0,0,0,86,0,0,0,12,0,0,0,58,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,38,0,0,12,1,0,0,2,0,0,0,56,0,0,0,26,0,0,0,34,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,38,0,0,52,0,0,0,230,0,0,0,56,0,0,0,10,0,0,0,12,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,39,0,0,236,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,39,0,0,30,0,0,0,152,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,39,0,0,6,0,0,0,190,0,0,0,56,0,0,0,28,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,39,0,0,106,0,0,0,20,0,0,0,56,0,0,0,20,0,0,0,24,0,0,0,32,0,0,0,22,0,0,0,22,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,39,0,0,46,0,0,0,26,0,0,0,56,0,0,0,46,0,0,0,44,0,0,0,36,0,0,0,38,0,0,0,28,0,0,0,42,0,0,0,34,0,0,0,52,0,0,0,50,0,0,0,48,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,39,0,0,62,0,0,0,4,0,0,0,56,0,0,0,76,0,0,0,68,0,0,0,62,0,0,0,64,0,0,0,56,0,0,0,66,0,0,0,60,0,0,0,74,0,0,0,72,0,0,0,70,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,39,0,0,82,0,0,0,100,0,0,0,56,0,0,0,14,0,0,0,16,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,39,0,0,28,0,0,0,192,0,0,0,56,0,0,0,22,0,0,0,18,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,39,0,0,252,0,0,0,144,0,0,0,56,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,64,0,0,0,4,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,39,0,0,196,0,0,0,70,0,0,0,56,0,0,0,2,0,0,0,8,0,0,0,8,0,0,0,110,0,0,0,100,0,0,0,18,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,40,0,0,196,0,0,0,146,0,0,0,56,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,132,0,0,0,46,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,40,0,0,196,0,0,0,166,0,0,0,56,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,40,0,0,196,0,0,0,40,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,40,0,0,66,0,0,0,136,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,40,0,0,196,0,0,0,88,0,0,0,56,0,0,0,22,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,14,0,0,0,32,0,0,0,24,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,40,0,0,24,1,0,0,42,0,0,0,56,0,0,0,2,0,0,0,4,0,0,0,20,0,0,0,38,0,0,0,8,0,0,0,6,0,0,0,28,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,184,40,0,0,224,0,0,0,212,0,0,0,200,255,255,255,200,255,255,255,184,40,0,0,36,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,40,0,0,78,0,0,0,244,0,0,0,80,0,0,0,2,0,0,0,16,0,0,0,36,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,40,0,0,196,0,0,0,94,0,0,0,56,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,40,0,0,196,0,0,0,180,0,0,0,56,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,76,0,0,0,6,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,40,0,0,58,0,0,0,234,0,0,0,62,0,0,0,40,0,0,0,26,0,0,0,2,0,0,0,52,0,0,0,88,0,0,0,20,0,0,0,126,0,0,0,10,0,0,0,26,0,0,0,18,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,41,0,0,140,0,0,0,2,1,0,0,76,0,0,0,24,0,0,0,14,0,0,0,12,0,0,0,90,0,0,0,104,0,0,0,34,0,0,0,28,0,0,0,26,0,0,0,36,0,0,0,42,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,41,0,0,10,0,0,0,130,0,0,0,62,0,0,0,40,0,0,0,32,0,0,0,8,0,0,0,52,0,0,0,88,0,0,0,20,0,0,0,6,0,0,0,10,0,0,0,32,0,0,0,18,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,41,0,0,108,0,0,0,210,0,0,0,2,0,0,0,2,0,0,0,16,0,0,0,36,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,32,41,0,0,170,0,0,0,194,0,0,0,148,255,255,255,148,255,255,255,32,41,0,0,112,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,80,41,0,0,50,0,0,0,228,0,0,0,252,255,255,255,252,255,255,255,80,41,0,0,160,0,0,0,138,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,104,41,0,0,238,0,0,0,4,1,0,0,252,255,255,255,252,255,255,255,104,41,0,0,118,0,0,0,218,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,128,41,0,0,96,0,0,0,28,1,0,0,248,255,255,255,248,255,255,255,128,41,0,0,198,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,152,41,0,0,116,0,0,0,222,0,0,0,248,255,255,255,248,255,255,255,152,41,0,0,150,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,41,0,0,232,0,0,0,74,0,0,0,44,0,0,0,30,0,0,0,16,0,0,0,14,0,0,0,48,0,0,0,88,0,0,0,20,0,0,0,94,0,0,0,10,0,0,0,18,0,0,0,18,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,41,0,0,220,0,0,0,200,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,41,0,0,14,1,0,0,54,0,0,0,14,0,0,0,24,0,0,0,14,0,0,0,12,0,0,0,60,0,0,0,104,0,0,0,34,0,0,0,28,0,0,0,26,0,0,0,36,0,0,0,42,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,41,0,0,168,0,0,0,226,0,0,0,36,0,0,0,40,0,0,0,32,0,0,0,8,0,0,0,92,0,0,0,88,0,0,0,20,0,0,0,6,0,0,0,10,0,0,0,32,0,0,0,18,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,42,0,0,246,0,0,0,158,0,0,0,56,0,0,0,70,0,0,0,122,0,0,0,40,0,0,0,82,0,0,0,4,0,0,0,30,0,0,0,54,0,0,0,22,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,42,0,0,114,0,0,0,64,0,0,0,56,0,0,0,116,0,0,0,4,0,0,0,68,0,0,0,18,0,0,0,78,0,0,0,24,0,0,0,118,0,0,0,54,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,42,0,0,250,0,0,0,126,0,0,0,56,0,0,0,14,0,0,0,62,0,0,0,50,0,0,0,46,0,0,0,80,0,0,0,56,0,0,0,96,0,0,0,60,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,42,0,0,84,0,0,0,188,0,0,0,56,0,0,0,106,0,0,0,112,0,0,0,28,0,0,0,74,0,0,0,26,0,0,0,20,0,0,0,82,0,0,0,72,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,42,0,0,98,0,0,0,16,0,0,0,6,0,0,0,24,0,0,0,14,0,0,0,12,0,0,0,90,0,0,0,104,0,0,0,34,0,0,0,74,0,0,0,84,0,0,0,10,0,0,0,42,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,42,0,0,14,0,0,0,240,0,0,0,66,0,0,0,40,0,0,0,32,0,0,0,8,0,0,0,52,0,0,0,88,0,0,0,20,0,0,0,58,0,0,0,24,0,0,0,4,0,0,0,18,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,42,0,0,16,1,0,0,216,0,0,0,72,0,0,0,164,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,140,18,0,0,44,43,0,0,64,43,0,0,160,18,0,0,100,20,0,0,84,43,0,0,104,43,0,0,120,20,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,111,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,32,24,0,0,0,0,0,0,48,24,0,0,0,0,0,0,64,24,0,0,192,36,0,0,0,0,0,0,0,0,0,0,80,24,0,0,192,36,0,0,0,0,0,0,0,0,0,0,96,24,0,0,192,36,0,0,0,0,0,0,0,0,0,0,120,24,0,0,8,37,0,0,0,0,0,0,0,0,0,0,144,24,0,0,192,36,0,0,0,0,0,0,0,0,0,0,160,24,0,0,216,23,0,0,184,24,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,8,42,0,0,0,0,0,0,216,23,0,0,0,25,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,16,42,0,0,0,0,0,0,216,23,0,0,72,25,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,24,42,0,0,0,0,0,0,216,23,0,0,144,25,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,32,42,0,0,0,0,0,0,0,0,0,0,216,25,0,0,16,39,0,0,0,0,0,0,0,0,0,0,8,26,0,0,16,39,0,0,0,0,0,0,216,23,0,0,56,26,0,0,0,0,0,0,1,0,0,0,56,41,0,0,0,0,0,0,216,23,0,0,80,26,0,0,0,0,0,0,1,0,0,0,56,41,0,0,0,0,0,0,216,23,0,0,104,26,0,0,0,0,0,0,1,0,0,0,64,41,0,0,0,0,0,0,216,23,0,0,128,26,0,0,0,0,0,0,1,0,0,0,64,41,0,0,0,0,0,0,216,23,0,0,152,26,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,184,42,0,0,0,8,0,0,216,23,0,0,224,26,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,184,42,0,0,0,8,0,0,216,23,0,0,40,27,0,0,0,0,0,0,3,0,0,0,72,40,0,0,2,0,0,0,24,37,0,0,2,0,0,0,168,40,0,0,0,8,0,0,216,23,0,0,112,27,0,0,0,0,0,0,3,0,0,0,72,40,0,0,2,0,0,0,24,37,0,0,2,0,0,0,176,40,0,0,0,8,0,0,0,0,0,0,184,27,0,0,72,40,0,0,0,0,0,0,0,0,0,0,208,27,0,0,72,40,0,0,0,0,0,0,216,23,0,0,232,27,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,72,41,0,0,2,0,0,0,216,23,0,0,0,28,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,72,41,0,0,2,0,0,0,0,0,0,0,24,28,0,0,0,0,0,0,48,28,0,0,192,41,0,0,0,0,0,0,216,23,0,0,80,28,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,192,37,0,0,0,0,0,0,216,23,0,0,152,28,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,216,37,0,0,0,0,0,0,216,23,0,0,224,28,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,240,37,0,0,0,0,0,0,216,23,0,0,40,29,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,8,38,0,0,0,0,0,0,0,0,0,0,112,29,0,0,72,40,0,0,0,0,0,0,0,0,0,0,136,29,0,0,72,40,0,0,0,0,0,0,216,23,0,0,160,29,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,208,41,0,0,2,0,0,0,216,23,0,0,200,29,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,208,41,0,0,2,0,0,0].concat([216,23,0,0,240,29,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,208,41,0,0,2,0,0,0,216,23,0,0,24,30,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,208,41,0,0,2,0,0,0,0,0,0,0,64,30,0,0,48,41,0,0,0,0,0,0,0,0,0,0,88,30,0,0,72,40,0,0,0,0,0,0,216,23,0,0,112,30,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,176,42,0,0,2,0,0,0,216,23,0,0,136,30,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,176,42,0,0,2,0,0,0,0,0,0,0,160,30,0,0,0,0,0,0,200,30,0,0,0,0,0,0,240,30,0,0,104,41,0,0,0,0,0,0,0,0,0,0,56,31,0,0,216,41,0,0,0,0,0,0,0,0,0,0,88,31,0,0,40,40,0,0,0,0,0,0,0,0,0,0,128,31,0,0,40,40,0,0,0,0,0,0,0,0,0,0,168,31,0,0,16,41,0,0,0,0,0,0,0,0,0,0,240,31,0,0,0,0,0,0,40,32,0,0,0,0,0,0,96,32,0,0,0,0,0,0,128,32,0,0,152,41,0,0,0,0,0,0,0,0,0,0,176,32,0,0,0,0,0,0,208,32,0,0,0,0,0,0,240,32,0,0,0,0,0,0,16,33,0,0,216,23,0,0,40,33,0,0,0,0,0,0,1,0,0,0,160,37,0,0,3,244,255,255,216,23,0,0,88,33,0,0,0,0,0,0,1,0,0,0,176,37,0,0,3,244,255,255,216,23,0,0,136,33,0,0,0,0,0,0,1,0,0,0,160,37,0,0,3,244,255,255,216,23,0,0,184,33,0,0,0,0,0,0,1,0,0,0,176,37,0,0,3,244,255,255,0,0,0,0,232,33,0,0,16,41,0,0,0,0,0,0,0,0,0,0,24,34,0,0,232,36,0,0,0,0,0,0,0,0,0,0,48,34,0,0,0,0,0,0,72,34,0,0,24,41,0,0,0,0,0,0,0,0,0,0,96,34,0,0,8,41,0,0,0,0,0,0,0,0,0,0,128,34,0,0,16,41,0,0,0,0,0,0,0,0,0,0,160,34,0,0,0,0,0,0,192,34,0,0,0,0,0,0,224,34,0,0,0,0,0,0,0,35,0,0,216,23,0,0,32,35,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,168,42,0,0,2,0,0,0,216,23,0,0,64,35,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,168,42,0,0,2,0,0,0,216,23,0,0,96,35,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,168,42,0,0,2,0,0,0,216,23,0,0,128,35,0,0,0,0,0,0,2,0,0,0,72,40,0,0,2,0,0,0,168,42,0,0,2,0,0,0,0,0,0,0,160,35,0,0,0,0,0,0,184,35,0,0,0,0,0,0,208,35,0,0,0,0,0,0,232,35,0,0,8,41,0,0,0,0,0,0,0,0,0,0,0,36,0,0,16,41,0,0,0,0,0,0,0,0,0,0,24,36,0,0,0,43,0,0,0,0,0,0,0,0,0,0,64,36,0,0,0,43,0,0,0,0,0,0,0,0,0,0,104,36,0,0,16,43,0,0,0,0,0,0,0,0,0,0,144,36,0,0,184,36,0,0,0,0,0,0,56,0,0,0,0,0,0,0,104,41,0,0,238,0,0,0,4,1,0,0,200,255,255,255,200,255,255,255,104,41,0,0,118,0,0,0,218,0,0,0,108,0,0,0,0,0,0,0,152,41,0,0,116,0,0,0,222,0,0,0,148,255,255,255,148,255,255,255,152,41,0,0,150,0,0,0,60,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: getMimetype(name) });
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
      }};var CL={address_space:{GENERAL:0,GLOBAL:1,LOCAL:2,CONSTANT:4,PRIVATE:8},data_type:{FLOAT:16,INT:32,UINT:64},ctx:[],webcl_mozilla:0,webcl_webkit:0,ctx_clean:0,cmdQueue:[],cmdQueue_clean:0,programs:[],programs_clean:0,kernels:[],kernels_name:[],kernels_sig:{},kernels_clean:0,buffers:[],buffers_clean:0,platforms:[],devices:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",isFloat:function (ptr,size) {
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
        var kernel_struct = {};
        kernelstring = kernelstring.replace(/\n/g, " ");
        kernelstring = kernelstring.replace(/\r/g, " ");
        kernelstring = kernelstring.replace(/\t/g, " ");
        // Search kernel function __kernel 
        var kernel_start = kernelstring.indexOf("__kernel");
        while (kernel_start >= 0) {
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
          kernelsubstring = kernelstring.substr(brace_start + 1,brace_end - brace_start - 1);
          kernelsubstring = kernelsubstring.replace(/\ /g, "");
          var kernel_parameter = kernelsubstring.split(",");
          kernelstring = kernelstring.substr(brace_end);
          var parameter = new Array(kernel_parameter.length)
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
            parameter[i] = value;
          }
          kernel_struct[kernels_name] = parameter;
          kernel_start = kernelstring.indexOf("__kernel");
        }
        for (var name in kernel_struct) {
          console.info("Kernel NAME : " + name);      
          console.info("Kernel PARAMETER NUM : "+kernel_struct[name].length);
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
          res = CL.platforms[platform].getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL);
        } else {
          //res = CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_ALL);
          res = res.concat(CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_GPU));
          res = res.concat(CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_CPU));  
        }    
        console.info("CL.getAllDevices: : "+res.length);
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
            console.error(CL.errorMessage);
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
        var alldev = CL.getAllDevices(plat);
        var mapcount = 0;
        for (var i = 0 ; i < alldev.length; i++ ) {
          var type = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(WebCL.CL_DEVICE_TYPE) : alldev[i].getInfo(WebCL.DEVICE_TYPE);
          if (type == device_type_i64_1 || device_type_i64_1 == -1) {
             mapcount ++;
          }        
        }
        if (CL.webcl_mozilla == 1) {
          if (mapcount >= 1) {        
            CL.ctx.push(WebCL.createContextFromType(prop, device_type_i64_1));
          } else {
            // Use default platform
            CL.ctx.push(WebCL.createContextFromType(prop, WebCL.CL_DEVICE_TYPE_DEFAULT));
          }
        } else {
          if (mapcount >= 1) {
            var contextProperties = {platform: null, devices: null, deviceType: device_type_i64_1, shareGroup: 0, hint: null};
            CL.ctx.push(WebCL.createContext(contextProperties));
          } else {
            CL.ctx.push(WebCL.createContext());
          }
        }
        // Return the pos of the context +1
        return CL.ctx.length;
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContextFromType",e);
        return 0; // Null pointer    
      }
    }
  function ___gxx_personality_v0() {
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
            res = (CL.webcl_mozilla == 1) ? CL.ctx[ctx].getContextInfo(WebCL.CL_CONTEXT_DEVICES) : CL.ctx[ctx].getInfo(WebCL.CONTEXT_DEVICES) ;
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
            res = (CL.webcl_mozilla == 1) ? CL.ctx[ctx].getContextInfo(WebCL.CL_CONTEXT_PROPERTIES) : CL.ctx[ctx].getInfo(WebCL.CONTEXT_PROPERTIES) ;
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
      console.info("clReleaseProgram: Release program : "+prog);
      return 0;/*CL_SUCCESS*/
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
          case (((1 << 2)|(1 << 5))) /* CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR */:
            if (host_ptr == 0) {
              console.error("clCreateBuffer: CL_MEM_COPY_HOST_PTR can't be use with null host_ptr parameter");
              HEAP32[((errcode_ret)>>2)]=-37 /* CL_INVALID_HOST_PTR */;
              return 0;     
            }
            var vector;
            var isFloat = 0;
            var isUint = 0;
            var isInt = 0;
            var buff = CL.buffers.length;
            if (CL.kernels_name.length > 0) {
              // \warning experimental stuff
              console.info("/!\\ clCreateBuffer: Need to find how detect the array type");
              var name = CL.kernels_name[0];
              console.info("/!\\ clCreateBuffer: use '"+name+"' kernel name ...");
              var sig = CL.kernels_sig[name];
              var type = sig[buff];
              if (type & CL.data_type.FLOAT) {
                isFloat = 1;
              } 
              if (type & CL.data_type.UINT) {
                isUint = 1;
              } 
              if (type & CL.data_type.INT) {
                isInt = 1;
              }
            }
            if (CL.webcl_webkit == -1) {
              vector = new ArrayBuffer(size / 4);
            } else {
              if ( isFloat == 0 && isUint == 0 && isInt == 0 ) {
                isFloat = CL.isFloat(host_ptr,size); 
                if (isFloat) {
                  vector = new Float32Array(size / 4);
                } else {
                  vector = new Int32Array(size / 4);
                }
              } else {        
                if (isFloat) {
                  vector = new Float32Array(size / 4);
                } else if (isUint) {
                  vector = new Uint32Array(size / 4);
                } else if (isInt) {
                  vector = new Int32Array(size / 4);
                } else {
                  console.error("clCreateBuffer: Unknow ouptut type : "+sig[buff]);
                }
              }
            }
            if (isFloat) {
              console.info("/!\\ clCreateBuffer: use FLOAT output type ...");
            } else if (isUint) {
              console.info("/!\\ clCreateBuffer: use UINT output type ...");
            } else if (isInt) {
              console.info("/!\\ clCreateBuffer: use INT output type ...");
            } 
            for (var i = 0; i < (size / 4); i++) {
              if (isFloat) {
                vector[i] = HEAPF32[(((host_ptr)+(i*4))>>2)];
              } else {
                vector[i] = HEAP32[(((host_ptr)+(i*4))>>2)];
              }
            }
            console.info(vector);
            if (CL.webcl_webkit == -1) {
                CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.MEM_READ_ONLY | WebCL.MEM_COPY_HOST_PTR, size, vector));
            } else {
              if (CL.webcl_webkit == 1) {
                CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.MEM_READ_ONLY,size));
              } else{
                CL.buffers.push(CL.ctx[ctx].createBuffer(WebCL.CL_MEM_READ_ONLY,size));              
              }
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
              CL.cmdQueue[CL.cmdQueue.length-1].enqueueWriteBuffer(CL.buffers[CL.buffers.length-1], 1, 0, size, vector , []);    
            }
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
        console.error("clReleaseMemObject: Invalid Memory Object : "+buff);
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      CL.buffers.splice(buff, 1);
      if (CL.buffers.length == 0) {
        CL.buffers_clean = 0;
      } else {
        CL.buffers_clean++;
      }
      console.info("clReleaseMemObject: Release Memory Object : "+buff);
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
      console.info("clReleaseCommandQueue: Release command queue : "+queue);
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
      console.info("clReleaseKernel: Release kernel : "+ker);
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
      console.info("clReleaseContext: Release context : "+ctx);
      return 0;/*CL_SUCCESS*/
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
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
        console.info("Kernel '"+name+"', has "+CL.kernels_sig[name]+" parameters !!!!");
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
        var name = CL.kernels_name[ker];
        // \todo problem what is arg_value is buffer or just value ??? hard to say ....
        // \todo i suppose the arg_index correspond with the order of the buffer creation if is 
        // not inside the buffers array size we take the value
        if (CL.kernels_sig[name].length <= 0 && arg_index > CL.kernels_sig[name].length) {
          console.error("clSetKernelArg: Invalid signature : "+CL.kernels_sig[name].length);
          return -1; /* CL_FAILED */
        }
        var sig = CL.kernels_sig[name];
        var type = sig[arg_index];
        // \todo this syntax give a very bad crash ... why ??? (type & CL.data_type.FLOAT) ? 1 : 0;
        var isFloat = 0;
        var isLocal = 0;    
        if (type&CL.data_type.FLOAT) {
          isFloat = 1;
        } 
        if (type&CL.address_space.LOCAL) {
          isLocal = 1;
        }
        var value;
        if (isLocal) {
          console.info("clSetKernelArg 'local': "+arg_index+" - size : "+arg_size);
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
        var vector;
        var isFloat = 0;
        var isUint = 0;
        var isInt = 0;
        if (CL.kernels_name.length > 0) {
          // \warning experimental stuff
          console.info("/!\\ clEnqueueReadBuffer: Need to find how detect the array type");
          var name = CL.kernels_name[0];
          console.info("/!\\ clEnqueueReadBuffer: use '"+name+"' kernel name ...");
          var sig = CL.kernels_sig[name];
          var type = sig[buff];
          if (type & CL.data_type.FLOAT) {
            isFloat = 1;
          } 
          if (type & CL.data_type.UINT) {
            isUint = 1;
          } 
          if (type & CL.data_type.INT) {
            isInt = 1;
          }
        }
        if (isFloat) {
          vector = new Float32Array(size / 4);
          console.info("/!\\ clEnqueueReadBuffer: use FLOAT output type ...");
        } else if (isUint) {
          vector = new Uint32Array(size / 4);
          console.info("/!\\ clEnqueueReadBuffer: use UINT output type ...");
        } else if (isInt) {
          vector = new Int32Array(size / 4);
          console.info("/!\\ clEnqueueReadBuffer: use INT output type ...");
        } else {
          console.error("clEnqueueReadBuffer: Unknow ouptut type : "+sig[buff]);
        }
        console.info("clEnqueueReadBuffer - Pos : "+buff);
        CL.cmdQueue[queue].enqueueReadBuffer (CL.buffers[buff], blocking_read == 1 ? true : false, offset, size, vector, []);
        for (var i = 0; i < (size / 4); i++) {
          if (isFloat) {
            HEAPF32[(((results)+(i*4))>>2)]=vector[i];  
          } else {
            HEAP32[(((results)+(i*4))>>2)]=vector[i];  
          }         
        }
        console.info(vector);
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
        stdin.isTerminal = !stdinOverridden;
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        stdout.isTerminal = !stdoutOverridden;
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        stderr.isTerminal = !stderrOverridden;
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
          if (!FS.streams[filedes].object.isTerminal) { // don't flush terminals, it would cause a \n to also appear
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
        if ((isWrite || isTruncate) && target.isFolder) {
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
  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }
  function ___cxa_guard_release() {}
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
  function ___cxa_guard_abort() {}
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
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC)
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(varargs + argIndex)>>2];
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env._stdout|0;var t=env.___fsmu8|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.min;var am=env.invoke_viiiii;var an=env.invoke_viiiiiii;var ao=env.invoke_vi;var ap=env.invoke_vii;var aq=env.invoke_iii;var ar=env.invoke_iiiiii;var as=env.invoke_ii;var at=env.invoke_iiii;var au=env.invoke_viiiiif;var av=env.invoke_viii;var aw=env.invoke_viiiiiiii;var ax=env.invoke_v;var ay=env.invoke_iiiiiiiii;var az=env.invoke_viiiiiiiii;var aA=env.invoke_viiiiiif;var aB=env.invoke_viiiiii;var aC=env.invoke_iiiii;var aD=env.invoke_viiii;var aE=env._llvm_lifetime_end;var aF=env._lseek;var aG=env.__scanString;var aH=env._fclose;var aI=env._pthread_mutex_lock;var aJ=env.___cxa_end_catch;var aK=env.__isFloat;var aL=env._strtoull;var aM=env._fflush;var aN=env._clGetPlatformIDs;var aO=env._fwrite;var aP=env._send;var aQ=env._isspace;var aR=env._clReleaseCommandQueue;var aS=env._read;var aT=env._clGetContextInfo;var aU=env._strstr;var aV=env._fsync;var aW=env.___cxa_guard_abort;var aX=env._newlocale;var aY=env.___gxx_personality_v0;var aZ=env._pthread_cond_wait;var a_=env.___cxa_rethrow;var a$=env.___resumeException;var a0=env._llvm_va_end;var a1=env._vsscanf;var a2=env._snprintf;var a3=env._fgetc;var a4=env._clReleaseMemObject;var a5=env._clReleaseContext;var a6=env._atexit;var a7=env.___cxa_free_exception;var a8=env._close;var a9=env.__Z8catcloseP8_nl_catd;var ba=env._llvm_lifetime_start;var bb=env.___setErrNo;var bc=env._clCreateContextFromType;var bd=env._isxdigit;var be=env._ftell;var bf=env._exit;var bg=env._sprintf;var bh=env.___ctype_b_loc;var bi=env._freelocale;var bj=env.__Z7catopenPKci;var bk=env._asprintf;var bl=env.___cxa_is_number_type;var bm=env.___cxa_does_inherit;var bn=env.___cxa_guard_acquire;var bo=env.___locale_mb_cur_max;var bp=env.___cxa_begin_catch;var bq=env._recv;var br=env.__parseInt64;var bs=env.__ZSt18uncaught_exceptionv;var bt=env.___cxa_call_unexpected;var bu=env.__exit;var bv=env._strftime;var bw=env.___cxa_throw;var bx=env._clReleaseKernel;var by=env._llvm_eh_exception;var bz=env._pread;var bA=env._fopen;var bB=env._open;var bC=env._clEnqueueNDRangeKernel;var bD=env._clReleaseProgram;var bE=env.___cxa_find_matching_catch;var bF=env._clSetKernelArg;var bG=env.__formatString;var bH=env._pthread_cond_broadcast;var bI=env._clEnqueueReadBuffer;var bJ=env.__ZSt9terminatev;var bK=env._pthread_mutex_unlock;var bL=env._sbrk;var bM=env.___errno_location;var bN=env._strerror;var bO=env._clCreateBuffer;var bP=env._clGetProgramBuildInfo;var bQ=env.___cxa_guard_release;var bR=env._ungetc;var bS=env._vsprintf;var bT=env._uselocale;var bU=env._vsnprintf;var bV=env._sscanf;var bW=env._sysconf;var bX=env._fread;var bY=env._abort;var bZ=env._isdigit;var b_=env._strtoll;var b$=env.__reallyNegative;var b0=env._clCreateCommandQueue;var b1=env._clBuildProgram;var b2=env.__Z7catgetsP8_nl_catdiiPKc;var b3=env._fseek;var b4=env._write;var b5=env.___cxa_allocate_exception;var b6=env.___cxa_pure_virtual;var b7=env._clCreateKernel;var b8=env._vasprintf;var b9=env._clCreateProgramWithSource;var ca=env.___ctype_toupper_loc;var cb=env.___ctype_tolower_loc;var cc=env._pwrite;var cd=env._strerror_r;var ce=env._time;
// EMSCRIPTEN_START_FUNCS
function cx(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cy(){return i|0}function cz(a){a=a|0;i=a}function cA(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function cB(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function cC(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function cD(a){a=a|0;K=a}function cE(a){a=a|0;L=a}function cF(a){a=a|0;M=a}function cG(a){a=a|0;N=a}function cH(a){a=a|0;O=a}function cI(a){a=a|0;P=a}function cJ(a){a=a|0;Q=a}function cK(a){a=a|0;R=a}function cL(a){a=a|0;S=a}function cM(a){a=a|0;T=a}function cN(){c[q+8>>2]=272;c[q+12>>2]=142;c[q+16>>2]=72;c[q+20>>2]=164;c[q+24>>2]=8;c[q+28>>2]=8;c[q+32>>2]=2;c[q+36>>2]=4;c[p+8>>2]=272;c[p+12>>2]=266;c[p+16>>2]=72;c[p+20>>2]=164;c[p+24>>2]=8;c[p+28>>2]=30;c[p+32>>2]=4;c[p+36>>2]=10;c[2350]=p+8;c[2352]=p+8;c[2354]=q+8;c[2358]=q+8;c[2362]=q+8;c[2366]=q+8;c[2370]=q+8;c[2374]=p+8;c[2408]=q+8;c[2412]=q+8;c[2476]=q+8;c[2480]=q+8;c[2500]=p+8;c[2502]=q+8;c[2538]=q+8;c[2542]=q+8;c[2578]=q+8;c[2582]=q+8;c[2602]=p+8;c[2604]=p+8;c[2606]=q+8;c[2610]=q+8;c[2614]=q+8;c[2618]=q+8;c[2622]=q+8;c[2626]=p+8;c[2628]=p+8;c[2630]=p+8;c[2632]=q+8;c[2636]=p+8;c[2638]=p+8;c[2640]=p+8;c[2642]=p+8;c[2668]=q+8;c[2672]=q+8;c[2676]=p+8;c[2678]=q+8;c[2682]=q+8;c[2686]=q+8;c[2690]=p+8;c[2692]=p+8;c[2694]=p+8;c[2696]=p+8;c[2730]=p+8;c[2732]=p+8;c[2734]=p+8;c[2736]=q+8;c[2740]=q+8;c[2744]=q+8;c[2748]=q+8;c[2752]=q+8;c[2756]=q+8}function cO(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+8|0;e=d|0;c[e>>2]=-1;if((aT(a|0,4225,0,0,e|0)|0)!=0){cQ(14840,544)|0;f=0;i=d;return f|0}g=c[e>>2]|0;if((g|0)==0){cQ(14840,344)|0;f=0;i=d;return f|0}e=ll(g&-4)|0;h=e;if((aT(a|0,4225,g|0,e|0,0)|0)!=0){if((e|0)!=0){lp(e)}cQ(14840,224)|0;f=0;i=d;return f|0}g=b0(a|0,c[h>>2]|0,0,0,0)|0;if((g|0)==0){lp(e);cQ(14840,2632)|0;f=0;i=d;return f|0}else{c[b>>2]=c[h>>2];lp(e);f=g;i=d;return f|0}return 0}function cP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;b=i;i=i+96|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;h=b+32|0;j=b+40|0;k=b+48|0;l=b+64|0;m=b+80|0;n=aN(1,j|0,h|0)|0;c[g>>2]=n;if((n|0)!=0|(c[h>>2]|0)==0){h=cQ(14840,2688)|0;eR(f,h+(c[(c[h>>2]|0)-12>>2]|0)|0);n=jl(f,14568)|0;o=cj[c[(c[n>>2]|0)+28>>2]&63](n,10)|0;jc(f);fW(h,o)|0;fs(h)|0;p=0;i=b;return p|0}h=k|0;c[h>>2]=4228;c[k+4>>2]=c[j>>2];c[k+8>>2]=0;k=(a|0)!=0;a=bc(h|0,(k?4:2)|0,(k?0:0)|0,0,0,g|0)|0;do{if((c[g>>2]|0)==0){q=a}else{ej(l,(k?2680:1728)|0,3);ej(m,(k?1728:2680)|0,3);j=cQ(cR(cQ(cR(cQ(14664,1432)|0,l)|0,1080)|0,m)|0,1072)|0;eR(e,j+(c[(c[j>>2]|0)-12>>2]|0)|0);o=jl(e,14568)|0;f=cj[c[(c[o>>2]|0)+28>>2]&63](o,10)|0;jc(e);fW(j,f)|0;fs(j)|0;j=bc(h|0,(k?2:4)|0,(k?0:0)|0,0,0,g|0)|0;if((c[g>>2]|0)==0){r=0}else{f=cQ(14840,880)|0;eR(d,f+(c[(c[f>>2]|0)-12>>2]|0)|0);o=jl(d,14568)|0;n=cj[c[(c[o>>2]|0)+28>>2]&63](o,10)|0;jc(d);fW(f,n)|0;fs(f)|0;r=1}ed(m);ed(l);if((r|0)==1){p=0}else{q=j;break}i=b;return p|0}}while(0);p=q;i=b;return p|0}function cQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;fq(g,b);do{if((a[g|0]&1)!=0){k=lx(d|0)|0;l=b;m=c[(c[l>>2]|0)-12>>2]|0;n=b;c[h>>2]=c[n+(m+24)>>2];o=d+k|0;k=(c[n+(m+4)>>2]&176|0)==32?o:d;p=n+m|0;q=n+(m+76)|0;m=c[q>>2]|0;if((m|0)==-1){eR(f,p);r=jl(f,14568)|0;s=cj[c[(c[r>>2]|0)+28>>2]&63](r,32)|0;jc(f);c[q>>2]=s<<24>>24;t=s}else{t=m&255}dr(j,h,d,k,o,p,t);if((c[j>>2]|0)!=0){break}p=c[(c[l>>2]|0)-12>>2]|0;e9(n+p|0,c[n+(p+16)>>2]|5)}}while(0);fr(g);i=e;return b|0}function cR(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;fq(g,b);do{if((a[g|0]&1)!=0){k=d;l=a[d]|0;m=l&255;if((m&1|0)==0){n=m>>>1}else{n=c[d+4>>2]|0}m=b;o=c[(c[m>>2]|0)-12>>2]|0;p=b;c[h>>2]=c[p+(o+24)>>2];q=(l&1)==0;if(q){r=k+1|0}else{r=c[d+8>>2]|0}do{if((c[p+(o+4)>>2]&176|0)==32){if(q){s=k+1+n|0;t=103;break}else{u=(c[d+8>>2]|0)+n|0;t=102;break}}else{if(q){s=k+1|0;t=103;break}else{u=c[d+8>>2]|0;t=102;break}}}while(0);if((t|0)==102){v=c[d+8>>2]|0;w=u}else if((t|0)==103){v=k+1|0;w=s}q=p+o|0;l=p+(o+76)|0;x=c[l>>2]|0;if((x|0)==-1){eR(f,q);y=jl(f,14568)|0;z=cj[c[(c[y>>2]|0)+28>>2]&63](y,32)|0;jc(f);c[l>>2]=z<<24>>24;A=z}else{A=x&255}dr(j,h,r,w,v+n|0,q,A);if((c[j>>2]|0)!=0){break}q=c[(c[m>>2]|0)-12>>2]|0;e9(p+q|0,c[p+(q+16)>>2]|5)}}while(0);fr(g);i=e;return b|0}function cS(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;f=i;i=i+40|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=k;m=i;i=i+188|0;i=i+7>>3<<3;n=i;i=i+136|0;o=i;i=i+12|0;i=i+7>>3<<3;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+16384|0;r=m;s=m+108|0;t=m|0;u=m;v=m+8|0;w=v|0;x=m;c[t>>2]=11092;y=m+108|0;c[y>>2]=11112;c[m+4>>2]=0;eS(m+108|0,v);c[m+180>>2]=0;c[m+184>>2]=-1;c[t>>2]=5220;c[s>>2]=5240;dq(v);z=m+72|0;do{if((c[z>>2]|0)==0){A=bA(e|0,1480)|0;c[z>>2]=A;if((A|0)==0){B=130;break}c[m+96>>2]=8;B=151}else{B=130}}while(0);do{if((B|0)==130){m=c[(c[x>>2]|0)-12>>2]|0;e9(r+m|0,c[r+(m+16)>>2]|4);if((c[z>>2]|0)!=0){B=151;break}m=cQ(cQ(14840,2416)|0,e)|0;eR(j,m+(c[(c[m>>2]|0)-12>>2]|0)|0);A=jl(j,14568)|0;C=cj[c[(c[A>>2]|0)+28>>2]&63](A,10)|0;jc(j);fW(m,C)|0;fs(m)|0;D=0}}while(0);if((B|0)==151){j=n+56|0;e=n|0;z=n;r=n+4|0;x=r|0;c[e>>2]=11052;m=n+56|0;c[m>>2]=11072;eS(n+56|0,r);c[n+128>>2]=0;c[n+132>>2]=-1;c[e>>2]=4748;c[j>>2]=4768;eX(x);C=r|0;c[C>>2]=4952;A=n+36|0;E=n+48|0;F=n+52|0;lu(n+36|0,0,16);c[F>>2]=16;lu(l|0,0,12);c5(r,k);ed(k);fV(z,w)|0;w=o;k=c[F>>2]|0;do{if((k&16|0)==0){if((k&8|0)==0){lu(w|0,0,12);break}F=c[n+12>>2]|0;r=c[n+20>>2]|0;l=F;G=r-l|0;do{if((G|0)==-1){eh(o);B=187}else{if(G>>>0>=11){B=187;break}a[w]=G<<1&255;H=o+1|0}}while(0);if((B|0)==187){I=G+16&-16;J=lk(I)|0;c[o+8>>2]=J;c[o>>2]=I|1;c[o+4>>2]=G;H=J}if((F|0)==(r|0)){K=H}else{J=r+(-l|0)|0;I=H;L=F;while(1){a[I]=a[L]|0;M=L+1|0;if((M|0)==(r|0)){break}else{I=I+1|0;L=M}}K=H+J|0}a[K]=0}else{L=c[E>>2]|0;I=c[n+28>>2]|0;if(L>>>0<I>>>0){c[E>>2]=I;N=I}else{N=L}L=c[n+24>>2]|0;I=L;r=N-I|0;do{if((r|0)==-1){eh(o);B=175}else{if(r>>>0>=11){B=175;break}a[w]=r<<1&255;O=o+1|0}}while(0);if((B|0)==175){J=r+16&-16;F=lk(J)|0;c[o+8>>2]=F;c[o>>2]=J|1;c[o+4>>2]=r;O=F}if((L|0)==(N|0)){P=O}else{F=N+(-I|0)|0;J=O;l=L;while(1){a[J]=a[l]|0;G=l+1|0;if((G|0)==(N|0)){break}else{J=J+1|0;l=G}}P=O+F|0}a[P]=0}}while(0);if((a[w]&1)==0){Q=o+1|0}else{Q=c[o+8>>2]|0}c[p>>2]=Q;Q=b9(b|0,1,p|0,0,0)|0;do{if((Q|0)==0){p=cQ(14840,2104)|0;eR(h,p+(c[(c[p>>2]|0)-12>>2]|0)|0);b=jl(h,14568)|0;w=cj[c[(c[b>>2]|0)+28>>2]&63](b,10)|0;jc(h);fW(p,w)|0;fs(p)|0;R=0}else{if((b1(Q|0,0,0,0,0,0)|0)==0){R=Q;break}p=q|0;bP(Q|0,d|0,4483,16384,p|0,0)|0;w=cQ(14840,1984)|0;eR(g,w+(c[(c[w>>2]|0)-12>>2]|0)|0);b=jl(g,14568)|0;P=cj[c[(c[b>>2]|0)+28>>2]&63](b,10)|0;jc(g);fW(w,P)|0;fs(w)|0;cQ(14840,p)|0;bD(Q|0)|0;R=0}}while(0);ed(o);c[e>>2]=4748;c[m>>2]=4768;c[C>>2]=4952;ed(A);eW(x);fd(z,6148);eQ(j);D=R}c[t>>2]=5220;c[y>>2]=5240;df(v);fc(u,6164);eQ(s);i=f;return D|0}function cT(a){a=a|0;var b=0;c[a>>2]=4748;c[a+56>>2]=4768;b=a+4|0;c[b>>2]=4952;ed(a+36|0);eW(b|0);fd(a,6148);eQ(a+56|0);return}function cU(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=c[f>>2]|0;if((g|0)!=0){a4(g|0)|0}g=c[f+4>>2]|0;if((g|0)!=0){a4(g|0)|0}g=c[f+8>>2]|0;if((g|0)!=0){a4(g|0)|0}if((b|0)!=0){aR(b|0)|0}if((e|0)!=0){bx(e|0)|0}if((d|0)!=0){bD(d|0)|0}if((a|0)==0){return}a5(a|0)|0;return}function cV(a){a=a|0;c[a>>2]=5220;c[a+108>>2]=5240;df(a+8|0);fc(a,6164);eQ(a+108|0);return}function cW(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+8|0;g=f|0;c[b>>2]=bO(a|0,36,0,4e3,d|0,0)|0;d=b+4|0;c[d>>2]=bO(a|0,36,0,4e3,e|0,0)|0;e=bO(a|0,1,0,4e3,0,0)|0;c[b+8>>2]=e;do{if((c[b>>2]|0)!=0){if((c[d>>2]|0)==0|(e|0)==0){break}else{h=1}i=f;return h|0}}while(0);e=cQ(14840,1888)|0;eR(g,e+(c[(c[e>>2]|0)-12>>2]|0)|0);d=jl(g,14568)|0;b=cj[c[(c[d>>2]|0)+28>>2]&63](d,10)|0;jc(g);fW(e,b)|0;fs(e)|0;h=0;i=f;return h|0}function cX(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;d=i;i=i+12096|0;e=d|0;f=d+8|0;g=d+16|0;h=d+24|0;j=d+32|0;k=d+40|0;l=d+48|0;m=d+56|0;n=d+64|0;o=d+80|0;p=d+4080|0;q=d+8080|0;r=d+12080|0;s=d+12088|0;c[m>>2]=0;t=n;lu(t|0,0,12);if((a|0)<1|(b|0)==0){u=1}else{v=1;w=0;while(1){x=c[b+(w<<2)>>2]|0;do{if((x|0)==0){y=v}else{if((aU(x|0,1864)|0)!=0){y=0;break}y=(aU(x|0,1848)|0)==0?v:1}}while(0);x=w+1|0;if((x|0)<(a|0)){v=y;w=x}else{u=y;break}}}y=cP(u)|0;if((y|0)==0){u=cQ(14840,1800)|0;eR(l,u+(c[(c[u>>2]|0)-12>>2]|0)|0);w=jl(l,14568)|0;v=cj[c[(c[w>>2]|0)+28>>2]&63](w,10)|0;jc(l);fW(u,v)|0;fs(u)|0;z=1;i=d;return z|0}u=cO(y,m)|0;if((u|0)==0){v=c[n+8>>2]|0;if((v|0)!=0){a4(v|0)|0}a5(y|0)|0;z=1;i=d;return z|0}v=cS(y,c[m>>2]|0,1768)|0;if((v|0)==0){cU(y,u,0,0,n|0);z=1;i=d;return z|0}m=b7(v|0,1736,0)|0;if((m|0)==0){l=cQ(14840,1704)|0;eR(k,l+(c[(c[l>>2]|0)-12>>2]|0)|0);w=jl(k,14568)|0;a=cj[c[(c[w>>2]|0)+28>>2]&63](w,10)|0;jc(k);fW(l,a)|0;fs(l)|0;cU(y,u,v,0,n|0);z=1;i=d;return z|0}else{A=0}do{c[p+(A<<2)>>2]=A;c[q+(A<<2)>>2]=A<<1;A=A+1|0;}while((A|0)<1e3);A=n|0;if(!(cW(y,A,p|0,q|0)|0)){cU(y,u,v,m,A);z=1;i=d;return z|0}q=bF(m|0,0,4,t|0)|0;t=bF(m|0,1,4,n+4|0)|0|q;q=n+8|0;if((t|(bF(m|0,2,4,q|0)|0)|0)!=0){t=cQ(14840,1664)|0;eR(j,t+(c[(c[t>>2]|0)-12>>2]|0)|0);n=jl(j,14568)|0;p=cj[c[(c[n>>2]|0)+28>>2]&63](n,10)|0;jc(j);fW(t,p)|0;fs(t)|0;cU(y,u,v,m,A);z=1;i=d;return z|0}t=r|0;c[t>>2]=1e3;r=s|0;c[r>>2]=1;if((bC(u|0,m|0,1,0,t|0,r|0,0,0,0)|0)!=0){r=cQ(14840,1608)|0;eR(h,r+(c[(c[r>>2]|0)-12>>2]|0)|0);t=jl(h,14568)|0;s=cj[c[(c[t>>2]|0)+28>>2]&63](t,10)|0;jc(h);fW(r,s)|0;fs(r)|0;cU(y,u,v,m,A);z=1;i=d;return z|0}if((bI(u|0,c[q>>2]|0,1,0,4e3,o|0,0,0,0)|0)==0){B=0}else{q=cQ(14840,1576)|0;eR(g,q+(c[(c[q>>2]|0)-12>>2]|0)|0);r=jl(g,14568)|0;s=cj[c[(c[r>>2]|0)+28>>2]&63](r,10)|0;jc(g);fW(q,s)|0;fs(q)|0;cU(y,u,v,m,A);z=1;i=d;return z|0}do{cQ(fw(14664,c[o+(B<<2)>>2]|0)|0,1560)|0;B=B+1|0;}while((B|0)<1e3);eR(f,(c[(c[3666]|0)-12>>2]|0)+14664|0);B=jl(f,14568)|0;o=cj[c[(c[B>>2]|0)+28>>2]&63](B,10)|0;jc(f);fW(14664,o)|0;fs(14664)|0;o=cQ(14664,1528)|0;eR(e,o+(c[(c[o>>2]|0)-12>>2]|0)|0);f=jl(e,14568)|0;B=cj[c[(c[f>>2]|0)+28>>2]&63](f,10)|0;jc(e);fW(o,B)|0;fs(o)|0;cU(y,u,v,m,A);z=0;i=d;return z|0}function cY(a){a=a|0;var b=0;c[a>>2]=4748;c[a+56>>2]=4768;b=a+4|0;c[b>>2]=4952;ed(a+36|0);eW(b|0);fd(a,6148);eQ(a+56|0);lo(a);return}function cZ(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=4748;e=b+(d+56)|0;c[e>>2]=4768;f=b+(d+4)|0;c[f>>2]=4952;ed(b+(d+36)|0);eW(f);fd(a,6148);eQ(e);return}function c_(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=4748;e=b+(d+56)|0;c[e>>2]=4768;f=b+(d+4)|0;c[f>>2]=4952;ed(b+(d+36)|0);eW(f);fd(a,6148);eQ(e);lo(a);return}function c$(a){a=a|0;c[a>>2]=4952;ed(a+32|0);eW(a|0);return}function c0(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;i=d+44|0;j=c[i>>2]|0;k=d+24|0;l=c[k>>2]|0;if(j>>>0<l>>>0){c[i>>2]=l;m=l}else{m=j}j=h&24;do{if((j|0)==0){i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else if((j|0)==24){if((g|0)==2){n=450;break}else if((g|0)==0){o=0;p=0;break}else if((g|0)!=1){n=454;break}i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else{if((g|0)==2){n=450;break}else if((g|0)==0){o=0;p=0;break}else if((g|0)!=1){n=454;break}if((h&8|0)==0){i=l-(c[d+20>>2]|0)|0;o=(i|0)<0?-1:0;p=i;break}else{i=(c[d+12>>2]|0)-(c[d+8>>2]|0)|0;o=(i|0)<0?-1:0;p=i;break}}}while(0);if((n|0)==454){g=b;c[g>>2]=0;c[g+4>>2]=0;g=b+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}if((n|0)==450){n=d+32|0;if((a[n]&1)==0){q=n+1|0}else{q=c[d+40>>2]|0}n=m-q|0;o=(n|0)<0?-1:0;p=n}n=lz(p,o,e,f)|0;f=K;e=0;do{if(!((f|0)<(e|0)|(f|0)==(e|0)&n>>>0<0>>>0)){o=d+32|0;if((a[o]&1)==0){r=o+1|0}else{r=c[d+40>>2]|0}o=m-r|0;p=(o|0)<0?-1:0;if((p|0)<(f|0)|(p|0)==(f|0)&o>>>0<n>>>0){break}o=h&8;do{if(!((n|0)==0&(f|0)==0)){do{if((o|0)!=0){if((c[d+12>>2]|0)!=0){break}p=b;c[p>>2]=0;c[p+4>>2]=0;p=b+8|0;c[p>>2]=-1;c[p+4>>2]=-1;return}}while(0);if(!((h&16|0)!=0&(l|0)==0)){break}p=b;c[p>>2]=0;c[p+4>>2]=0;p=b+8|0;c[p>>2]=-1;c[p+4>>2]=-1;return}}while(0);if((o|0)!=0){c[d+12>>2]=(c[d+8>>2]|0)+n;c[d+16>>2]=m}if((h&16|0)!=0){c[k>>2]=(c[d+20>>2]|0)+n}p=b;c[p>>2]=0;c[p+4>>2]=0;p=b+8|0;c[p>>2]=n;c[p+4>>2]=f;return}}while(0);f=b;c[f>>2]=0;c[f+4>>2]=0;f=b+8|0;c[f>>2]=-1;c[f+4>>2]=-1;return}function c1(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0;b=a+44|0;e=c[b>>2]|0;f=c[a+24>>2]|0;if(e>>>0<f>>>0){c[b>>2]=f;g=f}else{g=e}if((c[a+48>>2]&8|0)==0){h=-1;return h|0}e=a+16|0;f=c[e>>2]|0;b=c[a+12>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;i=g}else{i=f}if(b>>>0>=i>>>0){h=-1;return h|0}h=d[b]|0;return h|0}function c2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+44|0;f=c[e>>2]|0;g=c[b+24>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;h=g}else{h=f}f=b+8|0;g=c[f>>2]|0;e=b+12|0;i=c[e>>2]|0;if(g>>>0>=i>>>0){j=-1;return j|0}if((d|0)==-1){c[f>>2]=g;c[e>>2]=i-1;c[b+16>>2]=h;j=0;return j|0}k=i-1|0;do{if((c[b+48>>2]&16|0)==0){if((d<<24>>24|0)==(a[k]|0)){break}else{j=-1}return j|0}}while(0);c[f>>2]=g;c[e>>2]=k;c[b+16>>2]=h;a[k]=d&255;j=d;return j|0}function c3(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d;d=i;i=i+16|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];c[d+8>>2]=c[g+8>>2];c[d+12>>2]=c[g+12>>2];g=d+8|0;cu[c[(c[b>>2]|0)+16>>2]&63](a,b,c[g>>2]|0,c[g+4>>2]|0,0,e);i=f;return}function c4(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;if((d|0)==-1){e=0;return e|0}f=b|0;g=b+12|0;h=b+8|0;i=(c[g>>2]|0)-(c[h>>2]|0)|0;j=b+24|0;k=c[j>>2]|0;l=b+28|0;m=c[l>>2]|0;if((k|0)==(m|0)){n=b+48|0;if((c[n>>2]&16|0)==0){e=-1;return e|0}o=b+20|0;p=c[o>>2]|0;q=b+44|0;r=(c[q>>2]|0)-p|0;s=b+32|0;eo(s,0);t=s;if((a[t]&1)==0){u=10}else{u=(c[s>>2]&-2)-1|0}el(s,u,0);u=a[t]|0;if((u&1)==0){v=s+1|0}else{v=c[b+40>>2]|0}s=u&255;if((s&1|0)==0){w=s>>>1}else{w=c[b+36>>2]|0}s=v+w|0;c[o>>2]=v;c[l>>2]=s;l=v+(k-p)|0;c[j>>2]=l;p=v+r|0;c[q>>2]=p;x=l;y=s;z=p;A=n}else{x=k;y=m;z=c[b+44>>2]|0;A=b+48|0}m=x+1|0;k=m>>>0<z>>>0?z:m;c[b+44>>2]=k;if((c[A>>2]&8|0)!=0){A=b+32|0;if((a[A]&1)==0){B=A+1|0}else{B=c[b+40>>2]|0}c[h>>2]=B;c[g>>2]=B+i;c[b+16>>2]=k}if((x|0)==(y|0)){e=cj[c[(c[b>>2]|0)+52>>2]&63](f,d&255)|0;return e|0}else{c[j>>2]=m;a[x]=d&255;e=d&255;return e|0}return 0}function c5(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=b+32|0;ee(e,d)|0;d=b+44|0;c[d>>2]=0;f=b+48|0;g=c[f>>2]|0;if((g&8|0)!=0){h=e;i=a[e]|0;j=(i&1)==0;if(j){k=h+1|0}else{k=c[b+40>>2]|0}l=i&255;if((l&1|0)==0){m=l>>>1}else{m=c[b+36>>2]|0}l=k+m|0;c[d>>2]=l;if(j){n=h+1|0;o=h+1|0}else{h=c[b+40>>2]|0;n=h;o=h}c[b+8>>2]=o;c[b+12>>2]=n;c[b+16>>2]=l}if((g&16|0)==0){return}g=e;l=e;n=a[l]|0;o=n&255;if((o&1|0)==0){p=o>>>1}else{p=c[b+36>>2]|0}if((n&1)==0){c[d>>2]=g+1+p;q=10}else{c[d>>2]=(c[b+40>>2]|0)+p;q=(c[e>>2]&-2)-1|0}el(e,q,0);q=a[l]|0;if((q&1)==0){r=g+1|0;s=g+1|0}else{g=c[b+40>>2]|0;r=g;s=g}g=q&255;if((g&1|0)==0){t=g>>>1}else{t=c[b+36>>2]|0}g=b+24|0;c[g>>2]=s;c[b+20>>2]=s;c[b+28>>2]=r+t;if((c[f>>2]&3|0)==0){return}c[g>>2]=s+p;return}function c6(a){a=a|0;df(a);return}function c7(a){a=a|0;c[a>>2]=4952;ed(a+32|0);eW(a|0);lo(a);return}function c8(a){a=a|0;c[a>>2]=5220;c[a+108>>2]=5240;df(a+8|0);fc(a,6164);eQ(a+108|0);lo(a);return}function c9(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=5220;e=b+(d+108)|0;c[e>>2]=5240;df(b+(d+8)|0);fc(a,6164);eQ(e);return}function da(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=5220;e=b+(d+108)|0;c[e>>2]=5240;df(b+(d+8)|0);fc(a,6164);eQ(e);lo(a);return}function db(a){a=a|0;df(a);lo(a);return}function dc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;cl[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=jl(d,14264)|0;d=e;c[b+68>>2]=d;f=b+98|0;g=a[f]&1;h=cl[c[(c[e>>2]|0)+28>>2]&255](d)|0;a[f]=h&1;if((g&255|0)==(h&1|0)){return}g=b+96|0;lu(b+8|0,0,24);f=(a[g]&1)!=0;if(h){h=b+32|0;do{if(f){d=c[h>>2]|0;if((d|0)==0){break}lp(d)}}while(0);d=b+97|0;a[g]=a[d]&1;e=b+60|0;c[b+52>>2]=c[e>>2];i=b+56|0;c[h>>2]=c[i>>2];c[e>>2]=0;c[i>>2]=0;a[d]=0;return}do{if(!f){d=b+32|0;i=c[d>>2]|0;if((i|0)==(b+44|0)){break}e=c[b+52>>2]|0;c[b+60>>2]=e;c[b+56>>2]=i;a[b+97|0]=0;c[d>>2]=ll(e)|0;a[g]=1;return}}while(0);g=c[b+52>>2]|0;c[b+60>>2]=g;c[b+56>>2]=ll(g)|0;a[b+97|0]=1;return}function dd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b|0;g=b+96|0;lu(b+8|0,0,24);do{if((a[g]&1)!=0){h=c[b+32>>2]|0;if((h|0)==0){break}lp(h)}}while(0);h=b+97|0;do{if((a[h]&1)!=0){i=c[b+56>>2]|0;if((i|0)==0){break}lp(i)}}while(0);i=b+52|0;c[i>>2]=e;do{if(e>>>0>8){j=a[b+98|0]|0;if((j&1)==0|(d|0)==0){c[b+32>>2]=ll(e)|0;a[g]=1;k=j;break}else{c[b+32>>2]=d;a[g]=0;k=j;break}}else{c[b+32>>2]=b+44;c[i>>2]=8;a[g]=0;k=a[b+98|0]|0}}while(0);if((k&1)!=0){c[b+60>>2]=0;c[b+56>>2]=0;a[h]=0;return f|0}k=(e|0)<8?8:e;c[b+60>>2]=k;if((d|0)!=0&k>>>0>7){c[b+56>>2]=d;a[h]=0;return f|0}else{c[b+56>>2]=ll(k)|0;a[h]=1;return f|0}return 0}function de(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;e=i;f=d;d=i;i=i+16|0;c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];c[d+8>>2]=c[f+8>>2];c[d+12>>2]=c[f+12>>2];f=b+64|0;do{if((c[f>>2]|0)!=0){if((cl[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if((b3(c[f>>2]|0,c[d+8>>2]|0,0)|0)==0){g=d;h=c[g+4>>2]|0;j=b+72|0;c[j>>2]=c[g>>2];c[j+4>>2]=h;h=a;j=d;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];i=e;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;i=e;return}}}while(0);d=a;c[d>>2]=0;c[d+4>>2]=0;d=a+8|0;c[d>>2]=-1;c[d+4>>2]=-1;i=e;return}function df(b){b=b|0;var d=0,e=0;c[b>>2]=5456;d=b+64|0;e=c[d>>2]|0;do{if((e|0)!=0){dh(b)|0;if((aH(e|0)|0)!=0){break}c[d>>2]=0}}while(0);do{if((a[b+96|0]&1)!=0){d=c[b+32>>2]|0;if((d|0)==0){break}lp(d)}}while(0);do{if((a[b+97|0]&1)!=0){d=c[b+56>>2]|0;if((d|0)==0){break}lp(d)}}while(0);eW(b|0);return}function dg(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;g=c[b+68>>2]|0;if((g|0)==0){h=b5(4)|0;kV(h);bw(h|0,9432,148)}h=cl[c[(c[g>>2]|0)+24>>2]&255](g)|0;g=b+64|0;do{if((c[g>>2]|0)!=0){i=(h|0)>0;if(!(i|(d|0)==0&(e|0)==0)){break}if((cl[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if(f>>>0>=3){j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}j=c[g>>2]|0;if(i){i=lJ(h,(h|0)<0?-1:0,d,e)|0;k=i}else{k=0}if((b3(j|0,k|0,f|0)|0)==0){j=be(c[g>>2]|0)|0;i=b+72|0;l=c[i+4>>2]|0;m=a;c[m>>2]=c[i>>2];c[m+4>>2]=l;l=a+8|0;c[l>>2]=j;c[l+4>>2]=(j|0)<0?-1:0;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}}}while(0);b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;return}function dh(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=f;h=b+64|0;if((c[h>>2]|0)==0){j=0;i=d;return j|0}k=b+68|0;l=c[k>>2]|0;if((l|0)==0){m=b5(4)|0;kV(m);bw(m|0,9432,148);return 0}m=b+92|0;n=c[m>>2]|0;do{if((n&16|0)==0){if((n&8|0)==0){break}o=b+80|0;p=c[o+4>>2]|0;c[f>>2]=c[o>>2];c[f+4>>2]=p;do{if((a[b+98|0]&1)==0){p=cl[c[(c[l>>2]|0)+24>>2]&255](l)|0;o=b+36|0;q=c[o>>2]|0;r=(c[b+40>>2]|0)-q|0;if((p|0)>0){s=(ag((c[b+16>>2]|0)-(c[b+12>>2]|0)|0,p)|0)+r|0;t=0;break}p=c[b+12>>2]|0;if((p|0)==(c[b+16>>2]|0)){s=r;t=0;break}u=c[k>>2]|0;v=b+32|0;w=ck[c[(c[u>>2]|0)+32>>2]&31](u,g,c[v>>2]|0,q,p-(c[b+8>>2]|0)|0)|0;s=r-w+(c[o>>2]|0)-(c[v>>2]|0)|0;t=1}else{s=(c[b+16>>2]|0)-(c[b+12>>2]|0)|0;t=0}}while(0);if((b3(c[h>>2]|0,-s|0,1)|0)!=0){j=-1;i=d;return j|0}if(t){v=b+72|0;o=c[f+4>>2]|0;c[v>>2]=c[f>>2];c[v+4>>2]=o}o=c[b+32>>2]|0;c[b+40>>2]=o;c[b+36>>2]=o;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[m>>2]=0}else{do{if((c[b+24>>2]|0)!=(c[b+20>>2]|0)){if((cj[c[(c[b>>2]|0)+52>>2]&63](b,-1)|0)==-1){j=-1}else{break}i=d;return j|0}}while(0);o=b+72|0;v=b+32|0;w=b+52|0;while(1){r=c[k>>2]|0;p=c[v>>2]|0;q=ck[c[(c[r>>2]|0)+20>>2]&31](r,o,p,p+(c[w>>2]|0)|0,e)|0;p=c[v>>2]|0;r=(c[e>>2]|0)-p|0;if((aO(p|0,1,r|0,c[h>>2]|0)|0)!=(r|0)){j=-1;x=708;break}if((q|0)==2){j=-1;x=710;break}else if((q|0)!=1){x=693;break}}if((x|0)==708){i=d;return j|0}else if((x|0)==710){i=d;return j|0}else if((x|0)==693){if((aM(c[h>>2]|0)|0)==0){break}else{j=-1}i=d;return j|0}}}while(0);j=0;i=d;return j|0}function di(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=b+64|0;if((c[h>>2]|0)==0){j=-1;i=e;return j|0}k=b+92|0;if((c[k>>2]&8|0)==0){c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;if((a[b+98|0]&1)==0){l=c[b+56>>2]|0;m=l+(c[b+60>>2]|0)|0;c[b+8>>2]=l;c[b+12>>2]=m;c[b+16>>2]=m;n=m}else{m=c[b+32>>2]|0;l=m+(c[b+52>>2]|0)|0;c[b+8>>2]=m;c[b+12>>2]=l;c[b+16>>2]=l;n=l}c[k>>2]=8;o=1;p=n;q=b+12|0}else{n=b+12|0;o=0;p=c[n>>2]|0;q=n}if((p|0)==0){n=f+1|0;c[b+8>>2]=f;c[q>>2]=n;c[b+16>>2]=n;r=n}else{r=p}p=c[b+16>>2]|0;if(o){s=0}else{o=(p-(c[b+8>>2]|0)|0)/2|0;s=o>>>0>4?4:o}o=b+16|0;do{if((r|0)==(p|0)){n=b+8|0;lw(c[n>>2]|0,r+(-s|0)|0,s|0);if((a[b+98|0]&1)!=0){k=c[n>>2]|0;l=bX(k+s|0,1,(c[o>>2]|0)-s-k|0,c[h>>2]|0)|0;if((l|0)==0){t=-1;u=n;break}k=c[n>>2]|0;m=k+s|0;c[q>>2]=m;c[o>>2]=k+(l+s);t=d[m]|0;u=n;break}m=b+32|0;l=b+36|0;k=c[l>>2]|0;v=b+40|0;lw(c[m>>2]|0,k|0,(c[v>>2]|0)-k|0);k=c[m>>2]|0;w=k+((c[v>>2]|0)-(c[l>>2]|0))|0;c[l>>2]=w;if((k|0)==(b+44|0)){x=8}else{x=c[b+52>>2]|0}y=k+x|0;c[v>>2]=y;k=b+60|0;z=(c[k>>2]|0)-s|0;A=y-w|0;y=b+72|0;B=y;C=b+80|0;D=c[B+4>>2]|0;c[C>>2]=c[B>>2];c[C+4>>2]=D;D=bX(w|0,1,(A>>>0<z>>>0?A:z)|0,c[h>>2]|0)|0;if((D|0)==0){t=-1;u=n;break}z=c[b+68>>2]|0;if((z|0)==0){A=b5(4)|0;kV(A);bw(A|0,9432,148);return 0}A=(c[l>>2]|0)+D|0;c[v>>2]=A;D=c[n>>2]|0;if((cr[c[(c[z>>2]|0)+16>>2]&31](z,y,c[m>>2]|0,A,l,D+s|0,D+(c[k>>2]|0)|0,g)|0)==3){k=c[m>>2]|0;m=c[v>>2]|0;c[n>>2]=k;c[q>>2]=k;c[o>>2]=m;t=d[k]|0;u=n;break}k=c[g>>2]|0;m=c[n>>2]|0;v=m+s|0;if((k|0)==(v|0)){t=-1;u=n;break}c[n>>2]=m;c[q>>2]=v;c[o>>2]=k;t=d[v]|0;u=n}else{t=d[r]|0;u=b+8|0}}while(0);if((c[u>>2]|0)!=(f|0)){j=t;i=e;return j|0}c[u>>2]=0;c[q>>2]=0;c[o>>2]=0;j=t;i=e;return j|0}function dj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((c[b+64>>2]|0)==0){e=-1;return e|0}f=b+12|0;g=c[f>>2]|0;if((c[b+8>>2]|0)>>>0>=g>>>0){e=-1;return e|0}if((d|0)==-1){c[f>>2]=g-1;e=0;return e|0}h=g-1|0;do{if((c[b+88>>2]&16|0)==0){if((d<<24>>24|0)==(a[h]|0)){break}else{e=-1}return e|0}}while(0);c[f>>2]=h;a[h]=d&255;e=d;return e|0}function dk(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;dK(14008,c[o>>2]|0,14064);c[3732]=5412;c[3734]=5432;c[3733]=0;h=c[1350]|0;eS(14928+h|0,14008);c[h+15e3>>2]=0;c[h+15004>>2]=-1;h=c[s>>2]|0;eX(13912);c[3478]=5632;c[3486]=h;jb(g,13916);h=jl(g,14264)|0;j=h;jc(g);c[3487]=j;c[3488]=14072;a[13956]=(cl[c[(c[h>>2]|0)+28>>2]&255](j)|0)&1;c[3666]=5316;c[3667]=5336;j=c[1326]|0;eS(14664+j|0,13912);h=j+72|0;c[14664+h>>2]=0;g=j+76|0;c[14664+g>>2]=-1;k=c[r>>2]|0;eX(13960);c[3490]=5632;c[3498]=k;jb(f,13964);k=jl(f,14264)|0;l=k;jc(f);c[3499]=l;c[3500]=14080;a[14004]=(cl[c[(c[k>>2]|0)+28>>2]&255](l)|0)&1;c[3710]=5316;c[3711]=5336;eS(14840+j|0,13960);c[14840+h>>2]=0;c[14840+g>>2]=-1;l=c[(c[(c[3710]|0)-12>>2]|0)+14864>>2]|0;c[3688]=5316;c[3689]=5336;eS(14752+j|0,l);c[14752+h>>2]=0;c[14752+g>>2]=-1;c[(c[(c[3732]|0)-12>>2]|0)+15e3>>2]=14664;g=(c[(c[3710]|0)-12>>2]|0)+14844|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[3710]|0)-12>>2]|0)+14912>>2]=14664;dx(13856,c[o>>2]|0,14088);c[3644]=5364;c[3646]=5384;c[3645]=0;g=c[1338]|0;eS(14576+g|0,13856);c[g+14648>>2]=0;c[g+14652>>2]=-1;g=c[s>>2]|0;e2(13760);c[3440]=5560;c[3448]=g;jb(e,13764);g=jl(e,14256)|0;h=g;jc(e);c[3449]=h;c[3450]=14096;a[13804]=(cl[c[(c[g>>2]|0)+28>>2]&255](h)|0)&1;c[3574]=5268;c[3575]=5288;h=c[1314]|0;eS(14296+h|0,13760);g=h+72|0;c[14296+g>>2]=0;e=h+76|0;c[14296+e>>2]=-1;l=c[r>>2]|0;e2(13808);c[3452]=5560;c[3460]=l;jb(d,13812);l=jl(d,14256)|0;j=l;jc(d);c[3461]=j;c[3462]=14104;a[13852]=(cl[c[(c[l>>2]|0)+28>>2]&255](j)|0)&1;c[3618]=5268;c[3619]=5288;eS(14472+h|0,13808);c[14472+g>>2]=0;c[14472+e>>2]=-1;j=c[(c[(c[3618]|0)-12>>2]|0)+14496>>2]|0;c[3596]=5268;c[3597]=5288;eS(14384+h|0,j);c[14384+g>>2]=0;c[14384+e>>2]=-1;c[(c[(c[3644]|0)-12>>2]|0)+14648>>2]=14296;e=(c[(c[3618]|0)-12>>2]|0)+14476|0;c[e>>2]=c[e>>2]|8192;c[(c[(c[3618]|0)-12>>2]|0)+14544>>2]=14296;i=b;return}function dl(a){a=a|0;e1(a|0);return}function dm(a){a=a|0;e1(a|0);lo(a);return}function dn(b,d){b=b|0;d=d|0;var e=0;cl[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=jl(d,14256)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cl[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function dp(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+24|0;f=e|0;g=e+8|0;h=e+16|0;j=b+64|0;if((c[j>>2]|0)==0){k=-1;i=e;return k|0}l=b+92|0;if((c[l>>2]&16|0)==0){c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;m=c[b+52>>2]|0;do{if(m>>>0>8){if((a[b+98|0]&1)==0){n=c[b+56>>2]|0;o=n+((c[b+60>>2]|0)-1)|0;c[b+24>>2]=n;c[b+20>>2]=n;c[b+28>>2]=o;p=n;q=o;break}else{o=c[b+32>>2]|0;n=o+(m-1)|0;c[b+24>>2]=o;c[b+20>>2]=o;c[b+28>>2]=n;p=o;q=n;break}}else{c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;p=0;q=0}}while(0);c[l>>2]=16;r=p;s=q;t=b+20|0;u=b+28|0}else{q=b+20|0;p=b+28|0;r=c[q>>2]|0;s=c[p>>2]|0;t=q;u=p}p=(d|0)==-1;q=b+24|0;l=c[q>>2]|0;if(p){v=r;w=l}else{if((l|0)==0){c[q>>2]=f;c[t>>2]=f;c[u>>2]=f+1;x=f}else{x=l}a[x]=d&255;x=(c[q>>2]|0)+1|0;c[q>>2]=x;v=c[t>>2]|0;w=x}x=b+24|0;if((w|0)!=(v|0)){L718:do{if((a[b+98|0]&1)==0){q=b+32|0;l=c[q>>2]|0;c[g>>2]=l;f=b+68|0;m=c[f>>2]|0;if((m|0)==0){y=b5(4)|0;z=y;kV(z);bw(y|0,9432,148);return 0}n=b+72|0;o=b+52|0;A=m;m=v;B=w;C=l;while(1){l=cr[c[(c[A>>2]|0)+12>>2]&31](A,n,m,B,h,C,C+(c[o>>2]|0)|0,g)|0;D=c[t>>2]|0;if((c[h>>2]|0)==(D|0)){k=-1;E=820;break}if((l|0)==3){E=807;break}if(l>>>0>=2){k=-1;E=822;break}F=c[q>>2]|0;G=(c[g>>2]|0)-F|0;if((aO(F|0,1,G|0,c[j>>2]|0)|0)!=(G|0)){k=-1;E=823;break}if((l|0)!=1){break L718}l=c[h>>2]|0;G=c[x>>2]|0;c[t>>2]=l;c[u>>2]=G;F=l+(G-l)|0;c[x>>2]=F;G=c[f>>2]|0;if((G|0)==0){E=817;break}A=G;m=l;B=F;C=c[q>>2]|0}if((E|0)==807){q=(c[x>>2]|0)-D|0;if((aO(D|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}else if((E|0)==817){y=b5(4)|0;z=y;kV(z);bw(y|0,9432,148);return 0}else if((E|0)==820){i=e;return k|0}else if((E|0)==822){i=e;return k|0}else if((E|0)==823){i=e;return k|0}}else{q=w-v|0;if((aO(v|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}}while(0);c[x>>2]=r;c[t>>2]=r;c[u>>2]=s}k=p?0:d;i=e;return k|0}function dq(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+16|0;e=d|0;f=d+8|0;eX(b|0);c[b>>2]=5456;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=0;g=b+68|0;h=b+4|0;lu(b+52|0,0,47);jb(e,h);j=jd(e,14264)|0;jc(e);if(j){jb(f,h);c[g>>2]=jl(f,14264)|0;jc(f);f=c[g>>2]|0;a[b+98|0]=(cl[c[(c[f>>2]|0)+28>>2]&255](f)|0)&1}cm[c[(c[b>>2]|0)+12>>2]&63](b,0,4096)|0;i=d;return}function dr(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((cm[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){ek(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((cm[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){ed(l);break}c[m>>2]=0;c[b>>2]=0;ed(l);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((cm[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function ds(a){a=a|0;fs(14664)|0;fs(14752)|0;fu(14296)|0;fu(14384)|0;return}function dt(a){a=a|0;return}function du(a){a=a|0;var b=0;b=a+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;return}function dv(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=ck[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aO(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=879;break}if((l|0)==2){m=-1;n=880;break}else if((l|0)!=1){n=876;break}}if((n|0)==876){m=((aM(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==879){i=b;return m|0}else if((n|0)==880){i=b;return m|0}return 0}function dw(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+4|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;c[g>>2]=d;c[m>>2]=l;L799:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=cr[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=897;break}if((y|0)==3){B=887;break}if(y>>>0>=2){A=-1;B=899;break}x=(c[h>>2]|0)-t|0;if((aO(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=900;break}if((y|0)!=1){break L799}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y>>2<<2)|0;c[m>>2]=C;v=y;w=C}if((B|0)==887){if((aO(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==899){i=e;return A|0}else if((B|0)==900){i=e;return A|0}else if((B|0)==897){i=e;return A|0}}else{if((aO(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dx(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;e2(b|0);c[b>>2]=5960;c[b+32>>2]=d;c[b+40>>2]=e;jb(g,b+4|0);e=jl(g,14256)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cl[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cl[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){jc(g);i=f;return}ir(128);jc(g);i=f;return}function dy(a){a=a|0;e1(a|0);return}function dz(a){a=a|0;e1(a|0);lo(a);return}function dA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=jl(d,14256)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cl[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cl[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}ir(128);return}function dB(a){a=a|0;return dE(a,0)|0}function dC(a){a=a|0;return dE(a,1)|0}function dD(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}c[h>>2]=d;k=c[b+36>>2]|0;l=f|0;m=cr[c[(c[k>>2]|0)+12>>2]&31](k,c[b+40>>2]|0,h,h+4|0,e+24|0,l,f+8|0,g)|0;if((m|0)==3){a[l]=d&255;c[g>>2]=f+1}else if((m|0)==2|(m|0)==1){j=-1;i=e;return j|0}m=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=l>>>0){j=d;n=927;break}f=b-1|0;c[g>>2]=f;if((bR(a[f]|0,c[m>>2]|0)|0)==-1){j=-1;n=924;break}}if((n|0)==927){i=e;return j|0}else if((n|0)==924){i=e;return j|0}return 0}function dE(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=c[b+44>>2]|0;l=(k|0)>1?k:1;L849:do{if((l|0)>0){k=b+32|0;m=0;while(1){n=a3(c[k>>2]|0)|0;if((n|0)==-1){o=-1;break}a[f+m|0]=n&255;m=m+1|0;if((m|0)>=(l|0)){break L849}}i=e;return o|0}}while(0);L856:do{if((a[b+48|0]&1)==0){m=b+40|0;k=b+36|0;n=f|0;p=g+4|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[k>>2]|0;w=f+r|0;x=cr[c[(c[t>>2]|0)+16>>2]&31](t,s,n,w,h,g,p,j)|0;if((x|0)==2){o=-1;y=946;break}else if((x|0)==3){y=938;break}else if((x|0)!=1){z=r;break L856}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=949;break}v=a3(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=948;break}a[w]=v&255;r=r+1|0}if((y|0)==948){i=e;return o|0}else if((y|0)==949){i=e;return o|0}else if((y|0)==946){i=e;return o|0}else if((y|0)==938){c[g>>2]=a[n]|0;z=r;break}}else{c[g>>2]=a[f|0]|0;z=l}}while(0);L870:do{if(!d){l=b+32|0;y=z;while(1){if((y|0)<=0){break L870}j=y-1|0;if((bR(a[f+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;break}else{y=j}}i=e;return o|0}}while(0);o=c[g>>2]|0;i=e;return o|0}function dF(a){a=a|0;eW(a|0);return}function dG(a){a=a|0;eW(a|0);lo(a);return}function dH(b,d){b=b|0;d=d|0;var e=0;cl[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=jl(d,14264)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cl[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function dI(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=ck[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aO(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=962;break}if((l|0)==2){m=-1;n=961;break}else if((l|0)!=1){n=958;break}}if((n|0)==958){m=((aM(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==962){i=b;return m|0}else if((n|0)==961){i=b;return m|0}return 0}function dJ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+1|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;a[g]=d&255;c[m>>2]=l;L893:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=cr[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=978;break}if((y|0)==3){B=969;break}if(y>>>0>=2){A=-1;B=981;break}x=(c[h>>2]|0)-t|0;if((aO(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=977;break}if((y|0)!=1){break L893}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y)|0;c[m>>2]=C;v=y;w=C}if((B|0)==978){i=e;return A|0}else if((B|0)==981){i=e;return A|0}else if((B|0)==969){if((aO(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==977){i=e;return A|0}}else{if((aO(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;eX(b|0);c[b>>2]=6032;c[b+32>>2]=d;c[b+40>>2]=e;jb(g,b+4|0);e=jl(g,14264)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cl[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cl[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){jc(g);i=f;return}ir(128);jc(g);i=f;return}function dL(a){a=a|0;eW(a|0);return}function dM(a){a=a|0;eW(a|0);lo(a);return}function dN(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=jl(d,14264)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cl[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cl[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}ir(128);return}function dO(a){a=a|0;return dR(a,0)|0}function dP(a){a=a|0;return dR(a,1)|0}function dQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}k=d&255;a[h]=k;l=c[b+36>>2]|0;m=f|0;n=cr[c[(c[l>>2]|0)+12>>2]&31](l,c[b+40>>2]|0,h,h+1|0,e+24|0,m,f+8|0,g)|0;if((n|0)==3){a[m]=k;c[g>>2]=f+1}else if((n|0)==2|(n|0)==1){j=-1;i=e;return j|0}n=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=m>>>0){j=d;o=1006;break}f=b-1|0;c[g>>2]=f;if((bR(a[f]|0,c[n>>2]|0)|0)==-1){j=-1;o=1007;break}}if((o|0)==1006){i=e;return j|0}else if((o|0)==1007){i=e;return j|0}return 0}function dR(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[b+44>>2]|0;m=(l|0)>1?l:1;L943:do{if((m|0)>0){l=b+32|0;n=0;while(1){o=a3(c[l>>2]|0)|0;if((o|0)==-1){p=-1;break}a[g+n|0]=o&255;n=n+1|0;if((n|0)>=(m|0)){break L943}}i=f;return p|0}}while(0);L950:do{if((a[b+48|0]&1)==0){n=b+40|0;l=b+36|0;o=g|0;q=h+1|0;r=b+32|0;s=m;while(1){t=c[n>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[l>>2]|0;x=g+s|0;y=cr[c[(c[u>>2]|0)+16>>2]&31](u,t,o,x,j,h,q,k)|0;if((y|0)==2){p=-1;z=1030;break}else if((y|0)==3){z=1020;break}else if((y|0)!=1){A=s;break L950}y=c[n>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){p=-1;z=1029;break}w=a3(c[r>>2]|0)|0;if((w|0)==-1){p=-1;z=1032;break}a[x]=w&255;s=s+1|0}if((z|0)==1029){i=f;return p|0}else if((z|0)==1030){i=f;return p|0}else if((z|0)==1020){a[h]=a[o]|0;A=s;break}else if((z|0)==1032){i=f;return p|0}}else{a[h]=a[g|0]|0;A=m}}while(0);L964:do{if(!e){m=b+32|0;z=A;while(1){if((z|0)<=0){break L964}k=z-1|0;if((bR(d[g+k|0]|0|0,c[m>>2]|0)|0)==-1){p=-1;break}else{z=k}}i=f;return p|0}}while(0);p=d[h]|0;i=f;return p|0}function dS(){dk(0);a6(156,15016|0,u|0)|0;return}function dT(a){a=a|0;var b=0,d=0;b=a+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){d=0;return d|0}ch[c[(c[a>>2]|0)+8>>2]&511](a);d=1;return d|0}function dU(a){a=a|0;return}function dV(a){a=a|0;return c[a+4>>2]|0}function dW(a){a=a|0;return c[a+4>>2]|0}function dX(a){a=a|0;c[a>>2]=5168;return}function dY(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function dZ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function d_(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=3280;d=a+4|0;if((d|0)==0){return}a=lx(b|0)|0;e=ll(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;ly(a|0,b|0)|0;return}function d$(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3280;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;lo(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;lo(e);return}lp(d);e=a;lo(e);return}function d0(a){a=a|0;var b=0;c[a>>2]=3280;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lp(a);return}function d1(b,d){b=b|0;d=d|0;var e=0,f=0;c[b>>2]=3216;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=lx(f|0)|0;b=ll(d+13|0)|0;c[b+4>>2]=d;c[b>>2]=d;d=b+12|0;c[e>>2]=d;c[b+8>>2]=0;ly(d|0,f|0)|0;return}function d2(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=3216;d=a+4|0;if((d|0)==0){return}a=lx(b|0)|0;e=ll(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;ly(a|0,b|0)|0;return}function d3(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3216;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;lo(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;lo(e);return}lp(d);e=a;lo(e);return}function d4(a){a=a|0;var b=0;c[a>>2]=3216;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lp(a);return}function d5(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=3280;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;lo(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;lo(e);return}lp(d);e=a;lo(e);return}function d6(a){a=a|0;lo(a);return}function d7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;co[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function d8(a,b,c){a=a|0;b=b|0;c=c|0;b=bN(c|0)|0;ej(a,b,lx(b|0)|0);return}function d9(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;if((l|0)==0){m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];lu(h|0,0,12);i=g;return}n=d[h]|0;if((n&1|0)==0){o=n>>>1}else{o=c[f+4>>2]|0}if((o|0)==0){p=l}else{en(f,1568)|0;p=c[k>>2]|0}k=c[e+4>>2]|0;co[c[(c[k>>2]|0)+24>>2]&7](j,k,p);p=a[j]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}k=p&255;if((k&1|0)==0){r=k>>>1}else{r=c[j+4>>2]|0}ep(f,q,r)|0;ed(j);m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];lu(h|0,0,12);i=g;return}function ea(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+32|0;f=b;b=i;i=i+8|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];f=e|0;g=e+16|0;ej(g,d,lx(d|0)|0);d9(f,b,g);d1(a|0,f);ed(f);ed(g);c[a>>2]=5528;g=b;b=a+8|0;a=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=a;i=e;return}function eb(a){a=a|0;d4(a|0);lo(a);return}function ec(a){a=a|0;d4(a|0);return}function ed(b){b=b|0;if((a[b]&1)==0){return}lo(c[b+8>>2]|0);return}function ee(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(d|0)){return b|0}e=a[d]|0;if((e&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}g=e&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}d=b;g=b;e=a[g]|0;if((e&1)==0){i=10;j=e}else{e=c[b>>2]|0;i=(e&-2)-1|0;j=e&255}if(i>>>0<h>>>0){e=j&255;if((e&1|0)==0){k=e>>>1}else{k=c[b+4>>2]|0}eu(b,i,h-i|0,k,0,k,h,f);return b|0}if((j&1)==0){l=d+1|0}else{l=c[b+8>>2]|0}lw(l|0,f|0,h|0);a[l+h|0]=0;if((a[g]&1)==0){a[g]=h<<1&255;return b|0}else{c[b+4>>2]=h;return b|0}return 0}function ef(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=lx(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}eu(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}lw(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function eg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;if((c[a>>2]|0)==1){do{aZ(11128,11120)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;ch[d&511](b);h;c[a>>2]=-1;i;bH(11128)|0;return}function eh(a){a=a|0;a=b5(8)|0;d_(a,416);c[a>>2]=3248;bw(a|0,9464,38)}function ei(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if((f|0)==-1){eh(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=lk(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}lv(g|0,e|0,f)|0;a[g+f|0]=0;return}function ej(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((e|0)==-1){eh(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0;lv(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=lk(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;lv(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function ek(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((d|0)==-1){eh(0)}if(d>>>0<11){a[b]=d<<1&255;f=b+1|0;lu(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}else{h=d+16&-16;i=lk(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=d;f=i;lu(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}}function el(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){h=d-i|0;em(b,h,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1&255;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function em(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){ev(b,h,d-h+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}lu(l+j|0,e|0,d|0);e=j+d|0;if((a[f]&1)==0){a[f]=e<<1&255}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function en(a,b){a=a|0;b=b|0;return ep(a,b,lx(b|0)|0)|0}function eo(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){ev(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}a[k+i|0]=d;d=i+1|0;a[k+d|0]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function ep(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){eu(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}i=k+j|0;lv(i|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function eq(b){b=b|0;if((a[b]&1)==0){return}lo(c[b+8>>2]|0);return}function er(a,b){a=a|0;b=b|0;return es(a,b,kR(b)|0)|0}function es(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}e7(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}kT(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function et(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((d|0)==-1){eh(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{if(g>>>0>h>>>0){p=lk(k)|0}else{p=lk(k)|0}h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;lv(l|0,m|0,h)|0;if(n){lo(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function eu(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){eh(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=lk(o)|0;if((g|0)!=0){lv(e|0,k|0,g)|0}if((i|0)!=0){n=e+g|0;lv(n|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g)|0;l=k+(h+g)|0;lv(n|0,l|0,f)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}lo(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function ev(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){eh(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=lk(n)|0;if((g|0)!=0){lv(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g)|0;i=j+(h+g)|0;lv(m|0,i|0,f)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}lo(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function ew(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741822){eh(0)}if(e>>>0<2){a[b]=e<<1&255;f=b+4|0;g=kS(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=lk(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=kS(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function ex(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741822){eh(0)}if(d>>>0<2){a[b]=d<<1&255;f=b+4|0;g=kU(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=lk(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=kU(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function ey(a,b){a=a|0;b=b|0;return}function ez(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function eA(a){a=a|0;return 0}function eB(a){a=a|0;return 0}function eC(a){a=a|0;return-1|0}function eD(a,b){a=a|0;b=b|0;return-1|0}function eE(a,b){a=a|0;b=b|0;return-1|0}function eF(a,b){a=a|0;b=b|0;return}function eG(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function eH(a){a=a|0;return 0}function eI(a){a=a|0;return 0}function eJ(a){a=a|0;return-1|0}function eK(a,b){a=a|0;b=b|0;return-1|0}function eL(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function eM(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function eN(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function eO(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function eP(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){e8(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}c[k+(i<<2)>>2]=d;d=i+1|0;c[k+(d<<2)>>2]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function eQ(a){a=a|0;fa(a|0);return}function eR(a,b){a=a|0;b=b|0;jb(a,b+28|0);return}function eS(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;lu(a+32|0,0,40);if((b|0)==0){return}jk(b);return}function eT(a){a=a|0;fa(a|0);return}function eU(a){a=a|0;c[a>>2]=5096;jc(a+4|0);lo(a);return}function eV(a){a=a|0;c[a>>2]=5096;jc(a+4|0);return}function eW(a){a=a|0;c[a>>2]=5096;jc(a+4|0);return}function eX(a){a=a|0;c[a>>2]=5096;jk(a+4|0);lu(a+8|0,0,24);return}function eY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=cl[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((k|0)==-1){g=d;m=1459;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=1461;break}}if((m|0)==1461){return g|0}else if((m|0)==1459){return g|0}return 0}function eZ(a){a=a|0;var b=0,e=0;if((cl[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function e_(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((cj[c[(c[g>>2]|0)+52>>2]&63](b,d[l]|0)|0)==-1){h=k;n=1474;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=1475;break}}if((n|0)==1474){return h|0}else if((n|0)==1475){return h|0}return 0}function e$(a){a=a|0;c[a>>2]=5024;jc(a+4|0);lo(a);return}function e0(a){a=a|0;c[a>>2]=5024;jc(a+4|0);return}function e1(a){a=a|0;c[a>>2]=5024;jc(a+4|0);return}function e2(a){a=a|0;c[a>>2]=5024;jk(a+4|0);lu(a+8|0,0,24);return}function e3(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=cl[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((j|0)==-1){f=b;l=1488;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=1490;break}}if((l|0)==1488){return f|0}else if((l|0)==1490){return f|0}return 0}function e4(a){a=a|0;var b=0,d=0;if((cl[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function e5(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((cj[c[(c[e>>2]|0)+52>>2]&63](a,c[j>>2]|0)|0)==-1){f=i;l=1504;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=1505;break}}if((l|0)==1505){return f|0}else if((l|0)==1504){return f|0}return 0}function e6(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(d>>>0>1073741822){eh(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;if(f>>>0>g>>>0){o=lk(d)|0}else{o=lk(d)|0}d=h&1;if(d<<24>>24==0){p=b+4|0}else{p=c[b+8>>2]|0}k=o;l=p;m=d<<24>>24!=0;n=1}d=h&255;if((d&1|0)==0){q=d>>>1}else{q=c[b+4>>2]|0}kS(k,l,q+1|0)|0;if(m){lo(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=k;return}else{a[e]=i<<1&255;return}}function e7(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741821-d|0)>>>0<e>>>0){eh(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=lk(o<<2)|0;if((g|0)!=0){kS(e,k,g)|0}if((i|0)!=0){n=e+(g<<2)|0;kS(n,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g<<2)|0;l=k+(h+g<<2)|0;kS(n,l,f)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}lo(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function e8(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741821-d|0)>>>0<e>>>0){eh(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=lk(n<<2)|0;if((g|0)!=0){kS(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g<<2)|0;i=j+(h+g<<2)|0;kS(m,i,f)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}lo(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function e9(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=b5(16)|0;do{if((a[15136]|0)==0){if((bn(15136)|0)==0){break}dX(13216);c[3304]=4792;a6(78,13216,u|0)|0}}while(0);b=lB(13216,0,32)|0;d=K;c[f>>2]=b&0|1;c[f+4>>2]=d|0;ea(e,f,1648);c[e>>2]=3928;bw(e|0,10008,30)}function fa(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=3904;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;if((b|0)!=0){f=b;do{f=f-1|0;co[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);}while((f|0)!=0)}jc(a+28|0);lf(c[d>>2]|0);lf(c[e>>2]|0);lf(c[a+48>>2]|0);lf(c[a+60>>2]|0);return}function fb(a,b){a=a|0;b=b|0;return-1|0}function fc(a,b){a=a|0;b=b|0;return}function fd(a,b){a=a|0;b=b|0;return}function fe(a){a=a|0;fa(a+8|0);lo(a);return}function ff(a){a=a|0;fa(a+8|0);return}function fg(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fa(b+(d+8)|0);lo(b+d|0);return}function fh(a){a=a|0;fa(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function fi(a){a=a|0;fa(a+8|0);lo(a);return}function fj(a){a=a|0;fa(a+8|0);return}function fk(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fa(b+(d+8)|0);lo(b+d|0);return}function fl(a){a=a|0;fa(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function fm(a){a=a|0;fa(a+4|0);lo(a);return}function fn(a){a=a|0;fa(a+4|0);return}function fo(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fa(b+(d+4)|0);lo(b+d|0);return}function fp(a){a=a|0;fa(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function fq(b,d){b=b|0;d=d|0;var e=0,f=0;e=b|0;a[e]=0;c[b+4>>2]=d;b=c[(c[d>>2]|0)-12>>2]|0;f=d;if((c[f+(b+16)>>2]|0)!=0){return}d=c[f+(b+72)>>2]|0;if((d|0)!=0){fs(d)|0}a[e]=1;return}function fr(a){a=a|0;fv(a);return}function fs(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){fs(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cl[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;e9(h+k|0,c[h+(k+16)>>2]|1)}}while(0);fv(e);i=d;return b|0}function ft(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){return}else{a_()}}function fu(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){fu(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cl[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;e9(h+k|0,c[h+(k+16)>>2]|1)}}while(0);fX(e);i=d;return b|0}function fv(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bs()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cl[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;e9(d+b|0,c[d+(b+16)>>2]|1);return}function fw(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;if((p|0)!=0){fs(p)|0}a[l]=1;jb(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=jl(j,14216)|0;jc(j);q=c[(c[m>>2]|0)-12>>2]|0;r=c[o+(q+24)>>2]|0;s=o+(q+76)|0;t=c[s>>2]|0;if((t|0)==-1){jb(g,o+(q+28)|0);u=jl(g,14568)|0;v=cj[c[(c[u>>2]|0)+28>>2]&63](u,32)|0;jc(g);c[s>>2]=v<<24>>24;w=v}else{w=t&255}t=c[(c[p>>2]|0)+16>>2]|0;c[f>>2]=r;cu[t&63](k,p,f,o+q|0,w,d);if((c[k>>2]|0)!=0){break}q=c[(c[m>>2]|0)-12>>2]|0;e9(o+q|0,c[o+(q+16)>>2]|5)}}while(0);fv(h);i=e;return b|0}function fx(a){a=a|0;return 1920|0}function fy(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1713:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=1707;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=1709;break}if(l<<24>>24<k<<24>>24){i=1;j=1708;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L1713}else{b=k;h=l}}if((j|0)==1707){return i|0}else if((j|0)==1708){return i|0}else if((j|0)==1709){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function fz(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function fA(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1732:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=1724;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=1725;break}if((l|0)<(k|0)){i=1;j=1723;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L1732}else{a=k;h=l}}if((j|0)==1723){return i|0}else if((j|0)==1725){return i|0}else if((j|0)==1724){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function fB(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function fC(a){a=a|0;fa(a+4|0);lo(a);return}function fD(a){a=a|0;fa(a+4|0);return}function fE(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fa(b+(d+4)|0);lo(b+d|0);return}function fF(a){a=a|0;fa(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function fG(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){ej(a,2248,35);return}else{d8(a,b|0,c);return}}function fH(a){a=a|0;dU(a|0);return}function fI(a){a=a|0;ec(a|0);lo(a);return}function fJ(a){a=a|0;ec(a|0);return}function fK(a){a=a|0;fa(a);lo(a);return}function fL(a){a=a|0;dU(a|0);lo(a);return}function fM(a){a=a|0;dt(a|0);lo(a);return}function fN(a){a=a|0;dt(a|0);return}function fO(a){a=a|0;dt(a|0);return}function fP(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;do{if((g|0)==-1){eh(b);h=1753}else{if(g>>>0>=11){h=1753;break}a[b]=g<<1&255;i=b+1|0}}while(0);if((h|0)==1753){h=g+16&-16;j=lk(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=g;i=j}if((e|0)==(f|0)){k=i;a[k]=0;return}j=f+(-d|0)|0;d=i;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=i+j|0;a[k]=0;return}function fQ(a){a=a|0;dt(a|0);lo(a);return}function fR(a){a=a|0;dt(a|0);return}function fS(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741822){eh(b)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=lk(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function fT(a){a=a|0;dt(a|0);lo(a);return}function fU(a){a=a|0;dt(a|0);return}function fV(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;i=i+8|0;g=f|0;h=g|0;a[h]=0;c[g+4>>2]=b;j=b;k=c[(c[j>>2]|0)-12>>2]|0;l=b;do{if((c[l+(k+16)>>2]|0)==0){m=c[l+(k+72)>>2]|0;if((m|0)!=0){fs(m)|0}a[h]=1;m=c[(c[j>>2]|0)-12>>2]|0;if((e|0)==0){e9(l+m|0,c[l+(m+16)>>2]|1);break}n=e;o=c[l+(m+24)>>2]|0;m=0;while(1){p=c[n+12>>2]|0;if((p|0)==(c[n+16>>2]|0)){q=cl[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{q=d[p]|0}p=(q|0)==-1?0:n;if((p|0)==0){break}r=p+12|0;s=c[r>>2]|0;t=p+16|0;if((s|0)==(c[t>>2]|0)){u=(cl[c[(c[p>>2]|0)+36>>2]&255](p)|0)&255}else{u=a[s]|0}if((o|0)==0){break}s=o+24|0;v=c[s>>2]|0;if((v|0)==(c[o+28>>2]|0)){w=cj[c[(c[o>>2]|0)+52>>2]&63](o,u&255)|0}else{c[s>>2]=v+1;a[v]=u;w=u&255}v=(w|0)==-1?0:o;if((v|0)==0){break}s=c[r>>2]|0;if((s|0)==(c[t>>2]|0)){t=c[(c[p>>2]|0)+40>>2]|0;cl[t&255](p)|0}else{c[r>>2]=s+1}n=p;o=v;m=m+1|0}if((m|0)!=0){break}o=c[(c[j>>2]|0)-12>>2]|0;e9(l+o|0,c[l+(o+16)>>2]|4)}}while(0);fv(g);i=f;return b|0}function fW(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+8|0;f=e|0;g=f|0;a[g]=0;c[f+4>>2]=b;h=b;j=c[(c[h>>2]|0)-12>>2]|0;k=b;do{if((c[k+(j+16)>>2]|0)==0){l=c[k+(j+72)>>2]|0;if((l|0)!=0){fs(l)|0}a[g]=1;l=c[k+((c[(c[h>>2]|0)-12>>2]|0)+24)>>2]|0;m=l;if((l|0)==0){n=m}else{o=l+24|0;p=c[o>>2]|0;if((p|0)==(c[l+28>>2]|0)){q=cj[c[(c[l>>2]|0)+52>>2]&63](m,d&255)|0}else{c[o>>2]=p+1;a[p]=d;q=d&255}n=(q|0)==-1?0:m}if((n|0)!=0){break}m=c[(c[h>>2]|0)-12>>2]|0;e9(k+m|0,c[k+(m+16)>>2]|1)}}while(0);fv(f);i=e;return b|0}function fX(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bs()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cl[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;e9(d+b|0,c[d+(b+16)>>2]|1);return}function fY(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=le(m)|0;if((o|0)!=0){p=o;q=o;break}lt();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){z=r;break}if((cl[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){A=z;B=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((cl[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){C=m;break}c[b>>2]=0;C=0}else{C=m}}while(0);A=c[u>>2]|0;B=C}D=(B|0)==0;if(!((r^D)&(s|0)!=0)){break}m=c[A+12>>2]|0;if((m|0)==(c[A+16>>2]|0)){E=(cl[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[m]|0}if(k){F=E}else{F=cj[c[(c[e>>2]|0)+12>>2]&63](h,E)|0}do{if(n){G=x;H=s}else{m=t+1|0;L1917:do{if(k){y=s;o=x;w=p;v=0;I=f;while(1){do{if((a[w]|0)==1){J=I;if((a[J]&1)==0){K=I+1|0}else{K=c[I+8>>2]|0}if(F<<24>>24!=(a[K+t|0]|0)){a[w]=0;L=v;M=o;N=y-1|0;break}O=d[J]|0;if((O&1|0)==0){P=O>>>1}else{P=c[I+4>>2]|0}if((P|0)!=(m|0)){L=1;M=o;N=y;break}a[w]=2;L=1;M=o+1|0;N=y-1|0}else{L=v;M=o;N=y}}while(0);O=I+12|0;if((O|0)==(g|0)){Q=N;R=M;S=L;break L1917}y=N;o=M;w=w+1|0;v=L;I=O}}else{I=s;v=x;w=p;o=0;y=f;while(1){do{if((a[w]|0)==1){O=y;if((a[O]&1)==0){T=y+1|0}else{T=c[y+8>>2]|0}if(F<<24>>24!=(cj[c[(c[e>>2]|0)+12>>2]&63](h,a[T+t|0]|0)|0)<<24>>24){a[w]=0;U=o;V=v;W=I-1|0;break}J=d[O]|0;if((J&1|0)==0){X=J>>>1}else{X=c[y+4>>2]|0}if((X|0)!=(m|0)){U=1;V=v;W=I;break}a[w]=2;U=1;V=v+1|0;W=I-1|0}else{U=o;V=v;W=I}}while(0);J=y+12|0;if((J|0)==(g|0)){Q=W;R=V;S=U;break L1917}I=W;v=V;w=w+1|0;o=U;y=J}}}while(0);if(!S){G=R;H=Q;break}m=c[u>>2]|0;y=m+12|0;o=c[y>>2]|0;if((o|0)==(c[m+16>>2]|0)){w=c[(c[m>>2]|0)+40>>2]|0;cl[w&255](m)|0}else{c[y>>2]=o+1}if((R+Q|0)>>>0<2|n){G=R;H=Q;break}o=t+1|0;y=R;m=p;w=f;while(1){do{if((a[m]|0)==2){v=d[w]|0;if((v&1|0)==0){Y=v>>>1}else{Y=c[w+4>>2]|0}if((Y|0)==(o|0)){Z=y;break}a[m]=0;Z=y-1|0}else{Z=y}}while(0);v=w+12|0;if((v|0)==(g|0)){G=Z;H=Q;break}else{y=Z;m=m+1|0;w=v}}}}while(0);t=t+1|0;x=G;s=H}do{if((A|0)==0){_=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){_=A;break}if((cl[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[u>>2]=0;_=0;break}else{_=c[u>>2]|0;break}}}while(0);u=(_|0)==0;do{if(D){$=1950}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(u){break}else{$=1952;break}}if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[b>>2]=0;$=1950;break}else{if(u^(B|0)==0){break}else{$=1952;break}}}}while(0);if(($|0)==1950){if(u){$=1952}}if(($|0)==1952){c[j>>2]=c[j>>2]|2}L1996:do{if(n){$=1957}else{u=f;B=p;while(1){if((a[B]|0)==2){aa=u;break L1996}b=u+12|0;if((b|0)==(g|0)){$=1957;break L1996}u=b;B=B+1|0}}}while(0);if(($|0)==1957){c[j>>2]=c[j>>2]|4;aa=g}if((q|0)==0){i=l;return aa|0}lf(q);i=l;return aa|0}function fZ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cg[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}eR(r,g);q=r|0;r=c[q>>2]|0;if((c[3642]|0)!=-1){c[m>>2]=14568;c[m+4>>2]=12;c[m+8>>2]=0;eg(14568,m,104)}m=(c[3643]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;dT(n)|0;eR(s,g);n=s|0;p=c[n>>2]|0;if((c[3546]|0)!=-1){c[l>>2]=14184;c[l+4>>2]=12;c[l+8>>2]=0;eg(14184,l,104)}d=(c[3547]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;dT(z)|0;z=t|0;A=x;ci[c[(c[A>>2]|0)+24>>2]&127](z,y);ci[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(fY(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];ed(t+12|0);ed(t|0);i=k;return}}while(0);o=b5(4)|0;kV(o);bw(o|0,9432,148)}}while(0);k=b5(4)|0;kV(k);bw(k|0,9432,148)}function f_(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[11136+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[11136+i|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function f$(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n-4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L2106:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}k=(e-h|0)>1?h+1|0:h;j=n+4|0;q=a[k]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(j>>>0<b>>>0){h=k;n=j;m=r;i=s}else{t=r;u=s;break L2106}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}function f0(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==8){u=16}else if((t|0)==0){u=0}else{u=10}t=l|0;f2(n,h,t,m);h=o|0;lu(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2129:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cl[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2075}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2129}}if((cl[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2075;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2129}}}}while(0);if((y|0)==2075){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f_(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cl[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=f1(h,c[p>>2]|0,j,u)|0;f$(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2174:do{if(C){y=2105}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2105;break L2174}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);do{if((y|0)==2105){if(l){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ed(n);i=e;return}function f1(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bM()|0)>>2]|0;c[(bM()|0)>>2]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=b_(b|0,h|0,f|0,c[3302]|0)|0;f=K;b=c[(bM()|0)>>2]|0;if((b|0)==0){c[(bM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((b|0)==34|((f|0)<(d|0)|(f|0)==(d|0)&l>>>0<-2147483648>>>0)|((f|0)>(h|0)|(f|0)==(h|0)&l>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(f|0)>(e|0)|(f|0)==(e|0)&l>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function f2(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;eR(k,d);d=k|0;k=c[d>>2]|0;if((c[3642]|0)!=-1){c[j>>2]=14568;c[j+4>>2]=12;c[j+8>>2]=0;eg(14568,j,104)}j=(c[3643]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+32>>2]|0;cv[o&15](n,11136,11162,e)|0;n=c[d>>2]|0;if((c[3546]|0)!=-1){c[h>>2]=14184;c[h+4>>2]=12;c[h+8>>2]=0;eg(14184,h,104)}o=(c[3547]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;a[f]=cl[c[(c[p>>2]|0)+16>>2]&255](q)|0;ci[c[(c[p>>2]|0)+20>>2]&127](b,q);q=c[d>>2]|0;dT(q)|0;i=g;return}}while(0);o=b5(4)|0;kV(o);bw(o|0,9432,148)}}while(0);g=b5(4)|0;kV(g);bw(g|0,9432,148)}function f3(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==8){u=16}else if((t|0)==0){u=0}else{u=10}t=l|0;f2(n,h,t,m);h=o|0;lu(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2235:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cl[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2164}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2235}}if((cl[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2164;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2235}}}}while(0);if((y|0)==2164){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f_(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cl[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=f4(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f$(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2280:do{if(C){y=2194}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2194;break L2280}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);do{if((y|0)==2194){if(l){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ed(n);i=e;return}function f4(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}l=c[(bM()|0)>>2]|0;c[(bM()|0)>>2]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);m=b_(b|0,h|0,f|0,c[3302]|0)|0;f=K;b=c[(bM()|0)>>2]|0;if((b|0)==0){c[(bM()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}if((b|0)!=34){j=f;k=m;i=g;return(K=j,k)|0}c[e>>2]=4;e=0;b=(f|0)>(e|0)|(f|0)==(e|0)&m>>>0>0>>>0;j=b?2147483647:-2147483648;k=b?-1:0;i=g;return(K=j,k)|0}function f5(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=i;i=i+280|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=f+96|0;r=f+104|0;s=f+264|0;t=f+272|0;u=c[j+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=m|0;f2(o,j,u,n);j=p|0;lu(j|0,0,40);c[q>>2]=j;p=r|0;c[s>>2]=p;c[t>>2]=0;m=g|0;g=h|0;h=a[n]|0;n=c[m>>2]|0;L2320:while(1){do{if((n|0)==0){w=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){w=n;break}if((cl[c[(c[n>>2]|0)+36>>2]&255](n)|0)!=-1){w=n;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;y=c[g>>2]|0;do{if((y|0)==0){z=2235}else{if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(x){A=y;B=0;break}else{C=y;D=0;break L2320}}if((cl[c[(c[y>>2]|0)+36>>2]&255](y)|0)==-1){c[g>>2]=0;z=2235;break}else{E=(y|0)==0;if(x^E){A=y;B=E;break}else{C=y;D=E;break L2320}}}}while(0);if((z|0)==2235){z=0;if(x){C=0;D=1;break}else{A=0;B=1}}y=w+12|0;E=c[y>>2]|0;F=w+16|0;if((E|0)==(c[F>>2]|0)){G=(cl[c[(c[w>>2]|0)+36>>2]&255](w)|0)&255}else{G=a[E]|0}if((f_(G,v,j,q,t,h,o,p,s,u)|0)!=0){C=A;D=B;break}E=c[y>>2]|0;if((E|0)==(c[F>>2]|0)){F=c[(c[w>>2]|0)+40>>2]|0;cl[F&255](w)|0;n=w;continue}else{c[y>>2]=E+1;n=w;continue}}n=d[o]|0;if((n&1|0)==0){H=n>>>1}else{H=c[o+4>>2]|0}do{if((H|0)!=0){n=c[s>>2]|0;if((n-r|0)>=160){break}B=c[t>>2]|0;c[s>>2]=n+4;c[n>>2]=B}}while(0);b[l>>1]=f6(j,c[q>>2]|0,k,v)|0;f$(o,p,c[s>>2]|0,k);do{if(x){I=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){I=w;break}if((cl[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){I=w;break}c[m>>2]=0;I=0}}while(0);m=(I|0)==0;L2365:do{if(D){z=2265}else{do{if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((cl[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){break}c[g>>2]=0;z=2265;break L2365}}while(0);if(!(m^(C|0)==0)){break}J=e|0;c[J>>2]=I;ed(o);i=f;return}}while(0);do{if((z|0)==2265){if(m){break}J=e|0;c[J>>2]=I;ed(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;J=e|0;c[J>>2]=I;ed(o);i=f;return}function f6(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bM()|0)>>2]|0;c[(bM()|0)>>2]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=aL(b|0,h|0,f|0,c[3302]|0)|0;f=K;b=c[(bM()|0)>>2]|0;if((b|0)==0){c[(bM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l&65535;i=g;return j|0}return 0}function f7(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==8){u=16}else if((t|0)==0){u=0}else{u=10}t=l|0;f2(n,h,t,m);h=o|0;lu(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2410:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cl[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2310}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2410}}if((cl[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2310;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2410}}}}while(0);if((y|0)==2310){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f_(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cl[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=f8(h,c[p>>2]|0,j,u)|0;f$(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2455:do{if(C){y=2340}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2340;break L2455}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);do{if((y|0)==2340){if(l){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ed(n);i=e;return}function f8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bM()|0)>>2]|0;c[(bM()|0)>>2]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=aL(b|0,h|0,f|0,c[3302]|0)|0;f=K;b=c[(bM()|0)>>2]|0;if((b|0)==0){c[(bM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function f9(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l|0;f2(n,h,t,m);h=o|0;lu(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2500:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cl[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2385}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2500}}if((cl[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2385;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2500}}}}while(0);if((y|0)==2385){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f_(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cl[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=ga(h,c[p>>2]|0,j,u)|0;f$(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2545:do{if(C){y=2415}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2415;break L2545}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);do{if((y|0)==2415){if(l){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ed(n);i=e;return}function ga(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(bM()|0)>>2]|0;c[(bM()|0)>>2]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=aL(b|0,h|0,f|0,c[3302]|0)|0;f=K;b=c[(bM()|0)>>2]|0;if((b|0)==0){c[(bM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function gb(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l|0;f2(n,h,t,m);h=o|0;lu(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2590:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cl[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2460}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2590}}if((cl[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2460;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2590}}}}while(0);if((y|0)==2460){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f_(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cl[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=gc(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f$(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cl[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2635:do{if(C){y=2490}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2490;break L2635}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);do{if((y|0)==2490){if(l){break}I=b|0;c[I>>2]=H;ed(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ed(n);i=e;return}function gc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[(bM()|0)>>2]|0;c[(bM()|0)>>2]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);m=aL(b|0,h|0,f|0,c[3302]|0)|0;n=K;o=c[(bM()|0)>>2]|0;if((o|0)==0){c[(bM()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)!=34){j=n;k=m;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(K=j,k)|0}function gd(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;ge(p,j,w,n,o);j=e+72|0;lu(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L2669:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cl[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2525}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L2669}}if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2525;break}else{if(A^(B|0)==0){break}else{break L2669}}}}while(0);if((C|0)==2525){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((gf(F,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cl[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);I=+ls(j,m,c[3302]|0);if((c[m>>2]|0)==(t|0)){H=I;break}else{c[k>>2]=4;H=0.0;break}}}while(0);g[l>>2]=H;f$(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cl[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=2567}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}if((cl[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=2567;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}}while(0);do{if((C|0)==2567){if(y){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;ed(p);i=e;return}function ge(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;eR(l,d);d=l|0;l=c[d>>2]|0;if((c[3642]|0)!=-1){c[k>>2]=14568;c[k+4>>2]=12;c[k+8>>2]=0;eg(14568,k,104)}k=(c[3643]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;cv[p&15](o,11136,11168,e)|0;o=c[d>>2]|0;if((c[3546]|0)!=-1){c[j>>2]=14184;c[j+4>>2]=12;c[j+8>>2]=0;eg(14184,j,104)}p=(c[3547]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;a[f]=cl[c[(c[s>>2]|0)+12>>2]&255](r)|0;a[g]=cl[c[(c[s>>2]|0)+16>>2]&255](r)|0;ci[c[(c[q>>2]|0)+20>>2]&127](b,r);r=c[d>>2]|0;dT(r)|0;i=h;return}}while(0);p=b5(4)|0;kV(p);bw(p|0,9432,148)}}while(0);h=b5(4)|0;kV(h);bw(h|0,9432,148)}function gf(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+32|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((a[j]|0)==b<<24>>24){u=j;break}else{j=j+1|0}}j=u-o|0;if((j|0)>31){r=-1;return r|0}o=a[11136+j|0]|0;do{if((j|0)==25|(j|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=o;r=0;return r|0}else if((j|0)==22|(j|0)==23){a[f]=80}else{u=a[f]|0;if((o&95|0)!=(u<<24>>24|0)){break}a[f]=u|-128;if((a[e]&1)==0){break}a[e]=0;u=d[k]|0;if((u&1|0)==0){v=u>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}u=c[m>>2]|0;if((u-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=b}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=o}if((j|0)>21){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function gg(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;ge(p,j,w,n,o);j=e+72|0;lu(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L2833:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cl[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2657}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L2833}}if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2657;break}else{if(A^(B|0)==0){break}else{break L2833}}}}while(0);if((C|0)==2657){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((gf(F,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cl[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);I=+ls(j,m,c[3302]|0);if((c[m>>2]|0)==(t|0)){H=I;break}c[k>>2]=4;H=0.0}}while(0);h[l>>3]=H;f$(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cl[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=2698}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}if((cl[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=2698;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}}while(0);do{if((C|0)==2698){if(y){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;ed(p);i=e;return}function gh(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;ge(p,j,w,n,o);j=e+72|0;lu(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L2906:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cl[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2718}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L2906}}if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2718;break}else{if(A^(B|0)==0){break}else{break L2906}}}}while(0);if((C|0)==2718){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((gf(F,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cl[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);I=+ls(j,m,c[3302]|0);if((c[m>>2]|0)==(t|0)){H=I;break}c[k>>2]=4;H=0.0}}while(0);h[l>>3]=H;f$(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cl[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=2759}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}if((cl[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=2759;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}}while(0);do{if((C|0)==2759){if(y){break}K=b|0;c[K>>2]=J;ed(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;ed(p);i=e;return}function gi(a){a=a|0;dt(a|0);lo(a);return}function gj(a){a=a|0;dt(a|0);return}function gk(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+64|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+48|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;lu(m|0,0,12);eR(n,g);g=n|0;n=c[g>>2]|0;if((c[3642]|0)!=-1){c[k>>2]=14568;c[k+4>>2]=12;c[k+8>>2]=0;eg(14568,k,104)}k=(c[3643]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+32>>2]|0;cv[x&15](v,11136,11162,w)|0;v=c[g>>2]|0;dT(v)|0;v=o|0;lu(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L2989:while(1){do{if((z|0)==0){A=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){A=z;break}if((cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);C=(A|0)==0;D=c[y>>2]|0;do{if((D|0)==0){E=2789}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){break}else{break L2989}}if((cl[c[(c[D>>2]|0)+36>>2]&255](D)|0)==-1){c[y>>2]=0;E=2789;break}else{if(C^(D|0)==0){break}else{break L2989}}}}while(0);if((E|0)==2789){E=0;if(C){break}}D=A+12|0;F=c[D>>2]|0;G=A+16|0;if((F|0)==(c[G>>2]|0)){H=(cl[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{H=a[F]|0}if((f_(H,16,v,p,s,0,m,x,r,w)|0)!=0){break}F=c[D>>2]|0;if((F|0)==(c[G>>2]|0)){G=c[(c[A>>2]|0)+40>>2]|0;cl[G&255](A)|0;z=A;continue}else{c[D>>2]=F+1;z=A;continue}}a[o+39|0]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);if((gl(v,c[3302]|0,1696,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}z=c[u>>2]|0;do{if((z|0)==0){I=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){I=z;break}if((cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){I=z;break}c[u>>2]=0;I=0}}while(0);u=(I|0)==0;z=c[y>>2]|0;do{if((z|0)==0){E=2822}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(!u){break}J=b|0;c[J>>2]=I;ed(m);i=d;return}if((cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[y>>2]=0;E=2822;break}if(!(u^(z|0)==0)){break}J=b|0;c[J>>2]=I;ed(m);i=d;return}}while(0);do{if((E|0)==2822){if(u){break}J=b|0;c[J>>2]=I;ed(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;J=b|0;c[J>>2]=I;ed(m);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function gl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bT(b|0)|0;b=a1(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bT(h|0)|0;i=f;return b|0}function gm(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cg[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}eR(r,g);q=r|0;r=c[q>>2]|0;if((c[3640]|0)!=-1){c[m>>2]=14560;c[m+4>>2]=12;c[m+8>>2]=0;eg(14560,m,104)}m=(c[3641]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;dT(n)|0;eR(s,g);n=s|0;p=c[n>>2]|0;if((c[3544]|0)!=-1){c[l>>2]=14176;c[l+4>>2]=12;c[l+8>>2]=0;eg(14176,l,104)}d=(c[3545]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;dT(z)|0;z=t|0;A=x;ci[c[(c[A>>2]|0)+24>>2]&127](z,y);ci[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(gn(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];eq(t+12|0);eq(t|0);i=k;return}}while(0);o=b5(4)|0;kV(o);bw(o|0,9432,148)}}while(0);k=b5(4)|0;kV(k);bw(k|0,9432,148)}function gn(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=le(m)|0;if((o|0)!=0){p=o;q=o;break}lt();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){A=cl[c[(c[r>>2]|0)+36>>2]&255](r)|0}else{A=c[m>>2]|0}if((A|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){B=z;C=0}else{y=c[m+12>>2]|0;if((y|0)==(c[m+16>>2]|0)){D=cl[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{D=c[y>>2]|0}if((D|0)==-1){c[b>>2]=0;E=0}else{E=m}B=c[u>>2]|0;C=E}F=(C|0)==0;if(!((r^F)&(s|0)!=0)){break}r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){G=cl[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{G=c[r>>2]|0}if(k){H=G}else{H=cj[c[(c[e>>2]|0)+28>>2]&63](h,G)|0}do{if(n){I=x;J=s}else{r=t+1|0;L3136:do{if(k){m=s;y=x;o=p;w=0;v=f;while(1){do{if((a[o]|0)==1){K=v;if((a[K]&1)==0){L=v+4|0}else{L=c[v+8>>2]|0}if((H|0)!=(c[L+(t<<2)>>2]|0)){a[o]=0;M=w;N=y;O=m-1|0;break}P=d[K]|0;if((P&1|0)==0){Q=P>>>1}else{Q=c[v+4>>2]|0}if((Q|0)!=(r|0)){M=1;N=y;O=m;break}a[o]=2;M=1;N=y+1|0;O=m-1|0}else{M=w;N=y;O=m}}while(0);P=v+12|0;if((P|0)==(g|0)){R=O;S=N;T=M;break L3136}m=O;y=N;o=o+1|0;w=M;v=P}}else{v=s;w=x;o=p;y=0;m=f;while(1){do{if((a[o]|0)==1){P=m;if((a[P]&1)==0){U=m+4|0}else{U=c[m+8>>2]|0}if((H|0)!=(cj[c[(c[e>>2]|0)+28>>2]&63](h,c[U+(t<<2)>>2]|0)|0)){a[o]=0;V=y;W=w;X=v-1|0;break}K=d[P]|0;if((K&1|0)==0){Y=K>>>1}else{Y=c[m+4>>2]|0}if((Y|0)!=(r|0)){V=1;W=w;X=v;break}a[o]=2;V=1;W=w+1|0;X=v-1|0}else{V=y;W=w;X=v}}while(0);K=m+12|0;if((K|0)==(g|0)){R=X;S=W;T=V;break L3136}v=X;w=W;o=o+1|0;y=V;m=K}}}while(0);if(!T){I=S;J=R;break}r=c[u>>2]|0;m=r+12|0;y=c[m>>2]|0;if((y|0)==(c[r+16>>2]|0)){o=c[(c[r>>2]|0)+40>>2]|0;cl[o&255](r)|0}else{c[m>>2]=y+4}if((S+R|0)>>>0<2|n){I=S;J=R;break}y=t+1|0;m=S;r=p;o=f;while(1){do{if((a[r]|0)==2){w=d[o]|0;if((w&1|0)==0){Z=w>>>1}else{Z=c[o+4>>2]|0}if((Z|0)==(y|0)){_=m;break}a[r]=0;_=m-1|0}else{_=m}}while(0);w=o+12|0;if((w|0)==(g|0)){I=_;J=R;break}else{m=_;r=r+1|0;o=w}}}}while(0);t=t+1|0;x=I;s=J}do{if((B|0)==0){$=1}else{J=c[B+12>>2]|0;if((J|0)==(c[B+16>>2]|0)){aa=cl[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{aa=c[J>>2]|0}if((aa|0)==-1){c[u>>2]=0;$=1;break}else{$=(c[u>>2]|0)==0;break}}}while(0);do{if(F){ab=2962}else{u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){ac=cl[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{ac=c[u>>2]|0}if((ac|0)==-1){c[b>>2]=0;ab=2962;break}else{if($^(C|0)==0){break}else{ab=2964;break}}}}while(0);if((ab|0)==2962){if($){ab=2964}}if((ab|0)==2964){c[j>>2]=c[j>>2]|2}L3217:do{if(n){ab=2969}else{$=f;C=p;while(1){if((a[C]|0)==2){ad=$;break L3217}b=$+12|0;if((b|0)==(g|0)){ab=2969;break L3217}$=b;C=C+1|0}}}while(0);if((ab|0)==2969){c[j>>2]=c[j>>2]|4;ad=g}if((q|0)==0){i=l;return ad|0}lf(q);i=l;return ad|0}function go(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k|0;gs(m,g,s,l);g=n|0;lu(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L3235:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cl[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=2993}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=2993;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L3235}}}}while(0);if((y|0)==2993){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gp(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cl[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=f1(g,c[o>>2]|0,h,t)|0;f$(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=3024}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cl[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=3024;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;ed(m);i=b;return}}while(0);do{if((y|0)==3024){if(k){break}L=a|0;c[L>>2]=I;ed(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;ed(m);i=b;return}function gp(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[11136+m|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[11136+m|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function gq(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}s=k|0;gs(m,g,s,l);g=n|0;lu(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L52:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cl[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=53}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=53;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L52}}}}while(0);if((y|0)==53){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gp(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cl[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=f4(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=K;f$(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=84}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=cl[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;y=84;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;ed(m);i=b;return}}while(0);do{if((y|0)==84){if(k){break}M=a|0;c[M>>2]=I;ed(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;ed(m);i=b;return}function gr(a,e,f,g,h,j,k){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;gs(n,h,t,m);h=o|0;lu(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L121:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=cl[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=108}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=cl[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=108;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L121}}}}while(0);if((z|0)==108){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((gp(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;cl[G&255](v)|0;m=v;continue}else{c[w>>2]=A+4;m=v;continue}}m=d[n]|0;if((m&1|0)==0){I=m>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=D}}while(0);b[k>>1]=f6(h,c[p>>2]|0,j,u)|0;f$(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=139}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=cl[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=139;break}if(!(l^(E|0)==0)){break}M=a|0;c[M>>2]=J;ed(n);i=e;return}}while(0);do{if((z|0)==139){if(l){break}M=a|0;c[M>>2]=J;ed(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;M=a|0;c[M>>2]=J;ed(n);i=e;return}function gs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;eR(j,b);b=j|0;j=c[b>>2]|0;if((c[3640]|0)!=-1){c[h>>2]=14560;c[h+4>>2]=12;c[h+8>>2]=0;eg(14560,h,104)}h=(c[3641]|0)-1|0;k=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-k>>2>>>0>h>>>0){l=c[k+(h<<2)>>2]|0;if((l|0)==0){break}m=l;n=c[(c[l>>2]|0)+48>>2]|0;cv[n&15](m,11136,11162,d)|0;m=c[b>>2]|0;if((c[3544]|0)!=-1){c[g>>2]=14176;c[g+4>>2]=12;c[g+8>>2]=0;eg(14176,g,104)}n=(c[3545]|0)-1|0;l=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-l>>2>>>0>n>>>0){o=c[l+(n<<2)>>2]|0;if((o|0)==0){break}p=o;c[e>>2]=cl[c[(c[o>>2]|0)+16>>2]&255](p)|0;ci[c[(c[o>>2]|0)+20>>2]&127](a,p);p=c[b>>2]|0;dT(p)|0;i=f;return}}while(0);n=b5(4)|0;kV(n);bw(n|0,9432,148)}}while(0);f=b5(4)|0;kV(f);bw(f|0,9432,148)}function gt(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}s=k|0;gs(m,g,s,l);g=n|0;lu(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L210:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cl[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=180}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=180;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L210}}}}while(0);if((y|0)==180){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gp(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cl[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=f8(g,c[o>>2]|0,h,t)|0;f$(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=211}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cl[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=211;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;ed(m);i=b;return}}while(0);do{if((y|0)==211){if(k){break}L=a|0;c[L>>2]=I;ed(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;ed(m);i=b;return}function gu(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}s=k|0;gs(m,g,s,l);g=n|0;lu(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L279:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cl[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=235}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=235;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L279}}}}while(0);if((y|0)==235){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gp(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cl[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=ga(g,c[o>>2]|0,h,t)|0;f$(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=266}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cl[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=266;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;ed(m);i=b;return}}while(0);do{if((y|0)==266){if(k){break}L=a|0;c[L>>2]=I;ed(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;ed(m);i=b;return}function gv(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==64){t=8}else if((s|0)==0){t=0}else if((s|0)==8){t=16}else{t=10}s=k|0;gs(m,g,s,l);g=n|0;lu(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L348:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cl[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=290}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cl[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=290;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L348}}}}while(0);if((y|0)==290){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gp(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cl[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=gc(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=K;f$(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=321}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=cl[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;y=321;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;ed(m);i=b;return}}while(0);do{if((y|0)==321){if(k){break}M=a|0;c[M>>2]=I;ed(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;ed(m);i=b;return}function gw(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if((b|0)==(i|0)){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+128|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((c[j>>2]|0)==(b|0)){u=j;break}else{j=j+4|0}}j=u-o|0;o=j>>2;if((j|0)>124){r=-1;return r|0}u=a[11136+o|0]|0;do{if((o|0)==25|(o|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=u;r=0;return r|0}else if((o|0)==22|(o|0)==23){a[f]=80}else{b=a[f]|0;if((u&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){v=b>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}t=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=t}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=u}if((j|0)>84){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function gx(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;gy(p,j,w,n,o);j=e+168|0;lu(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L480:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cl[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=393}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cl[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=393;break}else{if(A^(C|0)==0){break}else{break L480}}}}while(0);if((D|0)==393){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((gw(H,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cl[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);K=+ls(j,m,c[3302]|0);if((c[m>>2]|0)==(t|0)){J=K;break}else{c[k>>2]=4;J=0.0;break}}}while(0);g[l>>2]=J;f$(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cl[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=435}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cl[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=435;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;ed(p);i=e;return}}while(0);do{if((D|0)==435){if(y){break}O=b|0;c[O>>2]=L;ed(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;ed(p);i=e;return}function gy(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;eR(k,b);b=k|0;k=c[b>>2]|0;if((c[3640]|0)!=-1){c[j>>2]=14560;c[j+4>>2]=12;c[j+8>>2]=0;eg(14560,j,104)}j=(c[3641]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;cv[o&15](n,11136,11168,d)|0;n=c[b>>2]|0;if((c[3544]|0)!=-1){c[h>>2]=14176;c[h+4>>2]=12;c[h+8>>2]=0;eg(14176,h,104)}o=(c[3545]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=p;c[e>>2]=cl[c[(c[r>>2]|0)+12>>2]&255](q)|0;c[f>>2]=cl[c[(c[r>>2]|0)+16>>2]&255](q)|0;ci[c[(c[p>>2]|0)+20>>2]&127](a,q);q=c[b>>2]|0;dT(q)|0;i=g;return}}while(0);o=b5(4)|0;kV(o);bw(o|0,9432,148)}}while(0);g=b5(4)|0;kV(g);bw(g|0,9432,148)}function gz(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;gy(p,j,w,n,o);j=e+168|0;lu(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L578:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cl[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=473}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cl[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=473;break}else{if(A^(C|0)==0){break}else{break L578}}}}while(0);if((D|0)==473){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((gw(H,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cl[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);K=+ls(j,m,c[3302]|0);if((c[m>>2]|0)==(t|0)){J=K;break}c[k>>2]=4;J=0.0}}while(0);h[l>>3]=J;f$(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cl[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=514}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cl[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=514;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;ed(p);i=e;return}}while(0);do{if((D|0)==514){if(y){break}O=b|0;c[O>>2]=L;ed(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;ed(p);i=e;return}function gA(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;gy(p,j,w,n,o);j=e+168|0;lu(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L653:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cl[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=534}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cl[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=534;break}else{if(A^(C|0)==0){break}else{break L653}}}}while(0);if((D|0)==534){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((gw(H,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cl[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);K=+ls(j,m,c[3302]|0);if((c[m>>2]|0)==(t|0)){J=K;break}c[k>>2]=4;J=0.0}}while(0);h[l>>3]=J;f$(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cl[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=575}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cl[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=575;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;ed(p);i=e;return}}while(0);do{if((D|0)==575){if(y){break}O=b|0;c[O>>2]=L;ed(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;ed(p);i=e;return}function gB(a){a=a|0;dt(a|0);lo(a);return}function gC(a){a=a|0;dt(a|0);return}function gD(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[3128]|0;a[q+1|0]=a[3129|0]|0;a[q+2|0]=a[3130|0]|0;a[q+3|0]=a[3131|0]|0;a[q+4|0]=a[3132|0]|0;a[q+5|0]=a[3133|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);t=gG(u,c[3302]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=605;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=605;break}w=k+2|0}else if((q|0)==32){w=h}else{x=605}}while(0);if((x|0)==605){w=u}x=l|0;eR(o,f);gK(u,w,h,x,m,n,o);dT(c[o>>2]|0)|0;c[p>>2]=c[e>>2];dr(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gE(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+136|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+120|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;lu(m|0,0,12);eR(n,g);g=n|0;n=c[g>>2]|0;if((c[3640]|0)!=-1){c[k>>2]=14560;c[k+4>>2]=12;c[k+8>>2]=0;eg(14560,k,104)}k=(c[3641]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+48>>2]|0;cv[x&15](v,11136,11162,w)|0;v=c[g>>2]|0;dT(v)|0;v=o|0;lu(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L769:while(1){do{if((z|0)==0){A=0}else{C=c[z+12>>2]|0;if((C|0)==(c[z+16>>2]|0)){D=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{D=c[C>>2]|0}if((D|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);C=(A|0)==0;E=c[y>>2]|0;do{if((E|0)==0){F=630}else{G=c[E+12>>2]|0;if((G|0)==(c[E+16>>2]|0)){H=cl[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[y>>2]=0;F=630;break}else{if(C^(E|0)==0){break}else{break L769}}}}while(0);if((F|0)==630){F=0;if(C){break}}E=A+12|0;G=c[E>>2]|0;I=A+16|0;if((G|0)==(c[I>>2]|0)){J=cl[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{J=c[G>>2]|0}if((gp(J,16,v,p,s,0,m,x,r,w)|0)!=0){break}G=c[E>>2]|0;if((G|0)==(c[I>>2]|0)){I=c[(c[A>>2]|0)+40>>2]|0;cl[I&255](A)|0;z=A;continue}else{c[E>>2]=G+4;z=A;continue}}a[o+39|0]=0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);if((gl(v,c[3302]|0,1696,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}z=c[u>>2]|0;do{if((z|0)==0){K=0}else{w=c[z+12>>2]|0;if((w|0)==(c[z+16>>2]|0)){L=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[w>>2]|0}if((L|0)!=-1){K=z;break}c[u>>2]=0;K=0}}while(0);u=(K|0)==0;z=c[y>>2]|0;do{if((z|0)==0){F=663}else{v=c[z+12>>2]|0;if((v|0)==(c[z+16>>2]|0)){M=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{M=c[v>>2]|0}if((M|0)==-1){c[y>>2]=0;F=663;break}if(!(u^(z|0)==0)){break}N=b|0;c[N>>2]=K;ed(m);i=d;return}}while(0);do{if((F|0)==663){if(u){break}N=b|0;c[N>>2]=K;ed(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;N=b|0;c[N>>2]=K;ed(m);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function gF(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cu[o&63](b,d,l,f,g,h&1);i=j;return}eR(m,f);f=m|0;m=c[f>>2]|0;if((c[3546]|0)!=-1){c[k>>2]=14184;c[k+4>>2]=12;c[k+8>>2]=0;eg(14184,k,104)}k=(c[3547]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;dT(o)|0;o=c[l>>2]|0;if(h){ci[c[o+24>>2]&127](n,d)}else{ci[c[o+28>>2]&127](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){p=d+1|0;q=p;r=p;s=n+8|0}else{p=n+8|0;q=c[p>>2]|0;r=d+1|0;s=p}p=e|0;d=n+4|0;t=q;u=l;while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}l=u&255;if((t|0)==(v+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){break}l=a[t]|0;w=c[p>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)!=(c[w+28>>2]|0)){c[x>>2]=y+1;a[y]=l;break}if((cj[c[(c[w>>2]|0)+52>>2]&63](w,l&255)|0)!=-1){break}c[p>>2]=0}}while(0);t=t+1|0;u=a[o]|0}c[b>>2]=c[p>>2];ed(n);i=j;return}}while(0);j=b5(4)|0;kV(j);bw(j|0,9432,148)}function gG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bT(b|0)|0;b=bS(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bT(h|0)|0;i=f;return b|0}function gH(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=l|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);v=gG(u,c[3302]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=730;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=730;break}w=l+2|0}else if((h|0)==32){w=j}else{x=730}}while(0);if((x|0)==730){w=u}x=m|0;eR(p,f);gK(u,w,j,x,n,o,p);dT(c[p>>2]|0)|0;c[q>>2]=c[e>>2];dr(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gI(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[3128]|0;a[q+1|0]=a[3129|0]|0;a[q+2|0]=a[3130|0]|0;a[q+3|0]=a[3131|0]|0;a[q+4|0]=a[3132|0]|0;a[q+5|0]=a[3133|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);t=gG(u,c[3302]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){w=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=755;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=755;break}w=k+2|0}else{x=755}}while(0);if((x|0)==755){w=u}x=l|0;eR(o,f);gK(u,w,h,x,m,n,o);dT(c[o>>2]|0)|0;c[p>>2]=c[e>>2];dr(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gJ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);v=gG(u,c[3302]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=780;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=780;break}w=l+2|0}else if((h|0)==32){w=j}else{x=780}}while(0);if((x|0)==780){w=u}x=m|0;eR(p,f);gK(u,w,j,x,n,o,p);dT(c[p>>2]|0)|0;c[q>>2]=c[e>>2];dr(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gK(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3642]|0)!=-1){c[n>>2]=14568;c[n+4>>2]=12;c[n+8>>2]=0;eg(14568,n,104)}n=(c[3643]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}r=k;s=c[p>>2]|0;if((c[3546]|0)!=-1){c[m>>2]=14184;c[m+4>>2]=12;c[m+8>>2]=0;eg(14184,m,104)}m=(c[3547]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}t=s;ci[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;cv[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cj[c[(c[k>>2]|0)+28>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cj[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+1;a[y]=q;q=cj[c[(c[p>>2]|0)+28>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cl[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1;a[I]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=cj[c[(c[p>>2]|0)+28>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-1|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=a[J]|0;a[J]=a[K]|0;a[K]=C;J=J+1|0;K=K-1|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;ed(o);i=l;return}else{L=g+(e-b)|0;c[h>>2]=L;ed(o);i=l;return}}function gL(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=c[3302]|0;if(y){z=gM(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gM(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[15128]|0)==0;if(y){do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lt();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==32){F=z}else if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=888;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=888;break}F=E+2|0}else{G=888}}while(0);if((G|0)==888){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=le(C<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}lt();H=0;I=0;J=c[m>>2]|0}}while(0);eR(q,f);gP(J,F,z,H,o,p,q);dT(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];dr(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){lf(I)}if((D|0)==0){i=d;return}lf(D);i=d;return}function gM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=bT(d|0)|0;d=bU(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}bT(j|0)|0;i=g;return d|0}function gN(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bT(b|0)|0;b=b8(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bT(h|0)|0;i=f;return b|0}function gO(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=c[3302]|0;if(y){z=gM(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gM(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[15128]|0)==0;if(y){do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lt();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==32){F=z}else if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=979;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=979;break}F=E+2|0}else{G=979}}while(0);if((G|0)==979){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=le(C<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}lt();H=0;I=0;J=c[m>>2]|0}}while(0);eR(q,f);gP(J,F,z,H,o,p,q);dT(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];dr(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){lf(I)}if((D|0)==0){i=d;return}lf(D);i=d;return}function gP(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3642]|0)!=-1){c[n>>2]=14568;c[n+4>>2]=12;c[n+8>>2]=0;eg(14568,n,104)}n=(c[3643]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}r=k;s=c[p>>2]|0;if((c[3546]|0)!=-1){c[m>>2]=14184;c[m+4>>2]=12;c[m+8>>2]=0;eg(14184,m,104)}m=(c[3547]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}t=s;ci[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cj[c[(c[k>>2]|0)+28>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=m;v=b+1|0}else{v=b}m=f;L1228:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=1034;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=1034;break}p=k;n=cj[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=cj[c[(c[p>>2]|0)+28>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L1228}u=a[q]|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);if((bd(u<<24>>24|0,c[3302]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=1034}}while(0);L1243:do{if((x|0)==1034){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L1243}q=a[w]|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);if((bZ(q<<24>>24|0,c[3302]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=1034}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+32>>2]|0;cv[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=cl[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+1;a[J]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=cj[c[(c[p>>2]|0)+28>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-1|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=a[K]|0;a[K]=a[L]|0;a[L]=D;K=K+1|0;L=L-1|0;}while(K>>>0<L>>>0)}}while(0);L1282:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cj[c[(c[L>>2]|0)+28>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+1;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1282}}L=cl[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+1;a[H]=L;M=K+1|0}else{M=y}}while(0);cv[c[(c[k>>2]|0)+32>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;ed(o);i=l;return}N=g+(e-b)|0;c[h>>2]=N;ed(o);i=l;return}function gQ(a){a=a|0;dt(a|0);lo(a);return}function gR(a){a=a|0;dt(a|0);return}function gS(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[3128]|0;a[q+1|0]=a[3129|0]|0;a[q+2|0]=a[3130|0]|0;a[q+3|0]=a[3131|0]|0;a[q+4|0]=a[3132|0]|0;a[q+5|0]=a[3133|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);v=gG(u,c[3302]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1102;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1102;break}w=k+2|0}else if((q|0)==32){w=h}else{x=1102}}while(0);if((x|0)==1102){w=u}x=l|0;eR(o,f);gV(u,w,h,x,m,n,o);dT(c[o>>2]|0)|0;c[p>>2]=c[e>>2];gW(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gT(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[3136]|0;a[o+1|0]=a[3137|0]|0;a[o+2|0]=a[3138|0]|0;a[o+3|0]=a[3139|0]|0;a[o+4|0]=a[3140|0]|0;a[o+5|0]=a[3141|0]|0;p=k|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);q=gG(p,c[3302]|0,o,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+q|0;o=c[f+4>>2]&176;do{if((o|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=1117;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=1117;break}s=k+2|0}else if((o|0)==32){s=h}else{t=1117}}while(0);if((t|0)==1117){s=p}eR(m,f);t=m|0;m=c[t>>2]|0;if((c[3642]|0)!=-1){c[j>>2]=14568;c[j+4>>2]=12;c[j+8>>2]=0;eg(14568,j,104)}j=(c[3643]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){r=c[o+(j<<2)>>2]|0;if((r|0)==0){break}u=r;v=c[t>>2]|0;dT(v)|0;v=l|0;w=c[(c[r>>2]|0)+32>>2]|0;cv[w&15](u,p,h,v)|0;u=l+q|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;dr(b,n,v,x,u,f,g);i=d;return}x=l+(s-k)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;dr(b,n,v,x,u,f,g);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function gU(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cu[o&63](b,d,l,f,g,h&1);i=j;return}eR(m,f);f=m|0;m=c[f>>2]|0;if((c[3544]|0)!=-1){c[k>>2]=14176;c[k+4>>2]=12;c[k+8>>2]=0;eg(14176,k,104)}k=(c[3545]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;dT(o)|0;o=c[l>>2]|0;if(h){ci[c[o+24>>2]&127](n,d)}else{ci[c[o+28>>2]&127](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;p=l;q=l;r=n+8|0}else{l=n+8|0;p=c[l>>2]|0;q=n+4|0;r=l}l=e|0;s=p;t=o;while(1){if((t&1)==0){u=q}else{u=c[r>>2]|0}o=t&255;if((o&1|0)==0){v=o>>>1}else{v=c[q>>2]|0}if((s|0)==(u+(v<<2)|0)){break}o=c[s>>2]|0;w=c[l>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)==(c[w+28>>2]|0)){z=cj[c[(c[w>>2]|0)+52>>2]&63](w,o)|0}else{c[x>>2]=y+4;c[y>>2]=o;z=o}if((z|0)!=-1){break}c[l>>2]=0}}while(0);s=s+4|0;t=a[d]|0}c[b>>2]=c[l>>2];eq(n);i=j;return}}while(0);j=b5(4)|0;kV(j);bw(j|0,9432,148)}function gV(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3640]|0)!=-1){c[n>>2]=14560;c[n+4>>2]=12;c[n+8>>2]=0;eg(14560,n,104)}n=(c[3641]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}r=k;s=c[p>>2]|0;if((c[3544]|0)!=-1){c[m>>2]=14176;c[m+4>>2]=12;c[m+8>>2]=0;eg(14176,m,104)}m=(c[3545]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}t=s;ci[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;cv[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cj[c[(c[k>>2]|0)+44>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cj[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+4;c[y>>2]=q;q=cj[c[(c[p>>2]|0)+44>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cl[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=cj[c[(c[p>>2]|0)+44>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b<<2)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-4|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=c[J>>2]|0;c[J>>2]=c[K>>2];c[K>>2]=C;J=J+4|0;K=K-4|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;ed(o);i=l;return}else{L=g+(e-b<<2)|0;c[h>>2]=L;ed(o);i=l;return}}function gW(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cm[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){ex(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((cm[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){eq(l);break}c[m>>2]=0;c[b>>2]=0;eq(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((cm[c[(c[d>>2]|0)+48>>2]&63](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function gX(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);t=gG(u,c[3302]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1262;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1262;break}w=l+2|0}else{x=1262}}while(0);if((x|0)==1262){w=u}x=m|0;eR(p,f);gV(u,w,j,x,n,o,p);dT(c[p>>2]|0)|0;c[q>>2]=c[e>>2];gW(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gY(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[3128]|0;a[q+1|0]=a[3129|0]|0;a[q+2|0]=a[3130|0]|0;a[q+3|0]=a[3131|0]|0;a[q+4|0]=a[3132|0]|0;a[q+5|0]=a[3133|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);t=gG(u,c[3302]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1287;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1287;break}w=k+2|0}else if((q|0)==32){w=h}else{x=1287}}while(0);if((x|0)==1287){w=u}x=l|0;eR(o,f);gV(u,w,h,x,m,n,o);dT(c[o>>2]|0)|0;c[p>>2]=c[e>>2];gW(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gZ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);v=gG(u,c[3302]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==32){w=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1312;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1312;break}w=l+2|0}else{x=1312}}while(0);if((x|0)==1312){w=u}x=m|0;eR(p,f);gV(u,w,j,x,n,o,p);dT(c[p>>2]|0)|0;c[q>>2]=c[e>>2];gW(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function g_(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=c[3302]|0;if(y){z=gM(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gM(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[15128]|0)==0;if(y){do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lt();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1368;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1368;break}F=E+2|0}else if((A|0)==32){F=z}else{G=1368}}while(0);if((G|0)==1368){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=le(C<<3)|0;A=G;if((G|0)!=0){H=A;I=A;J=E;break}lt();H=A;I=A;J=c[m>>2]|0}}while(0);eR(q,f);g$(J,F,z,H,o,p,q);dT(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];gW(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){lf(I)}if((D|0)==0){i=d;return}lf(D);i=d;return}function g$(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3640]|0)!=-1){c[n>>2]=14560;c[n+4>>2]=12;c[n+8>>2]=0;eg(14560,n,104)}n=(c[3641]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=b5(4)|0;s=r;kV(s);bw(r|0,9432,148)}r=k;s=c[p>>2]|0;if((c[3544]|0)!=-1){c[m>>2]=14176;c[m+4>>2]=12;c[m+8>>2]=0;eg(14176,m,104)}m=(c[3545]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=b5(4)|0;u=t;kV(u);bw(t|0,9432,148)}t=s;ci[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cj[c[(c[k>>2]|0)+44>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=m;v=b+1|0}else{v=b}m=f;L1686:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=1423;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=1423;break}p=k;n=cj[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=cj[c[(c[p>>2]|0)+44>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L1686}u=a[q]|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);if((bd(u<<24>>24|0,c[3302]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=1423}}while(0);L1701:do{if((x|0)==1423){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L1701}q=a[w]|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);if((bZ(q<<24>>24|0,c[3302]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=1423}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+48>>2]|0;cv[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z<<2)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=cl[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=cj[c[(c[p>>2]|0)+44>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b<<2)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-4|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=c[K>>2]|0;c[K>>2]=c[L>>2];c[L>>2]=D;K=K+4|0;L=L-4|0;}while(K>>>0<L>>>0)}}while(0);L1740:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cj[c[(c[L>>2]|0)+44>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1740}}L=cl[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+4;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);cv[c[(c[k>>2]|0)+48>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M<<2)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;ed(o);i=l;return}N=g+(e-b<<2)|0;c[h>>2]=N;ed(o);i=l;return}function g0(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);l=c[3302]|0;if(y){z=gM(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gM(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[15128]|0)==0;if(y){do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);A=gN(m,c[3302]|0,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lt();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1520;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1520;break}F=E+2|0}else if((A|0)==32){F=z}else{G=1520}}while(0);if((G|0)==1520){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=le(C<<3)|0;A=G;if((G|0)!=0){H=A;I=A;J=E;break}lt();H=A;I=A;J=c[m>>2]|0}}while(0);eR(q,f);g$(J,F,z,H,o,p,q);dT(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];gW(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){lf(I)}if((D|0)==0){i=d;return}lf(D);i=d;return}function g1(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[3136]|0;a[o+1|0]=a[3137|0]|0;a[o+2|0]=a[3138|0]|0;a[o+3|0]=a[3139|0]|0;a[o+4|0]=a[3140|0]|0;a[o+5|0]=a[3141|0]|0;p=k|0;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);q=gG(p,c[3302]|0,o,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+q|0;o=c[f+4>>2]&176;do{if((o|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=1553;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=1553;break}s=k+2|0}else if((o|0)==32){s=h}else{t=1553}}while(0);if((t|0)==1553){s=p}eR(m,f);t=m|0;m=c[t>>2]|0;if((c[3640]|0)!=-1){c[j>>2]=14560;c[j+4>>2]=12;c[j+8>>2]=0;eg(14560,j,104)}j=(c[3641]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){r=c[o+(j<<2)>>2]|0;if((r|0)==0){break}u=r;v=c[t>>2]|0;dT(v)|0;v=l|0;w=c[(c[r>>2]|0)+48>>2]|0;cv[w&15](u,p,h,v)|0;u=l+(q<<2)|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;gW(b,n,v,x,u,f,g);i=d;return}x=l+(s-k<<2)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;gW(b,n,v,x,u,f,g);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function g2(a){a=a|0;return 2}function g3(a){a=a|0;dt(a|0);lo(a);return}function g4(a){a=a|0;dt(a|0);return}function g5(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];g7(a,b,k,l,f,g,h,3120,3128);i=j;return}function g6(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cl[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}g7(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function g7(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;eR(p,h);t=p|0;p=c[t>>2]|0;if((c[3642]|0)!=-1){c[o>>2]=14568;c[o+4>>2]=12;c[o+8>>2]=0;eg(14568,o,104)}o=(c[3643]|0)-1|0;u=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-u>>2>>>0>o>>>0){v=c[u+(o<<2)>>2]|0;if((v|0)==0){break}w=v;x=c[t>>2]|0;dT(x)|0;c[j>>2]=0;x=f|0;L1883:do{if((l|0)==(m|0)){y=1643}else{z=g|0;A=v;B=v+8|0;C=v;D=e;E=r|0;F=s|0;G=q|0;H=l;I=0;L1885:while(1){J=I;while(1){if((J|0)!=0){y=1643;break L1883}K=c[x>>2]|0;do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}if((cl[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){L=K;break}c[x>>2]=0;L=0}}while(0);K=(L|0)==0;M=c[z>>2]|0;L1895:do{if((M|0)==0){y=1596}else{do{if((c[M+12>>2]|0)==(c[M+16>>2]|0)){if((cl[c[(c[M>>2]|0)+36>>2]&255](M)|0)!=-1){break}c[z>>2]=0;y=1596;break L1895}}while(0);if(K){N=M}else{y=1597;break L1885}}}while(0);if((y|0)==1596){y=0;if(K){y=1597;break L1885}else{N=0}}if((cm[c[(c[A>>2]|0)+36>>2]&63](w,a[H]|0,0)|0)<<24>>24==37){y=1600;break}M=a[H]|0;if(M<<24>>24>-1){O=c[B>>2]|0;if((b[O+(M<<24>>24<<1)>>1]&8192)!=0){P=H;y=1611;break}}Q=L+12|0;M=c[Q>>2]|0;R=L+16|0;if((M|0)==(c[R>>2]|0)){S=(cl[c[(c[L>>2]|0)+36>>2]&255](L)|0)&255}else{S=a[M]|0}M=cj[c[(c[C>>2]|0)+12>>2]&63](w,S)|0;if(M<<24>>24==(cj[c[(c[C>>2]|0)+12>>2]&63](w,a[H]|0)|0)<<24>>24){y=1638;break}c[j>>2]=4;J=4}L1913:do{if((y|0)==1638){y=0;J=c[Q>>2]|0;if((J|0)==(c[R>>2]|0)){M=c[(c[L>>2]|0)+40>>2]|0;cl[M&255](L)|0}else{c[Q>>2]=J+1}T=H+1|0}else if((y|0)==1600){y=0;J=H+1|0;if((J|0)==(m|0)){y=1601;break L1885}M=cm[c[(c[A>>2]|0)+36>>2]&63](w,a[J]|0,0)|0;if((M<<24>>24|0)==69|(M<<24>>24|0)==48){U=H+2|0;if((U|0)==(m|0)){y=1604;break L1885}V=M;W=cm[c[(c[A>>2]|0)+36>>2]&63](w,a[U]|0,0)|0;X=U}else{V=0;W=M;X=J}J=c[(c[D>>2]|0)+36>>2]|0;c[E>>2]=L;c[F>>2]=N;cs[J&7](q,e,r,s,h,j,k,W,V);c[x>>2]=c[G>>2];T=X+1|0}else if((y|0)==1611){while(1){y=0;J=P+1|0;if((J|0)==(m|0)){Y=m;break}M=a[J]|0;if(M<<24>>24<=-1){Y=J;break}if((b[O+(M<<24>>24<<1)>>1]&8192)==0){Y=J;break}else{P=J;y=1611}}K=L;J=N;while(1){do{if((K|0)==0){Z=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){Z=K;break}if((cl[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){Z=K;break}c[x>>2]=0;Z=0}}while(0);M=(Z|0)==0;do{if((J|0)==0){y=1624}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(M){_=J;break}else{T=Y;break L1913}}if((cl[c[(c[J>>2]|0)+36>>2]&255](J)|0)==-1){c[z>>2]=0;y=1624;break}else{if(M^(J|0)==0){_=J;break}else{T=Y;break L1913}}}}while(0);if((y|0)==1624){y=0;if(M){T=Y;break L1913}else{_=0}}U=Z+12|0;$=c[U>>2]|0;aa=Z+16|0;if(($|0)==(c[aa>>2]|0)){ab=(cl[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)&255}else{ab=a[$]|0}if(ab<<24>>24<=-1){T=Y;break L1913}if((b[(c[B>>2]|0)+(ab<<24>>24<<1)>>1]&8192)==0){T=Y;break L1913}$=c[U>>2]|0;if(($|0)==(c[aa>>2]|0)){aa=c[(c[Z>>2]|0)+40>>2]|0;cl[aa&255](Z)|0;K=Z;J=_;continue}else{c[U>>2]=$+1;K=Z;J=_;continue}}}}while(0);if((T|0)==(m|0)){y=1643;break L1883}H=T;I=c[j>>2]|0}if((y|0)==1604){c[j>>2]=4;ac=L;break}else if((y|0)==1601){c[j>>2]=4;ac=L;break}else if((y|0)==1597){c[j>>2]=4;ac=L;break}}}while(0);if((y|0)==1643){ac=c[x>>2]|0}w=f|0;do{if((ac|0)!=0){if((c[ac+12>>2]|0)!=(c[ac+16>>2]|0)){break}if((cl[c[(c[ac>>2]|0)+36>>2]&255](ac)|0)!=-1){break}c[w>>2]=0}}while(0);x=c[w>>2]|0;v=(x|0)==0;I=g|0;H=c[I>>2]|0;L1971:do{if((H|0)==0){y=1653}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((cl[c[(c[H>>2]|0)+36>>2]&255](H)|0)!=-1){break}c[I>>2]=0;y=1653;break L1971}}while(0);if(!v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);do{if((y|0)==1653){if(v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ad=d|0;c[ad>>2]=x;i=n;return}}while(0);n=b5(4)|0;kV(n);bw(n|0,9432,148)}function g8(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;eR(m,f);f=m|0;m=c[f>>2]|0;if((c[3642]|0)!=-1){c[l>>2]=14568;c[l+4>>2]=12;c[l+8>>2]=0;eg(14568,l,104)}l=(c[3643]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dT(o)|0;o=c[e>>2]|0;q=b+8|0;r=cl[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(fY(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b5(4)|0;kV(j);bw(j|0,9432,148)}function g9(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;eR(m,f);f=m|0;m=c[f>>2]|0;if((c[3642]|0)!=-1){c[l>>2]=14568;c[l+4>>2]=12;c[l+8>>2]=0;eg(14568,l,104)}l=(c[3643]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dT(o)|0;o=c[e>>2]|0;q=b+8|0;r=cl[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(fY(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b5(4)|0;kV(j);bw(j|0,9432,148)}function ha(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;eR(l,f);f=l|0;l=c[f>>2]|0;if((c[3642]|0)!=-1){c[k>>2]=14568;c[k+4>>2]=12;c[k+8>>2]=0;eg(14568,k,104)}k=(c[3643]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;dT(n)|0;c[j>>2]=c[e>>2];n=hf(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=b5(4)|0;kV(b);bw(b|0,9432,148)}function hb(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L2029:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((cl[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L2038:do{if((l|0)==0){m=1709}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((cl[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[e>>2]=0;m=1709;break L2038}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L2029}}}while(0);if((m|0)==1709){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(cl[c[(c[l>>2]|0)+36>>2]&255](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cl[u&255](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((cl[c[(c[o>>2]|0)+36>>2]&255](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=1728}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((cl[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[e>>2]=0;m=1728;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==1728){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function hc(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;eR(z,g);_=z|0;z=c[_>>2]|0;if((c[3642]|0)!=-1){c[y>>2]=14568;c[y+4>>2]=12;c[y+8>>2]=0;eg(14568,y,104)}y=(c[3643]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;dT(aa)|0;aa=k<<24>>24;L2086:do{if((aa|0)==120){ac=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];cg[ac&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==88){ac=d+8|0;ad=cl[c[(c[ac>>2]|0)+24>>2]&255](ac)|0;ac=e|0;c[X>>2]=c[ac>>2];c[Y>>2]=c[f>>2];ae=ad;af=a[ad]|0;if((af&1)==0){ag=ae+1|0;ah=ae+1|0}else{ae=c[ad+8>>2]|0;ag=ae;ah=ae}ae=af&255;if((ae&1|0)==0){ai=ae>>>1}else{ai=c[ad+4>>2]|0}g7(W,d,X,Y,g,h,j,ah,ag+ai|0);c[ac>>2]=c[W>>2]}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ac=c[f>>2]|0;ad=d+8|0;ae=cl[c[(c[ad>>2]|0)+4>>2]&255](ad)|0;c[w>>2]=ac;ac=(fY(e,w,ae,ae+288|0,ab,h,0)|0)-ae|0;if((ac|0)>=288){break}c[j+16>>2]=((ac|0)/12|0|0)%12|0}else if((aa|0)==70){ac=e|0;c[H>>2]=c[ac>>2];c[I>>2]=c[f>>2];g7(G,d,H,I,g,h,j,3104,3112);c[ac>>2]=c[G>>2]}else if((aa|0)==106){c[s>>2]=c[f>>2];ac=hf(e,s,h,ab,3)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<366){c[j+28>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==77){c[q>>2]=c[f>>2];ae=hf(e,q,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<60){c[j+4>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==73){ac=j+8|0;c[t>>2]=c[f>>2];ae=hf(e,t,h,ab,2)|0;ad=c[h>>2]|0;do{if((ad&4|0)==0){if((ae-1|0)>>>0>=12){break}c[ac>>2]=ae;break L2086}}while(0);c[h>>2]=ad|4}else if((aa|0)==37){c[Z>>2]=c[f>>2];he(0,e,Z,h,ab)}else if((aa|0)==109){c[r>>2]=c[f>>2];ae=(hf(e,r,h,ab,2)|0)-1|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<12){c[j+16>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==84){ac=e|0;c[S>>2]=c[ac>>2];c[T>>2]=c[f>>2];g7(R,d,S,T,g,h,j,3072,3080);c[ac>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ac=hf(e,o,h,ab,1)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<7){c[j+24>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==72){c[u>>2]=c[f>>2];ae=hf(e,u,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<24){c[j+8>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==68){ac=e|0;c[E>>2]=c[ac>>2];c[F>>2]=c[f>>2];g7(D,d,E,F,g,h,j,3112,3120);c[ac>>2]=c[D>>2]}else if((aa|0)==100|(aa|0)==101){ac=j+12|0;c[v>>2]=c[f>>2];ae=hf(e,v,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ae-1|0)>>>0>=31){break}c[ac>>2]=ae;break L2086}}while(0);c[h>>2]=af|4}else if((aa|0)==97|(aa|0)==65){ae=c[f>>2]|0;ac=d+8|0;ad=cl[c[c[ac>>2]>>2]&255](ac)|0;c[x>>2]=ae;ae=(fY(e,x,ad,ad+168|0,ab,h,0)|0)-ad|0;if((ae|0)>=168){break}c[j+24>>2]=((ae|0)/12|0|0)%7|0}else if((aa|0)==121){c[n>>2]=c[f>>2];ae=hf(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ae|0)<69){aj=ae+2e3|0}else{aj=(ae-69|0)>>>0<31?ae+1900|0:ae}c[j+20>>2]=aj-1900}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];hb(0,e,J,h,ab)}else if((aa|0)==112){c[K>>2]=c[f>>2];hd(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ae=e|0;c[M>>2]=c[ae>>2];c[N>>2]=c[f>>2];g7(L,d,M,N,g,h,j,3088,3099);c[ae>>2]=c[L>>2]}else if((aa|0)==89){c[m>>2]=c[f>>2];ae=hf(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ae-1900}else if((aa|0)==99){ae=d+8|0;ad=cl[c[(c[ae>>2]|0)+12>>2]&255](ae)|0;ae=e|0;c[B>>2]=c[ae>>2];c[C>>2]=c[f>>2];ac=ad;ak=a[ad]|0;if((ak&1)==0){al=ac+1|0;am=ac+1|0}else{ac=c[ad+8>>2]|0;al=ac;am=ac}ac=ak&255;if((ac&1|0)==0){an=ac>>>1}else{an=c[ad+4>>2]|0}g7(A,d,B,C,g,h,j,am,al+an|0);c[ae>>2]=c[A>>2]}else if((aa|0)==82){ae=e|0;c[P>>2]=c[ae>>2];c[Q>>2]=c[f>>2];g7(O,d,P,Q,g,h,j,3080,3085);c[ae>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ae=hf(e,p,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ae|0)<61){c[j>>2]=ae;break}else{c[h>>2]=ad|4;break}}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=b5(4)|0;kV(l);bw(l|0,9432,148)}function hd(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cl[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=fY(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function he(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((cl[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L2199:do{if((e|0)==0){k=1839}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cl[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[j>>2]=0;k=1839;break L2199}}while(0);if(d){l=e;m=0}else{k=1840}}}while(0);if((k|0)==1839){if(d){k=1840}else{l=0;m=1}}if((k|0)==1840){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(cl[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{n=a[e]|0}if((cm[c[(c[g>>2]|0)+36>>2]&63](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;cl[d&255](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((cl[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=1859}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((cl[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[j>>2]=0;k=1859;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==1859){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function hf(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((cl[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L2253:do{if((e|0)==0){m=1879}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cl[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[l>>2]=0;m=1879;break L2253}}while(0);if(d){n=e}else{m=1880}}}while(0);if((m|0)==1879){if(d){m=1880}else{n=0}}if((m|0)==1880){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(cl[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(cm[c[(c[d>>2]|0)+36>>2]&63](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cl[u&255](r)|0;v=q;w=h;x=n}else{c[s>>2]=t+1;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((cl[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((cl[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=1909;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=(cl[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=1924;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=1925;break}s=((cm[c[(c[d>>2]|0)+36>>2]&63](g,E,0)|0)<<24>>24)+(y*10|0)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;cl[G&255](r)|0;v=s;w=q;x=B;continue}else{c[u>>2]=F+1;v=s;w=q;x=B;continue}}if((m|0)==1909){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((cl[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L2310:do{if(D){m=1919}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[l>>2]=0;m=1919;break L2310}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==1919){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}else if((m|0)==1924){i=j;return o|0}else if((m|0)==1925){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function hg(a){a=a|0;return 2}function hh(a){a=a|0;dt(a|0);lo(a);return}function hi(a){a=a|0;dt(a|0);return}function hj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];hl(a,b,k,l,f,g,h,3040,3072);i=j;return}function hk(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cl[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}hl(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function hl(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+48|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=l+40|0;eR(n,f);r=n|0;n=c[r>>2]|0;if((c[3640]|0)!=-1){c[m>>2]=14560;c[m+4>>2]=12;c[m+8>>2]=0;eg(14560,m,104)}m=(c[3641]|0)-1|0;s=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-s>>2>>>0>m>>>0){t=c[s+(m<<2)>>2]|0;if((t|0)==0){break}u=t;v=c[r>>2]|0;dT(v)|0;c[g>>2]=0;v=d|0;L2346:do{if((j|0)==(k|0)){w=2010}else{x=e|0;y=t;z=t;A=t;B=b;C=p|0;D=q|0;E=o|0;F=j;G=0;L2348:while(1){H=G;while(1){if((H|0)!=0){w=2010;break L2346}I=c[v>>2]|0;do{if((I|0)==0){J=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){L=cl[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{L=c[K>>2]|0}if((L|0)!=-1){J=I;break}c[v>>2]=0;J=0}}while(0);I=(J|0)==0;K=c[x>>2]|0;do{if((K|0)==0){w=1962}else{M=c[K+12>>2]|0;if((M|0)==(c[K+16>>2]|0)){N=cl[c[(c[K>>2]|0)+36>>2]&255](K)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[x>>2]=0;w=1962;break}else{if(I^(K|0)==0){O=K;break}else{w=1964;break L2348}}}}while(0);if((w|0)==1962){w=0;if(I){w=1964;break L2348}else{O=0}}if((cm[c[(c[y>>2]|0)+52>>2]&63](u,c[F>>2]|0,0)|0)<<24>>24==37){w=1967;break}if(cm[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[F>>2]|0)|0){P=F;w=1977;break}Q=J+12|0;K=c[Q>>2]|0;R=J+16|0;if((K|0)==(c[R>>2]|0)){S=cl[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[K>>2]|0}K=cj[c[(c[A>>2]|0)+28>>2]&63](u,S)|0;if((K|0)==(cj[c[(c[A>>2]|0)+28>>2]&63](u,c[F>>2]|0)|0)){w=2005;break}c[g>>2]=4;H=4}L2380:do{if((w|0)==2005){w=0;H=c[Q>>2]|0;if((H|0)==(c[R>>2]|0)){K=c[(c[J>>2]|0)+40>>2]|0;cl[K&255](J)|0}else{c[Q>>2]=H+4}T=F+4|0}else if((w|0)==1967){w=0;H=F+4|0;if((H|0)==(k|0)){w=1968;break L2348}K=cm[c[(c[y>>2]|0)+52>>2]&63](u,c[H>>2]|0,0)|0;if((K<<24>>24|0)==69|(K<<24>>24|0)==48){M=F+8|0;if((M|0)==(k|0)){w=1971;break L2348}U=K;V=cm[c[(c[y>>2]|0)+52>>2]&63](u,c[M>>2]|0,0)|0;W=M}else{U=0;V=K;W=H}H=c[(c[B>>2]|0)+36>>2]|0;c[C>>2]=J;c[D>>2]=O;cs[H&7](o,b,p,q,f,g,h,V,U);c[v>>2]=c[E>>2];T=W+4|0}else if((w|0)==1977){while(1){w=0;H=P+4|0;if((H|0)==(k|0)){X=k;break}if(cm[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[H>>2]|0)|0){P=H;w=1977}else{X=H;break}}I=J;H=O;while(1){do{if((I|0)==0){Y=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){Z=cl[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{Z=c[K>>2]|0}if((Z|0)!=-1){Y=I;break}c[v>>2]=0;Y=0}}while(0);K=(Y|0)==0;do{if((H|0)==0){w=1992}else{M=c[H+12>>2]|0;if((M|0)==(c[H+16>>2]|0)){_=cl[c[(c[H>>2]|0)+36>>2]&255](H)|0}else{_=c[M>>2]|0}if((_|0)==-1){c[x>>2]=0;w=1992;break}else{if(K^(H|0)==0){$=H;break}else{T=X;break L2380}}}}while(0);if((w|0)==1992){w=0;if(K){T=X;break L2380}else{$=0}}M=Y+12|0;aa=c[M>>2]|0;ab=Y+16|0;if((aa|0)==(c[ab>>2]|0)){ac=cl[c[(c[Y>>2]|0)+36>>2]&255](Y)|0}else{ac=c[aa>>2]|0}if(!(cm[c[(c[z>>2]|0)+12>>2]&63](u,8192,ac)|0)){T=X;break L2380}aa=c[M>>2]|0;if((aa|0)==(c[ab>>2]|0)){ab=c[(c[Y>>2]|0)+40>>2]|0;cl[ab&255](Y)|0;I=Y;H=$;continue}else{c[M>>2]=aa+4;I=Y;H=$;continue}}}}while(0);if((T|0)==(k|0)){w=2010;break L2346}F=T;G=c[g>>2]|0}if((w|0)==1964){c[g>>2]=4;ad=J;break}else if((w|0)==1968){c[g>>2]=4;ad=J;break}else if((w|0)==1971){c[g>>2]=4;ad=J;break}}}while(0);if((w|0)==2010){ad=c[v>>2]|0}u=d|0;do{if((ad|0)!=0){t=c[ad+12>>2]|0;if((t|0)==(c[ad+16>>2]|0)){ae=cl[c[(c[ad>>2]|0)+36>>2]&255](ad)|0}else{ae=c[t>>2]|0}if((ae|0)!=-1){break}c[u>>2]=0}}while(0);v=c[u>>2]|0;t=(v|0)==0;G=e|0;F=c[G>>2]|0;do{if((F|0)==0){w=2023}else{z=c[F+12>>2]|0;if((z|0)==(c[F+16>>2]|0)){af=cl[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{af=c[z>>2]|0}if((af|0)==-1){c[G>>2]=0;w=2023;break}if(!(t^(F|0)==0)){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);do{if((w|0)==2023){if(t){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ag=a|0;c[ag>>2]=v;i=l;return}}while(0);l=b5(4)|0;kV(l);bw(l|0,9432,148)}function hm(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;eR(m,f);f=m|0;m=c[f>>2]|0;if((c[3640]|0)!=-1){c[l>>2]=14560;c[l+4>>2]=12;c[l+8>>2]=0;eg(14560,l,104)}l=(c[3641]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dT(o)|0;o=c[e>>2]|0;q=b+8|0;r=cl[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(gn(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b5(4)|0;kV(j);bw(j|0,9432,148)}function hn(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;eR(m,f);f=m|0;m=c[f>>2]|0;if((c[3640]|0)!=-1){c[l>>2]=14560;c[l+4>>2]=12;c[l+8>>2]=0;eg(14560,l,104)}l=(c[3641]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;dT(o)|0;o=c[e>>2]|0;q=b+8|0;r=cl[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(gn(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=b5(4)|0;kV(j);bw(j|0,9432,148)}function ho(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;eR(l,f);f=l|0;l=c[f>>2]|0;if((c[3640]|0)!=-1){c[k>>2]=14560;c[k+4>>2]=12;c[k+8>>2]=0;eg(14560,k,104)}k=(c[3641]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;dT(n)|0;c[j>>2]=c[e>>2];n=ht(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=b5(4)|0;kV(b);bw(b|0,9432,148)}
function hp(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L2504:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=cl[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=2083}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=cl[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=2083;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L2504}}}}while(0);if((m|0)==2083){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=cl[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{s=c[k>>2]|0}if(!(cm[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;cl[u&255](k)|0;continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=cl[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=2105}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=cl[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=2105;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==2105){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function hq(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;eR(z,g);_=z|0;z=c[_>>2]|0;if((c[3640]|0)!=-1){c[y>>2]=14560;c[y+4>>2]=12;c[y+8>>2]=0;eg(14560,y,104)}y=(c[3641]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;dT(aa)|0;aa=k<<24>>24;L2569:do{if((aa|0)==37){c[Z>>2]=c[f>>2];hs(0,e,Z,h,ab)}else if((aa|0)==121){c[n>>2]=c[f>>2];ac=ht(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ac|0)<69){ad=ac+2e3|0}else{ad=(ac-69|0)>>>0<31?ac+1900|0:ac}c[j+20>>2]=ad-1900}else if((aa|0)==106){c[s>>2]=c[f>>2];ac=ht(e,s,h,ab,3)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<366){c[j+28>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==112){c[K>>2]=c[f>>2];hr(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ae=e|0;c[M>>2]=c[ae>>2];c[N>>2]=c[f>>2];hl(L,d,M,N,g,h,j,2960,3004);c[ae>>2]=c[L>>2]}else if((aa|0)==77){c[q>>2]=c[f>>2];ae=ht(e,q,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<60){c[j+4>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==109){c[r>>2]=c[f>>2];ac=(ht(e,r,h,ab,2)|0)-1|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<12){c[j+16>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==70){ae=e|0;c[H>>2]=c[ae>>2];c[I>>2]=c[f>>2];hl(G,d,H,I,g,h,j,2872,2904);c[ae>>2]=c[G>>2]}else if((aa|0)==84){ae=e|0;c[S>>2]=c[ae>>2];c[T>>2]=c[f>>2];hl(R,d,S,T,g,h,j,2904,2936);c[ae>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ae=ht(e,o,h,ab,1)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<7){c[j+24>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==72){c[u>>2]=c[f>>2];ac=ht(e,u,h,ab,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ac|0)<24){c[j+8>>2]=ac;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ae=c[f>>2]|0;ac=d+8|0;af=cl[c[(c[ac>>2]|0)+4>>2]&255](ac)|0;c[w>>2]=ae;ae=(gn(e,w,af,af+288|0,ab,h,0)|0)-af|0;if((ae|0)>=288){break}c[j+16>>2]=((ae|0)/12|0|0)%12|0}else if((aa|0)==97|(aa|0)==65){ae=c[f>>2]|0;af=d+8|0;ac=cl[c[c[af>>2]>>2]&255](af)|0;c[x>>2]=ae;ae=(gn(e,x,ac,ac+168|0,ab,h,0)|0)-ac|0;if((ae|0)>=168){break}c[j+24>>2]=((ae|0)/12|0|0)%7|0}else if((aa|0)==88){ae=d+8|0;ac=cl[c[(c[ae>>2]|0)+24>>2]&255](ae)|0;ae=e|0;c[X>>2]=c[ae>>2];c[Y>>2]=c[f>>2];af=a[ac]|0;if((af&1)==0){ag=ac+4|0;ah=ac+4|0}else{ai=c[ac+8>>2]|0;ag=ai;ah=ai}ai=af&255;if((ai&1|0)==0){aj=ai>>>1}else{aj=c[ac+4>>2]|0}hl(W,d,X,Y,g,h,j,ah,ag+(aj<<2)|0);c[ae>>2]=c[W>>2]}else if((aa|0)==68){ae=e|0;c[E>>2]=c[ae>>2];c[F>>2]=c[f>>2];hl(D,d,E,F,g,h,j,3008,3040);c[ae>>2]=c[D>>2]}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];hp(0,e,J,h,ab)}else if((aa|0)==82){ae=e|0;c[P>>2]=c[ae>>2];c[Q>>2]=c[f>>2];hl(O,d,P,Q,g,h,j,2936,2956);c[ae>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ae=ht(e,p,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ae|0)<61){c[j>>2]=ae;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=ht(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==73){ac=j+8|0;c[t>>2]=c[f>>2];ae=ht(e,t,h,ab,2)|0;ai=c[h>>2]|0;do{if((ai&4|0)==0){if((ae-1|0)>>>0>=12){break}c[ac>>2]=ae;break L2569}}while(0);c[h>>2]=ai|4}else if((aa|0)==120){ae=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];cg[ae&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==100|(aa|0)==101){ae=j+12|0;c[v>>2]=c[f>>2];ac=ht(e,v,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ac-1|0)>>>0>=31){break}c[ae>>2]=ac;break L2569}}while(0);c[h>>2]=af|4}else if((aa|0)==99){ac=d+8|0;ae=cl[c[(c[ac>>2]|0)+12>>2]&255](ac)|0;ac=e|0;c[B>>2]=c[ac>>2];c[C>>2]=c[f>>2];ai=a[ae]|0;if((ai&1)==0){ak=ae+4|0;al=ae+4|0}else{am=c[ae+8>>2]|0;ak=am;al=am}am=ai&255;if((am&1|0)==0){an=am>>>1}else{an=c[ae+4>>2]|0}hl(A,d,B,C,g,h,j,al,ak+(an<<2)|0);c[ac>>2]=c[A>>2]}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=b5(4)|0;kV(l);bw(l|0,9432,148)}function hr(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cl[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=gn(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function hs(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=cl[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=2218}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=cl[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=2218;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=2220;break}}}}while(0);if((l|0)==2218){if(h){l=2220}else{n=0;o=1}}if((l|0)==2220){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=cl[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{p=c[d>>2]|0}if((cm[c[(c[f>>2]|0)+52>>2]&63](f,p,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;cl[h&255](p)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=cl[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=2242}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=cl[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=2242;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==2242){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function ht(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=cl[c[(c[a>>2]|0)+36>>2]&255](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=2264}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=cl[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=2264;break}else{if(j^(b|0)==0){o=b;break}else{m=2266;break}}}}while(0);if((m|0)==2264){if(j){m=2266}else{o=0}}if((m|0)==2266){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=cl[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{q=c[b>>2]|0}b=e;if(!(cm[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(cm[c[(c[j>>2]|0)+52>>2]&63](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;cl[r&255](q)|0;s=n;t=f;u=o}else{c[a>>2]=k+4;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=cl[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=cl[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=cl[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{D=c[f>>2]|0}if(!(cm[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=2315;break}f=((cm[c[(c[j>>2]|0)+52>>2]&63](e,D,0)|0)<<24>>24)+(v*10|0)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;cl[q&255](n)|0;s=f;t=o;u=z;continue}else{c[k>>2]=a+4;s=f;t=o;u=z;continue}}if((m|0)==2315){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=cl[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=2310}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=2310;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==2310){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function hu(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2];f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=bv(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=cj[c[(c[s>>2]|0)+52>>2]&63](s,m&255)|0}else{c[l>>2]=j+1;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function hv(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2];e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400;ik(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=cj[c[(c[o>>2]|0)+52>>2]&63](o,l)|0}else{c[k>>2]=d+4;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function hw(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dt(a|0);lo(a);return}function hx(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dt(a|0);return}function hy(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dt(a|0);lo(a);return}function hz(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dt(a|0);return}function hA(a){a=a|0;return 127}function hB(a){a=a|0;return 127}function hC(a){a=a|0;return 0}function hD(a){a=a|0;return 127}function hE(a){a=a|0;return 127}function hF(a){a=a|0;return 0}function hG(a){a=a|0;return 2147483647}function hH(a){a=a|0;return 2147483647}function hI(a){a=a|0;return 0}function hJ(a){a=a|0;return 2147483647}function hK(a){a=a|0;return 2147483647}function hL(a){a=a|0;return 0}function hM(a){a=a|0;return}function hN(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hO(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hP(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hQ(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hR(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hS(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hT(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hU(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hV(a){a=a|0;dt(a|0);lo(a);return}function hW(a){a=a|0;dt(a|0);return}function hX(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function hY(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function hZ(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function h_(a,b){a=a|0;b=b|0;ek(a,1,45);return}function h$(a){a=a|0;dt(a|0);lo(a);return}function h0(a){a=a|0;dt(a|0);return}function h1(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function h2(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function h3(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function h4(a,b){a=a|0;b=b|0;ek(a,1,45);return}function h5(a){a=a|0;dt(a|0);lo(a);return}function h6(a){a=a|0;dt(a|0);return}function h7(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function h8(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function h9(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function ia(a,b){a=a|0;b=b|0;ex(a,1,45);return}function ib(a){a=a|0;dt(a|0);lo(a);return}function ic(a){a=a|0;dt(a|0);return}function id(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function ie(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function ig(a,b){a=a|0;b=b|0;lu(a|0,0,12);return}function ih(a,b){a=a|0;b=b|0;ex(a,1,45);return}function ii(a){a=a|0;dt(a|0);lo(a);return}function ij(a){a=a|0;dt(a|0);return}function ik(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;bv(n|0,100,o|0,f|0,c[g>>2]|0)|0;c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=bT(c[g>>2]|0)|0;g=kK(d,m,n,l)|0;if((f|0)!=0){bT(f|0)|0}if((g|0)==-1){ir(1104)}else{c[e>>2]=d+(g<<2);i=j;return}}function il(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+280|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=d+176|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=182;w=m+100|0;eR(p,h);m=p|0;x=c[m>>2]|0;if((c[3642]|0)!=-1){c[l>>2]=14568;c[l+4>>2]=12;c[l+8>>2]=0;eg(14568,l,104)}l=(c[3643]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2];do{if(im(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+32>>2]|0;cv[E&15](A,2856,2866,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>98){I=le(H+2|0)|0;if((I|0)!=0){J=I;K=I;break}lt();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+10|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((a[O]|0)==(a[N]|0)){P=O;break}else{O=O+1|0}}a[M]=a[2856+(P-I)|0]|0;O=N+1|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((bV(E|0,1952,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((K|0)==0){break}lf(K);break}N=b5(8)|0;d2(N,1872);bw(N|0,9448,24)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){S=z;break}if((cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[C>>2]|0;do{if((z|0)==0){T=2462}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{T=2464;break}}if((cl[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[C>>2]=0;T=2462;break}else{if(A^(z|0)==0){break}else{T=2464;break}}}}while(0);if((T|0)==2462){if(A){T=2464}}if((T|0)==2464){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;dT(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}ch[c[v>>2]&511](z);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function im(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0;q=i;i=i+440|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2];r=q|0;s=q+400|0;t=q+408|0;u=q+416|0;v=q+424|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=r|0;lu(w|0,0,12);E=x;F=y;G=z;H=A;lu(E|0,0,12);lu(F|0,0,12);lu(G|0,0,12);lu(H|0,0,12);it(g,h,s,t,u,v,x,y,z,B);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=f|0;f=m+8|0;m=z+1|0;I=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+4|0;P=x+8|0;Q=A+1|0;R=A+4|0;S=A+8|0;T=s+3|0;U=n+4|0;n=v+4|0;V=p;p=182;W=D;X=D;D=r+400|0;r=0;Y=0;L2:while(1){Z=c[g>>2]|0;do{if((Z|0)==0){_=0}else{if((c[Z+12>>2]|0)!=(c[Z+16>>2]|0)){_=Z;break}if((cl[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)==-1){c[g>>2]=0;_=0;break}else{_=c[g>>2]|0;break}}}while(0);Z=(_|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=15}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=267;break L2}}if((cl[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=15;break}else{if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=267;break L2}}}}while(0);if((aa|0)==15){aa=0;if(Z){ac=p;ad=W;ae=X;af=r;aa=267;break}else{ab=0}}$=a[s+Y|0]|0;do{if(($|0)==1){if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=267;break L2}ag=c[g>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){ai=(cl[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{ai=a[ah]|0}if(ai<<24>>24<=-1){aa=40;break L2}if((b[(c[f>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){aa=40;break L2}ah=c[g>>2]|0;ag=ah+12|0;aj=c[ag>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=(cl[c[(c[ah>>2]|0)+40>>2]&255](ah)|0)&255}else{c[ag>>2]=aj+1;ak=a[aj]|0}eo(A,ak);aa=41}else if(($|0)==0){aa=41}else if(($|0)==3){aj=a[F]|0;ag=aj&255;ah=(ag&1|0)==0?ag>>>1:c[L>>2]|0;ag=a[G]|0;al=ag&255;am=(al&1|0)==0?al>>>1:c[I>>2]|0;if((ah|0)==(-am|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}al=(ah|0)==0;ah=c[g>>2]|0;at=c[ah+12>>2]|0;au=c[ah+16>>2]|0;av=(at|0)==(au|0);if(!(al|(am|0)==0)){if(av){am=(cl[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aw=c[g>>2]|0;ax=am;ay=a[F]|0;az=aw;aA=c[aw+12>>2]|0;aB=c[aw+16>>2]|0}else{ax=a[at]|0;ay=aj;az=ah;aA=at;aB=au}au=az+12|0;aw=(aA|0)==(aB|0);if(ax<<24>>24==(a[(ay&1)==0?K:c[M>>2]|0]|0)){if(aw){am=c[(c[az>>2]|0)+40>>2]|0;cl[am&255](az)|0}else{c[au>>2]=aA+1}au=d[F]|0;an=((au&1|0)==0?au>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(aw){aC=(cl[c[(c[az>>2]|0)+36>>2]&255](az)|0)&255}else{aC=a[aA]|0}if(aC<<24>>24!=(a[(a[G]&1)==0?m:c[J>>2]|0]|0)){aa=107;break L2}aw=c[g>>2]|0;au=aw+12|0;am=c[au>>2]|0;if((am|0)==(c[aw+16>>2]|0)){aD=c[(c[aw>>2]|0)+40>>2]|0;cl[aD&255](aw)|0}else{c[au>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(al){if(av){al=(cl[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aE=al;aF=a[G]|0}else{aE=a[at]|0;aF=ag}if(aE<<24>>24!=(a[(aF&1)==0?m:c[J>>2]|0]|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}ag=c[g>>2]|0;al=ag+12|0;am=c[al>>2]|0;if((am|0)==(c[ag+16>>2]|0)){au=c[(c[ag>>2]|0)+40>>2]|0;cl[au&255](ag)|0}else{c[al>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(av){av=(cl[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aG=av;aH=a[F]|0}else{aG=a[at]|0;aH=aj}if(aG<<24>>24!=(a[(aH&1)==0?K:c[M>>2]|0]|0)){a[l]=1;an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}aj=c[g>>2]|0;at=aj+12|0;av=c[at>>2]|0;if((av|0)==(c[aj+16>>2]|0)){ah=c[(c[aj>>2]|0)+40>>2]|0;cl[ah&255](aj)|0}else{c[at>>2]=av+1}av=d[F]|0;an=((av&1|0)==0?av>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V}else if(($|0)==2){if(!((r|0)!=0|Y>>>0<2)){if((Y|0)==2){aI=(a[T]|0)!=0}else{aI=0}if(!(N|aI)){an=0;ao=D;ap=X;aq=W;ar=p;as=V;break}}av=a[E]|0;at=(av&1)==0?j:c[P>>2]|0;L98:do{if((Y|0)==0){aJ=at}else{if((d[s+(Y-1)|0]|0)>=2){aJ=at;break}aj=av&255;ah=at+((aj&1|0)==0?aj>>>1:c[O>>2]|0)|0;aj=at;while(1){if((aj|0)==(ah|0)){aK=ah;break}am=a[aj]|0;if(am<<24>>24<=-1){aK=aj;break}if((b[(c[f>>2]|0)+(am<<24>>24<<1)>>1]&8192)==0){aK=aj;break}else{aj=aj+1|0}}aj=aK-at|0;ah=a[H]|0;am=ah&255;al=(am&1|0)==0?am>>>1:c[R>>2]|0;if(aj>>>0>al>>>0){aJ=at;break}am=(ah&1)==0?Q:c[S>>2]|0;ah=am+al|0;if((aK|0)==(at|0)){aJ=at;break}ag=at;au=am+(al-aj)|0;while(1){if((a[au]|0)!=(a[ag]|0)){aJ=at;break L98}aj=au+1|0;if((aj|0)==(ah|0)){aJ=aK;break}else{ag=ag+1|0;au=aj}}}}while(0);au=av&255;L112:do{if((aJ|0)==(at+((au&1|0)==0?au>>>1:c[O>>2]|0)|0)){aL=aJ}else{ag=ab;ah=aJ;while(1){aj=c[g>>2]|0;do{if((aj|0)==0){aM=0}else{if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){aM=aj;break}if((cl[c[(c[aj>>2]|0)+36>>2]&255](aj)|0)==-1){c[g>>2]=0;aM=0;break}else{aM=c[g>>2]|0;break}}}while(0);aj=(aM|0)==0;do{if((ag|0)==0){aa=136}else{if((c[ag+12>>2]|0)!=(c[ag+16>>2]|0)){if(aj){aN=ag;break}else{aL=ah;break L112}}if((cl[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)==-1){c[e>>2]=0;aa=136;break}else{if(aj){aN=ag;break}else{aL=ah;break L112}}}}while(0);if((aa|0)==136){aa=0;if(aj){aL=ah;break L112}else{aN=0}}al=c[g>>2]|0;am=c[al+12>>2]|0;if((am|0)==(c[al+16>>2]|0)){aO=(cl[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aO=a[am]|0}if(aO<<24>>24!=(a[ah]|0)){aL=ah;break L112}am=c[g>>2]|0;al=am+12|0;aw=c[al>>2]|0;if((aw|0)==(c[am+16>>2]|0)){aD=c[(c[am>>2]|0)+40>>2]|0;cl[aD&255](am)|0}else{c[al>>2]=aw+1}aw=ah+1|0;al=a[E]|0;am=al&255;if((aw|0)==(((al&1)==0?j:c[P>>2]|0)+((am&1|0)==0?am>>>1:c[O>>2]|0)|0)){aL=aw;break}else{ag=aN;ah=aw}}}}while(0);if(!N){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}au=a[E]|0;at=au&255;if((aL|0)==(((au&1)==0?j:c[P>>2]|0)+((at&1|0)==0?at>>>1:c[O>>2]|0)|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V}else{aa=149;break L2}}else if(($|0)==4){at=0;au=D;av=X;ah=W;ag=p;aw=V;L147:while(1){am=c[g>>2]|0;do{if((am|0)==0){aP=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aP=am;break}if((cl[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;aP=0;break}else{aP=c[g>>2]|0;break}}}while(0);am=(aP|0)==0;al=c[e>>2]|0;do{if((al|0)==0){aa=162}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){if(am){break}else{break L147}}if((cl[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[e>>2]=0;aa=162;break}else{if(am){break}else{break L147}}}}while(0);if((aa|0)==162){aa=0;if(am){break}}al=c[g>>2]|0;aD=c[al+12>>2]|0;if((aD|0)==(c[al+16>>2]|0)){aQ=(cl[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aQ=a[aD]|0}do{if(aQ<<24>>24>-1){if((b[(c[f>>2]|0)+(aQ<<24>>24<<1)>>1]&2048)==0){aa=181;break}aD=c[o>>2]|0;if((aD|0)==(aw|0)){al=(c[U>>2]|0)!=182;aR=c[h>>2]|0;aS=aw-aR|0;aT=aS>>>0<2147483647?aS<<1:-1;aU=lg(al?aR:0,aT)|0;if((aU|0)==0){lt()}do{if(al){c[h>>2]=aU;aV=aU}else{aR=c[h>>2]|0;c[h>>2]=aU;if((aR|0)==0){aV=aU;break}ch[c[U>>2]&511](aR);aV=c[h>>2]|0}}while(0);c[U>>2]=90;aU=aV+aS|0;c[o>>2]=aU;aW=(c[h>>2]|0)+aT|0;aX=aU}else{aW=aw;aX=aD}c[o>>2]=aX+1;a[aX]=aQ;aY=at+1|0;aZ=au;a_=av;a$=ah;a0=ag;a1=aW}else{aa=181}}while(0);if((aa|0)==181){aa=0;am=d[w]|0;if((((am&1|0)==0?am>>>1:c[n>>2]|0)|0)==0|(at|0)==0){break}if(aQ<<24>>24!=(a[u]|0)){break}if((av|0)==(au|0)){am=av-ah|0;aU=am>>>0<2147483647?am<<1:-1;if((ag|0)==182){a2=0}else{a2=ah}al=lg(a2,aU)|0;aj=al;if((al|0)==0){lt()}a3=aj+(aU>>>2<<2)|0;a4=aj+(am>>2<<2)|0;a5=aj;a6=90}else{a3=au;a4=av;a5=ah;a6=ag}c[a4>>2]=at;aY=0;aZ=a3;a_=a4+4|0;a$=a5;a0=a6;a1=aw}aj=c[g>>2]|0;am=aj+12|0;aU=c[am>>2]|0;if((aU|0)==(c[aj+16>>2]|0)){al=c[(c[aj>>2]|0)+40>>2]|0;cl[al&255](aj)|0;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}else{c[am>>2]=aU+1;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}}if((ah|0)==(av|0)|(at|0)==0){a7=au;a8=av;a9=ah;ba=ag}else{if((av|0)==(au|0)){aU=av-ah|0;am=aU>>>0<2147483647?aU<<1:-1;if((ag|0)==182){bb=0}else{bb=ah}aj=lg(bb,am)|0;al=aj;if((aj|0)==0){lt()}bc=al+(am>>>2<<2)|0;bd=al+(aU>>2<<2)|0;be=al;bf=90}else{bc=au;bd=av;be=ah;bf=ag}c[bd>>2]=at;a7=bc;a8=bd+4|0;a9=be;ba=bf}if((c[B>>2]|0)>0){al=c[g>>2]|0;do{if((al|0)==0){bg=0}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){bg=al;break}if((cl[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[g>>2]=0;bg=0;break}else{bg=c[g>>2]|0;break}}}while(0);al=(bg|0)==0;at=c[e>>2]|0;do{if((at|0)==0){aa=214}else{if((c[at+12>>2]|0)!=(c[at+16>>2]|0)){if(al){bh=at;break}else{aa=221;break L2}}if((cl[c[(c[at>>2]|0)+36>>2]&255](at)|0)==-1){c[e>>2]=0;aa=214;break}else{if(al){bh=at;break}else{aa=221;break L2}}}}while(0);if((aa|0)==214){aa=0;if(al){aa=221;break L2}else{bh=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bi=(cl[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bi=a[ag]|0}if(bi<<24>>24!=(a[t]|0)){aa=221;break L2}ag=c[g>>2]|0;at=ag+12|0;ah=c[at>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){av=c[(c[ag>>2]|0)+40>>2]|0;cl[av&255](ag)|0;bj=aw;bk=bh}else{c[at>>2]=ah+1;bj=aw;bk=bh}while(1){ah=c[g>>2]|0;do{if((ah|0)==0){bl=0}else{if((c[ah+12>>2]|0)!=(c[ah+16>>2]|0)){bl=ah;break}if((cl[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)==-1){c[g>>2]=0;bl=0;break}else{bl=c[g>>2]|0;break}}}while(0);ah=(bl|0)==0;do{if((bk|0)==0){aa=237}else{if((c[bk+12>>2]|0)!=(c[bk+16>>2]|0)){if(ah){bm=bk;break}else{aa=245;break L2}}if((cl[c[(c[bk>>2]|0)+36>>2]&255](bk)|0)==-1){c[e>>2]=0;aa=237;break}else{if(ah){bm=bk;break}else{aa=245;break L2}}}}while(0);if((aa|0)==237){aa=0;if(ah){aa=245;break L2}else{bm=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bn=(cl[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bn=a[ag]|0}if(bn<<24>>24<=-1){aa=245;break L2}if((b[(c[f>>2]|0)+(bn<<24>>24<<1)>>1]&2048)==0){aa=245;break L2}ag=c[o>>2]|0;if((ag|0)==(bj|0)){at=(c[U>>2]|0)!=182;av=c[h>>2]|0;au=bj-av|0;aU=au>>>0<2147483647?au<<1:-1;am=lg(at?av:0,aU)|0;if((am|0)==0){lt()}do{if(at){c[h>>2]=am;bo=am}else{av=c[h>>2]|0;c[h>>2]=am;if((av|0)==0){bo=am;break}ch[c[U>>2]&511](av);bo=c[h>>2]|0}}while(0);c[U>>2]=90;am=bo+au|0;c[o>>2]=am;bp=(c[h>>2]|0)+aU|0;bq=am}else{bp=bj;bq=ag}am=c[g>>2]|0;at=c[am+12>>2]|0;if((at|0)==(c[am+16>>2]|0)){ah=(cl[c[(c[am>>2]|0)+36>>2]&255](am)|0)&255;br=ah;bs=c[o>>2]|0}else{br=a[at]|0;bs=bq}c[o>>2]=bs+1;a[bs]=br;at=(c[B>>2]|0)-1|0;c[B>>2]=at;ah=c[g>>2]|0;am=ah+12|0;av=c[am>>2]|0;if((av|0)==(c[ah+16>>2]|0)){aj=c[(c[ah>>2]|0)+40>>2]|0;cl[aj&255](ah)|0}else{c[am>>2]=av+1}if((at|0)>0){bj=bp;bk=bm}else{bt=bp;break}}}else{bt=aw}if((c[o>>2]|0)==(c[h>>2]|0)){aa=265;break L2}else{an=r;ao=a7;ap=a8;aq=a9;ar=ba;as=bt}}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V}}while(0);L301:do{if((aa|0)==41){aa=0;if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=267;break L2}else{bu=ab}while(1){$=c[g>>2]|0;do{if(($|0)==0){bv=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){bv=$;break}if((cl[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[g>>2]=0;bv=0;break}else{bv=c[g>>2]|0;break}}}while(0);$=(bv|0)==0;do{if((bu|0)==0){aa=54}else{if((c[bu+12>>2]|0)!=(c[bu+16>>2]|0)){if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L301}}if((cl[c[(c[bu>>2]|0)+36>>2]&255](bu)|0)==-1){c[e>>2]=0;aa=54;break}else{if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L301}}}}while(0);if((aa|0)==54){aa=0;if($){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L301}else{bw=0}}ag=c[g>>2]|0;aU=c[ag+12>>2]|0;if((aU|0)==(c[ag+16>>2]|0)){bx=(cl[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{bx=a[aU]|0}if(bx<<24>>24<=-1){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L301}if((b[(c[f>>2]|0)+(bx<<24>>24<<1)>>1]&8192)==0){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L301}aU=c[g>>2]|0;ag=aU+12|0;au=c[ag>>2]|0;if((au|0)==(c[aU+16>>2]|0)){by=(cl[c[(c[aU>>2]|0)+40>>2]&255](aU)|0)&255}else{c[ag>>2]=au+1;by=a[au]|0}eo(A,by);bu=bw}}}while(0);aw=Y+1|0;if(aw>>>0<4){V=as;p=ar;W=aq;X=ap;D=ao;r=an;Y=aw}else{ac=ar;ad=aq;ae=ap;af=an;aa=267;break}}L338:do{if((aa|0)==40){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==107){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==149){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==221){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==245){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==265){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==267){L346:do{if((af|0)!=0){an=af;ap=af+1|0;aq=af+8|0;ar=af+4|0;Y=1;L348:while(1){r=d[an]|0;if((r&1|0)==0){bC=r>>>1}else{bC=c[ar>>2]|0}if(Y>>>0>=bC>>>0){break L346}r=c[g>>2]|0;do{if((r|0)==0){bD=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){bD=r;break}if((cl[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[g>>2]=0;bD=0;break}else{bD=c[g>>2]|0;break}}}while(0);r=(bD|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=285}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(r){break}else{break L348}}if((cl[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=285;break}else{if(r){break}else{break L348}}}}while(0);if((aa|0)==285){aa=0;if(r){break}}$=c[g>>2]|0;ao=c[$+12>>2]|0;if((ao|0)==(c[$+16>>2]|0)){bE=(cl[c[(c[$>>2]|0)+36>>2]&255]($)|0)&255}else{bE=a[ao]|0}if((a[an]&1)==0){bF=ap}else{bF=c[aq>>2]|0}if(bE<<24>>24!=(a[bF+Y|0]|0)){break}ao=Y+1|0;$=c[g>>2]|0;D=$+12|0;X=c[D>>2]|0;if((X|0)==(c[$+16>>2]|0)){as=c[(c[$>>2]|0)+40>>2]|0;cl[as&255]($)|0;Y=ao;continue}else{c[D>>2]=X+1;Y=ao;continue}}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac;break L338}}while(0);if((ad|0)==(ae|0)){bz=1;bA=ae;bB=ac;break}c[C>>2]=0;f$(v,ad,ae,C);if((c[C>>2]|0)==0){bz=1;bA=ad;bB=ac;break}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac}}while(0);ed(A);ed(z);ed(y);ed(x);ed(v);if((bA|0)==0){i=q;return bz|0}ch[bB&511](bA);i=q;return bz|0}function io(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){ev(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function ip(a){a=a|0;dt(a|0);lo(a);return}function iq(a){a=a|0;dt(a|0);return}function ir(a){a=a|0;var b=0;b=b5(8)|0;d2(b,a);bw(b|0,9448,24)}function is(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+160|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=182;u=m+100|0;eR(p,h);m=p|0;v=c[m>>2]|0;if((c[3642]|0)!=-1){c[l>>2]=14568;c[l+4>>2]=12;c[l+8>>2]=0;eg(14568,l,104)}l=(c[3643]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(im(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){a[k+1|0]=0;a[B]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){eo(k,cj[c[(c[B>>2]|0)+28>>2]&63](y,45)|0)}x=cj[c[(c[B>>2]|0)+28>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-1|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((a[C]|0)==x<<24>>24){C=C+1|0}else{break}}io(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){D=B;break}if((cl[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){E=365}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){break}else{E=367;break}}if((cl[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[z>>2]=0;E=365;break}else{if(x^(A|0)==0){break}else{E=367;break}}}}while(0);if((E|0)==365){if(x){E=367}}if((E|0)==367){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;dT(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}ch[c[t>>2]&511](A);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function it(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3760]|0)!=-1){c[p>>2]=15040;c[p+4>>2]=12;c[p+8>>2]=0;eg(15040,p,104)}p=(c[3761]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=b5(4)|0;L=K;kV(L);bw(K|0,9432,148)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=b5(4)|0;L=K;kV(L);bw(K|0,9432,148)}K=b;ci[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;ci[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){a[l+1|0]=0;a[q]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}et(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];lu(s|0,0,12);ed(r);ci[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}et(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];lu(u|0,0,12);ed(t);t=b;a[f]=cl[c[(c[t>>2]|0)+12>>2]&255](K)|0;a[g]=cl[c[(c[t>>2]|0)+16>>2]&255](K)|0;ci[c[(c[L>>2]|0)+20>>2]&127](v,K);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}et(h,0);c[t>>2]=c[w>>2];c[t+4>>2]=c[w+4>>2];c[t+8>>2]=c[w+8>>2];lu(w|0,0,12);ed(v);ci[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}et(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];lu(y|0,0,12);ed(x);M=cl[c[(c[b>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3762]|0)!=-1){c[o>>2]=15048;c[o+4>>2]=12;c[o+8>>2]=0;eg(15048,o,104)}o=(c[3763]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=b5(4)|0;O=N;kV(O);bw(N|0,9432,148)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=b5(4)|0;O=N;kV(O);bw(N|0,9432,148)}N=K;ci[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;ci[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){a[l+1|0]=0;a[z]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}et(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];lu(B|0,0,12);ed(A);ci[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}et(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];lu(E|0,0,12);ed(D);D=K;a[f]=cl[c[(c[D>>2]|0)+12>>2]&255](N)|0;a[g]=cl[c[(c[D>>2]|0)+16>>2]&255](N)|0;ci[c[(c[O>>2]|0)+20>>2]&127](F,N);D=h;if((a[D]&1)==0){a[h+1|0]=0;a[D]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}et(h,0);c[D>>2]=c[G>>2];c[D+4>>2]=c[G+4>>2];c[D+8>>2]=c[G+8>>2];lu(G|0,0,12);ed(F);ci[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){a[j+1|0]=0;a[O]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}et(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];lu(I|0,0,12);ed(H);M=cl[c[(c[K>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function iu(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+600|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=d+496|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=182;w=m+400|0;eR(p,h);m=p|0;x=c[m>>2]|0;if((c[3640]|0)!=-1){c[l>>2]=14560;c[l+4>>2]=12;c[l+8>>2]=0;eg(14560,l,104)}l=(c[3641]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2];do{if(iv(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+48>>2]|0;cv[E&15](A,2840,2850,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>392){I=le((H>>2)+2|0)|0;if((I|0)!=0){J=I;K=I;break}lt();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+40|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((c[O>>2]|0)==(c[N>>2]|0)){P=O;break}else{O=O+4|0}}a[M]=a[2840+(P-I>>2)|0]|0;O=N+4|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((bV(E|0,1952,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((K|0)==0){break}lf(K);break}N=b5(8)|0;d2(N,1872);bw(N|0,9448,24)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){T=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{T=c[N>>2]|0}if((T|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[C>>2]|0;do{if((z|0)==0){U=483}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){V=cl[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{V=c[N>>2]|0}if((V|0)==-1){c[C>>2]=0;U=483;break}else{if(A^(z|0)==0){break}else{U=485;break}}}}while(0);if((U|0)==483){if(A){U=485}}if((U|0)==485){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;dT(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}ch[c[v>>2]&511](z);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function iv(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0;p=i;i=i+448|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2];q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;lu(w|0,0,12);D=x;E=y;F=z;G=A;lu(D|0,0,12);lu(E|0,0,12);lu(F|0,0,12);lu(G|0,0,12);iz(f,g,s,t,u,v,x,y,z,B);g=m|0;c[n>>2]=c[g>>2];f=b|0;b=e|0;e=l;H=z+4|0;I=z+8|0;J=y+4|0;K=y+8|0;L=(h&512|0)!=0;h=x+4|0;M=x+8|0;N=A+4|0;O=A+8|0;P=s+3|0;Q=v+4|0;R=182;S=o;T=o;o=r+400|0;r=0;U=0;L606:while(1){V=c[f>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=cl[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[f>>2]=0;W=1;break}else{W=(c[f>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=511}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=cl[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=511;break}else{if(W^(V|0)==0){$=V;break}else{aa=R;ab=S;ac=T;ad=r;Z=751;break L606}}}}while(0);if((Z|0)==511){Z=0;if(W){aa=R;ab=S;ac=T;ad=r;Z=751;break}else{$=0}}V=a[s+U|0]|0;L630:do{if((V|0)==4){X=0;ae=o;af=T;ag=S;ah=R;L631:while(1){ai=c[f>>2]|0;do{if((ai|0)==0){aj=1}else{ak=c[ai+12>>2]|0;if((ak|0)==(c[ai+16>>2]|0)){al=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{al=c[ak>>2]|0}if((al|0)==-1){c[f>>2]=0;aj=1;break}else{aj=(c[f>>2]|0)==0;break}}}while(0);ai=c[b>>2]|0;do{if((ai|0)==0){Z=659}else{ak=c[ai+12>>2]|0;if((ak|0)==(c[ai+16>>2]|0)){am=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{am=c[ak>>2]|0}if((am|0)==-1){c[b>>2]=0;Z=659;break}else{if(aj^(ai|0)==0){break}else{break L631}}}}while(0);if((Z|0)==659){Z=0;if(aj){break}}ai=c[f>>2]|0;ak=c[ai+12>>2]|0;if((ak|0)==(c[ai+16>>2]|0)){an=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{an=c[ak>>2]|0}if(cm[c[(c[e>>2]|0)+12>>2]&63](l,2048,an)|0){ak=c[n>>2]|0;if((ak|0)==(c[q>>2]|0)){iA(m,n,q);ao=c[n>>2]|0}else{ao=ak}c[n>>2]=ao+4;c[ao>>2]=an;ap=X+1|0;aq=ae;ar=af;as=ag;at=ah}else{ak=d[w]|0;if((((ak&1|0)==0?ak>>>1:c[Q>>2]|0)|0)==0|(X|0)==0){break}if((an|0)!=(c[u>>2]|0)){break}if((af|0)==(ae|0)){ak=(ah|0)!=182;ai=af-ag|0;au=ai>>>0<2147483647?ai<<1:-1;if(ak){av=ag}else{av=0}ak=lg(av,au)|0;aw=ak;if((ak|0)==0){lt()}ax=aw+(au>>>2<<2)|0;ay=aw+(ai>>2<<2)|0;az=aw;aA=90}else{ax=ae;ay=af;az=ag;aA=ah}c[ay>>2]=X;ap=0;aq=ax;ar=ay+4|0;as=az;at=aA}aw=c[f>>2]|0;ai=aw+12|0;au=c[ai>>2]|0;if((au|0)==(c[aw+16>>2]|0)){ak=c[(c[aw>>2]|0)+40>>2]|0;cl[ak&255](aw)|0;X=ap;ae=aq;af=ar;ag=as;ah=at;continue}else{c[ai>>2]=au+4;X=ap;ae=aq;af=ar;ag=as;ah=at;continue}}if((ag|0)==(af|0)|(X|0)==0){aB=ae;aC=af;aD=ag;aE=ah}else{if((af|0)==(ae|0)){au=(ah|0)!=182;ai=af-ag|0;aw=ai>>>0<2147483647?ai<<1:-1;if(au){aF=ag}else{aF=0}au=lg(aF,aw)|0;ak=au;if((au|0)==0){lt()}aG=ak+(aw>>>2<<2)|0;aH=ak+(ai>>2<<2)|0;aI=ak;aJ=90}else{aG=ae;aH=af;aI=ag;aJ=ah}c[aH>>2]=X;aB=aG;aC=aH+4|0;aD=aI;aE=aJ}ak=c[B>>2]|0;if((ak|0)>0){ai=c[f>>2]|0;do{if((ai|0)==0){aK=1}else{aw=c[ai+12>>2]|0;if((aw|0)==(c[ai+16>>2]|0)){aL=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{aL=c[aw>>2]|0}if((aL|0)==-1){c[f>>2]=0;aK=1;break}else{aK=(c[f>>2]|0)==0;break}}}while(0);ai=c[b>>2]|0;do{if((ai|0)==0){Z=708}else{X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){aM=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{aM=c[X>>2]|0}if((aM|0)==-1){c[b>>2]=0;Z=708;break}else{if(aK^(ai|0)==0){aN=ai;break}else{Z=714;break L606}}}}while(0);if((Z|0)==708){Z=0;if(aK){Z=714;break L606}else{aN=0}}ai=c[f>>2]|0;X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){aO=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{aO=c[X>>2]|0}if((aO|0)!=(c[t>>2]|0)){Z=714;break L606}X=c[f>>2]|0;ai=X+12|0;ah=c[ai>>2]|0;if((ah|0)==(c[X+16>>2]|0)){ag=c[(c[X>>2]|0)+40>>2]|0;cl[ag&255](X)|0;aP=aN;aQ=ak}else{c[ai>>2]=ah+4;aP=aN;aQ=ak}while(1){ah=c[f>>2]|0;do{if((ah|0)==0){aR=1}else{ai=c[ah+12>>2]|0;if((ai|0)==(c[ah+16>>2]|0)){aS=cl[c[(c[ah>>2]|0)+36>>2]&255](ah)|0}else{aS=c[ai>>2]|0}if((aS|0)==-1){c[f>>2]=0;aR=1;break}else{aR=(c[f>>2]|0)==0;break}}}while(0);do{if((aP|0)==0){Z=731}else{ah=c[aP+12>>2]|0;if((ah|0)==(c[aP+16>>2]|0)){aT=cl[c[(c[aP>>2]|0)+36>>2]&255](aP)|0}else{aT=c[ah>>2]|0}if((aT|0)==-1){c[b>>2]=0;Z=731;break}else{if(aR^(aP|0)==0){aU=aP;break}else{Z=738;break L606}}}}while(0);if((Z|0)==731){Z=0;if(aR){Z=738;break L606}else{aU=0}}ah=c[f>>2]|0;ai=c[ah+12>>2]|0;if((ai|0)==(c[ah+16>>2]|0)){aV=cl[c[(c[ah>>2]|0)+36>>2]&255](ah)|0}else{aV=c[ai>>2]|0}if(!(cm[c[(c[e>>2]|0)+12>>2]&63](l,2048,aV)|0)){Z=738;break L606}if((c[n>>2]|0)==(c[q>>2]|0)){iA(m,n,q)}ai=c[f>>2]|0;ah=c[ai+12>>2]|0;if((ah|0)==(c[ai+16>>2]|0)){aW=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{aW=c[ah>>2]|0}ah=c[n>>2]|0;c[n>>2]=ah+4;c[ah>>2]=aW;ah=aQ-1|0;c[B>>2]=ah;ai=c[f>>2]|0;X=ai+12|0;ag=c[X>>2]|0;if((ag|0)==(c[ai+16>>2]|0)){af=c[(c[ai>>2]|0)+40>>2]|0;cl[af&255](ai)|0}else{c[X>>2]=ag+4}if((ah|0)>0){aP=aU;aQ=ah}else{break}}}if((c[n>>2]|0)==(c[g>>2]|0)){Z=749;break L606}else{aX=r;aY=aB;aZ=aC;a_=aD;a$=aE}}else if((V|0)==1){if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=751;break L606}ak=c[f>>2]|0;ah=c[ak+12>>2]|0;if((ah|0)==(c[ak+16>>2]|0)){a0=cl[c[(c[ak>>2]|0)+36>>2]&255](ak)|0}else{a0=c[ah>>2]|0}if(!(cm[c[(c[e>>2]|0)+12>>2]&63](l,8192,a0)|0)){Z=535;break L606}ah=c[f>>2]|0;ak=ah+12|0;ag=c[ak>>2]|0;if((ag|0)==(c[ah+16>>2]|0)){a1=cl[c[(c[ah>>2]|0)+40>>2]&255](ah)|0}else{c[ak>>2]=ag+4;a1=c[ag>>2]|0}eP(A,a1);Z=536}else if((V|0)==0){Z=536}else if((V|0)==2){if(!((r|0)!=0|U>>>0<2)){if((U|0)==2){a2=(a[P]|0)!=0}else{a2=0}if(!(L|a2)){aX=0;aY=o;aZ=T;a_=S;a$=R;break}}ag=a[D]|0;ak=(ag&1)==0?h:c[M>>2]|0;L794:do{if((U|0)==0){a3=ak;a4=ag;a5=$}else{if((d[s+(U-1)|0]|0)<2){a6=ak;a7=ag}else{a3=ak;a4=ag;a5=$;break}while(1){ah=a7&255;if((a6|0)==(((a7&1)==0?h:c[M>>2]|0)+(((ah&1|0)==0?ah>>>1:c[h>>2]|0)<<2)|0)){a8=a7;break}if(!(cm[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[a6>>2]|0)|0)){Z=612;break}a6=a6+4|0;a7=a[D]|0}if((Z|0)==612){Z=0;a8=a[D]|0}ah=(a8&1)==0;X=a6-(ah?h:c[M>>2]|0)>>2;ai=a[G]|0;af=ai&255;ae=(af&1|0)==0;L804:do{if(X>>>0<=(ae?af>>>1:c[N>>2]|0)>>>0){aw=(ai&1)==0;au=(aw?N:c[O>>2]|0)+((ae?af>>>1:c[N>>2]|0)-X<<2)|0;a9=(aw?N:c[O>>2]|0)+((ae?af>>>1:c[N>>2]|0)<<2)|0;if((au|0)==(a9|0)){a3=a6;a4=a8;a5=$;break L794}else{ba=au;bb=ah?h:c[M>>2]|0}while(1){if((c[ba>>2]|0)!=(c[bb>>2]|0)){break L804}au=ba+4|0;if((au|0)==(a9|0)){a3=a6;a4=a8;a5=$;break L794}ba=au;bb=bb+4|0}}}while(0);a3=ah?h:c[M>>2]|0;a4=a8;a5=$}}while(0);L811:while(1){ag=a4&255;if((a3|0)==(((a4&1)==0?h:c[M>>2]|0)+(((ag&1|0)==0?ag>>>1:c[h>>2]|0)<<2)|0)){break}ag=c[f>>2]|0;do{if((ag|0)==0){bc=1}else{ak=c[ag+12>>2]|0;if((ak|0)==(c[ag+16>>2]|0)){bd=cl[c[(c[ag>>2]|0)+36>>2]&255](ag)|0}else{bd=c[ak>>2]|0}if((bd|0)==-1){c[f>>2]=0;bc=1;break}else{bc=(c[f>>2]|0)==0;break}}}while(0);do{if((a5|0)==0){Z=633}else{ag=c[a5+12>>2]|0;if((ag|0)==(c[a5+16>>2]|0)){be=cl[c[(c[a5>>2]|0)+36>>2]&255](a5)|0}else{be=c[ag>>2]|0}if((be|0)==-1){c[b>>2]=0;Z=633;break}else{if(bc^(a5|0)==0){bf=a5;break}else{break L811}}}}while(0);if((Z|0)==633){Z=0;if(bc){break}else{bf=0}}ag=c[f>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){bg=cl[c[(c[ag>>2]|0)+36>>2]&255](ag)|0}else{bg=c[ah>>2]|0}if((bg|0)!=(c[a3>>2]|0)){break}ah=c[f>>2]|0;ag=ah+12|0;ak=c[ag>>2]|0;if((ak|0)==(c[ah+16>>2]|0)){af=c[(c[ah>>2]|0)+40>>2]|0;cl[af&255](ah)|0}else{c[ag>>2]=ak+4}a3=a3+4|0;a4=a[D]|0;a5=bf}if(!L){aX=r;aY=o;aZ=T;a_=S;a$=R;break}ak=a[D]|0;ag=ak&255;if((a3|0)==(((ak&1)==0?h:c[M>>2]|0)+(((ag&1|0)==0?ag>>>1:c[h>>2]|0)<<2)|0)){aX=r;aY=o;aZ=T;a_=S;a$=R}else{Z=645;break L606}}else if((V|0)==3){ag=a[E]|0;ak=ag&255;ah=(ak&1|0)==0;af=a[F]|0;ae=af&255;X=(ae&1|0)==0;if(((ah?ak>>>1:c[J>>2]|0)|0)==(-(X?ae>>>1:c[H>>2]|0)|0)){aX=r;aY=o;aZ=T;a_=S;a$=R;break}do{if(((ah?ak>>>1:c[J>>2]|0)|0)!=0){if(((X?ae>>>1:c[H>>2]|0)|0)==0){break}ai=c[f>>2]|0;a9=c[ai+12>>2]|0;if((a9|0)==(c[ai+16>>2]|0)){au=cl[c[(c[ai>>2]|0)+36>>2]&255](ai)|0;bh=au;bi=a[E]|0}else{bh=c[a9>>2]|0;bi=ag}a9=c[f>>2]|0;au=a9+12|0;ai=c[au>>2]|0;aw=(ai|0)==(c[a9+16>>2]|0);if((bh|0)==(c[((bi&1)==0?J:c[K>>2]|0)>>2]|0)){if(aw){bj=c[(c[a9>>2]|0)+40>>2]|0;cl[bj&255](a9)|0}else{c[au>>2]=ai+4}au=d[E]|0;aX=((au&1|0)==0?au>>>1:c[J>>2]|0)>>>0>1?y:r;aY=o;aZ=T;a_=S;a$=R;break L630}if(aw){bk=cl[c[(c[a9>>2]|0)+36>>2]&255](a9)|0}else{bk=c[ai>>2]|0}if((bk|0)!=(c[((a[F]&1)==0?H:c[I>>2]|0)>>2]|0)){Z=601;break L606}ai=c[f>>2]|0;a9=ai+12|0;aw=c[a9>>2]|0;if((aw|0)==(c[ai+16>>2]|0)){au=c[(c[ai>>2]|0)+40>>2]|0;cl[au&255](ai)|0}else{c[a9>>2]=aw+4}a[k]=1;aw=d[F]|0;aX=((aw&1|0)==0?aw>>>1:c[H>>2]|0)>>>0>1?z:r;aY=o;aZ=T;a_=S;a$=R;break L630}}while(0);ae=c[f>>2]|0;X=c[ae+12>>2]|0;aw=(X|0)==(c[ae+16>>2]|0);if(((ah?ak>>>1:c[J>>2]|0)|0)==0){if(aw){a9=cl[c[(c[ae>>2]|0)+36>>2]&255](ae)|0;bl=a9;bm=a[F]|0}else{bl=c[X>>2]|0;bm=af}if((bl|0)!=(c[((bm&1)==0?H:c[I>>2]|0)>>2]|0)){aX=r;aY=o;aZ=T;a_=S;a$=R;break}a9=c[f>>2]|0;ai=a9+12|0;au=c[ai>>2]|0;if((au|0)==(c[a9+16>>2]|0)){bj=c[(c[a9>>2]|0)+40>>2]|0;cl[bj&255](a9)|0}else{c[ai>>2]=au+4}a[k]=1;au=d[F]|0;aX=((au&1|0)==0?au>>>1:c[H>>2]|0)>>>0>1?z:r;aY=o;aZ=T;a_=S;a$=R;break}if(aw){aw=cl[c[(c[ae>>2]|0)+36>>2]&255](ae)|0;bn=aw;bo=a[E]|0}else{bn=c[X>>2]|0;bo=ag}if((bn|0)!=(c[((bo&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;aX=r;aY=o;aZ=T;a_=S;a$=R;break}X=c[f>>2]|0;aw=X+12|0;ae=c[aw>>2]|0;if((ae|0)==(c[X+16>>2]|0)){au=c[(c[X>>2]|0)+40>>2]|0;cl[au&255](X)|0}else{c[aw>>2]=ae+4}ae=d[E]|0;aX=((ae&1|0)==0?ae>>>1:c[J>>2]|0)>>>0>1?y:r;aY=o;aZ=T;a_=S;a$=R}else{aX=r;aY=o;aZ=T;a_=S;a$=R}}while(0);L899:do{if((Z|0)==536){Z=0;if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=751;break L606}else{bp=$}while(1){V=c[f>>2]|0;do{if((V|0)==0){bq=1}else{ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){br=cl[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{br=c[ae>>2]|0}if((br|0)==-1){c[f>>2]=0;bq=1;break}else{bq=(c[f>>2]|0)==0;break}}}while(0);do{if((bp|0)==0){Z=550}else{V=c[bp+12>>2]|0;if((V|0)==(c[bp+16>>2]|0)){bs=cl[c[(c[bp>>2]|0)+36>>2]&255](bp)|0}else{bs=c[V>>2]|0}if((bs|0)==-1){c[b>>2]=0;Z=550;break}else{if(bq^(bp|0)==0){bt=bp;break}else{aX=r;aY=o;aZ=T;a_=S;a$=R;break L899}}}}while(0);if((Z|0)==550){Z=0;if(bq){aX=r;aY=o;aZ=T;a_=S;a$=R;break L899}else{bt=0}}V=c[f>>2]|0;ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bu=cl[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bu=c[ae>>2]|0}if(!(cm[c[(c[e>>2]|0)+12>>2]&63](l,8192,bu)|0)){aX=r;aY=o;aZ=T;a_=S;a$=R;break L899}ae=c[f>>2]|0;V=ae+12|0;aw=c[V>>2]|0;if((aw|0)==(c[ae+16>>2]|0)){bv=cl[c[(c[ae>>2]|0)+40>>2]&255](ae)|0}else{c[V>>2]=aw+4;bv=c[aw>>2]|0}eP(A,bv);bp=bt}}}while(0);ag=U+1|0;if(ag>>>0<4){R=a$;S=a_;T=aZ;o=aY;r=aX;U=ag}else{aa=a$;ab=a_;ac=aZ;ad=aX;Z=751;break}}L936:do{if((Z|0)==645){c[j>>2]=c[j>>2]|4;bw=0;bx=S;by=R}else if((Z|0)==714){c[j>>2]=c[j>>2]|4;bw=0;bx=aD;by=aE}else if((Z|0)==738){c[j>>2]=c[j>>2]|4;bw=0;bx=aD;by=aE}else if((Z|0)==749){c[j>>2]=c[j>>2]|4;bw=0;bx=aD;by=aE}else if((Z|0)==751){L942:do{if((ad|0)!=0){aX=ad;aZ=ad+4|0;a_=ad+8|0;a$=1;L944:while(1){U=d[aX]|0;if((U&1|0)==0){bz=U>>>1}else{bz=c[aZ>>2]|0}if(a$>>>0>=bz>>>0){break L942}U=c[f>>2]|0;do{if((U|0)==0){bA=1}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bB=cl[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bB=c[r>>2]|0}if((bB|0)==-1){c[f>>2]=0;bA=1;break}else{bA=(c[f>>2]|0)==0;break}}}while(0);U=c[b>>2]|0;do{if((U|0)==0){Z=770}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bC=cl[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bC=c[r>>2]|0}if((bC|0)==-1){c[b>>2]=0;Z=770;break}else{if(bA^(U|0)==0){break}else{break L944}}}}while(0);if((Z|0)==770){Z=0;if(bA){break}}U=c[f>>2]|0;r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bD=cl[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bD=c[r>>2]|0}if((a[aX]&1)==0){bE=aZ}else{bE=c[a_>>2]|0}if((bD|0)!=(c[bE+(a$<<2)>>2]|0)){break}r=a$+1|0;U=c[f>>2]|0;aY=U+12|0;o=c[aY>>2]|0;if((o|0)==(c[U+16>>2]|0)){T=c[(c[U>>2]|0)+40>>2]|0;cl[T&255](U)|0;a$=r;continue}else{c[aY>>2]=o+4;a$=r;continue}}c[j>>2]=c[j>>2]|4;bw=0;bx=ab;by=aa;break L936}}while(0);if((ab|0)==(ac|0)){bw=1;bx=ac;by=aa;break}c[C>>2]=0;f$(v,ab,ac,C);if((c[C>>2]|0)==0){bw=1;bx=ab;by=aa;break}c[j>>2]=c[j>>2]|4;bw=0;bx=ab;by=aa}else if((Z|0)==535){c[j>>2]=c[j>>2]|4;bw=0;bx=S;by=R}else if((Z|0)==601){c[j>>2]=c[j>>2]|4;bw=0;bx=S;by=R}}while(0);eq(A);eq(z);eq(y);eq(x);ed(v);if((bx|0)==0){i=p;return bw|0}ch[by&511](bx);i=p;return bw|0}function iw(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){e8(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=j+((e-4+(-g|0)|0)>>>2)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function ix(a){a=a|0;dt(a|0);lo(a);return}function iy(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+456|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=182;u=m+400|0;eR(p,h);m=p|0;v=c[m>>2]|0;if((c[3640]|0)!=-1){c[l>>2]=14560;c[l+4>>2]=12;c[l+8>>2]=0;eg(14560,l,104)}l=(c[3641]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(iv(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){c[k+4>>2]=0;a[B]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){eP(k,cj[c[(c[B>>2]|0)+44>>2]&63](y,45)|0)}x=cj[c[(c[B>>2]|0)+44>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-4|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((c[C>>2]|0)==(x|0)){C=C+4|0}else{break}}iw(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){F=cl[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{F=c[E>>2]|0}if((F|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){G=848}else{B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){H=cl[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{H=c[B>>2]|0}if((H|0)==-1){c[z>>2]=0;G=848;break}else{if(x^(A|0)==0){break}else{G=850;break}}}}while(0);if((G|0)==848){if(x){G=850}}if((G|0)==850){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;dT(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}ch[c[t>>2]&511](A);i=d;return}}while(0);d=b5(4)|0;kV(d);bw(d|0,9432,148)}function iz(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3756]|0)!=-1){c[p>>2]=15024;c[p+4>>2]=12;c[p+8>>2]=0;eg(15024,p,104)}p=(c[3757]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=b5(4)|0;L=K;kV(L);bw(K|0,9432,148)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=b5(4)|0;L=K;kV(L);bw(K|0,9432,148)}K=b;ci[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;ci[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){c[l+4>>2]=0;a[q]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}e6(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];lu(s|0,0,12);eq(r);ci[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}e6(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];lu(u|0,0,12);eq(t);t=b;c[f>>2]=cl[c[(c[t>>2]|0)+12>>2]&255](K)|0;c[g>>2]=cl[c[(c[t>>2]|0)+16>>2]&255](K)|0;ci[c[(c[b>>2]|0)+20>>2]&127](v,K);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}et(h,0);c[b>>2]=c[w>>2];c[b+4>>2]=c[w+4>>2];c[b+8>>2]=c[w+8>>2];lu(w|0,0,12);ed(v);ci[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){c[j+4>>2]=0;a[L]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}e6(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];lu(y|0,0,12);eq(x);M=cl[c[(c[t>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3758]|0)!=-1){c[o>>2]=15032;c[o+4>>2]=12;c[o+8>>2]=0;eg(15032,o,104)}o=(c[3759]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=b5(4)|0;O=N;kV(O);bw(N|0,9432,148)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=b5(4)|0;O=N;kV(O);bw(N|0,9432,148)}N=K;ci[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;ci[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){c[l+4>>2]=0;a[z]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}e6(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];lu(B|0,0,12);eq(A);ci[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}e6(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];lu(E|0,0,12);eq(D);D=K;c[f>>2]=cl[c[(c[D>>2]|0)+12>>2]&255](N)|0;c[g>>2]=cl[c[(c[D>>2]|0)+16>>2]&255](N)|0;ci[c[(c[K>>2]|0)+20>>2]&127](F,N);K=h;if((a[K]&1)==0){a[h+1|0]=0;a[K]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}et(h,0);c[K>>2]=c[G>>2];c[K+4>>2]=c[G+4>>2];c[K+8>>2]=c[G+8>>2];lu(G|0,0,12);ed(F);ci[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){c[j+4>>2]=0;a[O]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}e6(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];lu(I|0,0,12);eq(H);M=cl[c[(c[D>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function iA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=182;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=lg(k,j)|0;k=a;if((a|0)==0){lt()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}ch[c[e>>2]&511](a);l=c[g>>2]|0}}while(0);c[e>>2]=90;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function iB(a){a=a|0;dt(a|0);return}function iC(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+280|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+232|0;p=e+240|0;q=e+248|0;r=e+256|0;s=e+264|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+100|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a2(E|0,100,1856,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);E=gN(n,c[3302]|0,1856,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;H=c[n>>2]|0;if((H|0)==0){lt();I=c[n>>2]|0}else{I=H}H=le(E)|0;if((H|0)!=0){J=H;K=E;L=I;M=H;break}lt();J=0;K=E;L=I;M=0}else{J=F;K=G;L=0;M=0}}while(0);eR(o,j);G=o|0;F=c[G>>2]|0;if((c[3642]|0)!=-1){c[m>>2]=14568;c[m+4>>2]=12;c[m+8>>2]=0;eg(14568,m,104)}m=(c[3643]|0)-1|0;I=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-I>>2>>>0>m>>>0){E=c[I+(m<<2)>>2]|0;if((E|0)==0){break}H=E;N=c[n>>2]|0;O=N+K|0;P=c[(c[E>>2]|0)+32>>2]|0;cv[P&15](H,N,O,J)|0;if((K|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}lu(t|0,0,12);lu(v|0,0,12);lu(x|0,0,12);iD(g,Q,o,p,q,r,s,u,w,y);O=z|0;N=c[y>>2]|0;if((K|0)>(N|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(K-N<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+N|0;do{if(P>>>0>100){E=le(P)|0;if((E|0)!=0){W=E;X=E;break}lt();W=0;X=0}else{W=O;X=0}}while(0);iE(W,A,C,c[j+4>>2]|0,J,J+K|0,H,Q,p,a[q]|0,a[r]|0,s,u,w,N);c[D>>2]=c[f>>2];dr(b,D,W,c[A>>2]|0,c[C>>2]|0,j,k);if((X|0)!=0){lf(X)}ed(w);ed(u);ed(s);O=c[G>>2]|0;dT(O)|0;if((M|0)!=0){lf(M)}if((L|0)==0){i=e;return}lf(L);i=e;return}}while(0);e=b5(4)|0;kV(e);bw(e|0,9432,148)}function iD(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3760]|0)!=-1){c[p>>2]=15040;c[p+4>>2]=12;c[p+8>>2]=0;eg(15040,p,104)}p=(c[3761]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=b5(4)|0;R=Q;kV(R);bw(Q|0,9432,148)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=b5(4)|0;R=Q;kV(R);bw(Q|0,9432,148)}Q=e;R=c[e>>2]|0;if(d){ci[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;ci[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){a[l+1|0]=0;a[r]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}et(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];lu(t|0,0,12);ed(s)}else{ci[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;ci[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){a[l+1|0]=0;a[v]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}et(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];lu(x|0,0,12);ed(w)}w=e;a[g]=cl[c[(c[w>>2]|0)+12>>2]&255](Q)|0;a[h]=cl[c[(c[w>>2]|0)+16>>2]&255](Q)|0;w=e;ci[c[(c[w>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}et(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];lu(z|0,0,12);ed(y);ci[c[(c[w>>2]|0)+24>>2]&127](A,Q);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}et(k,0);c[w>>2]=c[B>>2];c[w+4>>2]=c[B+4>>2];c[w+8>>2]=c[B+8>>2];lu(B|0,0,12);ed(A);S=cl[c[(c[e>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3762]|0)!=-1){c[o>>2]=15048;c[o+4>>2]=12;c[o+8>>2]=0;eg(15048,o,104)}o=(c[3763]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=b5(4)|0;U=T;kV(U);bw(T|0,9432,148)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=b5(4)|0;U=T;kV(U);bw(T|0,9432,148)}T=P;U=c[P>>2]|0;if(d){ci[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;ci[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){a[l+1|0]=0;a[E]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}et(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];lu(G|0,0,12);ed(F)}else{ci[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;ci[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}et(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];lu(K|0,0,12);ed(J)}J=P;a[g]=cl[c[(c[J>>2]|0)+12>>2]&255](T)|0;a[h]=cl[c[(c[J>>2]|0)+16>>2]&255](T)|0;J=P;ci[c[(c[J>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}et(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];lu(M|0,0,12);ed(L);ci[c[(c[J>>2]|0)+24>>2]&127](N,T);J=k;if((a[J]&1)==0){a[k+1|0]=0;a[J]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}et(k,0);c[J>>2]=c[O>>2];c[J+4>>2]=c[O+4>>2];c[J+8>>2]=c[O+8>>2];lu(O|0,0,12);ed(N);S=cl[c[(c[P>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function iE(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;do{if((H|0)==1){c[e>>2]=c[f>>2];I=cj[c[(c[s>>2]|0)+28>>2]&63](j,32)|0;J=c[f>>2]|0;c[f>>2]=J+1;a[J]=I;K=G}else if((H|0)==4){I=c[f>>2]|0;J=k?G+1|0:G;L=J;while(1){if(L>>>0>=i>>>0){break}M=a[L]|0;if(M<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(M<<24>>24<<1)>>1]&2048)==0){break}else{L=L+1|0}}M=L;if(B){if(L>>>0>J>>>0){N=J+(-M|0)|0;M=N>>>0<o>>>0?o:N;N=M+r|0;O=L;P=r;Q=I;while(1){R=O-1|0;S=a[R]|0;c[f>>2]=Q+1;a[Q]=S;S=P-1|0;T=(S|0)>0;if(!(R>>>0>J>>>0&T)){break}O=R;P=S;Q=c[f>>2]|0}Q=L+M|0;if(T){U=N;V=Q;W=1098}else{X=0;Y=N;Z=Q}}else{U=r;V=L;W=1098}if((W|0)==1098){W=0;X=cj[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;Y=U;Z=V}Q=c[f>>2]|0;c[f>>2]=Q+1;if((Y|0)>0){P=Y;O=Q;while(1){a[O]=X;S=P-1|0;R=c[f>>2]|0;c[f>>2]=R+1;if((S|0)>0){P=S;O=R}else{_=R;break}}}else{_=Q}a[_]=m;$=Z}else{$=L}if(($|0)==(J|0)){O=cj[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=O}else{O=a[C]|0;P=O&255;if((P&1|0)==0){aa=P>>>1}else{aa=c[F>>2]|0}if((aa|0)==0){ab=$;ac=0;ad=0;ae=-1}else{if((O&1)==0){af=D}else{af=c[E>>2]|0}ab=$;ac=0;ad=0;ae=a[af]|0}while(1){do{if((ac|0)==(ae|0)){O=c[f>>2]|0;c[f>>2]=O+1;a[O]=n;O=ad+1|0;P=a[C]|0;N=P&255;if((N&1|0)==0){ag=N>>>1}else{ag=c[F>>2]|0}if(O>>>0>=ag>>>0){ah=ae;ai=O;aj=0;break}N=(P&1)==0;if(N){ak=D}else{ak=c[E>>2]|0}if((a[ak+O|0]|0)==127){ah=-1;ai=O;aj=0;break}if(N){al=D}else{al=c[E>>2]|0}ah=a[al+O|0]|0;ai=O;aj=0}else{ah=ae;ai=ad;aj=ac}}while(0);O=ab-1|0;N=a[O]|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=N;if((O|0)==(J|0)){break}else{ab=O;ac=aj+1|0;ad=ai;ae=ah}}}L=c[f>>2]|0;if((I|0)==(L|0)){K=J;break}Q=L-1|0;if(I>>>0<Q>>>0){am=I;an=Q}else{K=J;break}while(1){Q=a[am]|0;a[am]=a[an]|0;a[an]=Q;Q=am+1|0;L=an-1|0;if(Q>>>0<L>>>0){am=Q;an=L}else{K=J;break}}}else if((H|0)==3){J=a[t]|0;I=J&255;if((I&1|0)==0){ao=I>>>1}else{ao=c[w>>2]|0}if((ao|0)==0){K=G;break}if((J&1)==0){ap=u}else{ap=c[v>>2]|0}J=a[ap]|0;I=c[f>>2]|0;c[f>>2]=I+1;a[I]=J;K=G}else if((H|0)==0){c[e>>2]=c[f>>2];K=G}else if((H|0)==2){J=a[q]|0;I=J&255;L=(I&1|0)==0;if(L){aq=I>>>1}else{aq=c[z>>2]|0}if((aq|0)==0|x){K=G;break}if((J&1)==0){ar=y;as=y}else{J=c[A>>2]|0;ar=J;as=J}if(L){at=I>>>1}else{at=c[z>>2]|0}I=ar+at|0;L=c[f>>2]|0;if((as|0)==(I|0)){au=L}else{J=as;Q=L;while(1){a[Q]=a[J]|0;L=J+1|0;O=Q+1|0;if((L|0)==(I|0)){au=O;break}else{J=L;Q=O}}}c[f>>2]=au;K=G}else{K=G}}while(0);H=h+1|0;if(H>>>0<4){G=K;h=H}else{break}}h=a[t]|0;t=h&255;K=(t&1|0)==0;if(K){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(K){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;if((aw|0)==(w|0)){az=ay}else{ax=ay;ay=aw;while(1){a[ax]=a[ay]|0;aw=ax+1|0;t=ay+1|0;if((t|0)==(w|0)){az=aw;break}else{ax=aw;ay=t}}}c[f>>2]=az}az=g&176;if((az|0)==16){return}else if((az|0)==32){c[e>>2]=c[f>>2];return}else{c[e>>2]=d;return}}function iF(a){a=a|0;dt(a|0);lo(a);return}function iG(a){a=a|0;dt(a|0);return}function iH(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+100|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;eR(m,h);B=m|0;C=c[B>>2]|0;if((c[3642]|0)!=-1){c[l>>2]=14568;c[l+4>>2]=12;c[l+8>>2]=0;eg(14568,l,104)}l=(c[3643]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=k;I=a[H]|0;J=I&255;if((J&1|0)==0){K=J>>>1}else{K=c[k+4>>2]|0}if((K|0)==0){L=0}else{if((I&1)==0){M=G+1|0}else{M=c[k+8>>2]|0}I=a[M]|0;L=I<<24>>24==(cj[c[(c[E>>2]|0)+28>>2]&63](F,45)|0)<<24>>24}lu(r|0,0,12);lu(t|0,0,12);lu(v|0,0,12);iD(g,L,m,n,o,p,q,s,u,w);E=x|0;I=a[H]|0;J=I&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[k+4>>2]|0}P=c[w>>2]|0;if((O|0)>(P|0)){if(N){Q=J>>>1}else{Q=c[k+4>>2]|0}J=d[v]|0;if((J&1|0)==0){R=J>>>1}else{R=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){S=J>>>1}else{S=c[s+4>>2]|0}T=(Q-P<<1|1)+R+S|0}else{J=d[v]|0;if((J&1|0)==0){U=J>>>1}else{U=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){V=J>>>1}else{V=c[s+4>>2]|0}T=U+2+V|0}J=T+P|0;do{if(J>>>0>100){N=le(J)|0;if((N|0)!=0){W=N;X=N;Y=I;break}lt();W=0;X=0;Y=a[H]|0}else{W=E;X=0;Y=I}}while(0);if((Y&1)==0){Z=G+1|0;_=G+1|0}else{I=c[k+8>>2]|0;Z=I;_=I}I=Y&255;if((I&1|0)==0){$=I>>>1}else{$=c[k+4>>2]|0}iE(W,y,z,c[h+4>>2]|0,_,Z+$|0,F,L,n,a[o]|0,a[p]|0,q,s,u,P);c[A>>2]=c[f>>2];dr(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){ed(u);ed(s);ed(q);aa=c[B>>2]|0;ab=aa|0;ac=dT(ab)|0;i=e;return}lf(X);ed(u);ed(s);ed(q);aa=c[B>>2]|0;ab=aa|0;ac=dT(ab)|0;i=e;return}}while(0);e=b5(4)|0;kV(e);bw(e|0,9432,148)}function iI(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+576|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+528|0;p=e+536|0;q=e+544|0;r=e+552|0;s=e+560|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+400|0;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a2(E|0,100,1856,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);E=gN(n,c[3302]|0,1856,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;H=c[n>>2]|0;if((H|0)==0){lt();I=c[n>>2]|0}else{I=H}H=le(E<<2)|0;J=H;if((H|0)!=0){K=J;L=E;M=I;N=J;break}lt();K=J;L=E;M=I;N=J}else{K=F;L=G;M=0;N=0}}while(0);eR(o,j);G=o|0;F=c[G>>2]|0;if((c[3640]|0)!=-1){c[m>>2]=14560;c[m+4>>2]=12;c[m+8>>2]=0;eg(14560,m,104)}m=(c[3641]|0)-1|0;I=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-I>>2>>>0>m>>>0){J=c[I+(m<<2)>>2]|0;if((J|0)==0){break}E=J;H=c[n>>2]|0;O=H+L|0;P=c[(c[J>>2]|0)+48>>2]|0;cv[P&15](E,H,O,K)|0;if((L|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}lu(t|0,0,12);lu(v|0,0,12);lu(x|0,0,12);iJ(g,Q,o,p,q,r,s,u,w,y);O=z|0;H=c[y>>2]|0;if((L|0)>(H|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(L-H<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+H|0;do{if(P>>>0>100){J=le(P<<2)|0;W=J;if((J|0)!=0){X=W;Y=W;break}lt();X=W;Y=W}else{X=O;Y=0}}while(0);iK(X,A,C,c[j+4>>2]|0,K,K+(L<<2)|0,E,Q,p,c[q>>2]|0,c[r>>2]|0,s,u,w,H);c[D>>2]=c[f>>2];gW(b,D,X,c[A>>2]|0,c[C>>2]|0,j,k);if((Y|0)!=0){lf(Y)}eq(w);eq(u);ed(s);O=c[G>>2]|0;dT(O)|0;if((N|0)!=0){lf(N)}if((M|0)==0){i=e;return}lf(M);i=e;return}}while(0);e=b5(4)|0;kV(e);bw(e|0,9432,148)}function iJ(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3756]|0)!=-1){c[p>>2]=15024;c[p+4>>2]=12;c[p+8>>2]=0;eg(15024,p,104)}p=(c[3757]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=b5(4)|0;R=Q;kV(R);bw(Q|0,9432,148)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=b5(4)|0;R=Q;kV(R);bw(Q|0,9432,148)}Q=e;R=c[e>>2]|0;if(d){ci[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;ci[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){c[l+4>>2]=0;a[r]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}e6(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];lu(t|0,0,12);eq(s)}else{ci[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;ci[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){c[l+4>>2]=0;a[v]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}e6(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];lu(x|0,0,12);eq(w)}w=e;c[g>>2]=cl[c[(c[w>>2]|0)+12>>2]&255](Q)|0;c[h>>2]=cl[c[(c[w>>2]|0)+16>>2]&255](Q)|0;ci[c[(c[e>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}et(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];lu(z|0,0,12);ed(y);ci[c[(c[e>>2]|0)+24>>2]&127](A,Q);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}e6(k,0);c[e>>2]=c[B>>2];c[e+4>>2]=c[B+4>>2];c[e+8>>2]=c[B+8>>2];lu(B|0,0,12);eq(A);S=cl[c[(c[w>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3758]|0)!=-1){c[o>>2]=15032;c[o+4>>2]=12;c[o+8>>2]=0;eg(15032,o,104)}o=(c[3759]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=b5(4)|0;U=T;kV(U);bw(T|0,9432,148)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=b5(4)|0;U=T;kV(U);bw(T|0,9432,148)}T=P;U=c[P>>2]|0;if(d){ci[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;ci[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){c[l+4>>2]=0;a[E]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}e6(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];lu(G|0,0,12);eq(F)}else{ci[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;ci[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}e6(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];lu(K|0,0,12);eq(J)}J=P;c[g>>2]=cl[c[(c[J>>2]|0)+12>>2]&255](T)|0;c[h>>2]=cl[c[(c[J>>2]|0)+16>>2]&255](T)|0;ci[c[(c[P>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}et(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];lu(M|0,0,12);ed(L);ci[c[(c[P>>2]|0)+24>>2]&127](N,T);P=k;if((a[P]&1)==0){c[k+4>>2]=0;a[P]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}e6(k,0);c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];lu(O|0,0,12);eq(N);S=cl[c[(c[J>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function iK(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;do{if((D|0)==0){c[d>>2]=c[e>>2];E=n}else if((D|0)==1){c[d>>2]=c[e>>2];F=cj[c[(c[r>>2]|0)+44>>2]&63](i,32)|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;E=n}else if((D|0)==3){F=a[s]|0;G=F&255;if((G&1|0)==0){H=G>>>1}else{H=c[t>>2]|0}if((H|0)==0){E=n;break}if((F&1)==0){I=t}else{I=c[u>>2]|0}F=c[I>>2]|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;E=n}else if((D|0)==2){F=a[p]|0;G=F&255;J=(G&1|0)==0;if(J){K=G>>>1}else{K=c[w>>2]|0}if((K|0)==0|v){E=n;break}if((F&1)==0){L=w;M=w;N=w}else{F=c[x>>2]|0;L=F;M=F;N=F}if(J){O=G>>>1}else{O=c[w>>2]|0}G=L+(O<<2)|0;J=c[e>>2]|0;if((M|0)==(G|0)){P=J}else{F=(L+(O-1<<2)+(-N|0)|0)>>>2;Q=M;R=J;while(1){c[R>>2]=c[Q>>2];S=Q+4|0;if((S|0)==(G|0)){break}Q=S;R=R+4|0}P=J+(F+1<<2)|0}c[e>>2]=P;E=n}else if((D|0)==4){R=c[e>>2]|0;Q=j?n+4|0:n;G=Q;while(1){if(G>>>0>=h>>>0){break}if(cm[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[G>>2]|0)|0){G=G+4|0}else{break}}if(y){if(G>>>0>Q>>>0){F=G;J=q;do{F=F-4|0;S=c[F>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=S;J=J-1|0;U=(J|0)>0;}while(F>>>0>Q>>>0&U);if(U){V=J;W=F;X=1374}else{Y=0;Z=J;_=F}}else{V=q;W=G;X=1374}if((X|0)==1374){X=0;Y=cj[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;Z=V;_=W}S=c[e>>2]|0;c[e>>2]=S+4;if((Z|0)>0){T=Z;$=S;while(1){c[$>>2]=Y;aa=T-1|0;ab=c[e>>2]|0;c[e>>2]=ab+4;if((aa|0)>0){T=aa;$=ab}else{ac=ab;break}}}else{ac=S}c[ac>>2]=l;ad=_}else{ad=G}if((ad|0)==(Q|0)){$=cj[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=$}else{$=a[z]|0;T=$&255;if((T&1|0)==0){ae=T>>>1}else{ae=c[C>>2]|0}if((ae|0)==0){af=ad;ag=0;ah=0;ai=-1}else{if(($&1)==0){aj=A}else{aj=c[B>>2]|0}af=ad;ag=0;ah=0;ai=a[aj]|0}while(1){do{if((ag|0)==(ai|0)){$=c[e>>2]|0;c[e>>2]=$+4;c[$>>2]=m;$=ah+1|0;T=a[z]|0;F=T&255;if((F&1|0)==0){ak=F>>>1}else{ak=c[C>>2]|0}if($>>>0>=ak>>>0){al=ai;am=$;an=0;break}F=(T&1)==0;if(F){ao=A}else{ao=c[B>>2]|0}if((a[ao+$|0]|0)==127){al=-1;am=$;an=0;break}if(F){ap=A}else{ap=c[B>>2]|0}al=a[ap+$|0]|0;am=$;an=0}else{al=ai;am=ah;an=ag}}while(0);$=af-4|0;F=c[$>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=F;if(($|0)==(Q|0)){break}else{af=$;ag=an+1|0;ah=am;ai=al}}}G=c[e>>2]|0;if((R|0)==(G|0)){E=Q;break}S=G-4|0;if(R>>>0<S>>>0){aq=R;ar=S}else{E=Q;break}while(1){S=c[aq>>2]|0;c[aq>>2]=c[ar>>2];c[ar>>2]=S;S=aq+4|0;G=ar-4|0;if(S>>>0<G>>>0){aq=S;ar=G}else{E=Q;break}}}else{E=n}}while(0);D=g+1|0;if(D>>>0<4){n=E;g=D}else{break}}g=a[s]|0;s=g&255;E=(s&1|0)==0;if(E){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(E){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;E=au+4|0;if((E|0)==(t|0)){ax=s}else{au=((at+(aw-2<<2)+(-av|0)|0)>>>2)+1|0;av=s;aw=E;while(1){c[av>>2]=c[aw>>2];E=aw+4|0;if((E|0)==(t|0)){break}else{av=av+4|0;aw=E}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==16){return}else if((ax|0)==32){c[d>>2]=c[e>>2];return}else{c[d>>2]=b;return}}function iL(a){a=a|0;dt(a|0);lo(a);return}function iM(a){a=a|0;dt(a|0);return}function iN(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bj(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function iO(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+400|0;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;eR(m,h);B=m|0;C=c[B>>2]|0;if((c[3640]|0)!=-1){c[l>>2]=14560;c[l+4>>2]=12;c[l+8>>2]=0;eg(14560,l,104)}l=(c[3641]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=a[G]|0;I=H&255;if((I&1|0)==0){J=I>>>1}else{J=c[k+4>>2]|0}if((J|0)==0){K=0}else{if((H&1)==0){L=k+4|0}else{L=c[k+8>>2]|0}H=c[L>>2]|0;K=(H|0)==(cj[c[(c[E>>2]|0)+44>>2]&63](F,45)|0)}lu(r|0,0,12);lu(t|0,0,12);lu(v|0,0,12);iJ(g,K,m,n,o,p,q,s,u,w);E=x|0;H=a[G]|0;I=H&255;M=(I&1|0)==0;if(M){N=I>>>1}else{N=c[k+4>>2]|0}O=c[w>>2]|0;if((N|0)>(O|0)){if(M){P=I>>>1}else{P=c[k+4>>2]|0}I=d[v]|0;if((I&1|0)==0){Q=I>>>1}else{Q=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){R=I>>>1}else{R=c[s+4>>2]|0}S=(P-O<<1|1)+Q+R|0}else{I=d[v]|0;if((I&1|0)==0){T=I>>>1}else{T=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){U=I>>>1}else{U=c[s+4>>2]|0}S=T+2+U|0}I=S+O|0;do{if(I>>>0>100){M=le(I<<2)|0;V=M;if((M|0)!=0){W=V;X=V;Y=H;break}lt();W=V;X=V;Y=a[G]|0}else{W=E;X=0;Y=H}}while(0);if((Y&1)==0){Z=k+4|0;_=k+4|0}else{H=c[k+8>>2]|0;Z=H;_=H}H=Y&255;if((H&1|0)==0){$=H>>>1}else{$=c[k+4>>2]|0}iK(W,y,z,c[h+4>>2]|0,_,Z+($<<2)|0,F,K,n,c[o>>2]|0,c[p>>2]|0,q,s,u,O);c[A>>2]=c[f>>2];gW(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){eq(u);eq(s);ed(q);aa=c[B>>2]|0;ab=aa|0;ac=dT(ab)|0;i=e;return}lf(X);eq(u);eq(s);ed(q);aa=c[B>>2]|0;ab=aa|0;ac=dT(ab)|0;i=e;return}}while(0);e=b5(4)|0;kV(e);bw(e|0,9432,148)}function iP(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+16|0;j=d|0;k=j;lu(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=p;do{eo(j,a[q]|0);q=q+1|0;}while(q>>>0<h>>>0);q=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){r=q;s=1506;break}t=c[j+8>>2]|0;u=q}else{r=(e|0)==-1?-1:e<<1;s=1506}}while(0);if((s|0)==1506){t=j+1|0;u=r}r=b2(u|0,f|0,g|0,t|0)|0;lu(l|0,0,12);l=lx(r|0)|0;t=r+l|0;if((l|0)>0){v=r}else{ed(j);i=d;return}do{eo(b,a[v]|0);v=v+1|0;}while(v>>>0<t>>>0);ed(j);i=d;return}function iQ(a,b){a=a|0;b=b|0;a9(((b|0)==-1?-1:b<<1)|0)|0;return}function iR(a){a=a|0;dt(a|0);lo(a);return}function iS(a){a=a|0;dt(a|0);return}function iT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bj(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function iU(a,b){a=a|0;b=b|0;a9(((b|0)==-1?-1:b<<1)|0)|0;return}function iV(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;lu(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=4896;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;L1851:do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=z;C=4896;while(1){c[m>>2]=x;D=(cr[c[C+12>>2]&31](w,j,x,h,m,y,A,l)|0)==2;E=c[m>>2]|0;if(D|(E|0)==(x|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){D=y;do{eo(r,a[D]|0);D=D+1|0;}while(D>>>0<(c[l>>2]|0)>>>0);F=c[m>>2]|0}else{F=E}if(F>>>0>=h>>>0){break L1851}x=F;C=c[B>>2]|0}B=b5(8)|0;d2(B,1104);bw(B|0,9448,24)}}while(0);dt(t|0);if((a[s]&1)==0){G=r+1|0}else{G=c[r+8>>2]|0}s=b2(((e|0)==-1?-1:e<<1)|0,f|0,g|0,G|0)|0;lu(v|0,0,12);v=u|0;c[u+4>>2]=0;c[u>>2]=4840;G=lx(s|0)|0;g=s+G|0;if((G|0)<1){H=u|0;dt(H);ed(r);i=d;return}G=u;f=g;e=o|0;t=o+128|0;o=s;s=4840;while(1){c[q>>2]=o;F=(cr[c[s+16>>2]&31](v,n,o,(f-o|0)>32?o+32|0:g,q,e,t,p)|0)==2;h=c[q>>2]|0;if(F|(h|0)==(o|0)){break}if(e>>>0<(c[p>>2]|0)>>>0){F=e;do{eP(b,c[F>>2]|0);F=F+4|0;}while(F>>>0<(c[p>>2]|0)>>>0);I=c[q>>2]|0}else{I=h}if(I>>>0>=g>>>0){J=1574;break}o=I;s=c[G>>2]|0}if((J|0)==1574){H=u|0;dt(H);ed(r);i=d;return}d=b5(8)|0;d2(d,1104);bw(d|0,9448,24)}function iW(a){a=a|0;var b=0;c[a>>2]=4312;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dt(a|0);return}function iX(a){a=a|0;a=b5(8)|0;d_(a,1840);c[a>>2]=3248;bw(a|0,9464,38)}function iY(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1;c[b>>2]=4568;d=b+8|0;I=b+12|0;a[b+136|0]=1;J=b+24|0;K=J;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J+112;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J-1|0;}while((J|0)!=0);ej(b+144|0,1792,1);J=c[d>>2]|0;d=c[I>>2]|0;if((J|0)!=(d|0)){c[I>>2]=d+(~((d-4+(-J|0)|0)>>>2)<<2)}c[3335]=0;c[3334]=4272;if((c[3562]|0)!=-1){c[H>>2]=14248;c[H+4>>2]=12;c[H+8>>2]=0;eg(14248,H,104)}i7(b,13336,(c[3563]|0)-1|0);c[3333]=0;c[3332]=4232;if((c[3560]|0)!=-1){c[G>>2]=14240;c[G+4>>2]=12;c[G+8>>2]=0;eg(14240,G,104)}i7(b,13328,(c[3561]|0)-1|0);c[3385]=0;c[3384]=4680;c[3386]=0;a[13548]=0;c[3386]=c[(bh()|0)>>2];if((c[3642]|0)!=-1){c[F>>2]=14568;c[F+4>>2]=12;c[F+8>>2]=0;eg(14568,F,104)}i7(b,13536,(c[3643]|0)-1|0);c[3383]=0;c[3382]=4600;if((c[3640]|0)!=-1){c[E>>2]=14560;c[E+4>>2]=12;c[E+8>>2]=0;eg(14560,E,104)}i7(b,13528,(c[3641]|0)-1|0);c[3337]=0;c[3336]=4368;if((c[3566]|0)!=-1){c[D>>2]=14264;c[D+4>>2]=12;c[D+8>>2]=0;eg(14264,D,104)}i7(b,13344,(c[3567]|0)-1|0);c[707]=0;c[706]=4312;c[708]=0;if((c[3564]|0)!=-1){c[C>>2]=14256;c[C+4>>2]=12;c[C+8>>2]=0;eg(14256,C,104)}i7(b,2824,(c[3565]|0)-1|0);c[3339]=0;c[3338]=4424;if((c[3568]|0)!=-1){c[B>>2]=14272;c[B+4>>2]=12;c[B+8>>2]=0;eg(14272,B,104)}i7(b,13352,(c[3569]|0)-1|0);c[3341]=0;c[3340]=4480;if((c[3570]|0)!=-1){c[A>>2]=14280;c[A+4>>2]=12;c[A+8>>2]=0;eg(14280,A,104)}i7(b,13360,(c[3571]|0)-1|0);c[3315]=0;c[3314]=3776;a[13264]=46;a[13265]=44;lu(13268,0,12);if((c[3546]|0)!=-1){c[z>>2]=14184;c[z+4>>2]=12;c[z+8>>2]=0;eg(14184,z,104)}i7(b,13256,(c[3547]|0)-1|0);c[699]=0;c[698]=3728;c[700]=46;c[701]=44;lu(2808,0,12);if((c[3544]|0)!=-1){c[y>>2]=14176;c[y+4>>2]=12;c[y+8>>2]=0;eg(14176,y,104)}i7(b,2792,(c[3545]|0)-1|0);c[3331]=0;c[3330]=4160;if((c[3558]|0)!=-1){c[x>>2]=14232;c[x+4>>2]=12;c[x+8>>2]=0;eg(14232,x,104)}i7(b,13320,(c[3559]|0)-1|0);c[3329]=0;c[3328]=4088;if((c[3556]|0)!=-1){c[w>>2]=14224;c[w+4>>2]=12;c[w+8>>2]=0;eg(14224,w,104)}i7(b,13312,(c[3557]|0)-1|0);c[3327]=0;c[3326]=4024;if((c[3554]|0)!=-1){c[v>>2]=14216;c[v+4>>2]=12;c[v+8>>2]=0;eg(14216,v,104)}i7(b,13304,(c[3555]|0)-1|0);c[3325]=0;c[3324]=3960;if((c[3552]|0)!=-1){c[u>>2]=14208;c[u+4>>2]=12;c[u+8>>2]=0;eg(14208,u,104)}i7(b,13296,(c[3553]|0)-1|0);c[3395]=0;c[3394]=5896;if((c[3762]|0)!=-1){c[t>>2]=15048;c[t+4>>2]=12;c[t+8>>2]=0;eg(15048,t,104)}i7(b,13576,(c[3763]|0)-1|0);c[3393]=0;c[3392]=5832;if((c[3760]|0)!=-1){c[s>>2]=15040;c[s+4>>2]=12;c[s+8>>2]=0;eg(15040,s,104)}i7(b,13568,(c[3761]|0)-1|0);c[3391]=0;c[3390]=5768;if((c[3758]|0)!=-1){c[r>>2]=15032;c[r+4>>2]=12;c[r+8>>2]=0;eg(15032,r,104)}i7(b,13560,(c[3759]|0)-1|0);c[3389]=0;c[3388]=5704;if((c[3756]|0)!=-1){c[q>>2]=15024;c[q+4>>2]=12;c[q+8>>2]=0;eg(15024,q,104)}i7(b,13552,(c[3757]|0)-1|0);c[3313]=0;c[3312]=3432;if((c[3534]|0)!=-1){c[p>>2]=14136;c[p+4>>2]=12;c[p+8>>2]=0;eg(14136,p,104)}i7(b,13248,(c[3535]|0)-1|0);c[3311]=0;c[3310]=3392;if((c[3532]|0)!=-1){c[o>>2]=14128;c[o+4>>2]=12;c[o+8>>2]=0;eg(14128,o,104)}i7(b,13240,(c[3533]|0)-1|0);c[3309]=0;c[3308]=3352;if((c[3530]|0)!=-1){c[n>>2]=14120;c[n+4>>2]=12;c[n+8>>2]=0;eg(14120,n,104)}i7(b,13232,(c[3531]|0)-1|0);c[3307]=0;c[3306]=3312;if((c[3528]|0)!=-1){c[m>>2]=14112;c[m+4>>2]=12;c[m+8>>2]=0;eg(14112,m,104)}i7(b,13224,(c[3529]|0)-1|0);c[695]=0;c[694]=3632;c[696]=3680;if((c[3542]|0)!=-1){c[l>>2]=14168;c[l+4>>2]=12;c[l+8>>2]=0;eg(14168,l,104)}i7(b,2776,(c[3543]|0)-1|0);c[691]=0;c[690]=3536;c[692]=3584;if((c[3540]|0)!=-1){c[k>>2]=14160;c[k+4>>2]=12;c[k+8>>2]=0;eg(14160,k,104)}i7(b,2760,(c[3541]|0)-1|0);c[687]=0;c[686]=4536;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);c[688]=c[3302];c[686]=3504;if((c[3538]|0)!=-1){c[j>>2]=14152;c[j+4>>2]=12;c[j+8>>2]=0;eg(14152,j,104)}i7(b,2744,(c[3539]|0)-1|0);c[683]=0;c[682]=4536;do{if((a[15128]|0)==0){if((bn(15128)|0)==0){break}c[3302]=aX(1,1792,0)|0}}while(0);c[684]=c[3302];c[682]=3472;if((c[3536]|0)!=-1){c[h>>2]=14144;c[h+4>>2]=12;c[h+8>>2]=0;eg(14144,h,104)}i7(b,2728,(c[3537]|0)-1|0);c[3323]=0;c[3322]=3864;if((c[3550]|0)!=-1){c[g>>2]=14200;c[g+4>>2]=12;c[g+8>>2]=0;eg(14200,g,104)}i7(b,13288,(c[3551]|0)-1|0);c[3321]=0;c[3320]=3824;if((c[3548]|0)!=-1){c[f>>2]=14192;c[f+4>>2]=12;c[f+8>>2]=0;eg(14192,f,104)}i7(b,13280,(c[3549]|0)-1|0);i=e;return}function iZ(a,b){a=a|0;b=b|0;return b|0}function i_(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function i$(a,b){a=a|0;b=b|0;return b<<24>>24|0}function i0(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function i1(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function i2(a){a=a|0;c[a+4>>2]=(I=c[3572]|0,c[3572]=I+1,I)+1;return}function i3(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function i4(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=((e-4+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function i5(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function i6(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function i7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;du(b|0);e=a+8|0;f=a+12|0;a=c[f>>2]|0;g=e|0;h=c[g>>2]|0;i=a-h>>2;do{if(i>>>0>d>>>0){j=h}else{k=d+1|0;if(i>>>0<k>>>0){kL(e,k-i|0);j=c[g>>2]|0;break}if(i>>>0<=k>>>0){j=h;break}l=h+(k<<2)|0;if((l|0)==(a|0)){j=h;break}c[f>>2]=a+(~((a-4+(-l|0)|0)>>>2)<<2);j=h}}while(0);h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=j;n=m+(d<<2)|0;c[n>>2]=b;return}dT(h|0)|0;m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}function i8(a){a=a|0;i9(a);lo(a);return}function i9(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c[b>>2]=4568;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((e|0)!=(g|0)){h=0;i=g;g=e;while(1){e=c[i+(h<<2)>>2]|0;if((e|0)==0){j=g;k=i}else{l=e|0;dT(l)|0;j=c[d>>2]|0;k=c[f>>2]|0}l=h+1|0;if(l>>>0<j-k>>2>>>0){h=l;i=k;g=j}else{break}}}ed(b+144|0);j=c[f>>2]|0;if((j|0)==0){m=b|0;dt(m);return}f=c[d>>2]|0;if((j|0)!=(f|0)){c[d>>2]=f+(~((f-4+(-j|0)|0)>>>2)<<2)}if((j|0)==(b+24|0)){a[b+136|0]=0;m=b|0;dt(m);return}else{lo(j);m=b|0;dt(m);return}}function ja(){var b=0,d=0;if((a[15112]|0)!=0){b=c[3294]|0;return b|0}if((bn(15112)|0)==0){b=c[3294]|0;return b|0}do{if((a[15120]|0)==0){if((bn(15120)|0)==0){break}iY(13368,1);c[3298]=13368;c[3296]=13192}}while(0);d=c[c[3296]>>2]|0;c[3300]=d;du(d|0);c[3294]=13200;b=c[3294]|0;return b|0}function jb(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;c[a>>2]=d;du(d|0);return}function jc(a){a=a|0;dT(c[a>>2]|0)|0;return}function jd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;eg(a,e,104)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=0;i=d;return g|0}g=(c[b+(e<<2)>>2]|0)!=0;i=d;return g|0}function je(a){a=a|0;dt(a|0);lo(a);return}function jf(a){a=a|0;if((a|0)==0){return}ch[c[(c[a>>2]|0)+4>>2]&511](a);return}function jg(a){a=a|0;dt(a|0);lo(a);return}function jh(b){b=b|0;var d=0;c[b>>2]=4680;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}lp(d)}}while(0);dt(b|0);lo(b);return}function ji(b){b=b|0;var d=0;c[b>>2]=4680;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}lp(d)}}while(0);dt(b|0);return}function jj(a){a=a|0;dt(a|0);lo(a);return}function jk(a){a=a|0;var b=0;b=c[(ja()|0)>>2]|0;c[a>>2]=b;du(b|0);return}function jl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;eg(a,e,104)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=b5(4)|0;h=g;kV(h);bw(g|0,9432,148);return 0}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=b5(4)|0;h=g;kV(h);bw(g|0,9432,148);return 0}else{i=d;return f|0}return 0}function jm(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[(bh()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function jn(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[(bh()|0)>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function jo(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[(bh()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=1825;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=1826;break}else{h=e}}if((i|0)==1825){return g|0}else if((i|0)==1826){return g|0}return 0}function jp(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=1835;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=1836;break}if((b[(c[(bh()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=1837;break}else{a=a+4|0}}if((h|0)==1835){return g|0}else if((h|0)==1836){return g|0}else if((h|0)==1837){return g|0}return 0}function jq(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(ca()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function jr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(ca()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function js(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(cb()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function jt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(cb()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function ju(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(ca()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function jv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(ca()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function jw(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(cb()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function jx(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(cb()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function jy(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function jz(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function jA(a){a=a|0;return 1}function jB(a){a=a|0;return 1}function jC(a){a=a|0;return 1}function jD(a){a=a|0;return 0}function jE(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function jF(a){a=a|0;dt(a|0);lo(a);return}function jG(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jS(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function jH(a){a=a|0;var b=0;c[a>>2]=4312;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dt(a|0);lo(a);return}function jI(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;l=i;i=i+8|0;m=l|0;n=m;o=i;i=i+1|0;i=i+7>>3<<3;p=e;while(1){if((p|0)==(f|0)){q=f;break}if((c[p>>2]|0)==0){q=p;break}else{p=p+4|0}}c[k>>2]=h;c[g>>2]=e;L2271:do{if((e|0)==(f|0)|(h|0)==(j|0)){r=e}else{p=d;s=j;t=b+8|0;u=o|0;v=h;w=e;x=q;while(1){y=c[p+4>>2]|0;c[m>>2]=c[p>>2];c[m+4>>2]=y;y=bT(c[t>>2]|0)|0;z=kZ(v,g,x-w>>2,s-v|0,d)|0;if((y|0)!=0){bT(y|0)|0}if((z|0)==(-1|0)){A=1929;break}else if((z|0)==0){B=1;A=1965;break}y=(c[k>>2]|0)+z|0;c[k>>2]=y;if((y|0)==(j|0)){A=1962;break}if((x|0)==(f|0)){C=f;D=y;E=c[g>>2]|0}else{y=bT(c[t>>2]|0)|0;z=kY(u,0,d)|0;if((y|0)!=0){bT(y|0)|0}if((z|0)==-1){B=2;A=1967;break}y=c[k>>2]|0;if(z>>>0>(s-y|0)>>>0){B=1;A=1968;break}L2290:do{if((z|0)!=0){F=z;G=u;H=y;while(1){I=a[G]|0;c[k>>2]=H+1;a[H]=I;I=F-1|0;if((I|0)==0){break L2290}F=I;G=G+1|0;H=c[k>>2]|0}}}while(0);y=(c[g>>2]|0)+4|0;c[g>>2]=y;z=y;while(1){if((z|0)==(f|0)){J=f;break}if((c[z>>2]|0)==0){J=z;break}else{z=z+4|0}}C=J;D=c[k>>2]|0;E=y}if((E|0)==(f|0)|(D|0)==(j|0)){r=E;break L2271}else{v=D;w=E;x=C}}if((A|0)==1929){c[k>>2]=v;L2302:do{if((w|0)==(c[g>>2]|0)){K=w}else{x=w;u=v;while(1){s=c[x>>2]|0;p=bT(c[t>>2]|0)|0;z=kY(u,s,n)|0;if((p|0)!=0){bT(p|0)|0}if((z|0)==-1){K=x;break L2302}p=(c[k>>2]|0)+z|0;c[k>>2]=p;z=x+4|0;if((z|0)==(c[g>>2]|0)){K=z;break}else{x=z;u=p}}}}while(0);c[g>>2]=K;B=2;i=l;return B|0}else if((A|0)==1962){r=c[g>>2]|0;break}else if((A|0)==1965){i=l;return B|0}else if((A|0)==1967){i=l;return B|0}else if((A|0)==1968){i=l;return B|0}}}while(0);B=(r|0)!=(f|0)|0;i=l;return B|0}function jJ(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L2323:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=w;x=v;w=bT(c[s>>2]|0)|0;y=kJ(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){bT(w|0)|0}if((y|0)==(-1|0)){z=1984;break}else if((y|0)==0){A=2;z=2019;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){z=2016;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=bT(c[s>>2]|0)|0;F=kI(w,y,1,d)|0;if((E|0)!=0){bT(E|0)|0}if((F|0)!=0){A=2;z=2023;break}c[k>>2]=(c[k>>2]|0)+4;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L2323}else{t=C;u=D;v=B}}if((z|0)==2023){i=l;return A|0}else if((z|0)==1984){c[k>>2]=t;L2348:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=bT(c[s>>2]|0)|0;E=kI(v,r,x-r|0,n)|0;if((o|0)!=0){bT(o|0)|0}if((E|0)==0){I=r+1|0}else if((E|0)==(-1|0)){z=1995;break}else if((E|0)==(-2|0)){z=1996;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L2348}else{v=E;r=I}}if((z|0)==1995){c[g>>2]=r;A=2;i=l;return A|0}else if((z|0)==1996){c[g>>2]=r;A=1;i=l;return A|0}}}while(0);c[g>>2]=H;A=(H|0)!=(f|0)|0;i=l;return A|0}else if((z|0)==2016){q=c[g>>2]|0;break}else if((z|0)==2019){i=l;return A|0}}}while(0);A=(q|0)!=(f|0)|0;i=l;return A|0}function jK(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;j=bT(c[b+8>>2]|0)|0;b=kY(e,0,d)|0;if((j|0)!=0){bT(j|0)|0}if((b|0)==(-1|0)|(b|0)==0){k=2;i=h;return k|0}j=b-1|0;b=c[g>>2]|0;if(j>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((j|0)==0){k=0;i=h;return k|0}else{l=j;m=e;n=b}while(1){b=a[m]|0;c[g>>2]=n+1;a[n]=b;b=l-1|0;if((b|0)==0){k=0;break}l=b;m=m+1|0;n=c[g>>2]|0}i=h;return k|0}function jL(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a+8|0;a=bT(c[b>>2]|0)|0;d=kX(0,0,1)|0;if((a|0)!=0){bT(a|0)|0}if((d|0)!=0){e=-1;return e|0}d=c[b>>2]|0;if((d|0)==0){e=1;return e|0}e=bT(d|0)|0;d=bo()|0;if((e|0)==0){f=(d|0)==1;g=f&1;return g|0}bT(e|0)|0;f=(d|0)==1;g=f&1;return g|0}function jM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=d;d=0;j=0;while(1){k=bT(c[i>>2]|0)|0;l=kH(a,h-a|0,b)|0;if((k|0)!=0){bT(k|0)|0}if((l|0)==0){m=1;n=a+1|0}else if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;o=2085;break}else{m=l;n=a+l|0}l=m+d|0;k=j+1|0;if(k>>>0>=f>>>0|(n|0)==(e|0)){g=l;o=2084;break}else{a=n;d=l;j=k}}if((o|0)==2084){return g|0}else if((o|0)==2085){return g|0}return 0}function jN(a){a=a|0;var b=0,d=0;b=c[a+8>>2]|0;if((b|0)==0){d=1;return d|0}a=bT(b|0)|0;b=bo()|0;if((a|0)==0){d=b;return d|0}bT(a|0)|0;d=b;return d|0}function jO(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function jP(a){a=a|0;return 0}function jQ(a){a=a|0;return 0}function jR(a){a=a|0;return 4}function jS(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L2446:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=2138;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=2140;break L2446}c[j>>2]=p+1;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=2139;break L2446}c[j>>2]=p+1;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=2132;break L2446}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=2137;break L2446}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=2143;break L2446}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=2133;break L2446}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=2136;break L2446}if((d-(c[j>>2]|0)|0)<4){m=1;o=2134;break L2446}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=2142;break L2446}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=2135;break}}if((o|0)==2142){return m|0}else if((o|0)==2143){return m|0}else if((o|0)==2132){return m|0}else if((o|0)==2133){return m|0}else if((o|0)==2134){return m|0}else if((o|0)==2135){return m|0}else if((o|0)==2136){return m|0}else if((o|0)==2137){return m|0}else if((o|0)==2138){return m|0}else if((o|0)==2139){return m|0}else if((o|0)==2140){return m|0}return 0}function jT(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L2491:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L2493:while(1){if(e>>>0>=i>>>0){o=n;break L2491}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=2204;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1}else{if((p&255)<194){r=2;s=2201;break L2493}if((p&255)<224){if((h-n|0)<2){r=1;s=2202;break L2493}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=2203;break L2493}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=2192;break L2493}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2;break}if((p&255)<240){if((h-n|0)<3){r=1;s=2191;break L2493}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=2188;break L2493}}else if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=2197;break L2493}}else{if((u&-64)<<24>>24!=-128){r=2;s=2189;break L2493}}v=t&255;if((v&192|0)!=128){r=2;s=2190;break L2493}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=2196;break L2493}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3;break}if((p&255)>=245){r=2;s=2199;break L2493}if((h-n|0)<4){r=1;s=2200;break L2493}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=2194;break L2493}}else if((q|0)==240){if((t+112&255)>=48){r=2;s=2198;break L2493}}else{if((t&-64)<<24>>24!=-128){r=2;s=2195;break L2493}}w=v&255;if((w&192|0)!=128){r=2;s=2186;break L2493}v=u&255;if((v&192|0)!=128){r=2;s=2187;break L2493}if((l-e|0)<4){r=1;s=2205;break L2493}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=2206;break L2493}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L2491}}if((s|0)==2191){return r|0}else if((s|0)==2192){return r|0}else if((s|0)==2203){return r|0}else if((s|0)==2204){return r|0}else if((s|0)==2205){return r|0}else if((s|0)==2197){return r|0}else if((s|0)==2198){return r|0}else if((s|0)==2199){return r|0}else if((s|0)==2200){return r|0}else if((s|0)==2201){return r|0}else if((s|0)==2202){return r|0}else if((s|0)==2188){return r|0}else if((s|0)==2189){return r|0}else if((s|0)==2190){return r|0}else if((s|0)==2186){return r|0}else if((s|0)==2187){return r|0}else if((s|0)==2206){return r|0}else if((s|0)==2194){return r|0}else if((s|0)==2195){return r|0}else if((s|0)==2196){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0|0;return r|0}function jU(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2560:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L2562:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L2560}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L2560}if((k&255)<224){if((g-j|0)<2){m=j;break L2560}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L2560}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L2560}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L2560}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==224){if((p&-32)<<24>>24!=-96){s=2227;break L2562}}else if((l|0)==237){if((p&-32)<<24>>24!=-128){s=2229;break L2562}}else{if((p&-64)<<24>>24!=-128){s=2231;break L2562}}t=r&255;if((t&192|0)!=128){m=j;break L2560}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L2560}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L2560}u=j;if((g-u|0)<4){m=j;break L2560}if((e-i|0)>>>0<2){m=j;break L2560}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==244){if((t&-16)<<24>>24!=-128){s=2242;break L2562}}else if((l|0)==240){if((t+112&255)>=48){s=2240;break L2562}}else{if((t&-64)<<24>>24!=-128){s=2244;break L2562}}v=p&255;if((v&192|0)!=128){m=j;break L2560}p=r&255;if((p&192|0)!=128){m=j;break L2560}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L2560}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L2560}}if((s|0)==2227){w=q-b|0;return w|0}else if((s|0)==2231){w=q-b|0;return w|0}else if((s|0)==2242){w=u-b|0;return w|0}else if((s|0)==2244){w=u-b|0;return w|0}else if((s|0)==2240){w=u-b|0;return w|0}else if((s|0)==2229){w=q-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function jV(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jT(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function jW(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return jU(c,d,e,1114111,0)|0}function jX(a){a=a|0;dt(a|0);lo(a);return}function jY(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=j1(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function jZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function j_(a){a=a|0;return 0}function j$(a){a=a|0;return 0}function j0(a){a=a|0;return 4}function j1(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L2631:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=2293;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=2287;break L2631}c[h>>2]=b+1;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=2292;break L2631}c[h>>2]=b+1;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=2289;break L2631}c[h>>2]=b+1;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=2290;break L2631}c[h>>2]=b+1;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=2291;break}}if((l|0)==2293){return k|0}else if((l|0)==2292){return k|0}else if((l|0)==2291){return k|0}else if((l|0)==2290){return k|0}else if((l|0)==2287){return k|0}else if((l|0)==2289){return k|0}return 0}function j2(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L2663:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L2665:while(1){if(k>>>0>=h>>>0){m=b;break L2663}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=2334;break L2665}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1}else{if((n&255)<194){p=2;q=2335;break L2665}if((n&255)<224){if((g-b|0)<2){p=1;q=2349;break L2665}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=2350;break L2665}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=2351;break L2665}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2;break}if((n&255)<240){if((g-b|0)<3){p=1;q=2337;break L2665}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=2338;break L2665}}else if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=2342;break L2665}}else{if((s&-64)<<24>>24!=-128){p=2;q=2336;break L2665}}t=r&255;if((t&192|0)!=128){p=2;q=2341;break L2665}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=2343;break L2665}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3;break}if((n&255)>=245){p=2;q=2346;break L2665}if((g-b|0)<4){p=1;q=2347;break L2665}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=2348;break L2665}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=2352;break L2665}}else{if((r&-64)<<24>>24!=-128){p=2;q=2353;break L2665}}u=t&255;if((u&192|0)!=128){p=2;q=2344;break L2665}t=s&255;if((t&192|0)!=128){p=2;q=2339;break L2665}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=2340;break L2665}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L2663}}if((q|0)==2334){return p|0}else if((q|0)==2335){return p|0}else if((q|0)==2336){return p|0}else if((q|0)==2349){return p|0}else if((q|0)==2350){return p|0}else if((q|0)==2351){return p|0}else if((q|0)==2352){return p|0}else if((q|0)==2346){return p|0}else if((q|0)==2347){return p|0}else if((q|0)==2348){return p|0}else if((q|0)==2343){return p|0}else if((q|0)==2344){return p|0}else if((q|0)==2340){return p|0}else if((q|0)==2341){return p|0}else if((q|0)==2342){return p|0}else if((q|0)==2353){return p|0}else if((q|0)==2337){return p|0}else if((q|0)==2338){return p|0}else if((q|0)==2339){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0|0;return p|0}function j3(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2730:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L2732:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L2730}n=j+1|0}else{if((k&255)<194){m=j;break L2730}if((k&255)<224){if((g-j|0)<2){m=j;break L2730}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L2730}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L2730}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L2730}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==224){if((o&-32)<<24>>24!=-96){r=2374;break L2732}}else if((l|0)==237){if((o&-32)<<24>>24!=-128){r=2376;break L2732}}else{if((o&-64)<<24>>24!=-128){r=2378;break L2732}}s=q&255;if((s&192|0)!=128){m=j;break L2730}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L2730}n=j+3|0;break}if((k&255)>=245){m=j;break L2730}t=j;if((g-t|0)<4){m=j;break L2730}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==244){if((s&-16)<<24>>24!=-128){r=2388;break L2732}}else if((l|0)==240){if((s+112&255)>=48){r=2386;break L2732}}else{if((s&-64)<<24>>24!=-128){r=2390;break L2732}}u=o&255;if((u&192|0)!=128){m=j;break L2730}o=q&255;if((o&192|0)!=128){m=j;break L2730}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L2730}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L2730}i=i+1|0;j=n}if((r|0)==2388){v=t-b|0;return v|0}else if((r|0)==2386){v=t-b|0;return v|0}else if((r|0)==2374){v=p-b|0;return v|0}else if((r|0)==2376){v=p-b|0;return v|0}else if((r|0)==2378){v=p-b|0;return v|0}else if((r|0)==2390){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function j4(b){b=b|0;return a[b+8|0]|0}function j5(a){a=a|0;return c[a+8>>2]|0}function j6(b){b=b|0;return a[b+9|0]|0}function j7(a){a=a|0;return c[a+12>>2]|0}function j8(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=j2(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function j9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return j3(c,d,e,1114111,0)|0}function ka(a){a=a|0;dt(a|0);lo(a);return}function kb(a){a=a|0;dt(a|0);lo(a);return}function kc(a){a=a|0;c[a>>2]=3776;ed(a+12|0);dt(a|0);lo(a);return}function kd(a){a=a|0;c[a>>2]=3776;ed(a+12|0);dt(a|0);return}function ke(a){a=a|0;c[a>>2]=3728;ed(a+16|0);dt(a|0);lo(a);return}function kf(a){a=a|0;c[a>>2]=3728;ed(a+16|0);dt(a|0);return}function kg(a,b){a=a|0;b=b|0;ei(a,b+12|0);return}function kh(a,b){a=a|0;b=b|0;ei(a,b+16|0);return}function ki(a,b){a=a|0;b=b|0;ej(a,1520,4);return}function kj(a,b){a=a|0;b=b|0;ew(a,1496,kR(1496)|0);return}function kk(a,b){a=a|0;b=b|0;ej(a,1488,5);return}function kl(a,b){a=a|0;b=b|0;ew(a,1456,kR(1456)|0);return}function km(b){b=b|0;var d=0;if((a[15208]|0)!=0){d=c[3420]|0;return d|0}if((bn(15208)|0)==0){d=c[3420]|0;return d|0}do{if((a[15096]|0)==0){if((bn(15096)|0)==0){break}lu(12720,0,168);a6(286,0,u|0)|0}}while(0);ef(12720,2096)|0;ef(12732,2088)|0;ef(12744,2080)|0;ef(12756,2064)|0;ef(12768,2048)|0;ef(12780,2040)|0;ef(12792,2024)|0;ef(12804,2016)|0;ef(12816,2008)|0;ef(12828,1976)|0;ef(12840,1968)|0;ef(12852,1960)|0;ef(12864,1944)|0;ef(12876,1936)|0;c[3420]=12720;d=c[3420]|0;return d|0}function kn(b){b=b|0;var d=0;if((a[15152]|0)!=0){d=c[3398]|0;return d|0}if((bn(15152)|0)==0){d=c[3398]|0;return d|0}do{if((a[15072]|0)==0){if((bn(15072)|0)==0){break}lu(11976,0,168);a6(162,0,u|0)|0}}while(0);er(11976,2560)|0;er(11988,2528)|0;er(12e3,2496)|0;er(12012,2456)|0;er(12024,2376)|0;er(12036,2344)|0;er(12048,2304)|0;er(12060,2288)|0;er(12072,2232)|0;er(12084,2216)|0;er(12096,2200)|0;er(12108,2184)|0;er(12120,2168)|0;er(12132,2152)|0;c[3398]=11976;d=c[3398]|0;return d|0}function ko(b){b=b|0;var d=0;if((a[15200]|0)!=0){d=c[3418]|0;return d|0}if((bn(15200)|0)==0){d=c[3418]|0;return d|0}do{if((a[15088]|0)==0){if((bn(15088)|0)==0){break}lu(12432,0,288);a6(186,0,u|0)|0}}while(0);ef(12432,320)|0;ef(12444,304)|0;ef(12456,296)|0;ef(12468,288)|0;ef(12480,280)|0;ef(12492,272)|0;ef(12504,264)|0;ef(12516,256)|0;ef(12528,208)|0;ef(12540,200)|0;ef(12552,184)|0;ef(12564,168)|0;ef(12576,120)|0;ef(12588,112)|0;ef(12600,104)|0;ef(12612,96)|0;ef(12624,280)|0;ef(12636,88)|0;ef(12648,80)|0;ef(12660,2624)|0;ef(12672,2616)|0;ef(12684,2608)|0;ef(12696,2600)|0;ef(12708,2592)|0;c[3418]=12432;d=c[3418]|0;return d|0}function kp(b){b=b|0;var d=0;if((a[15144]|0)!=0){d=c[3396]|0;return d|0}if((bn(15144)|0)==0){d=c[3396]|0;return d|0}do{if((a[15064]|0)==0){if((bn(15064)|0)==0){break}lu(11688,0,288);a6(134,0,u|0)|0}}while(0);er(11688,992)|0;er(11700,952)|0;er(11712,928)|0;er(11724,856)|0;er(11736,480)|0;er(11748,832)|0;er(11760,808)|0;er(11772,776)|0;er(11784,736)|0;er(11796,704)|0;er(11808,664)|0;er(11820,624)|0;er(11832,608)|0;er(11844,528)|0;er(11856,512)|0;er(11868,496)|0;er(11880,480)|0;er(11892,464)|0;er(11904,448)|0;er(11916,432)|0;er(11928,400)|0;er(11940,384)|0;er(11952,368)|0;er(11964,328)|0;c[3396]=11688;d=c[3396]|0;return d|0}function kq(b){b=b|0;var d=0;if((a[15216]|0)!=0){d=c[3422]|0;return d|0}if((bn(15216)|0)==0){d=c[3422]|0;return d|0}do{if((a[15104]|0)==0){if((bn(15104)|0)==0){break}lu(12888,0,288);a6(132,0,u|0)|0}}while(0);ef(12888,1032)|0;ef(12900,1024)|0;c[3422]=12888;d=c[3422]|0;return d|0}function kr(b){b=b|0;var d=0;if((a[15160]|0)!=0){d=c[3400]|0;return d|0}if((bn(15160)|0)==0){d=c[3400]|0;return d|0}do{if((a[15080]|0)==0){if((bn(15080)|0)==0){break}lu(12144,0,288);a6(262,0,u|0)|0}}while(0);er(12144,1056)|0;er(12156,1040)|0;c[3400]=12144;d=c[3400]|0;return d|0}function ks(b){b=b|0;if((a[15224]|0)!=0){return 13696}if((bn(15224)|0)==0){return 13696}ej(13696,1416,8);a6(278,13696,u|0)|0;return 13696}function kt(b){b=b|0;if((a[15168]|0)!=0){return 13608}if((bn(15168)|0)==0){return 13608}ew(13608,1376,kR(1376)|0);a6(208,13608,u|0)|0;return 13608}function ku(b){b=b|0;if((a[15248]|0)!=0){return 13744}if((bn(15248)|0)==0){return 13744}ej(13744,1344,8);a6(278,13744,u|0)|0;return 13744}function kv(b){b=b|0;if((a[15192]|0)!=0){return 13656}if((bn(15192)|0)==0){return 13656}ew(13656,1304,kR(1304)|0);a6(208,13656,u|0)|0;return 13656}function kw(b){b=b|0;if((a[15240]|0)!=0){return 13728}if((bn(15240)|0)==0){return 13728}ej(13728,1280,20);a6(278,13728,u|0)|0;return 13728}function kx(b){b=b|0;if((a[15184]|0)!=0){return 13640}if((bn(15184)|0)==0){return 13640}ew(13640,1192,kR(1192)|0);a6(208,13640,u|0)|0;return 13640}function ky(b){b=b|0;if((a[15232]|0)!=0){return 13712}if((bn(15232)|0)==0){return 13712}ej(13712,1176,11);a6(278,13712,u|0)|0;return 13712}function kz(b){b=b|0;if((a[15176]|0)!=0){return 13624}if((bn(15176)|0)==0){return 13624}ew(13624,1128,kR(1128)|0);a6(208,13624,u|0)|0;return 13624}function kA(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;ch[f&511](a);return}else{f=c[(c[d>>2]|0)+(e-1)>>2]|0;ch[f&511](a);return}}function kB(a){a=a|0;eq(12420);eq(12408);eq(12396);eq(12384);eq(12372);eq(12360);eq(12348);eq(12336);eq(12324);eq(12312);eq(12300);eq(12288);eq(12276);eq(12264);eq(12252);eq(12240);eq(12228);eq(12216);eq(12204);eq(12192);eq(12180);eq(12168);eq(12156);eq(12144);return}function kC(a){a=a|0;ed(13164);ed(13152);ed(13140);ed(13128);ed(13116);ed(13104);ed(13092);ed(13080);ed(13068);ed(13056);ed(13044);ed(13032);ed(13020);ed(13008);ed(12996);ed(12984);ed(12972);ed(12960);ed(12948);ed(12936);ed(12924);ed(12912);ed(12900);ed(12888);return}function kD(a){a=a|0;eq(11964);eq(11952);eq(11940);eq(11928);eq(11916);eq(11904);eq(11892);eq(11880);eq(11868);eq(11856);eq(11844);eq(11832);eq(11820);eq(11808);eq(11796);eq(11784);eq(11772);eq(11760);eq(11748);eq(11736);eq(11724);eq(11712);eq(11700);eq(11688);return}function kE(a){a=a|0;ed(12708);ed(12696);ed(12684);ed(12672);ed(12660);ed(12648);ed(12636);ed(12624);ed(12612);ed(12600);ed(12588);ed(12576);ed(12564);ed(12552);ed(12540);ed(12528);ed(12516);ed(12504);ed(12492);ed(12480);ed(12468);ed(12456);ed(12444);ed(12432);return}function kF(a){a=a|0;eq(12132);eq(12120);eq(12108);eq(12096);eq(12084);eq(12072);eq(12060);eq(12048);eq(12036);eq(12024);eq(12012);eq(12e3);eq(11988);eq(11976);return}function kG(a){a=a|0;ed(12876);ed(12864);ed(12852);ed(12840);ed(12828);ed(12816);ed(12804);ed(12792);ed(12780);ed(12768);ed(12756);ed(12744);ed(12732);ed(12720);return}function kH(a,b,c){a=a|0;b=b|0;c=c|0;return kI(0,a,b,(c|0)!=0?c:11208)|0}function kI(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?11200:f)|0;f=c[j>>2]|0;L14:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0|0;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L14}o=d+1|0;p=c[t+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L32:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L14}else{s=o;u=p;v=q;w=l}while(1){s=s+1|0;u=(w&255)-128|u<<6;v=v-1|0;if((u|0)>=0){break}if((v|0)==0){r=u;break L32}w=a[s]|0;if(((w&255)-128|0)>>>0>63){break L14}}c[j>>2]=0;c[m>>2]=u;k=e-v|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(bM()|0)>>2]=138;k=-1;i=g;return k|0}function kJ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L45:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L45}z=y?s:x;A=t-z|0;x=kK(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L45}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L56:do{if((r|0)==0){D=n}else{if((p|0)==0|(o|0)==0){D=n;break}else{E=p;F=o;G=n;H=q;I=r}while(1){J=kI(H,I,F,f)|0;if((J+2|0)>>>0<3){break}A=(c[j>>2]|0)+J|0;c[j>>2]=A;B=E-1|0;C=G+1|0;if((B|0)==0|(F|0)==(J|0)){D=C;break L56}else{E=B;F=F-J|0;G=C;H=H+4|0;I=A}}if((J|0)==0){c[j>>2]=0;D=G;break}else if((J|0)==(-1|0)){D=-1;break}else{c[f>>2]=0;D=G;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=c[j>>2];i=g;return D|0}function kK(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;h=c[e>>2]|0;do{if((g|0)==0){i=63}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=63;break}if((b|0)==0){l=k;m=h;n=f;i=74;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=94}}while(0);if((i|0)==63){if((b|0)==0){s=h;u=f;i=65}else{v=h;w=b;x=f;i=64}}L77:while(1){if((i|0)==94){i=0;h=d[p]|0;g=h>>>3;if((g-16|g+(o>>26))>>>0>7){i=95;break}g=p+1|0;y=h-128|o<<6;do{if((y|0)<0){h=(d[g]|0)-128|0;if(h>>>0>63){i=98;break L77}k=p+2|0;z=h|y<<6;if((z|0)>=0){A=z;B=k;break}h=(d[k]|0)-128|0;if(h>>>0>63){i=101;break L77}A=h|z<<6;B=p+3|0}else{A=y;B=g}}while(0);c[q>>2]=A;v=B;w=q+4|0;x=r-1|0;i=64;continue}else if((i|0)==64){i=0;if((x|0)==0){C=f;i=113;break}else{D=x;E=w;F=v}while(1){g=a[F]|0;do{if(((g&255)-1|0)>>>0<127){if((F&3|0)==0&D>>>0>3){G=D;H=E;I=F}else{J=F;K=E;L=D;M=g;break}while(1){N=c[I>>2]|0;if(((N-16843009|N)&-2139062144|0)!=0){i=88;break}c[H>>2]=N&255;c[H+4>>2]=d[I+1|0]|0;c[H+8>>2]=d[I+2|0]|0;O=I+4|0;P=H+16|0;c[H+12>>2]=d[I+3|0]|0;Q=G-4|0;if(Q>>>0>3){G=Q;H=P;I=O}else{i=89;break}}if((i|0)==88){i=0;J=I;K=H;L=G;M=N&255;break}else if((i|0)==89){i=0;J=O;K=P;L=Q;M=a[O]|0;break}}else{J=F;K=E;L=D;M=g}}while(0);R=M&255;if((R-1|0)>>>0>=127){break}c[K>>2]=R;g=L-1|0;if((g|0)==0){C=f;i=112;break L77}else{D=g;E=K+4|0;F=J+1|0}}g=R-194|0;if(g>>>0>50){S=L;T=K;U=J;i=105;break}o=c[t+(g<<2)>>2]|0;p=J+1|0;q=K;r=L;i=94;continue}else if((i|0)==65){i=0;g=a[s]|0;do{if(((g&255)-1|0)>>>0<127){if((s&3|0)!=0){V=s;W=u;X=g;break}h=c[s>>2]|0;if(((h-16843009|h)&-2139062144|0)==0){Y=u;Z=s}else{V=s;W=u;X=h&255;break}do{Z=Z+4|0;Y=Y-4|0;_=c[Z>>2]|0;}while(((_-16843009|_)&-2139062144|0)==0);V=Z;W=Y;X=_&255}else{V=s;W=u;X=g}}while(0);g=X&255;if((g-1|0)>>>0<127){s=V+1|0;u=W-1|0;i=65;continue}h=g-194|0;if(h>>>0>50){S=W;T=b;U=V;i=105;break}l=c[t+(h<<2)>>2]|0;m=V+1|0;n=W;i=74;continue}else if((i|0)==74){i=0;h=(d[m]|0)>>>3;if((h-16|h+(l>>26))>>>0>7){i=75;break}h=m+1|0;do{if((l&33554432|0)==0){$=h}else{if(((d[h]|0)-128|0)>>>0>63){i=78;break L77}g=m+2|0;if((l&524288|0)==0){$=g;break}if(((d[g]|0)-128|0)>>>0>63){i=81;break L77}$=m+3|0}}while(0);s=$;u=n-1|0;i=65;continue}}if((i|0)==81){aa=l;ab=m-1|0;ac=b;ad=n;i=104}else if((i|0)==75){aa=l;ab=m-1|0;ac=b;ad=n;i=104}else if((i|0)==78){aa=l;ab=m-1|0;ac=b;ad=n;i=104}else if((i|0)==95){aa=o;ab=p-1|0;ac=q;ad=r;i=104}else if((i|0)==98){aa=y;ab=p-1|0;ac=q;ad=r;i=104}else if((i|0)==101){aa=z;ab=p-1|0;ac=q;ad=r;i=104}else if((i|0)==112){return C|0}else if((i|0)==113){return C|0}if((i|0)==104){if((aa|0)==0){S=ad;T=ac;U=ab;i=105}else{ae=ac;af=ab}}do{if((i|0)==105){if((a[U]|0)!=0){ae=T;af=U;break}if((T|0)!=0){c[T>>2]=0;c[e>>2]=0}C=f-S|0;return C|0}}while(0);c[(bM()|0)>>2]=138;if((ae|0)==0){C=-1;return C|0}c[e>>2]=af;C=-1;return C|0}function kL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}k=l+4|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b+16|0;k=b|0;l=c[k>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){iX(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=127}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=127;break}a[l]=1;p=j;q=h}}while(0);if((o|0)==127){p=lk(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;do{if((d|0)==0){r=0}else{c[d>>2]=0;r=d}d=r+4|0;n=n-1|0;}while((n|0)!=0);n=p+(q<<2)|0;q=c[k>>2]|0;r=(c[f>>2]|0)-q|0;o=p+(g-(r>>2)<<2)|0;g=o;p=q;lv(g|0,p|0,r)|0;c[k>>2]=o;c[f>>2]=d;c[e>>2]=n;if((q|0)==0){return}if((q|0)==(j|0)){a[b+128|0]=0;return}else{lo(p);return}}function kM(a){a=a|0;return}function kN(a){a=a|0;return}function kO(a){a=a|0;return 1752|0}function kP(a){a=a|0;return}function kQ(a){a=a|0;return}function kR(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function kS(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((d|0)==0){return a|0}else{e=b;f=d;g=a}while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}return a|0}function kT(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}else{f=d}do{f=f-1|0;c[a+(f<<2)>>2]=c[b+(f<<2)>>2];}while((f|0)!=0);return a|0}else{if(e){return a|0}else{g=b;h=d;i=a}while(1){d=h-1|0;c[i>>2]=c[g>>2];if((d|0)==0){break}else{g=g+4|0;h=d;i=i+4|0}}return a|0}return 0}function kU(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((d|0)==0){return a|0}else{e=d;f=a}while(1){d=e-1|0;c[f>>2]=b;if((d|0)==0){break}else{e=d;f=f+4|0}}return a|0}function kV(a){a=a|0;c[a>>2]=3184;return}function kW(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function kX(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m-194|0;if(k>>>0>50){break}m=e+1|0;n=c[t+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>(((f*6|0)-6|0)>>>0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m-16|m+(n>>26))>>>0>7){break}m=k-128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)-128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)-128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(bM()|0)>>2]=138;j=-1;i=g;return j|0}function kY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[(bM()|0)>>2]=138;f=-1;return f|0}return 0}function kZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L283:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L283}x=w?r:s;y=s-x|0;w=k_(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L283}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L294:do{if((q|0)==0){B=m}else{if((o|0)==0|(n|0)==0){B=m;break}else{C=o;D=n;E=m;F=p;G=q}while(1){H=kY(F,c[G>>2]|0,0)|0;if((H+1|0)>>>0<2){break}y=(c[h>>2]|0)+4|0;c[h>>2]=y;z=D-1|0;A=E+1|0;if((C|0)==(H|0)|(z|0)==0){B=A;break L294}else{C=C-H|0;D=z;E=A;F=F+H|0;G=y}}if((H|0)!=0){B=-1;break}c[h>>2]=0;B=E}}while(0);if(!k){i=f;return B|0}c[b>>2]=c[h>>2];i=f;return B|0}function k_(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=kY(j,o,0)|0;if((k|0)==-1){l=-1;p=271;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=272;break}else{m=k;n=h;o=r}}if((p|0)==271){i=f;return l|0}else if((p|0)==272){i=f;return l|0}}L320:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L320}if(q>>>0>127){j=kY(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L320}}i=f;return l|0}else{s=e;t=b}}while(0);L332:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=267;break}if(m>>>0>127){n=kY(b,m,0)|0;if((n|0)==-1){l=-1;p=276;break}if(n>>>0>u>>>0){p=263;break}o=c[w>>2]|0;kY(v,o,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L332}else{u=z;v=y;w=m}}if((p|0)==276){i=f;return l|0}else if((p|0)==267){a[v]=0;x=u;break}else if((p|0)==263){l=e-u|0;i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function k$(a){a=a|0;lo(a);return}function k0(a){a=a|0;kM(a|0);return}function k1(a){a=a|0;kM(a|0);lo(a);return}function k2(a){a=a|0;kM(a|0);lo(a);return}function k3(a){a=a|0;kM(a|0);lo(a);return}function k4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=k8(b,11024,11008,-1)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}lu(f|0,0,56);c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;cw[c[(c[h>>2]|0)+28>>2]&31](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function k5(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;cw[c[(c[g>>2]|0)+28>>2]&31](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function k6(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;cw[c[(c[j>>2]|0)+28>>2]&31](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;cw[c[(c[j>>2]|0)+28>>2]&31](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=328;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=329;break}}if((m|0)==329){return}else if((m|0)==328){return}}function k7(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function k8(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;lu(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;cu[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}cf[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;if((j|0)==1){do{if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}if((c[m>>2]|0)==1){break}else{o=0}i=f;return o|0}}while(0);o=c[e>>2]|0;i=f;return o|0}else if((j|0)==0){if((c[n>>2]|0)!=1){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}o=(c[m>>2]|0)==1?c[b>>2]|0:0;i=f;return o|0}else{o=0;i=f;return o|0}return 0}function k9(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L489:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L491:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;cu[c[(c[v>>2]|0)+20>>2]&63](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L491}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=397;break L489}if((c[o>>2]&2|0)==0){B=397;break L489}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=396}else{D=x;B=393}}else{D=0;B=393}}while(0);do{if((B|0)==393){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)!=1){C=D;B=396;break}if((c[d+24>>2]|0)!=2){C=D;B=396;break}a[d+54|0]=1;if(D){B=397}else{B=398}}}while(0);if((B|0)==396){if(C){B=397}else{B=398}}if((B|0)==397){c[i>>2]=3;return}else if((B|0)==398){c[i>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;cf[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=436;break}if((c[b>>2]|0)==1){B=437;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;cf[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=429;break}}if((B|0)==429){return}else if((B|0)==436){return}else if((B|0)==437){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=440;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=432;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;cf[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=435;break}}if((B|0)==432){return}else if((B|0)==435){return}else if((B|0)==440){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=438;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;cf[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=439;break}}if((B|0)==438){return}else if((B|0)==439){return}}function la(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;cf[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;cu[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=453}else{if((a[j]&1)==0){m=1;n=453}}L591:do{if((n|0)==453){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=456;break}a[d+54|0]=1;if(m){break L591}}else{n=456}}while(0);if((n|0)==456){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function lb(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;cu[c[(c[p>>2]|0)+20>>2]&63](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L613:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;do{if((a[p]&1)!=0){break L613}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L613}}else{if((c[o>>2]|0)==1){break L613}if((c[q>>2]&2|0)==0){break L613}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;cu[c[(c[u>>2]|0)+20>>2]&63](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;}while(s>>>0<n>>>0)}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function lc(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function ld(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;cu[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function le(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[2804]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=11256+(h<<2)|0;j=11256+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[2804]=e&~(1<<g)}else{if(l>>>0<(c[2808]|0)>>>0){bY();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{bY();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[2806]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=11256+(p<<2)|0;m=11256+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[2804]=e&~(1<<r)}else{if(l>>>0<(c[2808]|0)>>>0){bY();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{bY();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[2806]|0;if((l|0)!=0){q=c[2809]|0;d=l>>>3;l=d<<1;f=11256+(l<<2)|0;k=c[2804]|0;h=1<<d;do{if((k&h|0)==0){c[2804]=k|h;s=f;t=11256+(l+2<<2)|0}else{d=11256+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[2808]|0)>>>0){s=g;t=d;break}bY();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[2806]=m;c[2809]=e;n=i;return n|0}l=c[2805]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[11520+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[2808]|0;if(r>>>0<i>>>0){bY();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){bY();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){bY();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){bY();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){bY();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{bY();return 0}}}while(0);L780:do{if((e|0)!=0){f=d+28|0;i=11520+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[2805]=c[2805]&~(1<<c[f>>2]);break L780}else{if(e>>>0<(c[2808]|0)>>>0){bY();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L780}}}while(0);if(v>>>0<(c[2808]|0)>>>0){bY();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[2806]|0;if((f|0)!=0){e=c[2809]|0;i=f>>>3;f=i<<1;q=11256+(f<<2)|0;k=c[2804]|0;g=1<<i;do{if((k&g|0)==0){c[2804]=k|g;y=q;z=11256+(f+2<<2)|0}else{i=11256+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[2808]|0)>>>0){y=l;z=i;break}bY();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[2806]=p;c[2809]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[2805]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[11520+(A<<2)>>2]|0;L828:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L828}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[11520+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[2806]|0)-g|0)>>>0){o=g;break}q=K;m=c[2808]|0;if(q>>>0<m>>>0){bY();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){bY();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){bY();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){bY();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){bY();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{bY();return 0}}}while(0);L878:do{if((e|0)!=0){i=K+28|0;m=11520+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[2805]=c[2805]&~(1<<c[i>>2]);break L878}else{if(e>>>0<(c[2808]|0)>>>0){bY();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L878}}}while(0);if(L>>>0<(c[2808]|0)>>>0){bY();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=11256+(e<<2)|0;r=c[2804]|0;j=1<<i;do{if((r&j|0)==0){c[2804]=r|j;O=m;P=11256+(e+2<<2)|0}else{i=11256+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[2808]|0)>>>0){O=d;P=i;break}bY();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=11520+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[2805]|0;l=1<<Q;if((m&l|0)==0){c[2805]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=692;break}else{l=l<<1;m=j}}if((T|0)==692){if(S>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[2808]|0;if(m>>>0<i>>>0){bY();return 0}if(j>>>0<i>>>0){bY();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[2806]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[2809]|0;if(S>>>0>15){R=J;c[2809]=R+o;c[2806]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[2806]=0;c[2809]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[2807]|0;if(o>>>0<J>>>0){S=J-o|0;c[2807]=S;J=c[2810]|0;K=J;c[2810]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[2794]|0)==0){J=bW(8)|0;if((J-1&J|0)==0){c[2796]=J;c[2795]=J;c[2797]=-1;c[2798]=2097152;c[2799]=0;c[2915]=0;c[2794]=(ce(0)|0)&-16^1431655768;break}else{bY();return 0}}}while(0);J=o+48|0;S=c[2796]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[2914]|0;do{if((O|0)!=0){P=c[2912]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L970:do{if((c[2915]&4|0)==0){O=c[2810]|0;L972:do{if((O|0)==0){T=722}else{L=O;P=11664;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=722;break L972}else{P=M}}if((P|0)==0){T=722;break}L=R-(c[2807]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bL(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=731}}while(0);do{if((T|0)==722){O=bL(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[2795]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[2912]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[2914]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bL($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=731}}while(0);L992:do{if((T|0)==731){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=742;break L970}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[2796]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bL(O|0)|0)==-1){bL(m|0)|0;W=Y;break L992}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=742;break L970}}}while(0);c[2915]=c[2915]|4;ad=W;T=739}else{ad=0;T=739}}while(0);do{if((T|0)==739){if(S>>>0>=2147483647){break}W=bL(S|0)|0;Z=bL(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=742}}}while(0);do{if((T|0)==742){ad=(c[2912]|0)+aa|0;c[2912]=ad;if(ad>>>0>(c[2913]|0)>>>0){c[2913]=ad}ad=c[2810]|0;L1012:do{if((ad|0)==0){S=c[2808]|0;if((S|0)==0|ab>>>0<S>>>0){c[2808]=ab}c[2916]=ab;c[2917]=aa;c[2919]=0;c[2813]=c[2794];c[2812]=-1;S=0;do{Y=S<<1;ac=11256+(Y<<2)|0;c[11256+(Y+3<<2)>>2]=ac;c[11256+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[2810]=ab+ae;c[2807]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[2811]=c[2798]}else{S=11664;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=754;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==754){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[2810]|0;Y=(c[2807]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[2810]=Z+ai;c[2807]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[2811]=c[2798];break L1012}}while(0);if(ab>>>0<(c[2808]|0)>>>0){c[2808]=ab}S=ab+aa|0;Y=11664;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=764;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==764){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[2810]|0)){J=(c[2807]|0)+K|0;c[2807]=J;c[2810]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[2809]|0)){J=(c[2806]|0)+K|0;c[2806]=J;c[2809]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1057:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=11256+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[2808]|0)>>>0){bY();return 0}if((c[U+12>>2]|0)==(Z|0)){break}bY();return 0}}while(0);if((Q|0)==(U|0)){c[2804]=c[2804]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[2808]|0)>>>0){bY();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}bY();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[2808]|0)>>>0){bY();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){bY();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{bY();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=11520+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[2805]=c[2805]&~(1<<c[P>>2]);break L1057}else{if(m>>>0<(c[2808]|0)>>>0){bY();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L1057}}}while(0);if(an>>>0<(c[2808]|0)>>>0){bY();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=11256+(V<<2)|0;P=c[2804]|0;m=1<<J;do{if((P&m|0)==0){c[2804]=P|m;as=X;at=11256+(V+2<<2)|0}else{J=11256+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[2808]|0)>>>0){as=U;at=J;break}bY();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=11520+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[2805]|0;Q=1<<au;if((X&Q|0)==0){c[2805]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=837;break}else{Q=Q<<1;X=m}}if((T|0)==837){if(aw>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[2808]|0;if(X>>>0<$>>>0){bY();return 0}if(m>>>0<$>>>0){bY();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=11664;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[2810]=ab+aB;c[2807]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[2811]=c[2798];c[ac+4>>2]=27;c[W>>2]=c[2916];c[W+4>>2]=c[11668>>2];c[W+8>>2]=c[11672>>2];c[W+12>>2]=c[11676>>2];c[2916]=ab;c[2917]=aa;c[2919]=0;c[2918]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=11256+(K<<2)|0;S=c[2804]|0;m=1<<W;do{if((S&m|0)==0){c[2804]=S|m;aC=Z;aD=11256+(K+2<<2)|0}else{W=11256+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[2808]|0)>>>0){aC=Q;aD=W;break}bY();return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=11520+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[2805]|0;Q=1<<aE;if((Z&Q|0)==0){c[2805]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=872;break}else{Q=Q<<1;Z=m}}if((T|0)==872){if(aG>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[2808]|0;if(Z>>>0<m>>>0){bY();return 0}if(_>>>0<m>>>0){bY();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[2807]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[2807]=_;ad=c[2810]|0;Q=ad;c[2810]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(bM()|0)>>2]=12;n=0;return n|0}function lf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[2808]|0;if(b>>>0<e>>>0){bY()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){bY()}h=f&-8;i=a+(h-8)|0;j=i;L1229:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){bY()}if((n|0)==(c[2809]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[2806]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=11256+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){bY()}if((c[k+12>>2]|0)==(n|0)){break}bY()}}while(0);if((s|0)==(k|0)){c[2804]=c[2804]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){bY()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}bY()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){bY()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){bY()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){bY()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{bY()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=11520+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[2805]=c[2805]&~(1<<c[v>>2]);q=n;r=o;break L1229}else{if(p>>>0<(c[2808]|0)>>>0){bY()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1229}}}while(0);if(A>>>0<(c[2808]|0)>>>0){bY()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2808]|0)>>>0){bY()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[2808]|0)>>>0){bY()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){bY()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){bY()}do{if((e&2|0)==0){if((j|0)==(c[2810]|0)){B=(c[2807]|0)+r|0;c[2807]=B;c[2810]=q;c[q+4>>2]=B|1;if((q|0)==(c[2809]|0)){c[2809]=0;c[2806]=0}if(B>>>0<=(c[2811]|0)>>>0){return}lh(0)|0;return}if((j|0)==(c[2809]|0)){B=(c[2806]|0)+r|0;c[2806]=B;c[2809]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1334:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=11256+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[2808]|0)>>>0){bY()}if((c[u+12>>2]|0)==(j|0)){break}bY()}}while(0);if((g|0)==(u|0)){c[2804]=c[2804]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[2808]|0)>>>0){bY()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}bY()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[2808]|0)>>>0){bY()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[2808]|0)>>>0){bY()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){bY()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{bY()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=11520+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[2805]=c[2805]&~(1<<c[t>>2]);break L1334}else{if(f>>>0<(c[2808]|0)>>>0){bY()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1334}}}while(0);if(E>>>0<(c[2808]|0)>>>0){bY()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[2808]|0)>>>0){bY()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[2808]|0)>>>0){bY()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[2809]|0)){H=B;break}c[2806]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=11256+(d<<2)|0;A=c[2804]|0;E=1<<r;do{if((A&E|0)==0){c[2804]=A|E;I=e;J=11256+(d+2<<2)|0}else{r=11256+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[2808]|0)>>>0){I=h;J=r;break}bY()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=11520+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[2805]|0;d=1<<K;do{if((r&d|0)==0){c[2805]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1051;break}else{A=A<<1;J=E}}if((N|0)==1051){if(M>>>0<(c[2808]|0)>>>0){bY()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[2808]|0;if(J>>>0<E>>>0){bY()}if(B>>>0<E>>>0){bY()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[2812]|0)-1|0;c[2812]=q;if((q|0)==0){O=11672}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[2812]=-1;return}function lg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=le(b)|0;return d|0}if(b>>>0>4294967231){c[(bM()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=li(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=le(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;lv(f|0,a|0,e)|0;lf(a);d=f;return d|0}function lh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[2794]|0)==0){b=bW(8)|0;if((b-1&b|0)==0){c[2796]=b;c[2795]=b;c[2797]=-1;c[2798]=2097152;c[2799]=0;c[2915]=0;c[2794]=(ce(0)|0)&-16^1431655768;break}else{bY();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[2810]|0;if((b|0)==0){d=0;return d|0}e=c[2807]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[2796]|0;g=ag((((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0,f)|0;h=b;i=11664;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bL(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bL(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bL(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[2912]=(c[2912]|0)-j;h=c[2810]|0;m=(c[2807]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[2810]=j+o;c[2807]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[2811]=c[2798];d=(i|0)!=(l|0)|0;return d|0}}while(0);if((c[2807]|0)>>>0<=(c[2811]|0)>>>0){d=0;return d|0}c[2811]=-1;d=0;return d|0}function li(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[2808]|0;if(g>>>0<j>>>0){bY();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){bY();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){bY();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[2796]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;lj(g+b|0,k);n=a;return n|0}if((i|0)==(c[2810]|0)){k=(c[2807]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[2810]=g+b;c[2807]=l;n=a;return n|0}if((i|0)==(c[2809]|0)){l=(c[2806]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[2806]=q;c[2809]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L1555:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=11256+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){bY();return 0}if((c[l+12>>2]|0)==(i|0)){break}bY();return 0}}while(0);if((k|0)==(l|0)){c[2804]=c[2804]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){bY();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}bY();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){bY();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){bY();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){bY();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{bY();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=11520+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[2805]=c[2805]&~(1<<c[t>>2]);break L1555}else{if(s>>>0<(c[2808]|0)>>>0){bY();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L1555}}}while(0);if(y>>>0<(c[2808]|0)>>>0){bY();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[2808]|0)>>>0){bY();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;lj(g+b|0,q);n=a;return n|0}return 0}function lj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L1631:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[2808]|0;if(i>>>0<l>>>0){bY()}if((j|0)==(c[2809]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[2806]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=11256+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){bY()}if((c[p+12>>2]|0)==(j|0)){break}bY()}}while(0);if((q|0)==(p|0)){c[2804]=c[2804]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){bY()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}bY()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){bY()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){bY()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){bY()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{bY()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=11520+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[2805]=c[2805]&~(1<<c[t>>2]);n=j;o=k;break L1631}else{if(m>>>0<(c[2808]|0)>>>0){bY()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L1631}}}while(0);if(y>>>0<(c[2808]|0)>>>0){bY()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2808]|0)>>>0){bY()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[2808]|0)>>>0){bY()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[2808]|0;if(e>>>0<a>>>0){bY()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[2810]|0)){A=(c[2807]|0)+o|0;c[2807]=A;c[2810]=n;c[n+4>>2]=A|1;if((n|0)!=(c[2809]|0)){return}c[2809]=0;c[2806]=0;return}if((f|0)==(c[2809]|0)){A=(c[2806]|0)+o|0;c[2806]=A;c[2809]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L1730:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=11256+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){bY()}if((c[g+12>>2]|0)==(f|0)){break}bY()}}while(0);if((t|0)==(g|0)){c[2804]=c[2804]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){bY()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}bY()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){bY()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){bY()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){bY()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{bY()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=11520+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[2805]=c[2805]&~(1<<c[l>>2]);break L1730}else{if(m>>>0<(c[2808]|0)>>>0){bY()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L1730}}}while(0);if(C>>>0<(c[2808]|0)>>>0){bY()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[2808]|0)>>>0){bY()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[2808]|0)>>>0){bY()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[2809]|0)){F=A;break}c[2806]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=11256+(z<<2)|0;C=c[2804]|0;b=1<<o;do{if((C&b|0)==0){c[2804]=C|b;G=y;H=11256+(z+2<<2)|0}else{o=11256+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[2808]|0)>>>0){G=d;H=o;break}bY()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=11520+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[2805]|0;z=1<<I;if((o&z|0)==0){c[2805]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=1357;break}else{I=I<<1;J=G}}if((L|0)==1357){if(K>>>0<(c[2808]|0)>>>0){bY()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[2808]|0;if(J>>>0<I>>>0){bY()}if(L>>>0<I>>>0){bY()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function lk(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=le(b)|0;if((d|0)!=0){e=1401;break}a=(I=c[3764]|0,c[3764]=I+0,I);if((a|0)==0){break}cq[a&3]()}if((e|0)==1401){return d|0}d=b5(4)|0;c[d>>2]=3152;bw(d|0,9416,34);return 0}function ll(a){a=a|0;return lk(a)|0}function lm(a){a=a|0;return}function ln(a){a=a|0;return 1360|0}function lo(a){a=a|0;if((a|0)==0){return}lf(a);return}function lp(a){a=a|0;lo(a);return}function lq(a){a=a|0;lo(a);return}function lr(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((aQ(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=1431}else{if((e|0)>0){v=0.0;w=e;x=l;y=1431}else{z=0.0;A=0.0}}if((y|0)==1431){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10|0)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(bM()|0)>>2]=34;N=1.0;O=8;P=511;y=1448}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=1448}}if((y|0)==1448){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=1448}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function ls(a,b,c){a=a|0;b=b|0;c=c|0;return+(+lr(a,b))}function lt(){var a=0;a=b5(4)|0;c[a>>2]=3152;bw(a|0,9416,34)}function lu(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function lv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function lw(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{lv(b,c,d)|0}}function lx(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function ly(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function lz(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function lA(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function lB(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function lC(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function lD(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function lE(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function lF(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function lG(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c)|0;f=a>>>16;a=(e>>>16)+(ag(d,f)|0)|0;d=b>>>16;b=ag(d,c)|0;return(K=(a>>>16)+(ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function lH(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=lA(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=lA((lM(i,b,lA(g^c,h^d,g,h)|0,K,0)|0)^a,K^e,a,e)|0;return(K=K,f)|0}function lI(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=lA(h^a,j^b,h,j)|0;b=K;a=lA(k^d,l^e,k,l)|0;lM(m,b,a,K,g)|0;a=lA(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,a)|0}function lJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=lG(e,a)|0;f=K;return(K=(ag(b,a)|0)+(ag(d,e)|0)+f|f&0,c|0|0)|0}function lK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=lM(a,b,c,d,0)|0;return(K=K,e)|0}function lL(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;lM(a,b,d,e,g)|0;i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function lM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((lF(l|0)|0)>>>0);return(K=n,o)|0}p=(lE(l|0)|0)-(lE(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(lE(l|0)|0)-(lE(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(lE(j|0)|0)+33-(lE(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(K=n,o)|0}else{p=lF(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=lz(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;lA(e,k,j,a)|0;b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=lA(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(J|0)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function lN(){b6()}function lO(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;cf[a&7](b|0,c|0,d|0,e|0,f|0)}function lP(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;cg[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function lQ(a,b){a=a|0;b=b|0;ch[a&511](b|0)}function lR(a,b,c){a=a|0;b=b|0;c=c|0;ci[a&127](b|0,c|0)}function lS(a,b,c){a=a|0;b=b|0;c=c|0;return cj[a&63](b|0,c|0)|0}function lT(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return ck[a&31](b|0,c|0,d|0,e|0,f|0)|0}function lU(a,b){a=a|0;b=b|0;return cl[a&255](b|0)|0}function lV(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cm[a&63](b|0,c|0,d|0)|0}function lW(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;cn[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function lX(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;co[a&7](b|0,c|0,d|0)}function lY(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;cp[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function lZ(a){a=a|0;cq[a&3]()}function l_(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return cr[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function l$(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;cs[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function l0(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ct[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function l1(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;cu[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function l2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return cv[a&15](b|0,c|0,d|0,e|0)|0}function l3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;cw[a&31](b|0,c|0,d|0,e|0)}function l4(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0)}function l5(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(1)}function l6(a){a=a|0;ah(2)}function l7(a,b){a=a|0;b=b|0;ah(3)}function l8(a,b){a=a|0;b=b|0;ah(4);return 0}function l9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(5);return 0}function ma(a){a=a|0;ah(6);return 0}function mb(a,b,c){a=a|0;b=b|0;c=c|0;ah(7);return 0}function mc(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(8)}function md(a,b,c){a=a|0;b=b|0;c=c|0;ah(9)}function me(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(10)}function mf(){ah(11)}function mg(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(12);return 0}function mh(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(13)}function mi(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(14)}function mj(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(15)}function mk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(16);return 0}function ml(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17)}
// EMSCRIPTEN_END_FUNCS
var cf=[l4,l4,la,l4,k7,l4,k9,l4];var cg=[l5,l5,ha,l5,hj,l5,hm,l5,iO,l5,gZ,l5,gX,l5,iH,l5,g5,l5,g9,l5,hn,l5,gJ,l5,gE,l5,g8,l5,gt,l5,hk,l5,gH,l5,gv,l5,gq,l5,gr,l5,gk,l5,gu,l5,go,l5,gm,l5,gA,l5,gz,l5,gx,l5,ho,l5,f7,l5,g6,l5,gb,l5,f3,l5,f5,l5,f9,l5,f0,l5,gh,l5,gg,l5,gd,l5,fZ,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5,l5];var ch=[l6,l6,iR,l6,fT,l6,gR,l6,d5,l6,eV,l6,i2,l6,dL,l6,dz,l6,hy,l6,gB,l6,d$,l6,d4,l6,gi,l6,fN,l6,fJ,l6,da,l6,lm,l6,cZ,l6,d0,l6,je,l6,jh,l6,hi,l6,gj,l6,kV,l6,fD,l6,iM,l6,dm,l6,jf,l6,c$,l6,fg,l6,fU,l6,h5,l6,i9,l6,kd,l6,jj,l6,kP,l6,db,l6,kc,l6,fH,l6,d4,l6,fR,l6,hW,l6,kf,l6,jg,l6,lf,l6,iF,l6,kb,l6,fj,l6,dy,l6,fQ,l6,d0,l6,kA,l6,gC,l6,dU,l6,c_,l6,c9,l6,h6,l6,ff,l6,fp,l6,hw,l6,hh,l6,fK,l6,h$,l6,lq,l6,eU,l6,kC,l6,kD,l6,i8,l6,fE,l6,e0,l6,k2,l6,jH,l6,jF,l6,kN,l6,fh,l6,fI,l6,ii,l6,ds,l6,ib,l6,fF,l6,kF,l6,kQ,l6,jX,l6,dF,l6,cV,l6,jc,l6,hx,l6,iq,l6,k$,l6,ka,l6,hM,l6,iG,l6,kE,l6,hV,l6,gQ,l6,fM,l6,c8,l6,fO,l6,fl,l6,eb,l6,ix,l6,ip,l6,ke,l6,eq,l6,d6,l6,cY,l6,kN,l6,k3,l6,fo,l6,ec,l6,fe,l6,cT,l6,dG,l6,fC,l6,iL,l6,c6,l6,c7,l6,fa,l6,fn,l6,dM,l6,jk,l6,fL,l6,ic,l6,g3,l6,h0,l6,iW,l6,iB,l6,fk,l6,e$,l6,fm,l6,kB,l6,g4,l6,k1,l6,iS,l6,dl,l6,k0,l6,hz,l6,ij,l6,ed,l6,ji,l6,d3,l6,fi,l6,kG,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6,l6];var ci=[l7,l7,kk,l7,ig,l7,dA,l7,kh,l7,hS,l7,kg,l7,dn,l7,iQ,l7,h8,l7,h_,l7,hT,l7,ia,l7,hZ,l7,hX,l7,ih,l7,jb,l7,hQ,l7,dH,l7,hU,l7,id,l7,kj,l7,dc,l7,h2,l7,d2,l7,h1,l7,kl,l7,hR,l7,h4,l7,ki,l7,hP,l7,ey,l7,iU,l7,dN,l7,h7,l7,hO,l7,hN,l7,hY,l7,eF,l7,h9,l7,h3,l7,ie,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7,l7];var cj=[l8,l8,ju,l8,dQ,l8,i$,l8,iZ,l8,dD,l8,dJ,l8,jq,l8,c4,l8,dj,l8,jw,l8,fb,l8,js,l8,c2,l8,eE,l8,dp,l8,eD,l8,dw,l8,eK,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8,l8];var ck=[l9,l9,jO,l9,jM,l9,j9,l9,jz,l9,i4,l9,jW,l9,fA,l9,i6,l9,jE,l9,jK,l9,fy,l9,jZ,l9,l9,l9,l9,l9,l9,l9];var cl=[ma,ma,kz,ma,hH,ma,eC,ma,kp,ma,eZ,ma,kx,ma,hD,ma,jL,ma,jR,ma,g2,ma,kn,ma,dP,ma,e4,ma,eJ,ma,kt,ma,kr,ma,j_,ma,kO,ma,dW,ma,j7,ma,j4,ma,ks,ma,jQ,ma,dh,ma,j5,ma,eA,ma,hL,ma,ku,ma,dO,ma,dv,ma,hE,ma,jD,ma,ky,ma,j0,ma,hJ,ma,km,ma,dB,ma,j$,ma,jN,ma,fx,ma,hC,ma,dC,ma,j6,ma,eB,ma,eH,ma,dI,ma,di,ma,hF,ma,jC,ma,jB,ma,ln,ma,eI,ma,hA,ma,ko,ma,jA,ma,hB,ma,dV,ma,hG,ma,hI,ma,kq,ma,hK,ma,hg,ma,c1,ma,kw,ma,kv,ma,jP,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma,ma];var cm=[mb,mb,fz,mb,jv,mb,jt,mb,k4,mb,iN,mb,i0,mb,fB,mb,d7,mb,e_,mb,eY,mb,jm,mb,eG,mb,iT,mb,i1,mb,dd,mb,jr,mb,e3,mb,dZ,mb,jx,mb,ez,mb,e5,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb];var cn=[mc,mc,g0,mc,g_,mc,gO,mc,gL,mc,mc,mc,mc,mc,mc,mc];var co=[md,md,dY,md,fG,md,md,md];var cp=[me,me,hv,me,hu,me,il,me,iu,me,is,me,iy,me,me,me];var cq=[mf,mf,lN,mf];var cr=[mg,mg,i_,mg,jJ,mg,jV,mg,jy,mg,jY,mg,j8,mg,jI,mg,jG,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg];var cs=[mh,mh,hq,mh,hc,mh,mh,mh];var ct=[mi,mi,iI,mi,iC,mi,mi,mi];var cu=[mj,mj,lb,mj,gY,mj,gS,mj,ld,mj,g1,mj,iP,mj,eN,mj,dg,mj,gT,mj,gF,mj,gI,mj,gD,mj,c0,mj,gU,mj,lc,mj,eL,mj,iV,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj,mj];var cv=[mk,mk,jn,mk,jo,mk,i5,mk,i3,mk,jp,mk,mk,mk,mk,mk];var cw=[ml,ml,c3,ml,k5,ml,k6,ml,eM,ml,kW,ml,eO,ml,de,ml,fS,ml,fP,ml,ml,ml,ml,ml,ml,ml,ml,ml,ml,ml,ml,ml];return{_strlen:lx,_free:lf,_main:cX,_realloc:lg,_memmove:lw,__GLOBAL__I_a:dS,_memset:lu,_malloc:le,_memcpy:lv,_strcpy:ly,runPostSets:cN,stackAlloc:cx,stackSave:cy,stackRestore:cz,setThrew:cA,setTempRet0:cD,setTempRet1:cE,setTempRet2:cF,setTempRet3:cG,setTempRet4:cH,setTempRet5:cI,setTempRet6:cJ,setTempRet7:cK,setTempRet8:cL,setTempRet9:cM,dynCall_viiiii:lO,dynCall_viiiiiii:lP,dynCall_vi:lQ,dynCall_vii:lR,dynCall_iii:lS,dynCall_iiiiii:lT,dynCall_ii:lU,dynCall_iiii:lV,dynCall_viiiiif:lW,dynCall_viii:lX,dynCall_viiiiiiii:lY,dynCall_v:lZ,dynCall_iiiiiiiii:l_,dynCall_viiiiiiiii:l$,dynCall_viiiiiif:l0,dynCall_viiiiii:l1,dynCall_iiiii:l2,dynCall_viiii:l3}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "__isFloat": __isFloat, "_strtoull": _strtoull, "_fflush": _fflush, "_clGetPlatformIDs": _clGetPlatformIDs, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_clReleaseCommandQueue": _clReleaseCommandQueue, "_read": _read, "_clGetContextInfo": _clGetContextInfo, "_strstr": _strstr, "_fsync": _fsync, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "_clReleaseMemObject": _clReleaseMemObject, "_clReleaseContext": _clReleaseContext, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "_llvm_lifetime_start": _llvm_lifetime_start, "___setErrNo": ___setErrNo, "_clCreateContextFromType": _clCreateContextFromType, "_isxdigit": _isxdigit, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "_asprintf": _asprintf, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___locale_mb_cur_max": ___locale_mb_cur_max, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_call_unexpected": ___cxa_call_unexpected, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_clReleaseKernel": _clReleaseKernel, "_llvm_eh_exception": _llvm_eh_exception, "_pread": _pread, "_fopen": _fopen, "_open": _open, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clReleaseProgram": _clReleaseProgram, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_clSetKernelArg": _clSetKernelArg, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "__ZSt9terminatev": __ZSt9terminatev, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_clCreateBuffer": _clCreateBuffer, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_vsprintf": _vsprintf, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_isdigit": _isdigit, "_strtoll": _strtoll, "__reallyNegative": __reallyNegative, "_clCreateCommandQueue": _clCreateCommandQueue, "_clBuildProgram": _clBuildProgram, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "_fseek": _fseek, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_pure_virtual": ___cxa_pure_virtual, "_clCreateKernel": _clCreateKernel, "_vasprintf": _vasprintf, "_clCreateProgramWithSource": _clCreateProgramWithSource, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "_stdout": _stdout, "___fsmu8": ___fsmu8, "___dso_handle": ___dso_handle }, buffer);
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
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
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
