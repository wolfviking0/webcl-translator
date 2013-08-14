// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
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
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  Module['print'] = function(x) {
    console.log(x);
  };
  Module['printErr'] = function(x) {
    console.log(x);
  };
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
    dump(x);
  }) : (function(x) {
    // self.postMessage(x); // enable this if you want stdout to be sent as messages
  }));
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
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
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
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
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
  // TOTAL_MEMORY is the current size of the actual array, and DYNAMICTOP is the new top.
  while (TOTAL_MEMORY <= DYNAMICTOP) { // Simple heuristic. Override enlargeMemory() if your program has something more optimal for it
    TOTAL_MEMORY = alignMemoryPage(2*TOTAL_MEMORY);
  }
  assert(TOTAL_MEMORY <= Math.pow(2, 30)); // 2^30==1GB is a practical maximum - 2^31 is already close to possible negative numbers etc.
  var oldHEAP8 = HEAP8;
  var buffer = new ArrayBuffer(TOTAL_MEMORY);
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
  HEAP8.set(oldHEAP8);
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
Math.imul = Math['imul'];
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
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
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
STATICTOP = STATIC_BASE + 15144;
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
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,16,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,32,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,9,0,0,0,8,0,0,0,3,0,0,0,8,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,3,0,0,0,3,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,9,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,9,0,0,0,8,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,99,108,66,117,105,108,100,80,114,111,103,114,97,109,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,69,114,114,111,114,32,105,110,32,107,101,114,110,101,108,58,32,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,114,101,97,100,105,110,103,32,99,111,110,118,111,108,117,116,105,111,110,46,99,108,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,99,111,110,118,111,108,117,116,105,111,110,95,107,101,114,110,101,108,46,99,108,0,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,32,40,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,69,82,82,79,82,58,32,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,78,111,32,67,80,85,32,100,101,118,105,99,101,32,102,111,117,110,100,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,58,32,0,0,0,0,0,0,114,0,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,37,112,0,0,0,0,0,0,69,120,101,99,117,116,101,100,32,112,114,111,103,114,97,109,32,115,117,99,99,101,115,102,117,108,108,121,46,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,0,0,32,0,0,0,0,0,0,0,99,108,69,110,113,117,101,117,101,82,101,97,100,66,117,102,102,101,114,0,0,0,0,0,67,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,0,0,118,101,99,116,111,114,0,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,0,0,37,46,48,76,102,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,111,117,116,112,117,116,83,105,103,110,97,108,41,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,109,97,115,107,41,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,105,110,112,117,116,83,105,103,110,97,108,41,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,99,111,110,118,111,108,118,101,0,0,0,0,0,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,73,68,115,0,0,0,0,0,0,0,0,69,114,114,111,114,32,111,99,99,117,114,101,100,32,100,117,114,105,110,103,32,99,111,110,116,101,120,116,32,117,115,101,58,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,36,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,8,36,0,0,72,0,0,0,68,1,0,0,70,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,36,0,0,40,2,0,0,190,1,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,36,0,0,196,0,0,0,4,3,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,36,0,0,0,1,0,0,16,0,0,0,112,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,36,0,0,0,1,0,0,42,0,0,0,112,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,36,0,0,198,1,0,0,230,0,0,0,126,0,0,0,236,1,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,36,0,0,186,2,0,0,244,1,0,0,126,0,0,0,214,2,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,36,0,0,188,1,0,0,248,1,0,0,126,0,0,0,238,1,0,0,234,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,36,0,0,252,2,0,0,136,1,0,0,126,0,0,0,224,1,0,0,48,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,37,0,0,242,2,0,0,38,0,0,0,126,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,37,0,0,186,1,0,0,52,1,0,0,126,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,37,0,0,92,0,0,0,54,1,0,0,126,0,0,0,154,2,0,0,20,0,0,0,250,1,0,0,30,0,0,0,210,0,0,0,156,2,0,0,236,0,0,0,248,255,255,255,160,37,0,0,122,0,0,0,48,0,0,0,188,0,0,0,80,0,0,0,8,0,0,0,174,0,0,0,188,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,37,0,0,226,2,0,0,166,2,0,0,126,0,0,0,118,0,0,0,134,0,0,0,190,2,0,0,148,1,0,0,172,0,0,0,14,0,0,0,134,2,0,0,248,255,255,255,200,37,0,0,124,1,0,0,84,2,0,0,136,2,0,0,174,2,0,0,74,1,0,0,246,0,0,0,30,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,37,0,0,220,0,0,0,0,2,0,0,126,0,0,0,12,1,0,0,234,0,0,0,124,0,0,0,128,1,0,0,208,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38,0,0,160,0,0,0,182,0,0,0,126,0,0,0,240,0,0,0,242,1,0,0,166,0,0,0,230,1,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,38,0,0,230,2,0,0,2,0,0,0,126,0,0,0,160,1,0,0,246,2,0,0,64,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,38,0,0,120,0,0,0,128,2,0,0,126,0,0,0,164,2,0,0,218,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,38,0,0,146,2,0,0,64,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,38,0,0,66,0,0,0,134,1,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,38,0,0,12,0,0,0,204,1,0,0,126,0,0,0,106,0,0,0,90,0,0,0,84,0,0,0,88,0,0,0,82,0,0,0,100,0,0,0,98,0,0,0,158,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,38,0,0,8,1,0,0,40,0,0,0,126,0,0,0,34,2,0,0,38,2,0,0,26,2,0,0,36,2,0,0,6,1,0,0,30,2,0,0,28,2,0,0,206,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,38,0,0,94,0,0,0,50,0,0,0,126,0,0,0,94,2,0,0,92,2,0,0,82,2,0,0,86,2,0,0,240,1,0,0,90,2,0,0,80,2,0,0,100,2,0,0,98,2,0,0,96,2,0,0,108,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,38,0,0,138,0,0,0,4,0,0,0,126,0,0,0,222,2,0,0,212,2,0,0,206,2,0,0,208,2,0,0,184,2,0,0,210,2,0,0,204,2,0,0,220,2,0,0,218,2,0,0,216,2,0,0,88,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,38,0,0,208,0,0,0,248,0,0,0,126,0,0,0,104,1,0,0,22,2,0,0,56,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,38,0,0,64,0,0,0,210,1,0,0,126,0,0,0,14,2,0,0,122,2,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,39,0,0,176,2,0,0,116,1,0,0,126,0,0,0,16,2,0,0,144,0,0,0,12,2,0,0,104,0,0,0,72,1,0,0,116,0,0,0,154,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,39,0,0,218,1,0,0,164,0,0,0,126,0,0,0,56,0,0,0,48,1,0,0,176,0,0,0,102,2,0,0,62,2,0,0,226,1,0,0,58,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,39,0,0,218,1,0,0,122,1,0,0,126,0,0,0,244,2,0,0,146,0,0,0,74,0,0,0,248,2,0,0,252,0,0,0,254,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,39,0,0,218,1,0,0,164,1,0,0,126,0,0,0,88,1,0,0,92,1,0,0,46,2,0,0,202,0,0,0,150,1,0,0,152,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,39,0,0,218,1,0,0,78,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,39,0,0,154,0,0,0,96,1,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,39,0,0,218,1,0,0,224,0,0,0,126,0,0,0,140,1,0,0,194,0,0,0,86,1,0,0,238,2,0,0,198,0,0,0,50,2,0,0,4,2,0,0,60,0,0,0,128,0,0,0,140,2,0,0,34,1,0,0,200,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,39,0,0,2,3,0,0,86,0,0,0,126,0,0,0,24,0,0,0,54,0,0,0,110,1,0,0,130,2,0,0,148,0,0,0,114,1,0,0,192,1,0,0,146,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,39,0,0,186,0,0,0,158,2,0,0,178,1,0,0,56,2,0,0,76,1,0,0,124,2,0,0,114,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,40,0,0,218,1,0,0,232,0,0,0,126,0,0,0,88,1,0,0,92,1,0,0,46,2,0,0,202,0,0,0,150,1,0,0,152,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,40,0,0,218,1,0,0,194,1,0,0,126,0,0,0,88,1,0,0,92,1,0,0,46,2,0,0,202,0,0,0,150,1,0,0,152,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,40,0,0,100,1,0,0,196,2,0,0,204,0,0,0,158,1,0,0,2,1,0,0,234,1,0,0,6,2,0,0,74,2,0,0,106,2,0,0,156,0,0,0,140,0,0,0,250,2,0,0,254,2,0,0,252,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,40,0,0,18,0,0,0,70,1,0,0,2,2,0,0,178,2,0,0,172,2,0,0,58,1,0,0,14,1,0,0,246,1,0,0,106,1,0,0,34,0,0,0,62,0,0,0,198,2,0,0,80,1,0,0,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,40,0,0,18,1,0,0,24,2,0,0,254,1,0,0,56,2,0,0,76,1,0,0,124,2,0,0,254,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,64,40,0,0,174,1,0,0,216,1,0,0,148,255,255,255,148,255,255,255,64,40,0,0,36,1,0,0,68,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,112,40,0,0,112,0,0,0,118,2,0,0,252,255,255,255,252,255,255,255,112,40,0,0,144,1,0,0,98,1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,136,40,0,0,148,2,0,0,200,2,0,0,252,255,255,255,252,255,255,255,136,40,0,0,50,1,0,0,52,2,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,160,40,0,0,238,0,0,0,6,3,0,0,248,255,255,255,248,255,255,255,160,40,0,0,220,1,0,0,194,2,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,184,40,0,0,46,1,0,0,78,2,0,0,248,255,255,255,248,255,255,255,184,40,0,0,130,1,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,40,0,0,132,2,0,0,170,0,0,0,162,1,0,0,170,1,0,0,94,1,0,0,20,2,0,0,10,1,0,0,246,1,0,0,106,1,0,0,32,2,0,0,62,0,0,0,82,1,0,0,80,1,0,0,182,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,40,0,0,68,2,0,0,222,1,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,41,0,0,232,2,0,0,170,2,0,0,36,0,0,0,158,1,0,0,2,1,0,0,234,1,0,0,40,1,0,0,74,2,0,0,106,2,0,0,156,0,0,0,140,0,0,0,250,2,0,0,254,2,0,0,202,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,41,0,0,166,1,0,0,110,2,0,0,60,1,0,0,178,2,0,0,172,2,0,0,58,1,0,0,8,2,0,0,246,1,0,0,106,1,0,0,34,0,0,0,62,0,0,0,198,2,0,0,80,1,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,41,0,0,160,2,0,0,142,1,0,0,126,0,0,0,118,1,0,0,142,2,0,0,120,1,0,0,240,2,0,0,58,0,0,0,26,1,0,0,24,1,0,0,222,0,0,0,112,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,41,0,0,42,1,0,0,150,0,0,0,126,0,0,0,120,2,0,0,10,0,0,0,72,2,0,0,162,2,0,0,180,2,0,0,242,0,0,0,126,2,0,0,212,1,0,0,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,41,0,0,168,2,0,0,66,1,0,0,126,0,0,0,102,0,0,0,62,1,0,0,184,1,0,0,168,1,0,0,192,2,0,0,214,1,0,0,44,2,0,0,232,1,0,0,44,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,41,0,0,216,0,0,0,202,1,0,0,126,0,0,0,76,2,0,0,104,2,0,0,20,1,0,0,138,2,0,0,250,0,0,0,206,0,0,0,180,1,0,0,116,2,0,0,108,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,41,0,0,18,2,0,0,190,0,0,0,54,2,0,0,158,1,0,0,2,1,0,0,234,1,0,0,6,2,0,0,74,2,0,0,106,2,0,0,132,1,0,0,228,1,0,0,178,0,0,0,254,2,0,0,252,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,41,0,0,28,0,0,0,150,2,0,0,66,2,0,0,178,2,0,0,172,2,0,0,58,1,0,0,14,1,0,0,246,1,0,0,106,1,0,0,38,1,0,0,132,0,0,0,32,0,0,0,80,1,0,0,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,0,0,236,2,0,0,42,2,0,0,168,0,0,0,156,1,0,0,212,0,0,0,70,0,0,0,144,2,0,0,28,1,0,0,0,0,0,0,0,0,0,0,68,20,0,0,76,42,0,0,96,42,0,0,88,20,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,240,23,0,0,0,0,0,0,0,24,0,0,0,0,0,0,16,24,0,0,0,36,0,0,0,0,0,0,0,0,0,0,32,24,0,0,0,36,0,0,0,0,0,0,0,0,0,0,48,24,0,0,0,36,0,0,0,0,0,0,0,0,0,0,72,24,0,0,72,36,0,0,0,0,0,0,0,0,0,0,96,24,0,0,0,36,0,0,0,0,0,0,0,0,0,0,112,24,0,0,184,23,0,0,136,24,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,40,41,0,0,0,0,0,0,184,23,0,0,208,24,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,48,41,0,0,0,0,0,0,184,23,0,0,24,25,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,56,41,0,0,0,0,0,0,184,23,0,0,96,25,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,64,41,0,0,0,0,0,0,0,0,0,0,168,25,0,0,80,38,0,0,0,0,0,0,0,0,0,0,216,25,0,0,80,38,0,0,0,0,0,0,184,23,0,0,8,26,0,0,0,0,0,0,1,0,0,0,88,40,0,0,0,0,0,0,184,23,0,0,32,26,0,0,0,0,0,0,1,0,0,0,88,40,0,0,0,0,0,0,184,23,0,0,56,26,0,0,0,0,0,0,1,0,0,0,96,40,0,0,0,0,0,0,184,23,0,0,80,26,0,0,0,0,0,0,1,0,0,0,96,40,0,0,0,0,0,0,184,23,0,0,104,26,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,216,41,0,0,0,8,0,0,184,23,0,0,176,26,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,216,41,0,0,0,8,0,0,184,23,0,0,248,26,0,0,0,0,0,0,3,0,0,0,136,39,0,0,2,0,0,0,88,36,0,0,2,0,0,0,232,39,0,0,0,8,0,0,184,23,0,0,64,27,0,0,0,0,0,0,3,0,0,0,136,39,0,0,2,0,0,0,88,36,0,0,2,0,0,0,240,39,0,0,0,8,0,0,0,0,0,0,136,27,0,0,136,39,0,0,0,0,0,0,0,0,0,0,160,27,0,0,136,39,0,0,0,0,0,0,184,23,0,0,184,27,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,104,40,0,0,2,0,0,0,184,23,0,0,208,27,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,104,40,0,0,2,0,0,0,0,0,0,0,232,27,0,0,0,0,0,0,0,28,0,0,224,40,0,0,0,0,0,0,184,23,0,0,32,28,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,0,37,0,0,0,0,0,0,184,23,0,0,104,28,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,24,37,0,0,0,0,0,0,184,23,0,0,176,28,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,48,37,0,0,0,0,0,0,184,23,0,0,248,28,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,72,37,0,0,0,0,0,0,0,0,0,0,64,29,0,0,136,39,0,0,0,0,0,0,0,0,0,0,88,29,0,0,136,39,0,0,0,0,0,0,184,23,0,0,112,29,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,240,40,0,0,2,0,0,0,184,23,0,0,152,29,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,240,40,0,0,2,0,0,0,184,23,0,0,192,29,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,240,40,0,0,2,0,0,0,184,23,0,0,232,29,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,240,40,0,0,2,0,0,0,0,0,0,0,16,30,0,0,80,40,0,0,0,0,0,0,0,0,0,0,40,30,0,0,136,39,0,0,0,0,0,0,184,23,0,0,64,30,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,208,41,0,0,2,0,0,0,184,23,0,0,88,30,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,208,41,0,0,2,0,0,0,0,0,0,0,112,30,0,0,0,0,0,0,152,30,0,0,0,0,0,0,192,30,0,0,248,40,0,0,0,0,0,0].concat([0,0,0,0,224,30,0,0,104,39,0,0,0,0,0,0,0,0,0,0,8,31,0,0,104,39,0,0,0,0,0,0,0,0,0,0,48,31,0,0,0,0,0,0,104,31,0,0,0,0,0,0,160,31,0,0,0,0,0,0,192,31,0,0,184,40,0,0,0,0,0,0,0,0,0,0,240,31,0,0,0,0,0,0,16,32,0,0,0,0,0,0,48,32,0,0,0,0,0,0,80,32,0,0,184,23,0,0,104,32,0,0,0,0,0,0,1,0,0,0,224,36,0,0,3,244,255,255,184,23,0,0,152,32,0,0,0,0,0,0,1,0,0,0,240,36,0,0,3,244,255,255,184,23,0,0,200,32,0,0,0,0,0,0,1,0,0,0,224,36,0,0,3,244,255,255,184,23,0,0,248,32,0,0,0,0,0,0,1,0,0,0,240,36,0,0,3,244,255,255,0,0,0,0,40,33,0,0,48,40,0,0,0,0,0,0,0,0,0,0,88,33,0,0,40,36,0,0,0,0,0,0,0,0,0,0,112,33,0,0,0,0,0,0,136,33,0,0,56,40,0,0,0,0,0,0,0,0,0,0,160,33,0,0,40,40,0,0,0,0,0,0,0,0,0,0,192,33,0,0,48,40,0,0,0,0,0,0,0,0,0,0,224,33,0,0,0,0,0,0,0,34,0,0,0,0,0,0,32,34,0,0,0,0,0,0,64,34,0,0,184,23,0,0,96,34,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,200,41,0,0,2,0,0,0,184,23,0,0,128,34,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,200,41,0,0,2,0,0,0,184,23,0,0,160,34,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,200,41,0,0,2,0,0,0,184,23,0,0,192,34,0,0,0,0,0,0,2,0,0,0,136,39,0,0,2,0,0,0,200,41,0,0,2,0,0,0,0,0,0,0,224,34,0,0,0,0,0,0,248,34,0,0,0,0,0,0,16,35,0,0,0,0,0,0,40,35,0,0,40,40,0,0,0,0,0,0,0,0,0,0,64,35,0,0,48,40,0,0,0,0,0,0,0,0,0,0,88,35,0,0,32,42,0,0,0,0,0,0,0,0,0,0,128,35,0,0,32,42,0,0,0,0,0,0,0,0,0,0,168,35,0,0,48,42,0,0,0,0,0,0,0,0,0,0,208,35,0,0,248,35,0,0,0,0,0,0,108,0,0,0,0,0,0,0,184,40,0,0,46,1,0,0,78,2,0,0,148,255,255,255,148,255,255,255,184,40,0,0,130,1,0,0,136,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(748);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(358);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(168);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(412);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(212);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(108);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(244);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(278);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(748);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(740);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(168);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(412);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(212);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(572);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(272);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(432);
HEAP32[((9208)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9216)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9224)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9240)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9256)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9272)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9288)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9304)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9440)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9456)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9712)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9728)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9808)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9816)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9960)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9976)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10120)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10136)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10216)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10224)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10232)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10248)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10264)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10280)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10288)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10296)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10304)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10320)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10328)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10336)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10344)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10448)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10464)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10480)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10488)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10504)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10536)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10544)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10552)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10560)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10696)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10704)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10712)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10720)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10736)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10752)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10768)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10784)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10800)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
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
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
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
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
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
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
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
      }};var CL={address_space:{GENERAL:0,GLOBAL:1,LOCAL:2,CONSTANT:4,PRIVATE:8},data_type:{FLOAT:16,INT:32,UINT:64},device_infos:{},index_object:0,ctx:[],webcl_mozilla:0,webcl_webkit:0,ctx_clean:[],cmdQueue:[],cmdQueue_clean:[],programs:[],programs_clean:[],kernels:[],kernels_name:[],kernels_sig:{},kernels_clean:[],buffers:[],buffers_clean:[],platforms:[],devices:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",setupWebCLEnums:function () {
        // All the EnumName are CL.DEVICE_INFO / CL. .... on both browser.
        // Remove on Mozilla CL_ prefix on the EnumName
        for (var legacyEnumName in WebCL) {
          if (typeof WebCL[legacyEnumName] === 'number') {
            var newEnumName = legacyEnumName;
            if (CL.webcl_mozilla) {
              newEnumName = legacyEnumName.slice(3);
            }
            CL[newEnumName] = WebCL[legacyEnumName];
          }
        }
      },checkWebCL:function () {
        // If we already check is not useful to do this again
        if (CL.webcl_webkit == 1 || CL.webcl_mozilla == 1) {
          return 0;
        }
        // Look is the browser is comaptible
        var isWebkit = 'webkitRequestAnimationFrame' in window;
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (!isWebkit && !isFirefox) {
          console.error("This current browser is not compatible with WebCL implementation !!! \n");
          console.error("Use WebKit Samsung or Firefox Nokia plugin\n");            
          return -1;
        }
        // Look is the browser have WebCL implementation
        if (window.WebCL == undefined || isWebkit) {
          if (typeof(webcl) === "undefined") {
            console.error("This browser has not WebCL implementation !!! \n");
            console.error("Use WebKit Samsung or Firefox Nokia plugin\n");            
            return -1;
          } else {
            window.WebCL = webcl
          }
        }
        CL.webcl_webkit = isWebkit == true ? 1 : 0;
        CL.webcl_mozilla = isFirefox == true ? 1 : 0;
        CL.index_object = 2147483647;
        CL.setupWebCLEnums();
        // Init Device info
        CL.device_infos = {
          0x1000:CL.DEVICE_TYPE,
          0x1001:CL.DEVICE_VENDOR_ID,
          0x1002:CL.DEVICE_MAX_COMPUTE_UNITS,
          0x1003:CL.DEVICE_MAX_WORK_ITEM_DIMENSIONS,      
          0x1004:CL.DEVICE_MAX_WORK_GROUP_SIZE,
          0x1005:CL.DEVICE_MAX_WORK_ITEM_SIZES,
          0x1006:CL.DEVICE_PREFERRED_VECTOR_WIDTH_CHAR,
          0x1007:CL.DEVICE_PREFERRED_VECTOR_WIDTH_SHORT,
          0x1008:CL.DEVICE_PREFERRED_VECTOR_WIDTH_INT,
          0x1009:CL.DEVICE_PREFERRED_VECTOR_WIDTH_LONG,
          0x100A:CL.DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT,
          0x100B:CL.DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE,      
          0x100C:CL.DEVICE_MAX_CLOCK_FREQUENCY,
          0x100D:CL.DEVICE_ADDRESS_BITS,    
          0x100E:CL.DEVICE_MAX_READ_IMAGE_ARGS,    
          0x100F:CL.DEVICE_MAX_WRITE_IMAGE_ARGS,    
          0x1010:CL.DEVICE_MAX_MEM_ALLOC_SIZE,
          0x1011:CL.DEVICE_IMAGE2D_MAX_WIDTH,
          0x1012:CL.DEVICE_IMAGE2D_MAX_HEIGHT,
          0x1013:CL.DEVICE_IMAGE3D_MAX_WIDTH,
          0x1014:CL.DEVICE_IMAGE3D_MAX_HEIGHT,
          0x1015:CL.DEVICE_IMAGE3D_MAX_DEPTH,
          0x1016:CL.DEVICE_IMAGE_SUPPORT,
          0x101F:CL.DEVICE_GLOBAL_MEM_SIZE,
          0x1020:CL.DEVICE_MAX_CONSTANT_BUFFER_SIZE,
          0x1022:CL.DEVICE_LOCAL_MEM_TYPE,
          0x1023:CL.DEVICE_LOCAL_MEM_SIZE,
          0x1024:CL.DEVICE_ERROR_CORRECTION_SUPPORT,
          0x1030:CL.DEVICE_EXTENSIONS,
          0x102A:CL.DEVICE_QUEUE_PROPERTIES,
          0x102B:CL.DEVICE_NAME,
          0x102C:CL.DEVICE_VENDOR,
          0x102D:CL.DRIVER_VERSION,
          0x102E:CL.DEVICE_PROFILE,
          0x102F:CL.DEVICE_VERSION            
        };
        var browser = (CL.webcl_mozilla == 1) ? "Mozilla" : "Webkit";
        console.info("Webcl implemented for "+browser);
        return 0;
      },isFloat:function (ptr,size) {
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
            } else {
              console.error("Unknow parameter type use float by default ...");   
              value |= CL.data_type.FLOAT;
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
      },getNewId:function (id) {
        return CL.index_object - (id + 1);
      },getArrayId:function (id) {
        return CL.index_object - id - 1;
      },getDeviceName:function (type) {
        switch (type) {
          case 2 : return "CPU_DEVICE";
          case 4 : return "GPU_DEVICE";
          default : return "UNKNOW_DEVICE";
        }
      },getAllDevices:function (platform) {
        console.info("getAllDevices");
        var res = [];
        if (platform >= CL.platforms.length || platform < 0 ) {
            console.error("getAllDevices: Invalid platform : "+plat);
            return res; 
        }
        if (CL.webcl_mozilla == 1) {
          res = CL.platforms[platform].getDeviceIDs(CL.DEVICE_TYPE_ALL);
        } else {
          // Webkit doesn't support DEVICE_TYPE_ALL ... but just in case i add try catch
          try {
            res = CL.platforms[platform].getDevices(CL.DEVICE_TYPE_ALL);
          } catch (e) {
            console.error("getAllDevices: Exception WebKit DEVICE_TYPE_ALL");
            try {
              res = res.concat(CL.platforms[platform].getDevices(CL.DEVICE_TYPE_CPU));  
            } catch (e) {
              console.error("getAllDevices: Exception WebKit DEVICE_TYPE_CPU");
            }
            try {
              res = res.concat(CL.platforms[platform].getDevices(CL.DEVICE_TYPE_GPU));  
            } catch (e) {
              console.error("getAllDevices: Exception WebKit DEVICE_TYPE_GPU");
            }
          }
        }    
        console.info("CL.getAllDevices: "+res.length);
        if (res.length == 0) {
          console.error("getAllDevices: Num of all devices can't be null");
        }
        return res;
      },catchError:function (name,e) {
        var str=""+e;
        var n=str.lastIndexOf(" ");
        var error = str.substr(n+1,str.length-n-2);
        console.error("CATCH: "+name+": "+e);
        return error;
      }};function _clGetPlatformIDs(num_entries,platform_ids,num_platforms) {
      if (CL.checkWebCL() < 0) {
        console.error(CL.errorMessage);
        return -1;/*WEBCL_NOT_FOUND*/;
      }
      try { 
        // Get the platform
        var platforms = WebCL.getPlatforms();
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
          var name = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (CL.PLATFORM_NAME) : "Not Visible"/*plat.getInfo (CL.PLATFORM_NAME)*/;
          var vendor = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (CL.PLATFORM_VENDOR) : "Not Visible"/*plat.getInfo (CL.PLATFORM_VENDOR)*/;
          var version = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (CL.PLATFORM_VERSION) : plat.getInfo (CL.PLATFORM_VERSION);
          var extensions = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (CL.PLATFORM_EXTENSIONS) : "Not Visible"/*plat.getInfo (CL.PLATFORM_EXTENSIONS)*/;
          var profile = (CL.webcl_mozilla == 1) ? plat.getPlatformInfo (CL.PLATFORM_PROFILE) : plat.getInfo (CL.PLATFORM_PROFILE);
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
          HEAP32[(((platform_ids)+(i*4))>>2)]=CL.getNewId(i);
        }
        return 0;/*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetPlatformID",e);
      }
    }
  function _clGetDeviceIDs(platform, device_type_i64_1, device_type_i64_2, num_entries, devices_ids, num_devices) {
      if (CL.checkWebCL() < 0) {
        console.error(CL.errorMessage);
        return -1;/*WEBCL_NOT_FOUND*/;
      }
      // Assume the device type is i32 
      assert(device_type_i64_2 == 0, 'Invalid flags i64');
      try { 
        var plat = 0;
        // If platform is NULL, the behavior is implementation-defined
        if (platform == 0 && CL.platforms.length == 0) {
            // Get the platform
            var platforms = WebCL.getPlatforms();
            if (platforms.length > 0) {
              CL.platforms.push(platforms[0]);
              plat = CL.platforms.length - 1;
            } else {
              console.error("clGetDeviceIDs: Invalid platform : "+platform);
              return -32; /* CL_INVALID_PLATFORM */ 
            }      
        } else {
          plat = CL.getArrayId(platform);
        }
        var alldev = CL.getAllDevices(plat);
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
          var type = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(CL.DEVICE_TYPE) : alldev[i].getInfo(CL.DEVICE_TYPE);
          if (type == device_type_i64_1 || device_type_i64_1 == -1) { 
             var name = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(CL.DEVICE_NAME) : CL.getDeviceName(type);
             map[name] = alldev[i];
             mapcount ++;
          }    
        }
        if (mapcount == 0) {
          var alldev = CL.getAllDevices(plat);
          for (var i = 0 ; i < alldev.length; i++) {
            var name = (CL.webcl_mozilla == 1) ? alldev[i].getDeviceInfo(CL.DEVICE_NAME) : /*alldev[i].getInfo(CL.DEVICE_NAME) ;*/CL.getDeviceName(alldev[i].getInfo(CL.DEVICE_TYPE));
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
          HEAP32[(((devices_ids)+(i*4))>>2)]=CL.getNewId(i);
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
                prop.push(CL.CONTEXT_PLATFORM);
                i++;
                // get platform id
                readprop = CL.getArrayId(HEAP32[(((properties)+(i*4))>>2)]);
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
          prop = [CL.CONTEXT_PLATFORM, CL.platforms[0]];     
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
          CL.ctx.push(WebCL.createContext({platform: prop[1], devices: devices_tab, deviceType: devices_tab[0].getInfo(CL.DEVICE_TYPE), shareGroup: 1, hint: null}));
        }
        return CL.getNewId(CL.ctx.length-1);
      } catch (e) {    
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContext",e);
        return 0; // Null pointer    
      }
    }
  function ___gxx_personality_v0() {
    }
  function _clCreateProgramWithSource(context, count, strings, lengths, errcode_ret) {
      var ctx = CL.getArrayId(context);
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
        return CL.getNewId(CL.programs.length-1);
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateProgramWithSource",e);
        return 0; // Null pointer
      }
    }
  function _clBuildProgram(program, num_devices, device_list, options, pfn_notify, user_data) {
      var prog = CL.getArrayId(program);
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
          for (var i = 0; i < num_devices; i++) {
            var idx = CL.getArrayId(HEAP32[(((device_list)+(i*4))>>2)]);
            devices_tab[i] = CL.devices[idx];
          }
        }    
        var opt = "";//Pointer_stringify(options);
        if (CL.webcl_mozilla == 1) {
          CL.programs[prog].buildProgram (devices_tab, opt);
        } else { 
          CL.programs[prog].build(devices_tab, opt);
        }
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clBuildProgram",e);
      }
    }
  function _clGetProgramBuildInfo(program, device, param_name, param_value_size, param_value, param_value_size_ret) {
      var prog = CL.getArrayId(program);
      if (prog >= CL.programs.length || prog < 0 ) {
        console.error("clGetProgramBuildInfo: Invalid program : "+prog);
        return -44; /* CL_INVALID_PROGRAM */
      }          
      // \todo the type is a number but why i except have a Array ??? Will must be an array ???
      // var idx = HEAP32[((device)>>2)] - 1;
      var idx = CL.getArrayId(device);
      if (idx >= CL.devices.length || idx < 0 ) {
        console.error("clGetProgramBuildInfo: Invalid device : "+idx);
        return -33; /* CL_INVALID_DEVICE */  
      }
      try {
        var res = "";
        switch (param_name) {
          case 0x1181 /*CL_PROGRAM_BUILD_STATUS*/:
          res = CL.programs[prog].getProgramBuildInfo (CL.devices[idx], CL.PROGRAM_BUILD_STATUS);
          break;
        case 0x1182 /*CL_PROGRAM_BUILD_OPTIONS*/:
          res = CL.programs[prog].getProgramBuildInfo (CL.devices[idx], CL.PROGRAM_BUILD_OPTIONS);
          break;
        case 0x1183 /*CL_PROGRAM_BUILD_LOG*/:
          res = CL.programs[prog].getProgramBuildInfo (CL.devices[idx], CL.PROGRAM_BUILD_LOG);
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
      var prog = CL.getArrayId(program);
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
        return CL.getNewId(CL.kernels.length-1);
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateKernel",e);
        return 0; // Null pointer    
      }
    }
  function _clCreateCommandQueue(context, devices, properties, errcode_ret) {
      var ctx = CL.getArrayId(context);
      if (ctx >= CL.ctx.length || ctx < 0 ) {
          console.error("clCreateCommandQueue: Invalid context : "+ctx);
          HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
          return 0; // Null pointer    
      }
      try {
        var idx = CL.getArrayId(devices);//HEAP32[((devices)>>2)];
        if (idx < 0) {
          // Create a command-queue on the first device available if idx == 0
          console.error("\\todo clCreateCommandQueue() : idx = 0 : Need work on that ")
          var devices = CL.getAllDevices(0);
          CL.devices.push(devices[0]);
        }
        if (idx >= CL.devices.length) {
          console.error("clCreateCommandQueue: Invalid device : "+idx);
          HEAP32[((errcode_ret)>>2)]=-33 /* CL_INVALID_DEVICE */;  
          return 0; // Null pointer    
        }
        // \todo set the properties 
        CL.cmdQueue.push(CL.ctx[ctx].createCommandQueue(CL.devices[idx], 0));
        return CL.getNewId(CL.cmdQueue.length-1);
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateCommandQueue",e);
        return 0; // Null pointer    
      }
    }
  function _clCreateBuffer(context, flags_i64_1, flags_i64_2, size, host_ptr, errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      var ctx = CL.getArrayId(context);
      if (ctx >= CL.ctx.length || ctx < 0 ) {
        console.error("clCreateBuffer: Invalid context : "+ctx);
        HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
        return 0; // Null pointer    
      }
      try {
        var macro;
        switch (flags_i64_1) {
          case (1 << 0) /* CL_MEM_READ_WRITE */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(CL.MEM_READ_WRITE,size));
            break;
          case (1 << 1) /* CL_MEM_WRITE_ONLY */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(CL.MEM_WRITE_ONLY,size));
            break;
          case (1 << 2) /* CL_MEM_READ_ONLY */:
            CL.buffers.push(CL.ctx[ctx].createBuffer(CL.MEM_READ_ONLY,size));
            break;
          case (((1 << 0)|(1 << 5))) /* CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR */:
            macro = CL.MEM_READ_WRITE;
          case (((1 << 1)|(1 << 5))) /* CL_MEM_WRITE_ONLY | CL_MEM_COPY_HOST_PTR */:
            macro = CL.MEM_WRITE_ONLY;
          case (((1 << 2)|(1 << 5))) /* CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR */:
            macro = CL.MEM_READ_ONLY;
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
              vector = new ArrayBuffer(size / ArrayBuffer.BYTES_PER_ELEMENT);
            } else {
              if ( isFloat == 0 && isUint == 0 && isInt == 0 ) {
                isFloat = CL.isFloat(host_ptr,size); 
                if (isFloat) {
                  vector = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);
                } else {
                  vector = new Int32Array(size / Int32Array.BYTES_PER_ELEMENT);
                }
              } else {        
                if (isFloat) {
                  vector = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);
                } else if (isUint) {
                  vector = new Uint32Array(size / Uint32Array.BYTES_PER_ELEMENT);
                } else if (isInt) {
                  vector = new Int32Array(size / Int32Array.BYTES_PER_ELEMENT);
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
            //console.info(vector);
            if (CL.webcl_webkit == -1) {
                CL.buffers.push(CL.ctx[ctx].createBuffer(macro | CL.MEM_COPY_HOST_PTR, size, vector));
            } else {
              CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));              
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
        return CL.getNewId(CL.buffers.length-1);
      } catch(e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateBuffer",e);
        return 0;
      }
    }
  function _clSetKernelArg(kernel, arg_index, arg_size, arg_value) {
      var ker = CL.getArrayId(kernel);
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
            //CL.kernels[ker].setKernelArg(arg_index,value,CL.types.FLOAT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.FLOAT | type);
          } else {          
            //CL.kernels[ker].setKernelArg(arg_index,value,CL.types.INT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.INT | type);
          } 
        } else {     
          var idx = CL.getArrayId(HEAP32[((arg_value)>>2)]);
          if (idx >= 0 && idx < CL.buffers.length) {
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,CL.buffers[idx]) : CL.kernels[ker].setArg(arg_index,CL.buffers[idx]);
          } else {
            if (isFloat) { 
              value = HEAPF32[((arg_value)>>2)];
              ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.FLOAT);
            } else {
              value = HEAP32[((arg_value)>>2)];
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
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clEnqueueNDRangeKernel: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var ker = CL.getArrayId(kernel);
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
      /*
      if (CL.webcl_mozilla == 1) {
        value_local_work_size = [];
      } else {
        value_local_work_size = null;
      }
      */
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
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clEnqueueReadBuffer: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var buff = CL.getArrayId(buffer);
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
          vector = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueReadBuffer: use FLOAT output type ...");
        } else if (isUint) {
          vector = new Uint32Array(size / Uint32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueReadBuffer: use UINT output type ...");
        } else if (isInt) {
          vector = new Int32Array(size / Int32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueReadBuffer: use INT output type ...");
        } else {
          console.error("clEnqueueReadBuffer: Unknow ouptut type : "+sig[buff]);
        }
        CL.cmdQueue[queue].enqueueReadBuffer (CL.buffers[buff], blocking_read == 1 ? true : false, offset, size, vector, []);
        for (var i = 0; i < (size / 4); i++) {
          if (isFloat) {
            HEAPF32[(((results)+(i*4))>>2)]=vector[i];  
          } else {
            HEAP32[(((results)+(i*4))>>2)]=vector[i];  
          }         
        }
        //console.info(vector);
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueReadBuffer",e);
      }
    }
  function __ZSt9terminatev() {
      _exit(-1234);
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
      __THREW__ = 0;
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
        function createSimpleOutput() {
          var fn = function (val) {
            if (val === null || val === 10) {
              fn.printer(fn.buffer.join(''));
              fn.buffer = [];
            } else {
              fn.buffer.push(utf8.processCChar(val));
            }
          };
          return fn;
        }
        if (!output) {
          stdoutOverridden = false;
          output = createSimpleOutput();
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = createSimpleOutput();
        }
        if (!error.printer) error.printer = Module['printErr'];
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
          return tempRet0 = typeArray[i],thrown;
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return tempRet0 = throwntype,thrown;
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
  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP8[(dest)]=HEAP8[(src)];
        }
      } else {
        _memcpy(dest, src, num) | 0;
      }
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
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
      } else if (offset >= stream.object.contents.length) {
        return 0;
      } else {
        var bytesRead = 0;
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        assert(size >= 0);
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
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          assert(bytesRead >= -1);
          if (bytesRead != -1) {
            stream.position += bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.streams[stream];
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
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
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
      stream = FS.streams[stream];
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
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
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
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while (HEAP8[(((psrc)+(i-1))|0)]);
      return pdest|0;
    }
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
      Module['abort']();
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
  var ___tm_struct_layout={__size__:44,tm_sec:0,tm_min:4,tm_hour:8,tm_mday:12,tm_mon:16,tm_year:20,tm_wday:24,tm_yday:28,tm_isdst:32,tm_gmtoff:36,tm_zone:40};
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      var date = {
        tm_sec: HEAP32[(((tm)+(___tm_struct_layout.tm_sec))>>2)],
        tm_min: HEAP32[(((tm)+(___tm_struct_layout.tm_min))>>2)],
        tm_hour: HEAP32[(((tm)+(___tm_struct_layout.tm_hour))>>2)],
        tm_mday: HEAP32[(((tm)+(___tm_struct_layout.tm_mday))>>2)],
        tm_mon: HEAP32[(((tm)+(___tm_struct_layout.tm_mon))>>2)],
        tm_year: HEAP32[(((tm)+(___tm_struct_layout.tm_year))>>2)],
        tm_wday: HEAP32[(((tm)+(___tm_struct_layout.tm_wday))>>2)],
        tm_yday: HEAP32[(((tm)+(___tm_struct_layout.tm_yday))>>2)],
        tm_isdst: HEAP32[(((tm)+(___tm_struct_layout.tm_isdst))>>2)]
      };
      var pattern = Pointer_stringify(format);
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var leadingSomething = function(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
      var leadingNulls = function(value, digits) {
        return leadingSomething(value, digits, '0');
      };
      var compareByDay = function(date1, date2) {
        var sgn = function(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
      var getFirstWeekStartDate = function(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
      var getWeekBasedYear = function(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }var _strftime_l=_strftime;
  function _isspace(chr) {
      switch(chr) {
        case 32:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
          return true;
        default:
          return false;
      };
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
        return tempRet0 = 0,0;
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
      return tempRet0 = HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP32[((tempDoublePtr)>>2)];
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
var FUNCTION_TABLE = [0,0,__ZNSt3__18messagesIwED0Ev,0,__ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNKSt3__18numpunctIcE12do_falsenameEv,0,__ZNKSt3__120__time_get_c_storageIwE3__rEv,0,__ZNKSt3__110moneypunctIwLb0EE16do_thousands_sepEv
,0,__ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt12length_errorD0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED1Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm
,0,__Z15contextCallbackPKcPKvjPv,0,__ZNKSt3__15ctypeIcE10do_toupperEc,0,__ZNSt3__16locale2id6__initEv,0,__ZNSt3__110__stdinbufIcED1Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm
,0,__ZNSt3__110__stdinbufIcE9pbackfailEi,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9underflowEv,0,__ZNSt3__111__stdoutbufIwE5imbueERKNS_6localeE,0,__ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev
,0,__ZNSt11logic_errorD0Ev,0,__ZNSt13runtime_errorD2Ev,0,__ZNKSt3__17collateIcE7do_hashEPKcS3_,0,__ZNKSt3__120__time_get_c_storageIwE8__monthsEv,0,__ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev
,0,__ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwRKNS_12basic_stringIwS3_NS_9allocatorIwEEEE,0,__ZNKSt3__15ctypeIcE10do_toupperEPcPKc,0,__ZNKSt3__17codecvtIcc10_mbstate_tE6do_outERS1_PKcS5_RS5_PcS7_RS7_,0,__ZNKSt3__110moneypunctIwLb1EE16do_positive_signEv,0,__ZNKSt3__15ctypeIwE10do_tolowerEPwPKw
,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5uflowEv,0,__ZNSt3__17collateIcED1Ev,0,__ZNSt3__18ios_base7failureD2Ev,0,__ZTv0_n12_NSt3__114basic_ifstreamIcNS_11char_traitsIcEEED0Ev,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib
,0,__ZNSt9bad_allocD2Ev,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_,0,__ZNSt11logic_errorD2Ev,0,__ZNSt3__16locale5facetD0Ev,0,__ZNKSt3__120__time_get_c_storageIwE3__cEv
,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwy,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwx,0,__ZNSt3__15ctypeIcED0Ev,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwm,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwl
,0,__ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNSt8bad_castC2Ev,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwe,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwd
,0,__ZNKSt3__110moneypunctIcLb1EE16do_decimal_pointEv,0,__ZNKSt3__17codecvtIwc10_mbstate_tE11do_encodingEv,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwb,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEcRKNS_12basic_stringIcS3_NS_9allocatorIcEEEE
,0,__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE13do_max_lengthEv,0,__ZNKSt3__17codecvtIwc10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13do_date_orderEv,0,__ZNSt3__18messagesIcED1Ev
,0,__ZNKSt3__120__time_get_c_storageIwE7__weeksEv,0,__ZNKSt3__18numpunctIwE11do_groupingEv,0,__ZNSt3__16locale5facet16__on_zero_sharedEv,0,__ZNKSt3__15ctypeIwE8do_widenEc,0,__ZNKSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPK2tmcc
,0,__ZNSt3__110__stdinbufIcE5uflowEv,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm,0,__ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5uflowEv
,0,__ZNKSt3__110moneypunctIwLb0EE13do_neg_formatEv,0,__ZNKSt3__17codecvtIwc10_mbstate_tE5do_inERS1_PKcS5_RS5_PwS7_RS7_,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE5do_inERS1_PKcS5_RS5_PDsS7_RS7_,0,__ZNKSt3__15ctypeIcE8do_widenEc,0,__ZNSt3__110moneypunctIwLb0EED0Ev
,0,__ZNKSt3__17codecvtIDic10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNSt3__16locale5__impD2Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9underflowEv,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPKv,0,__ZNSt3__18numpunctIcED2Ev
,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE8overflowEi,0,__ZNSt3__17codecvtIcc10_mbstate_tED0Ev,0,__ZNKSt3__18numpunctIcE11do_groupingEv,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED0Ev
,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm,0,__ZNKSt3__120__time_get_c_storageIwE3__xEv,0,__ZNKSt3__17codecvtIcc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_,0,__ZNSt3__110__stdinbufIwE9pbackfailEi,0,__ZNKSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPK2tmcc
,0,__ZNSt3__18numpunctIcED0Ev,0,__ZNSt3__111__stdoutbufIcE8overflowEi,0,__ZNSt3__119__iostream_categoryD1Ev,0,__ZNKSt3__120__time_get_c_storageIwE7__am_pmEv,0,__ZNSt3__110__stdinbufIwED0Ev
,0,__ZNKSt3__18messagesIcE8do_closeEi,0,__ZNKSt3__15ctypeIwE5do_isEPKwS3_Pt,0,__ZNSt13runtime_errorD2Ev,0,__ZNKSt3__15ctypeIwE10do_toupperEw,0,__ZNKSt3__15ctypeIwE9do_narrowEPKwS3_cPc
,0,__ZNKSt3__17codecvtIDic10_mbstate_tE11do_encodingEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5imbueERKNS_6localeE,0,__ZNKSt3__110moneypunctIcLb0EE16do_negative_signEv,0,__ZNSt3__17collateIwED1Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm
,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZNKSt8bad_cast4whatEv,0,__ZNSt3__110moneypunctIcLb0EED1Ev,0,__ZNKSt3__18messagesIcE6do_getEiiiRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE,0,__ZNSt3__18numpunctIwED2Ev
,0,__ZNKSt3__110moneypunctIwLb1EE13do_pos_formatEv,0,__ZNSt3__15ctypeIwED0Ev,0,__ZNKSt13runtime_error4whatEv,0,_free,0,__ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev
,0,__ZNSt3__117__widen_from_utf8ILj32EED0Ev,0,__ZNKSt3__18numpunctIwE16do_thousands_sepEv,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc,0,__ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev,0,__ZNKSt3__18numpunctIcE16do_decimal_pointEv
,0,__ZNKSt3__110moneypunctIwLb0EE16do_negative_signEv,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNKSt3__120__time_get_c_storageIcE3__xEv,0,__ZNSt3__17collateIwED0Ev,0,__ZNKSt3__110moneypunctIcLb0EE16do_positive_signEv
,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE16do_always_noconvEv,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNSt11logic_errorD2Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekoffExNS_8ios_base7seekdirEj,0,__ZNSt3__117__call_once_proxyINS_5tupleIJNS_12_GLOBAL__N_111__fake_bindEEEEEEvPv
,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcy,0,__ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE4syncEv,0,__ZNKSt3__18numpunctIwE16do_decimal_pointEv,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE4syncEv
,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNSt3__114error_categoryD2Ev,0,__ZNKSt3__110moneypunctIcLb0EE11do_groupingEv,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNKSt3__110moneypunctIwLb1EE14do_frac_digitsEv
,0,__ZNKSt3__110moneypunctIwLb1EE16do_negative_signEv,0,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNKSt3__120__time_get_c_storageIcE3__XEv,0,__ZNSt3__16localeC2ERKS0_,0,__ZNKSt3__15ctypeIwE9do_narrowEwc
,0,__ZTv0_n12_NSt3__114basic_ifstreamIcNS_11char_traitsIcEEED1Ev,0,__ZNSt3__110__stdinbufIcE9underflowEv,0,__ZNSt3__111__stdoutbufIwE4syncEv,0,__ZNSt3__110moneypunctIwLb0EED1Ev,0,__ZNKSt3__110moneypunctIcLb1EE13do_neg_formatEv
,0,__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev,0,__ZNKSt3__17codecvtIcc10_mbstate_tE5do_inERS1_PKcS5_RS5_PcS7_RS7_,0,__ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev,0,__ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev
,0,__ZNKSt3__17collateIwE7do_hashEPKwS3_,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj,0,__ZNSt3__111__stdoutbufIcE5imbueERKNS_6localeE,0,__ZNKSt3__110moneypunctIcLb1EE16do_thousands_sepEv,0,__ZNSt3__18ios_baseD0Ev
,0,__ZNSt3__110moneypunctIcLb1EED0Ev,0,__ZNSt9bad_allocD0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED0Ev,0,__ZNKSt3__17codecvtIwc10_mbstate_tE16do_always_noconvEv,0,__ZNKSt3__120__time_get_c_storageIcE3__rEv
,0,__ZNKSt3__114error_category10equivalentEiRKNS_15error_conditionE,0,___cxx_global_array_dtor53,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsputnEPKci,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE9pbackfailEi,0,___cxx_global_array_dtor56
,0,__ZNKSt3__15ctypeIwE10do_scan_isEtPKwS3_,0,__ZNKSt3__17codecvtIDic10_mbstate_tE6do_outERS1_PKDiS5_RS5_PcS7_RS7_,0,__ZNKSt3__17codecvtIDic10_mbstate_tE13do_max_lengthEv,0,__ZNKSt3__17codecvtIDic10_mbstate_tE5do_inERS1_PKcS5_RS5_PDiS7_RS7_,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj
,0,__ZNSt3__16locale5__impD0Ev,0,__ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED1Ev,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,__ZNKSt3__17collateIwE10do_compareEPKwS3_S3_S3_
,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsgetnEPci,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv,0,__ZNKSt3__15ctypeIcE10do_tolowerEc,0,__ZNKSt3__110moneypunctIwLb1EE13do_neg_formatEv,0,__ZNKSt3__15ctypeIcE8do_widenEPKcS3_Pc
,0,__ZNSt3__17codecvtIwc10_mbstate_tED0Ev,0,__ZNKSt3__110moneypunctIwLb1EE16do_decimal_pointEv,0,__ZNKSt3__110moneypunctIwLb1EE11do_groupingEv,0,__ZNSt3__17codecvtIDsc10_mbstate_tED0Ev,0,__ZNKSt3__120__time_get_c_storageIcE7__weeksEv
,0,__ZNSt8bad_castD2Ev,0,__ZNKSt3__18numpunctIwE11do_truenameEv,0,__ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev,0,__ZNSt3__110__stdinbufIwE9underflowEv,0,__ZNSt3__18ios_base7failureD0Ev
,0,__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt3__18ios_base4InitD2Ev,0,__ZNKSt3__15ctypeIwE5do_isEtw,0,__ZNSt3__110moneypunctIwLb1EED0Ev,0,__ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev
,0,__ZNKSt3__15ctypeIcE9do_narrowEPKcS3_cPc,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm,0,__ZNKSt3__17codecvtIDic10_mbstate_tE16do_always_noconvEv,0,___cxx_global_array_dtor105,0,__ZNKSt3__17codecvtIwc10_mbstate_tE13do_max_lengthEv
,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6setbufEPwi,0,__ZNKSt3__18messagesIwE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE,0,__ZNSt3__17codecvtIDic10_mbstate_tED0Ev
,0,__ZNSt3__111__stdoutbufIcED1Ev,0,__ZNKSt3__110moneypunctIcLb1EE14do_curr_symbolEv,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE6setbufEPci,0,__ZNSt13runtime_errorC2EPKc,0,__ZNSt3__114basic_ifstreamIcNS_11char_traitsIcEEED1Ev
,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNKSt3__119__iostream_category4nameEv,0,__ZNKSt3__110moneypunctIcLb0EE14do_frac_digitsEv,0,__ZNSt3__16localeD2Ev,0,__ZNKSt3__110moneypunctIcLb1EE11do_groupingEv
,0,__ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNSt8bad_castD0Ev,0,__ZNKSt3__15ctypeIcE9do_narrowEcc,0,__ZNSt3__116__narrow_to_utf8ILj32EED0Ev
,0,__ZNSt3__112__do_nothingEPv,0,__ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,___cxx_global_array_dtor81,0,__ZNSt3__110moneypunctIcLb0EED0Ev,0,__ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev
,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPKv,0,__ZNKSt3__18numpunctIwE12do_falsenameEv,0,__ZNSt3__17collateIcED0Ev,0,__ZNKSt3__110moneypunctIwLb0EE13do_pos_formatEv,0,__ZNKSt3__110moneypunctIcLb1EE16do_negative_signEv
,0,__ZNSt3__114basic_ifstreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__16locale5facetD2Ev,0,__ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev,0,__ZNSt3__112system_errorD0Ev,0,__ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe
,0,__ZNKSt3__17codecvtIcc10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNSt3__110__stdinbufIwE5uflowEv,0,__ZNKSt3__18numpunctIcE11do_truenameEv,0,__ZNKSt3__110moneypunctIcLb1EE13do_pos_formatEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekposENS_4fposI10_mbstate_tEEj
,0,__ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwe,0,__ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_,0,__ZNKSt3__18numpunctIcE16do_thousands_sepEv,0,__ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev
,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9showmanycEv,0,__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE8overflowEi,0,___cxa_pure_virtual
,0,__ZNSt3__18numpunctIwED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE,0,__ZNKSt3__15ctypeIwE10do_tolowerEw,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE4syncEv,0,__ZNSt3__111__stdoutbufIcE4syncEv
,0,__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev,0,__ZNKSt3__17codecvtIwc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_,0,__ZNKSt3__17collateIcE10do_compareEPKcS3_S3_S3_,0,__ZNKSt3__17codecvtIwc10_mbstate_tE6do_outERS1_PKwS5_RS5_PcS7_RS7_,0,__ZNSt3__110__stdinbufIwED1Ev
,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj,0,__ZNKSt3__17collateIwE12do_transformEPKwS3_,0,__ZNSt3__114error_categoryD0Ev,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcx,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEce
,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcd,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE9underflowEv,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcb,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcm,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcl
,0,__ZNSt8bad_castD2Ev,0,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,0,__ZNKSt3__110moneypunctIcLb1EE14do_frac_digitsEv,0,__ZNKSt3__17codecvtIDic10_mbstate_tE10do_unshiftERS1_PcS4_RS4_,0,__ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIcS3_NS_9allocatorIcEEEE
,0,__ZNKSt3__15ctypeIwE10do_toupperEPwPKw,0,__ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__110__stdinbufIwE5imbueERKNS_6localeE,0,__ZNKSt3__114error_category23default_error_conditionEi,0,__ZNKSt3__17codecvtIcc10_mbstate_tE13do_max_lengthEv
,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNKSt3__17codecvtIcc10_mbstate_tE16do_always_noconvEv,0,__ZNKSt3__18messagesIwE8do_closeEi,0,__ZNSt3__110__stdinbufIcE5imbueERKNS_6localeE,0,__ZNSt3__112system_errorD2Ev
,0,__ZNKSt9bad_alloc4whatEv,0,__ZNKSt3__110moneypunctIwLb0EE11do_groupingEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9showmanycEv,0,__ZNKSt3__110moneypunctIcLb0EE16do_decimal_pointEv,0,__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev
,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRy,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRx,0,__ZNKSt3__120__time_get_c_storageIcE8__monthsEv,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRt,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv
,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRm,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRl,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRb,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRe,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRd
,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRf,0,__ZNKSt3__17codecvtIcc10_mbstate_tE11do_encodingEv,0,__ZNKSt3__110moneypunctIcLb0EE16do_thousands_sepEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsgetnEPwi,0,__ZNKSt3__110moneypunctIcLb0EE13do_neg_formatEv
,0,__ZNSt3__111__stdoutbufIcED0Ev,0,__ZNKSt11logic_error4whatEv,0,__ZNKSt3__119__iostream_category7messageEi,0,__ZNKSt3__110moneypunctIcLb0EE13do_pos_formatEv,0,__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev
,0,__ZNKSt3__110moneypunctIwLb0EE16do_decimal_pointEv,0,__ZNKSt3__17collateIcE12do_transformEPKcS3_,0,__ZNKSt3__114error_category10equivalentERKNS_10error_codeEi,0,__ZNKSt3__110moneypunctIwLb0EE14do_frac_digitsEv,0,__ZNSt3__18messagesIcED0Ev
,0,__ZNKSt3__15ctypeIcE10do_tolowerEPcPKc,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED1Ev,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc,0,__ZNKSt3__120__time_get_c_storageIcE7__am_pmEv,0,__ZNKSt3__110moneypunctIcLb0EE14do_curr_symbolEv
,0,__ZNKSt3__15ctypeIwE8do_widenEPKcS3_Pw,0,__ZNKSt3__110moneypunctIwLb1EE16do_thousands_sepEv,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNSt3__18ios_baseD2Ev,0,__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev
,0,__ZNSt3__110__stdinbufIcED0Ev,0,__ZNSt3__16localeC2Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13do_date_orderEv,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt3__119__iostream_categoryD0Ev
,0,__ZNSt3__110moneypunctIwLb1EED1Ev,0,__ZNKSt3__110moneypunctIwLb0EE14do_curr_symbolEv,0,__ZNKSt3__18messagesIcE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE,0,__ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt3__110moneypunctIcLb1EED1Ev
,0,__ZNSt3__111__stdoutbufIwED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj,0,__ZNKSt3__120__time_get_c_storageIcE3__cEv,0,__ZNSt3__17codecvtIwc10_mbstate_tED2Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6setbufEPci
,0,__ZNKSt3__110moneypunctIwLb0EE16do_positive_signEv,0,__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE8overflowEi,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_,0,__ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNKSt3__120__time_get_c_storageIwE3__XEv
,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm,0,__ZNKSt3__110moneypunctIcLb1EE16do_positive_signEv,0,__ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9pbackfailEi
,0,__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__111__stdoutbufIwE8overflowEi,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRy,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRx,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRt
,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRm,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRl,0,__ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEce,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRe,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRd
,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRf,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRb,0,___cxx_global_array_dtor,0,__ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZN10__cxxabiv117__class_type_infoD0Ev
,0,__ZNSt3__18messagesIwED1Ev,0,__ZNSt3__111__stdoutbufIwED1Ev,0,__ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIwS3_NS_9allocatorIwEEEE,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,__ZNKSt3__15ctypeIwE11do_scan_notEtPKwS3_
,0,__ZNKSt3__110moneypunctIwLb1EE14do_curr_symbolEv,0,__ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE6do_outERS1_PKDsS5_RS5_PcS7_RS7_,0,__ZNKSt3__18messagesIwE6do_getEiiiRKNS_12basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE11do_encodingEv
,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9pbackfailEi,0,__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsputnEPKwi,0,__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev,0,__ZNSt3__15ctypeIcED2Ev,0,__ZNSt13runtime_errorD0Ev,0,__ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev,0,___cxx_global_array_dtor120];
// EMSCRIPTEN_START_FUNCS
function __Z15contextCallbackPKcPKvjPv(r1,r2,r3,r4){r4=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r4;r4=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14560,2760),r1);__ZNKSt3__18ios_base6getlocEv(r3,r4+HEAP32[HEAP32[r4>>2]-12>>2]|0);r1=__ZNKSt3__16locale9use_facetERNS0_2idE(r3,14464);r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,10);__ZNSt3__16localeD2Ev(r3);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r4,r2);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r4);_exit(1)}function __ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_(r5,r1);do{if((HEAP8[r5|0]&1)!=0){r8=_strlen(r2);r9=r1;r10=HEAP32[HEAP32[r9>>2]-12>>2];r11=r1,r12=r11>>2;HEAP32[r6>>2]=HEAP32[(r10+24>>2)+r12];r13=r2+r8|0;r8=(HEAP32[(r10+4>>2)+r12]&176|0)==32?r13:r2;r14=r11+r10|0;r15=r10+(r11+76)|0;r10=HEAP32[r15>>2];if((r10|0)==-1){__ZNKSt3__18ios_base6getlocEv(r4,r14);r16=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14464);r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+28>>2]](r16,32);__ZNSt3__16localeD2Ev(r4);HEAP32[r15>>2]=r17<<24>>24;r18=r17}else{r18=r10&255}__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r7,r6,r2,r8,r13,r14,r18);if((HEAP32[r7>>2]|0)!=0){break}r14=HEAP32[HEAP32[r9>>2]-12>>2];__ZNSt3__18ios_base5clearEj(r11+r14|0,HEAP32[(r14+16>>2)+r12]|5)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev(r5);STACKTOP=r3;return r1}function _main(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r2=0;r1=STACKTOP;STACKTOP=STACKTOP+16728|0;r3=r1;r4=r1+8;r5=r1+16;r6=r1+24;r7=r1+32;r8=r1+40;r9=r1+48;r10=r1+56,r11=r10>>2;r12=r1+64,r13=r12>>2;r14=r1+72,r15=r14>>2;r16=r1+80;r17=r1+88;r18=r1+96;r19=r1+104;r20=r1+120,r21=r20>>2;r22=r1+312;r23=r1+328;r24=r1+336;r25=r1+344;r26=_clGetPlatformIDs(0,0,r12);HEAP32[r11]=r26;if((r26|0)==0){r27=((HEAP32[r13]|0)==0)<<31>>31}else{r27=r26}__Z8checkErriPKc(r27,2736);r27=HEAP32[r13];r26=STACKTOP;STACKTOP=(r27<<2)+STACKTOP|0;STACKTOP=STACKTOP+7>>3<<3;r12=r26;r26=_clGetPlatformIDs(r27,r12,0);HEAP32[r11]=r26;if((r26|0)==0){r28=((HEAP32[r13]|0)==0)<<31>>31}else{r28=r26}__Z8checkErriPKc(r28,2736);L25:do{if((HEAP32[r13]|0)!=0){r28=0;while(1){r29=((r28<<2)+r12|0)>>2;r26=_clGetDeviceIDs(HEAP32[r29],2,0,0,0,r14);HEAP32[r11]=r26;if((r26|0)==-1|(r26|0)==0){r30=HEAP32[r15];if((r30|0)!=0){break}}else{__Z8checkErriPKc(r26,1848)}r26=r28+1|0;if(r26>>>0<HEAP32[r13]>>>0){r28=r26}else{break L25}}r28=STACKTOP;STACKTOP=(r30<<2)+STACKTOP|0;STACKTOP=STACKTOP+7>>3<<3;r26=r28;r28=_clGetDeviceIDs(HEAP32[r29],2,0,r30,r26,0);HEAP32[r11]=r28;__Z8checkErriPKc(r28,1848);r28=r19|0;HEAP32[r28>>2]=4228;HEAP32[r19+4>>2]=HEAP32[r29];HEAP32[r19+8>>2]=0;r27=_clCreateContext(r28,HEAP32[r15],r26,22,0,r10);__Z8checkErriPKc(HEAP32[r11],1320);r28=r20;r31=r20+108|0;r32=(r20|0)>>2;r33=r20;r34=r20+8|0;r35=r20;HEAP32[r32]=10828;r36=r20+108|0;HEAP32[r36>>2]=10848;HEAP32[r21+1]=0;__ZNSt3__18ios_base4initEPv(r20+108|0,r34);HEAP32[r21+45]=0;HEAP32[r21+46]=-1;HEAP32[r32]=5188;HEAP32[r31>>2]=5208;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEEC2Ev(r34);r37=(r20+72|0)>>2;do{if((HEAP32[r37]|0)==0){r38=_fopen(1296,1784);HEAP32[r37]=r38;if((r38|0)==0){r2=50;break}HEAP32[r21+24]=8;r39=r38}else{r2=50}}while(0);if(r2==50){r38=HEAP32[HEAP32[r35>>2]-12>>2];__ZNSt3__18ios_base5clearEj(r28+r38|0,HEAP32[r38+(r28+16)>>2]|4);r39=HEAP32[r37]}__Z8checkErriPKc(((r39|0)==0)<<31>>31,1128);HEAP32[r8>>2]=HEAP32[r28+HEAP32[HEAP32[r35>>2]-12>>2]+24>>2];HEAP32[r9>>2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initINS_19istreambuf_iteratorIcS2_EEEENS_9enable_ifIXaasr19__is_input_iteratorIT_EE5valuentsr21__is_forward_iteratorISA_EE5valueEvE4typeESA_SA_(r22,r8,r9);r38=HEAP8[r22];if((r38&1)==0){r40=r22+1|0}else{r40=HEAP32[r22+8>>2]}HEAP32[r23>>2]=r40;r41=r38&255;if((r41&1|0)==0){r42=r41>>>1}else{r42=HEAP32[r22+4>>2]}HEAP32[r24>>2]=r42;r41=_clCreateProgramWithSource(r27,1,r23,r24,r10);__Z8checkErriPKc(HEAP32[r11],824);r38=_clBuildProgram(r41,HEAP32[r15],r26,0,0,0);HEAP32[r11]=r38;if((r38|0)!=0){r38=r25|0;_clGetProgramBuildInfo(r41,HEAP32[r26>>2],4483,16384,r38,0);r43=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14736,624);__ZNKSt3__18ios_base6getlocEv(r6,r43+HEAP32[HEAP32[r43>>2]-12>>2]|0);r44=__ZNKSt3__16locale9use_facetERNS0_2idE(r6,14464);r45=FUNCTION_TABLE[HEAP32[HEAP32[r44>>2]+28>>2]](r44,10);__ZNSt3__16localeD2Ev(r6);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r43,r45);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r43);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14736,r38);__Z8checkErriPKc(HEAP32[r11],520)}r38=_clCreateKernel(r41,2720,r10);__Z8checkErriPKc(HEAP32[r11],2528);r41=_clCreateCommandQueue(r27,HEAP32[r26>>2],0,0,r10);__Z8checkErriPKc(HEAP32[r11],2240);r43=_clCreateBuffer(r27,36,0,256,120,r10);HEAP32[r16>>2]=r43;__Z8checkErriPKc(HEAP32[r11],2112);r43=_clCreateBuffer(r27,36,0,36,80,r10);HEAP32[r18>>2]=r43;__Z8checkErriPKc(HEAP32[r11],2024);r43=_clCreateBuffer(r27,2,0,144,0,r10);HEAP32[r17>>2]=r43;__Z8checkErriPKc(HEAP32[r11],1976);r43=_clSetKernelArg(r38,0,4,r16);HEAP32[r11]=r43;r43=_clSetKernelArg(r38,1,4,r18);HEAP32[r11]=HEAP32[r11]|r43;r43=_clSetKernelArg(r38,2,4,r17);HEAP32[r11]=HEAP32[r11]|r43;r43=_clSetKernelArg(r38,3,4,10920);HEAP32[r11]=HEAP32[r11]|r43;r43=_clSetKernelArg(r38,4,4,10912)|HEAP32[r11];HEAP32[r11]=r43;__Z8checkErriPKc(r43,1952);r43=_clEnqueueNDRangeKernel(r41,r38,1,0,3216,3224,0,0,0);HEAP32[r11]=r43;__Z8checkErriPKc(r43,1920);r43=_clEnqueueReadBuffer(r41,HEAP32[r17>>2],1,0,144,10928,0,0,0);HEAP32[r11]=r43;__Z8checkErriPKc(r43,1872);r43=0;while(1){__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14560,HEAP32[(r43<<2)+10928>>2]),1864);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14560,HEAP32[(r43<<2)+10952>>2]),1864);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14560,HEAP32[(r43<<2)+10976>>2]),1864);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14560,HEAP32[(r43<<2)+11e3>>2]),1864);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14560,HEAP32[(r43<<2)+11024>>2]),1864);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14560,HEAP32[(r43<<2)+11048>>2]),1864);__ZNKSt3__18ios_base6getlocEv(r5,HEAP32[HEAP32[3640]-12>>2]+14560|0);r41=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14464);r38=FUNCTION_TABLE[HEAP32[HEAP32[r41>>2]+28>>2]](r41,10);__ZNSt3__16localeD2Ev(r5);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(14560,r38);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14560);r38=r43+1|0;if(r38>>>0<6){r43=r38}else{break}}__ZNKSt3__18ios_base6getlocEv(r4,HEAP32[HEAP32[3640]-12>>2]+14560|0);r43=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14464);r27=FUNCTION_TABLE[HEAP32[HEAP32[r43>>2]+28>>2]](r43,10);__ZNSt3__16localeD2Ev(r4);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(14560,r27);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14560);r27=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14560,1816);__ZNKSt3__18ios_base6getlocEv(r3,r27+HEAP32[HEAP32[r27>>2]-12>>2]|0);r43=__ZNKSt3__16locale9use_facetERNS0_2idE(r3,14464);r26=FUNCTION_TABLE[HEAP32[HEAP32[r43>>2]+28>>2]](r43,10);__ZNSt3__16localeD2Ev(r3);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r27,r26);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r27);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r22);HEAP32[r32]=5188;HEAP32[r36>>2]=5208;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r34);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r33,6116);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r31);STACKTOP=r1;return 0}}while(0);r1=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14560,1688);__ZNKSt3__18ios_base6getlocEv(r7,r1+HEAP32[HEAP32[r1>>2]-12>>2]|0);r22=__ZNKSt3__16locale9use_facetERNS0_2idE(r7,14464);r3=FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+28>>2]](r22,10);__ZNSt3__16localeD2Ev(r7);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r1,r3);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r1);_exit(-1)}function __Z8checkErriPKc(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;if((r1|0)==0){STACKTOP=r3;return}r3=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14736,1592),r2),1544),r1),1512);__ZNKSt3__18ios_base6getlocEv(r4,r3+HEAP32[HEAP32[r3>>2]-12>>2]|0);r1=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14464);r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,10);__ZNSt3__16localeD2Ev(r4);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r3,r2);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r3);_exit(1)}function __ZNSt3__114basic_ifstreamIcNS_11char_traitsIcEEED1Ev(r1){HEAP32[r1>>2]=5188;HEAP32[r1+108>>2]=5208;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1+8|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6116);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r1+108|0);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r3]+24>>2]](r1);r4=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14160);r2=r4;HEAP32[r3+17]=r2;r5=r1+98|0;r6=HEAP8[r5]&1;r7=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+28>>2]](r2);HEAP8[r5]=r7&1;if((r6&255|0)==(r7&1|0)){return}r6=r1+96|0;r5=(r1+8|0)>>2;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAP32[r5+4]=0;HEAP32[r5+5]=0;r5=(HEAP8[r6]&1)!=0;if(r7){r7=r1+32|0;do{if(r5){r2=HEAP32[r7>>2];if((r2|0)==0){break}__ZdaPv(r2)}}while(0);r2=r1+97|0;HEAP8[r6]=HEAP8[r2]&1;r4=r1+60|0;HEAP32[r3+13]=HEAP32[r4>>2];r8=r1+56|0;HEAP32[r7>>2]=HEAP32[r8>>2];HEAP32[r4>>2]=0;HEAP32[r8>>2]=0;HEAP8[r2]=0;return}do{if(!r5){r2=r1+32|0;r8=HEAP32[r2>>2];if((r8|0)==(r1+44|0)){break}r4=HEAP32[r3+13];HEAP32[r3+15]=r4;HEAP32[r3+14]=r8;HEAP8[r1+97|0]=0;r8=__Znaj(r4);HEAP32[r2>>2]=r8;HEAP8[r6]=1;return}}while(0);r6=HEAP32[r3+13];HEAP32[r3+15]=r6;r5=__Znaj(r6);HEAP32[r3+14]=r5;HEAP8[r1+97|0]=1;return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE6setbufEPci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=r1>>2;r5=r1|0;r6=r1+96|0;r7=(r1+8|0)>>2;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r7+5]=0;do{if((HEAP8[r6]&1)!=0){r7=HEAP32[r4+8];if((r7|0)==0){break}__ZdaPv(r7)}}while(0);r7=r1+97|0;do{if((HEAP8[r7]&1)!=0){r8=HEAP32[r4+14];if((r8|0)==0){break}__ZdaPv(r8)}}while(0);r8=r1+52|0;HEAP32[r8>>2]=r3;do{if(r3>>>0>8){r9=HEAP8[r1+98|0];if((r9&1)==0|(r2|0)==0){r10=__Znaj(r3);HEAP32[r4+8]=r10;HEAP8[r6]=1;r11=r9;break}else{HEAP32[r4+8]=r2;HEAP8[r6]=0;r11=r9;break}}else{HEAP32[r4+8]=r1+44;HEAP32[r8>>2]=8;HEAP8[r6]=0;r11=HEAP8[r1+98|0]}}while(0);if((r11&1)!=0){HEAP32[r4+15]=0;HEAP32[r4+14]=0;HEAP8[r7]=0;return r5}r11=(r3|0)<8?8:r3;HEAP32[r4+15]=r11;if((r2|0)!=0&r11>>>0>7){HEAP32[r4+14]=r2;HEAP8[r7]=0;return r5}else{r2=__Znaj(r11);HEAP32[r4+14]=r2;HEAP8[r7]=1;return r5}}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){var r5,r6,r7,r8;r4=STACKTOP;r5=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r5];HEAP32[r3+4>>2]=HEAP32[r5+1];HEAP32[r3+8>>2]=HEAP32[r5+2];HEAP32[r3+12>>2]=HEAP32[r5+3];r5=r2+64|0;do{if((HEAP32[r5>>2]|0)!=0){if((FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2)|0)!=0){break}if((_fseek(HEAP32[r5>>2],HEAP32[r3+8>>2],0)|0)==0){r6=r3;r7=HEAP32[r6+4>>2];r8=r2+72|0;HEAP32[r8>>2]=HEAP32[r6>>2];HEAP32[r8+4>>2]=r7;r7=r1>>2;r8=r3>>2;HEAP32[r7]=HEAP32[r8];HEAP32[r7+1]=HEAP32[r8+1];HEAP32[r7+2]=HEAP32[r8+2];HEAP32[r7+3]=HEAP32[r8+3];STACKTOP=r4;return}else{r8=r1;HEAP32[r8>>2]=0;HEAP32[r8+4>>2]=0;r8=r1+8|0;HEAP32[r8>>2]=-1;HEAP32[r8+4>>2]=-1;STACKTOP=r4;return}}}while(0);r3=r1;HEAP32[r3>>2]=0;HEAP32[r3+4>>2]=0;r3=r1+8|0;HEAP32[r3>>2]=-1;HEAP32[r3+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initINS_19istreambuf_iteratorIcS2_EEEENS_9enable_ifIXaasr19__is_input_iteratorIT_EE5valuentsr21__is_forward_iteratorISA_EE5valueEvE4typeESA_SA_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=0;r5=STACKTOP;r6=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r6>>2];r6=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r6>>2];r6=r1>>2;HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;r6=r2|0;r2=r3|0;r3=HEAP32[r6>>2],r7=r3>>2;L194:while(1){do{if((r3|0)==0){r8=0}else{if((HEAP32[r7+3]|0)!=(HEAP32[r7+4]|0)){r8=r3;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r7]+36>>2]](r3)|0)!=-1){r8=r3;break}HEAP32[r6>>2]=0;r8=0}}while(0);r9=(r8|0)==0;r10=HEAP32[r2>>2],r11=r10>>2;do{if((r10|0)==0){r4=246}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){if(r9){break}else{r4=264;break L194}}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r10)|0)==-1){HEAP32[r2>>2]=0;r4=246;break}else{if(r9^(r10|0)==0){break}else{r4=266;break L194}}}}while(0);if(r4==246){r4=0;if(r9){r4=265;break}}r10=(r8+12|0)>>2;r11=HEAP32[r10];r12=r8+16|0;if((r11|0)==(HEAP32[r12>>2]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+36>>2]](r8)&255}else{r13=HEAP8[r11]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r1,r13);r11=HEAP32[r10];if((r11|0)==(HEAP32[r12>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+40>>2]](r8);r3=r8,r7=r3>>2;continue}else{HEAP32[r10]=r11+1;r3=r8,r7=r3>>2;continue}}if(r4==266){STACKTOP=r5;return}else if(r4==264){STACKTOP=r5;return}else if(r4==265){STACKTOP=r5;return}}function __ZNSt3__114basic_ifstreamIcNS_11char_traitsIcEEED0Ev(r1){HEAP32[r1>>2]=5188;HEAP32[r1+108>>2]=5208;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1+8|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6116);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r1+108|0);__ZdlPv(r1);return}function __ZTv0_n12_NSt3__114basic_ifstreamIcNS_11char_traitsIcEEED1Ev(r1){var r2,r3,r4;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];r1=r2+r3|0;HEAP32[r1>>2]=5188;r4=r3+(r2+108)|0;HEAP32[r4>>2]=5208;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r3+(r2+8)|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6116);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r4);return}function __ZTv0_n12_NSt3__114basic_ifstreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3,r4;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];r1=r2+r3|0;HEAP32[r1>>2]=5188;r4=r3+(r2+108)|0;HEAP32[r4>>2]=5208;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r3+(r2+8)|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6116);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r4);__ZdlPv(r1);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1){var r2,r3;HEAP32[r1>>2]=5424;r2=r1+64|0;r3=HEAP32[r2>>2];do{if((r3|0)!=0){__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE4syncEv(r1);if((_fclose(r3)|0)!=0){break}HEAP32[r2>>2]=0}}while(0);do{if((HEAP8[r1+96|0]&1)!=0){r2=HEAP32[r1+32>>2];if((r2|0)==0){break}__ZdaPv(r2)}}while(0);do{if((HEAP8[r1+97|0]&1)!=0){r2=HEAP32[r1+56>>2];if((r2|0)==0){break}__ZdaPv(r2)}}while(0);__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12;r6=HEAP32[r2+68>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9240,382)}r7=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+24>>2]](r6);r6=(r2+64|0)>>2;do{if((HEAP32[r6]|0)!=0){r8=(r7|0)>0;if(!(r8|(r3|0)==0&(r4|0)==0)){break}if((FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2)|0)!=0){break}if(r5>>>0>=3){r9=r1;HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;r9=r1+8|0;HEAP32[r9>>2]=-1;HEAP32[r9+4>>2]=-1;return}r9=HEAP32[r6];if(r8){r10=___muldi3(r7,(r7|0)<0?-1:0,r3,r4)}else{r10=0}if((_fseek(r9,r10,r5)|0)==0){r9=_ftell(HEAP32[r6]);r8=r2+72|0;r11=HEAP32[r8+4>>2];r12=r1;HEAP32[r12>>2]=HEAP32[r8>>2];HEAP32[r12+4>>2]=r11;r11=r1+8|0;HEAP32[r11>>2]=r9;HEAP32[r11+4>>2]=(r9|0)<0?-1:0;return}else{r9=r1;HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;r9=r1+8|0;HEAP32[r9>>2]=-1;HEAP32[r9+4>>2]=-1;return}}}while(0);r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE9pbackfailEi(r1,r2){var r3,r4,r5,r6;if((HEAP32[r1+64>>2]|0)==0){r3=-1;return r3}r4=(r1+12|0)>>2;r5=HEAP32[r4];if(HEAP32[r1+8>>2]>>>0>=r5>>>0){r3=-1;return r3}if((r2|0)==-1){HEAP32[r4]=r5-1;r3=0;return r3}r6=r5-1|0;do{if((HEAP32[r1+88>>2]&16|0)==0){if((r2<<24>>24|0)==(HEAP8[r6]|0)){break}else{r3=-1}return r3}}while(0);HEAP32[r4]=r6;HEAP8[r6]=r2&255;r3=r2;return r3}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r6;r6=(r1+64|0)>>2;if((HEAP32[r6]|0)==0){r9=0;STACKTOP=r4;return r9}r10=(r1+68|0)>>2;r11=HEAP32[r10];if((r11|0)==0){r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9240,382)}r12=r1+92|0;r13=HEAP32[r12>>2];do{if((r13&16|0)==0){if((r13&8|0)==0){break}r14=r1+80|0;r15=HEAP32[r14+4>>2];HEAP32[r7]=HEAP32[r14>>2];HEAP32[r7+1]=r15;do{if((HEAP8[r1+98|0]&1)==0){r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+24>>2]](r11);r14=r1+36|0;r16=HEAP32[r14>>2];r17=HEAP32[r2+10]-r16|0;if((r15|0)>0){r18=Math.imul(HEAP32[r2+4]-HEAP32[r2+3]|0,r15)+r17|0;r19=0;break}r15=HEAP32[r2+3];if((r15|0)==(HEAP32[r2+4]|0)){r18=r17;r19=0;break}r20=HEAP32[r10];r21=r1+32|0;r18=r17-FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+32>>2]](r20,r8,HEAP32[r21>>2],r16,r15-HEAP32[r2+2]|0)+HEAP32[r14>>2]-HEAP32[r21>>2]|0;r19=1}else{r18=HEAP32[r2+4]-HEAP32[r2+3]|0;r19=0}}while(0);if((_fseek(HEAP32[r6],-r18|0,1)|0)!=0){r9=-1;STACKTOP=r4;return r9}if(r19){r21=r1+72|0;r14=HEAP32[r7+1];HEAP32[r21>>2]=HEAP32[r7];HEAP32[r21+4>>2]=r14}r14=HEAP32[r2+8];HEAP32[r2+10]=r14;HEAP32[r2+9]=r14;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r12>>2]=0}else{do{if((HEAP32[r2+6]|0)!=(HEAP32[r2+5]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r2]+52>>2]](r1,-1)|0)==-1){r9=-1}else{break}STACKTOP=r4;return r9}}while(0);r14=r1+72|0;r21=r1+32|0;r15=r1+52|0;while(1){r16=HEAP32[r10];r20=HEAP32[r21>>2];r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r16,r14,r20,r20+HEAP32[r15>>2]|0,r5);r20=HEAP32[r21>>2];r16=HEAP32[r5>>2]-r20|0;if((_fwrite(r20,1,r16,HEAP32[r6])|0)!=(r16|0)){r9=-1;r3=368;break}if((r17|0)==2){r9=-1;r3=369;break}else if((r17|0)!=1){r3=353;break}}if(r3==353){if((_fflush(HEAP32[r6])|0)==0){break}else{r9=-1}STACKTOP=r4;return r9}else if(r3==368){STACKTOP=r4;return r9}else if(r3==369){STACKTOP=r4;return r9}}}while(0);r9=0;STACKTOP=r4;return r9}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE9underflowEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=(r1+64|0)>>2;if((HEAP32[r6]|0)==0){r7=-1;STACKTOP=r3;return r7}r8=r1+92|0;if((HEAP32[r8>>2]&8|0)==0){HEAP32[r2+6]=0;HEAP32[r2+5]=0;HEAP32[r2+7]=0;if((HEAP8[r1+98|0]&1)==0){r9=HEAP32[r2+14];r10=r9+HEAP32[r2+15]|0;HEAP32[r2+2]=r9;HEAP32[r2+3]=r10;HEAP32[r2+4]=r10;r11=r10}else{r10=HEAP32[r2+8];r9=r10+HEAP32[r2+13]|0;HEAP32[r2+2]=r10;HEAP32[r2+3]=r9;HEAP32[r2+4]=r9;r11=r9}HEAP32[r8>>2]=8;r12=1;r13=r11;r14=r1+12|0,r15=r14>>2}else{r11=r1+12|0;r12=0;r13=HEAP32[r11>>2];r14=r11,r15=r14>>2}if((r13|0)==0){r14=r4+1|0;HEAP32[r2+2]=r4;HEAP32[r15]=r14;HEAP32[r2+4]=r14;r16=r14}else{r16=r13}r13=HEAP32[r2+4];if(r12){r17=0}else{r12=(r13-HEAP32[r2+2]|0)/2&-1;r17=r12>>>0>4?4:r12}r12=(r1+16|0)>>2;do{if((r16|0)==(r13|0)){r14=r1+8|0,r11=r14>>2;_memmove(HEAP32[r11],r16+ -r17|0,r17,1,0);if((HEAP8[r1+98|0]&1)!=0){r8=HEAP32[r11];r9=_fread(r8+r17|0,1,HEAP32[r12]-r17-r8|0,HEAP32[r6]);if((r9|0)==0){r18=-1;r19=r14;break}r8=HEAP32[r11];r10=r8+r17|0;HEAP32[r15]=r10;HEAP32[r12]=r8+r9+r17;r18=HEAPU8[r10];r19=r14;break}r10=(r1+32|0)>>2;r9=r1+36|0,r8=r9>>2;r20=HEAP32[r8];r21=(r1+40|0)>>2;_memmove(HEAP32[r10],r20,HEAP32[r21]-r20|0,1,0);r20=HEAP32[r10];r22=r20+(HEAP32[r21]-HEAP32[r8])|0;HEAP32[r8]=r22;if((r20|0)==(r1+44|0)){r23=8}else{r23=HEAP32[r2+13]}r24=r20+r23|0;HEAP32[r21]=r24;r20=r1+60|0;r25=HEAP32[r20>>2]-r17|0;r26=r24-r22|0;r24=r1+72|0;r27=r24;r28=r1+80|0;r29=HEAP32[r27+4>>2];HEAP32[r28>>2]=HEAP32[r27>>2];HEAP32[r28+4>>2]=r29;r29=_fread(r22,1,r26>>>0<r25>>>0?r26:r25,HEAP32[r6]);if((r29|0)==0){r18=-1;r19=r14;break}r25=HEAP32[r2+17];if((r25|0)==0){r26=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r26);___cxa_throw(r26,9240,382)}r26=HEAP32[r8]+r29|0;HEAP32[r21]=r26;r29=HEAP32[r11];if((FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+16>>2]](r25,r24,HEAP32[r10],r26,r9,r29+r17|0,r29+HEAP32[r20>>2]|0,r5)|0)==3){r20=HEAP32[r10];r10=HEAP32[r21];HEAP32[r11]=r20;HEAP32[r15]=r20;HEAP32[r12]=r10;r18=HEAPU8[r20];r19=r14;break}r20=HEAP32[r5>>2];r10=HEAP32[r11];r21=r10+r17|0;if((r20|0)==(r21|0)){r18=-1;r19=r14;break}HEAP32[r11]=r10;HEAP32[r15]=r21;HEAP32[r12]=r20;r18=HEAPU8[r21];r19=r14}else{r18=HEAPU8[r16];r19=r1+8|0}}while(0);if((HEAP32[r19>>2]|0)!=(r4|0)){r7=r18;STACKTOP=r3;return r7}HEAP32[r19>>2]=0;HEAP32[r15]=0;HEAP32[r12]=0;r7=r18;STACKTOP=r3;return r7}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+24|0;r6=r5;r7=r5+8;r8=r5+16;r9=(r1+64|0)>>2;if((HEAP32[r9]|0)==0){r10=-1;STACKTOP=r5;return r10}r11=r1+92|0;if((HEAP32[r11>>2]&16|0)==0){HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+4]=0;r12=HEAP32[r3+13];do{if(r12>>>0>8){if((HEAP8[r1+98|0]&1)==0){r13=HEAP32[r3+14];r14=r13+(HEAP32[r3+15]-1)|0;HEAP32[r3+6]=r13;HEAP32[r3+5]=r13;HEAP32[r3+7]=r14;r15=r13;r16=r14;break}else{r14=HEAP32[r3+8];r13=r14+(r12-1)|0;HEAP32[r3+6]=r14;HEAP32[r3+5]=r14;HEAP32[r3+7]=r13;r15=r14;r16=r13;break}}else{HEAP32[r3+6]=0;HEAP32[r3+5]=0;HEAP32[r3+7]=0;r15=0;r16=0}}while(0);HEAP32[r11>>2]=16;r17=r15;r18=r16;r19=r1+20|0,r20=r19>>2;r21=r1+28|0,r22=r21>>2}else{r16=r1+20|0;r15=r1+28|0;r17=HEAP32[r16>>2];r18=HEAP32[r15>>2];r19=r16,r20=r19>>2;r21=r15,r22=r21>>2}r21=(r2|0)==-1;r15=(r1+24|0)>>2;r19=HEAP32[r15];if(r21){r23=r17;r24=r19}else{if((r19|0)==0){HEAP32[r15]=r6;HEAP32[r20]=r6;HEAP32[r22]=r6+1;r25=r6}else{r25=r19}HEAP8[r25]=r2&255;r25=HEAP32[r15]+1|0;HEAP32[r15]=r25;r23=HEAP32[r20];r24=r25}r25=(r1+24|0)>>2;if((r24|0)!=(r23|0)){L393:do{if((HEAP8[r1+98|0]&1)==0){r15=(r1+32|0)>>2;r19=HEAP32[r15];HEAP32[r7>>2]=r19;r6=r1+68|0;r16=HEAP32[r6>>2];if((r16|0)==0){r26=___cxa_allocate_exception(4);r27=r26;__ZNSt8bad_castC2Ev(r27);___cxa_throw(r26,9240,382)}r11=r1+72|0;r3=r1+52|0;r12=r16;r16=r23;r13=r24;r14=r19;while(1){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+12>>2]](r12,r11,r16,r13,r8,r14,r14+HEAP32[r3>>2]|0,r7);r28=HEAP32[r20];if((HEAP32[r8>>2]|0)==(r28|0)){r10=-1;r4=435;break}if((r19|0)==3){r4=426;break}if(r19>>>0>=2){r10=-1;r4=439;break}r29=HEAP32[r15];r30=HEAP32[r7>>2]-r29|0;if((_fwrite(r29,1,r30,HEAP32[r9])|0)!=(r30|0)){r10=-1;r4=440;break}if((r19|0)!=1){break L393}r19=HEAP32[r8>>2];r30=HEAP32[r25];HEAP32[r20]=r19;HEAP32[r22]=r30;r29=r19+(r30-r19)|0;HEAP32[r25]=r29;r30=HEAP32[r6>>2];if((r30|0)==0){r4=443;break}r12=r30;r16=r19;r13=r29;r14=HEAP32[r15]}if(r4==426){r15=HEAP32[r25]-r28|0;if((_fwrite(r28,1,r15,HEAP32[r9])|0)==(r15|0)){break}else{r10=-1}STACKTOP=r5;return r10}else if(r4==435){STACKTOP=r5;return r10}else if(r4==439){STACKTOP=r5;return r10}else if(r4==440){STACKTOP=r5;return r10}else if(r4==443){r26=___cxa_allocate_exception(4);r27=r26;__ZNSt8bad_castC2Ev(r27);___cxa_throw(r26,9240,382)}}else{r15=r24-r23|0;if((_fwrite(r23,1,r15,HEAP32[r9])|0)==(r15|0)){break}else{r10=-1}STACKTOP=r5;return r10}}while(0);HEAP32[r25]=r17;HEAP32[r20]=r17;HEAP32[r22]=r18}r10=r21?0:r2;STACKTOP=r5;return r10}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEEC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(r1|0);HEAP32[r2]=5424;HEAP32[r2+8]=0;HEAP32[r2+9]=0;HEAP32[r2+10]=0;r6=r1+68|0;r7=r1+4|0;_memset(r1+52|0,0,47);__ZNSt3__16localeC2ERKS0_(r4,r7);r8=__ZNKSt3__16locale9has_facetERNS0_2idE(r4,14160);__ZNSt3__16localeD2Ev(r4);if(r8){__ZNSt3__16localeC2ERKS0_(r5,r7);r7=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14160);HEAP32[r6>>2]=r7;__ZNSt3__16localeD2Ev(r5);r5=HEAP32[r6>>2];r6=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5)&1;HEAP8[r1+98|0]=r6}FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r1,0,4096);STACKTOP=r3;return}function __ZNSt3__18ios_base4InitC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r1=STACKTOP;STACKTOP=STACKTOP+32|0;r2=r1;r3=r1+8;r4=r1+16;r5=r1+24;__ZNSt3__110__stdinbufIcEC2EP7__sFILEP10_mbstate_t(13904,HEAP32[_stdin>>2],13960);HEAP32[3706]=5380;HEAP32[3708]=5400;HEAP32[3707]=0;r6=HEAP32[1342];__ZNSt3__18ios_base4initEPv(r6+14824|0,13904);HEAP32[r6+14896>>2]=0;HEAP32[r6+14900>>2]=-1;r6=HEAP32[_stdout>>2];__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(13808);HEAP32[3452]=5600;HEAP32[3460]=r6;__ZNSt3__16localeC2ERKS0_(r5,13812);r6=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14160);r7=r6;__ZNSt3__16localeD2Ev(r5);HEAP32[3461]=r7;HEAP32[3462]=13968;r5=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r7)&1;HEAP8[13852]=r5;HEAP32[3640]=5284;HEAP32[3641]=5304;r5=HEAP32[1318];__ZNSt3__18ios_base4initEPv(r5+14560|0,13808);r7=(r5+72|0)>>2;HEAP32[r7+3640]=0;r6=(r5+76|0)>>2;HEAP32[r6+3640]=-1;r8=HEAP32[_stderr>>2];__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(13856);HEAP32[3464]=5600;HEAP32[3472]=r8;__ZNSt3__16localeC2ERKS0_(r4,13860);r8=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14160);r9=r8;__ZNSt3__16localeD2Ev(r4);HEAP32[3473]=r9;HEAP32[3474]=13976;r4=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r9)&1;HEAP8[13900]=r4;HEAP32[3684]=5284;HEAP32[3685]=5304;__ZNSt3__18ios_base4initEPv(r5+14736|0,13856);HEAP32[r7+3684]=0;HEAP32[r6+3684]=-1;r4=HEAP32[HEAP32[HEAP32[3684]-12>>2]+14760>>2];HEAP32[3662]=5284;HEAP32[3663]=5304;__ZNSt3__18ios_base4initEPv(r5+14648|0,r4);HEAP32[r7+3662]=0;HEAP32[r6+3662]=-1;HEAP32[HEAP32[HEAP32[3706]-12>>2]+14896>>2]=14560;r6=HEAP32[HEAP32[3684]-12>>2]+14740|0;HEAP32[r6>>2]=HEAP32[r6>>2]|8192;HEAP32[HEAP32[HEAP32[3684]-12>>2]+14808>>2]=14560;__ZNSt3__110__stdinbufIwEC2EP7__sFILEP10_mbstate_t(13752,HEAP32[_stdin>>2],13984);HEAP32[3618]=5332;HEAP32[3620]=5352;HEAP32[3619]=0;r6=HEAP32[1330];__ZNSt3__18ios_base4initEPv(r6+14472|0,13752);HEAP32[r6+14544>>2]=0;HEAP32[r6+14548>>2]=-1;r6=HEAP32[_stdout>>2];__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(13656);HEAP32[3414]=5528;HEAP32[3422]=r6;__ZNSt3__16localeC2ERKS0_(r3,13660);r6=__ZNKSt3__16locale9use_facetERNS0_2idE(r3,14152);r7=r6;__ZNSt3__16localeD2Ev(r3);HEAP32[3423]=r7;HEAP32[3424]=13992;r3=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r7)&1;HEAP8[13700]=r3;HEAP32[3548]=5236;HEAP32[3549]=5256;r3=HEAP32[1306];__ZNSt3__18ios_base4initEPv(r3+14192|0,13656);r7=(r3+72|0)>>2;HEAP32[r7+3548]=0;r6=(r3+76|0)>>2;HEAP32[r6+3548]=-1;r4=HEAP32[_stderr>>2];__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(13704);HEAP32[3426]=5528;HEAP32[3434]=r4;__ZNSt3__16localeC2ERKS0_(r2,13708);r4=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14152);r5=r4;__ZNSt3__16localeD2Ev(r2);HEAP32[3435]=r5;HEAP32[3436]=14e3;r2=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+28>>2]](r5)&1;HEAP8[13748]=r2;HEAP32[3592]=5236;HEAP32[3593]=5256;__ZNSt3__18ios_base4initEPv(r3+14368|0,13704);HEAP32[r7+3592]=0;HEAP32[r6+3592]=-1;r2=HEAP32[HEAP32[HEAP32[3592]-12>>2]+14392>>2];HEAP32[3570]=5236;HEAP32[3571]=5256;__ZNSt3__18ios_base4initEPv(r3+14280|0,r2);HEAP32[r7+3570]=0;HEAP32[r6+3570]=-1;HEAP32[HEAP32[HEAP32[3618]-12>>2]+14544>>2]=14192;r6=HEAP32[HEAP32[3592]-12>>2]+14372|0;HEAP32[r6>>2]=HEAP32[r6>>2]|8192;HEAP32[HEAP32[HEAP32[3592]-12>>2]+14440>>2]=14192;STACKTOP=r1;return}function __ZNSt3__111__stdoutbufIwED1Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);return}function __ZNSt3__111__stdoutbufIwED0Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__111__stdoutbufIwE5imbueERKNS_6localeE(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14152);r2=r3;HEAP32[r1+36>>2]=r2;r4=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](r2)&1;HEAP8[r1+44|0]=r4;return}function __ZNSt3__111__stdoutbufIwE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=r1+36|0;r7=r1+40|0;r8=r4|0;r9=r4+8|0;r10=r4;r4=r1+32|0;while(1){r1=HEAP32[r6>>2];r11=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,HEAP32[r7>>2],r8,r9,r5);r1=HEAP32[r5>>2]-r10|0;if((_fwrite(r8,1,r1,HEAP32[r4>>2])|0)!=(r1|0)){r12=-1;r2=493;break}if((r11|0)==2){r12=-1;r2=492;break}else if((r11|0)!=1){r2=489;break}}if(r2==489){r12=((_fflush(HEAP32[r4>>2])|0)!=0)<<31>>31;STACKTOP=r3;return r12}else if(r2==493){STACKTOP=r3;return r12}else if(r2==492){STACKTOP=r3;return r12}}function __ZNSt3__111__stdoutbufIwE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=(r2|0)==-1;if(!r9){r10=r6+4|0;r11=(r1+24|0)>>2;r12=(r1+20|0)>>2;HEAP32[r12]=r6;r13=(r1+28|0)>>2;HEAP32[r13]=r10;HEAP32[r6>>2]=r2;HEAP32[r11]=r10;L455:do{if((HEAP8[r1+44|0]&1)==0){r14=r5|0;HEAP32[r7>>2]=r14;r15=r1+36|0;r16=r1+40|0;r17=r5+8|0;r18=r5;r19=r1+32|0;r20=r6;r21=r10;while(1){r22=HEAP32[r15>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+12>>2]](r22,HEAP32[r16>>2],r20,r21,r8,r14,r17,r7);r24=HEAP32[r12];if((HEAP32[r8>>2]|0)==(r24|0)){r25=-1;r3=513;break}if((r23|0)==3){r3=500;break}if(r23>>>0>=2){r25=-1;r3=509;break}r22=HEAP32[r7>>2]-r18|0;if((_fwrite(r14,1,r22,HEAP32[r19>>2])|0)!=(r22|0)){r25=-1;r3=508;break}if((r23|0)!=1){break L455}r23=HEAP32[r8>>2];r22=HEAP32[r11];HEAP32[r12]=r23;HEAP32[r13]=r22;r26=(r22-r23>>2<<2)+r23|0;HEAP32[r11]=r26;r20=r23;r21=r26}if(r3==513){STACKTOP=r4;return r25}else if(r3==509){STACKTOP=r4;return r25}else if(r3==508){STACKTOP=r4;return r25}else if(r3==500){if((_fwrite(r24,1,1,HEAP32[r19>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}}else{if((_fwrite(r6,4,1,HEAP32[r1+32>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}}while(0);HEAP32[r11]=0;HEAP32[r12]=0;HEAP32[r13]=0}r25=r9?0:r2;STACKTOP=r4;return r25}function __ZNSt3__110__stdinbufIwEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(r1|0);HEAP32[r1>>2]=5928;HEAP32[r1+32>>2]=r2;HEAP32[r1+40>>2]=r3;__ZNSt3__16localeC2ERKS0_(r5,r1+4|0);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14152);r2=r3;r6=r1+36|0;HEAP32[r6>>2]=r2;r7=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r7;r7=HEAP32[r6>>2];r6=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r7)&1;HEAP8[r1+48|0]=r6;if((HEAP32[r2>>2]|0)<=8){__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}__ZNSt3__121__throw_runtime_errorEPKc(424);__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}function __ZNSt3__110__stdinbufIwED1Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);return}function __ZNSt3__110__stdinbufIwED0Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110__stdinbufIwE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5;r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14152);r2=r3;r4=r1+36|0;HEAP32[r4>>2]=r2;r5=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r5;r5=HEAP32[r4>>2];r4=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5)&1;HEAP8[r1+48|0]=r4;if((HEAP32[r2>>2]|0)<=8){return}__ZNSt3__121__throw_runtime_errorEPKc(424);return}function __ZNSt3__110__stdinbufIwE9underflowEv(r1){return __ZNSt3__110__stdinbufIwE9__getcharEb(r1,0)}function __ZNSt3__110__stdinbufIwE5uflowEv(r1){return __ZNSt3__110__stdinbufIwE9__getcharEb(r1,1)}function __ZNSt3__110__stdinbufIwE9pbackfailEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;if((r2|0)==-1){r9=-1;STACKTOP=r4;return r9}HEAP32[r8>>2]=r2;r10=HEAP32[r1+36>>2];r11=r5|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+12>>2]](r10,HEAP32[r1+40>>2],r8,r8+4|0,r4+24,r11,r5+8|0,r6);if((r12|0)==3){HEAP8[r11]=r2&255;HEAP32[r7]=r5+1}else if((r12|0)==2|(r12|0)==1){r9=-1;STACKTOP=r4;return r9}r12=r1+32|0;while(1){r1=HEAP32[r7];if(r1>>>0<=r11>>>0){r9=r2;r3=540;break}r5=r1-1|0;HEAP32[r7]=r5;if((_ungetc(HEAP8[r5]|0,HEAP32[r12>>2])|0)==-1){r9=-1;r3=538;break}}if(r3==540){STACKTOP=r4;return r9}else if(r3==538){STACKTOP=r4;return r9}}function __ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16;r8=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r9>>2];r9=r1;r10=(r2|0)>>2;r2=HEAP32[r10],r11=r2>>2;if((r2|0)==0){HEAP32[r8]=0;STACKTOP=r1;return}r12=r5;r5=r3;r13=r12-r5|0;r14=r6+12|0;r6=HEAP32[r14>>2];r15=(r6|0)>(r13|0)?r6-r13|0:0;r13=r4;r6=r13-r5|0;do{if((r6|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r3,r6)|0)==(r6|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);do{if((r15|0)>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r9,r15,r7);if((HEAP8[r9]&1)==0){r16=r9+1|0}else{r16=HEAP32[r9+8>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r16,r15)|0)==(r15|0)){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r9);break}HEAP32[r10]=0;HEAP32[r8]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r9);STACKTOP=r1;return}}while(0);r9=r12-r13|0;do{if((r9|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r4,r9)|0)==(r9|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);HEAP32[r14>>2]=0;HEAP32[r8]=r2;STACKTOP=r1;return}function __ZNSt3__18ios_base4InitD2Ev(r1){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14560);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14648);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(14192);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(14280);return}function __ZNSt3__114__shared_countD2Ev(r1){return}function __ZNSt3__114error_categoryD2Ev(r1){return}function __ZNSt3__114__shared_count12__add_sharedEv(r1){var r2;r2=r1+4|0;tempValue=HEAP32[r2>>2],HEAP32[r2>>2]=tempValue+1,tempValue;return}function __ZNKSt11logic_error4whatEv(r1){return HEAP32[r1+4>>2]}function __ZNKSt13runtime_error4whatEv(r1){return HEAP32[r1+4>>2]}function __ZNSt3__114error_categoryC2Ev(r1){HEAP32[r1>>2]=5136;return}function __ZNKSt3__114error_category23default_error_conditionEi(r1,r2,r3){HEAP32[r1>>2]=r3;HEAP32[r1+4>>2]=r2;return}function __ZNKSt3__114error_category10equivalentERKNS_10error_codeEi(r1,r2,r3){var r4;if((HEAP32[r2+4>>2]|0)!=(r1|0)){r4=0;return r4}r4=(HEAP32[r2>>2]|0)==(r3|0);return r4}function __ZNSt3__110__stdinbufIwE9__getcharEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;r9=r4+24;r10=HEAP32[r1+44>>2];r11=(r10|0)>1?r10:1;L550:do{if((r11|0)>0){r10=r1+32|0;r12=0;while(1){r13=_fgetc(HEAP32[r10>>2]);if((r13|0)==-1){r14=-1;break}HEAP8[r5+r12|0]=r13&255;r13=r12+1|0;if((r13|0)<(r11|0)){r12=r13}else{break L550}}STACKTOP=r4;return r14}}while(0);L557:do{if((HEAP8[r1+48|0]&1)==0){r12=r1+40|0;r10=r1+36|0;r13=r5|0;r15=r6+4|0;r16=r1+32|0;r17=r11;while(1){r18=HEAP32[r12>>2];r19=r18;r20=HEAP32[r19>>2];r21=HEAP32[r19+4>>2];r19=HEAP32[r10>>2];r22=r5+r17|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+16>>2]](r19,r18,r13,r22,r8,r6,r15,r9);if((r23|0)==3){r3=595;break}else if((r23|0)==2){r14=-1;r3=604;break}else if((r23|0)!=1){r24=r17;break L557}r23=HEAP32[r12>>2];HEAP32[r23>>2]=r20;HEAP32[r23+4>>2]=r21;if((r17|0)==8){r14=-1;r3=605;break}r21=_fgetc(HEAP32[r16>>2]);if((r21|0)==-1){r14=-1;r3=606;break}HEAP8[r22]=r21&255;r17=r17+1|0}if(r3==595){HEAP32[r7]=HEAP8[r13]|0;r24=r17;break}else if(r3==604){STACKTOP=r4;return r14}else if(r3==605){STACKTOP=r4;return r14}else if(r3==606){STACKTOP=r4;return r14}}else{HEAP32[r7]=HEAP8[r5|0]|0;r24=r11}}while(0);L571:do{if(!r2){r11=r1+32|0;r3=r24;while(1){if((r3|0)<=0){break L571}r9=r3-1|0;if((_ungetc(HEAP8[r5+r9|0]|0,HEAP32[r11>>2])|0)==-1){r14=-1;break}else{r3=r9}}STACKTOP=r4;return r14}}while(0);r14=HEAP32[r7];STACKTOP=r4;return r14}function __ZNSt3__111__stdoutbufIcED1Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);return}function __ZNSt3__111__stdoutbufIcED0Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__111__stdoutbufIcE5imbueERKNS_6localeE(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14160);r2=r3;HEAP32[r1+36>>2]=r2;r4=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](r2)&1;HEAP8[r1+44|0]=r4;return}function __ZNSt3__111__stdoutbufIcE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=r1+36|0;r7=r1+40|0;r8=r4|0;r9=r4+8|0;r10=r4;r4=r1+32|0;while(1){r1=HEAP32[r6>>2];r11=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,HEAP32[r7>>2],r8,r9,r5);r1=HEAP32[r5>>2]-r10|0;if((_fwrite(r8,1,r1,HEAP32[r4>>2])|0)!=(r1|0)){r12=-1;r2=619;break}if((r11|0)==2){r12=-1;r2=617;break}else if((r11|0)!=1){r2=615;break}}if(r2==615){r12=((_fflush(HEAP32[r4>>2])|0)!=0)<<31>>31;STACKTOP=r3;return r12}else if(r2==619){STACKTOP=r3;return r12}else if(r2==617){STACKTOP=r3;return r12}}function __ZNSt3__111__stdoutbufIcE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=(r2|0)==-1;if(!r9){r10=r6+1|0;r11=(r1+24|0)>>2;r12=(r1+20|0)>>2;HEAP32[r12]=r6;r13=(r1+28|0)>>2;HEAP32[r13]=r10;HEAP8[r6]=r2&255;HEAP32[r11]=r10;L594:do{if((HEAP8[r1+44|0]&1)==0){r14=r5|0;HEAP32[r7>>2]=r14;r15=r1+36|0;r16=r1+40|0;r17=r5+8|0;r18=r5;r19=r1+32|0;r20=r6;r21=r10;while(1){r22=HEAP32[r15>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+12>>2]](r22,HEAP32[r16>>2],r20,r21,r8,r14,r17,r7);r24=HEAP32[r12];if((HEAP32[r8>>2]|0)==(r24|0)){r25=-1;r3=636;break}if((r23|0)==3){r3=626;break}if(r23>>>0>=2){r25=-1;r3=637;break}r22=HEAP32[r7>>2]-r18|0;if((_fwrite(r14,1,r22,HEAP32[r19>>2])|0)!=(r22|0)){r25=-1;r3=634;break}if((r23|0)!=1){break L594}r23=HEAP32[r8>>2];r22=HEAP32[r11];HEAP32[r12]=r23;HEAP32[r13]=r22;r26=r23+(r22-r23)|0;HEAP32[r11]=r26;r20=r23;r21=r26}if(r3==634){STACKTOP=r4;return r25}else if(r3==636){STACKTOP=r4;return r25}else if(r3==637){STACKTOP=r4;return r25}else if(r3==626){if((_fwrite(r24,1,1,HEAP32[r19>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}}else{if((_fwrite(r6,1,1,HEAP32[r1+32>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}}while(0);HEAP32[r11]=0;HEAP32[r12]=0;HEAP32[r13]=0}r25=r9?0:r2;STACKTOP=r4;return r25}function __ZNSt3__110__stdinbufIcEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(r1|0);HEAP32[r1>>2]=6e3;HEAP32[r1+32>>2]=r2;HEAP32[r1+40>>2]=r3;__ZNSt3__16localeC2ERKS0_(r5,r1+4|0);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14160);r2=r3;r6=r1+36|0;HEAP32[r6>>2]=r2;r7=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r7;r7=HEAP32[r6>>2];r6=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r7)&1;HEAP8[r1+48|0]=r6;if((HEAP32[r2>>2]|0)<=8){__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}__ZNSt3__121__throw_runtime_errorEPKc(424);__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}function __ZNSt3__110__stdinbufIcED1Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);return}function __ZNSt3__110__stdinbufIcED0Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110__stdinbufIcE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5;r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14160);r2=r3;r4=r1+36|0;HEAP32[r4>>2]=r2;r5=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r5;r5=HEAP32[r4>>2];r4=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5)&1;HEAP8[r1+48|0]=r4;if((HEAP32[r2>>2]|0)<=8){return}__ZNSt3__121__throw_runtime_errorEPKc(424);return}function __ZNSt3__110__stdinbufIcE9underflowEv(r1){return __ZNSt3__110__stdinbufIcE9__getcharEb(r1,0)}function __ZNSt3__110__stdinbufIcE5uflowEv(r1){return __ZNSt3__110__stdinbufIcE9__getcharEb(r1,1)}function __ZNSt3__110__stdinbufIcE9pbackfailEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;if((r2|0)==-1){r9=-1;STACKTOP=r4;return r9}r10=r2&255;HEAP8[r8]=r10;r11=HEAP32[r1+36>>2];r12=r5|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+12>>2]](r11,HEAP32[r1+40>>2],r8,r8+1|0,r4+24,r12,r5+8|0,r6);if((r13|0)==3){HEAP8[r12]=r10;HEAP32[r7]=r5+1}else if((r13|0)==2|(r13|0)==1){r9=-1;STACKTOP=r4;return r9}r13=r1+32|0;while(1){r1=HEAP32[r7];if(r1>>>0<=r12>>>0){r9=r2;r3=666;break}r5=r1-1|0;HEAP32[r7]=r5;if((_ungetc(HEAP8[r5]|0,HEAP32[r13>>2])|0)==-1){r9=-1;r3=665;break}}if(r3==665){STACKTOP=r4;return r9}else if(r3==666){STACKTOP=r4;return r9}}function __ZNSt3__110__stdinbufIcE9__getcharEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=HEAP32[r1+44>>2];r10=(r9|0)>1?r9:1;L644:do{if((r10|0)>0){r9=r1+32|0;r11=0;while(1){r12=_fgetc(HEAP32[r9>>2]);if((r12|0)==-1){r13=-1;break}HEAP8[r5+r11|0]=r12&255;r12=r11+1|0;if((r12|0)<(r10|0)){r11=r12}else{break L644}}STACKTOP=r4;return r13}}while(0);L651:do{if((HEAP8[r1+48|0]&1)==0){r11=r1+40|0;r9=r1+36|0;r12=r5|0;r14=r6+1|0;r15=r1+32|0;r16=r10;while(1){r17=HEAP32[r11>>2];r18=r17;r19=HEAP32[r18>>2];r20=HEAP32[r18+4>>2];r18=HEAP32[r9>>2];r21=r5+r16|0;r22=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+16>>2]](r18,r17,r12,r21,r7,r6,r14,r8);if((r22|0)==2){r13=-1;r3=689;break}else if((r22|0)==3){r3=677;break}else if((r22|0)!=1){r23=r16;break L651}r22=HEAP32[r11>>2];HEAP32[r22>>2]=r19;HEAP32[r22+4>>2]=r20;if((r16|0)==8){r13=-1;r3=690;break}r20=_fgetc(HEAP32[r15>>2]);if((r20|0)==-1){r13=-1;r3=687;break}HEAP8[r21]=r20&255;r16=r16+1|0}if(r3==690){STACKTOP=r4;return r13}else if(r3==687){STACKTOP=r4;return r13}else if(r3==689){STACKTOP=r4;return r13}else if(r3==677){HEAP8[r6]=HEAP8[r12];r23=r16;break}}else{HEAP8[r6]=HEAP8[r5|0];r23=r10}}while(0);L665:do{if(!r2){r10=r1+32|0;r3=r23;while(1){if((r3|0)<=0){break L665}r8=r3-1|0;if((_ungetc(HEAPU8[r5+r8|0],HEAP32[r10>>2])|0)==-1){r13=-1;break}else{r3=r8}}STACKTOP=r4;return r13}}while(0);r13=HEAPU8[r6];STACKTOP=r4;return r13}function __GLOBAL__I_a(){__ZNSt3__18ios_base4InitC2Ev(0);_atexit(394,14912,___dso_handle);return}function __ZNSt3__114__shared_count16__release_sharedEv(r1){var r2,r3;r2=r1+4|0;if(((tempValue=HEAP32[r2>>2],HEAP32[r2>>2]=tempValue+ -1,tempValue)|0)!=0){r3=0;return r3}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1);r3=1;return r3}function __ZNSt11logic_errorC2EPKc(r1,r2){var r3,r4,r5;HEAP32[r1>>2]=3368;r3=r1+4|0;if((r3|0)==0){return}r1=_strlen(r2);r4=__Znaj(r1+13|0),r5=r4>>2;HEAP32[r5+1]=r1;HEAP32[r5]=r1;r1=r4+12|0;HEAP32[r3>>2]=r1;HEAP32[r5+2]=0;_strcpy(r1,r2);return}function __ZNSt11logic_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=3368;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt11logic_errorD2Ev(r1){var r2;HEAP32[r1>>2]=3368;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt13runtime_errorC2ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE(r1,r2){var r3,r4,r5;HEAP32[r1>>2]=3304;r3=r1+4|0;if((r3|0)==0){return}if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=_strlen(r4);r1=__Znaj(r2+13|0),r5=r1>>2;HEAP32[r5+1]=r2;HEAP32[r5]=r2;r2=r1+12|0;HEAP32[r3>>2]=r2;HEAP32[r5+2]=0;_strcpy(r2,r4);return}function __ZNSt13runtime_errorC2EPKc(r1,r2){var r3,r4,r5;HEAP32[r1>>2]=3304;r3=r1+4|0;if((r3|0)==0){return}r1=_strlen(r2);r4=__Znaj(r1+13|0),r5=r4>>2;HEAP32[r5+1]=r1;HEAP32[r5]=r1;r1=r4+12|0;HEAP32[r3>>2]=r1;HEAP32[r5+2]=0;_strcpy(r1,r2);return}function __ZNSt13runtime_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=3304;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt13runtime_errorD2Ev(r1){var r2;HEAP32[r1>>2]=3304;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt12length_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=3368;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt3__114error_categoryD0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__114error_category10equivalentEiRKNS_15error_conditionE(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r5,r1,r2);if((HEAP32[r5+4>>2]|0)!=(HEAP32[r3+4>>2]|0)){r6=0;STACKTOP=r4;return r6}r6=(HEAP32[r5>>2]|0)==(HEAP32[r3>>2]|0);STACKTOP=r4;return r6}function __ZNKSt3__112__do_message7messageEi(r1,r2,r3){r2=_strerror(r3);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,r2,_strlen(r2));return}function __ZNSt3__112system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r4=STACKTOP;r5=r3,r6=r5>>2;r7=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r8=r2|0;r9=HEAP32[r8>>2];if((r9|0)==0){r10=r1,r11=r10>>2;HEAP32[r11]=HEAP32[r6];HEAP32[r11+1]=HEAP32[r6+1];HEAP32[r11+2]=HEAP32[r6+2];HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;STACKTOP=r4;return}r12=HEAPU8[r5];if((r12&1|0)==0){r13=r12>>>1}else{r13=HEAP32[r3+4>>2]}if((r13|0)==0){r14=r9}else{__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc(r3,1776);r14=HEAP32[r8>>2]}r8=HEAP32[r2+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r7,r8,r14);r14=HEAP8[r7];if((r14&1)==0){r15=r7+1|0}else{r15=HEAP32[r7+8>>2]}r8=r14&255;if((r8&1|0)==0){r16=r8>>>1}else{r16=HEAP32[r7+4>>2]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r3,r15,r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r7);r10=r1,r11=r10>>2;HEAP32[r11]=HEAP32[r6];HEAP32[r11+1]=HEAP32[r6+1];HEAP32[r11+2]=HEAP32[r6+2];HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;STACKTOP=r4;return}function __ZNSt3__112system_errorC2ENS_10error_codeEPKc(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r2;r2=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r2+4>>2]=HEAP32[r5+4>>2];r5=r4;r6=r4+16;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r6,r3,_strlen(r3));__ZNSt3__112system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r5,r2,r6);__ZNSt13runtime_errorC2ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE(r1|0,r5);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r5);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r6);HEAP32[r1>>2]=5496;r6=r2;r2=r1+8|0;r1=HEAP32[r6+4>>2];HEAP32[r2>>2]=HEAP32[r6>>2];HEAP32[r2+4>>2]=r1;STACKTOP=r4;return}function __ZNSt3__112system_errorD0Ev(r1){__ZNSt13runtime_errorD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__112system_errorD2Ev(r1){__ZNSt13runtime_errorD2Ev(r1|0);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1){if((HEAP8[r1]&1)==0){return}__ZdlPv(HEAP32[r1+8>>2]);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=_strlen(r2);r4=r1;r5=r1;r6=HEAP8[r5];if((r6&1)==0){r7=10;r8=r6}else{r6=HEAP32[r1>>2];r7=(r6&-2)-1|0;r8=r6&255}if(r7>>>0<r3>>>0){r6=r8&255;if((r6&1|0)==0){r9=r6>>>1}else{r9=HEAP32[r1+4>>2]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r7,r3-r7|0,r9,0,r9,r3,r2);return r1}if((r8&1)==0){r10=r4+1|0}else{r10=HEAP32[r1+8>>2]}_memmove(r10,r2,r3,1,0);HEAP8[r10+r3|0]=0;if((HEAP8[r5]&1)==0){HEAP8[r5]=r3<<1&255;return r1}else{HEAP32[r1+4>>2]=r3;return r1}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc(r1,r2){return __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r1,r2,_strlen(r2))}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=r1;r4=HEAP8[r3];if((r4&1)==0){r5=10;r6=r4}else{r4=HEAP32[r1>>2];r5=(r4&-2)-1|0;r6=r4&255}r4=r6&255;if((r4&1|0)==0){r7=r4>>>1}else{r7=HEAP32[r1+4>>2]}if((r7|0)==(r5|0)){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r5,1,r5,r5,0,0);r8=HEAP8[r3]}else{r8=r6}if((r8&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}HEAP8[r9+r7|0]=r2;r2=r7+1|0;HEAP8[r9+r2|0]=0;if((HEAP8[r3]&1)==0){HEAP8[r3]=r2<<1&255;return}else{HEAP32[r1+4>>2]=r2;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=10;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}if((r6-r8|0)>>>0<r3>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r6,r3-r6+r8|0,r8,r8,0,r3,r2);return r1}if((r3|0)==0){return r1}if((r7&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}r7=r9+r8|0;_memcpy(r7,r2,r3)|0;r2=r8+r3|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r2<<1&255}else{HEAP32[r1+4>>2]=r2}HEAP8[r9+r2|0]=0;return r1}function __ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r2,r3){var r4;r4=r1>>2;if((HEAP32[r4]|0)==1){while(1){_pthread_cond_wait(10864,10856);if((HEAP32[r4]|0)!=1){break}}}if((HEAP32[r4]|0)!=0){return}HEAP32[r4]=1;FUNCTION_TABLE[r3](r2);HEAP32[r4]=-1;_pthread_cond_broadcast(10864);return}function __ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1){r1=___cxa_allocate_exception(8);__ZNSt11logic_errorC2EPKc(r1,696);HEAP32[r1>>2]=3336;___cxa_throw(r1,9272,76)}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_(r1,r2){var r3,r4,r5,r6;r3=r2,r4=r3>>2;if((HEAP8[r3]&1)==0){r3=r1>>2;HEAP32[r3]=HEAP32[r4];HEAP32[r3+1]=HEAP32[r4+1];HEAP32[r3+2]=HEAP32[r4+2];return}r4=HEAP32[r2+8>>2];r3=HEAP32[r2+4>>2];if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r5=r1+1|0}else{r2=r3+16&-16;r6=__Znwj(r2);HEAP32[r1+8>>2]=r6;HEAP32[r1>>2]=r2|1;HEAP32[r1+4>>2]=r3;r5=r6}_memcpy(r5,r4,r3)|0;HEAP8[r5+r3|0]=0;return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,r2,r3){var r4,r5,r6,r7;if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r4=r1+1|0;_memcpy(r4,r2,r3)|0;r5=r4+r3|0;HEAP8[r5]=0;return}else{r6=r3+16&-16;r7=__Znwj(r6);HEAP32[r1+8>>2]=r7;HEAP32[r1>>2]=r6|1;HEAP32[r1+4>>2]=r3;r4=r7;_memcpy(r4,r2,r3)|0;r5=r4+r3|0;HEAP8[r5]=0;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r2>>>0<11){HEAP8[r1]=r2<<1&255;r4=r1+1|0;_memset(r4,r3,r2);r5=r4+r2|0;HEAP8[r5]=0;return}else{r6=r2+16&-16;r7=__Znwj(r6);HEAP32[r1+8>>2]=r7;HEAP32[r1>>2]=r6|1;HEAP32[r1+4>>2]=r2;r4=r7;_memset(r4,r3,r2);r5=r4+r2|0;HEAP8[r5]=0;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=r1>>2;if((r2|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}r4=r1;r5=r1;r1=HEAP8[r5];if((r1&1)==0){r6=10;r7=r1}else{r1=HEAP32[r3];r6=(r1&-2)-1|0;r7=r1&255}r1=r7&255;if((r1&1|0)==0){r8=r1>>>1}else{r8=HEAP32[r3+1]}r1=r8>>>0>r2>>>0?r8:r2;if(r1>>>0<11){r9=11}else{r9=r1+16&-16}r1=r9-1|0;if((r1|0)==(r6|0)){return}if((r1|0)==10){r10=r4+1|0;r11=HEAP32[r3+2];r12=1;r13=0}else{if(r1>>>0>r6>>>0){r14=__Znwj(r9)}else{r14=__Znwj(r9)}r6=r7&1;if(r6<<24>>24==0){r15=r4+1|0}else{r15=HEAP32[r3+2]}r10=r14;r11=r15;r12=r6<<24>>24!=0;r13=1}r6=r7&255;if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r3+1]}r6=r16+1|0;_memcpy(r10,r11,r6)|0;if(r12){__ZdlPv(r11)}if(r13){HEAP32[r3]=r9|1;HEAP32[r3+1]=r8;HEAP32[r3+2]=r10;return}else{HEAP8[r5]=r8<<1&255;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;if((-3-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}do{if(r2>>>0<2147483631){r10=r3+r2|0;r11=r2<<1;r12=r10>>>0<r11>>>0?r11:r10;if(r12>>>0<11){r13=11;break}r13=r12+16&-16}else{r13=-2}}while(0);r3=__Znwj(r13);if((r5|0)!=0){_memcpy(r3,r9,r5)|0}if((r7|0)!=0){r12=r3+r5|0;_memcpy(r12,r8,r7)|0}r8=r4-r6|0;if((r8|0)!=(r5|0)){r4=r8-r5|0;r12=r3+r7+r5|0;r10=r9+r6+r5|0;_memcpy(r12,r10,r4)|0}if((r2|0)==10){r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=r3+r17|0;HEAP8[r19]=0;return}__ZdlPv(r9);r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=r3+r17|0;HEAP8[r19]=0;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE(r1,r2){return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6setbufEPci(r1,r2,r3){return r1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE4syncEv(r1){return 0}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9showmanycEv(r1){return 0}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){r6=r1;HEAP32[r6>>2]=0;HEAP32[r6+4>>2]=0;r6=r1+8|0;HEAP32[r6>>2]=-1;HEAP32[r6+4>>2]=-1;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){r4=STACKTOP;r2=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r2];HEAP32[r3+4>>2]=HEAP32[r2+1];HEAP32[r3+8>>2]=HEAP32[r2+2];HEAP32[r3+12>>2]=HEAP32[r2+3];r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r1){if((HEAP8[r1]&1)==0){return}__ZdlPv(HEAP32[r1+8>>2]);return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(r1,r2){return __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(r1,r2,_wcslen(r2))}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=1;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}if(r6>>>0<r3>>>0){r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE21__grow_by_and_replaceEjjjjjjPKw(r1,r6,r3-r6|0,r8,0,r8,r3,r2);return r1}if((r7&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}_wmemmove(r9,r2,r3);HEAP32[r9+(r3<<2)>>2]=0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r3<<1&255;return r1}else{HEAP32[r1+4>>2]=r3;return r1}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=r1;r4=HEAP8[r3];if((r4&1)==0){r5=1;r6=r4}else{r4=HEAP32[r1>>2];r5=(r4&-2)-1|0;r6=r4&255}r4=r6&255;if((r4&1|0)==0){r7=r4>>>1}else{r7=HEAP32[r1+4>>2]}if((r7|0)==(r5|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r5,1,r5,r5,0,0);r8=HEAP8[r3]}else{r8=r6}if((r8&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}HEAP32[r9+(r7<<2)>>2]=r2;r2=r7+1|0;HEAP32[r9+(r2<<2)>>2]=0;if((HEAP8[r3]&1)==0){HEAP8[r3]=r2<<1&255;return}else{HEAP32[r1+4>>2]=r2;return}}function __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r1){__ZNSt3__18ios_baseD2Ev(r1|0);return}function __ZNKSt3__18ios_base6getlocEv(r1,r2){__ZNSt3__16localeC2ERKS0_(r1,r2+28|0);return}function __ZNSt3__18ios_base4initEPv(r1,r2){var r3;r3=r1>>2;HEAP32[r3+6]=r2;HEAP32[r3+4]=(r2|0)==0;HEAP32[r3+5]=0;HEAP32[r3+1]=4098;HEAP32[r3+3]=0;HEAP32[r3+2]=6;r3=r1+28|0;_memset(r1+32|0,0,40);if((r3|0)==0){return}__ZNSt3__16localeC2Ev(r3);return}function __ZNSt3__19basic_iosIwNS_11char_traitsIwEEED2Ev(r1){__ZNSt3__18ios_baseD2Ev(r1|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED0Ev(r1){HEAP32[r1>>2]=5064;__ZNSt3__16localeD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED1Ev(r1){HEAP32[r1>>2]=5064;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1){HEAP32[r1>>2]=5064;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(r1){var r2;HEAP32[r1>>2]=5064;__ZNSt3__16localeC2Ev(r1+4|0);r2=(r1+8|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;if((-3-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r8=r1+1|0}else{r8=HEAP32[r1+8>>2]}do{if(r2>>>0<2147483631){r9=r3+r2|0;r10=r2<<1;r11=r9>>>0<r10>>>0?r10:r9;if(r11>>>0<11){r12=11;break}r12=r11+16&-16}else{r12=-2}}while(0);r3=__Znwj(r12);if((r5|0)!=0){_memcpy(r3,r8,r5)|0}r11=r4-r6|0;if((r11|0)!=(r5|0)){r4=r11-r5|0;r11=r3+r7+r5|0;r7=r8+r6+r5|0;_memcpy(r11,r7,r4)|0}if((r2|0)==10){r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}__ZdlPv(r8);r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(r1,r2,r3){var r4,r5,r6,r7,r8;if(r3>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<2){HEAP8[r1]=r3<<1&255;r4=r1+4|0;r5=_wmemcpy(r4,r2,r3);r6=(r3<<2)+r4|0;HEAP32[r6>>2]=0;return}else{r7=r3+4&-4;r8=__Znwj(r7<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r7|1;HEAP32[r1+4>>2]=r3;r4=r8;r5=_wmemcpy(r4,r2,r3);r6=(r3<<2)+r4|0;HEAP32[r6>>2]=0;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r1,r2,r3){var r4,r5,r6,r7,r8;if(r2>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r2>>>0<2){HEAP8[r1]=r2<<1&255;r4=r1+4|0;r5=_wmemset(r4,r3,r2);r6=(r2<<2)+r4|0;HEAP32[r6>>2]=0;return}else{r7=r2+4&-4;r8=__Znwj(r7<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r7|1;HEAP32[r1+4>>2]=r2;r4=r8;r5=_wmemset(r4,r3,r2);r6=(r2<<2)+r4|0;HEAP32[r6>>2]=0;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=r1>>2;if(r2>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=1;r7=r5}else{r5=HEAP32[r3];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r3+1]}r5=r8>>>0>r2>>>0?r8:r2;if(r5>>>0<2){r9=2}else{r9=r5+4&-4}r5=r9-1|0;if((r5|0)==(r6|0)){return}if((r5|0)==1){r10=r1+4|0;r11=HEAP32[r3+2];r12=1;r13=0}else{r2=r9<<2;if(r5>>>0>r6>>>0){r14=__Znwj(r2)}else{r14=__Znwj(r2)}r2=r7&1;if(r2<<24>>24==0){r15=r1+4|0}else{r15=HEAP32[r3+2]}r10=r14;r11=r15;r12=r2<<24>>24!=0;r13=1}r2=r7&255;if((r2&1|0)==0){r16=r2>>>1}else{r16=HEAP32[r3+1]}_wmemcpy(r10,r11,r16+1|0);if(r12){__ZdlPv(r11)}if(r13){HEAP32[r3]=r9|1;HEAP32[r3+1]=r8;HEAP32[r3+2]=r10;return}else{HEAP8[r4]=r8<<1&255;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE21__grow_by_and_replaceEjjjjjjPKw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;if((1073741821-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}do{if(r2>>>0<536870895){r10=r3+r2|0;r11=r2<<1;r12=r10>>>0<r11>>>0?r11:r10;if(r12>>>0<2){r13=2;break}r13=r12+4&-4}else{r13=1073741822}}while(0);r3=__Znwj(r13<<2);if((r5|0)!=0){_wmemcpy(r3,r9,r5)}if((r7|0)!=0){_wmemcpy((r5<<2)+r3|0,r8,r7)}r8=r4-r6|0;if((r8|0)!=(r5|0)){_wmemcpy((r7+r5<<2)+r3|0,(r6+r5<<2)+r9|0,r8-r5|0)}if((r2|0)==1){r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=(r17<<2)+r3|0;HEAP32[r19>>2]=0;return}__ZdlPv(r9);r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=(r17<<2)+r3|0;HEAP32[r19>>2]=0;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;if((1073741821-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r8=r1+4|0}else{r8=HEAP32[r1+8>>2]}do{if(r2>>>0<536870895){r9=r3+r2|0;r10=r2<<1;r11=r9>>>0<r10>>>0?r10:r9;if(r11>>>0<2){r12=2;break}r12=r11+4&-4}else{r12=1073741822}}while(0);r3=__Znwj(r12<<2);if((r5|0)!=0){_wmemcpy(r3,r8,r5)}r11=r4-r6|0;if((r11|0)!=(r5|0)){_wmemcpy((r7+r5<<2)+r3|0,(r6+r5<<2)+r8|0,r11-r5|0)}if((r2|0)==1){r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}__ZdlPv(r8);r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}function __ZNSt3__18ios_base5clearEj(r1,r2){var r3,r4,r5;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=(HEAP32[r1+24>>2]|0)==0;if(r5){HEAP32[r1+16>>2]=r2|1}else{HEAP32[r1+16>>2]=r2}if(((r5&1|r2)&HEAP32[r1+20>>2]|0)==0){STACKTOP=r3;return}r3=___cxa_allocate_exception(16);do{if((HEAP8[15032]|0)==0){if((___cxa_guard_acquire(15032)|0)==0){break}__ZNSt3__114error_categoryC2Ev(13112);HEAP32[3278]=4832;_atexit(186,13112,___dso_handle)}}while(0);r1=_bitshift64Shl(13112,0,32);HEAP32[r4>>2]=r1&0|1;HEAP32[r4+4>>2]=tempRet0&-1;__ZNSt3__112system_errorC2ENS_10error_codeEPKc(r3,r4,1792);HEAP32[r3>>2]=4016;___cxa_throw(r3,9816,66)}function __ZNSt3__18ios_baseD2Ev(r1){var r2,r3,r4,r5;HEAP32[r1>>2]=3992;r2=HEAP32[r1+40>>2];r3=r1+32|0;r4=r1+36|0;if((r2|0)!=0){r5=r2;while(1){r2=r5-1|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+(r2<<2)>>2]](0,r1,HEAP32[HEAP32[r4>>2]+(r2<<2)>>2]);if((r2|0)==0){break}else{r5=r2}}}__ZNSt3__16localeD2Ev(r1+28|0);_free(HEAP32[r3>>2]);_free(HEAP32[r4>>2]);_free(HEAP32[r1+48>>2]);_free(HEAP32[r1+60>>2]);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9underflowEv(r1){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9pbackfailEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE8overflowEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5imbueERKNS_6localeE(r1,r2){return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6setbufEPwi(r1,r2,r3){return r1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE4syncEv(r1){return 0}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9showmanycEv(r1){return 0}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9underflowEv(r1){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9pbackfailEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE8overflowEi(r1,r2){return-1}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,r2){return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){r6=r1;HEAP32[r6>>2]=0;HEAP32[r6+4>>2]=0;r6=r1+8|0;HEAP32[r6>>2]=-1;HEAP32[r6+4>>2]=-1;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){r4=STACKTOP;r2=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r2];HEAP32[r3+4>>2]=HEAP32[r2+1];HEAP32[r3+8>>2]=HEAP32[r2+2];HEAP32[r3+12>>2]=HEAP32[r2+3];r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsgetnEPci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+12|0;r8=r1+16|0;r9=r2;r2=0;while(1){r10=HEAP32[r7>>2];if(r10>>>0<HEAP32[r8>>2]>>>0){HEAP32[r7>>2]=r10+1;r11=HEAP8[r10]}else{r10=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r1);if((r10|0)==-1){r6=r2;r4=1139;break}r11=r10&255}HEAP8[r9]=r11;r10=r2+1|0;if((r10|0)<(r3|0)){r9=r9+1|0;r2=r10}else{r6=r10;r4=1138;break}}if(r4==1139){return r6}else if(r4==1138){return r6}}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5uflowEv(r1){var r2,r3;if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1)|0)==-1){r2=-1;return r2}r3=r1+12|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r1+1;r2=HEAPU8[r1];return r2}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsputnEPKci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+24|0;r8=r1+28|0;r9=0;r10=r2;while(1){r2=HEAP32[r7>>2];if(r2>>>0<HEAP32[r8>>2]>>>0){r11=HEAP8[r10];HEAP32[r7>>2]=r2+1;HEAP8[r2]=r11}else{if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r1,HEAPU8[r10])|0)==-1){r6=r9;r4=1154;break}}r11=r9+1|0;if((r11|0)<(r3|0)){r9=r11;r10=r10+1|0}else{r6=r11;r4=1152;break}}if(r4==1154){return r6}else if(r4==1152){return r6}}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED0Ev(r1){HEAP32[r1>>2]=4992;__ZNSt3__16localeD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED1Ev(r1){HEAP32[r1>>2]=4992;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1){HEAP32[r1>>2]=4992;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(r1){var r2;HEAP32[r1>>2]=4992;__ZNSt3__16localeC2Ev(r1+4|0);r2=(r1+8|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsgetnEPwi(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+12|0;r8=r1+16|0;r9=r2;r2=0;while(1){r10=HEAP32[r7>>2];if(r10>>>0<HEAP32[r8>>2]>>>0){HEAP32[r7>>2]=r10+4;r11=HEAP32[r10>>2]}else{r10=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r1);if((r10|0)==-1){r6=r2;r4=1167;break}else{r11=r10}}HEAP32[r9>>2]=r11;r10=r2+1|0;if((r10|0)<(r3|0)){r9=r9+4|0;r2=r10}else{r6=r10;r4=1166;break}}if(r4==1166){return r6}else if(r4==1167){return r6}}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5uflowEv(r1){var r2,r3;if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1)|0)==-1){r2=-1;return r2}r3=r1+12|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r1+4;r2=HEAP32[r1>>2];return r2}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsputnEPKwi(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+24|0;r8=r1+28|0;r9=0;r10=r2;while(1){r2=HEAP32[r7>>2];if(r2>>>0<HEAP32[r8>>2]>>>0){r11=HEAP32[r10>>2];HEAP32[r7>>2]=r2+4;HEAP32[r2>>2]=r11}else{if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r1,HEAP32[r10>>2])|0)==-1){r6=r9;r4=1182;break}}r11=r9+1|0;if((r11|0)<(r3|0)){r9=r11;r10=r10+4|0}else{r6=r11;r4=1181;break}}if(r4==1182){return r6}else if(r4==1181){return r6}}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);__ZdlPv(r1);return}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);return}function __ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+8)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+8|0);return}function __ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);__ZdlPv(r1);return}function __ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);return}function __ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+8)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+8|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+4)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+4|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_(r1,r2){var r3,r4;r3=r1|0;HEAP8[r3]=0;HEAP32[r1+4>>2]=r2;r1=HEAP32[HEAP32[r2>>2]-12>>2];r4=r2;if((HEAP32[r1+(r4+16)>>2]|0)!=0){return}r2=HEAP32[r1+(r4+72)>>2];if((r2|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r2)}HEAP8[r3]=1;return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev(r1){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r1);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r1>>2;r5=HEAP32[HEAP32[r4]-12>>2]>>2;r6=r1,r7=r6>>2;if((HEAP32[r5+(r7+6)]|0)==0){STACKTOP=r2;return r1}r8=r3|0;HEAP8[r8]=0;HEAP32[r3+4>>2]=r1;do{if((HEAP32[r5+(r7+4)]|0)==0){r9=HEAP32[r5+(r7+18)];if((r9|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r9)}HEAP8[r8]=1;r9=HEAP32[(HEAP32[HEAP32[r4]-12>>2]+24>>2)+r7];if((FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+24>>2]](r9)|0)!=-1){break}r9=HEAP32[HEAP32[r4]-12>>2];__ZNSt3__18ios_base5clearEj(r6+r9|0,HEAP32[(r9+16>>2)+r7]|1)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r3);STACKTOP=r2;return r1}function __ZNSt3__18ios_base33__set_badbit_and_consider_rethrowEv(r1){var r2;r2=r1+16|0;HEAP32[r2>>2]=HEAP32[r2>>2]|1;if((HEAP32[r1+20>>2]&1|0)==0){return}else{___cxa_rethrow()}}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r1>>2;r5=HEAP32[HEAP32[r4]-12>>2]>>2;r6=r1,r7=r6>>2;if((HEAP32[r5+(r7+6)]|0)==0){STACKTOP=r2;return r1}r8=r3|0;HEAP8[r8]=0;HEAP32[r3+4>>2]=r1;do{if((HEAP32[r5+(r7+4)]|0)==0){r9=HEAP32[r5+(r7+18)];if((r9|0)!=0){__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(r9)}HEAP8[r8]=1;r9=HEAP32[(HEAP32[HEAP32[r4]-12>>2]+24>>2)+r7];if((FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+24>>2]](r9)|0)!=-1){break}r9=HEAP32[HEAP32[r4]-12>>2];__ZNSt3__18ios_base5clearEj(r6+r9|0,HEAP32[(r9+16>>2)+r7]|1)}}while(0);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE6sentryD2Ev(r3);STACKTOP=r2;return r1}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r1){var r2,r3,r4;r2=(r1+4|0)>>2;r1=HEAP32[r2];r3=HEAP32[HEAP32[r1>>2]-12>>2]>>2;r4=r1>>2;if((HEAP32[r3+(r4+6)]|0)==0){return}if((HEAP32[r3+(r4+4)]|0)!=0){return}if((HEAP32[r3+(r4+1)]&8192|0)==0){return}if(__ZSt18uncaught_exceptionv()){return}r4=HEAP32[r2];r3=HEAP32[r4+HEAP32[HEAP32[r4>>2]-12>>2]+24>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r3)|0)!=-1){return}r3=HEAP32[r2];r2=HEAP32[HEAP32[r3>>2]-12>>2];r4=r3;__ZNSt3__18ios_base5clearEj(r4+r2|0,HEAP32[r2+(r4+16)>>2]|1);return}function __ZNKSt3__119__iostream_category4nameEv(r1){return 2048}function __ZNKSt3__17collateIcE10do_compareEPKcS3_S3_S3_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r1=0;L1318:do{if((r4|0)==(r5|0)){r6=r2}else{r7=r2;r8=r4;while(1){if((r7|0)==(r3|0)){r9=-1;r1=1273;break}r10=HEAP8[r7];r11=HEAP8[r8];if(r10<<24>>24<r11<<24>>24){r9=-1;r1=1271;break}if(r11<<24>>24<r10<<24>>24){r9=1;r1=1272;break}r10=r7+1|0;r11=r8+1|0;if((r11|0)==(r5|0)){r6=r10;break L1318}else{r7=r10;r8=r11}}if(r1==1271){return r9}else if(r1==1272){return r9}else if(r1==1273){return r9}}}while(0);r9=(r6|0)!=(r3|0)|0;return r9}function __ZNKSt3__17collateIcE7do_hashEPKcS3_(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==(r3|0)){r4=0;return r4}else{r5=r2;r6=0}while(1){r2=(r6<<4)+HEAP8[r5]|0;r1=r2&-268435456;r7=(r1>>>24|r1)^r2;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r7;break}else{r5=r2;r6=r7}}return r4}function __ZNKSt3__17collateIwE10do_compareEPKwS3_S3_S3_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r1=0;L1337:do{if((r4|0)==(r5|0)){r6=r2}else{r7=r2;r8=r4;while(1){if((r7|0)==(r3|0)){r9=-1;r1=1289;break}r10=HEAP32[r7>>2];r11=HEAP32[r8>>2];if((r10|0)<(r11|0)){r9=-1;r1=1287;break}if((r11|0)<(r10|0)){r9=1;r1=1288;break}r10=r7+4|0;r11=r8+4|0;if((r11|0)==(r5|0)){r6=r10;break L1337}else{r7=r10;r8=r11}}if(r1==1287){return r9}else if(r1==1288){return r9}else if(r1==1289){return r9}}}while(0);r9=(r6|0)!=(r3|0)|0;return r9}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+4)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+4|0);return}function __ZNKSt3__119__iostream_category7messageEi(r1,r2,r3){if((r3|0)==1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,2360,35);return}else{__ZNKSt3__112__do_message7messageEi(r1,r2|0,r3);return}}function __ZNSt3__119__iostream_categoryD1Ev(r1){__ZNSt3__114error_categoryD2Ev(r1|0);return}function __ZNSt3__18ios_base7failureD0Ev(r1){__ZNSt3__112system_errorD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18ios_base7failureD2Ev(r1){__ZNSt3__112system_errorD2Ev(r1|0);return}function __ZNSt3__18ios_baseD0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__119__iostream_categoryD0Ev(r1){__ZNSt3__114error_categoryD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17collateIcED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17collateIcED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__16locale5facetD2Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17collateIcE12do_transformEPKcS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=0;r5=r3;r6=r4-r5|0;do{if((r6|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1);r2=1313}else{if(r6>>>0>=11){r2=1313;break}HEAP8[r1]=r6<<1&255;r7=r1+1|0}}while(0);if(r2==1313){r2=r6+16&-16;r8=__Znwj(r2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r2|1;HEAP32[r1+4>>2]=r6;r7=r8}if((r3|0)==(r4|0)){r9=r7;HEAP8[r9]=0;return}r8=r4+ -r5|0;r5=r7;r6=r3;while(1){HEAP8[r5]=HEAP8[r6];r3=r6+1|0;if((r3|0)==(r4|0)){break}else{r5=r5+1|0;r6=r3}}r9=r7+r8|0;HEAP8[r9]=0;return}function __ZNSt3__17collateIwED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17collateIwED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+40|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;r8=r3+32;r9=r6|0;HEAP8[r9]=0;HEAP32[r6+4>>2]=r1;r10=r1>>2;r11=HEAP32[HEAP32[r10]-12>>2];r12=r1,r13=r12>>2;do{if((HEAP32[(r11+16>>2)+r13]|0)==0){r14=HEAP32[(r11+72>>2)+r13];if((r14|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r14)}HEAP8[r9]=1;__ZNSt3__16localeC2ERKS0_(r7,r12+HEAP32[HEAP32[r10]-12>>2]+28|0);r14=__ZNKSt3__16locale9use_facetERNS0_2idE(r7,14112);__ZNSt3__16localeD2Ev(r7);r15=HEAP32[HEAP32[r10]-12>>2];r16=HEAP32[(r15+24>>2)+r13];r17=r15+(r12+76)|0;r18=HEAP32[r17>>2];if((r18|0)==-1){__ZNSt3__16localeC2ERKS0_(r5,r15+(r12+28)|0);r19=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14464);r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+28>>2]](r19,32);__ZNSt3__16localeD2Ev(r5);HEAP32[r17>>2]=r20<<24>>24;r21=r20}else{r21=r18&255}r18=HEAP32[HEAP32[r14>>2]+16>>2];HEAP32[r4>>2]=r16;FUNCTION_TABLE[r18](r8,r14,r4,r12+r15|0,r21,r2);if((HEAP32[r8>>2]|0)!=0){break}r15=HEAP32[HEAP32[r10]-12>>2];__ZNSt3__18ios_base5clearEj(r12+r15|0,HEAP32[(r15+16>>2)+r13]|5)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r6);STACKTOP=r3;return r1}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+40|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;r8=r3+32;r9=r6|0;HEAP8[r9]=0;HEAP32[r6+4>>2]=r1;r10=r1>>2;r11=HEAP32[HEAP32[r10]-12>>2];r12=r1,r13=r12>>2;do{if((HEAP32[(r11+16>>2)+r13]|0)==0){r14=HEAP32[(r11+72>>2)+r13];if((r14|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r14)}HEAP8[r9]=1;__ZNSt3__16localeC2ERKS0_(r7,r12+HEAP32[HEAP32[r10]-12>>2]+28|0);r14=__ZNKSt3__16locale9use_facetERNS0_2idE(r7,14112);__ZNSt3__16localeD2Ev(r7);r15=HEAP32[HEAP32[r10]-12>>2];r16=HEAP32[(r15+24>>2)+r13];r17=r15+(r12+76)|0;r18=HEAP32[r17>>2];if((r18|0)==-1){__ZNSt3__16localeC2ERKS0_(r5,r15+(r12+28)|0);r19=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14464);r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+28>>2]](r19,32);__ZNSt3__16localeD2Ev(r5);HEAP32[r17>>2]=r20<<24>>24;r21=r20}else{r21=r18&255}r18=HEAP32[HEAP32[r14>>2]+24>>2];HEAP32[r4>>2]=r16;FUNCTION_TABLE[r18](r8,r14,r4,r12+r15|0,r21,r2);if((HEAP32[r8>>2]|0)!=0){break}r15=HEAP32[HEAP32[r10]-12>>2];__ZNSt3__18ios_base5clearEj(r12+r15|0,HEAP32[(r15+16>>2)+r13]|5)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r6);STACKTOP=r3;return r1}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r4|0;HEAP8[r5]=0;HEAP32[r4+4>>2]=r1;r6=r1>>2;r7=HEAP32[HEAP32[r6]-12>>2];r8=r1,r9=r8>>2;do{if((HEAP32[(r7+16>>2)+r9]|0)==0){r10=HEAP32[(r7+72>>2)+r9];if((r10|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r10)}HEAP8[r5]=1;r10=HEAP32[(HEAP32[HEAP32[r6]-12>>2]+24>>2)+r9];r11=r10;if((r10|0)==0){r12=r11}else{r13=r10+24|0;r14=HEAP32[r13>>2];if((r14|0)==(HEAP32[r10+28>>2]|0)){r15=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r11,r2&255)}else{HEAP32[r13>>2]=r14+1;HEAP8[r14]=r2;r15=r2&255}r12=(r15|0)==-1?0:r11}if((r12|0)!=0){break}r11=HEAP32[HEAP32[r6]-12>>2];__ZNSt3__18ios_base5clearEj(r8+r11|0,HEAP32[(r11+16>>2)+r9]|1)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r4);STACKTOP=r3;return r1}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE6sentryD2Ev(r1){var r2,r3,r4;r2=(r1+4|0)>>2;r1=HEAP32[r2];r3=HEAP32[HEAP32[r1>>2]-12>>2]>>2;r4=r1>>2;if((HEAP32[r3+(r4+6)]|0)==0){return}if((HEAP32[r3+(r4+4)]|0)!=0){return}if((HEAP32[r3+(r4+1)]&8192|0)==0){return}if(__ZSt18uncaught_exceptionv()){return}r4=HEAP32[r2];r3=HEAP32[r4+HEAP32[HEAP32[r4>>2]-12>>2]+24>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r3)|0)!=-1){return}r3=HEAP32[r2];r2=HEAP32[HEAP32[r3>>2]-12>>2];r4=r3;__ZNSt3__18ios_base5clearEj(r4+r2|0,HEAP32[r2+(r4+16)>>2]|1);return}function __ZNKSt3__17collateIwE7do_hashEPKwS3_(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==(r3|0)){r4=0;return r4}else{r5=r2;r6=0}while(1){r2=(r6<<4)+HEAP32[r5>>2]|0;r1=r2&-268435456;r7=(r1>>>24|r1)^r2;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r7;break}else{r5=r2;r6=r7}}return r4}function __ZNKSt3__17collateIwE12do_transformEPKwS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=r3;r5=r4-r2|0;r6=r5>>2;if(r6>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1)}if(r6>>>0<2){HEAP8[r1]=r5>>>1&255;r7=r1+4|0}else{r5=r6+4&-4;r8=__Znwj(r5<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r5|1;HEAP32[r1+4>>2]=r6;r7=r8}if((r3|0)==(r4|0)){r9=r7;HEAP32[r9>>2]=0;return}r8=(r4-4+ -r2|0)>>>2;r2=r7;r6=r3;while(1){HEAP32[r2>>2]=HEAP32[r6>>2];r3=r6+4|0;if((r3|0)==(r4|0)){break}else{r2=r2+4|0;r6=r3}}r9=(r8+1<<2)+r7|0;HEAP32[r9>>2]=0;return}function __ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+104|0;r10=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r10>>2];r10=(r4-r3|0)/12&-1;r11=r9|0;do{if(r10>>>0>100){r12=_malloc(r10);if((r12|0)!=0){r13=r12;r14=r12;break}__ZSt17__throw_bad_allocv();r13=0;r14=0}else{r13=r11;r14=0}}while(0);r11=(r3|0)==(r4|0);if(r11){r15=r10;r16=0}else{r12=r10;r10=0;r17=r13;r18=r3;while(1){r19=HEAPU8[r18];if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r18+4>>2]}if((r20|0)==0){HEAP8[r17]=2;r21=r10+1|0;r22=r12-1|0}else{HEAP8[r17]=1;r21=r10;r22=r12}r19=r18+12|0;if((r19|0)==(r4|0)){r15=r22;r16=r21;break}else{r12=r22;r10=r21;r17=r17+1|0;r18=r19}}}r18=(r1|0)>>2;r1=(r2|0)>>2;r2=r5;r17=0;r21=r16;r16=r15;while(1){r15=HEAP32[r18],r10=r15>>2;do{if((r15|0)==0){r23=0}else{if((HEAP32[r10+3]|0)!=(HEAP32[r10+4]|0)){r23=r15;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r15)|0)==-1){HEAP32[r18]=0;r23=0;break}else{r23=HEAP32[r18];break}}}while(0);r15=(r23|0)==0;r10=HEAP32[r1],r22=r10>>2;if((r10|0)==0){r24=r23,r25=r24>>2;r26=0,r27=r26>>2}else{do{if((HEAP32[r22+3]|0)==(HEAP32[r22+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r10)|0)!=-1){r28=r10;break}HEAP32[r1]=0;r28=0}else{r28=r10}}while(0);r24=HEAP32[r18],r25=r24>>2;r26=r28,r27=r26>>2}r29=(r26|0)==0;if(!((r15^r29)&(r16|0)!=0)){break}r10=HEAP32[r25+3];if((r10|0)==(HEAP32[r25+4]|0)){r30=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)&255}else{r30=HEAP8[r10]}if(r7){r31=r30}else{r31=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r5,r30)}do{if(r11){r32=r21;r33=r16}else{r10=r17+1|0;L1519:do{if(r7){r22=r16;r12=r21;r20=r13;r19=0;r34=r3;while(1){do{if((HEAP8[r20]|0)==1){r35=r34;if((HEAP8[r35]&1)==0){r36=r34+1|0}else{r36=HEAP32[r34+8>>2]}if(r31<<24>>24!=(HEAP8[r36+r17|0]|0)){HEAP8[r20]=0;r37=r19;r38=r12;r39=r22-1|0;break}r40=HEAPU8[r35];if((r40&1|0)==0){r41=r40>>>1}else{r41=HEAP32[r34+4>>2]}if((r41|0)!=(r10|0)){r37=1;r38=r12;r39=r22;break}HEAP8[r20]=2;r37=1;r38=r12+1|0;r39=r22-1|0}else{r37=r19;r38=r12;r39=r22}}while(0);r40=r34+12|0;if((r40|0)==(r4|0)){r42=r39;r43=r38;r44=r37;break L1519}r22=r39;r12=r38;r20=r20+1|0;r19=r37;r34=r40}}else{r34=r16;r19=r21;r20=r13;r12=0;r22=r3;while(1){do{if((HEAP8[r20]|0)==1){r40=r22;if((HEAP8[r40]&1)==0){r45=r22+1|0}else{r45=HEAP32[r22+8>>2]}if(r31<<24>>24!=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r5,HEAP8[r45+r17|0])<<24>>24){HEAP8[r20]=0;r46=r12;r47=r19;r48=r34-1|0;break}r35=HEAPU8[r40];if((r35&1|0)==0){r49=r35>>>1}else{r49=HEAP32[r22+4>>2]}if((r49|0)!=(r10|0)){r46=1;r47=r19;r48=r34;break}HEAP8[r20]=2;r46=1;r47=r19+1|0;r48=r34-1|0}else{r46=r12;r47=r19;r48=r34}}while(0);r35=r22+12|0;if((r35|0)==(r4|0)){r42=r48;r43=r47;r44=r46;break L1519}r34=r48;r19=r47;r20=r20+1|0;r12=r46;r22=r35}}}while(0);if(!r44){r32=r43;r33=r42;break}r10=HEAP32[r18];r22=r10+12|0;r12=HEAP32[r22>>2];if((r12|0)==(HEAP32[r10+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+40>>2]](r10)}else{HEAP32[r22>>2]=r12+1}if((r43+r42|0)>>>0<2|r11){r32=r43;r33=r42;break}r12=r17+1|0;r22=r43;r10=r13;r20=r3;while(1){do{if((HEAP8[r10]|0)==2){r19=HEAPU8[r20];if((r19&1|0)==0){r50=r19>>>1}else{r50=HEAP32[r20+4>>2]}if((r50|0)==(r12|0)){r51=r22;break}HEAP8[r10]=0;r51=r22-1|0}else{r51=r22}}while(0);r19=r20+12|0;if((r19|0)==(r4|0)){r32=r51;r33=r42;break}else{r22=r51;r10=r10+1|0;r20=r19}}}}while(0);r17=r17+1|0;r21=r32;r16=r33}do{if((r24|0)==0){r52=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r52=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r18]=0;r52=0;break}else{r52=HEAP32[r18];break}}}while(0);r18=(r52|0)==0;do{if(r29){r8=1523}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r18){break}else{r8=1525;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r1]=0;r8=1523;break}else{if(r18^(r26|0)==0){break}else{r8=1525;break}}}}while(0);if(r8==1523){if(r18){r8=1525}}if(r8==1525){HEAP32[r6>>2]=HEAP32[r6>>2]|2}L1598:do{if(r11){r8=1530}else{r18=r3;r26=r13;while(1){if((HEAP8[r26]|0)==2){r53=r18;break L1598}r1=r18+12|0;if((r1|0)==(r4|0)){r8=1530;break L1598}r18=r1;r26=r26+1|0}}}while(0);if(r8==1530){HEAP32[r6>>2]=HEAP32[r6>>2]|4;r53=r4}if((r14|0)==0){STACKTOP=r9;return r53}_free(r14);STACKTOP=r9;return r53}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16,r12=r11>>2;r13=r8+32;r14=r8+40;r15=r8+48;r16=r8+56;r17=r8+64;r18=r8+72;r19=r8+80;r20=r8+104;if((HEAP32[r5+4>>2]&1|0)==0){HEAP32[r13>>2]=-1;r21=HEAP32[HEAP32[r2>>2]+16>>2];r22=r3|0;HEAP32[r15>>2]=HEAP32[r22>>2];HEAP32[r16>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r21](r14,r2,r15,r16,r5,r6,r13);r16=HEAP32[r14>>2];HEAP32[r22>>2]=r16;r22=HEAP32[r13>>2];if((r22|0)==0){HEAP8[r7]=0}else if((r22|0)==1){HEAP8[r7]=1}else{HEAP8[r7]=1;HEAP32[r6>>2]=4}HEAP32[r1>>2]=r16;STACKTOP=r8;return}__ZNKSt3__18ios_base6getlocEv(r17,r5);r16=r17|0;r17=HEAP32[r16>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r12]=14464;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r11,260)}r11=HEAP32[3617]-1|0;r12=HEAP32[r17+8>>2];do{if(HEAP32[r17+12>>2]-r12>>2>>>0>r11>>>0){r22=HEAP32[r12+(r11<<2)>>2];if((r22|0)==0){break}r13=r22;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);__ZNKSt3__18ios_base6getlocEv(r18,r5);r22=r18|0;r14=HEAP32[r22>>2];if((HEAP32[3520]|0)!=-1){HEAP32[r10]=14080;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r9,260)}r15=HEAP32[3521]-1|0;r2=HEAP32[r14+8>>2];do{if(HEAP32[r14+12>>2]-r2>>2>>>0>r15>>>0){r21=HEAP32[r2+(r15<<2)>>2];if((r21|0)==0){break}r23=r21;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r22>>2]|0);r24=r19|0;r25=r21;FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r24,r23);FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+28>>2]](r19+12|0,r23);HEAP32[r20>>2]=HEAP32[r4>>2];r23=(__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r20,r24,r19+24|0,r13,r6,1)|0)==(r24|0)|0;HEAP8[r7]=r23;HEAP32[r1>>2]=HEAP32[r3>>2];__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19+12|0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19|0);STACKTOP=r8;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9240,382)}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16;r11=r5>>2;r5=r4>>2;r4=HEAP32[r5];r12=(r4|0)==(r3|0);do{if(r12){r13=(HEAP8[r10+24|0]|0)==r1<<24>>24;if(!r13){if((HEAP8[r10+25|0]|0)!=r1<<24>>24){break}}HEAP32[r5]=r3+1;HEAP8[r3]=r13?43:45;HEAP32[r11]=0;r14=0;return r14}}while(0);r13=HEAPU8[r7];if((r13&1|0)==0){r15=r13>>>1}else{r15=HEAP32[r7+4>>2]}if((r15|0)!=0&r1<<24>>24==r6<<24>>24){r6=HEAP32[r9>>2];if((r6-r8|0)>=160){r14=0;return r14}r8=HEAP32[r11];HEAP32[r9>>2]=r6+4;HEAP32[r6>>2]=r8;HEAP32[r11]=0;r14=0;return r14}r8=r10+26|0;r6=r10;while(1){if((r6|0)==(r8|0)){r16=r8;break}if((HEAP8[r6]|0)==r1<<24>>24){r16=r6;break}else{r6=r6+1|0}}r6=r16-r10|0;if((r6|0)>23){r14=-1;return r14}do{if((r2|0)==8|(r2|0)==10){if((r6|0)<(r2|0)){break}else{r14=-1}return r14}else if((r2|0)==16){if((r6|0)<22){break}if(r12){r14=-1;return r14}if((r4-r3|0)>=3){r14=-1;return r14}if((HEAP8[r4-1|0]|0)!=48){r14=-1;return r14}HEAP32[r11]=0;r10=HEAP8[r6+10872|0];r16=HEAP32[r5];HEAP32[r5]=r16+1;HEAP8[r16]=r10;r14=0;return r14}}while(0);if((r4-r3|0)<39){r3=HEAP8[r6+10872|0];HEAP32[r5]=r4+1;HEAP8[r4]=r3}HEAP32[r11]=HEAP32[r11]+1;r14=0;return r14}function __ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1;r6=r1;r7=HEAP8[r6];r8=r7&255;if((r8&1|0)==0){r9=r8>>>1}else{r9=HEAP32[r1+4>>2]}if((r9|0)==0){return}do{if((r2|0)==(r3|0)){r10=r7}else{r9=r3-4|0;if(r9>>>0>r2>>>0){r11=r2;r12=r9}else{r10=r7;break}while(1){r9=HEAP32[r11>>2];HEAP32[r11>>2]=HEAP32[r12>>2];HEAP32[r12>>2]=r9;r9=r11+4|0;r8=r12-4|0;if(r9>>>0<r8>>>0){r11=r9;r12=r8}else{break}}r10=HEAP8[r6]}}while(0);if((r10&1)==0){r13=r5+1|0}else{r13=HEAP32[r1+8>>2]}r5=r10&255;if((r5&1|0)==0){r14=r5>>>1}else{r14=HEAP32[r1+4>>2]}r1=r3-4|0;r3=HEAP8[r13];r5=r3<<24>>24;r10=r3<<24>>24<1|r3<<24>>24==127;L1708:do{if(r1>>>0>r2>>>0){r3=r13+r14|0;r6=r13;r12=r2;r11=r5;r7=r10;while(1){if(!r7){if((r11|0)!=(HEAP32[r12>>2]|0)){break}}r8=(r3-r6|0)>1?r6+1|0:r6;r9=r12+4|0;r15=HEAP8[r8];r16=r15<<24>>24;r17=r15<<24>>24<1|r15<<24>>24==127;if(r9>>>0<r1>>>0){r6=r8;r12=r9;r11=r16;r7=r17}else{r18=r16;r19=r17;break L1708}}HEAP32[r4>>2]=4;return}else{r18=r5;r19=r10}}while(0);if(r19){return}r19=HEAP32[r1>>2];if(!(r18>>>0<r19>>>0|(r19|0)==0)){return}HEAP32[r4>>2]=4;return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRl(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else if((r18|0)==8){r19=16}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L1731:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=1648}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L1731}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=1648;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L1731}}}}while(0);if(r2==1648){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r33=r10>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L1776:do{if(r30){r2=1678}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=1678;break L1776}}while(0);if(!(r9^(r28|0)==0)){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1678){if(r9){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r8=_newlocale(1,1896,0);HEAP32[3276]=r8}}while(0);r8=_strtoll(r1,r6,r4,HEAP32[3276]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=-1;r6=0;if((r10|0)==34|((r4|0)<(r2|0)|(r4|0)==(r2|0)&r8>>>0<-2147483648>>>0)|((r4|0)>(r6|0)|(r4|0)==(r6|0)&r8>>>0>2147483647>>>0)){HEAP32[r3>>2]=4;r3=0;r7=(r4|0)>(r3|0)|(r4|0)==(r3|0)&r8>>>0>0>>>0?2147483647:-2147483648;STACKTOP=r5;return r7}else{r7=r8;STACKTOP=r5;return r7}}function __ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+40|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=r5+32;__ZNKSt3__18ios_base6getlocEv(r10,r2);r2=(r10|0)>>2;r10=HEAP32[r2];if((HEAP32[3616]|0)!=-1){HEAP32[r9]=14464;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r8,260)}r8=HEAP32[3617]-1|0;r9=HEAP32[r10+8>>2];do{if(HEAP32[r10+12>>2]-r9>>2>>>0>r8>>>0){r11=HEAP32[r9+(r8<<2)>>2];if((r11|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](r11,10872,10898,r3);r11=HEAP32[r2];if((HEAP32[3520]|0)!=-1){HEAP32[r7]=14080;HEAP32[r7+1]=26;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r6,260)}r12=HEAP32[3521]-1|0;r13=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r13>>2>>>0>r12>>>0){r14=HEAP32[r13+(r12<<2)>>2];if((r14|0)==0){break}r15=r14;r16=FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+16>>2]](r15);HEAP8[r4]=r16;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+20>>2]](r1,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r5;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9240,382)}}while(0);r5=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r5);___cxa_throw(r5,9240,382)}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==64){r19=8}else if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L1837:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=1737}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L1837}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=1737;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L1837}}}}while(0);if(r2==1737){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r33=r10>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L1882:do{if(r30){r2=1767}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=1767;break L1882}}while(0);if(!(r9^(r28|0)==0)){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1767){if(r9){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;do{if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0}else{r9=___errno_location();r10=HEAP32[r9>>2];r9=___errno_location();HEAP32[r9>>2]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r9=_newlocale(1,1896,0);HEAP32[3276]=r9}}while(0);r9=_strtoll(r1,r6,r4,HEAP32[3276]);r11=tempRet0;r12=___errno_location();r13=HEAP32[r12>>2];if((r13|0)==0){r12=___errno_location();HEAP32[r12>>2]=r10}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0;break}if((r13|0)!=34){r7=r11;r8=r9;break}HEAP32[r3>>2]=4;r13=0;r12=(r11|0)>(r13|0)|(r11|0)==(r13|0)&r9>>>0>0>>>0;r7=r12?2147483647:-2147483648;r8=r12?-1:0}}while(0);STACKTOP=r5;return tempRet0=r7,r8}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRt(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==64){r19=8}else if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L1918:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=1804}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L1918}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=1804;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L1918}}}}while(0);if(r2==1804){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r33=r10>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP16[r7>>1]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L1963:do{if(r30){r2=1834}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=1834;break L1963}}while(0);if(!(r9^(r28|0)==0)){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1834){if(r9){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r8=_newlocale(1,1896,0);HEAP32[3276]=r8}}while(0);r8=_strtoull(r1,r6,r4,HEAP32[3276]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r10|0)==34|(r4>>>0>r2>>>0|r4>>>0==r2>>>0&r8>>>0>65535>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r8&65535;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==64){r19=8}else if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L2008:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=1879}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L2008}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=1879;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L2008}}}}while(0);if(r2==1879){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r33=r10>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L2053:do{if(r30){r2=1909}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=1909;break L2053}}while(0);if(!(r9^(r28|0)==0)){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1909){if(r9){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r8=_newlocale(1,1896,0);HEAP32[3276]=r8}}while(0);r8=_strtoull(r1,r6,r4,HEAP32[3276]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r10|0)==34|(r4>>>0>r2>>>0|r4>>>0==r2>>>0&r8>>>0>-1>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r8;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==64){r19=8}else if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L2098:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=1954}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L2098}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=1954;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L2098}}}}while(0);if(r2==1954){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r33=r10>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L2143:do{if(r30){r2=1984}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=1984;break L2143}}while(0);if(!(r9^(r28|0)==0)){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1984){if(r9){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r8=_newlocale(1,1896,0);HEAP32[3276]=r8}}while(0);r8=_strtoull(r1,r6,r4,HEAP32[3276]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r10|0)==34|(r4>>>0>r2>>>0|r4>>>0==r2>>>0&r8>>>0>-1>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r8;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==64){r19=8}else if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L2188:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2029}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L2188}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2029;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L2188}}}}while(0);if(r2==2029){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r33=r10>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L2233:do{if(r30){r2=2059}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2059;break L2233}}while(0);if(!(r9^(r28|0)==0)){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2059){if(r9){break}r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r35=r1|0,r36=r35>>2;HEAP32[r36]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;do{if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0}else{if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;r8=0;break}r9=___errno_location();r10=HEAP32[r9>>2];r9=___errno_location();HEAP32[r9>>2]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r9=_newlocale(1,1896,0);HEAP32[3276]=r9}}while(0);r9=_strtoull(r1,r6,r4,HEAP32[3276]);r11=tempRet0;r12=___errno_location();r13=HEAP32[r12>>2];if((r13|0)==0){r12=___errno_location();HEAP32[r12>>2]=r10}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0;break}if((r13|0)!=34){r7=r11;r8=r9;break}HEAP32[r3>>2]=4;r7=-1;r8=-1}}while(0);STACKTOP=r5;return tempRet0=r7,r8}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRf(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+312|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+40;r11=r8+48;r12=r8+56;r13=r8+112;r14=r8+120;r15=r8+280,r16=r15>>2;r17=r8+288;r18=r8+296;r19=r8+304;r20=r8+8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r12,r5,r20,r10,r11);r5=r8+72|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP8[r11];r11=HEAP32[r22],r23=r11>>2;L2267:while(1){do{if((r11|0)==0){r24=0}else{if((HEAP32[r23+3]|0)!=(HEAP32[r23+4]|0)){r24=r11;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)|0)!=-1){r24=r11;break}HEAP32[r22]=0;r24=0}}while(0);r25=(r24|0)==0;r26=HEAP32[r3],r27=r26>>2;do{if((r26|0)==0){r2=2094}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r25){break}else{break L2267}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r3]=0;r2=2094;break}else{if(r25^(r26|0)==0){break}else{break L2267}}}}while(0);if(r2==2094){r2=0;if(r25){break}}r26=(r24+12|0)>>2;r27=HEAP32[r26];r28=r24+16|0;if((r27|0)==(HEAP32[r28>>2]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+36>>2]](r24)&255}else{r29=HEAP8[r27]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r29,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){break}r27=HEAP32[r26];if((r27|0)==(HEAP32[r28>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r26]=r27+1;r11=r24,r23=r11>>2;continue}}r11=HEAPU8[r12];if((r11&1|0)==0){r30=r11>>>1}else{r30=HEAP32[r12+4>>2]}do{if((r30|0)!=0){if((HEAP8[r18]&1)==0){break}r11=HEAP32[r16];if((r11-r14|0)>=160){break}r23=HEAP32[r17>>2];HEAP32[r16]=r11+4;HEAP32[r11>>2]=r23}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r31=0}else{do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r13=_newlocale(1,1896,0);HEAP32[3276]=r13}}while(0);r25=_strtold_l(r5,r9,HEAP32[3276]);if((HEAP32[r9>>2]|0)==(r17|0)){r31=r25;break}else{HEAP32[r6>>2]=4;r31=0;break}}}while(0);HEAPF32[r7>>2]=r31;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);r16=HEAP32[r22],r21=r16>>2;do{if((r16|0)==0){r32=0}else{if((HEAP32[r21+3]|0)!=(HEAP32[r21+4]|0)){r32=r16;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)|0)!=-1){r32=r16;break}HEAP32[r22]=0;r32=0}}while(0);r22=(r32|0)==0;r16=HEAP32[r3],r21=r16>>2;do{if((r16|0)==0){r2=2136}else{if((HEAP32[r21+3]|0)!=(HEAP32[r21+4]|0)){if(!r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)|0)==-1){HEAP32[r3]=0;r2=2136;break}if(!(r22^(r16|0)==0)){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==2136){if(r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}function __ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r6=STACKTOP;STACKTOP=STACKTOP+40|0;r7=r6,r8=r7>>2;r9=r6+16,r10=r9>>2;r11=r6+32;__ZNKSt3__18ios_base6getlocEv(r11,r2);r2=(r11|0)>>2;r11=HEAP32[r2];if((HEAP32[3616]|0)!=-1){HEAP32[r10]=14464;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r9,260)}r9=HEAP32[3617]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+32>>2]](r12,10872,10904,r3);r12=HEAP32[r2];if((HEAP32[3520]|0)!=-1){HEAP32[r8]=14080;HEAP32[r8+1]=26;HEAP32[r8+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r7,260)}r13=HEAP32[3521]-1|0;r14=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r14>>2>>>0>r13>>>0){r15=HEAP32[r14+(r13<<2)>>2];if((r15|0)==0){break}r16=r15;r17=r15;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+12>>2]](r16);HEAP8[r4]=r18;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+16>>2]](r16);HEAP8[r5]=r18;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r1,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r6;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9240,382)}}while(0);r6=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r6);___cxa_throw(r6,9240,382)}function __ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12){var r13,r14,r15,r16,r17,r18,r19;r13=r11>>2;r11=r10>>2;r10=r5>>2;r5=HEAP32[r10];r14=r4;if((r5-r14|0)>38){r15=-1;return r15}if(r1<<24>>24==r6<<24>>24){if((HEAP8[r2]&1)==0){r15=-1;return r15}HEAP8[r2]=0;r6=HEAP32[r10];HEAP32[r10]=r6+1;HEAP8[r6]=46;r6=HEAPU8[r8];if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r8+4>>2]}if((r16|0)==0){r15=0;return r15}r16=HEAP32[r11];if((r16-r9|0)>=160){r15=0;return r15}r6=HEAP32[r13];HEAP32[r11]=r16+4;HEAP32[r16>>2]=r6;r15=0;return r15}do{if(r1<<24>>24==r7<<24>>24){r6=HEAPU8[r8];if((r6&1|0)==0){r17=r6>>>1}else{r17=HEAP32[r8+4>>2]}if((r17|0)==0){break}if((HEAP8[r2]&1)==0){r15=-1;return r15}r6=HEAP32[r11];if((r6-r9|0)>=160){r15=0;return r15}r16=HEAP32[r13];HEAP32[r11]=r6+4;HEAP32[r6>>2]=r16;HEAP32[r13]=0;r15=0;return r15}}while(0);r17=r12+32|0;r7=r12;while(1){if((r7|0)==(r17|0)){r18=r17;break}if((HEAP8[r7]|0)==r1<<24>>24){r18=r7;break}else{r7=r7+1|0}}r7=r18-r12|0;if((r7|0)>31){r15=-1;return r15}r12=HEAP8[r7+10872|0];do{if((r7|0)==25|(r7|0)==24){do{if((r5|0)!=(r4|0)){if((HEAP8[r5-1|0]&95|0)==(HEAP8[r3]&127|0)){break}else{r15=-1}return r15}}while(0);HEAP32[r10]=r5+1;HEAP8[r5]=r12;r15=0;return r15}else if((r7|0)==22|(r7|0)==23){HEAP8[r3]=80}else{r18=HEAP8[r3];if((r12&95|0)!=(r18<<24>>24|0)){break}HEAP8[r3]=r18|-128;if((HEAP8[r2]&1)==0){break}HEAP8[r2]=0;r18=HEAPU8[r8];if((r18&1|0)==0){r19=r18>>>1}else{r19=HEAP32[r8+4>>2]}if((r19|0)==0){break}r18=HEAP32[r11];if((r18-r9|0)>=160){break}r1=HEAP32[r13];HEAP32[r11]=r18+4;HEAP32[r18>>2]=r1}}while(0);r11=HEAP32[r10];if((r11-r14|0)<(((HEAP8[r3]|0)<0?39:29)|0)){HEAP32[r10]=r11+1;HEAP8[r11]=r12}if((r7|0)>21){r15=0;return r15}HEAP32[r13]=HEAP32[r13]+1;r15=0;return r15}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+312|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+40;r11=r8+48;r12=r8+56;r13=r8+112;r14=r8+120;r15=r8+280,r16=r15>>2;r17=r8+288;r18=r8+296;r19=r8+304;r20=r8+8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r12,r5,r20,r10,r11);r5=r8+72|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP8[r11];r11=HEAP32[r22],r23=r11>>2;L2431:while(1){do{if((r11|0)==0){r24=0}else{if((HEAP32[r23+3]|0)!=(HEAP32[r23+4]|0)){r24=r11;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)|0)!=-1){r24=r11;break}HEAP32[r22]=0;r24=0}}while(0);r25=(r24|0)==0;r26=HEAP32[r3],r27=r26>>2;do{if((r26|0)==0){r2=2226}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r25){break}else{break L2431}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r3]=0;r2=2226;break}else{if(r25^(r26|0)==0){break}else{break L2431}}}}while(0);if(r2==2226){r2=0;if(r25){break}}r26=(r24+12|0)>>2;r27=HEAP32[r26];r28=r24+16|0;if((r27|0)==(HEAP32[r28>>2]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+36>>2]](r24)&255}else{r29=HEAP8[r27]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r29,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){break}r27=HEAP32[r26];if((r27|0)==(HEAP32[r28>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r26]=r27+1;r11=r24,r23=r11>>2;continue}}r11=HEAPU8[r12];if((r11&1|0)==0){r30=r11>>>1}else{r30=HEAP32[r12+4>>2]}do{if((r30|0)!=0){if((HEAP8[r18]&1)==0){break}r11=HEAP32[r16];if((r11-r14|0)>=160){break}r23=HEAP32[r17>>2];HEAP32[r16]=r11+4;HEAP32[r11>>2]=r23}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r31=0}else{do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r13=_newlocale(1,1896,0);HEAP32[3276]=r13}}while(0);r25=_strtold_l(r5,r9,HEAP32[3276]);if((HEAP32[r9>>2]|0)==(r17|0)){r31=r25;break}HEAP32[r6>>2]=4;r31=0}}while(0);HEAPF64[r7>>3]=r31;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);r16=HEAP32[r22],r21=r16>>2;do{if((r16|0)==0){r32=0}else{if((HEAP32[r21+3]|0)!=(HEAP32[r21+4]|0)){r32=r16;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)|0)!=-1){r32=r16;break}HEAP32[r22]=0;r32=0}}while(0);r22=(r32|0)==0;r16=HEAP32[r3],r21=r16>>2;do{if((r16|0)==0){r2=2267}else{if((HEAP32[r21+3]|0)!=(HEAP32[r21+4]|0)){if(!r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)|0)==-1){HEAP32[r3]=0;r2=2267;break}if(!(r22^(r16|0)==0)){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==2267){if(r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+312|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+40;r11=r8+48;r12=r8+56;r13=r8+112;r14=r8+120;r15=r8+280,r16=r15>>2;r17=r8+288;r18=r8+296;r19=r8+304;r20=r8+8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r12,r5,r20,r10,r11);r5=r8+72|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP8[r11];r11=HEAP32[r22],r23=r11>>2;L2504:while(1){do{if((r11|0)==0){r24=0}else{if((HEAP32[r23+3]|0)!=(HEAP32[r23+4]|0)){r24=r11;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)|0)!=-1){r24=r11;break}HEAP32[r22]=0;r24=0}}while(0);r25=(r24|0)==0;r26=HEAP32[r3],r27=r26>>2;do{if((r26|0)==0){r2=2287}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r25){break}else{break L2504}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r3]=0;r2=2287;break}else{if(r25^(r26|0)==0){break}else{break L2504}}}}while(0);if(r2==2287){r2=0;if(r25){break}}r26=(r24+12|0)>>2;r27=HEAP32[r26];r28=r24+16|0;if((r27|0)==(HEAP32[r28>>2]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+36>>2]](r24)&255}else{r29=HEAP8[r27]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r29,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){break}r27=HEAP32[r26];if((r27|0)==(HEAP32[r28>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r26]=r27+1;r11=r24,r23=r11>>2;continue}}r11=HEAPU8[r12];if((r11&1|0)==0){r30=r11>>>1}else{r30=HEAP32[r12+4>>2]}do{if((r30|0)!=0){if((HEAP8[r18]&1)==0){break}r11=HEAP32[r16];if((r11-r14|0)>=160){break}r23=HEAP32[r17>>2];HEAP32[r16]=r11+4;HEAP32[r11>>2]=r23}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r31=0}else{do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r13=_newlocale(1,1896,0);HEAP32[3276]=r13}}while(0);r25=_strtold_l(r5,r9,HEAP32[3276]);if((HEAP32[r9>>2]|0)==(r17|0)){r31=r25;break}HEAP32[r6>>2]=4;r31=0}}while(0);HEAPF64[r7>>3]=r31;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);r16=HEAP32[r22],r21=r16>>2;do{if((r16|0)==0){r32=0}else{if((HEAP32[r21+3]|0)!=(HEAP32[r21+4]|0)){r32=r16;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)|0)!=-1){r32=r16;break}HEAP32[r22]=0;r32=0}}while(0);r22=(r32|0)==0;r16=HEAP32[r3],r21=r16>>2;do{if((r16|0)==0){r2=2328}else{if((HEAP32[r21+3]|0)!=(HEAP32[r21+4]|0)){if(!r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)|0)==-1){HEAP32[r3]=0;r2=2328;break}if(!(r22^(r16|0)==0)){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==2328){if(r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}function __ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+48;r13=r12>>2;r14=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r15=STACKTOP;STACKTOP=STACKTOP+40|0;r16=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r19=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;__ZNKSt3__18ios_base6getlocEv(r14,r5);r5=r14|0;r14=HEAP32[r5>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r10]=14464;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r9,260)}r9=HEAP32[3617]-1|0;r10=HEAP32[r14+8>>2];do{if(HEAP32[r14+12>>2]-r10>>2>>>0>r9>>>0){r13=HEAP32[r10+(r9<<2)>>2];if((r13|0)==0){break}r20=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+32>>2]](r13,10872,10898,r20);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r13=r15|0;_memset(r13,0,40);HEAP32[r16>>2]=r13;r21=r17|0;HEAP32[r18>>2]=r21;HEAP32[r19>>2]=0;r22=(r3|0)>>2;r23=(r4|0)>>2;r24=HEAP32[r22],r25=r24>>2;L2587:while(1){do{if((r24|0)==0){r26=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r26=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)!=-1){r26=r24;break}HEAP32[r22]=0;r26=0}}while(0);r27=(r26|0)==0;r28=HEAP32[r23],r29=r28>>2;do{if((r28|0)==0){r2=2358}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){if(r27){break}else{break L2587}}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)==-1){HEAP32[r23]=0;r2=2358;break}else{if(r27^(r28|0)==0){break}else{break L2587}}}}while(0);if(r2==2358){r2=0;if(r27){break}}r28=(r26+12|0)>>2;r29=HEAP32[r28];r30=r26+16|0;if((r29|0)==(HEAP32[r30>>2]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+36>>2]](r26)&255}else{r31=HEAP8[r29]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r31,16,r13,r16,r19,0,r12,r21,r18,r20)|0)!=0){break}r29=HEAP32[r28];if((r29|0)==(HEAP32[r30>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+40>>2]](r26);r24=r26,r25=r24>>2;continue}else{HEAP32[r28]=r29+1;r24=r26,r25=r24>>2;continue}}HEAP8[r15+39|0]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r24=_newlocale(1,1896,0);HEAP32[3276]=r24}}while(0);if((__ZNSt3__110__sscanf_lEPKcPvS1_z(r13,HEAP32[3276],1808,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r7,tempInt))|0)!=1){HEAP32[r6>>2]=4}r24=HEAP32[r22],r25=r24>>2;do{if((r24|0)==0){r32=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r32=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)!=-1){r32=r24;break}HEAP32[r22]=0;r32=0}}while(0);r22=(r32|0)==0;r24=HEAP32[r23],r25=r24>>2;do{if((r24|0)==0){r2=2391}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(!r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r23]=0;r2=2391;break}if(!(r22^(r24|0)==0)){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==2391){if(r22){break}r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r33=r1|0,r34=r33>>2;HEAP32[r34]=r32;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNSt3__110__sscanf_lEPKcPvS1_z(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vsscanf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16,r12=r11>>2;r13=r8+32;r14=r8+40;r15=r8+48;r16=r8+56;r17=r8+64;r18=r8+72;r19=r8+80;r20=r8+104;if((HEAP32[r5+4>>2]&1|0)==0){HEAP32[r13>>2]=-1;r21=HEAP32[HEAP32[r2>>2]+16>>2];r22=r3|0;HEAP32[r15>>2]=HEAP32[r22>>2];HEAP32[r16>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r21](r14,r2,r15,r16,r5,r6,r13);r16=HEAP32[r14>>2];HEAP32[r22>>2]=r16;r22=HEAP32[r13>>2];if((r22|0)==0){HEAP8[r7]=0}else if((r22|0)==1){HEAP8[r7]=1}else{HEAP8[r7]=1;HEAP32[r6>>2]=4}HEAP32[r1>>2]=r16;STACKTOP=r8;return}__ZNKSt3__18ios_base6getlocEv(r17,r5);r16=r17|0;r17=HEAP32[r16>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r12]=14456;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r11,260)}r11=HEAP32[3615]-1|0;r12=HEAP32[r17+8>>2];do{if(HEAP32[r17+12>>2]-r12>>2>>>0>r11>>>0){r22=HEAP32[r12+(r11<<2)>>2];if((r22|0)==0){break}r13=r22;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);__ZNKSt3__18ios_base6getlocEv(r18,r5);r22=r18|0;r14=HEAP32[r22>>2];if((HEAP32[3518]|0)!=-1){HEAP32[r10]=14072;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r9,260)}r15=HEAP32[3519]-1|0;r2=HEAP32[r14+8>>2];do{if(HEAP32[r14+12>>2]-r2>>2>>>0>r15>>>0){r21=HEAP32[r2+(r15<<2)>>2];if((r21|0)==0){break}r23=r21;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r22>>2]|0);r24=r19|0;r25=r21;FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r24,r23);FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+28>>2]](r19+12|0,r23);HEAP32[r20>>2]=HEAP32[r4>>2];r23=(__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r20,r24,r19+24|0,r13,r6,1)|0)==(r24|0)|0;HEAP8[r7]=r23;HEAP32[r1>>2]=HEAP32[r3>>2];__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r19+12|0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r19|0);STACKTOP=r8;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9240,382)}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+104|0;r10=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r10>>2];r10=(r4-r3|0)/12&-1;r11=r9|0;do{if(r10>>>0>100){r12=_malloc(r10);if((r12|0)!=0){r13=r12;r14=r12;break}__ZSt17__throw_bad_allocv();r13=0;r14=0}else{r13=r11;r14=0}}while(0);r11=(r3|0)==(r4|0);if(r11){r15=r10;r16=0}else{r12=r10;r10=0;r17=r13;r18=r3;while(1){r19=HEAPU8[r18];if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r18+4>>2]}if((r20|0)==0){HEAP8[r17]=2;r21=r10+1|0;r22=r12-1|0}else{HEAP8[r17]=1;r21=r10;r22=r12}r19=r18+12|0;if((r19|0)==(r4|0)){r15=r22;r16=r21;break}else{r12=r22;r10=r21;r17=r17+1|0;r18=r19}}}r18=(r1|0)>>2;r1=(r2|0)>>2;r2=r5;r17=0;r21=r16;r16=r15;while(1){r15=HEAP32[r18],r10=r15>>2;do{if((r15|0)==0){r23=0}else{r22=HEAP32[r10+3];if((r22|0)==(HEAP32[r10+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r15)}else{r24=HEAP32[r22>>2]}if((r24|0)==-1){HEAP32[r18]=0;r23=0;break}else{r23=HEAP32[r18];break}}}while(0);r15=(r23|0)==0;r10=HEAP32[r1],r22=r10>>2;if((r10|0)==0){r25=r23,r26=r25>>2;r27=0,r28=r27>>2}else{r12=HEAP32[r22+3];if((r12|0)==(HEAP32[r22+4]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r10)}else{r29=HEAP32[r12>>2]}if((r29|0)==-1){HEAP32[r1]=0;r30=0}else{r30=r10}r25=HEAP32[r18],r26=r25>>2;r27=r30,r28=r27>>2}r31=(r27|0)==0;if(!((r15^r31)&(r16|0)!=0)){break}r15=HEAP32[r26+3];if((r15|0)==(HEAP32[r26+4]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r32=HEAP32[r15>>2]}if(r7){r33=r32}else{r33=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r5,r32)}do{if(r11){r34=r21;r35=r16}else{r15=r17+1|0;L2734:do{if(r7){r10=r16;r12=r21;r22=r13;r20=0;r19=r3;while(1){do{if((HEAP8[r22]|0)==1){r36=r19;if((HEAP8[r36]&1)==0){r37=r19+4|0}else{r37=HEAP32[r19+8>>2]}if((r33|0)!=(HEAP32[r37+(r17<<2)>>2]|0)){HEAP8[r22]=0;r38=r20;r39=r12;r40=r10-1|0;break}r41=HEAPU8[r36];if((r41&1|0)==0){r42=r41>>>1}else{r42=HEAP32[r19+4>>2]}if((r42|0)!=(r15|0)){r38=1;r39=r12;r40=r10;break}HEAP8[r22]=2;r38=1;r39=r12+1|0;r40=r10-1|0}else{r38=r20;r39=r12;r40=r10}}while(0);r41=r19+12|0;if((r41|0)==(r4|0)){r43=r40;r44=r39;r45=r38;break L2734}r10=r40;r12=r39;r22=r22+1|0;r20=r38;r19=r41}}else{r19=r16;r20=r21;r22=r13;r12=0;r10=r3;while(1){do{if((HEAP8[r22]|0)==1){r41=r10;if((HEAP8[r41]&1)==0){r46=r10+4|0}else{r46=HEAP32[r10+8>>2]}if((r33|0)!=(FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r5,HEAP32[r46+(r17<<2)>>2])|0)){HEAP8[r22]=0;r47=r12;r48=r20;r49=r19-1|0;break}r36=HEAPU8[r41];if((r36&1|0)==0){r50=r36>>>1}else{r50=HEAP32[r10+4>>2]}if((r50|0)!=(r15|0)){r47=1;r48=r20;r49=r19;break}HEAP8[r22]=2;r47=1;r48=r20+1|0;r49=r19-1|0}else{r47=r12;r48=r20;r49=r19}}while(0);r36=r10+12|0;if((r36|0)==(r4|0)){r43=r49;r44=r48;r45=r47;break L2734}r19=r49;r20=r48;r22=r22+1|0;r12=r47;r10=r36}}}while(0);if(!r45){r34=r44;r35=r43;break}r15=HEAP32[r18];r10=r15+12|0;r12=HEAP32[r10>>2];if((r12|0)==(HEAP32[r15+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+40>>2]](r15)}else{HEAP32[r10>>2]=r12+4}if((r44+r43|0)>>>0<2|r11){r34=r44;r35=r43;break}r12=r17+1|0;r10=r44;r15=r13;r22=r3;while(1){do{if((HEAP8[r15]|0)==2){r20=HEAPU8[r22];if((r20&1|0)==0){r51=r20>>>1}else{r51=HEAP32[r22+4>>2]}if((r51|0)==(r12|0)){r52=r10;break}HEAP8[r15]=0;r52=r10-1|0}else{r52=r10}}while(0);r20=r22+12|0;if((r20|0)==(r4|0)){r34=r52;r35=r43;break}else{r10=r52;r15=r15+1|0;r22=r20}}}}while(0);r17=r17+1|0;r21=r34;r16=r35}do{if((r25|0)==0){r53=1}else{r35=HEAP32[r26+3];if((r35|0)==(HEAP32[r26+4]|0)){r54=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r54=HEAP32[r35>>2]}if((r54|0)==-1){HEAP32[r18]=0;r53=1;break}else{r53=(HEAP32[r18]|0)==0;break}}}while(0);do{if(r31){r8=2531}else{r18=HEAP32[r28+3];if((r18|0)==(HEAP32[r28+4]|0)){r55=FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)}else{r55=HEAP32[r18>>2]}if((r55|0)==-1){HEAP32[r1]=0;r8=2531;break}else{if(r53^(r27|0)==0){break}else{r8=2533;break}}}}while(0);if(r8==2531){if(r53){r8=2533}}if(r8==2533){HEAP32[r6>>2]=HEAP32[r6>>2]|2}L2815:do{if(r11){r8=2538}else{r53=r3;r27=r13;while(1){if((HEAP8[r27]|0)==2){r56=r53;break L2815}r1=r53+12|0;if((r1|0)==(r4|0)){r8=2538;break L2815}r53=r1;r27=r27+1|0}}}while(0);if(r8==2538){HEAP32[r6>>2]=HEAP32[r6>>2]|4;r56=r4}if((r14|0)==0){STACKTOP=r9;return r56}_free(r14);STACKTOP=r9;return r56}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRl(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L2833:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=2562}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=2562;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L2833}}}}while(0);if(r2==2562){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r35=r10>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=2593}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=2593;break}if(!(r9^(r31|0)==0)){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2593){if(r9){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16;r11=r5>>2;r5=r4>>2;r4=HEAP32[r5];r12=(r4|0)==(r3|0);do{if(r12){r13=(HEAP32[r10+96>>2]|0)==(r1|0);if(!r13){if((HEAP32[r10+100>>2]|0)!=(r1|0)){break}}HEAP32[r5]=r3+1;HEAP8[r3]=r13?43:45;HEAP32[r11]=0;r14=0;return r14}}while(0);r13=HEAPU8[r7];if((r13&1|0)==0){r15=r13>>>1}else{r15=HEAP32[r7+4>>2]}if((r15|0)!=0&(r1|0)==(r6|0)){r6=HEAP32[r9>>2];if((r6-r8|0)>=160){r14=0;return r14}r8=HEAP32[r11];HEAP32[r9>>2]=r6+4;HEAP32[r6>>2]=r8;HEAP32[r11]=0;r14=0;return r14}r8=r10+104|0;r6=r10;while(1){if((r6|0)==(r8|0)){r16=r8;break}if((HEAP32[r6>>2]|0)==(r1|0)){r16=r6;break}else{r6=r6+4|0}}r6=r16-r10|0;r10=r6>>2;if((r6|0)>92){r14=-1;return r14}do{if((r2|0)==8|(r2|0)==10){if((r10|0)<(r2|0)){break}else{r14=-1}return r14}else if((r2|0)==16){if((r6|0)<88){break}if(r12){r14=-1;return r14}if((r4-r3|0)>=3){r14=-1;return r14}if((HEAP8[r4-1|0]|0)!=48){r14=-1;return r14}HEAP32[r11]=0;r16=HEAP8[r10+10872|0];r1=HEAP32[r5];HEAP32[r5]=r1+1;HEAP8[r1]=r16;r14=0;return r14}}while(0);if((r4-r3|0)<39){r3=HEAP8[r10+10872|0];HEAP32[r5]=r4+1;HEAP8[r4]=r3}HEAP32[r11]=HEAP32[r11]+1;r14=0;return r14}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L2948:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=2652}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=2652;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L2948}}}}while(0);if(r2==2652){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r35=r10>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=2683}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=2683;break}if(!(r9^(r31|0)==0)){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2683){if(r9){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRt(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else if((r18|0)==0){r19=0}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L3017:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=2707}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=2707;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L3017}}}}while(0);if(r2==2707){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r35=r10>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP16[r7>>1]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=2738}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=2738;break}if(!(r9^(r31|0)==0)){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2738){if(r9){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+40|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=r5+32;__ZNKSt3__18ios_base6getlocEv(r10,r2);r2=(r10|0)>>2;r10=HEAP32[r2];if((HEAP32[3614]|0)!=-1){HEAP32[r9]=14456;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r8,260)}r8=HEAP32[3615]-1|0;r9=HEAP32[r10+8>>2];do{if(HEAP32[r10+12>>2]-r9>>2>>>0>r8>>>0){r11=HEAP32[r9+(r8<<2)>>2];if((r11|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+48>>2]](r11,10872,10898,r3);r11=HEAP32[r2];if((HEAP32[3518]|0)!=-1){HEAP32[r7]=14072;HEAP32[r7+1]=26;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r6,260)}r12=HEAP32[3519]-1|0;r13=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r13>>2>>>0>r12>>>0){r14=HEAP32[r13+(r12<<2)>>2];if((r14|0)==0){break}r15=r14;r16=FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+16>>2]](r15);HEAP32[r4>>2]=r16;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+20>>2]](r1,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r5;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9240,382)}}while(0);r5=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r5);___cxa_throw(r5,9240,382)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else if((r18|0)==0){r19=0}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L3106:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=2779}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=2779;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L3106}}}}while(0);if(r2==2779){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r35=r10>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=2810}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=2810;break}if(!(r9^(r31|0)==0)){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2810){if(r9){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L3175:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=2834}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=2834;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L3175}}}}while(0);if(r2==2834){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r35=r10>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=2865}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=2865;break}if(!(r9^(r31|0)==0)){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2865){if(r9){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else if((r18|0)==0){r19=0}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L3244:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=2889}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=2889;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L3244}}}}while(0);if(r2==2889){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=HEAPU8[r11];if((r10&1|0)==0){r35=r10>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r10=HEAP32[r16];if((r10-r14|0)>=160){break}r20=HEAP32[r17>>2];HEAP32[r16]=r10+4;HEAP32[r10>>2]=r20}}while(0);r17=__ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7>>2]=r17;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=2920}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=2920;break}if(!(r9^(r31|0)==0)){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2920){if(r9){break}r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r39=r1|0,r40=r39>>2;HEAP32[r40]=r36;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12){var r13,r14,r15,r16,r17,r18,r19;r13=r11>>2;r11=r10>>2;r10=r5>>2;r5=HEAP32[r10];r14=r4;if((r5-r14|0)>38){r15=-1;return r15}if((r1|0)==(r6|0)){if((HEAP8[r2]&1)==0){r15=-1;return r15}HEAP8[r2]=0;r6=HEAP32[r10];HEAP32[r10]=r6+1;HEAP8[r6]=46;r6=HEAPU8[r8];if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r8+4>>2]}if((r16|0)==0){r15=0;return r15}r16=HEAP32[r11];if((r16-r9|0)>=160){r15=0;return r15}r6=HEAP32[r13];HEAP32[r11]=r16+4;HEAP32[r16>>2]=r6;r15=0;return r15}do{if((r1|0)==(r7|0)){r6=HEAPU8[r8];if((r6&1|0)==0){r17=r6>>>1}else{r17=HEAP32[r8+4>>2]}if((r17|0)==0){break}if((HEAP8[r2]&1)==0){r15=-1;return r15}r6=HEAP32[r11];if((r6-r9|0)>=160){r15=0;return r15}r16=HEAP32[r13];HEAP32[r11]=r6+4;HEAP32[r6>>2]=r16;HEAP32[r13]=0;r15=0;return r15}}while(0);r17=r12+128|0;r7=r12;while(1){if((r7|0)==(r17|0)){r18=r17;break}if((HEAP32[r7>>2]|0)==(r1|0)){r18=r7;break}else{r7=r7+4|0}}r7=r18-r12|0;r12=r7>>2;if((r7|0)>124){r15=-1;return r15}r18=HEAP8[r12+10872|0];do{if((r12|0)==25|(r12|0)==24){do{if((r5|0)!=(r4|0)){if((HEAP8[r5-1|0]&95|0)==(HEAP8[r3]&127|0)){break}else{r15=-1}return r15}}while(0);HEAP32[r10]=r5+1;HEAP8[r5]=r18;r15=0;return r15}else if((r12|0)==22|(r12|0)==23){HEAP8[r3]=80}else{r1=HEAP8[r3];if((r18&95|0)!=(r1<<24>>24|0)){break}HEAP8[r3]=r1|-128;if((HEAP8[r2]&1)==0){break}HEAP8[r2]=0;r1=HEAPU8[r8];if((r1&1|0)==0){r19=r1>>>1}else{r19=HEAP32[r8+4>>2]}if((r19|0)==0){break}r1=HEAP32[r11];if((r1-r9|0)>=160){break}r17=HEAP32[r13];HEAP32[r11]=r1+4;HEAP32[r1>>2]=r17}}while(0);r11=HEAP32[r10];if((r11-r14|0)<(((HEAP8[r3]|0)<0?39:29)|0)){HEAP32[r10]=r11+1;HEAP8[r11]=r18}if((r7|0)>84){r15=0;return r15}HEAP32[r13]=HEAP32[r13]+1;r15=0;return r15}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRf(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+408|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+136;r11=r8+144;r12=r8+152;r13=r8+208;r14=r8+216;r15=r8+376,r16=r15>>2;r17=r8+384;r18=r8+392;r19=r8+400;r20=r8+8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r12,r5,r20,r10,r11);r5=r8+168|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r11>>2];r11=HEAP32[r22],r23=r11>>2;L69:while(1){do{if((r11|0)==0){r24=0}else{r25=HEAP32[r23+3];if((r25|0)==(HEAP32[r23+4]|0)){r26=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)}else{r26=HEAP32[r25>>2]}if((r26|0)!=-1){r24=r11;break}HEAP32[r22]=0;r24=0}}while(0);r25=(r24|0)==0;r27=HEAP32[r3],r28=r27>>2;do{if((r27|0)==0){r2=66}else{r29=HEAP32[r28+3];if((r29|0)==(HEAP32[r28+4]|0)){r30=FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)}else{r30=HEAP32[r29>>2]}if((r30|0)==-1){HEAP32[r3]=0;r2=66;break}else{if(r25^(r27|0)==0){break}else{break L69}}}}while(0);if(r2==66){r2=0;if(r25){break}}r27=(r24+12|0)>>2;r28=HEAP32[r27];r29=r24+16|0;if((r28|0)==(HEAP32[r29>>2]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+36>>2]](r24)}else{r31=HEAP32[r28>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r31,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){break}r28=HEAP32[r27];if((r28|0)==(HEAP32[r29>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r27]=r28+4;r11=r24,r23=r11>>2;continue}}r11=HEAPU8[r12];if((r11&1|0)==0){r32=r11>>>1}else{r32=HEAP32[r12+4>>2]}do{if((r32|0)!=0){if((HEAP8[r18]&1)==0){break}r11=HEAP32[r16];if((r11-r14|0)>=160){break}r23=HEAP32[r17>>2];HEAP32[r16]=r11+4;HEAP32[r11>>2]=r23}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r33=0}else{do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r13=_newlocale(1,1896,0);HEAP32[3276]=r13}}while(0);r25=_strtold_l(r5,r9,HEAP32[3276]);if((HEAP32[r9>>2]|0)==(r17|0)){r33=r25;break}else{HEAP32[r6>>2]=4;r33=0;break}}}while(0);HEAPF32[r7>>2]=r33;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);r16=HEAP32[r22],r21=r16>>2;do{if((r16|0)==0){r34=0}else{r33=HEAP32[r21+3];if((r33|0)==(HEAP32[r21+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)}else{r35=HEAP32[r33>>2]}if((r35|0)!=-1){r34=r16;break}HEAP32[r22]=0;r34=0}}while(0);r22=(r34|0)==0;r16=HEAP32[r3],r35=r16>>2;do{if((r16|0)==0){r2=108}else{r21=HEAP32[r35+3];if((r21|0)==(HEAP32[r35+4]|0)){r36=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r16)}else{r36=HEAP32[r21>>2]}if((r36|0)==-1){HEAP32[r3]=0;r2=108;break}if(!(r22^(r16|0)==0)){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==108){if(r22){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r6=STACKTOP;STACKTOP=STACKTOP+40|0;r7=r6,r8=r7>>2;r9=r6+16,r10=r9>>2;r11=r6+32;__ZNKSt3__18ios_base6getlocEv(r11,r2);r2=(r11|0)>>2;r11=HEAP32[r2];if((HEAP32[3614]|0)!=-1){HEAP32[r10]=14456;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r9,260)}r9=HEAP32[3615]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+48>>2]](r12,10872,10904,r3);r12=HEAP32[r2];if((HEAP32[3518]|0)!=-1){HEAP32[r8]=14072;HEAP32[r8+1]=26;HEAP32[r8+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r7,260)}r13=HEAP32[3519]-1|0;r14=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r14>>2>>>0>r13>>>0){r15=HEAP32[r14+(r13<<2)>>2];if((r15|0)==0){break}r16=r15;r17=r15;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+12>>2]](r16);HEAP32[r4>>2]=r18;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+16>>2]](r16);HEAP32[r5>>2]=r18;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r1,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r6;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9240,382)}}while(0);r6=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r6);___cxa_throw(r6,9240,382)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+408|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+136;r11=r8+144;r12=r8+152;r13=r8+208;r14=r8+216;r15=r8+376,r16=r15>>2;r17=r8+384;r18=r8+392;r19=r8+400;r20=r8+8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r12,r5,r20,r10,r11);r5=r8+168|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r11>>2];r11=HEAP32[r22],r23=r11>>2;L167:while(1){do{if((r11|0)==0){r24=0}else{r25=HEAP32[r23+3];if((r25|0)==(HEAP32[r23+4]|0)){r26=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)}else{r26=HEAP32[r25>>2]}if((r26|0)!=-1){r24=r11;break}HEAP32[r22]=0;r24=0}}while(0);r25=(r24|0)==0;r27=HEAP32[r3],r28=r27>>2;do{if((r27|0)==0){r2=146}else{r29=HEAP32[r28+3];if((r29|0)==(HEAP32[r28+4]|0)){r30=FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)}else{r30=HEAP32[r29>>2]}if((r30|0)==-1){HEAP32[r3]=0;r2=146;break}else{if(r25^(r27|0)==0){break}else{break L167}}}}while(0);if(r2==146){r2=0;if(r25){break}}r27=(r24+12|0)>>2;r28=HEAP32[r27];r29=r24+16|0;if((r28|0)==(HEAP32[r29>>2]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+36>>2]](r24)}else{r31=HEAP32[r28>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r31,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){break}r28=HEAP32[r27];if((r28|0)==(HEAP32[r29>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r27]=r28+4;r11=r24,r23=r11>>2;continue}}r11=HEAPU8[r12];if((r11&1|0)==0){r32=r11>>>1}else{r32=HEAP32[r12+4>>2]}do{if((r32|0)!=0){if((HEAP8[r18]&1)==0){break}r11=HEAP32[r16];if((r11-r14|0)>=160){break}r23=HEAP32[r17>>2];HEAP32[r16]=r11+4;HEAP32[r11>>2]=r23}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r33=0}else{do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r13=_newlocale(1,1896,0);HEAP32[3276]=r13}}while(0);r25=_strtold_l(r5,r9,HEAP32[3276]);if((HEAP32[r9>>2]|0)==(r17|0)){r33=r25;break}HEAP32[r6>>2]=4;r33=0}}while(0);HEAPF64[r7>>3]=r33;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);r16=HEAP32[r22],r21=r16>>2;do{if((r16|0)==0){r34=0}else{r33=HEAP32[r21+3];if((r33|0)==(HEAP32[r21+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)}else{r35=HEAP32[r33>>2]}if((r35|0)!=-1){r34=r16;break}HEAP32[r22]=0;r34=0}}while(0);r22=(r34|0)==0;r16=HEAP32[r3],r35=r16>>2;do{if((r16|0)==0){r2=187}else{r21=HEAP32[r35+3];if((r21|0)==(HEAP32[r35+4]|0)){r36=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r16)}else{r36=HEAP32[r21>>2]}if((r36|0)==-1){HEAP32[r3]=0;r2=187;break}if(!(r22^(r16|0)==0)){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==187){if(r22){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+408|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+136;r11=r8+144;r12=r8+152;r13=r8+208;r14=r8+216;r15=r8+376,r16=r15>>2;r17=r8+384;r18=r8+392;r19=r8+400;r20=r8+8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r12,r5,r20,r10,r11);r5=r8+168|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r11>>2];r11=HEAP32[r22],r23=r11>>2;L242:while(1){do{if((r11|0)==0){r24=0}else{r25=HEAP32[r23+3];if((r25|0)==(HEAP32[r23+4]|0)){r26=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)}else{r26=HEAP32[r25>>2]}if((r26|0)!=-1){r24=r11;break}HEAP32[r22]=0;r24=0}}while(0);r25=(r24|0)==0;r27=HEAP32[r3],r28=r27>>2;do{if((r27|0)==0){r2=207}else{r29=HEAP32[r28+3];if((r29|0)==(HEAP32[r28+4]|0)){r30=FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)}else{r30=HEAP32[r29>>2]}if((r30|0)==-1){HEAP32[r3]=0;r2=207;break}else{if(r25^(r27|0)==0){break}else{break L242}}}}while(0);if(r2==207){r2=0;if(r25){break}}r27=(r24+12|0)>>2;r28=HEAP32[r27];r29=r24+16|0;if((r28|0)==(HEAP32[r29>>2]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+36>>2]](r24)}else{r31=HEAP32[r28>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r31,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){break}r28=HEAP32[r27];if((r28|0)==(HEAP32[r29>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r27]=r28+4;r11=r24,r23=r11>>2;continue}}r11=HEAPU8[r12];if((r11&1|0)==0){r32=r11>>>1}else{r32=HEAP32[r12+4>>2]}do{if((r32|0)!=0){if((HEAP8[r18]&1)==0){break}r11=HEAP32[r16];if((r11-r14|0)>=160){break}r23=HEAP32[r17>>2];HEAP32[r16]=r11+4;HEAP32[r11>>2]=r23}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r33=0}else{do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r13=_newlocale(1,1896,0);HEAP32[3276]=r13}}while(0);r25=_strtold_l(r5,r9,HEAP32[3276]);if((HEAP32[r9>>2]|0)==(r17|0)){r33=r25;break}HEAP32[r6>>2]=4;r33=0}}while(0);HEAPF64[r7>>3]=r33;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);r16=HEAP32[r22],r21=r16>>2;do{if((r16|0)==0){r34=0}else{r33=HEAP32[r21+3];if((r33|0)==(HEAP32[r21+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r21]+36>>2]](r16)}else{r35=HEAP32[r33>>2]}if((r35|0)!=-1){r34=r16;break}HEAP32[r22]=0;r34=0}}while(0);r22=(r34|0)==0;r16=HEAP32[r3],r35=r16>>2;do{if((r16|0)==0){r2=248}else{r21=HEAP32[r35+3];if((r21|0)==(HEAP32[r35+4]|0)){r36=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r16)}else{r36=HEAP32[r21>>2]}if((r36|0)==-1){HEAP32[r3]=0;r2=248;break}if(!(r22^(r16|0)==0)){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==248){if(r22){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}function __ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcl(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+80|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+48;r12=r7+56;r13=r7+64;r14=r7+72;r15=r8|0;HEAP8[r15]=HEAP8[3200];HEAP8[r15+1|0]=HEAP8[3201|0];HEAP8[r15+2|0]=HEAP8[3202|0];HEAP8[r15+3|0]=HEAP8[3203|0];HEAP8[r15+4|0]=HEAP8[3204|0];HEAP8[r15+5|0]=HEAP8[3205|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=100}}while(0);r19=r9|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==32){r21=r6}else if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=278;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=278;break}r21=r9+2|0}else{r2=278}}while(0);if(r2==278){r21=r19}r2=r10|0;__ZNKSt3__18ios_base6getlocEv(r13,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r21,r6,r2,r11,r12,r13);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r13>>2]|0);HEAP32[r14>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,HEAP32[r11>>2],HEAP32[r12>>2],r4,r5);STACKTOP=r7;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+136|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+120;r13=r12>>2;r14=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r15=STACKTOP;STACKTOP=STACKTOP+40|0;r16=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r19=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;__ZNKSt3__18ios_base6getlocEv(r14,r5);r5=r14|0;r14=HEAP32[r5>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r10]=14456;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r9,260)}r9=HEAP32[3615]-1|0;r10=HEAP32[r14+8>>2];do{if(HEAP32[r14+12>>2]-r10>>2>>>0>r9>>>0){r13=HEAP32[r10+(r9<<2)>>2];if((r13|0)==0){break}r20=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+48>>2]](r13,10872,10898,r20);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r13=r15|0;_memset(r13,0,40);HEAP32[r16>>2]=r13;r21=r17|0;HEAP32[r18>>2]=r21;HEAP32[r19>>2]=0;r22=(r3|0)>>2;r23=(r4|0)>>2;r24=HEAP32[r22],r25=r24>>2;L358:while(1){do{if((r24|0)==0){r26=0}else{r27=HEAP32[r25+3];if((r27|0)==(HEAP32[r25+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r28=HEAP32[r27>>2]}if((r28|0)!=-1){r26=r24;break}HEAP32[r22]=0;r26=0}}while(0);r27=(r26|0)==0;r29=HEAP32[r23],r30=r29>>2;do{if((r29|0)==0){r2=303}else{r31=HEAP32[r30+3];if((r31|0)==(HEAP32[r30+4]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r30]+36>>2]](r29)}else{r32=HEAP32[r31>>2]}if((r32|0)==-1){HEAP32[r23]=0;r2=303;break}else{if(r27^(r29|0)==0){break}else{break L358}}}}while(0);if(r2==303){r2=0;if(r27){break}}r29=(r26+12|0)>>2;r30=HEAP32[r29];r31=r26+16|0;if((r30|0)==(HEAP32[r31>>2]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+36>>2]](r26)}else{r33=HEAP32[r30>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r33,16,r13,r16,r19,0,r12,r21,r18,r20)|0)!=0){break}r30=HEAP32[r29];if((r30|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+40>>2]](r26);r24=r26,r25=r24>>2;continue}else{HEAP32[r29]=r30+4;r24=r26,r25=r24>>2;continue}}HEAP8[r15+39|0]=0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r24=_newlocale(1,1896,0);HEAP32[3276]=r24}}while(0);if((__ZNSt3__110__sscanf_lEPKcPvS1_z(r13,HEAP32[3276],1808,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r7,tempInt))|0)!=1){HEAP32[r6>>2]=4}r24=HEAP32[r22],r25=r24>>2;do{if((r24|0)==0){r34=0}else{r20=HEAP32[r25+3];if((r20|0)==(HEAP32[r25+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r35=HEAP32[r20>>2]}if((r35|0)!=-1){r34=r24;break}HEAP32[r22]=0;r34=0}}while(0);r22=(r34|0)==0;r24=HEAP32[r23],r25=r24>>2;do{if((r24|0)==0){r2=336}else{r13=HEAP32[r25+3];if((r13|0)==(HEAP32[r25+4]|0)){r36=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r36=HEAP32[r13>>2]}if((r36|0)==-1){HEAP32[r23]=0;r2=336;break}if(!(r22^(r24|0)==0)){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);do{if(r2==336){if(r22){break}r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r37=r1|0,r38=r37>>2;HEAP32[r38]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcb(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=STACKTOP;STACKTOP=STACKTOP+48|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+16;r11=r7+24;r12=r7+32;if((HEAP32[r4+4>>2]&1|0)==0){r13=HEAP32[HEAP32[r2>>2]+24>>2];HEAP32[r10>>2]=HEAP32[r3>>2];FUNCTION_TABLE[r13](r1,r2,r10,r4,r5,r6&1);STACKTOP=r7;return}__ZNKSt3__18ios_base6getlocEv(r11,r4);r4=r11|0;r11=HEAP32[r4>>2];if((HEAP32[3520]|0)!=-1){HEAP32[r9]=14080;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r8,260)}r8=HEAP32[3521]-1|0;r9=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r9>>2>>>0>r8>>>0){r5=HEAP32[r9+(r8<<2)>>2];if((r5|0)==0){break}r10=r5;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r4>>2]|0);r2=HEAP32[r5>>2];if(r6){FUNCTION_TABLE[HEAP32[r2+24>>2]](r12,r10)}else{FUNCTION_TABLE[HEAP32[r2+28>>2]](r12,r10)}r10=r12;r2=r12;r5=HEAP8[r2];if((r5&1)==0){r13=r10+1|0;r14=r13;r15=r13;r16=r12+8|0}else{r13=r12+8|0;r14=HEAP32[r13>>2];r15=r10+1|0;r16=r13}r13=(r3|0)>>2;r10=r12+4|0;r17=r14;r18=r5;while(1){if((r18&1)==0){r19=r15}else{r19=HEAP32[r16>>2]}r5=r18&255;if((r17|0)==(r19+((r5&1|0)==0?r5>>>1:HEAP32[r10>>2])|0)){break}r5=HEAP8[r17];r20=HEAP32[r13];do{if((r20|0)!=0){r21=r20+24|0;r22=HEAP32[r21>>2];if((r22|0)!=(HEAP32[r20+28>>2]|0)){HEAP32[r21>>2]=r22+1;HEAP8[r22]=r5;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+52>>2]](r20,r5&255)|0)!=-1){break}HEAP32[r13]=0}}while(0);r17=r17+1|0;r18=HEAP8[r2]}HEAP32[r1>>2]=HEAP32[r13];__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9240,382)}function __ZNSt3__111__sprintf_lEPcPvPKcz(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vsprintf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+80;r13=r8+88;r14=r8+96;r15=r8+104;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=100}}while(0);r19=r10|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r18|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==32){r21=r7}else if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r10+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=403;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=403;break}r21=r10+2|0}else{r2=403}}while(0);if(r2==403){r21=r19}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r21,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+80|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+48;r12=r7+56;r13=r7+64;r14=r7+72;r15=r8|0;HEAP8[r15]=HEAP8[3200];HEAP8[r15+1|0]=HEAP8[3201|0];HEAP8[r15+2|0]=HEAP8[3202|0];HEAP8[r15+3|0]=HEAP8[3203|0];HEAP8[r15+4|0]=HEAP8[3204|0];HEAP8[r15+5|0]=HEAP8[3205|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r9|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=428;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=428;break}r21=r9+2|0}else if((r15|0)==32){r21=r6}else{r2=428}}while(0);if(r2==428){r21=r19}r2=r10|0;__ZNKSt3__18ios_base6getlocEv(r13,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r21,r6,r2,r11,r12,r13);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r13>>2]|0);HEAP32[r14>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,HEAP32[r11>>2],HEAP32[r12>>2],r4,r5);STACKTOP=r7;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+80;r13=r8+88;r14=r8+96;r15=r8+104;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r10|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r18|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r10+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=453;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=453;break}r21=r10+2|0}else if((r6|0)==32){r21=r7}else{r2=453}}while(0);if(r2==453){r21=r19}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r21,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r8=r6>>2;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r6,r10=r9>>2;r11=r6+16,r12=r11>>2;r13=r6+32;r14=r7|0;r7=HEAP32[r14>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r12]=14464;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r11,260)}r11=HEAP32[3617]-1|0;r12=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r12>>2>>>0<=r11>>>0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9240,382)}r7=HEAP32[r12+(r11<<2)>>2];if((r7|0)==0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9240,382)}r15=r7;r16=HEAP32[r14>>2];if((HEAP32[3520]|0)!=-1){HEAP32[r10]=14080;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r9,260)}r9=HEAP32[3521]-1|0;r10=HEAP32[r16+8>>2];if(HEAP32[r16+12>>2]-r10>>2>>>0<=r9>>>0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9240,382)}r16=HEAP32[r10+(r9<<2)>>2];if((r16|0)==0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9240,382)}r17=r16;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r13,r17);r18=r13;r9=r13;r10=HEAPU8[r9];if((r10&1|0)==0){r19=r10>>>1}else{r19=HEAP32[r13+4>>2]}do{if((r19|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](r15,r1,r3,r4);HEAP32[r8]=r4+(r3-r1)}else{HEAP32[r8]=r4;r10=HEAP8[r1];if(r10<<24>>24==45|r10<<24>>24==43){r14=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r15,r10);r10=HEAP32[r8];HEAP32[r8]=r10+1;HEAP8[r10]=r14;r20=r1+1|0}else{r20=r1}do{if((r3-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;break}r14=r20+1|0;r10=HEAP8[r14];if(!(r10<<24>>24==120|r10<<24>>24==88)){r21=r20;break}r10=r7;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,48);r12=HEAP32[r8];HEAP32[r8]=r12+1;HEAP8[r12]=r11;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,HEAP8[r14]);r14=HEAP32[r8];HEAP32[r8]=r14+1;HEAP8[r14]=r11;r21=r20+2|0}else{r21=r20}}while(0);do{if((r21|0)!=(r3|0)){r11=r3-1|0;if(r21>>>0<r11>>>0){r22=r21;r23=r11}else{break}while(1){r11=HEAP8[r22];HEAP8[r22]=HEAP8[r23];HEAP8[r23]=r11;r11=r22+1|0;r14=r23-1|0;if(r11>>>0<r14>>>0){r22=r11;r23=r14}else{break}}}}while(0);r14=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+16>>2]](r17);if(r21>>>0<r3>>>0){r11=r18+1|0;r10=r7;r12=r13+4|0;r24=r13+8|0;r25=0;r26=0;r27=r21;while(1){r28=(HEAP8[r9]&1)==0;do{if((HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)==0){r29=r26;r30=r25}else{if((r25|0)!=(HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)){r29=r26;r30=r25;break}r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r14;r31=HEAPU8[r9];r29=(r26>>>0<(((r31&1|0)==0?r31>>>1:HEAP32[r12>>2])-1|0)>>>0)+r26|0;r30=0}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,HEAP8[r27]);r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r28;r28=r27+1|0;if(r28>>>0<r3>>>0){r25=r30+1|0;r26=r29;r27=r28}else{break}}}r27=r4+(r21-r1)|0;r26=HEAP32[r8];if((r27|0)==(r26|0)){break}r25=r26-1|0;if(r27>>>0<r25>>>0){r32=r27;r33=r25}else{break}while(1){r25=HEAP8[r32];HEAP8[r32]=HEAP8[r33];HEAP8[r33]=r25;r25=r32+1|0;r27=r33-1|0;if(r25>>>0<r27>>>0){r32=r25;r33=r27}else{break}}}}while(0);if((r2|0)==(r3|0)){r34=HEAP32[r8];HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}else{r34=r4+(r2-r1)|0;HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+152|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+112;r14=r7+120;r15=r7+128;r16=r7+136;r17=r7+144;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){if((r8&1|0)==0){HEAP8[r22]=97;r23=0;break}else{HEAP8[r22]=65;r23=0;break}}else{HEAP8[r22]=46;r20=r22+2|0;HEAP8[r22+1|0]=42;if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r9=_newlocale(1,1896,0);HEAP32[3276]=r9}}while(0);r9=HEAP32[3276];if(r23){r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r24|0)>29){r9=(HEAP8[15024]|0)==0;if(r23){do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}r9=HEAP32[r11];if((r9|0)!=0){r26=r25;r27=r9;r28=r9;break}__ZSt17__throw_bad_allocv();r9=HEAP32[r11];r26=r25;r27=r9;r28=r9}else{r26=r24;r27=0;r28=HEAP32[r11]}}while(0);r24=r28+r26|0;r25=HEAP32[r19>>2]&176;do{if((r25|0)==32){r29=r24}else if((r25|0)==16){r19=HEAP8[r28];if(r19<<24>>24==45|r19<<24>>24==43){r29=r28+1|0;break}if(!((r26|0)>1&r19<<24>>24==48)){r2=561;break}r19=HEAP8[r28+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=561;break}r29=r28+2|0}else{r2=561}}while(0);if(r2==561){r29=r28}do{if((r28|0)==(r8|0)){r30=r12|0;r31=0;r32=r8}else{r2=_malloc(r26<<1);if((r2|0)!=0){r30=r2;r31=r2;r32=r28;break}__ZSt17__throw_bad_allocv();r30=0;r31=0;r32=HEAP32[r11]}}while(0);__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r32,r29,r24,r30,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r30,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r31|0)!=0){_free(r31)}if((r27|0)==0){STACKTOP=r7;return}_free(r27);STACKTOP=r7;return}function __ZNSt3__112__snprintf_lEPcjPvPKcz(r1,r2,r3,r4,r5){var r6,r7,r8;r6=STACKTOP;STACKTOP=STACKTOP+16|0;r7=r6;r8=r7;HEAP32[r8>>2]=r5;HEAP32[r8+4>>2]=0;r8=_uselocale(r3);r3=_vsnprintf(r1,r2,r4,r7|0);if((r8|0)==0){STACKTOP=r6;return r3}_uselocale(r8);STACKTOP=r6;return r3}function __ZNSt3__112__asprintf_lEPPcPvPKcz(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vasprintf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEce(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+152|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+112;r14=r7+120;r15=r7+128;r16=r7+136;r17=r7+144;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){HEAP8[r22]=76;r20=r22+1|0;if((r8&1|0)==0){HEAP8[r20]=97;r23=0;break}else{HEAP8[r20]=65;r23=0;break}}else{HEAP8[r22]=46;HEAP8[r22+1|0]=42;HEAP8[r22+2|0]=76;r20=r22+3|0;if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r9=_newlocale(1,1896,0);HEAP32[3276]=r9}}while(0);r9=HEAP32[3276];if(r23){r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r24|0)>29){r9=(HEAP8[15024]|0)==0;if(r23){do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}r9=HEAP32[r11];if((r9|0)!=0){r26=r25;r27=r9;r28=r9;break}__ZSt17__throw_bad_allocv();r9=HEAP32[r11];r26=r25;r27=r9;r28=r9}else{r26=r24;r27=0;r28=HEAP32[r11]}}while(0);r24=r28+r26|0;r25=HEAP32[r19>>2]&176;do{if((r25|0)==32){r29=r24}else if((r25|0)==16){r19=HEAP8[r28];if(r19<<24>>24==45|r19<<24>>24==43){r29=r28+1|0;break}if(!((r26|0)>1&r19<<24>>24==48)){r2=652;break}r19=HEAP8[r28+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=652;break}r29=r28+2|0}else{r2=652}}while(0);if(r2==652){r29=r28}do{if((r28|0)==(r8|0)){r30=r12|0;r31=0;r32=r8}else{r2=_malloc(r26<<1);if((r2|0)!=0){r30=r2;r31=r2;r32=r28;break}__ZSt17__throw_bad_allocv();r30=0;r31=0;r32=HEAP32[r11]}}while(0);__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r32,r29,r24,r30,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r30,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r31|0)!=0){_free(r31)}if((r27|0)==0){STACKTOP=r7;return}_free(r27);STACKTOP=r7;return}function __ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r8=r6>>2;r6=0;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9,r11=r10>>2;r12=r9+16,r13=r12>>2;r14=r9+32;r15=r7|0;r7=HEAP32[r15>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r13]=14464;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r12,260)}r12=HEAP32[3617]-1|0;r13=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r13>>2>>>0<=r12>>>0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9240,382)}r7=HEAP32[r13+(r12<<2)>>2],r12=r7>>2;if((r7|0)==0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9240,382)}r16=r7;r17=HEAP32[r15>>2];if((HEAP32[3520]|0)!=-1){HEAP32[r11]=14080;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r10,260)}r10=HEAP32[3521]-1|0;r11=HEAP32[r17+8>>2];if(HEAP32[r17+12>>2]-r11>>2>>>0<=r10>>>0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9240,382)}r17=HEAP32[r11+(r10<<2)>>2],r10=r17>>2;if((r17|0)==0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9240,382)}r18=r17;FUNCTION_TABLE[HEAP32[HEAP32[r10]+20>>2]](r14,r18);HEAP32[r8]=r4;r17=HEAP8[r1];if(r17<<24>>24==45|r17<<24>>24==43){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12]+28>>2]](r16,r17);r17=HEAP32[r8];HEAP32[r8]=r17+1;HEAP8[r17]=r19;r20=r1+1|0}else{r20=r1}r19=r3;L817:do{if((r19-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;r6=707;break}r17=r20+1|0;r11=HEAP8[r17];if(!(r11<<24>>24==120|r11<<24>>24==88)){r21=r20;r6=707;break}r11=r7;r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,48);r13=HEAP32[r8];HEAP32[r8]=r13+1;HEAP8[r13]=r15;r15=r20+2|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,HEAP8[r17]);r17=HEAP32[r8];HEAP32[r8]=r17+1;HEAP8[r17]=r13;r13=r15;while(1){if(r13>>>0>=r3>>>0){r22=r13;r23=r15;break L817}r17=HEAP8[r13];do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r11=_newlocale(1,1896,0);HEAP32[3276]=r11}}while(0);if((_isxdigit(r17<<24>>24,HEAP32[3276])|0)==0){r22=r13;r23=r15;break}else{r13=r13+1|0}}}else{r21=r20;r6=707}}while(0);L832:do{if(r6==707){while(1){r6=0;if(r21>>>0>=r3>>>0){r22=r21;r23=r20;break L832}r13=HEAP8[r21];do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r15=_newlocale(1,1896,0);HEAP32[3276]=r15}}while(0);if((_isdigit(r13<<24>>24,HEAP32[3276])|0)==0){r22=r21;r23=r20;break}else{r21=r21+1|0;r6=707}}}}while(0);r6=r14;r21=r14;r20=HEAPU8[r21];if((r20&1|0)==0){r24=r20>>>1}else{r24=HEAP32[r14+4>>2]}do{if((r24|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r12]+32>>2]](r16,r23,r22,HEAP32[r8]);HEAP32[r8]=HEAP32[r8]+(r22-r23)}else{do{if((r23|0)!=(r22|0)){r20=r22-1|0;if(r23>>>0<r20>>>0){r25=r23;r26=r20}else{break}while(1){r20=HEAP8[r25];HEAP8[r25]=HEAP8[r26];HEAP8[r26]=r20;r20=r25+1|0;r17=r26-1|0;if(r20>>>0<r17>>>0){r25=r20;r26=r17}else{break}}}}while(0);r13=FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r18);if(r23>>>0<r22>>>0){r17=r6+1|0;r20=r14+4|0;r15=r14+8|0;r11=r7;r27=0;r28=0;r29=r23;while(1){r30=(HEAP8[r21]&1)==0;do{if((HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)>0){if((r27|0)!=(HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)){r31=r28;r32=r27;break}r33=HEAP32[r8];HEAP32[r8]=r33+1;HEAP8[r33]=r13;r33=HEAPU8[r21];r31=(r28>>>0<(((r33&1|0)==0?r33>>>1:HEAP32[r20>>2])-1|0)>>>0)+r28|0;r32=0}else{r31=r28;r32=r27}}while(0);r30=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,HEAP8[r29]);r33=HEAP32[r8];HEAP32[r8]=r33+1;HEAP8[r33]=r30;r30=r29+1|0;if(r30>>>0<r22>>>0){r27=r32+1|0;r28=r31;r29=r30}else{break}}}r29=r4+(r23-r1)|0;r28=HEAP32[r8];if((r29|0)==(r28|0)){break}r27=r28-1|0;if(r29>>>0<r27>>>0){r34=r29;r35=r27}else{break}while(1){r27=HEAP8[r34];HEAP8[r34]=HEAP8[r35];HEAP8[r35]=r27;r27=r34+1|0;r29=r35-1|0;if(r27>>>0<r29>>>0){r34=r27;r35=r29}else{break}}}}while(0);L871:do{if(r22>>>0<r3>>>0){r35=r7;r34=r22;while(1){r23=HEAP8[r34];if(r23<<24>>24==46){break}r31=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+28>>2]](r16,r23);r23=HEAP32[r8];HEAP32[r8]=r23+1;HEAP8[r23]=r31;r31=r34+1|0;if(r31>>>0<r3>>>0){r34=r31}else{r36=r31;break L871}}r35=FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](r18);r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r35;r36=r34+1|0}else{r36=r22}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r12]+32>>2]](r16,r36,r3,HEAP32[r8]);r16=HEAP32[r8]+(r19-r36)|0;HEAP32[r8]=r16;if((r2|0)==(r3|0)){r37=r16;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}r37=r4+(r2-r1)|0;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}function __ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwl(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+144|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+112;r12=r7+120;r13=r7+128;r14=r7+136;r15=r8|0;HEAP8[r15]=HEAP8[3200];HEAP8[r15+1|0]=HEAP8[3201|0];HEAP8[r15+2|0]=HEAP8[3202|0];HEAP8[r15+3|0]=HEAP8[3203|0];HEAP8[r15+4|0]=HEAP8[3204|0];HEAP8[r15+5|0]=HEAP8[3205|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=100}}while(0);r19=r9|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==32){r21=r6}else if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=775;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=775;break}r21=r9+2|0}else{r2=775}}while(0);if(r2==775){r21=r19}r2=r10|0;__ZNKSt3__18ios_base6getlocEv(r13,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r21,r6,r2,r11,r12,r13);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r13>>2]|0);HEAP32[r14>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,HEAP32[r11>>2],HEAP32[r12>>2],r4,r5);STACKTOP=r7;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPKv(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+104|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+24;r11=r7+48;r12=r7+88;r13=r7+96;r14=r7+16|0;HEAP8[r14]=HEAP8[3208];HEAP8[r14+1|0]=HEAP8[3209|0];HEAP8[r14+2|0]=HEAP8[3210|0];HEAP8[r14+3|0]=HEAP8[3211|0];HEAP8[r14+4|0]=HEAP8[3212|0];HEAP8[r14+5|0]=HEAP8[3213|0];r15=r10|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r16=_newlocale(1,1896,0);HEAP32[3276]=r16}}while(0);r16=__ZNSt3__111__sprintf_lEPcPvPKcz(r15,HEAP32[3276],r14,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r10+r16|0;r14=HEAP32[r4+4>>2]&176;do{if((r14|0)==16){r17=HEAP8[r15];if(r17<<24>>24==45|r17<<24>>24==43){r18=r10+1|0;break}if(!((r16|0)>1&r17<<24>>24==48)){r2=790;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=790;break}r18=r10+2|0}else if((r14|0)==32){r18=r6}else{r2=790}}while(0);if(r2==790){r18=r15}__ZNKSt3__18ios_base6getlocEv(r12,r4);r2=r12|0;r12=HEAP32[r2>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r9]=14464;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r8,260)}r8=HEAP32[3617]-1|0;r9=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r9>>2>>>0>r8>>>0){r14=HEAP32[r9+(r8<<2)>>2];if((r14|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2>>2]|0);r17=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+32>>2]](r14,r15,r6,r17);r14=r11+r16|0;if((r18|0)==(r6|0)){r19=r14;r20=r3|0;r21=HEAP32[r20>>2];r22=r13|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r13,r17,r19,r14,r4,r5);STACKTOP=r7;return}r19=r11+(r18-r10)|0;r20=r3|0;r21=HEAP32[r20>>2];r22=r13|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r13,r17,r19,r14,r4,r5);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9240,382)}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwb(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r7=STACKTOP;STACKTOP=STACKTOP+48|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+16;r11=r7+24;r12=r7+32;if((HEAP32[r4+4>>2]&1|0)==0){r13=HEAP32[HEAP32[r2>>2]+24>>2];HEAP32[r10>>2]=HEAP32[r3>>2];FUNCTION_TABLE[r13](r1,r2,r10,r4,r5,r6&1);STACKTOP=r7;return}__ZNKSt3__18ios_base6getlocEv(r11,r4);r4=r11|0;r11=HEAP32[r4>>2];if((HEAP32[3518]|0)!=-1){HEAP32[r9]=14072;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r8,260)}r8=HEAP32[3519]-1|0;r9=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r9>>2>>>0>r8>>>0){r5=HEAP32[r9+(r8<<2)>>2];if((r5|0)==0){break}r10=r5;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r4>>2]|0);r2=HEAP32[r5>>2];if(r6){FUNCTION_TABLE[HEAP32[r2+24>>2]](r12,r10)}else{FUNCTION_TABLE[HEAP32[r2+28>>2]](r12,r10)}r10=r12;r2=HEAP8[r10];if((r2&1)==0){r5=r12+4|0;r14=r5;r15=r5;r16=r12+8|0}else{r5=r12+8|0;r14=HEAP32[r5>>2];r15=r12+4|0;r16=r5}r5=(r3|0)>>2;r13=r14;r17=r2;while(1){if((r17&1)==0){r18=r15}else{r18=HEAP32[r16>>2]}r2=r17&255;if((r2&1|0)==0){r19=r2>>>1}else{r19=HEAP32[r15>>2]}if((r13|0)==((r19<<2)+r18|0)){break}r2=HEAP32[r13>>2];r20=HEAP32[r5];do{if((r20|0)!=0){r21=r20+24|0;r22=HEAP32[r21>>2];if((r22|0)==(HEAP32[r20+28>>2]|0)){r23=FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+52>>2]](r20,r2)}else{HEAP32[r21>>2]=r22+4;HEAP32[r22>>2]=r2;r23=r2}if((r23|0)!=-1){break}HEAP32[r5]=0}}while(0);r13=r13+4|0;r17=HEAP8[r10]}HEAP32[r1>>2]=HEAP32[r5];__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r12);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9240,382)}function __ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r8=r6>>2;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r6,r10=r9>>2;r11=r6+16,r12=r11>>2;r13=r6+32;r14=r7|0;r7=HEAP32[r14>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r12]=14456;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r11,260)}r11=HEAP32[3615]-1|0;r12=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r12>>2>>>0<=r11>>>0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9240,382)}r7=HEAP32[r12+(r11<<2)>>2];if((r7|0)==0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9240,382)}r15=r7;r16=HEAP32[r14>>2];if((HEAP32[3518]|0)!=-1){HEAP32[r10]=14072;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r9,260)}r9=HEAP32[3519]-1|0;r10=HEAP32[r16+8>>2];if(HEAP32[r16+12>>2]-r10>>2>>>0<=r9>>>0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9240,382)}r16=HEAP32[r10+(r9<<2)>>2];if((r16|0)==0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9240,382)}r17=r16;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r13,r17);r18=r13;r9=r13;r10=HEAPU8[r9];if((r10&1|0)==0){r19=r10>>>1}else{r19=HEAP32[r13+4>>2]}do{if((r19|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+48>>2]](r15,r1,r3,r4);HEAP32[r8]=(r3-r1<<2)+r4}else{HEAP32[r8]=r4;r10=HEAP8[r1];if(r10<<24>>24==45|r10<<24>>24==43){r14=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+44>>2]](r15,r10);r10=HEAP32[r8];HEAP32[r8]=r10+4;HEAP32[r10>>2]=r14;r20=r1+1|0}else{r20=r1}do{if((r3-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;break}r14=r20+1|0;r10=HEAP8[r14];if(!(r10<<24>>24==120|r10<<24>>24==88)){r21=r20;break}r10=r7;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,48);r12=HEAP32[r8];HEAP32[r8]=r12+4;HEAP32[r12>>2]=r11;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,HEAP8[r14]);r14=HEAP32[r8];HEAP32[r8]=r14+4;HEAP32[r14>>2]=r11;r21=r20+2|0}else{r21=r20}}while(0);do{if((r21|0)!=(r3|0)){r11=r3-1|0;if(r21>>>0<r11>>>0){r22=r21;r23=r11}else{break}while(1){r11=HEAP8[r22];HEAP8[r22]=HEAP8[r23];HEAP8[r23]=r11;r11=r22+1|0;r14=r23-1|0;if(r11>>>0<r14>>>0){r22=r11;r23=r14}else{break}}}}while(0);r14=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+16>>2]](r17);if(r21>>>0<r3>>>0){r11=r18+1|0;r10=r7;r12=r13+4|0;r24=r13+8|0;r25=0;r26=0;r27=r21;while(1){r28=(HEAP8[r9]&1)==0;do{if((HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)==0){r29=r26;r30=r25}else{if((r25|0)!=(HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)){r29=r26;r30=r25;break}r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r14;r31=HEAPU8[r9];r29=(r26>>>0<(((r31&1|0)==0?r31>>>1:HEAP32[r12>>2])-1|0)>>>0)+r26|0;r30=0}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,HEAP8[r27]);r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r28;r28=r27+1|0;if(r28>>>0<r3>>>0){r25=r30+1|0;r26=r29;r27=r28}else{break}}}r27=(r21-r1<<2)+r4|0;r26=HEAP32[r8];if((r27|0)==(r26|0)){break}r25=r26-4|0;if(r27>>>0<r25>>>0){r32=r27;r33=r25}else{break}while(1){r25=HEAP32[r32>>2];HEAP32[r32>>2]=HEAP32[r33>>2];HEAP32[r33>>2]=r25;r25=r32+4|0;r27=r33-4|0;if(r25>>>0<r27>>>0){r32=r25;r33=r27}else{break}}}}while(0);if((r2|0)==(r3|0)){r34=HEAP32[r8];HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}else{r34=(r2-r1<<2)+r4|0;HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}}function __ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16;r8=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r9>>2];r9=r1;r10=(r2|0)>>2;r2=HEAP32[r10],r11=r2>>2;if((r2|0)==0){HEAP32[r8]=0;STACKTOP=r1;return}r12=r5;r5=r3;r13=r12-r5>>2;r14=r6+12|0;r6=HEAP32[r14>>2];r15=(r6|0)>(r13|0)?r6-r13|0:0;r13=r4;r6=r13-r5|0;r5=r6>>2;do{if((r6|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r3,r5)|0)==(r5|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);do{if((r15|0)>0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r9,r15,r7);if((HEAP8[r9]&1)==0){r16=r9+4|0}else{r16=HEAP32[r9+8>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r16,r15)|0)==(r15|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r9);break}HEAP32[r10]=0;HEAP32[r8]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r9);STACKTOP=r1;return}}while(0);r9=r12-r13|0;r13=r9>>2;do{if((r9|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r4,r13)|0)==(r13|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);HEAP32[r14>>2]=0;HEAP32[r8]=r2;STACKTOP=r1;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+232|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+200;r13=r8+208;r14=r8+216;r15=r8+224;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else if((r20|0)==64){HEAP8[r19]=111}else{HEAP8[r19]=100}}while(0);r19=r10|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r20=_newlocale(1,1896,0);HEAP32[3276]=r20}}while(0);r20=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r20|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r10+1|0;break}if(!((r20|0)>1&r17<<24>>24==48)){r2=935;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=935;break}r21=r10+2|0}else if((r6|0)==32){r21=r7}else{r2=935}}while(0);if(r2==935){r21=r19}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r21,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+144|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+112;r12=r7+120;r13=r7+128;r14=r7+136;r15=r8|0;HEAP8[r15]=HEAP8[3200];HEAP8[r15+1|0]=HEAP8[3201|0];HEAP8[r15+2|0]=HEAP8[3202|0];HEAP8[r15+3|0]=HEAP8[3203|0];HEAP8[r15+4|0]=HEAP8[3204|0];HEAP8[r15+5|0]=HEAP8[3205|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r9|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==32){r21=r6}else if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=960;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=960;break}r21=r9+2|0}else{r2=960}}while(0);if(r2==960){r21=r19}r2=r10|0;__ZNKSt3__18ios_base6getlocEv(r13,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r21,r6,r2,r11,r12,r13);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r13>>2]|0);HEAP32[r14>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,HEAP32[r11>>2],HEAP32[r12>>2],r4,r5);STACKTOP=r7;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+240|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+208;r13=r8+216;r14=r8+224;r15=r8+232;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r10|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r18=_newlocale(1,1896,0);HEAP32[3276]=r18}}while(0);r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,HEAP32[3276],r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r18|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r21=r10+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=985;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=985;break}r21=r10+2|0}else if((r6|0)==32){r21=r7}else{r2=985}}while(0);if(r2==985){r21=r19}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r21,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+320|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+280;r14=r7+288;r15=r7+296;r16=r7+304;r17=r7+312;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){if((r8&1|0)==0){HEAP8[r22]=97;r23=0;break}else{HEAP8[r22]=65;r23=0;break}}else{HEAP8[r22]=46;r20=r22+2|0;HEAP8[r22+1|0]=42;if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r9=_newlocale(1,1896,0);HEAP32[3276]=r9}}while(0);r9=HEAP32[3276];if(r23){r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r24|0)>29){r9=(HEAP8[15024]|0)==0;if(r23){do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}r9=HEAP32[r11];if((r9|0)!=0){r26=r25;r27=r9;r28=r9;break}__ZSt17__throw_bad_allocv();r9=HEAP32[r11];r26=r25;r27=r9;r28=r9}else{r26=r24;r27=0;r28=HEAP32[r11]}}while(0);r24=r28+r26|0;r25=HEAP32[r19>>2]&176;do{if((r25|0)==16){r19=HEAP8[r28];if(r19<<24>>24==45|r19<<24>>24==43){r29=r28+1|0;break}if(!((r26|0)>1&r19<<24>>24==48)){r2=1041;break}r19=HEAP8[r28+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=1041;break}r29=r28+2|0}else if((r25|0)==32){r29=r24}else{r2=1041}}while(0);if(r2==1041){r29=r28}do{if((r28|0)==(r8|0)){r30=r12|0;r31=0;r32=r8}else{r2=_malloc(r26<<3);r25=r2;if((r2|0)!=0){r30=r25;r31=r25;r32=r28;break}__ZSt17__throw_bad_allocv();r30=r25;r31=r25;r32=HEAP32[r11]}}while(0);__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r32,r29,r24,r30,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r30,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r31|0)!=0){_free(r31)}if((r27|0)==0){STACKTOP=r7;return}_free(r27);STACKTOP=r7;return}function __ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r8=r6>>2;r6=0;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9,r11=r10>>2;r12=r9+16,r13=r12>>2;r14=r9+32;r15=r7|0;r7=HEAP32[r15>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r13]=14456;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r12,260)}r12=HEAP32[3615]-1|0;r13=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r13>>2>>>0<=r12>>>0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9240,382)}r7=HEAP32[r13+(r12<<2)>>2],r12=r7>>2;if((r7|0)==0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9240,382)}r16=r7;r17=HEAP32[r15>>2];if((HEAP32[3518]|0)!=-1){HEAP32[r11]=14072;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r10,260)}r10=HEAP32[3519]-1|0;r11=HEAP32[r17+8>>2];if(HEAP32[r17+12>>2]-r11>>2>>>0<=r10>>>0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9240,382)}r17=HEAP32[r11+(r10<<2)>>2],r10=r17>>2;if((r17|0)==0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9240,382)}r18=r17;FUNCTION_TABLE[HEAP32[HEAP32[r10]+20>>2]](r14,r18);HEAP32[r8]=r4;r17=HEAP8[r1];if(r17<<24>>24==45|r17<<24>>24==43){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12]+44>>2]](r16,r17);r17=HEAP32[r8];HEAP32[r8]=r17+4;HEAP32[r17>>2]=r19;r20=r1+1|0}else{r20=r1}r19=r3;L1275:do{if((r19-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;r6=1096;break}r17=r20+1|0;r11=HEAP8[r17];if(!(r11<<24>>24==120|r11<<24>>24==88)){r21=r20;r6=1096;break}r11=r7;r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,48);r13=HEAP32[r8];HEAP32[r8]=r13+4;HEAP32[r13>>2]=r15;r15=r20+2|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,HEAP8[r17]);r17=HEAP32[r8];HEAP32[r8]=r17+4;HEAP32[r17>>2]=r13;r13=r15;while(1){if(r13>>>0>=r3>>>0){r22=r13;r23=r15;break L1275}r17=HEAP8[r13];do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r11=_newlocale(1,1896,0);HEAP32[3276]=r11}}while(0);if((_isxdigit(r17<<24>>24,HEAP32[3276])|0)==0){r22=r13;r23=r15;break}else{r13=r13+1|0}}}else{r21=r20;r6=1096}}while(0);L1290:do{if(r6==1096){while(1){r6=0;if(r21>>>0>=r3>>>0){r22=r21;r23=r20;break L1290}r13=HEAP8[r21];do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r15=_newlocale(1,1896,0);HEAP32[3276]=r15}}while(0);if((_isdigit(r13<<24>>24,HEAP32[3276])|0)==0){r22=r21;r23=r20;break}else{r21=r21+1|0;r6=1096}}}}while(0);r6=r14;r21=r14;r20=HEAPU8[r21];if((r20&1|0)==0){r24=r20>>>1}else{r24=HEAP32[r14+4>>2]}do{if((r24|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r16,r23,r22,HEAP32[r8]);HEAP32[r8]=(r22-r23<<2)+HEAP32[r8]}else{do{if((r23|0)!=(r22|0)){r20=r22-1|0;if(r23>>>0<r20>>>0){r25=r23;r26=r20}else{break}while(1){r20=HEAP8[r25];HEAP8[r25]=HEAP8[r26];HEAP8[r26]=r20;r20=r25+1|0;r17=r26-1|0;if(r20>>>0<r17>>>0){r25=r20;r26=r17}else{break}}}}while(0);r13=FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r18);if(r23>>>0<r22>>>0){r17=r6+1|0;r20=r14+4|0;r15=r14+8|0;r11=r7;r27=0;r28=0;r29=r23;while(1){r30=(HEAP8[r21]&1)==0;do{if((HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)>0){if((r27|0)!=(HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)){r31=r28;r32=r27;break}r33=HEAP32[r8];HEAP32[r8]=r33+4;HEAP32[r33>>2]=r13;r33=HEAPU8[r21];r31=(r28>>>0<(((r33&1|0)==0?r33>>>1:HEAP32[r20>>2])-1|0)>>>0)+r28|0;r32=0}else{r31=r28;r32=r27}}while(0);r30=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,HEAP8[r29]);r33=HEAP32[r8];HEAP32[r8]=r33+4;HEAP32[r33>>2]=r30;r30=r29+1|0;if(r30>>>0<r22>>>0){r27=r32+1|0;r28=r31;r29=r30}else{break}}}r29=(r23-r1<<2)+r4|0;r28=HEAP32[r8];if((r29|0)==(r28|0)){break}r27=r28-4|0;if(r29>>>0<r27>>>0){r34=r29;r35=r27}else{break}while(1){r27=HEAP32[r34>>2];HEAP32[r34>>2]=HEAP32[r35>>2];HEAP32[r35>>2]=r27;r27=r34+4|0;r29=r35-4|0;if(r27>>>0<r29>>>0){r34=r27;r35=r29}else{break}}}}while(0);L1329:do{if(r22>>>0<r3>>>0){r35=r7;r34=r22;while(1){r23=HEAP8[r34];if(r23<<24>>24==46){break}r31=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+44>>2]](r16,r23);r23=HEAP32[r8];HEAP32[r8]=r23+4;HEAP32[r23>>2]=r31;r31=r34+1|0;if(r31>>>0<r3>>>0){r34=r31}else{r36=r31;break L1329}}r35=FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](r18);r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r35;r36=r34+1|0}else{r36=r22}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r16,r36,r3,HEAP32[r8]);r16=(r19-r36<<2)+HEAP32[r8]|0;HEAP32[r8]=r16;if((r2|0)==(r3|0)){r37=r16;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}r37=(r2-r1<<2)+r4|0;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwe(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+320|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+280;r14=r7+288;r15=r7+296;r16=r7+304;r17=r7+312;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){HEAP8[r22]=76;r20=r22+1|0;if((r8&1|0)==0){HEAP8[r20]=97;r23=0;break}else{HEAP8[r20]=65;r23=0;break}}else{HEAP8[r22]=46;HEAP8[r22+1|0]=42;HEAP8[r22+2|0]=76;r20=r22+3|0;if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r9=_newlocale(1,1896,0);HEAP32[3276]=r9}}while(0);r9=HEAP32[3276];if(r23){r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r24=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r9,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r24|0)>29){r9=(HEAP8[15024]|0)==0;if(r23){do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{do{if(r9){if((___cxa_guard_acquire(15024)|0)==0){break}r21=_newlocale(1,1896,0);HEAP32[3276]=r21}}while(0);r25=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}r9=HEAP32[r11];if((r9|0)!=0){r26=r25;r27=r9;r28=r9;break}__ZSt17__throw_bad_allocv();r9=HEAP32[r11];r26=r25;r27=r9;r28=r9}else{r26=r24;r27=0;r28=HEAP32[r11]}}while(0);r24=r28+r26|0;r25=HEAP32[r19>>2]&176;do{if((r25|0)==32){r29=r24}else if((r25|0)==16){r19=HEAP8[r28];if(r19<<24>>24==45|r19<<24>>24==43){r29=r28+1|0;break}if(!((r26|0)>1&r19<<24>>24==48)){r2=1193;break}r19=HEAP8[r28+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=1193;break}r29=r28+2|0}else{r2=1193}}while(0);if(r2==1193){r29=r28}do{if((r28|0)==(r8|0)){r30=r12|0;r31=0;r32=r8}else{r2=_malloc(r26<<3);r25=r2;if((r2|0)!=0){r30=r25;r31=r25;r32=r28;break}__ZSt17__throw_bad_allocv();r30=r25;r31=r25;r32=HEAP32[r11]}}while(0);__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r32,r29,r24,r30,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r30,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r31|0)!=0){_free(r31)}if((r27|0)==0){STACKTOP=r7;return}_free(r27);STACKTOP=r7;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPKv(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+216|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+24;r11=r7+48;r12=r7+200;r13=r7+208;r14=r7+16|0;HEAP8[r14]=HEAP8[3208];HEAP8[r14+1|0]=HEAP8[3209|0];HEAP8[r14+2|0]=HEAP8[3210|0];HEAP8[r14+3|0]=HEAP8[3211|0];HEAP8[r14+4|0]=HEAP8[3212|0];HEAP8[r14+5|0]=HEAP8[3213|0];r15=r10|0;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r16=_newlocale(1,1896,0);HEAP32[3276]=r16}}while(0);r16=__ZNSt3__111__sprintf_lEPcPvPKcz(r15,HEAP32[3276],r14,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r10+r16|0;r14=HEAP32[r4+4>>2]&176;do{if((r14|0)==16){r17=HEAP8[r15];if(r17<<24>>24==45|r17<<24>>24==43){r18=r10+1|0;break}if(!((r16|0)>1&r17<<24>>24==48)){r2=1226;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=1226;break}r18=r10+2|0}else if((r14|0)==32){r18=r6}else{r2=1226}}while(0);if(r2==1226){r18=r15}__ZNKSt3__18ios_base6getlocEv(r12,r4);r2=r12|0;r12=HEAP32[r2>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r9]=14456;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r8,260)}r8=HEAP32[3615]-1|0;r9=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r9>>2>>>0>r8>>>0){r14=HEAP32[r9+(r8<<2)>>2];if((r14|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2>>2]|0);r17=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+48>>2]](r14,r15,r6,r17);r14=(r16<<2)+r11|0;if((r18|0)==(r6|0)){r19=r14;r20=r3|0;r21=HEAP32[r20>>2];r22=r13|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r13,r17,r19,r14,r4,r5);STACKTOP=r7;return}r19=(r18-r10<<2)+r11|0;r20=r3|0;r21=HEAP32[r20>>2];r22=r13|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r13,r17,r19,r14,r4,r5);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9240,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13do_date_orderEv(r1){return 2}function __ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r9,r10,r5,r6,r7,3192,3200);STACKTOP=r8;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r2+8|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11);HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];r4=r12;r3=HEAP8[r12];if((r3&1)==0){r13=r4+1|0;r14=r4+1|0}else{r4=HEAP32[r12+8>>2];r13=r4;r14=r4}r4=r3&255;if((r4&1|0)==0){r15=r4>>>1}else{r15=HEAP32[r12+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r9,r10,r5,r6,r7,r14,r13+r15|0);STACKTOP=r8;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r10=r6>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+48|0;r13=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r13>>2];r13=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r13>>2];r13=r12,r14=r13>>2;r15=r12+16;r16=r12+24;r17=r12+32;r18=r12+40;__ZNKSt3__18ios_base6getlocEv(r15,r5);r19=r15|0;r15=HEAP32[r19>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r14]=14464;HEAP32[r14+1]=26;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r13,260)}r13=HEAP32[3617]-1|0;r14=HEAP32[r15+8>>2];do{if(HEAP32[r15+12>>2]-r14>>2>>>0>r13>>>0){r20=HEAP32[r14+(r13<<2)>>2];if((r20|0)==0){break}r21=r20;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r19>>2]|0);HEAP32[r10]=0;r22=(r3|0)>>2;L1472:do{if((r8|0)==(r9|0)){r11=1316}else{r23=(r4|0)>>2;r24=r20>>2;r25=r20+8|0;r26=r20;r27=r2;r28=r17|0;r29=r18|0;r30=r16|0;r31=r8;r32=0;L1474:while(1){r33=r32;while(1){if((r33|0)!=0){r11=1316;break L1472}r34=HEAP32[r22],r35=r34>>2;do{if((r34|0)==0){r36=0}else{if((HEAP32[r35+3]|0)!=(HEAP32[r35+4]|0)){r36=r34;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r34)|0)!=-1){r36=r34;break}HEAP32[r22]=0;r36=0}}while(0);r34=(r36|0)==0;r35=HEAP32[r23],r37=r35>>2;L1484:do{if((r35|0)==0){r11=1269}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r35)|0)!=-1){break}HEAP32[r23]=0;r11=1269;break L1484}}while(0);if(r34){r38=r35}else{r11=1270;break L1474}}}while(0);if(r11==1269){r11=0;if(r34){r11=1270;break L1474}else{r38=0}}if(FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r21,HEAP8[r31],0)<<24>>24==37){r11=1273;break}r35=HEAP8[r31];if(r35<<24>>24>-1){r39=HEAP32[r25>>2];if((HEAP16[r39+(r35<<24>>24<<1)>>1]&8192)!=0){r40=r31;r11=1284;break}}r41=(r36+12|0)>>2;r35=HEAP32[r41];r42=r36+16|0;if((r35|0)==(HEAP32[r42>>2]|0)){r43=FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+36>>2]](r36)&255}else{r43=HEAP8[r35]}if(FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+12>>2]](r21,r43)<<24>>24==FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+12>>2]](r21,HEAP8[r31])<<24>>24){r11=1311;break}HEAP32[r10]=4;r33=4}L1502:do{if(r11==1273){r11=0;r33=r31+1|0;if((r33|0)==(r9|0)){r11=1274;break L1474}r35=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r21,HEAP8[r33],0);if(r35<<24>>24==69|r35<<24>>24==48){r37=r31+2|0;if((r37|0)==(r9|0)){r11=1277;break L1474}r44=r35;r45=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r21,HEAP8[r37],0);r46=r37}else{r44=0;r45=r35;r46=r33}r33=HEAP32[HEAP32[r27>>2]+36>>2];HEAP32[r28>>2]=r36;HEAP32[r29>>2]=r38;FUNCTION_TABLE[r33](r16,r2,r17,r18,r5,r6,r7,r45,r44);HEAP32[r22]=HEAP32[r30>>2];r47=r46+1|0}else if(r11==1311){r11=0;r33=HEAP32[r41];if((r33|0)==(HEAP32[r42>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+40>>2]](r36)}else{HEAP32[r41]=r33+1}r47=r31+1|0}else if(r11==1284){while(1){r11=0;r33=r40+1|0;if((r33|0)==(r9|0)){r48=r9;break}r35=HEAP8[r33];if(r35<<24>>24<=-1){r48=r33;break}if((HEAP16[r39+(r35<<24>>24<<1)>>1]&8192)==0){r48=r33;break}else{r40=r33;r11=1284}}r34=r36,r33=r34>>2;r35=r38,r37=r35>>2;while(1){do{if((r34|0)==0){r49=0}else{if((HEAP32[r33+3]|0)!=(HEAP32[r33+4]|0)){r49=r34;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r34)|0)!=-1){r49=r34;break}HEAP32[r22]=0;r49=0}}while(0);r50=(r49|0)==0;do{if((r35|0)==0){r11=1297}else{if((HEAP32[r37+3]|0)!=(HEAP32[r37+4]|0)){if(r50){r51=r35;break}else{r47=r48;break L1502}}if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r35)|0)==-1){HEAP32[r23]=0;r11=1297;break}else{if(r50^(r35|0)==0){r51=r35;break}else{r47=r48;break L1502}}}}while(0);if(r11==1297){r11=0;if(r50){r47=r48;break L1502}else{r51=0}}r52=(r49+12|0)>>2;r53=HEAP32[r52];r54=r49+16|0;if((r53|0)==(HEAP32[r54>>2]|0)){r55=FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+36>>2]](r49)&255}else{r55=HEAP8[r53]}if(r55<<24>>24<=-1){r47=r48;break L1502}if((HEAP16[HEAP32[r25>>2]+(r55<<24>>24<<1)>>1]&8192)==0){r47=r48;break L1502}r53=HEAP32[r52];if((r53|0)==(HEAP32[r54>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+40>>2]](r49);r34=r49,r33=r34>>2;r35=r51,r37=r35>>2;continue}else{HEAP32[r52]=r53+1;r34=r49,r33=r34>>2;r35=r51,r37=r35>>2;continue}}}}while(0);if((r47|0)==(r9|0)){r11=1316;break L1472}r31=r47;r32=HEAP32[r10]}if(r11==1277){HEAP32[r10]=4;r56=r36,r57=r56>>2;break}else if(r11==1274){HEAP32[r10]=4;r56=r36,r57=r56>>2;break}else if(r11==1270){HEAP32[r10]=4;r56=r36,r57=r56>>2;break}}}while(0);if(r11==1316){r56=HEAP32[r22],r57=r56>>2}r21=r3|0;do{if((r56|0)!=0){if((HEAP32[r57+3]|0)!=(HEAP32[r57+4]|0)){break}if((FUNCTION_TABLE[HEAP32[HEAP32[r57]+36>>2]](r56)|0)!=-1){break}HEAP32[r21>>2]=0}}while(0);r22=HEAP32[r21>>2];r20=(r22|0)==0;r32=r4|0;r31=HEAP32[r32>>2],r25=r31>>2;L1560:do{if((r31|0)==0){r11=1326}else{do{if((HEAP32[r25+3]|0)==(HEAP32[r25+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r31)|0)!=-1){break}HEAP32[r32>>2]=0;r11=1326;break L1560}}while(0);if(!r20){break}r58=r1|0,r59=r58>>2;HEAP32[r59]=r22;STACKTOP=r12;return}}while(0);do{if(r11==1326){if(r20){break}r58=r1|0,r59=r58>>2;HEAP32[r59]=r22;STACKTOP=r12;return}}while(0);HEAP32[r10]=HEAP32[r10]|2;r58=r1|0,r59=r58>>2;HEAP32[r59]=r22;STACKTOP=r12;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9240,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r11]=14464;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r10,260)}r10=HEAP32[3617]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+168|0,r13,r6,0)-r16|0;if((r14|0)>=168){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+24>>2]=((r14|0)/12&-1|0)%7&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r11]=14464;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r10,260)}r10=HEAP32[3617]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+4>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+288|0,r13,r6,0)-r16|0;if((r14|0)>=288){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+16>>2]=((r14|0)/12&-1|0)%12&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r2;r9=r2+8,r10=r9>>2;r11=r2+24;__ZNKSt3__18ios_base6getlocEv(r11,r5);r5=r11|0;r11=HEAP32[r5>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r10]=14464;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r9,260)}r9=HEAP32[3617]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);HEAP32[r8>>2]=HEAP32[r4>>2];r13=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r8,r6,r12,4);if((HEAP32[r6>>2]&4|0)!=0){r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}if((r13|0)<69){r17=r13+2e3|0}else{r17=(r13-69|0)>>>0<31?r13+1900|0:r13}HEAP32[r7+20>>2]=r17-1900;r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r2);___cxa_throw(r2,9240,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r1=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=(r3|0)>>2;r3=r5+8|0;L1618:while(1){r5=HEAP32[r7],r8=r5>>2;do{if((r5|0)==0){r9=0}else{if((HEAP32[r8+3]|0)!=(HEAP32[r8+4]|0)){r9=r5;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r5)|0)==-1){HEAP32[r7]=0;r9=0;break}else{r9=HEAP32[r7];break}}}while(0);r5=(r9|0)==0;r8=HEAP32[r2],r10=r8>>2;L1627:do{if((r8|0)==0){r1=1382}else{do{if((HEAP32[r10+3]|0)==(HEAP32[r10+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r8)|0)!=-1){break}HEAP32[r2]=0;r1=1382;break L1627}}while(0);if(r5){r11=r8;r12=0}else{r13=r8,r14=r13>>2;r15=0;break L1618}}}while(0);if(r1==1382){r1=0;if(r5){r13=0,r14=r13>>2;r15=1;break}else{r11=0;r12=1}}r8=HEAP32[r7],r10=r8>>2;r16=HEAP32[r10+3];if((r16|0)==(HEAP32[r10+4]|0)){r17=FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r8)&255}else{r17=HEAP8[r16]}if(r17<<24>>24<=-1){r13=r11,r14=r13>>2;r15=r12;break}if((HEAP16[HEAP32[r3>>2]+(r17<<24>>24<<1)>>1]&8192)==0){r13=r11,r14=r13>>2;r15=r12;break}r16=HEAP32[r7];r8=r16+12|0;r10=HEAP32[r8>>2];if((r10|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16);continue}else{HEAP32[r8>>2]=r10+1;continue}}r12=HEAP32[r7],r11=r12>>2;do{if((r12|0)==0){r18=0}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){r18=r12;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r12)|0)==-1){HEAP32[r7]=0;r18=0;break}else{r18=HEAP32[r7];break}}}while(0);r7=(r18|0)==0;do{if(r15){r1=1401}else{if((HEAP32[r14+3]|0)!=(HEAP32[r14+4]|0)){if(!(r7^(r13|0)==0)){break}STACKTOP=r6;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r13)|0)==-1){HEAP32[r2]=0;r1=1401;break}if(!r7){break}STACKTOP=r6;return}}while(0);do{if(r1==1401){if(r7){break}STACKTOP=r6;return}}while(0);HEAP32[r4>>2]=HEAP32[r4>>2]|2;STACKTOP=r6;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r9=r7>>2;r10=r6>>2;r11=STACKTOP;STACKTOP=STACKTOP+328|0;r12=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r12>>2];r12=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r12>>2];r12=r11;r13=r11+8;r14=r11+16;r15=r11+24;r16=r11+32;r17=r11+40;r18=r11+48;r19=r11+56;r20=r11+64;r21=r11+72;r22=r11+80;r23=r11+88;r24=r11+96,r25=r24>>2;r26=r11+112;r27=r11+120;r28=r11+128;r29=r11+136;r30=r11+144;r31=r11+152;r32=r11+160;r33=r11+168;r34=r11+176;r35=r11+184;r36=r11+192;r37=r11+200;r38=r11+208;r39=r11+216;r40=r11+224;r41=r11+232;r42=r11+240;r43=r11+248;r44=r11+256;r45=r11+264;r46=r11+272;r47=r11+280;r48=r11+288;r49=r11+296;r50=r11+304;r51=r11+312;r52=r11+320;HEAP32[r10]=0;__ZNKSt3__18ios_base6getlocEv(r26,r5);r53=r26|0;r26=HEAP32[r53>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r25]=14464;HEAP32[r25+1]=26;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r24,260)}r24=HEAP32[3617]-1|0;r25=HEAP32[r26+8>>2];do{if(HEAP32[r26+12>>2]-r25>>2>>>0>r24>>>0){r54=HEAP32[r25+(r24<<2)>>2];if((r54|0)==0){break}r55=r54;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r53>>2]|0);r54=r8<<24>>24;L1675:do{if((r54|0)==121){HEAP32[r13>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r13,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}if((r56|0)<69){r57=r56+2e3|0}else{r57=(r56-69|0)>>>0<31?r56+1900|0:r56}HEAP32[r9+5]=r57-1900}else if((r54|0)==37){HEAP32[r52>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIcEE(0,r3,r52,r6,r55)}else if((r54|0)==84){r56=r3|0;HEAP32[r45>>2]=HEAP32[r56>>2];HEAP32[r46>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r44,r2,r45,r46,r5,r6,r7,3144,3152);HEAP32[r56>>2]=HEAP32[r44>>2]}else if((r54|0)==119){HEAP32[r14>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r14,r6,r55,1);r58=HEAP32[r10];if((r58&4|0)==0&(r56|0)<7){HEAP32[r9+6]=r56;break}else{HEAP32[r10]=r58|4;break}}else if((r54|0)==110|(r54|0)==116){HEAP32[r36>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIcEE(0,r3,r36,r6,r55)}else if((r54|0)==112){HEAP32[r37>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIcEE(r2,r7+8|0,r3,r37,r6,r55)}else if((r54|0)==114){r58=r3|0;HEAP32[r39>>2]=HEAP32[r58>>2];HEAP32[r40>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r38,r2,r39,r40,r5,r6,r7,3160,3171);HEAP32[r58>>2]=HEAP32[r38>>2]}else if((r54|0)==82){r58=r3|0;HEAP32[r42>>2]=HEAP32[r58>>2];HEAP32[r43>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r41,r2,r42,r43,r5,r6,r7,3152,3157);HEAP32[r58>>2]=HEAP32[r41>>2]}else if((r54|0)==83){HEAP32[r15>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r15,r6,r55,2);r56=HEAP32[r10];if((r56&4|0)==0&(r58|0)<61){HEAP32[r9]=r58;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==73){r56=r7+8|0;HEAP32[r19>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r19,r6,r55,2);r59=HEAP32[r10];do{if((r59&4|0)==0){if((r58-1|0)>>>0>=12){break}HEAP32[r56>>2]=r58;break L1675}}while(0);HEAP32[r10]=r59|4}else if((r54|0)==68){r58=r3|0;HEAP32[r31>>2]=HEAP32[r58>>2];HEAP32[r32>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r30,r2,r31,r32,r5,r6,r7,3184,3192);HEAP32[r58>>2]=HEAP32[r30>>2]}else if((r54|0)==70){r58=r3|0;HEAP32[r34>>2]=HEAP32[r58>>2];HEAP32[r35>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r33,r2,r34,r35,r5,r6,r7,3176,3184);HEAP32[r58>>2]=HEAP32[r33>>2]}else if((r54|0)==120){r58=HEAP32[HEAP32[r2>>2]+20>>2];HEAP32[r47>>2]=HEAP32[r3>>2];HEAP32[r48>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r58](r1,r2,r47,r48,r5,r6,r7);STACKTOP=r11;return}else if((r54|0)==88){r58=r2+8|0;r56=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]+24>>2]](r58);r58=r3|0;HEAP32[r50>>2]=HEAP32[r58>>2];HEAP32[r51>>2]=HEAP32[r4>>2];r60=r56;r61=HEAP8[r56];if((r61&1)==0){r62=r60+1|0;r63=r60+1|0}else{r60=HEAP32[r56+8>>2];r62=r60;r63=r60}r60=r61&255;if((r60&1|0)==0){r64=r60>>>1}else{r64=HEAP32[r56+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r49,r2,r50,r51,r5,r6,r7,r63,r62+r64|0);HEAP32[r58>>2]=HEAP32[r49>>2]}else if((r54|0)==72){HEAP32[r20>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r20,r6,r55,2);r56=HEAP32[r10];if((r56&4|0)==0&(r58|0)<24){HEAP32[r9+2]=r58;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==106){HEAP32[r18>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r18,r6,r55,3);r58=HEAP32[r10];if((r58&4|0)==0&(r56|0)<366){HEAP32[r9+7]=r56;break}else{HEAP32[r10]=r58|4;break}}else if((r54|0)==77){HEAP32[r16>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r16,r6,r55,2);r56=HEAP32[r10];if((r56&4|0)==0&(r58|0)<60){HEAP32[r9+1]=r58;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==89){HEAP32[r12>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r12,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}HEAP32[r9+5]=r56-1900}else if((r54|0)==100|(r54|0)==101){r56=r7+12|0;HEAP32[r21>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r21,r6,r55,2);r60=HEAP32[r10];do{if((r60&4|0)==0){if((r58-1|0)>>>0>=31){break}HEAP32[r56>>2]=r58;break L1675}}while(0);HEAP32[r10]=r60|4}else if((r54|0)==109){HEAP32[r17>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r17,r6,r55,2)-1|0;r56=HEAP32[r10];if((r56&4|0)==0&(r58|0)<12){HEAP32[r9+4]=r58;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==99){r56=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r56>>2]+12>>2]](r56);r56=r3|0;HEAP32[r28>>2]=HEAP32[r56>>2];HEAP32[r29>>2]=HEAP32[r4>>2];r59=r58;r61=HEAP8[r58];if((r61&1)==0){r65=r59+1|0;r66=r59+1|0}else{r59=HEAP32[r58+8>>2];r65=r59;r66=r59}r59=r61&255;if((r59&1|0)==0){r67=r59>>>1}else{r67=HEAP32[r58+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r27,r2,r28,r29,r5,r6,r7,r66,r65+r67|0);HEAP32[r56>>2]=HEAP32[r27>>2]}else if((r54|0)==97|(r54|0)==65){r56=HEAP32[r4>>2];r58=r2+8|0;r59=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]>>2]](r58);HEAP32[r23>>2]=r56;r56=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r23,r59,r59+168|0,r55,r6,0)-r59|0;if((r56|0)>=168){break}HEAP32[r9+6]=((r56|0)/12&-1|0)%7&-1}else if((r54|0)==98|(r54|0)==66|(r54|0)==104){r56=HEAP32[r4>>2];r59=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+4>>2]](r59);HEAP32[r22>>2]=r56;r56=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r22,r58,r58+288|0,r55,r6,0)-r58|0;if((r56|0)>=288){break}HEAP32[r9+4]=((r56|0)/12&-1|0)%12&-1}else{HEAP32[r10]=HEAP32[r10]|4}}while(0);HEAP32[r1>>2]=HEAP32[r3>>2];STACKTOP=r11;return}}while(0);r11=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r11);___cxa_throw(r11,9240,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=STACKTOP;STACKTOP=STACKTOP+8|0;r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r7;r9=r1+8|0;r1=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+8>>2]](r9);r9=HEAPU8[r1];if((r9&1|0)==0){r10=r9>>>1}else{r10=HEAP32[r1+4>>2]}r9=HEAPU8[r1+12|0];if((r9&1|0)==0){r11=r9>>>1}else{r11=HEAP32[r1+16>>2]}if((r10|0)==(-r11|0)){HEAP32[r5>>2]=HEAP32[r5>>2]|4;STACKTOP=r7;return}HEAP32[r8>>2]=HEAP32[r4>>2];r4=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r8,r1,r1+24|0,r6,r5,0);r5=r4-r1|0;do{if((r4|0)==(r1|0)){if((HEAP32[r2>>2]|0)!=12){break}HEAP32[r2>>2]=0;STACKTOP=r7;return}}while(0);if((r5|0)!=12){STACKTOP=r7;return}r5=HEAP32[r2>>2];if((r5|0)>=12){STACKTOP=r7;return}HEAP32[r2>>2]=r5+12;STACKTOP=r7;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r1=r4>>2;r4=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=HEAP32[r7],r8=r2>>2;do{if((r2|0)==0){r9=0}else{if((HEAP32[r8+3]|0)!=(HEAP32[r8+4]|0)){r9=r2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r2)|0)==-1){HEAP32[r7]=0;r9=0;break}else{r9=HEAP32[r7];break}}}while(0);r2=(r9|0)==0;r9=(r3|0)>>2;r3=HEAP32[r9],r8=r3>>2;L1788:do{if((r3|0)==0){r4=1512}else{do{if((HEAP32[r8+3]|0)==(HEAP32[r8+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r3)|0)!=-1){break}HEAP32[r9]=0;r4=1512;break L1788}}while(0);if(r2){r10=r3,r11=r10>>2;r12=0}else{r4=1513}}}while(0);if(r4==1512){if(r2){r4=1513}else{r10=0,r11=r10>>2;r12=1}}if(r4==1513){HEAP32[r1]=HEAP32[r1]|6;STACKTOP=r6;return}r2=HEAP32[r7],r3=r2>>2;r8=HEAP32[r3+3];if((r8|0)==(HEAP32[r3+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r3]+36>>2]](r2)&255}else{r13=HEAP8[r8]}if(FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+36>>2]](r5,r13,0)<<24>>24!=37){HEAP32[r1]=HEAP32[r1]|4;STACKTOP=r6;return}r13=HEAP32[r7];r5=r13+12|0;r8=HEAP32[r5>>2];if((r8|0)==(HEAP32[r13+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+40>>2]](r13)}else{HEAP32[r5>>2]=r8+1}r8=HEAP32[r7],r5=r8>>2;do{if((r8|0)==0){r14=0}else{if((HEAP32[r5+3]|0)!=(HEAP32[r5+4]|0)){r14=r8;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r8)|0)==-1){HEAP32[r7]=0;r14=0;break}else{r14=HEAP32[r7];break}}}while(0);r7=(r14|0)==0;do{if(r12){r4=1532}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){if(!(r7^(r10|0)==0)){break}STACKTOP=r6;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r10)|0)==-1){HEAP32[r9]=0;r4=1532;break}if(!r7){break}STACKTOP=r6;return}}while(0);do{if(r4==1532){if(r7){break}STACKTOP=r6;return}}while(0);HEAP32[r1]=HEAP32[r1]|2;STACKTOP=r6;return}function __ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r6=r3>>2;r3=0;r7=STACKTOP;r8=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r8>>2];r8=(r1|0)>>2;r1=HEAP32[r8],r9=r1>>2;do{if((r1|0)==0){r10=0}else{if((HEAP32[r9+3]|0)!=(HEAP32[r9+4]|0)){r10=r1;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r1)|0)==-1){HEAP32[r8]=0;r10=0;break}else{r10=HEAP32[r8];break}}}while(0);r1=(r10|0)==0;r10=(r2|0)>>2;r2=HEAP32[r10],r9=r2>>2;L1842:do{if((r2|0)==0){r3=1552}else{do{if((HEAP32[r9+3]|0)==(HEAP32[r9+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r2)|0)!=-1){break}HEAP32[r10]=0;r3=1552;break L1842}}while(0);if(r1){r11=r2}else{r3=1553}}}while(0);if(r3==1552){if(r1){r3=1553}else{r11=0}}if(r3==1553){HEAP32[r6]=HEAP32[r6]|6;r12=0;STACKTOP=r7;return r12}r1=HEAP32[r8],r2=r1>>2;r9=HEAP32[r2+3];if((r9|0)==(HEAP32[r2+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r1)&255}else{r13=HEAP8[r9]}do{if(r13<<24>>24>-1){r9=r4+8|0;if((HEAP16[HEAP32[r9>>2]+(r13<<24>>24<<1)>>1]&2048)==0){break}r1=r4;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r4,r13,0)<<24>>24;r14=HEAP32[r8];r15=r14+12|0;r16=HEAP32[r15>>2];if((r16|0)==(HEAP32[r14+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+40>>2]](r14);r17=r2;r18=r5;r19=r11,r20=r19>>2}else{HEAP32[r15>>2]=r16+1;r17=r2;r18=r5;r19=r11,r20=r19>>2}while(1){r21=r17-48|0;r2=r18-1|0;r16=HEAP32[r8],r15=r16>>2;do{if((r16|0)==0){r22=0}else{if((HEAP32[r15+3]|0)!=(HEAP32[r15+4]|0)){r22=r16;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r15]+36>>2]](r16)|0)==-1){HEAP32[r8]=0;r22=0;break}else{r22=HEAP32[r8];break}}}while(0);r16=(r22|0)==0;if((r19|0)==0){r23=r22,r24=r23>>2;r25=0,r26=r25>>2}else{do{if((HEAP32[r20+3]|0)==(HEAP32[r20+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r19)|0)!=-1){r27=r19;break}HEAP32[r10]=0;r27=0}else{r27=r19}}while(0);r23=HEAP32[r8],r24=r23>>2;r25=r27,r26=r25>>2}r28=(r25|0)==0;if(!((r16^r28)&(r2|0)>0)){r3=1582;break}r15=HEAP32[r24+3];if((r15|0)==(HEAP32[r24+4]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r23)&255}else{r29=HEAP8[r15]}if(r29<<24>>24<=-1){r12=r21;r3=1595;break}if((HEAP16[HEAP32[r9>>2]+(r29<<24>>24<<1)>>1]&2048)==0){r12=r21;r3=1601;break}r15=(FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r4,r29,0)<<24>>24)+(r21*10&-1)|0;r14=HEAP32[r8];r30=r14+12|0;r31=HEAP32[r30>>2];if((r31|0)==(HEAP32[r14+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+40>>2]](r14);r17=r15;r18=r2;r19=r25,r20=r19>>2;continue}else{HEAP32[r30>>2]=r31+1;r17=r15;r18=r2;r19=r25,r20=r19>>2;continue}}if(r3==1582){do{if((r23|0)==0){r32=0}else{if((HEAP32[r24+3]|0)!=(HEAP32[r24+4]|0)){r32=r23;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r23)|0)==-1){HEAP32[r8]=0;r32=0;break}else{r32=HEAP32[r8];break}}}while(0);r1=(r32|0)==0;L1899:do{if(r28){r3=1592}else{do{if((HEAP32[r26+3]|0)==(HEAP32[r26+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)|0)!=-1){break}HEAP32[r10]=0;r3=1592;break L1899}}while(0);if(r1){r12=r21}else{break}STACKTOP=r7;return r12}}while(0);do{if(r3==1592){if(r1){break}else{r12=r21}STACKTOP=r7;return r12}}while(0);HEAP32[r6]=HEAP32[r6]|2;r12=r21;STACKTOP=r7;return r12}else if(r3==1601){STACKTOP=r7;return r12}else if(r3==1595){STACKTOP=r7;return r12}}}while(0);HEAP32[r6]=HEAP32[r6]|4;r12=0;STACKTOP=r7;return r12}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13do_date_orderEv(r1){return 2}function __ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r9,r10,r5,r6,r7,3112,3144);STACKTOP=r8;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r2+8|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11);HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];r4=HEAP8[r12];if((r4&1)==0){r13=r12+4|0;r14=r12+4|0}else{r3=HEAP32[r12+8>>2];r13=r3;r14=r3}r3=r4&255;if((r3&1|0)==0){r15=r3>>>1}else{r15=HEAP32[r12+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r9,r10,r5,r6,r7,r14,(r15<<2)+r13|0);STACKTOP=r8;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r10=r6>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+48|0;r13=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r13>>2];r13=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r13>>2];r13=r12,r14=r13>>2;r15=r12+16;r16=r12+24;r17=r12+32;r18=r12+40;__ZNKSt3__18ios_base6getlocEv(r15,r5);r19=r15|0;r15=HEAP32[r19>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r14]=14456;HEAP32[r14+1]=26;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r13,260)}r13=HEAP32[3615]-1|0;r14=HEAP32[r15+8>>2];do{if(HEAP32[r15+12>>2]-r14>>2>>>0>r13>>>0){r20=HEAP32[r14+(r13<<2)>>2];if((r20|0)==0){break}r21=r20;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r19>>2]|0);HEAP32[r10]=0;r22=(r3|0)>>2;L1935:do{if((r8|0)==(r9|0)){r11=1683}else{r23=(r4|0)>>2;r24=r20>>2;r25=r20>>2;r26=r20;r27=r2;r28=r17|0;r29=r18|0;r30=r16|0;r31=r8,r32=r31>>2;r33=0;L1937:while(1){r34=r33;while(1){if((r34|0)!=0){r11=1683;break L1935}r35=HEAP32[r22],r36=r35>>2;do{if((r35|0)==0){r37=0}else{r38=HEAP32[r36+3];if((r38|0)==(HEAP32[r36+4]|0)){r39=FUNCTION_TABLE[HEAP32[HEAP32[r36]+36>>2]](r35)}else{r39=HEAP32[r38>>2]}if((r39|0)!=-1){r37=r35;break}HEAP32[r22]=0;r37=0}}while(0);r35=(r37|0)==0;r36=HEAP32[r23],r38=r36>>2;do{if((r36|0)==0){r11=1635}else{r40=HEAP32[r38+3];if((r40|0)==(HEAP32[r38+4]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r36)}else{r41=HEAP32[r40>>2]}if((r41|0)==-1){HEAP32[r23]=0;r11=1635;break}else{if(r35^(r36|0)==0){r42=r36;break}else{r11=1637;break L1937}}}}while(0);if(r11==1635){r11=0;if(r35){r11=1637;break L1937}else{r42=0}}if(FUNCTION_TABLE[HEAP32[HEAP32[r24]+52>>2]](r21,HEAP32[r32],0)<<24>>24==37){r11=1640;break}if(FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r21,8192,HEAP32[r32])){r43=r31;r11=1650;break}r44=(r37+12|0)>>2;r36=HEAP32[r44];r45=r37+16|0;if((r36|0)==(HEAP32[r45>>2]|0)){r46=FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+36>>2]](r37)}else{r46=HEAP32[r36>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+28>>2]](r21,r46)|0)==(FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+28>>2]](r21,HEAP32[r32])|0)){r11=1678;break}HEAP32[r10]=4;r34=4}L1969:do{if(r11==1678){r11=0;r34=HEAP32[r44];if((r34|0)==(HEAP32[r45>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+40>>2]](r37)}else{HEAP32[r44]=r34+4}r47=r31+4|0}else if(r11==1650){while(1){r11=0;r34=r43+4|0;if((r34|0)==(r9|0)){r48=r9;break}if(FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r21,8192,HEAP32[r34>>2])){r43=r34;r11=1650}else{r48=r34;break}}r35=r37,r34=r35>>2;r36=r42,r38=r36>>2;while(1){do{if((r35|0)==0){r49=0}else{r40=HEAP32[r34+3];if((r40|0)==(HEAP32[r34+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r35)}else{r50=HEAP32[r40>>2]}if((r50|0)!=-1){r49=r35;break}HEAP32[r22]=0;r49=0}}while(0);r40=(r49|0)==0;do{if((r36|0)==0){r11=1665}else{r51=HEAP32[r38+3];if((r51|0)==(HEAP32[r38+4]|0)){r52=FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r36)}else{r52=HEAP32[r51>>2]}if((r52|0)==-1){HEAP32[r23]=0;r11=1665;break}else{if(r40^(r36|0)==0){r53=r36;break}else{r47=r48;break L1969}}}}while(0);if(r11==1665){r11=0;if(r40){r47=r48;break L1969}else{r53=0}}r51=(r49+12|0)>>2;r54=HEAP32[r51];r55=r49+16|0;if((r54|0)==(HEAP32[r55>>2]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+36>>2]](r49)}else{r56=HEAP32[r54>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r21,8192,r56)){r47=r48;break L1969}r54=HEAP32[r51];if((r54|0)==(HEAP32[r55>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+40>>2]](r49);r35=r49,r34=r35>>2;r36=r53,r38=r36>>2;continue}else{HEAP32[r51]=r54+4;r35=r49,r34=r35>>2;r36=r53,r38=r36>>2;continue}}}else if(r11==1640){r11=0;r36=r31+4|0;if((r36|0)==(r9|0)){r11=1641;break L1937}r38=FUNCTION_TABLE[HEAP32[HEAP32[r24]+52>>2]](r21,HEAP32[r36>>2],0);if(r38<<24>>24==69|r38<<24>>24==48){r35=r31+8|0;if((r35|0)==(r9|0)){r11=1644;break L1937}r57=r38;r58=FUNCTION_TABLE[HEAP32[HEAP32[r24]+52>>2]](r21,HEAP32[r35>>2],0);r59=r35}else{r57=0;r58=r38;r59=r36}r36=HEAP32[HEAP32[r27>>2]+36>>2];HEAP32[r28>>2]=r37;HEAP32[r29>>2]=r42;FUNCTION_TABLE[r36](r16,r2,r17,r18,r5,r6,r7,r58,r57);HEAP32[r22]=HEAP32[r30>>2];r47=r59+4|0}}while(0);if((r47|0)==(r9|0)){r11=1683;break L1935}r31=r47,r32=r31>>2;r33=HEAP32[r10]}if(r11==1644){HEAP32[r10]=4;r60=r37,r61=r60>>2;break}else if(r11==1637){HEAP32[r10]=4;r60=r37,r61=r60>>2;break}else if(r11==1641){HEAP32[r10]=4;r60=r37,r61=r60>>2;break}}}while(0);if(r11==1683){r60=HEAP32[r22],r61=r60>>2}r21=r3|0;do{if((r60|0)!=0){r20=HEAP32[r61+3];if((r20|0)==(HEAP32[r61+4]|0)){r62=FUNCTION_TABLE[HEAP32[HEAP32[r61]+36>>2]](r60)}else{r62=HEAP32[r20>>2]}if((r62|0)!=-1){break}HEAP32[r21>>2]=0}}while(0);r22=HEAP32[r21>>2];r20=(r22|0)==0;r33=r4|0;r31=HEAP32[r33>>2],r32=r31>>2;do{if((r31|0)==0){r11=1696}else{r30=HEAP32[r32+3];if((r30|0)==(HEAP32[r32+4]|0)){r63=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r63=HEAP32[r30>>2]}if((r63|0)==-1){HEAP32[r33>>2]=0;r11=1696;break}if(!(r20^(r31|0)==0)){break}r64=r1|0,r65=r64>>2;HEAP32[r65]=r22;STACKTOP=r12;return}}while(0);do{if(r11==1696){if(r20){break}r64=r1|0,r65=r64>>2;HEAP32[r65]=r22;STACKTOP=r12;return}}while(0);HEAP32[r10]=HEAP32[r10]|2;r64=r1|0,r65=r64>>2;HEAP32[r65]=r22;STACKTOP=r12;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9240,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r11]=14456;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r10,260)}r10=HEAP32[3615]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+168|0,r13,r6,0)-r16|0;if((r14|0)>=168){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+24>>2]=((r14|0)/12&-1|0)%7&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r11]=14456;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r10,260)}r10=HEAP32[3615]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+4>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+288|0,r13,r6,0)-r16|0;if((r14|0)>=288){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+16>>2]=((r14|0)/12&-1|0)%12&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r2;r9=r2+8,r10=r9>>2;r11=r2+24;__ZNKSt3__18ios_base6getlocEv(r11,r5);r5=r11|0;r11=HEAP32[r5>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r10]=14456;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r9,260)}r9=HEAP32[3615]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);HEAP32[r8>>2]=HEAP32[r4>>2];r13=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r8,r6,r12,4);if((HEAP32[r6>>2]&4|0)!=0){r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}if((r13|0)<69){r17=r13+2e3|0}else{r17=(r13-69|0)>>>0<31?r13+1900|0:r13}HEAP32[r7+20>>2]=r17-1900;r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r2);___cxa_throw(r2,9240,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r1=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=(r3|0)>>2;r3=r5;L2093:while(1){r8=HEAP32[r7],r9=r8>>2;do{if((r8|0)==0){r10=1}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r12=HEAP32[r11>>2]}if((r12|0)==-1){HEAP32[r7]=0;r10=1;break}else{r10=(HEAP32[r7]|0)==0;break}}}while(0);r8=HEAP32[r2],r9=r8>>2;do{if((r8|0)==0){r1=1756}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r13=HEAP32[r11>>2]}if((r13|0)==-1){HEAP32[r2]=0;r1=1756;break}else{r11=(r8|0)==0;if(r10^r11){r14=r8;r15=r11;break}else{r16=r8,r17=r16>>2;r18=r11;break L2093}}}}while(0);if(r1==1756){r1=0;if(r10){r16=0,r17=r16>>2;r18=1;break}else{r14=0;r15=1}}r8=HEAP32[r7],r9=r8>>2;r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r19=HEAP32[r11>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r5,8192,r19)){r16=r14,r17=r16>>2;r18=r15;break}r11=HEAP32[r7];r8=r11+12|0;r9=HEAP32[r8>>2];if((r9|0)==(HEAP32[r11+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+40>>2]](r11);continue}else{HEAP32[r8>>2]=r9+4;continue}}r15=HEAP32[r7],r14=r15>>2;do{if((r15|0)==0){r20=1}else{r19=HEAP32[r14+3];if((r19|0)==(HEAP32[r14+4]|0)){r21=FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r15)}else{r21=HEAP32[r19>>2]}if((r21|0)==-1){HEAP32[r7]=0;r20=1;break}else{r20=(HEAP32[r7]|0)==0;break}}}while(0);do{if(r18){r1=1778}else{r7=HEAP32[r17+3];if((r7|0)==(HEAP32[r17+4]|0)){r22=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r16)}else{r22=HEAP32[r7>>2]}if((r22|0)==-1){HEAP32[r2]=0;r1=1778;break}if(!(r20^(r16|0)==0)){break}STACKTOP=r6;return}}while(0);do{if(r1==1778){if(r20){break}STACKTOP=r6;return}}while(0);HEAP32[r4>>2]=HEAP32[r4>>2]|2;STACKTOP=r6;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r9=r7>>2;r10=r6>>2;r11=STACKTOP;STACKTOP=STACKTOP+328|0;r12=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r12>>2];r12=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r12>>2];r12=r11;r13=r11+8;r14=r11+16;r15=r11+24;r16=r11+32;r17=r11+40;r18=r11+48;r19=r11+56;r20=r11+64;r21=r11+72;r22=r11+80;r23=r11+88;r24=r11+96,r25=r24>>2;r26=r11+112;r27=r11+120;r28=r11+128;r29=r11+136;r30=r11+144;r31=r11+152;r32=r11+160;r33=r11+168;r34=r11+176;r35=r11+184;r36=r11+192;r37=r11+200;r38=r11+208;r39=r11+216;r40=r11+224;r41=r11+232;r42=r11+240;r43=r11+248;r44=r11+256;r45=r11+264;r46=r11+272;r47=r11+280;r48=r11+288;r49=r11+296;r50=r11+304;r51=r11+312;r52=r11+320;HEAP32[r10]=0;__ZNKSt3__18ios_base6getlocEv(r26,r5);r53=r26|0;r26=HEAP32[r53>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r25]=14456;HEAP32[r25+1]=26;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r24,260)}r24=HEAP32[3615]-1|0;r25=HEAP32[r26+8>>2];do{if(HEAP32[r26+12>>2]-r25>>2>>>0>r24>>>0){r54=HEAP32[r25+(r24<<2)>>2];if((r54|0)==0){break}r55=r54;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r53>>2]|0);r54=r8<<24>>24;L2158:do{if((r54|0)==106){HEAP32[r18>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r18,r6,r55,3);r57=HEAP32[r10];if((r57&4|0)==0&(r56|0)<366){HEAP32[r9+7]=r56;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==120){r57=HEAP32[HEAP32[r2>>2]+20>>2];HEAP32[r47>>2]=HEAP32[r3>>2];HEAP32[r48>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r57](r1,r2,r47,r48,r5,r6,r7);STACKTOP=r11;return}else if((r54|0)==88){r57=r2+8|0;r56=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+24>>2]](r57);r57=r3|0;HEAP32[r50>>2]=HEAP32[r57>>2];HEAP32[r51>>2]=HEAP32[r4>>2];r58=HEAP8[r56];if((r58&1)==0){r59=r56+4|0;r60=r56+4|0}else{r61=HEAP32[r56+8>>2];r59=r61;r60=r61}r61=r58&255;if((r61&1|0)==0){r62=r61>>>1}else{r62=HEAP32[r56+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r49,r2,r50,r51,r5,r6,r7,r60,(r62<<2)+r59|0);HEAP32[r57>>2]=HEAP32[r49>>2]}else if((r54|0)==37){HEAP32[r52>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIwEE(0,r3,r52,r6,r55)}else if((r54|0)==70){r57=r3|0;HEAP32[r34>>2]=HEAP32[r57>>2];HEAP32[r35>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r33,r2,r34,r35,r5,r6,r7,2944,2976);HEAP32[r57>>2]=HEAP32[r33>>2]}else if((r54|0)==109){HEAP32[r17>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r17,r6,r55,2)-1|0;r56=HEAP32[r10];if((r56&4|0)==0&(r57|0)<12){HEAP32[r9+4]=r57;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==73){r56=r7+8|0;HEAP32[r19>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r19,r6,r55,2);r61=HEAP32[r10];do{if((r61&4|0)==0){if((r57-1|0)>>>0>=12){break}HEAP32[r56>>2]=r57;break L2158}}while(0);HEAP32[r10]=r61|4}else if((r54|0)==72){HEAP32[r20>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r20,r6,r55,2);r56=HEAP32[r10];if((r56&4|0)==0&(r57|0)<24){HEAP32[r9+2]=r57;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==68){r56=r3|0;HEAP32[r31>>2]=HEAP32[r56>>2];HEAP32[r32>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r30,r2,r31,r32,r5,r6,r7,3080,3112);HEAP32[r56>>2]=HEAP32[r30>>2]}else if((r54|0)==121){HEAP32[r13>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r13,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}if((r56|0)<69){r63=r56+2e3|0}else{r63=(r56-69|0)>>>0<31?r56+1900|0:r56}HEAP32[r9+5]=r63-1900}else if((r54|0)==110|(r54|0)==116){HEAP32[r36>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIwEE(0,r3,r36,r6,r55)}else if((r54|0)==112){HEAP32[r37>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIwEE(r2,r7+8|0,r3,r37,r6,r55)}else if((r54|0)==114){r56=r3|0;HEAP32[r39>>2]=HEAP32[r56>>2];HEAP32[r40>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r38,r2,r39,r40,r5,r6,r7,3032,3076);HEAP32[r56>>2]=HEAP32[r38>>2]}else if((r54|0)==98|(r54|0)==66|(r54|0)==104){r56=HEAP32[r4>>2];r57=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+4>>2]](r57);HEAP32[r22>>2]=r56;r56=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r22,r58,r58+288|0,r55,r6,0)-r58|0;if((r56|0)>=288){break}HEAP32[r9+4]=((r56|0)/12&-1|0)%12&-1}else if((r54|0)==99){r56=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r56>>2]+12>>2]](r56);r56=r3|0;HEAP32[r28>>2]=HEAP32[r56>>2];HEAP32[r29>>2]=HEAP32[r4>>2];r57=HEAP8[r58];if((r57&1)==0){r64=r58+4|0;r65=r58+4|0}else{r66=HEAP32[r58+8>>2];r64=r66;r65=r66}r66=r57&255;if((r66&1|0)==0){r67=r66>>>1}else{r67=HEAP32[r58+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r27,r2,r28,r29,r5,r6,r7,r65,(r67<<2)+r64|0);HEAP32[r56>>2]=HEAP32[r27>>2]}else if((r54|0)==84){r56=r3|0;HEAP32[r45>>2]=HEAP32[r56>>2];HEAP32[r46>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r44,r2,r45,r46,r5,r6,r7,2976,3008);HEAP32[r56>>2]=HEAP32[r44>>2]}else if((r54|0)==119){HEAP32[r14>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r14,r6,r55,1);r58=HEAP32[r10];if((r58&4|0)==0&(r56|0)<7){HEAP32[r9+6]=r56;break}else{HEAP32[r10]=r58|4;break}}else if((r54|0)==77){HEAP32[r16>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r16,r6,r55,2);r56=HEAP32[r10];if((r56&4|0)==0&(r58|0)<60){HEAP32[r9+1]=r58;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==100|(r54|0)==101){r56=r7+12|0;HEAP32[r21>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r21,r6,r55,2);r66=HEAP32[r10];do{if((r66&4|0)==0){if((r58-1|0)>>>0>=31){break}HEAP32[r56>>2]=r58;break L2158}}while(0);HEAP32[r10]=r66|4}else if((r54|0)==97|(r54|0)==65){r58=HEAP32[r4>>2];r56=r2+8|0;r61=FUNCTION_TABLE[HEAP32[HEAP32[r56>>2]>>2]](r56);HEAP32[r23>>2]=r58;r58=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r23,r61,r61+168|0,r55,r6,0)-r61|0;if((r58|0)>=168){break}HEAP32[r9+6]=((r58|0)/12&-1|0)%7&-1}else if((r54|0)==82){r58=r3|0;HEAP32[r42>>2]=HEAP32[r58>>2];HEAP32[r43>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r41,r2,r42,r43,r5,r6,r7,3008,3028);HEAP32[r58>>2]=HEAP32[r41>>2]}else if((r54|0)==83){HEAP32[r15>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r15,r6,r55,2);r61=HEAP32[r10];if((r61&4|0)==0&(r58|0)<61){HEAP32[r9]=r58;break}else{HEAP32[r10]=r61|4;break}}else if((r54|0)==89){HEAP32[r12>>2]=HEAP32[r4>>2];r61=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r12,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}HEAP32[r9+5]=r61-1900}else{HEAP32[r10]=HEAP32[r10]|4}}while(0);HEAP32[r1>>2]=HEAP32[r3>>2];STACKTOP=r11;return}}while(0);r11=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r11);___cxa_throw(r11,9240,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=STACKTOP;STACKTOP=STACKTOP+8|0;r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r7;r9=r1+8|0;r1=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+8>>2]](r9);r9=HEAPU8[r1];if((r9&1|0)==0){r10=r9>>>1}else{r10=HEAP32[r1+4>>2]}r9=HEAPU8[r1+12|0];if((r9&1|0)==0){r11=r9>>>1}else{r11=HEAP32[r1+16>>2]}if((r10|0)==(-r11|0)){HEAP32[r5>>2]=HEAP32[r5>>2]|4;STACKTOP=r7;return}HEAP32[r8>>2]=HEAP32[r4>>2];r4=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r8,r1,r1+24|0,r6,r5,0);r5=r4-r1|0;do{if((r4|0)==(r1|0)){if((HEAP32[r2>>2]|0)!=12){break}HEAP32[r2>>2]=0;STACKTOP=r7;return}}while(0);if((r5|0)!=12){STACKTOP=r7;return}r5=HEAP32[r2>>2];if((r5|0)>=12){STACKTOP=r7;return}HEAP32[r2>>2]=r5+12;STACKTOP=r7;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r1=r4>>2;r4=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=HEAP32[r7],r8=r2>>2;do{if((r2|0)==0){r9=1}else{r10=HEAP32[r8+3];if((r10|0)==(HEAP32[r8+4]|0)){r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r2)}else{r11=HEAP32[r10>>2]}if((r11|0)==-1){HEAP32[r7]=0;r9=1;break}else{r9=(HEAP32[r7]|0)==0;break}}}while(0);r11=(r3|0)>>2;r3=HEAP32[r11],r2=r3>>2;do{if((r3|0)==0){r4=1891}else{r8=HEAP32[r2+3];if((r8|0)==(HEAP32[r2+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r3)}else{r12=HEAP32[r8>>2]}if((r12|0)==-1){HEAP32[r11]=0;r4=1891;break}else{r8=(r3|0)==0;if(r9^r8){r13=r3,r14=r13>>2;r15=r8;break}else{r4=1893;break}}}}while(0);if(r4==1891){if(r9){r4=1893}else{r13=0,r14=r13>>2;r15=1}}if(r4==1893){HEAP32[r1]=HEAP32[r1]|6;STACKTOP=r6;return}r9=HEAP32[r7],r3=r9>>2;r12=HEAP32[r3+3];if((r12|0)==(HEAP32[r3+4]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r3]+36>>2]](r9)}else{r16=HEAP32[r12>>2]}if(FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r5,r16,0)<<24>>24!=37){HEAP32[r1]=HEAP32[r1]|4;STACKTOP=r6;return}r16=HEAP32[r7];r5=r16+12|0;r12=HEAP32[r5>>2];if((r12|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16)}else{HEAP32[r5>>2]=r12+4}r12=HEAP32[r7],r5=r12>>2;do{if((r12|0)==0){r17=1}else{r16=HEAP32[r5+3];if((r16|0)==(HEAP32[r5+4]|0)){r18=FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r12)}else{r18=HEAP32[r16>>2]}if((r18|0)==-1){HEAP32[r7]=0;r17=1;break}else{r17=(HEAP32[r7]|0)==0;break}}}while(0);do{if(r15){r4=1915}else{r7=HEAP32[r14+3];if((r7|0)==(HEAP32[r14+4]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r13)}else{r19=HEAP32[r7>>2]}if((r19|0)==-1){HEAP32[r11]=0;r4=1915;break}if(!(r17^(r13|0)==0)){break}STACKTOP=r6;return}}while(0);do{if(r4==1915){if(r17){break}STACKTOP=r6;return}}while(0);HEAP32[r1]=HEAP32[r1]|2;STACKTOP=r6;return}function __ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r3>>2;r3=0;r7=STACKTOP;r8=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r8>>2];r8=(r1|0)>>2;r1=HEAP32[r8],r9=r1>>2;do{if((r1|0)==0){r10=1}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r1)}else{r12=HEAP32[r11>>2]}if((r12|0)==-1){HEAP32[r8]=0;r10=1;break}else{r10=(HEAP32[r8]|0)==0;break}}}while(0);r12=(r2|0)>>2;r2=HEAP32[r12],r1=r2>>2;do{if((r2|0)==0){r3=1937}else{r9=HEAP32[r1+3];if((r9|0)==(HEAP32[r1+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r1]+36>>2]](r2)}else{r13=HEAP32[r9>>2]}if((r13|0)==-1){HEAP32[r12]=0;r3=1937;break}else{if(r10^(r2|0)==0){r14=r2;break}else{r3=1939;break}}}}while(0);if(r3==1937){if(r10){r3=1939}else{r14=0}}if(r3==1939){HEAP32[r6]=HEAP32[r6]|6;r15=0;STACKTOP=r7;return r15}r10=HEAP32[r8],r2=r10>>2;r13=HEAP32[r2+3];if((r13|0)==(HEAP32[r2+4]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r10)}else{r16=HEAP32[r13>>2]}r13=r4;if(!FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r4,2048,r16)){HEAP32[r6]=HEAP32[r6]|4;r15=0;STACKTOP=r7;return r15}r10=r4;r2=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r4,r16,0)<<24>>24;r16=HEAP32[r8];r1=r16+12|0;r9=HEAP32[r1>>2];if((r9|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16);r17=r2;r18=r5;r19=r14,r20=r19>>2}else{HEAP32[r1>>2]=r9+4;r17=r2;r18=r5;r19=r14,r20=r19>>2}while(1){r21=r17-48|0;r14=r18-1|0;r5=HEAP32[r8],r2=r5>>2;do{if((r5|0)==0){r22=0}else{r9=HEAP32[r2+3];if((r9|0)==(HEAP32[r2+4]|0)){r23=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r5)}else{r23=HEAP32[r9>>2]}if((r23|0)==-1){HEAP32[r8]=0;r22=0;break}else{r22=HEAP32[r8];break}}}while(0);r5=(r22|0)==0;if((r19|0)==0){r24=r22,r25=r24>>2;r26=0,r27=r26>>2}else{r2=HEAP32[r20+3];if((r2|0)==(HEAP32[r20+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r19)}else{r28=HEAP32[r2>>2]}if((r28|0)==-1){HEAP32[r12]=0;r29=0}else{r29=r19}r24=HEAP32[r8],r25=r24>>2;r26=r29,r27=r26>>2}r30=(r26|0)==0;if(!((r5^r30)&(r14|0)>0)){break}r5=HEAP32[r25+3];if((r5|0)==(HEAP32[r25+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r31=HEAP32[r5>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r4,2048,r31)){r15=r21;r3=1989;break}r5=(FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r4,r31,0)<<24>>24)+(r21*10&-1)|0;r2=HEAP32[r8];r9=r2+12|0;r1=HEAP32[r9>>2];if((r1|0)==(HEAP32[r2+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+40>>2]](r2);r17=r5;r18=r14;r19=r26,r20=r19>>2;continue}else{HEAP32[r9>>2]=r1+4;r17=r5;r18=r14;r19=r26,r20=r19>>2;continue}}if(r3==1989){STACKTOP=r7;return r15}do{if((r24|0)==0){r32=1}else{r19=HEAP32[r25+3];if((r19|0)==(HEAP32[r25+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r33=HEAP32[r19>>2]}if((r33|0)==-1){HEAP32[r8]=0;r32=1;break}else{r32=(HEAP32[r8]|0)==0;break}}}while(0);do{if(r30){r3=1983}else{r8=HEAP32[r27+3];if((r8|0)==(HEAP32[r27+4]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)}else{r34=HEAP32[r8>>2]}if((r34|0)==-1){HEAP32[r12]=0;r3=1983;break}if(r32^(r26|0)==0){r15=r21}else{break}STACKTOP=r7;return r15}}while(0);do{if(r3==1983){if(r32){break}else{r15=r21}STACKTOP=r7;return r15}}while(0);HEAP32[r6]=HEAP32[r6]|2;r15=r21;STACKTOP=r7;return r15}function __ZNKSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPK2tmcc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=STACKTOP;STACKTOP=STACKTOP+112|0;r4=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r4>>2];r4=r5;r9=r5+8;r10=r9|0;r11=r4|0;HEAP8[r11]=37;r12=r4+1|0;HEAP8[r12]=r7;r13=r4+2|0;HEAP8[r13]=r8;HEAP8[r4+3|0]=0;if(r8<<24>>24!=0){HEAP8[r12]=r8;HEAP8[r13]=r7}r7=_strftime(r10,100,r11,r6,HEAP32[r2+8>>2]);r2=r9+r7|0;r9=HEAP32[r3>>2];if((r7|0)==0){r14=r9;r15=r1|0;HEAP32[r15>>2]=r14;STACKTOP=r5;return}else{r16=r9;r17=r10}while(1){r10=HEAP8[r17];if((r16|0)==0){r18=0}else{r9=r16+24|0;r7=HEAP32[r9>>2];if((r7|0)==(HEAP32[r16+28>>2]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+52>>2]](r16,r10&255)}else{HEAP32[r9>>2]=r7+1;HEAP8[r7]=r10;r19=r10&255}r18=(r19|0)==-1?0:r16}r10=r17+1|0;if((r10|0)==(r2|0)){r14=r18;break}else{r16=r18;r17=r10}}r15=r1|0;HEAP32[r15>>2]=r14;STACKTOP=r5;return}function __ZNKSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPK2tmcc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+408|0;r4=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r4>>2];r4=r5;r9=r5+400;r10=r4|0;HEAP32[r9>>2]=r4+400;__ZNKSt3__110__time_put8__do_putEPwRS1_PK2tmcc(r2+8|0,r10,r9,r6,r7,r8);r8=HEAP32[r9>>2];r9=HEAP32[r3>>2];if((r10|0)==(r8|0)){r11=r9;r12=r1|0;HEAP32[r12>>2]=r11;STACKTOP=r5;return}else{r13=r9;r14=r10}while(1){r10=HEAP32[r14>>2];if((r13|0)==0){r15=0}else{r9=r13+24|0;r3=HEAP32[r9>>2];if((r3|0)==(HEAP32[r13+28>>2]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+52>>2]](r13,r10)}else{HEAP32[r9>>2]=r3+4;HEAP32[r3>>2]=r10;r16=r10}r15=(r16|0)==-1?0:r13}r10=r14+4|0;if((r10|0)==(r8|0)){r11=r15;break}else{r13=r15;r14=r10}}r12=r1|0;HEAP32[r12>>2]=r11;STACKTOP=r5;return}function __ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){var r2;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){var r2;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){var r2;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){var r2;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIcLb0EE16do_decimal_pointEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb0EE16do_thousands_sepEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb0EE14do_frac_digitsEv(r1){return 0}function __ZNKSt3__110moneypunctIcLb1EE16do_decimal_pointEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb1EE16do_thousands_sepEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb1EE14do_frac_digitsEv(r1){return 0}function __ZNKSt3__110moneypunctIwLb0EE16do_decimal_pointEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb0EE16do_thousands_sepEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb0EE14do_frac_digitsEv(r1){return 0}function __ZNKSt3__110moneypunctIwLb1EE16do_decimal_pointEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb1EE16do_thousands_sepEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb1EE14do_frac_digitsEv(r1){return 0}function __ZNSt3__112__do_nothingEPv(r1){return}function __ZNKSt3__110moneypunctIcLb0EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb0EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb1EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb1EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb0EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb0EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb1EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb1EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNSt3__110moneypunctIcLb0EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIcLb0EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIcLb0EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r1,1,45);return}function __ZNSt3__110moneypunctIcLb1EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIcLb1EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIcLb1EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r1,1,45);return}function __ZNSt3__110moneypunctIwLb0EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIwLb0EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIwLb0EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r1,1,45);return}function __ZNSt3__110moneypunctIwLb1EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIwLb1EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIwLb1EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r1,1,45);return}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110__time_put8__do_putEPwRS1_PK2tmcc(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14;r7=STACKTOP;STACKTOP=STACKTOP+120|0;r8=r7;r9=r7+112;r10=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r11=r7+8|0;r12=r8|0;HEAP8[r12]=37;r13=r8+1|0;HEAP8[r13]=r5;r14=r8+2|0;HEAP8[r14]=r6;HEAP8[r8+3|0]=0;if(r6<<24>>24!=0){HEAP8[r13]=r6;HEAP8[r14]=r5}r5=r1|0;_strftime(r11,100,r12,r4,HEAP32[r5>>2]);HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;HEAP32[r10>>2]=r11;r11=HEAP32[r3>>2]-r2>>2;r4=_uselocale(HEAP32[r5>>2]);r5=_mbsrtowcs(r2,r10,r11,r9);if((r4|0)!=0){_uselocale(r4)}if((r5|0)==-1){__ZNSt3__121__throw_runtime_errorEPKc(1336)}else{HEAP32[r3>>2]=(r5<<2)+r2;STACKTOP=r7;return}}function __ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+280|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+120;r14=r9+128;r15=r9+136;r16=r9+144;r17=r9+152;r18=r9+160;r19=r9+176;r20=(r13|0)>>2;HEAP32[r20]=r12;r21=r13+4|0;HEAP32[r21>>2]=452;r22=r12+100|0;__ZNKSt3__18ios_base6getlocEv(r15,r6);r12=r15|0;r23=HEAP32[r12>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r11]=14464;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r10,260)}r10=HEAP32[3617]-1|0;r11=HEAP32[r23+8>>2];do{if(HEAP32[r23+12>>2]-r11>>2>>>0>r10>>>0){r24=HEAP32[r11+(r10<<2)>>2];if((r24|0)==0){break}r25=r24;HEAP8[r16]=0;r26=(r4|0)>>2;HEAP32[r17>>2]=HEAP32[r26];do{if(__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r25,r13,r14,r22)){r27=r18|0;FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+32>>2]](r25,2928,2938,r27);r28=r19|0;r29=HEAP32[r14>>2];r30=HEAP32[r20];r31=r29-r30|0;do{if((r31|0)>98){r32=_malloc(r31+2|0);if((r32|0)!=0){r33=r32;r34=r32;break}__ZSt17__throw_bad_allocv();r33=0;r34=0}else{r33=r28;r34=0}}while(0);if((HEAP8[r16]&1)==0){r35=r33}else{HEAP8[r33]=45;r35=r33+1|0}if(r30>>>0<r29>>>0){r31=r18+10|0;r32=r18;r36=r35;r37=r30;while(1){r38=r27;while(1){if((r38|0)==(r31|0)){r39=r31;break}if((HEAP8[r38]|0)==(HEAP8[r37]|0)){r39=r38;break}else{r38=r38+1|0}}HEAP8[r36]=HEAP8[r39-r32+2928|0];r38=r37+1|0;r40=r36+1|0;if(r38>>>0<HEAP32[r14>>2]>>>0){r36=r40;r37=r38}else{r41=r40;break}}}else{r41=r35}HEAP8[r41]=0;if((_sscanf(r28,2080,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1){if((r34|0)==0){break}_free(r34);break}r37=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r37,2008);___cxa_throw(r37,9256,44)}}while(0);r25=r3|0;r24=HEAP32[r25>>2],r37=r24>>2;do{if((r24|0)==0){r42=0}else{if((HEAP32[r37+3]|0)!=(HEAP32[r37+4]|0)){r42=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r24)|0)!=-1){r42=r24;break}HEAP32[r25>>2]=0;r42=0}}while(0);r25=(r42|0)==0;r24=HEAP32[r26],r37=r24>>2;do{if((r24|0)==0){r2=2135}else{if((HEAP32[r37+3]|0)!=(HEAP32[r37+4]|0)){if(r25){break}else{r2=2137;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r24)|0)==-1){HEAP32[r26]=0;r2=2135;break}else{if(r25^(r24|0)==0){break}else{r2=2137;break}}}}while(0);if(r2==2135){if(r25){r2=2137}}if(r2==2137){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r42;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r12>>2]|0);r24=HEAP32[r20];HEAP32[r20]=0;if((r24|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r21>>2]](r24);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9240,382)}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147;r12=r10>>2;r10=r6>>2;r6=0;r13=STACKTOP;STACKTOP=STACKTOP+440|0;r14=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r14>>2];r14=r13;r15=r13+400;r16=r13+408;r17=r13+416;r18=r13+424;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP,r26=r25>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=r14|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r21,r29=r20>>2;r30=r22,r31=r30>>2;r32=r23,r33=r32>>2;r34=r24,r35=r34>>2;HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;HEAP32[r35]=0;HEAP32[r35+1]=0;HEAP32[r35+2]=0;__ZNSt3__111__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri(r3,r4,r15,r16,r17,r18,r21,r22,r23,r25);r25=(r9|0)>>2;HEAP32[r12]=HEAP32[r25];r4=(r1|0)>>2;r1=(r2|0)>>2;r2=(r8+8|0)>>2;r8=r23+1|0;r3=(r23+4|0)>>2;r35=r23+8|0;r33=r22+1|0;r31=(r22+4|0)>>2;r29=r22+8|0;r36=(r5&512|0)!=0;r5=r21+1|0;r37=(r21+4|0)>>2;r38=(r21+8|0)>>2;r39=r24+1|0;r40=r24+4|0;r41=r24+8|0;r42=r15+3|0;r43=(r9+4|0)>>2;r9=r18+4|0;r44=r11;r11=452;r45=r28;r46=r28;r28=r14+400|0;r14=0;r47=0;L2588:while(1){r48=HEAP32[r4],r49=r48>>2;do{if((r48|0)==0){r50=0}else{if((HEAP32[r49+3]|0)!=(HEAP32[r49+4]|0)){r50=r48;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r49]+36>>2]](r48)|0)==-1){HEAP32[r4]=0;r50=0;break}else{r50=HEAP32[r4];break}}}while(0);r48=(r50|0)==0;r49=HEAP32[r1],r51=r49>>2;do{if((r49|0)==0){r6=2162}else{if((HEAP32[r51+3]|0)!=(HEAP32[r51+4]|0)){if(r48){r52=r49;break}else{r53=r11;r54=r45;r55=r46;r56=r14;r6=2414;break L2588}}if((FUNCTION_TABLE[HEAP32[HEAP32[r51]+36>>2]](r49)|0)==-1){HEAP32[r1]=0;r6=2162;break}else{if(r48){r52=r49;break}else{r53=r11;r54=r45;r55=r46;r56=r14;r6=2414;break L2588}}}}while(0);if(r6==2162){r6=0;if(r48){r53=r11;r54=r45;r55=r46;r56=r14;r6=2414;break}else{r52=0}}r49=HEAP8[r15+r47|0]|0;do{if((r49|0)==0){r6=2188}else if((r49|0)==3){r51=HEAP8[r30];r57=r51&255;r58=(r57&1|0)==0?r57>>>1:HEAP32[r31];r57=HEAP8[r32];r59=r57&255;r60=(r59&1|0)==0?r59>>>1:HEAP32[r3];if((r58|0)==(-r60|0)){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}r59=(r58|0)==0;r58=HEAP32[r4],r67=r58>>2;r68=HEAP32[r67+3];r69=HEAP32[r67+4];r70=(r68|0)==(r69|0);if(!(r59|(r60|0)==0)){if(r70){r60=FUNCTION_TABLE[HEAP32[HEAP32[r67]+36>>2]](r58)&255;r71=HEAP32[r4];r72=r60;r73=HEAP8[r30];r74=r71;r75=HEAP32[r71+12>>2];r76=HEAP32[r71+16>>2]}else{r72=HEAP8[r68];r73=r51;r74=r58;r75=r68;r76=r69}r69=r74+12|0;r71=(r75|0)==(r76|0);if(r72<<24>>24==(HEAP8[(r73&1)==0?r33:HEAP32[r29>>2]]|0)){if(r71){FUNCTION_TABLE[HEAP32[HEAP32[r74>>2]+40>>2]](r74)}else{HEAP32[r69>>2]=r75+1}r69=HEAPU8[r30];r61=((r69&1|0)==0?r69>>>1:HEAP32[r31])>>>0>1?r22:r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}if(r71){r77=FUNCTION_TABLE[HEAP32[HEAP32[r74>>2]+36>>2]](r74)&255}else{r77=HEAP8[r75]}if(r77<<24>>24!=(HEAP8[(HEAP8[r32]&1)==0?r8:HEAP32[r35>>2]]|0)){r6=2254;break L2588}r71=HEAP32[r4];r69=r71+12|0;r60=HEAP32[r69>>2];if((r60|0)==(HEAP32[r71+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r71>>2]+40>>2]](r71)}else{HEAP32[r69>>2]=r60+1}HEAP8[r7]=1;r60=HEAPU8[r32];r61=((r60&1|0)==0?r60>>>1:HEAP32[r3])>>>0>1?r23:r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}if(r59){if(r70){r78=FUNCTION_TABLE[HEAP32[HEAP32[r67]+36>>2]](r58)&255;r79=HEAP8[r32]}else{r78=HEAP8[r68];r79=r57}if(r78<<24>>24!=(HEAP8[(r79&1)==0?r8:HEAP32[r35>>2]]|0)){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}r57=HEAP32[r4];r59=r57+12|0;r60=HEAP32[r59>>2];if((r60|0)==(HEAP32[r57+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+40>>2]](r57)}else{HEAP32[r59>>2]=r60+1}HEAP8[r7]=1;r60=HEAPU8[r32];r61=((r60&1|0)==0?r60>>>1:HEAP32[r3])>>>0>1?r23:r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}if(r70){r80=FUNCTION_TABLE[HEAP32[HEAP32[r67]+36>>2]](r58)&255;r81=HEAP8[r30]}else{r80=HEAP8[r68];r81=r51}if(r80<<24>>24!=(HEAP8[(r81&1)==0?r33:HEAP32[r29>>2]]|0)){HEAP8[r7]=1;r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}r51=HEAP32[r4];r68=r51+12|0;r58=HEAP32[r68>>2];if((r58|0)==(HEAP32[r51+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r51>>2]+40>>2]](r51)}else{HEAP32[r68>>2]=r58+1}r58=HEAPU8[r30];r61=((r58&1|0)==0?r58>>>1:HEAP32[r31])>>>0>1?r22:r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44}else if((r49|0)==1){if((r47|0)==3){r53=r11;r54=r45;r55=r46;r56=r14;r6=2414;break L2588}r58=HEAP32[r4],r68=r58>>2;r51=HEAP32[r68+3];if((r51|0)==(HEAP32[r68+4]|0)){r82=FUNCTION_TABLE[HEAP32[HEAP32[r68]+36>>2]](r58)&255}else{r82=HEAP8[r51]}if(r82<<24>>24<=-1){r6=2187;break L2588}if((HEAP16[HEAP32[r2]+(r82<<24>>24<<1)>>1]&8192)==0){r6=2187;break L2588}r51=HEAP32[r4];r58=r51+12|0;r68=HEAP32[r58>>2];if((r68|0)==(HEAP32[r51+16>>2]|0)){r83=FUNCTION_TABLE[HEAP32[HEAP32[r51>>2]+40>>2]](r51)&255}else{HEAP32[r58>>2]=r68+1;r83=HEAP8[r68]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r24,r83);r6=2188}else if((r49|0)==2){if(!((r14|0)!=0|r47>>>0<2)){if((r47|0)==2){r84=(HEAP8[r42]|0)!=0}else{r84=0}if(!(r36|r84)){r61=0;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}}r68=HEAP8[r20];r58=(r68&1)==0?r5:HEAP32[r38];L2684:do{if((r47|0)==0){r85=r58}else{if(HEAPU8[r15+(r47-1)|0]>=2){r85=r58;break}r51=r68&255;r67=r58+((r51&1|0)==0?r51>>>1:HEAP32[r37])|0;r51=r58;while(1){if((r51|0)==(r67|0)){r86=r67;break}r70=HEAP8[r51];if(r70<<24>>24<=-1){r86=r51;break}if((HEAP16[HEAP32[r2]+(r70<<24>>24<<1)>>1]&8192)==0){r86=r51;break}else{r51=r51+1|0}}r51=r86-r58|0;r67=HEAP8[r34];r70=r67&255;r60=(r70&1|0)==0?r70>>>1:HEAP32[r40>>2];if(r51>>>0>r60>>>0){r85=r58;break}r70=(r67&1)==0?r39:HEAP32[r41>>2];r67=r70+r60|0;if((r86|0)==(r58|0)){r85=r58;break}r59=r58;r57=r70+(r60-r51)|0;while(1){if((HEAP8[r57]|0)!=(HEAP8[r59]|0)){r85=r58;break L2684}r51=r57+1|0;if((r51|0)==(r67|0)){r85=r86;break}else{r59=r59+1|0;r57=r51}}}}while(0);r57=r68&255;L2698:do{if((r85|0)==(r58+((r57&1|0)==0?r57>>>1:HEAP32[r37])|0)){r87=r85}else{r59=r52,r67=r59>>2;r51=r85;while(1){r60=HEAP32[r4],r70=r60>>2;do{if((r60|0)==0){r88=0}else{if((HEAP32[r70+3]|0)!=(HEAP32[r70+4]|0)){r88=r60;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r70]+36>>2]](r60)|0)==-1){HEAP32[r4]=0;r88=0;break}else{r88=HEAP32[r4];break}}}while(0);r60=(r88|0)==0;do{if((r59|0)==0){r6=2283}else{if((HEAP32[r67+3]|0)!=(HEAP32[r67+4]|0)){if(r60){r89=r59;break}else{r87=r51;break L2698}}if((FUNCTION_TABLE[HEAP32[HEAP32[r67]+36>>2]](r59)|0)==-1){HEAP32[r1]=0;r6=2283;break}else{if(r60){r89=r59;break}else{r87=r51;break L2698}}}}while(0);if(r6==2283){r6=0;if(r60){r87=r51;break L2698}else{r89=0}}r70=HEAP32[r4],r69=r70>>2;r71=HEAP32[r69+3];if((r71|0)==(HEAP32[r69+4]|0)){r90=FUNCTION_TABLE[HEAP32[HEAP32[r69]+36>>2]](r70)&255}else{r90=HEAP8[r71]}if(r90<<24>>24!=(HEAP8[r51]|0)){r87=r51;break L2698}r71=HEAP32[r4];r70=r71+12|0;r69=HEAP32[r70>>2];if((r69|0)==(HEAP32[r71+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r71>>2]+40>>2]](r71)}else{HEAP32[r70>>2]=r69+1}r69=r51+1|0;r70=HEAP8[r20];r71=r70&255;if((r69|0)==(((r70&1)==0?r5:HEAP32[r38])+((r71&1|0)==0?r71>>>1:HEAP32[r37])|0)){r87=r69;break}else{r59=r89,r67=r59>>2;r51=r69}}}}while(0);if(!r36){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break}r57=HEAP8[r20];r58=r57&255;if((r87|0)==(((r57&1)==0?r5:HEAP32[r38])+((r58&1|0)==0?r58>>>1:HEAP32[r37])|0)){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44}else{r6=2296;break L2588}}else if((r49|0)==4){r58=0;r57=r28;r68=r46;r51=r45;r59=r11;r67=r44;L2733:while(1){r69=HEAP32[r4],r71=r69>>2;do{if((r69|0)==0){r91=0}else{if((HEAP32[r71+3]|0)!=(HEAP32[r71+4]|0)){r91=r69;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r71]+36>>2]](r69)|0)==-1){HEAP32[r4]=0;r91=0;break}else{r91=HEAP32[r4];break}}}while(0);r69=(r91|0)==0;r71=HEAP32[r1],r70=r71>>2;do{if((r71|0)==0){r6=2309}else{if((HEAP32[r70+3]|0)!=(HEAP32[r70+4]|0)){if(r69){break}else{break L2733}}if((FUNCTION_TABLE[HEAP32[HEAP32[r70]+36>>2]](r71)|0)==-1){HEAP32[r1]=0;r6=2309;break}else{if(r69){break}else{break L2733}}}}while(0);if(r6==2309){r6=0;if(r69){break}}r71=HEAP32[r4],r70=r71>>2;r92=HEAP32[r70+3];if((r92|0)==(HEAP32[r70+4]|0)){r93=FUNCTION_TABLE[HEAP32[HEAP32[r70]+36>>2]](r71)&255}else{r93=HEAP8[r92]}do{if(r93<<24>>24>-1){if((HEAP16[HEAP32[r2]+(r93<<24>>24<<1)>>1]&2048)==0){r6=2328;break}r92=HEAP32[r12];if((r92|0)==(r67|0)){r71=(HEAP32[r43]|0)!=452;r70=HEAP32[r25];r94=r67-r70|0;r95=r94>>>0<2147483647?r94<<1:-1;r96=_realloc(r71?r70:0,r95);if((r96|0)==0){__ZSt17__throw_bad_allocv()}do{if(r71){HEAP32[r25]=r96;r97=r96}else{r70=HEAP32[r25];HEAP32[r25]=r96;if((r70|0)==0){r97=r96;break}FUNCTION_TABLE[HEAP32[r43]](r70);r97=HEAP32[r25]}}while(0);HEAP32[r43]=228;r96=r97+r94|0;HEAP32[r12]=r96;r98=HEAP32[r25]+r95|0;r99=r96}else{r98=r67;r99=r92}HEAP32[r12]=r99+1;HEAP8[r99]=r93;r100=r58+1|0;r101=r57;r102=r68;r103=r51;r104=r59;r105=r98}else{r6=2328}}while(0);if(r6==2328){r6=0;r69=HEAPU8[r19];if((((r69&1|0)==0?r69>>>1:HEAP32[r9>>2])|0)==0|(r58|0)==0){break}if(r93<<24>>24!=(HEAP8[r17]|0)){break}if((r68|0)==(r57|0)){r69=r68-r51|0;r96=r69>>>0<2147483647?r69<<1:-1;if((r59|0)==452){r106=0}else{r106=r51}r71=_realloc(r106,r96);r60=r71;if((r71|0)==0){__ZSt17__throw_bad_allocv()}r107=(r96>>>2<<2)+r60|0;r108=(r69>>2<<2)+r60|0;r109=r60;r110=228}else{r107=r57;r108=r68;r109=r51;r110=r59}HEAP32[r108>>2]=r58;r100=0;r101=r107;r102=r108+4|0;r103=r109;r104=r110;r105=r67}r60=HEAP32[r4];r69=r60+12|0;r96=HEAP32[r69>>2];if((r96|0)==(HEAP32[r60+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r60>>2]+40>>2]](r60);r58=r100;r57=r101;r68=r102;r51=r103;r59=r104;r67=r105;continue}else{HEAP32[r69>>2]=r96+1;r58=r100;r57=r101;r68=r102;r51=r103;r59=r104;r67=r105;continue}}if((r51|0)==(r68|0)|(r58|0)==0){r111=r57;r112=r68;r113=r51;r114=r59}else{if((r68|0)==(r57|0)){r96=r68-r51|0;r69=r96>>>0<2147483647?r96<<1:-1;if((r59|0)==452){r115=0}else{r115=r51}r60=_realloc(r115,r69);r71=r60;if((r60|0)==0){__ZSt17__throw_bad_allocv()}r116=(r69>>>2<<2)+r71|0;r117=(r96>>2<<2)+r71|0;r118=r71;r119=228}else{r116=r57;r117=r68;r118=r51;r119=r59}HEAP32[r117>>2]=r58;r111=r116;r112=r117+4|0;r113=r118;r114=r119}if((HEAP32[r26]|0)>0){r71=HEAP32[r4],r96=r71>>2;do{if((r71|0)==0){r120=0}else{if((HEAP32[r96+3]|0)!=(HEAP32[r96+4]|0)){r120=r71;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r96]+36>>2]](r71)|0)==-1){HEAP32[r4]=0;r120=0;break}else{r120=HEAP32[r4];break}}}while(0);r71=(r120|0)==0;r96=HEAP32[r1],r58=r96>>2;do{if((r96|0)==0){r6=2361}else{if((HEAP32[r58+3]|0)!=(HEAP32[r58+4]|0)){if(r71){r121=r96;break}else{r6=2368;break L2588}}if((FUNCTION_TABLE[HEAP32[HEAP32[r58]+36>>2]](r96)|0)==-1){HEAP32[r1]=0;r6=2361;break}else{if(r71){r121=r96;break}else{r6=2368;break L2588}}}}while(0);if(r6==2361){r6=0;if(r71){r6=2368;break L2588}else{r121=0}}r96=HEAP32[r4],r58=r96>>2;r59=HEAP32[r58+3];if((r59|0)==(HEAP32[r58+4]|0)){r122=FUNCTION_TABLE[HEAP32[HEAP32[r58]+36>>2]](r96)&255}else{r122=HEAP8[r59]}if(r122<<24>>24!=(HEAP8[r16]|0)){r6=2368;break L2588}r59=HEAP32[r4];r96=r59+12|0;r58=HEAP32[r96>>2];if((r58|0)==(HEAP32[r59+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+40>>2]](r59);r123=r67;r124=r121,r125=r124>>2}else{HEAP32[r96>>2]=r58+1;r123=r67;r124=r121,r125=r124>>2}while(1){r58=HEAP32[r4],r96=r58>>2;do{if((r58|0)==0){r126=0}else{if((HEAP32[r96+3]|0)!=(HEAP32[r96+4]|0)){r126=r58;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r96]+36>>2]](r58)|0)==-1){HEAP32[r4]=0;r126=0;break}else{r126=HEAP32[r4];break}}}while(0);r58=(r126|0)==0;do{if((r124|0)==0){r6=2384}else{if((HEAP32[r125+3]|0)!=(HEAP32[r125+4]|0)){if(r58){r127=r124;break}else{r6=2392;break L2588}}if((FUNCTION_TABLE[HEAP32[HEAP32[r125]+36>>2]](r124)|0)==-1){HEAP32[r1]=0;r6=2384;break}else{if(r58){r127=r124;break}else{r6=2392;break L2588}}}}while(0);if(r6==2384){r6=0;if(r58){r6=2392;break L2588}else{r127=0}}r96=HEAP32[r4],r59=r96>>2;r51=HEAP32[r59+3];if((r51|0)==(HEAP32[r59+4]|0)){r128=FUNCTION_TABLE[HEAP32[HEAP32[r59]+36>>2]](r96)&255}else{r128=HEAP8[r51]}if(r128<<24>>24<=-1){r6=2392;break L2588}if((HEAP16[HEAP32[r2]+(r128<<24>>24<<1)>>1]&2048)==0){r6=2392;break L2588}r51=HEAP32[r12];if((r51|0)==(r123|0)){r96=(HEAP32[r43]|0)!=452;r59=HEAP32[r25];r68=r123-r59|0;r57=r68>>>0<2147483647?r68<<1:-1;r69=_realloc(r96?r59:0,r57);if((r69|0)==0){__ZSt17__throw_bad_allocv()}do{if(r96){HEAP32[r25]=r69;r129=r69}else{r59=HEAP32[r25];HEAP32[r25]=r69;if((r59|0)==0){r129=r69;break}FUNCTION_TABLE[HEAP32[r43]](r59);r129=HEAP32[r25]}}while(0);HEAP32[r43]=228;r69=r129+r68|0;HEAP32[r12]=r69;r130=HEAP32[r25]+r57|0;r131=r69}else{r130=r123;r131=r51}r69=HEAP32[r4],r96=r69>>2;r58=HEAP32[r96+3];if((r58|0)==(HEAP32[r96+4]|0)){r132=FUNCTION_TABLE[HEAP32[HEAP32[r96]+36>>2]](r69)&255;r133=HEAP32[r12]}else{r132=HEAP8[r58];r133=r131}HEAP32[r12]=r133+1;HEAP8[r133]=r132;r58=HEAP32[r26]-1|0;HEAP32[r26]=r58;r69=HEAP32[r4];r96=r69+12|0;r59=HEAP32[r96>>2];if((r59|0)==(HEAP32[r69+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r69>>2]+40>>2]](r69)}else{HEAP32[r96>>2]=r59+1}if((r58|0)>0){r123=r130;r124=r127,r125=r124>>2}else{r134=r130;break}}}else{r134=r67}if((HEAP32[r12]|0)==(HEAP32[r25]|0)){r6=2412;break L2588}else{r61=r14;r62=r111;r63=r112;r64=r113;r65=r114;r66=r134}}else{r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44}}while(0);L2887:do{if(r6==2188){r6=0;if((r47|0)==3){r53=r11;r54=r45;r55=r46;r56=r14;r6=2414;break L2588}else{r135=r52,r136=r135>>2}while(1){r49=HEAP32[r4],r48=r49>>2;do{if((r49|0)==0){r137=0}else{if((HEAP32[r48+3]|0)!=(HEAP32[r48+4]|0)){r137=r49;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r48]+36>>2]](r49)|0)==-1){HEAP32[r4]=0;r137=0;break}else{r137=HEAP32[r4];break}}}while(0);r49=(r137|0)==0;do{if((r135|0)==0){r6=2201}else{if((HEAP32[r136+3]|0)!=(HEAP32[r136+4]|0)){if(r49){r138=r135;break}else{r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break L2887}}if((FUNCTION_TABLE[HEAP32[HEAP32[r136]+36>>2]](r135)|0)==-1){HEAP32[r1]=0;r6=2201;break}else{if(r49){r138=r135;break}else{r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break L2887}}}}while(0);if(r6==2201){r6=0;if(r49){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break L2887}else{r138=0}}r48=HEAP32[r4],r51=r48>>2;r57=HEAP32[r51+3];if((r57|0)==(HEAP32[r51+4]|0)){r139=FUNCTION_TABLE[HEAP32[HEAP32[r51]+36>>2]](r48)&255}else{r139=HEAP8[r57]}if(r139<<24>>24<=-1){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break L2887}if((HEAP16[HEAP32[r2]+(r139<<24>>24<<1)>>1]&8192)==0){r61=r14;r62=r28;r63=r46;r64=r45;r65=r11;r66=r44;break L2887}r57=HEAP32[r4];r48=r57+12|0;r51=HEAP32[r48>>2];if((r51|0)==(HEAP32[r57+16>>2]|0)){r140=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+40>>2]](r57)&255}else{HEAP32[r48>>2]=r51+1;r140=HEAP8[r51]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r24,r140);r135=r138,r136=r135>>2}}}while(0);r67=r47+1|0;if(r67>>>0<4){r44=r66;r11=r65;r45=r64;r46=r63;r28=r62;r14=r61;r47=r67}else{r53=r65;r54=r64;r55=r63;r56=r61;r6=2414;break}}L2924:do{if(r6==2187){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r45;r143=r11}else if(r6==2254){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r45;r143=r11}else if(r6==2296){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r45;r143=r11}else if(r6==2368){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r113;r143=r114}else if(r6==2392){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r113;r143=r114}else if(r6==2412){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r113;r143=r114}else if(r6==2414){L2932:do{if((r56|0)!=0){r61=r56;r63=r56+1|0;r64=r56+8|0;r65=r56+4|0;r47=1;L2934:while(1){r14=HEAPU8[r61];if((r14&1|0)==0){r144=r14>>>1}else{r144=HEAP32[r65>>2]}if(r47>>>0>=r144>>>0){break L2932}r14=HEAP32[r4],r62=r14>>2;do{if((r14|0)==0){r145=0}else{if((HEAP32[r62+3]|0)!=(HEAP32[r62+4]|0)){r145=r14;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r14)|0)==-1){HEAP32[r4]=0;r145=0;break}else{r145=HEAP32[r4];break}}}while(0);r14=(r145|0)==0;r62=HEAP32[r1],r49=r62>>2;do{if((r62|0)==0){r6=2432}else{if((HEAP32[r49+3]|0)!=(HEAP32[r49+4]|0)){if(r14){break}else{break L2934}}if((FUNCTION_TABLE[HEAP32[HEAP32[r49]+36>>2]](r62)|0)==-1){HEAP32[r1]=0;r6=2432;break}else{if(r14){break}else{break L2934}}}}while(0);if(r6==2432){r6=0;if(r14){break}}r62=HEAP32[r4],r49=r62>>2;r28=HEAP32[r49+3];if((r28|0)==(HEAP32[r49+4]|0)){r146=FUNCTION_TABLE[HEAP32[HEAP32[r49]+36>>2]](r62)&255}else{r146=HEAP8[r28]}if((HEAP8[r61]&1)==0){r147=r63}else{r147=HEAP32[r64>>2]}if(r146<<24>>24!=(HEAP8[r147+r47|0]|0)){break}r28=r47+1|0;r62=HEAP32[r4];r49=r62+12|0;r46=HEAP32[r49>>2];if((r46|0)==(HEAP32[r62+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+40>>2]](r62);r47=r28;continue}else{HEAP32[r49>>2]=r46+1;r47=r28;continue}}HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r54;r143=r53;break L2924}}while(0);if((r54|0)==(r55|0)){r141=1;r142=r55;r143=r53;break}HEAP32[r27>>2]=0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r18,r54,r55,r27);if((HEAP32[r27>>2]|0)==0){r141=1;r142=r54;r143=r53;break}HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r54;r143=r53}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r24);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r23);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r22);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);if((r142|0)==0){STACKTOP=r13;return r141}FUNCTION_TABLE[r143](r142);STACKTOP=r13;return r141}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendIPcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=r1;r5=r2;r6=HEAP8[r4];r7=r6&255;if((r7&1|0)==0){r8=r7>>>1}else{r8=HEAP32[r1+4>>2]}if((r6&1)==0){r9=10;r10=r6}else{r6=HEAP32[r1>>2];r9=(r6&-2)-1|0;r10=r6&255}r6=r3-r5|0;if((r3|0)==(r2|0)){return r1}if((r9-r8|0)>>>0<r6>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r9,r8+r6-r9|0,r8,r8,0,0);r11=HEAP8[r4]}else{r11=r10}if((r11&1)==0){r12=r1+1|0}else{r12=HEAP32[r1+8>>2]}r11=r3+(r8-r5)|0;r5=r2;r2=r12+r8|0;while(1){HEAP8[r2]=HEAP8[r5];r10=r5+1|0;if((r10|0)==(r3|0)){break}else{r5=r10;r2=r2+1|0}}HEAP8[r12+r11|0]=0;r11=r8+r6|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r11<<1&255;return r1}else{HEAP32[r1+4>>2]=r11;return r1}}function __ZNSt3__121__throw_runtime_errorEPKc(r1){var r2;r2=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r2,r1);___cxa_throw(r2,9256,44)}function __ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIcS3_NS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+160|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+120;r14=r9+128;r15=r9+136;r16=r9+144;r17=r9+152;r18=(r13|0)>>2;HEAP32[r18]=r12;r19=r13+4|0;HEAP32[r19>>2]=452;r20=r12+100|0;__ZNKSt3__18ios_base6getlocEv(r15,r6);r12=r15|0;r21=HEAP32[r12>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r11]=14464;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r10,260)}r10=HEAP32[3617]-1|0;r11=HEAP32[r21+8>>2];do{if(HEAP32[r21+12>>2]-r11>>2>>>0>r10>>>0){r22=HEAP32[r11+(r10<<2)>>2];if((r22|0)==0){break}r23=r22;HEAP8[r16]=0;r24=r4|0;r25=HEAP32[r24>>2],r26=r25>>2;HEAP32[r17>>2]=r25;if(__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r23,r13,r14,r20)){r27=r8;if((HEAP8[r27]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r27]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}r27=r22;if((HEAP8[r16]&1)!=0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r8,FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+28>>2]](r23,45))}r22=FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+28>>2]](r23,48);r23=HEAP32[r14>>2];r27=r23-1|0;r28=HEAP32[r18];while(1){if(r28>>>0>=r27>>>0){break}if((HEAP8[r28]|0)==r22<<24>>24){r28=r28+1|0}else{break}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendIPcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r8,r28,r23)}r22=r3|0;r27=HEAP32[r22>>2],r29=r27>>2;do{if((r27|0)==0){r30=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r30=r27;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r27)|0)!=-1){r30=r27;break}HEAP32[r22>>2]=0;r30=0}}while(0);r22=(r30|0)==0;do{if((r25|0)==0){r2=2510}else{if((HEAP32[r26+3]|0)!=(HEAP32[r26+4]|0)){if(r22){break}else{r2=2512;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)|0)==-1){HEAP32[r24>>2]=0;r2=2510;break}else{if(r22^(r25|0)==0){break}else{r2=2512;break}}}}while(0);if(r2==2510){if(r22){r2=2512}}if(r2==2512){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r30;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r12>>2]|0);r25=HEAP32[r18];HEAP32[r18]=0;if((r25|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r19>>2]](r25);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9240,382)}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__111__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r11=STACKTOP;STACKTOP=STACKTOP+56|0;r12=r11,r13=r12>>2;r14=r11+16,r15=r14>>2;r16=r11+32;r17=r11+40;r18=r17>>2;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r29=r28>>2;r30=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r31=r30>>2;r32=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r33=r32>>2;if(r1){r1=HEAP32[r2>>2];if((HEAP32[3734]|0)!=-1){HEAP32[r15]=14936;HEAP32[r15+1]=26;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14936,r14,260)}r14=HEAP32[3735]-1|0;r15=HEAP32[r1+8>>2];if(HEAP32[r1+12>>2]-r15>>2>>>0<=r14>>>0){r34=___cxa_allocate_exception(4);r35=r34;__ZNSt8bad_castC2Ev(r35);___cxa_throw(r34,9240,382)}r1=HEAP32[r15+(r14<<2)>>2];if((r1|0)==0){r34=___cxa_allocate_exception(4);r35=r34;__ZNSt8bad_castC2Ev(r35);___cxa_throw(r34,9240,382)}r34=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r16,r34);r35=r3;tempBigInt=HEAP32[r16>>2];HEAP8[r35]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+3|0]=tempBigInt&255;r35=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r35]+32>>2]](r17,r34);r16=r9,r14=r16>>2;if((HEAP8[r16]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r16]=0}else{HEAP8[HEAP32[r9+8>>2]]=0;HEAP32[r9+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r14]=HEAP32[r18];HEAP32[r14+1]=HEAP32[r18+1];HEAP32[r14+2]=HEAP32[r18+2];HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);FUNCTION_TABLE[HEAP32[HEAP32[r35]+28>>2]](r19,r34);r17=r8,r18=r17>>2;if((HEAP8[r17]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r17]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r18]=HEAP32[r20];HEAP32[r18+1]=HEAP32[r20+1];HEAP32[r18+2]=HEAP32[r20+2];HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19);r19=r1;r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+12>>2]](r34);HEAP8[r4]=r20;r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+16>>2]](r34);HEAP8[r5]=r20;FUNCTION_TABLE[HEAP32[HEAP32[r35]+20>>2]](r21,r34);r20=r6,r19=r20>>2;if((HEAP8[r20]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r20]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r19]=HEAP32[r22];HEAP32[r19+1]=HEAP32[r22+1];HEAP32[r19+2]=HEAP32[r22+2];HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);FUNCTION_TABLE[HEAP32[HEAP32[r35]+24>>2]](r23,r34);r35=r7,r21=r35>>2;if((HEAP8[r35]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r35]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r21]=HEAP32[r24];HEAP32[r21+1]=HEAP32[r24+1];HEAP32[r21+2]=HEAP32[r24+2];HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r23);r36=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r34);HEAP32[r10>>2]=r36;STACKTOP=r11;return}else{r34=HEAP32[r2>>2];if((HEAP32[3736]|0)!=-1){HEAP32[r13]=14944;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14944,r12,260)}r12=HEAP32[3737]-1|0;r13=HEAP32[r34+8>>2];if(HEAP32[r34+12>>2]-r13>>2>>>0<=r12>>>0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9240,382)}r34=HEAP32[r13+(r12<<2)>>2];if((r34|0)==0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9240,382)}r37=r34;FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+44>>2]](r25,r37);r38=r3;tempBigInt=HEAP32[r25>>2];HEAP8[r38]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+3|0]=tempBigInt&255;r38=r34>>2;FUNCTION_TABLE[HEAP32[HEAP32[r38]+32>>2]](r26,r37);r25=r9,r3=r25>>2;if((HEAP8[r25]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r25]=0}else{HEAP8[HEAP32[r9+8>>2]]=0;HEAP32[r9+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r3]=HEAP32[r27];HEAP32[r3+1]=HEAP32[r27+1];HEAP32[r3+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r26);FUNCTION_TABLE[HEAP32[HEAP32[r38]+28>>2]](r28,r37);r26=r8,r27=r26>>2;if((HEAP8[r26]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r26]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r27]=HEAP32[r29];HEAP32[r27+1]=HEAP32[r29+1];HEAP32[r27+2]=HEAP32[r29+2];HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r28);r28=r34;r29=FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+12>>2]](r37);HEAP8[r4]=r29;r29=FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+16>>2]](r37);HEAP8[r5]=r29;FUNCTION_TABLE[HEAP32[HEAP32[r38]+20>>2]](r30,r37);r29=r6,r5=r29>>2;if((HEAP8[r29]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r29]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r5]=HEAP32[r31];HEAP32[r5+1]=HEAP32[r31+1];HEAP32[r5+2]=HEAP32[r31+2];HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r30);FUNCTION_TABLE[HEAP32[HEAP32[r38]+24>>2]](r32,r37);r38=r7,r30=r38>>2;if((HEAP8[r38]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r38]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r30]=HEAP32[r33];HEAP32[r30+1]=HEAP32[r33+1];HEAP32[r30+2]=HEAP32[r33+2];HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r32);r36=FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+36>>2]](r37);HEAP32[r10>>2]=r36;STACKTOP=r11;return}}function __ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+600|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+416;r14=r9+424;r15=r9+432;r16=r9+440;r17=r9+448;r18=r9+456;r19=r9+496;r20=(r13|0)>>2;HEAP32[r20]=r12;r21=r13+4|0;HEAP32[r21>>2]=452;r22=r12+400|0;__ZNKSt3__18ios_base6getlocEv(r15,r6);r12=r15|0;r23=HEAP32[r12>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r11]=14456;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r10,260)}r10=HEAP32[3615]-1|0;r11=HEAP32[r23+8>>2];do{if(HEAP32[r23+12>>2]-r11>>2>>>0>r10>>>0){r24=HEAP32[r11+(r10<<2)>>2];if((r24|0)==0){break}r25=r24;HEAP8[r16]=0;r26=(r4|0)>>2;HEAP32[r17>>2]=HEAP32[r26];do{if(__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r25,r13,r14,r22)){r27=r18|0;FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+48>>2]](r25,2912,2922,r27);r28=r19|0;r29=HEAP32[r14>>2];r30=HEAP32[r20];r31=r29-r30|0;do{if((r31|0)>392){r32=_malloc(r31+8>>2|0);if((r32|0)!=0){r33=r32;r34=r32;break}__ZSt17__throw_bad_allocv();r33=0;r34=0}else{r33=r28;r34=0}}while(0);if((HEAP8[r16]&1)==0){r35=r33}else{HEAP8[r33]=45;r35=r33+1|0}if(r30>>>0<r29>>>0){r31=r18+40|0;r32=r18;r36=r35;r37=r30;while(1){r38=r27;while(1){if((r38|0)==(r31|0)){r39=r31;break}if((HEAP32[r38>>2]|0)==(HEAP32[r37>>2]|0)){r39=r38;break}else{r38=r38+4|0}}HEAP8[r36]=HEAP8[r39-r32+11648>>2|0];r38=r37+4|0;r40=r36+1|0;if(r38>>>0<HEAP32[r14>>2]>>>0){r36=r40;r37=r38}else{r41=r40;break}}}else{r41=r35}HEAP8[r41]=0;if((_sscanf(r28,2080,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1){if((r34|0)==0){break}_free(r34);break}r37=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r37,2008);___cxa_throw(r37,9256,44)}}while(0);r25=r3|0;r24=HEAP32[r25>>2],r37=r24>>2;do{if((r24|0)==0){r42=0}else{r36=HEAP32[r37+3];if((r36|0)==(HEAP32[r37+4]|0)){r43=FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r24)}else{r43=HEAP32[r36>>2]}if((r43|0)!=-1){r42=r24;break}HEAP32[r25>>2]=0;r42=0}}while(0);r25=(r42|0)==0;r24=HEAP32[r26],r37=r24>>2;do{if((r24|0)==0){r2=108}else{r36=HEAP32[r37+3];if((r36|0)==(HEAP32[r37+4]|0)){r44=FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r24)}else{r44=HEAP32[r36>>2]}if((r44|0)==-1){HEAP32[r26]=0;r2=108;break}else{if(r25^(r24|0)==0){break}else{r2=110;break}}}}while(0);if(r2==108){if(r25){r2=110}}if(r2==110){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r42;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r12>>2]|0);r24=HEAP32[r20];HEAP32[r20]=0;if((r24|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r21>>2]](r24);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9240,382)}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157;r12=r10>>2;r13=r6>>2;r6=0;r14=STACKTOP;STACKTOP=STACKTOP+448|0;r15=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r15>>2];r15=r14,r16=r15>>2;r17=r14+8;r18=r14+408;r19=r14+416;r20=r14+424;r21=r14+432;r22=r21,r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r16]=r11;r11=r17|0;HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;r23=r24,r30=r23>>2;r31=r25,r32=r31>>2;r33=r26,r34=r33>>2;r35=r27,r36=r35>>2;HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__111__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri(r3,r4,r18,r19,r20,r21,r24,r25,r26,r28);r4=r9|0;HEAP32[r12]=HEAP32[r4>>2];r3=(r1|0)>>2;r1=(r2|0)>>2;r2=r8>>2;r36=r26+4|0,r34=r36>>2;r32=r26+8|0;r30=r25+4|0,r37=r30>>2;r38=r25+8|0;r39=(r5&512|0)!=0;r5=r24+4|0,r40=r5>>2;r41=(r24+8|0)>>2;r42=r27+4|0,r43=r42>>2;r44=r27+8|0;r45=r18+3|0;r46=r21+4|0;r47=452;r48=r11;r49=r11;r11=r17+400|0;r17=0;r50=0;L131:while(1){r51=HEAP32[r3],r52=r51>>2;do{if((r51|0)==0){r53=1}else{r54=HEAP32[r52+3];if((r54|0)==(HEAP32[r52+4]|0)){r55=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r55=HEAP32[r54>>2]}if((r55|0)==-1){HEAP32[r3]=0;r53=1;break}else{r53=(HEAP32[r3]|0)==0;break}}}while(0);r51=HEAP32[r1],r52=r51>>2;do{if((r51|0)==0){r6=136}else{r54=HEAP32[r52+3];if((r54|0)==(HEAP32[r52+4]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r56=HEAP32[r54>>2]}if((r56|0)==-1){HEAP32[r1]=0;r6=136;break}else{if(r53^(r51|0)==0){r57=r51;break}else{r58=r47;r59=r48;r60=r49;r61=r17;r6=376;break L131}}}}while(0);if(r6==136){r6=0;if(r53){r58=r47;r59=r48;r60=r49;r61=r17;r6=376;break}else{r57=0}}r51=HEAP8[r18+r50|0]|0;L155:do{if((r51|0)==1){if((r50|0)==3){r58=r47;r59=r48;r60=r49;r61=r17;r6=376;break L131}r52=HEAP32[r3],r54=r52>>2;r62=HEAP32[r54+3];if((r62|0)==(HEAP32[r54+4]|0)){r63=FUNCTION_TABLE[HEAP32[HEAP32[r54]+36>>2]](r52)}else{r63=HEAP32[r62>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,r63)){r6=160;break L131}r62=HEAP32[r3];r52=r62+12|0;r54=HEAP32[r52>>2];if((r54|0)==(HEAP32[r62+16>>2]|0)){r64=FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+40>>2]](r62)}else{HEAP32[r52>>2]=r54+4;r64=HEAP32[r54>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r27,r64);r6=161}else if((r51|0)==0){r6=161}else if((r51|0)==3){r54=HEAP8[r31];r52=r54&255;r62=(r52&1|0)==0;r65=HEAP8[r33];r66=r65&255;r67=(r66&1|0)==0;if(((r62?r52>>>1:HEAP32[r37])|0)==(-(r67?r66>>>1:HEAP32[r34])|0)){r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break}do{if(((r62?r52>>>1:HEAP32[r37])|0)!=0){if(((r67?r66>>>1:HEAP32[r34])|0)==0){break}r73=HEAP32[r3],r74=r73>>2;r75=HEAP32[r74+3];if((r75|0)==(HEAP32[r74+4]|0)){r76=FUNCTION_TABLE[HEAP32[HEAP32[r74]+36>>2]](r73);r77=HEAP8[r31]}else{r76=HEAP32[r75>>2];r77=r54}r75=HEAP32[r3],r73=r75>>2;r74=r75+12|0;r78=HEAP32[r74>>2];r79=(r78|0)==(HEAP32[r73+4]|0);if((r76|0)==(HEAP32[((r77&1)==0?r30:HEAP32[r38>>2])>>2]|0)){if(r79){FUNCTION_TABLE[HEAP32[HEAP32[r73]+40>>2]](r75)}else{HEAP32[r74>>2]=r78+4}r74=HEAPU8[r31];r68=((r74&1|0)==0?r74>>>1:HEAP32[r37])>>>0>1?r25:r17;r69=r11;r70=r49;r71=r48;r72=r47;break L155}if(r79){r80=FUNCTION_TABLE[HEAP32[HEAP32[r73]+36>>2]](r75)}else{r80=HEAP32[r78>>2]}if((r80|0)!=(HEAP32[((HEAP8[r33]&1)==0?r36:HEAP32[r32>>2])>>2]|0)){r6=226;break L131}r78=HEAP32[r3];r75=r78+12|0;r73=HEAP32[r75>>2];if((r73|0)==(HEAP32[r78+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r78>>2]+40>>2]](r78)}else{HEAP32[r75>>2]=r73+4}HEAP8[r7]=1;r73=HEAPU8[r33];r68=((r73&1|0)==0?r73>>>1:HEAP32[r34])>>>0>1?r26:r17;r69=r11;r70=r49;r71=r48;r72=r47;break L155}}while(0);r66=HEAP32[r3],r67=r66>>2;r73=HEAP32[r67+3];r75=(r73|0)==(HEAP32[r67+4]|0);if(((r62?r52>>>1:HEAP32[r37])|0)==0){if(r75){r81=FUNCTION_TABLE[HEAP32[HEAP32[r67]+36>>2]](r66);r82=HEAP8[r33]}else{r81=HEAP32[r73>>2];r82=r65}if((r81|0)!=(HEAP32[((r82&1)==0?r36:HEAP32[r32>>2])>>2]|0)){r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break}r78=HEAP32[r3];r79=r78+12|0;r74=HEAP32[r79>>2];if((r74|0)==(HEAP32[r78+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r78>>2]+40>>2]](r78)}else{HEAP32[r79>>2]=r74+4}HEAP8[r7]=1;r74=HEAPU8[r33];r68=((r74&1|0)==0?r74>>>1:HEAP32[r34])>>>0>1?r26:r17;r69=r11;r70=r49;r71=r48;r72=r47;break}if(r75){r83=FUNCTION_TABLE[HEAP32[HEAP32[r67]+36>>2]](r66);r84=HEAP8[r31]}else{r83=HEAP32[r73>>2];r84=r54}if((r83|0)!=(HEAP32[((r84&1)==0?r30:HEAP32[r38>>2])>>2]|0)){HEAP8[r7]=1;r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break}r73=HEAP32[r3];r66=r73+12|0;r67=HEAP32[r66>>2];if((r67|0)==(HEAP32[r73+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r73>>2]+40>>2]](r73)}else{HEAP32[r66>>2]=r67+4}r67=HEAPU8[r31];r68=((r67&1|0)==0?r67>>>1:HEAP32[r37])>>>0>1?r25:r17;r69=r11;r70=r49;r71=r48;r72=r47}else if((r51|0)==2){if(!((r17|0)!=0|r50>>>0<2)){if((r50|0)==2){r85=(HEAP8[r45]|0)!=0}else{r85=0}if(!(r39|r85)){r68=0;r69=r11;r70=r49;r71=r48;r72=r47;break}}r67=HEAP8[r23];r66=(r67&1)==0?r5:HEAP32[r41];L227:do{if((r50|0)==0){r86=r66;r87=r67;r88=r57,r89=r88>>2}else{if(HEAPU8[r18+(r50-1)|0]<2){r90=r66;r91=r67}else{r86=r66;r87=r67;r88=r57,r89=r88>>2;break}while(1){r73=r91&255;if((r90|0)==((((r73&1|0)==0?r73>>>1:HEAP32[r40])<<2)+((r91&1)==0?r5:HEAP32[r41])|0)){r92=r91;break}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,HEAP32[r90>>2])){r6=237;break}r90=r90+4|0;r91=HEAP8[r23]}if(r6==237){r6=0;r92=HEAP8[r23]}r73=(r92&1)==0;r75=r90-(r73?r5:HEAP32[r41])>>2;r74=HEAP8[r35];r79=r74&255;r78=(r79&1|0)==0;L237:do{if(r75>>>0<=(r78?r79>>>1:HEAP32[r43])>>>0){r93=(r74&1)==0;r94=((r78?r79>>>1:HEAP32[r43])-r75<<2)+(r93?r42:HEAP32[r44>>2])|0;r95=((r78?r79>>>1:HEAP32[r43])<<2)+(r93?r42:HEAP32[r44>>2])|0;if((r94|0)==(r95|0)){r86=r90;r87=r92;r88=r57,r89=r88>>2;break L227}else{r96=r94;r97=r73?r5:HEAP32[r41]}while(1){if((HEAP32[r96>>2]|0)!=(HEAP32[r97>>2]|0)){break L237}r94=r96+4|0;if((r94|0)==(r95|0)){r86=r90;r87=r92;r88=r57,r89=r88>>2;break L227}r96=r94;r97=r97+4|0}}}while(0);r86=r73?r5:HEAP32[r41];r87=r92;r88=r57,r89=r88>>2}}while(0);L244:while(1){r67=r87&255;if((r86|0)==((((r67&1|0)==0?r67>>>1:HEAP32[r40])<<2)+((r87&1)==0?r5:HEAP32[r41])|0)){break}r67=HEAP32[r3],r66=r67>>2;do{if((r67|0)==0){r98=1}else{r54=HEAP32[r66+3];if((r54|0)==(HEAP32[r66+4]|0)){r99=FUNCTION_TABLE[HEAP32[HEAP32[r66]+36>>2]](r67)}else{r99=HEAP32[r54>>2]}if((r99|0)==-1){HEAP32[r3]=0;r98=1;break}else{r98=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r88|0)==0){r6=258}else{r67=HEAP32[r89+3];if((r67|0)==(HEAP32[r89+4]|0)){r100=FUNCTION_TABLE[HEAP32[HEAP32[r89]+36>>2]](r88)}else{r100=HEAP32[r67>>2]}if((r100|0)==-1){HEAP32[r1]=0;r6=258;break}else{if(r98^(r88|0)==0){r101=r88;break}else{break L244}}}}while(0);if(r6==258){r6=0;if(r98){break}else{r101=0}}r67=HEAP32[r3],r66=r67>>2;r73=HEAP32[r66+3];if((r73|0)==(HEAP32[r66+4]|0)){r102=FUNCTION_TABLE[HEAP32[HEAP32[r66]+36>>2]](r67)}else{r102=HEAP32[r73>>2]}if((r102|0)!=(HEAP32[r86>>2]|0)){break}r73=HEAP32[r3];r67=r73+12|0;r66=HEAP32[r67>>2];if((r66|0)==(HEAP32[r73+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r73>>2]+40>>2]](r73)}else{HEAP32[r67>>2]=r66+4}r86=r86+4|0;r87=HEAP8[r23];r88=r101,r89=r88>>2}if(!r39){r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break}r66=HEAP8[r23];r67=r66&255;if((r86|0)==((((r67&1|0)==0?r67>>>1:HEAP32[r40])<<2)+((r66&1)==0?r5:HEAP32[r41])|0)){r68=r17;r69=r11;r70=r49;r71=r48;r72=r47}else{r6=270;break L131}}else if((r51|0)==4){r66=0;r67=r11;r73=r49;r54=r48;r65=r47;L280:while(1){r52=HEAP32[r3],r62=r52>>2;do{if((r52|0)==0){r103=1}else{r79=HEAP32[r62+3];if((r79|0)==(HEAP32[r62+4]|0)){r104=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r52)}else{r104=HEAP32[r79>>2]}if((r104|0)==-1){HEAP32[r3]=0;r103=1;break}else{r103=(HEAP32[r3]|0)==0;break}}}while(0);r52=HEAP32[r1],r62=r52>>2;do{if((r52|0)==0){r6=284}else{r79=HEAP32[r62+3];if((r79|0)==(HEAP32[r62+4]|0)){r105=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r52)}else{r105=HEAP32[r79>>2]}if((r105|0)==-1){HEAP32[r1]=0;r6=284;break}else{if(r103^(r52|0)==0){break}else{break L280}}}}while(0);if(r6==284){r6=0;if(r103){break}}r52=HEAP32[r3],r62=r52>>2;r79=HEAP32[r62+3];if((r79|0)==(HEAP32[r62+4]|0)){r106=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r52)}else{r106=HEAP32[r79>>2]}if(FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,2048,r106)){r79=HEAP32[r12];if((r79|0)==(HEAP32[r16]|0)){__ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r9,r10,r15);r107=HEAP32[r12]}else{r107=r79}HEAP32[r12]=r107+4;HEAP32[r107>>2]=r106;r108=r66+1|0;r109=r67;r110=r73;r111=r54;r112=r65}else{r79=HEAPU8[r22];if((((r79&1|0)==0?r79>>>1:HEAP32[r46>>2])|0)==0|(r66|0)==0){break}if((r106|0)!=(HEAP32[r20>>2]|0)){break}if((r73|0)==(r67|0)){r79=(r65|0)!=452;r52=r73-r54|0;r62=r52>>>0<2147483647?r52<<1:-1;if(r79){r113=r54}else{r113=0}r79=_realloc(r113,r62);r78=r79;if((r79|0)==0){__ZSt17__throw_bad_allocv()}r114=(r62>>>2<<2)+r78|0;r115=(r52>>2<<2)+r78|0;r116=r78;r117=228}else{r114=r67;r115=r73;r116=r54;r117=r65}HEAP32[r115>>2]=r66;r108=0;r109=r114;r110=r115+4|0;r111=r116;r112=r117}r78=HEAP32[r3];r52=r78+12|0;r62=HEAP32[r52>>2];if((r62|0)==(HEAP32[r78+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r78>>2]+40>>2]](r78);r66=r108;r67=r109;r73=r110;r54=r111;r65=r112;continue}else{HEAP32[r52>>2]=r62+4;r66=r108;r67=r109;r73=r110;r54=r111;r65=r112;continue}}if((r54|0)==(r73|0)|(r66|0)==0){r118=r67;r119=r73;r120=r54;r121=r65}else{if((r73|0)==(r67|0)){r62=(r65|0)!=452;r52=r73-r54|0;r78=r52>>>0<2147483647?r52<<1:-1;if(r62){r122=r54}else{r122=0}r62=_realloc(r122,r78);r79=r62;if((r62|0)==0){__ZSt17__throw_bad_allocv()}r123=(r78>>>2<<2)+r79|0;r124=(r52>>2<<2)+r79|0;r125=r79;r126=228}else{r123=r67;r124=r73;r125=r54;r126=r65}HEAP32[r124>>2]=r66;r118=r123;r119=r124+4|0;r120=r125;r121=r126}r79=HEAP32[r28>>2];if((r79|0)>0){r52=HEAP32[r3],r78=r52>>2;do{if((r52|0)==0){r127=1}else{r62=HEAP32[r78+3];if((r62|0)==(HEAP32[r78+4]|0)){r128=FUNCTION_TABLE[HEAP32[HEAP32[r78]+36>>2]](r52)}else{r128=HEAP32[r62>>2]}if((r128|0)==-1){HEAP32[r3]=0;r127=1;break}else{r127=(HEAP32[r3]|0)==0;break}}}while(0);r52=HEAP32[r1],r78=r52>>2;do{if((r52|0)==0){r6=333}else{r66=HEAP32[r78+3];if((r66|0)==(HEAP32[r78+4]|0)){r129=FUNCTION_TABLE[HEAP32[HEAP32[r78]+36>>2]](r52)}else{r129=HEAP32[r66>>2]}if((r129|0)==-1){HEAP32[r1]=0;r6=333;break}else{if(r127^(r52|0)==0){r130=r52;break}else{r6=339;break L131}}}}while(0);if(r6==333){r6=0;if(r127){r6=339;break L131}else{r130=0}}r52=HEAP32[r3],r78=r52>>2;r66=HEAP32[r78+3];if((r66|0)==(HEAP32[r78+4]|0)){r131=FUNCTION_TABLE[HEAP32[HEAP32[r78]+36>>2]](r52)}else{r131=HEAP32[r66>>2]}if((r131|0)!=(HEAP32[r19>>2]|0)){r6=339;break L131}r66=HEAP32[r3];r52=r66+12|0;r78=HEAP32[r52>>2];if((r78|0)==(HEAP32[r66+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+40>>2]](r66);r132=r130,r133=r132>>2;r134=r79}else{HEAP32[r52>>2]=r78+4;r132=r130,r133=r132>>2;r134=r79}while(1){r78=HEAP32[r3],r52=r78>>2;do{if((r78|0)==0){r135=1}else{r66=HEAP32[r52+3];if((r66|0)==(HEAP32[r52+4]|0)){r136=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r78)}else{r136=HEAP32[r66>>2]}if((r136|0)==-1){HEAP32[r3]=0;r135=1;break}else{r135=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r132|0)==0){r6=356}else{r78=HEAP32[r133+3];if((r78|0)==(HEAP32[r133+4]|0)){r137=FUNCTION_TABLE[HEAP32[HEAP32[r133]+36>>2]](r132)}else{r137=HEAP32[r78>>2]}if((r137|0)==-1){HEAP32[r1]=0;r6=356;break}else{if(r135^(r132|0)==0){r138=r132;break}else{r6=363;break L131}}}}while(0);if(r6==356){r6=0;if(r135){r6=363;break L131}else{r138=0}}r78=HEAP32[r3],r52=r78>>2;r66=HEAP32[r52+3];if((r66|0)==(HEAP32[r52+4]|0)){r139=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r78)}else{r139=HEAP32[r66>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,2048,r139)){r6=363;break L131}if((HEAP32[r12]|0)==(HEAP32[r16]|0)){__ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r9,r10,r15)}r66=HEAP32[r3],r78=r66>>2;r52=HEAP32[r78+3];if((r52|0)==(HEAP32[r78+4]|0)){r140=FUNCTION_TABLE[HEAP32[HEAP32[r78]+36>>2]](r66)}else{r140=HEAP32[r52>>2]}r52=HEAP32[r12];HEAP32[r12]=r52+4;HEAP32[r52>>2]=r140;r52=r134-1|0;HEAP32[r28>>2]=r52;r66=HEAP32[r3];r78=r66+12|0;r65=HEAP32[r78>>2];if((r65|0)==(HEAP32[r66+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+40>>2]](r66)}else{HEAP32[r78>>2]=r65+4}if((r52|0)>0){r132=r138,r133=r132>>2;r134=r52}else{break}}}if((HEAP32[r12]|0)==(HEAP32[r4>>2]|0)){r6=374;break L131}else{r68=r17;r69=r118;r70=r119;r71=r120;r72=r121}}else{r68=r17;r69=r11;r70=r49;r71=r48;r72=r47}}while(0);L424:do{if(r6==161){r6=0;if((r50|0)==3){r58=r47;r59=r48;r60=r49;r61=r17;r6=376;break L131}else{r141=r57,r142=r141>>2}while(1){r51=HEAP32[r3],r79=r51>>2;do{if((r51|0)==0){r143=1}else{r52=HEAP32[r79+3];if((r52|0)==(HEAP32[r79+4]|0)){r144=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r51)}else{r144=HEAP32[r52>>2]}if((r144|0)==-1){HEAP32[r3]=0;r143=1;break}else{r143=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r141|0)==0){r6=175}else{r51=HEAP32[r142+3];if((r51|0)==(HEAP32[r142+4]|0)){r145=FUNCTION_TABLE[HEAP32[HEAP32[r142]+36>>2]](r141)}else{r145=HEAP32[r51>>2]}if((r145|0)==-1){HEAP32[r1]=0;r6=175;break}else{if(r143^(r141|0)==0){r146=r141;break}else{r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break L424}}}}while(0);if(r6==175){r6=0;if(r143){r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break L424}else{r146=0}}r51=HEAP32[r3],r79=r51>>2;r52=HEAP32[r79+3];if((r52|0)==(HEAP32[r79+4]|0)){r147=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r51)}else{r147=HEAP32[r52>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,r147)){r68=r17;r69=r11;r70=r49;r71=r48;r72=r47;break L424}r52=HEAP32[r3];r51=r52+12|0;r79=HEAP32[r51>>2];if((r79|0)==(HEAP32[r52+16>>2]|0)){r148=FUNCTION_TABLE[HEAP32[HEAP32[r52>>2]+40>>2]](r52)}else{HEAP32[r51>>2]=r79+4;r148=HEAP32[r79>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r27,r148);r141=r146,r142=r141>>2}}}while(0);r79=r50+1|0;if(r79>>>0<4){r47=r72;r48=r71;r49=r70;r11=r69;r17=r68;r50=r79}else{r58=r72;r59=r71;r60=r70;r61=r68;r6=376;break}}L461:do{if(r6==160){HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r48;r151=r47}else if(r6==226){HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r48;r151=r47}else if(r6==270){HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r48;r151=r47}else if(r6==339){HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r120;r151=r121}else if(r6==363){HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r120;r151=r121}else if(r6==374){HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r120;r151=r121}else if(r6==376){L469:do{if((r61|0)!=0){r68=r61;r70=r61+4|0;r71=r61+8|0;r72=1;L471:while(1){r50=HEAPU8[r68];if((r50&1|0)==0){r152=r50>>>1}else{r152=HEAP32[r70>>2]}if(r72>>>0>=r152>>>0){break L469}r50=HEAP32[r3],r17=r50>>2;do{if((r50|0)==0){r153=1}else{r69=HEAP32[r17+3];if((r69|0)==(HEAP32[r17+4]|0)){r154=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r154=HEAP32[r69>>2]}if((r154|0)==-1){HEAP32[r3]=0;r153=1;break}else{r153=(HEAP32[r3]|0)==0;break}}}while(0);r50=HEAP32[r1],r17=r50>>2;do{if((r50|0)==0){r6=395}else{r69=HEAP32[r17+3];if((r69|0)==(HEAP32[r17+4]|0)){r155=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r155=HEAP32[r69>>2]}if((r155|0)==-1){HEAP32[r1]=0;r6=395;break}else{if(r153^(r50|0)==0){break}else{break L471}}}}while(0);if(r6==395){r6=0;if(r153){break}}r50=HEAP32[r3],r17=r50>>2;r69=HEAP32[r17+3];if((r69|0)==(HEAP32[r17+4]|0)){r156=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r156=HEAP32[r69>>2]}if((HEAP8[r68]&1)==0){r157=r70}else{r157=HEAP32[r71>>2]}if((r156|0)!=(HEAP32[r157+(r72<<2)>>2]|0)){break}r69=r72+1|0;r50=HEAP32[r3];r17=r50+12|0;r11=HEAP32[r17>>2];if((r11|0)==(HEAP32[r50+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r50>>2]+40>>2]](r50);r72=r69;continue}else{HEAP32[r17>>2]=r11+4;r72=r69;continue}}HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r59;r151=r58;break L461}}while(0);if((r59|0)==(r60|0)){r149=1;r150=r60;r151=r58;break}HEAP32[r29>>2]=0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r21,r59,r60,r29);if((HEAP32[r29>>2]|0)==0){r149=1;r150=r59;r151=r58;break}HEAP32[r13]=HEAP32[r13]|4;r149=0;r150=r59;r151=r58}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r27);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r26);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r25);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r24);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);if((r150|0)==0){STACKTOP=r14;return r149}FUNCTION_TABLE[r151](r150);STACKTOP=r14;return r149}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendIPwEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=r1;r5=r2;r6=HEAP8[r4];r7=r6&255;if((r7&1|0)==0){r8=r7>>>1}else{r8=HEAP32[r1+4>>2]}if((r6&1)==0){r9=1;r10=r6}else{r6=HEAP32[r1>>2];r9=(r6&-2)-1|0;r10=r6&255}r6=r3-r5>>2;if((r6|0)==0){return r1}if((r9-r8|0)>>>0<r6>>>0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r9,r8+r6-r9|0,r8,r8,0,0);r11=HEAP8[r4]}else{r11=r10}if((r11&1)==0){r12=r1+4|0}else{r12=HEAP32[r1+8>>2]}r11=(r8<<2)+r12|0;if((r2|0)==(r3|0)){r13=r11}else{r10=r8+((r3-4+ -r5|0)>>>2)+1|0;r5=r2;r2=r11;while(1){HEAP32[r2>>2]=HEAP32[r5>>2];r11=r5+4|0;if((r11|0)==(r3|0)){break}else{r5=r11;r2=r2+4|0}}r13=(r10<<2)+r12|0}HEAP32[r13>>2]=0;r13=r8+r6|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r13<<1&255;return r1}else{HEAP32[r1+4>>2]=r13;return r1}}function __ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIwS3_NS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+456|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+416;r14=r9+424;r15=r9+432;r16=r9+440;r17=r9+448;r18=(r13|0)>>2;HEAP32[r18]=r12;r19=r13+4|0;HEAP32[r19>>2]=452;r20=r12+400|0;__ZNKSt3__18ios_base6getlocEv(r15,r6);r12=r15|0;r21=HEAP32[r12>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r11]=14456;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r10,260)}r10=HEAP32[3615]-1|0;r11=HEAP32[r21+8>>2];do{if(HEAP32[r21+12>>2]-r11>>2>>>0>r10>>>0){r22=HEAP32[r11+(r10<<2)>>2];if((r22|0)==0){break}r23=r22;HEAP8[r16]=0;r24=r4|0;r25=HEAP32[r24>>2],r26=r25>>2;HEAP32[r17>>2]=r25;if(__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r23,r13,r14,r20)){r27=r8;if((HEAP8[r27]&1)==0){HEAP32[r8+4>>2]=0;HEAP8[r27]=0}else{HEAP32[HEAP32[r8+8>>2]>>2]=0;HEAP32[r8+4>>2]=0}r27=r22;if((HEAP8[r16]&1)!=0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r8,FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+44>>2]](r23,45))}r22=FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+44>>2]](r23,48);r23=HEAP32[r14>>2];r27=r23-4|0;r28=HEAP32[r18];while(1){if(r28>>>0>=r27>>>0){break}if((HEAP32[r28>>2]|0)==(r22|0)){r28=r28+4|0}else{break}}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendIPwEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r8,r28,r23)}r22=r3|0;r27=HEAP32[r22>>2],r29=r27>>2;do{if((r27|0)==0){r30=0}else{r31=HEAP32[r29+3];if((r31|0)==(HEAP32[r29+4]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r27)}else{r32=HEAP32[r31>>2]}if((r32|0)!=-1){r30=r27;break}HEAP32[r22>>2]=0;r30=0}}while(0);r22=(r30|0)==0;do{if((r25|0)==0){r2=473}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r33=HEAP32[r27>>2]}if((r33|0)==-1){HEAP32[r24>>2]=0;r2=473;break}else{if(r22^(r25|0)==0){break}else{r2=475;break}}}}while(0);if(r2==473){if(r22){r2=475}}if(r2==475){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r30;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r12>>2]|0);r25=HEAP32[r18];HEAP32[r18]=0;if((r25|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r19>>2]](r25);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9240,382)}
function __ZNSt3__111__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r11=r9>>2;r12=r8>>2;r13=r7>>2;r14=STACKTOP;STACKTOP=STACKTOP+56|0;r15=r14,r16=r15>>2;r17=r14+16,r18=r17>>2;r19=r14+32;r20=r14+40;r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r30=r29>>2;r31=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r32=r31>>2;r33=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r34=r33>>2;r35=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r36=r35>>2;if(r1){r1=HEAP32[r2>>2];if((HEAP32[3730]|0)!=-1){HEAP32[r18]=14920;HEAP32[r18+1]=26;HEAP32[r18+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14920,r17,260)}r17=HEAP32[3731]-1|0;r18=HEAP32[r1+8>>2];if(HEAP32[r1+12>>2]-r18>>2>>>0<=r17>>>0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9240,382)}r1=HEAP32[r18+(r17<<2)>>2];if((r1|0)==0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9240,382)}r37=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r19,r37);r38=r3;tempBigInt=HEAP32[r19>>2];HEAP8[r38]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+3|0]=tempBigInt&255;r38=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r38]+32>>2]](r20,r37);r19=r9,r17=r19>>2;if((HEAP8[r19]&1)==0){HEAP32[r11+1]=0;HEAP8[r19]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r17]=HEAP32[r21];HEAP32[r17+1]=HEAP32[r21+1];HEAP32[r17+2]=HEAP32[r21+2];HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20);FUNCTION_TABLE[HEAP32[HEAP32[r38]+28>>2]](r22,r37);r20=r8,r21=r20>>2;if((HEAP8[r20]&1)==0){HEAP32[r12+1]=0;HEAP8[r20]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r21]=HEAP32[r23];HEAP32[r21+1]=HEAP32[r23+1];HEAP32[r21+2]=HEAP32[r23+2];HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r22);r22=r1>>2;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+12>>2]](r37);HEAP32[r4>>2]=r23;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+16>>2]](r37);HEAP32[r5>>2]=r23;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r24,r37);r1=r6,r23=r1>>2;if((HEAP8[r1]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r1]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r23]=HEAP32[r25];HEAP32[r23+1]=HEAP32[r25+1];HEAP32[r23+2]=HEAP32[r25+2];HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r24);FUNCTION_TABLE[HEAP32[HEAP32[r38]+24>>2]](r26,r37);r38=r7,r24=r38>>2;if((HEAP8[r38]&1)==0){HEAP32[r13+1]=0;HEAP8[r38]=0}else{HEAP32[HEAP32[r13+2]>>2]=0;HEAP32[r13+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r7,0);HEAP32[r24]=HEAP32[r27];HEAP32[r24+1]=HEAP32[r27+1];HEAP32[r24+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r26);r39=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r37);HEAP32[r10>>2]=r39;STACKTOP=r14;return}else{r37=HEAP32[r2>>2];if((HEAP32[3732]|0)!=-1){HEAP32[r16]=14928;HEAP32[r16+1]=26;HEAP32[r16+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14928,r15,260)}r15=HEAP32[3733]-1|0;r16=HEAP32[r37+8>>2];if(HEAP32[r37+12>>2]-r16>>2>>>0<=r15>>>0){r40=___cxa_allocate_exception(4);r41=r40;__ZNSt8bad_castC2Ev(r41);___cxa_throw(r40,9240,382)}r37=HEAP32[r16+(r15<<2)>>2];if((r37|0)==0){r40=___cxa_allocate_exception(4);r41=r40;__ZNSt8bad_castC2Ev(r41);___cxa_throw(r40,9240,382)}r40=r37;FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+44>>2]](r28,r40);r41=r3;tempBigInt=HEAP32[r28>>2];HEAP8[r41]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+3|0]=tempBigInt&255;r41=r37>>2;FUNCTION_TABLE[HEAP32[HEAP32[r41]+32>>2]](r29,r40);r28=r9,r3=r28>>2;if((HEAP8[r28]&1)==0){HEAP32[r11+1]=0;HEAP8[r28]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r3]=HEAP32[r30];HEAP32[r3+1]=HEAP32[r30+1];HEAP32[r3+2]=HEAP32[r30+2];HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r29);FUNCTION_TABLE[HEAP32[HEAP32[r41]+28>>2]](r31,r40);r29=r8,r30=r29>>2;if((HEAP8[r29]&1)==0){HEAP32[r12+1]=0;HEAP8[r29]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r30]=HEAP32[r32];HEAP32[r30+1]=HEAP32[r32+1];HEAP32[r30+2]=HEAP32[r32+2];HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r31);r31=r37>>2;r32=FUNCTION_TABLE[HEAP32[HEAP32[r31]+12>>2]](r40);HEAP32[r4>>2]=r32;r32=FUNCTION_TABLE[HEAP32[HEAP32[r31]+16>>2]](r40);HEAP32[r5>>2]=r32;FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+20>>2]](r33,r40);r37=r6,r32=r37>>2;if((HEAP8[r37]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r37]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r32]=HEAP32[r34];HEAP32[r32+1]=HEAP32[r34+1];HEAP32[r32+2]=HEAP32[r34+2];HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r33);FUNCTION_TABLE[HEAP32[HEAP32[r41]+24>>2]](r35,r40);r41=r7,r33=r41>>2;if((HEAP8[r41]&1)==0){HEAP32[r13+1]=0;HEAP8[r41]=0}else{HEAP32[HEAP32[r13+2]>>2]=0;HEAP32[r13+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r7,0);HEAP32[r33]=HEAP32[r36];HEAP32[r33+1]=HEAP32[r36+1];HEAP32[r33+2]=HEAP32[r36+2];HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r35);r39=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r40);HEAP32[r10>>2]=r39;STACKTOP=r14;return}}function __ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=(r1+4|0)>>2;r5=(HEAP32[r4]|0)!=452;r6=(r1|0)>>2;r1=HEAP32[r6];r7=r1;r8=HEAP32[r3>>2]-r7|0;r9=r8>>>0<2147483647?r8<<1:-1;r8=HEAP32[r2>>2]-r7>>2;if(r5){r10=r1}else{r10=0}r1=_realloc(r10,r9);r10=r1;if((r1|0)==0){__ZSt17__throw_bad_allocv()}do{if(r5){HEAP32[r6]=r10;r11=r10}else{r1=HEAP32[r6];HEAP32[r6]=r10;if((r1|0)==0){r11=r10;break}FUNCTION_TABLE[HEAP32[r4]](r1);r11=HEAP32[r6]}}while(0);HEAP32[r4]=228;HEAP32[r2>>2]=(r8<<2)+r11;HEAP32[r3>>2]=(r9>>>2<<2)+HEAP32[r6];return}function __ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEce(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r2=STACKTOP;STACKTOP=STACKTOP+280|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r2,r9=r8>>2;r10=r2+120,r11=r10>>2;r12=r2+232;r13=r2+240;r14=r2+248;r15=r2+256;r16=r2+264;r17=r16>>2;r18=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21,r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+100|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=r2+16|0;HEAP32[r11]=r29;r30=r2+128|0;r31=_snprintf(r29,100,1968,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));do{if(r31>>>0>99){do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r29=_newlocale(1,1896,0);HEAP32[3276]=r29}}while(0);r29=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],1968,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));r32=HEAP32[r11];if((r32|0)==0){__ZSt17__throw_bad_allocv();r33=HEAP32[r11]}else{r33=r32}r32=_malloc(r29);if((r32|0)!=0){r34=r32;r35=r29;r36=r33;r37=r32;break}__ZSt17__throw_bad_allocv();r34=0;r35=r29;r36=r33;r37=0}else{r34=r30;r35=r31;r36=0;r37=0}}while(0);__ZNKSt3__18ios_base6getlocEv(r12,r5);r31=r12|0;r30=HEAP32[r31>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r9]=14464;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r8,260)}r8=HEAP32[3617]-1|0;r9=HEAP32[r30+8>>2];do{if(HEAP32[r30+12>>2]-r9>>2>>>0>r8>>>0){r33=HEAP32[r9+(r8<<2)>>2];if((r33|0)==0){break}r7=r33;r10=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r33>>2]+32>>2]](r7,r10,r10+r35|0,r34);if((r35|0)==0){r38=0}else{r38=(HEAP8[HEAP32[r11]]|0)==45}HEAP32[r17]=0;HEAP32[r17+1]=0;HEAP32[r17+2]=0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;__ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r4,r38,r12,r13,r14,r15,r16,r18,r21,r24);r10=r25|0;r33=HEAP32[r24>>2];if((r35|0)>(r33|0)){r29=HEAPU8[r22];if((r29&1|0)==0){r39=r29>>>1}else{r39=HEAP32[r21+4>>2]}r29=HEAPU8[r19];if((r29&1|0)==0){r40=r29>>>1}else{r40=HEAP32[r18+4>>2]}r41=(r35-r33<<1|1)+r39+r40|0}else{r29=HEAPU8[r22];if((r29&1|0)==0){r42=r29>>>1}else{r42=HEAP32[r21+4>>2]}r29=HEAPU8[r19];if((r29&1|0)==0){r43=r29>>>1}else{r43=HEAP32[r18+4>>2]}r41=r43+(r42+2)|0}r29=r41+r33|0;do{if(r29>>>0>100){r32=_malloc(r29);if((r32|0)!=0){r44=r32;r45=r32;break}__ZSt17__throw_bad_allocv();r44=0;r45=0}else{r44=r10;r45=0}}while(0);__ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r44,r26,r27,HEAP32[r5+4>>2],r34,r34+r35|0,r7,r38,r13,HEAP8[r14],HEAP8[r15],r16,r18,r21,r33);HEAP32[r28>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r28,r44,HEAP32[r26>>2],HEAP32[r27>>2],r5,r6);if((r45|0)!=0){_free(r45)}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r31>>2]|0);if((r37|0)!=0){_free(r37)}if((r36|0)==0){STACKTOP=r2;return}_free(r36);STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r2);___cxa_throw(r2,9240,382)}function __ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r11=r9>>2;r12=STACKTOP;STACKTOP=STACKTOP+40|0;r13=r12,r14=r13>>2;r15=r12+16,r16=r15>>2;r17=r12+32;r18=r17;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r26=r25>>2;r27=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r28=r27>>2;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=r29;r31=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r32=r31>>2;r33=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r34=r33;r35=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r36=r35>>2;r37=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r38=r37>>2;r39=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r40=r39>>2;r41=HEAP32[r3>>2]>>2;if(r1){if((HEAP32[3734]|0)!=-1){HEAP32[r16]=14936;HEAP32[r16+1]=26;HEAP32[r16+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14936,r15,260)}r15=HEAP32[3735]-1|0;r16=HEAP32[r41+2];if(HEAP32[r41+3]-r16>>2>>>0<=r15>>>0){r42=___cxa_allocate_exception(4);r43=r42;__ZNSt8bad_castC2Ev(r43);___cxa_throw(r42,9240,382)}r1=HEAP32[r16+(r15<<2)>>2],r15=r1>>2;if((r1|0)==0){r42=___cxa_allocate_exception(4);r43=r42;__ZNSt8bad_castC2Ev(r43);___cxa_throw(r42,9240,382)}r42=r1;r43=HEAP32[r15];if(r2){FUNCTION_TABLE[HEAP32[r43+44>>2]](r18,r42);r18=r4;tempBigInt=HEAP32[r17>>2];HEAP8[r18]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r15]+32>>2]](r19,r42);r18=r9,r17=r18>>2;if((HEAP8[r18]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r18]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r17]=HEAP32[r20];HEAP32[r17+1]=HEAP32[r20+1];HEAP32[r17+2]=HEAP32[r20+2];HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19)}else{FUNCTION_TABLE[HEAP32[r43+40>>2]](r22,r42);r22=r4;tempBigInt=HEAP32[r21>>2];HEAP8[r22]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r15]+28>>2]](r23,r42);r22=r9,r21=r22>>2;if((HEAP8[r22]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r22]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r21]=HEAP32[r24];HEAP32[r21+1]=HEAP32[r24+1];HEAP32[r21+2]=HEAP32[r24+2];HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r23)}r23=r1;r24=FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+12>>2]](r42);HEAP8[r5]=r24;r24=FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+16>>2]](r42);HEAP8[r6]=r24;r24=r1;FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+20>>2]](r25,r42);r1=r7,r23=r1>>2;if((HEAP8[r1]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r1]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r23]=HEAP32[r26];HEAP32[r23+1]=HEAP32[r26+1];HEAP32[r23+2]=HEAP32[r26+2];HEAP32[r26]=0;HEAP32[r26+1]=0;HEAP32[r26+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r25);FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+24>>2]](r27,r42);r24=r8,r25=r24>>2;if((HEAP8[r24]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r24]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r25]=HEAP32[r28];HEAP32[r25+1]=HEAP32[r28+1];HEAP32[r25+2]=HEAP32[r28+2];HEAP32[r28]=0;HEAP32[r28+1]=0;HEAP32[r28+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r27);r44=FUNCTION_TABLE[HEAP32[HEAP32[r15]+36>>2]](r42);HEAP32[r10>>2]=r44;STACKTOP=r12;return}else{if((HEAP32[3736]|0)!=-1){HEAP32[r14]=14944;HEAP32[r14+1]=26;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14944,r13,260)}r13=HEAP32[3737]-1|0;r14=HEAP32[r41+2];if(HEAP32[r41+3]-r14>>2>>>0<=r13>>>0){r45=___cxa_allocate_exception(4);r46=r45;__ZNSt8bad_castC2Ev(r46);___cxa_throw(r45,9240,382)}r41=HEAP32[r14+(r13<<2)>>2],r13=r41>>2;if((r41|0)==0){r45=___cxa_allocate_exception(4);r46=r45;__ZNSt8bad_castC2Ev(r46);___cxa_throw(r45,9240,382)}r45=r41;r46=HEAP32[r13];if(r2){FUNCTION_TABLE[HEAP32[r46+44>>2]](r30,r45);r30=r4;tempBigInt=HEAP32[r29>>2];HEAP8[r30]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r13]+32>>2]](r31,r45);r30=r9,r29=r30>>2;if((HEAP8[r30]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r30]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r29]=HEAP32[r32];HEAP32[r29+1]=HEAP32[r32+1];HEAP32[r29+2]=HEAP32[r32+2];HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r31)}else{FUNCTION_TABLE[HEAP32[r46+40>>2]](r34,r45);r34=r4;tempBigInt=HEAP32[r33>>2];HEAP8[r34]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r13]+28>>2]](r35,r45);r34=r9,r33=r34>>2;if((HEAP8[r34]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r34]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r33]=HEAP32[r36];HEAP32[r33+1]=HEAP32[r36+1];HEAP32[r33+2]=HEAP32[r36+2];HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r35)}r35=r41;r36=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+12>>2]](r45);HEAP8[r5]=r36;r36=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+16>>2]](r45);HEAP8[r6]=r36;r36=r41;FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+20>>2]](r37,r45);r41=r7,r6=r41>>2;if((HEAP8[r41]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r41]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r6]=HEAP32[r38];HEAP32[r6+1]=HEAP32[r38+1];HEAP32[r6+2]=HEAP32[r38+2];HEAP32[r38]=0;HEAP32[r38+1]=0;HEAP32[r38+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r37);FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+24>>2]](r39,r45);r36=r8,r37=r36>>2;if((HEAP8[r36]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r36]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r37]=HEAP32[r40];HEAP32[r37+1]=HEAP32[r40+1];HEAP32[r37+2]=HEAP32[r40+2];HEAP32[r40]=0;HEAP32[r40+1]=0;HEAP32[r40+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r39);r44=FUNCTION_TABLE[HEAP32[HEAP32[r13]+36>>2]](r45);HEAP32[r10>>2]=r44;STACKTOP=r12;return}}function __ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15){var r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r16=r3>>2;r3=0;HEAP32[r16]=r1;r17=r7>>2;r18=r14;r19=r14+1|0;r20=r14+8|0;r21=(r14+4|0)>>2;r14=r13;r22=(r4&512|0)==0;r23=r13+1|0;r24=r13+4|0;r25=r13+8|0;r13=r7+8|0;r26=(r15|0)>0;r27=r12;r28=r12+1|0;r29=(r12+8|0)>>2;r30=r12+4|0;r12=-r15|0;r31=r5;r5=0;while(1){r32=HEAP8[r9+r5|0]|0;do{if((r32|0)==0){HEAP32[r2>>2]=HEAP32[r16];r33=r31}else if((r32|0)==1){HEAP32[r2>>2]=HEAP32[r16];r34=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,32);r35=HEAP32[r16];HEAP32[r16]=r35+1;HEAP8[r35]=r34;r33=r31}else if((r32|0)==3){r34=HEAP8[r18];r35=r34&255;if((r35&1|0)==0){r36=r35>>>1}else{r36=HEAP32[r21]}if((r36|0)==0){r33=r31;break}if((r34&1)==0){r37=r19}else{r37=HEAP32[r20>>2]}r34=HEAP8[r37];r35=HEAP32[r16];HEAP32[r16]=r35+1;HEAP8[r35]=r34;r33=r31}else if((r32|0)==2){r34=HEAP8[r14];r35=r34&255;r38=(r35&1|0)==0;if(r38){r39=r35>>>1}else{r39=HEAP32[r24>>2]}if((r39|0)==0|r22){r33=r31;break}if((r34&1)==0){r40=r23;r41=r23}else{r34=HEAP32[r25>>2];r40=r34;r41=r34}if(r38){r42=r35>>>1}else{r42=HEAP32[r24>>2]}r35=r40+r42|0;r38=HEAP32[r16];if((r41|0)==(r35|0)){r43=r38}else{r34=r41;r44=r38;while(1){HEAP8[r44]=HEAP8[r34];r38=r34+1|0;r45=r44+1|0;if((r38|0)==(r35|0)){r43=r45;break}else{r34=r38;r44=r45}}}HEAP32[r16]=r43;r33=r31}else if((r32|0)==4){r44=HEAP32[r16];r34=r8?r31+1|0:r31;r35=r34;while(1){if(r35>>>0>=r6>>>0){break}r45=HEAP8[r35];if(r45<<24>>24<=-1){break}if((HEAP16[HEAP32[r13>>2]+(r45<<24>>24<<1)>>1]&2048)==0){break}else{r35=r35+1|0}}r45=r35;if(r26){if(r35>>>0>r34>>>0){r38=r34+ -r45|0;r45=r38>>>0<r12>>>0?r12:r38;r38=r45+r15|0;r46=r35;r47=r15;r48=r44;while(1){r49=r46-1|0;r50=HEAP8[r49];HEAP32[r16]=r48+1;HEAP8[r48]=r50;r50=r47-1|0;r51=(r50|0)>0;if(!(r49>>>0>r34>>>0&r51)){break}r46=r49;r47=r50;r48=HEAP32[r16]}r48=r35+r45|0;if(r51){r52=r38;r53=r48;r3=723}else{r54=0;r55=r38;r56=r48}}else{r52=r15;r53=r35;r3=723}if(r3==723){r3=0;r54=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,48);r55=r52;r56=r53}r48=HEAP32[r16];HEAP32[r16]=r48+1;if((r55|0)>0){r47=r55;r46=r48;while(1){HEAP8[r46]=r54;r50=r47-1|0;r49=HEAP32[r16];HEAP32[r16]=r49+1;if((r50|0)>0){r47=r50;r46=r49}else{r57=r49;break}}}else{r57=r48}HEAP8[r57]=r10;r58=r56}else{r58=r35}if((r58|0)==(r34|0)){r46=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,48);r47=HEAP32[r16];HEAP32[r16]=r47+1;HEAP8[r47]=r46}else{r46=HEAP8[r27];r47=r46&255;if((r47&1|0)==0){r59=r47>>>1}else{r59=HEAP32[r30>>2]}if((r59|0)==0){r60=r58;r61=0;r62=0;r63=-1}else{if((r46&1)==0){r64=r28}else{r64=HEAP32[r29]}r60=r58;r61=0;r62=0;r63=HEAP8[r64]|0}while(1){do{if((r61|0)==(r63|0)){r46=HEAP32[r16];HEAP32[r16]=r46+1;HEAP8[r46]=r11;r46=r62+1|0;r47=HEAP8[r27];r38=r47&255;if((r38&1|0)==0){r65=r38>>>1}else{r65=HEAP32[r30>>2]}if(r46>>>0>=r65>>>0){r66=r63;r67=r46;r68=0;break}r38=(r47&1)==0;if(r38){r69=r28}else{r69=HEAP32[r29]}if((HEAP8[r69+r46|0]|0)==127){r66=-1;r67=r46;r68=0;break}if(r38){r70=r28}else{r70=HEAP32[r29]}r66=HEAP8[r70+r46|0]|0;r67=r46;r68=0}else{r66=r63;r67=r62;r68=r61}}while(0);r46=r60-1|0;r38=HEAP8[r46];r47=HEAP32[r16];HEAP32[r16]=r47+1;HEAP8[r47]=r38;if((r46|0)==(r34|0)){break}else{r60=r46;r61=r68+1|0;r62=r67;r63=r66}}}r35=HEAP32[r16];if((r44|0)==(r35|0)){r33=r34;break}r48=r35-1|0;if(r44>>>0<r48>>>0){r71=r44;r72=r48}else{r33=r34;break}while(1){r48=HEAP8[r71];HEAP8[r71]=HEAP8[r72];HEAP8[r72]=r48;r48=r71+1|0;r35=r72-1|0;if(r48>>>0<r35>>>0){r71=r48;r72=r35}else{r33=r34;break}}}else{r33=r31}}while(0);r32=r5+1|0;if(r32>>>0<4){r31=r33;r5=r32}else{break}}r5=HEAP8[r18];r18=r5&255;r33=(r18&1|0)==0;if(r33){r73=r18>>>1}else{r73=HEAP32[r21]}if(r73>>>0>1){if((r5&1)==0){r74=r19;r75=r19}else{r19=HEAP32[r20>>2];r74=r19;r75=r19}if(r33){r76=r18>>>1}else{r76=HEAP32[r21]}r21=r74+r76|0;r76=HEAP32[r16];r74=r75+1|0;if((r74|0)==(r21|0)){r77=r76}else{r75=r76;r76=r74;while(1){HEAP8[r75]=HEAP8[r76];r74=r75+1|0;r18=r76+1|0;if((r18|0)==(r21|0)){r77=r74;break}else{r75=r74;r76=r18}}}HEAP32[r16]=r77}r77=r4&176;if((r77|0)==16){return}else if((r77|0)==32){HEAP32[r2>>2]=HEAP32[r16];return}else{HEAP32[r2>>2]=r1;return}}function __ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEcRKNS_12basic_stringIcS3_NS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=r7>>2;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+24;r13=r8+32;r14=r8+40;r15=r8+48;r16=r15>>2;r17=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r18=r17,r19=r18>>2;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20,r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+100|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;__ZNKSt3__18ios_base6getlocEv(r11,r5);r28=(r11|0)>>2;r29=HEAP32[r28];if((HEAP32[3616]|0)!=-1){HEAP32[r10]=14464;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r9,260)}r9=HEAP32[3617]-1|0;r10=HEAP32[r29+8>>2];do{if(HEAP32[r29+12>>2]-r10>>2>>>0>r9>>>0){r30=HEAP32[r10+(r9<<2)>>2];if((r30|0)==0){break}r31=r30;r32=r7;r33=r7;r34=HEAP8[r33];r35=r34&255;if((r35&1|0)==0){r36=r35>>>1}else{r36=HEAP32[r2+1]}if((r36|0)==0){r37=0}else{if((r34&1)==0){r38=r32+1|0}else{r38=HEAP32[r2+2]}r37=HEAP8[r38]<<24>>24==FUNCTION_TABLE[HEAP32[HEAP32[r30>>2]+28>>2]](r31,45)<<24>>24}HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r19]=0;HEAP32[r19+1]=0;HEAP32[r19+2]=0;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;__ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r4,r37,r11,r12,r13,r14,r15,r17,r20,r23);r30=r24|0;r34=HEAP8[r33];r35=r34&255;r39=(r35&1|0)==0;if(r39){r40=r35>>>1}else{r40=HEAP32[r2+1]}r41=HEAP32[r23>>2];if((r40|0)>(r41|0)){if(r39){r42=r35>>>1}else{r42=HEAP32[r2+1]}r35=HEAPU8[r21];if((r35&1|0)==0){r43=r35>>>1}else{r43=HEAP32[r20+4>>2]}r35=HEAPU8[r18];if((r35&1|0)==0){r44=r35>>>1}else{r44=HEAP32[r17+4>>2]}r45=(r42-r41<<1|1)+r43+r44|0}else{r35=HEAPU8[r21];if((r35&1|0)==0){r46=r35>>>1}else{r46=HEAP32[r20+4>>2]}r35=HEAPU8[r18];if((r35&1|0)==0){r47=r35>>>1}else{r47=HEAP32[r17+4>>2]}r45=r47+(r46+2)|0}r35=r45+r41|0;do{if(r35>>>0>100){r39=_malloc(r35);if((r39|0)!=0){r48=r39;r49=r39;r50=r34;break}__ZSt17__throw_bad_allocv();r48=0;r49=0;r50=HEAP8[r33]}else{r48=r30;r49=0;r50=r34}}while(0);if((r50&1)==0){r51=r32+1|0;r52=r32+1|0}else{r34=HEAP32[r2+2];r51=r34;r52=r34}r34=r50&255;if((r34&1|0)==0){r53=r34>>>1}else{r53=HEAP32[r2+1]}__ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r48,r25,r26,HEAP32[r5+4>>2],r52,r51+r53|0,r31,r37,r12,HEAP8[r13],HEAP8[r14],r15,r17,r20,r41);HEAP32[r27>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r27,r48,HEAP32[r25>>2],HEAP32[r26>>2],r5,r6);if((r49|0)==0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r20);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}_free(r49);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r20);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=STACKTOP;STACKTOP=STACKTOP+576|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r2,r9=r8>>2;r10=r2+120,r11=r10>>2;r12=r2+528;r13=r2+536;r14=r2+544;r15=r2+552;r16=r2+560;r17=r16>>2;r18=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21,r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+400|0;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=r2+16|0;HEAP32[r11]=r29;r30=r2+128|0;r31=_snprintf(r29,100,1968,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));do{if(r31>>>0>99){do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r29=_newlocale(1,1896,0);HEAP32[3276]=r29}}while(0);r29=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,HEAP32[3276],1968,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));r32=HEAP32[r11];if((r32|0)==0){__ZSt17__throw_bad_allocv();r33=HEAP32[r11]}else{r33=r32}r32=_malloc(r29<<2);r34=r32;if((r32|0)!=0){r35=r34;r36=r29;r37=r33;r38=r34;break}__ZSt17__throw_bad_allocv();r35=r34;r36=r29;r37=r33;r38=r34}else{r35=r30;r36=r31;r37=0;r38=0}}while(0);__ZNKSt3__18ios_base6getlocEv(r12,r5);r31=r12|0;r30=HEAP32[r31>>2];if((HEAP32[3614]|0)!=-1){HEAP32[r9]=14456;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r8,260)}r8=HEAP32[3615]-1|0;r9=HEAP32[r30+8>>2];do{if(HEAP32[r30+12>>2]-r9>>2>>>0>r8>>>0){r33=HEAP32[r9+(r8<<2)>>2];if((r33|0)==0){break}r7=r33;r10=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r33>>2]+48>>2]](r7,r10,r10+r36|0,r35);if((r36|0)==0){r39=0}else{r39=(HEAP8[HEAP32[r11]]|0)==45}HEAP32[r17]=0;HEAP32[r17+1]=0;HEAP32[r17+2]=0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;__ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r4,r39,r12,r13,r14,r15,r16,r18,r21,r24);r10=r25|0;r33=HEAP32[r24>>2];if((r36|0)>(r33|0)){r34=HEAPU8[r22];if((r34&1|0)==0){r40=r34>>>1}else{r40=HEAP32[r21+4>>2]}r34=HEAPU8[r19];if((r34&1|0)==0){r41=r34>>>1}else{r41=HEAP32[r18+4>>2]}r42=(r36-r33<<1|1)+r40+r41|0}else{r34=HEAPU8[r22];if((r34&1|0)==0){r43=r34>>>1}else{r43=HEAP32[r21+4>>2]}r34=HEAPU8[r19];if((r34&1|0)==0){r44=r34>>>1}else{r44=HEAP32[r18+4>>2]}r42=r44+(r43+2)|0}r34=r42+r33|0;do{if(r34>>>0>100){r29=_malloc(r34<<2);r32=r29;if((r29|0)!=0){r45=r32;r46=r32;break}__ZSt17__throw_bad_allocv();r45=r32;r46=r32}else{r45=r10;r46=0}}while(0);__ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r45,r26,r27,HEAP32[r5+4>>2],r35,(r36<<2)+r35|0,r7,r39,r13,HEAP32[r14>>2],HEAP32[r15>>2],r16,r18,r21,r33);HEAP32[r28>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r28,r45,HEAP32[r26>>2],HEAP32[r27>>2],r5,r6);if((r46|0)!=0){_free(r46)}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r21);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r18);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r31>>2]|0);if((r38|0)!=0){_free(r38)}if((r37|0)==0){STACKTOP=r2;return}_free(r37);STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r2);___cxa_throw(r2,9240,382)}function __ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47;r11=r9>>2;r12=r8>>2;r13=STACKTOP;STACKTOP=STACKTOP+40|0;r14=r13,r15=r14>>2;r16=r13+16,r17=r16>>2;r18=r13+32;r19=r18;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r29=r28>>2;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=r30;r32=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r33=r32>>2;r34=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r35=r34;r36=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r37=r36>>2;r38=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r39=r38>>2;r40=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r41=r40>>2;r42=HEAP32[r3>>2]>>2;if(r1){if((HEAP32[3730]|0)!=-1){HEAP32[r17]=14920;HEAP32[r17+1]=26;HEAP32[r17+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14920,r16,260)}r16=HEAP32[3731]-1|0;r17=HEAP32[r42+2];if(HEAP32[r42+3]-r17>>2>>>0<=r16>>>0){r43=___cxa_allocate_exception(4);r44=r43;__ZNSt8bad_castC2Ev(r44);___cxa_throw(r43,9240,382)}r1=HEAP32[r17+(r16<<2)>>2],r16=r1>>2;if((r1|0)==0){r43=___cxa_allocate_exception(4);r44=r43;__ZNSt8bad_castC2Ev(r44);___cxa_throw(r43,9240,382)}r43=r1;r44=HEAP32[r16];if(r2){FUNCTION_TABLE[HEAP32[r44+44>>2]](r19,r43);r19=r4;tempBigInt=HEAP32[r18>>2];HEAP8[r19]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r16]+32>>2]](r20,r43);r19=r9,r18=r19>>2;if((HEAP8[r19]&1)==0){HEAP32[r11+1]=0;HEAP8[r19]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r18]=HEAP32[r21];HEAP32[r18+1]=HEAP32[r21+1];HEAP32[r18+2]=HEAP32[r21+2];HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20)}else{FUNCTION_TABLE[HEAP32[r44+40>>2]](r23,r43);r23=r4;tempBigInt=HEAP32[r22>>2];HEAP8[r23]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r16]+28>>2]](r24,r43);r23=r9,r22=r23>>2;if((HEAP8[r23]&1)==0){HEAP32[r11+1]=0;HEAP8[r23]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r22]=HEAP32[r25];HEAP32[r22+1]=HEAP32[r25+1];HEAP32[r22+2]=HEAP32[r25+2];HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r24)}r24=r1>>2;r1=FUNCTION_TABLE[HEAP32[HEAP32[r24]+12>>2]](r43);HEAP32[r5>>2]=r1;r1=FUNCTION_TABLE[HEAP32[HEAP32[r24]+16>>2]](r43);HEAP32[r6>>2]=r1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+20>>2]](r26,r43);r1=r7,r25=r1>>2;if((HEAP8[r1]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r1]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r25]=HEAP32[r27];HEAP32[r25+1]=HEAP32[r27+1];HEAP32[r25+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r26);FUNCTION_TABLE[HEAP32[HEAP32[r16]+24>>2]](r28,r43);r16=r8,r26=r16>>2;if((HEAP8[r16]&1)==0){HEAP32[r12+1]=0;HEAP8[r16]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r26]=HEAP32[r29];HEAP32[r26+1]=HEAP32[r29+1];HEAP32[r26+2]=HEAP32[r29+2];HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r28);r45=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r43);HEAP32[r10>>2]=r45;STACKTOP=r13;return}else{if((HEAP32[3732]|0)!=-1){HEAP32[r15]=14928;HEAP32[r15+1]=26;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14928,r14,260)}r14=HEAP32[3733]-1|0;r15=HEAP32[r42+2];if(HEAP32[r42+3]-r15>>2>>>0<=r14>>>0){r46=___cxa_allocate_exception(4);r47=r46;__ZNSt8bad_castC2Ev(r47);___cxa_throw(r46,9240,382)}r42=HEAP32[r15+(r14<<2)>>2],r14=r42>>2;if((r42|0)==0){r46=___cxa_allocate_exception(4);r47=r46;__ZNSt8bad_castC2Ev(r47);___cxa_throw(r46,9240,382)}r46=r42;r47=HEAP32[r14];if(r2){FUNCTION_TABLE[HEAP32[r47+44>>2]](r31,r46);r31=r4;tempBigInt=HEAP32[r30>>2];HEAP8[r31]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r14]+32>>2]](r32,r46);r31=r9,r30=r31>>2;if((HEAP8[r31]&1)==0){HEAP32[r11+1]=0;HEAP8[r31]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r30]=HEAP32[r33];HEAP32[r30+1]=HEAP32[r33+1];HEAP32[r30+2]=HEAP32[r33+2];HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r32)}else{FUNCTION_TABLE[HEAP32[r47+40>>2]](r35,r46);r35=r4;tempBigInt=HEAP32[r34>>2];HEAP8[r35]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r14]+28>>2]](r36,r46);r35=r9,r34=r35>>2;if((HEAP8[r35]&1)==0){HEAP32[r11+1]=0;HEAP8[r35]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r34]=HEAP32[r37];HEAP32[r34+1]=HEAP32[r37+1];HEAP32[r34+2]=HEAP32[r37+2];HEAP32[r37]=0;HEAP32[r37+1]=0;HEAP32[r37+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r36)}r36=r42>>2;r42=FUNCTION_TABLE[HEAP32[HEAP32[r36]+12>>2]](r46);HEAP32[r5>>2]=r42;r42=FUNCTION_TABLE[HEAP32[HEAP32[r36]+16>>2]](r46);HEAP32[r6>>2]=r42;FUNCTION_TABLE[HEAP32[HEAP32[r14]+20>>2]](r38,r46);r42=r7,r6=r42>>2;if((HEAP8[r42]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r42]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r6]=HEAP32[r39];HEAP32[r6+1]=HEAP32[r39+1];HEAP32[r6+2]=HEAP32[r39+2];HEAP32[r39]=0;HEAP32[r39+1]=0;HEAP32[r39+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r38);FUNCTION_TABLE[HEAP32[HEAP32[r14]+24>>2]](r40,r46);r14=r8,r38=r14>>2;if((HEAP8[r14]&1)==0){HEAP32[r12+1]=0;HEAP8[r14]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r38]=HEAP32[r41];HEAP32[r38+1]=HEAP32[r41+1];HEAP32[r38+2]=HEAP32[r41+2];HEAP32[r41]=0;HEAP32[r41+1]=0;HEAP32[r41+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r40);r45=FUNCTION_TABLE[HEAP32[HEAP32[r36]+36>>2]](r46);HEAP32[r10>>2]=r45;STACKTOP=r13;return}}function __ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15){var r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r16=r3>>2;r3=0;HEAP32[r16]=r1;r17=r7>>2;r18=r14;r19=r14+4|0,r20=r19>>2;r21=r14+8|0;r14=r13;r22=(r4&512|0)==0;r23=r13+4|0;r24=r13+8|0;r13=r7;r25=(r15|0)>0;r26=r12;r27=r12+1|0;r28=(r12+8|0)>>2;r29=r12+4|0;r12=r5;r5=0;while(1){r30=HEAP8[r9+r5|0]|0;do{if((r30|0)==0){HEAP32[r2>>2]=HEAP32[r16];r31=r12}else if((r30|0)==1){HEAP32[r2>>2]=HEAP32[r16];r32=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,32);r33=HEAP32[r16];HEAP32[r16]=r33+4;HEAP32[r33>>2]=r32;r31=r12}else if((r30|0)==3){r32=HEAP8[r18];r33=r32&255;if((r33&1|0)==0){r34=r33>>>1}else{r34=HEAP32[r20]}if((r34|0)==0){r31=r12;break}if((r32&1)==0){r35=r19}else{r35=HEAP32[r21>>2]}r32=HEAP32[r35>>2];r33=HEAP32[r16];HEAP32[r16]=r33+4;HEAP32[r33>>2]=r32;r31=r12}else if((r30|0)==2){r32=HEAP8[r14];r33=r32&255;r36=(r33&1|0)==0;if(r36){r37=r33>>>1}else{r37=HEAP32[r23>>2]}if((r37|0)==0|r22){r31=r12;break}if((r32&1)==0){r38=r23;r39=r23;r40=r23}else{r32=HEAP32[r24>>2];r38=r32;r39=r32;r40=r32}if(r36){r41=r33>>>1}else{r41=HEAP32[r23>>2]}r33=(r41<<2)+r38|0;r36=HEAP32[r16];if((r39|0)==(r33|0)){r42=r36}else{r32=((r41-1<<2)+r38+ -r40|0)>>>2;r43=r39;r44=r36;while(1){HEAP32[r44>>2]=HEAP32[r43>>2];r45=r43+4|0;if((r45|0)==(r33|0)){break}r43=r45;r44=r44+4|0}r42=(r32+1<<2)+r36|0}HEAP32[r16]=r42;r31=r12}else if((r30|0)==4){r44=HEAP32[r16];r43=r8?r12+4|0:r12;r33=r43;while(1){if(r33>>>0>=r6>>>0){break}if(FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r7,2048,HEAP32[r33>>2])){r33=r33+4|0}else{break}}if(r25){if(r33>>>0>r43>>>0){r36=r33;r32=r15;while(1){r46=r36-4|0;r45=HEAP32[r46>>2];r47=HEAP32[r16];HEAP32[r16]=r47+4;HEAP32[r47>>2]=r45;r48=r32-1|0;r49=(r48|0)>0;if(r46>>>0>r43>>>0&r49){r36=r46;r32=r48}else{break}}if(r49){r50=r48;r51=r46;r3=999}else{r52=0;r53=r48;r54=r46}}else{r50=r15;r51=r33;r3=999}if(r3==999){r3=0;r52=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,48);r53=r50;r54=r51}r32=HEAP32[r16];HEAP32[r16]=r32+4;if((r53|0)>0){r36=r53;r45=r32;while(1){HEAP32[r45>>2]=r52;r47=r36-1|0;r55=HEAP32[r16];HEAP32[r16]=r55+4;if((r47|0)>0){r36=r47;r45=r55}else{r56=r55;break}}}else{r56=r32}HEAP32[r56>>2]=r10;r57=r54}else{r57=r33}if((r57|0)==(r43|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,48);r36=HEAP32[r16];HEAP32[r16]=r36+4;HEAP32[r36>>2]=r45}else{r45=HEAP8[r26];r36=r45&255;if((r36&1|0)==0){r58=r36>>>1}else{r58=HEAP32[r29>>2]}if((r58|0)==0){r59=r57;r60=0;r61=0;r62=-1}else{if((r45&1)==0){r63=r27}else{r63=HEAP32[r28]}r59=r57;r60=0;r61=0;r62=HEAP8[r63]|0}while(1){do{if((r60|0)==(r62|0)){r45=HEAP32[r16];HEAP32[r16]=r45+4;HEAP32[r45>>2]=r11;r45=r61+1|0;r36=HEAP8[r26];r55=r36&255;if((r55&1|0)==0){r64=r55>>>1}else{r64=HEAP32[r29>>2]}if(r45>>>0>=r64>>>0){r65=r62;r66=r45;r67=0;break}r55=(r36&1)==0;if(r55){r68=r27}else{r68=HEAP32[r28]}if((HEAP8[r68+r45|0]|0)==127){r65=-1;r66=r45;r67=0;break}if(r55){r69=r27}else{r69=HEAP32[r28]}r65=HEAP8[r69+r45|0]|0;r66=r45;r67=0}else{r65=r62;r66=r61;r67=r60}}while(0);r45=r59-4|0;r55=HEAP32[r45>>2];r36=HEAP32[r16];HEAP32[r16]=r36+4;HEAP32[r36>>2]=r55;if((r45|0)==(r43|0)){break}else{r59=r45;r60=r67+1|0;r61=r66;r62=r65}}}r33=HEAP32[r16];if((r44|0)==(r33|0)){r31=r43;break}r32=r33-4|0;if(r44>>>0<r32>>>0){r70=r44;r71=r32}else{r31=r43;break}while(1){r32=HEAP32[r70>>2];HEAP32[r70>>2]=HEAP32[r71>>2];HEAP32[r71>>2]=r32;r32=r70+4|0;r33=r71-4|0;if(r32>>>0<r33>>>0){r70=r32;r71=r33}else{r31=r43;break}}}else{r31=r12}}while(0);r30=r5+1|0;if(r30>>>0<4){r12=r31;r5=r30}else{break}}r5=HEAP8[r18];r18=r5&255;r31=(r18&1|0)==0;if(r31){r72=r18>>>1}else{r72=HEAP32[r20]}if(r72>>>0>1){if((r5&1)==0){r73=r19;r74=r19;r75=r19}else{r19=HEAP32[r21>>2];r73=r19;r74=r19;r75=r19}if(r31){r76=r18>>>1}else{r76=HEAP32[r20]}r20=(r76<<2)+r73|0;r18=HEAP32[r16];r31=r74+4|0;if((r31|0)==(r20|0)){r77=r18}else{r74=(((r76-2<<2)+r73+ -r75|0)>>>2)+1|0;r75=r18;r73=r31;while(1){HEAP32[r75>>2]=HEAP32[r73>>2];r31=r73+4|0;if((r31|0)==(r20|0)){break}else{r75=r75+4|0;r73=r31}}r77=(r74<<2)+r18|0}HEAP32[r16]=r77}r77=r4&176;if((r77|0)==16){return}else if((r77|0)==32){HEAP32[r2>>2]=HEAP32[r16];return}else{HEAP32[r2>>2]=r1;return}}function __ZNSt3__18messagesIcED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18messagesIcED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18messagesIcE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE(r1,r2,r3){var r4;if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=__Z7catopenPKci(r4,200);return r2>>>(((r2|0)!=-1|0)>>>0)}function __ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwRKNS_12basic_stringIwS3_NS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=r7>>2;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+24;r13=r8+32;r14=r8+40;r15=r8+48;r16=r15>>2;r17=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r18=r17,r19=r18>>2;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20,r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+400|0;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;__ZNKSt3__18ios_base6getlocEv(r11,r5);r28=(r11|0)>>2;r29=HEAP32[r28];if((HEAP32[3614]|0)!=-1){HEAP32[r10]=14456;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r9,260)}r9=HEAP32[3615]-1|0;r10=HEAP32[r29+8>>2];do{if(HEAP32[r29+12>>2]-r10>>2>>>0>r9>>>0){r30=HEAP32[r10+(r9<<2)>>2];if((r30|0)==0){break}r31=r30;r32=r7;r33=HEAP8[r32];r34=r33&255;if((r34&1|0)==0){r35=r34>>>1}else{r35=HEAP32[r2+1]}if((r35|0)==0){r36=0}else{if((r33&1)==0){r37=r7+4|0}else{r37=HEAP32[r2+2]}r36=(HEAP32[r37>>2]|0)==(FUNCTION_TABLE[HEAP32[HEAP32[r30>>2]+44>>2]](r31,45)|0)}HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r19]=0;HEAP32[r19+1]=0;HEAP32[r19+2]=0;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;__ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r4,r36,r11,r12,r13,r14,r15,r17,r20,r23);r30=r24|0;r33=HEAP8[r32];r34=r33&255;r38=(r34&1|0)==0;if(r38){r39=r34>>>1}else{r39=HEAP32[r2+1]}r40=HEAP32[r23>>2];if((r39|0)>(r40|0)){if(r38){r41=r34>>>1}else{r41=HEAP32[r2+1]}r34=HEAPU8[r21];if((r34&1|0)==0){r42=r34>>>1}else{r42=HEAP32[r20+4>>2]}r34=HEAPU8[r18];if((r34&1|0)==0){r43=r34>>>1}else{r43=HEAP32[r17+4>>2]}r44=(r41-r40<<1|1)+r42+r43|0}else{r34=HEAPU8[r21];if((r34&1|0)==0){r45=r34>>>1}else{r45=HEAP32[r20+4>>2]}r34=HEAPU8[r18];if((r34&1|0)==0){r46=r34>>>1}else{r46=HEAP32[r17+4>>2]}r44=r46+(r45+2)|0}r34=r44+r40|0;do{if(r34>>>0>100){r38=_malloc(r34<<2);r47=r38;if((r38|0)!=0){r48=r47;r49=r47;r50=r33;break}__ZSt17__throw_bad_allocv();r48=r47;r49=r47;r50=HEAP8[r32]}else{r48=r30;r49=0;r50=r33}}while(0);if((r50&1)==0){r51=r7+4|0;r52=r7+4|0}else{r33=HEAP32[r2+2];r51=r33;r52=r33}r33=r50&255;if((r33&1|0)==0){r53=r33>>>1}else{r53=HEAP32[r2+1]}__ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r48,r25,r26,HEAP32[r5+4>>2],r52,(r53<<2)+r51|0,r31,r36,r12,HEAP32[r13>>2],HEAP32[r14>>2],r15,r17,r20,r40);HEAP32[r27>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r27,r48,HEAP32[r25>>2],HEAP32[r26>>2],r5,r6);if((r49|0)==0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}_free(r49);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9240,382)}function __ZNKSt3__18messagesIcE6do_getEiiiRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+16|0;r8=r7;r9=r8,r10=r9>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;r10=r1>>2;r11=r6;r12=HEAP8[r6];if((r12&1)==0){r13=r11+1|0;r14=r11+1|0}else{r11=HEAP32[r6+8>>2];r13=r11;r14=r11}r11=r12&255;if((r11&1|0)==0){r15=r11>>>1}else{r15=HEAP32[r6+4>>2]}r6=r13+r15|0;do{if(r14>>>0<r6>>>0){r15=r14;while(1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r8,HEAP8[r15]);r13=r15+1|0;if(r13>>>0<r6>>>0){r15=r13}else{break}}r15=(r3|0)==-1?-1:r3<<1;if((HEAP8[r9]&1)==0){r16=r15;r2=1131;break}r17=HEAP32[r8+8>>2];r18=r15}else{r16=(r3|0)==-1?-1:r3<<1;r2=1131}}while(0);if(r2==1131){r17=r8+1|0;r18=r16}r16=__Z7catgetsP8_nl_catdiiPKc(r18,r4,r5,r17);HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;r10=_strlen(r16);r17=r16+r10|0;if((r10|0)>0){r19=r16}else{__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r8);STACKTOP=r7;return}while(1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r1,HEAP8[r19]);r16=r19+1|0;if(r16>>>0<r17>>>0){r19=r16}else{break}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r8);STACKTOP=r7;return}function __ZNKSt3__18messagesIcE8do_closeEi(r1,r2){__Z8catcloseP8_nl_catd((r2|0)==-1?-1:r2<<1);return}function __ZNSt3__18messagesIwED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18messagesIwED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18messagesIwE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE(r1,r2,r3){var r4;if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=__Z7catopenPKci(r4,200);return r2>>>(((r2|0)!=-1|0)>>>0)}function __ZNKSt3__18messagesIwE8do_closeEi(r1,r2){__Z8catcloseP8_nl_catd((r2|0)==-1?-1:r2<<1);return}function __ZNKSt3__18messagesIwE6do_getEiiiRKNS_12basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+224|0;r8=r7;r9=r7+8;r10=r7+40;r11=r7+48,r12=r11>>2;r13=r7+56;r14=r7+64;r15=r7+192;r16=r7+200,r17=r16>>2;r18=r7+208;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+8|0;r22=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r1>>2;r23=r21|0;HEAP32[r21+4>>2]=0;HEAP32[r21>>2]=4936;r24=HEAP8[r6];if((r24&1)==0){r25=r6+4|0;r26=r6+4|0}else{r27=HEAP32[r6+8>>2];r25=r27;r26=r27}r27=r24&255;if((r27&1|0)==0){r28=r27>>>1}else{r28=HEAP32[r6+4>>2]}r6=(r28<<2)+r25|0;L1376:do{if(r26>>>0<r6>>>0){r25=r21;r28=r9|0;r27=r9+32|0;r24=r26;r29=4936;while(1){HEAP32[r12]=r24;r30=(FUNCTION_TABLE[HEAP32[r29+12>>2]](r23,r8,r24,r6,r11,r28,r27,r10)|0)==2;r31=HEAP32[r12];if(r30|(r31|0)==(r24|0)){break}if(r28>>>0<HEAP32[r10>>2]>>>0){r30=r28;while(1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r18,HEAP8[r30]);r32=r30+1|0;if(r32>>>0<HEAP32[r10>>2]>>>0){r30=r32}else{break}}r33=HEAP32[r12]}else{r33=r31}if(r33>>>0>=r6>>>0){break L1376}r24=r33;r29=HEAP32[r25>>2]}r25=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r25,1336);___cxa_throw(r25,9256,44)}}while(0);__ZNSt3__114__shared_countD2Ev(r21|0);if((HEAP8[r19]&1)==0){r34=r18+1|0}else{r34=HEAP32[r18+8>>2]}r19=__Z7catgetsP8_nl_catdiiPKc((r3|0)==-1?-1:r3<<1,r4,r5,r34);HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r22|0;HEAP32[r22+4>>2]=0;HEAP32[r22>>2]=4880;r34=_strlen(r19);r5=r19+r34|0;if((r34|0)<1){r35=r22|0;__ZNSt3__114__shared_countD2Ev(r35);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);STACKTOP=r7;return}r34=r22;r4=r5;r3=r14|0;r21=r14+128|0;r14=r19;r19=4880;while(1){HEAP32[r17]=r14;r33=(FUNCTION_TABLE[HEAP32[r19+16>>2]](r20,r13,r14,(r4-r14|0)>32?r14+32|0:r5,r16,r3,r21,r15)|0)==2;r6=HEAP32[r17];if(r33|(r6|0)==(r14|0)){break}if(r3>>>0<HEAP32[r15>>2]>>>0){r33=r3;while(1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r1,HEAP32[r33>>2]);r12=r33+4|0;if(r12>>>0<HEAP32[r15>>2]>>>0){r33=r12}else{break}}r36=HEAP32[r17]}else{r36=r6}if(r36>>>0>=r5>>>0){r2=1199;break}r14=r36;r19=HEAP32[r34>>2]}if(r2==1199){r35=r22|0;__ZNSt3__114__shared_countD2Ev(r35);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);STACKTOP=r7;return}r7=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r7,1336);___cxa_throw(r7,9256,44)}function __ZNSt3__17codecvtIwc10_mbstate_tED2Ev(r1){var r2;HEAP32[r1>>2]=4400;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv(r1){r1=___cxa_allocate_exception(8);__ZNSt11logic_errorC2EPKc(r1,1944);HEAP32[r1>>2]=3336;___cxa_throw(r1,9272,76)}function __ZNSt3__16locale5__impC2Ej(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r3=STACKTOP;STACKTOP=STACKTOP+448|0;r4=r3,r5=r4>>2;r6=r3+16,r7=r6>>2;r8=r3+32,r9=r8>>2;r10=r3+48,r11=r10>>2;r12=r3+64,r13=r12>>2;r14=r3+80,r15=r14>>2;r16=r3+96,r17=r16>>2;r18=r3+112,r19=r18>>2;r20=r3+128,r21=r20>>2;r22=r3+144,r23=r22>>2;r24=r3+160,r25=r24>>2;r26=r3+176,r27=r26>>2;r28=r3+192,r29=r28>>2;r30=r3+208,r31=r30>>2;r32=r3+224,r33=r32>>2;r34=r3+240,r35=r34>>2;r36=r3+256,r37=r36>>2;r38=r3+272,r39=r38>>2;r40=r3+288,r41=r40>>2;r42=r3+304,r43=r42>>2;r44=r3+320,r45=r44>>2;r46=r3+336,r47=r46>>2;r48=r3+352,r49=r48>>2;r50=r3+368,r51=r50>>2;r52=r3+384,r53=r52>>2;r54=r3+400,r55=r54>>2;r56=r3+416,r57=r56>>2;r58=r3+432,r59=r58>>2;HEAP32[r1+4>>2]=r2-1;HEAP32[r1>>2]=4656;r2=r1+8|0;r60=(r1+12|0)>>2;HEAP8[r1+136|0]=1;r61=r1+24|0;r62=r61;HEAP32[r60]=r62;HEAP32[r2>>2]=r62;HEAP32[r1+16>>2]=r61+112;r61=28;r63=r62;while(1){if((r63|0)==0){r64=0}else{HEAP32[r63>>2]=0;r64=HEAP32[r60]}r62=r64+4|0;HEAP32[r60]=r62;r65=r61-1|0;if((r65|0)==0){break}else{r61=r65;r63=r62}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1+144|0,1896,1);r63=HEAP32[r2>>2];r2=HEAP32[r60];if((r63|0)!=(r2|0)){HEAP32[r60]=(~((r2-4+ -r63|0)>>>2)<<2)+r2}HEAP32[3309]=0;HEAP32[3308]=4360;if((HEAP32[3536]|0)!=-1){HEAP32[r59]=14144;HEAP32[r59+1]=26;HEAP32[r59+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r58,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13232,HEAP32[3537]-1|0);HEAP32[3307]=0;HEAP32[3306]=4320;if((HEAP32[3534]|0)!=-1){HEAP32[r57]=14136;HEAP32[r57+1]=26;HEAP32[r57+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r56,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13224,HEAP32[3535]-1|0);HEAP32[3359]=0;HEAP32[3358]=4768;HEAP32[3360]=0;HEAP8[13444]=0;r56=___ctype_b_loc();HEAP32[3360]=HEAP32[r56>>2];if((HEAP32[3616]|0)!=-1){HEAP32[r55]=14464;HEAP32[r55+1]=26;HEAP32[r55+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14464,r54,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13432,HEAP32[3617]-1|0);HEAP32[3357]=0;HEAP32[3356]=4688;if((HEAP32[3614]|0)!=-1){HEAP32[r53]=14456;HEAP32[r53+1]=26;HEAP32[r53+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14456,r52,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13424,HEAP32[3615]-1|0);HEAP32[3311]=0;HEAP32[3310]=4456;if((HEAP32[3540]|0)!=-1){HEAP32[r51]=14160;HEAP32[r51+1]=26;HEAP32[r51+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14160,r50,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13240,HEAP32[3541]-1|0);HEAP32[725]=0;HEAP32[724]=4400;HEAP32[726]=0;if((HEAP32[3538]|0)!=-1){HEAP32[r49]=14152;HEAP32[r49+1]=26;HEAP32[r49+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14152,r48,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2896,HEAP32[3539]-1|0);HEAP32[3313]=0;HEAP32[3312]=4512;if((HEAP32[3542]|0)!=-1){HEAP32[r47]=14168;HEAP32[r47+1]=26;HEAP32[r47+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14168,r46,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13248,HEAP32[3543]-1|0);HEAP32[3315]=0;HEAP32[3314]=4568;if((HEAP32[3544]|0)!=-1){HEAP32[r45]=14176;HEAP32[r45+1]=26;HEAP32[r45+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14176,r44,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13256,HEAP32[3545]-1|0);HEAP32[3289]=0;HEAP32[3288]=3864;HEAP8[13160]=46;HEAP8[13161]=44;HEAP32[3291]=0;HEAP32[3292]=0;HEAP32[3293]=0;if((HEAP32[3520]|0)!=-1){HEAP32[r43]=14080;HEAP32[r43+1]=26;HEAP32[r43+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r42,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13152,HEAP32[3521]-1|0);HEAP32[717]=0;HEAP32[716]=3816;HEAP32[718]=46;HEAP32[719]=44;HEAP32[720]=0;HEAP32[721]=0;HEAP32[722]=0;if((HEAP32[3518]|0)!=-1){HEAP32[r41]=14072;HEAP32[r41+1]=26;HEAP32[r41+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r40,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2864,HEAP32[3519]-1|0);HEAP32[3305]=0;HEAP32[3304]=4248;if((HEAP32[3532]|0)!=-1){HEAP32[r39]=14128;HEAP32[r39+1]=26;HEAP32[r39+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14128,r38,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13216,HEAP32[3533]-1|0);HEAP32[3303]=0;HEAP32[3302]=4176;if((HEAP32[3530]|0)!=-1){HEAP32[r37]=14120;HEAP32[r37+1]=26;HEAP32[r37+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14120,r36,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13208,HEAP32[3531]-1|0);HEAP32[3301]=0;HEAP32[3300]=4112;if((HEAP32[3528]|0)!=-1){HEAP32[r35]=14112;HEAP32[r35+1]=26;HEAP32[r35+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14112,r34,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13200,HEAP32[3529]-1|0);HEAP32[3299]=0;HEAP32[3298]=4048;if((HEAP32[3526]|0)!=-1){HEAP32[r33]=14104;HEAP32[r33+1]=26;HEAP32[r33+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14104,r32,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13192,HEAP32[3527]-1|0);HEAP32[3369]=0;HEAP32[3368]=5864;if((HEAP32[3736]|0)!=-1){HEAP32[r31]=14944;HEAP32[r31+1]=26;HEAP32[r31+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14944,r30,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13472,HEAP32[3737]-1|0);HEAP32[3367]=0;HEAP32[3366]=5800;if((HEAP32[3734]|0)!=-1){HEAP32[r29]=14936;HEAP32[r29+1]=26;HEAP32[r29+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14936,r28,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13464,HEAP32[3735]-1|0);HEAP32[3365]=0;HEAP32[3364]=5736;if((HEAP32[3732]|0)!=-1){HEAP32[r27]=14928;HEAP32[r27+1]=26;HEAP32[r27+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14928,r26,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13456,HEAP32[3733]-1|0);HEAP32[3363]=0;HEAP32[3362]=5672;if((HEAP32[3730]|0)!=-1){HEAP32[r25]=14920;HEAP32[r25+1]=26;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14920,r24,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13448,HEAP32[3731]-1|0);HEAP32[3287]=0;HEAP32[3286]=3520;if((HEAP32[3508]|0)!=-1){HEAP32[r23]=14032;HEAP32[r23+1]=26;HEAP32[r23+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14032,r22,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13144,HEAP32[3509]-1|0);HEAP32[3285]=0;HEAP32[3284]=3480;if((HEAP32[3506]|0)!=-1){HEAP32[r21]=14024;HEAP32[r21+1]=26;HEAP32[r21+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14024,r20,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13136,HEAP32[3507]-1|0);HEAP32[3283]=0;HEAP32[3282]=3440;if((HEAP32[3504]|0)!=-1){HEAP32[r19]=14016;HEAP32[r19+1]=26;HEAP32[r19+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14016,r18,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13128,HEAP32[3505]-1|0);HEAP32[3281]=0;HEAP32[3280]=3400;if((HEAP32[3502]|0)!=-1){HEAP32[r17]=14008;HEAP32[r17+1]=26;HEAP32[r17+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14008,r16,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13120,HEAP32[3503]-1|0);HEAP32[713]=0;HEAP32[712]=3720;HEAP32[714]=3768;if((HEAP32[3516]|0)!=-1){HEAP32[r15]=14064;HEAP32[r15+1]=26;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14064,r14,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2848,HEAP32[3517]-1|0);HEAP32[709]=0;HEAP32[708]=3624;HEAP32[710]=3672;if((HEAP32[3514]|0)!=-1){HEAP32[r13]=14056;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14056,r12,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2832,HEAP32[3515]-1|0);HEAP32[705]=0;HEAP32[704]=4624;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r12=_newlocale(1,1896,0);HEAP32[3276]=r12}}while(0);HEAP32[706]=HEAP32[3276];HEAP32[704]=3592;if((HEAP32[3512]|0)!=-1){HEAP32[r11]=14048;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14048,r10,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2816,HEAP32[3513]-1|0);HEAP32[701]=0;HEAP32[700]=4624;do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}r10=_newlocale(1,1896,0);HEAP32[3276]=r10}}while(0);HEAP32[702]=HEAP32[3276];HEAP32[700]=3560;if((HEAP32[3510]|0)!=-1){HEAP32[r9]=14040;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14040,r8,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2800,HEAP32[3511]-1|0);HEAP32[3297]=0;HEAP32[3296]=3952;if((HEAP32[3524]|0)!=-1){HEAP32[r7]=14096;HEAP32[r7+1]=26;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14096,r6,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13184,HEAP32[3525]-1|0);HEAP32[3295]=0;HEAP32[3294]=3912;if((HEAP32[3522]|0)!=-1){HEAP32[r5]=14088;HEAP32[r5+1]=26;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14088,r4,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13176,HEAP32[3523]-1|0);STACKTOP=r3;return}function __ZNKSt3__15ctypeIcE8do_widenEc(r1,r2){return r2}function __ZNKSt3__17codecvtIcc10_mbstate_tE6do_outERS1_PKcS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){HEAP32[r5>>2]=r3;HEAP32[r8>>2]=r6;return 3}function __ZNKSt3__15ctypeIwE8do_widenEc(r1,r2){return r2<<24>>24}function __ZNKSt3__15ctypeIwE9do_narrowEwc(r1,r2,r3){return r2>>>0<128?r2&255:r3}function __ZNKSt3__15ctypeIcE9do_narrowEcc(r1,r2,r3){return r2<<24>>24>-1?r2:r3}function __ZNSt3__16locale2id6__initEv(r1){HEAP32[r1+4>>2]=(tempValue=HEAP32[3546],HEAP32[3546]=tempValue+1,tempValue)+1;return}function __ZNKSt3__15ctypeIwE8do_widenEPKcS3_Pw(r1,r2,r3,r4){var r5,r6,r7;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){HEAP32[r7>>2]=HEAP8[r6]|0;r4=r6+1|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+4|0}}return r5}function __ZNKSt3__15ctypeIwE9do_narrowEPKwS3_cPc(r1,r2,r3,r4,r5){var r6,r7,r8;if((r2|0)==(r3|0)){r6=r2;return r6}r1=((r3-4+ -r2|0)>>>2)+1|0;r7=r2;r8=r5;while(1){r5=HEAP32[r7>>2];HEAP8[r8]=r5>>>0<128?r5&255:r4;r5=r7+4|0;if((r5|0)==(r3|0)){break}else{r7=r5;r8=r8+1|0}}r6=(r1<<2)+r2|0;return r6}function __ZNKSt3__15ctypeIcE8do_widenEPKcS3_Pc(r1,r2,r3,r4){var r5,r6,r7;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){HEAP8[r7]=HEAP8[r6];r4=r6+1|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+1|0}}return r5}function __ZNKSt3__15ctypeIcE9do_narrowEPKcS3_cPc(r1,r2,r3,r4,r5){var r6,r7,r8;if((r2|0)==(r3|0)){r6=r2;return r6}else{r7=r2;r8=r5}while(1){r5=HEAP8[r7];HEAP8[r8]=r5<<24>>24>-1?r5:r4;r5=r7+1|0;if((r5|0)==(r3|0)){r6=r3;break}else{r7=r5;r8=r8+1|0}}return r6}function __ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;__ZNSt3__114__shared_count12__add_sharedEv(r2|0);r4=r1+8|0;r5=r1+12|0;r1=HEAP32[r5>>2];r6=(r4|0)>>2;r7=HEAP32[r6];r8=r1-r7>>2;do{if(r8>>>0>r3>>>0){r9=r7}else{r10=r3+1|0;if(r8>>>0<r10>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r4,r10-r8|0);r9=HEAP32[r6];break}if(r8>>>0<=r10>>>0){r9=r7;break}r11=(r10<<2)+r7|0;if((r11|0)==(r1|0)){r9=r7;break}HEAP32[r5>>2]=(~((r1-4+ -r11|0)>>>2)<<2)+r1;r9=r7}}while(0);r7=HEAP32[r9+(r3<<2)>>2];if((r7|0)==0){r12=r9;r13=(r3<<2)+r12|0;HEAP32[r13>>2]=r2;return}__ZNSt3__114__shared_count16__release_sharedEv(r7|0);r12=HEAP32[r6];r13=(r3<<2)+r12|0;HEAP32[r13>>2]=r2;return}function __ZNSt3__16locale5__impD0Ev(r1){__ZNSt3__16locale5__impD2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__16locale5__impD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;HEAP32[r1>>2]=4656;r2=(r1+12|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;r5=HEAP32[r4];if((r3|0)!=(r5|0)){r6=0;r7=r5;r5=r3;while(1){r3=HEAP32[r7+(r6<<2)>>2];if((r3|0)==0){r8=r5;r9=r7}else{__ZNSt3__114__shared_count16__release_sharedEv(r3|0);r8=HEAP32[r2];r9=HEAP32[r4]}r3=r6+1|0;if(r3>>>0<r8-r9>>2>>>0){r6=r3;r7=r9;r5=r8}else{break}}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+144|0);r8=HEAP32[r4];if((r8|0)==0){r10=r1|0;__ZNSt3__114__shared_countD2Ev(r10);return}r4=HEAP32[r2];if((r8|0)!=(r4|0)){HEAP32[r2]=(~((r4-4+ -r8|0)>>>2)<<2)+r4}if((r8|0)==(r1+24|0)){HEAP8[r1+136|0]=0;r10=r1|0;__ZNSt3__114__shared_countD2Ev(r10);return}else{__ZdlPv(r8);r10=r1|0;__ZNSt3__114__shared_countD2Ev(r10);return}}function __ZNSt3__16locale8__globalEv(){var r1,r2;if((HEAP8[15008]|0)!=0){r1=HEAP32[3268];return r1}if((___cxa_guard_acquire(15008)|0)==0){r1=HEAP32[3268];return r1}do{if((HEAP8[15016]|0)==0){if((___cxa_guard_acquire(15016)|0)==0){break}__ZNSt3__16locale5__impC2Ej(13264,1);HEAP32[3272]=13264;HEAP32[3270]=13088}}while(0);r2=HEAP32[HEAP32[3270]>>2];HEAP32[3274]=r2;__ZNSt3__114__shared_count12__add_sharedEv(r2|0);HEAP32[3268]=13096;r1=HEAP32[3268];return r1}function __ZNSt3__16localeC2ERKS0_(r1,r2){var r3;r3=HEAP32[r2>>2];HEAP32[r1>>2]=r3;__ZNSt3__114__shared_count12__add_sharedEv(r3|0);return}function __ZNSt3__16localeD2Ev(r1){__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r1>>2]|0);return}function __ZNKSt3__16locale9has_facetERNS0_2idE(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;r6=HEAP32[r1>>2];r1=r2|0;if((HEAP32[r1>>2]|0)!=-1){HEAP32[r5]=r2;HEAP32[r5+1]=26;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r4,260)}r4=HEAP32[r2+4>>2]-1|0;r2=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r2>>2>>>0<=r4>>>0){r7=0;STACKTOP=r3;return r7}r7=(HEAP32[r2+(r4<<2)>>2]|0)!=0;STACKTOP=r3;return r7}function __ZNSt3__16locale5facetD0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__16locale5facet16__on_zero_sharedEv(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function __ZNSt3__15ctypeIwED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__15ctypeIcED0Ev(r1){var r2;HEAP32[r1>>2]=4768;r2=HEAP32[r1+8>>2];do{if((r2|0)!=0){if((HEAP8[r1+12|0]&1)==0){break}__ZdaPv(r2)}}while(0);__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__15ctypeIcED2Ev(r1){var r2;HEAP32[r1>>2]=4768;r2=HEAP32[r1+8>>2];do{if((r2|0)!=0){if((HEAP8[r1+12|0]&1)==0){break}__ZdaPv(r2)}}while(0);__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__17codecvtIcc10_mbstate_tED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__16localeC2Ev(r1){var r2,r3;r2=__ZNSt3__16locale8__globalEv()|0;r3=HEAP32[r2>>2];HEAP32[r1>>2]=r3;__ZNSt3__114__shared_count12__add_sharedEv(r3|0);return}function __ZNKSt3__16locale9use_facetERNS0_2idE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;r6=HEAP32[r1>>2];r1=r2|0;if((HEAP32[r1>>2]|0)!=-1){HEAP32[r5]=r2;HEAP32[r5+1]=26;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r4,260)}r4=HEAP32[r2+4>>2]-1|0;r2=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r2>>2>>>0<=r4>>>0){r7=___cxa_allocate_exception(4);r8=r7;__ZNSt8bad_castC2Ev(r8);___cxa_throw(r7,9240,382)}r6=HEAP32[r2+(r4<<2)>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);r8=r7;__ZNSt8bad_castC2Ev(r8);___cxa_throw(r7,9240,382)}else{STACKTOP=r3;return r6}}function __ZNKSt3__15ctypeIwE5do_isEtw(r1,r2,r3){var r4;if(r3>>>0>=128){r4=0;return r4}r1=___ctype_b_loc();r4=(HEAP16[HEAP32[r1>>2]+(r3<<1)>>1]&r2)<<16>>16!=0;return r4}function __ZNKSt3__15ctypeIwE5do_isEPKwS3_Pt(r1,r2,r3,r4){var r5,r6,r7,r8;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){r4=HEAP32[r6>>2];if(r4>>>0<128){r2=___ctype_b_loc();r8=HEAP16[HEAP32[r2>>2]+(r4<<1)>>1]}else{r8=0}HEAP16[r7>>1]=r8;r4=r6+4|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+2|0}}return r5}function __ZNKSt3__15ctypeIwE10do_scan_isEtPKwS3_(r1,r2,r3,r4){var r5,r6,r7;L1693:do{if((r3|0)==(r4|0)){r5=r3}else{r1=r3;while(1){r6=HEAP32[r1>>2];if(r6>>>0<128){r7=___ctype_b_loc();if((HEAP16[HEAP32[r7>>2]+(r6<<1)>>1]&r2)<<16>>16!=0){r5=r1;break L1693}}r6=r1+4|0;if((r6|0)==(r4|0)){r5=r4;break}else{r1=r6}}}}while(0);return r5}function __ZNKSt3__15ctypeIwE11do_scan_notEtPKwS3_(r1,r2,r3,r4){var r5,r6;r1=r3;while(1){if((r1|0)==(r4|0)){r5=r4;break}r3=HEAP32[r1>>2];if(r3>>>0>=128){r5=r1;break}r6=___ctype_b_loc();if((HEAP16[HEAP32[r6>>2]+(r3<<1)>>1]&r2)<<16>>16==0){r5=r1;break}else{r1=r1+4|0}}return r5}function __ZNKSt3__15ctypeIwE10do_toupperEw(r1,r2){var r3;if(r2>>>0>=128){r3=r2;return r3}r1=___ctype_toupper_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2];return r3}function __ZNKSt3__15ctypeIwE10do_toupperEPwPKw(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP32[r5>>2];if(r2>>>0<128){r1=___ctype_toupper_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2]}else{r6=r2}HEAP32[r5>>2]=r6;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIwE10do_tolowerEw(r1,r2){var r3;if(r2>>>0>=128){r3=r2;return r3}r1=___ctype_tolower_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2];return r3}function __ZNKSt3__15ctypeIwE10do_tolowerEPwPKw(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP32[r5>>2];if(r2>>>0<128){r1=___ctype_tolower_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2]}else{r6=r2}HEAP32[r5>>2]=r6;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIcE10do_toupperEc(r1,r2){var r3;if(r2<<24>>24<=-1){r3=r2;return r3}r1=___ctype_toupper_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255;return r3}function __ZNKSt3__15ctypeIcE10do_toupperEPcPKc(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP8[r5];if(r2<<24>>24>-1){r1=___ctype_toupper_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255}else{r6=r2}HEAP8[r5]=r6;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIcE10do_tolowerEc(r1,r2){var r3;if(r2<<24>>24<=-1){r3=r2;return r3}r1=___ctype_tolower_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255;return r3}function __ZNKSt3__15ctypeIcE10do_tolowerEPcPKc(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP8[r5];if(r2<<24>>24>-1){r1=___ctype_tolower_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255}else{r6=r2}HEAP8[r5]=r6;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__17codecvtIcc10_mbstate_tE5do_inERS1_PKcS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){HEAP32[r5>>2]=r3;HEAP32[r8>>2]=r6;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE11do_encodingEv(r1){return 1}function __ZNKSt3__17codecvtIcc10_mbstate_tE16do_always_noconvEv(r1){return 1}function __ZNKSt3__17codecvtIcc10_mbstate_tE13do_max_lengthEv(r1){return 1}function __ZNKSt3__17codecvtIwc10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIcc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){r2=r4-r3|0;return r2>>>0<r5>>>0?r2:r5}function __ZNSt3__17codecvtIDsc10_mbstate_tED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__17codecvtIDsc10_mbstate_tE6do_outERS1_PKDsS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L13utf16_to_utf8EPKtS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=(HEAP32[r1>>2]-r3>>1<<1)+r3;HEAP32[r8>>2]=r6+(HEAP32[r9>>2]-r6);STACKTOP=r2;return r10}function __ZNSt3__17codecvtIwc10_mbstate_tED0Ev(r1){var r2;HEAP32[r1>>2]=4400;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__17codecvtIwc10_mbstate_tE6do_outERS1_PKwS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r9=r8>>2;r8=r5>>2;r10=0;r11=STACKTOP;STACKTOP=STACKTOP+8|0;r12=r11;r13=r12;r14=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r15=r3;while(1){if((r15|0)==(r4|0)){r16=r4;break}if((HEAP32[r15>>2]|0)==0){r16=r15;break}else{r15=r15+4|0}}HEAP32[r9]=r6;HEAP32[r8]=r3;L1790:do{if((r3|0)==(r4|0)|(r6|0)==(r7|0)){r17=r3}else{r15=r2;r18=r7;r19=(r1+8|0)>>2;r20=r14|0;r21=r6;r22=r3;r23=r16;while(1){r24=HEAP32[r15+4>>2];HEAP32[r12>>2]=HEAP32[r15>>2];HEAP32[r12+4>>2]=r24;r24=_uselocale(HEAP32[r19]);r25=_wcsnrtombs(r21,r5,r23-r22>>2,r18-r21|0,r2);if((r24|0)!=0){_uselocale(r24)}if((r25|0)==-1){r10=1548;break}else if((r25|0)==0){r26=1;r10=1584;break}r24=HEAP32[r9]+r25|0;HEAP32[r9]=r24;if((r24|0)==(r7|0)){r10=1581;break}if((r23|0)==(r4|0)){r27=r4;r28=r24;r29=HEAP32[r8]}else{r24=_uselocale(HEAP32[r19]);r25=_wcrtomb(r20,0,r2);if((r24|0)!=0){_uselocale(r24)}if((r25|0)==-1){r26=2;r10=1586;break}r24=HEAP32[r9];if(r25>>>0>(r18-r24|0)>>>0){r26=1;r10=1587;break}L1809:do{if((r25|0)!=0){r30=r25;r31=r20;r32=r24;while(1){r33=HEAP8[r31];HEAP32[r9]=r32+1;HEAP8[r32]=r33;r33=r30-1|0;if((r33|0)==0){break L1809}r30=r33;r31=r31+1|0;r32=HEAP32[r9]}}}while(0);r24=HEAP32[r8]+4|0;HEAP32[r8]=r24;r25=r24;while(1){if((r25|0)==(r4|0)){r34=r4;break}if((HEAP32[r25>>2]|0)==0){r34=r25;break}else{r25=r25+4|0}}r27=r34;r28=HEAP32[r9];r29=r24}if((r29|0)==(r4|0)|(r28|0)==(r7|0)){r17=r29;break L1790}else{r21=r28;r22=r29;r23=r27}}if(r10==1548){HEAP32[r9]=r21;L1821:do{if((r22|0)==(HEAP32[r8]|0)){r35=r22}else{r23=r22;r20=r21;while(1){r18=HEAP32[r23>>2];r15=_uselocale(HEAP32[r19]);r25=_wcrtomb(r20,r18,r13);if((r15|0)!=0){_uselocale(r15)}if((r25|0)==-1){r35=r23;break L1821}r15=HEAP32[r9]+r25|0;HEAP32[r9]=r15;r25=r23+4|0;if((r25|0)==(HEAP32[r8]|0)){r35=r25;break}else{r23=r25;r20=r15}}}}while(0);HEAP32[r8]=r35;r26=2;STACKTOP=r11;return r26}else if(r10==1581){r17=HEAP32[r8];break}else if(r10==1584){STACKTOP=r11;return r26}else if(r10==1586){STACKTOP=r11;return r26}else if(r10==1587){STACKTOP=r11;return r26}}}while(0);r26=(r17|0)!=(r4|0)|0;STACKTOP=r11;return r26}function __ZNKSt3__17codecvtIwc10_mbstate_tE5do_inERS1_PKcS5_RS5_PwS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r9=r8>>2;r8=r5>>2;r10=0;r11=STACKTOP;STACKTOP=STACKTOP+8|0;r12=r11;r13=r12;r14=r3;while(1){if((r14|0)==(r4|0)){r15=r4;break}if((HEAP8[r14]|0)==0){r15=r14;break}else{r14=r14+1|0}}HEAP32[r9]=r6;HEAP32[r8]=r3;L1842:do{if((r3|0)==(r4|0)|(r6|0)==(r7|0)){r16=r3}else{r14=r2;r17=r7;r18=(r1+8|0)>>2;r19=r6;r20=r3;r21=r15;while(1){r22=HEAP32[r14+4>>2];HEAP32[r12>>2]=HEAP32[r14>>2];HEAP32[r12+4>>2]=r22;r23=r21;r22=_uselocale(HEAP32[r18]);r24=_mbsnrtowcs(r19,r5,r23-r20|0,r17-r19>>2,r2);if((r22|0)!=0){_uselocale(r22)}if((r24|0)==-1){r10=1603;break}else if((r24|0)==0){r25=2;r10=1638;break}r22=(r24<<2)+HEAP32[r9]|0;HEAP32[r9]=r22;if((r22|0)==(r7|0)){r10=1635;break}r24=HEAP32[r8];if((r21|0)==(r4|0)){r26=r4;r27=r22;r28=r24}else{r29=_uselocale(HEAP32[r18]);r30=_mbrtowc(r22,r24,1,r2);if((r29|0)!=0){_uselocale(r29)}if((r30|0)!=0){r25=2;r10=1642;break}HEAP32[r9]=HEAP32[r9]+4;r30=HEAP32[r8]+1|0;HEAP32[r8]=r30;r29=r30;while(1){if((r29|0)==(r4|0)){r31=r4;break}if((HEAP8[r29]|0)==0){r31=r29;break}else{r29=r29+1|0}}r26=r31;r27=HEAP32[r9];r28=r30}if((r28|0)==(r4|0)|(r27|0)==(r7|0)){r16=r28;break L1842}else{r19=r27;r20=r28;r21=r26}}if(r10==1603){HEAP32[r9]=r19;L1866:do{if((r20|0)==(HEAP32[r8]|0)){r32=r20}else{r21=r19;r17=r20;while(1){r14=_uselocale(HEAP32[r18]);r29=_mbrtowc(r21,r17,r23-r17|0,r13);if((r14|0)!=0){_uselocale(r14)}if((r29|0)==0){r33=r17+1|0}else if((r29|0)==-1){r10=1614;break}else if((r29|0)==-2){r10=1615;break}else{r33=r17+r29|0}r29=HEAP32[r9]+4|0;HEAP32[r9]=r29;if((r33|0)==(HEAP32[r8]|0)){r32=r33;break L1866}else{r21=r29;r17=r33}}if(r10==1614){HEAP32[r8]=r17;r25=2;STACKTOP=r11;return r25}else if(r10==1615){HEAP32[r8]=r17;r25=1;STACKTOP=r11;return r25}}}while(0);HEAP32[r8]=r32;r25=(r32|0)!=(r4|0)|0;STACKTOP=r11;return r25}else if(r10==1635){r16=HEAP32[r8];break}else if(r10==1638){STACKTOP=r11;return r25}else if(r10==1642){STACKTOP=r11;return r25}}}while(0);r25=(r16|0)!=(r4|0)|0;STACKTOP=r11;return r25}function __ZNKSt3__17codecvtIwc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r6=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r5>>2]=r3;r3=r6|0;r7=_uselocale(HEAP32[r1+8>>2]);r1=_wcrtomb(r3,0,r2);if((r7|0)!=0){_uselocale(r7)}if((r1|0)==-1|(r1|0)==0){r8=2;STACKTOP=r6;return r8}r7=r1-1|0;r1=HEAP32[r5>>2];if(r7>>>0>(r4-r1|0)>>>0){r8=1;STACKTOP=r6;return r8}if((r7|0)==0){r8=0;STACKTOP=r6;return r8}else{r9=r7;r10=r3;r11=r1}while(1){r1=HEAP8[r10];HEAP32[r5>>2]=r11+1;HEAP8[r11]=r1;r1=r9-1|0;if((r1|0)==0){r8=0;break}r9=r1;r10=r10+1|0;r11=HEAP32[r5>>2]}STACKTOP=r6;return r8}function __ZNKSt3__17codecvtIwc10_mbstate_tE11do_encodingEv(r1){var r2,r3,r4,r5,r6;r2=r1+8|0;r1=_uselocale(HEAP32[r2>>2]);r3=_mbtowc(0,0,1);if((r1|0)!=0){_uselocale(r1)}if((r3|0)!=0){r4=-1;return r4}r3=HEAP32[r2>>2];if((r3|0)==0){r4=1;return r4}r4=_uselocale(r3);r3=___locale_mb_cur_max();if((r4|0)==0){r5=(r3|0)==1;r6=r5&1;return r6}_uselocale(r4);r5=(r3|0)==1;r6=r5&1;return r6}function __ZNKSt3__17codecvtIwc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r6=0;if((r5|0)==0|(r3|0)==(r4|0)){r7=0;return r7}r8=r4;r9=r1+8|0;r1=r3;r3=0;r10=0;while(1){r11=_uselocale(HEAP32[r9>>2]);r12=_mbrlen(r1,r8-r1|0,r2);if((r11|0)!=0){_uselocale(r11)}if((r12|0)==0){r13=1;r14=r1+1|0}else if((r12|0)==-1|(r12|0)==-2){r7=r3;r6=1703;break}else{r13=r12;r14=r1+r12|0}r12=r13+r3|0;r11=r10+1|0;if(r11>>>0>=r5>>>0|(r14|0)==(r4|0)){r7=r12;r6=1704;break}else{r1=r14;r3=r12;r10=r11}}if(r6==1703){return r7}else if(r6==1704){return r7}}function __ZNKSt3__17codecvtIwc10_mbstate_tE13do_max_lengthEv(r1){var r2,r3,r4;r2=HEAP32[r1+8>>2];do{if((r2|0)==0){r3=1}else{r1=_uselocale(r2);r4=___locale_mb_cur_max();if((r1|0)==0){r3=r4;break}_uselocale(r1);r3=r4}}while(0);return r3}function __ZNKSt3__17codecvtIDsc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIDsc10_mbstate_tE11do_encodingEv(r1){return 0}function __ZNKSt3__17codecvtIDsc10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIDsc10_mbstate_tE13do_max_lengthEv(r1){return 4}function __ZNSt3__1L13utf16_to_utf8EPKtS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14;r9=r6>>2;r6=r3>>2;r3=0;HEAP32[r6]=r1;HEAP32[r9]=r4;do{if((r8&2|0)!=0){if((r5-r4|0)<3){r10=1;return r10}else{HEAP32[r9]=r4+1;HEAP8[r4]=-17;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-69;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-65;break}}}while(0);r4=r2;r8=HEAP32[r6];if(r8>>>0>=r2>>>0){r10=0;return r10}r1=r5;r5=r8;L1962:while(1){r8=HEAP16[r5>>1];r11=r8&65535;if(r11>>>0>r7>>>0){r10=2;r3=1750;break}do{if((r8&65535)<128){r12=HEAP32[r9];if((r1-r12|0)<1){r10=1;r3=1751;break L1962}HEAP32[r9]=r12+1;HEAP8[r12]=r8&255}else{if((r8&65535)<2048){r12=HEAP32[r9];if((r1-r12|0)<2){r10=1;r3=1752;break L1962}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6|192)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r8&65535)<55296){r12=HEAP32[r9];if((r1-r12|0)<3){r10=1;r3=1753;break L1962}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r8&65535)>=56320){if((r8&65535)<57344){r10=2;r3=1758;break L1962}r12=HEAP32[r9];if((r1-r12|0)<3){r10=1;r3=1759;break L1962}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r4-r5|0)<4){r10=1;r3=1754;break L1962}r12=r5+2|0;r13=HEAPU16[r12>>1];if((r13&64512|0)!=56320){r10=2;r3=1755;break L1962}if((r1-HEAP32[r9]|0)<4){r10=1;r3=1756;break L1962}r14=r11&960;if(((r14<<10)+65536|r11<<10&64512|r13&1023)>>>0>r7>>>0){r10=2;r3=1757;break L1962}HEAP32[r6]=r12;r12=(r14>>>6)+1|0;r14=HEAP32[r9];HEAP32[r9]=r14+1;HEAP8[r14]=(r12>>>2|240)&255;r14=HEAP32[r9];HEAP32[r9]=r14+1;HEAP8[r14]=(r11>>>2&15|r12<<4&48|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11<<4&48|r13>>>6&15|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r13&63|128)&255}}while(0);r11=HEAP32[r6]+2|0;HEAP32[r6]=r11;if(r11>>>0<r2>>>0){r5=r11}else{r10=0;r3=1760;break}}if(r3==1750){return r10}else if(r3==1751){return r10}else if(r3==1752){return r10}else if(r3==1753){return r10}else if(r3==1754){return r10}else if(r3==1755){return r10}else if(r3==1756){return r10}else if(r3==1757){return r10}else if(r3==1758){return r10}else if(r3==1759){return r10}else if(r3==1760){return r10}}function __ZNSt3__1L13utf8_to_utf16EPKhS1_RS1_PtS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r9=r6>>2;r6=r3>>2;r3=0;HEAP32[r6]=r1;HEAP32[r9]=r4;r4=HEAP32[r6];do{if((r8&4|0)==0){r10=r4}else{if((r2-r4|0)<=2){r10=r4;break}if((HEAP8[r4]|0)!=-17){r10=r4;break}if((HEAP8[r4+1|0]|0)!=-69){r10=r4;break}if((HEAP8[r4+2|0]|0)!=-65){r10=r4;break}r1=r4+3|0;HEAP32[r6]=r1;r10=r1}}while(0);L2007:do{if(r10>>>0<r2>>>0){r4=r2;r8=r5;r1=HEAP32[r9],r11=r1>>1;r12=r10;L2009:while(1){if(r1>>>0>=r5>>>0){r13=r12;break L2007}r14=HEAP8[r12];r15=r14&255;if(r15>>>0>r7>>>0){r16=2;r3=1807;break}do{if(r14<<24>>24>-1){HEAP16[r11]=r14&255;HEAP32[r6]=HEAP32[r6]+1}else{if((r14&255)<194){r16=2;r3=1804;break L2009}if((r14&255)<224){if((r4-r12|0)<2){r16=1;r3=1821;break L2009}r17=HEAPU8[r12+1|0];if((r17&192|0)!=128){r16=2;r3=1809;break L2009}r18=r17&63|r15<<6&1984;if(r18>>>0>r7>>>0){r16=2;r3=1822;break L2009}HEAP16[r11]=r18&65535;HEAP32[r6]=HEAP32[r6]+2;break}if((r14&255)<240){if((r4-r12|0)<3){r16=1;r3=1810;break L2009}r18=HEAP8[r12+1|0];r17=HEAP8[r12+2|0];if((r15|0)==237){if((r18&-32)<<24>>24!=-128){r16=2;r3=1808;break L2009}}else if((r15|0)==224){if((r18&-32)<<24>>24!=-96){r16=2;r3=1817;break L2009}}else{if((r18&-64)<<24>>24!=-128){r16=2;r3=1812;break L2009}}r19=r17&255;if((r19&192|0)!=128){r16=2;r3=1813;break L2009}r17=(r18&255)<<6&4032|r15<<12|r19&63;if((r17&65535)>>>0>r7>>>0){r16=2;r3=1805;break L2009}HEAP16[r11]=r17&65535;HEAP32[r6]=HEAP32[r6]+3;break}if((r14&255)>=245){r16=2;r3=1818;break L2009}if((r4-r12|0)<4){r16=1;r3=1819;break L2009}r17=HEAP8[r12+1|0];r19=HEAP8[r12+2|0];r18=HEAP8[r12+3|0];if((r15|0)==244){if((r17&-16)<<24>>24!=-128){r16=2;r3=1806;break L2009}}else if((r15|0)==240){if((r17+112&255)>=48){r16=2;r3=1820;break L2009}}else{if((r17&-64)<<24>>24!=-128){r16=2;r3=1814;break L2009}}r20=r19&255;if((r20&192|0)!=128){r16=2;r3=1815;break L2009}r19=r18&255;if((r19&192|0)!=128){r16=2;r3=1816;break L2009}if((r8-r1|0)<4){r16=1;r3=1802;break L2009}r18=r15&7;r21=r17&255;r17=r20<<6;r22=r19&63;if((r21<<12&258048|r18<<18|r17&4032|r22)>>>0>r7>>>0){r16=2;r3=1803;break L2009}HEAP16[r11]=(r21<<2&60|r20>>>4&3|((r21>>>4&3|r18<<2)<<6)+16320|55296)&65535;r18=HEAP32[r9]+2|0;HEAP32[r9]=r18;HEAP16[r18>>1]=(r22|r17&960|56320)&65535;HEAP32[r6]=HEAP32[r6]+4}}while(0);r15=HEAP32[r9]+2|0;HEAP32[r9]=r15;r14=HEAP32[r6];if(r14>>>0<r2>>>0){r1=r15,r11=r1>>1;r12=r14}else{r13=r14;break L2007}}if(r3==1818){return r16}else if(r3==1819){return r16}else if(r3==1820){return r16}else if(r3==1815){return r16}else if(r3==1816){return r16}else if(r3==1817){return r16}else if(r3==1806){return r16}else if(r3==1807){return r16}else if(r3==1808){return r16}else if(r3==1821){return r16}else if(r3==1822){return r16}else if(r3==1802){return r16}else if(r3==1812){return r16}else if(r3==1813){return r16}else if(r3==1814){return r16}else if(r3==1803){return r16}else if(r3==1804){return r16}else if(r3==1805){return r16}else if(r3==1809){return r16}else if(r3==1810){return r16}}else{r13=r10}}while(0);r16=r13>>>0<r2>>>0|0;return r16}function __ZNSt3__1L20utf8_to_utf16_lengthEPKhS1_jmNS_12codecvt_modeE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r6=0;do{if((r5&4|0)==0){r7=r1}else{if((r2-r1|0)<=2){r7=r1;break}if((HEAP8[r1]|0)!=-17){r7=r1;break}if((HEAP8[r1+1|0]|0)!=-69){r7=r1;break}r7=(HEAP8[r1+2|0]|0)==-65?r1+3|0:r1}}while(0);L2076:do{if(r7>>>0<r2>>>0&(r3|0)!=0){r5=r2;r8=0;r9=r7;L2078:while(1){r10=HEAP8[r9];r11=r10&255;if(r11>>>0>r4>>>0){r12=r9;break L2076}do{if(r10<<24>>24>-1){r13=r9+1|0;r14=r8}else{if((r10&255)<194){r12=r9;break L2076}if((r10&255)<224){if((r5-r9|0)<2){r12=r9;break L2076}r15=HEAPU8[r9+1|0];if((r15&192|0)!=128){r12=r9;break L2076}if((r15&63|r11<<6&1984)>>>0>r4>>>0){r12=r9;break L2076}r13=r9+2|0;r14=r8;break}if((r10&255)<240){r16=r9;if((r5-r16|0)<3){r12=r9;break L2076}r15=HEAP8[r9+1|0];r17=HEAP8[r9+2|0];if((r11|0)==237){if((r15&-32)<<24>>24!=-128){r6=1845;break L2078}}else if((r11|0)==224){if((r15&-32)<<24>>24!=-96){r6=1843;break L2078}}else{if((r15&-64)<<24>>24!=-128){r6=1847;break L2078}}r18=r17&255;if((r18&192|0)!=128){r12=r9;break L2076}if(((r15&255)<<6&4032|r11<<12&61440|r18&63)>>>0>r4>>>0){r12=r9;break L2076}r13=r9+3|0;r14=r8;break}if((r10&255)>=245){r12=r9;break L2076}r19=r9;if((r5-r19|0)<4){r12=r9;break L2076}if((r3-r8|0)>>>0<2){r12=r9;break L2076}r18=HEAP8[r9+1|0];r15=HEAP8[r9+2|0];r17=HEAP8[r9+3|0];if((r11|0)==244){if((r18&-16)<<24>>24!=-128){r6=1858;break L2078}}else if((r11|0)==240){if((r18+112&255)>=48){r6=1856;break L2078}}else{if((r18&-64)<<24>>24!=-128){r6=1860;break L2078}}r20=r15&255;if((r20&192|0)!=128){r12=r9;break L2076}r15=r17&255;if((r15&192|0)!=128){r12=r9;break L2076}if(((r18&255)<<12&258048|r11<<18&1835008|r20<<6&4032|r15&63)>>>0>r4>>>0){r12=r9;break L2076}r13=r9+4|0;r14=r8+1|0}}while(0);r11=r14+1|0;if(r13>>>0<r2>>>0&r11>>>0<r3>>>0){r8=r11;r9=r13}else{r12=r13;break L2076}}if(r6==1847){r21=r16-r1|0;return r21}else if(r6==1860){r21=r19-r1|0;return r21}else if(r6==1845){r21=r16-r1|0;return r21}else if(r6==1843){r21=r16-r1|0;return r21}else if(r6==1858){r21=r19-r1|0;return r21}else if(r6==1856){r21=r19-r1|0;return r21}}else{r12=r7}}while(0);r21=r12-r1|0;return r21}function __ZNKSt3__17codecvtIDsc10_mbstate_tE5do_inERS1_PKcS5_RS5_PDsS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L13utf8_to_utf16EPKhS1_RS1_PtS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=r3+(HEAP32[r1>>2]-r3);HEAP32[r8>>2]=(HEAP32[r9>>2]-r6>>1<<1)+r6;STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDsc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){return __ZNSt3__1L20utf8_to_utf16_lengthEPKhS1_jmNS_12codecvt_modeE(r3,r4,r5,1114111,0)}function __ZNSt3__17codecvtIDic10_mbstate_tED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__17codecvtIDic10_mbstate_tE6do_outERS1_PKDiS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L12ucs4_to_utf8EPKjS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=(HEAP32[r1>>2]-r3>>2<<2)+r3;HEAP32[r8>>2]=r6+(HEAP32[r9>>2]-r6);STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDic10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIDic10_mbstate_tE11do_encodingEv(r1){return 0}function __ZNKSt3__17codecvtIDic10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIDic10_mbstate_tE13do_max_lengthEv(r1){return 4}function __ZNSt3__1L12ucs4_to_utf8EPKjS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12;r9=r6>>2;r6=0;HEAP32[r3>>2]=r1;HEAP32[r9]=r4;do{if((r8&2|0)!=0){if((r5-r4|0)<3){r10=1;return r10}else{HEAP32[r9]=r4+1;HEAP8[r4]=-17;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-69;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-65;break}}}while(0);r4=HEAP32[r3>>2];if(r4>>>0>=r2>>>0){r10=0;return r10}r8=r5;r5=r4;L2147:while(1){r4=HEAP32[r5>>2];if((r4&-2048|0)==55296|r4>>>0>r7>>>0){r10=2;r6=1904;break}do{if(r4>>>0<128){r1=HEAP32[r9];if((r8-r1|0)<1){r10=1;r6=1905;break L2147}HEAP32[r9]=r1+1;HEAP8[r1]=r4&255}else{if(r4>>>0<2048){r1=HEAP32[r9];if((r8-r1|0)<2){r10=1;r6=1906;break L2147}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>6|192)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4&63|128)&255;break}r1=HEAP32[r9];r11=r8-r1|0;if(r4>>>0<65536){if((r11|0)<3){r10=1;r6=1903;break L2147}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r4>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r4&63|128)&255;break}else{if((r11|0)<4){r10=1;r6=1902;break L2147}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>18|240)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>12&63|128)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>6&63|128)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4&63|128)&255;break}}}while(0);r4=HEAP32[r3>>2]+4|0;HEAP32[r3>>2]=r4;if(r4>>>0<r2>>>0){r5=r4}else{r10=0;r6=1908;break}}if(r6==1906){return r10}else if(r6==1903){return r10}else if(r6==1908){return r10}else if(r6==1902){return r10}else if(r6==1905){return r10}else if(r6==1904){return r10}}function __ZNSt3__1L12utf8_to_ucs4EPKhS1_RS1_PjS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r9=r3>>2;r3=0;HEAP32[r9]=r1;HEAP32[r6>>2]=r4;r4=HEAP32[r9];do{if((r8&4|0)==0){r10=r4}else{if((r2-r4|0)<=2){r10=r4;break}if((HEAP8[r4]|0)!=-17){r10=r4;break}if((HEAP8[r4+1|0]|0)!=-69){r10=r4;break}if((HEAP8[r4+2|0]|0)!=-65){r10=r4;break}r1=r4+3|0;HEAP32[r9]=r1;r10=r1}}while(0);L2179:do{if(r10>>>0<r2>>>0){r4=r2;r8=HEAP32[r6>>2],r1=r8>>2;r11=r10;L2181:while(1){if(r8>>>0>=r5>>>0){r12=r11;break L2179}r13=HEAP8[r11];r14=r13&255;do{if(r13<<24>>24>-1){if(r14>>>0>r7>>>0){r15=2;r3=1966;break L2181}HEAP32[r1]=r14;HEAP32[r9]=HEAP32[r9]+1}else{if((r13&255)<194){r15=2;r3=1953;break L2181}if((r13&255)<224){if((r4-r11|0)<2){r15=1;r3=1956;break L2181}r16=HEAPU8[r11+1|0];if((r16&192|0)!=128){r15=2;r3=1955;break L2181}r17=r16&63|r14<<6&1984;if(r17>>>0>r7>>>0){r15=2;r3=1959;break L2181}HEAP32[r1]=r17;HEAP32[r9]=HEAP32[r9]+2;break}if((r13&255)<240){if((r4-r11|0)<3){r15=1;r3=1969;break L2181}r17=HEAP8[r11+1|0];r16=HEAP8[r11+2|0];if((r14|0)==224){if((r17&-32)<<24>>24!=-96){r15=2;r3=1964;break L2181}}else if((r14|0)==237){if((r17&-32)<<24>>24!=-128){r15=2;r3=1967;break L2181}}else{if((r17&-64)<<24>>24!=-128){r15=2;r3=1961;break L2181}}r18=r16&255;if((r18&192|0)!=128){r15=2;r3=1957;break L2181}r16=(r17&255)<<6&4032|r14<<12&61440|r18&63;if(r16>>>0>r7>>>0){r15=2;r3=1963;break L2181}HEAP32[r1]=r16;HEAP32[r9]=HEAP32[r9]+3;break}if((r13&255)>=245){r15=2;r3=1962;break L2181}if((r4-r11|0)<4){r15=1;r3=1960;break L2181}r16=HEAP8[r11+1|0];r18=HEAP8[r11+2|0];r17=HEAP8[r11+3|0];if((r14|0)==240){if((r16+112&255)>=48){r15=2;r3=1952;break L2181}}else if((r14|0)==244){if((r16&-16)<<24>>24!=-128){r15=2;r3=1965;break L2181}}else{if((r16&-64)<<24>>24!=-128){r15=2;r3=1958;break L2181}}r19=r18&255;if((r19&192|0)!=128){r15=2;r3=1954;break L2181}r18=r17&255;if((r18&192|0)!=128){r15=2;r3=1968;break L2181}r17=(r16&255)<<12&258048|r14<<18&1835008|r19<<6&4032|r18&63;if(r17>>>0>r7>>>0){r15=2;r3=1950;break L2181}HEAP32[r1]=r17;HEAP32[r9]=HEAP32[r9]+4}}while(0);r14=HEAP32[r6>>2]+4|0;HEAP32[r6>>2]=r14;r13=HEAP32[r9];if(r13>>>0<r2>>>0){r8=r14,r1=r8>>2;r11=r13}else{r12=r13;break L2179}}if(r3==1958){return r15}else if(r3==1959){return r15}else if(r3==1960){return r15}else if(r3==1955){return r15}else if(r3==1956){return r15}else if(r3==1957){return r15}else if(r3==1961){return r15}else if(r3==1962){return r15}else if(r3==1963){return r15}else if(r3==1952){return r15}else if(r3==1953){return r15}else if(r3==1954){return r15}else if(r3==1968){return r15}else if(r3==1969){return r15}else if(r3==1950){return r15}else if(r3==1964){return r15}else if(r3==1965){return r15}else if(r3==1966){return r15}else if(r3==1967){return r15}}else{r12=r10}}while(0);r15=r12>>>0<r2>>>0|0;return r15}function __ZNSt3__1L19utf8_to_ucs4_lengthEPKhS1_jmNS_12codecvt_modeE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r6=0;do{if((r5&4|0)==0){r7=r1}else{if((r2-r1|0)<=2){r7=r1;break}if((HEAP8[r1]|0)!=-17){r7=r1;break}if((HEAP8[r1+1|0]|0)!=-69){r7=r1;break}r7=(HEAP8[r1+2|0]|0)==-65?r1+3|0:r1}}while(0);L2246:do{if(r7>>>0<r2>>>0&(r3|0)!=0){r5=r2;r8=1;r9=r7;L2248:while(1){r10=HEAP8[r9];r11=r10&255;do{if(r10<<24>>24>-1){if(r11>>>0>r4>>>0){r12=r9;break L2246}r13=r9+1|0}else{if((r10&255)<194){r12=r9;break L2246}if((r10&255)<224){if((r5-r9|0)<2){r12=r9;break L2246}r14=HEAPU8[r9+1|0];if((r14&192|0)!=128){r12=r9;break L2246}if((r14&63|r11<<6&1984)>>>0>r4>>>0){r12=r9;break L2246}r13=r9+2|0;break}if((r10&255)<240){r15=r9;if((r5-r15|0)<3){r12=r9;break L2246}r14=HEAP8[r9+1|0];r16=HEAP8[r9+2|0];if((r11|0)==224){if((r14&-32)<<24>>24!=-96){r6=1990;break L2248}}else if((r11|0)==237){if((r14&-32)<<24>>24!=-128){r6=1992;break L2248}}else{if((r14&-64)<<24>>24!=-128){r6=1994;break L2248}}r17=r16&255;if((r17&192|0)!=128){r12=r9;break L2246}if(((r14&255)<<6&4032|r11<<12&61440|r17&63)>>>0>r4>>>0){r12=r9;break L2246}r13=r9+3|0;break}if((r10&255)>=245){r12=r9;break L2246}r18=r9;if((r5-r18|0)<4){r12=r9;break L2246}r17=HEAP8[r9+1|0];r14=HEAP8[r9+2|0];r16=HEAP8[r9+3|0];if((r11|0)==240){if((r17+112&255)>=48){r6=2002;break L2248}}else if((r11|0)==244){if((r17&-16)<<24>>24!=-128){r6=2004;break L2248}}else{if((r17&-64)<<24>>24!=-128){r6=2006;break L2248}}r19=r14&255;if((r19&192|0)!=128){r12=r9;break L2246}r14=r16&255;if((r14&192|0)!=128){r12=r9;break L2246}if(((r17&255)<<12&258048|r11<<18&1835008|r19<<6&4032|r14&63)>>>0>r4>>>0){r12=r9;break L2246}r13=r9+4|0}}while(0);if(!(r13>>>0<r2>>>0&r8>>>0<r3>>>0)){r12=r13;break L2246}r8=r8+1|0;r9=r13}if(r6==2006){r20=r18-r1|0;return r20}else if(r6==1990){r20=r15-r1|0;return r20}else if(r6==1992){r20=r15-r1|0;return r20}else if(r6==1994){r20=r15-r1|0;return r20}else if(r6==2004){r20=r18-r1|0;return r20}else if(r6==2002){r20=r18-r1|0;return r20}}else{r12=r7}}while(0);r20=r12-r1|0;return r20}function __ZNKSt3__18numpunctIcE16do_decimal_pointEv(r1){return HEAP8[r1+8|0]}function __ZNKSt3__18numpunctIwE16do_decimal_pointEv(r1){return HEAP32[r1+8>>2]}function __ZNKSt3__18numpunctIcE16do_thousands_sepEv(r1){return HEAP8[r1+9|0]}function __ZNKSt3__18numpunctIwE16do_thousands_sepEv(r1){return HEAP32[r1+12>>2]}function __ZNKSt3__17codecvtIDic10_mbstate_tE5do_inERS1_PKcS5_RS5_PDiS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L12utf8_to_ucs4EPKhS1_RS1_PjS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=r3+(HEAP32[r1>>2]-r3);HEAP32[r8>>2]=(HEAP32[r9>>2]-r6>>2<<2)+r6;STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDic10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){return __ZNSt3__1L19utf8_to_ucs4_lengthEPKhS1_jmNS_12codecvt_modeE(r3,r4,r5,1114111,0)}function __ZNSt3__116__narrow_to_utf8ILj32EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__117__widen_from_utf8ILj32EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18numpunctIcED0Ev(r1){HEAP32[r1>>2]=3864;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+12|0);__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18numpunctIcED2Ev(r1){HEAP32[r1>>2]=3864;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+12|0);__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__18numpunctIwED0Ev(r1){HEAP32[r1>>2]=3816;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+16|0);__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18numpunctIwED2Ev(r1){HEAP32[r1>>2]=3816;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+16|0);__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18numpunctIcE11do_groupingEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_(r1,r2+12|0);return}function __ZNKSt3__18numpunctIwE11do_groupingEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_(r1,r2+16|0);return}function __ZNKSt3__18numpunctIcE11do_truenameEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,1768,4);return}function __ZNKSt3__18numpunctIwE11do_truenameEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(r1,1744,_wcslen(1744));return}function __ZNKSt3__18numpunctIcE12do_falsenameEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,1736,5);return}function __ZNKSt3__18numpunctIwE12do_falsenameEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(r1,1712,_wcslen(1712));return}function __ZNKSt3__120__time_get_c_storageIcE7__weeksEv(r1){var r2;if((HEAP8[15104]|0)!=0){r2=HEAP32[3394];return r2}if((___cxa_guard_acquire(15104)|0)==0){r2=HEAP32[3394];return r2}do{if((HEAP8[14992]|0)==0){if((___cxa_guard_acquire(14992)|0)==0){break}_memset(12616,0,168);_atexit(776,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12616,2232);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12628,2224);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12640,2216);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12652,2200);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12664,2184);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12676,2176);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12688,2160);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12700,2152);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12712,2144);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12724,2104);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12736,2096);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12748,2088);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12760,2072);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12772,2064);HEAP32[3394]=12616;r2=HEAP32[3394];return r2}function __ZNKSt3__120__time_get_c_storageIwE7__weeksEv(r1){var r2;if((HEAP8[15048]|0)!=0){r2=HEAP32[3372];return r2}if((___cxa_guard_acquire(15048)|0)==0){r2=HEAP32[3372];return r2}do{if((HEAP8[14968]|0)==0){if((___cxa_guard_acquire(14968)|0)==0){break}_memset(11872,0,168);_atexit(408,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11872,2648);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11884,2616);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11896,2584);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11908,2544);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11920,2488);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11932,2456);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11944,2416);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11956,2400);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11968,2344);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11980,2328);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11992,2312);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12004,2296);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12016,2280);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12028,2264);HEAP32[3372]=11872;r2=HEAP32[3372];return r2}function __ZNKSt3__120__time_get_c_storageIcE8__monthsEv(r1){var r2;if((HEAP8[15096]|0)!=0){r2=HEAP32[3392];return r2}if((___cxa_guard_acquire(15096)|0)==0){r2=HEAP32[3392];return r2}do{if((HEAP8[14984]|0)==0){if((___cxa_guard_acquire(14984)|0)==0){break}_memset(12328,0,288);_atexit(456,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12328,600);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12340,584);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12352,576);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12364,568);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12376,560);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12388,552);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12400,544);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12412,536);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12424,504);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12436,496);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12448,480);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12460,464);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12472,416);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12484,408);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12496,400);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12508,392);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12520,560);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12532,384);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12544,376);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12556,2712);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12568,2704);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12580,2696);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12592,2688);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12604,2680);HEAP32[3392]=12328;r2=HEAP32[3392];return r2}function __ZNKSt3__120__time_get_c_storageIwE8__monthsEv(r1){var r2;if((HEAP8[15040]|0)!=0){r2=HEAP32[3370];return r2}if((___cxa_guard_acquire(15040)|0)==0){r2=HEAP32[3370];return r2}do{if((HEAP8[14960]|0)==0){if((___cxa_guard_acquire(14960)|0)==0){break}_memset(11584,0,288);_atexit(340,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11584,1216);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11596,1176);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11608,1152);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11620,1104);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11632,760);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11644,1080);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11656,1056);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11668,1024);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11680,984);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11692,952);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11704,912);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11716,872);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11728,856);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11740,808);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11752,792);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11764,776);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11776,760);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11788,744);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11800,728);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11812,712);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11824,680);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11836,664);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11848,648);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11860,608);HEAP32[3370]=11584;r2=HEAP32[3370];return r2}function __ZNKSt3__120__time_get_c_storageIcE7__am_pmEv(r1){var r2;if((HEAP8[15112]|0)!=0){r2=HEAP32[3396];return r2}if((___cxa_guard_acquire(15112)|0)==0){r2=HEAP32[3396];return r2}do{if((HEAP8[15e3]|0)==0){if((___cxa_guard_acquire(15e3)|0)==0){break}_memset(12784,0,288);_atexit(334,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12784,1256);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12796,1248);HEAP32[3396]=12784;r2=HEAP32[3396];return r2}function __ZNKSt3__120__time_get_c_storageIwE7__am_pmEv(r1){var r2;if((HEAP8[15056]|0)!=0){r2=HEAP32[3374];return r2}if((___cxa_guard_acquire(15056)|0)==0){r2=HEAP32[3374];return r2}do{if((HEAP8[14976]|0)==0){if((___cxa_guard_acquire(14976)|0)==0){break}_memset(12040,0,288);_atexit(736,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12040,1280);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12052,1264);HEAP32[3374]=12040;r2=HEAP32[3374];return r2}function __ZNKSt3__120__time_get_c_storageIcE3__xEv(r1){if((HEAP8[15120]|0)!=0){return 13592}if((___cxa_guard_acquire(15120)|0)==0){return 13592}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13592,1672,8);_atexit(768,13592,___dso_handle);return 13592}function __ZNKSt3__120__time_get_c_storageIwE3__xEv(r1){if((HEAP8[15064]|0)!=0){return 13504}if((___cxa_guard_acquire(15064)|0)==0){return 13504}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13504,1632,_wcslen(1632));_atexit(522,13504,___dso_handle);return 13504}function __ZNKSt3__120__time_get_c_storageIcE3__XEv(r1){if((HEAP8[15144]|0)!=0){return 13640}if((___cxa_guard_acquire(15144)|0)==0){return 13640}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13640,1600,8);_atexit(768,13640,___dso_handle);return 13640}function __ZNKSt3__120__time_get_c_storageIwE3__XEv(r1){if((HEAP8[15088]|0)!=0){return 13552}if((___cxa_guard_acquire(15088)|0)==0){return 13552}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13552,1552,_wcslen(1552));_atexit(522,13552,___dso_handle);return 13552}function __ZNKSt3__120__time_get_c_storageIcE3__cEv(r1){if((HEAP8[15136]|0)!=0){return 13624}if((___cxa_guard_acquire(15136)|0)==0){return 13624}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13624,1520,20);_atexit(768,13624,___dso_handle);return 13624}function __ZNKSt3__120__time_get_c_storageIwE3__cEv(r1){if((HEAP8[15080]|0)!=0){return 13536}if((___cxa_guard_acquire(15080)|0)==0){return 13536}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13536,1424,_wcslen(1424));_atexit(522,13536,___dso_handle);return 13536}function __ZNKSt3__120__time_get_c_storageIcE3__rEv(r1){if((HEAP8[15128]|0)!=0){return 13608}if((___cxa_guard_acquire(15128)|0)==0){return 13608}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13608,1408,11);_atexit(768,13608,___dso_handle);return 13608}function __ZNKSt3__120__time_get_c_storageIwE3__rEv(r1){if((HEAP8[15072]|0)!=0){return 13520}if((___cxa_guard_acquire(15072)|0)==0){return 13520}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13520,1360,_wcslen(1360));_atexit(522,13520,___dso_handle);return 13520}function __ZNSt3__117__call_once_proxyINS_5tupleIJNS_12_GLOBAL__N_111__fake_bindEEEEEEvPv(r1){var r2,r3,r4,r5;r2=r1+4|0;r3=HEAP32[r1>>2]+HEAP32[r2+4>>2]|0;r1=r3;r4=HEAP32[r2>>2];if((r4&1|0)==0){r5=r4;FUNCTION_TABLE[r5](r1);return}else{r5=HEAP32[HEAP32[r3>>2]+(r4-1)>>2];FUNCTION_TABLE[r5](r1);return}}function ___cxx_global_array_dtor(r1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12316);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12304);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12292);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12280);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12268);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12256);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12244);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12232);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12220);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12208);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12196);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12184);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12172);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12160);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12148);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12136);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12124);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12112);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12100);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12088);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12076);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12064);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12052);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12040);return}function ___cxx_global_array_dtor53(r1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13060);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13048);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13036);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13024);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13012);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13e3);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12988);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12976);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12964);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12952);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12940);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12928);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12916);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12904);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12892);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12880);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12868);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12856);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12844);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12832);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12820);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12808);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12796);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12784);return}function ___cxx_global_array_dtor56(r1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11860);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11848);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11836);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11824);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11812);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11800);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11788);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11776);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11764);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11752);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11740);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11728);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11716);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11704);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11692);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11680);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11668);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11656);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11644);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11632);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11620);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11608);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11596);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11584);return}function __ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=0;r4=r1+8|0;r5=(r1+4|0)>>2;r6=HEAP32[r5];r7=HEAP32[r4>>2];r8=r6;if(r7-r8>>2>>>0>=r2>>>0){r9=r2;r10=r6;while(1){if((r10|0)==0){r11=0}else{HEAP32[r10>>2]=0;r11=HEAP32[r5]}r6=r11+4|0;HEAP32[r5]=r6;r12=r9-1|0;if((r12|0)==0){break}else{r9=r12;r10=r6}}return}r10=r1+16|0;r9=(r1|0)>>2;r11=HEAP32[r9];r6=r8-r11>>2;r8=r6+r2|0;if(r8>>>0>1073741823){__ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv(0)}r12=r7-r11|0;do{if(r12>>2>>>0>536870910){r13=1073741823;r3=2281}else{r11=r12>>1;r7=r11>>>0<r8>>>0?r8:r11;if((r7|0)==0){r14=0;r15=0;break}r11=r1+128|0;if(!((HEAP8[r11]&1)==0&r7>>>0<29)){r13=r7;r3=2281;break}HEAP8[r11]=1;r14=r10;r15=r7}}while(0);if(r3==2281){r14=__Znwj(r13<<2);r15=r13}r13=r2;r2=(r6<<2)+r14|0;while(1){if((r2|0)==0){r16=0}else{HEAP32[r2>>2]=0;r16=r2}r17=r16+4|0;r3=r13-1|0;if((r3|0)==0){break}else{r13=r3;r2=r17}}r2=(r15<<2)+r14|0;r15=HEAP32[r9];r13=HEAP32[r5]-r15|0;r16=(r6-(r13>>2)<<2)+r14|0;r14=r16;r6=r15;_memcpy(r14,r6,r13)|0;HEAP32[r9]=r16;HEAP32[r5]=r17;HEAP32[r4>>2]=r2;if((r15|0)==0){return}if((r15|0)==(r10|0)){HEAP8[r1+128|0]=0;return}else{__ZdlPv(r6);return}}function ___cxx_global_array_dtor81(r1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12604);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12592);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12580);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12568);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12556);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12544);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12532);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12520);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12508);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12496);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12484);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12472);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12460);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12448);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12436);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12424);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12412);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12400);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12388);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12376);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12364);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12352);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12340);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12328);return}function ___cxx_global_array_dtor105(r1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12028);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12016);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12004);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11992);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11980);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11968);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11956);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11944);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11932);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11920);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11908);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11896);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11884);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11872);return}function ___cxx_global_array_dtor120(r1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12772);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12760);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12748);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12736);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12724);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12712);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12700);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12688);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12676);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12664);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12652);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12640);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12628);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12616);return}function _mbrlen(r1,r2,r3){return _mbrtowc(0,r1,r2,(r3|0)!=0?r3:11104)}function _mbrtowc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;HEAP32[r6>>2]=r1;r7=(((r4|0)==0?11096:r4)|0)>>2;r4=HEAP32[r7];L2592:do{if((r2|0)==0){if((r4|0)==0){r8=0}else{break}STACKTOP=r5;return r8}else{if((r1|0)==0){r9=r6;HEAP32[r6>>2]=r9;r10=r9}else{r10=r1}if((r3|0)==0){r8=-2;STACKTOP=r5;return r8}do{if((r4|0)==0){r9=HEAP8[r2];r11=r9&255;if(r9<<24>>24>-1){HEAP32[r10>>2]=r11;r8=r9<<24>>24!=0|0;STACKTOP=r5;return r8}else{r9=r11-194|0;if(r9>>>0>50){break L2592}r12=r2+1|0;r13=HEAP32[___fsmu8+(r9<<2)>>2];r14=r3-1|0;break}}else{r12=r2;r13=r4;r14=r3}}while(0);L2610:do{if((r14|0)==0){r15=r13}else{r9=HEAP8[r12];r11=(r9&255)>>>3;if((r11-16|(r13>>26)+r11)>>>0>7){break L2592}else{r16=r12;r17=r13;r18=r14;r19=r9}while(1){r9=r16+1|0;r20=(r19&255)-128|r17<<6;r21=r18-1|0;if((r20|0)>=0){break}if((r21|0)==0){r15=r20;break L2610}r11=HEAP8[r9];if(((r11&255)-128|0)>>>0>63){break L2592}else{r16=r9;r17=r20;r18=r21;r19=r11}}HEAP32[r7]=0;HEAP32[r10>>2]=r20;r8=r3-r21|0;STACKTOP=r5;return r8}}while(0);HEAP32[r7]=r15;r8=-2;STACKTOP=r5;return r8}}while(0);HEAP32[r7]=0;r7=___errno_location();HEAP32[r7>>2]=138;r8=-1;STACKTOP=r5;return r8}function _mbsnrtowcs(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r6=STACKTOP;STACKTOP=STACKTOP+1032|0;r7=r6;r8=r6+1024,r9=r8>>2;r10=HEAP32[r2>>2];HEAP32[r9]=r10;r11=(r1|0)!=0;r12=r11?r4:256;r4=r11?r1:r7|0;L2623:do{if((r10|0)==0|(r12|0)==0){r13=0;r14=r3;r15=r12;r16=r4;r17=r10}else{r1=r7|0;r18=r12;r19=r3;r20=0;r21=r4;r22=r10;while(1){r23=r19>>>2;r24=r23>>>0>=r18>>>0;if(!(r24|r19>>>0>131)){r13=r20;r14=r19;r15=r18;r16=r21;r17=r22;break L2623}r25=r24?r18:r23;r26=r19-r25|0;r23=_mbsrtowcs(r21,r8,r25,r5);if((r23|0)==-1){break}if((r21|0)==(r1|0)){r27=r1;r28=r18}else{r27=(r23<<2)+r21|0;r28=r18-r23|0}r25=r23+r20|0;r23=HEAP32[r9];if((r23|0)==0|(r28|0)==0){r13=r25;r14=r26;r15=r28;r16=r27;r17=r23;break L2623}else{r18=r28;r19=r26;r20=r25;r21=r27;r22=r23}}r13=-1;r14=r26;r15=0;r16=r21;r17=HEAP32[r9]}}while(0);L2634:do{if((r17|0)==0){r29=r13}else{if((r15|0)==0|(r14|0)==0){r29=r13;break}else{r30=r15;r31=r14;r32=r13;r33=r16;r34=r17}while(1){r35=_mbrtowc(r33,r34,r31,r5);if((r35+2|0)>>>0<3){break}r26=HEAP32[r9]+r35|0;HEAP32[r9]=r26;r27=r30-1|0;r28=r32+1|0;if((r27|0)==0|(r31|0)==(r35|0)){r29=r28;break L2634}else{r30=r27;r31=r31-r35|0;r32=r28;r33=r33+4|0;r34=r26}}if((r35|0)==-1){r29=-1;break}else if((r35|0)==0){HEAP32[r9]=0;r29=r32;break}else{HEAP32[r5>>2]=0;r29=r32;break}}}while(0);if(!r11){STACKTOP=r6;return r29}HEAP32[r2>>2]=HEAP32[r9];STACKTOP=r6;return r29}function _mbsrtowcs(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r5=0;r6=HEAP32[r2>>2];do{if((r4|0)==0){r5=2348}else{r7=r4|0;r8=HEAP32[r7>>2];if((r8|0)==0){r5=2348;break}if((r1|0)==0){r9=r8;r10=r6;r11=r3;r5=2359;break}HEAP32[r7>>2]=0;r12=r8;r13=r6;r14=r1;r15=r3;r5=2379}}while(0);if(r5==2348){if((r1|0)==0){r16=r6;r17=r3;r5=2350}else{r18=r6;r19=r1;r20=r3;r5=2349}}L2655:while(1){if(r5==2350){r5=0;r6=HEAP8[r16];do{if(((r6&255)-1|0)>>>0<127){if((r16&3|0)!=0){r21=r16;r22=r17;r23=r6;break}r4=HEAP32[r16>>2];if(((r4-16843009|r4)&-2139062144|0)==0){r24=r17;r25=r16}else{r21=r16;r22=r17;r23=r4&255;break}while(1){r26=r25+4|0;r27=r24-4|0;r28=HEAP32[r26>>2];if(((r28-16843009|r28)&-2139062144|0)==0){r24=r27;r25=r26}else{break}}r21=r26;r22=r27;r23=r28&255}else{r21=r16;r22=r17;r23=r6}}while(0);r6=r23&255;if((r6-1|0)>>>0<127){r16=r21+1|0;r17=r22-1|0;r5=2350;continue}r4=r6-194|0;if(r4>>>0>50){r29=r22;r30=r1;r31=r21;r5=2390;break}r9=HEAP32[___fsmu8+(r4<<2)>>2];r10=r21+1|0;r11=r22;r5=2359;continue}else if(r5==2359){r5=0;r4=HEAPU8[r10]>>>3;if((r4-16|(r9>>26)+r4)>>>0>7){r5=2360;break}r4=r10+1|0;do{if((r9&33554432|0)==0){r32=r4}else{if((HEAPU8[r4]-128|0)>>>0>63){r5=2363;break L2655}r6=r10+2|0;if((r9&524288|0)==0){r32=r6;break}if((HEAPU8[r6]-128|0)>>>0>63){r5=2366;break L2655}r32=r10+3|0}}while(0);r16=r32;r17=r11-1|0;r5=2350;continue}else if(r5==2349){r5=0;if((r20|0)==0){r33=r3;r5=2399;break}else{r34=r20;r35=r19;r36=r18}while(1){r4=HEAP8[r36];do{if(((r4&255)-1|0)>>>0<127){if((r36&3|0)==0&r34>>>0>3){r37=r34;r38=r35,r39=r38>>2;r40=r36}else{r41=r36;r42=r35;r43=r34;r44=r4;break}while(1){r45=HEAP32[r40>>2];if(((r45-16843009|r45)&-2139062144|0)!=0){r5=2373;break}HEAP32[r39]=r45&255;HEAP32[r39+1]=HEAPU8[r40+1|0];HEAP32[r39+2]=HEAPU8[r40+2|0];r46=r40+4|0;r47=r38+16|0;HEAP32[r39+3]=HEAPU8[r40+3|0];r48=r37-4|0;if(r48>>>0>3){r37=r48;r38=r47,r39=r38>>2;r40=r46}else{r5=2374;break}}if(r5==2373){r5=0;r41=r40;r42=r38;r43=r37;r44=r45&255;break}else if(r5==2374){r5=0;r41=r46;r42=r47;r43=r48;r44=HEAP8[r46];break}}else{r41=r36;r42=r35;r43=r34;r44=r4}}while(0);r49=r44&255;if((r49-1|0)>>>0>=127){break}HEAP32[r42>>2]=r49;r4=r43-1|0;if((r4|0)==0){r33=r3;r5=2397;break L2655}else{r34=r4;r35=r42+4|0;r36=r41+1|0}}r4=r49-194|0;if(r4>>>0>50){r29=r43;r30=r42;r31=r41;r5=2390;break}r12=HEAP32[___fsmu8+(r4<<2)>>2];r13=r41+1|0;r14=r42;r15=r43;r5=2379;continue}else if(r5==2379){r5=0;r4=HEAPU8[r13];r6=r4>>>3;if((r6-16|(r12>>26)+r6)>>>0>7){r5=2380;break}r6=r13+1|0;r50=r4-128|r12<<6;do{if((r50|0)<0){r4=HEAPU8[r6]-128|0;if(r4>>>0>63){r5=2383;break L2655}r8=r13+2|0;r51=r4|r50<<6;if((r51|0)>=0){r52=r51;r53=r8;break}r4=HEAPU8[r8]-128|0;if(r4>>>0>63){r5=2386;break L2655}r52=r4|r51<<6;r53=r13+3|0}else{r52=r50;r53=r6}}while(0);HEAP32[r14>>2]=r52;r18=r53;r19=r14+4|0;r20=r15-1|0;r5=2349;continue}}if(r5==2363){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=2389}else if(r5==2383){r54=r50;r55=r13-1|0;r56=r14;r57=r15;r5=2389}else if(r5==2397){return r33}else if(r5==2399){return r33}else if(r5==2366){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=2389}else if(r5==2360){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=2389}else if(r5==2380){r54=r12;r55=r13-1|0;r56=r14;r57=r15;r5=2389}else if(r5==2386){r54=r51;r55=r13-1|0;r56=r14;r57=r15;r5=2389}if(r5==2389){if((r54|0)==0){r29=r57;r30=r56;r31=r55;r5=2390}else{r58=r56;r59=r55}}do{if(r5==2390){if((HEAP8[r31]|0)!=0){r58=r30;r59=r31;break}if((r30|0)!=0){HEAP32[r30>>2]=0;HEAP32[r2>>2]=0}r33=r3-r29|0;return r33}}while(0);r29=___errno_location();HEAP32[r29>>2]=138;if((r58|0)==0){r33=-1;return r33}HEAP32[r2>>2]=r59;r33=-1;return r33}function _mbtowc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;HEAP32[r5>>2]=r1;if((r2|0)==0){r6=0;STACKTOP=r4;return r6}do{if((r3|0)!=0){if((r1|0)==0){r7=r5;HEAP32[r5>>2]=r7;r8=r7,r9=r8>>2}else{r8=r1,r9=r8>>2}r7=HEAP8[r2];r10=r7&255;if(r7<<24>>24>-1){HEAP32[r9]=r10;r6=r7<<24>>24!=0|0;STACKTOP=r4;return r6}r7=r10-194|0;if(r7>>>0>50){break}r10=r2+1|0;r11=HEAP32[___fsmu8+(r7<<2)>>2];if(r3>>>0<4){if((r11&-2147483648>>>(((r3*6&-1)-6|0)>>>0)|0)!=0){break}}r7=HEAPU8[r10];r10=r7>>>3;if((r10-16|(r11>>26)+r10)>>>0>7){break}r10=r7-128|r11<<6;if((r10|0)>=0){HEAP32[r9]=r10;r6=2;STACKTOP=r4;return r6}r11=HEAPU8[r2+2|0]-128|0;if(r11>>>0>63){break}r7=r11|r10<<6;if((r7|0)>=0){HEAP32[r9]=r7;r6=3;STACKTOP=r4;return r6}r10=HEAPU8[r2+3|0]-128|0;if(r10>>>0>63){break}HEAP32[r9]=r10|r7<<6;r6=4;STACKTOP=r4;return r6}}while(0);r9=___errno_location();HEAP32[r9>>2]=138;r6=-1;STACKTOP=r4;return r6}function _wcrtomb(r1,r2,r3){var r4;if((r1|0)==0){r4=1;return r4}if(r2>>>0<128){HEAP8[r1]=r2&255;r4=1;return r4}if(r2>>>0<2048){HEAP8[r1]=(r2>>>6|192)&255;HEAP8[r1+1|0]=(r2&63|128)&255;r4=2;return r4}if(r2>>>0<55296|(r2-57344|0)>>>0<8192){HEAP8[r1]=(r2>>>12|224)&255;HEAP8[r1+1|0]=(r2>>>6&63|128)&255;HEAP8[r1+2|0]=(r2&63|128)&255;r4=3;return r4}if((r2-65536|0)>>>0<1048576){HEAP8[r1]=(r2>>>18|240)&255;HEAP8[r1+1|0]=(r2>>>12&63|128)&255;HEAP8[r1+2|0]=(r2>>>6&63|128)&255;HEAP8[r1+3|0]=(r2&63|128)&255;r4=4;return r4}else{r2=___errno_location();HEAP32[r2>>2]=138;r4=-1;return r4}}function __ZNSt9type_infoD2Ev(r1){return}function __ZNSt8bad_castD2Ev(r1){return}function __ZNKSt8bad_cast4whatEv(r1){return 1904}function __ZNK10__cxxabiv116__shim_type_info5noop1Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop2Ev(r1){return}function _wcslen(r1){var r2;r2=r1;while(1){if((HEAP32[r2>>2]|0)==0){break}else{r2=r2+4|0}}return r2-r1>>2}function _wmemcpy(r1,r2,r3){var r4,r5,r6;if((r3|0)==0){return r1}else{r4=r2;r5=r3;r6=r1}while(1){r3=r5-1|0;HEAP32[r6>>2]=HEAP32[r4>>2];if((r3|0)==0){break}else{r4=r4+4|0;r5=r3;r6=r6+4|0}}return r1}function _wmemmove(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=(r3|0)==0;if(r1-r2>>2>>>0<r3>>>0){if(r4){return r1}else{r5=r3}while(1){r6=r5-1|0;HEAP32[r1+(r6<<2)>>2]=HEAP32[r2+(r6<<2)>>2];if((r6|0)==0){break}else{r5=r6}}return r1}else{if(r4){return r1}else{r7=r2;r8=r3;r9=r1}while(1){r3=r8-1|0;HEAP32[r9>>2]=HEAP32[r7>>2];if((r3|0)==0){break}else{r7=r7+4|0;r8=r3;r9=r9+4|0}}return r1}}function _wmemset(r1,r2,r3){var r4,r5;if((r3|0)==0){return r1}else{r4=r3;r5=r1}while(1){r3=r4-1|0;HEAP32[r5>>2]=r2;if((r3|0)==0){break}else{r4=r3;r5=r5+4|0}}return r1}function __ZNSt8bad_castC2Ev(r1){HEAP32[r1>>2]=3272;return}function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((HEAP32[r2+8>>2]|0)!=(r1|0)){return}r1=r2+16|0;r5=HEAP32[r1>>2];if((r5|0)==0){HEAP32[r1>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r5|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function _wcsnrtombs(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r5=STACKTOP;STACKTOP=STACKTOP+264|0;r6=r5;r7=r5+256,r8=r7>>2;r9=HEAP32[r2>>2];HEAP32[r8]=r9;r10=(r1|0)!=0;r11=r10?r4:256;r4=r10?r1:r6|0;L2828:do{if((r9|0)==0|(r11|0)==0){r12=0;r13=r3;r14=r11;r15=r4;r16=r9}else{r1=r6|0;r17=r11;r18=r3;r19=0;r20=r4;r21=r9;while(1){r22=r18>>>0>=r17>>>0;if(!(r22|r18>>>0>32)){r12=r19;r13=r18;r14=r17;r15=r20;r16=r21;break L2828}r23=r22?r17:r18;r24=r18-r23|0;r22=_wcsrtombs(r20,r7,r23,0);if((r22|0)==-1){break}if((r20|0)==(r1|0)){r25=r1;r26=r17}else{r25=r20+r22|0;r26=r17-r22|0}r23=r22+r19|0;r22=HEAP32[r8];if((r22|0)==0|(r26|0)==0){r12=r23;r13=r24;r14=r26;r15=r25;r16=r22;break L2828}else{r17=r26;r18=r24;r19=r23;r20=r25;r21=r22}}r12=-1;r13=r24;r14=0;r15=r20;r16=HEAP32[r8]}}while(0);L2839:do{if((r16|0)==0){r27=r12}else{if((r14|0)==0|(r13|0)==0){r27=r12;break}else{r28=r14;r29=r13;r30=r12;r31=r15;r32=r16}while(1){r33=_wcrtomb(r31,HEAP32[r32>>2],0);if((r33+1|0)>>>0<2){break}r24=HEAP32[r8]+4|0;HEAP32[r8]=r24;r25=r29-1|0;r26=r30+1|0;if((r28|0)==(r33|0)|(r25|0)==0){r27=r26;break L2839}else{r28=r28-r33|0;r29=r25;r30=r26;r31=r31+r33|0;r32=r24}}if((r33|0)!=0){r27=-1;break}HEAP32[r8]=0;r27=r30}}while(0);if(!r10){STACKTOP=r5;return r27}HEAP32[r2>>2]=HEAP32[r8];STACKTOP=r5;return r27}function _wcsrtombs(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r4=r2>>2;r2=0;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==0){r7=HEAP32[r4];r8=r6|0;r9=HEAP32[r7>>2];if((r9|0)==0){r10=0;STACKTOP=r5;return r10}else{r11=0;r12=r7;r13=r9}while(1){if(r13>>>0>127){r9=_wcrtomb(r8,r13,0);if((r9|0)==-1){r10=-1;r2=2534;break}else{r14=r9}}else{r14=1}r9=r14+r11|0;r7=r12+4|0;r15=HEAP32[r7>>2];if((r15|0)==0){r10=r9;r2=2535;break}else{r11=r9;r12=r7;r13=r15}}if(r2==2534){STACKTOP=r5;return r10}else if(r2==2535){STACKTOP=r5;return r10}}L2865:do{if(r3>>>0>3){r13=r3;r12=r1;r11=HEAP32[r4];while(1){r14=HEAP32[r11>>2];if((r14|0)==0){r16=r13;r17=r12;break L2865}if(r14>>>0>127){r8=_wcrtomb(r12,r14,0);if((r8|0)==-1){r10=-1;break}r18=r12+r8|0;r19=r13-r8|0;r20=r11}else{HEAP8[r12]=r14&255;r18=r12+1|0;r19=r13-1|0;r20=HEAP32[r4]}r14=r20+4|0;HEAP32[r4]=r14;if(r19>>>0>3){r13=r19;r12=r18;r11=r14}else{r16=r19;r17=r18;break L2865}}STACKTOP=r5;return r10}else{r16=r3;r17=r1}}while(0);L2877:do{if((r16|0)==0){r21=0}else{r1=r6|0;r18=r16;r19=r17;r20=HEAP32[r4];while(1){r11=HEAP32[r20>>2];if((r11|0)==0){r2=2528;break}if(r11>>>0>127){r12=_wcrtomb(r1,r11,0);if((r12|0)==-1){r10=-1;r2=2531;break}if(r12>>>0>r18>>>0){r2=2524;break}_wcrtomb(r19,HEAP32[r20>>2],0);r22=r19+r12|0;r23=r18-r12|0;r24=r20}else{HEAP8[r19]=r11&255;r22=r19+1|0;r23=r18-1|0;r24=HEAP32[r4]}r11=r24+4|0;HEAP32[r4]=r11;if((r23|0)==0){r21=0;break L2877}else{r18=r23;r19=r22;r20=r11}}if(r2==2528){HEAP8[r19]=0;r21=r18;break}else if(r2==2531){STACKTOP=r5;return r10}else if(r2==2524){r10=r3-r18|0;STACKTOP=r5;return r10}}}while(0);HEAP32[r4]=0;r10=r3-r21|0;STACKTOP=r5;return r10}function __ZNSt8bad_castD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv116__shim_type_infoD2Ev(r1){__ZNSt9type_infoD2Ev(r1|0);return}function __ZN10__cxxabiv117__class_type_infoD0Ev(r1){__ZNSt9type_infoD2Ev(r1|0);__ZdlPv(r1);return}function __ZN10__cxxabiv120__si_class_type_infoD0Ev(r1){__ZNSt9type_infoD2Ev(r1|0);__ZdlPv(r1);return}function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev(r1){__ZNSt9type_infoD2Ev(r1|0);__ZdlPv(r1);return}function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){var r4,r5,r6,r7,r8;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r5=r4,r6=r5>>2;if((r1|0)==(r2|0)){r7=1;STACKTOP=r4;return r7}if((r2|0)==0){r7=0;STACKTOP=r4;return r7}r8=___dynamic_cast(r2,10800,10784,-1);r2=r8;if((r8|0)==0){r7=0;STACKTOP=r4;return r7}_memset(r5,0,56);HEAP32[r6]=r2;HEAP32[r6+2]=r1;HEAP32[r6+3]=-1;HEAP32[r6+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r2,r5,HEAP32[r3>>2],1);if((HEAP32[r6+6]|0)!=1){r7=0;STACKTOP=r4;return r7}HEAP32[r3>>2]=HEAP32[r6+4];r7=1;STACKTOP=r4;return r7}function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((r1|0)!=(HEAP32[r2+8>>2]|0)){r5=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5,r2,r3,r4);return}r5=r2+16|0;r1=HEAP32[r5>>2];if((r1|0)==0){HEAP32[r5>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;if((r1|0)==(HEAP32[r2+8>>2]|0)){r6=r2+16|0;r7=HEAP32[r6>>2];if((r7|0)==0){HEAP32[r6>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r7|0)!=(r3|0)){r7=r2+36|0;HEAP32[r7>>2]=HEAP32[r7>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r7=r2+24|0;if((HEAP32[r7>>2]|0)!=2){return}HEAP32[r7>>2]=r4;return}r7=HEAP32[r1+12>>2];r6=(r7<<3)+r1+16|0;r8=HEAP32[r1+20>>2];r9=r8>>8;if((r8&1|0)==0){r10=r9}else{r10=HEAP32[HEAP32[r3>>2]+r9>>2]}r9=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r10|0,(r8&2|0)!=0?r4:2);if((r7|0)<=1){return}r7=r2+54|0;r8=r3;r10=r1+24|0;while(1){r1=HEAP32[r10+4>>2];r9=r1>>8;if((r1&1|0)==0){r11=r9}else{r11=HEAP32[HEAP32[r8>>2]+r9>>2]}r9=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r11|0,(r1&2|0)!=0?r4:2);if((HEAP8[r7]&1)!=0){r5=2590;break}r1=r10+8|0;if(r1>>>0<r6>>>0){r10=r1}else{r5=2586;break}}if(r5==2590){return}else if(r5==2586){return}}function ___dynamic_cast(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+56|0;r6=r5,r7=r6>>2;r8=HEAP32[r1>>2];r9=r1+HEAP32[r8-8>>2]|0;r10=HEAP32[r8-4>>2];r8=r10;HEAP32[r7]=r3;HEAP32[r7+1]=r1;HEAP32[r7+2]=r2;HEAP32[r7+3]=r4;r4=r6+16|0;r2=r6+20|0;r1=r6+24|0;r11=r6+28|0;r12=r6+32|0;r13=r6+40|0;_memset(r4,0,39);if((r10|0)==(r3|0)){HEAP32[r7+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+20>>2]](r8,r6,r9,r9,1,0);STACKTOP=r5;return(HEAP32[r1>>2]|0)==1?r9:0}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r8,r6,r9,1,0);r9=HEAP32[r7+9];if((r9|0)==0){if((HEAP32[r13>>2]|0)!=1){r14=0;STACKTOP=r5;return r14}if((HEAP32[r11>>2]|0)!=1){r14=0;STACKTOP=r5;return r14}r14=(HEAP32[r12>>2]|0)==1?HEAP32[r2>>2]:0;STACKTOP=r5;return r14}else if((r9|0)==1){do{if((HEAP32[r1>>2]|0)!=1){if((HEAP32[r13>>2]|0)!=0){r14=0;STACKTOP=r5;return r14}if((HEAP32[r11>>2]|0)!=1){r14=0;STACKTOP=r5;return r14}if((HEAP32[r12>>2]|0)==1){break}else{r14=0}STACKTOP=r5;return r14}}while(0);r14=HEAP32[r4>>2];STACKTOP=r5;return r14}else{r14=0;STACKTOP=r5;return r14}}function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6;r5=r2>>2;if((HEAP32[r5+2]|0)==(r1|0)){if((HEAP32[r5+1]|0)!=(r3|0)){return}r6=r2+28|0;if((HEAP32[r6>>2]|0)==1){return}HEAP32[r6>>2]=r4;return}if((HEAP32[r5]|0)!=(r1|0)){return}do{if((HEAP32[r5+4]|0)!=(r3|0)){r1=r2+20|0;if((HEAP32[r1>>2]|0)==(r3|0)){break}HEAP32[r5+8]=r4;HEAP32[r1>>2]=r3;r1=r2+40|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1;do{if((HEAP32[r5+9]|0)==1){if((HEAP32[r5+6]|0)!=2){break}HEAP8[r2+54|0]=1}}while(0);HEAP32[r5+11]=4;return}}while(0);if((r4|0)!=1){return}HEAP32[r5+8]=1;return}function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r2>>2;r7=r1>>2;r8=0;r9=r1|0;if((r9|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r10=r2+28|0;if((HEAP32[r10>>2]|0)==1){return}HEAP32[r10>>2]=r4;return}if((r9|0)==(HEAP32[r6]|0)){do{if((HEAP32[r6+4]|0)!=(r3|0)){r9=r2+20|0;if((HEAP32[r9>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r10=(r2+44|0)>>2;if((HEAP32[r10]|0)==4){return}r11=HEAP32[r7+3];r12=(r11<<3)+r1+16|0;L3034:do{if((r11|0)>0){r13=r2+52|0;r14=r2+53|0;r15=r2+54|0;r16=r1+8|0;r17=r2+24|0;r18=r3;r19=0;r20=r1+16|0;r21=0;L3036:while(1){HEAP8[r13]=0;HEAP8[r14]=0;r22=HEAP32[r20+4>>2];r23=r22>>8;if((r22&1|0)==0){r24=r23}else{r24=HEAP32[HEAP32[r18>>2]+r23>>2]}r23=HEAP32[r20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+20>>2]](r23,r2,r3,r3+r24|0,2-(r22>>>1&1)|0,r5);if((HEAP8[r15]&1)!=0){r25=r21;r26=r19;break}do{if((HEAP8[r14]&1)==0){r27=r21;r28=r19}else{if((HEAP8[r13]&1)==0){if((HEAP32[r16>>2]&1|0)==0){r25=1;r26=r19;break L3036}else{r27=1;r28=r19;break}}if((HEAP32[r17>>2]|0)==1){r8=2658;break L3034}if((HEAP32[r16>>2]&2|0)==0){r8=2658;break L3034}else{r27=1;r28=1}}}while(0);r22=r20+8|0;if(r22>>>0<r12>>>0){r19=r28;r20=r22;r21=r27}else{r25=r27;r26=r28;break}}if(r26){r29=r25;r8=2657}else{r30=r25;r8=2654}}else{r30=0;r8=2654}}while(0);do{if(r8==2654){HEAP32[r9>>2]=r3;r12=r2+40|0;HEAP32[r12>>2]=HEAP32[r12>>2]+1;if((HEAP32[r6+9]|0)!=1){r29=r30;r8=2657;break}if((HEAP32[r6+6]|0)!=2){r29=r30;r8=2657;break}HEAP8[r2+54|0]=1;if(r30){r8=2658}else{r8=2659}}}while(0);if(r8==2657){if(r29){r8=2658}else{r8=2659}}if(r8==2658){HEAP32[r10]=3;return}else if(r8==2659){HEAP32[r10]=4;return}}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}r6=HEAP32[r7+3];r29=(r6<<3)+r1+16|0;r30=HEAP32[r7+5];r25=r30>>8;if((r30&1|0)==0){r31=r25}else{r31=HEAP32[HEAP32[r3>>2]+r25>>2]}r25=HEAP32[r7+4];FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r25,r2,r3+r31|0,(r30&2|0)!=0?r4:2,r5);r30=r1+24|0;if((r6|0)<=1){return}r6=HEAP32[r7+2];do{if((r6&2|0)==0){r7=(r2+36|0)>>2;if((HEAP32[r7]|0)==1){break}if((r6&1|0)==0){r1=r2+54|0;r31=r3;r25=r30;while(1){if((HEAP8[r1]&1)!=0){r8=2695;break}if((HEAP32[r7]|0)==1){r8=2686;break}r26=HEAP32[r25+4>>2];r28=r26>>8;if((r26&1|0)==0){r32=r28}else{r32=HEAP32[HEAP32[r31>>2]+r28>>2]}r28=HEAP32[r25>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r32|0,(r26&2|0)!=0?r4:2,r5);r26=r25+8|0;if(r26>>>0<r29>>>0){r25=r26}else{r8=2693;break}}if(r8==2686){return}else if(r8==2693){return}else if(r8==2695){return}}r25=r2+24|0;r31=r2+54|0;r1=r3;r10=r30;while(1){if((HEAP8[r31]&1)!=0){r8=2700;break}if((HEAP32[r7]|0)==1){if((HEAP32[r25>>2]|0)==1){r8=2685;break}}r26=HEAP32[r10+4>>2];r28=r26>>8;if((r26&1|0)==0){r33=r28}else{r33=HEAP32[HEAP32[r1>>2]+r28>>2]}r28=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r33|0,(r26&2|0)!=0?r4:2,r5);r26=r10+8|0;if(r26>>>0<r29>>>0){r10=r26}else{r8=2694;break}}if(r8==2700){return}else if(r8==2685){return}else if(r8==2694){return}}}while(0);r33=r2+54|0;r32=r3;r6=r30;while(1){if((HEAP8[r33]&1)!=0){r8=2687;break}r30=HEAP32[r6+4>>2];r10=r30>>8;if((r30&1|0)==0){r34=r10}else{r34=HEAP32[HEAP32[r32>>2]+r10>>2]}r10=HEAP32[r6>>2];FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r10,r2,r3+r34|0,(r30&2|0)!=0?r4:2,r5);r30=r6+8|0;if(r30>>>0<r29>>>0){r6=r30}else{r8=2690;break}}if(r8==2687){return}else if(r8==2690){return}}function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2>>2;r7=0;r8=r1|0;if((r8|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r9=r2+28|0;if((HEAP32[r9>>2]|0)==1){return}HEAP32[r9>>2]=r4;return}if((r8|0)!=(HEAP32[r6]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r8,r2,r3,r4,r5);return}do{if((HEAP32[r6+4]|0)!=(r3|0)){r8=r2+20|0;if((HEAP32[r8>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r9=(r2+44|0)>>2;if((HEAP32[r9]|0)==4){return}r10=r2+52|0;HEAP8[r10]=0;r11=r2+53|0;HEAP8[r11]=0;r12=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+20>>2]](r12,r2,r3,r3,1,r5);if((HEAP8[r11]&1)==0){r13=0;r7=2714}else{if((HEAP8[r10]&1)==0){r13=1;r7=2714}}L3136:do{if(r7==2714){HEAP32[r8>>2]=r3;r10=r2+40|0;HEAP32[r10>>2]=HEAP32[r10>>2]+1;do{if((HEAP32[r6+9]|0)==1){if((HEAP32[r6+6]|0)!=2){r7=2717;break}HEAP8[r2+54|0]=1;if(r13){break L3136}}else{r7=2717}}while(0);if(r7==2717){if(r13){break}}HEAP32[r9]=4;return}}while(0);HEAP32[r9]=3;return}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=r2+52|0;r9=HEAP8[r8]&1;r10=r2+53|0;r11=HEAP8[r10]&1;r12=HEAP32[r1+12>>2];r13=(r12<<3)+r1+16|0;HEAP8[r8]=0;HEAP8[r10]=0;r14=HEAP32[r1+20>>2];r15=r14>>8;if((r14&1|0)==0){r16=r15}else{r16=HEAP32[HEAP32[r4>>2]+r15>>2]}r15=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r15,r2,r3,r4+r16|0,(r14&2|0)!=0?r5:2,r6);L3158:do{if((r12|0)>1){r14=r2+24|0;r16=r1+8|0;r15=r2+54|0;r17=r4;r18=r1+24|0;while(1){if((HEAP8[r15]&1)!=0){break L3158}do{if((HEAP8[r8]&1)==0){if((HEAP8[r10]&1)==0){break}if((HEAP32[r16>>2]&1|0)==0){break L3158}}else{if((HEAP32[r14>>2]|0)==1){break L3158}if((HEAP32[r16>>2]&2|0)==0){break L3158}}}while(0);HEAP8[r8]=0;HEAP8[r10]=0;r19=HEAP32[r18+4>>2];r20=r19>>8;if((r19&1|0)==0){r21=r20}else{r21=HEAP32[HEAP32[r17>>2]+r20>>2]}r20=HEAP32[r18>>2];FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+20>>2]](r20,r2,r3,r4+r21|0,(r19&2|0)!=0?r5:2,r6);r19=r18+8|0;if(r19>>>0<r13>>>0){r18=r19}else{break}}}}while(0);HEAP8[r8]=r9;HEAP8[r10]=r11;return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r11=HEAP32[r4>>2];if((r11|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r11|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r11=HEAP32[r3>>2];if((r11|0)==2){HEAP32[r3>>2]=r5;r22=r5}else{r22=r11}if(!((HEAP32[r7+12]|0)==1&(r22|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7;r6=r2>>2;if((HEAP32[r6+2]|0)!=(r1|0)){return}HEAP8[r2+53|0]=1;if((HEAP32[r6+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r1=HEAP32[r4>>2];if((r1|0)==0){HEAP32[r4>>2]=r3;HEAP32[r6+6]=r5;HEAP32[r6+9]=1;if(!((HEAP32[r6+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r1=HEAP32[r3>>2];if((r1|0)==2){HEAP32[r3>>2]=r5;r7=r5}else{r7=r1}if(!((HEAP32[r6+12]|0)==1&(r7|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+20>>2]](r8,r2,r3,r4,r5,r6);return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r6=HEAP32[r4>>2];if((r6|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r6|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r6=HEAP32[r3>>2];if((r6|0)==2){HEAP32[r3>>2]=r5;r9=r5}else{r9=r6}if(!((HEAP32[r7+12]|0)==1&(r9|0)==1)){return}HEAP8[r2+54|0]=1;return}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[2778];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+11152|0;r10=(r8+2<<2)+11152|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[2778]=r5&~(1<<r7)}else{if(r12>>>0<HEAP32[2782]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[2780]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+11152|0;r13=(r17+2<<2)+11152|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[2778]=r5&~(1<<r19)}else{if(r12>>>0<HEAP32[2782]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[2780];if((r12|0)!=0){r18=HEAP32[2783];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+11152|0;r11=HEAP32[2778];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[2778]=r11|r8;r20=r6;r21=(r12+2<<2)+11152|0}else{r4=(r12+2<<2)+11152|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[2782]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[2780]=r13;HEAP32[2783]=r5;r14=r9;return r14}r12=HEAP32[2779];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+11416>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[2782];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break}else{r25=r8;r26=r12}}else{r25=r7;r26=r18}while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L129:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+11416|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r6>>2]);break L129}else{if(r5>>>0<HEAP32[2782]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L129}}}while(0);if(r23>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[2780];if((r6|0)!=0){r5=HEAP32[2783];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+11152|0;r12=HEAP32[2778];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[2778]=r12|r7;r27=r18;r28=(r6+2<<2)+11152|0}else{r9=(r6+2<<2)+11152|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[2782]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[2780]=r11;HEAP32[2783]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[2779];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+11416>>2];L177:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L177}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+11416>>2]}else{r38=r34}if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[2780]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r31=r40,r5=r31>>2;r11=HEAP32[2782];if(r31>>>0<r11>>>0){_abort()}r18=r31+r7|0;r19=r18;if(r31>>>0>=r18>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break}else{r44=r8;r45=r6}}else{r44=r4;r45=r9}while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r11>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r11>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L227:do{if((r17|0)!=0){r13=r40+28|0;r11=(HEAP32[r13>>2]<<2)+11416|0;do{if((r40|0)==(HEAP32[r11>>2]|0)){HEAP32[r11>>2]=r42;if((r42|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r13>>2]);break L227}else{if(r17>>>0<HEAP32[2782]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L227}}}while(0);if(r42>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r31+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r5]=r39|1;HEAP32[(r39>>2)+r5+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r11=(r17<<2)+11152|0;r9=HEAP32[2778];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[2778]=r9|r6;r46=r11;r47=(r17+2<<2)+11152|0}else{r13=(r17+2<<2)+11152|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[2782]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r19;HEAP32[r46+12>>2]=r19;HEAP32[r12+(r5+2)]=r46;HEAP32[r12+(r5+3)]=r11;break}r17=r18;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+11416|0;HEAP32[r12+(r5+7)]=r48;HEAP32[r12+(r5+5)]=0;HEAP32[r12+(r5+4)]=0;r11=HEAP32[2779];r30=1<<r48;if((r11&r30|0)==0){HEAP32[2779]=r11|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r5+6)]=r6;HEAP32[r12+(r5+3)]=r17;HEAP32[r12+(r5+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r11=HEAP32[r6>>2];while(1){if((HEAP32[r11+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r11+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=190;break}else{r30=r30<<1;r11=r6}}if(r2==190){if(r50>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r5+6)]=r11;HEAP32[r12+(r5+3)]=r17;HEAP32[r12+(r5+2)]=r17;break}}r30=r11+8|0;r6=HEAP32[r30>>2];r13=HEAP32[2782];if(r11>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r5+2)]=r6;HEAP32[r12+(r5+3)]=r11;HEAP32[r12+(r5+6)]=0;break}}}while(0);r5=r40+8|0;if((r5|0)==0){r15=r7,r16=r15>>2;break}else{r14=r5}return r14}}while(0);r40=HEAP32[2780];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[2783];if(r50>>>0>15){r49=r39;HEAP32[2783]=r49+r15;HEAP32[2780]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[2780]=0;HEAP32[2783]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[2781];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[2781]=r50;r39=HEAP32[2784];r40=r39;HEAP32[2784]=r40+r15;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[2768]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[2770]=r39;HEAP32[2769]=r39;HEAP32[2771]=-1;HEAP32[2772]=2097152;HEAP32[2773]=0;HEAP32[2889]=0;r39=_time(0)&-16^1431655768;HEAP32[2768]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[2770];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[2888];do{if((r46|0)!=0){r47=HEAP32[2886];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L319:do{if((HEAP32[2889]&4|0)==0){r46=HEAP32[2784];L321:do{if((r46|0)==0){r2=220}else{r41=r46;r47=11560;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=220;break L321}else{r47=r42}}if((r47|0)==0){r2=220;break}r41=r49-HEAP32[2781]&r48;if(r41>>>0>=2147483647){r53=0;break}r11=_sbrk(r41);r17=(r11|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r11:-1;r55=r17?r41:0;r56=r11;r57=r41;r2=229}}while(0);do{if(r2==220){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[2769];r11=r41-1|0;if((r11&r7|0)==0){r58=r50}else{r58=r50-r7+(r11+r7&-r41)|0}r41=HEAP32[2886];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r11=HEAP32[2888];if((r11|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r11>>>0){r53=0;break}}r11=_sbrk(r58);r7=(r11|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r11;r57=r58;r2=229}}while(0);L341:do{if(r2==229){r11=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=240;break L319}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[2770];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r11);r53=r55;break L341}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=240;break L319}}}while(0);HEAP32[2889]=HEAP32[2889]|4;r64=r53;r2=237}else{r64=0;r2=237}}while(0);do{if(r2==237){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)!=-1){r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=240}}}while(0);do{if(r2==240){r64=HEAP32[2886]+r59|0;HEAP32[2886]=r64;if(r64>>>0>HEAP32[2887]>>>0){HEAP32[2887]=r64}r64=HEAP32[2784],r50=r64>>2;L361:do{if((r64|0)==0){r55=HEAP32[2782];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[2782]=r61}HEAP32[2890]=r61;HEAP32[2891]=r59;HEAP32[2893]=0;HEAP32[2787]=HEAP32[2768];HEAP32[2786]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+11152|0;HEAP32[(r63+3<<2)+11152>>2]=r56;HEAP32[(r63+2<<2)+11152>>2]=r56;r56=r55+1|0;if(r56>>>0<32){r55=r56}else{break}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[2784]=r61+r65;HEAP32[2781]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[2785]=HEAP32[2772]}else{r55=11560,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=252;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==252){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59;r55=HEAP32[2784];r63=HEAP32[2781]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[2784]=r53+r69;HEAP32[2781]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[2785]=HEAP32[2772];break L361}}while(0);if(r61>>>0<HEAP32[2782]>>>0){HEAP32[2782]=r61}r56=r61+r59|0;r53=11560;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=262;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==262){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[2784]|0)){r54=HEAP32[2781]+r39|0;HEAP32[2781]=r54;HEAP32[2784]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[2783]|0)){r54=HEAP32[2780]+r39|0;HEAP32[2780]=r54;HEAP32[2783]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L406:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r11=(r51<<3)+11152|0;do{if((r48|0)!=(r11|0)){if(r48>>>0<HEAP32[2782]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[2778]=HEAP32[2778]&~(1<<r51);break}do{if((r49|0)==(r11|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[2782]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r11=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];do{if((r46|0)==(r11|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];if((r17|0)==0){r42=r61+r7+r59|0;r7=HEAP32[r42>>2];if((r7|0)==0){r75=0,r76=r75>>2;break}else{r77=r7;r78=r42}}else{r77=r17;r78=r41}while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[2782]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r11|0)){_abort()}r42=r46+8|0;if((HEAP32[r42>>2]|0)==(r11|0)){HEAP32[r17>>2]=r46;HEAP32[r42>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+11416|0;do{if((r11|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r46>>2]);break L406}else{if(r47>>>0<HEAP32[2782]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r11|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L406}}}while(0);if(r75>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r76+6]=r47;r11=r72|16;r46=HEAP32[(r11>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r11>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+11152|0;r46=HEAP32[2778];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[2778]=r46|r47;r81=r58;r82=(r51+2<<2)+11152|0}else{r54=(r51+2<<2)+11152|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[2782]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+11416|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[2779];r49=1<<r83;if((r58&r49|0)==0){HEAP32[2779]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=335;break}else{r49=r49<<1;r58=r47}}if(r2==335){if(r85>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[2782];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=11560,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[2784]=r61+r90;HEAP32[2781]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[2785]=HEAP32[2772];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[2890];HEAP32[r57+1]=HEAP32[2891];HEAP32[r57+2]=HEAP32[2892];HEAP32[r57+3]=HEAP32[2893];HEAP32[2890]=r61;HEAP32[2891]=r59;HEAP32[2893]=0;HEAP32[2892]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r55=r57+4|0;HEAP32[r55>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r55}else{break}}}if((r40|0)==(r53|0)){break}r57=r40-r64|0;r55=r57+(r53+4)|0;HEAP32[r55>>2]=HEAP32[r55>>2]&-2;HEAP32[r50+1]=r57|1;HEAP32[r53+r57>>2]=r57;r55=r57>>>3;if(r57>>>0<256){r39=r55<<1;r63=(r39<<2)+11152|0;r56=HEAP32[2778];r47=1<<r55;do{if((r56&r47|0)==0){HEAP32[2778]=r56|r47;r91=r63;r92=(r39+2<<2)+11152|0}else{r55=(r39+2<<2)+11152|0;r49=HEAP32[r55>>2];if(r49>>>0>=HEAP32[2782]>>>0){r91=r49;r92=r55;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r57>>>8;do{if((r47|0)==0){r93=0}else{if(r57>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r55=r53<<r40;r53=(r55+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r55<<r53>>>15)|0;r93=r57>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+11416|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[2779];r49=1<<r93;if((r63&r49|0)==0){HEAP32[2779]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r57<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r57|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=370;break}else{r49=r49<<1;r63=r47}}if(r2==370){if(r95>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r57=HEAP32[r49>>2];r47=HEAP32[2782];if(r63>>>0<r47>>>0){_abort()}if(r57>>>0<r47>>>0){_abort()}else{HEAP32[r57+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r57;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[2781];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[2781]=r64;r50=HEAP32[2784];r57=r50;HEAP32[2784]=r57+r15;HEAP32[(r57+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[2782];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L578:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[2783]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[2780]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+11152|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[2778]=HEAP32[2778]&~(1<<r19);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break}else{r33=r30;r34=r29}}else{r33=r28;r34=r27}while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+11416|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r26>>2]);r20=r17,r21=r20>>2;r22=r18;break L578}else{if(r19>>>0<HEAP32[2782]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L578}}}while(0);if(r31>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[2784]|0)){r6=HEAP32[2781]+r22|0;HEAP32[2781]=r6;HEAP32[2784]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[2783]|0)){HEAP32[2783]=0;HEAP32[2780]=0}if(r6>>>0<=HEAP32[2785]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[2783]|0)){r6=HEAP32[2780]+r22|0;HEAP32[2780]=r6;HEAP32[2783]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L684:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+11152|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[2782]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[2778]=HEAP32[2778]&~(1<<r33);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[2782]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break}else{r38=r16;r39=r26}}else{r38=r19;r39=r24}while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[2782]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+11416|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r7>>2]);break L684}else{if(r4>>>0<HEAP32[2782]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L684}}}while(0);if(r36>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[2783]|0)){r40=r6;break}HEAP32[2780]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+11152|0;r5=HEAP32[2778];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[2778]=r5|r36;r41=r32;r42=(r31+2<<2)+11152|0}else{r22=(r31+2<<2)+11152|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[2782]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+11416|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[2779];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[2779]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=549;break}else{r5=r5<<1;r42=r36}}if(r3==549){if(r45>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[2782];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[2786]-1|0;HEAP32[2786]=r21;if((r21|0)==0){r46=11568}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[2786]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;r5=r6>>>0<r2>>>0?r6:r2;_memcpy(r4,r1,r5)|0;_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;do{if((HEAP32[2768]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[2770]=r2;HEAP32[2769]=r2;HEAP32[2771]=-1;HEAP32[2772]=2097152;HEAP32[2773]=0;HEAP32[2889]=0;r2=_time(0)&-16^1431655768;HEAP32[2768]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;return r3}r2=HEAP32[2784];if((r2|0)==0){r3=0;return r3}r4=HEAP32[2781];do{if(r4>>>0>(r1+40|0)>>>0){r5=HEAP32[2770];r6=Math.imul((((-40-r1-1+r4+r5|0)>>>0)/(r5>>>0)&-1)-1|0,r5)|0;r7=r2;r8=11560,r9=r8>>2;while(1){r10=HEAP32[r9];if(r10>>>0<=r7>>>0){if((r10+HEAP32[r9+1]|0)>>>0>r7>>>0){r11=r8;break}}r10=HEAP32[r9+2];if((r10|0)==0){r11=0;break}else{r8=r10,r9=r8>>2}}if((HEAP32[r11+12>>2]&8|0)!=0){break}r8=_sbrk(0);r9=(r11+4|0)>>2;if((r8|0)!=(HEAP32[r11>>2]+HEAP32[r9]|0)){break}r7=_sbrk(-(r6>>>0>2147483646?-2147483648-r5|0:r6)|0);r10=_sbrk(0);if(!((r7|0)!=-1&r10>>>0<r8>>>0)){break}r7=r8-r10|0;if((r8|0)==(r10|0)){break}HEAP32[r9]=HEAP32[r9]-r7;HEAP32[2886]=HEAP32[2886]-r7;r9=HEAP32[2784];r12=HEAP32[2781]-r7|0;r7=r9;r13=r9+8|0;if((r13&7|0)==0){r14=0}else{r14=-r13&7}r13=r12-r14|0;HEAP32[2784]=r7+r14;HEAP32[2781]=r13;HEAP32[r14+(r7+4)>>2]=r13|1;HEAP32[r12+(r7+4)>>2]=40;HEAP32[2785]=HEAP32[2772];r3=(r8|0)!=(r10|0)|0;return r3}}while(0);if(HEAP32[2781]>>>0<=HEAP32[2785]>>>0){r3=0;return r3}HEAP32[2785]=-1;r3=0;return r3}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[2782];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[2770]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[2784]|0)){r12=HEAP32[2781]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[2784]=r7+r2;HEAP32[2781]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[2783]|0)){r13=HEAP32[2780]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[2780]=r18;HEAP32[2783]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L904:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+11152|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[2778]=HEAP32[2778]&~(1<<r4);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break}else{r28=r25;r29=r24}}else{r28=r23;r29=r22}while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+11416|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r21>>2]);break L904}else{if(r20>>>0<HEAP32[2782]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L904}}}while(0);if(r26>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L980:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[2782];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[2783]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[2780]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+11152|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[2778]=HEAP32[2778]&~(1<<r15);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];if((r26|0)==0){r27=r5+r24|0;r24=HEAP32[r27>>2];if((r24|0)==0){r28=0,r29=r28>>2;break}else{r30=r24;r31=r27}}else{r30=r26;r31=r25}while(1){r25=r30+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r30=r26;r31=r25;continue}r25=r30+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r30=r26;r31=r25}}if(r31>>>0<r14>>>0){_abort()}else{HEAP32[r31>>2]=0;r28=r30,r29=r28>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r27=r23+8|0;if((HEAP32[r27>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r27>>2]=r25;r28=r23,r29=r28>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+11416|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r28;if((r28|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r23>>2]);r16=r12,r17=r16>>2;r18=r13;break L980}else{if(r15>>>0<HEAP32[2782]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r28}else{HEAP32[r15+20>>2]=r28}if((r28|0)==0){r16=r12,r17=r16>>2;r18=r13;break L980}}}while(0);if(r28>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r29+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r29+4]=r23;HEAP32[r23+24>>2]=r28;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r29+5]=r23;HEAP32[r23+24>>2]=r28;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[2782];if(r7>>>0<r1>>>0){_abort()}r28=r2+(r5+4)|0;r29=HEAP32[r28>>2];do{if((r29&2|0)==0){if((r8|0)==(HEAP32[2784]|0)){r30=HEAP32[2781]+r18|0;HEAP32[2781]=r30;HEAP32[2784]=r16;HEAP32[r17+1]=r30|1;if((r16|0)!=(HEAP32[2783]|0)){return}HEAP32[2783]=0;HEAP32[2780]=0;return}if((r8|0)==(HEAP32[2783]|0)){r30=HEAP32[2780]+r18|0;HEAP32[2780]=r30;HEAP32[2783]=r16;HEAP32[r17+1]=r30|1;HEAP32[(r30>>2)+r17]=r30;return}r30=(r29&-8)+r18|0;r31=r29>>>3;L1079:do{if(r29>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r31<<3)+11152|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[2778]=HEAP32[2778]&~(1<<r31);break}do{if((r9|0)==(r23|0)){r32=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r32=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r32>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r33=0,r34=r33>>2;break}else{r35=r20;r36=r19}}else{r35=r11;r36=r14}while(1){r14=r35+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r35=r11;r36=r14;continue}r14=r35+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r35=r11;r36=r14}}if(r36>>>0<r1>>>0){_abort()}else{HEAP32[r36>>2]=0;r33=r35,r34=r33>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r33=r15,r34=r33>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+11416|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r33;if((r33|0)!=0){break}HEAP32[2779]=HEAP32[2779]&~(1<<HEAP32[r15>>2]);break L1079}else{if(r10>>>0<HEAP32[2782]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r33}else{HEAP32[r10+20>>2]=r33}if((r33|0)==0){break L1079}}}while(0);if(r33>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r34+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r34+4]=r23;HEAP32[r23+24>>2]=r33;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[2782]>>>0){_abort()}else{HEAP32[r34+5]=r23;HEAP32[r23+24>>2]=r33;break}}}while(0);HEAP32[r17+1]=r30|1;HEAP32[(r30>>2)+r17]=r30;if((r16|0)!=(HEAP32[2783]|0)){r37=r30;break}HEAP32[2780]=r30;return}else{HEAP32[r28>>2]=r29&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r37=r18}}while(0);r18=r37>>>3;if(r37>>>0<256){r29=r18<<1;r28=(r29<<2)+11152|0;r33=HEAP32[2778];r34=1<<r18;do{if((r33&r34|0)==0){HEAP32[2778]=r33|r34;r38=r28;r39=(r29+2<<2)+11152|0}else{r18=(r29+2<<2)+11152|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[2782]>>>0){r38=r6;r39=r18;break}_abort()}}while(0);HEAP32[r39>>2]=r16;HEAP32[r38+12>>2]=r16;HEAP32[r17+2]=r38;HEAP32[r17+3]=r28;return}r28=r16;r38=r37>>>8;do{if((r38|0)==0){r40=0}else{if(r37>>>0>16777215){r40=31;break}r39=(r38+1048320|0)>>>16&8;r29=r38<<r39;r34=(r29+520192|0)>>>16&4;r33=r29<<r34;r29=(r33+245760|0)>>>16&2;r18=14-(r34|r39|r29)+(r33<<r29>>>15)|0;r40=r37>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r38=(r40<<2)+11416|0;HEAP32[r17+7]=r40;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[2779];r29=1<<r40;if((r18&r29|0)==0){HEAP32[2779]=r18|r29;HEAP32[r38>>2]=r28;HEAP32[r17+6]=r38;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r40|0)==31){r41=0}else{r41=25-(r40>>>1)|0}r40=r37<<r41;r41=HEAP32[r38>>2];while(1){if((HEAP32[r41+4>>2]&-8|0)==(r37|0)){break}r42=(r40>>>31<<2)+r41+16|0;r38=HEAP32[r42>>2];if((r38|0)==0){r4=855;break}else{r40=r40<<1;r41=r38}}if(r4==855){if(r42>>>0<HEAP32[2782]>>>0){_abort()}HEAP32[r42>>2]=r28;HEAP32[r17+6]=r41;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r41+8|0;r42=HEAP32[r16>>2];r4=HEAP32[2782];if(r41>>>0<r4>>>0){_abort()}if(r42>>>0<r4>>>0){_abort()}HEAP32[r42+12>>2]=r28;HEAP32[r16>>2]=r28;HEAP32[r17+2]=r42;HEAP32[r17+3]=r41;HEAP32[r17+6]=0;return}function __Znwj(r1){var r2,r3,r4;r2=0;r3=(r1|0)==0?1:r1;while(1){r4=_malloc(r3);if((r4|0)!=0){r2=899;break}r1=(tempValue=HEAP32[3738],HEAP32[3738]=tempValue,tempValue);if((r1|0)==0){break}FUNCTION_TABLE[r1]()}if(r2==899){return r4}r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=3240;___cxa_throw(r4,9224,72)}function __Znaj(r1){return __Znwj(r1)}function __ZNSt9bad_allocD2Ev(r1){return}function __ZNKSt9bad_alloc4whatEv(r1){return 1616}function __ZdlPv(r1){if((r1|0)==0){return}_free(r1);return}function __ZdaPv(r1){__ZdlPv(r1);return}function __ZNSt9bad_allocD0Ev(r1){__ZdlPv(r1);return}function _strtod(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r3=0;r4=r1;while(1){r5=r4+1|0;if((_isspace(HEAP8[r4]|0)|0)==0){break}else{r4=r5}}r6=HEAP8[r4];if(r6<<24>>24==45){r7=r5;r8=1}else if(r6<<24>>24==43){r7=r5;r8=0}else{r7=r4;r8=0}r4=-1;r5=0;r6=r7;while(1){r9=HEAP8[r6];if(((r9<<24>>24)-48|0)>>>0<10){r10=r4}else{if(r9<<24>>24!=46|(r4|0)>-1){break}else{r10=r5}}r4=r10;r5=r5+1|0;r6=r6+1|0}r10=r6+ -r5|0;r7=(r4|0)<0;r11=((r7^1)<<31>>31)+r5|0;r12=(r11|0)>18;r13=(r12?-18:-r11|0)+(r7?r5:r4)|0;r4=r12?18:r11;do{if((r4|0)==0){r14=r1;r15=0}else{if((r4|0)>9){r11=r10;r12=r4;r5=0;while(1){r7=HEAP8[r11];r16=r11+1|0;if(r7<<24>>24==46){r17=HEAP8[r16];r18=r11+2|0}else{r17=r7;r18=r16}r19=(r17<<24>>24)+((r5*10&-1)-48)|0;r16=r12-1|0;if((r16|0)>9){r11=r18;r12=r16;r5=r19}else{break}}r20=(r19|0)*1e9;r21=9;r22=r18;r3=929}else{if((r4|0)>0){r20=0;r21=r4;r22=r10;r3=929}else{r23=0;r24=0}}if(r3==929){r5=r22;r12=r21;r11=0;while(1){r16=HEAP8[r5];r7=r5+1|0;if(r16<<24>>24==46){r25=HEAP8[r7];r26=r5+2|0}else{r25=r16;r26=r7}r27=(r25<<24>>24)+((r11*10&-1)-48)|0;r7=r12-1|0;if((r7|0)>0){r5=r26;r12=r7;r11=r27}else{break}}r23=r27|0;r24=r20}r11=r24+r23;do{if(r9<<24>>24==69|r9<<24>>24==101){r12=r6+1|0;r5=HEAP8[r12];if(r5<<24>>24==45){r28=r6+2|0;r29=1}else if(r5<<24>>24==43){r28=r6+2|0;r29=0}else{r28=r12;r29=0}r12=HEAP8[r28];if(((r12<<24>>24)-48|0)>>>0<10){r30=r28;r31=0;r32=r12}else{r33=0;r34=r28;r35=r29;break}while(1){r12=(r32<<24>>24)+((r31*10&-1)-48)|0;r5=r30+1|0;r7=HEAP8[r5];if(((r7<<24>>24)-48|0)>>>0<10){r30=r5;r31=r12;r32=r7}else{r33=r12;r34=r5;r35=r29;break}}}else{r33=0;r34=r6;r35=0}}while(0);r5=r13+((r35|0)==0?r33:-r33|0)|0;r12=(r5|0)<0?-r5|0:r5;if((r12|0)>511){r7=___errno_location();HEAP32[r7>>2]=34;r36=1;r37=8;r38=511;r3=946}else{if((r12|0)==0){r39=1}else{r36=1;r37=8;r38=r12;r3=946}}if(r3==946){while(1){r3=0;if((r38&1|0)==0){r40=r36}else{r40=r36*HEAPF64[r37>>3]}r12=r38>>1;if((r12|0)==0){r39=r40;break}else{r36=r40;r37=r37+8|0;r38=r12;r3=946}}}if((r5|0)>-1){r14=r34;r15=r11*r39;break}else{r14=r34;r15=r11/r39;break}}}while(0);if((r2|0)!=0){HEAP32[r2>>2]=r14}if((r8|0)==0){r41=r15;return r41}r41=-r15;return r41}function _strtold_l(r1,r2,r3){return _strtod(r1,r2)}function __ZSt17__throw_bad_allocv(){var r1;r1=___cxa_allocate_exception(4);HEAP32[r1>>2]=3240;___cxa_throw(r1,9224,72)}function _i64Add(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r5=r1+r3>>>0;r6=r2+r4+(r5>>>0<r1>>>0|0)>>>0;return tempRet0=r6,r5|0}function _i64Subtract(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r5=r1-r3>>>0;r6=r2-r4>>>0;r6=r2-r4-(r3>>>0>r1>>>0|0)>>>0;return tempRet0=r6,r5|0}function _bitshift64Shl(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2<<r3|(r1&r4<<32-r3)>>>32-r3;return r1<<r3}tempRet0=r1<<r3-32;return 0}function _bitshift64Lshr(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2>>>r3;return r1>>>r3|(r2&r4)<<32-r3}tempRet0=0;return r2>>>r3-32|0}function _bitshift64Ashr(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2>>r3;return r1>>>r3|(r2&r4)<<32-r3}tempRet0=(r2|0)<0?-1:0;return r2>>r3-32|0}function _llvm_ctlz_i32(r1){var r2;r1=r1|0;r2=0;r2=HEAP8[ctlz_i8+(r1>>>24)|0];if((r2|0)<8)return r2|0;r2=HEAP8[ctlz_i8+(r1>>16&255)|0];if((r2|0)<8)return r2+8|0;r2=HEAP8[ctlz_i8+(r1>>8&255)|0];if((r2|0)<8)return r2+16|0;return HEAP8[ctlz_i8+(r1&255)|0]+24|0}var ctlz_i8=allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"i8",ALLOC_DYNAMIC);function _llvm_cttz_i32(r1){var r2;r1=r1|0;r2=0;r2=HEAP8[cttz_i8+(r1&255)|0];if((r2|0)<8)return r2|0;r2=HEAP8[cttz_i8+(r1>>8&255)|0];if((r2|0)<8)return r2+8|0;r2=HEAP8[cttz_i8+(r1>>16&255)|0];if((r2|0)<8)return r2+16|0;return HEAP8[cttz_i8+(r1>>>24)|0]+24|0}var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function ___muldsi3(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r1=r1|0;r2=r2|0;r3=0,r4=0,r5=0,r6=0,r7=0,r8=0,r9=0;r3=r1&65535;r4=r2&65535;r5=Math.imul(r4,r3)|0;r6=r1>>>16;r7=(r5>>>16)+Math.imul(r4,r6)|0;r8=r2>>>16;r9=Math.imul(r8,r3)|0;return(tempRet0=(r7>>>16)+Math.imul(r8,r6)+(((r7&65535)+r9|0)>>>16)|0,r7+r9<<16|r5&65535|0)|0}function ___divdi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0;r5=r2>>31|((r2|0)<0?-1:0)<<1;r6=((r2|0)<0?-1:0)>>31|((r2|0)<0?-1:0)<<1;r7=r4>>31|((r4|0)<0?-1:0)<<1;r8=((r4|0)<0?-1:0)>>31|((r4|0)<0?-1:0)<<1;r9=_i64Subtract(r5^r1,r6^r2,r5,r6)|0;r10=tempRet0;r11=_i64Subtract(r7^r3,r8^r4,r7,r8)|0;r12=r7^r5;r13=r8^r6;r14=___udivmoddi4(r9,r10,r11,tempRet0,0)|0;r15=_i64Subtract(r14^r12,tempRet0^r13,r12,r13)|0;return(tempRet0=tempRet0,r15)|0}function ___remdi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0;r15=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r15|0;r6=r2>>31|((r2|0)<0?-1:0)<<1;r7=((r2|0)<0?-1:0)>>31|((r2|0)<0?-1:0)<<1;r8=r4>>31|((r4|0)<0?-1:0)<<1;r9=((r4|0)<0?-1:0)>>31|((r4|0)<0?-1:0)<<1;r10=_i64Subtract(r6^r1,r7^r2,r6,r7)|0;r11=tempRet0;r12=_i64Subtract(r8^r3,r9^r4,r8,r9)|0;___udivmoddi4(r10,r11,r12,tempRet0,r5)|0;r13=_i64Subtract(HEAP32[r5>>2]^r6,HEAP32[r5+4>>2]^r7,r6,r7)|0;r14=tempRet0;STACKTOP=r15;return(tempRet0=r14,r13)|0}function ___muldi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0;r5=r1;r6=r3;r7=___muldsi3(r5,r6)|0;r8=tempRet0;r9=Math.imul(r2,r6)|0;return(tempRet0=Math.imul(r4,r5)+r9+r8|r8&0,r7&-1|0)|0}function ___udivdi3(r1,r2,r3,r4){var r5;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0;r5=___udivmoddi4(r1,r2,r3,r4,0)|0;return(tempRet0=tempRet0,r5)|0}function ___uremdi3(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r6|0;___udivmoddi4(r1,r2,r3,r4,r5)|0;STACKTOP=r6;return(tempRet0=HEAP32[r5+4>>2]|0,HEAP32[r5>>2]|0)|0}function ___udivmoddi4(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=r5|0;r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0,r16=0,r17=0,r18=0,r19=0,r20=0,r21=0,r22=0,r23=0,r24=0,r25=0,r26=0,r27=0,r28=0,r29=0,r30=0,r31=0,r32=0,r33=0,r34=0,r35=0,r36=0,r37=0,r38=0,r39=0,r40=0,r41=0,r42=0,r43=0,r44=0,r45=0,r46=0,r47=0,r48=0,r49=0,r50=0,r51=0,r52=0,r53=0,r54=0,r55=0,r56=0,r57=0,r58=0,r59=0,r60=0,r61=0,r62=0,r63=0,r64=0,r65=0,r66=0,r67=0,r68=0,r69=0;r6=r1;r7=r2;r8=r7;r9=r3;r10=r4;r11=r10;if((r8|0)==0){r12=(r5|0)!=0;if((r11|0)==0){if(r12){HEAP32[r5>>2]=(r6>>>0)%(r9>>>0);HEAP32[r5+4>>2]=0}r69=0;r68=(r6>>>0)/(r9>>>0)>>>0;return(tempRet0=r69,r68)|0}else{if(!r12){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}}r13=(r11|0)==0;do{if((r9|0)==0){if(r13){if((r5|0)!=0){HEAP32[r5>>2]=(r8>>>0)%(r9>>>0);HEAP32[r5+4>>2]=0}r69=0;r68=(r8>>>0)/(r9>>>0)>>>0;return(tempRet0=r69,r68)|0}if((r6|0)==0){if((r5|0)!=0){HEAP32[r5>>2]=0;HEAP32[r5+4>>2]=(r8>>>0)%(r11>>>0)}r69=0;r68=(r8>>>0)/(r11>>>0)>>>0;return(tempRet0=r69,r68)|0}r14=r11-1|0;if((r14&r11|0)==0){if((r5|0)!=0){HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r14&r8|r2&0}r69=0;r68=r8>>>((_llvm_cttz_i32(r11|0)|0)>>>0);return(tempRet0=r69,r68)|0}r15=_llvm_ctlz_i32(r11|0)|0;r16=r15-_llvm_ctlz_i32(r8|0)|0;if(r16>>>0<=30){r17=r16+1|0;r18=31-r16|0;r37=r17;r36=r8<<r18|r6>>>(r17>>>0);r35=r8>>>(r17>>>0);r34=0;r33=r6<<r18;break}if((r5|0)==0){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r7|r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}else{if(!r13){r28=_llvm_ctlz_i32(r11|0)|0;r29=r28-_llvm_ctlz_i32(r8|0)|0;if(r29>>>0<=31){r30=r29+1|0;r31=31-r29|0;r32=r29-31>>31;r37=r30;r36=r6>>>(r30>>>0)&r32|r8<<r31;r35=r8>>>(r30>>>0)&r32;r34=0;r33=r6<<r31;break}if((r5|0)==0){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r7|r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}r19=r9-1|0;if((r19&r9|0)!=0){r21=_llvm_ctlz_i32(r9|0)+33|0;r22=r21-_llvm_ctlz_i32(r8|0)|0;r23=64-r22|0;r24=32-r22|0;r25=r24>>31;r26=r22-32|0;r27=r26>>31;r37=r22;r36=r24-1>>31&r8>>>(r26>>>0)|(r8<<r24|r6>>>(r22>>>0))&r27;r35=r27&r8>>>(r22>>>0);r34=r6<<r23&r25;r33=(r8<<r23|r6>>>(r26>>>0))&r25|r6<<r24&r22-33>>31;break}if((r5|0)!=0){HEAP32[r5>>2]=r19&r6;HEAP32[r5+4>>2]=0}if((r9|0)==1){r69=r7|r2&0;r68=r1&-1|0;return(tempRet0=r69,r68)|0}else{r20=_llvm_cttz_i32(r9|0)|0;r69=r8>>>(r20>>>0)|0;r68=r8<<32-r20|r6>>>(r20>>>0)|0;return(tempRet0=r69,r68)|0}}}while(0);if((r37|0)==0){r64=r33;r63=r34;r62=r35;r61=r36;r60=0;r59=0}else{r38=r3&-1|0;r39=r10|r4&0;r40=_i64Add(r38,r39,-1,-1)|0;r41=tempRet0;r47=r33;r46=r34;r45=r35;r44=r36;r43=r37;r42=0;while(1){r48=r46>>>31|r47<<1;r49=r42|r46<<1;r50=r44<<1|r47>>>31|0;r51=r44>>>31|r45<<1|0;_i64Subtract(r40,r41,r50,r51)|0;r52=tempRet0;r53=r52>>31|((r52|0)<0?-1:0)<<1;r54=r53&1;r55=_i64Subtract(r50,r51,r53&r38,(((r52|0)<0?-1:0)>>31|((r52|0)<0?-1:0)<<1)&r39)|0;r56=r55;r57=tempRet0;r58=r43-1|0;if((r58|0)==0){break}else{r47=r48;r46=r49;r45=r57;r44=r56;r43=r58;r42=r54}}r64=r48;r63=r49;r62=r57;r61=r56;r60=0;r59=r54}r65=r63;r66=0;r67=r64|r66;if((r5|0)!=0){HEAP32[r5>>2]=r61;HEAP32[r5+4>>2]=r62}r69=(r65|0)>>>31|r67<<1|(r66<<1|r65>>>31)&0|r60;r68=(r65<<1|0>>>31)&-2|r59;return(tempRet0=r69,r68)|0}
// EMSCRIPTEN_END_FUNCS
Module["_main"] = _main;
Module["_malloc"] = _malloc;
Module["_free"] = _free;
Module["_realloc"] = _realloc;
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
var initialStackTop;
var inMain;
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
  inMain = true;
  var ret;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e && typeof e == 'object' && e.type == 'ExitStatus') {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      Module.print('Exit Status: ' + e.value);
      return e.value;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    inMain = false;
  }
  // if we're not running an evented main loop, it's time to exit
  if (!Module['noExitRuntime']) {
    exit(ret);
  }
}
function run(args) {
  args = args || Module['arguments'];
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
    calledRun = true;
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
  STACKTOP = initialStackTop;
  // TODO call externally added 'exit' callbacks with the status code.
  // It'd be nice to provide the same interface for all Module events (e.g.
  // prerun, premain, postmain). Perhaps an EventEmitter so we can do:
  // Module.on('exit', function (status) {});
  // exit the runtime
  exitRuntime();
  if (inMain) {
    // if we're still inside the callMain's try/catch, we need to throw an
    // exception in order to immediately terminate execution.
    throw { type: 'ExitStatus', value: status };
  }
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
  }
  ABORT = true;
  throw 'abort() at ' + (new Error().stack);
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
