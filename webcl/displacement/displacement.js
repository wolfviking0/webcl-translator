// Note: Some Emscripten settings will significantly limit the speed of the generated code.
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
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
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
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
    assert(ptr + i < TOTAL_MEMORY);
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
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
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
STATICTOP = STATIC_BASE + 5312;
/* memory initializer */ allocate([0,0,128,63,0,0,128,63,0,0,128,63,0,0,128,63,0,0,128,63,0,0,128,63,0,0,128,63,0,0,128,63,205,204,204,61,0,0,0,0,205,204,204,61,205,204,204,61,205,204,204,61,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,128,191,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,63,0,0,0,63,0,0,0,63,0,0,128,63,67,80,85,0,0,0,0,0,71,80,85,0,0,0,0,0,91,37,115,93,32,67,111,109,112,117,116,101,58,32,37,51,46,50,102,32,109,115,32,32,68,105,115,112,108,97,121,58,32,37,51,46,50,102,32,102,112,115,32,40,37,115,41,10,0,0,0,0,0,0,0,0,67,111,110,110,101,99,116,105,110,103,32,116,111,32,37,115,32,37,115,46,46,46,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,100,101,118,105,99,101,32,105,110,102,111,33,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,109,97,110,100,32,113,117,101,117,101,33,10,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,115,32,102,111,114,32,99,111,110,116,101,120,116,33,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,112,117,116,101,32,99,111,110,116,101,120,116,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,99,97,116,101,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,111,32,73,110,112,117,116,86,101,114,116,101,120,66,117,102,102,101,114,33,10,0,0,0,67,114,101,97,116,105,110,103,32,74,105,116,116,101,114,32,84,101,120,116,117,114,101,46,46,46,10,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,117,116,112,117,116,78,111,114,109,97,108,66,117,102,102,101,114,33,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,117,116,112,117,116,86,101,114,116,101,120,66,117,102,102,101,114,33,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,73,110,112,117,116,86,101,114,116,101,120,66,117,102,102,101,114,33,32,37,100,10,0,65,108,108,111,99,97,116,105,110,103,32,98,117,102,102,101,114,115,32,111,110,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,46,46,46,10,0,0,0,0,0,0,0,0,77,97,120,105,109,117,109,32,87,111,114,107,103,114,111,117,112,32,83,105,122,101,32,39,37,100,39,10,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,105,110,102,111,33,32,37,100,10,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,107,101,114,110,101,108,33,10,0,0,0,0,0,0,0,0,100,105,115,112,108,97,99,101,0,0,0,0,0,0,0,0,67,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,39,37,115,39,46,46,46,10,0,0,0,0,0,0,0,0,37,115,10,0,0,0,0,0,67,114,101,97,116,105,110,103,32,76,105,103,104,116,32,80,114,111,98,101,32,84,101,120,116,117,114,101,32,40,37,100,32,120,32,37,100,41,46,46,46,46,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,112,114,111,103,114,97,109,32,101,120,101,99,117,116,97,98,108,101,33,10,0,0,0,0,0,66,117,105,108,100,105,110,103,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,46,46,46,10,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,33,32,37,100,10,0,0,0,0,100,105,115,112,108,97,99,101,109,101,110,116,95,107,101,114,110,101,108,46,99,108,0,0,76,111,97,100,105,110,103,32,107,101,114,110,101,108,32,115,111,117,114,99,101,32,102,114,111,109,32,102,105,108,101,32,39,37,115,39,46,46,46,10,0,0,0,0,0,0,0,0,83,101,116,116,105,110,103,32,117,112,32,67,111,109,112,117,116,101,46,46,46,10,0,0,83,116,97,114,116,105,110,103,32,101,118,101,110,116,32,108,111,111,112,46,46,46,10,0,70,97,105,108,101,100,32,116,111,32,115,101,116,117,112,32,79,112,101,110,67,76,32,115,116,97,116,101,33,32,69,114,114,111,114,32,37,100,10,0,70,97,105,108,101,100,32,116,111,32,115,101,116,117,112,32,79,112,101,110,71,76,32,115,116,97,116,101,33,0,0,0,80,111,108,121,103,111,110,79,102,102,115,101,116,66,105,97,115,32,61,32,37,102,10,0,76,111,97,100,105,110,103,32,76,105,103,104,116,32,80,114,111,98,101,32,34,37,115,34,10,0,0,0,0,0,0,0,80,111,108,121,103,111,110,79,102,102,115,101,116,83,99,97,108,101,32,61,32,37,102,10,0,0,0,0,0,0,0,0,65,110,105,109,97,116,101,32,61,32,37,100,10,0,0,0,70,114,101,115,110,101,108,80,111,119,101,114,32,61,32,37,102,10,0,0,0,0,0,0,70,114,101,115,110,101,108,83,99,97,108,101,32,61,32,37,102,10,0,0,0,0,0,0,70,114,101,115,110,101,108,66,105,97,115,32,61,32,37,102,10,0,0,0,0,0,0,0,67,104,114,111,109,97,116,105,99,68,105,115,112,101,114,115,105,111,110,32,61,32,37,102,10,0,0,0,0,0,0,0,82,101,102,114,97,99,116,105,118,101,73,110,100,101,120,32,61,32,37,102,10,0,0,0,83,104,97,100,111,119,77,97,112,83,111,102,116,110,101,115,115,32,61,32,37,102,10,0,82,111,117,103,104,110,101,115,115,32,61,32,37,102,10,0,79,99,116,97,118,101,115,32,61,32,37,102,10,0,0,0,69,114,114,111,114,58,32,79,112,101,110,71,76,32,71,101,116,32,69,114,114,111,114,58,32,37,100,10,0,0,0,0,73,110,99,114,101,109,101,110,116,32,61,32,37,102,10,0,76,97,99,117,110,97,114,105,116,121,32,61,32,37,102,10,0,0,0,0,0,0,0,0,65,109,112,108,105,116,117,100,101,32,61,32,37,102,10,0,70,114,101,113,117,101,110,99,121,32,61,32,37,102,10,0,101,114,114,111,114,32,37,100,32,102,114,111,109,32,114,101,99,111,109,112,117,116,101,33,10,0,0,0,0,0,0,0,115,107,121,98,111,120,46,102,114,97,103,0,0,0,0,0,115,107,121,98,111,120,46,118,101,114,116,0,0,0,0,0,112,104,111,110,103,46,102,114,97,103,0,0,0,0,0,0,112,104,111,110,103,46,118,101,114,116,0,0,0,0,0,0,102,114,101,115,110,101,108,46,102,114,97,103,0,0,0,0,71,76,95,65,82,66,95,115,104,97,100,105,110,103,95,108,97,110,103,117,97,103,101,95,49,48,48,0,0,0,0,0,102,114,101,115,110,101,108,46,118,101,114,116,0,0,0,0,115,116,112,101,116,101,114,115,95,112,114,111,98,101,46,112,102,109,0,0,0,0,0,0,37,115,32,100,111,101,115,110,39,116,32,115,117,112,112,111,114,116,32,71,76,83,76,10,0,0,0,0,0,0,0,0,83,101,116,116,105,110,103,32,117,112,32,71,114,97,112,104,105,99,115,46,46,46,10,0,68,105,102,102,117,115,101,67,111,108,111,114,0,0,0,0,76,105,103,104,116,80,114,111,98,101,77,97,112,0,0,0,67,104,114,111,109,97,116,105,99,68,105,115,112,101,114,115,105,111,110,0,0,0,0,0,70,114,101,115,110,101,108,80,111,119,101,114,0,0,0,0,70,114,101,115,110,101,108,83,99,97,108,101,0,0,0,0,70,114,101,115,110,101,108,66,105,97,115,0,0,0,0,0,71,76,95,65,82,66,95,102,114,97,103,109,101,110,116,95,115,104,97,100,101,114,0,0,82,101,102,114,97,99,116,105,118,101,73,110,100,101,120,0,78,111,114,109,97,108,73,110,116,101,110,115,105,116,121,0,69,121,101,80,111,115,105,116,105,111,110,0,0,0,0,0,76,105,103,104,116,80,111,115,105,116,105,111,110,0,0,0,83,104,97,100,111,119,77,97,112,0,0,0,0,0,0,0,83,104,97,100,111,119,77,97,112,83,111,102,116,110,101,115,115,0,0,0,0,0,0,0,83,104,97,100,111,119,77,97,112,83,105,122,101,0,0,0,74,105,116,116,101,114,84,97,98,108,101,83,105,122,101,0,74,105,116,116,101,114,84,97,98,108,101,0,0,0,0,0,80,114,111,103,114,97,109,32,99,111,117,108,100,32,110,111,116,32,108,105,110,107,0,0,71,76,95,65,82,66,95,118,101,114,116,101,120,95,115,104,97,100,101,114,0,0,0,0,76,111,97,100,105,110,103,32,83,104,97,100,101,114,32,80,114,111,103,114,97,109,32,34,37,115,34,46,46,46,10,0,70,97,105,108,101,100,32,116,111,32,67,111,109,112,105,108,101,32,83,104,97,100,101,114,33,10,0,0,0,0,0,0,67,111,109,112,105,108,101,32,108,111,103,58,10,37,115,10,0,0,0,0,0,0,0,0,69,114,114,111,114,32,67,111,100,101,32,82,101,116,117,114,110,101,100,32,67,111,109,112,105,108,105,110,103,32,83,104,97,100,101,114,58,32,37,100,10,0,0,0,0,0,0,0,69,114,114,111,114,32,67,111,100,101,32,82,101,116,117,114,110,101,100,32,67,114,101,97,116,105,110,103,32,83,104,97,100,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,69,114,114,111,114,32,67,111,100,101,32,82,101,116,117,114,110,101,100,32,71,101,116,116,105,110,103,32,83,104,97,100,101,114,32,84,97,114,103,101,116,58,32,37,100,10,0,0,70,97,105,108,101,100,32,116,111,32,76,105,110,107,32,83,104,97,100,101,114,33,10,0,69,114,114,111,114,32,76,105,110,107,105,110,103,32,83,104,97,100,101,114,32,37,100,58,10,37,115,10,0,0,0,0,69,114,114,111,114,32,67,111,100,101,32,82,101,116,117,114,110,101,100,32,76,105,110,107,105,110,103,32,83,104,97,100,101,114,58,32,37,100,10,0,69,114,114,111,114,58,32,79,112,101,110,71,76,32,69,114,114,111,114,32,67,111,100,101,32,67,114,101,97,116,105,110,103,32,70,66,79,58,32,37,100,10,0,0,0,0,0,0,71,76,95,65,82,66,95,115,104,97,100,101,114,95,111,98,106,101,99,116,115,0,0,0,69,114,114,111,114,58,32,70,66,79,32,115,116,97,116,117,115,32,37,100,10,0,0,0,69,114,114,111,114,58,32,70,66,79,32,73,110,99,111,109,112,108,101,116,101,32,82,101,97,100,32,66,117,102,102,101,114,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,66,79,32,73,110,99,111,109,112,108,101,116,101,32,68,114,97,119,32,66,117,102,102,101,114,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,66,79,32,73,110,99,111,109,112,108,101,116,101,32,70,111,114,109,97,116,115,33,10,0,69,114,114,111,114,58,32,70,66,79,32,73,110,99,111,109,112,108,101,116,101,32,68,105,109,101,110,115,105,111,110,115,33,10,0,0,0,0,0,0,69,114,114,111,114,58,32,70,66,79,32,73,110,99,111,109,112,108,101,116,101,32,77,105,115,115,105,110,103,32,65,116,116,97,99,104,109,101,110,116,33,10,0,0,0,0,0,0,69,114,114,111,114,58,32,70,66,79,32,73,110,99,111,109,112,108,101,116,101,32,65,116,116,97,99,104,109,101,110,116,33,10,0,0,0,0,0,0,69,114,114,111,114,58,32,70,66,79,32,70,111,114,109,97,116,32,85,110,115,117,112,112,111,114,116,101,100,33,10,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,102,105,108,101,32,37,115,58,32,32,79,117,116,32,111,102,32,109,101,109,111,114,121,33,10,0,67,114,101,97,116,105,110,103,32,83,104,97,100,111,119,32,70,114,97,109,101,66,117,102,102,101,114,46,46,46,10,0,37,102,37,99,0,0,0,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,102,105,108,101,32,37,115,58,32,32,73,110,118,97,108,105,100,32,100,105,109,101,110,115,105,111,110,115,32,105,110,32,80,70,77,32,104,101,97,100,101,114,33,10,0,0,0,0,0,0,37,100,32,37,100,37,99,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,102,105,108,101,32,37,115,58,32,32,68,111,101,115,32,110,111,116,32,97,112,112,101,97,114,32,116,111,32,98,101,32,97,32,80,70,77,32,105,109,97,103,101,33,10,0,0,0,0,0,114,98,0,0,0,0,0,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,102,114,111,109,32,102,105,108,101,32,37,115,10,0,0,0,0,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,115,116,97,116,117,115,32,102,111,114,32,102,105,108,101,32,37,115,10,0,0,0,0,0,0,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,102,105,108,101,32,37,115,10,0,0,69,114,114,111,114,58,32,75,101,114,110,101,108,32,65,114,103,115,32,65,114,114,97,121,32,77,105,115,109,97,116,99,104,33,10,0,0,0,0,0,99,111,112,121,105,110,103,0,69,114,114,111,114,58,32,79,112,101,110,71,76,32,69,114,114,111,114,32,67,111,100,101,32,67,114,101,97,116,105,110,103,32,74,105,116,116,101,114,32,84,101,120,116,117,114,101,58,32,37,100,10,0,0,0,70,105,108,108,105,110,103,32,83,112,104,101,114,101,32,37,100,32,98,121,116,101,115,32,37,100,32,101,108,101,109,101,110,116,115,32,40,37,100,32,120,32,37,100,41,32,61,62,32,40,37,100,32,120,32,37,100,41,10,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,193,132,0,0,0,0,0,0,0,0,0,62,0,0,0,0,205,204,204,60,0,0,0,0,60,0,0,0,0,0,0,0,113,61,170,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,128,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,64,0,0,0,0,195,132,0,0,0,0,0,0,0,0,224,192,0,0,32,65,0,0,224,64,0,0,128,63,0,0,32,65,0,0,0,0,0,0,52,66,0,0,0,0,0,0,160,65,0,0,0,0,0,0,0,64,0,0,0,0,16,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,194,132,0,0,0,0,0,0,0,0,192,63,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,63,0,0,0,0,0,0,128,63,0,0,0,0,192,132,0,0,0,0,0,0,10,215,35,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,64,192,0,0,128,63,0,0,0,0,0,0,0,63,0,0,224,192,0,0,128,63,205,204,204,61,0,0,0,0,0,0,92,66,0,0,0,0,0,0,160,65,0,0,0,0,0,0,128,63,0,0,0,0,232,136,0,0,0,0,0,0,1,0,0,0,0,0,0,0,51,51,179,62,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
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
  var _sqrtf=Math.sqrt;
  var _llvm_pow_f32=Math.pow;
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
    }var _llvm_memset_p0i8_i32=_memset;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],checkStreams:function () {
        for (var i in FS.streams) if (FS.streams.hasOwnProperty(i)) assert(i >= 0 && i < FS.streams.length); // no keys not in dense span
        for (var i = 0; i < FS.streams.length; i++) assert(typeof FS.streams[i] == 'object'); // no non-null holes in dense span
      },ignorePermissions:true,createFileHandle:function (stream, fd) {
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
        FS.checkStreams();
        // see previous TODO on stdin etc.: assert(FS.streams.length < 1024); // at this early stage, we should not have a large set of file descriptors - just a few
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
  var _cos=Math.cos;
  var _sin=Math.sin;
;
;
  var GL={counter:1,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],currArrayBuffer:0,currElementArrayBuffer:0,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],uniformTable:{},packAlignment:4,unpackAlignment:4,init:function () {
        Browser.moduleContextCreatedCallbacks.push(GL.initExtensions);
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
      },scan:function (table, object) {
        for (var item in table) {
          if (table[item] == object) return item;
        }
        return 0;
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
        GL.compressionExt = Module.ctx.getExtension('WEBGL_compressed_texture_s3tc') ||
                            Module.ctx.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                            Module.ctx.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
        GL.anisotropicExt = Module.ctx.getExtension('EXT_texture_filter_anisotropic') ||
                            Module.ctx.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                            Module.ctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        GL.floatExt = Module.ctx.getExtension('OES_texture_float');
        GL.elementIndexUintExt = Module.ctx.getExtension('OES_element_index_uint');
        GL.standardDerivativesExt = Module.ctx.getExtension('OES_standard_derivatives');
      }};function _glPushMatrix() {
      GL.immediate.matricesModified = true;
      GL.immediate.matrixStack[GL.immediate.currentMatrix].push(
          Array.prototype.slice.call(GL.immediate.matrix[GL.immediate.currentMatrix]));
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
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
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
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
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
      }};
  function _glPixelStorei(pname, param) {
      if (pname == 0x0D05 /* GL_PACK_ALIGNMENT */) {
        GL.packAlignment = param;
      } else if (pname == 0x0cf5 /* GL_UNPACK_ALIGNMENT */) {
        GL.unpackAlignment = param;
      }
      Module.ctx.pixelStorei(pname, param);
    }
  function _glGetString(name_) {
      switch(name_) {
        case 0x1F00 /* GL_VENDOR */:
        case 0x1F01 /* GL_RENDERER */:
        case 0x1F02 /* GL_VERSION */:
          return allocate(intArrayFromString(Module.ctx.getParameter(name_)), 'i8', ALLOC_NORMAL);
        case 0x1F03 /* GL_EXTENSIONS */:
          return allocate(intArrayFromString(Module.ctx.getSupportedExtensions().join(' ')), 'i8', ALLOC_NORMAL);
        case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
          return allocate(intArrayFromString('OpenGL ES GLSL 1.00 (WebGL)'), 'i8', ALLOC_NORMAL);
        default:
          throw 'Failure: Invalid glGetString value: ' + name_;
      }
    }
  function _glGetIntegerv(name_, p) {
      switch(name_) { // Handle a few trivial GLES values
        case 0x8DFA: // GL_SHADER_COMPILER
          HEAP32[((p)>>2)]=1;
          return;
        case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
          HEAP32[((p)>>2)]=0;
          return;
      }
      var result = Module.ctx.getParameter(name_);
      switch (typeof(result)) {
        case "number":
          HEAP32[((p)>>2)]=result;
          break;
        case "boolean":
          HEAP8[(p)]=result ? 1 : 0;
          break;
        case "string":
          throw 'Native code calling glGetIntegerv(' + name_ + ') on a name which returns a string!';
        case "object":
          if (result === null) {
            HEAP32[((p)>>2)]=0;
          } else if (result instanceof Float32Array ||
                     result instanceof Uint32Array ||
                     result instanceof Int32Array ||
                     result instanceof Array) {
            for (var i = 0; i < result.length; ++i) {
              HEAP32[(((p)+(i*4))>>2)]=result[i];
            }
          } else if (result instanceof WebGLBuffer) {
            HEAP32[((p)>>2)]=GL.scan(GL.buffers, result);
          } else if (result instanceof WebGLProgram) {
            HEAP32[((p)>>2)]=GL.scan(GL.programs, result);
          } else if (result instanceof WebGLFramebuffer) {
            HEAP32[((p)>>2)]=GL.scan(GL.framebuffers, result);
          } else if (result instanceof WebGLRenderbuffer) {
            HEAP32[((p)>>2)]=GL.scan(GL.renderbuffers, result);
          } else if (result instanceof WebGLTexture) {
            HEAP32[((p)>>2)]=GL.scan(GL.textures, result);
          } else {
            throw 'Unknown object returned from WebGL getParameter';
          }
          break;
        case "undefined":
          throw 'Native code calling glGetIntegerv(' + name_ + ') and it returns undefined';
        default:
          throw 'Why did we hit the default case?';
      }
    }
  function _glGetFloatv(name_, p) {
      var result = Module.ctx.getParameter(name_);
      switch (typeof(result)) {
        case "number":
          HEAPF32[((p)>>2)]=result;
          break;
        case "boolean":
          HEAPF32[((p)>>2)]=result ? 1.0 : 0.0;
          break;
        case "string":
            HEAPF32[((p)>>2)]=0;
        case "object":
          if (result === null) {
            throw 'Native code calling glGetFloatv(' + name_ + ') and it returns null';
          } else if (result instanceof Float32Array ||
                     result instanceof Uint32Array ||
                     result instanceof Int32Array ||
                     result instanceof Array) {
            for (var i = 0; i < result.length; ++i) {
              HEAPF32[(((p)+(i*4))>>2)]=result[i];
            }
          } else if (result instanceof WebGLBuffer) {
            HEAPF32[((p)>>2)]=GL.scan(GL.buffers, result);
          } else if (result instanceof WebGLProgram) {
            HEAPF32[((p)>>2)]=GL.scan(GL.programs, result);
          } else if (result instanceof WebGLFramebuffer) {
            HEAPF32[((p)>>2)]=GL.scan(GL.framebuffers, result);
          } else if (result instanceof WebGLRenderbuffer) {
            HEAPF32[((p)>>2)]=GL.scan(GL.renderbuffers, result);
          } else if (result instanceof WebGLTexture) {
            HEAPF32[((p)>>2)]=GL.scan(GL.textures, result);
          } else {
            throw 'Unknown object returned from WebGL getParameter';
          }
          break;
        case "undefined":
          throw 'Native code calling glGetFloatv(' + name_ + ') and it returns undefined';
        default:
          throw 'Why did we hit the default case?';
      }
    }
  function _glGetBooleanv(name_, p) {
      var result = Module.ctx.getParameter(name_);
      switch (typeof(result)) {
        case "number":
          HEAP8[(p)]=result != 0;
          break;
        case "boolean":
          HEAP8[(p)]=result != 0;
          break;
        case "string":
          throw 'Native code calling glGetBooleanv(' + name_ + ') on a name which returns a string!';
        case "object":
          if (result === null) {
            HEAP8[(p)]=0;
          } else if (result instanceof Float32Array ||
                     result instanceof Uint32Array ||
                     result instanceof Int32Array ||
                     result instanceof Array) {
            for (var i = 0; i < result.length; ++i) {
              HEAP8[(((p)+(i))|0)]=result[i] != 0;
            }
          } else if (result instanceof WebGLBuffer ||
                     result instanceof WebGLProgram ||
                     result instanceof WebGLFramebuffer ||
                     result instanceof WebGLRenderbuffer ||
                     result instanceof WebGLTexture) {
            HEAP8[(p)]=1; // non-zero ID is always 1!
          } else {
            throw 'Unknown object returned from WebGL getParameter';
          }
          break;
        case "undefined":
            throw 'Unknown object returned from WebGL getParameter';
        default:
          throw 'Why did we hit the default case?';
      }
    }
  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.textures);
        GL.textures[id] = Module.ctx.createTexture();
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }
  function _glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        Module.ctx.deleteTexture(GL.textures[id]);
        GL.textures[id] = null;
      }
    }
  function _glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
      assert(GL.compressionExt);
      if (data) {
        data = HEAPU8.subarray((data),(data+imageSize));
      } else {
        data = null;
      }
      Module.ctx['compressedTexImage2D'](target, level, internalFormat, width, height, border, data);
    }
  function _glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
      assert(GL.compressionExt);
      if (data) {
        data = HEAPU8.subarray((data),(data+imageSize));
      } else {
        data = null;
      }
      Module.ctx['compressedTexSubImage2D'](target, level, xoffset, yoffset, width, height, data);
    }
  function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      if (pixels) {
        var data = GL.getTexPixelData(type, format, width, height, pixels, internalFormat);
        pixels = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixels = null;
      }
      Module.ctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
    }
  function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      if (pixels) {
        var data = GL.getTexPixelData(type, format, width, height, pixels, -1);
        pixels = data.pixels;
      } else {
        pixels = null;
      }
      Module.ctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
    }
  function _glReadPixels(x, y, width, height, format, type, pixels) {
      assert(type == 0x1401 /* GL_UNSIGNED_BYTE */);
      var sizePerPixel;
      switch (format) {
        case 0x1907 /* GL_RGB */:
          sizePerPixel = 3;
          break;
        case 0x1908 /* GL_RGBA */:
          sizePerPixel = 4;
          break;
        default: throw 'unsupported glReadPixels format';
      }
      var totalSize = width*height*sizePerPixel;
      Module.ctx.readPixels(x, y, width, height, format, type, HEAPU8.subarray(pixels, pixels + totalSize));
    }
  function _glBindTexture(target, texture) {
      Module.ctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }
  function _glGetTexParameterfv(target, pname, params) {
      HEAPF32[((params)>>2)]=Module.getTexParameter(target, pname);
    }
  function _glGetTexParameteriv(target, pname, params) {
      HEAP32[((params)>>2)]=Module.getTexParameter(target, pname);
    }
  function _glTexParameterfv(target, pname, params) {
      var param = HEAPF32[((params)>>2)];
      Module.ctx.texParameterf(target, pname, param);
    }
  function _glTexParameteriv(target, pname, params) {
      var param = HEAP32[((params)>>2)];
      Module.ctx.texParameteri(target, pname, param);
    }
  function _glIsTexture(texture) {
      var texture = GL.textures[texture];
      if (!texture) return 0;
      return Module.ctx.isTexture(texture);
    }
  function _glGenBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.buffers);
        GL.buffers[id] = Module.ctx.createBuffer();
        HEAP32[(((buffers)+(i*4))>>2)]=id;
      }
    }
  function _glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        Module.ctx.deleteBuffer(GL.buffers[id]);
        GL.buffers[id] = null;
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
      }
    }
  function _glGetBufferParameteriv(target, value, data) {
      HEAP32[((data)>>2)]=Module.ctx.getBufferParameter(target, value);
    }
  function _glBufferData(target, size, data, usage) {
      Module.ctx.bufferData(target, HEAPU8.subarray(data, data+size), usage);
    }
  function _glBufferSubData(target, offset, size, data) {
      Module.ctx.bufferSubData(target, offset, HEAPU8.subarray(data, data+size));
    }
  function _glIsBuffer(buffer) {
      var b = GL.buffers[buffer];
      if (!b) return 0;
      return Module.ctx.isBuffer(b);
    }
  function _glGenRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.renderbuffers);
        GL.renderbuffers[id] = Module.ctx.createRenderbuffer();
        HEAP32[(((renderbuffers)+(i*4))>>2)]=id;
      }
    }
  function _glDeleteRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((renderbuffers)+(i*4))>>2)];
        Module.ctx.deleteRenderbuffer(GL.renderbuffers[id]);
        GL.renderbuffers[id];
      }
    }
  function _glBindRenderbuffer(target, renderbuffer) {
      Module.ctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null);
    }
  function _glGetRenderbufferParameteriv(target, pname, params) {
      HEAP32[((params)>>2)]=Module.ctx.getRenderbufferParameter(target, pname);
    }
  function _glIsRenderbuffer(renderbuffer) {
      var rb = GL.renderbuffers[renderbuffer];
      if (!rb) return 0;
      return Module.ctx.isRenderbuffer(rb);
    }
  function _glGetUniformfv(program, location, params) {
      var data = Module.ctx.getUniform(GL.programs[program], GL.uniforms[location]);
      if (typeof data == 'number') {
        HEAPF32[((params)>>2)]=data;
      } else {
        for (var i = 0; i < data.length; i++) {
          HEAPF32[(((params)+(i))>>2)]=data[i];
        }
      }
    }
  function _glGetUniformiv(program, location, params) {
      var data = Module.ctx.getUniform(GL.programs[program], GL.uniforms[location]);
      if (typeof data == 'number' || typeof data == 'boolean') {
        HEAP32[((params)>>2)]=data;
      } else {
        for (var i = 0; i < data.length; i++) {
          HEAP32[(((params)+(i))>>2)]=data[i];
        }
      }
    }
  function _glGetUniformLocation(program, name) {
      name = Pointer_stringify(name);
      var ptable = GL.uniformTable[program];
      if (!ptable) ptable = GL.uniformTable[program] = {};
      var id = ptable[name];
      if (id) return id;
      var loc = Module.ctx.getUniformLocation(GL.programs[program], name);
      if (!loc) return -1;
      id = GL.getNewId(GL.uniforms);
      GL.uniforms[id] = loc;
      ptable[name] = id;
      return id;
    }
  function _glGetVertexAttribfv(index, pname, params) {
      var data = Module.ctx.getVertexAttrib(index, pname);
      if (typeof data == 'number') {
        HEAPF32[((params)>>2)]=data;
      } else {
        for (var i = 0; i < data.length; i++) {
          HEAPF32[(((params)+(i))>>2)]=data[i];
        }
      }
    }
  function _glGetVertexAttribiv(index, pname, params) {
      var data = Module.ctx.getVertexAttrib(index, pname);
      if (typeof data == 'number' || typeof data == 'boolean') {
        HEAP32[((params)>>2)]=data;
      } else {
        for (var i = 0; i < data.length; i++) {
          HEAP32[(((params)+(i))>>2)]=data[i];
        }
      }
    }
  function _glGetVertexAttribPointerv(index, pname, pointer) {
      HEAP32[((pointer)>>2)]=Module.ctx.getVertexAttribOffset(index, pname);
    }
  function _glGetActiveUniform(program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = Module.ctx.getActiveUniform(program, index);
      var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
      writeStringToMemory(infoname, name);
      if (length) {
        HEAP32[((length)>>2)]=infoname.length;
      }
      if (size) {
        HEAP32[((size)>>2)]=info.size;
      }
      if (type) {
        HEAP32[((type)>>2)]=info.type;
      }
    }
  function _glUniform1f(location, v0) {
      location = GL.uniforms[location];
      Module.ctx.uniform1f(location, v0);
    }
  function _glUniform2f(location, v0, v1) {
      location = GL.uniforms[location];
      Module.ctx.uniform2f(location, v0, v1);
    }
  function _glUniform3f(location, v0, v1, v2) {
      location = GL.uniforms[location];
      Module.ctx.uniform3f(location, v0, v1, v2);
    }
  function _glUniform4f(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      Module.ctx.uniform4f(location, v0, v1, v2, v3);
    }
  function _glUniform1i(location, v0) {
      location = GL.uniforms[location];
      Module.ctx.uniform1i(location, v0);
    }
  function _glUniform2i(location, v0, v1) {
      location = GL.uniforms[location];
      Module.ctx.uniform2i(location, v0, v1);
    }
  function _glUniform3i(location, v0, v1, v2) {
      location = GL.uniforms[location];
      Module.ctx.uniform3i(location, v0, v1, v2);
    }
  function _glUniform4i(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      Module.ctx.uniform4i(location, v0, v1, v2, v3);
    }
  function _glUniform1iv(location, count, value) {
      location = GL.uniforms[location];
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      Module.ctx.uniform1iv(location, value);
    }
  function _glUniform2iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 2;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      Module.ctx.uniform2iv(location, value);
    }
  function _glUniform3iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 3;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      Module.ctx.uniform3iv(location, value);
    }
  function _glUniform4iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 4;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      Module.ctx.uniform4iv(location, value);
    }
  function _glUniform1fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[0];
        view[0] = HEAPF32[((value)>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*4)>>2);
      }
      Module.ctx.uniform1fv(location, view);
    }
  function _glUniform2fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[1];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*8)>>2);
      }
      Module.ctx.uniform2fv(location, view);
    }
  function _glUniform3fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[2];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*12)>>2);
      }
      Module.ctx.uniform3fv(location, view);
    }
  function _glUniform4fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[3];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
        view[3] = HEAPF32[(((value)+(12))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      Module.ctx.uniform4fv(location, view);
    }
  function _glUniformMatrix2fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[3];
        for (var i = 0; i < 4; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      Module.ctx.uniformMatrix2fv(location, transpose, view);
    }
  function _glUniformMatrix3fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[8];
        for (var i = 0; i < 9; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*36)>>2);
      }
      Module.ctx.uniformMatrix3fv(location, transpose, view);
    }
  function _glUniformMatrix4fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[15];
        for (var i = 0; i < 16; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*64)>>2);
      }
      Module.ctx.uniformMatrix4fv(location, transpose, view);
    }
  function _glBindBuffer(target, buffer) {
      var bufferObj = buffer ? GL.buffers[buffer] : null;
      if (target == Module.ctx.ARRAY_BUFFER) {
        GL.currArrayBuffer = buffer;
      } else if (target == Module.ctx.ELEMENT_ARRAY_BUFFER) {
        GL.currElementArrayBuffer = buffer;
      }
      Module.ctx.bindBuffer(target, bufferObj);
    }
  function _glVertexAttrib1fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+4)>>2);
      Module.ctx.vertexAttrib1fv(index, v);
    }
  function _glVertexAttrib2fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+8)>>2);
      Module.ctx.vertexAttrib2fv(index, v);
    }
  function _glVertexAttrib3fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+12)>>2);
      Module.ctx.vertexAttrib3fv(index, v);
    }
  function _glVertexAttrib4fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+16)>>2);
      Module.ctx.vertexAttrib4fv(index, v);
    }
  function _glGetAttribLocation(program, name) {
      program = GL.programs[program];
      name = Pointer_stringify(name);
      return Module.ctx.getAttribLocation(program, name);
    }
  function _glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = Module.ctx.getActiveAttrib(program, index);
      var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
      writeStringToMemory(infoname, name);
      if (length) {
        HEAP32[((length)>>2)]=infoname.length;
      }
      if (size) {
        HEAP32[((size)>>2)]=info.size;
      }
      if (type) {
        HEAP32[((type)>>2)]=info.type;
      }
    }
  function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = Module.ctx.createShader(shaderType);
      return id;
    }
  function _glDeleteShader(shader) {
      Module.ctx.deleteShader(GL.shaders[shader]);
      GL.shaders[shader] = null;
    }
  function _glGetAttachedShaders(program, maxCount, count, shaders) {
      var result = Module.ctx.getAttachedShaders(GL.programs[program]);
      var len = result.length;
      if (len > maxCount) {
        len = maxCount;
      }
      HEAP32[((count)>>2)]=len;
      for (var i = 0; i < len; ++i) {
        HEAP32[(((shaders)+(i*4))>>2)]=GL.shaders[result[i]];
      }
    }
  function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      Module.ctx.shaderSource(GL.shaders[shader], source);
    }
  function _glGetShaderSource(shader, bufSize, length, source) {
      var result = Module.ctx.getShaderSource(GL.shaders[shader]);
      result = result.slice(0, Math.max(0, bufSize - 1));
      writeStringToMemory(result, source);
      if (length) {
        HEAP32[((length)>>2)]=result.length;
      }
    }
  function _glCompileShader(shader) {
      Module.ctx.compileShader(GL.shaders[shader]);
    }
  function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = Module.ctx.getShaderInfoLog(GL.shaders[shader]);
      // Work around a bug in Chromium which causes getShaderInfoLog to return null
      if (!log) {
        log = "";
      }
      log = log.substr(0, maxLength - 1);
      writeStringToMemory(log, infoLog);
      if (length) {
        HEAP32[((length)>>2)]=log.length
      }
    }
  function _glGetShaderiv(shader, pname, p) {
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        HEAP32[((p)>>2)]=Module.ctx.getShaderInfoLog(GL.shaders[shader]).length + 1;
      } else {
        HEAP32[((p)>>2)]=Module.ctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }
  function _glGetProgramiv(program, pname, p) {
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        HEAP32[((p)>>2)]=Module.ctx.getProgramInfoLog(GL.programs[program]).length + 1;
      } else {
        HEAP32[((p)>>2)]=Module.ctx.getProgramParameter(GL.programs[program], pname);
      }
    }
  function _glIsShader(shader) {
      var s = GL.shaders[shader];
      if (!s) return 0;
      return Module.ctx.isShader(s);
    }
  function _glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      GL.programs[id] = Module.ctx.createProgram();
      return id;
    }
  function _glDeleteProgram(program) {
      Module.ctx.deleteProgram(GL.programs[program]);
      GL.programs[program] = null;
      GL.uniformTable[program] = null;
    }
  function _glAttachShader(program, shader) {
      Module.ctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  function _glDetachShader(program, shader) {
      Module.ctx.detachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  function _glGetShaderPrecisionFormat() { throw 'glGetShaderPrecisionFormat: TODO' }
  function _glLinkProgram(program) {
      Module.ctx.linkProgram(GL.programs[program]);
      GL.uniformTable[program] = {}; // uniforms no longer keep the same names after linking
    }
  function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = Module.ctx.getProgramInfoLog(GL.programs[program]);
      // Work around a bug in Chromium which causes getProgramInfoLog to return null
      if (!log) {
        log = "";
      }
      log = log.substr(0, maxLength - 1);
      writeStringToMemory(log, infoLog);
      if (length) {
        HEAP32[((length)>>2)]=log.length
      }
    }
  function _glUseProgram(program) {
      Module.ctx.useProgram(program ? GL.programs[program] : null);
    }
  function _glValidateProgram(program) {
      Module.ctx.validateProgram(GL.programs[program]);
    }
  function _glIsProgram(program) {
      var program = GL.programs[program];
      if (!program) return 0;
      return Module.ctx.isProgram(program);
    }
  function _glBindAttribLocation(program, index, name) {
      name = Pointer_stringify(name);
      Module.ctx.bindAttribLocation(GL.programs[program], index, name);
    }
  function _glBindFramebuffer(target, framebuffer) {
      Module.ctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
    }
  function _glGenFramebuffers(n, ids) {
      for (var i = 0; i < n; ++i) {
        var id = GL.getNewId(GL.framebuffers);
        GL.framebuffers[id] = Module.ctx.createFramebuffer();
        HEAP32[(((ids)+(i*4))>>2)]=id;
      }
    }
  function _glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(((framebuffers)+(i*4))>>2)];
        Module.ctx.deleteFramebuffer(GL.framebuffers[id]);
        GL.framebuffers[id] = null;
      }
    }
  function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      Module.ctx.framebufferRenderbuffer(target, attachment, renderbuffertarget,
                                         GL.renderbuffers[renderbuffer]);
    }
  function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      Module.ctx.framebufferTexture2D(target, attachment, textarget,
                                      GL.textures[texture], level);
    }
  function _glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
      var result = Module.ctx.getFramebufferAttachmentParameter(target, attachment, pname);
      HEAP32[((params)>>2)]=params;
    }
  function _glIsFramebuffer(framebuffer) {
      var fb = GL.framebuffers[framebuffer];
      if (!fb) return 0;
      return Module.ctx.isFramebuffer(fb);
    }
  function _glShaderBinary() { throw 'glShaderBinary: TODO' }
  function _glDeleteObject(id) {
      if (GL.programs[id]) {
        _glDeleteProgram(id);
      } else if (GL.shaders[id]) {
        _glDeleteShader(id);
      } else {
        Module.printErr('WARNING: deleteObject received invalid id: ' + id);
      }
    }
  function _glReleaseShaderCompiler() {
      // NOP (as allowed by GLES 2.0 spec)
    }
  function _glGetObjectParameteriv(id, type, result) {
      if (GL.programs[id]) {
        if (type == 0x8B84) { // GL_OBJECT_INFO_LOG_LENGTH_ARB
          HEAP32[((result)>>2)]=Module.ctx.getProgramInfoLog(GL.programs[id]).length;
          return;
        }
        _glGetProgramiv(id, type, result);
      } else if (GL.shaders[id]) {
        if (type == 0x8B84) { // GL_OBJECT_INFO_LOG_LENGTH_ARB
          HEAP32[((result)>>2)]=Module.ctx.getShaderInfoLog(GL.shaders[id]).length;
          return;
        } else if (type == 0x8B88) { // GL_OBJECT_SHADER_SOURCE_LENGTH_ARB
          HEAP32[((result)>>2)]=Module.ctx.getShaderSource(GL.shaders[id]).length;
          return;
        }
        _glGetShaderiv(id, type, result);
      } else {
        Module.printErr('WARNING: getObjectParameteriv received invalid id: ' + id);
      }
    }
  function _glGetInfoLog(id, maxLength, length, infoLog) {
      if (GL.programs[id]) {
        _glGetProgramInfoLog(id, maxLength, length, infoLog);
      } else if (GL.shaders[id]) {
        _glGetShaderInfoLog(id, maxLength, length, infoLog);
      } else {
        Module.printErr('WARNING: getObjectParameteriv received invalid id: ' + id);
      }
    }
  function _glBindProgram(type, id) {
      assert(id == 0);
    }
  function _glGetPointerv(name, p) {
      var attribute;
      switch(name) {
        case 0x808E: // GL_VERTEX_ARRAY_POINTER
          attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX]; break;
        case 0x8090: // GL_COLOR_ARRAY_POINTER
          attribute = GLImmediate.clientAttributes[GLImmediate.COLOR]; break;
        case 0x8092: // GL_TEXTURE_COORD_ARRAY_POINTER
          attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0]; break;
        default: throw 'TODO: glGetPointerv for ' + name;
      }
      HEAP32[((p)>>2)]=attribute ? attribute.pointer : 0;
    }
  function _glEnd() {
      GL.immediate.prepareClientAttributes(GL.immediate.rendererComponents[GL.immediate.VERTEX], true);
      GL.immediate.firstVertex = 0;
      GL.immediate.lastVertex = GL.immediate.vertexCounter / (GL.immediate.stride >> 2);
      GL.immediate.flush();
      GL.immediate.disableBeginEndClientAttributes();
      GL.immediate.mode = -1;
      // Pop the old state:
      GL.immediate.enabledClientAttributes = GL.immediate.enabledClientAttributes_preBegin;
      GL.immediate.clientAttributes = GL.immediate.clientAttributes_preBegin;
      GL.immediate.modifiedClientAttributes = true;
    }
  function _glVertex3f(x, y, z) {
      assert(GL.immediate.mode >= 0); // must be in begin/end
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = x;
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = y;
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = z || 0;
      assert(GL.immediate.vertexCounter << 2 < GL.MAX_TEMP_BUFFER_SIZE);
      GL.immediate.addRendererComponent(GL.immediate.VERTEX, 3, Module.ctx.FLOAT);
    }
  var _glVertex2f=_glVertex3f;
  function _glVertex3fv(p) {
      _glVertex3f(HEAPF32[((p)>>2)], HEAPF32[(((p)+(4))>>2)], HEAPF32[(((p)+(8))>>2)]);
    }
  function _glVertex2fv(p) {
      _glVertex3f(HEAPF32[((p)>>2)], HEAPF32[(((p)+(4))>>2)], 0);
    }
  var _glVertex3i=_glVertex3f;
  var _glVertex2i=_glVertex3f;
  function _glTexCoord2i(u, v) {
      assert(GL.immediate.mode >= 0); // must be in begin/end
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = u;
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = v;
      GL.immediate.addRendererComponent(GL.immediate.TEXTURE0, 2, Module.ctx.FLOAT);
    }
  var _glTexCoord2f=_glTexCoord2i;
  function _glTexCoord2fv(v) {
      _glTexCoord2i(HEAPF32[((v)>>2)], HEAPF32[(((v)+(4))>>2)]);
    }
  function _glTexCoord4f() { throw 'glTexCoord4f: TODO' }
  function _glColor4f(r, g, b, a) {
      r = Math.max(Math.min(r, 1), 0);
      g = Math.max(Math.min(g, 1), 0);
      b = Math.max(Math.min(b, 1), 0);
      a = Math.max(Math.min(a, 1), 0);
      // TODO: make ub the default, not f, save a few mathops
      if (GL.immediate.mode >= 0) {
        var start = GL.immediate.vertexCounter << 2;
        GL.immediate.vertexDataU8[start + 0] = r * 255;
        GL.immediate.vertexDataU8[start + 1] = g * 255;
        GL.immediate.vertexDataU8[start + 2] = b * 255;
        GL.immediate.vertexDataU8[start + 3] = a * 255;
        GL.immediate.vertexCounter++;
        GL.immediate.addRendererComponent(GL.immediate.COLOR, 4, Module.ctx.UNSIGNED_BYTE);
      } else {
        GL.immediate.clientColor[0] = r;
        GL.immediate.clientColor[1] = g;
        GL.immediate.clientColor[2] = b;
        GL.immediate.clientColor[3] = a;
      }
    }
  var _glColor4d=_glColor4f;
  function _glColor4ub(r, g, b, a) {
      _glColor4f((r&255)/255, (g&255)/255, (b&255)/255, (a&255)/255);
    }
  function _glColor4us(r, g, b, a) {
      _glColor4f((r&65535)/65535, (g&65535)/65535, (b&65535)/65535, (a&65535)/65535);
    }
  function _glColor4ui(r, g, b, a) {
      _glColor4f((r>>>0)/4294967295, (g>>>0)/4294967295, (b>>>0)/4294967295, (a>>>0)/4294967295);
    }
  function _glColor3f(r, g, b) {
      _glColor4f(r, g, b, 1);
    }
  var _glColor3d=_glColor3f;
  function _glColor3ub(r, g, b) {
      _glColor4ub(r, g, b, 255);
    }
  function _glColor3us(r, g, b) {
      _glColor4us(r, g, b, 65535);
    }
  function _glColor3ui(r, g, b) {
      _glColor4ui(r, g, b, 4294967295);
    }
  function _glColor3ubv(p) {
      _glColor3ub(HEAP8[(p)], HEAP8[(((p)+(1))|0)], HEAP8[(((p)+(2))|0)]);
    }
  function _glColor3usv(p) {
      _glColor3us(HEAP16[((p)>>1)], HEAP16[(((p)+(2))>>1)], HEAP16[(((p)+(4))>>1)]);
    }
  function _glColor3uiv(p) {
      _glColor3ui(HEAP32[((p)>>2)], HEAP32[(((p)+(4))>>2)], HEAP32[(((p)+(8))>>2)]);
    }
  function _glColor3fv(p) {
      _glColor3f(HEAPF32[((p)>>2)], HEAPF32[(((p)+(4))>>2)], HEAPF32[(((p)+(8))>>2)]);
    }
  function _glColor4fv(p) {
      _glColor4f(HEAPF32[((p)>>2)], HEAPF32[(((p)+(4))>>2)], HEAPF32[(((p)+(8))>>2)], HEAPF32[(((p)+(12))>>2)]);
    }
  function _glColor4ubv() { throw 'glColor4ubv not implemented' }
  function _glFogf(pname, param) { // partial support, TODO
      switch(pname) {
        case 0x0B63: // GL_FOG_START
          GLEmulation.fogStart = param; break;
        case 0x0B64: // GL_FOG_END
          GLEmulation.fogEnd = param; break;
        case 0x0B62: // GL_FOG_DENSITY
          GLEmulation.fogDensity = param; break;
        case 0x0B65: // GL_FOG_MODE
          switch (param) {
            case 0x0801: // GL_EXP2
            case 0x2601: // GL_LINEAR
              GLEmulation.fogMode = param; break;
            default: // default to GL_EXP
              GLEmulation.fogMode = 0x0800 /* GL_EXP */; break;
          }
          break;
      }
    }
  function _glFogi(pname, param) {
      return _glFogf(pname, param);
    }
  function _glFogfv(pname, param) { // partial support, TODO
      switch(pname) {
        case 0x0B66: // GL_FOG_COLOR
          GLEmulation.fogColor[0] = HEAPF32[((param)>>2)];
          GLEmulation.fogColor[1] = HEAPF32[(((param)+(4))>>2)];
          GLEmulation.fogColor[2] = HEAPF32[(((param)+(8))>>2)];
          GLEmulation.fogColor[3] = HEAPF32[(((param)+(12))>>2)];
          break;
        case 0x0B63: // GL_FOG_START
        case 0x0B64: // GL_FOG_END
          _glFogf(pname, HEAPF32[((param)>>2)]); break;
      }
    }
  function _glFogiv(pname, param) {
      switch(pname) {
        case 0x0B66: // GL_FOG_COLOR
          GLEmulation.fogColor[0] = (HEAP32[((param)>>2)]/2147483647)/2.0+0.5;
          GLEmulation.fogColor[1] = (HEAP32[(((param)+(4))>>2)]/2147483647)/2.0+0.5;
          GLEmulation.fogColor[2] = (HEAP32[(((param)+(8))>>2)]/2147483647)/2.0+0.5;
          GLEmulation.fogColor[3] = (HEAP32[(((param)+(12))>>2)]/2147483647)/2.0+0.5;
          break;
        default:
          _glFogf(pname, HEAP32[((param)>>2)]); break;
      }
    }
  var _glFogx=_glFogi;
  var _glFogxv=_glFogiv;
  function _glPolygonMode(){}
  function _glAlphaFunc(){}
  function _glNormal3f(){}
  function _glDrawRangeElements(mode, start, end, count, type, indices) {
      _glDrawElements(mode, count, type, indices, start, end);
    }
  function _glEnableClientState(cap, disable) {
      var attrib = GLEmulation.getAttributeFromCapability(cap);
      if (attrib === null) {
        Module.printErr('WARNING: unhandled clientstate: ' + cap);
        return;
      }
      if (disable && GL.immediate.enabledClientAttributes[attrib]) {
        GL.immediate.enabledClientAttributes[attrib] = false;
        GL.immediate.totalEnabledClientAttributes--;
        if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledClientStates[cap];
      } else if (!disable && !GL.immediate.enabledClientAttributes[attrib]) {
        GL.immediate.enabledClientAttributes[attrib] = true;
        GL.immediate.totalEnabledClientAttributes++;
        if (GLEmulation.currentVao) GLEmulation.currentVao.enabledClientStates[cap] = 1;
      }
      GL.immediate.modifiedClientAttributes = true;
    }
  function _glDisableClientState(cap) {
      _glEnableClientState(cap, 1);
    }
  function _glVertexPointer(size, type, stride, pointer) {
      GL.immediate.setClientAttribute(GL.immediate.VERTEX, size, type, stride, pointer);
    }
  function _glTexCoordPointer(size, type, stride, pointer) {
      GL.immediate.setClientAttribute(GL.immediate.TEXTURE0 + GL.immediate.clientActiveTexture, size, type, stride, pointer);
    }
  function _glNormalPointer(type, stride, pointer) {
      GL.immediate.setClientAttribute(GL.immediate.NORMAL, 3, type, stride, pointer);
    }
  function _glColorPointer(size, type, stride, pointer) {
      GL.immediate.setClientAttribute(GL.immediate.COLOR, size, type, stride, pointer);
    }
  function _glClientActiveTexture(texture) {
      GL.immediate.clientActiveTexture = texture - 0x84C0; // GL_TEXTURE0
    }
  function _glGenVertexArrays(n, vaos) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GLEmulation.vaos);
        GLEmulation.vaos[id] = {
          id: id,
          arrayBuffer: 0,
          elementArrayBuffer: 0,
          enabledVertexAttribArrays: {},
          vertexAttribPointers: {},
          enabledClientStates: {},
        };
        HEAP32[(((vaos)+(i*4))>>2)]=id;
      }
    }
  function _glDeleteVertexArrays(n, vaos) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((vaos)+(i*4))>>2)];
        GLEmulation.vaos[id] = null;
        if (GLEmulation.currentVao && GLEmulation.currentVao.id == id) GLEmulation.currentVao = null;
      }
    }
  function _glBindVertexArray(vao) {
      // undo vao-related things, wipe the slate clean, both for vao of 0 or an actual vao
      GLEmulation.currentVao = null; // make sure the commands we run here are not recorded
      if (GL.immediate.lastRenderer) GL.immediate.lastRenderer.cleanup();
      _glBindBuffer(Module.ctx.ARRAY_BUFFER, 0); // XXX if one was there before we were bound?
      _glBindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, 0);
      for (var vaa in GLEmulation.enabledVertexAttribArrays) {
        Module.ctx.disableVertexAttribArray(vaa);
      }
      GLEmulation.enabledVertexAttribArrays = {};
      GL.immediate.enabledClientAttributes = [0, 0];
      GL.immediate.totalEnabledClientAttributes = 0;
      GL.immediate.modifiedClientAttributes = true;
      if (vao) {
        // replay vao
        var info = GLEmulation.vaos[vao];
        _glBindBuffer(Module.ctx.ARRAY_BUFFER, info.arrayBuffer); // XXX overwrite current binding?
        _glBindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, info.elementArrayBuffer);
        for (var vaa in info.enabledVertexAttribArrays) {
          _glEnableVertexAttribArray(vaa);
        }
        for (var vaa in info.vertexAttribPointers) {
          _glVertexAttribPointer.apply(null, info.vertexAttribPointers[vaa]);
        }
        for (var attrib in info.enabledClientStates) {
          _glEnableClientState(attrib|0);
        }
        GLEmulation.currentVao = info; // set currentVao last, so the commands we ran here were not recorded
      }
    }
  function _glMatrixMode(mode) {
      if (mode == 0x1700 /* GL_MODELVIEW */) {
        GL.immediate.currentMatrix = 'm';
      } else if (mode == 0x1701 /* GL_PROJECTION */) {
        GL.immediate.currentMatrix = 'p';
      } else if (mode == 0x1702) { // GL_TEXTURE
        GL.immediate.useTextureMatrix = true;
        GL.immediate.currentMatrix = 't' + GL.immediate.clientActiveTexture;
      } else {
        throw "Wrong mode " + mode + " passed to glMatrixMode";
      }
    }
  function _glPopMatrix() {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix[GL.immediate.currentMatrix] = GL.immediate.matrixStack[GL.immediate.currentMatrix].pop();
    }
  function _glLoadIdentity() {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.identity(GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glLoadMatrixd(matrix) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.set(HEAPF64.subarray((matrix)>>3,(matrix+128)>>3), GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glLoadMatrixf(matrix) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.set(HEAPF32.subarray((matrix)>>2,(matrix+64)>>2), GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glLoadTransposeMatrixd(matrix) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.set(HEAPF64.subarray((matrix)>>3,(matrix+128)>>3), GL.immediate.matrix[GL.immediate.currentMatrix]);
      GL.immediate.matrix.lib.mat4.transpose(GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glLoadTransposeMatrixf(matrix) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.set(HEAPF32.subarray((matrix)>>2,(matrix+64)>>2), GL.immediate.matrix[GL.immediate.currentMatrix]);
      GL.immediate.matrix.lib.mat4.transpose(GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glMultMatrixd(matrix) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix],
          HEAPF64.subarray((matrix)>>3,(matrix+128)>>3));
    }
  function _glMultMatrixf(matrix) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix],
          HEAPF32.subarray((matrix)>>2,(matrix+64)>>2));
    }
  function _glMultTransposeMatrixd(matrix) {
      GL.immediate.matricesModified = true;
      var colMajor = GL.immediate.matrix.lib.mat4.create();
      GL.immediate.matrix.lib.mat4.set(HEAPF64.subarray((matrix)>>3,(matrix+128)>>3), colMajor);
      GL.immediate.matrix.lib.mat4.transpose(colMajor);
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix], colMajor);
    }
  function _glMultTransposeMatrixf(matrix) {
      GL.immediate.matricesModified = true;
      var colMajor = GL.immediate.matrix.lib.mat4.create();
      GL.immediate.matrix.lib.mat4.set(HEAPF32.subarray((matrix)>>2,(matrix+64)>>2), colMajor);
      GL.immediate.matrix.lib.mat4.transpose(colMajor);
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix], colMajor);
    }
  function _glFrustum(left, right, bottom, top_, nearVal, farVal) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix],
          GL.immediate.matrix.lib.mat4.frustum(left, right, bottom, top_, nearVal, farVal));
    }
  var _glFrustumf=_glFrustum;
  function _glOrtho(left, right, bottom, top_, nearVal, farVal) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix],
          GL.immediate.matrix.lib.mat4.ortho(left, right, bottom, top_, nearVal, farVal));
    }
  var _glOrthof=_glOrtho;
  function _glScaled(x, y, z) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.scale(GL.immediate.matrix[GL.immediate.currentMatrix], [x, y, z]);
    }
  var _glScalef=_glScaled;
  function _glTranslated(x, y, z) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.translate(GL.immediate.matrix[GL.immediate.currentMatrix], [x, y, z]);
    }
  var _glTranslatef=_glTranslated;
  function _glRotated(angle, x, y, z) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.rotate(GL.immediate.matrix[GL.immediate.currentMatrix], angle*Math.PI/180, [x, y, z]);
    }
  var _glRotatef=_glRotated;
  function _gluPerspective(fov, aspect, near, far) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix[GL.immediate.currentMatrix] =
        GL.immediate.matrix.lib.mat4.perspective(fov, aspect, near, far,
                                                 GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _gluLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.lookAt(GL.immediate.matrix[GL.immediate.currentMatrix], [ex, ey, ez],
          [cx, cy, cz], [ux, uy, uz]);
    }
  function _gluProject(objX, objY, objZ, model, proj, view, winX, winY, winZ) {
      // The algorithm for this functions comes from Mesa
      var inVec = new Float32Array(4);
      var outVec = new Float32Array(4);
      GL.immediate.matrix.lib.mat4.multiplyVec4(HEAPF64.subarray((model)>>3,(model+128)>>3),
          [objX, objY, objZ, 1.0], outVec);
      GL.immediate.matrix.lib.mat4.multiplyVec4(HEAPF64.subarray((proj)>>3,(proj+128)>>3),
          outVec, inVec);
      if (inVec[3] == 0.0) {
        return 0 /* GL_FALSE */;
      }
      inVec[0] /= inVec[3];
      inVec[1] /= inVec[3];
      inVec[2] /= inVec[3];
      // Map x, y and z to range 0-1 */
      inVec[0] = inVec[0] * 0.5 + 0.5;
      inVec[1] = inVec[1] * 0.5 + 0.5;
      inVec[2] = inVec[2] * 0.5 + 0.5;
      // Map x, y to viewport
      inVec[0] = inVec[0] * HEAP32[(((view)+(8))>>2)] + HEAP32[((view)>>2)];
      inVec[1] = inVec[1] * HEAP32[(((view)+(12))>>2)] + HEAP32[(((view)+(4))>>2)];
      HEAPF64[((winX)>>3)]=inVec[0];
      HEAPF64[((winY)>>3)]=inVec[1];
      HEAPF64[((winZ)>>3)]=inVec[2];
      return 1 /* GL_TRUE */;
    }
  function _gluUnProject(winX, winY, winZ, model, proj, view, objX, objY, objZ) {
      var result = GL.immediate.matrix.lib.mat4.unproject([winX, winY, winZ],
          HEAPF64.subarray((model)>>3,(model+128)>>3),
          HEAPF64.subarray((proj)>>3,(proj+128)>>3),
          HEAP32.subarray((view)>>2,(view+16)>>2));
      if (result === null) {
        return 0 /* GL_FALSE */;
      }
      HEAPF64[((objX)>>3)]=result[0];
      HEAPF64[((objY)>>3)]=result[1];
      HEAPF64[((objZ)>>3)]=result[2];
      return 1 /* GL_TRUE */;
    }
  function _gluOrtho2D(left, right, bottom, top) {
      _glOrtho(left, right, bottom, top, -1, 1);
    }
  function _glDrawBuffer() { throw 'glDrawBuffer: TODO' }
  function _glReadBuffer() { throw 'glReadBuffer: TODO' }
  function _glLightfv() { throw 'glLightfv: TODO' }
  function _glLightModelfv() { throw 'glLightModelfv: TODO' }
  function _glMaterialfv() { throw 'glMaterialfv: TODO' }
  function _glTexGeni() { throw 'glTexGeni: TODO' }
  function _glTexGenfv() { throw 'glTexGenfv: TODO' }
  function _glTexEnvi() { Runtime.warnOnce('glTexEnvi: TODO') }
  function _glTexEnvf() { Runtime.warnOnce('glTexEnvf: TODO') }
  function _glTexEnvfv() { Runtime.warnOnce('glTexEnvfv: TODO') }
  function _glTexImage1D() { throw 'glTexImage1D: TODO' }
  function _glTexCoord3f() { throw 'glTexCoord3f: TODO' }
  function _glGetTexLevelParameteriv() { throw 'glGetTexLevelParameteriv: TODO' }
  function _glShadeModel() { Runtime.warnOnce('TODO: glShadeModel') }
  function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      Module.ctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }
  function _glEnableVertexAttribArray(index) {
      Module.ctx.enableVertexAttribArray(index);
    }
  function _glDisableVertexAttribArray(index) {
      Module.ctx.disableVertexAttribArray(index);
    }
  function _glDrawArrays(mode, first, count) {
      Module.ctx.drawArrays(mode, first, count);
    }
  function _glDrawElements(mode, count, type, indices) {
      Module.ctx.drawElements(mode, count, type, indices);
    }
  var _glGenFramebuffersOES=_glGenFramebuffers;
  var _glGenRenderbuffersOES=_glGenRenderbuffers;
  var _glBindFramebufferOES=_glBindFramebuffer;
  var _glBindRenderbufferOES=_glBindRenderbuffer;
  var _glGetRenderbufferParameterivOES=_glGetRenderbufferParameteriv;
  var _glFramebufferRenderbufferOES=_glFramebufferRenderbuffer;
  function _glRenderbufferStorage(x0, x1, x2, x3) { Module.ctx.renderbufferStorage(x0, x1, x2, x3) }var _glRenderbufferStorageOES=_glRenderbufferStorage;
  function _glCheckFramebufferStatus(x0) { return Module.ctx.checkFramebufferStatus(x0) }var _glCheckFramebufferStatusOES=_glCheckFramebufferStatus;
  var _glDeleteFramebuffersOES=_glDeleteFramebuffers;
  var _glDeleteRenderbuffersOES=_glDeleteRenderbuffers;
  var _glGenVertexArraysOES=_glGenVertexArrays;
  var _glDeleteVertexArraysOES=_glDeleteVertexArrays;
  var _glBindVertexArrayOES=_glBindVertexArray;
  var _glFramebufferTexture2DOES=_glFramebufferTexture2D;
  function _glGetError() { return Module.ctx.getError() }
  function _glFinish() { Module.ctx.finish() }
  function _glFlush() { Module.ctx.flush() }
  function _glClearDepth(x0) { Module.ctx.clearDepth(x0) }
  function _glClearDepthf(x0) { Module.ctx.clearDepth(x0) }
  function _glDepthFunc(x0) { Module.ctx.depthFunc(x0) }
  function _glEnable(x0) { Module.ctx.enable(x0) }
  function _glDisable(x0) { Module.ctx.disable(x0) }
  function _glFrontFace(x0) { Module.ctx.frontFace(x0) }
  function _glCullFace(x0) { Module.ctx.cullFace(x0) }
  function _glClear(x0) { Module.ctx.clear(x0) }
  function _glLineWidth(x0) { Module.ctx.lineWidth(x0) }
  function _glClearStencil(x0) { Module.ctx.clearStencil(x0) }
  function _glDepthMask(x0) { Module.ctx.depthMask(x0) }
  function _glStencilMask(x0) { Module.ctx.stencilMask(x0) }
  function _glGenerateMipmap(x0) { Module.ctx.generateMipmap(x0) }
  function _glActiveTexture(x0) { Module.ctx.activeTexture(x0) }
  function _glBlendEquation(x0) { Module.ctx.blendEquation(x0) }
  function _glSampleCoverage(x0) { Module.ctx.sampleCoverage(x0) }
  function _glIsEnabled(x0) { return Module.ctx.isEnabled(x0) }
  function _glBlendFunc(x0, x1) { Module.ctx.blendFunc(x0, x1) }
  function _glBlendEquationSeparate(x0, x1) { Module.ctx.blendEquationSeparate(x0, x1) }
  function _glDepthRange(x0, x1) { Module.ctx.depthRange(x0, x1) }
  function _glDepthRangef(x0, x1) { Module.ctx.depthRange(x0, x1) }
  function _glStencilMaskSeparate(x0, x1) { Module.ctx.stencilMaskSeparate(x0, x1) }
  function _glHint(x0, x1) { Module.ctx.hint(x0, x1) }
  function _glPolygonOffset(x0, x1) { Module.ctx.polygonOffset(x0, x1) }
  function _glVertexAttrib1f(x0, x1) { Module.ctx.vertexAttrib1f(x0, x1) }
  function _glTexParameteri(x0, x1, x2) { Module.ctx.texParameteri(x0, x1, x2) }
  function _glTexParameterf(x0, x1, x2) { Module.ctx.texParameterf(x0, x1, x2) }
  function _glVertexAttrib2f(x0, x1, x2) { Module.ctx.vertexAttrib2f(x0, x1, x2) }
  function _glStencilFunc(x0, x1, x2) { Module.ctx.stencilFunc(x0, x1, x2) }
  function _glStencilOp(x0, x1, x2) { Module.ctx.stencilOp(x0, x1, x2) }
  function _glViewport(x0, x1, x2, x3) { Module.ctx.viewport(x0, x1, x2, x3) }
  function _glClearColor(x0, x1, x2, x3) { Module.ctx.clearColor(x0, x1, x2, x3) }
  function _glScissor(x0, x1, x2, x3) { Module.ctx.scissor(x0, x1, x2, x3) }
  function _glVertexAttrib3f(x0, x1, x2, x3) { Module.ctx.vertexAttrib3f(x0, x1, x2, x3) }
  function _glColorMask(x0, x1, x2, x3) { Module.ctx.colorMask(x0, x1, x2, x3) }
  function _glBlendFuncSeparate(x0, x1, x2, x3) { Module.ctx.blendFuncSeparate(x0, x1, x2, x3) }
  function _glBlendColor(x0, x1, x2, x3) { Module.ctx.blendColor(x0, x1, x2, x3) }
  function _glStencilFuncSeparate(x0, x1, x2, x3) { Module.ctx.stencilFuncSeparate(x0, x1, x2, x3) }
  function _glStencilOpSeparate(x0, x1, x2, x3) { Module.ctx.stencilOpSeparate(x0, x1, x2, x3) }
  function _glVertexAttrib4f(x0, x1, x2, x3, x4) { Module.ctx.vertexAttrib4f(x0, x1, x2, x3, x4) }
  function _glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) { Module.ctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) }
  function _glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) { Module.ctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) }
  var GLEmulation={fogStart:0,fogEnd:1,fogDensity:1,fogColor:null,fogMode:2048,fogEnabled:false,vaos:[],currentVao:null,enabledVertexAttribArrays:{},hasRunInit:false,init:function () {
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
        Module.printErr('WARNING: using emscripten GL emulation. This is a collection of limited workarounds, do not expect it to work');
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
        _glEnable = function(cap) {
          // Clean up the renderer on any change to the rendering state. The optimization of
          // skipping renderer setup is aimed at the case of multiple glDraw* right after each other
          if (GL.immediate.lastRenderer) GL.immediate.lastRenderer.cleanup();
          if (cap == 0x0B60 /* GL_FOG */) {
            GLEmulation.fogEnabled = true;
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
        _glDisable = function(cap) {
          if (GL.immediate.lastRenderer) GL.immediate.lastRenderer.cleanup();
          if (cap == 0x0B60 /* GL_FOG */) {
            GLEmulation.fogEnabled = false;
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
        _glIsEnabled = function(cap) {
          if (cap == 0x0B60 /* GL_FOG */) {
            return GLEmulation.fogEnabled ? 1 : 0;
          } else if (!(cap in validCapabilities)) {
            return 0;
          }
          return Module.ctx.isEnabled(cap);
        };
        var glGetBooleanv = _glGetBooleanv;
        _glGetBooleanv = function(pname, p) {
          var attrib = GLEmulation.getAttributeFromCapability(pname);
          if (attrib !== null) {
            var result = GL.immediate.enabledClientAttributes[attrib];
            HEAP8[(p)]=result === true ? 1 : 0;
            return;
          }
          glGetBooleanv(pname, p);
        };
        var glGetIntegerv = _glGetIntegerv;
        _glGetIntegerv = function(pname, params) {
          switch (pname) {
            case 0x84E2: pname = Module.ctx.MAX_TEXTURE_IMAGE_UNITS /* fake it */; break; // GL_MAX_TEXTURE_UNITS
            case 0x8B4A: { // GL_MAX_VERTEX_UNIFORM_COMPONENTS_ARB
              var result = Module.ctx.getParameter(Module.ctx.MAX_VERTEX_UNIFORM_VECTORS);
              HEAP32[((params)>>2)]=result*4; // GLES gives num of 4-element vectors, GL wants individual components, so multiply
              return;
            }
            case 0x8B49: { // GL_MAX_FRAGMENT_UNIFORM_COMPONENTS_ARB
              var result = Module.ctx.getParameter(Module.ctx.MAX_FRAGMENT_UNIFORM_VECTORS);
              HEAP32[((params)>>2)]=result*4; // GLES gives num of 4-element vectors, GL wants individual components, so multiply
              return;
            }
            case 0x8B4B: { // GL_MAX_VARYING_FLOATS_ARB
              var result = Module.ctx.getParameter(Module.ctx.MAX_VARYING_VECTORS);
              HEAP32[((params)>>2)]=result*4; // GLES gives num of 4-element vectors, GL wants individual components, so multiply
              return;
            }
            case 0x8871: pname = Module.ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS /* close enough */; break; // GL_MAX_TEXTURE_COORDS
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
              var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0];
              HEAP32[((params)>>2)]=attribute ? attribute.size : 0;
              return;
            }
            case 0x8089: { // GL_TEXTURE_COORD_ARRAY_TYPE
              var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0];
              HEAP32[((params)>>2)]=attribute ? attribute.type : 0;
              return;
            }
            case 0x808A: { // GL_TEXTURE_COORD_ARRAY_STRIDE
              var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0];
              HEAP32[((params)>>2)]=attribute ? attribute.stride : 0;
              return;
            }
          }
          glGetIntegerv(pname, params);
        };
        var glGetString = _glGetString;
        _glGetString = function(name_) {
          switch(name_) {
            case 0x1F03 /* GL_EXTENSIONS */: // Add various extensions that we can support
              return allocate(intArrayFromString(Module.ctx.getSupportedExtensions().join(' ') +
                     ' GL_EXT_texture_env_combine GL_ARB_texture_env_crossbar GL_ATI_texture_env_combine3 GL_NV_texture_env_combine4 GL_EXT_texture_env_dot3 GL_ARB_multitexture GL_ARB_vertex_buffer_object GL_EXT_framebuffer_object GL_ARB_vertex_program GL_ARB_fragment_program GL_ARB_shading_language_100 GL_ARB_shader_objects GL_ARB_vertex_shader GL_ARB_fragment_shader GL_ARB_texture_cube_map GL_EXT_draw_range_elements' +
                     (GL.compressionExt ? ' GL_ARB_texture_compression GL_EXT_texture_compression_s3tc' : '') +
                     (GL.anisotropicExt ? ' GL_EXT_texture_filter_anisotropic' : '')
              ), 'i8', ALLOC_NORMAL);
          }
          return glGetString(name_);
        };
        // Do some automatic rewriting to work around GLSL differences. Note that this must be done in
        // tandem with the rest of the program, by itself it cannot suffice.
        // Note that we need to remember shader types for this rewriting, saving sources makes it easier to debug.
        GL.shaderInfos = {};
        var glCreateShader = _glCreateShader;
        _glCreateShader = function(shaderType) {
          var id = glCreateShader(shaderType);
          GL.shaderInfos[id] = {
            type: shaderType,
            ftransform: false
          };
          return id;
        };
        var glShaderSource = _glShaderSource;
        _glShaderSource = function(shader, count, string, length) {
          var source = GL.getSource(shader, count, string, length);
          // XXX We add attributes and uniforms to shaders. The program can ask for the # of them, and see the
          // ones we generated, potentially confusing it? Perhaps we should hide them.
          if (GL.shaderInfos[shader].type == Module.ctx.VERTEX_SHADER) {
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
            for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
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
          } else { // Fragment shader
            for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
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
            source = 'precision mediump float;\n' + source;
          }
          Module.ctx.shaderSource(GL.shaders[shader], source);
        };
        var glCompileShader = _glCompileShader;
        _glCompileShader = function(shader) {
          Module.ctx.compileShader(GL.shaders[shader]);
          if (!Module.ctx.getShaderParameter(GL.shaders[shader], Module.ctx.COMPILE_STATUS)) {
            Module.printErr('Failed to compile shader: ' + Module.ctx.getShaderInfoLog(GL.shaders[shader]));
            Module.printErr('Info: ' + JSON.stringify(GL.shaderInfos[shader]));
            Module.printErr('Enable GL_DEBUG to see shader source');
          }
        };
        GL.programShaders = {};
        var glAttachShader = _glAttachShader;
        _glAttachShader = function(program, shader) {
          if (!GL.programShaders[program]) GL.programShaders[program] = [];
          GL.programShaders[program].push(shader);
          glAttachShader(program, shader);
        };
        var glDetachShader = _glDetachShader;
        _glDetachShader = function(program, shader) {
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
        _glUseProgram = function(program) {
          GL.currProgram = program;
          glUseProgram(program);
        }
        var glDeleteProgram = _glDeleteProgram;
        _glDeleteProgram = function(program) {
          glDeleteProgram(program);
          if (program == GL.currProgram) GL.currProgram = 0;
        };
        // If attribute 0 was not bound, bind it to 0 for WebGL performance reasons. Track if 0 is free for that.
        var zeroUsedPrograms = {};
        var glBindAttribLocation = _glBindAttribLocation;
        _glBindAttribLocation = function(program, index, name) {
          if (index == 0) zeroUsedPrograms[program] = true;
          glBindAttribLocation(program, index, name);
        };
        var glLinkProgram = _glLinkProgram;
        _glLinkProgram = function(program) {
          if (!(program in zeroUsedPrograms)) {
            Module.ctx.bindAttribLocation(GL.programs[program], 0, 'a_position');
          }
          glLinkProgram(program);
        };
        var glBindBuffer = _glBindBuffer;
        _glBindBuffer = function(target, buffer) {
          glBindBuffer(target, buffer);
          if (target == Module.ctx.ARRAY_BUFFER) {
            if (GLEmulation.currentVao) {
              assert(GLEmulation.currentVao.arrayBuffer == buffer || GLEmulation.currentVao.arrayBuffer == 0 || buffer == 0, 'TODO: support for multiple array buffers in vao');
              GLEmulation.currentVao.arrayBuffer = buffer;
            }
          } else if (target == Module.ctx.ELEMENT_ARRAY_BUFFER) {
            if (GLEmulation.currentVao) GLEmulation.currentVao.elementArrayBuffer = buffer;
          }
        };
        var glGetFloatv = _glGetFloatv;
        _glGetFloatv = function(pname, params) {
          if (pname == 0x0BA6) { // GL_MODELVIEW_MATRIX
            HEAPF32.set(GL.immediate.matrix['m'], params >> 2);
          } else if (pname == 0x0BA7) { // GL_PROJECTION_MATRIX
            HEAPF32.set(GL.immediate.matrix['p'], params >> 2);
          } else if (pname == 0x0BA8) { // GL_TEXTURE_MATRIX
            HEAPF32.set(GL.immediate.matrix['t' + GL.immediate.clientActiveTexture], params >> 2);
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
        _glHint = function(target, mode) {
          if (target == 0x84EF) { // GL_TEXTURE_COMPRESSION_HINT
            return;
          }
          glHint(target, mode);
        };
        var glEnableVertexAttribArray = _glEnableVertexAttribArray;
        _glEnableVertexAttribArray = function(index) {
          glEnableVertexAttribArray(index);
          GLEmulation.enabledVertexAttribArrays[index] = 1;
          if (GLEmulation.currentVao) GLEmulation.currentVao.enabledVertexAttribArrays[index] = 1;
        };
        var glDisableVertexAttribArray = _glDisableVertexAttribArray;
        _glDisableVertexAttribArray = function(index) {
          glDisableVertexAttribArray(index);
          delete GLEmulation.enabledVertexAttribArrays[index];
          if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledVertexAttribArrays[index];
        };
        var glVertexAttribPointer = _glVertexAttribPointer;
        _glVertexAttribPointer = function(index, size, type, normalized, stride, pointer) {
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
            attrib = GL.immediate.TEXTURE0 + GL.immediate.clientActiveTexture; break;
          case 0x8074: // GL_VERTEX_ARRAY
            attrib = GL.immediate.VERTEX; break;
          case 0x8075: // GL_NORMAL_ARRAY
            attrib = GL.immediate.NORMAL; break;
          case 0x8076: // GL_COLOR_ARRAY
            attrib = GL.immediate.COLOR; break;
        }
        return attrib;
      },getProcAddress:function (name) {
        name = name.replace('EXT', '').replace('ARB', '');
        // Do the translation carefully because of closure
        var ret = 0;
        switch (name) {
          case 'glCreateShaderObject': case 'glCreateShader': ret = 44; break;
          case 'glCreateProgramObject': case 'glCreateProgram': ret = 34; break;
          case 'glAttachObject': case 'glAttachShader': ret = 134; break;
          case 'glUseProgramObject': case 'glUseProgram': ret = 2; break;
          case 'glDetachObject': case 'glDetachShader': ret = 140; break;
          case 'glDeleteObject': ret = 152; break;
          case 'glGetObjectParameteriv': ret = 190; break;
          case 'glGetInfoLog': ret = 60; break;
          case 'glBindProgram': ret = 162; break;
          case 'glDrawRangeElements': ret = 272; break;
          case 'glShaderSource': ret = 66; break;
          case 'glCompileShader': ret = 220; break;
          case 'glLinkProgram': ret = 262; break;
          case 'glGetUniformLocation': ret = 268; break;
          case 'glUniform1f': ret = 184; break;
          case 'glUniform2f': ret = 146; break;
          case 'glUniform3f': ret = 114; break;
          case 'glUniform4f': ret = 58; break;
          case 'glUniform1fv': ret = 32; break;
          case 'glUniform2fv': ret = 22; break;
          case 'glUniform3fv': ret = 172; break;
          case 'glUniform4fv': ret = 274; break;
          case 'glUniform1i': ret = 188; break;
          case 'glUniform2i': ret = 142; break;
          case 'glUniform3i': ret = 112; break;
          case 'glUniform4i': ret = 56; break;
          case 'glUniform1iv': ret = 132; break;
          case 'glUniform2iv': ret = 206; break;
          case 'glUniform3iv': ret = 128; break;
          case 'glUniform4iv': ret = 290; break;
          case 'glBindAttribLocation': ret = 278; break;
          case 'glGetActiveUniform': ret = 208; break;
          case 'glGenBuffers': ret = 64; break;
          case 'glBindBuffer': ret = 30; break;
          case 'glBufferData': ret = 234; break;
          case 'glBufferSubData': ret = 100; break;
          case 'glDeleteBuffers': ret = 232; break;
          case 'glActiveTexture': ret = 212; break;
          case 'glClientActiveTexture': ret = 296; break;
          case 'glGetProgramiv': ret = 244; break;
          case 'glEnableVertexAttribArray': ret = 222; break;
          case 'glDisableVertexAttribArray': ret = 42; break;
          case 'glVertexAttribPointer': ret = 82; break;
          case 'glVertexAttrib1f': ret = 292; break;
          case 'glVertexAttrib2f': ret = 276; break;
          case 'glVertexAttrib3f': ret = 70; break;
          case 'glVertexAttrib4f': ret = 28; break;
          case 'glVertexAttrib1fv': ret = 216; break;
          case 'glVertexAttrib2fv': ret = 90; break;
          case 'glVertexAttrib3fv': ret = 194; break;
          case 'glVertexAttrib4fv': ret = 228; break;
          case 'glGetVertexAttribfv': ret = 74; break;
          case 'glGetVertexAttribiv': ret = 88; break;
          case 'glGetVertexAttribPointerv': ret = 260; break;
          case 'glGetAttribLocation': ret = 40; break;
          case 'glGetActiveAttrib': ret = 204; break;
          case 'glBindRenderbuffer': ret = 92; break;
          case 'glDeleteRenderbuffers': ret = 254; break;
          case 'glGenRenderbuffers': ret = 20; break;
          case 'glCompressedTexImage2D': ret = 170; break;
          case 'glCompressedTexSubImage2D': ret = 246; break;
          case 'glBindFramebuffer': ret = 138; break;
          case 'glGenFramebuffers': ret = 144; break;
          case 'glDeleteFramebuffers': ret = 156; break;
          case 'glFramebufferRenderbuffer': ret = 68; break;
          case 'glFramebufferTexture2D': ret = 288; break;
          case 'glGetFramebufferAttachmentParameteriv': ret = 122; break;
          case 'glIsFramebuffer': ret = 284; break;
          case 'glCheckFramebufferStatus': ret = 160; break;
          case 'glRenderbufferStorage': ret = 62; break;
          case 'glGenVertexArrays': ret = 250; break;
          case 'glDeleteVertexArrays': ret = 104; break;
          case 'glBindVertexArray': ret = 226; break;
          case 'glGetString': ret = 210; break;
          case 'glBindTexture': ret = 176; break;
          case 'glGetBufferParameteriv': ret = 166; break;
          case 'glIsBuffer': ret = 46; break;
          case 'glDeleteShader': ret = 242; break;
          case 'glUniformMatrix2fv': ret = 8; break;
          case 'glUniformMatrix3fv': ret = 6; break;
          case 'glUniformMatrix4fv': ret = 14; break;
          case 'glIsRenderbuffer': ret = 164; break;
          case 'glBlendEquation': ret = 26; break;
          case 'glBlendFunc': ret = 38; break;
          case 'glBlendFuncSeparate': ret = 120; break;
          case 'glBlendEquationSeparate': ret = 308; break;
          case 'glDepthRangef': ret = 258; break;
          case 'glClear': ret = 270; break;
          case 'glGenerateMipmap': ret = 80; break;
          case 'glBlendColor': ret = 304; break;
          case 'glClearDepthf': ret = 174; break;
          case 'glDeleteProgram': ret = 24; break;
          case 'glUniformMatrix3fv': ret = 6; break;
          case 'glClearColor': ret = 178; break;
          case 'glGetRenderbufferParameteriv': ret = 202; break;
          case 'glGetShaderInfoLog': ret = 136; break;
          case 'glUniformMatrix4fv': ret = 14; break;
          case 'glClearStencil': ret = 4; break;
          case 'glGetProgramInfoLog': ret = 86; break;
          case 'glGetUniformfv': ret = 168; break;
          case 'glStencilFuncSeparate': ret = 312; break;
          case 'glSampleCoverage': ret = 230; break;
          case 'glColorMask': ret = 294; break;
          case 'glGetShaderiv': ret = 266; break;
          case 'glGetUniformiv': ret = 224; break;
          case 'glCopyTexSubImage2D': ret = 298; break;
          case 'glDetachShader': ret = 140; break;
          case 'glGetShaderSource': ret = 16; break;
          case 'glDeleteTextures': ret = 106; break;
          case 'glGetAttachedShaders': ret = 252; break;
          case 'glValidateProgram': ret = 78; break;
          case 'glDepthFunc': ret = 108; break;
          case 'glIsShader': ret = 50; break;
          case 'glDepthMask': ret = 98; break;
          case 'glStencilMaskSeparate': ret = 130; break;
          case 'glIsProgram': ret = 150; break;
          case 'glDisable': ret = 300; break;
          case 'glStencilOpSeparate': ret = 110; break;
          case 'glDrawArrays': ret = 196; break;
          case 'glDrawElements': ret = 96; break;
          case 'glEnable': ret = 286; break;
          case 'glFinish': ret = 182; break;
          case 'glFlush': ret = 238; break;
          case 'glFrontFace': ret = 218; break;
          case 'glCullFace': ret = 154; break;
          case 'glGenTextures': ret = 124; break;
          case 'glGetError': ret = 200; break;
          case 'glGetIntegerv': ret = 126; break;
          case 'glGetBooleanv': ret = 72; break;
          case 'glGetFloatv': ret = 186; break;
          case 'glHint': ret = 84; break;
          case 'glIsTexture': ret = 116; break;
          case 'glPixelStorei': ret = 280; break;
          case 'glReadPixels': ret = 198; break;
          case 'glScissor': ret = 248; break;
          case 'glStencilFunc': ret = 10; break;
          case 'glStencilMask': ret = 306; break;
          case 'glStencilOp': ret = 52; break;
          case 'glTexImage2D': ret = 118; break;
          case 'glTexParameterf': ret = 310; break;
          case 'glTexParameterfv': ret = 94; break;
          case 'glTexParameteri': ret = 302; break;
          case 'glTexParameteriv': ret = 12; break;
          case 'glGetTexParameterfv': ret = 158; break;
          case 'glGetTexParameteriv': ret = 192; break;
          case 'glTexSubImage2D': ret = 314; break;
          case 'glCopyTexImage2D': ret = 282; break;
          case 'glViewport': ret = 102; break;
          case 'glIsEnabled': ret = 180; break;
          case 'glLineWidth': ret = 18; break;
          case 'glPolygonOffset': ret = 48; break;
          case 'glReleaseShaderCompiler': ret = 264; break;
          case 'glGetShaderPrecisionFormat': ret = 54; break;
          case 'glShaderBinary': ret = 36; break;
        }
        if (!ret) Module.printErr('WARNING: getProcAddress failed for ' + name);
        return ret;
      }};var GLImmediate={MapTreeLib:null,spawnMapTreeLib:function () {
        /* A naive implementation of a map backed by an array, and accessed by
         * naive iteration along the array. (hashmap with only one bucket)
         */
        function CNaiveListMap() {
          var list = [];
          this.insert = function(key, val) {
            if (this.contains(key|0)) return false;
            list.push([key, val]);
            return true;
          };
          var __contains_i;
          this.contains = function(key) {
            for (__contains_i = 0; __contains_i < list.length; ++__contains_i) {
              if (list[__contains_i][0] === key) return true;
            }
            return false;
          };
          var __get_i;
          this.get = function(key) {
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
            this.child = function(keyFrag) {
              if (!map.contains(keyFrag|0)) {
                map.insert(keyFrag|0, new CNLNode());
              }
              return map.get(keyFrag|0);
            };
            this.value = undefined;
            this.get = function() {
              return this.value;
            };
            this.set = function(val) {
              this.value = val;
            };
          }
          function CKeyView(root) {
            var cur;
            this.reset = function() {
              cur = root;
              return this;
            };
            this.reset();
            this.next = function(keyFrag) {
              cur = cur.child(keyFrag);
              return this;
            };
            this.get = function() {
              return cur.get();
            };
            this.set = function(val) {
              cur.set(val);
            };
          };
          var root;
          var staticKeyView;
          this.createKeyView = function() {
            return new CKeyView(root);
          }
          this.clear = function() {
            root = new CNLNode();
            staticKeyView = this.createKeyView();
          };
          this.clear();
          this.getStaticKeyView = function() {
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
          return Abort_NoSupport("Unsupported combiner op: 0x" + op.toString(16));
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
          this.traverseState = function(keyView) {
            keyView.next(this.mode);
            keyView.next(this.colorCombiner);
            keyView.next(this.alphaCombiner);
            keyView.next(this.colorCombiner);
            keyView.next(this.alphaScale);
            keyView.next(this.envColor[0]);
            keyView.next(this.envColor[1]);
            keyView.next(this.envColor[2]);
            keyView.next(this.envColor[3]);
            keyView.next(this.colorSrc[0]);
            keyView.next(this.colorSrc[1]);
            keyView.next(this.colorSrc[2]);
            keyView.next(this.alphaSrc[0]);
            keyView.next(this.alphaSrc[1]);
            keyView.next(this.alphaSrc[2]);
            keyView.next(this.colorOp[0]);
            keyView.next(this.colorOp[1]);
            keyView.next(this.colorOp[2]);
            keyView.next(this.alphaOp[0]);
            keyView.next(this.alphaOp[1]);
            keyView.next(this.alphaOp[2]);
          };
        }
        function CTexUnit() {
          this.env = new CTexEnv();
          this.enabled_tex1D   = false;
          this.enabled_tex2D   = false;
          this.enabled_tex3D   = false;
          this.enabled_texCube = false;
          this.traverseState = function(keyView) {
            var texUnitType = this.getTexType();
            keyView.next(texUnitType);
            if (!texUnitType) return;
            this.env.traverseState(keyView);
          };
        };
        // Class impls:
        CTexUnit.prototype.enabled = function() {
          return this.getTexType() != 0;
        }
        CTexUnit.prototype.genPassLines = function(passOutputVar, passInputVar, texUnitID) {
          if (!this.enabled()) {
            return ["vec4 " + passOutputVar + " = " + passInputVar + ";"];
          }
          return this.env.genPassLines(passOutputVar, passInputVar, texUnitID);
        }
        CTexUnit.prototype.getTexType = function() {
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
        CTexEnv.prototype.genPassLines = function(passOutputVar, passInputVar, texUnitID) {
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
              var line = [
                "vec4 " + passOutputVar,
                " = ",
                  "vec4(",
                      colorVar + " * " + valToFloatLiteral(this.colorScale),
                      ", ",
                      alphaVar + " * " + valToFloatLiteral(this.alphaScale),
                  ")",
                ";",
              ].join("");
              return [].concat(colorLines, alphaLines, [line]);
            }
          }
          return Abort_NoSupport("Unsupported TexEnv mode: 0x" + this.mode.toString(16));
        }
        CTexEnv.prototype.genCombinerLines = function(isColor, outputVar,
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
              var texUnit = s_texUnits[i];
              var enabled = texUnit.enabled();
              keyView.next(enabled);
              if (enabled) {
                texUnit.traverseState(keyView);
              }
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
                cur.enabled_tex1D = true;
                break;
              case GL_TEXTURE_2D:
                cur.enabled_tex2D = true;
                break;
              case GL_TEXTURE_3D:
                cur.enabled_tex3D = true;
                break;
              case GL_TEXTURE_CUBE_MAP:
                cur.enabled_texCube = true;
                break;
            }
          },
          hook_disable: function(cap) {
            var cur = getCurTexUnit();
            switch (cap) {
              case GL_TEXTURE_1D:
                cur.enabled_tex1D = false;
                break;
              case GL_TEXTURE_2D:
                cur.enabled_tex2D = false;
                break;
              case GL_TEXTURE_3D:
                cur.enabled_tex3D = false;
                break;
              case GL_TEXTURE_CUBE_MAP:
                cur.enabled_texCube = false;
                break;
            }
          },
          hook_texEnvf: function(target, pname, param) {
            if (target != GL_TEXTURE_ENV)
              return;
            var env = getCurTexUnit().env;
            switch (pname) {
              case GL_RGB_SCALE:
                env.colorScale = param;
                break;
              case GL_ALPHA_SCALE:
                env.alphaScale = param;
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
                env.mode = param;
                break;
              case GL_COMBINE_RGB:
                env.colorCombiner = param;
                break;
              case GL_COMBINE_ALPHA:
                env.alphaCombiner = param;
                break;
              case GL_SRC0_RGB:
                env.colorSrc[0] = param;
                break;
              case GL_SRC1_RGB:
                env.colorSrc[1] = param;
                break;
              case GL_SRC2_RGB:
                env.colorSrc[2] = param;
                break;
              case GL_SRC0_ALPHA:
                env.alphaSrc[0] = param;
                break;
              case GL_SRC1_ALPHA:
                env.alphaSrc[1] = param;
                break;
              case GL_SRC2_ALPHA:
                env.alphaSrc[2] = param;
                break;
              case GL_OPERAND0_RGB:
                env.colorOp[0] = param;
                break;
              case GL_OPERAND1_RGB:
                env.colorOp[1] = param;
                break;
              case GL_OPERAND2_RGB:
                env.colorOp[2] = param;
                break;
              case GL_OPERAND0_ALPHA:
                env.alphaOp[0] = param;
                break;
              case GL_OPERAND1_ALPHA:
                env.alphaOp[1] = param;
                break;
              case GL_OPERAND2_ALPHA:
                env.alphaOp[2] = param;
                break;
              case GL_RGB_SCALE:
                env.colorScale = param;
                break;
              case GL_ALPHA_SCALE:
                env.alphaScale = param;
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
                  env.envColor[i] = param;
                }
                break
              }
              default:
                Module.printErr('WARNING: Unhandled `pname` in call to `glTexEnvfv`.');
            }
          },
        };
      },vertexData:null,vertexDataU8:null,tempData:null,indexData:null,vertexCounter:0,mode:-1,rendererCache:null,rendererComponents:[],rendererComponentPointer:0,lastRenderer:null,lastArrayBuffer:null,lastProgram:null,lastStride:-1,matrix:{},matrixStack:{},currentMatrix:"m",tempMatrix:null,matricesModified:false,useTextureMatrix:false,VERTEX:0,NORMAL:1,COLOR:2,TEXTURE0:3,TEXTURE1:4,TEXTURE2:5,TEXTURE3:6,TEXTURE4:7,TEXTURE5:8,TEXTURE6:9,NUM_ATTRIBUTES:10,MAX_TEXTURES:7,totalEnabledClientAttributes:0,enabledClientAttributes:[0,0],clientAttributes:[],liveClientAttributes:[],modifiedClientAttributes:false,clientActiveTexture:0,clientColor:null,usedTexUnitList:[],fixedFunctionProgram:null,setClientAttribute:function (name, size, type, stride, pointer) {
        var attrib = this.clientAttributes[name];
        if (!attrib) {
          for (var i = 0; i <= name; i++) { // keep flat
            if (!this.clientAttributes[i]) {
              this.clientAttributes[i] = {
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
        this.modifiedClientAttributes = true;
      },addRendererComponent:function (name, size, type) {
        if (!this.rendererComponents[name]) {
          this.rendererComponents[name] = 1;
          if (this.enabledClientAttributes[name]) {
            console.log("Warning: glTexCoord used after EnableClientState for TEXTURE_COORD_ARRAY for TEXTURE0. Disabling TEXTURE_COORD_ARRAY...");
          }
          this.enabledClientAttributes[name] = true;
          this.setClientAttribute(name, size, type, 0, this.rendererComponentPointer);
          this.rendererComponentPointer += size * GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
        } else {
          this.rendererComponents[name]++;
        }
      },disableBeginEndClientAttributes:function () {
        for (var i = 0; i < this.NUM_ATTRIBUTES; i++) {
          if (this.rendererComponents[i]) this.enabledClientAttributes[i] = false;
        }
      },getRenderer:function () {
        // return a renderer object given the liveClientAttributes
        // we maintain a cache of renderers, optimized to not generate garbage
        var attributes = GL.immediate.liveClientAttributes;
        var cacheMap = GL.immediate.rendererCache;
        var temp;
        var keyView = cacheMap.getStaticKeyView().reset();
        // By attrib state:
        for (var i = 0; i < attributes.length; i++) {
          var attribute = attributes[i];
          keyView.next(attribute.name).next(attribute.size).next(attribute.type);
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
        keyView.next(fogParam);
        // By cur program:
        keyView.next(GL.currProgram);
        if (!GL.currProgram) {
          GL.immediate.TexEnvJIT.traverseState(keyView);
        }
        // If we don't already have it, create it.
        if (!keyView.get()) {
          keyView.set(this.createRenderer());
        }
        return keyView.get();
      },createRenderer:function (renderer) {
        var useCurrProgram = !!GL.currProgram;
        var hasTextures = false, textureSizes = [], textureTypes = [];
        for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
          var texAttribName = GL.immediate.TEXTURE0 + i;
          if (!GL.immediate.enabledClientAttributes[texAttribName])
            continue;
          if (!useCurrProgram) {
            assert(GL.immediate.TexEnvJIT.getTexUnitType(i) != 0, "GL_TEXTURE" + i + " coords are supplied, but that texture unit is disabled in the fixed-function pipeline.");
          }
          textureSizes[i] = GL.immediate.clientAttributes[texAttribName].size;
          textureTypes[i] = GL.immediate.clientAttributes[texAttribName].type;
          hasTextures = true;
        }
        var positionSize = GL.immediate.clientAttributes[GL.immediate.VERTEX].size;
        var positionType = GL.immediate.clientAttributes[GL.immediate.VERTEX].type;
        var colorSize = 0, colorType;
        if (GL.immediate.enabledClientAttributes[GL.immediate.COLOR]) {
          colorSize = GL.immediate.clientAttributes[GL.immediate.COLOR].size;
          colorType = GL.immediate.clientAttributes[GL.immediate.COLOR].type;
        }
        var normalSize = 0, normalType;
        if (GL.immediate.enabledClientAttributes[GL.immediate.NORMAL]) {
          normalSize = GL.immediate.clientAttributes[GL.immediate.NORMAL].size;
          normalType = GL.immediate.clientAttributes[GL.immediate.NORMAL].type;
        }
        var ret = {
          init: function() {
            // For fixed-function shader generation.
            var uTexUnitPrefix = 'u_texUnit';
            var aTexCoordPrefix = 'a_texCoord';
            var vTexCoordPrefix = 'v_texCoord';
            var vPrimColor = 'v_color';
            var uTexMatrixPrefix = GL.immediate.useTextureMatrix ? 'u_textureMatrix' : null;
            if (useCurrProgram) {
              if (GL.shaderInfos[GL.programShaders[GL.currProgram][0]].type == Module.ctx.VERTEX_SHADER) {
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
              GL.immediate.TexEnvJIT.setGLSLVars(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix);
              var fsTexEnvPass = GL.immediate.TexEnvJIT.genAllPassLines('gl_FragColor', 2);
              var texUnitAttribList = '';
              var texUnitVaryingList = '';
              var texUnitUniformList = '';
              var vsTexCoordInits = '';
              this.usedTexUnitList = GL.immediate.TexEnvJIT.getUsedTexUnitList();
              for (var i = 0; i < this.usedTexUnitList.length; i++) {
                var texUnit = this.usedTexUnitList[i];
                texUnitAttribList += 'attribute vec4 ' + aTexCoordPrefix + texUnit + ';\n';
                texUnitVaryingList += 'varying vec4 ' + vTexCoordPrefix + texUnit + ';\n';
                texUnitUniformList += 'uniform sampler2D ' + uTexUnitPrefix + texUnit + ';\n';
                vsTexCoordInits += '  ' + vTexCoordPrefix + texUnit + ' = ' + aTexCoordPrefix + texUnit + ';\n';
                if (GL.immediate.useTextureMatrix) {
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
              this.vertexShader = Module.ctx.createShader(Module.ctx.VERTEX_SHADER);
              Module.ctx.shaderSource(this.vertexShader, vsSource);
              Module.ctx.compileShader(this.vertexShader);
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
              this.fragmentShader = Module.ctx.createShader(Module.ctx.FRAGMENT_SHADER);
              Module.ctx.shaderSource(this.fragmentShader, fsSource);
              Module.ctx.compileShader(this.fragmentShader);
              this.program = Module.ctx.createProgram();
              Module.ctx.attachShader(this.program, this.vertexShader);
              Module.ctx.attachShader(this.program, this.fragmentShader);
              Module.ctx.bindAttribLocation(this.program, 0, 'a_position');
              Module.ctx.linkProgram(this.program);
            }
            this.positionLocation = Module.ctx.getAttribLocation(this.program, 'a_position');
            this.texCoordLocations = [];
            for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
              if (!GL.immediate.enabledClientAttributes[GL.immediate.TEXTURE0 + i]) {
                this.texCoordLocations[i] = -1;
                continue;
              }
              if (useCurrProgram) {
                this.texCoordLocations[i] = Module.ctx.getAttribLocation(this.program, 'a_texCoord' + i);
              } else {
                this.texCoordLocations[i] = Module.ctx.getAttribLocation(this.program, aTexCoordPrefix + i);
              }
            }
            if (!useCurrProgram) {
              // Temporarily switch to the program so we can set our sampler uniforms early.
              var prevBoundProg = Module.ctx.getParameter(Module.ctx.CURRENT_PROGRAM);
              Module.ctx.useProgram(this.program);
              {
                for (var i = 0; i < this.usedTexUnitList.length; i++) {
                  var texUnitID = this.usedTexUnitList[i];
                  var texSamplerLoc = Module.ctx.getUniformLocation(this.program, uTexUnitPrefix + texUnitID);
                  Module.ctx.uniform1i(texSamplerLoc, texUnitID);
                }
              }
              Module.ctx.useProgram(prevBoundProg);
            }
            this.textureMatrixLocations = [];
            for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
              this.textureMatrixLocations[i] = Module.ctx.getUniformLocation(this.program, 'u_textureMatrix' + i);
            }
            this.colorLocation = Module.ctx.getAttribLocation(this.program, 'a_color');
            this.normalLocation = Module.ctx.getAttribLocation(this.program, 'a_normal');
            this.modelViewLocation = Module.ctx.getUniformLocation(this.program, 'u_modelView');
            this.projectionLocation = Module.ctx.getUniformLocation(this.program, 'u_projection');
            this.hasTextures = hasTextures;
            this.hasNormal = normalSize > 0 && this.normalLocation >= 0;
            this.hasColor = (this.colorLocation === 0) || this.colorLocation > 0;
            this.floatType = Module.ctx.FLOAT; // minor optimization
            this.fogColorLocation = Module.ctx.getUniformLocation(this.program, 'u_fogColor');
            this.fogEndLocation = Module.ctx.getUniformLocation(this.program, 'u_fogEnd');
            this.fogScaleLocation = Module.ctx.getUniformLocation(this.program, 'u_fogScale');
            this.fogDensityLocation = Module.ctx.getUniformLocation(this.program, 'u_fogDensity');
            this.hasFog = !!(this.fogColorLocation || this.fogEndLocation ||
                             this.fogScaleLocation || this.fogDensityLocation);
          },
          prepare: function() {
            // Calculate the array buffer
            var arrayBuffer;
            if (!GL.currArrayBuffer) {
              var start = GL.immediate.firstVertex*GL.immediate.stride;
              var end = GL.immediate.lastVertex*GL.immediate.stride;
              assert(end <= GL.MAX_TEMP_BUFFER_SIZE, 'too much vertex data');
              arrayBuffer = GL.tempVertexBuffers[GL.tempBufferIndexLookup[end]];
              // TODO: consider using the last buffer we bound, if it was larger. downside is larger buffer, but we might avoid rebinding and preparing
            } else {
              arrayBuffer = GL.currArrayBuffer;
            }
            // If the array buffer is unchanged and the renderer as well, then we can avoid all the work here
            // XXX We use some heuristics here, and this may not work in all cases. Try disabling GL_UNSAFE_OPTS if you
            // have odd glitches
            var lastRenderer = GL.immediate.lastRenderer;
            var canSkip = this == lastRenderer &&
                          arrayBuffer == GL.immediate.lastArrayBuffer &&
                          (GL.currProgram || this.program) == GL.immediate.lastProgram &&
                          GL.immediate.stride == GL.immediate.lastStride &&
                          !GL.immediate.matricesModified;
            if (!canSkip && lastRenderer) lastRenderer.cleanup();
            if (!GL.currArrayBuffer) {
              // Bind the array buffer and upload data after cleaning up the previous renderer
              // Potentially unsafe, since lastArrayBuffer might not reflect the true array buffer in code that mixes immediate/non-immediate
              if (arrayBuffer != GL.immediate.lastArrayBuffer) {
                Module.ctx.bindBuffer(Module.ctx.ARRAY_BUFFER, arrayBuffer);
              }
              Module.ctx.bufferSubData(Module.ctx.ARRAY_BUFFER, start, GL.immediate.vertexData.subarray(start >> 2, end >> 2));
            }
            if (canSkip) return;
            GL.immediate.lastRenderer = this;
            GL.immediate.lastArrayBuffer = arrayBuffer;
            GL.immediate.lastProgram = GL.currProgram || this.program;
            GL.immediate.lastStride == GL.immediate.stride;
            GL.immediate.matricesModified = false;
            if (!GL.currProgram) {
              Module.ctx.useProgram(this.program);
              GL.immediate.fixedFunctionProgram = this.program;
            }
            if (this.modelViewLocation) Module.ctx.uniformMatrix4fv(this.modelViewLocation, false, GL.immediate.matrix['m']);
            if (this.projectionLocation) Module.ctx.uniformMatrix4fv(this.projectionLocation, false, GL.immediate.matrix['p']);
            var clientAttributes = GL.immediate.clientAttributes;
            Module.ctx.vertexAttribPointer(this.positionLocation, positionSize, positionType, false,
                                           GL.immediate.stride, clientAttributes[GL.immediate.VERTEX].offset);
            Module.ctx.enableVertexAttribArray(this.positionLocation);
            if (this.hasTextures) {
              //for (var i = 0; i < this.usedTexUnitList.length; i++) {
              //  var texUnitID = this.usedTexUnitList[i];
              for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
                var texUnitID = i;
                var attribLoc = this.texCoordLocations[texUnitID];
                if (attribLoc === undefined || attribLoc < 0) continue;
                if (texUnitID < textureSizes.length && textureSizes[texUnitID]) {
                  Module.ctx.vertexAttribPointer(attribLoc, textureSizes[texUnitID], textureTypes[texUnitID], false,
                                                 GL.immediate.stride, GL.immediate.clientAttributes[GL.immediate.TEXTURE0 + texUnitID].offset);
                  Module.ctx.enableVertexAttribArray(attribLoc);
                } else {
                  // These two might be dangerous, but let's try them.
                  Module.ctx.vertexAttrib4f(attribLoc, 0, 0, 0, 1);
                  Module.ctx.disableVertexAttribArray(attribLoc);
                }
              }
              for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
                if (this.textureMatrixLocations[i]) { // XXX might we need this even without the condition we are currently in?
                  Module.ctx.uniformMatrix4fv(this.textureMatrixLocations[i], false, GL.immediate.matrix['t' + i]);
                }
              }
            }
            if (colorSize) {
              Module.ctx.vertexAttribPointer(this.colorLocation, colorSize, colorType, true,
                                             GL.immediate.stride, clientAttributes[GL.immediate.COLOR].offset);
              Module.ctx.enableVertexAttribArray(this.colorLocation);
            } else if (this.hasColor) {
              Module.ctx.disableVertexAttribArray(this.colorLocation);
              Module.ctx.vertexAttrib4fv(this.colorLocation, GL.immediate.clientColor);
            }
            if (this.hasNormal) {
              Module.ctx.vertexAttribPointer(this.normalLocation, normalSize, normalType, true,
                                             GL.immediate.stride, clientAttributes[GL.immediate.NORMAL].offset);
              Module.ctx.enableVertexAttribArray(this.normalLocation);
            }
            if (this.hasFog) {
              if (this.fogColorLocation) Module.ctx.uniform4fv(this.fogColorLocation, GLEmulation.fogColor);
              if (this.fogEndLocation) Module.ctx.uniform1f(this.fogEndLocation, GLEmulation.fogEnd);
              if (this.fogScaleLocation) Module.ctx.uniform1f(this.fogScaleLocation, 1/(GLEmulation.fogEnd - GLEmulation.fogStart));
              if (this.fogDensityLocation) Module.ctx.uniform1f(this.fogDensityLocation, GLEmulation.fogDensity);
            }
          },
          cleanup: function() {
            Module.ctx.disableVertexAttribArray(this.positionLocation);
            if (this.hasTextures) {
              for (var i = 0; i < textureSizes.length; i++) {
                if (textureSizes[i] && this.texCoordLocations[i] >= 0) {
                  Module.ctx.disableVertexAttribArray(this.texCoordLocations[i]);
                }
              }
            }
            if (this.hasColor) {
              Module.ctx.disableVertexAttribArray(this.colorLocation);
            }
            if (this.hasNormal) {
              Module.ctx.disableVertexAttribArray(this.normalLocation);
            }
            if (!GL.currProgram) {
              Module.ctx.useProgram(null);
            }
            if (!GL.currArrayBuffer) {
              Module.ctx.bindBuffer(Module.ctx.ARRAY_BUFFER, null);
            }
            GL.immediate.lastRenderer = null;
            GL.immediate.lastArrayBuffer = null;
            GL.immediate.lastProgram = null;
            GL.immediate.matricesModified = true;
          }
        };
        ret.init();
        return ret;
      },setupFuncs:function () {
        // Replace some functions with immediate-mode aware versions. If there are no client
        // attributes enabled, and we use webgl-friendly modes (no GL_QUADS), then no need
        // for emulation
        _glDrawArrays = function(mode, first, count) {
          if (GL.immediate.totalEnabledClientAttributes == 0 && mode <= 6) {
            Module.ctx.drawArrays(mode, first, count);
            return;
          }
          GL.immediate.prepareClientAttributes(count, false);
          GL.immediate.mode = mode;
          if (!GL.currArrayBuffer) {
            GL.immediate.vertexData = HEAPF32.subarray((GL.immediate.vertexPointer)>>2,(GL.immediate.vertexPointer + (first+count)*GL.immediate.stride)>>2); // XXX assuming float
            GL.immediate.firstVertex = first;
            GL.immediate.lastVertex = first + count;
          }
          GL.immediate.flush(null, first);
          GL.immediate.mode = -1;
        };
        _glDrawElements = function(mode, count, type, indices, start, end) { // start, end are given if we come from glDrawRangeElements
          if (GL.immediate.totalEnabledClientAttributes == 0 && mode <= 6 && GL.currElementArrayBuffer) {
            Module.ctx.drawElements(mode, count, type, indices);
            return;
          }
          if (!GL.currElementArrayBuffer) {
            assert(type == Module.ctx.UNSIGNED_SHORT); // We can only emulate buffers of this kind, for now
          }
          console.log("DrawElements doesn't actually prepareClientAttributes properly.");
          GL.immediate.prepareClientAttributes(count, false);
          GL.immediate.mode = mode;
          if (!GL.currArrayBuffer) {
            GL.immediate.firstVertex = end ? start : TOTAL_MEMORY; // if we don't know the start, set an invalid value and we will calculate it later from the indices
            GL.immediate.lastVertex = end ? end+1 : 0;
            GL.immediate.vertexData = HEAPF32.subarray((GL.immediate.vertexPointer)>>2,((end ? GL.immediate.vertexPointer + (end+1)*GL.immediate.stride : TOTAL_MEMORY))>>2); // XXX assuming float
          }
          GL.immediate.flush(count, 0, indices);
          GL.immediate.mode = -1;
        };
        // TexEnv stuff needs to be prepared early, so do it here.
        // init() is too late for -O2, since it freezes the GL functions
        // by that point.
        GL.immediate.MapTreeLib = GL.immediate.spawnMapTreeLib();
        GL.immediate.spawnMapTreeLib = null;
        GL.immediate.TexEnvJIT = GL.immediate.spawnTexEnvJIT();
        GL.immediate.spawnTexEnvJIT = null;
        GL.immediate.setupHooks();
      },setupHooks:function () {
        if (!GLEmulation.hasRunInit) {
          GLEmulation.init();
        }
        var glActiveTexture = _glActiveTexture;
        _glActiveTexture = function(texture) {
          GL.immediate.TexEnvJIT.hook_activeTexture(texture);
          glActiveTexture(texture);
        };
        var glEnable = _glEnable;
        _glEnable = function(cap) {
          GL.immediate.TexEnvJIT.hook_enable(cap);
          glEnable(cap);
        };
        var glDisable = _glDisable;
        _glDisable = function(cap) {
          GL.immediate.TexEnvJIT.hook_disable(cap);
          glDisable(cap);
        };
        var glTexEnvf = (typeof(_glTexEnvf) != 'undefined') ? _glTexEnvf : function(){};
        _glTexEnvf = function(target, pname, param) {
          GL.immediate.TexEnvJIT.hook_texEnvf(target, pname, param);
          // Don't call old func, since we are the implementor.
          //glTexEnvf(target, pname, param);
        };
        var glTexEnvi = (typeof(_glTexEnvi) != 'undefined') ? _glTexEnvi : function(){};
        _glTexEnvi = function(target, pname, param) {
          GL.immediate.TexEnvJIT.hook_texEnvi(target, pname, param);
          // Don't call old func, since we are the implementor.
          //glTexEnvi(target, pname, param);
        };
        var glTexEnvfv = (typeof(_glTexEnvfv) != 'undefined') ? _glTexEnvfv : function(){};
        _glTexEnvfv = function(target, pname, param) {
          GL.immediate.TexEnvJIT.hook_texEnvfv(target, pname, param);
          // Don't call old func, since we are the implementor.
          //glTexEnvfv(target, pname, param);
        };
        var glGetIntegerv = _glGetIntegerv;
        _glGetIntegerv = function(pname, params) {
          switch (pname) {
            case 0x8B8D: { // GL_CURRENT_PROGRAM
              // Just query directly so we're working with WebGL objects.
              var cur = Module.ctx.getParameter(Module.ctx.CURRENT_PROGRAM);
              if (cur == GL.immediate.fixedFunctionProgram) {
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
        GL.immediate.initted = true;
        if (!Module.useWebGL) return; // a 2D canvas may be currently used TODO: make sure we are actually called in that case
        this.TexEnvJIT.init(Module.ctx);
        GL.immediate.MAX_TEXTURES = Module.ctx.getParameter(Module.ctx.MAX_TEXTURE_IMAGE_UNITS);
        GL.immediate.NUM_ATTRIBUTES = GL.immediate.TEXTURE0 + GL.immediate.MAX_TEXTURES;
        GL.immediate.clientAttributes = [];
        for (var i = 0; i < GL.immediate.NUM_ATTRIBUTES; i++) {
          GL.immediate.clientAttributes.push({});
        }
        this.matrixStack['m'] = [];
        this.matrixStack['p'] = [];
        for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
          this.matrixStack['t' + i] = [];
        }
        // Initialize matrix library
        GL.immediate.matrix['m'] = GL.immediate.matrix.lib.mat4.create();
        GL.immediate.matrix.lib.mat4.identity(GL.immediate.matrix['m']);
        GL.immediate.matrix['p'] = GL.immediate.matrix.lib.mat4.create();
        GL.immediate.matrix.lib.mat4.identity(GL.immediate.matrix['p']);
        for (var i = 0; i < GL.immediate.MAX_TEXTURES; i++) {
          GL.immediate.matrix['t' + i] = GL.immediate.matrix.lib.mat4.create();
        }
        // Renderer cache
        this.rendererCache = this.MapTreeLib.create();
        // Buffers for data
        this.tempData = new Float32Array(GL.MAX_TEMP_BUFFER_SIZE >> 2);
        this.indexData = new Uint16Array(GL.MAX_TEMP_BUFFER_SIZE >> 1);
        this.vertexDataU8 = new Uint8Array(this.tempData.buffer);
        GL.generateTempBuffers(true);
        this.clientColor = new Float32Array([1, 1, 1, 1]);
      },prepareClientAttributes:function (count, beginEnd) {
        // If no client attributes were modified since we were last called, do nothing. Note that this
        // does not work for glBegin/End, where we generate renderer components dynamically and then
        // disable them ourselves, but it does help with glDrawElements/Arrays.
        if (!this.modifiedClientAttributes) {
          return;
        }
        this.modifiedClientAttributes = false;
        var stride = 0, start;
        var attributes = GL.immediate.liveClientAttributes;
        attributes.length = 0;
        for (var i = 0; i < GL.immediate.NUM_ATTRIBUTES; i++) {
          if (GL.immediate.enabledClientAttributes[i]) attributes.push(GL.immediate.clientAttributes[i]);
        }
        attributes.sort(function(x, y) { return !x ? (!y ? 0 : 1) : (!y ? -1 : (x.pointer - y.pointer)) });
        start = GL.currArrayBuffer ? 0 : attributes[0].pointer;
        var multiStrides = false;
        for (var i = 0; i < attributes.length; i++) {
          var attribute = attributes[i];
          if (!attribute) break;
          if (stride != 0 && stride != attribute.stride) multiStrides = true;
          if (attribute.stride) stride = attribute.stride;
        }
        if (multiStrides) stride = 0; // we will need to restride
        var bytes = 0; // total size in bytes
        if (!stride && !beginEnd) {
          // beginEnd can not have stride in the attributes, that is fine. otherwise,
          // no stride means that all attributes are in fact packed. to keep the rest of
          // our emulation code simple, we perform unpacking/restriding here. this adds overhead, so
          // it is a good idea to not hit this!
          Runtime.warnOnce('Unpacking/restriding attributes, this is slow and dangerous');
          if (!GL.immediate.restrideBuffer) GL.immediate.restrideBuffer = _malloc(GL.MAX_TEMP_BUFFER_SIZE);
          start = GL.immediate.restrideBuffer;
          assert(start % 4 == 0);
          // calculate restrided offsets and total size
          for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (!attribute) break;
            var size = attribute.size * GL.byteSizeByType[attribute.type - GL.byteSizeByTypeRoot];
            if (size % 4 != 0) size += 4 - (size % 4); // align everything
            attribute.offset = bytes;
            bytes += size;
          }
          assert(count*bytes <= GL.MAX_TEMP_BUFFER_SIZE);
          // copy out the data (we need to know the stride for that, and define attribute.pointer
          for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (!attribute) break;
            var size4 = Math.floor((attribute.size * GL.byteSizeByType[attribute.type - GL.byteSizeByTypeRoot])/4);
            for (var j = 0; j < count; j++) {
              for (var k = 0; k < size4; k++) { // copy in chunks of 4 bytes, our alignment makes this possible
                HEAP32[((start + attribute.offset + bytes*j)>>2) + k] = HEAP32[(attribute.pointer>>2) + j*size4 + k];
              }
            }
            attribute.pointer = start + attribute.offset;
          }
        } else {
          // normal situation, everything is strided and in the same buffer
          for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (!attribute) break;
            attribute.offset = attribute.pointer - start;
            if (attribute.offset > bytes) { // ensure we start where we should
              assert((attribute.offset - bytes)%4 == 0); // XXX assuming 4-alignment
              bytes += attribute.offset - bytes;
            }
            bytes += attribute.size * GL.byteSizeByType[attribute.type - GL.byteSizeByTypeRoot];
            if (bytes % 4 != 0) bytes += 4 - (bytes % 4); // XXX assuming 4-alignment
          }
          assert(beginEnd || bytes <= stride); // if not begin-end, explicit stride should make sense with total byte size
          if (bytes < stride) { // ensure the size is that of the stride
            bytes = stride;
          }
        }
        GL.immediate.stride = bytes;
        if (!beginEnd) {
          bytes *= count;
          if (!GL.currArrayBuffer) {
            GL.immediate.vertexPointer = start;
          }
          GL.immediate.vertexCounter = bytes / 4; // XXX assuming float
        }
      },flush:function (numProvidedIndexes, startIndex, ptr) {
        assert(numProvidedIndexes >= 0 || !numProvidedIndexes);
        startIndex = startIndex || 0;
        ptr = ptr || 0;
        var renderer = this.getRenderer();
        // Generate index data in a format suitable for GLES 2.0/WebGL
        var numVertexes = 4 * this.vertexCounter / GL.immediate.stride;
        assert(numVertexes % 1 == 0, "`numVertexes` must be an integer.");
        var emulatedElementArrayBuffer = false;
        var numIndexes = 0;
        if (numProvidedIndexes) {
          numIndexes = numProvidedIndexes;
          if (!GL.currArrayBuffer && GL.immediate.firstVertex > GL.immediate.lastVertex) {
            // Figure out the first and last vertex from the index data
            assert(!GL.currElementArrayBuffer); // If we are going to upload array buffer data, we need to find which range to
                                                // upload based on the indices. If they are in a buffer on the GPU, that is very
                                                // inconvenient! So if you do not have an array buffer, you should also not have
                                                // an element array buffer. But best is to use both buffers!
            for (var i = 0; i < numProvidedIndexes; i++) {
              var currIndex = HEAPU16[(((ptr)+(i*2))>>1)];
              GL.immediate.firstVertex = Math.min(GL.immediate.firstVertex, currIndex);
              GL.immediate.lastVertex = Math.max(GL.immediate.lastVertex, currIndex+1);
            }
          }
          if (!GL.currElementArrayBuffer) {
            // If no element array buffer is bound, then indices is a literal pointer to clientside data
            assert(numProvidedIndexes << 1 <= GL.MAX_TEMP_BUFFER_SIZE, 'too many immediate mode indexes (a)');
            var indexBuffer = GL.tempIndexBuffers[GL.tempBufferIndexLookup[numProvidedIndexes << 1]];
            Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
            Module.ctx.bufferSubData(Module.ctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU16.subarray((ptr)>>1,(ptr + (numProvidedIndexes << 1))>>1));
            ptr = 0;
            emulatedElementArrayBuffer = true;
          }
        } else if (GL.immediate.mode > 6) { // above GL_TRIANGLE_FAN are the non-GL ES modes
          if (GL.immediate.mode != 7) throw 'unsupported immediate mode ' + GL.immediate.mode; // GL_QUADS
          // GL.immediate.firstVertex is the first vertex we want. Quad indexes are in the pattern
          // 0 1 2, 0 2 3, 4 5 6, 4 6 7, so we need to look at index firstVertex * 1.5 to see it.
          // Then since indexes are 2 bytes each, that means 3
          assert(GL.immediate.firstVertex % 4 == 0);
          ptr = GL.immediate.firstVertex*3;
          var numQuads = numVertexes / 4;
          numIndexes = numQuads * 6; // 0 1 2, 0 2 3 pattern
          assert(ptr + (numIndexes << 1) <= GL.MAX_TEMP_BUFFER_SIZE, 'too many immediate mode indexes (b)');
          Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, GL.tempQuadIndexBuffer);
          emulatedElementArrayBuffer = true;
        }
        renderer.prepare();
        if (numIndexes) {
          Module.ctx.drawElements(Module.ctx.TRIANGLES, numIndexes, Module.ctx.UNSIGNED_SHORT, ptr);
        } else {
          Module.ctx.drawArrays(GL.immediate.mode, startIndex, numVertexes);
        }
        if (emulatedElementArrayBuffer) {
          Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, GL.buffers[GL.currElementArrayBuffer] || null);
        }
      }};
  GL.immediate = GLImmediate; GL.immediate.matrix.lib = (function() {
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
      GL.immediate.enabledClientAttributes_preBegin = GL.immediate.enabledClientAttributes;
      GL.immediate.enabledClientAttributes = [];
      GL.immediate.clientAttributes_preBegin = GL.immediate.clientAttributes;
      GL.immediate.clientAttributes = []
      for (var i = 0; i < GL.immediate.clientAttributes_preBegin.length; i++) {
        GL.immediate.clientAttributes.push({});
      }
      GL.immediate.mode = mode;
      GL.immediate.vertexCounter = 0;
      var components = GL.immediate.rendererComponents = [];
      for (var i = 0; i < GL.immediate.NUM_ATTRIBUTES; i++) {
        components[i] = 0;
      }
      GL.immediate.rendererComponentPointer = 0;
      GL.immediate.vertexData = GL.immediate.tempData;
    }
;
;
;
;
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  var _cosf=Math.cos;
  var _sinf=Math.sin;
;
;
;
;
;
;
;
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
;
;
;
;
;
;
;
;
;
;
;
;
;
  var _tanf=Math.tan;
  var GLUT={initTime:null,idleFunc:null,displayFunc:null,keyboardFunc:null,keyboardUpFunc:null,specialFunc:null,specialUpFunc:null,reshapeFunc:null,motionFunc:null,passiveMotionFunc:null,mouseFunc:null,buttons:0,modifiers:0,initWindowWidth:256,initWindowHeight:256,windowX:0,windowY:0,windowWidth:0,windowHeight:0,saveModifiers:function (event) {
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
        if (106 <= keycode && keycode <= 111)
          return keycode - 106 + 42; // *,+-./  TODO handle shift?
        switch (keycode) {
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
      },onMouseButtonDown:function (event){
        Browser.calculateMouseEvent(event);
        GLUT.buttons |= (1 << event['button']);
        if(event.target == Module["canvas"] && GLUT.mouseFunc){
          try {
            event.target.setCapture();
          } catch (e) {}
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [event['button'], 0/*GLUT_DOWN*/, Browser.mouseX, Browser.mouseY]);
        }
      },onMouseButtonUp:function (event){
        Browser.calculateMouseEvent(event);
        GLUT.buttons &= ~(1 << event['button']);
        if(GLUT.mouseFunc) {
          event.preventDefault();
          GLUT.saveModifiers(event);
          Runtime.dynCall('viiii', GLUT.mouseFunc, [event['button'], 1/*GLUT_UP*/, Browser.mouseX, Browser.mouseY]);
        }
      },onFullScreenEventChange:function (event){
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
  var _fabs=Math.abs;
  function _glutPostRedisplay() {
      if (GLUT.displayFunc) {
        Browser.requestAnimationFrame(function() {
          if (ABORT) return;
          Runtime.dynCall('v', GLUT.displayFunc);
        });
      }
    }
  function _glutGetModifiers() { return GLUT.modifiers; }
  function _glutInit(argcp, argv) {
      // Ignore arguments
      GLUT.initTime = Date.now();
      window.addEventListener("keydown", GLUT.onKeydown, true);
      window.addEventListener("keyup", GLUT.onKeyup, true);
      window.addEventListener("mousemove", GLUT.onMousemove, true);
      window.addEventListener("mousedown", GLUT.onMouseButtonDown, true);
      window.addEventListener("mouseup", GLUT.onMouseButtonUp, true);
      Browser.resizeListeners.push(function(width, height) {
        if (GLUT.reshapeFunc) {
        	Runtime.dynCall('vii', GLUT.reshapeFunc, [width, height]);
        }
      });
      __ATEXIT__.push({ func: function() {
        window.removeEventListener("keydown", GLUT.onKeydown, true);
        window.removeEventListener("keyup", GLUT.onKeyup, true);
        window.removeEventListener("mousemove", GLUT.onMousemove, true);
        window.removeEventListener("mousedown", GLUT.onMouseButtonDown, true);
        window.removeEventListener("mouseup", GLUT.onMouseButtonUp, true);
        Module["canvas"].width = Module["canvas"].height = 1;
      } });
    }
  function _glutInitDisplayMode(mode) {}
  function _glutInitWindowSize(width, height) {
      Browser.setCanvasSize( GLUT.initWindowWidth = width,
                             GLUT.initWindowHeight = height );
    }
  function _glutInitWindowPosition(x, y) {
      // Ignore for now
    }
  function _glutCreateWindow(name) {
      Module.ctx = Browser.createContext(Module['canvas'], true, true);
      return 1;
    }
  function _glutDisplayFunc(func) {
      GLUT.displayFunc = func;
    }
  function _glutIdleFunc(func) {
      var callback = function() {
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
  function _glutMouseFunc(func) {
      GLUT.mouseFunc = func;
    }
  function _glutMotionFunc(func) {
      GLUT.motionFunc = func;
    }
  function _glutReshapeFunc(func) {
      GLUT.reshapeFunc = func;
    }
  function _glutKeyboardFunc(func) {
      GLUT.keyboardFunc = func;
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
  var CL={types:{FLOAT:0,FLOAT_V:1,INT:2,INT_V:3,UINT:4,UINT_V:5},ctx:[],webcl_mozilla:0,webcl_webkit:0,ctx_clean:0,cmdQueue:[],cmdQueue_clean:0,programs:[],programs_clean:0,kernels:[],kernels_clean:0,buffers:[],buffers_clean:0,platforms:[],devices:[],sig:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",isFloat:function (ptr,size) {
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
        console.log("getAllDevices() : "+res.length);
        return res;
      },catchError:function (name,e) {
        var str=""+e;
        var n=str.lastIndexOf(" ");
        var error = str.substr(n+1,str.length-n-2);
        console.error("CATCH: "+name+": "+e);
        return error;
      }};function _clCreateProgramWithSource(context, count, strings, lengths, errcode_ret) {
      var ctx = context - 1;
      if (ctx >= CL.ctx.length || ctx < 0 ) {
        console.error("clCreateProgramWithSource: Invalid context : "+ctx);
        HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
        return 0; // Null pointer    
      }
      var sourceIdx = HEAP32[((strings)>>2)]
      var kernel = Pointer_stringify(sourceIdx); 
      // Experimental parse of kernel for have the different type of the kernel (input and output)
      var start_kernel = kernel.indexOf("__kernel");
      var kernel_sub_part = kernel.substr(start_kernel,kernel.length - start_kernel);
      var start_kernel_brace = kernel_sub_part.indexOf("(");
      var close_kernel_brace = kernel_sub_part.indexOf(")");
      kernel_sub_part = kernel_sub_part.substr(start_kernel_brace + 1,close_kernel_brace - start_kernel_brace);
      kernel_sub_part = kernel_sub_part.replace(/\n/g, "");
      var kernel_sub_part_split = kernel_sub_part.split(",");
      for (var i = 0; i < kernel_sub_part_split.length; i++) {
        if (kernel_sub_part_split[i].indexOf("float4") > -1 ||
           (kernel_sub_part_split[i].indexOf("float") > -1 && kernel_sub_part_split[i].indexOf("*") > -1 )) {
          console.info("Kernel Parameter "+i+" typeof is float4 or float* ("+CL.types.FLOAT_V+")");
          CL.sig[i] = CL.types.FLOAT_V;
        } else if (kernel_sub_part_split[i].indexOf("float") > -1 ) {
          console.info("Kernel Parameter "+i+" typeof is float ("+CL.types.FLOAT+")");
          CL.sig[i] = CL.types.FLOAT;    
        } else if (kernel_sub_part_split[i].indexOf("uchar4") > -1  ||
                  (kernel_sub_part_split[i].indexOf("unsigned") > -1  && kernel_sub_part_split[i].indexOf("char") > -1  && kernel_sub_part_split[i].indexOf("*") > -1 ) ||
                  (kernel_sub_part_split[i].indexOf("unsigned") > -1  && kernel_sub_part_split[i].indexOf("int") > -1  && kernel_sub_part_split[i].indexOf("*") > -1 )) {
          console.info("Kernel Parameter "+i+" typeof is uchar4 or unsigned char* or unsigned int * ("+CL.types.UINT_V+")");
          CL.sig[i] = CL.types.UINT_V;
        } else if (kernel_sub_part_split[i].indexOf("unsigned") > -1  && kernel_sub_part_split[i].indexOf("int") > -1 ) {
          console.info("Kernel Parameter "+i+" typeof is unsigned int ("+CL.types.UINT+")");
          CL.sig[i] = CL.types.UINT;        
        } else if (kernel_sub_part_split[i].indexOf("int") > -1  && kernel_sub_part_split[i].indexOf("*") > -1 ) {
          console.info("Kernel Parameter "+i+" typeof is int * ("+CL.types.INT_V+")");
          CL.sig[i] = CL.types.INT_V;    
        } else if (kernel_sub_part_split[i].indexOf("int") > -1 ) {
          console.info("Kernel Parameter "+i+" typeof is int ("+CL.types.INT+")");
          CL.sig[i] = CL.types.INT;    
        } else {
          console.error("Unknow type of parameter : "+kernel_sub_part_split[i]);        
        }
      }
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
  function _clGetKernelWorkGroupInfo(kernel, devices, param_name, param_value_size, param_value, param_value_size_ret) {
      var ker = kernel - 1;
      if (ker >= CL.kernels.length || ker < 0 ) {
        console.error("clGetKernelWorkGroupInfo: Invalid kernel : "+ker);
        return -48; /* CL_INVALID_KERNEL */
      }
      // \todo the type is a number but why i except have a Array ??? Will must be an array ???
      var idx = 0;//HEAP32[((devices)>>2)] - 1;
      if (idx >= CL.devices.length || idx < 0 ) {
        console.error("clGetKernelWorkGroupInfo: Invalid device : "+idx);
        return -33; /* CL_INVALID_DEVICE */  
      }
      try {        
        var res;
        switch (param_name) {
          case (0x11B0) /* CL_KERNEL_WORK_GROUP_SIZE */:
            if (CL.webcl_mozilla == 1) {
              res = CL.kernels[ker].getKernelWorkGroupInfo(CL.devices[idx],WebCL.CL_KERNEL_WORK_GROUP_SIZE);
            } else {
              res = CL.kernels[ker].getWorkGroupInfo(CL.devices[idx],WebCL.KERNEL_WORK_GROUP_SIZE);
            }
          break;
        case (0x11B1) /*    CL_KERNEL_COMPILE_WORK_GROUP_SIZE    */:
          if (CL.webcl_mozilla == 1) {
            res = CL.kernels[ker].getKernelWorkGroupInfo(CL.devices[idx],WebCL.CL_KERNEL_COMPILE_WORK_GROUP_SIZE);
          } else {
            res = CL.kernels[ker].getWorkGroupInfo(CL.devices[idx],WebCL.KERNEL_COMPILE_WORK_GROUP_SIZE);
          }
          break;
        case (0x11B2) /*    CL_KERNEL_LOCAL_MEM_SIZE    */:
          if (CL.webcl_mozilla == 1) {
            res = CL.kernels[ker].getKernelWorkGroupInfo(CL.devices[idx],WebCL.CL_KERNEL_LOCAL_MEM_SIZE);
          } else {
            res = CL.kernels[ker].getWorkGroupInfo(CL.devices[idx],WebCL.CL_KERNEL_LOCAL_MEM_SIZE);
          }
          break;
        };
        HEAP32[((param_value)>>2)]=res
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clGetKernelWorkGroupInfo",e);
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
            if (CL.sig.length == 0 || CL.buffers-1 > CL.sig.length) {
              console.error("clCreateBuffer: Invalid signature : "+buff);
              return -1; /* CL_FAILED */     
            }
            var isFloat = 0;
            var vector;    
            if (CL.sig[CL.buffers.length-1] == CL.types.FLOAT_V) {
              vector = new Float32Array(size / 4);
              isFloat = 1;
            } else if (CL.sig[CL.buffers.length-1] == CL.types.UINT_V) {
              vector = new Uint32Array(size / 4);
            } else if (CL.sig[CL.buffers.length-1] == CL.types.INT_V) {
              vector = new Int32Array(size / 4);
            } else {
              console.error("clCreateBuffer: Unknow ouptut type : "+CL.sig[CL.buffers.length-1]);
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
  function _clEnqueueWriteBuffer(command_queue, buffer, blocking_write, offset, size, ptr, num_events_in_wait_list, event_wait_list, event) {
      var queue = command_queue - 1;
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clEnqueueWriteBuffer: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var buff = buffer - 1;
      if (buff >= CL.buffers.length || buff < 0 ) {
        console.error("clEnqueueWriteBuffer: Invalid command queue : "+buff);
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      var isFloat = 0;
      var vector;    
      if (CL.sig.length == 0 || buff > CL.sig.length) {
        isFloat = CL.isFloat(ptr,size); 
        if (isFloat) {
          vector = new Float32Array(size / 4);
        } else {
          vector = new Int32Array(size / 4);
        }
      } else {        
        if (CL.sig[buff] == CL.types.FLOAT_V) {
          vector = new Float32Array(size / 4);
          isFloat = 1;
        } else if (CL.sig[buff] == CL.types.UINT_V) {
          vector = new Uint32Array(size / 4);
        } else if (CL.sig[buff] == CL.types.INT_V) {
          vector = new Int32Array(size / 4);
        } else {
          console.error("clEnqueueWriteBuffer: Unknow ouptut type : "+CL.sig[buff]);
        }
      }
      for (var i = 0; i < (size / 4); i++) {
        if (isFloat) {
          vector[i] = HEAPF32[(((ptr)+(i*4))>>2)];
        } else {
          vector[i] = HEAP32[(((ptr)+(i*4))>>2)];
        }
      }
      console.log(vector);
      try {
        CL.cmdQueue[queue].enqueueWriteBuffer (CL.buffers[buff], blocking_write, offset, size, vector , []);
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueWriteBuffer",e);
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
;
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
  function _clGetDeviceInfo(device, param_name, param_value_size, param_value, param_value_size_ret) {
      var idx = device - 1;
      if (idx >= CL.devices.length || idx < 0 ) {
        console.error("clGetDeviceInfo: Invalid device : "+idx);
        return -33; /* CL_INVALID_DEVICE */  
      }    
      try {
        var res;
        var size;
        switch (param_name) {
          case (0x100D) /* CL_DEVICE_ADDRESS_BITS */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_ADDRESS_BITS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          case (0x1028) /* CL_DEVICE_COMPILER_AVAILABLE */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_COMPILER_AVAILABLE); // return cl_bool
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          case (0x1027) /* CL_DEVICE_AVAILABLE */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_AVAILABLE); // return cl_bool
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          case (0x1026) /* CL_DEVICE_ENDIAN_LITTLE */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_ENDIAN_LITTLE); // return cl_bool
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          case (0x1024) /* CL_DEVICE_ERROR_CORRECTION_SUPPORT */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_ERROR_CORRECTION_SUPPORT); // return cl_bool
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;   
          case (0x1030) /* CL_DEVICE_EXTENSIONS */:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_EXTENSIONS) : "Not Visible" /*CL.devices[idx].getInfo(WebCL.DEVICE_EXTENSIONS)*/; // return string
            writeStringToMemory(res, param_value);
            size = res.length;
            console.info("Size : "+size)
            break;
          case (0x101E) /* CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;   
          case (0x1016) /* CL_DEVICE_IMAGE_SUPPORT*/:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_IMAGE_SUPPORT) : CL.devices[idx].getInfo(WebCL.DEVICE_IMAGE_SUPPORT); // return true or false
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break; 
          case (0x1011) /* CL_DEVICE_IMAGE2D_MAX_WIDTH*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_IMAGE2D_MAX_WIDTH); // return size_t
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;   
          case (0x1012) /* CL_DEVICE_IMAGE2D_MAX_HEIGHT*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_IMAGE2D_MAX_HEIGHT); // return size_t
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;   
          case (0x1013) /* CL_DEVICE_IMAGE3D_MAX_WIDTH*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_IMAGE3D_MAX_WIDTH); // return size_t
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;   
          case (0x1014) /* CL_DEVICE_IMAGE3D_MAX_HEIGHT*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_IMAGE3D_MAX_HEIGHT); // return size_t
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;    
          case (0x1015) /* CL_DEVICE_IMAGE3D_MAX_DEPTH*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_IMAGE3D_MAX_DEPTH); // return size_t
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;         
          case (0x100C) /* CL_DEVICE_MAX_CLOCK_FREQUENCY */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_CLOCK_FREQUENCY); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          case (0x1002) /* CL_DEVICE_MAX_COMPUTE_UNITS */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_COMPUTE_UNITS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;   
          case (0x1021) /* CL_DEVICE_MAX_CONSTANT_ARGS */:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_CONSTANT_ARGS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x1017) /* CL_DEVICE_MAX_PARAMETER_SIZE*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_PARAMETER_SIZE); // return size_t
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break; 
          case (0x100E) /* CL_DEVICE_MAX_READ_IMAGE_ARGS*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_READ_IMAGE_ARGS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break; 
          case (0x1018) /* CL_DEVICE_MAX_SAMPLERS*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_SAMPLERS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x1004) /* CL_DEVICE_MAX_WORK_GROUP_SIZE*/:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE) : CL.devices[idx].getInfo(WebCL.DEVICE_MAX_WORK_GROUP_SIZE) ; // return cl_device i64
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break; 
          case (0x1003) /* CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;    
          case (0x100F) /* CL_DEVICE_MAX_WRITE_IMAGE_ARGS*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_WRITE_IMAGE_ARGS); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;    
          case (0x1019) /* CL_DEVICE_MEM_BASE_ADDR_ALIGN*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MEM_BASE_ADDR_ALIGN); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;                  
          case (0x101A) /* CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;              
          case (0x102B) /* CL_DEVICE_NAME */:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NAME) : "Not Visible" /*CL.devices[idx].getInfo(WebCL.DEVICE_NAME)*/; // return string
            size = res.length;
            writeStringToMemory(res, param_value);
            break;
          case (0x1031) /* CL_DEVICE_PLATFORM*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PLATFORM); // return cl_platform_id 
            // \todo how return the good platform inside the tab ?????
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x1006) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x1007) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x1008) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x1009) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x100A) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;     
          case (0x100B) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break; 
  //          case (0x1034) /* CL_DEVICE_PREFERRED_VECTOR_WIDTH_HALF*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PREFERRED_VECTOR_WIDTH_HALF); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;         
  //         case (0x1036) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_CHAR*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_CHAR); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;     
  //         case (0x1037) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_SHORT*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_SHORT); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;     
  //         case (0x1038) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_INT*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_INT); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;     
  //         case (0x1039) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_LONG*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_LONG); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;     
  //         case (0x103A) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_FLOAT*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_FLOAT); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;     
  //         case (0x103B) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_DOUBLE*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_DOUBLE); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;    
  //         case (0x103C) /* CL_DEVICE_NATIVE_VECTOR_WIDTH_HALF*/:
  //           res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_NATIVE_VECTOR_WIDTH_HALF); // return cl_uint
  //           HEAP32[((param_value)>>2)]=res;
  //           size = 1;
  //           break;             
          case (0x1001) /* CL_DEVICE_VENDOR_ID*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_VENDOR_ID); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            size = 1;make
            break;       
          case (0x102C) /* CL_DEVICE_VENDOR*/:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_VENDOR) :  "Not Visible" /*CL.devices[idx].getInfo(WebCL.DEVICE_VENDOR)*/; // return string
            writeStringToMemory(res, param_value);
            size = res.length;
            break;
          case (0x1000) /* CL_DEVICE_TYPE*/:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_TYPE) : CL.devices[idx].getInfo(WebCL.DEVICE_TYPE) ; // return cl_device i64
            // \todo return the type with i32 is wrong ????? seems ok with result but not really sure !!!!
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          case (0x102D) /* CL_DRIVER_VERSION*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DRIVER_VERSION); // return string
            writeStringToMemory(res, param_value);
            size = res.length;
            break;   
          case (0x102F) /* CL_DEVICE_VERSION*/:
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_VERSION) : CL.devices[idx].getInfo(WebCL.DEVICE_VERSION) ; 
            writeStringToMemory(res, param_value);
            size = res.length;
            break;   
          case (0x102E) /* CL_DEVICE_PROFILE*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_PROFILE); // return string
            writeStringToMemory(res, param_value);
            size = res.length;
            break;  
          case (0x1010) /* CL_DEVICE_MAX_MEM_ALLOC_SIZE*/:
            res = CL.devices[idx].getDeviceInfo(WebCL.CL_DEVICE_MAX_MEM_ALLOC_SIZE); // return cl_ulong
            HEAP32[((param_value)>>2)]=res;
            size = 1;
            break;
          default:
            console.error("clGetDeviceInfo : Param not yet implemented or unknow : "+param_name);
            return -30; /* CL_INVALID_VALUE */ 
        };
        HEAP32[((param_value_size_ret)>>2)]=size;
        return 0;/*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetDeviceInfo",e);
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
  function _clFinish(command_queue) {
      var queue = command_queue - 1;
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clFinish: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      try {
        CL.cmdQueue[queue].finish(); //Finish all the operations
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clFinish",e);
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
      console.info("clReleaseMemObject: Release Memory Object : "+buff);
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
        var isFloat = 0;
        if (CL.sig.length > 0 && arg_index < CL.sig.length) {
          isFloat = ( CL.sig[arg_index] == CL.types.FLOAT_V ) || ( CL.sig[arg_index] == CL.types.FLOAT ) 
        } else {
          console.error("clSetKernelArg: Invalid signature : "+CL.sig.length);
          return -1; /* CL_FAILED */
        }
        var isNull = (HEAP32[((arg_value)>>2)] == 0);
        var value;
        if (isNull == 1) {
          ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArgLocal(arg_index,arg_size) : CL.kernels[ker].setArg(arg_index,arg_size,WebCLKernelArgumentTypes.LOCAL_MEMORY_SIZE);
        } else if (arg_size > 4) {
          value = new Array(arg_size/4);
          for (var i = 0; i < arg_size/4; i++) {
            if (isFloat == 1) {
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
          if (isFloat == 1) {    
            //CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.FLOAT | type);
          } else {          
            //CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.INT | type);
          } 
        } else {     
          if (isFloat == 1) {
            value = HEAPF32[((arg_value)>>2)];
          } else {
            value = HEAP32[((arg_value)>>2)];
          }
          if (arg_index >= 0 && arg_index < CL.buffers.length) {
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,CL.buffers[arg_index]) : CL.kernels[ker].setArg(arg_index,CL.buffers[arg_index]);
          } else {
            if (isFloat == 1) { 
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
  var _ceilf=Math.ceil;
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
        if (CL.sig.length == 0 || buff > CL.sig.length) {
          console.error("clEnqueueReadBuffer: Invalid signature : "+buff);
          return -1; /* CL_FAILED */     
        }
        var isFloat = 0;
        var vector;    
        if (CL.sig[buff] == CL.types.FLOAT_V) {
          vector = new Float32Array(size / 4);
          isFloat = 1;
        } else if (CL.sig[buff] == CL.types.UINT_V) {
          vector = new Uint32Array(size / 4);
        } else if (CL.sig[buff] == CL.types.INT_V) {
          vector = new Int32Array(size / 4);
        } else {
          console.error("clEnqueueReadBuffer: Unknow ouptut type : "+CL.sig[buff]);
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
  function _emscripten_get_now() {
      if (ENVIRONMENT_IS_NODE) {
          var t = process['hrtime']();
          return t[0] * 1e3 + t[1] / 1e6;
      }
      else if (window['performance'] && window['performance']['now']) {
        return window['performance']['now']();
      } else {
        return Date.now();
      }
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
      FS.checkStreams();
      return id;
    }
  var ___stat_struct_layout={__size__:68,st_dev:0,st_ino:4,st_mode:8,st_nlink:12,st_uid:16,st_gid:20,st_rdev:24,st_size:28,st_atime:32,st_spare1:36,st_mtime:40,st_spare2:44,st_ctime:48,st_spare3:52,st_blksize:56,st_blocks:60,st_spare4:64};function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      var obj = FS.findObject(Pointer_stringify(path), dontResolveLastLink);
      if (obj === null || !FS.forceLoadFile(obj)) return -1;
      var offsets = ___stat_struct_layout;
      // Constants.
      HEAP32[(((buf)+(offsets.st_nlink))>>2)]=1
      HEAP32[(((buf)+(offsets.st_uid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_gid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_blksize))>>2)]=4096
      // Variables.
      HEAP32[(((buf)+(offsets.st_ino))>>2)]=obj.inodeNumber
      var time = Math.floor(obj.timestamp / 1000);
      if (offsets.st_atime === undefined) {
        offsets.st_atime = offsets.st_atim.tv_sec;
        offsets.st_mtime = offsets.st_mtim.tv_sec;
        offsets.st_ctime = offsets.st_ctim.tv_sec;
        var nanosec = (obj.timestamp % 1000) * 1000;
        HEAP32[(((buf)+(offsets.st_atim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_mtim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_ctim.tv_nsec))>>2)]=nanosec
      }
      HEAP32[(((buf)+(offsets.st_atime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_mtime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_ctime))>>2)]=time
      var mode = 0;
      var size = 0;
      var blocks = 0;
      var dev = 0;
      var rdev = 0;
      if (obj.isDevice) {
        //  Device numbers reuse inode numbers.
        dev = rdev = obj.inodeNumber;
        size = blocks = 0;
        mode = 0x2000;  // S_IFCHR.
      } else {
        dev = 1;
        rdev = 0;
        // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
        //       but this is not required by the standard.
        if (obj.isFolder) {
          size = 4096;
          blocks = 1;
          mode = 0x4000;  // S_IFDIR.
        } else {
          var data = obj.contents || obj.link;
          size = data.length;
          blocks = Math.ceil(data.length / 4096);
          mode = obj.link === undefined ? 0x8000 : 0xA000;  // S_IFREG, S_IFLNK.
        }
      }
      HEAP32[(((buf)+(offsets.st_dev))>>2)]=dev;
      HEAP32[(((buf)+(offsets.st_rdev))>>2)]=rdev;
      HEAP32[(((buf)+(offsets.st_size))>>2)]=size
      HEAP32[(((buf)+(offsets.st_blocks))>>2)]=blocks
      if (obj.read) mode |= 0x16D;  // S_IRUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH.
      if (obj.write) mode |= 0x92;  // S_IWUSR | S_IWGRP | S_IWOTH.
      HEAP32[(((buf)+(offsets.st_mode))>>2)]=mode
      return 0;
    }function _fstat(fildes, buf) {
      // int fstat(int fildes, struct stat *buf);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/fstat.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else {
        var pathArray = intArrayFromString(FS.streams[fildes].path);
        return _stat(allocate(pathArray, 'i8', ALLOC_STACK), buf);
      }
    }
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
    }
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
  function _fopen(filename, mode) {
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
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/4294967296), 4294967295)>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
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
    }
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
    }function _fscanf(stream, format, varargs) {
      // int fscanf(FILE *restrict stream, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      if (FS.streams[stream]) {
        var i = _ftell(stream), SEEK_SET = 0;
        var get = function () { i++; return _fgetc(stream); };
        var unget = function () { _fseek(stream, --i, SEEK_SET); };
        return __scanString(format, get, unget, varargs);
      } else {
        return -1;
      }
    }
  function _fread(ptr, size, nitems, stream) {
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
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
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
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
GL.init()
GL.immediate.setupFuncs(); Browser.moduleContextCreatedCallbacks.push(function() { GL.immediate.init() });
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
GLEmulation.init();
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,_glUseProgram,0,_glClearStencil,0,_glUniformMatrix3fv,0,_glUniformMatrix2fv,0,_glStencilFunc
,0,_glTexParameteriv,0,_glUniformMatrix4fv,0,_glGetShaderSource,0,_glLineWidth,0,_glGenRenderbuffers
,0,_glUniform2fv,0,_glDeleteProgram,0,_glBlendEquation,0,_glVertexAttrib4f,0,_glBindBuffer
,0,_glUniform1fv,0,_glCreateProgram,0,_glShaderBinary,0,_glBlendFunc,0,_glGetAttribLocation
,0,_glDisableVertexAttribArray,0,_glCreateShader,0,_glIsBuffer,0,_glPolygonOffset,0,_glIsShader
,0,_glStencilOp,0,_glGetShaderPrecisionFormat,0,_glUniform4i,0,_glUniform4f,0,_glGetInfoLog
,0,_glRenderbufferStorage,0,_glGenBuffers,0,_glShaderSource,0,_glFramebufferRenderbuffer,0,_glVertexAttrib3f
,0,_glGetBooleanv,0,_glGetVertexAttribfv,0,_display,0,_glValidateProgram,0,_glGenerateMipmap
,0,_glVertexAttribPointer,0,_glHint,0,_glGetProgramInfoLog,0,_glGetVertexAttribiv,0,_glVertexAttrib2fv
,0,_glBindRenderbuffer,0,_glTexParameterfv,0,_glDrawElements,0,_glDepthMask,0,_glBufferSubData
,0,_glViewport,0,_glDeleteVertexArrays,0,_glDeleteTextures,0,_glDepthFunc,0,_glStencilOpSeparate
,0,_glUniform3i,0,_glUniform3f,0,_glIsTexture,0,_glTexImage2D,0,_glBlendFuncSeparate
,0,_glGetFramebufferAttachmentParameteriv,0,_glGenTextures,0,_glGetIntegerv,0,_glUniform3iv,0,_glStencilMaskSeparate
,0,_glUniform1iv,0,_glAttachShader,0,_glGetShaderInfoLog,0,_glBindFramebuffer,0,_glDetachShader
,0,_glUniform2i,0,_glGenFramebuffers,0,_glUniform2f,0,_clLogMessagesToStdoutAPPLE,0,_glIsProgram
,0,_glDeleteObject,0,_glCullFace,0,_glDeleteFramebuffers,0,_glGetTexParameterfv,0,_glCheckFramebufferStatus
,0,_glBindProgram,0,_glIsRenderbuffer,0,_glGetBufferParameteriv,0,_glGetUniformfv,0,_glCompressedTexImage2D
,0,_glUniform3fv,0,_glClearDepthf,0,_glBindTexture,0,_glClearColor,0,_glIsEnabled
,0,_glFinish,0,_glUniform1f,0,_glGetFloatv,0,_glUniform1i,0,_glGetObjectParameteriv
,0,_glGetTexParameteriv,0,_glVertexAttrib3fv,0,_glDrawArrays,0,_glReadPixels,0,_glGetError
,0,_glGetRenderbufferParameteriv,0,_glGetActiveAttrib,0,_glUniform2iv,0,_glGetActiveUniform,0,_glGetString
,0,_glActiveTexture,0,_keyboard,0,_glVertexAttrib1fv,0,_glFrontFace,0,_glCompileShader
,0,_glEnableVertexAttribArray,0,_glGetUniformiv,0,_glBindVertexArray,0,_glVertexAttrib4fv,0,_glSampleCoverage
,0,_glDeleteBuffers,0,_glBufferData,0,_reshape,0,_glFlush,0,_motion
,0,_glDeleteShader,0,_glGetProgramiv,0,_glCompressedTexSubImage2D,0,_glScissor,0,_glGenVertexArrays
,0,_glGetAttachedShaders,0,_glDeleteRenderbuffers,0,_mouse,0,_glDepthRangef,0,_glGetVertexAttribPointerv
,0,_glLinkProgram,0,_glReleaseShaderCompiler,0,_glGetShaderiv,0,_glGetUniformLocation,0,_glClear
,0,_glDrawRangeElements,0,_glUniform4fv,0,_glVertexAttrib2f,0,_glBindAttribLocation,0,_glPixelStorei
,0,_glCopyTexImage2D,0,_glIsFramebuffer,0,_glEnable,0,_glFramebufferTexture2D,0,_glUniform4iv
,0,_glVertexAttrib1f,0,_glColorMask,0,_glClientActiveTexture,0,_glCopyTexSubImage2D,0,_glDisable
,0,_glTexParameteri,0,_glBlendColor,0,_glStencilMask,0,_glBlendEquationSeparate,0,_glTexParameterf,0,_glStencilFuncSeparate,0,_glTexSubImage2D];
// EMSCRIPTEN_START_FUNCS
function _divide_up($a, $b) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$a;
   $2=$b;
   var $3=$1;
   var $4=$2;
   var $5=((((($3)|(0)))%((($4)|(0))))&-1);
   var $6=(($5)|(0))!=0;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $8=$1;
   var $9=$2;
   var $10=((((($8)|(0)))/((($9)|(0))))&-1);
   var $11=((($10)+(1))|0);
   var $17 = $11;label = 4; break;
  case 3: 
   var $13=$1;
   var $14=$2;
   var $15=((((($13)|(0)))/((($14)|(0))))&-1);
   var $17 = $15;label = 4; break;
  case 4: 
   var $17;
   return $17;
  default: assert(0, "bad label: " + label);
 }
}
function _normalize($v) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $d;
   $1=$v;
   var $2=$1;
   var $3=(($2)|0);
   var $4=HEAPF32[(($3)>>2)];
   var $5=$1;
   var $6=(($5)|0);
   var $7=HEAPF32[(($6)>>2)];
   var $8=($4)*($7);
   var $9=$1;
   var $10=(($9+4)|0);
   var $11=HEAPF32[(($10)>>2)];
   var $12=$1;
   var $13=(($12+4)|0);
   var $14=HEAPF32[(($13)>>2)];
   var $15=($11)*($14);
   var $16=($8)+($15);
   var $17=$1;
   var $18=(($17+8)|0);
   var $19=HEAPF32[(($18)>>2)];
   var $20=$1;
   var $21=(($20+8)|0);
   var $22=HEAPF32[(($21)>>2)];
   var $23=($19)*($22);
   var $24=($16)+($23);
   var $25=Math.sqrt($24);
   $d=$25;
   var $26=$d;
   var $27=$26 != 0;
   if ($27) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $29=$d;
   var $30=$1;
   var $31=(($30)|0);
   var $32=HEAPF32[(($31)>>2)];
   var $33=($32)/($29);
   HEAPF32[(($31)>>2)]=$33;
   var $34=$d;
   var $35=$1;
   var $36=(($35+4)|0);
   var $37=HEAPF32[(($36)>>2)];
   var $38=($37)/($34);
   HEAPF32[(($36)>>2)]=$38;
   var $39=$d;
   var $40=$1;
   var $41=(($40+8)|0);
   var $42=HEAPF32[(($41)>>2)];
   var $43=($42)/($39);
   HEAPF32[(($41)>>2)]=$43;
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _fill_sphere($resolution) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $subdiv;
   var $stacks;
   var $slices;
   var $pi;
   var $i;
   var $j;
   var $index;
   var $t;
   var $t2;
   var $phi;
   var $phi2;
   var $s;
   var $theta;
   var $v=__stackBase__;
   $1=$resolution;
   var $2=$1;
   var $3=(($2)|(0));
   var $4=Math.pow(2, $3);
   var $5=(($4)&-1);
   $subdiv=$5;
   var $6=$subdiv;
   var $7=((((($6)|(0)))/(2))&-1);
   $stacks=$7;
   var $8=$subdiv;
   $slices=$8;
   $pi=3.1415927410125732;
   var $9=$stacks;
   var $10=((($9)-(1))|0);
   var $11=$slices;
   var $12=(Math.imul($10,$11)|0);
   var $13=($12<<1);
   HEAP32[((4640)>>2)]=$13;
   var $14=HEAP32[((4640)>>2)];
   var $15=HEAP32[((3704)>>2)];
   var $16=(Math.imul($14,$15)|0);
   var $17=($16<<2);
   HEAP32[((4648)>>2)]=$17;
   var $18=HEAP32[((4648)>>2)];
   var $19=_malloc($18);
   var $20=$19;
   HEAP32[((4664)>>2)]=$20;
   var $21=HEAP32[((4648)>>2)];
   var $22=_malloc($21);
   var $23=$22;
   HEAP32[((4792)>>2)]=$23;
   var $24=HEAP32[((4664)>>2)];
   var $25=$24;
   var $26=HEAP32[((4648)>>2)];
   _memset($25, 0, $26);
   var $27=HEAP32[((4792)>>2)];
   var $28=$27;
   var $29=HEAP32[((4648)>>2)];
   _memset($28, 0, $29);
   var $30=$stacks;
   var $31=((($30)-(1))|0);
   HEAP32[((5312)>>2)]=$31;
   var $32=$slices;
   var $33=($32<<1);
   HEAP32[((5304)>>2)]=$33;
   var $34=HEAP32[((5312)>>2)];
   HEAP32[((5072)>>2)]=$34;
   var $35=HEAP32[((5304)>>2)];
   HEAP32[((5064)>>2)]=$35;
   var $36=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $37=HEAP32[((4648)>>2)];
   var $38=HEAP32[((4640)>>2)];
   var $39=HEAP32[((5312)>>2)];
   var $40=HEAP32[((5304)>>2)];
   var $41=HEAP32[((5072)>>2)];
   var $42=HEAP32[((5064)>>2)];
   var $43=_printf(((3560)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$37,HEAP32[(((tempInt)+(8))>>2)]=$38,HEAP32[(((tempInt)+(16))>>2)]=$39,HEAP32[(((tempInt)+(24))>>2)]=$40,HEAP32[(((tempInt)+(32))>>2)]=$41,HEAP32[(((tempInt)+(40))>>2)]=$42,tempInt));
   $i=0;
   $j=0;
   $index=0;
   $i=0;
   label = 2; break;
  case 2: 
   var $45=$i;
   var $46=$stacks;
   var $47=((($46)-(1))|0);
   var $48=(($45)|(0)) < (($47)|(0));
   if ($48) { label = 3; break; } else { label = 9; break; }
  case 3: 
   var $50=$i;
   var $51=(($50)|(0));
   var $52=$stacks;
   var $53=(($52)|(0));
   var $54=($53)-(1);
   var $55=($51)/($54);
   $t=$55;
   var $56=$i;
   var $57=((($56)+(1))|0);
   var $58=(($57)|(0));
   var $59=$stacks;
   var $60=(($59)|(0));
   var $61=($60)-(1);
   var $62=($58)/($61);
   $t2=$62;
   var $63=$pi;
   var $64=$t;
   var $65=($63)*($64);
   var $66=$pi;
   var $67=($66)/(2);
   var $68=($65)-($67);
   $phi=$68;
   var $69=$pi;
   var $70=$t2;
   var $71=($69)*($70);
   var $72=$pi;
   var $73=($72)/(2);
   var $74=($71)-($73);
   $phi2=$74;
   $j=0;
   label = 4; break;
  case 4: 
   var $76=$j;
   var $77=$slices;
   var $78=(($76)|(0)) < (($77)|(0));
   if ($78) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $80=$j;
   var $81=(($80)|(0));
   var $82=$slices;
   var $83=(($82)|(0));
   var $84=($83)-(1);
   var $85=($81)/($84);
   $s=$85;
   var $86=$pi;
   var $87=($86)*(2);
   var $88=$s;
   var $89=($87)*($88);
   $theta=$89;
   var $90=$v;
   assert(16 % 1 === 0);HEAP32[(($90)>>2)]=HEAP32[((192)>>2)];HEAP32[((($90)+(4))>>2)]=HEAP32[((196)>>2)];HEAP32[((($90)+(8))>>2)]=HEAP32[((200)>>2)];HEAP32[((($90)+(12))>>2)]=HEAP32[((204)>>2)];
   var $91=$phi;
   var $92=$91;
   var $93=Math.cos($92);
   var $94=$theta;
   var $95=$94;
   var $96=Math.cos($95);
   var $97=($93)*($96);
   var $98=$97;
   var $99=(($v)|0);
   HEAPF32[(($99)>>2)]=$98;
   var $100=$phi;
   var $101=$100;
   var $102=Math.sin($101);
   var $103=$102;
   var $104=(($v+4)|0);
   HEAPF32[(($104)>>2)]=$103;
   var $105=$phi;
   var $106=$105;
   var $107=Math.cos($106);
   var $108=$theta;
   var $109=$108;
   var $110=Math.sin($109);
   var $111=($107)*($110);
   var $112=$111;
   var $113=(($v+8)|0);
   HEAPF32[(($113)>>2)]=$112;
   var $114=(($v)|0);
   _normalize($114);
   var $115=(($v)|0);
   var $116=HEAPF32[(($115)>>2)];
   var $117=$index;
   var $118=(($117)|0);
   var $119=HEAP32[((4664)>>2)];
   var $120=(($119+($118<<2))|0);
   HEAPF32[(($120)>>2)]=$116;
   var $121=$index;
   var $122=(($121)|0);
   var $123=HEAP32[((4792)>>2)];
   var $124=(($123+($122<<2))|0);
   HEAPF32[(($124)>>2)]=$116;
   var $125=(($v+4)|0);
   var $126=HEAPF32[(($125)>>2)];
   var $127=$index;
   var $128=((($127)+(1))|0);
   var $129=HEAP32[((4664)>>2)];
   var $130=(($129+($128<<2))|0);
   HEAPF32[(($130)>>2)]=$126;
   var $131=$index;
   var $132=((($131)+(1))|0);
   var $133=HEAP32[((4792)>>2)];
   var $134=(($133+($132<<2))|0);
   HEAPF32[(($134)>>2)]=$126;
   var $135=(($v+8)|0);
   var $136=HEAPF32[(($135)>>2)];
   var $137=$index;
   var $138=((($137)+(2))|0);
   var $139=HEAP32[((4664)>>2)];
   var $140=(($139+($138<<2))|0);
   HEAPF32[(($140)>>2)]=$136;
   var $141=$index;
   var $142=((($141)+(2))|0);
   var $143=HEAP32[((4792)>>2)];
   var $144=(($143+($142<<2))|0);
   HEAPF32[(($144)>>2)]=$136;
   var $145=$index;
   var $146=((($145)+(3))|0);
   var $147=HEAP32[((4664)>>2)];
   var $148=(($147+($146<<2))|0);
   HEAPF32[(($148)>>2)]=1;
   var $149=$index;
   var $150=((($149)+(3))|0);
   var $151=HEAP32[((4792)>>2)];
   var $152=(($151+($150<<2))|0);
   HEAPF32[(($152)>>2)]=1;
   var $153=HEAP32[((3704)>>2)];
   var $154=$index;
   var $155=((($154)+($153))|0);
   $index=$155;
   var $156=$phi2;
   var $157=$156;
   var $158=Math.cos($157);
   var $159=$theta;
   var $160=$159;
   var $161=Math.cos($160);
   var $162=($158)*($161);
   var $163=$162;
   var $164=(($v)|0);
   HEAPF32[(($164)>>2)]=$163;
   var $165=$phi2;
   var $166=$165;
   var $167=Math.sin($166);
   var $168=$167;
   var $169=(($v+4)|0);
   HEAPF32[(($169)>>2)]=$168;
   var $170=$phi2;
   var $171=$170;
   var $172=Math.cos($171);
   var $173=$theta;
   var $174=$173;
   var $175=Math.sin($174);
   var $176=($172)*($175);
   var $177=$176;
   var $178=(($v+8)|0);
   HEAPF32[(($178)>>2)]=$177;
   var $179=(($v)|0);
   _normalize($179);
   var $180=(($v)|0);
   var $181=HEAPF32[(($180)>>2)];
   var $182=$index;
   var $183=(($182)|0);
   var $184=HEAP32[((4664)>>2)];
   var $185=(($184+($183<<2))|0);
   HEAPF32[(($185)>>2)]=$181;
   var $186=$index;
   var $187=(($186)|0);
   var $188=HEAP32[((4792)>>2)];
   var $189=(($188+($187<<2))|0);
   HEAPF32[(($189)>>2)]=$181;
   var $190=(($v+4)|0);
   var $191=HEAPF32[(($190)>>2)];
   var $192=$index;
   var $193=((($192)+(1))|0);
   var $194=HEAP32[((4664)>>2)];
   var $195=(($194+($193<<2))|0);
   HEAPF32[(($195)>>2)]=$191;
   var $196=$index;
   var $197=((($196)+(1))|0);
   var $198=HEAP32[((4792)>>2)];
   var $199=(($198+($197<<2))|0);
   HEAPF32[(($199)>>2)]=$191;
   var $200=(($v+8)|0);
   var $201=HEAPF32[(($200)>>2)];
   var $202=$index;
   var $203=((($202)+(2))|0);
   var $204=HEAP32[((4664)>>2)];
   var $205=(($204+($203<<2))|0);
   HEAPF32[(($205)>>2)]=$201;
   var $206=$index;
   var $207=((($206)+(2))|0);
   var $208=HEAP32[((4792)>>2)];
   var $209=(($208+($207<<2))|0);
   HEAPF32[(($209)>>2)]=$201;
   var $210=$index;
   var $211=((($210)+(3))|0);
   var $212=HEAP32[((4664)>>2)];
   var $213=(($212+($211<<2))|0);
   HEAPF32[(($213)>>2)]=1;
   var $214=$index;
   var $215=((($214)+(3))|0);
   var $216=HEAP32[((4792)>>2)];
   var $217=(($216+($215<<2))|0);
   HEAPF32[(($217)>>2)]=1;
   var $218=HEAP32[((3704)>>2)];
   var $219=$index;
   var $220=((($219)+($218))|0);
   $index=$220;
   label = 6; break;
  case 6: 
   var $222=$j;
   var $223=((($222)+(1))|0);
   $j=$223;
   label = 4; break;
  case 7: 
   label = 8; break;
  case 8: 
   var $226=$i;
   var $227=((($226)+(1))|0);
   $i=$227;
   label = 2; break;
  case 9: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _create_quad() {
 var label = 0;
 var $1=_glGenLists(1);
 HEAP32[((4752)>>2)]=$1;
 var $2=HEAP32[((4752)>>2)];
 _glNewList($2, 4864);
 _glPushMatrix();
 _glBegin(7);
 _glColor3f(0.8999999761581421, 0.8999999761581421, 0.8999999761581421);
 _glTranslated(0, 0, -50);
 _glVertex3f(-100, -4, -100);
 _glVertex3f(-100, -4, 100);
 _glVertex3f(100, -4, 100);
 _glVertex3f(100, -4, -100);
 _glEnd();
 _glPopMatrix();
 _glEndList();
 return;
}
function _create_skybox() {
 var label = 0;
 var $1=_glGenLists(1);
 HEAP32[((4728)>>2)]=$1;
 var $2=HEAP32[((4728)>>2)];
 _glNewList($2, 4864);
 _glPushMatrix();
 _glTranslated(0, 0, 0);
 _glutSolidSphere(10, 200, 200);
 _glPopMatrix();
 _glEndList();
 return;
}
function _check_opengl() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $extensions;
   var $2=_glGetString(7939);
   $extensions=$2;
   var $3=$extensions;
   var $4=_gluCheckExtension(((2816)|0), $3);
   var $5=(($4)&(255));
   var $6=0==(($5)|(0));
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $1=0;
   label = 10; break;
  case 3: 
   var $9=$extensions;
   var $10=_gluCheckExtension(((2416)|0), $9);
   var $11=(($10)&(255));
   var $12=0==(($11)|(0));
   if ($12) { label = 4; break; } else { label = 5; break; }
  case 4: 
   $1=0;
   label = 10; break;
  case 5: 
   var $15=$extensions;
   var $16=_gluCheckExtension(((2216)|0), $15);
   var $17=(($16)&(255));
   var $18=0==(($17)|(0));
   if ($18) { label = 6; break; } else { label = 7; break; }
  case 6: 
   $1=0;
   label = 10; break;
  case 7: 
   var $21=$extensions;
   var $22=_gluCheckExtension(((1984)|0), $21);
   var $23=(($22)&(255));
   var $24=0==(($23)|(0));
   if ($24) { label = 8; break; } else { label = 9; break; }
  case 8: 
   $1=0;
   label = 10; break;
  case 9: 
   $1=1;
   label = 10; break;
  case 10: 
   var $28=$1;
   return $28;
  default: assert(0, "bad label: " + label);
 }
}
function _create_sphere() {
 var label = 0;
 var __stackBase__  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $err;
   var $1=HEAP32[((3728)>>2)];
   _fill_sphere($1);
   var $2=_glGenBuffers(1, 4656);
   var $3=HEAP32[((4656)>>2)];
   var $4=_glBindBuffer(34962, $3);
   var $5=HEAP32[((4648)>>2)];
   var $6=HEAP32[((4104)>>2)];
   var $7=_glBufferData(34962, $5, 0, $6);
   var $8=HEAP32[((3704)>>2)];
   _glVertexPointer($8, 5126, 0, 0);
   var $9=_glBindBuffer(34962, 0);
   var $10=_glGenBuffers(1, 4784);
   var $11=HEAP32[((4784)>>2)];
   var $12=_glBindBuffer(34962, $11);
   var $13=HEAP32[((4648)>>2)];
   var $14=HEAP32[((4104)>>2)];
   var $15=_glBufferData(34962, $13, 0, $14);
   var $16=HEAP32[((3704)>>2)];
   var $17=($16<<2);
   _glNormalPointer(5126, $17, 0);
   var $18=_glBindBuffer(34962, 0);
   var $19=_glGetError();
   $err=$19;
   var $20=$err;
   var $21=(($20)|(0))!=0;
   if ($21) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $23=$err;
   var $24=_printf(((1768)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$23,tempInt));
   label = 3; break;
  case 3: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _create_light_probe_texture($filename) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 var $data=__stackBase__;
 $1=$filename;
 var $2=$1;
 var $3=_printf(((1504)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$2,tempInt));
 var $4=$1;
 var $5=_load_pfm($4, $data, 4944, 4960, 4968);
 var $6=HEAP32[((4944)>>2)];
 var $7=HEAP32[((4960)>>2)];
 var $8=_printf(((1112)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$6,HEAP32[(((tempInt)+(8))>>2)]=$7,tempInt));
 var $9=HEAP32[((3840)>>2)];
 _glActiveTextureARB($9);
 _glGenTextures(1, 4952);
 var $10=HEAP32[((4952)>>2)];
 _glBindTexture(3553, $10);
 _glTexParameteri(3553, 10242, 10496);
 _glTexParameteri(3553, 10243, 10496);
 _glTexParameteri(3553, 10240, 9729);
 _glTexParameteri(3553, 10241, 9729);
 var $11=HEAP32[((4944)>>2)];
 var $12=HEAP32[((4960)>>2)];
 var $13=HEAP32[(($data)>>2)];
 var $14=$13;
 _glTexImage2D(3553, 0, 34837, $11, $12, 0, 6407, 5126, $14);
 var $15=HEAP32[((3976)>>2)];
 _glActiveTextureARB($15);
 var $16=HEAP32[(($data)>>2)];
 var $17=$16;
 _free($17);
 STACKTOP = __stackBase__;
 return;
}
function _load_pfm($file_name, $data, $width, $height, $channels) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $5;
   var $6;
   var $fd;
   var $a;
   var $b;
   var $x=__stackBase__;
   var $y=(__stackBase__)+(8);
   var $tmp=(__stackBase__)+(16);
   var $w;
   var $h;
   var $c;
   var $bytes;
   var $scale=(__stackBase__)+(24);
   var $buffer;
   var $scanline;
   var $f;
   var $temp;
   $2=$file_name;
   $3=$data;
   $4=$width;
   $5=$height;
   $6=$channels;
   $fd=0;
   var $7=$2;
   var $8=_fopen($7, ((3352)|0));
   $fd=$8;
   var $9=$fd;
   var $10=(($9)|(0))!=0;
   if ($10) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $12=$2;
   var $13=_printf(((3432)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$12,tempInt));
   $1=-1;
   label = 29; break;
  case 3: 
   var $15=$fd;
   var $16=_fgetc($15);
   $a=$16;
   var $17=$fd;
   var $18=_fgetc($17);
   $b=$18;
   var $19=$fd;
   var $20=_fgetc($19);
   var $21=(($20) & 255);
   HEAP8[($tmp)]=$21;
   var $22=$a;
   var $23=(($22)|(0))!=80;
   if ($23) { label = 6; break; } else { label = 4; break; }
  case 4: 
   var $25=$b;
   var $26=(($25)|(0))!=70;
   if ($26) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $28=$b;
   var $29=(($28)|(0))!=102;
   if ($29) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $31=$fd;
   var $32=_fclose($31);
   var $33=$2;
   var $34=_printf(((3288)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$33,tempInt));
   $1=0;
   label = 29; break;
  case 7: 
   var $36=$fd;
   var $37=_fscanf($36, ((3280)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$x,HEAP32[(((tempInt)+(8))>>2)]=$y,HEAP32[(((tempInt)+(16))>>2)]=$tmp,tempInt));
   var $38=HEAP32[(($x)>>2)];
   var $39=(($38)|(0)) <= 0;
   if ($39) { label = 9; break; } else { label = 8; break; }
  case 8: 
   var $41=HEAP32[(($y)>>2)];
   var $42=(($41)|(0)) <= 0;
   if ($42) { label = 9; break; } else { label = 10; break; }
  case 9: 
   var $44=$fd;
   var $45=_fclose($44);
   var $46=$2;
   var $47=_printf(((3216)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$46,tempInt));
   $1=0;
   label = 29; break;
  case 10: 
   var $49=HEAP32[(($x)>>2)];
   $w=$49;
   var $50=HEAP32[(($y)>>2)];
   $h=$50;
   var $51=$b;
   var $52=(($51)|(0))==70;
   var $53=$52 ? 3 : 1;
   $c=$53;
   var $54=$fd;
   var $55=_fscanf($54, ((3208)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$scale,HEAP32[(((tempInt)+(8))>>2)]=$tmp,tempInt));
   var $56=$w;
   var $57=$h;
   var $58=(Math.imul($56,$57)|0);
   var $59=$c;
   var $60=(Math.imul($58,$59)|0);
   var $61=($60<<2);
   $bytes=$61;
   var $62=$w;
   var $63=$h;
   var $64=(Math.imul($62,$63)|0);
   var $65=$c;
   var $66=(Math.imul($64,$65)|0);
   var $67=_calloc($66, 4);
   var $68=$67;
   $buffer=$68;
   var $69=$w;
   var $70=$c;
   var $71=(Math.imul($69,$70)|0);
   var $72=_calloc($71, 4);
   var $73=$72;
   $scanline=$73;
   var $74=$buffer;
   var $75=(($74)|(0))!=0;
   if ($75) { label = 11; break; } else { label = 12; break; }
  case 11: 
   var $77=$scanline;
   var $78=(($77)|(0))!=0;
   if ($78) { label = 13; break; } else { label = 12; break; }
  case 12: 
   var $80=$fd;
   var $81=_fclose($80);
   var $82=$2;
   var $83=_printf(((3136)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$82,tempInt));
   $1=0;
   label = 29; break;
  case 13: 
   var $85=$buffer;
   $f=$85;
   HEAP32[(($y)>>2)]=0;
   label = 14; break;
  case 14: 
   var $87=HEAP32[(($y)>>2)];
   var $88=$h;
   var $89=(($87)>>>(0)) < (($88)>>>(0));
   if ($89) { label = 15; break; } else { label = 28; break; }
  case 15: 
   var $91=$scanline;
   var $92=$91;
   var $93=$w;
   var $94=$c;
   var $95=(Math.imul($93,$94)|0);
   var $96=$fd;
   var $97=_fread($92, 4, $95, $96);
   var $98=$w;
   var $99=$c;
   var $100=(Math.imul($98,$99)|0);
   var $101=(($97)|(0))!=(($100)|(0));
   if ($101) { label = 16; break; } else { label = 17; break; }
  case 16: 
   var $103=$fd;
   var $104=_fclose($103);
   var $105=$scanline;
   var $106=$105;
   _free($106);
   var $107=$buffer;
   var $108=$107;
   _free($108);
   $1=0;
   label = 29; break;
  case 17: 
   var $110=$scanline;
   $temp=$110;
   HEAP32[(($x)>>2)]=0;
   label = 18; break;
  case 18: 
   var $112=HEAP32[(($x)>>2)];
   var $113=$w;
   var $114=(($112)>>>(0)) < (($113)>>>(0));
   if ($114) { label = 19; break; } else { label = 26; break; }
  case 19: 
   var $116=$c;
   var $117=(($116)|(0))==3;
   if ($117) { label = 20; break; } else { label = 21; break; }
  case 20: 
   var $119=$temp;
   var $120=(($119+4)|0);
   $temp=$120;
   var $121=HEAPF32[(($119)>>2)];
   var $122=$f;
   var $123=(($122)|0);
   HEAPF32[(($123)>>2)]=$121;
   var $124=$temp;
   var $125=(($124+4)|0);
   $temp=$125;
   var $126=HEAPF32[(($124)>>2)];
   var $127=$f;
   var $128=(($127+4)|0);
   HEAPF32[(($128)>>2)]=$126;
   var $129=$temp;
   var $130=(($129+4)|0);
   $temp=$130;
   var $131=HEAPF32[(($129)>>2)];
   var $132=$f;
   var $133=(($132+8)|0);
   HEAPF32[(($133)>>2)]=$131;
   label = 22; break;
  case 21: 
   var $135=$temp;
   var $136=(($135+4)|0);
   $temp=$136;
   var $137=HEAPF32[(($135)>>2)];
   var $138=$f;
   var $139=(($138)|0);
   HEAPF32[(($139)>>2)]=$137;
   var $140=$f;
   var $141=(($140)|0);
   var $142=HEAPF32[(($141)>>2)];
   var $143=$f;
   var $144=(($143+4)|0);
   HEAPF32[(($144)>>2)]=$142;
   var $145=$f;
   var $146=(($145)|0);
   var $147=HEAPF32[(($146)>>2)];
   var $148=$f;
   var $149=(($148+8)|0);
   HEAPF32[(($149)>>2)]=$147;
   label = 22; break;
  case 22: 
   var $151=HEAPF32[(($scale)>>2)];
   var $152=$151;
   var $153=$152 > 0;
   if ($153) { label = 23; break; } else { label = 24; break; }
  case 23: 
   var $155=$f;
   var $156=(($155)|0);
   var $157=HEAPF32[(($156)>>2)];
   var $158=_reverse_bytes_float($157);
   var $159=$f;
   var $160=(($159)|0);
   HEAPF32[(($160)>>2)]=$158;
   var $161=$f;
   var $162=(($161+4)|0);
   var $163=HEAPF32[(($162)>>2)];
   var $164=_reverse_bytes_float($163);
   var $165=$f;
   var $166=(($165+4)|0);
   HEAPF32[(($166)>>2)]=$164;
   var $167=$f;
   var $168=(($167+8)|0);
   var $169=HEAPF32[(($168)>>2)];
   var $170=_reverse_bytes_float($169);
   var $171=$f;
   var $172=(($171+8)|0);
   HEAPF32[(($172)>>2)]=$170;
   label = 24; break;
  case 24: 
   var $174=$f;
   var $175=(($174+12)|0);
   $f=$175;
   label = 25; break;
  case 25: 
   var $177=HEAP32[(($x)>>2)];
   var $178=((($177)+(1))|0);
   HEAP32[(($x)>>2)]=$178;
   label = 18; break;
  case 26: 
   label = 27; break;
  case 27: 
   var $181=HEAP32[(($y)>>2)];
   var $182=((($181)+(1))|0);
   HEAP32[(($y)>>2)]=$182;
   label = 14; break;
  case 28: 
   var $184=$scanline;
   var $185=$184;
   _free($185);
   var $186=$fd;
   var $187=_fclose($186);
   var $188=$buffer;
   var $189=$3;
   HEAP32[(($189)>>2)]=$188;
   var $190=$w;
   var $191=$4;
   HEAP32[(($191)>>2)]=$190;
   var $192=$h;
   var $193=$5;
   HEAP32[(($193)>>2)]=$192;
   var $194=$6;
   HEAP32[(($194)>>2)]=3;
   $1=1;
   label = 29; break;
  case 29: 
   var $196=$1;
   STACKTOP = __stackBase__;
   return $196;
  default: assert(0, "bad label: " + label);
 }
}
function _create_jitter_texture($size, $du, $dv) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $i;
   var $j;
   var $k;
   var $data;
   var $tw;
   var $th;
   var $td;
   var $x;
   var $y;
   var $d=__stackBase__;
   var $v=(__stackBase__)+(16);
   var $index;
   var $err;
   $1=$size;
   $2=$du;
   $3=$dv;
   $data=0;
   var $4=_printf(((704)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $5=$1;
   HEAP32[((3896)>>2)]=$5;
   var $6=HEAP32[((3912)>>2)];
   _glActiveTextureARB($6);
   _glGenTextures(1, 5040);
   var $7=HEAP32[((5040)>>2)];
   _glBindTexture(32879, $7);
   _glTexParameteri(32879, 10241, 9728);
   _glTexParameteri(32879, 10240, 9728);
   _glTexParameteri(32879, 10242, 10497);
   _glTexParameteri(32879, 10243, 10497);
   _glTexParameteri(32879, 32882, 10497);
   var $8=$1;
   $tw=$8;
   var $9=$1;
   $th=$9;
   var $10=$2;
   var $11=$3;
   var $12=(Math.imul($10,$11)|0);
   var $13=(($12)>>>(0));
   var $14=($13)*(0.5);
   var $15=(($14)&-1);
   $td=$15;
   var $16=$tw;
   var $17=($16<<2);
   var $18=$th;
   var $19=(Math.imul($17,$18)|0);
   var $20=$td;
   var $21=(Math.imul($19,$20)|0);
   var $22=$21;
   HEAP32[((5048)>>2)]=$22;
   var $23=HEAP32[((5048)>>2)];
   var $24=_malloc($23);
   $data=$24;
   $i=0;
   label = 2; break;
  case 2: 
   var $26=$i;
   var $27=$tw;
   var $28=(($26)|(0)) < (($27)|(0));
   if ($28) { label = 3; break; } else { label = 13; break; }
  case 3: 
   $j=0;
   label = 4; break;
  case 4: 
   var $31=$j;
   var $32=$th;
   var $33=(($31)|(0)) < (($32)|(0));
   if ($33) { label = 5; break; } else { label = 11; break; }
  case 5: 
   $k=0;
   label = 6; break;
  case 6: 
   var $36=$k;
   var $37=$td;
   var $38=(($36)|(0)) < (($37)|(0));
   if ($38) { label = 7; break; } else { label = 9; break; }
  case 7: 
   var $40=$k;
   var $41=$2;
   var $42=Math.floor(((($41)>>>(0)))/(2));
   var $43=Math.floor(((($40)>>>(0)))%((($42)>>>(0))));
   $x=$43;
   var $44=$3;
   var $45=((($44)-(1))|0);
   var $46=$k;
   var $47=$2;
   var $48=Math.floor(((($47)>>>(0)))/(2));
   var $49=Math.floor(((($46)>>>(0)))/((($48)>>>(0))));
   var $50=((($45)-($49))|0);
   $y=$50;
   var $51=$x;
   var $52=($51<<1);
   var $53=(($52)|(0));
   var $54=($53)+(0.5);
   var $55=$2;
   var $56=(($55)>>>(0));
   var $57=($54)/($56);
   var $58=(($v)|0);
   HEAPF32[(($58)>>2)]=$57;
   var $59=$y;
   var $60=(($59)|(0));
   var $61=($60)+(0.5);
   var $62=$3;
   var $63=(($62)>>>(0));
   var $64=($61)/($63);
   var $65=(($v+4)|0);
   HEAPF32[(($65)>>2)]=$64;
   var $66=$x;
   var $67=($66<<1);
   var $68=((($67)+(1))|0);
   var $69=(($68)|(0));
   var $70=($69)+(0.5);
   var $71=$2;
   var $72=(($71)>>>(0));
   var $73=($70)/($72);
   var $74=(($v+8)|0);
   HEAPF32[(($74)>>2)]=$73;
   var $75=(($v+4)|0);
   var $76=HEAPF32[(($75)>>2)];
   var $77=(($v+12)|0);
   HEAPF32[(($77)>>2)]=$76;
   var $78=_rand();
   var $79=(($78)|(0));
   var $80=($79)*(2);
   var $81=($80)/(2147483648);
   var $82=($81)-(1);
   var $83=$2;
   var $84=(($83)>>>(0));
   var $85=(0.5)/($84);
   var $86=($82)*($85);
   var $87=(($v)|0);
   var $88=HEAPF32[(($87)>>2)];
   var $89=($88)+($86);
   HEAPF32[(($87)>>2)]=$89;
   var $90=_rand();
   var $91=(($90)|(0));
   var $92=($91)*(2);
   var $93=($92)/(2147483648);
   var $94=($93)-(1);
   var $95=$3;
   var $96=(($95)>>>(0));
   var $97=(0.5)/($96);
   var $98=($94)*($97);
   var $99=(($v+4)|0);
   var $100=HEAPF32[(($99)>>2)];
   var $101=($100)+($98);
   HEAPF32[(($99)>>2)]=$101;
   var $102=_rand();
   var $103=(($102)|(0));
   var $104=($103)*(2);
   var $105=($104)/(2147483648);
   var $106=($105)-(1);
   var $107=$2;
   var $108=(($107)>>>(0));
   var $109=(0.5)/($108);
   var $110=($106)*($109);
   var $111=(($v+8)|0);
   var $112=HEAPF32[(($111)>>2)];
   var $113=($112)+($110);
   HEAPF32[(($111)>>2)]=$113;
   var $114=_rand();
   var $115=(($114)|(0));
   var $116=($115)*(2);
   var $117=($116)/(2147483648);
   var $118=($117)-(1);
   var $119=$3;
   var $120=(($119)>>>(0));
   var $121=(0.5)/($120);
   var $122=($118)*($121);
   var $123=(($v+12)|0);
   var $124=HEAPF32[(($123)>>2)];
   var $125=($124)+($122);
   HEAPF32[(($123)>>2)]=$125;
   var $126=(($v+4)|0);
   var $127=HEAPF32[(($126)>>2)];
   var $128=Math.sqrt($127);
   var $129=(($v)|0);
   var $130=HEAPF32[(($129)>>2)];
   var $131=($130)*(6.2831854820251465);
   var $132=Math.cos($131);
   var $133=($128)*($132);
   var $134=(($d)|0);
   HEAPF32[(($134)>>2)]=$133;
   var $135=(($v+4)|0);
   var $136=HEAPF32[(($135)>>2)];
   var $137=Math.sqrt($136);
   var $138=(($v)|0);
   var $139=HEAPF32[(($138)>>2)];
   var $140=($139)*(6.2831854820251465);
   var $141=Math.sin($140);
   var $142=($137)*($141);
   var $143=(($d+4)|0);
   HEAPF32[(($143)>>2)]=$142;
   var $144=(($v+12)|0);
   var $145=HEAPF32[(($144)>>2)];
   var $146=Math.sqrt($145);
   var $147=(($v+8)|0);
   var $148=HEAPF32[(($147)>>2)];
   var $149=($148)*(6.2831854820251465);
   var $150=Math.cos($149);
   var $151=($146)*($150);
   var $152=(($d+8)|0);
   HEAPF32[(($152)>>2)]=$151;
   var $153=(($v+12)|0);
   var $154=HEAPF32[(($153)>>2)];
   var $155=Math.sqrt($154);
   var $156=(($v+8)|0);
   var $157=HEAPF32[(($156)>>2)];
   var $158=($157)*(6.2831854820251465);
   var $159=Math.sin($158);
   var $160=($155)*($159);
   var $161=(($d+12)|0);
   HEAPF32[(($161)>>2)]=$160;
   var $162=$k;
   var $163=$tw;
   var $164=(Math.imul($162,$163)|0);
   var $165=$th;
   var $166=(Math.imul($164,$165)|0);
   var $167=$j;
   var $168=$tw;
   var $169=(Math.imul($167,$168)|0);
   var $170=((($166)+($169))|0);
   var $171=$i;
   var $172=((($170)+($171))|0);
   var $173=($172<<2);
   $index=$173;
   var $174=(($d)|0);
   var $175=HEAPF32[(($174)>>2)];
   var $176=($175)+(1);
   var $177=($176)*(127);
   var $178=($177>=0 ? Math.floor($177) : Math.ceil($177));
   var $179=$index;
   var $180=(($179)|0);
   var $181=$data;
   var $182=(($181+$180)|0);
   HEAP8[($182)]=$178;
   var $183=(($d+4)|0);
   var $184=HEAPF32[(($183)>>2)];
   var $185=($184)+(1);
   var $186=($185)*(127);
   var $187=($186>=0 ? Math.floor($186) : Math.ceil($186));
   var $188=$index;
   var $189=((($188)+(1))|0);
   var $190=$data;
   var $191=(($190+$189)|0);
   HEAP8[($191)]=$187;
   var $192=(($d+8)|0);
   var $193=HEAPF32[(($192)>>2)];
   var $194=($193)+(1);
   var $195=($194)*(127);
   var $196=($195>=0 ? Math.floor($195) : Math.ceil($195));
   var $197=$index;
   var $198=((($197)+(2))|0);
   var $199=$data;
   var $200=(($199+$198)|0);
   HEAP8[($200)]=$196;
   var $201=(($d+12)|0);
   var $202=HEAPF32[(($201)>>2)];
   var $203=($202)+(1);
   var $204=($203)*(127);
   var $205=($204>=0 ? Math.floor($204) : Math.ceil($204));
   var $206=$index;
   var $207=((($206)+(3))|0);
   var $208=$data;
   var $209=(($208+$207)|0);
   HEAP8[($209)]=$205;
   label = 8; break;
  case 8: 
   var $211=$k;
   var $212=((($211)+(1))|0);
   $k=$212;
   label = 6; break;
  case 9: 
   label = 10; break;
  case 10: 
   var $215=$j;
   var $216=((($215)+(1))|0);
   $j=$216;
   label = 4; break;
  case 11: 
   label = 12; break;
  case 12: 
   var $219=$i;
   var $220=((($219)+(1))|0);
   $i=$220;
   label = 2; break;
  case 13: 
   var $222=$tw;
   var $223=$th;
   var $224=$td;
   var $225=$data;
   _glTexImage3D(32879, 0, 32854, $222, $223, $224, 0, 6408, 5121, $225);
   var $226=$data;
   _free($226);
   var $227=_glGetError();
   $err=$227;
   var $228=$err;
   var $229=(($228)|(0))!=0;
   if ($229) { label = 14; break; } else { label = 15; break; }
  case 14: 
   var $231=$err;
   var $232=_printf(((3504)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$231,tempInt));
   label = 15; break;
  case 15: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _create_shadow_fbo() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $depth=__stackBase__;
   var $format;
   var $status;
   var $err;
   var $1=_printf(((3176)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $2=HEAP32[((3768)>>2)];
   _glActiveTextureARB($2);
   _glGenTextures(1, 4736);
   var $3=HEAP32[((4736)>>2)];
   _glBindTexture(3553, $3);
   _glGetIntegerv(3414, $depth);
   var $4=HEAP32[(($depth)>>2)];
   var $5=(($4)|(0))==16;
   if ($5) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $format=33189;
   label = 4; break;
  case 3: 
   $format=33190;
   label = 4; break;
  case 4: 
   var $9=$format;
   var $10=HEAP32[((3752)>>2)];
   var $11=HEAP32[((3760)>>2)];
   _glTexImage2D(3553, 0, $9, $10, $11, 0, 6402, 5126, 0);
   _glTexParameteri(3553, 10241, 9729);
   _glTexParameteri(3553, 10240, 9729);
   _glTexParameteri(3553, 10242, 33071);
   _glTexParameteri(3553, 10243, 33071);
   _glTexParameteri(3553, 34892, 34894);
   _glTexParameteri(3553, 34893, 515);
   var $12=_glGenFramebuffersEXT(1, 4744);
   var $13=HEAP32[((4744)>>2)];
   var $14=_glBindFramebufferEXT(36160, $13);
   var $15=HEAP32[((4736)>>2)];
   var $16=_glFramebufferTexture2DEXT(36160, 36096, 3553, $15, 0);
   _glDrawBuffer(0);
   _glReadBuffer(0);
   var $17=_glCheckFramebufferStatusEXT(36160);
   $status=$17;
   var $18=$status;
   if ((($18)|(0))==36053) {
    label = 5; break;
   }
   else if ((($18)|(0))==36061) {
    label = 6; break;
   }
   else if ((($18)|(0))==36054) {
    label = 7; break;
   }
   else if ((($18)|(0))==36055) {
    label = 8; break;
   }
   else if ((($18)|(0))==36057) {
    label = 9; break;
   }
   else if ((($18)|(0))==36058) {
    label = 10; break;
   }
   else if ((($18)|(0))==36059) {
    label = 11; break;
   }
   else if ((($18)|(0))==36060) {
    label = 12; break;
   }
   else {
   label = 13; break;
   }
  case 5: 
   label = 14; break;
  case 6: 
   var $21=_printf(((3104)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 7: 
   var $23=_printf(((3064)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 8: 
   var $25=_printf(((3016)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 9: 
   var $27=_printf(((2976)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 10: 
   var $29=_printf(((2944)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 11: 
   var $31=_printf(((2904)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 12: 
   var $33=_printf(((2864)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   label = 14; break;
  case 13: 
   var $35=$status;
   var $36=_printf(((2840)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$35,tempInt));
   label = 14; break;
  case 14: 
   var $38=_glBindFramebufferEXT(36160, 0);
   var $39=_glGetError();
   $err=$39;
   var $40=$err;
   var $41=(($40)|(0))!=0;
   if ($41) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $43=$err;
   var $44=_printf(((2768)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$43,tempInt));
   label = 16; break;
  case 16: 
   STACKTOP = __stackBase__;
   return 0;
  default: assert(0, "bad label: " + label);
 }
}
function _setup_lights() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $ambient=__stackBase__;
 var $diffuse=(__stackBase__)+(16);
 var $specular=(__stackBase__)+(32);
 var $attenuation=(__stackBase__)+(48);
 var $1=$ambient;
 assert(16 % 1 === 0);HEAP32[(($1)>>2)]=HEAP32[((48)>>2)];HEAP32[((($1)+(4))>>2)]=HEAP32[((52)>>2)];HEAP32[((($1)+(8))>>2)]=HEAP32[((56)>>2)];HEAP32[((($1)+(12))>>2)]=HEAP32[((60)>>2)];
 var $2=$diffuse;
 assert(16 % 1 === 0);HEAP32[(($2)>>2)]=HEAP32[((24)>>2)];HEAP32[((($2)+(4))>>2)]=HEAP32[((28)>>2)];HEAP32[((($2)+(8))>>2)]=HEAP32[((32)>>2)];HEAP32[((($2)+(12))>>2)]=HEAP32[((36)>>2)];
 var $3=$specular;
 assert(16 % 1 === 0);HEAP32[(($3)>>2)]=HEAP32[((8)>>2)];HEAP32[((($3)+(4))>>2)]=HEAP32[((12)>>2)];HEAP32[((($3)+(8))>>2)]=HEAP32[((16)>>2)];HEAP32[((($3)+(12))>>2)]=HEAP32[((20)>>2)];
 var $4=$attenuation;
 assert(4 % 1 === 0);HEAP32[(($4)>>2)]=HEAP32[((40)>>2)];
 _glLightfv(16384, 4611, ((3848)|0));
 var $5=(($ambient)|0);
 _glLightfv(16384, 4608, $5);
 var $6=(($diffuse)|0);
 _glLightfv(16384, 4609, $6);
 var $7=(($specular)|0);
 _glLightfv(16384, 4610, $7);
 var $8=(($attenuation)|0);
 _glLightfv(16384, 4616, $8);
 _glLightModeli(33272, 33274);
 _glLightModeli(2897, 1);
 _glEnable(16384);
 STACKTOP = __stackBase__;
 return;
}
function _get_uniform_location($shader, $name) {
 var label = 0;
 var $1;
 var $2;
 var $uid;
 $1=$shader;
 $2=$name;
 var $3=$1;
 var $4=$2;
 var $5=_glGetUniformLocation($3, $4);
 $uid=$5;
 var $6=$uid;
 return $6;
}
function _file_to_string($file_name, $result_string, $string_len) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 72)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $fd;
   var $file_len;
   var $file_status=__stackBase__;
   var $ret;
   $2=$file_name;
   $3=$result_string;
   $4=$string_len;
   var $5=$4;
   HEAP32[(($5)>>2)]=0;
   var $6=$2;
   var $7=_open($6, 0, (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $fd=$7;
   var $8=$fd;
   var $9=(($8)|(0))==-1;
   if ($9) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $11=$2;
   var $12=_printf(((3432)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$11,tempInt));
   $1=-1;
   label = 8; break;
  case 3: 
   var $14=$fd;
   var $15=_fstat($14, $file_status);
   $ret=$15;
   var $16=$ret;
   var $17=(($16)|(0))!=0;
   if ($17) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $19=$2;
   var $20=_printf(((3392)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$19,tempInt));
   $1=-1;
   label = 8; break;
  case 5: 
   var $22=(($file_status+28)|0);
   var $23=HEAP32[(($22)>>2)];
   $file_len=$23;
   var $24=$file_len;
   var $25=((($24)+(1))|0);
   var $26=_calloc($25, 1);
   var $27=$3;
   HEAP32[(($27)>>2)]=$26;
   var $28=$fd;
   var $29=$3;
   var $30=HEAP32[(($29)>>2)];
   var $31=$file_len;
   var $32=_read($28, $30, $31);
   $ret=$32;
   var $33=$ret;
   var $34=(($33)|(0))!=0;
   if ($34) { label = 7; break; } else { label = 6; break; }
  case 6: 
   var $36=$2;
   var $37=_printf(((3360)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$36,tempInt));
   $1=-1;
   label = 8; break;
  case 7: 
   var $39=$fd;
   var $40=_close($39);
   var $41=$file_len;
   var $42=$4;
   HEAP32[(($42)>>2)]=$41;
   $1=0;
   label = 8; break;
  case 8: 
   var $44=$1;
   STACKTOP = __stackBase__;
   return $44;
  default: assert(0, "bad label: " + label);
 }
}
function _bind_sphere_shader() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   _glEnable(3042);
   _glBlendFunc(770, 771);
   var $1=HEAP32[((3768)>>2)];
   _glActiveTextureARB($1);
   var $2=HEAP32[((4736)>>2)];
   _glBindTexture(3553, $2);
   var $3=HEAP32[((3912)>>2)];
   _glActiveTextureARB($3);
   var $4=HEAP32[((5040)>>2)];
   _glBindTexture(32879, $4);
   var $5=HEAP32[((3840)>>2)];
   _glActiveTextureARB($5);
   var $6=HEAP32[((4952)>>2)];
   _glBindTexture(3553, $6);
   var $7=HEAP32[((4712)>>2)];
   var $8=_glUseProgramObjectARB($7);
   var $9=HEAP32[((4712)>>2)];
   var $10=_get_uniform_location($9, ((2376)|0));
   var $11=HEAP32[((3912)>>2)];
   var $12=((($11)-(33984))|0);
   var $13=_glUniform1iARB($10, $12);
   var $14=HEAP32[((4712)>>2)];
   var $15=_get_uniform_location($14, ((2360)|0));
   var $16=HEAP32[((3896)>>2)];
   var $17=_glUniform1iARB($15, $16);
   var $18=HEAP32[((4712)>>2)];
   var $19=_get_uniform_location($18, ((2344)|0));
   var $20=HEAP32[((3752)>>2)];
   var $21=_glUniform1fARB($19, $20);
   var $22=HEAP32[((4712)>>2)];
   var $23=_get_uniform_location($22, ((2320)|0));
   var $24=HEAPF32[((3776)>>2)];
   var $25=$24;
   var $26=_glUniform1fARB($23, $25);
   var $27=HEAP32[((4712)>>2)];
   var $28=_get_uniform_location($27, ((2304)|0));
   var $29=HEAP32[((3768)>>2)];
   var $30=((($29)-(33984))|0);
   var $31=_glUniform1iARB($28, $30);
   var $32=HEAP32[((4712)>>2)];
   var $33=_get_uniform_location($32, ((2288)|0));
   var $34=HEAPF32[((((3848)|0))>>2)];
   var $35=$34;
   var $36=HEAPF32[((((3852)|0))>>2)];
   var $37=$36;
   var $38=HEAPF32[((((3856)|0))>>2)];
   var $39=$38;
   var $40=_glUniform3fARB($33, $35, $37, $39);
   var $41=HEAP32[((4712)>>2)];
   var $42=_get_uniform_location($41, ((2272)|0));
   var $43=HEAPF32[((((4056)|0))>>2)];
   var $44=$43;
   var $45=HEAPF32[((((4060)|0))>>2)];
   var $46=$45;
   var $47=HEAPF32[((((4064)|0))>>2)];
   var $48=$47;
   var $49=_glUniform3fARB($42, $44, $46, $48);
   var $50=HEAP32[((4712)>>2)];
   var $51=_get_uniform_location($50, ((2256)|0));
   var $52=_glUniform1fARB($51, 0.30000001192092896);
   var $53=HEAP32[((4712)>>2)];
   var $54=HEAP32[((5080)>>2)];
   var $55=(($53)|(0))==(($54)|(0));
   if ($55) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $57=HEAP32[((4712)>>2)];
   var $58=_get_uniform_location($57, ((2240)|0));
   var $59=HEAPF32[((3800)>>2)];
   var $60=$59;
   var $61=_glUniform1fARB($58, $60);
   var $62=HEAP32[((4712)>>2)];
   var $63=_get_uniform_location($62, ((2200)|0));
   var $64=HEAPF32[((3960)>>2)];
   var $65=$64;
   var $66=_glUniform1fARB($63, $65);
   var $67=HEAP32[((4712)>>2)];
   var $68=_get_uniform_location($67, ((2184)|0));
   var $69=HEAPF32[((3944)>>2)];
   var $70=$69;
   var $71=_glUniform1fARB($68, $70);
   var $72=HEAP32[((4712)>>2)];
   var $73=_get_uniform_location($72, ((2168)|0));
   var $74=HEAPF32[((3952)>>2)];
   var $75=$74;
   var $76=_glUniform1fARB($73, $75);
   var $77=HEAP32[((4712)>>2)];
   var $78=_get_uniform_location($77, ((2144)|0));
   var $79=HEAPF32[((3984)>>2)];
   var $80=$79;
   var $81=_glUniform1fARB($78, $80);
   var $82=HEAP32[((4712)>>2)];
   var $83=_get_uniform_location($82, ((2128)|0));
   var $84=HEAP32[((3840)>>2)];
   var $85=((($84)-(33984))|0);
   var $86=_glUniform1iARB($83, $85);
   var $87=HEAP32[((4712)>>2)];
   var $88=_get_uniform_location($87, ((2112)|0));
   var $89=_glUniform3fARB($88, 0.10000000149011612, 0.10000000149011612, 0.20000000298023224);
   label = 4; break;
  case 3: 
   var $91=HEAP32[((4712)>>2)];
   var $92=_get_uniform_location($91, ((2112)|0));
   var $93=_glUniform3fARB($92, 0.10000000149011612, 0.44999998807907104, 0.8500000238418579);
   label = 4; break;
  case 4: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _unbind_sphere_shader() {
 var label = 0;
 _glDisable(3042);
 var $1=HEAP32[((3768)>>2)];
 _glActiveTextureARB($1);
 _glBindTexture(3553, 0);
 var $2=HEAP32[((3912)>>2)];
 _glActiveTextureARB($2);
 _glBindTexture(32879, 0);
 var $3=HEAP32[((3840)>>2)];
 _glActiveTextureARB($3);
 _glBindTexture(3553, 0);
 var $4=HEAP32[((3976)>>2)];
 _glActiveTextureARB($4);
 var $5=_glUseProgramObjectARB(0);
 return;
}
function _link_shader($shader) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $err;
   var $length=__stackBase__;
   var $linked=(__stackBase__)+(8);
   var $actual=(__stackBase__)+(16);
   var $log;
   $1=$shader;
   $err=0;
   HEAP32[(($length)>>2)]=0;
   HEAP32[(($linked)>>2)]=0;
   var $2=$1;
   var $3=_glLinkProgramARB($2);
   var $4=_glGetError();
   $err=$4;
   var $5=$err;
   var $6=(($5)|(0))!=0;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $8=$err;
   var $9=_printf(((2728)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$8,tempInt));
   var $10=$err;
   _exit($10);
   throw "Reached an unreachable!";
  case 3: 
   var $12=$1;
   var $13=_glGetObjectParameterivARB($12, 35714, $linked);
   var $14=$1;
   var $15=_glGetObjectParameterivARB($14, 35716, $length);
   var $16=HEAP32[(($length)>>2)];
   var $17=(($16)|(0))!=0;
   if ($17) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $19=HEAP32[(($length)>>2)];
   var $20=((($19)+(128))|0);
   var $21=_malloc($20);
   $log=$21;
   var $22=$1;
   var $23=HEAP32[(($length)>>2)];
   var $24=$log;
   var $25=_glGetInfoLogARB($22, $23, $actual, $24);
   var $26=HEAP32[(($length)>>2)];
   var $27=$log;
   var $28=_printf(((2696)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$26,HEAP32[(((tempInt)+(8))>>2)]=$27,tempInt));
   var $29=$log;
   _free($29);
   label = 5; break;
  case 5: 
   var $31=HEAP32[(($linked)>>2)];
   var $32=(($31)|(0))==0;
   if ($32) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $34=_printf(((2672)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   _exit(1);
   throw "Reached an unreachable!";
  case 7: 
   STACKTOP = __stackBase__;
   return 0;
  default: assert(0, "bad label: " + label);
 }
}
function _compile_shader($target, $sourcecode) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2=__stackBase__;
   var $err;
   var $length=(__stackBase__)+(8);
   var $compiled=(__stackBase__)+(16);
   var $shader;
   var $log;
   $1=$target;
   HEAP32[(($2)>>2)]=$sourcecode;
   var $3=HEAP32[(($2)>>2)];
   var $4=(($3)|(0))!=0;
   if ($4) { label = 2; break; } else { label = 13; break; }
  case 2: 
   var $6=$1;
   var $7=_glCreateShaderObjectARB($6);
   $shader=$7;
   var $8=_glGetError();
   $err=$8;
   var $9=$err;
   var $10=(($9)|(0))!=0;
   if ($10) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $12=$err;
   var $13=_printf(((2624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$12,tempInt));
   var $14=$err;
   _exit($14);
   throw "Reached an unreachable!";
  case 4: 
   var $16=$shader;
   var $17=_glShaderSourceARB($16, 1, $2, 0);
   var $18=_glGetError();
   $err=$18;
   var $19=$err;
   var $20=(($19)|(0))!=0;
   if ($20) { label = 5; break; } else { label = 6; break; }
  case 5: 
   var $22=$err;
   var $23=_printf(((2576)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$22,tempInt));
   var $24=$err;
   _exit($24);
   throw "Reached an unreachable!";
  case 6: 
   var $26=$shader;
   var $27=_glCompileShaderARB($26);
   var $28=_glGetError();
   $err=$28;
   var $29=$err;
   var $30=(($29)|(0))!=0;
   if ($30) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $32=$err;
   var $33=_printf(((2528)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$32,tempInt));
   var $34=$err;
   _exit($34);
   throw "Reached an unreachable!";
  case 8: 
   var $36=$shader;
   var $37=_glGetObjectParameterivARB($36, 35713, $compiled);
   var $38=$shader;
   var $39=_glGetObjectParameterivARB($38, 35716, $length);
   var $40=HEAP32[(($length)>>2)];
   var $41=(($40)|(0))!=0;
   if ($41) { label = 9; break; } else { label = 10; break; }
  case 9: 
   var $43=HEAP32[(($length)>>2)];
   var $44=((($43)+(128))|0);
   var $45=_malloc($44);
   $log=$45;
   var $46=$shader;
   var $47=HEAP32[(($length)>>2)];
   var $48=$log;
   var $49=_glGetInfoLogARB($46, $47, $length, $48);
   var $50=$log;
   var $51=_printf(((2504)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$50,tempInt));
   var $52=$log;
   _free($52);
   label = 10; break;
  case 10: 
   var $54=HEAP32[(($compiled)>>2)];
   var $55=(($54)|(0))!=0;
   if ($55) { label = 12; break; } else { label = 11; break; }
  case 11: 
   var $57=_printf(((2472)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   _exit(1);
   throw "Reached an unreachable!";
  case 12: 
   label = 13; break;
  case 13: 
   var $60=$shader;
   STACKTOP = __stackBase__;
   return $60;
  default: assert(0, "bad label: " + label);
 }
}
function _create_shader($vertfile, $fragfile) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $err;
   var $shader_source=__stackBase__;
   var $shader_length=(__stackBase__)+(8);
   var $frag_shader;
   var $vert_shader;
   var $shader_program;
   $2=$vertfile;
   $3=$fragfile;
   $err=0;
   HEAP32[(($shader_source)>>2)]=0;
   HEAP32[(($shader_length)>>2)]=0;
   $frag_shader=0;
   $vert_shader=0;
   $shader_program=0;
   var $4=$2;
   var $5=(($4)|(0))!=0;
   if ($5) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $7=$2;
   var $8=_printf(((2440)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$7,tempInt));
   var $9=$2;
   var $10=_file_to_string($9, $shader_source, $shader_length);
   $err=$10;
   var $11=$err;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$shader_program;
   $1=$14;
   label = 20; break;
  case 4: 
   var $16=HEAP32[(($shader_source)>>2)];
   var $17=_compile_shader(35633, $16);
   $vert_shader=$17;
   var $18=HEAP32[(($shader_source)>>2)];
   _free($18);
   HEAP32[(($shader_source)>>2)]=0;
   HEAP32[(($shader_length)>>2)]=0;
   label = 5; break;
  case 5: 
   var $20=$3;
   var $21=(($20)|(0))!=0;
   if ($21) { label = 6; break; } else { label = 9; break; }
  case 6: 
   var $23=$3;
   var $24=_printf(((2440)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$23,tempInt));
   var $25=$3;
   var $26=_file_to_string($25, $shader_source, $shader_length);
   $err=$26;
   var $27=$err;
   var $28=(($27)|(0))!=0;
   if ($28) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $30=$shader_program;
   $1=$30;
   label = 20; break;
  case 8: 
   var $32=HEAP32[(($shader_source)>>2)];
   var $33=_compile_shader(35632, $32);
   $frag_shader=$33;
   var $34=HEAP32[(($shader_source)>>2)];
   _free($34);
   HEAP32[(($shader_source)>>2)]=0;
   HEAP32[(($shader_length)>>2)]=0;
   label = 9; break;
  case 9: 
   var $36=_glCreateProgramObjectARB();
   $shader_program=$36;
   var $37=$vert_shader;
   var $38=(($37)|(0))!=0;
   if ($38) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $40=$shader_program;
   var $41=$vert_shader;
   var $42=_glAttachObjectARB($40, $41);
   label = 11; break;
  case 11: 
   var $44=$frag_shader;
   var $45=(($44)|(0))!=0;
   if ($45) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $47=$shader_program;
   var $48=$frag_shader;
   var $49=_glAttachObjectARB($47, $48);
   label = 13; break;
  case 13: 
   var $51=$shader_program;
   var $52=_link_shader($51);
   $err=$52;
   var $53=$err;
   var $54=0!=(($53)|(0));
   if ($54) { label = 14; break; } else { label = 15; break; }
  case 14: 
   var $56=_printf(((2392)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   _exit(1);
   throw "Reached an unreachable!";
  case 15: 
   var $58=$vert_shader;
   var $59=(($58)|(0))!=0;
   if ($59) { label = 16; break; } else { label = 17; break; }
  case 16: 
   var $61=$vert_shader;
   var $62=_glDeleteObjectARB($61);
   label = 17; break;
  case 17: 
   var $64=$frag_shader;
   var $65=(($64)|(0))!=0;
   if ($65) { label = 18; break; } else { label = 19; break; }
  case 18: 
   var $67=$frag_shader;
   var $68=_glDeleteObjectARB($67);
   label = 19; break;
  case 19: 
   var $70=$shader_program;
   $1=$70;
   label = 20; break;
  case 20: 
   var $72=$1;
   STACKTOP = __stackBase__;
   return $72;
  default: assert(0, "bad label: " + label);
 }
}
function _clamp($v, $min, $max) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$v;
   $2=$min;
   $3=$max;
   var $4=$1;
   var $5=$2;
   var $6=$4 < $5;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $8=$2;
   var $20 = $8;label = 7; break;
  case 3: 
   var $10=$1;
   var $11=$3;
   var $12=$10 > $11;
   if ($12) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $14=$3;
   var $18 = $14;label = 6; break;
  case 5: 
   var $16=$1;
   var $18 = $16;label = 6; break;
  case 6: 
   var $18;
   var $20 = $18;label = 7; break;
  case 7: 
   var $20;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _bind_quad_shader() {
 var label = 0;
 var $1=HEAP32[((3840)>>2)];
 _glActiveTextureARB($1);
 var $2=HEAP32[((4952)>>2)];
 _glBindTexture(3553, $2);
 var $3=HEAP32[((3768)>>2)];
 _glActiveTextureARB($3);
 var $4=HEAP32[((4736)>>2)];
 _glBindTexture(3553, $4);
 var $5=HEAP32[((3912)>>2)];
 _glActiveTextureARB($5);
 var $6=HEAP32[((5040)>>2)];
 _glBindTexture(32879, $6);
 var $7=HEAP32[((5096)>>2)];
 var $8=_glUseProgramObjectARB($7);
 var $9=HEAP32[((5096)>>2)];
 var $10=_get_uniform_location($9, ((2376)|0));
 var $11=HEAP32[((3912)>>2)];
 var $12=((($11)-(33984))|0);
 var $13=_glUniform1iARB($10, $12);
 var $14=HEAP32[((5096)>>2)];
 var $15=_get_uniform_location($14, ((2360)|0));
 var $16=HEAP32[((3896)>>2)];
 var $17=_glUniform1iARB($15, $16);
 var $18=HEAP32[((5096)>>2)];
 var $19=_get_uniform_location($18, ((2344)|0));
 var $20=HEAP32[((3752)>>2)];
 var $21=_glUniform1fARB($19, $20);
 var $22=HEAP32[((5096)>>2)];
 var $23=_get_uniform_location($22, ((2320)|0));
 var $24=HEAPF32[((3776)>>2)];
 var $25=$24;
 var $26=_glUniform1fARB($23, $25);
 var $27=HEAP32[((5096)>>2)];
 var $28=_get_uniform_location($27, ((2304)|0));
 var $29=HEAP32[((3768)>>2)];
 var $30=((($29)-(33984))|0);
 var $31=_glUniform1iARB($28, $30);
 var $32=HEAP32[((5096)>>2)];
 var $33=_get_uniform_location($32, ((2288)|0));
 var $34=HEAPF32[((((3848)|0))>>2)];
 var $35=$34;
 var $36=HEAPF32[((((3852)|0))>>2)];
 var $37=$36;
 var $38=HEAPF32[((((3856)|0))>>2)];
 var $39=$38;
 var $40=_glUniform3fARB($33, $35, $37, $39);
 var $41=HEAP32[((5096)>>2)];
 var $42=_get_uniform_location($41, ((2272)|0));
 var $43=HEAPF32[((((4056)|0))>>2)];
 var $44=$43;
 var $45=HEAPF32[((((4060)|0))>>2)];
 var $46=$45;
 var $47=HEAPF32[((((4064)|0))>>2)];
 var $48=$47;
 var $49=_glUniform3fARB($42, $44, $46, $48);
 var $50=HEAP32[((5096)>>2)];
 var $51=_get_uniform_location($50, ((2112)|0));
 var $52=_glUniform3fARB($51, 1.5, 1.5, 1.5);
 var $53=HEAP32[((5096)>>2)];
 var $54=_get_uniform_location($53, ((2256)|0));
 var $55=_glUniform1fARB($54, 0);
 return;
}
function _unbind_quad_shader() {
 var label = 0;
 var $1=HEAP32[((3768)>>2)];
 _glActiveTextureARB($1);
 _glBindTexture(3553, 0);
 var $2=HEAP32[((3912)>>2)];
 _glActiveTextureARB($2);
 _glBindTexture(32879, 0);
 var $3=HEAP32[((3840)>>2)];
 _glActiveTextureARB($3);
 _glBindTexture(3553, 0);
 var $4=HEAP32[((3976)>>2)];
 _glActiveTextureARB($4);
 var $5=_glUseProgramObjectARB(0);
 return;
}
function _bind_skybox_shader() {
 var label = 0;
 var $1=HEAP32[((3840)>>2)];
 _glActiveTextureARB($1);
 var $2=HEAP32[((4952)>>2)];
 _glBindTexture(3553, $2);
 var $3=HEAP32[((4720)>>2)];
 var $4=_glUseProgramObjectARB($3);
 var $5=HEAP32[((4720)>>2)];
 var $6=_get_uniform_location($5, ((2128)|0));
 var $7=HEAP32[((3840)>>2)];
 var $8=((($7)-(33984))|0);
 var $9=_glUniform1iARB($6, $8);
 var $10=HEAP32[((5096)>>2)];
 var $11=_get_uniform_location($10, ((2272)|0));
 var $12=HEAPF32[((((4056)|0))>>2)];
 var $13=$12;
 var $14=HEAPF32[((((4060)|0))>>2)];
 var $15=$14;
 var $16=HEAPF32[((((4064)|0))>>2)];
 var $17=$16;
 var $18=_glUniform3fARB($11, $13, $15, $17);
 return;
}
function _unbind_skybox_shader() {
 var label = 0;
 var $1=HEAP32[((3840)>>2)];
 _glActiveTextureARB($1);
 _glBindTexture(3553, 0);
 var $2=HEAP32[((3976)>>2)];
 _glActiveTextureARB($2);
 var $3=_glUseProgramObjectARB(0);
 return;
}
function _setup_opengl() {
 var label = 0;
 var __stackBase__  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $3=_printf(((2088)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $4=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $5=_check_opengl();
   var $6=(($5 << 24) >> 24)!=0;
   if ($6) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $8=_glGetString(7937);
   var $9=_printf(((2056)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$8,tempInt));
   $1=1;
   label = 4; break;
  case 3: 
   var $11=HEAP32[((3696)>>2)];
   var $12=HEAP32[((3928)>>2)];
   _glViewport(0, 0, $11, $12);
   _glMatrixMode(5888);
   _glLoadIdentity();
   _glMatrixMode(5889);
   _glLoadIdentity();
   _glEnable(2929);
   _glClearDepth(1);
   _glDepthFunc(515);
   _glDepthRange(0, 1);
   _glEnable(2884);
   _glCullFace(1029);
   _glClearColor(0.8500000238418579, 0.8500000238418579, 0.8500000238418579, 0);
   _glHint(3152, 4354);
   var $13=_create_shadow_fbo();
   var $14=HEAP32[((3896)>>2)];
   var $15=HEAP32[((3904)>>2)];
   var $16=HEAP32[((3904)>>2)];
   _create_jitter_texture($14, $15, $16);
   _create_light_probe_texture(((2032)|0));
   _create_quad();
   _create_skybox();
   _create_sphere();
   _setup_lights();
   var $17=_create_shader(((2016)|0), ((1968)|0));
   HEAP32[((5080)>>2)]=$17;
   var $18=_create_shader(((1952)|0), ((1936)|0));
   HEAP32[((4760)>>2)]=$18;
   var $19=_create_shader(((1920)|0), ((1904)|0));
   HEAP32[((4720)>>2)]=$19;
   var $20=HEAP32[((4760)>>2)];
   HEAP32[((4712)>>2)]=$20;
   var $21=HEAP32[((4760)>>2)];
   HEAP32[((5096)>>2)]=$21;
   var $22=HEAP32[((3976)>>2)];
   _glClientActiveTexture($22);
   $1=0;
   label = 4; break;
  case 4: 
   var $24=$1;
   STACKTOP = __stackBase__;
   return $24;
  default: assert(0, "bad label: " + label);
 }
}
function _set_texgen_planes($plane) {
 var label = 0;
 var $1;
 $1=$plane;
 var $2=$1;
 _glTexGenfv(8192, $2, ((80)|0));
 var $3=$1;
 _glTexGenfv(8193, $3, ((64)|0));
 var $4=$1;
 _glTexGenfv(8194, $4, ((96)|0));
 var $5=$1;
 _glTexGenfv(8195, $5, ((112)|0));
 return;
}
function _set_eye_linear_texgen() {
 var label = 0;
 _set_texgen_planes(9474);
 _glTexGeni(8192, 9472, 9216);
 _glTexGeni(8193, 9472, 9216);
 _glTexGeni(8194, 9472, 9216);
 _glTexGeni(8195, 9472, 9216);
 return;
}
function _set_obj_linear_texgen() {
 var label = 0;
 _set_texgen_planes(9473);
 _glTexGeni(8192, 9472, 9217);
 _glTexGeni(8193, 9472, 9217);
 _glTexGeni(8194, 9472, 9217);
 _glTexGeni(8195, 9472, 9217);
 return;
}
function _set_texgen($enable) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   $1=$enable;
   var $2=$1;
   var $3=(($2)|(0))!=0;
   if ($3) { label = 2; break; } else { label = 3; break; }
  case 2: 
   _glEnable(3168);
   _glEnable(3169);
   _glEnable(3170);
   _glEnable(3171);
   label = 4; break;
  case 3: 
   _glDisable(3168);
   _glDisable(3169);
   _glDisable(3170);
   _glDisable(3171);
   label = 4; break;
  case 4: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _render_quad() {
 var label = 0;
 _glColor4f(1, 1, 1, 1);
 _glPushMatrix();
 _set_obj_linear_texgen();
 _set_texgen(1);
 var $1=HEAP32[((4752)>>2)];
 _glCallList($1);
 _glPopMatrix();
 return;
}
function _render_skybox() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 64)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $imv=__stackBase__;
 var $1=(($imv)|0);
 var $2=_matrix_inverse($1, ((5232)|0));
 _glDisable(2929);
 _glMatrixMode(5888);
 _glPushMatrix();
 var $3=HEAP32[((4728)>>2)];
 _glCallList($3);
 _glPopMatrix();
 _glEnable(2929);
 STACKTOP = __stackBase__;
 return;
}
function _matrix_inverse($inv, $m) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 64)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp=__stackBase__;
   var $d12;
   var $d13;
   var $d23;
   var $d24;
   var $d34;
   var $d41;
   var $determinant;
   var $invDeterminant;
   $2=$inv;
   $3=$m;
   var $4=$tmp;
   _memset($4, 0, 64);
   var $5=$3;
   var $6=(($5+8)|0);
   var $7=HEAPF32[(($6)>>2)];
   var $8=$3;
   var $9=(($8+28)|0);
   var $10=HEAPF32[(($9)>>2)];
   var $11=($7)*($10);
   var $12=$3;
   var $13=(($12+12)|0);
   var $14=HEAPF32[(($13)>>2)];
   var $15=$3;
   var $16=(($15+24)|0);
   var $17=HEAPF32[(($16)>>2)];
   var $18=($14)*($17);
   var $19=($11)-($18);
   $d12=$19;
   var $20=$3;
   var $21=(($20+8)|0);
   var $22=HEAPF32[(($21)>>2)];
   var $23=$3;
   var $24=(($23+44)|0);
   var $25=HEAPF32[(($24)>>2)];
   var $26=($22)*($25);
   var $27=$3;
   var $28=(($27+12)|0);
   var $29=HEAPF32[(($28)>>2)];
   var $30=$3;
   var $31=(($30+40)|0);
   var $32=HEAPF32[(($31)>>2)];
   var $33=($29)*($32);
   var $34=($26)-($33);
   $d13=$34;
   var $35=$3;
   var $36=(($35+24)|0);
   var $37=HEAPF32[(($36)>>2)];
   var $38=$3;
   var $39=(($38+44)|0);
   var $40=HEAPF32[(($39)>>2)];
   var $41=($37)*($40);
   var $42=$3;
   var $43=(($42+28)|0);
   var $44=HEAPF32[(($43)>>2)];
   var $45=$3;
   var $46=(($45+40)|0);
   var $47=HEAPF32[(($46)>>2)];
   var $48=($44)*($47);
   var $49=($41)-($48);
   $d23=$49;
   var $50=$3;
   var $51=(($50+24)|0);
   var $52=HEAPF32[(($51)>>2)];
   var $53=$3;
   var $54=(($53+60)|0);
   var $55=HEAPF32[(($54)>>2)];
   var $56=($52)*($55);
   var $57=$3;
   var $58=(($57+28)|0);
   var $59=HEAPF32[(($58)>>2)];
   var $60=$3;
   var $61=(($60+56)|0);
   var $62=HEAPF32[(($61)>>2)];
   var $63=($59)*($62);
   var $64=($56)-($63);
   $d24=$64;
   var $65=$3;
   var $66=(($65+40)|0);
   var $67=HEAPF32[(($66)>>2)];
   var $68=$3;
   var $69=(($68+60)|0);
   var $70=HEAPF32[(($69)>>2)];
   var $71=($67)*($70);
   var $72=$3;
   var $73=(($72+44)|0);
   var $74=HEAPF32[(($73)>>2)];
   var $75=$3;
   var $76=(($75+56)|0);
   var $77=HEAPF32[(($76)>>2)];
   var $78=($74)*($77);
   var $79=($71)-($78);
   $d34=$79;
   var $80=$3;
   var $81=(($80+56)|0);
   var $82=HEAPF32[(($81)>>2)];
   var $83=$3;
   var $84=(($83+12)|0);
   var $85=HEAPF32[(($84)>>2)];
   var $86=($82)*($85);
   var $87=$3;
   var $88=(($87+60)|0);
   var $89=HEAPF32[(($88)>>2)];
   var $90=$3;
   var $91=(($90+8)|0);
   var $92=HEAPF32[(($91)>>2)];
   var $93=($89)*($92);
   var $94=($86)-($93);
   $d41=$94;
   var $95=$3;
   var $96=(($95+20)|0);
   var $97=HEAPF32[(($96)>>2)];
   var $98=$d34;
   var $99=($97)*($98);
   var $100=$3;
   var $101=(($100+36)|0);
   var $102=HEAPF32[(($101)>>2)];
   var $103=$d24;
   var $104=($102)*($103);
   var $105=($99)-($104);
   var $106=$3;
   var $107=(($106+52)|0);
   var $108=HEAPF32[(($107)>>2)];
   var $109=$d23;
   var $110=($108)*($109);
   var $111=($105)+($110);
   var $112=(($tmp)|0);
   HEAPF32[(($112)>>2)]=$111;
   var $113=$3;
   var $114=(($113+4)|0);
   var $115=HEAPF32[(($114)>>2)];
   var $116=$d34;
   var $117=($115)*($116);
   var $118=$3;
   var $119=(($118+36)|0);
   var $120=HEAPF32[(($119)>>2)];
   var $121=$d41;
   var $122=($120)*($121);
   var $123=($117)+($122);
   var $124=$3;
   var $125=(($124+52)|0);
   var $126=HEAPF32[(($125)>>2)];
   var $127=$d13;
   var $128=($126)*($127);
   var $129=($123)+($128);
   var $130=(-$129);
   var $131=(($tmp+4)|0);
   HEAPF32[(($131)>>2)]=$130;
   var $132=$3;
   var $133=(($132+4)|0);
   var $134=HEAPF32[(($133)>>2)];
   var $135=$d24;
   var $136=($134)*($135);
   var $137=$3;
   var $138=(($137+20)|0);
   var $139=HEAPF32[(($138)>>2)];
   var $140=$d41;
   var $141=($139)*($140);
   var $142=($136)+($141);
   var $143=$3;
   var $144=(($143+52)|0);
   var $145=HEAPF32[(($144)>>2)];
   var $146=$d12;
   var $147=($145)*($146);
   var $148=($142)+($147);
   var $149=(($tmp+8)|0);
   HEAPF32[(($149)>>2)]=$148;
   var $150=$3;
   var $151=(($150+4)|0);
   var $152=HEAPF32[(($151)>>2)];
   var $153=$d23;
   var $154=($152)*($153);
   var $155=$3;
   var $156=(($155+20)|0);
   var $157=HEAPF32[(($156)>>2)];
   var $158=$d13;
   var $159=($157)*($158);
   var $160=($154)-($159);
   var $161=$3;
   var $162=(($161+36)|0);
   var $163=HEAPF32[(($162)>>2)];
   var $164=$d12;
   var $165=($163)*($164);
   var $166=($160)+($165);
   var $167=(-$166);
   var $168=(($tmp+12)|0);
   HEAPF32[(($168)>>2)]=$167;
   var $169=$3;
   var $170=(($169)|0);
   var $171=HEAPF32[(($170)>>2)];
   var $172=(($tmp)|0);
   var $173=HEAPF32[(($172)>>2)];
   var $174=($171)*($173);
   var $175=$3;
   var $176=(($175+16)|0);
   var $177=HEAPF32[(($176)>>2)];
   var $178=(($tmp+4)|0);
   var $179=HEAPF32[(($178)>>2)];
   var $180=($177)*($179);
   var $181=($174)+($180);
   var $182=$3;
   var $183=(($182+32)|0);
   var $184=HEAPF32[(($183)>>2)];
   var $185=(($tmp+8)|0);
   var $186=HEAPF32[(($185)>>2)];
   var $187=($184)*($186);
   var $188=($181)+($187);
   var $189=$3;
   var $190=(($189+48)|0);
   var $191=HEAPF32[(($190)>>2)];
   var $192=(($tmp+12)|0);
   var $193=HEAPF32[(($192)>>2)];
   var $194=($191)*($193);
   var $195=($188)+($194);
   $determinant=$195;
   var $196=$determinant;
   var $197=$196;
   var $198=$197 == 0;
   if ($198) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $200=$2;
   var $201=$200;
   assert(64 % 1 === 0);(_memcpy($201, 128, 64)|0);
   $1=0;
   label = 4; break;
  case 3: 
   var $203=$determinant;
   var $204=(1)/($203);
   $invDeterminant=$204;
   var $205=$invDeterminant;
   var $206=(($tmp)|0);
   var $207=HEAPF32[(($206)>>2)];
   var $208=($207)*($205);
   HEAPF32[(($206)>>2)]=$208;
   var $209=$invDeterminant;
   var $210=(($tmp+4)|0);
   var $211=HEAPF32[(($210)>>2)];
   var $212=($211)*($209);
   HEAPF32[(($210)>>2)]=$212;
   var $213=$invDeterminant;
   var $214=(($tmp+8)|0);
   var $215=HEAPF32[(($214)>>2)];
   var $216=($215)*($213);
   HEAPF32[(($214)>>2)]=$216;
   var $217=$invDeterminant;
   var $218=(($tmp+12)|0);
   var $219=HEAPF32[(($218)>>2)];
   var $220=($219)*($217);
   HEAPF32[(($218)>>2)]=$220;
   var $221=$3;
   var $222=(($221+16)|0);
   var $223=HEAPF32[(($222)>>2)];
   var $224=$d34;
   var $225=($223)*($224);
   var $226=$3;
   var $227=(($226+32)|0);
   var $228=HEAPF32[(($227)>>2)];
   var $229=$d24;
   var $230=($228)*($229);
   var $231=($225)-($230);
   var $232=$3;
   var $233=(($232+48)|0);
   var $234=HEAPF32[(($233)>>2)];
   var $235=$d23;
   var $236=($234)*($235);
   var $237=($231)+($236);
   var $238=(-$237);
   var $239=$invDeterminant;
   var $240=($238)*($239);
   var $241=(($tmp+16)|0);
   HEAPF32[(($241)>>2)]=$240;
   var $242=$3;
   var $243=(($242)|0);
   var $244=HEAPF32[(($243)>>2)];
   var $245=$d34;
   var $246=($244)*($245);
   var $247=$3;
   var $248=(($247+32)|0);
   var $249=HEAPF32[(($248)>>2)];
   var $250=$d41;
   var $251=($249)*($250);
   var $252=($246)+($251);
   var $253=$3;
   var $254=(($253+48)|0);
   var $255=HEAPF32[(($254)>>2)];
   var $256=$d13;
   var $257=($255)*($256);
   var $258=$invDeterminant;
   var $259=($257)*($258);
   var $260=($252)+($259);
   var $261=(($tmp+20)|0);
   HEAPF32[(($261)>>2)]=$260;
   var $262=$3;
   var $263=(($262)|0);
   var $264=HEAPF32[(($263)>>2)];
   var $265=$d24;
   var $266=($264)*($265);
   var $267=$3;
   var $268=(($267+16)|0);
   var $269=HEAPF32[(($268)>>2)];
   var $270=$d41;
   var $271=($269)*($270);
   var $272=($266)+($271);
   var $273=$3;
   var $274=(($273+48)|0);
   var $275=HEAPF32[(($274)>>2)];
   var $276=$d12;
   var $277=($275)*($276);
   var $278=($272)+($277);
   var $279=(-$278);
   var $280=$invDeterminant;
   var $281=($279)*($280);
   var $282=(($tmp+24)|0);
   HEAPF32[(($282)>>2)]=$281;
   var $283=$3;
   var $284=(($283)|0);
   var $285=HEAPF32[(($284)>>2)];
   var $286=$d23;
   var $287=($285)*($286);
   var $288=$3;
   var $289=(($288+16)|0);
   var $290=HEAPF32[(($289)>>2)];
   var $291=$d13;
   var $292=($290)*($291);
   var $293=($287)-($292);
   var $294=$3;
   var $295=(($294+32)|0);
   var $296=HEAPF32[(($295)>>2)];
   var $297=$d12;
   var $298=($296)*($297);
   var $299=$invDeterminant;
   var $300=($298)*($299);
   var $301=($293)+($300);
   var $302=(($tmp+28)|0);
   HEAPF32[(($302)>>2)]=$301;
   var $303=$3;
   var $304=(($303)|0);
   var $305=HEAPF32[(($304)>>2)];
   var $306=$3;
   var $307=(($306+20)|0);
   var $308=HEAPF32[(($307)>>2)];
   var $309=($305)*($308);
   var $310=$3;
   var $311=(($310+4)|0);
   var $312=HEAPF32[(($311)>>2)];
   var $313=$3;
   var $314=(($313+48)|0);
   var $315=HEAPF32[(($314)>>2)];
   var $316=($312)*($315);
   var $317=($309)-($316);
   $d12=$317;
   var $318=$3;
   var $319=(($318)|0);
   var $320=HEAPF32[(($319)>>2)];
   var $321=$3;
   var $322=(($321+36)|0);
   var $323=HEAPF32[(($322)>>2)];
   var $324=($320)*($323);
   var $325=$3;
   var $326=(($325+4)|0);
   var $327=HEAPF32[(($326)>>2)];
   var $328=$3;
   var $329=(($328+32)|0);
   var $330=HEAPF32[(($329)>>2)];
   var $331=($327)*($330);
   var $332=($324)-($331);
   $d13=$332;
   var $333=$3;
   var $334=(($333+16)|0);
   var $335=HEAPF32[(($334)>>2)];
   var $336=$3;
   var $337=(($336+36)|0);
   var $338=HEAPF32[(($337)>>2)];
   var $339=($335)*($338);
   var $340=$3;
   var $341=(($340+20)|0);
   var $342=HEAPF32[(($341)>>2)];
   var $343=$3;
   var $344=(($343+32)|0);
   var $345=HEAPF32[(($344)>>2)];
   var $346=($342)*($345);
   var $347=($339)-($346);
   $d23=$347;
   var $348=$3;
   var $349=(($348+16)|0);
   var $350=HEAPF32[(($349)>>2)];
   var $351=$3;
   var $352=(($351+52)|0);
   var $353=HEAPF32[(($352)>>2)];
   var $354=($350)*($353);
   var $355=$3;
   var $356=(($355+20)|0);
   var $357=HEAPF32[(($356)>>2)];
   var $358=$3;
   var $359=(($358+48)|0);
   var $360=HEAPF32[(($359)>>2)];
   var $361=($357)*($360);
   var $362=($354)-($361);
   $d24=$362;
   var $363=$3;
   var $364=(($363+32)|0);
   var $365=HEAPF32[(($364)>>2)];
   var $366=$3;
   var $367=(($366+52)|0);
   var $368=HEAPF32[(($367)>>2)];
   var $369=($365)*($368);
   var $370=$3;
   var $371=(($370+36)|0);
   var $372=HEAPF32[(($371)>>2)];
   var $373=$3;
   var $374=(($373+48)|0);
   var $375=HEAPF32[(($374)>>2)];
   var $376=($372)*($375);
   var $377=($369)-($376);
   $d34=$377;
   var $378=$3;
   var $379=(($378+48)|0);
   var $380=HEAPF32[(($379)>>2)];
   var $381=$3;
   var $382=(($381+4)|0);
   var $383=HEAPF32[(($382)>>2)];
   var $384=($380)*($383);
   var $385=$3;
   var $386=(($385+52)|0);
   var $387=HEAPF32[(($386)>>2)];
   var $388=$3;
   var $389=(($388)|0);
   var $390=HEAPF32[(($389)>>2)];
   var $391=($387)*($390);
   var $392=($384)-($391);
   $d41=$392;
   var $393=$3;
   var $394=(($393+28)|0);
   var $395=HEAPF32[(($394)>>2)];
   var $396=$d34;
   var $397=($395)*($396);
   var $398=$3;
   var $399=(($398+44)|0);
   var $400=HEAPF32[(($399)>>2)];
   var $401=$d24;
   var $402=($400)*($401);
   var $403=($397)-($402);
   var $404=$3;
   var $405=(($404+60)|0);
   var $406=HEAPF32[(($405)>>2)];
   var $407=$d23;
   var $408=($406)*($407);
   var $409=$invDeterminant;
   var $410=($408)*($409);
   var $411=($403)+($410);
   var $412=(($tmp+32)|0);
   HEAPF32[(($412)>>2)]=$411;
   var $413=$3;
   var $414=(($413+12)|0);
   var $415=HEAPF32[(($414)>>2)];
   var $416=$d34;
   var $417=($415)*($416);
   var $418=$3;
   var $419=(($418+44)|0);
   var $420=HEAPF32[(($419)>>2)];
   var $421=$d41;
   var $422=($420)*($421);
   var $423=($417)+($422);
   var $424=$3;
   var $425=(($424+60)|0);
   var $426=HEAPF32[(($425)>>2)];
   var $427=$d13;
   var $428=($426)*($427);
   var $429=($423)+($428);
   var $430=(-$429);
   var $431=$invDeterminant;
   var $432=($430)*($431);
   var $433=(($tmp+36)|0);
   HEAPF32[(($433)>>2)]=$432;
   var $434=$3;
   var $435=(($434+12)|0);
   var $436=HEAPF32[(($435)>>2)];
   var $437=$d24;
   var $438=($436)*($437);
   var $439=$3;
   var $440=(($439+28)|0);
   var $441=HEAPF32[(($440)>>2)];
   var $442=$d41;
   var $443=($441)*($442);
   var $444=($438)+($443);
   var $445=$3;
   var $446=(($445+60)|0);
   var $447=HEAPF32[(($446)>>2)];
   var $448=$d12;
   var $449=($447)*($448);
   var $450=$invDeterminant;
   var $451=($449)*($450);
   var $452=($444)+($451);
   var $453=(($tmp+40)|0);
   HEAPF32[(($453)>>2)]=$452;
   var $454=$3;
   var $455=(($454+12)|0);
   var $456=HEAPF32[(($455)>>2)];
   var $457=$d23;
   var $458=($456)*($457);
   var $459=$3;
   var $460=(($459+28)|0);
   var $461=HEAPF32[(($460)>>2)];
   var $462=$d13;
   var $463=($461)*($462);
   var $464=($458)-($463);
   var $465=$3;
   var $466=(($465+44)|0);
   var $467=HEAPF32[(($466)>>2)];
   var $468=$d12;
   var $469=($467)*($468);
   var $470=($464)+($469);
   var $471=(-$470);
   var $472=$invDeterminant;
   var $473=($471)*($472);
   var $474=(($tmp+44)|0);
   HEAPF32[(($474)>>2)]=$473;
   var $475=$3;
   var $476=(($475+24)|0);
   var $477=HEAPF32[(($476)>>2)];
   var $478=$d34;
   var $479=($477)*($478);
   var $480=$3;
   var $481=(($480+40)|0);
   var $482=HEAPF32[(($481)>>2)];
   var $483=$d24;
   var $484=($482)*($483);
   var $485=($479)-($484);
   var $486=$3;
   var $487=(($486+56)|0);
   var $488=HEAPF32[(($487)>>2)];
   var $489=$d23;
   var $490=($488)*($489);
   var $491=($485)+($490);
   var $492=(-$491);
   var $493=$invDeterminant;
   var $494=($492)*($493);
   var $495=(($tmp+48)|0);
   HEAPF32[(($495)>>2)]=$494;
   var $496=$3;
   var $497=(($496+8)|0);
   var $498=HEAPF32[(($497)>>2)];
   var $499=$d34;
   var $500=($498)*($499);
   var $501=$3;
   var $502=(($501+40)|0);
   var $503=HEAPF32[(($502)>>2)];
   var $504=$d41;
   var $505=($503)*($504);
   var $506=($500)+($505);
   var $507=$3;
   var $508=(($507+56)|0);
   var $509=HEAPF32[(($508)>>2)];
   var $510=$d13;
   var $511=($509)*($510);
   var $512=$invDeterminant;
   var $513=($511)*($512);
   var $514=($506)+($513);
   var $515=(($tmp+52)|0);
   HEAPF32[(($515)>>2)]=$514;
   var $516=$3;
   var $517=(($516+8)|0);
   var $518=HEAPF32[(($517)>>2)];
   var $519=$d24;
   var $520=($518)*($519);
   var $521=$3;
   var $522=(($521+24)|0);
   var $523=HEAPF32[(($522)>>2)];
   var $524=$d41;
   var $525=($523)*($524);
   var $526=($520)+($525);
   var $527=$3;
   var $528=(($527+56)|0);
   var $529=HEAPF32[(($528)>>2)];
   var $530=$d12;
   var $531=($529)*($530);
   var $532=($526)+($531);
   var $533=(-$532);
   var $534=$invDeterminant;
   var $535=($533)*($534);
   var $536=(($tmp+56)|0);
   HEAPF32[(($536)>>2)]=$535;
   var $537=$3;
   var $538=(($537+8)|0);
   var $539=HEAPF32[(($538)>>2)];
   var $540=$d23;
   var $541=($539)*($540);
   var $542=$3;
   var $543=(($542+24)|0);
   var $544=HEAPF32[(($543)>>2)];
   var $545=$d13;
   var $546=($544)*($545);
   var $547=($541)-($546);
   var $548=$3;
   var $549=(($548+40)|0);
   var $550=HEAPF32[(($549)>>2)];
   var $551=$d12;
   var $552=($550)*($551);
   var $553=$invDeterminant;
   var $554=($552)*($553);
   var $555=($547)+($554);
   var $556=(($tmp+60)|0);
   HEAPF32[(($556)>>2)]=$555;
   var $557=$2;
   var $558=$557;
   var $559=$tmp;
   assert(64 % 1 === 0);(_memcpy($558, $559, 64)|0);
   $1=1;
   label = 4; break;
  case 4: 
   var $561=$1;
   STACKTOP = __stackBase__;
   return $561;
  default: assert(0, "bad label: " + label);
 }
}
function _render_sphere() {
 var label = 0;
 _glPushMatrix();
 _glEnableClientState(32884);
 _glEnableClientState(32885);
 var $1=HEAP32[((4656)>>2)];
 var $2=_glBindBuffer(34962, $1);
 var $3=HEAP32[((4648)>>2)];
 var $4=HEAP32[((4664)>>2)];
 var $5=_glBufferSubData(34962, 0, $3, $4);
 var $6=HEAP32[((3704)>>2)];
 _glVertexPointer($6, 5126, 0, 0);
 var $7=HEAP32[((4784)>>2)];
 var $8=_glBindBuffer(34962, $7);
 var $9=HEAP32[((4648)>>2)];
 var $10=HEAP32[((4792)>>2)];
 var $11=_glBufferSubData(34962, 0, $9, $10);
 var $12=HEAP32[((3704)>>2)];
 var $13=($12<<2);
 _glNormalPointer(5126, $13, 0);
 var $14=HEAP32[((4640)>>2)];
 _glDrawArrays(8, 0, $14);
 var $15=_glBindBuffer(34962, 0);
 _glDisableClientState(32885);
 _glDisableClientState(32884);
 _glPopMatrix();
 return;
}
function _render_scene($shaded) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   $1=$shaded;
   var $2=$1;
   var $3=(($2)|(0))!=0;
   if ($3) { label = 2; break; } else { label = 6; break; }
  case 2: 
   _glEnable(32925);
   _glMatrixMode(5888);
   _glPushMatrix();
   var $5=HEAP32[((4712)>>2)];
   var $6=HEAP32[((5080)>>2)];
   var $7=(($5)|(0))==(($6)|(0));
   if ($7) { label = 3; break; } else { label = 4; break; }
  case 3: 
   _bind_skybox_shader();
   _render_skybox();
   _unbind_skybox_shader();
   label = 5; break;
  case 4: 
   _bind_quad_shader();
   _render_quad();
   _unbind_quad_shader();
   label = 5; break;
  case 5: 
   _bind_sphere_shader();
   _render_sphere();
   _unbind_sphere_shader();
   _glPopMatrix();
   _glDisable(32925);
   label = 7; break;
  case 6: 
   _render_quad();
   _render_sphere();
   label = 7; break;
  case 7: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _vector_scale($v, $s) {
 var label = 0;
 var $1;
 var $2;
 $1=$v;
 $2=$s;
 var $3=$2;
 var $4=$1;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=($6)*($3);
 HEAPF32[(($5)>>2)]=$7;
 var $8=$2;
 var $9=$1;
 var $10=(($9+4)|0);
 var $11=HEAPF32[(($10)>>2)];
 var $12=($11)*($8);
 HEAPF32[(($10)>>2)]=$12;
 var $13=$2;
 var $14=$1;
 var $15=(($14+8)|0);
 var $16=HEAPF32[(($15)>>2)];
 var $17=($16)*($13);
 HEAPF32[(($15)>>2)]=$17;
 return;
}
function _vector_sub($v, $va, $vb) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$v;
 $2=$va;
 $3=$vb;
 var $4=$2;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$3;
 var $8=(($7)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)-($9);
 var $11=$1;
 var $12=(($11)|0);
 HEAPF32[(($12)>>2)]=$10;
 var $13=$2;
 var $14=(($13+4)|0);
 var $15=HEAPF32[(($14)>>2)];
 var $16=$3;
 var $17=(($16+4)|0);
 var $18=HEAPF32[(($17)>>2)];
 var $19=($15)-($18);
 var $20=$1;
 var $21=(($20+4)|0);
 HEAPF32[(($21)>>2)]=$19;
 var $22=$2;
 var $23=(($22+8)|0);
 var $24=HEAPF32[(($23)>>2)];
 var $25=$3;
 var $26=(($25+8)|0);
 var $27=HEAPF32[(($26)>>2)];
 var $28=($24)-($27);
 var $29=$1;
 var $30=(($29+8)|0);
 HEAPF32[(($30)>>2)]=$28;
 return;
}
function _vector_add($v, $va, $vb) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$v;
 $2=$va;
 $3=$vb;
 var $4=$2;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$3;
 var $8=(($7)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)+($9);
 var $11=$1;
 var $12=(($11)|0);
 HEAPF32[(($12)>>2)]=$10;
 var $13=$2;
 var $14=(($13+4)|0);
 var $15=HEAPF32[(($14)>>2)];
 var $16=$3;
 var $17=(($16+4)|0);
 var $18=HEAPF32[(($17)>>2)];
 var $19=($15)+($18);
 var $20=$1;
 var $21=(($20+4)|0);
 HEAPF32[(($21)>>2)]=$19;
 var $22=$2;
 var $23=(($22+8)|0);
 var $24=HEAPF32[(($23)>>2)];
 var $25=$3;
 var $26=(($25+8)|0);
 var $27=HEAPF32[(($26)>>2)];
 var $28=($24)+($27);
 var $29=$1;
 var $30=(($29+8)|0);
 HEAPF32[(($30)>>2)]=$28;
 return;
}
function _vector_cross($v, $va, $vb) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$v;
 $2=$va;
 $3=$vb;
 var $4=$2;
 var $5=(($4+4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$3;
 var $8=(($7+8)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)*($9);
 var $11=$2;
 var $12=(($11+8)|0);
 var $13=HEAPF32[(($12)>>2)];
 var $14=$3;
 var $15=(($14+4)|0);
 var $16=HEAPF32[(($15)>>2)];
 var $17=($13)*($16);
 var $18=($10)-($17);
 var $19=$1;
 var $20=(($19)|0);
 HEAPF32[(($20)>>2)]=$18;
 var $21=$2;
 var $22=(($21+8)|0);
 var $23=HEAPF32[(($22)>>2)];
 var $24=$3;
 var $25=(($24)|0);
 var $26=HEAPF32[(($25)>>2)];
 var $27=($23)*($26);
 var $28=$2;
 var $29=(($28)|0);
 var $30=HEAPF32[(($29)>>2)];
 var $31=$3;
 var $32=(($31+8)|0);
 var $33=HEAPF32[(($32)>>2)];
 var $34=($30)*($33);
 var $35=($27)-($34);
 var $36=$1;
 var $37=(($36+4)|0);
 HEAPF32[(($37)>>2)]=$35;
 var $38=$2;
 var $39=(($38)|0);
 var $40=HEAPF32[(($39)>>2)];
 var $41=$3;
 var $42=(($41+4)|0);
 var $43=HEAPF32[(($42)>>2)];
 var $44=($40)*($43);
 var $45=$2;
 var $46=(($45+4)|0);
 var $47=HEAPF32[(($46)>>2)];
 var $48=$3;
 var $49=(($48)|0);
 var $50=HEAPF32[(($49)>>2)];
 var $51=($47)*($50);
 var $52=($44)-($51);
 var $53=$1;
 var $54=(($53+8)|0);
 HEAPF32[(($54)>>2)]=$52;
 return;
}
function _multiply_matrix_vector($v, $m, $va) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$v;
 $2=$m;
 $3=$va;
 var $4=$2;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$3;
 var $8=(($7)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)*($9);
 var $11=$2;
 var $12=(($11+16)|0);
 var $13=HEAPF32[(($12)>>2)];
 var $14=$3;
 var $15=(($14+4)|0);
 var $16=HEAPF32[(($15)>>2)];
 var $17=($13)*($16);
 var $18=($10)+($17);
 var $19=$2;
 var $20=(($19+32)|0);
 var $21=HEAPF32[(($20)>>2)];
 var $22=$3;
 var $23=(($22+8)|0);
 var $24=HEAPF32[(($23)>>2)];
 var $25=($21)*($24);
 var $26=($18)+($25);
 var $27=$2;
 var $28=(($27+48)|0);
 var $29=HEAPF32[(($28)>>2)];
 var $30=$3;
 var $31=(($30+12)|0);
 var $32=HEAPF32[(($31)>>2)];
 var $33=($29)*($32);
 var $34=($26)+($33);
 var $35=$1;
 var $36=(($35)|0);
 HEAPF32[(($36)>>2)]=$34;
 var $37=$2;
 var $38=(($37+4)|0);
 var $39=HEAPF32[(($38)>>2)];
 var $40=$3;
 var $41=(($40)|0);
 var $42=HEAPF32[(($41)>>2)];
 var $43=($39)*($42);
 var $44=$2;
 var $45=(($44+20)|0);
 var $46=HEAPF32[(($45)>>2)];
 var $47=$3;
 var $48=(($47+4)|0);
 var $49=HEAPF32[(($48)>>2)];
 var $50=($46)*($49);
 var $51=($43)+($50);
 var $52=$2;
 var $53=(($52+36)|0);
 var $54=HEAPF32[(($53)>>2)];
 var $55=$3;
 var $56=(($55+8)|0);
 var $57=HEAPF32[(($56)>>2)];
 var $58=($54)*($57);
 var $59=($51)+($58);
 var $60=$2;
 var $61=(($60+52)|0);
 var $62=HEAPF32[(($61)>>2)];
 var $63=$3;
 var $64=(($63+12)|0);
 var $65=HEAPF32[(($64)>>2)];
 var $66=($62)*($65);
 var $67=($59)+($66);
 var $68=$1;
 var $69=(($68+4)|0);
 HEAPF32[(($69)>>2)]=$67;
 var $70=$2;
 var $71=(($70+8)|0);
 var $72=HEAPF32[(($71)>>2)];
 var $73=$3;
 var $74=(($73)|0);
 var $75=HEAPF32[(($74)>>2)];
 var $76=($72)*($75);
 var $77=$2;
 var $78=(($77+24)|0);
 var $79=HEAPF32[(($78)>>2)];
 var $80=$3;
 var $81=(($80+4)|0);
 var $82=HEAPF32[(($81)>>2)];
 var $83=($79)*($82);
 var $84=($76)+($83);
 var $85=$2;
 var $86=(($85+40)|0);
 var $87=HEAPF32[(($86)>>2)];
 var $88=$3;
 var $89=(($88+8)|0);
 var $90=HEAPF32[(($89)>>2)];
 var $91=($87)*($90);
 var $92=($84)+($91);
 var $93=$2;
 var $94=(($93+56)|0);
 var $95=HEAPF32[(($94)>>2)];
 var $96=$3;
 var $97=(($96+12)|0);
 var $98=HEAPF32[(($97)>>2)];
 var $99=($95)*($98);
 var $100=($92)+($99);
 var $101=$1;
 var $102=(($101+8)|0);
 HEAPF32[(($102)>>2)]=$100;
 var $103=$2;
 var $104=(($103+12)|0);
 var $105=HEAPF32[(($104)>>2)];
 var $106=$3;
 var $107=(($106)|0);
 var $108=HEAPF32[(($107)>>2)];
 var $109=($105)*($108);
 var $110=$2;
 var $111=(($110+28)|0);
 var $112=HEAPF32[(($111)>>2)];
 var $113=$3;
 var $114=(($113+4)|0);
 var $115=HEAPF32[(($114)>>2)];
 var $116=($112)*($115);
 var $117=($109)+($116);
 var $118=$2;
 var $119=(($118+44)|0);
 var $120=HEAPF32[(($119)>>2)];
 var $121=$3;
 var $122=(($121+8)|0);
 var $123=HEAPF32[(($122)>>2)];
 var $124=($120)*($123);
 var $125=($117)+($124);
 var $126=$2;
 var $127=(($126+60)|0);
 var $128=HEAPF32[(($127)>>2)];
 var $129=$3;
 var $130=(($129+12)|0);
 var $131=HEAPF32[(($130)>>2)];
 var $132=($128)*($131);
 var $133=($125)+($132);
 var $134=$1;
 var $135=(($134+12)|0);
 HEAPF32[(($135)>>2)]=$133;
 return;
}
function _multiply_matrices($m, $a, $b) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$m;
 $2=$a;
 $3=$b;
 var $4=$3;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$2;
 var $8=(($7)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)*($9);
 var $11=$3;
 var $12=(($11+16)|0);
 var $13=HEAPF32[(($12)>>2)];
 var $14=$2;
 var $15=(($14+4)|0);
 var $16=HEAPF32[(($15)>>2)];
 var $17=($13)*($16);
 var $18=($10)+($17);
 var $19=$3;
 var $20=(($19+32)|0);
 var $21=HEAPF32[(($20)>>2)];
 var $22=$2;
 var $23=(($22+8)|0);
 var $24=HEAPF32[(($23)>>2)];
 var $25=($21)*($24);
 var $26=($18)+($25);
 var $27=$3;
 var $28=(($27+48)|0);
 var $29=HEAPF32[(($28)>>2)];
 var $30=$2;
 var $31=(($30+12)|0);
 var $32=HEAPF32[(($31)>>2)];
 var $33=($29)*($32);
 var $34=($26)+($33);
 var $35=$1;
 var $36=(($35)|0);
 HEAPF32[(($36)>>2)]=$34;
 var $37=$3;
 var $38=(($37+4)|0);
 var $39=HEAPF32[(($38)>>2)];
 var $40=$2;
 var $41=(($40)|0);
 var $42=HEAPF32[(($41)>>2)];
 var $43=($39)*($42);
 var $44=$3;
 var $45=(($44+20)|0);
 var $46=HEAPF32[(($45)>>2)];
 var $47=$2;
 var $48=(($47+4)|0);
 var $49=HEAPF32[(($48)>>2)];
 var $50=($46)*($49);
 var $51=($43)+($50);
 var $52=$3;
 var $53=(($52+36)|0);
 var $54=HEAPF32[(($53)>>2)];
 var $55=$2;
 var $56=(($55+8)|0);
 var $57=HEAPF32[(($56)>>2)];
 var $58=($54)*($57);
 var $59=($51)+($58);
 var $60=$3;
 var $61=(($60+52)|0);
 var $62=HEAPF32[(($61)>>2)];
 var $63=$2;
 var $64=(($63+12)|0);
 var $65=HEAPF32[(($64)>>2)];
 var $66=($62)*($65);
 var $67=($59)+($66);
 var $68=$1;
 var $69=(($68+4)|0);
 HEAPF32[(($69)>>2)]=$67;
 var $70=$3;
 var $71=(($70+8)|0);
 var $72=HEAPF32[(($71)>>2)];
 var $73=$2;
 var $74=(($73)|0);
 var $75=HEAPF32[(($74)>>2)];
 var $76=($72)*($75);
 var $77=$3;
 var $78=(($77+24)|0);
 var $79=HEAPF32[(($78)>>2)];
 var $80=$2;
 var $81=(($80+4)|0);
 var $82=HEAPF32[(($81)>>2)];
 var $83=($79)*($82);
 var $84=($76)+($83);
 var $85=$3;
 var $86=(($85+40)|0);
 var $87=HEAPF32[(($86)>>2)];
 var $88=$2;
 var $89=(($88+8)|0);
 var $90=HEAPF32[(($89)>>2)];
 var $91=($87)*($90);
 var $92=($84)+($91);
 var $93=$3;
 var $94=(($93+56)|0);
 var $95=HEAPF32[(($94)>>2)];
 var $96=$2;
 var $97=(($96+12)|0);
 var $98=HEAPF32[(($97)>>2)];
 var $99=($95)*($98);
 var $100=($92)+($99);
 var $101=$1;
 var $102=(($101+8)|0);
 HEAPF32[(($102)>>2)]=$100;
 var $103=$3;
 var $104=(($103+12)|0);
 var $105=HEAPF32[(($104)>>2)];
 var $106=$2;
 var $107=(($106)|0);
 var $108=HEAPF32[(($107)>>2)];
 var $109=($105)*($108);
 var $110=$3;
 var $111=(($110+28)|0);
 var $112=HEAPF32[(($111)>>2)];
 var $113=$2;
 var $114=(($113+4)|0);
 var $115=HEAPF32[(($114)>>2)];
 var $116=($112)*($115);
 var $117=($109)+($116);
 var $118=$3;
 var $119=(($118+44)|0);
 var $120=HEAPF32[(($119)>>2)];
 var $121=$2;
 var $122=(($121+8)|0);
 var $123=HEAPF32[(($122)>>2)];
 var $124=($120)*($123);
 var $125=($117)+($124);
 var $126=$3;
 var $127=(($126+60)|0);
 var $128=HEAPF32[(($127)>>2)];
 var $129=$2;
 var $130=(($129+12)|0);
 var $131=HEAPF32[(($130)>>2)];
 var $132=($128)*($131);
 var $133=($125)+($132);
 var $134=$1;
 var $135=(($134+12)|0);
 HEAPF32[(($135)>>2)]=$133;
 var $136=$3;
 var $137=(($136)|0);
 var $138=HEAPF32[(($137)>>2)];
 var $139=$2;
 var $140=(($139+16)|0);
 var $141=HEAPF32[(($140)>>2)];
 var $142=($138)*($141);
 var $143=$3;
 var $144=(($143+16)|0);
 var $145=HEAPF32[(($144)>>2)];
 var $146=$2;
 var $147=(($146+20)|0);
 var $148=HEAPF32[(($147)>>2)];
 var $149=($145)*($148);
 var $150=($142)+($149);
 var $151=$3;
 var $152=(($151+32)|0);
 var $153=HEAPF32[(($152)>>2)];
 var $154=$2;
 var $155=(($154+24)|0);
 var $156=HEAPF32[(($155)>>2)];
 var $157=($153)*($156);
 var $158=($150)+($157);
 var $159=$3;
 var $160=(($159+48)|0);
 var $161=HEAPF32[(($160)>>2)];
 var $162=$2;
 var $163=(($162+28)|0);
 var $164=HEAPF32[(($163)>>2)];
 var $165=($161)*($164);
 var $166=($158)+($165);
 var $167=$1;
 var $168=(($167+16)|0);
 HEAPF32[(($168)>>2)]=$166;
 var $169=$3;
 var $170=(($169+4)|0);
 var $171=HEAPF32[(($170)>>2)];
 var $172=$2;
 var $173=(($172+16)|0);
 var $174=HEAPF32[(($173)>>2)];
 var $175=($171)*($174);
 var $176=$3;
 var $177=(($176+20)|0);
 var $178=HEAPF32[(($177)>>2)];
 var $179=$2;
 var $180=(($179+20)|0);
 var $181=HEAPF32[(($180)>>2)];
 var $182=($178)*($181);
 var $183=($175)+($182);
 var $184=$3;
 var $185=(($184+36)|0);
 var $186=HEAPF32[(($185)>>2)];
 var $187=$2;
 var $188=(($187+24)|0);
 var $189=HEAPF32[(($188)>>2)];
 var $190=($186)*($189);
 var $191=($183)+($190);
 var $192=$3;
 var $193=(($192+52)|0);
 var $194=HEAPF32[(($193)>>2)];
 var $195=$2;
 var $196=(($195+28)|0);
 var $197=HEAPF32[(($196)>>2)];
 var $198=($194)*($197);
 var $199=($191)+($198);
 var $200=$1;
 var $201=(($200+20)|0);
 HEAPF32[(($201)>>2)]=$199;
 var $202=$3;
 var $203=(($202+8)|0);
 var $204=HEAPF32[(($203)>>2)];
 var $205=$2;
 var $206=(($205+16)|0);
 var $207=HEAPF32[(($206)>>2)];
 var $208=($204)*($207);
 var $209=$3;
 var $210=(($209+24)|0);
 var $211=HEAPF32[(($210)>>2)];
 var $212=$2;
 var $213=(($212+20)|0);
 var $214=HEAPF32[(($213)>>2)];
 var $215=($211)*($214);
 var $216=($208)+($215);
 var $217=$3;
 var $218=(($217+40)|0);
 var $219=HEAPF32[(($218)>>2)];
 var $220=$2;
 var $221=(($220+24)|0);
 var $222=HEAPF32[(($221)>>2)];
 var $223=($219)*($222);
 var $224=($216)+($223);
 var $225=$3;
 var $226=(($225+56)|0);
 var $227=HEAPF32[(($226)>>2)];
 var $228=$2;
 var $229=(($228+28)|0);
 var $230=HEAPF32[(($229)>>2)];
 var $231=($227)*($230);
 var $232=($224)+($231);
 var $233=$1;
 var $234=(($233+24)|0);
 HEAPF32[(($234)>>2)]=$232;
 var $235=$3;
 var $236=(($235+12)|0);
 var $237=HEAPF32[(($236)>>2)];
 var $238=$2;
 var $239=(($238+16)|0);
 var $240=HEAPF32[(($239)>>2)];
 var $241=($237)*($240);
 var $242=$3;
 var $243=(($242+28)|0);
 var $244=HEAPF32[(($243)>>2)];
 var $245=$2;
 var $246=(($245+20)|0);
 var $247=HEAPF32[(($246)>>2)];
 var $248=($244)*($247);
 var $249=($241)+($248);
 var $250=$3;
 var $251=(($250+44)|0);
 var $252=HEAPF32[(($251)>>2)];
 var $253=$2;
 var $254=(($253+24)|0);
 var $255=HEAPF32[(($254)>>2)];
 var $256=($252)*($255);
 var $257=($249)+($256);
 var $258=$3;
 var $259=(($258+60)|0);
 var $260=HEAPF32[(($259)>>2)];
 var $261=$2;
 var $262=(($261+28)|0);
 var $263=HEAPF32[(($262)>>2)];
 var $264=($260)*($263);
 var $265=($257)+($264);
 var $266=$1;
 var $267=(($266+28)|0);
 HEAPF32[(($267)>>2)]=$265;
 var $268=$3;
 var $269=(($268)|0);
 var $270=HEAPF32[(($269)>>2)];
 var $271=$2;
 var $272=(($271+32)|0);
 var $273=HEAPF32[(($272)>>2)];
 var $274=($270)*($273);
 var $275=$3;
 var $276=(($275+16)|0);
 var $277=HEAPF32[(($276)>>2)];
 var $278=$2;
 var $279=(($278+36)|0);
 var $280=HEAPF32[(($279)>>2)];
 var $281=($277)*($280);
 var $282=($274)+($281);
 var $283=$3;
 var $284=(($283+32)|0);
 var $285=HEAPF32[(($284)>>2)];
 var $286=$2;
 var $287=(($286+40)|0);
 var $288=HEAPF32[(($287)>>2)];
 var $289=($285)*($288);
 var $290=($282)+($289);
 var $291=$3;
 var $292=(($291+48)|0);
 var $293=HEAPF32[(($292)>>2)];
 var $294=$2;
 var $295=(($294+44)|0);
 var $296=HEAPF32[(($295)>>2)];
 var $297=($293)*($296);
 var $298=($290)+($297);
 var $299=$1;
 var $300=(($299+32)|0);
 HEAPF32[(($300)>>2)]=$298;
 var $301=$3;
 var $302=(($301+4)|0);
 var $303=HEAPF32[(($302)>>2)];
 var $304=$2;
 var $305=(($304+32)|0);
 var $306=HEAPF32[(($305)>>2)];
 var $307=($303)*($306);
 var $308=$3;
 var $309=(($308+20)|0);
 var $310=HEAPF32[(($309)>>2)];
 var $311=$2;
 var $312=(($311+36)|0);
 var $313=HEAPF32[(($312)>>2)];
 var $314=($310)*($313);
 var $315=($307)+($314);
 var $316=$3;
 var $317=(($316+36)|0);
 var $318=HEAPF32[(($317)>>2)];
 var $319=$2;
 var $320=(($319+40)|0);
 var $321=HEAPF32[(($320)>>2)];
 var $322=($318)*($321);
 var $323=($315)+($322);
 var $324=$3;
 var $325=(($324+52)|0);
 var $326=HEAPF32[(($325)>>2)];
 var $327=$2;
 var $328=(($327+44)|0);
 var $329=HEAPF32[(($328)>>2)];
 var $330=($326)*($329);
 var $331=($323)+($330);
 var $332=$1;
 var $333=(($332+36)|0);
 HEAPF32[(($333)>>2)]=$331;
 var $334=$3;
 var $335=(($334+8)|0);
 var $336=HEAPF32[(($335)>>2)];
 var $337=$2;
 var $338=(($337+32)|0);
 var $339=HEAPF32[(($338)>>2)];
 var $340=($336)*($339);
 var $341=$3;
 var $342=(($341+24)|0);
 var $343=HEAPF32[(($342)>>2)];
 var $344=$2;
 var $345=(($344+36)|0);
 var $346=HEAPF32[(($345)>>2)];
 var $347=($343)*($346);
 var $348=($340)+($347);
 var $349=$3;
 var $350=(($349+40)|0);
 var $351=HEAPF32[(($350)>>2)];
 var $352=$2;
 var $353=(($352+40)|0);
 var $354=HEAPF32[(($353)>>2)];
 var $355=($351)*($354);
 var $356=($348)+($355);
 var $357=$3;
 var $358=(($357+56)|0);
 var $359=HEAPF32[(($358)>>2)];
 var $360=$2;
 var $361=(($360+44)|0);
 var $362=HEAPF32[(($361)>>2)];
 var $363=($359)*($362);
 var $364=($356)+($363);
 var $365=$1;
 var $366=(($365+40)|0);
 HEAPF32[(($366)>>2)]=$364;
 var $367=$3;
 var $368=(($367+12)|0);
 var $369=HEAPF32[(($368)>>2)];
 var $370=$2;
 var $371=(($370+32)|0);
 var $372=HEAPF32[(($371)>>2)];
 var $373=($369)*($372);
 var $374=$3;
 var $375=(($374+28)|0);
 var $376=HEAPF32[(($375)>>2)];
 var $377=$2;
 var $378=(($377+36)|0);
 var $379=HEAPF32[(($378)>>2)];
 var $380=($376)*($379);
 var $381=($373)+($380);
 var $382=$3;
 var $383=(($382+44)|0);
 var $384=HEAPF32[(($383)>>2)];
 var $385=$2;
 var $386=(($385+40)|0);
 var $387=HEAPF32[(($386)>>2)];
 var $388=($384)*($387);
 var $389=($381)+($388);
 var $390=$3;
 var $391=(($390+60)|0);
 var $392=HEAPF32[(($391)>>2)];
 var $393=$2;
 var $394=(($393+44)|0);
 var $395=HEAPF32[(($394)>>2)];
 var $396=($392)*($395);
 var $397=($389)+($396);
 var $398=$1;
 var $399=(($398+44)|0);
 HEAPF32[(($399)>>2)]=$397;
 var $400=$3;
 var $401=(($400)|0);
 var $402=HEAPF32[(($401)>>2)];
 var $403=$2;
 var $404=(($403+48)|0);
 var $405=HEAPF32[(($404)>>2)];
 var $406=($402)*($405);
 var $407=$3;
 var $408=(($407+16)|0);
 var $409=HEAPF32[(($408)>>2)];
 var $410=$2;
 var $411=(($410+52)|0);
 var $412=HEAPF32[(($411)>>2)];
 var $413=($409)*($412);
 var $414=($406)+($413);
 var $415=$3;
 var $416=(($415+32)|0);
 var $417=HEAPF32[(($416)>>2)];
 var $418=$2;
 var $419=(($418+56)|0);
 var $420=HEAPF32[(($419)>>2)];
 var $421=($417)*($420);
 var $422=($414)+($421);
 var $423=$3;
 var $424=(($423+48)|0);
 var $425=HEAPF32[(($424)>>2)];
 var $426=$2;
 var $427=(($426+60)|0);
 var $428=HEAPF32[(($427)>>2)];
 var $429=($425)*($428);
 var $430=($422)+($429);
 var $431=$1;
 var $432=(($431+48)|0);
 HEAPF32[(($432)>>2)]=$430;
 var $433=$3;
 var $434=(($433+4)|0);
 var $435=HEAPF32[(($434)>>2)];
 var $436=$2;
 var $437=(($436+48)|0);
 var $438=HEAPF32[(($437)>>2)];
 var $439=($435)*($438);
 var $440=$3;
 var $441=(($440+20)|0);
 var $442=HEAPF32[(($441)>>2)];
 var $443=$2;
 var $444=(($443+52)|0);
 var $445=HEAPF32[(($444)>>2)];
 var $446=($442)*($445);
 var $447=($439)+($446);
 var $448=$3;
 var $449=(($448+36)|0);
 var $450=HEAPF32[(($449)>>2)];
 var $451=$2;
 var $452=(($451+56)|0);
 var $453=HEAPF32[(($452)>>2)];
 var $454=($450)*($453);
 var $455=($447)+($454);
 var $456=$3;
 var $457=(($456+52)|0);
 var $458=HEAPF32[(($457)>>2)];
 var $459=$2;
 var $460=(($459+60)|0);
 var $461=HEAPF32[(($460)>>2)];
 var $462=($458)*($461);
 var $463=($455)+($462);
 var $464=$1;
 var $465=(($464+52)|0);
 HEAPF32[(($465)>>2)]=$463;
 var $466=$3;
 var $467=(($466+8)|0);
 var $468=HEAPF32[(($467)>>2)];
 var $469=$2;
 var $470=(($469+48)|0);
 var $471=HEAPF32[(($470)>>2)];
 var $472=($468)*($471);
 var $473=$3;
 var $474=(($473+24)|0);
 var $475=HEAPF32[(($474)>>2)];
 var $476=$2;
 var $477=(($476+52)|0);
 var $478=HEAPF32[(($477)>>2)];
 var $479=($475)*($478);
 var $480=($472)+($479);
 var $481=$3;
 var $482=(($481+40)|0);
 var $483=HEAPF32[(($482)>>2)];
 var $484=$2;
 var $485=(($484+56)|0);
 var $486=HEAPF32[(($485)>>2)];
 var $487=($483)*($486);
 var $488=($480)+($487);
 var $489=$3;
 var $490=(($489+56)|0);
 var $491=HEAPF32[(($490)>>2)];
 var $492=$2;
 var $493=(($492+60)|0);
 var $494=HEAPF32[(($493)>>2)];
 var $495=($491)*($494);
 var $496=($488)+($495);
 var $497=$1;
 var $498=(($497+56)|0);
 HEAPF32[(($498)>>2)]=$496;
 var $499=$3;
 var $500=(($499+12)|0);
 var $501=HEAPF32[(($500)>>2)];
 var $502=$2;
 var $503=(($502+48)|0);
 var $504=HEAPF32[(($503)>>2)];
 var $505=($501)*($504);
 var $506=$3;
 var $507=(($506+28)|0);
 var $508=HEAPF32[(($507)>>2)];
 var $509=$2;
 var $510=(($509+52)|0);
 var $511=HEAPF32[(($510)>>2)];
 var $512=($508)*($511);
 var $513=($505)+($512);
 var $514=$3;
 var $515=(($514+44)|0);
 var $516=HEAPF32[(($515)>>2)];
 var $517=$2;
 var $518=(($517+56)|0);
 var $519=HEAPF32[(($518)>>2)];
 var $520=($516)*($519);
 var $521=($513)+($520);
 var $522=$3;
 var $523=(($522+60)|0);
 var $524=HEAPF32[(($523)>>2)];
 var $525=$2;
 var $526=(($525+60)|0);
 var $527=HEAPF32[(($526)>>2)];
 var $528=($524)*($527);
 var $529=($521)+($528);
 var $530=$1;
 var $531=(($530+60)|0);
 HEAPF32[(($531)>>2)]=$529;
 return;
}
function _vector_normalize($v) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $d;
   $1=$v;
   var $2=$1;
   var $3=(($2)|0);
   var $4=HEAPF32[(($3)>>2)];
   var $5=$1;
   var $6=(($5)|0);
   var $7=HEAPF32[(($6)>>2)];
   var $8=($4)*($7);
   var $9=$1;
   var $10=(($9+4)|0);
   var $11=HEAPF32[(($10)>>2)];
   var $12=$1;
   var $13=(($12+4)|0);
   var $14=HEAPF32[(($13)>>2)];
   var $15=($11)*($14);
   var $16=($8)+($15);
   var $17=$1;
   var $18=(($17+8)|0);
   var $19=HEAPF32[(($18)>>2)];
   var $20=$1;
   var $21=(($20+8)|0);
   var $22=HEAPF32[(($21)>>2)];
   var $23=($19)*($22);
   var $24=($16)+($23);
   var $25=Math.sqrt($24);
   $d=$25;
   var $26=$d;
   var $27=$26 != 0;
   if ($27) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $29=$d;
   var $32 = $29;label = 4; break;
  case 3: 
   var $32 = 1;label = 4; break;
  case 4: 
   var $32;
   $d=$32;
   var $33=$d;
   var $34=$1;
   var $35=(($34)|0);
   var $36=HEAPF32[(($35)>>2)];
   var $37=($36)/($33);
   HEAPF32[(($35)>>2)]=$37;
   var $38=$d;
   var $39=$1;
   var $40=(($39+4)|0);
   var $41=HEAPF32[(($40)>>2)];
   var $42=($41)/($38);
   HEAPF32[(($40)>>2)]=$42;
   var $43=$d;
   var $44=$1;
   var $45=(($44+8)|0);
   var $46=HEAPF32[(($45)>>2)];
   var $47=($46)/($43);
   HEAPF32[(($45)>>2)]=$47;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _matrix_vector_multiply($v, $r, $m) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$v;
 $2=$r;
 $3=$m;
 var $4=$1;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$3;
 var $8=(($7)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)*($9);
 var $11=$1;
 var $12=(($11+4)|0);
 var $13=HEAPF32[(($12)>>2)];
 var $14=$3;
 var $15=(($14+16)|0);
 var $16=HEAPF32[(($15)>>2)];
 var $17=($13)*($16);
 var $18=($10)+($17);
 var $19=$1;
 var $20=(($19+8)|0);
 var $21=HEAPF32[(($20)>>2)];
 var $22=$3;
 var $23=(($22+32)|0);
 var $24=HEAPF32[(($23)>>2)];
 var $25=($21)*($24);
 var $26=($18)+($25);
 var $27=$3;
 var $28=(($27+48)|0);
 var $29=HEAPF32[(($28)>>2)];
 var $30=($26)+($29);
 var $31=$2;
 var $32=(($31)|0);
 HEAPF32[(($32)>>2)]=$30;
 var $33=$1;
 var $34=(($33)|0);
 var $35=HEAPF32[(($34)>>2)];
 var $36=$3;
 var $37=(($36+4)|0);
 var $38=HEAPF32[(($37)>>2)];
 var $39=($35)*($38);
 var $40=$1;
 var $41=(($40+4)|0);
 var $42=HEAPF32[(($41)>>2)];
 var $43=$3;
 var $44=(($43+20)|0);
 var $45=HEAPF32[(($44)>>2)];
 var $46=($42)*($45);
 var $47=($39)+($46);
 var $48=$1;
 var $49=(($48+8)|0);
 var $50=HEAPF32[(($49)>>2)];
 var $51=$3;
 var $52=(($51+36)|0);
 var $53=HEAPF32[(($52)>>2)];
 var $54=($50)*($53);
 var $55=($47)+($54);
 var $56=$3;
 var $57=(($56+52)|0);
 var $58=HEAPF32[(($57)>>2)];
 var $59=($55)+($58);
 var $60=$2;
 var $61=(($60+4)|0);
 HEAPF32[(($61)>>2)]=$59;
 var $62=$1;
 var $63=(($62)|0);
 var $64=HEAPF32[(($63)>>2)];
 var $65=$3;
 var $66=(($65+8)|0);
 var $67=HEAPF32[(($66)>>2)];
 var $68=($64)*($67);
 var $69=$1;
 var $70=(($69+4)|0);
 var $71=HEAPF32[(($70)>>2)];
 var $72=$3;
 var $73=(($72+24)|0);
 var $74=HEAPF32[(($73)>>2)];
 var $75=($71)*($74);
 var $76=($68)+($75);
 var $77=$1;
 var $78=(($77+8)|0);
 var $79=HEAPF32[(($78)>>2)];
 var $80=$3;
 var $81=(($80+40)|0);
 var $82=HEAPF32[(($81)>>2)];
 var $83=($79)*($82);
 var $84=($76)+($83);
 var $85=$3;
 var $86=(($85+56)|0);
 var $87=HEAPF32[(($86)>>2)];
 var $88=($84)+($87);
 var $89=$2;
 var $90=(($89+8)|0);
 HEAPF32[(($90)>>2)]=$88;
 return;
}
function _inv_matrix_vector_multiply($v, $r, $m) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 $1=$v;
 $2=$r;
 $3=$m;
 var $4=$1;
 var $5=(($4)|0);
 var $6=HEAPF32[(($5)>>2)];
 var $7=$3;
 var $8=(($7)|0);
 var $9=HEAPF32[(($8)>>2)];
 var $10=($6)*($9);
 var $11=$1;
 var $12=(($11+4)|0);
 var $13=HEAPF32[(($12)>>2)];
 var $14=$3;
 var $15=(($14+4)|0);
 var $16=HEAPF32[(($15)>>2)];
 var $17=($13)*($16);
 var $18=($10)+($17);
 var $19=$1;
 var $20=(($19+8)|0);
 var $21=HEAPF32[(($20)>>2)];
 var $22=$3;
 var $23=(($22+8)|0);
 var $24=HEAPF32[(($23)>>2)];
 var $25=($21)*($24);
 var $26=($18)+($25);
 var $27=$2;
 var $28=(($27)|0);
 HEAPF32[(($28)>>2)]=$26;
 var $29=$1;
 var $30=(($29)|0);
 var $31=HEAPF32[(($30)>>2)];
 var $32=$3;
 var $33=(($32+16)|0);
 var $34=HEAPF32[(($33)>>2)];
 var $35=($31)*($34);
 var $36=$1;
 var $37=(($36+4)|0);
 var $38=HEAPF32[(($37)>>2)];
 var $39=$3;
 var $40=(($39+20)|0);
 var $41=HEAPF32[(($40)>>2)];
 var $42=($38)*($41);
 var $43=($35)+($42);
 var $44=$1;
 var $45=(($44+8)|0);
 var $46=HEAPF32[(($45)>>2)];
 var $47=$3;
 var $48=(($47+24)|0);
 var $49=HEAPF32[(($48)>>2)];
 var $50=($46)*($49);
 var $51=($43)+($50);
 var $52=$2;
 var $53=(($52+4)|0);
 HEAPF32[(($53)>>2)]=$51;
 var $54=$1;
 var $55=(($54)|0);
 var $56=HEAPF32[(($55)>>2)];
 var $57=$3;
 var $58=(($57+32)|0);
 var $59=HEAPF32[(($58)>>2)];
 var $60=($56)*($59);
 var $61=$1;
 var $62=(($61+4)|0);
 var $63=HEAPF32[(($62)>>2)];
 var $64=$3;
 var $65=(($64+36)|0);
 var $66=HEAPF32[(($65)>>2)];
 var $67=($63)*($66);
 var $68=($60)+($67);
 var $69=$1;
 var $70=(($69+8)|0);
 var $71=HEAPF32[(($70)>>2)];
 var $72=$3;
 var $73=(($72+40)|0);
 var $74=HEAPF32[(($73)>>2)];
 var $75=($71)*($74);
 var $76=($68)+($75);
 var $77=$2;
 var $78=(($77+8)|0);
 HEAPF32[(($78)>>2)]=$76;
 return;
}
function _calc_light_matrices($projection, $modelview, $frustum, $position) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 208)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $i;
   var $dx;
   var $dy;
   var $mvp=__stackBase__;
   var $tmp=(__stackBase__)+(64);
   var $farlight;
   var $scalex;
   var $scaley;
   var $offsetx;
   var $offsety;
   var $minx;
   var $miny;
   var $minz;
   var $maxx;
   var $maxy;
   var $maxz;
   var $v=(__stackBase__)+(128);
   var $cvm=(__stackBase__)+(144);
   $1=$projection;
   $2=$modelview;
   $3=$frustum;
   $4=$position;
   $i=0;
   var $5=$mvp;
   _memset($5, 0, 64);
   var $6=$tmp;
   _memset($6, 0, 64);
   $farlight=0;
   $scalex=0;
   $scaley=0;
   $offsetx=0;
   $offsety=0;
   $minx=1;
   $miny=1;
   $minz=1;
   $maxx=-1;
   $maxy=-1;
   $maxz=-1;
   _glMatrixMode(5889);
   _glPushMatrix();
   _glLoadIdentity();
   var $7=HEAPF32[((3872)>>2)];
   var $8=$7;
   var $9=HEAPF32[((3864)>>2)];
   var $10=$9;
   var $11=HEAPF32[((3880)>>2)];
   var $12=$11;
   _gluPerspective($8, 1, $10, $12);
   var $13=$1;
   _glGetFloatv(2983, $13);
   _glPopMatrix();
   _glMatrixMode(5888);
   _glPushMatrix();
   _glLoadIdentity();
   var $14=$4;
   var $15=(($14)|0);
   var $16=HEAPF32[(($15)>>2)];
   var $17=$16;
   var $18=$4;
   var $19=(($18+4)|0);
   var $20=HEAPF32[(($19)>>2)];
   var $21=$20;
   var $22=$4;
   var $23=(($22+8)|0);
   var $24=HEAPF32[(($23)>>2)];
   var $25=$24;
   _gluLookAt($17, $21, $25, 0, 0, 0, 0, 1, 0);
   var $26=$2;
   _glGetFloatv(2982, $26);
   _glPopMatrix();
   var $27=(($mvp)|0);
   var $28=$1;
   var $29=$2;
   _multiply_matrices($27, $28, $29);
   $i=0;
   label = 2; break;
  case 2: 
   var $31=$i;
   var $32=(($31)|(0)) < 8;
   if ($32) { label = 3; break; } else { label = 23; break; }
  case 3: 
   var $34=(($v)|0);
   var $35=(($mvp)|0);
   var $36=$i;
   var $37=$3;
   var $38=(($37+($36<<4))|0);
   var $39=(($38)|0);
   _multiply_matrix_vector($34, $35, $39);
   var $40=(($v+12)|0);
   var $41=HEAPF32[(($40)>>2)];
   var $42=(($v)|0);
   var $43=HEAPF32[(($42)>>2)];
   var $44=($43)/($41);
   HEAPF32[(($42)>>2)]=$44;
   var $45=(($v+12)|0);
   var $46=HEAPF32[(($45)>>2)];
   var $47=(($v+4)|0);
   var $48=HEAPF32[(($47)>>2)];
   var $49=($48)/($46);
   HEAPF32[(($47)>>2)]=$49;
   var $50=(($v)|0);
   var $51=HEAPF32[(($50)>>2)];
   var $52=$maxx;
   var $53=$51 > $52;
   if ($53) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $55=(($v)|0);
   var $56=HEAPF32[(($55)>>2)];
   var $60 = $56;label = 6; break;
  case 5: 
   var $58=$maxx;
   var $60 = $58;label = 6; break;
  case 6: 
   var $60;
   $maxx=$60;
   var $61=(($v+4)|0);
   var $62=HEAPF32[(($61)>>2)];
   var $63=$maxy;
   var $64=$62 > $63;
   if ($64) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $66=(($v+4)|0);
   var $67=HEAPF32[(($66)>>2)];
   var $71 = $67;label = 9; break;
  case 8: 
   var $69=$maxy;
   var $71 = $69;label = 9; break;
  case 9: 
   var $71;
   $maxy=$71;
   var $72=(($v+8)|0);
   var $73=HEAPF32[(($72)>>2)];
   var $74=$maxz;
   var $75=$73 > $74;
   if ($75) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $77=(($v+8)|0);
   var $78=HEAPF32[(($77)>>2)];
   var $82 = $78;label = 12; break;
  case 11: 
   var $80=$maxz;
   var $82 = $80;label = 12; break;
  case 12: 
   var $82;
   $maxz=$82;
   var $83=(($v)|0);
   var $84=HEAPF32[(($83)>>2)];
   var $85=$minx;
   var $86=$84 < $85;
   if ($86) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $88=(($v)|0);
   var $89=HEAPF32[(($88)>>2)];
   var $93 = $89;label = 15; break;
  case 14: 
   var $91=$minx;
   var $93 = $91;label = 15; break;
  case 15: 
   var $93;
   $minx=$93;
   var $94=(($v+4)|0);
   var $95=HEAPF32[(($94)>>2)];
   var $96=$miny;
   var $97=$95 < $96;
   if ($97) { label = 16; break; } else { label = 17; break; }
  case 16: 
   var $99=(($v+4)|0);
   var $100=HEAPF32[(($99)>>2)];
   var $104 = $100;label = 18; break;
  case 17: 
   var $102=$miny;
   var $104 = $102;label = 18; break;
  case 18: 
   var $104;
   $miny=$104;
   var $105=(($v+8)|0);
   var $106=HEAPF32[(($105)>>2)];
   var $107=$minz;
   var $108=$106 < $107;
   if ($108) { label = 19; break; } else { label = 20; break; }
  case 19: 
   var $110=(($v+8)|0);
   var $111=HEAPF32[(($110)>>2)];
   var $115 = $111;label = 21; break;
  case 20: 
   var $113=$minz;
   var $115 = $113;label = 21; break;
  case 21: 
   var $115;
   $minz=$115;
   label = 22; break;
  case 22: 
   var $117=$i;
   var $118=((($117)+(1))|0);
   $i=$118;
   label = 2; break;
  case 23: 
   var $120=$maxx;
   var $121=_clamp($120, -1, 1);
   $maxx=$121;
   var $122=$maxy;
   var $123=_clamp($122, -1, 1);
   $maxy=$123;
   var $124=$minx;
   var $125=_clamp($124, -1, 1);
   $minx=$125;
   var $126=$miny;
   var $127=_clamp($126, -1, 1);
   $miny=$127;
   var $128=$maxz;
   var $129=($128)+(1);
   var $130=($129)+(1.5);
   $farlight=$130;
   _glMatrixMode(5889);
   _glPushMatrix();
   _glLoadIdentity();
   var $131=HEAPF32[((3872)>>2)];
   var $132=$131;
   var $133=HEAPF32[((3864)>>2)];
   var $134=$133;
   var $135=$farlight;
   var $136=$135;
   _gluPerspective($132, 1, $134, $136);
   var $137=$1;
   _glGetFloatv(2983, $137);
   _glPopMatrix();
   var $138=$maxx;
   var $139=$minx;
   var $140=($138)-($139);
   $dx=$140;
   var $141=$maxy;
   var $142=$miny;
   var $143=($141)-($142);
   $dy=$143;
   var $144=$dx;
   var $145=$144 != 0;
   if ($145) { label = 24; break; } else { label = 25; break; }
  case 24: 
   var $147=$dx;
   var $148=(2)/($147);
   var $151 = $148;label = 26; break;
  case 25: 
   var $151 = 0;label = 26; break;
  case 26: 
   var $151;
   $scalex=$151;
   var $152=$dy;
   var $153=$152 != 0;
   if ($153) { label = 27; break; } else { label = 28; break; }
  case 27: 
   var $155=$dy;
   var $156=(2)/($155);
   var $159 = $156;label = 29; break;
  case 28: 
   var $159 = 0;label = 29; break;
  case 29: 
   var $159;
   $scaley=$159;
   var $160=$maxx;
   var $161=$minx;
   var $162=($160)+($161);
   var $163=($162)*(-0.5);
   var $164=$scalex;
   var $165=($163)*($164);
   $offsetx=$165;
   var $166=$maxy;
   var $167=$miny;
   var $168=($166)+($167);
   var $169=($168)*(-0.5);
   var $170=$scaley;
   var $171=($169)*($170);
   $offsety=$171;
   var $172=(($cvm)|0);
   var $173=$scalex;
   HEAPF32[(($172)>>2)]=$173;
   var $174=(($172+4)|0);
   HEAPF32[(($174)>>2)]=0;
   var $175=(($174+4)|0);
   HEAPF32[(($175)>>2)]=0;
   var $176=(($175+4)|0);
   HEAPF32[(($176)>>2)]=0;
   var $177=(($176+4)|0);
   HEAPF32[(($177)>>2)]=0;
   var $178=(($177+4)|0);
   var $179=$scaley;
   HEAPF32[(($178)>>2)]=$179;
   var $180=(($178+4)|0);
   HEAPF32[(($180)>>2)]=0;
   var $181=(($180+4)|0);
   HEAPF32[(($181)>>2)]=0;
   var $182=(($181+4)|0);
   HEAPF32[(($182)>>2)]=0;
   var $183=(($182+4)|0);
   HEAPF32[(($183)>>2)]=0;
   var $184=(($183+4)|0);
   HEAPF32[(($184)>>2)]=1;
   var $185=(($184+4)|0);
   HEAPF32[(($185)>>2)]=0;
   var $186=(($185+4)|0);
   var $187=$offsetx;
   HEAPF32[(($186)>>2)]=$187;
   var $188=(($186+4)|0);
   var $189=$offsety;
   HEAPF32[(($188)>>2)]=$189;
   var $190=(($188+4)|0);
   HEAPF32[(($190)>>2)]=0;
   var $191=(($190+4)|0);
   HEAPF32[(($191)>>2)]=1;
   var $192=(($tmp)|0);
   var $193=$1;
   var $194=(($cvm)|0);
   _multiply_matrices($192, $193, $194);
   var $195=$1;
   var $196=$195;
   var $197=$tmp;
   assert(64 % 1 === 0);(_memcpy($196, $197, 64)|0);
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _calc_split_distances($distances, $count, $near, $far) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $i;
   var $lambda;
   var $ratio;
   var $idm;
   var $log;
   var $uniform;
   $1=$distances;
   $2=$count;
   $3=$near;
   $4=$far;
   $i=0;
   $lambda=0.6000000238418579;
   var $5=$4;
   var $6=$3;
   var $7=($5)/($6);
   $ratio=$7;
   $i=0;
   label = 2; break;
  case 2: 
   var $9=$i;
   var $10=$2;
   var $11=(($9)>>>(0)) < (($10)>>>(0));
   if ($11) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $13=$i;
   var $14=(($13)|(0));
   var $15=$2;
   var $16=(($15)>>>(0));
   var $17=($14)/($16);
   $idm=$17;
   var $18=$3;
   var $19=$ratio;
   var $20=$idm;
   var $21=Math.pow($19, $20);
   var $22=($18)*($21);
   $log=$22;
   var $23=$3;
   var $24=$4;
   var $25=$3;
   var $26=($24)-($25);
   var $27=$idm;
   var $28=($26)*($27);
   var $29=($23)+($28);
   $uniform=$29;
   var $30=$log;
   var $31=$lambda;
   var $32=($30)*($31);
   var $33=$uniform;
   var $34=$lambda;
   var $35=(1)-($34);
   var $36=($33)*($35);
   var $37=($32)+($36);
   var $38=$i;
   var $39=$1;
   var $40=(($39+($38<<2))|0);
   HEAPF32[(($40)>>2)]=$37;
   label = 4; break;
  case 4: 
   var $42=$i;
   var $43=((($42)+(1))|0);
   $i=$43;
   label = 2; break;
  case 5: 
   var $45=$3;
   var $46=$1;
   var $47=(($46)|0);
   HEAPF32[(($47)>>2)]=$45;
   var $48=$4;
   var $49=$2;
   var $50=$1;
   var $51=(($50+($49<<2))|0);
   HEAPF32[(($51)>>2)]=$48;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _calc_frustum_corners($frustum, $pos, $view, $up, $near, $far, $scale, $fov, $aspect) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 176)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $5;
   var $6;
   var $7;
   var $8;
   var $9;
   var $i;
   var $vx=__stackBase__;
   var $vy=(__stackBase__)+(16);
   var $vz=(__stackBase__)+(32);
   var $vt=(__stackBase__)+(48);
   var $vtx=(__stackBase__)+(64);
   var $vty=(__stackBase__)+(80);
   var $npc=(__stackBase__)+(96);
   var $fpc=(__stackBase__)+(112);
   var $c=(__stackBase__)+(128);
   var $smo;
   var $nearheight;
   var $farheight;
   var $nearwidth;
   var $farwidth;
   var $viewdir=(__stackBase__)+(144);
   var $updir=(__stackBase__)+(160);
   $1=$frustum;
   $2=$pos;
   $3=$view;
   $4=$up;
   $5=$near;
   $6=$far;
   $7=$scale;
   $8=$fov;
   $9=$aspect;
   var $10=$c;
   assert(16 % 1 === 0);HEAP32[(($10)>>2)]=HEAP32[((240)>>2)];HEAP32[((($10)+(4))>>2)]=HEAP32[((244)>>2)];HEAP32[((($10)+(8))>>2)]=HEAP32[((248)>>2)];HEAP32[((($10)+(12))>>2)]=HEAP32[((252)>>2)];
   var $11=$7;
   var $12=($11)-(1);
   $smo=$12;
   var $13=$viewdir;
   assert(16 % 1 === 0);HEAP32[(($13)>>2)]=HEAP32[((208)>>2)];HEAP32[((($13)+(4))>>2)]=HEAP32[((212)>>2)];HEAP32[((($13)+(8))>>2)]=HEAP32[((216)>>2)];HEAP32[((($13)+(12))>>2)]=HEAP32[((220)>>2)];
   var $14=$updir;
   assert(16 % 1 === 0);HEAP32[(($14)>>2)]=HEAP32[((224)>>2)];HEAP32[((($14)+(4))>>2)]=HEAP32[((228)>>2)];HEAP32[((($14)+(8))>>2)]=HEAP32[((232)>>2)];HEAP32[((($14)+(12))>>2)]=HEAP32[((236)>>2)];
   _glMatrixMode(5888);
   _glLoadIdentity();
   var $15=HEAPF32[((((4024)|0))>>2)];
   _glRotated($15, 1, 0, 0);
   var $16=HEAPF32[((((4028)|0))>>2)];
   _glRotated($16, 0, 1, 0);
   _glGetFloatv(2982, ((4808)|0));
   var $17=$3;
   var $18=(($viewdir)|0);
   _matrix_vector_multiply($17, ((5232)|0), $18);
   var $19=$4;
   var $20=(($updir)|0);
   _matrix_vector_multiply($19, ((5232)|0), $20);
   var $21=(($vz)|0);
   var $22=$3;
   var $23=$2;
   _vector_sub($21, $22, $23);
   var $24=(($vz)|0);
   _vector_normalize($24);
   var $25=(($vz+12)|0);
   HEAPF32[(($25)>>2)]=1;
   var $26=(($vx)|0);
   var $27=$4;
   var $28=(($vz)|0);
   _vector_cross($26, $27, $28);
   var $29=(($vx)|0);
   _vector_normalize($29);
   var $30=(($vx+12)|0);
   HEAPF32[(($30)>>2)]=1;
   var $31=(($vy)|0);
   var $32=(($vz)|0);
   var $33=(($vx)|0);
   _vector_cross($31, $32, $33);
   var $34=(($vy+12)|0);
   HEAPF32[(($34)>>2)]=1;
   var $35=$8;
   var $36=($35)*(0.01745329238474369);
   var $37=($36)*(0.5);
   var $38=Math.tan($37);
   var $39=$5;
   var $40=($38)*($39);
   $nearheight=$40;
   var $41=$nearheight;
   var $42=$9;
   var $43=($41)*($42);
   $nearwidth=$43;
   var $44=$8;
   var $45=($44)*(0.01745329238474369);
   var $46=($45)*(0.5);
   var $47=Math.tan($46);
   var $48=$6;
   var $49=($47)*($48);
   $farheight=$49;
   var $50=$farheight;
   var $51=$9;
   var $52=($50)*($51);
   $farwidth=$52;
   var $53=$vt;
   var $54=$vz;
   assert(16 % 1 === 0);HEAP32[(($53)>>2)]=HEAP32[(($54)>>2)];HEAP32[((($53)+(4))>>2)]=HEAP32[((($54)+(4))>>2)];HEAP32[((($53)+(8))>>2)]=HEAP32[((($54)+(8))>>2)];HEAP32[((($53)+(12))>>2)]=HEAP32[((($54)+(12))>>2)];
   var $55=(($vt)|0);
   var $56=$5;
   _vector_scale($55, $56);
   var $57=(($npc)|0);
   var $58=$2;
   var $59=(($vt)|0);
   _vector_add($57, $58, $59);
   var $60=$vt;
   var $61=$vz;
   assert(16 % 1 === 0);HEAP32[(($60)>>2)]=HEAP32[(($61)>>2)];HEAP32[((($60)+(4))>>2)]=HEAP32[((($61)+(4))>>2)];HEAP32[((($60)+(8))>>2)]=HEAP32[((($61)+(8))>>2)];HEAP32[((($60)+(12))>>2)]=HEAP32[((($61)+(12))>>2)];
   var $62=(($vt)|0);
   var $63=$6;
   _vector_scale($62, $63);
   var $64=(($fpc)|0);
   var $65=$2;
   var $66=(($vt)|0);
   _vector_add($64, $65, $66);
   var $67=$vtx;
   var $68=$vx;
   assert(16 % 1 === 0);HEAP32[(($67)>>2)]=HEAP32[(($68)>>2)];HEAP32[((($67)+(4))>>2)]=HEAP32[((($68)+(4))>>2)];HEAP32[((($67)+(8))>>2)]=HEAP32[((($68)+(8))>>2)];HEAP32[((($67)+(12))>>2)]=HEAP32[((($68)+(12))>>2)];
   var $69=(($vtx)|0);
   var $70=$nearwidth;
   _vector_scale($69, $70);
   var $71=$vty;
   var $72=$vy;
   assert(16 % 1 === 0);HEAP32[(($71)>>2)]=HEAP32[(($72)>>2)];HEAP32[((($71)+(4))>>2)]=HEAP32[((($72)+(4))>>2)];HEAP32[((($71)+(8))>>2)]=HEAP32[((($72)+(8))>>2)];HEAP32[((($71)+(12))>>2)]=HEAP32[((($72)+(12))>>2)];
   var $73=(($vty)|0);
   var $74=$nearheight;
   _vector_scale($73, $74);
   var $75=(($vt)|0);
   var $76=(($vtx)|0);
   var $77=(($vty)|0);
   _vector_sub($75, $76, $77);
   var $78=$1;
   var $79=(($78)|0);
   var $80=(($79)|0);
   var $81=(($npc)|0);
   var $82=(($vt)|0);
   _vector_sub($80, $81, $82);
   var $83=(($vt)|0);
   var $84=(($vtx)|0);
   var $85=(($vty)|0);
   _vector_add($83, $84, $85);
   var $86=$1;
   var $87=(($86+16)|0);
   var $88=(($87)|0);
   var $89=(($npc)|0);
   var $90=(($vt)|0);
   _vector_sub($88, $89, $90);
   var $91=(($vt)|0);
   var $92=(($vtx)|0);
   var $93=(($vty)|0);
   _vector_add($91, $92, $93);
   var $94=$1;
   var $95=(($94+32)|0);
   var $96=(($95)|0);
   var $97=(($npc)|0);
   var $98=(($vt)|0);
   _vector_add($96, $97, $98);
   var $99=(($vt)|0);
   var $100=(($vtx)|0);
   var $101=(($vty)|0);
   _vector_sub($99, $100, $101);
   var $102=$1;
   var $103=(($102+48)|0);
   var $104=(($103)|0);
   var $105=(($npc)|0);
   var $106=(($vt)|0);
   _vector_add($104, $105, $106);
   var $107=$vtx;
   var $108=$vx;
   assert(16 % 1 === 0);HEAP32[(($107)>>2)]=HEAP32[(($108)>>2)];HEAP32[((($107)+(4))>>2)]=HEAP32[((($108)+(4))>>2)];HEAP32[((($107)+(8))>>2)]=HEAP32[((($108)+(8))>>2)];HEAP32[((($107)+(12))>>2)]=HEAP32[((($108)+(12))>>2)];
   var $109=(($vtx)|0);
   var $110=$farwidth;
   _vector_scale($109, $110);
   var $111=$vty;
   var $112=$vy;
   assert(16 % 1 === 0);HEAP32[(($111)>>2)]=HEAP32[(($112)>>2)];HEAP32[((($111)+(4))>>2)]=HEAP32[((($112)+(4))>>2)];HEAP32[((($111)+(8))>>2)]=HEAP32[((($112)+(8))>>2)];HEAP32[((($111)+(12))>>2)]=HEAP32[((($112)+(12))>>2)];
   var $113=(($vty)|0);
   var $114=$farheight;
   _vector_scale($113, $114);
   var $115=(($vt)|0);
   var $116=(($vtx)|0);
   var $117=(($vty)|0);
   _vector_sub($115, $116, $117);
   var $118=$1;
   var $119=(($118+64)|0);
   var $120=(($119)|0);
   var $121=(($fpc)|0);
   var $122=(($vt)|0);
   _vector_sub($120, $121, $122);
   var $123=(($vt)|0);
   var $124=(($vtx)|0);
   var $125=(($vty)|0);
   _vector_add($123, $124, $125);
   var $126=$1;
   var $127=(($126+80)|0);
   var $128=(($127)|0);
   var $129=(($fpc)|0);
   var $130=(($vt)|0);
   _vector_sub($128, $129, $130);
   var $131=(($vt)|0);
   var $132=(($vtx)|0);
   var $133=(($vty)|0);
   _vector_add($131, $132, $133);
   var $134=$1;
   var $135=(($134+96)|0);
   var $136=(($135)|0);
   var $137=(($fpc)|0);
   var $138=(($vt)|0);
   _vector_add($136, $137, $138);
   var $139=(($vt)|0);
   var $140=(($vtx)|0);
   var $141=(($vty)|0);
   _vector_sub($139, $140, $141);
   var $142=$1;
   var $143=(($142+112)|0);
   var $144=(($143)|0);
   var $145=(($fpc)|0);
   var $146=(($vt)|0);
   _vector_add($144, $145, $146);
   $i=0;
   label = 2; break;
  case 2: 
   var $148=$i;
   var $149=(($148)|(0)) < 8;
   if ($149) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $151=(($c)|0);
   var $152=(($c)|0);
   var $153=$i;
   var $154=$1;
   var $155=(($154+($153<<4))|0);
   var $156=(($155)|0);
   _vector_add($151, $152, $156);
   label = 4; break;
  case 4: 
   var $158=$i;
   var $159=((($158)+(1))|0);
   $i=$159;
   label = 2; break;
  case 5: 
   var $161=(($c)|0);
   var $162=HEAPF32[(($161)>>2)];
   var $163=($162)/(8);
   HEAPF32[(($161)>>2)]=$163;
   var $164=(($c+4)|0);
   var $165=HEAPF32[(($164)>>2)];
   var $166=($165)/(8);
   HEAPF32[(($164)>>2)]=$166;
   var $167=(($c+8)|0);
   var $168=HEAPF32[(($167)>>2)];
   var $169=($168)/(8);
   HEAPF32[(($167)>>2)]=$169;
   $i=0;
   label = 6; break;
  case 6: 
   var $171=$i;
   var $172=(($171)|(0)) < 8;
   if ($172) { label = 7; break; } else { label = 9; break; }
  case 7: 
   var $174=(($vt)|0);
   var $175=$i;
   var $176=$1;
   var $177=(($176+($175<<4))|0);
   var $178=(($177)|0);
   var $179=(($c)|0);
   _vector_sub($174, $178, $179);
   var $180=(($vt)|0);
   var $181=$smo;
   _vector_scale($180, $181);
   var $182=(($vtx)|0);
   var $183=$i;
   var $184=$1;
   var $185=(($184+($183<<4))|0);
   var $186=(($185)|0);
   var $187=(($vt)|0);
   _vector_add($182, $186, $187);
   var $188=$i;
   var $189=$1;
   var $190=(($189+($188<<4))|0);
   var $191=(($190)|0);
   var $192=$191;
   var $193=$vtx;
   assert(16 % 1 === 0);HEAP32[(($192)>>2)]=HEAP32[(($193)>>2)];HEAP32[((($192)+(4))>>2)]=HEAP32[((($193)+(4))>>2)];HEAP32[((($192)+(8))>>2)]=HEAP32[((($193)+(8))>>2)];HEAP32[((($192)+(12))>>2)]=HEAP32[((($193)+(12))>>2)];
   label = 8; break;
  case 8: 
   var $195=$i;
   var $196=((($195)+(1))|0);
   $i=$196;
   label = 6; break;
  case 9: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _bind_shadowmap($projection, $modelview) {
 var label = 0;
 var $1;
 var $2;
 $1=$projection;
 $2=$modelview;
 _glEnable(2896);
 _set_eye_linear_texgen();
 _set_texgen(1);
 var $3=HEAP32[((3768)>>2)];
 _glActiveTextureARB($3);
 _glMatrixMode(5890);
 _glLoadMatrixf(((256)|0));
 var $4=$1;
 _glMultMatrixf($4);
 var $5=$2;
 _glMultMatrixf($5);
 _glMatrixMode(5888);
 _glEnable(3553);
 var $6=HEAP32[((4736)>>2)];
 _glBindTexture(3553, $6);
 return;
}
function _unbind_shadowmap() {
 var label = 0;
 var $1=HEAP32[((3976)>>2)];
 _glActiveTextureARB($1);
 _glDisable(3553);
 _set_texgen(0);
 _glMatrixMode(5890);
 _glLoadIdentity();
 return;
}
function _render_scene_plain() {
 var label = 0;
 _glClear(16640);
 _glMatrixMode(5889);
 _glLoadIdentity();
 var $1=HEAPF32[((4080)>>2)];
 var $2=$1;
 var $3=HEAPF32[((4096)>>2)];
 var $4=$3;
 var $5=HEAPF32[((4072)>>2)];
 var $6=$5;
 var $7=HEAPF32[((4088)>>2)];
 var $8=$7;
 _gluPerspective($2, $4, $6, $8);
 _glGetFloatv(2983, ((5168)|0));
 _glMatrixMode(5888);
 _glLoadIdentity();
 var $9=HEAPF32[((((4040)|0))>>2)];
 var $10=HEAPF32[((((4044)|0))>>2)];
 var $11=HEAPF32[((((4048)|0))>>2)];
 _glTranslated($9, $10, $11);
 var $12=HEAPF32[((((4024)|0))>>2)];
 _glRotated($12, 1, 0, 0);
 var $13=HEAPF32[((((4028)|0))>>2)];
 _glRotated($13, 0, 1, 0);
 _glGetFloatv(2982, ((4808)|0));
 _glGetFloatv(2982, ((5232)|0));
 _glEnable(2896);
 _glEnable(16384);
 _glDisable(2884);
 _render_scene(1);
 _glDisable(16384);
 _glDisable(2896);
 return;
}
function _render_into_depthmap($width, $height, $projection, $modelview) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 var $2;
 var $3;
 var $4;
 var $viewport=__stackBase__;
 $1=$width;
 $2=$height;
 $3=$projection;
 $4=$modelview;
 var $5=(($viewport)|0);
 _glGetIntegerv(2978, $5);
 var $6=HEAP32[((4744)>>2)];
 var $7=_glBindFramebufferEXT(36160, $6);
 var $8=$1;
 var $9=$2;
 _glViewport(0, 0, $8, $9);
 _glClear(256);
 _glDisable(2896);
 _glDisable(3553);
 _glDisable(3008);
 var $10=HEAPF32[((3808)>>2)];
 var $11=HEAPF32[((3816)>>2)];
 _glPolygonOffset($10, $11);
 _glEnable(32823);
 _glDepthMask(1);
 _glDepthFunc(513);
 _glEnable(2884);
 _glCullFace(1029);
 _glMatrixMode(5889);
 var $12=$3;
 _glLoadMatrixf($12);
 _glMatrixMode(5888);
 var $13=$4;
 _glLoadMatrixf($13);
 _render_scene(0);
 _glDisable(2884);
 _glDepthFunc(515);
 _glDisable(32823);
 _glEnable(2896);
 var $14=_glBindFramebufferEXT(36160, 0);
 var $15=(($viewport)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=(($viewport+4)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=(($viewport+8)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=(($viewport+12)|0);
 var $22=HEAP32[(($21)>>2)];
 _glViewport($16, $18, $20, $22);
 STACKTOP = __stackBase__;
 return;
}
function _render_scene_with_pssm($frustum, $projection, $modelview, $near, $far) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 var $4;
 var $5;
 $1=$frustum;
 $2=$projection;
 $3=$modelview;
 $4=$near;
 $5=$far;
 _glMatrixMode(5889);
 _glLoadIdentity();
 var $6=HEAPF32[((4080)>>2)];
 var $7=$6;
 var $8=HEAPF32[((4096)>>2)];
 var $9=$8;
 var $10=$4;
 var $11=$10;
 var $12=$5;
 var $13=$12;
 _gluPerspective($7, $9, $11, $13);
 _glGetFloatv(2983, ((5168)|0));
 _glMatrixMode(5888);
 _glLoadIdentity();
 var $14=HEAPF32[((((4040)|0))>>2)];
 var $15=HEAPF32[((((4044)|0))>>2)];
 var $16=HEAPF32[((((4048)|0))>>2)];
 _glTranslated($14, $15, $16);
 var $17=HEAPF32[((((4024)|0))>>2)];
 _glRotated($17, 1, 0, 0);
 var $18=HEAPF32[((((4028)|0))>>2)];
 _glRotated($18, 0, 1, 0);
 _glGetFloatv(2982, ((4808)|0));
 _glGetFloatv(2982, ((5232)|0));
 var $19=$2;
 var $20=$3;
 _bind_shadowmap($19, $20);
 _render_scene(1);
 _unbind_shadowmap();
 return;
}
function _render_scene_pssm() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 128)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $i;
   var $frustum=__stackBase__;
   var $near;
   var $far;
   $i=0;
   _glClear(16640);
   var $1=HEAP32[((3720)>>2)];
   var $2=HEAPF32[((3880)>>2)];
   _calc_split_distances(((4672)|0), $1, 1, $2);
   $i=0;
   label = 2; break;
  case 2: 
   var $4=$i;
   var $5=HEAP32[((3720)>>2)];
   var $6=(($4)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $8=$i;
   var $9=(($8)|0);
   var $10=((4672+($9<<2))|0);
   var $11=HEAPF32[(($10)>>2)];
   $near=$11;
   var $12=$i;
   var $13=((($12)+(1))|0);
   var $14=((4672+($13<<2))|0);
   var $15=HEAPF32[(($14)>>2)];
   $far=$15;
   var $16=(($frustum)|0);
   var $17=$far;
   var $18=HEAPF32[((4096)>>2)];
   _calc_frustum_corners($16, ((4040)|0), ((3992)|0), ((4008)|0), 1, $17, 1, 45, $18);
   var $19=(($frustum)|0);
   _calc_light_matrices(((4880)|0), ((4976)|0), $19, ((3848)|0));
   var $20=HEAP32[((3752)>>2)];
   var $21=HEAP32[((3760)>>2)];
   _render_into_depthmap($20, $21, ((4880)|0), ((4976)|0));
   var $22=(($frustum)|0);
   var $23=$near;
   var $24=$far;
   _render_scene_with_pssm($22, ((4880)|0), ((4976)|0), $23, $24);
   label = 4; break;
  case 4: 
   var $26=$i;
   var $27=((($26)+(1))|0);
   $i=$27;
   label = 2; break;
  case 5: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _recompute() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 352)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $err;
   var $a;
   var $values=__stackBase__;
   var $sizes=(__stackBase__)+(128);
   var $global=(__stackBase__)+(256);
   var $local=(__stackBase__)+(264);
   var $dimx=(__stackBase__)+(272);
   var $dimy=(__stackBase__)+(280);
   var $freq=(__stackBase__)+(288);
   var $amp=(__stackBase__)+(296);
   var $phase=(__stackBase__)+(304);
   var $lacunarity=(__stackBase__)+(312);
   var $increment=(__stackBase__)+(320);
   var $octaves=(__stackBase__)+(328);
   var $roughness=(__stackBase__)+(336);
   var $v;
   var $s;
   var $count=(__stackBase__)+(344);
   var $uiSplitCount;
   var $uiActive;
   var $uiQueued;
   $err=0;
   var $2=HEAP32[((5312)>>2)];
   var $3=(($2)>>>(0));
   HEAPF32[(($dimx)>>2)]=$3;
   var $4=HEAP32[((5304)>>2)];
   var $5=(($4)>>>(0));
   HEAPF32[(($dimy)>>2)]=$5;
   var $6=HEAPF32[((3968)>>2)];
   HEAPF32[(($freq)>>2)]=$6;
   var $7=HEAPF32[((4120)>>2)];
   HEAPF32[(($amp)>>2)]=$7;
   var $8=HEAPF32[((3824)>>2)];
   HEAPF32[(($phase)>>2)]=$8;
   var $9=HEAPF32[((3888)>>2)];
   HEAPF32[(($lacunarity)>>2)]=$9;
   var $10=HEAPF32[((3920)>>2)];
   HEAPF32[(($increment)>>2)]=$10;
   var $11=HEAPF32[((3832)>>2)];
   HEAPF32[(($octaves)>>2)]=$11;
   var $12=HEAPF32[((3784)>>2)];
   HEAPF32[(($roughness)>>2)]=$12;
   $v=0;
   $s=0;
   var $13=HEAP32[((4640)>>2)];
   HEAP32[(($count)>>2)]=$13;
   var $14=$v;
   var $15=((($14)+(1))|0);
   $v=$15;
   var $16=(($values+($14<<2))|0);
   HEAP32[(($16)>>2)]=5056;
   var $17=$v;
   var $18=((($17)+(1))|0);
   $v=$18;
   var $19=(($values+($17<<2))|0);
   HEAP32[(($19)>>2)]=4776;
   var $20=$v;
   var $21=((($20)+(1))|0);
   $v=$21;
   var $22=(($values+($20<<2))|0);
   HEAP32[(($22)>>2)]=4768;
   var $23=$dimx;
   var $24=$v;
   var $25=((($24)+(1))|0);
   $v=$25;
   var $26=(($values+($24<<2))|0);
   HEAP32[(($26)>>2)]=$23;
   var $27=$dimy;
   var $28=$v;
   var $29=((($28)+(1))|0);
   $v=$29;
   var $30=(($values+($28<<2))|0);
   HEAP32[(($30)>>2)]=$27;
   var $31=$freq;
   var $32=$v;
   var $33=((($32)+(1))|0);
   $v=$33;
   var $34=(($values+($32<<2))|0);
   HEAP32[(($34)>>2)]=$31;
   var $35=$amp;
   var $36=$v;
   var $37=((($36)+(1))|0);
   $v=$37;
   var $38=(($values+($36<<2))|0);
   HEAP32[(($38)>>2)]=$35;
   var $39=$phase;
   var $40=$v;
   var $41=((($40)+(1))|0);
   $v=$41;
   var $42=(($values+($40<<2))|0);
   HEAP32[(($42)>>2)]=$39;
   var $43=$lacunarity;
   var $44=$v;
   var $45=((($44)+(1))|0);
   $v=$45;
   var $46=(($values+($44<<2))|0);
   HEAP32[(($46)>>2)]=$43;
   var $47=$increment;
   var $48=$v;
   var $49=((($48)+(1))|0);
   $v=$49;
   var $50=(($values+($48<<2))|0);
   HEAP32[(($50)>>2)]=$47;
   var $51=$octaves;
   var $52=$v;
   var $53=((($52)+(1))|0);
   $v=$53;
   var $54=(($values+($52<<2))|0);
   HEAP32[(($54)>>2)]=$51;
   var $55=$roughness;
   var $56=$v;
   var $57=((($56)+(1))|0);
   $v=$57;
   var $58=(($values+($56<<2))|0);
   HEAP32[(($58)>>2)]=$55;
   var $59=$count;
   var $60=$v;
   var $61=((($60)+(1))|0);
   $v=$61;
   var $62=(($values+($60<<2))|0);
   HEAP32[(($62)>>2)]=$59;
   var $63=$s;
   var $64=((($63)+(1))|0);
   $s=$64;
   var $65=(($sizes+($63<<2))|0);
   HEAP32[(($65)>>2)]=4;
   var $66=$s;
   var $67=((($66)+(1))|0);
   $s=$67;
   var $68=(($sizes+($66<<2))|0);
   HEAP32[(($68)>>2)]=4;
   var $69=$s;
   var $70=((($69)+(1))|0);
   $s=$70;
   var $71=(($sizes+($69<<2))|0);
   HEAP32[(($71)>>2)]=4;
   var $72=$s;
   var $73=((($72)+(1))|0);
   $s=$73;
   var $74=(($sizes+($72<<2))|0);
   HEAP32[(($74)>>2)]=4;
   var $75=$s;
   var $76=((($75)+(1))|0);
   $s=$76;
   var $77=(($sizes+($75<<2))|0);
   HEAP32[(($77)>>2)]=4;
   var $78=$s;
   var $79=((($78)+(1))|0);
   $s=$79;
   var $80=(($sizes+($78<<2))|0);
   HEAP32[(($80)>>2)]=4;
   var $81=$s;
   var $82=((($81)+(1))|0);
   $s=$82;
   var $83=(($sizes+($81<<2))|0);
   HEAP32[(($83)>>2)]=4;
   var $84=$s;
   var $85=((($84)+(1))|0);
   $s=$85;
   var $86=(($sizes+($84<<2))|0);
   HEAP32[(($86)>>2)]=4;
   var $87=$s;
   var $88=((($87)+(1))|0);
   $s=$88;
   var $89=(($sizes+($87<<2))|0);
   HEAP32[(($89)>>2)]=4;
   var $90=$s;
   var $91=((($90)+(1))|0);
   $s=$91;
   var $92=(($sizes+($90<<2))|0);
   HEAP32[(($92)>>2)]=4;
   var $93=$s;
   var $94=((($93)+(1))|0);
   $s=$94;
   var $95=(($sizes+($93<<2))|0);
   HEAP32[(($95)>>2)]=4;
   var $96=$s;
   var $97=((($96)+(1))|0);
   $s=$97;
   var $98=(($sizes+($96<<2))|0);
   HEAP32[(($98)>>2)]=4;
   var $99=$s;
   var $100=((($99)+(1))|0);
   $s=$100;
   var $101=(($sizes+($99<<2))|0);
   HEAP32[(($101)>>2)]=4;
   var $102=$s;
   var $103=$v;
   var $104=(($102)|(0))!=(($103)|(0));
   if ($104) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $106=_printf(((3456)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=-1;
   label = 19; break;
  case 3: 
   $err=0;
   $a=0;
   label = 4; break;
  case 4: 
   var $109=$a;
   var $110=$s;
   var $111=(($109)>>>(0)) < (($110)>>>(0));
   if ($111) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $113=HEAP32[((5112)>>2)];
   var $114=$a;
   var $115=$a;
   var $116=(($sizes+($115<<2))|0);
   var $117=HEAP32[(($116)>>2)];
   var $118=$a;
   var $119=(($values+($118<<2))|0);
   var $120=HEAP32[(($119)>>2)];
   var $121=_clSetKernelArg($113, $114, $117, $120);
   var $122=$err;
   var $123=$122 | $121;
   $err=$123;
   label = 6; break;
  case 6: 
   var $125=$a;
   var $126=((($125)+(1))|0);
   $a=$126;
   label = 4; break;
  case 7: 
   var $128=$err;
   var $129=(($128)|(0))!=0;
   if ($129) { label = 8; break; } else { label = 9; break; }
  case 8: 
   $1=-16;
   label = 19; break;
  case 9: 
   var $132=HEAP32[((4640)>>2)];
   var $133=(($132)>>>(0));
   var $134=Math.sqrt($133);
   var $135=Math.ceil($134);
   var $136=($135>=0 ? Math.floor($135) : Math.ceil($135));
   $uiSplitCount=$136;
   var $137=HEAP32[((4872)>>2)];
   var $138=HEAP32[((3936)>>2)];
   var $139=((((($137)|(0)))/((($138)|(0))))&-1);
   $uiActive=$139;
   var $140=$uiActive;
   var $141=(($140)>>>(0)) < 1;
   if ($141) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $146 = 1;label = 12; break;
  case 11: 
   var $144=$uiActive;
   var $146 = $144;label = 12; break;
  case 12: 
   var $146;
   $uiActive=$146;
   var $147=HEAP32[((4872)>>2)];
   var $148=$uiActive;
   var $149=Math.floor(((($147)>>>(0)))/((($148)>>>(0))));
   $uiQueued=$149;
   var $150=$uiActive;
   var $151=(($local)|0);
   HEAP32[(($151)>>2)]=$150;
   var $152=$uiQueued;
   var $153=(($local+4)|0);
   HEAP32[(($153)>>2)]=$152;
   var $154=$uiSplitCount;
   var $155=$uiActive;
   var $156=_divide_up($154, $155);
   var $157=$uiActive;
   var $158=(Math.imul($156,$157)|0);
   var $159=(($global)|0);
   HEAP32[(($159)>>2)]=$158;
   var $160=$uiSplitCount;
   var $161=$uiQueued;
   var $162=_divide_up($160, $161);
   var $163=$uiQueued;
   var $164=(Math.imul($162,$163)|0);
   var $165=(($global+4)|0);
   HEAP32[(($165)>>2)]=$164;
   var $166=HEAP32[((5144)>>2)];
   var $167=HEAP32[((5112)>>2)];
   var $168=(($global)|0);
   var $169=(($local)|0);
   var $170=_clEnqueueNDRangeKernel($166, $167, 2, 0, $168, $169, 0, 0, 0);
   $err=$170;
   var $171=$err;
   var $172=(($171)|(0))!=0;
   if ($172) { label = 13; break; } else { label = 14; break; }
  case 13: 
   $1=-17;
   label = 19; break;
  case 14: 
   var $175=HEAP32[((5144)>>2)];
   var $176=HEAP32[((4768)>>2)];
   var $177=HEAP32[((4648)>>2)];
   var $178=HEAP32[((4664)>>2)];
   var $179=$178;
   var $180=_clEnqueueReadBuffer($175, $176, 1, 0, $177, $179, 0, 0, 0);
   $err=$180;
   var $181=$err;
   var $182=(($181)|(0))!=0;
   if ($182) { label = 15; break; } else { label = 16; break; }
  case 15: 
   $1=-19;
   label = 19; break;
  case 16: 
   var $185=HEAP32[((5144)>>2)];
   var $186=HEAP32[((4776)>>2)];
   var $187=HEAP32[((4648)>>2)];
   var $188=HEAP32[((4792)>>2)];
   var $189=$188;
   var $190=_clEnqueueReadBuffer($185, $186, 1, 0, $187, $189, 0, 0, 0);
   $err=$190;
   var $191=$err;
   var $192=(($191)|(0))!=0;
   if ($192) { label = 17; break; } else { label = 18; break; }
  case 17: 
   $1=-19;
   label = 19; break;
  case 18: 
   $1=0;
   label = 19; break;
  case 19: 
   var $196=$1;
   STACKTOP = __stackBase__;
   return $196;
  default: assert(0, "bad label: " + label);
 }
}
function _shutdown_opencl() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=HEAP32[((5144)>>2)];
   var $2=_clFinish($1);
   var $3=HEAP32[((5056)>>2)];
   var $4=_clReleaseMemObject($3);
   var $5=HEAP32[((4768)>>2)];
   var $6=_clReleaseMemObject($5);
   var $7=HEAP32[((4776)>>2)];
   var $8=_clReleaseMemObject($7);
   var $9=HEAP32[((5112)>>2)];
   var $10=_clReleaseKernel($9);
   var $11=HEAP32[((5104)>>2)];
   var $12=_clReleaseProgram($11);
   var $13=HEAP32[((5136)>>2)];
   var $14=_clReleaseContext($13);
   var $15=HEAP32[((4664)>>2)];
   var $16=(($15)|(0))!=0;
   if ($16) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $18=HEAP32[((4664)>>2)];
   var $19=$18;
   _free($19);
   label = 3; break;
  case 3: 
   var $21=HEAP32[((4792)>>2)];
   var $22=(($21)|(0))!=0;
   if ($22) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $24=HEAP32[((4792)>>2)];
   var $25=$24;
   _free($25);
   label = 5; break;
  case 5: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _report_stats($start$0, $start$1, $end$0, $end$1) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=__stackBase__;
   var $2=(__stackBase__)+(8);
   var $fMs;
   var $fFps;
   var $st$0$0=(($1)|0);
   HEAP32[(($st$0$0)>>2)]=$start$0;
   var $st$1$1=(($1+4)|0);
   HEAP32[(($st$1$1)>>2)]=$start$1;
   var $st$2$0=(($2)|0);
   HEAP32[(($st$2$0)>>2)]=$end$0;
   var $st$3$1=(($2+4)|0);
   HEAP32[(($st$3$1)>>2)]=$end$1;
   var $ld$4$0=(($2)|0);
   var $3$0=HEAP32[(($ld$4$0)>>2)];
   var $ld$5$1=(($2+4)|0);
   var $3$1=HEAP32[(($ld$5$1)>>2)];
   var $ld$6$0=(($1)|0);
   var $4$0=HEAP32[(($ld$6$0)>>2)];
   var $ld$7$1=(($1+4)|0);
   var $4$1=HEAP32[(($ld$7$1)>>2)];
   var $5=_subtract_time($3$0, $3$1, $4$0, $4$1);
   var $6=HEAPF64[((3712)>>3)];
   var $7=($6)+($5);
   HEAPF64[((3712)>>3)]=$7;
   var $8=HEAPF64[((3712)>>3)];
   var $9=$8 != 0;
   if ($9) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $11=HEAP32[((5088)>>2)];
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $14=HEAP32[((5088)>>2)];
   var $15=HEAP32[((3792)>>2)];
   var $16=(($14)>>>(0)) > (($15)>>>(0));
   if ($16) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $18=HEAPF64[((3712)>>3)];
   var $19=($18)*(1000);
   var $20=HEAP32[((5088)>>2)];
   var $21=(($20)|(0));
   var $22=($19)/($21);
   $fMs=$22;
   var $23=$fMs;
   var $24=($23)/(1000);
   var $25=(1)/($24);
   $fFps=$25;
   var $ld$8$0=((5120)|0);
   var $26$0=HEAP32[(($ld$8$0)>>2)];
   var $ld$9$1=((5124)|0);
   var $26$1=HEAP32[(($ld$9$1)>>2)];
   var $$etemp$10$0=4;
   var $$etemp$10$1=0;
   var $27=(($26$0|0) == ($$etemp$10$0|0)) & (($26$1|0) == ($$etemp$10$1|0));
   var $28=$27 ? (((328)|0)) : (((320)|0));
   var $29=$fMs;
   var $30=$fFps;
   var $31=_printf(((336)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$28,HEAPF64[(((tempInt)+(8))>>3)]=$29,HEAPF64[(((tempInt)+(16))>>3)]=$30,HEAP32[(((tempInt)+(24))>>2)]=((3496)|0),tempInt));
   HEAP32[((5088)>>2)]=0;
   HEAPF64[((3712)>>3)]=0;
   label = 5; break;
  case 5: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _motion($x, $y) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 64)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $dx;
   var $dy;
   var $translateSpeed;
   var $v=__stackBase__;
   var $r=(__stackBase__)+(16);
   var $v1=(__stackBase__)+(32);
   var $r2=(__stackBase__)+(48);
   $1=$x;
   $2=$y;
   var $3=$1;
   var $4=HEAP32[((4136)>>2)];
   var $5=((($3)-($4))|0);
   var $6=(($5)|(0));
   $dx=$6;
   var $7=$2;
   var $8=HEAP32[((4128)>>2)];
   var $9=((($7)-($8))|0);
   var $10=(($9)|(0));
   $dy=$10;
   var $11=HEAP32[((4800)>>2)];
   if ((($11)|(0))==0) {
    label = 2; break;
   }
   else if ((($11)|(0))==1) {
    label = 17; break;
   }
   else {
   label = 23; break;
   }
  case 2: 
   var $13=HEAP32[((5296)>>2)];
   var $14=(($13)|(0))==3;
   if ($14) { label = 3; break; } else { label = 10; break; }
  case 3: 
   var $16=$dy;
   var $17=$16;
   var $18=($17)/(100);
   var $19=($18)*(0.5);
   var $20=HEAPF32[((((4064)|0))>>2)];
   var $21=$20;
   var $22=Math.abs($21);
   var $23=($19)*($22);
   var $24=HEAPF32[((((4064)|0))>>2)];
   var $25=$24;
   var $26=($25)+($23);
   var $27=$26;
   HEAPF32[((((4064)|0))>>2)]=$27;
   var $28=HEAPF32[((((4064)|0))>>2)];
   var $29=$28 < -10;
   if ($29) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $34 = -10;label = 6; break;
  case 5: 
   var $32=HEAPF32[((((4064)|0))>>2)];
   var $34 = $32;label = 6; break;
  case 6: 
   var $34;
   HEAPF32[((((4064)|0))>>2)]=$34;
   var $35=HEAPF32[((((4064)|0))>>2)];
   var $36=$35 > -3;
   if ($36) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $41 = -3;label = 9; break;
  case 8: 
   var $39=HEAPF32[((((4064)|0))>>2)];
   var $41 = $39;label = 9; break;
  case 9: 
   var $41;
   HEAPF32[((((4064)|0))>>2)]=$41;
   label = 16; break;
  case 10: 
   var $43=HEAP32[((5296)>>2)];
   var $44=$43 & 2;
   var $45=(($44)|(0))!=0;
   if ($45) { label = 11; break; } else { label = 12; break; }
  case 11: 
   var $47=$dx;
   var $48=$47;
   var $49=($48)/(100);
   var $50=HEAPF32[((((4056)|0))>>2)];
   var $51=$50;
   var $52=($51)+($49);
   var $53=$52;
   HEAPF32[((((4056)|0))>>2)]=$53;
   var $54=$dy;
   var $55=$54;
   var $56=($55)/(100);
   var $57=HEAPF32[((((4060)|0))>>2)];
   var $58=$57;
   var $59=($58)-($56);
   var $60=$59;
   HEAPF32[((((4060)|0))>>2)]=$60;
   label = 15; break;
  case 12: 
   var $62=HEAP32[((5296)>>2)];
   var $63=$62 & 1;
   var $64=(($63)|(0))!=0;
   if ($64) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $66=$dy;
   var $67=$66;
   var $68=($67)/(5);
   var $69=HEAPF32[((((5152)|0))>>2)];
   var $70=$69;
   var $71=($70)+($68);
   var $72=$71;
   HEAPF32[((((5152)|0))>>2)]=$72;
   var $73=$dx;
   var $74=$73;
   var $75=($74)/(5);
   var $76=HEAPF32[((((5156)|0))>>2)];
   var $77=$76;
   var $78=($77)+($75);
   var $79=$78;
   HEAPF32[((((5156)|0))>>2)]=$79;
   label = 14; break;
  case 14: 
   label = 15; break;
  case 15: 
   label = 16; break;
  case 16: 
   label = 23; break;
  case 17: 
   $translateSpeed=0.003000000026077032;
   var $84=HEAP32[((5296)>>2)];
   var $85=(($84)|(0))==1;
   if ($85) { label = 18; break; } else { label = 19; break; }
  case 18: 
   var $87=$dx;
   var $88=$translateSpeed;
   var $89=($87)*($88);
   var $90=(($v)|0);
   HEAPF32[(($90)>>2)]=$89;
   var $91=$dy;
   var $92=(-$91);
   var $93=$translateSpeed;
   var $94=($92)*($93);
   var $95=(($v+4)|0);
   HEAPF32[(($95)>>2)]=$94;
   var $96=(($v+8)|0);
   HEAPF32[(($96)>>2)]=0;
   var $97=(($v)|0);
   var $98=(($r)|0);
   _inv_matrix_vector_multiply($97, $98, ((4808)|0));
   label = 22; break;
  case 19: 
   var $100=HEAP32[((5296)>>2)];
   var $101=(($100)|(0))==2;
   if ($101) { label = 20; break; } else { label = 21; break; }
  case 20: 
   var $103=(($v1)|0);
   HEAPF32[(($103)>>2)]=0;
   var $104=(($v1+4)|0);
   HEAPF32[(($104)>>2)]=0;
   var $105=$dy;
   var $106=$translateSpeed;
   var $107=($105)*($106);
   var $108=(($v1+8)|0);
   HEAPF32[(($108)>>2)]=$107;
   var $109=(($v1)|0);
   var $110=(($r2)|0);
   _inv_matrix_vector_multiply($109, $110, ((4808)|0));
   label = 21; break;
  case 21: 
   label = 22; break;
  case 22: 
   label = 23; break;
  case 23: 
   var $114=$1;
   HEAP32[((4136)>>2)]=$114;
   var $115=$2;
   HEAP32[((4128)>>2)]=$115;
   _glutPostRedisplay();
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _mouse($button, $state, $x, $y) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $mods;
   $1=$button;
   $2=$state;
   $3=$x;
   $4=$y;
   var $5=$2;
   var $6=(($5)|(0))==0;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $8=$1;
   var $9=1 << $8;
   var $10=HEAP32[((5296)>>2)];
   var $11=$10 | $9;
   HEAP32[((5296)>>2)]=$11;
   label = 6; break;
  case 3: 
   var $13=$2;
   var $14=(($13)|(0))==1;
   if ($14) { label = 4; break; } else { label = 5; break; }
  case 4: 
   HEAP32[((5296)>>2)]=0;
   label = 5; break;
  case 5: 
   label = 6; break;
  case 6: 
   var $18=_glutGetModifiers();
   $mods=$18;
   var $19=$mods;
   var $20=$19 & 1;
   var $21=(($20)|(0))!=0;
   if ($21) { label = 7; break; } else { label = 8; break; }
  case 7: 
   HEAP32[((5296)>>2)]=2;
   label = 11; break;
  case 8: 
   var $24=$mods;
   var $25=$24 & 2;
   var $26=(($25)|(0))!=0;
   if ($26) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[((5296)>>2)]=3;
   label = 10; break;
  case 10: 
   label = 11; break;
  case 11: 
   var $30=$3;
   HEAP32[((4136)>>2)]=$30;
   var $31=$4;
   HEAP32[((4128)>>2)]=$31;
   _glutPostRedisplay();
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reshape($w, $h) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$w;
   $2=$h;
   var $3=$2;
   var $4=(($3)|(0))==0;
   if ($4) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $2=1;
   label = 3; break;
  case 3: 
   var $7=$1;
   var $8=(($7)|(0));
   var $9=$8;
   var $10=$2;
   var $11=(($10)|(0));
   var $12=($9)/($11);
   HEAPF32[((4096)>>2)]=$12;
   var $13=$1;
   HEAP32[((3696)>>2)]=$13;
   var $14=$2;
   HEAP32[((3928)>>2)]=$14;
   _glMatrixMode(5889);
   _glLoadIdentity();
   var $15=HEAP32[((3696)>>2)];
   var $16=HEAP32[((3928)>>2)];
   _glViewport(0, 0, $15, $16);
   var $17=HEAPF32[((4080)>>2)];
   var $18=$17;
   var $19=HEAPF32[((4096)>>2)];
   var $20=$19;
   var $21=HEAPF32[((4072)>>2)];
   var $22=$21;
   var $23=HEAPF32[((4088)>>2)];
   var $24=$23;
   _gluPerspective($18, $20, $22, $24);
   _glMatrixMode(5888);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _display() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $start=__stackBase__;
   var $err;
   var $c;
   var $end=(__stackBase__)+(8);
   var $1=HEAP32[((5088)>>2)];
   var $2=((($1)+(1))|0);
   HEAP32[((5088)>>2)]=$2;
   var $3$0=_current_time();
   var $3$1=tempRet0;
   var $st$0$0=(($start)|0);
   HEAP32[(($st$0$0)>>2)]=$3$0;
   var $st$1$1=(($start+4)|0);
   HEAP32[(($st$1$1)>>2)]=$3$1;
   var $4=_recompute();
   $err=$4;
   var $5=$err;
   var $6=(($5)|(0))!=0;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $8=$err;
   var $9=_printf(((1872)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$8,tempInt));
   _shutdown_opencl();
   _exit(1);
   throw "Reached an unreachable!";
  case 3: 
   $c=0;
   $c=0;
   label = 4; break;
  case 4: 
   var $12=$c;
   var $13=(($12)|(0)) < 3;
   if ($13) { label = 5; break; } else { label = 7; break; }
  case 5: 
   var $15=$c;
   var $16=((4056+($15<<2))|0);
   var $17=HEAPF32[(($16)>>2)];
   var $18=$c;
   var $19=((4040+($18<<2))|0);
   var $20=HEAPF32[(($19)>>2)];
   var $21=($17)-($20);
   var $22=($21)*(0.10000000149011612);
   var $23=$c;
   var $24=((4040+($23<<2))|0);
   var $25=HEAPF32[(($24)>>2)];
   var $26=($25)+($22);
   HEAPF32[(($24)>>2)]=$26;
   var $27=$c;
   var $28=((5152+($27<<2))|0);
   var $29=HEAPF32[(($28)>>2)];
   var $30=$c;
   var $31=((4024+($30<<2))|0);
   var $32=HEAPF32[(($31)>>2)];
   var $33=($29)-($32);
   var $34=($33)*(0.10000000149011612);
   var $35=$c;
   var $36=((4024+($35<<2))|0);
   var $37=HEAPF32[(($36)>>2)];
   var $38=($37)+($34);
   HEAPF32[(($36)>>2)]=$38;
   label = 6; break;
  case 6: 
   var $40=$c;
   var $41=((($40)+(1))|0);
   $c=$41;
   label = 4; break;
  case 7: 
   var $43=HEAP32[((4712)>>2)];
   var $44=HEAP32[((5080)>>2)];
   var $45=(($43)|(0))==(($44)|(0));
   if ($45) { label = 8; break; } else { label = 9; break; }
  case 8: 
   _render_scene_plain();
   label = 10; break;
  case 9: 
   _render_scene_pssm();
   label = 10; break;
  case 10: 
   var $49$0=_current_time();
   var $49$1=tempRet0;
   var $st$2$0=(($end)|0);
   HEAP32[(($st$2$0)>>2)]=$49$0;
   var $st$3$1=(($end+4)|0);
   HEAP32[(($st$3$1)>>2)]=$49$1;
   var $ld$4$0=(($start)|0);
   var $50$0=HEAP32[(($ld$4$0)>>2)];
   var $ld$5$1=(($start+4)|0);
   var $50$1=HEAP32[(($ld$5$1)>>2)];
   var $ld$6$0=(($end)|0);
   var $51$0=HEAP32[(($ld$6$0)>>2)];
   var $ld$7$1=(($end+4)|0);
   var $51$1=HEAP32[(($ld$7$1)>>2)];
   _report_stats($50$0, $50$1, $51$0, $51$1);
   var $52=HEAP32[((4112)>>2)];
   var $53=(($52)|(0))!=0;
   if ($53) { label = 11; break; } else { label = 12; break; }
  case 11: 
   var $55=HEAPF32[((3824)>>2)];
   var $56=($55)+(0.009999999776482582);
   HEAPF32[((3824)>>2)]=$56;
   label = 12; break;
  case 12: 
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reverse_bytes_float($x) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 var $fi=__stackBase__;
 $1=$x;
 var $2=$1;
 var $3=$fi;
 HEAPF32[(($3)>>2)]=$2;
 var $4=$fi;
 var $5=HEAP32[(($4)>>2)];
 var $6=$5 & 255;
 var $7=$6 << 24;
 var $8=$fi;
 var $9=HEAP32[(($8)>>2)];
 var $10=$9 >> 8;
 var $11=$10 & 255;
 var $12=$11 << 16;
 var $13=$7 | $12;
 var $14=$fi;
 var $15=HEAP32[(($14)>>2)];
 var $16=$15 >> 16;
 var $17=$16 & 255;
 var $18=$17 << 8;
 var $19=$13 | $18;
 var $20=$fi;
 var $21=HEAP32[(($20)>>2)];
 var $22=$21 >> 24;
 var $23=$22 & 255;
 var $24=$19 | $23;
 var $25=$fi;
 HEAP32[(($25)>>2)]=$24;
 var $26=$fi;
 var $27=HEAPF32[(($26)>>2)];
 STACKTOP = __stackBase__;
 return $27;
}
function _subtract_time($uiEndTime$0, $uiEndTime$1, $uiStartTime$0, $uiStartTime$1) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1=__stackBase__;
 var $2=(__stackBase__)+(8);
 var $st$0$0=(($1)|0);
 HEAP32[(($st$0$0)>>2)]=$uiEndTime$0;
 var $st$1$1=(($1+4)|0);
 HEAP32[(($st$1$1)>>2)]=$uiEndTime$1;
 var $st$2$0=(($2)|0);
 HEAP32[(($st$2$0)>>2)]=$uiStartTime$0;
 var $st$3$1=(($2+4)|0);
 HEAP32[(($st$3$1)>>2)]=$uiStartTime$1;
 var $ld$4$0=(($1)|0);
 var $3$0=HEAP32[(($ld$4$0)>>2)];
 var $ld$5$1=(($1+4)|0);
 var $3$1=HEAP32[(($ld$5$1)>>2)];
 var $ld$6$0=(($2)|0);
 var $4$0=HEAP32[(($ld$6$0)>>2)];
 var $ld$7$1=(($2+4)|0);
 var $4$1=HEAP32[(($ld$7$1)>>2)];
 var $5$0 = _i64Subtract($3$0,$3$1,$4$0,$4$1); var $5$1 = tempRet0;
 var $6=((($5$0)>>>(0))+((($5$1)>>>(0))*4294967296));
 var $7=($6)*(1e-9);
 STACKTOP = __stackBase__;
 return $7;
}
function _setup_opencl($use_gpu) {
 var label = 0;
 var __stackBase__  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $err;
   $2=$use_gpu;
   var $3=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $4=_printf(((1360)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $5=$2;
   var $6=_setup_compute_devices($5);
   $err=$6;
   var $7=$err;
   var $8=(($7)|(0))!=0;
   if ($8) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $10=$err;
   $1=$10;
   label = 8; break;
  case 3: 
   var $12=_setup_compute_memory();
   $err=$12;
   var $13=$err;
   var $14=(($13)|(0))!=0;
   if ($14) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $16=$err;
   $1=$16;
   label = 8; break;
  case 5: 
   var $18=_setup_compute_kernels();
   $err=$18;
   var $19=$err;
   var $20=(($19)|(0))!=0;
   if ($20) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $22=$err;
   $1=$22;
   label = 8; break;
  case 7: 
   $1=0;
   label = 8; break;
  case 8: 
   var $25=$1;
   STACKTOP = __stackBase__;
   return $25;
  default: assert(0, "bad label: " + label);
 }
}
function _main($argc, $argv) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2=__stackBase__;
   var $3;
   var $use_gpu;
   $1=0;
   HEAP32[(($2)>>2)]=$argc;
   $3=$argv;
   $use_gpu=1;
   var $4=$3;
   _glutInit($2, $4);
   _glutInitDisplayMode(18);
   var $5=HEAP32[((3696)>>2)];
   var $6=HEAP32[((3928)>>2)];
   _glutInitWindowSize($5, $6);
   _glutInitWindowPosition(100, 100);
   var $7=$3;
   var $8=(($7)|0);
   var $9=HEAP32[(($8)>>2)];
   var $10=_glutCreateWindow($9);
   var $11=$use_gpu;
   var $12=_init($11);
   var $13=(($12)|(0))==0;
   if ($13) { label = 2; break; } else { label = 3; break; }
  case 2: 
   _glutDisplayFunc(76);
   _glutIdleFunc(76);
   _glutMouseFunc(256);
   _glutMotionFunc(240);
   _glutReshapeFunc(236);
   _glutKeyboardFunc(214);
   var $15=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $16=_printf(((1384)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $17=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   _glutMainLoop();
   label = 3; break;
  case 3: 
   STACKTOP = __stackBase__;
   return 0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
function _setup_compute_devices($gpu) {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 2136)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $err=__stackBase__;
   var $returned_size=(__stackBase__)+(8);
   var $device_count;
   var $device_ids=(__stackBase__)+(16);
   var $i;
   var $device_found;
   var $device_type=(__stackBase__)+(80);
   var $vendor_name=(__stackBase__)+(88);
   var $device_name=(__stackBase__)+(1112);
   $2=$gpu;
   var $3=$2;
   var $4=(($3)|(0))!=0;
   var $5=$4 ? 4 : 2;
   var $6$0=$5;
   var $6$1=((($5)|(0)) < 0 ? -1 : 0);
   var $st$0$0=((5120)|0);
   HEAP32[(($st$0$0)>>2)]=$6$0;
   var $st$1$1=((5124)|0);
   HEAP32[(($st$1$1)>>2)]=$6$1;
   var $ld$2$0=((5120)|0);
   var $7$0=HEAP32[(($ld$2$0)>>2)];
   var $ld$3$1=((5124)|0);
   var $7$1=HEAP32[(($ld$3$1)>>2)];
   var $8=_clGetDeviceIDs(0, $7$0, $7$1, 1, 5128, 0);
   HEAP32[(($err)>>2)]=$8;
   var $9=HEAP32[(($err)>>2)];
   var $10=(($9)|(0))!=0;
   if ($10) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $12=_printf(((608)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 20; break;
  case 3: 
   var $14=_clCreateContext(0, 1, 5128, 148, 0, $err);
   HEAP32[((5136)>>2)]=$14;
   var $15=HEAP32[((5136)>>2)];
   var $16=(($15)|(0))!=0;
   if ($16) { label = 5; break; } else { label = 4; break; }
  case 4: 
   var $18=_printf(((560)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 20; break;
  case 5: 
   var $20=HEAP32[((5136)>>2)];
   var $21=(($device_ids)|0);
   var $22=$21;
   var $23=_clGetContextInfo($20, 4225, 64, $22, $returned_size);
   HEAP32[(($err)>>2)]=$23;
   var $24=HEAP32[(($err)>>2)];
   var $25=(($24)|(0))!=0;
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=_printf(((504)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 20; break;
  case 7: 
   var $29=HEAP32[(($returned_size)>>2)];
   var $30=Math.floor(((($29)>>>(0)))/(4));
   $device_count=$30;
   $i=0;
   $device_found=0;
   $i=0;
   label = 8; break;
  case 8: 
   var $32=$i;
   var $33=$device_count;
   var $34=(($32)>>>(0)) < (($33)>>>(0));
   if ($34) { label = 9; break; } else { label = 13; break; }
  case 9: 
   var $36=$i;
   var $37=(($device_ids+($36<<2))|0);
   var $38=HEAP32[(($37)>>2)];
   var $39=$device_type;
   var $40=_clGetDeviceInfo($38, 4096, 8, $39, 0);
   var $ld$4$0=(($device_type)|0);
   var $41$0=HEAP32[(($ld$4$0)>>2)];
   var $ld$5$1=(($device_type+4)|0);
   var $41$1=HEAP32[(($ld$5$1)>>2)];
   var $ld$6$0=((5120)|0);
   var $42$0=HEAP32[(($ld$6$0)>>2)];
   var $ld$7$1=((5124)|0);
   var $42$1=HEAP32[(($ld$7$1)>>2)];
   var $43=(($41$0|0) == ($42$0|0)) & (($41$1|0) == ($42$1|0));
   if ($43) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $45=$i;
   var $46=(($device_ids+($45<<2))|0);
   var $47=HEAP32[(($46)>>2)];
   HEAP32[((5128)>>2)]=$47;
   $device_found=1;
   label = 13; break;
  case 11: 
   label = 12; break;
  case 12: 
   var $50=$i;
   var $51=((($50)+(1))|0);
   $i=$51;
   label = 8; break;
  case 13: 
   var $53=$device_found;
   var $54=(($53)|(0))!=0;
   if ($54) { label = 15; break; } else { label = 14; break; }
  case 14: 
   var $56=_printf(((608)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 20; break;
  case 15: 
   var $58=HEAP32[((5136)>>2)];
   var $59=HEAP32[((5128)>>2)];
   var $$etemp$8$0=0;
   var $$etemp$8$1=0;
   var $60=_clCreateCommandQueue($58, $59, $$etemp$8$0, $$etemp$8$1, $err);
   HEAP32[((5144)>>2)]=$60;
   var $61=HEAP32[((5144)>>2)];
   var $62=(($61)|(0))!=0;
   if ($62) { label = 17; break; } else { label = 16; break; }
  case 16: 
   var $64=_printf(((456)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 20; break;
  case 17: 
   var $66=$vendor_name;
   _memset($66, 0, 1024);
   var $67=$device_name;
   _memset($67, 0, 1024);
   var $68=HEAP32[((5128)>>2)];
   var $69=(($vendor_name)|0);
   var $70=_clGetDeviceInfo($68, 4140, 1024, $69, $returned_size);
   HEAP32[(($err)>>2)]=$70;
   var $71=HEAP32[((5128)>>2)];
   var $72=(($device_name)|0);
   var $73=_clGetDeviceInfo($71, 4139, 1024, $72, $returned_size);
   var $74=HEAP32[(($err)>>2)];
   var $75=$74 | $73;
   HEAP32[(($err)>>2)]=$75;
   var $76=HEAP32[(($err)>>2)];
   var $77=(($76)|(0))!=0;
   if ($77) { label = 18; break; } else { label = 19; break; }
  case 18: 
   var $79=_printf(((416)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 20; break;
  case 19: 
   var $81=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $82=(($vendor_name)|0);
   var $83=(($device_name)|0);
   var $84=_printf(((392)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$82,HEAP32[(((tempInt)+(8))>>2)]=$83,tempInt));
   $1=0;
   label = 20; break;
  case 20: 
   var $86=$1;
   STACKTOP = __stackBase__;
   return $86;
  default: assert(0, "bad label: " + label);
 }
}
function _setup_compute_kernels() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 2088)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $err=__stackBase__;
   var $source=(__stackBase__)+(8);
   var $length=(__stackBase__)+(16);
   var $len=(__stackBase__)+(24);
   var $buffer=(__stackBase__)+(32);
   var $max=(__stackBase__)+(2080);
   HEAP32[(($err)>>2)]=0;
   HEAP32[(($source)>>2)]=0;
   HEAP32[(($length)>>2)]=0;
   var $2=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $3=_printf(((1312)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=((1288)|0),tempInt));
   var $4=_file_to_string(((1288)|0), $source, $length);
   HEAP32[(($err)>>2)]=$4;
   var $5=HEAP32[(($err)>>2)];
   var $6=(($5)|(0))!=0;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $1=-8;
   label = 14; break;
  case 3: 
   var $9=HEAP32[((5136)>>2)];
   var $10=_clCreateProgramWithSource($9, 1, $source, 0, $err);
   HEAP32[((5104)>>2)]=$10;
   var $11=HEAP32[((5104)>>2)];
   var $12=(($11)|(0))!=0;
   if ($12) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $14=HEAP32[(($err)>>2)];
   var $15=(($14)|(0))!=0;
   if ($15) { label = 5; break; } else { label = 6; break; }
  case 5: 
   var $17=HEAP32[(($err)>>2)];
   var $18=_printf(((1240)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$17,tempInt));
   $1=1;
   label = 14; break;
  case 6: 
   var $20=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $21=_printf(((1208)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $22=HEAP32[((5104)>>2)];
   var $23=_clBuildProgram($22, 0, 0, 0, 0, 0);
   HEAP32[(($err)>>2)]=$23;
   var $24=HEAP32[(($err)>>2)];
   var $25=(($24)|(0))!=0;
   if ($25) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $27=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $28=_printf(((1160)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $29=HEAP32[((5104)>>2)];
   var $30=HEAP32[((5128)>>2)];
   var $31=(($buffer)|0);
   var $32=_clGetProgramBuildInfo($29, $30, 4483, 2048, $31, $len);
   var $33=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $34=(($buffer)|0);
   var $35=_printf(((1104)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$34,tempInt));
   var $36=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 14; break;
  case 8: 
   var $38=_printf(((1072)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=((1056)|0),tempInt));
   var $39=HEAP32[((5104)>>2)];
   var $40=_clCreateKernel($39, ((1056)|0), $err);
   HEAP32[((5112)>>2)]=$40;
   var $41=HEAP32[((5112)>>2)];
   var $42=(($41)|(0))!=0;
   if ($42) { label = 9; break; } else { label = 10; break; }
  case 9: 
   var $44=HEAP32[(($err)>>2)];
   var $45=(($44)|(0))!=0;
   if ($45) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $47=_printf(((1008)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 14; break;
  case 11: 
   HEAP32[(($max)>>2)]=1;
   var $49=HEAP32[((5112)>>2)];
   var $50=HEAP32[((5128)>>2)];
   var $51=$max;
   var $52=_clGetKernelWorkGroupInfo($49, $50, 4528, 4, $51, 0);
   HEAP32[(($err)>>2)]=$52;
   var $53=HEAP32[(($err)>>2)];
   var $54=(($53)|(0))!=0;
   if ($54) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $56=HEAP32[(($err)>>2)];
   var $57=_printf(((952)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$56,tempInt));
   $1=1;
   label = 14; break;
  case 13: 
   var $59=HEAP32[(($max)>>2)];
   HEAP32[((4872)>>2)]=$59;
   var $60=HEAP32[((4872)>>2)];
   var $61=_printf(((920)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$60,tempInt));
   $1=0;
   label = 14; break;
  case 14: 
   var $63=$1;
   STACKTOP = __stackBase__;
   return $63;
  default: assert(0, "bad label: " + label);
 }
}
function _setup_compute_memory() {
 var label = 0;
 var __stackBase__  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $err=__stackBase__;
   var $bytes;
   var $2=HEAP32[((3704)>>2)];
   var $3=($2<<2);
   var $4=HEAP32[((4640)>>2)];
   var $5=(Math.imul($3,$4)|0);
   $bytes=$5;
   var $6=_printf(((3624)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $7=_printf(((872)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $8=HEAP32[((5136)>>2)];
   var $9=$bytes;
   var $$etemp$0$0=4;
   var $$etemp$0$1=0;
   var $10=_clCreateBuffer($8, $$etemp$0$0, $$etemp$0$1, $9, 0, $err);
   HEAP32[((5056)>>2)]=$10;
   var $11=HEAP32[((5056)>>2)];
   var $12=(($11)|(0))!=0;
   if ($12) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $14=HEAP32[(($err)>>2)];
   var $15=(($14)|(0))!=0;
   if ($15) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $17=HEAP32[(($err)>>2)];
   var $18=_printf(((832)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$17,tempInt));
   $1=1;
   label = 13; break;
  case 4: 
   var $20=HEAP32[((5136)>>2)];
   var $21=$bytes;
   var $$etemp$1$0=1;
   var $$etemp$1$1=0;
   var $22=_clCreateBuffer($20, $$etemp$1$0, $$etemp$1$1, $21, 0, $err);
   HEAP32[((4768)>>2)]=$22;
   var $23=HEAP32[((4768)>>2)];
   var $24=(($23)|(0))!=0;
   if ($24) { label = 5; break; } else { label = 6; break; }
  case 5: 
   var $26=HEAP32[(($err)>>2)];
   var $27=(($26)|(0))!=0;
   if ($27) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $29=HEAP32[(($err)>>2)];
   var $30=_printf(((784)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$29,tempInt));
   $1=1;
   label = 13; break;
  case 7: 
   var $32=HEAP32[((5136)>>2)];
   var $33=$bytes;
   var $$etemp$2$0=1;
   var $$etemp$2$1=0;
   var $34=_clCreateBuffer($32, $$etemp$2$0, $$etemp$2$1, $33, 0, $err);
   HEAP32[((4776)>>2)]=$34;
   var $35=HEAP32[((4776)>>2)];
   var $36=(($35)|(0))!=0;
   if ($36) { label = 8; break; } else { label = 9; break; }
  case 8: 
   var $38=HEAP32[(($err)>>2)];
   var $39=(($38)|(0))!=0;
   if ($39) { label = 9; break; } else { label = 10; break; }
  case 9: 
   var $41=HEAP32[(($err)>>2)];
   var $42=_printf(((736)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$41,tempInt));
   $1=1;
   label = 13; break;
  case 10: 
   var $44=HEAP32[((5144)>>2)];
   var $45=HEAP32[((5056)>>2)];
   var $46=HEAP32[((4648)>>2)];
   var $47=HEAP32[((4664)>>2)];
   var $48=$47;
   var $49=_clEnqueueWriteBuffer($44, $45, 1, 0, $46, $48, 0, 0, 0);
   HEAP32[(($err)>>2)]=$49;
   var $50=HEAP32[(($err)>>2)];
   var $51=(($50)|(0))!=0;
   if ($51) { label = 11; break; } else { label = 12; break; }
  case 11: 
   var $53=_printf(((656)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   $1=1;
   label = 13; break;
  case 12: 
   $1=0;
   label = 13; break;
  case 13: 
   var $56=$1;
   STACKTOP = __stackBase__;
   return $56;
  default: assert(0, "bad label: " + label);
 }
}
function _current_time() {
 var label = 0;
 var $1=_emscripten_get_now();
 var $2=((($1)*(1000000))&-1);
 var $3$0=$2;
 var $3$1=((($2)|(0)) < 0 ? -1 : 0);
 return (tempRet0=$3$1,$3$0);
}
function _keyboard($key, $x, $y) {
 var label = 0;
 var __stackBase__  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$key;
   $2=$x;
   $3=$y;
   var $4=$1;
   var $5=(($4)&(255));
   if ((($5)|(0))==61) {
    label = 2; break;
   }
   else if ((($5)|(0))==45) {
    label = 3; break;
   }
   else if ((($5)|(0))==91) {
    label = 4; break;
   }
   else if ((($5)|(0))==93) {
    label = 5; break;
   }
   else if ((($5)|(0))==59) {
    label = 9; break;
   }
   else if ((($5)|(0))==39) {
    label = 10; break;
   }
   else if ((($5)|(0))==46) {
    label = 11; break;
   }
   else if ((($5)|(0))==47) {
    label = 12; break;
   }
   else if ((($5)|(0))==120) {
    label = 13; break;
   }
   else if ((($5)|(0))==122) {
    label = 17; break;
   }
   else if ((($5)|(0))==99) {
    label = 18; break;
   }
   else if ((($5)|(0))==118) {
    label = 19; break;
   }
   else if ((($5)|(0))==98) {
    label = 20; break;
   }
   else if ((($5)|(0))==110) {
    label = 21; break;
   }
   else if ((($5)|(0))==49) {
    label = 22; break;
   }
   else if ((($5)|(0))==50) {
    label = 26; break;
   }
   else if ((($5)|(0))==51) {
    label = 30; break;
   }
   else if ((($5)|(0))==52) {
    label = 31; break;
   }
   else if ((($5)|(0))==53) {
    label = 32; break;
   }
   else if ((($5)|(0))==54) {
    label = 33; break;
   }
   else if ((($5)|(0))==55) {
    label = 34; break;
   }
   else if ((($5)|(0))==56) {
    label = 35; break;
   }
   else if ((($5)|(0))==57) {
    label = 36; break;
   }
   else if ((($5)|(0))==48) {
    label = 37; break;
   }
   else if ((($5)|(0))==32) {
    label = 38; break;
   }
   else if ((($5)|(0))==96) {
    label = 39; break;
   }
   else if ((($5)|(0))==116) {
    label = 43; break;
   }
   else if ((($5)|(0))==121) {
    label = 44; break;
   }
   else if ((($5)|(0))==117) {
    label = 45; break;
   }
   else if ((($5)|(0))==105) {
    label = 46; break;
   }
   else if ((($5)|(0))==92) {
    label = 47; break;
   }
   else if ((($5)|(0))==113 | (($5)|(0))==27) {
    label = 48; break;
   }
   else {
   label = 49; break;
   }
  case 2: 
   var $7=HEAPF32[((3968)>>2)];
   var $8=$7;
   var $9=($8)*(1.01);
   var $10=$9;
   HEAPF32[((3968)>>2)]=$10;
   var $11=HEAPF32[((3968)>>2)];
   var $12=$11;
   var $13=_printf(((1856)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$12,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 3: 
   var $15=HEAPF32[((3968)>>2)];
   var $16=$15;
   var $17=($16)*(0.99);
   var $18=$17;
   HEAPF32[((3968)>>2)]=$18;
   var $19=HEAPF32[((3968)>>2)];
   var $20=$19;
   var $21=_printf(((1856)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$20,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 4: 
   var $23=HEAPF32[((4120)>>2)];
   var $24=($23)*(0.949999988079071);
   HEAPF32[((4120)>>2)]=$24;
   var $25=HEAPF32[((4120)>>2)];
   var $26=$25;
   var $27=_printf(((1840)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$26,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 5: 
   var $29=HEAPF32[((4120)>>2)];
   var $30=$29 < 7;
   if ($30) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $32=HEAPF32[((4120)>>2)];
   var $33=($32)*(1.0499999523162842);
   var $37 = $33;label = 8; break;
  case 7: 
   var $35=HEAPF32[((4120)>>2)];
   var $37 = $35;label = 8; break;
  case 8: 
   var $37;
   HEAPF32[((4120)>>2)]=$37;
   var $38=HEAPF32[((4120)>>2)];
   var $39=$38;
   var $40=_printf(((1840)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$39,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 9: 
   var $42=HEAPF32[((3888)>>2)];
   var $43=$42;
   var $44=($43)*(1.01);
   var $45=$44;
   HEAPF32[((3888)>>2)]=$45;
   var $46=HEAPF32[((3888)>>2)];
   var $47=$46;
   var $48=_printf(((1816)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$47,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 10: 
   var $50=HEAPF32[((3888)>>2)];
   var $51=$50;
   var $52=($51)*(0.99);
   var $53=$52;
   HEAPF32[((3888)>>2)]=$53;
   var $54=HEAPF32[((3888)>>2)];
   var $55=$54;
   var $56=_printf(((1816)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$55,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 11: 
   var $58=HEAPF32[((3920)>>2)];
   var $59=$58;
   var $60=($59)*(1.05);
   var $61=$60;
   HEAPF32[((3920)>>2)]=$61;
   var $62=HEAPF32[((3920)>>2)];
   var $63=$62;
   var $64=_printf(((1800)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$63,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 12: 
   var $66=HEAPF32[((3920)>>2)];
   var $67=$66;
   var $68=($67)*(0.95);
   var $69=$68;
   HEAPF32[((3920)>>2)]=$69;
   var $70=HEAPF32[((3920)>>2)];
   var $71=$70;
   var $72=_printf(((1800)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$71,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 13: 
   var $74=HEAPF32[((3832)>>2)];
   var $75=$74 < 7;
   if ($75) { label = 14; break; } else { label = 15; break; }
  case 14: 
   var $77=HEAPF32[((3832)>>2)];
   var $78=($77)*(1.0499999523162842);
   var $82 = $78;label = 16; break;
  case 15: 
   var $80=HEAPF32[((3832)>>2)];
   var $82 = $80;label = 16; break;
  case 16: 
   var $82;
   HEAPF32[((3832)>>2)]=$82;
   var $83=HEAPF32[((3832)>>2)];
   var $84=$83;
   var $85=_printf(((1752)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$84,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 17: 
   var $87=HEAPF32[((3832)>>2)];
   var $88=$87;
   var $89=($88)*(0.95);
   var $90=$89;
   HEAPF32[((3832)>>2)]=$90;
   var $91=HEAPF32[((3832)>>2)];
   var $92=$91;
   var $93=_printf(((1752)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$92,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 18: 
   var $95=HEAPF32[((3784)>>2)];
   var $96=$95;
   var $97=($96)*(1.05);
   var $98=$97;
   HEAPF32[((3784)>>2)]=$98;
   var $99=HEAPF32[((3784)>>2)];
   var $100=$99;
   var $101=_printf(((1736)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$100,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 19: 
   var $103=HEAPF32[((3784)>>2)];
   var $104=$103;
   var $105=($104)*(0.95);
   var $106=$105;
   HEAPF32[((3784)>>2)]=$106;
   var $107=HEAPF32[((3784)>>2)];
   var $108=$107;
   var $109=_printf(((1736)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$108,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 20: 
   var $111=HEAPF32[((3776)>>2)];
   var $112=$111;
   var $113=($112)*(1.05);
   var $114=$113;
   HEAPF32[((3776)>>2)]=$114;
   var $115=HEAPF32[((3776)>>2)];
   var $116=$115;
   var $117=_printf(((1712)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$116,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 21: 
   var $119=HEAPF32[((3776)>>2)];
   var $120=$119;
   var $121=($120)*(0.95);
   var $122=$121;
   HEAPF32[((3776)>>2)]=$122;
   var $123=HEAPF32[((3776)>>2)];
   var $124=$123;
   var $125=_printf(((1712)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$124,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 22: 
   var $127=HEAPF32[((3800)>>2)];
   var $128=$127 > 1;
   if ($128) { label = 23; break; } else { label = 24; break; }
  case 23: 
   var $130=HEAPF32[((3800)>>2)];
   var $131=($130)*(0.949999988079071);
   var $136 = $131;label = 25; break;
  case 24: 
   var $133=HEAPF32[((3800)>>2)];
   var $134=$133;
   var $136 = $134;label = 25; break;
  case 25: 
   var $136;
   HEAPF32[((3800)>>2)]=$136;
   var $137=HEAPF32[((3800)>>2)];
   var $138=$137;
   var $139=_printf(((1688)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$138,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 26: 
   var $141=HEAPF32[((3800)>>2)];
   var $142=$141 < 3;
   if ($142) { label = 27; break; } else { label = 28; break; }
  case 27: 
   var $144=HEAPF32[((3800)>>2)];
   var $145=($144)*(1.0499999523162842);
   var $150 = $145;label = 29; break;
  case 28: 
   var $147=HEAPF32[((3800)>>2)];
   var $148=$147;
   var $150 = $148;label = 29; break;
  case 29: 
   var $150;
   HEAPF32[((3800)>>2)]=$150;
   var $151=HEAPF32[((3800)>>2)];
   var $152=$151;
   var $153=_printf(((1688)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$152,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 30: 
   var $155=HEAPF32[((3984)>>2)];
   var $156=($155)*(0.949999988079071);
   HEAPF32[((3984)>>2)]=$156;
   var $157=HEAPF32[((3984)>>2)];
   var $158=$157;
   var $159=_printf(((1656)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$158,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 31: 
   var $161=HEAPF32[((3984)>>2)];
   var $162=($161)*(1.0499999523162842);
   HEAPF32[((3984)>>2)]=$162;
   var $163=HEAPF32[((3984)>>2)];
   var $164=$163;
   var $165=_printf(((1656)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$164,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 32: 
   var $167=HEAPF32[((3960)>>2)];
   var $168=($167)*(0.949999988079071);
   HEAPF32[((3960)>>2)]=$168;
   var $169=HEAPF32[((3960)>>2)];
   var $170=$169;
   var $171=_printf(((1632)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$170,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 33: 
   var $173=HEAPF32[((3960)>>2)];
   var $174=($173)*(1.0499999523162842);
   HEAPF32[((3960)>>2)]=$174;
   var $175=HEAPF32[((3960)>>2)];
   var $176=$175;
   var $177=_printf(((1632)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$176,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 34: 
   var $179=HEAPF32[((3944)>>2)];
   var $180=($179)*(0.949999988079071);
   HEAPF32[((3944)>>2)]=$180;
   var $181=HEAPF32[((3944)>>2)];
   var $182=$181;
   var $183=_printf(((1608)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$182,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 35: 
   var $185=HEAPF32[((3944)>>2)];
   var $186=($185)*(1.0499999523162842);
   HEAPF32[((3944)>>2)]=$186;
   var $187=HEAPF32[((3944)>>2)];
   var $188=$187;
   var $189=_printf(((1608)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$188,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 36: 
   var $191=HEAPF32[((3952)>>2)];
   var $192=($191)*(0.949999988079071);
   HEAPF32[((3952)>>2)]=$192;
   var $193=HEAPF32[((3952)>>2)];
   var $194=$193;
   var $195=_printf(((1584)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$194,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 37: 
   var $197=HEAPF32[((3952)>>2)];
   var $198=($197)*(1.0499999523162842);
   HEAPF32[((3952)>>2)]=$198;
   var $199=HEAPF32[((3952)>>2)];
   var $200=$199;
   var $201=_printf(((1584)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$200,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 38: 
   var $203=HEAP32[((4112)>>2)];
   var $204=(($203)|(0))==1;
   var $205=$204 ? 0 : 1;
   HEAP32[((4112)>>2)]=$205;
   var $206=HEAP32[((4112)>>2)];
   var $207=_printf(((1568)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$206,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 39: 
   var $209=HEAP32[((4712)>>2)];
   var $210=HEAP32[((4760)>>2)];
   var $211=(($209)|(0))==(($210)|(0));
   if ($211) { label = 40; break; } else { label = 41; break; }
  case 40: 
   var $213=HEAP32[((5080)>>2)];
   var $217 = $213;label = 42; break;
  case 41: 
   var $215=HEAP32[((4760)>>2)];
   var $217 = $215;label = 42; break;
  case 42: 
   var $217;
   HEAP32[((4712)>>2)]=$217;
   label = 49; break;
  case 43: 
   var $219=HEAPF32[((3808)>>2)];
   var $220=($219)*(0.949999988079071);
   HEAPF32[((3808)>>2)]=$220;
   var $221=HEAPF32[((3808)>>2)];
   var $222=$221;
   var $223=_printf(((1536)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$222,tempInt));
   label = 49; break;
  case 44: 
   var $225=HEAPF32[((3808)>>2)];
   var $226=($225)*(1.0499999523162842);
   HEAPF32[((3808)>>2)]=$226;
   var $227=HEAPF32[((3808)>>2)];
   var $228=$227;
   var $229=_printf(((1536)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$228,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 45: 
   var $231=HEAPF32[((3816)>>2)];
   var $232=($231)*(0.949999988079071);
   HEAPF32[((3816)>>2)]=$232;
   var $233=HEAPF32[((3816)>>2)];
   var $234=$233;
   var $235=_printf(((1480)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$234,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 46: 
   var $237=HEAPF32[((3816)>>2)];
   var $238=($237)*(1.0499999523162842);
   HEAPF32[((3816)>>2)]=$238;
   var $239=HEAPF32[((3816)>>2)];
   var $240=$239;
   var $241=_printf(((1480)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempInt)>>3)]=$240,tempInt));
   HEAP32[((3744)>>2)]=1;
   label = 49; break;
  case 47: 
   var $243=HEAP32[((3736)>>2)];
   var $244=(($243)|(0))!=0;
   var $245=$244 ? 0 : 1;
   HEAP32[((3736)>>2)]=$245;
   label = 49; break;
  case 48: 
   _shutdown_opencl();
   _exit(0);
   throw "Reached an unreachable!";
  case 49: 
   _glutPostRedisplay();
   STACKTOP = __stackBase__;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _init($gpu) {
 var label = 0;
 var __stackBase__  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $err;
   $1=$gpu;
   var $2=_setup_opengl();
   $err=$2;
   var $3=$err;
   var $4=(($3)|(0))!=0;
   if ($4) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $6=_printf(((1448)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=0,tempInt));
   var $7=$err;
   _exit($7);
   throw "Reached an unreachable!";
  case 3: 
   var $9=$1;
   var $10=_setup_opencl($9);
   $err=$10;
   var $11=$err;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $14=$err;
   var $15=_printf(((1408)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$14,tempInt));
   var $16=$err;
   _exit($16);
   throw "Reached an unreachable!";
  case 5: 
   STACKTOP = __stackBase__;
   return 0;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($bytes)>>>(0)) < 245;
   if ($1) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $3=(($bytes)>>>(0)) < 11;
   if ($3) { var $8 = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $5=((($bytes)+(11))|0);
   var $6=$5 & -8;
   var $8 = $6;label = 4; break;
  case 4: 
   var $8;
   var $9=$8 >>> 3;
   var $10=HEAP32[((((4168)|0))>>2)];
   var $11=$10 >>> (($9)>>>(0));
   var $12=$11 & 3;
   var $13=(($12)|(0))==0;
   if ($13) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $15=$11 & 1;
   var $16=$15 ^ 1;
   var $17=((($16)+($9))|0);
   var $18=$17 << 1;
   var $19=((4208+($18<<2))|0);
   var $20=$19;
   var $_sum111=((($18)+(2))|0);
   var $21=((4208+($_sum111<<2))|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22+8)|0);
   var $24=HEAP32[(($23)>>2)];
   var $25=(($20)|(0))==(($24)|(0));
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=1 << $17;
   var $28=$27 ^ -1;
   var $29=$10 & $28;
   HEAP32[((((4168)|0))>>2)]=$29;
   label = 11; break;
  case 7: 
   var $31=$24;
   var $32=HEAP32[((((4184)|0))>>2)];
   var $33=(($31)>>>(0)) < (($32)>>>(0));
   if ($33) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $35=(($24+12)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=(($36)|(0))==(($22)|(0));
   if ($37) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($35)>>2)]=$20;
   HEAP32[(($21)>>2)]=$24;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $40=$17 << 3;
   var $41=$40 | 3;
   var $42=(($22+4)|0);
   HEAP32[(($42)>>2)]=$41;
   var $43=$22;
   var $_sum113114=$40 | 4;
   var $44=(($43+$_sum113114)|0);
   var $45=$44;
   var $46=HEAP32[(($45)>>2)];
   var $47=$46 | 1;
   HEAP32[(($45)>>2)]=$47;
   var $48=$23;
   var $mem_0 = $48;label = 341; break;
  case 12: 
   var $50=HEAP32[((((4176)|0))>>2)];
   var $51=(($8)>>>(0)) > (($50)>>>(0));
   if ($51) { label = 13; break; } else { var $nb_0 = $8;label = 160; break; }
  case 13: 
   var $53=(($11)|(0))==0;
   if ($53) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $55=$11 << $9;
   var $56=2 << $9;
   var $57=(((-$56))|0);
   var $58=$56 | $57;
   var $59=$55 & $58;
   var $60=(((-$59))|0);
   var $61=$59 & $60;
   var $62=((($61)-(1))|0);
   var $63=$62 >>> 12;
   var $64=$63 & 16;
   var $65=$62 >>> (($64)>>>(0));
   var $66=$65 >>> 5;
   var $67=$66 & 8;
   var $68=$67 | $64;
   var $69=$65 >>> (($67)>>>(0));
   var $70=$69 >>> 2;
   var $71=$70 & 4;
   var $72=$68 | $71;
   var $73=$69 >>> (($71)>>>(0));
   var $74=$73 >>> 1;
   var $75=$74 & 2;
   var $76=$72 | $75;
   var $77=$73 >>> (($75)>>>(0));
   var $78=$77 >>> 1;
   var $79=$78 & 1;
   var $80=$76 | $79;
   var $81=$77 >>> (($79)>>>(0));
   var $82=((($80)+($81))|0);
   var $83=$82 << 1;
   var $84=((4208+($83<<2))|0);
   var $85=$84;
   var $_sum104=((($83)+(2))|0);
   var $86=((4208+($_sum104<<2))|0);
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($85)|(0))==(($89)|(0));
   if ($90) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $92=1 << $82;
   var $93=$92 ^ -1;
   var $94=$10 & $93;
   HEAP32[((((4168)|0))>>2)]=$94;
   label = 20; break;
  case 16: 
   var $96=$89;
   var $97=HEAP32[((((4184)|0))>>2)];
   var $98=(($96)>>>(0)) < (($97)>>>(0));
   if ($98) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $100=(($89+12)|0);
   var $101=HEAP32[(($100)>>2)];
   var $102=(($101)|(0))==(($87)|(0));
   if ($102) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($100)>>2)]=$85;
   HEAP32[(($86)>>2)]=$89;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $105=$82 << 3;
   var $106=((($105)-($8))|0);
   var $107=$8 | 3;
   var $108=(($87+4)|0);
   HEAP32[(($108)>>2)]=$107;
   var $109=$87;
   var $110=(($109+$8)|0);
   var $111=$110;
   var $112=$106 | 1;
   var $_sum106107=$8 | 4;
   var $113=(($109+$_sum106107)|0);
   var $114=$113;
   HEAP32[(($114)>>2)]=$112;
   var $115=(($109+$105)|0);
   var $116=$115;
   HEAP32[(($116)>>2)]=$106;
   var $117=HEAP32[((((4176)|0))>>2)];
   var $118=(($117)|(0))==0;
   if ($118) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $120=HEAP32[((((4188)|0))>>2)];
   var $121=$117 >>> 3;
   var $122=$121 << 1;
   var $123=((4208+($122<<2))|0);
   var $124=$123;
   var $125=HEAP32[((((4168)|0))>>2)];
   var $126=1 << $121;
   var $127=$125 & $126;
   var $128=(($127)|(0))==0;
   if ($128) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $130=$125 | $126;
   HEAP32[((((4168)|0))>>2)]=$130;
   var $_sum109_pre=((($122)+(2))|0);
   var $_pre=((4208+($_sum109_pre<<2))|0);
   var $F4_0 = $124;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $_sum110=((($122)+(2))|0);
   var $132=((4208+($_sum110<<2))|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$133;
   var $135=HEAP32[((((4184)|0))>>2)];
   var $136=(($134)>>>(0)) < (($135)>>>(0));
   if ($136) { label = 24; break; } else { var $F4_0 = $133;var $_pre_phi = $132;label = 25; break; }
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
   label = 26; break;
  case 26: 
   HEAP32[((((4176)|0))>>2)]=$106;
   HEAP32[((((4188)|0))>>2)]=$111;
   var $143=$88;
   var $mem_0 = $143;label = 341; break;
  case 27: 
   var $145=HEAP32[((((4172)|0))>>2)];
   var $146=(($145)|(0))==0;
   if ($146) { var $nb_0 = $8;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $148=(((-$145))|0);
   var $149=$145 & $148;
   var $150=((($149)-(1))|0);
   var $151=$150 >>> 12;
   var $152=$151 & 16;
   var $153=$150 >>> (($152)>>>(0));
   var $154=$153 >>> 5;
   var $155=$154 & 8;
   var $156=$155 | $152;
   var $157=$153 >>> (($155)>>>(0));
   var $158=$157 >>> 2;
   var $159=$158 & 4;
   var $160=$156 | $159;
   var $161=$157 >>> (($159)>>>(0));
   var $162=$161 >>> 1;
   var $163=$162 & 2;
   var $164=$160 | $163;
   var $165=$161 >>> (($163)>>>(0));
   var $166=$165 >>> 1;
   var $167=$166 & 1;
   var $168=$164 | $167;
   var $169=$165 >>> (($167)>>>(0));
   var $170=((($168)+($169))|0);
   var $171=((4472+($170<<2))|0);
   var $172=HEAP32[(($171)>>2)];
   var $173=(($172+4)|0);
   var $174=HEAP32[(($173)>>2)];
   var $175=$174 & -8;
   var $176=((($175)-($8))|0);
   var $t_0_i = $172;var $v_0_i = $172;var $rsize_0_i = $176;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $178=(($t_0_i+16)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=(($179)|(0))==0;
   if ($180) { label = 30; break; } else { var $185 = $179;label = 31; break; }
  case 30: 
   var $182=(($t_0_i+20)|0);
   var $183=HEAP32[(($182)>>2)];
   var $184=(($183)|(0))==0;
   if ($184) { label = 32; break; } else { var $185 = $183;label = 31; break; }
  case 31: 
   var $185;
   var $186=(($185+4)|0);
   var $187=HEAP32[(($186)>>2)];
   var $188=$187 & -8;
   var $189=((($188)-($8))|0);
   var $190=(($189)>>>(0)) < (($rsize_0_i)>>>(0));
   var $_rsize_0_i=$190 ? $189 : $rsize_0_i;
   var $_v_0_i=$190 ? $185 : $v_0_i;
   var $t_0_i = $185;var $v_0_i = $_v_0_i;var $rsize_0_i = $_rsize_0_i;label = 29; break;
  case 32: 
   var $192=$v_0_i;
   var $193=HEAP32[((((4184)|0))>>2)];
   var $194=(($192)>>>(0)) < (($193)>>>(0));
   if ($194) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $196=(($192+$8)|0);
   var $197=$196;
   var $198=(($192)>>>(0)) < (($196)>>>(0));
   if ($198) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $200=(($v_0_i+24)|0);
   var $201=HEAP32[(($200)>>2)];
   var $202=(($v_0_i+12)|0);
   var $203=HEAP32[(($202)>>2)];
   var $204=(($203)|(0))==(($v_0_i)|(0));
   if ($204) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $206=(($v_0_i+8)|0);
   var $207=HEAP32[(($206)>>2)];
   var $208=$207;
   var $209=(($208)>>>(0)) < (($193)>>>(0));
   if ($209) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $211=(($207+12)|0);
   var $212=HEAP32[(($211)>>2)];
   var $213=(($212)|(0))==(($v_0_i)|(0));
   if ($213) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $215=(($203+8)|0);
   var $216=HEAP32[(($215)>>2)];
   var $217=(($216)|(0))==(($v_0_i)|(0));
   if ($217) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($211)>>2)]=$203;
   HEAP32[(($215)>>2)]=$207;
   var $R_1_i = $203;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $220=(($v_0_i+20)|0);
   var $221=HEAP32[(($220)>>2)];
   var $222=(($221)|(0))==0;
   if ($222) { label = 41; break; } else { var $R_0_i = $221;var $RP_0_i = $220;label = 42; break; }
  case 41: 
   var $224=(($v_0_i+16)|0);
   var $225=HEAP32[(($224)>>2)];
   var $226=(($225)|(0))==0;
   if ($226) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $225;var $RP_0_i = $224;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $227=(($R_0_i+20)|0);
   var $228=HEAP32[(($227)>>2)];
   var $229=(($228)|(0))==0;
   if ($229) { label = 43; break; } else { var $R_0_i = $228;var $RP_0_i = $227;label = 42; break; }
  case 43: 
   var $231=(($R_0_i+16)|0);
   var $232=HEAP32[(($231)>>2)];
   var $233=(($232)|(0))==0;
   if ($233) { label = 44; break; } else { var $R_0_i = $232;var $RP_0_i = $231;label = 42; break; }
  case 44: 
   var $235=$RP_0_i;
   var $236=(($235)>>>(0)) < (($193)>>>(0));
   if ($236) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $240=(($201)|(0))==0;
   if ($240) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $242=(($v_0_i+28)|0);
   var $243=HEAP32[(($242)>>2)];
   var $244=((4472+($243<<2))|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=(($v_0_i)|(0))==(($245)|(0));
   if ($246) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($244)>>2)]=$R_1_i;
   var $cond_i=(($R_1_i)|(0))==0;
   if ($cond_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $248=HEAP32[(($242)>>2)];
   var $249=1 << $248;
   var $250=$249 ^ -1;
   var $251=HEAP32[((((4172)|0))>>2)];
   var $252=$251 & $250;
   HEAP32[((((4172)|0))>>2)]=$252;
   label = 67; break;
  case 51: 
   var $254=$201;
   var $255=HEAP32[((((4184)|0))>>2)];
   var $256=(($254)>>>(0)) < (($255)>>>(0));
   if ($256) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $258=(($201+16)|0);
   var $259=HEAP32[(($258)>>2)];
   var $260=(($259)|(0))==(($v_0_i)|(0));
   if ($260) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($258)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $263=(($201+20)|0);
   HEAP32[(($263)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $266=(($R_1_i)|(0))==0;
   if ($266) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $268=$R_1_i;
   var $269=HEAP32[((((4184)|0))>>2)];
   var $270=(($268)>>>(0)) < (($269)>>>(0));
   if ($270) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $272=(($R_1_i+24)|0);
   HEAP32[(($272)>>2)]=$201;
   var $273=(($v_0_i+16)|0);
   var $274=HEAP32[(($273)>>2)];
   var $275=(($274)|(0))==0;
   if ($275) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $277=$274;
   var $278=HEAP32[((((4184)|0))>>2)];
   var $279=(($277)>>>(0)) < (($278)>>>(0));
   if ($279) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $281=(($R_1_i+16)|0);
   HEAP32[(($281)>>2)]=$274;
   var $282=(($274+24)|0);
   HEAP32[(($282)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $285=(($v_0_i+20)|0);
   var $286=HEAP32[(($285)>>2)];
   var $287=(($286)|(0))==0;
   if ($287) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $289=$286;
   var $290=HEAP32[((((4184)|0))>>2)];
   var $291=(($289)>>>(0)) < (($290)>>>(0));
   if ($291) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $293=(($R_1_i+20)|0);
   HEAP32[(($293)>>2)]=$286;
   var $294=(($286+24)|0);
   HEAP32[(($294)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $298=(($rsize_0_i)>>>(0)) < 16;
   if ($298) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $300=((($rsize_0_i)+($8))|0);
   var $301=$300 | 3;
   var $302=(($v_0_i+4)|0);
   HEAP32[(($302)>>2)]=$301;
   var $_sum4_i=((($300)+(4))|0);
   var $303=(($192+$_sum4_i)|0);
   var $304=$303;
   var $305=HEAP32[(($304)>>2)];
   var $306=$305 | 1;
   HEAP32[(($304)>>2)]=$306;
   label = 77; break;
  case 69: 
   var $308=$8 | 3;
   var $309=(($v_0_i+4)|0);
   HEAP32[(($309)>>2)]=$308;
   var $310=$rsize_0_i | 1;
   var $_sum_i137=$8 | 4;
   var $311=(($192+$_sum_i137)|0);
   var $312=$311;
   HEAP32[(($312)>>2)]=$310;
   var $_sum1_i=((($rsize_0_i)+($8))|0);
   var $313=(($192+$_sum1_i)|0);
   var $314=$313;
   HEAP32[(($314)>>2)]=$rsize_0_i;
   var $315=HEAP32[((((4176)|0))>>2)];
   var $316=(($315)|(0))==0;
   if ($316) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $318=HEAP32[((((4188)|0))>>2)];
   var $319=$315 >>> 3;
   var $320=$319 << 1;
   var $321=((4208+($320<<2))|0);
   var $322=$321;
   var $323=HEAP32[((((4168)|0))>>2)];
   var $324=1 << $319;
   var $325=$323 & $324;
   var $326=(($325)|(0))==0;
   if ($326) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $328=$323 | $324;
   HEAP32[((((4168)|0))>>2)]=$328;
   var $_sum2_pre_i=((($320)+(2))|0);
   var $_pre_i=((4208+($_sum2_pre_i<<2))|0);
   var $F1_0_i = $322;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $_sum3_i=((($320)+(2))|0);
   var $330=((4208+($_sum3_i<<2))|0);
   var $331=HEAP32[(($330)>>2)];
   var $332=$331;
   var $333=HEAP32[((((4184)|0))>>2)];
   var $334=(($332)>>>(0)) < (($333)>>>(0));
   if ($334) { label = 73; break; } else { var $F1_0_i = $331;var $_pre_phi_i = $330;label = 74; break; }
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
   label = 75; break;
  case 75: 
   HEAP32[((((4176)|0))>>2)]=$rsize_0_i;
   HEAP32[((((4188)|0))>>2)]=$197;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $342=(($v_0_i+8)|0);
   var $343=$342;
   var $344=(($342)|(0))==0;
   if ($344) { var $nb_0 = $8;label = 160; break; } else { var $mem_0 = $343;label = 341; break; }
  case 78: 
   var $346=(($bytes)>>>(0)) > 4294967231;
   if ($346) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $348=((($bytes)+(11))|0);
   var $349=$348 & -8;
   var $350=HEAP32[((((4172)|0))>>2)];
   var $351=(($350)|(0))==0;
   if ($351) { var $nb_0 = $349;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $353=(((-$349))|0);
   var $354=$348 >>> 8;
   var $355=(($354)|(0))==0;
   if ($355) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $357=(($349)>>>(0)) > 16777215;
   if ($357) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $359=((($354)+(1048320))|0);
   var $360=$359 >>> 16;
   var $361=$360 & 8;
   var $362=$354 << $361;
   var $363=((($362)+(520192))|0);
   var $364=$363 >>> 16;
   var $365=$364 & 4;
   var $366=$365 | $361;
   var $367=$362 << $365;
   var $368=((($367)+(245760))|0);
   var $369=$368 >>> 16;
   var $370=$369 & 2;
   var $371=$366 | $370;
   var $372=(((14)-($371))|0);
   var $373=$367 << $370;
   var $374=$373 >>> 15;
   var $375=((($372)+($374))|0);
   var $376=$375 << 1;
   var $377=((($375)+(7))|0);
   var $378=$349 >>> (($377)>>>(0));
   var $379=$378 & 1;
   var $380=$379 | $376;
   var $idx_0_i = $380;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $382=((4472+($idx_0_i<<2))|0);
   var $383=HEAP32[(($382)>>2)];
   var $384=(($383)|(0))==0;
   if ($384) { var $v_2_i = 0;var $rsize_2_i = $353;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $386=(($idx_0_i)|(0))==31;
   if ($386) { var $391 = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $388=$idx_0_i >>> 1;
   var $389=(((25)-($388))|0);
   var $391 = $389;label = 86; break;
  case 86: 
   var $391;
   var $392=$349 << $391;
   var $v_0_i118 = 0;var $rsize_0_i117 = $353;var $t_0_i116 = $383;var $sizebits_0_i = $392;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i116;
   var $rsize_0_i117;
   var $v_0_i118;
   var $394=(($t_0_i116+4)|0);
   var $395=HEAP32[(($394)>>2)];
   var $396=$395 & -8;
   var $397=((($396)-($349))|0);
   var $398=(($397)>>>(0)) < (($rsize_0_i117)>>>(0));
   if ($398) { label = 88; break; } else { var $v_1_i = $v_0_i118;var $rsize_1_i = $rsize_0_i117;label = 89; break; }
  case 88: 
   var $400=(($396)|(0))==(($349)|(0));
   if ($400) { var $v_2_i = $t_0_i116;var $rsize_2_i = $397;var $t_1_i = $t_0_i116;label = 90; break; } else { var $v_1_i = $t_0_i116;var $rsize_1_i = $397;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $402=(($t_0_i116+20)|0);
   var $403=HEAP32[(($402)>>2)];
   var $404=$sizebits_0_i >>> 31;
   var $405=(($t_0_i116+16+($404<<2))|0);
   var $406=HEAP32[(($405)>>2)];
   var $407=(($403)|(0))==0;
   var $408=(($403)|(0))==(($406)|(0));
   var $or_cond_i=$407 | $408;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $403;
   var $409=(($406)|(0))==0;
   var $410=$sizebits_0_i << 1;
   if ($409) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i118 = $v_1_i;var $rsize_0_i117 = $rsize_1_i;var $t_0_i116 = $406;var $sizebits_0_i = $410;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $411=(($t_1_i)|(0))==0;
   var $412=(($v_2_i)|(0))==0;
   var $or_cond21_i=$411 & $412;
   if ($or_cond21_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $414=2 << $idx_0_i;
   var $415=(((-$414))|0);
   var $416=$414 | $415;
   var $417=$350 & $416;
   var $418=(($417)|(0))==0;
   if ($418) { var $nb_0 = $349;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $420=(((-$417))|0);
   var $421=$417 & $420;
   var $422=((($421)-(1))|0);
   var $423=$422 >>> 12;
   var $424=$423 & 16;
   var $425=$422 >>> (($424)>>>(0));
   var $426=$425 >>> 5;
   var $427=$426 & 8;
   var $428=$427 | $424;
   var $429=$425 >>> (($427)>>>(0));
   var $430=$429 >>> 2;
   var $431=$430 & 4;
   var $432=$428 | $431;
   var $433=$429 >>> (($431)>>>(0));
   var $434=$433 >>> 1;
   var $435=$434 & 2;
   var $436=$432 | $435;
   var $437=$433 >>> (($435)>>>(0));
   var $438=$437 >>> 1;
   var $439=$438 & 1;
   var $440=$436 | $439;
   var $441=$437 >>> (($439)>>>(0));
   var $442=((($440)+($441))|0);
   var $443=((4472+($442<<2))|0);
   var $444=HEAP32[(($443)>>2)];
   var $t_2_ph_i = $444;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $445=(($t_2_ph_i)|(0))==0;
   if ($445) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_228_i = $t_2_ph_i;var $rsize_329_i = $rsize_2_i;var $v_330_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_330_i;
   var $rsize_329_i;
   var $t_228_i;
   var $446=(($t_228_i+4)|0);
   var $447=HEAP32[(($446)>>2)];
   var $448=$447 & -8;
   var $449=((($448)-($349))|0);
   var $450=(($449)>>>(0)) < (($rsize_329_i)>>>(0));
   var $_rsize_3_i=$450 ? $449 : $rsize_329_i;
   var $t_2_v_3_i=$450 ? $t_228_i : $v_330_i;
   var $451=(($t_228_i+16)|0);
   var $452=HEAP32[(($451)>>2)];
   var $453=(($452)|(0))==0;
   if ($453) { label = 95; break; } else { var $t_228_i = $452;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $454=(($t_228_i+20)|0);
   var $455=HEAP32[(($454)>>2)];
   var $456=(($455)|(0))==0;
   if ($456) { var $rsize_3_lcssa_i = $_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_228_i = $455;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $457=(($v_3_lcssa_i)|(0))==0;
   if ($457) { var $nb_0 = $349;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $459=HEAP32[((((4176)|0))>>2)];
   var $460=((($459)-($349))|0);
   var $461=(($rsize_3_lcssa_i)>>>(0)) < (($460)>>>(0));
   if ($461) { label = 98; break; } else { var $nb_0 = $349;label = 160; break; }
  case 98: 
   var $463=$v_3_lcssa_i;
   var $464=HEAP32[((((4184)|0))>>2)];
   var $465=(($463)>>>(0)) < (($464)>>>(0));
   if ($465) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $467=(($463+$349)|0);
   var $468=$467;
   var $469=(($463)>>>(0)) < (($467)>>>(0));
   if ($469) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $471=(($v_3_lcssa_i+24)|0);
   var $472=HEAP32[(($471)>>2)];
   var $473=(($v_3_lcssa_i+12)|0);
   var $474=HEAP32[(($473)>>2)];
   var $475=(($474)|(0))==(($v_3_lcssa_i)|(0));
   if ($475) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $477=(($v_3_lcssa_i+8)|0);
   var $478=HEAP32[(($477)>>2)];
   var $479=$478;
   var $480=(($479)>>>(0)) < (($464)>>>(0));
   if ($480) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $482=(($478+12)|0);
   var $483=HEAP32[(($482)>>2)];
   var $484=(($483)|(0))==(($v_3_lcssa_i)|(0));
   if ($484) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $486=(($474+8)|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=(($487)|(0))==(($v_3_lcssa_i)|(0));
   if ($488) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($482)>>2)]=$474;
   HEAP32[(($486)>>2)]=$478;
   var $R_1_i122 = $474;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $491=(($v_3_lcssa_i+20)|0);
   var $492=HEAP32[(($491)>>2)];
   var $493=(($492)|(0))==0;
   if ($493) { label = 107; break; } else { var $R_0_i120 = $492;var $RP_0_i119 = $491;label = 108; break; }
  case 107: 
   var $495=(($v_3_lcssa_i+16)|0);
   var $496=HEAP32[(($495)>>2)];
   var $497=(($496)|(0))==0;
   if ($497) { var $R_1_i122 = 0;label = 113; break; } else { var $R_0_i120 = $496;var $RP_0_i119 = $495;label = 108; break; }
  case 108: 
   var $RP_0_i119;
   var $R_0_i120;
   var $498=(($R_0_i120+20)|0);
   var $499=HEAP32[(($498)>>2)];
   var $500=(($499)|(0))==0;
   if ($500) { label = 109; break; } else { var $R_0_i120 = $499;var $RP_0_i119 = $498;label = 108; break; }
  case 109: 
   var $502=(($R_0_i120+16)|0);
   var $503=HEAP32[(($502)>>2)];
   var $504=(($503)|(0))==0;
   if ($504) { label = 110; break; } else { var $R_0_i120 = $503;var $RP_0_i119 = $502;label = 108; break; }
  case 110: 
   var $506=$RP_0_i119;
   var $507=(($506)>>>(0)) < (($464)>>>(0));
   if ($507) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i119)>>2)]=0;
   var $R_1_i122 = $R_0_i120;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i122;
   var $511=(($472)|(0))==0;
   if ($511) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $513=(($v_3_lcssa_i+28)|0);
   var $514=HEAP32[(($513)>>2)];
   var $515=((4472+($514<<2))|0);
   var $516=HEAP32[(($515)>>2)];
   var $517=(($v_3_lcssa_i)|(0))==(($516)|(0));
   if ($517) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($515)>>2)]=$R_1_i122;
   var $cond_i123=(($R_1_i122)|(0))==0;
   if ($cond_i123) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $519=HEAP32[(($513)>>2)];
   var $520=1 << $519;
   var $521=$520 ^ -1;
   var $522=HEAP32[((((4172)|0))>>2)];
   var $523=$522 & $521;
   HEAP32[((((4172)|0))>>2)]=$523;
   label = 133; break;
  case 117: 
   var $525=$472;
   var $526=HEAP32[((((4184)|0))>>2)];
   var $527=(($525)>>>(0)) < (($526)>>>(0));
   if ($527) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $529=(($472+16)|0);
   var $530=HEAP32[(($529)>>2)];
   var $531=(($530)|(0))==(($v_3_lcssa_i)|(0));
   if ($531) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($529)>>2)]=$R_1_i122;
   label = 122; break;
  case 120: 
   var $534=(($472+20)|0);
   HEAP32[(($534)>>2)]=$R_1_i122;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $537=(($R_1_i122)|(0))==0;
   if ($537) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $539=$R_1_i122;
   var $540=HEAP32[((((4184)|0))>>2)];
   var $541=(($539)>>>(0)) < (($540)>>>(0));
   if ($541) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $543=(($R_1_i122+24)|0);
   HEAP32[(($543)>>2)]=$472;
   var $544=(($v_3_lcssa_i+16)|0);
   var $545=HEAP32[(($544)>>2)];
   var $546=(($545)|(0))==0;
   if ($546) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $548=$545;
   var $549=HEAP32[((((4184)|0))>>2)];
   var $550=(($548)>>>(0)) < (($549)>>>(0));
   if ($550) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $552=(($R_1_i122+16)|0);
   HEAP32[(($552)>>2)]=$545;
   var $553=(($545+24)|0);
   HEAP32[(($553)>>2)]=$R_1_i122;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $556=(($v_3_lcssa_i+20)|0);
   var $557=HEAP32[(($556)>>2)];
   var $558=(($557)|(0))==0;
   if ($558) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $560=$557;
   var $561=HEAP32[((((4184)|0))>>2)];
   var $562=(($560)>>>(0)) < (($561)>>>(0));
   if ($562) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $564=(($R_1_i122+20)|0);
   HEAP32[(($564)>>2)]=$557;
   var $565=(($557+24)|0);
   HEAP32[(($565)>>2)]=$R_1_i122;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $569=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($569) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $571=((($rsize_3_lcssa_i)+($349))|0);
   var $572=$571 | 3;
   var $573=(($v_3_lcssa_i+4)|0);
   HEAP32[(($573)>>2)]=$572;
   var $_sum19_i=((($571)+(4))|0);
   var $574=(($463+$_sum19_i)|0);
   var $575=$574;
   var $576=HEAP32[(($575)>>2)];
   var $577=$576 | 1;
   HEAP32[(($575)>>2)]=$577;
   label = 159; break;
  case 135: 
   var $579=$349 | 3;
   var $580=(($v_3_lcssa_i+4)|0);
   HEAP32[(($580)>>2)]=$579;
   var $581=$rsize_3_lcssa_i | 1;
   var $_sum_i125136=$349 | 4;
   var $582=(($463+$_sum_i125136)|0);
   var $583=$582;
   HEAP32[(($583)>>2)]=$581;
   var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
   var $584=(($463+$_sum1_i126)|0);
   var $585=$584;
   HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
   var $586=$rsize_3_lcssa_i >>> 3;
   var $587=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($587) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $589=$586 << 1;
   var $590=((4208+($589<<2))|0);
   var $591=$590;
   var $592=HEAP32[((((4168)|0))>>2)];
   var $593=1 << $586;
   var $594=$592 & $593;
   var $595=(($594)|(0))==0;
   if ($595) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $597=$592 | $593;
   HEAP32[((((4168)|0))>>2)]=$597;
   var $_sum15_pre_i=((($589)+(2))|0);
   var $_pre_i127=((4208+($_sum15_pre_i<<2))|0);
   var $F5_0_i = $591;var $_pre_phi_i128 = $_pre_i127;label = 140; break;
  case 138: 
   var $_sum18_i=((($589)+(2))|0);
   var $599=((4208+($_sum18_i<<2))|0);
   var $600=HEAP32[(($599)>>2)];
   var $601=$600;
   var $602=HEAP32[((((4184)|0))>>2)];
   var $603=(($601)>>>(0)) < (($602)>>>(0));
   if ($603) { label = 139; break; } else { var $F5_0_i = $600;var $_pre_phi_i128 = $599;label = 140; break; }
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
   label = 159; break;
  case 141: 
   var $612=$467;
   var $613=$rsize_3_lcssa_i >>> 8;
   var $614=(($613)|(0))==0;
   if ($614) { var $I7_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $616=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($616) { var $I7_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $618=((($613)+(1048320))|0);
   var $619=$618 >>> 16;
   var $620=$619 & 8;
   var $621=$613 << $620;
   var $622=((($621)+(520192))|0);
   var $623=$622 >>> 16;
   var $624=$623 & 4;
   var $625=$624 | $620;
   var $626=$621 << $624;
   var $627=((($626)+(245760))|0);
   var $628=$627 >>> 16;
   var $629=$628 & 2;
   var $630=$625 | $629;
   var $631=(((14)-($630))|0);
   var $632=$626 << $629;
   var $633=$632 >>> 15;
   var $634=((($631)+($633))|0);
   var $635=$634 << 1;
   var $636=((($634)+(7))|0);
   var $637=$rsize_3_lcssa_i >>> (($636)>>>(0));
   var $638=$637 & 1;
   var $639=$638 | $635;
   var $I7_0_i = $639;label = 144; break;
  case 144: 
   var $I7_0_i;
   var $641=((4472+($I7_0_i<<2))|0);
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
   var $648=HEAP32[((((4172)|0))>>2)];
   var $649=1 << $I7_0_i;
   var $650=$648 & $649;
   var $651=(($650)|(0))==0;
   if ($651) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $653=$648 | $649;
   HEAP32[((((4172)|0))>>2)]=$653;
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
   label = 159; break;
  case 146: 
   var $662=HEAP32[(($641)>>2)];
   var $663=(($I7_0_i)|(0))==31;
   if ($663) { var $668 = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $665=$I7_0_i >>> 1;
   var $666=(((25)-($665))|0);
   var $668 = $666;label = 148; break;
  case 148: 
   var $668;
   var $669=$rsize_3_lcssa_i << $668;
   var $K12_0_i = $669;var $T_0_i = $662;label = 149; break;
  case 149: 
   var $T_0_i;
   var $K12_0_i;
   var $671=(($T_0_i+4)|0);
   var $672=HEAP32[(($671)>>2)];
   var $673=$672 & -8;
   var $674=(($673)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($674) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $676=$K12_0_i >>> 31;
   var $677=(($T_0_i+16+($676<<2))|0);
   var $678=HEAP32[(($677)>>2)];
   var $679=(($678)|(0))==0;
   var $680=$K12_0_i << 1;
   if ($679) { label = 151; break; } else { var $K12_0_i = $680;var $T_0_i = $678;label = 149; break; }
  case 151: 
   var $682=$677;
   var $683=HEAP32[((((4184)|0))>>2)];
   var $684=(($682)>>>(0)) < (($683)>>>(0));
   if ($684) { label = 153; break; } else { label = 152; break; }
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
   label = 159; break;
  case 153: 
   _abort();
   throw "Reached an unreachable!";
  case 154: 
   var $694=(($T_0_i+8)|0);
   var $695=HEAP32[(($694)>>2)];
   var $696=$T_0_i;
   var $697=HEAP32[((((4184)|0))>>2)];
   var $698=(($696)>>>(0)) < (($697)>>>(0));
   if ($698) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $700=$695;
   var $701=(($700)>>>(0)) < (($697)>>>(0));
   if ($701) { label = 157; break; } else { label = 156; break; }
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
   label = 159; break;
  case 157: 
   _abort();
   throw "Reached an unreachable!";
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   var $711=(($v_3_lcssa_i+8)|0);
   var $712=$711;
   var $713=(($711)|(0))==0;
   if ($713) { var $nb_0 = $349;label = 160; break; } else { var $mem_0 = $712;label = 341; break; }
  case 160: 
   var $nb_0;
   var $714=HEAP32[((((4176)|0))>>2)];
   var $715=(($nb_0)>>>(0)) > (($714)>>>(0));
   if ($715) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $717=((($714)-($nb_0))|0);
   var $718=HEAP32[((((4188)|0))>>2)];
   var $719=(($717)>>>(0)) > 15;
   if ($719) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $721=$718;
   var $722=(($721+$nb_0)|0);
   var $723=$722;
   HEAP32[((((4188)|0))>>2)]=$723;
   HEAP32[((((4176)|0))>>2)]=$717;
   var $724=$717 | 1;
   var $_sum102=((($nb_0)+(4))|0);
   var $725=(($721+$_sum102)|0);
   var $726=$725;
   HEAP32[(($726)>>2)]=$724;
   var $727=(($721+$714)|0);
   var $728=$727;
   HEAP32[(($728)>>2)]=$717;
   var $729=$nb_0 | 3;
   var $730=(($718+4)|0);
   HEAP32[(($730)>>2)]=$729;
   label = 164; break;
  case 163: 
   HEAP32[((((4176)|0))>>2)]=0;
   HEAP32[((((4188)|0))>>2)]=0;
   var $732=$714 | 3;
   var $733=(($718+4)|0);
   HEAP32[(($733)>>2)]=$732;
   var $734=$718;
   var $_sum101=((($714)+(4))|0);
   var $735=(($734+$_sum101)|0);
   var $736=$735;
   var $737=HEAP32[(($736)>>2)];
   var $738=$737 | 1;
   HEAP32[(($736)>>2)]=$738;
   label = 164; break;
  case 164: 
   var $740=(($718+8)|0);
   var $741=$740;
   var $mem_0 = $741;label = 341; break;
  case 165: 
   var $743=HEAP32[((((4180)|0))>>2)];
   var $744=(($nb_0)>>>(0)) < (($743)>>>(0));
   if ($744) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $746=((($743)-($nb_0))|0);
   HEAP32[((((4180)|0))>>2)]=$746;
   var $747=HEAP32[((((4192)|0))>>2)];
   var $748=$747;
   var $749=(($748+$nb_0)|0);
   var $750=$749;
   HEAP32[((((4192)|0))>>2)]=$750;
   var $751=$746 | 1;
   var $_sum=((($nb_0)+(4))|0);
   var $752=(($748+$_sum)|0);
   var $753=$752;
   HEAP32[(($753)>>2)]=$751;
   var $754=$nb_0 | 3;
   var $755=(($747+4)|0);
   HEAP32[(($755)>>2)]=$754;
   var $756=(($747+8)|0);
   var $757=$756;
   var $mem_0 = $757;label = 341; break;
  case 167: 
   var $759=HEAP32[((((4144)|0))>>2)];
   var $760=(($759)|(0))==0;
   if ($760) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $762=_sysconf(8);
   var $763=((($762)-(1))|0);
   var $764=$763 & $762;
   var $765=(($764)|(0))==0;
   if ($765) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((4152)|0))>>2)]=$762;
   HEAP32[((((4148)|0))>>2)]=$762;
   HEAP32[((((4156)|0))>>2)]=-1;
   HEAP32[((((4160)|0))>>2)]=2097152;
   HEAP32[((((4164)|0))>>2)]=0;
   HEAP32[((((4612)|0))>>2)]=0;
   var $767=_time(0);
   var $768=$767 & -16;
   var $769=$768 ^ 1431655768;
   HEAP32[((((4144)|0))>>2)]=$769;
   label = 171; break;
  case 171: 
   var $771=((($nb_0)+(48))|0);
   var $772=HEAP32[((((4152)|0))>>2)];
   var $773=((($nb_0)+(47))|0);
   var $774=((($772)+($773))|0);
   var $775=(((-$772))|0);
   var $776=$774 & $775;
   var $777=(($776)>>>(0)) > (($nb_0)>>>(0));
   if ($777) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $779=HEAP32[((((4608)|0))>>2)];
   var $780=(($779)|(0))==0;
   if ($780) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $782=HEAP32[((((4600)|0))>>2)];
   var $783=((($782)+($776))|0);
   var $784=(($783)>>>(0)) <= (($782)>>>(0));
   var $785=(($783)>>>(0)) > (($779)>>>(0));
   var $or_cond1_i=$784 | $785;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $787=HEAP32[((((4612)|0))>>2)];
   var $788=$787 & 4;
   var $789=(($788)|(0))==0;
   if ($789) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $791=HEAP32[((((4192)|0))>>2)];
   var $792=(($791)|(0))==0;
   if ($792) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $794=$791;
   var $sp_0_i_i = ((4616)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $796=(($sp_0_i_i)|0);
   var $797=HEAP32[(($796)>>2)];
   var $798=(($797)>>>(0)) > (($794)>>>(0));
   if ($798) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $800=(($sp_0_i_i+4)|0);
   var $801=HEAP32[(($800)>>2)];
   var $802=(($797+$801)|0);
   var $803=(($802)>>>(0)) > (($794)>>>(0));
   if ($803) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $805=(($sp_0_i_i+8)|0);
   var $806=HEAP32[(($805)>>2)];
   var $807=(($806)|(0))==0;
   if ($807) { label = 181; break; } else { var $sp_0_i_i = $806;label = 177; break; }
  case 180: 
   var $808=(($sp_0_i_i)|(0))==0;
   if ($808) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $809=_sbrk(0);
   var $810=(($809)|(0))==-1;
   if ($810) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $812=$809;
   var $813=HEAP32[((((4148)|0))>>2)];
   var $814=((($813)-(1))|0);
   var $815=$814 & $812;
   var $816=(($815)|(0))==0;
   if ($816) { var $ssize_0_i = $776;label = 184; break; } else { label = 183; break; }
  case 183: 
   var $818=((($814)+($812))|0);
   var $819=(((-$813))|0);
   var $820=$818 & $819;
   var $821=((($776)-($812))|0);
   var $822=((($821)+($820))|0);
   var $ssize_0_i = $822;label = 184; break;
  case 184: 
   var $ssize_0_i;
   var $824=HEAP32[((((4600)|0))>>2)];
   var $825=((($824)+($ssize_0_i))|0);
   var $826=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $827=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i131=$826 & $827;
   if ($or_cond_i131) { label = 185; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 185: 
   var $829=HEAP32[((((4608)|0))>>2)];
   var $830=(($829)|(0))==0;
   if ($830) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $832=(($825)>>>(0)) <= (($824)>>>(0));
   var $833=(($825)>>>(0)) > (($829)>>>(0));
   var $or_cond2_i=$832 | $833;
   if ($or_cond2_i) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $835=_sbrk($ssize_0_i);
   var $836=(($835)|(0))==(($809)|(0));
   var $ssize_0__i=$836 ? $ssize_0_i : 0;
   var $__i=$836 ? $809 : -1;
   var $tbase_0_i = $__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $835;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $838=HEAP32[((((4180)|0))>>2)];
   var $839=((($774)-($838))|0);
   var $840=$839 & $775;
   var $841=(($840)>>>(0)) < 2147483647;
   if ($841) { label = 189; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 189: 
   var $843=_sbrk($840);
   var $844=HEAP32[(($796)>>2)];
   var $845=HEAP32[(($800)>>2)];
   var $846=(($844+$845)|0);
   var $847=(($843)|(0))==(($846)|(0));
   var $_3_i=$847 ? $840 : 0;
   var $_4_i=$847 ? $843 : -1;
   var $tbase_0_i = $_4_i;var $tsize_0_i = $_3_i;var $br_0_i = $843;var $ssize_1_i = $840;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $849=(((-$ssize_1_i))|0);
   var $850=(($tbase_0_i)|(0))==-1;
   if ($850) { label = 191; break; } else { var $tsize_244_i = $tsize_0_i;var $tbase_245_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $852=(($br_0_i)|(0))!=-1;
   var $853=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond5_i=$852 & $853;
   var $854=(($ssize_1_i)>>>(0)) < (($771)>>>(0));
   var $or_cond6_i=$or_cond5_i & $854;
   if ($or_cond6_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $856=HEAP32[((((4152)|0))>>2)];
   var $857=((($773)-($ssize_1_i))|0);
   var $858=((($857)+($856))|0);
   var $859=(((-$856))|0);
   var $860=$858 & $859;
   var $861=(($860)>>>(0)) < 2147483647;
   if ($861) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $863=_sbrk($860);
   var $864=(($863)|(0))==-1;
   if ($864) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $866=((($860)+($ssize_1_i))|0);
   var $ssize_2_i = $866;label = 196; break;
  case 195: 
   var $868=_sbrk($849);
   var $tsize_0303639_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $870=(($br_0_i)|(0))==-1;
   if ($870) { var $tsize_0303639_i = $tsize_0_i;label = 197; break; } else { var $tsize_244_i = $ssize_2_i;var $tbase_245_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0303639_i;
   var $871=HEAP32[((((4612)|0))>>2)];
   var $872=$871 | 4;
   HEAP32[((((4612)|0))>>2)]=$872;
   var $tsize_1_i = $tsize_0303639_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $874=(($776)>>>(0)) < 2147483647;
   if ($874) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $876=_sbrk($776);
   var $877=_sbrk(0);
   var $notlhs_i=(($876)|(0))!=-1;
   var $notrhs_i=(($877)|(0))!=-1;
   var $or_cond8_not_i=$notrhs_i & $notlhs_i;
   var $878=(($876)>>>(0)) < (($877)>>>(0));
   var $or_cond9_i=$or_cond8_not_i & $878;
   if ($or_cond9_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $879=$877;
   var $880=$876;
   var $881=((($879)-($880))|0);
   var $882=((($nb_0)+(40))|0);
   var $883=(($881)>>>(0)) > (($882)>>>(0));
   var $_tsize_1_i=$883 ? $881 : $tsize_1_i;
   var $_tbase_1_i=$883 ? $876 : -1;
   var $884=(($_tbase_1_i)|(0))==-1;
   if ($884) { label = 340; break; } else { var $tsize_244_i = $_tsize_1_i;var $tbase_245_i = $_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_245_i;
   var $tsize_244_i;
   var $885=HEAP32[((((4600)|0))>>2)];
   var $886=((($885)+($tsize_244_i))|0);
   HEAP32[((((4600)|0))>>2)]=$886;
   var $887=HEAP32[((((4604)|0))>>2)];
   var $888=(($886)>>>(0)) > (($887)>>>(0));
   if ($888) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((4604)|0))>>2)]=$886;
   label = 203; break;
  case 203: 
   var $890=HEAP32[((((4192)|0))>>2)];
   var $891=(($890)|(0))==0;
   if ($891) { label = 204; break; } else { var $sp_067_i = ((4616)|0);label = 211; break; }
  case 204: 
   var $893=HEAP32[((((4184)|0))>>2)];
   var $894=(($893)|(0))==0;
   var $895=(($tbase_245_i)>>>(0)) < (($893)>>>(0));
   var $or_cond10_i=$894 | $895;
   if ($or_cond10_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((4184)|0))>>2)]=$tbase_245_i;
   label = 206; break;
  case 206: 
   HEAP32[((((4616)|0))>>2)]=$tbase_245_i;
   HEAP32[((((4620)|0))>>2)]=$tsize_244_i;
   HEAP32[((((4628)|0))>>2)]=0;
   var $897=HEAP32[((((4144)|0))>>2)];
   HEAP32[((((4204)|0))>>2)]=$897;
   HEAP32[((((4200)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $899=$i_02_i_i << 1;
   var $900=((4208+($899<<2))|0);
   var $901=$900;
   var $_sum_i_i=((($899)+(3))|0);
   var $902=((4208+($_sum_i_i<<2))|0);
   HEAP32[(($902)>>2)]=$901;
   var $_sum1_i_i=((($899)+(2))|0);
   var $903=((4208+($_sum1_i_i<<2))|0);
   HEAP32[(($903)>>2)]=$901;
   var $904=((($i_02_i_i)+(1))|0);
   var $905=(($904)>>>(0)) < 32;
   if ($905) { var $i_02_i_i = $904;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $906=((($tsize_244_i)-(40))|0);
   var $907=(($tbase_245_i+8)|0);
   var $908=$907;
   var $909=$908 & 7;
   var $910=(($909)|(0))==0;
   if ($910) { var $914 = 0;label = 210; break; } else { label = 209; break; }
  case 209: 
   var $912=(((-$908))|0);
   var $913=$912 & 7;
   var $914 = $913;label = 210; break;
  case 210: 
   var $914;
   var $915=(($tbase_245_i+$914)|0);
   var $916=$915;
   var $917=((($906)-($914))|0);
   HEAP32[((((4192)|0))>>2)]=$916;
   HEAP32[((((4180)|0))>>2)]=$917;
   var $918=$917 | 1;
   var $_sum_i14_i=((($914)+(4))|0);
   var $919=(($tbase_245_i+$_sum_i14_i)|0);
   var $920=$919;
   HEAP32[(($920)>>2)]=$918;
   var $_sum2_i_i=((($tsize_244_i)-(36))|0);
   var $921=(($tbase_245_i+$_sum2_i_i)|0);
   var $922=$921;
   HEAP32[(($922)>>2)]=40;
   var $923=HEAP32[((((4160)|0))>>2)];
   HEAP32[((((4196)|0))>>2)]=$923;
   label = 338; break;
  case 211: 
   var $sp_067_i;
   var $924=(($sp_067_i)|0);
   var $925=HEAP32[(($924)>>2)];
   var $926=(($sp_067_i+4)|0);
   var $927=HEAP32[(($926)>>2)];
   var $928=(($925+$927)|0);
   var $929=(($tbase_245_i)|(0))==(($928)|(0));
   if ($929) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $931=(($sp_067_i+8)|0);
   var $932=HEAP32[(($931)>>2)];
   var $933=(($932)|(0))==0;
   if ($933) { label = 218; break; } else { var $sp_067_i = $932;label = 211; break; }
  case 213: 
   var $934=(($sp_067_i+12)|0);
   var $935=HEAP32[(($934)>>2)];
   var $936=$935 & 8;
   var $937=(($936)|(0))==0;
   if ($937) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $939=$890;
   var $940=(($939)>>>(0)) >= (($925)>>>(0));
   var $941=(($939)>>>(0)) < (($tbase_245_i)>>>(0));
   var $or_cond47_i=$940 & $941;
   if ($or_cond47_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $943=((($927)+($tsize_244_i))|0);
   HEAP32[(($926)>>2)]=$943;
   var $944=HEAP32[((((4192)|0))>>2)];
   var $945=HEAP32[((((4180)|0))>>2)];
   var $946=((($945)+($tsize_244_i))|0);
   var $947=$944;
   var $948=(($944+8)|0);
   var $949=$948;
   var $950=$949 & 7;
   var $951=(($950)|(0))==0;
   if ($951) { var $955 = 0;label = 217; break; } else { label = 216; break; }
  case 216: 
   var $953=(((-$949))|0);
   var $954=$953 & 7;
   var $955 = $954;label = 217; break;
  case 217: 
   var $955;
   var $956=(($947+$955)|0);
   var $957=$956;
   var $958=((($946)-($955))|0);
   HEAP32[((((4192)|0))>>2)]=$957;
   HEAP32[((((4180)|0))>>2)]=$958;
   var $959=$958 | 1;
   var $_sum_i18_i=((($955)+(4))|0);
   var $960=(($947+$_sum_i18_i)|0);
   var $961=$960;
   HEAP32[(($961)>>2)]=$959;
   var $_sum2_i19_i=((($946)+(4))|0);
   var $962=(($947+$_sum2_i19_i)|0);
   var $963=$962;
   HEAP32[(($963)>>2)]=40;
   var $964=HEAP32[((((4160)|0))>>2)];
   HEAP32[((((4196)|0))>>2)]=$964;
   label = 338; break;
  case 218: 
   var $965=HEAP32[((((4184)|0))>>2)];
   var $966=(($tbase_245_i)>>>(0)) < (($965)>>>(0));
   if ($966) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((4184)|0))>>2)]=$tbase_245_i;
   label = 220; break;
  case 220: 
   var $968=(($tbase_245_i+$tsize_244_i)|0);
   var $sp_160_i = ((4616)|0);label = 221; break;
  case 221: 
   var $sp_160_i;
   var $970=(($sp_160_i)|0);
   var $971=HEAP32[(($970)>>2)];
   var $972=(($971)|(0))==(($968)|(0));
   if ($972) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $974=(($sp_160_i+8)|0);
   var $975=HEAP32[(($974)>>2)];
   var $976=(($975)|(0))==0;
   if ($976) { label = 304; break; } else { var $sp_160_i = $975;label = 221; break; }
  case 223: 
   var $977=(($sp_160_i+12)|0);
   var $978=HEAP32[(($977)>>2)];
   var $979=$978 & 8;
   var $980=(($979)|(0))==0;
   if ($980) { label = 224; break; } else { label = 304; break; }
  case 224: 
   HEAP32[(($970)>>2)]=$tbase_245_i;
   var $982=(($sp_160_i+4)|0);
   var $983=HEAP32[(($982)>>2)];
   var $984=((($983)+($tsize_244_i))|0);
   HEAP32[(($982)>>2)]=$984;
   var $985=(($tbase_245_i+8)|0);
   var $986=$985;
   var $987=$986 & 7;
   var $988=(($987)|(0))==0;
   if ($988) { var $993 = 0;label = 226; break; } else { label = 225; break; }
  case 225: 
   var $990=(((-$986))|0);
   var $991=$990 & 7;
   var $993 = $991;label = 226; break;
  case 226: 
   var $993;
   var $994=(($tbase_245_i+$993)|0);
   var $_sum93_i=((($tsize_244_i)+(8))|0);
   var $995=(($tbase_245_i+$_sum93_i)|0);
   var $996=$995;
   var $997=$996 & 7;
   var $998=(($997)|(0))==0;
   if ($998) { var $1003 = 0;label = 228; break; } else { label = 227; break; }
  case 227: 
   var $1000=(((-$996))|0);
   var $1001=$1000 & 7;
   var $1003 = $1001;label = 228; break;
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
   var $1012=$nb_0 | 3;
   var $_sum1_i22_i=((($993)+(4))|0);
   var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
   var $1014=$1013;
   HEAP32[(($1014)>>2)]=$1012;
   var $1015=HEAP32[((((4192)|0))>>2)];
   var $1016=(($1005)|(0))==(($1015)|(0));
   if ($1016) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $1018=HEAP32[((((4180)|0))>>2)];
   var $1019=((($1018)+($1011))|0);
   HEAP32[((((4180)|0))>>2)]=$1019;
   HEAP32[((((4192)|0))>>2)]=$1010;
   var $1020=$1019 | 1;
   var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
   var $1021=(($tbase_245_i+$_sum46_i_i)|0);
   var $1022=$1021;
   HEAP32[(($1022)>>2)]=$1020;
   label = 303; break;
  case 230: 
   var $1024=HEAP32[((((4188)|0))>>2)];
   var $1025=(($1005)|(0))==(($1024)|(0));
   if ($1025) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $1027=HEAP32[((((4176)|0))>>2)];
   var $1028=((($1027)+($1011))|0);
   HEAP32[((((4176)|0))>>2)]=$1028;
   HEAP32[((((4188)|0))>>2)]=$1010;
   var $1029=$1028 | 1;
   var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
   var $1030=(($tbase_245_i+$_sum44_i_i)|0);
   var $1031=$1030;
   HEAP32[(($1031)>>2)]=$1029;
   var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
   var $1032=(($tbase_245_i+$_sum45_i_i)|0);
   var $1033=$1032;
   HEAP32[(($1033)>>2)]=$1028;
   label = 303; break;
  case 232: 
   var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
   var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
   var $1035=(($tbase_245_i+$_sum95_i)|0);
   var $1036=$1035;
   var $1037=HEAP32[(($1036)>>2)];
   var $1038=$1037 & 3;
   var $1039=(($1038)|(0))==1;
   if ($1039) { label = 233; break; } else { var $oldfirst_0_i_i = $1005;var $qsize_0_i_i = $1011;label = 280; break; }
  case 233: 
   var $1041=$1037 & -8;
   var $1042=$1037 >>> 3;
   var $1043=(($1037)>>>(0)) < 256;
   if ($1043) { label = 234; break; } else { label = 246; break; }
  case 234: 
   var $_sum3940_i_i=$1003 | 8;
   var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
   var $1045=(($tbase_245_i+$_sum105_i)|0);
   var $1046=$1045;
   var $1047=HEAP32[(($1046)>>2)];
   var $_sum41_i_i=((($tsize_244_i)+(12))|0);
   var $_sum106_i=((($_sum41_i_i)+($1003))|0);
   var $1048=(($tbase_245_i+$_sum106_i)|0);
   var $1049=$1048;
   var $1050=HEAP32[(($1049)>>2)];
   var $1051=$1042 << 1;
   var $1052=((4208+($1051<<2))|0);
   var $1053=$1052;
   var $1054=(($1047)|(0))==(($1053)|(0));
   if ($1054) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $1056=$1047;
   var $1057=HEAP32[((((4184)|0))>>2)];
   var $1058=(($1056)>>>(0)) < (($1057)>>>(0));
   if ($1058) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $1060=(($1047+12)|0);
   var $1061=HEAP32[(($1060)>>2)];
   var $1062=(($1061)|(0))==(($1005)|(0));
   if ($1062) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $1063=(($1050)|(0))==(($1047)|(0));
   if ($1063) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $1065=1 << $1042;
   var $1066=$1065 ^ -1;
   var $1067=HEAP32[((((4168)|0))>>2)];
   var $1068=$1067 & $1066;
   HEAP32[((((4168)|0))>>2)]=$1068;
   label = 279; break;
  case 239: 
   var $1070=(($1050)|(0))==(($1053)|(0));
   if ($1070) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $_pre56_i_i=(($1050+8)|0);
   var $_pre_phi57_i_i = $_pre56_i_i;label = 243; break;
  case 241: 
   var $1072=$1050;
   var $1073=HEAP32[((((4184)|0))>>2)];
   var $1074=(($1072)>>>(0)) < (($1073)>>>(0));
   if ($1074) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $1076=(($1050+8)|0);
   var $1077=HEAP32[(($1076)>>2)];
   var $1078=(($1077)|(0))==(($1005)|(0));
   if ($1078) { var $_pre_phi57_i_i = $1076;label = 243; break; } else { label = 244; break; }
  case 243: 
   var $_pre_phi57_i_i;
   var $1079=(($1047+12)|0);
   HEAP32[(($1079)>>2)]=$1050;
   HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
   label = 279; break;
  case 244: 
   _abort();
   throw "Reached an unreachable!";
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   var $1081=$1004;
   var $_sum34_i_i=$1003 | 24;
   var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
   var $1082=(($tbase_245_i+$_sum96_i)|0);
   var $1083=$1082;
   var $1084=HEAP32[(($1083)>>2)];
   var $_sum5_i_i=((($tsize_244_i)+(12))|0);
   var $_sum97_i=((($_sum5_i_i)+($1003))|0);
   var $1085=(($tbase_245_i+$_sum97_i)|0);
   var $1086=$1085;
   var $1087=HEAP32[(($1086)>>2)];
   var $1088=(($1087)|(0))==(($1081)|(0));
   if ($1088) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $_sum3637_i_i=$1003 | 8;
   var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
   var $1090=(($tbase_245_i+$_sum98_i)|0);
   var $1091=$1090;
   var $1092=HEAP32[(($1091)>>2)];
   var $1093=$1092;
   var $1094=HEAP32[((((4184)|0))>>2)];
   var $1095=(($1093)>>>(0)) < (($1094)>>>(0));
   if ($1095) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $1097=(($1092+12)|0);
   var $1098=HEAP32[(($1097)>>2)];
   var $1099=(($1098)|(0))==(($1081)|(0));
   if ($1099) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $1101=(($1087+8)|0);
   var $1102=HEAP32[(($1101)>>2)];
   var $1103=(($1102)|(0))==(($1081)|(0));
   if ($1103) { label = 250; break; } else { label = 251; break; }
  case 250: 
   HEAP32[(($1097)>>2)]=$1087;
   HEAP32[(($1101)>>2)]=$1092;
   var $R_1_i_i = $1087;label = 259; break;
  case 251: 
   _abort();
   throw "Reached an unreachable!";
  case 252: 
   var $_sum67_i_i=$1003 | 16;
   var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
   var $1106=(($tbase_245_i+$_sum103_i)|0);
   var $1107=$1106;
   var $1108=HEAP32[(($1107)>>2)];
   var $1109=(($1108)|(0))==0;
   if ($1109) { label = 253; break; } else { var $R_0_i_i = $1108;var $RP_0_i_i = $1107;label = 254; break; }
  case 253: 
   var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
   var $1111=(($tbase_245_i+$_sum104_i)|0);
   var $1112=$1111;
   var $1113=HEAP32[(($1112)>>2)];
   var $1114=(($1113)|(0))==0;
   if ($1114) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $1113;var $RP_0_i_i = $1112;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $1115=(($R_0_i_i+20)|0);
   var $1116=HEAP32[(($1115)>>2)];
   var $1117=(($1116)|(0))==0;
   if ($1117) { label = 255; break; } else { var $R_0_i_i = $1116;var $RP_0_i_i = $1115;label = 254; break; }
  case 255: 
   var $1119=(($R_0_i_i+16)|0);
   var $1120=HEAP32[(($1119)>>2)];
   var $1121=(($1120)|(0))==0;
   if ($1121) { label = 256; break; } else { var $R_0_i_i = $1120;var $RP_0_i_i = $1119;label = 254; break; }
  case 256: 
   var $1123=$RP_0_i_i;
   var $1124=HEAP32[((((4184)|0))>>2)];
   var $1125=(($1123)>>>(0)) < (($1124)>>>(0));
   if ($1125) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $1129=(($1084)|(0))==0;
   if ($1129) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $_sum31_i_i=((($tsize_244_i)+(28))|0);
   var $_sum99_i=((($_sum31_i_i)+($1003))|0);
   var $1131=(($tbase_245_i+$_sum99_i)|0);
   var $1132=$1131;
   var $1133=HEAP32[(($1132)>>2)];
   var $1134=((4472+($1133<<2))|0);
   var $1135=HEAP32[(($1134)>>2)];
   var $1136=(($1081)|(0))==(($1135)|(0));
   if ($1136) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($1134)>>2)]=$R_1_i_i;
   var $cond_i_i=(($R_1_i_i)|(0))==0;
   if ($cond_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $1138=HEAP32[(($1132)>>2)];
   var $1139=1 << $1138;
   var $1140=$1139 ^ -1;
   var $1141=HEAP32[((((4172)|0))>>2)];
   var $1142=$1141 & $1140;
   HEAP32[((((4172)|0))>>2)]=$1142;
   label = 279; break;
  case 263: 
   var $1144=$1084;
   var $1145=HEAP32[((((4184)|0))>>2)];
   var $1146=(($1144)>>>(0)) < (($1145)>>>(0));
   if ($1146) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $1148=(($1084+16)|0);
   var $1149=HEAP32[(($1148)>>2)];
   var $1150=(($1149)|(0))==(($1081)|(0));
   if ($1150) { label = 265; break; } else { label = 266; break; }
  case 265: 
   HEAP32[(($1148)>>2)]=$R_1_i_i;
   label = 268; break;
  case 266: 
   var $1153=(($1084+20)|0);
   HEAP32[(($1153)>>2)]=$R_1_i_i;
   label = 268; break;
  case 267: 
   _abort();
   throw "Reached an unreachable!";
  case 268: 
   var $1156=(($R_1_i_i)|(0))==0;
   if ($1156) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $1158=$R_1_i_i;
   var $1159=HEAP32[((((4184)|0))>>2)];
   var $1160=(($1158)>>>(0)) < (($1159)>>>(0));
   if ($1160) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $1162=(($R_1_i_i+24)|0);
   HEAP32[(($1162)>>2)]=$1084;
   var $_sum3233_i_i=$1003 | 16;
   var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
   var $1163=(($tbase_245_i+$_sum100_i)|0);
   var $1164=$1163;
   var $1165=HEAP32[(($1164)>>2)];
   var $1166=(($1165)|(0))==0;
   if ($1166) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $1168=$1165;
   var $1169=HEAP32[((((4184)|0))>>2)];
   var $1170=(($1168)>>>(0)) < (($1169)>>>(0));
   if ($1170) { label = 273; break; } else { label = 272; break; }
  case 272: 
   var $1172=(($R_1_i_i+16)|0);
   HEAP32[(($1172)>>2)]=$1165;
   var $1173=(($1165+24)|0);
   HEAP32[(($1173)>>2)]=$R_1_i_i;
   label = 274; break;
  case 273: 
   _abort();
   throw "Reached an unreachable!";
  case 274: 
   var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
   var $1176=(($tbase_245_i+$_sum101_i)|0);
   var $1177=$1176;
   var $1178=HEAP32[(($1177)>>2)];
   var $1179=(($1178)|(0))==0;
   if ($1179) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $1181=$1178;
   var $1182=HEAP32[((((4184)|0))>>2)];
   var $1183=(($1181)>>>(0)) < (($1182)>>>(0));
   if ($1183) { label = 277; break; } else { label = 276; break; }
  case 276: 
   var $1185=(($R_1_i_i+20)|0);
   HEAP32[(($1185)>>2)]=$1178;
   var $1186=(($1178+24)|0);
   HEAP32[(($1186)>>2)]=$R_1_i_i;
   label = 279; break;
  case 277: 
   _abort();
   throw "Reached an unreachable!";
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   var $_sum9_i_i=$1041 | $1003;
   var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
   var $1190=(($tbase_245_i+$_sum102_i)|0);
   var $1191=$1190;
   var $1192=((($1041)+($1011))|0);
   var $oldfirst_0_i_i = $1191;var $qsize_0_i_i = $1192;label = 280; break;
  case 280: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $1194=(($oldfirst_0_i_i+4)|0);
   var $1195=HEAP32[(($1194)>>2)];
   var $1196=$1195 & -2;
   HEAP32[(($1194)>>2)]=$1196;
   var $1197=$qsize_0_i_i | 1;
   var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
   var $1198=(($tbase_245_i+$_sum10_i_i)|0);
   var $1199=$1198;
   HEAP32[(($1199)>>2)]=$1197;
   var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
   var $1200=(($tbase_245_i+$_sum11_i_i)|0);
   var $1201=$1200;
   HEAP32[(($1201)>>2)]=$qsize_0_i_i;
   var $1202=$qsize_0_i_i >>> 3;
   var $1203=(($qsize_0_i_i)>>>(0)) < 256;
   if ($1203) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $1205=$1202 << 1;
   var $1206=((4208+($1205<<2))|0);
   var $1207=$1206;
   var $1208=HEAP32[((((4168)|0))>>2)];
   var $1209=1 << $1202;
   var $1210=$1208 & $1209;
   var $1211=(($1210)|(0))==0;
   if ($1211) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $1213=$1208 | $1209;
   HEAP32[((((4168)|0))>>2)]=$1213;
   var $_sum27_pre_i_i=((($1205)+(2))|0);
   var $_pre_i24_i=((4208+($_sum27_pre_i_i<<2))|0);
   var $F4_0_i_i = $1207;var $_pre_phi_i25_i = $_pre_i24_i;label = 285; break;
  case 283: 
   var $_sum30_i_i=((($1205)+(2))|0);
   var $1215=((4208+($_sum30_i_i<<2))|0);
   var $1216=HEAP32[(($1215)>>2)];
   var $1217=$1216;
   var $1218=HEAP32[((((4184)|0))>>2)];
   var $1219=(($1217)>>>(0)) < (($1218)>>>(0));
   if ($1219) { label = 284; break; } else { var $F4_0_i_i = $1216;var $_pre_phi_i25_i = $1215;label = 285; break; }
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
   label = 303; break;
  case 286: 
   var $1228=$1009;
   var $1229=$qsize_0_i_i >>> 8;
   var $1230=(($1229)|(0))==0;
   if ($1230) { var $I7_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $1232=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($1232) { var $I7_0_i_i = 31;label = 289; break; } else { label = 288; break; }
  case 288: 
   var $1234=((($1229)+(1048320))|0);
   var $1235=$1234 >>> 16;
   var $1236=$1235 & 8;
   var $1237=$1229 << $1236;
   var $1238=((($1237)+(520192))|0);
   var $1239=$1238 >>> 16;
   var $1240=$1239 & 4;
   var $1241=$1240 | $1236;
   var $1242=$1237 << $1240;
   var $1243=((($1242)+(245760))|0);
   var $1244=$1243 >>> 16;
   var $1245=$1244 & 2;
   var $1246=$1241 | $1245;
   var $1247=(((14)-($1246))|0);
   var $1248=$1242 << $1245;
   var $1249=$1248 >>> 15;
   var $1250=((($1247)+($1249))|0);
   var $1251=$1250 << 1;
   var $1252=((($1250)+(7))|0);
   var $1253=$qsize_0_i_i >>> (($1252)>>>(0));
   var $1254=$1253 & 1;
   var $1255=$1254 | $1251;
   var $I7_0_i_i = $1255;label = 289; break;
  case 289: 
   var $I7_0_i_i;
   var $1257=((4472+($I7_0_i_i<<2))|0);
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
   var $1264=HEAP32[((((4172)|0))>>2)];
   var $1265=1 << $I7_0_i_i;
   var $1266=$1264 & $1265;
   var $1267=(($1266)|(0))==0;
   if ($1267) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $1269=$1264 | $1265;
   HEAP32[((((4172)|0))>>2)]=$1269;
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
   label = 303; break;
  case 291: 
   var $1278=HEAP32[(($1257)>>2)];
   var $1279=(($I7_0_i_i)|(0))==31;
   if ($1279) { var $1284 = 0;label = 293; break; } else { label = 292; break; }
  case 292: 
   var $1281=$I7_0_i_i >>> 1;
   var $1282=(((25)-($1281))|0);
   var $1284 = $1282;label = 293; break;
  case 293: 
   var $1284;
   var $1285=$qsize_0_i_i << $1284;
   var $K8_0_i_i = $1285;var $T_0_i27_i = $1278;label = 294; break;
  case 294: 
   var $T_0_i27_i;
   var $K8_0_i_i;
   var $1287=(($T_0_i27_i+4)|0);
   var $1288=HEAP32[(($1287)>>2)];
   var $1289=$1288 & -8;
   var $1290=(($1289)|(0))==(($qsize_0_i_i)|(0));
   if ($1290) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $1292=$K8_0_i_i >>> 31;
   var $1293=(($T_0_i27_i+16+($1292<<2))|0);
   var $1294=HEAP32[(($1293)>>2)];
   var $1295=(($1294)|(0))==0;
   var $1296=$K8_0_i_i << 1;
   if ($1295) { label = 296; break; } else { var $K8_0_i_i = $1296;var $T_0_i27_i = $1294;label = 294; break; }
  case 296: 
   var $1298=$1293;
   var $1299=HEAP32[((((4184)|0))>>2)];
   var $1300=(($1298)>>>(0)) < (($1299)>>>(0));
   if ($1300) { label = 298; break; } else { label = 297; break; }
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
   label = 303; break;
  case 298: 
   _abort();
   throw "Reached an unreachable!";
  case 299: 
   var $1310=(($T_0_i27_i+8)|0);
   var $1311=HEAP32[(($1310)>>2)];
   var $1312=$T_0_i27_i;
   var $1313=HEAP32[((((4184)|0))>>2)];
   var $1314=(($1312)>>>(0)) < (($1313)>>>(0));
   if ($1314) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $1316=$1311;
   var $1317=(($1316)>>>(0)) < (($1313)>>>(0));
   if ($1317) { label = 302; break; } else { label = 301; break; }
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
   label = 303; break;
  case 302: 
   _abort();
   throw "Reached an unreachable!";
  case 303: 
   var $_sum1819_i_i=$993 | 8;
   var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
   var $mem_0 = $1326;label = 341; break;
  case 304: 
   var $1327=$890;
   var $sp_0_i_i_i = ((4616)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $1329=(($sp_0_i_i_i)|0);
   var $1330=HEAP32[(($1329)>>2)];
   var $1331=(($1330)>>>(0)) > (($1327)>>>(0));
   if ($1331) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $1333=(($sp_0_i_i_i+4)|0);
   var $1334=HEAP32[(($1333)>>2)];
   var $1335=(($1330+$1334)|0);
   var $1336=(($1335)>>>(0)) > (($1327)>>>(0));
   if ($1336) { label = 308; break; } else { label = 307; break; }
  case 307: 
   var $1338=(($sp_0_i_i_i+8)|0);
   var $1339=HEAP32[(($1338)>>2)];
   var $sp_0_i_i_i = $1339;label = 305; break;
  case 308: 
   var $_sum_i15_i=((($1334)-(47))|0);
   var $_sum1_i16_i=((($1334)-(39))|0);
   var $1340=(($1330+$_sum1_i16_i)|0);
   var $1341=$1340;
   var $1342=$1341 & 7;
   var $1343=(($1342)|(0))==0;
   if ($1343) { var $1348 = 0;label = 310; break; } else { label = 309; break; }
  case 309: 
   var $1345=(((-$1341))|0);
   var $1346=$1345 & 7;
   var $1348 = $1346;label = 310; break;
  case 310: 
   var $1348;
   var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
   var $1349=(($1330+$_sum2_i17_i)|0);
   var $1350=(($890+16)|0);
   var $1351=$1350;
   var $1352=(($1349)>>>(0)) < (($1351)>>>(0));
   var $1353=$1352 ? $1327 : $1349;
   var $1354=(($1353+8)|0);
   var $1355=$1354;
   var $1356=((($tsize_244_i)-(40))|0);
   var $1357=(($tbase_245_i+8)|0);
   var $1358=$1357;
   var $1359=$1358 & 7;
   var $1360=(($1359)|(0))==0;
   if ($1360) { var $1364 = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $1362=(((-$1358))|0);
   var $1363=$1362 & 7;
   var $1364 = $1363;label = 312; break;
  case 312: 
   var $1364;
   var $1365=(($tbase_245_i+$1364)|0);
   var $1366=$1365;
   var $1367=((($1356)-($1364))|0);
   HEAP32[((((4192)|0))>>2)]=$1366;
   HEAP32[((((4180)|0))>>2)]=$1367;
   var $1368=$1367 | 1;
   var $_sum_i_i_i=((($1364)+(4))|0);
   var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
   var $1370=$1369;
   HEAP32[(($1370)>>2)]=$1368;
   var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
   var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
   var $1372=$1371;
   HEAP32[(($1372)>>2)]=40;
   var $1373=HEAP32[((((4160)|0))>>2)];
   HEAP32[((((4196)|0))>>2)]=$1373;
   var $1374=(($1353+4)|0);
   var $1375=$1374;
   HEAP32[(($1375)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[(((((4616)|0)))>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((((((4616)|0)))+(4))>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((((((4616)|0)))+(8))>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((((((4616)|0)))+(12))>>2)];
   HEAP32[((((4616)|0))>>2)]=$tbase_245_i;
   HEAP32[((((4620)|0))>>2)]=$tsize_244_i;
   HEAP32[((((4628)|0))>>2)]=0;
   HEAP32[((((4624)|0))>>2)]=$1355;
   var $1376=(($1353+28)|0);
   var $1377=$1376;
   HEAP32[(($1377)>>2)]=7;
   var $1378=(($1353+32)|0);
   var $1379=(($1378)>>>(0)) < (($1335)>>>(0));
   if ($1379) { var $1380 = $1377;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $1380;
   var $1381=(($1380+4)|0);
   HEAP32[(($1381)>>2)]=7;
   var $1382=(($1380+8)|0);
   var $1383=$1382;
   var $1384=(($1383)>>>(0)) < (($1335)>>>(0));
   if ($1384) { var $1380 = $1381;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $1385=(($1353)|(0))==(($1327)|(0));
   if ($1385) { label = 338; break; } else { label = 315; break; }
  case 315: 
   var $1387=$1353;
   var $1388=$890;
   var $1389=((($1387)-($1388))|0);
   var $1390=(($1327+$1389)|0);
   var $_sum3_i_i=((($1389)+(4))|0);
   var $1391=(($1327+$_sum3_i_i)|0);
   var $1392=$1391;
   var $1393=HEAP32[(($1392)>>2)];
   var $1394=$1393 & -2;
   HEAP32[(($1392)>>2)]=$1394;
   var $1395=$1389 | 1;
   var $1396=(($890+4)|0);
   HEAP32[(($1396)>>2)]=$1395;
   var $1397=$1390;
   HEAP32[(($1397)>>2)]=$1389;
   var $1398=$1389 >>> 3;
   var $1399=(($1389)>>>(0)) < 256;
   if ($1399) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $1401=$1398 << 1;
   var $1402=((4208+($1401<<2))|0);
   var $1403=$1402;
   var $1404=HEAP32[((((4168)|0))>>2)];
   var $1405=1 << $1398;
   var $1406=$1404 & $1405;
   var $1407=(($1406)|(0))==0;
   if ($1407) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $1409=$1404 | $1405;
   HEAP32[((((4168)|0))>>2)]=$1409;
   var $_sum11_pre_i_i=((($1401)+(2))|0);
   var $_pre_i_i=((4208+($_sum11_pre_i_i<<2))|0);
   var $F_0_i_i = $1403;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $_sum12_i_i=((($1401)+(2))|0);
   var $1411=((4208+($_sum12_i_i<<2))|0);
   var $1412=HEAP32[(($1411)>>2)];
   var $1413=$1412;
   var $1414=HEAP32[((((4184)|0))>>2)];
   var $1415=(($1413)>>>(0)) < (($1414)>>>(0));
   if ($1415) { label = 319; break; } else { var $F_0_i_i = $1412;var $_pre_phi_i_i = $1411;label = 320; break; }
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
   label = 338; break;
  case 321: 
   var $1422=$890;
   var $1423=$1389 >>> 8;
   var $1424=(($1423)|(0))==0;
   if ($1424) { var $I1_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $1426=(($1389)>>>(0)) > 16777215;
   if ($1426) { var $I1_0_i_i = 31;label = 324; break; } else { label = 323; break; }
  case 323: 
   var $1428=((($1423)+(1048320))|0);
   var $1429=$1428 >>> 16;
   var $1430=$1429 & 8;
   var $1431=$1423 << $1430;
   var $1432=((($1431)+(520192))|0);
   var $1433=$1432 >>> 16;
   var $1434=$1433 & 4;
   var $1435=$1434 | $1430;
   var $1436=$1431 << $1434;
   var $1437=((($1436)+(245760))|0);
   var $1438=$1437 >>> 16;
   var $1439=$1438 & 2;
   var $1440=$1435 | $1439;
   var $1441=(((14)-($1440))|0);
   var $1442=$1436 << $1439;
   var $1443=$1442 >>> 15;
   var $1444=((($1441)+($1443))|0);
   var $1445=$1444 << 1;
   var $1446=((($1444)+(7))|0);
   var $1447=$1389 >>> (($1446)>>>(0));
   var $1448=$1447 & 1;
   var $1449=$1448 | $1445;
   var $I1_0_i_i = $1449;label = 324; break;
  case 324: 
   var $I1_0_i_i;
   var $1451=((4472+($I1_0_i_i<<2))|0);
   var $1452=(($890+28)|0);
   var $I1_0_c_i_i=$I1_0_i_i;
   HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
   var $1453=(($890+20)|0);
   HEAP32[(($1453)>>2)]=0;
   var $1454=(($890+16)|0);
   HEAP32[(($1454)>>2)]=0;
   var $1455=HEAP32[((((4172)|0))>>2)];
   var $1456=1 << $I1_0_i_i;
   var $1457=$1455 & $1456;
   var $1458=(($1457)|(0))==0;
   if ($1458) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $1460=$1455 | $1456;
   HEAP32[((((4172)|0))>>2)]=$1460;
   HEAP32[(($1451)>>2)]=$1422;
   var $1461=(($890+24)|0);
   var $_c_i_i=$1451;
   HEAP32[(($1461)>>2)]=$_c_i_i;
   var $1462=(($890+12)|0);
   HEAP32[(($1462)>>2)]=$890;
   var $1463=(($890+8)|0);
   HEAP32[(($1463)>>2)]=$890;
   label = 338; break;
  case 326: 
   var $1465=HEAP32[(($1451)>>2)];
   var $1466=(($I1_0_i_i)|(0))==31;
   if ($1466) { var $1471 = 0;label = 328; break; } else { label = 327; break; }
  case 327: 
   var $1468=$I1_0_i_i >>> 1;
   var $1469=(((25)-($1468))|0);
   var $1471 = $1469;label = 328; break;
  case 328: 
   var $1471;
   var $1472=$1389 << $1471;
   var $K2_0_i_i = $1472;var $T_0_i_i = $1465;label = 329; break;
  case 329: 
   var $T_0_i_i;
   var $K2_0_i_i;
   var $1474=(($T_0_i_i+4)|0);
   var $1475=HEAP32[(($1474)>>2)];
   var $1476=$1475 & -8;
   var $1477=(($1476)|(0))==(($1389)|(0));
   if ($1477) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $1479=$K2_0_i_i >>> 31;
   var $1480=(($T_0_i_i+16+($1479<<2))|0);
   var $1481=HEAP32[(($1480)>>2)];
   var $1482=(($1481)|(0))==0;
   var $1483=$K2_0_i_i << 1;
   if ($1482) { label = 331; break; } else { var $K2_0_i_i = $1483;var $T_0_i_i = $1481;label = 329; break; }
  case 331: 
   var $1485=$1480;
   var $1486=HEAP32[((((4184)|0))>>2)];
   var $1487=(($1485)>>>(0)) < (($1486)>>>(0));
   if ($1487) { label = 333; break; } else { label = 332; break; }
  case 332: 
   HEAP32[(($1480)>>2)]=$1422;
   var $1489=(($890+24)|0);
   var $T_0_c8_i_i=$T_0_i_i;
   HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
   var $1490=(($890+12)|0);
   HEAP32[(($1490)>>2)]=$890;
   var $1491=(($890+8)|0);
   HEAP32[(($1491)>>2)]=$890;
   label = 338; break;
  case 333: 
   _abort();
   throw "Reached an unreachable!";
  case 334: 
   var $1494=(($T_0_i_i+8)|0);
   var $1495=HEAP32[(($1494)>>2)];
   var $1496=$T_0_i_i;
   var $1497=HEAP32[((((4184)|0))>>2)];
   var $1498=(($1496)>>>(0)) < (($1497)>>>(0));
   if ($1498) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $1500=$1495;
   var $1501=(($1500)>>>(0)) < (($1497)>>>(0));
   if ($1501) { label = 337; break; } else { label = 336; break; }
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
   label = 338; break;
  case 337: 
   _abort();
   throw "Reached an unreachable!";
  case 338: 
   var $1507=HEAP32[((((4180)|0))>>2)];
   var $1508=(($1507)>>>(0)) > (($nb_0)>>>(0));
   if ($1508) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $1510=((($1507)-($nb_0))|0);
   HEAP32[((((4180)|0))>>2)]=$1510;
   var $1511=HEAP32[((((4192)|0))>>2)];
   var $1512=$1511;
   var $1513=(($1512+$nb_0)|0);
   var $1514=$1513;
   HEAP32[((((4192)|0))>>2)]=$1514;
   var $1515=$1510 | 1;
   var $_sum_i134=((($nb_0)+(4))|0);
   var $1516=(($1512+$_sum_i134)|0);
   var $1517=$1516;
   HEAP32[(($1517)>>2)]=$1515;
   var $1518=$nb_0 | 3;
   var $1519=(($1511+4)|0);
   HEAP32[(($1519)>>2)]=$1518;
   var $1520=(($1511+8)|0);
   var $1521=$1520;
   var $mem_0 = $1521;label = 341; break;
  case 340: 
   var $1522=___errno_location();
   HEAP32[(($1522)>>2)]=12;
   var $mem_0 = 0;label = 341; break;
  case 341: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($mem)|(0))==0;
   if ($1) { label = 142; break; } else { label = 2; break; }
  case 2: 
   var $3=((($mem)-(8))|0);
   var $4=$3;
   var $5=HEAP32[((((4184)|0))>>2)];
   var $6=(($3)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 141; break; } else { label = 3; break; }
  case 3: 
   var $8=((($mem)-(4))|0);
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10 & 3;
   var $12=(($11)|(0))==1;
   if ($12) { label = 141; break; } else { label = 4; break; }
  case 4: 
   var $14=$10 & -8;
   var $_sum=((($14)-(8))|0);
   var $15=(($mem+$_sum)|0);
   var $16=$15;
   var $17=$10 & 1;
   var $18=(($17)|(0))==0;
   if ($18) { label = 5; break; } else { var $p_0 = $4;var $psize_0 = $14;label = 56; break; }
  case 5: 
   var $20=$3;
   var $21=HEAP32[(($20)>>2)];
   var $22=(($11)|(0))==0;
   if ($22) { label = 142; break; } else { label = 6; break; }
  case 6: 
   var $_sum233=(((-8)-($21))|0);
   var $24=(($mem+$_sum233)|0);
   var $25=$24;
   var $26=((($21)+($14))|0);
   var $27=(($24)>>>(0)) < (($5)>>>(0));
   if ($27) { label = 141; break; } else { label = 7; break; }
  case 7: 
   var $29=HEAP32[((((4188)|0))>>2)];
   var $30=(($25)|(0))==(($29)|(0));
   if ($30) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $32=$21 >>> 3;
   var $33=(($21)>>>(0)) < 256;
   if ($33) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $_sum277=((($_sum233)+(8))|0);
   var $35=(($mem+$_sum277)|0);
   var $36=$35;
   var $37=HEAP32[(($36)>>2)];
   var $_sum278=((($_sum233)+(12))|0);
   var $38=(($mem+$_sum278)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $41=$32 << 1;
   var $42=((4208+($41<<2))|0);
   var $43=$42;
   var $44=(($37)|(0))==(($43)|(0));
   if ($44) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $46=$37;
   var $47=(($46)>>>(0)) < (($5)>>>(0));
   if ($47) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $49=(($37+12)|0);
   var $50=HEAP32[(($49)>>2)];
   var $51=(($50)|(0))==(($25)|(0));
   if ($51) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $52=(($40)|(0))==(($37)|(0));
   if ($52) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $54=1 << $32;
   var $55=$54 ^ -1;
   var $56=HEAP32[((((4168)|0))>>2)];
   var $57=$56 & $55;
   HEAP32[((((4168)|0))>>2)]=$57;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 14: 
   var $59=(($40)|(0))==(($43)|(0));
   if ($59) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre306=(($40+8)|0);
   var $_pre_phi307 = $_pre306;label = 18; break;
  case 16: 
   var $61=$40;
   var $62=(($61)>>>(0)) < (($5)>>>(0));
   if ($62) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $64=(($40+8)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==(($25)|(0));
   if ($66) { var $_pre_phi307 = $64;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $_pre_phi307;
   var $67=(($37+12)|0);
   HEAP32[(($67)>>2)]=$40;
   HEAP32[(($_pre_phi307)>>2)]=$37;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $69=$24;
   var $_sum267=((($_sum233)+(24))|0);
   var $70=(($mem+$_sum267)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $_sum268=((($_sum233)+(12))|0);
   var $73=(($mem+$_sum268)|0);
   var $74=$73;
   var $75=HEAP32[(($74)>>2)];
   var $76=(($75)|(0))==(($69)|(0));
   if ($76) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $_sum274=((($_sum233)+(8))|0);
   var $78=(($mem+$_sum274)|0);
   var $79=$78;
   var $80=HEAP32[(($79)>>2)];
   var $81=$80;
   var $82=(($81)>>>(0)) < (($5)>>>(0));
   if ($82) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $84=(($80+12)|0);
   var $85=HEAP32[(($84)>>2)];
   var $86=(($85)|(0))==(($69)|(0));
   if ($86) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $88=(($75+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($89)|(0))==(($69)|(0));
   if ($90) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($84)>>2)]=$75;
   HEAP32[(($88)>>2)]=$80;
   var $R_1 = $75;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $_sum270=((($_sum233)+(20))|0);
   var $93=(($mem+$_sum270)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 28; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 29; break; }
  case 28: 
   var $_sum269=((($_sum233)+(16))|0);
   var $98=(($mem+$_sum269)|0);
   var $99=$98;
   var $100=HEAP32[(($99)>>2)];
   var $101=(($100)|(0))==0;
   if ($101) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $100;var $RP_0 = $99;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $102=(($R_0+20)|0);
   var $103=HEAP32[(($102)>>2)];
   var $104=(($103)|(0))==0;
   if ($104) { label = 30; break; } else { var $R_0 = $103;var $RP_0 = $102;label = 29; break; }
  case 30: 
   var $106=(($R_0+16)|0);
   var $107=HEAP32[(($106)>>2)];
   var $108=(($107)|(0))==0;
   if ($108) { label = 31; break; } else { var $R_0 = $107;var $RP_0 = $106;label = 29; break; }
  case 31: 
   var $110=$RP_0;
   var $111=(($110)>>>(0)) < (($5)>>>(0));
   if ($111) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $115=(($72)|(0))==0;
   if ($115) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $_sum271=((($_sum233)+(28))|0);
   var $117=(($mem+$_sum271)|0);
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=((4472+($119<<2))|0);
   var $121=HEAP32[(($120)>>2)];
   var $122=(($69)|(0))==(($121)|(0));
   if ($122) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($120)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $124=HEAP32[(($118)>>2)];
   var $125=1 << $124;
   var $126=$125 ^ -1;
   var $127=HEAP32[((((4172)|0))>>2)];
   var $128=$127 & $126;
   HEAP32[((((4172)|0))>>2)]=$128;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 38: 
   var $130=$72;
   var $131=HEAP32[((((4184)|0))>>2)];
   var $132=(($130)>>>(0)) < (($131)>>>(0));
   if ($132) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $134=(($72+16)|0);
   var $135=HEAP32[(($134)>>2)];
   var $136=(($135)|(0))==(($69)|(0));
   if ($136) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($134)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $139=(($72+20)|0);
   HEAP32[(($139)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $142=(($R_1)|(0))==0;
   if ($142) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $144=$R_1;
   var $145=HEAP32[((((4184)|0))>>2)];
   var $146=(($144)>>>(0)) < (($145)>>>(0));
   if ($146) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $148=(($R_1+24)|0);
   HEAP32[(($148)>>2)]=$72;
   var $_sum272=((($_sum233)+(16))|0);
   var $149=(($mem+$_sum272)|0);
   var $150=$149;
   var $151=HEAP32[(($150)>>2)];
   var $152=(($151)|(0))==0;
   if ($152) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $154=$151;
   var $155=HEAP32[((((4184)|0))>>2)];
   var $156=(($154)>>>(0)) < (($155)>>>(0));
   if ($156) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $158=(($R_1+16)|0);
   HEAP32[(($158)>>2)]=$151;
   var $159=(($151+24)|0);
   HEAP32[(($159)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $_sum273=((($_sum233)+(20))|0);
   var $162=(($mem+$_sum273)|0);
   var $163=$162;
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==0;
   if ($165) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $167=$164;
   var $168=HEAP32[((((4184)|0))>>2)];
   var $169=(($167)>>>(0)) < (($168)>>>(0));
   if ($169) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $171=(($R_1+20)|0);
   HEAP32[(($171)>>2)]=$164;
   var $172=(($164+24)|0);
   HEAP32[(($172)>>2)]=$R_1;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $_sum234=((($14)-(4))|0);
   var $176=(($mem+$_sum234)|0);
   var $177=$176;
   var $178=HEAP32[(($177)>>2)];
   var $179=$178 & 3;
   var $180=(($179)|(0))==3;
   if ($180) { label = 55; break; } else { var $p_0 = $25;var $psize_0 = $26;label = 56; break; }
  case 55: 
   HEAP32[((((4176)|0))>>2)]=$26;
   var $182=HEAP32[(($177)>>2)];
   var $183=$182 & -2;
   HEAP32[(($177)>>2)]=$183;
   var $184=$26 | 1;
   var $_sum265=((($_sum233)+(4))|0);
   var $185=(($mem+$_sum265)|0);
   var $186=$185;
   HEAP32[(($186)>>2)]=$184;
   var $187=$15;
   HEAP32[(($187)>>2)]=$26;
   label = 142; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $189=$p_0;
   var $190=(($189)>>>(0)) < (($15)>>>(0));
   if ($190) { label = 57; break; } else { label = 141; break; }
  case 57: 
   var $_sum264=((($14)-(4))|0);
   var $192=(($mem+$_sum264)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 & 1;
   var $phitmp=(($195)|(0))==0;
   if ($phitmp) { label = 141; break; } else { label = 58; break; }
  case 58: 
   var $197=$194 & 2;
   var $198=(($197)|(0))==0;
   if ($198) { label = 59; break; } else { label = 114; break; }
  case 59: 
   var $200=HEAP32[((((4192)|0))>>2)];
   var $201=(($16)|(0))==(($200)|(0));
   if ($201) { label = 60; break; } else { label = 64; break; }
  case 60: 
   var $203=HEAP32[((((4180)|0))>>2)];
   var $204=((($203)+($psize_0))|0);
   HEAP32[((((4180)|0))>>2)]=$204;
   HEAP32[((((4192)|0))>>2)]=$p_0;
   var $205=$204 | 1;
   var $206=(($p_0+4)|0);
   HEAP32[(($206)>>2)]=$205;
   var $207=HEAP32[((((4188)|0))>>2)];
   var $208=(($p_0)|(0))==(($207)|(0));
   if ($208) { label = 61; break; } else { label = 62; break; }
  case 61: 
   HEAP32[((((4188)|0))>>2)]=0;
   HEAP32[((((4176)|0))>>2)]=0;
   label = 62; break;
  case 62: 
   var $211=HEAP32[((((4196)|0))>>2)];
   var $212=(($204)>>>(0)) > (($211)>>>(0));
   if ($212) { label = 63; break; } else { label = 142; break; }
  case 63: 
   var $214=_sys_trim(0);
   label = 142; break;
  case 64: 
   var $216=HEAP32[((((4188)|0))>>2)];
   var $217=(($16)|(0))==(($216)|(0));
   if ($217) { label = 65; break; } else { label = 66; break; }
  case 65: 
   var $219=HEAP32[((((4176)|0))>>2)];
   var $220=((($219)+($psize_0))|0);
   HEAP32[((((4176)|0))>>2)]=$220;
   HEAP32[((((4188)|0))>>2)]=$p_0;
   var $221=$220 | 1;
   var $222=(($p_0+4)|0);
   HEAP32[(($222)>>2)]=$221;
   var $223=(($189+$220)|0);
   var $224=$223;
   HEAP32[(($224)>>2)]=$220;
   label = 142; break;
  case 66: 
   var $226=$194 & -8;
   var $227=((($226)+($psize_0))|0);
   var $228=$194 >>> 3;
   var $229=(($194)>>>(0)) < 256;
   if ($229) { label = 67; break; } else { label = 79; break; }
  case 67: 
   var $231=(($mem+$14)|0);
   var $232=$231;
   var $233=HEAP32[(($232)>>2)];
   var $_sum258259=$14 | 4;
   var $234=(($mem+$_sum258259)|0);
   var $235=$234;
   var $236=HEAP32[(($235)>>2)];
   var $237=$228 << 1;
   var $238=((4208+($237<<2))|0);
   var $239=$238;
   var $240=(($233)|(0))==(($239)|(0));
   if ($240) { label = 70; break; } else { label = 68; break; }
  case 68: 
   var $242=$233;
   var $243=HEAP32[((((4184)|0))>>2)];
   var $244=(($242)>>>(0)) < (($243)>>>(0));
   if ($244) { label = 78; break; } else { label = 69; break; }
  case 69: 
   var $246=(($233+12)|0);
   var $247=HEAP32[(($246)>>2)];
   var $248=(($247)|(0))==(($16)|(0));
   if ($248) { label = 70; break; } else { label = 78; break; }
  case 70: 
   var $249=(($236)|(0))==(($233)|(0));
   if ($249) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $251=1 << $228;
   var $252=$251 ^ -1;
   var $253=HEAP32[((((4168)|0))>>2)];
   var $254=$253 & $252;
   HEAP32[((((4168)|0))>>2)]=$254;
   label = 112; break;
  case 72: 
   var $256=(($236)|(0))==(($239)|(0));
   if ($256) { label = 73; break; } else { label = 74; break; }
  case 73: 
   var $_pre304=(($236+8)|0);
   var $_pre_phi305 = $_pre304;label = 76; break;
  case 74: 
   var $258=$236;
   var $259=HEAP32[((((4184)|0))>>2)];
   var $260=(($258)>>>(0)) < (($259)>>>(0));
   if ($260) { label = 77; break; } else { label = 75; break; }
  case 75: 
   var $262=(($236+8)|0);
   var $263=HEAP32[(($262)>>2)];
   var $264=(($263)|(0))==(($16)|(0));
   if ($264) { var $_pre_phi305 = $262;label = 76; break; } else { label = 77; break; }
  case 76: 
   var $_pre_phi305;
   var $265=(($233+12)|0);
   HEAP32[(($265)>>2)]=$236;
   HEAP32[(($_pre_phi305)>>2)]=$233;
   label = 112; break;
  case 77: 
   _abort();
   throw "Reached an unreachable!";
  case 78: 
   _abort();
   throw "Reached an unreachable!";
  case 79: 
   var $267=$15;
   var $_sum236=((($14)+(16))|0);
   var $268=(($mem+$_sum236)|0);
   var $269=$268;
   var $270=HEAP32[(($269)>>2)];
   var $_sum237238=$14 | 4;
   var $271=(($mem+$_sum237238)|0);
   var $272=$271;
   var $273=HEAP32[(($272)>>2)];
   var $274=(($273)|(0))==(($267)|(0));
   if ($274) { label = 85; break; } else { label = 80; break; }
  case 80: 
   var $276=(($mem+$14)|0);
   var $277=$276;
   var $278=HEAP32[(($277)>>2)];
   var $279=$278;
   var $280=HEAP32[((((4184)|0))>>2)];
   var $281=(($279)>>>(0)) < (($280)>>>(0));
   if ($281) { label = 84; break; } else { label = 81; break; }
  case 81: 
   var $283=(($278+12)|0);
   var $284=HEAP32[(($283)>>2)];
   var $285=(($284)|(0))==(($267)|(0));
   if ($285) { label = 82; break; } else { label = 84; break; }
  case 82: 
   var $287=(($273+8)|0);
   var $288=HEAP32[(($287)>>2)];
   var $289=(($288)|(0))==(($267)|(0));
   if ($289) { label = 83; break; } else { label = 84; break; }
  case 83: 
   HEAP32[(($283)>>2)]=$273;
   HEAP32[(($287)>>2)]=$278;
   var $R7_1 = $273;label = 92; break;
  case 84: 
   _abort();
   throw "Reached an unreachable!";
  case 85: 
   var $_sum240=((($14)+(12))|0);
   var $292=(($mem+$_sum240)|0);
   var $293=$292;
   var $294=HEAP32[(($293)>>2)];
   var $295=(($294)|(0))==0;
   if ($295) { label = 86; break; } else { var $R7_0 = $294;var $RP9_0 = $293;label = 87; break; }
  case 86: 
   var $_sum239=((($14)+(8))|0);
   var $297=(($mem+$_sum239)|0);
   var $298=$297;
   var $299=HEAP32[(($298)>>2)];
   var $300=(($299)|(0))==0;
   if ($300) { var $R7_1 = 0;label = 92; break; } else { var $R7_0 = $299;var $RP9_0 = $298;label = 87; break; }
  case 87: 
   var $RP9_0;
   var $R7_0;
   var $301=(($R7_0+20)|0);
   var $302=HEAP32[(($301)>>2)];
   var $303=(($302)|(0))==0;
   if ($303) { label = 88; break; } else { var $R7_0 = $302;var $RP9_0 = $301;label = 87; break; }
  case 88: 
   var $305=(($R7_0+16)|0);
   var $306=HEAP32[(($305)>>2)];
   var $307=(($306)|(0))==0;
   if ($307) { label = 89; break; } else { var $R7_0 = $306;var $RP9_0 = $305;label = 87; break; }
  case 89: 
   var $309=$RP9_0;
   var $310=HEAP32[((((4184)|0))>>2)];
   var $311=(($309)>>>(0)) < (($310)>>>(0));
   if ($311) { label = 91; break; } else { label = 90; break; }
  case 90: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 92; break;
  case 91: 
   _abort();
   throw "Reached an unreachable!";
  case 92: 
   var $R7_1;
   var $315=(($270)|(0))==0;
   if ($315) { label = 112; break; } else { label = 93; break; }
  case 93: 
   var $_sum251=((($14)+(20))|0);
   var $317=(($mem+$_sum251)|0);
   var $318=$317;
   var $319=HEAP32[(($318)>>2)];
   var $320=((4472+($319<<2))|0);
   var $321=HEAP32[(($320)>>2)];
   var $322=(($267)|(0))==(($321)|(0));
   if ($322) { label = 94; break; } else { label = 96; break; }
  case 94: 
   HEAP32[(($320)>>2)]=$R7_1;
   var $cond299=(($R7_1)|(0))==0;
   if ($cond299) { label = 95; break; } else { label = 102; break; }
  case 95: 
   var $324=HEAP32[(($318)>>2)];
   var $325=1 << $324;
   var $326=$325 ^ -1;
   var $327=HEAP32[((((4172)|0))>>2)];
   var $328=$327 & $326;
   HEAP32[((((4172)|0))>>2)]=$328;
   label = 112; break;
  case 96: 
   var $330=$270;
   var $331=HEAP32[((((4184)|0))>>2)];
   var $332=(($330)>>>(0)) < (($331)>>>(0));
   if ($332) { label = 100; break; } else { label = 97; break; }
  case 97: 
   var $334=(($270+16)|0);
   var $335=HEAP32[(($334)>>2)];
   var $336=(($335)|(0))==(($267)|(0));
   if ($336) { label = 98; break; } else { label = 99; break; }
  case 98: 
   HEAP32[(($334)>>2)]=$R7_1;
   label = 101; break;
  case 99: 
   var $339=(($270+20)|0);
   HEAP32[(($339)>>2)]=$R7_1;
   label = 101; break;
  case 100: 
   _abort();
   throw "Reached an unreachable!";
  case 101: 
   var $342=(($R7_1)|(0))==0;
   if ($342) { label = 112; break; } else { label = 102; break; }
  case 102: 
   var $344=$R7_1;
   var $345=HEAP32[((((4184)|0))>>2)];
   var $346=(($344)>>>(0)) < (($345)>>>(0));
   if ($346) { label = 111; break; } else { label = 103; break; }
  case 103: 
   var $348=(($R7_1+24)|0);
   HEAP32[(($348)>>2)]=$270;
   var $_sum252=((($14)+(8))|0);
   var $349=(($mem+$_sum252)|0);
   var $350=$349;
   var $351=HEAP32[(($350)>>2)];
   var $352=(($351)|(0))==0;
   if ($352) { label = 107; break; } else { label = 104; break; }
  case 104: 
   var $354=$351;
   var $355=HEAP32[((((4184)|0))>>2)];
   var $356=(($354)>>>(0)) < (($355)>>>(0));
   if ($356) { label = 106; break; } else { label = 105; break; }
  case 105: 
   var $358=(($R7_1+16)|0);
   HEAP32[(($358)>>2)]=$351;
   var $359=(($351+24)|0);
   HEAP32[(($359)>>2)]=$R7_1;
   label = 107; break;
  case 106: 
   _abort();
   throw "Reached an unreachable!";
  case 107: 
   var $_sum253=((($14)+(12))|0);
   var $362=(($mem+$_sum253)|0);
   var $363=$362;
   var $364=HEAP32[(($363)>>2)];
   var $365=(($364)|(0))==0;
   if ($365) { label = 112; break; } else { label = 108; break; }
  case 108: 
   var $367=$364;
   var $368=HEAP32[((((4184)|0))>>2)];
   var $369=(($367)>>>(0)) < (($368)>>>(0));
   if ($369) { label = 110; break; } else { label = 109; break; }
  case 109: 
   var $371=(($R7_1+20)|0);
   HEAP32[(($371)>>2)]=$364;
   var $372=(($364+24)|0);
   HEAP32[(($372)>>2)]=$R7_1;
   label = 112; break;
  case 110: 
   _abort();
   throw "Reached an unreachable!";
  case 111: 
   _abort();
   throw "Reached an unreachable!";
  case 112: 
   var $376=$227 | 1;
   var $377=(($p_0+4)|0);
   HEAP32[(($377)>>2)]=$376;
   var $378=(($189+$227)|0);
   var $379=$378;
   HEAP32[(($379)>>2)]=$227;
   var $380=HEAP32[((((4188)|0))>>2)];
   var $381=(($p_0)|(0))==(($380)|(0));
   if ($381) { label = 113; break; } else { var $psize_1 = $227;label = 115; break; }
  case 113: 
   HEAP32[((((4176)|0))>>2)]=$227;
   label = 142; break;
  case 114: 
   var $384=$194 & -2;
   HEAP32[(($193)>>2)]=$384;
   var $385=$psize_0 | 1;
   var $386=(($p_0+4)|0);
   HEAP32[(($386)>>2)]=$385;
   var $387=(($189+$psize_0)|0);
   var $388=$387;
   HEAP32[(($388)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 115; break;
  case 115: 
   var $psize_1;
   var $390=$psize_1 >>> 3;
   var $391=(($psize_1)>>>(0)) < 256;
   if ($391) { label = 116; break; } else { label = 121; break; }
  case 116: 
   var $393=$390 << 1;
   var $394=((4208+($393<<2))|0);
   var $395=$394;
   var $396=HEAP32[((((4168)|0))>>2)];
   var $397=1 << $390;
   var $398=$396 & $397;
   var $399=(($398)|(0))==0;
   if ($399) { label = 117; break; } else { label = 118; break; }
  case 117: 
   var $401=$396 | $397;
   HEAP32[((((4168)|0))>>2)]=$401;
   var $_sum249_pre=((($393)+(2))|0);
   var $_pre=((4208+($_sum249_pre<<2))|0);
   var $F16_0 = $395;var $_pre_phi = $_pre;label = 120; break;
  case 118: 
   var $_sum250=((($393)+(2))|0);
   var $403=((4208+($_sum250<<2))|0);
   var $404=HEAP32[(($403)>>2)];
   var $405=$404;
   var $406=HEAP32[((((4184)|0))>>2)];
   var $407=(($405)>>>(0)) < (($406)>>>(0));
   if ($407) { label = 119; break; } else { var $F16_0 = $404;var $_pre_phi = $403;label = 120; break; }
  case 119: 
   _abort();
   throw "Reached an unreachable!";
  case 120: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $410=(($F16_0+12)|0);
   HEAP32[(($410)>>2)]=$p_0;
   var $411=(($p_0+8)|0);
   HEAP32[(($411)>>2)]=$F16_0;
   var $412=(($p_0+12)|0);
   HEAP32[(($412)>>2)]=$395;
   label = 142; break;
  case 121: 
   var $414=$p_0;
   var $415=$psize_1 >>> 8;
   var $416=(($415)|(0))==0;
   if ($416) { var $I18_0 = 0;label = 124; break; } else { label = 122; break; }
  case 122: 
   var $418=(($psize_1)>>>(0)) > 16777215;
   if ($418) { var $I18_0 = 31;label = 124; break; } else { label = 123; break; }
  case 123: 
   var $420=((($415)+(1048320))|0);
   var $421=$420 >>> 16;
   var $422=$421 & 8;
   var $423=$415 << $422;
   var $424=((($423)+(520192))|0);
   var $425=$424 >>> 16;
   var $426=$425 & 4;
   var $427=$426 | $422;
   var $428=$423 << $426;
   var $429=((($428)+(245760))|0);
   var $430=$429 >>> 16;
   var $431=$430 & 2;
   var $432=$427 | $431;
   var $433=(((14)-($432))|0);
   var $434=$428 << $431;
   var $435=$434 >>> 15;
   var $436=((($433)+($435))|0);
   var $437=$436 << 1;
   var $438=((($436)+(7))|0);
   var $439=$psize_1 >>> (($438)>>>(0));
   var $440=$439 & 1;
   var $441=$440 | $437;
   var $I18_0 = $441;label = 124; break;
  case 124: 
   var $I18_0;
   var $443=((4472+($I18_0<<2))|0);
   var $444=(($p_0+28)|0);
   var $I18_0_c=$I18_0;
   HEAP32[(($444)>>2)]=$I18_0_c;
   var $445=(($p_0+20)|0);
   HEAP32[(($445)>>2)]=0;
   var $446=(($p_0+16)|0);
   HEAP32[(($446)>>2)]=0;
   var $447=HEAP32[((((4172)|0))>>2)];
   var $448=1 << $I18_0;
   var $449=$447 & $448;
   var $450=(($449)|(0))==0;
   if ($450) { label = 125; break; } else { label = 126; break; }
  case 125: 
   var $452=$447 | $448;
   HEAP32[((((4172)|0))>>2)]=$452;
   HEAP32[(($443)>>2)]=$414;
   var $453=(($p_0+24)|0);
   var $_c=$443;
   HEAP32[(($453)>>2)]=$_c;
   var $454=(($p_0+12)|0);
   HEAP32[(($454)>>2)]=$p_0;
   var $455=(($p_0+8)|0);
   HEAP32[(($455)>>2)]=$p_0;
   label = 138; break;
  case 126: 
   var $457=HEAP32[(($443)>>2)];
   var $458=(($I18_0)|(0))==31;
   if ($458) { var $463 = 0;label = 128; break; } else { label = 127; break; }
  case 127: 
   var $460=$I18_0 >>> 1;
   var $461=(((25)-($460))|0);
   var $463 = $461;label = 128; break;
  case 128: 
   var $463;
   var $464=$psize_1 << $463;
   var $K19_0 = $464;var $T_0 = $457;label = 129; break;
  case 129: 
   var $T_0;
   var $K19_0;
   var $466=(($T_0+4)|0);
   var $467=HEAP32[(($466)>>2)];
   var $468=$467 & -8;
   var $469=(($468)|(0))==(($psize_1)|(0));
   if ($469) { label = 134; break; } else { label = 130; break; }
  case 130: 
   var $471=$K19_0 >>> 31;
   var $472=(($T_0+16+($471<<2))|0);
   var $473=HEAP32[(($472)>>2)];
   var $474=(($473)|(0))==0;
   var $475=$K19_0 << 1;
   if ($474) { label = 131; break; } else { var $K19_0 = $475;var $T_0 = $473;label = 129; break; }
  case 131: 
   var $477=$472;
   var $478=HEAP32[((((4184)|0))>>2)];
   var $479=(($477)>>>(0)) < (($478)>>>(0));
   if ($479) { label = 133; break; } else { label = 132; break; }
  case 132: 
   HEAP32[(($472)>>2)]=$414;
   var $481=(($p_0+24)|0);
   var $T_0_c246=$T_0;
   HEAP32[(($481)>>2)]=$T_0_c246;
   var $482=(($p_0+12)|0);
   HEAP32[(($482)>>2)]=$p_0;
   var $483=(($p_0+8)|0);
   HEAP32[(($483)>>2)]=$p_0;
   label = 138; break;
  case 133: 
   _abort();
   throw "Reached an unreachable!";
  case 134: 
   var $486=(($T_0+8)|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=$T_0;
   var $489=HEAP32[((((4184)|0))>>2)];
   var $490=(($488)>>>(0)) < (($489)>>>(0));
   if ($490) { label = 137; break; } else { label = 135; break; }
  case 135: 
   var $492=$487;
   var $493=(($492)>>>(0)) < (($489)>>>(0));
   if ($493) { label = 137; break; } else { label = 136; break; }
  case 136: 
   var $495=(($487+12)|0);
   HEAP32[(($495)>>2)]=$414;
   HEAP32[(($486)>>2)]=$414;
   var $496=(($p_0+8)|0);
   var $_c245=$487;
   HEAP32[(($496)>>2)]=$_c245;
   var $497=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($497)>>2)]=$T_0_c;
   var $498=(($p_0+24)|0);
   HEAP32[(($498)>>2)]=0;
   label = 138; break;
  case 137: 
   _abort();
   throw "Reached an unreachable!";
  case 138: 
   var $500=HEAP32[((((4200)|0))>>2)];
   var $501=((($500)-(1))|0);
   HEAP32[((((4200)|0))>>2)]=$501;
   var $502=(($501)|(0))==0;
   if ($502) { var $sp_0_in_i = ((4624)|0);label = 139; break; } else { label = 142; break; }
  case 139: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $503=(($sp_0_i)|(0))==0;
   var $504=(($sp_0_i+8)|0);
   if ($503) { label = 140; break; } else { var $sp_0_in_i = $504;label = 139; break; }
  case 140: 
   HEAP32[((((4200)|0))>>2)]=-1;
   label = 142; break;
  case 141: 
   _abort();
   throw "Reached an unreachable!";
  case 142: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _calloc($n_elements, $elem_size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($n_elements)|(0))==0;
   if ($1) { var $req_0 = 0;label = 4; break; } else { label = 2; break; }
  case 2: 
   var $3=(Math.imul($elem_size,$n_elements)|0);
   var $4=$elem_size | $n_elements;
   var $5=(($4)>>>(0)) > 65535;
   if ($5) { label = 3; break; } else { var $req_0 = $3;label = 4; break; }
  case 3: 
   var $7=Math.floor(((($3)>>>(0)))/((($n_elements)>>>(0))));
   var $8=(($7)|(0))==(($elem_size)|(0));
   var $_=$8 ? $3 : -1;
   var $req_0 = $_;label = 4; break;
  case 4: 
   var $req_0;
   var $10=_malloc($req_0);
   var $11=(($10)|(0))==0;
   if ($11) { label = 7; break; } else { label = 5; break; }
  case 5: 
   var $13=((($10)-(4))|0);
   var $14=$13;
   var $15=HEAP32[(($14)>>2)];
   var $16=$15 & 3;
   var $17=(($16)|(0))==0;
   if ($17) { label = 7; break; } else { label = 6; break; }
  case 6: 
   _memset($10, 0, $req_0);
   label = 7; break;
  case 7: 
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
Module["_calloc"] = _calloc;
function _sys_trim($pad) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=HEAP32[((((4144)|0))>>2)];
   var $2=(($1)|(0))==0;
   if ($2) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $4=_sysconf(8);
   var $5=((($4)-(1))|0);
   var $6=$5 & $4;
   var $7=(($6)|(0))==0;
   if ($7) { label = 4; break; } else { label = 3; break; }
  case 3: 
   _abort();
   throw "Reached an unreachable!";
  case 4: 
   HEAP32[((((4152)|0))>>2)]=$4;
   HEAP32[((((4148)|0))>>2)]=$4;
   HEAP32[((((4156)|0))>>2)]=-1;
   HEAP32[((((4160)|0))>>2)]=2097152;
   HEAP32[((((4164)|0))>>2)]=0;
   HEAP32[((((4612)|0))>>2)]=0;
   var $9=_time(0);
   var $10=$9 & -16;
   var $11=$10 ^ 1431655768;
   HEAP32[((((4144)|0))>>2)]=$11;
   label = 5; break;
  case 5: 
   var $13=(($pad)>>>(0)) < 4294967232;
   if ($13) { label = 6; break; } else { var $released_2 = 0;label = 21; break; }
  case 6: 
   var $15=HEAP32[((((4192)|0))>>2)];
   var $16=(($15)|(0))==0;
   if ($16) { var $released_2 = 0;label = 21; break; } else { label = 7; break; }
  case 7: 
   var $18=((($pad)+(40))|0);
   var $19=HEAP32[((((4180)|0))>>2)];
   var $20=(($19)>>>(0)) > (($18)>>>(0));
   if ($20) { label = 8; break; } else { label = 19; break; }
  case 8: 
   var $22=HEAP32[((((4152)|0))>>2)];
   var $_neg=(((-40)-($pad))|0);
   var $23=((($_neg)-(1))|0);
   var $24=((($23)+($19))|0);
   var $25=((($24)+($22))|0);
   var $26=Math.floor(((($25)>>>(0)))/((($22)>>>(0))));
   var $27=((($26)-(1))|0);
   var $28=(Math.imul($27,$22)|0);
   var $29=$15;
   var $sp_0_i = ((4616)|0);label = 9; break;
  case 9: 
   var $sp_0_i;
   var $31=(($sp_0_i)|0);
   var $32=HEAP32[(($31)>>2)];
   var $33=(($32)>>>(0)) > (($29)>>>(0));
   if ($33) { label = 11; break; } else { label = 10; break; }
  case 10: 
   var $35=(($sp_0_i+4)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=(($32+$36)|0);
   var $38=(($37)>>>(0)) > (($29)>>>(0));
   if ($38) { var $_0_i = $sp_0_i;label = 12; break; } else { label = 11; break; }
  case 11: 
   var $40=(($sp_0_i+8)|0);
   var $41=HEAP32[(($40)>>2)];
   var $42=(($41)|(0))==0;
   if ($42) { var $_0_i = 0;label = 12; break; } else { var $sp_0_i = $41;label = 9; break; }
  case 12: 
   var $_0_i;
   var $43=(($_0_i+12)|0);
   var $44=HEAP32[(($43)>>2)];
   var $45=$44 & 8;
   var $46=(($45)|(0))==0;
   if ($46) { label = 13; break; } else { label = 19; break; }
  case 13: 
   var $48=_sbrk(0);
   var $49=(($_0_i)|0);
   var $50=HEAP32[(($49)>>2)];
   var $51=(($_0_i+4)|0);
   var $52=HEAP32[(($51)>>2)];
   var $53=(($50+$52)|0);
   var $54=(($48)|(0))==(($53)|(0));
   if ($54) { label = 14; break; } else { label = 19; break; }
  case 14: 
   var $56=(((-2147483648)-($22))|0);
   var $57=(($28)>>>(0)) > 2147483646;
   var $_=$57 ? $56 : $28;
   var $58=(((-$_))|0);
   var $59=_sbrk($58);
   var $60=_sbrk(0);
   var $61=(($59)|(0))!=-1;
   var $62=(($60)>>>(0)) < (($48)>>>(0));
   var $or_cond=$61 & $62;
   if ($or_cond) { label = 15; break; } else { label = 19; break; }
  case 15: 
   var $64=$48;
   var $65=$60;
   var $66=((($64)-($65))|0);
   var $67=(($48)|(0))==(($60)|(0));
   if ($67) { label = 19; break; } else { label = 16; break; }
  case 16: 
   var $69=HEAP32[(($51)>>2)];
   var $70=((($69)-($66))|0);
   HEAP32[(($51)>>2)]=$70;
   var $71=HEAP32[((((4600)|0))>>2)];
   var $72=((($71)-($66))|0);
   HEAP32[((((4600)|0))>>2)]=$72;
   var $73=HEAP32[((((4192)|0))>>2)];
   var $74=HEAP32[((((4180)|0))>>2)];
   var $75=((($74)-($66))|0);
   var $76=$73;
   var $77=(($73+8)|0);
   var $78=$77;
   var $79=$78 & 7;
   var $80=(($79)|(0))==0;
   if ($80) { var $85 = 0;label = 18; break; } else { label = 17; break; }
  case 17: 
   var $82=(((-$78))|0);
   var $83=$82 & 7;
   var $85 = $83;label = 18; break;
  case 18: 
   var $85;
   var $86=(($76+$85)|0);
   var $87=$86;
   var $88=((($75)-($85))|0);
   HEAP32[((((4192)|0))>>2)]=$87;
   HEAP32[((((4180)|0))>>2)]=$88;
   var $89=$88 | 1;
   var $_sum_i=((($85)+(4))|0);
   var $90=(($76+$_sum_i)|0);
   var $91=$90;
   HEAP32[(($91)>>2)]=$89;
   var $_sum2_i=((($75)+(4))|0);
   var $92=(($76+$_sum2_i)|0);
   var $93=$92;
   HEAP32[(($93)>>2)]=40;
   var $94=HEAP32[((((4160)|0))>>2)];
   HEAP32[((((4196)|0))>>2)]=$94;
   var $phitmp=(($48)|(0))!=(($60)|(0));
   var $phitmp8=(($phitmp)&(1));
   var $released_2 = $phitmp8;label = 21; break;
  case 19: 
   var $95=HEAP32[((((4180)|0))>>2)];
   var $96=HEAP32[((((4196)|0))>>2)];
   var $97=(($95)>>>(0)) > (($96)>>>(0));
   if ($97) { label = 20; break; } else { var $released_2 = 0;label = 21; break; }
  case 20: 
   HEAP32[((((4196)|0))>>2)]=-1;
   var $released_2 = 0;label = 21; break;
  case 21: 
   var $released_2;
   return $released_2;
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
    var ret = HEAP8[(((ctlz_i8)+((x >> 16)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 8)|0;
    var ret = HEAP8[(((ctlz_i8)+((x >> 8)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 16)|0;
    return (HEAP8[(((ctlz_i8)+(x&0xff))|0)] + 24)|0;
  }
/* PRE_ASM */ var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = HEAP8[(((cttz_i8)+(x & 0xff))|0)];
    if ((ret|0) < 8) return ret|0;
    var ret = HEAP8[(((cttz_i8)+((x >> 8)&0xff))|0)];
    if ((ret|0) < 8) return (ret + 8)|0;
    var ret = HEAP8[(((cttz_i8)+((x >> 16)&0xff))|0)];
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
  $3 = Math.imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math.imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math.imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math.imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
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
  $2 = Math.imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math.imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
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
//@ sourceMappingURL=displacement.js.map