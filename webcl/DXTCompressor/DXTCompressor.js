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
STATICTOP = STATIC_BASE + 19616;
var _stdout;
var _stdin;
var _stderr;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });
var ___fsmu8;
var ___dso_handle;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTIi;
var __ZNSt13runtime_errorC1EPKc;
var __ZNSt13runtime_errorD1Ev;
var __ZNSt12length_errorD1Ev;
var __ZNSt12out_of_rangeD1Ev;
var __ZNSt3__16localeC1Ev;
var __ZNSt3__16localeC1ERKS0_;
var __ZNSt3__16localeD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,152,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,168,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIi=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,0,0,0,0,0,72,21,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,120,19,0,0,0,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,37,101,0,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,79,99,116,111,98,101,114,0,114,0,0,0,0,0,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,84,89,80,69,58,9,9,9,37,115,10,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,37,117,0,0,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,88,84,67,111,109,112,114,101,115,115,105,111,110,46,99,108,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,32,32,67,76,95,68,82,73,86,69,82,95,86,69,82,83,73,79,78,58,32,9,9,9,37,115,10,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,37,105,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,68,101,116,97,105,108,101,100,32,100,101,115,99,114,105,112,116,105,111,110,58,32,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,67,109,100,65,114,103,82,101,97,100,101,114,58,58,103,101,116,65,114,103,40,41,58,32,67,109,100,65,114,103,82,101,97,100,101,114,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,46,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,46,47,115,104,97,114,101,100,47,105,110,99,47,99,109,100,95,97,114,103,95,114,101,97,100,101,114,46,104,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,100,101,118,105,99,101,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,86,69,78,68,79,82,58,32,9,9,9,37,115,10,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,37,115,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,46,47,115,104,97,114,101,100,47,115,114,99,47,99,109,100,95,97,114,103,95,114,101,97,100,101,114,46,99,112,112,0,76,111,97,100,101,100,32,39,37,115,39,44,32,37,100,32,120,32,37,100,32,112,105,120,101,108,115,10,0,0,0,0,10,37,115,10,66,117,105,108,100,32,76,111,103,58,10,37,115,10,37,115,10,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,78,65,77,69,58,32,9,9,9,37,115,10,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,10,37,115,10,80,114,111,103,114,97,109,32,66,105,110,97,114,121,58,10,37,115,10,37,115,10,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,119,98,0,0,0,0,0,0,10,32,33,33,33,32,69,114,114,111,114,32,35,32,37,105,32,97,116,32,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,10,87,114,105,116,105,110,103,32,112,116,120,32,116,111,32,115,101,112,97,114,97,116,101,32,102,105,108,101,58,32,37,115,32,46,46,46,10,10,0,39,32,105,110,32,108,105,110,101,32,0,0,0,0,0,0,114,98,0,0,0,0,0,0,80,77,0,0,0,0,0,0,67,72,65,82,32,37,117,44,32,83,72,79,82,84,32,37,117,44,32,73,78,84,32,37,117,44,32,70,76,79,65,84,32,37,117,44,32,68,79,85,66,76,69,32,37,117,10,10,10,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,80,82,69,70,69,82,82,69,68,95,86,69,67,84,79,82,95,87,73,68,84,72,95,60,116,62,9,0,69,114,114,111,114,32,119,104,101,110,32,112,97,114,115,105,110,103,32,99,111,109,109,97,110,100,32,108,105,110,101,32,97,114,103,117,109,101,110,116,32,115,116,114,105,110,103,46,0,0,0,0,0,0,0,0,32,32,67,76,95,78,86,95,68,69,86,73,67,69,95,73,78,84,69,71,82,65,84,69,68,95,77,69,77,79,82,89,58,9,37,115,10,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,32,32,67,76,95,78,86,95,68,69,86,73,67,69,95,75,69,82,78,69,76,95,69,88,69,67,95,84,73,77,69,79,85,84,58,9,37,115,10,0,68,88,84,67,111,109,112,114,101,115,115,111,114,46,99,112,112,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,67,76,95,70,65,76,83,69,0,0,0,0,0,0,0,0,67,76,95,84,82,85,69,0,32,32,67,76,95,78,86,95,68,69,86,73,67,69,95,71,80,85,95,79,86,69,82,76,65,80,58,9,9,37,115,10,0,0,0,0,0,0,0,0,32,32,67,76,95,78,86,95,68,69,86,73,67,69,95,87,65,82,80,95,83,73,90,69,58,9,9,37,117,10,0,0,83,100,107,77,97,115,116,101,114,76,111,103,79,112,101,110,67,76,46,99,115,118,0,0,32,32,67,76,95,78,86,95,68,69,86,73,67,69,95,82,69,71,73,83,84,69,82,83,95,80,69,82,95,66,76,79,67,75,58,9,37,117,10,0,69,120,99,101,112,116,105,111,110,32,105,110,32,102,105,108,101,32,39,0,0,0,0,0,108,111,97,100,80,80,77,40,41,32,58,32,73,110,118,97,108,105,100,32,105,109,97,103,101,46,0,0,0,0,0,0,10,32,32,67,76,95,78,86,95,68,69,86,73,67,69,95,67,79,77,80,85,84,69,95,67,65,80,65,66,73,76,73,84,89,58,9,37,117,46,37,117,10,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,108,111,97,100,80,80,77,40,41,32,58,32,73,110,118,97,108,105,100,32,105,109,97,103,101,32,100,105,109,101,110,115,105,111,110,115,46,0,0,0,9,9,9,37,115,10,0,0,37,117,32,37,117,0,0,0,9,9,0,0,0,0,0,0,37,117,32,37,117,32,37,117,0,0,0,0,0,0,0,0,99,108,95,110,118,95,100,101,118,105,99,101,95,97,116,116,114,105,98,117,116,101,95,113,117,101,114,121,0,0,0,0,108,111,97,100,80,80,77,40,41,32,58,32,70,105,108,101,32,105,115,32,110,111,116,32,97,32,80,80,77,32,111,114,32,80,71,77,32,105,109,97,103,101,0,0,0,0,0,0,10,32,32,67,76,95,68,69,86,73,67,69,95,69,88,84,69,78,83,73,79,78,83,58,0,0,0,0,0,0,0,0,105,109,97,103,101,0,0,0,80,54,0,0,0,0,0,0,9,9,9,9,9,51,68,95,77,65,88,95,68,69,80,84,72,9,32,37,117,10,0,0,80,53,0,0,0,0,0,0,9,9,9,9,9,51,68,95,77,65,88,95,72,69,73,71,72,84,9,32,37,117,10,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,108,111,97,100,80,80,77,40,41,32,58,32,70,105,108,101,32,105,115,32,110,111,116,32,97,32,118,97,108,105,100,32,80,80,77,32,111,114,32,80,71,77,32,105,109,97,103,101,0,0,0,0,0,0,0,0,9,9,9,9,9,51,68,95,77,65,88,95,87,73,68,84,72,9,32,37,117,10,0,0,108,111,97,100,80,80,77,40,41,32,58,32,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,58,32,0,0,0,0,0,0,0,9,9,9,9,9,50,68,95,77,65,88,95,72,69,73,71,72,84,9,32,37,117,10,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,9,9,9,50,68,95,77,65,88,95,87,73,68,84,72,9,32,37,117,10,0,0,0,0,70,76,65,71,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,0,0,0,0,0,0,0,10,32,32,67,76,95,68,69,86,73,67,69,95,73,77,65,71,69,32,60,100,105,109,62,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,110,100,98,111,120,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,105,110,99,47,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,87,82,73,84,69,95,73,77,65,71,69,95,65,82,71,83,58,9,37,117,10,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,110,100,98,111,120,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,115,114,99,47,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,82,69,65,68,95,73,77,65,71,69,95,65,82,71,83,58,9,37,117,10,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,110,100,98,111,120,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,100,97,116,97,47,0,0,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,73,77,65,71,69,95,83,85,80,80,79,82,84,58,9,9,37,117,10,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,110,100,98,111,120,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,0,0,0,0,0,67,76,95,81,85,69,85,69,95,80,82,79,70,73,76,73,78,71,95,69,78,65,66,76,69,0,0,0,0,0,0,0,37,115,32,83,116,97,114,116,105,110,103,46,46,46,10,10,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,109,112,108,101,115,95,110,118,105,100,105,97,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,105,110,99,47,0,0,67,76,95,81,85,69,85,69,95,79,85,84,95,79,70,95,79,82,68,69,82,95,69,88,69,67,95,77,79,68,69,95,69,78,65,66,76,69,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,109,112,108,101,115,95,110,118,105,100,105,97,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,115,114,99,47,0,0,32,32,67,76,95,68,69,86,73,67,69,95,81,85,69,85,69,95,80,82,79,80,69,82,84,73,69,83,58,9,9,37,115,10,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,97,109,112,108,101,115,95,110,118,105,100,105,97,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,100,97,116,97,47,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,67,79,78,83,84,65,78,84,95,66,85,70,70,69,82,95,83,73,90,69,58,9,37,117,32,75,66,121,116,101,10,0,46,46,47,46,46,47,46,46,47,115,97,109,112,108,101,115,95,110,118,105,100,105,97,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,69,120,105,116,105,110,103,46,46,46,10,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,76,79,67,65,76,95,77,69,77,95,83,73,90,69,58,9,9,37,117,32,75,66,121,116,101,10,0,0,46,46,47,46,46,47,46,46,47,115,114,99,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,105,110,99,47,0,0,0,0,0,102,97,108,115,101,0,0,0,97,43,0,0,0,0,0,0,108,105,110,101,32,37,105,32,44,32,105,110,32,102,105,108,101,32,37,115,32,33,33,33,10,10,0,0,0,0,0,0,103,108,111,98,97,108,0,0,46,46,47,46,46,47,46,46,47,115,114,99,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,115,114,99,47,0,0,0,0,0,73,110,118,97,108,105,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,97,114,103,117,109,101,110,116,46,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,37,115,32,69,120,105,116,105,110,103,46,46,46,10,0,0,108,111,99,97,108,0,0,0,46,46,47,46,46,47,46,46,47,115,114,99,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,100,97,116,97,47,0,0,0,0,116,114,117,101,0,0,0,0,10,80,114,101,115,115,32,60,69,110,116,101,114,62,32,116,111,32,81,117,105,116,46,46,46,10,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,76,79,67,65,76,95,77,69,77,95,84,89,80,69,58,9,9,37,115,10,0,0,0,0,0,0,0,0,46,46,47,46,46,47,46,46,47,115,114,99,47,60,101,120,101,99,117,116,97,98,108,101,95,110,97,109,101,62,47,0,110,111,112,114,111,109,112,116,0,0,0,0,0,0,0,0,110,111,0,0,0,0,0,0,46,46,47,46,46,47,105,110,99,47,0,0,0,0,0,0,58,32,0,0,0,0,0,0,70,65,73,76,69,68,32,33,33,33,0,0,0,0,0,0,121,101,115,0,0,0,0,0,46,46,47,46,46,47,115,114,99,47,0,0,0,0,0,0,80,65,83,83,69,68,0,0,32,32,67,76,95,68,69,86,73,67,69,95,69,82,82,79,82,95,67,79,82,82,69,67,84,73,79,78,95,83,85,80,80,79,82,84,58,9,37,115,10,0,0,0,0,0,0,0,46,46,47,46,46,47,100,97,116,97,47,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,111,99,108,68,88,84,67,111,109,112,114,101,115,115,105,111,110,46,116,120,116,0,0,0,84,69,83,84,32,37,115,10,10,0,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,71,76,79,66,65,76,95,77,69,77,95,83,73,90,69,58,9,9,37,117,32,77,66,121,116,101,10,0,46,46,47,46,46,47,0,0,37,112,0,0,0,0,0,0,82,77,83,40,114,101,102,101,114,101,110,99,101,44,32,114,101,115,117,108,116,41,32,61,32,37,102,10,10,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,77,69,77,95,65,76,76,79,67,95,83,73,90,69,58,9,9,37,117,32,77,66,121,116,101,10,0,0,0,0,0,0,46,46,47,105,110,99,47,0,68,101,118,105,97,116,105,111,110,32,97,116,32,40,37,100,44,32,37,100,41,58,9,37,102,32,114,109,115,10,0,0,32,32,67,76,95,68,69,86,73,67,69,95,65,68,68,82,69,83,83,95,66,73,84,83,58,9,9,37,117,10,0,0,46,46,47,115,114,99,47,0,114,98,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,67,76,79,67,75,95,70,82,69,81,85,69,78,67,89,58,9,37,117,32,77,72,122,10,0,0,0,0,0,0,0,0,46,46,47,100,97,116,97,47,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,10,67,111,109,112,97,114,105,110,103,32,97,103,97,105,110,115,116,32,72,111,115,116,47,67,43,43,32,99,111,109,112,117,116,97,116,105,111,110,46,46,46,10,0,0,0,0,0,83,100,107,76,111,103,102,105,108,101,79,112,101,110,67,76,46,116,120,116,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,87,79,82,75,95,71,82,79,85,80,95,83,73,90,69,58,9,37,117,10,0,0,0,0,46,46,47,0,0,0,0,0,78,111,32,99,111,109,109,97,110,100,32,108,105,110,101,32,97,114,103,117,109,101,110,116,115,32,103,105,118,101,110,46,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,119,98,0,0,0,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,87,79,82,75,95,73,84,69,77,95,83,73,90,69,83,58,9,37,117,32,47,32,37,117,32,47,32,37,117,32,10,0,46,47,105,110,99,47,0,0,37,46,48,76,102,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,87,79,82,75,95,73,84,69,77,95,68,73,77,69,78,83,73,79,78,83,58,9,37,117,10,0,0,0,0,0,0,0,46,47,115,114,99,47,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,82,117,110,110,105,110,103,32,68,88,84,32,67,111,109,112,114,101,115,115,105,111,110,32,111,110,32,37,117,32,120,32,37,117,32,105,109,97,103,101,46,46,46,10,10,0,0,0,32,32,67,76,95,68,69,86,73,67,69,95,77,65,88,95,67,79,77,80,85,84,69,95,85,78,73,84,83,58,9,9,37,117,10,0,0,0,0,0,46,47,100,97,116,97,47,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,108,101,110,97,46,112,112,109,0,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,99,111,109,112,114,101,115,115,0,0,0,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,68,69,70,65,85,76,84,0,0,77,111,110,0,0,0,0,0,46,47,0,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,111,99,108,68,88,84,67,111,109,112,114,101,115,115,105,111,110,46,112,116,120,0,0,0,83,117,110,100,97,121,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,65,67,67,69,76,69,82,65,84,79,82,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,108,101,110,97,95,114,101,102,46,100,100,115,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,102,105,108,101,32,37,115,44,32,108,105,110,101,32,37,105,10,10,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,71,80,85,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,37,102,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,45,99,108,45,109,97,100,45,101,110,97,98,108,101,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,67,80,85,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,37,46,51,102,0,0,0,0,232,19,0,0,96,19,0,0,240,18,0,0,176,18,0,0,64,18,0,0,184,17,0,0,120,17,0,0,48,17,0,0,208,16,0,0,96,16,0,0,24,16,0,0,232,15,0,0,176,15,0,0,56,15,0,0,192,14,0,0,96,14,0,0,224,13,0,0,128,13,0,0,40,13,0,0,192,12,0,0,56,12,0,0,216,11,0,0,96,11,0,0,232,10,0,0,0,0,0,0,0,52,0,0,40,0,0,0,144,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,52,0,0,244,0,0,0,202,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,52,0,0,92,0,0,0,68,1,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,52,0,0,118,0,0,0,34,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,52,0,0,118,0,0,0,10,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,52,0,0,118,0,0,0,26,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,52,0,0,208,0,0,0,106,0,0,0,62,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,52,0,0,32,1,0,0,232,0,0,0,62,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,52,0,0,200,0,0,0,234,0,0,0,62,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,52,0,0,60,1,0,0,170,0,0,0,62,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,53,0,0,56,1,0,0,22,0,0,0,62,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,53,0,0,198,0,0,0,134,0,0,0,62,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,53,0,0,48,0,0,0,136,0,0,0,62,0,0,0,126,0,0,0,4,0,0,0,32,0,0,0,6,0,0,0,20,0,0,0,56,0,0,0,2,0,0,0,248,255,255,255,168,53,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,53,0,0,44,1,0,0,26,1,0,0,62,0,0,0,20,0,0,0,16,0,0,0,60,0,0,0,26,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,208,53,0,0,74,0,0,0,110,0,0,0,122,0,0,0,128,0,0,0,68,0,0,0,46,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,53,0,0,98,0,0,0,236,0,0,0,62,0,0,0,52,0,0,0,42,0,0,0,8,0,0,0,42,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,54,0,0,76,0,0,0,86,0,0,0,62,0,0,0,44,0,0,0,88,0,0,0,12,0,0,0,58,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,54,0,0,50,1,0,0,2,0,0,0,62,0,0,0,24,0,0,0,34,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,54,0,0,56,0,0,0,8,1,0,0,62,0,0,0,42,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,54,0,0,14,1,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,54,0,0,158,0,0,0,168,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,54,0,0,8,0,0,0,214,0,0,0,62,0,0,0,28,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,54,0,0,122,0,0,0,24,0,0,0,62,0,0,0,20,0,0,0,24,0,0,0,34,0,0,0,22,0,0,0,22,0,0,0,8,0,0,0,6,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,54,0,0,50,0,0,0,30,0,0,0,62,0,0,0,48,0,0,0,46,0,0,0,38,0,0,0,40,0,0,0,30,0,0,0,44,0,0,0,36,0,0,0,54,0,0,0,52,0,0,0,50,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,54,0,0,68,0,0,0,4,0,0,0,62,0,0,0,28,0,0,0,70,0,0,0,64,0,0,0,66,0,0,0,58,0,0,0,68,0,0,0,62,0,0,0,76,0,0,0,74,0,0,0,72,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,54,0,0,94,0,0,0,116,0,0,0,62,0,0,0,14,0,0,0,16,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,55,0,0,36,0,0,0,218,0,0,0,62,0,0,0,22,0,0,0,18,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,55,0,0,30,1,0,0,160,0,0,0,62,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,66,0,0,0,4,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,55,0,0,222,0,0,0,78,0,0,0,62,0,0,0,2,0,0,0,8,0,0,0,12,0,0,0,112,0,0,0,102,0,0,0,18,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,55,0,0,222,0,0,0,162,0,0,0,62,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,132,0,0,0,48,0,0,0,10,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,55,0,0,222,0,0,0,184,0,0,0,62,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,78,0,0,0,6,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,55,0,0,222,0,0,0,44,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,55,0,0,72,0,0,0,190,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,55,0,0,222,0,0,0,102,0,0,0,62,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,14,0,0,0,30,0,0,0,24,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,55,0,0,66,1,0,0,46,0,0,0,62,0,0,0,2,0,0,0,20,0,0,0,20,0,0,0,40,0,0,0,8,0,0,0,6,0,0,0,26,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,8,56,0,0,6,1,0,0,138,0,0,0,196,255,255,255,196,255,255,255,8,56,0,0,188,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,56,0,0,88,0,0,0,22,1,0,0,82,0,0,0,2,0,0,0,36,0,0,0,34,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,40,56,0,0,252,0,0,0,62,1,0,0,56,0,0,0,248,255,255,255,40,56,0,0,60,0,0,0,74,0,0,0,192,255,255,255,192,255,255,255,40,56,0,0,250,0,0,0,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,56,0,0,222,0,0,0,108,0,0,0,62,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,78,0,0,0,6,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,56,0,0,222,0,0,0,204,0,0,0,62,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,78,0,0,0,6,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,56,0,0,64,0,0,0,12,1,0,0,62,0,0,0,44,0,0,0,26,0,0,0,2,0,0,0,54,0,0,0,90,0,0,0,16,0,0,0,38,0,0,0,10,0,0,0,26,0,0,0,14,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,56,0,0,154,0,0,0,36,1,0,0,76,0,0,0,22,0,0,0,14,0,0,0,12,0,0,0,92,0,0,0,106,0,0,0,38,0,0,0,28,0,0,0,26,0,0,0,36,0,0,0,2,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,56,0,0,14,0,0,0,146,0,0,0,62,0,0,0,44,0,0,0,32,0,0,0,8,0,0,0,54,0,0,0,90,0,0,0,16,0,0,0,6,0,0,0,10,0,0,0,32,0,0,0,14,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,56,0,0,124,0,0,0,242,0,0,0,2,0,0,0,2,0,0,0,36,0,0,0,34,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,192,56,0,0,54,0,0,0,4,1,0,0,252,255,255,255,252,255,255,255,192,56,0,0,178,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,216,56,0,0,16,1,0,0,38,1,0,0,252,255,255,255,252,255,255,255,216,56,0,0,132,0,0,0,248,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,240,56,0,0,112,0,0,0,70,1,0,0,248,255,255,255,248,255,255,255,240,56,0,0,224,0,0,0,34,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,8,57,0,0,130,0,0,0,2,1,0,0,248,255,255,255,248,255,255,255,8,57,0,0,166,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,112,0,0,0,0,0,0,0,32,57,0,0,32,0,0,0,230,0,0,0,104,0,0,0,248,255,255,255,32,57,0,0,48,1,0,0,216,0,0,0,144,255,255,255,144,255,255,255,32,57,0,0,100,0,0,0,210,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,57,0,0,10,1,0,0,82,0,0,0,44,0,0,0,28,0,0,0,18,0,0,0,14,0,0,0,50,0,0,0,90,0,0,0,16,0,0,0,96,0,0,0,10,0,0,0,18,0,0,0,14,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,57,0,0,0,1,0,0,226,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,57,0,0,52,1,0,0,58,0,0,0,16,0,0,0,22,0,0,0,14,0,0,0,12,0,0,0,62,0,0,0,106,0,0,0,38,0,0,0,28,0,0,0,26,0,0,0,36,0,0,0,2,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,57,0,0,186,0,0,0,220,0,0,0,36,0,0,0,44,0,0,0,32,0,0,0,8,0,0,0,94,0,0,0,90,0,0,0,16,0,0,0,6,0,0,0,10,0,0,0,32,0,0,0,14,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,57,0,0,84,0,0,0,176,0,0,0,62,0,0,0,72,0,0,0,124,0,0,0,38,0,0,0,82,0,0,0,4,0,0,0,32,0,0,0,56,0,0,0,24,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,57,0,0,128,0,0,0,70,0,0,0,62,0,0,0,118,0,0,0,4,0,0,0,68,0,0,0,20,0,0,0,78,0,0,0,26,0,0,0,120,0,0,0,54,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,0,0,28,1,0,0,142,0,0,0,62,0,0,0,14,0,0,0,64,0,0,0,50,0,0,0,46,0,0,0,80,0,0,0,56,0,0,0,98,0,0,0,60,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,58,0,0,96,0,0,0,212,0,0,0,62,0,0,0,108,0,0,0,114,0,0,0,30,0,0,0,74,0,0,0,28,0,0,0,22,0,0,0,84,0,0,0,72,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,58,0,0,114,0,0,0,20,0,0,0,6,0,0,0,22,0,0,0,14,0,0,0,12,0,0,0,92,0,0,0,106,0,0,0,38,0,0,0,76,0,0,0,86,0,0,0,10,0,0,0,2,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,58,0,0,18,0,0,0,18,1,0,0,66,0,0,0,44,0,0,0,32,0,0,0,8,0,0,0,54,0,0,0,90,0,0,0,16,0,0,0,60,0,0,0,24,0,0,0,4,0,0,0,14,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,58,0,0,54,1,0,0,110,0,0,0,80,0,0,0,182,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,58,0,0,54,1,0,0,246,0,0,0,80,0,0,0,182,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,58,0,0,192,0,0,0,12,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,58,0,0,194,0,0,0,38,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,31,0,0,244,58,0,0,8,59,0,0,104,31,0,0,180,31,0,0,68,59,0,0,132,59,0,0,152,59,0,0,28,59,0,0,48,59,0,0,108,59,0,0,88,59,0,0,220,31,0,0,200,31,0,0,52,34,0,0,212,59,0,0,20,60,0,0,40,60,0,0,172,59,0,0,192,59,0,0,252,59,0,0,232,59,0,0,92,34,0,0,72,34,0,0,105,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,111,117,116,95,111,102,95,114,97,110,103,101,0,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111].concat([115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,105,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,56,98,97,115,105,99,95,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,57,69,120,99,101,112,116,105,111,110,73,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,69,0,0,0,57,69,120,99,101,112,116,105,111,110,73,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,69,0,0,0,0,0,0,0,0,0,248,37,0,0,0,0,0,0,8,38,0,0,0,0,0,0,24,38,0,0,248,51,0,0,0,0,0,0,0,0,0,0,40,38,0,0,248,51,0,0,0,0,0,0,0,0,0,0,56,38,0,0,248,51,0,0,0,0,0,0,0,0,0,0,80,38,0,0,80,52,0,0,0,0,0,0,0,0,0,0,104,38,0,0,80,52,0,0,0,0,0,0,0,0,0,0,128,38,0,0,248,51,0,0,0,0,0,0,0,0,0,0,144,38,0,0,40,37,0,0,168,38,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,160,57,0,0,0,0,0,0,40,37,0,0,240,38,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,168,57,0,0,0,0,0,0,40,37,0,0,56,39,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,176,57,0,0,0,0,0,0,40,37,0,0,128,39,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,184,57,0,0,0,0,0,0,0,0,0,0,200,39,0,0,88,54,0,0,0,0,0,0,0,0,0,0,248,39,0,0,88,54,0,0,0,0,0,0,40,37,0,0,40,40,0,0,0,0,0,0,1,0,0,0,168,56,0,0,0,0,0,0,40,37,0,0,64,40,0,0,0,0,0,0,1,0,0,0,168,56,0,0,0,0,0,0,40,37,0,0,88,40,0,0,0,0,0,0,1,0,0,0,176,56,0,0,0,0,0,0,40,37,0,0,112,40,0,0,0,0,0,0,1,0,0,0,176,56,0,0,0,0,0,0,40,37,0,0,136,40,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,58,0,0,0,8,0,0,40,37,0,0,208,40,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,58,0,0,0,8,0,0,40,37,0,0,24,41,0,0,0,0,0,0,3,0,0,0,144,55,0,0,2,0,0,0,96,52,0,0,2,0,0,0,248,55,0,0,0,8,0,0,40,37,0,0,96,41,0,0,0,0,0,0,3,0,0,0,144,55,0,0,2,0,0,0,96,52,0,0,2,0,0,0,0,56,0,0,0,8,0,0,0,0,0,0,168,41,0,0,144,55,0,0,0,0,0,0,0,0,0,0,192,41,0,0,144,55,0,0,0,0,0,0,40,37,0,0,216,41,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,184,56,0,0,2,0,0,0,40,37,0,0,240,41,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,184,56,0,0,2,0,0,0,0,0,0,0,8,42,0,0,0,0,0,0,32,42,0,0,64,57,0,0,0,0,0,0,40,37,0,0,64,42,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,8,53,0,0,0,0,0,0,40,37,0,0,136,42,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,32,53,0,0,0,0,0,0,40,37,0,0,208,42,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,56,53,0,0,0,0,0,0,40,37,0,0,24,43,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,53,0,0,0,0,0,0,0,0,0,0,96,43,0,0,144,55,0,0,0,0,0,0,0,0,0,0,120,43,0,0,144,55,0,0,0,0,0,0,40,37,0,0,144,43,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,57,0,0,2,0,0,0,40,37,0,0,184,43,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,57,0,0,2,0,0,0,40,37,0,0,224,43,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,57,0,0,2,0,0,0,40,37,0,0,8,44,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,80,57,0,0,2,0,0,0,0,0,0,0,48,44,0,0,160,56,0,0,0,0,0,0,0,0,0,0,72,44,0,0,144,55,0,0,0,0,0,0,40,37,0,0,96,44,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,72,58,0,0,2,0,0,0,40,37,0,0,120,44,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,72,58,0,0,2,0,0,0,0,0,0,0,144,44,0,0,0,0,0,0,184,44,0,0,0,0,0,0,224,44,0,0,0,0,0,0,8,45,0,0,8,57,0,0,0,0,0,0,0,0,0,0,80,45,0,0,112,57,0,0,0,0,0,0,0,0,0,0,112,45,0,0,128,56,0,0,0,0,0,0,0,0,0,0,184,45,0,0,112,55,0,0,0,0,0,0,0,0,0,0,224,45,0,0,112,55,0,0,0,0,0,0,0,0,0,0,8,46,0,0,112,56,0,0,0,0,0,0,0,0,0,0,80,46,0,0,0,0,0,0,136,46,0,0,0,0,0,0,192,46,0,0,40,37,0,0,224,46,0,0,3,0,0,0,2,0,0,0,8,57,0,0,2,0,0,0,216,56,0,0,2,8,0,0,0,0,0,0,16,47,0,0,0,0,0,0,48,47,0,0,0,0,0,0,80,47,0,0,0,0,0,0,112,47,0,0,40,37,0,0,136,47,0,0,0,0,0,0,1,0,0,0,232,52,0,0,3,244,255,255,40,37,0,0,184,47,0,0,0,0,0,0,1,0,0,0,248,52,0,0,3,244,255,255,40,37,0,0,232,47,0,0,0,0,0,0,1,0,0,0,232,52,0,0,3,244,255,255,40,37,0,0,24,48,0,0,0,0,0,0,1,0,0,0,248,52,0,0,3,244,255,255,0,0,0,0,72,48,0,0,128,56,0,0,0,0,0,0,0,0,0,0,120,48,0,0,112,56,0,0,0,0,0,0,0,0,0,0,168,48,0,0,32,52,0,0,0,0,0,0,0,0,0,0,192,48,0,0,40,37,0,0,216,48,0,0,0,0,0,0,1,0,0,0,240,55,0,0,0,0,0,0,0,0,0,0,24,49,0,0,120,56,0,0,0,0,0,0,0,0,0,0,48,49,0,0,104,56,0,0,0,0,0,0,0,0,0,0,80,49,0,0,112,56,0,0,0,0,0,0,0,0,0,0,112,49,0,0,0,0,0,0,144,49,0,0,0,0,0,0,176,49,0,0,0,0,0,0,208,49,0,0,40,37,0,0,240,49,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,64,58,0,0,2,0,0,0,40,37,0,0,16,50,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,64,58,0,0,2,0,0,0,40,37,0,0,48,50,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,64,58,0,0,2,0,0,0,40,37,0,0,80,50,0,0,0,0,0,0,2,0,0,0,144,55,0,0,2,0,0,0,64,58,0,0,2,0,0,0,0,0,0,0,112,50,0,0,0,0,0,0,136,50,0,0,0,0,0,0,160,50,0,0,0,0,0,0,184,50,0,0,104,56,0,0,0,0,0,0,0,0,0,0,208,50,0,0,112,56,0,0,0,0,0,0,0,0,0,0,232,50,0,0,184,58,0,0,0,0,0,0,0,0,0,0,16,51,0,0,168,58,0,0,0,0,0,0,0,0,0,0,56,51,0,0,168,58,0,0,0,0,0,0,0,0,0,0,96,51,0,0,184,58,0,0,0,0,0,0,0,0,0,0,136,51,0,0,240,51,0,0,0,0,0,0,0,0,0,0,176,51,0,0,32,52,0,0,0,0,0,0,0,0,0,0,208,51,0,0,80,52,0,0,0,0,0,0,60,0,0,0,0,0,0,0,8,57,0,0,130,0,0,0,2,1,0,0,196,255,255,255,196,255,255,255,8,57,0,0,166,0,0,0,66,0,0,0,56,0,0,0,0,0,0,0,216,56,0,0,16,1,0,0,38,1,0,0,200,255,255,255,200,255,255,255,216,56,0,0,132,0,0,0,248,0,0,0,64,0,0,0,0,0,0,0,128,56,0,0,58,1,0,0,228,0,0,0,56,0,0,0,248,255,255,255,128,56,0,0,40,1,0,0,24,1,0,0,192,255,255,255,192,255,255,255,128,56,0,0,172,0,0,0,126,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,8,57,0,0,130,0,0,0,2,1,0,0,192,255,255,255,192,255,255,255,8,57,0,0,166,0,0,0,66,0,0,0,104,0,0,0,0,0,0,0,216,56,0,0,16,1,0,0,38,1,0,0,152,255,255,255,152,255,255,255,216,56,0,0,132,0,0,0,248,0,0,0,112,0,0,0,0,0,0,0,128,56,0,0,58,1,0,0,228,0,0,0,104,0,0,0,248,255,255,255,128,56,0,0,40,1,0,0,24,1,0,0,144,255,255,255,144,255,255,255,128,56,0,0,172,0,0,0,126,0,0,0,0,0,0,0,112,0,0,0,0,0,0,0,8,57,0,0,130,0,0,0,2,1,0,0,144,255,255,255,144,255,255,255,8,57,0,0,166,0,0,0,66,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0])
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
      }};var CL={address_space:{GENERAL:0,GLOBAL:1,LOCAL:2,CONSTANT:4,PRIVATE:8},data_type:{FLOAT:16,INT:32,UINT:64},device_infos:{},index_object:0,ctx:[],webcl_mozilla:0,webcl_webkit:0,ctx_clean:[],cmdQueue:[],cmdQueue_clean:[],programs:[],programs_clean:[],kernels:[],kernels_name:[],kernels_sig:{},kernels_clean:[],buffers:[],buffers_clean:[],platforms:[],devices:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",checkWebCL:function () {
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
        // Init Device info
        CL.device_infos = {
          0x1000:[WebCL.CL_DEVICE_TYPE,WebCL.DEVICE_TYPE],
          0x1001:[WebCL.CL_DEVICE_VENDOR_ID,WebCL.DEVICE_VENDOR_ID],
          0x1002:[WebCL.CL_DEVICE_MAX_COMPUTE_UNITS,WebCL.DEVICE_MAX_COMPUTE_UNITS],
          0x1003:[WebCL.CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS,WebCL.DEVICE_MAX_WORK_ITEM_DIMENSIONS],      
          0x1004:[WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE,WebCL.DEVICE_MAX_WORK_GROUP_SIZE],
          0x1016:[WebCL.CL_DEVICE_IMAGE_SUPPORT,WebCL.DEVICE_IMAGE_SUPPORT],
          0x1030:[WebCL.CL_DEVICE_EXTENSIONS,WebCL.DEVICE_EXTENSIONS],
          0x102B:[WebCL.CL_DEVICE_NAME,WebCL.DEVICE_NAME],
          0x101F:[WebCL.CL_DEVICE_GLOBAL_MEM_SIZE,WebCL.DEVICE_GLOBAL_MEM_SIZE],
          0x102C:[WebCL.CL_DEVICE_VENDOR,WebCL.DEVICE_VENDOR],
          0x102D:[WebCL.CL_DRIVER_VERSION,WebCL.DRIVER_VERSION],
          0x102E:[WebCL.CL_DEVICE_PROFILE,WebCL.DEVICE_PROFILE],
          0x102F:[WebCL.CL_DEVICE_VERSION,WebCL.DEVICE_VERSION]            
        };
        CL.webcl_webkit = isWebkit == true ? 1 : 0;
        CL.webcl_mozilla = isFirefox == true ? 1 : 0;
        CL.index_object = 2147483647;
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
              value |= CL.data_type.FLOAT;
            }
            parameter[i] = value;
          }
          kernel_struct[kernels_name] = parameter;
          kernel_start = kernelstring.indexOf("__kernel");
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
        var res = [];
        if (platform >= CL.platforms.length || platform < 0 ) {
            return res; 
        }
        if (CL.webcl_mozilla == 1) {
          res = CL.platforms[platform].getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL);
        } else {
          //res = CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_ALL);
          res = res.concat(CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_GPU));
          res = res.concat(CL.platforms[platform].getDevices(WebCL.DEVICE_TYPE_CPU));  
        }    
        return res;
      },catchError:function (name,e) {
        var str=""+e;
        var n=str.lastIndexOf(" ");
        var error = str.substr(n+1,str.length-n-2);
        return error;
      }};function _clGetDeviceInfo(device, param_name, param_value_size, param_value, param_value_size_ret) {
      var idx = CL.getArrayId(device);
      if (idx >= CL.devices.length || idx < 0 ) {
        return -33; /* CL_INVALID_DEVICE */  
      }    
      var res;
      var size = 0;
      var info = CL.device_infos[param_name];
      if (info != undefined) {
        // Return string
        if (
          (param_name == 0x1030) || /* CL_DEVICE_EXTENSIONS */
          (param_name == 0x102B) || /* CL_DEVICE_NAME       */
          (param_name == 0x102C) || /* CL_DEVICE_VENDOR     */
          (param_name == 0x102D) || /* CL_DRIVER_VERSION    */
          (param_name == 0x102F) || /* CL_DEVICE_VERSION    */
          (param_name == 0x102E)    /* CL_DEVICE_PROFILE    */
        ) {
          try {
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(info[0]) : CL.devices[idx].getInfo(info[1]);
          } catch (e) {
            CL.catchError("clGetDeviceInfo",e);
            res = "Not Visible";
          }    
          writeStringToMemory(res, param_value);
          size = res.length;
        } 
        // Return int
        else {
          try {
            res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(info[0]) : CL.devices[idx].getInfo(info[1]);
            HEAP32[((param_value)>>2)]=res;
          } catch (e) {
            CL.catchError("clGetDeviceInfo",e);
            HEAP32[((param_value)>>2)]=0;
          }   
          size = 1;
        }
      } else {
        HEAP32[((param_value)>>2)]=0;
        size = 1;
      }
      HEAP32[((param_value_size_ret)>>2)]=size;
      return 0;/*CL_SUCCESS*/  
    }
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
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
  function _clGetContextInfo(context, param_name, param_value_size, param_value, param_value_size_ret) {
      var ctx = CL.getArrayId(context);
      if (ctx >= CL.ctx.length || ctx < 0 ) {
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
                HEAP32[(((param_value)+(i*4))>>2)]=CL.getNewId(CL.devices.length);
                CL.devices.push(res[i]);
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
            return -30; /* CL_INVALID_VALUE */ 
        };
        if (param_value_size < size && param_value != 0) {
          return -30; /* CL_INVALID_VALUE */              
        }
        HEAP32[((param_value_size_ret)>>2)]=size;
        return 0;/*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetContextInfo",e);
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
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
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
  function _clGetProgramInfo(program, param_name, param_value_size, param_value, param_value_size_ret) {
      var prog = CL.getArrayId(program);
      if (prog >= CL.programs.length || prog < 0 ) {
        return -44; /* CL_INVALID_PROGRAM */
      }           
      try {
        switch (param_name) {
          case 0x1160 /*CL_PROGRAM_REFERENCE_COUNT*/:
            var res = CL.programs[prog].getProgramInfo (WebCL.CL_PROGRAM_REFERENCE_COUNT); // return cl_uint
            HEAP32[((param_value)>>2)]=res;
            HEAP32[((param_value_size_ret)>>2)]=1;
            break;
          case 0x1162 /*CL_PROGRAM_NUM_DEVICES*/:
            var res = CL.programs[prog].getProgramInfo (WebCL.CL_PROGRAM_NUM_DEVICES);
            HEAP32[((param_value)>>2)]=res;
            HEAP32[((param_value_size_ret)>>2)]=1;
            break;    
          case 0x1164 /*CL_PROGRAM_SOURCE*/:
            res = CL.programs[prog].getProgramInfo (WebCL.CL_PROGRAM_SOURCE);
            HEAP32[((param_value_size_ret)>>2)]=res.length;
            writeStringToMemory(res,param_value);
            break;
          // case 0x1165 /*CL_PROGRAM_BINARY_SIZES*/:
          //   res = CL.programs[prog].getProgramInfo (WebCL.CL_PROGRAM_BINARY_SIZES);
          //   break;
          case 0x1163 /*CL_PROGRAM_DEVICES*/:
            res = CL.programs[prog].getProgramInfo (WebCL.CL_PROGRAM_DEVICES);
            HEAP32[((param_value_size_ret)>>2)]=res.length;
            for (var i = 0; i <res.length; i++) {
              CL.devices.push(res[i]);
              HEAP32[(((param_value)+(i*4))>>2)]=CL.getNewId(CL.devices.length-1);
            }
            break;
          default:
            return -30; /* CL_INVALID_VALUE */ 
        };
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clGetProgramInfo",e);
      }
    }
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
  function _clGetProgramBuildInfo(program, device, param_name, param_value_size, param_value, param_value_size_ret) {
      var prog = CL.getArrayId(program);
      if (prog >= CL.programs.length || prog < 0 ) {
        return -44; /* CL_INVALID_PROGRAM */
      }          
      // \todo the type is a number but why i except have a Array ??? Will must be an array ???
      // var idx = HEAP32[((device)>>2)] - 1;
      var idx = CL.getArrayId(device);
      if (idx >= CL.devices.length || idx < 0 ) {
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
  function _clReleaseMemObject(memobj) { 
      var buff = CL.getArrayId(memobj);  
      if (buff >= (CL.buffers.length + CL.buffers_clean.length) || buff < 0 ) {
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      var offset = 0;
      for (var i = 0; i < CL.buffers_clean.length; i++) {
        if (CL.buffers_clean[i] < buff) {
          offset++;
        }
      }
      CL.buffers.splice(buff - offset, 1);
      CL.buffers_clean.push(buff);
      if (CL.buffers.length == 0) {
        CL.buffers_clean = [];
      }
      return 0;/*CL_SUCCESS*/
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  Module["_memcmp"] = _memcmp;
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
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
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
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
  var _llvm_memset_p0i8_i64=_memset;
  Module["_strcpy"] = _strcpy;
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
  var _llvm_va_start=undefined;
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }var _putc=_fputc;
  function _llvm_va_end() {}
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
    }function _fgets(s, n, stream) {
      // char *fgets(char *restrict s, int n, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgets.html
      if (!FS.streams[stream]) return 0;
      var streamObj = FS.streams[stream];
      if (streamObj.error || streamObj.eof) return 0;
      var byte_;
      for (var i = 0; i < n - 1 && byte_ != 10; i++) {
        byte_ = _fgetc(stream);
        if (byte_ == -1) {
          if (streamObj.error || (streamObj.eof && i == 0)) return 0;
          else if (streamObj.eof) break;
        }
        HEAP8[(((s)+(i))|0)]=byte_
      }
      HEAP8[(((s)+(i))|0)]=0
      return s;
    }
  function _ferror(stream) {
      // int ferror(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ferror.html
      return Number(FS.streams[stream] && FS.streams[stream].error);
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
  function _llvm_eh_typeid_for(type) {
      return type;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  var _fseeko=_fseek;
  var _ftello=_ftell;
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function _clCreateContextFromType(properties, device_type_i64_1, device_type_i64_2, pfn_notify, private_info, cb, user_data, user_data, errcode_ret) {
      if (CL.platforms.length == 0) {
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
                readprop = CL.getArrayId(HEAP32[(((properties)+(i*4))>>2)]);
                if (readprop >= CL.platforms.length || readprop < 0 ) {
                  HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
                  return 0; // Null pointer    
                } else {
                  plat = readprop;
                  prop.push(CL.platforms[readprop]);
                }             
              break;
              default:
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
        return CL.getNewId(CL.ctx.length-1);
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContextFromType",e);
        return 0; // Null pointer    
      }
    }
  function _clCreateCommandQueue(context, devices, properties, errcode_ret) {
      var ctx = CL.getArrayId(context);
      if (ctx >= CL.ctx.length || ctx < 0 ) {
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
        HEAP32[((errcode_ret)>>2)]=-34 /* CL_INVALID_CONTEXT */;
        return 0; // Null pointer    
      }
      try {
        var macro;
        switch (flags_i64_1) {
          case (1 << 0) /* CL_MEM_READ_WRITE */:
            macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_WRITE : WebCL.MEM_READ_WRITE;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 1) /* CL_MEM_WRITE_ONLY */:
            macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_WRITE_ONLY : WebCL.MEM_WRITE_ONLY;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (1 << 2) /* CL_MEM_READ_ONLY */:
            macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_ONLY : WebCL.MEM_READ_ONLY;
            CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));
            break;
          case (((1 << 0)|(1 << 5))) /* CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR */:
            macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_WRITE : WebCL.MEM_READ_WRITE;
          case (((1 << 1)|(1 << 5))) /* CL_MEM_WRITE_ONLY | CL_MEM_COPY_HOST_PTR */:
            macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_WRITE_ONLY : WebCL.MEM_WRITE_ONLY;
          case (((1 << 2)|(1 << 5))) /* CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR */:
            macro = (CL.webcl_mozilla == 1) ? WebCL.CL_MEM_READ_ONLY : WebCL.MEM_READ_ONLY;
            if (host_ptr == 0) {
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
              var name = CL.kernels_name[0];
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
                }
              }
            }
            for (var i = 0; i < (size / 4); i++) {
              if (isFloat) {
                vector[i] = HEAPF32[(((host_ptr)+(i*4))>>2)];
              } else {
                vector[i] = HEAP32[(((host_ptr)+(i*4))>>2)];
              }
            }
            if (CL.webcl_webkit == -1) {
                CL.buffers.push(CL.ctx[ctx].createBuffer(macro | WebCL.MEM_COPY_HOST_PTR, size, vector));
            } else {
              CL.buffers.push(CL.ctx[ctx].createBuffer(macro,size));              
              if (CL.cmdQueue.length == 0) {
                HEAP32[((errcode_ret)>>2)]=-36 /* CL_INVALID_COMMAND_QUEUE */;
                return 0;
              }
              if (CL.buffers.length == 0) {
                HEAP32[((errcode_ret)>>2)]=-38 /* CL_INVALID_MEM_OBJECT */;
                return 0;
              }    
              CL.cmdQueue[CL.cmdQueue.length-1].enqueueWriteBuffer(CL.buffers[CL.buffers.length-1], 1, 0, size, vector , []);    
            }
            break;
          default:
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
  function _clCreateProgramWithSource(context, count, strings, lengths, errcode_ret) {
      var ctx = CL.getArrayId(context);
      if (ctx >= CL.ctx.length || ctx < 0 ) {
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
        return -44; /* CL_INVALID_PROGRAM */
      }
      try {
        if (num_devices > CL.devices.length || CL.devices.length == 0) {
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
  function _clCreateKernel(program, kernels_name, errcode_ret) {
      var prog = CL.getArrayId(program);
      if (prog >= CL.programs.length || prog < 0 ) {
        HEAP32[((errcode_ret)>>2)]=-44;
        return 0; // Null pointer   
      }           
      try {
        var name = Pointer_stringify(kernels_name);
        CL.kernels.push(CL.programs[prog].createKernel(name));
        // Add the name of the kernel for search the kernel sig after...
        CL.kernels_name.push(name);
        return CL.getNewId(CL.kernels.length-1);
      } catch (e) {
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateKernel",e);
        return 0; // Null pointer    
      }
    }
  function _clSetKernelArg(kernel, arg_index, arg_size, arg_value) {
      var ker = CL.getArrayId(kernel);
      if (ker >= CL.kernels.length || ker < 0 ) {
        return -48; /* CL_INVALID_KERNEL */
      }
      try {  
        var name = CL.kernels_name[ker];
        // \todo problem what is arg_value is buffer or just value ??? hard to say ....
        // \todo i suppose the arg_index correspond with the order of the buffer creation if is 
        // not inside the buffers array size we take the value
        if (CL.kernels_sig[name].length <= 0 && arg_index > CL.kernels_sig[name].length) {
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
            //CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V)
            ( CL.webcl_mozilla == 1 ) ? CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.FLOAT_V) : CL.kernels[ker].setArg(arg_index,value,WebCLKernelArgumentTypes.FLOAT | type);
          } else {          
            //CL.kernels[ker].setKernelArg(arg_index,value,WebCL.types.INT_V)
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
  function _clEnqueueWriteBuffer(command_queue, buffer, blocking_write, offset, size, ptr, num_events_in_wait_list, event_wait_list, event) {
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var buff = CL.getArrayId(buffer);
      if (buff >= CL.buffers.length || buff < 0 ) {
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      var vector;
      var isFloat = 0;
      var isUint = 0;
      var isInt = 0;
      if (CL.kernels_name.length > 0) {
        // \warning experimental stuff
        var name = CL.kernels_name[0];
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
      if ( isFloat == 0 && isUint == 0 && isInt == 0 ) {
        isFloat = CL.isFloat(ptr,size); 
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
        }
      }
      for (var i = 0; i < (size / 4); i++) {
        if (isFloat) {
          vector[i] = HEAPF32[(((ptr)+(i*4))>>2)];
        } else {
          vector[i] = HEAP32[(((ptr)+(i*4))>>2)];
        }
      }
      try {
        CL.cmdQueue[queue].enqueueWriteBuffer (CL.buffers[buff], blocking_write, offset, size, vector , []);
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueWriteBuffer",e);
      }
    }
  function _clEnqueueNDRangeKernel(command_queue, kernel, work_dim, global_work_offset, global_work_size, local_work_size, num_events_in_wait_list, event_wait_list, event) {
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var ker = CL.getArrayId(kernel);
      if (ker >= CL.kernels.length || ker < 0 ) {
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
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var buff = CL.getArrayId(buffer);
      if (buff >= CL.buffers.length || buff < 0 ) {
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      try {
        var vector;
        var isFloat = 0;
        var isUint = 0;
        var isInt = 0;
        if (CL.kernels_name.length > 0) {
          // \warning experimental stuff
          var name = CL.kernels_name[0];
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
        } else if (isUint) {
          vector = new Uint32Array(size / Uint32Array.BYTES_PER_ELEMENT);
        } else if (isInt) {
          vector = new Int32Array(size / Int32Array.BYTES_PER_ELEMENT);
        } else {
        }
        CL.cmdQueue[queue].enqueueReadBuffer (CL.buffers[buff], blocking_read == 1 ? true : false, offset, size, vector, []);
        for (var i = 0; i < (size / 4); i++) {
          if (isFloat) {
            HEAPF32[(((results)+(i*4))>>2)]=vector[i];  
          } else {
            HEAP32[(((results)+(i*4))>>2)]=vector[i];  
          }         
        }
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueReadBuffer",e);
      }
    }
  function _clReleaseKernel(kernel) {
      var ker = CL.getArrayId(kernel);  
      if (ker >= (CL.kernels.length +  CL.kernels_clean.length) || ker < 0 ) {
        return -48; /* CL_INVALID_KERNEL */
      }
      var offset = 0;
      for (var i = 0; i < CL.kernels_clean.length; i++) {
        if (CL.kernels_clean[i] < ker) {
          offset++;
        }
      }
      CL.kernels.splice(ker - offset, 1);
      CL.kernels_clean.push(ker);
      if (CL.kernels.length == 0) {
        CL.kernels_clean = [];
      }
      return 0;/*CL_SUCCESS*/
    }
  function _clReleaseProgram(program) {
      var prog = CL.getArrayId(program);  
      if (prog >= (CL.programs.length + CL.programs_clean.length)|| prog < 0 ) {
        return -44; /* CL_INVALID_PROGRAM */
      }           
      var offset = 0;
      for (var i = 0; i < CL.programs_clean.length; i++) {
        if (CL.programs_clean[i] < prog) {
          offset++;
        }
      }
      CL.programs.splice(prog - offset, 1);
      CL.programs_clean.push(prog);
      if (CL.programs.length == 0) {
        CL.programs_clean = [];
      }
      return 0;/*CL_SUCCESS*/
    }
  function _clReleaseCommandQueue(command_queue) {
      var queue = CL.getArrayId(command_queue);  
      if (queue >= (CL.cmdQueue.length + CL.cmdQueue_clean.length) || queue < 0 ) {
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var offset = 0;
      for (var i = 0; i < CL.cmdQueue_clean.length; i++) {
        if (CL.cmdQueue_clean[i] < queue) {
          offset++;
        }
      }
      CL.cmdQueue.splice(queue - offset, 1);
      CL.cmdQueue_clean.push(queue);
      if (CL.cmdQueue.length == 0) {
        CL.cmdQueue_clean = [];
      }
      return 0;/*CL_SUCCESS*/
    }
  function _clReleaseContext(context) {
      var ctx = CL.getArrayId(context);  
      if (ctx >= (CL.ctx.length + CL.ctx_clean.length) || ctx < 0 ) {
        return -34; /* CL_INVALID_CONTEXT */
      }        
      var offset = 0;
      for (var i = 0; i < CL.ctx_clean.length; i++) {
        if (CL.ctx_clean[i] < ctx) {
          offset++;
        }
      }
      CL.ctx.splice(ctx - offset, 1);
      CL.ctx_clean.push(ctx);
      if (CL.ctx.length == 0) {
        CL.ctx_clean = [];
      }
      return 0;/*CL_SUCCESS*/
    }
  var _getc=_fgetc;
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
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
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
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function _snprintf(s, n, format, varargs) {
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
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
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
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
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
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
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
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
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
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env._stdout|0;var t=env.__ZTIi|0;var u=env.___fsmu8|0;var v=env.___dso_handle|0;var w=+env.NaN;var x=+env.Infinity;var y=0;var z=0;var A=0;var B=0;var C=0,D=0,E=0,F=0,G=0.0,H=0,I=0,J=0,K=0.0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=0;var V=global.Math.floor;var W=global.Math.abs;var X=global.Math.sqrt;var Y=global.Math.pow;var Z=global.Math.cos;var _=global.Math.sin;var $=global.Math.tan;var aa=global.Math.acos;var ab=global.Math.asin;var ac=global.Math.atan;var ad=global.Math.atan2;var ae=global.Math.exp;var af=global.Math.log;var ag=global.Math.ceil;var ah=global.Math.imul;var ai=env.abort;var aj=env.assert;var ak=env.asmPrintInt;var al=env.asmPrintFloat;var am=env.min;var an=env.invoke_viiiii;var ao=env.invoke_viiiiiii;var ap=env.invoke_vi;var aq=env.invoke_vii;var ar=env.invoke_iii;var as=env.invoke_iiii;var at=env.invoke_ii;var au=env.invoke_viiiiif;var av=env.invoke_viii;var aw=env.invoke_viiiiiiii;var ax=env.invoke_v;var ay=env.invoke_iiiiiiiii;var az=env.invoke_viiiiiiiii;var aA=env.invoke_viiiiiif;var aB=env.invoke_viiiiii;var aC=env.invoke_iiiii;var aD=env.invoke_iiiiii;var aE=env.invoke_viiii;var aF=env._llvm_lifetime_end;var aG=env._lseek;var aH=env.__scanString;var aI=env._fclose;var aJ=env._pthread_mutex_lock;var aK=env.___cxa_end_catch;var aL=env.__isFloat;var aM=env._strtoull;var aN=env._fflush;var aO=env._fputc;var aP=env._fwrite;var aQ=env._send;var aR=env._fputs;var aS=env._isspace;var aT=env._clReleaseCommandQueue;var aU=env._read;var aV=env._clGetContextInfo;var aW=env._fsync;var aX=env.___cxa_guard_abort;var aY=env._newlocale;var aZ=env.___gxx_personality_v0;var a_=env._pthread_cond_wait;var a$=env.___cxa_rethrow;var a0=env.___resumeException;var a1=env._strcmp;var a2=env._memchr;var a3=env._strncmp;var a4=env._vsscanf;var a5=env._snprintf;var a6=env._fgetc;var a7=env.___errno_location;var a8=env._clReleaseContext;var a9=env._atexit;var ba=env.___cxa_free_exception;var bb=env._fgets;var bc=env._close;var bd=env.__Z8catcloseP8_nl_catd;var be=env._llvm_lifetime_start;var bf=env.___setErrNo;var bg=env._clCreateContextFromType;var bh=env._isxdigit;var bi=env._ftell;var bj=env._exit;var bk=env._sprintf;var bl=env._clCreateProgramWithSource;var bm=env.___ctype_b_loc;var bn=env._freelocale;var bo=env.__Z7catopenPKci;var bp=env.__isLeapYear;var bq=env._asprintf;var br=env._ferror;var bs=env.___cxa_is_number_type;var bt=env.___cxa_does_inherit;var bu=env.___cxa_guard_acquire;var bv=env.___locale_mb_cur_max;var bw=env.___cxa_begin_catch;var bx=env._recv;var by=env.__parseInt64;var bz=env._clEnqueueWriteBuffer;var bA=env.___cxa_call_unexpected;var bB=env.__exit;var bC=env._strftime;var bD=env._llvm_va_end;var bE=env.___cxa_throw;var bF=env._clReleaseKernel;var bG=env._llvm_eh_exception;var bH=env._printf;var bI=env._pread;var bJ=env._fopen;var bK=env._open;var bL=env.__arraySum;var bM=env._puts;var bN=env._clGetDeviceInfo;var bO=env._clEnqueueNDRangeKernel;var bP=env._clReleaseProgram;var bQ=env.___cxa_find_matching_catch;var bR=env._clSetKernelArg;var bS=env.__ZSt18uncaught_exceptionv;var bT=env.__formatString;var bU=env._pthread_cond_broadcast;var bV=env._clEnqueueReadBuffer;var bW=env.__ZSt9terminatev;var bX=env._pthread_mutex_unlock;var bY=env._sbrk;var bZ=env._clReleaseMemObject;var b_=env._strerror;var b$=env._clCreateBuffer;var b0=env._clGetProgramBuildInfo;var b1=env.___cxa_guard_release;var b2=env._ungetc;var b3=env._vsprintf;var b4=env._uselocale;var b5=env._vsnprintf;var b6=env._sscanf;var b7=env._sysconf;var b8=env._fread;var b9=env._abort;var ca=env._fprintf;var cb=env._isdigit;var cc=env._strtoll;var cd=env._clCreateCommandQueue;var ce=env._clBuildProgram;var cf=env.__reallyNegative;var cg=env.__Z7catgetsP8_nl_catdiiPKc;var ch=env._fseek;var ci=env.__addDays;var cj=env._write;var ck=env.___cxa_allocate_exception;var cl=env.___cxa_pure_virtual;var cm=env._clCreateKernel;var cn=env._vasprintf;var co=env._clGetProgramInfo;var cp=env.___ctype_toupper_loc;var cq=env.___ctype_tolower_loc;var cr=env._llvm_eh_typeid_for;var cs=env._pwrite;var ct=env._strerror_r;var cu=env._time;
// EMSCRIPTEN_START_FUNCS
function cN(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cO(){return i|0}function cP(a){a=a|0;i=a}function cQ(a,b){a=a|0;b=b|0;if((y|0)==0){y=a;z=b}}function cR(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function cS(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function cT(a){a=a|0;L=a}function cU(a){a=a|0;M=a}function cV(a){a=a|0;N=a}function cW(a){a=a|0;O=a}function cX(a){a=a|0;P=a}function cY(a){a=a|0;Q=a}function cZ(a){a=a|0;R=a}function c_(a){a=a|0;S=a}function c$(a){a=a|0;T=a}function c0(a){a=a|0;U=a}function c1(){c[q+8>>2]=310;c[q+12>>2]=156;c[q+16>>2]=80;c[q+20>>2]=182;c[q+24>>2]=8;c[q+28>>2]=8;c[q+32>>2]=2;c[q+36>>2]=4;c[p+8>>2]=310;c[p+12>>2]=302;c[p+16>>2]=80;c[p+20>>2]=182;c[p+24>>2]=8;c[p+28>>2]=30;c[p+32>>2]=4;c[p+36>>2]=10;c[t>>2]=9472;c[t+4>>2]=9712;c[3324]=p+8;c[3326]=p+8;c[3328]=q+8;c[3332]=q+8;c[3336]=q+8;c[3340]=q+8;c[3344]=q+8;c[3348]=q+8;c[3352]=p+8;c[3386]=q+8;c[3390]=q+8;c[3454]=q+8;c[3458]=q+8;c[3478]=p+8;c[3480]=q+8;c[3516]=q+8;c[3520]=q+8;c[3556]=q+8;c[3560]=q+8;c[3580]=p+8;c[3582]=p+8;c[3584]=p+8;c[3586]=q+8;c[3590]=q+8;c[3594]=q+8;c[3598]=q+8;c[3602]=q+8;c[3606]=q+8;c[3610]=p+8;c[3612]=p+8;c[3614]=p+8;c[3624]=p+8;c[3626]=p+8;c[3628]=p+8;c[3630]=p+8;c[3656]=q+8;c[3660]=q+8;c[3664]=q+8;c[3668]=p+8;c[3676]=q+8;c[3680]=q+8;c[3684]=q+8;c[3688]=p+8;c[3690]=p+8;c[3692]=p+8;c[3694]=p+8;c[3728]=p+8;c[3730]=p+8;c[3732]=p+8;c[3734]=q+8;c[3738]=q+8;c[3742]=q+8;c[3746]=q+8;c[3750]=q+8;c[3754]=q+8;c[3758]=q+8;c[3762]=q+8;c[3766]=q+8}function c2(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+8|0;d=b|0;aV(a|0,4225,0,0,d|0)|0;e=c[d>>2]|0;d=ms(e)|0;aV(a|0,4225,e|0,d|0,0)|0;e=c[d>>2]|0;mt(d);i=b;return e|0}function c3(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;b=i;i=i+40|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;h=b+32|0;aV(a|0,4225,0,0,d|0)|0;j=c[d>>2]|0;d=ms(j)|0;k=d;l=j>>>2;aV(a|0,4225,j|0,d|0,0)|0;a=c[k>>2]|0;bN(a|0,4098,4,e|0,0)|0;bN(c[k>>2]|0,4108,4,f|0,0)|0;if(j>>>0<=7){m=a;mt(d);i=b;return m|0}j=g;n=h;o=ah(c[f>>2]|0,c[e>>2]|0)|0;e=1;f=a;while(1){a=k+(e<<2)|0;bN(c[a>>2]|0,4098,4,j|0,0)|0;bN(c[a>>2]|0,4108,4,n|0,0)|0;p=ah(c[h>>2]|0,c[g>>2]|0)|0;if((p|0)>(o|0)){q=c[a>>2]|0;r=p}else{q=f;r=o}p=e+1|0;if(p>>>0<l>>>0){o=r;e=p;f=q}else{m=q;break}}mt(d);i=b;return m|0}function c4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=bJ(b|0,1520)|0;if((f|0)==0){g=0;return g|0}b=mI(d|0)|0;ch(f|0,0,2)|0;h=bi(f|0)|0;ch(f|0,0,0)|0;i=h+b|0;j=ms(i+1|0)|0;mJ(j|0,d|0,b)|0;d=(b8(j+b|0,h|0,1,f|0)|0)==1;aI(f|0)|0;if(!d){mt(j);g=0;return g|0}if((e|0)!=0){c[e>>2]=i}a[j+i|0]=0;g=j;return g|0}function c5(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+8|0;e=d|0;aV(a|0,4225,0,0,e|0)|0;f=c[e>>2]|0;if(f>>>2>>>0<b>>>0){g=-1;i=d;return g|0}e=ms(f)|0;aV(a|0,4225,f|0,e|0,0)|0;f=c[e+(b<<2)>>2]|0;mt(e);g=f;i=d;return g|0}function c6(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+8|0;f=e|0;co(a|0,4450,4,f|0,0)|0;g=c[f>>2]<<2;h=ms(g)|0;j=h;co(a|0,4451,g|0,h|0,0)|0;g=c[f>>2]<<2;k=ms(g)|0;l=k;co(a|0,4453,g|0,k|0,0)|0;g=c[f>>2]|0;m=ms(g<<2)|0;n=m;if((g|0)!=0){o=0;do{c[n+(o<<2)>>2]=ms(c[l+(o<<2)>>2]|0)|0;o=o+1|0;}while(o>>>0<g>>>0)}co(a|0,4454,0,m|0,0)|0;a=c[f>>2]|0;g=0;while(1){if(g>>>0>=a>>>0){break}if((c[j+(g<<2)>>2]|0)==(b|0)){p=30;break}else{g=g+1|0}}do{if((p|0)==30){if((d|0)==0){b=c[n+(g<<2)>>2]|0;dE(3,0,1328,(C=i,i=i+24|0,c[C>>2]=1208,c[C+8>>2]=b,c[C+16>>2]=1208,C)|0)|0;break}else{dE(3,0,1464,(C=i,i=i+8|0,c[C>>2]=d,C)|0)|0;b=bJ(d|0,1400)|0;j=c[n+(g<<2)>>2]|0;a=c[l+(g<<2)>>2]|0;aP(j|0,a|0,1,b|0)|0;aI(b|0)|0;break}}}while(0);mt(h);mt(k);if((c[f>>2]|0)==0){mt(m);i=e;return}else{q=0}do{mt(c[n+(q<<2)>>2]|0);q=q+1|0;}while(q>>>0<(c[f>>2]|0)>>>0);mt(m);i=e;return}function c7(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+10240|0;e=d|0;b0(a|0,b|0,4483,10240,e|0,0)|0;dE(3,0,1160,(C=i,i=i+24|0,c[C>>2]=1208,c[C+8>>2]=e,c[C+16>>2]=1208,C)|0)|0;i=d;return}function c8(a,b){a=a|0;b=b|0;var d=0,e=0;if((b|0)>0){d=0}else{return}do{e=c[a+(d<<2)>>2]|0;if((e|0)!=0){bZ(e|0)|0}d=d+1|0;}while((d|0)<(b|0));return}function c9(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0;e=i;i=i+1192|0;f=e+1024|0;g=e+1032|0;h=e+1040|0;j=e+1048|0;k=e+1064|0;l=e+1072|0;m=e+1080|0;n=e+1088|0;o=e+1096|0;p=e+1104|0;q=e+1112|0;r=e+1120|0;s=e+1128|0;t=e+1136|0;u=e+1144|0;v=e+1152|0;w=e+1176|0;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=i;i=i+4|0;i=i+7>>3<<3;F=i;i=i+4|0;i=i+7>>3<<3;G=i;i=i+4|0;i=i+7>>3<<3;H=i;i=i+4|0;i=i+7>>3<<3;I=i;i=i+24|0;J=e|0;bN(d|0,4139,1024,J|0,0)|0;dE(b,0,1272,(C=i,i=i+8|0,c[C>>2]=J,C)|0)|0;bN(d|0,4140,1024,J|0,0)|0;dE(b,0,800,(C=i,i=i+8|0,c[C>>2]=J,C)|0)|0;bN(d|0,4141,1024,J|0,0)|0;dE(b,0,464,(C=i,i=i+8|0,c[C>>2]=J,C)|0)|0;bN(d|0,4096,8,f|0,0)|0;K=c[f>>2]|0;L=c[f+4>>2]|0;if((K&2|0)==0&(L&0|0)==0){M=L;N=K}else{dE(b,0,320,(C=i,i=i+8|0,c[C>>2]=5840,C)|0)|0;M=c[f+4>>2]|0;N=c[f>>2]|0}if((N&4|0)==0&(M&0|0)==0){O=M;P=N}else{dE(b,0,320,(C=i,i=i+8|0,c[C>>2]=5616,C)|0)|0;O=c[f+4>>2]|0;P=c[f>>2]|0}if((P&8|0)==0&(O&0|0)==0){Q=O;R=P}else{dE(b,0,320,(C=i,i=i+8|0,c[C>>2]=5216,C)|0)|0;Q=c[f+4>>2]|0;R=c[f>>2]|0}if(!((R&1|0)==0&(Q&0|0)==0)){dE(b,0,320,(C=i,i=i+8|0,c[C>>2]=5064,C)|0)|0}bN(d|0,4098,4,g|0,0)|0;dE(b,0,4920,(C=i,i=i+8|0,c[C>>2]=c[g>>2],C)|0)|0;bN(d|0,4099,4,h|0,0)|0;dE(b,0,4800,(C=i,i=i+8|0,c[C>>2]=c[h>>2],C)|0)|0;bN(d|0,4101,12,j|0,0)|0;h=c[j+4>>2]|0;g=c[j+8>>2]|0;dE(b,0,4736,(C=i,i=i+24|0,c[C>>2]=c[j>>2],c[C+8>>2]=h,c[C+16>>2]=g,C)|0)|0;bN(d|0,4100,4,k|0,0)|0;dE(b,0,4632,(C=i,i=i+8|0,c[C>>2]=c[k>>2],C)|0)|0;bN(d|0,4108,4,l|0,0)|0;dE(b,0,4488,(C=i,i=i+8|0,c[C>>2]=c[l>>2],C)|0)|0;bN(d|0,4109,4,m|0,0)|0;dE(b,0,4440,(C=i,i=i+8|0,c[C>>2]=c[m>>2],C)|0)|0;bN(d|0,4112,8,n|0,0)|0;dE(b,0,4352,(C=i,i=i+8|0,c[C>>2]=(c[n>>2]|0)>>>20|c[n+4>>2]<<12,C)|0)|0;n=o;bN(d|0,4127,8,n|0,0)|0;dE(b,0,4264,(C=i,i=i+8|0,c[C>>2]=(c[o>>2]|0)>>>20|c[o+4>>2]<<12,C)|0)|0;bN(d|0,4132,4,p|0,0)|0;dE(b,0,4144,(C=i,i=i+8|0,c[C>>2]=(c[p>>2]|0)==1?4112:4064,C)|0)|0;bN(d|0,4130,4,q|0,0)|0;dE(b,0,3976,(C=i,i=i+8|0,c[C>>2]=(c[q>>2]|0)==1?3888:3768,C)|0)|0;bN(d|0,4131,8,n|0,0)|0;dE(b,0,3640,(C=i,i=i+8|0,c[C>>2]=(c[o>>2]|0)>>>10|c[o+4>>2]<<22,C)|0)|0;bN(d|0,4128,8,n|0,0)|0;dE(b,0,3504,(C=i,i=i+8|0,c[C>>2]=(c[o>>2]|0)>>>10|c[o+4>>2]<<22,C)|0)|0;bN(d|0,4138,8,r|0,0)|0;o=c[r>>2]|0;n=c[r+4>>2]|0;if((o&1|0)==0&(n&0|0)==0){S=n;T=o}else{dE(b,0,3416,(C=i,i=i+8|0,c[C>>2]=3312,C)|0)|0;S=c[r+4>>2]|0;T=c[r>>2]|0}if(!((T&2|0)==0&(S&0|0)==0)){dE(b,0,3416,(C=i,i=i+8|0,c[C>>2]=3168,C)|0)|0}bN(d|0,4118,4,s|0,0)|0;dE(b,0,3080,(C=i,i=i+8|0,c[C>>2]=c[s>>2],C)|0)|0;bN(d|0,4110,4,t|0,0)|0;dE(b,0,2952,(C=i,i=i+8|0,c[C>>2]=c[t>>2],C)|0)|0;bN(d|0,4111,4,u|0,0)|0;dE(b,0,2832,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0)|0;dE(b,0,2672,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bN(d|0,4113,4,v|0,0)|0;dE(b,0,2600,(C=i,i=i+8|0,c[C>>2]=c[v>>2],C)|0)|0;u=v+4|0;bN(d|0,4114,4,u|0,0)|0;dE(b,0,2520,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0)|0;u=v+8|0;bN(d|0,4115,4,u|0,0)|0;dE(b,0,2456,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0)|0;u=v+12|0;bN(d|0,4116,4,u|0,0)|0;dE(b,0,2352,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0)|0;u=v+16|0;bN(d|0,4117,4,u|0,0)|0;dE(b,0,2320,(C=i,i=i+8|0,c[C>>2]=c[u>>2],C)|0)|0;bN(d|0,4144,1024,J|0,0)|0;dE(b,0,2272,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;mK(w|0,0,12);fm(x,J,mI(J|0)|0);fc(w,x)|0;fb(x);x=ft(w,32,0)|0;if((x|0)==-1){fb(w);U=dE(b,0,1600,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;V=I|0;W=I;X=bN(d|0,4102,4,W|0,0)|0;Y=I+4|0;Z=Y;_=bN(d|0,4103,4,Z|0,0)|0;$=I+8|0;aa=$;ab=bN(d|0,4104,4,aa|0,0)|0;ac=I+12|0;ad=ac;ae=bN(d|0,4105,4,ad|0,0)|0;af=I+16|0;ag=af;ah=bN(d|0,4106,4,ag|0,0)|0;ai=I+20|0;aj=ai;ak=bN(d|0,4107,4,aj|0,0)|0;al=c[V>>2]|0;am=c[Y>>2]|0;an=c[$>>2]|0;ao=c[ac>>2]|0;ap=c[af>>2]|0;aq=dE(b,0,1536,(C=i,i=i+40|0,c[C>>2]=al,c[C+8>>2]=am,c[C+16>>2]=an,c[C+24>>2]=ao,c[C+32>>2]=ap,C)|0)|0;i=e;return}J=w;u=y;v=y+1|0;t=z;s=z+1|0;S=z+8|0;T=y+8|0;r=0;o=0;n=x;while(1){x=n-o|0;if((n|0)==(o|0)){ar=r;break}fa(y,w,o,x,J);q=a1(2192,((a[u]&1)==0?v:c[T>>2]|0)|0)|0;fb(y);p=(q|0)==0|r;if((o|0)!=0){dE(b,0,2168,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0}fa(z,w,o,x,J);dE(b,0,2152,(C=i,i=i+8|0,c[C>>2]=(a[t]&1)==0?s:c[S>>2]|0,C)|0)|0;fb(z);x=n+1|0;q=ft(w,32,x)|0;if((q|0)==-1){ar=p;break}else{r=p;o=x;n=q}}fb(w);if(!ar){U=dE(b,0,1600,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;V=I|0;W=I;X=bN(d|0,4102,4,W|0,0)|0;Y=I+4|0;Z=Y;_=bN(d|0,4103,4,Z|0,0)|0;$=I+8|0;aa=$;ab=bN(d|0,4104,4,aa|0,0)|0;ac=I+12|0;ad=ac;ae=bN(d|0,4105,4,ad|0,0)|0;af=I+16|0;ag=af;ah=bN(d|0,4106,4,ag|0,0)|0;ai=I+20|0;aj=ai;ak=bN(d|0,4107,4,aj|0,0)|0;al=c[V>>2]|0;am=c[Y>>2]|0;an=c[$>>2]|0;ao=c[ac>>2]|0;ap=c[af>>2]|0;aq=dE(b,0,1536,(C=i,i=i+40|0,c[C>>2]=al,c[C+8>>2]=am,c[C+16>>2]=an,c[C+24>>2]=ao,c[C+32>>2]=ap,C)|0)|0;i=e;return}bN(d|0,16384,4,A|0,0)|0;bN(d|0,16385,4,B|0,0)|0;ar=c[B>>2]|0;dE(b,0,2048,(C=i,i=i+16|0,c[C>>2]=c[A>>2],c[C+8>>2]=ar,C)|0)|0;bN(d|0,16386,4,D|0,0)|0;dE(b,0,1952,(C=i,i=i+8|0,c[C>>2]=c[D>>2],C)|0)|0;bN(d|0,16387,4,E|0,0)|0;dE(b,0,1896,(C=i,i=i+8|0,c[C>>2]=c[E>>2],C)|0)|0;bN(d|0,16388,4,F|0,0)|0;dE(b,0,1856,(C=i,i=i+8|0,c[C>>2]=(c[F>>2]|0)==1?1848:1832,C)|0)|0;bN(d|0,16389,4,G|0,0)|0;dE(b,0,1752,(C=i,i=i+8|0,c[C>>2]=(c[G>>2]|0)==1?1848:1832,C)|0)|0;bN(d|0,16390,4,H|0,0)|0;dE(b,0,1696,(C=i,i=i+8|0,c[C>>2]=(c[H>>2]|0)==1?1848:1832,C)|0)|0;U=dE(b,0,1600,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;V=I|0;W=I;X=bN(d|0,4102,4,W|0,0)|0;Y=I+4|0;Z=Y;_=bN(d|0,4103,4,Z|0,0)|0;$=I+8|0;aa=$;ab=bN(d|0,4104,4,aa|0,0)|0;ac=I+12|0;ad=ac;ae=bN(d|0,4105,4,ad|0,0)|0;af=I+16|0;ag=af;ah=bN(d|0,4106,4,ag|0,0)|0;ai=I+20|0;aj=ai;ak=bN(d|0,4107,4,aj|0,0)|0;al=c[V>>2]|0;am=c[Y>>2]|0;an=c[$>>2]|0;ao=c[ac>>2]|0;ap=c[af>>2]|0;aq=dE(b,0,1536,(C=i,i=i+40|0,c[C>>2]=al,c[C+8>>2]=am,c[C+16>>2]=an,c[C+24>>2]=ao,c[C+32>>2]=ap,C)|0)|0;i=e;return}function da(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((c[4854]|0)!=0){return}if((a|0)==0|(b|0)==0){dc(1096,59,4680)}d=my(32)|0;e=d;f=d+4|0;c[f>>2]=0;c[d+8>>2]=0;c[d>>2]=f;f=d+16|0;c[f>>2]=0;c[d+20>>2]=0;c[d+12>>2]=f;c[4854]=e;dd(e,a,b);c[4852]=a;c[4850]=b;return}function db(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d|0;f=dg(a,e,b)|0;g=c[f>>2]|0;if((g|0)!=0){h=g;j=h+28|0;i=d;return j|0}g=my(40)|0;k=g+16|0;if((k|0)!=0){fl(k,b)}b=g+28|0;if((b|0)!=0){mK(b|0,0,12)}b=c[e>>2]|0;e=g;c[g>>2]=0;c[g+4>>2]=0;c[g+8>>2]=b;c[f>>2]=e;b=a|0;k=c[c[b>>2]>>2]|0;if((k|0)==0){l=e}else{c[b>>2]=k;l=c[f>>2]|0}df(c[a+4>>2]|0,l);l=a+8|0;c[l>>2]=(c[l>>2]|0)+1;h=g;j=h+28|0;i=d;return j|0}function dc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+16|0;f=e|0;e=i;i=i+144|0;g=i;i=i+12|0;i=i+7>>3<<3;h=e|0;j=e+8|0;k=j|0;c[k>>2]=8136;l=e+12|0;c[h>>2]=15236;c[e+64>>2]=15256;c[e+4>>2]=0;fX(e+64|0,l);c[e+136>>2]=0;c[e+140>>2]=-1;c[h>>2]=8116;c[e+64>>2]=8156;c[k>>2]=8136;f0(l|0);c[l>>2]=8296;mK(e+44|0,0,16);c[e+60>>2]=24;mK(f|0,0,12);dz(l,f);fb(f);di(di(di(di(g5(di(di(di(j,1992)|0,a)|0,1504)|0,b)|0,936)|0,568)|0,d)|0,936)|0;d=ck(8)|0;dx(g,l);eV(d,g);c[d>>2]=9592;bE(d|0,15064,194)}function dd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;g=i;i=i+16|0;h=g|0;j=i;i=i+12|0;i=i+7>>3<<3;k=i;i=i+12|0;i=i+7>>3<<3;l=i;i=i+12|0;i=i+7>>3<<3;m=i;i=i+12|0;i=i+7>>3<<3;n=i;i=i+1|0;i=i+7>>3<<3;o=i;i=i+12|0;i=i+7>>3<<3;p=i;i=i+1|0;i=i+7>>3<<3;q=i;i=i+12|0;i=i+7>>3<<3;r=i;i=i+1|0;i=i+7>>3<<3;mK(h|0,0,12);s=l;mK(j|0,0,12);t=k+4|0;c[t>>2]=0;c[k+8>>2]=0;c[k>>2]=t;mK(s|0,0,12);t=k|0;if((e|0)>1){u=l+1|0;v=b+12|0;b=l+4|0;w=l+8|0;x=1;do{fd(l,c[f+(x<<2)>>2]|0)|0;y=a[s]|0;if((a[(y&1)==0?u:c[w>>2]|0]|0)==45){z=y}else{de(1096,139,3816);z=a[s]|0}y=(a[((z&1)==0?u:c[w>>2]|0)+1|0]|0)==45?2:1;A=ft(l,61,0)|0;if((A|0)==-1){B=d[s]|0;fa(m,l,y,((B&1|0)==0?B>>>1:c[b>>2]|0)-y|0,n);B=db(v,m)|0;fd(B,2624)|0;fb(m)}else{fa(o,l,y,A-y|0,p);y=db(v,o)|0;B=d[s]|0;fa(q,l,A+1|0,((B&1|0)==0?B>>>1:c[b>>2]|0)-1|0,r);fc(y,q)|0;fb(q);fb(o)}x=x+1|0;}while((x|0)<(e|0))}fb(l);dD(t,c[k+4>>2]|0);fb(j);fb(h);i=g;return}function de(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+16|0;f=e|0;e=i;i=i+144|0;g=i;i=i+12|0;i=i+7>>3<<3;h=e|0;j=e+8|0;k=j|0;c[k>>2]=8136;l=e+12|0;c[h>>2]=15236;c[e+64>>2]=15256;c[e+4>>2]=0;fX(e+64|0,l);c[e+136>>2]=0;c[e+140>>2]=-1;c[h>>2]=8116;c[e+64>>2]=8156;c[k>>2]=8136;f0(l|0);c[l>>2]=8296;mK(e+44|0,0,16);c[e+60>>2]=24;mK(f|0,0,12);dz(l,f);fb(f);di(di(di(di(g5(di(di(di(j,1992)|0,a)|0,1504)|0,b)|0,936)|0,568)|0,d)|0,936)|0;d=ck(8)|0;dx(g,l);eZ(d,g);c[d>>2]=9560;bE(d|0,15048,192)}function df(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=(d|0)==(b|0);a[d+12|0]=e&1;if(e){return}else{f=d}while(1){g=f+8|0;h=c[g>>2]|0;d=h+12|0;if((a[d]&1)!=0){i=275;break}j=h+8|0;k=c[j>>2]|0;e=c[k>>2]|0;if((h|0)==(e|0)){l=c[k+4>>2]|0;if((l|0)==0){i=243;break}m=l+12|0;if((a[m]&1)!=0){i=243;break}a[d]=1;a[k+12|0]=(k|0)==(b|0)|0;a[m]=1}else{if((e|0)==0){i=260;break}m=e+12|0;if((a[m]&1)!=0){i=260;break}a[d]=1;a[k+12|0]=(k|0)==(b|0)|0;a[m]=1}if((k|0)==(b|0)){i=277;break}else{f=k}}if((i|0)==275){return}else if((i|0)==277){return}else if((i|0)==243){if((f|0)==(c[h>>2]|0)){n=h;o=k}else{b=h+4|0;m=c[b>>2]|0;d=m|0;e=c[d>>2]|0;c[b>>2]=e;if((e|0)==0){p=k}else{c[e+8>>2]=h;p=c[j>>2]|0}e=m+8|0;c[e>>2]=p;p=c[j>>2]|0;b=p|0;if((c[b>>2]|0)==(h|0)){c[b>>2]=m}else{c[p+4>>2]=m}c[d>>2]=h;c[j>>2]=m;n=m;o=c[e>>2]|0}a[n+12|0]=1;a[o+12|0]=0;n=o|0;e=c[n>>2]|0;m=e+4|0;d=c[m>>2]|0;c[n>>2]=d;if((d|0)!=0){c[d+8>>2]=o}d=o+8|0;c[e+8>>2]=c[d>>2];n=c[d>>2]|0;p=n|0;if((c[p>>2]|0)==(o|0)){c[p>>2]=e}else{c[n+4>>2]=e}c[m>>2]=o;c[d>>2]=e;return}else if((i|0)==260){i=h|0;if((f|0)==(c[i>>2]|0)){e=f+4|0;d=c[e>>2]|0;c[i>>2]=d;if((d|0)==0){q=k}else{c[d+8>>2]=h;q=c[j>>2]|0}c[g>>2]=q;q=c[j>>2]|0;d=q|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=f}else{c[q+4>>2]=f}c[e>>2]=h;c[j>>2]=f;r=f;s=c[g>>2]|0}else{r=h;s=k}a[r+12|0]=1;a[s+12|0]=0;r=s+4|0;k=c[r>>2]|0;h=k|0;g=c[h>>2]|0;c[r>>2]=g;if((g|0)!=0){c[g+8>>2]=s}g=s+8|0;c[k+8>>2]=c[g>>2];r=c[g>>2]|0;f=r|0;if((c[f>>2]|0)==(s|0)){c[f>>2]=k}else{c[r+4>>2]=k}c[h>>2]=s;c[g>>2]=k;return}}function dg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=b+4|0;b=f|0;g=c[b>>2]|0;if((g|0)==0){c[d>>2]=f;h=b;return h|0}b=a[e]|0;f=b&255;i=f>>>1;j=(b&1)==0;b=e+1|0;k=e+8|0;l=e+4|0;L238:do{if((f&1|0)==0){e=g;while(1){m=e+16|0;n=m;o=a[m]|0;m=o&255;p=(m&1|0)==0;if(p){q=m>>>1}else{q=c[e+20>>2]|0}if(j){r=b}else{r=c[k>>2]|0}s=(o&1)==0;if(s){t=n+1|0}else{t=c[e+24>>2]|0}o=mL(r|0,t|0,(q>>>0<i>>>0?q:i)|0)|0;if((o|0)==0){if(i>>>0<q>>>0){u=304}}else{if((o|0)<0){u=304}}if((u|0)==304){u=0;o=e|0;v=c[o>>2]|0;if((v|0)==0){w=e;x=o;u=317;break}else{e=v;continue}}if(p){y=m>>>1}else{y=c[e+20>>2]|0}if(s){z=n+1|0}else{z=c[e+24>>2]|0}if(j){A=b}else{A=c[k>>2]|0}n=mL(z|0,A|0,(i>>>0<y>>>0?i:y)|0)|0;if((n|0)==0){if(y>>>0>=i>>>0){B=e;u=331;break L238}}else{if((n|0)>=0){B=e;u=331;break L238}}n=e+4|0;s=c[n>>2]|0;if((s|0)==0){C=e;D=n;u=330;break}else{e=s}}}else{e=g;while(1){s=e+16|0;n=c[l>>2]|0;m=s;p=a[s]|0;s=p&255;v=(s&1|0)==0;if(v){E=s>>>1}else{E=c[e+20>>2]|0}if(j){F=b}else{F=c[k>>2]|0}o=(p&1)==0;if(o){G=m+1|0}else{G=c[e+24>>2]|0}p=mL(F|0,G|0,(E>>>0<n>>>0?E:n)|0)|0;if((p|0)==0){if(n>>>0<E>>>0){u=316}}else{if((p|0)<0){u=316}}if((u|0)==316){u=0;p=e|0;n=c[p>>2]|0;if((n|0)==0){w=e;x=p;u=317;break}else{e=n;continue}}if(v){H=s>>>1}else{H=c[e+20>>2]|0}s=c[l>>2]|0;if(o){I=m+1|0}else{I=c[e+24>>2]|0}if(j){J=b}else{J=c[k>>2]|0}m=mL(I|0,J|0,(s>>>0<H>>>0?s:H)|0)|0;if((m|0)==0){if(H>>>0>=s>>>0){B=e;u=331;break L238}}else{if((m|0)>=0){B=e;u=331;break L238}}m=e+4|0;s=c[m>>2]|0;if((s|0)==0){C=e;D=m;u=330;break}else{e=s}}}}while(0);if((u|0)==317){c[d>>2]=w;h=x;return h|0}else if((u|0)==330){c[d>>2]=C;h=D;return h|0}else if((u|0)==331){c[d>>2]=B;h=d;return h|0}return 0}function dh(a){a=a|0;eY(a|0);return}function di(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;gv(g,b);do{if((a[g|0]&1)!=0){k=mI(d|0)|0;l=b;m=c[(c[l>>2]|0)-12>>2]|0;n=b;c[h>>2]=c[n+(m+24)>>2];o=d+k|0;k=(c[n+(m+4)>>2]&176|0)==32?o:d;p=n+m|0;q=n+(m+76)|0;m=c[q>>2]|0;if((m|0)==-1){fW(f,p);r=kx(f,18912)|0;s=cz[c[(c[r>>2]|0)+28>>2]&63](r,32)|0;ko(f);c[q>>2]=s<<24>>24;t=s}else{t=m&255}dC(j,h,d,k,o,p,t);if((c[j>>2]|0)!=0){break}p=c[(c[l>>2]|0)-12>>2]|0;ge(n+p|0,c[n+(p+16)>>2]|5)}}while(0);gw(g);i=e;return b|0}function dj(a){a=a|0;var b=0;c[a>>2]=8116;c[a+64>>2]=8156;c[a+8>>2]=8136;b=a+12|0;c[b>>2]=8296;fb(a+44|0);f$(b|0);gC(a,9636);fV(a+64|0);return}function dk(a){a=a|0;var b=0,d=0;b=a-144+136|0;c[b>>2]=8116;a=b+64|0;c[a>>2]=8156;c[b+8>>2]=8136;d=b+12|0;c[d>>2]=8296;fb(b+44|0);f$(d);gC(b,9636);fV(a);return}function dl(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=8116;e=b+(d+64)|0;c[e>>2]=8156;c[b+(d+8)>>2]=8136;f=b+(d+12)|0;c[f>>2]=8296;fb(b+(d+44)|0);f$(f);gC(a,9636);fV(e);return}function dm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;i=d+44|0;j=c[i>>2]|0;k=d+24|0;l=c[k>>2]|0;if(j>>>0<l>>>0){c[i>>2]=l;m=l}else{m=j}j=h&24;do{if((j|0)==24){if((g|0)==0){n=0;o=0;break}else if((g|0)==2){p=411;break}else if((g|0)!=1){p=415;break}i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else if((j|0)==0){i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else{if((g|0)==0){n=0;o=0;break}else if((g|0)==2){p=411;break}else if((g|0)!=1){p=415;break}if((h&8|0)==0){i=l-(c[d+20>>2]|0)|0;n=(i|0)<0?-1:0;o=i;break}else{i=(c[d+12>>2]|0)-(c[d+8>>2]|0)|0;n=(i|0)<0?-1:0;o=i;break}}}while(0);if((p|0)==415){g=b;c[g>>2]=0;c[g+4>>2]=0;g=b+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}if((p|0)==411){p=d+32|0;if((a[p]&1)==0){q=p+1|0}else{q=c[d+40>>2]|0}p=m-q|0;n=(p|0)<0?-1:0;o=p}p=mO(o,n,e,f)|0;f=L;e=0;do{if(!((f|0)<(e|0)|(f|0)==(e|0)&p>>>0<0>>>0)){n=d+32|0;if((a[n]&1)==0){r=n+1|0}else{r=c[d+40>>2]|0}n=m-r|0;o=(n|0)<0?-1:0;if((o|0)<(f|0)|(o|0)==(f|0)&n>>>0<p>>>0){break}n=h&8;do{if(!((p|0)==0&(f|0)==0)){do{if((n|0)!=0){if((c[d+12>>2]|0)!=0){break}o=b;c[o>>2]=0;c[o+4>>2]=0;o=b+8|0;c[o>>2]=-1;c[o+4>>2]=-1;return}}while(0);if(!((h&16|0)!=0&(l|0)==0)){break}o=b;c[o>>2]=0;c[o+4>>2]=0;o=b+8|0;c[o>>2]=-1;c[o+4>>2]=-1;return}}while(0);if((n|0)!=0){c[d+12>>2]=(c[d+8>>2]|0)+p;c[d+16>>2]=m}if((h&16|0)!=0){c[k>>2]=(c[d+20>>2]|0)+p}o=b;c[o>>2]=0;c[o+4>>2]=0;o=b+8|0;c[o>>2]=p;c[o+4>>2]=f;return}}while(0);f=b;c[f>>2]=0;c[f+4>>2]=0;f=b+8|0;c[f>>2]=-1;c[f+4>>2]=-1;return}function dn(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0;b=a+44|0;e=c[b>>2]|0;f=c[a+24>>2]|0;if(e>>>0<f>>>0){c[b>>2]=f;g=f}else{g=e}if((c[a+48>>2]&8|0)==0){h=-1;return h|0}e=a+16|0;f=c[e>>2]|0;b=c[a+12>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;i=g}else{i=f}if(b>>>0>=i>>>0){h=-1;return h|0}h=d[b]|0;return h|0}function dp(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+44|0;f=c[e>>2]|0;g=c[b+24>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;h=g}else{h=f}f=b+8|0;g=c[f>>2]|0;e=b+12|0;i=c[e>>2]|0;if(g>>>0>=i>>>0){j=-1;return j|0}if((d|0)==-1){c[f>>2]=g;c[e>>2]=i-1;c[b+16>>2]=h;j=0;return j|0}k=i-1|0;do{if((c[b+48>>2]&16|0)==0){if((d<<24>>24|0)==(a[k]|0)){break}else{j=-1}return j|0}}while(0);c[f>>2]=g;c[e>>2]=k;c[b+16>>2]=h;a[k]=d&255;j=d;return j|0}function dq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d;d=i;i=i+16|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];c[d+8>>2]=c[g+8>>2];c[d+12>>2]=c[g+12>>2];g=d+8|0;cJ[c[(c[b>>2]|0)+16>>2]&63](a,b,c[g>>2]|0,c[g+4>>2]|0,0,e);i=f;return}function dr(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;if((d|0)==-1){e=0;return e|0}f=b|0;g=b+12|0;h=b+8|0;i=(c[g>>2]|0)-(c[h>>2]|0)|0;j=b+24|0;k=c[j>>2]|0;l=b+28|0;m=c[l>>2]|0;if((k|0)==(m|0)){n=b+48|0;if((c[n>>2]&16|0)==0){e=-1;return e|0}o=b+20|0;p=c[o>>2]|0;q=b+44|0;r=(c[q>>2]|0)-p|0;s=b+32|0;fh(s,0);t=s;if((a[t]&1)==0){u=10}else{u=(c[s>>2]&-2)-1|0}fe(s,u,0);u=a[t]|0;if((u&1)==0){v=s+1|0}else{v=c[b+40>>2]|0}s=u&255;if((s&1|0)==0){w=s>>>1}else{w=c[b+36>>2]|0}s=v+w|0;c[o>>2]=v;c[l>>2]=s;l=v+(k-p)|0;c[j>>2]=l;p=v+r|0;c[q>>2]=p;x=l;y=s;z=p;A=n}else{x=k;y=m;z=c[b+44>>2]|0;A=b+48|0}m=x+1|0;k=m>>>0<z>>>0?z:m;c[b+44>>2]=k;if((c[A>>2]&8|0)!=0){A=b+32|0;if((a[A]&1)==0){B=A+1|0}else{B=c[b+40>>2]|0}c[h>>2]=B;c[g>>2]=B+i;c[b+16>>2]=k}if((x|0)==(y|0)){e=cz[c[(c[b>>2]|0)+52>>2]&63](f,d&255)|0;return e|0}else{c[j>>2]=m;a[x]=d&255;e=d&255;return e|0}return 0}function ds(a){a=a|0;var b=0;c[a>>2]=8116;c[a+64>>2]=8156;c[a+8>>2]=8136;b=a+12|0;c[b>>2]=8296;fb(a+44|0);f$(b|0);gC(a,9636);fV(a+64|0);mC(a);return}function dt(a){a=a|0;var b=0,d=0;b=a-144+136|0;c[b>>2]=8116;a=b+64|0;c[a>>2]=8156;c[b+8>>2]=8136;d=b+12|0;c[d>>2]=8296;fb(b+44|0);f$(d);gC(b,9636);fV(a);mC(b);return}function du(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=8116;e=b+(d+64)|0;c[e>>2]=8156;c[b+(d+8)>>2]=8136;f=b+(d+12)|0;c[f>>2]=8296;fb(b+(d+44)|0);f$(f);gC(a,9636);fV(e);mC(a);return}function dv(a){a=a|0;c[a>>2]=8296;fb(a+32|0);f$(a|0);return}function dw(a){a=a|0;c[a>>2]=8296;fb(a+32|0);f$(a|0);mC(a);return}function dx(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=b;f=c[d+48>>2]|0;if((f&16|0)!=0){g=d+44|0;h=c[g>>2]|0;i=c[d+24>>2]|0;if(h>>>0<i>>>0){c[g>>2]=i;j=i}else{j=h}h=c[d+20>>2]|0;i=h;g=j-i|0;do{if((g|0)==-1){fj(b);k=559}else{if(g>>>0>=11){k=559;break}a[e]=g<<1&255;l=b+1|0}}while(0);if((k|0)==559){m=g+16&-16;n=my(m)|0;c[b+8>>2]=n;c[b>>2]=m|1;c[b+4>>2]=g;l=n}if((h|0)==(j|0)){o=l}else{n=j+(-i|0)|0;i=l;g=h;while(1){a[i]=a[g]|0;h=g+1|0;if((h|0)==(j|0)){break}else{i=i+1|0;g=h}}o=l+n|0}a[o]=0;return}if((f&8|0)==0){mK(e|0,0,12);return}f=c[d+8>>2]|0;o=c[d+16>>2]|0;d=f;n=o-d|0;do{if((n|0)==-1){fj(b);k=570}else{if(n>>>0>=11){k=570;break}a[e]=n<<1&255;p=b+1|0}}while(0);if((k|0)==570){k=n+16&-16;e=my(k)|0;c[b+8>>2]=e;c[b>>2]=k|1;c[b+4>>2]=n;p=e}if((f|0)==(o|0)){q=p}else{e=o+(-d|0)|0;d=p;n=f;while(1){a[d]=a[n]|0;f=n+1|0;if((f|0)==(o|0)){break}else{d=d+1|0;n=f}}q=p+e|0}a[q]=0;return}function dy(a){a=a|0;eY(a|0);mC(a);return}function dz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=b+32|0;fc(e,d)|0;d=b+44|0;c[d>>2]=0;f=b+48|0;g=c[f>>2]|0;if((g&8|0)!=0){h=e;i=a[e]|0;j=(i&1)==0;if(j){k=h+1|0}else{k=c[b+40>>2]|0}l=i&255;if((l&1|0)==0){m=l>>>1}else{m=c[b+36>>2]|0}l=k+m|0;c[d>>2]=l;if(j){n=h+1|0;o=h+1|0}else{h=c[b+40>>2]|0;n=h;o=h}c[b+8>>2]=o;c[b+12>>2]=n;c[b+16>>2]=l}if((g&16|0)==0){return}g=e;l=e;n=a[l]|0;o=n&255;if((o&1|0)==0){p=o>>>1}else{p=c[b+36>>2]|0}if((n&1)==0){c[d>>2]=g+1+p;q=10}else{c[d>>2]=(c[b+40>>2]|0)+p;q=(c[e>>2]&-2)-1|0}fe(e,q,0);q=a[l]|0;if((q&1)==0){r=g+1|0;s=g+1|0}else{g=c[b+40>>2]|0;r=g;s=g}g=q&255;if((g&1|0)==0){t=g>>>1}else{t=c[b+36>>2]|0}g=b+24|0;c[g>>2]=s;c[b+20>>2]=s;c[b+28>>2]=r+t;if((c[f>>2]&3|0)==0){return}c[g>>2]=s+p;return}function dA(a){a=a|0;e0(a|0);return}function dB(a){a=a|0;e0(a|0);mC(a);return}function dC(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((cA[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){fn(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((cA[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){fb(l);break}c[m>>2]=0;c[b>>2]=0;fb(l);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((cA[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function dD(a,b){a=a|0;b=b|0;if((b|0)==0){return}dD(a,c[b>>2]|0);dD(a,c[b+4>>2]|0);fb(b+28|0);fb(b+16|0);mC(b);return}function dE(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0.0,B=0;j=i;i=i+32|0;k=j|0;l=j+8|0;m=j+24|0;do{if((c[4524]|0)==0){if((d&2|0)==0){break}n=c[3882]|0;if((n|0)==0){o=ms(21)|0;c[3882]=o;mJ(o|0,4608,21)|0;p=o}else{p=n}n=k|0;if((d&4|0)==0){b[k>>1]=119}else{a[n]=a[3728]|0;a[n+1|0]=a[3729|0]|0;a[n+2|0]=a[3730|0]|0}o=bJ(p|0,n|0)|0;c[4524]=o;if((o|0)==0){q=-1}else{break}i=j;return q|0}}while(0);do{if((c[4522]|0)==0){if((d&10|0)!=10){break}p=bJ(1928,3728)|0;c[4522]=p;if((p|0)==0){q=-1}else{break}i=j;return q|0}}while(0);p=(d&16|0)!=0;do{if(p){if((d&1|0)!=0){bH(1408,(C=i,i=i+8|0,c[C>>2]=e,C)|0)|0}if((d&2|0)==0){break}k=c[4524]|0;ca(k|0,1408,(C=i,i=i+8|0,c[C>>2]=e,C)|0)|0}}while(0);k=l|0;o=l;c[o>>2]=g;c[o+4>>2]=0;o=a[f]|0;if(o<<24>>24!=0){g=(d&1|0)==0;l=(d&2|0)==0;n=(d&8|0)==0;r=m|0;t=m+2|0;u=m+3|0;m=f;f=o;do{o=f<<24>>24;do{if(f<<24>>24==37){v=m+1|0;w=a[v]|0;if((w|0)==117){x=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,c[(c[k>>2]|0)+C>>2]|0);if(!g){bH(360,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0}if(l){y=v;break}z=c[4524]|0;ca(z|0,360,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0;if(n){y=v;break}z=c[4522]|0;ca(z|0,360,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0;y=v;break}else if((w|0)==102){A=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,+h[(c[k>>2]|0)+C>>3]);if(!g){bH(5712,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0}if(l){y=v;break}ca(c[4524]|0,5712,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0;if(n){y=v;break}ca(c[4522]|0,5712,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0;y=v;break}else if((w|0)==100|(w|0)==105){x=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,c[(c[k>>2]|0)+C>>2]|0);if(!g){bH(528,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0}if(l){y=v;break}ca(c[4524]|0,528,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0;if(n){y=v;break}ca(c[4522]|0,528,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0;y=v;break}else if((w|0)==101|(w|0)==69){A=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,+h[(c[k>>2]|0)+C>>3]);if(!g){bH(176,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0}if(l){y=v;break}ca(c[4524]|0,176,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0;if(n){y=v;break}ca(c[4522]|0,176,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0;y=v;break}else if((w|0)==115){x=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,c[(c[k>>2]|0)+C>>2]|0);if(!g){bH(888,(C=i,i=i+8|0,c[C>>2]=x,C)|0)|0}if(l){y=v;break}aR(x|0,c[4524]|0)|0;if(n){y=v;break}aR(x|0,c[4522]|0)|0;y=v;break}else if((w|0)==46){a[r]=a[6280]|0;a[r+1|0]=a[6281|0]|0;a[r+2|0]=a[6282|0]|0;a[r+3|0]=a[6283|0]|0;a[r+4|0]=a[6284|0]|0;a[t]=a[m+2|0]|0;x=m+3|0;z=a[x]|0;a[u]=z;B=z<<24>>24;if((B|0)==102|(B|0)==101|(B|0)==69){A=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,+h[(c[k>>2]|0)+C>>3]);if(!g){bH(r|0,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0}if(l){y=x;break}z=c[4524]|0;ca(z|0,r|0,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0;if(n){y=x;break}z=c[4522]|0;ca(z|0,r|0,(C=i,i=i+8|0,h[C>>3]=A,C)|0)|0;y=x;break}else if((B|0)==100|(B|0)==105){z=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,c[(c[k>>2]|0)+C>>2]|0);if(!g){bH(r|0,(C=i,i=i+8|0,c[C>>2]=z,C)|0)|0}if(l){y=x;break}ca(c[4524]|0,r|0,(C=i,i=i+8|0,c[C>>2]=z,C)|0)|0;if(n){y=x;break}ca(c[4522]|0,r|0,(C=i,i=i+8|0,c[C>>2]=z,C)|0)|0;y=x;break}else if((B|0)==117){z=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,c[(c[k>>2]|0)+C>>2]|0);if(!g){bH(r|0,(C=i,i=i+8|0,c[C>>2]=z,C)|0)|0}if(l){y=x;break}ca(c[4524]|0,r|0,(C=i,i=i+8|0,c[C>>2]=z,C)|0)|0;if(n){y=x;break}ca(c[4522]|0,r|0,(C=i,i=i+8|0,c[C>>2]=z,C)|0)|0;y=x;break}else if((B|0)==115){B=(C=c[k+4>>2]|0,c[k+4>>2]=C+8,c[(c[k>>2]|0)+C>>2]|0);if(!g){bH(r|0,(C=i,i=i+8|0,c[C>>2]=B,C)|0)|0}if(l){y=x;break}ca(c[4524]|0,r|0,(C=i,i=i+8|0,c[C>>2]=B,C)|0)|0;if(n){y=x;break}ca(c[4522]|0,r|0,(C=i,i=i+8|0,c[C>>2]=B,C)|0)|0;y=x;break}else{y=x;break}}else{if(!g){x=c[s>>2]|0;aO(w|0,x|0)|0}if(l){y=v;break}aO(a[v]|0,c[4524]|0)|0;if(n){y=v;break}aO(a[v]|0,c[4522]|0)|0;y=v;break}}else{if(!g){v=c[s>>2]|0;aO(o|0,v|0)|0}if(l){y=m;break}v=a[m]|0;x=c[4524]|0;aO(v|0,x|0)|0;if(n){y=m;break}x=a[m]|0;v=c[4522]|0;aO(x|0,v|0)|0;y=m}}while(0);m=y+1|0;f=a[m]|0;}while(f<<24>>24!=0)}f=(d&32|0)!=0;m=d&1;do{if(f){if((m|0)!=0){bM(8)|0}if((d&2|0)==0){break}y=c[4524]|0;aP(5280,60,1,y|0)|0}}while(0);if((m|0)!=0){m=c[s>>2]|0;aN(m|0)|0}do{if((d&2|0)!=0){m=c[4524]|0;aN(m|0)|0;if((d&8|0)==0){break}m=c[4522]|0;aN(m|0)|0}}while(0);d=c[4524]|0;m=f^1;if(!((d|0)==0|m)){aI(d|0)|0;c[4524]=0}d=c[4522]|0;if(!((d|0)==0|m)){aI(d|0)|0;c[4522]=0}q=p?e:0;i=j;return q|0}function dF(a){a=a|0;var b=0;b=c[3882]|0;if((b|0)!=0){mt(b)}b=ms((mI(a|0)|0)+1|0)|0;c[3882]=b;mM(b|0,a|0)|0;return}function dG(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;e=i;i=i+16|0;f=e|0;g=f;h=i;i=i+12|0;i=i+7>>3<<3;j=i;i=i+12|0;i=i+7>>3<<3;k=i;i=i+192|0;mK(g|0,0,12);l=(d|0)!=0;if(l){fm(h,d,mI(d|0)|0);fc(f,h)|0;fb(h);h=(fr(f,47,-1)|0)+1|0;fz(f,0,h)|0}h=j;d=j+1|0;m=k;n=k+112|0;o=n|0;p=k|0;q=k+8|0;r=k;s=k+12|0;t=k;u=k+112|0;v=k+4|0;w=s;x=k+8|0;y=k+76|0;z=k+100|0;A=j+8|0;B=j+4|0;C=f+1|0;D=f+4|0;E=f+8|0;F=0;G=0;while(1){H=c[6288+(G<<2)>>2]|0;fm(j,H,mI(H|0)|0);H=fq(j,2648,0,17)|0;do{if((H|0)==-1){I=765}else{if(!l){J=4;K=F;break}L=a[g]|0;M=(L&1)==0?C:c[E>>2]|0;N=L&255;L=(N&1|0)==0?N>>>1:c[D>>2]|0;fA(j,H,17,M,L)|0;I=765}}while(0);if((I|0)==765){I=0;fg(j,b)|0;H=(a[h]&1)==0?d:c[A>>2]|0;c[q>>2]=8776;c[p>>2]=15380;c[u>>2]=15400;c[v>>2]=0;fX(k+112|0,w);c[k+184>>2]=0;c[k+188>>2]=-1;c[p>>2]=8756;c[o>>2]=8796;c[q>>2]=8776;ed(s);do{if((c[y>>2]|0)==0){L=bJ(H|0,296)|0;c[y>>2]=L;if((L|0)==0){I=771;break}c[z>>2]=8}else{I=771}}while(0);if((I|0)==771){I=0;H=c[(c[t>>2]|0)-12>>2]|0;ge(m+H|0,c[m+(H+16)>>2]|4)}if((c[m+((c[(c[t>>2]|0)-12>>2]|0)+16)>>2]|0)==0){H=a[h]|0;L=H&255;M=ms(((L&1|0)==0?L>>>1:c[B>>2]|0)+1|0)|0;L=(H&1)==0?d:c[A>>2]|0;mM(M|0,L|0)|0;O=1;P=M}else{O=0;P=F}c[p>>2]=8756;c[u>>2]=8796;c[x>>2]=8776;d6(s);gC(r,9676);fV(n);J=O;K=P}fb(j);if(!((J|0)==0|(J|0)==4)){Q=K;I=797;break}M=G+1|0;if(M>>>0<24){F=K;G=M}else{Q=0;I=798;break}}if((I|0)==797){fb(f);i=e;return Q|0}else if((I|0)==798){fb(f);i=e;return Q|0}return 0}function dH(a){a=a|0;c[a>>2]=8756;c[a+112>>2]=8796;c[a+8>>2]=8776;d6(a+12|0);gC(a,9676);fV(a+112|0);return}function dI(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+16|0;h=g|0;c[h>>2]=0;if((dJ(b,h,e,f,g+8|0)|0)==0){mt(c[h>>2]|0);j=0;i=g;return j|0}b=ah(c[f>>2]|0,c[e>>2]|0)|0;e=c[h>>2]|0;f=ms(b<<2)|0;c[d>>2]=f;L766:do{if((b|0)>0){d=f;k=1;l=e;while(1){c[h>>2]=l+1;a[d]=a[l]|0;m=c[h>>2]|0;c[h>>2]=m+1;a[d+1|0]=a[m]|0;m=c[h>>2]|0;c[h>>2]=m+1;a[d+2|0]=a[m]|0;a[d+3|0]=0;if((k|0)>=(b|0)){break L766}d=d+4|0;k=k+1|0;l=c[h>>2]|0}}}while(0);mt(e);j=1;i=g;return j|0}function dJ(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;h=i;i=i+136|0;j=h|0;k=h+8|0;l=h+16|0;m=h+24|0;n=h+32|0;o=h+40|0;p=h+112|0;q=h+120|0;r=h+128|0;s=bJ(b|0,2592)|0;if((s|0)==0){t=di(di(19184,2480)|0,b)|0;fW(o,t+(c[(c[t>>2]|0)-12>>2]|0)|0);b=kx(o,18912)|0;u=cz[c[(c[b>>2]|0)+28>>2]&63](b,10)|0;ko(o);g6(t,u)|0;gx(t)|0;v=0;i=h;return v|0}t=h+48|0;do{if((bb(t|0,64,s|0)|0)==0){if((br(s|0)|0)==0){break}aI(s|0)|0;u=di(19184,2400)|0;fW(n,u+(c[(c[u>>2]|0)-12>>2]|0)|0);o=kx(n,18912)|0;b=cz[c[(c[o>>2]|0)+28>>2]&63](o,10)|0;ko(n);g6(u,b)|0;gx(u)|0;c[g>>2]=0;v=0;i=h;return v|0}}while(0);do{if((a3(t|0,2344,2)|0)==0){w=1}else{if((a3(t|0,2312,2)|0)==0){w=3;break}n=di(19184,2224)|0;fW(m,n+(c[(c[n>>2]|0)-12>>2]|0)|0);u=kx(m,18912)|0;b=cz[c[(c[u>>2]|0)+28>>2]&63](u,10)|0;ko(m);g6(n,b)|0;gx(n)|0;c[g>>2]=0;v=0;i=h;return v|0}}while(0);c[g>>2]=w;c[p>>2]=0;c[q>>2]=0;c[r>>2]=0;w=0;L793:while(1){if((w|0)==0){do{if((bb(t|0,64,s|0)|0)==0){if((br(s|0)|0)!=0){break L793}}}while((a[t]|0)==35);x=b6(t|0,2176,(C=i,i=i+24|0,c[C>>2]=p,c[C+8>>2]=q,c[C+16>>2]=r,C)|0)|0}else if((w|0)==1){do{if((bb(t|0,64,s|0)|0)==0){if((br(s|0)|0)!=0){break L793}}}while((a[t]|0)==35);x=b6(t|0,2160,(C=i,i=i+16|0,c[C>>2]=q,c[C+8>>2]=r,C)|0)|0}else if((w|0)==2){do{if((bb(t|0,64,s|0)|0)==0){if((br(s|0)|0)!=0){break L793}}}while((a[t]|0)==35);x=b6(t|0,360,(C=i,i=i+8|0,c[C>>2]=r,C)|0)|0}else{y=851;break}m=x+w|0;if(m>>>0<3){w=m}else{y=863;break}}if((y|0)==851){while(1){y=0;if((bb(t|0,64,s|0)|0)!=0){y=851;continue}if((br(s|0)|0)==0){y=851}else{break}}}else if((y|0)==863){y=c[d>>2]|0;do{if((y|0)==0){t=c[p>>2]|0;w=c[q>>2]|0;x=ah(w,t)|0;c[d>>2]=ms(ah(x,c[g>>2]|0)|0)|0;c[e>>2]=t;c[f>>2]=w;z=c[d>>2]|0;A=t;B=w}else{w=c[e>>2]|0;if((w|0)==(c[p>>2]|0)){t=c[f>>2]|0;if((t|0)==(c[q>>2]|0)){z=y;A=w;B=t;break}}aI(s|0)|0;t=di(19184,2112)|0;fW(k,t+(c[(c[t>>2]|0)-12>>2]|0)|0);w=kx(k,18912)|0;x=cz[c[(c[w>>2]|0)+28>>2]&63](w,10)|0;ko(k);g6(t,x)|0;gx(t)|0;v=0;i=h;return v|0}}while(0);k=ah(B,A)|0;A=b8(z|0,1,ah(k,c[g>>2]|0)|0,s|0)|0;k=ah(c[q>>2]|0,c[p>>2]|0)|0;p=(A|0)==(ah(k,c[g>>2]|0)|0);aI(s|0)|0;if(p){v=1;i=h;return v|0}p=di(19184,2016)|0;fW(j,p+(c[(c[p>>2]|0)-12>>2]|0)|0);g=kx(j,18912)|0;k=cz[c[(c[g>>2]|0)+28>>2]&63](g,10)|0;ko(j);g6(p,k)|0;gx(p)|0;v=0;i=h;return v|0}aI(s|0)|0;s=di(19184,2400)|0;fW(l,s+(c[(c[s>>2]|0)-12>>2]|0)|0);p=kx(l,18912)|0;k=cz[c[(c[p>>2]|0)+28>>2]&63](p,10)|0;ko(l);g6(s,k)|0;gx(s)|0;v=0;i=h;return v|0}function dK(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+40|0;f=e+8|0;g=e+16|0;h=e+24|0;da(a,b);fm(h,d,mI(d|0)|0);d=c[4854]|0;if((d|0)==0){de(680,382,608);return 0}ef(f,d|0,h);if((d+4|0)==(c[f>>2]|0)){ea(g,d+12|0,h);j=(d+16|0)!=(c[g>>2]|0)|0}else{j=1}fb(h);i=e;return j|0}function dL(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+24|0;g=f+8|0;da(a,b);fm(g,d,mI(d|0)|0);d=c[4854]|0;if((d|0)==0){de(680,364,608);return 0}b=dS(d,g)|0;fb(g);if((b|0)==0){h=0;i=f;return h|0}c[e>>2]=c[b>>2];h=1;i=f;return h|0}function dM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=a|0;dQ(f,a|0,b);h=c[f>>2]|0;c[a+24>>2]=h;if((a+4|0)!=(h|0)){if((c[(c[h+28>>2]|0)+4>>2]|0)!=12504){j=0;i=d;return j|0}j=c[h+32>>2]|0;i=d;return j|0}h=my(12)|0;mK(h|0,0,12);f=h;dP(e,a+12|0,b);k=c[e>>2]|0;c[a+28>>2]=k;if((a+16|0)!=(k|0)){a=k+28|0;fc(f,a)|0;a=dN(g,b)|0;c[a>>2]=14680;c[a+4>>2]=h;j=f;i=d;return j|0}if((h|0)==0){j=0;i=d;return j|0}fb(f);mC(h);j=0;i=d;return j|0}function dN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d|0;f=dO(a,e,b)|0;g=c[f>>2]|0;if((g|0)!=0){h=g;j=h+28|0;i=d;return j|0}g=my(36)|0;k=g+16|0;if((k|0)!=0){fl(k,b)}b=g+28|0;if((b|0)!=0){c[b>>2]=0;c[g+32>>2]=0}b=c[e>>2]|0;e=g;c[g>>2]=0;c[g+4>>2]=0;c[g+8>>2]=b;c[f>>2]=e;b=a|0;k=c[c[b>>2]>>2]|0;if((k|0)==0){l=e}else{c[b>>2]=k;l=c[f>>2]|0}df(c[a+4>>2]|0,l);l=a+8|0;c[l>>2]=(c[l>>2]|0)+1;h=g;j=h+28|0;i=d;return j|0}function dO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=b+4|0;b=f|0;g=c[b>>2]|0;if((g|0)==0){c[d>>2]=f;h=b;return h|0}b=a[e]|0;f=b&255;i=(f&1|0)==0;j=f>>>1;f=(b&1)==0;b=e+1|0;k=e+8|0;l=e+4|0;e=g;while(1){g=e+16|0;if(i){m=j}else{m=c[l>>2]|0}n=g;o=a[g]|0;g=o&255;p=(g&1|0)==0;if(p){q=g>>>1}else{q=c[e+20>>2]|0}if(f){r=b}else{r=c[k>>2]|0}s=(o&1)==0;if(s){t=n+1|0}else{t=c[e+24>>2]|0}o=mL(r|0,t|0,(q>>>0<m>>>0?q:m)|0)|0;if((o|0)==0){if(m>>>0<q>>>0){u=987}}else{if((o|0)<0){u=987}}if((u|0)==987){u=0;v=e|0;o=c[v>>2]|0;if((o|0)==0){u=988;break}else{e=o;continue}}if(p){w=g>>>1}else{w=c[e+20>>2]|0}if(i){x=j}else{x=c[l>>2]|0}if(s){y=n+1|0}else{y=c[e+24>>2]|0}if(f){z=b}else{z=c[k>>2]|0}n=mL(y|0,z|0,(x>>>0<w>>>0?x:w)|0)|0;if((n|0)==0){if(w>>>0>=x>>>0){u=1004;break}}else{if((n|0)>=0){u=1004;break}}A=e+4|0;n=c[A>>2]|0;if((n|0)==0){u=1003;break}else{e=n}}if((u|0)==1003){c[d>>2]=e;h=A;return h|0}else if((u|0)==1004){c[d>>2]=e;h=d;return h|0}else if((u|0)==988){c[d>>2]=e;h=v;return h|0}return 0}function dP(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=d+4|0;d=f;g=c[f>>2]|0;do{if((g|0)!=0){f=a[e]|0;h=f&255;i=(h&1|0)==0;j=h>>>1;h=(f&1)==0;f=e+1|0;k=e+8|0;l=e+4|0;m=g;n=d;L950:while(1){o=m;while(1){p=o;q=o+16|0;r=a[q]|0;s=r&255;if((s&1|0)==0){t=s>>>1}else{t=c[o+20>>2]|0}if(i){u=j}else{u=c[l>>2]|0}if((r&1)==0){v=q+1|0}else{v=c[o+24>>2]|0}if(h){w=f}else{w=c[k>>2]|0}q=mL(v|0,w|0,(u>>>0<t>>>0?u:t)|0)|0;if((q|0)==0){if(t>>>0>=u>>>0){break}}else{if((q|0)>=0){break}}q=c[o+4>>2]|0;if((q|0)==0){x=n;break L950}else{o=q}}q=c[o>>2]|0;if((q|0)==0){x=p;break}else{m=q;n=p}}if((x|0)==(d|0)){break}if(i){y=j}else{y=c[l>>2]|0}n=x+16|0;m=a[n]|0;q=m&255;if((q&1|0)==0){z=q>>>1}else{z=c[x+20>>2]|0}if(h){A=f}else{A=c[k>>2]|0}if((m&1)==0){B=n+1|0}else{B=c[x+24>>2]|0}n=mL(A|0,B|0,(z>>>0<y>>>0?z:y)|0)|0;if((n|0)==0){if(y>>>0<z>>>0){break}}else{if((n|0)<0){break}}c[b>>2]=x;return}}while(0);c[b>>2]=d;return}function dQ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=d+4|0;d=f;g=c[f>>2]|0;do{if((g|0)!=0){f=a[e]|0;h=f&255;i=(h&1|0)==0;j=h>>>1;h=(f&1)==0;f=e+1|0;k=e+8|0;l=e+4|0;m=g;n=d;L999:while(1){o=m;while(1){p=o;q=o+16|0;r=a[q]|0;s=r&255;if((s&1|0)==0){t=s>>>1}else{t=c[o+20>>2]|0}if(i){u=j}else{u=c[l>>2]|0}if((r&1)==0){v=q+1|0}else{v=c[o+24>>2]|0}if(h){w=f}else{w=c[k>>2]|0}q=mL(v|0,w|0,(u>>>0<t>>>0?u:t)|0)|0;if((q|0)==0){if(t>>>0>=u>>>0){break}}else{if((q|0)>=0){break}}q=c[o+4>>2]|0;if((q|0)==0){x=n;break L999}else{o=q}}q=c[o>>2]|0;if((q|0)==0){x=p;break}else{m=q;n=p}}if((x|0)==(d|0)){break}if(i){y=j}else{y=c[l>>2]|0}n=x+16|0;m=a[n]|0;q=m&255;if((q&1|0)==0){z=q>>>1}else{z=c[x+20>>2]|0}if(h){A=f}else{A=c[k>>2]|0}if((m&1)==0){B=n+1|0}else{B=c[x+24>>2]|0}n=mL(A|0,B|0,(z>>>0<y>>>0?z:y)|0)|0;if((n|0)==0){if(y>>>0<z>>>0){break}}else{if((n|0)<0){break}}c[b>>2]=x;return}}while(0);c[b>>2]=d;return}function dR(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+24|0;j=h+8|0;da(b,e);fm(j,f,mI(f|0)|0);f=c[4854]|0;if((f|0)==0){de(680,364,608);return 0}e=dM(f,j)|0;fb(j);if((e|0)==0){c[g>>2]=0;k=0;i=h;return k|0}j=e;f=d[j]|0;if((f&1|0)==0){l=f>>>1}else{l=c[e+4>>2]|0}f=ms(l+1|0)|0;c[g>>2]=f;if((a[j]&1)==0){m=e+1|0}else{m=c[e+8>>2]|0}mM(f|0,m|0)|0;k=1;i=h;return k|0}function dS(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=a|0;dQ(f,a|0,b);h=c[f>>2]|0;c[a+24>>2]=h;if((a+4|0)!=(h|0)){if((c[(c[h+28>>2]|0)+4>>2]|0)!=(c[t+4>>2]|0)){j=0;i=d;return j|0}j=c[h+32>>2]|0;i=d;return j|0}h=my(4)|0;f=h;dP(e,a+12|0,b);k=c[e>>2]|0;c[a+28>>2]=k;do{if((a+16|0)!=(k|0)){if(!(dY(k+28|0,f)|0)){break}e=dN(g,b)|0;c[e>>2]=t;c[e+4>>2]=h;j=f;i=d;return j|0}}while(0);if((h|0)==0){j=0;i=d;return j|0}mC(h);j=0;i=d;return j|0}function dT(a){a=a|0;d6(a);return}function dU(a){a=a|0;var b=0;c[a>>2]=8020;c[a+60>>2]=8040;b=a+8|0;c[b>>2]=8296;fb(a+40|0);f$(b|0);gh(a,9620);fV(a+60|0);return}function dV(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=8020;e=b+(d+60)|0;c[e>>2]=8040;f=b+(d+8)|0;c[f>>2]=8296;fb(b+(d+40)|0);f$(f);gh(a,9620);fV(e);return}function dW(a){a=a|0;var b=0;c[a>>2]=8020;c[a+60>>2]=8040;b=a+8|0;c[b>>2]=8296;fb(a+40|0);f$(b|0);gh(a,9620);fV(a+60|0);mC(a);return}function dX(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=8020;e=b+(d+60)|0;c[e>>2]=8040;f=b+(d+8)|0;c[f>>2]=8296;fb(b+(d+40)|0);f$(f);gh(a,9620);fV(e);mC(a);return}function dY(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;i=i+144|0;e=d|0;f=e+60|0;g=e|0;h=e;j=e+8|0;k=j|0;c[g>>2]=15092;l=e+60|0;c[l>>2]=15112;c[e+4>>2]=0;fX(e+60|0,j);c[e+132>>2]=0;c[e+136>>2]=-1;c[g>>2]=8020;c[f>>2]=8040;f0(k);m=j|0;c[m>>2]=8296;mK(e+40|0,0,16);c[e+56>>2]=8;dz(j,a);gz(h,b)|0;b=(c[e+((c[(c[e>>2]|0)-12>>2]|0)+16)>>2]&2|0)!=0;c[g>>2]=8020;c[l>>2]=8040;c[m>>2]=8296;fb(e+40|0);f$(k);gh(h,9620);fV(f);i=d;return b|0}function dZ(a){a=a|0;c[a>>2]=8756;c[a+112>>2]=8796;c[a+8>>2]=8776;d6(a+12|0);gC(a,9676);fV(a+112|0);mC(a);return}function d_(a){a=a|0;var b=0;b=a-192+184|0;c[b>>2]=8756;a=b+112|0;c[a>>2]=8796;c[b+8>>2]=8776;d6(b+12|0);gC(b,9676);fV(a);return}function d$(a){a=a|0;var b=0;b=a-192+184|0;c[b>>2]=8756;a=b+112|0;c[a>>2]=8796;c[b+8>>2]=8776;d6(b+12|0);gC(b,9676);fV(a);mC(b);return}function d0(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=8756;e=b+(d+112)|0;c[e>>2]=8796;c[b+(d+8)>>2]=8776;d6(b+(d+12)|0);gC(a,9676);fV(e);return}function d1(a){a=a|0;d6(a);mC(a);return}function d2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;cB[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=kx(d,18608)|0;d=e;c[b+68>>2]=d;f=b+98|0;g=a[f]&1;h=cB[c[(c[e>>2]|0)+28>>2]&255](d)|0;a[f]=h&1;if((g&255|0)==(h&1|0)){return}g=b+96|0;mK(b+8|0,0,24);f=(a[g]&1)!=0;if(h){h=b+32|0;do{if(f){d=c[h>>2]|0;if((d|0)==0){break}mD(d)}}while(0);d=b+97|0;a[g]=a[d]&1;e=b+60|0;c[b+52>>2]=c[e>>2];i=b+56|0;c[h>>2]=c[i>>2];c[e>>2]=0;c[i>>2]=0;a[d]=0;return}do{if(!f){d=b+32|0;i=c[d>>2]|0;if((i|0)==(b+44|0)){break}e=c[b+52>>2]|0;c[b+60>>2]=e;c[b+56>>2]=i;a[b+97|0]=0;c[d>>2]=mz(e)|0;a[g]=1;return}}while(0);g=c[b+52>>2]|0;c[b+60>>2]=g;c[b+56>>2]=mz(g)|0;a[b+97|0]=1;return}function d3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b|0;g=b+96|0;mK(b+8|0,0,24);do{if((a[g]&1)!=0){h=c[b+32>>2]|0;if((h|0)==0){break}mD(h)}}while(0);h=b+97|0;do{if((a[h]&1)!=0){i=c[b+56>>2]|0;if((i|0)==0){break}mD(i)}}while(0);i=b+52|0;c[i>>2]=e;do{if(e>>>0>8){j=a[b+98|0]|0;if((j&1)==0|(d|0)==0){c[b+32>>2]=mz(e)|0;a[g]=1;k=j;break}else{c[b+32>>2]=d;a[g]=0;k=j;break}}else{c[b+32>>2]=b+44;c[i>>2]=8;a[g]=0;k=a[b+98|0]|0}}while(0);if((k&1)!=0){c[b+60>>2]=0;c[b+56>>2]=0;a[h]=0;return f|0}k=(e|0)<8?8:e;c[b+60>>2]=k;if((d|0)!=0&k>>>0>7){c[b+56>>2]=d;a[h]=0;return f|0}else{c[b+56>>2]=mz(k)|0;a[h]=1;return f|0}return 0}function d4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;e=i;f=d;d=i;i=i+16|0;c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];c[d+8>>2]=c[f+8>>2];c[d+12>>2]=c[f+12>>2];f=b+64|0;do{if((c[f>>2]|0)!=0){if((cB[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if((ch(c[f>>2]|0,c[d+8>>2]|0,0)|0)==0){g=d;h=c[g+4>>2]|0;j=b+72|0;c[j>>2]=c[g>>2];c[j+4>>2]=h;h=a;j=d;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];i=e;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;i=e;return}}}while(0);d=a;c[d>>2]=0;c[d+4>>2]=0;d=a+8|0;c[d>>2]=-1;c[d+4>>2]=-1;i=e;return}function d5(a){a=a|0;var b=0,d=0,e=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=8756;e=b+(d+112)|0;c[e>>2]=8796;c[b+(d+8)>>2]=8776;d6(b+(d+12)|0);gC(a,9676);fV(e);mC(a);return}function d6(b){b=b|0;var d=0,e=0;c[b>>2]=8824;d=b+64|0;e=c[d>>2]|0;do{if((e|0)!=0){d8(b)|0;if((aI(e|0)|0)!=0){break}c[d>>2]=0}}while(0);do{if((a[b+96|0]&1)!=0){d=c[b+32>>2]|0;if((d|0)==0){break}mD(d)}}while(0);do{if((a[b+97|0]&1)!=0){d=c[b+56>>2]|0;if((d|0)==0){break}mD(d)}}while(0);f$(b|0);return}function d7(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;g=c[b+68>>2]|0;if((g|0)==0){h=ck(4)|0;l7(h);bE(h|0,13328,164)}h=cB[c[(c[g>>2]|0)+24>>2]&255](g)|0;g=b+64|0;do{if((c[g>>2]|0)!=0){i=(h|0)>0;if(!(i|(d|0)==0&(e|0)==0)){break}if((cB[c[(c[b>>2]|0)+24>>2]&255](b)|0)!=0){break}if(f>>>0>=3){j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}j=c[g>>2]|0;if(i){i=mY(h,(h|0)<0?-1:0,d,e)|0;k=i}else{k=0}if((ch(j|0,k|0,f|0)|0)==0){j=bi(c[g>>2]|0)|0;i=b+72|0;l=c[i+4>>2]|0;m=a;c[m>>2]=c[i>>2];c[m+4>>2]=l;l=a+8|0;c[l>>2]=j;c[l+4>>2]=(j|0)<0?-1:0;return}else{j=a;c[j>>2]=0;c[j+4>>2]=0;j=a+8|0;c[j>>2]=-1;c[j+4>>2]=-1;return}}}while(0);b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;return}function d8(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=f;h=b+64|0;if((c[h>>2]|0)==0){j=0;i=d;return j|0}k=b+68|0;l=c[k>>2]|0;if((l|0)==0){m=ck(4)|0;l7(m);bE(m|0,13328,164);return 0}m=b+92|0;n=c[m>>2]|0;do{if((n&16|0)==0){if((n&8|0)==0){break}o=b+80|0;p=c[o+4>>2]|0;c[f>>2]=c[o>>2];c[f+4>>2]=p;do{if((a[b+98|0]&1)==0){p=cB[c[(c[l>>2]|0)+24>>2]&255](l)|0;o=b+36|0;q=c[o>>2]|0;r=(c[b+40>>2]|0)-q|0;if((p|0)>0){s=(ah((c[b+16>>2]|0)-(c[b+12>>2]|0)|0,p)|0)+r|0;t=0;break}p=c[b+12>>2]|0;if((p|0)==(c[b+16>>2]|0)){s=r;t=0;break}u=c[k>>2]|0;v=b+32|0;w=cL[c[(c[u>>2]|0)+32>>2]&31](u,g,c[v>>2]|0,q,p-(c[b+8>>2]|0)|0)|0;s=r-w+(c[o>>2]|0)-(c[v>>2]|0)|0;t=1}else{s=(c[b+16>>2]|0)-(c[b+12>>2]|0)|0;t=0}}while(0);if((ch(c[h>>2]|0,-s|0,1)|0)!=0){j=-1;i=d;return j|0}if(t){v=b+72|0;o=c[f+4>>2]|0;c[v>>2]=c[f>>2];c[v+4>>2]=o}o=c[b+32>>2]|0;c[b+40>>2]=o;c[b+36>>2]=o;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[m>>2]=0}else{do{if((c[b+24>>2]|0)!=(c[b+20>>2]|0)){if((cz[c[(c[b>>2]|0)+52>>2]&63](b,-1)|0)==-1){j=-1}else{break}i=d;return j|0}}while(0);o=b+72|0;v=b+32|0;w=b+52|0;while(1){r=c[k>>2]|0;p=c[v>>2]|0;q=cL[c[(c[r>>2]|0)+20>>2]&31](r,o,p,p+(c[w>>2]|0)|0,e)|0;p=c[v>>2]|0;r=(c[e>>2]|0)-p|0;if((aP(p|0,1,r|0,c[h>>2]|0)|0)!=(r|0)){j=-1;x=1388;break}if((q|0)==2){j=-1;x=1390;break}else if((q|0)!=1){x=1374;break}}if((x|0)==1374){if((aN(c[h>>2]|0)|0)==0){break}else{j=-1}i=d;return j|0}else if((x|0)==1388){i=d;return j|0}else if((x|0)==1390){i=d;return j|0}}}while(0);j=0;i=d;return j|0}function d9(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((c[b+64>>2]|0)==0){e=-1;return e|0}f=b+12|0;g=c[f>>2]|0;if((c[b+8>>2]|0)>>>0>=g>>>0){e=-1;return e|0}if((d|0)==-1){c[f>>2]=g-1;e=0;return e|0}h=g-1|0;do{if((c[b+88>>2]&16|0)==0){if((d<<24>>24|0)==(a[h]|0)){break}else{e=-1}return e|0}}while(0);c[f>>2]=h;a[h]=d&255;e=d;return e|0}function ea(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=d+4|0;d=f;g=c[f>>2]|0;do{if((g|0)!=0){f=a[e]|0;h=f&255;i=(h&1|0)==0;j=h>>>1;h=(f&1)==0;f=e+1|0;k=e+8|0;l=e+4|0;m=g;n=d;L1279:while(1){o=m;while(1){p=o;q=o+16|0;r=a[q]|0;s=r&255;if((s&1|0)==0){t=s>>>1}else{t=c[o+20>>2]|0}if(i){u=j}else{u=c[l>>2]|0}if((r&1)==0){v=q+1|0}else{v=c[o+24>>2]|0}if(h){w=f}else{w=c[k>>2]|0}q=mL(v|0,w|0,(u>>>0<t>>>0?u:t)|0)|0;if((q|0)==0){if(t>>>0>=u>>>0){break}}else{if((q|0)>=0){break}}q=c[o+4>>2]|0;if((q|0)==0){x=n;break L1279}else{o=q}}q=c[o>>2]|0;if((q|0)==0){x=p;break}else{m=q;n=p}}if((x|0)==(d|0)){break}if(i){y=j}else{y=c[l>>2]|0}n=x+16|0;m=a[n]|0;q=m&255;if((q&1|0)==0){z=q>>>1}else{z=c[x+20>>2]|0}if(h){A=f}else{A=c[k>>2]|0}if((m&1)==0){B=n+1|0}else{B=c[x+24>>2]|0}n=mL(A|0,B|0,(z>>>0<y>>>0?z:y)|0)|0;if((n|0)==0){if(y>>>0<z>>>0){break}}else{if((n|0)<0){break}}c[b>>2]=x;return}}while(0);c[b>>2]=d;return}function eb(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=b+64|0;if((c[h>>2]|0)==0){j=-1;i=e;return j|0}k=b+92|0;if((c[k>>2]&8|0)==0){c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;if((a[b+98|0]&1)==0){l=c[b+56>>2]|0;m=l+(c[b+60>>2]|0)|0;c[b+8>>2]=l;c[b+12>>2]=m;c[b+16>>2]=m;n=m}else{m=c[b+32>>2]|0;l=m+(c[b+52>>2]|0)|0;c[b+8>>2]=m;c[b+12>>2]=l;c[b+16>>2]=l;n=l}c[k>>2]=8;o=1;p=n;q=b+12|0}else{n=b+12|0;o=0;p=c[n>>2]|0;q=n}if((p|0)==0){n=f+1|0;c[b+8>>2]=f;c[q>>2]=n;c[b+16>>2]=n;r=n}else{r=p}p=c[b+16>>2]|0;if(o){s=0}else{o=(p-(c[b+8>>2]|0)|0)/2|0;s=o>>>0>4?4:o}o=b+16|0;do{if((r|0)==(p|0)){n=b+8|0;mN(c[n>>2]|0,r+(-s|0)|0,s|0);if((a[b+98|0]&1)!=0){k=c[n>>2]|0;l=b8(k+s|0,1,(c[o>>2]|0)-s-k|0,c[h>>2]|0)|0;if((l|0)==0){t=-1;u=n;break}k=c[n>>2]|0;m=k+s|0;c[q>>2]=m;c[o>>2]=k+(l+s);t=d[m]|0;u=n;break}m=b+32|0;l=b+36|0;k=c[l>>2]|0;v=b+40|0;mN(c[m>>2]|0,k|0,(c[v>>2]|0)-k|0);k=c[m>>2]|0;w=k+((c[v>>2]|0)-(c[l>>2]|0))|0;c[l>>2]=w;if((k|0)==(b+44|0)){x=8}else{x=c[b+52>>2]|0}y=k+x|0;c[v>>2]=y;k=b+60|0;z=(c[k>>2]|0)-s|0;A=y-w|0;y=b+72|0;B=y;C=b+80|0;D=c[B+4>>2]|0;c[C>>2]=c[B>>2];c[C+4>>2]=D;D=b8(w|0,1,(A>>>0<z>>>0?A:z)|0,c[h>>2]|0)|0;if((D|0)==0){t=-1;u=n;break}z=c[b+68>>2]|0;if((z|0)==0){A=ck(4)|0;l7(A);bE(A|0,13328,164);return 0}A=(c[l>>2]|0)+D|0;c[v>>2]=A;D=c[n>>2]|0;if((cG[c[(c[z>>2]|0)+16>>2]&31](z,y,c[m>>2]|0,A,l,D+s|0,D+(c[k>>2]|0)|0,g)|0)==3){k=c[m>>2]|0;m=c[v>>2]|0;c[n>>2]=k;c[q>>2]=k;c[o>>2]=m;t=d[k]|0;u=n;break}k=c[g>>2]|0;m=c[n>>2]|0;v=m+s|0;if((k|0)==(v|0)){t=-1;u=n;break}c[n>>2]=m;c[q>>2]=v;c[o>>2]=k;t=d[v]|0;u=n}else{t=d[r]|0;u=b+8|0}}while(0);if((c[u>>2]|0)!=(f|0)){j=t;i=e;return j|0}c[u>>2]=0;c[q>>2]=0;c[o>>2]=0;j=t;i=e;return j|0}function ec(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+24|0;f=e|0;g=e+8|0;h=e+16|0;j=b+64|0;if((c[j>>2]|0)==0){k=-1;i=e;return k|0}l=b+92|0;if((c[l>>2]&16|0)==0){c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;m=c[b+52>>2]|0;do{if(m>>>0>8){if((a[b+98|0]&1)==0){n=c[b+56>>2]|0;o=n+((c[b+60>>2]|0)-1)|0;c[b+24>>2]=n;c[b+20>>2]=n;c[b+28>>2]=o;p=n;q=o;break}else{o=c[b+32>>2]|0;n=o+(m-1)|0;c[b+24>>2]=o;c[b+20>>2]=o;c[b+28>>2]=n;p=o;q=n;break}}else{c[b+24>>2]=0;c[b+20>>2]=0;c[b+28>>2]=0;p=0;q=0}}while(0);c[l>>2]=16;r=p;s=q;t=b+20|0;u=b+28|0}else{q=b+20|0;p=b+28|0;r=c[q>>2]|0;s=c[p>>2]|0;t=q;u=p}p=(d|0)==-1;q=b+24|0;l=c[q>>2]|0;if(p){v=r;w=l}else{if((l|0)==0){c[q>>2]=f;c[t>>2]=f;c[u>>2]=f+1;x=f}else{x=l}a[x]=d&255;x=(c[q>>2]|0)+1|0;c[q>>2]=x;v=c[t>>2]|0;w=x}x=b+24|0;if((w|0)!=(v|0)){L1389:do{if((a[b+98|0]&1)==0){q=b+32|0;l=c[q>>2]|0;c[g>>2]=l;f=b+68|0;m=c[f>>2]|0;if((m|0)==0){y=ck(4)|0;z=y;l7(z);bE(y|0,13328,164);return 0}n=b+72|0;o=b+52|0;A=m;m=v;B=w;C=l;while(1){l=cG[c[(c[A>>2]|0)+12>>2]&31](A,n,m,B,h,C,C+(c[o>>2]|0)|0,g)|0;D=c[t>>2]|0;if((c[h>>2]|0)==(D|0)){k=-1;E=1509;break}if((l|0)==3){E=1497;break}if(l>>>0>=2){k=-1;E=1511;break}F=c[q>>2]|0;G=(c[g>>2]|0)-F|0;if((aP(F|0,1,G|0,c[j>>2]|0)|0)!=(G|0)){k=-1;E=1512;break}if((l|0)!=1){break L1389}l=c[h>>2]|0;G=c[x>>2]|0;c[t>>2]=l;c[u>>2]=G;F=l+(G-l)|0;c[x>>2]=F;G=c[f>>2]|0;if((G|0)==0){E=1514;break}A=G;m=l;B=F;C=c[q>>2]|0}if((E|0)==1509){i=e;return k|0}else if((E|0)==1511){i=e;return k|0}else if((E|0)==1512){i=e;return k|0}else if((E|0)==1514){y=ck(4)|0;z=y;l7(z);bE(y|0,13328,164);return 0}else if((E|0)==1497){q=(c[x>>2]|0)-D|0;if((aP(D|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}}else{q=w-v|0;if((aP(v|0,1,q|0,c[j>>2]|0)|0)==(q|0)){break}else{k=-1}i=e;return k|0}}while(0);c[x>>2]=r;c[t>>2]=r;c[u>>2]=s}k=p?0:d;i=e;return k|0}function ed(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+16|0;e=d|0;f=d+8|0;f0(b|0);c[b>>2]=8824;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=0;g=b+68|0;h=b+4|0;mK(b+52|0,0,47);kn(e,h);j=kp(e,18608)|0;ko(e);if(j){kn(f,h);c[g>>2]=kx(f,18608)|0;ko(f);f=c[g>>2]|0;a[b+98|0]=(cB[c[(c[f>>2]|0)+28>>2]&255](f)|0)&1}cA[c[(c[b>>2]|0)+12>>2]&63](b,0,4096)|0;i=d;return}function ee(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+16|0;g=f|0;h=b[d>>1]|0;j=h&31;k=j<<3|j>>>2;j=g;a[g]=k&255;l=(h&65535)>>>5&63;m=l<<2|l>>>4;a[j+1|0]=m&255;l=(h&65535)>>>11&65535;n=l<<3|l>>>2;a[j+2|0]=n&255;a[j+3|0]=-1;j=b[d+2>>1]|0;l=(j&65535)>>>11&65535;o=l<<3|l>>>2;l=g+4|0;p=l;a[p+2|0]=o&255;q=(j&65535)>>>5&63;r=q<<2|q>>>4;a[p+1|0]=r&255;q=j&31;s=q<<3|q>>>2;a[l]=s&255;a[p+3|0]=-1;if((h&65535)>(j&65535)){j=g+8|0;h=j;a[h+2|0]=(((o+(n<<1)|0)>>>0)/3|0)&255;a[h+1|0]=((((m<<1)+r|0)>>>0)/3|0)&255;a[j]=((((k<<1)+s|0)>>>0)/3|0)&255;a[h+3|0]=-1;h=g+12|0;j=h;a[j+2|0]=((((o<<1)+n|0)>>>0)/3|0)&255;a[j+1|0]=((((r<<1)+m|0)>>>0)/3|0)&255;a[h]=((((s<<1)+k|0)>>>0)/3|0)&255;a[j+3|0]=-1}else{j=g+8|0;h=j;a[h+2|0]=(o+n|0)>>>1&255;a[h+1|0]=(r+m|0)>>>1&255;a[j]=(s+k|0)>>>1&255;a[h+3|0]=-1;h=g+12|0;k=h;a[k+2|0]=0;a[k+1|0]=0;a[h]=0;a[k+3|0]=0}k=d+4|0;d=0;do{c[e+(d<<2)>>2]=c[g+(((c[k>>2]|0)>>>(d<<1>>>0)&3)<<2)>>2];d=d+1|0;}while((d|0)<16);i=f;return}function ef(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=d+4|0;d=f;g=c[f>>2]|0;do{if((g|0)!=0){f=a[e]|0;h=f&255;i=(h&1|0)==0;j=h>>>1;h=(f&1)==0;f=e+1|0;k=e+8|0;l=e+4|0;m=g;n=d;L1434:while(1){o=m;while(1){p=o;q=o+16|0;r=a[q]|0;s=r&255;if((s&1|0)==0){t=s>>>1}else{t=c[o+20>>2]|0}if(i){u=j}else{u=c[l>>2]|0}if((r&1)==0){v=q+1|0}else{v=c[o+24>>2]|0}if(h){w=f}else{w=c[k>>2]|0}q=mL(v|0,w|0,(u>>>0<t>>>0?u:t)|0)|0;if((q|0)==0){if(t>>>0>=u>>>0){break}}else{if((q|0)>=0){break}}q=c[o+4>>2]|0;if((q|0)==0){x=n;break L1434}else{o=q}}q=c[o>>2]|0;if((q|0)==0){x=p;break}else{m=q;n=p}}if((x|0)==(d|0)){break}if(i){y=j}else{y=c[l>>2]|0}n=x+16|0;m=a[n]|0;q=m&255;if((q&1|0)==0){z=q>>>1}else{z=c[x+20>>2]|0}if(h){A=f}else{A=c[k>>2]|0}if((m&1)==0){B=n+1|0}else{B=c[x+24>>2]|0}n=mL(A|0,B|0,(z>>>0<y>>>0?z:y)|0)|0;if((n|0)==0){if(y>>>0<z>>>0){break}}else{if((n|0)<0){break}}c[b>>2]=x;return}}while(0);c[b>>2]=d;return}function eg(a,b){a=a|0;b=b|0;var c=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;c=i;i=i+128|0;e=c|0;f=c+64|0;if((mL(a|0,b|0,8)|0)==0){g=0;i=c;return g|0}ee(a,e|0);ee(b,f|0);b=0;a=0;while(1){h=e+(b<<2)|0;j=h;k=f+(b<<2)|0;l=k;m=(d[j+2|0]|0)-(d[l+2|0]|0)|0;n=(d[j+1|0]|0)-(d[l+1|0]|0)|0;l=(d[h]|0)-(d[k]|0)|0;k=ah(m,m)|0;m=ah(n,n)|0;n=k+a+m+(ah(l,l)|0)|0;l=b+1|0;if((l|0)<16){b=l;a=n}else{g=n;break}}i=c;return g|0}function eh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0.0,ac=0,ad=0,ae=0,af=0,ag=0.0,ai=0.0,aj=0.0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0.0,aw=0.0,ax=0,ay=0,az=0,aA=0.0,aB=0.0,aC=0.0;e=i;i=i+5384|0;f=e|0;g=e+64|0;j=e+80|0;k=e+88|0;l=e+96|0;m=e+104|0;n=e+112|0;o=e+120|0;p=e+4216|0;q=e+4224|0;r=e+4232|0;s=e+5256|0;dF(4224);dE(3,0,3200,(C=i,i=i+8|0,c[C>>2]=c[d>>2],C)|0)|0;if((dR(b,d,2304,m)|0)==0){t=c[38]|0}else{e=c[m>>2]|0;c[38]=e;t=e}e=dG(t,c[d>>2]|0)|0;if((e|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=62,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}dI(e,15520,15464,15512)|0;if((c[3880]|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=64,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}t=c[3866]|0;m=c[3878]|0;dE(3,0,1128,(C=i,i=i+24|0,c[C>>2]=e,c[C+8>>2]=t,c[C+16>>2]=m,C)|0)|0;m=c[3866]|0;t=c[3878]|0;u=ms(ah(m<<2,t)|0)|0;v=u;if(t>>>0>3){w=0;do{if(m>>>0>3){x=w<<2;y=c[3880]|0;z=0;do{A=0;do{B=m>>>2;E=c[y+(((ah(B,((A|0)/4|0)+x|0)|0)+z<<2|A&3)<<2)>>2]|0;c[v+((((ah(m,w)|0)>>>2)+z<<4)+A<<2)>>2]=E;A=A+1|0;}while((A|0)<16);z=z+1|0;}while(z>>>0<B>>>0)}w=w+1|0;}while(w>>>0<t>>>2>>>0)}t=bg(0,4,0,0,0,l|0)|0;w=c[l>>2]|0;if((w|0)!=0){dE(19,w,3736,(C=i,i=i+16|0,c[C>>2]=84,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}if((dK(b,d,760)|0)==0){F=c3(t)|0}else{c[n>>2]=0;dL(b,d,760,n)|0;F=c5(t,c[n>>2]|0)|0}c9(3,F);n=cd(t|0,F|0,0,0,l|0)|0;F=c[l>>2]|0;if((F|0)!=0){dE(19,F,3736,(C=i,i=i+16|0,c[C>>2]=99,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}F=f;mK(F|0,0,64);w=f|0;B=f+4|0;m=f+8|0;v=f+12|0;z=f+16|0;x=f+20|0;y=f+24|0;A=f+28|0;E=f+32|0;G=f+36|0;H=f+40|0;I=f+44|0;J=f+48|0;K=f+52|0;L=f+56|0;M=f+60|0;N=15;O=0;P=-14;while(1){Q=N;do{c[f+(Q<<2)>>2]=2;Q=Q+1|0;}while((Q|0)<16);Q=(N|0)==0?15:16;if((Q|0)<(N|0)){R=O}else{S=Q;T=O;while(1){if((S|0)<16){c[f+(S<<2)>>2]=1}c[o+(T<<2)>>2]=c[B>>2]<<2|c[w>>2]|c[m>>2]<<4|c[v>>2]<<6|c[z>>2]<<8|c[x>>2]<<10|c[y>>2]<<12|c[A>>2]<<14|c[E>>2]<<16|c[G>>2]<<18|c[H>>2]<<20|c[I>>2]<<22|c[J>>2]<<24|c[K>>2]<<26|c[L>>2]<<28|c[M>>2]<<30;U=S-1|0;if((U|0)<(N|0)){break}else{S=U;T=T+1|0}}R=O+P+Q|0}if((N|0)>0){N=N-1|0;O=R;P=P+1|0}else{break}}c[o+(R<<2)>>2]=697685;c[o+(R+1<<2)>>2]=697685;c[o+(R+2<<2)>>2]=697685;c[o+(R+3<<2)>>2]=697685;c[o+(R+4<<2)>>2]=697685;c[o+(R+5<<2)>>2]=697685;c[o+(R+6<<2)>>2]=697685;c[o+(R+7<<2)>>2]=697685;c[o+(R+8<<2)>>2]=697685;mK(F|0,0,64);F=15;P=R+9|0;while(1){R=F;do{c[f+(R<<2)>>2]=2;R=R+1|0;}while((R|0)<16);R=(F|0)==0?15:16;if((R|0)<(F|0)){V=P}else{Q=R;R=P;while(1){if((Q|0)<16){O=Q;do{c[f+(O<<2)>>2]=3;O=O+1|0;}while((O|0)<16)}O=(Q|0)==0?15:16;if((O|0)<(Q|0)){W=R}else{N=R;M=O;while(1){if((M|0)<16){c[f+(M<<2)>>2]=1;X=0;Y=0;Z=0}else{X=0;Y=0;Z=0}do{O=c[f+(Z<<2)>>2]|0;X=O<<(Z<<1)|X;Y=(O|0)==3|Y;Z=Z+1|0;}while((Z|0)<16);if(Y){c[o+(N<<2)>>2]=X;_=N+1|0}else{_=N}O=M-1|0;if((O|0)<(Q|0)){W=_;break}else{N=_;M=O}}}M=Q-1|0;if((M|0)<(F|0)){V=W;break}else{Q=M;R=W}}}if((F|0)>0){F=F-1|0;P=V}else{$=V;aa=0;break}}while(1){c[o+($<<2)>>2]=11206485;V=aa+1|0;if((V|0)<49){$=$+1|0;aa=V}else{break}}aa=g|0;c[aa>>2]=b$(t|0,36,0,4096,o|0,l|0)|0;o=c[l>>2]|0;if((o|0)!=0){dE(19,o,3736,(C=i,i=i+16|0,c[C>>2]=110,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}o=g+4|0;c[o>>2]=b$(t|0,4,0,ah(c[3866]<<2,c[3878]|0)|0,0,l|0)|0;$=c[l>>2]|0;if(($|0)!=0){dE(19,$,3736,(C=i,i=i+16|0,c[C>>2]=115,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}$=ah((c[3866]|0)>>>2<<3,(c[3878]|0)>>>2)|0;V=g+8|0;c[V>>2]=b$(t|0,2,0,$|0,0,l|0)|0;P=c[l>>2]|0;if((P|0)!=0){dE(19,P,3736,(C=i,i=i+16|0,c[C>>2]=122,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}P=ms($)|0;F=dG(424,c[d>>2]|0)|0;if((F|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=129,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}W=c4(F,15536,p)|0;c[q>>2]=W;if((W|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=131,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}W=bl(t|0,1,q|0,p|0,l|0)|0;p=c[l>>2]|0;if((p|0)!=0){dE(19,p,3736,(C=i,i=i+16|0,c[C>>2]=136,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}p=ce(W|0,0,0,5808,0,0)|0;c[l>>2]=p;do{if((p|0)!=0){dE(19,p,5520,(C=i,i=i+16|0,c[C>>2]=1792,c[C+8>>2]=143,C)|0)|0;c7(W,c2(t)|0);c6(W,c2(t)|0,5184);F=c[l>>2]|0;if((F|0)==0){break}dE(19,F,3736,(C=i,i=i+16|0,c[C>>2]=146,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}}while(0);p=cm(W|0,5032,l|0)|0;F=c[l>>2]|0;if((F|0)!=0){dE(19,F,3736,(C=i,i=i+16|0,c[C>>2]=151,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}c[l>>2]=bR(p|0,0,4,g|0)|0;g=bR(p|0,1,4,o|0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,2,4,V|0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,3,256,0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,4,256,0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,5,256,0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,6,384,0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,7,640,0)|0;c[l>>2]=c[l>>2]|g;g=bR(p|0,8,64,0)|0;F=c[l>>2]|g;c[l>>2]=F;if((F|0)!=0){dE(19,F,3736,(C=i,i=i+16|0,c[C>>2]=163,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}F=c[3878]|0;dE(3,0,4872,(C=i,i=i+16|0,c[C>>2]=c[3866],c[C+8>>2]=F,C)|0)|0;F=c[o>>2]|0;bz(n|0,F|0,0,0,ah(c[3866]<<2,c[3878]|0)|0,u|0,0,0,0)|0;u=j|0;c[u>>2]=ah(c[3866]<<2,c[3878]|0)|0;j=k|0;c[j>>2]=64;k=bO(n|0,p|0,1,0,u|0,j|0,0,0,0)|0;c[l>>2]=k;if((k|0)!=0){dE(19,k,3736,(C=i,i=i+16|0,c[C>>2]=186,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}k=bV(n|0,c[V>>2]|0,1,0,$|0,P|0,0,0,0)|0;c[l>>2]=k;if((k|0)!=0){dE(19,k,3736,(C=i,i=i+16|0,c[C>>2]=199,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}k=r|0;mM(k|0,e|0)|0;l=r+((mI(e|0)|0)-3)|0;D=7562340;a[l]=D&255;D=D>>8;a[l+1|0]=D&255;D=D>>8;a[l+2|0]=D&255;D=D>>8;a[l+3|0]=D&255;l=bJ(k|0,4728)|0;if((l|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=213,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}c[s>>2]=542327876;c[s+4>>2]=124;c[s+8>>2]=528391;c[s+12>>2]=c[3878];c[s+16>>2]=c[3866];c[s+20>>2]=$;mK(s+24|0,0,52);c[s+76>>2]=32;c[s+80>>2]=4;c[s+84>>2]=827611204;mK(s+88|0,0,20);c[s+108>>2]=4096;mK(s+112|0,0,16);aP(s|0,128,1,l|0)|0;aP(P|0,$|0,1,l|0)|0;aI(l|0)|0;dE(3,0,4560,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;l=dG(c[18]|0,c[d>>2]|0)|0;if((l|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=247,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}$=bJ(l|0,4480)|0;if(($|0)==0){dE(19,0,3736,(C=i,i=i+16|0,c[C>>2]=255,c[C+8>>2]=1792,C)|0)|0;dE(35,0,3624,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;bj(1);return 0}ch($|0,128,0)|0;l=ah((c[3866]|0)>>>2<<3,(c[3878]|0)>>>2)|0;s=ms(l)|0;b8(s|0,l|0,1,$|0)|0;aI($|0)|0;$=c[3878]|0;if(($|0)==0){ab=0.0;ac=0;ad=c[3866]|0;ae=ac*3|0;af=ah(ae,ad)|0;ag=+(af>>>0>>>0);ai=ab/ag;aj=ai;ak=dE(3,0,4320,(C=i,i=i+8|0,h[C>>3]=aj,C)|0)|0;al=ai<=.019999999552965164;am=al?4136:4096;an=dE(3,0,4248,(C=i,i=i+8|0,c[C>>2]=am,C)|0)|0;c8(aa,3);ao=bF(p|0)|0;ap=bP(W|0)|0;aq=aT(n|0)|0;ar=a8(t|0)|0;as=c[q>>2]|0;mt(as);at=c[3880]|0;au=at;mt(au);ei(b,d);return 0}l=P;P=s;s=c[3866]|0;av=0.0;k=0;e=s;r=$;$=s;while(1){if((e|0)==0){aw=av;ax=0;ay=r;az=$}else{s=k>>>2;aA=av;V=0;j=e;do{u=V>>>2;F=(ah(j>>>2,s)|0)+u|0;o=l+(F<<3)|0;g=P+(F<<3)|0;aB=+(eg(o,g)|0);if(aB!=0.0){eg(o,g)|0;aC=aB*.0625/3.0;dE(3,0,4408,(C=i,i=i+24|0,c[C>>2]=u,c[C+8>>2]=s,h[C+16>>3]=aC,C)|0)|0}aA=aA+aB;V=V+4|0;j=c[3866]|0;}while(V>>>0<j>>>0);aw=aA;ax=j;ay=c[3878]|0;az=j}V=k+4|0;if(V>>>0<ay>>>0){av=aw;k=V;e=ax;r=ay;$=az}else{ab=aw;ac=ay;ad=az;break}}ae=ac*3|0;af=ah(ae,ad)|0;ag=+(af>>>0>>>0);ai=ab/ag;aj=ai;ak=dE(3,0,4320,(C=i,i=i+8|0,h[C>>3]=aj,C)|0)|0;al=ai<=.019999999552965164;am=al?4136:4096;an=dE(3,0,4248,(C=i,i=i+8|0,c[C>>2]=am,C)|0)|0;c8(aa,3);ao=bF(p|0)|0;ap=bP(W|0)|0;aq=aT(n|0)|0;ar=a8(t|0)|0;as=c[q>>2]|0;mt(as);at=c[3880]|0;au=at;mt(au);ei(b,d);return 0}function ei(a,b){a=a|0;b=b|0;if((dK(a,b,4048)|0)==0){dE(35,0,3944,(C=i,i=i+1|0,i=i+7>>3<<3,c[C>>2]=0,C)|0)|0;a=c[o>>2]|0;a6(a|0)|0;bj(0)}else{a=c[b>>2]|0;dE(35,0,3872,(C=i,i=i+8|0,c[C>>2]=a,C)|0)|0;bj(0)}}function ej(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;eL(18352,c[o>>2]|0,18408);c[4818]=8708;c[4820]=8728;c[4819]=0;h=c[2174]|0;fX(19272+h|0,18352);c[h+19344>>2]=0;c[h+19348>>2]=-1;h=c[s>>2]|0;f0(18256);c[4564]=9e3;c[4572]=h;kn(g,18260);h=kx(g,18608)|0;j=h;ko(g);c[4573]=j;c[4574]=18416;a[18300]=(cB[c[(c[h>>2]|0)+28>>2]&255](j)|0)&1;c[4752]=8612;c[4753]=8632;j=c[2150]|0;fX(19008+j|0,18256);h=j+72|0;c[19008+h>>2]=0;g=j+76|0;c[19008+g>>2]=-1;k=c[r>>2]|0;f0(18304);c[4576]=9e3;c[4584]=k;kn(f,18308);k=kx(f,18608)|0;l=k;ko(f);c[4585]=l;c[4586]=18424;a[18348]=(cB[c[(c[k>>2]|0)+28>>2]&255](l)|0)&1;c[4796]=8612;c[4797]=8632;fX(19184+j|0,18304);c[19184+h>>2]=0;c[19184+g>>2]=-1;l=c[(c[(c[4796]|0)-12>>2]|0)+19208>>2]|0;c[4774]=8612;c[4775]=8632;fX(19096+j|0,l);c[19096+h>>2]=0;c[19096+g>>2]=-1;c[(c[(c[4818]|0)-12>>2]|0)+19344>>2]=19008;g=(c[(c[4796]|0)-12>>2]|0)+19188|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[4796]|0)-12>>2]|0)+19256>>2]=19008;ep(18200,c[o>>2]|0,18432);c[4730]=8660;c[4732]=8680;c[4731]=0;g=c[2162]|0;fX(18920+g|0,18200);c[g+18992>>2]=0;c[g+18996>>2]=-1;g=c[s>>2]|0;f7(18104);c[4526]=8928;c[4534]=g;kn(e,18108);g=kx(e,18600)|0;h=g;ko(e);c[4535]=h;c[4536]=18440;a[18148]=(cB[c[(c[g>>2]|0)+28>>2]&255](h)|0)&1;c[4660]=8564;c[4661]=8584;h=c[2138]|0;fX(18640+h|0,18104);g=h+72|0;c[18640+g>>2]=0;e=h+76|0;c[18640+e>>2]=-1;l=c[r>>2]|0;f7(18152);c[4538]=8928;c[4546]=l;kn(d,18156);l=kx(d,18600)|0;j=l;ko(d);c[4547]=j;c[4548]=18448;a[18196]=(cB[c[(c[l>>2]|0)+28>>2]&255](j)|0)&1;c[4704]=8564;c[4705]=8584;fX(18816+h|0,18152);c[18816+g>>2]=0;c[18816+e>>2]=-1;j=c[(c[(c[4704]|0)-12>>2]|0)+18840>>2]|0;c[4682]=8564;c[4683]=8584;fX(18728+h|0,j);c[18728+g>>2]=0;c[18728+e>>2]=-1;c[(c[(c[4730]|0)-12>>2]|0)+18992>>2]=18640;e=(c[(c[4704]|0)-12>>2]|0)+18820|0;c[e>>2]=c[e>>2]|8192;c[(c[(c[4704]|0)-12>>2]|0)+18888>>2]=18640;i=b;return}function ek(a){a=a|0;f6(a|0);return}function el(a){a=a|0;f6(a|0);mC(a);return}function em(b,d){b=b|0;d=d|0;var e=0;cB[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=kx(d,18600)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cB[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function en(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cL[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aP(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=1706;break}if((l|0)==2){m=-1;n=1707;break}else if((l|0)!=1){n=1703;break}}if((n|0)==1703){m=((aN(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==1707){i=b;return m|0}else if((n|0)==1706){i=b;return m|0}return 0}function eo(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+4|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;c[g>>2]=d;c[m>>2]=l;L1655:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=cG[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=1725;break}if((y|0)==3){B=1714;break}if(y>>>0>=2){A=-1;B=1724;break}x=(c[h>>2]|0)-t|0;if((aP(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=1727;break}if((y|0)!=1){break L1655}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y>>2<<2)|0;c[m>>2]=C;v=y;w=C}if((B|0)==1714){if((aP(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==1724){i=e;return A|0}else if((B|0)==1727){i=e;return A|0}else if((B|0)==1725){i=e;return A|0}}else{if((aP(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function ep(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;f7(b|0);c[b>>2]=9328;c[b+32>>2]=d;c[b+40>>2]=e;kn(g,b+4|0);e=kx(g,18600)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){ko(g);i=f;return}jD(248);ko(g);i=f;return}function eq(a){a=a|0;f6(a|0);return}function er(a){a=a|0;f6(a|0);mC(a);return}function es(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=kx(d,18600)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}jD(248);return}function et(a){a=a|0;return ew(a,0)|0}function eu(a){a=a|0;return ew(a,1)|0}function ev(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}c[h>>2]=d;k=c[b+36>>2]|0;l=f|0;m=cG[c[(c[k>>2]|0)+12>>2]&31](k,c[b+40>>2]|0,h,h+4|0,e+24|0,l,f+8|0,g)|0;if((m|0)==3){a[l]=d&255;c[g>>2]=f+1}else if((m|0)==2|(m|0)==1){j=-1;i=e;return j|0}m=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=l>>>0){j=d;n=1753;break}f=b-1|0;c[g>>2]=f;if((b2(a[f]|0,c[m>>2]|0)|0)==-1){j=-1;n=1754;break}}if((n|0)==1753){i=e;return j|0}else if((n|0)==1754){i=e;return j|0}return 0}function ew(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=c[b+44>>2]|0;l=(k|0)>1?k:1;L1705:do{if((l|0)>0){k=b+32|0;m=0;while(1){n=a6(c[k>>2]|0)|0;if((n|0)==-1){o=-1;break}a[f+m|0]=n&255;m=m+1|0;if((m|0)>=(l|0)){break L1705}}i=e;return o|0}}while(0);L1712:do{if((a[b+48|0]&1)==0){m=b+40|0;k=b+36|0;n=f|0;p=g+4|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[k>>2]|0;w=f+r|0;x=cG[c[(c[t>>2]|0)+16>>2]&31](t,s,n,w,h,g,p,j)|0;if((x|0)==3){y=1765;break}else if((x|0)==2){o=-1;y=1773;break}else if((x|0)!=1){z=r;break L1712}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=1775;break}v=a6(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=1774;break}a[w]=v&255;r=r+1|0}if((y|0)==1765){c[g>>2]=a[n]|0;z=r;break}else if((y|0)==1773){i=e;return o|0}else if((y|0)==1774){i=e;return o|0}else if((y|0)==1775){i=e;return o|0}}else{c[g>>2]=a[f|0]|0;z=l}}while(0);L1726:do{if(!d){l=b+32|0;y=z;while(1){if((y|0)<=0){break L1726}j=y-1|0;if((b2(a[f+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;break}else{y=j}}i=e;return o|0}}while(0);o=c[g>>2]|0;i=e;return o|0}function ex(a){a=a|0;f$(a|0);return}function ey(a){a=a|0;f$(a|0);mC(a);return}function ez(b,d){b=b|0;d=d|0;var e=0;cB[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=kx(d,18608)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cB[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function eA(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cL[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aP(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=1789;break}if((l|0)==2){m=-1;n=1787;break}else if((l|0)!=1){n=1785;break}}if((n|0)==1785){m=((aN(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==1789){i=b;return m|0}else if((n|0)==1787){i=b;return m|0}return 0}function eB(a){a=a|0;gx(19008)|0;gx(19096)|0;gA(18640)|0;gA(18728)|0;return}function eC(a){a=a|0;return}function eD(a){a=a|0;return}function eE(a){a=a|0;var b=0;b=a+4|0;J=c[b>>2]|0,c[b>>2]=J+1,J;return}function eF(a){a=a|0;return c[a+4>>2]|0}function eG(a){a=a|0;return c[a+4>>2]|0}function eH(a){a=a|0;c[a>>2]=8512;return}function eI(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function eJ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function eK(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+1|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;a[g]=d&255;c[m>>2]=l;L1766:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=cG[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=1823;break}if((y|0)==3){B=1814;break}if(y>>>0>=2){A=-1;B=1826;break}x=(c[h>>2]|0)-t|0;if((aP(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=1824;break}if((y|0)!=1){break L1766}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y)|0;c[m>>2]=C;v=y;w=C}if((B|0)==1823){i=e;return A|0}else if((B|0)==1824){i=e;return A|0}else if((B|0)==1814){if((aP(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==1826){i=e;return A|0}}else{if((aP(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function eL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;f0(b|0);c[b>>2]=9400;c[b+32>>2]=d;c[b+40>>2]=e;kn(g,b+4|0);e=kx(g,18608)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){ko(g);i=f;return}jD(248);ko(g);i=f;return}function eM(a){a=a|0;f$(a|0);return}function eN(a){a=a|0;f$(a|0);mC(a);return}function eO(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=kx(d,18608)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}jD(248);return}function eP(a){a=a|0;return eS(a,0)|0}function eQ(a){a=a|0;return eS(a,1)|0}function eR(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}k=d&255;a[h]=k;l=c[b+36>>2]|0;m=f|0;n=cG[c[(c[l>>2]|0)+12>>2]&31](l,c[b+40>>2]|0,h,h+1|0,e+24|0,m,f+8|0,g)|0;if((n|0)==3){a[m]=k;c[g>>2]=f+1}else if((n|0)==2|(n|0)==1){j=-1;i=e;return j|0}n=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=m>>>0){j=d;o=1852;break}f=b-1|0;c[g>>2]=f;if((b2(a[f]|0,c[n>>2]|0)|0)==-1){j=-1;o=1854;break}}if((o|0)==1854){i=e;return j|0}else if((o|0)==1852){i=e;return j|0}return 0}function eS(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[b+44>>2]|0;m=(l|0)>1?l:1;L1816:do{if((m|0)>0){l=b+32|0;n=0;while(1){o=a6(c[l>>2]|0)|0;if((o|0)==-1){p=-1;break}a[g+n|0]=o&255;n=n+1|0;if((n|0)>=(m|0)){break L1816}}i=f;return p|0}}while(0);L1823:do{if((a[b+48|0]&1)==0){n=b+40|0;l=b+36|0;o=g|0;q=h+1|0;r=b+32|0;s=m;while(1){t=c[n>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[l>>2]|0;x=g+s|0;y=cG[c[(c[u>>2]|0)+16>>2]&31](u,t,o,x,j,h,q,k)|0;if((y|0)==3){z=1865;break}else if((y|0)==2){p=-1;z=1873;break}else if((y|0)!=1){A=s;break L1823}y=c[n>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){p=-1;z=1874;break}w=a6(c[r>>2]|0)|0;if((w|0)==-1){p=-1;z=1875;break}a[x]=w&255;s=s+1|0}if((z|0)==1865){a[h]=a[o]|0;A=s;break}else if((z|0)==1873){i=f;return p|0}else if((z|0)==1874){i=f;return p|0}else if((z|0)==1875){i=f;return p|0}}else{a[h]=a[g|0]|0;A=m}}while(0);L1837:do{if(!e){m=b+32|0;z=A;while(1){if((z|0)<=0){break L1837}k=z-1|0;if((b2(d[g+k|0]|0|0,c[m>>2]|0)|0)==-1){p=-1;break}else{z=k}}i=f;return p|0}}while(0);p=d[h]|0;i=f;return p|0}function eT(){ej(0);a9(174,19360|0,v|0)|0;return}function eU(a){a=a|0;var b=0,d=0;b=a+4|0;if(((J=c[b>>2]|0,c[b>>2]=J+ -1,J)|0)!=0){d=0;return d|0}cx[c[(c[a>>2]|0)+8>>2]&511](a);d=1;return d|0}function eV(b,d){b=b|0;d=d|0;var e=0,f=0;c[b>>2]=6552;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=mI(f|0)|0;b=mz(d+13|0)|0;c[b+4>>2]=d;c[b>>2]=d;d=b+12|0;c[e>>2]=d;c[b+8>>2]=0;mM(d|0,f|0)|0;return}function eW(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=6552;d=a+4|0;if((d|0)==0){return}a=mI(b|0)|0;e=mz(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;mM(a|0,b|0)|0;return}function eX(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=6552;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){e=a;mC(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;mC(e);return}mD(d);e=a;mC(e);return}function eY(a){a=a|0;var b=0;c[a>>2]=6552;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((J=c[a>>2]|0,c[a>>2]=J+ -1,J)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}mD(a);return}function eZ(b,d){b=b|0;d=d|0;var e=0,f=0;c[b>>2]=6456;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=mI(f|0)|0;b=mz(d+13|0)|0;c[b+4>>2]=d;c[b>>2]=d;d=b+12|0;c[e>>2]=d;c[b+8>>2]=0;mM(d|0,f|0)|0;return}function e_(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=6456;d=a+4|0;if((d|0)==0){return}a=mI(b|0)|0;e=mz(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;mM(a|0,b|0)|0;return}function e$(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=6456;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){e=a;mC(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;mC(e);return}mD(d);e=a;mC(e);return}function e0(a){a=a|0;var b=0;c[a>>2]=6456;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((J=c[a>>2]|0,c[a>>2]=J+ -1,J)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}mD(a);return}function e1(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=6552;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){e=a;mC(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;mC(e);return}mD(d);e=a;mC(e);return}function e2(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=6552;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){e=a;mC(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;mC(e);return}mD(d);e=a;mC(e);return}function e3(a){a=a|0;mC(a);return}function e4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;cD[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function e5(a,b,c){a=a|0;b=b|0;c=c|0;b=b_(c|0)|0;fm(a,b,mI(b|0)|0);return}function e6(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;if((l|0)==0){m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];mK(h|0,0,12);i=g;return}n=d[h]|0;if((n&1|0)==0){o=n>>>1}else{o=c[f+4>>2]|0}if((o|0)==0){p=l}else{fg(f,4088)|0;p=c[k>>2]|0}k=c[e+4>>2]|0;cD[c[(c[k>>2]|0)+24>>2]&7](j,k,p);p=a[j]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}k=p&255;if((k&1|0)==0){r=k>>>1}else{r=c[j+4>>2]|0}fs(f,q,r)|0;fb(j);m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];mK(h|0,0,12);i=g;return}function e7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+32|0;f=b;b=i;i=i+8|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];f=e|0;g=e+16|0;fm(g,d,mI(d|0)|0);e6(f,b,g);eZ(a|0,f);fb(f);fb(g);c[a>>2]=8896;g=b;b=a+8|0;a=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=a;i=e;return}function e8(a){a=a|0;e0(a|0);mC(a);return}function e9(a){a=a|0;e0(a|0);return}function fa(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;fo(a,b,c,d,0);return}function fb(b){b=b|0;if((a[b]&1)==0){return}mC(c[b+8>>2]|0);return}function fc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(d|0)){return b|0}e=a[d]|0;if((e&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}g=e&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}d=b;g=b;e=a[g]|0;if((e&1)==0){i=10;j=e}else{e=c[b>>2]|0;i=(e&-2)-1|0;j=e&255}if(i>>>0<h>>>0){e=j&255;if((e&1|0)==0){k=e>>>1}else{k=c[b+4>>2]|0}fx(b,i,h-i|0,k,0,k,h,f);return b|0}if((j&1)==0){l=d+1|0}else{l=c[b+8>>2]|0}mN(l|0,f|0,h|0);a[l+h|0]=0;if((a[g]&1)==0){a[g]=h<<1&255;return b|0}else{c[b+4>>2]=h;return b|0}return 0}function fd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=mI(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}fx(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}mN(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function fe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){h=d-i|0;ff(b,h,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1&255;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function ff(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){fy(b,h,d-h+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}mK(l+j|0,e|0,d|0);e=j+d|0;if((a[f]&1)==0){a[f]=e<<1&255}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function fg(a,b){a=a|0;b=b|0;return fs(a,b,mI(b|0)|0)|0}function fh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){fy(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}a[k+i|0]=d;d=i+1|0;a[k+d|0]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function fi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;if((c[a>>2]|0)==1){do{a_(15416,15408)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;cx[d&511](b);h;c[a>>2]=-1;i;bU(15416)|0;return}function fj(a){a=a|0;a=ck(8)|0;eW(a,552);c[a>>2]=6520;bE(a|0,13376,42)}function fk(a){a=a|0;a=ck(8)|0;eW(a,552);c[a>>2]=6488;bE(a|0,13360,6)}function fl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if((f|0)==-1){fj(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=my(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}mJ(g|0,e|0,f)|0;a[g+f|0]=0;return}function fm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((e|0)==-1){fj(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0;mJ(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=my(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;mJ(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function fn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((d|0)==-1){fj(0)}if(d>>>0<11){a[b]=d<<1&255;f=b+1|0;mK(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}else{h=d+16&-16;i=my(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=d;f=i;mK(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}}function fo(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;g=a[d]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[d+4>>2]|0}if(i>>>0<e>>>0){fk(0)}if((g&1)==0){j=d+1|0}else{j=c[d+8>>2]|0}d=j+e|0;j=i-e|0;e=j>>>0<f>>>0?j:f;if((e|0)==-1){fj(0)}if(e>>>0<11){a[b]=e<<1&255;k=b+1|0;mJ(k|0,d|0,e)|0;l=k+e|0;a[l]=0;return}else{f=e+16&-16;j=my(f)|0;c[b+8>>2]=j;c[b>>2]=f|1;c[b+4>>2]=e;k=j;mJ(k|0,d|0,e)|0;l=k+e|0;a[l]=0;return}}function fp(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((d|0)==-1){fj(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{if(g>>>0>h>>>0){p=my(k)|0}else{p=my(k)|0}h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;mJ(l|0,m|0,h)|0;if(n){mC(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function fq(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;g=a[b]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<e>>>0|(i-e|0)>>>0<f>>>0){j=-1;return j|0}if((f|0)==0){j=e;return j|0}if((g&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}b=k+e|0;g=k+i|0;h=d+f|0;if((g-b|0)<(f|0)){j=-1;return j|0}l=i+(1-f)|0;f=k+l|0;if((l|0)==(e|0)){j=-1;return j|0}e=a[d]|0;l=b;L2208:while(1){if((a[l]|0)==e<<24>>24){b=d;i=l;do{b=b+1|0;if((b|0)==(h|0)){break L2208}i=i+1|0;}while((a[i]|0)==(a[b]|0))}b=l+1|0;if((b|0)==(f|0)){j=-1;m=2204;break}else{l=b}}if((m|0)==2204){return j|0}if((l|0)==(g|0)){j=-1;return j|0}j=l-k|0;return j|0}function fr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=a[b]|0;g=f&255;if((g&1|0)==0){h=g>>>1}else{h=c[b+4>>2]|0}if((h|0)==0){i=-1;return i|0}if((f&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}b=j+(h>>>0>e>>>0?e+1|0:h)|0;do{if((b|0)==(j|0)){i=-1;k=2220;break}b=b-1|0;}while((a[b]|0)!=d<<24>>24);if((k|0)==2220){return i|0}i=b-j|0;return i|0}function fs(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){fx(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}i=k+j|0;mJ(i|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function ft(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=a[b]|0;g=f&255;if((g&1|0)==0){h=g>>>1}else{h=c[b+4>>2]|0}if(h>>>0<=e>>>0){i=-1;return i|0}if((f&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}b=a2(j+e|0,d&255|0,h-e|0)|0;if((b|0)==0){i=-1;return i|0}i=b-j|0;return i|0}function fu(b){b=b|0;if((a[b]&1)==0){return}mC(c[b+8>>2]|0);return}function fv(a,b){a=a|0;b=b|0;return fw(a,b,l3(b)|0)|0}function fw(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}gc(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}l5(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function fx(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){fj(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=my(o)|0;if((g|0)!=0){mJ(e|0,k|0,g)|0}if((i|0)!=0){n=e+g|0;mJ(n|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g)|0;l=k+(h+g)|0;mJ(n|0,l|0,f)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}mC(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function fy(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){fj(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=my(n)|0;if((g|0)!=0){mJ(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g)|0;i=j+(h+g)|0;mJ(m|0,i|0,f)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}mC(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function fz(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){fk(0);return 0}if((e|0)==0){return b|0}if((g&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}h=i-d|0;k=h>>>0<e>>>0?h:e;if((h|0)==(k|0)){l=g}else{mN(j+d|0,j+(k+d)|0,h-k|0);l=a[f]|0}h=i-k|0;if((l&1)==0){a[f]=h<<1&255}else{c[b+4>>2]=h}a[j+h|0]=0;return b|0}function fA(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if(k>>>0<d>>>0){fk(0);return 0}j=k-d|0;l=j>>>0<e>>>0?j:e;if((i&1)==0){m=10;n=i}else{i=c[b>>2]|0;m=(i&-2)-1|0;n=i&255}if((l-k+m|0)>>>0<g>>>0){fx(b,m,k+g-l-m|0,k,d,l,g,f);return b|0}if((n&1)==0){o=b+1|0}else{o=c[b+8>>2]|0}do{if((l|0)==(g|0)){p=d;q=f;r=g;s=g;t=2352}else{n=j-l|0;if((j|0)==(l|0)){p=d;q=f;r=g;s=j;t=2352;break}m=o+d|0;if(l>>>0>g>>>0){mN(m|0,f|0,g|0);mN(o+(g+d)|0,o+(l+d)|0,n|0);u=g;v=l;break}do{if(m>>>0<f>>>0){if((o+k|0)>>>0<=f>>>0){w=d;x=f;y=g;z=l;break}i=l+d|0;if((o+i|0)>>>0>f>>>0){mN(m|0,f|0,l|0);w=i;x=f+g|0;y=g-l|0;z=0;break}else{w=d;x=f+(g-l)|0;y=g;z=l;break}}else{w=d;x=f;y=g;z=l}}while(0);mN(o+(w+y)|0,o+(w+z)|0,n|0);p=w;q=x;r=y;s=z;t=2352}}while(0);if((t|0)==2352){mN(o+p|0,q|0,r|0);u=r;v=s}s=u-v+k|0;if((a[h]&1)==0){a[h]=s<<1&255}else{c[b+4>>2]=s}a[o+s|0]=0;return b|0}function fB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741822){fj(0)}if(e>>>0<2){a[b]=e<<1&255;f=b+4|0;g=l4(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=my(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=l4(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function fC(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741822){fj(0)}if(d>>>0<2){a[b]=d<<1&255;f=b+4|0;g=l6(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=my(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=l6(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function fD(a,b){a=a|0;b=b|0;return}function fE(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function fF(a){a=a|0;return 0}function fG(a){a=a|0;return 0}function fH(a){a=a|0;return-1|0}function fI(a,b){a=a|0;b=b|0;return-1|0}function fJ(a,b){a=a|0;b=b|0;return-1|0}function fK(a,b){a=a|0;b=b|0;return}function fL(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function fM(a){a=a|0;return 0}function fN(a){a=a|0;return 0}function fO(a){a=a|0;return-1|0}function fP(a,b){a=a|0;b=b|0;return-1|0}function fQ(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function fR(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function fS(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function fT(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function fU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){gd(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}c[k+(i<<2)>>2]=d;d=i+1|0;c[k+(d<<2)>>2]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function fV(a){a=a|0;gf(a|0);return}function fW(a,b){a=a|0;b=b|0;kn(a,b+28|0);return}function fX(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;mK(a+32|0,0,40);if((b|0)==0){return}kw(b);return}function fY(a){a=a|0;gf(a|0);return}function fZ(a){a=a|0;c[a>>2]=8440;ko(a+4|0);mC(a);return}function f_(a){a=a|0;c[a>>2]=8440;ko(a+4|0);return}function f$(a){a=a|0;c[a>>2]=8440;ko(a+4|0);return}function f0(a){a=a|0;c[a>>2]=8440;kw(a+4|0);mK(a+8|0,0,24);return}function f1(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=cB[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((k|0)==-1){g=d;m=2431;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=2432;break}}if((m|0)==2431){return g|0}else if((m|0)==2432){return g|0}return 0}function f2(a){a=a|0;var b=0,e=0;if((cB[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function f3(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((cz[c[(c[g>>2]|0)+52>>2]&63](b,d[l]|0)|0)==-1){h=k;n=2446;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=2447;break}}if((n|0)==2447){return h|0}else if((n|0)==2446){return h|0}return 0}function f4(a){a=a|0;c[a>>2]=8368;ko(a+4|0);mC(a);return}function f5(a){a=a|0;c[a>>2]=8368;ko(a+4|0);return}function f6(a){a=a|0;c[a>>2]=8368;ko(a+4|0);return}function f7(a){a=a|0;c[a>>2]=8368;kw(a+4|0);mK(a+8|0,0,24);return}function f8(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=cB[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((j|0)==-1){f=b;l=2459;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=2461;break}}if((l|0)==2461){return f|0}else if((l|0)==2459){return f|0}return 0}function f9(a){a=a|0;var b=0,d=0;if((cB[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function ga(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((cz[c[(c[e>>2]|0)+52>>2]&63](a,c[j>>2]|0)|0)==-1){f=i;l=2475;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=2476;break}}if((l|0)==2476){return f|0}else if((l|0)==2475){return f|0}return 0}function gb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(d>>>0>1073741822){fj(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;if(f>>>0>g>>>0){o=my(d)|0}else{o=my(d)|0}d=h&1;if(d<<24>>24==0){p=b+4|0}else{p=c[b+8>>2]|0}k=o;l=p;m=d<<24>>24!=0;n=1}d=h&255;if((d&1|0)==0){q=d>>>1}else{q=c[b+4>>2]|0}l4(k,l,q+1|0)|0;if(m){mC(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=k;return}else{a[e]=i<<1&255;return}}function gc(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741821-d|0)>>>0<e>>>0){fj(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=my(o<<2)|0;if((g|0)!=0){l4(e,k,g)|0}if((i|0)!=0){n=e+(g<<2)|0;l4(n,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g<<2)|0;l=k+(h+g<<2)|0;l4(n,l,f)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}mC(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function gd(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741821-d|0)>>>0<e>>>0){fj(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=my(n<<2)|0;if((g|0)!=0){l4(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g<<2)|0;i=j+(h+g<<2)|0;l4(m,i,f)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}mC(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function ge(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=ck(16)|0;do{if((a[19504]|0)==0){if((bu(19504)|0)==0){break}eH(17544);c[4386]=8064;a9(88,17544,v|0)|0}}while(0);b=mQ(17544,0,32)|0;d=L;c[f>>2]=b&0|1;c[f+4>>2]=d|0;e7(e,f,4208);c[e>>2]=7200;bE(e|0,13920,158)}function gf(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=7176;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;if((b|0)!=0){f=b;do{f=f-1|0;cD[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);}while((f|0)!=0)}ko(a+28|0);mt(c[d>>2]|0);mt(c[e>>2]|0);mt(c[a+48>>2]|0);mt(c[a+60>>2]|0);return}function gg(a,b){a=a|0;b=b|0;return-1|0}function gh(a,b){a=a|0;b=b|0;return}function gi(a){a=a|0;gf(a+8|0);mC(a);return}function gj(a){a=a|0;gf(a+8|0);return}function gk(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;gf(b+(d+8)|0);mC(b+d|0);return}function gl(a){a=a|0;gf(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function gm(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;h=i;i=i+8|0;j=h|0;k=e|0;a[k]=0;e=f;l=c[(c[e>>2]|0)-12>>2]|0;m=f;f=c[m+(l+16)>>2]|0;if((f|0)!=0){ge(m+l|0,f|4);i=h;return}f=c[m+(l+72)>>2]|0;if((f|0)!=0){gx(f)|0}do{if(!g){f=c[(c[e>>2]|0)-12>>2]|0;if((c[m+(f+4)>>2]&4096|0)==0){break}kn(j,m+(f+28)|0);f=kx(j,18912)|0;ko(j);l=f+8|0;f=c[m+((c[(c[e>>2]|0)-12>>2]|0)+24)>>2]|0;while(1){if((f|0)==0){break}n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){o=cB[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{o=d[n]|0}p=(o|0)==-1?0:f;if((p|0)==0){break}q=p+12|0;n=c[q>>2]|0;r=p+16|0;if((n|0)==(c[r>>2]|0)){s=(cB[c[(c[p>>2]|0)+36>>2]&255](p)|0)&255}else{s=a[n]|0}if(s<<24>>24<=-1){t=2588;break}if((b[(c[l>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){t=2588;break}n=c[q>>2]|0;if((n|0)==(c[r>>2]|0)){u=c[(c[p>>2]|0)+40>>2]|0;cB[u&255](p)|0;f=p;continue}else{c[q>>2]=n+1;f=p;continue}}if((t|0)==2588){f=c[q>>2]|0;if((f|0)==(c[r>>2]|0)){v=cB[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{v=d[f]|0}if(!((v|0)==-1|(p|0)==0)){break}}f=c[(c[e>>2]|0)-12>>2]|0;ge(m+f|0,c[m+(f+16)>>2]|6)}}while(0);a[k]=(c[m+((c[(c[e>>2]|0)-12>>2]|0)+16)>>2]|0)==0|0;i=h;return}function gn(a){a=a|0;gf(a+8|0);mC(a);return}function go(a){a=a|0;gf(a+8|0);return}function gp(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;gf(b+(d+8)|0);mC(b+d|0);return}function gq(a){a=a|0;gf(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function gr(a){a=a|0;gf(a+4|0);mC(a);return}function gs(a){a=a|0;gf(a+4|0);return}function gt(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;gf(b+(d+4)|0);mC(b+d|0);return}function gu(a){a=a|0;gf(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function gv(b,d){b=b|0;d=d|0;var e=0,f=0;e=b|0;a[e]=0;c[b+4>>2]=d;b=c[(c[d>>2]|0)-12>>2]|0;f=d;if((c[f+(b+16)>>2]|0)!=0){return}d=c[f+(b+72)>>2]|0;if((d|0)!=0){gx(d)|0}a[e]=1;return}function gw(a){a=a|0;gB(a);return}function gx(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){gx(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;ge(h+k|0,c[h+(k+16)>>2]|1)}}while(0);gB(e);i=d;return b|0}function gy(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){return}else{a$()}}function gz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+56|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;gm(h,b,0);if((a[h|0]&1)==0){i=e;return b|0}c[j>>2]=0;h=b;m=b;kn(l,m+((c[(c[h>>2]|0)-12>>2]|0)+28)|0);n=kx(l,18576)|0;o=c[(c[h>>2]|0)-12>>2]|0;p=c[(c[n>>2]|0)+16>>2]|0;c[f>>2]=c[m+(o+24)>>2];c[g>>2]=0;cw[p&127](e+48|0,n,f,g,m+o|0,j,k);ko(l);c[d>>2]=c[k>>2];k=c[(c[h>>2]|0)-12>>2]|0;ge(m+k|0,c[m+(k+16)>>2]|c[j>>2]);i=e;return b|0}function gA(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){gA(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;ge(h+k|0,c[h+(k+16)>>2]|1)}}while(0);g7(e);i=d;return b|0}function gB(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bS()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;ge(d+b|0,c[d+(b+16)>>2]|1);return}function gC(a,b){a=a|0;b=b|0;return}function gD(a){a=a|0;return 4968|0}function gE(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L2779:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=2699;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=2700;break}if(l<<24>>24<k<<24>>24){i=1;j=2701;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L2779}else{b=k;h=l}}if((j|0)==2699){return i|0}else if((j|0)==2701){return i|0}else if((j|0)==2700){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function gF(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function gG(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L2798:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=2715;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=2716;break}if((l|0)<(k|0)){i=1;j=2718;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L2798}else{a=k;h=l}}if((j|0)==2715){return i|0}else if((j|0)==2716){return i|0}else if((j|0)==2718){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function gH(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function gI(a){a=a|0;gf(a+4|0);mC(a);return}function gJ(a){a=a|0;gf(a+4|0);return}function gK(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;gf(b+(d+4)|0);mC(b+d|0);return}function gL(a){a=a|0;gf(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function gM(a){a=a|0;gf(a+12|0);mC(a);return}function gN(a){a=a|0;gf(a+12|0);return}function gO(a){a=a|0;var b=0;b=a-92+84|0;gf(b+12|0);mC(b);return}function gP(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;gf(b+(d+12)|0);mC(b+d|0);return}function gQ(a){a=a|0;gf(a-92+96|0);return}function gR(a){a=a|0;gf(a+((c[(c[a>>2]|0)-12>>2]|0)+12)|0);return}function gS(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){fm(a,5408,35);return}else{e5(a,b|0,c);return}}function gT(a){a=a|0;eD(a|0);return}function gU(a){a=a|0;e9(a|0);mC(a);return}function gV(a){a=a|0;e9(a|0);return}function gW(a){a=a|0;gf(a);mC(a);return}function gX(a){a=a|0;eD(a|0);mC(a);return}function gY(a){a=a|0;eC(a|0);mC(a);return}function gZ(a){a=a|0;eC(a|0);return}function g_(a){a=a|0;eC(a|0);return}function g$(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;do{if((g|0)==-1){fj(b);h=2752}else{if(g>>>0>=11){h=2752;break}a[b]=g<<1&255;i=b+1|0}}while(0);if((h|0)==2752){h=g+16&-16;j=my(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=g;i=j}if((e|0)==(f|0)){k=i;a[k]=0;return}j=f+(-d|0)|0;d=i;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=i+j|0;a[k]=0;return}function g0(a){a=a|0;eC(a|0);mC(a);return}function g1(a){a=a|0;eC(a|0);return}function g2(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741822){fj(b)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=my(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function g3(a){a=a|0;eC(a|0);mC(a);return}function g4(a){a=a|0;eC(a|0);return}function g5(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;if((p|0)!=0){gx(p)|0}a[l]=1;kn(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=kx(j,18560)|0;ko(j);q=c[(c[m>>2]|0)-12>>2]|0;r=c[o+(q+24)>>2]|0;s=o+(q+76)|0;t=c[s>>2]|0;if((t|0)==-1){kn(g,o+(q+28)|0);u=kx(g,18912)|0;v=cz[c[(c[u>>2]|0)+28>>2]&63](u,32)|0;ko(g);c[s>>2]=v<<24>>24;w=v}else{w=t&255}t=c[(c[p>>2]|0)+16>>2]|0;c[f>>2]=r;cJ[t&63](k,p,f,o+q|0,w,d);if((c[k>>2]|0)!=0){break}q=c[(c[m>>2]|0)-12>>2]|0;ge(o+q|0,c[o+(q+16)>>2]|5)}}while(0);gB(h);i=e;return b|0}function g6(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+8|0;f=e|0;g=f|0;a[g]=0;c[f+4>>2]=b;h=b;j=c[(c[h>>2]|0)-12>>2]|0;k=b;do{if((c[k+(j+16)>>2]|0)==0){l=c[k+(j+72)>>2]|0;if((l|0)!=0){gx(l)|0}a[g]=1;l=c[k+((c[(c[h>>2]|0)-12>>2]|0)+24)>>2]|0;m=l;if((l|0)==0){n=m}else{o=l+24|0;p=c[o>>2]|0;if((p|0)==(c[l+28>>2]|0)){q=cz[c[(c[l>>2]|0)+52>>2]&63](m,d&255)|0}else{c[o>>2]=p+1;a[p]=d;q=d&255}n=(q|0)==-1?0:m}if((n|0)!=0){break}m=c[(c[h>>2]|0)-12>>2]|0;ge(k+m|0,c[k+(m+16)>>2]|1)}}while(0);gB(f);i=e;return b|0}function g7(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bS()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;ge(d+b|0,c[d+(b+16)>>2]|1);return}function g8(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=ms(m)|0;if((o|0)!=0){p=o;q=o;break}mH();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){z=r;break}if((cB[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){A=z;B=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){C=m;break}c[b>>2]=0;C=0}else{C=m}}while(0);A=c[u>>2]|0;B=C}D=(B|0)==0;if(!((r^D)&(s|0)!=0)){break}m=c[A+12>>2]|0;if((m|0)==(c[A+16>>2]|0)){E=(cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[m]|0}if(k){F=E}else{F=cz[c[(c[e>>2]|0)+12>>2]&63](h,E)|0}do{if(n){G=x;H=s}else{m=t+1|0;L2970:do{if(k){y=s;o=x;w=p;v=0;I=f;while(1){do{if((a[w]|0)==1){J=I;if((a[J]&1)==0){K=I+1|0}else{K=c[I+8>>2]|0}if(F<<24>>24!=(a[K+t|0]|0)){a[w]=0;L=v;M=o;N=y-1|0;break}O=d[J]|0;if((O&1|0)==0){P=O>>>1}else{P=c[I+4>>2]|0}if((P|0)!=(m|0)){L=1;M=o;N=y;break}a[w]=2;L=1;M=o+1|0;N=y-1|0}else{L=v;M=o;N=y}}while(0);O=I+12|0;if((O|0)==(g|0)){Q=N;R=M;S=L;break L2970}y=N;o=M;w=w+1|0;v=L;I=O}}else{I=s;v=x;w=p;o=0;y=f;while(1){do{if((a[w]|0)==1){O=y;if((a[O]&1)==0){T=y+1|0}else{T=c[y+8>>2]|0}if(F<<24>>24!=(cz[c[(c[e>>2]|0)+12>>2]&63](h,a[T+t|0]|0)|0)<<24>>24){a[w]=0;U=o;V=v;W=I-1|0;break}J=d[O]|0;if((J&1|0)==0){X=J>>>1}else{X=c[y+4>>2]|0}if((X|0)!=(m|0)){U=1;V=v;W=I;break}a[w]=2;U=1;V=v+1|0;W=I-1|0}else{U=o;V=v;W=I}}while(0);J=y+12|0;if((J|0)==(g|0)){Q=W;R=V;S=U;break L2970}I=W;v=V;w=w+1|0;o=U;y=J}}}while(0);if(!S){G=R;H=Q;break}m=c[u>>2]|0;y=m+12|0;o=c[y>>2]|0;if((o|0)==(c[m+16>>2]|0)){w=c[(c[m>>2]|0)+40>>2]|0;cB[w&255](m)|0}else{c[y>>2]=o+1}if((R+Q|0)>>>0<2|n){G=R;H=Q;break}o=t+1|0;y=R;m=p;w=f;while(1){do{if((a[m]|0)==2){v=d[w]|0;if((v&1|0)==0){Y=v>>>1}else{Y=c[w+4>>2]|0}if((Y|0)==(o|0)){Z=y;break}a[m]=0;Z=y-1|0}else{Z=y}}while(0);v=w+12|0;if((v|0)==(g|0)){G=Z;H=Q;break}else{y=Z;m=m+1|0;w=v}}}}while(0);t=t+1|0;x=G;s=H}do{if((A|0)==0){_=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){_=A;break}if((cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[u>>2]=0;_=0;break}else{_=c[u>>2]|0;break}}}while(0);u=(_|0)==0;do{if(D){$=2931}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(u){break}else{$=2933;break}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[b>>2]=0;$=2931;break}else{if(u^(B|0)==0){break}else{$=2933;break}}}}while(0);if(($|0)==2931){if(u){$=2933}}if(($|0)==2933){c[j>>2]=c[j>>2]|2}L3049:do{if(n){$=2938}else{u=f;B=p;while(1){if((a[B]|0)==2){aa=u;break L3049}b=u+12|0;if((b|0)==(g|0)){$=2938;break L3049}u=b;B=B+1|0}}}while(0);if(($|0)==2938){c[j>>2]=c[j>>2]|4;aa=g}if((q|0)==0){i=l;return aa|0}mt(q);i=l;return aa|0}function g9(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cw[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}fW(r,g);q=r|0;r=c[q>>2]|0;if((c[4728]|0)!=-1){c[m>>2]=18912;c[m+4>>2]=16;c[m+8>>2]=0;fi(18912,m,120)}m=(c[4729]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;eU(n)|0;fW(s,g);n=s|0;p=c[n>>2]|0;if((c[4632]|0)!=-1){c[l>>2]=18528;c[l+4>>2]=16;c[l+8>>2]=0;fi(18528,l,120)}d=(c[4633]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;eU(z)|0;z=t|0;A=x;cy[c[(c[A>>2]|0)+24>>2]&127](z,y);cy[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(g8(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];fb(t+12|0);fb(t|0);i=k;return}}while(0);o=ck(4)|0;l7(o);bE(o|0,13328,164)}}while(0);k=ck(4)|0;l7(k);bE(k|0,13328,164)}function ha(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[15424+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[15424+i|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function hb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n-4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L68:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}k=(e-h|0)>1?h+1|0:h;j=n+4|0;q=a[k]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(j>>>0<b>>>0){h=k;n=j;m=r;i=s}else{t=r;u=s;break L68}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}function hc(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;he(n,h,t,m);h=o|0;mK(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L91:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=81}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L91}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=81;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L91}}}}while(0);if((y|0)==81){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((ha(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=hd(h,c[p>>2]|0,j,u)|0;hb(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L136:do{if(C){y=111}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=111;break L136}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);do{if((y|0)==111){if(l){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;fb(n);i=e;return}function hd(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a7()|0)>>2]|0;c[(a7()|0)>>2]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=cc(b|0,h|0,f|0,c[4384]|0)|0;f=L;b=c[(a7()|0)>>2]|0;if((b|0)==0){c[(a7()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((b|0)==34|((f|0)<(d|0)|(f|0)==(d|0)&l>>>0<-2147483648>>>0)|((f|0)>(h|0)|(f|0)==(h|0)&l>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(f|0)>(e|0)|(f|0)==(e|0)&l>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function he(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;fW(k,d);d=k|0;k=c[d>>2]|0;if((c[4728]|0)!=-1){c[j>>2]=18912;c[j+4>>2]=16;c[j+8>>2]=0;fi(18912,j,120)}j=(c[4729]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+32>>2]|0;cK[o&15](n,15424,15450,e)|0;n=c[d>>2]|0;if((c[4632]|0)!=-1){c[h>>2]=18528;c[h+4>>2]=16;c[h+8>>2]=0;fi(18528,h,120)}o=(c[4633]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;a[f]=cB[c[(c[p>>2]|0)+16>>2]&255](q)|0;cy[c[(c[p>>2]|0)+20>>2]&127](b,q);q=c[d>>2]|0;eU(q)|0;i=g;return}}while(0);o=ck(4)|0;l7(o);bE(o|0,13328,164)}}while(0);g=ck(4)|0;l7(g);bE(g|0,13328,164)}function hf(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;he(n,h,t,m);h=o|0;mK(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L197:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=170}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L197}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=170;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L197}}}}while(0);if((y|0)==170){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((ha(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=hg(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=L;hb(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L242:do{if(C){y=200}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=200;break L242}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);do{if((y|0)==200){if(l){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;fb(n);i=e;return}function hg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(L=j,k)|0}l=c[(a7()|0)>>2]|0;c[(a7()|0)>>2]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);m=cc(b|0,h|0,f|0,c[4384]|0)|0;f=L;b=c[(a7()|0)>>2]|0;if((b|0)==0){c[(a7()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(L=j,k)|0}if((b|0)!=34){j=f;k=m;i=g;return(L=j,k)|0}c[e>>2]=4;e=0;b=(f|0)>(e|0)|(f|0)==(e|0)&m>>>0>0>>>0;j=b?2147483647:-2147483648;k=b?-1:0;i=g;return(L=j,k)|0}function hh(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=i;i=i+280|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=f+96|0;r=f+104|0;s=f+264|0;t=f+272|0;u=c[j+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=m|0;he(o,j,u,n);j=p|0;mK(j|0,0,40);c[q>>2]=j;p=r|0;c[s>>2]=p;c[t>>2]=0;m=g|0;g=h|0;h=a[n]|0;n=c[m>>2]|0;L282:while(1){do{if((n|0)==0){w=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){w=n;break}if((cB[c[(c[n>>2]|0)+36>>2]&255](n)|0)!=-1){w=n;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;y=c[g>>2]|0;do{if((y|0)==0){z=241}else{if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(x){A=y;B=0;break}else{C=y;D=0;break L282}}if((cB[c[(c[y>>2]|0)+36>>2]&255](y)|0)==-1){c[g>>2]=0;z=241;break}else{E=(y|0)==0;if(x^E){A=y;B=E;break}else{C=y;D=E;break L282}}}}while(0);if((z|0)==241){z=0;if(x){C=0;D=1;break}else{A=0;B=1}}y=w+12|0;E=c[y>>2]|0;F=w+16|0;if((E|0)==(c[F>>2]|0)){G=(cB[c[(c[w>>2]|0)+36>>2]&255](w)|0)&255}else{G=a[E]|0}if((ha(G,v,j,q,t,h,o,p,s,u)|0)!=0){C=A;D=B;break}E=c[y>>2]|0;if((E|0)==(c[F>>2]|0)){F=c[(c[w>>2]|0)+40>>2]|0;cB[F&255](w)|0;n=w;continue}else{c[y>>2]=E+1;n=w;continue}}n=d[o]|0;if((n&1|0)==0){H=n>>>1}else{H=c[o+4>>2]|0}do{if((H|0)!=0){n=c[s>>2]|0;if((n-r|0)>=160){break}B=c[t>>2]|0;c[s>>2]=n+4;c[n>>2]=B}}while(0);b[l>>1]=hi(j,c[q>>2]|0,k,v)|0;hb(o,p,c[s>>2]|0,k);do{if(x){I=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){I=w;break}if((cB[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){I=w;break}c[m>>2]=0;I=0}}while(0);m=(I|0)==0;L327:do{if(D){z=271}else{do{if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((cB[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){break}c[g>>2]=0;z=271;break L327}}while(0);if(!(m^(C|0)==0)){break}J=e|0;c[J>>2]=I;fb(o);i=f;return}}while(0);do{if((z|0)==271){if(m){break}J=e|0;c[J>>2]=I;fb(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;J=e|0;c[J>>2]=I;fb(o);i=f;return}function hi(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a7()|0)>>2]|0;c[(a7()|0)>>2]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=aM(b|0,h|0,f|0,c[4384]|0)|0;f=L;b=c[(a7()|0)>>2]|0;if((b|0)==0){c[(a7()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l&65535;i=g;return j|0}return 0}function hj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;he(n,h,t,m);h=o|0;mK(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L372:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=316}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L372}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=316;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L372}}}}while(0);if((y|0)==316){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((ha(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=hk(h,c[p>>2]|0,j,u)|0;hb(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L417:do{if(C){y=346}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=346;break L417}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);do{if((y|0)==346){if(l){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;fb(n);i=e;return}function hk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a7()|0)>>2]|0;c[(a7()|0)>>2]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=aM(b|0,h|0,f|0,c[4384]|0)|0;f=L;b=c[(a7()|0)>>2]|0;if((b|0)==0){c[(a7()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function hl(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;he(n,h,t,m);h=o|0;mK(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L462:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=391}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L462}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=391;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L462}}}}while(0);if((y|0)==391){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((ha(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=hm(h,c[p>>2]|0,j,u)|0;hb(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L507:do{if(C){y=421}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=421;break L507}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);do{if((y|0)==421){if(l){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;fb(n);i=e;return}function hm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a7()|0)>>2]|0;c[(a7()|0)>>2]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=aM(b|0,h|0,f|0,c[4384]|0)|0;f=L;b=c[(a7()|0)>>2]|0;if((b|0)==0){c[(a7()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function hn(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;he(n,h,t,m);h=o|0;mK(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L552:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=466}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L552}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=466;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L552}}}}while(0);if((y|0)==466){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((ha(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=ho(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=L;hb(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L597:do{if(C){y=496}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=496;break L597}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);do{if((y|0)==496){if(l){break}I=b|0;c[I>>2]=H;fb(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;fb(n);i=e;return}function ho(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[(a7()|0)>>2]|0;c[(a7()|0)>>2]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);m=aM(b|0,h|0,f|0,c[4384]|0)|0;n=L;o=c[(a7()|0)>>2]|0;if((o|0)==0){c[(a7()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)!=34){j=n;k=m;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(L=j,k)|0}function hp(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;hq(p,j,w,n,o);j=e+72|0;mK(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L631:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=531}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L631}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=531;break}else{if(A^(B|0)==0){break}else{break L631}}}}while(0);if((C|0)==531){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((hr(F,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cB[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);I=+mG(j,m,c[4384]|0);if((c[m>>2]|0)==(t|0)){H=I;break}else{c[k>>2]=4;H=0.0;break}}}while(0);g[l>>2]=H;hb(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=573}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=573;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}}while(0);do{if((C|0)==573){if(y){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;fb(p);i=e;return}function hq(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;fW(l,d);d=l|0;l=c[d>>2]|0;if((c[4728]|0)!=-1){c[k>>2]=18912;c[k+4>>2]=16;c[k+8>>2]=0;fi(18912,k,120)}k=(c[4729]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;cK[p&15](o,15424,15456,e)|0;o=c[d>>2]|0;if((c[4632]|0)!=-1){c[j>>2]=18528;c[j+4>>2]=16;c[j+8>>2]=0;fi(18528,j,120)}p=(c[4633]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;a[f]=cB[c[(c[s>>2]|0)+12>>2]&255](r)|0;a[g]=cB[c[(c[s>>2]|0)+16>>2]&255](r)|0;cy[c[(c[q>>2]|0)+20>>2]&127](b,r);r=c[d>>2]|0;eU(r)|0;i=h;return}}while(0);p=ck(4)|0;l7(p);bE(p|0,13328,164)}}while(0);h=ck(4)|0;l7(h);bE(h|0,13328,164)}function hr(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+32|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((a[j]|0)==b<<24>>24){u=j;break}else{j=j+1|0}}j=u-o|0;if((j|0)>31){r=-1;return r|0}o=a[15424+j|0]|0;do{if((j|0)==25|(j|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=o;r=0;return r|0}else if((j|0)==22|(j|0)==23){a[f]=80}else{u=a[f]|0;if((o&95|0)!=(u<<24>>24|0)){break}a[f]=u|-128;if((a[e]&1)==0){break}a[e]=0;u=d[k]|0;if((u&1|0)==0){v=u>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}u=c[m>>2]|0;if((u-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=b}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=o}if((j|0)>21){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function hs(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;hq(p,j,w,n,o);j=e+72|0;mK(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L795:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=663}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L795}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=663;break}else{if(A^(B|0)==0){break}else{break L795}}}}while(0);if((C|0)==663){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((hr(F,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cB[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);I=+mG(j,m,c[4384]|0);if((c[m>>2]|0)==(t|0)){H=I;break}c[k>>2]=4;H=0.0}}while(0);h[l>>3]=H;hb(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=704}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=704;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}}while(0);do{if((C|0)==704){if(y){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;fb(p);i=e;return}function ht(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;hq(p,j,w,n,o);j=e+72|0;mK(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L868:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=724}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L868}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=724;break}else{if(A^(B|0)==0){break}else{break L868}}}}while(0);if((C|0)==724){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((hr(F,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cB[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);I=+mG(j,m,c[4384]|0);if((c[m>>2]|0)==(t|0)){H=I;break}c[k>>2]=4;H=0.0}}while(0);h[l>>3]=H;hb(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=765}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=765;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}}while(0);do{if((C|0)==765){if(y){break}K=b|0;c[K>>2]=J;fb(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;fb(p);i=e;return}function hu(a){a=a|0;eC(a|0);mC(a);return}function hv(a){a=a|0;eC(a|0);return}function hw(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+64|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+48|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;mK(m|0,0,12);fW(n,g);g=n|0;n=c[g>>2]|0;if((c[4728]|0)!=-1){c[k>>2]=18912;c[k+4>>2]=16;c[k+8>>2]=0;fi(18912,k,120)}k=(c[4729]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+32>>2]|0;cK[x&15](v,15424,15450,w)|0;v=c[g>>2]|0;eU(v)|0;v=o|0;mK(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L951:while(1){do{if((z|0)==0){A=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){A=z;break}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);B=(A|0)==0;D=c[y>>2]|0;do{if((D|0)==0){E=795}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(B){break}else{break L951}}if((cB[c[(c[D>>2]|0)+36>>2]&255](D)|0)==-1){c[y>>2]=0;E=795;break}else{if(B^(D|0)==0){break}else{break L951}}}}while(0);if((E|0)==795){E=0;if(B){break}}D=A+12|0;F=c[D>>2]|0;G=A+16|0;if((F|0)==(c[G>>2]|0)){H=(cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{H=a[F]|0}if((ha(H,16,v,p,s,0,m,x,r,w)|0)!=0){break}F=c[D>>2]|0;if((F|0)==(c[G>>2]|0)){G=c[(c[A>>2]|0)+40>>2]|0;cB[G&255](A)|0;z=A;continue}else{c[D>>2]=F+1;z=A;continue}}a[o+39|0]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);if((hx(v,c[4384]|0,4312,(C=i,i=i+8|0,c[C>>2]=j,C)|0)|0)!=1){c[h>>2]=4}z=c[u>>2]|0;do{if((z|0)==0){I=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){I=z;break}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){I=z;break}c[u>>2]=0;I=0}}while(0);u=(I|0)==0;z=c[y>>2]|0;do{if((z|0)==0){E=828}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(!u){break}J=b|0;c[J>>2]=I;fb(m);i=d;return}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[y>>2]=0;E=828;break}if(!(u^(z|0)==0)){break}J=b|0;c[J>>2]=I;fb(m);i=d;return}}while(0);do{if((E|0)==828){if(u){break}J=b|0;c[J>>2]=I;fb(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;J=b|0;c[J>>2]=I;fb(m);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function hx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b4(b|0)|0;b=a4(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}b4(h|0)|0;i=f;return b|0}function hy(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cw[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}fW(r,g);q=r|0;r=c[q>>2]|0;if((c[4726]|0)!=-1){c[m>>2]=18904;c[m+4>>2]=16;c[m+8>>2]=0;fi(18904,m,120)}m=(c[4727]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;eU(n)|0;fW(s,g);n=s|0;p=c[n>>2]|0;if((c[4630]|0)!=-1){c[l>>2]=18520;c[l+4>>2]=16;c[l+8>>2]=0;fi(18520,l,120)}d=(c[4631]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;eU(z)|0;z=t|0;A=x;cy[c[(c[A>>2]|0)+24>>2]&127](z,y);cy[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(hz(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];fu(t+12|0);fu(t|0);i=k;return}}while(0);o=ck(4)|0;l7(o);bE(o|0,13328,164)}}while(0);k=ck(4)|0;l7(k);bE(k|0,13328,164)}function hz(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=ms(m)|0;if((o|0)!=0){p=o;q=o;break}mH();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){A=cB[c[(c[r>>2]|0)+36>>2]&255](r)|0}else{A=c[m>>2]|0}if((A|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){B=z;C=0}else{y=c[m+12>>2]|0;if((y|0)==(c[m+16>>2]|0)){D=cB[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{D=c[y>>2]|0}if((D|0)==-1){c[b>>2]=0;E=0}else{E=m}B=c[u>>2]|0;C=E}F=(C|0)==0;if(!((r^F)&(s|0)!=0)){break}r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){G=cB[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{G=c[r>>2]|0}if(k){H=G}else{H=cz[c[(c[e>>2]|0)+28>>2]&63](h,G)|0}do{if(n){I=x;J=s}else{r=t+1|0;L1098:do{if(k){m=s;y=x;o=p;w=0;v=f;while(1){do{if((a[o]|0)==1){K=v;if((a[K]&1)==0){L=v+4|0}else{L=c[v+8>>2]|0}if((H|0)!=(c[L+(t<<2)>>2]|0)){a[o]=0;M=w;N=y;O=m-1|0;break}P=d[K]|0;if((P&1|0)==0){Q=P>>>1}else{Q=c[v+4>>2]|0}if((Q|0)!=(r|0)){M=1;N=y;O=m;break}a[o]=2;M=1;N=y+1|0;O=m-1|0}else{M=w;N=y;O=m}}while(0);P=v+12|0;if((P|0)==(g|0)){R=O;S=N;T=M;break L1098}m=O;y=N;o=o+1|0;w=M;v=P}}else{v=s;w=x;o=p;y=0;m=f;while(1){do{if((a[o]|0)==1){P=m;if((a[P]&1)==0){U=m+4|0}else{U=c[m+8>>2]|0}if((H|0)!=(cz[c[(c[e>>2]|0)+28>>2]&63](h,c[U+(t<<2)>>2]|0)|0)){a[o]=0;V=y;W=w;X=v-1|0;break}K=d[P]|0;if((K&1|0)==0){Y=K>>>1}else{Y=c[m+4>>2]|0}if((Y|0)!=(r|0)){V=1;W=w;X=v;break}a[o]=2;V=1;W=w+1|0;X=v-1|0}else{V=y;W=w;X=v}}while(0);K=m+12|0;if((K|0)==(g|0)){R=X;S=W;T=V;break L1098}v=X;w=W;o=o+1|0;y=V;m=K}}}while(0);if(!T){I=S;J=R;break}r=c[u>>2]|0;m=r+12|0;y=c[m>>2]|0;if((y|0)==(c[r+16>>2]|0)){o=c[(c[r>>2]|0)+40>>2]|0;cB[o&255](r)|0}else{c[m>>2]=y+4}if((S+R|0)>>>0<2|n){I=S;J=R;break}y=t+1|0;m=S;r=p;o=f;while(1){do{if((a[r]|0)==2){w=d[o]|0;if((w&1|0)==0){Z=w>>>1}else{Z=c[o+4>>2]|0}if((Z|0)==(y|0)){_=m;break}a[r]=0;_=m-1|0}else{_=m}}while(0);w=o+12|0;if((w|0)==(g|0)){I=_;J=R;break}else{m=_;r=r+1|0;o=w}}}}while(0);t=t+1|0;x=I;s=J}do{if((B|0)==0){$=1}else{J=c[B+12>>2]|0;if((J|0)==(c[B+16>>2]|0)){aa=cB[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{aa=c[J>>2]|0}if((aa|0)==-1){c[u>>2]=0;$=1;break}else{$=(c[u>>2]|0)==0;break}}}while(0);do{if(F){ab=968}else{u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){ac=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{ac=c[u>>2]|0}if((ac|0)==-1){c[b>>2]=0;ab=968;break}else{if($^(C|0)==0){break}else{ab=970;break}}}}while(0);if((ab|0)==968){if($){ab=970}}if((ab|0)==970){c[j>>2]=c[j>>2]|2}L1179:do{if(n){ab=975}else{$=f;C=p;while(1){if((a[C]|0)==2){ad=$;break L1179}b=$+12|0;if((b|0)==(g|0)){ab=975;break L1179}$=b;C=C+1|0}}}while(0);if((ab|0)==975){c[j>>2]=c[j>>2]|4;ad=g}if((q|0)==0){i=l;return ad|0}mt(q);i=l;return ad|0}function hA(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}s=k|0;hE(m,g,s,l);g=n|0;mK(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L1197:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=999}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=999;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L1197}}}}while(0);if((y|0)==999){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((hB(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=hd(g,c[o>>2]|0,h,t)|0;hb(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=1030}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=1030;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;fb(m);i=b;return}}while(0);do{if((y|0)==1030){if(k){break}L=a|0;c[L>>2]=I;fb(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;fb(m);i=b;return}function hB(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[15424+m|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[15424+m|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function hC(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}s=k|0;hE(m,g,s,l);g=n|0;mK(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L1312:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=1089}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=1089;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L1312}}}}while(0);if((y|0)==1089){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((hB(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=hg(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=L;hb(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=1120}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=1120;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;fb(m);i=b;return}}while(0);do{if((y|0)==1120){if(k){break}M=a|0;c[M>>2]=I;fb(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;fb(m);i=b;return}function hD(a,e,f,g,h,j,k){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;hE(n,h,t,m);h=o|0;mK(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L1381:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=cB[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=1144}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=cB[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=1144;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L1381}}}}while(0);if((z|0)==1144){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((hB(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;cB[G&255](v)|0;m=v;continue}else{c[w>>2]=A+4;m=v;continue}}m=d[n]|0;if((m&1|0)==0){I=m>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=D}}while(0);b[k>>1]=hi(h,c[p>>2]|0,j,u)|0;hb(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=1175}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=cB[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=1175;break}if(!(l^(E|0)==0)){break}M=a|0;c[M>>2]=J;fb(n);i=e;return}}while(0);do{if((z|0)==1175){if(l){break}M=a|0;c[M>>2]=J;fb(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;M=a|0;c[M>>2]=J;fb(n);i=e;return}function hE(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;fW(j,b);b=j|0;j=c[b>>2]|0;if((c[4726]|0)!=-1){c[h>>2]=18904;c[h+4>>2]=16;c[h+8>>2]=0;fi(18904,h,120)}h=(c[4727]|0)-1|0;k=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-k>>2>>>0>h>>>0){l=c[k+(h<<2)>>2]|0;if((l|0)==0){break}m=l;n=c[(c[l>>2]|0)+48>>2]|0;cK[n&15](m,15424,15450,d)|0;m=c[b>>2]|0;if((c[4630]|0)!=-1){c[g>>2]=18520;c[g+4>>2]=16;c[g+8>>2]=0;fi(18520,g,120)}n=(c[4631]|0)-1|0;l=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-l>>2>>>0>n>>>0){o=c[l+(n<<2)>>2]|0;if((o|0)==0){break}p=o;c[e>>2]=cB[c[(c[o>>2]|0)+16>>2]&255](p)|0;cy[c[(c[o>>2]|0)+20>>2]&127](a,p);p=c[b>>2]|0;eU(p)|0;i=f;return}}while(0);n=ck(4)|0;l7(n);bE(n|0,13328,164)}}while(0);f=ck(4)|0;l7(f);bE(f|0,13328,164)}function hF(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k|0;hE(m,g,s,l);g=n|0;mK(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L1470:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=1216}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=1216;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L1470}}}}while(0);if((y|0)==1216){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((hB(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=hk(g,c[o>>2]|0,h,t)|0;hb(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=1247}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=1247;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;fb(m);i=b;return}}while(0);do{if((y|0)==1247){if(k){break}L=a|0;c[L>>2]=I;fb(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;fb(m);i=b;return}function hG(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}s=k|0;hE(m,g,s,l);g=n|0;mK(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L1539:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=1271}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=1271;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L1539}}}}while(0);if((y|0)==1271){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((hB(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=hm(g,c[o>>2]|0,h,t)|0;hb(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=1302}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=1302;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;fb(m);i=b;return}}while(0);do{if((y|0)==1302){if(k){break}L=a|0;c[L>>2]=I;fb(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;fb(m);i=b;return}function hH(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k|0;hE(m,g,s,l);g=n|0;mK(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L1608:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=1326}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=1326;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L1608}}}}while(0);if((y|0)==1326){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((hB(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=ho(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=L;hb(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=1357}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=1357;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;fb(m);i=b;return}}while(0);do{if((y|0)==1357){if(k){break}M=a|0;c[M>>2]=I;fb(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;fb(m);i=b;return}function hI(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if((b|0)==(i|0)){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+128|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((c[j>>2]|0)==(b|0)){u=j;break}else{j=j+4|0}}j=u-o|0;o=j>>2;if((j|0)>124){r=-1;return r|0}u=a[15424+o|0]|0;do{if((o|0)==25|(o|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=u;r=0;return r|0}else if((o|0)==22|(o|0)==23){a[f]=80}else{b=a[f]|0;if((u&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){v=b>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}t=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=t}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=u}if((j|0)>84){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function hJ(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;hK(p,j,w,n,o);j=e+168|0;mK(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L1740:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cB[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=1429}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=1429;break}else{if(A^(C|0)==0){break}else{break L1740}}}}while(0);if((D|0)==1429){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((hI(H,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cB[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);K=+mG(j,m,c[4384]|0);if((c[m>>2]|0)==(t|0)){J=K;break}else{c[k>>2]=4;J=0.0;break}}}while(0);g[l>>2]=J;hb(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=1471}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=1471;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;fb(p);i=e;return}}while(0);do{if((D|0)==1471){if(y){break}O=b|0;c[O>>2]=L;fb(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;fb(p);i=e;return}function hK(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;fW(k,b);b=k|0;k=c[b>>2]|0;if((c[4726]|0)!=-1){c[j>>2]=18904;c[j+4>>2]=16;c[j+8>>2]=0;fi(18904,j,120)}j=(c[4727]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;cK[o&15](n,15424,15456,d)|0;n=c[b>>2]|0;if((c[4630]|0)!=-1){c[h>>2]=18520;c[h+4>>2]=16;c[h+8>>2]=0;fi(18520,h,120)}o=(c[4631]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=p;c[e>>2]=cB[c[(c[r>>2]|0)+12>>2]&255](q)|0;c[f>>2]=cB[c[(c[r>>2]|0)+16>>2]&255](q)|0;cy[c[(c[p>>2]|0)+20>>2]&127](a,q);q=c[b>>2]|0;eU(q)|0;i=g;return}}while(0);o=ck(4)|0;l7(o);bE(o|0,13328,164)}}while(0);g=ck(4)|0;l7(g);bE(g|0,13328,164)}function hL(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;hK(p,j,w,n,o);j=e+168|0;mK(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L1838:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cB[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=1509}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=1509;break}else{if(A^(C|0)==0){break}else{break L1838}}}}while(0);if((D|0)==1509){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((hI(H,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cB[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);K=+mG(j,m,c[4384]|0);if((c[m>>2]|0)==(t|0)){J=K;break}c[k>>2]=4;J=0.0}}while(0);h[l>>3]=J;hb(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=1550}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=1550;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;fb(p);i=e;return}}while(0);do{if((D|0)==1550){if(y){break}O=b|0;c[O>>2]=L;fb(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;fb(p);i=e;return}function hM(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;hK(p,j,w,n,o);j=e+168|0;mK(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L1913:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cB[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=1570}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=1570;break}else{if(A^(C|0)==0){break}else{break L1913}}}}while(0);if((D|0)==1570){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((hI(H,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cB[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);K=+mG(j,m,c[4384]|0);if((c[m>>2]|0)==(t|0)){J=K;break}c[k>>2]=4;J=0.0}}while(0);h[l>>3]=J;hb(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=1611}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=1611;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;fb(p);i=e;return}}while(0);do{if((D|0)==1611){if(y){break}O=b|0;c[O>>2]=L;fb(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;fb(p);i=e;return}function hN(a){a=a|0;eC(a|0);mC(a);return}function hO(a){a=a|0;eC(a|0);return}function hP(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[6264]|0;a[q+1|0]=a[6265|0]|0;a[q+2|0]=a[6266|0]|0;a[q+3|0]=a[6267|0]|0;a[q+4|0]=a[6268|0]|0;a[q+5|0]=a[6269|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);v=hS(u,c[4384]|0,q,(C=i,i=i+8|0,c[C>>2]=h,C)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1641;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1641;break}w=k+2|0}else if((q|0)==32){w=h}else{x=1641}}while(0);if((x|0)==1641){w=u}x=l|0;fW(o,f);hW(u,w,h,x,m,n,o);eU(c[o>>2]|0)|0;c[p>>2]=c[e>>2];dC(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function hQ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+136|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+120|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;mK(m|0,0,12);fW(n,g);g=n|0;n=c[g>>2]|0;if((c[4726]|0)!=-1){c[k>>2]=18904;c[k+4>>2]=16;c[k+8>>2]=0;fi(18904,k,120)}k=(c[4727]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+48>>2]|0;cK[x&15](v,15424,15450,w)|0;v=c[g>>2]|0;eU(v)|0;v=o|0;mK(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L2029:while(1){do{if((z|0)==0){A=0}else{B=c[z+12>>2]|0;if((B|0)==(c[z+16>>2]|0)){D=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{D=c[B>>2]|0}if((D|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);B=(A|0)==0;E=c[y>>2]|0;do{if((E|0)==0){F=1666}else{G=c[E+12>>2]|0;if((G|0)==(c[E+16>>2]|0)){H=cB[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[y>>2]=0;F=1666;break}else{if(B^(E|0)==0){break}else{break L2029}}}}while(0);if((F|0)==1666){F=0;if(B){break}}E=A+12|0;G=c[E>>2]|0;I=A+16|0;if((G|0)==(c[I>>2]|0)){J=cB[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{J=c[G>>2]|0}if((hB(J,16,v,p,s,0,m,x,r,w)|0)!=0){break}G=c[E>>2]|0;if((G|0)==(c[I>>2]|0)){I=c[(c[A>>2]|0)+40>>2]|0;cB[I&255](A)|0;z=A;continue}else{c[E>>2]=G+4;z=A;continue}}a[o+39|0]=0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);if((hx(v,c[4384]|0,4312,(C=i,i=i+8|0,c[C>>2]=j,C)|0)|0)!=1){c[h>>2]=4}z=c[u>>2]|0;do{if((z|0)==0){K=0}else{w=c[z+12>>2]|0;if((w|0)==(c[z+16>>2]|0)){L=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[w>>2]|0}if((L|0)!=-1){K=z;break}c[u>>2]=0;K=0}}while(0);u=(K|0)==0;z=c[y>>2]|0;do{if((z|0)==0){F=1699}else{v=c[z+12>>2]|0;if((v|0)==(c[z+16>>2]|0)){M=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{M=c[v>>2]|0}if((M|0)==-1){c[y>>2]=0;F=1699;break}if(!(u^(z|0)==0)){break}N=b|0;c[N>>2]=K;fb(m);i=d;return}}while(0);do{if((F|0)==1699){if(u){break}N=b|0;c[N>>2]=K;fb(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;N=b|0;c[N>>2]=K;fb(m);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function hR(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cJ[o&63](b,d,l,f,g,h&1);i=j;return}fW(m,f);f=m|0;m=c[f>>2]|0;if((c[4632]|0)!=-1){c[k>>2]=18528;c[k+4>>2]=16;c[k+8>>2]=0;fi(18528,k,120)}k=(c[4633]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;eU(o)|0;o=c[l>>2]|0;if(h){cy[c[o+24>>2]&127](n,d)}else{cy[c[o+28>>2]&127](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){p=d+1|0;q=p;r=p;s=n+8|0}else{p=n+8|0;q=c[p>>2]|0;r=d+1|0;s=p}p=e|0;d=n+4|0;t=q;u=l;while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}l=u&255;if((t|0)==(v+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){break}l=a[t]|0;w=c[p>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)!=(c[w+28>>2]|0)){c[x>>2]=y+1;a[y]=l;break}if((cz[c[(c[w>>2]|0)+52>>2]&63](w,l&255)|0)!=-1){break}c[p>>2]=0}}while(0);t=t+1|0;u=a[o]|0}c[b>>2]=c[p>>2];fb(n);i=j;return}}while(0);j=ck(4)|0;l7(j);bE(j|0,13328,164)}function hS(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b4(b|0)|0;b=b3(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}b4(h|0)|0;i=f;return b|0}function hT(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);t=hS(u,c[4384]|0,r,(C=i,i=i+16|0,c[C>>2]=h,c[C+8>>2]=j,C)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1766;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1766;break}w=l+2|0}else{x=1766}}while(0);if((x|0)==1766){w=u}x=m|0;fW(p,f);hW(u,w,j,x,n,o,p);eU(c[p>>2]|0)|0;c[q>>2]=c[e>>2];dC(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function hU(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[6264]|0;a[q+1|0]=a[6265|0]|0;a[q+2|0]=a[6266|0]|0;a[q+3|0]=a[6267|0]|0;a[q+4|0]=a[6268|0]|0;a[q+5|0]=a[6269|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);t=hS(u,c[4384]|0,q,(C=i,i=i+8|0,c[C>>2]=h,C)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){w=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1791;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1791;break}w=k+2|0}else{x=1791}}while(0);if((x|0)==1791){w=u}x=l|0;fW(o,f);hW(u,w,h,x,m,n,o);eU(c[o>>2]|0)|0;c[p>>2]=c[e>>2];dC(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function hV(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);t=hS(u,c[4384]|0,r,(C=i,i=i+16|0,c[C>>2]=h,c[C+8>>2]=j,C)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1816;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1816;break}w=l+2|0}else if((h|0)==32){w=j}else{x=1816}}while(0);if((x|0)==1816){w=u}x=m|0;fW(p,f);hW(u,w,j,x,n,o,p);eU(c[p>>2]|0)|0;c[q>>2]=c[e>>2];dC(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function hW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[4728]|0)!=-1){c[n>>2]=18912;c[n+4>>2]=16;c[n+8>>2]=0;fi(18912,n,120)}n=(c[4729]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}r=k;s=c[p>>2]|0;if((c[4632]|0)!=-1){c[m>>2]=18528;c[m+4>>2]=16;c[m+8>>2]=0;fi(18528,m,120)}m=(c[4633]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;cK[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cz[c[(c[k>>2]|0)+28>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cz[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+1;a[y]=q;q=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1;a[I]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-1|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=a[J]|0;a[J]=a[K]|0;a[K]=C;J=J+1|0;K=K-1|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;fb(o);i=l;return}else{L=g+(e-b)|0;c[h>>2]=L;fb(o);i=l;return}}function hX(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=c[4384]|0;if(y){z=hY(k,30,l,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{z=hY(k,30,l,t,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0}do{if((z|0)>29){l=(a[19496]|0)==0;if(y){do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}l=c[m>>2]|0;if((l|0)!=0){B=A;D=l;E=l;break}mH();l=c[m>>2]|0;B=A;D=l;E=l}else{B=z;D=0;E=c[m>>2]|0}}while(0);z=E+B|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((B|0)>1&u<<24>>24==48)){G=1924;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1924;break}F=E+2|0}else if((A|0)==32){F=z}else{G=1924}}while(0);if((G|0)==1924){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ms(B<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}mH();H=0;I=0;J=c[m>>2]|0}}while(0);fW(q,f);h$(J,F,z,H,o,p,q);eU(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];dC(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){mt(I)}if((D|0)==0){i=d;return}mt(D);i=d;return}function hY(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=b4(d|0)|0;d=b5(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}b4(j|0)|0;i=g;return d|0}function hZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b4(b|0)|0;b=cn(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}b4(h|0)|0;i=f;return b|0}function h_(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=c[4384]|0;if(y){z=hY(k,30,l,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{z=hY(k,30,l,t,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0}do{if((z|0)>29){l=(a[19496]|0)==0;if(y){do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0}l=c[m>>2]|0;if((l|0)!=0){B=A;D=l;E=l;break}mH();l=c[m>>2]|0;B=A;D=l;E=l}else{B=z;D=0;E=c[m>>2]|0}}while(0);z=E+B|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((B|0)>1&u<<24>>24==48)){G=2015;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=2015;break}F=E+2|0}else if((A|0)==32){F=z}else{G=2015}}while(0);if((G|0)==2015){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ms(B<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}mH();H=0;I=0;J=c[m>>2]|0}}while(0);fW(q,f);h$(J,F,z,H,o,p,q);eU(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];dC(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){mt(I)}if((D|0)==0){i=d;return}mt(D);i=d;return}function h$(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[4728]|0)!=-1){c[n>>2]=18912;c[n+4>>2]=16;c[n+8>>2]=0;fi(18912,n,120)}n=(c[4729]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}r=k;s=c[p>>2]|0;if((c[4632]|0)!=-1){c[m>>2]=18528;c[m+4>>2]=16;c[m+8>>2]=0;fi(18528,m,120)}m=(c[4633]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cz[c[(c[k>>2]|0)+28>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=m;v=b+1|0}else{v=b}m=f;L2488:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=2070;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=2070;break}p=k;n=cz[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L2488}u=a[q]|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);if((bh(u<<24>>24|0,c[4384]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=2070}}while(0);L2503:do{if((x|0)==2070){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L2503}q=a[w]|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);if((cb(q<<24>>24|0,c[4384]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=2070}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+32>>2]|0;cK[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+1;a[J]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-1|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=a[K]|0;a[K]=a[L]|0;a[L]=D;K=K+1|0;L=L-1|0;}while(K>>>0<L>>>0)}}while(0);L2542:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cz[c[(c[L>>2]|0)+28>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+1;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L2542}}L=cB[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+1;a[H]=L;M=K+1|0}else{M=y}}while(0);cK[c[(c[k>>2]|0)+32>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;fb(o);i=l;return}N=g+(e-b)|0;c[h>>2]=N;fb(o);i=l;return}function h0(a){a=a|0;eC(a|0);mC(a);return}function h1(a){a=a|0;eC(a|0);return}function h2(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[6264]|0;a[q+1|0]=a[6265|0]|0;a[q+2|0]=a[6266|0]|0;a[q+3|0]=a[6267|0]|0;a[q+4|0]=a[6268|0]|0;a[q+5|0]=a[6269|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);t=hS(u,c[4384]|0,q,(C=i,i=i+8|0,c[C>>2]=h,C)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=2138;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=2138;break}w=k+2|0}else if((q|0)==32){w=h}else{x=2138}}while(0);if((x|0)==2138){w=u}x=l|0;fW(o,f);h5(u,w,h,x,m,n,o);eU(c[o>>2]|0)|0;c[p>>2]=c[e>>2];h6(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function h3(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[6272]|0;a[o+1|0]=a[6273|0]|0;a[o+2|0]=a[6274|0]|0;a[o+3|0]=a[6275|0]|0;a[o+4|0]=a[6276|0]|0;a[o+5|0]=a[6277|0]|0;p=k|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);q=hS(p,c[4384]|0,o,(C=i,i=i+8|0,c[C>>2]=h,C)|0)|0;h=k+q|0;o=c[f+4>>2]&176;do{if((o|0)==32){r=h}else if((o|0)==16){s=a[p]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){r=k+1|0;break}if(!((q|0)>1&s<<24>>24==48)){t=2153;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){t=2153;break}r=k+2|0}else{t=2153}}while(0);if((t|0)==2153){r=p}fW(m,f);t=m|0;m=c[t>>2]|0;if((c[4728]|0)!=-1){c[j>>2]=18912;c[j+4>>2]=16;c[j+8>>2]=0;fi(18912,j,120)}j=(c[4729]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){s=c[o+(j<<2)>>2]|0;if((s|0)==0){break}u=s;v=c[t>>2]|0;eU(v)|0;v=l|0;w=c[(c[s>>2]|0)+32>>2]|0;cK[w&15](u,p,h,v)|0;u=l+q|0;if((r|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;dC(b,n,v,x,u,f,g);i=d;return}x=l+(r-k)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;dC(b,n,v,x,u,f,g);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function h4(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cJ[o&63](b,d,l,f,g,h&1);i=j;return}fW(m,f);f=m|0;m=c[f>>2]|0;if((c[4630]|0)!=-1){c[k>>2]=18520;c[k+4>>2]=16;c[k+8>>2]=0;fi(18520,k,120)}k=(c[4631]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;eU(o)|0;o=c[l>>2]|0;if(h){cy[c[o+24>>2]&127](n,d)}else{cy[c[o+28>>2]&127](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;p=l;q=l;r=n+8|0}else{l=n+8|0;p=c[l>>2]|0;q=n+4|0;r=l}l=e|0;s=p;t=o;while(1){if((t&1)==0){u=q}else{u=c[r>>2]|0}o=t&255;if((o&1|0)==0){v=o>>>1}else{v=c[q>>2]|0}if((s|0)==(u+(v<<2)|0)){break}o=c[s>>2]|0;w=c[l>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)==(c[w+28>>2]|0)){z=cz[c[(c[w>>2]|0)+52>>2]&63](w,o)|0}else{c[x>>2]=y+4;c[y>>2]=o;z=o}if((z|0)!=-1){break}c[l>>2]=0}}while(0);s=s+4|0;t=a[d]|0}c[b>>2]=c[l>>2];fu(n);i=j;return}}while(0);j=ck(4)|0;l7(j);bE(j|0,13328,164)}
function h5(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[4726]|0)!=-1){c[n>>2]=18904;c[n+4>>2]=16;c[n+8>>2]=0;fi(18904,n,120)}n=(c[4727]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}r=k;s=c[p>>2]|0;if((c[4630]|0)!=-1){c[m>>2]=18520;c[m+4>>2]=16;c[m+8>>2]=0;fi(18520,m,120)}m=(c[4631]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;cK[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cz[c[(c[k>>2]|0)+44>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cz[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+4;c[y>>2]=q;q=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b<<2)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-4|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=c[J>>2]|0;c[J>>2]=c[K>>2];c[K>>2]=C;J=J+4|0;K=K-4|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;fb(o);i=l;return}else{L=g+(e-b<<2)|0;c[h>>2]=L;fb(o);i=l;return}}function h6(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cA[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){fC(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((cA[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){fu(l);break}c[m>>2]=0;c[b>>2]=0;fu(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((cA[c[(c[d>>2]|0)+48>>2]&63](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function h7(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);t=hS(u,c[4384]|0,r,(C=i,i=i+16|0,c[C>>2]=h,c[C+8>>2]=j,C)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=2298;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=2298;break}w=l+2|0}else{x=2298}}while(0);if((x|0)==2298){w=u}x=m|0;fW(p,f);h5(u,w,j,x,n,o,p);eU(c[p>>2]|0)|0;c[q>>2]=c[e>>2];h6(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function h8(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[6264]|0;a[q+1|0]=a[6265|0]|0;a[q+2|0]=a[6266|0]|0;a[q+3|0]=a[6267|0]|0;a[q+4|0]=a[6268|0]|0;a[q+5|0]=a[6269|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=k|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);v=hS(u,c[4384]|0,q,(C=i,i=i+8|0,c[C>>2]=h,C)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==32){w=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=2323;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=2323;break}w=k+2|0}else{x=2323}}while(0);if((x|0)==2323){w=u}x=l|0;fW(o,f);h5(u,w,h,x,m,n,o);eU(c[o>>2]|0)|0;c[p>>2]=c[e>>2];h6(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function h9(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=l|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);t=hS(u,c[4384]|0,r,(C=i,i=i+16|0,c[C>>2]=h,c[C+8>>2]=j,C)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=j}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=2348;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=2348;break}w=l+2|0}else{x=2348}}while(0);if((x|0)==2348){w=u}x=m|0;fW(p,f);h5(u,w,j,x,n,o,p);eU(c[p>>2]|0)|0;c[q>>2]=c[e>>2];h6(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function ia(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=c[4384]|0;if(y){z=hY(k,30,l,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{z=hY(k,30,l,t,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0}do{if((z|0)>29){l=(a[19496]|0)==0;if(y){do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}l=c[m>>2]|0;if((l|0)!=0){B=A;D=l;E=l;break}mH();l=c[m>>2]|0;B=A;D=l;E=l}else{B=z;D=0;E=c[m>>2]|0}}while(0);z=E+B|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((B|0)>1&u<<24>>24==48)){G=2404;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=2404;break}F=E+2|0}else if((A|0)==32){F=z}else{G=2404}}while(0);if((G|0)==2404){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ms(B<<3)|0;A=G;if((G|0)!=0){H=A;I=A;J=E;break}mH();H=A;I=A;J=c[m>>2]|0}}while(0);fW(q,f);ib(J,F,z,H,o,p,q);eU(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];h6(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){mt(I)}if((D|0)==0){i=d;return}mt(D);i=d;return}function ib(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[4726]|0)!=-1){c[n>>2]=18904;c[n+4>>2]=16;c[n+8>>2]=0;fi(18904,n,120)}n=(c[4727]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;l7(s);bE(r|0,13328,164)}r=k;s=c[p>>2]|0;if((c[4630]|0)!=-1){c[m>>2]=18520;c[m+4>>2]=16;c[m+8>>2]=0;fi(18520,m,120)}m=(c[4631]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;l7(u);bE(t|0,13328,164)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cz[c[(c[k>>2]|0)+44>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=m;v=b+1|0}else{v=b}m=f;L2946:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=2459;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=2459;break}p=k;n=cz[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L2946}u=a[q]|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);if((bh(u<<24>>24|0,c[4384]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=2459}}while(0);L2961:do{if((x|0)==2459){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L2961}q=a[w]|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);if((cb(q<<24>>24|0,c[4384]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=2459}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+48>>2]|0;cK[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z<<2)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b<<2)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-4|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=c[K>>2]|0;c[K>>2]=c[L>>2];c[L>>2]=D;K=K+4|0;L=L-4|0;}while(K>>>0<L>>>0)}}while(0);L3000:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cz[c[(c[L>>2]|0)+44>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L3000}}L=cB[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+4;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);cK[c[(c[k>>2]|0)+48>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M<<2)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;fb(o);i=l;return}N=g+(e-b<<2)|0;c[h>>2]=N;fb(o);i=l;return}function ic(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);l=c[4384]|0;if(y){z=hY(k,30,l,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{z=hY(k,30,l,t,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0}do{if((z|0)>29){l=(a[19496]|0)==0;if(y){do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0}else{do{if(l){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);A=hZ(m,c[4384]|0,t,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0}l=c[m>>2]|0;if((l|0)!=0){B=A;D=l;E=l;break}mH();l=c[m>>2]|0;B=A;D=l;E=l}else{B=z;D=0;E=c[m>>2]|0}}while(0);z=E+B|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((B|0)>1&u<<24>>24==48)){G=2556;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=2556;break}F=E+2|0}else if((A|0)==32){F=z}else{G=2556}}while(0);if((G|0)==2556){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=ms(B<<3)|0;A=G;if((G|0)!=0){H=A;I=A;J=E;break}mH();H=A;I=A;J=c[m>>2]|0}}while(0);fW(q,f);ib(J,F,z,H,o,p,q);eU(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];h6(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){mt(I)}if((D|0)==0){i=d;return}mt(D);i=d;return}function id(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[6272]|0;a[o+1|0]=a[6273|0]|0;a[o+2|0]=a[6274|0]|0;a[o+3|0]=a[6275|0]|0;a[o+4|0]=a[6276|0]|0;a[o+5|0]=a[6277|0]|0;p=k|0;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);q=hS(p,c[4384]|0,o,(C=i,i=i+8|0,c[C>>2]=h,C)|0)|0;h=k+q|0;o=c[f+4>>2]&176;do{if((o|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=2589;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=2589;break}s=k+2|0}else if((o|0)==32){s=h}else{t=2589}}while(0);if((t|0)==2589){s=p}fW(m,f);t=m|0;m=c[t>>2]|0;if((c[4726]|0)!=-1){c[j>>2]=18904;c[j+4>>2]=16;c[j+8>>2]=0;fi(18904,j,120)}j=(c[4727]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){r=c[o+(j<<2)>>2]|0;if((r|0)==0){break}u=r;v=c[t>>2]|0;eU(v)|0;v=l|0;w=c[(c[r>>2]|0)+48>>2]|0;cK[w&15](u,p,h,v)|0;u=l+(q<<2)|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;h6(b,n,v,x,u,f,g);i=d;return}x=l+(s-k<<2)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;h6(b,n,v,x,u,f,g);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function ie(a){a=a|0;return 2}function ig(a){a=a|0;eC(a|0);mC(a);return}function ih(a){a=a|0;eC(a|0);return}function ii(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];ik(a,b,k,l,f,g,h,6256,6264);i=j;return}function ij(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cB[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}ik(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function ik(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;fW(p,h);t=p|0;p=c[t>>2]|0;if((c[4728]|0)!=-1){c[o>>2]=18912;c[o+4>>2]=16;c[o+8>>2]=0;fi(18912,o,120)}o=(c[4729]|0)-1|0;u=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-u>>2>>>0>o>>>0){v=c[u+(o<<2)>>2]|0;if((v|0)==0){break}w=v;x=c[t>>2]|0;eU(x)|0;c[j>>2]=0;x=f|0;L3143:do{if((l|0)==(m|0)){y=2679}else{z=g|0;A=v;B=v+8|0;C=v;D=e;E=r|0;F=s|0;G=q|0;H=l;I=0;L3145:while(1){J=I;while(1){if((J|0)!=0){y=2679;break L3143}K=c[x>>2]|0;do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}if((cB[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){L=K;break}c[x>>2]=0;L=0}}while(0);K=(L|0)==0;M=c[z>>2]|0;L3155:do{if((M|0)==0){y=2632}else{do{if((c[M+12>>2]|0)==(c[M+16>>2]|0)){if((cB[c[(c[M>>2]|0)+36>>2]&255](M)|0)!=-1){break}c[z>>2]=0;y=2632;break L3155}}while(0);if(K){N=M}else{y=2633;break L3145}}}while(0);if((y|0)==2632){y=0;if(K){y=2633;break L3145}else{N=0}}if((cA[c[(c[A>>2]|0)+36>>2]&63](w,a[H]|0,0)|0)<<24>>24==37){y=2636;break}M=a[H]|0;if(M<<24>>24>-1){O=c[B>>2]|0;if((b[O+(M<<24>>24<<1)>>1]&8192)!=0){P=H;y=2647;break}}Q=L+12|0;M=c[Q>>2]|0;R=L+16|0;if((M|0)==(c[R>>2]|0)){S=(cB[c[(c[L>>2]|0)+36>>2]&255](L)|0)&255}else{S=a[M]|0}M=cz[c[(c[C>>2]|0)+12>>2]&63](w,S)|0;if(M<<24>>24==(cz[c[(c[C>>2]|0)+12>>2]&63](w,a[H]|0)|0)<<24>>24){y=2674;break}c[j>>2]=4;J=4}L3173:do{if((y|0)==2636){y=0;J=H+1|0;if((J|0)==(m|0)){y=2637;break L3145}M=cA[c[(c[A>>2]|0)+36>>2]&63](w,a[J]|0,0)|0;if((M<<24>>24|0)==69|(M<<24>>24|0)==48){T=H+2|0;if((T|0)==(m|0)){y=2640;break L3145}U=M;V=cA[c[(c[A>>2]|0)+36>>2]&63](w,a[T]|0,0)|0;W=T}else{U=0;V=M;W=J}J=c[(c[D>>2]|0)+36>>2]|0;c[E>>2]=L;c[F>>2]=N;cH[J&7](q,e,r,s,h,j,k,V,U);c[x>>2]=c[G>>2];X=W+1|0}else if((y|0)==2647){while(1){y=0;J=P+1|0;if((J|0)==(m|0)){Y=m;break}M=a[J]|0;if(M<<24>>24<=-1){Y=J;break}if((b[O+(M<<24>>24<<1)>>1]&8192)==0){Y=J;break}else{P=J;y=2647}}K=L;J=N;while(1){do{if((K|0)==0){Z=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){Z=K;break}if((cB[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){Z=K;break}c[x>>2]=0;Z=0}}while(0);M=(Z|0)==0;do{if((J|0)==0){y=2660}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(M){_=J;break}else{X=Y;break L3173}}if((cB[c[(c[J>>2]|0)+36>>2]&255](J)|0)==-1){c[z>>2]=0;y=2660;break}else{if(M^(J|0)==0){_=J;break}else{X=Y;break L3173}}}}while(0);if((y|0)==2660){y=0;if(M){X=Y;break L3173}else{_=0}}T=Z+12|0;$=c[T>>2]|0;aa=Z+16|0;if(($|0)==(c[aa>>2]|0)){ab=(cB[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)&255}else{ab=a[$]|0}if(ab<<24>>24<=-1){X=Y;break L3173}if((b[(c[B>>2]|0)+(ab<<24>>24<<1)>>1]&8192)==0){X=Y;break L3173}$=c[T>>2]|0;if(($|0)==(c[aa>>2]|0)){aa=c[(c[Z>>2]|0)+40>>2]|0;cB[aa&255](Z)|0;K=Z;J=_;continue}else{c[T>>2]=$+1;K=Z;J=_;continue}}}else if((y|0)==2674){y=0;J=c[Q>>2]|0;if((J|0)==(c[R>>2]|0)){K=c[(c[L>>2]|0)+40>>2]|0;cB[K&255](L)|0}else{c[Q>>2]=J+1}X=H+1|0}}while(0);if((X|0)==(m|0)){y=2679;break L3143}H=X;I=c[j>>2]|0}if((y|0)==2637){c[j>>2]=4;ac=L;break}else if((y|0)==2640){c[j>>2]=4;ac=L;break}else if((y|0)==2633){c[j>>2]=4;ac=L;break}}}while(0);if((y|0)==2679){ac=c[x>>2]|0}w=f|0;do{if((ac|0)!=0){if((c[ac+12>>2]|0)!=(c[ac+16>>2]|0)){break}if((cB[c[(c[ac>>2]|0)+36>>2]&255](ac)|0)!=-1){break}c[w>>2]=0}}while(0);x=c[w>>2]|0;v=(x|0)==0;I=g|0;H=c[I>>2]|0;L3231:do{if((H|0)==0){y=2689}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((cB[c[(c[H>>2]|0)+36>>2]&255](H)|0)!=-1){break}c[I>>2]=0;y=2689;break L3231}}while(0);if(!v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);do{if((y|0)==2689){if(v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ad=d|0;c[ad>>2]=x;i=n;return}}while(0);n=ck(4)|0;l7(n);bE(n|0,13328,164)}function il(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;fW(m,f);f=m|0;m=c[f>>2]|0;if((c[4728]|0)!=-1){c[l>>2]=18912;c[l+4>>2]=16;c[l+8>>2]=0;fi(18912,l,120)}l=(c[4729]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;eU(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(g8(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=ck(4)|0;l7(j);bE(j|0,13328,164)}function im(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;fW(m,f);f=m|0;m=c[f>>2]|0;if((c[4728]|0)!=-1){c[l>>2]=18912;c[l+4>>2]=16;c[l+8>>2]=0;fi(18912,l,120)}l=(c[4729]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;eU(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(g8(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=ck(4)|0;l7(j);bE(j|0,13328,164)}function io(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;fW(l,f);f=l|0;l=c[f>>2]|0;if((c[4728]|0)!=-1){c[k>>2]=18912;c[k+4>>2]=16;c[k+8>>2]=0;fi(18912,k,120)}k=(c[4729]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;eU(n)|0;c[j>>2]=c[e>>2];n=it(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=ck(4)|0;l7(b);bE(b|0,13328,164)}function ip(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L3289:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((cB[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L3298:do{if((l|0)==0){m=2745}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((cB[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[e>>2]=0;m=2745;break L3298}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L3289}}}while(0);if((m|0)==2745){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(cB[c[(c[l>>2]|0)+36>>2]&255](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cB[u&255](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=2764}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((cB[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[e>>2]=0;m=2764;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==2764){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function iq(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;fW(z,g);_=z|0;z=c[_>>2]|0;if((c[4728]|0)!=-1){c[y>>2]=18912;c[y+4>>2]=16;c[y+8>>2]=0;fi(18912,y,120)}y=(c[4729]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;eU(aa)|0;aa=k<<24>>24;L3346:do{if((aa|0)==106){c[s>>2]=c[f>>2];ac=it(e,s,h,ab,3)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<366){c[j+28>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==89){c[m>>2]=c[f>>2];ad=it(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ad-1900}else if((aa|0)==37){c[Z>>2]=c[f>>2];is(0,e,Z,h,ab)}else if((aa|0)==73){ad=j+8|0;c[t>>2]=c[f>>2];ac=it(e,t,h,ab,2)|0;ae=c[h>>2]|0;do{if((ae&4|0)==0){if((ac-1|0)>>>0>=12){break}c[ad>>2]=ac;break L3346}}while(0);c[h>>2]=ae|4}else if((aa|0)==83){c[p>>2]=c[f>>2];ac=it(e,p,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<61){c[j>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==70){ad=e|0;c[H>>2]=c[ad>>2];c[I>>2]=c[f>>2];ik(G,d,H,I,g,h,j,6240,6248);c[ad>>2]=c[G>>2]}else if((aa|0)==84){ad=e|0;c[S>>2]=c[ad>>2];c[T>>2]=c[f>>2];ik(R,d,S,T,g,h,j,6208,6216);c[ad>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ad=it(e,o,h,ab,1)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<7){c[j+24>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ac=c[f>>2]|0;ad=d+8|0;af=cB[c[(c[ad>>2]|0)+4>>2]&255](ad)|0;c[w>>2]=ac;ac=(g8(e,w,af,af+288|0,ab,h,0)|0)-af|0;if((ac|0)>=288){break}c[j+16>>2]=((ac|0)/12|0|0)%12|0}else if((aa|0)==97|(aa|0)==65){ac=c[f>>2]|0;af=d+8|0;ad=cB[c[c[af>>2]>>2]&255](af)|0;c[x>>2]=ac;ac=(g8(e,x,ad,ad+168|0,ab,h,0)|0)-ad|0;if((ac|0)>=168){break}c[j+24>>2]=((ac|0)/12|0|0)%7|0}else if((aa|0)==120){ac=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];cw[ac&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==88){ac=d+8|0;ad=cB[c[(c[ac>>2]|0)+24>>2]&255](ac)|0;ac=e|0;c[X>>2]=c[ac>>2];c[Y>>2]=c[f>>2];af=ad;ag=a[ad]|0;if((ag&1)==0){ah=af+1|0;ai=af+1|0}else{af=c[ad+8>>2]|0;ah=af;ai=af}af=ag&255;if((af&1|0)==0){aj=af>>>1}else{aj=c[ad+4>>2]|0}ik(W,d,X,Y,g,h,j,ai,ah+aj|0);c[ac>>2]=c[W>>2]}else if((aa|0)==68){ac=e|0;c[E>>2]=c[ac>>2];c[F>>2]=c[f>>2];ik(D,d,E,F,g,h,j,6248,6256);c[ac>>2]=c[D>>2]}else if((aa|0)==77){c[q>>2]=c[f>>2];ac=it(e,q,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<60){c[j+4>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==112){c[K>>2]=c[f>>2];ir(d,j+8|0,e,K,h,ab)}else if((aa|0)==99){ad=d+8|0;ac=cB[c[(c[ad>>2]|0)+12>>2]&255](ad)|0;ad=e|0;c[B>>2]=c[ad>>2];c[C>>2]=c[f>>2];af=ac;ag=a[ac]|0;if((ag&1)==0){ak=af+1|0;al=af+1|0}else{af=c[ac+8>>2]|0;ak=af;al=af}af=ag&255;if((af&1|0)==0){am=af>>>1}else{am=c[ac+4>>2]|0}ik(A,d,B,C,g,h,j,al,ak+am|0);c[ad>>2]=c[A>>2]}else if((aa|0)==100|(aa|0)==101){ad=j+12|0;c[v>>2]=c[f>>2];ac=it(e,v,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ac-1|0)>>>0>=31){break}c[ad>>2]=ac;break L3346}}while(0);c[h>>2]=af|4}else if((aa|0)==109){c[r>>2]=c[f>>2];ac=(it(e,r,h,ab,2)|0)-1|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<12){c[j+16>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==114){ad=e|0;c[M>>2]=c[ad>>2];c[N>>2]=c[f>>2];ik(L,d,M,N,g,h,j,6224,6235);c[ad>>2]=c[L>>2]}else if((aa|0)==82){ad=e|0;c[P>>2]=c[ad>>2];c[Q>>2]=c[f>>2];ik(O,d,P,Q,g,h,j,6216,6221);c[ad>>2]=c[O>>2]}else if((aa|0)==121){c[n>>2]=c[f>>2];ad=it(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ad|0)<69){an=ad+2e3|0}else{an=(ad-69|0)>>>0<31?ad+1900|0:ad}c[j+20>>2]=an-1900}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];ip(0,e,J,h,ab)}else if((aa|0)==72){c[u>>2]=c[f>>2];ad=it(e,u,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<24){c[j+8>>2]=ad;break}else{c[h>>2]=ac|4;break}}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=ck(4)|0;l7(l);bE(l|0,13328,164)}function ir(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cB[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=g8(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function is(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L8:do{if((e|0)==0){k=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cB[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[j>>2]=0;k=11;break L8}}while(0);if(d){l=e;m=0}else{k=12}}}while(0);if((k|0)==11){if(d){k=12}else{l=0;m=1}}if((k|0)==12){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{n=a[e]|0}if((cA[c[(c[g>>2]|0)+36>>2]&63](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;cB[d&255](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((cB[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=31}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((cB[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[j>>2]=0;k=31;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==31){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function it(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L62:do{if((e|0)==0){m=51}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cB[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[l>>2]=0;m=51;break L62}}while(0);if(d){n=e}else{m=52}}}while(0);if((m|0)==51){if(d){m=52}else{n=0}}if((m|0)==52){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(cA[c[(c[d>>2]|0)+36>>2]&63](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cB[u&255](r)|0;v=q;w=h;x=n}else{c[s>>2]=t+1;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((cB[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=81;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=(cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=96;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=97;break}s=((cA[c[(c[d>>2]|0)+36>>2]&63](g,E,0)|0)<<24>>24)+(y*10|0)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;cB[G&255](r)|0;v=s;w=q;x=B;continue}else{c[u>>2]=F+1;v=s;w=q;x=B;continue}}if((m|0)==81){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L119:do{if(D){m=91}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[l>>2]=0;m=91;break L119}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==91){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}else if((m|0)==96){i=j;return o|0}else if((m|0)==97){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function iu(a){a=a|0;return 2}function iv(a){a=a|0;eC(a|0);mC(a);return}function iw(a){a=a|0;eC(a|0);return}function ix(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];iz(a,b,k,l,f,g,h,6176,6208);i=j;return}function iy(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cB[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}iz(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function iz(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+48|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=l+40|0;fW(n,f);r=n|0;n=c[r>>2]|0;if((c[4726]|0)!=-1){c[m>>2]=18904;c[m+4>>2]=16;c[m+8>>2]=0;fi(18904,m,120)}m=(c[4727]|0)-1|0;s=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-s>>2>>>0>m>>>0){t=c[s+(m<<2)>>2]|0;if((t|0)==0){break}u=t;v=c[r>>2]|0;eU(v)|0;c[g>>2]=0;v=d|0;L155:do{if((j|0)==(k|0)){w=182}else{x=e|0;y=t;z=t;A=t;B=b;C=p|0;D=q|0;E=o|0;F=j;G=0;L157:while(1){H=G;while(1){if((H|0)!=0){w=182;break L155}I=c[v>>2]|0;do{if((I|0)==0){J=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){L=cB[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{L=c[K>>2]|0}if((L|0)!=-1){J=I;break}c[v>>2]=0;J=0}}while(0);I=(J|0)==0;K=c[x>>2]|0;do{if((K|0)==0){w=134}else{M=c[K+12>>2]|0;if((M|0)==(c[K+16>>2]|0)){N=cB[c[(c[K>>2]|0)+36>>2]&255](K)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[x>>2]=0;w=134;break}else{if(I^(K|0)==0){O=K;break}else{w=136;break L157}}}}while(0);if((w|0)==134){w=0;if(I){w=136;break L157}else{O=0}}if((cA[c[(c[y>>2]|0)+52>>2]&63](u,c[F>>2]|0,0)|0)<<24>>24==37){w=139;break}if(cA[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[F>>2]|0)|0){P=F;w=149;break}Q=J+12|0;K=c[Q>>2]|0;R=J+16|0;if((K|0)==(c[R>>2]|0)){S=cB[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[K>>2]|0}K=cz[c[(c[A>>2]|0)+28>>2]&63](u,S)|0;if((K|0)==(cz[c[(c[A>>2]|0)+28>>2]&63](u,c[F>>2]|0)|0)){w=177;break}c[g>>2]=4;H=4}L189:do{if((w|0)==177){w=0;H=c[Q>>2]|0;if((H|0)==(c[R>>2]|0)){K=c[(c[J>>2]|0)+40>>2]|0;cB[K&255](J)|0}else{c[Q>>2]=H+4}T=F+4|0}else if((w|0)==149){while(1){w=0;H=P+4|0;if((H|0)==(k|0)){U=k;break}if(cA[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[H>>2]|0)|0){P=H;w=149}else{U=H;break}}I=J;H=O;while(1){do{if((I|0)==0){V=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){W=cB[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{W=c[K>>2]|0}if((W|0)!=-1){V=I;break}c[v>>2]=0;V=0}}while(0);K=(V|0)==0;do{if((H|0)==0){w=164}else{M=c[H+12>>2]|0;if((M|0)==(c[H+16>>2]|0)){X=cB[c[(c[H>>2]|0)+36>>2]&255](H)|0}else{X=c[M>>2]|0}if((X|0)==-1){c[x>>2]=0;w=164;break}else{if(K^(H|0)==0){Y=H;break}else{T=U;break L189}}}}while(0);if((w|0)==164){w=0;if(K){T=U;break L189}else{Y=0}}M=V+12|0;Z=c[M>>2]|0;_=V+16|0;if((Z|0)==(c[_>>2]|0)){$=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{$=c[Z>>2]|0}if(!(cA[c[(c[z>>2]|0)+12>>2]&63](u,8192,$)|0)){T=U;break L189}Z=c[M>>2]|0;if((Z|0)==(c[_>>2]|0)){_=c[(c[V>>2]|0)+40>>2]|0;cB[_&255](V)|0;I=V;H=Y;continue}else{c[M>>2]=Z+4;I=V;H=Y;continue}}}else if((w|0)==139){w=0;H=F+4|0;if((H|0)==(k|0)){w=140;break L157}I=cA[c[(c[y>>2]|0)+52>>2]&63](u,c[H>>2]|0,0)|0;if((I<<24>>24|0)==69|(I<<24>>24|0)==48){Z=F+8|0;if((Z|0)==(k|0)){w=143;break L157}aa=I;ab=cA[c[(c[y>>2]|0)+52>>2]&63](u,c[Z>>2]|0,0)|0;ac=Z}else{aa=0;ab=I;ac=H}H=c[(c[B>>2]|0)+36>>2]|0;c[C>>2]=J;c[D>>2]=O;cH[H&7](o,b,p,q,f,g,h,ab,aa);c[v>>2]=c[E>>2];T=ac+4|0}}while(0);if((T|0)==(k|0)){w=182;break L155}F=T;G=c[g>>2]|0}if((w|0)==143){c[g>>2]=4;ad=J;break}else if((w|0)==136){c[g>>2]=4;ad=J;break}else if((w|0)==140){c[g>>2]=4;ad=J;break}}}while(0);if((w|0)==182){ad=c[v>>2]|0}u=d|0;do{if((ad|0)!=0){t=c[ad+12>>2]|0;if((t|0)==(c[ad+16>>2]|0)){ae=cB[c[(c[ad>>2]|0)+36>>2]&255](ad)|0}else{ae=c[t>>2]|0}if((ae|0)!=-1){break}c[u>>2]=0}}while(0);v=c[u>>2]|0;t=(v|0)==0;G=e|0;F=c[G>>2]|0;do{if((F|0)==0){w=195}else{E=c[F+12>>2]|0;if((E|0)==(c[F+16>>2]|0)){af=cB[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{af=c[E>>2]|0}if((af|0)==-1){c[G>>2]=0;w=195;break}if(!(t^(F|0)==0)){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);do{if((w|0)==195){if(t){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ag=a|0;c[ag>>2]=v;i=l;return}}while(0);l=ck(4)|0;l7(l);bE(l|0,13328,164)}function iA(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;fW(m,f);f=m|0;m=c[f>>2]|0;if((c[4726]|0)!=-1){c[l>>2]=18904;c[l+4>>2]=16;c[l+8>>2]=0;fi(18904,l,120)}l=(c[4727]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;eU(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(hz(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=ck(4)|0;l7(j);bE(j|0,13328,164)}function iB(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;fW(m,f);f=m|0;m=c[f>>2]|0;if((c[4726]|0)!=-1){c[l>>2]=18904;c[l+4>>2]=16;c[l+8>>2]=0;fi(18904,l,120)}l=(c[4727]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;eU(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(hz(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=ck(4)|0;l7(j);bE(j|0,13328,164)}function iC(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;fW(l,f);f=l|0;l=c[f>>2]|0;if((c[4726]|0)!=-1){c[k>>2]=18904;c[k+4>>2]=16;c[k+8>>2]=0;fi(18904,k,120)}k=(c[4727]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;eU(n)|0;c[j>>2]=c[e>>2];n=iH(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=ck(4)|0;l7(b);bE(b|0,13328,164)}function iD(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L313:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=255}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=255;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L313}}}}while(0);if((m|0)==255){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{s=c[k>>2]|0}if(!(cA[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;cB[u&255](k)|0;continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=cB[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=277}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=cB[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=277;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==277){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function iE(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;fW(z,g);_=z|0;z=c[_>>2]|0;if((c[4726]|0)!=-1){c[y>>2]=18904;c[y+4>>2]=16;c[y+8>>2]=0;fi(18904,y,120)}y=(c[4727]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;eU(aa)|0;aa=k<<24>>24;L378:do{if((aa|0)==97|(aa|0)==65){ac=c[f>>2]|0;ad=d+8|0;ae=cB[c[c[ad>>2]>>2]&255](ad)|0;c[x>>2]=ac;ac=(hz(e,x,ae,ae+168|0,ab,h,0)|0)-ae|0;if((ac|0)>=168){break}c[j+24>>2]=((ac|0)/12|0|0)%7|0}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ac=c[f>>2]|0;ae=d+8|0;ad=cB[c[(c[ae>>2]|0)+4>>2]&255](ae)|0;c[w>>2]=ac;ac=(hz(e,w,ad,ad+288|0,ab,h,0)|0)-ad|0;if((ac|0)>=288){break}c[j+16>>2]=((ac|0)/12|0|0)%12|0}else if((aa|0)==99){ac=d+8|0;ad=cB[c[(c[ac>>2]|0)+12>>2]&255](ac)|0;ac=e|0;c[B>>2]=c[ac>>2];c[C>>2]=c[f>>2];ae=a[ad]|0;if((ae&1)==0){af=ad+4|0;ag=ad+4|0}else{ah=c[ad+8>>2]|0;af=ah;ag=ah}ah=ae&255;if((ah&1|0)==0){ai=ah>>>1}else{ai=c[ad+4>>2]|0}iz(A,d,B,C,g,h,j,ag,af+(ai<<2)|0);c[ac>>2]=c[A>>2]}else if((aa|0)==100|(aa|0)==101){ac=j+12|0;c[v>>2]=c[f>>2];ad=iH(e,v,h,ab,2)|0;ah=c[h>>2]|0;do{if((ah&4|0)==0){if((ad-1|0)>>>0>=31){break}c[ac>>2]=ad;break L378}}while(0);c[h>>2]=ah|4}else if((aa|0)==68){ad=e|0;c[E>>2]=c[ad>>2];c[F>>2]=c[f>>2];iz(D,d,E,F,g,h,j,6144,6176);c[ad>>2]=c[D>>2]}else if((aa|0)==70){ad=e|0;c[H>>2]=c[ad>>2];c[I>>2]=c[f>>2];iz(G,d,H,I,g,h,j,6008,6040);c[ad>>2]=c[G>>2]}else if((aa|0)==72){c[u>>2]=c[f>>2];ad=iH(e,u,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<24){c[j+8>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==73){ac=j+8|0;c[t>>2]=c[f>>2];ad=iH(e,t,h,ab,2)|0;ae=c[h>>2]|0;do{if((ae&4|0)==0){if((ad-1|0)>>>0>=12){break}c[ac>>2]=ad;break L378}}while(0);c[h>>2]=ae|4}else if((aa|0)==106){c[s>>2]=c[f>>2];ad=iH(e,s,h,ab,3)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<366){c[j+28>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==109){c[r>>2]=c[f>>2];ac=(iH(e,r,h,ab,2)|0)-1|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<12){c[j+16>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==77){c[q>>2]=c[f>>2];ad=iH(e,q,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<60){c[j+4>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];iD(0,e,J,h,ab)}else if((aa|0)==112){c[K>>2]=c[f>>2];iF(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ac=e|0;c[M>>2]=c[ac>>2];c[N>>2]=c[f>>2];iz(L,d,M,N,g,h,j,6096,6140);c[ac>>2]=c[L>>2]}else if((aa|0)==82){ac=e|0;c[P>>2]=c[ac>>2];c[Q>>2]=c[f>>2];iz(O,d,P,Q,g,h,j,6072,6092);c[ac>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ac=iH(e,p,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<61){c[j>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==84){ad=e|0;c[S>>2]=c[ad>>2];c[T>>2]=c[f>>2];iz(R,d,S,T,g,h,j,6040,6072);c[ad>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ad=iH(e,o,h,ab,1)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<7){c[j+24>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==120){ac=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];cw[ac&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==88){ac=d+8|0;ad=cB[c[(c[ac>>2]|0)+24>>2]&255](ac)|0;ac=e|0;c[X>>2]=c[ac>>2];c[Y>>2]=c[f>>2];ah=a[ad]|0;if((ah&1)==0){aj=ad+4|0;ak=ad+4|0}else{al=c[ad+8>>2]|0;aj=al;ak=al}al=ah&255;if((al&1|0)==0){am=al>>>1}else{am=c[ad+4>>2]|0}iz(W,d,X,Y,g,h,j,ak,aj+(am<<2)|0);c[ac>>2]=c[W>>2]}else if((aa|0)==121){c[n>>2]=c[f>>2];ac=iH(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ac|0)<69){an=ac+2e3|0}else{an=(ac-69|0)>>>0<31?ac+1900|0:ac}c[j+20>>2]=an-1900}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=iH(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==37){c[Z>>2]=c[f>>2];iG(0,e,Z,h,ab)}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=ck(4)|0;l7(l);bE(l|0,13328,164)}function iF(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cB[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=hz(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function iG(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=cB[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=390}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=cB[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=390;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=392;break}}}}while(0);if((l|0)==390){if(h){l=392}else{n=0;o=1}}if((l|0)==392){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{p=c[d>>2]|0}if((cA[c[(c[f>>2]|0)+52>>2]&63](f,p,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;cB[h&255](p)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=cB[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=414}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=cB[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=414;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==414){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function iH(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=cB[c[(c[a>>2]|0)+36>>2]&255](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=436}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=cB[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=436;break}else{if(j^(b|0)==0){o=b;break}else{m=438;break}}}}while(0);if((m|0)==436){if(j){m=438}else{o=0}}if((m|0)==438){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=cB[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{q=c[b>>2]|0}b=e;if(!(cA[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(cA[c[(c[j>>2]|0)+52>>2]&63](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;cB[r&255](q)|0;s=n;t=f;u=o}else{c[a>>2]=k+4;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=cB[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=cB[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{D=c[f>>2]|0}if(!(cA[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=488;break}f=((cA[c[(c[j>>2]|0)+52>>2]&63](e,D,0)|0)<<24>>24)+(v*10|0)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;cB[q&255](n)|0;s=f;t=o;u=z;continue}else{c[k>>2]=a+4;s=f;t=o;u=z;continue}}if((m|0)==488){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=cB[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=482}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=482;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==482){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function iI(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2];f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=bC(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=cz[c[(c[s>>2]|0)+52>>2]&63](s,m&255)|0}else{c[l>>2]=j+1;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function iJ(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2];e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400;jx(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=cz[c[(c[o>>2]|0)+52>>2]&63](o,l)|0}else{c[k>>2]=d+4;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function iK(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bn(b|0)}eC(a|0);mC(a);return}function iL(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bn(b|0)}eC(a|0);return}function iM(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bn(b|0)}eC(a|0);mC(a);return}function iN(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bn(b|0)}eC(a|0);return}function iO(a){a=a|0;return 127}function iP(a){a=a|0;return 127}function iQ(a){a=a|0;return 0}function iR(a){a=a|0;return 127}function iS(a){a=a|0;return 127}function iT(a){a=a|0;return 0}function iU(a){a=a|0;return 2147483647}function iV(a){a=a|0;return 2147483647}function iW(a){a=a|0;return 0}function iX(a){a=a|0;return 2147483647}function iY(a){a=a|0;return 2147483647}function iZ(a){a=a|0;return 0}function i_(a){a=a|0;return}function i$(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i0(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i1(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i2(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i3(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i4(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i5(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i6(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D&255;D=D>>8;a[c+1|0]=D&255;D=D>>8;a[c+2|0]=D&255;D=D>>8;a[c+3|0]=D&255;return}function i7(a){a=a|0;eC(a|0);mC(a);return}function i8(a){a=a|0;eC(a|0);return}function i9(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function ja(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jb(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jc(a,b){a=a|0;b=b|0;fn(a,1,45);return}function jd(a){a=a|0;eC(a|0);mC(a);return}function je(a){a=a|0;eC(a|0);return}function jf(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jg(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jh(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function ji(a,b){a=a|0;b=b|0;fn(a,1,45);return}function jj(a){a=a|0;eC(a|0);mC(a);return}function jk(a){a=a|0;eC(a|0);return}function jl(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jm(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jn(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jo(a,b){a=a|0;b=b|0;fC(a,1,45);return}function jp(a){a=a|0;eC(a|0);mC(a);return}function jq(a){a=a|0;eC(a|0);return}function jr(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function js(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function jt(a,b){a=a|0;b=b|0;mK(a|0,0,12);return}function ju(a,b){a=a|0;b=b|0;fC(a,1,45);return}function jv(a){a=a|0;eC(a|0);mC(a);return}function jw(a){a=a|0;eC(a|0);return}function jx(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;bC(n|0,100,o|0,f|0,c[g>>2]|0)|0;c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=b4(c[g>>2]|0)|0;g=lX(d,m,n,l)|0;if((f|0)!=0){b4(f|0)|0}if((g|0)==-1){jD(2376)}else{c[e>>2]=d+(g<<2);i=j;return}}function jy(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+280|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=d+176|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=206;w=m+100|0;fW(p,h);m=p|0;x=c[m>>2]|0;if((c[4728]|0)!=-1){c[l>>2]=18912;c[l+4>>2]=16;c[l+8>>2]=0;fi(18912,l,120)}l=(c[4729]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;B=f|0;c[r>>2]=c[B>>2];do{if(jz(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+32>>2]|0;cK[E&15](A,5992,6002,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>98){I=ms(H+2|0)|0;if((I|0)!=0){J=I;K=I;break}mH();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+10|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((a[O]|0)==(a[N]|0)){P=O;break}else{O=O+1|0}}a[M]=a[5992+(P-I)|0]|0;O=N+1|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((b6(E|0,5016,(C=i,i=i+8|0,c[C>>2]=k,C)|0)|0)==1){if((K|0)==0){break}mt(K);break}N=ck(8)|0;e_(N,4856);bE(N|0,13344,28)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){S=z;break}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[B>>2]|0;do{if((z|0)==0){T=634}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{T=636;break}}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[B>>2]=0;T=634;break}else{if(A^(z|0)==0){break}else{T=636;break}}}}while(0);if((T|0)==634){if(A){T=636}}if((T|0)==636){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;eU(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}cx[c[v>>2]&511](z);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function jz(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0;q=i;i=i+440|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2];r=q|0;s=q+400|0;t=q+408|0;u=q+416|0;v=q+424|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=r|0;mK(w|0,0,12);E=x;F=y;G=z;H=A;mK(E|0,0,12);mK(F|0,0,12);mK(G|0,0,12);mK(H|0,0,12);jF(g,h,s,t,u,v,x,y,z,B);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=f|0;f=m+8|0;m=z+1|0;I=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+4|0;P=x+8|0;Q=A+1|0;R=A+4|0;S=A+8|0;T=s+3|0;U=n+4|0;n=v+4|0;V=p;p=206;W=D;X=D;D=r+400|0;r=0;Y=0;L808:while(1){Z=c[g>>2]|0;do{if((Z|0)==0){_=0}else{if((c[Z+12>>2]|0)!=(c[Z+16>>2]|0)){_=Z;break}if((cB[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)==-1){c[g>>2]=0;_=0;break}else{_=c[g>>2]|0;break}}}while(0);Z=(_|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=661}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=913;break L808}}if((cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=661;break}else{if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=913;break L808}}}}while(0);if((aa|0)==661){aa=0;if(Z){ac=p;ad=W;ae=X;af=r;aa=913;break}else{ab=0}}$=a[s+Y|0]|0;do{if(($|0)==1){if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=913;break L808}ag=c[g>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){ai=(cB[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{ai=a[ah]|0}if(ai<<24>>24<=-1){aa=686;break L808}if((b[(c[f>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){aa=686;break L808}ah=c[g>>2]|0;ag=ah+12|0;aj=c[ag>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=(cB[c[(c[ah>>2]|0)+40>>2]&255](ah)|0)&255}else{c[ag>>2]=aj+1;ak=a[aj]|0}fh(A,ak);aa=687}else if(($|0)==0){aa=687}else if(($|0)==3){aj=a[F]|0;ag=aj&255;ah=(ag&1|0)==0?ag>>>1:c[L>>2]|0;ag=a[G]|0;al=ag&255;am=(al&1|0)==0?al>>>1:c[I>>2]|0;if((ah|0)==(-am|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}al=(ah|0)==0;ah=c[g>>2]|0;at=c[ah+12>>2]|0;au=c[ah+16>>2]|0;av=(at|0)==(au|0);if(!(al|(am|0)==0)){if(av){am=(cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aw=c[g>>2]|0;ax=am;ay=a[F]|0;az=aw;aA=c[aw+12>>2]|0;aB=c[aw+16>>2]|0}else{ax=a[at]|0;ay=aj;az=ah;aA=at;aB=au}au=az+12|0;aw=(aA|0)==(aB|0);if(ax<<24>>24==(a[(ay&1)==0?K:c[M>>2]|0]|0)){if(aw){am=c[(c[az>>2]|0)+40>>2]|0;cB[am&255](az)|0}else{c[au>>2]=aA+1}au=d[F]|0;an=((au&1|0)==0?au>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(aw){aC=(cB[c[(c[az>>2]|0)+36>>2]&255](az)|0)&255}else{aC=a[aA]|0}if(aC<<24>>24!=(a[(a[G]&1)==0?m:c[J>>2]|0]|0)){aa=753;break L808}aw=c[g>>2]|0;au=aw+12|0;am=c[au>>2]|0;if((am|0)==(c[aw+16>>2]|0)){aD=c[(c[aw>>2]|0)+40>>2]|0;cB[aD&255](aw)|0}else{c[au>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(al){if(av){al=(cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aE=al;aF=a[G]|0}else{aE=a[at]|0;aF=ag}if(aE<<24>>24!=(a[(aF&1)==0?m:c[J>>2]|0]|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}ag=c[g>>2]|0;al=ag+12|0;am=c[al>>2]|0;if((am|0)==(c[ag+16>>2]|0)){au=c[(c[ag>>2]|0)+40>>2]|0;cB[au&255](ag)|0}else{c[al>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(av){av=(cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aG=av;aH=a[F]|0}else{aG=a[at]|0;aH=aj}if(aG<<24>>24!=(a[(aH&1)==0?K:c[M>>2]|0]|0)){a[l]=1;an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}aj=c[g>>2]|0;at=aj+12|0;av=c[at>>2]|0;if((av|0)==(c[aj+16>>2]|0)){ah=c[(c[aj>>2]|0)+40>>2]|0;cB[ah&255](aj)|0}else{c[at>>2]=av+1}av=d[F]|0;an=((av&1|0)==0?av>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V}else if(($|0)==2){if(!((r|0)!=0|Y>>>0<2)){if((Y|0)==2){aI=(a[T]|0)!=0}else{aI=0}if(!(N|aI)){an=0;ao=D;ap=X;aq=W;ar=p;as=V;break}}av=a[E]|0;at=(av&1)==0?j:c[P>>2]|0;L904:do{if((Y|0)==0){aJ=at}else{if((d[s+(Y-1)|0]|0)>=2){aJ=at;break}aj=av&255;ah=at+((aj&1|0)==0?aj>>>1:c[O>>2]|0)|0;aj=at;while(1){if((aj|0)==(ah|0)){aK=ah;break}am=a[aj]|0;if(am<<24>>24<=-1){aK=aj;break}if((b[(c[f>>2]|0)+(am<<24>>24<<1)>>1]&8192)==0){aK=aj;break}else{aj=aj+1|0}}aj=aK-at|0;ah=a[H]|0;am=ah&255;al=(am&1|0)==0?am>>>1:c[R>>2]|0;if(aj>>>0>al>>>0){aJ=at;break}am=(ah&1)==0?Q:c[S>>2]|0;ah=am+al|0;if((aK|0)==(at|0)){aJ=at;break}ag=at;au=am+(al-aj)|0;while(1){if((a[au]|0)!=(a[ag]|0)){aJ=at;break L904}aj=au+1|0;if((aj|0)==(ah|0)){aJ=aK;break}else{ag=ag+1|0;au=aj}}}}while(0);au=av&255;L918:do{if((aJ|0)==(at+((au&1|0)==0?au>>>1:c[O>>2]|0)|0)){aL=aJ}else{ag=ab;ah=aJ;while(1){aj=c[g>>2]|0;do{if((aj|0)==0){aM=0}else{if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){aM=aj;break}if((cB[c[(c[aj>>2]|0)+36>>2]&255](aj)|0)==-1){c[g>>2]=0;aM=0;break}else{aM=c[g>>2]|0;break}}}while(0);aj=(aM|0)==0;do{if((ag|0)==0){aa=782}else{if((c[ag+12>>2]|0)!=(c[ag+16>>2]|0)){if(aj){aN=ag;break}else{aL=ah;break L918}}if((cB[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)==-1){c[e>>2]=0;aa=782;break}else{if(aj){aN=ag;break}else{aL=ah;break L918}}}}while(0);if((aa|0)==782){aa=0;if(aj){aL=ah;break L918}else{aN=0}}al=c[g>>2]|0;am=c[al+12>>2]|0;if((am|0)==(c[al+16>>2]|0)){aO=(cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aO=a[am]|0}if(aO<<24>>24!=(a[ah]|0)){aL=ah;break L918}am=c[g>>2]|0;al=am+12|0;aw=c[al>>2]|0;if((aw|0)==(c[am+16>>2]|0)){aD=c[(c[am>>2]|0)+40>>2]|0;cB[aD&255](am)|0}else{c[al>>2]=aw+1}aw=ah+1|0;al=a[E]|0;am=al&255;if((aw|0)==(((al&1)==0?j:c[P>>2]|0)+((am&1|0)==0?am>>>1:c[O>>2]|0)|0)){aL=aw;break}else{ag=aN;ah=aw}}}}while(0);if(!N){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}au=a[E]|0;at=au&255;if((aL|0)==(((au&1)==0?j:c[P>>2]|0)+((at&1|0)==0?at>>>1:c[O>>2]|0)|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V}else{aa=795;break L808}}else if(($|0)==4){at=0;au=D;av=X;ah=W;ag=p;aw=V;L953:while(1){am=c[g>>2]|0;do{if((am|0)==0){aP=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aP=am;break}if((cB[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;aP=0;break}else{aP=c[g>>2]|0;break}}}while(0);am=(aP|0)==0;al=c[e>>2]|0;do{if((al|0)==0){aa=808}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){if(am){break}else{break L953}}if((cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[e>>2]=0;aa=808;break}else{if(am){break}else{break L953}}}}while(0);if((aa|0)==808){aa=0;if(am){break}}al=c[g>>2]|0;aD=c[al+12>>2]|0;if((aD|0)==(c[al+16>>2]|0)){aQ=(cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aQ=a[aD]|0}do{if(aQ<<24>>24>-1){if((b[(c[f>>2]|0)+(aQ<<24>>24<<1)>>1]&2048)==0){aa=827;break}aD=c[o>>2]|0;if((aD|0)==(aw|0)){al=(c[U>>2]|0)!=206;aR=c[h>>2]|0;aS=aw-aR|0;aT=aS>>>0<2147483647?aS<<1:-1;aU=mu(al?aR:0,aT)|0;if((aU|0)==0){mH()}do{if(al){c[h>>2]=aU;aV=aU}else{aR=c[h>>2]|0;c[h>>2]=aU;if((aR|0)==0){aV=aU;break}cx[c[U>>2]&511](aR);aV=c[h>>2]|0}}while(0);c[U>>2]=104;aU=aV+aS|0;c[o>>2]=aU;aW=(c[h>>2]|0)+aT|0;aX=aU}else{aW=aw;aX=aD}c[o>>2]=aX+1;a[aX]=aQ;aY=at+1|0;aZ=au;a_=av;a$=ah;a0=ag;a1=aW}else{aa=827}}while(0);if((aa|0)==827){aa=0;am=d[w]|0;if((((am&1|0)==0?am>>>1:c[n>>2]|0)|0)==0|(at|0)==0){break}if(aQ<<24>>24!=(a[u]|0)){break}if((av|0)==(au|0)){am=av-ah|0;aU=am>>>0<2147483647?am<<1:-1;if((ag|0)==206){a2=0}else{a2=ah}al=mu(a2,aU)|0;aj=al;if((al|0)==0){mH()}a3=aj+(aU>>>2<<2)|0;a4=aj+(am>>2<<2)|0;a5=aj;a6=104}else{a3=au;a4=av;a5=ah;a6=ag}c[a4>>2]=at;aY=0;aZ=a3;a_=a4+4|0;a$=a5;a0=a6;a1=aw}aj=c[g>>2]|0;am=aj+12|0;aU=c[am>>2]|0;if((aU|0)==(c[aj+16>>2]|0)){al=c[(c[aj>>2]|0)+40>>2]|0;cB[al&255](aj)|0;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}else{c[am>>2]=aU+1;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}}if((ah|0)==(av|0)|(at|0)==0){a7=au;a8=av;a9=ah;ba=ag}else{if((av|0)==(au|0)){aU=av-ah|0;am=aU>>>0<2147483647?aU<<1:-1;if((ag|0)==206){bb=0}else{bb=ah}aj=mu(bb,am)|0;al=aj;if((aj|0)==0){mH()}bc=al+(am>>>2<<2)|0;bd=al+(aU>>2<<2)|0;be=al;bf=104}else{bc=au;bd=av;be=ah;bf=ag}c[bd>>2]=at;a7=bc;a8=bd+4|0;a9=be;ba=bf}if((c[B>>2]|0)>0){al=c[g>>2]|0;do{if((al|0)==0){bg=0}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){bg=al;break}if((cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[g>>2]=0;bg=0;break}else{bg=c[g>>2]|0;break}}}while(0);al=(bg|0)==0;at=c[e>>2]|0;do{if((at|0)==0){aa=860}else{if((c[at+12>>2]|0)!=(c[at+16>>2]|0)){if(al){bh=at;break}else{aa=867;break L808}}if((cB[c[(c[at>>2]|0)+36>>2]&255](at)|0)==-1){c[e>>2]=0;aa=860;break}else{if(al){bh=at;break}else{aa=867;break L808}}}}while(0);if((aa|0)==860){aa=0;if(al){aa=867;break L808}else{bh=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bi=(cB[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bi=a[ag]|0}if(bi<<24>>24!=(a[t]|0)){aa=867;break L808}ag=c[g>>2]|0;at=ag+12|0;ah=c[at>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){av=c[(c[ag>>2]|0)+40>>2]|0;cB[av&255](ag)|0;bj=aw;bk=bh}else{c[at>>2]=ah+1;bj=aw;bk=bh}while(1){ah=c[g>>2]|0;do{if((ah|0)==0){bl=0}else{if((c[ah+12>>2]|0)!=(c[ah+16>>2]|0)){bl=ah;break}if((cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)==-1){c[g>>2]=0;bl=0;break}else{bl=c[g>>2]|0;break}}}while(0);ah=(bl|0)==0;do{if((bk|0)==0){aa=883}else{if((c[bk+12>>2]|0)!=(c[bk+16>>2]|0)){if(ah){bm=bk;break}else{aa=891;break L808}}if((cB[c[(c[bk>>2]|0)+36>>2]&255](bk)|0)==-1){c[e>>2]=0;aa=883;break}else{if(ah){bm=bk;break}else{aa=891;break L808}}}}while(0);if((aa|0)==883){aa=0;if(ah){aa=891;break L808}else{bm=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bn=(cB[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bn=a[ag]|0}if(bn<<24>>24<=-1){aa=891;break L808}if((b[(c[f>>2]|0)+(bn<<24>>24<<1)>>1]&2048)==0){aa=891;break L808}ag=c[o>>2]|0;if((ag|0)==(bj|0)){at=(c[U>>2]|0)!=206;av=c[h>>2]|0;au=bj-av|0;aU=au>>>0<2147483647?au<<1:-1;am=mu(at?av:0,aU)|0;if((am|0)==0){mH()}do{if(at){c[h>>2]=am;bo=am}else{av=c[h>>2]|0;c[h>>2]=am;if((av|0)==0){bo=am;break}cx[c[U>>2]&511](av);bo=c[h>>2]|0}}while(0);c[U>>2]=104;am=bo+au|0;c[o>>2]=am;bp=(c[h>>2]|0)+aU|0;bq=am}else{bp=bj;bq=ag}am=c[g>>2]|0;at=c[am+12>>2]|0;if((at|0)==(c[am+16>>2]|0)){ah=(cB[c[(c[am>>2]|0)+36>>2]&255](am)|0)&255;br=ah;bs=c[o>>2]|0}else{br=a[at]|0;bs=bq}c[o>>2]=bs+1;a[bs]=br;at=(c[B>>2]|0)-1|0;c[B>>2]=at;ah=c[g>>2]|0;am=ah+12|0;av=c[am>>2]|0;if((av|0)==(c[ah+16>>2]|0)){aj=c[(c[ah>>2]|0)+40>>2]|0;cB[aj&255](ah)|0}else{c[am>>2]=av+1}if((at|0)>0){bj=bp;bk=bm}else{bt=bp;break}}}else{bt=aw}if((c[o>>2]|0)==(c[h>>2]|0)){aa=911;break L808}else{an=r;ao=a7;ap=a8;aq=a9;ar=ba;as=bt}}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V}}while(0);L1107:do{if((aa|0)==687){aa=0;if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=913;break L808}else{bu=ab}while(1){$=c[g>>2]|0;do{if(($|0)==0){bv=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){bv=$;break}if((cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[g>>2]=0;bv=0;break}else{bv=c[g>>2]|0;break}}}while(0);$=(bv|0)==0;do{if((bu|0)==0){aa=700}else{if((c[bu+12>>2]|0)!=(c[bu+16>>2]|0)){if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L1107}}if((cB[c[(c[bu>>2]|0)+36>>2]&255](bu)|0)==-1){c[e>>2]=0;aa=700;break}else{if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L1107}}}}while(0);if((aa|0)==700){aa=0;if($){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L1107}else{bw=0}}ag=c[g>>2]|0;aU=c[ag+12>>2]|0;if((aU|0)==(c[ag+16>>2]|0)){bx=(cB[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{bx=a[aU]|0}if(bx<<24>>24<=-1){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L1107}if((b[(c[f>>2]|0)+(bx<<24>>24<<1)>>1]&8192)==0){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L1107}aU=c[g>>2]|0;ag=aU+12|0;au=c[ag>>2]|0;if((au|0)==(c[aU+16>>2]|0)){by=(cB[c[(c[aU>>2]|0)+40>>2]&255](aU)|0)&255}else{c[ag>>2]=au+1;by=a[au]|0}fh(A,by);bu=bw}}}while(0);aw=Y+1|0;if(aw>>>0<4){V=as;p=ar;W=aq;X=ap;D=ao;r=an;Y=aw}else{ac=ar;ad=aq;ae=ap;af=an;aa=913;break}}L1144:do{if((aa|0)==686){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==753){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==795){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==867){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==891){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==911){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==913){L1152:do{if((af|0)!=0){an=af;ap=af+1|0;aq=af+8|0;ar=af+4|0;Y=1;L1154:while(1){r=d[an]|0;if((r&1|0)==0){bC=r>>>1}else{bC=c[ar>>2]|0}if(Y>>>0>=bC>>>0){break L1152}r=c[g>>2]|0;do{if((r|0)==0){bD=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){bD=r;break}if((cB[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[g>>2]=0;bD=0;break}else{bD=c[g>>2]|0;break}}}while(0);r=(bD|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=931}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(r){break}else{break L1154}}if((cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=931;break}else{if(r){break}else{break L1154}}}}while(0);if((aa|0)==931){aa=0;if(r){break}}$=c[g>>2]|0;ao=c[$+12>>2]|0;if((ao|0)==(c[$+16>>2]|0)){bE=(cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)&255}else{bE=a[ao]|0}if((a[an]&1)==0){bF=ap}else{bF=c[aq>>2]|0}if(bE<<24>>24!=(a[bF+Y|0]|0)){break}ao=Y+1|0;$=c[g>>2]|0;D=$+12|0;X=c[D>>2]|0;if((X|0)==(c[$+16>>2]|0)){as=c[(c[$>>2]|0)+40>>2]|0;cB[as&255]($)|0;Y=ao;continue}else{c[D>>2]=X+1;Y=ao;continue}}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac;break L1144}}while(0);if((ad|0)==(ae|0)){bz=1;bA=ae;bB=ac;break}c[C>>2]=0;hb(v,ad,ae,C);if((c[C>>2]|0)==0){bz=1;bA=ad;bB=ac;break}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac}}while(0);fb(A);fb(z);fb(y);fb(x);fb(v);if((bA|0)==0){i=q;return bz|0}cx[bB&511](bA);i=q;return bz|0}function jA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){fy(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function jB(a){a=a|0;eC(a|0);mC(a);return}function jC(a){a=a|0;eC(a|0);return}function jD(a){a=a|0;var b=0;b=ck(8)|0;e_(b,a);bE(b|0,13344,28)}function jE(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+160|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=206;u=m+100|0;fW(p,h);m=p|0;v=c[m>>2]|0;if((c[4728]|0)!=-1){c[l>>2]=18912;c[l+4>>2]=16;c[l+8>>2]=0;fi(18912,l,120)}l=(c[4729]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(jz(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){a[k+1|0]=0;a[B]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){fh(k,cz[c[(c[B>>2]|0)+28>>2]&63](y,45)|0)}x=cz[c[(c[B>>2]|0)+28>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-1|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((a[C]|0)==x<<24>>24){C=C+1|0}else{break}}jA(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){D=B;break}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){E=1011}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){break}else{E=1013;break}}if((cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[z>>2]=0;E=1011;break}else{if(x^(A|0)==0){break}else{E=1013;break}}}}while(0);if((E|0)==1011){if(x){E=1013}}if((E|0)==1013){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;eU(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}cx[c[t>>2]&511](A);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function jF(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;C=i;i=i+12|0;i=i+7>>3<<3;E=C;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[4846]|0)!=-1){c[p>>2]=19384;c[p+4>>2]=16;c[p+8>>2]=0;fi(19384,p,120)}p=(c[4847]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=ck(4)|0;L=K;l7(L);bE(K|0,13328,164)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=ck(4)|0;L=K;l7(L);bE(K|0,13328,164)}K=b;cy[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;D=c[q>>2]|0;a[L]=D&255;D=D>>8;a[L+1|0]=D&255;D=D>>8;a[L+2|0]=D&255;D=D>>8;a[L+3|0]=D&255;L=b;cy[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){a[l+1|0]=0;a[q]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}fp(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];mK(s|0,0,12);fb(r);cy[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}fp(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];mK(u|0,0,12);fb(t);t=b;a[f]=cB[c[(c[t>>2]|0)+12>>2]&255](K)|0;a[g]=cB[c[(c[t>>2]|0)+16>>2]&255](K)|0;cy[c[(c[L>>2]|0)+20>>2]&127](v,K);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}fp(h,0);c[t>>2]=c[w>>2];c[t+4>>2]=c[w+4>>2];c[t+8>>2]=c[w+8>>2];mK(w|0,0,12);fb(v);cy[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}fp(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];mK(y|0,0,12);fb(x);M=cB[c[(c[b>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[4848]|0)!=-1){c[o>>2]=19392;c[o+4>>2]=16;c[o+8>>2]=0;fi(19392,o,120)}o=(c[4849]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=ck(4)|0;O=N;l7(O);bE(N|0,13328,164)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=ck(4)|0;O=N;l7(O);bE(N|0,13328,164)}N=K;cy[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;D=c[z>>2]|0;a[O]=D&255;D=D>>8;a[O+1|0]=D&255;D=D>>8;a[O+2|0]=D&255;D=D>>8;a[O+3|0]=D&255;O=K;cy[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){a[l+1|0]=0;a[z]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}fp(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];mK(B|0,0,12);fb(A);cy[c[(c[O>>2]|0)+28>>2]&127](C,N);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}fp(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];mK(E|0,0,12);fb(C);C=K;a[f]=cB[c[(c[C>>2]|0)+12>>2]&255](N)|0;a[g]=cB[c[(c[C>>2]|0)+16>>2]&255](N)|0;cy[c[(c[O>>2]|0)+20>>2]&127](F,N);C=h;if((a[C]&1)==0){a[h+1|0]=0;a[C]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}fp(h,0);c[C>>2]=c[G>>2];c[C+4>>2]=c[G+4>>2];c[C+8>>2]=c[G+8>>2];mK(G|0,0,12);fb(F);cy[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){a[j+1|0]=0;a[O]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}fp(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];mK(I|0,0,12);fb(H);M=cB[c[(c[K>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function jG(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+600|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=d+496|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=206;w=m+400|0;fW(p,h);m=p|0;x=c[m>>2]|0;if((c[4726]|0)!=-1){c[l>>2]=18904;c[l+4>>2]=16;c[l+8>>2]=0;fi(18904,l,120)}l=(c[4727]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;B=f|0;c[r>>2]=c[B>>2];do{if(jH(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+48>>2]|0;cK[E&15](A,5976,5986,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>392){I=ms((H>>2)+2|0)|0;if((I|0)!=0){J=I;K=I;break}mH();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+40|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((c[O>>2]|0)==(c[N>>2]|0)){P=O;break}else{O=O+4|0}}a[M]=a[5976+(P-I>>2)|0]|0;O=N+4|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((b6(E|0,5016,(C=i,i=i+8|0,c[C>>2]=k,C)|0)|0)==1){if((K|0)==0){break}mt(K);break}N=ck(8)|0;e_(N,4856);bE(N|0,13344,28)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){T=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{T=c[N>>2]|0}if((T|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[B>>2]|0;do{if((z|0)==0){U=1129}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){V=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{V=c[N>>2]|0}if((V|0)==-1){c[B>>2]=0;U=1129;break}else{if(A^(z|0)==0){break}else{U=1131;break}}}}while(0);if((U|0)==1129){if(A){U=1131}}if((U|0)==1131){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;eU(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}cx[c[v>>2]&511](z);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function jH(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0;p=i;i=i+448|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2];q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;mK(w|0,0,12);D=x;E=y;F=z;G=A;mK(D|0,0,12);mK(E|0,0,12);mK(F|0,0,12);mK(G|0,0,12);jL(f,g,s,t,u,v,x,y,z,B);g=m|0;c[n>>2]=c[g>>2];f=b|0;b=e|0;e=l;H=z+4|0;I=z+8|0;J=y+4|0;K=y+8|0;L=(h&512|0)!=0;h=x+4|0;M=x+8|0;N=A+4|0;O=A+8|0;P=s+3|0;Q=v+4|0;R=206;S=o;T=o;o=r+400|0;r=0;U=0;L1412:while(1){V=c[f>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[f>>2]=0;W=1;break}else{W=(c[f>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=1157}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=1157;break}else{if(W^(V|0)==0){$=V;break}else{aa=R;ab=S;ac=T;ad=r;Z=1397;break L1412}}}}while(0);if((Z|0)==1157){Z=0;if(W){aa=R;ab=S;ac=T;ad=r;Z=1397;break}else{$=0}}V=a[s+U|0]|0;L1436:do{if((V|0)==1){if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=1397;break L1412}X=c[f>>2]|0;ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){af=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{af=c[ae>>2]|0}if(!(cA[c[(c[e>>2]|0)+12>>2]&63](l,8192,af)|0)){Z=1181;break L1412}ae=c[f>>2]|0;X=ae+12|0;ag=c[X>>2]|0;if((ag|0)==(c[ae+16>>2]|0)){ah=cB[c[(c[ae>>2]|0)+40>>2]&255](ae)|0}else{c[X>>2]=ag+4;ah=c[ag>>2]|0}fU(A,ah);Z=1182}else if((V|0)==0){Z=1182}else if((V|0)==3){ag=a[E]|0;X=ag&255;ae=(X&1|0)==0;ai=a[F]|0;aj=ai&255;ak=(aj&1|0)==0;if(((ae?X>>>1:c[J>>2]|0)|0)==(-(ak?aj>>>1:c[H>>2]|0)|0)){al=r;am=o;an=T;ao=S;ap=R;break}do{if(((ae?X>>>1:c[J>>2]|0)|0)!=0){if(((ak?aj>>>1:c[H>>2]|0)|0)==0){break}aq=c[f>>2]|0;ar=c[aq+12>>2]|0;if((ar|0)==(c[aq+16>>2]|0)){as=cB[c[(c[aq>>2]|0)+36>>2]&255](aq)|0;at=as;au=a[E]|0}else{at=c[ar>>2]|0;au=ag}ar=c[f>>2]|0;as=ar+12|0;aq=c[as>>2]|0;av=(aq|0)==(c[ar+16>>2]|0);if((at|0)==(c[((au&1)==0?J:c[K>>2]|0)>>2]|0)){if(av){aw=c[(c[ar>>2]|0)+40>>2]|0;cB[aw&255](ar)|0}else{c[as>>2]=aq+4}as=d[E]|0;al=((as&1|0)==0?as>>>1:c[J>>2]|0)>>>0>1?y:r;am=o;an=T;ao=S;ap=R;break L1436}if(av){ax=cB[c[(c[ar>>2]|0)+36>>2]&255](ar)|0}else{ax=c[aq>>2]|0}if((ax|0)!=(c[((a[F]&1)==0?H:c[I>>2]|0)>>2]|0)){Z=1247;break L1412}aq=c[f>>2]|0;ar=aq+12|0;av=c[ar>>2]|0;if((av|0)==(c[aq+16>>2]|0)){as=c[(c[aq>>2]|0)+40>>2]|0;cB[as&255](aq)|0}else{c[ar>>2]=av+4}a[k]=1;av=d[F]|0;al=((av&1|0)==0?av>>>1:c[H>>2]|0)>>>0>1?z:r;am=o;an=T;ao=S;ap=R;break L1436}}while(0);aj=c[f>>2]|0;ak=c[aj+12>>2]|0;av=(ak|0)==(c[aj+16>>2]|0);if(((ae?X>>>1:c[J>>2]|0)|0)==0){if(av){ar=cB[c[(c[aj>>2]|0)+36>>2]&255](aj)|0;ay=ar;az=a[F]|0}else{ay=c[ak>>2]|0;az=ai}if((ay|0)!=(c[((az&1)==0?H:c[I>>2]|0)>>2]|0)){al=r;am=o;an=T;ao=S;ap=R;break}ar=c[f>>2]|0;aq=ar+12|0;as=c[aq>>2]|0;if((as|0)==(c[ar+16>>2]|0)){aw=c[(c[ar>>2]|0)+40>>2]|0;cB[aw&255](ar)|0}else{c[aq>>2]=as+4}a[k]=1;as=d[F]|0;al=((as&1|0)==0?as>>>1:c[H>>2]|0)>>>0>1?z:r;am=o;an=T;ao=S;ap=R;break}if(av){av=cB[c[(c[aj>>2]|0)+36>>2]&255](aj)|0;aA=av;aB=a[E]|0}else{aA=c[ak>>2]|0;aB=ag}if((aA|0)!=(c[((aB&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;al=r;am=o;an=T;ao=S;ap=R;break}ak=c[f>>2]|0;av=ak+12|0;aj=c[av>>2]|0;if((aj|0)==(c[ak+16>>2]|0)){as=c[(c[ak>>2]|0)+40>>2]|0;cB[as&255](ak)|0}else{c[av>>2]=aj+4}aj=d[E]|0;al=((aj&1|0)==0?aj>>>1:c[J>>2]|0)>>>0>1?y:r;am=o;an=T;ao=S;ap=R}else if((V|0)==2){if(!((r|0)!=0|U>>>0<2)){if((U|0)==2){aC=(a[P]|0)!=0}else{aC=0}if(!(L|aC)){al=0;am=o;an=T;ao=S;ap=R;break}}aj=a[D]|0;av=(aj&1)==0?h:c[M>>2]|0;L1508:do{if((U|0)==0){aD=av;aE=aj;aF=$}else{if((d[s+(U-1)|0]|0)<2){aG=av;aH=aj}else{aD=av;aE=aj;aF=$;break}while(1){ak=aH&255;if((aG|0)==(((aH&1)==0?h:c[M>>2]|0)+(((ak&1|0)==0?ak>>>1:c[h>>2]|0)<<2)|0)){aI=aH;break}if(!(cA[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[aG>>2]|0)|0)){Z=1258;break}aG=aG+4|0;aH=a[D]|0}if((Z|0)==1258){Z=0;aI=a[D]|0}ak=(aI&1)==0;as=aG-(ak?h:c[M>>2]|0)>>2;aq=a[G]|0;ar=aq&255;aw=(ar&1|0)==0;L1518:do{if(as>>>0<=(aw?ar>>>1:c[N>>2]|0)>>>0){aJ=(aq&1)==0;aK=(aJ?N:c[O>>2]|0)+((aw?ar>>>1:c[N>>2]|0)-as<<2)|0;aL=(aJ?N:c[O>>2]|0)+((aw?ar>>>1:c[N>>2]|0)<<2)|0;if((aK|0)==(aL|0)){aD=aG;aE=aI;aF=$;break L1508}else{aM=aK;aN=ak?h:c[M>>2]|0}while(1){if((c[aM>>2]|0)!=(c[aN>>2]|0)){break L1518}aK=aM+4|0;if((aK|0)==(aL|0)){aD=aG;aE=aI;aF=$;break L1508}aM=aK;aN=aN+4|0}}}while(0);aD=ak?h:c[M>>2]|0;aE=aI;aF=$}}while(0);L1525:while(1){aj=aE&255;if((aD|0)==(((aE&1)==0?h:c[M>>2]|0)+(((aj&1|0)==0?aj>>>1:c[h>>2]|0)<<2)|0)){break}aj=c[f>>2]|0;do{if((aj|0)==0){aO=1}else{av=c[aj+12>>2]|0;if((av|0)==(c[aj+16>>2]|0)){aP=cB[c[(c[aj>>2]|0)+36>>2]&255](aj)|0}else{aP=c[av>>2]|0}if((aP|0)==-1){c[f>>2]=0;aO=1;break}else{aO=(c[f>>2]|0)==0;break}}}while(0);do{if((aF|0)==0){Z=1279}else{aj=c[aF+12>>2]|0;if((aj|0)==(c[aF+16>>2]|0)){aQ=cB[c[(c[aF>>2]|0)+36>>2]&255](aF)|0}else{aQ=c[aj>>2]|0}if((aQ|0)==-1){c[b>>2]=0;Z=1279;break}else{if(aO^(aF|0)==0){aR=aF;break}else{break L1525}}}}while(0);if((Z|0)==1279){Z=0;if(aO){break}else{aR=0}}aj=c[f>>2]|0;ak=c[aj+12>>2]|0;if((ak|0)==(c[aj+16>>2]|0)){aS=cB[c[(c[aj>>2]|0)+36>>2]&255](aj)|0}else{aS=c[ak>>2]|0}if((aS|0)!=(c[aD>>2]|0)){break}ak=c[f>>2]|0;aj=ak+12|0;av=c[aj>>2]|0;if((av|0)==(c[ak+16>>2]|0)){ag=c[(c[ak>>2]|0)+40>>2]|0;cB[ag&255](ak)|0}else{c[aj>>2]=av+4}aD=aD+4|0;aE=a[D]|0;aF=aR}if(!L){al=r;am=o;an=T;ao=S;ap=R;break}av=a[D]|0;aj=av&255;if((aD|0)==(((av&1)==0?h:c[M>>2]|0)+(((aj&1|0)==0?aj>>>1:c[h>>2]|0)<<2)|0)){al=r;am=o;an=T;ao=S;ap=R}else{Z=1291;break L1412}}else if((V|0)==4){aj=0;av=o;ak=T;ag=S;ai=R;L1561:while(1){X=c[f>>2]|0;do{if((X|0)==0){aT=1}else{ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aU=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aU=c[ae>>2]|0}if((aU|0)==-1){c[f>>2]=0;aT=1;break}else{aT=(c[f>>2]|0)==0;break}}}while(0);X=c[b>>2]|0;do{if((X|0)==0){Z=1305}else{ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aV=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aV=c[ae>>2]|0}if((aV|0)==-1){c[b>>2]=0;Z=1305;break}else{if(aT^(X|0)==0){break}else{break L1561}}}}while(0);if((Z|0)==1305){Z=0;if(aT){break}}X=c[f>>2]|0;ae=c[X+12>>2]|0;if((ae|0)==(c[X+16>>2]|0)){aW=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aW=c[ae>>2]|0}if(cA[c[(c[e>>2]|0)+12>>2]&63](l,2048,aW)|0){ae=c[n>>2]|0;if((ae|0)==(c[q>>2]|0)){jM(m,n,q);aX=c[n>>2]|0}else{aX=ae}c[n>>2]=aX+4;c[aX>>2]=aW;aY=aj+1|0;aZ=av;a_=ak;a$=ag;a0=ai}else{ae=d[w]|0;if((((ae&1|0)==0?ae>>>1:c[Q>>2]|0)|0)==0|(aj|0)==0){break}if((aW|0)!=(c[u>>2]|0)){break}if((ak|0)==(av|0)){ae=(ai|0)!=206;X=ak-ag|0;ar=X>>>0<2147483647?X<<1:-1;if(ae){a1=ag}else{a1=0}ae=mu(a1,ar)|0;aw=ae;if((ae|0)==0){mH()}a2=aw+(ar>>>2<<2)|0;a3=aw+(X>>2<<2)|0;a4=aw;a5=104}else{a2=av;a3=ak;a4=ag;a5=ai}c[a3>>2]=aj;aY=0;aZ=a2;a_=a3+4|0;a$=a4;a0=a5}aw=c[f>>2]|0;X=aw+12|0;ar=c[X>>2]|0;if((ar|0)==(c[aw+16>>2]|0)){ae=c[(c[aw>>2]|0)+40>>2]|0;cB[ae&255](aw)|0;aj=aY;av=aZ;ak=a_;ag=a$;ai=a0;continue}else{c[X>>2]=ar+4;aj=aY;av=aZ;ak=a_;ag=a$;ai=a0;continue}}if((ag|0)==(ak|0)|(aj|0)==0){a6=av;a7=ak;a8=ag;a9=ai}else{if((ak|0)==(av|0)){ar=(ai|0)!=206;X=ak-ag|0;aw=X>>>0<2147483647?X<<1:-1;if(ar){ba=ag}else{ba=0}ar=mu(ba,aw)|0;ae=ar;if((ar|0)==0){mH()}bb=ae+(aw>>>2<<2)|0;bc=ae+(X>>2<<2)|0;bd=ae;be=104}else{bb=av;bc=ak;bd=ag;be=ai}c[bc>>2]=aj;a6=bb;a7=bc+4|0;a8=bd;a9=be}ae=c[B>>2]|0;if((ae|0)>0){X=c[f>>2]|0;do{if((X|0)==0){bf=1}else{aw=c[X+12>>2]|0;if((aw|0)==(c[X+16>>2]|0)){bg=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{bg=c[aw>>2]|0}if((bg|0)==-1){c[f>>2]=0;bf=1;break}else{bf=(c[f>>2]|0)==0;break}}}while(0);X=c[b>>2]|0;do{if((X|0)==0){Z=1354}else{aj=c[X+12>>2]|0;if((aj|0)==(c[X+16>>2]|0)){bh=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{bh=c[aj>>2]|0}if((bh|0)==-1){c[b>>2]=0;Z=1354;break}else{if(bf^(X|0)==0){bi=X;break}else{Z=1360;break L1412}}}}while(0);if((Z|0)==1354){Z=0;if(bf){Z=1360;break L1412}else{bi=0}}X=c[f>>2]|0;aj=c[X+12>>2]|0;if((aj|0)==(c[X+16>>2]|0)){bj=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{bj=c[aj>>2]|0}if((bj|0)!=(c[t>>2]|0)){Z=1360;break L1412}aj=c[f>>2]|0;X=aj+12|0;ai=c[X>>2]|0;if((ai|0)==(c[aj+16>>2]|0)){ag=c[(c[aj>>2]|0)+40>>2]|0;cB[ag&255](aj)|0;bk=bi;bl=ae}else{c[X>>2]=ai+4;bk=bi;bl=ae}while(1){ai=c[f>>2]|0;do{if((ai|0)==0){bm=1}else{X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){bn=cB[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{bn=c[X>>2]|0}if((bn|0)==-1){c[f>>2]=0;bm=1;break}else{bm=(c[f>>2]|0)==0;break}}}while(0);do{if((bk|0)==0){Z=1377}else{ai=c[bk+12>>2]|0;if((ai|0)==(c[bk+16>>2]|0)){bo=cB[c[(c[bk>>2]|0)+36>>2]&255](bk)|0}else{bo=c[ai>>2]|0}if((bo|0)==-1){c[b>>2]=0;Z=1377;break}else{if(bm^(bk|0)==0){bp=bk;break}else{Z=1384;break L1412}}}}while(0);if((Z|0)==1377){Z=0;if(bm){Z=1384;break L1412}else{bp=0}}ai=c[f>>2]|0;X=c[ai+12>>2]|0;if((X|0)==(c[ai+16>>2]|0)){bq=cB[c[(c[ai>>2]|0)+36>>2]&255](ai)|0}else{bq=c[X>>2]|0}if(!(cA[c[(c[e>>2]|0)+12>>2]&63](l,2048,bq)|0)){Z=1384;break L1412}if((c[n>>2]|0)==(c[q>>2]|0)){jM(m,n,q)}X=c[f>>2]|0;ai=c[X+12>>2]|0;if((ai|0)==(c[X+16>>2]|0)){br=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{br=c[ai>>2]|0}ai=c[n>>2]|0;c[n>>2]=ai+4;c[ai>>2]=br;ai=bl-1|0;c[B>>2]=ai;X=c[f>>2]|0;aj=X+12|0;ag=c[aj>>2]|0;if((ag|0)==(c[X+16>>2]|0)){ak=c[(c[X>>2]|0)+40>>2]|0;cB[ak&255](X)|0}else{c[aj>>2]=ag+4}if((ai|0)>0){bk=bp;bl=ai}else{break}}}if((c[n>>2]|0)==(c[g>>2]|0)){Z=1395;break L1412}else{al=r;am=a6;an=a7;ao=a8;ap=a9}}else{al=r;am=o;an=T;ao=S;ap=R}}while(0);L1705:do{if((Z|0)==1182){Z=0;if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=1397;break L1412}else{bs=$}while(1){V=c[f>>2]|0;do{if((V|0)==0){bt=1}else{ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bu=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bu=c[ae>>2]|0}if((bu|0)==-1){c[f>>2]=0;bt=1;break}else{bt=(c[f>>2]|0)==0;break}}}while(0);do{if((bs|0)==0){Z=1196}else{V=c[bs+12>>2]|0;if((V|0)==(c[bs+16>>2]|0)){bv=cB[c[(c[bs>>2]|0)+36>>2]&255](bs)|0}else{bv=c[V>>2]|0}if((bv|0)==-1){c[b>>2]=0;Z=1196;break}else{if(bt^(bs|0)==0){bw=bs;break}else{al=r;am=o;an=T;ao=S;ap=R;break L1705}}}}while(0);if((Z|0)==1196){Z=0;if(bt){al=r;am=o;an=T;ao=S;ap=R;break L1705}else{bw=0}}V=c[f>>2]|0;ae=c[V+12>>2]|0;if((ae|0)==(c[V+16>>2]|0)){bx=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bx=c[ae>>2]|0}if(!(cA[c[(c[e>>2]|0)+12>>2]&63](l,8192,bx)|0)){al=r;am=o;an=T;ao=S;ap=R;break L1705}ae=c[f>>2]|0;V=ae+12|0;ai=c[V>>2]|0;if((ai|0)==(c[ae+16>>2]|0)){by=cB[c[(c[ae>>2]|0)+40>>2]&255](ae)|0}else{c[V>>2]=ai+4;by=c[ai>>2]|0}fU(A,by);bs=bw}}}while(0);ai=U+1|0;if(ai>>>0<4){R=ap;S=ao;T=an;o=am;r=al;U=ai}else{aa=ap;ab=ao;ac=an;ad=al;Z=1397;break}}L1742:do{if((Z|0)==1395){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==1397){L1745:do{if((ad|0)!=0){al=ad;an=ad+4|0;ao=ad+8|0;ap=1;L1747:while(1){U=d[al]|0;if((U&1|0)==0){bC=U>>>1}else{bC=c[an>>2]|0}if(ap>>>0>=bC>>>0){break L1745}U=c[f>>2]|0;do{if((U|0)==0){bD=1}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bE=cB[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bE=c[r>>2]|0}if((bE|0)==-1){c[f>>2]=0;bD=1;break}else{bD=(c[f>>2]|0)==0;break}}}while(0);U=c[b>>2]|0;do{if((U|0)==0){Z=1416}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bF=cB[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bF=c[r>>2]|0}if((bF|0)==-1){c[b>>2]=0;Z=1416;break}else{if(bD^(U|0)==0){break}else{break L1747}}}}while(0);if((Z|0)==1416){Z=0;if(bD){break}}U=c[f>>2]|0;r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bG=cB[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bG=c[r>>2]|0}if((a[al]&1)==0){bH=an}else{bH=c[ao>>2]|0}if((bG|0)!=(c[bH+(ap<<2)>>2]|0)){break}r=ap+1|0;U=c[f>>2]|0;am=U+12|0;o=c[am>>2]|0;if((o|0)==(c[U+16>>2]|0)){T=c[(c[U>>2]|0)+40>>2]|0;cB[T&255](U)|0;ap=r;continue}else{c[am>>2]=o+4;ap=r;continue}}c[j>>2]=c[j>>2]|4;bz=0;bA=ab;bB=aa;break L1742}}while(0);if((ab|0)==(ac|0)){bz=1;bA=ac;bB=aa;break}c[C>>2]=0;hb(v,ab,ac,C);if((c[C>>2]|0)==0){bz=1;bA=ab;bB=aa;break}c[j>>2]=c[j>>2]|4;bz=0;bA=ab;bB=aa}else if((Z|0)==1360){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==1384){c[j>>2]=c[j>>2]|4;bz=0;bA=a8;bB=a9}else if((Z|0)==1181){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==1247){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}else if((Z|0)==1291){c[j>>2]=c[j>>2]|4;bz=0;bA=S;bB=R}}while(0);fu(A);fu(z);fu(y);fu(x);fb(v);if((bA|0)==0){i=p;return bz|0}cx[bB&511](bA);i=p;return bz|0}function jI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){gd(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=j+((e-4+(-g|0)|0)>>>2)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function jJ(a){a=a|0;eC(a|0);mC(a);return}function jK(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+456|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=206;u=m+400|0;fW(p,h);m=p|0;v=c[m>>2]|0;if((c[4726]|0)!=-1){c[l>>2]=18904;c[l+4>>2]=16;c[l+8>>2]=0;fi(18904,l,120)}l=(c[4727]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(jH(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){c[k+4>>2]=0;a[B]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){fU(k,cz[c[(c[B>>2]|0)+44>>2]&63](y,45)|0)}x=cz[c[(c[B>>2]|0)+44>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-4|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((c[C>>2]|0)==(x|0)){C=C+4|0}else{break}}jI(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){F=cB[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{F=c[E>>2]|0}if((F|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){G=1494}else{B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){H=cB[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{H=c[B>>2]|0}if((H|0)==-1){c[z>>2]=0;G=1494;break}else{if(x^(A|0)==0){break}else{G=1496;break}}}}while(0);if((G|0)==1494){if(x){G=1496}}if((G|0)==1496){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;eU(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}cx[c[t>>2]&511](A);i=d;return}}while(0);d=ck(4)|0;l7(d);bE(d|0,13328,164)}function jL(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;C=i;i=i+12|0;i=i+7>>3<<3;E=C;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[4842]|0)!=-1){c[p>>2]=19368;c[p+4>>2]=16;c[p+8>>2]=0;fi(19368,p,120)}p=(c[4843]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=ck(4)|0;L=K;l7(L);bE(K|0,13328,164)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=ck(4)|0;L=K;l7(L);bE(K|0,13328,164)}K=b;cy[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;D=c[q>>2]|0;a[L]=D&255;D=D>>8;a[L+1|0]=D&255;D=D>>8;a[L+2|0]=D&255;D=D>>8;a[L+3|0]=D&255;L=b;cy[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){c[l+4>>2]=0;a[q]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}gb(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];mK(s|0,0,12);fu(r);cy[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}gb(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];mK(u|0,0,12);fu(t);t=b;c[f>>2]=cB[c[(c[t>>2]|0)+12>>2]&255](K)|0;c[g>>2]=cB[c[(c[t>>2]|0)+16>>2]&255](K)|0;cy[c[(c[b>>2]|0)+20>>2]&127](v,K);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}fp(h,0);c[b>>2]=c[w>>2];c[b+4>>2]=c[w+4>>2];c[b+8>>2]=c[w+8>>2];mK(w|0,0,12);fb(v);cy[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){c[j+4>>2]=0;a[L]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}gb(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];mK(y|0,0,12);fu(x);M=cB[c[(c[t>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[4844]|0)!=-1){c[o>>2]=19376;c[o+4>>2]=16;c[o+8>>2]=0;fi(19376,o,120)}o=(c[4845]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=ck(4)|0;O=N;l7(O);bE(N|0,13328,164)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=ck(4)|0;O=N;l7(O);bE(N|0,13328,164)}N=K;cy[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;D=c[z>>2]|0;a[O]=D&255;D=D>>8;a[O+1|0]=D&255;D=D>>8;a[O+2|0]=D&255;D=D>>8;a[O+3|0]=D&255;O=K;cy[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){c[l+4>>2]=0;a[z]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}gb(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];mK(B|0,0,12);fu(A);cy[c[(c[O>>2]|0)+28>>2]&127](C,N);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}gb(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];mK(E|0,0,12);fu(C);C=K;c[f>>2]=cB[c[(c[C>>2]|0)+12>>2]&255](N)|0;c[g>>2]=cB[c[(c[C>>2]|0)+16>>2]&255](N)|0;cy[c[(c[K>>2]|0)+20>>2]&127](F,N);K=h;if((a[K]&1)==0){a[h+1|0]=0;a[K]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}fp(h,0);c[K>>2]=c[G>>2];c[K+4>>2]=c[G+4>>2];c[K+8>>2]=c[G+8>>2];mK(G|0,0,12);fb(F);cy[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){c[j+4>>2]=0;a[O]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}gb(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];mK(I|0,0,12);fu(H);M=cB[c[(c[C>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function jM(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=206;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=mu(k,j)|0;k=a;if((a|0)==0){mH()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}cx[c[e>>2]&511](a);l=c[g>>2]|0}}while(0);c[e>>2]=104;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function jN(a){a=a|0;eC(a|0);return}function jO(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+280|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+232|0;p=e+240|0;q=e+248|0;r=e+256|0;s=e+264|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+100|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a5(E|0,100,4792,(C=i,i=i+8|0,h[C>>3]=l,C)|0)|0;do{if(G>>>0>99){do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);E=hZ(n,c[4384]|0,4792,(C=i,i=i+8|0,h[C>>3]=l,C)|0)|0;H=c[n>>2]|0;if((H|0)==0){mH();I=c[n>>2]|0}else{I=H}H=ms(E)|0;if((H|0)!=0){J=H;K=E;L=I;M=H;break}mH();J=0;K=E;L=I;M=0}else{J=F;K=G;L=0;M=0}}while(0);fW(o,j);G=o|0;F=c[G>>2]|0;if((c[4728]|0)!=-1){c[m>>2]=18912;c[m+4>>2]=16;c[m+8>>2]=0;fi(18912,m,120)}m=(c[4729]|0)-1|0;I=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-I>>2>>>0>m>>>0){E=c[I+(m<<2)>>2]|0;if((E|0)==0){break}H=E;N=c[n>>2]|0;O=N+K|0;P=c[(c[E>>2]|0)+32>>2]|0;cK[P&15](H,N,O,J)|0;if((K|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}mK(t|0,0,12);mK(v|0,0,12);mK(x|0,0,12);jP(g,Q,o,p,q,r,s,u,w,y);O=z|0;N=c[y>>2]|0;if((K|0)>(N|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(K-N<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+N|0;do{if(P>>>0>100){E=ms(P)|0;if((E|0)!=0){W=E;X=E;break}mH();W=0;X=0}else{W=O;X=0}}while(0);jQ(W,A,B,c[j+4>>2]|0,J,J+K|0,H,Q,p,a[q]|0,a[r]|0,s,u,w,N);c[D>>2]=c[f>>2];dC(b,D,W,c[A>>2]|0,c[B>>2]|0,j,k);if((X|0)!=0){mt(X)}fb(w);fb(u);fb(s);O=c[G>>2]|0;eU(O)|0;if((M|0)!=0){mt(M)}if((L|0)==0){i=e;return}mt(L);i=e;return}}while(0);e=ck(4)|0;l7(e);bE(e|0,13328,164)}function jP(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;C=i;i=i+4|0;i=i+7>>3<<3;E=C;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[4846]|0)!=-1){c[p>>2]=19384;c[p+4>>2]=16;c[p+8>>2]=0;fi(19384,p,120)}p=(c[4847]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=ck(4)|0;R=Q;l7(R);bE(Q|0,13328,164)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=ck(4)|0;R=Q;l7(R);bE(Q|0,13328,164)}Q=e;R=c[e>>2]|0;if(d){cy[c[R+44>>2]&127](r,Q);r=f;D=c[q>>2]|0;a[r]=D&255;D=D>>8;a[r+1|0]=D&255;D=D>>8;a[r+2|0]=D&255;D=D>>8;a[r+3|0]=D&255;cy[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){a[l+1|0]=0;a[r]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}fp(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];mK(t|0,0,12);fb(s)}else{cy[c[R+40>>2]&127](v,Q);v=f;D=c[u>>2]|0;a[v]=D&255;D=D>>8;a[v+1|0]=D&255;D=D>>8;a[v+2|0]=D&255;D=D>>8;a[v+3|0]=D&255;cy[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){a[l+1|0]=0;a[v]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}fp(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];mK(x|0,0,12);fb(w)}w=e;a[g]=cB[c[(c[w>>2]|0)+12>>2]&255](Q)|0;a[h]=cB[c[(c[w>>2]|0)+16>>2]&255](Q)|0;w=e;cy[c[(c[w>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}fp(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];mK(z|0,0,12);fb(y);cy[c[(c[w>>2]|0)+24>>2]&127](A,Q);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}fp(k,0);c[w>>2]=c[B>>2];c[w+4>>2]=c[B+4>>2];c[w+8>>2]=c[B+8>>2];mK(B|0,0,12);fb(A);S=cB[c[(c[e>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[4848]|0)!=-1){c[o>>2]=19392;c[o+4>>2]=16;c[o+8>>2]=0;fi(19392,o,120)}o=(c[4849]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=ck(4)|0;U=T;l7(U);bE(T|0,13328,164)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=ck(4)|0;U=T;l7(U);bE(T|0,13328,164)}T=P;U=c[P>>2]|0;if(d){cy[c[U+44>>2]&127](E,T);E=f;D=c[C>>2]|0;a[E]=D&255;D=D>>8;a[E+1|0]=D&255;D=D>>8;a[E+2|0]=D&255;D=D>>8;a[E+3|0]=D&255;cy[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){a[l+1|0]=0;a[E]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}fp(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];mK(G|0,0,12);fb(F)}else{cy[c[U+40>>2]&127](I,T);I=f;D=c[H>>2]|0;a[I]=D&255;D=D>>8;a[I+1|0]=D&255;D=D>>8;a[I+2|0]=D&255;D=D>>8;a[I+3|0]=D&255;cy[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}fp(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];mK(K|0,0,12);fb(J)}J=P;a[g]=cB[c[(c[J>>2]|0)+12>>2]&255](T)|0;a[h]=cB[c[(c[J>>2]|0)+16>>2]&255](T)|0;J=P;cy[c[(c[J>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}fp(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];mK(M|0,0,12);fb(L);cy[c[(c[J>>2]|0)+24>>2]&127](N,T);J=k;if((a[J]&1)==0){a[k+1|0]=0;a[J]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}fp(k,0);c[J>>2]=c[O>>2];c[J+4>>2]=c[O+4>>2];c[J+8>>2]=c[O+8>>2];mK(O|0,0,12);fb(N);S=cB[c[(c[P>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function jQ(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;do{if((H|0)==3){I=a[t]|0;J=I&255;if((J&1|0)==0){K=J>>>1}else{K=c[w>>2]|0}if((K|0)==0){L=G;break}if((I&1)==0){M=u}else{M=c[v>>2]|0}I=a[M]|0;J=c[f>>2]|0;c[f>>2]=J+1;a[J]=I;L=G}else if((H|0)==2){I=a[q]|0;J=I&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[z>>2]|0}if((O|0)==0|x){L=G;break}if((I&1)==0){P=y;Q=y}else{I=c[A>>2]|0;P=I;Q=I}if(N){R=J>>>1}else{R=c[z>>2]|0}J=P+R|0;N=c[f>>2]|0;if((Q|0)==(J|0)){S=N}else{I=Q;T=N;while(1){a[T]=a[I]|0;N=I+1|0;U=T+1|0;if((N|0)==(J|0)){S=U;break}else{I=N;T=U}}}c[f>>2]=S;L=G}else if((H|0)==4){T=c[f>>2]|0;I=k?G+1|0:G;J=I;while(1){if(J>>>0>=i>>>0){break}U=a[J]|0;if(U<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(U<<24>>24<<1)>>1]&2048)==0){break}else{J=J+1|0}}U=J;if(B){if(J>>>0>I>>>0){N=I+(-U|0)|0;U=N>>>0<o>>>0?o:N;N=U+r|0;V=J;W=r;X=T;while(1){Y=V-1|0;Z=a[Y]|0;c[f>>2]=X+1;a[X]=Z;Z=W-1|0;_=(Z|0)>0;if(!(Y>>>0>I>>>0&_)){break}V=Y;W=Z;X=c[f>>2]|0}X=J+U|0;if(_){$=N;aa=X;ab=1744}else{ac=0;ad=N;ae=X}}else{$=r;aa=J;ab=1744}if((ab|0)==1744){ab=0;ac=cz[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;ad=$;ae=aa}X=c[f>>2]|0;c[f>>2]=X+1;if((ad|0)>0){W=ad;V=X;while(1){a[V]=ac;Z=W-1|0;Y=c[f>>2]|0;c[f>>2]=Y+1;if((Z|0)>0){W=Z;V=Y}else{af=Y;break}}}else{af=X}a[af]=m;ag=ae}else{ag=J}if((ag|0)==(I|0)){V=cz[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=V}else{V=a[C]|0;W=V&255;if((W&1|0)==0){ah=W>>>1}else{ah=c[F>>2]|0}if((ah|0)==0){ai=ag;aj=0;ak=0;al=-1}else{if((V&1)==0){am=D}else{am=c[E>>2]|0}ai=ag;aj=0;ak=0;al=a[am]|0}while(1){do{if((aj|0)==(al|0)){V=c[f>>2]|0;c[f>>2]=V+1;a[V]=n;V=ak+1|0;W=a[C]|0;N=W&255;if((N&1|0)==0){an=N>>>1}else{an=c[F>>2]|0}if(V>>>0>=an>>>0){ao=al;ap=V;aq=0;break}N=(W&1)==0;if(N){ar=D}else{ar=c[E>>2]|0}if((a[ar+V|0]|0)==127){ao=-1;ap=V;aq=0;break}if(N){as=D}else{as=c[E>>2]|0}ao=a[as+V|0]|0;ap=V;aq=0}else{ao=al;ap=ak;aq=aj}}while(0);V=ai-1|0;N=a[V]|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=N;if((V|0)==(I|0)){break}else{ai=V;aj=aq+1|0;ak=ap;al=ao}}}J=c[f>>2]|0;if((T|0)==(J|0)){L=I;break}X=J-1|0;if(T>>>0<X>>>0){at=T;au=X}else{L=I;break}while(1){X=a[at]|0;a[at]=a[au]|0;a[au]=X;X=at+1|0;J=au-1|0;if(X>>>0<J>>>0){at=X;au=J}else{L=I;break}}}else if((H|0)==1){c[e>>2]=c[f>>2];I=cz[c[(c[s>>2]|0)+28>>2]&63](j,32)|0;T=c[f>>2]|0;c[f>>2]=T+1;a[T]=I;L=G}else if((H|0)==0){c[e>>2]=c[f>>2];L=G}else{L=G}}while(0);H=h+1|0;if(H>>>0<4){G=L;h=H}else{break}}h=a[t]|0;t=h&255;L=(t&1|0)==0;if(L){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(L){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;if((aw|0)==(w|0)){az=ay}else{ax=ay;ay=aw;while(1){a[ax]=a[ay]|0;aw=ax+1|0;t=ay+1|0;if((t|0)==(w|0)){az=aw;break}else{ax=aw;ay=t}}}c[f>>2]=az}az=g&176;if((az|0)==16){return}else if((az|0)==32){c[e>>2]=c[f>>2];return}else{c[e>>2]=d;return}}function jR(a){a=a|0;eC(a|0);mC(a);return}function jS(a){a=a|0;eC(a|0);return}function jT(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+100|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;fW(m,h);B=m|0;C=c[B>>2]|0;if((c[4728]|0)!=-1){c[l>>2]=18912;c[l+4>>2]=16;c[l+8>>2]=0;fi(18912,l,120)}l=(c[4729]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=k;I=a[H]|0;J=I&255;if((J&1|0)==0){K=J>>>1}else{K=c[k+4>>2]|0}if((K|0)==0){L=0}else{if((I&1)==0){M=G+1|0}else{M=c[k+8>>2]|0}I=a[M]|0;L=I<<24>>24==(cz[c[(c[E>>2]|0)+28>>2]&63](F,45)|0)<<24>>24}mK(r|0,0,12);mK(t|0,0,12);mK(v|0,0,12);jP(g,L,m,n,o,p,q,s,u,w);E=x|0;I=a[H]|0;J=I&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[k+4>>2]|0}P=c[w>>2]|0;if((O|0)>(P|0)){if(N){Q=J>>>1}else{Q=c[k+4>>2]|0}J=d[v]|0;if((J&1|0)==0){R=J>>>1}else{R=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){S=J>>>1}else{S=c[s+4>>2]|0}T=(Q-P<<1|1)+R+S|0}else{J=d[v]|0;if((J&1|0)==0){U=J>>>1}else{U=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){V=J>>>1}else{V=c[s+4>>2]|0}T=U+2+V|0}J=T+P|0;do{if(J>>>0>100){N=ms(J)|0;if((N|0)!=0){W=N;X=N;Y=I;break}mH();W=0;X=0;Y=a[H]|0}else{W=E;X=0;Y=I}}while(0);if((Y&1)==0){Z=G+1|0;_=G+1|0}else{I=c[k+8>>2]|0;Z=I;_=I}I=Y&255;if((I&1|0)==0){$=I>>>1}else{$=c[k+4>>2]|0}jQ(W,y,z,c[h+4>>2]|0,_,Z+$|0,F,L,n,a[o]|0,a[p]|0,q,s,u,P);c[A>>2]=c[f>>2];dC(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){fb(u);fb(s);fb(q);aa=c[B>>2]|0;ab=aa|0;ac=eU(ab)|0;i=e;return}mt(X);fb(u);fb(s);fb(q);aa=c[B>>2]|0;ab=aa|0;ac=eU(ab)|0;i=e;return}}while(0);e=ck(4)|0;l7(e);bE(e|0,13328,164)}function jU(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+576|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+528|0;p=e+536|0;q=e+544|0;r=e+552|0;s=e+560|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+400|0;A=i;i=i+4|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a5(E|0,100,4792,(C=i,i=i+8|0,h[C>>3]=l,C)|0)|0;do{if(G>>>0>99){do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);E=hZ(n,c[4384]|0,4792,(C=i,i=i+8|0,h[C>>3]=l,C)|0)|0;H=c[n>>2]|0;if((H|0)==0){mH();I=c[n>>2]|0}else{I=H}H=ms(E<<2)|0;J=H;if((H|0)!=0){K=J;L=E;M=I;N=J;break}mH();K=J;L=E;M=I;N=J}else{K=F;L=G;M=0;N=0}}while(0);fW(o,j);G=o|0;F=c[G>>2]|0;if((c[4726]|0)!=-1){c[m>>2]=18904;c[m+4>>2]=16;c[m+8>>2]=0;fi(18904,m,120)}m=(c[4727]|0)-1|0;I=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-I>>2>>>0>m>>>0){J=c[I+(m<<2)>>2]|0;if((J|0)==0){break}E=J;H=c[n>>2]|0;O=H+L|0;P=c[(c[J>>2]|0)+48>>2]|0;cK[P&15](E,H,O,K)|0;if((L|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}mK(t|0,0,12);mK(v|0,0,12);mK(x|0,0,12);jV(g,Q,o,p,q,r,s,u,w,y);O=z|0;H=c[y>>2]|0;if((L|0)>(H|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(L-H<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+H|0;do{if(P>>>0>100){J=ms(P<<2)|0;W=J;if((J|0)!=0){X=W;Y=W;break}mH();X=W;Y=W}else{X=O;Y=0}}while(0);jW(X,A,B,c[j+4>>2]|0,K,K+(L<<2)|0,E,Q,p,c[q>>2]|0,c[r>>2]|0,s,u,w,H);c[D>>2]=c[f>>2];h6(b,D,X,c[A>>2]|0,c[B>>2]|0,j,k);if((Y|0)!=0){mt(Y)}fu(w);fu(u);fb(s);O=c[G>>2]|0;eU(O)|0;if((N|0)!=0){mt(N)}if((M|0)==0){i=e;return}mt(M);i=e;return}}while(0);e=ck(4)|0;l7(e);bE(e|0,13328,164)}function jV(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;C=i;i=i+4|0;i=i+7>>3<<3;E=C;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[4842]|0)!=-1){c[p>>2]=19368;c[p+4>>2]=16;c[p+8>>2]=0;fi(19368,p,120)}p=(c[4843]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=ck(4)|0;R=Q;l7(R);bE(Q|0,13328,164)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=ck(4)|0;R=Q;l7(R);bE(Q|0,13328,164)}Q=e;R=c[e>>2]|0;if(d){cy[c[R+44>>2]&127](r,Q);r=f;D=c[q>>2]|0;a[r]=D&255;D=D>>8;a[r+1|0]=D&255;D=D>>8;a[r+2|0]=D&255;D=D>>8;a[r+3|0]=D&255;cy[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){c[l+4>>2]=0;a[r]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}gb(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];mK(t|0,0,12);fu(s)}else{cy[c[R+40>>2]&127](v,Q);v=f;D=c[u>>2]|0;a[v]=D&255;D=D>>8;a[v+1|0]=D&255;D=D>>8;a[v+2|0]=D&255;D=D>>8;a[v+3|0]=D&255;cy[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){c[l+4>>2]=0;a[v]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}gb(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];mK(x|0,0,12);fu(w)}w=e;c[g>>2]=cB[c[(c[w>>2]|0)+12>>2]&255](Q)|0;c[h>>2]=cB[c[(c[w>>2]|0)+16>>2]&255](Q)|0;cy[c[(c[e>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}fp(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];mK(z|0,0,12);fb(y);cy[c[(c[e>>2]|0)+24>>2]&127](A,Q);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}gb(k,0);c[e>>2]=c[B>>2];c[e+4>>2]=c[B+4>>2];c[e+8>>2]=c[B+8>>2];mK(B|0,0,12);fu(A);S=cB[c[(c[w>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[4844]|0)!=-1){c[o>>2]=19376;c[o+4>>2]=16;c[o+8>>2]=0;fi(19376,o,120)}o=(c[4845]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=ck(4)|0;U=T;l7(U);bE(T|0,13328,164)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=ck(4)|0;U=T;l7(U);bE(T|0,13328,164)}T=P;U=c[P>>2]|0;if(d){cy[c[U+44>>2]&127](E,T);E=f;D=c[C>>2]|0;a[E]=D&255;D=D>>8;a[E+1|0]=D&255;D=D>>8;a[E+2|0]=D&255;D=D>>8;a[E+3|0]=D&255;cy[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){c[l+4>>2]=0;a[E]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}gb(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];mK(G|0,0,12);fu(F)}else{cy[c[U+40>>2]&127](I,T);I=f;D=c[H>>2]|0;a[I]=D&255;D=D>>8;a[I+1|0]=D&255;D=D>>8;a[I+2|0]=D&255;D=D>>8;a[I+3|0]=D&255;cy[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}gb(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];mK(K|0,0,12);fu(J)}J=P;c[g>>2]=cB[c[(c[J>>2]|0)+12>>2]&255](T)|0;c[h>>2]=cB[c[(c[J>>2]|0)+16>>2]&255](T)|0;cy[c[(c[P>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}fp(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];mK(M|0,0,12);fb(L);cy[c[(c[P>>2]|0)+24>>2]&127](N,T);P=k;if((a[P]&1)==0){c[k+4>>2]=0;a[P]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}gb(k,0);c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];mK(O|0,0,12);fu(N);S=cB[c[(c[J>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function jW(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;do{if((D|0)==0){c[d>>2]=c[e>>2];E=n}else if((D|0)==1){c[d>>2]=c[e>>2];F=cz[c[(c[r>>2]|0)+44>>2]&63](i,32)|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;E=n}else if((D|0)==3){F=a[s]|0;G=F&255;if((G&1|0)==0){H=G>>>1}else{H=c[t>>2]|0}if((H|0)==0){E=n;break}if((F&1)==0){I=t}else{I=c[u>>2]|0}F=c[I>>2]|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;E=n}else if((D|0)==2){F=a[p]|0;G=F&255;J=(G&1|0)==0;if(J){K=G>>>1}else{K=c[w>>2]|0}if((K|0)==0|v){E=n;break}if((F&1)==0){L=w;M=w;N=w}else{F=c[x>>2]|0;L=F;M=F;N=F}if(J){O=G>>>1}else{O=c[w>>2]|0}G=L+(O<<2)|0;J=c[e>>2]|0;if((M|0)==(G|0)){P=J}else{F=(L+(O-1<<2)+(-N|0)|0)>>>2;Q=M;R=J;while(1){c[R>>2]=c[Q>>2];S=Q+4|0;if((S|0)==(G|0)){break}Q=S;R=R+4|0}P=J+(F+1<<2)|0}c[e>>2]=P;E=n}else if((D|0)==4){R=c[e>>2]|0;Q=j?n+4|0:n;G=Q;while(1){if(G>>>0>=h>>>0){break}if(cA[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[G>>2]|0)|0){G=G+4|0}else{break}}if(y){if(G>>>0>Q>>>0){F=G;J=q;do{F=F-4|0;S=c[F>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=S;J=J-1|0;U=(J|0)>0;}while(F>>>0>Q>>>0&U);if(U){V=J;W=F;X=2020}else{Y=0;Z=J;_=F}}else{V=q;W=G;X=2020}if((X|0)==2020){X=0;Y=cz[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;Z=V;_=W}S=c[e>>2]|0;c[e>>2]=S+4;if((Z|0)>0){T=Z;$=S;while(1){c[$>>2]=Y;aa=T-1|0;ab=c[e>>2]|0;c[e>>2]=ab+4;if((aa|0)>0){T=aa;$=ab}else{ac=ab;break}}}else{ac=S}c[ac>>2]=l;ad=_}else{ad=G}if((ad|0)==(Q|0)){$=cz[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=$}else{$=a[z]|0;T=$&255;if((T&1|0)==0){ae=T>>>1}else{ae=c[C>>2]|0}if((ae|0)==0){af=ad;ag=0;ah=0;ai=-1}else{if(($&1)==0){aj=A}else{aj=c[B>>2]|0}af=ad;ag=0;ah=0;ai=a[aj]|0}while(1){do{if((ag|0)==(ai|0)){$=c[e>>2]|0;c[e>>2]=$+4;c[$>>2]=m;$=ah+1|0;T=a[z]|0;F=T&255;if((F&1|0)==0){ak=F>>>1}else{ak=c[C>>2]|0}if($>>>0>=ak>>>0){al=ai;am=$;an=0;break}F=(T&1)==0;if(F){ao=A}else{ao=c[B>>2]|0}if((a[ao+$|0]|0)==127){al=-1;am=$;an=0;break}if(F){ap=A}else{ap=c[B>>2]|0}al=a[ap+$|0]|0;am=$;an=0}else{al=ai;am=ah;an=ag}}while(0);$=af-4|0;F=c[$>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=F;if(($|0)==(Q|0)){break}else{af=$;ag=an+1|0;ah=am;ai=al}}}G=c[e>>2]|0;if((R|0)==(G|0)){E=Q;break}S=G-4|0;if(R>>>0<S>>>0){aq=R;ar=S}else{E=Q;break}while(1){S=c[aq>>2]|0;c[aq>>2]=c[ar>>2];c[ar>>2]=S;S=aq+4|0;G=ar-4|0;if(S>>>0<G>>>0){aq=S;ar=G}else{E=Q;break}}}else{E=n}}while(0);D=g+1|0;if(D>>>0<4){n=E;g=D}else{break}}g=a[s]|0;s=g&255;E=(s&1|0)==0;if(E){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(E){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;E=au+4|0;if((E|0)==(t|0)){ax=s}else{au=((at+(aw-2<<2)+(-av|0)|0)>>>2)+1|0;av=s;aw=E;while(1){c[av>>2]=c[aw>>2];E=aw+4|0;if((E|0)==(t|0)){break}else{av=av+4|0;aw=E}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==32){c[d>>2]=c[e>>2];return}else if((ax|0)==16){return}else{c[d>>2]=b;return}}function jX(a){a=a|0;eC(a|0);mC(a);return}function jY(a){a=a|0;eC(a|0);return}function jZ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bo(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function j_(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+400|0;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;fW(m,h);B=m|0;C=c[B>>2]|0;if((c[4726]|0)!=-1){c[l>>2]=18904;c[l+4>>2]=16;c[l+8>>2]=0;fi(18904,l,120)}l=(c[4727]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=a[G]|0;I=H&255;if((I&1|0)==0){J=I>>>1}else{J=c[k+4>>2]|0}if((J|0)==0){K=0}else{if((H&1)==0){L=k+4|0}else{L=c[k+8>>2]|0}H=c[L>>2]|0;K=(H|0)==(cz[c[(c[E>>2]|0)+44>>2]&63](F,45)|0)}mK(r|0,0,12);mK(t|0,0,12);mK(v|0,0,12);jV(g,K,m,n,o,p,q,s,u,w);E=x|0;H=a[G]|0;I=H&255;M=(I&1|0)==0;if(M){N=I>>>1}else{N=c[k+4>>2]|0}O=c[w>>2]|0;if((N|0)>(O|0)){if(M){P=I>>>1}else{P=c[k+4>>2]|0}I=d[v]|0;if((I&1|0)==0){Q=I>>>1}else{Q=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){R=I>>>1}else{R=c[s+4>>2]|0}S=(P-O<<1|1)+Q+R|0}else{I=d[v]|0;if((I&1|0)==0){T=I>>>1}else{T=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){U=I>>>1}else{U=c[s+4>>2]|0}S=T+2+U|0}I=S+O|0;do{if(I>>>0>100){M=ms(I<<2)|0;V=M;if((M|0)!=0){W=V;X=V;Y=H;break}mH();W=V;X=V;Y=a[G]|0}else{W=E;X=0;Y=H}}while(0);if((Y&1)==0){Z=k+4|0;_=k+4|0}else{H=c[k+8>>2]|0;Z=H;_=H}H=Y&255;if((H&1|0)==0){$=H>>>1}else{$=c[k+4>>2]|0}jW(W,y,z,c[h+4>>2]|0,_,Z+($<<2)|0,F,K,n,c[o>>2]|0,c[p>>2]|0,q,s,u,O);c[A>>2]=c[f>>2];h6(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){fu(u);fu(s);fb(q);aa=c[B>>2]|0;ab=aa|0;ac=eU(ab)|0;i=e;return}mt(X);fu(u);fu(s);fb(q);aa=c[B>>2]|0;ab=aa|0;ac=eU(ab)|0;i=e;return}}while(0);e=ck(4)|0;l7(e);bE(e|0,13328,164)}function j$(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+16|0;j=d|0;k=j;mK(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=p;do{fh(j,a[q]|0);q=q+1|0;}while(q>>>0<h>>>0);q=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){r=q;s=2152;break}t=c[j+8>>2]|0;u=q}else{r=(e|0)==-1?-1:e<<1;s=2152}}while(0);if((s|0)==2152){t=j+1|0;u=r}r=cg(u|0,f|0,g|0,t|0)|0;mK(l|0,0,12);l=mI(r|0)|0;t=r+l|0;if((l|0)>0){v=r}else{fb(j);i=d;return}do{fh(b,a[v]|0);v=v+1|0;}while(v>>>0<t>>>0);fb(j);i=d;return}function j0(a,b){a=a|0;b=b|0;bd(((b|0)==-1?-1:b<<1)|0)|0;return}function j1(a){a=a|0;eC(a|0);mC(a);return}function j2(a){a=a|0;eC(a|0);return}function j3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bo(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function j4(a,b){a=a|0;b=b|0;bd(((b|0)==-1?-1:b<<1)|0)|0;return}function j5(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;mK(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=8240;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;L2657:do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=z;C=8240;while(1){c[m>>2]=x;D=(cG[c[C+12>>2]&31](w,j,x,h,m,y,A,l)|0)==2;E=c[m>>2]|0;if(D|(E|0)==(x|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){D=y;do{fh(r,a[D]|0);D=D+1|0;}while(D>>>0<(c[l>>2]|0)>>>0);F=c[m>>2]|0}else{F=E}if(F>>>0>=h>>>0){break L2657}x=F;C=c[B>>2]|0}B=ck(8)|0;e_(B,2376);bE(B|0,13344,28)}}while(0);eC(t|0);if((a[s]&1)==0){G=r+1|0}else{G=c[r+8>>2]|0}s=cg(((e|0)==-1?-1:e<<1)|0,f|0,g|0,G|0)|0;mK(v|0,0,12);v=u|0;c[u+4>>2]=0;c[u>>2]=8184;G=mI(s|0)|0;g=s+G|0;if((G|0)<1){H=u|0;eC(H);fb(r);i=d;return}G=u;f=g;e=o|0;t=o+128|0;o=s;s=8184;while(1){c[q>>2]=o;F=(cG[c[s+16>>2]&31](v,n,o,(f-o|0)>32?o+32|0:g,q,e,t,p)|0)==2;h=c[q>>2]|0;if(F|(h|0)==(o|0)){break}if(e>>>0<(c[p>>2]|0)>>>0){F=e;do{fU(b,c[F>>2]|0);F=F+4|0;}while(F>>>0<(c[p>>2]|0)>>>0);I=c[q>>2]|0}else{I=h}if(I>>>0>=g>>>0){J=2219;break}o=I;s=c[G>>2]|0}if((J|0)==2219){H=u|0;eC(H);fb(r);i=d;return}d=ck(8)|0;e_(d,2376);bE(d|0,13344,28)}function j6(a){a=a|0;var b=0;c[a>>2]=7584;b=c[a+8>>2]|0;if((b|0)!=0){bn(b|0)}eC(a|0);return}function j7(a){a=a|0;a=ck(8)|0;eW(a,4720);c[a>>2]=6520;bE(a|0,13376,42)}function j8(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1;c[b>>2]=7840;d=b+8|0;I=b+12|0;a[b+136|0]=1;J=b+24|0;K=J;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J+112;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J-1|0;}while((J|0)!=0);fm(b+144|0,4552,1);J=c[d>>2]|0;d=c[I>>2]|0;if((J|0)!=(d|0)){c[I>>2]=d+(~((d-4+(-J|0)|0)>>>2)<<2)}c[4417]=0;c[4416]=7544;if((c[4648]|0)!=-1){c[H>>2]=18592;c[H+4>>2]=16;c[H+8>>2]=0;fi(18592,H,120)}kj(b,17664,(c[4649]|0)-1|0);c[4415]=0;c[4414]=7504;if((c[4646]|0)!=-1){c[G>>2]=18584;c[G+4>>2]=16;c[G+8>>2]=0;fi(18584,G,120)}kj(b,17656,(c[4647]|0)-1|0);c[4467]=0;c[4466]=7952;c[4468]=0;a[17876]=0;c[4468]=c[(bm()|0)>>2];if((c[4728]|0)!=-1){c[F>>2]=18912;c[F+4>>2]=16;c[F+8>>2]=0;fi(18912,F,120)}kj(b,17864,(c[4729]|0)-1|0);c[4465]=0;c[4464]=7872;if((c[4726]|0)!=-1){c[E>>2]=18904;c[E+4>>2]=16;c[E+8>>2]=0;fi(18904,E,120)}kj(b,17856,(c[4727]|0)-1|0);c[4419]=0;c[4418]=7640;if((c[4652]|0)!=-1){c[D>>2]=18608;c[D+4>>2]=16;c[D+8>>2]=0;fi(18608,D,120)}kj(b,17672,(c[4653]|0)-1|0);c[1491]=0;c[1490]=7584;c[1492]=0;if((c[4650]|0)!=-1){c[C>>2]=18600;c[C+4>>2]=16;c[C+8>>2]=0;fi(18600,C,120)}kj(b,5960,(c[4651]|0)-1|0);c[4421]=0;c[4420]=7696;if((c[4654]|0)!=-1){c[B>>2]=18616;c[B+4>>2]=16;c[B+8>>2]=0;fi(18616,B,120)}kj(b,17680,(c[4655]|0)-1|0);c[4423]=0;c[4422]=7752;if((c[4656]|0)!=-1){c[A>>2]=18624;c[A+4>>2]=16;c[A+8>>2]=0;fi(18624,A,120)}kj(b,17688,(c[4657]|0)-1|0);c[4397]=0;c[4396]=7048;a[17592]=46;a[17593]=44;mK(17596,0,12);if((c[4632]|0)!=-1){c[z>>2]=18528;c[z+4>>2]=16;c[z+8>>2]=0;fi(18528,z,120)}kj(b,17584,(c[4633]|0)-1|0);c[1483]=0;c[1482]=7e3;c[1484]=46;c[1485]=44;mK(5944,0,12);if((c[4630]|0)!=-1){c[y>>2]=18520;c[y+4>>2]=16;c[y+8>>2]=0;fi(18520,y,120)}kj(b,5928,(c[4631]|0)-1|0);c[4413]=0;c[4412]=7432;if((c[4644]|0)!=-1){c[x>>2]=18576;c[x+4>>2]=16;c[x+8>>2]=0;fi(18576,x,120)}kj(b,17648,(c[4645]|0)-1|0);c[4411]=0;c[4410]=7360;if((c[4642]|0)!=-1){c[w>>2]=18568;c[w+4>>2]=16;c[w+8>>2]=0;fi(18568,w,120)}kj(b,17640,(c[4643]|0)-1|0);c[4409]=0;c[4408]=7296;if((c[4640]|0)!=-1){c[v>>2]=18560;c[v+4>>2]=16;c[v+8>>2]=0;fi(18560,v,120)}kj(b,17632,(c[4641]|0)-1|0);c[4407]=0;c[4406]=7232;if((c[4638]|0)!=-1){c[u>>2]=18552;c[u+4>>2]=16;c[u+8>>2]=0;fi(18552,u,120)}kj(b,17624,(c[4639]|0)-1|0);c[4477]=0;c[4476]=9264;if((c[4848]|0)!=-1){c[t>>2]=19392;c[t+4>>2]=16;c[t+8>>2]=0;fi(19392,t,120)}kj(b,17904,(c[4849]|0)-1|0);c[4475]=0;c[4474]=9200;if((c[4846]|0)!=-1){c[s>>2]=19384;c[s+4>>2]=16;c[s+8>>2]=0;fi(19384,s,120)}kj(b,17896,(c[4847]|0)-1|0);c[4473]=0;c[4472]=9136;if((c[4844]|0)!=-1){c[r>>2]=19376;c[r+4>>2]=16;c[r+8>>2]=0;fi(19376,r,120)}kj(b,17888,(c[4845]|0)-1|0);c[4471]=0;c[4470]=9072;if((c[4842]|0)!=-1){c[q>>2]=19368;c[q+4>>2]=16;c[q+8>>2]=0;fi(19368,q,120)}kj(b,17880,(c[4843]|0)-1|0);c[4395]=0;c[4394]=6704;if((c[4620]|0)!=-1){c[p>>2]=18480;c[p+4>>2]=16;c[p+8>>2]=0;fi(18480,p,120)}kj(b,17576,(c[4621]|0)-1|0);c[4393]=0;c[4392]=6664;if((c[4618]|0)!=-1){c[o>>2]=18472;c[o+4>>2]=16;c[o+8>>2]=0;fi(18472,o,120)}kj(b,17568,(c[4619]|0)-1|0);c[4391]=0;c[4390]=6624;if((c[4616]|0)!=-1){c[n>>2]=18464;c[n+4>>2]=16;c[n+8>>2]=0;fi(18464,n,120)}kj(b,17560,(c[4617]|0)-1|0);c[4389]=0;c[4388]=6584;if((c[4614]|0)!=-1){c[m>>2]=18456;c[m+4>>2]=16;c[m+8>>2]=0;fi(18456,m,120)}kj(b,17552,(c[4615]|0)-1|0);c[1479]=0;c[1478]=6904;c[1480]=6952;if((c[4628]|0)!=-1){c[l>>2]=18512;c[l+4>>2]=16;c[l+8>>2]=0;fi(18512,l,120)}kj(b,5912,(c[4629]|0)-1|0);c[1475]=0;c[1474]=6808;c[1476]=6856;if((c[4626]|0)!=-1){c[k>>2]=18504;c[k+4>>2]=16;c[k+8>>2]=0;fi(18504,k,120)}kj(b,5896,(c[4627]|0)-1|0);c[1471]=0;c[1470]=7808;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);c[1472]=c[4384];c[1470]=6776;if((c[4624]|0)!=-1){c[j>>2]=18496;c[j+4>>2]=16;c[j+8>>2]=0;fi(18496,j,120)}kj(b,5880,(c[4625]|0)-1|0);c[1467]=0;c[1466]=7808;do{if((a[19496]|0)==0){if((bu(19496)|0)==0){break}c[4384]=aY(1,4552,0)|0}}while(0);c[1468]=c[4384];c[1466]=6744;if((c[4622]|0)!=-1){c[h>>2]=18488;c[h+4>>2]=16;c[h+8>>2]=0;fi(18488,h,120)}kj(b,5864,(c[4623]|0)-1|0);c[4405]=0;c[4404]=7136;if((c[4636]|0)!=-1){c[g>>2]=18544;c[g+4>>2]=16;c[g+8>>2]=0;fi(18544,g,120)}kj(b,17616,(c[4637]|0)-1|0);c[4403]=0;c[4402]=7096;if((c[4634]|0)!=-1){c[f>>2]=18536;c[f+4>>2]=16;c[f+8>>2]=0;fi(18536,f,120)}kj(b,17608,(c[4635]|0)-1|0);i=e;return}function j9(a,b){a=a|0;b=b|0;return b|0}function ka(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function kb(a,b){a=a|0;b=b|0;return b<<24>>24|0}function kc(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function kd(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function ke(a){a=a|0;c[a+4>>2]=(J=c[4658]|0,c[4658]=J+1,J)+1;return}function kf(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function kg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=((e-4+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function kh(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function ki(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function kj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;eE(b|0);e=a+8|0;f=a+12|0;a=c[f>>2]|0;g=e|0;h=c[g>>2]|0;i=a-h>>2;do{if(i>>>0>d>>>0){j=h}else{k=d+1|0;if(i>>>0<k>>>0){lQ(e,k-i|0);j=c[g>>2]|0;break}if(i>>>0<=k>>>0){j=h;break}l=h+(k<<2)|0;if((l|0)==(a|0)){j=h;break}c[f>>2]=a+(~((a-4+(-l|0)|0)>>>2)<<2);j=h}}while(0);h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=j;n=m+(d<<2)|0;c[n>>2]=b;return}eU(h|0)|0;m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}function kk(a){a=a|0;kl(a);mC(a);return}function kl(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c[b>>2]=7840;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((e|0)!=(g|0)){h=0;i=g;g=e;while(1){e=c[i+(h<<2)>>2]|0;if((e|0)==0){j=g;k=i}else{l=e|0;eU(l)|0;j=c[d>>2]|0;k=c[f>>2]|0}l=h+1|0;if(l>>>0<j-k>>2>>>0){h=l;i=k;g=j}else{break}}}fb(b+144|0);j=c[f>>2]|0;if((j|0)==0){m=b|0;eC(m);return}f=c[d>>2]|0;if((j|0)!=(f|0)){c[d>>2]=f+(~((f-4+(-j|0)|0)>>>2)<<2)}if((j|0)==(b+24|0)){a[b+136|0]=0;m=b|0;eC(m);return}else{mC(j);m=b|0;eC(m);return}}function km(){var b=0,d=0;if((a[19480]|0)!=0){b=c[4376]|0;return b|0}if((bu(19480)|0)==0){b=c[4376]|0;return b|0}do{if((a[19488]|0)==0){if((bu(19488)|0)==0){break}j8(17696,1);c[4380]=17696;c[4378]=17520}}while(0);d=c[c[4378]>>2]|0;c[4382]=d;eE(d|0);c[4376]=17528;b=c[4376]|0;return b|0}function kn(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;c[a>>2]=d;eE(d|0);return}function ko(a){a=a|0;eU(c[a>>2]|0)|0;return}function kp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=16;c[e+8>>2]=0;fi(a,e,120)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=0;i=d;return g|0}g=(c[b+(e<<2)>>2]|0)!=0;i=d;return g|0}function kq(a){a=a|0;eC(a|0);mC(a);return}function kr(a){a=a|0;if((a|0)==0){return}cx[c[(c[a>>2]|0)+4>>2]&511](a);return}function ks(a){a=a|0;eC(a|0);mC(a);return}function kt(b){b=b|0;var d=0;c[b>>2]=7952;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}mD(d)}}while(0);eC(b|0);mC(b);return}function ku(b){b=b|0;var d=0;c[b>>2]=7952;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}mD(d)}}while(0);eC(b|0);return}function kv(a){a=a|0;eC(a|0);mC(a);return}function kw(a){a=a|0;var b=0;b=c[(km()|0)>>2]|0;c[a>>2]=b;eE(b|0);return}function kx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=16;c[e+8>>2]=0;fi(a,e,120)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=ck(4)|0;h=g;l7(h);bE(g|0,13328,164);return 0}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=ck(4)|0;h=g;l7(h);bE(g|0,13328,164);return 0}else{i=d;return f|0}return 0}function ky(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[(bm()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function kz(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[(bm()|0)>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function kA(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[(bm()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=245;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=246;break}else{h=e}}if((i|0)==245){return g|0}else if((i|0)==246){return g|0}return 0}function kB(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=254;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=255;break}if((b[(c[(bm()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=256;break}else{a=a+4|0}}if((h|0)==254){return g|0}else if((h|0)==255){return g|0}else if((h|0)==256){return g|0}return 0}function kC(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(cp()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function kD(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(cp()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function kE(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(cq()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function kF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(cq()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function kG(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(cp()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function kH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(cp()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function kI(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(cq()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function kJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(cq()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function kK(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function kL(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function kM(a){a=a|0;return 1}function kN(a){a=a|0;return 1}function kO(a){a=a|0;return 1}function kP(a){a=a|0;return 0}function kQ(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function kR(a){a=a|0;eC(a|0);mC(a);return}function kS(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=k2(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function kT(a){a=a|0;var b=0;c[a>>2]=7584;b=c[a+8>>2]|0;if((b|0)!=0){bn(b|0)}eC(a|0);mC(a);return}function kU(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;l=i;i=i+8|0;m=l|0;n=m;o=i;i=i+1|0;i=i+7>>3<<3;p=e;while(1){if((p|0)==(f|0)){q=f;break}if((c[p>>2]|0)==0){q=p;break}else{p=p+4|0}}c[k>>2]=h;c[g>>2]=e;L373:do{if((e|0)==(f|0)|(h|0)==(j|0)){r=e}else{p=d;s=j;t=b+8|0;u=o|0;v=h;w=e;x=q;while(1){y=c[p+4>>2]|0;c[m>>2]=c[p>>2];c[m+4>>2]=y;y=b4(c[t>>2]|0)|0;z=ma(v,g,x-w>>2,s-v|0,d)|0;if((y|0)!=0){b4(y|0)|0}if((z|0)==(-1|0)){A=348;break}else if((z|0)==0){B=1;A=384;break}y=(c[k>>2]|0)+z|0;c[k>>2]=y;if((y|0)==(j|0)){A=381;break}if((x|0)==(f|0)){C=f;D=y;E=c[g>>2]|0}else{y=b4(c[t>>2]|0)|0;z=lZ(u,0,d)|0;if((y|0)!=0){b4(y|0)|0}if((z|0)==-1){B=2;A=386;break}y=c[k>>2]|0;if(z>>>0>(s-y|0)>>>0){B=1;A=387;break}L392:do{if((z|0)!=0){F=z;G=u;H=y;while(1){I=a[G]|0;c[k>>2]=H+1;a[H]=I;I=F-1|0;if((I|0)==0){break L392}F=I;G=G+1|0;H=c[k>>2]|0}}}while(0);y=(c[g>>2]|0)+4|0;c[g>>2]=y;z=y;while(1){if((z|0)==(f|0)){J=f;break}if((c[z>>2]|0)==0){J=z;break}else{z=z+4|0}}C=J;D=c[k>>2]|0;E=y}if((E|0)==(f|0)|(D|0)==(j|0)){r=E;break L373}else{v=D;w=E;x=C}}if((A|0)==348){c[k>>2]=v;L404:do{if((w|0)==(c[g>>2]|0)){K=w}else{x=w;u=v;while(1){s=c[x>>2]|0;p=b4(c[t>>2]|0)|0;z=lZ(u,s,n)|0;if((p|0)!=0){b4(p|0)|0}if((z|0)==-1){K=x;break L404}p=(c[k>>2]|0)+z|0;c[k>>2]=p;z=x+4|0;if((z|0)==(c[g>>2]|0)){K=z;break}else{x=z;u=p}}}}while(0);c[g>>2]=K;B=2;i=l;return B|0}else if((A|0)==381){r=c[g>>2]|0;break}else if((A|0)==384){i=l;return B|0}else if((A|0)==386){i=l;return B|0}else if((A|0)==387){i=l;return B|0}}}while(0);B=(r|0)!=(f|0)|0;i=l;return B|0}function kV(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L425:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=w;x=v;w=b4(c[s>>2]|0)|0;y=lW(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){b4(w|0)|0}if((y|0)==0){z=2;A=438;break}else if((y|0)==(-1|0)){A=403;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){A=435;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=b4(c[s>>2]|0)|0;F=lV(w,y,1,d)|0;if((E|0)!=0){b4(E|0)|0}if((F|0)!=0){z=2;A=443;break}c[k>>2]=(c[k>>2]|0)+4;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L425}else{t=C;u=D;v=B}}if((A|0)==438){i=l;return z|0}else if((A|0)==403){c[k>>2]=t;L450:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=b4(c[s>>2]|0)|0;E=lV(v,r,x-r|0,n)|0;if((o|0)!=0){b4(o|0)|0}if((E|0)==0){I=r+1|0}else if((E|0)==(-1|0)){A=414;break}else if((E|0)==(-2|0)){A=415;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L450}else{v=E;r=I}}if((A|0)==414){c[g>>2]=r;z=2;i=l;return z|0}else if((A|0)==415){c[g>>2]=r;z=1;i=l;return z|0}}}while(0);c[g>>2]=H;z=(H|0)!=(f|0)|0;i=l;return z|0}else if((A|0)==443){i=l;return z|0}else if((A|0)==435){q=c[g>>2]|0;break}}}while(0);z=(q|0)!=(f|0)|0;i=l;return z|0}function kW(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;j=b4(c[b+8>>2]|0)|0;b=lZ(e,0,d)|0;if((j|0)!=0){b4(j|0)|0}if((b|0)==(-1|0)|(b|0)==0){k=2;i=h;return k|0}j=b-1|0;b=c[g>>2]|0;if(j>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((j|0)==0){k=0;i=h;return k|0}else{l=j;m=e;n=b}while(1){b=a[m]|0;c[g>>2]=n+1;a[n]=b;b=l-1|0;if((b|0)==0){k=0;break}l=b;m=m+1|0;n=c[g>>2]|0}i=h;return k|0}function kX(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a+8|0;a=b4(c[b>>2]|0)|0;d=lY(0,0,1)|0;if((a|0)!=0){b4(a|0)|0}if((d|0)!=0){e=-1;return e|0}d=c[b>>2]|0;if((d|0)==0){e=1;return e|0}e=b4(d|0)|0;d=bv()|0;if((e|0)==0){f=(d|0)==1;g=f&1;return g|0}b4(e|0)|0;f=(d|0)==1;g=f&1;return g|0}function kY(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=d;d=0;j=0;while(1){k=b4(c[i>>2]|0)|0;l=lU(a,h-a|0,b)|0;if((k|0)!=0){b4(k|0)|0}if((l|0)==0){m=1;n=a+1|0}else if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;o=504;break}else{m=l;n=a+l|0}l=m+d|0;k=j+1|0;if(k>>>0>=f>>>0|(n|0)==(e|0)){g=l;o=503;break}else{a=n;d=l;j=k}}if((o|0)==504){return g|0}else if((o|0)==503){return g|0}return 0}function kZ(a){a=a|0;var b=0,d=0;b=c[a+8>>2]|0;if((b|0)==0){d=1;return d|0}a=b4(b|0)|0;b=bv()|0;if((a|0)==0){d=b;return d|0}b4(a|0)|0;d=b;return d|0}function k_(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function k$(a){a=a|0;return 0}function k0(a){a=a|0;return 0}function k1(a){a=a|0;return 4}function k2(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L548:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=561;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=560;break L548}c[j>>2]=p+1;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=552;break L548}c[j>>2]=p+1;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=553;break L548}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=562;break L548}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=555;break L548}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=557;break L548}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=558;break L548}if((d-(c[j>>2]|0)|0)<4){m=1;o=554;break L548}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=559;break L548}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=556;break}}if((o|0)==557){return m|0}else if((o|0)==558){return m|0}else if((o|0)==559){return m|0}else if((o|0)==560){return m|0}else if((o|0)==561){return m|0}else if((o|0)==562){return m|0}else if((o|0)==553){return m|0}else if((o|0)==554){return m|0}else if((o|0)==555){return m|0}else if((o|0)==556){return m|0}else if((o|0)==552){return m|0}return 0}function k3(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L593:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L595:while(1){if(e>>>0>=i>>>0){o=n;break L593}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=615;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1}else{if((p&255)<194){r=2;s=614;break L595}if((p&255)<224){if((h-n|0)<2){r=1;s=617;break L595}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=616;break L595}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=625;break L595}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2;break}if((p&255)<240){if((h-n|0)<3){r=1;s=605;break L595}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=607;break L595}}else if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=608;break L595}}else{if((u&-64)<<24>>24!=-128){r=2;s=606;break L595}}v=t&255;if((v&192|0)!=128){r=2;s=623;break L595}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=624;break L595}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3;break}if((p&255)>=245){r=2;s=621;break L595}if((h-n|0)<4){r=1;s=622;break L595}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==240){if((t+112&255)>=48){r=2;s=610;break L595}}else if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=611;break L595}}else{if((t&-64)<<24>>24!=-128){r=2;s=612;break L595}}w=v&255;if((w&192|0)!=128){r=2;s=613;break L595}v=u&255;if((v&192|0)!=128){r=2;s=618;break L595}if((l-e|0)<4){r=1;s=619;break L595}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=620;break L595}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L593}}if((s|0)==625){return r|0}else if((s|0)==613){return r|0}else if((s|0)==614){return r|0}else if((s|0)==615){return r|0}else if((s|0)==616){return r|0}else if((s|0)==617){return r|0}else if((s|0)==618){return r|0}else if((s|0)==608){return r|0}else if((s|0)==610){return r|0}else if((s|0)==611){return r|0}else if((s|0)==612){return r|0}else if((s|0)==605){return r|0}else if((s|0)==606){return r|0}else if((s|0)==607){return r|0}else if((s|0)==619){return r|0}else if((s|0)==620){return r|0}else if((s|0)==621){return r|0}else if((s|0)==622){return r|0}else if((s|0)==623){return r|0}else if((s|0)==624){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0|0;return r|0}function k4(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L662:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L664:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L662}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L662}if((k&255)<224){if((g-j|0)<2){m=j;break L662}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L662}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L662}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L662}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==224){if((p&-32)<<24>>24!=-96){s=646;break L664}}else if((l|0)==237){if((p&-32)<<24>>24!=-128){s=648;break L664}}else{if((p&-64)<<24>>24!=-128){s=650;break L664}}t=r&255;if((t&192|0)!=128){m=j;break L662}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L662}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L662}u=j;if((g-u|0)<4){m=j;break L662}if((e-i|0)>>>0<2){m=j;break L662}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==240){if((t+112&255)>=48){s=659;break L664}}else if((l|0)==244){if((t&-16)<<24>>24!=-128){s=661;break L664}}else{if((t&-64)<<24>>24!=-128){s=663;break L664}}v=p&255;if((v&192|0)!=128){m=j;break L662}p=r&255;if((p&192|0)!=128){m=j;break L662}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L662}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L662}}if((s|0)==646){w=q-b|0;return w|0}else if((s|0)==648){w=q-b|0;return w|0}else if((s|0)==650){w=q-b|0;return w|0}else if((s|0)==661){w=u-b|0;return w|0}else if((s|0)==663){w=u-b|0;return w|0}else if((s|0)==659){w=u-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function k5(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=k3(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function k6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return k4(c,d,e,1114111,0)|0}function k7(a){a=a|0;eC(a|0);mC(a);return}function k8(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=ld(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function k9(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function la(a){a=a|0;return 0}function lb(a){a=a|0;return 0}function lc(a){a=a|0;return 4}function ld(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L733:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=706;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=708;break L733}c[h>>2]=b+1;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=710;break L733}c[h>>2]=b+1;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=711;break L733}c[h>>2]=b+1;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=712;break L733}c[h>>2]=b+1;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=707;break}}if((l|0)==708){return k|0}else if((l|0)==710){return k|0}else if((l|0)==707){return k|0}else if((l|0)==711){return k|0}else if((l|0)==712){return k|0}else if((l|0)==706){return k|0}return 0}function le(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L765:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L767:while(1){if(k>>>0>=h>>>0){m=b;break L765}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=760;break L767}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1}else{if((n&255)<194){p=2;q=761;break L767}if((n&255)<224){if((g-b|0)<2){p=1;q=755;break L767}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=756;break L767}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=772;break L767}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2;break}if((n&255)<240){if((g-b|0)<3){p=1;q=754;break L767}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=762;break L767}}else if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=763;break L767}}else{if((s&-64)<<24>>24!=-128){p=2;q=767;break L767}}t=r&255;if((t&192|0)!=128){p=2;q=764;break L767}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=753;break L767}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3;break}if((n&255)>=245){p=2;q=771;break L767}if((g-b|0)<4){p=1;q=757;break L767}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=758;break L767}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=765;break L767}}else{if((r&-64)<<24>>24!=-128){p=2;q=766;break L767}}u=t&255;if((u&192|0)!=128){p=2;q=770;break L767}t=s&255;if((t&192|0)!=128){p=2;q=768;break L767}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=769;break L767}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L765}}if((q|0)==768){return p|0}else if((q|0)==769){return p|0}else if((q|0)==770){return p|0}else if((q|0)==771){return p|0}else if((q|0)==772){return p|0}else if((q|0)==756){return p|0}else if((q|0)==757){return p|0}else if((q|0)==758){return p|0}else if((q|0)==760){return p|0}else if((q|0)==761){return p|0}else if((q|0)==753){return p|0}else if((q|0)==754){return p|0}else if((q|0)==755){return p|0}else if((q|0)==762){return p|0}else if((q|0)==763){return p|0}else if((q|0)==764){return p|0}else if((q|0)==765){return p|0}else if((q|0)==766){return p|0}else if((q|0)==767){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0|0;return p|0}function lf(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L832:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L834:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L832}n=j+1|0}else{if((k&255)<194){m=j;break L832}if((k&255)<224){if((g-j|0)<2){m=j;break L832}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L832}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L832}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L832}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==224){if((o&-32)<<24>>24!=-96){r=793;break L834}}else if((l|0)==237){if((o&-32)<<24>>24!=-128){r=795;break L834}}else{if((o&-64)<<24>>24!=-128){r=797;break L834}}s=q&255;if((s&192|0)!=128){m=j;break L832}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L832}n=j+3|0;break}if((k&255)>=245){m=j;break L832}t=j;if((g-t|0)<4){m=j;break L832}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==240){if((s+112&255)>=48){r=805;break L834}}else if((l|0)==244){if((s&-16)<<24>>24!=-128){r=807;break L834}}else{if((s&-64)<<24>>24!=-128){r=809;break L834}}u=o&255;if((u&192|0)!=128){m=j;break L832}o=q&255;if((o&192|0)!=128){m=j;break L832}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L832}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L832}i=i+1|0;j=n}if((r|0)==793){v=p-b|0;return v|0}else if((r|0)==795){v=p-b|0;return v|0}else if((r|0)==797){v=p-b|0;return v|0}else if((r|0)==805){v=t-b|0;return v|0}else if((r|0)==807){v=t-b|0;return v|0}else if((r|0)==809){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function lg(b){b=b|0;return a[b+8|0]|0}function lh(a){a=a|0;return c[a+8>>2]|0}function li(b){b=b|0;return a[b+9|0]|0}function lj(a){a=a|0;return c[a+12>>2]|0}function lk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=le(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function ll(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return lf(c,d,e,1114111,0)|0}function lm(a){a=a|0;eC(a|0);mC(a);return}function ln(a){a=a|0;eC(a|0);mC(a);return}function lo(a){a=a|0;c[a>>2]=7048;fb(a+12|0);eC(a|0);mC(a);return}function lp(a){a=a|0;c[a>>2]=7048;fb(a+12|0);eC(a|0);return}function lq(a){a=a|0;c[a>>2]=7e3;fb(a+16|0);eC(a|0);mC(a);return}function lr(a){a=a|0;c[a>>2]=7e3;fb(a+16|0);eC(a|0);return}function ls(a,b){a=a|0;b=b|0;fl(a,b+12|0);return}function lt(a,b){a=a|0;b=b|0;fl(a,b+16|0);return}function lu(a,b){a=a|0;b=b|0;fm(a,3936,4);return}function lv(a,b){a=a|0;b=b|0;fB(a,3848,l3(3848)|0);return}function lw(a,b){a=a|0;b=b|0;fm(a,3720,5);return}function lx(a,b){a=a|0;b=b|0;fB(a,3600,l3(3600)|0);return}function ly(b){b=b|0;var d=0;if((a[19576]|0)!=0){d=c[4502]|0;return d|0}if((bu(19576)|0)==0){d=c[4502]|0;return d|0}do{if((a[19464]|0)==0){if((bu(19464)|0)==0){break}mK(17048,0,168);a9(328,0,v|0)|0}}while(0);fd(17048,5208)|0;fd(17060,5176)|0;fd(17072,5168)|0;fd(17084,5152)|0;fd(17096,5136)|0;fd(17108,5128)|0;fd(17120,5112)|0;fd(17132,5104)|0;fd(17144,5088)|0;fd(17156,5056)|0;fd(17168,5048)|0;fd(17180,5024)|0;fd(17192,5008)|0;fd(17204,5e3)|0;c[4502]=17048;d=c[4502]|0;return d|0}function lz(b){b=b|0;var d=0;if((a[19520]|0)!=0){d=c[4480]|0;return d|0}if((bu(19520)|0)==0){d=c[4480]|0;return d|0}do{if((a[19440]|0)==0){if((bu(19440)|0)==0){break}mK(16304,0,168);a9(180,0,v|0)|0}}while(0);fv(16304,5752)|0;fv(16316,5720)|0;fv(16328,5680)|0;fv(16340,5640)|0;fv(16352,5576)|0;fv(16364,5544)|0;fv(16376,5480)|0;fv(16388,5464)|0;fv(16400,5392)|0;fv(16412,5376)|0;fv(16424,5360)|0;fv(16436,5344)|0;fv(16448,5264)|0;fv(16460,5248)|0;c[4480]=16304;d=c[4480]|0;return d|0}function lA(b){b=b|0;var d=0;if((a[19568]|0)!=0){d=c[4500]|0;return d|0}if((bu(19568)|0)==0){d=c[4500]|0;return d|0}do{if((a[19456]|0)==0){if((bu(19456)|0)==0){break}mK(16760,0,288);a9(238,0,v|0)|0}}while(0);fd(16760,416)|0;fd(16772,400)|0;fd(16784,392)|0;fd(16796,384)|0;fd(16808,376)|0;fd(16820,368)|0;fd(16832,352)|0;fd(16844,344)|0;fd(16856,304)|0;fd(16868,288)|0;fd(16880,232)|0;fd(16892,216)|0;fd(16904,208)|0;fd(16916,200)|0;fd(16928,192)|0;fd(16940,184)|0;fd(16952,376)|0;fd(16964,168)|0;fd(16976,160)|0;fd(16988,5832)|0;fd(17e3,5824)|0;fd(17012,5800)|0;fd(17024,5792)|0;fd(17036,5784)|0;c[4500]=16760;d=c[4500]|0;return d|0}function lB(b){b=b|0;var d=0;if((a[19512]|0)!=0){d=c[4478]|0;return d|0}if((bu(19512)|0)==0){d=c[4478]|0;return d|0}do{if((a[19432]|0)==0){if((bu(19432)|0)==0){break}mK(16016,0,288);a9(150,0,v|0)|0}}while(0);fv(16016,1432)|0;fv(16028,1360)|0;fv(16040,1304)|0;fv(16052,1184)|0;fv(16064,728)|0;fv(16076,1072)|0;fv(16088,1048)|0;fv(16100,1016)|0;fv(16112,976)|0;fv(16124,944)|0;fv(16136,896)|0;fv(16148,848)|0;fv(16160,832)|0;fv(16172,784)|0;fv(16184,768)|0;fv(16196,744)|0;fv(16208,728)|0;fv(16220,712)|0;fv(16232,664)|0;fv(16244,592)|0;fv(16256,536)|0;fv(16268,512)|0;fv(16280,496)|0;fv(16292,448)|0;c[4478]=16016;d=c[4478]|0;return d|0}function lC(b){b=b|0;var d=0;if((a[19584]|0)!=0){d=c[4504]|0;return d|0}if((bu(19584)|0)==0){d=c[4504]|0;return d|0}do{if((a[19472]|0)==0){if((bu(19472)|0)==0){break}mK(17216,0,288);a9(148,0,v|0)|0}}while(0);fd(17216,1592)|0;fd(17228,1528)|0;c[4504]=17216;d=c[4504]|0;return d|0}function lD(b){b=b|0;var d=0;if((a[19528]|0)!=0){d=c[4482]|0;return d|0}if((bu(19528)|0)==0){d=c[4482]|0;return d|0}do{if((a[19448]|0)==0){if((bu(19448)|0)==0){break}mK(16472,0,288);a9(298,0,v|0)|0}}while(0);fv(16472,1816)|0;fv(16484,1736)|0;c[4482]=16472;d=c[4482]|0;return d|0}function lE(b){b=b|0;if((a[19592]|0)!=0){return 18024}if((bu(19592)|0)==0){return 18024}fm(18024,3352,8);a9(320,18024,v|0)|0;return 18024}function lF(b){b=b|0;if((a[19536]|0)!=0){return 17936}if((bu(19536)|0)==0){return 17936}fB(17936,3224,l3(3224)|0);a9(240,17936,v|0)|0;return 17936}function lG(b){b=b|0;if((a[19616]|0)!=0){return 18072}if((bu(19616)|0)==0){return 18072}fm(18072,3112,8);a9(320,18072,v|0)|0;return 18072}function lH(b){b=b|0;if((a[19560]|0)!=0){return 17984}if((bu(19560)|0)==0){return 17984}fB(17984,2992,l3(2992)|0);a9(240,17984,v|0)|0;return 17984}function lI(b){b=b|0;if((a[19608]|0)!=0){return 18056}if((bu(19608)|0)==0){return 18056}fm(18056,2888,20);a9(320,18056,v|0)|0;return 18056}function lJ(b){b=b|0;if((a[19552]|0)!=0){return 17968}if((bu(19552)|0)==0){return 17968}fB(17968,2704,l3(2704)|0);a9(240,17968,v|0)|0;return 17968}function lK(b){b=b|0;if((a[19600]|0)!=0){return 18040}if((bu(19600)|0)==0){return 18040}fm(18040,2632,11);a9(320,18040,v|0)|0;return 18040}function lL(b){b=b|0;if((a[19544]|0)!=0){return 17952}if((bu(19544)|0)==0){return 17952}fB(17952,2544,l3(2544)|0);a9(240,17952,v|0)|0;return 17952}function lM(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;cx[f&511](a);return}else{f=c[(c[d>>2]|0)+(e-1)>>2]|0;cx[f&511](a);return}}function lN(a){a=a|0;fu(16748);fu(16736);fu(16724);fu(16712);fu(16700);fu(16688);fu(16676);fu(16664);fu(16652);fu(16640);fu(16628);fu(16616);fu(16604);fu(16592);fu(16580);fu(16568);fu(16556);fu(16544);fu(16532);fu(16520);fu(16508);fu(16496);fu(16484);fu(16472);return}function lO(a){a=a|0;fb(17492);fb(17480);fb(17468);fb(17456);fb(17444);fb(17432);fb(17420);fb(17408);fb(17396);fb(17384);fb(17372);fb(17360);fb(17348);fb(17336);fb(17324);fb(17312);fb(17300);fb(17288);fb(17276);fb(17264);fb(17252);fb(17240);fb(17228);fb(17216);return}function lP(a){a=a|0;fu(16292);fu(16280);fu(16268);fu(16256);fu(16244);fu(16232);fu(16220);fu(16208);fu(16196);fu(16184);fu(16172);fu(16160);fu(16148);fu(16136);fu(16124);fu(16112);fu(16100);fu(16088);fu(16076);fu(16064);fu(16052);fu(16040);fu(16028);fu(16016);return}function lQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}k=l+4|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b+16|0;k=b|0;l=c[k>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){j7(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=1084}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=1084;break}a[l]=1;p=j;q=h}}while(0);if((o|0)==1084){p=my(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;do{if((d|0)==0){r=0}else{c[d>>2]=0;r=d}d=r+4|0;n=n-1|0;}while((n|0)!=0);n=p+(q<<2)|0;q=c[k>>2]|0;r=(c[f>>2]|0)-q|0;o=p+(g-(r>>2)<<2)|0;g=o;p=q;mJ(g|0,p|0,r)|0;c[k>>2]=o;c[f>>2]=d;c[e>>2]=n;if((q|0)==0){return}if((q|0)==(j|0)){a[b+128|0]=0;return}else{mC(p);return}}function lR(a){a=a|0;fb(17036);fb(17024);fb(17012);fb(17e3);fb(16988);fb(16976);fb(16964);fb(16952);fb(16940);fb(16928);fb(16916);fb(16904);fb(16892);fb(16880);fb(16868);fb(16856);fb(16844);fb(16832);fb(16820);fb(16808);fb(16796);fb(16784);fb(16772);fb(16760);return}function lS(a){a=a|0;fu(16460);fu(16448);fu(16436);fu(16424);fu(16412);fu(16400);fu(16388);fu(16376);fu(16364);fu(16352);fu(16340);fu(16328);fu(16316);fu(16304);return}function lT(a){a=a|0;fb(17204);fb(17192);fb(17180);fb(17168);fb(17156);fb(17144);fb(17132);fb(17120);fb(17108);fb(17096);fb(17084);fb(17072);fb(17060);fb(17048);return}function lU(a,b,c){a=a|0;b=b|0;c=c|0;return lV(0,a,b,(c|0)!=0?c:15504)|0}function lV(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?15496:f)|0;f=c[j>>2]|0;L1178:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0|0;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L1178}o=d+1|0;p=c[u+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L1196:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L1178}else{s=o;t=p;v=q;w=l}while(1){s=s+1|0;t=(w&255)-128|t<<6;v=v-1|0;if((t|0)>=0){break}if((v|0)==0){r=t;break L1196}w=a[s]|0;if(((w&255)-128|0)>>>0>63){break L1178}}c[j>>2]=0;c[m>>2]=t;k=e-v|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(a7()|0)>>2]=138;k=-1;i=g;return k|0}function lW(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L1209:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L1209}z=y?s:x;A=t-z|0;x=lX(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L1209}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L1220:do{if((r|0)==0){D=n}else{if((p|0)==0|(o|0)==0){D=n;break}else{E=p;F=o;G=n;H=q;I=r}while(1){J=lV(H,I,F,f)|0;if((J+2|0)>>>0<3){break}A=(c[j>>2]|0)+J|0;c[j>>2]=A;B=E-1|0;C=G+1|0;if((B|0)==0|(F|0)==(J|0)){D=C;break L1220}else{E=B;F=F-J|0;G=C;H=H+4|0;I=A}}if((J|0)==(-1|0)){D=-1;break}else if((J|0)==0){c[j>>2]=0;D=G;break}else{c[f>>2]=0;D=G;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=c[j>>2];i=g;return D|0}function lX(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;h=c[e>>2]|0;do{if((g|0)==0){i=1151}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=1151;break}if((b|0)==0){l=k;m=h;n=f;i=1162;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=1182}}while(0);if((i|0)==1151){if((b|0)==0){s=h;t=f;i=1153}else{v=h;w=b;x=f;i=1152}}L1241:while(1){if((i|0)==1182){i=0;h=d[p]|0;g=h>>>3;if((g-16|g+(o>>26))>>>0>7){i=1183;break}g=p+1|0;y=h-128|o<<6;do{if((y|0)<0){h=(d[g]|0)-128|0;if(h>>>0>63){i=1186;break L1241}k=p+2|0;z=h|y<<6;if((z|0)>=0){A=z;B=k;break}h=(d[k]|0)-128|0;if(h>>>0>63){i=1189;break L1241}A=h|z<<6;B=p+3|0}else{A=y;B=g}}while(0);c[q>>2]=A;v=B;w=q+4|0;x=r-1|0;i=1152;continue}else if((i|0)==1162){i=0;g=(d[m]|0)>>>3;if((g-16|g+(l>>26))>>>0>7){i=1163;break}g=m+1|0;do{if((l&33554432|0)==0){C=g}else{if(((d[g]|0)-128|0)>>>0>63){i=1166;break L1241}h=m+2|0;if((l&524288|0)==0){C=h;break}if(((d[h]|0)-128|0)>>>0>63){i=1169;break L1241}C=m+3|0}}while(0);s=C;t=n-1|0;i=1153;continue}else if((i|0)==1152){i=0;if((x|0)==0){D=f;i=1203;break}else{E=x;F=w;G=v}while(1){g=a[G]|0;do{if(((g&255)-1|0)>>>0<127){if((G&3|0)==0&E>>>0>3){H=E;I=F;J=G}else{K=G;L=F;M=E;N=g;break}while(1){O=c[J>>2]|0;if(((O-16843009|O)&-2139062144|0)!=0){i=1176;break}c[I>>2]=O&255;c[I+4>>2]=d[J+1|0]|0;c[I+8>>2]=d[J+2|0]|0;P=J+4|0;Q=I+16|0;c[I+12>>2]=d[J+3|0]|0;R=H-4|0;if(R>>>0>3){H=R;I=Q;J=P}else{i=1177;break}}if((i|0)==1176){i=0;K=J;L=I;M=H;N=O&255;break}else if((i|0)==1177){i=0;K=P;L=Q;M=R;N=a[P]|0;break}}else{K=G;L=F;M=E;N=g}}while(0);S=N&255;if((S-1|0)>>>0>=127){break}c[L>>2]=S;g=M-1|0;if((g|0)==0){D=f;i=1204;break L1241}else{E=g;F=L+4|0;G=K+1|0}}g=S-194|0;if(g>>>0>50){T=M;U=L;V=K;i=1193;break}o=c[u+(g<<2)>>2]|0;p=K+1|0;q=L;r=M;i=1182;continue}else if((i|0)==1153){i=0;g=a[s]|0;do{if(((g&255)-1|0)>>>0<127){if((s&3|0)!=0){W=s;X=t;Y=g;break}h=c[s>>2]|0;if(((h-16843009|h)&-2139062144|0)==0){Z=t;_=s}else{W=s;X=t;Y=h&255;break}do{_=_+4|0;Z=Z-4|0;$=c[_>>2]|0;}while((($-16843009|$)&-2139062144|0)==0);W=_;X=Z;Y=$&255}else{W=s;X=t;Y=g}}while(0);g=Y&255;if((g-1|0)>>>0<127){s=W+1|0;t=X-1|0;i=1153;continue}h=g-194|0;if(h>>>0>50){T=X;U=b;V=W;i=1193;break}l=c[u+(h<<2)>>2]|0;m=W+1|0;n=X;i=1162;continue}}if((i|0)==1203){return D|0}else if((i|0)==1204){return D|0}else if((i|0)==1183){aa=o;ab=p-1|0;ac=q;ad=r;i=1192}else if((i|0)==1163){aa=l;ab=m-1|0;ac=b;ad=n;i=1192}else if((i|0)==1166){aa=l;ab=m-1|0;ac=b;ad=n;i=1192}else if((i|0)==1189){aa=z;ab=p-1|0;ac=q;ad=r;i=1192}else if((i|0)==1169){aa=l;ab=m-1|0;ac=b;ad=n;i=1192}else if((i|0)==1186){aa=y;ab=p-1|0;ac=q;ad=r;i=1192}if((i|0)==1192){if((aa|0)==0){T=ad;U=ac;V=ab;i=1193}else{ae=ac;af=ab}}do{if((i|0)==1193){if((a[V]|0)!=0){ae=U;af=V;break}if((U|0)!=0){c[U>>2]=0;c[e>>2]=0}D=f-T|0;return D|0}}while(0);c[(a7()|0)>>2]=138;if((ae|0)==0){D=-1;return D|0}c[e>>2]=af;D=-1;return D|0}function lY(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m-194|0;if(k>>>0>50){break}m=e+1|0;n=c[u+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>(((f*6|0)-6|0)>>>0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m-16|m+(n>>26))>>>0>7){break}m=k-128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)-128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)-128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(a7()|0)>>2]=138;j=-1;i=g;return j|0}function lZ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[(a7()|0)>>2]=138;f=-1;return f|0}return 0}function l_(a){a=a|0;return}function l$(a){a=a|0;return}function l0(a){a=a|0;return 2096|0}function l1(a){a=a|0;return}function l2(a){a=a|0;return}function l3(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function l4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((d|0)==0){return a|0}else{e=b;f=d;g=a}while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}return a|0}function l5(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}else{f=d}do{f=f-1|0;c[a+(f<<2)>>2]=c[b+(f<<2)>>2];}while((f|0)!=0);return a|0}else{if(e){return a|0}else{g=b;h=d;i=a}while(1){d=h-1|0;c[i>>2]=c[g>>2];if((d|0)==0){break}else{g=g+4|0;h=d;i=i+4|0}}return a|0}return 0}function l6(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((d|0)==0){return a|0}else{e=d;f=a}while(1){d=e-1|0;c[f>>2]=b;if((d|0)==0){break}else{e=d;f=f+4|0}}return a|0}function l7(a){a=a|0;c[a>>2]=6424;return}function l8(a,b,c){a=a|0;b=b|0;c=c|0;return(a|0)==(b|0)|0}function l9(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function ma(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L1415:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L1415}x=w?r:s;y=s-x|0;w=mb(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L1415}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L1426:do{if((q|0)==0){B=m}else{if((o|0)==0|(n|0)==0){B=m;break}else{C=o;D=n;E=m;F=p;G=q}while(1){H=lZ(F,c[G>>2]|0,0)|0;if((H+1|0)>>>0<2){break}y=(c[h>>2]|0)+4|0;c[h>>2]=y;z=D-1|0;A=E+1|0;if((C|0)==(H|0)|(z|0)==0){B=A;break L1426}else{C=C-H|0;D=z;E=A;F=F+H|0;G=y}}if((H|0)!=0){B=-1;break}c[h>>2]=0;B=E}}while(0);if(!k){i=f;return B|0}c[b>>2]=c[h>>2];i=f;return B|0}function mb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=lZ(j,o,0)|0;if((k|0)==-1){l=-1;p=1341;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=1339;break}else{m=k;n=h;o=r}}if((p|0)==1339){i=f;return l|0}else if((p|0)==1341){i=f;return l|0}}L1452:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L1452}if(q>>>0>127){j=lZ(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L1452}}i=f;return l|0}else{s=e;t=b}}while(0);L1464:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=1332;break}if(m>>>0>127){n=lZ(b,m,0)|0;if((n|0)==-1){l=-1;p=1338;break}if(n>>>0>u>>>0){p=1328;break}o=c[w>>2]|0;lZ(v,o,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L1464}else{u=z;v=y;w=m}}if((p|0)==1332){a[v]=0;x=u;break}else if((p|0)==1338){i=f;return l|0}else if((p|0)==1328){l=e-u|0;i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function mc(a){a=a|0;mC(a);return}function md(a){a=a|0;l_(a|0);return}function me(a){a=a|0;l_(a|0);mC(a);return}function mf(a){a=a|0;l_(a|0);mC(a);return}function mg(a){a=a|0;l_(a|0);mC(a);return}function mh(a){a=a|0;l_(a|0);mC(a);return}function mi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=ml(b,15032,15016,-1)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}mK(f|0,0,56);c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;cM[c[(c[h>>2]|0)+28>>2]&31](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function mj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;cM[c[(c[g>>2]|0)+28>>2]&31](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function mk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;cM[c[(c[j>>2]|0)+28>>2]&31](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;cM[c[(c[j>>2]|0)+28>>2]&31](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=1394;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=1391;break}}if((m|0)==1394){return}else if((m|0)==1391){return}}function ml(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;mK(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;cJ[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}cv[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;if((j|0)==1){do{if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}if((c[m>>2]|0)==1){break}else{o=0}i=f;return o|0}}while(0);o=c[e>>2]|0;i=f;return o|0}else if((j|0)==0){if((c[n>>2]|0)!=1){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}o=(c[m>>2]|0)==1?c[b>>2]|0:0;i=f;return o|0}else{o=0;i=f;return o|0}return 0}function mm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function mn(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function mo(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L1647:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L1649:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;cJ[c[(c[v>>2]|0)+20>>2]&63](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L1649}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=1482;break L1647}if((c[o>>2]&2|0)==0){B=1482;break L1647}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=1481}else{D=x;B=1478}}else{D=0;B=1478}}while(0);do{if((B|0)==1478){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)!=1){C=D;B=1481;break}if((c[d+24>>2]|0)!=2){C=D;B=1481;break}a[d+54|0]=1;if(D){B=1482}else{B=1483}}}while(0);if((B|0)==1481){if(C){B=1482}else{B=1483}}if((B|0)==1482){c[i>>2]=3;return}else if((B|0)==1483){c[i>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;cv[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=1524;break}if((c[b>>2]|0)==1){B=1525;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;cv[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=1513;break}}if((B|0)==1513){return}else if((B|0)==1524){return}else if((B|0)==1525){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=1521;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=1516;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;cv[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=1523;break}}if((B|0)==1516){return}else if((B|0)==1521){return}else if((B|0)==1523){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=1515;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;cv[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=1520;break}}if((B|0)==1515){return}else if((B|0)==1520){return}}function mp(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;cv[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;cJ[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=1538}else{if((a[j]&1)==0){m=1;n=1538}}L1749:do{if((n|0)==1538){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=1541;break}a[d+54|0]=1;if(m){break L1749}}else{n=1541}}while(0);if((n|0)==1541){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function mq(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;cJ[c[(c[p>>2]|0)+20>>2]&63](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L1771:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;do{if((a[p]&1)!=0){break L1771}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L1771}}else{if((c[o>>2]|0)==1){break L1771}if((c[q>>2]&2|0)==0){break L1771}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;cJ[c[(c[u>>2]|0)+20>>2]&63](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;}while(s>>>0<n>>>0)}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function mr(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;cJ[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}
function ms(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[3886]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=15584+(h<<2)|0;j=15584+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[3886]=e&~(1<<g)}else{if(l>>>0<(c[3890]|0)>>>0){b9();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{b9();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[3888]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=15584+(p<<2)|0;m=15584+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[3886]=e&~(1<<r)}else{if(l>>>0<(c[3890]|0)>>>0){b9();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{b9();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[3888]|0;if((l|0)!=0){q=c[3891]|0;d=l>>>3;l=d<<1;f=15584+(l<<2)|0;k=c[3886]|0;h=1<<d;do{if((k&h|0)==0){c[3886]=k|h;s=f;t=15584+(l+2<<2)|0}else{d=15584+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[3890]|0)>>>0){s=g;t=d;break}b9();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[3888]=m;c[3891]=e;n=i;return n|0}l=c[3887]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[15848+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[3890]|0;if(r>>>0<i>>>0){b9();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){b9();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){b9();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){b9();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){b9();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{b9();return 0}}}while(0);L1913:do{if((e|0)!=0){f=d+28|0;i=15848+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[3887]=c[3887]&~(1<<c[f>>2]);break L1913}else{if(e>>>0<(c[3890]|0)>>>0){b9();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L1913}}}while(0);if(v>>>0<(c[3890]|0)>>>0){b9();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[3888]|0;if((f|0)!=0){e=c[3891]|0;i=f>>>3;f=i<<1;q=15584+(f<<2)|0;k=c[3886]|0;g=1<<i;do{if((k&g|0)==0){c[3886]=k|g;y=q;z=15584+(f+2<<2)|0}else{i=15584+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[3890]|0)>>>0){y=l;z=i;break}b9();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[3888]=p;c[3891]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[3887]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[15848+(A<<2)>>2]|0;L1961:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L1961}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[15848+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[3888]|0)-g|0)>>>0){o=g;break}q=K;m=c[3890]|0;if(q>>>0<m>>>0){b9();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){b9();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){b9();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){b9();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){b9();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{b9();return 0}}}while(0);L2011:do{if((e|0)!=0){i=K+28|0;m=15848+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[3887]=c[3887]&~(1<<c[i>>2]);break L2011}else{if(e>>>0<(c[3890]|0)>>>0){b9();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L2011}}}while(0);if(L>>>0<(c[3890]|0)>>>0){b9();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=15584+(e<<2)|0;r=c[3886]|0;j=1<<i;do{if((r&j|0)==0){c[3886]=r|j;O=m;P=15584+(e+2<<2)|0}else{i=15584+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[3890]|0)>>>0){O=d;P=i;break}b9();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=15848+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[3887]|0;l=1<<Q;if((m&l|0)==0){c[3887]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=1758;break}else{l=l<<1;m=j}}if((T|0)==1758){if(S>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[3890]|0;if(m>>>0<i>>>0){b9();return 0}if(j>>>0<i>>>0){b9();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[3888]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[3891]|0;if(S>>>0>15){R=J;c[3891]=R+o;c[3888]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[3888]=0;c[3891]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[3889]|0;if(o>>>0<J>>>0){S=J-o|0;c[3889]=S;J=c[3892]|0;K=J;c[3892]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[3868]|0)==0){J=b7(8)|0;if((J-1&J|0)==0){c[3870]=J;c[3869]=J;c[3871]=-1;c[3872]=2097152;c[3873]=0;c[3997]=0;c[3868]=(cu(0)|0)&-16^1431655768;break}else{b9();return 0}}}while(0);J=o+48|0;S=c[3870]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[3996]|0;do{if((O|0)!=0){P=c[3994]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L2103:do{if((c[3997]&4|0)==0){O=c[3892]|0;L2105:do{if((O|0)==0){T=1788}else{L=O;P=15992;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=1788;break L2105}else{P=M}}if((P|0)==0){T=1788;break}L=R-(c[3889]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bY(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=1797}}while(0);do{if((T|0)==1788){O=bY(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[3869]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[3994]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[3996]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bY($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=1797}}while(0);L2125:do{if((T|0)==1797){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=1808;break L2103}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[3870]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bY(O|0)|0)==-1){bY(m|0)|0;W=Y;break L2125}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=1808;break L2103}}}while(0);c[3997]=c[3997]|4;ad=W;T=1805}else{ad=0;T=1805}}while(0);do{if((T|0)==1805){if(S>>>0>=2147483647){break}W=bY(S|0)|0;Z=bY(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=1808}}}while(0);do{if((T|0)==1808){ad=(c[3994]|0)+aa|0;c[3994]=ad;if(ad>>>0>(c[3995]|0)>>>0){c[3995]=ad}ad=c[3892]|0;L2145:do{if((ad|0)==0){S=c[3890]|0;if((S|0)==0|ab>>>0<S>>>0){c[3890]=ab}c[3998]=ab;c[3999]=aa;c[4001]=0;c[3895]=c[3868];c[3894]=-1;S=0;do{Y=S<<1;ac=15584+(Y<<2)|0;c[15584+(Y+3<<2)>>2]=ac;c[15584+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[3892]=ab+ae;c[3889]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[3893]=c[3872]}else{S=15992;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=1820;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==1820){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[3892]|0;Y=(c[3889]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[3892]=Z+ai;c[3889]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[3893]=c[3872];break L2145}}while(0);if(ab>>>0<(c[3890]|0)>>>0){c[3890]=ab}S=ab+aa|0;Y=15992;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1830;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1830){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[3892]|0)){J=(c[3889]|0)+K|0;c[3889]=J;c[3892]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[3891]|0)){J=(c[3888]|0)+K|0;c[3888]=J;c[3891]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L2190:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=15584+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[3890]|0)>>>0){b9();return 0}if((c[U+12>>2]|0)==(Z|0)){break}b9();return 0}}while(0);if((Q|0)==(U|0)){c[3886]=c[3886]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[3890]|0)>>>0){b9();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}b9();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[3890]|0)>>>0){b9();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){b9();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{b9();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=15848+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[3887]=c[3887]&~(1<<c[P>>2]);break L2190}else{if(m>>>0<(c[3890]|0)>>>0){b9();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L2190}}}while(0);if(an>>>0<(c[3890]|0)>>>0){b9();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=15584+(V<<2)|0;P=c[3886]|0;m=1<<J;do{if((P&m|0)==0){c[3886]=P|m;as=X;at=15584+(V+2<<2)|0}else{J=15584+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[3890]|0)>>>0){as=U;at=J;break}b9();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=15848+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[3887]|0;Q=1<<au;if((X&Q|0)==0){c[3887]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=1903;break}else{Q=Q<<1;X=m}}if((T|0)==1903){if(aw>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[3890]|0;if(X>>>0<$>>>0){b9();return 0}if(m>>>0<$>>>0){b9();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=15992;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[3892]=ab+aB;c[3889]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[3893]=c[3872];c[ac+4>>2]=27;c[W>>2]=c[3998];c[W+4>>2]=c[15996>>2];c[W+8>>2]=c[16e3>>2];c[W+12>>2]=c[16004>>2];c[3998]=ab;c[3999]=aa;c[4001]=0;c[4e3]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=15584+(K<<2)|0;S=c[3886]|0;m=1<<W;do{if((S&m|0)==0){c[3886]=S|m;aC=Z;aD=15584+(K+2<<2)|0}else{W=15584+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[3890]|0)>>>0){aC=Q;aD=W;break}b9();return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=15848+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[3887]|0;Q=1<<aE;if((Z&Q|0)==0){c[3887]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=1938;break}else{Q=Q<<1;Z=m}}if((T|0)==1938){if(aG>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[3890]|0;if(Z>>>0<m>>>0){b9();return 0}if(_>>>0<m>>>0){b9();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[3889]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[3889]=_;ad=c[3892]|0;Q=ad;c[3892]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(a7()|0)>>2]=12;n=0;return n|0}function mt(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[3890]|0;if(b>>>0<e>>>0){b9()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){b9()}h=f&-8;i=a+(h-8)|0;j=i;L2362:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){b9()}if((n|0)==(c[3891]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[3888]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=15584+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){b9()}if((c[k+12>>2]|0)==(n|0)){break}b9()}}while(0);if((s|0)==(k|0)){c[3886]=c[3886]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){b9()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}b9()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){b9()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){b9()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){b9()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{b9()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=15848+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[3887]=c[3887]&~(1<<c[v>>2]);q=n;r=o;break L2362}else{if(p>>>0<(c[3890]|0)>>>0){b9()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L2362}}}while(0);if(A>>>0<(c[3890]|0)>>>0){b9()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[3890]|0)>>>0){b9()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[3890]|0)>>>0){b9()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){b9()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){b9()}do{if((e&2|0)==0){if((j|0)==(c[3892]|0)){B=(c[3889]|0)+r|0;c[3889]=B;c[3892]=q;c[q+4>>2]=B|1;if((q|0)==(c[3891]|0)){c[3891]=0;c[3888]=0}if(B>>>0<=(c[3893]|0)>>>0){return}mv(0)|0;return}if((j|0)==(c[3891]|0)){B=(c[3888]|0)+r|0;c[3888]=B;c[3891]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L2468:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=15584+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[3890]|0)>>>0){b9()}if((c[u+12>>2]|0)==(j|0)){break}b9()}}while(0);if((g|0)==(u|0)){c[3886]=c[3886]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[3890]|0)>>>0){b9()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}b9()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[3890]|0)>>>0){b9()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[3890]|0)>>>0){b9()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){b9()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{b9()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=15848+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[3887]=c[3887]&~(1<<c[t>>2]);break L2468}else{if(f>>>0<(c[3890]|0)>>>0){b9()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L2468}}}while(0);if(E>>>0<(c[3890]|0)>>>0){b9()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[3890]|0)>>>0){b9()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[3890]|0)>>>0){b9()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[3891]|0)){H=B;break}c[3888]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=15584+(d<<2)|0;A=c[3886]|0;E=1<<r;do{if((A&E|0)==0){c[3886]=A|E;I=e;J=15584+(d+2<<2)|0}else{r=15584+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[3890]|0)>>>0){I=h;J=r;break}b9()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=15848+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[3887]|0;d=1<<K;do{if((r&d|0)==0){c[3887]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=2117;break}else{A=A<<1;J=E}}if((N|0)==2117){if(M>>>0<(c[3890]|0)>>>0){b9()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[3890]|0;if(J>>>0<E>>>0){b9()}if(B>>>0<E>>>0){b9()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[3894]|0)-1|0;c[3894]=q;if((q|0)==0){O=16e3}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[3894]=-1;return}function mu(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=ms(b)|0;return d|0}if(b>>>0>4294967231){c[(a7()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=mw(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=ms(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;mJ(f|0,a|0,e)|0;mt(a);d=f;return d|0}function mv(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[3868]|0)==0){b=b7(8)|0;if((b-1&b|0)==0){c[3870]=b;c[3869]=b;c[3871]=-1;c[3872]=2097152;c[3873]=0;c[3997]=0;c[3868]=(cu(0)|0)&-16^1431655768;break}else{b9();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[3892]|0;if((b|0)==0){d=0;return d|0}e=c[3889]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[3870]|0;g=ah((((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0,f)|0;h=b;i=15992;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bY(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bY(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bY(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[3994]=(c[3994]|0)-j;h=c[3892]|0;m=(c[3889]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[3892]=j+o;c[3889]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[3893]=c[3872];d=(i|0)!=(l|0)|0;return d|0}}while(0);if((c[3889]|0)>>>0<=(c[3893]|0)>>>0){d=0;return d|0}c[3893]=-1;d=0;return d|0}function mw(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[3890]|0;if(g>>>0<j>>>0){b9();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){b9();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){b9();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[3870]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;mx(g+b|0,k);n=a;return n|0}if((i|0)==(c[3892]|0)){k=(c[3889]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[3892]=g+b;c[3889]=l;n=a;return n|0}if((i|0)==(c[3891]|0)){l=(c[3888]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[3888]=q;c[3891]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L2688:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=15584+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){b9();return 0}if((c[l+12>>2]|0)==(i|0)){break}b9();return 0}}while(0);if((k|0)==(l|0)){c[3886]=c[3886]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){b9();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}b9();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){b9();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){b9();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){b9();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{b9();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=15848+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[3887]=c[3887]&~(1<<c[t>>2]);break L2688}else{if(s>>>0<(c[3890]|0)>>>0){b9();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L2688}}}while(0);if(y>>>0<(c[3890]|0)>>>0){b9();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[3890]|0)>>>0){b9();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;mx(g+b|0,q);n=a;return n|0}return 0}function mx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L2764:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[3890]|0;if(i>>>0<l>>>0){b9()}if((j|0)==(c[3891]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[3888]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=15584+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){b9()}if((c[p+12>>2]|0)==(j|0)){break}b9()}}while(0);if((q|0)==(p|0)){c[3886]=c[3886]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){b9()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}b9()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){b9()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){b9()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){b9()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{b9()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=15848+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[3887]=c[3887]&~(1<<c[t>>2]);n=j;o=k;break L2764}else{if(m>>>0<(c[3890]|0)>>>0){b9()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L2764}}}while(0);if(y>>>0<(c[3890]|0)>>>0){b9()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[3890]|0)>>>0){b9()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[3890]|0)>>>0){b9()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[3890]|0;if(e>>>0<a>>>0){b9()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[3892]|0)){A=(c[3889]|0)+o|0;c[3889]=A;c[3892]=n;c[n+4>>2]=A|1;if((n|0)!=(c[3891]|0)){return}c[3891]=0;c[3888]=0;return}if((f|0)==(c[3891]|0)){A=(c[3888]|0)+o|0;c[3888]=A;c[3891]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L2863:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=15584+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){b9()}if((c[g+12>>2]|0)==(f|0)){break}b9()}}while(0);if((t|0)==(g|0)){c[3886]=c[3886]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){b9()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}b9()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){b9()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){b9()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){b9()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{b9()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=15848+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[3887]=c[3887]&~(1<<c[l>>2]);break L2863}else{if(m>>>0<(c[3890]|0)>>>0){b9()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L2863}}}while(0);if(C>>>0<(c[3890]|0)>>>0){b9()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[3890]|0)>>>0){b9()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[3890]|0)>>>0){b9()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[3891]|0)){F=A;break}c[3888]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=15584+(z<<2)|0;C=c[3886]|0;b=1<<o;do{if((C&b|0)==0){c[3886]=C|b;G=y;H=15584+(z+2<<2)|0}else{o=15584+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[3890]|0)>>>0){G=d;H=o;break}b9()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=15848+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[3887]|0;z=1<<I;if((o&z|0)==0){c[3887]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=2423;break}else{I=I<<1;J=G}}if((L|0)==2423){if(K>>>0<(c[3890]|0)>>>0){b9()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[3890]|0;if(J>>>0<I>>>0){b9()}if(L>>>0<I>>>0){b9()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function my(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=ms(b)|0;if((d|0)!=0){e=2467;break}a=(J=c[4856]|0,c[4856]=J+0,J);if((a|0)==0){break}cF[a&3]()}if((e|0)==2467){return d|0}d=ck(4)|0;c[d>>2]=6392;bE(d|0,13312,40);return 0}function mz(a){a=a|0;return my(a)|0}function mA(a){a=a|0;return}function mB(a){a=a|0;return 2872|0}function mC(a){a=a|0;if((a|0)==0){return}mt(a);return}function mD(a){a=a|0;mC(a);return}function mE(a){a=a|0;mC(a);return}function mF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((aS(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==43){i=f;j=0}else if((g<<24>>24|0)==45){i=f;j=1}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=2497}else{if((e|0)>0){v=0.0;w=e;x=l;y=2497}else{z=0.0;A=0.0}}if((y|0)==2497){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10|0)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(a7()|0)>>2]=34;N=1.0;O=80;P=511;y=2514}else{if((m|0)==0){Q=1.0}else{N=1.0;O=80;P=m;y=2514}}if((y|0)==2514){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=2514}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function mG(a,b,c){a=a|0;b=b|0;c=c|0;return+(+mF(a,b))}function mH(){var a=0;a=ck(4)|0;c[a>>2]=6392;bE(a|0,13312,40)}function mI(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function mJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function mK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function mL(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function mM(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function mN(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{mJ(b,c,d)|0}}function mO(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(L=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function mP(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(L=e,a-c>>>0|0)|0}function mQ(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){L=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}L=a<<c-32;return 0}function mR(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){L=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}L=0;return b>>>c-32|0}function mS(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){L=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}L=(b|0)<0?-1:0;return b>>c-32|0}function mT(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function mU(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function mV(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ah(d,c)|0;f=a>>>16;a=(e>>>16)+(ah(d,f)|0)|0;d=b>>>16;b=ah(d,c)|0;return(L=(a>>>16)+(ah(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function mW(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=mP(e^a,f^b,e,f)|0;b=L;a=g^e;e=h^f;f=mP((m$(i,b,mP(g^c,h^d,g,h)|0,L,0)|0)^a,L^e,a,e)|0;return(L=L,f)|0}function mX(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=mP(h^a,j^b,h,j)|0;b=L;a=mP(k^d,l^e,k,l)|0;m$(m,b,a,L,g)|0;a=mP(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=L;i=f;return(L=j,a)|0}function mY(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=mV(e,a)|0;f=L;return(L=(ah(b,a)|0)+(ah(d,e)|0)+f|f&0,c|0|0)|0}function mZ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=m$(a,b,c,d,0)|0;return(L=L,e)|0}function m_(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;m$(a,b,d,e,g)|0;i=f;return(L=c[g+4>>2]|0,c[g>>2]|0)|0}function m$(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(L=n,o)|0}else{if(!m){n=0;o=0;return(L=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(L=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(L=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(L=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((mU(l|0)|0)>>>0);return(L=n,o)|0}p=(mT(l|0)|0)-(mT(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(L=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(L=n,o)|0}else{if(!m){r=(mT(l|0)|0)-(mT(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(L=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(L=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(mT(j|0)|0)+33-(mT(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(L=n,o)|0}else{p=mU(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(L=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=mO(g,d,-1,-1)|0;k=L;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;mP(e,k,j,a)|0;b=L;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;K=mP(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=L;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=K;t=b;s=J}}B=H;C=I;D=M;E=K;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(J|0)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(L=n,o)|0}function m0(){cl()}function m1(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;cv[a&7](b|0,c|0,d|0,e|0,f|0)}function m2(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;cw[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function m3(a,b){a=a|0;b=b|0;cx[a&511](b|0)}function m4(a,b,c){a=a|0;b=b|0;c=c|0;cy[a&127](b|0,c|0)}function m5(a,b,c){a=a|0;b=b|0;c=c|0;return cz[a&63](b|0,c|0)|0}function m6(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cA[a&63](b|0,c|0,d|0)|0}function m7(a,b){a=a|0;b=b|0;return cB[a&255](b|0)|0}function m8(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;cC[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function m9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;cD[a&7](b|0,c|0,d|0)}function na(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;cE[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function nb(a){a=a|0;cF[a&3]()}function nc(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return cG[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function nd(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;cH[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function ne(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;cI[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function nf(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;cJ[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function ng(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return cK[a&15](b|0,c|0,d|0,e|0)|0}function nh(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return cL[a&31](b|0,c|0,d|0,e|0,f|0)|0}function ni(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;cM[a&31](b|0,c|0,d|0,e|0)}function nj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(0)}function nk(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ai(1)}function nl(a){a=a|0;ai(2)}function nm(a,b){a=a|0;b=b|0;ai(3)}function nn(a,b){a=a|0;b=b|0;ai(4);return 0}function no(a,b,c){a=a|0;b=b|0;c=c|0;ai(5);return 0}function np(a){a=a|0;ai(6);return 0}function nq(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ai(7)}function nr(a,b,c){a=a|0;b=b|0;c=c|0;ai(8)}function ns(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ai(9)}function nt(){ai(10)}function nu(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ai(11);return 0}function nv(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ai(12)}function nw(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ai(13)}function nx(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(14)}function ny(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(15);return 0}function nz(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(16);return 0}function nA(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(17)}
// EMSCRIPTEN_END_FUNCS
var cv=[nj,nj,mp,nj,mm,nj,mo,nj];var cw=[nk,nk,io,nk,ix,nk,iA,nk,j_,nk,h9,nk,h7,nk,jT,nk,ii,nk,im,nk,iB,nk,hV,nk,hQ,nk,il,nk,g9,nk,hF,nk,iy,nk,hT,nk,hH,nk,hC,nk,hD,nk,hw,nk,hG,nk,hA,nk,hy,nk,hM,nk,hL,nk,hJ,nk,iC,nk,hj,nk,ij,nk,hn,nk,hf,nk,hh,nk,hl,nk,hc,nk,ht,nk,hs,nk,hp,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk,nk];var cx=[nl,nl,j1,nl,g3,nl,eY,nl,h1,nl,e1,nl,dB,nl,f_,nl,ke,nl,eM,nl,er,nl,iM,nl,hN,nl,eX,nl,e0,nl,hu,nl,dH,nl,e2,nl,gZ,nl,dy,nl,mA,nl,eY,nl,kq,nl,kt,nl,iw,nl,hv,nl,l7,nl,gJ,nl,jY,nl,el,nl,dk,nl,kr,nl,dv,nl,gk,nl,g4,nl,jj,nl,kl,nl,dt,nl,lp,nl,kv,nl,l1,nl,d1,nl,jq,nl,lo,nl,gT,nl,dX,nl,e0,nl,g1,nl,i8,nl,lr,nl,d0,nl,ks,nl,mt,nl,jR,nl,ln,nl,me,nl,go,nl,eq,nl,g0,nl,eY,nl,lM,nl,hO,nl,eD,nl,gP,nl,jk,nl,gj,nl,gu,nl,iK,nl,iv,nl,dW,nl,gW,nl,jd,nl,mE,nl,fZ,nl,lO,nl,lP,nl,gK,nl,f5,nl,mg,nl,gV,nl,kT,nl,kR,nl,l$,nl,gl,nl,gU,nl,jv,nl,gR,nl,eB,nl,jp,nl,gL,nl,lS,nl,l2,nl,k7,nl,ex,nl,dV,nl,kk,nl,dA,nl,dh,nl,ko,nl,iL,nl,jC,nl,mc,nl,lm,nl,i_,nl,jS,nl,d5,nl,i7,nl,h0,nl,d$,nl,gY,nl,ey,nl,g_,nl,gq,nl,e8,nl,gM,nl,dZ,nl,jJ,nl,jB,nl,lq,nl,lR,nl,fu,nl,e3,nl,l$,nl,mh,nl,gt,nl,dl,nl,dj,nl,du,nl,e9,nl,gi,nl,gI,nl,dU,nl,jX,nl,dT,nl,dw,nl,gf,nl,gs,nl,eN,nl,kw,nl,gX,nl,gO,nl,ig,nl,je,nl,j6,nl,jN,nl,gp,nl,f4,nl,gr,nl,gQ,nl,lN,nl,ih,nl,mf,nl,d_,nl,j2,nl,ek,nl,md,nl,iN,nl,gN,nl,jw,nl,ds,nl,fb,nl,ku,nl,e$,nl,gn,nl,lT,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl,nl];var cy=[nm,nm,lw,nm,jt,nm,es,nm,lt,nm,i4,nm,ls,nm,i2,nm,em,nm,j0,nm,jm,nm,jc,nm,i5,nm,jo,nm,jb,nm,i9,nm,ju,nm,kn,nm,ez,nm,jr,nm,i6,nm,lv,nm,d2,nm,jg,nm,e_,nm,jf,nm,lx,nm,i3,nm,ji,nm,lu,nm,i1,nm,fD,nm,j4,nm,eO,nm,jl,nm,i0,nm,i$,nm,ja,nm,fK,nm,jn,nm,jh,nm,js,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm];var cz=[nn,nn,kG,nn,eR,nn,kb,nn,j9,nn,ev,nn,eK,nn,kC,nn,dr,nn,d9,nn,kI,nn,gg,nn,kE,nn,dp,nn,fJ,nn,ec,nn,fI,nn,eo,nn,fP,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn,nn];var cA=[no,no,ga,no,gF,no,kF,no,mi,no,kc,no,gH,no,f3,no,f1,no,ky,no,kH,no,fL,no,j3,no,kd,no,d3,no,kD,no,l8,no,eJ,no,e4,no,f8,no,kJ,no,jZ,no,fE,no,no,no,no,no,no,no,no,no,no,no,no,no,no,no,no,no,no,no];var cB=[np,np,lL,np,iV,np,fH,np,lB,np,f2,np,lJ,np,iR,np,kX,np,k1,np,ie,np,lz,np,eQ,np,f9,np,fO,np,lF,np,lD,np,la,np,l0,np,dn,np,eG,np,lj,np,lg,np,lE,np,k0,np,d8,np,lh,np,fF,np,iZ,np,lG,np,eP,np,en,np,iS,np,kP,np,lK,np,lc,np,iX,np,ly,np,et,np,lb,np,kZ,np,gD,np,iQ,np,eu,np,li,np,fG,np,fM,np,eA,np,eb,np,iT,np,kO,np,kN,np,mB,np,fN,np,iO,np,lA,np,kM,np,iP,np,eF,np,iU,np,iW,np,lC,np,iY,np,iu,np,lI,np,lH,np,k$,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np,np];var cC=[nq,nq,ic,nq,ia,nq,h_,nq,hX,nq,nq,nq,nq,nq,nq,nq];var cD=[nr,nr,eI,nr,gS,nr,nr,nr];var cE=[ns,ns,iJ,ns,iI,ns,jy,ns,jG,ns,jE,ns,jK,ns,ns,ns];var cF=[nt,nt,m0,nt];var cG=[nu,nu,ka,nu,kV,nu,k5,nu,kK,nu,k8,nu,lk,nu,kU,nu,kS,nu,nu,nu,nu,nu,nu,nu,nu,nu,nu,nu,nu,nu,nu,nu];var cH=[nv,nv,iE,nv,iq,nv,nv,nv];var cI=[nw,nw,jU,nw,jO,nw,nw,nw];var cJ=[nx,nx,mq,nx,h8,nx,h2,nx,mr,nx,id,nx,j$,nx,fS,nx,h3,nx,d7,nx,hR,nx,hU,nx,hP,nx,dm,nx,h4,nx,mn,nx,fQ,nx,j5,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx,nx];var cK=[ny,ny,kz,ny,kA,ny,kh,ny,kf,ny,kB,ny,ny,ny,ny,ny];var cL=[nz,nz,k_,nz,kY,nz,ll,nz,kg,nz,k6,nz,kL,nz,gG,nz,ki,nz,kQ,nz,kW,nz,gE,nz,k9,nz,nz,nz,nz,nz,nz,nz];var cM=[nA,nA,dq,nA,mj,nA,mk,nA,fR,nA,l9,nA,fT,nA,d4,nA,g2,nA,g$,nA,nA,nA,nA,nA,nA,nA,nA,nA,nA,nA,nA,nA];return{_memcmp:mL,_strlen:mI,_free:mt,_main:eh,_realloc:mu,_memmove:mN,__GLOBAL__I_a:eT,_memset:mK,_malloc:ms,_memcpy:mJ,_strcpy:mM,runPostSets:c1,stackAlloc:cN,stackSave:cO,stackRestore:cP,setThrew:cQ,setTempRet0:cT,setTempRet1:cU,setTempRet2:cV,setTempRet3:cW,setTempRet4:cX,setTempRet5:cY,setTempRet6:cZ,setTempRet7:c_,setTempRet8:c$,setTempRet9:c0,dynCall_viiiii:m1,dynCall_viiiiiii:m2,dynCall_vi:m3,dynCall_vii:m4,dynCall_iii:m5,dynCall_iiii:m6,dynCall_ii:m7,dynCall_viiiiif:m8,dynCall_viii:m9,dynCall_viiiiiiii:na,dynCall_v:nb,dynCall_iiiiiiiii:nc,dynCall_viiiiiiiii:nd,dynCall_viiiiiif:ne,dynCall_viiiiii:nf,dynCall_iiiii:ng,dynCall_iiiiii:nh,dynCall_viiii:ni}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiii": invoke_iiii, "invoke_ii": invoke_ii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "__isFloat": __isFloat, "_strtoull": _strtoull, "_fflush": _fflush, "_fputc": _fputc, "_fwrite": _fwrite, "_send": _send, "_fputs": _fputs, "_isspace": _isspace, "_clReleaseCommandQueue": _clReleaseCommandQueue, "_read": _read, "_clGetContextInfo": _clGetContextInfo, "_fsync": _fsync, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "___resumeException": ___resumeException, "_strcmp": _strcmp, "_memchr": _memchr, "_strncmp": _strncmp, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "___errno_location": ___errno_location, "_clReleaseContext": _clReleaseContext, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_fgets": _fgets, "_close": _close, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "_llvm_lifetime_start": _llvm_lifetime_start, "___setErrNo": ___setErrNo, "_clCreateContextFromType": _clCreateContextFromType, "_isxdigit": _isxdigit, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_clCreateProgramWithSource": _clCreateProgramWithSource, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "__isLeapYear": __isLeapYear, "_asprintf": _asprintf, "_ferror": _ferror, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___locale_mb_cur_max": ___locale_mb_cur_max, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "_clEnqueueWriteBuffer": _clEnqueueWriteBuffer, "___cxa_call_unexpected": ___cxa_call_unexpected, "__exit": __exit, "_strftime": _strftime, "_llvm_va_end": _llvm_va_end, "___cxa_throw": ___cxa_throw, "_clReleaseKernel": _clReleaseKernel, "_llvm_eh_exception": _llvm_eh_exception, "_printf": _printf, "_pread": _pread, "_fopen": _fopen, "_open": _open, "__arraySum": __arraySum, "_puts": _puts, "_clGetDeviceInfo": _clGetDeviceInfo, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clReleaseProgram": _clReleaseProgram, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_clSetKernelArg": _clSetKernelArg, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "__ZSt9terminatev": __ZSt9terminatev, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "_clReleaseMemObject": _clReleaseMemObject, "_strerror": _strerror, "_clCreateBuffer": _clCreateBuffer, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_vsprintf": _vsprintf, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_fprintf": _fprintf, "_isdigit": _isdigit, "_strtoll": _strtoll, "_clCreateCommandQueue": _clCreateCommandQueue, "_clBuildProgram": _clBuildProgram, "__reallyNegative": __reallyNegative, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "_fseek": _fseek, "__addDays": __addDays, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_pure_virtual": ___cxa_pure_virtual, "_clCreateKernel": _clCreateKernel, "_vasprintf": _vasprintf, "_clGetProgramInfo": _clGetProgramInfo, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_llvm_eh_typeid_for": _llvm_eh_typeid_for, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "_stdout": _stdout, "__ZTIi": __ZTIi, "___fsmu8": ___fsmu8, "___dso_handle": ___dso_handle }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
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
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiiif = Module["dynCall_viiiiif"] = asm["dynCall_viiiiif"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiif = Module["dynCall_viiiiiif"] = asm["dynCall_viiiiiif"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
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
