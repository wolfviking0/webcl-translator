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
else if (ENVIRONMENT_IS_SHELL) {
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
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
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
var EXITSTATUS = 0;
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
STATICTOP = STATIC_BASE + 13848;
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
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,200,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,216,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,58,32,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,37,112,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,67,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,37,46,48,76,102,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,84,104,117,0,0,0,0,0,37,76,102,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,224,31,0,0,30,0,0,0,114,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,31,0,0,196,0,0,0,162,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,70,0,0,0,2,1,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,32,0,0,92,0,0,0,8,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,32,0,0,92,0,0,0,20,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,32,0,0,168,0,0,0,82,0,0,0,48,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,32,0,0,230,0,0,0,186,0,0,0,48,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,32,0,0,160,0,0,0,188,0,0,0,48,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,32,0,0,252,0,0,0,138,0,0,0,48,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,33,0,0,250,0,0,0,16,0,0,0,48,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,33,0,0,158,0,0,0,106,0,0,0,48,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,33,0,0,38,0,0,0,108,0,0,0,48,0,0,0,120,0,0,0,4,0,0,0,30,0,0,0,6,0,0,0,20,0,0,0,54,0,0,0,2,0,0,0,248,255,255,255,120,33,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,33,0,0,240,0,0,0,222,0,0,0,48,0,0,0,20,0,0,0,16,0,0,0,58,0,0,0,26,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,160,33,0,0,70,0,0,0,104,0,0,0,116,0,0,0,122,0,0,0,64,0,0,0,44,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,33,0,0,76,0,0,0,190,0,0,0,48,0,0,0,48,0,0,0,40,0,0,0,8,0,0,0,40,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,33,0,0,58,0,0,0,64,0,0,0,48,0,0,0,42,0,0,0,84,0,0,0,12,0,0,0,54,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,33,0,0,244,0,0,0,2,0,0,0,48,0,0,0,24,0,0,0,30,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,34,0,0,46,0,0,0,208,0,0,0,48,0,0,0,36,0,0,0,14,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,34,0,0,210,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,34,0,0,28,0,0,0,136,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,34,0,0,6,0,0,0,174,0,0,0,48,0,0,0,8,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,34,0,0,96,0,0,0,18,0,0,0,48,0,0,0,20,0,0,0,24,0,0,0,32,0,0,0,22,0,0,0,22,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,34,0,0,40,0,0,0,24,0,0,0,48,0,0,0,46,0,0,0,44,0,0,0,36,0,0,0,38,0,0,0,28,0,0,0,42,0,0,0,34,0,0,0,52,0,0,0,50,0,0,0,48,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,34,0,0,52,0,0,0,4,0,0,0,48,0,0,0,76,0,0,0,68,0,0,0,62,0,0,0,64,0,0,0,56,0,0,0,66,0,0,0,60,0,0,0,74,0,0,0,72,0,0,0,70,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,34,0,0,72,0,0,0,90,0,0,0,48,0,0,0,14,0,0,0,12,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,34,0,0,26,0,0,0,176,0,0,0,48,0,0,0,22,0,0,0,14,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,34,0,0,228,0,0,0,128,0,0,0,48,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,62,0,0,0,4,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,0,0,180,0,0,0,60,0,0,0,48,0,0,0,2,0,0,0,8,0,0,0,8,0,0,0,106,0,0,0,96,0,0,0,18,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,35,0,0,180,0,0,0,130,0,0,0,48,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,126,0,0,0,46,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,35,0,0,180,0,0,0,150,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,74,0,0,0,6,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,35,0,0,180,0,0,0,34,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,35,0,0,56,0,0,0,154,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,35,0,0,180,0,0,0,78,0,0,0,48,0,0,0,20,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,16,0,0,0,28,0,0,0,22,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,35,0,0,0,1,0,0,36,0,0,0,48,0,0,0,2,0,0,0,4,0,0,0,18,0,0,0,34,0,0,0,8,0,0,0,6,0,0,0,26,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,35,0,0,66,0,0,0,218,0,0,0,78,0,0,0,2,0,0,0,14,0,0,0,32,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,35,0,0,180,0,0,0,84,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,74,0,0,0,6,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,35,0,0,180,0,0,0,164,0,0,0,48,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,74,0,0,0,6,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,124,0,0,0,234,0,0,0,16,0,0,0,22,0,0,0,16,0,0,0,10,0,0,0,88,0,0,0,100,0,0,0,30,0,0,0,28,0,0,0,26,0,0,0,28,0,0,0,40,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,36,0,0,10,0,0,0,116,0,0,0,58,0,0,0,38,0,0,0,28,0,0,0,6,0,0,0,50,0,0,0,86,0,0,0,18,0,0,0,6,0,0,0,10,0,0,0,24,0,0,0,16,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,36,0,0,98,0,0,0,194,0,0,0,2,0,0,0,2,0,0,0,14,0,0,0,32,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,56,36,0,0,44,0,0,0,206,0,0,0,252,255,255,255,252,255,255,255,56,36,0,0,144,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,80,36,0,0,212,0,0,0,236,0,0,0,252,255,255,255,252,255,255,255,80,36,0,0,104,0,0,0,200,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,104,36,0,0,86,0,0,0,4,1,0,0,248,255,255,255,248,255,255,255,104,36,0,0,182,0,0,0,232,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,128,36,0,0,102,0,0,0,204,0,0,0,248,255,255,255,248,255,255,255,128,36,0,0,134,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,36,0,0,202,0,0,0,184,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,36,0,0,246,0,0,0,226,0,0,0,4,0,0,0,22,0,0,0,16,0,0,0,10,0,0,0,58,0,0,0,100,0,0,0,30,0,0,0,28,0,0,0,26,0,0,0,28,0,0,0,40,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,36,0,0,152,0,0,0,178,0,0,0,36,0,0,0,38,0,0,0,28,0,0,0,6,0,0,0,90,0,0,0,86,0,0,0,18,0,0,0,6,0,0,0,10,0,0,0,24,0,0,0,16,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,220,0,0,0,142,0,0,0,48,0,0,0,68,0,0,0,118,0,0,0,26,0,0,0,80,0,0,0,6,0,0,0,30,0,0,0,52,0,0,0,20,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,37,0,0,100,0,0,0,54,0,0,0,48,0,0,0,112,0,0,0,4,0,0,0,66,0,0,0,74,0,0,0,76,0,0,0,22,0,0,0,114,0,0,0,50,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,37,0,0,224,0,0,0,112,0,0,0,48,0,0,0,14,0,0,0,60,0,0,0,46,0,0,0,42,0,0,0,78,0,0,0,52,0,0,0,92,0,0,0,56,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,37,0,0,74,0,0,0,172,0,0,0,48,0,0,0,102,0,0,0,108,0,0,0,28,0,0,0,72,0,0,0,24,0,0,0,18,0,0,0,80,0,0,0,70,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,37,0,0,88,0,0,0,68,0,0,0,62,0,0,0,22,0,0,0,16,0,0,0,10,0,0,0,88,0,0,0,100,0,0,0,30,0,0,0,72,0,0,0,82,0,0,0,12,0,0,0,40,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,37,0,0,14,0,0,0,214,0,0,0,60,0,0,0,38,0,0,0,28,0,0,0,6,0,0,0,50,0,0,0,86,0,0,0,18,0,0,0,56,0,0,0,24,0,0,0,4,0,0,0,16,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,37,0,0,248,0,0,0,198,0,0,0,62,0,0,0,148,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,40,20,0,0,0,0,0,0,56,20,0,0,0,0,0,0,72,20,0,0,216,31,0,0,0,0,0,0,0,0,0,0,88,20,0,0,216,31,0,0,0,0,0,0,0,0,0,0,104,20,0,0,216,31,0,0,0,0,0,0,0,0,0,0,128,20,0,0,32,32,0,0,0,0,0,0,0,0,0,0,152,20,0,0,216,31,0,0,0,0,0,0,0,0,0,0,168,20,0,0,0,20,0,0,192,20,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,224,36,0,0,0,0,0,0,0,20,0,0,8,21,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,232,36,0,0,0,0,0,0,0,20,0,0,80,21,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,240,36,0,0,0,0,0,0,0,20,0,0,152,21,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,248,36,0,0,0,0,0,0,0,0,0,0,224,21,0,0,40,34,0,0,0,0,0,0,0,0,0,0,16,22,0,0,40,34,0,0,0,0,0,0,0,20,0,0,64,22,0,0,0,0,0,0,1,0,0,0,32,36,0,0,0,0,0,0,0,20,0,0,88,22,0,0,0,0,0,0,1,0,0,0,32,36,0,0,0,0,0,0,0,20,0,0,112,22,0,0,0,0,0,0,1,0,0,0,40,36,0,0,0,0,0,0,0,20,0,0,136,22,0,0,0,0,0,0,1,0,0,0,40,36,0,0,0,0,0,0,0,20,0,0,160,22,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,144,37,0,0,0,8,0,0,0,20,0,0,232,22,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,144,37,0,0,0,8,0,0,0,20,0,0,48,23,0,0,0,0,0,0,3,0,0,0,96,35,0,0,2,0,0,0,48,32,0,0,2,0,0,0,192,35,0,0,0,8,0,0,0,20,0,0,120,23,0,0,0,0,0,0,3,0,0,0,96,35,0,0,2,0,0,0,48,32,0,0,2,0,0,0,200,35,0,0,0,8,0,0,0,0,0,0,192,23,0,0,96,35,0,0,0,0,0,0,0,0,0,0,216,23,0,0,96,35,0,0,0,0,0,0,0,20,0,0,240,23,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,48,36,0,0,2,0,0,0,0,20,0,0,8,24,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,48,36,0,0,2,0,0,0,0,0,0,0,32,24,0,0,0,0,0,0,56,24,0,0,152,36,0,0,0,0,0,0,0,20,0,0,88,24,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,216,32,0,0,0,0,0,0,0,20,0,0,160,24,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,240,32,0,0,0,0,0,0,0,20,0,0,232,24,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,8,33,0,0,0,0,0,0,0,20,0,0,48,25,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,32,33,0,0,0,0,0,0,0,0,0,0,120,25,0,0,96,35,0,0,0,0,0,0,0,0,0,0,144,25,0,0,96,35,0,0,0,0,0,0,0,20,0,0,168,25,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,168,36,0,0,2,0,0,0,0,20,0,0,208,25,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,168,36,0,0,2,0,0,0,0,20,0,0,248,25,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,168,36,0,0,2,0,0,0,0,20,0,0,32,26,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,168,36,0,0,2,0,0,0,0,0,0,0,72,26,0,0,24,36,0,0,0,0,0,0,0,0,0,0,96,26,0,0,96,35,0,0,0,0,0,0,0,20,0,0,120,26,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,136,37,0,0,2,0,0,0,0,20,0,0,144,26,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,136,37,0,0,2,0,0,0,0,0,0,0,168,26,0,0,0,0,0,0,208,26,0,0,0,0,0,0,248,26,0,0,176,36,0,0,0,0,0,0,0,0,0,0,24,27,0,0,64,35,0,0,0,0,0,0,0,0,0,0,64,27,0,0,64,35,0,0,0,0,0,0,0,0,0,0,104,27,0,0,0,0,0,0,160,27,0,0,0,0,0,0,216,27,0,0,0,0,0,0,248,27,0,0,0,0,0,0,24,28,0,0,0,0,0,0,56,28,0,0,0,0,0,0,88,28,0,0,0,20,0,0,112,28,0,0,0,0,0,0,1,0,0,0,184,32,0,0,3,244,255,255,0,20,0,0,160,28,0,0,0,0,0,0,1,0,0,0,200,32,0,0,3,244,255,255,0,20,0,0,208,28,0,0,0,0,0,0,1,0,0,0,184,32,0,0,3,244,255,255,0,20,0,0,0,29,0,0,0,0,0,0,1,0,0,0,200,32,0,0,3,244,255,255,0,0,0,0,48,29,0,0,0,32,0,0,0,0,0,0,0,0,0,0,72,29,0,0,0,0,0,0,96,29,0,0,16,36,0,0,0,0,0,0,0,0,0,0,120,29,0,0,0,36,0,0,0,0,0,0,0,0,0,0,152,29,0,0,8,36,0,0,0,0,0,0,0,0,0,0,184,29,0,0,0,0,0,0,216,29,0,0,0,0,0,0,248,29,0,0,0,0,0,0,24,30,0,0,0,20,0,0,56,30,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,128,37,0,0,2,0,0,0,0,20,0,0,88,30,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,128,37,0,0,2,0,0,0,0,20,0,0,120,30,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,128,37,0,0,2,0,0,0,0,20,0,0,152,30,0,0,0,0,0,0,2,0,0,0,96,35,0,0,2,0,0,0,128,37,0,0,2,0,0,0,0,0,0,0,184,30,0,0,0,0,0,0,208,30,0,0,0,0,0,0,232,30,0,0,0,0,0,0,0,31,0,0,0,36,0,0,0,0,0,0,0,0,0,0,24,31,0,0,8,36,0,0,0,0,0,0,0,0,0,0,48,31,0,0,216,37,0,0,0,0,0,0,0,0,0,0,88,31,0,0,216,37,0,0,0,0,0,0,0,0,0,0,128,31,0,0,232,37,0,0,0,0,0,0,0,0,0,0,168,31,0,0,208,31,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module.print('exit(' + status + ') called');
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  Module["_strlen"] = _strlen;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,EDOTDOT:76,EBADMSG:77,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can   access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"Connection reset by network",127:"Socket is already connected",128:"Socket is not connected",129:"Too many references",131:"Too many users",132:"Quota exceeded",133:"Stale file handle",134:"Not supported",135:"No medium (in tape drive)",138:"Illegal byte sequence",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS=undefined;
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
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
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
  var TTY={ttys:[],register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          // this wouldn't be required if the library wasn't eval'd at first...
          if (!TTY.utf8) {
            TTY.utf8 = new Runtime.UTF8Processor();
          }
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
              if (process.stdin.destroyed) {
                return undefined;
              }
              result = process.stdin.read();
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
  var MEMFS={mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        node.node_ops = MEMFS.node_ops;
        if (FS.isDir(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
          node.contents = [];
        } else if (FS.isLink(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
        } else if (FS.isChrdev(node.mode)) {
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
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
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
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
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{open:function (stream) {
          if (FS.isDir(stream.node.mode)) {
            // cache off the directory entries when open'd
            var entries = ['.', '..']
            for (var key in stream.node.contents) {
              if (!stream.node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            stream.entries = entries;
          }
        },read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.subarray) { // typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          stream.node.timestamp = Date.now();
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
        },readdir:function (stream) {
          return stream.entries;
        },allocate:function (stream, offset, length) {
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
          if (!(flags & 0x02)) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            assert(contents.buffer === buffer || contents.buffer === buffer.buffer);
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
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,nodes:[null],devices:[null],streams:[null],nextInode:1,name_table:[,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function (errno) {
        this.errno = errno;
        for (var key in ERRNO_CODES) {
          if (ERRNO_CODES[key] === errno) {
            this.code = key;
            break;
          }
        }
        this.message = ERRNO_MESSAGES[errno] + ' : ' + new Error().stack;
      },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return (parentid + hash) % FS.name_table.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.name_table[hash];
        FS.name_table[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.name_table[hash] === node) {
          FS.name_table[hash] = node.name_next;
        } else {
          var current = FS.name_table[hash];
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
        for (var node = FS.name_table[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
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
          current_path = PATH.join(current_path, parts[i]);
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
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
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
      },mayMknod:function (mode) {
        switch (mode & 0170000) {
          case 0100000:
          case 0020000:
          case 0060000:
          case 0010000:
          case 0140000:
            return 0;
          default:
            return ERRNO_CODES.EINVAL;
        }
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
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
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
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
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
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 3) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 3) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 8); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
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
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current, 0777);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = input && output ? 0777 : (input ? 0333 : 0555);
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
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
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
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
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
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = PATH.resolve(PATH.join(parent, name));
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
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp', 0777);
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev', 0777);
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', 0666, FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', 0666, FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', 0666, FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm', 0777);
        FS.mkdir('/dev/shm/tmp', 0777);
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
      },staticInit:function () {
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
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
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
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
        mode &= 4095;
        mode |= 0100000;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode &= 511 | 0001000;
        mode |= 0040000;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        mode |= 0020000;
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
          old_node.node_ops.rename(old_node, new_dir, new_name);
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
        if ((stream.flags & 3) === 0) {
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
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
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
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
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
      },readdir:function (stream) {
        if (!stream.stream_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return stream.stream_ops.readdir(stream);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
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
      },write:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
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
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
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
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.getStream(fd);
      if (!info) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (info.socket.readyState === WebSocket.CLOSING || info.socket.readyState === WebSocket.CLOSED) {
        ___setErrNo(ERRNO_CODES.ENOTCONN);
        return -1;
      } else if (info.socket.readyState === WebSocket.CONNECTING) {
        ___setErrNo(ERRNO_CODES.EAGAIN);
        return -1;
      }
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
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
      if (stream && ('socket' in stream)) {
        return _send(fildes, buf, nbyte, 0);
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
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _emscripten_worker_respond(data, size) {
      if (!inWorkerCall) throw 'not in worker call!';
      if (workerResponded) throw 'already responded!';
      workerResponded = true;
      postMessage({
        'callbackId': workerCallbackId,
        'data': data ? new Uint8Array(HEAPU8.subarray((data),(data + size))) : 0 // XXX copy to a new typed array as a workaround for chrome bug 169705
      });
    }
  Module["_memcmp"] = _memcmp;
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
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
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
  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_end_catch() {
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
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
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
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.getStream(fd);
      if (!info) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (!info.hasData()) {
        if (info.socket.readyState === WebSocket.CLOSING || info.socket.readyState === WebSocket.CLOSED) {
          // socket has closed
          return 0;
        } else {
          // else, our socket is in a valid state but truly has nothing available
          ___setErrNo(ERRNO_CODES.EAGAIN);
          return -1;
        }
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
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
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
  function _strerror_r(errnum, strerrbuf, buflen) {
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
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  var _llvm_memset_p0i8_i64=_memset;
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
      return (chr == 32) || (chr >= 9 && chr <= 13);
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
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
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
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
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
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env.___fsmu8|0;var t=env._stdout|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.min;var am=env.invoke_viiiii;var an=env.invoke_viiiiiii;var ao=env.invoke_vi;var ap=env.invoke_vii;var aq=env.invoke_iii;var ar=env.invoke_iiiiii;var as=env.invoke_ii;var at=env.invoke_iiii;var au=env.invoke_viiiiif;var av=env.invoke_viii;var aw=env.invoke_viiiiiiii;var ax=env.invoke_v;var ay=env.invoke_iiiiiiiii;var az=env.invoke_viiiiiiiii;var aA=env.invoke_viiiiiif;var aB=env.invoke_viiiiii;var aC=env.invoke_iiiii;var aD=env.invoke_viiii;var aE=env._llvm_lifetime_end;var aF=env._llvm_va_end;var aG=env._vsscanf;var aH=env._sscanf;var aI=env.___cxa_call_unexpected;var aJ=env._snprintf;var aK=env.___locale_mb_cur_max;var aL=env._fgetc;var aM=env.___errno_location;var aN=env.___cxa_throw;var aO=env._strerror;var aP=env._pthread_mutex_lock;var aQ=env._atexit;var aR=env.___cxa_pure_virtual;var aS=env._llvm_eh_exception;var aT=env.___cxa_free_exception;var aU=env._isdigit;var aV=env._pread;var aW=env._fflush;var aX=env.__addDays;var aY=env.__Z8catcloseP8_nl_catd;var aZ=env.__isLeapYear;var a_=env.__arraySum;var a$=env._sysconf;var a0=env.___cxa_rethrow;var a1=env.___setErrNo;var a2=env._fwrite;var a3=env.__Z7catgetsP8_nl_catdiiPKc;var a4=env._send;var a5=env._isxdigit;var a6=env._write;var a7=env.__scanString;var a8=env._strtoull;var a9=env._exit;var ba=env._sprintf;var bb=env.___ctype_b_loc;var bc=env.___cxa_find_matching_catch;var bd=env._freelocale;var be=env.__Z7catopenPKci;var bf=env.___cxa_allocate_exception;var bg=env._isspace;var bh=env._strtoll;var bi=env._fread;var bj=env._time;var bk=env._vasprintf;var bl=env._read;var bm=env.__formatString;var bn=env.__reallyNegative;var bo=env.___resumeException;var bp=env.___cxa_is_number_type;var bq=env._pthread_cond_broadcast;var br=env.___cxa_does_inherit;var bs=env.___ctype_toupper_loc;var bt=env.___cxa_guard_acquire;var bu=env.__ZSt9terminatev;var bv=env.___ctype_tolower_loc;var bw=env._pthread_mutex_unlock;var bx=env._recv;var by=env.__parseInt64;var bz=env.___cxa_guard_abort;var bA=env.__ZSt18uncaught_exceptionv;var bB=env._pwrite;var bC=env.__isFloat;var bD=env._vsnprintf;var bE=env._sbrk;var bF=env._strerror_r;var bG=env._newlocale;var bH=env._asprintf;var bI=env.___cxa_begin_catch;var bJ=env._emscripten_worker_respond;var bK=env.___gxx_personality_v0;var bL=env._pthread_cond_wait;var bM=env._llvm_lifetime_start;var bN=env._abort;var bO=env._uselocale;var bP=env.___cxa_guard_release;var bQ=env._ungetc;var bR=env.__exit;var bS=env._strftime;var bT=env.___cxa_end_catch;
// EMSCRIPTEN_START_FUNCS
function ca(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cb(){return i|0}function cc(a){a=a|0;i=a}function cd(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function ce(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function cf(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function cg(a){a=a|0;K=a}function ch(a){a=a|0;L=a}function ci(a){a=a|0;M=a}function cj(a){a=a|0;N=a}function ck(a){a=a|0;O=a}function cl(a){a=a|0;P=a}function cm(a){a=a|0;Q=a}function cn(a){a=a|0;R=a}function co(a){a=a|0;S=a}function cp(a){a=a|0;T=a}function cq(){c[q+8>>2]=248;c[q+12>>2]=126;c[q+16>>2]=62;c[q+20>>2]=148;c[q+24>>2]=8;c[q+28>>2]=10;c[q+32>>2]=2;c[q+36>>2]=2;c[p+8>>2]=248;c[p+12>>2]=242;c[p+16>>2]=62;c[p+20>>2]=148;c[p+24>>2]=8;c[p+28>>2]=26;c[p+32>>2]=4;c[p+36>>2]=8;c[2036]=p+8;c[2038]=p+8;c[2040]=q+8;c[2044]=q+8;c[2048]=q+8;c[2052]=q+8;c[2056]=q+8;c[2060]=p+8;c[2094]=q+8;c[2098]=q+8;c[2162]=q+8;c[2166]=q+8;c[2186]=p+8;c[2188]=q+8;c[2224]=q+8;c[2228]=q+8;c[2264]=q+8;c[2268]=q+8;c[2288]=p+8;c[2290]=p+8;c[2292]=q+8;c[2296]=q+8;c[2300]=q+8;c[2304]=p+8;c[2306]=p+8;c[2308]=p+8;c[2310]=p+8;c[2312]=p+8;c[2314]=p+8;c[2316]=p+8;c[2342]=q+8;c[2346]=p+8;c[2348]=q+8;c[2352]=q+8;c[2356]=q+8;c[2360]=p+8;c[2362]=p+8;c[2364]=p+8;c[2366]=p+8;c[2400]=p+8;c[2402]=p+8;c[2404]=p+8;c[2406]=q+8;c[2410]=q+8;c[2414]=q+8;c[2418]=q+8;c[2422]=q+8;c[2426]=q+8}function cr(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+16|0;g=f|0;h=b[d>>1]|0;j=h&31;k=j<<3|j>>>2;j=g;a[g]=k&255;l=(h&65535)>>>5&63;m=l<<2|l>>>4;a[j+1|0]=m&255;l=(h&65535)>>>11&65535;n=l<<3|l>>>2;a[j+2|0]=n&255;a[j+3|0]=-1;j=b[d+2>>1]|0;l=(j&65535)>>>11&65535;o=l<<3|l>>>2;l=g+4|0;p=l;a[p+2|0]=o&255;q=(j&65535)>>>5&63;r=q<<2|q>>>4;a[p+1|0]=r&255;q=j&31;s=q<<3|q>>>2;a[l]=s&255;a[p+3|0]=-1;if((h&65535)>(j&65535)){j=g+8|0;h=j;a[h+2|0]=(((o+(n<<1)|0)>>>0)/3|0)&255;a[h+1|0]=((((m<<1)+r|0)>>>0)/3|0)&255;a[j]=((((k<<1)+s|0)>>>0)/3|0)&255;a[h+3|0]=-1;h=g+12|0;j=h;a[j+2|0]=((((o<<1)+n|0)>>>0)/3|0)&255;a[j+1|0]=((((r<<1)+m|0)>>>0)/3|0)&255;a[h]=((((s<<1)+k|0)>>>0)/3|0)&255;a[j+3|0]=-1}else{j=g+8|0;h=j;a[h+2|0]=(o+n|0)>>>1&255;a[h+1|0]=(r+m|0)>>>1&255;a[j]=(s+k|0)>>>1&255;a[h+3|0]=-1;h=g+12|0;k=h;a[k+2|0]=0;a[k+1|0]=0;a[h]=0;a[k+3|0]=0}k=d+4|0;d=0;do{c[e+(d<<2)>>2]=c[g+(((c[k>>2]|0)>>>(d<<1>>>0)&3)<<2)>>2];d=d+1|0;}while((d|0)<16);i=f;return}function cs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0.0,D=0,E=0,F=0,G=0,H=0.0;if((c[a+12>>2]|0)==131072){if((c[a+524304>>2]|0)!=131072){d=9}}else{d=9}if((d|0)==9){g[a+1048852>>2]=-2.0;bJ(a|0,b|0)}d=a+8|0;e=c[d>>2]|0;f=a+4|0;if((e|0)==0){h=0.0;i=0;j=c[f>>2]|0;k=i*3|0;l=ag(k,j)|0;m=+(l|0);n=h/m;o=a+1048852|0;p=o;g[p>>2]=n;bJ(a|0,b|0);return}q=a+524308|0;r=a+16|0;s=c[f>>2]|0;t=0;u=0.0;v=s;w=e;e=s;while(1){if((v|0)==0){x=u;y=0;z=w;A=e}else{s=t>>>2;B=0;C=u;D=v;do{E=(ag((D|0)/4|0,s)|0)+(B>>>2)|0;F=q+(E<<3)|0;G=r+(E<<3)|0;H=+(ct(F,G)|0);if(H!=0.0){ct(F,G)|0}C=C+H;B=B+4|0;D=c[f>>2]|0;}while(B>>>0<D>>>0);x=C;y=D;z=c[d>>2]|0;A=D}B=t+4|0;if(B>>>0<z>>>0){t=B;u=x;v=y;w=z;e=A}else{h=x;i=z;j=A;break}}k=i*3|0;l=ag(k,j)|0;m=+(l|0);n=h/m;o=a+1048852|0;p=o;g[p>>2]=n;bJ(a|0,b|0);return}function ct(a,b){a=a|0;b=b|0;var c=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;c=i;i=i+128|0;e=c|0;f=c+64|0;if((kw(a|0,b|0,8)|0)==0){g=0;i=c;return g|0}cr(a,e|0);cr(b,f|0);b=0;a=0;while(1){h=e+(b<<2)|0;j=h;k=f+(b<<2)|0;l=k;m=(d[j+2|0]|0)-(d[l+2|0]|0)|0;n=(d[j+1|0]|0)-(d[l+1|0]|0)|0;l=(d[h]|0)-(d[k]|0)|0;k=ag(m,m)|0;m=ag(n,n)|0;n=k+a+m+(ag(l,l)|0)|0;l=b+1|0;if((l|0)<16){b=l;a=n}else{g=n;break}}i=c;return g|0}function cu(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;cR(12608,c[o>>2]|0,12664);c[3382]=4500;c[3384]=4520;c[3383]=0;h=c[1122]|0;d_(13528+h|0,12608);c[h+13600>>2]=0;c[h+13604>>2]=-1;h=c[t>>2]|0;d3(12512);c[3128]=4648;c[3136]=h;ih(g,12516);h=is(g,12864)|0;j=h;ii(g);c[3137]=j;c[3138]=12672;a[12556]=(b_[c[(c[h>>2]|0)+28>>2]&127](j)|0)&1;c[3316]=4404;c[3317]=4424;j=c[1098]|0;d_(13264+j|0,12512);h=j+72|0;c[13264+h>>2]=0;g=j+76|0;c[13264+g>>2]=-1;k=c[r>>2]|0;d3(12560);c[3140]=4648;c[3148]=k;ih(f,12564);k=is(f,12864)|0;l=k;ii(f);c[3149]=l;c[3150]=12680;a[12604]=(b_[c[(c[k>>2]|0)+28>>2]&127](l)|0)&1;c[3360]=4404;c[3361]=4424;d_(13440+j|0,12560);c[13440+h>>2]=0;c[13440+g>>2]=-1;l=c[(c[(c[3360]|0)-12>>2]|0)+13464>>2]|0;c[3338]=4404;c[3339]=4424;d_(13352+j|0,l);c[13352+h>>2]=0;c[13352+g>>2]=-1;c[(c[(c[3382]|0)-12>>2]|0)+13600>>2]=13264;g=(c[(c[3360]|0)-12>>2]|0)+13444|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[3360]|0)-12>>2]|0)+13512>>2]=13264;cA(12456,c[o>>2]|0,12688);c[3294]=4452;c[3296]=4472;c[3295]=0;g=c[1110]|0;d_(13176+g|0,12456);c[g+13248>>2]=0;c[g+13252>>2]=-1;g=c[t>>2]|0;ea(12360);c[3090]=4576;c[3098]=g;ih(e,12364);g=is(e,12856)|0;h=g;ii(e);c[3099]=h;c[3100]=12696;a[12404]=(b_[c[(c[g>>2]|0)+28>>2]&127](h)|0)&1;c[3224]=4356;c[3225]=4376;h=c[1086]|0;d_(12896+h|0,12360);g=h+72|0;c[12896+g>>2]=0;e=h+76|0;c[12896+e>>2]=-1;l=c[r>>2]|0;ea(12408);c[3102]=4576;c[3110]=l;ih(d,12412);l=is(d,12856)|0;j=l;ii(d);c[3111]=j;c[3112]=12704;a[12452]=(b_[c[(c[l>>2]|0)+28>>2]&127](j)|0)&1;c[3268]=4356;c[3269]=4376;d_(13072+h|0,12408);c[13072+g>>2]=0;c[13072+e>>2]=-1;j=c[(c[(c[3268]|0)-12>>2]|0)+13096>>2]|0;c[3246]=4356;c[3247]=4376;d_(12984+h|0,j);c[12984+g>>2]=0;c[12984+e>>2]=-1;c[(c[(c[3294]|0)-12>>2]|0)+13248>>2]=12896;e=(c[(c[3268]|0)-12>>2]|0)+13076|0;c[e>>2]=c[e>>2]|8192;c[(c[(c[3268]|0)-12>>2]|0)+13144>>2]=12896;i=b;return}function cv(a){a=a|0;d9(a|0);return}function cw(a){a=a|0;d9(a|0);kn(a);return}function cx(b,d){b=b|0;d=d|0;var e=0;b_[c[(c[b>>2]|0)+24>>2]&127](b)|0;e=is(d,12856)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(b_[c[(c[e>>2]|0)+28>>2]&127](d)|0)&1;return}function cy(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=bZ[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a2(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=62;break}if((l|0)==2){m=-1;n=63;break}else if((l|0)!=1){n=60;break}}if((n|0)==62){i=b;return m|0}else if((n|0)==63){i=b;return m|0}else if((n|0)==60){m=((aW(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}return 0}function cz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;L63:do{if(!k){c[g>>2]=d;if((a[b+44|0]&1)!=0){if((a2(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f|0;c[h>>2]=m;n=g+4|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=b4[c[(c[u>>2]|0)+12>>2]&31](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=78;break}if((v|0)==3){w=71;break}u=(v|0)==1;if(v>>>0>=2){l=-1;w=80;break}v=(c[h>>2]|0)-r|0;if((a2(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=81;break}if(u){t=u?c[j>>2]|0:t}else{break L63}}if((w|0)==71){if((a2(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==78){i=e;return l|0}else if((w|0)==80){i=e;return l|0}else if((w|0)==81){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function cA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;ea(b|0);c[b>>2]=4976;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;ih(g,b+4|0);e=is(g,12856)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=b_[c[(c[e>>2]|0)+24>>2]&127](d)|0;d=c[h>>2]|0;a[b+53|0]=(b_[c[(c[d>>2]|0)+28>>2]&127](d)|0)&1;if((c[j>>2]|0)<=8){ii(g);i=f;return}hq(96);ii(g);i=f;return}function cB(a){a=a|0;d9(a|0);return}function cC(a){a=a|0;d9(a|0);kn(a);return}function cD(a){a=a|0;eq(13264)|0;eq(13352)|0;eT(12896)|0;eT(12984)|0;return}function cE(a){a=a|0;return}function cF(a){a=a|0;var b=0;b=a+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;return}function cG(a){a=a|0;return c[a+4>>2]|0}function cH(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=is(d,12856)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=b_[c[(c[e>>2]|0)+24>>2]&127](d)|0;d=c[f>>2]|0;a[b+53|0]=(b_[c[(c[d>>2]|0)+28>>2]&127](d)|0)&1;if((c[g>>2]|0)<=8){return}hq(96);return}function cI(a){a=a|0;return cL(a,0)|0}function cJ(a){a=a|0;return cL(a,1)|0}function cK(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]&1)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;L114:do{if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;p=f|0;q=b4[c[(c[o>>2]|0)+12>>2]&31](o,c[b+40>>2]|0,h,h+4|0,j,p,f+8|0,g)|0;if((q|0)==3){a[p]=c[n>>2]&255;c[g>>2]=f+1}else if((q|0)==2|(q|0)==1){m=-1;i=e;return m|0}q=b+32|0;while(1){o=c[g>>2]|0;if(o>>>0<=p>>>0){break L114}r=o-1|0;c[g>>2]=r;if((bQ(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function cL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;if((a[k]&1)!=0){l=b+48|0;m=c[l>>2]|0;if(!d){n=m;i=e;return n|0}c[l>>2]=-1;a[k]=0;n=m;i=e;return n|0}m=c[b+44>>2]|0;k=(m|0)>1?m:1;L134:do{if((k|0)>0){m=b+32|0;l=0;while(1){o=aL(c[m>>2]|0)|0;if((o|0)==-1){n=-1;break}a[f+l|0]=o&255;l=l+1|0;if((l|0)>=(k|0)){break L134}}i=e;return n|0}}while(0);L141:do{if((a[b+53|0]&1)==0){l=b+40|0;m=b+36|0;o=f|0;p=g+4|0;q=b+32|0;r=k;while(1){s=c[l>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[m>>2]|0;w=f+r|0;x=b4[c[(c[t>>2]|0)+16>>2]&31](t,s,o,w,h,g,p,j)|0;if((x|0)==3){y=137;break}else if((x|0)==2){n=-1;y=147;break}else if((x|0)!=1){z=r;break L141}x=c[l>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){n=-1;y=148;break}v=aL(c[q>>2]|0)|0;if((v|0)==-1){n=-1;y=149;break}a[w]=v&255;r=r+1|0}if((y|0)==137){c[g>>2]=a[o]|0;z=r;break}else if((y|0)==147){i=e;return n|0}else if((y|0)==148){i=e;return n|0}else if((y|0)==149){i=e;return n|0}}else{c[g>>2]=a[f|0]|0;z=k}}while(0);if(d){d=c[g>>2]|0;c[b+48>>2]=d;n=d;i=e;return n|0}d=b+32|0;b=z;while(1){if((b|0)<=0){break}z=b-1|0;if((bQ(a[f+z|0]|0,c[d>>2]|0)|0)==-1){n=-1;y=152;break}else{b=z}}if((y|0)==152){i=e;return n|0}n=c[g>>2]|0;i=e;return n|0}function cM(a){a=a|0;d2(a|0);return}function cN(a){a=a|0;d2(a|0);kn(a);return}function cO(b,d){b=b|0;d=d|0;var e=0;b_[c[(c[b>>2]|0)+24>>2]&127](b)|0;e=is(d,12864)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(b_[c[(c[e>>2]|0)+28>>2]&127](d)|0)&1;return}function cP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=bZ[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a2(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=164;break}if((l|0)==2){m=-1;n=163;break}else if((l|0)!=1){n=161;break}}if((n|0)==164){i=b;return m|0}else if((n|0)==163){i=b;return m|0}else if((n|0)==161){m=((aW(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}return 0}function cQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;L179:do{if(!k){a[g]=d&255;if((a[b+44|0]&1)!=0){if((a2(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f|0;c[h>>2]=m;n=g+1|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=b4[c[(c[u>>2]|0)+12>>2]&31](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=179;break}if((v|0)==3){w=172;break}u=(v|0)==1;if(v>>>0>=2){l=-1;w=182;break}v=(c[h>>2]|0)-r|0;if((a2(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=183;break}if(u){t=u?c[j>>2]|0:t}else{break L179}}if((w|0)==172){if((a2(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==179){i=e;return l|0}else if((w|0)==182){i=e;return l|0}else if((w|0)==183){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function cR(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;d3(b|0);c[b>>2]=5048;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;ih(g,b+4|0);e=is(g,12864)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=b_[c[(c[e>>2]|0)+24>>2]&127](d)|0;d=c[h>>2]|0;a[b+53|0]=(b_[c[(c[d>>2]|0)+28>>2]&127](d)|0)&1;if((c[j>>2]|0)<=8){ii(g);i=f;return}hq(96);ii(g);i=f;return}function cS(a){a=a|0;d2(a|0);return}function cT(a){a=a|0;d2(a|0);kn(a);return}function cU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=is(d,12864)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=b_[c[(c[e>>2]|0)+24>>2]&127](d)|0;d=c[f>>2]|0;a[b+53|0]=(b_[c[(c[d>>2]|0)+28>>2]&127](d)|0)&1;if((c[g>>2]|0)<=8){return}hq(96);return}function cV(a){a=a|0;return cY(a,0)|0}function cW(a){a=a|0;return cY(a,1)|0}function cX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]&1)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;L222:do{if(l){a[h]=c[n>>2]&255;o=c[b+36>>2]|0;p=f|0;q=b4[c[(c[o>>2]|0)+12>>2]&31](o,c[b+40>>2]|0,h,h+1|0,j,p,f+8|0,g)|0;if((q|0)==3){a[p]=c[n>>2]&255;c[g>>2]=f+1}else if((q|0)==2|(q|0)==1){m=-1;i=e;return m|0}q=b+32|0;while(1){o=c[g>>2]|0;if(o>>>0<=p>>>0){break L222}r=o-1|0;c[g>>2]=r;if((bQ(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function cY(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=b+52|0;if((a[l]&1)!=0){m=b+48|0;n=c[m>>2]|0;if(!e){o=n;i=f;return o|0}c[m>>2]=-1;a[l]=0;o=n;i=f;return o|0}n=c[b+44>>2]|0;l=(n|0)>1?n:1;L242:do{if((l|0)>0){n=b+32|0;m=0;while(1){p=aL(c[n>>2]|0)|0;if((p|0)==-1){o=-1;break}a[g+m|0]=p&255;m=m+1|0;if((m|0)>=(l|0)){break L242}}i=f;return o|0}}while(0);L249:do{if((a[b+53|0]&1)==0){m=b+40|0;n=b+36|0;p=g|0;q=h+1|0;r=b+32|0;s=l;while(1){t=c[m>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[n>>2]|0;x=g+s|0;y=b4[c[(c[u>>2]|0)+16>>2]&31](u,t,p,x,j,h,q,k)|0;if((y|0)==3){z=229;break}else if((y|0)==2){o=-1;z=244;break}else if((y|0)!=1){A=s;break L249}y=c[m>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){o=-1;z=245;break}w=aL(c[r>>2]|0)|0;if((w|0)==-1){o=-1;z=240;break}a[x]=w&255;s=s+1|0}if((z|0)==229){a[h]=a[p]|0;A=s;break}else if((z|0)==240){i=f;return o|0}else if((z|0)==244){i=f;return o|0}else if((z|0)==245){i=f;return o|0}}else{a[h]=a[g|0]|0;A=l}}while(0);do{if(e){l=a[h]|0;c[b+48>>2]=l&255;B=l}else{l=b+32|0;k=A;while(1){if((k|0)<=0){z=236;break}j=k-1|0;if((bQ(d[g+j|0]|0|0,c[l>>2]|0)|0)==-1){o=-1;z=246;break}else{k=j}}if((z|0)==236){B=a[h]|0;break}else if((z|0)==246){i=f;return o|0}}}while(0);o=B&255;i=f;return o|0}function cZ(){cu(0);aQ(140,13616|0,u|0)|0;return}function c_(a){a=a|0;var b=0,d=0;b=a+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){d=0;return d|0}bW[c[(c[a>>2]|0)+8>>2]&511](a);d=1;return d|0}function c$(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=2536;d=a+4|0;if((d|0)==0){return}a=kt(b|0)|0;e=a+1|0;f=kk(a+13|0)|0;c[f+4>>2]=a;c[f>>2]=a;a=f+12|0;c[d>>2]=a;c[f+8>>2]=0;ku(a|0,b|0,e)|0;return}function c0(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2536;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;kn(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;kn(e);return}ko(d);e=a;kn(e);return}function c1(a){a=a|0;var b=0;c[a>>2]=2536;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}ko(a);return}function c2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;c[b>>2]=2472;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=kt(f|0)|0;b=d+1|0;g=kk(d+13|0)|0;c[g+4>>2]=d;c[g>>2]=d;d=g+12|0;c[e>>2]=d;c[g+8>>2]=0;ku(d|0,f|0,b)|0;return}function c3(a){a=a|0;return}function c4(a){a=a|0;return c[a+4>>2]|0}function c5(a){a=a|0;c[a>>2]=4304;return}function c6(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function c7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function c8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=2472;d=a+4|0;if((d|0)==0){return}a=kt(b|0)|0;e=a+1|0;f=kk(a+13|0)|0;c[f+4>>2]=a;c[f>>2]=a;a=f+12|0;c[d>>2]=a;c[f+8>>2]=0;ku(a|0,b|0,e)|0;return}function c9(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2472;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;kn(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;kn(e);return}ko(d);e=a;kn(e);return}function da(a){a=a|0;var b=0;c[a>>2]=2472;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}ko(a);return}function db(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2536;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;kn(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;kn(e);return}ko(d);e=a;kn(e);return}function dc(a){a=a|0;kn(a);return}function dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;b1[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function de(a,b,c){a=a|0;b=b|0;c=c|0;b=aO(c|0)|0;dr(a,b,kt(b|0)|0);return}function df(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;if((l|0)==0){m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];kv(h|0,0,12);i=g;return}n=d[h]|0;if((n&1|0)==0){o=n>>>1}else{o=c[f+4>>2]|0}if((o|0)==0){p=l}else{dt(f,1296)|0;p=c[k>>2]|0}k=c[e+4>>2]|0;b1[c[(c[k>>2]|0)+24>>2]&7](j,k,p);p=a[j]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}k=p&255;if((k&1|0)==0){r=k>>>1}else{r=c[j+4>>2]|0}dv(f,q,r)|0;dj(j);m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];kv(h|0,0,12);i=g;return}function dg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+32|0;f=b;b=i;i=i+8|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];f=e|0;g=e+16|0;dr(g,d,kt(d|0)|0);df(f,b,g);c2(a|0,f);dj(f);dj(g);c[a>>2]=4544;g=b;b=a+8|0;a=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=a;i=e;return}function dh(a){a=a|0;da(a|0);kn(a);return}function di(a){a=a|0;da(a|0);return}function dj(b){b=b|0;if((a[b]&1)==0){return}kn(c[b+8>>2]|0);return}function dk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=kt(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}dB(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}kx(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function dl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){h=d-i|0;dm(b,h,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1&255;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function dm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){dC(b,h,d-h+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}kv(l+j|0,e|0,d|0);e=j+d|0;if((a[f]&1)==0){a[f]=e<<1&255}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function dn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;if((c[a>>2]|0)==1){do{bL(9728,9720)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;bW[d&511](b);h;c[a>>2]=-1;i;bq(9728)|0;return}function dp(a){a=a|0;a=bf(8)|0;c$(a,360);c[a>>2]=2504;aN(a|0,8208,32)}function dq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if((f|0)==-1){dp(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=kj(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}ku(g|0,e|0,f)|0;a[g+f|0]=0;return}function dr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((e|0)==-1){dp(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0;ku(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=kj(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;ku(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function ds(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((d|0)==-1){dp(0)}if(d>>>0<11){a[b]=d<<1&255;f=b+1|0;kv(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}else{h=d+16&-16;i=kj(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=d;f=i;kv(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}}function dt(a,b){a=a|0;b=b|0;return dv(a,b,kt(b|0)|0)|0}function du(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b;f=a[e]|0;if((f&1)==0){g=(f&255)>>>1;h=10}else{g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((g|0)==(h|0)){dC(b,h,1,h,h,0,0);i=a[e]|0}else{i=f}if((i&1)==0){a[e]=(g<<1)+2&255;j=b+1|0;k=g+1|0;l=j+g|0;a[l]=d;m=j+k|0;a[m]=0;return}else{e=c[b+8>>2]|0;i=g+1|0;c[b+4>>2]=i;j=e;k=i;l=j+g|0;a[l]=d;m=j+k|0;a[m]=0;return}}function dv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){dB(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}i=k+j|0;ku(i|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function dw(b){b=b|0;if((a[b]&1)==0){return}kn(c[b+8>>2]|0);return}function dx(a,b){a=a|0;b=b|0;return dy(a,b,jT(b)|0)|0}function dy(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}em(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}jV(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function dz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b;f=a[e]|0;if((f&1)==0){g=(f&255)>>>1;h=1}else{g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((g|0)==(h|0)){en(b,h,1,h,h,0,0);i=a[e]|0}else{i=f}if((i&1)==0){a[e]=(g<<1)+2&255;j=b+4|0;k=g+1|0;l=j+(g<<2)|0;c[l>>2]=d;m=j+(k<<2)|0;c[m>>2]=0;return}else{e=c[b+8>>2]|0;i=g+1|0;c[b+4>>2]=i;j=e;k=i;l=j+(g<<2)|0;c[l>>2]=d;m=j+(k<<2)|0;c[m>>2]=0;return}}function dA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((d|0)==-1){dp(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{if(g>>>0>h>>>0){p=kj(k)|0}else{p=kj(k)|0}h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;ku(l|0,m|0,h)|0;if(n){kn(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function dB(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){dp(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=kj(o)|0;if((g|0)!=0){ku(e|0,k|0,g)|0}if((i|0)!=0){n=e+g|0;ku(n|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g)|0;l=k+(h+g)|0;ku(n|0,l|0,f)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}kn(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function dC(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){dp(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=kj(n)|0;if((g|0)!=0){ku(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g)|0;i=j+(h+g)|0;ku(m|0,i|0,f)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}kn(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function dD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741822){dp(0)}if(e>>>0<2){a[b]=e<<1&255;f=b+4|0;g=jU(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=kj(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=jU(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function dE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741822){dp(0)}if(d>>>0<2){a[b]=d<<1&255;f=b+4|0;g=jW(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=kj(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=jW(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function dF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(d>>>0>1073741822){dp(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;if(f>>>0>g>>>0){o=kj(d)|0}else{o=kj(d)|0}d=h&1;if(d<<24>>24==0){p=b+4|0}else{p=c[b+8>>2]|0}k=o;l=p;m=d<<24>>24!=0;n=1}d=k;k=h&255;if((k&1|0)==0){q=k>>>1}else{q=c[b+4>>2]|0}jU(d,l,q+1|0)|0;if(m){kn(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=d;return}else{a[e]=i<<1&255;return}}function dG(a,b){a=a|0;b=b|0;return}function dH(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function dI(a){a=a|0;return 0}function dJ(a){a=a|0;return 0}function dK(a){a=a|0;return-1|0}function dL(a,b){a=a|0;b=b|0;return-1|0}function dM(a,b){a=a|0;b=b|0;return-1|0}function dN(a,b){a=a|0;b=b|0;return}function dO(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function dP(a){a=a|0;return 0}function dQ(a){a=a|0;return 0}function dR(a){a=a|0;return-1|0}function dS(a,b){a=a|0;b=b|0;return-1|0}function dT(a,b){a=a|0;b=b|0;return-1|0}function dU(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function dV(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function dW(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function dX(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function dY(a){a=a|0;ep(a|0);return}function dZ(a,b){a=a|0;b=b|0;ih(a,b+28|0);return}function d_(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;kv(a+32|0,0,40);if((b|0)==0){return}ir(b);return}function d$(a){a=a|0;ep(a|0);return}function d0(a){a=a|0;c[a>>2]=4232;ii(a+4|0);kn(a);return}function d1(a){a=a|0;c[a>>2]=4232;ii(a+4|0);return}function d2(a){a=a|0;c[a>>2]=4232;ii(a+4|0);return}function d3(a){a=a|0;c[a>>2]=4232;ir(a+4|0);kv(a+8|0,0,24);return}function d4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=b_[c[(c[f>>2]|0)+40>>2]&127](b)|0;if((k|0)==-1){g=d;m=670;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=669;break}}if((m|0)==670){return g|0}else if((m|0)==669){return g|0}return 0}function d5(a){a=a|0;var b=0,e=0;if((b_[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function d6(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((bY[c[(c[g>>2]|0)+52>>2]&31](b,d[l]|0)|0)==-1){h=k;n=685;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=684;break}}if((n|0)==684){return h|0}else if((n|0)==685){return h|0}return 0}function d7(a){a=a|0;c[a>>2]=4160;ii(a+4|0);kn(a);return}function d8(a){a=a|0;c[a>>2]=4160;ii(a+4|0);return}function d9(a){a=a|0;c[a>>2]=4160;ii(a+4|0);return}function ea(a){a=a|0;c[a>>2]=4160;ir(a+4|0);kv(a+8|0,0,24);return}function eb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=b_[c[(c[e>>2]|0)+40>>2]&127](a)|0;if((j|0)==-1){f=b;l=700;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=698;break}}if((l|0)==700){return f|0}else if((l|0)==698){return f|0}return 0}function ec(a){a=a|0;var b=0,d=0;if((b_[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function ed(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((bY[c[(c[e>>2]|0)+52>>2]&31](a,c[j>>2]|0)|0)==-1){f=i;l=713;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=714;break}}if((l|0)==713){return f|0}else if((l|0)==714){return f|0}return 0}function ee(a){a=a|0;ep(a+8|0);kn(a);return}function ef(a){a=a|0;ep(a+8|0);return}function eg(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;ep(b+(d+8)|0);kn(b+d|0);return}function eh(a){a=a|0;ep(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function ei(a){a=a|0;ep(a+8|0);kn(a);return}function ej(a){a=a|0;ep(a+8|0);return}function ek(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;ep(b+(d+8)|0);kn(b+d|0);return}function el(a){a=a|0;ep(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function em(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741821-d|0)>>>0<e>>>0){dp(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=kj(o<<2)|0;if((g|0)!=0){jU(e,k,g)|0}if((i|0)!=0){n=e+(g<<2)|0;jU(n,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g<<2)|0;l=k+(h+g<<2)|0;jU(n,l,f)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}kn(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function en(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741821-d|0)>>>0<e>>>0){dp(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=kj(n<<2)|0;if((g|0)!=0){jU(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g<<2)|0;i=j+(h+g<<2)|0;jU(m,i,f)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}kn(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function eo(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=bf(16)|0;do{if((a[13736]|0)==0){if((bt(13736)|0)==0){break}c5(11816);c[2954]=4e3;aQ(66,11816,u|0)|0}}while(0);b=kA(11816,0,32)|0;d=K;c[f>>2]=b&0|1;c[f+4>>2]=d|0;dg(e,f,1304);c[e>>2]=3184;aN(e|0,8752,28)}function ep(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=3160;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;if((b|0)!=0){f=b;do{f=f-1|0;b1[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);}while((f|0)!=0)}ii(a+28|0);kf(c[d>>2]|0);kf(c[e>>2]|0);kf(c[a+48>>2]|0);kf(c[a+60>>2]|0);return}function eq(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){eq(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((b_[c[(c[k>>2]|0)+24>>2]&127](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;eo(h+k|0,c[h+(k+16)>>2]|1)}}while(0);eU(e);i=d;return b|0}function er(a){a=a|0;return 1416|0}function es(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L902:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=807;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=805;break}if(l<<24>>24<k<<24>>24){i=1;j=804;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L902}else{b=k;h=l}}if((j|0)==807){return i|0}else if((j|0)==804){return i|0}else if((j|0)==805){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function et(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function eu(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L921:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=823;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=822;break}if((l|0)<(k|0)){i=1;j=821;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L921}else{a=k;h=l}}if((j|0)==822){return i|0}else if((j|0)==823){return i|0}else if((j|0)==821){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function ev(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function ew(a){a=a|0;ep(a+4|0);kn(a);return}function ex(a){a=a|0;ep(a+4|0);return}function ey(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;ep(b+(d+4)|0);kn(b+d|0);return}function ez(a){a=a|0;ep(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function eA(a){a=a|0;ep(a+4|0);kn(a);return}function eB(a){a=a|0;ep(a+4|0);return}function eC(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;ep(b+(d+4)|0);kn(b+d|0);return}function eD(a){a=a|0;ep(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function eE(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){dr(a,1640,35);return}else{de(a,b|0,c);return}}function eF(a){a=a|0;c3(a|0);return}function eG(a){a=a|0;di(a|0);kn(a);return}function eH(a){a=a|0;di(a|0);return}function eI(a){a=a|0;ep(a);kn(a);return}function eJ(a){a=a|0;c3(a|0);kn(a);return}function eK(a){a=a|0;cE(a|0);kn(a);return}function eL(a){a=a|0;cE(a|0);return}function eM(a){a=a|0;cE(a|0);return}function eN(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;do{if((g|0)==-1){dp(b);h=855}else{if(g>>>0>=11){h=855;break}a[b]=g<<1&255;i=b+1|0}}while(0);if((h|0)==855){h=g+16&-16;j=kj(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=g;i=j}if((e|0)==(f|0)){k=i;a[k]=0;return}j=f+(-d|0)|0;d=i;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=i+j|0;a[k]=0;return}function eO(a){a=a|0;cE(a|0);kn(a);return}function eP(a){a=a|0;cE(a|0);return}function eQ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741822){dp(b)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=kj(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function eR(a){a=a|0;cE(a|0);kn(a);return}function eS(a){a=a|0;cE(a|0);return}function eT(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){eT(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((b_[c[(c[k>>2]|0)+24>>2]&127](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;eo(h+k|0,c[h+(k+16)>>2]|1)}}while(0);eV(e);i=d;return b|0}function eU(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bA()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((b_[c[(c[e>>2]|0)+24>>2]&127](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;eo(d+b|0,c[d+(b+16)>>2]|1);return}function eV(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bA()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((b_[c[(c[e>>2]|0)+24>>2]&127](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;eo(d+b|0,c[d+(b+16)>>2]|1);return}function eW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=ke(m)|0;if((o|0)!=0){p=o;q=o;break}ks();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){z=r;break}if((b_[c[(c[r>>2]|0)+36>>2]&127](r)|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){A=z;B=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((b_[c[(c[m>>2]|0)+36>>2]&127](m)|0)!=-1){C=m;break}c[b>>2]=0;C=0}else{C=m}}while(0);A=c[u>>2]|0;B=C}D=(B|0)==0;if(!((r^D)&(s|0)!=0)){break}m=c[A+12>>2]|0;if((m|0)==(c[A+16>>2]|0)){E=(b_[c[(c[A>>2]|0)+36>>2]&127](A)|0)&255}else{E=a[m]|0}if(k){F=E}else{F=bY[c[(c[e>>2]|0)+12>>2]&31](h,E)|0}do{if(n){G=x;H=s}else{m=t+1|0;L1090:do{if(k){y=s;o=x;w=p;v=0;I=f;while(1){do{if((a[w]|0)==1){J=I;if((a[J]&1)==0){K=I+1|0}else{K=c[I+8>>2]|0}if(F<<24>>24!=(a[K+t|0]|0)){a[w]=0;L=v;M=o;N=y-1|0;break}O=d[J]|0;if((O&1|0)==0){P=O>>>1}else{P=c[I+4>>2]|0}if((P|0)!=(m|0)){L=1;M=o;N=y;break}a[w]=2;L=1;M=o+1|0;N=y-1|0}else{L=v;M=o;N=y}}while(0);O=I+12|0;if((O|0)==(g|0)){Q=N;R=M;S=L;break L1090}y=N;o=M;w=w+1|0;v=L;I=O}}else{I=s;v=x;w=p;o=0;y=f;while(1){do{if((a[w]|0)==1){O=y;if((a[O]&1)==0){T=y+1|0}else{T=c[y+8>>2]|0}if(F<<24>>24!=(bY[c[(c[e>>2]|0)+12>>2]&31](h,a[T+t|0]|0)|0)<<24>>24){a[w]=0;U=o;V=v;W=I-1|0;break}J=d[O]|0;if((J&1|0)==0){X=J>>>1}else{X=c[y+4>>2]|0}if((X|0)!=(m|0)){U=1;V=v;W=I;break}a[w]=2;U=1;V=v+1|0;W=I-1|0}else{U=o;V=v;W=I}}while(0);J=y+12|0;if((J|0)==(g|0)){Q=W;R=V;S=U;break L1090}I=W;v=V;w=w+1|0;o=U;y=J}}}while(0);if(!S){G=R;H=Q;break}m=c[u>>2]|0;y=m+12|0;o=c[y>>2]|0;if((o|0)==(c[m+16>>2]|0)){w=c[(c[m>>2]|0)+40>>2]|0;b_[w&127](m)|0}else{c[y>>2]=o+1}if((R+Q|0)>>>0<2|n){G=R;H=Q;break}o=t+1|0;y=R;m=p;w=f;while(1){do{if((a[m]|0)==2){v=d[w]|0;if((v&1|0)==0){Y=v>>>1}else{Y=c[w+4>>2]|0}if((Y|0)==(o|0)){Z=y;break}a[m]=0;Z=y-1|0}else{Z=y}}while(0);v=w+12|0;if((v|0)==(g|0)){G=Z;H=Q;break}else{y=Z;m=m+1|0;w=v}}}}while(0);t=t+1|0;x=G;s=H}do{if((A|0)==0){_=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){_=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1){c[u>>2]=0;_=0;break}else{_=c[u>>2]|0;break}}}while(0);u=(_|0)==0;do{if(D){$=1023}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(u){break}else{$=1025;break}}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[b>>2]=0;$=1023;break}else{if(u^(B|0)==0){break}else{$=1025;break}}}}while(0);if(($|0)==1023){if(u){$=1025}}if(($|0)==1025){c[j>>2]=c[j>>2]|2}L1169:do{if(n){$=1030}else{u=f;B=p;while(1){if((a[B]|0)==2){aa=u;break L1169}b=u+12|0;if((b|0)==(g|0)){$=1030;break L1169}u=b;B=B+1|0}}}while(0);if(($|0)==1030){c[j>>2]=c[j>>2]|4;aa=g}if((q|0)==0){i=l;return aa|0}kf(q);i=l;return aa|0}function eX(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];bV[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==0){a[j]=0}else if((w|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}dZ(r,g);q=r|0;r=c[q>>2]|0;if((c[3292]|0)!=-1){c[m>>2]=13168;c[m+4>>2]=12;c[m+8>>2]=0;dn(13168,m,94)}m=(c[3293]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;c_(n)|0;dZ(s,g);n=s|0;p=c[n>>2]|0;if((c[3196]|0)!=-1){c[l>>2]=12784;c[l+4>>2]=12;c[l+8>>2]=0;dn(12784,l,94)}d=(c[3197]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;c_(z)|0;z=t|0;A=x;bX[c[(c[A>>2]|0)+24>>2]&127](z,y);bX[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(eW(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];dj(t+12|0);dj(t|0);i=k;return}}while(0);o=bf(4)|0;jX(o);aN(o|0,8176,132)}}while(0);k=bf(4)|0;jX(k);aN(k|0,8176,132)}function eY(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[9736+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);f=a[9736+i|0]|0;c[g>>2]=n+1;a[n]=f;c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function eZ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n-4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L1276:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}k=(e-h|0)>1?h+1|0:h;j=n+4|0;q=a[k]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(j>>>0<b>>>0){h=k;n=j;m=r;i=s}else{t=r;u=s;break L1276}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}function e_(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==64){v=8}else if((u|0)==8){v=16}else{v=10}u=l|0;e0(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=a[m]|0;m=w;w=c[h>>2]|0;L1304:while(1){do{if((w|0)==0){B=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){B=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&127](w)|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);C=(B|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=1150}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){F=D;G=0;break}else{H=m;I=D;J=0;break L1304}}if((b_[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=1150;break}else{K=(D|0)==0;if(C^K){F=D;G=K;break}else{H=m;I=D;J=K;break L1304}}}}while(0);if((E|0)==1150){E=0;if(C){H=m;I=0;J=1;break}else{F=0;G=1}}D=d[p]|0;K=(D&1|0)==0;if(((c[q>>2]|0)-m|0)==((K?D>>>1:c[z>>2]|0)|0)){if(K){L=D>>>1;M=D>>>1}else{D=c[z>>2]|0;L=D;M=D}dl(o,L<<1,0);if((a[p]&1)==0){N=10}else{N=(c[g>>2]&-2)-1|0}dl(o,N,0);if((a[p]&1)==0){O=x}else{O=c[y>>2]|0}c[q>>2]=O+M;P=O}else{P=m}D=B+12|0;K=c[D>>2]|0;Q=B+16|0;if((K|0)==(c[Q>>2]|0)){R=(b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)&255}else{R=a[K]|0}if((eY(R,v,P,q,t,A,n,l,s,u)|0)!=0){H=P;I=F;J=G;break}K=c[D>>2]|0;if((K|0)==(c[Q>>2]|0)){Q=c[(c[B>>2]|0)+40>>2]|0;b_[Q&127](B)|0;m=P;w=B;continue}else{c[D>>2]=K+1;m=P;w=B;continue}}w=d[n]|0;if((w&1|0)==0){S=w>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}P=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=P}}while(0);c[k>>2]=e$(H,c[q>>2]|0,j,v)|0;eZ(n,l,c[s>>2]|0,j);do{if(C){T=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){T=B;break}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){T=B;break}c[h>>2]=0;T=0}}while(0);h=(T|0)==0;L1364:do{if(J){E=1191}else{do{if((c[I+12>>2]|0)==(c[I+16>>2]|0)){if((b_[c[(c[I>>2]|0)+36>>2]&127](I)|0)!=-1){break}c[f>>2]=0;E=1191;break L1364}}while(0);if(!(h^(I|0)==0)){break}U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}}while(0);do{if((E|0)==1191){if(h){break}U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}function e$(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=bh(b|0,h|0,f|0,c[2952]|0)|0;f=K;b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((b|0)==34|((f|0)<(d|0)|(f|0)==(d|0)&l>>>0<-2147483648>>>0)|((f|0)>(h|0)|(f|0)==(h|0)&l>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(f|0)>(e|0)|(f|0)==(e|0)&l>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function e0(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;dZ(k,d);d=k|0;k=c[d>>2]|0;if((c[3292]|0)!=-1){c[j>>2]=13168;c[j+4>>2]=12;c[j+8>>2]=0;dn(13168,j,94)}j=(c[3293]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+32>>2]|0;b8[o&15](n,9736,9762,e)|0;n=c[d>>2]|0;if((c[3196]|0)!=-1){c[h>>2]=12784;c[h+4>>2]=12;c[h+8>>2]=0;dn(12784,h,94)}o=(c[3197]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;a[f]=b_[c[(c[p>>2]|0)+16>>2]&127](q)|0;bX[c[(c[p>>2]|0)+20>>2]&127](b,q);q=c[d>>2]|0;c_(q)|0;i=g;return}}while(0);o=bf(4)|0;jX(o);aN(o|0,8176,132)}}while(0);g=bf(4)|0;jX(g);aN(g|0,8176,132)}function e1(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=l|0;e0(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=a[m]|0;m=w;w=c[h>>2]|0;L1430:while(1){do{if((w|0)==0){B=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){B=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&127](w)|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);C=(B|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=1254}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){F=D;G=0;break}else{H=m;I=D;J=0;break L1430}}if((b_[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=1254;break}else{L=(D|0)==0;if(C^L){F=D;G=L;break}else{H=m;I=D;J=L;break L1430}}}}while(0);if((E|0)==1254){E=0;if(C){H=m;I=0;J=1;break}else{F=0;G=1}}D=d[p]|0;L=(D&1|0)==0;if(((c[q>>2]|0)-m|0)==((L?D>>>1:c[z>>2]|0)|0)){if(L){M=D>>>1;N=D>>>1}else{D=c[z>>2]|0;M=D;N=D}dl(o,M<<1,0);if((a[p]&1)==0){O=10}else{O=(c[g>>2]&-2)-1|0}dl(o,O,0);if((a[p]&1)==0){P=x}else{P=c[y>>2]|0}c[q>>2]=P+N;Q=P}else{Q=m}D=B+12|0;L=c[D>>2]|0;R=B+16|0;if((L|0)==(c[R>>2]|0)){S=(b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)&255}else{S=a[L]|0}if((eY(S,v,Q,q,t,A,n,l,s,u)|0)!=0){H=Q;I=F;J=G;break}L=c[D>>2]|0;if((L|0)==(c[R>>2]|0)){R=c[(c[B>>2]|0)+40>>2]|0;b_[R&127](B)|0;m=Q;w=B;continue}else{c[D>>2]=L+1;m=Q;w=B;continue}}w=d[n]|0;if((w&1|0)==0){T=w>>>1}else{T=c[n+4>>2]|0}do{if((T|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}Q=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=Q}}while(0);t=e2(H,c[q>>2]|0,j,v)|0;c[k>>2]=t;c[k+4>>2]=K;eZ(n,l,c[s>>2]|0,j);do{if(C){U=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){U=B;break}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){U=B;break}c[h>>2]=0;U=0}}while(0);h=(U|0)==0;L1490:do{if(J){E=1295}else{do{if((c[I+12>>2]|0)==(c[I+16>>2]|0)){if((b_[c[(c[I>>2]|0)+36>>2]&127](I)|0)!=-1){break}c[f>>2]=0;E=1295;break L1490}}while(0);if(!(h^(I|0)==0)){break}V=b|0;c[V>>2]=U;dj(o);dj(n);i=e;return}}while(0);do{if((E|0)==1295){if(h){break}V=b|0;c[V>>2]=U;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;V=b|0;c[V>>2]=U;dj(o);dj(n);i=e;return}function e2(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}l=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);m=bh(b|0,h|0,f|0,c[2952]|0)|0;f=K;b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}if((b|0)!=34){j=f;k=m;i=g;return(K=j,k)|0}c[e>>2]=4;e=0;b=(f|0)>(e|0)|(f|0)==(e|0)&m>>>0>0>>>0;j=b?2147483647:-2147483648;k=b?-1:0;i=g;return(K=j,k)|0}function e3(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;f=i;i=i+72|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=c[j+4>>2]&74;if((v|0)==8){w=16}else if((v|0)==0){w=0}else if((v|0)==64){w=8}else{w=10}v=m|0;e0(o,j,v,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){m=j+1|0;x=m;y=m;z=p+8|0}else{m=p+8|0;x=c[m>>2]|0;y=j+1|0;z=m}c[r>>2]=x;m=s|0;c[t>>2]=m;c[u>>2]=0;j=g|0;g=h|0;h=p|0;A=p+4|0;B=a[n]|0;n=x;x=c[j>>2]|0;L1535:while(1){do{if((x|0)==0){C=0}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){C=x;break}if((b_[c[(c[x>>2]|0)+36>>2]&127](x)|0)!=-1){C=x;break}c[j>>2]=0;C=0}}while(0);D=(C|0)==0;E=c[g>>2]|0;do{if((E|0)==0){F=1340}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(D){G=E;H=0;break}else{I=n;J=E;K=0;break L1535}}if((b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1){c[g>>2]=0;F=1340;break}else{L=(E|0)==0;if(D^L){G=E;H=L;break}else{I=n;J=E;K=L;break L1535}}}}while(0);if((F|0)==1340){F=0;if(D){I=n;J=0;K=1;break}else{G=0;H=1}}E=d[q]|0;L=(E&1|0)==0;if(((c[r>>2]|0)-n|0)==((L?E>>>1:c[A>>2]|0)|0)){if(L){M=E>>>1;N=E>>>1}else{E=c[A>>2]|0;M=E;N=E}dl(p,M<<1,0);if((a[q]&1)==0){O=10}else{O=(c[h>>2]&-2)-1|0}dl(p,O,0);if((a[q]&1)==0){P=y}else{P=c[z>>2]|0}c[r>>2]=P+N;Q=P}else{Q=n}E=C+12|0;L=c[E>>2]|0;R=C+16|0;if((L|0)==(c[R>>2]|0)){S=(b_[c[(c[C>>2]|0)+36>>2]&127](C)|0)&255}else{S=a[L]|0}if((eY(S,w,Q,r,u,B,o,m,t,v)|0)!=0){I=Q;J=G;K=H;break}L=c[E>>2]|0;if((L|0)==(c[R>>2]|0)){R=c[(c[C>>2]|0)+40>>2]|0;b_[R&127](C)|0;n=Q;x=C;continue}else{c[E>>2]=L+1;n=Q;x=C;continue}}x=d[o]|0;if((x&1|0)==0){T=x>>>1}else{T=c[o+4>>2]|0}do{if((T|0)!=0){x=c[t>>2]|0;if((x-s|0)>=160){break}Q=c[u>>2]|0;c[t>>2]=x+4;c[x>>2]=Q}}while(0);b[l>>1]=e4(I,c[r>>2]|0,k,w)|0;eZ(o,m,c[t>>2]|0,k);do{if(D){U=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){U=C;break}if((b_[c[(c[C>>2]|0)+36>>2]&127](C)|0)!=-1){U=C;break}c[j>>2]=0;U=0}}while(0);j=(U|0)==0;L1595:do{if(K){F=1381}else{do{if((c[J+12>>2]|0)==(c[J+16>>2]|0)){if((b_[c[(c[J>>2]|0)+36>>2]&127](J)|0)!=-1){break}c[g>>2]=0;F=1381;break L1595}}while(0);if(!(j^(J|0)==0)){break}V=e|0;c[V>>2]=U;dj(p);dj(o);i=f;return}}while(0);do{if((F|0)==1381){if(j){break}V=e|0;c[V>>2]=U;dj(p);dj(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;V=e|0;c[V>>2]=U;dj(p);dj(o);i=f;return}function e4(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=a8(b|0,h|0,f|0,c[2952]|0)|0;f=K;b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l&65535;i=g;return j|0}return 0}function e5(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=l|0;e0(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=a[m]|0;m=w;w=c[h>>2]|0;L1645:while(1){do{if((w|0)==0){B=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){B=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&127](w)|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);C=(B|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=1430}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){F=D;G=0;break}else{H=m;I=D;J=0;break L1645}}if((b_[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=1430;break}else{K=(D|0)==0;if(C^K){F=D;G=K;break}else{H=m;I=D;J=K;break L1645}}}}while(0);if((E|0)==1430){E=0;if(C){H=m;I=0;J=1;break}else{F=0;G=1}}D=d[p]|0;K=(D&1|0)==0;if(((c[q>>2]|0)-m|0)==((K?D>>>1:c[z>>2]|0)|0)){if(K){L=D>>>1;M=D>>>1}else{D=c[z>>2]|0;L=D;M=D}dl(o,L<<1,0);if((a[p]&1)==0){N=10}else{N=(c[g>>2]&-2)-1|0}dl(o,N,0);if((a[p]&1)==0){O=x}else{O=c[y>>2]|0}c[q>>2]=O+M;P=O}else{P=m}D=B+12|0;K=c[D>>2]|0;Q=B+16|0;if((K|0)==(c[Q>>2]|0)){R=(b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)&255}else{R=a[K]|0}if((eY(R,v,P,q,t,A,n,l,s,u)|0)!=0){H=P;I=F;J=G;break}K=c[D>>2]|0;if((K|0)==(c[Q>>2]|0)){Q=c[(c[B>>2]|0)+40>>2]|0;b_[Q&127](B)|0;m=P;w=B;continue}else{c[D>>2]=K+1;m=P;w=B;continue}}w=d[n]|0;if((w&1|0)==0){S=w>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}P=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=P}}while(0);c[k>>2]=e6(H,c[q>>2]|0,j,v)|0;eZ(n,l,c[s>>2]|0,j);do{if(C){T=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){T=B;break}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){T=B;break}c[h>>2]=0;T=0}}while(0);h=(T|0)==0;L1705:do{if(J){E=1471}else{do{if((c[I+12>>2]|0)==(c[I+16>>2]|0)){if((b_[c[(c[I>>2]|0)+36>>2]&127](I)|0)!=-1){break}c[f>>2]=0;E=1471;break L1705}}while(0);if(!(h^(I|0)==0)){break}U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}}while(0);do{if((E|0)==1471){if(h){break}U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}function e6(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=a8(b|0,h|0,f|0,c[2952]|0)|0;f=K;b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function e7(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=l|0;e0(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=a[m]|0;m=w;w=c[h>>2]|0;L1755:while(1){do{if((w|0)==0){B=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){B=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&127](w)|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);C=(B|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=1520}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){F=D;G=0;break}else{H=m;I=D;J=0;break L1755}}if((b_[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=1520;break}else{K=(D|0)==0;if(C^K){F=D;G=K;break}else{H=m;I=D;J=K;break L1755}}}}while(0);if((E|0)==1520){E=0;if(C){H=m;I=0;J=1;break}else{F=0;G=1}}D=d[p]|0;K=(D&1|0)==0;if(((c[q>>2]|0)-m|0)==((K?D>>>1:c[z>>2]|0)|0)){if(K){L=D>>>1;M=D>>>1}else{D=c[z>>2]|0;L=D;M=D}dl(o,L<<1,0);if((a[p]&1)==0){N=10}else{N=(c[g>>2]&-2)-1|0}dl(o,N,0);if((a[p]&1)==0){O=x}else{O=c[y>>2]|0}c[q>>2]=O+M;P=O}else{P=m}D=B+12|0;K=c[D>>2]|0;Q=B+16|0;if((K|0)==(c[Q>>2]|0)){R=(b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)&255}else{R=a[K]|0}if((eY(R,v,P,q,t,A,n,l,s,u)|0)!=0){H=P;I=F;J=G;break}K=c[D>>2]|0;if((K|0)==(c[Q>>2]|0)){Q=c[(c[B>>2]|0)+40>>2]|0;b_[Q&127](B)|0;m=P;w=B;continue}else{c[D>>2]=K+1;m=P;w=B;continue}}w=d[n]|0;if((w&1|0)==0){S=w>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}P=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=P}}while(0);c[k>>2]=e8(H,c[q>>2]|0,j,v)|0;eZ(n,l,c[s>>2]|0,j);do{if(C){T=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){T=B;break}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){T=B;break}c[h>>2]=0;T=0}}while(0);h=(T|0)==0;L1815:do{if(J){E=1561}else{do{if((c[I+12>>2]|0)==(c[I+16>>2]|0)){if((b_[c[(c[I>>2]|0)+36>>2]&127](I)|0)!=-1){break}c[f>>2]=0;E=1561;break L1815}}while(0);if(!(h^(I|0)==0)){break}U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}}while(0);do{if((E|0)==1561){if(h){break}U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b|0;c[U>>2]=T;dj(o);dj(n);i=e;return}function e8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=a8(b|0,h|0,f|0,c[2952]|0)|0;f=K;b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function e9(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=l|0;e0(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=a[m]|0;m=w;w=c[h>>2]|0;L1865:while(1){do{if((w|0)==0){B=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){B=w;break}if((b_[c[(c[w>>2]|0)+36>>2]&127](w)|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);C=(B|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=1610}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){F=D;G=0;break}else{H=m;I=D;J=0;break L1865}}if((b_[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=1610;break}else{L=(D|0)==0;if(C^L){F=D;G=L;break}else{H=m;I=D;J=L;break L1865}}}}while(0);if((E|0)==1610){E=0;if(C){H=m;I=0;J=1;break}else{F=0;G=1}}D=d[p]|0;L=(D&1|0)==0;if(((c[q>>2]|0)-m|0)==((L?D>>>1:c[z>>2]|0)|0)){if(L){M=D>>>1;N=D>>>1}else{D=c[z>>2]|0;M=D;N=D}dl(o,M<<1,0);if((a[p]&1)==0){O=10}else{O=(c[g>>2]&-2)-1|0}dl(o,O,0);if((a[p]&1)==0){P=x}else{P=c[y>>2]|0}c[q>>2]=P+N;Q=P}else{Q=m}D=B+12|0;L=c[D>>2]|0;R=B+16|0;if((L|0)==(c[R>>2]|0)){S=(b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)&255}else{S=a[L]|0}if((eY(S,v,Q,q,t,A,n,l,s,u)|0)!=0){H=Q;I=F;J=G;break}L=c[D>>2]|0;if((L|0)==(c[R>>2]|0)){R=c[(c[B>>2]|0)+40>>2]|0;b_[R&127](B)|0;m=Q;w=B;continue}else{c[D>>2]=L+1;m=Q;w=B;continue}}w=d[n]|0;if((w&1|0)==0){T=w>>>1}else{T=c[n+4>>2]|0}do{if((T|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}Q=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=Q}}while(0);t=fa(H,c[q>>2]|0,j,v)|0;c[k>>2]=t;c[k+4>>2]=K;eZ(n,l,c[s>>2]|0,j);do{if(C){U=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){U=B;break}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){U=B;break}c[h>>2]=0;U=0}}while(0);h=(U|0)==0;L1925:do{if(J){E=1651}else{do{if((c[I+12>>2]|0)==(c[I+16>>2]|0)){if((b_[c[(c[I>>2]|0)+36>>2]&127](I)|0)!=-1){break}c[f>>2]=0;E=1651;break L1925}}while(0);if(!(h^(I|0)==0)){break}V=b|0;c[V>>2]=U;dj(o);dj(n);i=e;return}}while(0);do{if((E|0)==1651){if(h){break}V=b|0;c[V>>2]=U;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;V=b|0;c[V>>2]=U;dj(o);dj(n);i=e;return}function fa(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);m=a8(b|0,h|0,f|0,c[2952]|0)|0;n=K;o=c[(aM()|0)>>2]|0;if((o|0)==0){c[(aM()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)!=34){j=n;k=m;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(K=j,k)|0}function fb(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=i;i=i+1|0;i=i+7>>3<<3;w=i;i=i+1|0;i=i+7>>3<<3;x=e|0;fg(o,j,x,m,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){y=j+1|0;z=y;A=y;B=p+8|0}else{y=p+8|0;z=c[y>>2]|0;A=j+1|0;B=y}c[r>>2]=z;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;j=f|0;f=h|0;h=p|0;C=p+4|0;D=a[m]|0;m=a[n]|0;n=z;z=c[j>>2]|0;L1964:while(1){do{if((z|0)==0){E=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){E=z;break}if((b_[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1){E=z;break}c[j>>2]=0;E=0}}while(0);F=(E|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=1690}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(F){I=G;J=0;break}else{K=n;L=G;M=0;break L1964}}if((b_[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;H=1690;break}else{N=(G|0)==0;if(F^N){I=G;J=N;break}else{K=n;L=G;M=N;break L1964}}}}while(0);if((H|0)==1690){H=0;if(F){K=n;L=0;M=1;break}else{I=0;J=1}}G=d[q]|0;N=(G&1|0)==0;if(((c[r>>2]|0)-n|0)==((N?G>>>1:c[C>>2]|0)|0)){if(N){O=G>>>1;P=G>>>1}else{G=c[C>>2]|0;O=G;P=G}dl(p,O<<1,0);if((a[q]&1)==0){Q=10}else{Q=(c[h>>2]&-2)-1|0}dl(p,Q,0);if((a[q]&1)==0){R=A}else{R=c[B>>2]|0}c[r>>2]=R+P;S=R}else{S=n}G=E+12|0;N=c[G>>2]|0;T=E+16|0;if((N|0)==(c[T>>2]|0)){U=(b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)&255}else{U=a[N]|0}if((fc(U,v,w,S,r,D,m,o,y,t,u,x)|0)!=0){K=S;L=I;M=J;break}N=c[G>>2]|0;if((N|0)==(c[T>>2]|0)){T=c[(c[E>>2]|0)+40>>2]|0;b_[T&127](E)|0;n=S;z=E;continue}else{c[G>>2]=N+1;n=S;z=E;continue}}z=d[o]|0;if((z&1|0)==0){V=z>>>1}else{V=c[o+4>>2]|0}do{if((V|0)!=0){if((a[v]&1)==0){break}z=c[t>>2]|0;if((z-s|0)>=160){break}S=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=S}}while(0);g[l>>2]=+fd(K,c[r>>2]|0,k);eZ(o,y,c[t>>2]|0,k);do{if(F){W=0}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){W=E;break}if((b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)!=-1){W=E;break}c[j>>2]=0;W=0}}while(0);j=(W|0)==0;L2025:do{if(M){H=1732}else{do{if((c[L+12>>2]|0)==(c[L+16>>2]|0)){if((b_[c[(c[L>>2]|0)+36>>2]&127](L)|0)!=-1){break}c[f>>2]=0;H=1732;break L2025}}while(0);if(!(j^(L|0)==0)){break}X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}}while(0);do{if((H|0)==1732){if(j){break}X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}function fc(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0;if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){q=i>>>1}else{q=c[k+4>>2]|0}if((q|0)==0){p=0;return p|0}q=c[m>>2]|0;if((q-l|0)>=160){p=0;return p|0}i=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=i;p=0;return p|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){r=i>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}i=c[m>>2]|0;if((i-l|0)>=160){p=0;return p|0}q=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=q;c[n>>2]=0;p=0;return p|0}}while(0);r=o+32|0;j=o;while(1){if((j|0)==(r|0)){s=r;break}if((a[j]|0)==b<<24>>24){s=j;break}else{j=j+1|0}}j=s-o|0;if((j|0)>31){p=-1;return p|0}o=a[9736+j|0]|0;if((j|0)==25|(j|0)==24){s=c[h>>2]|0;do{if((s|0)!=(g|0)){if((a[s-1|0]&95|0)==(a[f]&127|0)){break}else{p=-1}return p|0}}while(0);c[h>>2]=s+1;a[s]=o;p=0;return p|0}else if((j|0)==22|(j|0)==23){a[f]=80;s=c[h>>2]|0;c[h>>2]=s+1;a[s]=o;p=0;return p|0}else{s=a[f]|0;do{if((o&95|0)==(s<<24>>24|0)){a[f]=s|-128;if((a[e]&1)==0){break}a[e]=0;g=d[k]|0;if((g&1|0)==0){t=g>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}g=c[m>>2]|0;if((g-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=b}}while(0);m=c[h>>2]|0;c[h>>2]=m+1;a[m]=o;if((j|0)>21){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}return 0}function fd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0.0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);k=+kr(b,g,c[2952]|0);b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)==34){c[e>>2]=4}h=k;i=f;return+h}function fe(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=i;i=i+1|0;i=i+7>>3<<3;w=i;i=i+1|0;i=i+7>>3<<3;x=e|0;fg(o,j,x,m,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){y=j+1|0;z=y;A=y;B=p+8|0}else{y=p+8|0;z=c[y>>2]|0;A=j+1|0;B=y}c[r>>2]=z;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;j=f|0;f=g|0;g=p|0;C=p+4|0;D=a[m]|0;m=a[n]|0;n=z;z=c[j>>2]|0;L2129:while(1){do{if((z|0)==0){E=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){E=z;break}if((b_[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1){E=z;break}c[j>>2]=0;E=0}}while(0);F=(E|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=1822}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(F){I=G;J=0;break}else{K=n;L=G;M=0;break L2129}}if((b_[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;H=1822;break}else{N=(G|0)==0;if(F^N){I=G;J=N;break}else{K=n;L=G;M=N;break L2129}}}}while(0);if((H|0)==1822){H=0;if(F){K=n;L=0;M=1;break}else{I=0;J=1}}G=d[q]|0;N=(G&1|0)==0;if(((c[r>>2]|0)-n|0)==((N?G>>>1:c[C>>2]|0)|0)){if(N){O=G>>>1;P=G>>>1}else{G=c[C>>2]|0;O=G;P=G}dl(p,O<<1,0);if((a[q]&1)==0){Q=10}else{Q=(c[g>>2]&-2)-1|0}dl(p,Q,0);if((a[q]&1)==0){R=A}else{R=c[B>>2]|0}c[r>>2]=R+P;S=R}else{S=n}G=E+12|0;N=c[G>>2]|0;T=E+16|0;if((N|0)==(c[T>>2]|0)){U=(b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)&255}else{U=a[N]|0}if((fc(U,v,w,S,r,D,m,o,y,t,u,x)|0)!=0){K=S;L=I;M=J;break}N=c[G>>2]|0;if((N|0)==(c[T>>2]|0)){T=c[(c[E>>2]|0)+40>>2]|0;b_[T&127](E)|0;n=S;z=E;continue}else{c[G>>2]=N+1;n=S;z=E;continue}}z=d[o]|0;if((z&1|0)==0){V=z>>>1}else{V=c[o+4>>2]|0}do{if((V|0)!=0){if((a[v]&1)==0){break}z=c[t>>2]|0;if((z-s|0)>=160){break}S=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=S}}while(0);h[l>>3]=+ff(K,c[r>>2]|0,k);eZ(o,y,c[t>>2]|0,k);do{if(F){W=0}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){W=E;break}if((b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)!=-1){W=E;break}c[j>>2]=0;W=0}}while(0);j=(W|0)==0;L2190:do{if(M){H=1864}else{do{if((c[L+12>>2]|0)==(c[L+16>>2]|0)){if((b_[c[(c[L>>2]|0)+36>>2]&127](L)|0)!=-1){break}c[f>>2]=0;H=1864;break L2190}}while(0);if(!(j^(L|0)==0)){break}X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}}while(0);do{if((H|0)==1864){if(j){break}X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}function ff(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0.0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);k=+kr(b,g,c[2952]|0);b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=k;i=f;return+h}c[e>>2]=4;h=k;i=f;return+h}function fg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;dZ(l,d);d=l|0;l=c[d>>2]|0;if((c[3292]|0)!=-1){c[k>>2]=13168;c[k+4>>2]=12;c[k+8>>2]=0;dn(13168,k,94)}k=(c[3293]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;b8[p&15](o,9736,9768,e)|0;o=c[d>>2]|0;if((c[3196]|0)!=-1){c[j>>2]=12784;c[j+4>>2]=12;c[j+8>>2]=0;dn(12784,j,94)}p=(c[3197]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;a[f]=b_[c[(c[s>>2]|0)+12>>2]&127](r)|0;a[g]=b_[c[(c[s>>2]|0)+16>>2]&127](r)|0;bX[c[(c[q>>2]|0)+20>>2]&127](b,r);r=c[d>>2]|0;c_(r)|0;i=h;return}}while(0);p=bf(4)|0;jX(p);aN(p|0,8176,132)}}while(0);h=bf(4)|0;jX(h);aN(h|0,8176,132)}function fh(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=i;i=i+1|0;i=i+7>>3<<3;w=i;i=i+1|0;i=i+7>>3<<3;x=e|0;fg(o,j,x,m,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){y=j+1|0;z=y;A=y;B=p+8|0}else{y=p+8|0;z=c[y>>2]|0;A=j+1|0;B=y}c[r>>2]=z;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;j=f|0;f=g|0;g=p|0;C=p+4|0;D=a[m]|0;m=a[n]|0;n=z;z=c[j>>2]|0;L2251:while(1){do{if((z|0)==0){E=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){E=z;break}if((b_[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1){E=z;break}c[j>>2]=0;E=0}}while(0);F=(E|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=1923}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(F){I=G;J=0;break}else{K=n;L=G;M=0;break L2251}}if((b_[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;H=1923;break}else{N=(G|0)==0;if(F^N){I=G;J=N;break}else{K=n;L=G;M=N;break L2251}}}}while(0);if((H|0)==1923){H=0;if(F){K=n;L=0;M=1;break}else{I=0;J=1}}G=d[q]|0;N=(G&1|0)==0;if(((c[r>>2]|0)-n|0)==((N?G>>>1:c[C>>2]|0)|0)){if(N){O=G>>>1;P=G>>>1}else{G=c[C>>2]|0;O=G;P=G}dl(p,O<<1,0);if((a[q]&1)==0){Q=10}else{Q=(c[g>>2]&-2)-1|0}dl(p,Q,0);if((a[q]&1)==0){R=A}else{R=c[B>>2]|0}c[r>>2]=R+P;S=R}else{S=n}G=E+12|0;N=c[G>>2]|0;T=E+16|0;if((N|0)==(c[T>>2]|0)){U=(b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)&255}else{U=a[N]|0}if((fc(U,v,w,S,r,D,m,o,y,t,u,x)|0)!=0){K=S;L=I;M=J;break}N=c[G>>2]|0;if((N|0)==(c[T>>2]|0)){T=c[(c[E>>2]|0)+40>>2]|0;b_[T&127](E)|0;n=S;z=E;continue}else{c[G>>2]=N+1;n=S;z=E;continue}}z=d[o]|0;if((z&1|0)==0){V=z>>>1}else{V=c[o+4>>2]|0}do{if((V|0)!=0){if((a[v]&1)==0){break}z=c[t>>2]|0;if((z-s|0)>=160){break}S=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=S}}while(0);h[l>>3]=+fi(K,c[r>>2]|0,k);eZ(o,y,c[t>>2]|0,k);do{if(F){W=0}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){W=E;break}if((b_[c[(c[E>>2]|0)+36>>2]&127](E)|0)!=-1){W=E;break}c[j>>2]=0;W=0}}while(0);j=(W|0)==0;L2312:do{if(M){H=1965}else{do{if((c[L+12>>2]|0)==(c[L+16>>2]|0)){if((b_[c[(c[L>>2]|0)+36>>2]&127](L)|0)!=-1){break}c[f>>2]=0;H=1965;break L2312}}while(0);if(!(j^(L|0)==0)){break}X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}}while(0);do{if((H|0)==1965){if(j){break}X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;X=b|0;c[X>>2]=W;dj(p);dj(o);i=e;return}function fi(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0.0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=c[(aM()|0)>>2]|0;c[(aM()|0)>>2]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);k=+kr(b,g,c[2952]|0);b=c[(aM()|0)>>2]|0;if((b|0)==0){c[(aM()|0)>>2]=j}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=k;i=f;return+h}c[e>>2]=4;h=k;i=f;return+h}function fj(a){a=a|0;cE(a|0);kn(a);return}function fk(a){a=a|0;cE(a|0);return}function fl(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+48|0;o=i;i=i+4|0;i=i+7>>3<<3;p=i;i=i+12|0;i=i+7>>3<<3;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;kv(n|0,0,12);u=p;dZ(o,h);h=o|0;o=c[h>>2]|0;if((c[3292]|0)!=-1){c[l>>2]=13168;c[l+4>>2]=12;c[l+8>>2]=0;dn(13168,l,94)}l=(c[3293]|0)-1|0;v=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-v>>2>>>0>l>>>0){w=c[v+(l<<2)>>2]|0;if((w|0)==0){break}x=w;y=m|0;z=c[(c[w>>2]|0)+32>>2]|0;b8[z&15](x,9736,9762,y)|0;x=c[h>>2]|0;c_(x)|0;kv(u|0,0,12);x=p;dl(p,10,0);if((a[u]&1)==0){z=x+1|0;A=z;B=z;C=p+8|0}else{z=p+8|0;A=c[z>>2]|0;B=x+1|0;C=z}c[q>>2]=A;z=r|0;c[s>>2]=z;c[t>>2]=0;x=f|0;w=g|0;D=p|0;E=p+4|0;F=A;G=c[x>>2]|0;L2362:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}if((b_[c[(c[G>>2]|0)+36>>2]&127](G)|0)!=-1){H=G;break}c[x>>2]=0;H=0}}while(0);I=(H|0)==0;J=c[w>>2]|0;do{if((J|0)==0){K=2016}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(I){break}else{L=F;break L2362}}if((b_[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1){c[w>>2]=0;K=2016;break}else{if(I^(J|0)==0){break}else{L=F;break L2362}}}}while(0);if((K|0)==2016){K=0;if(I){L=F;break}}J=d[u]|0;M=(J&1|0)==0;if(((c[q>>2]|0)-F|0)==((M?J>>>1:c[E>>2]|0)|0)){if(M){N=J>>>1;O=J>>>1}else{J=c[E>>2]|0;N=J;O=J}dl(p,N<<1,0);if((a[u]&1)==0){P=10}else{P=(c[D>>2]&-2)-1|0}dl(p,P,0);if((a[u]&1)==0){Q=B}else{Q=c[C>>2]|0}c[q>>2]=Q+O;R=Q}else{R=F}J=H+12|0;M=c[J>>2]|0;S=H+16|0;if((M|0)==(c[S>>2]|0)){T=(b_[c[(c[H>>2]|0)+36>>2]&127](H)|0)&255}else{T=a[M]|0}if((eY(T,16,R,q,t,0,n,z,s,y)|0)!=0){L=R;break}M=c[J>>2]|0;if((M|0)==(c[S>>2]|0)){S=c[(c[H>>2]|0)+40>>2]|0;b_[S&127](H)|0;F=R;G=H;continue}else{c[J>>2]=M+1;F=R;G=H;continue}}a[L+3|0]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);G=fm(L,c[2952]|0,1320,(F=i,i=i+8|0,c[F>>2]=k,F)|0)|0;i=F;if((G|0)!=1){c[j>>2]=4}G=c[x>>2]|0;do{if((G|0)==0){U=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){U=G;break}if((b_[c[(c[G>>2]|0)+36>>2]&127](G)|0)!=-1){U=G;break}c[x>>2]=0;U=0}}while(0);x=(U|0)==0;G=c[w>>2]|0;do{if((G|0)==0){K=2061}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!x){break}V=b|0;c[V>>2]=U;dj(p);dj(n);i=e;return}if((b_[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[w>>2]=0;K=2061;break}if(!(x^(G|0)==0)){break}V=b|0;c[V>>2]=U;dj(p);dj(n);i=e;return}}while(0);do{if((K|0)==2061){if(x){break}V=b|0;c[V>>2]=U;dj(p);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;V=b|0;c[V>>2]=U;dj(p);dj(n);i=e;return}}while(0);e=bf(4)|0;jX(e);aN(e|0,8176,132)}function fm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bO(b|0)|0;b=aG(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bO(h|0)|0;i=f;return b|0}function fn(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=ke(m)|0;if((o|0)!=0){p=o;q=o;break}ks();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){A=b_[c[(c[r>>2]|0)+36>>2]&127](r)|0}else{A=c[m>>2]|0}if((A|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){B=z;C=0}else{y=c[m+12>>2]|0;if((y|0)==(c[m+16>>2]|0)){D=b_[c[(c[m>>2]|0)+36>>2]&127](m)|0}else{D=c[y>>2]|0}if((D|0)==-1){c[b>>2]=0;E=0}else{E=m}B=c[u>>2]|0;C=E}F=(C|0)==0;if(!((r^F)&(s|0)!=0)){break}r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){G=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{G=c[r>>2]|0}if(k){H=G}else{H=bY[c[(c[e>>2]|0)+28>>2]&31](h,G)|0}do{if(n){I=x;J=s}else{r=t+1|0;L2494:do{if(k){m=s;y=x;o=p;w=0;v=f;while(1){do{if((a[o]|0)==1){K=v;if((a[K]&1)==0){L=v+4|0}else{L=c[v+8>>2]|0}if((H|0)!=(c[L+(t<<2)>>2]|0)){a[o]=0;M=w;N=y;O=m-1|0;break}P=d[K]|0;if((P&1|0)==0){Q=P>>>1}else{Q=c[v+4>>2]|0}if((Q|0)!=(r|0)){M=1;N=y;O=m;break}a[o]=2;M=1;N=y+1|0;O=m-1|0}else{M=w;N=y;O=m}}while(0);P=v+12|0;if((P|0)==(g|0)){R=O;S=N;T=M;break L2494}m=O;y=N;o=o+1|0;w=M;v=P}}else{v=s;w=x;o=p;y=0;m=f;while(1){do{if((a[o]|0)==1){P=m;if((a[P]&1)==0){U=m+4|0}else{U=c[m+8>>2]|0}if((H|0)!=(bY[c[(c[e>>2]|0)+28>>2]&31](h,c[U+(t<<2)>>2]|0)|0)){a[o]=0;V=y;W=w;X=v-1|0;break}K=d[P]|0;if((K&1|0)==0){Y=K>>>1}else{Y=c[m+4>>2]|0}if((Y|0)!=(r|0)){V=1;W=w;X=v;break}a[o]=2;V=1;W=w+1|0;X=v-1|0}else{V=y;W=w;X=v}}while(0);K=m+12|0;if((K|0)==(g|0)){R=X;S=W;T=V;break L2494}v=X;w=W;o=o+1|0;y=V;m=K}}}while(0);if(!T){I=S;J=R;break}r=c[u>>2]|0;m=r+12|0;y=c[m>>2]|0;if((y|0)==(c[r+16>>2]|0)){o=c[(c[r>>2]|0)+40>>2]|0;b_[o&127](r)|0}else{c[m>>2]=y+4}if((S+R|0)>>>0<2|n){I=S;J=R;break}y=t+1|0;m=S;r=p;o=f;while(1){do{if((a[r]|0)==2){w=d[o]|0;if((w&1|0)==0){Z=w>>>1}else{Z=c[o+4>>2]|0}if((Z|0)==(y|0)){_=m;break}a[r]=0;_=m-1|0}else{_=m}}while(0);w=o+12|0;if((w|0)==(g|0)){I=_;J=R;break}else{m=_;r=r+1|0;o=w}}}}while(0);t=t+1|0;x=I;s=J}do{if((B|0)==0){$=1}else{J=c[B+12>>2]|0;if((J|0)==(c[B+16>>2]|0)){aa=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{aa=c[J>>2]|0}if((aa|0)==-1){c[u>>2]=0;$=1;break}else{$=(c[u>>2]|0)==0;break}}}while(0);do{if(F){ab=2170}else{u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){ac=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{ac=c[u>>2]|0}if((ac|0)==-1){c[b>>2]=0;ab=2170;break}else{if($^(C|0)==0){break}else{ab=2172;break}}}}while(0);if((ab|0)==2170){if($){ab=2172}}if((ab|0)==2172){c[j>>2]=c[j>>2]|2}L2575:do{if(n){ab=2177}else{$=f;C=p;while(1){if((a[C]|0)==2){ad=$;break L2575}b=$+12|0;if((b|0)==(g|0)){ab=2177;break L2575}$=b;C=C+1|0}}}while(0);if((ab|0)==2177){c[j>>2]=c[j>>2]|4;ad=g}if((q|0)==0){i=l;return ad|0}kf(q);i=l;return ad|0}function fo(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];bV[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}dZ(r,g);q=r|0;r=c[q>>2]|0;if((c[3290]|0)!=-1){c[m>>2]=13160;c[m+4>>2]=12;c[m+8>>2]=0;dn(13160,m,94)}m=(c[3291]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;c_(n)|0;dZ(s,g);n=s|0;p=c[n>>2]|0;if((c[3194]|0)!=-1){c[l>>2]=12776;c[l+4>>2]=12;c[l+8>>2]=0;dn(12776,l,94)}d=(c[3195]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;c_(z)|0;z=t|0;A=x;bX[c[(c[A>>2]|0)+24>>2]&127](z,y);bX[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(fn(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];dw(t+12|0);dw(t|0);i=k;return}}while(0);o=bf(4)|0;jX(o);aN(o|0,8176,132)}}while(0);k=bf(4)|0;jX(k);aN(k|0,8176,132)}function fp(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[9736+m|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}else if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}}while(0);e=a[9736+m|0]|0;c[g>>2]=n+1;a[n]=e;c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function fq(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==64){v=8}else if((u|0)==8){v=16}else{v=10}u=l|0;fr(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=c[m>>2]|0;m=w;w=c[h>>2]|0;L2671:while(1){do{if((w|0)==0){B=0}else{C=c[w+12>>2]|0;if((C|0)==(c[w+16>>2]|0)){D=b_[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{D=c[C>>2]|0}if((D|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);E=(B|0)==0;C=c[f>>2]|0;do{if((C|0)==0){F=2269}else{G=c[C+12>>2]|0;if((G|0)==(c[C+16>>2]|0)){H=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=2269;break}else{G=(C|0)==0;if(E^G){I=C;J=G;break}else{K=m;L=C;M=G;break L2671}}}}while(0);if((F|0)==2269){F=0;if(E){K=m;L=0;M=1;break}else{I=0;J=1}}C=d[p]|0;G=(C&1|0)==0;if(((c[q>>2]|0)-m|0)==((G?C>>>1:c[z>>2]|0)|0)){if(G){N=C>>>1;O=C>>>1}else{C=c[z>>2]|0;N=C;O=C}dl(o,N<<1,0);if((a[p]&1)==0){P=10}else{P=(c[g>>2]&-2)-1|0}dl(o,P,0);if((a[p]&1)==0){Q=x}else{Q=c[y>>2]|0}c[q>>2]=Q+O;R=Q}else{R=m}C=B+12|0;G=c[C>>2]|0;S=B+16|0;if((G|0)==(c[S>>2]|0)){T=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{T=c[G>>2]|0}if((fp(T,v,R,q,t,A,n,l,s,u)|0)!=0){K=R;L=I;M=J;break}G=c[C>>2]|0;if((G|0)==(c[S>>2]|0)){S=c[(c[B>>2]|0)+40>>2]|0;b_[S&127](B)|0;m=R;w=B;continue}else{c[C>>2]=G+4;m=R;w=B;continue}}w=d[n]|0;if((w&1|0)==0){U=w>>>1}else{U=c[n+4>>2]|0}do{if((U|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}R=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=R}}while(0);c[k>>2]=e$(K,c[q>>2]|0,j,v)|0;eZ(n,l,c[s>>2]|0,j);do{if(E){V=0}else{s=c[B+12>>2]|0;if((s|0)==(c[B+16>>2]|0)){W=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{W=c[s>>2]|0}if((W|0)!=-1){V=B;break}c[h>>2]=0;V=0}}while(0);h=(V|0)==0;do{if(M){F=2311}else{B=c[L+12>>2]|0;if((B|0)==(c[L+16>>2]|0)){X=b_[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{X=c[B>>2]|0}if((X|0)==-1){c[f>>2]=0;F=2311;break}if(!(h^(L|0)==0)){break}Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}}while(0);do{if((F|0)==2311){if(h){break}Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}function fr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;dZ(j,b);b=j|0;j=c[b>>2]|0;if((c[3290]|0)!=-1){c[h>>2]=13160;c[h+4>>2]=12;c[h+8>>2]=0;dn(13160,h,94)}h=(c[3291]|0)-1|0;k=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-k>>2>>>0>h>>>0){l=c[k+(h<<2)>>2]|0;if((l|0)==0){break}m=l;n=c[(c[l>>2]|0)+48>>2]|0;b8[n&15](m,9736,9762,d)|0;m=c[b>>2]|0;if((c[3194]|0)!=-1){c[g>>2]=12776;c[g+4>>2]=12;c[g+8>>2]=0;dn(12776,g,94)}n=(c[3195]|0)-1|0;l=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-l>>2>>>0>n>>>0){o=c[l+(n<<2)>>2]|0;if((o|0)==0){break}p=o;c[e>>2]=b_[c[(c[o>>2]|0)+16>>2]&127](p)|0;bX[c[(c[o>>2]|0)+20>>2]&127](a,p);p=c[b>>2]|0;c_(p)|0;i=f;return}}while(0);n=bf(4)|0;jX(n);aN(n|0,8176,132)}}while(0);f=bf(4)|0;jX(f);aN(f|0,8176,132)}function fs(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==64){v=8}else if((u|0)==8){v=16}else{v=10}u=l|0;fr(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=c[m>>2]|0;m=w;w=c[h>>2]|0;L2780:while(1){do{if((w|0)==0){B=0}else{C=c[w+12>>2]|0;if((C|0)==(c[w+16>>2]|0)){D=b_[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{D=c[C>>2]|0}if((D|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);E=(B|0)==0;C=c[f>>2]|0;do{if((C|0)==0){F=2356}else{G=c[C+12>>2]|0;if((G|0)==(c[C+16>>2]|0)){H=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=2356;break}else{G=(C|0)==0;if(E^G){I=C;J=G;break}else{L=m;M=C;N=G;break L2780}}}}while(0);if((F|0)==2356){F=0;if(E){L=m;M=0;N=1;break}else{I=0;J=1}}C=d[p]|0;G=(C&1|0)==0;if(((c[q>>2]|0)-m|0)==((G?C>>>1:c[z>>2]|0)|0)){if(G){O=C>>>1;P=C>>>1}else{C=c[z>>2]|0;O=C;P=C}dl(o,O<<1,0);if((a[p]&1)==0){Q=10}else{Q=(c[g>>2]&-2)-1|0}dl(o,Q,0);if((a[p]&1)==0){R=x}else{R=c[y>>2]|0}c[q>>2]=R+P;S=R}else{S=m}C=B+12|0;G=c[C>>2]|0;T=B+16|0;if((G|0)==(c[T>>2]|0)){U=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{U=c[G>>2]|0}if((fp(U,v,S,q,t,A,n,l,s,u)|0)!=0){L=S;M=I;N=J;break}G=c[C>>2]|0;if((G|0)==(c[T>>2]|0)){T=c[(c[B>>2]|0)+40>>2]|0;b_[T&127](B)|0;m=S;w=B;continue}else{c[C>>2]=G+4;m=S;w=B;continue}}w=d[n]|0;if((w&1|0)==0){V=w>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}S=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=S}}while(0);t=e2(L,c[q>>2]|0,j,v)|0;c[k>>2]=t;c[k+4>>2]=K;eZ(n,l,c[s>>2]|0,j);do{if(E){W=0}else{s=c[B+12>>2]|0;if((s|0)==(c[B+16>>2]|0)){X=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{X=c[s>>2]|0}if((X|0)!=-1){W=B;break}c[h>>2]=0;W=0}}while(0);h=(W|0)==0;do{if(N){F=2398}else{B=c[M+12>>2]|0;if((B|0)==(c[M+16>>2]|0)){Y=b_[c[(c[M>>2]|0)+36>>2]&127](M)|0}else{Y=c[B>>2]|0}if((Y|0)==-1){c[f>>2]=0;F=2398;break}if(!(h^(M|0)==0)){break}Z=b|0;c[Z>>2]=W;dj(o);dj(n);i=e;return}}while(0);do{if((F|0)==2398){if(h){break}Z=b|0;c[Z>>2]=W;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Z=b|0;c[Z>>2]=W;dj(o);dj(n);i=e;return}function ft(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;f=i;i=i+144|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+104|0;o=f+112|0;p=f+128|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=c[j+4>>2]&74;if((v|0)==8){w=16}else if((v|0)==0){w=0}else if((v|0)==64){w=8}else{w=10}v=m|0;fr(o,j,v,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){m=j+1|0;x=m;y=m;z=p+8|0}else{m=p+8|0;x=c[m>>2]|0;y=j+1|0;z=m}c[r>>2]=x;m=s|0;c[t>>2]=m;c[u>>2]=0;j=g|0;g=h|0;h=p|0;A=p+4|0;B=c[n>>2]|0;n=x;x=c[j>>2]|0;L2869:while(1){do{if((x|0)==0){C=0}else{D=c[x+12>>2]|0;if((D|0)==(c[x+16>>2]|0)){E=b_[c[(c[x>>2]|0)+36>>2]&127](x)|0}else{E=c[D>>2]|0}if((E|0)!=-1){C=x;break}c[j>>2]=0;C=0}}while(0);F=(C|0)==0;D=c[g>>2]|0;do{if((D|0)==0){G=2426}else{H=c[D+12>>2]|0;if((H|0)==(c[D+16>>2]|0)){I=b_[c[(c[D>>2]|0)+36>>2]&127](D)|0}else{I=c[H>>2]|0}if((I|0)==-1){c[g>>2]=0;G=2426;break}else{H=(D|0)==0;if(F^H){J=D;K=H;break}else{L=n;M=D;N=H;break L2869}}}}while(0);if((G|0)==2426){G=0;if(F){L=n;M=0;N=1;break}else{J=0;K=1}}D=d[q]|0;H=(D&1|0)==0;if(((c[r>>2]|0)-n|0)==((H?D>>>1:c[A>>2]|0)|0)){if(H){O=D>>>1;P=D>>>1}else{D=c[A>>2]|0;O=D;P=D}dl(p,O<<1,0);if((a[q]&1)==0){Q=10}else{Q=(c[h>>2]&-2)-1|0}dl(p,Q,0);if((a[q]&1)==0){R=y}else{R=c[z>>2]|0}c[r>>2]=R+P;S=R}else{S=n}D=C+12|0;H=c[D>>2]|0;T=C+16|0;if((H|0)==(c[T>>2]|0)){U=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{U=c[H>>2]|0}if((fp(U,w,S,r,u,B,o,m,t,v)|0)!=0){L=S;M=J;N=K;break}H=c[D>>2]|0;if((H|0)==(c[T>>2]|0)){T=c[(c[C>>2]|0)+40>>2]|0;b_[T&127](C)|0;n=S;x=C;continue}else{c[D>>2]=H+4;n=S;x=C;continue}}x=d[o]|0;if((x&1|0)==0){V=x>>>1}else{V=c[o+4>>2]|0}do{if((V|0)!=0){x=c[t>>2]|0;if((x-s|0)>=160){break}S=c[u>>2]|0;c[t>>2]=x+4;c[x>>2]=S}}while(0);b[l>>1]=e4(L,c[r>>2]|0,k,w)|0;eZ(o,m,c[t>>2]|0,k);do{if(F){W=0}else{t=c[C+12>>2]|0;if((t|0)==(c[C+16>>2]|0)){X=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{X=c[t>>2]|0}if((X|0)!=-1){W=C;break}c[j>>2]=0;W=0}}while(0);j=(W|0)==0;do{if(N){G=2468}else{C=c[M+12>>2]|0;if((C|0)==(c[M+16>>2]|0)){Y=b_[c[(c[M>>2]|0)+36>>2]&127](M)|0}else{Y=c[C>>2]|0}if((Y|0)==-1){c[g>>2]=0;G=2468;break}if(!(j^(M|0)==0)){break}Z=e|0;c[Z>>2]=W;dj(p);dj(o);i=f;return}}while(0);do{if((G|0)==2468){if(j){break}Z=e|0;c[Z>>2]=W;dj(p);dj(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;Z=e|0;c[Z>>2]=W;dj(p);dj(o);i=f;return}function fu(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==64){v=8}else if((u|0)==8){v=16}else{v=10}u=l|0;fr(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=c[m>>2]|0;m=w;w=c[h>>2]|0;L2958:while(1){do{if((w|0)==0){B=0}else{C=c[w+12>>2]|0;if((C|0)==(c[w+16>>2]|0)){D=b_[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{D=c[C>>2]|0}if((D|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);E=(B|0)==0;C=c[f>>2]|0;do{if((C|0)==0){F=2496}else{G=c[C+12>>2]|0;if((G|0)==(c[C+16>>2]|0)){H=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=2496;break}else{G=(C|0)==0;if(E^G){I=C;J=G;break}else{K=m;L=C;M=G;break L2958}}}}while(0);if((F|0)==2496){F=0;if(E){K=m;L=0;M=1;break}else{I=0;J=1}}C=d[p]|0;G=(C&1|0)==0;if(((c[q>>2]|0)-m|0)==((G?C>>>1:c[z>>2]|0)|0)){if(G){N=C>>>1;O=C>>>1}else{C=c[z>>2]|0;N=C;O=C}dl(o,N<<1,0);if((a[p]&1)==0){P=10}else{P=(c[g>>2]&-2)-1|0}dl(o,P,0);if((a[p]&1)==0){Q=x}else{Q=c[y>>2]|0}c[q>>2]=Q+O;R=Q}else{R=m}C=B+12|0;G=c[C>>2]|0;S=B+16|0;if((G|0)==(c[S>>2]|0)){T=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{T=c[G>>2]|0}if((fp(T,v,R,q,t,A,n,l,s,u)|0)!=0){K=R;L=I;M=J;break}G=c[C>>2]|0;if((G|0)==(c[S>>2]|0)){S=c[(c[B>>2]|0)+40>>2]|0;b_[S&127](B)|0;m=R;w=B;continue}else{c[C>>2]=G+4;m=R;w=B;continue}}w=d[n]|0;if((w&1|0)==0){U=w>>>1}else{U=c[n+4>>2]|0}do{if((U|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}R=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=R}}while(0);c[k>>2]=e6(K,c[q>>2]|0,j,v)|0;eZ(n,l,c[s>>2]|0,j);do{if(E){V=0}else{s=c[B+12>>2]|0;if((s|0)==(c[B+16>>2]|0)){W=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{W=c[s>>2]|0}if((W|0)!=-1){V=B;break}c[h>>2]=0;V=0}}while(0);h=(V|0)==0;do{if(M){F=2538}else{B=c[L+12>>2]|0;if((B|0)==(c[L+16>>2]|0)){X=b_[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{X=c[B>>2]|0}if((X|0)==-1){c[f>>2]=0;F=2538;break}if(!(h^(L|0)==0)){break}Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}}while(0);do{if((F|0)==2538){if(h){break}Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}function fv(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=l|0;fr(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=c[m>>2]|0;m=w;w=c[h>>2]|0;L3047:while(1){do{if((w|0)==0){B=0}else{C=c[w+12>>2]|0;if((C|0)==(c[w+16>>2]|0)){D=b_[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{D=c[C>>2]|0}if((D|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);E=(B|0)==0;C=c[f>>2]|0;do{if((C|0)==0){F=2566}else{G=c[C+12>>2]|0;if((G|0)==(c[C+16>>2]|0)){H=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=2566;break}else{G=(C|0)==0;if(E^G){I=C;J=G;break}else{K=m;L=C;M=G;break L3047}}}}while(0);if((F|0)==2566){F=0;if(E){K=m;L=0;M=1;break}else{I=0;J=1}}C=d[p]|0;G=(C&1|0)==0;if(((c[q>>2]|0)-m|0)==((G?C>>>1:c[z>>2]|0)|0)){if(G){N=C>>>1;O=C>>>1}else{C=c[z>>2]|0;N=C;O=C}dl(o,N<<1,0);if((a[p]&1)==0){P=10}else{P=(c[g>>2]&-2)-1|0}dl(o,P,0);if((a[p]&1)==0){Q=x}else{Q=c[y>>2]|0}c[q>>2]=Q+O;R=Q}else{R=m}C=B+12|0;G=c[C>>2]|0;S=B+16|0;if((G|0)==(c[S>>2]|0)){T=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{T=c[G>>2]|0}if((fp(T,v,R,q,t,A,n,l,s,u)|0)!=0){K=R;L=I;M=J;break}G=c[C>>2]|0;if((G|0)==(c[S>>2]|0)){S=c[(c[B>>2]|0)+40>>2]|0;b_[S&127](B)|0;m=R;w=B;continue}else{c[C>>2]=G+4;m=R;w=B;continue}}w=d[n]|0;if((w&1|0)==0){U=w>>>1}else{U=c[n+4>>2]|0}do{if((U|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}R=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=R}}while(0);c[k>>2]=e8(K,c[q>>2]|0,j,v)|0;eZ(n,l,c[s>>2]|0,j);do{if(E){V=0}else{s=c[B+12>>2]|0;if((s|0)==(c[B+16>>2]|0)){W=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{W=c[s>>2]|0}if((W|0)!=-1){V=B;break}c[h>>2]=0;V=0}}while(0);h=(V|0)==0;do{if(M){F=2608}else{B=c[L+12>>2]|0;if((B|0)==(c[L+16>>2]|0)){X=b_[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{X=c[B>>2]|0}if((X|0)==-1){c[f>>2]=0;F=2608;break}if(!(h^(L|0)==0)){break}Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}}while(0);do{if((F|0)==2608){if(h){break}Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Y=b|0;c[Y>>2]=V;dj(o);dj(n);i=e;return}function fw(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;u=c[h+4>>2]&74;if((u|0)==0){v=0}else if((u|0)==64){v=8}else if((u|0)==8){v=16}else{v=10}u=l|0;fr(n,h,u,m);kv(p|0,0,12);h=o;dl(o,10,0);if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;h=f|0;f=g|0;g=o|0;z=o+4|0;A=c[m>>2]|0;m=w;w=c[h>>2]|0;L3136:while(1){do{if((w|0)==0){B=0}else{C=c[w+12>>2]|0;if((C|0)==(c[w+16>>2]|0)){D=b_[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{D=c[C>>2]|0}if((D|0)!=-1){B=w;break}c[h>>2]=0;B=0}}while(0);E=(B|0)==0;C=c[f>>2]|0;do{if((C|0)==0){F=2636}else{G=c[C+12>>2]|0;if((G|0)==(c[C+16>>2]|0)){H=b_[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=2636;break}else{G=(C|0)==0;if(E^G){I=C;J=G;break}else{L=m;M=C;N=G;break L3136}}}}while(0);if((F|0)==2636){F=0;if(E){L=m;M=0;N=1;break}else{I=0;J=1}}C=d[p]|0;G=(C&1|0)==0;if(((c[q>>2]|0)-m|0)==((G?C>>>1:c[z>>2]|0)|0)){if(G){O=C>>>1;P=C>>>1}else{C=c[z>>2]|0;O=C;P=C}dl(o,O<<1,0);if((a[p]&1)==0){Q=10}else{Q=(c[g>>2]&-2)-1|0}dl(o,Q,0);if((a[p]&1)==0){R=x}else{R=c[y>>2]|0}c[q>>2]=R+P;S=R}else{S=m}C=B+12|0;G=c[C>>2]|0;T=B+16|0;if((G|0)==(c[T>>2]|0)){U=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{U=c[G>>2]|0}if((fp(U,v,S,q,t,A,n,l,s,u)|0)!=0){L=S;M=I;N=J;break}G=c[C>>2]|0;if((G|0)==(c[T>>2]|0)){T=c[(c[B>>2]|0)+40>>2]|0;b_[T&127](B)|0;m=S;w=B;continue}else{c[C>>2]=G+4;m=S;w=B;continue}}w=d[n]|0;if((w&1|0)==0){V=w>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){w=c[s>>2]|0;if((w-r|0)>=160){break}S=c[t>>2]|0;c[s>>2]=w+4;c[w>>2]=S}}while(0);t=fa(L,c[q>>2]|0,j,v)|0;c[k>>2]=t;c[k+4>>2]=K;eZ(n,l,c[s>>2]|0,j);do{if(E){W=0}else{s=c[B+12>>2]|0;if((s|0)==(c[B+16>>2]|0)){X=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{X=c[s>>2]|0}if((X|0)!=-1){W=B;break}c[h>>2]=0;W=0}}while(0);h=(W|0)==0;do{if(N){F=2678}else{B=c[M+12>>2]|0;if((B|0)==(c[M+16>>2]|0)){Y=b_[c[(c[M>>2]|0)+36>>2]&127](M)|0}else{Y=c[B>>2]|0}if((Y|0)==-1){c[f>>2]=0;F=2678;break}if(!(h^(M|0)==0)){break}Z=b|0;c[Z>>2]=W;dj(o);dj(n);i=e;return}}while(0);do{if((F|0)==2678){if(h){break}Z=b|0;c[Z>>2]=W;dj(o);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Z=b|0;c[Z>>2]=W;dj(o);dj(n);i=e;return}function fx(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=i;i=i+1|0;i=i+7>>3<<3;w=i;i=i+1|0;i=i+7>>3<<3;x=e|0;fy(o,j,x,m,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){y=j+1|0;z=y;A=y;B=p+8|0}else{y=p+8|0;z=c[y>>2]|0;A=j+1|0;B=y}c[r>>2]=z;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;j=f|0;f=h|0;h=p|0;C=p+4|0;D=c[m>>2]|0;m=c[n>>2]|0;n=z;z=c[j>>2]|0;L3220:while(1){do{if((z|0)==0){E=0}else{F=c[z+12>>2]|0;if((F|0)==(c[z+16>>2]|0)){G=b_[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{G=c[F>>2]|0}if((G|0)!=-1){E=z;break}c[j>>2]=0;E=0}}while(0);H=(E|0)==0;F=c[f>>2]|0;do{if((F|0)==0){I=2702}else{J=c[F+12>>2]|0;if((J|0)==(c[F+16>>2]|0)){K=b_[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{K=c[J>>2]|0}if((K|0)==-1){c[f>>2]=0;I=2702;break}else{J=(F|0)==0;if(H^J){L=F;M=J;break}else{N=n;O=F;P=J;break L3220}}}}while(0);if((I|0)==2702){I=0;if(H){N=n;O=0;P=1;break}else{L=0;M=1}}F=d[q]|0;J=(F&1|0)==0;if(((c[r>>2]|0)-n|0)==((J?F>>>1:c[C>>2]|0)|0)){if(J){Q=F>>>1;R=F>>>1}else{F=c[C>>2]|0;Q=F;R=F}dl(p,Q<<1,0);if((a[q]&1)==0){S=10}else{S=(c[h>>2]&-2)-1|0}dl(p,S,0);if((a[q]&1)==0){T=A}else{T=c[B>>2]|0}c[r>>2]=T+R;U=T}else{U=n}F=E+12|0;J=c[F>>2]|0;V=E+16|0;if((J|0)==(c[V>>2]|0)){W=b_[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{W=c[J>>2]|0}if((fz(W,v,w,U,r,D,m,o,y,t,u,x)|0)!=0){N=U;O=L;P=M;break}J=c[F>>2]|0;if((J|0)==(c[V>>2]|0)){V=c[(c[E>>2]|0)+40>>2]|0;b_[V&127](E)|0;n=U;z=E;continue}else{c[F>>2]=J+4;n=U;z=E;continue}}z=d[o]|0;if((z&1|0)==0){X=z>>>1}else{X=c[o+4>>2]|0}do{if((X|0)!=0){if((a[v]&1)==0){break}z=c[t>>2]|0;if((z-s|0)>=160){break}U=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=U}}while(0);g[l>>2]=+fd(N,c[r>>2]|0,k);eZ(o,y,c[t>>2]|0,k);do{if(H){Y=0}else{t=c[E+12>>2]|0;if((t|0)==(c[E+16>>2]|0)){Z=b_[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{Z=c[t>>2]|0}if((Z|0)!=-1){Y=E;break}c[j>>2]=0;Y=0}}while(0);j=(Y|0)==0;do{if(P){I=2745}else{E=c[O+12>>2]|0;if((E|0)==(c[O+16>>2]|0)){_=b_[c[(c[O>>2]|0)+36>>2]&127](O)|0}else{_=c[E>>2]|0}if((_|0)==-1){c[f>>2]=0;I=2745;break}if(!(j^(O|0)==0)){break}$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}}while(0);do{if((I|0)==2745){if(j){break}$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}function fy(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;dZ(k,b);b=k|0;k=c[b>>2]|0;if((c[3290]|0)!=-1){c[j>>2]=13160;c[j+4>>2]=12;c[j+8>>2]=0;dn(13160,j,94)}j=(c[3291]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;b8[o&15](n,9736,9768,d)|0;n=c[b>>2]|0;if((c[3194]|0)!=-1){c[h>>2]=12776;c[h+4>>2]=12;c[h+8>>2]=0;dn(12776,h,94)}o=(c[3195]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=p;c[e>>2]=b_[c[(c[r>>2]|0)+12>>2]&127](q)|0;c[f>>2]=b_[c[(c[r>>2]|0)+16>>2]&127](q)|0;bX[c[(c[p>>2]|0)+20>>2]&127](a,q);q=c[b>>2]|0;c_(q)|0;i=g;return}}while(0);o=bf(4)|0;jX(o);aN(o|0,8176,132)}}while(0);g=bf(4)|0;jX(g);aN(g|0,8176,132)}function fz(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0;if((b|0)==(i|0)){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){q=i>>>1}else{q=c[k+4>>2]|0}if((q|0)==0){p=0;return p|0}q=c[m>>2]|0;if((q-l|0)>=160){p=0;return p|0}i=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=i;p=0;return p|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){r=i>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}i=c[m>>2]|0;if((i-l|0)>=160){p=0;return p|0}q=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=q;c[n>>2]=0;p=0;return p|0}}while(0);r=o+128|0;j=o;while(1){if((j|0)==(r|0)){s=r;break}if((c[j>>2]|0)==(b|0)){s=j;break}else{j=j+4|0}}j=s-o|0;o=j>>2;if((j|0)>124){p=-1;return p|0}s=a[9736+o|0]|0;do{if((o|0)==25|(o|0)==24){b=c[h>>2]|0;do{if((b|0)!=(g|0)){if((a[b-1|0]&95|0)==(a[f]&127|0)){break}else{p=-1}return p|0}}while(0);c[h>>2]=b+1;a[b]=s;p=0;return p|0}else if((o|0)==22|(o|0)==23){a[f]=80}else{r=a[f]|0;if((s&95|0)!=(r<<24>>24|0)){break}a[f]=r|-128;if((a[e]&1)==0){break}a[e]=0;r=d[k]|0;if((r&1|0)==0){t=r>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}r=c[m>>2]|0;if((r-l|0)>=160){break}q=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=q}}while(0);m=c[h>>2]|0;c[h>>2]=m+1;a[m]=s;if((j|0)>84){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}function fA(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=i;i=i+1|0;i=i+7>>3<<3;w=i;i=i+1|0;i=i+7>>3<<3;x=e|0;fy(o,j,x,m,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){y=j+1|0;z=y;A=y;B=p+8|0}else{y=p+8|0;z=c[y>>2]|0;A=j+1|0;B=y}c[r>>2]=z;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;j=f|0;f=g|0;g=p|0;C=p+4|0;D=c[m>>2]|0;m=c[n>>2]|0;n=z;z=c[j>>2]|0;L3388:while(1){do{if((z|0)==0){E=0}else{F=c[z+12>>2]|0;if((F|0)==(c[z+16>>2]|0)){G=b_[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{G=c[F>>2]|0}if((G|0)!=-1){E=z;break}c[j>>2]=0;E=0}}while(0);H=(E|0)==0;F=c[f>>2]|0;do{if((F|0)==0){I=2835}else{J=c[F+12>>2]|0;if((J|0)==(c[F+16>>2]|0)){K=b_[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{K=c[J>>2]|0}if((K|0)==-1){c[f>>2]=0;I=2835;break}else{J=(F|0)==0;if(H^J){L=F;M=J;break}else{N=n;O=F;P=J;break L3388}}}}while(0);if((I|0)==2835){I=0;if(H){N=n;O=0;P=1;break}else{L=0;M=1}}F=d[q]|0;J=(F&1|0)==0;if(((c[r>>2]|0)-n|0)==((J?F>>>1:c[C>>2]|0)|0)){if(J){Q=F>>>1;R=F>>>1}else{F=c[C>>2]|0;Q=F;R=F}dl(p,Q<<1,0);if((a[q]&1)==0){S=10}else{S=(c[g>>2]&-2)-1|0}dl(p,S,0);if((a[q]&1)==0){T=A}else{T=c[B>>2]|0}c[r>>2]=T+R;U=T}else{U=n}F=E+12|0;J=c[F>>2]|0;V=E+16|0;if((J|0)==(c[V>>2]|0)){W=b_[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{W=c[J>>2]|0}if((fz(W,v,w,U,r,D,m,o,y,t,u,x)|0)!=0){N=U;O=L;P=M;break}J=c[F>>2]|0;if((J|0)==(c[V>>2]|0)){V=c[(c[E>>2]|0)+40>>2]|0;b_[V&127](E)|0;n=U;z=E;continue}else{c[F>>2]=J+4;n=U;z=E;continue}}z=d[o]|0;if((z&1|0)==0){X=z>>>1}else{X=c[o+4>>2]|0}do{if((X|0)!=0){if((a[v]&1)==0){break}z=c[t>>2]|0;if((z-s|0)>=160){break}U=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=U}}while(0);h[l>>3]=+ff(N,c[r>>2]|0,k);eZ(o,y,c[t>>2]|0,k);do{if(H){Y=0}else{t=c[E+12>>2]|0;if((t|0)==(c[E+16>>2]|0)){Z=b_[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{Z=c[t>>2]|0}if((Z|0)!=-1){Y=E;break}c[j>>2]=0;Y=0}}while(0);j=(Y|0)==0;do{if(P){I=2878}else{E=c[O+12>>2]|0;if((E|0)==(c[O+16>>2]|0)){_=b_[c[(c[O>>2]|0)+36>>2]&127](O)|0}else{_=c[E>>2]|0}if((_|0)==-1){c[f>>2]=0;I=2878;break}if(!(j^(O|0)==0)){break}$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}}while(0);do{if((I|0)==2878){if(j){break}$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}function fB(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7>>3<<3;u=i;i=i+4|0;i=i+7>>3<<3;v=i;i=i+1|0;i=i+7>>3<<3;w=i;i=i+1|0;i=i+7>>3<<3;x=e|0;fy(o,j,x,m,n);kv(q|0,0,12);j=p;dl(p,10,0);if((a[q]&1)==0){y=j+1|0;z=y;A=y;B=p+8|0}else{y=p+8|0;z=c[y>>2]|0;A=j+1|0;B=y}c[r>>2]=z;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;j=f|0;f=g|0;g=p|0;C=p+4|0;D=c[m>>2]|0;m=c[n>>2]|0;n=z;z=c[j>>2]|0;L6:while(1){do{if((z|0)==0){E=0}else{F=c[z+12>>2]|0;if((F|0)==(c[z+16>>2]|0)){G=b_[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{G=c[F>>2]|0}if((G|0)!=-1){E=z;break}c[j>>2]=0;E=0}}while(0);H=(E|0)==0;F=c[f>>2]|0;do{if((F|0)==0){I=18}else{J=c[F+12>>2]|0;if((J|0)==(c[F+16>>2]|0)){K=b_[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{K=c[J>>2]|0}if((K|0)==-1){c[f>>2]=0;I=18;break}else{J=(F|0)==0;if(H^J){L=F;M=J;break}else{N=n;O=F;P=J;break L6}}}}while(0);if((I|0)==18){I=0;if(H){N=n;O=0;P=1;break}else{L=0;M=1}}F=d[q]|0;J=(F&1|0)==0;if(((c[r>>2]|0)-n|0)==((J?F>>>1:c[C>>2]|0)|0)){if(J){Q=F>>>1;R=F>>>1}else{F=c[C>>2]|0;Q=F;R=F}dl(p,Q<<1,0);if((a[q]&1)==0){S=10}else{S=(c[g>>2]&-2)-1|0}dl(p,S,0);if((a[q]&1)==0){T=A}else{T=c[B>>2]|0}c[r>>2]=T+R;U=T}else{U=n}F=E+12|0;J=c[F>>2]|0;V=E+16|0;if((J|0)==(c[V>>2]|0)){W=b_[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{W=c[J>>2]|0}if((fz(W,v,w,U,r,D,m,o,y,t,u,x)|0)!=0){N=U;O=L;P=M;break}J=c[F>>2]|0;if((J|0)==(c[V>>2]|0)){V=c[(c[E>>2]|0)+40>>2]|0;b_[V&127](E)|0;n=U;z=E;continue}else{c[F>>2]=J+4;n=U;z=E;continue}}z=d[o]|0;if((z&1|0)==0){X=z>>>1}else{X=c[o+4>>2]|0}do{if((X|0)!=0){if((a[v]&1)==0){break}z=c[t>>2]|0;if((z-s|0)>=160){break}U=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=U}}while(0);h[l>>3]=+fi(N,c[r>>2]|0,k);eZ(o,y,c[t>>2]|0,k);do{if(H){Y=0}else{t=c[E+12>>2]|0;if((t|0)==(c[E+16>>2]|0)){Z=b_[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{Z=c[t>>2]|0}if((Z|0)!=-1){Y=E;break}c[j>>2]=0;Y=0}}while(0);j=(Y|0)==0;do{if(P){I=61}else{E=c[O+12>>2]|0;if((E|0)==(c[O+16>>2]|0)){_=b_[c[(c[O>>2]|0)+36>>2]&127](O)|0}else{_=c[E>>2]|0}if((_|0)==-1){c[f>>2]=0;I=61;break}if(!(j^(O|0)==0)){break}$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}}while(0);do{if((I|0)==61){if(j){break}$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;$=b|0;c[$>>2]=Y;dj(p);dj(o);i=e;return}function fC(a){a=a|0;cE(a|0);kn(a);return}function fD(a){a=a|0;cE(a|0);return}function fE(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;e=i;i=i+136|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+120|0;o=i;i=i+4|0;i=i+7>>3<<3;p=i;i=i+12|0;i=i+7>>3<<3;q=i;i=i+4|0;i=i+7>>3<<3;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7>>3<<3;t=i;i=i+4|0;i=i+7>>3<<3;kv(n|0,0,12);u=p;dZ(o,h);h=o|0;o=c[h>>2]|0;if((c[3290]|0)!=-1){c[l>>2]=13160;c[l+4>>2]=12;c[l+8>>2]=0;dn(13160,l,94)}l=(c[3291]|0)-1|0;v=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-v>>2>>>0>l>>>0){w=c[v+(l<<2)>>2]|0;if((w|0)==0){break}x=w;y=m|0;z=c[(c[w>>2]|0)+48>>2]|0;b8[z&15](x,9736,9762,y)|0;x=c[h>>2]|0;c_(x)|0;kv(u|0,0,12);x=p;dl(p,10,0);if((a[u]&1)==0){z=x+1|0;A=z;B=z;C=p+8|0}else{z=p+8|0;A=c[z>>2]|0;B=x+1|0;C=z}c[q>>2]=A;z=r|0;c[s>>2]=z;c[t>>2]=0;x=f|0;w=g|0;D=p|0;E=p+4|0;F=A;G=c[x>>2]|0;L101:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=b_[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{J=c[I>>2]|0}if((J|0)!=-1){H=G;break}c[x>>2]=0;H=0}}while(0);I=(H|0)==0;K=c[w>>2]|0;do{if((K|0)==0){L=95}else{M=c[K+12>>2]|0;if((M|0)==(c[K+16>>2]|0)){N=b_[c[(c[K>>2]|0)+36>>2]&127](K)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[w>>2]=0;L=95;break}else{if(I^(K|0)==0){break}else{O=F;break L101}}}}while(0);if((L|0)==95){L=0;if(I){O=F;break}}K=d[u]|0;M=(K&1|0)==0;if(((c[q>>2]|0)-F|0)==((M?K>>>1:c[E>>2]|0)|0)){if(M){P=K>>>1;Q=K>>>1}else{K=c[E>>2]|0;P=K;Q=K}dl(p,P<<1,0);if((a[u]&1)==0){R=10}else{R=(c[D>>2]&-2)-1|0}dl(p,R,0);if((a[u]&1)==0){S=B}else{S=c[C>>2]|0}c[q>>2]=S+Q;T=S}else{T=F}K=H+12|0;M=c[K>>2]|0;U=H+16|0;if((M|0)==(c[U>>2]|0)){V=b_[c[(c[H>>2]|0)+36>>2]&127](H)|0}else{V=c[M>>2]|0}if((fp(V,16,T,q,t,0,n,z,s,y)|0)!=0){O=T;break}M=c[K>>2]|0;if((M|0)==(c[U>>2]|0)){U=c[(c[H>>2]|0)+40>>2]|0;b_[U&127](H)|0;F=T;G=H;continue}else{c[K>>2]=M+4;F=T;G=H;continue}}a[O+3|0]=0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);G=fm(O,c[2952]|0,1320,(F=i,i=i+8|0,c[F>>2]=k,F)|0)|0;i=F;if((G|0)!=1){c[j>>2]=4}G=c[x>>2]|0;do{if((G|0)==0){W=0}else{F=c[G+12>>2]|0;if((F|0)==(c[G+16>>2]|0)){X=b_[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{X=c[F>>2]|0}if((X|0)!=-1){W=G;break}c[x>>2]=0;W=0}}while(0);x=(W|0)==0;G=c[w>>2]|0;do{if((G|0)==0){L=140}else{F=c[G+12>>2]|0;if((F|0)==(c[G+16>>2]|0)){Y=b_[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{Y=c[F>>2]|0}if((Y|0)==-1){c[w>>2]=0;L=140;break}if(!(x^(G|0)==0)){break}Z=b|0;c[Z>>2]=W;dj(p);dj(n);i=e;return}}while(0);do{if((L|0)==140){if(x){break}Z=b|0;c[Z>>2]=W;dj(p);dj(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Z=b|0;c[Z>>2]=W;dj(p);dj(n);i=e;return}}while(0);e=bf(4)|0;jX(e);aN(e|0,8176,132)}function fF(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[2384]|0;a[q+1|0]=a[2385|0]|0;a[q+2|0]=a[2386|0]|0;a[q+3|0]=a[2387|0]|0;a[q+4|0]=a[2388|0]|0;a[q+5|0]=a[2389|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,12,c[2952]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=q}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=169;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=169;break}w=k+2|0}else{x=169}}while(0);if((x|0)==169){w=u}x=l|0;dZ(o,f);fJ(u,w,q,x,m,n,o);c_(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fG(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function fG(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((b$[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){ds(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((b$[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){dj(l);break}c[m>>2]=0;c[b>>2]=0;dj(l);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((b$[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function fH(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];b7[o&31](b,d,l,f,g,h&1);i=j;return}dZ(m,f);f=m|0;m=c[f>>2]|0;if((c[3196]|0)!=-1){c[k>>2]=12784;c[k+4>>2]=12;c[k+8>>2]=0;dn(12784,k,94)}k=(c[3197]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;c_(o)|0;o=c[l>>2]|0;if(h){bX[c[o+24>>2]&127](n,d)}else{bX[c[o+28>>2]&127](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){p=d+1|0;q=p;r=p;s=n+8|0}else{p=n+8|0;q=c[p>>2]|0;r=d+1|0;s=p}p=e|0;d=n+4|0;t=q;u=l;while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}l=u&255;if((t|0)==(v+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){break}l=a[t]|0;w=c[p>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)!=(c[w+28>>2]|0)){c[x>>2]=y+1;a[y]=l;break}if((bY[c[(c[w>>2]|0)+52>>2]&31](w,l&255)|0)!=-1){break}c[p>>2]=0}}while(0);t=t+1|0;u=a[o]|0}c[b>>2]=c[p>>2];dj(n);i=j;return}}while(0);j=bf(4)|0;jX(j);aN(j|0,8176,132)}function fI(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=bO(d|0)|0;d=bD(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}bO(j|0)|0;i=g;return d|0}function fJ(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3292]|0)!=-1){c[n>>2]=13168;c[n+4>>2]=12;c[n+8>>2]=0;dn(13168,n,94)}n=(c[3293]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}r=k;s=c[p>>2]|0;if((c[3196]|0)!=-1){c[m>>2]=12784;c[m+4>>2]=12;c[m+8>>2]=0;dn(12784,m,94)}m=(c[3197]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}t=s;bX[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;b8[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=bY[c[(c[k>>2]|0)+28>>2]&31](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=bY[c[(c[p>>2]|0)+28>>2]&31](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+1;a[y]=q;q=bY[c[(c[p>>2]|0)+28>>2]&31](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=b_[c[(c[s>>2]|0)+16>>2]&127](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1;a[I]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=bY[c[(c[p>>2]|0)+28>>2]&31](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-1|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=a[J]|0;a[J]=a[K]|0;a[K]=C;J=J+1|0;K=K-1|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;dj(o);i=l;return}else{L=g+(e-b)|0;c[h>>2]=L;dj(o);i=l;return}}function fK(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,22,c[2952]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=308;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=308;break}w=l+2|0}else if((j|0)==32){w=r}else{x=308}}while(0);if((x|0)==308){w=u}x=m|0;dZ(p,f);fJ(u,w,r,x,n,o,p);c_(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fG(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function fL(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[2384]|0;a[q+1|0]=a[2385|0]|0;a[q+2|0]=a[2386|0]|0;a[q+3|0]=a[2387|0]|0;a[q+4|0]=a[2388|0]|0;a[q+5|0]=a[2389|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,12,c[2952]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=333;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=333;break}w=k+2|0}else if((h|0)==32){w=q}else{x=333}}while(0);if((x|0)==333){w=u}x=l|0;dZ(o,f);fJ(u,w,q,x,m,n,o);c_(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fG(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function fM(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,23,c[2952]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=358;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=358;break}w=l+2|0}else{x=358}}while(0);if((x|0)==358){w=u}x=m|0;dZ(p,f);fJ(u,w,r,x,n,o,p);c_(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fG(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function fN(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=c[2952]|0;if(y){w=fI(k,30,l,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;A=w}else{w=fI(k,30,l,t,(z=i,i=i+8|0,h[z>>3]=j,z)|0)|0;i=z;A=w}do{if((A|0)>29){w=(a[13728]|0)==0;if(y){do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=fO(m,c[2952]|0,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;B=l}else{do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);w=fO(m,c[2952]|0,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;B=w}w=c[m>>2]|0;if((w|0)!=0){C=B;D=w;E=w;break}ks();w=c[m>>2]|0;C=B;D=w;E=w}else{C=A;D=0;E=c[m>>2]|0}}while(0);A=E+C|0;B=c[u>>2]&176;do{if((B|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=414;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=414;break}F=E+2|0}else if((B|0)==32){F=A}else{G=414}}while(0);if((G|0)==414){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ke(C<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}ks();H=0;I=0;J=c[m>>2]|0}}while(0);dZ(q,f);fQ(J,F,A,H,o,p,q);c_(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];fG(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){kf(I)}if((D|0)==0){i=d;return}kf(D);i=d;return}function fO(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=bO(b|0)|0;b=bk(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}bO(h|0)|0;i=f;return b|0}function fP(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=c[2952]|0;if(y){w=fI(k,30,l,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;A=w}else{w=fI(k,30,l,t,(z=i,i=i+8|0,h[z>>3]=j,z)|0)|0;i=z;A=w}do{if((A|0)>29){w=(a[13728]|0)==0;if(y){do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=fO(m,c[2952]|0,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;B=l}else{do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);w=fO(m,c[2952]|0,t,(z=i,i=i+8|0,h[z>>3]=j,z)|0)|0;i=z;B=w}w=c[m>>2]|0;if((w|0)!=0){C=B;D=w;E=w;break}ks();w=c[m>>2]|0;C=B;D=w;E=w}else{C=A;D=0;E=c[m>>2]|0}}while(0);A=E+C|0;B=c[u>>2]&176;do{if((B|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=499;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=499;break}F=E+2|0}else if((B|0)==32){F=A}else{G=499}}while(0);if((G|0)==499){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ke(C<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}ks();H=0;I=0;J=c[m>>2]|0}}while(0);dZ(q,f);fQ(J,F,A,H,o,p,q);c_(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];fG(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){kf(I)}if((D|0)==0){i=d;return}kf(D);i=d;return}function fQ(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3292]|0)!=-1){c[n>>2]=13168;c[n+4>>2]=12;c[n+8>>2]=0;dn(13168,n,94)}n=(c[3293]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}r=k;s=c[p>>2]|0;if((c[3196]|0)!=-1){c[m>>2]=12784;c[m+4>>2]=12;c[m+8>>2]=0;dn(12784,m,94)}m=(c[3197]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}t=s;bX[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=bY[c[(c[k>>2]|0)+28>>2]&31](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=m;v=b+1|0}else{v=b}m=f;L629:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=554;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=554;break}p=k;n=bY[c[(c[p>>2]|0)+28>>2]&31](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=bY[c[(c[p>>2]|0)+28>>2]&31](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L629}u=a[q]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((a5(u<<24>>24|0,c[2952]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=554}}while(0);L644:do{if((x|0)==554){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L644}q=a[w]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((aU(q<<24>>24|0,c[2952]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=554}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+32>>2]|0;b8[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=b_[c[(c[s>>2]|0)+16>>2]&127](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+1;a[J]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=bY[c[(c[p>>2]|0)+28>>2]&31](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-1|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=a[K]|0;a[K]=a[L]|0;a[L]=D;K=K+1|0;L=L-1|0;}while(K>>>0<L>>>0)}}while(0);L683:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=bY[c[(c[L>>2]|0)+28>>2]&31](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+1;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L683}}L=b_[c[(c[s>>2]|0)+12>>2]&127](t)|0;H=c[j>>2]|0;c[j>>2]=H+1;a[H]=L;M=K+1|0}else{M=y}}while(0);b8[c[(c[k>>2]|0)+32>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;dj(o);i=l;return}N=g+(e-b)|0;c[h>>2]=N;dj(o);i=l;return}function fR(a){a=a|0;cE(a|0);kn(a);return}function fS(a){a=a|0;cE(a|0);return}function fT(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[2384]|0;a[q+1|0]=a[2385|0]|0;a[q+2|0]=a[2386|0]|0;a[q+3|0]=a[2387|0]|0;a[q+4|0]=a[2388|0]|0;a[q+5|0]=a[2389|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,12,c[2952]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=q}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=622;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=622;break}w=k+2|0}else{x=622}}while(0);if((x|0)==622){w=u}x=l|0;dZ(o,f);fW(u,w,q,x,m,n,o);c_(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fX(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function fU(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[2392]|0;a[o+1|0]=a[2393|0]|0;a[o+2|0]=a[2394|0]|0;a[o+3|0]=a[2395|0]|0;a[o+4|0]=a[2396|0]|0;a[o+5|0]=a[2397|0]|0;p=k|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);q=fI(p,20,c[2952]|0,o,(o=i,i=i+8|0,c[o>>2]=h,o)|0)|0;i=o;o=k+q|0;h=c[f+4>>2]&176;do{if((h|0)==32){r=o}else if((h|0)==16){s=a[p]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){r=k+1|0;break}if(!((q|0)>1&s<<24>>24==48)){t=637;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){t=637;break}r=k+2|0}else{t=637}}while(0);if((t|0)==637){r=p}dZ(m,f);t=m|0;m=c[t>>2]|0;if((c[3292]|0)!=-1){c[j>>2]=13168;c[j+4>>2]=12;c[j+8>>2]=0;dn(13168,j,94)}j=(c[3293]|0)-1|0;h=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-h>>2>>>0>j>>>0){s=c[h+(j<<2)>>2]|0;if((s|0)==0){break}u=s;v=c[t>>2]|0;c_(v)|0;v=l|0;w=c[(c[s>>2]|0)+32>>2]|0;b8[w&15](u,p,o,v)|0;u=l+q|0;if((r|0)==(o|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;fG(b,n,v,x,u,f,g);i=d;return}x=l+(r-k)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;fG(b,n,v,x,u,f,g);i=d;return}}while(0);d=bf(4)|0;jX(d);aN(d|0,8176,132)}function fV(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];b7[o&31](b,d,l,f,g,h&1);i=j;return}dZ(m,f);f=m|0;m=c[f>>2]|0;if((c[3194]|0)!=-1){c[k>>2]=12776;c[k+4>>2]=12;c[k+8>>2]=0;dn(12776,k,94)}k=(c[3195]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;c_(o)|0;o=c[l>>2]|0;if(h){bX[c[o+24>>2]&127](n,d)}else{bX[c[o+28>>2]&127](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;p=l;q=l;r=n+8|0}else{l=n+8|0;p=c[l>>2]|0;q=n+4|0;r=l}l=e|0;s=p;t=o;while(1){if((t&1)==0){u=q}else{u=c[r>>2]|0}o=t&255;if((o&1|0)==0){v=o>>>1}else{v=c[q>>2]|0}if((s|0)==(u+(v<<2)|0)){break}o=c[s>>2]|0;w=c[l>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)==(c[w+28>>2]|0)){z=bY[c[(c[w>>2]|0)+52>>2]&31](w,o)|0}else{c[x>>2]=y+4;c[y>>2]=o;z=o}if((z|0)!=-1){break}c[l>>2]=0}}while(0);s=s+4|0;t=a[d]|0}c[b>>2]=c[l>>2];dw(n);i=j;return}}while(0);j=bf(4)|0;jX(j);aN(j|0,8176,132)}function fW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3290]|0)!=-1){c[n>>2]=13160;c[n+4>>2]=12;c[n+8>>2]=0;dn(13160,n,94)}n=(c[3291]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}r=k;s=c[p>>2]|0;if((c[3194]|0)!=-1){c[m>>2]=12776;c[m+4>>2]=12;c[m+8>>2]=0;dn(12776,m,94)}m=(c[3195]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}t=s;bX[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;b8[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=bY[c[(c[k>>2]|0)+44>>2]&31](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=bY[c[(c[p>>2]|0)+44>>2]&31](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+4;c[y>>2]=q;q=bY[c[(c[p>>2]|0)+44>>2]&31](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=b_[c[(c[s>>2]|0)+16>>2]&127](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=bY[c[(c[p>>2]|0)+44>>2]&31](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b<<2)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-4|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=c[J>>2]|0;c[J>>2]=c[K>>2];c[K>>2]=C;J=J+4|0;K=K-4|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;dj(o);i=l;return}else{L=g+(e-b<<2)|0;c[h>>2]=L;dj(o);i=l;return}}function fX(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((b$[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){dE(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((b$[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){dw(l);break}c[m>>2]=0;c[b>>2]=0;dw(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((b$[c[(c[d>>2]|0)+48>>2]&63](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function fY(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,22,c[2952]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=782;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=782;break}w=l+2|0}else{x=782}}while(0);if((x|0)==782){w=u}x=m|0;dZ(p,f);fW(u,w,r,x,n,o,p);c_(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fX(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function fZ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[2384]|0;a[q+1|0]=a[2385|0]|0;a[q+2|0]=a[2386|0]|0;a[q+3|0]=a[2387|0]|0;a[q+4|0]=a[2388|0]|0;a[q+5|0]=a[2389|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,12,c[2952]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=807;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=807;break}w=k+2|0}else if((h|0)==32){w=q}else{x=807}}while(0);if((x|0)==807){w=u}x=l|0;dZ(o,f);fW(u,w,q,x,m,n,o);c_(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fX(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function f_(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);t=fI(u,23,c[2952]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=832;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=832;break}w=l+2|0}else{x=832}}while(0);if((x|0)==832){w=u}x=m|0;dZ(p,f);fW(u,w,r,x,n,o,p);c_(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fX(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function f$(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=c[2952]|0;if(y){w=fI(k,30,l,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;A=w}else{w=fI(k,30,l,t,(z=i,i=i+8|0,h[z>>3]=j,z)|0)|0;i=z;A=w}do{if((A|0)>29){w=(a[13728]|0)==0;if(y){do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=fO(m,c[2952]|0,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;B=l}else{do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);w=fO(m,c[2952]|0,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;B=w}w=c[m>>2]|0;if((w|0)!=0){C=B;D=w;E=w;break}ks();w=c[m>>2]|0;C=B;D=w;E=w}else{C=A;D=0;E=c[m>>2]|0}}while(0);A=E+C|0;B=c[u>>2]&176;do{if((B|0)==32){F=A}else if((B|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=888;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=888;break}F=E+2|0}else{G=888}}while(0);if((G|0)==888){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ke(C<<3)|0;B=G;if((G|0)!=0){H=B;I=B;J=E;break}ks();H=B;I=B;J=c[m>>2]|0}}while(0);dZ(q,f);f0(J,F,A,H,o,p,q);c_(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];fX(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){kf(I)}if((D|0)==0){i=d;return}kf(D);i=d;return}function f0(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[3290]|0)!=-1){c[n>>2]=13160;c[n+4>>2]=12;c[n+8>>2]=0;dn(13160,n,94)}n=(c[3291]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=bf(4)|0;s=r;jX(s);aN(r|0,8176,132)}r=k;s=c[p>>2]|0;if((c[3194]|0)!=-1){c[m>>2]=12776;c[m+4>>2]=12;c[m+8>>2]=0;dn(12776,m,94)}m=(c[3195]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=bf(4)|0;u=t;jX(u);aN(t|0,8176,132)}t=s;bX[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=bY[c[(c[k>>2]|0)+44>>2]&31](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=m;v=b+1|0}else{v=b}m=f;L1087:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=943;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=943;break}p=k;n=bY[c[(c[p>>2]|0)+44>>2]&31](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=bY[c[(c[p>>2]|0)+44>>2]&31](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L1087}u=a[q]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((a5(u<<24>>24|0,c[2952]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=943}}while(0);L1102:do{if((x|0)==943){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L1102}q=a[w]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((aU(q<<24>>24|0,c[2952]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=943}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+48>>2]|0;b8[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z<<2)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=b_[c[(c[s>>2]|0)+16>>2]&127](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=bY[c[(c[p>>2]|0)+44>>2]&31](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b<<2)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-4|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=c[K>>2]|0;c[K>>2]=c[L>>2];c[L>>2]=D;K=K+4|0;L=L-4|0;}while(K>>>0<L>>>0)}}while(0);L1141:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=bY[c[(c[L>>2]|0)+44>>2]&31](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1141}}L=b_[c[(c[s>>2]|0)+12>>2]&127](t)|0;H=c[j>>2]|0;c[j>>2]=H+4;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);b8[c[(c[k>>2]|0)+48>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M<<2)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;dj(o);i=l;return}N=g+(e-b<<2)|0;c[h>>2]=N;dj(o);i=l;return}function f1(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=c[2952]|0;if(y){w=fI(k,30,l,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;A=w}else{w=fI(k,30,l,t,(z=i,i=i+8|0,h[z>>3]=j,z)|0)|0;i=z;A=w}do{if((A|0)>29){w=(a[13728]|0)==0;if(y){do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);l=fO(m,c[2952]|0,t,(z=i,i=i+16|0,c[z>>2]=c[f+8>>2],h[z+8>>3]=j,z)|0)|0;i=z;B=l}else{do{if(w){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);w=fO(m,c[2952]|0,t,(z=i,i=i+8|0,h[z>>3]=j,z)|0)|0;i=z;B=w}w=c[m>>2]|0;if((w|0)!=0){C=B;D=w;E=w;break}ks();w=c[m>>2]|0;C=B;D=w;E=w}else{C=A;D=0;E=c[m>>2]|0}}while(0);A=E+C|0;B=c[u>>2]&176;do{if((B|0)==32){F=A}else if((B|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1040;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1040;break}F=E+2|0}else{G=1040}}while(0);if((G|0)==1040){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ke(C<<3)|0;B=G;if((G|0)!=0){H=B;I=B;J=E;break}ks();H=B;I=B;J=c[m>>2]|0}}while(0);dZ(q,f);f0(J,F,A,H,o,p,q);c_(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];fX(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){kf(I)}if((D|0)==0){i=d;return}kf(D);i=d;return}function f2(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[2392]|0;a[o+1|0]=a[2393|0]|0;a[o+2|0]=a[2394|0]|0;a[o+3|0]=a[2395|0]|0;a[o+4|0]=a[2396|0]|0;a[o+5|0]=a[2397|0]|0;p=k|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);q=fI(p,20,c[2952]|0,o,(o=i,i=i+8|0,c[o>>2]=h,o)|0)|0;i=o;o=k+q|0;h=c[f+4>>2]&176;do{if((h|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=1073;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=1073;break}s=k+2|0}else if((h|0)==32){s=o}else{t=1073}}while(0);if((t|0)==1073){s=p}dZ(m,f);t=m|0;m=c[t>>2]|0;if((c[3290]|0)!=-1){c[j>>2]=13160;c[j+4>>2]=12;c[j+8>>2]=0;dn(13160,j,94)}j=(c[3291]|0)-1|0;h=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-h>>2>>>0>j>>>0){r=c[h+(j<<2)>>2]|0;if((r|0)==0){break}u=r;v=c[t>>2]|0;c_(v)|0;v=l|0;w=c[(c[r>>2]|0)+48>>2]|0;b8[w&15](u,p,o,v)|0;u=l+(q<<2)|0;if((s|0)==(o|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;fX(b,n,v,x,u,f,g);i=d;return}x=l+(s-k<<2)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;fX(b,n,v,x,u,f,g);i=d;return}}while(0);d=bf(4)|0;jX(d);aN(d|0,8176,132)}function f3(a){a=a|0;return 2}function f4(a){a=a|0;cE(a|0);kn(a);return}function f5(a){a=a|0;cE(a|0);return}function f6(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];f8(a,b,k,l,f,g,h,2376,2384);i=j;return}function f7(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=b_[c[(c[n>>2]|0)+20>>2]&127](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}f8(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function f8(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;dZ(p,h);t=p|0;p=c[t>>2]|0;if((c[3292]|0)!=-1){c[o>>2]=13168;c[o+4>>2]=12;c[o+8>>2]=0;dn(13168,o,94)}o=(c[3293]|0)-1|0;u=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-u>>2>>>0>o>>>0){v=c[u+(o<<2)>>2]|0;if((v|0)==0){break}w=v;x=c[t>>2]|0;c_(x)|0;c[j>>2]=0;x=f|0;L1284:do{if((l|0)==(m|0)){y=1163}else{z=g|0;A=v;B=v+8|0;C=v;D=e;E=r|0;F=s|0;G=q|0;H=l;I=0;L1286:while(1){J=I;while(1){if((J|0)!=0){y=1163;break L1284}K=c[x>>2]|0;do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}if((b_[c[(c[K>>2]|0)+36>>2]&127](K)|0)!=-1){L=K;break}c[x>>2]=0;L=0}}while(0);K=(L|0)==0;M=c[z>>2]|0;L1296:do{if((M|0)==0){y=1116}else{do{if((c[M+12>>2]|0)==(c[M+16>>2]|0)){if((b_[c[(c[M>>2]|0)+36>>2]&127](M)|0)!=-1){break}c[z>>2]=0;y=1116;break L1296}}while(0);if(K){N=M}else{y=1117;break L1286}}}while(0);if((y|0)==1116){y=0;if(K){y=1117;break L1286}else{N=0}}if((b$[c[(c[A>>2]|0)+36>>2]&63](w,a[H]|0,0)|0)<<24>>24==37){y=1120;break}M=a[H]|0;if(M<<24>>24>-1){O=c[B>>2]|0;if((b[O+(M<<24>>24<<1)>>1]&8192)!=0){P=H;y=1131;break}}Q=L+12|0;M=c[Q>>2]|0;R=L+16|0;if((M|0)==(c[R>>2]|0)){S=(b_[c[(c[L>>2]|0)+36>>2]&127](L)|0)&255}else{S=a[M]|0}M=bY[c[(c[C>>2]|0)+12>>2]&31](w,S)|0;if(M<<24>>24==(bY[c[(c[C>>2]|0)+12>>2]&31](w,a[H]|0)|0)<<24>>24){y=1158;break}c[j>>2]=4;J=4}L1314:do{if((y|0)==1158){y=0;J=c[Q>>2]|0;if((J|0)==(c[R>>2]|0)){M=c[(c[L>>2]|0)+40>>2]|0;b_[M&127](L)|0}else{c[Q>>2]=J+1}T=H+1|0}else if((y|0)==1120){y=0;J=H+1|0;if((J|0)==(m|0)){y=1121;break L1286}M=b$[c[(c[A>>2]|0)+36>>2]&63](w,a[J]|0,0)|0;if((M<<24>>24|0)==69|(M<<24>>24|0)==48){U=H+2|0;if((U|0)==(m|0)){y=1124;break L1286}V=M;W=b$[c[(c[A>>2]|0)+36>>2]&63](w,a[U]|0,0)|0;X=U}else{V=0;W=M;X=J}J=c[(c[D>>2]|0)+36>>2]|0;c[E>>2]=L;c[F>>2]=N;b5[J&7](q,e,r,s,h,j,k,W,V);c[x>>2]=c[G>>2];T=X+1|0}else if((y|0)==1131){while(1){y=0;J=P+1|0;if((J|0)==(m|0)){Y=m;break}M=a[J]|0;if(M<<24>>24<=-1){Y=J;break}if((b[O+(M<<24>>24<<1)>>1]&8192)==0){Y=J;break}else{P=J;y=1131}}K=L;J=N;while(1){do{if((K|0)==0){Z=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){Z=K;break}if((b_[c[(c[K>>2]|0)+36>>2]&127](K)|0)!=-1){Z=K;break}c[x>>2]=0;Z=0}}while(0);M=(Z|0)==0;do{if((J|0)==0){y=1144}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(M){_=J;break}else{T=Y;break L1314}}if((b_[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1){c[z>>2]=0;y=1144;break}else{if(M^(J|0)==0){_=J;break}else{T=Y;break L1314}}}}while(0);if((y|0)==1144){y=0;if(M){T=Y;break L1314}else{_=0}}U=Z+12|0;$=c[U>>2]|0;aa=Z+16|0;if(($|0)==(c[aa>>2]|0)){ab=(b_[c[(c[Z>>2]|0)+36>>2]&127](Z)|0)&255}else{ab=a[$]|0}if(ab<<24>>24<=-1){T=Y;break L1314}if((b[(c[B>>2]|0)+(ab<<24>>24<<1)>>1]&8192)==0){T=Y;break L1314}$=c[U>>2]|0;if(($|0)==(c[aa>>2]|0)){aa=c[(c[Z>>2]|0)+40>>2]|0;b_[aa&127](Z)|0;K=Z;J=_;continue}else{c[U>>2]=$+1;K=Z;J=_;continue}}}}while(0);if((T|0)==(m|0)){y=1163;break L1284}H=T;I=c[j>>2]|0}if((y|0)==1121){c[j>>2]=4;ac=L;break}else if((y|0)==1124){c[j>>2]=4;ac=L;break}else if((y|0)==1117){c[j>>2]=4;ac=L;break}}}while(0);if((y|0)==1163){ac=c[x>>2]|0}w=f|0;do{if((ac|0)!=0){if((c[ac+12>>2]|0)!=(c[ac+16>>2]|0)){break}if((b_[c[(c[ac>>2]|0)+36>>2]&127](ac)|0)!=-1){break}c[w>>2]=0}}while(0);x=c[w>>2]|0;v=(x|0)==0;I=g|0;H=c[I>>2]|0;L1372:do{if((H|0)==0){y=1173}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((b_[c[(c[H>>2]|0)+36>>2]&127](H)|0)!=-1){break}c[I>>2]=0;y=1173;break L1372}}while(0);if(!v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);do{if((y|0)==1173){if(v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ad=d|0;c[ad>>2]=x;i=n;return}}while(0);n=bf(4)|0;jX(n);aN(n|0,8176,132)}function f9(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;dZ(m,f);f=m|0;m=c[f>>2]|0;if((c[3292]|0)!=-1){c[l>>2]=13168;c[l+4>>2]=12;c[l+8>>2]=0;dn(13168,l,94)}l=(c[3293]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;c_(o)|0;o=c[e>>2]|0;q=b+8|0;r=b_[c[c[q>>2]>>2]&127](q)|0;c[k>>2]=o;o=(eW(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bf(4)|0;jX(j);aN(j|0,8176,132)}function ga(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;dZ(m,f);f=m|0;m=c[f>>2]|0;if((c[3292]|0)!=-1){c[l>>2]=13168;c[l+4>>2]=12;c[l+8>>2]=0;dn(13168,l,94)}l=(c[3293]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;c_(o)|0;o=c[e>>2]|0;q=b+8|0;r=b_[c[(c[q>>2]|0)+4>>2]&127](q)|0;c[k>>2]=o;o=(eW(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bf(4)|0;jX(j);aN(j|0,8176,132)}function gb(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;dZ(l,f);f=l|0;l=c[f>>2]|0;if((c[3292]|0)!=-1){c[k>>2]=13168;c[k+4>>2]=12;c[k+8>>2]=0;dn(13168,k,94)}k=(c[3293]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;c_(n)|0;c[j>>2]=c[e>>2];n=gg(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=bf(4)|0;jX(b);aN(b|0,8176,132)}function gc(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L1430:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((b_[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L1439:do{if((l|0)==0){m=1229}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((b_[c[(c[l>>2]|0)+36>>2]&127](l)|0)!=-1){break}c[e>>2]=0;m=1229;break L1439}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L1430}}}while(0);if((m|0)==1229){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(b_[c[(c[l>>2]|0)+36>>2]&127](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;b_[u&127](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((b_[c[(c[o>>2]|0)+36>>2]&127](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=1248}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((b_[c[(c[p>>2]|0)+36>>2]&127](p)|0)==-1){c[e>>2]=0;m=1248;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==1248){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function gd(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;dZ(z,g);_=z|0;z=c[_>>2]|0;if((c[3292]|0)!=-1){c[y>>2]=13168;c[y+4>>2]=12;c[y+8>>2]=0;dn(13168,y,94)}y=(c[3293]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;c_(aa)|0;aa=k<<24>>24;L1487:do{if((aa|0)==73){ac=j+8|0;c[t>>2]=c[f>>2];ad=gg(e,t,h,ab,2)|0;ae=c[h>>2]|0;do{if((ae&4|0)==0){if((ad-1|0)>>>0>=12){break}c[ac>>2]=ad;break L1487}}while(0);c[h>>2]=ae|4}else if((aa|0)==109){c[r>>2]=c[f>>2];ad=(gg(e,r,h,ab,2)|0)-1|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<12){c[j+16>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==72){c[u>>2]=c[f>>2];ac=gg(e,u,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<24){c[j+8>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==100|(aa|0)==101){ad=j+12|0;c[v>>2]=c[f>>2];ac=gg(e,v,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ac-1|0)>>>0>=31){break}c[ad>>2]=ac;break L1487}}while(0);c[h>>2]=af|4}else if((aa|0)==82){ac=e|0;c[P>>2]=c[ac>>2];c[Q>>2]=c[f>>2];f8(O,d,P,Q,g,h,j,2336,2341);c[ac>>2]=c[O>>2]}else if((aa|0)==120){ac=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];bV[ac&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==88){ac=d+8|0;ad=b_[c[(c[ac>>2]|0)+24>>2]&127](ac)|0;ac=e|0;c[X>>2]=c[ac>>2];c[Y>>2]=c[f>>2];ae=ad;ag=a[ad]|0;if((ag&1)==0){ah=ae+1|0;ai=ae+1|0}else{ae=c[ad+8>>2]|0;ah=ae;ai=ae}ae=ag&255;if((ae&1|0)==0){aj=ae>>>1}else{aj=c[ad+4>>2]|0}f8(W,d,X,Y,g,h,j,ai,ah+aj|0);c[ac>>2]=c[W>>2]}else if((aa|0)==77){c[q>>2]=c[f>>2];ac=gg(e,q,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<60){c[j+4>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==112){c[K>>2]=c[f>>2];ge(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ad=e|0;c[M>>2]=c[ad>>2];c[N>>2]=c[f>>2];f8(L,d,M,N,g,h,j,2344,2355);c[ad>>2]=c[L>>2]}else if((aa|0)==68){ad=e|0;c[E>>2]=c[ad>>2];c[F>>2]=c[f>>2];f8(D,d,E,F,g,h,j,2368,2376);c[ad>>2]=c[D>>2]}else if((aa|0)==70){ad=e|0;c[H>>2]=c[ad>>2];c[I>>2]=c[f>>2];f8(G,d,H,I,g,h,j,2360,2368);c[ad>>2]=c[G>>2]}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];gc(0,e,J,h,ab)}else if((aa|0)==83){c[p>>2]=c[f>>2];ad=gg(e,p,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<61){c[j>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=gg(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==99){ac=d+8|0;ad=b_[c[(c[ac>>2]|0)+12>>2]&127](ac)|0;ac=e|0;c[B>>2]=c[ac>>2];c[C>>2]=c[f>>2];ae=ad;ag=a[ad]|0;if((ag&1)==0){ak=ae+1|0;al=ae+1|0}else{ae=c[ad+8>>2]|0;ak=ae;al=ae}ae=ag&255;if((ae&1|0)==0){am=ae>>>1}else{am=c[ad+4>>2]|0}f8(A,d,B,C,g,h,j,al,ak+am|0);c[ac>>2]=c[A>>2]}else if((aa|0)==106){c[s>>2]=c[f>>2];ac=gg(e,s,h,ab,3)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<366){c[j+28>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==121){c[n>>2]=c[f>>2];ad=gg(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ad|0)<69){an=ad+2e3|0}else{an=(ad-69|0)>>>0<31?ad+1900|0:ad}c[j+20>>2]=an-1900}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ad=c[f>>2]|0;ac=d+8|0;ae=b_[c[(c[ac>>2]|0)+4>>2]&127](ac)|0;c[w>>2]=ad;ad=(eW(e,w,ae,ae+288|0,ab,h,0)|0)-ae|0;if((ad|0)>=288){break}c[j+16>>2]=((ad|0)/12|0|0)%12|0}else if((aa|0)==84){ad=e|0;c[S>>2]=c[ad>>2];c[T>>2]=c[f>>2];f8(R,d,S,T,g,h,j,2328,2336);c[ad>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ad=gg(e,o,h,ab,1)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ad|0)<7){c[j+24>>2]=ad;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==97|(aa|0)==65){ae=c[f>>2]|0;ad=d+8|0;ac=b_[c[c[ad>>2]>>2]&127](ad)|0;c[x>>2]=ae;ae=(eW(e,x,ac,ac+168|0,ab,h,0)|0)-ac|0;if((ae|0)>=168){break}c[j+24>>2]=((ae|0)/12|0|0)%7|0}else if((aa|0)==37){c[Z>>2]=c[f>>2];gf(0,e,Z,h,ab)}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=bf(4)|0;jX(l);aN(l|0,8176,132)}function ge(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=b_[c[(c[l>>2]|0)+8>>2]&127](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=eW(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function gf(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((b_[c[(c[d>>2]|0)+36>>2]&127](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L1600:do{if((e|0)==0){k=1359}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((b_[c[(c[e>>2]|0)+36>>2]&127](e)|0)!=-1){break}c[j>>2]=0;k=1359;break L1600}}while(0);if(d){l=e;m=0}else{k=1360}}}while(0);if((k|0)==1359){if(d){k=1360}else{l=0;m=1}}if((k|0)==1360){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(b_[c[(c[d>>2]|0)+36>>2]&127](d)|0)&255}else{n=a[e]|0}if((b$[c[(c[g>>2]|0)+36>>2]&63](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;b_[d&127](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((b_[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=1379}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((b_[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1){c[j>>2]=0;k=1379;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==1379){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function gg(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((b_[c[(c[d>>2]|0)+36>>2]&127](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L1654:do{if((e|0)==0){m=1399}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((b_[c[(c[e>>2]|0)+36>>2]&127](e)|0)!=-1){break}c[l>>2]=0;m=1399;break L1654}}while(0);if(d){n=e}else{m=1400}}}while(0);if((m|0)==1399){if(d){m=1400}else{n=0}}if((m|0)==1400){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(b_[c[(c[d>>2]|0)+36>>2]&127](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(b$[c[(c[d>>2]|0)+36>>2]&63](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;b_[u&127](r)|0;v=q;w=h;x=n}else{c[s>>2]=t+1;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((b_[c[(c[t>>2]|0)+36>>2]&127](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((b_[c[(c[x>>2]|0)+36>>2]&127](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=1429;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=(b_[c[(c[A>>2]|0)+36>>2]&127](A)|0)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=1442;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=1444;break}s=((b$[c[(c[d>>2]|0)+36>>2]&63](g,E,0)|0)<<24>>24)+(y*10|0)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;b_[G&127](r)|0;v=s;w=q;x=B;continue}else{c[u>>2]=F+1;v=s;w=q;x=B;continue}}if((m|0)==1429){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((b_[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L1711:do{if(D){m=1439}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){break}c[l>>2]=0;m=1439;break L1711}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==1439){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}else if((m|0)==1444){i=j;return o|0}else if((m|0)==1442){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function gh(a){a=a|0;return 2}function gi(a){a=a|0;cE(a|0);kn(a);return}function gj(a){a=a|0;cE(a|0);return}function gk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];gm(a,b,k,l,f,g,h,2296,2328);i=j;return}function gl(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=b_[c[(c[n>>2]|0)+20>>2]&127](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}gm(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function gm(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+48|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=l+40|0;dZ(n,f);r=n|0;n=c[r>>2]|0;if((c[3290]|0)!=-1){c[m>>2]=13160;c[m+4>>2]=12;c[m+8>>2]=0;dn(13160,m,94)}m=(c[3291]|0)-1|0;s=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-s>>2>>>0>m>>>0){t=c[s+(m<<2)>>2]|0;if((t|0)==0){break}u=t;v=c[r>>2]|0;c_(v)|0;c[g>>2]=0;v=d|0;L1747:do{if((j|0)==(k|0)){w=1530}else{x=e|0;y=t;z=t;A=t;B=b;C=p|0;D=q|0;E=o|0;F=j;G=0;L1749:while(1){H=G;while(1){if((H|0)!=0){w=1530;break L1747}I=c[v>>2]|0;do{if((I|0)==0){J=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){L=b_[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{L=c[K>>2]|0}if((L|0)!=-1){J=I;break}c[v>>2]=0;J=0}}while(0);I=(J|0)==0;K=c[x>>2]|0;do{if((K|0)==0){w=1482}else{M=c[K+12>>2]|0;if((M|0)==(c[K+16>>2]|0)){N=b_[c[(c[K>>2]|0)+36>>2]&127](K)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[x>>2]=0;w=1482;break}else{if(I^(K|0)==0){O=K;break}else{w=1484;break L1749}}}}while(0);if((w|0)==1482){w=0;if(I){w=1484;break L1749}else{O=0}}if((b$[c[(c[y>>2]|0)+52>>2]&63](u,c[F>>2]|0,0)|0)<<24>>24==37){w=1487;break}if(b$[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[F>>2]|0)|0){P=F;w=1497;break}Q=J+12|0;K=c[Q>>2]|0;R=J+16|0;if((K|0)==(c[R>>2]|0)){S=b_[c[(c[J>>2]|0)+36>>2]&127](J)|0}else{S=c[K>>2]|0}K=bY[c[(c[A>>2]|0)+28>>2]&31](u,S)|0;if((K|0)==(bY[c[(c[A>>2]|0)+28>>2]&31](u,c[F>>2]|0)|0)){w=1525;break}c[g>>2]=4;H=4}L1781:do{if((w|0)==1487){w=0;H=F+4|0;if((H|0)==(k|0)){w=1488;break L1749}K=b$[c[(c[y>>2]|0)+52>>2]&63](u,c[H>>2]|0,0)|0;if((K<<24>>24|0)==69|(K<<24>>24|0)==48){M=F+8|0;if((M|0)==(k|0)){w=1491;break L1749}T=K;U=b$[c[(c[y>>2]|0)+52>>2]&63](u,c[M>>2]|0,0)|0;V=M}else{T=0;U=K;V=H}H=c[(c[B>>2]|0)+36>>2]|0;c[C>>2]=J;c[D>>2]=O;b5[H&7](o,b,p,q,f,g,h,U,T);c[v>>2]=c[E>>2];W=V+4|0}else if((w|0)==1497){while(1){w=0;H=P+4|0;if((H|0)==(k|0)){X=k;break}if(b$[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[H>>2]|0)|0){P=H;w=1497}else{X=H;break}}I=J;H=O;while(1){do{if((I|0)==0){Y=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){Z=b_[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{Z=c[K>>2]|0}if((Z|0)!=-1){Y=I;break}c[v>>2]=0;Y=0}}while(0);K=(Y|0)==0;do{if((H|0)==0){w=1512}else{M=c[H+12>>2]|0;if((M|0)==(c[H+16>>2]|0)){_=b_[c[(c[H>>2]|0)+36>>2]&127](H)|0}else{_=c[M>>2]|0}if((_|0)==-1){c[x>>2]=0;w=1512;break}else{if(K^(H|0)==0){$=H;break}else{W=X;break L1781}}}}while(0);if((w|0)==1512){w=0;if(K){W=X;break L1781}else{$=0}}M=Y+12|0;aa=c[M>>2]|0;ab=Y+16|0;if((aa|0)==(c[ab>>2]|0)){ac=b_[c[(c[Y>>2]|0)+36>>2]&127](Y)|0}else{ac=c[aa>>2]|0}if(!(b$[c[(c[z>>2]|0)+12>>2]&63](u,8192,ac)|0)){W=X;break L1781}aa=c[M>>2]|0;if((aa|0)==(c[ab>>2]|0)){ab=c[(c[Y>>2]|0)+40>>2]|0;b_[ab&127](Y)|0;I=Y;H=$;continue}else{c[M>>2]=aa+4;I=Y;H=$;continue}}}else if((w|0)==1525){w=0;H=c[Q>>2]|0;if((H|0)==(c[R>>2]|0)){I=c[(c[J>>2]|0)+40>>2]|0;b_[I&127](J)|0}else{c[Q>>2]=H+4}W=F+4|0}}while(0);if((W|0)==(k|0)){w=1530;break L1747}F=W;G=c[g>>2]|0}if((w|0)==1484){c[g>>2]=4;ad=J;break}else if((w|0)==1488){c[g>>2]=4;ad=J;break}else if((w|0)==1491){c[g>>2]=4;ad=J;break}}}while(0);if((w|0)==1530){ad=c[v>>2]|0}u=d|0;do{if((ad|0)!=0){t=c[ad+12>>2]|0;if((t|0)==(c[ad+16>>2]|0)){ae=b_[c[(c[ad>>2]|0)+36>>2]&127](ad)|0}else{ae=c[t>>2]|0}if((ae|0)!=-1){break}c[u>>2]=0}}while(0);v=c[u>>2]|0;t=(v|0)==0;G=e|0;F=c[G>>2]|0;do{if((F|0)==0){w=1543}else{z=c[F+12>>2]|0;if((z|0)==(c[F+16>>2]|0)){af=b_[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{af=c[z>>2]|0}if((af|0)==-1){c[G>>2]=0;w=1543;break}if(!(t^(F|0)==0)){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);do{if((w|0)==1543){if(t){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ag=a|0;c[ag>>2]=v;i=l;return}}while(0);l=bf(4)|0;jX(l);aN(l|0,8176,132)}function gn(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;dZ(m,f);f=m|0;m=c[f>>2]|0;if((c[3290]|0)!=-1){c[l>>2]=13160;c[l+4>>2]=12;c[l+8>>2]=0;dn(13160,l,94)}l=(c[3291]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;c_(o)|0;o=c[e>>2]|0;q=b+8|0;r=b_[c[c[q>>2]>>2]&127](q)|0;c[k>>2]=o;o=(fn(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bf(4)|0;jX(j);aN(j|0,8176,132)}function go(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;dZ(m,f);f=m|0;m=c[f>>2]|0;if((c[3290]|0)!=-1){c[l>>2]=13160;c[l+4>>2]=12;c[l+8>>2]=0;dn(13160,l,94)}l=(c[3291]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;c_(o)|0;o=c[e>>2]|0;q=b+8|0;r=b_[c[(c[q>>2]|0)+4>>2]&127](q)|0;c[k>>2]=o;o=(fn(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=bf(4)|0;jX(j);aN(j|0,8176,132)}function gp(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;dZ(l,f);f=l|0;l=c[f>>2]|0;if((c[3290]|0)!=-1){c[k>>2]=13160;c[k+4>>2]=12;c[k+8>>2]=0;dn(13160,k,94)}k=(c[3291]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;c_(n)|0;c[j>>2]=c[e>>2];n=gu(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=bf(4)|0;jX(b);aN(b|0,8176,132)}function gq(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L1905:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=b_[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=1603}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=b_[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=1603;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L1905}}}}while(0);if((m|0)==1603){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=b_[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{s=c[k>>2]|0}if(!(b$[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;b_[u&127](k)|0;continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=b_[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=1625}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=b_[c[(c[q>>2]|0)+36>>2]&127](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=1625;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==1625){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function gr(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;dZ(z,g);_=z|0;z=c[_>>2]|0;if((c[3290]|0)!=-1){c[y>>2]=13160;c[y+4>>2]=12;c[y+8>>2]=0;dn(13160,y,94)}y=(c[3291]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;c_(aa)|0;aa=k<<24>>24;L1970:do{if((aa|0)==84){ac=e|0;c[S>>2]=c[ac>>2];c[T>>2]=c[f>>2];gm(R,d,S,T,g,h,j,2160,2192);c[ac>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ac=gu(e,o,h,ab,1)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<7){c[j+24>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];gq(0,e,J,h,ab)}else if((aa|0)==112){c[K>>2]=c[f>>2];gs(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ad=e|0;c[M>>2]=c[ad>>2];c[N>>2]=c[f>>2];gm(L,d,M,N,g,h,j,2216,2260);c[ad>>2]=c[L>>2]}else if((aa|0)==88){ad=d+8|0;ac=b_[c[(c[ad>>2]|0)+24>>2]&127](ad)|0;ad=e|0;c[X>>2]=c[ad>>2];c[Y>>2]=c[f>>2];ae=a[ac]|0;if((ae&1)==0){af=ac+4|0;ag=ac+4|0}else{ah=c[ac+8>>2]|0;af=ah;ag=ah}ah=ae&255;if((ah&1|0)==0){ai=ah>>>1}else{ai=c[ac+4>>2]|0}gm(W,d,X,Y,g,h,j,ag,af+(ai<<2)|0);c[ad>>2]=c[W>>2]}else if((aa|0)==37){c[Z>>2]=c[f>>2];gt(0,e,Z,h,ab)}else if((aa|0)==97|(aa|0)==65){ad=c[f>>2]|0;ac=d+8|0;ah=b_[c[c[ac>>2]>>2]&127](ac)|0;c[x>>2]=ad;ad=(fn(e,x,ah,ah+168|0,ab,h,0)|0)-ah|0;if((ad|0)>=168){break}c[j+24>>2]=((ad|0)/12|0|0)%7|0}else if((aa|0)==68){ad=e|0;c[E>>2]=c[ad>>2];c[F>>2]=c[f>>2];gm(D,d,E,F,g,h,j,2264,2296);c[ad>>2]=c[D>>2]}else if((aa|0)==70){ad=e|0;c[H>>2]=c[ad>>2];c[I>>2]=c[f>>2];gm(G,d,H,I,g,h,j,2128,2160);c[ad>>2]=c[G>>2]}else if((aa|0)==100|(aa|0)==101){ad=j+12|0;c[v>>2]=c[f>>2];ah=gu(e,v,h,ab,2)|0;ac=c[h>>2]|0;do{if((ac&4|0)==0){if((ah-1|0)>>>0>=31){break}c[ad>>2]=ah;break L1970}}while(0);c[h>>2]=ac|4}else if((aa|0)==106){c[s>>2]=c[f>>2];ah=gu(e,s,h,ab,3)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ah|0)<366){c[j+28>>2]=ah;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==89){c[m>>2]=c[f>>2];ad=gu(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ad-1900}else if((aa|0)==109){c[r>>2]=c[f>>2];ad=(gu(e,r,h,ab,2)|0)-1|0;ah=c[h>>2]|0;if((ah&4|0)==0&(ad|0)<12){c[j+16>>2]=ad;break}else{c[h>>2]=ah|4;break}}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ah=c[f>>2]|0;ad=d+8|0;ae=b_[c[(c[ad>>2]|0)+4>>2]&127](ad)|0;c[w>>2]=ah;ah=(fn(e,w,ae,ae+288|0,ab,h,0)|0)-ae|0;if((ah|0)>=288){break}c[j+16>>2]=((ah|0)/12|0|0)%12|0}else if((aa|0)==82){ah=e|0;c[P>>2]=c[ah>>2];c[Q>>2]=c[f>>2];gm(O,d,P,Q,g,h,j,2192,2212);c[ah>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ah=gu(e,p,h,ab,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ah|0)<61){c[j>>2]=ah;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==73){ae=j+8|0;c[t>>2]=c[f>>2];ah=gu(e,t,h,ab,2)|0;ad=c[h>>2]|0;do{if((ad&4|0)==0){if((ah-1|0)>>>0>=12){break}c[ae>>2]=ah;break L1970}}while(0);c[h>>2]=ad|4}else if((aa|0)==72){c[u>>2]=c[f>>2];ah=gu(e,u,h,ab,2)|0;ae=c[h>>2]|0;if((ae&4|0)==0&(ah|0)<24){c[j+8>>2]=ah;break}else{c[h>>2]=ae|4;break}}else if((aa|0)==77){c[q>>2]=c[f>>2];ae=gu(e,q,h,ab,2)|0;ah=c[h>>2]|0;if((ah&4|0)==0&(ae|0)<60){c[j+4>>2]=ae;break}else{c[h>>2]=ah|4;break}}else if((aa|0)==121){c[n>>2]=c[f>>2];ah=gu(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ah|0)<69){aj=ah+2e3|0}else{aj=(ah-69|0)>>>0<31?ah+1900|0:ah}c[j+20>>2]=aj-1900}else if((aa|0)==99){ah=d+8|0;ae=b_[c[(c[ah>>2]|0)+12>>2]&127](ah)|0;ah=e|0;c[B>>2]=c[ah>>2];c[C>>2]=c[f>>2];ac=a[ae]|0;if((ac&1)==0){ak=ae+4|0;al=ae+4|0}else{am=c[ae+8>>2]|0;ak=am;al=am}am=ac&255;if((am&1|0)==0){an=am>>>1}else{an=c[ae+4>>2]|0}gm(A,d,B,C,g,h,j,al,ak+(an<<2)|0);c[ah>>2]=c[A>>2]}else if((aa|0)==120){ah=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];bV[ah&127](b,d,U,V,g,h,j);i=l;return}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=bf(4)|0;jX(l);aN(l|0,8176,132)}function gs(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=b_[c[(c[l>>2]|0)+8>>2]&127](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=fn(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function gt(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=b_[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=1738}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=b_[c[(c[d>>2]|0)+36>>2]&127](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=1738;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=1740;break}}}}while(0);if((l|0)==1738){if(h){l=1740}else{n=0;o=1}}if((l|0)==1740){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=b_[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{p=c[d>>2]|0}if((b$[c[(c[f>>2]|0)+52>>2]&63](f,p,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;b_[h&127](p)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=b_[c[(c[d>>2]|0)+36>>2]&127](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=1762}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=b_[c[(c[n>>2]|0)+36>>2]&127](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=1762;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==1762){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function gu(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=b_[c[(c[a>>2]|0)+36>>2]&127](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=1784}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=b_[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=1784;break}else{if(j^(b|0)==0){o=b;break}else{m=1786;break}}}}while(0);if((m|0)==1784){if(j){m=1786}else{o=0}}if((m|0)==1786){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=b_[c[(c[j>>2]|0)+36>>2]&127](j)|0}else{q=c[b>>2]|0}b=e;if(!(b$[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(b$[c[(c[j>>2]|0)+52>>2]&63](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;b_[r&127](q)|0;s=n;t=f;u=o}else{c[a>>2]=k+4;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=b_[c[(c[f>>2]|0)+36>>2]&127](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=b_[c[(c[u>>2]|0)+36>>2]&127](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=b_[c[(c[y>>2]|0)+36>>2]&127](y)|0}else{D=c[f>>2]|0}if(!(b$[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=1835;break}f=((b$[c[(c[j>>2]|0)+52>>2]&63](e,D,0)|0)<<24>>24)+(v*10|0)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;b_[q&127](n)|0;s=f;t=o;u=z;continue}else{c[k>>2]=a+4;s=f;t=o;u=z;continue}}if((m|0)==1835){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=b_[c[(c[y>>2]|0)+36>>2]&127](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=1830}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=b_[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=1830;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==1830){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function gv(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2];f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=bS(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=bY[c[(c[s>>2]|0)+52>>2]&31](s,m&255)|0}else{c[l>>2]=j+1;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function gw(b){b=b|0;var d=0,e=0,f=0,g=0;d=b;e=b+8|0;f=c[e>>2]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((f|0)==(c[2952]|0)){g=b|0;cE(g);kn(d);return}bd(c[e>>2]|0);g=b|0;cE(g);kn(d);return}function gx(b){b=b|0;var d=0,e=0,f=0;d=b+8|0;e=c[d>>2]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((e|0)==(c[2952]|0)){f=b|0;cE(f);return}bd(c[d>>2]|0);f=b|0;cE(f);return}function gy(b){b=b|0;var d=0,e=0,f=0,g=0;d=b;e=b+8|0;f=c[e>>2]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((f|0)==(c[2952]|0)){g=b|0;cE(g);kn(d);return}bd(c[e>>2]|0);g=b|0;cE(g);kn(d);return}function gz(a){a=a|0;return 127}function gA(a){a=a|0;return 127}function gB(a){a=a|0;return 0}function gC(a){a=a|0;return 127}function gD(a){a=a|0;return 127}function gE(a){a=a|0;return 0}function gF(a){a=a|0;return 2147483647}function gG(a){a=a|0;return 2147483647}function gH(a){a=a|0;return 0}function gI(a){a=a|0;return 2147483647}function gJ(a){a=a|0;return 2147483647}function gK(a){a=a|0;return 0}function gL(a){a=a|0;return}function gM(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gN(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gO(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gP(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gQ(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gR(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gS(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function gT(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}
function gU(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2];e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400;hk(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=bY[c[(c[o>>2]|0)+52>>2]&31](o,l)|0}else{c[k>>2]=d+4;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function gV(a){a=a|0;cE(a|0);kn(a);return}function gW(a){a=a|0;cE(a|0);return}function gX(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function gY(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function gZ(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function g_(a,b){a=a|0;b=b|0;ds(a,1,45);return}function g$(a){a=a|0;cE(a|0);kn(a);return}function g0(a){a=a|0;cE(a|0);return}function g1(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function g2(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function g3(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function g4(a,b){a=a|0;b=b|0;ds(a,1,45);return}function g5(a){a=a|0;cE(a|0);kn(a);return}function g6(a){a=a|0;cE(a|0);return}function g7(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function g8(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function g9(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function ha(a,b){a=a|0;b=b|0;dE(a,1,45);return}function hb(a){a=a|0;cE(a|0);kn(a);return}function hc(a){a=a|0;cE(a|0);return}function hd(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function he(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function hf(a,b){a=a|0;b=b|0;kv(a|0,0,12);return}function hg(a,b){a=a|0;b=b|0;dE(a,1,45);return}function hh(a){a=a|0;cE(a|0);kn(a);return}function hi(a){a=a|0;cE(a|0);return}function hj(b){b=b|0;var d=0,e=0,f=0;d=b+8|0;e=c[d>>2]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((e|0)==(c[2952]|0)){f=b|0;cE(f);return}bd(c[d>>2]|0);f=b|0;cE(f);return}function hk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;bS(n|0,100,o|0,f|0,c[g>>2]|0)|0;c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=bO(c[g>>2]|0)|0;g=jL(d,m,n,l)|0;if((f|0)!=0){bO(f|0)|0}if((g|0)==-1){hq(904)}else{c[e>>2]=d+(g<<2);i=j;return}}function hl(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;d=i;i=i+280|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=d+176|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=166;w=m+100|0;dZ(p,h);m=p|0;x=c[m>>2]|0;if((c[3292]|0)!=-1){c[l>>2]=13168;c[l+4>>2]=12;c[l+8>>2]=0;dn(13168,l,94)}l=(c[3293]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;B=f|0;c[r>>2]=c[B>>2];do{if(hm(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){C=s|0;D=c[(c[z>>2]|0)+32>>2]|0;b8[D&15](A,2112,2122,C)|0;D=t|0;E=c[o>>2]|0;F=c[u>>2]|0;G=E-F|0;do{if((G|0)>98){H=ke(G+2|0)|0;if((H|0)!=0){I=H;J=H;break}ks();I=0;J=0}else{I=D;J=0}}while(0);if((a[q]&1)==0){K=I}else{a[I]=45;K=I+1|0}if(F>>>0<E>>>0){G=s+10|0;H=s;L=K;M=F;while(1){N=C;while(1){if((N|0)==(G|0)){O=G;break}if((a[N]|0)==(a[M]|0)){O=N;break}else{N=N+1|0}}a[L]=a[2112+(O-H)|0]|0;N=M+1|0;P=L+1|0;if(N>>>0<(c[o>>2]|0)>>>0){L=P;M=N}else{Q=P;break}}}else{Q=K}a[Q]=0;M=aH(D|0,1408,(L=i,i=i+8|0,c[L>>2]=k,L)|0)|0;i=L;if((M|0)==1){if((J|0)==0){break}kf(J);break}M=bf(8)|0;c8(M,1368);aN(M|0,8192,22)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){R=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){R=z;break}if((b_[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1){R=z;break}c[A>>2]=0;R=0}}while(0);A=(R|0)==0;z=c[B>>2]|0;do{if((z|0)==0){S=2014}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{S=2016;break}}if((b_[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1){c[B>>2]=0;S=2014;break}else{if(A^(z|0)==0){break}else{S=2016;break}}}}while(0);if((S|0)==2014){if(A){S=2016}}if((S|0)==2016){c[j>>2]=c[j>>2]|2}c[b>>2]=R;z=c[m>>2]|0;c_(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}bW[c[v>>2]&511](z);i=d;return}}while(0);d=bf(4)|0;jX(d);aN(d|0,8176,132)}function hm(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0;q=i;i=i+440|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2];r=q|0;s=q+400|0;t=q+408|0;u=q+416|0;v=q+424|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=r|0;kv(w|0,0,12);E=x;F=y;G=z;H=A;kv(E|0,0,12);kv(F|0,0,12);kv(G|0,0,12);kv(H|0,0,12);hs(g,h,s,t,u,v,x,y,z,B);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=f|0;f=m+8|0;m=z+1|0;I=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+4|0;P=x+8|0;Q=A+1|0;R=A+4|0;S=A+8|0;T=s+3|0;U=n+4|0;n=v+4|0;V=p;p=166;W=D;X=D;D=r+400|0;r=0;Y=0;L2424:while(1){Z=c[g>>2]|0;do{if((Z|0)==0){_=0}else{if((c[Z+12>>2]|0)!=(c[Z+16>>2]|0)){_=Z;break}if((b_[c[(c[Z>>2]|0)+36>>2]&127](Z)|0)==-1){c[g>>2]=0;_=0;break}else{_=c[g>>2]|0;break}}}while(0);Z=(_|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=2041}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=2293;break L2424}}if((b_[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[e>>2]=0;aa=2041;break}else{if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=2293;break L2424}}}}while(0);if((aa|0)==2041){aa=0;if(Z){ac=p;ad=W;ae=X;af=r;aa=2293;break}else{ab=0}}$=a[s+Y|0]|0;do{if(($|0)==1){if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=2293;break L2424}ag=c[g>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){ai=(b_[c[(c[ag>>2]|0)+36>>2]&127](ag)|0)&255}else{ai=a[ah]|0}if(ai<<24>>24<=-1){aa=2066;break L2424}if((b[(c[f>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){aa=2066;break L2424}ah=c[g>>2]|0;ag=ah+12|0;aj=c[ag>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=(b_[c[(c[ah>>2]|0)+40>>2]&127](ah)|0)&255}else{c[ag>>2]=aj+1;ak=a[aj]|0}du(A,ak);aa=2067}else if(($|0)==0){aa=2067}else if(($|0)==3){aj=a[F]|0;ag=aj&255;ah=(ag&1|0)==0?ag>>>1:c[L>>2]|0;ag=a[G]|0;al=ag&255;am=(al&1|0)==0?al>>>1:c[I>>2]|0;if((ah|0)==(-am|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}al=(ah|0)==0;ah=c[g>>2]|0;at=c[ah+12>>2]|0;au=c[ah+16>>2]|0;av=(at|0)==(au|0);if(!(al|(am|0)==0)){if(av){am=(b_[c[(c[ah>>2]|0)+36>>2]&127](ah)|0)&255;aw=c[g>>2]|0;ax=am;ay=a[F]|0;az=aw;aA=c[aw+12>>2]|0;aB=c[aw+16>>2]|0}else{ax=a[at]|0;ay=aj;az=ah;aA=at;aB=au}au=az+12|0;aw=(aA|0)==(aB|0);if(ax<<24>>24==(a[(ay&1)==0?K:c[M>>2]|0]|0)){if(aw){am=c[(c[az>>2]|0)+40>>2]|0;b_[am&127](az)|0}else{c[au>>2]=aA+1}au=d[F]|0;an=((au&1|0)==0?au>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(aw){aC=(b_[c[(c[az>>2]|0)+36>>2]&127](az)|0)&255}else{aC=a[aA]|0}if(aC<<24>>24!=(a[(a[G]&1)==0?m:c[J>>2]|0]|0)){aa=2133;break L2424}aw=c[g>>2]|0;au=aw+12|0;am=c[au>>2]|0;if((am|0)==(c[aw+16>>2]|0)){aD=c[(c[aw>>2]|0)+40>>2]|0;b_[aD&127](aw)|0}else{c[au>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(al){if(av){al=(b_[c[(c[ah>>2]|0)+36>>2]&127](ah)|0)&255;aE=al;aF=a[G]|0}else{aE=a[at]|0;aF=ag}if(aE<<24>>24!=(a[(aF&1)==0?m:c[J>>2]|0]|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}ag=c[g>>2]|0;al=ag+12|0;am=c[al>>2]|0;if((am|0)==(c[ag+16>>2]|0)){au=c[(c[ag>>2]|0)+40>>2]|0;b_[au&127](ag)|0}else{c[al>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(av){av=(b_[c[(c[ah>>2]|0)+36>>2]&127](ah)|0)&255;aG=av;aH=a[F]|0}else{aG=a[at]|0;aH=aj}if(aG<<24>>24!=(a[(aH&1)==0?K:c[M>>2]|0]|0)){a[l]=1;an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}aj=c[g>>2]|0;at=aj+12|0;av=c[at>>2]|0;if((av|0)==(c[aj+16>>2]|0)){ah=c[(c[aj>>2]|0)+40>>2]|0;b_[ah&127](aj)|0}else{c[at>>2]=av+1}av=d[F]|0;an=((av&1|0)==0?av>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V}else if(($|0)==2){if(!((r|0)!=0|Y>>>0<2)){if((Y|0)==2){aI=(a[T]|0)!=0}else{aI=0}if(!(N|aI)){an=0;ao=D;ap=X;aq=W;ar=p;as=V;break}}av=a[E]|0;at=(av&1)==0?j:c[P>>2]|0;L2520:do{if((Y|0)==0){aJ=at}else{if((d[s+(Y-1)|0]|0)>=2){aJ=at;break}aj=av&255;ah=at+((aj&1|0)==0?aj>>>1:c[O>>2]|0)|0;aj=at;while(1){if((aj|0)==(ah|0)){aK=ah;break}am=a[aj]|0;if(am<<24>>24<=-1){aK=aj;break}if((b[(c[f>>2]|0)+(am<<24>>24<<1)>>1]&8192)==0){aK=aj;break}else{aj=aj+1|0}}aj=aK-at|0;ah=a[H]|0;am=ah&255;al=(am&1|0)==0?am>>>1:c[R>>2]|0;if(aj>>>0>al>>>0){aJ=at;break}am=(ah&1)==0?Q:c[S>>2]|0;ah=am+al|0;if((aK|0)==(at|0)){aJ=at;break}ag=at;au=am+(al-aj)|0;while(1){if((a[au]|0)!=(a[ag]|0)){aJ=at;break L2520}aj=au+1|0;if((aj|0)==(ah|0)){aJ=aK;break}else{ag=ag+1|0;au=aj}}}}while(0);au=av&255;L2534:do{if((aJ|0)==(at+((au&1|0)==0?au>>>1:c[O>>2]|0)|0)){aL=aJ}else{ag=ab;ah=aJ;while(1){aj=c[g>>2]|0;do{if((aj|0)==0){aM=0}else{if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){aM=aj;break}if((b_[c[(c[aj>>2]|0)+36>>2]&127](aj)|0)==-1){c[g>>2]=0;aM=0;break}else{aM=c[g>>2]|0;break}}}while(0);aj=(aM|0)==0;do{if((ag|0)==0){aa=2162}else{if((c[ag+12>>2]|0)!=(c[ag+16>>2]|0)){if(aj){aN=ag;break}else{aL=ah;break L2534}}if((b_[c[(c[ag>>2]|0)+36>>2]&127](ag)|0)==-1){c[e>>2]=0;aa=2162;break}else{if(aj){aN=ag;break}else{aL=ah;break L2534}}}}while(0);if((aa|0)==2162){aa=0;if(aj){aL=ah;break L2534}else{aN=0}}al=c[g>>2]|0;am=c[al+12>>2]|0;if((am|0)==(c[al+16>>2]|0)){aO=(b_[c[(c[al>>2]|0)+36>>2]&127](al)|0)&255}else{aO=a[am]|0}if(aO<<24>>24!=(a[ah]|0)){aL=ah;break L2534}am=c[g>>2]|0;al=am+12|0;aw=c[al>>2]|0;if((aw|0)==(c[am+16>>2]|0)){aD=c[(c[am>>2]|0)+40>>2]|0;b_[aD&127](am)|0}else{c[al>>2]=aw+1}aw=ah+1|0;al=a[E]|0;am=al&255;if((aw|0)==(((al&1)==0?j:c[P>>2]|0)+((am&1|0)==0?am>>>1:c[O>>2]|0)|0)){aL=aw;break}else{ag=aN;ah=aw}}}}while(0);if(!N){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}au=a[E]|0;at=au&255;if((aL|0)==(((au&1)==0?j:c[P>>2]|0)+((at&1|0)==0?at>>>1:c[O>>2]|0)|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V}else{aa=2175;break L2424}}else if(($|0)==4){at=0;au=D;av=X;ah=W;ag=p;aw=V;L2569:while(1){am=c[g>>2]|0;do{if((am|0)==0){aP=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aP=am;break}if((b_[c[(c[am>>2]|0)+36>>2]&127](am)|0)==-1){c[g>>2]=0;aP=0;break}else{aP=c[g>>2]|0;break}}}while(0);am=(aP|0)==0;al=c[e>>2]|0;do{if((al|0)==0){aa=2188}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){if(am){break}else{break L2569}}if((b_[c[(c[al>>2]|0)+36>>2]&127](al)|0)==-1){c[e>>2]=0;aa=2188;break}else{if(am){break}else{break L2569}}}}while(0);if((aa|0)==2188){aa=0;if(am){break}}al=c[g>>2]|0;aD=c[al+12>>2]|0;if((aD|0)==(c[al+16>>2]|0)){aQ=(b_[c[(c[al>>2]|0)+36>>2]&127](al)|0)&255}else{aQ=a[aD]|0}do{if(aQ<<24>>24>-1){if((b[(c[f>>2]|0)+(aQ<<24>>24<<1)>>1]&2048)==0){aa=2207;break}aD=c[o>>2]|0;if((aD|0)==(aw|0)){al=(c[U>>2]|0)!=166;aR=c[h>>2]|0;aS=aw-aR|0;aT=aS>>>0<2147483647?aS<<1:-1;aU=kg(al?aR:0,aT)|0;if((aU|0)==0){ks()}do{if(al){c[h>>2]=aU;aV=aU}else{aR=c[h>>2]|0;c[h>>2]=aU;if((aR|0)==0){aV=aU;break}bW[c[U>>2]&511](aR);aV=c[h>>2]|0}}while(0);c[U>>2]=80;aU=aV+aS|0;c[o>>2]=aU;aW=(c[h>>2]|0)+aT|0;aX=aU}else{aW=aw;aX=aD}c[o>>2]=aX+1;a[aX]=aQ;aY=at+1|0;aZ=au;a_=av;a$=ah;a0=ag;a1=aW}else{aa=2207}}while(0);if((aa|0)==2207){aa=0;am=d[w]|0;if((((am&1|0)==0?am>>>1:c[n>>2]|0)|0)==0|(at|0)==0){break}if(aQ<<24>>24!=(a[u]|0)){break}if((av|0)==(au|0)){am=av-ah|0;aU=am>>>0<2147483647?am<<1:-1;if((ag|0)==166){a2=0}else{a2=ah}al=kg(a2,aU)|0;aj=al;if((al|0)==0){ks()}a3=aj+(aU>>>2<<2)|0;a4=aj+(am>>2<<2)|0;a5=aj;a6=80}else{a3=au;a4=av;a5=ah;a6=ag}c[a4>>2]=at;aY=0;aZ=a3;a_=a4+4|0;a$=a5;a0=a6;a1=aw}aj=c[g>>2]|0;am=aj+12|0;aU=c[am>>2]|0;if((aU|0)==(c[aj+16>>2]|0)){al=c[(c[aj>>2]|0)+40>>2]|0;b_[al&127](aj)|0;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}else{c[am>>2]=aU+1;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}}if((ah|0)==(av|0)|(at|0)==0){a7=au;a8=av;a9=ah;ba=ag}else{if((av|0)==(au|0)){aU=av-ah|0;am=aU>>>0<2147483647?aU<<1:-1;if((ag|0)==166){bb=0}else{bb=ah}aj=kg(bb,am)|0;al=aj;if((aj|0)==0){ks()}bc=al+(am>>>2<<2)|0;bd=al+(aU>>2<<2)|0;be=al;bf=80}else{bc=au;bd=av;be=ah;bf=ag}c[bd>>2]=at;a7=bc;a8=bd+4|0;a9=be;ba=bf}if((c[B>>2]|0)>0){al=c[g>>2]|0;do{if((al|0)==0){bg=0}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){bg=al;break}if((b_[c[(c[al>>2]|0)+36>>2]&127](al)|0)==-1){c[g>>2]=0;bg=0;break}else{bg=c[g>>2]|0;break}}}while(0);al=(bg|0)==0;at=c[e>>2]|0;do{if((at|0)==0){aa=2240}else{if((c[at+12>>2]|0)!=(c[at+16>>2]|0)){if(al){bh=at;break}else{aa=2247;break L2424}}if((b_[c[(c[at>>2]|0)+36>>2]&127](at)|0)==-1){c[e>>2]=0;aa=2240;break}else{if(al){bh=at;break}else{aa=2247;break L2424}}}}while(0);if((aa|0)==2240){aa=0;if(al){aa=2247;break L2424}else{bh=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bi=(b_[c[(c[at>>2]|0)+36>>2]&127](at)|0)&255}else{bi=a[ag]|0}if(bi<<24>>24!=(a[t]|0)){aa=2247;break L2424}ag=c[g>>2]|0;at=ag+12|0;ah=c[at>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){av=c[(c[ag>>2]|0)+40>>2]|0;b_[av&127](ag)|0;bj=aw;bk=bh}else{c[at>>2]=ah+1;bj=aw;bk=bh}while(1){ah=c[g>>2]|0;do{if((ah|0)==0){bl=0}else{if((c[ah+12>>2]|0)!=(c[ah+16>>2]|0)){bl=ah;break}if((b_[c[(c[ah>>2]|0)+36>>2]&127](ah)|0)==-1){c[g>>2]=0;bl=0;break}else{bl=c[g>>2]|0;break}}}while(0);ah=(bl|0)==0;do{if((bk|0)==0){aa=2263}else{if((c[bk+12>>2]|0)!=(c[bk+16>>2]|0)){if(ah){bm=bk;break}else{aa=2271;break L2424}}if((b_[c[(c[bk>>2]|0)+36>>2]&127](bk)|0)==-1){c[e>>2]=0;aa=2263;break}else{if(ah){bm=bk;break}else{aa=2271;break L2424}}}}while(0);if((aa|0)==2263){aa=0;if(ah){aa=2271;break L2424}else{bm=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bn=(b_[c[(c[at>>2]|0)+36>>2]&127](at)|0)&255}else{bn=a[ag]|0}if(bn<<24>>24<=-1){aa=2271;break L2424}if((b[(c[f>>2]|0)+(bn<<24>>24<<1)>>1]&2048)==0){aa=2271;break L2424}ag=c[o>>2]|0;if((ag|0)==(bj|0)){at=(c[U>>2]|0)!=166;av=c[h>>2]|0;au=bj-av|0;aU=au>>>0<2147483647?au<<1:-1;am=kg(at?av:0,aU)|0;if((am|0)==0){ks()}do{if(at){c[h>>2]=am;bo=am}else{av=c[h>>2]|0;c[h>>2]=am;if((av|0)==0){bo=am;break}bW[c[U>>2]&511](av);bo=c[h>>2]|0}}while(0);c[U>>2]=80;am=bo+au|0;c[o>>2]=am;bp=(c[h>>2]|0)+aU|0;bq=am}else{bp=bj;bq=ag}am=c[g>>2]|0;at=c[am+12>>2]|0;if((at|0)==(c[am+16>>2]|0)){ah=(b_[c[(c[am>>2]|0)+36>>2]&127](am)|0)&255;br=ah;bs=c[o>>2]|0}else{br=a[at]|0;bs=bq}c[o>>2]=bs+1;a[bs]=br;at=(c[B>>2]|0)-1|0;c[B>>2]=at;ah=c[g>>2]|0;am=ah+12|0;av=c[am>>2]|0;if((av|0)==(c[ah+16>>2]|0)){aj=c[(c[ah>>2]|0)+40>>2]|0;b_[aj&127](ah)|0}else{c[am>>2]=av+1}if((at|0)>0){bj=bp;bk=bm}else{bt=bp;break}}}else{bt=aw}if((c[o>>2]|0)==(c[h>>2]|0)){aa=2291;break L2424}else{an=r;ao=a7;ap=a8;aq=a9;ar=ba;as=bt}}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V}}while(0);L2723:do{if((aa|0)==2067){aa=0;if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=2293;break L2424}else{bu=ab}while(1){$=c[g>>2]|0;do{if(($|0)==0){bv=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){bv=$;break}if((b_[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[g>>2]=0;bv=0;break}else{bv=c[g>>2]|0;break}}}while(0);$=(bv|0)==0;do{if((bu|0)==0){aa=2080}else{if((c[bu+12>>2]|0)!=(c[bu+16>>2]|0)){if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2723}}if((b_[c[(c[bu>>2]|0)+36>>2]&127](bu)|0)==-1){c[e>>2]=0;aa=2080;break}else{if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2723}}}}while(0);if((aa|0)==2080){aa=0;if($){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2723}else{bw=0}}ag=c[g>>2]|0;aU=c[ag+12>>2]|0;if((aU|0)==(c[ag+16>>2]|0)){bx=(b_[c[(c[ag>>2]|0)+36>>2]&127](ag)|0)&255}else{bx=a[aU]|0}if(bx<<24>>24<=-1){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2723}if((b[(c[f>>2]|0)+(bx<<24>>24<<1)>>1]&8192)==0){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L2723}aU=c[g>>2]|0;ag=aU+12|0;au=c[ag>>2]|0;if((au|0)==(c[aU+16>>2]|0)){by=(b_[c[(c[aU>>2]|0)+40>>2]&127](aU)|0)&255}else{c[ag>>2]=au+1;by=a[au]|0}du(A,by);bu=bw}}}while(0);aw=Y+1|0;if(aw>>>0<4){V=as;p=ar;W=aq;X=ap;D=ao;r=an;Y=aw}else{ac=ar;ad=aq;ae=ap;af=an;aa=2293;break}}L2760:do{if((aa|0)==2066){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==2133){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==2175){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==2247){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==2271){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==2291){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==2293){L2768:do{if((af|0)!=0){an=af;ap=af+1|0;aq=af+8|0;ar=af+4|0;Y=1;L2770:while(1){r=d[an]|0;if((r&1|0)==0){bC=r>>>1}else{bC=c[ar>>2]|0}if(Y>>>0>=bC>>>0){break L2768}r=c[g>>2]|0;do{if((r|0)==0){bD=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){bD=r;break}if((b_[c[(c[r>>2]|0)+36>>2]&127](r)|0)==-1){c[g>>2]=0;bD=0;break}else{bD=c[g>>2]|0;break}}}while(0);r=(bD|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=2311}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(r){break}else{break L2770}}if((b_[c[(c[$>>2]|0)+36>>2]&127]($)|0)==-1){c[e>>2]=0;aa=2311;break}else{if(r){break}else{break L2770}}}}while(0);if((aa|0)==2311){aa=0;if(r){break}}$=c[g>>2]|0;ao=c[$+12>>2]|0;if((ao|0)==(c[$+16>>2]|0)){bE=(b_[c[(c[$>>2]|0)+36>>2]&127]($)|0)&255}else{bE=a[ao]|0}if((a[an]&1)==0){bF=ap}else{bF=c[aq>>2]|0}if(bE<<24>>24!=(a[bF+Y|0]|0)){break}ao=Y+1|0;$=c[g>>2]|0;D=$+12|0;X=c[D>>2]|0;if((X|0)==(c[$+16>>2]|0)){as=c[(c[$>>2]|0)+40>>2]|0;b_[as&127]($)|0;Y=ao;continue}else{c[D>>2]=X+1;Y=ao;continue}}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac;break L2760}}while(0);if((ad|0)==(ae|0)){bz=1;bA=ae;bB=ac;break}c[C>>2]=0;eZ(v,ad,ae,C);if((c[C>>2]|0)==0){bz=1;bA=ad;bB=ac;break}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac}}while(0);dj(A);dj(z);dj(y);dj(x);dj(v);if((bA|0)==0){i=q;return bz|0}bW[bB&511](bA);i=q;return bz|0}function hn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){dC(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function ho(a){a=a|0;cE(a|0);kn(a);return}function hp(a){a=a|0;cE(a|0);return}function hq(a){a=a|0;var b=0;b=bf(8)|0;c8(b,a);aN(b|0,8192,22)}function hr(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+160|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=166;u=m+100|0;dZ(p,h);m=p|0;v=c[m>>2]|0;if((c[3292]|0)!=-1){c[l>>2]=13168;c[l+4>>2]=12;c[l+8>>2]=0;dn(13168,l,94)}l=(c[3293]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(hm(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){a[k+1|0]=0;a[B]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){du(k,bY[c[(c[B>>2]|0)+28>>2]&31](y,45)|0)}x=bY[c[(c[B>>2]|0)+28>>2]&31](y,48)|0;y=c[o>>2]|0;B=y-1|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((a[C]|0)==x<<24>>24){C=C+1|0}else{break}}hn(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){D=B;break}if((b_[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){E=2391}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){break}else{E=2393;break}}if((b_[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1){c[z>>2]=0;E=2391;break}else{if(x^(A|0)==0){break}else{E=2393;break}}}}while(0);if((E|0)==2391){if(x){E=2393}}if((E|0)==2393){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;c_(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}bW[c[t>>2]&511](A);i=d;return}}while(0);d=bf(4)|0;jX(d);aN(d|0,8176,132)}function hs(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3410]|0)!=-1){c[p>>2]=13640;c[p+4>>2]=12;c[p+8>>2]=0;dn(13640,p,94)}p=(c[3411]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=bf(4)|0;L=K;jX(L);aN(K|0,8176,132)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=bf(4)|0;L=K;jX(L);aN(K|0,8176,132)}K=b;bX[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;bX[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){a[l+1|0]=0;a[q]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}dA(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];kv(s|0,0,12);dj(r);bX[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}dA(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];kv(u|0,0,12);dj(t);t=b;a[f]=b_[c[(c[t>>2]|0)+12>>2]&127](K)|0;a[g]=b_[c[(c[t>>2]|0)+16>>2]&127](K)|0;bX[c[(c[L>>2]|0)+20>>2]&127](v,K);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}dA(h,0);c[t>>2]=c[w>>2];c[t+4>>2]=c[w+4>>2];c[t+8>>2]=c[w+8>>2];kv(w|0,0,12);dj(v);bX[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}dA(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];kv(y|0,0,12);dj(x);M=b_[c[(c[b>>2]|0)+36>>2]&127](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3412]|0)!=-1){c[o>>2]=13648;c[o+4>>2]=12;c[o+8>>2]=0;dn(13648,o,94)}o=(c[3413]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=bf(4)|0;O=N;jX(O);aN(N|0,8176,132)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=bf(4)|0;O=N;jX(O);aN(N|0,8176,132)}N=K;bX[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;bX[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){a[l+1|0]=0;a[z]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}dA(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];kv(B|0,0,12);dj(A);bX[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}dA(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];kv(E|0,0,12);dj(D);D=K;a[f]=b_[c[(c[D>>2]|0)+12>>2]&127](N)|0;a[g]=b_[c[(c[D>>2]|0)+16>>2]&127](N)|0;bX[c[(c[O>>2]|0)+20>>2]&127](F,N);D=h;if((a[D]&1)==0){a[h+1|0]=0;a[D]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}dA(h,0);c[D>>2]=c[G>>2];c[D+4>>2]=c[G+4>>2];c[D+8>>2]=c[G+8>>2];kv(G|0,0,12);dj(F);bX[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){a[j+1|0]=0;a[O]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}dA(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];kv(I|0,0,12);dj(H);M=b_[c[(c[K>>2]|0)+36>>2]&127](N)|0;c[m>>2]=M;i=n;return}}function ht(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;d=i;i=i+600|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=d+496|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=166;w=m+400|0;dZ(p,h);m=p|0;x=c[m>>2]|0;if((c[3290]|0)!=-1){c[l>>2]=13160;c[l+4>>2]=12;c[l+8>>2]=0;dn(13160,l,94)}l=(c[3291]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;B=f|0;c[r>>2]=c[B>>2];do{if(hu(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){C=s|0;D=c[(c[z>>2]|0)+48>>2]|0;b8[D&15](A,2096,2106,C)|0;D=t|0;E=c[o>>2]|0;F=c[u>>2]|0;G=E-F|0;do{if((G|0)>392){H=ke((G>>2)+2|0)|0;if((H|0)!=0){I=H;J=H;break}ks();I=0;J=0}else{I=D;J=0}}while(0);if((a[q]&1)==0){K=I}else{a[I]=45;K=I+1|0}if(F>>>0<E>>>0){G=s+40|0;H=s;L=K;M=F;while(1){N=C;while(1){if((N|0)==(G|0)){O=G;break}if((c[N>>2]|0)==(c[M>>2]|0)){O=N;break}else{N=N+4|0}}a[L]=a[2096+(O-H>>2)|0]|0;N=M+4|0;P=L+1|0;if(N>>>0<(c[o>>2]|0)>>>0){L=P;M=N}else{Q=P;break}}}else{Q=K}a[Q]=0;M=aH(D|0,1408,(L=i,i=i+8|0,c[L>>2]=k,L)|0)|0;i=L;if((M|0)==1){if((J|0)==0){break}kf(J);break}M=bf(8)|0;c8(M,1368);aN(M|0,8192,22)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){R=0}else{M=c[z+12>>2]|0;if((M|0)==(c[z+16>>2]|0)){S=b_[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{S=c[M>>2]|0}if((S|0)!=-1){R=z;break}c[A>>2]=0;R=0}}while(0);A=(R|0)==0;z=c[B>>2]|0;do{if((z|0)==0){T=46}else{M=c[z+12>>2]|0;if((M|0)==(c[z+16>>2]|0)){U=b_[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{U=c[M>>2]|0}if((U|0)==-1){c[B>>2]=0;T=46;break}else{if(A^(z|0)==0){break}else{T=48;break}}}}while(0);if((T|0)==46){if(A){T=48}}if((T|0)==48){c[j>>2]=c[j>>2]|2}c[b>>2]=R;z=c[m>>2]|0;c_(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}bW[c[v>>2]&511](z);i=d;return}}while(0);d=bf(4)|0;jX(d);aN(d|0,8176,132)}function hu(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0;p=i;i=i+448|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2];q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;kv(w|0,0,12);D=x;E=y;F=z;G=A;kv(D|0,0,12);kv(E|0,0,12);kv(F|0,0,12);kv(G|0,0,12);hy(f,g,s,t,u,v,x,y,z,B);g=m|0;c[n>>2]=c[g>>2];f=b|0;b=e|0;e=l;H=z+4|0;I=z+8|0;J=y+4|0;K=y+8|0;L=(h&512|0)!=0;h=x+4|0;M=x+8|0;N=A+4|0;O=A+8|0;P=s+3|0;Q=v+4|0;R=166;S=o;T=o;o=r+400|0;r=0;U=0;L65:while(1){V=c[f>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=b_[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[f>>2]=0;W=1;break}else{W=(c[f>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=74}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=b_[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=74;break}else{if(W^(V|0)==0){$=V;break}else{aa=R;ab=S;ac=T;ad=r;Z=314;break L65}}}}while(0);if((Z|0)==74){Z=0;if(W){aa=R;ab=S;ac=T;ad=r;Z=314;break}else{$=0}}V=a[s+U|0]|0;L89:do{if((V|0)==1){if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=314;break L65}X=c[f>>2]|0;ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){af=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{af=c[ae>>2]|0}if(!(b$[c[(c[e>>2]|0)+12>>2]&63](l,8192,af)|0)){Z=98;break L65}ae=c[f>>2]|0;X=ae+12|0;ag=c[X>>2]|0;if((ag|0)==(c[ae+16>>2]|0)){ah=b_[c[(c[ae>>2]|0)+40>>2]&127](ae)|0}else{c[X>>2]=ag+4;ah=c[ag>>2]|0}dz(A,ah);Z=99}else if((V|0)==0){Z=99}else if((V|0)==3){ag=a[E]|0;X=ag&255;ae=(X&1|0)==0;ai=a[F]|0;aj=ai&255;ak=(aj&1|0)==0;if(((ae?X>>>1:c[J>>2]|0)|0)==(-(ak?aj>>>1:c[H>>2]|0)|0)){al=r;am=o;an=T;ao=S;ap=R;break}do{if(((ae?X>>>1:c[J>>2]|0)|0)!=0){if(((ak?aj>>>1:c[H>>2]|0)|0)==0){break}aq=c[f>>2]|0;ar=c[aq+12>>2]|0;if((ar|0)==(c[aq+16>>2]|0)){as=b_[c[(c[aq>>2]|0)+36>>2]&127](aq)|0;at=as;au=a[E]|0}else{at=c[ar>>2]|0;au=ag}ar=c[f>>2]|0;as=ar+12|0;aq=c[as>>2]|0;av=(aq|0)==(c[ar+16>>2]|0);if((at|0)==(c[((au&1)==0?J:c[K>>2]|0)>>2]|0)){if(av){aw=c[(c[ar>>2]|0)+40>>2]|0;b_[aw&127](ar)|0}else{c[as>>2]=aq+4}as=d[E]|0;al=((as&1|0)==0?as>>>1:c[J>>2]|0)>>>0>1?y:r;am=o;an=T;ao=S;ap=R;break L89}if(av){ax=b_[c[(c[ar>>2]|0)+36>>2]&127](ar)|0}else{ax=c[aq>>2]|0}if((ax|0)!=(c[((a[F]&1)==0?H:c[I>>2]|0)>>2]|0)){Z=164;break L65}aq=c[f>>2]|0;ar=aq+12|0;av=c[ar>>2]|0;if((av|0)==(c[aq+16>>2]|0)){as=c[(c[aq>>2]|0)+40>>2]|0;b_[as&127](aq)|0}else{c[ar>>2]=av+4}a[k]=1;av=d[F]|0;al=((av&1|0)==0?av>>>1:c[H>>2]|0)>>>0>1?z:r;am=o;an=T;ao=S;ap=R;break L89}}while(0);aj=c[f>>2]|0;ak=c[aj+12>>2]|0;av=(ak|0)==(c[aj+16>>2]|0);if(((ae?X>>>1:c[J>>2]|0)|0)==0){if(av){ar=b_[c[(c[aj>>2]|0)+36>>2]&127](aj)|0;ay=ar;az=a[F]|0}else{ay=c[ak>>2]|0;az=ai}if((ay|0)!=(c[((az&1)==0?H:c[I>>2]|0)>>2]|0)){al=r;am=o;an=T;ao=S;ap=R;break}ar=c[f>>2]|0;aq=ar+12|0;as=c[aq>>2]|0;if((as|0)==(c[ar+16>>2]|0)){aw=c[(c[ar>>2]|0)+40>>2]|0;b_[aw&127](ar)|0}else{c[aq>>2]=as+4}a[k]=1;as=d[F]|0;al=((as&1|0)==0?as>>>1:c[H>>2]|0)>>>0>1?z:r;am=o;an=T;ao=S;ap=R;break}if(av){av=b_[c[(c[aj>>2]|0)+36>>2]&127](aj)|0;aA=av;aB=a[E]|0}else{aA=c[ak>>2]|0;aB=ag}if((aA|0)!=(c[((aB&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;al=r;am=o;an=T;ao=S;ap=R;break}ak=c[f>>2]|0;av=ak+12|0;aj=c[av>>2]|0;if((aj|0)==(c[ak+16>>2]|0)){as=c[(c[ak>>2]|0)+40>>2]|0;b_[as&127](ak)|0}else{c[av>>2]=aj+4}aj=d[E]|0;al=((aj&1|0)==0?aj>>>1:c[J>>2]|0)>>>0>1?y:r;am=o;an=T;ao=S;ap=R}else if((V|0)==2){if(!((r|0)!=0|U>>>0<2)){if((U|0)==2){aC=(a[P]|0)!=0}else{aC=0}if(!(L|aC)){al=0;am=o;an=T;ao=S;ap=R;break}}aj=a[D]|0;av=(aj&1)==0?h:c[M>>2]|0;L161:do{if((U|0)==0){aD=av;aE=aj;aF=$}else{if((d[s+(U-1)|0]|0)<2){aG=av;aH=aj}else{aD=av;aE=aj;aF=$;break}while(1){ak=aH&255;if((aG|0)==(((aH&1)==0?h:c[M>>2]|0)+(((ak&1|0)==0?ak>>>1:c[h>>2]|0)<<2)|0)){aI=aH;break}if(!(b$[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[aG>>2]|0)|0)){Z=175;break}aG=aG+4|0;aH=a[D]|0}if((Z|0)==175){Z=0;aI=a[D]|0}ak=(aI&1)==0;as=aG-(ak?h:c[M>>2]|0)>>2;aq=a[G]|0;ar=aq&255;aw=(ar&1|0)==0;L171:do{if(as>>>0<=(aw?ar>>>1:c[N>>2]|0)>>>0){aJ=(aq&1)==0;aK=(aJ?N:c[O>>2]|0)+((aw?ar>>>1:c[N>>2]|0)-as<<2)|0;aL=(aJ?N:c[O>>2]|0)+((aw?ar>>>1:c[N>>2]|0)<<2)|0;if((aK|0)==(aL|0)){aD=aG;aE=aI;aF=$;break L161}else{aM=aK;aN=ak?h:c[M>>2]|0}while(1){if((c[aM>>2]|0)!=(c[aN>>2]|0)){break L171}aK=aM+4|0;if((aK|0)==(aL|0)){aD=aG;aE=aI;aF=$;break L161}aM=aK;aN=aN+4|0}}}while(0);aD=ak?h:c[M>>2]|0;aE=aI;aF=$}}while(0);L178:while(1){aj=aE&255;if((aD|0)==(((aE&1)==0?h:c[M>>2]|0)+(((aj&1|0)==0?aj>>>1:c[h>>2]|0)<<2)|0)){break}aj=c[f>>2]|0;do{if((aj|0)==0){aO=1}else{av=c[aj+12>>2]|0;if((av|0)==(c[aj+16>>2]|0)){aP=b_[c[(c[aj>>2]|0)+36>>2]&127](aj)|0}else{aP=c[av>>2]|0}if((aP|0)==-1){c[f>>2]=0;aO=1;break}else{aO=(c[f>>2]|0)==0;break}}}while(0);do{if((aF|0)==0){Z=196}else{aj=c[aF+12>>2]|0;if((aj|0)==(c[aF+16>>2]|0)){aQ=b_[c[(c[aF>>2]|0)+36>>2]&127](aF)|0}else{aQ=c[aj>>2]|0}if((aQ|0)==-1){c[b>>2]=0;Z=196;break}else{if(aO^(aF|0)==0){aR=aF;break}else{break L178}}}}while(0);if((Z|0)==196){Z=0;if(aO){break}else{aR=0}}aj=c[f>>2]|0;ak=c[aj+12>>2]|0;if((ak|0)==(c[aj+16>>2]|0)){aS=b_[c[(c[aj>>2]|0)+36>>2]&127](aj)|0}else{aS=c[ak>>2]|0}if((aS|0)!=(c[aD>>2]|0)){break}ak=c[f>>2]|0;aj=ak+12|0;av=c[aj>>2]|0;if((av|0)==(c[ak+16>>2]|0)){ag=c[(c[ak>>2]|0)+40>>2]|0;b_[ag&127](ak)|0}else{c[aj>>2]=av+4}aD=aD+4|0;aE=a[D]|0;aF=aR}if(!L){al=r;am=o;an=T;ao=S;ap=R;break}av=a[D]|0;aj=av&255;if((aD|0)==(((av&1)==0?h:c[M>>2]|0)+(((aj&1|0)==0?aj>>>1:c[h>>2]|0)<<2)|0)){al=r;am=o;an=T;ao=S;ap=R}else{Z=208;break L65}}else if((V|0)==4){aj=0;av=o;ak=T;ag=S;ai=R;L214:while(1){X=c[f>>2]|0;do{if((X|0)==0){aT=1}else{ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aU=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{aU=c[ae>>2]|0}if((aU|0)==-1){c[f>>2]=0;aT=1;break}else{aT=(c[f>>2]|0)==0;break}}}while(0);X=c[b>>2]|0;do{if((X|0)==0){Z=222}else{ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aV=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{aV=c[ae>>2]|0}if((aV|0)==-1){c[b>>2]=0;Z=222;break}else{if(aT^(X|0)==0){break}else{break L214}}}}while(0);if((Z|0)==222){Z=0;if(aT){break}}X=c[f>>2]|0;ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aW=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{aW=c[ae>>2]|0}if(b$[c[(c[e>>2]|0)+12>>2]&63](l,2048,aW)|0){ae=c[n>>2]|0;if((ae|0)==(c[q>>2]|0)){hz(m,n,q);aX=c[n>>2]|0}else{aX=ae}c[n>>2]=aX+4;c[aX>>2]=aW;aY=aj+1|0;aZ=av;a_=ak;a$=ag;a0=ai}else{ae=d[w]|0;if((((ae&1|0)==0?ae>>>1:c[Q>>2]|0)|0)==0|(aj|0)==0){break}if((aW|0)!=(c[u>>2]|0)){break}if((ak|0)==(av|0)){ae=(ai|0)!=166;X=ak-ag|0;ar=X>>>0<2147483647?X<<1:-1;if(ae){a1=ag}else{a1=0}ae=kg(a1,ar)|0;aw=ae;if((ae|0)==0){ks()}a2=aw+(ar>>>2<<2)|0;a3=aw+(X>>2<<2)|0;a4=aw;a5=80}else{a2=av;a3=ak;a4=ag;a5=ai}c[a3>>2]=aj;aY=0;aZ=a2;a_=a3+4|0;a$=a4;a0=a5}aw=c[f>>2]|0;X=aw+12|0;ar=c[X>>2]|0;if((ar|0)==(c[aw+16>>2]|0)){ae=c[(c[aw>>2]|0)+40>>2]|0;b_[ae&127](aw)|0;aj=aY;av=aZ;ak=a_;ag=a$;ai=a0;continue}else{c[X>>2]=ar+4;aj=aY;av=aZ;ak=a_;ag=a$;ai=a0;continue}}if((ag|0)==(ak|0)|(aj|0)==0){a6=av;a7=ak;a8=ag;a9=ai}else{if((ak|0)==(av|0)){ar=(ai|0)!=166;X=ak-ag|0;aw=X>>>0<2147483647?X<<1:-1;if(ar){ba=ag}else{ba=0}ar=kg(ba,aw)|0;ae=ar;if((ar|0)==0){ks()}bb=ae+(aw>>>2<<2)|0;bc=ae+(X>>2<<2)|0;bd=ae;be=80}else{bb=av;bc=ak;bd=ag;be=ai}c[bc>>2]=aj;a6=bb;a7=bc+4|0;a8=bd;a9=be}ae=c[B>>2]|0;if((ae|0)>0){X=c[f>>2]|0;do{if((X|0)==0){bf=1}else{aw=c[X+12>>2]|0;if((aw|0)==(c[X+16>>2]|0)){bg=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{bg=c[aw>>2]|0}if((bg|0)==-1){c[f>>2]=0;bf=1;break}else{bf=(c[f>>2]|0)==0;break}}}while(0);X=c[b>>2]|0;do{if((X|0)==0){Z=271}else{aj=c[X+12>>2]|0;if((aj|0)==(c[X+16>>2]|0)){bh=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{bh=c[aj>>2]|0}if((bh|0)==-1){c[b>>2]=0;Z=271;break}else{if(bf^(X|0)==0){bi=X;break}else{Z=277;break L65}}}}while(0);if((Z|0)==271){Z=0;if(bf){Z=277;break L65}else{bi=0}}X=c[f>>2]|0;aj=c[X+12>>2]|0;if((aj|0)==(c[X+16>>2]|0)){bj=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{bj=c[aj>>2]|0}if((bj|0)!=(c[t>>2]|0)){Z=277;break L65}aj=c[f>>2]|0;X=aj+12|0;ai=c[X>>2]|0;if((ai|0)==(c[aj+16>>2]|0)){ag=c[(c[aj>>2]|0)+40>>2]|0;b_[ag&127](aj)|0;bk=bi;bl=ae}else{c[X>>2]=ai+4;bk=bi;bl=ae}while(1){ai=c[f>>2]|0;do{if((ai|0)==0){bm=1}else{X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){bn=b_[c[(c[ai>>2]|0)+36>>2]&127](ai)|0}else{bn=c[X>>2]|0}if((bn|0)==-1){c[f>>2]=0;bm=1;break}else{bm=(c[f>>2]|0)==0;break}}}while(0);do{if((bk|0)==0){Z=294}else{ai=c[bk+12>>2]|0;if((ai|0)==(c[bk+16>>2]|0)){bo=b_[c[(c[bk>>2]|0)+36>>2]&127](bk)|0}else{bo=c[ai>>2]|0}if((bo|0)==-1){c[b>>2]=0;Z=294;break}else{if(bm^(bk|0)==0){bp=bk;break}else{Z=301;break L65}}}}while(0);if((Z|0)==294){Z=0;if(bm){Z=301;break L65}else{bp=0}}ai=c[f>>2]|0;X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){bq=b_[c[(c[ai>>2]|0)+36>>2]&127](ai)|0}else{bq=c[X>>2]|0}if(!(b$[c[(c[e>>2]|0)+12>>2]&63](l,2048,bq)|0)){Z=301;break L65}if((c[n>>2]|0)==(c[q>>2]|0)){hz(m,n,q)}X=c[f>>2]|0;ai=c[X+12>>2]|0;if((ai|0)==(c[X+16>>2]|0)){br=b_[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{br=c[ai>>2]|0}ai=c[n>>2]|0;c[n>>2]=ai+4;c[ai>>2]=br;ai=bl-1|0;c[B>>2]=ai;X=c[f>>2]|0;aj=X+12|0;ag=c[aj>>2]|0;if((ag|0)==(c[X+16>>2]|0)){ak=c[(c[X>>2]|0)+40>>2]|0;b_[ak&127](X)|0}else{c[aj>>2]=ag+4}if((ai|0)>0){bk=bp;bl=ai}else{break}}}if((c[n>>2]|0)==(c[g>>2]|0)){Z=312;break L65}else{al=r;am=a6;an=a7;ao=a8;ap=a9}}else{al=r;am=o;an=T;ao=S;ap=R}}while(0);L358:do{if((Z|0)==99){Z=0;if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=314;break L65}else{bs=$}while(1){V=c[f>>2]|0;do{if((V|0)==0){bt=1}else{ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bu=b_[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{bu=c[ae>>2]|0}if((bu|0)==-1){c[f>>2]=0;bt=1;break}else{bt=(c[f>>2]|0)==0;break}}}while(0);do{if((bs|0)==0){Z=113}else{V=c[bs+12>>2]|0;if((V|0)==(c[bs+16>>2]|0)){bv=b_[c[(c[bs>>2]|0)+36>>2]&127](bs)|0}else{bv=c[V>>2]|0}if((bv|0)==-1){c[b>>2]=0;Z=113;break}else{if(bt^(bs|0)==0){bw=bs;break}else{al=r;am=o;an=T;ao=S;ap=R;break L358}}}}while(0);if((Z|0)==113){Z=0;if(bt){al=r;am=o;an=T;ao=S;ap=R;break L358}else{bw=0}}V=c[f>>2]|0;ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bx=b_[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{bx=c[ae>>2]|0}if(!(b$[c[(c[e>>2]|0)+12>>2]&63](l,8192,bx)|0)){al=r;am=o;an=T;ao=S;ap=R;break L358}ae=c[f>>2]|0;V=ae+12|0;ai=c[V>>2]|0;if((ai|0)==(c[ae+16>>2]|0)){by=b_[c[(c[ae>>2]|0)+40>>2]&127](ae)|0}else{c[V>>2]=ai+4;by=c[ai>>2]|0}dz(A,by);bs=bw}}}while(0);ai=U+1|0;if(ai>>>0<4){R=ap;S=ao;T=an;o=am;r=al;U=ai}else{aa=ap;ab=ao;ac=an;ad=al;Z=314;break}}L395:do{if((Z|0)==98){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==164){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==208){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==277){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==301){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==312){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==314){L403:do{if((ad|0)!=0){al=ad;an=ad+4|0;ao=ad+8|0;ap=1;L405:while(1){U=d[al]|0;if((U&1|0)==0){bC=U>>>1}else{bC=c[an>>2]|0}if(ap>>>0>=bC>>>0){break L403}U=c[f>>2]|0;do{if((U|0)==0){bD=1}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bE=b_[c[(c[U>>2]|0)+36>>2]&127](U)|0}else{bE=c[r>>2]|0}if((bE|0)==-1){c[f>>2]=0;bD=1;break}else{bD=(c[f>>2]|0)==0;break}}}while(0);U=c[b>>2]|0;do{if((U|0)==0){Z=333}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bF=b_[c[(c[U>>2]|0)+36>>2]&127](U)|0}else{bF=c[r>>2]|0}if((bF|0)==-1){c[b>>2]=0;Z=333;break}else{if(bD^(U|0)==0){break}else{break L405}}}}while(0);if((Z|0)==333){Z=0;if(bD){break}}U=c[f>>2]|0;r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bG=b_[c[(c[U>>2]|0)+36>>2]&127](U)|0}else{bG=c[r>>2]|0}if((a[al]&1)==0){bH=an}else{bH=c[ao>>2]|0}if((bG|0)!=(c[bH+(ap<<2)>>2]|0)){break}r=ap+1|0;U=c[f>>2]|0;am=U+12|0;o=c[am>>2]|0;if((o|0)==(c[U+16>>2]|0)){T=c[(c[U>>2]|0)+40>>2]|0;b_[T&127](U)|0;ap=r;continue}else{c[am>>2]=o+4;ap=r;continue}}c[j>>2]=c[j>>2]|4;bz=0;bA=ab;bB=aa;break L395}}while(0);if((ab|0)==(ac|0)){bz=1;bA=ac;bB=aa;break}c[C>>2]=0;eZ(v,ab,ac,C);if((c[C>>2]|0)==0){bz=1;bA=ab;bB=aa;break}c[j>>2]=c[j>>2]|4;bz=0;bA=ab;bB=aa}}while(0);dw(A);dw(z);dw(y);dw(x);dj(v);if((bA|0)==0){i=p;return bz|0}bW[bB&511](bA);i=p;return bz|0}function hv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){en(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=j+((e-4+(-g|0)|0)>>>2)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function hw(a){a=a|0;cE(a|0);kn(a);return}function hx(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+456|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=166;u=m+400|0;dZ(p,h);m=p|0;v=c[m>>2]|0;if((c[3290]|0)!=-1){c[l>>2]=13160;c[l+4>>2]=12;c[l+8>>2]=0;dn(13160,l,94)}l=(c[3291]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(hu(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){c[k+4>>2]=0;a[B]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){dz(k,bY[c[(c[B>>2]|0)+44>>2]&31](y,45)|0)}x=bY[c[(c[B>>2]|0)+44>>2]&31](y,48)|0;y=c[o>>2]|0;B=y-4|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((c[C>>2]|0)==(x|0)){C=C+4|0}else{break}}hv(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){F=b_[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{F=c[E>>2]|0}if((F|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){G=411}else{B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){H=b_[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{H=c[B>>2]|0}if((H|0)==-1){c[z>>2]=0;G=411;break}else{if(x^(A|0)==0){break}else{G=413;break}}}}while(0);if((G|0)==411){if(x){G=413}}if((G|0)==413){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;c_(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}bW[c[t>>2]&511](A);i=d;return}}while(0);d=bf(4)|0;jX(d);aN(d|0,8176,132)}function hy(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[3406]|0)!=-1){c[p>>2]=13624;c[p+4>>2]=12;c[p+8>>2]=0;dn(13624,p,94)}p=(c[3407]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=bf(4)|0;L=K;jX(L);aN(K|0,8176,132)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=bf(4)|0;L=K;jX(L);aN(K|0,8176,132)}K=b;bX[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;bX[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){c[l+4>>2]=0;a[q]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}dF(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];kv(s|0,0,12);dw(r);bX[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}dF(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];kv(u|0,0,12);dw(t);t=b;c[f>>2]=b_[c[(c[t>>2]|0)+12>>2]&127](K)|0;c[g>>2]=b_[c[(c[t>>2]|0)+16>>2]&127](K)|0;bX[c[(c[b>>2]|0)+20>>2]&127](v,K);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}dA(h,0);c[b>>2]=c[w>>2];c[b+4>>2]=c[w+4>>2];c[b+8>>2]=c[w+8>>2];kv(w|0,0,12);dj(v);bX[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){c[j+4>>2]=0;a[L]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}dF(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];kv(y|0,0,12);dw(x);M=b_[c[(c[t>>2]|0)+36>>2]&127](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[3408]|0)!=-1){c[o>>2]=13632;c[o+4>>2]=12;c[o+8>>2]=0;dn(13632,o,94)}o=(c[3409]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=bf(4)|0;O=N;jX(O);aN(N|0,8176,132)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=bf(4)|0;O=N;jX(O);aN(N|0,8176,132)}N=K;bX[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;bX[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){c[l+4>>2]=0;a[z]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}dF(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];kv(B|0,0,12);dw(A);bX[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}dF(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];kv(E|0,0,12);dw(D);D=K;c[f>>2]=b_[c[(c[D>>2]|0)+12>>2]&127](N)|0;c[g>>2]=b_[c[(c[D>>2]|0)+16>>2]&127](N)|0;bX[c[(c[K>>2]|0)+20>>2]&127](F,N);K=h;if((a[K]&1)==0){a[h+1|0]=0;a[K]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}dA(h,0);c[K>>2]=c[G>>2];c[K+4>>2]=c[G+4>>2];c[K+8>>2]=c[G+8>>2];kv(G|0,0,12);dj(F);bX[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){c[j+4>>2]=0;a[O]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}dF(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];kv(I|0,0,12);dw(H);M=b_[c[(c[D>>2]|0)+36>>2]&127](N)|0;c[m>>2]=M;i=n;return}}function hz(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=166;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=kg(k,j)|0;k=a;if((a|0)==0){ks()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}bW[c[e>>2]&511](a);l=c[g>>2]|0}}while(0);c[e>>2]=80;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function hA(a){a=a|0;cE(a|0);return}function hB(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+280|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+232|0;p=e+240|0;q=e+248|0;r=e+256|0;s=e+264|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+100|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=e+16|0;c[n>>2]=D;E=e+128|0;F=aJ(D|0,100,1360,(D=i,i=i+8|0,h[D>>3]=l,D)|0)|0;i=D;do{if(F>>>0>99){do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);G=fO(n,c[2952]|0,1360,(D=i,i=i+8|0,h[D>>3]=l,D)|0)|0;i=D;H=c[n>>2]|0;if((H|0)==0){ks();I=c[n>>2]|0}else{I=H}H=ke(G)|0;if((H|0)!=0){J=H;K=G;L=I;M=H;break}ks();J=0;K=G;L=I;M=0}else{J=E;K=F;L=0;M=0}}while(0);dZ(o,j);F=o|0;E=c[F>>2]|0;if((c[3292]|0)!=-1){c[m>>2]=13168;c[m+4>>2]=12;c[m+8>>2]=0;dn(13168,m,94)}m=(c[3293]|0)-1|0;I=c[E+8>>2]|0;do{if((c[E+12>>2]|0)-I>>2>>>0>m>>>0){D=c[I+(m<<2)>>2]|0;if((D|0)==0){break}G=D;H=c[n>>2]|0;N=H+K|0;O=c[(c[D>>2]|0)+32>>2]|0;b8[O&15](G,H,N,J)|0;if((K|0)==0){P=0}else{P=(a[c[n>>2]|0]|0)==45}kv(t|0,0,12);kv(v|0,0,12);kv(x|0,0,12);hC(g,P,o,p,q,r,s,u,w,y);N=z|0;H=c[y>>2]|0;if((K|0)>(H|0)){O=d[x]|0;if((O&1|0)==0){Q=O>>>1}else{Q=c[w+4>>2]|0}O=d[v]|0;if((O&1|0)==0){R=O>>>1}else{R=c[u+4>>2]|0}S=(K-H<<1|1)+Q+R|0}else{O=d[x]|0;if((O&1|0)==0){T=O>>>1}else{T=c[w+4>>2]|0}O=d[v]|0;if((O&1|0)==0){U=O>>>1}else{U=c[u+4>>2]|0}S=T+2+U|0}O=S+H|0;do{if(O>>>0>100){D=ke(O)|0;if((D|0)!=0){V=D;W=D;break}ks();V=0;W=0}else{V=N;W=0}}while(0);hD(V,A,B,c[j+4>>2]|0,J,J+K|0,G,P,p,a[q]|0,a[r]|0,s,u,w,H);c[C>>2]=c[f>>2];fG(b,C,V,c[A>>2]|0,c[B>>2]|0,j,k);if((W|0)!=0){kf(W)}dj(w);dj(u);dj(s);N=c[F>>2]|0;c_(N)|0;if((M|0)!=0){kf(M)}if((L|0)==0){i=e;return}kf(L);i=e;return}}while(0);e=bf(4)|0;jX(e);aN(e|0,8176,132)}function hC(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3410]|0)!=-1){c[p>>2]=13640;c[p+4>>2]=12;c[p+8>>2]=0;dn(13640,p,94)}p=(c[3411]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=bf(4)|0;R=Q;jX(R);aN(Q|0,8176,132)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=bf(4)|0;R=Q;jX(R);aN(Q|0,8176,132)}Q=e;R=c[e>>2]|0;if(d){bX[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;bX[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){a[l+1|0]=0;a[r]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}dA(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];kv(t|0,0,12);dj(s)}else{bX[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;bX[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){a[l+1|0]=0;a[v]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}dA(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];kv(x|0,0,12);dj(w)}w=e;a[g]=b_[c[(c[w>>2]|0)+12>>2]&127](Q)|0;a[h]=b_[c[(c[w>>2]|0)+16>>2]&127](Q)|0;w=e;bX[c[(c[w>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}dA(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];kv(z|0,0,12);dj(y);bX[c[(c[w>>2]|0)+24>>2]&127](A,Q);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}dA(k,0);c[w>>2]=c[B>>2];c[w+4>>2]=c[B+4>>2];c[w+8>>2]=c[B+8>>2];kv(B|0,0,12);dj(A);S=b_[c[(c[e>>2]|0)+36>>2]&127](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3412]|0)!=-1){c[o>>2]=13648;c[o+4>>2]=12;c[o+8>>2]=0;dn(13648,o,94)}o=(c[3413]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=bf(4)|0;U=T;jX(U);aN(T|0,8176,132)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=bf(4)|0;U=T;jX(U);aN(T|0,8176,132)}T=P;U=c[P>>2]|0;if(d){bX[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;bX[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){a[l+1|0]=0;a[E]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}dA(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];kv(G|0,0,12);dj(F)}else{bX[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;bX[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}dA(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];kv(K|0,0,12);dj(J)}J=P;a[g]=b_[c[(c[J>>2]|0)+12>>2]&127](T)|0;a[h]=b_[c[(c[J>>2]|0)+16>>2]&127](T)|0;J=P;bX[c[(c[J>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}dA(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];kv(M|0,0,12);dj(L);bX[c[(c[J>>2]|0)+24>>2]&127](N,T);J=k;if((a[J]&1)==0){a[k+1|0]=0;a[J]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}dA(k,0);c[J>>2]=c[O>>2];c[J+4>>2]=c[O+4>>2];c[J+8>>2]=c[O+8>>2];kv(O|0,0,12);dj(N);S=b_[c[(c[P>>2]|0)+36>>2]&127](T)|0;c[m>>2]=S;i=n;return}}function hD(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;do{if((H|0)==0){c[e>>2]=c[f>>2];I=G}else if((H|0)==1){c[e>>2]=c[f>>2];J=bY[c[(c[s>>2]|0)+28>>2]&31](j,32)|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=J;I=G}else if((H|0)==3){J=a[t]|0;K=J&255;if((K&1|0)==0){L=K>>>1}else{L=c[w>>2]|0}if((L|0)==0){I=G;break}if((J&1)==0){M=u}else{M=c[v>>2]|0}J=a[M]|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=J;I=G}else if((H|0)==2){J=a[q]|0;K=J&255;N=(K&1|0)==0;if(N){O=K>>>1}else{O=c[z>>2]|0}if((O|0)==0|x){I=G;break}if((J&1)==0){P=y;Q=y}else{J=c[A>>2]|0;P=J;Q=J}if(N){R=K>>>1}else{R=c[z>>2]|0}K=P+R|0;N=c[f>>2]|0;if((Q|0)==(K|0)){S=N}else{J=Q;T=N;while(1){a[T]=a[J]|0;N=J+1|0;U=T+1|0;if((N|0)==(K|0)){S=U;break}else{J=N;T=U}}}c[f>>2]=S;I=G}else if((H|0)==4){T=c[f>>2]|0;J=k?G+1|0:G;K=J;while(1){if(K>>>0>=i>>>0){break}U=a[K]|0;if(U<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(U<<24>>24<<1)>>1]&2048)==0){break}else{K=K+1|0}}U=K;if(B){if(K>>>0>J>>>0){N=J+(-U|0)|0;U=N>>>0<o>>>0?o:N;N=U+r|0;V=K;W=r;X=T;while(1){Y=V-1|0;Z=a[Y]|0;c[f>>2]=X+1;a[X]=Z;Z=W-1|0;_=(Z|0)>0;if(!(Y>>>0>J>>>0&_)){break}V=Y;W=Z;X=c[f>>2]|0}X=K+U|0;if(_){$=N;aa=X;ab=661}else{ac=0;ad=N;ae=X}}else{$=r;aa=K;ab=661}if((ab|0)==661){ab=0;ac=bY[c[(c[s>>2]|0)+28>>2]&31](j,48)|0;ad=$;ae=aa}X=c[f>>2]|0;c[f>>2]=X+1;if((ad|0)>0){W=ad;V=X;while(1){a[V]=ac;Z=W-1|0;Y=c[f>>2]|0;c[f>>2]=Y+1;if((Z|0)>0){W=Z;V=Y}else{af=Y;break}}}else{af=X}a[af]=m;ag=ae}else{ag=K}if((ag|0)==(J|0)){V=bY[c[(c[s>>2]|0)+28>>2]&31](j,48)|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=V}else{V=a[C]|0;W=V&255;if((W&1|0)==0){ah=W>>>1}else{ah=c[F>>2]|0}if((ah|0)==0){ai=ag;aj=0;ak=0;al=-1}else{if((V&1)==0){am=D}else{am=c[E>>2]|0}ai=ag;aj=0;ak=0;al=a[am]|0}while(1){do{if((aj|0)==(al|0)){V=c[f>>2]|0;c[f>>2]=V+1;a[V]=n;V=ak+1|0;W=a[C]|0;N=W&255;if((N&1|0)==0){an=N>>>1}else{an=c[F>>2]|0}if(V>>>0>=an>>>0){ao=al;ap=V;aq=0;break}N=(W&1)==0;if(N){ar=D}else{ar=c[E>>2]|0}if((a[ar+V|0]|0)==127){ao=-1;ap=V;aq=0;break}if(N){as=D}else{as=c[E>>2]|0}ao=a[as+V|0]|0;ap=V;aq=0}else{ao=al;ap=ak;aq=aj}}while(0);V=ai-1|0;N=a[V]|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=N;if((V|0)==(J|0)){break}else{ai=V;aj=aq+1|0;ak=ap;al=ao}}}K=c[f>>2]|0;if((T|0)==(K|0)){I=J;break}X=K-1|0;if(T>>>0<X>>>0){at=T;au=X}else{I=J;break}while(1){X=a[at]|0;a[at]=a[au]|0;a[au]=X;X=at+1|0;K=au-1|0;if(X>>>0<K>>>0){at=X;au=K}else{I=J;break}}}else{I=G}}while(0);H=h+1|0;if(H>>>0<4){G=I;h=H}else{break}}h=a[t]|0;t=h&255;I=(t&1|0)==0;if(I){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(I){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;if((aw|0)==(w|0)){az=ay}else{ax=ay;ay=aw;while(1){a[ax]=a[ay]|0;aw=ax+1|0;t=ay+1|0;if((t|0)==(w|0)){az=aw;break}else{ax=aw;ay=t}}}c[f>>2]=az}az=g&176;if((az|0)==32){c[e>>2]=c[f>>2];return}else if((az|0)==16){return}else{c[e>>2]=d;return}}function hE(a){a=a|0;cE(a|0);kn(a);return}function hF(a){a=a|0;cE(a|0);return}function hG(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+100|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;dZ(m,h);B=m|0;C=c[B>>2]|0;if((c[3292]|0)!=-1){c[l>>2]=13168;c[l+4>>2]=12;c[l+8>>2]=0;dn(13168,l,94)}l=(c[3293]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=k;I=a[H]|0;J=I&255;if((J&1|0)==0){K=J>>>1}else{K=c[k+4>>2]|0}if((K|0)==0){L=0}else{if((I&1)==0){M=G+1|0}else{M=c[k+8>>2]|0}I=a[M]|0;L=I<<24>>24==(bY[c[(c[E>>2]|0)+28>>2]&31](F,45)|0)<<24>>24}kv(r|0,0,12);kv(t|0,0,12);kv(v|0,0,12);hC(g,L,m,n,o,p,q,s,u,w);E=x|0;I=a[H]|0;J=I&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[k+4>>2]|0}P=c[w>>2]|0;if((O|0)>(P|0)){if(N){Q=J>>>1}else{Q=c[k+4>>2]|0}J=d[v]|0;if((J&1|0)==0){R=J>>>1}else{R=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){S=J>>>1}else{S=c[s+4>>2]|0}T=(Q-P<<1|1)+R+S|0}else{J=d[v]|0;if((J&1|0)==0){U=J>>>1}else{U=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){V=J>>>1}else{V=c[s+4>>2]|0}T=U+2+V|0}J=T+P|0;do{if(J>>>0>100){N=ke(J)|0;if((N|0)!=0){W=N;X=N;Y=I;break}ks();W=0;X=0;Y=a[H]|0}else{W=E;X=0;Y=I}}while(0);if((Y&1)==0){Z=G+1|0;_=G+1|0}else{I=c[k+8>>2]|0;Z=I;_=I}I=Y&255;if((I&1|0)==0){$=I>>>1}else{$=c[k+4>>2]|0}hD(W,y,z,c[h+4>>2]|0,_,Z+$|0,F,L,n,a[o]|0,a[p]|0,q,s,u,P);c[A>>2]=c[f>>2];fG(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){dj(u);dj(s);dj(q);aa=c[B>>2]|0;ab=aa|0;ac=c_(ab)|0;i=e;return}kf(X);dj(u);dj(s);dj(q);aa=c[B>>2]|0;ab=aa|0;ac=c_(ab)|0;i=e;return}}while(0);e=bf(4)|0;jX(e);aN(e|0,8176,132)}function hH(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+576|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+528|0;p=e+536|0;q=e+544|0;r=e+552|0;s=e+560|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+400|0;A=i;i=i+4|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=e+16|0;c[n>>2]=D;E=e+128|0;F=aJ(D|0,100,1360,(D=i,i=i+8|0,h[D>>3]=l,D)|0)|0;i=D;do{if(F>>>0>99){do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);G=fO(n,c[2952]|0,1360,(D=i,i=i+8|0,h[D>>3]=l,D)|0)|0;i=D;H=c[n>>2]|0;if((H|0)==0){ks();I=c[n>>2]|0}else{I=H}H=ke(G<<2)|0;J=H;if((H|0)!=0){K=J;L=G;M=I;N=J;break}ks();K=J;L=G;M=I;N=J}else{K=E;L=F;M=0;N=0}}while(0);dZ(o,j);F=o|0;E=c[F>>2]|0;if((c[3290]|0)!=-1){c[m>>2]=13160;c[m+4>>2]=12;c[m+8>>2]=0;dn(13160,m,94)}m=(c[3291]|0)-1|0;I=c[E+8>>2]|0;do{if((c[E+12>>2]|0)-I>>2>>>0>m>>>0){D=c[I+(m<<2)>>2]|0;if((D|0)==0){break}J=D;G=c[n>>2]|0;H=G+L|0;O=c[(c[D>>2]|0)+48>>2]|0;b8[O&15](J,G,H,K)|0;if((L|0)==0){P=0}else{P=(a[c[n>>2]|0]|0)==45}kv(t|0,0,12);kv(v|0,0,12);kv(x|0,0,12);hI(g,P,o,p,q,r,s,u,w,y);H=z|0;G=c[y>>2]|0;if((L|0)>(G|0)){O=d[x]|0;if((O&1|0)==0){Q=O>>>1}else{Q=c[w+4>>2]|0}O=d[v]|0;if((O&1|0)==0){R=O>>>1}else{R=c[u+4>>2]|0}S=(L-G<<1|1)+Q+R|0}else{O=d[x]|0;if((O&1|0)==0){T=O>>>1}else{T=c[w+4>>2]|0}O=d[v]|0;if((O&1|0)==0){U=O>>>1}else{U=c[u+4>>2]|0}S=T+2+U|0}O=S+G|0;do{if(O>>>0>100){D=ke(O<<2)|0;V=D;if((D|0)!=0){W=V;X=V;break}ks();W=V;X=V}else{W=H;X=0}}while(0);hJ(W,A,B,c[j+4>>2]|0,K,K+(L<<2)|0,J,P,p,c[q>>2]|0,c[r>>2]|0,s,u,w,G);c[C>>2]=c[f>>2];fX(b,C,W,c[A>>2]|0,c[B>>2]|0,j,k);if((X|0)!=0){kf(X)}dw(w);dw(u);dj(s);H=c[F>>2]|0;c_(H)|0;if((N|0)!=0){kf(N)}if((M|0)==0){i=e;return}kf(M);i=e;return}}while(0);e=bf(4)|0;jX(e);aN(e|0,8176,132)}function hI(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[3406]|0)!=-1){c[p>>2]=13624;c[p+4>>2]=12;c[p+8>>2]=0;dn(13624,p,94)}p=(c[3407]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=bf(4)|0;R=Q;jX(R);aN(Q|0,8176,132)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=bf(4)|0;R=Q;jX(R);aN(Q|0,8176,132)}Q=e;R=c[e>>2]|0;if(d){bX[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;bX[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){c[l+4>>2]=0;a[r]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}dF(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];kv(t|0,0,12);dw(s)}else{bX[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;bX[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){c[l+4>>2]=0;a[v]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}dF(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];kv(x|0,0,12);dw(w)}w=e;c[g>>2]=b_[c[(c[w>>2]|0)+12>>2]&127](Q)|0;c[h>>2]=b_[c[(c[w>>2]|0)+16>>2]&127](Q)|0;bX[c[(c[e>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}dA(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];kv(z|0,0,12);dj(y);bX[c[(c[e>>2]|0)+24>>2]&127](A,Q);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}dF(k,0);c[e>>2]=c[B>>2];c[e+4>>2]=c[B+4>>2];c[e+8>>2]=c[B+8>>2];kv(B|0,0,12);dw(A);S=b_[c[(c[w>>2]|0)+36>>2]&127](Q)|0;c[m>>2]=S;i=n;return}else{if((c[3408]|0)!=-1){c[o>>2]=13632;c[o+4>>2]=12;c[o+8>>2]=0;dn(13632,o,94)}o=(c[3409]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=bf(4)|0;U=T;jX(U);aN(T|0,8176,132)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=bf(4)|0;U=T;jX(U);aN(T|0,8176,132)}T=P;U=c[P>>2]|0;if(d){bX[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;bX[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){c[l+4>>2]=0;a[E]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}dF(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];kv(G|0,0,12);dw(F)}else{bX[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;bX[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}dF(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];kv(K|0,0,12);dw(J)}J=P;c[g>>2]=b_[c[(c[J>>2]|0)+12>>2]&127](T)|0;c[h>>2]=b_[c[(c[J>>2]|0)+16>>2]&127](T)|0;bX[c[(c[P>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}dA(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];kv(M|0,0,12);dj(L);bX[c[(c[P>>2]|0)+24>>2]&127](N,T);P=k;if((a[P]&1)==0){c[k+4>>2]=0;a[P]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}dF(k,0);c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];kv(O|0,0,12);dw(N);S=b_[c[(c[J>>2]|0)+36>>2]&127](T)|0;c[m>>2]=S;i=n;return}}function hJ(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;do{if((D|0)==0){c[d>>2]=c[e>>2];E=n}else if((D|0)==1){c[d>>2]=c[e>>2];F=bY[c[(c[r>>2]|0)+44>>2]&31](i,32)|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;E=n}else if((D|0)==3){F=a[s]|0;G=F&255;if((G&1|0)==0){H=G>>>1}else{H=c[t>>2]|0}if((H|0)==0){E=n;break}if((F&1)==0){I=t}else{I=c[u>>2]|0}F=c[I>>2]|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;E=n}else if((D|0)==2){F=a[p]|0;G=F&255;J=(G&1|0)==0;if(J){K=G>>>1}else{K=c[w>>2]|0}if((K|0)==0|v){E=n;break}if((F&1)==0){L=w;M=w;N=w}else{F=c[x>>2]|0;L=F;M=F;N=F}if(J){O=G>>>1}else{O=c[w>>2]|0}G=L+(O<<2)|0;J=c[e>>2]|0;if((M|0)==(G|0)){P=J}else{F=(L+(O-1<<2)+(-N|0)|0)>>>2;Q=M;R=J;while(1){c[R>>2]=c[Q>>2];S=Q+4|0;if((S|0)==(G|0)){break}Q=S;R=R+4|0}P=J+(F+1<<2)|0}c[e>>2]=P;E=n}else if((D|0)==4){R=c[e>>2]|0;Q=j?n+4|0:n;G=Q;while(1){if(G>>>0>=h>>>0){break}if(b$[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[G>>2]|0)|0){G=G+4|0}else{break}}if(y){if(G>>>0>Q>>>0){F=G;J=q;do{F=F-4|0;S=c[F>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=S;J=J-1|0;U=(J|0)>0;}while(F>>>0>Q>>>0&U);if(U){V=J;W=F;X=937}else{Y=0;Z=J;_=F}}else{V=q;W=G;X=937}if((X|0)==937){X=0;Y=bY[c[(c[r>>2]|0)+44>>2]&31](i,48)|0;Z=V;_=W}S=c[e>>2]|0;c[e>>2]=S+4;if((Z|0)>0){T=Z;$=S;while(1){c[$>>2]=Y;aa=T-1|0;ab=c[e>>2]|0;c[e>>2]=ab+4;if((aa|0)>0){T=aa;$=ab}else{ac=ab;break}}}else{ac=S}c[ac>>2]=l;ad=_}else{ad=G}if((ad|0)==(Q|0)){$=bY[c[(c[r>>2]|0)+44>>2]&31](i,48)|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=$}else{$=a[z]|0;T=$&255;if((T&1|0)==0){ae=T>>>1}else{ae=c[C>>2]|0}if((ae|0)==0){af=ad;ag=0;ah=0;ai=-1}else{if(($&1)==0){aj=A}else{aj=c[B>>2]|0}af=ad;ag=0;ah=0;ai=a[aj]|0}while(1){do{if((ag|0)==(ai|0)){$=c[e>>2]|0;c[e>>2]=$+4;c[$>>2]=m;$=ah+1|0;T=a[z]|0;F=T&255;if((F&1|0)==0){ak=F>>>1}else{ak=c[C>>2]|0}if($>>>0>=ak>>>0){al=ai;am=$;an=0;break}F=(T&1)==0;if(F){ao=A}else{ao=c[B>>2]|0}if((a[ao+$|0]|0)==127){al=-1;am=$;an=0;break}if(F){ap=A}else{ap=c[B>>2]|0}al=a[ap+$|0]|0;am=$;an=0}else{al=ai;am=ah;an=ag}}while(0);$=af-4|0;F=c[$>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=F;if(($|0)==(Q|0)){break}else{af=$;ag=an+1|0;ah=am;ai=al}}}G=c[e>>2]|0;if((R|0)==(G|0)){E=Q;break}S=G-4|0;if(R>>>0<S>>>0){aq=R;ar=S}else{E=Q;break}while(1){S=c[aq>>2]|0;c[aq>>2]=c[ar>>2];c[ar>>2]=S;S=aq+4|0;G=ar-4|0;if(S>>>0<G>>>0){aq=S;ar=G}else{E=Q;break}}}else{E=n}}while(0);D=g+1|0;if(D>>>0<4){n=E;g=D}else{break}}g=a[s]|0;s=g&255;E=(s&1|0)==0;if(E){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(E){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;E=au+4|0;if((E|0)==(t|0)){ax=s}else{au=((at+(aw-2<<2)+(-av|0)|0)>>>2)+1|0;av=s;aw=E;while(1){c[av>>2]=c[aw>>2];E=aw+4|0;if((E|0)==(t|0)){break}else{av=av+4|0;aw=E}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==32){c[d>>2]=c[e>>2];return}else if((ax|0)==16){return}else{c[d>>2]=b;return}}function hK(a){a=a|0;cE(a|0);kn(a);return}function hL(a){a=a|0;cE(a|0);return}function hM(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=be(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function hN(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+400|0;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;dZ(m,h);B=m|0;C=c[B>>2]|0;if((c[3290]|0)!=-1){c[l>>2]=13160;c[l+4>>2]=12;c[l+8>>2]=0;dn(13160,l,94)}l=(c[3291]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=a[G]|0;I=H&255;if((I&1|0)==0){J=I>>>1}else{J=c[k+4>>2]|0}if((J|0)==0){K=0}else{if((H&1)==0){L=k+4|0}else{L=c[k+8>>2]|0}H=c[L>>2]|0;K=(H|0)==(bY[c[(c[E>>2]|0)+44>>2]&31](F,45)|0)}kv(r|0,0,12);kv(t|0,0,12);kv(v|0,0,12);hI(g,K,m,n,o,p,q,s,u,w);E=x|0;H=a[G]|0;I=H&255;M=(I&1|0)==0;if(M){N=I>>>1}else{N=c[k+4>>2]|0}O=c[w>>2]|0;if((N|0)>(O|0)){if(M){P=I>>>1}else{P=c[k+4>>2]|0}I=d[v]|0;if((I&1|0)==0){Q=I>>>1}else{Q=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){R=I>>>1}else{R=c[s+4>>2]|0}S=(P-O<<1|1)+Q+R|0}else{I=d[v]|0;if((I&1|0)==0){T=I>>>1}else{T=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){U=I>>>1}else{U=c[s+4>>2]|0}S=T+2+U|0}I=S+O|0;do{if(I>>>0>100){M=ke(I<<2)|0;V=M;if((M|0)!=0){W=V;X=V;Y=H;break}ks();W=V;X=V;Y=a[G]|0}else{W=E;X=0;Y=H}}while(0);if((Y&1)==0){Z=k+4|0;_=k+4|0}else{H=c[k+8>>2]|0;Z=H;_=H}H=Y&255;if((H&1|0)==0){$=H>>>1}else{$=c[k+4>>2]|0}hJ(W,y,z,c[h+4>>2]|0,_,Z+($<<2)|0,F,K,n,c[o>>2]|0,c[p>>2]|0,q,s,u,O);c[A>>2]=c[f>>2];fX(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){dw(u);dw(s);dj(q);aa=c[B>>2]|0;ab=aa|0;ac=c_(ab)|0;i=e;return}kf(X);dw(u);dw(s);dj(q);aa=c[B>>2]|0;ab=aa|0;ac=c_(ab)|0;i=e;return}}while(0);e=bf(4)|0;jX(e);aN(e|0,8176,132)}function hO(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+16|0;j=d|0;k=j;kv(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=p;do{du(j,a[q]|0);q=q+1|0;}while(q>>>0<h>>>0);q=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){r=q;s=1069;break}t=c[j+8>>2]|0;u=q}else{r=(e|0)==-1?-1:e<<1;s=1069}}while(0);if((s|0)==1069){t=j+1|0;u=r}r=a3(u|0,f|0,g|0,t|0)|0;kv(l|0,0,12);l=kt(r|0)|0;t=r+l|0;if((l|0)>0){v=r}else{dj(j);i=d;return}do{du(b,a[v]|0);v=v+1|0;}while(v>>>0<t>>>0);dj(j);i=d;return}function hP(a,b){a=a|0;b=b|0;aY(((b|0)==-1?-1:b<<1)|0)|0;return}function hQ(a){a=a|0;cE(a|0);kn(a);return}function hR(a){a=a|0;cE(a|0);return}function hS(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=be(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function hT(a,b){a=a|0;b=b|0;aY(((b|0)==-1?-1:b<<1)|0)|0;return}function hU(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;kv(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=4104;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;L1310:do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=z;C=4104;while(1){c[m>>2]=x;D=(b4[c[C+12>>2]&31](w,j,x,h,m,y,A,l)|0)==2;E=c[m>>2]|0;if(D|(E|0)==(x|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){D=y;do{du(r,a[D]|0);D=D+1|0;}while(D>>>0<(c[l>>2]|0)>>>0);F=c[m>>2]|0}else{F=E}if(F>>>0>=h>>>0){break L1310}x=F;C=c[B>>2]|0}B=bf(8)|0;c8(B,904);aN(B|0,8192,22)}}while(0);cE(t|0);if((a[s]&1)==0){G=r+1|0}else{G=c[r+8>>2]|0}s=a3(((e|0)==-1?-1:e<<1)|0,f|0,g|0,G|0)|0;kv(v|0,0,12);v=u|0;c[u+4>>2]=0;c[u>>2]=4048;G=kt(s|0)|0;g=s+G|0;if((G|0)<1){H=u|0;cE(H);dj(r);i=d;return}G=u;f=g;e=o|0;t=o+128|0;o=s;s=4048;while(1){c[q>>2]=o;F=(b4[c[s+16>>2]&31](v,n,o,(f-o|0)>32?o+32|0:g,q,e,t,p)|0)==2;h=c[q>>2]|0;if(F|(h|0)==(o|0)){break}if(e>>>0<(c[p>>2]|0)>>>0){F=e;do{dz(b,c[F>>2]|0);F=F+4|0;}while(F>>>0<(c[p>>2]|0)>>>0);I=c[q>>2]|0}else{I=h}if(I>>>0>=g>>>0){J=1136;break}o=I;s=c[G>>2]|0}if((J|0)==1136){H=u|0;cE(H);dj(r);i=d;return}d=bf(8)|0;c8(d,904);aN(d|0,8192,22)}function hV(b){b=b|0;var d=0,e=0,f=0;c[b>>2]=3568;d=b+8|0;e=c[d>>2]|0;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);if((e|0)==(c[2952]|0)){f=b|0;cE(f);return}bd(c[d>>2]|0);f=b|0;cE(f);return}function hW(a){a=a|0;a=bf(8)|0;c$(a,1352);c[a>>2]=2504;aN(a|0,8208,32)}function hX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1;c[b>>2]=3824;d=b+8|0;I=b+12|0;a[b+136|0]=1;J=b+24|0;K=J;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J+112;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J-1|0;}while((J|0)!=0);dr(b+144|0,1344,1);J=c[d>>2]|0;d=c[I>>2]|0;if((J|0)!=(d|0)){c[I>>2]=d+(~((d-4+(-J|0)|0)>>>2)<<2)}c[2985]=0;c[2984]=3528;if((c[3212]|0)!=-1){c[H>>2]=12848;c[H+4>>2]=12;c[H+8>>2]=0;dn(12848,H,94)}ic(b,11936,(c[3213]|0)-1|0);c[2983]=0;c[2982]=3488;if((c[3210]|0)!=-1){c[G>>2]=12840;c[G+4>>2]=12;c[G+8>>2]=0;dn(12840,G,94)}ic(b,11928,(c[3211]|0)-1|0);c[3035]=0;c[3034]=3936;c[3036]=0;a[12148]=0;c[3036]=c[(bb()|0)>>2];if((c[3292]|0)!=-1){c[F>>2]=13168;c[F+4>>2]=12;c[F+8>>2]=0;dn(13168,F,94)}ic(b,12136,(c[3293]|0)-1|0);c[3033]=0;c[3032]=3856;if((c[3290]|0)!=-1){c[E>>2]=13160;c[E+4>>2]=12;c[E+8>>2]=0;dn(13160,E,94)}ic(b,12128,(c[3291]|0)-1|0);c[2987]=0;c[2986]=3624;if((c[3216]|0)!=-1){c[D>>2]=12864;c[D+4>>2]=12;c[D+8>>2]=0;dn(12864,D,94)}ic(b,11944,(c[3217]|0)-1|0);c[521]=0;c[520]=3568;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);c[522]=c[2952];if((c[3214]|0)!=-1){c[C>>2]=12856;c[C+4>>2]=12;c[C+8>>2]=0;dn(12856,C,94)}ic(b,2080,(c[3215]|0)-1|0);c[2989]=0;c[2988]=3680;if((c[3218]|0)!=-1){c[B>>2]=12872;c[B+4>>2]=12;c[B+8>>2]=0;dn(12872,B,94)}ic(b,11952,(c[3219]|0)-1|0);c[2991]=0;c[2990]=3736;if((c[3220]|0)!=-1){c[A>>2]=12880;c[A+4>>2]=12;c[A+8>>2]=0;dn(12880,A,94)}ic(b,11960,(c[3221]|0)-1|0);c[2965]=0;c[2964]=3032;a[11864]=46;a[11865]=44;kv(11868,0,12);if((c[3196]|0)!=-1){c[z>>2]=12784;c[z+4>>2]=12;c[z+8>>2]=0;dn(12784,z,94)}ic(b,11856,(c[3197]|0)-1|0);c[513]=0;c[512]=2984;c[514]=46;c[515]=44;kv(2064,0,12);if((c[3194]|0)!=-1){c[y>>2]=12776;c[y+4>>2]=12;c[y+8>>2]=0;dn(12776,y,94)}ic(b,2048,(c[3195]|0)-1|0);c[2981]=0;c[2980]=3416;if((c[3208]|0)!=-1){c[x>>2]=12832;c[x+4>>2]=12;c[x+8>>2]=0;dn(12832,x,94)}ic(b,11920,(c[3209]|0)-1|0);c[2979]=0;c[2978]=3344;if((c[3206]|0)!=-1){c[w>>2]=12824;c[w+4>>2]=12;c[w+8>>2]=0;dn(12824,w,94)}ic(b,11912,(c[3207]|0)-1|0);c[2977]=0;c[2976]=3280;if((c[3204]|0)!=-1){c[v>>2]=12816;c[v+4>>2]=12;c[v+8>>2]=0;dn(12816,v,94)}ic(b,11904,(c[3205]|0)-1|0);c[2975]=0;c[2974]=3216;if((c[3202]|0)!=-1){c[u>>2]=12808;c[u+4>>2]=12;c[u+8>>2]=0;dn(12808,u,94)}ic(b,11896,(c[3203]|0)-1|0);c[3045]=0;c[3044]=4912;if((c[3412]|0)!=-1){c[t>>2]=13648;c[t+4>>2]=12;c[t+8>>2]=0;dn(13648,t,94)}ic(b,12176,(c[3413]|0)-1|0);c[3043]=0;c[3042]=4848;if((c[3410]|0)!=-1){c[s>>2]=13640;c[s+4>>2]=12;c[s+8>>2]=0;dn(13640,s,94)}ic(b,12168,(c[3411]|0)-1|0);c[3041]=0;c[3040]=4784;if((c[3408]|0)!=-1){c[r>>2]=13632;c[r+4>>2]=12;c[r+8>>2]=0;dn(13632,r,94)}ic(b,12160,(c[3409]|0)-1|0);c[3039]=0;c[3038]=4720;if((c[3406]|0)!=-1){c[q>>2]=13624;c[q+4>>2]=12;c[q+8>>2]=0;dn(13624,q,94)}ic(b,12152,(c[3407]|0)-1|0);c[2963]=0;c[2962]=2688;if((c[3184]|0)!=-1){c[p>>2]=12736;c[p+4>>2]=12;c[p+8>>2]=0;dn(12736,p,94)}ic(b,11848,(c[3185]|0)-1|0);c[2961]=0;c[2960]=2648;if((c[3182]|0)!=-1){c[o>>2]=12728;c[o+4>>2]=12;c[o+8>>2]=0;dn(12728,o,94)}ic(b,11840,(c[3183]|0)-1|0);c[2959]=0;c[2958]=2608;if((c[3180]|0)!=-1){c[n>>2]=12720;c[n+4>>2]=12;c[n+8>>2]=0;dn(12720,n,94)}ic(b,11832,(c[3181]|0)-1|0);c[2957]=0;c[2956]=2568;if((c[3178]|0)!=-1){c[m>>2]=12712;c[m+4>>2]=12;c[m+8>>2]=0;dn(12712,m,94)}ic(b,11824,(c[3179]|0)-1|0);c[509]=0;c[508]=2888;c[510]=2936;if((c[3192]|0)!=-1){c[l>>2]=12768;c[l+4>>2]=12;c[l+8>>2]=0;dn(12768,l,94)}ic(b,2032,(c[3193]|0)-1|0);c[505]=0;c[504]=2792;c[506]=2840;if((c[3190]|0)!=-1){c[k>>2]=12760;c[k+4>>2]=12;c[k+8>>2]=0;dn(12760,k,94)}ic(b,2016,(c[3191]|0)-1|0);c[501]=0;c[500]=3792;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);c[502]=c[2952];c[500]=2760;if((c[3188]|0)!=-1){c[j>>2]=12752;c[j+4>>2]=12;c[j+8>>2]=0;dn(12752,j,94)}ic(b,2e3,(c[3189]|0)-1|0);c[497]=0;c[496]=3792;do{if((a[13728]|0)==0){if((bt(13728)|0)==0){break}c[2952]=bG(1,1344,0)|0}}while(0);c[498]=c[2952];c[496]=2728;if((c[3186]|0)!=-1){c[h>>2]=12744;c[h+4>>2]=12;c[h+8>>2]=0;dn(12744,h,94)}ic(b,1984,(c[3187]|0)-1|0);c[2973]=0;c[2972]=3120;if((c[3200]|0)!=-1){c[g>>2]=12800;c[g+4>>2]=12;c[g+8>>2]=0;dn(12800,g,94)}ic(b,11888,(c[3201]|0)-1|0);c[2971]=0;c[2970]=3080;if((c[3198]|0)!=-1){c[f>>2]=12792;c[f+4>>2]=12;c[f+8>>2]=0;dn(12792,f,94)}ic(b,11880,(c[3199]|0)-1|0);i=e;return}function hY(a,b){a=a|0;b=b|0;return b|0}function hZ(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function h_(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function h$(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function h0(a){a=a|0;return 1}function h1(a){a=a|0;return 1}function h2(a){a=a|0;return 1}function h3(a,b){a=a|0;b=b|0;return b<<24>>24|0}function h4(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function h5(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function h6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function h7(a){a=a|0;c[a+4>>2]=(I=c[3222]|0,c[3222]=I+1,I)+1;return}function h8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function h9(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=((e-4+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function ia(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function ib(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function ic(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;cF(b|0);e=a+8|0;f=a+12|0;a=c[f>>2]|0;g=e|0;h=c[g>>2]|0;i=a-h>>2;do{if(i>>>0>d>>>0){j=h}else{k=d+1|0;if(i>>>0<k>>>0){jE(e,k-i|0);j=c[g>>2]|0;break}if(i>>>0<=k>>>0){j=h;break}l=h+(k<<2)|0;if((l|0)==(a|0)){j=h;break}c[f>>2]=a+(~((a-4+(-l|0)|0)>>>2)<<2);j=h}}while(0);h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=j;n=m+(d<<2)|0;c[n>>2]=b;return}c_(h|0)|0;m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}function id(a){a=a|0;ie(a);kn(a);return}function ie(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c[b>>2]=3824;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((e|0)!=(g|0)){h=0;i=g;g=e;while(1){e=c[i+(h<<2)>>2]|0;if((e|0)==0){j=g;k=i}else{l=e|0;c_(l)|0;j=c[d>>2]|0;k=c[f>>2]|0}l=h+1|0;if(l>>>0<j-k>>2>>>0){h=l;i=k;g=j}else{break}}}dj(b+144|0);j=c[f>>2]|0;if((j|0)==0){m=b|0;cE(m);return}f=c[d>>2]|0;if((j|0)!=(f|0)){c[d>>2]=f+(~((f-4+(-j|0)|0)>>>2)<<2)}if((j|0)==(b+24|0)){a[b+136|0]=0;m=b|0;cE(m);return}else{kn(j);m=b|0;cE(m);return}}function ig(){var b=0,d=0;if((a[13712]|0)!=0){b=c[2944]|0;return b|0}if((bt(13712)|0)==0){b=c[2944]|0;return b|0}do{if((a[13720]|0)==0){if((bt(13720)|0)==0){break}hX(11968,1);c[2948]=11968;c[2946]=11792}}while(0);d=c[c[2946]>>2]|0;c[2950]=d;cF(d|0);c[2944]=11800;b=c[2944]|0;return b|0}function ih(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;c[a>>2]=d;cF(d|0);return}function ii(a){a=a|0;c_(c[a>>2]|0)|0;return}function ij(a){a=a|0;cE(a|0);kn(a);return}function ik(a){a=a|0;if((a|0)==0){return}bW[c[(c[a>>2]|0)+4>>2]&511](a);return}function il(a){a=a|0;cE(a|0);kn(a);return}function im(b){b=b|0;var d=0;c[b>>2]=3936;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}ko(d)}}while(0);cE(b|0);kn(b);return}function io(b){b=b|0;var d=0;c[b>>2]=3936;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}ko(d)}}while(0);cE(b|0);return}function ip(a){a=a|0;cE(a|0);kn(a);return}function iq(a){a=a|0;hV(a);kn(a);return}function ir(a){a=a|0;var b=0;b=c[(ig()|0)>>2]|0;c[a>>2]=b;cF(b|0);return}function is(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;dn(a,e,94)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=bf(4)|0;h=g;jX(h);aN(g|0,8176,132);return 0}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=bf(4)|0;h=g;jX(h);aN(g|0,8176,132);return 0}else{i=d;return f|0}return 0}function it(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[(bb()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function iu(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[(bb()|0)>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function iv(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[(bb()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=1402;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=1403;break}else{h=e}}if((i|0)==1402){return g|0}else if((i|0)==1403){return g|0}return 0}function iw(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=1411;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=1412;break}if((b[(c[(bb()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=1413;break}else{a=a+4|0}}if((h|0)==1411){return g|0}else if((h|0)==1412){return g|0}else if((h|0)==1413){return g|0}return 0}function ix(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(bs()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function iy(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(bs()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function iz(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(bv()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function iA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(bv()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function iB(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(bs()|0)>>2]|0)+((b&255)<<2)>>2]&255;return d|0}function iC(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(bs()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function iD(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(bv()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function iE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(bv()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function iF(a){a=a|0;return 0}function iG(a){a=a|0;cE(a|0);kn(a);return}function iH(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=iS(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function iI(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;l=i;i=i+8|0;m=l|0;n=m;o=i;i=i+1|0;i=i+7>>3<<3;p=e;while(1){if((p|0)==(f|0)){q=f;break}if((c[p>>2]|0)==0){q=p;break}else{p=p+4|0}}c[k>>2]=h;c[g>>2]=e;L1730:do{if((e|0)==(f|0)|(h|0)==(j|0)){r=e}else{p=d;s=j;t=b+8|0;u=o|0;v=h;w=e;x=q;while(1){y=c[p+4>>2]|0;c[m>>2]=c[p>>2];c[m+4>>2]=y;y=bO(c[t>>2]|0)|0;z=jZ(v,g,x-w>>2,s-v|0,d)|0;if((y|0)!=0){bO(y|0)|0}if((z|0)==(-1|0)){A=1495;break}else if((z|0)==0){B=1;A=1531;break}y=(c[k>>2]|0)+z|0;c[k>>2]=y;if((y|0)==(j|0)){A=1528;break}if((x|0)==(f|0)){C=f;D=y;E=c[g>>2]|0}else{y=bO(c[t>>2]|0)|0;z=jN(u,0,d)|0;if((y|0)!=0){bO(y|0)|0}if((z|0)==-1){B=2;A=1533;break}y=c[k>>2]|0;if(z>>>0>(s-y|0)>>>0){B=1;A=1534;break}L1749:do{if((z|0)!=0){F=z;G=u;H=y;while(1){I=a[G]|0;c[k>>2]=H+1;a[H]=I;I=F-1|0;if((I|0)==0){break L1749}F=I;G=G+1|0;H=c[k>>2]|0}}}while(0);y=(c[g>>2]|0)+4|0;c[g>>2]=y;z=y;while(1){if((z|0)==(f|0)){J=f;break}if((c[z>>2]|0)==0){J=z;break}else{z=z+4|0}}C=J;D=c[k>>2]|0;E=y}if((E|0)==(f|0)|(D|0)==(j|0)){r=E;break L1730}else{v=D;w=E;x=C}}if((A|0)==1495){c[k>>2]=v;L1761:do{if((w|0)==(c[g>>2]|0)){K=w}else{x=w;u=v;while(1){s=c[x>>2]|0;p=bO(c[t>>2]|0)|0;z=jN(u,s,n)|0;if((p|0)!=0){bO(p|0)|0}if((z|0)==-1){K=x;break L1761}p=(c[k>>2]|0)+z|0;c[k>>2]=p;z=x+4|0;if((z|0)==(c[g>>2]|0)){K=z;break}else{x=z;u=p}}}}while(0);c[g>>2]=K;B=2;i=l;return B|0}else if((A|0)==1528){r=c[g>>2]|0;break}else if((A|0)==1531){i=l;return B|0}else if((A|0)==1533){i=l;return B|0}else if((A|0)==1534){i=l;return B|0}}}while(0);B=(r|0)!=(f|0)|0;i=l;return B|0}function iJ(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L1782:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=w;x=v;w=bO(c[s>>2]|0)|0;y=jK(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){bO(w|0)|0}if((y|0)==(-1|0)){z=1550;break}else if((y|0)==0){A=2;z=1585;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){z=1582;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=bO(c[s>>2]|0)|0;F=jJ(w,y,1,d)|0;if((E|0)!=0){bO(E|0)|0}if((F|0)!=0){A=2;z=1589;break}c[k>>2]=(c[k>>2]|0)+4;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L1782}else{t=C;u=D;v=B}}if((z|0)==1550){c[k>>2]=t;L1806:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=bO(c[s>>2]|0)|0;E=jJ(v,r,x-r|0,n)|0;if((o|0)!=0){bO(o|0)|0}if((E|0)==0){I=r+1|0}else if((E|0)==(-1|0)){z=1561;break}else if((E|0)==(-2|0)){z=1562;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L1806}else{v=E;r=I}}if((z|0)==1561){c[g>>2]=r;A=2;i=l;return A|0}else if((z|0)==1562){c[g>>2]=r;A=1;i=l;return A|0}}}while(0);c[g>>2]=H;A=(H|0)!=(f|0)|0;i=l;return A|0}else if((z|0)==1582){q=c[g>>2]|0;break}else if((z|0)==1585){i=l;return A|0}else if((z|0)==1589){i=l;return A|0}}}while(0);A=(q|0)!=(f|0)|0;i=l;return A|0}function iK(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;j=bO(c[b+8>>2]|0)|0;b=jN(e,0,d)|0;if((j|0)!=0){bO(j|0)|0}if((b|0)==(-1|0)|(b|0)==0){k=2;i=h;return k|0}j=b-1|0;b=c[g>>2]|0;if(j>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((j|0)==0){k=0;i=h;return k|0}else{l=j;m=e;n=b}while(1){b=a[m]|0;c[g>>2]=n+1;a[n]=b;b=l-1|0;if((b|0)==0){k=0;break}l=b;m=m+1|0;n=c[g>>2]|0}i=h;return k|0}function iL(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a+8|0;a=bO(c[b>>2]|0)|0;d=jM(0,0,1)|0;if((a|0)!=0){bO(a|0)|0}if((d|0)!=0){e=-1;return e|0}d=c[b>>2]|0;if((d|0)==0){e=1;return e|0}e=bO(d|0)|0;d=aK()|0;if((e|0)==0){f=(d|0)==1;g=f&1;return g|0}bO(e|0)|0;f=(d|0)==1;g=f&1;return g|0}function iM(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=d;d=0;j=0;while(1){k=bO(c[i>>2]|0)|0;l=jI(a,h-a|0,b)|0;if((k|0)!=0){bO(k|0)|0}if((l|0)==0){m=1;n=a+1|0}else if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;o=1651;break}else{m=l;n=a+l|0}l=m+d|0;k=j+1|0;if(k>>>0>=f>>>0|(n|0)==(e|0)){g=l;o=1652;break}else{a=n;d=l;j=k}}if((o|0)==1651){return g|0}else if((o|0)==1652){return g|0}return 0}function iN(a){a=a|0;var b=0,d=0;b=c[a+8>>2]|0;if((b|0)==0){d=1;return d|0}a=bO(b|0)|0;b=aK()|0;if((a|0)==0){d=b;return d|0}bO(a|0)|0;d=b;return d|0}function iO(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function iP(a){a=a|0;return 0}function iQ(a){a=a|0;return 0}function iR(a){a=a|0;return 4}function iS(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L1905:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=1700;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=1701;break L1905}c[j>>2]=p+1;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=1702;break L1905}c[j>>2]=p+1;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=1703;break L1905}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=1708;break L1905}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=1709;break L1905}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=1704;break L1905}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=1705;break L1905}if((d-(c[j>>2]|0)|0)<4){m=1;o=1706;break L1905}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=1707;break L1905}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=1710;break}}if((o|0)==1706){return m|0}else if((o|0)==1710){return m|0}else if((o|0)==1700){return m|0}else if((o|0)==1701){return m|0}else if((o|0)==1702){return m|0}else if((o|0)==1703){return m|0}else if((o|0)==1704){return m|0}else if((o|0)==1705){return m|0}else if((o|0)==1707){return m|0}else if((o|0)==1708){return m|0}else if((o|0)==1709){return m|0}return 0}function iT(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L1950:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L1952:while(1){if(e>>>0>=i>>>0){o=n;break L1950}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=1772;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1}else{if((p&255)<194){r=2;s=1752;break L1952}if((p&255)<224){if((h-n|0)<2){r=1;s=1765;break L1952}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=1766;break L1952}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=1754;break L1952}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2;break}if((p&255)<240){if((h-n|0)<3){r=1;s=1753;break L1952}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=1767;break L1952}}else if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=1768;break L1952}}else{if((u&-64)<<24>>24!=-128){r=2;s=1769;break L1952}}v=t&255;if((v&192|0)!=128){r=2;s=1758;break L1952}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=1755;break L1952}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3;break}if((p&255)>=245){r=2;s=1770;break L1952}if((h-n|0)<4){r=1;s=1756;break L1952}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==240){if((t+112&255)>=48){r=2;s=1757;break L1952}}else if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=1759;break L1952}}else{if((t&-64)<<24>>24!=-128){r=2;s=1760;break L1952}}w=v&255;if((w&192|0)!=128){r=2;s=1761;break L1952}v=u&255;if((v&192|0)!=128){r=2;s=1762;break L1952}if((l-e|0)<4){r=1;s=1763;break L1952}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=1764;break L1952}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L1950}}if((s|0)==1753){return r|0}else if((s|0)==1754){return r|0}else if((s|0)==1755){return r|0}else if((s|0)==1763){return r|0}else if((s|0)==1764){return r|0}else if((s|0)==1765){return r|0}else if((s|0)==1758){return r|0}else if((s|0)==1759){return r|0}else if((s|0)==1760){return r|0}else if((s|0)==1772){return r|0}else if((s|0)==1768){return r|0}else if((s|0)==1769){return r|0}else if((s|0)==1770){return r|0}else if((s|0)==1761){return r|0}else if((s|0)==1762){return r|0}else if((s|0)==1752){return r|0}else if((s|0)==1766){return r|0}else if((s|0)==1767){return r|0}else if((s|0)==1756){return r|0}else if((s|0)==1757){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0|0;return r|0}function iU(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2019:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L2021:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L2019}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L2019}if((k&255)<224){if((g-j|0)<2){m=j;break L2019}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L2019}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L2019}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L2019}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==224){if((p&-32)<<24>>24!=-96){s=1793;break L2021}}else if((l|0)==237){if((p&-32)<<24>>24!=-128){s=1795;break L2021}}else{if((p&-64)<<24>>24!=-128){s=1797;break L2021}}t=r&255;if((t&192|0)!=128){m=j;break L2019}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L2019}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L2019}u=j;if((g-u|0)<4){m=j;break L2019}if((e-i|0)>>>0<2){m=j;break L2019}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==240){if((t+112&255)>=48){s=1806;break L2021}}else if((l|0)==244){if((t&-16)<<24>>24!=-128){s=1808;break L2021}}else{if((t&-64)<<24>>24!=-128){s=1810;break L2021}}v=p&255;if((v&192|0)!=128){m=j;break L2019}p=r&255;if((p&192|0)!=128){m=j;break L2019}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L2019}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L2019}}if((s|0)==1793){w=q-b|0;return w|0}else if((s|0)==1808){w=u-b|0;return w|0}else if((s|0)==1795){w=q-b|0;return w|0}else if((s|0)==1797){w=q-b|0;return w|0}else if((s|0)==1806){w=u-b|0;return w|0}else if((s|0)==1810){w=u-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function iV(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=iT(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function iW(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return iU(c,d,e,1114111,0)|0}function iX(a){a=a|0;cE(a|0);kn(a);return}function iY(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=i1(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function iZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function i_(a){a=a|0;return 0}function i$(a){a=a|0;return 0}function i0(a){a=a|0;return 4}function i1(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L2090:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=1853;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=1852;break L2090}c[h>>2]=b+1;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=1857;break L2090}c[h>>2]=b+1;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=1854;break L2090}c[h>>2]=b+1;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=1856;break L2090}c[h>>2]=b+1;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=1855;break}}if((l|0)==1856){return k|0}else if((l|0)==1852){return k|0}else if((l|0)==1857){return k|0}else if((l|0)==1855){return k|0}else if((l|0)==1854){return k|0}else if((l|0)==1853){return k|0}return 0}function i2(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L2122:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L2124:while(1){if(k>>>0>=h>>>0){m=b;break L2122}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=1900;break L2124}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1}else{if((n&255)<194){p=2;q=1919;break L2124}if((n&255)<224){if((g-b|0)<2){p=1;q=1905;break L2124}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=1912;break L2124}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=1911;break L2124}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2;break}if((n&255)<240){if((g-b|0)<3){p=1;q=1910;break L2124}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=1902;break L2124}}else if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=1913;break L2124}}else{if((s&-64)<<24>>24!=-128){p=2;q=1917;break L2124}}t=r&255;if((t&192|0)!=128){p=2;q=1908;break L2124}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=1916;break L2124}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3;break}if((n&255)>=245){p=2;q=1906;break L2124}if((g-b|0)<4){p=1;q=1907;break L2124}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=1903;break L2124}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=1914;break L2124}}else{if((r&-64)<<24>>24!=-128){p=2;q=1918;break L2124}}u=t&255;if((u&192|0)!=128){p=2;q=1901;break L2124}t=s&255;if((t&192|0)!=128){p=2;q=1909;break L2124}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=1915;break L2124}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L2122}}if((q|0)==1903){return p|0}else if((q|0)==1911){return p|0}else if((q|0)==1912){return p|0}else if((q|0)==1913){return p|0}else if((q|0)==1908){return p|0}else if((q|0)==1909){return p|0}else if((q|0)==1910){return p|0}else if((q|0)==1900){return p|0}else if((q|0)==1901){return p|0}else if((q|0)==1902){return p|0}else if((q|0)==1917){return p|0}else if((q|0)==1918){return p|0}else if((q|0)==1919){return p|0}else if((q|0)==1905){return p|0}else if((q|0)==1906){return p|0}else if((q|0)==1907){return p|0}else if((q|0)==1914){return p|0}else if((q|0)==1915){return p|0}else if((q|0)==1916){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0|0;return p|0}function i3(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2189:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L2191:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L2189}n=j+1|0}else{if((k&255)<194){m=j;break L2189}if((k&255)<224){if((g-j|0)<2){m=j;break L2189}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L2189}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L2189}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L2189}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==224){if((o&-32)<<24>>24!=-96){r=1940;break L2191}}else if((l|0)==237){if((o&-32)<<24>>24!=-128){r=1942;break L2191}}else{if((o&-64)<<24>>24!=-128){r=1944;break L2191}}s=q&255;if((s&192|0)!=128){m=j;break L2189}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L2189}n=j+3|0;break}if((k&255)>=245){m=j;break L2189}t=j;if((g-t|0)<4){m=j;break L2189}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==244){if((s&-16)<<24>>24!=-128){r=1954;break L2191}}else if((l|0)==240){if((s+112&255)>=48){r=1952;break L2191}}else{if((s&-64)<<24>>24!=-128){r=1956;break L2191}}u=o&255;if((u&192|0)!=128){m=j;break L2189}o=q&255;if((o&192|0)!=128){m=j;break L2189}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L2189}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L2189}i=i+1|0;j=n}if((r|0)==1942){v=p-b|0;return v|0}else if((r|0)==1944){v=p-b|0;return v|0}else if((r|0)==1940){v=p-b|0;return v|0}else if((r|0)==1954){v=t-b|0;return v|0}else if((r|0)==1952){v=t-b|0;return v|0}else if((r|0)==1956){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function i4(b){b=b|0;return a[b+8|0]|0}function i5(a){a=a|0;return c[a+8>>2]|0}function i6(b){b=b|0;return a[b+9|0]|0}function i7(a){a=a|0;return c[a+12>>2]|0}function i8(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=i2(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function i9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return i3(c,d,e,1114111,0)|0}function ja(a){a=a|0;cE(a|0);kn(a);return}function jb(a){a=a|0;cE(a|0);kn(a);return}function jc(a){a=a|0;c[a>>2]=3032;dj(a+12|0);cE(a|0);kn(a);return}function jd(a){a=a|0;c[a>>2]=3032;dj(a+12|0);cE(a|0);return}function je(a){a=a|0;c[a>>2]=2984;dj(a+16|0);cE(a|0);kn(a);return}function jf(a){a=a|0;c[a>>2]=2984;dj(a+16|0);cE(a|0);return}function jg(a,b){a=a|0;b=b|0;dq(a,b+12|0);return}function jh(a,b){a=a|0;b=b|0;dq(a,b+16|0);return}function ji(a,b){a=a|0;b=b|0;dr(a,1288,4);return}function jj(a,b){a=a|0;b=b|0;dD(a,1264,jT(1264)|0);return}function jk(a,b){a=a|0;b=b|0;dr(a,1256,5);return}function jl(a,b){a=a|0;b=b|0;dD(a,1232,jT(1232)|0);return}function jm(b){b=b|0;var d=0;if((a[13808]|0)!=0){d=c[3070]|0;return d|0}if((bt(13808)|0)==0){d=c[3070]|0;return d|0}do{if((a[13696]|0)==0){if((bt(13696)|0)==0){break}kv(11320,0,168);aQ(262,0,u|0)|0}}while(0);dk(11320,1536)|0;dk(11332,1528)|0;dk(11344,1520)|0;dk(11356,1504)|0;dk(11368,1488)|0;dk(11380,1480)|0;dk(11392,1464)|0;dk(11404,1456)|0;dk(11416,1448)|0;dk(11428,1440)|0;dk(11440,1432)|0;dk(11452,1400)|0;dk(11464,1392)|0;dk(11476,1384)|0;c[3070]=11320;d=c[3070]|0;return d|0}function jn(b){b=b|0;var d=0;if((a[13752]|0)!=0){d=c[3048]|0;return d|0}if((bt(13752)|0)==0){d=c[3048]|0;return d|0}do{if((a[13672]|0)==0){if((bt(13672)|0)==0){break}kv(10576,0,168);aQ(146,0,u|0)|0}}while(0);dx(10576,1912)|0;dx(10588,1880)|0;dx(10600,1848)|0;dx(10612,1808)|0;dx(10624,1768)|0;dx(10636,1736)|0;dx(10648,1696)|0;dx(10660,1680)|0;dx(10672,1624)|0;dx(10684,1608)|0;dx(10696,1592)|0;dx(10708,1576)|0;dx(10720,1560)|0;dx(10732,1544)|0;c[3048]=10576;d=c[3048]|0;return d|0}function jo(b){b=b|0;var d=0;if((a[13800]|0)!=0){d=c[3068]|0;return d|0}if((bt(13800)|0)==0){d=c[3068]|0;return d|0}do{if((a[13688]|0)==0){if((bt(13688)|0)==0){break}kv(11032,0,288);aQ(170,0,u|0)|0}}while(0);dk(11032,288)|0;dk(11044,272)|0;dk(11056,264)|0;dk(11068,256)|0;dk(11080,248)|0;dk(11092,240)|0;dk(11104,232)|0;dk(11116,224)|0;dk(11128,208)|0;dk(11140,200)|0;dk(11152,184)|0;dk(11164,168)|0;dk(11176,160)|0;dk(11188,152)|0;dk(11200,144)|0;dk(11212,136)|0;dk(11224,248)|0;dk(11236,88)|0;dk(11248,80)|0;dk(11260,1976)|0;dk(11272,1968)|0;dk(11284,1960)|0;dk(11296,1952)|0;dk(11308,1944)|0;c[3068]=11032;d=c[3068]|0;return d|0}function jp(b){b=b|0;var d=0;if((a[13744]|0)!=0){d=c[3046]|0;return d|0}if((bt(13744)|0)==0){d=c[3046]|0;return d|0}do{if((a[13664]|0)==0){if((bt(13664)|0)==0){break}kv(10288,0,288);aQ(120,0,u|0)|0}}while(0);dx(10288,824)|0;dx(10300,784)|0;dx(10312,760)|0;dx(10324,736)|0;dx(10336,424)|0;dx(10348,712)|0;dx(10360,688)|0;dx(10372,656)|0;dx(10384,616)|0;dx(10396,584)|0;dx(10408,544)|0;dx(10420,504)|0;dx(10432,488)|0;dx(10444,472)|0;dx(10456,456)|0;dx(10468,440)|0;dx(10480,424)|0;dx(10492,408)|0;dx(10504,392)|0;dx(10516,376)|0;dx(10528,344)|0;dx(10540,328)|0;dx(10552,312)|0;dx(10564,296)|0;c[3046]=10288;d=c[3046]|0;return d|0}function jq(b){b=b|0;var d=0;if((a[13816]|0)!=0){d=c[3072]|0;return d|0}if((bt(13816)|0)==0){d=c[3072]|0;return d|0}do{if((a[13704]|0)==0){if((bt(13704)|0)==0){break}kv(11488,0,288);aQ(118,0,u|0)|0}}while(0);dk(11488,864)|0;dk(11500,856)|0;c[3072]=11488;d=c[3072]|0;return d|0}function jr(b){b=b|0;var d=0;if((a[13760]|0)!=0){d=c[3050]|0;return d|0}if((bt(13760)|0)==0){d=c[3050]|0;return d|0}do{if((a[13680]|0)==0){if((bt(13680)|0)==0){break}kv(10744,0,288);aQ(238,0,u|0)|0}}while(0);dx(10744,888)|0;dx(10756,872)|0;c[3050]=10744;d=c[3050]|0;return d|0}function js(b){b=b|0;if((a[13824]|0)!=0){return 12296}if((bt(13824)|0)==0){return 12296}dr(12296,1216,8);aQ(254,12296,u|0)|0;return 12296}function jt(b){b=b|0;if((a[13768]|0)!=0){return 12208}if((bt(13768)|0)==0){return 12208}dD(12208,1176,jT(1176)|0);aQ(192,12208,u|0)|0;return 12208}function ju(b){b=b|0;if((a[13848]|0)!=0){return 12344}if((bt(13848)|0)==0){return 12344}dr(12344,1144,8);aQ(254,12344,u|0)|0;return 12344}function jv(b){b=b|0;if((a[13792]|0)!=0){return 12256}if((bt(13792)|0)==0){return 12256}dD(12256,1104,jT(1104)|0);aQ(192,12256,u|0)|0;return 12256}function jw(b){b=b|0;if((a[13840]|0)!=0){return 12328}if((bt(13840)|0)==0){return 12328}dr(12328,1080,20);aQ(254,12328,u|0)|0;return 12328}function jx(b){b=b|0;if((a[13784]|0)!=0){return 12240}if((bt(13784)|0)==0){return 12240}dD(12240,992,jT(992)|0);aQ(192,12240,u|0)|0;return 12240}function jy(b){b=b|0;if((a[13832]|0)!=0){return 12312}if((bt(13832)|0)==0){return 12312}dr(12312,976,11);aQ(254,12312,u|0)|0;return 12312}function jz(b){b=b|0;if((a[13776]|0)!=0){return 12224}if((bt(13776)|0)==0){return 12224}dD(12224,928,jT(928)|0);aQ(192,12224,u|0)|0;return 12224}function jA(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;bW[f&511](a);return}else{f=c[(c[d>>2]|0)+(e-1)>>2]|0;bW[f&511](a);return}}function jB(a){a=a|0;dw(11020);dw(11008);dw(10996);dw(10984);dw(10972);dw(10960);dw(10948);dw(10936);dw(10924);dw(10912);dw(10900);dw(10888);dw(10876);dw(10864);dw(10852);dw(10840);dw(10828);dw(10816);dw(10804);dw(10792);dw(10780);dw(10768);dw(10756);dw(10744);return}function jC(a){a=a|0;dj(11764);dj(11752);dj(11740);dj(11728);dj(11716);dj(11704);dj(11692);dj(11680);dj(11668);dj(11656);dj(11644);dj(11632);dj(11620);dj(11608);dj(11596);dj(11584);dj(11572);dj(11560);dj(11548);dj(11536);dj(11524);dj(11512);dj(11500);dj(11488);return}function jD(a){a=a|0;dw(10564);dw(10552);dw(10540);dw(10528);dw(10516);dw(10504);dw(10492);dw(10480);dw(10468);dw(10456);dw(10444);dw(10432);dw(10420);dw(10408);dw(10396);dw(10384);dw(10372);dw(10360);dw(10348);dw(10336);dw(10324);dw(10312);dw(10300);dw(10288);return}function jE(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}k=l+4|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b+16|0;k=b|0;l=c[k>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){hW(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=2231}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=2231;break}a[l]=1;p=j;q=h}}while(0);if((o|0)==2231){p=kj(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;do{if((d|0)==0){r=0}else{c[d>>2]=0;r=d}d=r+4|0;n=n-1|0;}while((n|0)!=0);n=p+(q<<2)|0;q=c[k>>2]|0;r=(c[f>>2]|0)-q|0;o=p+(g-(r>>2)<<2)|0;g=o;p=q;ku(g|0,p|0,r)|0;c[k>>2]=o;c[f>>2]=d;c[e>>2]=n;if((q|0)==0){return}if((q|0)==(j|0)){a[b+128|0]=0;return}else{kn(p);return}}function jF(a){a=a|0;dj(11308);dj(11296);dj(11284);dj(11272);dj(11260);dj(11248);dj(11236);dj(11224);dj(11212);dj(11200);dj(11188);dj(11176);dj(11164);dj(11152);dj(11140);dj(11128);dj(11116);dj(11104);dj(11092);dj(11080);dj(11068);dj(11056);dj(11044);dj(11032);return}function jG(a){a=a|0;dw(10732);dw(10720);dw(10708);dw(10696);dw(10684);dw(10672);dw(10660);dw(10648);dw(10636);dw(10624);dw(10612);dw(10600);dw(10588);dw(10576);return}function jH(a){a=a|0;dj(11476);dj(11464);dj(11452);dj(11440);dj(11428);dj(11416);dj(11404);dj(11392);dj(11380);dj(11368);dj(11356);dj(11344);dj(11332);dj(11320);return}function jI(a,b,c){a=a|0;b=b|0;c=c|0;return jJ(0,a,b,(c|0)!=0?c:9808)|0}function jJ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?9800:f)|0;f=c[j>>2]|0;L2535:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0|0;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L2535}o=d+1|0;p=c[s+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L2553:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L2535}else{t=o;u=p;v=q;w=l}while(1){t=t+1|0;u=(w&255)-128|u<<6;v=v-1|0;if((u|0)>=0){break}if((v|0)==0){r=u;break L2553}w=a[t]|0;if(((w&255)-128|0)>>>0>63){break L2535}}c[j>>2]=0;c[m>>2]=u;k=e-v|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(aM()|0)>>2]=138;k=-1;i=g;return k|0}function jK(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L2566:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L2566}z=y?s:x;A=t-z|0;x=jL(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L2566}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L2577:do{if((r|0)==0){D=n}else{if((p|0)==0|(o|0)==0){D=n;break}else{E=p;F=o;G=n;H=q;I=r}while(1){J=jJ(H,I,F,f)|0;if((J+2|0)>>>0<3){break}A=(c[j>>2]|0)+J|0;c[j>>2]=A;B=E-1|0;C=G+1|0;if((B|0)==0|(F|0)==(J|0)){D=C;break L2577}else{E=B;F=F-J|0;G=C;H=H+4|0;I=A}}if((J|0)==(-1|0)){D=-1;break}else if((J|0)==0){c[j>>2]=0;D=G;break}else{c[f>>2]=0;D=G;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=c[j>>2];i=g;return D|0}function jL(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;h=c[e>>2]|0;do{if((g|0)==0){i=2298}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=2298;break}if((b|0)==0){l=k;m=h;n=f;i=2309;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=2329}}while(0);if((i|0)==2298){if((b|0)==0){t=h;u=f;i=2300}else{v=h;w=b;x=f;i=2299}}L2598:while(1){if((i|0)==2329){i=0;h=d[p]|0;g=h>>>3;if((g-16|g+(o>>26))>>>0>7){i=2330;break}g=p+1|0;y=h-128|o<<6;do{if((y|0)<0){h=(d[g]|0)-128|0;if(h>>>0>63){i=2333;break L2598}k=p+2|0;z=h|y<<6;if((z|0)>=0){A=z;B=k;break}h=(d[k]|0)-128|0;if(h>>>0>63){i=2336;break L2598}A=h|z<<6;B=p+3|0}else{A=y;B=g}}while(0);c[q>>2]=A;v=B;w=q+4|0;x=r-1|0;i=2299;continue}else if((i|0)==2309){i=0;g=(d[m]|0)>>>3;if((g-16|g+(l>>26))>>>0>7){i=2310;break}g=m+1|0;do{if((l&33554432|0)==0){C=g}else{if(((d[g]|0)-128|0)>>>0>63){i=2313;break L2598}h=m+2|0;if((l&524288|0)==0){C=h;break}if(((d[h]|0)-128|0)>>>0>63){i=2316;break L2598}C=m+3|0}}while(0);t=C;u=n-1|0;i=2300;continue}else if((i|0)==2299){i=0;if((x|0)==0){D=f;i=2351;break}else{E=x;F=w;G=v}while(1){g=a[G]|0;do{if(((g&255)-1|0)>>>0<127){if((G&3|0)==0&E>>>0>3){H=E;I=F;J=G}else{K=G;L=F;M=E;N=g;break}while(1){O=c[J>>2]|0;if(((O-16843009|O)&-2139062144|0)!=0){i=2323;break}c[I>>2]=O&255;c[I+4>>2]=d[J+1|0]|0;c[I+8>>2]=d[J+2|0]|0;P=J+4|0;Q=I+16|0;c[I+12>>2]=d[J+3|0]|0;R=H-4|0;if(R>>>0>3){H=R;I=Q;J=P}else{i=2324;break}}if((i|0)==2324){i=0;K=P;L=Q;M=R;N=a[P]|0;break}else if((i|0)==2323){i=0;K=J;L=I;M=H;N=O&255;break}}else{K=G;L=F;M=E;N=g}}while(0);S=N&255;if((S-1|0)>>>0>=127){break}c[L>>2]=S;g=M-1|0;if((g|0)==0){D=f;i=2350;break L2598}else{E=g;F=L+4|0;G=K+1|0}}g=S-194|0;if(g>>>0>50){T=M;U=L;V=K;i=2340;break}o=c[s+(g<<2)>>2]|0;p=K+1|0;q=L;r=M;i=2329;continue}else if((i|0)==2300){i=0;g=a[t]|0;do{if(((g&255)-1|0)>>>0<127){if((t&3|0)!=0){W=t;X=u;Y=g;break}h=c[t>>2]|0;if(((h-16843009|h)&-2139062144|0)==0){Z=u;_=t}else{W=t;X=u;Y=h&255;break}do{_=_+4|0;Z=Z-4|0;$=c[_>>2]|0;}while((($-16843009|$)&-2139062144|0)==0);W=_;X=Z;Y=$&255}else{W=t;X=u;Y=g}}while(0);g=Y&255;if((g-1|0)>>>0<127){t=W+1|0;u=X-1|0;i=2300;continue}h=g-194|0;if(h>>>0>50){T=X;U=b;V=W;i=2340;break}l=c[s+(h<<2)>>2]|0;m=W+1|0;n=X;i=2309;continue}}if((i|0)==2330){aa=o;ab=p-1|0;ac=q;ad=r;i=2339}else if((i|0)==2350){return D|0}else if((i|0)==2351){return D|0}else if((i|0)==2336){aa=z;ab=p-1|0;ac=q;ad=r;i=2339}else if((i|0)==2313){aa=l;ab=m-1|0;ac=b;ad=n;i=2339}else if((i|0)==2333){aa=y;ab=p-1|0;ac=q;ad=r;i=2339}else if((i|0)==2316){aa=l;ab=m-1|0;ac=b;ad=n;i=2339}else if((i|0)==2310){aa=l;ab=m-1|0;ac=b;ad=n;i=2339}if((i|0)==2339){if((aa|0)==0){T=ad;U=ac;V=ab;i=2340}else{ae=ac;af=ab}}do{if((i|0)==2340){if((a[V]|0)!=0){ae=U;af=V;break}if((U|0)!=0){c[U>>2]=0;c[e>>2]=0}D=f-T|0;return D|0}}while(0);c[(aM()|0)>>2]=138;if((ae|0)==0){D=-1;return D|0}c[e>>2]=af;D=-1;return D|0}function jM(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m-194|0;if(k>>>0>50){break}m=e+1|0;n=c[s+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>(((f*6|0)-6|0)>>>0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m-16|m+(n>>26))>>>0>7){break}m=k-128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)-128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)-128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(aM()|0)>>2]=138;j=-1;i=g;return j|0}function jN(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[(aM()|0)>>2]=138;f=-1;return f|0}return 0}function jO(a){a=a|0;return}function jP(a){a=a|0;return}function jQ(a){a=a|0;return 1328|0}function jR(a){a=a|0;return}function jS(a){a=a|0;return}function jT(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function jU(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((d|0)==0){return a|0}else{e=b;f=d;g=a}while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}return a|0}function jV(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}else{f=d}do{f=f-1|0;c[a+(f<<2)>>2]=c[b+(f<<2)>>2];}while((f|0)!=0);return a|0}else{if(e){return a|0}else{g=b;h=d;i=a}while(1){d=h-1|0;c[i>>2]=c[g>>2];if((d|0)==0){break}else{g=g+4|0;h=d;i=i+4|0}}return a|0}return 0}function jW(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((d|0)==0){return a|0}else{e=d;f=a}while(1){d=e-1|0;c[f>>2]=b;if((d|0)==0){break}else{e=d;f=f+4|0}}return a|0}function jX(a){a=a|0;c[a>>2]=2440;return}function jY(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function jZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L2771:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L2771}x=w?r:s;y=s-x|0;w=j_(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L2771}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L2782:do{if((q|0)==0){B=m}else{if((o|0)==0|(n|0)==0){B=m;break}else{C=o;D=n;E=m;F=p;G=q}while(1){H=jN(F,c[G>>2]|0,0)|0;if((H+1|0)>>>0<2){break}y=(c[h>>2]|0)+4|0;c[h>>2]=y;z=D-1|0;A=E+1|0;if((C|0)==(H|0)|(z|0)==0){B=A;break L2782}else{C=C-H|0;D=z;E=A;F=F+H|0;G=y}}if((H|0)!=0){B=-1;break}c[h>>2]=0;B=E}}while(0);if(!k){i=f;return B|0}c[b>>2]=c[h>>2];i=f;return B|0}function j_(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=jN(j,o,0)|0;if((k|0)==-1){l=-1;p=2483;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=2485;break}else{m=k;n=h;o=r}}if((p|0)==2485){i=f;return l|0}else if((p|0)==2483){i=f;return l|0}}L2808:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L2808}if(q>>>0>127){j=jN(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L2808}}i=f;return l|0}else{s=e;t=b}}while(0);L2820:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=2478;break}if(m>>>0>127){n=jN(b,m,0)|0;if((n|0)==-1){l=-1;p=2487;break}if(n>>>0>u>>>0){p=2474;break}o=c[w>>2]|0;jN(v,o,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L2820}else{u=z;v=y;w=m}}if((p|0)==2478){a[v]=0;x=u;break}else if((p|0)==2487){i=f;return l|0}else if((p|0)==2474){l=e-u|0;i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function j$(a){a=a|0;kn(a);return}function j0(a){a=a|0;jO(a|0);return}function j1(a){a=a|0;jO(a|0);kn(a);return}function j2(a){a=a|0;jO(a|0);kn(a);return}function j3(a){a=a|0;jO(a|0);kn(a);return}function j4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=j7(b,9704,9688,-1)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}kv(f|0,0,56);c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;b9[c[(c[h>>2]|0)+28>>2]&15](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function j5(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;b9[c[(c[g>>2]|0)+28>>2]&15](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function j6(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;b9[c[(c[j>>2]|0)+28>>2]&15](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;b9[c[(c[j>>2]|0)+28>>2]&15](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=2534;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=2537;break}}if((m|0)==2537){return}else if((m|0)==2534){return}}function j7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;kv(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;b7[c[(c[k>>2]|0)+20>>2]&31](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}bU[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;if((j|0)==0){if((c[n>>2]|0)!=1){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}o=(c[m>>2]|0)==1?c[b>>2]|0:0;i=f;return o|0}else if((j|0)==1){do{if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}if((c[m>>2]|0)==1){break}else{o=0}i=f;return o|0}}while(0);o=c[e>>2]|0;i=f;return o|0}else{o=0;i=f;return o|0}return 0}function j8(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function j9(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function ka(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L3002:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L3004:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;b7[c[(c[v>>2]|0)+20>>2]&31](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L3004}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=2627;break L3002}if((c[o>>2]&2|0)==0){B=2627;break L3002}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=2626}else{D=x;B=2623}}else{D=0;B=2623}}while(0);do{if((B|0)==2623){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)!=1){C=D;B=2626;break}if((c[d+24>>2]|0)!=2){C=D;B=2626;break}a[d+54|0]=1;if(D){B=2627}else{B=2628}}}while(0);if((B|0)==2626){if(C){B=2627}else{B=2628}}if((B|0)==2627){c[i>>2]=3;return}else if((B|0)==2628){c[i>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;bU[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=2657;break}if((c[b>>2]|0)==1){B=2658;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;bU[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=2661;break}}if((B|0)==2657){return}else if((B|0)==2658){return}else if((B|0)==2661){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=2668;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=2669;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;bU[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=2656;break}}if((B|0)==2668){return}else if((B|0)==2669){return}else if((B|0)==2656){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=2655;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;bU[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=2660;break}}if((B|0)==2655){return}else if((B|0)==2660){return}}function kb(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;bU[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;b7[c[(c[l>>2]|0)+20>>2]&31](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=2683}else{if((a[j]&1)==0){m=1;n=2683}}L3104:do{if((n|0)==2683){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=2686;break}a[d+54|0]=1;if(m){break L3104}}else{n=2686}}while(0);if((n|0)==2686){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function kc(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;b7[c[(c[p>>2]|0)+20>>2]&31](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L3126:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;do{if((a[p]&1)!=0){break L3126}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L3126}}else{if((c[o>>2]|0)==1){break L3126}if((c[q>>2]&2|0)==0){break L3126}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;b7[c[(c[u>>2]|0)+20>>2]&31](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;}while(s>>>0<n>>>0)}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function kd(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;b7[c[(c[i>>2]|0)+20>>2]&31](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function ke(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[2454]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=9856+(h<<2)|0;j=9856+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[2454]=e&~(1<<g)}else{if(l>>>0<(c[2458]|0)>>>0){bN();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{bN();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[2456]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=9856+(p<<2)|0;m=9856+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[2454]=e&~(1<<r)}else{if(l>>>0<(c[2458]|0)>>>0){bN();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{bN();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[2456]|0;if((l|0)!=0){q=c[2459]|0;d=l>>>3;l=d<<1;f=9856+(l<<2)|0;k=c[2454]|0;h=1<<d;do{if((k&h|0)==0){c[2454]=k|h;s=f;t=9856+(l+2<<2)|0}else{d=9856+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[2458]|0)>>>0){s=g;t=d;break}bN();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[2456]=m;c[2459]=e;n=i;return n|0}l=c[2455]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[10120+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[2458]|0;if(r>>>0<i>>>0){bN();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){bN();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){bN();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){bN();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){bN();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{bN();return 0}}}while(0);L78:do{if((e|0)!=0){f=d+28|0;i=10120+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[2455]=c[2455]&~(1<<c[f>>2]);break L78}else{if(e>>>0<(c[2458]|0)>>>0){bN();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L78}}}while(0);if(v>>>0<(c[2458]|0)>>>0){bN();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[2456]|0;if((f|0)!=0){e=c[2459]|0;i=f>>>3;f=i<<1;q=9856+(f<<2)|0;k=c[2454]|0;g=1<<i;do{if((k&g|0)==0){c[2454]=k|g;y=q;z=9856+(f+2<<2)|0}else{i=9856+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[2458]|0)>>>0){y=l;z=i;break}bN();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[2456]=p;c[2459]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[2455]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[10120+(A<<2)>>2]|0;L126:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L126}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[10120+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[2456]|0)-g|0)>>>0){o=g;break}q=K;m=c[2458]|0;if(q>>>0<m>>>0){bN();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){bN();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){bN();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){bN();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){bN();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{bN();return 0}}}while(0);L176:do{if((e|0)!=0){i=K+28|0;m=10120+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[2455]=c[2455]&~(1<<c[i>>2]);break L176}else{if(e>>>0<(c[2458]|0)>>>0){bN();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L176}}}while(0);if(L>>>0<(c[2458]|0)>>>0){bN();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=9856+(e<<2)|0;r=c[2454]|0;j=1<<i;do{if((r&j|0)==0){c[2454]=r|j;O=m;P=9856+(e+2<<2)|0}else{i=9856+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[2458]|0)>>>0){O=d;P=i;break}bN();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=10120+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[2455]|0;l=1<<Q;if((m&l|0)==0){c[2455]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=151;break}else{l=l<<1;m=j}}if((T|0)==151){if(S>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[2458]|0;if(m>>>0<i>>>0){bN();return 0}if(j>>>0<i>>>0){bN();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[2456]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[2459]|0;if(S>>>0>15){R=J;c[2459]=R+o;c[2456]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[2456]=0;c[2459]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[2457]|0;if(o>>>0<J>>>0){S=J-o|0;c[2457]=S;J=c[2460]|0;K=J;c[2460]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[2444]|0)==0){J=a$(8)|0;if((J-1&J|0)==0){c[2446]=J;c[2445]=J;c[2447]=-1;c[2448]=-1;c[2449]=0;c[2565]=0;c[2444]=(bj(0)|0)&-16^1431655768;break}else{bN();return 0}}}while(0);J=o+48|0;S=c[2446]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[2564]|0;do{if((O|0)!=0){P=c[2562]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L268:do{if((c[2565]&4|0)==0){O=c[2460]|0;L270:do{if((O|0)==0){T=181}else{L=O;P=10264;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=181;break L270}else{P=M}}if((P|0)==0){T=181;break}L=R-(c[2457]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bE(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=190}}while(0);do{if((T|0)==181){O=bE(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[2445]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[2562]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[2564]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bE($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=190}}while(0);L290:do{if((T|0)==190){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=201;break L268}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[2446]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bE(O|0)|0)==-1){bE(m|0)|0;W=Y;break L290}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=201;break L268}}}while(0);c[2565]=c[2565]|4;ad=W;T=198}else{ad=0;T=198}}while(0);do{if((T|0)==198){if(S>>>0>=2147483647){break}W=bE(S|0)|0;Z=bE(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=201}}}while(0);do{if((T|0)==201){ad=(c[2562]|0)+aa|0;c[2562]=ad;if(ad>>>0>(c[2563]|0)>>>0){c[2563]=ad}ad=c[2460]|0;L310:do{if((ad|0)==0){S=c[2458]|0;if((S|0)==0|ab>>>0<S>>>0){c[2458]=ab}c[2566]=ab;c[2567]=aa;c[2569]=0;c[2463]=c[2444];c[2462]=-1;S=0;do{Y=S<<1;ac=9856+(Y<<2)|0;c[9856+(Y+3<<2)>>2]=ac;c[9856+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[2460]=ab+ae;c[2457]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[2461]=c[2448]}else{S=10264;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=213;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==213){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[2460]|0;Y=(c[2457]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[2460]=Z+ai;c[2457]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[2461]=c[2448];break L310}}while(0);if(ab>>>0<(c[2458]|0)>>>0){c[2458]=ab}S=ab+aa|0;Y=10264;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=223;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==223){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[2460]|0)){J=(c[2457]|0)+K|0;c[2457]=J;c[2460]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[2459]|0)){J=(c[2456]|0)+K|0;c[2456]=J;c[2459]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L355:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=9856+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[2458]|0)>>>0){bN();return 0}if((c[U+12>>2]|0)==(Z|0)){break}bN();return 0}}while(0);if((Q|0)==(U|0)){c[2454]=c[2454]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[2458]|0)>>>0){bN();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}bN();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[2458]|0)>>>0){bN();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){bN();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{bN();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=10120+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[2455]=c[2455]&~(1<<c[P>>2]);break L355}else{if(m>>>0<(c[2458]|0)>>>0){bN();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L355}}}while(0);if(an>>>0<(c[2458]|0)>>>0){bN();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=9856+(V<<2)|0;P=c[2454]|0;m=1<<J;do{if((P&m|0)==0){c[2454]=P|m;as=X;at=9856+(V+2<<2)|0}else{J=9856+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[2458]|0)>>>0){as=U;at=J;break}bN();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=10120+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[2455]|0;Q=1<<au;if((X&Q|0)==0){c[2455]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=296;break}else{Q=Q<<1;X=m}}if((T|0)==296){if(aw>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[2458]|0;if(X>>>0<$>>>0){bN();return 0}if(m>>>0<$>>>0){bN();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=10264;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[2460]=ab+aB;c[2457]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[2461]=c[2448];c[ac+4>>2]=27;c[W>>2]=c[2566];c[W+4>>2]=c[10268>>2];c[W+8>>2]=c[10272>>2];c[W+12>>2]=c[10276>>2];c[2566]=ab;c[2567]=aa;c[2569]=0;c[2568]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=9856+(K<<2)|0;S=c[2454]|0;m=1<<W;do{if((S&m|0)==0){c[2454]=S|m;aC=Z;aD=9856+(K+2<<2)|0}else{W=9856+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[2458]|0)>>>0){aC=Q;aD=W;break}bN();return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=10120+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[2455]|0;Q=1<<aE;if((Z&Q|0)==0){c[2455]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=331;break}else{Q=Q<<1;Z=m}}if((T|0)==331){if(aG>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[2458]|0;if(Z>>>0<m>>>0){bN();return 0}if(_>>>0<m>>>0){bN();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[2457]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[2457]=_;ad=c[2460]|0;Q=ad;c[2460]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aM()|0)>>2]=12;n=0;return n|0}function kf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[2458]|0;if(b>>>0<e>>>0){bN()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){bN()}h=f&-8;i=a+(h-8)|0;j=i;L527:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){bN()}if((n|0)==(c[2459]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[2456]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=9856+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){bN()}if((c[k+12>>2]|0)==(n|0)){break}bN()}}while(0);if((s|0)==(k|0)){c[2454]=c[2454]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){bN()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}bN()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){bN()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){bN()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){bN()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{bN()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=10120+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[2455]=c[2455]&~(1<<c[v>>2]);q=n;r=o;break L527}else{if(p>>>0<(c[2458]|0)>>>0){bN()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L527}}}while(0);if(A>>>0<(c[2458]|0)>>>0){bN()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2458]|0)>>>0){bN()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[2458]|0)>>>0){bN()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){bN()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){bN()}do{if((e&2|0)==0){if((j|0)==(c[2460]|0)){B=(c[2457]|0)+r|0;c[2457]=B;c[2460]=q;c[q+4>>2]=B|1;if((q|0)!=(c[2459]|0)){return}c[2459]=0;c[2456]=0;return}if((j|0)==(c[2459]|0)){B=(c[2456]|0)+r|0;c[2456]=B;c[2459]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L630:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=9856+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[2458]|0)>>>0){bN()}if((c[u+12>>2]|0)==(j|0)){break}bN()}}while(0);if((g|0)==(u|0)){c[2454]=c[2454]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[2458]|0)>>>0){bN()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}bN()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[2458]|0)>>>0){bN()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[2458]|0)>>>0){bN()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){bN()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{bN()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=10120+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[2455]=c[2455]&~(1<<c[t>>2]);break L630}else{if(f>>>0<(c[2458]|0)>>>0){bN()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L630}}}while(0);if(E>>>0<(c[2458]|0)>>>0){bN()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[2458]|0)>>>0){bN()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[2458]|0)>>>0){bN()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[2459]|0)){H=B;break}c[2456]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=9856+(d<<2)|0;A=c[2454]|0;E=1<<r;do{if((A&E|0)==0){c[2454]=A|E;I=e;J=9856+(d+2<<2)|0}else{r=9856+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[2458]|0)>>>0){I=h;J=r;break}bN()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=10120+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[2455]|0;d=1<<K;do{if((r&d|0)==0){c[2455]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=508;break}else{A=A<<1;J=E}}if((N|0)==508){if(M>>>0<(c[2458]|0)>>>0){bN()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[2458]|0;if(J>>>0<E>>>0){bN()}if(B>>>0<E>>>0){bN()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[2462]|0)-1|0;c[2462]=q;if((q|0)==0){O=10272}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[2462]=-1;return}function kg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=ke(b)|0;return d|0}if(b>>>0>4294967231){c[(aM()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=kh(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=ke(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;ku(f|0,a|0,e)|0;kf(a);d=f;return d|0}function kh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[2458]|0;if(g>>>0<j>>>0){bN();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){bN();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){bN();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[2446]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;ki(g+b|0,k);n=a;return n|0}if((i|0)==(c[2460]|0)){k=(c[2457]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[2460]=g+b;c[2457]=l;n=a;return n|0}if((i|0)==(c[2459]|0)){l=(c[2456]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[2456]=q;c[2459]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L816:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=9856+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){bN();return 0}if((c[l+12>>2]|0)==(i|0)){break}bN();return 0}}while(0);if((k|0)==(l|0)){c[2454]=c[2454]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){bN();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}bN();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){bN();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){bN();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){bN();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{bN();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=10120+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[2455]=c[2455]&~(1<<c[t>>2]);break L816}else{if(s>>>0<(c[2458]|0)>>>0){bN();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L816}}}while(0);if(y>>>0<(c[2458]|0)>>>0){bN();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[2458]|0)>>>0){bN();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;ki(g+b|0,q);n=a;return n|0}return 0}function ki(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L892:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[2458]|0;if(i>>>0<l>>>0){bN()}if((j|0)==(c[2459]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[2456]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=9856+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){bN()}if((c[p+12>>2]|0)==(j|0)){break}bN()}}while(0);if((q|0)==(p|0)){c[2454]=c[2454]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){bN()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}bN()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){bN()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){bN()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){bN()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{bN()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=10120+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[2455]=c[2455]&~(1<<c[t>>2]);n=j;o=k;break L892}else{if(m>>>0<(c[2458]|0)>>>0){bN()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L892}}}while(0);if(y>>>0<(c[2458]|0)>>>0){bN()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2458]|0)>>>0){bN()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[2458]|0)>>>0){bN()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[2458]|0;if(e>>>0<a>>>0){bN()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[2460]|0)){A=(c[2457]|0)+o|0;c[2457]=A;c[2460]=n;c[n+4>>2]=A|1;if((n|0)!=(c[2459]|0)){return}c[2459]=0;c[2456]=0;return}if((f|0)==(c[2459]|0)){A=(c[2456]|0)+o|0;c[2456]=A;c[2459]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L991:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=9856+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){bN()}if((c[g+12>>2]|0)==(f|0)){break}bN()}}while(0);if((t|0)==(g|0)){c[2454]=c[2454]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){bN()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}bN()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){bN()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){bN()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){bN()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{bN()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=10120+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[2455]=c[2455]&~(1<<c[l>>2]);break L991}else{if(m>>>0<(c[2458]|0)>>>0){bN()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L991}}}while(0);if(C>>>0<(c[2458]|0)>>>0){bN()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[2458]|0)>>>0){bN()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[2458]|0)>>>0){bN()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[2459]|0)){F=A;break}c[2456]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=9856+(z<<2)|0;C=c[2454]|0;b=1<<o;do{if((C&b|0)==0){c[2454]=C|b;G=y;H=9856+(z+2<<2)|0}else{o=9856+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[2458]|0)>>>0){G=d;H=o;break}bN()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=10120+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[2455]|0;z=1<<I;if((o&z|0)==0){c[2455]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=788;break}else{I=I<<1;J=G}}if((L|0)==788){if(K>>>0<(c[2458]|0)>>>0){bN()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[2458]|0;if(J>>>0<I>>>0){bN()}if(L>>>0<I>>>0){bN()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function kj(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=ke(b)|0;if((d|0)!=0){e=832;break}a=(I=c[3414]|0,c[3414]=I+0,I);if((a|0)==0){break}b3[a&3]()}if((e|0)==832){return d|0}d=bf(4)|0;c[d>>2]=2408;aN(d|0,8160,30);return 0}function kk(a){a=a|0;return kj(a)|0}function kl(a){a=a|0;return}function km(a){a=a|0;return 1160|0}function kn(a){a=a|0;if((a|0)==0){return}kf(a);return}function ko(a){a=a|0;kn(a);return}function kp(a){a=a|0;kn(a);return}function kq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((bg(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=862}else{if((e|0)>0){v=0.0;w=e;x=l;y=862}else{z=0.0;A=0.0}}if((y|0)==862){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10|0)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(aM()|0)>>2]=34;N=1.0;O=8;P=511;y=879}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=879}}if((y|0)==879){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=879}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function kr(a,b,c){a=a|0;b=b|0;c=c|0;return+(+kq(a,b))}function ks(){var a=0;a=bf(4)|0;c[a>>2]=2408;aN(a|0,8160,30)}function kt(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function ku(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function kv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function kw(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function kx(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{ku(b,c,d)|0}}function ky(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function kz(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function kA(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function kB(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function kC(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function kD(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function kE(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function kF(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c)|0;f=a>>>16;a=(e>>>16)+(ag(d,f)|0)|0;d=b>>>16;b=ag(d,c)|0;return(K=(a>>>16)+(ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function kG(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=kz(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=kz((kL(i,b,kz(g^c,h^d,g,h)|0,K,0)|0)^a,K^e,a,e)|0;return(K=K,f)|0}function kH(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=kz(h^a,j^b,h,j)|0;b=K;a=kz(k^d,l^e,k,l)|0;kL(m,b,a,K,g)|0;a=kz(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,a)|0}function kI(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=kF(e,a)|0;f=K;return(K=(ag(b,a)|0)+(ag(d,e)|0)+f|f&0,c|0|0)|0}function kJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=kL(a,b,c,d,0)|0;return(K=K,e)|0}function kK(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;kL(a,b,d,e,g)|0;i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function kL(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((kE(l|0)|0)>>>0);return(K=n,o)|0}p=(kD(l|0)|0)-(kD(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(kD(l|0)|0)-(kD(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(kD(j|0)|0)+33-(kD(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(K=n,o)|0}else{p=kE(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=ky(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;kz(e,k,j,a)|0;b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=kz(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(J|0)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function kM(){aR()}function kN(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;bU[a&7](b|0,c|0,d|0,e|0,f|0)}function kO(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;bV[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function kP(a,b){a=a|0;b=b|0;bW[a&511](b|0)}function kQ(a,b,c){a=a|0;b=b|0;c=c|0;bX[a&127](b|0,c|0)}function kR(a,b,c){a=a|0;b=b|0;c=c|0;return bY[a&31](b|0,c|0)|0}function kS(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return bZ[a&31](b|0,c|0,d|0,e|0,f|0)|0}function kT(a,b){a=a|0;b=b|0;return b_[a&127](b|0)|0}function kU(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return b$[a&63](b|0,c|0,d|0)|0}function kV(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;b0[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function kW(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b1[a&7](b|0,c|0,d|0)}function kX(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;b2[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function kY(a){a=a|0;b3[a&3]()}function kZ(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return b4[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function k_(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;b5[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function k$(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;b6[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function k0(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;b7[a&31](b|0,c|0,d|0,e|0,f|0,g|0)}function k1(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return b8[a&15](b|0,c|0,d|0,e|0)|0}function k2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b9[a&15](b|0,c|0,d|0,e|0)}function k3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0)}function k4(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(1)}function k5(a){a=a|0;ah(2)}function k6(a,b){a=a|0;b=b|0;ah(3)}function k7(a,b){a=a|0;b=b|0;ah(4);return 0}function k8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(5);return 0}function k9(a){a=a|0;ah(6);return 0}function la(a,b,c){a=a|0;b=b|0;c=c|0;ah(7);return 0}function lb(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(8)}function lc(a,b,c){a=a|0;b=b|0;c=c|0;ah(9)}function ld(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(10)}function le(){ah(11)}function lf(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(12);return 0}function lg(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(13)}function lh(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(14)}function li(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(15)}function lj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(16);return 0}function lk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17)}
// EMSCRIPTEN_END_FUNCS
var bU=[k3,k3,kb,k3,j8,k3,ka,k3];var bV=[k4,k4,gb,k4,gk,k4,gn,k4,hN,k4,f_,k4,fY,k4,hG,k4,f6,k4,ga,k4,go,k4,fM,k4,fE,k4,f9,k4,fu,k4,gl,k4,fK,k4,fw,k4,fs,k4,ft,k4,fl,k4,fv,k4,fq,k4,fo,k4,fB,k4,fA,k4,fx,k4,gp,k4,e5,k4,f7,k4,e9,k4,e1,k4,e3,k4,e7,k4,e_,k4,fh,k4,fe,k4,fb,k4,eX,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4,k4];var bW=[k5,k5,hQ,k5,eR,k5,fS,k5,db,k5,d1,k5,h7,k5,cS,k5,gy,k5,fC,k5,c0,k5,da,k5,fj,k5,eL,k5,eH,k5,kl,k5,c1,k5,ij,k5,im,k5,gj,k5,fk,k5,jX,k5,eB,k5,hL,k5,ik,k5,eg,k5,eS,k5,g5,k5,ie,k5,jd,k5,ip,k5,jR,k5,jc,k5,eF,k5,cC,k5,da,k5,eP,k5,gW,k5,jf,k5,il,k5,kf,k5,hE,k5,jb,k5,ej,k5,cB,k5,eO,k5,c1,k5,jA,k5,fD,k5,c3,k5,g6,k5,ef,k5,ez,k5,gw,k5,gi,k5,eI,k5,g$,k5,kp,k5,d0,k5,jC,k5,jD,k5,eC,k5,d8,k5,j2,k5,iq,k5,iG,k5,jP,k5,eh,k5,eG,k5,hh,k5,cD,k5,hb,k5,eD,k5,jG,k5,jS,k5,iX,k5,cM,k5,id,k5,ii,k5,gx,k5,hp,k5,j$,k5,ja,k5,gL,k5,hF,k5,jF,k5,gV,k5,fR,k5,eK,k5,cN,k5,eM,k5,el,k5,dh,k5,hw,k5,ho,k5,je,k5,dw,k5,dc,k5,jP,k5,j3,k5,ey,k5,di,k5,ee,k5,eA,k5,hK,k5,ep,k5,ex,k5,cT,k5,ir,k5,eJ,k5,hc,k5,f4,k5,g0,k5,cw,k5,hV,k5,hA,k5,ek,k5,d7,k5,ew,k5,jB,k5,f5,k5,j1,k5,hR,k5,cv,k5,j0,k5,hj,k5,hi,k5,dj,k5,io,k5,c9,k5,ei,k5,jH,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5,k5];var bX=[k6,k6,jk,k6,cx,k6,hf,k6,jh,k6,gR,k6,jg,k6,hP,k6,dN,k6,g_,k6,gS,k6,ha,k6,gZ,k6,hd,k6,gX,k6,hg,k6,ih,k6,gP,k6,cO,k6,gT,k6,jj,k6,g2,k6,c8,k6,g1,k6,jl,k6,gQ,k6,g4,k6,ji,k6,gO,k6,dG,k6,cU,k6,cH,k6,hT,k6,g7,k6,gN,k6,gM,k6,gY,k6,g8,k6,g9,k6,g3,k6,he,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6,k6];var bY=[k7,k7,iB,k7,cX,k7,h3,k7,hY,k7,dM,k7,cK,k7,cQ,k7,ix,k7,iD,k7,dT,k7,iz,k7,dL,k7,cz,k7,dS,k7,k7,k7];var bZ=[k8,k8,iO,k8,iM,k8,i9,k8,h$,k8,h9,k8,iW,k8,eu,k8,ib,k8,h6,k8,iK,k8,es,k8,iZ,k8,k8,k8,k8,k8,k8,k8];var b_=[k9,k9,jz,k9,gG,k9,dK,k9,jp,k9,d5,k9,jx,k9,gC,k9,iL,k9,iR,k9,f3,k9,jn,k9,cW,k9,ec,k9,dR,k9,jt,k9,jr,k9,i_,k9,jQ,k9,c4,k9,i7,k9,i4,k9,js,k9,iQ,k9,i5,k9,dI,k9,gK,k9,ju,k9,cV,k9,cy,k9,gD,k9,iF,k9,jy,k9,i0,k9,gI,k9,jm,k9,cI,k9,i$,k9,iN,k9,er,k9,gB,k9,cJ,k9,i6,k9,dJ,k9,dP,k9,cP,k9,gE,k9,h2,k9,h1,k9,km,k9,dQ,k9,gz,k9,jo,k9,h0,k9,gA,k9,cG,k9,gF,k9,gH,k9,jq,k9,gJ,k9,gh,k9,jw,k9,jv,k9,iP,k9];var b$=[la,la,et,la,iC,la,iA,la,j4,la,h4,la,ev,la,dd,la,d6,la,d4,la,it,la,dO,la,hS,la,h5,la,iy,la,eb,la,c7,la,iE,la,hM,la,dH,la,ed,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la,la];var b0=[lb,lb,f1,lb,f$,lb,fP,lb,fN,lb,lb,lb,lb,lb,lb,lb];var b1=[lc,lc,c6,lc,eE,lc,lc,lc];var b2=[ld,ld,gU,ld,gv,ld,hl,ld,ht,ld,hr,ld,hx,ld,ld,ld];var b3=[le,le,kM,le];var b4=[lf,lf,hZ,lf,iJ,lf,iV,lf,h_,lf,iY,lf,i8,lf,iI,lf,iH,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf,lf];var b5=[lg,lg,gr,lg,gd,lg,lg,lg];var b6=[lh,lh,hH,lh,hB,lh,lh,lh];var b7=[li,li,kc,li,fZ,li,fT,li,fV,li,kd,li,f2,li,hO,li,dW,li,fU,li,fH,li,fL,li,fF,li,j9,li,dU,li,hU,li];var b8=[lj,lj,iu,lj,iv,lj,ia,lj,h8,lj,iw,lj,lj,lj,lj,lj];var b9=[lk,lk,j5,lk,j6,lk,dV,lk,jY,lk,dX,lk,eQ,lk,eN,lk];return{_memcmp:kw,_strlen:kt,_free:kf,_realloc:kg,_memmove:kx,__GLOBAL__I_a:cZ,_memset:kv,_malloc:ke,_memcpy:ku,_checkResult:cs,runPostSets:cq,stackAlloc:ca,stackSave:cb,stackRestore:cc,setThrew:cd,setTempRet0:cg,setTempRet1:ch,setTempRet2:ci,setTempRet3:cj,setTempRet4:ck,setTempRet5:cl,setTempRet6:cm,setTempRet7:cn,setTempRet8:co,setTempRet9:cp,dynCall_viiiii:kN,dynCall_viiiiiii:kO,dynCall_vi:kP,dynCall_vii:kQ,dynCall_iii:kR,dynCall_iiiiii:kS,dynCall_ii:kT,dynCall_iiii:kU,dynCall_viiiiif:kV,dynCall_viii:kW,dynCall_viiiiiiii:kX,dynCall_v:kY,dynCall_iiiiiiiii:kZ,dynCall_viiiiiiiii:k_,dynCall_viiiiiif:k$,dynCall_viiiiii:k0,dynCall_iiiii:k1,dynCall_viiii:k2}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_sscanf": _sscanf, "___cxa_call_unexpected": ___cxa_call_unexpected, "_snprintf": _snprintf, "___locale_mb_cur_max": ___locale_mb_cur_max, "_fgetc": _fgetc, "___errno_location": ___errno_location, "___cxa_throw": ___cxa_throw, "_strerror": _strerror, "_pthread_mutex_lock": _pthread_mutex_lock, "_atexit": _atexit, "___cxa_pure_virtual": ___cxa_pure_virtual, "_llvm_eh_exception": _llvm_eh_exception, "___cxa_free_exception": ___cxa_free_exception, "_isdigit": _isdigit, "_pread": _pread, "_fflush": _fflush, "__addDays": __addDays, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "__isLeapYear": __isLeapYear, "__arraySum": __arraySum, "_sysconf": _sysconf, "___cxa_rethrow": ___cxa_rethrow, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "_send": _send, "_isxdigit": _isxdigit, "_write": _write, "__scanString": __scanString, "_strtoull": _strtoull, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "___cxa_allocate_exception": ___cxa_allocate_exception, "_isspace": _isspace, "_strtoll": _strtoll, "_fread": _fread, "_time": _time, "_vasprintf": _vasprintf, "_read": _read, "__formatString": __formatString, "__reallyNegative": __reallyNegative, "___resumeException": ___resumeException, "___cxa_is_number_type": ___cxa_is_number_type, "_pthread_cond_broadcast": _pthread_cond_broadcast, "___cxa_does_inherit": ___cxa_does_inherit, "___ctype_toupper_loc": ___ctype_toupper_loc, "___cxa_guard_acquire": ___cxa_guard_acquire, "__ZSt9terminatev": __ZSt9terminatev, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_recv": _recv, "__parseInt64": __parseInt64, "___cxa_guard_abort": ___cxa_guard_abort, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "__isFloat": __isFloat, "_vsnprintf": _vsnprintf, "_sbrk": _sbrk, "_strerror_r": _strerror_r, "_newlocale": _newlocale, "_asprintf": _asprintf, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_worker_respond": _emscripten_worker_respond, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "_llvm_lifetime_start": _llvm_lifetime_start, "_abort": _abort, "_uselocale": _uselocale, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "__exit": __exit, "_strftime": _strftime, "___cxa_end_catch": ___cxa_end_catch, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "___fsmu8": ___fsmu8, "_stdout": _stdout, "___dso_handle": ___dso_handle }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _checkResult = Module["_checkResult"] = asm["_checkResult"];
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
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
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
      throw e;
    }
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
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
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
var buffer = 0, bufferSize = 0;
var inWorkerCall = false, workerResponded = false, workerCallbackId = -1;
onmessage = function(msg) {
  var func = Module['_' + msg.data['funcName']];
  if (!func) throw 'invalid worker function to call: ' + msg.data['funcName'];
  var data = msg.data['data'];
  if (data) {
    if (!data.byteLength) data = new Uint8Array(data);
    if (!buffer || bufferSize < data.length) {
      if (buffer) _free(buffer);
      bufferSize = data.length;
      buffer = _malloc(data.length);
    }
    HEAPU8.set(data, buffer);
  }
  inWorkerCall = true;
  workerResponded = false;
  workerCallbackId = msg.data['callbackId'];
  if (data) {
    func(buffer, data.length);
  } else {
    func(0, 0);
  }
  inWorkerCall = false;
}
// {{MODULE_ADDITIONS}}
