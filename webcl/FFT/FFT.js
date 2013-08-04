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
STATICTOP = STATIC_BASE + 27840;
var _stdout;
var _stdin;
var _stderr;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } },{ func: function() { __GLOBAL__I_a330() } });
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
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,240,91,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([99,108,67,114,101,97,116,101,66,117,102,102,101,114,32,102,97,105,108,101,100,0,0,0,99,108,70,70,84,95,67,114,101,97,116,101,80,108,97,110,32,102,97,105,108,101,100,0,79,117,116,45,111,102,45,82,101,115,111,117,114,99,101,115,0,0,0,0,0,0,0,0,84,104,105,115,32,116,101,115,116,32,99,97,110,110,111,116,32,114,117,110,32,98,101,99,97,117,115,101,32,109,101,109,111,114,121,32,114,101,113,117,105,114,101,109,101,110,116,115,32,99,97,110,111,116,32,98,101,32,109,101,116,32,98,121,32,116,104,101,32,97,118,97,105,108,97,98,108,101,32,100,101,118,105,99,101,0,0,0,67,97,110,110,111,116,32,111,112,101,110,32,116,104,101,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,103,108,111,98,97,108,32,109,101,109,32,115,105,122,101,0,0,0,99,108,67,114,101,97,116,101,81,117,101,117,101,40,41,32,102,97,105,108,101,100,46,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,32,102,97,105,108,101,100,0,0,99,108,71,101,116,67,111,109,112,117,116,101,68,101,118,105,99,101,32,102,97,105,108,101,100,0,0,0,0,0,0,0,84,101,115,116,32,111,110,108,121,32,115,117,112,112,111,114,116,101,100,32,111,110,32,68,69,86,73,67,69,95,84,89,80,69,95,71,80,85,0,0,99,108,69,110,113,117,101,117,101,82,101,97,100,66,117,102,102,101,114,32,102,97,105,108,101,100,0,0,0,0,0,0,99,108,70,70,84,95,69,120,101,99,117,116,101,0,0,0,79,117,116,45,111,102,45,82,101,115,111,117,99,101,115,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,74,117,108,0,0,0,0,0,32,32,32,32,111,102,102,115,101,116,32,61,32,109,97,100,50,52,40,32,111,102,102,115,101,116,44,32,0,0,0,0,74,117,110,0,0,0,0,0,44,32,106,106,41,59,10,0,65,112,114,0,0,0,0,0,32,32,32,32,111,102,102,115,101,116,32,61,32,109,97,100,50,52,40,32,103,114,111,117,112,73,100,44,32,0,0,0,77,97,114,0,0,0,0,0,32,32,32,32,108,77,101,109,83,116,111,114,101,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,32,106,106,44,32,0,0,0,0,0,0,70,101,98,0,0,0,0,0,32,32,32,32,111,102,102,115,101,116,32,61,32,32,109,97,100,50,52,40,103,114,111,117,112,73,100,44,32,0,0,0,74,97,110,0,0,0,0,0,32,32,32,32,106,106,32,61,32,48,59,10,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,32,32,32,32,105,105,32,61,32,108,73,100,59,10,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,111,117,116,95,105,109,97,103,32,43,61,32,111,102,102,115,101,116,59,10,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,79,99,116,111,98,101,114,0,32,32,32,32,32,32,32,32,111,117,116,95,114,101,97,108,32,43,61,32,111,102,102,115,101,116,59,10,0,0,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,105,110,95,105,109,97,103,32,43,61,32,111,102,102,115,101,116,59,10,0,0,0,0,0,110,117,109,87,111,114,107,73,116,101,109,115,80,101,114,87,71,32,60,61,32,112,108,97,110,45,62,109,97,120,95,119,111,114,107,95,105,116,101,109,95,112,101,114,95,119,111,114,107,103,114,111,117,112,0,0,65,117,103,117,115,116,0,0,32,32,32,32,32,32,32,32,105,110,95,114,101,97,108,32,43,61,32,111,102,102,115,101,116,59,10,0,0,0,0,0,74,117,108,121,0,0,0,0,32,32,32,32,32,32,32,32,111,117,116,32,43,61,32,111,102,102,115,101,116,59,10,0,74,117,110,101,0,0,0,0,32,32,32,32,32,32,32,32,105,110,32,43,61,32,111,102,102,115,101,116,59,10,0,0,77,97,121,0,0,0,0,0,44,32,106,106,41,44,32,0,65,112,114,105,108,0,0,0,32,32,32,32,32,32,32,32,111,102,102,115,101,116,32,61,32,109,97,100,50,52,40,32,109,97,100,50,52,40,103,114,111,117,112,73,100,44,32,0,77,97,114,99,104,0,0,0,32,32,32,32,32,32,32,32,115,32,61,32,83,32,38,32,0,0,0,0,0,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,44,32,100,105,114,41,59,10,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,40,97,43,0,0,0,0,0,104,105,103,104,101,114,32,105,115,32,98,101,116,116,101,114,0,0,0,0,0,0,0,0,37,115,10,0,0,0,0,0,32,32,32,32,102,102,116,75,101,114,110,101,108,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,93,44,32,119,41,59,10,0,102,102,116,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,97,91,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,32,32,32,32,119,32,61,32,40,102,108,111,97,116,50,41,40,110,97,116,105,118,101,95,99,111,115,40,97,110,103,41,44,32,110,97,116,105,118,101,95,115,105,110,40,97,110,103,41,41,59,10,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,32,42,32,97,110,103,102,59,10,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,46,48,102,32,41,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,46,48,102,32,47,32,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,32,32,32,32,97,110,103,32,61,32,100,105,114,32,42,32,40,32,50,46,48,102,32,42,32,77,95,80,73,32,42,32,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,32,43,32,105,105,41,59,10,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,32,32,32,32,97,110,103,102,32,61,32,40,102,108,111,97,116,41,32,40,0,0,0,0,71,70,108,111,112,115,47,115,0,0,0,0,0,0,0,0,70,70,84,32,112,114,111,103,114,97,109,32,98,117,105,108,100,32,108,111,103,32,111,110,32,100,101,118,105,99,101,32,37,115,10,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,32,43,32,105,105,41,32,62,62,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,32,32,32,32,97,110,103,102,32,61,32,40,102,108,111,97,116,41,32,40,40,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,32,32,32,32,97,110,103,102,32,61,32,40,102,108,111,97,116,41,32,105,105,59,10,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,97,110,103,102,32,61,32,40,102,108,111,97,116,41,32,40,105,105,32,62,62,32,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,44,32,105,105,41,59,10,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,83,116,111,114,101,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,106,106,44,32,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,83,116,111,114,101,32,61,32,115,77,101,109,32,43,32,105,105,59,10,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,76,111,97,100,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,106,44,32,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,44,32,105,41,59,10,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,105,32,61,32,109,97,100,50,52,40,106,106,44,32,0,0,0,0,0,0,80,101,114,102,111,114,109,97,110,99,101,32,78,117,109,98,101,114,32,37,115,32,40,105,110,32,37,115,44,32,37,115,41,58,32,37,103,10,0,0,45,99,108,45,109,97,100,45,101,110,97,98,108,101,0,0,32,32,32,32,105,32,61,32,105,105,32,38,32,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,32,32,32,32,105,32,61,32,48,59,10,0,0,0,0,0,116,109,112,76,101,110,32,61,61,32,110,32,38,38,32,34,112,114,111,100,117,99,116,32,111,102,32,114,97,100,105,99,101,115,32,99,104,111,111,115,101,110,32,100,111,101,115,110,116,32,109,97,116,99,104,32,116,104,101,32,108,101,110,103,116,104,32,111,102,32,115,105,103,110,97,108,92,110,34,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,32,32,32,32,106,32,61,32,105,105,32,62,62,32,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,106,32,61,32,105,105,59,10,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,41,59,10,0,0,0,0,0,44,32,105,105,32,38,32,0,80,77,0,0,0,0,0,0,44,32,0,0,0,0,0,0,65,77,0,0,0,0,0,0,32,32,32,32,105,32,61,32,109,97,100,50,52,40,105,105,32,62,62,32,0,0,0,0,32,32,32,32,105,32,61,32,105,105,32,62,62,32,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,41,32,62,62,32,0,0,0,71,70,108,111,112,115,32,97,99,104,105,101,118,101,100,32,102,111,114,32,110,32,61,32,40,37,100,44,32,37,100,44,32,37,100,41,44,32,98,97,116,99,104,115,105,122,101,32,61,32,37,100,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,106,32,61,32,40,105,105,32,38,32,0,0,32,32,32,32,106,32,61,32,105,105,32,38,32,0,0,0,114,97,100,105,120,65,114,114,97,121,91,105,93,32,38,38,32,33,40,32,40,114,97,100,105,120,65,114,114,97,121,91,105,93,32,45,32,49,41,32,38,32,114,97,100,105,120,65,114,114,97,121,91,105,93,32,41,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,83,116,111,114,101,91,0,0,32,32,32,32,98,97,114,114,105,101,114,40,67,76,75,95,76,79,67,65,76,95,77,69,77,95,70,69,78,67,69,41,59,10,0,0,0,0,0,0,32,61,32,108,77,101,109,76,111,97,100,91,0,0,0,0,105,110,45,112,108,97,99,101,0,0,0,0,0,0,0,0,93,46,0,0,0,0,0,0,111,117,116,45,111,102,45,112,108,97,99,101,0,0,0,0,32,32,32,32,32,32,32,32,111,117,116,95,105,109,97,103,91,0,0,0,0,0,0,0,45,116,101,115,116,116,121,112,101,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,111,117,116,95,114,101,97,108,91,0,0,0,0,0,0,0,45,110,117,109,105,116,101,114,0,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,111,117,116,91,0,0,0,0,105,110,116,101,114,108,101,97,118,101,100,0,0,0,0,0,32,32,32,32,106,106,32,43,61,0,0,0,0,0,0,0,95,95,107,101,114,110,101,108,32,118,111,105,100,32,92,10,99,108,70,70,84,95,49,68,84,119,105,115,116,83,112,108,105,116,40,95,95,103,108,111,98,97,108,32,102,108,111,97,116,32,42,105,110,95,114,101,97,108,44,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,32,42,105,110,95,105,109,97,103,32,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,115,116,97,114,116,82,111,119,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,110,117,109,67,111,108,115,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,78,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,110,117,109,82,111,119,115,84,111,80,114,111,99,101,115,115,44,32,105,110,116,32,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,102,108,111,97,116,50,32,97,44,32,119,59,32,92,10,32,32,32,32,102,108,111,97,116,32,97,110,103,59,32,92,10,32,32,32,32,117,110,115,105,103,110,101,100,32,105,110,116,32,106,59,32,92,10,9,117,110,115,105,103,110,101,100,32,105,110,116,32,105,32,61,32,103,101,116,95,103,108,111,98,97,108,95,105,100,40,48,41,59,32,92,10,9,117,110,115,105,103,110,101,100,32,105,110,116,32,115,116,97,114,116,73,110,100,101,120,32,61,32,105,59,32,92,10,9,32,92,10,9,105,102,40,105,32,60,32,110,117,109,67,111,108,115,41,32,92,10,9,123,32,92,10,9,32,32,32,32,102,111,114,40,106,32,61,32,48,59,32,106,32,60,32,110,117,109,82,111,119,115,84,111,80,114,111,99,101,115,115,59,32,106,43,43,41,32,92,10,9,32,32,32,32,123,32,92,10,9,32,32,32,32,32,32,32,32,97,32,61,32,40,102,108,111,97,116,50,41,40,105,110,95,114,101,97,108,91,115,116,97,114,116,73,110,100,101,120,93,44,32,105,110,95,105,109,97,103,91,115,116,97,114,116,73,110,100,101,120,93,41,59,32,92,10,9,32,32,32,32,32,32,32,32,97,110,103,32,61,32,50,46,48,102,32,42,32,77,95,80,73,32,42,32,100,105,114,32,42,32,105,32,42,32,40,115,116,97,114,116,82,111,119,32,43,32,106,41,32,47,32,78,59,32,92,10,9,32,32,32,32,32,32,32,32,119,32,61,32,40,102,108,111,97,116,50,41,40,110,97,116,105,118,101,95,99,111,115,40,97,110,103,41,44,32,110,97,116,105,118,101,95,115,105,110,40,97,110,103,41,41,59,32,92,10,9,32,32,32,32,32,32,32,32,97,32,61,32,99,111,109,112,108,101,120,77,117,108,40,97,44,32,119,41,59,32,92,10,9,32,32,32,32,32,32,32,32,105,110,95,114,101,97,108,91,115,116,97,114,116,73,110,100,101,120,93,32,61,32,97,46,120,59,32,92,10,9,32,32,32,32,32,32,32,32,105,110,95,105,109,97,103,91,115,116,97,114,116,73,110,100,101,120,93,32,61,32,97,46,121,59,32,92,10,9,32,32,32,32,32,32,32,32,115,116,97,114,116,73,110,100,101,120,32,43,61,32,110,117,109,67,111,108,115,59,32,92,10,9,32,32,32,32,125,32,92,10,9,125,9,32,92,10,125,32,92,10,0,0,0,0,0,0,0,0,112,108,97,110,110,97,114,0,32,32,32,32,105,102,40,106,106,32,60,32,115,32,41,32,123,10,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,45,102,111,114,109,97,116,0,32,32,32,32,108,77,101,109,76,111,97,100,32,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,32,106,106,44,0,0,0,0,0,0,0,110,47,114,97,100,105,120,65,114,114,97,121,91,48,93,32,60,61,32,112,108,97,110,45,62,109,97,120,95,119,111,114,107,95,105,116,101,109,95,112,101,114,95,119,111,114,107,103,114,111,117,112,32,38,38,32,34,114,101,113,117,105,114,101,100,32,119,111,114,107,32,105,116,101,109,115,32,112,101,114,32,120,102,111,114,109,32,103,114,101,97,116,101,114,32,116,104,97,110,32,109,97,120,105,109,117,109,32,119,111,114,107,32,105,116,101,109,115,32,97,108,108,111,119,101,100,32,112,101,114,32,119,111,114,107,32,103,114,111,117,112,32,102,111,114,32,108,111,99,97,108,32,109,101,109,32,102,102,116,92,110,34,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,51,68,0,0,0,0,0,0,101,108,115,101,32,123,10,0,50,68,0,0,0,0,0,0,32,32,32,32,106,106,32,43,61,32,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,49,68,0,0,0,0,0,0,32,32,32,32,105,102,40,32,106,106,32,60,32,115,32,41,32,123,10,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,45,100,105,109,0,0,0,0,105,102,40,40,103,114,111,117,112,73,100,32,61,61,32,103,101,116,95,110,117,109,95,103,114,111,117,112,115,40,48,41,45,49,41,32,38,38,32,115,41,32,123,10,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,105,110,118,101,114,115,101,0,93,46,121,32,61,32,108,77,101,109,83,116,111,114,101,91,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,102,111,114,119,97,114,100,0,93,46,121,59,10,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,37,115,0,0,0,0,0,0,93,46,120,32,61,32,108,77,101,109,83,116,111,114,101,91,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,45,100,105,114,0,0,0,0,32,32,32,32,97,91,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,45,98,97,116,99,104,115,105,122,101,0,0,0,0,0,0,32,32,32,32,98,97,114,114,105,101,114,40,32,67,76,75,95,76,79,67,65,76,95,77,69,77,95,70,69,78,67,69,32,41,59,10,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,37,100,0,0,0,0,0,0,93,46,120,59,10,0,0,0,114,97,100,105,120,65,114,114,97,121,91,48,93,32,60,61,32,112,108,97,110,45,62,109,97,120,95,114,97,100,105,120,32,38,38,32,34,109,97,120,32,114,97,100,105,120,32,99,104,111,111,115,101,110,32,105,115,32,103,114,101,97,116,101,114,32,116,104,97,110,32,97,108,108,111,119,101,100,92,110,34,0,0,0,0,0,0,0,45,110,0,0,0,0,0,0,93,32,61,32,97,91,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,76,111,97,100,91,0,0,0,102,97,108,115,101,0,0,0,32,32,32,32,108,77,101,109,83,116,111,114,101,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,32,106,106,44,0,0,0,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,106,106,32,61,32,108,73,100,32,62,62,32,0,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,114,0,0,0,0,0,0,0,59,10,0,0,0,0,0,0,112,97,114,97,109,46,116,120,116,0,0,0,0,0,0,0,32,32,32,32,105,105,32,61,32,108,73,100,32,38,32,0,58,32,0,0,0,0,0,0,44,32,105,105,32,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,76,111,97,100,32,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,32,106,106,44,32,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,95,95,107,101,114,110,101,108,32,118,111,105,100,32,92,10,99,108,70,70,84,95,49,68,84,119,105,115,116,73,110,116,101,114,108,101,97,118,101,100,40,95,95,103,108,111,98,97,108,32,102,108,111,97,116,50,32,42,105,110,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,115,116,97,114,116,82,111,119,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,110,117,109,67,111,108,115,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,78,44,32,117,110,115,105,103,110,101,100,32,105,110,116,32,110,117,109,82,111,119,115,84,111,80,114,111,99,101,115,115,44,32,105,110,116,32,100,105,114,41,32,92,10,123,32,92,10,32,32,32,102,108,111,97,116,50,32,97,44,32,119,59,32,92,10,32,32,32,102,108,111,97,116,32,97,110,103,59,32,92,10,32,32,32,117,110,115,105,103,110,101,100,32,105,110,116,32,106,59,32,92,10,9,117,110,115,105,103,110,101,100,32,105,110,116,32,105,32,61,32,103,101,116,95,103,108,111,98,97,108,95,105,100,40,48,41,59,32,92,10,9,117,110,115,105,103,110,101,100,32,105,110,116,32,115,116,97,114,116,73,110,100,101,120,32,61,32,105,59,32,92,10,9,32,92,10,9,105,102,40,105,32,60,32,110,117,109,67,111,108,115,41,32,92,10,9,123,32,92,10,9,32,32,32,32,102,111,114,40,106,32,61,32,48,59,32,106,32,60,32,110,117,109,82,111,119,115,84,111,80,114,111,99,101,115,115,59,32,106,43,43,41,32,92,10,9,32,32,32,32,123,32,92,10,9,32,32,32,32,32,32,32,32,97,32,61,32,105,110,91,115,116,97,114,116,73,110,100,101,120,93,59,32,92,10,9,32,32,32,32,32,32,32,32,97,110,103,32,61,32,50,46,48,102,32,42,32,77,95,80,73,32,42,32,100,105,114,32,42,32,105,32,42,32,40,115,116,97,114,116,82,111,119,32,43,32,106,41,32,47,32,78,59,32,92,10,9,32,32,32,32,32,32,32,32,119,32,61,32,40,102,108,111,97,116,50,41,40,110,97,116,105,118,101,95,99,111,115,40,97,110,103,41,44,32,110,97,116,105,118,101,95,115,105,110,40,97,110,103,41,41,59,32,92,10,9,32,32,32,32,32,32,32,32,97,32,61,32,99,111,109,112,108,101,120,77,117,108,40,97,44,32,119,41,59,32,92,10,9,32,32,32,32,32,32,32,32,105,110,91,115,116,97,114,116,73,110,100,101,120,93,32,61,32,97,59,32,92,10,9,32,32,32,32,32,32,32,32,115,116,97,114,116,73,110,100,101,120,32,43,61,32,110,117,109,67,111,108,115,59,32,92,10,9,32,32,32,32,125,32,92,10,9,125,9,32,92,10,125,32,92,10,0,0,0,0,32,32,32,32,125,10,0,0,37,112,0,0,0,0,0,0,32,32,32,32,0,0,0,0,110,117,109,82,97,100,105,120,32,62,32,48,32,38,38,32,34,110,111,32,114,97,100,105,120,32,97,114,114,97,121,32,115,117,112,112,108,105,101,100,92,110,34,0,0,0,0,0,32,32,32,32,105,102,40,32,33,115,32,124,124,32,40,103,114,111,117,112,73,100,32,60,32,103,101,116,95,110,117,109,95,103,114,111,117,112,115,40,48,41,45,49,41,32,124,124,32,40,106,106,32,60,32,115,41,32,41,32,123,10,0,0,105,110,100,101,120,79,117,116,32,43,61,32,109,97,100,50,52,40,106,44,32,0,0,0,111,117,116,91,0,0,0,0,111,117,116,32,43,61,32,105,110,100,101,120,79,117,116,59,10,0,0,0,0,0,0,0,111,117,116,95,105,109,97,103,91,0,0,0,0,0,0,0,40,95,95,103,108,111,98,97,108,32,102,108,111,97,116,50,32,42,105,110,44,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,50,32,42,111,117,116,44,32,105,110,116,32,100,105,114,44,32,105,110,116,32,83,41,10,0,0,0,0,111,117,116,95,114,101,97,108,91,0,0,0,0,0,0,0,111,117,116,95,105,109,97,103,32,43,61,32,105,110,100,101,120,79,117,116,59,10,0,0,111,117,116,95,114,101,97,108,32,43,61,32,105,110,100,101,120,79,117,116,59,10,0,0,105,110,100,101,120,79,117,116,32,43,61,32,116,105,100,59,10,0,0,0,0,0,0,0,108,77,101,109,83,116,111,114,101,91,32,0,0,0,0,0,44,32,116,105,100,32,38,32,0,0,0,0,0,0,0,0,108,77,101,109,76,111,97,100,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,116,105,100,32,62,62,32,0,67,0,0,0,0,0,0,0,44,32,106,32,60,60,32,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,68,69,70,65,85,76,84,0,0,108,77,101,109,83,116,111,114,101,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,105,44,32,0,0,0,0,97,110,103,32,61,32,97,110,103,49,42,40,107,32,43,32,0,0,0,0,0,0,0,0,40,95,95,103,108,111,98,97,108,32,102,108,111,97,116,32,42,105,110,95,114,101,97,108,44,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,32,42,105,110,95,105,109,97,103,44,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,32,42,111,117,116,95,114,101,97,108,44,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,32,42,111,117,116,95,105,109,97,103,44,32,105,110,116,32,100,105,114,44,32,105,110,116,32,83,41,10,0,41,42,108,59,10,0,0,0,97,110,103,49,32,61,32,100,105,114,42,40,50,46,48,102,42,77,95,80,73,47,0,0,107,32,61,32,106,32,60,60,32,0,0,0,0,0,0,0,41,32,43,32,105,41,32,62,62,32,0,0,0,0,0,0,108,32,61,32,40,40,98,78,117,109,32,60,60,32,0,0,40,97,32,43,32,0,0,0,98,97,114,114,105,101,114,40,67,76,75,95,76,79,67,65,76,95,77,69,77,95,70,69,78,67,69,41,59,10,0,0,118,101,99,116,111,114,0,0,108,77,101,109,83,116,111,114,101,91,0,0,0,0,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,65,67,67,69,76,69,82,65,84,79,82,0,0,0,0,0,0,108,77,101,109,76,111,97,100,32,61,32,115,77,101,109,32,43,32,105,110,100,101,120,73,110,59,10,0,0,0,0,0,108,77,101,109,83,116,111,114,101,32,61,32,115,77,101,109,32,43,32,116,105,100,59,10,0,0,0,0,0,0,0,0,95,95,107,101,114,110,101,108,32,118,111,105,100,32,0,0,105,110,100,101,120,73,110,32,61,32,109,97,100,50,52,40,106,44,32,0,0,0,0,0,119,32,61,32,40,102,108,111,97,116,50,41,40,110,97,116,105,118,101,95,99,111,115,40,97,110,103,41,44,32,110,97,116,105,118,101,95,115,105,110,40,97,110,103,41,41,59,10,0,0,0,0,0,0,0,0,41,42,106,59,10,0,0,0,47,0,0,0,0,0,0,0,97,110,103,32,61,32,100,105,114,42,40,50,46,48,102,42,77,95,80,73,42,0,0,0,40,97,44,32,100,105,114,41,59,10,0,0,0,0,0,0,102,102,116,75,101,114,110,101,108,0,0,0,0,0,0,0,37,46,48,76,102,0,0,0,105,110,32,43,61,32,105,110,100,101,120,73,110,59,10,0,97,99,99,101,108,101,114,97,116,111,114,0,0,0,0,0,97,91,0,0,0,0,0,0,105,110,95,105,109,97,103,32,43,61,32,105,110,100,101,120,73,110,59,10,0,0,0,0,125,10,0,0,0,0,0,0,105,110,95,114,101,97,108,32,43,61,32,105,110,100,101,120,73,110,59,10,0,0,0,0,105,110,100,101,120,73,110,32,43,61,32,109,97,100,50,52,40,106,44,32,0,0,0,0,106,32,61,32,116,105,100,32,62,62,32,0,0,0,0,0,105,32,61,32,116,105,100,32,38,32,0,0,0,0,0,0,116,105,100,32,61,32,108,73,100,59,10,0,0,0,0,0,105,110,100,101,120,79,117,116,32,43,61,32,40,120,78,117,109,32,60,60,32,0,0,0,105,110,100,101,120,73,110,32,43,61,32,40,120,78,117,109,32,60,60,32,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,44,32,106,41,59,10,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,67,80,85,0,0,0,0,0,0,116,105,100,32,61,32,105,110,100,101,120,73,110,59,10,0,105,110,100,101,120,73,110,32,61,32,109,117,108,50,52,40,98,78,117,109,44,32,0,0,93,59,10,0,0,0,0,0,98,78,117,109,32,61,32,103,114,111,117,112,73,100,32,38,32,0,0,0,0,0,0,0,98,78,117,109,32,61,32,103,114,111,117,112,73,100,59,10,0,0,0,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,41,41,59,10,0,0,0,0,40,120,78,117,109,32,60,60,32,0,0,0,0,0,0,0,44,32,106,32,43,32,0,0,83,97,116,0,0,0,0,0,105,110,100,101,120,79,117,116,32,61,32,109,97,100,50,52,40,105,44,32,0,0,0,0,70,114,105,0,0,0,0,0,106,32,61,32,116,105,100,32,38,32,0,0,0,0,0,0,84,104,117,0,0,0,0,0,37,76,102,0,0,0,0,0,105,32,61,32,116,105,100,32,62,62,32,0,0,0,0,0,99,112,117,0,0,0,0,0,87,101,100,0,0,0,0,0,116,105,100,32,61,32,109,117,108,50,52,40,103,114,111,117,112,73,100,44,32,0,0,0,84,117,101,0,0,0,0,0,44,32,120,78,117,109,32,60,60,32,0,0,0,0,0,0,32,32,32,32,95,95,108,111,99,97,108,32,102,108,111,97,116,32,115,77,101,109,91,0,77,111,110,0,0,0,0,0,105,110,100,101,120,73,110,32,61,32,109,97,100,50,52,40,103,114,111,117,112,73,100,44,32,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,103,114,111,117,112,73,100,32,61,32,103,114,111,117,112,73,100,32,38,32,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,120,78,117,109,32,61,32,103,114,111,117,112,73,100,32,62,62,32,0,0,0,0,0,0,70,114,105,100,97,121,0,0,35,105,102,110,100,101,102,32,77,95,80,73,10,35,100,101,102,105,110,101,32,77,95,80,73,32,48,120,49,46,57,50,49,102,98,53,52,52,52,50,100,49,56,112,43,49,10,35,101,110,100,105,102,10,102,108,111,97,116,50,32,99,111,109,112,108,101,120,77,117,108,40,102,108,111,97,116,50,32,97,44,102,108,111,97,116,50,32,66,41,32,123,32,114,101,116,117,114,110,32,40,102,108,111,97,116,50,41,40,109,97,100,40,45,40,97,41,46,121,44,32,40,66,41,46,121,44,32,40,97,41,46,120,32,42,32,40,66,41,46,120,41,44,32,109,97,100,40,40,97,41,46,121,44,32,40,66,41,46,120,44,32,40,97,41,46,120,32,42,32,40,66,41,46,121,41,41,59,125,10,35,100,101,102,105,110,101,32,99,111,110,106,40,97,41,32,40,40,102,108,111,97,116,50,41,40,40,97,41,46,120,44,32,45,40,97,41,46,121,41,41,10,35,100,101,102,105,110,101,32,99,111,110,106,84,114,97,110,115,112,40,97,41,32,40,40,102,108,111,97,116,50,41,40,45,40,97,41,46,121,44,32,40,97,41,46,120,41,41,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,50,40,97,44,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,102,108,111,97,116,50,32,99,32,61,32,40,97,41,91,48,93,59,32,32,32,32,92,10,32,32,32,32,40,97,41,91,48,93,32,61,32,99,32,43,32,40,97,41,91,49,93,59,32,32,92,10,32,32,32,32,40,97,41,91,49,93,32,61,32,99,32,45,32,40,97,41,91,49,93,59,32,32,92,10,125,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,50,83,40,100,49,44,100,50,44,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,102,108,111,97,116,50,32,99,32,61,32,40,100,49,41,59,32,32,32,92,10,32,32,32,32,40,100,49,41,32,61,32,99,32,43,32,40,100,50,41,59,32,32,32,92,10,32,32,32,32,40,100,50,41,32,61,32,99,32,45,32,40,100,50,41,59,32,32,32,92,10,125,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,52,40,97,44,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,48,93,44,32,40,97,41,91,50,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,93,44,32,40,97,41,91,51,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,48,93,44,32,40,97,41,91,49,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,40,97,41,91,51,93,32,61,32,40,102,108,111,97,116,50,41,40,100,105,114,41,42,40,99,111,110,106,84,114,97,110,115,112,40,40,97,41,91,51,93,41,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,50,93,44,32,40,97,41,91,51,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,108,111,97,116,50,32,99,32,61,32,40,97,41,91,49,93,59,32,92,10,32,32,32,32,40,97,41,91,49,93,32,61,32,40,97,41,91,50,93,59,32,92,10,32,32,32,32,40,97,41,91,50,93,32,61,32,99,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,52,115,40,97,48,44,97,49,44,97,50,44,97,51,44,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,48,41,44,32,40,97,50,41,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,49,41,44,32,40,97,51,41,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,48,41,44,32,40,97,49,41,44,32,100,105,114,41,59,32,92,10,32,32,32,32,40,97,51,41,32,61,32,40,102,108,111,97,116,50,41,40,100,105,114,41,42,40,99,111,110,106,84,114,97,110,115,112,40,40,97,51,41,41,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,50,41,44,32,40,97,51,41,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,108,111,97,116,50,32,99,32,61,32,40,97,49,41,59,32,92,10,32,32,32,32,40,97,49,41,32,61,32,40,97,50,41,59,32,92,10,32,32,32,32,40,97,50,41,32,61,32,99,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,98,105,116,114,101,118,101,114,115,101,56,40,97,41,32,92,10,123,32,92,10,32,32,32,32,102,108,111,97,116,50,32,99,59,32,92,10,32,32,32,32,99,32,61,32,40,97,41,91,49,93,59,32,92,10,32,32,32,32,40,97,41,91,49,93,32,61,32,40,97,41,91,52,93,59,32,92,10,32,32,32,32,40,97,41,91,52,93,32,61,32,99,59,32,92,10,32,32,32,32,99,32,61,32,40,97,41,91,51,93,59,32,92,10,32,32,32,32,40,97,41,91,51,93,32,61,32,40,97,41,91,54,93,59,32,92,10,32,32,32,32,40,97,41,91,54,93,32,61,32,99,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,56,40,97,44,100,105,114,41,32,92,10,123,32,92,10,9,99,111,110,115,116,32,102,108,111,97,116,50,32,119,49,32,32,61,32,40,102,108,111,97,116,50,41,40,48,120,49,46,54,97,48,57,101,54,112,45,49,102,44,32,32,100,105,114,42,48,120,49,46,54,97,48,57,101,54,112,45,49,102,41,59,32,32,92,10,9,99,111,110,115,116,32,102,108,111,97,116,50,32,119,51,32,32,61,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,54,97,48,57,101,54,112,45,49,102,44,32,100,105,114,42,48,120,49,46,54,97,48,57,101,54,112,45,49,102,41,59,32,32,92,10,9,102,108,111,97,116,50,32,99,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,48,93,44,32,40,97,41,91,52,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,93,44,32,40,97,41,91,53,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,50,93,44,32,40,97,41,91,54,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,51,93,44,32,40,97,41,91,55,93,44,32,100,105,114,41,59,32,92,10,9,40,97,41,91,53,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,119,49,44,32,40,97,41,91,53,93,41,59,32,92,10,9,40,97,41,91,54,93,32,61,32,40,102,108,111,97,116,50,41,40,100,105,114,41,42,40,99,111,110,106,84,114,97,110,115,112,40,40,97,41,91,54,93,41,41,59,32,92,10,9,40,97,41,91,55,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,119,51,44,32,40,97,41,91,55,93,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,48,93,44,32,40,97,41,91,50,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,93,44,32,40,97,41,91,51,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,52,93,44,32,40,97,41,91,54,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,53,93,44,32,40,97,41,91,55,93,44,32,100,105,114,41,59,32,92,10,9,40,97,41,91,51,93,32,61,32,40,102,108,111,97,116,50,41,40,100,105,114,41,42,40,99,111,110,106,84,114,97,110,115,112,40,40,97,41,91,51,93,41,41,59,32,92,10,9,40,97,41,91,55,93,32,61,32,40,102,108,111,97,116,50,41,40,100,105,114,41,42,40,99,111,110,106,84,114,97,110,115,112,40,40,97,41,91,55,93,41,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,48,93,44,32,40,97,41,91,49,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,50,93,44,32,40,97,41,91,51,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,52,93,44,32,40,97,41,91,53,93,44,32,100,105,114,41,59,32,92,10,9,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,54,93,44,32,40,97,41,91,55,93,44,32,100,105,114,41,59,32,92,10,9,98,105,116,114,101,118,101,114,115,101,56,40,40,97,41,41,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,98,105,116,114,101,118,101,114,115,101,52,120,52,40,97,41,32,92,10,123,32,92,10,9,102,108,111,97,116,50,32,99,59,32,92,10,9,99,32,61,32,40,97,41,91,49,93,59,32,32,40,97,41,91,49,93,32,32,61,32,40,97,41,91,52,93,59,32,32,40,97,41,91,52,93,32,32,61,32,99,59,32,92,10,9,99,32,61,32,40,97,41,91,50,93,59,32,32,40,97,41,91,50,93,32,32,61,32,40,97,41,91,56,93,59,32,32,40,97,41,91,56,93,32,32,61,32,99,59,32,92,10,9,99,32,61,32,40,97,41,91,51,93,59,32,32,40,97,41,91,51,93,32,32,61,32,40,97,41,91,49,50,93,59,32,40,97,41,91,49,50,93,32,61,32,99,59,32,92,10,9,99,32,61,32,40,97,41,91,54,93,59,32,32,40,97,41,91,54,93,32,32,61,32,40,97,41,91,57,93,59,32,32,40,97,41,91,57,93,32,32,61,32,99,59,32,92,10,9,99,32,61,32,40,97,41,91,55,93,59,32,32,40,97,41,91,55,93,32,32,61,32,40,97,41,91,49,51,93,59,32,40,97,41,91,49,51,93,32,61,32,99,59,32,92,10,9,99,32,61,32,40,97,41,91,49,49,93,59,32,40,97,41,91,49,49,93,32,61,32,40,97,41,91,49,52,93,59,32,40,97,41,91,49,52,93,32,61,32,99,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,49,54,40,97,44,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,99,111,110,115,116,32,102,108,111,97,116,32,119,48,32,61,32,48,120,49,46,100,57,48,54,98,99,112,45,49,102,59,32,92,10,32,32,32,32,99,111,110,115,116,32,102,108,111,97,116,32,119,49,32,61,32,48,120,49,46,56,55,100,101,50,97,112,45,50,102,59,32,92,10,32,32,32,32,99,111,110,115,116,32,102,108,111,97,116,32,119,50,32,61,32,48,120,49,46,54,97,48,57,101,54,112,45,49,102,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,115,40,40,97,41,91,48,93,44,32,40,97,41,91,52,93,44,32,40,97,41,91,56,93,44,32,32,40,97,41,91,49,50,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,115,40,40,97,41,91,49,93,44,32,40,97,41,91,53,93,44,32,40,97,41,91,57,93,44,32,32,40,97,41,91,49,51,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,115,40,40,97,41,91,50,93,44,32,40,97,41,91].concat([54,93,44,32,40,97,41,91,49,48,93,44,32,40,97,41,91,49,52,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,115,40,40,97,41,91,51,93,44,32,40,97,41,91,55,93,44,32,40,97,41,91,49,49,93,44,32,40,97,41,91,49,53,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,40,97,41,91,53,93,32,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,53,93,44,32,40,102,108,111,97,116,50,41,40,119,48,44,32,100,105,114,42,119,49,41,41,59,32,92,10,32,32,32,32,40,97,41,91,54,93,32,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,54,93,44,32,40,102,108,111,97,116,50,41,40,119,50,44,32,100,105,114,42,119,50,41,41,59,32,92,10,32,32,32,32,40,97,41,91,55,93,32,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,55,93,44,32,40,102,108,111,97,116,50,41,40,119,49,44,32,100,105,114,42,119,48,41,41,59,32,92,10,32,32,32,32,40,97,41,91,57,93,32,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,57,93,44,32,40,102,108,111,97,116,50,41,40,119,50,44,32,100,105,114,42,119,50,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,48,93,32,61,32,40,102,108,111,97,116,50,41,40,100,105,114,41,42,40,99,111,110,106,84,114,97,110,115,112,40,40,97,41,91,49,48,93,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,49,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,49,93,44,32,40,102,108,111,97,116,50,41,40,45,119,50,44,32,100,105,114,42,119,50,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,51,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,51,93,44,32,40,102,108,111,97,116,50,41,40,119,49,44,32,100,105,114,42,119,48,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,52,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,52,93,44,32,40,102,108,111,97,116,50,41,40,45,119,50,44,32,100,105,114,42,119,50,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,53,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,53,93,44,32,40,102,108,111,97,116,50,41,40,45,119,48,44,32,100,105,114,42,45,119,49,41,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,40,40,97,41,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,40,40,97,41,32,43,32,52,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,40,40,97,41,32,43,32,56,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,52,40,40,97,41,32,43,32,49,50,44,32,100,105,114,41,59,32,92,10,32,32,32,32,98,105,116,114,101,118,101,114,115,101,52,120,52,40,40,97,41,41,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,98,105,116,114,101,118,101,114,115,101,51,50,40,97,41,32,92,10,123,32,92,10,32,32,32,32,102,108,111,97,116,50,32,99,49,44,32,99,50,59,32,92,10,32,32,32,32,99,49,32,61,32,40,97,41,91,50,93,59,32,32,32,40,97,41,91,50,93,32,61,32,40,97,41,91,49,93,59,32,32,32,99,50,32,61,32,40,97,41,91,52,93,59,32,32,32,40,97,41,91,52,93,32,61,32,99,49,59,32,32,32,99,49,32,61,32,40,97,41,91,56,93,59,32,32,32,40,97,41,91,56,93,32,61,32,99,50,59,32,32,32,32,99,50,32,61,32,40,97,41,91,49,54,93,59,32,32,40,97,41,91,49,54,93,32,61,32,99,49,59,32,32,32,40,97,41,91,49,93,32,61,32,99,50,59,32,92,10,32,32,32,32,99,49,32,61,32,40,97,41,91,54,93,59,32,32,32,40,97,41,91,54,93,32,61,32,40,97,41,91,51,93,59,32,32,32,99,50,32,61,32,40,97,41,91,49,50,93,59,32,32,40,97,41,91,49,50,93,32,61,32,99,49,59,32,32,99,49,32,61,32,40,97,41,91,50,52,93,59,32,32,40,97,41,91,50,52,93,32,61,32,99,50,59,32,32,32,99,50,32,61,32,40,97,41,91,49,55,93,59,32,32,40,97,41,91,49,55,93,32,61,32,99,49,59,32,32,32,40,97,41,91,51,93,32,61,32,99,50,59,32,92,10,32,32,32,32,99,49,32,61,32,40,97,41,91,49,48,93,59,32,32,40,97,41,91,49,48,93,32,61,32,40,97,41,91,53,93,59,32,32,99,50,32,61,32,40,97,41,91,50,48,93,59,32,32,40,97,41,91,50,48,93,32,61,32,99,49,59,32,32,99,49,32,61,32,40,97,41,91,57,93,59,32,32,32,40,97,41,91,57,93,32,61,32,99,50,59,32,32,32,32,99,50,32,61,32,40,97,41,91,49,56,93,59,32,32,40,97,41,91,49,56,93,32,61,32,99,49,59,32,32,32,40,97,41,91,53,93,32,61,32,99,50,59,32,92,10,32,32,32,32,99,49,32,61,32,40,97,41,91,49,52,93,59,32,32,40,97,41,91,49,52,93,32,61,32,40,97,41,91,55,93,59,32,32,99,50,32,61,32,40,97,41,91,50,56,93,59,32,32,40,97,41,91,50,56,93,32,61,32,99,49,59,32,32,99,49,32,61,32,40,97,41,91,50,53,93,59,32,32,40,97,41,91,50,53,93,32,61,32,99,50,59,32,32,32,99,50,32,61,32,40,97,41,91,49,57,93,59,32,32,40,97,41,91,49,57,93,32,61,32,99,49,59,32,32,32,40,97,41,91,55,93,32,61,32,99,50,59,32,92,10,32,32,32,32,99,49,32,61,32,40,97,41,91,50,50,93,59,32,32,40,97,41,91,50,50,93,32,61,32,40,97,41,91,49,49,93,59,32,99,50,32,61,32,40,97,41,91,49,51,93,59,32,32,40,97,41,91,49,51,93,32,61,32,99,49,59,32,32,99,49,32,61,32,40,97,41,91,50,54,93,59,32,32,40,97,41,91,50,54,93,32,61,32,99,50,59,32,32,32,99,50,32,61,32,40,97,41,91,50,49,93,59,32,32,40,97,41,91,50,49,93,32,61,32,99,49,59,32,32,32,40,97,41,91,49,49,93,32,61,32,99,50,59,32,92,10,32,32,32,32,99,49,32,61,32,40,97,41,91,51,48,93,59,32,32,40,97,41,91,51,48,93,32,61,32,40,97,41,91,49,53,93,59,32,99,50,32,61,32,40,97,41,91,50,57,93,59,32,32,40,97,41,91,50,57,93,32,61,32,99,49,59,32,32,99,49,32,61,32,40,97,41,91,50,55,93,59,32,32,40,97,41,91,50,55,93,32,61,32,99,50,59,32,32,32,99,50,32,61,32,40,97,41,91,50,51,93,59,32,32,40,97,41,91,50,51,93,32,61,32,99,49,59,32,32,32,40,97,41,91,49,53,93,32,61,32,99,50,59,32,92,10,125,10,10,35,100,101,102,105,110,101,32,102,102,116,75,101,114,110,101,108,51,50,40,97,44,100,105,114,41,32,92,10,123,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,48,93,44,32,32,40,97,41,91,49,54,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,93,44,32,32,40,97,41,91,49,55,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,50,93,44,32,32,40,97,41,91,49,56,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,51,93,44,32,32,40,97,41,91,49,57,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,52,93,44,32,32,40,97,41,91,50,48,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,53,93,44,32,32,40,97,41,91,50,49,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,54,93,44,32,32,40,97,41,91,50,50,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,55,93,44,32,32,40,97,41,91,50,51,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,56,93,44,32,32,40,97,41,91,50,52,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,57,93,44,32,32,40,97,41,91,50,53,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,48,93,44,32,40,97,41,91,50,54,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,49,93,44,32,40,97,41,91,50,55,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,50,93,44,32,40,97,41,91,50,56,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,51,93,44,32,40,97,41,91,50,57,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,52,93,44,32,40,97,41,91,51,48,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,50,83,40,40,97,41,91,49,53,93,44,32,40,97,41,91,51,49,93,44,32,100,105,114,41,59,32,92,10,32,32,32,32,40,97,41,91,49,55,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,55,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,102,54,50,57,55,99,112,45,49,102,44,32,100,105,114,42,48,120,49,46,56,102,56,98,56,52,112,45,51,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,56,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,56,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,100,57,48,54,98,99,112,45,49,102,44,32,100,105,114,42,48,120,49,46,56,55,100,101,50,97,112,45,50,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,49,57,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,49,57,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,97,57,98,54,54,50,112,45,49,102,44,32,100,105,114,42,48,120,49,46,49,99,55,51,98,52,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,48,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,48,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,54,97,48,57,101,54,112,45,49,102,44,32,100,105,114,42,48,120,49,46,54,97,48,57,101,54,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,49,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,49,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,49,99,55,51,98,52,112,45,49,102,44,32,100,105,114,42,48,120,49,46,97,57,98,54,54,50,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,50,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,50,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,56,55,100,101,50,97,112,45,50,102,44,32,100,105,114,42,48,120,49,46,100,57,48,54,98,99,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,51,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,51,93,44,32,40,102,108,111,97,116,50,41,40,48,120,49,46,56,102,56,98,56,52,112,45,51,102,44,32,100,105,114,42,48,120,49,46,102,54,50,57,55,99,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,52,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,52,93,44,32,40,102,108,111,97,116,50,41,40,48,120,48,112,43,48,102,44,32,100,105,114,42,48,120,49,112,43,48,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,53,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,53,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,56,102,56,98,56,52,112,45,51,102,44,32,100,105,114,42,48,120,49,46,102,54,50,57,55,99,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,54,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,54,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,56,55,100,101,50,97,112,45,50,102,44,32,100,105,114,42,48,120,49,46,100,57,48,54,98,99,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,55,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,55,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,49,99,55,51,98,52,112,45,49,102,44,32,100,105,114,42,48,120,49,46,97,57,98,54,54,50,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,56,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,56,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,54,97,48,57,101,54,112,45,49,102,44,32,100,105,114,42,48,120,49,46,54,97,48,57,101,54,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,50,57,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,50,57,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,97,57,98,54,54,50,112,45,49,102,44,32,100,105,114,42,48,120,49,46,49,99,55,51,98,52,112,45,49,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,51,48,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,51,48,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,100,57,48,54,98,99,112,45,49,102,44,32,100,105,114,42,48,120,49,46,56,55,100,101,50,97,112,45,50,102,41,41,59,32,92,10,32,32,32,32,40,97,41,91,51,49,93,32,61,32,99,111,109,112,108,101,120,77,117,108,40,40,97,41,91,51,49,93,44,32,40,102,108,111,97,116,50,41,40,45,48,120,49,46,102,54,50,57,55,99,112,45,49,102,44,32,100,105,114,42,48,120,49,46,56,102,56,98,56,52,112,45,51,102,41,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,49,54,40,40,97,41,44,32,100,105,114,41,59,32,92,10,32,32,32,32,102,102,116,75,101,114,110,101,108,49,54,40,40,97,41,32,43,32,49,54,44,32,100,105,114,41,59,32,92,10,32,32,32,32,98,105,116,114,101,118,101,114,115,101,51,50,40,40,97,41,41,59,32,92,10,125,10,10,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,82,49,32,60,61,32,109,97,120,65,114,114,97,121,76,101,110,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,82,49,42,82,50,32,61,61,32,114,97,100,105,120,0,0,84,117,101,115,100,97,121,0,82,50,32,60,61,32,82,49,0,0,0,0,0,0,0,0,77,111,110,100,97,121,0,0,37,100,0,0,0,0,0,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,95,71,80,85,0,0,0,0,0,0,83,117,110,100,97,121,0,0,32,32,32,32,105,110,116,32,103,114,111,117,112,73,100,32,61,32,103,101,116,95,103,114,111,117,112,95,105,100,40,32,48,32,41,59,10,0,0,0,32,32,32,32,105,110,116,32,108,73,100,32,61,32,103,101,116,95,108,111,99,97,108,95,105,100,40,32,48,32,41,59,10,0,0,0,0,0,0,0,123,10,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,32,32,32,32,102,108,111,97,116,50,32,97,91,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,32,32,32,32,95,95,108,111,99,97,108,32,102,108,111,97,116,32,42,108,77,101,109,83,116,111,114,101,44,32,42,108,77,101,109,76,111,97,100,59,10,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,32,32,32,32,102,108,111,97,116,32,97,110,103,44,32,97,110,103,102,44,32,97,110,103,49,59,10,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,32,32,32,32,102,108,111,97,116,50,32,119,59,10,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,32,32,32,32,105,110,116,32,115,44,32,105,105,44,32,106,106,44,32,111,102,102,115,101,116,59,10,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,32,32,32,32,105,110,116,32,105,44,32,106,44,32,114,44,32,105,110,100,101,120,73,110,44,32,105,110,100,101,120,79,117,116,44,32,105,110,100,101,120,44,32,116,105,100,44,32,98,78,117,109,44,32,120,78,117,109,44,32,107,44,32,108,59,10,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,93,46,121,32,61,32,105,110,95,105,109,97,103,91,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,93,46,120,32,61,32,105,110,95,114,101,97,108,91,0,0,103,112,117,0,0,0,0,0,99,108,70,70,84,95,49,68,84,119,105,115,116,73,110,116,101,114,108,101,97,118,101,100,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,93,32,61,32,105,110,91,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,97,91,0,0,0,0,0,0,121,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,76,111,97,100,32,61,32,115,77,101,109,32,43,32,109,117,108,50,52,40,32,106,106,44,32,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,32,32,32,32,106,106,32,61,32,108,73,100,59,10,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,105,105,32,61,32,48,59,10,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,108,77,101,109,76,111,97,100,32,61,32,115,77,101,109,32,43,32,109,97,100,50,52,40,32,106,106,44,32,0,0,0,0,0,0,0,32,32,32,32,105,102,40,106,106,32,60,32,115,32,41,10,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,44,32,108,73,100,32,41,59,10,0,0,0,0,0,0,0,78,111,118,0,0,0,0,0,32,32,32,32,111,102,102,115,101,116,32,61,32,109,97,100,50,52,40,32,103,114,111,117,112,73,100,44,32,32,0,0,79,99,116,0,0,0,0,0,93,46,121,32,61,32,108,77,101,109,76,111,97,100,91,0,67,76,95,68,69,86,73,67,69,95,84,89,80,69,0,0,99,108,70,70,84,95,49,68,84,119,105,115,116,83,112,108,105,116,0,0,0,0,0,0,83,101,112,0,0,0,0,0,93,46,120,32,61,32,108,77,101,109,76,111,97,100,91,0,65,117,103,0,0,0,0,0,125,10,32,0,0,0,0,0,120,0,0,0,0,0,0,0,110,32,60,61,32,112,108,97,110,45,62,109,97,120,95,119,111,114,107,95,105,116,101,109,95,112,101,114,95,119,111,114,107,103,114,111,117,112,32,42,32,112,108,97,110,45,62,109,97,120,95,114,97,100,105,120,32,38,38,32,34,115,105,103,110,97,108,32,108,101,110,103,104,116,32,116,111,111,32,98,105,103,32,102,111,114,32,108,111,99,97,108,32,109,101,109,32,102,102,116,92,110,34,0,102,102,116,95,107,101,114,110,101,108,115,116,114,105,110,103,46,99,112,112,0,0,0,0,118,111,105,100,32,99,114,101,97,116,101,76,111,99,97,108,77,101,109,102,102,116,75,101,114,110,101,108,83,116,114,105,110,103,40,99,108,95,102,102,116,95,112,108,97,110,32,42,41,0,0,0,0,0,0,0,118,111,105,100,32,99,114,101,97,116,101,71,108,111,98,97,108,70,70,84,75,101,114,110,101,108,83,116,114,105,110,103,40,99,108,95,102,102,116,95,112,108,97,110,32,42,44,32,105,110,116,44,32,105,110,116,44,32,99,108,95,102,102,116,95,107,101,114,110,101,108,95,100,105,114,44,32,105,110,116,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,32,10,0,0,0,0,0,0,0,4,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,232,85,0,0,30,0,0,0,120,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,85,0,0,204,0,0,0,168,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,86,0,0,74,0,0,0,14,1,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,86,0,0,96,0,0,0,8,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,86,0,0,96,0,0,0,20,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,86,0,0,174,0,0,0,86,0,0,0,50,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,86,0,0,242,0,0,0,192,0,0,0,50,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,86,0,0,166,0,0,0,194,0,0,0,50,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,86,0,0,8,1,0,0,144,0,0,0,50,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,87,0,0,6,1,0,0,16,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,87,0,0,164,0,0,0,112,0,0,0,50,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,87,0,0,40,0,0,0,114,0,0,0,50,0,0,0,120,0,0,0,4,0,0,0,30,0,0,0,6,0,0,0,20,0,0,0,54,0,0,0,2,0,0,0,248,255,255,255,128,87,0,0,22,0,0,0,8,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,30,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,87,0,0,252,0,0,0,234,0,0,0,50,0,0,0,20,0,0,0,16,0,0,0,58,0,0,0,26,0,0,0,18,0,0,0,2,0,0,0,4,0,0,0,248,255,255,255,168,87,0,0,70,0,0,0,104,0,0,0,116,0,0,0,124,0,0,0,64,0,0,0,44,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,87,0,0,80,0,0,0,196,0,0,0,50,0,0,0,48,0,0,0,40,0,0,0,8,0,0,0,38,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,87,0,0,62,0,0,0,68,0,0,0,50,0,0,0,42,0,0,0,84,0,0,0,12,0,0,0,54,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,87,0,0,0,1,0,0,2,0,0,0,50,0,0,0,26,0,0,0,32,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,88,0,0,48,0,0,0,218,0,0,0,50,0,0,0,10,0,0,0,14,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,88,0,0,222,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,88,0,0,28,0,0,0,142,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,88,0,0,6,0,0,0,180,0,0,0,50,0,0,0,8,0,0,0,6,0,0,0,12,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,2,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,88,0,0,100,0,0,0,18,0,0,0,50,0,0,0,20,0,0,0,24,0,0,0,32,0,0,0,22,0,0,0,22,0,0,0,8,0,0,0,6,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,88,0,0,42,0,0,0,24,0,0,0,50,0,0,0,46,0,0,0,44,0,0,0,36,0,0,0,38,0,0,0,28,0,0,0,42,0,0,0,34,0,0,0,52,0,0,0,50,0,0,0,48,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,88,0,0,56,0,0,0,4,0,0,0,50,0,0,0,76,0,0,0,68,0,0,0,62,0,0,0,64,0,0,0,56,0,0,0,66,0,0,0,60,0,0,0,74,0,0,0,72,0,0,0,70,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,88,0,0,76,0,0,0,94,0,0,0,50,0,0,0,16,0,0,0,16,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,88,0,0,26,0,0,0,182,0,0,0,50,0,0,0,22,0,0,0,18,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,88,0,0,240,0,0,0,134,0,0,0,50,0,0,0,14,0,0,0,4,0,0,0,20,0,0,0,16,0,0,0,62,0,0,0,4,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,89,0,0,186,0,0,0,64,0,0,0,50,0,0,0,2,0,0,0,8,0,0,0,8,0,0,0,106,0,0,0,96,0,0,0,18,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,89,0,0,186,0,0,0,136,0,0,0,50,0,0,0,16,0,0,0,6,0,0,0,2,0,0,0,128,0,0,0,46,0,0,0,12,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,89,0,0,186,0,0,0,156,0,0,0,50,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,74,0,0,0,6,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,89,0,0,186,0,0,0,36,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,89,0,0,60,0,0,0,160,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,89,0,0,186,0,0,0,82,0,0,0,50,0,0,0,22,0,0,0,2,0,0,0,4,0,0,0,10,0,0,0,16,0,0,0,30,0,0,0,24,0,0,0,6,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,89,0,0,12,1,0,0,38,0,0,0,50,0,0,0,2,0,0,0,4,0,0,0,20,0,0,0,36,0,0,0,8,0,0,0,6,0,0,0,28,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,216,89,0,0,214,0,0,0,202,0,0,0,200,255,255,255,200,255,255,255,216,89,0,0,32,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,89,0,0,70,0,0,0,230,0,0,0,78,0,0,0,2,0,0,0,16,0,0,0,34,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,89,0,0,186,0,0,0,88,0,0,0,50,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,74,0,0,0,6,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,90,0,0,186,0,0,0,170,0,0,0,50,0,0,0,10,0,0,0,12,0,0,0,24,0,0,0,34,0,0,0,74,0,0,0,6,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,90,0,0,52,0,0,0,220,0,0,0,58,0,0,0,38,0,0,0,26,0,0,0,2,0,0,0,50,0,0,0,86,0,0,0,20,0,0,0,122,0,0,0,10,0,0,0,26,0,0,0,18,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,90,0,0,130,0,0,0,246,0,0,0,74,0,0,0,24,0,0,0,16,0,0,0,12,0,0,0,88,0,0,0,100,0,0,0,32,0,0,0,28,0,0,0,26,0,0,0,32,0,0,0,40,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,90,0,0,10,0,0,0,122,0,0,0,58,0,0,0,38,0,0,0,30,0,0,0,8,0,0,0,50,0,0,0,86,0,0,0,20,0,0,0,6,0,0,0,10,0,0,0,28,0,0,0,18,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,90,0,0,102,0,0,0,200,0,0,0,2,0,0,0,2,0,0,0,16,0,0,0,34,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,96,90,0,0,46,0,0,0,216,0,0,0,252,255,255,255,252,255,255,255,96,90,0,0,150,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,120,90,0,0,224,0,0,0,248,0,0,0,252,255,255,255,252,255,255,255,120,90,0,0,110,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,144,90,0,0,90,0,0,0,16,1,0,0,248,255,255,255,248,255,255,255,144,90,0,0,188,0,0,0,244,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,168,90,0,0,108,0,0,0,212,0,0,0,248,255,255,255,248,255,255,255,168,90,0,0,140,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,90,0,0,210,0,0,0,190,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,90,0,0,2,1,0,0,238,0,0,0,4,0,0,0,24,0,0,0,16,0,0,0,12,0,0,0,58,0,0,0,100,0,0,0,32,0,0,0,28,0,0,0,26,0,0,0,32,0,0,0,40,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,90,0,0,158,0,0,0,184,0,0,0,34,0,0,0,38,0,0,0,30,0,0,0,8,0,0,0,90,0,0,0,86,0,0,0,20,0,0,0,6,0,0,0,10,0,0,0,28,0,0,0,18,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,91,0,0,232,0,0,0,148,0,0,0,50,0,0,0,68,0,0,0,118,0,0,0,40,0,0,0,80,0,0,0,6,0,0,0,28,0,0,0,52,0,0,0,20,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,91,0,0,106,0,0,0,58,0,0,0,50,0,0,0,112,0,0,0,4,0,0,0,66,0,0,0,16,0,0,0,76,0,0,0,22,0,0,0,114,0,0,0,50,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,91,0,0,236,0,0,0,118,0,0,0,50,0,0,0,14,0,0,0,60,0,0,0,46,0,0,0,42,0,0,0,78,0,0,0,52,0,0,0,92,0,0,0,56,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,91,0,0,78,0,0,0,178,0,0,0,50,0,0,0,102,0,0,0,108,0,0,0,26,0,0,0,72,0,0,0,24,0,0,0,18,0,0,0,80,0,0,0,70,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,91,0,0,92,0,0,0,72,0,0,0,62,0,0,0,24,0,0,0,16,0,0,0,12,0,0,0,88,0,0,0,100,0,0,0,32,0,0,0,72,0,0,0,82,0,0,0,12,0,0,0,40,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,91,0,0,14,0,0,0,226,0,0,0,60,0,0,0,38,0,0,0,30,0,0,0,8,0,0,0,50,0,0,0,86,0,0,0,20,0,0,0,56,0,0,0,24,0,0,0,4,0,0,0,18,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,91,0,0,4,1,0,0,206,0,0,0,66,0,0,0,154,0,0,0,8,0,0,0,2,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,148,68,0,0,44,92,0,0,64,92,0,0,168,68,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0])
.concat([78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,111,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,160,73,0,0,0,0,0,0,176,73,0,0,0,0,0,0,192,73,0,0,224,85,0,0,0,0,0,0,0,0,0,0,208,73,0,0,224,85,0,0,0,0,0,0,0,0,0,0,224,73,0,0,224,85,0,0,0,0,0,0,0,0,0,0,248,73,0,0,40,86,0,0,0,0,0,0,0,0,0,0,16,74,0,0,224,85,0,0,0,0,0,0,0,0,0,0,32,74,0,0,104,73,0,0,56,74,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,8,91,0,0,0,0,0,0,104,73,0,0,128,74,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,16,91,0,0,0,0,0,0,104,73,0,0,200,74,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,24,91,0,0,0,0,0,0,104,73,0,0,16,75,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,32,91,0,0,0,0,0,0,0,0,0,0,88,75,0,0,48,88,0,0,0,0,0,0,0,0,0,0,136,75,0,0,48,88,0,0,0,0,0,0,104,73,0,0,184,75,0,0,0,0,0,0,1,0,0,0,72,90,0,0,0,0,0,0,104,73,0,0,208,75,0,0,0,0,0,0,1,0,0,0,72,90,0,0,0,0,0,0,104,73,0,0,232,75,0,0,0,0,0,0,1,0,0,0,80,90,0,0,0,0,0,0,104,73,0,0,0,76,0,0,0,0,0,0,1,0,0,0,80,90,0,0,0,0,0,0,104,73,0,0,24,76,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,184,91,0,0,0,8,0,0,104,73,0,0,96,76,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,184,91,0,0,0,8,0,0,104,73,0,0,168,76,0,0,0,0,0,0,3,0,0,0,104,89,0,0,2,0,0,0,56,86,0,0,2,0,0,0,200,89,0,0,0,8,0,0,104,73,0,0,240,76,0,0,0,0,0,0,3,0,0,0,104,89,0,0,2,0,0,0,56,86,0,0,2,0,0,0,208,89,0,0,0,8,0,0,0,0,0,0,56,77,0,0,104,89,0,0,0,0,0,0,0,0,0,0,80,77,0,0,104,89,0,0,0,0,0,0,104,73,0,0,104,77,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,88,90,0,0,2,0,0,0,104,73,0,0,128,77,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,88,90,0,0,2,0,0,0,0,0,0,0,152,77,0,0,0,0,0,0,176,77,0,0,192,90,0,0,0,0,0,0,104,73,0,0,208,77,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,224,86,0,0,0,0,0,0,104,73,0,0,24,78,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,248,86,0,0,0,0,0,0,104,73,0,0,96,78,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,16,87,0,0,0,0,0,0,104,73,0,0,168,78,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,40,87,0,0,0,0,0,0,0,0,0,0,240,78,0,0,104,89,0,0,0,0,0,0,0,0,0,0,8,79,0,0,104,89,0,0,0,0,0,0,104,73,0,0,32,79,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,208,90,0,0,2,0,0,0,104,73,0,0,72,79,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,208,90,0,0,2,0,0,0,104,73,0,0,112,79,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,208,90,0,0,2,0,0,0,104,73,0,0,152,79,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,208,90,0,0,2,0,0,0,0,0,0,0,192,79,0,0,64,90,0,0,0,0,0,0,0,0,0,0,216,79,0,0,104,89,0,0,0,0,0,0,104,73,0,0,240,79,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,176,91,0,0,2,0,0,0,104,73,0,0,8,80,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,176,91,0,0,2,0,0,0,0,0,0,0,32,80,0,0,0,0,0,0,72,80,0,0,0,0,0,0,112,80,0,0,120,90,0,0,0,0,0,0,0,0,0,0,184,80,0,0,216,90,0,0,0,0,0,0,0,0,0,0,216,80,0,0,72,89,0,0,0,0,0,0,0,0,0,0,0,81,0,0,72,89,0,0,0,0,0,0,0,0,0,0,40,81,0,0,48,90,0,0,0,0,0,0,0,0,0,0,112,81,0,0,0,0,0,0,168,81,0,0,0,0,0,0,224,81,0,0,0,0,0,0,0,82,0,0,0,0,0,0,32,82,0,0,0,0,0,0,64,82,0,0,0,0,0,0,96,82,0,0,104,73,0,0,120,82,0,0,0,0,0,0,1,0,0,0,192,86,0,0,3,244,255,255,104,73,0,0,168,82,0,0,0,0,0,0,1,0,0,0,208,86,0,0,3,244,255,255,104,73,0,0,216,82,0,0,0,0,0,0,1,0,0,0,192,86,0,0,3,244,255,255,104,73,0,0,8,83,0,0,0,0,0,0,1,0,0,0,208,86,0,0,3,244,255,255,0,0,0,0,56,83,0,0,8,86,0,0,0,0,0,0,0,0,0,0,80,83,0,0,0,0,0,0,104,83,0,0,56,90,0,0,0,0,0,0,0,0,0,0,128,83,0,0,40,90,0,0,0,0,0,0,0,0,0,0,160,83,0,0,48,90,0,0,0,0,0,0,0,0,0,0,192,83,0,0,0,0,0,0,224,83,0,0,0,0,0,0,0,84,0,0,0,0,0,0,32,84,0,0,104,73,0,0,64,84,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,168,91,0,0,2,0,0,0,104,73,0,0,96,84,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,168,91,0,0,2,0,0,0,104,73,0,0,128,84,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,168,91,0,0,2,0,0,0,104,73,0,0,160,84,0,0,0,0,0,0,2,0,0,0,104,89,0,0,2,0,0,0,168,91,0,0,2,0,0,0,0,0,0,0,192,84,0,0,0,0,0,0,216,84,0,0,0,0,0,0,240,84,0,0,0,0,0,0,8,85,0,0,40,90,0,0,0,0,0,0,0,0,0,0,32,85,0,0,48,90,0,0,0,0,0,0,0,0,0,0,56,85,0,0,0,92,0,0,0,0,0,0,0,0,0,0,96,85,0,0,0,92,0,0,0,0,0,0,0,0,0,0,136,85,0,0,16,92,0,0,0,0,0,0,0,0,0,0,176,85,0,0,216,85,0,0,0,0,0,0,56,0,0,0,0,0,0,0,120,90,0,0,224,0,0,0,248,0,0,0,200,255,255,255,200,255,255,255,120,90,0,0,110,0,0,0,208,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0])
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
      }};function _clSetKernelArg(kernel, arg_index, arg_size, arg_value) {
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
  function _clGetKernelWorkGroupInfo(kernel, devices, param_name, param_value_size, param_value, param_value_size_ret) {
      var ker = CL.getArrayId(kernel);
      if (ker >= CL.kernels.length || ker < 0 ) {
        return -48; /* CL_INVALID_KERNEL */
      }
      // \todo the type is a number but why i except have a Array ??? Will must be an array ???
      var idx = CL.getArrayId(devices);
      if (idx >= CL.devices.length || idx < 0 ) {
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
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
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
  Module["_strcpy"] = _strcpy;
  function _log2(x) {
      return Math.log(x) / Math.LN2;
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
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function _clRetainContext() {
  Module['printErr']('missing function: clRetainContext'); abort(-1);
  }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
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
  function _clGetDeviceInfo(device, param_name, param_value_size, param_value, param_value_size_ret) {
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
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
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
  var _llvm_memset_p0i8_i64=_memset;
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP32[((ptr)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((ptr)+(4))>>2)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
    }
  function _clFinish(command_queue) {
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      try {
        CL.cmdQueue[queue].finish(); //Finish all the operations
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clFinish",e);
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
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
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
            var platforms = (CL.webcl_mozilla == 1) ? WebCL.getPlatformIDs() : WebCL.getPlatforms();
            if (platforms.length > 0) {
              CL.platforms.push(platforms[0]);
              plat = CL.platforms.length - 1;
            } else {
              return -32; /* CL_INVALID_PLATFORM */ 
            }      
        } else {
          plat = CL.getArrayId(platform);
        }
        var alldev = CL.getAllDevices(plat);
        // If devices_ids is not NULL, the num_entries must be greater than zero.
        if ((num_entries == 0 && device_type_i64_1 == 0) || (alldev.length == 0 && device_type_i64_1 == 0)) {
          return -30;/*CL_INVALID_VALUE*/
        }
        if ( alldev.length > 0 && device_type_i64_1 == 0) {
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
          var alldev = CL.getAllDevices(plat);
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
        for (var name in map) {
          CL.devices.push(map[name]);
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
                readprop = CL.getArrayId(HEAP32[(((properties)+(i*4))>>2)]);
                if (readprop >= CL.platforms.length || readprop < 0 ) {
                  HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
                  return 0; // Null pointer    
                } else {
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
        }
        if (num_devices > CL.devices.length || CL.devices.length == 0) {
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
        return CL.getNewId(CL.ctx.length-1);
      } catch (e) {    
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContext",e);
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
    }function _fgetc(stream) {
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
  var ___strtok_state=0;
  function _strtok_r(s, delim, lasts) {
      var skip_leading_delim = 1;
      var spanp;
      var c, sc;
      var tok;
      if (s == 0 && (s = getValue(lasts, 'i8*')) == 0) {
        return 0;
      }
      cont: while (1) {
        c = getValue(s++, 'i8');
        for (spanp = delim; (sc = getValue(spanp++, 'i8')) != 0;) {
          if (c == sc) {
            if (skip_leading_delim) {
              continue cont;
            } else {
              setValue(lasts, s, 'i8*');
              setValue(s - 1, 0, 'i8');
              return s - 1;
            }
          }
        }
        break;
      }
      if (c == 0) {
        setValue(lasts, 0, 'i8*');
        return 0;
      }
      tok = s - 1;
      for (;;) {
        c = getValue(s++, 'i8');
        spanp = delim;
        do {
          if ((sc = getValue(spanp++, 'i8')) == c) {
            if (c == 0) {
              s = 0;
            } else {
              setValue(s - 1, 0, 'i8');
            }
            setValue(lasts, s, 'i8*');
            return tok;
          }
        } while (sc != 0);
      }
      abort('strtok_r error!');
    }function _strtok(s, delim) {
      return _strtok_r(s, delim, ___strtok_state);
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
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
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
    }function _puts(s) {
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
  var _getc=_fgetc;
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
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
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
  var _llvm_va_start=undefined;
  function _asprintf(s, format, varargs) {
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
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
___buildEnvironment(ENV);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
___strtok_state = Runtime.staticAlloc(4);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var r=env._stderr|0;var s=env.___fsmu8|0;var t=env._stdout|0;var u=env.___dso_handle|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.min;var am=env.invoke_viiiii;var an=env.invoke_viiiiiii;var ao=env.invoke_vi;var ap=env.invoke_vii;var aq=env.invoke_iii;var ar=env.invoke_iiiiii;var as=env.invoke_ii;var at=env.invoke_iiii;var au=env.invoke_viiiiif;var av=env.invoke_viii;var aw=env.invoke_viiiiiiii;var ax=env.invoke_v;var ay=env.invoke_iiiiiiiii;var az=env.invoke_viiiiiiiii;var aA=env.invoke_viiiiiif;var aB=env.invoke_viiiiii;var aC=env.invoke_iiiii;var aD=env.invoke_viiii;var aE=env._llvm_lifetime_end;var aF=env.__scanString;var aG=env._pthread_mutex_lock;var aH=env.___cxa_end_catch;var aI=env.__isFloat;var aJ=env._strtoull;var aK=env._fflush;var aL=env._fputc;var aM=env._strtok;var aN=env._fwrite;var aO=env._send;var aP=env._fputs;var aQ=env._isspace;var aR=env._clReleaseCommandQueue;var aS=env._read;var aT=env._clGetContextInfo;var aU=env.___cxa_guard_abort;var aV=env._newlocale;var aW=env.___gxx_personality_v0;var aX=env._pthread_cond_wait;var aY=env.___cxa_rethrow;var aZ=env.___resumeException;var a_=env._strcmp;var a$=env._strncmp;var a0=env._vsscanf;var a1=env._snprintf;var a2=env._clGetDeviceIDs;var a3=env._fgetc;var a4=env.___errno_location;var a5=env._clReleaseContext;var a6=env._atexit;var a7=env._clCreateContext;var a8=env.___cxa_free_exception;var a9=env._fgets;var ba=env._clRetainContext;var bb=env.__Z8catcloseP8_nl_catd;var bc=env._clCreateBuffer;var bd=env.___setErrNo;var be=env._isxdigit;var bf=env._exit;var bg=env._sprintf;var bh=env.___ctype_b_loc;var bi=env._freelocale;var bj=env.__Z7catopenPKci;var bk=env._log2;var bl=env.__isLeapYear;var bm=env._asprintf;var bn=env.___cxa_is_number_type;var bo=env.___cxa_does_inherit;var bp=env.___cxa_guard_acquire;var bq=env.___locale_mb_cur_max;var br=env.___cxa_begin_catch;var bs=env._recv;var bt=env.__parseInt64;var bu=env.__ZSt18uncaught_exceptionv;var bv=env.___cxa_call_unexpected;var bw=env._clFinish;var bx=env.__exit;var by=env._strftime;var bz=env._rand;var bA=env.___cxa_throw;var bB=env._clReleaseKernel;var bC=env._llvm_eh_exception;var bD=env._printf;var bE=env._pread;var bF=env._fopen;var bG=env._open;var bH=env.__arraySum;var bI=env._puts;var bJ=env._clGetDeviceInfo;var bK=env._clEnqueueNDRangeKernel;var bL=env._clReleaseProgram;var bM=env.___cxa_find_matching_catch;var bN=env._clSetKernelArg;var bO=env.__formatString;var bP=env._pthread_cond_broadcast;var bQ=env._getenv;var bR=env._clEnqueueReadBuffer;var bS=env.__ZSt9terminatev;var bT=env._gettimeofday;var bU=env._pthread_mutex_unlock;var bV=env._sbrk;var bW=env._clReleaseMemObject;var bX=env._strerror;var bY=env._llvm_lifetime_start;var bZ=env._clGetProgramBuildInfo;var b_=env.___cxa_guard_release;var b$=env._ungetc;var b0=env._vsprintf;var b1=env._uselocale;var b2=env._vsnprintf;var b3=env._sscanf;var b4=env._sysconf;var b5=env._fread;var b6=env._strtok_r;var b7=env._abort;var b8=env._fprintf;var b9=env._isdigit;var ca=env._strtoll;var cb=env.___buildEnvironment;var cc=env.__reallyNegative;var cd=env._clCreateCommandQueue;var ce=env._clBuildProgram;var cf=env._clGetKernelWorkGroupInfo;var cg=env.__Z7catgetsP8_nl_catdiiPKc;var ch=env.__addDays;var ci=env._write;var cj=env.___cxa_allocate_exception;var ck=env.___cxa_pure_virtual;var cl=env._clCreateKernel;var cm=env._vasprintf;var cn=env._clCreateProgramWithSource;var co=env.___ctype_toupper_loc;var cp=env.___ctype_tolower_loc;var cq=env._llvm_va_end;var cr=env.___assert_func;var cs=env._pwrite;var ct=env._strerror_r;var cu=env._time;
// EMSCRIPTEN_START_FUNCS
function cN(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function cO(){return i|0}function cP(a){a=a|0;i=a}function cQ(a,b){a=a|0;b=b|0;if((x|0)==0){x=a;y=b}}function cR(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function cS(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function cT(a){a=a|0;K=a}function cU(a){a=a|0;L=a}function cV(a){a=a|0;M=a}function cW(a){a=a|0;N=a}function cX(a){a=a|0;O=a}function cY(a){a=a|0;P=a}function cZ(a){a=a|0;Q=a}function c_(a){a=a|0;R=a}function c$(a){a=a|0;S=a}function c0(a){a=a|0;T=a}function c1(){c[q+8>>2]=260;c[q+12>>2]=132;c[q+16>>2]=66;c[q+20>>2]=154;c[q+24>>2]=8;c[q+28>>2]=10;c[q+32>>2]=2;c[q+36>>2]=4;c[p+8>>2]=260;c[p+12>>2]=254;c[p+16>>2]=66;c[p+20>>2]=154;c[p+24>>2]=8;c[p+28>>2]=28;c[p+32>>2]=4;c[p+36>>2]=10;c[5494]=p+8;c[5496]=p+8;c[5498]=q+8;c[5502]=q+8;c[5506]=q+8;c[5510]=q+8;c[5514]=q+8;c[5518]=p+8;c[5552]=q+8;c[5556]=q+8;c[5620]=q+8;c[5624]=q+8;c[5644]=p+8;c[5646]=q+8;c[5682]=q+8;c[5686]=q+8;c[5722]=q+8;c[5726]=q+8;c[5746]=p+8;c[5748]=p+8;c[5750]=q+8;c[5754]=q+8;c[5758]=q+8;c[5762]=q+8;c[5766]=q+8;c[5770]=p+8;c[5772]=p+8;c[5774]=p+8;c[5776]=p+8;c[5778]=p+8;c[5780]=p+8;c[5782]=p+8;c[5808]=q+8;c[5812]=p+8;c[5814]=q+8;c[5818]=q+8;c[5822]=q+8;c[5826]=p+8;c[5828]=p+8;c[5830]=p+8;c[5832]=p+8;c[5866]=p+8;c[5868]=p+8;c[5870]=p+8;c[5872]=q+8;c[5876]=q+8;c[5880]=q+8;c[5884]=q+8;c[5888]=q+8;c[5892]=q+8}function c2(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;k=i;i=i+56|0;j=k|0;h=k+8|0;l=k+16|0;m=k+24|0;n=k+32|0;o=k+40|0;c[h>>2]=e;if((c[b+20>>2]|0)!=1){p=-30;i=k;return p|0}e=(f|0)==(g|0);c[j>>2]=0;q=b+44|0;r=c[q>>2]|0;do{if((r|0)==0){s=0}else{t=b+48|0;if((c[t>>2]|0)==(d|0)){s=r;break}c[t>>2]=d;t=c[b+8>>2]|0;u=c[b+12>>2]|0;v=ag(ag(ag(d<<3,c[b+4>>2]|0)|0,t)|0,u)|0;u=b+52|0;t=c[u>>2]|0;if((t|0)!=0){bW(t|0)|0}c[u>>2]=bc(c[b>>2]|0,1,0,v|0,0,j|0)|0;v=c[j>>2]|0;if((v|0)==0){s=c[q>>2]|0;break}else{p=v;i=k;return p|0}}}while(0);c[o>>2]=f;f=o+4|0;c[f>>2]=g;c[o+8>>2]=c[b+52>>2];g=c[b+32>>2]|0;q=c[b+36>>2]&1;if((s|0)==0){if((g|0)==0){p=0;i=k;return p|0}s=f;f=h;j=l;r=b+64|0;v=b+4|0;u=b+8|0;t=b+12|0;w=g;x=0;while(1){c[l>>2]=d;y=c[w+16>>2]|0;c[n>>2]=y;z=c[w+12>>2]|0;A=c[w+20>>2]|0;do{if((A|0)==0){B=(c[v>>2]|0)>>>0>(c[r>>2]|0)>>>0;C=ag(ag(c[t>>2]|0,c[u>>2]|0)|0,d)|0;c[l>>2]=C;if(B){D=ag(C,z)|0;break}else{D=(((C|0)%(z|0)|0|0)!=0)+((C|0)/(z|0)|0)|0;break}}else if((A|0)==1){C=ag(c[t>>2]|0,d)|0;c[l>>2]=C;D=ag(C,z)|0}else if((A|0)==2){D=ag(z,d)|0}else{D=z}}while(0);c[m>>2]=ag(y,D)|0;z=w|0;A=bN(c[z>>2]|0,0,4,o+(x<<2)|0)|0;C=bN(c[z>>2]|0,1,4,s|0)|0|A;A=C|(bN(c[z>>2]|0,2,4,f|0)|0);C=A|(bN(c[z>>2]|0,3,4,j|0)|0);A=C|(bK(a|0,c[z>>2]|0,1,0,m|0,n|0,0,0,0)|0);if((A|0)!=0){p=A;E=48;break}A=c[w+28>>2]|0;if((A|0)==0){p=0;E=49;break}else{w=A;x=1}}if((E|0)==48){i=k;return p|0}else if((E|0)==49){i=k;return p|0}}x=e&1;w=e?2:2-q|0;if((g|0)==0){p=0;i=k;return p|0}j=h;h=l;f=b+64|0;s=b+4|0;D=b+8|0;t=b+12|0;if(e&(q|0)!=0){F=0;G=g;H=x;I=w}else{q=g;g=x;x=w;while(1){c[l>>2]=d;w=c[q+16>>2]|0;c[n>>2]=w;e=c[q+12>>2]|0;b=c[q+20>>2]|0;do{if((b|0)==0){u=(c[s>>2]|0)>>>0>(c[f>>2]|0)>>>0;r=ag(ag(c[t>>2]|0,c[D>>2]|0)|0,d)|0;c[l>>2]=r;if(u){J=ag(r,e)|0;break}else{J=(((r|0)%(e|0)|0|0)!=0)+((r|0)/(e|0)|0)|0;break}}else if((b|0)==1){r=ag(c[t>>2]|0,d)|0;c[l>>2]=r;J=ag(r,e)|0}else if((b|0)==2){J=ag(e,d)|0}else{J=e}}while(0);c[m>>2]=ag(w,J)|0;e=q|0;b=bN(c[e>>2]|0,0,4,o+(g<<2)|0)|0;y=bN(c[e>>2]|0,1,4,o+(x<<2)|0)|0|b;b=y|(bN(c[e>>2]|0,2,4,j|0)|0);y=b|(bN(c[e>>2]|0,3,4,h|0)|0);b=y|(bK(a|0,c[e>>2]|0,1,0,m|0,n|0,0,0,0)|0);if((b|0)!=0){p=b;E=46;break}b=(x|0)==1;e=c[q+28>>2]|0;if((e|0)==0){p=0;E=47;break}else{q=e;g=b?1:2;x=b?2:1}}if((E|0)==46){i=k;return p|0}else if((E|0)==47){i=k;return p|0}}while(1){if((F|0)==0){x=(c[G+24>>2]|0)==0;K=x?I:H;L=x&1^1}else{K=I;L=F}c[l>>2]=d;x=c[G+16>>2]|0;c[n>>2]=x;g=c[G+12>>2]|0;q=c[G+20>>2]|0;do{if((q|0)==2){M=ag(g,d)|0}else if((q|0)==1){J=ag(c[t>>2]|0,d)|0;c[l>>2]=J;M=ag(J,g)|0}else if((q|0)==0){J=(c[s>>2]|0)>>>0>(c[f>>2]|0)>>>0;b=ag(ag(c[t>>2]|0,c[D>>2]|0)|0,d)|0;c[l>>2]=b;if(J){M=ag(b,g)|0;break}else{M=(((b|0)%(g|0)|0|0)!=0)+((b|0)/(g|0)|0)|0;break}}else{M=g}}while(0);c[m>>2]=ag(x,M)|0;g=G|0;q=bN(c[g>>2]|0,0,4,o+(H<<2)|0)|0;w=bN(c[g>>2]|0,1,4,o+(K<<2)|0)|0|q;q=w|(bN(c[g>>2]|0,2,4,j|0)|0);w=q|(bN(c[g>>2]|0,3,4,h|0)|0);q=w|(bK(a|0,c[g>>2]|0,1,0,m|0,n|0,0,0,0)|0);if((q|0)!=0){p=q;E=44;break}q=(K|0)==1;g=c[G+28>>2]|0;if((g|0)==0){p=0;E=45;break}else{F=L;G=g;H=q?1:2;I=q?2:1}}if((E|0)==44){i=k;return p|0}else if((E|0)==45){i=k;return p|0}return 0}function c3(a,b,d,e,f,g,h,j,k,l,m){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;m=i;i=i+80|0;l=m|0;k=m+8|0;n=m+16|0;o=m+24|0;p=m+32|0;q=m+40|0;r=m+48|0;s=m+64|0;c[n>>2]=e;if((c[b+20>>2]|0)!=0){t=-30;i=m;return t|0}e=(f|0)==(h|0)&(g|0)==(j|0);c[l>>2]=0;u=b+44|0;v=c[u>>2]|0;do{if((v|0)==0){w=0}else{x=b+48|0;if((c[x>>2]|0)==(d|0)){w=v;break}c[x>>2]=d;x=c[b+8>>2]|0;y=c[b+12>>2]|0;z=ag(ag(ag(d<<2,c[b+4>>2]|0)|0,x)|0,y)|0;y=b+56|0;x=c[y>>2]|0;if((x|0)!=0){bW(x|0)|0}x=b+60|0;A=c[x>>2]|0;if((A|0)!=0){bW(A|0)|0}A=b;c[y>>2]=bc(c[A>>2]|0,1,0,z|0,0,l|0)|0;c[x>>2]=bc(c[A>>2]|0,1,0,z|0,0,k|0)|0;z=c[l>>2]|c[k>>2];c[l>>2]=z;if((z|0)==0){w=c[u>>2]|0;break}else{t=z;i=m;return t|0}}}while(0);c[r>>2]=f;f=r+4|0;c[f>>2]=h;c[r+8>>2]=c[b+56>>2];c[s>>2]=g;g=s+4|0;c[g>>2]=j;c[s+8>>2]=c[b+60>>2];j=c[b+32>>2]|0;h=c[b+36>>2]&1;if((w|0)==0){if((j|0)==0){t=0;i=m;return t|0}w=f;f=g;g=n;u=o;l=b+64|0;k=b+4|0;v=b+8|0;z=b+12|0;A=j;x=0;while(1){c[o>>2]=d;y=c[A+16>>2]|0;c[q>>2]=y;B=c[A+12>>2]|0;C=c[A+20>>2]|0;do{if((C|0)==0){D=(c[k>>2]|0)>>>0>(c[l>>2]|0)>>>0;E=ag(ag(c[z>>2]|0,c[v>>2]|0)|0,d)|0;c[o>>2]=E;if(D){F=ag(E,B)|0;break}else{F=(((E|0)%(B|0)|0|0)!=0)+((E|0)/(B|0)|0)|0;break}}else if((C|0)==1){E=ag(c[z>>2]|0,d)|0;c[o>>2]=E;F=ag(E,B)|0}else if((C|0)==2){F=ag(B,d)|0}else{F=B}}while(0);c[p>>2]=ag(y,F)|0;B=A|0;C=bN(c[B>>2]|0,0,4,r+(x<<2)|0)|0;E=bN(c[B>>2]|0,1,4,s+(x<<2)|0)|0|C;C=E|(bN(c[B>>2]|0,2,4,w|0)|0);E=C|(bN(c[B>>2]|0,3,4,f|0)|0);C=E|(bN(c[B>>2]|0,4,4,g|0)|0);E=C|(bN(c[B>>2]|0,5,4,u|0)|0);C=E|(bK(a|0,c[B>>2]|0,1,0,p|0,q|0,0,0,0)|0);if((C|0)!=0){t=C;G=95;break}C=c[A+28>>2]|0;if((C|0)==0){t=0;G=96;break}else{A=C;x=1}}if((G|0)==95){i=m;return t|0}else if((G|0)==96){i=m;return t|0}}x=e&1;A=e?2:2-h|0;if((j|0)==0){t=0;i=m;return t|0}u=n;n=o;g=b+64|0;f=b+4|0;w=b+8|0;F=b+12|0;if(e&(h|0)!=0){H=0;I=j;J=x;K=A}else{h=j;j=x;x=A;while(1){c[o>>2]=d;A=c[h+16>>2]|0;c[q>>2]=A;e=c[h+12>>2]|0;b=c[h+20>>2]|0;do{if((b|0)==0){z=(c[f>>2]|0)>>>0>(c[g>>2]|0)>>>0;v=ag(ag(c[F>>2]|0,c[w>>2]|0)|0,d)|0;c[o>>2]=v;if(z){L=ag(v,e)|0;break}else{L=(((v|0)%(e|0)|0|0)!=0)+((v|0)/(e|0)|0)|0;break}}else if((b|0)==1){v=ag(c[F>>2]|0,d)|0;c[o>>2]=v;L=ag(v,e)|0}else if((b|0)==2){L=ag(e,d)|0}else{L=e}}while(0);c[p>>2]=ag(A,L)|0;e=h|0;b=bN(c[e>>2]|0,0,4,r+(j<<2)|0)|0;y=bN(c[e>>2]|0,1,4,s+(j<<2)|0)|0|b;b=y|(bN(c[e>>2]|0,2,4,r+(x<<2)|0)|0);y=b|(bN(c[e>>2]|0,3,4,s+(x<<2)|0)|0);b=y|(bN(c[e>>2]|0,4,4,u|0)|0);y=b|(bN(c[e>>2]|0,5,4,n|0)|0);b=y|(bK(a|0,c[e>>2]|0,1,0,p|0,q|0,0,0,0)|0);if((b|0)!=0){t=b;G=93;break}b=(x|0)==1;e=c[h+28>>2]|0;if((e|0)==0){t=0;G=94;break}else{h=e;j=b?1:2;x=b?2:1}}if((G|0)==93){i=m;return t|0}else if((G|0)==94){i=m;return t|0}}while(1){if((H|0)==0){x=(c[I+24>>2]|0)==0;M=x?K:J;N=x&1^1}else{M=K;N=H}c[o>>2]=d;x=c[I+16>>2]|0;c[q>>2]=x;j=c[I+12>>2]|0;h=c[I+20>>2]|0;do{if((h|0)==1){L=ag(c[F>>2]|0,d)|0;c[o>>2]=L;O=ag(L,j)|0}else if((h|0)==0){L=(c[f>>2]|0)>>>0>(c[g>>2]|0)>>>0;b=ag(ag(c[F>>2]|0,c[w>>2]|0)|0,d)|0;c[o>>2]=b;if(L){O=ag(b,j)|0;break}else{O=(((b|0)%(j|0)|0|0)!=0)+((b|0)/(j|0)|0)|0;break}}else if((h|0)==2){O=ag(j,d)|0}else{O=j}}while(0);c[p>>2]=ag(x,O)|0;j=I|0;h=bN(c[j>>2]|0,0,4,r+(J<<2)|0)|0;A=bN(c[j>>2]|0,1,4,s+(J<<2)|0)|0|h;h=A|(bN(c[j>>2]|0,2,4,r+(M<<2)|0)|0);A=h|(bN(c[j>>2]|0,3,4,s+(M<<2)|0)|0);h=A|(bN(c[j>>2]|0,4,4,u|0)|0);A=h|(bN(c[j>>2]|0,5,4,n|0)|0);h=A|(bK(a|0,c[j>>2]|0,1,0,p|0,q|0,0,0,0)|0);if((h|0)!=0){t=h;G=91;break}h=(M|0)==1;j=c[I+28>>2]|0;if((j|0)==0){t=0;G=92;break}else{H=N;I=j;J=h?1:2;K=h?2:1}}if((G|0)==91){i=m;return t|0}else if((G|0)==92){i=m;return t|0}return 0}function c4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+48|0;e=d|0;f=d+40|0;if((b|0)==0){g=a+4|0;h=c[g>>2]|0;if(h>>>0>(c[a+64>>2]|0)>>>0){c5(a,h,1,0);i=d;return}if(h>>>0<=1){i=d;return}j=e|0;if((h|0)==32){c[f>>2]=2;c[j>>2]=8;c[e+4>>2]=4;k=8}else if((h|0)==64){c[f>>2]=2;c[j>>2]=8;c[e+4>>2]=8;k=8}else if((h|0)==128){c[f>>2]=3;c[j>>2]=8;c[e+4>>2]=4;c[e+8>>2]=4;k=8}else if((h|0)==256){c[f>>2]=4;c[j>>2]=4;c[e+4>>2]=4;c[e+8>>2]=4;c[e+12>>2]=4;k=4}else if((h|0)==512){c[f>>2]=3;c[j>>2]=8;c[e+4>>2]=8;c[e+8>>2]=8;k=8}else if((h|0)==1024){c[f>>2]=3;c[j>>2]=16;c[e+4>>2]=16;c[e+8>>2]=4;k=16}else if((h|0)==2){c[f>>2]=1;c[j>>2]=2;k=2}else if((h|0)==4){c[f>>2]=1;c[j>>2]=4;k=4}else if((h|0)==8){c[f>>2]=1;c[j>>2]=8;k=8}else if((h|0)==16){c[f>>2]=2;c[j>>2]=8;c[e+4>>2]=2;k=8}else if((h|0)==2048){c[f>>2]=4;c[j>>2]=8;c[e+4>>2]=8;c[e+8>>2]=8;c[e+12>>2]=4;k=8}else{c[f>>2]=0;k=0}e=a+68|0;if(((h>>>0)/(k>>>0)|0)>>>0<=(c[e>>2]|0)>>>0){c7(a);i=d;return}c6(h,j,f,c[a+72>>2]|0);f=c[g>>2]|0;if(((f>>>0)/((c[j>>2]|0)>>>0)|0)>>>0>(c[e>>2]|0)>>>0){c5(a,f,1,0);i=d;return}else{c7(a);i=d;return}}else if((b|0)==1){f=c[a+8>>2]|0;if(f>>>0<=1){i=d;return}c5(a,f,c[a+4>>2]|0,1);i=d;return}else if((b|0)==2){b=c[a+12>>2]|0;if(b>>>0<=1){i=d;return}c5(a,b,ag(c[a+8>>2]|0,c[a+4>>2]|0)|0,2);i=d;return}else{i=d;return}}function c5(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,c9=0,da=0,db=0,dd=0,de=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dz=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ey=0,ez=0,eA=0,eC=0,eD=0,eE=0,eF=0,eG=0,eH=0,eJ=0,eK=0,eL=0,eM=0,eN=0,eO=0,eP=0,eQ=0,eR=0,eS=0,eT=0,eU=0,eV=0,eW=0,eX=0,eY=0,eZ=0,e_=0,e$=0,e0=0,e1=0,e2=0,e3=0,e4=0,e5=0,e6=0,e7=0,e8=0,e9=0,fa=0,fb=0,fc=0,fd=0,fe=0,ff=0,fg=0,fh=0,fi=0,fj=0,fk=0,fl=0,fm=0,fn=0,fo=0,fp=0,fq=0,fr=0,fs=0,ft=0,fu=0,fv=0,fw=0,fx=0,fy=0,fz=0,fA=0,fB=0,fC=0,fD=0,fE=0,fF=0,fG=0,fH=0,fI=0,fJ=0,fK=0,fL=0,fM=0,fN=0,fO=0,fP=0,fQ=0,fR=0,fS=0,fT=0,fU=0,fV=0,fW=0,fX=0,fY=0,fZ=0,f_=0,f$=0,f0=0,f1=0,f2=0,f3=0,f4=0,f5=0,f6=0,f7=0,f8=0,f9=0,ga=0,gb=0,gc=0,gd=0,ge=0,gf=0,gg=0,gh=0,gi=0,gj=0,gk=0,gl=0,gm=0,gn=0,go=0,gp=0,gq=0,gr=0,gs=0,gt=0,gu=0,gv=0,gw=0,gx=0,gy=0,gz=0,gA=0,gB=0,gC=0,gD=0.0,gE=0,gF=0,gG=0,gH=0,gI=0,gJ=0,gK=0,gL=0,gM=0,gN=0,gO=0,gP=0,gQ=0,gR=0,gS=0,gT=0,gU=0,gV=0,gW=0,gX=0,gY=0,gZ=0,g_=0,g$=0,g0=0,g1=0,g2=0,g3=0,g4=0,g5=0,g6=0,g7=0,g8=0,g9=0,ha=0,hb=0,hc=0,hd=0,he=0,hf=0,hg=0,hh=0,hi=0,hj=0,hk=0,hl=0,hm=0,hn=0,ho=0,hp=0,hq=0,hr=0,hs=0,ht=0,hu=0,hv=0,hw=0,hx=0,hy=0,hz=0,hA=0,hB=0,hC=0,hD=0,hE=0,hF=0,hG=0,hH=0,hI=0,hJ=0,hK=0,hL=0,hM=0,hN=0,hO=0,hP=0,hQ=0,hR=0,hS=0,hT=0,hU=0,hV=0,hW=0,hX=0,hY=0,hZ=0,h_=0,h$=0,h0=0,h1=0,h2=0,h3=0,h4=0,h5=0,h6=0,h7=0,h8=0,h9=0,ia=0,ib=0,ic=0,id=0,ie=0,ig=0,ih=0,ii=0,ij=0,ik=0,il=0,im=0,io=0,ip=0,iq=0,ir=0,is=0,it=0,iu=0,iv=0,iw=0,ix=0,iy=0,iz=0,iA=0,iB=0,iC=0,iD=0,iE=0,iF=0,iG=0,iH=0,iI=0,iJ=0,iK=0,iL=0,iM=0,iN=0,iO=0,iP=0,iQ=0,iR=0,iS=0,iT=0,iU=0,iV=0,iW=0,iX=0,iY=0,iZ=0,i_=0,i$=0,i0=0,i1=0,i2=0,i3=0,i4=0,i5=0,i6=0,i7=0,i8=0,i9=0,ja=0,jb=0,jc=0,jd=0,je=0,jf=0,jg=0,jh=0,ji=0,jj=0,jk=0,jl=0,jm=0,jn=0,jo=0,jp=0,jq=0,jr=0,js=0,jt=0,ju=0,jv=0,jw=0,jx=0,jy=0,jz=0,jA=0,jB=0,jC=0,jD=0,jE=0,jF=0,jG=0,jH=0,jI=0,jJ=0,jK=0,jL=0,jM=0,jN=0,jO=0,jP=0,jQ=0,jR=0,jS=0,jT=0,jU=0,jV=0,jW=0,jX=0,jY=0,jZ=0,j_=0,j$=0,j0=0,j1=0,j2=0,j3=0,j4=0,j5=0,j6=0,j7=0,j8=0,j9=0,ka=0,kb=0,kc=0,kd=0,ke=0,kf=0,kg=0,kh=0,ki=0,kj=0,kk=0,kl=0,km=0,kn=0,ko=0,kp=0,kq=0,kr=0,ks=0,kt=0,ku=0,kv=0,kw=0,kx=0,ky=0,kz=0,kA=0,kB=0,kC=0,kD=0,kE=0,kF=0,kG=0,kH=0,kI=0,kJ=0,kK=0,kL=0,kM=0,kN=0,kO=0,kP=0,kQ=0,kR=0,kS=0,kT=0,kU=0,kV=0,kW=0,kX=0,kY=0,kZ=0,k_=0,k$=0,k0=0,k1=0,k2=0,k3=0,k4=0,k5=0,k6=0,k7=0,k8=0,k9=0,la=0,lb=0,lc=0,ld=0,le=0,lf=0,lg=0,lh=0,li=0,lj=0,ll=0,lm=0,ln=0,lo=0,lp=0,lq=0,lr=0,ls=0,lt=0,lu=0,lv=0,lw=0,lx=0,ly=0,lz=0,lD=0,lE=0,lF=0,lG=0,lH=0,lI=0,lJ=0,lK=0,lL=0,lM=0,lN=0,lO=0,lP=0,lQ=0,lR=0,lS=0,lT=0,lU=0,lV=0,lW=0,lX=0,lY=0,lZ=0,l_=0,l$=0,l0=0,l1=0,l2=0,l3=0,l4=0,l5=0,l6=0,l7=0,l8=0,l9=0,ma=0,mb=0,mc=0,md=0,me=0,mf=0,mg=0,mh=0,mi=0,mj=0,mk=0,ml=0,mm=0,mn=0,mo=0,mp=0,mq=0,mr=0,ms=0,mt=0,mu=0,mv=0,mw=0,mx=0,my=0,mz=0,mA=0,mB=0,mC=0,mD=0,mE=0,mF=0,mG=0,mH=0,mI=0,mJ=0,mK=0,mL=0,mM=0,mN=0,mO=0,mP=0,mQ=0,mR=0,mS=0,mT=0,mU=0,mV=0,mW=0,mX=0,mY=0,mZ=0,m_=0,m$=0,m0=0,m1=0,m2=0,m3=0,m4=0,m5=0,m6=0,m7=0,m8=0,m9=0,na=0,nb=0,nc=0,nd=0,ne=0,nf=0,ng=0,nh=0,ni=0,nj=0,nk=0,nl=0,nm=0,nn=0,no=0,np=0,nq=0,nr=0,ns=0,nt=0,nu=0,nv=0,nw=0,nx=0,ny=0,nz=0,nA=0,nB=0,nC=0,nD=0,nE=0,nF=0,nG=0,nH=0,nI=0,nJ=0,nK=0,nL=0,nM=0,nN=0,nO=0,nP=0,nQ=0,nR=0,nS=0,nT=0,nU=0,nV=0,nW=0,nX=0,nY=0,nZ=0,n_=0,n$=0,n0=0,n1=0,n2=0,n3=0,n4=0,n5=0,n6=0,n7=0,n8=0,n9=0,oa=0,ob=0,oc=0,od=0,oe=0,of=0,og=0,oh=0,oi=0,oj=0,ok=0,ol=0,om=0,on=0,oo=0,op=0,oq=0,or=0,os=0,ot=0,ou=0,ov=0,ow=0,ox=0,oy=0,oz=0,oA=0,oB=0,oC=0,oD=0,oE=0,oF=0,oG=0,oH=0,oI=0,oJ=0,oK=0,oL=0,oM=0,oN=0,oO=0,oP=0,oQ=0,oR=0,oS=0,oT=0,oU=0,oV=0,oW=0,oX=0,oY=0,oZ=0,o_=0,o$=0,o0=0,o1=0,o2=0,o3=0,o4=0,o5=0,o6=0,o7=0,o8=0,o9=0,pa=0,pb=0,pc=0,pd=0,pe=0,pf=0,pg=0,ph=0,pi=0,pj=0,pk=0,pl=0,pm=0,pn=0,po=0,pp=0,pq=0,pr=0,ps=0,pt=0,pu=0,pv=0,pw=0,px=0,py=0,pz=0,pA=0,pB=0,pC=0,pD=0,pE=0,pF=0,pG=0,pH=0,pI=0,pJ=0,pK=0,pL=0,pM=0,pN=0,pO=0,pP=0,pQ=0,pR=0,pS=0,pT=0,pU=0,pV=0,pW=0,pX=0,pY=0,pZ=0,p_=0,p$=0,p0=0,p1=0,p2=0,p3=0,p4=0,p5=0,p6=0,p7=0,p8=0,p9=0,qa=0,qb=0,qc=0,qd=0,qe=0,qf=0,qg=0,qh=0,qi=0,qj=0,qk=0,ql=0,qm=0,qn=0,qo=0,qp=0,qq=0,qr=0,qs=0,qt=0,qu=0,qv=0,qw=0,qx=0,qy=0,qz=0,qA=0,qB=0,qC=0,qD=0,qE=0,qF=0,qG=0,qH=0,qI=0,qJ=0,qK=0,qL=0,qM=0,qN=0,qO=0,qP=0,qQ=0,qR=0,qS=0,qT=0,qU=0,qV=0,qW=0,qX=0,qY=0,qZ=0,q_=0,q$=0,q0=0,q1=0,q2=0,q3=0,q4=0,q5=0,q6=0,q7=0,q8=0,q9=0,ra=0,rb=0,rc=0,rd=0,re=0,rf=0,rg=0,rh=0,ri=0,rj=0,rk=0,rl=0,rm=0,rn=0,ro=0,rp=0,rq=0,rr=0,rs=0,rt=0,ru=0,rv=0,rw=0,rx=0,ry=0,rz=0,rA=0,rB=0,rC=0,rD=0,rE=0,rF=0,rG=0,rH=0,rI=0,rJ=0,rK=0,rL=0,rM=0,rN=0,rO=0,rP=0,rQ=0,rR=0,rS=0,rT=0,rU=0,rV=0,rW=0,rX=0,rY=0,rZ=0,r_=0,r$=0,r0=0,r1=0,r2=0,r3=0,r4=0,r5=0,r6=0,r7=0,r8=0,r9=0,sa=0,sb=0,sc=0,sd=0,se=0,sf=0,sg=0,sh=0,si=0,sj=0,sk=0,sl=0,sm=0,sn=0,so=0,sp=0,sq=0,sr=0,ss=0,st=0,su=0,sv=0,sw=0,sx=0,sy=0,sz=0,sA=0,sB=0,sC=0,sD=0,sE=0,sF=0,sG=0,sH=0,sI=0,sJ=0,sK=0,sL=0,sM=0,sN=0,sO=0,sP=0,sQ=0,sR=0,sS=0,sT=0,sU=0,sV=0,sW=0,sX=0,sY=0,sZ=0,s_=0,s$=0,s0=0,s1=0,s2=0,s3=0,s4=0,s5=0,s6=0,s7=0,s8=0,s9=0,ta=0,tb=0,tc=0,td=0,te=0,tf=0,tg=0,th=0,ti=0,tj=0,tk=0,tl=0,tm=0,tn=0,to=0,tp=0,tq=0,tr=0,ts=0,tt=0,tu=0,tv=0,tw=0,tx=0,ty=0,tz=0,tA=0,tB=0,tC=0,tD=0,tE=0,tF=0,tG=0,tH=0,tI=0,tJ=0,tK=0,tL=0,tM=0,tN=0,tO=0,tP=0,tQ=0,tR=0,tS=0,tT=0,tU=0,tV=0,tW=0,tX=0,tY=0,tZ=0,t_=0,t$=0,t0=0,t1=0,t2=0,t3=0,t4=0,t5=0,t6=0,t7=0,t8=0,t9=0,ua=0,ub=0,uc=0,ud=0,ue=0,uf=0,ug=0,uh=0,ui=0,uj=0,uk=0,ul=0,um=0,un=0,uo=0,up=0,uq=0,ur=0,us=0,ut=0,uu=0,uv=0,uw=0,ux=0,uy=0,uz=0,uA=0,uB=0,uC=0,uD=0,uE=0,uF=0,uG=0,uH=0,uI=0,uJ=0,uK=0,uL=0,uM=0,uN=0,uO=0,uP=0,uQ=0,uR=0,uS=0,uT=0,uU=0,uV=0,uW=0,uX=0,uY=0,uZ=0,u_=0,u$=0,u0=0,u1=0,u2=0,u3=0,u4=0,u5=0,u6=0,u7=0,u8=0,u9=0,va=0,vb=0,vc=0,vd=0,ve=0,vf=0,vg=0,vh=0,vi=0,vj=0,vk=0,vl=0,vm=0,vn=0,vo=0,vp=0,vq=0,vr=0,vs=0,vt=0,vu=0,vv=0,vw=0,vx=0,vy=0,vz=0,vA=0,vB=0,vC=0,vD=0,vE=0,vF=0,vG=0,vH=0,vI=0,vJ=0,vK=0,vL=0,vM=0,vN=0,vO=0,vP=0,vQ=0,vR=0,vS=0,vT=0,vU=0,vV=0,vW=0,vX=0,vY=0,vZ=0,v_=0,v$=0,v0=0,v1=0,v2=0,v3=0,v4=0,v5=0,v6=0,v7=0,v8=0,v9=0,wa=0,wb=0,wc=0,wd=0,we=0,wf=0,wg=0,wh=0,wi=0,wj=0,wk=0,wl=0,wm=0,wn=0,wo=0,wp=0,wq=0,wr=0,ws=0,wt=0,wu=0,wv=0,ww=0,wx=0,wy=0,wz=0,wA=0,wB=0,wC=0,wD=0,wE=0,wF=0,wG=0,wH=0,wI=0,wJ=0,wK=0,wL=0,wM=0,wN=0,wO=0,wP=0,wQ=0,wR=0,wS=0,wT=0,wU=0,wV=0,wW=0,wX=0,wY=0,wZ=0,w_=0,w$=0,w0=0,w1=0,w2=0,w3=0,w4=0,w5=0,w6=0,w7=0,w8=0,w9=0,xa=0,xb=0,xc=0,xd=0,xe=0,xf=0,xg=0,xh=0,xi=0,xj=0,xk=0,xl=0,xm=0,xn=0,xo=0,xp=0,xq=0,xr=0,xs=0,xt=0,xu=0,xv=0,xw=0,xx=0,xy=0,xz=0,xA=0,xB=0,xC=0,xD=0,xE=0,xF=0,xG=0,xH=0,xI=0,xJ=0,xK=0,xL=0,xM=0,xN=0,xO=0,xP=0,xQ=0,xR=0,xS=0,xT=0,xU=0,xV=0,xW=0,xX=0,xY=0,xZ=0,x_=0,x$=0,x0=0,x1=0,x2=0,x3=0,x4=0,x5=0,x6=0,x7=0,x8=0,x9=0,ya=0,yb=0,yc=0,yd=0,ye=0,yf=0,yg=0,yh=0,yi=0,yj=0,yk=0,yl=0,ym=0,yn=0,yo=0,yp=0,yq=0,yr=0,ys=0,yt=0,yu=0,yv=0,yw=0,yx=0,yy=0,yz=0,yA=0,yB=0,yC=0,yD=0,yE=0,yF=0,yG=0,yH=0,yI=0,yJ=0,yK=0,yL=0,yM=0,yN=0,yO=0,yP=0,yQ=0,yR=0,yS=0,yT=0,yU=0,yV=0,yW=0,yX=0,yY=0,yZ=0,y_=0,y$=0,y0=0,y1=0,y2=0,y3=0,y4=0,y5=0,y6=0,y7=0,y8=0,y9=0,za=0,zb=0,zc=0,zd=0,ze=0,zf=0,zg=0,zh=0,zi=0,zj=0,zk=0,zl=0,zm=0,zn=0,zo=0,zp=0,zq=0,zr=0,zs=0,zt=0,zu=0,zv=0,zw=0,zx=0,zy=0,zz=0,zA=0,zB=0,zC=0,zD=0,zE=0,zF=0,zG=0,zH=0,zI=0,zJ=0,zK=0,zL=0,zM=0,zN=0,zO=0,zP=0,zQ=0,zR=0,zS=0,zT=0,zU=0,zV=0,zW=0,zX=0,zY=0,zZ=0,z_=0,z$=0,z0=0,z1=0,z2=0,z3=0,z4=0,z5=0,z6=0,z7=0,z8=0,z9=0,Aa=0,Ab=0,Ac=0,Ad=0,Ae=0,Af=0,Ag=0,Ah=0,Ai=0,Aj=0,Ak=0,Al=0,Am=0,An=0,Ao=0,Ap=0,Aq=0,Ar=0,As=0,At=0,Au=0,Av=0,Aw=0,Ax=0,Ay=0,Az=0,AA=0,AB=0,AC=0,AD=0,AE=0,AF=0,AG=0,AH=0,AI=0,AJ=0,AK=0,AL=0,AM=0,AN=0,AO=0,AP=0,AQ=0,AR=0,AS=0,AT=0,AU=0,AV=0,AW=0,AX=0,AY=0,AZ=0,A_=0,A$=0,A0=0,A1=0,A2=0,A3=0,A4=0,A5=0,A6=0,A7=0,A8=0,A9=0,Ba=0,Bb=0,Bc=0,Bd=0,Be=0,Bf=0,Bg=0,Bh=0,Bi=0,Bj=0,Bk=0,Bl=0,Bm=0,Bn=0,Bo=0,Bp=0,Bq=0,Br=0,Bs=0,Bt=0,Bu=0,Bv=0,Bw=0,Bx=0,By=0,Bz=0,BA=0,BB=0,BC=0,BD=0,BE=0,BF=0,BG=0,BH=0,BI=0,BJ=0,BK=0,BL=0,BM=0,BN=0,BO=0,BP=0,BQ=0,BR=0,BS=0,BT=0,BU=0,BV=0,BW=0,BX=0,BY=0,BZ=0,B_=0,B$=0,B0=0,B1=0,B2=0,B3=0,B4=0,B5=0,B6=0,B7=0,B8=0,B9=0,Ca=0,Cb=0,Cc=0,Cd=0,Ce=0,Cf=0,Cg=0,Ch=0,Ci=0,Cj=0,Ck=0,Cl=0,Cm=0,Cn=0,Co=0,Cp=0,Cq=0,Cr=0,Cs=0,Ct=0,Cu=0,Cv=0,Cw=0,Cx=0,Cy=0,Cz=0,CA=0,CB=0,CC=0,CD=0,CE=0,CF=0,CG=0,CH=0,CI=0,CJ=0,CK=0,CL=0,CM=0,CN=0,CO=0,CP=0,CQ=0,CR=0,CS=0,CT=0,CU=0,CV=0,CW=0,CX=0,CY=0,CZ=0,C_=0,C$=0,C0=0,C1=0,C2=0,C3=0,C4=0,C5=0,C6=0,C7=0,C8=0,C9=0,Da=0,Db=0,Dc=0,Dd=0,De=0,Df=0,Dg=0,Dh=0,Di=0,Dj=0,Dk=0,Dl=0,Dm=0,Dn=0,Do=0,Dp=0,Dq=0,Dr=0,Ds=0,Dt=0,Du=0,Dv=0,Dw=0,Dx=0,Dy=0,Dz=0,DA=0,DB=0,DC=0,DD=0,DE=0,DF=0,DG=0,DH=0,DI=0,DJ=0,DK=0,DL=0,DM=0,DN=0,DO=0,DP=0,DQ=0,DR=0,DS=0,DT=0,DU=0,DV=0,DW=0,DX=0,DY=0,DZ=0,D_=0,D$=0,D0=0,D1=0,D2=0,D3=0,D4=0,D5=0,D6=0,D7=0,D8=0,D9=0,Ea=0,Eb=0,Ec=0,Ed=0,Ee=0,Ef=0,Eg=0,Eh=0,Ei=0,Ej=0,Ek=0,El=0,Em=0,En=0,Eo=0,Ep=0,Eq=0,Er=0,Es=0,Et=0,Eu=0,Ev=0,Ew=0,Ex=0,Ey=0,Ez=0,EA=0,EB=0,EC=0,ED=0,EE=0,EF=0,EG=0,EH=0,EI=0,EJ=0,EK=0,EL=0,EM=0,EN=0,EO=0,EP=0,EQ=0,ER=0,ES=0,ET=0;h=i;i=i+6512|0;j=h|0;k=h+200|0;l=h+240|0;m=h+280|0;n=h+320|0;o=h+336|0;p=h+352|0;q=h+368|0;r=h+384|0;s=h+400|0;t=h+416|0;u=h+432|0;v=h+448|0;w=h+464|0;x=h+480|0;y=h+496|0;z=h+512|0;A=h+528|0;C=h+544|0;D=h+560|0;E=h+576|0;F=h+592|0;G=h+608|0;H=h+624|0;I=h+640|0;J=h+656|0;K=h+672|0;L=h+688|0;M=h+704|0;N=h+720|0;O=h+736|0;P=h+752|0;Q=h+768|0;R=h+784|0;S=h+800|0;T=h+816|0;U=h+832|0;V=h+848|0;W=h+864|0;X=h+880|0;Y=h+896|0;Z=h+912|0;_=h+928|0;$=h+944|0;aa=h+960|0;ab=h+976|0;ac=h+992|0;ad=h+1008|0;ae=h+1024|0;af=h+1040|0;ah=h+1056|0;ai=h+1072|0;aj=h+1088|0;ak=h+1104|0;al=h+1120|0;am=h+1136|0;an=h+1152|0;ao=h+1168|0;ap=h+1184|0;aq=h+1200|0;ar=h+1216|0;as=h+1232|0;at=h+1248|0;au=h+1264|0;av=h+1280|0;aw=h+1296|0;ax=h+1312|0;ay=h+1328|0;az=h+1344|0;aA=h+1360|0;aB=h+1376|0;aC=h+1392|0;aD=h+1408|0;aE=h+1424|0;aF=h+1440|0;aG=h+1456|0;aH=h+1472|0;aI=h+1488|0;aJ=h+1504|0;aK=h+1520|0;aL=h+1536|0;aM=h+1552|0;aN=h+1568|0;aO=h+1584|0;aP=h+1600|0;aQ=h+1616|0;aR=h+1632|0;aS=h+1648|0;aT=h+1664|0;aU=h+1680|0;aV=h+1696|0;aW=h+1712|0;aX=h+1728|0;aY=h+1744|0;aZ=h+1760|0;a_=h+1776|0;a$=h+1792|0;a0=h+1808|0;a1=h+1824|0;a2=h+1840|0;a3=h+1856|0;a4=h+1872|0;a5=h+1888|0;a6=h+1904|0;a7=h+1920|0;a8=h+1936|0;a9=h+1952|0;ba=h+1968|0;bb=h+1984|0;bc=h+2e3|0;bd=h+2016|0;be=h+2032|0;bf=h+2048|0;bh=h+2064|0;bi=h+2080|0;bj=h+2096|0;bl=h+2112|0;bm=h+2128|0;bn=h+2144|0;bo=h+2160|0;bp=h+2176|0;bq=h+2192|0;br=h+2208|0;bs=h+2224|0;bt=h+2240|0;bu=h+2256|0;bv=h+2272|0;bw=h+2288|0;bx=h+2304|0;by=h+2320|0;bz=h+2336|0;bA=h+2352|0;bB=h+2368|0;bC=h+2384|0;bD=h+2400|0;bE=h+2416|0;bF=h+2432|0;bG=h+2448|0;bH=h+2464|0;bI=h+2480|0;bJ=h+2496|0;bK=h+2512|0;bL=h+2528|0;bM=h+2544|0;bN=h+2560|0;bO=h+2576|0;bP=h+2592|0;bQ=h+2608|0;bR=h+2624|0;bS=h+2640|0;bT=h+2656|0;bU=h+2672|0;bV=h+2688|0;bW=h+2704|0;bX=h+2720|0;bY=h+2736|0;bZ=h+2752|0;b_=h+2768|0;b$=h+2784|0;b0=h+2800|0;b1=h+2816|0;b2=h+2832|0;b3=h+2848|0;b4=h+2864|0;b5=h+2880|0;b6=h+2896|0;b7=h+2912|0;b8=h+2928|0;b9=h+2944|0;ca=h+2960|0;cb=h+2976|0;cc=h+2992|0;cd=h+3008|0;ce=h+3024|0;cf=h+3040|0;cg=h+3056|0;ch=h+3072|0;ci=h+3088|0;cj=h+3104|0;ck=h+3120|0;cl=h+3136|0;cm=h+3152|0;cn=h+3168|0;co=h+3184|0;cp=h+3200|0;cq=h+3216|0;cs=h+3232|0;ct=h+3248|0;cu=h+3264|0;cv=h+3280|0;cw=h+3296|0;cx=h+3312|0;cy=h+3328|0;cz=h+3344|0;cA=h+3360|0;cB=h+3376|0;cC=h+3392|0;cD=h+3408|0;cE=h+3424|0;cF=h+3440|0;cG=h+3456|0;cH=h+3472|0;cI=h+3488|0;cJ=h+3504|0;cK=h+3520|0;cL=h+3536|0;cM=h+3552|0;cN=h+3568|0;cO=h+3584|0;cP=h+3600|0;cQ=h+3616|0;cR=h+3632|0;cS=h+3648|0;cT=h+3664|0;cU=h+3680|0;cV=h+3696|0;cW=h+3712|0;cX=h+3728|0;cY=h+3744|0;cZ=h+3760|0;c_=h+3776|0;c$=h+3792|0;c0=h+3808|0;c1=h+3824|0;c2=h+3840|0;c3=h+3856|0;c4=h+3872|0;c5=h+3888|0;c6=h+3904|0;c7=h+3920|0;c9=h+3936|0;da=h+3952|0;db=h+3968|0;dd=h+3984|0;de=h+4e3|0;df=h+4016|0;dg=h+4032|0;dh=h+4048|0;di=h+4064|0;dj=h+4080|0;dk=h+4096|0;dl=h+4112|0;dm=h+4128|0;dn=h+4144|0;dp=h+4160|0;dq=h+4176|0;dr=h+4192|0;ds=h+4208|0;dt=h+4224|0;du=h+4240|0;dv=h+4256|0;dw=h+4272|0;dx=h+4288|0;dy=h+4304|0;dz=h+4320|0;dA=h+4336|0;dB=h+4352|0;dC=h+4368|0;dD=h+4384|0;dE=h+4400|0;dF=h+4416|0;dG=h+4432|0;dH=h+4448|0;dI=h+4464|0;dJ=h+4480|0;dK=h+4496|0;dL=h+4512|0;dM=h+4528|0;dN=h+4544|0;dO=h+4560|0;dP=h+4576|0;dQ=h+4592|0;dR=h+4608|0;dS=h+4624|0;dT=h+4640|0;dU=h+4656|0;dV=h+4672|0;dW=h+4688|0;dX=h+4704|0;dY=h+4720|0;dZ=h+4736|0;d_=h+4752|0;d$=h+4768|0;d0=h+4784|0;d1=h+4800|0;d2=h+4816|0;d3=h+4832|0;d4=h+4848|0;d5=h+4864|0;d6=h+4880|0;d7=h+4896|0;d8=h+4912|0;d9=h+4928|0;ea=h+4944|0;eb=h+4960|0;ec=h+4976|0;ed=h+4992|0;ee=h+5008|0;ef=h+5024|0;eg=h+5040|0;eh=h+5056|0;ei=h+5072|0;ej=h+5088|0;ek=h+5104|0;el=h+5120|0;em=h+5136|0;en=h+5152|0;eo=h+5168|0;er=h+5184|0;es=h+5200|0;et=h+5216|0;eu=h+5232|0;ev=h+5248|0;ew=h+5264|0;ey=h+5280|0;ez=h+5296|0;eA=h+5312|0;eC=h+5328|0;eD=h+5344|0;eE=h+5360|0;eF=h+5376|0;eG=h+5392|0;eH=h+5408|0;eJ=h+5424|0;eK=h+5440|0;eL=h+5456|0;eM=h+5472|0;eN=h+5488|0;eO=h+5504|0;eP=h+5520|0;eQ=h+5536|0;eR=h+5552|0;eS=h+5568|0;eT=h+5584|0;eU=h+5600|0;eV=h+5616|0;eW=h+5632|0;eX=h+5648|0;eY=h+5664|0;eZ=h+5680|0;e_=h+5696|0;e$=h+5712|0;e0=h+5728|0;e1=h+5744|0;e2=h+5760|0;e3=h+5776|0;e4=h+5792|0;e5=h+5808|0;e6=h+5824|0;e7=h+5840|0;e8=h+5856|0;e9=h+5872|0;fa=h+5888|0;fb=h+5904|0;fc=h+5920|0;fd=h+5936|0;fe=h+5952|0;ff=h+5968|0;fg=h+5984|0;fh=h+6e3|0;fi=h+6016|0;fj=h+6032|0;fk=h+6048|0;fl=h+6064|0;fm=h+6080|0;fn=h+6096|0;fo=h+6112|0;fp=h+6128|0;fq=h+6144|0;fr=h+6160|0;fs=h+6176|0;ft=h+6192|0;fu=h+6208|0;fv=h+6224|0;fw=h+6240|0;fx=h+6256|0;fy=h+6272|0;fz=h+6288|0;fA=h+6304|0;fB=h+6320|0;fC=h+6336|0;fD=h+6352|0;fE=h+6368|0;fF=h+6384|0;fG=h+6400|0;fH=h+6416|0;fI=h+6432|0;fJ=h+6448|0;fK=h+6464|0;fL=h+6480|0;fM=h+6496|0;fN=b+68|0;fO=c[fN>>2]|0;fP=c[b+72>>2]|0;fQ=c[b+76>>2]|0;fR=c[b+20>>2]|0;fS=(g|0)!=0;fT=(e|0)<128?e:128;if((fT|0)<(e|0)){fU=e;fV=0;while(1){fW=(fU|0)/(fT|0)|0;fX=fV+1|0;if((fW|0)>(fT|0)){fU=fW;fV=fX}else{break}}if((fX|0)>0){fU=0;do{c[k+(fU<<2)>>2]=fT;fU=fU+1|0;}while((fU|0)<(fX|0))}c[k+(fX<<2)>>2]=fW;fW=fV+2|0;if((fW|0)>0){fY=fW;fZ=7}else{f_=fW}}else{c[k>>2]=e;fY=1;fZ=7}if((fZ|0)==7){fW=0;while(1){fV=c[k+(fW<<2)>>2]|0;if((fV|0)<9){c[l+(fW<<2)>>2]=fV;c[m+(fW<<2)>>2]=1}else{fX=2;do{fX=fX<<1;f$=(fV|0)/(fX|0)|0;}while((f$|0)>(fX|0));c[l+(fW<<2)>>2]=fX;c[m+(fW<<2)>>2]=f$}fV=fW+1|0;if((fV|0)<(fY|0)){fW=fV}else{f_=fY;break}}}ex(n,23744,0);ex(o,23744,0);fY=c[b+24>>2]|0;fW=b+32|0;b=c[fW>>2]|0;if((b|0)==0){f0=0;f1=fW}else{fW=0;f$=b;while(1){b=f$+28|0;fV=fW+1|0;fU=c[b>>2]|0;if((fU|0)==0){f0=fV;f1=b;break}else{fW=fV;f$=fU}}}f$=~~+bk(+(+(e|0)));fW=fS?f:1;if(fS){f2=(fQ|0)>(f|0)?f:fQ}else{f2=fQ}L29:do{if((f_|0)>0){fQ=n;fU=n+1|0;fV=o;b=o+1|0;fT=j|0;f3=p;f4=q;f5=r;f6=q+1|0;f7=r+1|0;f8=f_-1|0;f9=f_&1;ga=t;gb=u;gc=v;gd=u+1|0;ge=v+1|0;gf=s;gg=w;gh=t+1|0;gi=w+1|0;gj=s+1|0;gk=y;gl=z;gm=A;gn=z+1|0;go=A+1|0;gp=x;gq=C;gr=y+1|0;gs=C+1|0;gt=x+1|0;gu=G;gv=H;gw=I;gx=H+1|0;gy=I+1|0;gz=F;gA=J;gB=G+1|0;gC=J+1|0;gD=+(ag(f,e)|0);gE=E;gF=K;gG=F+1|0;gH=K+1|0;gI=D;gJ=L;gK=E+1|0;gL=L+1|0;gM=D+1|0;gN=N;gO=O;gP=P;gQ=O+1|0;gR=P+1|0;gS=M;gT=Q;gU=N+1|0;gV=Q+1|0;gW=M+1|0;gX=S;gY=T;gZ=U;g_=T+1|0;g$=U+1|0;g0=R;g1=V;g2=S+1|0;g3=V+1|0;g4=R+1|0;g5=X;g6=Y;g7=Z;g8=Y+1|0;g9=Z+1|0;ha=W;hb=_;hc=X+1|0;hd=_+1|0;he=W+1|0;hf=ad;hg=ae;hh=af;hi=ae+1|0;hj=af+1|0;hk=ac;hl=ah;hm=ad+1|0;hn=ah+1|0;ho=ab;hp=ai;hq=ac+1|0;hr=ai+1|0;hs=aa;ht=aj;hu=ab+1|0;hv=aj+1|0;hw=$;hx=ak;hy=aa+1|0;hz=ak+1|0;hA=$+1|0;hB=al;hC=al+1|0;hD=al+4|0;hE=al+8|0;hF=$+4|0;hG=$+8|0;hH=ak+8|0;hI=aa+8|0;hJ=ak+4|0;hK=aa+4|0;hL=aj+8|0;hM=ab+8|0;hN=aj+4|0;hO=ab+4|0;hP=ai+8|0;hQ=ac+8|0;hR=ai+4|0;hS=ac+4|0;hT=ah+8|0;hU=ad+8|0;hV=ah+4|0;hW=ad+4|0;hX=af+8|0;hY=ae+8|0;hZ=af+4|0;h_=ae+4|0;h$=W+4|0;h0=W+8|0;h1=_+8|0;h2=X+8|0;h3=_+4|0;h4=X+4|0;h5=Z+8|0;h6=Y+8|0;h7=Z+4|0;h8=Y+4|0;h9=R+4|0;ia=R+8|0;ib=V+8|0;ic=S+8|0;id=V+4|0;ie=S+4|0;ig=U+8|0;ih=T+8|0;ii=U+4|0;ij=T+4|0;ik=M+4|0;il=M+8|0;im=Q+8|0;io=N+8|0;ip=Q+4|0;iq=N+4|0;ir=P+8|0;is=O+8|0;it=P+4|0;iu=O+4|0;iv=D+4|0;iw=D+8|0;ix=L+8|0;iy=E+8|0;iz=L+4|0;iA=E+4|0;iB=K+8|0;iC=F+8|0;iD=K+4|0;iE=F+4|0;iF=J+8|0;iG=G+8|0;iH=J+4|0;iI=G+4|0;iJ=I+8|0;iK=H+8|0;iL=I+4|0;iM=H+4|0;iN=x+4|0;iO=x+8|0;iP=C+8|0;iQ=y+8|0;iR=C+4|0;iS=y+4|0;iT=A+8|0;iU=z+8|0;iV=A+4|0;iW=z+4|0;iX=s+4|0;iY=s+8|0;iZ=w+8|0;i_=t+8|0;i$=w+4|0;i0=t+4|0;i1=v+8|0;i2=u+8|0;i3=v+4|0;i4=u+4|0;i5=a$;i6=a$+1|0;i7=a1;i8=a2;i9=a3;ja=a2+1|0;jb=a3+1|0;jc=a0;jd=a4;je=a1+1|0;jf=a4+1|0;jg=a0+1|0;jh=a6;ji=a7;jj=a8;jk=a7+1|0;jl=a8+1|0;jm=a5;jn=a9;jo=a6+1|0;jp=a9+1|0;jq=a5+1|0;jr=bb;js=bc;jt=bd;ju=bc+1|0;jv=bd+1|0;jw=ba;jx=be;jy=bb+1|0;jz=be+1|0;jA=ba+1|0;jB=(fR|0)==0;jC=bf;jD=bf+1|0;jE=bh;jF=bh+1|0;jG=bv;jH=bw;jI=bx;jJ=bw+1|0;jK=bx+1|0;jL=bu;jM=by;jN=bv+1|0;jO=by+1|0;jP=bt;jQ=bz;jR=bu+1|0;jS=bz+1|0;jT=bs;jU=bA;jV=bt+1|0;jW=bA+1|0;jX=bs+1|0;jY=bs+4|0;jZ=bs+8|0;j_=bA+8|0;j$=bt+8|0;j0=bA+4|0;j1=bt+4|0;j2=bz+8|0;j3=bu+8|0;j4=bz+4|0;j5=bu+4|0;j6=by+8|0;j7=bv+8|0;j8=by+4|0;j9=bv+4|0;ka=bx+8|0;kb=bw+8|0;kc=bx+4|0;kd=bw+4|0;ke=bm;kf=bn;kg=bo;kh=bn+1|0;ki=bo+1|0;kj=bl;kk=bp;kl=bm+1|0;km=bp+1|0;kn=bj;ko=bq;kp=bl+1|0;kq=bq+1|0;kr=bi;ks=br;kt=bj+1|0;ku=br+1|0;kv=bi+1|0;kw=bi+4|0;kx=bi+8|0;ky=br+8|0;kz=bj+8|0;kA=br+4|0;kB=bj+4|0;kC=bq+8|0;kD=bl+8|0;kE=bq+4|0;kF=bl+4|0;kG=bp+8|0;kH=bm+8|0;kI=bp+4|0;kJ=bm+4|0;kK=bo+8|0;kL=bn+8|0;kM=bo+4|0;kN=bn+4|0;kO=bh+4|0;kP=bh+8|0;kQ=bf+4|0;kR=bf+8|0;kS=bM;kT=bN;kU=bO;kV=bN+1|0;kW=bO+1|0;kX=bL;kY=bP;kZ=bM+1|0;k_=bP+1|0;k$=bL+1|0;k0=c3;k1=c4;k2=c5;k3=c4+1|0;k4=c5+1|0;k5=c2;k6=c6;k7=c3+1|0;k8=c6+1|0;k9=c1;la=c7;lb=c2+1|0;lc=c7+1|0;ld=c0;le=c9;lf=c1+1|0;lg=c9+1|0;lh=c0+1|0;li=db;lj=dd;ll=de;lm=dd+1|0;ln=de+1|0;lo=da;lp=df;lq=db+1|0;lr=df+1|0;ls=da+1|0;lt=dh;lu=di;lv=dj;lw=di+1|0;lx=dj+1|0;ly=dg;lz=dk;lD=dh+1|0;lE=dk+1|0;lF=dg+1|0;lG=dm;lH=dn;lI=dp;lJ=dn+1|0;lK=dp+1|0;lL=dl;lM=dq;lN=dm+1|0;lO=dq+1|0;lP=dl+1|0;lQ=dr;lR=dr+1|0;lS=dv;lT=dw;lU=dx;lV=dw+1|0;lW=dx+1|0;lX=du;lY=dy;lZ=dv+1|0;l_=dy+1|0;l$=dt;l0=dz;l1=du+1|0;l2=dz+1|0;l3=ds;l4=dA;l5=dt+1|0;l6=dA+1|0;l7=ds+1|0;l8=ds+4|0;l9=ds+8|0;ma=dA+8|0;mb=dt+8|0;mc=dA+4|0;md=dt+4|0;me=dz+8|0;mf=du+8|0;mg=dz+4|0;mh=du+4|0;mi=dy+8|0;mj=dv+8|0;mk=dy+4|0;ml=dv+4|0;mm=dx+8|0;mn=dw+8|0;mo=dx+4|0;mp=dw+4|0;mq=dr+4|0;mr=dr+8|0;ms=dl+4|0;mt=dl+8|0;mu=dq+8|0;mv=dm+8|0;mw=dq+4|0;mx=dm+4|0;my=dp+8|0;mz=dn+8|0;mA=dp+4|0;mB=dn+4|0;mC=dg+4|0;mD=dg+8|0;mE=dk+8|0;mF=dh+8|0;mG=dk+4|0;mH=dh+4|0;mI=dj+8|0;mJ=di+8|0;mK=dj+4|0;mL=di+4|0;mM=da+4|0;mN=da+8|0;mO=df+8|0;mP=db+8|0;mQ=df+4|0;mR=db+4|0;mS=de+8|0;mT=dd+8|0;mU=de+4|0;mV=dd+4|0;mW=c0+4|0;mX=c0+8|0;mY=c9+8|0;mZ=c1+8|0;m_=c9+4|0;m$=c1+4|0;m0=c7+8|0;m1=c2+8|0;m2=c7+4|0;m3=c2+4|0;m4=c6+8|0;m5=c3+8|0;m6=c6+4|0;m7=c3+4|0;m8=c5+8|0;m9=c4+8|0;na=c5+4|0;nb=c4+4|0;nc=dE;nd=dF;ne=dG;nf=dF+1|0;ng=dG+1|0;nh=dD;ni=dH;nj=dE+1|0;nk=dH+1|0;nl=dC;nm=dI;nn=dD+1|0;no=dI+1|0;np=dB;nq=dJ;nr=dC+1|0;ns=dJ+1|0;nt=dB+1|0;nu=dP;nv=dQ;nw=dR;nx=dQ+1|0;ny=dR+1|0;nz=dO;nA=dS;nB=dP+1|0;nC=dS+1|0;nD=dN;nE=dT;nF=dO+1|0;nG=dT+1|0;nH=dM;nI=dU;nJ=dN+1|0;nK=dU+1|0;nL=dL;nM=dV;nN=dM+1|0;nO=dV+1|0;nP=dK;nQ=dW;nR=dL+1|0;nS=dW+1|0;nT=dK+1|0;nU=d4;nV=d4+1|0;nW=ee;nX=ee+1|0;nY=eo;nZ=eo+1|0;n_=eC;n$=eC+1|0;n0=eD;n1=eD+1|0;n2=eE;n3=eE+1|0;n4=eF;n5=eF+1|0;n6=eT;n7=eU;n8=eV;n9=eU+1|0;oa=eV+1|0;ob=eS;oc=eW;od=eT+1|0;oe=eW+1|0;of=eR;og=eX;oh=eS+1|0;oi=eX+1|0;oj=eQ;ok=eY;ol=eR+1|0;om=eY+1|0;on=eQ+1|0;oo=eQ+4|0;op=eQ+8|0;oq=eY+8|0;or=eR+8|0;os=eY+4|0;ot=eR+4|0;ou=eX+8|0;ov=eS+8|0;ow=eX+4|0;ox=eS+4|0;oy=eW+8|0;oz=eT+8|0;oA=eW+4|0;oB=eT+4|0;oC=eV+8|0;oD=eU+8|0;oE=eV+4|0;oF=eU+4|0;oG=eK;oH=eL;oI=eM;oJ=eL+1|0;oK=eM+1|0;oL=eJ;oM=eN;oN=eK+1|0;oO=eN+1|0;oP=eH;oQ=eO;oR=eJ+1|0;oS=eO+1|0;oT=eG;oU=eP;oV=eH+1|0;oW=eP+1|0;oX=eG+1|0;oY=eG+4|0;oZ=eG+8|0;o_=eP+8|0;o$=eH+8|0;o0=eP+4|0;o1=eH+4|0;o2=eO+8|0;o3=eJ+8|0;o4=eO+4|0;o5=eJ+4|0;o6=eN+8|0;o7=eK+8|0;o8=eN+4|0;o9=eK+4|0;pa=eM+8|0;pb=eL+8|0;pc=eM+4|0;pd=eL+4|0;pe=eF+4|0;pf=eF+8|0;pg=eE+4|0;ph=eE+8|0;pi=eZ;pj=eZ+1|0;pk=e1;pl=e2;pm=e3;pn=e2+1|0;po=e3+1|0;pp=e0;pq=e4;pr=e1+1|0;ps=e4+1|0;pt=e$;pu=e5;pv=e0+1|0;pw=e5+1|0;px=e_;py=e6;pz=e$+1|0;pA=e6+1|0;pB=e_+1|0;pC=e_+4|0;pD=e_+8|0;pE=e6+8|0;pF=e$+8|0;pG=e6+4|0;pH=e$+4|0;pI=e5+8|0;pJ=e0+8|0;pK=e5+4|0;pL=e0+4|0;pM=e4+8|0;pN=e1+8|0;pO=e4+4|0;pP=e1+4|0;pQ=e3+8|0;pR=e2+8|0;pS=e3+4|0;pT=e2+4|0;pU=eZ+4|0;pV=eZ+8|0;pW=eD+4|0;pX=eD+8|0;pY=eC+4|0;pZ=eC+8|0;p_=eu;p$=ev;p0=ew;p1=ev+1|0;p2=ew+1|0;p3=et;p4=ey;p5=eu+1|0;p6=ey+1|0;p7=es;p8=ez;p9=et+1|0;qa=ez+1|0;qb=er;qc=eA;qd=es+1|0;qe=eA+1|0;qf=er+1|0;qg=er+4|0;qh=er+8|0;qi=eA+8|0;qj=es+8|0;qk=eA+4|0;ql=es+4|0;qm=ez+8|0;qn=et+8|0;qo=ez+4|0;qp=et+4|0;qq=ey+8|0;qr=eu+8|0;qs=ey+4|0;qt=eu+4|0;qu=ew+8|0;qv=ev+8|0;qw=ew+4|0;qx=ev+4|0;qy=eo+4|0;qz=eo+8|0;qA=ei;qB=ej;qC=ek;qD=ej+1|0;qE=ek+1|0;qF=eh;qG=el;qH=ei+1|0;qI=el+1|0;qJ=eg;qK=em;qL=eh+1|0;qM=em+1|0;qN=ef;qO=en;qP=eg+1|0;qQ=en+1|0;qR=ef+1|0;qS=ef+4|0;qT=ef+8|0;qU=en+8|0;qV=eg+8|0;qW=en+4|0;qX=eg+4|0;qY=em+8|0;qZ=eh+8|0;q_=em+4|0;q$=eh+4|0;q0=el+8|0;q1=ei+8|0;q2=el+4|0;q3=ei+4|0;q4=ek+8|0;q5=ej+8|0;q6=ek+4|0;q7=ej+4|0;q8=ee+4|0;q9=ee+8|0;ra=d8;rb=d9;rc=ea;rd=d9+1|0;re=ea+1|0;rf=d7;rg=eb;rh=d8+1|0;ri=eb+1|0;rj=d6;rk=ec;rl=d7+1|0;rm=ec+1|0;rn=d5;ro=ed;rp=d6+1|0;rq=ed+1|0;rr=d5+1|0;rs=d5+4|0;rt=d5+8|0;ru=ed+8|0;rv=d6+8|0;rw=ed+4|0;rx=d6+4|0;ry=ec+8|0;rz=d7+8|0;rA=ec+4|0;rB=d7+4|0;rC=eb+8|0;rD=d8+8|0;rE=eb+4|0;rF=d8+4|0;rG=ea+8|0;rH=d9+8|0;rI=ea+4|0;rJ=d9+4|0;rK=d4+4|0;rL=d4+8|0;rM=d_;rN=d$;rO=d0;rP=d$+1|0;rQ=d0+1|0;rR=dZ;rS=d1;rT=d_+1|0;rU=d1+1|0;rV=dY;rW=d2;rX=dZ+1|0;rY=d2+1|0;rZ=dX;r_=d3;r$=dY+1|0;r0=d3+1|0;r1=dX+1|0;r2=dX+4|0;r3=dX+8|0;r4=d3+8|0;r5=dY+8|0;r6=d3+4|0;r7=dY+4|0;r8=d2+8|0;r9=dZ+8|0;sa=d2+4|0;sb=dZ+4|0;sc=d1+8|0;sd=d_+8|0;se=d1+4|0;sf=d_+4|0;sg=d0+8|0;sh=d$+8|0;si=d0+4|0;sj=d$+4|0;sk=dK+4|0;sl=dK+8|0;sm=dW+8|0;sn=dL+8|0;so=dW+4|0;sp=dL+4|0;sq=dV+8|0;sr=dM+8|0;ss=dV+4|0;st=dM+4|0;su=dU+8|0;sv=dN+8|0;sw=dU+4|0;sx=dN+4|0;sy=dT+8|0;sz=dO+8|0;sA=dT+4|0;sB=dO+4|0;sC=dS+8|0;sD=dP+8|0;sE=dS+4|0;sF=dP+4|0;sG=dR+8|0;sH=dQ+8|0;sI=dR+4|0;sJ=dQ+4|0;sK=dB+4|0;sL=dB+8|0;sM=dJ+8|0;sN=dC+8|0;sO=dJ+4|0;sP=dC+4|0;sQ=dI+8|0;sR=dD+8|0;sS=dI+4|0;sT=dD+4|0;sU=dH+8|0;sV=dE+8|0;sW=dH+4|0;sX=dE+4|0;sY=dG+8|0;sZ=dF+8|0;s_=dG+4|0;s$=dF+4|0;s0=fG;s1=fG+1|0;s2=fM;s3=fM+1|0;s4=fM+4|0;s5=fM+8|0;s6=n+4|0;s7=n+8|0;s8=fI;s9=fJ;ta=fK;tb=fJ+1|0;tc=fK+1|0;td=fH;te=fL;tf=fI+1|0;tg=fL+1|0;th=fH+1|0;ti=fH+4|0;tj=fH+8|0;tk=fL+8|0;tl=fI+8|0;tm=fL+4|0;tn=fI+4|0;to=fK+8|0;tp=fJ+8|0;tq=fK+4|0;tr=fJ+4|0;ts=fG+4|0;tt=fG+8|0;tu=e8;tv=e9;tw=fa;tx=e9+1|0;ty=fa+1|0;tz=e7;tA=fb;tB=e8+1|0;tC=fb+1|0;tD=e7+1|0;tE=fc;tF=fc+1|0;tG=fd;tH=fd+1|0;tI=fq;tJ=fr;tK=fs;tL=fr+1|0;tM=fs+1|0;tN=fp;tO=ft;tP=fq+1|0;tQ=ft+1|0;tR=fo;tS=fu;tT=fp+1|0;tU=fu+1|0;tV=fn;tW=fv;tX=fo+1|0;tY=fv+1|0;tZ=fn+1|0;t_=fn+4|0;t$=fn+8|0;t0=fv+8|0;t1=fo+8|0;t2=fv+4|0;t3=fo+4|0;t4=fu+8|0;t5=fp+8|0;t6=fu+4|0;t7=fp+4|0;t8=ft+8|0;t9=fq+8|0;ua=ft+4|0;ub=fq+4|0;uc=fs+8|0;ud=fr+8|0;ue=fs+4|0;uf=fr+4|0;ug=fh;uh=fi;ui=fj;uj=fi+1|0;uk=fj+1|0;ul=fg;um=fk;un=fh+1|0;uo=fk+1|0;up=ff;uq=fl;ur=fg+1|0;us=fl+1|0;ut=fe;uu=fm;uv=ff+1|0;uw=fm+1|0;ux=fe+1|0;uy=fe+4|0;uz=fe+8|0;uA=fm+8|0;uB=ff+8|0;uC=fm+4|0;uD=ff+4|0;uE=fl+8|0;uF=fg+8|0;uG=fl+4|0;uH=fg+4|0;uI=fk+8|0;uJ=fh+8|0;uK=fk+4|0;uL=fh+4|0;uM=fj+8|0;uN=fi+8|0;uO=fj+4|0;uP=fi+4|0;uQ=fd+4|0;uR=fd+8|0;uS=fc+4|0;uT=fc+8|0;uU=fw;uV=fw+1|0;uW=fA;uX=fB;uY=fC;uZ=fB+1|0;u_=fC+1|0;u$=fz;u0=fD;u1=fA+1|0;u2=fD+1|0;u3=fy;u4=fE;u5=fz+1|0;u6=fE+1|0;u7=fx;u8=fF;u9=fy+1|0;va=fF+1|0;vb=fx+1|0;vc=fx+4|0;vd=fx+8|0;ve=fF+8|0;vf=fy+8|0;vg=fF+4|0;vh=fy+4|0;vi=fE+8|0;vj=fz+8|0;vk=fE+4|0;vl=fz+4|0;vm=fD+8|0;vn=fA+8|0;vo=fD+4|0;vp=fA+4|0;vq=fC+8|0;vr=fB+8|0;vs=fC+4|0;vt=fB+4|0;vu=fw+4|0;vv=fw+8|0;vw=e7+4|0;vx=e7+8|0;vy=fb+8|0;vz=e8+8|0;vA=fb+4|0;vB=e8+4|0;vC=fa+8|0;vD=e9+8|0;vE=fa+4|0;vF=e9+4|0;vG=b8;vH=b9;vI=ca;vJ=b9+1|0;vK=ca+1|0;vL=b7;vM=cb;vN=b8+1|0;vO=cb+1|0;vP=b7+1|0;vQ=cc;vR=cc+1|0;vS=cd;vT=cd+1|0;vU=cn;vV=cn+1|0;vW=cy;vX=cy+1|0;vY=cI;vZ=cI+1|0;v_=cS;v$=cS+1|0;v0=cW;v1=cX;v2=cY;v3=cX+1|0;v4=cY+1|0;v5=cV;v6=cZ;v7=cW+1|0;v8=cZ+1|0;v9=cU;wa=c_;wb=cV+1|0;wc=c_+1|0;wd=cT;we=c$;wf=cU+1|0;wg=c$+1|0;wh=cT+1|0;wi=cT+4|0;wj=cT+8|0;wk=c$+8|0;wl=cU+8|0;wm=c$+4|0;wn=cU+4|0;wo=c_+8|0;wp=cV+8|0;wq=c_+4|0;wr=cV+4|0;ws=cZ+8|0;wt=cW+8|0;wu=cZ+4|0;wv=cW+4|0;ww=cY+8|0;wx=cX+8|0;wy=cY+4|0;wz=cX+4|0;wA=cS+4|0;wB=cS+8|0;wC=cM;wD=cN;wE=cO;wF=cN+1|0;wG=cO+1|0;wH=cL;wI=cP;wJ=cM+1|0;wK=cP+1|0;wL=cK;wM=cQ;wN=cL+1|0;wO=cQ+1|0;wP=cJ;wQ=cR;wR=cK+1|0;wS=cR+1|0;wT=cJ+1|0;wU=cJ+4|0;wV=cJ+8|0;wW=cR+8|0;wX=cK+8|0;wY=cR+4|0;wZ=cK+4|0;w_=cQ+8|0;w$=cL+8|0;w0=cQ+4|0;w1=cL+4|0;w2=cP+8|0;w3=cM+8|0;w4=cP+4|0;w5=cM+4|0;w6=cO+8|0;w7=cN+8|0;w8=cO+4|0;w9=cN+4|0;xa=cI+4|0;xb=cI+8|0;xc=cC;xd=cD;xe=cE;xf=cD+1|0;xg=cE+1|0;xh=cB;xi=cF;xj=cC+1|0;xk=cF+1|0;xl=cA;xm=cG;xn=cB+1|0;xo=cG+1|0;xp=cz;xq=cH;xr=cA+1|0;xs=cH+1|0;xt=cz+1|0;xu=cz+4|0;xv=cz+8|0;xw=cH+8|0;xx=cA+8|0;xy=cH+4|0;xz=cA+4|0;xA=cG+8|0;xB=cB+8|0;xC=cG+4|0;xD=cB+4|0;xE=cF+8|0;xF=cC+8|0;xG=cF+4|0;xH=cC+4|0;xI=cE+8|0;xJ=cD+8|0;xK=cE+4|0;xL=cD+4|0;xM=cy+4|0;xN=cy+8|0;xO=cs;xP=ct;xQ=cu;xR=ct+1|0;xS=cu+1|0;xT=cq;xU=cv;xV=cs+1|0;xW=cv+1|0;xX=cp;xY=cw;xZ=cq+1|0;x_=cw+1|0;x$=co;x0=cx;x1=cp+1|0;x2=cx+1|0;x3=co+1|0;x4=co+4|0;x5=co+8|0;x6=cx+8|0;x7=cp+8|0;x8=cx+4|0;x9=cp+4|0;ya=cw+8|0;yb=cq+8|0;yc=cw+4|0;yd=cq+4|0;ye=cv+8|0;yf=cs+8|0;yg=cv+4|0;yh=cs+4|0;yi=cu+8|0;yj=ct+8|0;yk=cu+4|0;yl=ct+4|0;ym=cn+4|0;yn=cn+8|0;yo=ch;yp=ci;yq=cj;yr=ci+1|0;ys=cj+1|0;yt=cg;yu=ck;yv=ch+1|0;yw=ck+1|0;yx=cf;yy=cl;yz=cg+1|0;yA=cl+1|0;yB=ce;yC=cm;yD=cf+1|0;yE=cm+1|0;yF=ce+1|0;yG=ce+4|0;yH=ce+8|0;yI=cm+8|0;yJ=cf+8|0;yK=cm+4|0;yL=cf+4|0;yM=cl+8|0;yN=cg+8|0;yO=cl+4|0;yP=cg+4|0;yQ=ck+8|0;yR=ch+8|0;yS=ck+4|0;yT=ch+4|0;yU=cj+8|0;yV=ci+8|0;yW=cj+4|0;yX=ci+4|0;yY=cd+4|0;yZ=cd+8|0;y_=cc+4|0;y$=cc+8|0;y0=b7+4|0;y1=b7+8|0;y2=cb+8|0;y3=b8+8|0;y4=cb+4|0;y5=b8+4|0;y6=ca+8|0;y7=b9+8|0;y8=ca+4|0;y9=b9+4|0;za=bT;zb=bU;zc=bV;zd=bU+1|0;ze=bV+1|0;zf=bS;zg=bW;zh=bT+1|0;zi=bW+1|0;zj=bR;zk=bX;zl=bS+1|0;zm=bX+1|0;zn=bQ;zo=bY;zp=bR+1|0;zq=bY+1|0;zr=bQ+1|0;zs=bZ;zt=bZ+1|0;zu=b1;zv=b2;zw=b3;zx=b2+1|0;zy=b3+1|0;zz=b0;zA=b4;zB=b1+1|0;zC=b4+1|0;zD=b$;zE=b5;zF=b0+1|0;zG=b5+1|0;zH=b_;zI=b6;zJ=b$+1|0;zK=b6+1|0;zL=b_+1|0;zM=b_+4|0;zN=b_+8|0;zO=b6+8|0;zP=b$+8|0;zQ=b6+4|0;zR=b$+4|0;zS=b5+8|0;zT=b0+8|0;zU=b5+4|0;zV=b0+4|0;zW=b4+8|0;zX=b1+8|0;zY=b4+4|0;zZ=b1+4|0;z_=b3+8|0;z$=b2+8|0;z0=b3+4|0;z1=b2+4|0;z2=bZ+4|0;z3=bZ+8|0;z4=bQ+4|0;z5=bQ+8|0;z6=bY+8|0;z7=bR+8|0;z8=bY+4|0;z9=bR+4|0;Aa=bX+8|0;Ab=bS+8|0;Ac=bX+4|0;Ad=bS+4|0;Ae=bW+8|0;Af=bT+8|0;Ag=bW+4|0;Ah=bT+4|0;Ai=bV+8|0;Aj=bU+8|0;Ak=bV+4|0;Al=bU+4|0;Am=bL+4|0;An=bL+8|0;Ao=bP+8|0;Ap=bM+8|0;Aq=bP+4|0;Ar=bM+4|0;As=bO+8|0;At=bN+8|0;Au=bO+4|0;Av=bN+4|0;Aw=bB;Ax=bB+1|0;Ay=bF;Az=bG;AA=bH;AB=bG+1|0;AC=bH+1|0;AD=bE;AE=bI;AF=bF+1|0;AG=bI+1|0;AH=bD;AI=bJ;AJ=bE+1|0;AK=bJ+1|0;AL=bC;AM=bK;AN=bD+1|0;AO=bK+1|0;AP=bC+1|0;AQ=bC+4|0;AR=bC+8|0;AS=bK+8|0;AT=bD+8|0;AU=bK+4|0;AV=bD+4|0;AW=bJ+8|0;AX=bE+8|0;AY=bJ+4|0;AZ=bE+4|0;A_=bI+8|0;A$=bF+8|0;A0=bI+4|0;A1=bF+4|0;A2=bH+8|0;A3=bG+8|0;A4=bH+4|0;A5=bG+4|0;A6=bB+4|0;A7=bB+8|0;A8=ba+4|0;A9=ba+8|0;Ba=be+8|0;Bb=bb+8|0;Bc=be+4|0;Bd=bb+4|0;Be=bd+8|0;Bf=bc+8|0;Bg=bd+4|0;Bh=bc+4|0;Bi=a5+4|0;Bj=a5+8|0;Bk=a9+8|0;Bl=a6+8|0;Bm=a9+4|0;Bn=a6+4|0;Bo=a8+8|0;Bp=a7+8|0;Bq=a8+4|0;Br=a7+4|0;Bs=a0+4|0;Bt=a0+8|0;Bu=a4+8|0;Bv=a1+8|0;Bw=a4+4|0;Bx=a1+4|0;By=a3+8|0;Bz=a2+8|0;BA=a3+4|0;BB=a2+4|0;BC=a$+4|0;BD=a$+8|0;BE=an;BF=ao;BG=ap;BH=ao+1|0;BI=ap+1|0;BJ=am;BK=aq;BL=an+1|0;BM=aq+1|0;BN=am+1|0;BO=as;BP=at;BQ=au;BR=at+1|0;BS=au+1|0;BT=ar;BU=av;BV=as+1|0;BW=av+1|0;BX=ar+1|0;BY=ax;BZ=ay;B_=az;B$=ay+1|0;B0=az+1|0;B1=aw;B2=aA;B3=ax+1|0;B4=aA+1|0;B5=aw+1|0;B6=aB;B7=aB+1|0;B8=aD;B9=aE;Ca=aF;Cb=aE+1|0;Cc=aF+1|0;Cd=aC;Ce=aG;Cf=aD+1|0;Cg=aG+1|0;Ch=aC+1|0;Ci=aI;Cj=aJ;Ck=aK;Cl=aJ+1|0;Cm=aK+1|0;Cn=aH;Co=aL;Cp=aI+1|0;Cq=aL+1|0;Cr=aH+1|0;Cs=aN;Ct=aO;Cu=aP;Cv=aO+1|0;Cw=aP+1|0;Cx=aM;Cy=aQ;Cz=aN+1|0;CA=aQ+1|0;CB=aM+1|0;CC=aS;CD=aT;CE=aU;CF=aT+1|0;CG=aU+1|0;CH=aR;CI=aV;CJ=aS+1|0;CK=aV+1|0;CL=aR+1|0;CM=aX;CN=aY;CO=aZ;CP=aY+1|0;CQ=aZ+1|0;CR=aW;CS=a_;CT=aX+1|0;CU=a_+1|0;CV=aW+1|0;CW=aW+4|0;CX=aW+8|0;CY=a_+8|0;CZ=aX+8|0;C_=a_+4|0;C$=aX+4|0;C0=aZ+8|0;C1=aY+8|0;C2=aZ+4|0;C3=aY+4|0;C4=aR+4|0;C5=aR+8|0;C6=aV+8|0;C7=aS+8|0;C8=aV+4|0;C9=aS+4|0;Da=aU+8|0;Db=aT+8|0;Dc=aU+4|0;Dd=aT+4|0;De=aM+4|0;Df=aM+8|0;Dg=aQ+8|0;Dh=aN+8|0;Di=aQ+4|0;Dj=aN+4|0;Dk=aP+8|0;Dl=aO+8|0;Dm=aP+4|0;Dn=aO+4|0;Do=aH+4|0;Dp=aH+8|0;Dq=aL+8|0;Dr=aI+8|0;Ds=aL+4|0;Dt=aI+4|0;Du=aK+8|0;Dv=aJ+8|0;Dw=aK+4|0;Dx=aJ+4|0;Dy=aC+4|0;Dz=aC+8|0;DA=aG+8|0;DB=aD+8|0;DC=aG+4|0;DD=aD+4|0;DE=aF+8|0;DF=aE+8|0;DG=aF+4|0;DH=aE+4|0;DI=aB+4|0;DJ=aB+8|0;DK=aw+4|0;DL=aw+8|0;DM=aA+8|0;DN=ax+8|0;DO=aA+4|0;DP=ax+4|0;DQ=az+8|0;DR=ay+8|0;DS=az+4|0;DT=ay+4|0;DU=ar+4|0;DV=ar+8|0;DW=av+8|0;DX=as+8|0;DY=av+4|0;DZ=as+4|0;D_=au+8|0;D$=at+8|0;D0=au+4|0;D1=at+4|0;D2=am+4|0;D3=am+8|0;D4=aq+8|0;D5=an+8|0;D6=aq+4|0;D7=an+4|0;D8=ap+8|0;D9=ao+8|0;Ea=ap+4|0;Eb=ao+4|0;Ec=o+8|0;Ed=o+4|0;Ee=r+8|0;Ef=q+8|0;Eg=r+4|0;Eh=q+4|0;Ei=f0;Ej=e;Ek=f1;El=0;Em=f2;while(1){if((a[fQ]&1)==0){a[fU]=0;a[fQ]=0}else{a[c[s7>>2]|0]=0;c[s6>>2]=0}if((a[fV]&1)==0){a[b]=0;a[fV]=0}else{a[c[Ec>>2]|0]=0;c[Ed>>2]=0}En=c[k+(El<<2)>>2]|0;Eo=c[l+(El<<2)>>2]|0;Ep=c[m+(El<<2)>>2]|0;Eq=fW;Er=0;while(1){if((Er|0)==(El|0)){Es=Eq}else{Es=ag(c[k+(Er<<2)>>2]|0,Eq)|0}Et=Er+1|0;if((Et|0)<(f_|0)){Eq=Es;Er=Et}else{break}}Er=(El|0)>0;if(Er){Eq=fW;Et=0;while(1){Eu=ag(c[k+(Et<<2)>>2]|0,Eq)|0;Ev=Et+1|0;if((Ev|0)<(El|0)){Eq=Eu;Et=Ev}else{Ew=Eu;break}}}else{Ew=fW}Et=(Ep|0)==1;if(Et){Ex=c[fN>>2]|0}else{Ex=Em}Eq=ag((Ex|0)<(Es|0)?Ex:Es,Ep)|0;Eu=(Eq|0)<(fO|0)?Eq:fO;Eq=(Eu|0)/(Ep|0)|0;if((Ep|0)>(Eo|0)){fZ=36;break}if((ag(Ep,Eo)|0)!=(En|0)){fZ=62;break}if((Eo|0)>(fP|0)){fZ=65;break}Ev=(Eo|0)/(Ep|0)|0;Ey=(Eu|0)/(Eq|0)|0;Ez=~~+bk(+(+(Ew|0)));EA=(Es|0)/(Eq|0)|0;if(fS){EB=EA}else{EB=ag(EA,f)|0}ex(q,1280,3);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ei,B)|0)|0;ex(r,fT,lB(fT|0)|0);lC(f3|0,0,12);EC=a[f4]|0;ED=EC&255;EE=(ED&1|0)==0?ED>>>1:c[Eh>>2]|0;ED=d[f5]|0;EF=(ED&1|0)==0?ED>>>1:c[Eg>>2]|0;eI(p,(EC&1)==0?f6:c[Ef>>2]|0,EE,EF+EE|0);eB(p,(a[f5]&1)==0?f7:c[Ee>>2]|0,EF)|0;eq(o,p)|0;ep(p);ep(r);ep(q);EF=lk(32)|0;c[Ek>>2]=EF;c[EF>>2]=0;do{if(Et){c[(c[Ek>>2]|0)+8>>2]=0}else{if((Ew|0)==1){EF=ag(Eq,En+1|0)|0;c[(c[Ek>>2]|0)+8>>2]=EF;break}else{EF=ag(Eu,Eo)|0;c[(c[Ek>>2]|0)+8>>2]=EF;break}}}while(0);c[(c[Ek>>2]|0)+12>>2]=EB;c[(c[Ek>>2]|0)+16>>2]=Eu;c[(c[Ek>>2]|0)+20>>2]=g;c[(c[Ek>>2]|0)+24>>2]=((El|0)!=(f8|0)|f9^1)^1;c[(c[Ek>>2]|0)+28>>2]=0;Et=d[fV]|0;EF=lk(((Et&1|0)==0?Et>>>1:c[Ed>>2]|0)+1|0)|0;c[(c[Ek>>2]|0)+4>>2]=EF;lA(c[(c[Ek>>2]|0)+4>>2]|0,((a[fV]&1)==0?b:c[Ec>>2]|0)|0)|0;c8(n,Eo);if(fS){ex(u,7440,18);EF=~~+bk(+(+(EA|0)));bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EF,B)|0)|0;ex(v,fT,lB(fT|0)|0);lC(ga|0,0,12);EF=a[gb]|0;Et=EF&255;EE=(Et&1|0)==0?Et>>>1:c[i4>>2]|0;Et=d[gc]|0;EC=(Et&1|0)==0?Et>>>1:c[i3>>2]|0;eI(t,(EF&1)==0?gd:c[i2>>2]|0,EE,EC+EE|0);EE=(a[gc]&1)==0?ge:c[i1>>2]|0;eB(t,EE,EC)|0;ex(w,4944,2);lC(gf|0,0,12);EC=a[ga]|0;EE=EC&255;EF=(EE&1|0)==0?EE>>>1:c[i0>>2]|0;EE=d[gg]|0;Et=(EE&1|0)==0?EE>>>1:c[i$>>2]|0;eI(s,(EC&1)==0?gh:c[i_>>2]|0,EF,Et+EF|0);EF=(a[gg]&1)==0?gi:c[iZ>>2]|0;eB(s,EF,Et)|0;Et=a[gf]|0;EF=(Et&1)==0?gj:c[iY>>2]|0;EC=Et&255;Et=(EC&1|0)==0?EC>>>1:c[iX>>2]|0;eB(n,EF,Et)|0;ep(s);ep(w);ep(t);ep(v);ep(u);ex(z,7400,20);Et=EA-1|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Et,B)|0)|0;ex(A,fT,lB(fT|0)|0);lC(gk|0,0,12);Et=a[gl]|0;EF=Et&255;EC=(EF&1|0)==0?EF>>>1:c[iW>>2]|0;EF=d[gm]|0;EE=(EF&1|0)==0?EF>>>1:c[iV>>2]|0;eI(y,(Et&1)==0?gn:c[iU>>2]|0,EC,EE+EC|0);EC=(a[gm]&1)==0?go:c[iT>>2]|0;eB(y,EC,EE)|0;ex(C,4944,2);lC(gp|0,0,12);EE=a[gk]|0;EC=EE&255;Et=(EC&1|0)==0?EC>>>1:c[iS>>2]|0;EC=d[gq]|0;EF=(EC&1|0)==0?EC>>>1:c[iR>>2]|0;eI(x,(EE&1)==0?gr:c[iQ>>2]|0,Et,EF+Et|0);Et=(a[gq]&1)==0?gs:c[iP>>2]|0;eB(x,Et,EF)|0;EF=a[gp]|0;Et=(EF&1)==0?gt:c[iO>>2]|0;EE=EF&255;EF=(EE&1|0)==0?EE>>>1:c[iN>>2]|0;eB(n,Et,EF)|0;ep(x);ep(C);ep(y);ep(A);ep(z);ex(H,7360,25);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Eq,B)|0)|0;ex(I,fT,lB(fT|0)|0);lC(gu|0,0,12);EF=a[gv]|0;Et=EF&255;EE=(Et&1|0)==0?Et>>>1:c[iM>>2]|0;Et=d[gw]|0;EC=(Et&1|0)==0?Et>>>1:c[iL>>2]|0;eI(G,(EF&1)==0?gx:c[iK>>2]|0,EE,EC+EE|0);EE=(a[gw]&1)==0?gy:c[iJ>>2]|0;eB(G,EE,EC)|0;ex(J,7312,10);lC(gz|0,0,12);EC=a[gu]|0;EE=EC&255;EF=(EE&1|0)==0?EE>>>1:c[iI>>2]|0;EE=d[gA]|0;Et=(EE&1|0)==0?EE>>>1:c[iH>>2]|0;eI(F,(EC&1)==0?gB:c[iG>>2]|0,EF,Et+EF|0);EF=(a[gA]&1)==0?gC:c[iF>>2]|0;eB(F,EF,Et)|0;Et=~~+bk(+gD);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Et,B)|0)|0;ex(K,fT,lB(fT|0)|0);lC(gE|0,0,12);EF=a[gz]|0;EC=EF&255;EE=(EC&1|0)==0?EC>>>1:c[iE>>2]|0;EC=d[gF]|0;ED=(EC&1|0)==0?EC>>>1:c[iD>>2]|0;eI(E,(EF&1)==0?gG:c[iC>>2]|0,EE,ED+EE|0);EE=(a[gF]&1)==0?gH:c[iB>>2]|0;eB(E,EE,ED)|0;ex(L,2520,3);lC(gI|0,0,12);ED=a[gE]|0;EE=ED&255;EF=(EE&1|0)==0?EE>>>1:c[iA>>2]|0;EE=d[gJ]|0;EC=(EE&1|0)==0?EE>>>1:c[iz>>2]|0;eI(D,(ED&1)==0?gK:c[iy>>2]|0,EF,EC+EF|0);EF=(a[gJ]&1)==0?gL:c[ix>>2]|0;eB(D,EF,EC)|0;EC=a[gI]|0;EF=(EC&1)==0?gM:c[iw>>2]|0;ED=EC&255;EC=(ED&1|0)==0?ED>>>1:c[iv>>2]|0;eB(n,EF,EC)|0;ep(D);ep(L);ep(E);ep(K);ep(F);ep(J);ep(G);ep(I);ep(H);ex(O,7280,21);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Eq,B)|0)|0;ex(P,fT,lB(fT|0)|0);lC(gN|0,0,12);EC=a[gO]|0;EF=EC&255;ED=(EF&1|0)==0?EF>>>1:c[iu>>2]|0;EF=d[gP]|0;EE=(EF&1|0)==0?EF>>>1:c[it>>2]|0;eI(N,(EC&1)==0?gQ:c[is>>2]|0,ED,EE+ED|0);ED=(a[gP]&1)==0?gR:c[ir>>2]|0;eB(N,ED,EE)|0;ex(Q,2520,3);lC(gS|0,0,12);EE=a[gN]|0;ED=EE&255;EC=(ED&1|0)==0?ED>>>1:c[iq>>2]|0;ED=d[gT]|0;EF=(ED&1|0)==0?ED>>>1:c[ip>>2]|0;eI(M,(EE&1)==0?gU:c[io>>2]|0,EC,EF+EC|0);EC=(a[gT]&1)==0?gV:c[im>>2]|0;eB(M,EC,EF)|0;EF=a[gS]|0;EC=(EF&1)==0?gW:c[il>>2]|0;EE=EF&255;EF=(EE&1|0)==0?EE>>>1:c[ik>>2]|0;eB(n,EC,EF)|0;ep(M);ep(Q);ep(N);ep(P);ep(O);ex(T,7248,11);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ez,B)|0)|0;ex(U,fT,lB(fT|0)|0);lC(gX|0,0,12);EF=a[gY]|0;EC=EF&255;EE=(EC&1|0)==0?EC>>>1:c[ij>>2]|0;EC=d[gZ]|0;ED=(EC&1|0)==0?EC>>>1:c[ii>>2]|0;eI(S,(EF&1)==0?g_:c[ih>>2]|0,EE,ED+EE|0);EE=(a[gZ]&1)==0?g$:c[ig>>2]|0;eB(S,EE,ED)|0;ex(V,4944,2);lC(g0|0,0,12);ED=a[gX]|0;EE=ED&255;EF=(EE&1|0)==0?EE>>>1:c[ie>>2]|0;EE=d[g1]|0;EC=(EE&1|0)==0?EE>>>1:c[id>>2]|0;eI(R,(ED&1)==0?g2:c[ic>>2]|0,EF,EC+EF|0);EF=(a[g1]&1)==0?g3:c[ib>>2]|0;eB(R,EF,EC)|0;EC=a[g0]|0;EF=(EC&1)==0?g4:c[ia>>2]|0;ED=EC&255;EC=(ED&1|0)==0?ED>>>1:c[h9>>2]|0;eB(n,EF,EC)|0;ep(R);ep(V);ep(S);ep(U);ep(T);ex(Y,7216,10);EC=Ew-1|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EC,B)|0)|0;ex(Z,fT,lB(fT|0)|0);lC(g5|0,0,12);EC=a[g6]|0;EF=EC&255;ED=(EF&1|0)==0?EF>>>1:c[h8>>2]|0;EF=d[g7]|0;EE=(EF&1|0)==0?EF>>>1:c[h7>>2]|0;eI(X,(EC&1)==0?g8:c[h6>>2]|0,ED,EE+ED|0);ED=(a[g7]&1)==0?g9:c[h5>>2]|0;eB(X,ED,EE)|0;ex(_,4944,2);lC(ha|0,0,12);EE=a[g5]|0;ED=EE&255;EC=(ED&1|0)==0?ED>>>1:c[h4>>2]|0;ED=d[hb]|0;EF=(ED&1|0)==0?ED>>>1:c[h3>>2]|0;eI(W,(EE&1)==0?hc:c[h2>>2]|0,EC,EF+EC|0);EC=(a[hb]&1)==0?hd:c[h1>>2]|0;eB(W,EC,EF)|0;EF=a[ha]|0;EC=(EF&1)==0?he:c[h0>>2]|0;EE=EF&255;EF=(EE&1|0)==0?EE>>>1:c[h$>>2]|0;eB(n,EC,EF)|0;ep(W);ep(_);ep(X);ep(Z);ep(Y);EF=ag(En,fW)|0;if(Er){EC=EF;EE=0;while(1){ED=ag(c[k+(EE<<2)>>2]|0,EC)|0;EG=EE+1|0;if((EG|0)<(El|0)){EC=ED;EE=EG}else{EH=ED;break}}}else{EH=EF}ex(ae,7184,20);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EH,B)|0)|0;ex(af,fT,lB(fT|0)|0);lC(hf|0,0,12);EE=a[hg]|0;EC=EE&255;ED=(EC&1|0)==0?EC>>>1:c[h_>>2]|0;EC=d[hh]|0;EG=(EC&1|0)==0?EC>>>1:c[hZ>>2]|0;eI(ad,(EE&1)==0?hi:c[hY>>2]|0,ED,EG+ED|0);ED=(a[hh]&1)==0?hj:c[hX>>2]|0;eB(ad,ED,EG)|0;ex(ah,7168,6);lC(hk|0,0,12);EG=a[hf]|0;ED=EG&255;EE=(ED&1|0)==0?ED>>>1:c[hW>>2]|0;ED=d[hl]|0;EC=(ED&1|0)==0?ED>>>1:c[hV>>2]|0;eI(ac,(EG&1)==0?hm:c[hU>>2]|0,EE,EC+EE|0);EE=(a[hl]&1)==0?hn:c[hT>>2]|0;eB(ac,EE,EC)|0;ex(ai,7152,9);lC(ho|0,0,12);EC=a[hk]|0;EE=EC&255;EG=(EE&1|0)==0?EE>>>1:c[hS>>2]|0;EE=d[hp]|0;ED=(EE&1|0)==0?EE>>>1:c[hR>>2]|0;eI(ab,(EC&1)==0?hq:c[hQ>>2]|0,EG,ED+EG|0);EG=(a[hp]&1)==0?hr:c[hP>>2]|0;eB(ab,EG,ED)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Et,B)|0)|0;ex(aj,fT,lB(fT|0)|0);lC(hs|0,0,12);ED=a[ho]|0;EG=ED&255;EC=(EG&1|0)==0?EG>>>1:c[hO>>2]|0;EG=d[ht]|0;EE=(EG&1|0)==0?EG>>>1:c[hN>>2]|0;eI(aa,(ED&1)==0?hu:c[hM>>2]|0,EC,EE+EC|0);EC=(a[ht]&1)==0?hv:c[hL>>2]|0;eB(aa,EC,EE)|0;ex(ak,7144,4);lC(hw|0,0,12);EE=a[hs]|0;EC=EE&255;ED=(EC&1|0)==0?EC>>>1:c[hK>>2]|0;EC=d[hx]|0;EG=(EC&1|0)==0?EC>>>1:c[hJ>>2]|0;eI($,(EE&1)==0?hy:c[hI>>2]|0,ED,EG+ED|0);ED=(a[hx]&1)==0?hz:c[hH>>2]|0;eB($,ED,EG)|0;EG=a[hw]|0;ED=(EG&1)==0?hA:c[hG>>2]|0;EE=EG&255;EG=(EE&1|0)==0?EE>>>1:c[hF>>2]|0;eB(n,ED,EG)|0;ep($);ep(ak);ep(aa);ep(aj);ep(ab);ep(ai);ep(ac);ep(ah);ep(ad);ep(af);ep(ae);ex(al,7104,16);EG=a[hB]|0;ED=(EG&1)==0?hC:c[hE>>2]|0;EE=EG&255;EG=(EE&1|0)==0?EE>>>1:c[hD>>2]|0;eB(n,ED,EG)|0;ep(al)}else{EG=~~+bk(+(+(EA|0)));ex(ao,7080,17);ED=EA-1|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(ap,fT,lB(fT|0)|0);lC(BE|0,0,12);ED=a[BF]|0;EE=ED&255;EC=(EE&1|0)==0?EE>>>1:c[Eb>>2]|0;EE=d[BG]|0;EI=(EE&1|0)==0?EE>>>1:c[Ea>>2]|0;eI(an,(ED&1)==0?BH:c[D9>>2]|0,EC,EI+EC|0);EC=(a[BG]&1)==0?BI:c[D8>>2]|0;eB(an,EC,EI)|0;ex(aq,4944,2);lC(BJ|0,0,12);EI=a[BE]|0;EC=EI&255;ED=(EC&1|0)==0?EC>>>1:c[D7>>2]|0;EC=d[BK]|0;EE=(EC&1|0)==0?EC>>>1:c[D6>>2]|0;eI(am,(EI&1)==0?BL:c[D5>>2]|0,ED,EE+ED|0);ED=(a[BK]&1)==0?BM:c[D4>>2]|0;eB(am,ED,EE)|0;EE=a[BJ]|0;ED=(EE&1)==0?BN:c[D3>>2]|0;EI=EE&255;EE=(EI&1|0)==0?EI>>>1:c[D2>>2]|0;eB(n,ED,EE)|0;ep(am);ep(aq);ep(an);ep(ap);ep(ao);ex(at,7440,18);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EG,B)|0)|0;ex(au,fT,lB(fT|0)|0);lC(BO|0,0,12);EG=a[BP]|0;EE=EG&255;ED=(EE&1|0)==0?EE>>>1:c[D1>>2]|0;EE=d[BQ]|0;EI=(EE&1|0)==0?EE>>>1:c[D0>>2]|0;eI(as,(EG&1)==0?BR:c[D$>>2]|0,ED,EI+ED|0);ED=(a[BQ]&1)==0?BS:c[D_>>2]|0;eB(as,ED,EI)|0;ex(av,4944,2);lC(BT|0,0,12);EI=a[BO]|0;ED=EI&255;EG=(ED&1|0)==0?ED>>>1:c[DZ>>2]|0;ED=d[BU]|0;EE=(ED&1|0)==0?ED>>>1:c[DY>>2]|0;eI(ar,(EI&1)==0?BV:c[DX>>2]|0,EG,EE+EG|0);EG=(a[BU]&1)==0?BW:c[DW>>2]|0;eB(ar,EG,EE)|0;EE=a[BT]|0;EG=(EE&1)==0?BX:c[DV>>2]|0;EI=EE&255;EE=(EI&1|0)==0?EI>>>1:c[DU>>2]|0;eB(n,EG,EE)|0;ep(ar);ep(av);ep(as);ep(au);ep(at);ex(ay,7048,22);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Eq,B)|0)|0;ex(az,fT,lB(fT|0)|0);lC(BY|0,0,12);EE=a[BZ]|0;EG=EE&255;EI=(EG&1|0)==0?EG>>>1:c[DT>>2]|0;EG=d[B_]|0;ED=(EG&1|0)==0?EG>>>1:c[DS>>2]|0;eI(ax,(EE&1)==0?B$:c[DR>>2]|0,EI,ED+EI|0);EI=(a[B_]&1)==0?B0:c[DQ>>2]|0;eB(ax,EI,ED)|0;ex(aA,2520,3);lC(B1|0,0,12);ED=a[BY]|0;EI=ED&255;EE=(EI&1|0)==0?EI>>>1:c[DP>>2]|0;EI=d[B2]|0;EG=(EI&1|0)==0?EI>>>1:c[DO>>2]|0;eI(aw,(ED&1)==0?B3:c[DN>>2]|0,EE,EG+EE|0);EE=(a[B2]&1)==0?B4:c[DM>>2]|0;eB(aw,EE,EG)|0;EG=a[B1]|0;EE=(EG&1)==0?B5:c[DL>>2]|0;ED=EG&255;EG=(ED&1|0)==0?ED>>>1:c[DK>>2]|0;eB(n,EE,EG)|0;ep(aw);ep(aA);ep(ax);ep(az);ep(ay);ex(aB,7032,15);EG=a[B6]|0;EE=(EG&1)==0?B7:c[DJ>>2]|0;ED=EG&255;EG=(ED&1|0)==0?ED>>>1:c[DI>>2]|0;eB(n,EE,EG)|0;ep(aB);ex(aE,7248,11);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ez,B)|0)|0;ex(aF,fT,lB(fT|0)|0);lC(B8|0,0,12);EG=a[B9]|0;EE=EG&255;ED=(EE&1|0)==0?EE>>>1:c[DH>>2]|0;EE=d[Ca]|0;EI=(EE&1|0)==0?EE>>>1:c[DG>>2]|0;eI(aD,(EG&1)==0?Cb:c[DF>>2]|0,ED,EI+ED|0);ED=(a[Ca]&1)==0?Cc:c[DE>>2]|0;eB(aD,ED,EI)|0;ex(aG,4944,2);lC(Cd|0,0,12);EI=a[B8]|0;ED=EI&255;EG=(ED&1|0)==0?ED>>>1:c[DD>>2]|0;ED=d[Ce]|0;EE=(ED&1|0)==0?ED>>>1:c[DC>>2]|0;eI(aC,(EI&1)==0?Cf:c[DB>>2]|0,EG,EE+EG|0);EG=(a[Ce]&1)==0?Cg:c[DA>>2]|0;eB(aC,EG,EE)|0;EE=a[Cd]|0;EG=(EE&1)==0?Ch:c[Dz>>2]|0;EI=EE&255;EE=(EI&1|0)==0?EI>>>1:c[Dy>>2]|0;eB(n,EG,EE)|0;ep(aC);ep(aG);ep(aD);ep(aF);ep(aE);ex(aJ,7216,10);EE=Ew-1|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EE,B)|0)|0;ex(aK,fT,lB(fT|0)|0);lC(Ci|0,0,12);EE=a[Cj]|0;EG=EE&255;EI=(EG&1|0)==0?EG>>>1:c[Dx>>2]|0;EG=d[Ck]|0;ED=(EG&1|0)==0?EG>>>1:c[Dw>>2]|0;eI(aI,(EE&1)==0?Cl:c[Dv>>2]|0,EI,ED+EI|0);EI=(a[Ck]&1)==0?Cm:c[Du>>2]|0;eB(aI,EI,ED)|0;ex(aL,4944,2);lC(Cn|0,0,12);ED=a[Ci]|0;EI=ED&255;EE=(EI&1|0)==0?EI>>>1:c[Dt>>2]|0;EI=d[Co]|0;EG=(EI&1|0)==0?EI>>>1:c[Ds>>2]|0;eI(aH,(ED&1)==0?Cp:c[Dr>>2]|0,EE,EG+EE|0);EE=(a[Co]&1)==0?Cq:c[Dq>>2]|0;eB(aH,EE,EG)|0;EG=a[Cn]|0;EE=(EG&1)==0?Cr:c[Dp>>2]|0;ED=EG&255;EG=(ED&1|0)==0?ED>>>1:c[Do>>2]|0;eB(n,EE,EG)|0;ep(aH);ep(aL);ep(aI);ep(aK);ep(aJ);EG=ag(En,fW)|0;if(Er){EE=EG;ED=0;while(1){EI=ag(c[k+(ED<<2)>>2]|0,EE)|0;EC=ED+1|0;if((EC|0)<(El|0)){EE=EI;ED=EC}else{EJ=EI;break}}}else{EJ=EG}ex(aO,7184,20);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EJ,B)|0)|0;ex(aP,fT,lB(fT|0)|0);lC(Cs|0,0,12);ED=a[Ct]|0;EE=ED&255;Er=(EE&1|0)==0?EE>>>1:c[Dn>>2]|0;EE=d[Cu]|0;EA=(EE&1|0)==0?EE>>>1:c[Dm>>2]|0;eI(aN,(ED&1)==0?Cv:c[Dl>>2]|0,Er,EA+Er|0);Er=(a[Cu]&1)==0?Cw:c[Dk>>2]|0;eB(aN,Er,EA)|0;ex(aQ,7e3,6);lC(Cx|0,0,12);EA=a[Cs]|0;Er=EA&255;ED=(Er&1|0)==0?Er>>>1:c[Dj>>2]|0;Er=d[Cy]|0;EE=(Er&1|0)==0?Er>>>1:c[Di>>2]|0;eI(aM,(EA&1)==0?Cz:c[Dh>>2]|0,ED,EE+ED|0);ED=(a[Cy]&1)==0?CA:c[Dg>>2]|0;eB(aM,ED,EE)|0;EE=a[Cx]|0;ED=(EE&1)==0?CB:c[Df>>2]|0;EA=EE&255;EE=(EA&1|0)==0?EA>>>1:c[De>>2]|0;eB(n,ED,EE)|0;ep(aM);ep(aQ);ep(aN);ep(aP);ep(aO);ex(aT,6960,20);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=f$,B)|0)|0;ex(aU,fT,lB(fT|0)|0);lC(CC|0,0,12);EE=a[CD]|0;ED=EE&255;EA=(ED&1|0)==0?ED>>>1:c[Dd>>2]|0;ED=d[CE]|0;Er=(ED&1|0)==0?ED>>>1:c[Dc>>2]|0;eI(aS,(EE&1)==0?CF:c[Db>>2]|0,EA,Er+EA|0);EA=(a[CE]&1)==0?CG:c[Da>>2]|0;eB(aS,EA,Er)|0;ex(aV,2520,3);lC(CH|0,0,12);Er=a[CC]|0;EA=Er&255;EE=(EA&1|0)==0?EA>>>1:c[C9>>2]|0;EA=d[CI]|0;ED=(EA&1|0)==0?EA>>>1:c[C8>>2]|0;eI(aR,(Er&1)==0?CJ:c[C7>>2]|0,EE,ED+EE|0);EE=(a[CI]&1)==0?CK:c[C6>>2]|0;eB(aR,EE,ED)|0;ED=a[CH]|0;EE=(ED&1)==0?CL:c[C5>>2]|0;Er=ED&255;ED=(Er&1|0)==0?Er>>>1:c[C4>>2]|0;eB(n,EE,ED)|0;ep(aR);ep(aV);ep(aS);ep(aU);ep(aT);ex(aY,6936,21);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=f$,B)|0)|0;ex(aZ,fT,lB(fT|0)|0);lC(CM|0,0,12);ED=a[CN]|0;EE=ED&255;Er=(EE&1|0)==0?EE>>>1:c[C3>>2]|0;EE=d[CO]|0;EA=(EE&1|0)==0?EE>>>1:c[C2>>2]|0;eI(aX,(ED&1)==0?CP:c[C1>>2]|0,Er,EA+Er|0);Er=(a[CO]&1)==0?CQ:c[C0>>2]|0;eB(aX,Er,EA)|0;ex(a_,2520,3);lC(CR|0,0,12);EA=a[CM]|0;Er=EA&255;ED=(Er&1|0)==0?Er>>>1:c[C$>>2]|0;Er=d[CS]|0;EE=(Er&1|0)==0?Er>>>1:c[C_>>2]|0;eI(aW,(EA&1)==0?CT:c[CZ>>2]|0,ED,EE+ED|0);ED=(a[CS]&1)==0?CU:c[CY>>2]|0;eB(aW,ED,EE)|0;EE=a[CR]|0;ED=(EE&1)==0?CV:c[CX>>2]|0;EA=EE&255;EE=(EA&1|0)==0?EA>>>1:c[CW>>2]|0;eB(n,ED,EE)|0;ep(aW);ep(a_);ep(aX);ep(aZ);ep(aY)}EE=~~+bk(+(+(Eq|0)));ex(a$,6920,11);ED=a[i5]|0;EA=ED&255;eB(n,(ED&1)==0?i6:c[BD>>2]|0,(EA&1|0)==0?EA>>>1:c[BC>>2]|0)|0;ep(a$);ex(a2,6904,10);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Eq-1,B)|0)|0;ex(a3,fT,lB(fT|0)|0);lC(i7|0,0,12);EA=a[i8]|0;ED=EA&255;Er=(ED&1|0)==0?ED>>>1:c[BB>>2]|0;ED=d[i9]|0;Et=(ED&1|0)==0?ED>>>1:c[BA>>2]|0;eI(a1,(EA&1)==0?ja:c[Bz>>2]|0,Er,Et+Er|0);eB(a1,(a[i9]&1)==0?jb:c[By>>2]|0,Et)|0;ex(a4,4944,2);lC(jc|0,0,12);Et=a[i7]|0;Er=Et&255;EA=(Er&1|0)==0?Er>>>1:c[Bx>>2]|0;Er=d[jd]|0;ED=(Er&1|0)==0?Er>>>1:c[Bw>>2]|0;eI(a0,(Et&1)==0?je:c[Bv>>2]|0,EA,ED+EA|0);eB(a0,(a[jd]&1)==0?jf:c[Bu>>2]|0,ED)|0;ED=a[jc]|0;EA=ED&255;eB(n,(ED&1)==0?jg:c[Bt>>2]|0,(EA&1|0)==0?EA>>>1:c[Bs>>2]|0)|0;ep(a0);ep(a4);ep(a1);ep(a3);ep(a2);ex(a7,6888,11);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EE,B)|0)|0;ex(a8,fT,lB(fT|0)|0);lC(jh|0,0,12);EA=a[ji]|0;ED=EA&255;Et=(ED&1|0)==0?ED>>>1:c[Br>>2]|0;ED=d[jj]|0;Er=(ED&1|0)==0?ED>>>1:c[Bq>>2]|0;eI(a6,(EA&1)==0?jk:c[Bp>>2]|0,Et,Er+Et|0);eB(a6,(a[jj]&1)==0?jl:c[Bo>>2]|0,Er)|0;ex(a9,4944,2);lC(jm|0,0,12);Er=a[jh]|0;Et=Er&255;EA=(Et&1|0)==0?Et>>>1:c[Bn>>2]|0;Et=d[jn]|0;ED=(Et&1|0)==0?Et>>>1:c[Bm>>2]|0;eI(a5,(Er&1)==0?jo:c[Bl>>2]|0,EA,ED+EA|0);eB(a5,(a[jn]&1)==0?jp:c[Bk>>2]|0,ED)|0;ED=a[jm]|0;EA=ED&255;eB(n,(ED&1)==0?jq:c[Bj>>2]|0,(EA&1|0)==0?EA>>>1:c[Bi>>2]|0)|0;ep(a5);ep(a9);ep(a6);ep(a8);ep(a7);ex(bc,6864,20);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Es,B)|0)|0;ex(bd,fT,lB(fT|0)|0);lC(jr|0,0,12);EA=a[js]|0;ED=EA&255;Er=(ED&1|0)==0?ED>>>1:c[Bh>>2]|0;ED=d[jt]|0;Et=(ED&1|0)==0?ED>>>1:c[Bg>>2]|0;eI(bb,(EA&1)==0?ju:c[Bf>>2]|0,Er,Et+Er|0);eB(bb,(a[jt]&1)==0?jv:c[Be>>2]|0,Et)|0;ex(be,2144,6);lC(jw|0,0,12);Et=a[jr]|0;Er=Et&255;EA=(Er&1|0)==0?Er>>>1:c[Bd>>2]|0;Er=d[jx]|0;ED=(Er&1|0)==0?Er>>>1:c[Bc>>2]|0;eI(ba,(Et&1)==0?jy:c[Bb>>2]|0,EA,ED+EA|0);eB(ba,(a[jx]&1)==0?jz:c[Ba>>2]|0,ED)|0;ED=a[jw]|0;EA=ED&255;eB(n,(ED&1)==0?jA:c[A9>>2]|0,(EA&1|0)==0?EA>>>1:c[A8>>2]|0)|0;ep(ba);ep(be);ep(bb);ep(bd);ep(bc);do{if(jB){ex(bf,6840,20);EA=a[jC]|0;ED=(EA&1)==0?jD:c[kR>>2]|0;Et=EA&255;EA=(Et&1|0)==0?Et>>>1:c[kQ>>2]|0;eB(n,ED,EA)|0;ep(bf);ex(bh,6808,20);EA=a[jE]|0;ED=(EA&1)==0?jF:c[kP>>2]|0;Et=EA&255;EA=(Et&1|0)==0?Et>>>1:c[kO>>2]|0;eB(n,ED,EA)|0;ep(bh);EA=(Eo|0)>0;if(!EA){break}ED=ag(Ey,Es)|0;Et=0;do{ex(bn,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Et,B)|0)|0;ex(bo,fT,lB(fT|0)|0);lC(ke|0,0,12);Er=a[kf]|0;EF=Er&255;EI=(EF&1|0)==0?EF>>>1:c[kN>>2]|0;EF=d[kg]|0;EC=(EF&1|0)==0?EF>>>1:c[kM>>2]|0;eI(bm,(Er&1)==0?kh:c[kL>>2]|0,EI,EC+EI|0);eB(bm,(a[kg]&1)==0?ki:c[kK>>2]|0,EC)|0;ex(bp,14632,14);lC(kj|0,0,12);EC=a[ke]|0;EI=EC&255;Er=(EI&1|0)==0?EI>>>1:c[kJ>>2]|0;EI=d[kk]|0;EF=(EI&1|0)==0?EI>>>1:c[kI>>2]|0;eI(bl,(EC&1)==0?kl:c[kH>>2]|0,Er,EF+Er|0);eB(bl,(a[kk]&1)==0?km:c[kG>>2]|0,EF)|0;EF=ag(ED,Et)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EF,B)|0)|0;ex(bq,fT,lB(fT|0)|0);lC(kn|0,0,12);EF=a[kj]|0;Er=EF&255;EC=(Er&1|0)==0?Er>>>1:c[kF>>2]|0;Er=d[ko]|0;EI=(Er&1|0)==0?Er>>>1:c[kE>>2]|0;eI(bj,(EF&1)==0?kp:c[kD>>2]|0,EC,EI+EC|0);eB(bj,(a[ko]&1)==0?kq:c[kC>>2]|0,EI)|0;ex(br,7072,3);lC(kr|0,0,12);EI=a[kn]|0;EC=EI&255;EF=(EC&1|0)==0?EC>>>1:c[kB>>2]|0;EC=d[ks]|0;Er=(EC&1|0)==0?EC>>>1:c[kA>>2]|0;eI(bi,(EI&1)==0?kt:c[kz>>2]|0,EF,Er+EF|0);eB(bi,(a[ks]&1)==0?ku:c[ky>>2]|0,Er)|0;Er=a[kr]|0;EF=Er&255;eB(n,(Er&1)==0?kv:c[kx>>2]|0,(EF&1|0)==0?EF>>>1:c[kw>>2]|0)|0;ep(bi);ep(br);ep(bj);ep(bq);ep(bl);ep(bp);ep(bm);ep(bo);ep(bn);Et=Et+1|0;}while((Et|0)<(Eo|0));if(!EA){break}Et=ag(Ey,Es)|0;ED=0;do{ex(bw,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(bx,fT,lB(fT|0)|0);lC(jG|0,0,12);EF=a[jH]|0;Er=EF&255;EI=(Er&1|0)==0?Er>>>1:c[kd>>2]|0;Er=d[jI]|0;EC=(Er&1|0)==0?Er>>>1:c[kc>>2]|0;eI(bv,(EF&1)==0?jJ:c[kb>>2]|0,EI,EC+EI|0);eB(bv,(a[jI]&1)==0?jK:c[ka>>2]|0,EC)|0;ex(by,14576,14);lC(jL|0,0,12);EC=a[jG]|0;EI=EC&255;EF=(EI&1|0)==0?EI>>>1:c[j9>>2]|0;EI=d[jM]|0;Er=(EI&1|0)==0?EI>>>1:c[j8>>2]|0;eI(bu,(EC&1)==0?jN:c[j7>>2]|0,EF,Er+EF|0);eB(bu,(a[jM]&1)==0?jO:c[j6>>2]|0,Er)|0;Er=ag(Et,ED)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Er,B)|0)|0;ex(bz,fT,lB(fT|0)|0);lC(jP|0,0,12);Er=a[jL]|0;EF=Er&255;EC=(EF&1|0)==0?EF>>>1:c[j5>>2]|0;EF=d[jQ]|0;EI=(EF&1|0)==0?EF>>>1:c[j4>>2]|0;eI(bt,(Er&1)==0?jR:c[j3>>2]|0,EC,EI+EC|0);eB(bt,(a[jQ]&1)==0?jS:c[j2>>2]|0,EI)|0;ex(bA,7072,3);lC(jT|0,0,12);EI=a[jP]|0;EC=EI&255;Er=(EC&1|0)==0?EC>>>1:c[j1>>2]|0;EC=d[jU]|0;EF=(EC&1|0)==0?EC>>>1:c[j0>>2]|0;eI(bs,(EI&1)==0?jV:c[j$>>2]|0,Er,EF+Er|0);eB(bs,(a[jU]&1)==0?jW:c[j_>>2]|0,EF)|0;EF=a[jT]|0;Er=EF&255;eB(n,(EF&1)==0?jX:c[jZ>>2]|0,(Er&1|0)==0?Er>>>1:c[jY>>2]|0)|0;ep(bs);ep(bA);ep(bt);ep(bz);ep(bu);ep(by);ep(bv);ep(bx);ep(bw);ED=ED+1|0;}while((ED|0)<(Eo|0))}else{ex(bB,6768,15);ED=a[Aw]|0;Et=ED&255;eB(n,(ED&1)==0?Ax:c[A7>>2]|0,(Et&1|0)==0?Et>>>1:c[A6>>2]|0)|0;ep(bB);if((Eo|0)<=0){break}Et=ag(Ey,Es)|0;ED=0;do{ex(bG,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(bH,fT,lB(fT|0)|0);lC(Ay|0,0,12);EA=a[Az]|0;Er=EA&255;EF=(Er&1|0)==0?Er>>>1:c[A5>>2]|0;Er=d[AA]|0;EI=(Er&1|0)==0?Er>>>1:c[A4>>2]|0;eI(bF,(EA&1)==0?AB:c[A3>>2]|0,EF,EI+EF|0);eB(bF,(a[AA]&1)==0?AC:c[A2>>2]|0,EI)|0;ex(bI,14720,7);lC(AD|0,0,12);EI=a[Ay]|0;EF=EI&255;EA=(EF&1|0)==0?EF>>>1:c[A1>>2]|0;EF=d[AE]|0;Er=(EF&1|0)==0?EF>>>1:c[A0>>2]|0;eI(bE,(EI&1)==0?AF:c[A$>>2]|0,EA,Er+EA|0);eB(bE,(a[AE]&1)==0?AG:c[A_>>2]|0,Er)|0;Er=ag(Et,ED)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Er,B)|0)|0;ex(bJ,fT,lB(fT|0)|0);lC(AH|0,0,12);Er=a[AD]|0;EA=Er&255;EI=(EA&1|0)==0?EA>>>1:c[AZ>>2]|0;EA=d[AI]|0;EF=(EA&1|0)==0?EA>>>1:c[AY>>2]|0;eI(bD,(Er&1)==0?AJ:c[AX>>2]|0,EI,EF+EI|0);eB(bD,(a[AI]&1)==0?AK:c[AW>>2]|0,EF)|0;ex(bK,7072,3);lC(AL|0,0,12);EF=a[AH]|0;EI=EF&255;Er=(EI&1|0)==0?EI>>>1:c[AV>>2]|0;EI=d[AM]|0;EA=(EI&1|0)==0?EI>>>1:c[AU>>2]|0;eI(bC,(EF&1)==0?AN:c[AT>>2]|0,Er,EA+Er|0);eB(bC,(a[AM]&1)==0?AO:c[AS>>2]|0,EA)|0;EA=a[AL]|0;Er=EA&255;eB(n,(EA&1)==0?AP:c[AR>>2]|0,(Er&1|0)==0?Er>>>1:c[AQ>>2]|0)|0;ep(bC);ep(bK);ep(bD);ep(bJ);ep(bE);ep(bI);ep(bF);ep(bH);ep(bG);ED=ED+1|0;}while((ED|0)<(Eo|0))}}while(0);ex(bN,6744,9);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Eo,B)|0)|0;ex(bO,fT,lB(fT|0)|0);lC(kS|0,0,12);Ey=a[kT]|0;EG=Ey&255;ED=(EG&1|0)==0?EG>>>1:c[Av>>2]|0;EG=d[kU]|0;Et=(EG&1|0)==0?EG>>>1:c[Au>>2]|0;eI(bM,(Ey&1)==0?kV:c[At>>2]|0,ED,Et+ED|0);eB(bM,(a[kU]&1)==0?kW:c[As>>2]|0,Et)|0;ex(bP,6728,10);lC(kX|0,0,12);Et=a[kS]|0;ED=Et&255;Ey=(ED&1|0)==0?ED>>>1:c[Ar>>2]|0;ED=d[kY]|0;EG=(ED&1|0)==0?ED>>>1:c[Aq>>2]|0;eI(bL,(Et&1)==0?kZ:c[Ap>>2]|0,Ey,EG+Ey|0);eB(bL,(a[kY]&1)==0?k_:c[Ao>>2]|0,EG)|0;EG=a[kX]|0;Ey=EG&255;eB(n,(EG&1)==0?k$:c[An>>2]|0,(Ey&1|0)==0?Ey>>>1:c[Am>>2]|0)|0;ep(bL);ep(bP);ep(bM);ep(bO);ep(bN);do{if((Ep|0)>1){if((Eo|0)>1){Ey=1;do{ex(bU,6704,21);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(bV,fT,lB(fT|0)|0);lC(za|0,0,12);EG=a[zb]|0;Et=EG&255;ED=(Et&1|0)==0?Et>>>1:c[Al>>2]|0;Et=d[zc]|0;Er=(Et&1|0)==0?Et>>>1:c[Ak>>2]|0;eI(bT,(EG&1)==0?zd:c[Aj>>2]|0,ED,Er+ED|0);eB(bT,(a[zc]&1)==0?ze:c[Ai>>2]|0,Er)|0;ex(bW,6696,1);lC(zf|0,0,12);Er=a[za]|0;ED=Er&255;EG=(ED&1|0)==0?ED>>>1:c[Ah>>2]|0;ED=d[zg]|0;Et=(ED&1|0)==0?ED>>>1:c[Ag>>2]|0;eI(bS,(Er&1)==0?zh:c[Af>>2]|0,EG,Et+EG|0);eB(bS,(a[zg]&1)==0?zi:c[Ae>>2]|0,Et)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=En,B)|0)|0;ex(bX,fT,lB(fT|0)|0);lC(zj|0,0,12);Et=a[zf]|0;EG=Et&255;Er=(EG&1|0)==0?EG>>>1:c[Ad>>2]|0;EG=d[zk]|0;ED=(EG&1|0)==0?EG>>>1:c[Ac>>2]|0;eI(bR,(Et&1)==0?zl:c[Ab>>2]|0,Er,ED+Er|0);eB(bR,(a[zk]&1)==0?zm:c[Aa>>2]|0,ED)|0;ex(bY,6688,5);lC(zn|0,0,12);ED=a[zj]|0;Er=ED&255;Et=(Er&1|0)==0?Er>>>1:c[z9>>2]|0;Er=d[zo]|0;EG=(Er&1|0)==0?Er>>>1:c[z8>>2]|0;eI(bQ,(ED&1)==0?zp:c[z7>>2]|0,Et,EG+Et|0);eB(bQ,(a[zo]&1)==0?zq:c[z6>>2]|0,EG)|0;EG=a[zn]|0;Et=EG&255;eB(n,(EG&1)==0?zr:c[z5>>2]|0,(Et&1|0)==0?Et>>>1:c[z4>>2]|0)|0;ep(bQ);ep(bY);ep(bR);ep(bX);ep(bS);ep(bW);ep(bT);ep(bV);ep(bU);ex(bZ,6632,48);Et=a[zs]|0;EG=Et&255;eB(n,(Et&1)==0?zt:c[z3>>2]|0,(EG&1|0)==0?EG>>>1:c[z2>>2]|0)|0;ep(bZ);ex(b2,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(b3,fT,lB(fT|0)|0);lC(zu|0,0,12);EG=a[zv]|0;Et=EG&255;ED=(Et&1|0)==0?Et>>>1:c[z1>>2]|0;Et=d[zw]|0;Er=(Et&1|0)==0?Et>>>1:c[z0>>2]|0;eI(b1,(EG&1)==0?zx:c[z$>>2]|0,ED,Er+ED|0);eB(b1,(a[zw]&1)==0?zy:c[z_>>2]|0,Er)|0;ex(b4,1304,17);lC(zz|0,0,12);Er=a[zu]|0;ED=Er&255;EG=(ED&1|0)==0?ED>>>1:c[zZ>>2]|0;ED=d[zA]|0;Et=(ED&1|0)==0?ED>>>1:c[zY>>2]|0;eI(b0,(Er&1)==0?zB:c[zX>>2]|0,EG,Et+EG|0);eB(b0,(a[zA]&1)==0?zC:c[zW>>2]|0,Et)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(b5,fT,lB(fT|0)|0);lC(zD|0,0,12);Et=a[zz]|0;EG=Et&255;Er=(EG&1|0)==0?EG>>>1:c[zV>>2]|0;EG=d[zE]|0;ED=(EG&1|0)==0?EG>>>1:c[zU>>2]|0;eI(b$,(Et&1)==0?zF:c[zT>>2]|0,Er,ED+Er|0);eB(b$,(a[zE]&1)==0?zG:c[zS>>2]|0,ED)|0;ex(b6,1272,7);lC(zH|0,0,12);ED=a[zD]|0;Er=ED&255;Et=(Er&1|0)==0?Er>>>1:c[zR>>2]|0;Er=d[zI]|0;EG=(Er&1|0)==0?Er>>>1:c[zQ>>2]|0;eI(b_,(ED&1)==0?zJ:c[zP>>2]|0,Et,EG+Et|0);eB(b_,(a[zI]&1)==0?zK:c[zO>>2]|0,EG)|0;EG=a[zH]|0;Et=EG&255;eB(n,(EG&1)==0?zL:c[zN>>2]|0,(Et&1|0)==0?Et>>>1:c[zM>>2]|0)|0;ep(b_);ep(b6);ep(b$);ep(b5);ep(b0);ep(b4);ep(b1);ep(b3);ep(b2);Ey=Ey+1|0;}while((Ey|0)<(Eo|0))}ex(b9,6608,19);Ey=ag(Ev,Eu)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(ca,fT,lB(fT|0)|0);lC(vG|0,0,12);Ey=a[vH]|0;Et=Ey&255;EG=(Et&1|0)==0?Et>>>1:c[y9>>2]|0;Et=d[vI]|0;ED=(Et&1|0)==0?Et>>>1:c[y8>>2]|0;eI(b8,(Ey&1)==0?vJ:c[y7>>2]|0,EG,ED+EG|0);EG=(a[vI]&1)==0?vK:c[y6>>2]|0;eB(b8,EG,ED)|0;ex(cb,2144,6);lC(vL|0,0,12);ED=a[vG]|0;EG=ED&255;Ey=(EG&1|0)==0?EG>>>1:c[y5>>2]|0;EG=d[vM]|0;Et=(EG&1|0)==0?EG>>>1:c[y4>>2]|0;eI(b7,(ED&1)==0?vN:c[y3>>2]|0,Ey,Et+Ey|0);Ey=(a[vM]&1)==0?vO:c[y2>>2]|0;eB(b7,Ey,Et)|0;Et=a[vL]|0;Ey=(Et&1)==0?vP:c[y1>>2]|0;ED=Et&255;Et=(ED&1|0)==0?ED>>>1:c[y0>>2]|0;eB(n,Ey,Et)|0;ep(b7);ep(cb);ep(b8);ep(ca);ep(b9);ex(cc,6560,24);Et=a[vQ]|0;Ey=(Et&1)==0?vR:c[y$>>2]|0;ED=Et&255;Et=(ED&1|0)==0?ED>>>1:c[y_>>2]|0;eB(n,Ey,Et)|0;ep(cc);ex(cd,6528,27);Et=a[vS]|0;Ey=(Et&1)==0?vT:c[yZ>>2]|0;ED=Et&255;Et=(ED&1|0)==0?ED>>>1:c[yY>>2]|0;eB(n,Ey,Et)|0;ep(cd);Et=(Eo|0)>0;if(Et){Ey=0;do{ex(ci,6480,10);ED=ag(Ey,Eu)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(cj,fT,lB(fT|0)|0);lC(yo|0,0,12);ED=a[yp]|0;EG=ED&255;Er=(EG&1|0)==0?EG>>>1:c[yX>>2]|0;EG=d[yq]|0;EA=(EG&1|0)==0?EG>>>1:c[yW>>2]|0;eI(ch,(ED&1)==0?yr:c[yV>>2]|0,Er,EA+Er|0);eB(ch,(a[yq]&1)==0?ys:c[yU>>2]|0,EA)|0;ex(ck,4776,6);lC(yt|0,0,12);EA=a[yo]|0;Er=EA&255;ED=(Er&1|0)==0?Er>>>1:c[yT>>2]|0;Er=d[yu]|0;EG=(Er&1|0)==0?Er>>>1:c[yS>>2]|0;eI(cg,(EA&1)==0?yv:c[yR>>2]|0,ED,EG+ED|0);eB(cg,(a[yu]&1)==0?yw:c[yQ>>2]|0,EG)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(cl,fT,lB(fT|0)|0);lC(yx|0,0,12);EG=a[yt]|0;ED=EG&255;EA=(ED&1|0)==0?ED>>>1:c[yP>>2]|0;ED=d[yy]|0;Er=(ED&1|0)==0?ED>>>1:c[yO>>2]|0;eI(cf,(EG&1)==0?yz:c[yN>>2]|0,EA,Er+EA|0);eB(cf,(a[yy]&1)==0?yA:c[yM>>2]|0,Er)|0;ex(cm,4672,5);lC(yB|0,0,12);Er=a[yx]|0;EA=Er&255;EG=(EA&1|0)==0?EA>>>1:c[yL>>2]|0;EA=d[yC]|0;ED=(EA&1|0)==0?EA>>>1:c[yK>>2]|0;eI(ce,(Er&1)==0?yD:c[yJ>>2]|0,EG,ED+EG|0);eB(ce,(a[yC]&1)==0?yE:c[yI>>2]|0,ED)|0;ED=a[yB]|0;EG=ED&255;eB(n,(ED&1)==0?yF:c[yH>>2]|0,(EG&1|0)==0?EG>>>1:c[yG>>2]|0)|0;ep(ce);ep(cm);ep(cf);ep(cl);ep(cg);ep(ck);ep(ch);ep(cj);ep(ci);Ey=Ey+1|0;}while((Ey|0)<(Eo|0))}ex(cn,6440,30);Ey=a[vU]|0;EG=(Ey&1)==0?vV:c[yn>>2]|0;ED=Ey&255;Ey=(ED&1|0)==0?ED>>>1:c[ym>>2]|0;eB(n,EG,Ey)|0;ep(cn);Ey=(Ev|0)>0;if(Ey){EG=(Ep|0)>0;ED=0;do{if(EG){Er=ag(ED,Ep)|0;EA=ag(ED,Eu)|0;EF=0;do{ex(ct,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EF+Er,B)|0)|0;ex(cu,fT,lB(fT|0)|0);lC(xO|0,0,12);EI=a[xP]|0;EC=EI&255;EK=(EC&1|0)==0?EC>>>1:c[yl>>2]|0;EC=d[xQ]|0;EL=(EC&1|0)==0?EC>>>1:c[yk>>2]|0;eI(cs,(EI&1)==0?xR:c[yj>>2]|0,EK,EL+EK|0);eB(cs,(a[xQ]&1)==0?xS:c[yi>>2]|0,EL)|0;ex(cv,15200,15);lC(xT|0,0,12);EL=a[xO]|0;EK=EL&255;EI=(EK&1|0)==0?EK>>>1:c[yh>>2]|0;EK=d[xU]|0;EC=(EK&1|0)==0?EK>>>1:c[yg>>2]|0;eI(cq,(EL&1)==0?xV:c[yf>>2]|0,EI,EC+EI|0);eB(cq,(a[xU]&1)==0?xW:c[ye>>2]|0,EC)|0;EC=(ag(EF,Eq)|0)+EA|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EC,B)|0)|0;ex(cw,fT,lB(fT|0)|0);lC(xX|0,0,12);EC=a[xT]|0;EI=EC&255;EL=(EI&1|0)==0?EI>>>1:c[yd>>2]|0;EI=d[xY]|0;EK=(EI&1|0)==0?EI>>>1:c[yc>>2]|0;eI(cp,(EC&1)==0?xZ:c[yb>>2]|0,EL,EK+EL|0);eB(cp,(a[xY]&1)==0?x_:c[ya>>2]|0,EK)|0;ex(cx,7072,3);lC(x$|0,0,12);EK=a[xX]|0;EL=EK&255;EC=(EL&1|0)==0?EL>>>1:c[x9>>2]|0;EL=d[x0]|0;EI=(EL&1|0)==0?EL>>>1:c[x8>>2]|0;eI(co,(EK&1)==0?x1:c[x7>>2]|0,EC,EI+EC|0);eB(co,(a[x0]&1)==0?x2:c[x6>>2]|0,EI)|0;EI=a[x$]|0;EC=EI&255;eB(n,(EI&1)==0?x3:c[x5>>2]|0,(EC&1|0)==0?EC>>>1:c[x4>>2]|0)|0;ep(co);ep(cx);ep(cp);ep(cw);ep(cq);ep(cv);ep(cs);ep(cu);ep(ct);EF=EF+1|0;}while((EF|0)<(Ep|0))}ED=ED+1|0;}while((ED|0)<(Ev|0))}ex(cy,6440,30);ED=a[vW]|0;EG=(ED&1)==0?vX:c[xN>>2]|0;EF=ED&255;ED=(EF&1|0)==0?EF>>>1:c[xM>>2]|0;eB(n,EG,ED)|0;ep(cy);if(Et){ED=0;do{ex(cD,6480,10);EG=ag(ED,Eu)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EG,B)|0)|0;ex(cE,fT,lB(fT|0)|0);lC(xc|0,0,12);EG=a[xd]|0;EF=EG&255;EA=(EF&1|0)==0?EF>>>1:c[xL>>2]|0;EF=d[xe]|0;Er=(EF&1|0)==0?EF>>>1:c[xK>>2]|0;eI(cC,(EG&1)==0?xf:c[xJ>>2]|0,EA,Er+EA|0);eB(cC,(a[xe]&1)==0?xg:c[xI>>2]|0,Er)|0;ex(cF,4776,6);lC(xh|0,0,12);Er=a[xc]|0;EA=Er&255;EG=(EA&1|0)==0?EA>>>1:c[xH>>2]|0;EA=d[xi]|0;EF=(EA&1|0)==0?EA>>>1:c[xG>>2]|0;eI(cB,(Er&1)==0?xj:c[xF>>2]|0,EG,EF+EG|0);eB(cB,(a[xi]&1)==0?xk:c[xE>>2]|0,EF)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(cG,fT,lB(fT|0)|0);lC(xl|0,0,12);EF=a[xh]|0;EG=EF&255;Er=(EG&1|0)==0?EG>>>1:c[xD>>2]|0;EG=d[xm]|0;EA=(EG&1|0)==0?EG>>>1:c[xC>>2]|0;eI(cA,(EF&1)==0?xn:c[xB>>2]|0,Er,EA+Er|0);eB(cA,(a[xm]&1)==0?xo:c[xA>>2]|0,EA)|0;ex(cH,4440,5);lC(xp|0,0,12);EA=a[xl]|0;Er=EA&255;EF=(Er&1|0)==0?Er>>>1:c[xz>>2]|0;Er=d[xq]|0;EG=(Er&1|0)==0?Er>>>1:c[xy>>2]|0;eI(cz,(EA&1)==0?xr:c[xx>>2]|0,EF,EG+EF|0);eB(cz,(a[xq]&1)==0?xs:c[xw>>2]|0,EG)|0;EG=a[xp]|0;EF=EG&255;eB(n,(EG&1)==0?xt:c[xv>>2]|0,(EF&1|0)==0?EF>>>1:c[xu>>2]|0)|0;ep(cz);ep(cH);ep(cA);ep(cG);ep(cB);ep(cF);ep(cC);ep(cE);ep(cD);ED=ED+1|0;}while((ED|0)<(Eo|0))}ex(cI,6440,30);ED=a[vY]|0;Et=(ED&1)==0?vZ:c[xb>>2]|0;EF=ED&255;ED=(EF&1|0)==0?EF>>>1:c[xa>>2]|0;eB(n,Et,ED)|0;ep(cI);if(Ey){ED=(Ep|0)>0;Et=0;do{if(ED){EF=ag(Et,Ep)|0;EG=ag(Et,Eu)|0;EA=0;do{ex(cN,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EA+EF,B)|0)|0;ex(cO,fT,lB(fT|0)|0);lC(wC|0,0,12);Er=a[wD]|0;EC=Er&255;EI=(EC&1|0)==0?EC>>>1:c[w9>>2]|0;EC=d[wE]|0;EK=(EC&1|0)==0?EC>>>1:c[w8>>2]|0;eI(cM,(Er&1)==0?wF:c[w7>>2]|0,EI,EK+EI|0);eB(cM,(a[wE]&1)==0?wG:c[w6>>2]|0,EK)|0;ex(cP,15136,15);lC(wH|0,0,12);EK=a[wC]|0;EI=EK&255;Er=(EI&1|0)==0?EI>>>1:c[w5>>2]|0;EI=d[wI]|0;EC=(EI&1|0)==0?EI>>>1:c[w4>>2]|0;eI(cL,(EK&1)==0?wJ:c[w3>>2]|0,Er,EC+Er|0);eB(cL,(a[wI]&1)==0?wK:c[w2>>2]|0,EC)|0;EC=(ag(EA,Eq)|0)+EG|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EC,B)|0)|0;ex(cQ,fT,lB(fT|0)|0);lC(wL|0,0,12);EC=a[wH]|0;Er=EC&255;EK=(Er&1|0)==0?Er>>>1:c[w1>>2]|0;Er=d[wM]|0;EI=(Er&1|0)==0?Er>>>1:c[w0>>2]|0;eI(cK,(EC&1)==0?wN:c[w$>>2]|0,EK,EI+EK|0);eB(cK,(a[wM]&1)==0?wO:c[w_>>2]|0,EI)|0;ex(cR,7072,3);lC(wP|0,0,12);EI=a[wL]|0;EK=EI&255;EC=(EK&1|0)==0?EK>>>1:c[wZ>>2]|0;EK=d[wQ]|0;Er=(EK&1|0)==0?EK>>>1:c[wY>>2]|0;eI(cJ,(EI&1)==0?wR:c[wX>>2]|0,EC,Er+EC|0);eB(cJ,(a[wQ]&1)==0?wS:c[wW>>2]|0,Er)|0;Er=a[wP]|0;EC=Er&255;eB(n,(Er&1)==0?wT:c[wV>>2]|0,(EC&1|0)==0?EC>>>1:c[wU>>2]|0)|0;ep(cJ);ep(cR);ep(cK);ep(cQ);ep(cL);ep(cP);ep(cM);ep(cO);ep(cN);EA=EA+1|0;}while((EA|0)<(Ep|0))}Et=Et+1|0;}while((Et|0)<(Ev|0))}ex(cS,6440,30);Et=a[v_]|0;ED=(Et&1)==0?v$:c[wB>>2]|0;EA=Et&255;Et=(EA&1|0)==0?EA>>>1:c[wA>>2]|0;eB(n,ED,Et)|0;ep(cS);if(Ey){EM=0}else{break}do{ex(cX,6744,9);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ep,B)|0)|0;ex(cY,fT,lB(fT|0)|0);lC(v0|0,0,12);Et=a[v1]|0;ED=Et&255;EA=(ED&1|0)==0?ED>>>1:c[wz>>2]|0;ED=d[v2]|0;EG=(ED&1|0)==0?ED>>>1:c[wy>>2]|0;eI(cW,(Et&1)==0?v3:c[wx>>2]|0,EA,EG+EA|0);eB(cW,(a[v2]&1)==0?v4:c[ww>>2]|0,EG)|0;ex(cZ,6432,5);lC(v5|0,0,12);EG=a[v0]|0;EA=EG&255;Et=(EA&1|0)==0?EA>>>1:c[wv>>2]|0;EA=d[v6]|0;ED=(EA&1|0)==0?EA>>>1:c[wu>>2]|0;eI(cV,(EG&1)==0?v7:c[wt>>2]|0,Et,ED+Et|0);eB(cV,(a[v6]&1)==0?v8:c[ws>>2]|0,ED)|0;ED=ag(EM,Ep)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(c_,fT,lB(fT|0)|0);lC(v9|0,0,12);ED=a[v5]|0;Et=ED&255;EG=(Et&1|0)==0?Et>>>1:c[wr>>2]|0;Et=d[wa]|0;EA=(Et&1|0)==0?Et>>>1:c[wq>>2]|0;eI(cU,(ED&1)==0?wb:c[wp>>2]|0,EG,EA+EG|0);eB(cU,(a[wa]&1)==0?wc:c[wo>>2]|0,EA)|0;ex(c$,1176,8);lC(wd|0,0,12);EA=a[v9]|0;EG=EA&255;ED=(EG&1|0)==0?EG>>>1:c[wn>>2]|0;EG=d[we]|0;Et=(EG&1|0)==0?EG>>>1:c[wm>>2]|0;eI(cT,(EA&1)==0?wf:c[wl>>2]|0,ED,Et+ED|0);eB(cT,(a[we]&1)==0?wg:c[wk>>2]|0,Et)|0;Et=a[wd]|0;ED=Et&255;eB(n,(Et&1)==0?wh:c[wj>>2]|0,(ED&1|0)==0?ED>>>1:c[wi>>2]|0)|0;ep(cT);ep(c$);ep(cU);ep(c_);ep(cV);ep(cZ);ep(cW);ep(cY);ep(cX);EM=EM+1|0;}while((EM|0)<(Ev|0))}}while(0);do{if((El|0)<(f8|0)){ex(c4,6416,14);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EE,B)|0)|0;ex(c5,fT,lB(fT|0)|0);lC(k0|0,0,12);Ey=a[k1]|0;ED=Ey&255;Et=(ED&1|0)==0?ED>>>1:c[nb>>2]|0;ED=d[k2]|0;EA=(ED&1|0)==0?ED>>>1:c[na>>2]|0;eI(c3,(Ey&1)==0?k3:c[m9>>2]|0,Et,EA+Et|0);Et=(a[k2]&1)==0?k4:c[m8>>2]|0;eB(c3,Et,EA)|0;ex(c6,6400,10);lC(k5|0,0,12);EA=a[k0]|0;Et=EA&255;Ey=(Et&1|0)==0?Et>>>1:c[m7>>2]|0;Et=d[k6]|0;ED=(Et&1|0)==0?Et>>>1:c[m6>>2]|0;eI(c2,(EA&1)==0?k7:c[m5>>2]|0,Ey,ED+Ey|0);Ey=(a[k6]&1)==0?k8:c[m4>>2]|0;eB(c2,Ey,ED)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ez,B)|0)|0;ex(c7,fT,lB(fT|0)|0);lC(k9|0,0,12);ED=a[k5]|0;Ey=ED&255;EA=(Ey&1|0)==0?Ey>>>1:c[m3>>2]|0;Ey=d[la]|0;Et=(Ey&1|0)==0?Ey>>>1:c[m2>>2]|0;eI(c1,(ED&1)==0?lb:c[m1>>2]|0,EA,Et+EA|0);EA=(a[la]&1)==0?lc:c[m0>>2]|0;eB(c1,EA,Et)|0;ex(c9,4944,2);lC(ld|0,0,12);Et=a[k9]|0;EA=Et&255;ED=(EA&1|0)==0?EA>>>1:c[m$>>2]|0;EA=d[le]|0;Ey=(EA&1|0)==0?EA>>>1:c[m_>>2]|0;eI(c0,(Et&1)==0?lf:c[mZ>>2]|0,ED,Ey+ED|0);ED=(a[le]&1)==0?lg:c[mY>>2]|0;eB(c0,ED,Ey)|0;Ey=a[ld]|0;ED=(Ey&1)==0?lh:c[mX>>2]|0;Et=Ey&255;Ey=(Et&1|0)==0?Et>>>1:c[mW>>2]|0;eB(n,ED,Ey)|0;ep(c0);ep(c9);ep(c1);ep(c7);ep(c2);ep(c6);ep(c3);ep(c5);ep(c4);ex(dd,6384,9);Ey=~~+bk(+(+(Ev|0)));bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(de,fT,lB(fT|0)|0);lC(li|0,0,12);Ey=a[lj]|0;ED=Ey&255;Et=(ED&1|0)==0?ED>>>1:c[mV>>2]|0;ED=d[ll]|0;EA=(ED&1|0)==0?ED>>>1:c[mU>>2]|0;eI(db,(Ey&1)==0?lm:c[mT>>2]|0,Et,EA+Et|0);Et=(a[ll]&1)==0?ln:c[mS>>2]|0;eB(db,Et,EA)|0;ex(df,4944,2);lC(lo|0,0,12);EA=a[li]|0;Et=EA&255;Ey=(Et&1|0)==0?Et>>>1:c[mR>>2]|0;Et=d[lp]|0;ED=(Et&1|0)==0?Et>>>1:c[mQ>>2]|0;eI(da,(EA&1)==0?lq:c[mP>>2]|0,Ey,ED+Ey|0);Ey=(a[lp]&1)==0?lr:c[mO>>2]|0;eB(da,Ey,ED)|0;ED=a[lo]|0;Ey=(ED&1)==0?ls:c[mN>>2]|0;EA=ED&255;ED=(EA&1|0)==0?EA>>>1:c[mM>>2]|0;eB(n,Ey,ED)|0;ep(da);ep(df);ep(db);ep(de);ep(dd);ex(di,6360,22);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ej,B)|0)|0;ex(dj,fT,lB(fT|0)|0);lC(lt|0,0,12);ED=a[lu]|0;Ey=ED&255;EA=(Ey&1|0)==0?Ey>>>1:c[mL>>2]|0;Ey=d[lv]|0;Et=(Ey&1|0)==0?Ey>>>1:c[mK>>2]|0;eI(dh,(ED&1)==0?lw:c[mJ>>2]|0,EA,Et+EA|0);EA=(a[lv]&1)==0?lx:c[mI>>2]|0;eB(dh,EA,Et)|0;ex(dk,6352,5);lC(ly|0,0,12);Et=a[lt]|0;EA=Et&255;ED=(EA&1|0)==0?EA>>>1:c[mH>>2]|0;EA=d[lz]|0;Ey=(EA&1|0)==0?EA>>>1:c[mG>>2]|0;eI(dg,(Et&1)==0?lD:c[mF>>2]|0,ED,Ey+ED|0);ED=(a[lz]&1)==0?lE:c[mE>>2]|0;eB(dg,ED,Ey)|0;Ey=a[ly]|0;ED=(Ey&1)==0?lF:c[mD>>2]|0;Et=Ey&255;Ey=(Et&1|0)==0?Et>>>1:c[mC>>2]|0;eB(n,ED,Ey)|0;ep(dg);ep(dk);ep(dh);ep(dj);ep(di);if((Eo|0)>0){EN=0}else{break}do{ex(dn,6208,16);Ey=(ag((EN|0)%(Ep|0)|0,Eo)|0)+((EN|0)/(Ep|0)|0)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(dp,fT,lB(fT|0)|0);lC(lG|0,0,12);Ey=a[lH]|0;ED=Ey&255;Et=(ED&1|0)==0?ED>>>1:c[mB>>2]|0;ED=d[lI]|0;EA=(ED&1|0)==0?ED>>>1:c[mA>>2]|0;eI(dm,(Ey&1)==0?lJ:c[mz>>2]|0,Et,EA+Et|0);eB(dm,(a[lI]&1)==0?lK:c[my>>2]|0,EA)|0;ex(dq,2520,3);lC(lL|0,0,12);EA=a[lG]|0;Et=EA&255;Ey=(Et&1|0)==0?Et>>>1:c[mx>>2]|0;Et=d[lM]|0;ED=(Et&1|0)==0?Et>>>1:c[mw>>2]|0;eI(dl,(EA&1)==0?lN:c[mv>>2]|0,Ey,ED+Ey|0);eB(dl,(a[lM]&1)==0?lO:c[mu>>2]|0,ED)|0;ED=a[lL]|0;Ey=ED&255;eB(n,(ED&1)==0?lP:c[mt>>2]|0,(Ey&1|0)==0?Ey>>>1:c[ms>>2]|0)|0;ep(dl);ep(dq);ep(dm);ep(dp);ep(dn);ex(dr,6632,48);Ey=a[lQ]|0;ED=Ey&255;eB(n,(Ey&1)==0?lR:c[mr>>2]|0,(ED&1|0)==0?ED>>>1:c[mq>>2]|0)|0;ep(dr);ex(dw,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EN,B)|0)|0;ex(dx,fT,lB(fT|0)|0);lC(lS|0,0,12);ED=a[lT]|0;Ey=ED&255;EA=(Ey&1|0)==0?Ey>>>1:c[mp>>2]|0;Ey=d[lU]|0;Et=(Ey&1|0)==0?Ey>>>1:c[mo>>2]|0;eI(dv,(ED&1)==0?lV:c[mn>>2]|0,EA,Et+EA|0);eB(dv,(a[lU]&1)==0?lW:c[mm>>2]|0,Et)|0;ex(dy,1304,17);lC(lX|0,0,12);Et=a[lS]|0;EA=Et&255;ED=(EA&1|0)==0?EA>>>1:c[ml>>2]|0;EA=d[lY]|0;Ey=(EA&1|0)==0?EA>>>1:c[mk>>2]|0;eI(du,(Et&1)==0?lZ:c[mj>>2]|0,ED,Ey+ED|0);eB(du,(a[lY]&1)==0?l_:c[mi>>2]|0,Ey)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EN,B)|0)|0;ex(dz,fT,lB(fT|0)|0);lC(l$|0,0,12);Ey=a[lX]|0;ED=Ey&255;Et=(ED&1|0)==0?ED>>>1:c[mh>>2]|0;ED=d[l0]|0;EA=(ED&1|0)==0?ED>>>1:c[mg>>2]|0;eI(dt,(Ey&1)==0?l1:c[mf>>2]|0,Et,EA+Et|0);eB(dt,(a[l0]&1)==0?l2:c[me>>2]|0,EA)|0;ex(dA,1272,7);lC(l3|0,0,12);EA=a[l$]|0;Et=EA&255;Ey=(Et&1|0)==0?Et>>>1:c[md>>2]|0;Et=d[l4]|0;ED=(Et&1|0)==0?Et>>>1:c[mc>>2]|0;eI(ds,(EA&1)==0?l5:c[mb>>2]|0,Ey,ED+Ey|0);eB(ds,(a[l4]&1)==0?l6:c[ma>>2]|0,ED)|0;ED=a[l3]|0;Ey=ED&255;eB(n,(ED&1)==0?l7:c[l9>>2]|0,(Ey&1|0)==0?Ey>>>1:c[l8>>2]|0)|0;ep(ds);ep(dA);ep(dt);ep(dz);ep(du);ep(dy);ep(dv);ep(dx);ep(dw);EN=EN+1|0;}while((EN|0)<(Eo|0))}}while(0);L784:do{if((Ew|0)==1){ex(dF,6176,28);Ez=En+1|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ez,B)|0)|0;ex(dG,fT,lB(fT|0)|0);lC(nc|0,0,12);EE=a[nd]|0;Ey=EE&255;ED=(Ey&1|0)==0?Ey>>>1:c[s$>>2]|0;Ey=d[ne]|0;EA=(Ey&1|0)==0?Ey>>>1:c[s_>>2]|0;eI(dE,(EE&1)==0?nf:c[sZ>>2]|0,ED,EA+ED|0);ED=(a[ne]&1)==0?ng:c[sY>>2]|0;eB(dE,ED,EA)|0;ex(dH,6144,7);lC(nh|0,0,12);EA=a[nc]|0;ED=EA&255;EE=(ED&1|0)==0?ED>>>1:c[sX>>2]|0;ED=d[ni]|0;Ey=(ED&1|0)==0?ED>>>1:c[sW>>2]|0;eI(dD,(EA&1)==0?nj:c[sV>>2]|0,EE,Ey+EE|0);EE=(a[ni]&1)==0?nk:c[sU>>2]|0;eB(dD,EE,Ey)|0;Ey=~~+bk(+(+(Ev|0)));bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(dI,fT,lB(fT|0)|0);lC(nl|0,0,12);Ey=a[nh]|0;EE=Ey&255;EA=(EE&1|0)==0?EE>>>1:c[sT>>2]|0;EE=d[nm]|0;ED=(EE&1|0)==0?EE>>>1:c[sS>>2]|0;eI(dC,(Ey&1)==0?nn:c[sR>>2]|0,EA,ED+EA|0);EA=(a[nm]&1)==0?no:c[sQ>>2]|0;eB(dC,EA,ED)|0;ex(dJ,2520,3);lC(np|0,0,12);ED=a[nl]|0;EA=ED&255;Ey=(EA&1|0)==0?EA>>>1:c[sP>>2]|0;EA=d[nq]|0;EE=(EA&1|0)==0?EA>>>1:c[sO>>2]|0;eI(dB,(ED&1)==0?nr:c[sN>>2]|0,Ey,EE+Ey|0);Ey=(a[nq]&1)==0?ns:c[sM>>2]|0;eB(dB,Ey,EE)|0;EE=a[np]|0;Ey=(EE&1)==0?nt:c[sL>>2]|0;ED=EE&255;EE=(ED&1|0)==0?ED>>>1:c[sK>>2]|0;eB(n,Ey,EE)|0;ep(dB);ep(dJ);ep(dC);ep(dI);ep(dD);ep(dH);ep(dE);ep(dG);ep(dF);ex(dQ,6104,31);EE=~~+bk(+(+(En|0)));bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EE,B)|0)|0;ex(dR,fT,lB(fT|0)|0);lC(nu|0,0,12);EE=a[nv]|0;Ey=EE&255;ED=(Ey&1|0)==0?Ey>>>1:c[sJ>>2]|0;Ey=d[nw]|0;EA=(Ey&1|0)==0?Ey>>>1:c[sI>>2]|0;eI(dP,(EE&1)==0?nx:c[sH>>2]|0,ED,EA+ED|0);ED=(a[nw]&1)==0?ny:c[sG>>2]|0;eB(dP,ED,EA)|0;ex(dS,2544,2);lC(nz|0,0,12);EA=a[nu]|0;ED=EA&255;EE=(ED&1|0)==0?ED>>>1:c[sF>>2]|0;ED=d[nA]|0;Ey=(ED&1|0)==0?ED>>>1:c[sE>>2]|0;eI(dO,(EA&1)==0?nB:c[sD>>2]|0,EE,Ey+EE|0);EE=(a[nA]&1)==0?nC:c[sC>>2]|0;eB(dO,EE,Ey)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ez,B)|0)|0;ex(dT,fT,lB(fT|0)|0);lC(nD|0,0,12);Ey=a[nz]|0;EE=Ey&255;EA=(EE&1|0)==0?EE>>>1:c[sB>>2]|0;EE=d[nE]|0;ED=(EE&1|0)==0?EE>>>1:c[sA>>2]|0;eI(dN,(Ey&1)==0?nF:c[sz>>2]|0,EA,ED+EA|0);EA=(a[nE]&1)==0?nG:c[sy>>2]|0;eB(dN,EA,ED)|0;ex(dU,6088,8);lC(nH|0,0,12);ED=a[nD]|0;EA=ED&255;Ey=(EA&1|0)==0?EA>>>1:c[sx>>2]|0;EA=d[nI]|0;EE=(EA&1|0)==0?EA>>>1:c[sw>>2]|0;eI(dM,(ED&1)==0?nJ:c[sv>>2]|0,Ey,EE+Ey|0);Ey=(a[nI]&1)==0?nK:c[su>>2]|0;eB(dM,Ey,EE)|0;EE=En-1|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EE,B)|0)|0;ex(dV,fT,lB(fT|0)|0);lC(nL|0,0,12);EE=a[nH]|0;Ey=EE&255;ED=(Ey&1|0)==0?Ey>>>1:c[st>>2]|0;Ey=d[nM]|0;EA=(Ey&1|0)==0?Ey>>>1:c[ss>>2]|0;eI(dL,(EE&1)==0?nN:c[sr>>2]|0,ED,EA+ED|0);ED=(a[nM]&1)==0?nO:c[sq>>2]|0;eB(dL,ED,EA)|0;ex(dW,2520,3);lC(nP|0,0,12);EA=a[nL]|0;ED=EA&255;EE=(ED&1|0)==0?ED>>>1:c[sp>>2]|0;ED=d[nQ]|0;Ey=(ED&1|0)==0?ED>>>1:c[so>>2]|0;eI(dK,(EA&1)==0?nR:c[sn>>2]|0,EE,Ey+EE|0);EE=(a[nQ]&1)==0?nS:c[sm>>2]|0;eB(dK,EE,Ey)|0;Ey=a[nP]|0;EE=(Ey&1)==0?nT:c[sl>>2]|0;EA=Ey&255;Ey=(EA&1|0)==0?EA>>>1:c[sk>>2]|0;eB(n,EE,Ey)|0;ep(dK);ep(dW);ep(dL);ep(dV);ep(dM);ep(dU);ep(dN);ep(dT);ep(dO);ep(dS);ep(dP);ep(dR);ep(dQ);Ey=(Ev|0)>0;if(Ey){EE=(Ep|0)>0;EA=0;do{if(EE){ED=ag(EA,Ep)|0;Et=0;do{ex(d$,6072,11);EG=(ag(Et,Eo)|0)+EA|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EG,B)|0)|0;ex(d0,fT,lB(fT|0)|0);lC(rM|0,0,12);EG=a[rN]|0;EF=EG&255;EC=(EF&1|0)==0?EF>>>1:c[sj>>2]|0;EF=d[rO]|0;Er=(EF&1|0)==0?EF>>>1:c[si>>2]|0;eI(d_,(EG&1)==0?rP:c[sh>>2]|0,EC,Er+EC|0);eB(d_,(a[rO]&1)==0?rQ:c[sg>>2]|0,Er)|0;ex(d1,4776,6);lC(rR|0,0,12);Er=a[rM]|0;EC=Er&255;EG=(EC&1|0)==0?EC>>>1:c[sf>>2]|0;EC=d[rS]|0;EF=(EC&1|0)==0?EC>>>1:c[se>>2]|0;eI(dZ,(Er&1)==0?rT:c[sd>>2]|0,EG,EF+EG|0);eB(dZ,(a[rS]&1)==0?rU:c[sc>>2]|0,EF)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Et+ED,B)|0)|0;ex(d2,fT,lB(fT|0)|0);lC(rV|0,0,12);EF=a[rR]|0;EG=EF&255;Er=(EG&1|0)==0?EG>>>1:c[sb>>2]|0;EG=d[rW]|0;EC=(EG&1|0)==0?EG>>>1:c[sa>>2]|0;eI(dY,(EF&1)==0?rX:c[r9>>2]|0,Er,EC+Er|0);eB(dY,(a[rW]&1)==0?rY:c[r8>>2]|0,EC)|0;ex(d3,4672,5);lC(rZ|0,0,12);EC=a[rV]|0;Er=EC&255;EF=(Er&1|0)==0?Er>>>1:c[r7>>2]|0;Er=d[r_]|0;EG=(Er&1|0)==0?Er>>>1:c[r6>>2]|0;eI(dX,(EC&1)==0?r$:c[r5>>2]|0,EF,EG+EF|0);eB(dX,(a[r_]&1)==0?r0:c[r4>>2]|0,EG)|0;EG=a[rZ]|0;EF=EG&255;eB(n,(EG&1)==0?r1:c[r3>>2]|0,(EF&1|0)==0?EF>>>1:c[r2>>2]|0)|0;ep(dX);ep(d3);ep(dY);ep(d2);ep(dZ);ep(d1);ep(d_);ep(d0);ep(d$);Et=Et+1|0;}while((Et|0)<(Ep|0))}EA=EA+1|0;}while((EA|0)<(Ev|0))}ex(d4,6440,30);EA=a[nU]|0;EE=(EA&1)==0?nV:c[rL>>2]|0;Et=EA&255;EA=(Et&1|0)==0?Et>>>1:c[rK>>2]|0;eB(n,EE,EA)|0;ep(d4);EA=(Eo|0)>0;if(EA){EE=0;do{ex(d9,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EE,B)|0)|0;ex(ea,fT,lB(fT|0)|0);lC(ra|0,0,12);Et=a[rb]|0;ED=Et&255;EF=(ED&1|0)==0?ED>>>1:c[rJ>>2]|0;ED=d[rc]|0;EG=(ED&1|0)==0?ED>>>1:c[rI>>2]|0;eI(d8,(Et&1)==0?rd:c[rH>>2]|0,EF,EG+EF|0);eB(d8,(a[rc]&1)==0?re:c[rG>>2]|0,EG)|0;ex(eb,15200,15);lC(rf|0,0,12);EG=a[ra]|0;EF=EG&255;Et=(EF&1|0)==0?EF>>>1:c[rF>>2]|0;EF=d[rg]|0;ED=(EF&1|0)==0?EF>>>1:c[rE>>2]|0;eI(d7,(EG&1)==0?rh:c[rD>>2]|0,Et,ED+Et|0);eB(d7,(a[rg]&1)==0?ri:c[rC>>2]|0,ED)|0;ED=ag(ag(EE,Ez)|0,(Eu|0)/(En|0)|0)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(ec,fT,lB(fT|0)|0);lC(rj|0,0,12);ED=a[rf]|0;Et=ED&255;EG=(Et&1|0)==0?Et>>>1:c[rB>>2]|0;Et=d[rk]|0;EF=(Et&1|0)==0?Et>>>1:c[rA>>2]|0;eI(d6,(ED&1)==0?rl:c[rz>>2]|0,EG,EF+EG|0);eB(d6,(a[rk]&1)==0?rm:c[ry>>2]|0,EF)|0;ex(ed,7072,3);lC(rn|0,0,12);EF=a[rj]|0;EG=EF&255;ED=(EG&1|0)==0?EG>>>1:c[rx>>2]|0;EG=d[ro]|0;Et=(EG&1|0)==0?EG>>>1:c[rw>>2]|0;eI(d5,(EF&1)==0?rp:c[rv>>2]|0,ED,Et+ED|0);eB(d5,(a[ro]&1)==0?rq:c[ru>>2]|0,Et)|0;Et=a[rn]|0;ED=Et&255;eB(n,(Et&1)==0?rr:c[rt>>2]|0,(ED&1|0)==0?ED>>>1:c[rs>>2]|0)|0;ep(d5);ep(ed);ep(d6);ep(ec);ep(d7);ep(eb);ep(d8);ep(ea);ep(d9);EE=EE+1|0;}while((EE|0)<(Eo|0))}ex(ee,6440,30);EE=a[nW]|0;ED=(EE&1)==0?nX:c[q9>>2]|0;Et=EE&255;EE=(Et&1|0)==0?Et>>>1:c[q8>>2]|0;eB(n,ED,EE)|0;ep(ee);if(Ey){EE=(Ep|0)>0;ED=0;do{if(EE){Et=ag(ED,Ep)|0;EF=0;do{ex(ej,6072,11);EG=(ag(EF,Eo)|0)+ED|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EG,B)|0)|0;ex(ek,fT,lB(fT|0)|0);lC(qA|0,0,12);EG=a[qB]|0;EC=EG&255;Er=(EC&1|0)==0?EC>>>1:c[q7>>2]|0;EC=d[qC]|0;EI=(EC&1|0)==0?EC>>>1:c[q6>>2]|0;eI(ei,(EG&1)==0?qD:c[q5>>2]|0,Er,EI+Er|0);eB(ei,(a[qC]&1)==0?qE:c[q4>>2]|0,EI)|0;ex(el,4776,6);lC(qF|0,0,12);EI=a[qA]|0;Er=EI&255;EG=(Er&1|0)==0?Er>>>1:c[q3>>2]|0;Er=d[qG]|0;EC=(Er&1|0)==0?Er>>>1:c[q2>>2]|0;eI(eh,(EI&1)==0?qH:c[q1>>2]|0,EG,EC+EG|0);eB(eh,(a[qG]&1)==0?qI:c[q0>>2]|0,EC)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EF+Et,B)|0)|0;ex(em,fT,lB(fT|0)|0);lC(qJ|0,0,12);EC=a[qF]|0;EG=EC&255;EI=(EG&1|0)==0?EG>>>1:c[q$>>2]|0;EG=d[qK]|0;Er=(EG&1|0)==0?EG>>>1:c[q_>>2]|0;eI(eg,(EC&1)==0?qL:c[qZ>>2]|0,EI,Er+EI|0);eB(eg,(a[qK]&1)==0?qM:c[qY>>2]|0,Er)|0;ex(en,4440,5);lC(qN|0,0,12);Er=a[qJ]|0;EI=Er&255;EC=(EI&1|0)==0?EI>>>1:c[qX>>2]|0;EI=d[qO]|0;EG=(EI&1|0)==0?EI>>>1:c[qW>>2]|0;eI(ef,(Er&1)==0?qP:c[qV>>2]|0,EC,EG+EC|0);eB(ef,(a[qO]&1)==0?qQ:c[qU>>2]|0,EG)|0;EG=a[qN]|0;EC=EG&255;eB(n,(EG&1)==0?qR:c[qT>>2]|0,(EC&1|0)==0?EC>>>1:c[qS>>2]|0)|0;ep(ef);ep(en);ep(eg);ep(em);ep(eh);ep(el);ep(ei);ep(ek);ep(ej);EF=EF+1|0;}while((EF|0)<(Ep|0))}ED=ED+1|0;}while((ED|0)<(Ev|0))}ex(eo,6440,30);ED=a[nY]|0;EE=(ED&1)==0?nZ:c[qz>>2]|0;Ey=ED&255;ED=(Ey&1|0)==0?Ey>>>1:c[qy>>2]|0;eB(n,EE,ED)|0;ep(eo);if(EA){ED=0;do{ex(ev,6800,2);bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(ew,fT,lB(fT|0)|0);lC(p_|0,0,12);EE=a[p$]|0;Ey=EE&255;EF=(Ey&1|0)==0?Ey>>>1:c[qx>>2]|0;Ey=d[p0]|0;Et=(Ey&1|0)==0?Ey>>>1:c[qw>>2]|0;eI(eu,(EE&1)==0?p1:c[qv>>2]|0,EF,Et+EF|0);eB(eu,(a[p0]&1)==0?p2:c[qu>>2]|0,Et)|0;ex(ey,15136,15);lC(p3|0,0,12);Et=a[p_]|0;EF=Et&255;EE=(EF&1|0)==0?EF>>>1:c[qt>>2]|0;EF=d[p4]|0;Ey=(EF&1|0)==0?EF>>>1:c[qs>>2]|0;eI(et,(Et&1)==0?p5:c[qr>>2]|0,EE,Ey+EE|0);eB(et,(a[p4]&1)==0?p6:c[qq>>2]|0,Ey)|0;Ey=ag(ag(ED,Ez)|0,(Eu|0)/(En|0)|0)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(ez,fT,lB(fT|0)|0);lC(p7|0,0,12);Ey=a[p3]|0;EE=Ey&255;Et=(EE&1|0)==0?EE>>>1:c[qp>>2]|0;EE=d[p8]|0;EF=(EE&1|0)==0?EE>>>1:c[qo>>2]|0;eI(es,(Ey&1)==0?p9:c[qn>>2]|0,Et,EF+Et|0);eB(es,(a[p8]&1)==0?qa:c[qm>>2]|0,EF)|0;ex(eA,7072,3);lC(qb|0,0,12);EF=a[p7]|0;Et=EF&255;Ey=(Et&1|0)==0?Et>>>1:c[ql>>2]|0;Et=d[qc]|0;EE=(Et&1|0)==0?Et>>>1:c[qk>>2]|0;eI(er,(EF&1)==0?qd:c[qj>>2]|0,Ey,EE+Ey|0);eB(er,(a[qc]&1)==0?qe:c[qi>>2]|0,EE)|0;EE=a[qb]|0;Ey=EE&255;eB(n,(EE&1)==0?qf:c[qh>>2]|0,(Ey&1|0)==0?Ey>>>1:c[qg>>2]|0)|0;ep(er);ep(eA);ep(es);ep(ez);ep(et);ep(ey);ep(eu);ep(ew);ep(ev);ED=ED+1|0;}while((ED|0)<(Eo|0))}ex(eC,6440,30);ED=a[n_]|0;Ez=(ED&1)==0?n$:c[pZ>>2]|0;Ey=ED&255;ED=(Ey&1|0)==0?Ey>>>1:c[pY>>2]|0;eB(n,Ez,ED)|0;ep(eC);ex(eD,6048,17);ED=a[n0]|0;Ez=(ED&1)==0?n1:c[pX>>2]|0;Ey=ED&255;ED=(Ey&1|0)==0?Ey>>>1:c[pW>>2]|0;eB(n,Ez,ED)|0;ep(eD);if(!jB){ex(eZ,5880,17);ED=a[pi]|0;Ez=(ED&1)==0?pj:c[pV>>2]|0;Ey=ED&255;ED=(Ey&1|0)==0?Ey>>>1:c[pU>>2]|0;eB(n,Ez,ED)|0;ep(eZ);if(EA){EO=0}else{break}while(1){ex(e2,5872,4);ED=ag(EO,Eu)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(e3,fT,lB(fT|0)|0);lC(pk|0,0,12);ED=a[pl]|0;Ez=ED&255;Ey=(Ez&1|0)==0?Ez>>>1:c[pT>>2]|0;Ez=d[pm]|0;EE=(Ez&1|0)==0?Ez>>>1:c[pS>>2]|0;eI(e1,(ED&1)==0?pn:c[pR>>2]|0,Ey,EE+Ey|0);eB(e1,(a[pm]&1)==0?po:c[pQ>>2]|0,EE)|0;ex(e4,4776,6);lC(pp|0,0,12);EE=a[pk]|0;Ey=EE&255;ED=(Ey&1|0)==0?Ey>>>1:c[pP>>2]|0;Ey=d[pq]|0;Ez=(Ey&1|0)==0?Ey>>>1:c[pO>>2]|0;eI(e0,(EE&1)==0?pr:c[pN>>2]|0,ED,Ez+ED|0);eB(e0,(a[pq]&1)==0?ps:c[pM>>2]|0,Ez)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EO,B)|0)|0;ex(e5,fT,lB(fT|0)|0);lC(pt|0,0,12);Ez=a[pp]|0;ED=Ez&255;EE=(ED&1|0)==0?ED>>>1:c[pL>>2]|0;ED=d[pu]|0;Ey=(ED&1|0)==0?ED>>>1:c[pK>>2]|0;eI(e$,(Ez&1)==0?pv:c[pJ>>2]|0,EE,Ey+EE|0);eB(e$,(a[pu]&1)==0?pw:c[pI>>2]|0,Ey)|0;ex(e6,7072,3);lC(px|0,0,12);Ey=a[pt]|0;EE=Ey&255;Ez=(EE&1|0)==0?EE>>>1:c[pH>>2]|0;EE=d[py]|0;ED=(EE&1|0)==0?EE>>>1:c[pG>>2]|0;eI(e_,(Ey&1)==0?pz:c[pF>>2]|0,Ez,ED+Ez|0);eB(e_,(a[py]&1)==0?pA:c[pE>>2]|0,ED)|0;ED=a[px]|0;Ez=ED&255;eB(n,(ED&1)==0?pB:c[pD>>2]|0,(Ez&1|0)==0?Ez>>>1:c[pC>>2]|0)|0;ep(e_);ep(e6);ep(e$);ep(e5);ep(e0);ep(e4);ep(e1);ep(e3);ep(e2);EO=EO+1|0;if((EO|0)>=(Eo|0)){break L784}}}ex(eE,6024,22);Ez=a[n2]|0;ED=(Ez&1)==0?n3:c[ph>>2]|0;Ey=Ez&255;Ez=(Ey&1|0)==0?Ey>>>1:c[pg>>2]|0;eB(n,ED,Ez)|0;ep(eE);ex(eF,6e3,22);Ez=a[n4]|0;ED=(Ez&1)==0?n5:c[pf>>2]|0;Ey=Ez&255;Ez=(Ey&1|0)==0?Ey>>>1:c[pe>>2]|0;eB(n,ED,Ez)|0;ep(eF);if(EA){EP=0}else{break}do{ex(eL,5984,9);Ez=ag(EP,Eu)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ez,B)|0)|0;ex(eM,fT,lB(fT|0)|0);lC(oG|0,0,12);Ez=a[oH]|0;ED=Ez&255;Ey=(ED&1|0)==0?ED>>>1:c[pd>>2]|0;ED=d[oI]|0;EE=(ED&1|0)==0?ED>>>1:c[pc>>2]|0;eI(eK,(Ez&1)==0?oJ:c[pb>>2]|0,Ey,EE+Ey|0);eB(eK,(a[oI]&1)==0?oK:c[pa>>2]|0,EE)|0;ex(eN,4776,6);lC(oL|0,0,12);EE=a[oG]|0;Ey=EE&255;Ez=(Ey&1|0)==0?Ey>>>1:c[o9>>2]|0;Ey=d[oM]|0;ED=(Ey&1|0)==0?Ey>>>1:c[o8>>2]|0;eI(eJ,(EE&1)==0?oN:c[o7>>2]|0,Ez,ED+Ez|0);eB(eJ,(a[oM]&1)==0?oO:c[o6>>2]|0,ED)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EP,B)|0)|0;ex(eO,fT,lB(fT|0)|0);lC(oP|0,0,12);ED=a[oL]|0;Ez=ED&255;EE=(Ez&1|0)==0?Ez>>>1:c[o5>>2]|0;Ez=d[oQ]|0;Ey=(Ez&1|0)==0?Ez>>>1:c[o4>>2]|0;eI(eH,(ED&1)==0?oR:c[o3>>2]|0,EE,Ey+EE|0);eB(eH,(a[oQ]&1)==0?oS:c[o2>>2]|0,Ey)|0;ex(eP,4672,5);lC(oT|0,0,12);Ey=a[oP]|0;EE=Ey&255;ED=(EE&1|0)==0?EE>>>1:c[o1>>2]|0;EE=d[oU]|0;Ez=(EE&1|0)==0?EE>>>1:c[o0>>2]|0;eI(eG,(Ey&1)==0?oV:c[o$>>2]|0,ED,Ez+ED|0);eB(eG,(a[oU]&1)==0?oW:c[o_>>2]|0,Ez)|0;Ez=a[oT]|0;ED=Ez&255;eB(n,(Ez&1)==0?oX:c[oZ>>2]|0,(ED&1|0)==0?ED>>>1:c[oY>>2]|0)|0;ep(eG);ep(eP);ep(eH);ep(eO);ep(eJ);ep(eN);ep(eK);ep(eM);ep(eL);EP=EP+1|0;}while((EP|0)<(Eo|0));if(EA){EQ=0}else{break}do{ex(eU,5904,9);ED=ag(EQ,Eu)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ED,B)|0)|0;ex(eV,fT,lB(fT|0)|0);lC(n6|0,0,12);ED=a[n7]|0;Ez=ED&255;Ey=(Ez&1|0)==0?Ez>>>1:c[oF>>2]|0;Ez=d[n8]|0;EE=(Ez&1|0)==0?Ez>>>1:c[oE>>2]|0;eI(eT,(ED&1)==0?n9:c[oD>>2]|0,Ey,EE+Ey|0);eB(eT,(a[n8]&1)==0?oa:c[oC>>2]|0,EE)|0;ex(eW,4776,6);lC(ob|0,0,12);EE=a[n6]|0;Ey=EE&255;ED=(Ey&1|0)==0?Ey>>>1:c[oB>>2]|0;Ey=d[oc]|0;Ez=(Ey&1|0)==0?Ey>>>1:c[oA>>2]|0;eI(eS,(EE&1)==0?od:c[oz>>2]|0,ED,Ez+ED|0);eB(eS,(a[oc]&1)==0?oe:c[oy>>2]|0,Ez)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EQ,B)|0)|0;ex(eX,fT,lB(fT|0)|0);lC(of|0,0,12);Ez=a[ob]|0;ED=Ez&255;EE=(ED&1|0)==0?ED>>>1:c[ox>>2]|0;ED=d[og]|0;Ey=(ED&1|0)==0?ED>>>1:c[ow>>2]|0;eI(eR,(Ez&1)==0?oh:c[ov>>2]|0,EE,Ey+EE|0);eB(eR,(a[og]&1)==0?oi:c[ou>>2]|0,Ey)|0;ex(eY,4440,5);lC(oj|0,0,12);Ey=a[of]|0;EE=Ey&255;Ez=(EE&1|0)==0?EE>>>1:c[ot>>2]|0;EE=d[ok]|0;ED=(EE&1|0)==0?EE>>>1:c[os>>2]|0;eI(eQ,(Ey&1)==0?ol:c[or>>2]|0,Ez,ED+Ez|0);eB(eQ,(a[ok]&1)==0?om:c[oq>>2]|0,ED)|0;ED=a[oj]|0;Ez=ED&255;eB(n,(ED&1)==0?on:c[op>>2]|0,(Ez&1|0)==0?Ez>>>1:c[oo>>2]|0)|0;ep(eQ);ep(eY);ep(eR);ep(eX);ep(eS);ep(eW);ep(eT);ep(eV);ep(eU);EQ=EQ+1|0;}while((EQ|0)<(Eo|0))}else{ex(e9,5848,21);EA=ag(Ev,Ew)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EA,B)|0)|0;ex(fa,fT,lB(fT|0)|0);lC(tu|0,0,12);EA=a[tv]|0;Ez=EA&255;ED=(Ez&1|0)==0?Ez>>>1:c[vF>>2]|0;Ez=d[tw]|0;Ey=(Ez&1|0)==0?Ez>>>1:c[vE>>2]|0;eI(e8,(EA&1)==0?tx:c[vD>>2]|0,ED,Ey+ED|0);eB(e8,(a[tw]&1)==0?ty:c[vC>>2]|0,Ey)|0;ex(fb,2144,6);lC(tz|0,0,12);Ey=a[tu]|0;ED=Ey&255;EA=(ED&1|0)==0?ED>>>1:c[vB>>2]|0;ED=d[tA]|0;Ez=(ED&1|0)==0?ED>>>1:c[vA>>2]|0;eI(e7,(Ey&1)==0?tB:c[vz>>2]|0,EA,Ez+EA|0);eB(e7,(a[tA]&1)==0?tC:c[vy>>2]|0,Ez)|0;Ez=a[tz]|0;EA=Ez&255;eB(n,(Ez&1)==0?tD:c[vx>>2]|0,(EA&1|0)==0?EA>>>1:c[vw>>2]|0)|0;ep(e7);ep(fb);ep(e8);ep(fa);ep(e9);if(!jB){ex(fw,5880,17);EA=a[uU]|0;Ez=(EA&1)==0?uV:c[vv>>2]|0;Ey=EA&255;EA=(Ey&1|0)==0?Ey>>>1:c[vu>>2]|0;eB(n,Ez,EA)|0;ep(fw);if((Eo|0)>0){ER=0}else{break}while(1){ex(fB,5872,4);EA=ag((ag((ER|0)%(Ep|0)|0,Eo)|0)+((ER|0)/(Ep|0)|0)|0,Ew)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EA,B)|0)|0;ex(fC,fT,lB(fT|0)|0);lC(uW|0,0,12);EA=a[uX]|0;Ez=EA&255;Ey=(Ez&1|0)==0?Ez>>>1:c[vt>>2]|0;Ez=d[uY]|0;ED=(Ez&1|0)==0?Ez>>>1:c[vs>>2]|0;eI(fA,(EA&1)==0?uZ:c[vr>>2]|0,Ey,ED+Ey|0);eB(fA,(a[uY]&1)==0?u_:c[vq>>2]|0,ED)|0;ex(fD,4776,6);lC(u$|0,0,12);ED=a[uW]|0;Ey=ED&255;EA=(Ey&1|0)==0?Ey>>>1:c[vp>>2]|0;Ey=d[u0]|0;Ez=(Ey&1|0)==0?Ey>>>1:c[vo>>2]|0;eI(fz,(ED&1)==0?u1:c[vn>>2]|0,EA,Ez+EA|0);eB(fz,(a[u0]&1)==0?u2:c[vm>>2]|0,Ez)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ER,B)|0)|0;ex(fE,fT,lB(fT|0)|0);lC(u3|0,0,12);Ez=a[u$]|0;EA=Ez&255;ED=(EA&1|0)==0?EA>>>1:c[vl>>2]|0;EA=d[u4]|0;Ey=(EA&1|0)==0?EA>>>1:c[vk>>2]|0;eI(fy,(Ez&1)==0?u5:c[vj>>2]|0,ED,Ey+ED|0);eB(fy,(a[u4]&1)==0?u6:c[vi>>2]|0,Ey)|0;ex(fF,7072,3);lC(u7|0,0,12);Ey=a[u3]|0;ED=Ey&255;Ez=(ED&1|0)==0?ED>>>1:c[vh>>2]|0;ED=d[u8]|0;EA=(ED&1|0)==0?ED>>>1:c[vg>>2]|0;eI(fx,(Ey&1)==0?u9:c[vf>>2]|0,Ez,EA+Ez|0);eB(fx,(a[u8]&1)==0?va:c[ve>>2]|0,EA)|0;EA=a[u7]|0;Ez=EA&255;eB(n,(EA&1)==0?vb:c[vd>>2]|0,(Ez&1|0)==0?Ez>>>1:c[vc>>2]|0)|0;ep(fx);ep(fF);ep(fy);ep(fE);ep(fz);ep(fD);ep(fA);ep(fC);ep(fB);ER=ER+1|0;if((ER|0)>=(Eo|0)){break L784}}}ex(fc,6024,22);Ez=a[tE]|0;EA=Ez&255;eB(n,(Ez&1)==0?tF:c[uT>>2]|0,(EA&1|0)==0?EA>>>1:c[uS>>2]|0)|0;ep(fc);ex(fd,6e3,22);EA=a[tG]|0;Ez=EA&255;eB(n,(EA&1)==0?tH:c[uR>>2]|0,(Ez&1|0)==0?Ez>>>1:c[uQ>>2]|0)|0;ep(fd);Ez=(Eo|0)>0;if(Ez){ES=0}else{break}do{ex(fi,5984,9);EA=ag((ag((ES|0)%(Ep|0)|0,Eo)|0)+((ES|0)/(Ep|0)|0)|0,Ew)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=EA,B)|0)|0;ex(fj,fT,lB(fT|0)|0);lC(ug|0,0,12);EA=a[uh]|0;Ey=EA&255;ED=(Ey&1|0)==0?Ey>>>1:c[uP>>2]|0;Ey=d[ui]|0;EE=(Ey&1|0)==0?Ey>>>1:c[uO>>2]|0;eI(fh,(EA&1)==0?uj:c[uN>>2]|0,ED,EE+ED|0);eB(fh,(a[ui]&1)==0?uk:c[uM>>2]|0,EE)|0;ex(fk,4776,6);lC(ul|0,0,12);EE=a[ug]|0;ED=EE&255;EA=(ED&1|0)==0?ED>>>1:c[uL>>2]|0;ED=d[um]|0;Ey=(ED&1|0)==0?ED>>>1:c[uK>>2]|0;eI(fg,(EE&1)==0?un:c[uJ>>2]|0,EA,Ey+EA|0);eB(fg,(a[um]&1)==0?uo:c[uI>>2]|0,Ey)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ES,B)|0)|0;ex(fl,fT,lB(fT|0)|0);lC(up|0,0,12);Ey=a[ul]|0;EA=Ey&255;EE=(EA&1|0)==0?EA>>>1:c[uH>>2]|0;EA=d[uq]|0;ED=(EA&1|0)==0?EA>>>1:c[uG>>2]|0;eI(ff,(Ey&1)==0?ur:c[uF>>2]|0,EE,ED+EE|0);eB(ff,(a[uq]&1)==0?us:c[uE>>2]|0,ED)|0;ex(fm,4672,5);lC(ut|0,0,12);ED=a[up]|0;EE=ED&255;Ey=(EE&1|0)==0?EE>>>1:c[uD>>2]|0;EE=d[uu]|0;EA=(EE&1|0)==0?EE>>>1:c[uC>>2]|0;eI(fe,(ED&1)==0?uv:c[uB>>2]|0,Ey,EA+Ey|0);eB(fe,(a[uu]&1)==0?uw:c[uA>>2]|0,EA)|0;EA=a[ut]|0;Ey=EA&255;eB(n,(EA&1)==0?ux:c[uz>>2]|0,(Ey&1|0)==0?Ey>>>1:c[uy>>2]|0)|0;ep(fe);ep(fm);ep(ff);ep(fl);ep(fg);ep(fk);ep(fh);ep(fj);ep(fi);ES=ES+1|0;}while((ES|0)<(Eo|0));if(Ez){ET=0}else{break}do{ex(fr,5904,9);Ey=ag((ag((ET|0)%(Ep|0)|0,Eo)|0)+((ET|0)/(Ep|0)|0)|0,Ew)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ey,B)|0)|0;ex(fs,fT,lB(fT|0)|0);lC(tI|0,0,12);Ey=a[tJ]|0;EA=Ey&255;ED=(EA&1|0)==0?EA>>>1:c[uf>>2]|0;EA=d[tK]|0;EE=(EA&1|0)==0?EA>>>1:c[ue>>2]|0;eI(fq,(Ey&1)==0?tL:c[ud>>2]|0,ED,EE+ED|0);eB(fq,(a[tK]&1)==0?tM:c[uc>>2]|0,EE)|0;ex(ft,4776,6);lC(tN|0,0,12);EE=a[tI]|0;ED=EE&255;Ey=(ED&1|0)==0?ED>>>1:c[ub>>2]|0;ED=d[tO]|0;EA=(ED&1|0)==0?ED>>>1:c[ua>>2]|0;eI(fp,(EE&1)==0?tP:c[t9>>2]|0,Ey,EA+Ey|0);eB(fp,(a[tO]&1)==0?tQ:c[t8>>2]|0,EA)|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=ET,B)|0)|0;ex(fu,fT,lB(fT|0)|0);lC(tR|0,0,12);EA=a[tN]|0;Ey=EA&255;EE=(Ey&1|0)==0?Ey>>>1:c[t7>>2]|0;Ey=d[tS]|0;ED=(Ey&1|0)==0?Ey>>>1:c[t6>>2]|0;eI(fo,(EA&1)==0?tT:c[t5>>2]|0,EE,ED+EE|0);eB(fo,(a[tS]&1)==0?tU:c[t4>>2]|0,ED)|0;ex(fv,4440,5);lC(tV|0,0,12);ED=a[tR]|0;EE=ED&255;EA=(EE&1|0)==0?EE>>>1:c[t3>>2]|0;EE=d[tW]|0;Ey=(EE&1|0)==0?EE>>>1:c[t2>>2]|0;eI(fn,(ED&1)==0?tX:c[t1>>2]|0,EA,Ey+EA|0);eB(fn,(a[tW]&1)==0?tY:c[t0>>2]|0,Ey)|0;Ey=a[tV]|0;EA=Ey&255;eB(n,(Ey&1)==0?tZ:c[t$>>2]|0,(EA&1|0)==0?EA>>>1:c[t_>>2]|0)|0;ep(fn);ep(fv);ep(fo);ep(fu);ep(fp);ep(ft);ep(fq);ep(fs);ep(fr);ET=ET+1|0;}while((ET|0)<(Eo|0))}}while(0);dc(fY,o,fR);ex(fG,14200,2);Eo=a[s0]|0;Ep=Eo&255;eB(fY,(Eo&1)==0?s1:c[tt>>2]|0,(Ep&1|0)==0?Ep>>>1:c[ts>>2]|0)|0;ep(fG);if((c[(c[Ek>>2]|0)+8>>2]|0)!=0){ex(fJ,7328,23);Ep=c[(c[Ek>>2]|0)+8>>2]|0;bg(fT|0,14080,(B=i,i=i+8|0,c[B>>2]=Ep,B)|0)|0;ex(fK,fT,lB(fT|0)|0);lC(s8|0,0,12);Ep=a[s9]|0;Eo=Ep&255;Ev=(Eo&1|0)==0?Eo>>>1:c[tr>>2]|0;Eo=d[ta]|0;Eu=(Eo&1|0)==0?Eo>>>1:c[tq>>2]|0;eI(fI,(Ep&1)==0?tb:c[tp>>2]|0,Ev,Eu+Ev|0);Ev=(a[ta]&1)==0?tc:c[to>>2]|0;eB(fI,Ev,Eu)|0;ex(fL,7072,3);lC(td|0,0,12);Eu=a[s8]|0;Ev=Eu&255;Ep=(Ev&1|0)==0?Ev>>>1:c[tn>>2]|0;Ev=d[te]|0;Eo=(Ev&1|0)==0?Ev>>>1:c[tm>>2]|0;eI(fH,(Eu&1)==0?tf:c[tl>>2]|0,Ep,Eo+Ep|0);Ep=(a[te]&1)==0?tg:c[tk>>2]|0;eB(fH,Ep,Eo)|0;Eo=a[td]|0;Ep=(Eo&1)==0?th:c[tj>>2]|0;Eu=Eo&255;Eo=(Eu&1|0)==0?Eu>>>1:c[ti>>2]|0;eB(fY,Ep,Eo)|0;ep(fH);ep(fL);ep(fI);ep(fK);ep(fJ)}Eo=a[fQ]|0;Ep=Eo&255;eB(fY,(Eo&1)==0?fU:c[s7>>2]|0,(Ep&1|0)==0?Ep>>>1:c[s6>>2]|0)|0;ex(fM,6832,2);Ep=a[s2]|0;Eo=Ep&255;eB(fY,(Ep&1)==0?s3:c[s5>>2]|0,(Eo&1|0)==0?Eo>>>1:c[s4>>2]|0)|0;ep(fM);Eo=El+1|0;if((Eo|0)<(f_|0)){Ei=Ei+1|0;Ej=(Ej|0)/(En|0)|0;Ek=(c[Ek>>2]|0)+28|0;El=Eo;Em=Eq}else{break L29}}if((fZ|0)==36){cr(15344,973,15424,14056)}else if((fZ|0)==62){cr(15344,974,15424,14032)}else if((fZ|0)==65){cr(15344,975,15424,13992)}}}while(0);ep(o);ep(n);i=h;return}function c6(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if(e>>>0>1){f=a>>>0<e>>>0?a:e;if(f>>>0<a>>>0){e=a;g=1;h=b;while(1){c[h>>2]=f;i=(e>>>0)/(f>>>0)|0;j=g+1|0;k=b+(g<<2)|0;if(i>>>0>f>>>0){e=i;g=j;h=k}else{l=i;m=j;n=k;break}}}else{l=a;m=1;n=b}c[n>>2]=l;c[d>>2]=m;return}if((a|0)==2){c[d>>2]=1;c[b>>2]=2;return}else if((a|0)==4){c[d>>2]=1;c[b>>2]=4;return}else if((a|0)==8){c[d>>2]=1;c[b>>2]=8;return}else if((a|0)==16){c[d>>2]=2;c[b>>2]=8;c[b+4>>2]=2;return}else if((a|0)==32){c[d>>2]=2;c[b>>2]=8;c[b+4>>2]=4;return}else if((a|0)==64){c[d>>2]=2;c[b>>2]=8;c[b+4>>2]=8;return}else if((a|0)==128){c[d>>2]=3;c[b>>2]=8;c[b+4>>2]=4;c[b+8>>2]=4;return}else if((a|0)==256){c[d>>2]=4;c[b>>2]=4;c[b+4>>2]=4;c[b+8>>2]=4;c[b+12>>2]=4;return}else if((a|0)==512){c[d>>2]=3;c[b>>2]=8;c[b+4>>2]=8;c[b+8>>2]=8;return}else if((a|0)==1024){c[d>>2]=3;c[b>>2]=16;c[b+4>>2]=16;c[b+8>>2]=4;return}else if((a|0)==2048){c[d>>2]=4;c[b>>2]=8;c[b+4>>2]=8;c[b+8>>2]=8;c[b+12>>2]=4;return}else{c[d>>2]=0;return}}
function c7(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c7=0,de=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dz=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ey=0,ez=0,eA=0,eC=0,eD=0,eE=0,eF=0,eG=0,eH=0,eJ=0,eK=0,eL=0,eM=0,eN=0,eO=0,eP=0,eQ=0,eR=0,eS=0,eT=0,eU=0,eV=0,eW=0,eX=0,eY=0,eZ=0,e_=0,e$=0,e0=0,e1=0,e2=0,e3=0,e4=0,e5=0,e6=0,e7=0,e8=0,e9=0,fa=0,fb=0,fc=0,fd=0,fe=0,ff=0,fg=0,fh=0,fi=0,fj=0,fk=0,fl=0,fm=0,fn=0,fo=0,fp=0,fq=0,fr=0,fs=0,ft=0,fu=0,fv=0,fw=0,fx=0,fy=0,fz=0,fA=0,fB=0,fC=0,fD=0,fE=0,fF=0,fG=0,fH=0,fI=0,fJ=0,fK=0,fL=0,fM=0,fN=0,fO=0,fP=0,fQ=0,fR=0,fS=0,fT=0,fU=0,fV=0,fW=0,fX=0,fY=0,fZ=0,f_=0,f$=0,f0=0,f1=0,f2=0,f3=0,f4=0,f5=0,f6=0,f7=0,f8=0,f9=0,ga=0,gb=0,gc=0,gd=0,ge=0,gf=0,gg=0,gh=0,gi=0,gj=0,gk=0,gl=0,gm=0,gn=0,go=0,gp=0,gq=0,gr=0,gs=0,gt=0,gu=0,gv=0,gw=0,gx=0,gy=0,gz=0,gA=0,gB=0,gC=0,gD=0,gE=0,gF=0,gG=0,gH=0,gI=0,gJ=0,gK=0,gL=0,gM=0,gN=0,gO=0,gP=0,gQ=0,gR=0,gS=0,gT=0,gU=0,gV=0,gW=0,gX=0,gY=0,gZ=0,g_=0,g$=0,g0=0,g1=0,g2=0,g3=0,g4=0,g5=0,g6=0,g7=0,g8=0,g9=0,ha=0,hb=0,hc=0,hd=0,he=0,hf=0,hg=0,hh=0,hi=0,hj=0,hk=0,hl=0,hm=0,hn=0,ho=0,hp=0,hq=0,hr=0,hs=0,ht=0,hu=0,hv=0,hw=0,hx=0,hy=0,hz=0,hA=0,hB=0,hC=0,hD=0,hE=0,hF=0,hG=0,hH=0,hI=0,hJ=0,hK=0,hL=0,hM=0,hN=0,hO=0,hP=0,hQ=0,hR=0,hS=0,hT=0,hU=0,hV=0,hW=0,hX=0,hY=0,hZ=0,h_=0,h$=0,h0=0,h1=0,h2=0,h3=0,h4=0,h5=0,h6=0,h7=0,h8=0,h9=0,ia=0,ib=0,ic=0,id=0,ie=0,ig=0,ih=0,ii=0,ij=0,ik=0,il=0,im=0,io=0,ip=0,iq=0,ir=0,is=0,it=0,iu=0,iv=0,iw=0,ix=0,iy=0,iz=0,iA=0,iB=0,iC=0,iD=0,iE=0,iF=0,iG=0,iH=0,iI=0,iJ=0,iK=0,iL=0,iM=0,iN=0,iO=0,iP=0,iQ=0,iR=0,iS=0,iT=0,iU=0,iV=0,iW=0,iX=0,iY=0,iZ=0,i_=0,i$=0,i0=0,i1=0,i2=0,i3=0,i4=0,i5=0,i6=0,i7=0,i8=0,i9=0,ja=0,jb=0,jc=0,jd=0,je=0,jf=0,jg=0,jh=0,ji=0,jj=0,jk=0,jl=0,jm=0,jn=0,jo=0,jp=0,jq=0,jr=0,js=0,jt=0,ju=0,jv=0,jw=0,jx=0,jy=0,jz=0,jA=0,jB=0,jC=0,jD=0,jE=0,jF=0,jG=0,jH=0,jI=0,jJ=0,jK=0,jL=0,jM=0,jN=0,jO=0,jP=0,jQ=0,jR=0,jS=0,jT=0,jU=0,jV=0,jW=0,jX=0,jY=0,jZ=0,j_=0,j$=0,j0=0,j1=0,j2=0,j3=0,j4=0,j5=0,j6=0,j7=0,j8=0,j9=0,ka=0,kb=0,kc=0,kd=0,ke=0,kf=0,kg=0,kh=0,ki=0,kj=0,kk=0,kl=0,km=0,kn=0,ko=0,kp=0,kq=0,kr=0,ks=0,kt=0,ku=0,kv=0,kw=0,kx=0,ky=0,kz=0,kA=0,kB=0,kC=0,kD=0,kE=0,kF=0,kG=0,kH=0,kI=0,kJ=0,kK=0,kL=0,kM=0,kN=0,kO=0,kP=0,kQ=0,kR=0,kS=0,kT=0,kU=0,kV=0,kW=0,kX=0,kY=0,kZ=0,k_=0,k$=0,k0=0,k1=0,k2=0,k3=0,k4=0,k5=0,k6=0,k7=0,k8=0,k9=0,la=0,lb=0,lc=0,ld=0,le=0,lf=0,lg=0,lh=0,li=0,lj=0,ll=0,lm=0,ln=0,lo=0,lp=0,lq=0,lr=0,ls=0,lt=0,lu=0,lv=0,lw=0,lx=0,ly=0,lz=0,lD=0,lE=0,lF=0,lG=0,lH=0,lI=0,lJ=0,lK=0,lL=0,lM=0,lN=0,lO=0,lP=0,lQ=0,lR=0,lS=0,lT=0,lU=0,lV=0,lW=0,lX=0,lY=0,lZ=0,l_=0,l$=0,l0=0,l1=0,l2=0,l3=0,l4=0,l5=0,l6=0,l7=0,l8=0,l9=0,ma=0,mb=0,mc=0,md=0,me=0,mf=0,mg=0,mh=0,mi=0,mj=0,mk=0,ml=0,mm=0,mn=0,mo=0,mp=0,mq=0,mr=0,ms=0,mt=0,mu=0,mv=0,mw=0,mx=0,my=0,mz=0,mA=0,mB=0,mC=0,mD=0,mE=0,mF=0,mG=0,mH=0,mI=0,mJ=0,mK=0,mL=0,mM=0,mN=0,mO=0,mP=0,mQ=0,mR=0,mS=0,mT=0,mU=0,mV=0,mW=0,mX=0,mY=0,mZ=0,m_=0,m$=0,m0=0,m1=0,m2=0,m3=0,m4=0,m5=0,m6=0,m7=0,m8=0,m9=0,na=0,nb=0,nc=0,nd=0,ne=0,nf=0,ng=0,nh=0,ni=0,nj=0,nk=0,nl=0,nm=0,nn=0,no=0,np=0,nq=0,nr=0,ns=0,nt=0,nu=0,nv=0,nw=0,nx=0,ny=0,nz=0,nA=0,nB=0,nC=0,nD=0,nE=0,nF=0,nG=0,nH=0,nI=0,nJ=0,nK=0,nL=0,nM=0,nN=0,nO=0,nP=0,nQ=0,nR=0,nS=0,nT=0,nU=0,nV=0,nW=0,nX=0;e=i;i=i+8768|0;f=e|0;g=e+200|0;h=e+400|0;j=e+600|0;k=e+800|0;l=e+1e3|0;m=e+1200|0;n=e+1400|0;o=e+1600|0;p=e+1800|0;q=e+2e3|0;r=e+2200|0;s=e+2400|0;t=e+2600|0;u=e+2800|0;v=e+3e3|0;w=e+3200|0;x=e+3400|0;y=e+3600|0;z=e+3800|0;A=e+4e3|0;C=e+4200|0;D=e+4216|0;E=e+4232|0;F=e+4248|0;G=e+4264|0;H=e+4280|0;I=e+4296|0;J=e+4312|0;K=e+4328|0;L=e+4344|0;M=e+4360|0;N=e+4376|0;O=e+4392|0;P=e+4408|0;Q=e+4424|0;R=e+4440|0;S=e+4456|0;T=e+4472|0;U=e+4488|0;V=e+4504|0;W=e+4520|0;X=e+4536|0;Y=e+4552|0;Z=e+4568|0;_=e+4584|0;$=e+4600|0;aa=e+4616|0;ab=e+4632|0;ac=e+4648|0;ad=e+4664|0;ae=e+4680|0;af=e+4696|0;ah=e+4712|0;ai=e+4728|0;aj=e+4744|0;ak=e+4760|0;al=e+4776|0;am=e+4792|0;an=e+4808|0;ao=e+4824|0;ap=e+4840|0;aq=e+4856|0;ar=e+4872|0;as=e+4888|0;at=e+4904|0;au=e+4920|0;av=e+4936|0;aw=e+4952|0;ax=e+4968|0;ay=e+4984|0;az=e+5e3|0;aA=e+5016|0;aB=e+5032|0;aC=e+5048|0;aD=e+5064|0;aE=e+5080|0;aF=e+5096|0;aG=e+5112|0;aH=e+5128|0;aI=e+5144|0;aJ=e+5160|0;aK=e+5176|0;aL=e+5192|0;aM=e+5208|0;aN=e+5224|0;aO=e+5240|0;aP=e+5256|0;aQ=e+5272|0;aR=e+5288|0;aS=e+5304|0;aT=e+5320|0;aU=e+5336|0;aV=e+5352|0;aW=e+5368|0;aX=e+5384|0;aY=e+5400|0;aZ=e+5416|0;a_=e+5432|0;a$=e+5448|0;a0=e+5464|0;a1=e+5480|0;a2=e+5496|0;a3=e+5512|0;a4=e+5528|0;a5=e+5544|0;a6=e+5560|0;a7=e+5576|0;a8=e+5592|0;a9=e+5608|0;ba=e+5624|0;bb=e+5640|0;bc=e+5656|0;bd=e+5672|0;be=e+5688|0;bf=e+5704|0;bh=e+5720|0;bi=e+5736|0;bj=e+5752|0;bl=e+5768|0;bm=e+5784|0;bn=e+5800|0;bo=e+5816|0;bp=e+5832|0;bq=e+5848|0;br=e+5864|0;bs=e+5880|0;bt=e+5896|0;bu=e+5912|0;bv=e+5928|0;bw=e+5944|0;bx=e+5960|0;by=e+5976|0;bz=e+5992|0;bA=e+6008|0;bB=e+6024|0;bC=e+6040|0;bD=e+6056|0;bE=e+6072|0;bF=e+6088|0;bG=e+6104|0;bH=e+6120|0;bI=e+6136|0;bJ=e+6152|0;bK=e+6168|0;bL=e+6184|0;bM=e+6200|0;bN=e+6216|0;bO=e+6232|0;bP=e+6248|0;bQ=e+6264|0;bR=e+6280|0;bS=e+6296|0;bT=e+6312|0;bU=e+6328|0;bV=e+6344|0;bW=e+6360|0;bX=e+6376|0;bY=e+6392|0;bZ=e+6408|0;b_=e+6424|0;b$=e+6440|0;b0=e+6456|0;b1=e+6472|0;b2=e+6488|0;b3=e+6504|0;b4=e+6520|0;b5=e+6536|0;b6=e+6552|0;b7=e+6568|0;b8=e+6584|0;b9=e+6600|0;ca=e+6616|0;cb=e+6632|0;cc=e+6648|0;cd=e+6664|0;ce=e+6680|0;cf=e+6696|0;cg=e+6712|0;ch=e+6728|0;ci=e+6744|0;cj=e+6760|0;ck=e+6776|0;cl=e+6792|0;cm=e+6808|0;cn=e+6824|0;co=e+6840|0;cp=e+6856|0;cq=e+6872|0;cs=e+6888|0;ct=e+6904|0;cu=e+6920|0;cv=e+6936|0;cw=e+6952|0;cx=e+6968|0;cy=e+6984|0;cz=e+7e3|0;cA=e+7016|0;cB=e+7032|0;cC=e+7048|0;cD=e+7064|0;cE=e+7080|0;cF=e+7096|0;cG=e+7112|0;cH=e+7128|0;cI=e+7144|0;cJ=e+7160|0;cK=e+7176|0;cL=e+7192|0;cM=e+7208|0;cN=e+7224|0;cO=e+7240|0;cP=e+7256|0;cQ=e+7272|0;cR=e+7288|0;cS=e+7304|0;cT=e+7320|0;cU=e+7336|0;cV=e+7352|0;cW=e+7368|0;cX=e+7384|0;cY=e+7400|0;cZ=e+7416|0;c_=e+7432|0;c$=e+7448|0;c0=e+7464|0;c1=e+7480|0;c2=e+7496|0;c3=e+7512|0;c4=e+7528|0;c5=e+7544|0;c7=e+7560|0;de=e+7576|0;df=e+7592|0;dg=e+7608|0;dh=e+7624|0;di=e+7640|0;dj=e+7656|0;dk=e+7672|0;dl=e+7688|0;dm=e+7704|0;dn=e+7720|0;dp=e+7736|0;dq=e+7752|0;dr=e+7768|0;ds=e+7784|0;dt=e+7800|0;du=e+7816|0;dv=e+7832|0;dw=e+7848|0;dx=e+7864|0;dy=e+7880|0;dz=e+7896|0;dA=e+7912|0;dB=e+7928|0;dC=e+7944|0;dD=e+7960|0;dE=e+7976|0;dF=e+7992|0;dG=e+8008|0;dH=e+8024|0;dI=e+8040|0;dJ=e+8056|0;dK=e+8072|0;dL=e+8088|0;dM=e+8104|0;dN=e+8120|0;dO=e+8136|0;dP=e+8152|0;dQ=e+8168|0;dR=e+8184|0;dS=e+8200|0;dT=e+8216|0;dU=e+8232|0;dV=e+8248|0;dW=e+8264|0;dX=e+8280|0;dY=e+8296|0;dZ=e+8496|0;d_=e+8536|0;d$=e+8544|0;d0=e+8560|0;d1=e+8576|0;d2=e+8592|0;d3=e+8608|0;d4=e+8624|0;d5=e+8640|0;d6=e+8656|0;d7=e+8672|0;d8=e+8688|0;d9=e+8704|0;ea=e+8720|0;eb=e+8736|0;ec=e+8752|0;ed=c[b+4>>2]|0;ee=b+68|0;ef=c[ee>>2]|0;eg=b+72|0;eh=c[eg>>2]|0;if(ed>>>0>(ag(eh,ef)|0)>>>0){cr(15344,746,15368,15240)}ei=dZ|0;if((ed|0)==32){c[d_>>2]=2;c[ei>>2]=8;c[dZ+4>>2]=4;ej=8}else if((ed|0)==64){c[d_>>2]=2;c[ei>>2]=8;c[dZ+4>>2]=8;ej=8}else if((ed|0)==128){c[d_>>2]=3;c[ei>>2]=8;c[dZ+4>>2]=4;c[dZ+8>>2]=4;ej=8}else if((ed|0)==256){c[d_>>2]=4;c[ei>>2]=4;c[dZ+4>>2]=4;c[dZ+8>>2]=4;c[dZ+12>>2]=4;ej=4}else if((ed|0)==512){c[d_>>2]=3;c[ei>>2]=8;c[dZ+4>>2]=8;c[dZ+8>>2]=8;ej=8}else if((ed|0)==1024){c[d_>>2]=3;c[ei>>2]=16;c[dZ+4>>2]=16;c[dZ+8>>2]=4;ej=16}else if((ed|0)==2048){c[d_>>2]=4;c[ei>>2]=8;c[dZ+4>>2]=8;c[dZ+8>>2]=8;c[dZ+12>>2]=4;ej=8}else if((ed|0)==2){c[d_>>2]=1;c[ei>>2]=2;ej=2}else if((ed|0)==4){c[d_>>2]=1;c[ei>>2]=4;ej=4}else if((ed|0)==8){c[d_>>2]=1;c[ei>>2]=8;ej=8}else if((ed|0)==16){c[d_>>2]=2;c[ei>>2]=8;c[dZ+4>>2]=2;ej=8}else{cr(15344,749,15368,5736)}if(((ed>>>0)/(ej>>>0)|0)>>>0>ef>>>0){c6(ed,ei,d_,eh);ek=c[ei>>2]|0;el=c[eg>>2]|0}else{ek=ej;el=eh}if(ek>>>0>el>>>0){cr(15344,754,15368,4680)}if(((ed>>>0)/(ek>>>0)|0)>>>0>(c[ee>>2]|0)>>>0){cr(15344,755,15368,3888)}el=c[d_>>2]|0;L61:do{if((el|0)==0){em=1}else{eh=1;ej=1;eg=ek;while(1){if((eg|0)==0){en=2093;break}if((eg-1&eg|0)!=0){en=2094;break}ef=ag(eg,ej)|0;if(eh>>>0>=el>>>0){em=ef;break L61}eo=c[dZ+(eh<<2)>>2]|0;eh=eh+1|0;ej=ef;eg=eo}if((en|0)==2093){cr(15344,761,15368,2728)}else if((en|0)==2094){cr(15344,761,15368,2728)}}}while(0);if((em|0)!=(ed|0)){cr(15344,764,15368,2312)}ex(d$,23744,0);ex(d0,23744,0);em=c[b+20>>2]|0;en=c[b+24>>2]|0;el=b+32|0;ek=c[el>>2]|0;if((ek|0)==0){er=0;es=el}else{el=0;eg=ek;while(1){ek=eg+28|0;ej=el+1|0;eh=c[ek>>2]|0;if((eh|0)==0){er=ej;es=ek;break}else{el=ej;eg=eh}}}ex(d2,1280,3);eg=dY|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=er,B)|0)|0;ex(d3,eg,lB(eg|0)|0);lC(d1|0,0,12);er=a[d2]|0;dY=er&255;if((dY&1|0)==0){et=dY>>>1}else{et=c[d2+4>>2]|0}dY=d3;el=d[dY]|0;if((el&1|0)==0){eu=el>>>1}else{eu=c[d3+4>>2]|0}if((er&1)==0){ev=d2+1|0}else{ev=c[d2+8>>2]|0}eI(d1,ev,et,eu+et|0);if((a[dY]&1)==0){ew=d3+1|0}else{ew=c[d3+8>>2]|0}eB(d1,ew,eu)|0;eq(d0,d1)|0;ep(d1);ep(d3);ep(d2);d2=lk(32)|0;c[es>>2]=d2;c[d2>>2]=0;c[(c[es>>2]|0)+8>>2]=0;c[(c[es>>2]|0)+12>>2]=0;c[(c[es>>2]|0)+16>>2]=0;c[(c[es>>2]|0)+20>>2]=0;c[(c[es>>2]|0)+24>>2]=1;c[(c[es>>2]|0)+28>>2]=0;d2=d0;d3=d[d2]|0;if((d3&1|0)==0){ey=d3>>>1}else{ey=c[d0+4>>2]|0}d3=lk(ey+1|0)|0;c[(c[es>>2]|0)+4>>2]=d3;if((a[d2]&1)==0){ez=d0+1|0}else{ez=c[d0+8>>2]|0}lA(c[(c[es>>2]|0)+4>>2]|0,ez|0)|0;ez=(ed>>>0)/((c[ei>>2]|0)>>>0)|0;d2=ez>>>0>64?ez:64;if(d2>>>0>(c[ee>>2]|0)>>>0){cr(15344,797,15368,904)}ee=(d2>>>0)/(ez>>>0)|0;c[(c[es>>2]|0)+12>>2]=ee;c[(c[es>>2]|0)+16>>2]=d2;d2=c[ei>>2]|0;c8(d$,d2);d3=b+76|0;ey=c9(d$,ed,ez,ee,d2,c[d3>>2]|0,em)|0;d1=(c[es>>2]|0)+8|0;eu=c[d1>>2]|0;c[d1>>2]=ey>>>0>eu>>>0?ey:eu;ex(d4,15232,1);ex(d5,14784,1);eu=c[d_>>2]|0;if((eu|0)==0){eA=-1}else{ey=dP;d1=dQ;ew=dR;dY=dS;et=dT;ev=dU;er=dV;el=dW;eh=dX;ej=dT+1|0;ek=dU+1|0;eo=dS+1|0;ef=dV+1|0;eC=dR+1|0;eD=dW+1|0;eE=dQ+1|0;eF=dX+1|0;eG=dP+1|0;eH=dP+4|0;eJ=dP+8|0;eK=dX+8|0;eL=dQ+8|0;eM=dX+4|0;eN=dQ+4|0;eO=dW+8|0;eP=dR+8|0;eQ=dW+4|0;eR=dR+4|0;eS=dV+8|0;eT=dS+8|0;eU=dV+4|0;eV=dS+4|0;eW=dU+8|0;eX=dT+8|0;eY=dU+4|0;eZ=dT+4|0;e_=eu-1|0;eu=c2;e$=c3;e0=c4;e1=c5;e2=c7;e3=de;e4=df;e5=dg;e6=dh;e7=di;e8=dj;e9=dk;fa=dl;fb=dm;fc=dn;fd=dp;fe=dq;ff=dr;fg=ds;fh=dt;fi=du;fj=dv;fk=dw;fl=dx;fm=dy;fn=dz;fo=dA;fp=dB;fq=dC;fr=dD;fs=dE;ft=dF;fu=dG;fv=dH;fw=dI;fx=dJ;fy=dK;fz=dL;fA=dM;fB=dN;fC=dO;fD=c4+1|0;fE=c5+1|0;fF=c3+1|0;fG=c7+1|0;fH=c2+1|0;fI=c2+4|0;fJ=c2+8|0;fK=c7+8|0;fL=c3+8|0;fM=c7+4|0;fN=c3+4|0;fO=c5+8|0;fP=c4+8|0;fQ=c5+4|0;fR=c4+4|0;fS=de+1|0;fT=de+4|0;fU=de+8|0;fV=dj+1|0;fW=dk+1|0;fX=di+1|0;fY=dl+1|0;fZ=dh+1|0;f_=dm+1|0;f$=dg+1|0;f0=dn+1|0;f1=df+1|0;f2=df+4|0;f3=df+8|0;f4=dn+8|0;f5=dg+8|0;f6=dn+4|0;f7=dg+4|0;f8=dm+8|0;f9=dh+8|0;ga=dm+4|0;gb=dh+4|0;gc=dl+8|0;gd=di+8|0;ge=dl+4|0;gf=di+4|0;gg=dk+8|0;gh=dj+8|0;gi=dk+4|0;gj=dj+4|0;gk=dr+1|0;gl=ds+1|0;gm=dq+1|0;gn=dt+1|0;go=dp+1|0;gp=dp+4|0;gq=dp+8|0;gr=dt+8|0;gs=dq+8|0;gt=dt+4|0;gu=dq+4|0;gv=ds+8|0;gw=dr+8|0;gx=ds+4|0;gy=dr+4|0;gz=dz+1|0;gA=dA+1|0;gB=dy+1|0;gC=dB+1|0;gD=dx+1|0;gE=dC+1|0;gF=dw+1|0;gG=dD+1|0;gH=dv+1|0;gI=dE+1|0;gJ=du+1|0;gK=dF+1|0;gL=dK+1|0;gM=dL+1|0;gN=dJ+1|0;gO=dM+1|0;gP=dI+1|0;gQ=dN+1|0;gR=dH+1|0;gS=dO+1|0;gT=dG+1|0;gU=dG+4|0;gV=dG+8|0;gW=dO+8|0;gX=dH+8|0;gY=dO+4|0;gZ=dH+4|0;g_=dN+8|0;g$=dI+8|0;g0=dN+4|0;g1=dI+4|0;g2=dM+8|0;g3=dJ+8|0;g4=dM+4|0;g5=dJ+4|0;g6=dL+8|0;g7=dK+8|0;g8=dL+4|0;g9=dK+4|0;ha=dF+4|0;hb=dF+8|0;hc=du+4|0;hd=du+8|0;he=dE+8|0;hf=dv+8|0;hg=dE+4|0;hh=dv+4|0;hi=dD+8|0;hj=dw+8|0;hk=dD+4|0;hl=dw+4|0;hm=dC+8|0;hn=dx+8|0;ho=dC+4|0;hp=dx+4|0;hq=dB+8|0;hr=dy+8|0;hs=dB+4|0;ht=dy+4|0;hu=dA+8|0;hv=dz+8|0;hw=dA+4|0;hx=dz+4|0;hy=b+80|0;b=(ee|0)==1;hz=ee-1|0;hA=cY;hB=cZ;hC=c_;hD=c$;hE=c0;hF=c1;hG=cY+1|0;hH=cY+4|0;hI=cY+8|0;hJ=b5;hK=b6;hL=b7;hM=b8;hN=b9;hO=ca;hP=cb;hQ=cc;hR=cd;hS=ce;hT=cf;hU=cg;hV=ch;hW=ci;hX=cj;hY=ck;hZ=cl;h_=cm;h$=cn;h0=co;h1=cp;h2=cq;h3=cs;h4=ct;h5=cu;h6=cv;h7=cw;h8=cx;h9=cy;ia=cz;ib=cA;ic=cB;id=cC;ie=cD;ig=cE;ih=cF;ii=cG;ij=cH;ik=cI;il=cJ;im=cK;io=cL;ip=cM;iq=cN;ir=cO;is=cP;it=cQ;iu=cR;iv=cS;iw=cT;ix=cU;iy=cV;iz=cW;iA=cX;iB=b7+1|0;iC=b8+1|0;iD=b6+1|0;iE=b9+1|0;iF=b5+1|0;iG=b5+4|0;iH=b5+8|0;iI=b9+8|0;iJ=b6+8|0;iK=b9+4|0;iL=b6+4|0;iM=b8+8|0;iN=b7+8|0;iO=b8+4|0;iP=b7+4|0;iQ=cl+1|0;iR=cm+1|0;iS=ck+1|0;iT=cn+1|0;iU=cj+1|0;iV=cj+4|0;iW=cj+8|0;iX=cn+8|0;iY=ck+8|0;iZ=cn+4|0;i_=ck+4|0;i$=cm+8|0;i0=cl+8|0;i1=cm+4|0;i2=cl+4|0;i3=cv+1|0;i4=cw+1|0;i5=cu+1|0;i6=cx+1|0;i7=ct+1|0;i8=cy+1|0;i9=cs+1|0;ja=cz+1|0;jb=cq+1|0;jc=cA+1|0;jd=cp+1|0;je=cB+1|0;jf=co+1|0;jg=co+4|0;jh=co+8|0;ji=cB+8|0;jj=cp+8|0;jk=cB+4|0;jl=cp+4|0;jm=cA+8|0;jn=cq+8|0;jo=cA+4|0;jp=cq+4|0;jq=cz+8|0;jr=cs+8|0;js=cz+4|0;jt=cs+4|0;ju=cy+8|0;jv=ct+8|0;jw=cy+4|0;jx=ct+4|0;jy=cx+8|0;jz=cu+8|0;jA=cx+4|0;jB=cu+4|0;jC=cw+8|0;jD=cv+8|0;jE=cw+4|0;jF=cv+4|0;jG=ce+1|0;jH=cf+1|0;jI=cd+1|0;jJ=cg+1|0;jK=cc+1|0;jL=ch+1|0;jM=cb+1|0;jN=ci+1|0;jO=ca+1|0;jP=ca+4|0;jQ=ca+8|0;jR=ci+8|0;jS=cb+8|0;jT=ci+4|0;jU=cb+4|0;jV=ch+8|0;jW=cc+8|0;jX=ch+4|0;jY=cc+4|0;jZ=cg+8|0;j_=cd+8|0;j$=cg+4|0;j0=cd+4|0;j1=cf+8|0;j2=ce+8|0;j3=cf+4|0;j4=ce+4|0;j5=(ee|0)>1;j6=cQ+1|0;j7=cR+1|0;j8=cP+1|0;j9=cS+1|0;ka=cO+1|0;kb=cO+4|0;kc=cO+8|0;kd=cS+8|0;ke=cP+8|0;kf=cS+4|0;kg=cP+4|0;kh=cR+8|0;ki=cQ+8|0;kj=cR+4|0;kk=cQ+4|0;kl=cV+1|0;km=cW+1|0;kn=cU+1|0;ko=cX+1|0;kp=cT+1|0;kq=cT+4|0;kr=cT+8|0;ks=cX+8|0;kt=cU+8|0;ku=cX+4|0;kv=cU+4|0;kw=cW+8|0;kx=cV+8|0;ky=cW+4|0;kz=cV+4|0;kA=cC+1|0;kB=cC+4|0;kC=cC+8|0;kD=cI+1|0;kE=cI+4|0;kF=cI+8|0;kG=cL+1|0;kH=cM+1|0;kI=cK+1|0;kJ=cN+1|0;kK=cJ+1|0;kL=cJ+4|0;kM=cJ+8|0;kN=cN+8|0;kO=cK+8|0;kP=cN+4|0;kQ=cK+4|0;kR=cM+8|0;kS=cL+8|0;kT=cM+4|0;kU=cL+4|0;kV=cF+1|0;kW=cG+1|0;kX=cE+1|0;kY=cH+1|0;kZ=cD+1|0;k_=cD+4|0;k$=cD+8|0;k0=cH+8|0;k1=cE+8|0;k2=cH+4|0;k3=cE+4|0;k4=cG+8|0;k5=cF+8|0;k6=cG+4|0;k7=cF+4|0;k8=c$+1|0;k9=c0+1|0;la=c_+1|0;lb=c1+1|0;lc=cZ+1|0;ld=cZ+4|0;le=cZ+8|0;lf=c1+8|0;lg=c_+8|0;lh=c1+4|0;li=c_+4|0;lj=c0+8|0;ll=c$+8|0;lm=c0+4|0;ln=c$+4|0;lo=c[d_>>2]|0;d_=1;lp=ed;lq=0;while(1){lr=dZ+(lq<<2)|0;ls=c[lr>>2]|0;lt=((c[ei>>2]|0)>>>0)/(ls>>>0)|0;lu=(ed>>>0)/(ls>>>0)|0;lv=ag(ls,d_)|0;lw=(lt|0)>0;if(lw){lx=0;do{ex(dT,1240,13);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=ls,B)|0)|0;ex(dU,eg,lB(eg|0)|0);lC(dY|0,0,12);ly=a[et]|0;lz=ly&255;lD=(lz&1|0)==0?lz>>>1:c[eZ>>2]|0;lz=d[ev]|0;lE=(lz&1|0)==0?lz>>>1:c[eY>>2]|0;eI(dS,(ly&1)==0?ej:c[eX>>2]|0,lD,lE+lD|0);eB(dS,(a[ev]&1)==0?ek:c[eW>>2]|0,lE)|0;ex(dV,1200,3);lC(ew|0,0,12);lE=a[dY]|0;lD=lE&255;ly=(lD&1|0)==0?lD>>>1:c[eV>>2]|0;lD=d[er]|0;lz=(lD&1|0)==0?lD>>>1:c[eU>>2]|0;eI(dR,(lE&1)==0?eo:c[eT>>2]|0,ly,lz+ly|0);eB(dR,(a[er]&1)==0?ef:c[eS>>2]|0,lz)|0;lz=ag(lx,ls)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lz,B)|0)|0;ex(dW,eg,lB(eg|0)|0);lC(d1|0,0,12);lz=a[ew]|0;ly=lz&255;lE=(ly&1|0)==0?ly>>>1:c[eR>>2]|0;ly=d[el]|0;lD=(ly&1|0)==0?ly>>>1:c[eQ>>2]|0;eI(dQ,(lz&1)==0?eC:c[eP>>2]|0,lE,lD+lE|0);eB(dQ,(a[el]&1)==0?eD:c[eO>>2]|0,lD)|0;ex(dX,1176,8);lC(ey|0,0,12);lD=a[d1]|0;lE=lD&255;lz=(lE&1|0)==0?lE>>>1:c[eN>>2]|0;lE=d[eh]|0;ly=(lE&1|0)==0?lE>>>1:c[eM>>2]|0;eI(dP,(lD&1)==0?eE:c[eL>>2]|0,lz,ly+lz|0);eB(dP,(a[eh]&1)==0?eF:c[eK>>2]|0,ly)|0;ly=a[ey]|0;lz=ly&255;eB(d$,(ly&1)==0?eG:c[eJ>>2]|0,(lz&1|0)==0?lz>>>1:c[eH>>2]|0)|0;ep(dP);ep(dX);ep(dQ);ep(dW);ep(dR);ep(dV);ep(dS);ep(dU);ep(dT);lx=lx+1|0;}while((lx|0)<(lt|0))}if(lq>>>0<e_>>>0){lx=c[lr>>2]|0;ls=~~+bk(+(+(d_|0)));if(lw){lz=(d_|0)>1;ly=(lx|0)>1;lD=0;do{do{if((lD|0)==0){if(!lz){ex(de,1768,23);lE=a[e3]|0;lF=(lE&1)==0?fS:c[fU>>2]|0;lG=lE&255;lE=(lG&1|0)==0?lG>>>1:c[fT>>2]|0;eB(d$,lF,lE)|0;ep(de);break}ex(c4,1832,26);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=ls,B)|0)|0;ex(c5,eg,lB(eg|0)|0);lC(e$|0,0,12);lE=a[e0]|0;lF=lE&255;lG=(lF&1|0)==0?lF>>>1:c[fR>>2]|0;lF=d[e1]|0;lH=(lF&1|0)==0?lF>>>1:c[fQ>>2]|0;eI(c3,(lE&1)==0?fD:c[fP>>2]|0,lG,lH+lG|0);lG=(a[e1]&1)==0?fE:c[fO>>2]|0;eB(c3,lG,lH)|0;ex(c7,2520,3);lC(eu|0,0,12);lH=a[e$]|0;lG=lH&255;lE=(lG&1|0)==0?lG>>>1:c[fN>>2]|0;lG=d[e2]|0;lF=(lG&1|0)==0?lG>>>1:c[fM>>2]|0;eI(c2,(lH&1)==0?fF:c[fL>>2]|0,lE,lF+lE|0);lE=(a[e2]&1)==0?fG:c[fK>>2]|0;eB(c2,lE,lF)|0;lF=a[eu]|0;lE=(lF&1)==0?fH:c[fJ>>2]|0;lH=lF&255;lF=(lH&1|0)==0?lH>>>1:c[fI>>2]|0;eB(d$,lE,lF)|0;ep(c2);ep(c7);ep(c3);ep(c5);ep(c4)}else{if(!lz){ex(dr,1600,20);lF=ag(lD,ez)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lF,B)|0)|0;ex(ds,eg,lB(eg|0)|0);lC(fe|0,0,12);lF=a[ff]|0;lE=lF&255;lH=(lE&1|0)==0?lE>>>1:c[gy>>2]|0;lE=d[fg]|0;lG=(lE&1|0)==0?lE>>>1:c[gx>>2]|0;eI(dq,(lF&1)==0?gk:c[gw>>2]|0,lH,lG+lH|0);lH=(a[fg]&1)==0?gl:c[gv>>2]|0;eB(dq,lH,lG)|0;ex(dt,1568,8);lC(fd|0,0,12);lG=a[fe]|0;lH=lG&255;lF=(lH&1|0)==0?lH>>>1:c[gu>>2]|0;lH=d[fh]|0;lE=(lH&1|0)==0?lH>>>1:c[gt>>2]|0;eI(dp,(lG&1)==0?gm:c[gs>>2]|0,lF,lE+lF|0);lF=(a[fh]&1)==0?gn:c[gr>>2]|0;eB(dp,lF,lE)|0;lE=a[fd]|0;lF=(lE&1)==0?go:c[gq>>2]|0;lG=lE&255;lE=(lG&1|0)==0?lG>>>1:c[gp>>2]|0;eB(d$,lF,lE)|0;ep(dp);ep(dt);ep(dq);ep(ds);ep(dr);break}ex(dj,1728,21);lE=ag(lD,ez)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lE,B)|0)|0;ex(dk,eg,lB(eg|0)|0);lC(e7|0,0,12);lE=a[e8]|0;lF=lE&255;lG=(lF&1|0)==0?lF>>>1:c[gj>>2]|0;lF=d[e9]|0;lH=(lF&1|0)==0?lF>>>1:c[gi>>2]|0;eI(di,(lE&1)==0?fV:c[gh>>2]|0,lG,lH+lG|0);lG=(a[e9]&1)==0?fW:c[gg>>2]|0;eB(di,lG,lH)|0;ex(dl,1696,9);lC(e6|0,0,12);lH=a[e7]|0;lG=lH&255;lE=(lG&1|0)==0?lG>>>1:c[gf>>2]|0;lG=d[fa]|0;lF=(lG&1|0)==0?lG>>>1:c[ge>>2]|0;eI(dh,(lH&1)==0?fX:c[gd>>2]|0,lE,lF+lE|0);lE=(a[fa]&1)==0?fY:c[gc>>2]|0;eB(dh,lE,lF)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=ls,B)|0)|0;ex(dm,eg,lB(eg|0)|0);lC(e5|0,0,12);lF=a[e6]|0;lE=lF&255;lH=(lE&1|0)==0?lE>>>1:c[gb>>2]|0;lE=d[fb]|0;lG=(lE&1|0)==0?lE>>>1:c[ga>>2]|0;eI(dg,(lF&1)==0?fZ:c[f9>>2]|0,lH,lG+lH|0);lH=(a[fb]&1)==0?f_:c[f8>>2]|0;eB(dg,lH,lG)|0;ex(dn,2520,3);lC(e4|0,0,12);lG=a[e5]|0;lH=lG&255;lF=(lH&1|0)==0?lH>>>1:c[f7>>2]|0;lH=d[fc]|0;lE=(lH&1|0)==0?lH>>>1:c[f6>>2]|0;eI(df,(lG&1)==0?f$:c[f5>>2]|0,lF,lE+lF|0);lF=(a[fc]&1)==0?f0:c[f4>>2]|0;eB(df,lF,lE)|0;lE=a[e4]|0;lF=(lE&1)==0?f1:c[f3>>2]|0;lG=lE&255;lE=(lG&1|0)==0?lG>>>1:c[f2>>2]|0;eB(d$,lF,lE)|0;ep(df);ep(dn);ep(dg);ep(dm);ep(dh);ep(dl);ep(di);ep(dk);ep(dj)}}while(0);if(ly){lE=ag(lD,lx)|0;lF=1;do{lG=lF+lE|0;ex(dz,1512,32);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lF,B)|0)|0;ex(dA,eg,lB(eg|0)|0);lC(fm|0,0,12);lH=a[fn]|0;lI=lH&255;lJ=(lI&1|0)==0?lI>>>1:c[hx>>2]|0;lI=d[fo]|0;lK=(lI&1|0)==0?lI>>>1:c[hw>>2]|0;eI(dy,(lH&1)==0?gz:c[hv>>2]|0,lJ,lK+lJ|0);eB(dy,(a[fo]&1)==0?gA:c[hu>>2]|0,lK)|0;ex(dB,1488,6);lC(fl|0,0,12);lK=a[fm]|0;lJ=lK&255;lH=(lJ&1|0)==0?lJ>>>1:c[ht>>2]|0;lJ=d[fp]|0;lI=(lJ&1|0)==0?lJ>>>1:c[hs>>2]|0;eI(dx,(lK&1)==0?gB:c[hr>>2]|0,lH,lI+lH|0);eB(dx,(a[fp]&1)==0?gC:c[hq>>2]|0,lI)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lp,B)|0)|0;ex(dC,eg,lB(eg|0)|0);lC(fk|0,0,12);lI=a[fl]|0;lH=lI&255;lK=(lH&1|0)==0?lH>>>1:c[hp>>2]|0;lH=d[fq]|0;lJ=(lH&1|0)==0?lH>>>1:c[ho>>2]|0;eI(dw,(lI&1)==0?gD:c[hn>>2]|0,lK,lJ+lK|0);eB(dw,(a[fq]&1)==0?gE:c[hm>>2]|0,lJ)|0;ex(dD,1464,5);lC(fj|0,0,12);lJ=a[fk]|0;lK=lJ&255;lI=(lK&1|0)==0?lK>>>1:c[hl>>2]|0;lK=d[fr]|0;lH=(lK&1|0)==0?lK>>>1:c[hk>>2]|0;eI(dv,(lJ&1)==0?gF:c[hj>>2]|0,lI,lH+lI|0);eB(dv,(a[fr]&1)==0?gG:c[hi>>2]|0,lH)|0;ex(dE,1432,9);lC(fi|0,0,12);lH=a[fj]|0;lI=lH&255;lJ=(lI&1|0)==0?lI>>>1:c[hh>>2]|0;lI=d[fs]|0;lK=(lI&1|0)==0?lI>>>1:c[hg>>2]|0;eI(du,(lH&1)==0?gH:c[hf>>2]|0,lJ,lK+lJ|0);eB(du,(a[fs]&1)==0?gI:c[he>>2]|0,lK)|0;lK=a[fi]|0;lJ=lK&255;eB(d$,(lK&1)==0?gJ:c[hd>>2]|0,(lJ&1|0)==0?lJ>>>1:c[hc>>2]|0)|0;ep(du);ep(dE);ep(dv);ep(dD);ep(dw);ep(dC);ep(dx);ep(dB);ep(dy);ep(dA);ep(dz);ex(dF,1344,52);lJ=a[ft]|0;lK=lJ&255;eB(d$,(lJ&1)==0?gK:c[hb>>2]|0,(lK&1|0)==0?lK>>>1:c[ha>>2]|0)|0;ep(dF);ex(dK,4544,6);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lG,B)|0)|0;ex(dL,eg,lB(eg|0)|0);lC(fx|0,0,12);lK=a[fy]|0;lJ=lK&255;lH=(lJ&1|0)==0?lJ>>>1:c[g9>>2]|0;lJ=d[fz]|0;lI=(lJ&1|0)==0?lJ>>>1:c[g8>>2]|0;eI(dJ,(lK&1)==0?gL:c[g7>>2]|0,lH,lI+lH|0);eB(dJ,(a[fz]&1)==0?gM:c[g6>>2]|0,lI)|0;ex(dM,1304,17);lC(fw|0,0,12);lI=a[fx]|0;lH=lI&255;lK=(lH&1|0)==0?lH>>>1:c[g5>>2]|0;lH=d[fA]|0;lJ=(lH&1|0)==0?lH>>>1:c[g4>>2]|0;eI(dI,(lI&1)==0?gN:c[g3>>2]|0,lK,lJ+lK|0);eB(dI,(a[fA]&1)==0?gO:c[g2>>2]|0,lJ)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lG,B)|0)|0;ex(dN,eg,lB(eg|0)|0);lC(fv|0,0,12);lG=a[fw]|0;lJ=lG&255;lK=(lJ&1|0)==0?lJ>>>1:c[g1>>2]|0;lJ=d[fB]|0;lI=(lJ&1|0)==0?lJ>>>1:c[g0>>2]|0;eI(dH,(lG&1)==0?gP:c[g$>>2]|0,lK,lI+lK|0);eB(dH,(a[fB]&1)==0?gQ:c[g_>>2]|0,lI)|0;ex(dO,1272,7);lC(fu|0,0,12);lI=a[fv]|0;lK=lI&255;lG=(lK&1|0)==0?lK>>>1:c[gZ>>2]|0;lK=d[fC]|0;lJ=(lK&1|0)==0?lK>>>1:c[gY>>2]|0;eI(dG,(lI&1)==0?gR:c[gX>>2]|0,lG,lJ+lG|0);eB(dG,(a[fC]&1)==0?gS:c[gW>>2]|0,lJ)|0;lJ=a[fu]|0;lG=lJ&255;eB(d$,(lJ&1)==0?gT:c[gV>>2]|0,(lG&1|0)==0?lG>>>1:c[gU>>2]|0)|0;ep(dG);ep(dO);ep(dH);ep(dN);ep(dI);ep(dM);ep(dJ);ep(dL);ep(dK);lF=lF+1|0;}while((lF|0)<(lx|0))}lD=lD+1|0;}while((lD|0)<(lt|0));lL=c[lr>>2]|0}else{lL=lx}lD=c[hy>>2]|0;if((ez|0)>(d_|0)&(d_|0)<(lD|0)){ly=(((ez|0)<(lD|0)?ez:lD)|0)/(d_|0)|0;if((ly|0)>(lL|0)){lM=(ly|0)/(lL|0)|0}else{lM=1}lN=ag(lM,d_)|0}else{lN=0}ly=lN+lu|0;if((ez|0)>=(lD|0)|b){lO=0}else{lz=(ag(ly,lL)|0)&lD-1;lO=(lz|0)<(ez|0)?ez-lz|0:0}lz=ag(ag(lL,ee)|0,ly)|0;lD=(ag(lO,hz)|0)+lz|0;lz=(c[es>>2]|0)+8|0;lw=c[lz>>2]|0;c[lz>>2]=lD>>>0>lw>>>0?lD:lw;lw=c[lr>>2]|0;if(b){ex(cY,2024,27);lD=a[hA]|0;lz=(lD&1)==0?hG:c[hI>>2]|0;lF=lD&255;lD=(lF&1|0)==0?lF>>>1:c[hH>>2]|0;eB(d$,lz,lD)|0;ep(cY)}else{ex(c$,1944,33);lD=(ag(lw,ly)|0)+lO|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lD,B)|0)|0;ex(c0,eg,lB(eg|0)|0);lC(hC|0,0,12);lD=a[hD]|0;lw=lD&255;lz=(lw&1|0)==0?lw>>>1:c[ln>>2]|0;lw=d[hE]|0;lF=(lw&1|0)==0?lw>>>1:c[lm>>2]|0;eI(c_,(lD&1)==0?k8:c[ll>>2]|0,lz,lF+lz|0);lz=(a[hE]&1)==0?k9:c[lj>>2]|0;eB(c_,lz,lF)|0;ex(c1,1904,7);lC(hB|0,0,12);lF=a[hC]|0;lz=lF&255;lD=(lz&1|0)==0?lz>>>1:c[li>>2]|0;lz=d[hF]|0;lw=(lz&1|0)==0?lz>>>1:c[lh>>2]|0;eI(cZ,(lF&1)==0?la:c[lg>>2]|0,lD,lw+lD|0);lD=(a[hF]&1)==0?lb:c[lf>>2]|0;eB(cZ,lD,lw)|0;lw=a[hB]|0;lD=(lw&1)==0?lc:c[le>>2]|0;lF=lw&255;lw=(lF&1|0)==0?lF>>>1:c[ld>>2]|0;eB(d$,lD,lw)|0;ep(cZ);ep(c1);ep(c_);ep(c0);ep(c$)}lw=c[lr>>2]|0;lD=ag(lw,d_)|0;lF=~~+bk(+(+(lD|0)));lz=(ag(lw,ly)|0)+lO|0;lw=(d_|0)==1;do{if((lD|0)<(ez|0)){if(lw){ex(b7,2712,13);lE=lD-1|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lE,B)|0)|0;ex(b8,eg,lB(eg|0)|0);lC(hK|0,0,12);lE=a[hL]|0;lG=lE&255;lJ=(lG&1|0)==0?lG>>>1:c[iP>>2]|0;lG=d[hM]|0;lI=(lG&1|0)==0?lG>>>1:c[iO>>2]|0;eI(b6,(lE&1)==0?iB:c[iN>>2]|0,lJ,lI+lJ|0);lJ=(a[hM]&1)==0?iC:c[iM>>2]|0;eB(b6,lJ,lI)|0;ex(b9,4944,2);lC(hJ|0,0,12);lI=a[hK]|0;lJ=lI&255;lE=(lJ&1|0)==0?lJ>>>1:c[iL>>2]|0;lJ=d[hN]|0;lG=(lJ&1|0)==0?lJ>>>1:c[iK>>2]|0;eI(b5,(lI&1)==0?iD:c[iJ>>2]|0,lE,lG+lE|0);lE=(a[hN]&1)==0?iE:c[iI>>2]|0;eB(b5,lE,lG)|0;lG=a[hJ]|0;lE=(lG&1)==0?iF:c[iH>>2]|0;lI=lG&255;lG=(lI&1|0)==0?lI>>>1:c[iG>>2]|0;eB(d$,lE,lG)|0;ep(b5);ep(b9);ep(b6);ep(b8);ep(b7)}else{ex(ce,2696,14);lG=lD-1|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lG,B)|0)|0;ex(cf,eg,lB(eg|0)|0);lC(hR|0,0,12);lG=a[hS]|0;lE=lG&255;lI=(lE&1|0)==0?lE>>>1:c[j4>>2]|0;lE=d[hT]|0;lJ=(lE&1|0)==0?lE>>>1:c[j3>>2]|0;eI(cd,(lG&1)==0?jG:c[j2>>2]|0,lI,lJ+lI|0);lI=(a[hT]&1)==0?jH:c[j1>>2]|0;eB(cd,lI,lJ)|0;ex(cg,2616,5);lC(hQ|0,0,12);lJ=a[hR]|0;lI=lJ&255;lG=(lI&1|0)==0?lI>>>1:c[j0>>2]|0;lI=d[hU]|0;lE=(lI&1|0)==0?lI>>>1:c[j$>>2]|0;eI(cc,(lJ&1)==0?jI:c[j_>>2]|0,lG,lE+lG|0);lG=(a[hU]&1)==0?jJ:c[jZ>>2]|0;eB(cc,lG,lE)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=ls,B)|0)|0;ex(ch,eg,lB(eg|0)|0);lC(hP|0,0,12);lE=a[hQ]|0;lG=lE&255;lJ=(lG&1|0)==0?lG>>>1:c[jY>>2]|0;lG=d[hV]|0;lI=(lG&1|0)==0?lG>>>1:c[jX>>2]|0;eI(cb,(lE&1)==0?jK:c[jW>>2]|0,lJ,lI+lJ|0);lJ=(a[hV]&1)==0?jL:c[jV>>2]|0;eB(cb,lJ,lI)|0;ex(ci,4944,2);lC(hO|0,0,12);lI=a[hP]|0;lJ=lI&255;lE=(lJ&1|0)==0?lJ>>>1:c[jU>>2]|0;lJ=d[hW]|0;lG=(lJ&1|0)==0?lJ>>>1:c[jT>>2]|0;eI(ca,(lI&1)==0?jM:c[jS>>2]|0,lE,lG+lE|0);lE=(a[hW]&1)==0?jN:c[jR>>2]|0;eB(ca,lE,lG)|0;lG=a[hO]|0;lE=(lG&1)==0?jO:c[jQ>>2]|0;lI=lG&255;lG=(lI&1|0)==0?lI>>>1:c[jP>>2]|0;eB(d$,lE,lG)|0;ep(ca);ep(ci);ep(cb);ep(ch);ep(cc);ep(cg);ep(cd);ep(cf);ep(ce)}if(lw){ex(cl,2584,14);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lF,B)|0)|0;ex(cm,eg,lB(eg|0)|0);lC(hY|0,0,12);lG=a[hZ]|0;lE=lG&255;lI=(lE&1|0)==0?lE>>>1:c[i2>>2]|0;lE=d[h_]|0;lJ=(lE&1|0)==0?lE>>>1:c[i1>>2]|0;eI(ck,(lG&1)==0?iQ:c[i0>>2]|0,lI,lJ+lI|0);lI=(a[h_]&1)==0?iR:c[i$>>2]|0;eB(ck,lI,lJ)|0;ex(cn,4944,2);lC(hX|0,0,12);lJ=a[hY]|0;lI=lJ&255;lG=(lI&1|0)==0?lI>>>1:c[i_>>2]|0;lI=d[h$]|0;lE=(lI&1|0)==0?lI>>>1:c[iZ>>2]|0;eI(cj,(lJ&1)==0?iS:c[iY>>2]|0,lG,lE+lG|0);lG=(a[h$]&1)==0?iT:c[iX>>2]|0;eB(cj,lG,lE)|0;lE=a[hX]|0;lG=(lE&1)==0?iU:c[iW>>2]|0;lJ=lE&255;lE=(lJ&1|0)==0?lJ>>>1:c[iV>>2]|0;eB(d$,lG,lE)|0;ep(cj);ep(cn);ep(ck);ep(cm);ep(cl);break}ex(cv,2560,20);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lF,B)|0)|0;ex(cw,eg,lB(eg|0)|0);lC(h5|0,0,12);lE=a[h6]|0;lG=lE&255;lJ=(lG&1|0)==0?lG>>>1:c[jF>>2]|0;lG=d[h7]|0;lI=(lG&1|0)==0?lG>>>1:c[jE>>2]|0;eI(cu,(lE&1)==0?i3:c[jD>>2]|0,lJ,lI+lJ|0);lJ=(a[h7]&1)==0?i4:c[jC>>2]|0;eB(cu,lJ,lI)|0;ex(cx,2544,2);lC(h4|0,0,12);lI=a[h5]|0;lJ=lI&255;lE=(lJ&1|0)==0?lJ>>>1:c[jB>>2]|0;lJ=d[h8]|0;lG=(lJ&1|0)==0?lJ>>>1:c[jA>>2]|0;eI(ct,(lI&1)==0?i5:c[jz>>2]|0,lE,lG+lE|0);lE=(a[h8]&1)==0?i6:c[jy>>2]|0;eB(ct,lE,lG)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=d_,B)|0)|0;ex(cy,eg,lB(eg|0)|0);lC(h3|0,0,12);lG=a[h4]|0;lE=lG&255;lI=(lE&1|0)==0?lE>>>1:c[jx>>2]|0;lE=d[h9]|0;lJ=(lE&1|0)==0?lE>>>1:c[jw>>2]|0;eI(cs,(lG&1)==0?i7:c[jv>>2]|0,lI,lJ+lI|0);lI=(a[h9]&1)==0?i8:c[ju>>2]|0;eB(cs,lI,lJ)|0;ex(cz,2528,7);lC(h2|0,0,12);lJ=a[h3]|0;lI=lJ&255;lG=(lI&1|0)==0?lI>>>1:c[jt>>2]|0;lI=d[ia]|0;lE=(lI&1|0)==0?lI>>>1:c[js>>2]|0;eI(cq,(lJ&1)==0?i9:c[jr>>2]|0,lG,lE+lG|0);lG=(a[ia]&1)==0?ja:c[jq>>2]|0;eB(cq,lG,lE)|0;lE=d_-1|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lE,B)|0)|0;ex(cA,eg,lB(eg|0)|0);lC(h1|0,0,12);lE=a[h2]|0;lG=lE&255;lJ=(lG&1|0)==0?lG>>>1:c[jp>>2]|0;lG=d[ib]|0;lI=(lG&1|0)==0?lG>>>1:c[jo>>2]|0;eI(cp,(lE&1)==0?jb:c[jn>>2]|0,lJ,lI+lJ|0);lJ=(a[ib]&1)==0?jc:c[jm>>2]|0;eB(cp,lJ,lI)|0;ex(cB,2520,3);lC(h0|0,0,12);lI=a[h1]|0;lJ=lI&255;lE=(lJ&1|0)==0?lJ>>>1:c[jl>>2]|0;lJ=d[ic]|0;lG=(lJ&1|0)==0?lJ>>>1:c[jk>>2]|0;eI(co,(lI&1)==0?jd:c[jj>>2]|0,lE,lG+lE|0);lE=(a[ic]&1)==0?je:c[ji>>2]|0;eB(co,lE,lG)|0;lG=a[h0]|0;lE=(lG&1)==0?jf:c[jh>>2]|0;lI=lG&255;lG=(lI&1|0)==0?lI>>>1:c[jg>>2]|0;eB(d$,lE,lG)|0;ep(co);ep(cB);ep(cp);ep(cA);ep(cq);ep(cz);ep(cs);ep(cy);ep(ct);ep(cx);ep(cu);ep(cw);ep(cv)}else{if(lw){ex(cC,2472,12);lG=a[id]|0;lE=(lG&1)==0?kA:c[kC>>2]|0;lI=lG&255;lG=(lI&1|0)==0?lI>>>1:c[kB>>2]|0;eB(d$,lE,lG)|0;ep(cC)}else{ex(cF,2416,14);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=ls,B)|0)|0;ex(cG,eg,lB(eg|0)|0);lC(ig|0,0,12);lG=a[ih]|0;lE=lG&255;lI=(lE&1|0)==0?lE>>>1:c[k7>>2]|0;lE=d[ii]|0;lJ=(lE&1|0)==0?lE>>>1:c[k6>>2]|0;eI(cE,(lG&1)==0?kV:c[k5>>2]|0,lI,lJ+lI|0);lI=(a[ii]&1)==0?kW:c[k4>>2]|0;eB(cE,lI,lJ)|0;ex(cH,4944,2);lC(ie|0,0,12);lJ=a[ig]|0;lI=lJ&255;lG=(lI&1|0)==0?lI>>>1:c[k3>>2]|0;lI=d[ij]|0;lE=(lI&1|0)==0?lI>>>1:c[k2>>2]|0;eI(cD,(lJ&1)==0?kX:c[k1>>2]|0,lG,lE+lG|0);lG=(a[ij]&1)==0?kY:c[k0>>2]|0;eB(cD,lG,lE)|0;lE=a[ie]|0;lG=(lE&1)==0?kZ:c[k$>>2]|0;lJ=lE&255;lE=(lJ&1|0)==0?lJ>>>1:c[k_>>2]|0;eB(d$,lG,lE)|0;ep(cD);ep(cH);ep(cE);ep(cG);ep(cF)}if(lw){ex(cI,2296,11);lE=a[ik]|0;lG=(lE&1)==0?kD:c[kF>>2]|0;lJ=lE&255;lE=(lJ&1|0)==0?lJ>>>1:c[kE>>2]|0;eB(d$,lG,lE)|0;ep(cI);break}ex(cL,2256,13);lE=d_-1|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lE,B)|0)|0;ex(cM,eg,lB(eg|0)|0);lC(im|0,0,12);lE=a[io]|0;lG=lE&255;lJ=(lG&1|0)==0?lG>>>1:c[kU>>2]|0;lG=d[ip]|0;lI=(lG&1|0)==0?lG>>>1:c[kT>>2]|0;eI(cK,(lE&1)==0?kG:c[kS>>2]|0,lJ,lI+lJ|0);lJ=(a[ip]&1)==0?kH:c[kR>>2]|0;eB(cK,lJ,lI)|0;ex(cN,4944,2);lC(il|0,0,12);lI=a[im]|0;lJ=lI&255;lE=(lJ&1|0)==0?lJ>>>1:c[kQ>>2]|0;lJ=d[iq]|0;lG=(lJ&1|0)==0?lJ>>>1:c[kP>>2]|0;eI(cJ,(lI&1)==0?kI:c[kO>>2]|0,lE,lG+lE|0);lE=(a[iq]&1)==0?kJ:c[kN>>2]|0;eB(cJ,lE,lG)|0;lG=a[il]|0;lE=(lG&1)==0?kK:c[kM>>2]|0;lI=lG&255;lG=(lI&1|0)==0?lI>>>1:c[kL>>2]|0;eB(d$,lE,lG)|0;ep(cJ);ep(cN);ep(cK);ep(cM);ep(cL)}}while(0);if(j5){ex(cQ,2176,18);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lz,B)|0)|0;ex(cR,eg,lB(eg|0)|0);lC(is|0,0,12);lw=a[it]|0;ls=lw&255;lF=(ls&1|0)==0?ls>>>1:c[kk>>2]|0;ls=d[iu]|0;lD=(ls&1|0)==0?ls>>>1:c[kj>>2]|0;eI(cP,(lw&1)==0?j6:c[ki>>2]|0,lF,lD+lF|0);lF=(a[iu]&1)==0?j7:c[kh>>2]|0;eB(cP,lF,lD)|0;ex(cS,2144,6);lC(ir|0,0,12);lD=a[is]|0;lF=lD&255;lw=(lF&1|0)==0?lF>>>1:c[kg>>2]|0;lF=d[iv]|0;ls=(lF&1|0)==0?lF>>>1:c[kf>>2]|0;eI(cO,(lD&1)==0?j8:c[ke>>2]|0,lw,ls+lw|0);lw=(a[iv]&1)==0?j9:c[kd>>2]|0;eB(cO,lw,ls)|0;ls=a[ir]|0;lw=(ls&1)==0?ka:c[kc>>2]|0;lD=ls&255;ls=(lD&1|0)==0?lD>>>1:c[kb>>2]|0;eB(d$,lw,ls)|0;ep(cO);ep(cS);ep(cP);ep(cR);ep(cQ)}ex(cV,2088,31);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=ly,B)|0)|0;ex(cW,eg,lB(eg|0)|0);lC(ix|0,0,12);ls=a[iy]|0;lw=ls&255;lD=(lw&1|0)==0?lw>>>1:c[kz>>2]|0;lw=d[iz]|0;lF=(lw&1|0)==0?lw>>>1:c[ky>>2]|0;eI(cU,(ls&1)==0?kl:c[kx>>2]|0,lD,lF+lD|0);lD=(a[iz]&1)==0?km:c[kw>>2]|0;eB(cU,lD,lF)|0;ex(cX,2144,6);lC(iw|0,0,12);lF=a[ix]|0;lD=lF&255;ls=(lD&1|0)==0?lD>>>1:c[kv>>2]|0;lD=d[iA]|0;lw=(lD&1|0)==0?lD>>>1:c[ku>>2]|0;eI(cT,(lF&1)==0?kn:c[kt>>2]|0,ls,lw+ls|0);ls=(a[iA]&1)==0?ko:c[ks>>2]|0;eB(cT,ls,lw)|0;lw=a[iw]|0;ls=(lw&1)==0?kp:c[kr>>2]|0;lF=lw&255;lw=(lF&1|0)==0?lF>>>1:c[kq>>2]|0;eB(d$,ls,lw)|0;ep(cT);ep(cX);ep(cU);ep(cW);ep(cV);da(d$,lt,c[lr>>2]|0,ez,lu,lN,d4);lw=lq+1|0;ls=dZ+(lw<<2)|0;db(d$,ed,c[lr>>2]|0,c[ls>>2]|0,d_,ez,lu,lN,d4);da(d$,lt,c[lr>>2]|0,ez,lu,lN,d5);db(d$,ed,c[lr>>2]|0,c[ls>>2]|0,d_,ez,lu,lN,d5);lP=(lp>>>0)/((c[lr>>2]|0)>>>0)|0;lQ=lv;lR=lw}else{lP=lp;lQ=d_;lR=lq+1|0}if(lR>>>0<lo>>>0){d_=lQ;lp=lP;lq=lR}else{break}}eA=lo-1|0}lo=c[dZ+(eA<<2)>>2]|0;eA=c[d3>>2]|0;d3=D;dZ=F;lR=G;lq=H;lP=I;lp=J;lQ=K;d_=L;lN=M;cV=N;cW=O;cU=P;cX=Q;cT=R;kq=S;kr=T;kp=U;iw=V;ks=W;ko=X;iA=Y;kt=Z;kn=_;ku=$;kv=aa;ix=ab;kw=ac;km=ad;iz=ae;kx=af;kl=ah;ky=ai;kz=aj;iy=ak;cQ=al;cR=am;cP=an;cS=ao;cO=ap;kb=aq;kc=ar;ka=as;ir=at;kd=au;j9=av;iv=aw;ke=ax;j8=ay;kf=az;kg=aA;is=aB;kh=aC;j7=aD;iu=aE;ki=aF;j6=aG;kj=aH;kk=aI;it=aJ;j5=aK;cL=aL;cM=aM;cK=aN;cN=aO;cJ=aP;kL=aQ;kM=aR;kK=aS;il=aT;kN=aU;kJ=aV;iq=aW;kO=aX;kI=aY;kP=aZ;kQ=a_;im=a$;kR=a0;kH=a1;ip=a2;kS=a3;kG=a4;kT=a5;kU=a6;io=a7;cI=a8;kE=a9;kF=ba;kD=bb;ik=bc;cF=bd;cG=be;cE=bf;cH=bh;cD=bi;k_=bj;k$=bl;kZ=bm;ie=bn;k0=bo;kY=bp;ij=bq;k1=br;kX=bs;k2=bt;k3=bu;ig=bv;k4=bw;kW=bx;ii=by;k5=bz;kV=bA;k6=bB;k7=bC;ih=bD;cC=bE;kB=bF;kC=bG;kA=bH;id=bI;cv=bJ;cw=bK;cu=bL;cx=bM;ct=bN;cy=bO;cs=bP;cz=bQ;cq=bR;cA=bS;cp=bT;cB=bU;co=bV;jg=bW;jh=bX;jf=bY;h0=bZ;ji=b_;je=b$;ic=b0;jj=b1;jd=b2;jk=b3;jl=b4;h1=ag(ee,ez)|0;jm=(d2|0)/(lo|0)|0;ex(C,23744,0);do{if((ez|0)<(eA|0)){if((ed|0)<(eA|0)){ex(a_,3848,33);jc=ez+ed|0;ib=s|0;bg(ib|0,14080,(B=i,i=i+8|0,c[B>>2]=jc,B)|0)|0;ex(a$,ib,lB(ib|0)|0);lC(kP|0,0,12);ib=a[kQ]|0;jn=ib&255;if((jn&1|0)==0){lS=jn>>>1}else{lS=c[a_+4>>2]|0}jn=d[im]|0;if((jn&1|0)==0){lT=jn>>>1}else{lT=c[a$+4>>2]|0}if((ib&1)==0){lU=a_+1|0}else{lU=c[a_+8>>2]|0}eI(aZ,lU,lS,lT+lS|0);if((a[im]&1)==0){lV=a$+1|0}else{lV=c[a$+8>>2]|0}eB(aZ,lV,lT)|0;ex(a0,4992,8);lC(kI|0,0,12);ib=a[kP]|0;jn=ib&255;if((jn&1|0)==0){lW=jn>>>1}else{lW=c[aZ+4>>2]|0}jn=d[kR]|0;if((jn&1|0)==0){lX=jn>>>1}else{lX=c[a0+4>>2]|0}if((ib&1)==0){lY=aZ+1|0}else{lY=c[aZ+8>>2]|0}eI(aY,lY,lW,lX+lW|0);if((a[kR]&1)==0){lZ=a0+1|0}else{lZ=c[a0+8>>2]|0}eB(aY,lZ,lX)|0;ib=a[kI]|0;if((ib&1)==0){l_=aY+1|0}else{l_=c[aY+8>>2]|0}jn=ib&255;if((jn&1|0)==0){l$=jn>>>1}else{l$=c[aY+4>>2]|0}eB(d$,l_,l$)|0;ep(aY);ep(a0);ep(aZ);ep(a$);ep(a_);ex(a3,4968,15);jn=ed-1|0;ib=r|0;bg(ib|0,14080,(B=i,i=i+8|0,c[B>>2]=jn,B)|0)|0;ex(a4,ib,lB(ib|0)|0);lC(ip|0,0,12);ib=a[kS]|0;jn=ib&255;if((jn&1|0)==0){l0=jn>>>1}else{l0=c[a3+4>>2]|0}jn=d[kG]|0;if((jn&1|0)==0){l1=jn>>>1}else{l1=c[a4+4>>2]|0}if((ib&1)==0){l2=a3+1|0}else{l2=c[a3+8>>2]|0}eI(a2,l2,l0,l1+l0|0);if((a[kG]&1)==0){l3=a4+1|0}else{l3=c[a4+8>>2]|0}eB(a2,l3,l1)|0;ex(a5,4944,2);lC(kH|0,0,12);ib=a[ip]|0;jn=ib&255;if((jn&1|0)==0){l4=jn>>>1}else{l4=c[a2+4>>2]|0}jn=d[kT]|0;if((jn&1|0)==0){l5=jn>>>1}else{l5=c[a5+4>>2]|0}if((ib&1)==0){l6=a2+1|0}else{l6=c[a2+8>>2]|0}eI(a1,l6,l4,l5+l4|0);if((a[kT]&1)==0){l7=a5+1|0}else{l7=c[a5+8>>2]|0}eB(a1,l7,l5)|0;ib=a[kH]|0;if((ib&1)==0){l8=a1+1|0}else{l8=c[a1+8>>2]|0}jn=ib&255;if((jn&1|0)==0){l9=jn>>>1}else{l9=c[a1+4>>2]|0}eB(d$,l8,l9)|0;ep(a1);ep(a5);ep(a2);ep(a4);ep(a3);ex(a8,4904,16);jn=~~+bk(+(+(ed|0)));ib=q|0;bg(ib|0,14080,(B=i,i=i+8|0,c[B>>2]=jn,B)|0)|0;ex(a9,ib,lB(ib|0)|0);lC(io|0,0,12);ib=a[cI]|0;jn=ib&255;if((jn&1|0)==0){ma=jn>>>1}else{ma=c[a8+4>>2]|0}jn=d[kE]|0;if((jn&1|0)==0){mb=jn>>>1}else{mb=c[a9+4>>2]|0}if((ib&1)==0){mc=a8+1|0}else{mc=c[a8+8>>2]|0}eI(a7,mc,ma,mb+ma|0);if((a[kE]&1)==0){md=a9+1|0}else{md=c[a9+8>>2]|0}eB(a7,md,mb)|0;ex(ba,4944,2);lC(kU|0,0,12);ib=a[io]|0;jn=ib&255;if((jn&1|0)==0){me=jn>>>1}else{me=c[a7+4>>2]|0}jn=d[kF]|0;if((jn&1|0)==0){mf=jn>>>1}else{mf=c[ba+4>>2]|0}if((ib&1)==0){mg=a7+1|0}else{mg=c[a7+8>>2]|0}eI(a6,mg,me,mf+me|0);if((a[kF]&1)==0){mh=ba+1|0}else{mh=c[ba+8>>2]|0}eB(a6,mh,mf)|0;ib=a[kU]|0;if((ib&1)==0){mi=a6+1|0}else{mi=c[a6+8>>2]|0}jn=ib&255;if((jn&1|0)==0){mj=jn>>>1}else{mj=c[a6+4>>2]|0}eB(d$,mi,mj)|0;ep(a6);ep(ba);ep(a7);ep(a9);ep(a8);ex(bd,4840,33);jn=p|0;bg(jn|0,14080,(B=i,i=i+8|0,c[B>>2]=jc,B)|0)|0;ex(be,jn,lB(jn|0)|0);lC(ik|0,0,12);jn=a[cF]|0;ib=jn&255;if((ib&1|0)==0){mk=ib>>>1}else{mk=c[bd+4>>2]|0}ib=d[cG]|0;if((ib&1|0)==0){ml=ib>>>1}else{ml=c[be+4>>2]|0}if((jn&1)==0){mm=bd+1|0}else{mm=c[bd+8>>2]|0}eI(bc,mm,mk,ml+mk|0);if((a[cG]&1)==0){mn=be+1|0}else{mn=c[be+8>>2]|0}eB(bc,mn,ml)|0;ex(bf,4992,8);lC(kD|0,0,12);jn=a[ik]|0;ib=jn&255;if((ib&1|0)==0){mo=ib>>>1}else{mo=c[bc+4>>2]|0}ib=d[cE]|0;if((ib&1|0)==0){mp=ib>>>1}else{mp=c[bf+4>>2]|0}if((jn&1)==0){mq=bc+1|0}else{mq=c[bc+8>>2]|0}eI(bb,mq,mo,mp+mo|0);if((a[cE]&1)==0){mr=bf+1|0}else{mr=c[bf+8>>2]|0}eB(bb,mr,mp)|0;jn=a[kD]|0;if((jn&1)==0){ms=bb+1|0}else{ms=c[bb+8>>2]|0}ib=jn&255;if((ib&1|0)==0){mt=ib>>>1}else{mt=c[bb+4>>2]|0}eB(d$,ms,mt)|0;ep(bb);ep(bf);ep(bc);ep(be);ep(bd);ib=(d2|0)>0;if(ib){jn=bh+1|0;jb=bh+4|0;jo=bh+8|0;jp=o|0;h2=bm+1|0;jq=bn+1|0;ja=bl+1|0;ia=bo+1|0;jr=n|0;i9=bj+1|0;js=bp+1|0;jt=bi+1|0;h3=bq+1|0;ju=bq+8|0;i8=bi+8|0;h9=bq+4|0;jv=bi+4|0;i7=bp+8|0;jw=bj+8|0;jx=bp+4|0;h4=bj+4|0;jy=bo+8|0;i6=bl+8|0;h8=bo+4|0;jz=bl+4|0;i5=bn+8|0;jA=bm+8|0;jB=bn+4|0;h5=bm+4|0;jC=0;do{i4=(ag((jC|0)%(jm|0)|0,lo)|0)+((jC|0)/(jm|0)|0)|0;ex(bm,4816,13);h7=ag(jC,ez)|0;bg(jp|0,14080,(B=i,i=i+8|0,c[B>>2]=h7,B)|0)|0;ex(bn,jp,lB(jp|0)|0);lC(k$|0,0,12);h7=a[kZ]|0;jD=h7&255;i3=(jD&1|0)==0?jD>>>1:c[h5>>2]|0;jD=d[ie]|0;jE=(jD&1|0)==0?jD>>>1:c[jB>>2]|0;eI(bl,(h7&1)==0?h2:c[jA>>2]|0,i3,jE+i3|0);eB(bl,(a[ie]&1)==0?jq:c[i5>>2]|0,jE)|0;ex(bo,4776,6);lC(k_|0,0,12);jE=a[k$]|0;i3=jE&255;h7=(i3&1|0)==0?i3>>>1:c[jz>>2]|0;i3=d[k0]|0;jD=(i3&1|0)==0?i3>>>1:c[h8>>2]|0;eI(bj,(jE&1)==0?ja:c[i6>>2]|0,h7,jD+h7|0);eB(bj,(a[k0]&1)==0?ia:c[jy>>2]|0,jD)|0;bg(jr|0,14080,(B=i,i=i+8|0,c[B>>2]=i4,B)|0)|0;ex(bp,jr,lB(jr|0)|0);lC(cD|0,0,12);i4=a[k_]|0;jD=i4&255;h7=(jD&1|0)==0?jD>>>1:c[h4>>2]|0;jD=d[kY]|0;jE=(jD&1|0)==0?jD>>>1:c[jx>>2]|0;eI(bi,(i4&1)==0?i9:c[jw>>2]|0,h7,jE+h7|0);eB(bi,(a[kY]&1)==0?js:c[i7>>2]|0,jE)|0;ex(bq,4672,5);lC(cH|0,0,12);jE=a[cD]|0;h7=jE&255;i4=(h7&1|0)==0?h7>>>1:c[jv>>2]|0;h7=d[ij]|0;jD=(h7&1|0)==0?h7>>>1:c[h9>>2]|0;eI(bh,(jE&1)==0?jt:c[i8>>2]|0,i4,jD+i4|0);eB(bh,(a[ij]&1)==0?h3:c[ju>>2]|0,jD)|0;jD=a[cH]|0;i4=jD&255;eB(d$,(jD&1)==0?jn:c[jo>>2]|0,(i4&1|0)==0?i4>>>1:c[jb>>2]|0)|0;ep(bh);ep(bq);ep(bi);ep(bp);ep(bj);ep(bo);ep(bl);ep(bn);ep(bm);jC=jC+1|0;}while((jC|0)<(d2|0))}ex(br,4608,36);jC=a[k1]|0;if((jC&1)==0){mu=br+1|0}else{mu=c[br+8>>2]|0}jb=jC&255;if((jb&1|0)==0){mv=jb>>>1}else{mv=c[br+4>>2]|0}eB(d$,mu,mv)|0;ep(br);if(ib){jb=bs+1|0;jC=bs+4|0;jo=bs+8|0;jn=m|0;ju=bw+1|0;h3=bx+1|0;i8=bv+1|0;jt=by+1|0;h9=l|0;jv=bu+1|0;i7=bz+1|0;js=bt+1|0;jw=bA+1|0;i9=bA+8|0;jx=bt+8|0;h4=bA+4|0;jr=bt+4|0;jy=bz+8|0;ia=bu+8|0;i6=bz+4|0;ja=bu+4|0;h8=by+8|0;jz=bv+8|0;i5=by+4|0;jq=bv+4|0;jA=bx+8|0;h2=bw+8|0;jB=bx+4|0;h5=bw+4|0;jp=0;do{ex(bw,4544,6);bg(jn|0,14080,(B=i,i=i+8|0,c[B>>2]=jp,B)|0)|0;ex(bx,jn,lB(jn|0)|0);lC(ig|0,0,12);lv=a[k4]|0;lr=lv&255;lu=(lr&1|0)==0?lr>>>1:c[h5>>2]|0;lr=d[kW]|0;lt=(lr&1|0)==0?lr>>>1:c[jB>>2]|0;eI(bv,(lv&1)==0?ju:c[h2>>2]|0,lu,lt+lu|0);eB(bv,(a[kW]&1)==0?h3:c[jA>>2]|0,lt)|0;ex(by,4496,16);lC(k3|0,0,12);lt=a[ig]|0;lu=lt&255;lv=(lu&1|0)==0?lu>>>1:c[jq>>2]|0;lu=d[ii]|0;lr=(lu&1|0)==0?lu>>>1:c[i5>>2]|0;eI(bu,(lt&1)==0?i8:c[jz>>2]|0,lv,lr+lv|0);eB(bu,(a[ii]&1)==0?jt:c[h8>>2]|0,lr)|0;lr=ag(ag(jp,jc)|0,(h1|0)/(ed|0)|0)|0;bg(h9|0,14080,(B=i,i=i+8|0,c[B>>2]=lr,B)|0)|0;ex(bz,h9,lB(h9|0)|0);lC(k2|0,0,12);lr=a[k3]|0;lv=lr&255;lt=(lv&1|0)==0?lv>>>1:c[ja>>2]|0;lv=d[k5]|0;lu=(lv&1|0)==0?lv>>>1:c[i6>>2]|0;eI(bt,(lr&1)==0?jv:c[ia>>2]|0,lt,lu+lt|0);eB(bt,(a[k5]&1)==0?i7:c[jy>>2]|0,lu)|0;ex(bA,7072,3);lC(kX|0,0,12);lu=a[k2]|0;lt=lu&255;lr=(lt&1|0)==0?lt>>>1:c[jr>>2]|0;lt=d[kV]|0;lv=(lt&1|0)==0?lt>>>1:c[h4>>2]|0;eI(bs,(lu&1)==0?js:c[jx>>2]|0,lr,lv+lr|0);eB(bs,(a[kV]&1)==0?jw:c[i9>>2]|0,lv)|0;lv=a[kX]|0;lr=lv&255;eB(d$,(lv&1)==0?jb:c[jo>>2]|0,(lr&1|0)==0?lr>>>1:c[jC>>2]|0)|0;ep(bs);ep(bA);ep(bt);ep(bz);ep(bu);ep(by);ep(bv);ep(bx);ep(bw);jp=jp+1|0;}while((jp|0)<(d2|0))}ex(bB,4608,36);jp=a[k6]|0;if((jp&1)==0){mw=bB+1|0}else{mw=c[bB+8>>2]|0}jC=jp&255;if((jC&1|0)==0){mx=jC>>>1}else{mx=c[bB+4>>2]|0}eB(d$,mw,mx)|0;ep(bB);if(ib){jC=bC+1|0;jp=bC+4|0;jo=bC+8|0;jb=k|0;i9=bG+1|0;jw=bH+1|0;jx=bF+1|0;js=bI+1|0;h4=j|0;jr=bE+1|0;jy=bJ+1|0;i7=bD+1|0;ia=bK+1|0;jv=bK+8|0;i6=bD+8|0;ja=bK+4|0;h9=bD+4|0;h8=bJ+8|0;jt=bE+8|0;jz=bJ+4|0;i8=bE+4|0;i5=bI+8|0;jq=bF+8|0;jA=bI+4|0;h3=bF+4|0;h2=bH+8|0;ju=bG+8|0;jB=bH+4|0;h5=bG+4|0;jn=0;do{lr=(ag((jn|0)%(jm|0)|0,lo)|0)+((jn|0)/(jm|0)|0)|0;ex(bG,4816,13);lv=ag(jn,ez)|0;bg(jb|0,14080,(B=i,i=i+8|0,c[B>>2]=lv,B)|0)|0;ex(bH,jb,lB(jb|0)|0);lC(kB|0,0,12);lv=a[kC]|0;lu=lv&255;lt=(lu&1|0)==0?lu>>>1:c[h5>>2]|0;lu=d[kA]|0;ly=(lu&1|0)==0?lu>>>1:c[jB>>2]|0;eI(bF,(lv&1)==0?i9:c[ju>>2]|0,lt,ly+lt|0);eB(bF,(a[kA]&1)==0?jw:c[h2>>2]|0,ly)|0;ex(bI,4776,6);lC(cC|0,0,12);ly=a[kB]|0;lt=ly&255;lv=(lt&1|0)==0?lt>>>1:c[h3>>2]|0;lt=d[id]|0;lu=(lt&1|0)==0?lt>>>1:c[jA>>2]|0;eI(bE,(ly&1)==0?jx:c[jq>>2]|0,lv,lu+lv|0);eB(bE,(a[id]&1)==0?js:c[i5>>2]|0,lu)|0;bg(h4|0,14080,(B=i,i=i+8|0,c[B>>2]=lr,B)|0)|0;ex(bJ,h4,lB(h4|0)|0);lC(ih|0,0,12);lr=a[cC]|0;lu=lr&255;lv=(lu&1|0)==0?lu>>>1:c[i8>>2]|0;lu=d[cv]|0;ly=(lu&1|0)==0?lu>>>1:c[jz>>2]|0;eI(bD,(lr&1)==0?jr:c[jt>>2]|0,lv,ly+lv|0);eB(bD,(a[cv]&1)==0?jy:c[h8>>2]|0,ly)|0;ex(bK,4440,5);lC(k7|0,0,12);ly=a[ih]|0;lv=ly&255;lr=(lv&1|0)==0?lv>>>1:c[h9>>2]|0;lv=d[cw]|0;lu=(lv&1|0)==0?lv>>>1:c[ja>>2]|0;eI(bC,(ly&1)==0?i7:c[i6>>2]|0,lr,lu+lr|0);eB(bC,(a[cw]&1)==0?ia:c[jv>>2]|0,lu)|0;lu=a[k7]|0;lr=lu&255;eB(d$,(lu&1)==0?jC:c[jo>>2]|0,(lr&1|0)==0?lr>>>1:c[jp>>2]|0)|0;ep(bC);ep(bK);ep(bD);ep(bJ);ep(bE);ep(bI);ep(bF);ep(bH);ep(bG);jn=jn+1|0;}while((jn|0)<(d2|0))}ex(bL,4608,36);jn=a[cu]|0;if((jn&1)==0){my=bL+1|0}else{my=c[bL+8>>2]|0}jp=jn&255;if((jp&1|0)==0){mz=jp>>>1}else{mz=c[bL+4>>2]|0}eB(d$,my,mz)|0;ep(bL);if(ib){jp=bM+1|0;jn=bM+4|0;jo=bM+8|0;jC=h|0;jv=bQ+1|0;ia=bR+1|0;i6=bP+1|0;i7=bS+1|0;ja=g|0;h9=bO+1|0;h8=bT+1|0;jy=bN+1|0;jt=bU+1|0;jr=bU+8|0;jz=bN+8|0;i8=bU+4|0;h4=bN+4|0;i5=bT+8|0;js=bO+8|0;jq=bT+4|0;jx=bO+4|0;jA=bS+8|0;h3=bP+8|0;h2=bS+4|0;jw=bP+4|0;ju=bR+8|0;i9=bQ+8|0;jB=bR+4|0;h5=bQ+4|0;jb=0;do{ex(bQ,4544,6);bg(jC|0,14080,(B=i,i=i+8|0,c[B>>2]=jb,B)|0)|0;ex(bR,jC,lB(jC|0)|0);lC(cs|0,0,12);lr=a[cz]|0;lu=lr&255;ly=(lu&1|0)==0?lu>>>1:c[h5>>2]|0;lu=d[cq]|0;lv=(lu&1|0)==0?lu>>>1:c[jB>>2]|0;eI(bP,(lr&1)==0?jv:c[i9>>2]|0,ly,lv+ly|0);eB(bP,(a[cq]&1)==0?ia:c[ju>>2]|0,lv)|0;ex(bS,4368,16);lC(cy|0,0,12);lv=a[cs]|0;ly=lv&255;lr=(ly&1|0)==0?ly>>>1:c[jw>>2]|0;ly=d[cA]|0;lu=(ly&1|0)==0?ly>>>1:c[h2>>2]|0;eI(bO,(lv&1)==0?i6:c[h3>>2]|0,lr,lu+lr|0);eB(bO,(a[cA]&1)==0?i7:c[jA>>2]|0,lu)|0;lu=ag(ag(jb,jc)|0,(h1|0)/(ed|0)|0)|0;bg(ja|0,14080,(B=i,i=i+8|0,c[B>>2]=lu,B)|0)|0;ex(bT,ja,lB(ja|0)|0);lC(ct|0,0,12);lu=a[cy]|0;lr=lu&255;lv=(lr&1|0)==0?lr>>>1:c[jx>>2]|0;lr=d[cp]|0;ly=(lr&1|0)==0?lr>>>1:c[jq>>2]|0;eI(bN,(lu&1)==0?h9:c[js>>2]|0,lv,ly+lv|0);eB(bN,(a[cp]&1)==0?h8:c[i5>>2]|0,ly)|0;ex(bU,7072,3);lC(cx|0,0,12);ly=a[ct]|0;lv=ly&255;lu=(lv&1|0)==0?lv>>>1:c[h4>>2]|0;lv=d[cB]|0;lr=(lv&1|0)==0?lv>>>1:c[i8>>2]|0;eI(bM,(ly&1)==0?jy:c[jz>>2]|0,lu,lr+lu|0);eB(bM,(a[cB]&1)==0?jt:c[jr>>2]|0,lr)|0;lr=a[cx]|0;lu=lr&255;eB(d$,(lr&1)==0?jp:c[jo>>2]|0,(lu&1|0)==0?lu>>>1:c[jn>>2]|0)|0;ep(bM);ep(bU);ep(bN);ep(bT);ep(bO);ep(bS);ep(bP);ep(bR);ep(bQ);jb=jb+1|0;}while((jb|0)<(d2|0))}ex(bV,4608,36);jb=a[co]|0;if((jb&1)==0){mA=bV+1|0}else{mA=c[bV+8>>2]|0}jn=jb&255;if((jn&1|0)==0){mB=jn>>>1}else{mB=c[bV+4>>2]|0}eB(d$,mA,mB)|0;ep(bV);ex(bW,4224,44);jn=a[jg]|0;if((jn&1)==0){mC=bW+1|0}else{mC=c[bW+8>>2]|0}jb=jn&255;if((jb&1|0)==0){mD=jb>>>1}else{mD=c[bW+4>>2]|0}eB(d$,mC,mD)|0;ep(bW);if(ib){jb=bX+1|0;jn=bY+1|0;jo=d2-1|0;jp=bZ+1|0;jr=bZ+4|0;jt=bZ+8|0;jz=bY+4|0;jy=bY+8|0;i8=bX+4|0;h4=bX+8|0;i5=f|0;h8=b$+1|0;js=b0+1|0;h9=b_+1|0;jq=b1+1|0;jx=b1+8|0;ja=b_+8|0;jA=b1+4|0;i7=b_+4|0;h3=b0+8|0;i6=b$+8|0;h2=b0+4|0;jw=b$+4|0;ju=0;do{ex(bX,3800,18);ia=a[jh]|0;i9=ia&255;eB(d$,(ia&1)==0?jb:c[h4>>2]|0,(i9&1|0)==0?i9>>>1:c[i8>>2]|0)|0;ep(bX);dd(d$,ju,ag(ju,h1)|0,em);ex(bY,5712,6);i9=a[jf]|0;ia=i9&255;eB(d$,(i9&1)==0?jn:c[jy>>2]|0,(ia&1|0)==0?ia>>>1:c[jz>>2]|0)|0;ep(bY);if((ju|0)!=(jo|0)){ex(b$,3016,9);ia=(h1|0)/(ed|0)|0;bg(i5|0,14080,(B=i,i=i+8|0,c[B>>2]=ia,B)|0)|0;ex(b0,i5,lB(i5|0)|0);lC(ji|0,0,12);ia=a[je]|0;i9=ia&255;jv=(i9&1|0)==0?i9>>>1:c[jw>>2]|0;i9=d[ic]|0;jB=(i9&1|0)==0?i9>>>1:c[h2>>2]|0;eI(b_,(ia&1)==0?h8:c[i6>>2]|0,jv,jB+jv|0);jv=(a[ic]&1)==0?js:c[h3>>2]|0;eB(b_,jv,jB)|0;ex(b1,4944,2);lC(h0|0,0,12);jB=a[ji]|0;jv=jB&255;ia=(jv&1|0)==0?jv>>>1:c[i7>>2]|0;jv=d[jj]|0;i9=(jv&1|0)==0?jv>>>1:c[jA>>2]|0;eI(bZ,(jB&1)==0?h9:c[ja>>2]|0,ia,i9+ia|0);ia=(a[jj]&1)==0?jq:c[jx>>2]|0;eB(bZ,ia,i9)|0;i9=a[h0]|0;ia=(i9&1)==0?jp:c[jt>>2]|0;jB=i9&255;i9=(jB&1|0)==0?jB>>>1:c[jr>>2]|0;eB(d$,ia,i9)|0;ep(bZ);ep(b1);ep(b_);ep(b0);ep(b$)}ju=ju+1|0;}while((ju|0)<(d2|0))}ex(b2,6832,2);ju=a[jd]|0;if((ju&1)==0){mE=b2+1|0}else{mE=c[b2+8>>2]|0}jr=ju&255;if((jr&1|0)==0){mF=jr>>>1}else{mF=c[b2+4>>2]|0}eB(d$,mE,mF)|0;ep(b2);ex(b3,4088,7);jr=a[jk]|0;if((jr&1)==0){mG=b3+1|0}else{mG=c[b3+8>>2]|0}ju=jr&255;if((ju&1|0)==0){mH=ju>>>1}else{mH=c[b3+4>>2]|0}eB(d$,mG,mH)|0;ep(b3);if(ib){ju=0;do{dd(d$,ju,ag(ju,h1)|0,em);ju=ju+1|0;}while((ju|0)<(d2|0))}ex(b4,6832,2);ju=a[jl]|0;if((ju&1)==0){mI=b4+1|0}else{mI=c[b4+8>>2]|0}ib=ju&255;if((ib&1|0)==0){mJ=ib>>>1}else{mJ=c[b4+4>>2]|0}eB(d$,mI,mJ)|0;ep(b4);mK=ag(ee,jc)|0;break}ib=(ed|0)/(eA|0)|0;ju=(h1|0)/(eA|0)|0;jr=(ee|0)/(ju|0)|0;ex(I,5008,34);jt=ez+ed|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=jt,B)|0)|0;ex(J,eg,lB(eg|0)|0);lC(lq|0,0,12);jp=a[lP]|0;jx=jp&255;if((jx&1|0)==0){mL=jx>>>1}else{mL=c[I+4>>2]|0}jx=d[lp]|0;if((jx&1|0)==0){mM=jx>>>1}else{mM=c[J+4>>2]|0}if((jp&1)==0){mN=I+1|0}else{mN=c[I+8>>2]|0}eI(H,mN,mL,mM+mL|0);if((a[lp]&1)==0){mO=J+1|0}else{mO=c[J+8>>2]|0}eB(H,mO,mM)|0;ex(K,4992,8);lC(lR|0,0,12);jp=a[lq]|0;jx=jp&255;if((jx&1|0)==0){mP=jx>>>1}else{mP=c[H+4>>2]|0}jx=d[lQ]|0;if((jx&1|0)==0){mQ=jx>>>1}else{mQ=c[K+4>>2]|0}if((jp&1)==0){mR=H+1|0}else{mR=c[H+8>>2]|0}eI(G,mR,mP,mQ+mP|0);if((a[lQ]&1)==0){mS=K+1|0}else{mS=c[K+8>>2]|0}eB(G,mS,mQ)|0;jp=a[lR]|0;if((jp&1)==0){mT=G+1|0}else{mT=c[G+8>>2]|0}jx=jp&255;if((jx&1|0)==0){mU=jx>>>1}else{mU=c[G+4>>2]|0}eB(d$,mT,mU)|0;ep(G);ep(K);ep(H);ep(J);ep(I);ex(N,4968,15);jx=eA-1|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=jx,B)|0)|0;ex(O,eg,lB(eg|0)|0);lC(lN|0,0,12);jx=a[cV]|0;jp=jx&255;if((jp&1|0)==0){mV=jp>>>1}else{mV=c[N+4>>2]|0}jp=d[cW]|0;if((jp&1|0)==0){mW=jp>>>1}else{mW=c[O+4>>2]|0}if((jx&1)==0){mX=N+1|0}else{mX=c[N+8>>2]|0}eI(M,mX,mV,mW+mV|0);if((a[cW]&1)==0){mY=O+1|0}else{mY=c[O+8>>2]|0}eB(M,mY,mW)|0;ex(P,4944,2);lC(d_|0,0,12);jx=a[lN]|0;jp=jx&255;if((jp&1|0)==0){mZ=jp>>>1}else{mZ=c[M+4>>2]|0}jp=d[cU]|0;if((jp&1|0)==0){m_=jp>>>1}else{m_=c[P+4>>2]|0}if((jx&1)==0){m$=M+1|0}else{m$=c[M+8>>2]|0}eI(L,m$,mZ,m_+mZ|0);if((a[cU]&1)==0){m0=P+1|0}else{m0=c[P+8>>2]|0}eB(L,m0,m_)|0;jx=a[d_]|0;if((jx&1)==0){m1=L+1|0}else{m1=c[L+8>>2]|0}jp=jx&255;if((jp&1|0)==0){m2=jp>>>1}else{m2=c[L+4>>2]|0}eB(d$,m1,m2)|0;ep(L);ep(P);ep(M);ep(O);ep(N);ex(S,4904,16);jp=~~+bk(+(+(eA|0)));bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=jp,B)|0)|0;ex(T,eg,lB(eg|0)|0);lC(cT|0,0,12);jp=a[kq]|0;jx=jp&255;if((jx&1|0)==0){m3=jx>>>1}else{m3=c[S+4>>2]|0}jx=d[kr]|0;if((jx&1|0)==0){m4=jx>>>1}else{m4=c[T+4>>2]|0}if((jp&1)==0){m5=S+1|0}else{m5=c[S+8>>2]|0}eI(R,m5,m3,m4+m3|0);if((a[kr]&1)==0){m6=T+1|0}else{m6=c[T+8>>2]|0}eB(R,m6,m4)|0;ex(U,4944,2);lC(cX|0,0,12);jp=a[cT]|0;jx=jp&255;if((jx&1|0)==0){m7=jx>>>1}else{m7=c[R+4>>2]|0}jx=d[kp]|0;if((jx&1|0)==0){m8=jx>>>1}else{m8=c[U+4>>2]|0}if((jp&1)==0){m9=R+1|0}else{m9=c[R+8>>2]|0}eI(Q,m9,m7,m8+m7|0);if((a[kp]&1)==0){na=U+1|0}else{na=c[U+8>>2]|0}eB(Q,na,m8)|0;jp=a[cX]|0;if((jp&1)==0){nb=Q+1|0}else{nb=c[Q+8>>2]|0}jx=jp&255;if((jx&1|0)==0){nc=jx>>>1}else{nc=c[Q+4>>2]|0}eB(d$,nb,nc)|0;ep(Q);ep(U);ep(R);ep(T);ep(S);ex(X,4840,33);bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=jt,B)|0)|0;ex(Y,eg,lB(eg|0)|0);lC(ks|0,0,12);jx=a[ko]|0;jp=jx&255;if((jp&1|0)==0){nd=jp>>>1}else{nd=c[X+4>>2]|0}jp=d[iA]|0;if((jp&1|0)==0){ne=jp>>>1}else{ne=c[Y+4>>2]|0}if((jx&1)==0){nf=X+1|0}else{nf=c[X+8>>2]|0}eI(W,nf,nd,ne+nd|0);if((a[iA]&1)==0){ng=Y+1|0}else{ng=c[Y+8>>2]|0}eB(W,ng,ne)|0;ex(Z,4992,8);lC(iw|0,0,12);jx=a[ks]|0;jp=jx&255;if((jp&1|0)==0){nh=jp>>>1}else{nh=c[W+4>>2]|0}jp=d[kt]|0;if((jp&1|0)==0){ni=jp>>>1}else{ni=c[Z+4>>2]|0}if((jx&1)==0){nj=W+1|0}else{nj=c[W+8>>2]|0}eI(V,nj,nh,ni+nh|0);if((a[kt]&1)==0){nk=Z+1|0}else{nk=c[Z+8>>2]|0}eB(V,nk,ni)|0;jx=a[iw]|0;if((jx&1)==0){nl=V+1|0}else{nl=c[V+8>>2]|0}jp=jx&255;if((jp&1|0)==0){nm=jp>>>1}else{nm=c[V+4>>2]|0}eB(d$,nl,nm)|0;ep(V);ep(Z);ep(W);ep(Y);ep(X);jp=(d2|0)>0;if(jp){jx=ac+1|0;jq=ad+1|0;ja=_+1|0;h9=_+4|0;jA=_+8|0;i7=ad+8|0;h3=ac+8|0;js=ad+4|0;i6=ac+4|0;h8=ab+1|0;h2=ae+1|0;jw=A|0;i5=aa+1|0;jo=af+1|0;jz=$+1|0;jy=ah+1|0;jn=ah+8|0;i8=$+8|0;h4=ah+4|0;jb=$+4|0;i9=af+8|0;ia=aa+8|0;jB=af+4|0;jv=aa+4|0;h5=ae+8|0;jC=ab+8|0;lu=ae+4|0;lr=ab+4|0;ly=0;do{lv=(ag((ly|0)%(jm|0)|0,lo)|0)+((ly|0)/(jm|0)|0)|0;ex(ac,4816,13);lt=ag(ly,ez)|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=lt,B)|0)|0;ex(ad,eg,lB(eg|0)|0);lC(ix|0,0,12);lt=a[kw]|0;lz=lt&255;i4=(lz&1|0)==0?lz>>>1:c[i6>>2]|0;lz=d[km]|0;jD=(lz&1|0)==0?lz>>>1:c[js>>2]|0;eI(ab,(lt&1)==0?jx:c[h3>>2]|0,i4,jD+i4|0);eB(ab,(a[km]&1)==0?jq:c[i7>>2]|0,jD)|0;ex(ae,4776,6);lC(kv|0,0,12);jD=a[ix]|0;i4=jD&255;lt=(i4&1|0)==0?i4>>>1:c[lr>>2]|0;i4=d[iz]|0;lz=(i4&1|0)==0?i4>>>1:c[lu>>2]|0;eI(aa,(jD&1)==0?h8:c[jC>>2]|0,lt,lz+lt|0);eB(aa,(a[iz]&1)==0?h2:c[h5>>2]|0,lz)|0;bg(jw|0,14080,(B=i,i=i+8|0,c[B>>2]=lv,B)|0)|0;ex(af,jw,lB(jw|0)|0);lC(ku|0,0,12);lv=a[kv]|0;lz=lv&255;lt=(lz&1|0)==0?lz>>>1:c[jv>>2]|0;lz=d[kx]|0;jD=(lz&1|0)==0?lz>>>1:c[jB>>2]|0;eI($,(lv&1)==0?i5:c[ia>>2]|0,lt,jD+lt|0);eB($,(a[kx]&1)==0?jo:c[i9>>2]|0,jD)|0;ex(ah,4672,5);lC(kn|0,0,12);jD=a[ku]|0;lt=jD&255;lv=(lt&1|0)==0?lt>>>1:c[jb>>2]|0;lt=d[kl]|0;lz=(lt&1|0)==0?lt>>>1:c[h4>>2]|0;eI(_,(jD&1)==0?jz:c[i8>>2]|0,lv,lz+lv|0);eB(_,(a[kl]&1)==0?jy:c[jn>>2]|0,lz)|0;lz=a[kn]|0;lv=lz&255;eB(d$,(lz&1)==0?ja:c[jA>>2]|0,(lv&1|0)==0?lv>>>1:c[h9>>2]|0)|0;ep(_);ep(ah);ep($);ep(af);ep(aa);ep(ae);ep(ab);ep(ad);ep(ac);ly=ly+1|0;}while((ly|0)<(d2|0))}ex(ai,4608,36);ly=a[ky]|0;if((ly&1)==0){nn=ai+1|0}else{nn=c[ai+8>>2]|0}h9=ly&255;if((h9&1|0)==0){no=h9>>>1}else{no=c[ai+4>>2]|0}eB(d$,nn,no)|0;ep(ai);h9=(jr|0)>0;if(h9){ly=(ib|0)>0;jA=ag(ju,jt)|0;ja=aj+1|0;jn=aj+4|0;jy=aj+8|0;i8=z|0;jz=an+1|0;h4=ao+1|0;jb=am+1|0;i9=ap+1|0;jo=y|0;ia=al+1|0;i5=aq+1|0;jB=ak+1|0;jv=ar+1|0;jw=ar+8|0;h5=ak+8|0;h2=ar+4|0;jC=ak+4|0;h8=aq+8|0;lu=al+8|0;lr=aq+4|0;i7=al+4|0;jq=ap+8|0;h3=am+8|0;jx=ap+4|0;js=am+4|0;i6=ao+8|0;jc=an+8|0;lv=ao+4|0;lz=an+4|0;jD=0;do{if(ly){lt=ag(jD,ib)|0;i4=ag(jA,jD)|0;jE=0;do{ex(an,4544,6);bg(i8|0,14080,(B=i,i=i+8|0,c[B>>2]=jE+lt,B)|0)|0;ex(ao,i8,lB(i8|0)|0);lC(cR|0,0,12);h7=a[cP]|0;i3=h7&255;jF=(i3&1|0)==0?i3>>>1:c[lz>>2]|0;i3=d[cS]|0;h6=(i3&1|0)==0?i3>>>1:c[lv>>2]|0;eI(am,(h7&1)==0?jz:c[jc>>2]|0,jF,h6+jF|0);eB(am,(a[cS]&1)==0?h4:c[i6>>2]|0,h6)|0;ex(ap,4496,16);lC(cQ|0,0,12);h6=a[cR]|0;jF=h6&255;h7=(jF&1|0)==0?jF>>>1:c[js>>2]|0;jF=d[cO]|0;i3=(jF&1|0)==0?jF>>>1:c[jx>>2]|0;eI(al,(h6&1)==0?jb:c[h3>>2]|0,h7,i3+h7|0);eB(al,(a[cO]&1)==0?i9:c[jq>>2]|0,i3)|0;i3=(ag(jE,eA)|0)+i4|0;bg(jo|0,14080,(B=i,i=i+8|0,c[B>>2]=i3,B)|0)|0;ex(aq,jo,lB(jo|0)|0);lC(iy|0,0,12);i3=a[cQ]|0;h7=i3&255;h6=(h7&1|0)==0?h7>>>1:c[i7>>2]|0;h7=d[kb]|0;jF=(h7&1|0)==0?h7>>>1:c[lr>>2]|0;eI(ak,(i3&1)==0?ia:c[lu>>2]|0,h6,jF+h6|0);eB(ak,(a[kb]&1)==0?i5:c[h8>>2]|0,jF)|0;ex(ar,7072,3);lC(kz|0,0,12);jF=a[iy]|0;h6=jF&255;i3=(h6&1|0)==0?h6>>>1:c[jC>>2]|0;h6=d[kc]|0;h7=(h6&1|0)==0?h6>>>1:c[h2>>2]|0;eI(aj,(jF&1)==0?jB:c[h5>>2]|0,i3,h7+i3|0);eB(aj,(a[kc]&1)==0?jv:c[jw>>2]|0,h7)|0;h7=a[kz]|0;i3=h7&255;eB(d$,(h7&1)==0?ja:c[jy>>2]|0,(i3&1|0)==0?i3>>>1:c[jn>>2]|0)|0;ep(aj);ep(ar);ep(ak);ep(aq);ep(al);ep(ap);ep(am);ep(ao);ep(an);jE=jE+1|0;}while((jE|0)<(ib|0))}jD=jD+1|0;}while((jD|0)<(jr|0))}ex(as,4608,36);jD=a[ka]|0;if((jD&1)==0){np=as+1|0}else{np=c[as+8>>2]|0}jn=jD&255;if((jn&1|0)==0){nq=jn>>>1}else{nq=c[as+4>>2]|0}eB(d$,np,nq)|0;ep(as);if(jp){jn=at+1|0;jD=at+4|0;jy=at+8|0;ja=x|0;jw=ax+1|0;jv=ay+1|0;h5=aw+1|0;jB=az+1|0;h2=w|0;jC=av+1|0;h8=aA+1|0;i5=au+1|0;lu=aB+1|0;ia=aB+8|0;lr=au+8|0;i7=aB+4|0;jo=au+4|0;jq=aA+8|0;i9=av+8|0;h3=aA+4|0;jb=av+4|0;jx=az+8|0;js=aw+8|0;i6=az+4|0;h4=aw+4|0;jc=ay+8|0;jz=ax+8|0;lv=ay+4|0;lz=ax+4|0;i8=0;do{jA=(ag((i8|0)%(jm|0)|0,lo)|0)+((i8|0)/(jm|0)|0)|0;ex(ax,4816,13);ly=ag(i8,ez)|0;bg(ja|0,14080,(B=i,i=i+8|0,c[B>>2]=ly,B)|0)|0;ex(ay,ja,lB(ja|0)|0);lC(iv|0,0,12);ly=a[ke]|0;jE=ly&255;i4=(jE&1|0)==0?jE>>>1:c[lz>>2]|0;jE=d[j8]|0;lt=(jE&1|0)==0?jE>>>1:c[lv>>2]|0;eI(aw,(ly&1)==0?jw:c[jz>>2]|0,i4,lt+i4|0);eB(aw,(a[j8]&1)==0?jv:c[jc>>2]|0,lt)|0;ex(az,4776,6);lC(j9|0,0,12);lt=a[iv]|0;i4=lt&255;ly=(i4&1|0)==0?i4>>>1:c[h4>>2]|0;i4=d[kf]|0;jE=(i4&1|0)==0?i4>>>1:c[i6>>2]|0;eI(av,(lt&1)==0?h5:c[js>>2]|0,ly,jE+ly|0);eB(av,(a[kf]&1)==0?jB:c[jx>>2]|0,jE)|0;bg(h2|0,14080,(B=i,i=i+8|0,c[B>>2]=jA,B)|0)|0;ex(aA,h2,lB(h2|0)|0);lC(kd|0,0,12);jA=a[j9]|0;jE=jA&255;ly=(jE&1|0)==0?jE>>>1:c[jb>>2]|0;jE=d[kg]|0;lt=(jE&1|0)==0?jE>>>1:c[h3>>2]|0;eI(au,(jA&1)==0?jC:c[i9>>2]|0,ly,lt+ly|0);eB(au,(a[kg]&1)==0?h8:c[jq>>2]|0,lt)|0;ex(aB,4440,5);lC(ir|0,0,12);lt=a[kd]|0;ly=lt&255;jA=(ly&1|0)==0?ly>>>1:c[jo>>2]|0;ly=d[is]|0;jE=(ly&1|0)==0?ly>>>1:c[i7>>2]|0;eI(at,(lt&1)==0?i5:c[lr>>2]|0,jA,jE+jA|0);eB(at,(a[is]&1)==0?lu:c[ia>>2]|0,jE)|0;jE=a[ir]|0;jA=jE&255;eB(d$,(jE&1)==0?jn:c[jy>>2]|0,(jA&1|0)==0?jA>>>1:c[jD>>2]|0)|0;ep(at);ep(aB);ep(au);ep(aA);ep(av);ep(az);ep(aw);ep(ay);ep(ax);i8=i8+1|0;}while((i8|0)<(d2|0))}ex(aC,4608,36);i8=a[kh]|0;if((i8&1)==0){nr=aC+1|0}else{nr=c[aC+8>>2]|0}jD=i8&255;if((jD&1|0)==0){ns=jD>>>1}else{ns=c[aC+4>>2]|0}eB(d$,nr,ns)|0;ep(aC);if(h9){jD=(ib|0)>0;i8=ag(ju,jt)|0;jy=aD+1|0;jn=aD+4|0;ia=aD+8|0;lu=v|0;lr=aH+1|0;i5=aI+1|0;i7=aG+1|0;jo=aJ+1|0;jq=u|0;h8=aF+1|0;i9=aK+1|0;jC=aE+1|0;h3=aL+1|0;jb=aL+8|0;h2=aE+8|0;jx=aL+4|0;jB=aE+4|0;js=aK+8|0;h5=aF+8|0;i6=aK+4|0;h4=aF+4|0;jc=aJ+8|0;jv=aG+8|0;jz=aJ+4|0;jw=aG+4|0;lv=aI+8|0;lz=aH+8|0;ja=aI+4|0;jp=aH+4|0;jA=0;do{if(jD){jE=ag(jA,ib)|0;lt=ag(i8,jA)|0;ly=0;do{ex(aH,4544,6);bg(lu|0,14080,(B=i,i=i+8|0,c[B>>2]=ly+jE,B)|0)|0;ex(aI,lu,lB(lu|0)|0);lC(j6|0,0,12);i4=a[kj]|0;i3=i4&255;h7=(i3&1|0)==0?i3>>>1:c[jp>>2]|0;i3=d[kk]|0;jF=(i3&1|0)==0?i3>>>1:c[ja>>2]|0;eI(aG,(i4&1)==0?lr:c[lz>>2]|0,h7,jF+h7|0);eB(aG,(a[kk]&1)==0?i5:c[lv>>2]|0,jF)|0;ex(aJ,4368,16);lC(ki|0,0,12);jF=a[j6]|0;h7=jF&255;i4=(h7&1|0)==0?h7>>>1:c[jw>>2]|0;h7=d[it]|0;i3=(h7&1|0)==0?h7>>>1:c[jz>>2]|0;eI(aF,(jF&1)==0?i7:c[jv>>2]|0,i4,i3+i4|0);eB(aF,(a[it]&1)==0?jo:c[jc>>2]|0,i3)|0;i3=(ag(ly,eA)|0)+lt|0;bg(jq|0,14080,(B=i,i=i+8|0,c[B>>2]=i3,B)|0)|0;ex(aK,jq,lB(jq|0)|0);lC(iu|0,0,12);i3=a[ki]|0;i4=i3&255;jF=(i4&1|0)==0?i4>>>1:c[h4>>2]|0;i4=d[j5]|0;h7=(i4&1|0)==0?i4>>>1:c[i6>>2]|0;eI(aE,(i3&1)==0?h8:c[h5>>2]|0,jF,h7+jF|0);eB(aE,(a[j5]&1)==0?i9:c[js>>2]|0,h7)|0;ex(aL,7072,3);lC(j7|0,0,12);h7=a[iu]|0;jF=h7&255;i3=(jF&1|0)==0?jF>>>1:c[jB>>2]|0;jF=d[cL]|0;i4=(jF&1|0)==0?jF>>>1:c[jx>>2]|0;eI(aD,(h7&1)==0?jC:c[h2>>2]|0,i3,i4+i3|0);eB(aD,(a[cL]&1)==0?h3:c[jb>>2]|0,i4)|0;i4=a[j7]|0;i3=i4&255;eB(d$,(i4&1)==0?jy:c[ia>>2]|0,(i3&1|0)==0?i3>>>1:c[jn>>2]|0)|0;ep(aD);ep(aL);ep(aE);ep(aK);ep(aF);ep(aJ);ep(aG);ep(aI);ep(aH);ly=ly+1|0;}while((ly|0)<(ib|0))}jA=jA+1|0;}while((jA|0)<(jr|0))}ex(aM,4608,36);jA=a[cM]|0;if((jA&1)==0){nt=aM+1|0}else{nt=c[aM+8>>2]|0}jn=jA&255;if((jn&1|0)==0){nu=jn>>>1}else{nu=c[aM+4>>2]|0}eB(d$,nt,nu)|0;ep(aM);ex(aN,4224,44);jn=a[cK]|0;if((jn&1)==0){nv=aN+1|0}else{nv=c[aN+8>>2]|0}jA=jn&255;if((jA&1|0)==0){nw=jA>>>1}else{nw=c[aN+4>>2]|0}eB(d$,nv,nw)|0;ep(aN);if(h9){jA=aO+1|0;jn=(ib|0)>0;ia=aP+1|0;jy=jr-1|0;jb=aQ+1|0;h3=aQ+4|0;h2=aQ+8|0;jC=aP+4|0;jx=aP+8|0;jB=ag(ju,ed)|0;js=aO+4|0;i9=aO+8|0;h5=t|0;h8=aS+1|0;i6=aT+1|0;h4=aR+1|0;jq=aU+1|0;jc=aU+8|0;jo=aR+8|0;jv=aU+4|0;i7=aR+4|0;jz=aT+8|0;jw=aS+8|0;lv=aT+4|0;i5=aS+4|0;lz=0;do{ex(aO,4176,19);lr=a[cN]|0;ja=lr&255;eB(d$,(lr&1)==0?jA:c[i9>>2]|0,(ja&1|0)==0?ja>>>1:c[js>>2]|0)|0;ep(aO);if(jn){ja=ag(lz,ib)|0;lr=ag(jB,lz)|0;jp=0;do{dd(d$,jp+ja|0,(ag(jp,eA)|0)+lr|0,em);jp=jp+1|0;}while((jp|0)<(ib|0))}ex(aP,5712,6);jp=a[cJ]|0;lr=jp&255;eB(d$,(jp&1)==0?ia:c[jx>>2]|0,(lr&1|0)==0?lr>>>1:c[jC>>2]|0)|0;ep(aP);if((lz|0)!=(jy|0)){ex(aS,4104,10);bg(h5|0,14080,(B=i,i=i+8|0,c[B>>2]=ju,B)|0)|0;ex(aT,h5,lB(h5|0)|0);lC(kM|0,0,12);lr=a[kK]|0;jp=lr&255;ja=(jp&1|0)==0?jp>>>1:c[i5>>2]|0;jp=d[il]|0;lu=(jp&1|0)==0?jp>>>1:c[lv>>2]|0;eI(aR,(lr&1)==0?h8:c[jw>>2]|0,ja,lu+ja|0);ja=(a[il]&1)==0?i6:c[jz>>2]|0;eB(aR,ja,lu)|0;ex(aU,4944,2);lC(kL|0,0,12);lu=a[kM]|0;ja=lu&255;lr=(ja&1|0)==0?ja>>>1:c[i7>>2]|0;ja=d[kN]|0;jp=(ja&1|0)==0?ja>>>1:c[jv>>2]|0;eI(aQ,(lu&1)==0?h4:c[jo>>2]|0,lr,jp+lr|0);lr=(a[kN]&1)==0?jq:c[jc>>2]|0;eB(aQ,lr,jp)|0;jp=a[kL]|0;lr=(jp&1)==0?jb:c[h2>>2]|0;lu=jp&255;jp=(lu&1|0)==0?lu>>>1:c[h3>>2]|0;eB(d$,lr,jp)|0;ep(aQ);ep(aU);ep(aR);ep(aT);ep(aS)}lz=lz+1|0;}while((lz|0)<(jr|0))}ex(aV,6832,2);lz=a[kJ]|0;if((lz&1)==0){nx=aV+1|0}else{nx=c[aV+8>>2]|0}h3=lz&255;if((h3&1|0)==0){ny=h3>>>1}else{ny=c[aV+4>>2]|0}eB(d$,nx,ny)|0;ep(aV);ex(aW,4088,7);h3=a[iq]|0;if((h3&1)==0){nz=aW+1|0}else{nz=c[aW+8>>2]|0}lz=h3&255;if((lz&1|0)==0){nA=lz>>>1}else{nA=c[aW+4>>2]|0}eB(d$,nz,nA)|0;ep(aW);do{if(h9){lz=ag(ju,ed)|0;if((ib|0)>0){nB=0}else{break}do{h3=ag(nB,ib)|0;h2=ag(lz,nB)|0;jb=0;do{dd(d$,jb+h3|0,(ag(jb,eA)|0)+h2|0,em);jb=jb+1|0;}while((jb|0)<(ib|0));nB=nB+1|0;}while((nB|0)<(jr|0))}}while(0);ex(aX,6832,2);jr=a[kO]|0;if((jr&1)==0){nC=aX+1|0}else{nC=c[aX+8>>2]|0}ib=jr&255;if((ib&1|0)==0){nD=ib>>>1}else{nD=c[aX+4>>2]|0}eB(d$,nC,nD)|0;ep(aX);mK=ag(ee,jt)|0}else{ib=(ee|0)>1;if(ib){ex(D,5784,62);jr=a[d3]|0;if((jr&1)==0){nE=D+1|0}else{nE=c[D+8>>2]|0}ju=jr&255;if((ju&1|0)==0){nF=ju>>>1}else{nF=c[D+4>>2]|0}eB(d$,nE,nF)|0;ep(D);ex(E,5728,4);eq(C,E)|0;ep(E)}if((d2|0)>0){ju=0;do{jr=(ag((ju|0)%(jm|0)|0,lo)|0)+((ju|0)/(jm|0)|0)|0;dd(d$,jr,ag(ju,ez)|0,em);ju=ju+1|0;}while((ju|0)<(d2|0))}if(!ib){mK=0;break}ex(F,5712,6);ju=a[dZ]|0;if((ju&1)==0){nG=F+1|0}else{nG=c[F+8>>2]|0}jt=ju&255;if((jt&1|0)==0){nH=jt>>>1}else{nH=c[F+4>>2]|0}eB(d$,nG,nH)|0;ep(F);mK=0}}while(0);ep(C);C=(c[es>>2]|0)+8|0;F=c[C>>2]|0;c[C>>2]=mK>>>0>F>>>0?mK:F;dc(en,d0,em);ex(d6,14200,2);em=a[d6]|0;if((em&1)==0){nI=d6+1|0}else{nI=c[d6+8>>2]|0}F=em&255;if((F&1|0)==0){nJ=F>>>1}else{nJ=c[d6+4>>2]|0}eB(en,nI,nJ)|0;ep(d6);if((c[(c[es>>2]|0)+8>>2]|0)!=0){ex(d9,7328,23);d6=c[(c[es>>2]|0)+8>>2]|0;bg(eg|0,14080,(B=i,i=i+8|0,c[B>>2]=d6,B)|0)|0;ex(ea,eg,lB(eg|0)|0);eg=d8;lC(eg|0,0,12);d6=a[d9]|0;es=d6&255;if((es&1|0)==0){nK=es>>>1}else{nK=c[d9+4>>2]|0}es=ea;nJ=d[es]|0;if((nJ&1|0)==0){nL=nJ>>>1}else{nL=c[ea+4>>2]|0}if((d6&1)==0){nM=d9+1|0}else{nM=c[d9+8>>2]|0}eI(d8,nM,nK,nL+nK|0);if((a[es]&1)==0){nN=ea+1|0}else{nN=c[ea+8>>2]|0}eB(d8,nN,nL)|0;ex(eb,7072,3);nL=d7;lC(nL|0,0,12);nN=a[eg]|0;eg=nN&255;if((eg&1|0)==0){nO=eg>>>1}else{nO=c[d8+4>>2]|0}eg=eb;es=d[eg]|0;if((es&1|0)==0){nP=es>>>1}else{nP=c[eb+4>>2]|0}if((nN&1)==0){nQ=d8+1|0}else{nQ=c[d8+8>>2]|0}eI(d7,nQ,nO,nP+nO|0);if((a[eg]&1)==0){nR=eb+1|0}else{nR=c[eb+8>>2]|0}eB(d7,nR,nP)|0;nP=a[nL]|0;if((nP&1)==0){nS=d7+1|0}else{nS=c[d7+8>>2]|0}nL=nP&255;if((nL&1|0)==0){nT=nL>>>1}else{nT=c[d7+4>>2]|0}eB(en,nS,nT)|0;ep(d7);ep(eb);ep(d8);ep(ea);ep(d9)}d9=a[d$]|0;if((d9&1)==0){nU=d$+1|0}else{nU=c[d$+8>>2]|0}ea=d9&255;if((ea&1|0)==0){nV=ea>>>1}else{nV=c[d$+4>>2]|0}eB(en,nU,nV)|0;ex(ec,6832,2);nV=a[ec]|0;if((nV&1)==0){nW=ec+1|0}else{nW=c[ec+8>>2]|0}nU=nV&255;if((nU&1|0)==0){nX=nU>>>1}else{nX=c[ec+4>>2]|0}eB(en,nW,nX)|0;ep(ec);ep(d5);ep(d4);ep(d0);ep(d$);i=e;return}function c8(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;f=i;i=i+392|0;g=f+200|0;h=f+216|0;j=f+232|0;k=f+248|0;l=f+264|0;m=f+280|0;n=f+296|0;o=f+312|0;p=f+328|0;q=f+344|0;r=f+360|0;s=f+376|0;ex(g,14448,66);t=a[g]|0;if((t&1)==0){u=g+1|0}else{u=c[g+8>>2]|0}v=t&255;if((v&1|0)==0){w=v>>>1}else{w=c[g+4>>2]|0}eB(b,u,w)|0;ep(g);ex(h,14400,27);g=a[h]|0;if((g&1)==0){x=h+1|0}else{x=c[h+8>>2]|0}w=g&255;if((w&1|0)==0){y=w>>>1}else{y=c[h+4>>2]|0}eB(b,x,y)|0;ep(h);ex(j,14368,14);h=a[j]|0;if((h&1)==0){z=j+1|0}else{z=c[j+8>>2]|0}y=h&255;if((y&1|0)==0){A=y>>>1}else{A=c[j+4>>2]|0}eB(b,z,A)|0;ep(j);ex(k,14320,27);j=a[k]|0;if((j&1)==0){C=k+1|0}else{C=c[k+8>>2]|0}A=j&255;if((A&1|0)==0){D=A>>>1}else{D=c[k+4>>2]|0}eB(b,C,D)|0;ep(k);ex(l,14256,41);k=a[l]|0;if((k&1)==0){E=l+1|0}else{E=c[l+8>>2]|0}D=k&255;if((D&1|0)==0){F=D>>>1}else{F=c[l+4>>2]|0}eB(b,E,F)|0;ep(l);ex(o,14224,13);l=f|0;bg(l|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(p,l,lB(l|0)|0);l=n;lC(l|0,0,12);e=a[o]|0;F=e&255;if((F&1|0)==0){G=F>>>1}else{G=c[o+4>>2]|0}F=p;E=d[F]|0;if((E&1|0)==0){H=E>>>1}else{H=c[p+4>>2]|0}if((e&1)==0){I=o+1|0}else{I=c[o+8>>2]|0}eI(n,I,G,H+G|0);if((a[F]&1)==0){J=p+1|0}else{J=c[p+8>>2]|0}eB(n,J,H)|0;ex(q,7072,3);H=m;lC(H|0,0,12);J=a[l]|0;l=J&255;if((l&1|0)==0){K=l>>>1}else{K=c[n+4>>2]|0}l=q;F=d[l]|0;if((F&1|0)==0){L=F>>>1}else{L=c[q+4>>2]|0}if((J&1)==0){M=n+1|0}else{M=c[n+8>>2]|0}eI(m,M,K,L+K|0);if((a[l]&1)==0){N=q+1|0}else{N=c[q+8>>2]|0}eB(m,N,L)|0;L=a[H]|0;if((L&1)==0){O=m+1|0}else{O=c[m+8>>2]|0}H=L&255;if((H&1|0)==0){P=H>>>1}else{P=c[m+4>>2]|0}eB(b,O,P)|0;ep(m);ep(q);ep(n);ep(p);ep(o);ex(r,14160,33);o=a[r]|0;if((o&1)==0){Q=r+1|0}else{Q=c[r+8>>2]|0}p=o&255;if((p&1|0)==0){R=p>>>1}else{R=c[r+4>>2]|0}eB(b,Q,R)|0;ep(r);ex(s,14120,37);r=a[s]|0;if((r&1)==0){S=s+1|0}else{S=c[s+8>>2]|0}R=r&255;if((R&1|0)==0){T=R>>>1}else{T=c[s+4>>2]|0}eB(b,S,T)|0;ep(s);i=f;return}function c9(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,c8=0,c9=0,da=0,db=0,dc=0,dd=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dz=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,eq=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ey=0,ez=0,eA=0,eC=0,eD=0,eE=0,eF=0,eG=0,eH=0,eJ=0,eK=0,eL=0,eM=0,eN=0,eO=0,eP=0,eQ=0,eR=0,eS=0,eT=0,eU=0,eV=0,eW=0,eX=0,eY=0,eZ=0,e_=0,e$=0,e0=0,e1=0,e2=0,e3=0,e4=0,e5=0,e6=0,e7=0,e8=0,e9=0,fa=0,fb=0,fc=0,fd=0,fe=0,ff=0,fg=0,fh=0,fi=0,fj=0,fk=0,fl=0,fm=0,fn=0,fo=0,fp=0,fq=0,fr=0,fs=0,ft=0,fu=0,fv=0,fw=0,fx=0,fy=0,fz=0,fA=0,fB=0,fC=0,fD=0,fE=0,fF=0,fG=0,fH=0,fI=0,fJ=0,fK=0,fL=0,fM=0,fN=0,fO=0,fP=0,fQ=0,fR=0,fS=0,fT=0,fU=0,fV=0,fW=0,fX=0,fY=0,fZ=0,f_=0,f$=0,f0=0,f1=0,f2=0,f3=0,f4=0,f5=0,f6=0,f7=0,f8=0,f9=0,ga=0,gb=0,gc=0,gd=0,ge=0,gf=0,gg=0,gh=0,gi=0,gj=0,gk=0,gl=0,gm=0,gn=0,go=0,gp=0,gq=0,gr=0,gs=0,gt=0,gu=0,gv=0,gw=0,gx=0,gy=0,gz=0,gA=0,gB=0,gC=0,gD=0,gE=0,gF=0,gG=0,gH=0,gI=0,gJ=0,gK=0,gL=0,gM=0,gN=0,gO=0,gP=0,gQ=0,gR=0,gS=0,gT=0,gU=0,gV=0,gW=0,gX=0,gY=0,gZ=0,g_=0,g$=0,g0=0,g1=0,g2=0,g3=0,g4=0,g5=0,g6=0,g7=0,g8=0,g9=0,ha=0,hb=0,hc=0,hd=0,he=0,hf=0,hg=0,hh=0,hi=0,hj=0,hk=0,hl=0,hm=0,hn=0,ho=0,hp=0,hq=0,hr=0,hs=0,ht=0,hu=0,hv=0,hw=0,hx=0,hy=0,hz=0,hA=0,hB=0,hC=0,hD=0,hE=0,hF=0,hG=0,hH=0,hI=0,hJ=0,hK=0,hL=0,hM=0,hN=0,hO=0,hP=0,hQ=0,hR=0,hS=0,hT=0,hU=0,hV=0,hW=0,hX=0,hY=0,hZ=0,h_=0,h$=0,h0=0,h1=0,h2=0,h3=0,h4=0,h5=0,h6=0,h7=0,h8=0,h9=0,ia=0,ib=0,ic=0,id=0,ie=0,ig=0,ih=0,ii=0,ij=0,ik=0,il=0,im=0,io=0,ip=0,iq=0,ir=0,is=0;l=i;i=i+4040|0;m=l|0;n=l+200|0;o=l+216|0;p=l+232|0;q=l+248|0;r=l+264|0;s=l+280|0;t=l+296|0;u=l+312|0;v=l+328|0;w=l+344|0;x=l+360|0;y=l+376|0;z=l+392|0;A=l+408|0;C=l+424|0;D=l+440|0;E=l+456|0;F=l+472|0;G=l+488|0;H=l+504|0;I=l+520|0;J=l+536|0;K=l+552|0;L=l+568|0;M=l+584|0;N=l+600|0;O=l+616|0;P=l+632|0;Q=l+648|0;R=l+664|0;S=l+680|0;T=l+696|0;U=l+712|0;V=l+728|0;W=l+744|0;X=l+760|0;Y=l+776|0;Z=l+792|0;_=l+808|0;$=l+824|0;aa=l+840|0;ab=l+856|0;ac=l+872|0;ad=l+888|0;ae=l+904|0;af=l+920|0;ah=l+936|0;ai=l+952|0;aj=l+968|0;ak=l+984|0;al=l+1e3|0;am=l+1016|0;an=l+1032|0;ao=l+1048|0;ap=l+1064|0;aq=l+1080|0;ar=l+1096|0;as=l+1112|0;at=l+1128|0;au=l+1144|0;av=l+1160|0;aw=l+1176|0;ax=l+1192|0;ay=l+1208|0;az=l+1224|0;aA=l+1240|0;aB=l+1256|0;aC=l+1272|0;aD=l+1288|0;aE=l+1304|0;aF=l+1320|0;aG=l+1336|0;aH=l+1352|0;aI=l+1368|0;aJ=l+1384|0;aK=l+1400|0;aL=l+1416|0;aM=l+1432|0;aN=l+1448|0;aO=l+1464|0;aP=l+1480|0;aQ=l+1496|0;aR=l+1512|0;aS=l+1528|0;aT=l+1544|0;aU=l+1560|0;aV=l+1576|0;aW=l+1592|0;aX=l+1608|0;aY=l+1624|0;aZ=l+1640|0;a_=l+1656|0;a$=l+1672|0;a0=l+1688|0;a1=l+1704|0;a2=l+1720|0;a3=l+1736|0;a4=l+1752|0;a5=l+1768|0;a6=l+1784|0;a7=l+1800|0;a8=l+1816|0;a9=l+1832|0;ba=l+1848|0;bb=l+1864|0;bc=l+1880|0;bd=l+1896|0;be=l+1912|0;bf=l+1928|0;bh=l+1944|0;bi=l+1960|0;bj=l+1976|0;bl=l+1992|0;bm=l+2008|0;bn=l+2024|0;bo=l+2040|0;bp=l+2056|0;bq=l+2072|0;br=l+2088|0;bs=l+2104|0;bt=l+2120|0;bu=l+2136|0;bv=l+2152|0;bw=l+2168|0;bx=l+2184|0;by=l+2200|0;bz=l+2216|0;bA=l+2232|0;bB=l+2248|0;bC=l+2264|0;bD=l+2280|0;bE=l+2296|0;bF=l+2312|0;bG=l+2328|0;bH=l+2344|0;bI=l+2360|0;bJ=l+2376|0;bK=l+2392|0;bL=l+2408|0;bM=l+2424|0;bN=l+2440|0;bO=l+2456|0;bP=l+2472|0;bQ=l+2488|0;bR=l+2504|0;bS=l+2520|0;bT=l+2536|0;bU=l+2552|0;bV=l+2568|0;bW=l+2584|0;bX=l+2600|0;bY=l+2616|0;bZ=l+2632|0;b_=l+2648|0;b$=l+2664|0;b0=l+2680|0;b1=l+2696|0;b2=l+2712|0;b3=l+2728|0;b4=l+2744|0;b5=l+2760|0;b6=l+2776|0;b7=l+2792|0;b8=l+2808|0;b9=l+2824|0;ca=l+2840|0;cb=l+2856|0;cc=l+2872|0;cd=l+2888|0;ce=l+2904|0;cf=l+2920|0;cg=l+2936|0;ch=l+2952|0;ci=l+2968|0;cj=l+2984|0;ck=l+3e3|0;cl=l+3016|0;cm=l+3032|0;cn=l+3048|0;co=l+3064|0;cp=l+3080|0;cq=l+3096|0;cr=l+3112|0;cs=l+3128|0;ct=l+3144|0;cu=l+3160|0;cv=l+3176|0;cw=l+3192|0;cx=l+3208|0;cy=l+3224|0;cz=l+3240|0;cA=l+3256|0;cB=l+3272|0;cC=l+3288|0;cD=l+3304|0;cE=l+3320|0;cF=l+3336|0;cG=l+3352|0;cH=l+3368|0;cI=l+3384|0;cJ=l+3400|0;cK=l+3416|0;cL=l+3432|0;cM=l+3448|0;cN=l+3464|0;cO=l+3480|0;cP=l+3496|0;cQ=l+3512|0;cR=l+3528|0;cS=l+3544|0;cT=l+3560|0;cU=l+3576|0;cV=l+3592|0;cW=l+3608|0;cX=l+3624|0;cY=l+3640|0;cZ=l+3656|0;c_=l+3672|0;c$=l+3688|0;c0=l+3704|0;c1=l+3720|0;c2=l+3736|0;c3=l+3752|0;c4=l+3768|0;c5=l+3784|0;c6=l+3800|0;c7=l+3816|0;c8=l+3832|0;c9=l+3848|0;da=l+3864|0;db=l+3880|0;dc=l+3896|0;dd=l+3912|0;df=l+3928|0;dg=l+3944|0;dh=l+3960|0;di=l+3976|0;dj=l+3992|0;dk=l+4008|0;dl=l+4024|0;dm=~~+bk(+(+(f|0)));dn=ag(g,f)|0;dp=(g|0)>1;if(dp){ex(p,1136,16);dq=g-1|0;dr=m|0;bg(dr|0,14080,(B=i,i=i+8|0,c[B>>2]=dq,B)|0)|0;ex(q,dr,lB(dr|0)|0);dr=o;lC(dr|0,0,12);dq=a[p]|0;ds=dq&255;if((ds&1|0)==0){dt=ds>>>1}else{dt=c[p+4>>2]|0}ds=q;du=d[ds]|0;if((du&1|0)==0){dv=du>>>1}else{dv=c[q+4>>2]|0}if((dq&1)==0){dw=p+1|0}else{dw=c[p+8>>2]|0}eI(o,dw,dt,dv+dt|0);if((a[ds]&1)==0){dx=q+1|0}else{dx=c[q+8>>2]|0}eB(o,dx,dv)|0;ex(r,4944,2);dv=n;lC(dv|0,0,12);dx=a[dr]|0;dr=dx&255;if((dr&1|0)==0){dy=dr>>>1}else{dy=c[o+4>>2]|0}dr=r;ds=d[dr]|0;if((ds&1|0)==0){dz=ds>>>1}else{dz=c[r+4>>2]|0}if((dx&1)==0){dA=o+1|0}else{dA=c[o+8>>2]|0}eI(n,dA,dy,dz+dy|0);if((a[dr]&1)==0){dB=r+1|0}else{dB=c[r+8>>2]|0}eB(n,dB,dz)|0;dz=a[dv]|0;if((dz&1)==0){dC=n+1|0}else{dC=c[n+8>>2]|0}dv=dz&255;if((dv&1|0)==0){dD=dv>>>1}else{dD=c[n+4>>2]|0}eB(b,dC,dD)|0;ep(n);ep(r);ep(o);ep(q);ep(p)}if((f|0)>=(j|0)){if(!dp){ex(U,712,14);dp=a[U]|0;if((dp&1)==0){dE=U+1|0}else{dE=c[U+8>>2]|0}p=dp&255;if((p&1|0)==0){dF=p>>>1}else{dF=c[U+4>>2]|0}eB(b,dE,dF)|0;ep(U);ex(V,680,12);U=a[V]|0;if((U&1)==0){dG=V+1|0}else{dG=c[V+8>>2]|0}dF=U&255;if((dF&1|0)==0){dH=dF>>>1}else{dH=c[V+4>>2]|0}eB(b,dG,dH)|0;ep(V);ex(Y,640,29);V=m|0;bg(V|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(Z,V,lB(V|0)|0);V=X;lC(V|0,0,12);dH=a[Y]|0;dG=dH&255;if((dG&1|0)==0){dI=dG>>>1}else{dI=c[Y+4>>2]|0}dG=Z;dF=d[dG]|0;if((dF&1|0)==0){dJ=dF>>>1}else{dJ=c[Z+4>>2]|0}if((dH&1)==0){dK=Y+1|0}else{dK=c[Y+8>>2]|0}eI(X,dK,dI,dJ+dI|0);if((a[dG]&1)==0){dL=Z+1|0}else{dL=c[Z+8>>2]|0}eB(X,dL,dJ)|0;ex(_,1904,7);dJ=W;lC(dJ|0,0,12);dL=a[V]|0;V=dL&255;if((V&1|0)==0){dM=V>>>1}else{dM=c[X+4>>2]|0}V=_;dG=d[V]|0;if((dG&1|0)==0){dN=dG>>>1}else{dN=c[_+4>>2]|0}if((dL&1)==0){dO=X+1|0}else{dO=c[X+8>>2]|0}eI(W,dO,dM,dN+dM|0);if((a[V]&1)==0){dP=_+1|0}else{dP=c[_+8>>2]|0}eB(W,dP,dN)|0;dN=a[dJ]|0;if((dN&1)==0){dQ=W+1|0}else{dQ=c[W+8>>2]|0}dJ=dN&255;if((dJ&1|0)==0){dR=dJ>>>1}else{dR=c[W+4>>2]|0}eB(b,dQ,dR)|0;ep(W);ep(_);ep(X);ep(Z);ep(Y);if((k|0)==1){ex($,1040,22);Y=a[$]|0;if((Y&1)==0){dS=$+1|0}else{dS=c[$+8>>2]|0}Z=Y&255;if((Z&1|0)==0){dT=Z>>>1}else{dT=c[$+4>>2]|0}eB(b,dS,dT)|0;ep($);ex(aa,1008,23);$=a[aa]|0;if(($&1)==0){dU=aa+1|0}else{dU=c[aa+8>>2]|0}dT=$&255;if((dT&1|0)==0){dV=dT>>>1}else{dV=c[aa+4>>2]|0}eB(b,dU,dV)|0;ep(aa)}else{ex(ab,968,27);aa=a[ab]|0;if((aa&1)==0){dW=ab+1|0}else{dW=c[ab+8>>2]|0}dV=aa&255;if((dV&1|0)==0){dX=dV>>>1}else{dX=c[ab+4>>2]|0}eB(b,dW,dX)|0;ep(ab);ex(ac,872,27);ab=a[ac]|0;if((ab&1)==0){dY=ac+1|0}else{dY=c[ac+8>>2]|0}dX=ab&255;if((dX&1|0)==0){dZ=dX>>>1}else{dZ=c[ac+4>>2]|0}eB(b,dY,dZ)|0;ep(ac);ex(ad,824,28);ac=a[ad]|0;if((ac&1)==0){d_=ad+1|0}else{d_=c[ad+8>>2]|0}dZ=ac&255;if((dZ&1|0)==0){d$=dZ>>>1}else{d$=c[ad+4>>2]|0}eB(b,d_,d$)|0;ep(ad);ex(ae,744,28);ad=a[ae]|0;if((ad&1)==0){d0=ae+1|0}else{d0=c[ae+8>>2]|0}d$=ad&255;if((d$&1|0)==0){d1=d$>>>1}else{d1=c[ae+4>>2]|0}eB(b,d0,d1)|0;ep(ae)}if((h|0)>0){d2=0}else{d3=0;i=l;return d3|0}while(1){de(b,d2,ag(d2,f)|0,k);ae=d2+1|0;if((ae|0)<(h|0)){d2=ae}else{d3=0;break}}i=l;return d3|0}ex(u,4968,15);d2=f-1|0;ae=m|0;bg(ae|0,14080,(B=i,i=i+8|0,c[B>>2]=d2,B)|0)|0;ex(v,ae,lB(ae|0)|0);d2=t;lC(d2|0,0,12);d1=a[u]|0;d0=d1&255;if((d0&1|0)==0){d4=d0>>>1}else{d4=c[u+4>>2]|0}d0=v;d$=d[d0]|0;if((d$&1|0)==0){d5=d$>>>1}else{d5=c[v+4>>2]|0}if((d1&1)==0){d6=u+1|0}else{d6=c[u+8>>2]|0}eI(t,d6,d4,d5+d4|0);if((a[d0]&1)==0){d7=v+1|0}else{d7=c[v+8>>2]|0}eB(t,d7,d5)|0;ex(w,4944,2);d5=s;lC(d5|0,0,12);d7=a[d2]|0;d2=d7&255;if((d2&1|0)==0){d8=d2>>>1}else{d8=c[t+4>>2]|0}d2=w;d0=d[d2]|0;if((d0&1|0)==0){d9=d0>>>1}else{d9=c[w+4>>2]|0}if((d7&1)==0){ea=t+1|0}else{ea=c[t+8>>2]|0}eI(s,ea,d8,d9+d8|0);if((a[d2]&1)==0){eb=w+1|0}else{eb=c[w+8>>2]|0}eB(s,eb,d9)|0;d9=a[d5]|0;if((d9&1)==0){ec=s+1|0}else{ec=c[s+8>>2]|0}d5=d9&255;if((d5&1|0)==0){ed=d5>>>1}else{ed=c[s+4>>2]|0}eB(b,ec,ed)|0;ep(s);ep(w);ep(t);ep(v);ep(u);ex(z,4904,16);bg(ae|0,14080,(B=i,i=i+8|0,c[B>>2]=dm,B)|0)|0;ex(A,ae,lB(ae|0)|0);u=y;lC(u|0,0,12);v=a[z]|0;t=v&255;if((t&1|0)==0){ee=t>>>1}else{ee=c[z+4>>2]|0}t=A;w=d[t]|0;if((w&1|0)==0){ef=w>>>1}else{ef=c[A+4>>2]|0}if((v&1)==0){eg=z+1|0}else{eg=c[z+8>>2]|0}eI(y,eg,ee,ef+ee|0);if((a[t]&1)==0){eh=A+1|0}else{eh=c[A+8>>2]|0}eB(y,eh,ef)|0;ex(C,4944,2);ef=x;lC(ef|0,0,12);eh=a[u]|0;u=eh&255;if((u&1|0)==0){ei=u>>>1}else{ei=c[y+4>>2]|0}u=C;t=d[u]|0;if((t&1|0)==0){ej=t>>>1}else{ej=c[C+4>>2]|0}if((eh&1)==0){ek=y+1|0}else{ek=c[y+8>>2]|0}eI(x,ek,ei,ej+ei|0);if((a[u]&1)==0){el=C+1|0}else{el=c[C+8>>2]|0}eB(x,el,ej)|0;ej=a[ef]|0;if((ej&1)==0){em=x+1|0}else{em=c[x+8>>2]|0}ef=ej&255;if((ef&1|0)==0){en=ef>>>1}else{en=c[x+4>>2]|0}eB(b,em,en)|0;ep(x);ep(C);ep(y);ep(A);ep(z);ex(D,5784,62);z=a[D]|0;if((z&1)==0){eo=D+1|0}else{eo=c[D+8>>2]|0}A=z&255;if((A&1|0)==0){eq=A>>>1}else{eq=c[D+4>>2]|0}eB(b,eo,eq)|0;ep(D);ex(I,1088,39);bg(ae|0,14080,(B=i,i=i+8|0,c[B>>2]=g,B)|0)|0;ex(J,ae,lB(ae|0)|0);D=H;lC(D|0,0,12);eq=a[I]|0;eo=eq&255;if((eo&1|0)==0){er=eo>>>1}else{er=c[I+4>>2]|0}eo=J;A=d[eo]|0;if((A&1|0)==0){es=A>>>1}else{es=c[J+4>>2]|0}if((eq&1)==0){et=I+1|0}else{et=c[I+8>>2]|0}eI(H,et,er,es+er|0);if((a[eo]&1)==0){eu=J+1|0}else{eu=c[J+8>>2]|0}eB(H,eu,es)|0;ex(K,1072,7);es=G;lC(es|0,0,12);eu=a[D]|0;D=eu&255;if((D&1|0)==0){ev=D>>>1}else{ev=c[H+4>>2]|0}D=K;eo=d[D]|0;if((eo&1|0)==0){ew=eo>>>1}else{ew=c[K+4>>2]|0}if((eu&1)==0){ey=H+1|0}else{ey=c[H+8>>2]|0}eI(G,ey,ev,ew+ev|0);if((a[D]&1)==0){ez=K+1|0}else{ez=c[K+8>>2]|0}eB(G,ez,ew)|0;bg(ae|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(L,ae,lB(ae|0)|0);ae=F;lC(ae|0,0,12);ew=a[es]|0;es=ew&255;if((es&1|0)==0){eA=es>>>1}else{eA=c[G+4>>2]|0}es=L;ez=d[es]|0;if((ez&1|0)==0){eC=ez>>>1}else{eC=c[L+4>>2]|0}if((ew&1)==0){eD=G+1|0}else{eD=c[G+8>>2]|0}eI(F,eD,eA,eC+eA|0);if((a[es]&1)==0){eE=L+1|0}else{eE=c[L+8>>2]|0}eB(F,eE,eC)|0;ex(M,4992,8);eC=E;lC(eC|0,0,12);eE=a[ae]|0;ae=eE&255;if((ae&1|0)==0){eF=ae>>>1}else{eF=c[F+4>>2]|0}ae=M;es=d[ae]|0;if((es&1|0)==0){eG=es>>>1}else{eG=c[M+4>>2]|0}if((eE&1)==0){eH=F+1|0}else{eH=c[F+8>>2]|0}eI(E,eH,eF,eG+eF|0);if((a[ae]&1)==0){eJ=M+1|0}else{eJ=c[M+8>>2]|0}eB(E,eJ,eG)|0;eG=a[eC]|0;if((eG&1)==0){eK=E+1|0}else{eK=c[E+8>>2]|0}eC=eG&255;if((eC&1|0)==0){eL=eC>>>1}else{eL=c[E+4>>2]|0}eB(b,eK,eL)|0;ep(E);ep(M);ep(F);ep(L);ep(G);ep(K);ep(H);ep(J);ep(I);if((k|0)==1){ex(N,1040,22);I=a[N]|0;if((I&1)==0){eM=N+1|0}else{eM=c[N+8>>2]|0}J=I&255;if((J&1|0)==0){eN=J>>>1}else{eN=c[N+4>>2]|0}eB(b,eM,eN)|0;ep(N);ex(O,1008,23);N=a[O]|0;if((N&1)==0){eO=O+1|0}else{eO=c[O+8>>2]|0}eN=N&255;if((eN&1|0)==0){eP=eN>>>1}else{eP=c[O+4>>2]|0}eB(b,eO,eP)|0;ep(O)}else{ex(P,968,27);O=a[P]|0;if((O&1)==0){eQ=P+1|0}else{eQ=c[P+8>>2]|0}eP=O&255;if((eP&1|0)==0){eR=eP>>>1}else{eR=c[P+4>>2]|0}eB(b,eQ,eR)|0;ep(P);ex(Q,872,27);P=a[Q]|0;if((P&1)==0){eS=Q+1|0}else{eS=c[Q+8>>2]|0}eR=P&255;if((eR&1|0)==0){eT=eR>>>1}else{eT=c[Q+4>>2]|0}eB(b,eS,eT)|0;ep(Q);ex(R,824,28);Q=a[R]|0;if((Q&1)==0){eU=R+1|0}else{eU=c[R+8>>2]|0}eT=Q&255;if((eT&1|0)==0){eV=eT>>>1}else{eV=c[R+4>>2]|0}eB(b,eU,eV)|0;ep(R);ex(S,744,28);R=a[S]|0;if((R&1)==0){eW=S+1|0}else{eW=c[S+8>>2]|0}eV=R&255;if((eV&1|0)==0){eX=eV>>>1}else{eX=c[S+4>>2]|0}eB(b,eW,eX)|0;ep(S)}if((h|0)>0){S=0;do{de(b,S,ag(S,f)|0,k);S=S+1|0;}while((S|0)<(h|0))}ex(T,5712,6);S=a[T]|0;if((S&1)==0){eY=T+1|0}else{eY=c[T+8>>2]|0}eX=S&255;if((eX&1|0)==0){eZ=eX>>>1}else{eZ=c[T+4>>2]|0}eB(b,eY,eZ)|0;ep(T);d3=0;i=l;return d3|0}if((e|0)>=(j|0)){T=(e|0)/(j|0)|0;eZ=(dn|0)/(j|0)|0;eY=(g|0)/(eZ|0)|0;ex(ai,4968,15);eX=j-1|0;S=m|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=eX,B)|0)|0;ex(aj,S,lB(S|0)|0);eX=ah;lC(eX|0,0,12);eW=a[ai]|0;eV=eW&255;if((eV&1|0)==0){e_=eV>>>1}else{e_=c[ai+4>>2]|0}eV=aj;R=d[eV]|0;if((R&1|0)==0){e$=R>>>1}else{e$=c[aj+4>>2]|0}if((eW&1)==0){e0=ai+1|0}else{e0=c[ai+8>>2]|0}eI(ah,e0,e_,e$+e_|0);if((a[eV]&1)==0){e1=aj+1|0}else{e1=c[aj+8>>2]|0}eB(ah,e1,e$)|0;ex(ak,4944,2);e$=af;lC(e$|0,0,12);e1=a[eX]|0;eX=e1&255;if((eX&1|0)==0){e2=eX>>>1}else{e2=c[ah+4>>2]|0}eX=ak;eV=d[eX]|0;if((eV&1|0)==0){e3=eV>>>1}else{e3=c[ak+4>>2]|0}if((e1&1)==0){e4=ah+1|0}else{e4=c[ah+8>>2]|0}eI(af,e4,e2,e3+e2|0);if((a[eX]&1)==0){e5=ak+1|0}else{e5=c[ak+8>>2]|0}eB(af,e5,e3)|0;e3=a[e$]|0;if((e3&1)==0){e6=af+1|0}else{e6=c[af+8>>2]|0}e$=e3&255;if((e$&1|0)==0){e7=e$>>>1}else{e7=c[af+4>>2]|0}eB(b,e6,e7)|0;ep(af);ep(ak);ep(ah);ep(aj);ep(ai);ex(an,4904,16);ai=~~+bk(+(+(j|0)));bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=ai,B)|0)|0;ex(ao,S,lB(S|0)|0);ai=am;lC(ai|0,0,12);aj=a[an]|0;ah=aj&255;if((ah&1|0)==0){e8=ah>>>1}else{e8=c[an+4>>2]|0}ah=ao;ak=d[ah]|0;if((ak&1|0)==0){e9=ak>>>1}else{e9=c[ao+4>>2]|0}if((aj&1)==0){fa=an+1|0}else{fa=c[an+8>>2]|0}eI(am,fa,e8,e9+e8|0);if((a[ah]&1)==0){fb=ao+1|0}else{fb=c[ao+8>>2]|0}eB(am,fb,e9)|0;ex(ap,4944,2);e9=al;lC(e9|0,0,12);fb=a[ai]|0;ai=fb&255;if((ai&1|0)==0){fc=ai>>>1}else{fc=c[am+4>>2]|0}ai=ap;ah=d[ai]|0;if((ah&1|0)==0){fd=ah>>>1}else{fd=c[ap+4>>2]|0}if((fb&1)==0){fe=am+1|0}else{fe=c[am+8>>2]|0}eI(al,fe,fc,fd+fc|0);if((a[ai]&1)==0){ff=ap+1|0}else{ff=c[ap+8>>2]|0}eB(al,ff,fd)|0;fd=a[e9]|0;if((fd&1)==0){fg=al+1|0}else{fg=c[al+8>>2]|0}e9=fd&255;if((e9&1|0)==0){fh=e9>>>1}else{fh=c[al+4>>2]|0}eB(b,fg,fh)|0;ep(al);ep(ap);ep(am);ep(ao);ep(an);ex(as,592,34);an=f+e|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=an,B)|0)|0;ex(at,S,lB(S|0)|0);ao=ar;lC(ao|0,0,12);am=a[as]|0;ap=am&255;if((ap&1|0)==0){fi=ap>>>1}else{fi=c[as+4>>2]|0}ap=at;al=d[ap]|0;if((al&1|0)==0){fj=al>>>1}else{fj=c[at+4>>2]|0}if((am&1)==0){fk=as+1|0}else{fk=c[as+8>>2]|0}eI(ar,fk,fi,fj+fi|0);if((a[ap]&1)==0){fl=at+1|0}else{fl=c[at+8>>2]|0}eB(ar,fl,fj)|0;ex(au,4992,8);fj=aq;lC(fj|0,0,12);fl=a[ao]|0;ao=fl&255;if((ao&1|0)==0){fm=ao>>>1}else{fm=c[ar+4>>2]|0}ao=au;ap=d[ao]|0;if((ap&1|0)==0){fn=ap>>>1}else{fn=c[au+4>>2]|0}if((fl&1)==0){fo=ar+1|0}else{fo=c[ar+8>>2]|0}eI(aq,fo,fm,fn+fm|0);if((a[ao]&1)==0){fp=au+1|0}else{fp=c[au+8>>2]|0}eB(aq,fp,fn)|0;fn=a[fj]|0;if((fn&1)==0){fq=aq+1|0}else{fq=c[aq+8>>2]|0}fj=fn&255;if((fj&1|0)==0){fr=fj>>>1}else{fr=c[aq+4>>2]|0}eB(b,fq,fr)|0;ep(aq);ep(au);ep(ar);ep(at);ep(as);ex(ax,552,29);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=g,B)|0)|0;ex(ay,S,lB(S|0)|0);as=aw;lC(as|0,0,12);at=a[ax]|0;ar=at&255;if((ar&1|0)==0){fs=ar>>>1}else{fs=c[ax+4>>2]|0}ar=ay;au=d[ar]|0;if((au&1|0)==0){ft=au>>>1}else{ft=c[ay+4>>2]|0}if((at&1)==0){fu=ax+1|0}else{fu=c[ax+8>>2]|0}eI(aw,fu,fs,ft+fs|0);if((a[ar]&1)==0){fv=ay+1|0}else{fv=c[ay+8>>2]|0}eB(aw,fv,ft)|0;ex(az,536,7);ft=av;lC(ft|0,0,12);fv=a[as]|0;as=fv&255;if((as&1|0)==0){fw=as>>>1}else{fw=c[aw+4>>2]|0}as=az;ar=d[as]|0;if((ar&1|0)==0){fx=ar>>>1}else{fx=c[az+4>>2]|0}if((fv&1)==0){fy=aw+1|0}else{fy=c[aw+8>>2]|0}eI(av,fy,fw,fx+fw|0);if((a[as]&1)==0){fz=az+1|0}else{fz=c[az+8>>2]|0}eB(av,fz,fx)|0;fx=a[ft]|0;if((fx&1)==0){fA=av+1|0}else{fA=c[av+8>>2]|0}ft=fx&255;if((ft&1|0)==0){fB=ft>>>1}else{fB=c[av+4>>2]|0}eB(b,fA,fB)|0;ep(av);ep(az);ep(aw);ep(ay);ep(ax);ex(aC,496,28);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(aD,S,lB(S|0)|0);ax=aB;lC(ax|0,0,12);ay=a[aC]|0;aw=ay&255;if((aw&1|0)==0){fC=aw>>>1}else{fC=c[aC+4>>2]|0}aw=aD;az=d[aw]|0;if((az&1|0)==0){fD=az>>>1}else{fD=c[aD+4>>2]|0}if((ay&1)==0){fE=aC+1|0}else{fE=c[aC+8>>2]|0}eI(aB,fE,fC,fD+fC|0);if((a[aw]&1)==0){fF=aD+1|0}else{fF=c[aD+8>>2]|0}eB(aB,fF,fD)|0;ex(aE,4992,8);fD=aA;lC(fD|0,0,12);fF=a[ax]|0;ax=fF&255;if((ax&1|0)==0){fG=ax>>>1}else{fG=c[aB+4>>2]|0}ax=aE;aw=d[ax]|0;if((aw&1|0)==0){fH=aw>>>1}else{fH=c[aE+4>>2]|0}if((fF&1)==0){fI=aB+1|0}else{fI=c[aB+8>>2]|0}eI(aA,fI,fG,fH+fG|0);if((a[ax]&1)==0){fJ=aE+1|0}else{fJ=c[aE+8>>2]|0}eB(aA,fJ,fH)|0;fH=a[fD]|0;if((fH&1)==0){fK=aA+1|0}else{fK=c[aA+8>>2]|0}fD=fH&255;if((fD&1|0)==0){fL=fD>>>1}else{fL=c[aA+4>>2]|0}eB(b,fK,fL)|0;ep(aA);ep(aE);ep(aB);ep(aD);ep(aC);if((k|0)==1){ex(aF,1040,22);aC=a[aF]|0;if((aC&1)==0){fM=aF+1|0}else{fM=c[aF+8>>2]|0}aD=aC&255;if((aD&1|0)==0){fN=aD>>>1}else{fN=c[aF+4>>2]|0}eB(b,fM,fN)|0;ep(aF);ex(aG,1008,23);aF=a[aG]|0;if((aF&1)==0){fO=aG+1|0}else{fO=c[aG+8>>2]|0}fN=aF&255;if((fN&1|0)==0){fP=fN>>>1}else{fP=c[aG+4>>2]|0}eB(b,fO,fP)|0;ep(aG)}else{ex(aH,968,27);aG=a[aH]|0;if((aG&1)==0){fQ=aH+1|0}else{fQ=c[aH+8>>2]|0}fP=aG&255;if((fP&1|0)==0){fR=fP>>>1}else{fR=c[aH+4>>2]|0}eB(b,fQ,fR)|0;ep(aH);ex(aI,872,27);aH=a[aI]|0;if((aH&1)==0){fS=aI+1|0}else{fS=c[aI+8>>2]|0}fR=aH&255;if((fR&1|0)==0){fT=fR>>>1}else{fT=c[aI+4>>2]|0}eB(b,fS,fT)|0;ep(aI);ex(aJ,824,28);aI=a[aJ]|0;if((aI&1)==0){fU=aJ+1|0}else{fU=c[aJ+8>>2]|0}fT=aI&255;if((fT&1|0)==0){fV=fT>>>1}else{fV=c[aJ+4>>2]|0}eB(b,fU,fV)|0;ep(aJ);ex(aK,744,28);aJ=a[aK]|0;if((aJ&1)==0){fW=aK+1|0}else{fW=c[aK+8>>2]|0}fV=aJ&255;if((fV&1|0)==0){fX=fV>>>1}else{fX=c[aK+4>>2]|0}eB(b,fW,fX)|0;ep(aK)}ex(aL,4224,44);aK=a[aL]|0;if((aK&1)==0){fY=aL+1|0}else{fY=c[aL+8>>2]|0}fX=aK&255;if((fX&1|0)==0){fZ=fX>>>1}else{fZ=c[aL+4>>2]|0}eB(b,fY,fZ)|0;ep(aL);aL=(eY|0)>0;if(aL){fZ=aM;fY=aM+1|0;fX=(T|0)>0;aK=aN;fW=aN+1|0;fV=eY-1|0;aJ=aP;fU=aQ;fT=aR;aI=aQ+1|0;fS=aR+1|0;fR=aO;aH=aS;fQ=aP+1|0;fP=aS+1|0;aG=aO+1|0;fO=aO+4|0;fN=aO+8|0;aF=aS+8|0;fM=aP+8|0;aD=aS+4|0;aC=aP+4|0;aB=aR+8|0;aE=aQ+8|0;aA=aR+4|0;fL=aQ+4|0;fK=aN+4|0;fD=aN+8|0;fH=ag(eZ,e)|0;fJ=aM+4|0;ax=aM+8|0;fG=0;do{ex(aM,4176,19);fI=a[fZ]|0;fF=fI&255;eB(b,(fI&1)==0?fY:c[ax>>2]|0,(fF&1|0)==0?fF>>>1:c[fJ>>2]|0)|0;ep(aM);if(fX){fF=ag(fG,T)|0;fI=ag(fH,fG)|0;aw=0;do{de(b,aw+fF|0,(ag(aw,j)|0)+fI|0,k);aw=aw+1|0;}while((aw|0)<(T|0))}ex(aN,5712,6);aw=a[aK]|0;fI=aw&255;eB(b,(aw&1)==0?fW:c[fD>>2]|0,(fI&1|0)==0?fI>>>1:c[fK>>2]|0)|0;ep(aN);if((fG|0)!=(fV|0)){ex(aQ,4104,10);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=eZ,B)|0)|0;ex(aR,S,lB(S|0)|0);lC(aJ|0,0,12);fI=a[fU]|0;aw=fI&255;fF=(aw&1|0)==0?aw>>>1:c[fL>>2]|0;aw=d[fT]|0;fC=(aw&1|0)==0?aw>>>1:c[aA>>2]|0;eI(aP,(fI&1)==0?aI:c[aE>>2]|0,fF,fC+fF|0);fF=(a[fT]&1)==0?fS:c[aB>>2]|0;eB(aP,fF,fC)|0;ex(aS,4944,2);lC(fR|0,0,12);fC=a[aJ]|0;fF=fC&255;fI=(fF&1|0)==0?fF>>>1:c[aC>>2]|0;fF=d[aH]|0;aw=(fF&1|0)==0?fF>>>1:c[aD>>2]|0;eI(aO,(fC&1)==0?fQ:c[fM>>2]|0,fI,aw+fI|0);fI=(a[aH]&1)==0?fP:c[aF>>2]|0;eB(aO,fI,aw)|0;aw=a[fR]|0;fI=(aw&1)==0?aG:c[fN>>2]|0;fC=aw&255;aw=(fC&1|0)==0?fC>>>1:c[fO>>2]|0;eB(b,fI,aw)|0;ep(aO);ep(aS);ep(aP);ep(aR);ep(aQ)}fG=fG+1|0;}while((fG|0)<(eY|0))}ex(aT,15224,3);fG=a[aT]|0;if((fG&1)==0){f_=aT+1|0}else{f_=c[aT+8>>2]|0}aQ=fG&255;if((aQ&1|0)==0){f$=aQ>>>1}else{f$=c[aT+4>>2]|0}eB(b,f_,f$)|0;ep(aT);ex(aU,4088,7);aT=a[aU]|0;if((aT&1)==0){f0=aU+1|0}else{f0=c[aU+8>>2]|0}f$=aT&255;if((f$&1|0)==0){f1=f$>>>1}else{f1=c[aU+4>>2]|0}eB(b,f0,f1)|0;ep(aU);do{if(aL){aU=ag(eZ,e)|0;if((T|0)>0){f2=0}else{break}do{f1=ag(f2,T)|0;f0=ag(aU,f2)|0;f$=0;do{de(b,f$+f1|0,(ag(f$,j)|0)+f0|0,k);f$=f$+1|0;}while((f$|0)<(T|0));f2=f2+1|0;}while((f2|0)<(eY|0))}}while(0);ex(aV,6832,2);f2=a[aV]|0;if((f2&1)==0){f3=aV+1|0}else{f3=c[aV+8>>2]|0}aU=f2&255;if((aU&1|0)==0){f4=aU>>>1}else{f4=c[aV+4>>2]|0}eB(b,f3,f4)|0;ep(aV);ex(aY,4968,15);aV=f-1|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=aV,B)|0)|0;ex(aZ,S,lB(S|0)|0);aV=aX;lC(aV|0,0,12);f4=a[aY]|0;f3=f4&255;if((f3&1|0)==0){f5=f3>>>1}else{f5=c[aY+4>>2]|0}f3=aZ;aU=d[f3]|0;if((aU&1|0)==0){f6=aU>>>1}else{f6=c[aZ+4>>2]|0}if((f4&1)==0){f7=aY+1|0}else{f7=c[aY+8>>2]|0}eI(aX,f7,f5,f6+f5|0);if((a[f3]&1)==0){f8=aZ+1|0}else{f8=c[aZ+8>>2]|0}eB(aX,f8,f6)|0;ex(a_,4944,2);f6=aW;lC(f6|0,0,12);f8=a[aV]|0;aV=f8&255;if((aV&1|0)==0){f9=aV>>>1}else{f9=c[aX+4>>2]|0}aV=a_;f3=d[aV]|0;if((f3&1|0)==0){ga=f3>>>1}else{ga=c[a_+4>>2]|0}if((f8&1)==0){gb=aX+1|0}else{gb=c[aX+8>>2]|0}eI(aW,gb,f9,ga+f9|0);if((a[aV]&1)==0){gc=a_+1|0}else{gc=c[a_+8>>2]|0}eB(aW,gc,ga)|0;ga=a[f6]|0;if((ga&1)==0){gd=aW+1|0}else{gd=c[aW+8>>2]|0}f6=ga&255;if((f6&1|0)==0){ge=f6>>>1}else{ge=c[aW+4>>2]|0}eB(b,gd,ge)|0;ep(aW);ep(a_);ep(aX);ep(aZ);ep(aY);ex(a1,4904,16);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=dm,B)|0)|0;ex(a2,S,lB(S|0)|0);aY=a0;lC(aY|0,0,12);aZ=a[a1]|0;aX=aZ&255;if((aX&1|0)==0){gf=aX>>>1}else{gf=c[a1+4>>2]|0}aX=a2;a_=d[aX]|0;if((a_&1|0)==0){gg=a_>>>1}else{gg=c[a2+4>>2]|0}if((aZ&1)==0){gh=a1+1|0}else{gh=c[a1+8>>2]|0}eI(a0,gh,gf,gg+gf|0);if((a[aX]&1)==0){gi=a2+1|0}else{gi=c[a2+8>>2]|0}eB(a0,gi,gg)|0;ex(a3,4944,2);gg=a$;lC(gg|0,0,12);gi=a[aY]|0;aY=gi&255;if((aY&1|0)==0){gj=aY>>>1}else{gj=c[a0+4>>2]|0}aY=a3;aX=d[aY]|0;if((aX&1|0)==0){gk=aX>>>1}else{gk=c[a3+4>>2]|0}if((gi&1)==0){gl=a0+1|0}else{gl=c[a0+8>>2]|0}eI(a$,gl,gj,gk+gj|0);if((a[aY]&1)==0){gm=a3+1|0}else{gm=c[a3+8>>2]|0}eB(a$,gm,gk)|0;gk=a[gg]|0;if((gk&1)==0){gn=a$+1|0}else{gn=c[a$+8>>2]|0}gg=gk&255;if((gg&1|0)==0){go=gg>>>1}else{go=c[a$+4>>2]|0}eB(b,gn,go)|0;ep(a$);ep(a3);ep(a0);ep(a2);ep(a1);ex(a6,5008,34);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=an,B)|0)|0;ex(a7,S,lB(S|0)|0);a1=a5;lC(a1|0,0,12);a2=a[a6]|0;a0=a2&255;if((a0&1|0)==0){gp=a0>>>1}else{gp=c[a6+4>>2]|0}a0=a7;a3=d[a0]|0;if((a3&1|0)==0){gq=a3>>>1}else{gq=c[a7+4>>2]|0}if((a2&1)==0){gr=a6+1|0}else{gr=c[a6+8>>2]|0}eI(a5,gr,gp,gq+gp|0);if((a[a0]&1)==0){gs=a7+1|0}else{gs=c[a7+8>>2]|0}eB(a5,gs,gq)|0;ex(a8,1904,7);gq=a4;lC(gq|0,0,12);gs=a[a1]|0;a1=gs&255;if((a1&1|0)==0){gt=a1>>>1}else{gt=c[a5+4>>2]|0}a1=a8;a0=d[a1]|0;if((a0&1|0)==0){gu=a0>>>1}else{gu=c[a8+4>>2]|0}if((gs&1)==0){gv=a5+1|0}else{gv=c[a5+8>>2]|0}eI(a4,gv,gt,gu+gt|0);if((a[a1]&1)==0){gw=a8+1|0}else{gw=c[a8+8>>2]|0}eB(a4,gw,gu)|0;gu=a[gq]|0;if((gu&1)==0){gx=a4+1|0}else{gx=c[a4+8>>2]|0}gq=gu&255;if((gq&1|0)==0){gy=gq>>>1}else{gy=c[a4+4>>2]|0}eB(b,gx,gy)|0;ep(a4);ep(a8);ep(a5);ep(a7);ep(a6);if(aL){a6=(T|0)>0;a7=ag(eZ,an)|0;a5=bc;a8=bd;a4=be;gy=bd+1|0;gx=be+1|0;gq=bb;gu=bf;gw=bc+1|0;a1=bf+1|0;gt=ba;gv=bh;gs=bb+1|0;a0=bh+1|0;gp=a9;gr=bi;a2=ba+1|0;a3=bi+1|0;a$=a9+1|0;go=a9+4|0;gn=a9+8|0;gg=bi+8|0;gk=ba+8|0;gm=bi+4|0;aY=ba+4|0;gj=bh+8|0;gl=bb+8|0;gi=bh+4|0;aX=bb+4|0;gf=bf+8|0;gh=bc+8|0;aZ=bf+4|0;a_=bc+4|0;aW=be+8|0;ge=bd+8|0;gd=be+4|0;f6=bd+4|0;ga=0;do{if(a6){gc=ag(a7,ga)|0;aV=ag(ga,T)|0;f9=0;do{ex(bd,2792,14);gb=(ag(f9,j)|0)+gc|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=gb,B)|0)|0;ex(be,S,lB(S|0)|0);lC(a5|0,0,12);gb=a[a8]|0;f8=gb&255;f3=(f8&1|0)==0?f8>>>1:c[f6>>2]|0;f8=d[a4]|0;f5=(f8&1|0)==0?f8>>>1:c[gd>>2]|0;eI(bc,(gb&1)==0?gy:c[ge>>2]|0,f3,f5+f3|0);eB(bc,(a[a4]&1)==0?gx:c[aW>>2]|0,f5)|0;ex(bf,4776,6);lC(gq|0,0,12);f5=a[a5]|0;f3=f5&255;gb=(f3&1|0)==0?f3>>>1:c[a_>>2]|0;f3=d[gu]|0;f8=(f3&1|0)==0?f3>>>1:c[aZ>>2]|0;eI(bb,(f5&1)==0?gw:c[gh>>2]|0,gb,f8+gb|0);eB(bb,(a[gu]&1)==0?a1:c[gf>>2]|0,f8)|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=f9+aV,B)|0)|0;ex(bh,S,lB(S|0)|0);lC(gt|0,0,12);f8=a[gq]|0;gb=f8&255;f5=(gb&1|0)==0?gb>>>1:c[aX>>2]|0;gb=d[gv]|0;f3=(gb&1|0)==0?gb>>>1:c[gi>>2]|0;eI(ba,(f8&1)==0?gs:c[gl>>2]|0,f5,f3+f5|0);eB(ba,(a[gv]&1)==0?a0:c[gj>>2]|0,f3)|0;ex(bi,4672,5);lC(gp|0,0,12);f3=a[gt]|0;f5=f3&255;f8=(f5&1|0)==0?f5>>>1:c[aY>>2]|0;f5=d[gr]|0;gb=(f5&1|0)==0?f5>>>1:c[gm>>2]|0;eI(a9,(f3&1)==0?a2:c[gk>>2]|0,f8,gb+f8|0);eB(a9,(a[gr]&1)==0?a3:c[gg>>2]|0,gb)|0;gb=a[gp]|0;f8=gb&255;eB(b,(gb&1)==0?a$:c[gn>>2]|0,(f8&1|0)==0?f8>>>1:c[go>>2]|0)|0;ep(a9);ep(bi);ep(ba);ep(bh);ep(bb);ep(bf);ep(bc);ep(be);ep(bd);f9=f9+1|0;}while((f9|0)<(T|0))}ga=ga+1|0;}while((ga|0)<(eY|0))}ex(bj,4608,36);ga=a[bj]|0;if((ga&1)==0){gz=bj+1|0}else{gz=c[bj+8>>2]|0}bd=ga&255;if((bd&1|0)==0){gA=bd>>>1}else{gA=c[bj+4>>2]|0}eB(b,gz,gA)|0;ep(bj);bj=(h|0)>0;if(bj){gA=bo;gz=bp;bd=bq;ga=bp+1|0;be=bq+1|0;bc=bn;bf=br;bb=bo+1|0;bh=br+1|0;ba=bm;bi=bs;a9=bn+1|0;go=bs+1|0;gn=bl;a$=bt;gp=bm+1|0;gg=bt+1|0;a3=bl+1|0;gr=bl+4|0;gk=bl+8|0;a2=bt+8|0;gm=bm+8|0;aY=bt+4|0;gt=bm+4|0;gj=bs+8|0;a0=bn+8|0;gv=bs+4|0;gl=bn+4|0;gs=br+8|0;gi=bo+8|0;aX=br+4|0;gq=bo+4|0;gf=bq+8|0;a1=bp+8|0;gu=bq+4|0;gh=bp+4|0;gw=0;do{ex(bp,4544,6);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=gw,B)|0)|0;ex(bq,S,lB(S|0)|0);lC(gA|0,0,12);aZ=a[gz]|0;a_=aZ&255;a5=(a_&1|0)==0?a_>>>1:c[gh>>2]|0;a_=d[bd]|0;aW=(a_&1|0)==0?a_>>>1:c[gu>>2]|0;eI(bo,(aZ&1)==0?ga:c[a1>>2]|0,a5,aW+a5|0);eB(bo,(a[bd]&1)==0?be:c[gf>>2]|0,aW)|0;ex(br,15200,15);lC(bc|0,0,12);aW=a[gA]|0;a5=aW&255;aZ=(a5&1|0)==0?a5>>>1:c[gq>>2]|0;a5=d[bf]|0;a_=(a5&1|0)==0?a5>>>1:c[aX>>2]|0;eI(bn,(aW&1)==0?bb:c[gi>>2]|0,aZ,a_+aZ|0);eB(bn,(a[bf]&1)==0?bh:c[gs>>2]|0,a_)|0;a_=ag(gw,f)|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=a_,B)|0)|0;ex(bs,S,lB(S|0)|0);lC(ba|0,0,12);a_=a[bc]|0;aZ=a_&255;aW=(aZ&1|0)==0?aZ>>>1:c[gl>>2]|0;aZ=d[bi]|0;a5=(aZ&1|0)==0?aZ>>>1:c[gv>>2]|0;eI(bm,(a_&1)==0?a9:c[a0>>2]|0,aW,a5+aW|0);eB(bm,(a[bi]&1)==0?go:c[gj>>2]|0,a5)|0;ex(bt,7072,3);lC(gn|0,0,12);a5=a[ba]|0;aW=a5&255;a_=(aW&1|0)==0?aW>>>1:c[gt>>2]|0;aW=d[a$]|0;aZ=(aW&1|0)==0?aW>>>1:c[aY>>2]|0;eI(bl,(a5&1)==0?gp:c[gm>>2]|0,a_,aZ+a_|0);eB(bl,(a[a$]&1)==0?gg:c[a2>>2]|0,aZ)|0;aZ=a[gn]|0;a_=aZ&255;eB(b,(aZ&1)==0?a3:c[gk>>2]|0,(a_&1|0)==0?a_>>>1:c[gr>>2]|0)|0;ep(bl);ep(bt);ep(bm);ep(bs);ep(bn);ep(br);ep(bo);ep(bq);ep(bp);gw=gw+1|0;}while((gw|0)<(h|0))}ex(bu,4608,36);gw=a[bu]|0;if((gw&1)==0){gB=bu+1|0}else{gB=c[bu+8>>2]|0}bp=gw&255;if((bp&1|0)==0){gC=bp>>>1}else{gC=c[bu+4>>2]|0}eB(b,gB,gC)|0;ep(bu);if(aL){aL=(T|0)>0;bu=ag(eZ,an)|0;eZ=by;gC=bz;gB=bA;bp=bz+1|0;gw=bA+1|0;bq=bx;bo=bB;br=by+1|0;bn=bB+1|0;bs=bw;bm=bC;bt=bx+1|0;bl=bC+1|0;gr=bv;gk=bD;a3=bw+1|0;gn=bD+1|0;a2=bv+1|0;gg=bv+4|0;a$=bv+8|0;gm=bD+8|0;gp=bw+8|0;aY=bD+4|0;gt=bw+4|0;ba=bC+8|0;gj=bx+8|0;go=bC+4|0;bi=bx+4|0;a0=bB+8|0;a9=by+8|0;gv=bB+4|0;gl=by+4|0;bc=bA+8|0;gs=bz+8|0;bh=bA+4|0;bf=bz+4|0;gi=0;do{if(aL){bb=ag(bu,gi)|0;aX=ag(gi,T)|0;gq=0;do{ex(bz,2792,14);gA=(ag(gq,j)|0)+bb|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=gA,B)|0)|0;ex(bA,S,lB(S|0)|0);lC(eZ|0,0,12);gA=a[gC]|0;gf=gA&255;be=(gf&1|0)==0?gf>>>1:c[bf>>2]|0;gf=d[gB]|0;bd=(gf&1|0)==0?gf>>>1:c[bh>>2]|0;eI(by,(gA&1)==0?bp:c[gs>>2]|0,be,bd+be|0);eB(by,(a[gB]&1)==0?gw:c[bc>>2]|0,bd)|0;ex(bB,4776,6);lC(bq|0,0,12);bd=a[eZ]|0;be=bd&255;gA=(be&1|0)==0?be>>>1:c[gl>>2]|0;be=d[bo]|0;gf=(be&1|0)==0?be>>>1:c[gv>>2]|0;eI(bx,(bd&1)==0?br:c[a9>>2]|0,gA,gf+gA|0);eB(bx,(a[bo]&1)==0?bn:c[a0>>2]|0,gf)|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=gq+aX,B)|0)|0;ex(bC,S,lB(S|0)|0);lC(bs|0,0,12);gf=a[bq]|0;gA=gf&255;bd=(gA&1|0)==0?gA>>>1:c[bi>>2]|0;gA=d[bm]|0;be=(gA&1|0)==0?gA>>>1:c[go>>2]|0;eI(bw,(gf&1)==0?bt:c[gj>>2]|0,bd,be+bd|0);eB(bw,(a[bm]&1)==0?bl:c[ba>>2]|0,be)|0;ex(bD,4440,5);lC(gr|0,0,12);be=a[bs]|0;bd=be&255;gf=(bd&1|0)==0?bd>>>1:c[gt>>2]|0;bd=d[gk]|0;gA=(bd&1|0)==0?bd>>>1:c[aY>>2]|0;eI(bv,(be&1)==0?a3:c[gp>>2]|0,gf,gA+gf|0);eB(bv,(a[gk]&1)==0?gn:c[gm>>2]|0,gA)|0;gA=a[gr]|0;gf=gA&255;eB(b,(gA&1)==0?a2:c[a$>>2]|0,(gf&1|0)==0?gf>>>1:c[gg>>2]|0)|0;ep(bv);ep(bD);ep(bw);ep(bC);ep(bx);ep(bB);ep(by);ep(bA);ep(bz);gq=gq+1|0;}while((gq|0)<(T|0))}gi=gi+1|0;}while((gi|0)<(eY|0))}ex(bE,4608,36);eY=a[bE]|0;if((eY&1)==0){gD=bE+1|0}else{gD=c[bE+8>>2]|0}gi=eY&255;if((gi&1|0)==0){gE=gi>>>1}else{gE=c[bE+4>>2]|0}eB(b,gD,gE)|0;ep(bE);if(bj){bj=bI;bE=bJ;gE=bK;gD=bJ+1|0;gi=bK+1|0;eY=bH;T=bL;bz=bI+1|0;bA=bL+1|0;by=bG;bB=bM;bx=bH+1|0;bC=bM+1|0;bw=bF;bD=bN;bv=bG+1|0;gg=bN+1|0;a$=bF+1|0;a2=bF+4|0;gr=bF+8|0;gm=bN+8|0;gn=bG+8|0;gk=bN+4|0;gp=bG+4|0;a3=bM+8|0;aY=bH+8|0;gt=bM+4|0;bs=bH+4|0;ba=bL+8|0;bl=bI+8|0;bm=bL+4|0;gj=bI+4|0;bt=bK+8|0;go=bJ+8|0;bi=bK+4|0;bq=bJ+4|0;a0=0;do{ex(bJ,4544,6);bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=a0,B)|0)|0;ex(bK,S,lB(S|0)|0);lC(bj|0,0,12);bn=a[bE]|0;bo=bn&255;a9=(bo&1|0)==0?bo>>>1:c[bq>>2]|0;bo=d[gE]|0;br=(bo&1|0)==0?bo>>>1:c[bi>>2]|0;eI(bI,(bn&1)==0?gD:c[go>>2]|0,a9,br+a9|0);eB(bI,(a[gE]&1)==0?gi:c[bt>>2]|0,br)|0;ex(bL,15136,15);lC(eY|0,0,12);br=a[bj]|0;a9=br&255;bn=(a9&1|0)==0?a9>>>1:c[gj>>2]|0;a9=d[T]|0;bo=(a9&1|0)==0?a9>>>1:c[bm>>2]|0;eI(bH,(br&1)==0?bz:c[bl>>2]|0,bn,bo+bn|0);eB(bH,(a[T]&1)==0?bA:c[ba>>2]|0,bo)|0;bo=ag(a0,f)|0;bg(S|0,14080,(B=i,i=i+8|0,c[B>>2]=bo,B)|0)|0;ex(bM,S,lB(S|0)|0);lC(by|0,0,12);bo=a[eY]|0;bn=bo&255;br=(bn&1|0)==0?bn>>>1:c[bs>>2]|0;bn=d[bB]|0;a9=(bn&1|0)==0?bn>>>1:c[gt>>2]|0;eI(bG,(bo&1)==0?bx:c[aY>>2]|0,br,a9+br|0);eB(bG,(a[bB]&1)==0?bC:c[a3>>2]|0,a9)|0;ex(bN,7072,3);lC(bw|0,0,12);a9=a[by]|0;br=a9&255;bo=(br&1|0)==0?br>>>1:c[gp>>2]|0;br=d[bD]|0;bn=(br&1|0)==0?br>>>1:c[gk>>2]|0;eI(bF,(a9&1)==0?bv:c[gn>>2]|0,bo,bn+bo|0);eB(bF,(a[bD]&1)==0?gg:c[gm>>2]|0,bn)|0;bn=a[bw]|0;bo=bn&255;eB(b,(bn&1)==0?a$:c[gr>>2]|0,(bo&1|0)==0?bo>>>1:c[a2>>2]|0)|0;ep(bF);ep(bN);ep(bG);ep(bM);ep(bH);ep(bL);ep(bI);ep(bK);ep(bJ);a0=a0+1|0;}while((a0|0)<(h|0))}ex(bO,4608,36);a0=a[bO]|0;if((a0&1)==0){gF=bO+1|0}else{gF=c[bO+8>>2]|0}bJ=a0&255;if((bJ&1|0)==0){gG=bJ>>>1}else{gG=c[bO+4>>2]|0}eB(b,gF,gG)|0;ep(bO);d3=ag(an,g)|0;i=l;return d3|0}ex(bR,15096,30);an=ag(g,e)|0;bO=m|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=an,B)|0)|0;ex(bS,bO,lB(bO|0)|0);an=bQ;lC(an|0,0,12);m=a[bR]|0;gG=m&255;if((gG&1|0)==0){gH=gG>>>1}else{gH=c[bR+4>>2]|0}gG=bS;gF=d[gG]|0;if((gF&1|0)==0){gI=gF>>>1}else{gI=c[bS+4>>2]|0}if((m&1)==0){gJ=bR+1|0}else{gJ=c[bR+8>>2]|0}eI(bQ,gJ,gH,gI+gH|0);if((a[gG]&1)==0){gK=bS+1|0}else{gK=c[bS+8>>2]|0}eB(bQ,gK,gI)|0;ex(bT,15072,9);gI=bP;lC(gI|0,0,12);gK=a[an]|0;an=gK&255;if((an&1|0)==0){gL=an>>>1}else{gL=c[bQ+4>>2]|0}an=bT;gG=d[an]|0;if((gG&1|0)==0){gM=gG>>>1}else{gM=c[bT+4>>2]|0}if((gK&1)==0){gN=bQ+1|0}else{gN=c[bQ+8>>2]|0}eI(bP,gN,gL,gM+gL|0);if((a[an]&1)==0){gO=bT+1|0}else{gO=c[bT+8>>2]|0}eB(bP,gO,gM)|0;gM=a[gI]|0;if((gM&1)==0){gP=bP+1|0}else{gP=c[bP+8>>2]|0}gI=gM&255;if((gI&1|0)==0){gQ=gI>>>1}else{gQ=c[bP+4>>2]|0}eB(b,gP,gQ)|0;ep(bP);ep(bT);ep(bQ);ep(bS);ep(bR);if((k|0)==1){ex(bU,1040,22);bR=a[bU]|0;if((bR&1)==0){gR=bU+1|0}else{gR=c[bU+8>>2]|0}bS=bR&255;if((bS&1|0)==0){gS=bS>>>1}else{gS=c[bU+4>>2]|0}eB(b,gR,gS)|0;ep(bU);ex(bV,1008,23);bU=a[bV]|0;if((bU&1)==0){gT=bV+1|0}else{gT=c[bV+8>>2]|0}gS=bU&255;if((gS&1|0)==0){gU=gS>>>1}else{gU=c[bV+4>>2]|0}eB(b,gT,gU)|0;ep(bV)}else{ex(bW,968,27);bV=a[bW]|0;if((bV&1)==0){gV=bW+1|0}else{gV=c[bW+8>>2]|0}gU=bV&255;if((gU&1|0)==0){gW=gU>>>1}else{gW=c[bW+4>>2]|0}eB(b,gV,gW)|0;ep(bW);ex(bX,872,27);bW=a[bX]|0;if((bW&1)==0){gX=bX+1|0}else{gX=c[bX+8>>2]|0}gW=bW&255;if((gW&1|0)==0){gY=gW>>>1}else{gY=c[bX+4>>2]|0}eB(b,gX,gY)|0;ep(bX);ex(bY,824,28);bX=a[bY]|0;if((bX&1)==0){gZ=bY+1|0}else{gZ=c[bY+8>>2]|0}gY=bX&255;if((gY&1|0)==0){g_=gY>>>1}else{g_=c[bY+4>>2]|0}eB(b,gZ,g_)|0;ep(bY);ex(bZ,744,28);bY=a[bZ]|0;if((bY&1)==0){g$=bZ+1|0}else{g$=c[bZ+8>>2]|0}g_=bY&255;if((g_&1|0)==0){g0=g_>>>1}else{g0=c[bZ+4>>2]|0}eB(b,g$,g0)|0;ep(bZ)}ex(b0,4968,15);bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=e-1,B)|0)|0;ex(b1,bO,lB(bO|0)|0);bZ=b$;lC(bZ|0,0,12);g0=a[b0]|0;g$=g0&255;if((g$&1|0)==0){g1=g$>>>1}else{g1=c[b0+4>>2]|0}g$=b1;g_=d[g$]|0;if((g_&1|0)==0){g2=g_>>>1}else{g2=c[b1+4>>2]|0}if((g0&1)==0){g3=b0+1|0}else{g3=c[b0+8>>2]|0}eI(b$,g3,g1,g2+g1|0);if((a[g$]&1)==0){g4=b1+1|0}else{g4=c[b1+8>>2]|0}eB(b$,g4,g2)|0;ex(b2,4944,2);g2=b_;lC(g2|0,0,12);g4=a[bZ]|0;bZ=g4&255;if((bZ&1|0)==0){g5=bZ>>>1}else{g5=c[b$+4>>2]|0}bZ=b2;g$=d[bZ]|0;if((g$&1|0)==0){g6=g$>>>1}else{g6=c[b2+4>>2]|0}if((g4&1)==0){g7=b$+1|0}else{g7=c[b$+8>>2]|0}eI(b_,g7,g5,g6+g5|0);if((a[bZ]&1)==0){g8=b2+1|0}else{g8=c[b2+8>>2]|0}eB(b_,g8,g6)|0;g6=a[g2]|0;if((g6&1)==0){g9=b_+1|0}else{g9=c[b_+8>>2]|0}g2=g6&255;if((g2&1|0)==0){ha=g2>>>1}else{ha=c[b_+4>>2]|0}eB(b,g9,ha)|0;ep(b_);ep(b2);ep(b$);ep(b1);ep(b0);ex(b5,4904,16);b0=~~+bk(+(+(e|0)));bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=b0,B)|0)|0;ex(b6,bO,lB(bO|0)|0);b0=b4;lC(b0|0,0,12);b1=a[b5]|0;b$=b1&255;if((b$&1|0)==0){hb=b$>>>1}else{hb=c[b5+4>>2]|0}b$=b6;b2=d[b$]|0;if((b2&1|0)==0){hc=b2>>>1}else{hc=c[b6+4>>2]|0}if((b1&1)==0){hd=b5+1|0}else{hd=c[b5+8>>2]|0}eI(b4,hd,hb,hc+hb|0);if((a[b$]&1)==0){he=b6+1|0}else{he=c[b6+8>>2]|0}eB(b4,he,hc)|0;ex(b7,4944,2);hc=b3;lC(hc|0,0,12);he=a[b0]|0;b0=he&255;if((b0&1|0)==0){hf=b0>>>1}else{hf=c[b4+4>>2]|0}b0=b7;b$=d[b0]|0;if((b$&1|0)==0){hg=b$>>>1}else{hg=c[b7+4>>2]|0}if((he&1)==0){hh=b4+1|0}else{hh=c[b4+8>>2]|0}eI(b3,hh,hf,hg+hf|0);if((a[b0]&1)==0){hi=b7+1|0}else{hi=c[b7+8>>2]|0}eB(b3,hi,hg)|0;hg=a[hc]|0;if((hg&1)==0){hj=b3+1|0}else{hj=c[b3+8>>2]|0}hc=hg&255;if((hc&1|0)==0){hk=hc>>>1}else{hk=c[b3+4>>2]|0}eB(b,hj,hk)|0;ep(b3);ep(b7);ep(b4);ep(b6);ep(b5);ex(ca,592,34);b5=f+e|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=b5,B)|0)|0;ex(cb,bO,lB(bO|0)|0);b6=b9;lC(b6|0,0,12);b4=a[ca]|0;b7=b4&255;if((b7&1|0)==0){hl=b7>>>1}else{hl=c[ca+4>>2]|0}b7=cb;b3=d[b7]|0;if((b3&1|0)==0){hm=b3>>>1}else{hm=c[cb+4>>2]|0}if((b4&1)==0){hn=ca+1|0}else{hn=c[ca+8>>2]|0}eI(b9,hn,hl,hm+hl|0);if((a[b7]&1)==0){ho=cb+1|0}else{ho=c[cb+8>>2]|0}eB(b9,ho,hm)|0;ex(cc,4992,8);hm=b8;lC(hm|0,0,12);ho=a[b6]|0;b6=ho&255;if((b6&1|0)==0){hp=b6>>>1}else{hp=c[b9+4>>2]|0}b6=cc;b7=d[b6]|0;if((b7&1|0)==0){hq=b7>>>1}else{hq=c[cc+4>>2]|0}if((ho&1)==0){hr=b9+1|0}else{hr=c[b9+8>>2]|0}eI(b8,hr,hp,hq+hp|0);if((a[b6]&1)==0){hs=cc+1|0}else{hs=c[cc+8>>2]|0}eB(b8,hs,hq)|0;hq=a[hm]|0;if((hq&1)==0){ht=b8+1|0}else{ht=c[b8+8>>2]|0}hm=hq&255;if((hm&1|0)==0){hu=hm>>>1}else{hu=c[b8+4>>2]|0}eB(b,ht,hu)|0;ep(b8);ep(cc);ep(b9);ep(cb);ep(ca);ex(cd,4224,44);ca=a[cd]|0;if((ca&1)==0){hv=cd+1|0}else{hv=c[cd+8>>2]|0}cb=ca&255;if((cb&1|0)==0){hw=cb>>>1}else{hw=c[cd+4>>2]|0}eB(b,hv,hw)|0;ep(cd);cd=(h|0)>0;if(cd){hw=ce;hv=ce+1|0;cb=h-1|0;ca=cg;b9=ch;cc=ci;b8=ch+1|0;hu=ci+1|0;ht=cf;hm=cj;hq=cg+1|0;hs=cj+1|0;b6=cf+1|0;hp=cf+4|0;hr=cf+8|0;ho=cj+8|0;b7=cg+8|0;hl=cj+4|0;hn=cg+4|0;b4=ci+8|0;b3=ch+8|0;hk=ci+4|0;hj=ch+4|0;hc=ce+4|0;hg=ce+8|0;hi=0;do{ex(ce,15040,16);b0=a[hw]|0;hf=b0&255;eB(b,(b0&1)==0?hv:c[hg>>2]|0,(hf&1|0)==0?hf>>>1:c[hc>>2]|0)|0;ep(ce);de(b,hi,ag(hi,dn)|0,k);if((hi|0)!=(cb|0)){ex(ch,4104,10);hf=(dn|0)/(e|0)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=hf,B)|0)|0;ex(ci,bO,lB(bO|0)|0);lC(ca|0,0,12);hf=a[b9]|0;b0=hf&255;hh=(b0&1|0)==0?b0>>>1:c[hj>>2]|0;b0=d[cc]|0;he=(b0&1|0)==0?b0>>>1:c[hk>>2]|0;eI(cg,(hf&1)==0?b8:c[b3>>2]|0,hh,he+hh|0);hh=(a[cc]&1)==0?hu:c[b4>>2]|0;eB(cg,hh,he)|0;ex(cj,4944,2);lC(ht|0,0,12);he=a[ca]|0;hh=he&255;hf=(hh&1|0)==0?hh>>>1:c[hn>>2]|0;hh=d[hm]|0;b0=(hh&1|0)==0?hh>>>1:c[hl>>2]|0;eI(cf,(he&1)==0?hq:c[b7>>2]|0,hf,b0+hf|0);hf=(a[hm]&1)==0?hs:c[ho>>2]|0;eB(cf,hf,b0)|0;b0=a[ht]|0;hf=(b0&1)==0?b6:c[hr>>2]|0;he=b0&255;b0=(he&1|0)==0?he>>>1:c[hp>>2]|0;eB(b,hf,b0)|0;ep(cf);ep(cj);ep(cg);ep(ci);ep(ch)}hi=hi+1|0;}while((hi|0)<(h|0))}ex(ck,6832,2);hi=a[ck]|0;if((hi&1)==0){hx=ck+1|0}else{hx=c[ck+8>>2]|0}ch=hi&255;if((ch&1|0)==0){hy=ch>>>1}else{hy=c[ck+4>>2]|0}eB(b,hx,hy)|0;ep(ck);ex(cl,4088,7);ck=a[cl]|0;if((ck&1)==0){hz=cl+1|0}else{hz=c[cl+8>>2]|0}hy=ck&255;if((hy&1|0)==0){hA=hy>>>1}else{hA=c[cl+4>>2]|0}eB(b,hz,hA)|0;ep(cl);if(cd){cl=0;do{de(b,cl,ag(cl,dn)|0,k);cl=cl+1|0;}while((cl|0)<(h|0))}ex(cm,6832,2);cl=a[cm]|0;if((cl&1)==0){hB=cm+1|0}else{hB=c[cm+8>>2]|0}k=cl&255;if((k&1|0)==0){hC=k>>>1}else{hC=c[cm+4>>2]|0}eB(b,hB,hC)|0;ep(cm);if((f|0)>1){ex(cp,4968,15);cm=f-1|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=cm,B)|0)|0;ex(cq,bO,lB(bO|0)|0);cm=co;lC(cm|0,0,12);hC=a[cp]|0;hB=hC&255;if((hB&1|0)==0){hD=hB>>>1}else{hD=c[cp+4>>2]|0}hB=cq;k=d[hB]|0;if((k&1|0)==0){hE=k>>>1}else{hE=c[cq+4>>2]|0}if((hC&1)==0){hF=cp+1|0}else{hF=c[cp+8>>2]|0}eI(co,hF,hD,hE+hD|0);if((a[hB]&1)==0){hG=cq+1|0}else{hG=c[cq+8>>2]|0}eB(co,hG,hE)|0;ex(cr,4944,2);hE=cn;lC(hE|0,0,12);hG=a[cm]|0;cm=hG&255;if((cm&1|0)==0){hH=cm>>>1}else{hH=c[co+4>>2]|0}cm=cr;hB=d[cm]|0;if((hB&1|0)==0){hI=hB>>>1}else{hI=c[cr+4>>2]|0}if((hG&1)==0){hJ=co+1|0}else{hJ=c[co+8>>2]|0}eI(cn,hJ,hH,hI+hH|0);if((a[cm]&1)==0){hK=cr+1|0}else{hK=c[cr+8>>2]|0}eB(cn,hK,hI)|0;hI=a[hE]|0;if((hI&1)==0){hL=cn+1|0}else{hL=c[cn+8>>2]|0}hE=hI&255;if((hE&1|0)==0){hM=hE>>>1}else{hM=c[cn+4>>2]|0}eB(b,hL,hM)|0;ep(cn);ep(cr);ep(co);ep(cq);ep(cp);ex(cu,4904,16);bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=dm,B)|0)|0;ex(cv,bO,lB(bO|0)|0);dm=ct;lC(dm|0,0,12);cp=a[cu]|0;cq=cp&255;if((cq&1|0)==0){hN=cq>>>1}else{hN=c[cu+4>>2]|0}cq=cv;co=d[cq]|0;if((co&1|0)==0){hO=co>>>1}else{hO=c[cv+4>>2]|0}if((cp&1)==0){hP=cu+1|0}else{hP=c[cu+8>>2]|0}eI(ct,hP,hN,hO+hN|0);if((a[cq]&1)==0){hQ=cv+1|0}else{hQ=c[cv+8>>2]|0}eB(ct,hQ,hO)|0;ex(cw,4944,2);hO=cs;lC(hO|0,0,12);hQ=a[dm]|0;dm=hQ&255;if((dm&1|0)==0){hR=dm>>>1}else{hR=c[ct+4>>2]|0}dm=cw;cq=d[dm]|0;if((cq&1|0)==0){hS=cq>>>1}else{hS=c[cw+4>>2]|0}if((hQ&1)==0){hT=ct+1|0}else{hT=c[ct+8>>2]|0}eI(cs,hT,hR,hS+hR|0);if((a[dm]&1)==0){hU=cw+1|0}else{hU=c[cw+8>>2]|0}eB(cs,hU,hS)|0;hS=a[hO]|0;if((hS&1)==0){hV=cs+1|0}else{hV=c[cs+8>>2]|0}hO=hS&255;if((hO&1|0)==0){hW=hO>>>1}else{hW=c[cs+4>>2]|0}eB(b,hV,hW)|0;ep(cs);ep(cw);ep(ct);ep(cv);ep(cu);ex(cz,15e3,33);bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=b5,B)|0)|0;ex(cA,bO,lB(bO|0)|0);cu=cy;lC(cu|0,0,12);cv=a[cz]|0;ct=cv&255;if((ct&1|0)==0){hX=ct>>>1}else{hX=c[cz+4>>2]|0}ct=cA;cw=d[ct]|0;if((cw&1|0)==0){hY=cw>>>1}else{hY=c[cA+4>>2]|0}if((cv&1)==0){hZ=cz+1|0}else{hZ=c[cz+8>>2]|0}eI(cy,hZ,hX,hY+hX|0);if((a[ct]&1)==0){h_=cA+1|0}else{h_=c[cA+8>>2]|0}eB(cy,h_,hY)|0;ex(cB,4992,8);hY=cx;lC(hY|0,0,12);h_=a[cu]|0;cu=h_&255;if((cu&1|0)==0){h$=cu>>>1}else{h$=c[cy+4>>2]|0}cu=cB;ct=d[cu]|0;if((ct&1|0)==0){h0=ct>>>1}else{h0=c[cB+4>>2]|0}if((h_&1)==0){h1=cy+1|0}else{h1=c[cy+8>>2]|0}eI(cx,h1,h$,h0+h$|0);if((a[cu]&1)==0){h2=cB+1|0}else{h2=c[cB+8>>2]|0}eB(cx,h2,h0)|0;h0=a[hY]|0;if((h0&1)==0){h3=cx+1|0}else{h3=c[cx+8>>2]|0}hY=h0&255;if((hY&1|0)==0){h4=hY>>>1}else{h4=c[cx+4>>2]|0}eB(b,h3,h4)|0;ep(cx);ep(cB);ep(cy);ep(cA);ep(cz)}else{ex(cC,14952,12);cz=a[cC]|0;if((cz&1)==0){h5=cC+1|0}else{h5=c[cC+8>>2]|0}cA=cz&255;if((cA&1|0)==0){h6=cA>>>1}else{h6=c[cC+4>>2]|0}eB(b,h5,h6)|0;ep(cC);ex(cD,14904,14);cC=a[cD]|0;if((cC&1)==0){h7=cD+1|0}else{h7=c[cD+8>>2]|0}h6=cC&255;if((h6&1|0)==0){h8=h6>>>1}else{h8=c[cD+4>>2]|0}eB(b,h7,h8)|0;ep(cD);ex(cG,14832,33);bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=b5,B)|0)|0;ex(cH,bO,lB(bO|0)|0);cD=cF;lC(cD|0,0,12);h8=a[cG]|0;h7=h8&255;if((h7&1|0)==0){h9=h7>>>1}else{h9=c[cG+4>>2]|0}h7=cH;h6=d[h7]|0;if((h6&1|0)==0){ia=h6>>>1}else{ia=c[cH+4>>2]|0}if((h8&1)==0){ib=cG+1|0}else{ib=c[cG+8>>2]|0}eI(cF,ib,h9,ia+h9|0);if((a[h7]&1)==0){ic=cH+1|0}else{ic=c[cH+8>>2]|0}eB(cF,ic,ia)|0;ex(cI,2520,3);ia=cE;lC(ia|0,0,12);ic=a[cD]|0;cD=ic&255;if((cD&1|0)==0){id=cD>>>1}else{id=c[cF+4>>2]|0}cD=cI;h7=d[cD]|0;if((h7&1|0)==0){ie=h7>>>1}else{ie=c[cI+4>>2]|0}if((ic&1)==0){ig=cF+1|0}else{ig=c[cF+8>>2]|0}eI(cE,ig,id,ie+id|0);if((a[cD]&1)==0){ih=cI+1|0}else{ih=c[cI+8>>2]|0}eB(cE,ih,ie)|0;ie=a[ia]|0;if((ie&1)==0){ii=cE+1|0}else{ii=c[cE+8>>2]|0}ia=ie&255;if((ia&1|0)==0){ij=ia>>>1}else{ij=c[cE+4>>2]|0}eB(b,ii,ij)|0;ep(cE);ep(cI);ep(cF);ep(cH);ep(cG)}if(cd){cG=cM;cH=cN;cF=cO;cI=cN+1|0;cE=cO+1|0;ij=cL;ii=cP;ia=cM+1|0;ie=cP+1|0;ih=cK;cD=cQ;id=cL+1|0;ig=cQ+1|0;ic=cJ;h7=cR;h9=cK+1|0;ib=cR+1|0;h8=cJ+1|0;h6=cJ+4|0;cC=cJ+8|0;h5=cR+8|0;cA=cK+8|0;cz=cR+4|0;cy=cK+4|0;cB=cQ+8|0;cx=cL+8|0;h4=cQ+4|0;h3=cL+4|0;hY=cP+8|0;h0=cM+8|0;h2=cP+4|0;cu=cM+4|0;h$=cO+8|0;h1=cN+8|0;h_=cO+4|0;ct=cN+4|0;hX=0;do{ex(cN,2792,14);hZ=ag(ag(hX,b5)|0,(dn|0)/(e|0)|0)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=hZ,B)|0)|0;ex(cO,bO,lB(bO|0)|0);lC(cG|0,0,12);hZ=a[cH]|0;cv=hZ&255;cw=(cv&1|0)==0?cv>>>1:c[ct>>2]|0;cv=d[cF]|0;cs=(cv&1|0)==0?cv>>>1:c[h_>>2]|0;eI(cM,(hZ&1)==0?cI:c[h1>>2]|0,cw,cs+cw|0);eB(cM,(a[cF]&1)==0?cE:c[h$>>2]|0,cs)|0;ex(cP,4776,6);lC(ij|0,0,12);cs=a[cG]|0;cw=cs&255;hZ=(cw&1|0)==0?cw>>>1:c[cu>>2]|0;cw=d[ii]|0;cv=(cw&1|0)==0?cw>>>1:c[h2>>2]|0;eI(cL,(cs&1)==0?ia:c[h0>>2]|0,hZ,cv+hZ|0);eB(cL,(a[ii]&1)==0?ie:c[hY>>2]|0,cv)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=hX,B)|0)|0;ex(cQ,bO,lB(bO|0)|0);lC(ih|0,0,12);cv=a[ij]|0;hZ=cv&255;cs=(hZ&1|0)==0?hZ>>>1:c[h3>>2]|0;hZ=d[cD]|0;cw=(hZ&1|0)==0?hZ>>>1:c[h4>>2]|0;eI(cK,(cv&1)==0?id:c[cx>>2]|0,cs,cw+cs|0);eB(cK,(a[cD]&1)==0?ig:c[cB>>2]|0,cw)|0;ex(cR,4672,5);lC(ic|0,0,12);cw=a[ih]|0;cs=cw&255;cv=(cs&1|0)==0?cs>>>1:c[cy>>2]|0;cs=d[h7]|0;hZ=(cs&1|0)==0?cs>>>1:c[cz>>2]|0;eI(cJ,(cw&1)==0?h9:c[cA>>2]|0,cv,hZ+cv|0);eB(cJ,(a[h7]&1)==0?ib:c[h5>>2]|0,hZ)|0;hZ=a[ic]|0;cv=hZ&255;eB(b,(hZ&1)==0?h8:c[cC>>2]|0,(cv&1|0)==0?cv>>>1:c[h6>>2]|0)|0;ep(cJ);ep(cR);ep(cK);ep(cQ);ep(cL);ep(cP);ep(cM);ep(cO);ep(cN);hX=hX+1|0;}while((hX|0)<(h|0))}ex(cS,4608,36);hX=a[cS]|0;if((hX&1)==0){ik=cS+1|0}else{ik=c[cS+8>>2]|0}cN=hX&255;if((cN&1|0)==0){il=cN>>>1}else{il=c[cS+4>>2]|0}eB(b,ik,il)|0;ep(cS);if(cd){cS=cW;il=cX;ik=cY;cN=cX+1|0;hX=cY+1|0;cO=cV;cM=cZ;cP=cW+1|0;cL=cZ+1|0;cQ=cU;cK=c_;cR=cV+1|0;cJ=c_+1|0;h6=cT;cC=c$;h8=cU+1|0;ic=c$+1|0;h5=cT+1|0;ib=cT+4|0;h7=cT+8|0;cA=c$+8|0;h9=cU+8|0;cz=c$+4|0;cy=cU+4|0;ih=c_+8|0;cB=cV+8|0;ig=c_+4|0;cD=cV+4|0;cx=cZ+8|0;id=cW+8|0;h4=cZ+4|0;h3=cW+4|0;ij=cY+8|0;hY=cX+8|0;ie=cY+4|0;ii=cX+4|0;h0=0;do{ex(cX,4544,6);bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=h0,B)|0)|0;ex(cY,bO,lB(bO|0)|0);lC(cS|0,0,12);ia=a[il]|0;h2=ia&255;cu=(h2&1|0)==0?h2>>>1:c[ii>>2]|0;h2=d[ik]|0;cG=(h2&1|0)==0?h2>>>1:c[ie>>2]|0;eI(cW,(ia&1)==0?cN:c[hY>>2]|0,cu,cG+cu|0);eB(cW,(a[ik]&1)==0?hX:c[ij>>2]|0,cG)|0;ex(cZ,15200,15);lC(cO|0,0,12);cG=a[cS]|0;cu=cG&255;ia=(cu&1|0)==0?cu>>>1:c[h3>>2]|0;cu=d[cM]|0;h2=(cu&1|0)==0?cu>>>1:c[h4>>2]|0;eI(cV,(cG&1)==0?cP:c[id>>2]|0,ia,h2+ia|0);eB(cV,(a[cM]&1)==0?cL:c[cx>>2]|0,h2)|0;h2=ag(h0,f)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=h2,B)|0)|0;ex(c_,bO,lB(bO|0)|0);lC(cQ|0,0,12);h2=a[cO]|0;ia=h2&255;cG=(ia&1|0)==0?ia>>>1:c[cD>>2]|0;ia=d[cK]|0;cu=(ia&1|0)==0?ia>>>1:c[ig>>2]|0;eI(cU,(h2&1)==0?cR:c[cB>>2]|0,cG,cu+cG|0);eB(cU,(a[cK]&1)==0?cJ:c[ih>>2]|0,cu)|0;ex(c$,7072,3);lC(h6|0,0,12);cu=a[cQ]|0;cG=cu&255;h2=(cG&1|0)==0?cG>>>1:c[cy>>2]|0;cG=d[cC]|0;ia=(cG&1|0)==0?cG>>>1:c[cz>>2]|0;eI(cT,(cu&1)==0?h8:c[h9>>2]|0,h2,ia+h2|0);eB(cT,(a[cC]&1)==0?ic:c[cA>>2]|0,ia)|0;ia=a[h6]|0;h2=ia&255;eB(b,(ia&1)==0?h5:c[h7>>2]|0,(h2&1|0)==0?h2>>>1:c[ib>>2]|0)|0;ep(cT);ep(c$);ep(cU);ep(c_);ep(cV);ep(cZ);ep(cW);ep(cY);ep(cX);h0=h0+1|0;}while((h0|0)<(h|0))}ex(c0,4608,36);h0=a[c0]|0;if((h0&1)==0){im=c0+1|0}else{im=c[c0+8>>2]|0}cX=h0&255;if((cX&1|0)==0){io=cX>>>1}else{io=c[c0+4>>2]|0}eB(b,im,io)|0;ep(c0);if(cd){c0=c4;io=c5;im=c6;cX=c5+1|0;h0=c6+1|0;cY=c3;cW=c7;cZ=c4+1|0;cV=c7+1|0;c_=c2;cU=c8;c$=c3+1|0;cT=c8+1|0;ib=c1;h7=c9;h5=c2+1|0;h6=c9+1|0;cA=c1+1|0;ic=c1+4|0;cC=c1+8|0;h9=c9+8|0;h8=c2+8|0;cz=c9+4|0;cy=c2+4|0;cQ=c8+8|0;ih=c3+8|0;cJ=c8+4|0;cK=c3+4|0;cB=c7+8|0;cR=c4+8|0;ig=c7+4|0;cD=c4+4|0;cO=c6+8|0;cx=c5+8|0;cL=c6+4|0;cM=c5+4|0;id=0;do{ex(c5,2792,14);cP=ag(ag(id,b5)|0,(dn|0)/(e|0)|0)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=cP,B)|0)|0;ex(c6,bO,lB(bO|0)|0);lC(c0|0,0,12);cP=a[io]|0;h4=cP&255;h3=(h4&1|0)==0?h4>>>1:c[cM>>2]|0;h4=d[im]|0;cS=(h4&1|0)==0?h4>>>1:c[cL>>2]|0;eI(c4,(cP&1)==0?cX:c[cx>>2]|0,h3,cS+h3|0);eB(c4,(a[im]&1)==0?h0:c[cO>>2]|0,cS)|0;ex(c7,4776,6);lC(cY|0,0,12);cS=a[c0]|0;h3=cS&255;cP=(h3&1|0)==0?h3>>>1:c[cD>>2]|0;h3=d[cW]|0;h4=(h3&1|0)==0?h3>>>1:c[ig>>2]|0;eI(c3,(cS&1)==0?cZ:c[cR>>2]|0,cP,h4+cP|0);eB(c3,(a[cW]&1)==0?cV:c[cB>>2]|0,h4)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=id,B)|0)|0;ex(c8,bO,lB(bO|0)|0);lC(c_|0,0,12);h4=a[cY]|0;cP=h4&255;cS=(cP&1|0)==0?cP>>>1:c[cK>>2]|0;cP=d[cU]|0;h3=(cP&1|0)==0?cP>>>1:c[cJ>>2]|0;eI(c2,(h4&1)==0?c$:c[ih>>2]|0,cS,h3+cS|0);eB(c2,(a[cU]&1)==0?cT:c[cQ>>2]|0,h3)|0;ex(c9,4440,5);lC(ib|0,0,12);h3=a[c_]|0;cS=h3&255;h4=(cS&1|0)==0?cS>>>1:c[cy>>2]|0;cS=d[h7]|0;cP=(cS&1|0)==0?cS>>>1:c[cz>>2]|0;eI(c1,(h3&1)==0?h5:c[h8>>2]|0,h4,cP+h4|0);eB(c1,(a[h7]&1)==0?h6:c[h9>>2]|0,cP)|0;cP=a[ib]|0;h4=cP&255;eB(b,(cP&1)==0?cA:c[cC>>2]|0,(h4&1|0)==0?h4>>>1:c[ic>>2]|0)|0;ep(c1);ep(c9);ep(c2);ep(c8);ep(c3);ep(c7);ep(c4);ep(c6);ep(c5);id=id+1|0;}while((id|0)<(h|0))}ex(da,4608,36);id=a[da]|0;if((id&1)==0){ip=da+1|0}else{ip=c[da+8>>2]|0}c5=id&255;if((c5&1|0)==0){iq=c5>>>1}else{iq=c[da+4>>2]|0}eB(b,ip,iq)|0;ep(da);if(cd){cd=df;da=dg;iq=dh;ip=dg+1|0;c5=dh+1|0;id=dd;c6=di;c4=df+1|0;c7=di+1|0;c3=dc;c8=dj;c2=dd+1|0;c9=dj+1|0;c1=db;ic=dk;cC=dc+1|0;cA=dk+1|0;ib=db+1|0;h9=db+4|0;h6=db+8|0;h7=dk+8|0;h8=dc+8|0;h5=dk+4|0;cz=dc+4|0;cy=dj+8|0;c_=dd+8|0;cQ=dj+4|0;cT=dd+4|0;cU=di+8|0;ih=df+8|0;c$=di+4|0;cJ=df+4|0;cK=dh+8|0;cY=dg+8|0;cB=dh+4|0;cV=dg+4|0;cW=0;do{ex(dg,4544,6);bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=cW,B)|0)|0;ex(dh,bO,lB(bO|0)|0);lC(cd|0,0,12);cR=a[da]|0;cZ=cR&255;ig=(cZ&1|0)==0?cZ>>>1:c[cV>>2]|0;cZ=d[iq]|0;cD=(cZ&1|0)==0?cZ>>>1:c[cB>>2]|0;eI(df,(cR&1)==0?ip:c[cY>>2]|0,ig,cD+ig|0);eB(df,(a[iq]&1)==0?c5:c[cK>>2]|0,cD)|0;ex(di,15136,15);lC(id|0,0,12);cD=a[cd]|0;ig=cD&255;cR=(ig&1|0)==0?ig>>>1:c[cJ>>2]|0;ig=d[c6]|0;cZ=(ig&1|0)==0?ig>>>1:c[c$>>2]|0;eI(dd,(cD&1)==0?c4:c[ih>>2]|0,cR,cZ+cR|0);eB(dd,(a[c6]&1)==0?c7:c[cU>>2]|0,cZ)|0;cZ=ag(cW,f)|0;bg(bO|0,14080,(B=i,i=i+8|0,c[B>>2]=cZ,B)|0)|0;ex(dj,bO,lB(bO|0)|0);lC(c3|0,0,12);cZ=a[id]|0;cR=cZ&255;cD=(cR&1|0)==0?cR>>>1:c[cT>>2]|0;cR=d[c8]|0;ig=(cR&1|0)==0?cR>>>1:c[cQ>>2]|0;eI(dc,(cZ&1)==0?c2:c[c_>>2]|0,cD,ig+cD|0);eB(dc,(a[c8]&1)==0?c9:c[cy>>2]|0,ig)|0;ex(dk,7072,3);lC(c1|0,0,12);ig=a[c3]|0;cD=ig&255;cZ=(cD&1|0)==0?cD>>>1:c[cz>>2]|0;cD=d[ic]|0;cR=(cD&1|0)==0?cD>>>1:c[h5>>2]|0;eI(db,(ig&1)==0?cC:c[h8>>2]|0,cZ,cR+cZ|0);eB(db,(a[ic]&1)==0?cA:c[h7>>2]|0,cR)|0;cR=a[c1]|0;cZ=cR&255;eB(b,(cR&1)==0?ib:c[h6>>2]|0,(cZ&1|0)==0?cZ>>>1:c[h9>>2]|0)|0;ep(db);ep(dk);ep(dc);ep(dj);ep(dd);ep(di);ep(df);ep(dh);ep(dg);cW=cW+1|0;}while((cW|0)<(h|0))}ex(dl,4608,36);h=a[dl]|0;if((h&1)==0){ir=dl+1|0}else{ir=c[dl+8>>2]|0}cW=h&255;if((cW&1|0)==0){is=cW>>>1}else{is=c[dl+4>>2]|0}eB(b,ir,is)|0;ep(dl);d3=ag(b5,g)|0;i=l;return d3|0}function da(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0;l=i;i=i+408|0;m=l+200|0;n=l+216|0;o=l+232|0;p=l+248|0;q=l+264|0;r=l+280|0;s=l+296|0;t=l+312|0;u=l+328|0;v=l+344|0;w=l+360|0;x=l+376|0;y=l+392|0;if((e|0)>0){z=(f|0)>0;A=j+h|0;h=l|0;j=r;C=s;D=t;E=s+1|0;F=t+1|0;G=q;H=u;I=r+1|0;J=u+1|0;K=p;L=v;M=q+1|0;N=v+1|0;O=o;P=w;Q=p+1|0;R=w+1|0;S=n;T=k;U=o+1|0;V=k+1|0;W=m;X=x;Y=n+1|0;Z=x+1|0;_=m+1|0;$=m+4|0;aa=m+8|0;ab=x+8|0;ac=n+8|0;ad=x+4|0;ae=n+4|0;af=k+8|0;ah=o+8|0;ai=k+4|0;k=o+4|0;aj=w+8|0;ak=p+8|0;al=w+4|0;am=p+4|0;an=v+8|0;ao=q+8|0;ap=v+4|0;aq=q+4|0;ar=u+8|0;as=r+8|0;at=u+4|0;au=r+4|0;av=t+8|0;aw=s+8|0;ax=t+4|0;ay=s+4|0;az=0;do{if(z){aA=ag(az,g)|0;aB=ag(az,f)|0;aC=0;do{aD=(ag(aC,A)|0)+aA|0;ex(s,2792,14);bg(h|0,14080,(B=i,i=i+8|0,c[B>>2]=aD,B)|0)|0;ex(t,h,lB(h|0)|0);lC(j|0,0,12);aD=a[C]|0;aE=aD&255;aF=(aE&1|0)==0?aE>>>1:c[ay>>2]|0;aE=d[D]|0;aG=(aE&1|0)==0?aE>>>1:c[ax>>2]|0;eI(r,(aD&1)==0?E:c[aw>>2]|0,aF,aG+aF|0);eB(r,(a[D]&1)==0?F:c[av>>2]|0,aG)|0;ex(u,4776,6);lC(G|0,0,12);aG=a[j]|0;aF=aG&255;aD=(aF&1|0)==0?aF>>>1:c[au>>2]|0;aF=d[H]|0;aE=(aF&1|0)==0?aF>>>1:c[at>>2]|0;eI(q,(aG&1)==0?I:c[as>>2]|0,aD,aE+aD|0);eB(q,(a[H]&1)==0?J:c[ar>>2]|0,aE)|0;bg(h|0,14080,(B=i,i=i+8|0,c[B>>2]=aC+aB,B)|0)|0;ex(v,h,lB(h|0)|0);lC(K|0,0,12);aE=a[G]|0;aD=aE&255;aG=(aD&1|0)==0?aD>>>1:c[aq>>2]|0;aD=d[L]|0;aF=(aD&1|0)==0?aD>>>1:c[ap>>2]|0;eI(p,(aE&1)==0?M:c[ao>>2]|0,aG,aF+aG|0);eB(p,(a[L]&1)==0?N:c[an>>2]|0,aF)|0;ex(w,2880,2);lC(O|0,0,12);aF=a[K]|0;aG=aF&255;aE=(aG&1|0)==0?aG>>>1:c[am>>2]|0;aG=d[P]|0;aD=(aG&1|0)==0?aG>>>1:c[al>>2]|0;eI(o,(aF&1)==0?Q:c[ak>>2]|0,aE,aD+aE|0);eB(o,(a[P]&1)==0?R:c[aj>>2]|0,aD)|0;lC(S|0,0,12);aD=a[O]|0;aE=aD&255;aF=(aE&1|0)==0?aE>>>1:c[k>>2]|0;aE=d[T]|0;if((aE&1|0)==0){aH=aE>>>1}else{aH=c[ai>>2]|0}eI(n,(aD&1)==0?U:c[ah>>2]|0,aF,aH+aF|0);if((a[T]&1)==0){aI=V}else{aI=c[af>>2]|0}eB(n,aI,aH)|0;ex(x,4944,2);lC(W|0,0,12);aF=a[S]|0;aD=aF&255;aE=(aD&1|0)==0?aD>>>1:c[ae>>2]|0;aD=d[X]|0;aG=(aD&1|0)==0?aD>>>1:c[ad>>2]|0;eI(m,(aF&1)==0?Y:c[ac>>2]|0,aE,aG+aE|0);eB(m,(a[X]&1)==0?Z:c[ab>>2]|0,aG)|0;aG=a[W]|0;aE=aG&255;eB(b,(aG&1)==0?_:c[aa>>2]|0,(aE&1|0)==0?aE>>>1:c[$>>2]|0)|0;ep(m);ep(x);ep(n);ep(o);ep(w);ep(p);ep(v);ep(q);ep(u);ep(r);ep(t);ep(s);aC=aC+1|0;}while((aC|0)<(f|0))}az=az+1|0;}while((az|0)<(e|0))}ex(y,2808,34);e=a[y]|0;if((e&1)==0){aJ=y+1|0}else{aJ=c[y+8>>2]|0}az=e&255;if((az&1|0)==0){aK=az>>>1}else{aK=c[y+4>>2]|0}eB(b,aJ,aK)|0;ep(y);i=l;return}function db(b,e,f,g,h,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0;n=i;i=i+408|0;o=n+200|0;p=n+216|0;q=n+232|0;r=n+248|0;s=n+264|0;t=n+280|0;u=n+296|0;v=n+312|0;w=n+328|0;x=n+344|0;y=n+360|0;z=n+376|0;A=n+392|0;C=(h|0)/(j|0)|0;D=(C|0)>1?C:1;C=(j|0)/(h|0)|0;E=(C|0)>1?C:1;C=(E|0)<(f|0)?E:f;E=ag(C,((e|0)/(f|0)|0)+l|0)|0;l=((e|0)/(g|0)|0|0)/(j|0)|0;e=(l|0)>1?l:1;l=(j|0)/(ag(h,f)|0)|0;F=ag((l|0)>1?l:1,h)|0;h=(k|0)/(g|0)|0;if((e|0)>0){k=ag(D,(f|0)/(C|0)|0)|0;C=(g|0)>0;f=n|0;l=t;G=u;H=v;I=u+1|0;J=v+1|0;K=s;L=w;M=t+1|0;N=w+1|0;O=r;P=m;Q=s+1|0;R=m+1|0;S=q;T=x;U=r+1|0;V=x+1|0;W=p;X=y;Y=q+1|0;Z=y+1|0;_=o;$=z;aa=p+1|0;ab=z+1|0;ac=o+1|0;ad=o+4|0;ae=o+8|0;af=z+8|0;ah=p+8|0;ai=z+4|0;aj=p+4|0;ak=y+8|0;al=q+8|0;am=y+4|0;an=q+4|0;ao=x+8|0;ap=r+8|0;aq=x+4|0;ar=r+4|0;as=m+8|0;at=s+8|0;au=m+4|0;m=s+4|0;av=w+8|0;aw=t+8|0;ax=w+4|0;ay=t+4|0;az=v+8|0;aA=u+8|0;aB=v+4|0;aC=u+4|0;aD=0;do{aE=(aD|0)%(k|0)|0;if(C){aF=ag(E,(aE|0)/(D|0)|0)|0;aG=ag((aE|0)%(D|0)|0,j)|0;aE=aG+(ag(F,(aD|0)/(k|0)|0)|0)+aF|0;aF=ag(aD,g)|0;aG=0;do{aH=aE+(ag(aG,h)|0)|0;ex(u,4544,6);bg(f|0,14080,(B=i,i=i+8|0,c[B>>2]=aG+aF,B)|0)|0;ex(v,f,lB(f|0)|0);lC(l|0,0,12);aI=a[G]|0;aJ=aI&255;aK=(aJ&1|0)==0?aJ>>>1:c[aC>>2]|0;aJ=d[H]|0;aL=(aJ&1|0)==0?aJ>>>1:c[aB>>2]|0;eI(t,(aI&1)==0?I:c[aA>>2]|0,aK,aL+aK|0);eB(t,(a[H]&1)==0?J:c[az>>2]|0,aL)|0;ex(w,2880,2);lC(K|0,0,12);aL=a[l]|0;aK=aL&255;aI=(aK&1|0)==0?aK>>>1:c[ay>>2]|0;aK=d[L]|0;aJ=(aK&1|0)==0?aK>>>1:c[ax>>2]|0;eI(s,(aL&1)==0?M:c[aw>>2]|0,aI,aJ+aI|0);eB(s,(a[L]&1)==0?N:c[av>>2]|0,aJ)|0;lC(O|0,0,12);aJ=a[K]|0;aI=aJ&255;aL=(aI&1|0)==0?aI>>>1:c[m>>2]|0;aI=d[P]|0;if((aI&1|0)==0){aM=aI>>>1}else{aM=c[au>>2]|0}eI(r,(aJ&1)==0?Q:c[at>>2]|0,aL,aM+aL|0);if((a[P]&1)==0){aN=R}else{aN=c[as>>2]|0}eB(r,aN,aM)|0;ex(x,2848,12);lC(S|0,0,12);aL=a[O]|0;aJ=aL&255;aI=(aJ&1|0)==0?aJ>>>1:c[ar>>2]|0;aJ=d[T]|0;aK=(aJ&1|0)==0?aJ>>>1:c[aq>>2]|0;eI(q,(aL&1)==0?U:c[ap>>2]|0,aI,aK+aI|0);eB(q,(a[T]&1)==0?V:c[ao>>2]|0,aK)|0;bg(f|0,14080,(B=i,i=i+8|0,c[B>>2]=aH,B)|0)|0;ex(y,f,lB(f|0)|0);lC(W|0,0,12);aH=a[S]|0;aK=aH&255;aI=(aK&1|0)==0?aK>>>1:c[an>>2]|0;aK=d[X]|0;aL=(aK&1|0)==0?aK>>>1:c[am>>2]|0;eI(p,(aH&1)==0?Y:c[al>>2]|0,aI,aL+aI|0);eB(p,(a[X]&1)==0?Z:c[ak>>2]|0,aL)|0;ex(z,7072,3);lC(_|0,0,12);aL=a[W]|0;aI=aL&255;aH=(aI&1|0)==0?aI>>>1:c[aj>>2]|0;aI=d[$]|0;aK=(aI&1|0)==0?aI>>>1:c[ai>>2]|0;eI(o,(aL&1)==0?aa:c[ah>>2]|0,aH,aK+aH|0);eB(o,(a[$]&1)==0?ab:c[af>>2]|0,aK)|0;aK=a[_]|0;aH=aK&255;eB(b,(aK&1)==0?ac:c[ae>>2]|0,(aH&1|0)==0?aH>>>1:c[ad>>2]|0)|0;ep(o);ep(z);ep(p);ep(y);ep(q);ep(x);ep(r);ep(s);ep(w);ep(t);ep(v);ep(u);aG=aG+1|0;}while((aG|0)<(g|0))}aD=aD+1|0;}while((aD|0)<(e|0))}ex(A,2808,34);e=a[A]|0;if((e&1)==0){aO=A+1|0}else{aO=c[A+8>>2]|0}aD=e&255;if((aD&1|0)==0){aP=aD>>>1}else{aP=c[A+4>>2]|0}eB(b,aO,aP)|0;ep(A);i=n;return}
function dc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=i;i=i+128|0;h=g|0;j=g+16|0;k=g+32|0;l=g+48|0;m=g+64|0;n=g+80|0;o=g+96|0;p=g+112|0;if((f|0)==0){ex(k,6592,14);f=j;lC(f|0,0,12);q=a[k]|0;r=q&255;if((r&1|0)==0){s=r>>>1}else{s=c[k+4>>2]|0}r=e;t=d[r]|0;if((t&1|0)==0){u=t>>>1}else{u=c[e+4>>2]|0}if((q&1)==0){v=k+1|0}else{v=c[k+8>>2]|0}eI(j,v,s,u+s|0);if((a[r]&1)==0){w=e+1|0}else{w=c[e+8>>2]|0}eB(j,w,u)|0;ex(l,6232,119);u=h;lC(u|0,0,12);w=a[f]|0;f=w&255;if((f&1|0)==0){x=f>>>1}else{x=c[j+4>>2]|0}f=l;r=d[f]|0;if((r&1|0)==0){y=r>>>1}else{y=c[l+4>>2]|0}if((w&1)==0){z=j+1|0}else{z=c[j+8>>2]|0}eI(h,z,x,y+x|0);if((a[f]&1)==0){A=l+1|0}else{A=c[l+8>>2]|0}eB(h,A,y)|0;y=a[u]|0;if((y&1)==0){B=h+1|0}else{B=c[h+8>>2]|0}u=y&255;if((u&1|0)==0){C=u>>>1}else{C=c[h+4>>2]|0}eB(b,B,C)|0;ep(h);ep(l);ep(j);ep(k);i=g;return}else{ex(o,6592,14);k=n;lC(k|0,0,12);j=a[o]|0;l=j&255;if((l&1|0)==0){D=l>>>1}else{D=c[o+4>>2]|0}l=e;h=d[l]|0;if((h&1|0)==0){E=h>>>1}else{E=c[e+4>>2]|0}if((j&1)==0){F=o+1|0}else{F=c[o+8>>2]|0}eI(n,F,D,E+D|0);if((a[l]&1)==0){G=e+1|0}else{G=c[e+8>>2]|0}eB(n,G,E)|0;ex(p,5920,60);E=m;lC(E|0,0,12);G=a[k]|0;k=G&255;if((k&1|0)==0){H=k>>>1}else{H=c[n+4>>2]|0}k=p;e=d[k]|0;if((e&1|0)==0){I=e>>>1}else{I=c[p+4>>2]|0}if((G&1)==0){J=n+1|0}else{J=c[n+8>>2]|0}eI(m,J,H,I+H|0);if((a[k]&1)==0){K=p+1|0}else{K=c[p+8>>2]|0}eB(m,K,I)|0;I=a[E]|0;if((I&1)==0){L=m+1|0}else{L=c[m+8>>2]|0}E=I&255;if((E&1|0)==0){M=E>>>1}else{M=c[m+4>>2]|0}eB(b,L,M)|0;ep(m);ep(p);ep(n);ep(o);i=g;return}}function dd(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0;h=i;i=i+632|0;j=h|0;k=h+200|0;l=h+216|0;m=h+232|0;n=h+248|0;o=h+264|0;p=h+280|0;q=h+296|0;r=h+312|0;s=h+328|0;t=h+344|0;u=h+360|0;v=h+376|0;w=h+392|0;x=h+408|0;y=h+424|0;z=h+440|0;A=h+456|0;C=h+472|0;D=h+488|0;E=h+504|0;F=h+520|0;G=h+536|0;H=h+552|0;I=h+568|0;J=h+584|0;K=h+600|0;L=h+616|0;if((g|0)==1){ex(o,2984,12);g=j|0;bg(g|0,14080,(B=i,i=i+8|0,c[B>>2]=f,B)|0)|0;ex(p,g,lB(g|0)|0);M=n;lC(M|0,0,12);N=a[o]|0;O=N&255;if((O&1|0)==0){P=O>>>1}else{P=c[o+4>>2]|0}O=p;Q=d[O]|0;if((Q&1|0)==0){R=Q>>>1}else{R=c[p+4>>2]|0}if((N&1)==0){S=o+1|0}else{S=c[o+8>>2]|0}eI(n,S,P,R+P|0);if((a[O]&1)==0){T=p+1|0}else{T=c[p+8>>2]|0}eB(n,T,R)|0;ex(q,4776,6);R=m;lC(R|0,0,12);T=a[M]|0;M=T&255;if((M&1|0)==0){U=M>>>1}else{U=c[n+4>>2]|0}M=q;O=d[M]|0;if((O&1|0)==0){V=O>>>1}else{V=c[q+4>>2]|0}if((T&1)==0){W=n+1|0}else{W=c[n+8>>2]|0}eI(m,W,U,V+U|0);if((a[M]&1)==0){X=q+1|0}else{X=c[q+8>>2]|0}eB(m,X,V)|0;bg(g|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(r,g,lB(g|0)|0);g=l;lC(g|0,0,12);V=a[R]|0;R=V&255;if((R&1|0)==0){Y=R>>>1}else{Y=c[m+4>>2]|0}R=r;X=d[R]|0;if((X&1|0)==0){Z=X>>>1}else{Z=c[r+4>>2]|0}if((V&1)==0){_=m+1|0}else{_=c[m+8>>2]|0}eI(l,_,Y,Z+Y|0);if((a[R]&1)==0){$=r+1|0}else{$=c[r+8>>2]|0}eB(l,$,Z)|0;ex(s,7072,3);Z=k;lC(Z|0,0,12);$=a[g]|0;g=$&255;if((g&1|0)==0){aa=g>>>1}else{aa=c[l+4>>2]|0}g=s;R=d[g]|0;if((R&1|0)==0){ab=R>>>1}else{ab=c[s+4>>2]|0}if(($&1)==0){ac=l+1|0}else{ac=c[l+8>>2]|0}eI(k,ac,aa,ab+aa|0);if((a[g]&1)==0){ad=s+1|0}else{ad=c[s+8>>2]|0}eB(k,ad,ab)|0;ab=a[Z]|0;if((ab&1)==0){ae=k+1|0}else{ae=c[k+8>>2]|0}Z=ab&255;if((Z&1|0)==0){af=Z>>>1}else{af=c[k+4>>2]|0}eB(b,ae,af)|0;ep(k);ep(s);ep(l);ep(r);ep(m);ep(q);ep(n);ep(p);ep(o);i=h;return}ex(x,2944,17);o=j|0;bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=f,B)|0)|0;ex(y,o,lB(o|0)|0);j=w;lC(j|0,0,12);p=a[x]|0;n=p&255;if((n&1|0)==0){ag=n>>>1}else{ag=c[x+4>>2]|0}n=y;q=d[n]|0;if((q&1|0)==0){ah=q>>>1}else{ah=c[y+4>>2]|0}if((p&1)==0){ai=x+1|0}else{ai=c[x+8>>2]|0}eI(w,ai,ag,ah+ag|0);if((a[n]&1)==0){aj=y+1|0}else{aj=c[y+8>>2]|0}eB(w,aj,ah)|0;ex(z,4776,6);ah=v;lC(ah|0,0,12);aj=a[j]|0;j=aj&255;if((j&1|0)==0){ak=j>>>1}else{ak=c[w+4>>2]|0}j=z;n=d[j]|0;if((n&1|0)==0){al=n>>>1}else{al=c[z+4>>2]|0}if((aj&1)==0){am=w+1|0}else{am=c[w+8>>2]|0}eI(v,am,ak,al+ak|0);if((a[j]&1)==0){an=z+1|0}else{an=c[z+8>>2]|0}eB(v,an,al)|0;bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(A,o,lB(o|0)|0);al=u;lC(al|0,0,12);an=a[ah]|0;ah=an&255;if((ah&1|0)==0){ao=ah>>>1}else{ao=c[v+4>>2]|0}ah=A;j=d[ah]|0;if((j&1|0)==0){ap=j>>>1}else{ap=c[A+4>>2]|0}if((an&1)==0){aq=v+1|0}else{aq=c[v+8>>2]|0}eI(u,aq,ao,ap+ao|0);if((a[ah]&1)==0){ar=A+1|0}else{ar=c[A+8>>2]|0}eB(u,ar,ap)|0;ex(C,4672,5);ap=t;lC(ap|0,0,12);ar=a[al]|0;al=ar&255;if((al&1|0)==0){as=al>>>1}else{as=c[u+4>>2]|0}al=C;ah=d[al]|0;if((ah&1|0)==0){at=ah>>>1}else{at=c[C+4>>2]|0}if((ar&1)==0){au=u+1|0}else{au=c[u+8>>2]|0}eI(t,au,as,at+as|0);if((a[al]&1)==0){av=C+1|0}else{av=c[C+8>>2]|0}eB(t,av,at)|0;at=a[ap]|0;if((at&1)==0){aw=t+1|0}else{aw=c[t+8>>2]|0}ap=at&255;if((ap&1|0)==0){ax=ap>>>1}else{ax=c[t+4>>2]|0}eB(b,aw,ax)|0;ep(t);ep(C);ep(u);ep(A);ep(v);ep(z);ep(w);ep(y);ep(x);ex(H,2904,17);bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=f,B)|0)|0;ex(I,o,lB(o|0)|0);f=G;lC(f|0,0,12);x=a[H]|0;y=x&255;if((y&1|0)==0){ay=y>>>1}else{ay=c[H+4>>2]|0}y=I;w=d[y]|0;if((w&1|0)==0){az=w>>>1}else{az=c[I+4>>2]|0}if((x&1)==0){aA=H+1|0}else{aA=c[H+8>>2]|0}eI(G,aA,ay,az+ay|0);if((a[y]&1)==0){aB=I+1|0}else{aB=c[I+8>>2]|0}eB(G,aB,az)|0;ex(J,4776,6);az=F;lC(az|0,0,12);aB=a[f]|0;f=aB&255;if((f&1|0)==0){aC=f>>>1}else{aC=c[G+4>>2]|0}f=J;y=d[f]|0;if((y&1|0)==0){aD=y>>>1}else{aD=c[J+4>>2]|0}if((aB&1)==0){aE=G+1|0}else{aE=c[G+8>>2]|0}eI(F,aE,aC,aD+aC|0);if((a[f]&1)==0){aF=J+1|0}else{aF=c[J+8>>2]|0}eB(F,aF,aD)|0;bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(K,o,lB(o|0)|0);o=E;lC(o|0,0,12);e=a[az]|0;az=e&255;if((az&1|0)==0){aG=az>>>1}else{aG=c[F+4>>2]|0}az=K;aD=d[az]|0;if((aD&1|0)==0){aH=aD>>>1}else{aH=c[K+4>>2]|0}if((e&1)==0){aI=F+1|0}else{aI=c[F+8>>2]|0}eI(E,aI,aG,aH+aG|0);if((a[az]&1)==0){aJ=K+1|0}else{aJ=c[K+8>>2]|0}eB(E,aJ,aH)|0;ex(L,4440,5);aH=D;lC(aH|0,0,12);aJ=a[o]|0;o=aJ&255;if((o&1|0)==0){aK=o>>>1}else{aK=c[E+4>>2]|0}o=L;az=d[o]|0;if((az&1|0)==0){aL=az>>>1}else{aL=c[L+4>>2]|0}if((aJ&1)==0){aM=E+1|0}else{aM=c[E+8>>2]|0}eI(D,aM,aK,aL+aK|0);if((a[o]&1)==0){aN=L+1|0}else{aN=c[L+8>>2]|0}eB(D,aN,aL)|0;aL=a[aH]|0;if((aL&1)==0){aO=D+1|0}else{aO=c[D+8>>2]|0}aH=aL&255;if((aH&1|0)==0){aP=aH>>>1}else{aP=c[D+4>>2]|0}eB(b,aO,aP)|0;ep(D);ep(L);ep(E);ep(K);ep(F);ep(J);ep(G);ep(I);ep(H);i=h;return}function de(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0;h=i;i=i+632|0;j=h|0;k=h+200|0;l=h+216|0;m=h+232|0;n=h+248|0;o=h+264|0;p=h+280|0;q=h+296|0;r=h+312|0;s=h+328|0;t=h+344|0;u=h+360|0;v=h+376|0;w=h+392|0;x=h+408|0;y=h+424|0;z=h+440|0;A=h+456|0;C=h+472|0;D=h+488|0;E=h+504|0;F=h+520|0;G=h+536|0;H=h+552|0;I=h+568|0;J=h+584|0;K=h+600|0;L=h+616|0;if((g|0)==1){ex(o,14768,10);g=j|0;bg(g|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(p,g,lB(g|0)|0);M=n;lC(M|0,0,12);N=a[o]|0;O=N&255;if((O&1|0)==0){P=O>>>1}else{P=c[o+4>>2]|0}O=p;Q=d[O]|0;if((Q&1|0)==0){R=Q>>>1}else{R=c[p+4>>2]|0}if((N&1)==0){S=o+1|0}else{S=c[o+8>>2]|0}eI(n,S,P,R+P|0);if((a[O]&1)==0){T=p+1|0}else{T=c[p+8>>2]|0}eB(n,T,R)|0;ex(q,14720,7);R=m;lC(R|0,0,12);T=a[M]|0;M=T&255;if((M&1|0)==0){U=M>>>1}else{U=c[n+4>>2]|0}M=q;O=d[M]|0;if((O&1|0)==0){V=O>>>1}else{V=c[q+4>>2]|0}if((T&1)==0){W=n+1|0}else{W=c[n+8>>2]|0}eI(m,W,U,V+U|0);if((a[M]&1)==0){X=q+1|0}else{X=c[q+8>>2]|0}eB(m,X,V)|0;bg(g|0,14080,(B=i,i=i+8|0,c[B>>2]=f,B)|0)|0;ex(r,g,lB(g|0)|0);g=l;lC(g|0,0,12);V=a[R]|0;R=V&255;if((R&1|0)==0){Y=R>>>1}else{Y=c[m+4>>2]|0}R=r;X=d[R]|0;if((X&1|0)==0){Z=X>>>1}else{Z=c[r+4>>2]|0}if((V&1)==0){_=m+1|0}else{_=c[m+8>>2]|0}eI(l,_,Y,Z+Y|0);if((a[R]&1)==0){$=r+1|0}else{$=c[r+8>>2]|0}eB(l,$,Z)|0;ex(s,7072,3);Z=k;lC(Z|0,0,12);$=a[g]|0;g=$&255;if((g&1|0)==0){aa=g>>>1}else{aa=c[l+4>>2]|0}g=s;R=d[g]|0;if((R&1|0)==0){ab=R>>>1}else{ab=c[s+4>>2]|0}if(($&1)==0){ac=l+1|0}else{ac=c[l+8>>2]|0}eI(k,ac,aa,ab+aa|0);if((a[g]&1)==0){ad=s+1|0}else{ad=c[s+8>>2]|0}eB(k,ad,ab)|0;ab=a[Z]|0;if((ab&1)==0){ae=k+1|0}else{ae=c[k+8>>2]|0}Z=ab&255;if((Z&1|0)==0){af=Z>>>1}else{af=c[k+4>>2]|0}eB(b,ae,af)|0;ep(k);ep(s);ep(l);ep(r);ep(m);ep(q);ep(n);ep(p);ep(o);i=h;return}ex(x,14768,10);o=j|0;bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(y,o,lB(o|0)|0);j=w;lC(j|0,0,12);p=a[x]|0;n=p&255;if((n&1|0)==0){ag=n>>>1}else{ag=c[x+4>>2]|0}n=y;q=d[n]|0;if((q&1|0)==0){ah=q>>>1}else{ah=c[y+4>>2]|0}if((p&1)==0){ai=x+1|0}else{ai=c[x+8>>2]|0}eI(w,ai,ag,ah+ag|0);if((a[n]&1)==0){aj=y+1|0}else{aj=c[y+8>>2]|0}eB(w,aj,ah)|0;ex(z,14632,14);ah=v;lC(ah|0,0,12);aj=a[j]|0;j=aj&255;if((j&1|0)==0){ak=j>>>1}else{ak=c[w+4>>2]|0}j=z;n=d[j]|0;if((n&1|0)==0){al=n>>>1}else{al=c[z+4>>2]|0}if((aj&1)==0){am=w+1|0}else{am=c[w+8>>2]|0}eI(v,am,ak,al+ak|0);if((a[j]&1)==0){an=z+1|0}else{an=c[z+8>>2]|0}eB(v,an,al)|0;bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=f,B)|0)|0;ex(A,o,lB(o|0)|0);al=u;lC(al|0,0,12);an=a[ah]|0;ah=an&255;if((ah&1|0)==0){ao=ah>>>1}else{ao=c[v+4>>2]|0}ah=A;j=d[ah]|0;if((j&1|0)==0){ap=j>>>1}else{ap=c[A+4>>2]|0}if((an&1)==0){aq=v+1|0}else{aq=c[v+8>>2]|0}eI(u,aq,ao,ap+ao|0);if((a[ah]&1)==0){ar=A+1|0}else{ar=c[A+8>>2]|0}eB(u,ar,ap)|0;ex(C,7072,3);ap=t;lC(ap|0,0,12);ar=a[al]|0;al=ar&255;if((al&1|0)==0){as=al>>>1}else{as=c[u+4>>2]|0}al=C;ah=d[al]|0;if((ah&1|0)==0){at=ah>>>1}else{at=c[C+4>>2]|0}if((ar&1)==0){au=u+1|0}else{au=c[u+8>>2]|0}eI(t,au,as,at+as|0);if((a[al]&1)==0){av=C+1|0}else{av=c[C+8>>2]|0}eB(t,av,at)|0;at=a[ap]|0;if((at&1)==0){aw=t+1|0}else{aw=c[t+8>>2]|0}ap=at&255;if((ap&1|0)==0){ax=ap>>>1}else{ax=c[t+4>>2]|0}eB(b,aw,ax)|0;ep(t);ep(C);ep(u);ep(A);ep(v);ep(z);ep(w);ep(y);ep(x);ex(H,14768,10);bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;ex(I,o,lB(o|0)|0);e=G;lC(e|0,0,12);x=a[H]|0;y=x&255;if((y&1|0)==0){ay=y>>>1}else{ay=c[H+4>>2]|0}y=I;w=d[y]|0;if((w&1|0)==0){az=w>>>1}else{az=c[I+4>>2]|0}if((x&1)==0){aA=H+1|0}else{aA=c[H+8>>2]|0}eI(G,aA,ay,az+ay|0);if((a[y]&1)==0){aB=I+1|0}else{aB=c[I+8>>2]|0}eB(G,aB,az)|0;ex(J,14576,14);az=F;lC(az|0,0,12);aB=a[e]|0;e=aB&255;if((e&1|0)==0){aC=e>>>1}else{aC=c[G+4>>2]|0}e=J;y=d[e]|0;if((y&1|0)==0){aD=y>>>1}else{aD=c[J+4>>2]|0}if((aB&1)==0){aE=G+1|0}else{aE=c[G+8>>2]|0}eI(F,aE,aC,aD+aC|0);if((a[e]&1)==0){aF=J+1|0}else{aF=c[J+8>>2]|0}eB(F,aF,aD)|0;bg(o|0,14080,(B=i,i=i+8|0,c[B>>2]=f,B)|0)|0;ex(K,o,lB(o|0)|0);o=E;lC(o|0,0,12);f=a[az]|0;az=f&255;if((az&1|0)==0){aG=az>>>1}else{aG=c[F+4>>2]|0}az=K;aD=d[az]|0;if((aD&1|0)==0){aH=aD>>>1}else{aH=c[K+4>>2]|0}if((f&1)==0){aI=F+1|0}else{aI=c[F+8>>2]|0}eI(E,aI,aG,aH+aG|0);if((a[az]&1)==0){aJ=K+1|0}else{aJ=c[K+8>>2]|0}eB(E,aJ,aH)|0;ex(L,7072,3);aH=D;lC(aH|0,0,12);aJ=a[o]|0;o=aJ&255;if((o&1|0)==0){aK=o>>>1}else{aK=c[E+4>>2]|0}o=L;az=d[o]|0;if((az&1|0)==0){aL=az>>>1}else{aL=c[L+4>>2]|0}if((aJ&1)==0){aM=E+1|0}else{aM=c[E+8>>2]|0}eI(D,aM,aK,aL+aK|0);if((a[o]&1)==0){aN=L+1|0}else{aN=c[L+8>>2]|0}eB(D,aN,aL)|0;aL=a[aH]|0;if((aL&1)==0){aO=D+1|0}else{aO=c[D+8>>2]|0}aH=aL&255;if((aH&1|0)==0){aP=aH>>>1}else{aP=c[D+4>>2]|0}eB(b,aO,aP)|0;ep(D);ep(L);ep(E);ep(K);ep(F);ep(J);ep(G);ep(I);ep(H);i=h;return}function df(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;h=i;i=i+32|0;j=d;d=i;i=i+12|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];c[d+4>>2]=c[j+4>>2];c[d+8>>2]=c[j+8>>2];j=h|0;k=h+8|0;l=h+16|0;m=i;i=i+4|0;i=i+7>>3<<3;n=i;i=i+136|0;o=i;i=i+64|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+8|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+200|0;u=i;i=i+4|0;i=i+7>>3<<3;v=n+56|0;w=n|0;x=n;y=n+4|0;z=y|0;c[w>>2]=23596;A=n+56|0;c[A>>2]=23616;e5(n+56|0,y);c[n+128>>2]=0;c[n+132>>2]=-1;c[w>>2]=17556;c[v>>2]=17576;fa(z);C=y|0;c[C>>2]=17760;D=n+36|0;lC(n+36|0,0,16);c[n+52>>2]=16;lC(l|0,0,12);du(y,l);ep(l);do{if((b|0)==0){if((g|0)==0){E=0;break}c[g>>2]=-30;E=0}else{l=c[d+8>>2]|0;if((e|0)==1){if((l|0)!=1){F=781}}else if((e|0)==0){if(!((c[d+4>>2]|0)==1&(l|0)==1)){F=781}}if((F|0)==781){if((g|0)==0){E=0;break}c[g>>2]=-30;E=0;break}l=lk(84)|0;y=l;if((l|0)==0){if((g|0)==0){E=0;break}c[g>>2]=-5;E=0;break}n=l;c[n>>2]=b;ba(b|0)|0;G=l+4|0;H=d;c[G>>2]=c[H>>2];c[G+4>>2]=c[H+4>>2];c[G+8>>2]=c[H+8>>2];H=l+16|0;c[H>>2]=e;G=l+20|0;c[G>>2]=f;I=l+32|0;J=l+36|0;K=l+40|0;L=l+28|0;M=L;N=l+44|0;lC(L|0,0,36);c[l+64>>2]=2048;L=l+68|0;c[L>>2]=256;c[l+72>>2]=16;c[l+76>>2]=16;c[l+80>>2]=16;O=l+24|0;P=o;Q=j;R=q;S=s|0;T=0;L695:while(1){U=lq(12)|0;V=U;ex(V,23752,0);c[O>>2]=V;if((U|0)==0){F=791;break}c[N>>2]=0;U=a[27640]|0;W=U&255;eB(V,(U&1)==0?27641:c[6912]|0,(W&1|0)==0?W>>>1:c[6911]|0)|0;W=c[O>>2]|0;if((c[G>>2]|0)==0){U=a[27616]|0;V=(U&1)==0?27617:c[6906]|0;X=U&255;U=(X&1|0)==0?X>>>1:c[6905]|0;eB(W,V,U)|0}else{U=a[27600]|0;V=(U&1)==0?27601:c[6902]|0;X=U&255;U=(X&1|0)==0?X>>>1:c[6901]|0;eB(W,V,U)|0}U=c[H>>2]|0;if((U|0)==0){c4(y,0);F=808}else if((U|0)==1){c4(y,0);c4(y,1);F=808}else if((U|0)==3){c4(y,0);c4(y,1);c4(y,2);F=808}do{if((F|0)==808){F=0;c[N>>2]=0;U=c[I>>2]|0;if((U|0)==0){break}else{Y=U;Z=0}do{Z=(c[Y+24>>2]|0)==0|Z;c[N>>2]=Z;Y=c[Y+28>>2]|0;}while((Y|0)!=0)}}while(0);U=c[O>>2]|0;if((a[U]&1)==0){_=U+1|0}else{_=c[U+8>>2]|0}c[r>>2]=_;c[M>>2]=cn(b|0,1,r|0,0,m|0)|0;$=c[m>>2]|0;if(($|0)!=0){F=815;break}aa=aT(b|0,4225,64,P|0,p|0)|0;c[m>>2]=aa;if((aa|0)!=0){F=822;break}U=(c[p>>2]|0)>>>2;V=(U|0)==0;if(V){ab=T}else{W=0;X=T;while(1){ac=o+(W<<2)|0;ad=bJ(c[ac>>2]|0,4096,8,R|0,0)|0;c[m>>2]=ad;if((ad|0)!=0){F=830;break L695}do{if((c[q>>2]|0)==4&(c[q+4>>2]|0)==0){ae=ce(c[M>>2]|0,1,ac|0,2240,0,0)|0;c[m>>2]=ae;if((ae|0)==0){af=1;break}ag=bZ(c[M>>2]|0,c[ac>>2]|0,4483,0,0,u|0)|0;c[m>>2]=ag;if((ag|0)!=0){F=840;break L695}ae=c[u>>2]|0;ah=lk(ae+1|0)|0;ai=bZ(c[M>>2]|0,c[ac>>2]|0,4483,ae|0,ah|0,0)|0;c[m>>2]=ai;if((ai|0)!=0){F=847;break L695}aj=bJ(c[ac>>2]|0,4139,200,S|0,0)|0;c[m>>2]=aj;if((aj|0)!=0){F=854;break L695}ae=c[t>>2]|0;b8(ae|0,1640,(B=i,i=i+8|0,c[B>>2]=S,B)|0)|0;ae=c[t>>2]|0;b8(ae|0,1232,(B=i,i=i+8|0,c[B>>2]=ah,B)|0)|0;ll(ah);ak=c[m>>2]|0;if((ak|0)==0){af=1}else{F=860;break L695}}else{af=X}}while(0);ac=W+1|0;if((ac|0)<(U|0)){W=ac;X=af}else{ab=af;break}}}if((ab|0)==0){F=867;break}X=c[M>>2]|0;W=I;while(1){ac=c[W>>2]|0;if((ac|0)==0){F=876;break}ah=cl(X|0,c[ac+4>>2]|0,k|0)|0;c[ac>>2]=ah;ae=c[k>>2]|0;if((ah|0)!=0&(ae|0)==0){W=ac+28|0}else{al=ae;break}}if((F|0)==876){F=0;if((c[G>>2]|0)==0){am=cl(X|0,15168,k|0)|0}else{am=cl(X|0,14656,k|0)|0}c[K>>2]=am;W=c[k>>2]|0;al=(am|0)!=0&(W|0)==0?0:W}c[m>>2]=al;if((al|0)!=0){F=881;break}if(V){F=887;break}else{an=0;ao=0;ap=2147483647}L755:while(1){W=c[I>>2]|0;if((W|0)==0){aq=an;ar=ap}else{ae=o+(ao<<2)|0;ac=an;ah=W;W=ap;while(1){if((cf(c[ah>>2]|0,c[ae>>2]|0,4528,4,Q|0,0)|0)!=0){as=W;F=896;break L755}at=c[j>>2]|0;au=at>>>0<(c[ah+16>>2]|0)>>>0|ac;av=W>>>0>at>>>0?at:W;at=c[ah+28>>2]|0;if((at|0)==0){aq=au;ar=av;break}else{ac=au;ah=at;W=av}}}W=ao+1|0;if(W>>>0<U>>>0){an=aq;ao=W;ap=ar}else{F=895;break}}if((F|0)==895){F=0;if((aq|0)==0){F=887;break}else if((aq|0)==(-1|0)){as=ar;F=896}else{aw=ar}}if((F|0)==896){F=0;ax=c[m>>2]|0;if((ax|0)==0){aw=as}else{F=897;break}}dk(y);c[L>>2]=aw;T=ab}if((F|0)==840){if((g|0)!=0){c[g>>2]=ag}dk(y);T=c[n>>2]|0;a5(T|0)|0;ll(l);E=0;break}else if((F|0)==830){if((g|0)!=0){c[g>>2]=ad}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==860){if((g|0)!=0){c[g>>2]=ak}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==815){if((g|0)!=0){c[g>>2]=$}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==822){if((g|0)!=0){c[g>>2]=aa}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==847){if((g|0)!=0){c[g>>2]=ai}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==854){if((g|0)!=0){c[g>>2]=aj}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==867){if((g|0)!=0){c[g>>2]=-34}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==881){if((g|0)!=0){c[g>>2]=al}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==887){T=c[I>>2]|0;if((T|0)!=0){L=T;T=c[J>>2]|0;do{T=T+1|0;c[J>>2]=T;L=c[L+28>>2]|0;}while((L|0)!=0)}if((g|0)==0){E=l;break}c[g>>2]=0;E=l;break}else if((F|0)==897){if((g|0)!=0){c[g>>2]=ax}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}else if((F|0)==791){if((g|0)!=0){c[g>>2]=-5}dk(y);a5(c[n>>2]|0)|0;ll(l);E=0;break}}}while(0);c[w>>2]=17556;c[A>>2]=17576;c[C>>2]=17760;ep(D);e9(z);ft(x,18836);e3(v);i=h;return E|0}function dg(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;i=d+44|0;j=c[i>>2]|0;k=d+24|0;l=c[k>>2]|0;if(j>>>0<l>>>0){c[i>>2]=l;m=l}else{m=j}j=h&24;do{if((j|0)==0){i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else if((j|0)==24){if((g|0)==0){n=0;o=0;break}else if((g|0)==2){p=945;break}else if((g|0)!=1){p=949;break}i=b;c[i>>2]=0;c[i+4>>2]=0;i=b+8|0;c[i>>2]=-1;c[i+4>>2]=-1;return}else{if((g|0)==0){n=0;o=0;break}else if((g|0)==2){p=945;break}else if((g|0)!=1){p=949;break}if((h&8|0)==0){i=l-(c[d+20>>2]|0)|0;n=(i|0)<0?-1:0;o=i;break}else{i=(c[d+12>>2]|0)-(c[d+8>>2]|0)|0;n=(i|0)<0?-1:0;o=i;break}}}while(0);if((p|0)==949){g=b;c[g>>2]=0;c[g+4>>2]=0;g=b+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}if((p|0)==945){p=d+32|0;if((a[p]&1)==0){q=p+1|0}else{q=c[d+40>>2]|0}p=m-q|0;n=(p|0)<0?-1:0;o=p}p=lF(o,n,e,f)|0;f=K;e=0;do{if(!((f|0)<(e|0)|(f|0)==(e|0)&p>>>0<0>>>0)){n=d+32|0;if((a[n]&1)==0){r=n+1|0}else{r=c[d+40>>2]|0}n=m-r|0;o=(n|0)<0?-1:0;if((o|0)<(f|0)|(o|0)==(f|0)&n>>>0<p>>>0){break}n=h&8;do{if(!((p|0)==0&(f|0)==0)){do{if((n|0)!=0){if((c[d+12>>2]|0)!=0){break}o=b;c[o>>2]=0;c[o+4>>2]=0;o=b+8|0;c[o>>2]=-1;c[o+4>>2]=-1;return}}while(0);if(!((h&16|0)!=0&(l|0)==0)){break}o=b;c[o>>2]=0;c[o+4>>2]=0;o=b+8|0;c[o>>2]=-1;c[o+4>>2]=-1;return}}while(0);if((n|0)!=0){c[d+12>>2]=(c[d+8>>2]|0)+p;c[d+16>>2]=m}if((h&16|0)!=0){c[k>>2]=(c[d+20>>2]|0)+p}o=b;c[o>>2]=0;c[o+4>>2]=0;o=b+8|0;c[o>>2]=p;c[o+4>>2]=f;return}}while(0);f=b;c[f>>2]=0;c[f+4>>2]=0;f=b+8|0;c[f>>2]=-1;c[f+4>>2]=-1;return}function dh(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0;b=a+44|0;e=c[b>>2]|0;f=c[a+24>>2]|0;if(e>>>0<f>>>0){c[b>>2]=f;g=f}else{g=e}if((c[a+48>>2]&8|0)==0){h=-1;return h|0}e=a+16|0;f=c[e>>2]|0;b=c[a+12>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;i=g}else{i=f}if(b>>>0>=i>>>0){h=-1;return h|0}h=d[b]|0;return h|0}function di(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+44|0;f=c[e>>2]|0;g=c[b+24>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;h=g}else{h=f}f=b+8|0;g=c[f>>2]|0;e=b+12|0;i=c[e>>2]|0;if(g>>>0>=i>>>0){j=-1;return j|0}if((d|0)==-1){c[f>>2]=g;c[e>>2]=i-1;c[b+16>>2]=h;j=0;return j|0}k=i-1|0;do{if((c[b+48>>2]&16|0)==0){if((d<<24>>24|0)==(a[k]|0)){break}else{j=-1}return j|0}}while(0);c[f>>2]=g;c[e>>2]=k;c[b+16>>2]=h;a[k]=d&255;j=d;return j|0}function dj(a){a=a|0;if((a|0)==0){return}dk(a);a5(c[a>>2]|0)|0;ll(a);return}function dk(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+32|0;d=c[b>>2]|0;if((d|0)!=0){e=d;while(1){d=c[e+28>>2]|0;f=c[e+4>>2]|0;if((f|0)!=0){ll(f)}f=c[e>>2]|0;if((f|0)!=0){bB(f|0)|0}ll(e);if((d|0)==0){break}else{e=d}}}c[b>>2]=0;b=a+24|0;e=c[b>>2]|0;if((e|0)!=0){ep(e);lu(e);c[b>>2]=0}b=a+40|0;e=c[b>>2]|0;if((e|0)!=0){bB(e|0)|0;c[b>>2]=0}b=a+28|0;e=c[b>>2]|0;if((e|0)!=0){bL(e|0)|0;c[b>>2]=0}b=a+52|0;e=c[b>>2]|0;if((e|0)!=0){bW(e|0)|0;c[b>>2]=0}b=a+56|0;e=c[b>>2]|0;if((e|0)!=0){bW(e|0)|0;c[b>>2]=0}b=a+60|0;a=c[b>>2]|0;if((a|0)==0){return}bW(a|0)|0;c[b>>2]=0;return}function dl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d;d=i;i=i+16|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];c[d+8>>2]=c[g+8>>2];c[d+12>>2]=c[g+12>>2];g=d+8|0;cK[c[(c[b>>2]|0)+16>>2]&63](a,b,c[g>>2]|0,c[g+4>>2]|0,0,e);i=f;return}function dm(a){a=a|0;var b=0;c[a>>2]=17556;c[a+56>>2]=17576;b=a+4|0;c[b>>2]=17760;ep(a+36|0);e9(b|0);ft(a,18836);e3(a+56|0);return}function dn(a){a=a|0;var b=0;c[a>>2]=17556;c[a+56>>2]=17576;b=a+4|0;c[b>>2]=17760;ep(a+36|0);e9(b|0);ft(a,18836);e3(a+56|0);lu(a);return}function dp(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=17556;e=b+(d+56)|0;c[e>>2]=17576;f=b+(d+4)|0;c[f>>2]=17760;ep(b+(d+36)|0);e9(f);ft(a,18836);e3(e);return}function dq(a){a=a|0;var b=0,d=0,e=0,f=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;a=b+d|0;c[a>>2]=17556;e=b+(d+56)|0;c[e>>2]=17576;f=b+(d+4)|0;c[f>>2]=17760;ep(b+(d+36)|0);e9(f);ft(a,18836);e3(e);lu(a);return}function dr(a){a=a|0;c[a>>2]=17760;ep(a+32|0);e9(a|0);return}function ds(a){a=a|0;c[a>>2]=17760;ep(a+32|0);e9(a|0);lu(a);return}function dt(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;if((d|0)==-1){e=0;return e|0}f=b|0;g=b+12|0;h=b+8|0;i=(c[g>>2]|0)-(c[h>>2]|0)|0;j=b+24|0;k=c[j>>2]|0;l=b+28|0;m=c[l>>2]|0;if((k|0)==(m|0)){n=b+48|0;if((c[n>>2]&16|0)==0){e=-1;return e|0}o=b+20|0;p=c[o>>2]|0;q=b+44|0;r=(c[q>>2]|0)-p|0;s=b+32|0;eA(s,0);t=s;if((a[t]&1)==0){u=10}else{u=(c[s>>2]&-2)-1|0}es(s,u,0);u=a[t]|0;if((u&1)==0){v=s+1|0}else{v=c[b+40>>2]|0}s=u&255;if((s&1|0)==0){w=s>>>1}else{w=c[b+36>>2]|0}s=v+w|0;c[o>>2]=v;c[l>>2]=s;l=v+(k-p)|0;c[j>>2]=l;p=v+r|0;c[q>>2]=p;x=l;y=s;z=p;A=n}else{x=k;y=m;z=c[b+44>>2]|0;A=b+48|0}m=x+1|0;k=m>>>0<z>>>0?z:m;c[b+44>>2]=k;if((c[A>>2]&8|0)!=0){A=b+32|0;if((a[A]&1)==0){B=A+1|0}else{B=c[b+40>>2]|0}c[h>>2]=B;c[g>>2]=B+i;c[b+16>>2]=k}if((x|0)==(y|0)){e=cz[c[(c[b>>2]|0)+52>>2]&63](f,d&255)|0;return e|0}else{c[j>>2]=m;a[x]=d&255;e=d&255;return e|0}return 0}function du(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=b+32|0;eq(e,d)|0;d=b+44|0;c[d>>2]=0;f=b+48|0;g=c[f>>2]|0;if((g&8|0)!=0){h=e;i=a[e]|0;j=(i&1)==0;if(j){k=h+1|0}else{k=c[b+40>>2]|0}l=i&255;if((l&1|0)==0){m=l>>>1}else{m=c[b+36>>2]|0}l=k+m|0;c[d>>2]=l;if(j){n=h+1|0;o=h+1|0}else{h=c[b+40>>2]|0;n=h;o=h}c[b+8>>2]=o;c[b+12>>2]=n;c[b+16>>2]=l}if((g&16|0)==0){return}g=e;l=e;n=a[l]|0;o=n&255;if((o&1|0)==0){p=o>>>1}else{p=c[b+36>>2]|0}if((n&1)==0){c[d>>2]=g+1+p;q=10}else{c[d>>2]=(c[b+40>>2]|0)+p;q=(c[e>>2]&-2)-1|0}es(e,q,0);q=a[l]|0;if((q&1)==0){r=g+1|0;s=g+1|0}else{g=c[b+40>>2]|0;r=g;s=g}g=q&255;if((g&1|0)==0){t=g>>>1}else{t=c[b+36>>2]|0}g=b+24|0;c[g>>2]=s;c[b+20>>2]=s;c[b+28>>2]=r+t;if((c[f>>2]&3|0)==0){return}c[g>>2]=s+p;return}function dv(){ex(27640,7472,6503);a6(266,27640,u|0)|0;ex(27600,5064,644);a6(266,27600,u|0)|0;ex(27616,3032,752);a6(266,27616,u|0)|0;return}function dw(a,b,d,e,f,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0.0,w=0,x=0,y=0.0,z=0,A=0,C=0.0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0;l=i;i=i+144|0;m=a;a=i;i=i+12|0;i=i+7>>3<<3;c[a>>2]=c[m>>2];c[a+4>>2]=c[m+4>>2];c[a+8>>2]=c[m+8>>2];m=l|0;n=l+8|0;o=l+24|0;p=l+32|0;q=l+40|0;c[m>>2]=0;r=c[a>>2]|0;s=+(r>>>0>>>0);t=~~+bk(+s);u=c[a+4>>2]|0;v=+(u>>>0>>>0);w=~~+bk(+v);x=c[a+8>>2]|0;y=+(x>>>0>>>0);z=~~+bk(+y);A=ag(ag(ag(r,b)|0,u)|0,x)|0;C=+(j|0)*+(b|0)*y*v*s*(+(t|0)+ +(w|0)+ +(z|0))*5.0e-9;z=(f|0)==0;do{if(z){w=A<<2;t=lk(w)|0;D=t;E=lk(w)|0;F=E;G=lk(w)|0;H=G;I=lk(w)|0;w=I;if((t|0)==0|(E|0)==0|(G|0)==0|(I|0)==0){c[m>>2]=-1;bI(56)|0;J=0;K=0;L=0;M=0;N=0;O=0;P=H;Q=w;R=D;S=F;T=1198;break}else{U=0;V=0;W=H;X=w;Y=D;Z=F;_=A<<3;T=1162;break}}else{F=A<<3;D=lk(F)|0;w=D;H=lk(F)|0;I=H;if(!((D|0)==0|(H|0)==0)){U=I;V=w;W=0;X=0;Y=0;Z=0;_=F;T=1162;break}c[m>>2]=-2;bI(400)|0;$=0;aa=0;ab=0;ac=0;ad=0;ae=I;af=w;T=1199}}while(0);L1073:do{if((T|0)==1162){w=X;I=W;F=lk(_)|0;H=F;D=lk(_)|0;G=D;E=lk(_)|0;t=E;ah=lk(_)|0;ai=ah;L1075:do{if((F|0)==0|(D|0)==0|(E|0)==0|(ah|0)==0){c[m>>2]=-3;bI(56)|0;aj=0;ak=0;al=0;am=0;an=0;ao=0}else{ap=(A|0)>0;do{if(z){if(ap){aq=0}else{break}do{ar=Y+(aq<<2)|0;g[ar>>2]=+(bz()|0)*2.0*4.656612873077393e-10+-1.0;as=Z+(aq<<2)|0;g[as>>2]=+(bz()|0)*2.0*4.656612873077393e-10+-1.0;g[W+(aq<<2)>>2]=0.0;g[X+(aq<<2)>>2]=0.0;s=+g[ar>>2];h[H+(aq<<3)>>3]=s;v=+g[as>>2];h[G+(aq<<3)>>3]=v;h[t+(aq<<3)>>3]=s;h[ai+(aq<<3)>>3]=v;aq=aq+1|0;}while((aq|0)<(A|0))}else{if(ap){at=0}else{break}do{as=V+(at<<3)|0;g[as>>2]=+(bz()|0)*2.0*4.656612873077393e-10+-1.0;ar=V+(at<<3)+4|0;g[ar>>2]=+(bz()|0)*2.0*4.656612873077393e-10+-1.0;g[U+(at<<3)>>2]=0.0;g[U+(at<<3)+4>>2]=0.0;v=+g[as>>2];h[H+(at<<3)>>3]=v;s=+g[ar>>2];h[G+(at<<3)>>3]=s;h[t+(at<<3)>>3]=v;h[ai+(at<<3)>>3]=s;at=at+1|0;}while((at|0)<(A|0))}}while(0);ap=c[5934]|0;ar=n;as=a;c[ar>>2]=c[as>>2];c[ar+4>>2]=c[as+4>>2];c[ar+8>>2]=c[as+8>>2];as=df(ap,n,e,f,m)|0;if(!((as|0)!=0&(c[m>>2]|0)==0)){bI(32)|0;aj=0;ak=0;al=0;am=0;an=0;ao=as;break}ap=c[5934]|0;ar=A<<2;do{if(z){au=bc(ap|0,33,0,ar|0,Y|0,m|0)|0;if(!((au|0)!=0&(c[m>>2]|0)==0)){bI(8)|0;J=au;K=as;L=t;M=ai;N=H;O=G;P=W;Q=X;R=Y;S=Z;T=1198;break L1073}av=bc(c[5934]|0,33,0,ar|0,Z|0,m|0)|0;if(!((av|0)!=0&(c[m>>2]|0)==0)){bI(8)|0;aj=0;ak=av;al=au;am=0;an=0;ao=as;break L1075}if((k|0)!=0){aw=av;ax=au;ay=av;az=au;aA=0;aB=0;break}aC=bc(c[5934]|0,33,0,ar|0,I|0,m|0)|0;if(!((aC|0)!=0&(c[m>>2]|0)==0)){bI(8)|0;aj=aC;ak=av;al=au;am=0;an=0;ao=as;break L1075}aD=bc(c[5934]|0,33,0,ar|0,w|0,m|0)|0;if((aD|0)!=0&(c[m>>2]|0)==0){aw=aD;ax=aC;ay=av;az=au;aA=0;aB=0;break}bI(8)|0;aj=aC;ak=av;al=au;am=0;an=0;ao=as;break L1075}else{au=bc(ap|0,33,0,_|0,V|0,m|0)|0;if((au|0)==0){bI(8)|0;$=as;aa=t;ab=ai;ac=H;ad=G;ae=U;af=V;T=1199;break L1073}if((k|0)!=0){aw=0;ax=0;ay=0;az=0;aA=au;aB=au;break}av=bc(c[5934]|0,33,0,_|0,U|0,m|0)|0;if((av|0)!=0){aw=0;ax=0;ay=0;az=0;aA=av;aB=au;break}bI(8)|0;aj=0;ak=0;al=0;am=0;an=au;ao=as;break L1075}}while(0);c[m>>2]=0;bT(o|0,0)|0;ap=(j|0)>0;do{if(z){if(ap){aE=0}else{break}do{au=c3(c[5920]|0,as,b,d,az,ay,ax,aw,0,0,0)|0;c[m>>2]=c[m>>2]|au;aE=aE+1|0;}while((aE|0)<(j|0))}else{if(ap){aF=0}else{break}do{au=c2(c[5920]|0,as,b,d,aB,aA,0,0,0)|0;c[m>>2]=c[m>>2]|au;aF=aF+1|0;}while((aF|0)<(j|0))}}while(0);ap=bw(c[5920]|0)|0;au=c[m>>2]|ap;c[m>>2]=au;if((au|0)!=0){bI(384)|0;aj=ax;ak=ay;al=az;am=aA;an=aB;ao=as;break}bT(p|0,0)|0;s=+((c[p+4>>2]|0)-(c[o+4>>2]|0)+(((c[p>>2]|0)-(c[o>>2]|0)|0)*1e6|0)|0)*1.0e-6;au=q|0;bg(au|0,2624,(B=i,i=i+32|0,c[B>>2]=r,c[B+8>>2]=u,c[B+16>>2]=x,c[B+24>>2]=b,B)|0)|0;v=C/s;bD(2200,(B=i,i=i+32|0,c[B>>2]=au,c[B+8>>2]=1624,c[B+16>>2]=1208,h[B+24>>3]=v,B)|0)|0;au=c[5920]|0;if(z){ap=bR(au|0,ax|0,1,0,ar|0,I|0,0,0,0)|0;c[m>>2]=c[m>>2]|ap;ap=bR(c[5920]|0,aw|0,1,0,ar|0,w|0,0,0,0)|0;aG=c[m>>2]|ap}else{ap=bR(au|0,aA|0,1,0,_|0,U|0,0,0,0)|0;aG=c[m>>2]|ap}c[m>>2]=aG;if((aG|0)==0){aj=ax;ak=ay;al=az;am=aA;an=aB;ao=as;break}bI(352)|0;aj=ax;ak=ay;al=az;am=aA;an=aB;ao=as}}while(0);dj(ao);if(z){aH=Z;aI=Y;aJ=X;aK=W;aL=G;aM=H;aN=ai;aO=t;aP=al;aQ=ak;aR=aj;T=1201}else{aS=V;aT=U;aU=G;aV=H;aW=ai;aX=t;aY=an;aZ=am;T=1215}}}while(0);if((T|0)==1198){dj(K);aH=S;aI=R;aJ=Q;aK=P;aL=O;aM=N;aN=M;aO=L;aP=J;aQ=0;aR=0;T=1201}else if((T|0)==1199){dj($);aS=af;aT=ae;aU=ad;aV=ac;aW=ab;aX=aa;aY=0;aZ=0;T=1215}do{if((T|0)==1215){if((aS|0)!=0){ll(aS)}if((aT|0)!=0){ll(aT)}if((aY|0)!=0){bW(aY|0)|0}if(!((aZ|0)!=0&(k|0)==0)){a_=aU;a$=aV;a0=aW;a1=aX;break}bW(aZ|0)|0;a_=aU;a$=aV;a0=aW;a1=aX}else if((T|0)==1201){if((aI|0)!=0){ll(aI)}if((aH|0)!=0){ll(aH)}if((aK|0)!=0){ll(aK)}if((aJ|0)!=0){ll(aJ)}if((aP|0)!=0){bW(aP|0)|0}if((aQ|0)!=0){bW(aQ|0)|0}if(!((aR|0)!=0&(k|0)==0)){a_=aL;a$=aM;a0=aN;a1=aO;break}bW(aR|0)|0;a_=aL;a$=aM;a0=aN;a1=aO}}while(0);if((a$|0)!=0){ll(a$)}if((a_|0)!=0){ll(a_)}if((a1|0)!=0){ll(a1)}if((a0|0)==0){a2=c[m>>2]|0;i=l;return a2|0}ll(a0);a2=c[m>>2]|0;i=l;return a2|0}function dx(){var a=0,b=0,c=0,d=0;a=bQ(15152)|0;do{if((a|0)==0){b=1242}else{if((a_(a|0,14648)|0)==0){c=0;d=4;break}if((a_(a|0,14088)|0)==0){c=0;d=4;break}if((a_(a|0,7264)|0)==0){c=0;d=2;break}if((a_(a|0,7008)|0)==0){c=0;d=2;break}if((a_(a|0,6784)|0)==0){c=0;d=8;break}if((a_(a|0,6496)|0)==0){c=0;d=8;break}if((a_(a|0,6152)|0)==0){c=0;d=1}else{b=1242}}}while(0);if((b|0)==1242){c=0;d=4}return(K=c,d)|0}function dy(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;bI(a|0)|0;return}function dz(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;dX(26552,c[o>>2]|0,26608);c[6868]=18172;c[6870]=18192;c[6869]=0;h=c[4540]|0;e5(27472+h|0,26552);c[h+27544>>2]=0;c[h+27548>>2]=-1;h=c[t>>2]|0;fa(26456);c[6614]=18320;c[6622]=h;jo(g,26460);h=jx(g,26808)|0;j=h;jp(g);c[6623]=j;c[6624]=26616;a[26500]=(cB[c[(c[h>>2]|0)+28>>2]&255](j)|0)&1;c[6802]=18076;c[6803]=18096;j=c[4516]|0;e5(27208+j|0,26456);h=j+72|0;c[27208+h>>2]=0;g=j+76|0;c[27208+g>>2]=-1;k=c[r>>2]|0;fa(26504);c[6626]=18320;c[6634]=k;jo(f,26508);k=jx(f,26808)|0;l=k;jp(f);c[6635]=l;c[6636]=26624;a[26548]=(cB[c[(c[k>>2]|0)+28>>2]&255](l)|0)&1;c[6846]=18076;c[6847]=18096;e5(27384+j|0,26504);c[27384+h>>2]=0;c[27384+g>>2]=-1;l=c[(c[(c[6846]|0)-12>>2]|0)+27408>>2]|0;c[6824]=18076;c[6825]=18096;e5(27296+j|0,l);c[27296+h>>2]=0;c[27296+g>>2]=-1;c[(c[(c[6868]|0)-12>>2]|0)+27544>>2]=27208;g=(c[(c[6846]|0)-12>>2]|0)+27388|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[6846]|0)-12>>2]|0)+27456>>2]=27208;dK(26400,c[o>>2]|0,26632);c[6780]=18124;c[6782]=18144;c[6781]=0;g=c[4528]|0;e5(27120+g|0,26400);c[g+27192>>2]=0;c[g+27196>>2]=-1;g=c[t>>2]|0;fh(26304);c[6576]=18248;c[6584]=g;jo(e,26308);g=jx(e,26800)|0;h=g;jp(e);c[6585]=h;c[6586]=26640;a[26348]=(cB[c[(c[g>>2]|0)+28>>2]&255](h)|0)&1;c[6710]=18028;c[6711]=18048;h=c[4504]|0;e5(26840+h|0,26304);g=h+72|0;c[26840+g>>2]=0;e=h+76|0;c[26840+e>>2]=-1;l=c[r>>2]|0;fh(26352);c[6588]=18248;c[6596]=l;jo(d,26356);l=jx(d,26800)|0;j=l;jp(d);c[6597]=j;c[6598]=26648;a[26396]=(cB[c[(c[l>>2]|0)+28>>2]&255](j)|0)&1;c[6754]=18028;c[6755]=18048;e5(27016+h|0,26352);c[27016+g>>2]=0;c[27016+e>>2]=-1;j=c[(c[(c[6754]|0)-12>>2]|0)+27040>>2]|0;c[6732]=18028;c[6733]=18048;e5(26928+h|0,j);c[26928+g>>2]=0;c[26928+e>>2]=-1;c[(c[(c[6780]|0)-12>>2]|0)+27192>>2]=26840;e=(c[(c[6754]|0)-12>>2]|0)+27020|0;c[e>>2]=c[e>>2]|8192;c[(c[(c[6754]|0)-12>>2]|0)+27088>>2]=26840;i=b;return}function dA(a){a=a|0;fg(a|0);return}function dB(a){a=a|0;fg(a|0);lu(a);return}function dC(b,d){b=b|0;d=d|0;var e=0;cB[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=jx(d,26800)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cB[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function dD(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cA[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aN(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=1280;break}if((l|0)==2){m=-1;n=1278;break}else if((l|0)!=1){n=1276;break}}if((n|0)==1276){m=((aK(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==1278){i=b;return m|0}else if((n|0)==1280){i=b;return m|0}return 0}function dE(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+4|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;c[g>>2]=d;c[m>>2]=l;L1216:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=cH[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=1298;break}if((y|0)==3){B=1287;break}if(y>>>0>=2){A=-1;B=1296;break}x=(c[h>>2]|0)-t|0;if((aN(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=1297;break}if((y|0)!=1){break L1216}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y>>2<<2)|0;c[m>>2]=C;v=y;w=C}if((B|0)==1287){if((aN(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==1296){i=e;return A|0}else if((B|0)==1297){i=e;return A|0}else if((B|0)==1298){i=e;return A|0}}else{if((aN(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+384|0;b=d|0;e=d+8|0;f=d+16|0;g=d+32|0;h=d+40|0;j=d+368|0;c[e>>2]=1;k=f;c[k>>2]=c[3984];c[k+4>>2]=c[3985];c[k+8>>2]=c[3986];c[g>>2]=1;l=dx()|0;if(!((l|0)==4&(K|0)==0)){bI(312)|0;bf(0);return 0}l=a2(0,4,0,1,23728,d+48|0)|0;c[h>>2]=l;if((l|0)!=0){bI(280)|0;m=-1;i=d;return m|0}l=a7(0,1,23728,14,0,h|0)|0;c[5934]=l;if(!((l|0)!=0&(c[h>>2]|0)==0)){bI(256)|0;m=-1;i=d;return m|0}n=cd(l|0,c[5932]|0,0,0,h|0)|0;c[5920]=n;if(!((n|0)!=0&(c[h>>2]|0)==0)){bI(232)|0;n=c[5934]|0;a5(n|0)|0;m=-1;i=d;return m|0}n=bJ(c[5932]|0,4127,8,b|0,0)|0;c[h>>2]=n;if((n|0)!=0){bI(200)|0;n=c[5934]|0;a5(n|0)|0;n=c[5920]|0;aR(n|0)|0;m=-2;i=d;return m|0}n=c[b+4>>2]|0;c[b>>2]=(c[b>>2]|0)>>>20|n<<12;c[b+4>>2]=n>>>20|0<<12;n=d+56|0;a[n]=a[15928]|0;a[n+1|0]=a[15929|0]|0;a[n+2|0]=a[15930|0]|0;l=bF(4952,4936)|0;if((l|0)==0){bI(168)|0;o=c[5934]|0;a5(o|0)|0;o=c[5920]|0;aR(o|0)|0;m=-3;i=d;return m|0}o=d+168|0;L1260:do{if((a9(o|0,199,l|0)|0)==0){p=0}else{q=f|0;r=f+4|0;s=f+8|0;t=d+64|0;u=j;v=0;w=0;x=0;y=-1;z=0;while(1){A=v;C=w;D=x;E=y;while(1){L1266:while(1){F=a[o]|0;do{if(F<<24>>24!=0){if((a_(o|0,4808)|0)==0){break}else{G=o;H=F}while(1){if((H<<24>>24|0)==47){I=G+1|0;J=a[I]|0;if(J<<24>>24==47){break}else{G=I;H=J;continue}}else if((H<<24>>24|0)==0){break L1266}else{J=G+1|0;G=J;H=a[J]|0;continue}}}}while(0);if((a9(o|0,199,l|0)|0)==0){p=z;break L1260}}F=aM(o|0,n|0)|0;if((F|0)==0){L=A;M=C;N=D;O=E}else{J=A;I=C;P=D;Q=E;R=F;while(1){F=aM(0,n|0)|0;do{if((a_(R|0,4768)|0)==0){b3(F|0,4664,(B=i,i=i+8|0,c[B>>2]=q,B)|0)|0;S=aM(0,n|0)|0;b3(S|0,4664,(B=i,i=i+8|0,c[B>>2]=r,B)|0)|0;S=aM(0,n|0)|0;b3(S|0,4664,(B=i,i=i+8|0,c[B>>2]=s,B)|0)|0;T=Q;U=P;V=I;W=J}else{if((a_(R|0,4592)|0)==0){b3(F|0,4664,(B=i,i=i+8|0,c[B>>2]=g,B)|0)|0;T=Q;U=P;V=I;W=J;break}if((a_(R|0,4536)|0)==0){b3(F|0,4488,(B=i,i=i+8|0,c[B>>2]=t,B)|0)|0;if((a_(t|0,4432)|0)==0){T=-1;U=P;V=I;W=J;break}T=(a_(t|0,4360)|0)==0?1:Q;U=P;V=I;W=J;break}if((a_(R|0,4216)|0)==0){b3(F|0,4488,(B=i,i=i+8|0,c[B>>2]=t,B)|0)|0;if((a_(t|0,4168)|0)==0){T=Q;U=P;V=0;W=J;break}if((a_(t|0,4096)|0)==0){T=Q;U=P;V=1;W=J;break}T=Q;U=P;V=(a_(t|0,4080)|0)==0?3:I;W=J;break}if((a_(R|0,3840)|0)==0){b3(F|0,4488,(B=i,i=i+8|0,c[B>>2]=t,B)|0)|0;if((a_(t|0,3792)|0)==0){T=Q;U=P;V=I;W=0;break}T=Q;U=P;V=I;W=(a_(t|0,3e3)|0)==0?1:J;break}if((a_(R|0,2968)|0)==0){b3(F|0,4664,(B=i,i=i+8|0,c[B>>2]=e,B)|0)|0;T=Q;U=P;V=I;W=J;break}if((a_(R|0,2928)|0)!=0){T=Q;U=P;V=I;W=J;break}b3(F|0,4488,(B=i,i=i+8|0,c[B>>2]=t,B)|0)|0;if((a_(t|0,2888)|0)==0){T=Q;U=0;V=I;W=J;break}T=Q;U=(a_(t|0,2864)|0)==0?1:P;V=I;W=J}}while(0);F=aM(0,n|0)|0;if((F|0)==0){L=W;M=V;N=U;O=T;break}else{J=W;I=V;P=U;Q=T;R=F}}}R=c[s>>2]|0;X=c[g>>2]|0;Q=c[b>>2]|0;P=c[b+4>>2]|0;I=(N|0)==0;J=lP(ag(ag(ag(c[q>>2]<<3,c[r>>2]|0)|0,R)|0,X)|0,0,I?3:2,I?0:0)|0;I=K;R=I>>>20|0<<12;if(R>>>0<P>>>0|R>>>0==P>>>0&(J>>>20|I<<12)>>>0<Q>>>0){break}bI(80)|0;if((a9(o|0,199,l|0)|0)==0){p=z;break L1260}else{A=L;C=M;D=N;E=O}}c[u>>2]=c[k>>2];c[u+4>>2]=c[k+4>>2];c[u+8>>2]=c[k+8>>2];E=dw(j,X,O,M,L,c[e>>2]|0,N)|0;c[h>>2]=E;D=((E|0)!=0)+z|0;if((a9(o|0,199,l|0)|0)==0){p=D;break}else{v=L;w=M;x=N;y=O;z=D}}}}while(0);a5(c[5934]|0)|0;aR(c[5920]|0)|0;m=p;i=d;return m|0}function dG(a){a=a|0;f_(27208)|0;f_(27296)|0;f$(26840)|0;f$(26928)|0;return}function dH(a){a=a|0;return}function dI(a){a=a|0;var b=0;b=a+4|0;I=c[b>>2]|0,c[b>>2]=I+1,I;return}function dJ(a){a=a|0;return c[a+4>>2]|0}function dK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;fh(b|0);c[b>>2]=18648;c[b+32>>2]=d;c[b+40>>2]=e;jo(g,b+4|0);e=jx(g,26800)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){jp(g);i=f;return}iy(776);jp(g);i=f;return}function dL(a){a=a|0;fg(a|0);return}function dM(a){a=a|0;fg(a|0);lu(a);return}function dN(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=jx(d,26800)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}iy(776);return}function dO(a){a=a|0;return dR(a,0)|0}function dP(a){a=a|0;return dR(a,1)|0}function dQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}c[h>>2]=d;k=c[b+36>>2]|0;l=f|0;m=cH[c[(c[k>>2]|0)+12>>2]&31](k,c[b+40>>2]|0,h,h+4|0,e+24|0,l,f+8|0,g)|0;if((m|0)==3){a[l]=d&255;c[g>>2]=f+1}else if((m|0)==2|(m|0)==1){j=-1;i=e;return j|0}m=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=l>>>0){j=d;n=1389;break}f=b-1|0;c[g>>2]=f;if((b$(a[f]|0,c[m>>2]|0)|0)==-1){j=-1;n=1390;break}}if((n|0)==1389){i=e;return j|0}else if((n|0)==1390){i=e;return j|0}return 0}function dR(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=c[b+44>>2]|0;l=(k|0)>1?k:1;L1348:do{if((l|0)>0){k=b+32|0;m=0;while(1){n=a3(c[k>>2]|0)|0;if((n|0)==-1){o=-1;break}a[f+m|0]=n&255;m=m+1|0;if((m|0)>=(l|0)){break L1348}}i=e;return o|0}}while(0);L1355:do{if((a[b+48|0]&1)==0){m=b+40|0;k=b+36|0;n=f|0;p=g+4|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[k>>2]|0;w=f+r|0;x=cH[c[(c[t>>2]|0)+16>>2]&31](t,s,n,w,h,g,p,j)|0;if((x|0)==2){o=-1;y=1413;break}else if((x|0)==3){y=1401;break}else if((x|0)!=1){z=r;break L1355}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=1414;break}v=a3(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=1412;break}a[w]=v&255;r=r+1|0}if((y|0)==1412){i=e;return o|0}else if((y|0)==1413){i=e;return o|0}else if((y|0)==1414){i=e;return o|0}else if((y|0)==1401){c[g>>2]=a[n]|0;z=r;break}}else{c[g>>2]=a[f|0]|0;z=l}}while(0);L1369:do{if(!d){l=b+32|0;y=z;while(1){if((y|0)<=0){break L1369}j=y-1|0;if((b$(a[f+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;break}else{y=j}}i=e;return o|0}}while(0);o=c[g>>2]|0;i=e;return o|0}function dS(a){a=a|0;e9(a|0);return}function dT(a){a=a|0;e9(a|0);lu(a);return}function dU(b,d){b=b|0;d=d|0;var e=0;cB[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=jx(d,26808)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cB[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function dV(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cA[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((aN(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=1425;break}if((l|0)==2){m=-1;n=1423;break}else if((l|0)!=1){n=1421;break}}if((n|0)==1421){m=((aK(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==1423){i=b;return m|0}else if((n|0)==1425){i=b;return m|0}return 0}function dW(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;if(!k){l=g+1|0;m=b+24|0;n=b+20|0;c[n>>2]=g;o=b+28|0;c[o>>2]=l;a[g]=d&255;c[m>>2]=l;L1392:do{if((a[b+44|0]&1)==0){p=f|0;c[h>>2]=p;q=b+36|0;r=b+40|0;s=f+8|0;t=f;u=b+32|0;v=g;w=l;while(1){x=c[q>>2]|0;y=cH[c[(c[x>>2]|0)+12>>2]&31](x,c[r>>2]|0,v,w,j,p,s,h)|0;z=c[n>>2]|0;if((c[j>>2]|0)==(z|0)){A=-1;B=1443;break}if((y|0)==3){B=1432;break}if(y>>>0>=2){A=-1;B=1441;break}x=(c[h>>2]|0)-t|0;if((aN(p|0,1,x|0,c[u>>2]|0)|0)!=(x|0)){A=-1;B=1442;break}if((y|0)!=1){break L1392}y=c[j>>2]|0;x=c[m>>2]|0;c[n>>2]=y;c[o>>2]=x;C=y+(x-y)|0;c[m>>2]=C;v=y;w=C}if((B|0)==1432){if((aN(z|0,1,1,c[u>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}else if((B|0)==1441){i=e;return A|0}else if((B|0)==1442){i=e;return A|0}else if((B|0)==1443){i=e;return A|0}}else{if((aN(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{A=-1}i=e;return A|0}}while(0);c[m>>2]=0;c[n>>2]=0;c[o>>2]=0}A=k?0:d;i=e;return A|0}function dX(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+8|0;g=f|0;fa(b|0);c[b>>2]=18720;c[b+32>>2]=d;c[b+40>>2]=e;jo(g,b+4|0);e=jx(g,26808)|0;d=e;h=b+36|0;c[h>>2]=d;j=b+44|0;c[j>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[h>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[j>>2]|0)<=8){jp(g);i=f;return}iy(776);jp(g);i=f;return}function dY(a){a=a|0;e9(a|0);return}function dZ(a){a=a|0;e9(a|0);lu(a);return}function d_(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=jx(d,26808)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cB[c[(c[e>>2]|0)+24>>2]&255](d)|0;d=c[f>>2]|0;a[b+48|0]=(cB[c[(c[d>>2]|0)+28>>2]&255](d)|0)&1;if((c[g>>2]|0)<=8){return}iy(776);return}function d$(a){a=a|0;return d2(a,0)|0}function d0(a){a=a|0;return d2(a,1)|0}function d1(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;if((d|0)==-1){j=-1;i=e;return j|0}k=d&255;a[h]=k;l=c[b+36>>2]|0;m=f|0;n=cH[c[(c[l>>2]|0)+12>>2]&31](l,c[b+40>>2]|0,h,h+1|0,e+24|0,m,f+8|0,g)|0;if((n|0)==3){a[m]=k;c[g>>2]=f+1}else if((n|0)==2|(n|0)==1){j=-1;i=e;return j|0}n=b+32|0;while(1){b=c[g>>2]|0;if(b>>>0<=m>>>0){j=d;o=1469;break}f=b-1|0;c[g>>2]=f;if((b$(a[f]|0,c[n>>2]|0)|0)==-1){j=-1;o=1470;break}}if((o|0)==1470){i=e;return j|0}else if((o|0)==1469){i=e;return j|0}return 0}function d2(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[b+44>>2]|0;m=(l|0)>1?l:1;L1442:do{if((m|0)>0){l=b+32|0;n=0;while(1){o=a3(c[l>>2]|0)|0;if((o|0)==-1){p=-1;break}a[g+n|0]=o&255;n=n+1|0;if((n|0)>=(m|0)){break L1442}}i=f;return p|0}}while(0);L1449:do{if((a[b+48|0]&1)==0){n=b+40|0;l=b+36|0;o=g|0;q=h+1|0;r=b+32|0;s=m;while(1){t=c[n>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[l>>2]|0;x=g+s|0;y=cH[c[(c[u>>2]|0)+16>>2]&31](u,t,o,x,j,h,q,k)|0;if((y|0)==2){p=-1;z=1491;break}else if((y|0)==3){z=1483;break}else if((y|0)!=1){A=s;break L1449}y=c[n>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){p=-1;z=1493;break}w=a3(c[r>>2]|0)|0;if((w|0)==-1){p=-1;z=1494;break}a[x]=w&255;s=s+1|0}if((z|0)==1491){i=f;return p|0}else if((z|0)==1483){a[h]=a[o]|0;A=s;break}else if((z|0)==1493){i=f;return p|0}else if((z|0)==1494){i=f;return p|0}}else{a[h]=a[g|0]|0;A=m}}while(0);L1463:do{if(!e){m=b+32|0;z=A;while(1){if((z|0)<=0){break L1463}k=z-1|0;if((b$(d[g+k|0]|0|0,c[m>>2]|0)|0)==-1){p=-1;break}else{z=k}}i=f;return p|0}}while(0);p=d[h]|0;i=f;return p|0}function d3(){dz(0);a6(146,27560|0,u|0)|0;return}function d4(a){a=a|0;var b=0,d=0;b=a+4|0;if(((I=c[b>>2]|0,c[b>>2]=I+ -1,I)|0)!=0){d=0;return d|0}cx[c[(c[a>>2]|0)+8>>2]&511](a);d=1;return d|0}function d5(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=16088;d=a+4|0;if((d|0)==0){return}a=lB(b|0)|0;e=lr(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;lA(a|0,b|0)|0;return}function d6(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=16088;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;lu(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;lu(e);return}lv(d);e=a;lu(e);return}function d7(a){a=a|0;var b=0;c[a>>2]=16088;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lv(a);return}function d8(b,d){b=b|0;d=d|0;var e=0,f=0;c[b>>2]=16024;e=b+4|0;if((e|0)==0){return}if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=lB(f|0)|0;b=lr(d+13|0)|0;c[b+4>>2]=d;c[b>>2]=d;d=b+12|0;c[e>>2]=d;c[b+8>>2]=0;lA(d|0,f|0)|0;return}function d9(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=16024;d=a+4|0;if((d|0)==0){return}a=lB(b|0)|0;e=lr(a+13|0)|0;c[e+4>>2]=a;c[e>>2]=a;a=e+12|0;c[d>>2]=a;c[e+8>>2]=0;lA(a|0,b|0)|0;return}function ea(a){a=a|0;return}function eb(a){a=a|0;return c[a+4>>2]|0}function ec(a){a=a|0;c[a>>2]=17976;return}function ed(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function ee(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function ef(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=16024;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;lu(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;lu(e);return}lv(d);e=a;lu(e);return}function eg(a){a=a|0;var b=0;c[a>>2]=16024;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((I=c[a>>2]|0,c[a>>2]=I+ -1,I)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}lv(a);return}function eh(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=16088;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((I=c[d>>2]|0,c[d>>2]=I+ -1,I)-1|0)>=0){e=a;lu(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;lu(e);return}lv(d);e=a;lu(e);return}function ei(a){a=a|0;lu(a);return}function ej(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;cE[c[(c[a>>2]|0)+12>>2]&7](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function ek(a,b,c){a=a|0;b=b|0;c=c|0;b=bX(c|0)|0;ex(a,b,lB(b|0)|0);return}function el(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;h=f;j=i;i=i+12|0;i=i+7>>3<<3;k=e|0;l=c[k>>2]|0;if((l|0)==0){m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];lC(h|0,0,12);i=g;return}n=d[h]|0;if((n&1|0)==0){o=n>>>1}else{o=c[f+4>>2]|0}if((o|0)==0){p=l}else{ez(f,4984)|0;p=c[k>>2]|0}k=c[e+4>>2]|0;cE[c[(c[k>>2]|0)+24>>2]&7](j,k,p);p=a[j]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}k=p&255;if((k&1|0)==0){r=k>>>1}else{r=c[j+4>>2]|0}eB(f,q,r)|0;ep(j);m=b;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];lC(h|0,0,12);i=g;return}function em(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+32|0;f=b;b=i;i=i+8|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];f=e|0;g=e+16|0;ex(g,d,lB(d|0)|0);el(f,b,g);d8(a|0,f);ep(f);ep(g);c[a>>2]=18216;g=b;b=a+8|0;a=c[g+4>>2]|0;c[b>>2]=c[g>>2];c[b+4>>2]=a;i=e;return}function en(a){a=a|0;eg(a|0);lu(a);return}function eo(a){a=a|0;eg(a|0);return}function ep(b){b=b|0;if((a[b]&1)==0){return}lu(c[b+8>>2]|0);return}function eq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(d|0)){return b|0}e=a[d]|0;if((e&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}g=e&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}d=b;g=b;e=a[g]|0;if((e&1)==0){i=10;j=e}else{e=c[b>>2]|0;i=(e&-2)-1|0;j=e&255}if(i>>>0<h>>>0){e=j&255;if((e&1|0)==0){k=e>>>1}else{k=c[b+4>>2]|0}eG(b,i,h-i|0,k,0,k,h,f);return b|0}if((j&1)==0){l=d+1|0}else{l=c[b+8>>2]|0}lE(l|0,f|0,h|0);a[l+h|0]=0;if((a[g]&1)==0){a[g]=h<<1&255;return b|0}else{c[b+4>>2]=h;return b|0}return 0}function er(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=lB(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}eG(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}lE(l|0,d|0,e|0);a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function es(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){h=d-i|0;et(b,h,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1&255;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function et(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){eH(b,h,d-h+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}lC(l+j|0,e|0,d|0);e=j+d|0;if((a[f]&1)==0){a[f]=e<<1&255}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function eu(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e;if((c[a>>2]|0)==1){do{aX(23632,23624)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;g;cx[d&511](b);h;c[a>>2]=-1;i;bP(23632)|0;return}function ev(a){a=a|0;a=cj(8)|0;d5(a,1416);c[a>>2]=16056;bA(a|0,22040,34)}function ew(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if((f|0)==-1){ev(0)}if(f>>>0<11){a[b]=f<<1&255;g=b+1|0}else{d=f+16&-16;h=lq(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}lD(g|0,e|0,f)|0;a[g+f|0]=0;return}function ex(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((e|0)==-1){ev(0)}if(e>>>0<11){a[b]=e<<1&255;f=b+1|0;lD(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=lq(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;lD(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function ey(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((d|0)==-1){ev(0)}if(d>>>0<11){a[b]=d<<1&255;f=b+1|0;lC(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}else{h=d+16&-16;i=lq(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=d;f=i;lC(f|0,e|0,d|0);g=f+d|0;a[g]=0;return}}function ez(a,b){a=a|0;b=b|0;return eB(a,b,lB(b|0)|0)|0}function eA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){eH(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}a[k+i|0]=d;d=i+1|0;a[k+d|0]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function eB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){eG(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}i=k+j|0;lD(i|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1&255}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function eC(b){b=b|0;if((a[b]&1)==0){return}lu(c[b+8>>2]|0);return}function eD(a,b){a=a|0;b=b|0;return eE(a,b,kZ(b)|0)|0}function eE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}fp(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}k$(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1&255;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function eF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((d|0)==-1){ev(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{if(g>>>0>h>>>0){p=lq(k)|0}else{p=lq(k)|0}h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}h=r+1|0;lD(l|0,m|0,h)|0;if(n){lu(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1&255;return}}function eG(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-3-d|0)>>>0<e>>>0){ev(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483631){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11){o=11;break}o=n+16&-16}else{o=-2}}while(0);e=lq(o)|0;if((g|0)!=0){lD(e|0,k|0,g)|0}if((i|0)!=0){n=e+g|0;lD(n|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g)|0;l=k+(h+g)|0;lD(n|0,l|0,f)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}lu(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function eH(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-3-d|0)>>>0<e>>>0){ev(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483631){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11){n=11;break}n=m+16&-16}else{n=-2}}while(0);e=lq(n)|0;if((g|0)!=0){lD(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g)|0;i=j+(h+g)|0;lD(m|0,i|0,f)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}lu(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function eI(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((f|0)==-1){ev(0)}if(f>>>0<11){a[b]=e<<1&255;g=b+1|0;lD(g|0,d|0,e)|0;h=g+e|0;a[h]=0;return}else{i=f+16&-16;f=lq(i)|0;c[b+8>>2]=f;c[b>>2]=i|1;c[b+4>>2]=e;g=f;lD(g|0,d|0,e)|0;h=g+e|0;a[h]=0;return}}function eJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741822){ev(0)}if(e>>>0<2){a[b]=e<<1&255;f=b+4|0;g=k_(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=lq(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=k_(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function eK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741822){ev(0)}if(d>>>0<2){a[b]=d<<1&255;f=b+4|0;g=k0(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=lq(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=k0(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function eL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(d>>>0>1073741822){ev(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;if(f>>>0>g>>>0){o=lq(d)|0}else{o=lq(d)|0}d=h&1;if(d<<24>>24==0){p=b+4|0}else{p=c[b+8>>2]|0}k=o;l=p;m=d<<24>>24!=0;n=1}d=h&255;if((d&1|0)==0){q=d>>>1}else{q=c[b+4>>2]|0}k_(k,l,q+1|0)|0;if(m){lu(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=k;return}else{a[e]=i<<1&255;return}}function eM(a,b){a=a|0;b=b|0;return}function eN(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function eO(a){a=a|0;return 0}function eP(a){a=a|0;return 0}function eQ(a){a=a|0;return-1|0}function eR(a,b){a=a|0;b=b|0;return-1|0}function eS(a,b){a=a|0;b=b|0;return-1|0}function eT(a,b){a=a|0;b=b|0;return}function eU(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function eV(a){a=a|0;return 0}function eW(a){a=a|0;return 0}function eX(a){a=a|0;return-1|0}function eY(a,b){a=a|0;b=b|0;return-1|0}function eZ(a,b){a=a|0;b=b|0;return-1|0}function e_(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function e$(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function e0(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function e1(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function e2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}if((i|0)==(g|0)){fq(b,g,1,g,g,0,0);j=a[e]|0}else{j=h}if((j&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}c[k+(i<<2)>>2]=d;d=i+1|0;c[k+(d<<2)>>2]=0;if((a[e]&1)==0){a[e]=d<<1&255;return}else{c[b+4>>2]=d;return}}function e3(a){a=a|0;fs(a|0);return}function e4(a,b){a=a|0;b=b|0;jo(a,b+28|0);return}function e5(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;lC(a+32|0,0,40);if((b|0)==0){return}jw(b);return}function e6(a){a=a|0;fs(a|0);return}function e7(a){a=a|0;c[a>>2]=17904;jp(a+4|0);lu(a);return}function e8(a){a=a|0;c[a>>2]=17904;jp(a+4|0);return}function e9(a){a=a|0;c[a>>2]=17904;jp(a+4|0);return}function fa(a){a=a|0;c[a>>2]=17904;jw(a+4|0);lC(a+8|0,0,24);return}function fb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=cB[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((k|0)==-1){g=d;m=1964;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=1963;break}}if((m|0)==1964){return g|0}else if((m|0)==1963){return g|0}return 0}function fc(a){a=a|0;var b=0,e=0;if((cB[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function fd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((cz[c[(c[g>>2]|0)+52>>2]&63](b,d[l]|0)|0)==-1){h=k;n=1979;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=1977;break}}if((n|0)==1979){return h|0}else if((n|0)==1977){return h|0}return 0}function fe(a){a=a|0;c[a>>2]=17832;jp(a+4|0);lu(a);return}function ff(a){a=a|0;c[a>>2]=17832;jp(a+4|0);return}function fg(a){a=a|0;c[a>>2]=17832;jp(a+4|0);return}function fh(a){a=a|0;c[a>>2]=17832;jw(a+4|0);lC(a+8|0,0,24);return}function fi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=cB[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((j|0)==-1){f=b;l=1993;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=1991;break}}if((l|0)==1991){return f|0}else if((l|0)==1993){return f|0}return 0}function fj(a){a=a|0;var b=0,d=0;if((cB[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function fk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((cz[c[(c[e>>2]|0)+52>>2]&63](a,c[j>>2]|0)|0)==-1){f=i;l=2006;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=2008;break}}if((l|0)==2006){return f|0}else if((l|0)==2008){return f|0}return 0}function fl(a){a=a|0;fs(a+8|0);lu(a);return}function fm(a){a=a|0;fs(a+8|0);return}function fn(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fs(b+(d+8)|0);lu(b+d|0);return}function fo(a){a=a|0;fs(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function fp(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741821-d|0)>>>0<e>>>0){ev(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870895){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2){o=2;break}o=n+4&-4}else{o=1073741822}}while(0);e=lq(o<<2)|0;if((g|0)!=0){k_(e,k,g)|0}if((i|0)!=0){n=e+(g<<2)|0;k_(n,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){f=j-g|0;n=e+(i+g<<2)|0;l=k+(h+g<<2)|0;k_(n,l,f)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}lu(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function fq(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741821-d|0)>>>0<e>>>0){ev(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870895){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2){n=2;break}n=m+4&-4}else{n=1073741822}}while(0);e=lq(n<<2)|0;if((g|0)!=0){k_(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){f=m-g|0;m=e+(i+g<<2)|0;i=j+(h+g<<2)|0;k_(m,i,f)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}lu(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function fr(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=cj(16)|0;do{if((a[27728]|0)==0){if((bp(27728)|0)==0){break}ec(25760);c[6440]=17600;a6(70,25760,u|0)|0}}while(0);b=lH(25760,0,32)|0;d=K;c[f>>2]=b&0|1;c[f+4>>2]=d|0;em(e,f,5048);c[e>>2]=16736;bA(e|0,22584,28)}function fs(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=16712;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;if((b|0)!=0){f=b;do{f=f-1|0;cE[c[(c[d>>2]|0)+(f<<2)>>2]&7](0,a,c[(c[e>>2]|0)+(f<<2)>>2]|0);}while((f|0)!=0)}jp(a+28|0);ll(c[d>>2]|0);ll(c[e>>2]|0);ll(c[a+48>>2]|0);ll(c[a+60>>2]|0);return}function ft(a,b){a=a|0;b=b|0;return}function fu(a){a=a|0;return 7128|0}function fv(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L2138:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=2076;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=2074;break}if(l<<24>>24<k<<24>>24){i=1;j=2077;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L2138}else{b=k;h=l}}if((j|0)==2074){return i|0}else if((j|0)==2077){return i|0}else if((j|0)==2076){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function fw(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function fx(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L2157:do{if((e|0)==(f|0)){g=b}else{a=b;h=e;while(1){if((a|0)==(d|0)){i=-1;j=2090;break}k=c[a>>2]|0;l=c[h>>2]|0;if((k|0)<(l|0)){i=-1;j=2093;break}if((l|0)<(k|0)){i=1;j=2091;break}k=a+4|0;l=h+4|0;if((l|0)==(f|0)){g=k;break L2157}else{a=k;h=l}}if((j|0)==2090){return i|0}else if((j|0)==2091){return i|0}else if((j|0)==2093){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function fy(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function fz(a){a=a|0;fs(a+8|0);lu(a);return}function fA(a){a=a|0;fs(a+8|0);return}function fB(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fs(b+(d+8)|0);lu(b+d|0);return}function fC(a){a=a|0;fs(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function fD(a){a=a|0;fs(a+4|0);lu(a);return}function fE(a){a=a|0;fs(a+4|0);return}function fF(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fs(b+(d+4)|0);lu(b+d|0);return}function fG(a){a=a|0;fs(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function fH(a){a=a|0;fs(a+4|0);lu(a);return}function fI(a){a=a|0;fs(a+4|0);return}function fJ(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;fs(b+(d+4)|0);lu(b+d|0);return}function fK(a){a=a|0;fs(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function fL(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){ex(a,14520,35);return}else{ek(a,b|0,c);return}}function fM(a){a=a|0;ea(a|0);return}function fN(a){a=a|0;eo(a|0);lu(a);return}function fO(a){a=a|0;eo(a|0);return}function fP(a){a=a|0;fs(a);lu(a);return}function fQ(a){a=a|0;ea(a|0);lu(a);return}function fR(a){a=a|0;dH(a|0);lu(a);return}function fS(a){a=a|0;dH(a|0);return}function fT(a){a=a|0;dH(a|0);return}function fU(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;do{if((g|0)==-1){ev(b);h=2129}else{if(g>>>0>=11){h=2129;break}a[b]=g<<1&255;i=b+1|0}}while(0);if((h|0)==2129){h=g+16&-16;j=lq(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=g;i=j}if((e|0)==(f|0)){k=i;a[k]=0;return}j=f+(-d|0)|0;d=i;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=i+j|0;a[k]=0;return}function fV(a){a=a|0;dH(a|0);lu(a);return}function fW(a){a=a|0;dH(a|0);return}function fX(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741822){ev(b)}if(h>>>0<2){a[b]=g>>>1&255;i=b+4|0}else{g=h+4&-4;j=lq(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function fY(a){a=a|0;dH(a|0);lu(a);return}function fZ(a){a=a|0;dH(a|0);return}function f_(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){f_(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;fr(h+k|0,c[h+(k+16)>>2]|1)}}while(0);f0(e);i=d;return b|0}function f$(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)!=0){f$(k)|0}a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[k>>2]|0)+24>>2]&255](k)|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;fr(h+k|0,c[h+(k+16)>>2]|1)}}while(0);f1(e);i=d;return b|0}function f0(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bu()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;fr(d+b|0,c[d+(b+16)>>2]|1);return}function f1(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bu()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;if((cB[c[(c[e>>2]|0)+24>>2]&255](e)|0)!=-1){return}e=c[b>>2]|0;b=c[(c[e>>2]|0)-12>>2]|0;d=e;fr(d+b|0,c[d+(b+16)>>2]|1);return}function f2(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=lk(m)|0;if((o|0)!=0){p=o;q=o;break}lz();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){z=r;break}if((cB[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){A=z;B=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){C=m;break}c[b>>2]=0;C=0}else{C=m}}while(0);A=c[u>>2]|0;B=C}D=(B|0)==0;if(!((r^D)&(s|0)!=0)){break}m=c[A+12>>2]|0;if((m|0)==(c[A+16>>2]|0)){E=(cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[m]|0}if(k){F=E}else{F=cz[c[(c[e>>2]|0)+12>>2]&63](h,E)|0}do{if(n){G=x;H=s}else{m=t+1|0;L2343:do{if(k){y=s;o=x;w=p;v=0;I=f;while(1){do{if((a[w]|0)==1){J=I;if((a[J]&1)==0){K=I+1|0}else{K=c[I+8>>2]|0}if(F<<24>>24!=(a[K+t|0]|0)){a[w]=0;L=v;M=o;N=y-1|0;break}O=d[J]|0;if((O&1|0)==0){P=O>>>1}else{P=c[I+4>>2]|0}if((P|0)!=(m|0)){L=1;M=o;N=y;break}a[w]=2;L=1;M=o+1|0;N=y-1|0}else{L=v;M=o;N=y}}while(0);O=I+12|0;if((O|0)==(g|0)){Q=N;R=M;S=L;break L2343}y=N;o=M;w=w+1|0;v=L;I=O}}else{I=s;v=x;w=p;o=0;y=f;while(1){do{if((a[w]|0)==1){O=y;if((a[O]&1)==0){T=y+1|0}else{T=c[y+8>>2]|0}if(F<<24>>24!=(cz[c[(c[e>>2]|0)+12>>2]&63](h,a[T+t|0]|0)|0)<<24>>24){a[w]=0;U=o;V=v;W=I-1|0;break}J=d[O]|0;if((J&1|0)==0){X=J>>>1}else{X=c[y+4>>2]|0}if((X|0)!=(m|0)){U=1;V=v;W=I;break}a[w]=2;U=1;V=v+1|0;W=I-1|0}else{U=o;V=v;W=I}}while(0);J=y+12|0;if((J|0)==(g|0)){Q=W;R=V;S=U;break L2343}I=W;v=V;w=w+1|0;o=U;y=J}}}while(0);if(!S){G=R;H=Q;break}m=c[u>>2]|0;y=m+12|0;o=c[y>>2]|0;if((o|0)==(c[m+16>>2]|0)){w=c[(c[m>>2]|0)+40>>2]|0;cB[w&255](m)|0}else{c[y>>2]=o+1}if((R+Q|0)>>>0<2|n){G=R;H=Q;break}o=t+1|0;y=R;m=p;w=f;while(1){do{if((a[m]|0)==2){v=d[w]|0;if((v&1|0)==0){Y=v>>>1}else{Y=c[w+4>>2]|0}if((Y|0)==(o|0)){Z=y;break}a[m]=0;Z=y-1|0}else{Z=y}}while(0);v=w+12|0;if((v|0)==(g|0)){G=Z;H=Q;break}else{y=Z;m=m+1|0;w=v}}}}while(0);t=t+1|0;x=G;s=H}do{if((A|0)==0){_=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){_=A;break}if((cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[u>>2]=0;_=0;break}else{_=c[u>>2]|0;break}}}while(0);u=(_|0)==0;do{if(D){$=2317}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(u){break}else{$=2319;break}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[b>>2]=0;$=2317;break}else{if(u^(B|0)==0){break}else{$=2319;break}}}}while(0);if(($|0)==2317){if(u){$=2319}}if(($|0)==2319){c[j>>2]=c[j>>2]|2}L2422:do{if(n){$=2324}else{u=f;B=p;while(1){if((a[B]|0)==2){aa=u;break L2422}b=u+12|0;if((b|0)==(g|0)){$=2324;break L2422}u=b;B=B+1|0}}}while(0);if(($|0)==2324){c[j>>2]=c[j>>2]|4;aa=g}if((q|0)==0){i=l;return aa|0}ll(q);i=l;return aa|0}function f3(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cw[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==0){a[j]=0}else if((w|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}e4(r,g);q=r|0;r=c[q>>2]|0;if((c[6778]|0)!=-1){c[m>>2]=27112;c[m+4>>2]=12;c[m+8>>2]=0;eu(27112,m,98)}m=(c[6779]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;d4(n)|0;e4(s,g);n=s|0;p=c[n>>2]|0;if((c[6682]|0)!=-1){c[l>>2]=26728;c[l+4>>2]=12;c[l+8>>2]=0;eu(26728,l,98)}d=(c[6683]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;d4(z)|0;z=t|0;A=x;cy[c[(c[A>>2]|0)+24>>2]&127](z,y);cy[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(f2(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];ep(t+12|0);ep(t|0);i=k;return}}while(0);o=cj(4)|0;k1(o);bA(o|0,22008,138)}}while(0);k=cj(4)|0;k1(k);bA(k|0,22008,138)}function f4(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((a[i]|0)==b<<24>>24){s=i;break}else{i=i+1|0}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[23640+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[23640+i|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function f5(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){k=j>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){return}do{if((d|0)==(e|0)){l=i}else{k=e-4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=i;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n-4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=g+1|0}else{o=c[b+8>>2]|0}g=l&255;if((g&1|0)==0){p=g>>>1}else{p=c[b+4>>2]|0}b=e-4|0;e=a[o]|0;g=e<<24>>24;l=e<<24>>24<1|e<<24>>24==127;L2532:do{if(b>>>0>d>>>0){e=o+p|0;h=o;n=d;m=g;i=l;while(1){if(!i){if((m|0)!=(c[n>>2]|0)){break}}k=(e-h|0)>1?h+1|0:h;j=n+4|0;q=a[k]|0;r=q<<24>>24;s=q<<24>>24<1|q<<24>>24==127;if(j>>>0<b>>>0){h=k;n=j;m=r;i=s}else{t=r;u=s;break L2532}}c[f>>2]=4;return}else{t=g;u=l}}while(0);if(u){return}u=c[b>>2]|0;if(!(t>>>0<u>>>0|(u|0)==0)){return}c[f>>2]=4;return}function f6(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l|0;f8(n,h,t,m);h=o|0;lC(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2555:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2442}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2555}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2442;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2555}}}}while(0);if((y|0)==2442){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f4(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=f7(h,c[p>>2]|0,j,u)|0;f5(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2600:do{if(C){y=2472}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2472;break L2600}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);do{if((y|0)==2472){if(l){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ep(n);i=e;return}function f7(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a4()|0)>>2]|0;c[(a4()|0)>>2]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=ca(b|0,h|0,f|0,c[6438]|0)|0;f=K;b=c[(a4()|0)>>2]|0;if((b|0)==0){c[(a4()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=-1;h=0;if((b|0)==34|((f|0)<(d|0)|(f|0)==(d|0)&l>>>0<-2147483648>>>0)|((f|0)>(h|0)|(f|0)==(h|0)&l>>>0>2147483647>>>0)){c[e>>2]=4;e=0;j=(f|0)>(e|0)|(f|0)==(e|0)&l>>>0>0>>>0?2147483647:-2147483648;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function f8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;e4(k,d);d=k|0;k=c[d>>2]|0;if((c[6778]|0)!=-1){c[j>>2]=27112;c[j+4>>2]=12;c[j+8>>2]=0;eu(27112,j,98)}j=(c[6779]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+32>>2]|0;cL[o&15](n,23640,23666,e)|0;n=c[d>>2]|0;if((c[6682]|0)!=-1){c[h>>2]=26728;c[h+4>>2]=12;c[h+8>>2]=0;eu(26728,h,98)}o=(c[6683]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;a[f]=cB[c[(c[p>>2]|0)+16>>2]&255](q)|0;cy[c[(c[p>>2]|0)+20>>2]&127](b,q);q=c[d>>2]|0;d4(q)|0;i=g;return}}while(0);o=cj(4)|0;k1(o);bA(o|0,22008,138)}}while(0);g=cj(4)|0;k1(g);bA(g|0,22008,138)}function f9(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}t=l|0;f8(n,h,t,m);h=o|0;lC(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2661:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2531}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2661}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2531;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2661}}}}while(0);if((y|0)==2531){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f4(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=ga(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f5(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2706:do{if(C){y=2561}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2561;break L2706}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);do{if((y|0)==2561){if(l){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ep(n);i=e;return}function ga(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}l=c[(a4()|0)>>2]|0;c[(a4()|0)>>2]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);m=ca(b|0,h|0,f|0,c[6438]|0)|0;f=K;b=c[(a4()|0)>>2]|0;if((b|0)==0){c[(a4()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;i=g;return(K=j,k)|0}if((b|0)!=34){j=f;k=m;i=g;return(K=j,k)|0}c[e>>2]=4;e=0;b=(f|0)>(e|0)|(f|0)==(e|0)&m>>>0>0>>>0;j=b?2147483647:-2147483648;k=b?-1:0;i=g;return(K=j,k)|0}function gb(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=i;i=i+280|0;m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=f+96|0;r=f+104|0;s=f+264|0;t=f+272|0;u=c[j+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==0){v=0}else if((u|0)==64){v=8}else{v=10}u=m|0;f8(o,j,u,n);j=p|0;lC(j|0,0,40);c[q>>2]=j;p=r|0;c[s>>2]=p;c[t>>2]=0;m=g|0;g=h|0;h=a[n]|0;n=c[m>>2]|0;L2746:while(1){do{if((n|0)==0){w=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){w=n;break}if((cB[c[(c[n>>2]|0)+36>>2]&255](n)|0)!=-1){w=n;break}c[m>>2]=0;w=0}}while(0);x=(w|0)==0;y=c[g>>2]|0;do{if((y|0)==0){z=2602}else{if((c[y+12>>2]|0)!=(c[y+16>>2]|0)){if(x){A=y;B=0;break}else{C=y;D=0;break L2746}}if((cB[c[(c[y>>2]|0)+36>>2]&255](y)|0)==-1){c[g>>2]=0;z=2602;break}else{E=(y|0)==0;if(x^E){A=y;B=E;break}else{C=y;D=E;break L2746}}}}while(0);if((z|0)==2602){z=0;if(x){C=0;D=1;break}else{A=0;B=1}}y=w+12|0;E=c[y>>2]|0;F=w+16|0;if((E|0)==(c[F>>2]|0)){G=(cB[c[(c[w>>2]|0)+36>>2]&255](w)|0)&255}else{G=a[E]|0}if((f4(G,v,j,q,t,h,o,p,s,u)|0)!=0){C=A;D=B;break}E=c[y>>2]|0;if((E|0)==(c[F>>2]|0)){F=c[(c[w>>2]|0)+40>>2]|0;cB[F&255](w)|0;n=w;continue}else{c[y>>2]=E+1;n=w;continue}}n=d[o]|0;if((n&1|0)==0){H=n>>>1}else{H=c[o+4>>2]|0}do{if((H|0)!=0){n=c[s>>2]|0;if((n-r|0)>=160){break}B=c[t>>2]|0;c[s>>2]=n+4;c[n>>2]=B}}while(0);b[l>>1]=gc(j,c[q>>2]|0,k,v)|0;f5(o,p,c[s>>2]|0,k);do{if(x){I=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){I=w;break}if((cB[c[(c[w>>2]|0)+36>>2]&255](w)|0)!=-1){I=w;break}c[m>>2]=0;I=0}}while(0);m=(I|0)==0;L2791:do{if(D){z=2632}else{do{if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((cB[c[(c[C>>2]|0)+36>>2]&255](C)|0)!=-1){break}c[g>>2]=0;z=2632;break L2791}}while(0);if(!(m^(C|0)==0)){break}J=e|0;c[J>>2]=I;ep(o);i=f;return}}while(0);do{if((z|0)==2632){if(m){break}J=e|0;c[J>>2]=I;ep(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;J=e|0;c[J>>2]=I;ep(o);i=f;return}function gc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a4()|0)>>2]|0;c[(a4()|0)>>2]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=aJ(b|0,h|0,f|0,c[6438]|0)|0;f=K;b=c[(a4()|0)>>2]|0;if((b|0)==0){c[(a4()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>65535>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l&65535;i=g;return j|0}return 0}function gd(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;f8(n,h,t,m);h=o|0;lC(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2836:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2677}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2836}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2677;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2836}}}}while(0);if((y|0)==2677){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f4(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=ge(h,c[p>>2]|0,j,u)|0;f5(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2881:do{if(C){y=2707}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2707;break L2881}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);do{if((y|0)==2707){if(l){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ep(n);i=e;return}function ge(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a4()|0)>>2]|0;c[(a4()|0)>>2]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=aJ(b|0,h|0,f|0,c[6438]|0)|0;f=K;b=c[(a4()|0)>>2]|0;if((b|0)==0){c[(a4()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function gf(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;f8(n,h,t,m);h=o|0;lC(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L2926:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2752}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L2926}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2752;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L2926}}}}while(0);if((y|0)==2752){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f4(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);c[k>>2]=gg(h,c[p>>2]|0,j,u)|0;f5(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L2971:do{if(C){y=2782}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2782;break L2971}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);do{if((y|0)==2782){if(l){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ep(n);i=e;return}function gg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=c[(a4()|0)>>2]|0;c[(a4()|0)>>2]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=aJ(b|0,h|0,f|0,c[6438]|0)|0;f=K;b=c[(a4()|0)>>2]|0;if((b|0)==0){c[(a4()|0)>>2]=k}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}d=0;if((b|0)==34|(f>>>0>d>>>0|f>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=l;i=g;return j|0}return 0}function gh(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+280|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=e+96|0;q=e+104|0;r=e+264|0;s=e+272|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;f8(n,h,t,m);h=o|0;lC(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=a[m]|0;m=c[l>>2]|0;L3016:while(1){do{if((m|0)==0){v=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){v=m;break}if((cB[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);w=(v|0)==0;x=c[f>>2]|0;do{if((x|0)==0){y=2827}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(w){z=x;A=0;break}else{B=x;C=0;break L3016}}if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)==-1){c[f>>2]=0;y=2827;break}else{D=(x|0)==0;if(w^D){z=x;A=D;break}else{B=x;C=D;break L3016}}}}while(0);if((y|0)==2827){y=0;if(w){B=0;C=1;break}else{z=0;A=1}}x=v+12|0;D=c[x>>2]|0;E=v+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)&255}else{F=a[D]|0}if((f4(F,u,h,p,s,g,n,o,r,t)|0)!=0){B=z;C=A;break}D=c[x>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[v>>2]|0)+40>>2]|0;cB[E&255](v)|0;m=v;continue}else{c[x>>2]=D+1;m=v;continue}}m=d[n]|0;if((m&1|0)==0){G=m>>>1}else{G=c[n+4>>2]|0}do{if((G|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}A=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=A}}while(0);s=gi(h,c[p>>2]|0,j,u)|0;c[k>>2]=s;c[k+4>>2]=K;f5(n,o,c[r>>2]|0,j);do{if(w){H=0}else{if((c[v+12>>2]|0)!=(c[v+16>>2]|0)){H=v;break}if((cB[c[(c[v>>2]|0)+36>>2]&255](v)|0)!=-1){H=v;break}c[l>>2]=0;H=0}}while(0);l=(H|0)==0;L3061:do{if(C){y=2857}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[f>>2]=0;y=2857;break L3061}}while(0);if(!(l^(B|0)==0)){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);do{if((y|0)==2857){if(l){break}I=b|0;c[I>>2]=H;ep(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;I=b|0;c[I>>2]=H;ep(n);i=e;return}function gi(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=c[(a4()|0)>>2]|0;c[(a4()|0)>>2]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);m=aJ(b|0,h|0,f|0,c[6438]|0)|0;n=K;o=c[(a4()|0)>>2]|0;if((o|0)==0){c[(a4()|0)>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)!=34){j=n;k=m;break}c[e>>2]=4;j=-1;k=-1}}while(0);i=g;return(K=j,k)|0}function gj(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;gk(p,j,w,n,o);j=e+72|0;lC(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L3095:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=2892}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L3095}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=2892;break}else{if(A^(B|0)==0){break}else{break L3095}}}}while(0);if((C|0)==2892){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((gl(F,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cB[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);I=+ly(j,m,c[6438]|0);if((c[m>>2]|0)==(t|0)){H=I;break}else{c[k>>2]=4;H=0.0;break}}}while(0);g[l>>2]=H;f5(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=2934}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=2934;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}}while(0);do{if((C|0)==2934){if(y){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;ep(p);i=e;return}function gk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;e4(l,d);d=l|0;l=c[d>>2]|0;if((c[6778]|0)!=-1){c[k>>2]=27112;c[k+4>>2]=12;c[k+8>>2]=0;eu(27112,k,98)}k=(c[6779]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;cL[p&15](o,23640,23672,e)|0;o=c[d>>2]|0;if((c[6682]|0)!=-1){c[j>>2]=26728;c[j+4>>2]=12;c[j+8>>2]=0;eu(26728,j,98)}p=(c[6683]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;a[f]=cB[c[(c[s>>2]|0)+12>>2]&255](r)|0;a[g]=cB[c[(c[s>>2]|0)+16>>2]&255](r)|0;cy[c[(c[q>>2]|0)+20>>2]&127](b,r);r=c[d>>2]|0;d4(r)|0;i=h;return}}while(0);p=cj(4)|0;k1(p);bA(p|0,22008,138)}}while(0);h=cj(4)|0;k1(h);bA(h|0,22008,138)}function gl(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+32|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((a[j]|0)==b<<24>>24){u=j;break}else{j=j+1|0}}j=u-o|0;if((j|0)>31){r=-1;return r|0}o=a[23640+j|0]|0;do{if((j|0)==25|(j|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=o;r=0;return r|0}else if((j|0)==22|(j|0)==23){a[f]=80}else{u=a[f]|0;if((o&95|0)!=(u<<24>>24|0)){break}a[f]=u|-128;if((a[e]&1)==0){break}a[e]=0;u=d[k]|0;if((u&1|0)==0){v=u>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}u=c[m>>2]|0;if((u-l|0)>=160){break}b=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=b}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=o}if((j|0)>21){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function gm(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;gk(p,j,w,n,o);j=e+72|0;lC(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L3259:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=3024}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L3259}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=3024;break}else{if(A^(B|0)==0){break}else{break L3259}}}}while(0);if((C|0)==3024){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((gl(F,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cB[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);I=+ly(j,m,c[6438]|0);if((c[m>>2]|0)==(t|0)){H=I;break}c[k>>2]=4;H=0.0}}while(0);h[l>>3]=H;f5(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=3065}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=3065;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}}while(0);do{if((C|0)==3065){if(y){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;ep(p);i=e;return}function gn(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;e=i;i=i+312|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+40|0;o=e+48|0;p=e+56|0;q=e+112|0;r=e+120|0;s=e+280|0;t=e+288|0;u=e+296|0;v=e+304|0;w=e+8|0;gk(p,j,w,n,o);j=e+72|0;lC(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=a[n]|0;n=a[o]|0;o=c[y>>2]|0;L3332:while(1){do{if((o|0)==0){z=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){z=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;B=c[f>>2]|0;do{if((B|0)==0){C=3085}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(A){break}else{break L3332}}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)==-1){c[f>>2]=0;C=3085;break}else{if(A^(B|0)==0){break}else{break L3332}}}}while(0);if((C|0)==3085){C=0;if(A){break}}B=z+12|0;D=c[B>>2]|0;E=z+16|0;if((D|0)==(c[E>>2]|0)){F=(cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)&255}else{F=a[D]|0}if((gl(F,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}D=c[B>>2]|0;if((D|0)==(c[E>>2]|0)){E=c[(c[z>>2]|0)+40>>2]|0;cB[E&255](z)|0;o=z;continue}else{c[B>>2]=D+1;o=z;continue}}z=d[p]|0;if((z&1|0)==0){G=z>>>1}else{G=c[p+4>>2]|0}do{if((G|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;H=0.0}else{do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);I=+ly(j,m,c[6438]|0);if((c[m>>2]|0)==(t|0)){H=I;break}c[k>>2]=4;H=0.0}}while(0);h[l>>3]=H;f5(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){J=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){J=s;break}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)!=-1){J=s;break}c[y>>2]=0;J=0}}while(0);y=(J|0)==0;s=c[f>>2]|0;do{if((s|0)==0){C=3126}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){if(!y){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}if((cB[c[(c[s>>2]|0)+36>>2]&255](s)|0)==-1){c[f>>2]=0;C=3126;break}if(!(y^(s|0)==0)){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}}while(0);do{if((C|0)==3126){if(y){break}K=b|0;c[K>>2]=J;ep(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;K=b|0;c[K>>2]=J;ep(p);i=e;return}function go(a){a=a|0;dH(a|0);lu(a);return}function gp(a){a=a|0;dH(a|0);return}function gq(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+64|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+48|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;lC(m|0,0,12);e4(n,g);g=n|0;n=c[g>>2]|0;if((c[6778]|0)!=-1){c[k>>2]=27112;c[k+4>>2]=12;c[k+8>>2]=0;eu(27112,k,98)}k=(c[6779]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+32>>2]|0;cL[x&15](v,23640,23666,w)|0;v=c[g>>2]|0;d4(v)|0;v=o|0;lC(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L11:while(1){do{if((z|0)==0){A=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){A=z;break}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);C=(A|0)==0;D=c[y>>2]|0;do{if((D|0)==0){E=23}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(C){break}else{break L11}}if((cB[c[(c[D>>2]|0)+36>>2]&255](D)|0)==-1){c[y>>2]=0;E=23;break}else{if(C^(D|0)==0){break}else{break L11}}}}while(0);if((E|0)==23){E=0;if(C){break}}D=A+12|0;F=c[D>>2]|0;G=A+16|0;if((F|0)==(c[G>>2]|0)){H=(cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{H=a[F]|0}if((f4(H,16,v,p,s,0,m,x,r,w)|0)!=0){break}F=c[D>>2]|0;if((F|0)==(c[G>>2]|0)){G=c[(c[A>>2]|0)+40>>2]|0;cB[G&255](A)|0;z=A;continue}else{c[D>>2]=F+1;z=A;continue}}a[o+39|0]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);if((gr(v,c[6438]|0,5720,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}z=c[u>>2]|0;do{if((z|0)==0){I=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){I=z;break}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){I=z;break}c[u>>2]=0;I=0}}while(0);u=(I|0)==0;z=c[y>>2]|0;do{if((z|0)==0){E=56}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(!u){break}J=b|0;c[J>>2]=I;ep(m);i=d;return}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[y>>2]=0;E=56;break}if(!(u^(z|0)==0)){break}J=b|0;c[J>>2]=I;ep(m);i=d;return}}while(0);do{if((E|0)==56){if(u){break}J=b|0;c[J>>2]=I;ep(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;J=b|0;c[J>>2]=I;ep(m);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function gr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b1(b|0)|0;b=a0(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}b1(h|0)|0;i=f;return b|0}function gs(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cw[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==0){a[j]=0}else if((w|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}e4(r,g);q=r|0;r=c[q>>2]|0;if((c[6776]|0)!=-1){c[m>>2]=27104;c[m+4>>2]=12;c[m+8>>2]=0;eu(27104,m,98)}m=(c[6777]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[q>>2]|0;d4(n)|0;e4(s,g);n=s|0;p=c[n>>2]|0;if((c[6680]|0)!=-1){c[l>>2]=26720;c[l+4>>2]=12;c[l+8>>2]=0;eu(26720,l,98)}d=(c[6681]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){x=c[v+(d<<2)>>2]|0;if((x|0)==0){break}y=x;z=c[n>>2]|0;d4(z)|0;z=t|0;A=x;cy[c[(c[A>>2]|0)+24>>2]&127](z,y);cy[c[(c[A>>2]|0)+28>>2]&127](t+12|0,y);c[u>>2]=c[f>>2];a[j]=(gt(e,u,z,t+24|0,o,h,1)|0)==(z|0)|0;c[b>>2]=c[e>>2];eC(t+12|0);eC(t|0);i=k;return}}while(0);o=cj(4)|0;k1(o);bA(o|0,22008,138)}}while(0);k=cj(4)|0;k1(k);bA(k|0,22008,138)}function gt(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100){o=lk(m)|0;if((o|0)!=0){p=o;q=o;break}lz();p=0;q=0}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){r=m;s=0}else{o=m;m=0;t=p;u=f;while(1){v=d[u]|0;if((v&1|0)==0){w=v>>>1}else{w=c[u+4>>2]|0}if((w|0)==0){a[t]=2;x=m+1|0;y=o-1|0}else{a[t]=1;x=m;y=o}v=u+12|0;if((v|0)==(g|0)){r=y;s=x;break}else{o=y;m=x;t=t+1|0;u=v}}}u=b|0;b=e|0;e=h;t=0;x=s;s=r;while(1){r=c[u>>2]|0;do{if((r|0)==0){z=0}else{m=c[r+12>>2]|0;if((m|0)==(c[r+16>>2]|0)){A=cB[c[(c[r>>2]|0)+36>>2]&255](r)|0}else{A=c[m>>2]|0}if((A|0)==-1){c[u>>2]=0;z=0;break}else{z=c[u>>2]|0;break}}}while(0);r=(z|0)==0;m=c[b>>2]|0;if((m|0)==0){B=z;C=0}else{y=c[m+12>>2]|0;if((y|0)==(c[m+16>>2]|0)){D=cB[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{D=c[y>>2]|0}if((D|0)==-1){c[b>>2]=0;E=0}else{E=m}B=c[u>>2]|0;C=E}F=(C|0)==0;if(!((r^F)&(s|0)!=0)){break}r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){G=cB[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{G=c[r>>2]|0}if(k){H=G}else{H=cz[c[(c[e>>2]|0)+28>>2]&63](h,G)|0}do{if(n){I=x;J=s}else{r=t+1|0;L158:do{if(k){m=s;y=x;o=p;w=0;v=f;while(1){do{if((a[o]|0)==1){K=v;if((a[K]&1)==0){L=v+4|0}else{L=c[v+8>>2]|0}if((H|0)!=(c[L+(t<<2)>>2]|0)){a[o]=0;M=w;N=y;O=m-1|0;break}P=d[K]|0;if((P&1|0)==0){Q=P>>>1}else{Q=c[v+4>>2]|0}if((Q|0)!=(r|0)){M=1;N=y;O=m;break}a[o]=2;M=1;N=y+1|0;O=m-1|0}else{M=w;N=y;O=m}}while(0);P=v+12|0;if((P|0)==(g|0)){R=O;S=N;T=M;break L158}m=O;y=N;o=o+1|0;w=M;v=P}}else{v=s;w=x;o=p;y=0;m=f;while(1){do{if((a[o]|0)==1){P=m;if((a[P]&1)==0){U=m+4|0}else{U=c[m+8>>2]|0}if((H|0)!=(cz[c[(c[e>>2]|0)+28>>2]&63](h,c[U+(t<<2)>>2]|0)|0)){a[o]=0;V=y;W=w;X=v-1|0;break}K=d[P]|0;if((K&1|0)==0){Y=K>>>1}else{Y=c[m+4>>2]|0}if((Y|0)!=(r|0)){V=1;W=w;X=v;break}a[o]=2;V=1;W=w+1|0;X=v-1|0}else{V=y;W=w;X=v}}while(0);K=m+12|0;if((K|0)==(g|0)){R=X;S=W;T=V;break L158}v=X;w=W;o=o+1|0;y=V;m=K}}}while(0);if(!T){I=S;J=R;break}r=c[u>>2]|0;m=r+12|0;y=c[m>>2]|0;if((y|0)==(c[r+16>>2]|0)){o=c[(c[r>>2]|0)+40>>2]|0;cB[o&255](r)|0}else{c[m>>2]=y+4}if((S+R|0)>>>0<2|n){I=S;J=R;break}y=t+1|0;m=S;r=p;o=f;while(1){do{if((a[r]|0)==2){w=d[o]|0;if((w&1|0)==0){Z=w>>>1}else{Z=c[o+4>>2]|0}if((Z|0)==(y|0)){_=m;break}a[r]=0;_=m-1|0}else{_=m}}while(0);w=o+12|0;if((w|0)==(g|0)){I=_;J=R;break}else{m=_;r=r+1|0;o=w}}}}while(0);t=t+1|0;x=I;s=J}do{if((B|0)==0){$=1}else{J=c[B+12>>2]|0;if((J|0)==(c[B+16>>2]|0)){aa=cB[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{aa=c[J>>2]|0}if((aa|0)==-1){c[u>>2]=0;$=1;break}else{$=(c[u>>2]|0)==0;break}}}while(0);do{if(F){ab=196}else{u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){ac=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{ac=c[u>>2]|0}if((ac|0)==-1){c[b>>2]=0;ab=196;break}else{if($^(C|0)==0){break}else{ab=198;break}}}}while(0);if((ab|0)==196){if($){ab=198}}if((ab|0)==198){c[j>>2]=c[j>>2]|2}L239:do{if(n){ab=203}else{$=f;C=p;while(1){if((a[C]|0)==2){ad=$;break L239}b=$+12|0;if((b|0)==(g|0)){ab=203;break L239}$=b;C=C+1|0}}}while(0);if((ab|0)==203){c[j>>2]=c[j>>2]|4;ad=g}if((q|0)==0){i=l;return ad|0}ll(q);i=l;return ad|0}function gu(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}s=k|0;gy(m,g,s,l);g=n|0;lC(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L257:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=227}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=227;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L257}}}}while(0);if((y|0)==227){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gv(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=f7(g,c[o>>2]|0,h,t)|0;f5(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=258}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=258;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;ep(m);i=b;return}}while(0);do{if((y|0)==258){if(k){break}L=a|0;c[L>>2]=I;ep(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;ep(m);i=b;return}function gv(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){if((i|0)==(k|0)){s=k;break}if((c[i>>2]|0)==(b|0)){s=i;break}else{i=i+4|0}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[23640+m|0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b]=s;q=0;return q|0}}while(0);if((n-f|0)<39){f=a[23640+m|0]|0;c[g>>2]=n+1;a[n]=f}c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function gw(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}s=k|0;gy(m,g,s,l);g=n|0;lC(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L372:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=317}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=317;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L372}}}}while(0);if((y|0)==317){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gv(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=ga(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=K;f5(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=348}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;y=348;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;ep(m);i=b;return}}while(0);do{if((y|0)==348){if(k){break}M=a|0;c[M>>2]=I;ep(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;ep(m);i=b;return}function gx(a,e,f,g,h,j,k){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+352|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=e+168|0;q=e+176|0;r=e+336|0;s=e+344|0;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}t=l|0;gy(n,h,t,m);h=o|0;lC(h|0,0,40);c[p>>2]=h;o=q|0;c[r>>2]=o;c[s>>2]=0;l=f|0;f=g|0;g=c[m>>2]|0;m=c[l>>2]|0;L441:while(1){do{if((m|0)==0){v=0}else{w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0)){x=cB[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{x=c[w>>2]|0}if((x|0)!=-1){v=m;break}c[l>>2]=0;v=0}}while(0);y=(v|0)==0;w=c[f>>2]|0;do{if((w|0)==0){z=372}else{A=c[w+12>>2]|0;if((A|0)==(c[w+16>>2]|0)){B=cB[c[(c[w>>2]|0)+36>>2]&255](w)|0}else{B=c[A>>2]|0}if((B|0)==-1){c[f>>2]=0;z=372;break}else{A=(w|0)==0;if(y^A){C=w;D=A;break}else{E=w;F=A;break L441}}}}while(0);if((z|0)==372){z=0;if(y){E=0;F=1;break}else{C=0;D=1}}w=v+12|0;A=c[w>>2]|0;G=v+16|0;if((A|0)==(c[G>>2]|0)){H=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{H=c[A>>2]|0}if((gv(H,u,h,p,s,g,n,o,r,t)|0)!=0){E=C;F=D;break}A=c[w>>2]|0;if((A|0)==(c[G>>2]|0)){G=c[(c[v>>2]|0)+40>>2]|0;cB[G&255](v)|0;m=v;continue}else{c[w>>2]=A+4;m=v;continue}}m=d[n]|0;if((m&1|0)==0){I=m>>>1}else{I=c[n+4>>2]|0}do{if((I|0)!=0){m=c[r>>2]|0;if((m-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=m+4;c[m>>2]=D}}while(0);b[k>>1]=gc(h,c[p>>2]|0,j,u)|0;f5(n,o,c[r>>2]|0,j);do{if(y){J=0}else{r=c[v+12>>2]|0;if((r|0)==(c[v+16>>2]|0)){K=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{K=c[r>>2]|0}if((K|0)!=-1){J=v;break}c[l>>2]=0;J=0}}while(0);l=(J|0)==0;do{if(F){z=403}else{v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){L=cB[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{L=c[v>>2]|0}if((L|0)==-1){c[f>>2]=0;z=403;break}if(!(l^(E|0)==0)){break}M=a|0;c[M>>2]=J;ep(n);i=e;return}}while(0);do{if((z|0)==403){if(l){break}M=a|0;c[M>>2]=J;ep(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;M=a|0;c[M>>2]=J;ep(n);i=e;return}function gy(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;e4(j,b);b=j|0;j=c[b>>2]|0;if((c[6776]|0)!=-1){c[h>>2]=27104;c[h+4>>2]=12;c[h+8>>2]=0;eu(27104,h,98)}h=(c[6777]|0)-1|0;k=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-k>>2>>>0>h>>>0){l=c[k+(h<<2)>>2]|0;if((l|0)==0){break}m=l;n=c[(c[l>>2]|0)+48>>2]|0;cL[n&15](m,23640,23666,d)|0;m=c[b>>2]|0;if((c[6680]|0)!=-1){c[g>>2]=26720;c[g+4>>2]=12;c[g+8>>2]=0;eu(26720,g,98)}n=(c[6681]|0)-1|0;l=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-l>>2>>>0>n>>>0){o=c[l+(n<<2)>>2]|0;if((o|0)==0){break}p=o;c[e>>2]=cB[c[(c[o>>2]|0)+16>>2]&255](p)|0;cy[c[(c[o>>2]|0)+20>>2]&127](a,p);p=c[b>>2]|0;d4(p)|0;i=f;return}}while(0);n=cj(4)|0;k1(n);bA(n|0,22008,138)}}while(0);f=cj(4)|0;k1(f);bA(f|0,22008,138)}function gz(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}s=k|0;gy(m,g,s,l);g=n|0;lC(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L530:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=444}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=444;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L530}}}}while(0);if((y|0)==444){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gv(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=ge(g,c[o>>2]|0,h,t)|0;f5(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=475}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=475;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;ep(m);i=b;return}}while(0);do{if((y|0)==475){if(k){break}L=a|0;c[L>>2]=I;ep(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;ep(m);i=b;return}function gA(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}s=k|0;gy(m,g,s,l);g=n|0;lC(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L599:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=499}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=499;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L599}}}}while(0);if((y|0)==499){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gv(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);c[j>>2]=gg(g,c[o>>2]|0,h,t)|0;f5(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=530}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){K=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{K=c[u>>2]|0}if((K|0)==-1){c[e>>2]=0;y=530;break}if(!(k^(D|0)==0)){break}L=a|0;c[L>>2]=I;ep(m);i=b;return}}while(0);do{if((y|0)==530){if(k){break}L=a|0;c[L>>2]=I;ep(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;L=a|0;c[L>>2]=I;ep(m);i=b;return}function gB(a,b,e,f,g,h,j){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;b=i;i=i+352|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=b|0;l=b+104|0;m=b+112|0;n=b+128|0;o=b+168|0;p=b+176|0;q=b+336|0;r=b+344|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}s=k|0;gy(m,g,s,l);g=n|0;lC(g|0,0,40);c[o>>2]=g;n=p|0;c[q>>2]=n;c[r>>2]=0;k=e|0;e=f|0;f=c[l>>2]|0;l=c[k>>2]|0;L668:while(1){do{if((l|0)==0){u=0}else{v=c[l+12>>2]|0;if((v|0)==(c[l+16>>2]|0)){w=cB[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{w=c[v>>2]|0}if((w|0)!=-1){u=l;break}c[k>>2]=0;u=0}}while(0);x=(u|0)==0;v=c[e>>2]|0;do{if((v|0)==0){y=554}else{z=c[v+12>>2]|0;if((z|0)==(c[v+16>>2]|0)){A=cB[c[(c[v>>2]|0)+36>>2]&255](v)|0}else{A=c[z>>2]|0}if((A|0)==-1){c[e>>2]=0;y=554;break}else{z=(v|0)==0;if(x^z){B=v;C=z;break}else{D=v;E=z;break L668}}}}while(0);if((y|0)==554){y=0;if(x){D=0;E=1;break}else{B=0;C=1}}v=u+12|0;z=c[v>>2]|0;F=u+16|0;if((z|0)==(c[F>>2]|0)){G=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{G=c[z>>2]|0}if((gv(G,t,g,o,r,f,m,n,q,s)|0)!=0){D=B;E=C;break}z=c[v>>2]|0;if((z|0)==(c[F>>2]|0)){F=c[(c[u>>2]|0)+40>>2]|0;cB[F&255](u)|0;l=u;continue}else{c[v>>2]=z+4;l=u;continue}}l=d[m]|0;if((l&1|0)==0){H=l>>>1}else{H=c[m+4>>2]|0}do{if((H|0)!=0){l=c[q>>2]|0;if((l-p|0)>=160){break}C=c[r>>2]|0;c[q>>2]=l+4;c[l>>2]=C}}while(0);r=gi(g,c[o>>2]|0,h,t)|0;c[j>>2]=r;c[j+4>>2]=K;f5(m,n,c[q>>2]|0,h);do{if(x){I=0}else{q=c[u+12>>2]|0;if((q|0)==(c[u+16>>2]|0)){J=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{J=c[q>>2]|0}if((J|0)!=-1){I=u;break}c[k>>2]=0;I=0}}while(0);k=(I|0)==0;do{if(E){y=585}else{u=c[D+12>>2]|0;if((u|0)==(c[D+16>>2]|0)){L=cB[c[(c[D>>2]|0)+36>>2]&255](D)|0}else{L=c[u>>2]|0}if((L|0)==-1){c[e>>2]=0;y=585;break}if(!(k^(D|0)==0)){break}M=a|0;c[M>>2]=I;ep(m);i=b;return}}while(0);do{if((y|0)==585){if(k){break}M=a|0;c[M>>2]=I;ep(m);i=b;return}}while(0);c[h>>2]=c[h>>2]|2;M=a|0;c[M>>2]=I;ep(m);i=b;return}function gC(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0;p=c[h>>2]|0;q=g;if((p-q|0)>38){r=-1;return r|0}if((b|0)==(i|0)){if((a[e]&1)==0){r=-1;return r|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){s=i>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){r=0;return r|0}s=c[m>>2]|0;if((s-l|0)>=160){r=0;return r|0}i=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=i;r=0;return r|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){t=i>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}if((a[e]&1)==0){r=-1;return r|0}i=c[m>>2]|0;if((i-l|0)>=160){r=0;return r|0}s=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=s;c[n>>2]=0;r=0;return r|0}}while(0);t=o+128|0;j=o;while(1){if((j|0)==(t|0)){u=t;break}if((c[j>>2]|0)==(b|0)){u=j;break}else{j=j+4|0}}j=u-o|0;o=j>>2;if((j|0)>124){r=-1;return r|0}u=a[23640+o|0]|0;do{if((o|0)==25|(o|0)==24){do{if((p|0)!=(g|0)){if((a[p-1|0]&95|0)==(a[f]&127|0)){break}else{r=-1}return r|0}}while(0);c[h>>2]=p+1;a[p]=u;r=0;return r|0}else if((o|0)==22|(o|0)==23){a[f]=80}else{b=a[f]|0;if((u&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){v=b>>>1}else{v=c[k+4>>2]|0}if((v|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}t=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=t}}while(0);m=c[h>>2]|0;if((m-q|0)<(((a[f]|0)<0?39:29)|0)){c[h>>2]=m+1;a[m]=u}if((j|0)>84){r=0;return r|0}c[n>>2]=(c[n>>2]|0)+1;r=0;return r|0}function gD(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7>>3<<3;c[h>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;gE(p,j,w,n,o);j=e+168|0;lC(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=h|0;h=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L800:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cB[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=657}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=657;break}else{if(A^(C|0)==0){break}else{break L800}}}}while(0);if((D|0)==657){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((gC(H,u,v,j,q,h,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cB[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);K=+ly(j,m,c[6438]|0);if((c[m>>2]|0)==(t|0)){J=K;break}else{c[k>>2]=4;J=0.0;break}}}while(0);g[l>>2]=J;f5(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=699}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=699;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;ep(p);i=e;return}}while(0);do{if((D|0)==699){if(y){break}O=b|0;c[O>>2]=L;ep(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;ep(p);i=e;return}function gE(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;e4(k,b);b=k|0;k=c[b>>2]|0;if((c[6776]|0)!=-1){c[j>>2]=27104;c[j+4>>2]=12;c[j+8>>2]=0;eu(27104,j,98)}j=(c[6777]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>j>>>0){m=c[l+(j<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;cL[o&15](n,23640,23672,d)|0;n=c[b>>2]|0;if((c[6680]|0)!=-1){c[h>>2]=26720;c[h+4>>2]=12;c[h+8>>2]=0;eu(26720,h,98)}o=(c[6681]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=p;c[e>>2]=cB[c[(c[r>>2]|0)+12>>2]&255](q)|0;c[f>>2]=cB[c[(c[r>>2]|0)+16>>2]&255](q)|0;cy[c[(c[p>>2]|0)+20>>2]&127](a,q);q=c[b>>2]|0;d4(q)|0;i=g;return}}while(0);o=cj(4)|0;k1(o);bA(o|0,22008,138)}}while(0);g=cj(4)|0;k1(g);bA(g|0,22008,138)}function gF(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;gE(p,j,w,n,o);j=e+168|0;lC(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L898:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cB[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=737}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=737;break}else{if(A^(C|0)==0){break}else{break L898}}}}while(0);if((D|0)==737){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((gC(H,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cB[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);K=+ly(j,m,c[6438]|0);if((c[m>>2]|0)==(t|0)){J=K;break}c[k>>2]=4;J=0.0}}while(0);h[l>>3]=J;f5(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=778}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=778;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;ep(p);i=e;return}}while(0);do{if((D|0)==778){if(y){break}O=b|0;c[O>>2]=L;ep(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;ep(p);i=e;return}function gG(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;e=i;i=i+408|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[m>>2];m=e|0;n=e+136|0;o=e+144|0;p=e+152|0;q=e+208|0;r=e+216|0;s=e+376|0;t=e+384|0;u=e+392|0;v=e+400|0;w=e+8|0;gE(p,j,w,n,o);j=e+168|0;lC(j|0,0,40);c[q>>2]=j;x=r|0;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;y=f|0;f=g|0;g=c[n>>2]|0;n=c[o>>2]|0;o=c[y>>2]|0;L973:while(1){do{if((o|0)==0){z=0}else{A=c[o+12>>2]|0;if((A|0)==(c[o+16>>2]|0)){B=cB[c[(c[o>>2]|0)+36>>2]&255](o)|0}else{B=c[A>>2]|0}if((B|0)!=-1){z=o;break}c[y>>2]=0;z=0}}while(0);A=(z|0)==0;C=c[f>>2]|0;do{if((C|0)==0){D=798}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){F=cB[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{F=c[E>>2]|0}if((F|0)==-1){c[f>>2]=0;D=798;break}else{if(A^(C|0)==0){break}else{break L973}}}}while(0);if((D|0)==798){D=0;if(A){break}}C=z+12|0;E=c[C>>2]|0;G=z+16|0;if((E|0)==(c[G>>2]|0)){H=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{H=c[E>>2]|0}if((gC(H,u,v,j,q,g,n,p,x,s,t,w)|0)!=0){break}E=c[C>>2]|0;if((E|0)==(c[G>>2]|0)){G=c[(c[z>>2]|0)+40>>2]|0;cB[G&255](z)|0;o=z;continue}else{c[C>>2]=E+4;o=z;continue}}z=d[p]|0;if((z&1|0)==0){I=z>>>1}else{I=c[p+4>>2]|0}do{if((I|0)!=0){if((a[u]&1)==0){break}z=c[s>>2]|0;if((z-r|0)>=160){break}o=c[t>>2]|0;c[s>>2]=z+4;c[z>>2]=o}}while(0);t=c[q>>2]|0;do{if((j|0)==(t|0)){c[k>>2]=4;J=0.0}else{do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);K=+ly(j,m,c[6438]|0);if((c[m>>2]|0)==(t|0)){J=K;break}c[k>>2]=4;J=0.0}}while(0);h[l>>3]=J;f5(p,x,c[s>>2]|0,k);s=c[y>>2]|0;do{if((s|0)==0){L=0}else{x=c[s+12>>2]|0;if((x|0)==(c[s+16>>2]|0)){M=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{M=c[x>>2]|0}if((M|0)!=-1){L=s;break}c[y>>2]=0;L=0}}while(0);y=(L|0)==0;s=c[f>>2]|0;do{if((s|0)==0){D=839}else{M=c[s+12>>2]|0;if((M|0)==(c[s+16>>2]|0)){N=cB[c[(c[s>>2]|0)+36>>2]&255](s)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[f>>2]=0;D=839;break}if(!(y^(s|0)==0)){break}O=b|0;c[O>>2]=L;ep(p);i=e;return}}while(0);do{if((D|0)==839){if(y){break}O=b|0;c[O>>2]=L;ep(p);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=L;ep(p);i=e;return}function gH(a){a=a|0;dH(a|0);lu(a);return}function gI(a){a=a|0;dH(a|0);return}function gJ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[15912]|0;a[q+1|0]=a[15913|0]|0;a[q+2|0]=a[15914|0]|0;a[q+3|0]=a[15915|0]|0;a[q+4|0]=a[15916|0]|0;a[q+5|0]=a[15917|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=k|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);t=gM(u,c[6438]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=869;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=869;break}w=k+2|0}else if((q|0)==32){w=h}else{x=869}}while(0);if((x|0)==869){w=u}x=l|0;e4(o,f);gR(u,w,h,x,m,n,o);d4(c[o>>2]|0)|0;c[p>>2]=c[e>>2];gN(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gK(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+136|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=d|0;l=d+16|0;m=d+120|0;n=i;i=i+4|0;i=i+7>>3<<3;o=i;i=i+40|0;p=i;i=i+4|0;i=i+7>>3<<3;q=i;i=i+160|0;r=i;i=i+4|0;i=i+7>>3<<3;s=i;i=i+4|0;i=i+7>>3<<3;lC(m|0,0,12);e4(n,g);g=n|0;n=c[g>>2]|0;if((c[6776]|0)!=-1){c[k>>2]=27104;c[k+4>>2]=12;c[k+8>>2]=0;eu(27104,k,98)}k=(c[6777]|0)-1|0;t=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-t>>2>>>0>k>>>0){u=c[t+(k<<2)>>2]|0;if((u|0)==0){break}v=u;w=l|0;x=c[(c[u>>2]|0)+48>>2]|0;cL[x&15](v,23640,23666,w)|0;v=c[g>>2]|0;d4(v)|0;v=o|0;lC(v|0,0,40);c[p>>2]=v;x=q|0;c[r>>2]=x;c[s>>2]=0;u=e|0;y=f|0;z=c[u>>2]|0;L1089:while(1){do{if((z|0)==0){A=0}else{C=c[z+12>>2]|0;if((C|0)==(c[z+16>>2]|0)){D=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{D=c[C>>2]|0}if((D|0)!=-1){A=z;break}c[u>>2]=0;A=0}}while(0);C=(A|0)==0;E=c[y>>2]|0;do{if((E|0)==0){F=894}else{G=c[E+12>>2]|0;if((G|0)==(c[E+16>>2]|0)){H=cB[c[(c[E>>2]|0)+36>>2]&255](E)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[y>>2]=0;F=894;break}else{if(C^(E|0)==0){break}else{break L1089}}}}while(0);if((F|0)==894){F=0;if(C){break}}E=A+12|0;G=c[E>>2]|0;I=A+16|0;if((G|0)==(c[I>>2]|0)){J=cB[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{J=c[G>>2]|0}if((gv(J,16,v,p,s,0,m,x,r,w)|0)!=0){break}G=c[E>>2]|0;if((G|0)==(c[I>>2]|0)){I=c[(c[A>>2]|0)+40>>2]|0;cB[I&255](A)|0;z=A;continue}else{c[E>>2]=G+4;z=A;continue}}a[o+39|0]=0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);if((gr(v,c[6438]|0,5720,(B=i,i=i+8|0,c[B>>2]=j,B)|0)|0)!=1){c[h>>2]=4}z=c[u>>2]|0;do{if((z|0)==0){K=0}else{w=c[z+12>>2]|0;if((w|0)==(c[z+16>>2]|0)){L=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{L=c[w>>2]|0}if((L|0)!=-1){K=z;break}c[u>>2]=0;K=0}}while(0);u=(K|0)==0;z=c[y>>2]|0;do{if((z|0)==0){F=927}else{v=c[z+12>>2]|0;if((v|0)==(c[z+16>>2]|0)){M=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{M=c[v>>2]|0}if((M|0)==-1){c[y>>2]=0;F=927;break}if(!(u^(z|0)==0)){break}N=b|0;c[N>>2]=K;ep(m);i=d;return}}while(0);do{if((F|0)==927){if(u){break}N=b|0;c[N>>2]=K;ep(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;N=b|0;c[N>>2]=K;ep(m);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function gL(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cK[o&63](b,d,l,f,g,h&1);i=j;return}e4(m,f);f=m|0;m=c[f>>2]|0;if((c[6682]|0)!=-1){c[k>>2]=26728;c[k+4>>2]=12;c[k+8>>2]=0;eu(26728,k,98)}k=(c[6683]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;d4(o)|0;o=c[l>>2]|0;if(h){cy[c[o+24>>2]&127](n,d)}else{cy[c[o+28>>2]&127](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){p=d+1|0;q=p;r=p;s=n+8|0}else{p=n+8|0;q=c[p>>2]|0;r=d+1|0;s=p}p=e|0;d=n+4|0;t=q;u=l;while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}l=u&255;if((t|0)==(v+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){break}l=a[t]|0;w=c[p>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)!=(c[w+28>>2]|0)){c[x>>2]=y+1;a[y]=l;break}if((cz[c[(c[w>>2]|0)+52>>2]&63](w,l&255)|0)!=-1){break}c[p>>2]=0}}while(0);t=t+1|0;u=a[o]|0}c[b>>2]=c[p>>2];ep(n);i=j;return}}while(0);j=cj(4)|0;k1(j);bA(j|0,22008,138)}function gM(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b1(b|0)|0;b=b0(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}b1(h|0)|0;i=f;return b|0}function gN(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((cC[c[(c[d>>2]|0)+48>>2]&63](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){ey(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((cC[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){ep(l);break}c[m>>2]=0;c[b>>2]=0;ep(l);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((cC[c[(c[d>>2]|0)+48>>2]&63](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function gO(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);t=gM(u,c[6438]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+t|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1018;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1018;break}w=l+2|0}else if((h|0)==32){w=j}else{x=1018}}while(0);if((x|0)==1018){w=u}x=m|0;e4(p,f);gR(u,w,j,x,n,o,p);d4(c[p>>2]|0)|0;c[q>>2]=c[e>>2];gN(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gP(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[15912]|0;a[q+1|0]=a[15913|0]|0;a[q+2|0]=a[15914|0]|0;a[q+3|0]=a[15915|0]|0;a[q+4|0]=a[15916|0]|0;a[q+5|0]=a[15917|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);t=gM(u,c[6438]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+t|0;q=c[s>>2]&176;do{if((q|0)==32){w=h}else if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=1043;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1043;break}w=k+2|0}else{x=1043}}while(0);if((x|0)==1043){w=u}x=l|0;e4(o,f);gR(u,w,h,x,m,n,o);d4(c[o>>2]|0)|0;c[p>>2]=c[e>>2];gN(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function gQ(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);v=gM(u,c[6438]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1068;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1068;break}w=l+2|0}else if((h|0)==32){w=j}else{x=1068}}while(0);if((x|0)==1068){w=u}x=m|0;e4(p,f);gR(u,w,j,x,n,o,p);d4(c[p>>2]|0)|0;c[q>>2]=c[e>>2];gN(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function gR(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[6778]|0)!=-1){c[n>>2]=27112;c[n+4>>2]=12;c[n+8>>2]=0;eu(27112,n,98)}n=(c[6779]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}r=k;s=c[p>>2]|0;if((c[6682]|0)!=-1){c[m>>2]=26728;c[m+4>>2]=12;c[m+8>>2]=0;eu(26728,m,98)}m=(c[6683]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;cL[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cz[c[(c[k>>2]|0)+28>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cz[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+1;a[y]=q;q=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+1;a[I]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+1;a[I]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-1|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=a[J]|0;a[J]=a[K]|0;a[K]=C;J=J+1|0;K=K-1|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;ep(o);i=l;return}else{L=g+(e-b)|0;c[h>>2]=L;ep(o);i=l;return}}function gS(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=c[6438]|0;if(y){z=gT(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gT(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[27720]|0)==0;if(y){do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lz();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1176;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1176;break}F=E+2|0}else if((A|0)==32){F=z}else{G=1176}}while(0);if((G|0)==1176){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=lk(C<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}lz();H=0;I=0;J=c[m>>2]|0}}while(0);e4(q,f);gW(J,F,z,H,o,p,q);d4(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];gN(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){ll(I)}if((D|0)==0){i=d;return}ll(D);i=d;return}function gT(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=b1(d|0)|0;d=b2(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}b1(j|0)|0;i=g;return d|0}function gU(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b1(b|0)|0;b=cm(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}b1(h|0)|0;i=f;return b|0}function gV(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=c[6438]|0;if(y){z=gT(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gT(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[27720]|0)==0;if(y){do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lz();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==32){F=z}else if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1267;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1267;break}F=E+2|0}else{G=1267}}while(0);if((G|0)==1267){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=lk(C<<1)|0;if((G|0)!=0){H=G;I=G;J=E;break}lz();H=0;I=0;J=c[m>>2]|0}}while(0);e4(q,f);gW(J,F,z,H,o,p,q);d4(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];gN(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){ll(I)}if((D|0)==0){i=d;return}ll(D);i=d;return}function gW(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[6778]|0)!=-1){c[n>>2]=27112;c[n+4>>2]=12;c[n+8>>2]=0;eu(27112,n,98)}n=(c[6779]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}r=k;s=c[p>>2]|0;if((c[6682]|0)!=-1){c[m>>2]=26728;c[m+4>>2]=12;c[m+8>>2]=0;eu(26728,m,98)}m=(c[6683]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cz[c[(c[k>>2]|0)+28>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=m;v=b+1|0}else{v=b}m=f;L1576:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=1322;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=1322;break}p=k;n=cz[c[(c[p>>2]|0)+28>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+1;a[u]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L1576}u=a[q]|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);if((be(u<<24>>24|0,c[6438]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=1322}}while(0);L1591:do{if((x|0)==1322){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L1591}q=a[w]|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);if((b9(q<<24>>24|0,c[6438]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=1322}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+32>>2]|0;cL[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+1;a[J]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=cz[c[(c[p>>2]|0)+28>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+1;a[J]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-1|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=a[K]|0;a[K]=a[L]|0;a[L]=D;K=K+1|0;L=L-1|0;}while(K>>>0<L>>>0)}}while(0);L1630:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cz[c[(c[L>>2]|0)+28>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+1;a[z]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L1630}}L=cB[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+1;a[H]=L;M=K+1|0}else{M=y}}while(0);cL[c[(c[k>>2]|0)+32>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;ep(o);i=l;return}N=g+(e-b)|0;c[h>>2]=N;ep(o);i=l;return}function gX(a){a=a|0;dH(a|0);lu(a);return}function gY(a){a=a|0;dH(a|0);return}function gZ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[15912]|0;a[q+1|0]=a[15913|0]|0;a[q+2|0]=a[15914|0]|0;a[q+3|0]=a[15915|0]|0;a[q+4|0]=a[15916|0]|0;a[q+5|0]=a[15917|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);v=gM(u,c[6438]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1390;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1390;break}w=k+2|0}else if((q|0)==32){w=h}else{x=1390}}while(0);if((x|0)==1390){w=u}x=l|0;e4(o,f);g0(u,w,h,x,m,n,o);d4(c[o>>2]|0)|0;c[p>>2]=c[e>>2];g1(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function g_(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[15920]|0;a[o+1|0]=a[15921|0]|0;a[o+2|0]=a[15922|0]|0;a[o+3|0]=a[15923|0]|0;a[o+4|0]=a[15924|0]|0;a[o+5|0]=a[15925|0]|0;p=k|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);q=gM(p,c[6438]|0,o,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+q|0;o=c[f+4>>2]&176;do{if((o|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=1405;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=1405;break}s=k+2|0}else if((o|0)==32){s=h}else{t=1405}}while(0);if((t|0)==1405){s=p}e4(m,f);t=m|0;m=c[t>>2]|0;if((c[6778]|0)!=-1){c[j>>2]=27112;c[j+4>>2]=12;c[j+8>>2]=0;eu(27112,j,98)}j=(c[6779]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){r=c[o+(j<<2)>>2]|0;if((r|0)==0){break}u=r;v=c[t>>2]|0;d4(v)|0;v=l|0;w=c[(c[r>>2]|0)+32>>2]|0;cL[w&15](u,p,h,v)|0;u=l+q|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;gN(b,n,v,x,u,f,g);i=d;return}x=l+(s-k)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;gN(b,n,v,x,u,f,g);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function g$(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cK[o&63](b,d,l,f,g,h&1);i=j;return}e4(m,f);f=m|0;m=c[f>>2]|0;if((c[6680]|0)!=-1){c[k>>2]=26720;c[k+4>>2]=12;c[k+8>>2]=0;eu(26720,k,98)}k=(c[6681]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;o=c[f>>2]|0;d4(o)|0;o=c[l>>2]|0;if(h){cy[c[o+24>>2]&127](n,d)}else{cy[c[o+28>>2]&127](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;p=l;q=l;r=n+8|0}else{l=n+8|0;p=c[l>>2]|0;q=n+4|0;r=l}l=e|0;s=p;t=o;while(1){if((t&1)==0){u=q}else{u=c[r>>2]|0}o=t&255;if((o&1|0)==0){v=o>>>1}else{v=c[q>>2]|0}if((s|0)==(u+(v<<2)|0)){break}o=c[s>>2]|0;w=c[l>>2]|0;do{if((w|0)!=0){x=w+24|0;y=c[x>>2]|0;if((y|0)==(c[w+28>>2]|0)){z=cz[c[(c[w>>2]|0)+52>>2]&63](w,o)|0}else{c[x>>2]=y+4;c[y>>2]=o;z=o}if((z|0)!=-1){break}c[l>>2]=0}}while(0);s=s+4|0;t=a[d]|0}c[b>>2]=c[l>>2];eC(n);i=j;return}}while(0);j=cj(4)|0;k1(j);bA(j|0,22008,138)}function g0(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[6776]|0)!=-1){c[n>>2]=27104;c[n+4>>2]=12;c[n+8>>2]=0;eu(27104,n,98)}n=(c[6777]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}r=k;s=c[p>>2]|0;if((c[6680]|0)!=-1){c[m>>2]=26720;c[m+4>>2]=12;c[m+8>>2]=0;eu(26720,m,98)}m=(c[6681]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;cL[p&15](r,b,f,g)|0;c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=cz[c[(c[k>>2]|0)+44>>2]&63](r,p)|0;p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;w=b+1|0}else{w=b}do{if((f-w|0)>1){if((a[w]|0)!=48){x=w;break}n=w+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){x=w;break}p=k;q=cz[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;y=c[j>>2]|0;c[j>>2]=y+4;c[y>>2]=q;q=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[n]|0)|0;n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(f|0)){q=f-1|0;if(x>>>0<q>>>0){z=x;A=q}else{break}do{q=a[z]|0;a[z]=a[A]|0;a[A]=q;z=z+1|0;A=A-1|0;}while(z>>>0<A>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(x>>>0<f>>>0){n=u+1|0;p=k;y=o+4|0;B=o+8|0;C=0;D=0;E=x;while(1){F=(a[m]&1)==0;do{if((a[(F?n:c[B>>2]|0)+D|0]|0)==0){G=D;H=C}else{if((C|0)!=(a[(F?n:c[B>>2]|0)+D|0]|0)){G=D;H=C;break}I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=q;I=d[m]|0;G=(D>>>0<(((I&1|0)==0?I>>>1:c[y>>2]|0)-1|0)>>>0)+D|0;H=0}}while(0);F=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[E]|0)|0;I=c[j>>2]|0;c[j>>2]=I+4;c[I>>2]=F;F=E+1|0;if(F>>>0<f>>>0){C=H+1|0;D=G;E=F}else{break}}}E=g+(x-b<<2)|0;D=c[j>>2]|0;if((E|0)==(D|0)){break}C=D-4|0;if(E>>>0<C>>>0){J=E;K=C}else{break}do{C=c[J>>2]|0;c[J>>2]=c[K>>2];c[K>>2]=C;J=J+4|0;K=K-4|0;}while(J>>>0<K>>>0)}}while(0);if((e|0)==(f|0)){L=c[j>>2]|0;c[h>>2]=L;ep(o);i=l;return}else{L=g+(e-b<<2)|0;c[h>>2]=L;ep(o);i=l;return}}function g1(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cC[c[(c[d>>2]|0)+48>>2]&63](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){eK(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((cC[c[(c[d>>2]|0)+48>>2]&63](d,r,q)|0)==(q|0)){eC(l);break}c[m>>2]=0;c[b>>2]=0;eC(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((cC[c[(c[d>>2]|0)+48>>2]&63](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function g2(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=l|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);v=gM(u,c[6438]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1550;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1550;break}w=l+2|0}else if((h|0)==32){w=j}else{x=1550}}while(0);if((x|0)==1550){w=u}x=m|0;e4(p,f);g0(u,w,j,x,n,o,p);d4(c[p>>2]|0)|0;c[q>>2]=c[e>>2];g1(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function g3(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[15912]|0;a[q+1|0]=a[15913|0]|0;a[q+2|0]=a[15914|0]|0;a[q+3|0]=a[15915|0]|0;a[q+4|0]=a[15916|0]|0;a[q+5|0]=a[15917|0]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=k|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);v=gM(u,c[6438]|0,q,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+v|0;q=c[s>>2]&176;do{if((q|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1575;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1575;break}w=k+2|0}else if((q|0)==32){w=h}else{x=1575}}while(0);if((x|0)==1575){w=u}x=l|0;e4(o,f);g0(u,w,h,x,m,n,o);d4(c[o>>2]|0)|0;c[p>>2]=c[e>>2];g1(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}function g4(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);v=gM(u,c[6438]|0,r,(B=i,i=i+16|0,c[B>>2]=h,c[B+8>>2]=j,B)|0)|0;j=l+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=1600;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=1600;break}w=l+2|0}else if((h|0)==32){w=j}else{x=1600}}while(0);if((x|0)==1600){w=u}x=m|0;e4(p,f);g0(u,w,j,x,n,o,p);d4(c[p>>2]|0)|0;c[q>>2]=c[e>>2];g1(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}function g5(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=c[6438]|0;if(y){z=gT(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gT(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[27720]|0)==0;if(y){do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lz();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==32){F=z}else if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1656;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1656;break}F=E+2|0}else{G=1656}}while(0);if((G|0)==1656){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=lk(C<<3)|0;A=G;if((G|0)!=0){H=A;I=A;J=E;break}lz();H=A;I=A;J=c[m>>2]|0}}while(0);e4(q,f);g6(J,F,z,H,o,p,q);d4(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];g1(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){ll(I)}if((D|0)==0){i=d;return}ll(D);i=d;return}function g6(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[6776]|0)!=-1){c[n>>2]=27104;c[n+4>>2]=12;c[n+8>>2]=0;eu(27104,n,98)}n=(c[6777]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=cj(4)|0;s=r;k1(s);bA(r|0,22008,138)}r=k;s=c[p>>2]|0;if((c[6680]|0)!=-1){c[m>>2]=26720;c[m+4>>2]=12;c[m+8>>2]=0;eu(26720,m,98)}m=(c[6681]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=cj(4)|0;u=t;k1(u);bA(t|0,22008,138)}t=s;cy[c[(c[s>>2]|0)+20>>2]&127](o,t);c[j>>2]=g;u=a[b]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=cz[c[(c[k>>2]|0)+44>>2]&63](r,u)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=m;v=b+1|0}else{v=b}m=f;L2034:do{if((m-v|0)>1){if((a[v]|0)!=48){w=v;x=1711;break}u=v+1|0;p=a[u]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=v;x=1711;break}p=k;n=cz[c[(c[p>>2]|0)+44>>2]&63](r,48)|0;q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[u]|0)|0;u=c[j>>2]|0;c[j>>2]=u+4;c[u>>2]=q;q=n;while(1){if(q>>>0>=f>>>0){y=q;z=n;break L2034}u=a[q]|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);if((be(u<<24>>24|0,c[6438]|0)|0)==0){y=q;z=n;break}else{q=q+1|0}}}else{w=v;x=1711}}while(0);L2049:do{if((x|0)==1711){while(1){x=0;if(w>>>0>=f>>>0){y=w;z=v;break L2049}q=a[w]|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);if((b9(q<<24>>24|0,c[6438]|0)|0)==0){y=w;z=v;break}else{w=w+1|0;x=1711}}}}while(0);x=o;w=o;v=d[w]|0;if((v&1|0)==0){A=v>>>1}else{A=c[o+4>>2]|0}do{if((A|0)==0){v=c[j>>2]|0;u=c[(c[k>>2]|0)+48>>2]|0;cL[u&15](r,z,y,v)|0;c[j>>2]=(c[j>>2]|0)+(y-z<<2)}else{do{if((z|0)!=(y|0)){v=y-1|0;if(z>>>0<v>>>0){B=z;C=v}else{break}do{v=a[B]|0;a[B]=a[C]|0;a[C]=v;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=cB[c[(c[s>>2]|0)+16>>2]&255](t)|0;if(z>>>0<y>>>0){v=x+1|0;u=o+4|0;n=o+8|0;p=k;D=0;E=0;F=z;while(1){G=(a[w]&1)==0;do{if((a[(G?v:c[n>>2]|0)+E|0]|0)>0){if((D|0)!=(a[(G?v:c[n>>2]|0)+E|0]|0)){H=E;I=D;break}J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=q;J=d[w]|0;H=(E>>>0<(((J&1|0)==0?J>>>1:c[u>>2]|0)-1|0)>>>0)+E|0;I=0}else{H=E;I=D}}while(0);G=cz[c[(c[p>>2]|0)+44>>2]&63](r,a[F]|0)|0;J=c[j>>2]|0;c[j>>2]=J+4;c[J>>2]=G;G=F+1|0;if(G>>>0<y>>>0){D=I+1|0;E=H;F=G}else{break}}}F=g+(z-b<<2)|0;E=c[j>>2]|0;if((F|0)==(E|0)){break}D=E-4|0;if(F>>>0<D>>>0){K=F;L=D}else{break}do{D=c[K>>2]|0;c[K>>2]=c[L>>2];c[L>>2]=D;K=K+4|0;L=L-4|0;}while(K>>>0<L>>>0)}}while(0);L2088:do{if(y>>>0<f>>>0){L=k;K=y;while(1){z=a[K]|0;if(z<<24>>24==46){break}H=cz[c[(c[L>>2]|0)+44>>2]&63](r,z)|0;z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=H;H=K+1|0;if(H>>>0<f>>>0){K=H}else{M=H;break L2088}}L=cB[c[(c[s>>2]|0)+12>>2]&255](t)|0;H=c[j>>2]|0;c[j>>2]=H+4;c[H>>2]=L;M=K+1|0}else{M=y}}while(0);cL[c[(c[k>>2]|0)+48>>2]&15](r,M,f,c[j>>2]|0)|0;r=(c[j>>2]|0)+(m-M<<2)|0;c[j>>2]=r;if((e|0)==(f|0)){N=r;c[h>>2]=N;ep(o);i=l;return}N=g+(e-b<<2)|0;c[h>>2]=N;ep(o);i=l;return}function g7(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);l=c[6438]|0;if(y){z=gT(k,30,l,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{z=gT(k,30,l,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}do{if((z|0)>29){l=(a[27720]|0)==0;if(y){do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0}else{do{if(l){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);A=gU(m,c[6438]|0,t,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0}l=c[m>>2]|0;if((l|0)!=0){C=A;D=l;E=l;break}lz();l=c[m>>2]|0;C=A;D=l;E=l}else{C=z;D=0;E=c[m>>2]|0}}while(0);z=E+C|0;A=c[u>>2]&176;do{if((A|0)==32){F=z}else if((A|0)==16){u=a[E]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){F=E+1|0;break}if(!((C|0)>1&u<<24>>24==48)){G=1808;break}u=a[E+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){G=1808;break}F=E+2|0}else{G=1808}}while(0);if((G|0)==1808){F=E}do{if((E|0)==(k|0)){H=n|0;I=0;J=k}else{G=lk(C<<3)|0;A=G;if((G|0)!=0){H=A;I=A;J=E;break}lz();H=A;I=A;J=c[m>>2]|0}}while(0);e4(q,f);g6(J,F,z,H,o,p,q);d4(c[q>>2]|0)|0;q=e|0;c[s>>2]=c[q>>2];g1(r,s,H,c[o>>2]|0,c[p>>2]|0,f,g);g=c[r>>2]|0;c[q>>2]=g;c[b>>2]=g;if((I|0)!=0){ll(I)}if((D|0)==0){i=d;return}ll(D);i=d;return}function g8(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[15920]|0;a[o+1|0]=a[15921|0]|0;a[o+2|0]=a[15922|0]|0;a[o+3|0]=a[15923|0]|0;a[o+4|0]=a[15924|0]|0;a[o+5|0]=a[15925|0]|0;p=k|0;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);q=gM(p,c[6438]|0,o,(B=i,i=i+8|0,c[B>>2]=h,B)|0)|0;h=k+q|0;o=c[f+4>>2]&176;do{if((o|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=1841;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=1841;break}s=k+2|0}else if((o|0)==32){s=h}else{t=1841}}while(0);if((t|0)==1841){s=p}e4(m,f);t=m|0;m=c[t>>2]|0;if((c[6776]|0)!=-1){c[j>>2]=27104;c[j+4>>2]=12;c[j+8>>2]=0;eu(27104,j,98)}j=(c[6777]|0)-1|0;o=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-o>>2>>>0>j>>>0){r=c[o+(j<<2)>>2]|0;if((r|0)==0){break}u=r;v=c[t>>2]|0;d4(v)|0;v=l|0;w=c[(c[r>>2]|0)+48>>2]|0;cL[w&15](u,p,h,v)|0;u=l+(q<<2)|0;if((s|0)==(h|0)){x=u;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;g1(b,n,v,x,u,f,g);i=d;return}x=l+(s-k<<2)|0;y=e|0;z=c[y>>2]|0;A=n|0;c[A>>2]=z;g1(b,n,v,x,u,f,g);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function g9(a){a=a|0;return 2}function ha(a){a=a|0;dH(a|0);lu(a);return}function hb(a){a=a|0;dH(a|0);return}function hc(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];he(a,b,k,l,f,g,h,15904,15912);i=j;return}function hd(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cB[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}he(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function he(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7>>3<<3;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;e4(p,h);t=p|0;p=c[t>>2]|0;if((c[6778]|0)!=-1){c[o>>2]=27112;c[o+4>>2]=12;c[o+8>>2]=0;eu(27112,o,98)}o=(c[6779]|0)-1|0;u=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-u>>2>>>0>o>>>0){v=c[u+(o<<2)>>2]|0;if((v|0)==0){break}w=v;x=c[t>>2]|0;d4(x)|0;c[j>>2]=0;x=f|0;L2231:do{if((l|0)==(m|0)){y=1931}else{z=g|0;A=v;B=v+8|0;C=v;D=e;E=r|0;F=s|0;G=q|0;H=l;I=0;L2233:while(1){J=I;while(1){if((J|0)!=0){y=1931;break L2231}K=c[x>>2]|0;do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}if((cB[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){L=K;break}c[x>>2]=0;L=0}}while(0);K=(L|0)==0;M=c[z>>2]|0;L2243:do{if((M|0)==0){y=1884}else{do{if((c[M+12>>2]|0)==(c[M+16>>2]|0)){if((cB[c[(c[M>>2]|0)+36>>2]&255](M)|0)!=-1){break}c[z>>2]=0;y=1884;break L2243}}while(0);if(K){N=M}else{y=1885;break L2233}}}while(0);if((y|0)==1884){y=0;if(K){y=1885;break L2233}else{N=0}}if((cC[c[(c[A>>2]|0)+36>>2]&63](w,a[H]|0,0)|0)<<24>>24==37){y=1888;break}M=a[H]|0;if(M<<24>>24>-1){O=c[B>>2]|0;if((b[O+(M<<24>>24<<1)>>1]&8192)!=0){P=H;y=1899;break}}Q=L+12|0;M=c[Q>>2]|0;R=L+16|0;if((M|0)==(c[R>>2]|0)){S=(cB[c[(c[L>>2]|0)+36>>2]&255](L)|0)&255}else{S=a[M]|0}M=cz[c[(c[C>>2]|0)+12>>2]&63](w,S)|0;if(M<<24>>24==(cz[c[(c[C>>2]|0)+12>>2]&63](w,a[H]|0)|0)<<24>>24){y=1926;break}c[j>>2]=4;J=4}L2261:do{if((y|0)==1888){y=0;J=H+1|0;if((J|0)==(m|0)){y=1889;break L2233}M=cC[c[(c[A>>2]|0)+36>>2]&63](w,a[J]|0,0)|0;if((M<<24>>24|0)==69|(M<<24>>24|0)==48){T=H+2|0;if((T|0)==(m|0)){y=1892;break L2233}U=M;V=cC[c[(c[A>>2]|0)+36>>2]&63](w,a[T]|0,0)|0;W=T}else{U=0;V=M;W=J}J=c[(c[D>>2]|0)+36>>2]|0;c[E>>2]=L;c[F>>2]=N;cI[J&7](q,e,r,s,h,j,k,V,U);c[x>>2]=c[G>>2];X=W+1|0}else if((y|0)==1899){while(1){y=0;J=P+1|0;if((J|0)==(m|0)){Y=m;break}M=a[J]|0;if(M<<24>>24<=-1){Y=J;break}if((b[O+(M<<24>>24<<1)>>1]&8192)==0){Y=J;break}else{P=J;y=1899}}K=L;J=N;while(1){do{if((K|0)==0){Z=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){Z=K;break}if((cB[c[(c[K>>2]|0)+36>>2]&255](K)|0)!=-1){Z=K;break}c[x>>2]=0;Z=0}}while(0);M=(Z|0)==0;do{if((J|0)==0){y=1912}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(M){_=J;break}else{X=Y;break L2261}}if((cB[c[(c[J>>2]|0)+36>>2]&255](J)|0)==-1){c[z>>2]=0;y=1912;break}else{if(M^(J|0)==0){_=J;break}else{X=Y;break L2261}}}}while(0);if((y|0)==1912){y=0;if(M){X=Y;break L2261}else{_=0}}T=Z+12|0;$=c[T>>2]|0;aa=Z+16|0;if(($|0)==(c[aa>>2]|0)){ab=(cB[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)&255}else{ab=a[$]|0}if(ab<<24>>24<=-1){X=Y;break L2261}if((b[(c[B>>2]|0)+(ab<<24>>24<<1)>>1]&8192)==0){X=Y;break L2261}$=c[T>>2]|0;if(($|0)==(c[aa>>2]|0)){aa=c[(c[Z>>2]|0)+40>>2]|0;cB[aa&255](Z)|0;K=Z;J=_;continue}else{c[T>>2]=$+1;K=Z;J=_;continue}}}else if((y|0)==1926){y=0;J=c[Q>>2]|0;if((J|0)==(c[R>>2]|0)){K=c[(c[L>>2]|0)+40>>2]|0;cB[K&255](L)|0}else{c[Q>>2]=J+1}X=H+1|0}}while(0);if((X|0)==(m|0)){y=1931;break L2231}H=X;I=c[j>>2]|0}if((y|0)==1889){c[j>>2]=4;ac=L;break}else if((y|0)==1892){c[j>>2]=4;ac=L;break}else if((y|0)==1885){c[j>>2]=4;ac=L;break}}}while(0);if((y|0)==1931){ac=c[x>>2]|0}w=f|0;do{if((ac|0)!=0){if((c[ac+12>>2]|0)!=(c[ac+16>>2]|0)){break}if((cB[c[(c[ac>>2]|0)+36>>2]&255](ac)|0)!=-1){break}c[w>>2]=0}}while(0);x=c[w>>2]|0;v=(x|0)==0;I=g|0;H=c[I>>2]|0;L2319:do{if((H|0)==0){y=1941}else{do{if((c[H+12>>2]|0)==(c[H+16>>2]|0)){if((cB[c[(c[H>>2]|0)+36>>2]&255](H)|0)!=-1){break}c[I>>2]=0;y=1941;break L2319}}while(0);if(!v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);do{if((y|0)==1941){if(v){break}ad=d|0;c[ad>>2]=x;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ad=d|0;c[ad>>2]=x;i=n;return}}while(0);n=cj(4)|0;k1(n);bA(n|0,22008,138)}function hf(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;e4(m,f);f=m|0;m=c[f>>2]|0;if((c[6778]|0)!=-1){c[l>>2]=27112;c[l+4>>2]=12;c[l+8>>2]=0;eu(27112,l,98)}l=(c[6779]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;d4(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(f2(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=cj(4)|0;k1(j);bA(j|0,22008,138)}function hg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;e4(m,f);f=m|0;m=c[f>>2]|0;if((c[6778]|0)!=-1){c[l>>2]=27112;c[l+4>>2]=12;c[l+8>>2]=0;eu(27112,l,98)}l=(c[6779]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;d4(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(f2(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=cj(4)|0;k1(j);bA(j|0,22008,138)}function hh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;e4(l,f);f=l|0;l=c[f>>2]|0;if((c[6778]|0)!=-1){c[k>>2]=27112;c[k+4>>2]=12;c[k+8>>2]=0;eu(27112,k,98)}k=(c[6779]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;d4(n)|0;c[j>>2]=c[e>>2];n=hm(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=cj(4)|0;k1(b);bA(b|0,22008,138)}function hi(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;j=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L2377:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((cB[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L2386:do{if((l|0)==0){m=1997}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((cB[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[e>>2]=0;m=1997;break L2386}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L2377}}}while(0);if((m|0)==1997){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(cB[c[(c[l>>2]|0)+36>>2]&255](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cB[u&255](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){v=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){v=o;break}if((cB[c[(c[o>>2]|0)+36>>2]&255](o)|0)==-1){c[j>>2]=0;v=0;break}else{v=c[j>>2]|0;break}}}while(0);j=(v|0)==0;do{if(q){m=2016}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((cB[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[e>>2]=0;m=2016;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==2016){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function hj(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;e4(z,g);_=z|0;z=c[_>>2]|0;if((c[6778]|0)!=-1){c[y>>2]=27112;c[y+4>>2]=12;c[y+8>>2]=0;eu(27112,y,98)}y=(c[6779]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;d4(aa)|0;aa=k<<24>>24;L2434:do{if((aa|0)==120){ac=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];cw[ac&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==88){ac=d+8|0;ad=cB[c[(c[ac>>2]|0)+24>>2]&255](ac)|0;ac=e|0;c[X>>2]=c[ac>>2];c[Y>>2]=c[f>>2];ae=ad;af=a[ad]|0;if((af&1)==0){ag=ae+1|0;ah=ae+1|0}else{ae=c[ad+8>>2]|0;ag=ae;ah=ae}ae=af&255;if((ae&1|0)==0){ai=ae>>>1}else{ai=c[ad+4>>2]|0}he(W,d,X,Y,g,h,j,ah,ag+ai|0);c[ac>>2]=c[W>>2]}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=hm(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==72){c[u>>2]=c[f>>2];ac=hm(e,u,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<24){c[j+8>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==100|(aa|0)==101){ad=j+12|0;c[v>>2]=c[f>>2];ac=hm(e,v,h,ab,2)|0;ae=c[h>>2]|0;do{if((ae&4|0)==0){if((ac-1|0)>>>0>=31){break}c[ad>>2]=ac;break L2434}}while(0);c[h>>2]=ae|4}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];hi(0,e,J,h,ab)}else if((aa|0)==84){ac=e|0;c[S>>2]=c[ac>>2];c[T>>2]=c[f>>2];he(R,d,S,T,g,h,j,15856,15864);c[ac>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];ac=hm(e,o,h,ab,1)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<7){c[j+24>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==99){ad=d+8|0;ac=cB[c[(c[ad>>2]|0)+12>>2]&255](ad)|0;ad=e|0;c[B>>2]=c[ad>>2];c[C>>2]=c[f>>2];af=ac;aj=a[ac]|0;if((aj&1)==0){ak=af+1|0;al=af+1|0}else{af=c[ac+8>>2]|0;ak=af;al=af}af=aj&255;if((af&1|0)==0){am=af>>>1}else{am=c[ac+4>>2]|0}he(A,d,B,C,g,h,j,al,ak+am|0);c[ad>>2]=c[A>>2]}else if((aa|0)==112){c[K>>2]=c[f>>2];hk(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ad=e|0;c[M>>2]=c[ad>>2];c[N>>2]=c[f>>2];he(L,d,M,N,g,h,j,15872,15883);c[ad>>2]=c[L>>2]}else if((aa|0)==77){c[q>>2]=c[f>>2];ad=hm(e,q,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<60){c[j+4>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==70){ac=e|0;c[H>>2]=c[ac>>2];c[I>>2]=c[f>>2];he(G,d,H,I,g,h,j,15888,15896);c[ac>>2]=c[G>>2]}else if((aa|0)==68){ac=e|0;c[E>>2]=c[ac>>2];c[F>>2]=c[f>>2];he(D,d,E,F,g,h,j,15896,15904);c[ac>>2]=c[D>>2]}else if((aa|0)==109){c[r>>2]=c[f>>2];ac=(hm(e,r,h,ab,2)|0)-1|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<12){c[j+16>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==106){c[s>>2]=c[f>>2];ad=hm(e,s,h,ab,3)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<366){c[j+28>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==37){c[Z>>2]=c[f>>2];hl(0,e,Z,h,ab)}else if((aa|0)==97|(aa|0)==65){ac=c[f>>2]|0;ad=d+8|0;af=cB[c[c[ad>>2]>>2]&255](ad)|0;c[x>>2]=ac;ac=(f2(e,x,af,af+168|0,ab,h,0)|0)-af|0;if((ac|0)>=168){break}c[j+24>>2]=((ac|0)/12|0|0)%7|0}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ac=c[f>>2]|0;af=d+8|0;ad=cB[c[(c[af>>2]|0)+4>>2]&255](af)|0;c[w>>2]=ac;ac=(f2(e,w,ad,ad+288|0,ab,h,0)|0)-ad|0;if((ac|0)>=288){break}c[j+16>>2]=((ac|0)/12|0|0)%12|0}else if((aa|0)==73){ac=j+8|0;c[t>>2]=c[f>>2];ad=hm(e,t,h,ab,2)|0;af=c[h>>2]|0;do{if((af&4|0)==0){if((ad-1|0)>>>0>=12){break}c[ac>>2]=ad;break L2434}}while(0);c[h>>2]=af|4}else if((aa|0)==82){ad=e|0;c[P>>2]=c[ad>>2];c[Q>>2]=c[f>>2];he(O,d,P,Q,g,h,j,15864,15869);c[ad>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ad=hm(e,p,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<61){c[j>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==121){c[n>>2]=c[f>>2];ac=hm(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ac|0)<69){an=ac+2e3|0}else{an=(ac-69|0)>>>0<31?ac+1900|0:ac}c[j+20>>2]=an-1900}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=cj(4)|0;k1(l);bA(l|0,22008,138)}function hk(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cB[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=f2(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function hl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L2547:do{if((e|0)==0){k=2127}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cB[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[j>>2]=0;k=2127;break L2547}}while(0);if(d){l=e;m=0}else{k=2128}}}while(0);if((k|0)==2127){if(d){k=2128}else{l=0;m=1}}if((k|0)==2128){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{n=a[e]|0}if((cC[c[(c[g>>2]|0)+36>>2]&63](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){d=c[(c[n>>2]|0)+40>>2]|0;cB[d&255](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((cB[c[(c[e>>2]|0)+36>>2]&255](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=2147}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((cB[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[j>>2]=0;k=2147;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==2147){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}
function hm(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;j=i;k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L2601:do{if((e|0)==0){m=2167}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cB[c[(c[e>>2]|0)+36>>2]&255](e)|0)!=-1){break}c[l>>2]=0;m=2167;break L2601}}while(0);if(d){n=e}else{m=2168}}}while(0);if((m|0)==2167){if(d){m=2168}else{n=0}}if((m|0)==2168){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(cB[c[(c[d>>2]|0)+36>>2]&255](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(cC[c[(c[d>>2]|0)+36>>2]&63](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){u=c[(c[r>>2]|0)+40>>2]|0;cB[u&255](r)|0;v=q;w=h;x=n}else{c[s>>2]=t+1;v=q;w=h;x=n}while(1){y=v-48|0;q=w-1|0;t=c[k>>2]|0;do{if((t|0)==0){z=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){z=t;break}if((cB[c[(c[t>>2]|0)+36>>2]&255](t)|0)==-1){c[k>>2]=0;z=0;break}else{z=c[k>>2]|0;break}}}while(0);t=(z|0)==0;if((x|0)==0){A=z;B=0}else{do{if((c[x+12>>2]|0)==(c[x+16>>2]|0)){if((cB[c[(c[x>>2]|0)+36>>2]&255](x)|0)!=-1){C=x;break}c[l>>2]=0;C=0}else{C=x}}while(0);A=c[k>>2]|0;B=C}D=(B|0)==0;if(!((t^D)&(q|0)>0)){m=2197;break}s=c[A+12>>2]|0;if((s|0)==(c[A+16>>2]|0)){E=(cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)&255}else{E=a[s]|0}if(E<<24>>24<=-1){o=y;m=2215;break}if((b[(c[e>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=y;m=2216;break}s=((cC[c[(c[d>>2]|0)+36>>2]&63](g,E,0)|0)<<24>>24)+(y*10|0)|0;r=c[k>>2]|0;u=r+12|0;F=c[u>>2]|0;if((F|0)==(c[r+16>>2]|0)){G=c[(c[r>>2]|0)+40>>2]|0;cB[G&255](r)|0;v=s;w=q;x=B;continue}else{c[u>>2]=F+1;v=s;w=q;x=B;continue}}if((m|0)==2197){do{if((A|0)==0){H=0}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){H=A;break}if((cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[k>>2]=0;H=0;break}else{H=c[k>>2]|0;break}}}while(0);d=(H|0)==0;L2658:do{if(D){m=2207}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){break}c[l>>2]=0;m=2207;break L2658}}while(0);if(d){o=y}else{break}i=j;return o|0}}while(0);do{if((m|0)==2207){if(d){break}else{o=y}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=y;i=j;return o|0}else if((m|0)==2216){i=j;return o|0}else if((m|0)==2215){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function hn(a){a=a|0;return 2}function ho(a){a=a|0;dH(a|0);lu(a);return}function hp(a){a=a|0;dH(a|0);return}function hq(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];hs(a,b,k,l,f,g,h,15824,15856);i=j;return}function hr(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cB[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=a[o]|0;if((f&1)==0){p=o+4|0;q=o+4|0}else{e=c[o+8>>2]|0;p=e;q=e}e=f&255;if((e&1|0)==0){r=e>>>1}else{r=c[o+4>>2]|0}hs(b,d,l,m,g,h,j,q,p+(r<<2)|0);i=k;return}function hs(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+48|0;m=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[m>>2];m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=l|0;n=l+16|0;o=l+24|0;p=l+32|0;q=l+40|0;e4(n,f);r=n|0;n=c[r>>2]|0;if((c[6776]|0)!=-1){c[m>>2]=27104;c[m+4>>2]=12;c[m+8>>2]=0;eu(27104,m,98)}m=(c[6777]|0)-1|0;s=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-s>>2>>>0>m>>>0){t=c[s+(m<<2)>>2]|0;if((t|0)==0){break}u=t;v=c[r>>2]|0;d4(v)|0;c[g>>2]=0;v=d|0;L2694:do{if((j|0)==(k|0)){w=2298}else{x=e|0;y=t;z=t;A=t;B=b;C=p|0;D=q|0;E=o|0;F=j;G=0;L2696:while(1){H=G;while(1){if((H|0)!=0){w=2298;break L2694}I=c[v>>2]|0;do{if((I|0)==0){J=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){L=cB[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{L=c[K>>2]|0}if((L|0)!=-1){J=I;break}c[v>>2]=0;J=0}}while(0);I=(J|0)==0;K=c[x>>2]|0;do{if((K|0)==0){w=2250}else{M=c[K+12>>2]|0;if((M|0)==(c[K+16>>2]|0)){N=cB[c[(c[K>>2]|0)+36>>2]&255](K)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[x>>2]=0;w=2250;break}else{if(I^(K|0)==0){O=K;break}else{w=2252;break L2696}}}}while(0);if((w|0)==2250){w=0;if(I){w=2252;break L2696}else{O=0}}if((cC[c[(c[y>>2]|0)+52>>2]&63](u,c[F>>2]|0,0)|0)<<24>>24==37){w=2255;break}if(cC[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[F>>2]|0)|0){P=F;w=2265;break}Q=J+12|0;K=c[Q>>2]|0;R=J+16|0;if((K|0)==(c[R>>2]|0)){S=cB[c[(c[J>>2]|0)+36>>2]&255](J)|0}else{S=c[K>>2]|0}K=cz[c[(c[A>>2]|0)+28>>2]&63](u,S)|0;if((K|0)==(cz[c[(c[A>>2]|0)+28>>2]&63](u,c[F>>2]|0)|0)){w=2293;break}c[g>>2]=4;H=4}L2728:do{if((w|0)==2293){w=0;H=c[Q>>2]|0;if((H|0)==(c[R>>2]|0)){K=c[(c[J>>2]|0)+40>>2]|0;cB[K&255](J)|0}else{c[Q>>2]=H+4}T=F+4|0}else if((w|0)==2255){w=0;H=F+4|0;if((H|0)==(k|0)){w=2256;break L2696}K=cC[c[(c[y>>2]|0)+52>>2]&63](u,c[H>>2]|0,0)|0;if((K<<24>>24|0)==69|(K<<24>>24|0)==48){M=F+8|0;if((M|0)==(k|0)){w=2259;break L2696}U=K;V=cC[c[(c[y>>2]|0)+52>>2]&63](u,c[M>>2]|0,0)|0;W=M}else{U=0;V=K;W=H}H=c[(c[B>>2]|0)+36>>2]|0;c[C>>2]=J;c[D>>2]=O;cI[H&7](o,b,p,q,f,g,h,V,U);c[v>>2]=c[E>>2];T=W+4|0}else if((w|0)==2265){while(1){w=0;H=P+4|0;if((H|0)==(k|0)){X=k;break}if(cC[c[(c[z>>2]|0)+12>>2]&63](u,8192,c[H>>2]|0)|0){P=H;w=2265}else{X=H;break}}I=J;H=O;while(1){do{if((I|0)==0){Y=0}else{K=c[I+12>>2]|0;if((K|0)==(c[I+16>>2]|0)){Z=cB[c[(c[I>>2]|0)+36>>2]&255](I)|0}else{Z=c[K>>2]|0}if((Z|0)!=-1){Y=I;break}c[v>>2]=0;Y=0}}while(0);K=(Y|0)==0;do{if((H|0)==0){w=2280}else{M=c[H+12>>2]|0;if((M|0)==(c[H+16>>2]|0)){_=cB[c[(c[H>>2]|0)+36>>2]&255](H)|0}else{_=c[M>>2]|0}if((_|0)==-1){c[x>>2]=0;w=2280;break}else{if(K^(H|0)==0){$=H;break}else{T=X;break L2728}}}}while(0);if((w|0)==2280){w=0;if(K){T=X;break L2728}else{$=0}}M=Y+12|0;aa=c[M>>2]|0;ab=Y+16|0;if((aa|0)==(c[ab>>2]|0)){ac=cB[c[(c[Y>>2]|0)+36>>2]&255](Y)|0}else{ac=c[aa>>2]|0}if(!(cC[c[(c[z>>2]|0)+12>>2]&63](u,8192,ac)|0)){T=X;break L2728}aa=c[M>>2]|0;if((aa|0)==(c[ab>>2]|0)){ab=c[(c[Y>>2]|0)+40>>2]|0;cB[ab&255](Y)|0;I=Y;H=$;continue}else{c[M>>2]=aa+4;I=Y;H=$;continue}}}}while(0);if((T|0)==(k|0)){w=2298;break L2694}F=T;G=c[g>>2]|0}if((w|0)==2252){c[g>>2]=4;ad=J;break}else if((w|0)==2256){c[g>>2]=4;ad=J;break}else if((w|0)==2259){c[g>>2]=4;ad=J;break}}}while(0);if((w|0)==2298){ad=c[v>>2]|0}u=d|0;do{if((ad|0)!=0){t=c[ad+12>>2]|0;if((t|0)==(c[ad+16>>2]|0)){ae=cB[c[(c[ad>>2]|0)+36>>2]&255](ad)|0}else{ae=c[t>>2]|0}if((ae|0)!=-1){break}c[u>>2]=0}}while(0);v=c[u>>2]|0;t=(v|0)==0;G=e|0;F=c[G>>2]|0;do{if((F|0)==0){w=2311}else{z=c[F+12>>2]|0;if((z|0)==(c[F+16>>2]|0)){af=cB[c[(c[F>>2]|0)+36>>2]&255](F)|0}else{af=c[z>>2]|0}if((af|0)==-1){c[G>>2]=0;w=2311;break}if(!(t^(F|0)==0)){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);do{if((w|0)==2311){if(t){break}ag=a|0;c[ag>>2]=v;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ag=a|0;c[ag>>2]=v;i=l;return}}while(0);l=cj(4)|0;k1(l);bA(l|0,22008,138)}function ht(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;e4(m,f);f=m|0;m=c[f>>2]|0;if((c[6776]|0)!=-1){c[l>>2]=27104;c[l+4>>2]=12;c[l+8>>2]=0;eu(27104,l,98)}l=(c[6777]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;d4(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[c[q>>2]>>2]&255](q)|0;c[k>>2]=o;o=(gt(d,k,r,r+168|0,p,g,0)|0)-r|0;if((o|0)>=168){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+24>>2]=((o|0)/12|0|0)%7|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=cj(4)|0;k1(j);bA(j|0,22008,138)}function hu(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;e4(m,f);f=m|0;m=c[f>>2]|0;if((c[6776]|0)!=-1){c[l>>2]=27104;c[l+4>>2]=12;c[l+8>>2]=0;eu(27104,l,98)}l=(c[6777]|0)-1|0;n=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-n>>2>>>0>l>>>0){o=c[n+(l<<2)>>2]|0;if((o|0)==0){break}p=o;o=c[f>>2]|0;d4(o)|0;o=c[e>>2]|0;q=b+8|0;r=cB[c[(c[q>>2]|0)+4>>2]&255](q)|0;c[k>>2]=o;o=(gt(d,k,r,r+288|0,p,g,0)|0)-r|0;if((o|0)>=288){s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}c[h+16>>2]=((o|0)/12|0|0)%12|0;s=d|0;t=c[s>>2]|0;u=a|0;c[u>>2]=t;i=j;return}}while(0);j=cj(4)|0;k1(j);bA(j|0,22008,138)}function hv(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;e4(l,f);f=l|0;l=c[f>>2]|0;if((c[6776]|0)!=-1){c[k>>2]=27104;c[k+4>>2]=12;c[k+8>>2]=0;eu(27104,k,98)}k=(c[6777]|0)-1|0;m=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-m>>2>>>0>k>>>0){n=c[m+(k<<2)>>2]|0;if((n|0)==0){break}o=n;n=c[f>>2]|0;d4(n)|0;c[j>>2]=c[e>>2];n=hA(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}if((n|0)<69){s=n+2e3|0}else{s=(n-69|0)>>>0<31?n+1900|0:n}c[h+20>>2]=s-1900;p=d|0;q=c[p>>2]|0;r=a|0;c[r>>2]=q;i=b;return}}while(0);b=cj(4)|0;k1(b);bA(b|0,22008,138)}function hw(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=d|0;d=f;L2852:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=2371}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=2371;break}else{k=(h|0)==0;if(j^k){o=h;p=k;break}else{q=h;r=k;break L2852}}}}while(0);if((m|0)==2371){m=0;if(j){q=0;r=1;break}else{o=0;p=1}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){s=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{s=c[k>>2]|0}if(!(cC[c[(c[d>>2]|0)+12>>2]&63](f,8192,s)|0)){q=o;r=p;break}k=c[g>>2]|0;h=k+12|0;t=c[h>>2]|0;if((t|0)==(c[k+16>>2]|0)){u=c[(c[k>>2]|0)+40>>2]|0;cB[u&255](k)|0;continue}else{c[h>>2]=t+4;continue}}p=c[g>>2]|0;do{if((p|0)==0){v=1}else{o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){w=cB[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{w=c[o>>2]|0}if((w|0)==-1){c[g>>2]=0;v=1;break}else{v=(c[g>>2]|0)==0;break}}}while(0);do{if(r){m=2393}else{g=c[q+12>>2]|0;if((g|0)==(c[q+16>>2]|0)){x=cB[c[(c[q>>2]|0)+36>>2]&255](q)|0}else{x=c[g>>2]|0}if((x|0)==-1){c[b>>2]=0;m=2393;break}if(!(v^(q|0)==0)){break}i=a;return}}while(0);do{if((m|0)==2393){if(v){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function hx(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+112|0;A=l+120|0;B=l+128|0;C=l+136|0;D=l+144|0;E=l+152|0;F=l+160|0;G=l+168|0;H=l+176|0;I=l+184|0;J=l+192|0;K=l+200|0;L=l+208|0;M=l+216|0;N=l+224|0;O=l+232|0;P=l+240|0;Q=l+248|0;R=l+256|0;S=l+264|0;T=l+272|0;U=l+280|0;V=l+288|0;W=l+296|0;X=l+304|0;Y=l+312|0;Z=l+320|0;c[h>>2]=0;e4(z,g);_=z|0;z=c[_>>2]|0;if((c[6776]|0)!=-1){c[y>>2]=27104;c[y+4>>2]=12;c[y+8>>2]=0;eu(27104,y,98)}y=(c[6777]|0)-1|0;$=c[z+8>>2]|0;do{if((c[z+12>>2]|0)-$>>2>>>0>y>>>0){aa=c[$+(y<<2)>>2]|0;if((aa|0)==0){break}ab=aa;aa=c[_>>2]|0;d4(aa)|0;aa=k<<24>>24;L2917:do{if((aa|0)==77){c[q>>2]=c[f>>2];ac=hA(e,q,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<60){c[j+4>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==82){ad=e|0;c[P>>2]=c[ad>>2];c[Q>>2]=c[f>>2];hs(O,d,P,Q,g,h,j,15720,15740);c[ad>>2]=c[O>>2]}else if((aa|0)==83){c[p>>2]=c[f>>2];ad=hA(e,p,h,ab,2)|0;ac=c[h>>2]|0;if((ac&4|0)==0&(ad|0)<61){c[j>>2]=ad;break}else{c[h>>2]=ac|4;break}}else if((aa|0)==110|(aa|0)==116){c[J>>2]=c[f>>2];hw(0,e,J,h,ab)}else if((aa|0)==121){c[n>>2]=c[f>>2];ac=hA(e,n,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}if((ac|0)<69){ae=ac+2e3|0}else{ae=(ac-69|0)>>>0<31?ac+1900|0:ac}c[j+20>>2]=ae-1900}else if((aa|0)==89){c[m>>2]=c[f>>2];ac=hA(e,m,h,ab,4)|0;if((c[h>>2]&4|0)!=0){break}c[j+20>>2]=ac-1900}else if((aa|0)==70){ac=e|0;c[H>>2]=c[ac>>2];c[I>>2]=c[f>>2];hs(G,d,H,I,g,h,j,15656,15688);c[ac>>2]=c[G>>2]}else if((aa|0)==72){c[u>>2]=c[f>>2];ac=hA(e,u,h,ab,2)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(ac|0)<24){c[j+8>>2]=ac;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==68){ad=e|0;c[E>>2]=c[ad>>2];c[F>>2]=c[f>>2];hs(D,d,E,F,g,h,j,15792,15824);c[ad>>2]=c[D>>2]}else if((aa|0)==98|(aa|0)==66|(aa|0)==104){ad=c[f>>2]|0;ac=d+8|0;af=cB[c[(c[ac>>2]|0)+4>>2]&255](ac)|0;c[w>>2]=ad;ad=(gt(e,w,af,af+288|0,ab,h,0)|0)-af|0;if((ad|0)>=288){break}c[j+16>>2]=((ad|0)/12|0|0)%12|0}else if((aa|0)==37){c[Z>>2]=c[f>>2];hz(0,e,Z,h,ab)}else if((aa|0)==106){c[s>>2]=c[f>>2];ad=hA(e,s,h,ab,3)|0;af=c[h>>2]|0;if((af&4|0)==0&(ad|0)<366){c[j+28>>2]=ad;break}else{c[h>>2]=af|4;break}}else if((aa|0)==84){af=e|0;c[S>>2]=c[af>>2];c[T>>2]=c[f>>2];hs(R,d,S,T,g,h,j,15688,15720);c[af>>2]=c[R>>2]}else if((aa|0)==119){c[o>>2]=c[f>>2];af=hA(e,o,h,ab,1)|0;ad=c[h>>2]|0;if((ad&4|0)==0&(af|0)<7){c[j+24>>2]=af;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==112){c[K>>2]=c[f>>2];hy(d,j+8|0,e,K,h,ab)}else if((aa|0)==114){ad=e|0;c[M>>2]=c[ad>>2];c[N>>2]=c[f>>2];hs(L,d,M,N,g,h,j,15744,15788);c[ad>>2]=c[L>>2]}else if((aa|0)==120){ad=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];cw[ad&127](b,d,U,V,g,h,j);i=l;return}else if((aa|0)==88){ad=d+8|0;af=cB[c[(c[ad>>2]|0)+24>>2]&255](ad)|0;ad=e|0;c[X>>2]=c[ad>>2];c[Y>>2]=c[f>>2];ac=a[af]|0;if((ac&1)==0){ag=af+4|0;ah=af+4|0}else{ai=c[af+8>>2]|0;ag=ai;ah=ai}ai=ac&255;if((ai&1|0)==0){aj=ai>>>1}else{aj=c[af+4>>2]|0}hs(W,d,X,Y,g,h,j,ah,ag+(aj<<2)|0);c[ad>>2]=c[W>>2]}else if((aa|0)==99){ad=d+8|0;af=cB[c[(c[ad>>2]|0)+12>>2]&255](ad)|0;ad=e|0;c[B>>2]=c[ad>>2];c[C>>2]=c[f>>2];ai=a[af]|0;if((ai&1)==0){ak=af+4|0;al=af+4|0}else{ac=c[af+8>>2]|0;ak=ac;al=ac}ac=ai&255;if((ac&1|0)==0){am=ac>>>1}else{am=c[af+4>>2]|0}hs(A,d,B,C,g,h,j,al,ak+(am<<2)|0);c[ad>>2]=c[A>>2]}else if((aa|0)==73){ad=j+8|0;c[t>>2]=c[f>>2];af=hA(e,t,h,ab,2)|0;ac=c[h>>2]|0;do{if((ac&4|0)==0){if((af-1|0)>>>0>=12){break}c[ad>>2]=af;break L2917}}while(0);c[h>>2]=ac|4}else if((aa|0)==109){c[r>>2]=c[f>>2];af=(hA(e,r,h,ab,2)|0)-1|0;ad=c[h>>2]|0;if((ad&4|0)==0&(af|0)<12){c[j+16>>2]=af;break}else{c[h>>2]=ad|4;break}}else if((aa|0)==100|(aa|0)==101){ad=j+12|0;c[v>>2]=c[f>>2];af=hA(e,v,h,ab,2)|0;ai=c[h>>2]|0;do{if((ai&4|0)==0){if((af-1|0)>>>0>=31){break}c[ad>>2]=af;break L2917}}while(0);c[h>>2]=ai|4}else if((aa|0)==97|(aa|0)==65){af=c[f>>2]|0;ad=d+8|0;ac=cB[c[c[ad>>2]>>2]&255](ad)|0;c[x>>2]=af;af=(gt(e,x,ac,ac+168|0,ab,h,0)|0)-ac|0;if((af|0)>=168){break}c[j+24>>2]=((af|0)/12|0|0)%7|0}else{c[h>>2]=c[h>>2]|4}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=cj(4)|0;k1(l);bA(l|0,22008,138)}function hy(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cB[c[(c[l>>2]|0)+8>>2]&255](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=gt(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function hz(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;g=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[g>>2];g=b|0;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=cB[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=2506}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=cB[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=2506;break}else{b=(d|0)==0;if(h^b){n=d;o=b;break}else{l=2508;break}}}}while(0);if((l|0)==2506){if(h){l=2508}else{n=0;o=1}}if((l|0)==2508){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){p=cB[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{p=c[d>>2]|0}if((cC[c[(c[f>>2]|0)+52>>2]&63](f,p,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}p=c[g>>2]|0;f=p+12|0;d=c[f>>2]|0;if((d|0)==(c[p+16>>2]|0)){h=c[(c[p>>2]|0)+40>>2]|0;cB[h&255](p)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){q=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){r=cB[c[(c[d>>2]|0)+36>>2]&255](d)|0}else{r=c[f>>2]|0}if((r|0)==-1){c[g>>2]=0;q=1;break}else{q=(c[g>>2]|0)==0;break}}}while(0);do{if(o){l=2530}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){s=cB[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{s=c[g>>2]|0}if((s|0)==-1){c[k>>2]=0;l=2530;break}if(!(q^(n|0)==0)){break}i=a;return}}while(0);do{if((l|0)==2530){if(q){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function hA(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=b;b=i;i=i+4|0;i=i+7>>3<<3;c[b>>2]=c[h>>2];h=a|0;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=cB[c[(c[a>>2]|0)+36>>2]&255](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b|0;b=c[l>>2]|0;do{if((b|0)==0){m=2552}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=cB[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=2552;break}else{if(j^(b|0)==0){o=b;break}else{m=2554;break}}}}while(0);if((m|0)==2552){if(j){m=2554}else{o=0}}if((m|0)==2554){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=cB[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{q=c[b>>2]|0}b=e;if(!(cC[c[(c[b>>2]|0)+12>>2]&63](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(cC[c[(c[j>>2]|0)+52>>2]&63](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){r=c[(c[q>>2]|0)+40>>2]|0;cB[r&255](q)|0;s=n;t=f;u=o}else{c[a>>2]=k+4;s=n;t=f;u=o}while(1){v=s-48|0;o=t-1|0;f=c[h>>2]|0;do{if((f|0)==0){w=0}else{n=c[f+12>>2]|0;if((n|0)==(c[f+16>>2]|0)){x=cB[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{x=c[n>>2]|0}if((x|0)==-1){c[h>>2]=0;w=0;break}else{w=c[h>>2]|0;break}}}while(0);f=(w|0)==0;if((u|0)==0){y=w;z=0}else{n=c[u+12>>2]|0;if((n|0)==(c[u+16>>2]|0)){A=cB[c[(c[u>>2]|0)+36>>2]&255](u)|0}else{A=c[n>>2]|0}if((A|0)==-1){c[l>>2]=0;B=0}else{B=u}y=c[h>>2]|0;z=B}C=(z|0)==0;if(!((f^C)&(o|0)>0)){break}f=c[y+12>>2]|0;if((f|0)==(c[y+16>>2]|0)){D=cB[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{D=c[f>>2]|0}if(!(cC[c[(c[b>>2]|0)+12>>2]&63](e,2048,D)|0)){p=v;m=2605;break}f=((cC[c[(c[j>>2]|0)+52>>2]&63](e,D,0)|0)<<24>>24)+(v*10|0)|0;n=c[h>>2]|0;k=n+12|0;a=c[k>>2]|0;if((a|0)==(c[n+16>>2]|0)){q=c[(c[n>>2]|0)+40>>2]|0;cB[q&255](n)|0;s=f;t=o;u=z;continue}else{c[k>>2]=a+4;s=f;t=o;u=z;continue}}if((m|0)==2605){i=g;return p|0}do{if((y|0)==0){E=1}else{u=c[y+12>>2]|0;if((u|0)==(c[y+16>>2]|0)){F=cB[c[(c[y>>2]|0)+36>>2]&255](y)|0}else{F=c[u>>2]|0}if((F|0)==-1){c[h>>2]=0;E=1;break}else{E=(c[h>>2]|0)==0;break}}}while(0);do{if(C){m=2598}else{h=c[z+12>>2]|0;if((h|0)==(c[z+16>>2]|0)){G=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{G=c[h>>2]|0}if((G|0)==-1){c[l>>2]=0;m=2598;break}if(E^(z|0)==0){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==2598){if(E){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function hB(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+112|0;f=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[f>>2];f=g|0;l=g+8|0;m=l|0;n=f|0;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(k<<24>>24!=0){a[o]=k;a[p]=j}j=by(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b|0;c[r>>2]=q;i=g;return}else{s=l;t=m}while(1){m=a[t]|0;if((s|0)==0){u=0}else{l=s+24|0;j=c[l>>2]|0;if((j|0)==(c[s+28>>2]|0)){v=cz[c[(c[s>>2]|0)+52>>2]&63](s,m&255)|0}else{c[l>>2]=j+1;a[j]=m;v=m&255}u=(v|0)==-1?0:s}m=t+1|0;if((m|0)==(d|0)){q=u;break}else{s=u;t=m}}r=b|0;c[r>>2]=q;i=g;return}function hC(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+408|0;e=d;d=i;i=i+4|0;i=i+7>>3<<3;c[d>>2]=c[e>>2];e=f|0;k=f+400|0;l=e|0;c[k>>2]=e+400;ir(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a|0;c[n>>2]=m;i=f;return}else{o=k;p=l}while(1){l=c[p>>2]|0;if((o|0)==0){q=0}else{k=o+24|0;d=c[k>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=cz[c[(c[o>>2]|0)+52>>2]&63](o,l)|0}else{c[k>>2]=d+4;c[d>>2]=l;r=l}q=(r|0)==-1?0:o}l=p+4|0;if((l|0)==(j|0)){m=q;break}else{o=q;p=l}}n=a|0;c[n>>2]=m;i=f;return}function hD(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dH(a|0);lu(a);return}function hE(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dH(a|0);return}function hF(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dH(a|0);lu(a);return}function hG(a){a=a|0;var b=0;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dH(a|0);return}function hH(a){a=a|0;return 127}function hI(a){a=a|0;return 127}function hJ(a){a=a|0;return 0}function hK(a){a=a|0;return 127}function hL(a){a=a|0;return 127}function hM(a){a=a|0;return 0}function hN(a){a=a|0;return 2147483647}function hO(a){a=a|0;return 2147483647}function hP(a){a=a|0;return 0}function hQ(a){a=a|0;return 2147483647}function hR(a){a=a|0;return 2147483647}function hS(a){a=a|0;return 0}function hT(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hU(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hV(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hW(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hX(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hY(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function hZ(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function h_(b,c){b=b|0;c=c|0;c=b;C=67109634;a[c]=C&255;C=C>>8;a[c+1|0]=C&255;C=C>>8;a[c+2|0]=C&255;C=C>>8;a[c+3|0]=C&255;return}function h$(a){a=a|0;dH(a|0);lu(a);return}function h0(a){a=a|0;dH(a|0);return}function h1(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function h2(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function h3(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function h4(a,b){a=a|0;b=b|0;ey(a,1,45);return}function h5(a){a=a|0;dH(a|0);lu(a);return}function h6(a){a=a|0;dH(a|0);return}function h7(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function h8(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function h9(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function ia(a,b){a=a|0;b=b|0;ey(a,1,45);return}function ib(a){a=a|0;dH(a|0);lu(a);return}function ic(a){a=a|0;dH(a|0);return}function id(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function ie(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function ig(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function ih(a,b){a=a|0;b=b|0;eK(a,1,45);return}function ii(a){a=a|0;dH(a|0);lu(a);return}function ij(a){a=a|0;dH(a|0);return}function ik(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function il(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function im(a,b){a=a|0;b=b|0;lC(a|0,0,12);return}function io(a,b){a=a|0;b=b|0;eK(a,1,45);return}function ip(a){a=a|0;dH(a|0);lu(a);return}function iq(a){a=a|0;dH(a|0);return}function ir(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j|0;l=j+112|0;m=i;i=i+4|0;i=i+7>>3<<3;n=j+8|0;o=k|0;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(h<<24>>24!=0){a[p]=h;a[q]=g}g=b|0;by(n|0,100,o|0,f|0,c[g>>2]|0)|0;c[l>>2]=0;c[l+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=b1(c[g>>2]|0)|0;g=kR(d,m,n,l)|0;if((f|0)!=0){b1(f|0)|0}if((g|0)==-1){iy(4056)}else{c[e>>2]=d+(g<<2);i=j;return}}function is(a){a=a|0;return}function it(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+280|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=d+176|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=172;w=m+100|0;e4(p,h);m=p|0;x=c[m>>2]|0;if((c[6778]|0)!=-1){c[l>>2]=27112;c[l+4>>2]=12;c[l+8>>2]=0;eu(27112,l,98)}l=(c[6779]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2];do{if(iu(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+32>>2]|0;cL[E&15](A,15640,15650,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>98){I=lk(H+2|0)|0;if((I|0)!=0){J=I;K=I;break}lz();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+10|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((a[O]|0)==(a[N]|0)){P=O;break}else{O=O+1|0}}a[M]=a[15640+(P-I)|0]|0;O=N+1|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((b3(E|0,7240,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((K|0)==0){break}ll(K);break}N=cj(8)|0;d9(N,6984);bA(N|0,22024,22)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){S=z;break}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[C>>2]|0;do{if((z|0)==0){T=46}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){if(A){break}else{T=48;break}}if((cB[c[(c[z>>2]|0)+36>>2]&255](z)|0)==-1){c[C>>2]=0;T=46;break}else{if(A^(z|0)==0){break}else{T=48;break}}}}while(0);if((T|0)==46){if(A){T=48}}if((T|0)==48){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;d4(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}cx[c[v>>2]&511](z);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function iu(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0;q=i;i=i+440|0;r=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[r>>2];r=q|0;s=q+400|0;t=q+408|0;u=q+416|0;v=q+424|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=r|0;lC(w|0,0,12);E=x;F=y;G=z;H=A;lC(E|0,0,12);lC(F|0,0,12);lC(G|0,0,12);lC(H|0,0,12);iA(g,h,s,t,u,v,x,y,z,B);h=n|0;c[o>>2]=c[h>>2];g=e|0;e=f|0;f=m+8|0;m=z+1|0;I=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+4|0;P=x+8|0;Q=A+1|0;R=A+4|0;S=A+8|0;T=s+3|0;U=n+4|0;n=v+4|0;V=p;p=172;W=D;X=D;D=r+400|0;r=0;Y=0;L64:while(1){Z=c[g>>2]|0;do{if((Z|0)==0){_=0}else{if((c[Z+12>>2]|0)!=(c[Z+16>>2]|0)){_=Z;break}if((cB[c[(c[Z>>2]|0)+36>>2]&255](Z)|0)==-1){c[g>>2]=0;_=0;break}else{_=c[g>>2]|0;break}}}while(0);Z=(_|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=73}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=325;break L64}}if((cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=73;break}else{if(Z){ab=$;break}else{ac=p;ad=W;ae=X;af=r;aa=325;break L64}}}}while(0);if((aa|0)==73){aa=0;if(Z){ac=p;ad=W;ae=X;af=r;aa=325;break}else{ab=0}}$=a[s+Y|0]|0;do{if(($|0)==1){if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=325;break L64}ag=c[g>>2]|0;ah=c[ag+12>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){ai=(cB[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{ai=a[ah]|0}if(ai<<24>>24<=-1){aa=98;break L64}if((b[(c[f>>2]|0)+(ai<<24>>24<<1)>>1]&8192)==0){aa=98;break L64}ah=c[g>>2]|0;ag=ah+12|0;aj=c[ag>>2]|0;if((aj|0)==(c[ah+16>>2]|0)){ak=(cB[c[(c[ah>>2]|0)+40>>2]&255](ah)|0)&255}else{c[ag>>2]=aj+1;ak=a[aj]|0}eA(A,ak);aa=99}else if(($|0)==0){aa=99}else if(($|0)==3){aj=a[F]|0;ag=aj&255;ah=(ag&1|0)==0?ag>>>1:c[L>>2]|0;ag=a[G]|0;al=ag&255;am=(al&1|0)==0?al>>>1:c[I>>2]|0;if((ah|0)==(-am|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}al=(ah|0)==0;ah=c[g>>2]|0;at=c[ah+12>>2]|0;au=c[ah+16>>2]|0;av=(at|0)==(au|0);if(!(al|(am|0)==0)){if(av){am=(cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aw=c[g>>2]|0;ax=am;ay=a[F]|0;az=aw;aA=c[aw+12>>2]|0;aB=c[aw+16>>2]|0}else{ax=a[at]|0;ay=aj;az=ah;aA=at;aB=au}au=az+12|0;aw=(aA|0)==(aB|0);if(ax<<24>>24==(a[(ay&1)==0?K:c[M>>2]|0]|0)){if(aw){am=c[(c[az>>2]|0)+40>>2]|0;cB[am&255](az)|0}else{c[au>>2]=aA+1}au=d[F]|0;an=((au&1|0)==0?au>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(aw){aC=(cB[c[(c[az>>2]|0)+36>>2]&255](az)|0)&255}else{aC=a[aA]|0}if(aC<<24>>24!=(a[(a[G]&1)==0?m:c[J>>2]|0]|0)){aa=165;break L64}aw=c[g>>2]|0;au=aw+12|0;am=c[au>>2]|0;if((am|0)==(c[aw+16>>2]|0)){aD=c[(c[aw>>2]|0)+40>>2]|0;cB[aD&255](aw)|0}else{c[au>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(al){if(av){al=(cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aE=al;aF=a[G]|0}else{aE=a[at]|0;aF=ag}if(aE<<24>>24!=(a[(aF&1)==0?m:c[J>>2]|0]|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}ag=c[g>>2]|0;al=ag+12|0;am=c[al>>2]|0;if((am|0)==(c[ag+16>>2]|0)){au=c[(c[ag>>2]|0)+40>>2]|0;cB[au&255](ag)|0}else{c[al>>2]=am+1}a[l]=1;am=d[G]|0;an=((am&1|0)==0?am>>>1:c[I>>2]|0)>>>0>1?z:r;ao=D;ap=X;aq=W;ar=p;as=V;break}if(av){av=(cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)&255;aG=av;aH=a[F]|0}else{aG=a[at]|0;aH=aj}if(aG<<24>>24!=(a[(aH&1)==0?K:c[M>>2]|0]|0)){a[l]=1;an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}aj=c[g>>2]|0;at=aj+12|0;av=c[at>>2]|0;if((av|0)==(c[aj+16>>2]|0)){ah=c[(c[aj>>2]|0)+40>>2]|0;cB[ah&255](aj)|0}else{c[at>>2]=av+1}av=d[F]|0;an=((av&1|0)==0?av>>>1:c[L>>2]|0)>>>0>1?y:r;ao=D;ap=X;aq=W;ar=p;as=V}else if(($|0)==2){if(!((r|0)!=0|Y>>>0<2)){if((Y|0)==2){aI=(a[T]|0)!=0}else{aI=0}if(!(N|aI)){an=0;ao=D;ap=X;aq=W;ar=p;as=V;break}}av=a[E]|0;at=(av&1)==0?j:c[P>>2]|0;L160:do{if((Y|0)==0){aJ=at}else{if((d[s+(Y-1)|0]|0)>=2){aJ=at;break}aj=av&255;ah=at+((aj&1|0)==0?aj>>>1:c[O>>2]|0)|0;aj=at;while(1){if((aj|0)==(ah|0)){aK=ah;break}am=a[aj]|0;if(am<<24>>24<=-1){aK=aj;break}if((b[(c[f>>2]|0)+(am<<24>>24<<1)>>1]&8192)==0){aK=aj;break}else{aj=aj+1|0}}aj=aK-at|0;ah=a[H]|0;am=ah&255;al=(am&1|0)==0?am>>>1:c[R>>2]|0;if(aj>>>0>al>>>0){aJ=at;break}am=(ah&1)==0?Q:c[S>>2]|0;ah=am+al|0;if((aK|0)==(at|0)){aJ=at;break}ag=at;au=am+(al-aj)|0;while(1){if((a[au]|0)!=(a[ag]|0)){aJ=at;break L160}aj=au+1|0;if((aj|0)==(ah|0)){aJ=aK;break}else{ag=ag+1|0;au=aj}}}}while(0);au=av&255;L174:do{if((aJ|0)==(at+((au&1|0)==0?au>>>1:c[O>>2]|0)|0)){aL=aJ}else{ag=ab;ah=aJ;while(1){aj=c[g>>2]|0;do{if((aj|0)==0){aM=0}else{if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){aM=aj;break}if((cB[c[(c[aj>>2]|0)+36>>2]&255](aj)|0)==-1){c[g>>2]=0;aM=0;break}else{aM=c[g>>2]|0;break}}}while(0);aj=(aM|0)==0;do{if((ag|0)==0){aa=194}else{if((c[ag+12>>2]|0)!=(c[ag+16>>2]|0)){if(aj){aN=ag;break}else{aL=ah;break L174}}if((cB[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)==-1){c[e>>2]=0;aa=194;break}else{if(aj){aN=ag;break}else{aL=ah;break L174}}}}while(0);if((aa|0)==194){aa=0;if(aj){aL=ah;break L174}else{aN=0}}al=c[g>>2]|0;am=c[al+12>>2]|0;if((am|0)==(c[al+16>>2]|0)){aO=(cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aO=a[am]|0}if(aO<<24>>24!=(a[ah]|0)){aL=ah;break L174}am=c[g>>2]|0;al=am+12|0;aw=c[al>>2]|0;if((aw|0)==(c[am+16>>2]|0)){aD=c[(c[am>>2]|0)+40>>2]|0;cB[aD&255](am)|0}else{c[al>>2]=aw+1}aw=ah+1|0;al=a[E]|0;am=al&255;if((aw|0)==(((al&1)==0?j:c[P>>2]|0)+((am&1|0)==0?am>>>1:c[O>>2]|0)|0)){aL=aw;break}else{ag=aN;ah=aw}}}}while(0);if(!N){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break}au=a[E]|0;at=au&255;if((aL|0)==(((au&1)==0?j:c[P>>2]|0)+((at&1|0)==0?at>>>1:c[O>>2]|0)|0)){an=r;ao=D;ap=X;aq=W;ar=p;as=V}else{aa=207;break L64}}else if(($|0)==4){at=0;au=D;av=X;ah=W;ag=p;aw=V;L209:while(1){am=c[g>>2]|0;do{if((am|0)==0){aP=0}else{if((c[am+12>>2]|0)!=(c[am+16>>2]|0)){aP=am;break}if((cB[c[(c[am>>2]|0)+36>>2]&255](am)|0)==-1){c[g>>2]=0;aP=0;break}else{aP=c[g>>2]|0;break}}}while(0);am=(aP|0)==0;al=c[e>>2]|0;do{if((al|0)==0){aa=220}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){if(am){break}else{break L209}}if((cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[e>>2]=0;aa=220;break}else{if(am){break}else{break L209}}}}while(0);if((aa|0)==220){aa=0;if(am){break}}al=c[g>>2]|0;aD=c[al+12>>2]|0;if((aD|0)==(c[al+16>>2]|0)){aQ=(cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)&255}else{aQ=a[aD]|0}do{if(aQ<<24>>24>-1){if((b[(c[f>>2]|0)+(aQ<<24>>24<<1)>>1]&2048)==0){aa=239;break}aD=c[o>>2]|0;if((aD|0)==(aw|0)){al=(c[U>>2]|0)!=172;aR=c[h>>2]|0;aS=aw-aR|0;aT=aS>>>0<2147483647?aS<<1:-1;aU=lm(al?aR:0,aT)|0;if((aU|0)==0){lz()}do{if(al){c[h>>2]=aU;aV=aU}else{aR=c[h>>2]|0;c[h>>2]=aU;if((aR|0)==0){aV=aU;break}cx[c[U>>2]&511](aR);aV=c[h>>2]|0}}while(0);c[U>>2]=84;aU=aV+aS|0;c[o>>2]=aU;aW=(c[h>>2]|0)+aT|0;aX=aU}else{aW=aw;aX=aD}c[o>>2]=aX+1;a[aX]=aQ;aY=at+1|0;aZ=au;a_=av;a$=ah;a0=ag;a1=aW}else{aa=239}}while(0);if((aa|0)==239){aa=0;am=d[w]|0;if((((am&1|0)==0?am>>>1:c[n>>2]|0)|0)==0|(at|0)==0){break}if(aQ<<24>>24!=(a[u]|0)){break}if((av|0)==(au|0)){am=av-ah|0;aU=am>>>0<2147483647?am<<1:-1;if((ag|0)==172){a2=0}else{a2=ah}al=lm(a2,aU)|0;aj=al;if((al|0)==0){lz()}a3=aj+(aU>>>2<<2)|0;a4=aj+(am>>2<<2)|0;a5=aj;a6=84}else{a3=au;a4=av;a5=ah;a6=ag}c[a4>>2]=at;aY=0;aZ=a3;a_=a4+4|0;a$=a5;a0=a6;a1=aw}aj=c[g>>2]|0;am=aj+12|0;aU=c[am>>2]|0;if((aU|0)==(c[aj+16>>2]|0)){al=c[(c[aj>>2]|0)+40>>2]|0;cB[al&255](aj)|0;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}else{c[am>>2]=aU+1;at=aY;au=aZ;av=a_;ah=a$;ag=a0;aw=a1;continue}}if((ah|0)==(av|0)|(at|0)==0){a7=au;a8=av;a9=ah;ba=ag}else{if((av|0)==(au|0)){aU=av-ah|0;am=aU>>>0<2147483647?aU<<1:-1;if((ag|0)==172){bb=0}else{bb=ah}aj=lm(bb,am)|0;al=aj;if((aj|0)==0){lz()}bc=al+(am>>>2<<2)|0;bd=al+(aU>>2<<2)|0;be=al;bf=84}else{bc=au;bd=av;be=ah;bf=ag}c[bd>>2]=at;a7=bc;a8=bd+4|0;a9=be;ba=bf}if((c[B>>2]|0)>0){al=c[g>>2]|0;do{if((al|0)==0){bg=0}else{if((c[al+12>>2]|0)!=(c[al+16>>2]|0)){bg=al;break}if((cB[c[(c[al>>2]|0)+36>>2]&255](al)|0)==-1){c[g>>2]=0;bg=0;break}else{bg=c[g>>2]|0;break}}}while(0);al=(bg|0)==0;at=c[e>>2]|0;do{if((at|0)==0){aa=272}else{if((c[at+12>>2]|0)!=(c[at+16>>2]|0)){if(al){bh=at;break}else{aa=279;break L64}}if((cB[c[(c[at>>2]|0)+36>>2]&255](at)|0)==-1){c[e>>2]=0;aa=272;break}else{if(al){bh=at;break}else{aa=279;break L64}}}}while(0);if((aa|0)==272){aa=0;if(al){aa=279;break L64}else{bh=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bi=(cB[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bi=a[ag]|0}if(bi<<24>>24!=(a[t]|0)){aa=279;break L64}ag=c[g>>2]|0;at=ag+12|0;ah=c[at>>2]|0;if((ah|0)==(c[ag+16>>2]|0)){av=c[(c[ag>>2]|0)+40>>2]|0;cB[av&255](ag)|0;bj=aw;bk=bh}else{c[at>>2]=ah+1;bj=aw;bk=bh}while(1){ah=c[g>>2]|0;do{if((ah|0)==0){bl=0}else{if((c[ah+12>>2]|0)!=(c[ah+16>>2]|0)){bl=ah;break}if((cB[c[(c[ah>>2]|0)+36>>2]&255](ah)|0)==-1){c[g>>2]=0;bl=0;break}else{bl=c[g>>2]|0;break}}}while(0);ah=(bl|0)==0;do{if((bk|0)==0){aa=295}else{if((c[bk+12>>2]|0)!=(c[bk+16>>2]|0)){if(ah){bm=bk;break}else{aa=303;break L64}}if((cB[c[(c[bk>>2]|0)+36>>2]&255](bk)|0)==-1){c[e>>2]=0;aa=295;break}else{if(ah){bm=bk;break}else{aa=303;break L64}}}}while(0);if((aa|0)==295){aa=0;if(ah){aa=303;break L64}else{bm=0}}at=c[g>>2]|0;ag=c[at+12>>2]|0;if((ag|0)==(c[at+16>>2]|0)){bn=(cB[c[(c[at>>2]|0)+36>>2]&255](at)|0)&255}else{bn=a[ag]|0}if(bn<<24>>24<=-1){aa=303;break L64}if((b[(c[f>>2]|0)+(bn<<24>>24<<1)>>1]&2048)==0){aa=303;break L64}ag=c[o>>2]|0;if((ag|0)==(bj|0)){at=(c[U>>2]|0)!=172;av=c[h>>2]|0;au=bj-av|0;aU=au>>>0<2147483647?au<<1:-1;am=lm(at?av:0,aU)|0;if((am|0)==0){lz()}do{if(at){c[h>>2]=am;bo=am}else{av=c[h>>2]|0;c[h>>2]=am;if((av|0)==0){bo=am;break}cx[c[U>>2]&511](av);bo=c[h>>2]|0}}while(0);c[U>>2]=84;am=bo+au|0;c[o>>2]=am;bp=(c[h>>2]|0)+aU|0;bq=am}else{bp=bj;bq=ag}am=c[g>>2]|0;at=c[am+12>>2]|0;if((at|0)==(c[am+16>>2]|0)){ah=(cB[c[(c[am>>2]|0)+36>>2]&255](am)|0)&255;br=ah;bs=c[o>>2]|0}else{br=a[at]|0;bs=bq}c[o>>2]=bs+1;a[bs]=br;at=(c[B>>2]|0)-1|0;c[B>>2]=at;ah=c[g>>2]|0;am=ah+12|0;av=c[am>>2]|0;if((av|0)==(c[ah+16>>2]|0)){aj=c[(c[ah>>2]|0)+40>>2]|0;cB[aj&255](ah)|0}else{c[am>>2]=av+1}if((at|0)>0){bj=bp;bk=bm}else{bt=bp;break}}}else{bt=aw}if((c[o>>2]|0)==(c[h>>2]|0)){aa=323;break L64}else{an=r;ao=a7;ap=a8;aq=a9;ar=ba;as=bt}}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V}}while(0);L363:do{if((aa|0)==99){aa=0;if((Y|0)==3){ac=p;ad=W;ae=X;af=r;aa=325;break L64}else{bu=ab}while(1){$=c[g>>2]|0;do{if(($|0)==0){bv=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){bv=$;break}if((cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[g>>2]=0;bv=0;break}else{bv=c[g>>2]|0;break}}}while(0);$=(bv|0)==0;do{if((bu|0)==0){aa=112}else{if((c[bu+12>>2]|0)!=(c[bu+16>>2]|0)){if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L363}}if((cB[c[(c[bu>>2]|0)+36>>2]&255](bu)|0)==-1){c[e>>2]=0;aa=112;break}else{if($){bw=bu;break}else{an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L363}}}}while(0);if((aa|0)==112){aa=0;if($){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L363}else{bw=0}}ag=c[g>>2]|0;aU=c[ag+12>>2]|0;if((aU|0)==(c[ag+16>>2]|0)){bx=(cB[c[(c[ag>>2]|0)+36>>2]&255](ag)|0)&255}else{bx=a[aU]|0}if(bx<<24>>24<=-1){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L363}if((b[(c[f>>2]|0)+(bx<<24>>24<<1)>>1]&8192)==0){an=r;ao=D;ap=X;aq=W;ar=p;as=V;break L363}aU=c[g>>2]|0;ag=aU+12|0;au=c[ag>>2]|0;if((au|0)==(c[aU+16>>2]|0)){by=(cB[c[(c[aU>>2]|0)+40>>2]&255](aU)|0)&255}else{c[ag>>2]=au+1;by=a[au]|0}eA(A,by);bu=bw}}}while(0);aw=Y+1|0;if(aw>>>0<4){V=as;p=ar;W=aq;X=ap;D=ao;r=an;Y=aw}else{ac=ar;ad=aq;ae=ap;af=an;aa=325;break}}L400:do{if((aa|0)==98){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==165){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==207){c[k>>2]=c[k>>2]|4;bz=0;bA=W;bB=p}else if((aa|0)==279){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==303){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==323){c[k>>2]=c[k>>2]|4;bz=0;bA=a9;bB=ba}else if((aa|0)==325){L408:do{if((af|0)!=0){an=af;ap=af+1|0;aq=af+8|0;ar=af+4|0;Y=1;L410:while(1){r=d[an]|0;if((r&1|0)==0){bC=r>>>1}else{bC=c[ar>>2]|0}if(Y>>>0>=bC>>>0){break L408}r=c[g>>2]|0;do{if((r|0)==0){bD=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){bD=r;break}if((cB[c[(c[r>>2]|0)+36>>2]&255](r)|0)==-1){c[g>>2]=0;bD=0;break}else{bD=c[g>>2]|0;break}}}while(0);r=(bD|0)==0;$=c[e>>2]|0;do{if(($|0)==0){aa=343}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(r){break}else{break L410}}if((cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)==-1){c[e>>2]=0;aa=343;break}else{if(r){break}else{break L410}}}}while(0);if((aa|0)==343){aa=0;if(r){break}}$=c[g>>2]|0;ao=c[$+12>>2]|0;if((ao|0)==(c[$+16>>2]|0)){bE=(cB[c[(c[$>>2]|0)+36>>2]&255]($)|0)&255}else{bE=a[ao]|0}if((a[an]&1)==0){bF=ap}else{bF=c[aq>>2]|0}if(bE<<24>>24!=(a[bF+Y|0]|0)){break}ao=Y+1|0;$=c[g>>2]|0;D=$+12|0;X=c[D>>2]|0;if((X|0)==(c[$+16>>2]|0)){as=c[(c[$>>2]|0)+40>>2]|0;cB[as&255]($)|0;Y=ao;continue}else{c[D>>2]=X+1;Y=ao;continue}}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac;break L400}}while(0);if((ad|0)==(ae|0)){bz=1;bA=ae;bB=ac;break}c[C>>2]=0;f5(v,ad,ae,C);if((c[C>>2]|0)==0){bz=1;bA=ad;bB=ac;break}c[k>>2]=c[k>>2]|4;bz=0;bA=ad;bB=ac}}while(0);ep(A);ep(z);ep(y);ep(x);ep(v);if((bA|0)==0){i=q;return bz|0}cx[bB&511](bA);i=q;return bz|0}function iv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=10;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){return b|0}if((k-j|0)>>>0<h>>>0){eH(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;l=g+1|0;if((l|0)==(e|0)){break}else{g=l;d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[f]&1)==0){a[f]=m<<1&255;return b|0}else{c[b+4>>2]=m;return b|0}return 0}function iw(a){a=a|0;dH(a|0);lu(a);return}function ix(a){a=a|0;dH(a|0);return}function iy(a){a=a|0;var b=0;b=cj(8)|0;d9(b,a);bA(b|0,22024,22)}function iz(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+160|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+120|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=172;u=m+100|0;e4(p,h);m=p|0;v=c[m>>2]|0;if((c[6778]|0)!=-1){c[l>>2]=27112;c[l+4>>2]=12;c[l+8>>2]=0;eu(27112,l,98)}l=(c[6779]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(iu(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){a[k+1|0]=0;a[B]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){eA(k,cz[c[(c[B>>2]|0)+28>>2]&63](y,45)|0)}x=cz[c[(c[B>>2]|0)+28>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-1|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((a[C]|0)==x<<24>>24){C=C+1|0}else{break}}iv(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){D=B;break}if((cB[c[(c[B>>2]|0)+36>>2]&255](B)|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){E=423}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){break}else{E=425;break}}if((cB[c[(c[A>>2]|0)+36>>2]&255](A)|0)==-1){c[z>>2]=0;E=423;break}else{if(x^(A|0)==0){break}else{E=425;break}}}}while(0);if((E|0)==423){if(x){E=425}}if((E|0)==425){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;d4(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}cx[c[t>>2]&511](A);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function iA(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[6896]|0)!=-1){c[p>>2]=27584;c[p+4>>2]=12;c[p+8>>2]=0;eu(27584,p,98)}p=(c[6897]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=cj(4)|0;L=K;k1(L);bA(K|0,22008,138)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=cj(4)|0;L=K;k1(L);bA(K|0,22008,138)}K=b;cy[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;cy[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){a[l+1|0]=0;a[q]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eF(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];lC(s|0,0,12);ep(r);cy[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eF(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];lC(u|0,0,12);ep(t);t=b;a[f]=cB[c[(c[t>>2]|0)+12>>2]&255](K)|0;a[g]=cB[c[(c[t>>2]|0)+16>>2]&255](K)|0;cy[c[(c[L>>2]|0)+20>>2]&127](v,K);t=h;if((a[t]&1)==0){a[h+1|0]=0;a[t]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eF(h,0);c[t>>2]=c[w>>2];c[t+4>>2]=c[w+4>>2];c[t+8>>2]=c[w+8>>2];lC(w|0,0,12);ep(v);cy[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){a[j+1|0]=0;a[L]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eF(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];lC(y|0,0,12);ep(x);M=cB[c[(c[b>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[6898]|0)!=-1){c[o>>2]=27592;c[o+4>>2]=12;c[o+8>>2]=0;eu(27592,o,98)}o=(c[6899]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=cj(4)|0;O=N;k1(O);bA(N|0,22008,138)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=cj(4)|0;O=N;k1(O);bA(N|0,22008,138)}N=K;cy[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;cy[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){a[l+1|0]=0;a[z]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eF(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];lC(B|0,0,12);ep(A);cy[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){a[k+1|0]=0;a[A]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eF(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];lC(E|0,0,12);ep(D);D=K;a[f]=cB[c[(c[D>>2]|0)+12>>2]&255](N)|0;a[g]=cB[c[(c[D>>2]|0)+16>>2]&255](N)|0;cy[c[(c[O>>2]|0)+20>>2]&127](F,N);D=h;if((a[D]&1)==0){a[h+1|0]=0;a[D]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eF(h,0);c[D>>2]=c[G>>2];c[D+4>>2]=c[G+4>>2];c[D+8>>2]=c[G+8>>2];lC(G|0,0,12);ep(F);cy[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){a[j+1|0]=0;a[O]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eF(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];lC(I|0,0,12);ep(H);M=cB[c[(c[K>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function iB(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+600|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=d+496|0;u=n|0;c[u>>2]=m;v=n+4|0;c[v>>2]=172;w=m+400|0;e4(p,h);m=p|0;x=c[m>>2]|0;if((c[6776]|0)!=-1){c[l>>2]=27104;c[l+4>>2]=12;c[l+8>>2]=0;eu(27104,l,98)}l=(c[6777]|0)-1|0;y=c[x+8>>2]|0;do{if((c[x+12>>2]|0)-y>>2>>>0>l>>>0){z=c[y+(l<<2)>>2]|0;if((z|0)==0){break}A=z;a[q]=0;C=f|0;c[r>>2]=c[C>>2];do{if(iC(e,r,g,p,c[h+4>>2]|0,j,q,A,n,o,w)|0){D=s|0;E=c[(c[z>>2]|0)+48>>2]|0;cL[E&15](A,15624,15634,D)|0;E=t|0;F=c[o>>2]|0;G=c[u>>2]|0;H=F-G|0;do{if((H|0)>392){I=lk((H>>2)+2|0)|0;if((I|0)!=0){J=I;K=I;break}lz();J=0;K=0}else{J=E;K=0}}while(0);if((a[q]&1)==0){L=J}else{a[J]=45;L=J+1|0}if(G>>>0<F>>>0){H=s+40|0;I=s;M=L;N=G;while(1){O=D;while(1){if((O|0)==(H|0)){P=H;break}if((c[O>>2]|0)==(c[N>>2]|0)){P=O;break}else{O=O+4|0}}a[M]=a[15624+(P-I>>2)|0]|0;O=N+4|0;Q=M+1|0;if(O>>>0<(c[o>>2]|0)>>>0){M=Q;N=O}else{R=Q;break}}}else{R=L}a[R]=0;if((b3(E|0,7240,(B=i,i=i+8|0,c[B>>2]=k,B)|0)|0)==1){if((K|0)==0){break}ll(K);break}N=cj(8)|0;d9(N,6984);bA(N|0,22024,22)}}while(0);A=e|0;z=c[A>>2]|0;do{if((z|0)==0){S=0}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){T=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{T=c[N>>2]|0}if((T|0)!=-1){S=z;break}c[A>>2]=0;S=0}}while(0);A=(S|0)==0;z=c[C>>2]|0;do{if((z|0)==0){U=541}else{N=c[z+12>>2]|0;if((N|0)==(c[z+16>>2]|0)){V=cB[c[(c[z>>2]|0)+36>>2]&255](z)|0}else{V=c[N>>2]|0}if((V|0)==-1){c[C>>2]=0;U=541;break}else{if(A^(z|0)==0){break}else{U=543;break}}}}while(0);if((U|0)==541){if(A){U=543}}if((U|0)==543){c[j>>2]=c[j>>2]|2}c[b>>2]=S;z=c[m>>2]|0;d4(z)|0;z=c[u>>2]|0;c[u>>2]=0;if((z|0)==0){i=d;return}cx[c[v>>2]&511](z);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function iC(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0;p=i;i=i+448|0;q=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[q>>2];q=p|0;r=p+8|0;s=p+408|0;t=p+416|0;u=p+424|0;v=p+432|0;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=i;i=i+12|0;i=i+7>>3<<3;z=i;i=i+12|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;c[q>>2]=o;o=r|0;lC(w|0,0,12);D=x;E=y;F=z;G=A;lC(D|0,0,12);lC(E|0,0,12);lC(F|0,0,12);lC(G|0,0,12);iG(f,g,s,t,u,v,x,y,z,B);g=m|0;c[n>>2]=c[g>>2];f=b|0;b=e|0;e=l;H=z+4|0;I=z+8|0;J=y+4|0;K=y+8|0;L=(h&512|0)!=0;h=x+4|0;M=x+8|0;N=A+4|0;O=A+8|0;P=s+3|0;Q=v+4|0;R=172;S=o;T=o;o=r+400|0;r=0;U=0;L668:while(1){V=c[f>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[f>>2]=0;W=1;break}else{W=(c[f>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=569}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=569;break}else{if(W^(V|0)==0){$=V;break}else{aa=R;ab=S;ac=T;ad=r;Z=809;break L668}}}}while(0);if((Z|0)==569){Z=0;if(W){aa=R;ab=S;ac=T;ad=r;Z=809;break}else{$=0}}V=a[s+U|0]|0;L692:do{if((V|0)==2){if(!((r|0)!=0|U>>>0<2)){if((U|0)==2){ae=(a[P]|0)!=0}else{ae=0}if(!(L|ae)){af=0;ag=o;ah=T;ai=S;aj=R;break}}X=a[D]|0;ak=(X&1)==0?h:c[M>>2]|0;L700:do{if((U|0)==0){al=ak;am=X;an=$}else{if((d[s+(U-1)|0]|0)<2){ao=ak;ap=X}else{al=ak;am=X;an=$;break}while(1){aq=ap&255;if((ao|0)==(((ap&1)==0?h:c[M>>2]|0)+(((aq&1|0)==0?aq>>>1:c[h>>2]|0)<<2)|0)){ar=ap;break}if(!(cC[c[(c[e>>2]|0)+12>>2]&63](l,8192,c[ao>>2]|0)|0)){Z=670;break}ao=ao+4|0;ap=a[D]|0}if((Z|0)==670){Z=0;ar=a[D]|0}aq=(ar&1)==0;as=ao-(aq?h:c[M>>2]|0)>>2;at=a[G]|0;au=at&255;av=(au&1|0)==0;L710:do{if(as>>>0<=(av?au>>>1:c[N>>2]|0)>>>0){aw=(at&1)==0;ax=(aw?N:c[O>>2]|0)+((av?au>>>1:c[N>>2]|0)-as<<2)|0;ay=(aw?N:c[O>>2]|0)+((av?au>>>1:c[N>>2]|0)<<2)|0;if((ax|0)==(ay|0)){al=ao;am=ar;an=$;break L700}else{az=ax;aA=aq?h:c[M>>2]|0}while(1){if((c[az>>2]|0)!=(c[aA>>2]|0)){break L710}ax=az+4|0;if((ax|0)==(ay|0)){al=ao;am=ar;an=$;break L700}az=ax;aA=aA+4|0}}}while(0);al=aq?h:c[M>>2]|0;am=ar;an=$}}while(0);L717:while(1){X=am&255;if((al|0)==(((am&1)==0?h:c[M>>2]|0)+(((X&1|0)==0?X>>>1:c[h>>2]|0)<<2)|0)){break}X=c[f>>2]|0;do{if((X|0)==0){aB=1}else{ak=c[X+12>>2]|0;if((ak|0)==(c[X+16>>2]|0)){aC=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aC=c[ak>>2]|0}if((aC|0)==-1){c[f>>2]=0;aB=1;break}else{aB=(c[f>>2]|0)==0;break}}}while(0);do{if((an|0)==0){Z=691}else{X=c[an+12>>2]|0;if((X|0)==(c[an+16>>2]|0)){aD=cB[c[(c[an>>2]|0)+36>>2]&255](an)|0}else{aD=c[X>>2]|0}if((aD|0)==-1){c[b>>2]=0;Z=691;break}else{if(aB^(an|0)==0){aE=an;break}else{break L717}}}}while(0);if((Z|0)==691){Z=0;if(aB){break}else{aE=0}}X=c[f>>2]|0;aq=c[X+12>>2]|0;if((aq|0)==(c[X+16>>2]|0)){aF=cB[c[(c[X>>2]|0)+36>>2]&255](X)|0}else{aF=c[aq>>2]|0}if((aF|0)!=(c[al>>2]|0)){break}aq=c[f>>2]|0;X=aq+12|0;ak=c[X>>2]|0;if((ak|0)==(c[aq+16>>2]|0)){au=c[(c[aq>>2]|0)+40>>2]|0;cB[au&255](aq)|0}else{c[X>>2]=ak+4}al=al+4|0;am=a[D]|0;an=aE}if(!L){af=r;ag=o;ah=T;ai=S;aj=R;break}ak=a[D]|0;X=ak&255;if((al|0)==(((ak&1)==0?h:c[M>>2]|0)+(((X&1|0)==0?X>>>1:c[h>>2]|0)<<2)|0)){af=r;ag=o;ah=T;ai=S;aj=R}else{Z=703;break L668}}else if((V|0)==4){X=0;ak=o;aq=T;au=S;av=R;L753:while(1){as=c[f>>2]|0;do{if((as|0)==0){aG=1}else{at=c[as+12>>2]|0;if((at|0)==(c[as+16>>2]|0)){aH=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{aH=c[at>>2]|0}if((aH|0)==-1){c[f>>2]=0;aG=1;break}else{aG=(c[f>>2]|0)==0;break}}}while(0);as=c[b>>2]|0;do{if((as|0)==0){Z=717}else{at=c[as+12>>2]|0;if((at|0)==(c[as+16>>2]|0)){aI=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{aI=c[at>>2]|0}if((aI|0)==-1){c[b>>2]=0;Z=717;break}else{if(aG^(as|0)==0){break}else{break L753}}}}while(0);if((Z|0)==717){Z=0;if(aG){break}}as=c[f>>2]|0;at=c[as+12>>2]|0;if((at|0)==(c[as+16>>2]|0)){aJ=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{aJ=c[at>>2]|0}if(cC[c[(c[e>>2]|0)+12>>2]&63](l,2048,aJ)|0){at=c[n>>2]|0;if((at|0)==(c[q>>2]|0)){iH(m,n,q);aK=c[n>>2]|0}else{aK=at}c[n>>2]=aK+4;c[aK>>2]=aJ;aL=X+1|0;aM=ak;aN=aq;aO=au;aP=av}else{at=d[w]|0;if((((at&1|0)==0?at>>>1:c[Q>>2]|0)|0)==0|(X|0)==0){break}if((aJ|0)!=(c[u>>2]|0)){break}if((aq|0)==(ak|0)){at=(av|0)!=172;as=aq-au|0;ay=as>>>0<2147483647?as<<1:-1;if(at){aQ=au}else{aQ=0}at=lm(aQ,ay)|0;ax=at;if((at|0)==0){lz()}aR=ax+(ay>>>2<<2)|0;aS=ax+(as>>2<<2)|0;aT=ax;aU=84}else{aR=ak;aS=aq;aT=au;aU=av}c[aS>>2]=X;aL=0;aM=aR;aN=aS+4|0;aO=aT;aP=aU}ax=c[f>>2]|0;as=ax+12|0;ay=c[as>>2]|0;if((ay|0)==(c[ax+16>>2]|0)){at=c[(c[ax>>2]|0)+40>>2]|0;cB[at&255](ax)|0;X=aL;ak=aM;aq=aN;au=aO;av=aP;continue}else{c[as>>2]=ay+4;X=aL;ak=aM;aq=aN;au=aO;av=aP;continue}}if((au|0)==(aq|0)|(X|0)==0){aV=ak;aW=aq;aX=au;aY=av}else{if((aq|0)==(ak|0)){ay=(av|0)!=172;as=aq-au|0;ax=as>>>0<2147483647?as<<1:-1;if(ay){aZ=au}else{aZ=0}ay=lm(aZ,ax)|0;at=ay;if((ay|0)==0){lz()}a_=at+(ax>>>2<<2)|0;a$=at+(as>>2<<2)|0;a0=at;a1=84}else{a_=ak;a$=aq;a0=au;a1=av}c[a$>>2]=X;aV=a_;aW=a$+4|0;aX=a0;aY=a1}at=c[B>>2]|0;if((at|0)>0){as=c[f>>2]|0;do{if((as|0)==0){a2=1}else{ax=c[as+12>>2]|0;if((ax|0)==(c[as+16>>2]|0)){a3=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{a3=c[ax>>2]|0}if((a3|0)==-1){c[f>>2]=0;a2=1;break}else{a2=(c[f>>2]|0)==0;break}}}while(0);as=c[b>>2]|0;do{if((as|0)==0){Z=766}else{X=c[as+12>>2]|0;if((X|0)==(c[as+16>>2]|0)){a4=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{a4=c[X>>2]|0}if((a4|0)==-1){c[b>>2]=0;Z=766;break}else{if(a2^(as|0)==0){a5=as;break}else{Z=772;break L668}}}}while(0);if((Z|0)==766){Z=0;if(a2){Z=772;break L668}else{a5=0}}as=c[f>>2]|0;X=c[as+12>>2]|0;if((X|0)==(c[as+16>>2]|0)){a6=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{a6=c[X>>2]|0}if((a6|0)!=(c[t>>2]|0)){Z=772;break L668}X=c[f>>2]|0;as=X+12|0;av=c[as>>2]|0;if((av|0)==(c[X+16>>2]|0)){au=c[(c[X>>2]|0)+40>>2]|0;cB[au&255](X)|0;a7=a5;a8=at}else{c[as>>2]=av+4;a7=a5;a8=at}while(1){av=c[f>>2]|0;do{if((av|0)==0){a9=1}else{as=c[av+12>>2]|0;if((as|0)==(c[av+16>>2]|0)){ba=cB[c[(c[av>>2]|0)+36>>2]&255](av)|0}else{ba=c[as>>2]|0}if((ba|0)==-1){c[f>>2]=0;a9=1;break}else{a9=(c[f>>2]|0)==0;break}}}while(0);do{if((a7|0)==0){Z=789}else{av=c[a7+12>>2]|0;if((av|0)==(c[a7+16>>2]|0)){bb=cB[c[(c[a7>>2]|0)+36>>2]&255](a7)|0}else{bb=c[av>>2]|0}if((bb|0)==-1){c[b>>2]=0;Z=789;break}else{if(a9^(a7|0)==0){bc=a7;break}else{Z=796;break L668}}}}while(0);if((Z|0)==789){Z=0;if(a9){Z=796;break L668}else{bc=0}}av=c[f>>2]|0;as=c[av+12>>2]|0;if((as|0)==(c[av+16>>2]|0)){bd=cB[c[(c[av>>2]|0)+36>>2]&255](av)|0}else{bd=c[as>>2]|0}if(!(cC[c[(c[e>>2]|0)+12>>2]&63](l,2048,bd)|0)){Z=796;break L668}if((c[n>>2]|0)==(c[q>>2]|0)){iH(m,n,q)}as=c[f>>2]|0;av=c[as+12>>2]|0;if((av|0)==(c[as+16>>2]|0)){be=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0}else{be=c[av>>2]|0}av=c[n>>2]|0;c[n>>2]=av+4;c[av>>2]=be;av=a8-1|0;c[B>>2]=av;as=c[f>>2]|0;X=as+12|0;au=c[X>>2]|0;if((au|0)==(c[as+16>>2]|0)){aq=c[(c[as>>2]|0)+40>>2]|0;cB[aq&255](as)|0}else{c[X>>2]=au+4}if((av|0)>0){a7=bc;a8=av}else{break}}}if((c[n>>2]|0)==(c[g>>2]|0)){Z=807;break L668}else{af=r;ag=aV;ah=aW;ai=aX;aj=aY}}else if((V|0)==1){if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=809;break L668}at=c[f>>2]|0;av=c[at+12>>2]|0;if((av|0)==(c[at+16>>2]|0)){bf=cB[c[(c[at>>2]|0)+36>>2]&255](at)|0}else{bf=c[av>>2]|0}if(!(cC[c[(c[e>>2]|0)+12>>2]&63](l,8192,bf)|0)){Z=593;break L668}av=c[f>>2]|0;at=av+12|0;au=c[at>>2]|0;if((au|0)==(c[av+16>>2]|0)){bg=cB[c[(c[av>>2]|0)+40>>2]&255](av)|0}else{c[at>>2]=au+4;bg=c[au>>2]|0}e2(A,bg);Z=594}else if((V|0)==0){Z=594}else if((V|0)==3){au=a[E]|0;at=au&255;av=(at&1|0)==0;X=a[F]|0;as=X&255;aq=(as&1|0)==0;if(((av?at>>>1:c[J>>2]|0)|0)==(-(aq?as>>>1:c[H>>2]|0)|0)){af=r;ag=o;ah=T;ai=S;aj=R;break}do{if(((av?at>>>1:c[J>>2]|0)|0)!=0){if(((aq?as>>>1:c[H>>2]|0)|0)==0){break}ak=c[f>>2]|0;ax=c[ak+12>>2]|0;if((ax|0)==(c[ak+16>>2]|0)){ay=cB[c[(c[ak>>2]|0)+36>>2]&255](ak)|0;bh=ay;bi=a[E]|0}else{bh=c[ax>>2]|0;bi=au}ax=c[f>>2]|0;ay=ax+12|0;ak=c[ay>>2]|0;aw=(ak|0)==(c[ax+16>>2]|0);if((bh|0)==(c[((bi&1)==0?J:c[K>>2]|0)>>2]|0)){if(aw){bj=c[(c[ax>>2]|0)+40>>2]|0;cB[bj&255](ax)|0}else{c[ay>>2]=ak+4}ay=d[E]|0;af=((ay&1|0)==0?ay>>>1:c[J>>2]|0)>>>0>1?y:r;ag=o;ah=T;ai=S;aj=R;break L692}if(aw){bk=cB[c[(c[ax>>2]|0)+36>>2]&255](ax)|0}else{bk=c[ak>>2]|0}if((bk|0)!=(c[((a[F]&1)==0?H:c[I>>2]|0)>>2]|0)){Z=659;break L668}ak=c[f>>2]|0;ax=ak+12|0;aw=c[ax>>2]|0;if((aw|0)==(c[ak+16>>2]|0)){ay=c[(c[ak>>2]|0)+40>>2]|0;cB[ay&255](ak)|0}else{c[ax>>2]=aw+4}a[k]=1;aw=d[F]|0;af=((aw&1|0)==0?aw>>>1:c[H>>2]|0)>>>0>1?z:r;ag=o;ah=T;ai=S;aj=R;break L692}}while(0);as=c[f>>2]|0;aq=c[as+12>>2]|0;aw=(aq|0)==(c[as+16>>2]|0);if(((av?at>>>1:c[J>>2]|0)|0)==0){if(aw){ax=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0;bl=ax;bm=a[F]|0}else{bl=c[aq>>2]|0;bm=X}if((bl|0)!=(c[((bm&1)==0?H:c[I>>2]|0)>>2]|0)){af=r;ag=o;ah=T;ai=S;aj=R;break}ax=c[f>>2]|0;ak=ax+12|0;ay=c[ak>>2]|0;if((ay|0)==(c[ax+16>>2]|0)){bj=c[(c[ax>>2]|0)+40>>2]|0;cB[bj&255](ax)|0}else{c[ak>>2]=ay+4}a[k]=1;ay=d[F]|0;af=((ay&1|0)==0?ay>>>1:c[H>>2]|0)>>>0>1?z:r;ag=o;ah=T;ai=S;aj=R;break}if(aw){aw=cB[c[(c[as>>2]|0)+36>>2]&255](as)|0;bn=aw;bo=a[E]|0}else{bn=c[aq>>2]|0;bo=au}if((bn|0)!=(c[((bo&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;af=r;ag=o;ah=T;ai=S;aj=R;break}aq=c[f>>2]|0;aw=aq+12|0;as=c[aw>>2]|0;if((as|0)==(c[aq+16>>2]|0)){ay=c[(c[aq>>2]|0)+40>>2]|0;cB[ay&255](aq)|0}else{c[aw>>2]=as+4}as=d[E]|0;af=((as&1|0)==0?as>>>1:c[J>>2]|0)>>>0>1?y:r;ag=o;ah=T;ai=S;aj=R}else{af=r;ag=o;ah=T;ai=S;aj=R}}while(0);L961:do{if((Z|0)==594){Z=0;if((U|0)==3){aa=R;ab=S;ac=T;ad=r;Z=809;break L668}else{bp=$}while(1){V=c[f>>2]|0;do{if((V|0)==0){bq=1}else{as=c[V+12>>2]|0;if((as|0)==(c[V+16>>2]|0)){br=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{br=c[as>>2]|0}if((br|0)==-1){c[f>>2]=0;bq=1;break}else{bq=(c[f>>2]|0)==0;break}}}while(0);do{if((bp|0)==0){Z=608}else{V=c[bp+12>>2]|0;if((V|0)==(c[bp+16>>2]|0)){bs=cB[c[(c[bp>>2]|0)+36>>2]&255](bp)|0}else{bs=c[V>>2]|0}if((bs|0)==-1){c[b>>2]=0;Z=608;break}else{if(bq^(bp|0)==0){bt=bp;break}else{af=r;ag=o;ah=T;ai=S;aj=R;break L961}}}}while(0);if((Z|0)==608){Z=0;if(bq){af=r;ag=o;ah=T;ai=S;aj=R;break L961}else{bt=0}}V=c[f>>2]|0;as=c[V+12>>2]|0;if((as|0)==(c[V+16>>2]|0)){bu=cB[c[(c[V>>2]|0)+36>>2]&255](V)|0}else{bu=c[as>>2]|0}if(!(cC[c[(c[e>>2]|0)+12>>2]&63](l,8192,bu)|0)){af=r;ag=o;ah=T;ai=S;aj=R;break L961}as=c[f>>2]|0;V=as+12|0;aw=c[V>>2]|0;if((aw|0)==(c[as+16>>2]|0)){bv=cB[c[(c[as>>2]|0)+40>>2]&255](as)|0}else{c[V>>2]=aw+4;bv=c[aw>>2]|0}e2(A,bv);bp=bt}}}while(0);au=U+1|0;if(au>>>0<4){R=aj;S=ai;T=ah;o=ag;r=af;U=au}else{aa=aj;ab=ai;ac=ah;ad=af;Z=809;break}}L998:do{if((Z|0)==659){c[j>>2]=c[j>>2]|4;bw=0;bx=S;by=R}else if((Z|0)==796){c[j>>2]=c[j>>2]|4;bw=0;bx=aX;by=aY}else if((Z|0)==807){c[j>>2]=c[j>>2]|4;bw=0;bx=aX;by=aY}else if((Z|0)==809){L1003:do{if((ad|0)!=0){af=ad;ah=ad+4|0;ai=ad+8|0;aj=1;L1005:while(1){U=d[af]|0;if((U&1|0)==0){bz=U>>>1}else{bz=c[ah>>2]|0}if(aj>>>0>=bz>>>0){break L1003}U=c[f>>2]|0;do{if((U|0)==0){bA=1}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bB=cB[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bB=c[r>>2]|0}if((bB|0)==-1){c[f>>2]=0;bA=1;break}else{bA=(c[f>>2]|0)==0;break}}}while(0);U=c[b>>2]|0;do{if((U|0)==0){Z=828}else{r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bC=cB[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bC=c[r>>2]|0}if((bC|0)==-1){c[b>>2]=0;Z=828;break}else{if(bA^(U|0)==0){break}else{break L1005}}}}while(0);if((Z|0)==828){Z=0;if(bA){break}}U=c[f>>2]|0;r=c[U+12>>2]|0;if((r|0)==(c[U+16>>2]|0)){bD=cB[c[(c[U>>2]|0)+36>>2]&255](U)|0}else{bD=c[r>>2]|0}if((a[af]&1)==0){bE=ah}else{bE=c[ai>>2]|0}if((bD|0)!=(c[bE+(aj<<2)>>2]|0)){break}r=aj+1|0;U=c[f>>2]|0;ag=U+12|0;o=c[ag>>2]|0;if((o|0)==(c[U+16>>2]|0)){T=c[(c[U>>2]|0)+40>>2]|0;cB[T&255](U)|0;aj=r;continue}else{c[ag>>2]=o+4;aj=r;continue}}c[j>>2]=c[j>>2]|4;bw=0;bx=ab;by=aa;break L998}}while(0);if((ab|0)==(ac|0)){bw=1;bx=ac;by=aa;break}c[C>>2]=0;f5(v,ab,ac,C);if((c[C>>2]|0)==0){bw=1;bx=ab;by=aa;break}c[j>>2]=c[j>>2]|4;bw=0;bx=ab;by=aa}else if((Z|0)==772){c[j>>2]=c[j>>2]|4;bw=0;bx=aX;by=aY}else if((Z|0)==703){c[j>>2]=c[j>>2]|4;bw=0;bx=S;by=R}else if((Z|0)==593){c[j>>2]=c[j>>2]|4;bw=0;bx=S;by=R}}while(0);eC(A);eC(z);eC(y);eC(x);ep(v);if((bx|0)==0){i=p;return bw|0}cx[by&511](bx);i=p;return bw|0}function iD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b;g=d;h=a[f]|0;i=h&255;if((i&1|0)==0){j=i>>>1}else{j=c[b+4>>2]|0}if((h&1)==0){k=1;l=h}else{h=c[b>>2]|0;k=(h&-2)-1|0;l=h&255}h=e-g>>2;if((h|0)==0){return b|0}if((k-j|0)>>>0<h>>>0){fq(b,k,j+h-k|0,j,j,0,0);m=a[f]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=j+((e-4+(-g|0)|0)>>>2)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];m=g+4|0;if((m|0)==(e|0)){break}else{g=m;d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[f]&1)==0){a[f]=o<<1&255;return b|0}else{c[b+4>>2]=o;return b|0}return 0}function iE(a){a=a|0;dH(a|0);lu(a);return}function iF(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+456|0;l=e;e=i;i=i+4|0;i=i+7>>3<<3;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=d|0;m=d+16|0;n=d+416|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=n|0;c[s>>2]=m;t=n+4|0;c[t>>2]=172;u=m+400|0;e4(p,h);m=p|0;v=c[m>>2]|0;if((c[6776]|0)!=-1){c[l>>2]=27104;c[l+4>>2]=12;c[l+8>>2]=0;eu(27104,l,98)}l=(c[6777]|0)-1|0;w=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-w>>2>>>0>l>>>0){x=c[w+(l<<2)>>2]|0;if((x|0)==0){break}y=x;a[q]=0;z=f|0;A=c[z>>2]|0;c[r>>2]=A;if(iC(e,r,g,p,c[h+4>>2]|0,j,q,y,n,o,u)|0){B=k;if((a[B]&1)==0){c[k+4>>2]=0;a[B]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}B=x;if((a[q]&1)!=0){e2(k,cz[c[(c[B>>2]|0)+44>>2]&63](y,45)|0)}x=cz[c[(c[B>>2]|0)+44>>2]&63](y,48)|0;y=c[o>>2]|0;B=y-4|0;C=c[s>>2]|0;while(1){if(C>>>0>=B>>>0){break}if((c[C>>2]|0)==(x|0)){C=C+4|0}else{break}}iD(k,C,y)|0}x=e|0;B=c[x>>2]|0;do{if((B|0)==0){D=0}else{E=c[B+12>>2]|0;if((E|0)==(c[B+16>>2]|0)){F=cB[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{F=c[E>>2]|0}if((F|0)!=-1){D=B;break}c[x>>2]=0;D=0}}while(0);x=(D|0)==0;do{if((A|0)==0){G=906}else{B=c[A+12>>2]|0;if((B|0)==(c[A+16>>2]|0)){H=cB[c[(c[A>>2]|0)+36>>2]&255](A)|0}else{H=c[B>>2]|0}if((H|0)==-1){c[z>>2]=0;G=906;break}else{if(x^(A|0)==0){break}else{G=908;break}}}}while(0);if((G|0)==906){if(x){G=908}}if((G|0)==908){c[j>>2]=c[j>>2]|2}c[b>>2]=D;A=c[m>>2]|0;d4(A)|0;A=c[s>>2]|0;c[s>>2]=0;if((A|0)==0){i=d;return}cx[c[t>>2]&511](A);i=d;return}}while(0);d=cj(4)|0;k1(d);bA(d|0,22008,138)}function iG(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;n=i;i=i+56|0;o=n|0;p=n+16|0;q=n+32|0;r=n+40|0;s=r;t=i;i=i+12|0;i=i+7>>3<<3;u=t;v=i;i=i+12|0;i=i+7>>3<<3;w=v;x=i;i=i+12|0;i=i+7>>3<<3;y=x;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+12|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+12|0;i=i+7>>3<<3;I=H;if(b){b=c[d>>2]|0;if((c[6892]|0)!=-1){c[p>>2]=27568;c[p+4>>2]=12;c[p+8>>2]=0;eu(27568,p,98)}p=(c[6893]|0)-1|0;J=c[b+8>>2]|0;if((c[b+12>>2]|0)-J>>2>>>0<=p>>>0){K=cj(4)|0;L=K;k1(L);bA(K|0,22008,138)}b=c[J+(p<<2)>>2]|0;if((b|0)==0){K=cj(4)|0;L=K;k1(L);bA(K|0,22008,138)}K=b;cy[c[(c[b>>2]|0)+44>>2]&127](q,K);L=e;C=c[q>>2]|0;a[L]=C&255;C=C>>8;a[L+1|0]=C&255;C=C>>8;a[L+2|0]=C&255;C=C>>8;a[L+3|0]=C&255;L=b;cy[c[(c[L>>2]|0)+32>>2]&127](r,K);q=l;if((a[q]&1)==0){c[l+4>>2]=0;a[q]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eL(l,0);c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];lC(s|0,0,12);eC(r);cy[c[(c[L>>2]|0)+28>>2]&127](t,K);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eL(k,0);c[r>>2]=c[u>>2];c[r+4>>2]=c[u+4>>2];c[r+8>>2]=c[u+8>>2];lC(u|0,0,12);eC(t);t=b;c[f>>2]=cB[c[(c[t>>2]|0)+12>>2]&255](K)|0;c[g>>2]=cB[c[(c[t>>2]|0)+16>>2]&255](K)|0;cy[c[(c[b>>2]|0)+20>>2]&127](v,K);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eF(h,0);c[b>>2]=c[w>>2];c[b+4>>2]=c[w+4>>2];c[b+8>>2]=c[w+8>>2];lC(w|0,0,12);ep(v);cy[c[(c[L>>2]|0)+24>>2]&127](x,K);L=j;if((a[L]&1)==0){c[j+4>>2]=0;a[L]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}eL(j,0);c[L>>2]=c[y>>2];c[L+4>>2]=c[y+4>>2];c[L+8>>2]=c[y+8>>2];lC(y|0,0,12);eC(x);M=cB[c[(c[t>>2]|0)+36>>2]&255](K)|0;c[m>>2]=M;i=n;return}else{K=c[d>>2]|0;if((c[6894]|0)!=-1){c[o>>2]=27576;c[o+4>>2]=12;c[o+8>>2]=0;eu(27576,o,98)}o=(c[6895]|0)-1|0;d=c[K+8>>2]|0;if((c[K+12>>2]|0)-d>>2>>>0<=o>>>0){N=cj(4)|0;O=N;k1(O);bA(N|0,22008,138)}K=c[d+(o<<2)>>2]|0;if((K|0)==0){N=cj(4)|0;O=N;k1(O);bA(N|0,22008,138)}N=K;cy[c[(c[K>>2]|0)+44>>2]&127](z,N);O=e;C=c[z>>2]|0;a[O]=C&255;C=C>>8;a[O+1|0]=C&255;C=C>>8;a[O+2|0]=C&255;C=C>>8;a[O+3|0]=C&255;O=K;cy[c[(c[O>>2]|0)+32>>2]&127](A,N);z=l;if((a[z]&1)==0){c[l+4>>2]=0;a[z]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eL(l,0);c[z>>2]=c[B>>2];c[z+4>>2]=c[B+4>>2];c[z+8>>2]=c[B+8>>2];lC(B|0,0,12);eC(A);cy[c[(c[O>>2]|0)+28>>2]&127](D,N);A=k;if((a[A]&1)==0){c[k+4>>2]=0;a[A]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eL(k,0);c[A>>2]=c[E>>2];c[A+4>>2]=c[E+4>>2];c[A+8>>2]=c[E+8>>2];lC(E|0,0,12);eC(D);D=K;c[f>>2]=cB[c[(c[D>>2]|0)+12>>2]&255](N)|0;c[g>>2]=cB[c[(c[D>>2]|0)+16>>2]&255](N)|0;cy[c[(c[K>>2]|0)+20>>2]&127](F,N);K=h;if((a[K]&1)==0){a[h+1|0]=0;a[K]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}eF(h,0);c[K>>2]=c[G>>2];c[K+4>>2]=c[G+4>>2];c[K+8>>2]=c[G+8>>2];lC(G|0,0,12);ep(F);cy[c[(c[O>>2]|0)+24>>2]&127](H,N);O=j;if((a[O]&1)==0){c[j+4>>2]=0;a[O]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}eL(j,0);c[O>>2]=c[I>>2];c[O+4>>2]=c[I+4>>2];c[O+8>>2]=c[I+8>>2];lC(I|0,0,12);eC(H);M=cB[c[(c[D>>2]|0)+36>>2]&255](N)|0;c[m>>2]=M;i=n;return}}function iH(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+4|0;f=(c[e>>2]|0)!=172;g=a|0;a=c[g>>2]|0;h=a;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;if(f){k=a}else{k=0}a=lm(k,j)|0;k=a;if((a|0)==0){lz()}do{if(f){c[g>>2]=k;l=k}else{a=c[g>>2]|0;c[g>>2]=k;if((a|0)==0){l=k;break}cx[c[e>>2]&511](a);l=c[g>>2]|0}}while(0);c[e>>2]=84;c[b>>2]=l+(i<<2);c[d>>2]=(c[g>>2]|0)+(j>>>2<<2);return}function iI(a){a=a|0;dH(a|0);return}function iJ(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+280|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+232|0;p=e+240|0;q=e+248|0;r=e+256|0;s=e+264|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+100|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a1(E|0,100,6760,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);E=gU(n,c[6438]|0,6760,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;H=c[n>>2]|0;if((H|0)==0){lz();I=c[n>>2]|0}else{I=H}H=lk(E)|0;if((H|0)!=0){J=H;K=E;L=I;M=H;break}lz();J=0;K=E;L=I;M=0}else{J=F;K=G;L=0;M=0}}while(0);e4(o,j);G=o|0;F=c[G>>2]|0;if((c[6778]|0)!=-1){c[m>>2]=27112;c[m+4>>2]=12;c[m+8>>2]=0;eu(27112,m,98)}m=(c[6779]|0)-1|0;I=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-I>>2>>>0>m>>>0){E=c[I+(m<<2)>>2]|0;if((E|0)==0){break}H=E;N=c[n>>2]|0;O=N+K|0;P=c[(c[E>>2]|0)+32>>2]|0;cL[P&15](H,N,O,J)|0;if((K|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}lC(t|0,0,12);lC(v|0,0,12);lC(x|0,0,12);iK(g,Q,o,p,q,r,s,u,w,y);O=z|0;N=c[y>>2]|0;if((K|0)>(N|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(K-N<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+N|0;do{if(P>>>0>100){E=lk(P)|0;if((E|0)!=0){W=E;X=E;break}lz();W=0;X=0}else{W=O;X=0}}while(0);iL(W,A,C,c[j+4>>2]|0,J,J+K|0,H,Q,p,a[q]|0,a[r]|0,s,u,w,N);c[D>>2]=c[f>>2];gN(b,D,W,c[A>>2]|0,c[C>>2]|0,j,k);if((X|0)!=0){ll(X)}ep(w);ep(u);ep(s);O=c[G>>2]|0;d4(O)|0;if((M|0)!=0){ll(M)}if((L|0)==0){i=e;return}ll(L);i=e;return}}while(0);e=cj(4)|0;k1(e);bA(e|0,22008,138)}function iK(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[6896]|0)!=-1){c[p>>2]=27584;c[p+4>>2]=12;c[p+8>>2]=0;eu(27584,p,98)}p=(c[6897]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=cj(4)|0;R=Q;k1(R);bA(Q|0,22008,138)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=cj(4)|0;R=Q;k1(R);bA(Q|0,22008,138)}Q=e;R=c[e>>2]|0;if(d){cy[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;cy[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){a[l+1|0]=0;a[r]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eF(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];lC(t|0,0,12);ep(s)}else{cy[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;cy[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){a[l+1|0]=0;a[v]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eF(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];lC(x|0,0,12);ep(w)}w=e;a[g]=cB[c[(c[w>>2]|0)+12>>2]&255](Q)|0;a[h]=cB[c[(c[w>>2]|0)+16>>2]&255](Q)|0;w=e;cy[c[(c[w>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eF(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];lC(z|0,0,12);ep(y);cy[c[(c[w>>2]|0)+24>>2]&127](A,Q);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eF(k,0);c[w>>2]=c[B>>2];c[w+4>>2]=c[B+4>>2];c[w+8>>2]=c[B+8>>2];lC(B|0,0,12);ep(A);S=cB[c[(c[e>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[6898]|0)!=-1){c[o>>2]=27592;c[o+4>>2]=12;c[o+8>>2]=0;eu(27592,o,98)}o=(c[6899]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=cj(4)|0;U=T;k1(U);bA(T|0,22008,138)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=cj(4)|0;U=T;k1(U);bA(T|0,22008,138)}T=P;U=c[P>>2]|0;if(d){cy[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;cy[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){a[l+1|0]=0;a[E]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eF(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];lC(G|0,0,12);ep(F)}else{cy[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;cy[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}eF(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];lC(K|0,0,12);ep(J)}J=P;a[g]=cB[c[(c[J>>2]|0)+12>>2]&255](T)|0;a[h]=cB[c[(c[J>>2]|0)+16>>2]&255](T)|0;J=P;cy[c[(c[J>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eF(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];lC(M|0,0,12);ep(L);cy[c[(c[J>>2]|0)+24>>2]&127](N,T);J=k;if((a[J]&1)==0){a[k+1|0]=0;a[J]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}eF(k,0);c[J>>2]=c[O>>2];c[J+4>>2]=c[O+4>>2];c[J+8>>2]=c[O+8>>2];lC(O|0,0,12);ep(N);S=cB[c[(c[P>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function iL(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0;c[f>>2]=d;s=j;t=q;u=q+1|0;v=q+8|0;w=q+4|0;q=p;x=(g&512|0)==0;y=p+1|0;z=p+4|0;A=p+8|0;p=j+8|0;B=(r|0)>0;C=o;D=o+1|0;E=o+8|0;F=o+4|0;o=-r|0;G=h;h=0;while(1){H=a[l+h|0]|0;do{if((H|0)==0){c[e>>2]=c[f>>2];I=G}else if((H|0)==1){c[e>>2]=c[f>>2];J=cz[c[(c[s>>2]|0)+28>>2]&63](j,32)|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=J;I=G}else if((H|0)==3){J=a[t]|0;K=J&255;if((K&1|0)==0){L=K>>>1}else{L=c[w>>2]|0}if((L|0)==0){I=G;break}if((J&1)==0){M=u}else{M=c[v>>2]|0}J=a[M]|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K]=J;I=G}else if((H|0)==2){J=a[q]|0;K=J&255;N=(K&1|0)==0;if(N){O=K>>>1}else{O=c[z>>2]|0}if((O|0)==0|x){I=G;break}if((J&1)==0){P=y;Q=y}else{J=c[A>>2]|0;P=J;Q=J}if(N){R=K>>>1}else{R=c[z>>2]|0}K=P+R|0;N=c[f>>2]|0;if((Q|0)==(K|0)){S=N}else{J=Q;T=N;while(1){a[T]=a[J]|0;N=J+1|0;U=T+1|0;if((N|0)==(K|0)){S=U;break}else{J=N;T=U}}}c[f>>2]=S;I=G}else if((H|0)==4){T=c[f>>2]|0;J=k?G+1|0:G;K=J;while(1){if(K>>>0>=i>>>0){break}U=a[K]|0;if(U<<24>>24<=-1){break}if((b[(c[p>>2]|0)+(U<<24>>24<<1)>>1]&2048)==0){break}else{K=K+1|0}}U=K;if(B){if(K>>>0>J>>>0){N=J+(-U|0)|0;U=N>>>0<o>>>0?o:N;N=U+r|0;V=K;W=r;X=T;while(1){Y=V-1|0;Z=a[Y]|0;c[f>>2]=X+1;a[X]=Z;Z=W-1|0;_=(Z|0)>0;if(!(Y>>>0>J>>>0&_)){break}V=Y;W=Z;X=c[f>>2]|0}X=K+U|0;if(_){$=N;aa=X;ab=1156}else{ac=0;ad=N;ae=X}}else{$=r;aa=K;ab=1156}if((ab|0)==1156){ab=0;ac=cz[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;ad=$;ae=aa}X=c[f>>2]|0;c[f>>2]=X+1;if((ad|0)>0){W=ad;V=X;while(1){a[V]=ac;Z=W-1|0;Y=c[f>>2]|0;c[f>>2]=Y+1;if((Z|0)>0){W=Z;V=Y}else{af=Y;break}}}else{af=X}a[af]=m;ag=ae}else{ag=K}if((ag|0)==(J|0)){V=cz[c[(c[s>>2]|0)+28>>2]&63](j,48)|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=V}else{V=a[C]|0;W=V&255;if((W&1|0)==0){ah=W>>>1}else{ah=c[F>>2]|0}if((ah|0)==0){ai=ag;aj=0;ak=0;al=-1}else{if((V&1)==0){am=D}else{am=c[E>>2]|0}ai=ag;aj=0;ak=0;al=a[am]|0}while(1){do{if((aj|0)==(al|0)){V=c[f>>2]|0;c[f>>2]=V+1;a[V]=n;V=ak+1|0;W=a[C]|0;N=W&255;if((N&1|0)==0){an=N>>>1}else{an=c[F>>2]|0}if(V>>>0>=an>>>0){ao=al;ap=V;aq=0;break}N=(W&1)==0;if(N){ar=D}else{ar=c[E>>2]|0}if((a[ar+V|0]|0)==127){ao=-1;ap=V;aq=0;break}if(N){as=D}else{as=c[E>>2]|0}ao=a[as+V|0]|0;ap=V;aq=0}else{ao=al;ap=ak;aq=aj}}while(0);V=ai-1|0;N=a[V]|0;W=c[f>>2]|0;c[f>>2]=W+1;a[W]=N;if((V|0)==(J|0)){break}else{ai=V;aj=aq+1|0;ak=ap;al=ao}}}K=c[f>>2]|0;if((T|0)==(K|0)){I=J;break}X=K-1|0;if(T>>>0<X>>>0){at=T;au=X}else{I=J;break}while(1){X=a[at]|0;a[at]=a[au]|0;a[au]=X;X=at+1|0;K=au-1|0;if(X>>>0<K>>>0){at=X;au=K}else{I=J;break}}}else{I=G}}while(0);H=h+1|0;if(H>>>0<4){G=I;h=H}else{break}}h=a[t]|0;t=h&255;I=(t&1|0)==0;if(I){av=t>>>1}else{av=c[w>>2]|0}if(av>>>0>1){if((h&1)==0){aw=u;ax=u}else{u=c[v>>2]|0;aw=u;ax=u}if(I){ay=t>>>1}else{ay=c[w>>2]|0}w=aw+ay|0;ay=c[f>>2]|0;aw=ax+1|0;if((aw|0)==(w|0)){az=ay}else{ax=ay;ay=aw;while(1){a[ax]=a[ay]|0;aw=ax+1|0;t=ay+1|0;if((t|0)==(w|0)){az=aw;break}else{ax=aw;ay=t}}}c[f>>2]=az}az=g&176;if((az|0)==32){c[e>>2]=c[f>>2];return}else if((az|0)==16){return}else{c[e>>2]=d;return}}function iM(a){a=a|0;dH(a|0);lu(a);return}function iN(a){a=a|0;dH(a|0);return}function iO(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+100|0;i=i+7>>3<<3;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;e4(m,h);B=m|0;C=c[B>>2]|0;if((c[6778]|0)!=-1){c[l>>2]=27112;c[l+4>>2]=12;c[l+8>>2]=0;eu(27112,l,98)}l=(c[6779]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=k;I=a[H]|0;J=I&255;if((J&1|0)==0){K=J>>>1}else{K=c[k+4>>2]|0}if((K|0)==0){L=0}else{if((I&1)==0){M=G+1|0}else{M=c[k+8>>2]|0}I=a[M]|0;L=I<<24>>24==(cz[c[(c[E>>2]|0)+28>>2]&63](F,45)|0)<<24>>24}lC(r|0,0,12);lC(t|0,0,12);lC(v|0,0,12);iK(g,L,m,n,o,p,q,s,u,w);E=x|0;I=a[H]|0;J=I&255;N=(J&1|0)==0;if(N){O=J>>>1}else{O=c[k+4>>2]|0}P=c[w>>2]|0;if((O|0)>(P|0)){if(N){Q=J>>>1}else{Q=c[k+4>>2]|0}J=d[v]|0;if((J&1|0)==0){R=J>>>1}else{R=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){S=J>>>1}else{S=c[s+4>>2]|0}T=(Q-P<<1|1)+R+S|0}else{J=d[v]|0;if((J&1|0)==0){U=J>>>1}else{U=c[u+4>>2]|0}J=d[t]|0;if((J&1|0)==0){V=J>>>1}else{V=c[s+4>>2]|0}T=U+2+V|0}J=T+P|0;do{if(J>>>0>100){N=lk(J)|0;if((N|0)!=0){W=N;X=N;Y=I;break}lz();W=0;X=0;Y=a[H]|0}else{W=E;X=0;Y=I}}while(0);if((Y&1)==0){Z=G+1|0;_=G+1|0}else{I=c[k+8>>2]|0;Z=I;_=I}I=Y&255;if((I&1|0)==0){$=I>>>1}else{$=c[k+4>>2]|0}iL(W,y,z,c[h+4>>2]|0,_,Z+$|0,F,L,n,a[o]|0,a[p]|0,q,s,u,P);c[A>>2]=c[f>>2];gN(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){ep(u);ep(s);ep(q);aa=c[B>>2]|0;ab=aa|0;ac=d4(ab)|0;i=e;return}ll(X);ep(u);ep(s);ep(q);aa=c[B>>2]|0;ab=aa|0;ac=d4(ab)|0;i=e;return}}while(0);e=cj(4)|0;k1(e);bA(e|0,22008,138)}function iP(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+576|0;m=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[m>>2];m=e|0;n=e+120|0;o=e+528|0;p=e+536|0;q=e+544|0;r=e+552|0;s=e+560|0;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+400|0;A=i;i=i+4|0;i=i+7>>3<<3;C=i;i=i+4|0;i=i+7>>3<<3;D=i;i=i+4|0;i=i+7>>3<<3;E=e+16|0;c[n>>2]=E;F=e+128|0;G=a1(E|0,100,6760,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;do{if(G>>>0>99){do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);E=gU(n,c[6438]|0,6760,(B=i,i=i+8|0,h[B>>3]=l,B)|0)|0;H=c[n>>2]|0;if((H|0)==0){lz();I=c[n>>2]|0}else{I=H}H=lk(E<<2)|0;J=H;if((H|0)!=0){K=J;L=E;M=I;N=J;break}lz();K=J;L=E;M=I;N=J}else{K=F;L=G;M=0;N=0}}while(0);e4(o,j);G=o|0;F=c[G>>2]|0;if((c[6776]|0)!=-1){c[m>>2]=27104;c[m+4>>2]=12;c[m+8>>2]=0;eu(27104,m,98)}m=(c[6777]|0)-1|0;I=c[F+8>>2]|0;do{if((c[F+12>>2]|0)-I>>2>>>0>m>>>0){J=c[I+(m<<2)>>2]|0;if((J|0)==0){break}E=J;H=c[n>>2]|0;O=H+L|0;P=c[(c[J>>2]|0)+48>>2]|0;cL[P&15](E,H,O,K)|0;if((L|0)==0){Q=0}else{Q=(a[c[n>>2]|0]|0)==45}lC(t|0,0,12);lC(v|0,0,12);lC(x|0,0,12);iQ(g,Q,o,p,q,r,s,u,w,y);O=z|0;H=c[y>>2]|0;if((L|0)>(H|0)){P=d[x]|0;if((P&1|0)==0){R=P>>>1}else{R=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){S=P>>>1}else{S=c[u+4>>2]|0}T=(L-H<<1|1)+R+S|0}else{P=d[x]|0;if((P&1|0)==0){U=P>>>1}else{U=c[w+4>>2]|0}P=d[v]|0;if((P&1|0)==0){V=P>>>1}else{V=c[u+4>>2]|0}T=U+2+V|0}P=T+H|0;do{if(P>>>0>100){J=lk(P<<2)|0;W=J;if((J|0)!=0){X=W;Y=W;break}lz();X=W;Y=W}else{X=O;Y=0}}while(0);iR(X,A,C,c[j+4>>2]|0,K,K+(L<<2)|0,E,Q,p,c[q>>2]|0,c[r>>2]|0,s,u,w,H);c[D>>2]=c[f>>2];g1(b,D,X,c[A>>2]|0,c[C>>2]|0,j,k);if((Y|0)!=0){ll(Y)}eC(w);eC(u);ep(s);O=c[G>>2]|0;d4(O)|0;if((N|0)!=0){ll(N)}if((M|0)==0){i=e;return}ll(M);i=e;return}}while(0);e=cj(4)|0;k1(e);bA(e|0,22008,138)}function iQ(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;n=i;i=i+40|0;o=n|0;p=n+16|0;q=n+32|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+4|0;i=i+7>>3<<3;v=u;w=i;i=i+12|0;i=i+7>>3<<3;x=w;y=i;i=i+12|0;i=i+7>>3<<3;z=y;A=i;i=i+12|0;i=i+7>>3<<3;B=A;D=i;i=i+4|0;i=i+7>>3<<3;E=D;F=i;i=i+12|0;i=i+7>>3<<3;G=F;H=i;i=i+4|0;i=i+7>>3<<3;I=H;J=i;i=i+12|0;i=i+7>>3<<3;K=J;L=i;i=i+12|0;i=i+7>>3<<3;M=L;N=i;i=i+12|0;i=i+7>>3<<3;O=N;P=c[e>>2]|0;if(b){if((c[6892]|0)!=-1){c[p>>2]=27568;c[p+4>>2]=12;c[p+8>>2]=0;eu(27568,p,98)}p=(c[6893]|0)-1|0;b=c[P+8>>2]|0;if((c[P+12>>2]|0)-b>>2>>>0<=p>>>0){Q=cj(4)|0;R=Q;k1(R);bA(Q|0,22008,138)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){Q=cj(4)|0;R=Q;k1(R);bA(Q|0,22008,138)}Q=e;R=c[e>>2]|0;if(d){cy[c[R+44>>2]&127](r,Q);r=f;C=c[q>>2]|0;a[r]=C&255;C=C>>8;a[r+1|0]=C&255;C=C>>8;a[r+2|0]=C&255;C=C>>8;a[r+3|0]=C&255;cy[c[(c[e>>2]|0)+32>>2]&127](s,Q);r=l;if((a[r]&1)==0){c[l+4>>2]=0;a[r]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eL(l,0);c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];lC(t|0,0,12);eC(s)}else{cy[c[R+40>>2]&127](v,Q);v=f;C=c[u>>2]|0;a[v]=C&255;C=C>>8;a[v+1|0]=C&255;C=C>>8;a[v+2|0]=C&255;C=C>>8;a[v+3|0]=C&255;cy[c[(c[e>>2]|0)+28>>2]&127](w,Q);v=l;if((a[v]&1)==0){c[l+4>>2]=0;a[v]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eL(l,0);c[v>>2]=c[x>>2];c[v+4>>2]=c[x+4>>2];c[v+8>>2]=c[x+8>>2];lC(x|0,0,12);eC(w)}w=e;c[g>>2]=cB[c[(c[w>>2]|0)+12>>2]&255](Q)|0;c[h>>2]=cB[c[(c[w>>2]|0)+16>>2]&255](Q)|0;cy[c[(c[e>>2]|0)+20>>2]&127](y,Q);x=j;if((a[x]&1)==0){a[j+1|0]=0;a[x]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eF(j,0);c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];lC(z|0,0,12);ep(y);cy[c[(c[e>>2]|0)+24>>2]&127](A,Q);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eL(k,0);c[e>>2]=c[B>>2];c[e+4>>2]=c[B+4>>2];c[e+8>>2]=c[B+8>>2];lC(B|0,0,12);eC(A);S=cB[c[(c[w>>2]|0)+36>>2]&255](Q)|0;c[m>>2]=S;i=n;return}else{if((c[6894]|0)!=-1){c[o>>2]=27576;c[o+4>>2]=12;c[o+8>>2]=0;eu(27576,o,98)}o=(c[6895]|0)-1|0;Q=c[P+8>>2]|0;if((c[P+12>>2]|0)-Q>>2>>>0<=o>>>0){T=cj(4)|0;U=T;k1(U);bA(T|0,22008,138)}P=c[Q+(o<<2)>>2]|0;if((P|0)==0){T=cj(4)|0;U=T;k1(U);bA(T|0,22008,138)}T=P;U=c[P>>2]|0;if(d){cy[c[U+44>>2]&127](E,T);E=f;C=c[D>>2]|0;a[E]=C&255;C=C>>8;a[E+1|0]=C&255;C=C>>8;a[E+2|0]=C&255;C=C>>8;a[E+3|0]=C&255;cy[c[(c[P>>2]|0)+32>>2]&127](F,T);E=l;if((a[E]&1)==0){c[l+4>>2]=0;a[E]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eL(l,0);c[E>>2]=c[G>>2];c[E+4>>2]=c[G+4>>2];c[E+8>>2]=c[G+8>>2];lC(G|0,0,12);eC(F)}else{cy[c[U+40>>2]&127](I,T);I=f;C=c[H>>2]|0;a[I]=C&255;C=C>>8;a[I+1|0]=C&255;C=C>>8;a[I+2|0]=C&255;C=C>>8;a[I+3|0]=C&255;cy[c[(c[P>>2]|0)+28>>2]&127](J,T);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}eL(l,0);c[I>>2]=c[K>>2];c[I+4>>2]=c[K+4>>2];c[I+8>>2]=c[K+8>>2];lC(K|0,0,12);eC(J)}J=P;c[g>>2]=cB[c[(c[J>>2]|0)+12>>2]&255](T)|0;c[h>>2]=cB[c[(c[J>>2]|0)+16>>2]&255](T)|0;cy[c[(c[P>>2]|0)+20>>2]&127](L,T);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}eF(j,0);c[h>>2]=c[M>>2];c[h+4>>2]=c[M+4>>2];c[h+8>>2]=c[M+8>>2];lC(M|0,0,12);ep(L);cy[c[(c[P>>2]|0)+24>>2]&127](N,T);P=k;if((a[P]&1)==0){c[k+4>>2]=0;a[P]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}eL(k,0);c[P>>2]=c[O>>2];c[P+4>>2]=c[O+4>>2];c[P+8>>2]=c[O+8>>2];lC(O|0,0,12);eC(N);S=cB[c[(c[J>>2]|0)+36>>2]&255](T)|0;c[m>>2]=S;i=n;return}}function iR(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;c[e>>2]=b;r=i;s=p;t=p+4|0;u=p+8|0;p=o;v=(f&512|0)==0;w=o+4|0;x=o+8|0;o=i;y=(q|0)>0;z=n;A=n+1|0;B=n+8|0;C=n+4|0;n=g;g=0;while(1){D=a[k+g|0]|0;do{if((D|0)==1){c[d>>2]=c[e>>2];E=cz[c[(c[r>>2]|0)+44>>2]&63](i,32)|0;F=c[e>>2]|0;c[e>>2]=F+4;c[F>>2]=E;G=n}else if((D|0)==3){E=a[s]|0;F=E&255;if((F&1|0)==0){H=F>>>1}else{H=c[t>>2]|0}if((H|0)==0){G=n;break}if((E&1)==0){I=t}else{I=c[u>>2]|0}E=c[I>>2]|0;F=c[e>>2]|0;c[e>>2]=F+4;c[F>>2]=E;G=n}else if((D|0)==2){E=a[p]|0;F=E&255;J=(F&1|0)==0;if(J){K=F>>>1}else{K=c[w>>2]|0}if((K|0)==0|v){G=n;break}if((E&1)==0){L=w;M=w;N=w}else{E=c[x>>2]|0;L=E;M=E;N=E}if(J){O=F>>>1}else{O=c[w>>2]|0}F=L+(O<<2)|0;J=c[e>>2]|0;if((M|0)==(F|0)){P=J}else{E=(L+(O-1<<2)+(-N|0)|0)>>>2;Q=M;R=J;while(1){c[R>>2]=c[Q>>2];S=Q+4|0;if((S|0)==(F|0)){break}Q=S;R=R+4|0}P=J+(E+1<<2)|0}c[e>>2]=P;G=n}else if((D|0)==4){R=c[e>>2]|0;Q=j?n+4|0:n;F=Q;while(1){if(F>>>0>=h>>>0){break}if(cC[c[(c[o>>2]|0)+12>>2]&63](i,2048,c[F>>2]|0)|0){F=F+4|0}else{break}}if(y){if(F>>>0>Q>>>0){E=F;J=q;do{E=E-4|0;S=c[E>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=S;J=J-1|0;U=(J|0)>0;}while(E>>>0>Q>>>0&U);if(U){V=J;W=E;X=1432}else{Y=0;Z=J;_=E}}else{V=q;W=F;X=1432}if((X|0)==1432){X=0;Y=cz[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;Z=V;_=W}S=c[e>>2]|0;c[e>>2]=S+4;if((Z|0)>0){T=Z;$=S;while(1){c[$>>2]=Y;aa=T-1|0;ab=c[e>>2]|0;c[e>>2]=ab+4;if((aa|0)>0){T=aa;$=ab}else{ac=ab;break}}}else{ac=S}c[ac>>2]=l;ad=_}else{ad=F}if((ad|0)==(Q|0)){$=cz[c[(c[r>>2]|0)+44>>2]&63](i,48)|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=$}else{$=a[z]|0;T=$&255;if((T&1|0)==0){ae=T>>>1}else{ae=c[C>>2]|0}if((ae|0)==0){af=ad;ag=0;ah=0;ai=-1}else{if(($&1)==0){aj=A}else{aj=c[B>>2]|0}af=ad;ag=0;ah=0;ai=a[aj]|0}while(1){do{if((ag|0)==(ai|0)){$=c[e>>2]|0;c[e>>2]=$+4;c[$>>2]=m;$=ah+1|0;T=a[z]|0;E=T&255;if((E&1|0)==0){ak=E>>>1}else{ak=c[C>>2]|0}if($>>>0>=ak>>>0){al=ai;am=$;an=0;break}E=(T&1)==0;if(E){ao=A}else{ao=c[B>>2]|0}if((a[ao+$|0]|0)==127){al=-1;am=$;an=0;break}if(E){ap=A}else{ap=c[B>>2]|0}al=a[ap+$|0]|0;am=$;an=0}else{al=ai;am=ah;an=ag}}while(0);$=af-4|0;E=c[$>>2]|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=E;if(($|0)==(Q|0)){break}else{af=$;ag=an+1|0;ah=am;ai=al}}}F=c[e>>2]|0;if((R|0)==(F|0)){G=Q;break}S=F-4|0;if(R>>>0<S>>>0){aq=R;ar=S}else{G=Q;break}while(1){S=c[aq>>2]|0;c[aq>>2]=c[ar>>2];c[ar>>2]=S;S=aq+4|0;F=ar-4|0;if(S>>>0<F>>>0){aq=S;ar=F}else{G=Q;break}}}else if((D|0)==0){c[d>>2]=c[e>>2];G=n}else{G=n}}while(0);D=g+1|0;if(D>>>0<4){n=G;g=D}else{break}}g=a[s]|0;s=g&255;G=(s&1|0)==0;if(G){as=s>>>1}else{as=c[t>>2]|0}if(as>>>0>1){if((g&1)==0){at=t;au=t;av=t}else{g=c[u>>2]|0;at=g;au=g;av=g}if(G){aw=s>>>1}else{aw=c[t>>2]|0}t=at+(aw<<2)|0;s=c[e>>2]|0;G=au+4|0;if((G|0)==(t|0)){ax=s}else{au=((at+(aw-2<<2)+(-av|0)|0)>>>2)+1|0;av=s;aw=G;while(1){c[av>>2]=c[aw>>2];G=aw+4|0;if((G|0)==(t|0)){break}else{av=av+4|0;aw=G}}ax=s+(au<<2)|0}c[e>>2]=ax}ax=f&176;if((ax|0)==16){return}else if((ax|0)==32){c[d>>2]=c[e>>2];return}else{c[d>>2]=b;return}}function iS(a){a=a|0;dH(a|0);lu(a);return}function iT(a){a=a|0;dH(a|0);return}function iU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bj(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function iV(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7>>3<<3;c[f>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+24|0;o=e+32|0;p=e+40|0;q=e+48|0;r=q;s=i;i=i+12|0;i=i+7>>3<<3;t=s;u=i;i=i+12|0;i=i+7>>3<<3;v=u;w=i;i=i+4|0;i=i+7>>3<<3;x=i;i=i+400|0;y=i;i=i+4|0;i=i+7>>3<<3;z=i;i=i+4|0;i=i+7>>3<<3;A=i;i=i+4|0;i=i+7>>3<<3;e4(m,h);B=m|0;C=c[B>>2]|0;if((c[6776]|0)!=-1){c[l>>2]=27104;c[l+4>>2]=12;c[l+8>>2]=0;eu(27104,l,98)}l=(c[6777]|0)-1|0;D=c[C+8>>2]|0;do{if((c[C+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=k;H=a[G]|0;I=H&255;if((I&1|0)==0){J=I>>>1}else{J=c[k+4>>2]|0}if((J|0)==0){K=0}else{if((H&1)==0){L=k+4|0}else{L=c[k+8>>2]|0}H=c[L>>2]|0;K=(H|0)==(cz[c[(c[E>>2]|0)+44>>2]&63](F,45)|0)}lC(r|0,0,12);lC(t|0,0,12);lC(v|0,0,12);iQ(g,K,m,n,o,p,q,s,u,w);E=x|0;H=a[G]|0;I=H&255;M=(I&1|0)==0;if(M){N=I>>>1}else{N=c[k+4>>2]|0}O=c[w>>2]|0;if((N|0)>(O|0)){if(M){P=I>>>1}else{P=c[k+4>>2]|0}I=d[v]|0;if((I&1|0)==0){Q=I>>>1}else{Q=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){R=I>>>1}else{R=c[s+4>>2]|0}S=(P-O<<1|1)+Q+R|0}else{I=d[v]|0;if((I&1|0)==0){T=I>>>1}else{T=c[u+4>>2]|0}I=d[t]|0;if((I&1|0)==0){U=I>>>1}else{U=c[s+4>>2]|0}S=T+2+U|0}I=S+O|0;do{if(I>>>0>100){M=lk(I<<2)|0;V=M;if((M|0)!=0){W=V;X=V;Y=H;break}lz();W=V;X=V;Y=a[G]|0}else{W=E;X=0;Y=H}}while(0);if((Y&1)==0){Z=k+4|0;_=k+4|0}else{H=c[k+8>>2]|0;Z=H;_=H}H=Y&255;if((H&1|0)==0){$=H>>>1}else{$=c[k+4>>2]|0}iR(W,y,z,c[h+4>>2]|0,_,Z+($<<2)|0,F,K,n,c[o>>2]|0,c[p>>2]|0,q,s,u,O);c[A>>2]=c[f>>2];g1(b,A,W,c[y>>2]|0,c[z>>2]|0,h,j);if((X|0)==0){eC(u);eC(s);ep(q);aa=c[B>>2]|0;ab=aa|0;ac=d4(ab)|0;i=e;return}ll(X);eC(u);eC(s);ep(q);aa=c[B>>2]|0;ab=aa|0;ac=d4(ab)|0;i=e;return}}while(0);e=cj(4)|0;k1(e);bA(e|0,22008,138)}function iW(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+16|0;j=d|0;k=j;lC(k|0,0,12);l=b;m=h;n=a[h]|0;if((n&1)==0){o=m+1|0;p=m+1|0}else{m=c[h+8>>2]|0;o=m;p=m}m=n&255;if((m&1|0)==0){q=m>>>1}else{q=c[h+4>>2]|0}h=o+q|0;do{if(p>>>0<h>>>0){q=p;do{eA(j,a[q]|0);q=q+1|0;}while(q>>>0<h>>>0);q=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){r=q;s=1564;break}t=c[j+8>>2]|0;u=q}else{r=(e|0)==-1?-1:e<<1;s=1564}}while(0);if((s|0)==1564){t=j+1|0;u=r}r=cg(u|0,f|0,g|0,t|0)|0;lC(l|0,0,12);l=lB(r|0)|0;t=r+l|0;if((l|0)>0){v=r}else{ep(j);i=d;return}do{eA(b,a[v]|0);v=v+1|0;}while(v>>>0<t>>>0);ep(j);i=d;return}function iX(a,b){a=a|0;b=b|0;bb(((b|0)==-1?-1:b<<1)|0)|0;return}function iY(a){a=a|0;dH(a|0);lu(a);return}function iZ(a){a=a|0;dH(a|0);return}function i_(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=bj(f|0,200)|0;return d>>>(((d|0)!=-1|0)>>>0)|0}function i$(a,b){a=a|0;b=b|0;bb(((b|0)==-1?-1:b<<1)|0)|0;return}function i0(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+224|0;j=d|0;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;lC(s|0,0,12);v=b;w=t|0;c[t+4>>2]=0;c[t>>2]=17704;x=a[h]|0;if((x&1)==0){y=h+4|0;z=h+4|0}else{A=c[h+8>>2]|0;y=A;z=A}A=x&255;if((A&1|0)==0){B=A>>>1}else{B=c[h+4>>2]|0}h=y+(B<<2)|0;L1913:do{if(z>>>0<h>>>0){B=t;y=k|0;A=k+32|0;x=z;C=17704;while(1){c[m>>2]=x;D=(cH[c[C+12>>2]&31](w,j,x,h,m,y,A,l)|0)==2;E=c[m>>2]|0;if(D|(E|0)==(x|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){D=y;do{eA(r,a[D]|0);D=D+1|0;}while(D>>>0<(c[l>>2]|0)>>>0);F=c[m>>2]|0}else{F=E}if(F>>>0>=h>>>0){break L1913}x=F;C=c[B>>2]|0}B=cj(8)|0;d9(B,4056);bA(B|0,22024,22)}}while(0);dH(t|0);if((a[s]&1)==0){G=r+1|0}else{G=c[r+8>>2]|0}s=cg(((e|0)==-1?-1:e<<1)|0,f|0,g|0,G|0)|0;lC(v|0,0,12);v=u|0;c[u+4>>2]=0;c[u>>2]=17648;G=lB(s|0)|0;g=s+G|0;if((G|0)<1){H=u|0;dH(H);ep(r);i=d;return}G=u;f=g;e=o|0;t=o+128|0;o=s;s=17648;while(1){c[q>>2]=o;F=(cH[c[s+16>>2]&31](v,n,o,(f-o|0)>32?o+32|0:g,q,e,t,p)|0)==2;h=c[q>>2]|0;if(F|(h|0)==(o|0)){break}if(e>>>0<(c[p>>2]|0)>>>0){F=e;do{e2(b,c[F>>2]|0);F=F+4|0;}while(F>>>0<(c[p>>2]|0)>>>0);I=c[q>>2]|0}else{I=h}if(I>>>0>=g>>>0){J=1632;break}o=I;s=c[G>>2]|0}if((J|0)==1632){H=u|0;dH(H);ep(r);i=d;return}d=cj(8)|0;d9(d,4056);bA(d|0,22024,22)}function i1(a){a=a|0;var b=0;c[a>>2]=17120;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dH(a|0);return}function i2(a){a=a|0;a=cj(8)|0;d5(a,6472);c[a>>2]=16056;bA(a|0,22040,34)}function i3(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+448|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d-1;c[b>>2]=17376;d=b+8|0;I=b+12|0;a[b+136|0]=1;J=b+24|0;K=J;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J+112;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J-1|0;}while((J|0)!=0);ex(b+144|0,6136,1);J=c[d>>2]|0;d=c[I>>2]|0;if((J|0)!=(d|0)){c[I>>2]=d+(~((d-4+(-J|0)|0)>>>2)<<2)}c[6471]=0;c[6470]=17080;if((c[6698]|0)!=-1){c[H>>2]=26792;c[H+4>>2]=12;c[H+8>>2]=0;eu(26792,H,98)}jk(b,25880,(c[6699]|0)-1|0);c[6469]=0;c[6468]=17040;if((c[6696]|0)!=-1){c[G>>2]=26784;c[G+4>>2]=12;c[G+8>>2]=0;eu(26784,G,98)}jk(b,25872,(c[6697]|0)-1|0);c[6521]=0;c[6520]=17488;c[6522]=0;a[26092]=0;c[6522]=c[(bh()|0)>>2];if((c[6778]|0)!=-1){c[F>>2]=27112;c[F+4>>2]=12;c[F+8>>2]=0;eu(27112,F,98)}jk(b,26080,(c[6779]|0)-1|0);c[6519]=0;c[6518]=17408;if((c[6776]|0)!=-1){c[E>>2]=27104;c[E+4>>2]=12;c[E+8>>2]=0;eu(27104,E,98)}jk(b,26072,(c[6777]|0)-1|0);c[6473]=0;c[6472]=17176;if((c[6702]|0)!=-1){c[D>>2]=26808;c[D+4>>2]=12;c[D+8>>2]=0;eu(26808,D,98)}jk(b,25888,(c[6703]|0)-1|0);c[3903]=0;c[3902]=17120;c[3904]=0;if((c[6700]|0)!=-1){c[C>>2]=26800;c[C+4>>2]=12;c[C+8>>2]=0;eu(26800,C,98)}jk(b,15608,(c[6701]|0)-1|0);c[6475]=0;c[6474]=17232;if((c[6704]|0)!=-1){c[B>>2]=26816;c[B+4>>2]=12;c[B+8>>2]=0;eu(26816,B,98)}jk(b,25896,(c[6705]|0)-1|0);c[6477]=0;c[6476]=17288;if((c[6706]|0)!=-1){c[A>>2]=26824;c[A+4>>2]=12;c[A+8>>2]=0;eu(26824,A,98)}jk(b,25904,(c[6707]|0)-1|0);c[6451]=0;c[6450]=16584;a[25808]=46;a[25809]=44;lC(25812,0,12);if((c[6682]|0)!=-1){c[z>>2]=26728;c[z+4>>2]=12;c[z+8>>2]=0;eu(26728,z,98)}jk(b,25800,(c[6683]|0)-1|0);c[3895]=0;c[3894]=16536;c[3896]=46;c[3897]=44;lC(15592,0,12);if((c[6680]|0)!=-1){c[y>>2]=26720;c[y+4>>2]=12;c[y+8>>2]=0;eu(26720,y,98)}jk(b,15576,(c[6681]|0)-1|0);c[6467]=0;c[6466]=16968;if((c[6694]|0)!=-1){c[x>>2]=26776;c[x+4>>2]=12;c[x+8>>2]=0;eu(26776,x,98)}jk(b,25864,(c[6695]|0)-1|0);c[6465]=0;c[6464]=16896;if((c[6692]|0)!=-1){c[w>>2]=26768;c[w+4>>2]=12;c[w+8>>2]=0;eu(26768,w,98)}jk(b,25856,(c[6693]|0)-1|0);c[6463]=0;c[6462]=16832;if((c[6690]|0)!=-1){c[v>>2]=26760;c[v+4>>2]=12;c[v+8>>2]=0;eu(26760,v,98)}jk(b,25848,(c[6691]|0)-1|0);c[6461]=0;c[6460]=16768;if((c[6688]|0)!=-1){c[u>>2]=26752;c[u+4>>2]=12;c[u+8>>2]=0;eu(26752,u,98)}jk(b,25840,(c[6689]|0)-1|0);c[6531]=0;c[6530]=18584;if((c[6898]|0)!=-1){c[t>>2]=27592;c[t+4>>2]=12;c[t+8>>2]=0;eu(27592,t,98)}jk(b,26120,(c[6899]|0)-1|0);c[6529]=0;c[6528]=18520;if((c[6896]|0)!=-1){c[s>>2]=27584;c[s+4>>2]=12;c[s+8>>2]=0;eu(27584,s,98)}jk(b,26112,(c[6897]|0)-1|0);c[6527]=0;c[6526]=18456;if((c[6894]|0)!=-1){c[r>>2]=27576;c[r+4>>2]=12;c[r+8>>2]=0;eu(27576,r,98)}jk(b,26104,(c[6895]|0)-1|0);c[6525]=0;c[6524]=18392;if((c[6892]|0)!=-1){c[q>>2]=27568;c[q+4>>2]=12;c[q+8>>2]=0;eu(27568,q,98)}jk(b,26096,(c[6893]|0)-1|0);c[6449]=0;c[6448]=16240;if((c[6670]|0)!=-1){c[p>>2]=26680;c[p+4>>2]=12;c[p+8>>2]=0;eu(26680,p,98)}jk(b,25792,(c[6671]|0)-1|0);c[6447]=0;c[6446]=16200;if((c[6668]|0)!=-1){c[o>>2]=26672;c[o+4>>2]=12;c[o+8>>2]=0;eu(26672,o,98)}jk(b,25784,(c[6669]|0)-1|0);c[6445]=0;c[6444]=16160;if((c[6666]|0)!=-1){c[n>>2]=26664;c[n+4>>2]=12;c[n+8>>2]=0;eu(26664,n,98)}jk(b,25776,(c[6667]|0)-1|0);c[6443]=0;c[6442]=16120;if((c[6664]|0)!=-1){c[m>>2]=26656;c[m+4>>2]=12;c[m+8>>2]=0;eu(26656,m,98)}jk(b,25768,(c[6665]|0)-1|0);c[3891]=0;c[3890]=16440;c[3892]=16488;if((c[6678]|0)!=-1){c[l>>2]=26712;c[l+4>>2]=12;c[l+8>>2]=0;eu(26712,l,98)}jk(b,15560,(c[6679]|0)-1|0);c[3887]=0;c[3886]=16344;c[3888]=16392;if((c[6676]|0)!=-1){c[k>>2]=26704;c[k+4>>2]=12;c[k+8>>2]=0;eu(26704,k,98)}jk(b,15544,(c[6677]|0)-1|0);c[3883]=0;c[3882]=17344;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);c[3884]=c[6438];c[3882]=16312;if((c[6674]|0)!=-1){c[j>>2]=26696;c[j+4>>2]=12;c[j+8>>2]=0;eu(26696,j,98)}jk(b,15528,(c[6675]|0)-1|0);c[3879]=0;c[3878]=17344;do{if((a[27720]|0)==0){if((bp(27720)|0)==0){break}c[6438]=aV(1,6136,0)|0}}while(0);c[3880]=c[6438];c[3878]=16280;if((c[6672]|0)!=-1){c[h>>2]=26688;c[h+4>>2]=12;c[h+8>>2]=0;eu(26688,h,98)}jk(b,15512,(c[6673]|0)-1|0);c[6459]=0;c[6458]=16672;if((c[6686]|0)!=-1){c[g>>2]=26744;c[g+4>>2]=12;c[g+8>>2]=0;eu(26744,g,98)}jk(b,25832,(c[6687]|0)-1|0);c[6457]=0;c[6456]=16632;if((c[6684]|0)!=-1){c[f>>2]=26736;c[f+4>>2]=12;c[f+8>>2]=0;eu(26736,f,98)}jk(b,25824,(c[6685]|0)-1|0);i=e;return}function i4(a,b){a=a|0;b=b|0;return b|0}function i5(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function i6(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function i7(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function i8(a){a=a|0;return 1}function i9(a){a=a|0;return 1}function ja(a){a=a|0;return 1}function jb(a,b){a=a|0;b=b|0;return b<<24>>24|0}function jc(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function jd(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function je(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function jf(a){a=a|0;c[a+4>>2]=(I=c[6708]|0,c[6708]=I+1,I)+1;return}function jg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){c[i>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+4|0}}return g|0}function jh(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;if((d|0)==(e|0)){h=d;return h|0}b=((e-4+(-d|0)|0)>>>2)+1|0;i=d;j=g;while(1){g=c[i>>2]|0;a[j]=g>>>0<128?g&255:f;g=i+4|0;if((g|0)==(e|0)){break}else{i=g;j=j+1|0}}h=d+(b<<2)|0;return h|0}function ji(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((c|0)==(d|0)){f=c;return f|0}else{g=c;h=e}while(1){a[h]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;h=h+1|0}}return f|0}function jj(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((c|0)==(d|0)){g=c;return g|0}else{h=c;i=f}while(1){f=a[h]|0;a[i]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;i=i+1|0}}return g|0}function jk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;dI(b|0);e=a+8|0;f=a+12|0;a=c[f>>2]|0;g=e|0;h=c[g>>2]|0;i=a-h>>2;do{if(i>>>0>d>>>0){j=h}else{k=d+1|0;if(i>>>0<k>>>0){kH(e,k-i|0);j=c[g>>2]|0;break}if(i>>>0<=k>>>0){j=h;break}l=h+(k<<2)|0;if((l|0)==(a|0)){j=h;break}c[f>>2]=a+(~((a-4+(-l|0)|0)>>>2)<<2);j=h}}while(0);h=c[j+(d<<2)>>2]|0;if((h|0)==0){m=j;n=m+(d<<2)|0;c[n>>2]=b;return}d4(h|0)|0;m=c[g>>2]|0;n=m+(d<<2)|0;c[n>>2]=b;return}function jl(a){a=a|0;jm(a);lu(a);return}function jm(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;c[b>>2]=17376;d=b+12|0;e=c[d>>2]|0;f=b+8|0;g=c[f>>2]|0;if((e|0)!=(g|0)){h=0;i=g;g=e;while(1){e=c[i+(h<<2)>>2]|0;if((e|0)==0){j=g;k=i}else{l=e|0;d4(l)|0;j=c[d>>2]|0;k=c[f>>2]|0}l=h+1|0;if(l>>>0<j-k>>2>>>0){h=l;i=k;g=j}else{break}}}ep(b+144|0);j=c[f>>2]|0;if((j|0)==0){m=b|0;dH(m);return}f=c[d>>2]|0;if((j|0)!=(f|0)){c[d>>2]=f+(~((f-4+(-j|0)|0)>>>2)<<2)}if((j|0)==(b+24|0)){a[b+136|0]=0;m=b|0;dH(m);return}else{lu(j);m=b|0;dH(m);return}}function jn(){var b=0,d=0;if((a[27704]|0)!=0){b=c[6430]|0;return b|0}if((bp(27704)|0)==0){b=c[6430]|0;return b|0}do{if((a[27712]|0)==0){if((bp(27712)|0)==0){break}i3(25912,1);c[6434]=25912;c[6432]=25736}}while(0);d=c[c[6432]>>2]|0;c[6436]=d;dI(d|0);c[6430]=25744;b=c[6430]|0;return b|0}function jo(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;c[a>>2]=d;dI(d|0);return}function jp(a){a=a|0;d4(c[a>>2]|0)|0;return}function jq(a){a=a|0;dH(a|0);lu(a);return}function jr(a){a=a|0;if((a|0)==0){return}cx[c[(c[a>>2]|0)+4>>2]&511](a);return}function js(a){a=a|0;dH(a|0);lu(a);return}function jt(b){b=b|0;var d=0;c[b>>2]=17488;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}lv(d)}}while(0);dH(b|0);lu(b);return}function ju(b){b=b|0;var d=0;c[b>>2]=17488;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}lv(d)}}while(0);dH(b|0);return}function jv(a){a=a|0;dH(a|0);lu(a);return}function jw(a){a=a|0;var b=0;b=c[(jn()|0)>>2]|0;c[a>>2]=b;dI(b|0);return}function jx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d|0;f=c[a>>2]|0;a=b|0;if((c[a>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=12;c[e+8>>2]=0;eu(a,e,98)}e=(c[b+4>>2]|0)-1|0;b=c[f+8>>2]|0;if((c[f+12>>2]|0)-b>>2>>>0<=e>>>0){g=cj(4)|0;h=g;k1(h);bA(g|0,22008,138);return 0}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=cj(4)|0;h=g;k1(h);bA(g|0,22008,138);return 0}else{i=d;return f|0}return 0}function jy(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0>=128){f=0;return f|0}f=(b[(c[(bh()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return f|0}function jz(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;if((d|0)==(e|0)){g=d;return g|0}else{h=d;i=f}while(1){f=c[h>>2]|0;if(f>>>0<128){j=b[(c[(bh()|0)>>2]|0)+(f<<1)>>1]|0}else{j=0}b[i>>1]=j;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;i=i+2|0}}return g|0}function jA(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((e|0)==(f|0)){g=e;return g|0}else{h=e}while(1){e=c[h>>2]|0;if(e>>>0<128){if((b[(c[(bh()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0){g=h;i=1882;break}}e=h+4|0;if((e|0)==(f|0)){g=f;i=1883;break}else{h=e}}if((i|0)==1882){return g|0}else if((i|0)==1883){return g|0}return 0}function jB(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a=e;while(1){if((a|0)==(f|0)){g=f;h=1893;break}e=c[a>>2]|0;if(e>>>0>=128){g=a;h=1892;break}if((b[(c[(bh()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16==0){g=a;h=1894;break}else{a=a+4|0}}if((h|0)==1892){return g|0}else if((h|0)==1893){return g|0}else if((h|0)==1894){return g|0}return 0}function jC(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(co()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function jD(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(co()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function jE(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>=128){d=b;return d|0}d=c[(c[(cp()|0)>>2]|0)+(b<<2)>>2]|0;return d|0}function jF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((b|0)==(d|0)){e=b;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(cp()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}return e|0}function jG(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(co()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function jH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(co()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function jI(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24<=-1){d=b;return d|0}d=c[(c[(cp()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;return d|0}function jJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((d|0)==(e|0)){f=d;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(cp()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}return f|0}function jK(a){a=a|0;return 0}function jL(a){a=a|0;dH(a|0);lu(a);return}function jM(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jY(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function jN(a){a=a|0;var b=0;c[a>>2]=17120;b=c[a+8>>2]|0;if((b|0)!=0){bi(b|0)}dH(a|0);lu(a);return}function jO(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;l=i;i=i+8|0;m=l|0;n=m;o=i;i=i+1|0;i=i+7>>3<<3;p=e;while(1){if((p|0)==(f|0)){q=f;break}if((c[p>>2]|0)==0){q=p;break}else{p=p+4|0}}c[k>>2]=h;c[g>>2]=e;L2325:do{if((e|0)==(f|0)|(h|0)==(j|0)){r=e}else{p=d;s=j;t=b+8|0;u=o|0;v=h;w=e;x=q;while(1){y=c[p+4>>2]|0;c[m>>2]=c[p>>2];c[m+4>>2]=y;y=b1(c[t>>2]|0)|0;z=k3(v,g,x-w>>2,s-v|0,d)|0;if((y|0)!=0){b1(y|0)|0}if((z|0)==(-1|0)){A=1980;break}else if((z|0)==0){B=1;A=2016;break}y=(c[k>>2]|0)+z|0;c[k>>2]=y;if((y|0)==(j|0)){A=2013;break}if((x|0)==(f|0)){C=f;D=y;E=c[g>>2]|0}else{y=b1(c[t>>2]|0)|0;z=kT(u,0,d)|0;if((y|0)!=0){b1(y|0)|0}if((z|0)==-1){B=2;A=2018;break}y=c[k>>2]|0;if(z>>>0>(s-y|0)>>>0){B=1;A=2019;break}L2344:do{if((z|0)!=0){F=z;G=u;H=y;while(1){I=a[G]|0;c[k>>2]=H+1;a[H]=I;I=F-1|0;if((I|0)==0){break L2344}F=I;G=G+1|0;H=c[k>>2]|0}}}while(0);y=(c[g>>2]|0)+4|0;c[g>>2]=y;z=y;while(1){if((z|0)==(f|0)){J=f;break}if((c[z>>2]|0)==0){J=z;break}else{z=z+4|0}}C=J;D=c[k>>2]|0;E=y}if((E|0)==(f|0)|(D|0)==(j|0)){r=E;break L2325}else{v=D;w=E;x=C}}if((A|0)==1980){c[k>>2]=v;L2356:do{if((w|0)==(c[g>>2]|0)){K=w}else{x=w;u=v;while(1){s=c[x>>2]|0;p=b1(c[t>>2]|0)|0;z=kT(u,s,n)|0;if((p|0)!=0){b1(p|0)|0}if((z|0)==-1){K=x;break L2356}p=(c[k>>2]|0)+z|0;c[k>>2]=p;z=x+4|0;if((z|0)==(c[g>>2]|0)){K=z;break}else{x=z;u=p}}}}while(0);c[g>>2]=K;B=2;i=l;return B|0}else if((A|0)==2013){r=c[g>>2]|0;break}else if((A|0)==2016){i=l;return B|0}else if((A|0)==2018){i=l;return B|0}else if((A|0)==2019){i=l;return B|0}}}while(0);B=(r|0)!=(f|0)|0;i=l;return B|0}function jP(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+8|0;m=l|0;n=m;o=e;while(1){if((o|0)==(f|0)){p=f;break}if((a[o]|0)==0){p=o;break}else{o=o+1|0}}c[k>>2]=h;c[g>>2]=e;L2377:do{if((e|0)==(f|0)|(h|0)==(j|0)){q=e}else{o=d;r=j;s=b+8|0;t=h;u=e;v=p;while(1){w=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=w;x=v;w=b1(c[s>>2]|0)|0;y=kQ(t,g,x-u|0,r-t>>2,d)|0;if((w|0)!=0){b1(w|0)|0}if((y|0)==(-1|0)){z=2035;break}else if((y|0)==0){A=2;z=2070;break}w=(c[k>>2]|0)+(y<<2)|0;c[k>>2]=w;if((w|0)==(j|0)){z=2067;break}y=c[g>>2]|0;if((v|0)==(f|0)){B=f;C=w;D=y}else{E=b1(c[s>>2]|0)|0;F=kP(w,y,1,d)|0;if((E|0)!=0){b1(E|0)|0}if((F|0)!=0){A=2;z=2074;break}c[k>>2]=(c[k>>2]|0)+4;F=(c[g>>2]|0)+1|0;c[g>>2]=F;E=F;while(1){if((E|0)==(f|0)){G=f;break}if((a[E]|0)==0){G=E;break}else{E=E+1|0}}B=G;C=c[k>>2]|0;D=F}if((D|0)==(f|0)|(C|0)==(j|0)){q=D;break L2377}else{t=C;u=D;v=B}}if((z|0)==2035){c[k>>2]=t;L2401:do{if((u|0)==(c[g>>2]|0)){H=u}else{v=t;r=u;while(1){o=b1(c[s>>2]|0)|0;E=kP(v,r,x-r|0,n)|0;if((o|0)!=0){b1(o|0)|0}if((E|0)==0){I=r+1|0}else if((E|0)==(-1|0)){z=2046;break}else if((E|0)==(-2|0)){z=2047;break}else{I=r+E|0}E=(c[k>>2]|0)+4|0;c[k>>2]=E;if((I|0)==(c[g>>2]|0)){H=I;break L2401}else{v=E;r=I}}if((z|0)==2046){c[g>>2]=r;A=2;i=l;return A|0}else if((z|0)==2047){c[g>>2]=r;A=1;i=l;return A|0}}}while(0);c[g>>2]=H;A=(H|0)!=(f|0)|0;i=l;return A|0}else if((z|0)==2067){q=c[g>>2]|0;break}else if((z|0)==2070){i=l;return A|0}else if((z|0)==2074){i=l;return A|0}}}while(0);A=(q|0)!=(f|0)|0;i=l;return A|0}function jQ(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;j=b1(c[b+8>>2]|0)|0;b=kT(e,0,d)|0;if((j|0)!=0){b1(j|0)|0}if((b|0)==(-1|0)|(b|0)==0){k=2;i=h;return k|0}j=b-1|0;b=c[g>>2]|0;if(j>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((j|0)==0){k=0;i=h;return k|0}else{l=j;m=e;n=b}while(1){b=a[m]|0;c[g>>2]=n+1;a[n]=b;b=l-1|0;if((b|0)==0){k=0;break}l=b;m=m+1|0;n=c[g>>2]|0}i=h;return k|0}function jR(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a+8|0;a=b1(c[b>>2]|0)|0;d=kS(0,0,1)|0;if((a|0)!=0){b1(a|0)|0}if((d|0)!=0){e=-1;return e|0}d=c[b>>2]|0;if((d|0)==0){e=1;return e|0}e=b1(d|0)|0;d=bq()|0;if((e|0)==0){f=(d|0)==1;g=f&1;return g|0}b1(e|0)|0;f=(d|0)==1;g=f&1;return g|0}function jS(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f|0)==0|(d|0)==(e|0)){g=0;return g|0}h=e;i=a+8|0;a=d;d=0;j=0;while(1){k=b1(c[i>>2]|0)|0;l=kO(a,h-a|0,b)|0;if((k|0)!=0){b1(k|0)|0}if((l|0)==(-1|0)|(l|0)==(-2|0)){g=d;m=2137;break}else if((l|0)==0){n=1;o=a+1|0}else{n=l;o=a+l|0}l=n+d|0;k=j+1|0;if(k>>>0>=f>>>0|(o|0)==(e|0)){g=l;m=2136;break}else{a=o;d=l;j=k}}if((m|0)==2136){return g|0}else if((m|0)==2137){return g|0}return 0}function jT(a){a=a|0;var b=0,d=0;b=c[a+8>>2]|0;if((b|0)==0){d=1;return d|0}a=b1(b|0)|0;b=bq()|0;if((a|0)==0){d=b;return d|0}b1(a|0)|0;d=b;return d|0}function jU(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function jV(a){a=a|0;return 0}function jW(a){a=a|0;return 0}function jX(a){a=a|0;return 4}function jY(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){m=1;return m|0}else{c[j>>2]=h+1;a[h]=-17;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-69;d=c[j>>2]|0;c[j>>2]=d+1;a[d]=-65;break}}}while(0);h=f;l=c[g>>2]|0;if(l>>>0>=f>>>0){m=0;return m|0}d=i;i=l;L2500:while(1){l=b[i>>1]|0;n=l&65535;if(n>>>0>k>>>0){m=2;o=2188;break}do{if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;o=2186;break L2500}c[j>>2]=p+1;a[p]=l&255}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;o=2194;break L2500}c[j>>2]=p+1;a[p]=(n>>>6|192)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;o=2192;break L2500}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;o=2183;break L2500}p=c[j>>2]|0;if((d-p|0)<3){m=1;o=2184;break L2500}c[j>>2]=p+1;a[p]=(n>>>12|224)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n>>>6&63|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n&63|128)&255;break}if((h-i|0)<4){m=1;o=2189;break L2500}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;o=2190;break L2500}if((d-(c[j>>2]|0)|0)<4){m=1;o=2195;break L2500}r=n&960;if(((r<<10)+65536|n<<10&64512|q&1023)>>>0>k>>>0){m=2;o=2191;break L2500}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(p>>>2|240)&255;r=c[j>>2]|0;c[j>>2]=r+1;a[r]=(n>>>2&15|p<<4&48|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(n<<4&48|q>>>6&15|128)&255;p=c[j>>2]|0;c[j>>2]=p+1;a[p]=(q&63|128)&255}}while(0);n=(c[g>>2]|0)+2|0;c[g>>2]=n;if(n>>>0<f>>>0){i=n}else{m=0;o=2193;break}}if((o|0)==2186){return m|0}else if((o|0)==2193){return m|0}else if((o|0)==2194){return m|0}else if((o|0)==2195){return m|0}else if((o|0)==2188){return m|0}else if((o|0)==2189){return m|0}else if((o|0)==2183){return m|0}else if((o|0)==2184){return m|0}else if((o|0)==2190){return m|0}else if((o|0)==2191){return m|0}else if((o|0)==2192){return m|0}return 0}function jZ(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c[g>>2]=e;c[j>>2]=h;h=c[g>>2]|0;do{if((l&4|0)==0){m=h}else{if((f-h|0)<=2){m=h;break}if((a[h]|0)!=-17){m=h;break}if((a[h+1|0]|0)!=-69){m=h;break}if((a[h+2|0]|0)!=-65){m=h;break}e=h+3|0;c[g>>2]=e;m=e}}while(0);L2545:do{if(m>>>0<f>>>0){h=f;l=i;e=c[j>>2]|0;n=m;L2547:while(1){if(e>>>0>=i>>>0){o=n;break L2545}p=a[n]|0;q=p&255;if(q>>>0>k>>>0){r=2;s=2238;break}do{if(p<<24>>24>-1){b[e>>1]=p&255;c[g>>2]=(c[g>>2]|0)+1}else{if((p&255)<194){r=2;s=2242;break L2547}if((p&255)<224){if((h-n|0)<2){r=1;s=2249;break L2547}t=d[n+1|0]|0;if((t&192|0)!=128){r=2;s=2250;break L2547}u=t&63|q<<6&1984;if(u>>>0>k>>>0){r=2;s=2239;break L2547}b[e>>1]=u&65535;c[g>>2]=(c[g>>2]|0)+2;break}if((p&255)<240){if((h-n|0)<3){r=1;s=2245;break L2547}u=a[n+1|0]|0;t=a[n+2|0]|0;if((q|0)==237){if((u&-32)<<24>>24!=-128){r=2;s=2248;break L2547}}else if((q|0)==224){if((u&-32)<<24>>24!=-96){r=2;s=2256;break L2547}}else{if((u&-64)<<24>>24!=-128){r=2;s=2257;break L2547}}v=t&255;if((v&192|0)!=128){r=2;s=2246;break L2547}t=(u&255)<<6&4032|q<<12|v&63;if((t&65535)>>>0>k>>>0){r=2;s=2247;break L2547}b[e>>1]=t&65535;c[g>>2]=(c[g>>2]|0)+3;break}if((p&255)>=245){r=2;s=2253;break L2547}if((h-n|0)<4){r=1;s=2254;break L2547}t=a[n+1|0]|0;v=a[n+2|0]|0;u=a[n+3|0]|0;if((q|0)==240){if((t+112&255)>=48){r=2;s=2237;break L2547}}else if((q|0)==244){if((t&-16)<<24>>24!=-128){r=2;s=2255;break L2547}}else{if((t&-64)<<24>>24!=-128){r=2;s=2243;break L2547}}w=v&255;if((w&192|0)!=128){r=2;s=2244;break L2547}v=u&255;if((v&192|0)!=128){r=2;s=2240;break L2547}if((l-e|0)<4){r=1;s=2241;break L2547}u=q&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){r=2;s=2252;break L2547}b[e>>1]=(x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296)&65535;u=(c[j>>2]|0)+2|0;c[j>>2]=u;b[u>>1]=(y|t&960|56320)&65535;c[g>>2]=(c[g>>2]|0)+4}}while(0);q=(c[j>>2]|0)+2|0;c[j>>2]=q;p=c[g>>2]|0;if(p>>>0<f>>>0){e=q;n=p}else{o=p;break L2545}}if((s|0)==2243){return r|0}else if((s|0)==2244){return r|0}else if((s|0)==2245){return r|0}else if((s|0)==2246){return r|0}else if((s|0)==2239){return r|0}else if((s|0)==2240){return r|0}else if((s|0)==2241){return r|0}else if((s|0)==2242){return r|0}else if((s|0)==2252){return r|0}else if((s|0)==2253){return r|0}else if((s|0)==2254){return r|0}else if((s|0)==2237){return r|0}else if((s|0)==2238){return r|0}else if((s|0)==2255){return r|0}else if((s|0)==2256){return r|0}else if((s|0)==2257){return r|0}else if((s|0)==2247){return r|0}else if((s|0)==2248){return r|0}else if((s|0)==2249){return r|0}else if((s|0)==2250){return r|0}}else{o=m}}while(0);r=o>>>0<f>>>0|0;return r|0}function j_(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2614:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=0;j=h;L2616:while(1){k=a[j]|0;l=k&255;if(l>>>0>f>>>0){m=j;break L2614}do{if(k<<24>>24>-1){n=j+1|0;o=i}else{if((k&255)<194){m=j;break L2614}if((k&255)<224){if((g-j|0)<2){m=j;break L2614}p=d[j+1|0]|0;if((p&192|0)!=128){m=j;break L2614}if((p&63|l<<6&1984)>>>0>f>>>0){m=j;break L2614}n=j+2|0;o=i;break}if((k&255)<240){q=j;if((g-q|0)<3){m=j;break L2614}p=a[j+1|0]|0;r=a[j+2|0]|0;if((l|0)==224){if((p&-32)<<24>>24!=-96){s=2278;break L2616}}else if((l|0)==237){if((p&-32)<<24>>24!=-128){s=2280;break L2616}}else{if((p&-64)<<24>>24!=-128){s=2282;break L2616}}t=r&255;if((t&192|0)!=128){m=j;break L2614}if(((p&255)<<6&4032|l<<12&61440|t&63)>>>0>f>>>0){m=j;break L2614}n=j+3|0;o=i;break}if((k&255)>=245){m=j;break L2614}u=j;if((g-u|0)<4){m=j;break L2614}if((e-i|0)>>>0<2){m=j;break L2614}t=a[j+1|0]|0;p=a[j+2|0]|0;r=a[j+3|0]|0;if((l|0)==240){if((t+112&255)>=48){s=2291;break L2616}}else if((l|0)==244){if((t&-16)<<24>>24!=-128){s=2293;break L2616}}else{if((t&-64)<<24>>24!=-128){s=2295;break L2616}}v=p&255;if((v&192|0)!=128){m=j;break L2614}p=r&255;if((p&192|0)!=128){m=j;break L2614}if(((t&255)<<12&258048|l<<18&1835008|v<<6&4032|p&63)>>>0>f>>>0){m=j;break L2614}n=j+4|0;o=i+1|0}}while(0);l=o+1|0;if(n>>>0<c>>>0&l>>>0<e>>>0){i=l;j=n}else{m=n;break L2614}}if((s|0)==2291){w=u-b|0;return w|0}else if((s|0)==2293){w=u-b|0;return w|0}else if((s|0)==2278){w=q-b|0;return w|0}else if((s|0)==2280){w=q-b|0;return w|0}else if((s|0)==2282){w=q-b|0;return w|0}else if((s|0)==2295){w=u-b|0;return w|0}}else{m=h}}while(0);w=m-b|0;return w|0}function j$(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=jZ(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function j0(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return j_(c,d,e,1114111,0)|0}function j1(a){a=a|0;dH(a|0);lu(a);return}function j2(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=j7(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function j3(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function j4(a){a=a|0;return 0}function j5(a){a=a|0;return 0}function j6(a){a=a|0;return 4}function j7(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){k=1;return k|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(f>>>0>=d>>>0){k=0;return k|0}j=g;g=f;L2685:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>i>>>0){k=2;l=2344;break}do{if(f>>>0<128){b=c[h>>2]|0;if((j-b|0)<1){k=1;l=2339;break L2685}c[h>>2]=b+1;a[b]=f&255}else{if(f>>>0<2048){b=c[h>>2]|0;if((j-b|0)<2){k=1;l=2337;break L2685}c[h>>2]=b+1;a[b]=(f>>>6|192)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}b=c[h>>2]|0;m=j-b|0;if(f>>>0<65536){if((m|0)<3){k=1;l=2342;break L2685}c[h>>2]=b+1;a[b]=(f>>>12|224)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f>>>6&63|128)&255;n=c[h>>2]|0;c[h>>2]=n+1;a[n]=(f&63|128)&255;break}else{if((m|0)<4){k=1;l=2340;break L2685}c[h>>2]=b+1;a[b]=(f>>>18|240)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>12&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f>>>6&63|128)&255;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=(f&63|128)&255;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{k=0;l=2343;break}}if((l|0)==2339){return k|0}else if((l|0)==2342){return k|0}else if((l|0)==2337){return k|0}else if((l|0)==2344){return k|0}else if((l|0)==2343){return k|0}else if((l|0)==2340){return k|0}return 0}function j8(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;c[f>>2]=b;c[i>>2]=g;g=c[f>>2]|0;do{if((k&4|0)==0){l=g}else{if((e-g|0)<=2){l=g;break}if((a[g]|0)!=-17){l=g;break}if((a[g+1|0]|0)!=-69){l=g;break}if((a[g+2|0]|0)!=-65){l=g;break}b=g+3|0;c[f>>2]=b;l=b}}while(0);L2717:do{if(l>>>0<e>>>0){g=e;k=c[i>>2]|0;b=l;L2719:while(1){if(k>>>0>=h>>>0){m=b;break L2717}n=a[b]|0;o=n&255;do{if(n<<24>>24>-1){if(o>>>0>j>>>0){p=2;q=2394;break L2719}c[k>>2]=o;c[f>>2]=(c[f>>2]|0)+1}else{if((n&255)<194){p=2;q=2388;break L2719}if((n&255)<224){if((g-b|0)<2){p=1;q=2390;break L2719}r=d[b+1|0]|0;if((r&192|0)!=128){p=2;q=2391;break L2719}s=r&63|o<<6&1984;if(s>>>0>j>>>0){p=2;q=2386;break L2719}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+2;break}if((n&255)<240){if((g-b|0)<3){p=1;q=2403;break L2719}s=a[b+1|0]|0;r=a[b+2|0]|0;if((o|0)==237){if((s&-32)<<24>>24!=-128){p=2;q=2389;break L2719}}else if((o|0)==224){if((s&-32)<<24>>24!=-96){p=2;q=2404;break L2719}}else{if((s&-64)<<24>>24!=-128){p=2;q=2387;break L2719}}t=r&255;if((t&192|0)!=128){p=2;q=2402;break L2719}r=(s&255)<<6&4032|o<<12&61440|t&63;if(r>>>0>j>>>0){p=2;q=2399;break L2719}c[k>>2]=r;c[f>>2]=(c[f>>2]|0)+3;break}if((n&255)>=245){p=2;q=2392;break L2719}if((g-b|0)<4){p=1;q=2393;break L2719}r=a[b+1|0]|0;t=a[b+2|0]|0;s=a[b+3|0]|0;if((o|0)==240){if((r+112&255)>=48){p=2;q=2397;break L2719}}else if((o|0)==244){if((r&-16)<<24>>24!=-128){p=2;q=2401;break L2719}}else{if((r&-64)<<24>>24!=-128){p=2;q=2395;break L2719}}u=t&255;if((u&192|0)!=128){p=2;q=2396;break L2719}t=s&255;if((t&192|0)!=128){p=2;q=2385;break L2719}s=(r&255)<<12&258048|o<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){p=2;q=2400;break L2719}c[k>>2]=s;c[f>>2]=(c[f>>2]|0)+4}}while(0);o=(c[i>>2]|0)+4|0;c[i>>2]=o;n=c[f>>2]|0;if(n>>>0<e>>>0){k=o;b=n}else{m=n;break L2717}}if((q|0)==2403){return p|0}else if((q|0)==2404){return p|0}else if((q|0)==2391){return p|0}else if((q|0)==2392){return p|0}else if((q|0)==2393){return p|0}else if((q|0)==2394){return p|0}else if((q|0)==2387){return p|0}else if((q|0)==2388){return p|0}else if((q|0)==2389){return p|0}else if((q|0)==2390){return p|0}else if((q|0)==2399){return p|0}else if((q|0)==2400){return p|0}else if((q|0)==2401){return p|0}else if((q|0)==2402){return p|0}else if((q|0)==2385){return p|0}else if((q|0)==2386){return p|0}else if((q|0)==2395){return p|0}else if((q|0)==2396){return p|0}else if((q|0)==2397){return p|0}}else{m=l}}while(0);p=m>>>0<e>>>0|0;return p|0}function j9(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;do{if((g&4|0)==0){h=b}else{if((c-b|0)<=2){h=b;break}if((a[b]|0)!=-17){h=b;break}if((a[b+1|0]|0)!=-69){h=b;break}h=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);L2784:do{if(h>>>0<c>>>0&(e|0)!=0){g=c;i=1;j=h;L2786:while(1){k=a[j]|0;l=k&255;do{if(k<<24>>24>-1){if(l>>>0>f>>>0){m=j;break L2784}n=j+1|0}else{if((k&255)<194){m=j;break L2784}if((k&255)<224){if((g-j|0)<2){m=j;break L2784}o=d[j+1|0]|0;if((o&192|0)!=128){m=j;break L2784}if((o&63|l<<6&1984)>>>0>f>>>0){m=j;break L2784}n=j+2|0;break}if((k&255)<240){p=j;if((g-p|0)<3){m=j;break L2784}o=a[j+1|0]|0;q=a[j+2|0]|0;if((l|0)==224){if((o&-32)<<24>>24!=-96){r=2425;break L2786}}else if((l|0)==237){if((o&-32)<<24>>24!=-128){r=2427;break L2786}}else{if((o&-64)<<24>>24!=-128){r=2429;break L2786}}s=q&255;if((s&192|0)!=128){m=j;break L2784}if(((o&255)<<6&4032|l<<12&61440|s&63)>>>0>f>>>0){m=j;break L2784}n=j+3|0;break}if((k&255)>=245){m=j;break L2784}t=j;if((g-t|0)<4){m=j;break L2784}s=a[j+1|0]|0;o=a[j+2|0]|0;q=a[j+3|0]|0;if((l|0)==244){if((s&-16)<<24>>24!=-128){r=2439;break L2786}}else if((l|0)==240){if((s+112&255)>=48){r=2437;break L2786}}else{if((s&-64)<<24>>24!=-128){r=2441;break L2786}}u=o&255;if((u&192|0)!=128){m=j;break L2784}o=q&255;if((o&192|0)!=128){m=j;break L2784}if(((s&255)<<12&258048|l<<18&1835008|u<<6&4032|o&63)>>>0>f>>>0){m=j;break L2784}n=j+4|0}}while(0);if(!(n>>>0<c>>>0&i>>>0<e>>>0)){m=n;break L2784}i=i+1|0;j=n}if((r|0)==2441){v=t-b|0;return v|0}else if((r|0)==2439){v=t-b|0;return v|0}else if((r|0)==2425){v=p-b|0;return v|0}else if((r|0)==2427){v=p-b|0;return v|0}else if((r|0)==2429){v=p-b|0;return v|0}else if((r|0)==2437){v=t-b|0;return v|0}}else{m=h}}while(0);v=m-b|0;return v|0}function ka(b){b=b|0;return a[b+8|0]|0}function kb(a){a=a|0;return c[a+8>>2]|0}function kc(b){b=b|0;return a[b+9|0]|0}function kd(a){a=a|0;return c[a+12>>2]|0}function ke(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b|0;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=j8(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function kf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return j9(c,d,e,1114111,0)|0}function kg(a){a=a|0;dH(a|0);lu(a);return}function kh(a){a=a|0;dH(a|0);lu(a);return}function ki(a){a=a|0;c[a>>2]=16584;ep(a+12|0);dH(a|0);lu(a);return}function kj(a){a=a|0;c[a>>2]=16584;ep(a+12|0);dH(a|0);return}function kk(a){a=a|0;c[a>>2]=16536;ep(a+16|0);dH(a|0);lu(a);return}function kl(a){a=a|0;c[a>>2]=16536;ep(a+16|0);dH(a|0);return}function km(a,b){a=a|0;b=b|0;ew(a,b+12|0);return}function kn(a,b){a=a|0;b=b|0;ew(a,b+16|0);return}function ko(a,b){a=a|0;b=b|0;ex(a,4928,4);return}function kp(a,b){a=a|0;b=b|0;eJ(a,4880,kZ(4880)|0);return}function kq(a,b){a=a|0;b=b|0;ex(a,4832,5);return}function kr(a,b){a=a|0;b=b|0;eJ(a,4784,kZ(4784)|0);return}function ks(b){b=b|0;var d=0;if((a[27800]|0)!=0){d=c[6556]|0;return d|0}if((bp(27800)|0)==0){d=c[6556]|0;return d|0}do{if((a[27688]|0)==0){if((bp(27688)|0)==0){break}lC(25264,0,168);a6(274,0,u|0)|0}}while(0);er(25264,14112)|0;er(25276,14072)|0;er(25288,14048)|0;er(25300,14016)|0;er(25312,13976)|0;er(25324,7464)|0;er(25336,7424)|0;er(25348,7392)|0;er(25360,7352)|0;er(25372,7304)|0;er(25384,7272)|0;er(25396,7232)|0;er(25408,7208)|0;er(25420,7176)|0;c[6556]=25264;d=c[6556]|0;return d|0}function kt(b){b=b|0;var d=0;if((a[27744]|0)!=0){d=c[6534]|0;return d|0}if((bp(27744)|0)==0){d=c[6534]|0;return d|0}do{if((a[27664]|0)==0){if((bp(27664)|0)==0){break}lC(24520,0,168);a6(152,0,u|0)|0}}while(0);eD(24520,14968)|0;eD(24532,14920)|0;eD(24544,14872)|0;eD(24556,14792)|0;eD(24568,14728)|0;eD(24580,14688)|0;eD(24592,14592)|0;eD(24604,14560)|0;eD(24616,14432)|0;eD(24628,14384)|0;eD(24640,14352)|0;eD(24652,14304)|0;eD(24664,14240)|0;eD(24676,14208)|0;c[6534]=24520;d=c[6534]|0;return d|0}function ku(b){b=b|0;var d=0;if((a[27792]|0)!=0){d=c[6554]|0;return d|0}if((bp(27792)|0)==0){d=c[6554]|0;return d|0}do{if((a[27680]|0)==0){if((bp(27680)|0)==0){break}lC(24976,0,288);a6(176,0,u|0)|0}}while(0);er(24976,1192)|0;er(24988,1160)|0;er(25e3,1128)|0;er(25012,1080)|0;er(25024,1064)|0;er(25036,1032)|0;er(25048,1e3)|0;er(25060,960)|0;er(25072,856)|0;er(25084,816)|0;er(25096,728)|0;er(25108,696)|0;er(25120,672)|0;er(25132,632)|0;er(25144,584)|0;er(25156,544)|0;er(25168,1064)|0;er(25180,528)|0;er(25192,488)|0;er(25204,15216)|0;er(25216,15192)|0;er(25228,15128)|0;er(25240,15088)|0;er(25252,15064)|0;c[6554]=24976;d=c[6554]|0;return d|0}function kv(b){b=b|0;var d=0;if((a[27736]|0)!=0){d=c[6532]|0;return d|0}if((bp(27736)|0)==0){d=c[6532]|0;return d|0}do{if((a[27656]|0)==0){if((bp(27656)|0)==0){break}lC(24232,0,288);a6(126,0,u|0)|0}}while(0);eD(24232,2488)|0;eD(24244,2432)|0;eD(24256,2392)|0;eD(24268,2272)|0;eD(24280,1552)|0;eD(24292,2152)|0;eD(24304,2120)|0;eD(24316,2056)|0;eD(24328,1984)|0;eD(24340,1912)|0;eD(24352,1864)|0;eD(24364,1792)|0;eD(24376,1752)|0;eD(24388,1712)|0;eD(24400,1680)|0;eD(24412,1584)|0;eD(24424,1552)|0;eD(24436,1496)|0;eD(24448,1472)|0;eD(24460,1448)|0;eD(24472,1400)|0;eD(24484,1328)|0;eD(24496,1288)|0;eD(24508,1256)|0;c[6532]=24232;d=c[6532]|0;return d|0}function kw(b){b=b|0;var d=0;if((a[27808]|0)!=0){d=c[6558]|0;return d|0}if((bp(27808)|0)==0){d=c[6558]|0;return d|0}do{if((a[27696]|0)==0){if((bp(27696)|0)==0){break}lC(25432,0,288);a6(124,0,u|0)|0}}while(0);er(25432,2552)|0;er(25444,2536)|0;c[6558]=25432;d=c[6558]|0;return d|0}function kx(b){b=b|0;var d=0;if((a[27752]|0)!=0){d=c[6536]|0;return d|0}if((bp(27752)|0)==0){d=c[6536]|0;return d|0}do{if((a[27672]|0)==0){if((bp(27672)|0)==0){break}lC(24688,0,288);a6(250,0,u|0)|0}}while(0);eD(24688,2680)|0;eD(24700,2600)|0;c[6536]=24688;d=c[6536]|0;return d|0}function ky(b){b=b|0;if((a[27816]|0)!=0){return 26240}if((bp(27816)|0)==0){return 26240}ex(26240,4648,8);a6(266,26240,u|0)|0;return 26240}function kz(b){b=b|0;if((a[27760]|0)!=0){return 26152}if((bp(27760)|0)==0){return 26152}eJ(26152,4552,kZ(4552)|0);a6(198,26152,u|0)|0;return 26152}function kA(b){b=b|0;if((a[27840]|0)!=0){return 26288}if((bp(27840)|0)==0){return 26288}ex(26288,4520,8);a6(266,26288,u|0)|0;return 26288}function kB(b){b=b|0;if((a[27784]|0)!=0){return 26200}if((bp(27784)|0)==0){return 26200}eJ(26200,4448,kZ(4448)|0);a6(198,26200,u|0)|0;return 26200}function kC(b){b=b|0;if((a[27832]|0)!=0){return 26272}if((bp(27832)|0)==0){return 26272}ex(26272,4408,20);a6(266,26272,u|0)|0;return 26272}function kD(b){b=b|0;if((a[27776]|0)!=0){return 26184}if((bp(27776)|0)==0){return 26184}eJ(26184,4272,kZ(4272)|0);a6(198,26184,u|0)|0;return 26184}function kE(b){b=b|0;if((a[27824]|0)!=0){return 26256}if((bp(27824)|0)==0){return 26256}ex(26256,4200,11);a6(266,26256,u|0)|0;return 26256}function kF(b){b=b|0;if((a[27768]|0)!=0){return 26168}if((bp(27768)|0)==0){return 26168}eJ(26168,4120,kZ(4120)|0);a6(198,26168,u|0)|0;return 26168}function kG(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=(c[a>>2]|0)+(c[b+4>>2]|0)|0;a=d;e=c[b>>2]|0;if((e&1|0)==0){f=e;cx[f&511](a);return}else{f=c[(c[d>>2]|0)+(e-1)>>2]|0;cx[f&511](a);return}}function kH(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>2>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[f>>2]|0}k=l+4|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b+16|0;k=b|0;l=c[k>>2]|0;g=i-l>>2;i=g+d|0;if(i>>>0>1073741823){i2(0)}m=h-l|0;do{if(m>>2>>>0>536870910){n=1073741823;o=2713}else{l=m>>1;h=l>>>0<i>>>0?i:l;if((h|0)==0){p=0;q=0;break}l=b+128|0;if(!((a[l]&1)==0&h>>>0<29)){n=h;o=2713;break}a[l]=1;p=j;q=h}}while(0);if((o|0)==2713){p=lq(n<<2)|0;q=n}n=d;d=p+(g<<2)|0;do{if((d|0)==0){r=0}else{c[d>>2]=0;r=d}d=r+4|0;n=n-1|0;}while((n|0)!=0);n=p+(q<<2)|0;q=c[k>>2]|0;r=(c[f>>2]|0)-q|0;o=p+(g-(r>>2)<<2)|0;g=o;p=q;lD(g|0,p|0,r)|0;c[k>>2]=o;c[f>>2]=d;c[e>>2]=n;if((q|0)==0){return}if((q|0)==(j|0)){a[b+128|0]=0;return}else{lu(p);return}}function kI(a){a=a|0;eC(24964);eC(24952);eC(24940);eC(24928);eC(24916);eC(24904);eC(24892);eC(24880);eC(24868);eC(24856);eC(24844);eC(24832);eC(24820);eC(24808);eC(24796);eC(24784);eC(24772);eC(24760);eC(24748);eC(24736);eC(24724);eC(24712);eC(24700);eC(24688);return}function kJ(a){a=a|0;ep(25708);ep(25696);ep(25684);ep(25672);ep(25660);ep(25648);ep(25636);ep(25624);ep(25612);ep(25600);ep(25588);ep(25576);ep(25564);ep(25552);ep(25540);ep(25528);ep(25516);ep(25504);ep(25492);ep(25480);ep(25468);ep(25456);ep(25444);ep(25432);return}function kK(a){a=a|0;eC(24508);eC(24496);eC(24484);eC(24472);eC(24460);eC(24448);eC(24436);eC(24424);eC(24412);eC(24400);eC(24388);eC(24376);eC(24364);eC(24352);eC(24340);eC(24328);eC(24316);eC(24304);eC(24292);eC(24280);eC(24268);eC(24256);eC(24244);eC(24232);return}function kL(a){a=a|0;ep(25252);ep(25240);ep(25228);ep(25216);ep(25204);ep(25192);ep(25180);ep(25168);ep(25156);ep(25144);ep(25132);ep(25120);ep(25108);ep(25096);ep(25084);ep(25072);ep(25060);ep(25048);ep(25036);ep(25024);ep(25012);ep(25e3);ep(24988);ep(24976);return}function kM(a){a=a|0;eC(24676);eC(24664);eC(24652);eC(24640);eC(24628);eC(24616);eC(24604);eC(24592);eC(24580);eC(24568);eC(24556);eC(24544);eC(24532);eC(24520);return}function kN(a){a=a|0;ep(25420);ep(25408);ep(25396);ep(25384);ep(25372);ep(25360);ep(25348);ep(25336);ep(25324);ep(25312);ep(25300);ep(25288);ep(25276);ep(25264);return}function kO(a,b,c){a=a|0;b=b|0;c=c|0;return kP(0,a,b,(c|0)!=0?c:23720)|0}function kP(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;j=((f|0)==0?23712:f)|0;f=c[j>>2]|0;L8:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0|0;i=g;return k|0}else{l=n-194|0;if(l>>>0>50){break L8}o=d+1|0;p=c[s+(l<<2)>>2]|0;q=e-1|0;break}}else{o=d;p=f;q=e}}while(0);L26:do{if((q|0)==0){r=p}else{l=a[o]|0;n=(l&255)>>>3;if((n-16|n+(p>>26))>>>0>7){break L8}else{t=o;u=p;v=q;w=l}while(1){t=t+1|0;u=(w&255)-128|u<<6;v=v-1|0;if((u|0)>=0){break}if((v|0)==0){r=u;break L26}w=a[t]|0;if(((w&255)-128|0)>>>0>63){break L8}}c[j>>2]=0;c[m>>2]=u;k=e-v|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(a4()|0)>>2]=138;k=-1;i=g;return k|0}function kQ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=i;i=i+1032|0;h=g|0;j=g+1024|0;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h|0;L39:do{if((k|0)==0|(m|0)==0){n=0;o=d;p=m;q=e;r=k}else{a=h|0;s=m;t=d;u=0;v=e;w=k;while(1){x=t>>>2;y=x>>>0>=s>>>0;if(!(y|t>>>0>131)){n=u;o=t;p=s;q=v;r=w;break L39}z=y?s:x;A=t-z|0;x=kR(v,j,z,f)|0;if((x|0)==-1){break}if((v|0)==(a|0)){B=a;C=s}else{B=v+(x<<2)|0;C=s-x|0}z=x+u|0;x=c[j>>2]|0;if((x|0)==0|(C|0)==0){n=z;o=A;p=C;q=B;r=x;break L39}else{s=C;t=A;u=z;v=B;w=x}}n=-1;o=A;p=0;q=v;r=c[j>>2]|0}}while(0);L50:do{if((r|0)==0){D=n}else{if((p|0)==0|(o|0)==0){D=n;break}else{E=p;F=o;G=n;H=q;I=r}while(1){J=kP(H,I,F,f)|0;if((J+2|0)>>>0<3){break}A=(c[j>>2]|0)+J|0;c[j>>2]=A;B=E-1|0;C=G+1|0;if((B|0)==0|(F|0)==(J|0)){D=C;break L50}else{E=B;F=F-J|0;G=C;H=H+4|0;I=A}}if((J|0)==0){c[j>>2]=0;D=G;break}else if((J|0)==(-1|0)){D=-1;break}else{c[f>>2]=0;D=G;break}}}while(0);if(!l){i=g;return D|0}c[b>>2]=c[j>>2];i=g;return D|0}function kR(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;h=c[e>>2]|0;do{if((g|0)==0){i=57}else{j=g|0;k=c[j>>2]|0;if((k|0)==0){i=57;break}if((b|0)==0){l=k;m=h;n=f;i=68;break}c[j>>2]=0;o=k;p=h;q=b;r=f;i=88}}while(0);if((i|0)==57){if((b|0)==0){t=h;u=f;i=59}else{v=h;w=b;x=f;i=58}}L71:while(1){if((i|0)==58){i=0;if((x|0)==0){y=f;i=107;break}else{z=x;A=w;B=v}while(1){h=a[B]|0;do{if(((h&255)-1|0)>>>0<127){if((B&3|0)==0&z>>>0>3){C=z;D=A;E=B}else{F=B;G=A;H=z;I=h;break}while(1){J=c[E>>2]|0;if(((J-16843009|J)&-2139062144|0)!=0){i=82;break}c[D>>2]=J&255;c[D+4>>2]=d[E+1|0]|0;c[D+8>>2]=d[E+2|0]|0;K=E+4|0;L=D+16|0;c[D+12>>2]=d[E+3|0]|0;M=C-4|0;if(M>>>0>3){C=M;D=L;E=K}else{i=83;break}}if((i|0)==82){i=0;F=E;G=D;H=C;I=J&255;break}else if((i|0)==83){i=0;F=K;G=L;H=M;I=a[K]|0;break}}else{F=B;G=A;H=z;I=h}}while(0);N=I&255;if((N-1|0)>>>0>=127){break}c[G>>2]=N;h=H-1|0;if((h|0)==0){y=f;i=106;break L71}else{z=h;A=G+4|0;B=F+1|0}}h=N-194|0;if(h>>>0>50){O=H;P=G;Q=F;i=99;break}o=c[s+(h<<2)>>2]|0;p=F+1|0;q=G;r=H;i=88;continue}else if((i|0)==59){i=0;h=a[t]|0;do{if(((h&255)-1|0)>>>0<127){if((t&3|0)!=0){R=t;S=u;T=h;break}g=c[t>>2]|0;if(((g-16843009|g)&-2139062144|0)==0){U=u;V=t}else{R=t;S=u;T=g&255;break}do{V=V+4|0;U=U-4|0;W=c[V>>2]|0;}while(((W-16843009|W)&-2139062144|0)==0);R=V;S=U;T=W&255}else{R=t;S=u;T=h}}while(0);h=T&255;if((h-1|0)>>>0<127){t=R+1|0;u=S-1|0;i=59;continue}g=h-194|0;if(g>>>0>50){O=S;P=b;Q=R;i=99;break}l=c[s+(g<<2)>>2]|0;m=R+1|0;n=S;i=68;continue}else if((i|0)==68){i=0;g=(d[m]|0)>>>3;if((g-16|g+(l>>26))>>>0>7){i=69;break}g=m+1|0;do{if((l&33554432|0)==0){X=g}else{if(((d[g]|0)-128|0)>>>0>63){i=72;break L71}h=m+2|0;if((l&524288|0)==0){X=h;break}if(((d[h]|0)-128|0)>>>0>63){i=75;break L71}X=m+3|0}}while(0);t=X;u=n-1|0;i=59;continue}else if((i|0)==88){i=0;g=d[p]|0;h=g>>>3;if((h-16|h+(o>>26))>>>0>7){i=89;break}h=p+1|0;Y=g-128|o<<6;do{if((Y|0)<0){g=(d[h]|0)-128|0;if(g>>>0>63){i=92;break L71}k=p+2|0;Z=g|Y<<6;if((Z|0)>=0){_=Z;$=k;break}g=(d[k]|0)-128|0;if(g>>>0>63){i=95;break L71}_=g|Z<<6;$=p+3|0}else{_=Y;$=h}}while(0);c[q>>2]=_;v=$;w=q+4|0;x=r-1|0;i=58;continue}}if((i|0)==75){aa=l;ab=m-1|0;ac=b;ad=n;i=98}else if((i|0)==69){aa=l;ab=m-1|0;ac=b;ad=n;i=98}else if((i|0)==72){aa=l;ab=m-1|0;ac=b;ad=n;i=98}else if((i|0)==89){aa=o;ab=p-1|0;ac=q;ad=r;i=98}else if((i|0)==92){aa=Y;ab=p-1|0;ac=q;ad=r;i=98}else if((i|0)==95){aa=Z;ab=p-1|0;ac=q;ad=r;i=98}else if((i|0)==106){return y|0}else if((i|0)==107){return y|0}if((i|0)==98){if((aa|0)==0){O=ad;P=ac;Q=ab;i=99}else{ae=ac;af=ab}}do{if((i|0)==99){if((a[Q]|0)!=0){ae=P;af=Q;break}if((P|0)!=0){c[P>>2]=0;c[e>>2]=0}y=f-O|0;return y|0}}while(0);c[(a4()|0)>>2]=138;if((ae|0)==0){y=-1;return y|0}c[e>>2]=af;y=-1;return y|0}function kS(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m-194|0;if(k>>>0>50){break}m=e+1|0;n=c[s+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>(((f*6|0)-6|0)>>>0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m-16|m+(n>>26))>>>0>7){break}m=k-128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)-128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)-128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(a4()|0)>>2]=138;j=-1;i=g;return j|0}function kT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((b|0)==0){f=1;return f|0}if(d>>>0<128){a[b]=d&255;f=1;return f|0}if(d>>>0<2048){a[b]=(d>>>6|192)&255;a[b+1|0]=(d&63|128)&255;f=2;return f|0}if(d>>>0<55296|(d-57344|0)>>>0<8192){a[b]=(d>>>12|224)&255;a[b+1|0]=(d>>>6&63|128)&255;a[b+2|0]=(d&63|128)&255;f=3;return f|0}if((d-65536|0)>>>0<1048576){a[b]=(d>>>18|240)&255;a[b+1|0]=(d>>>12&63|128)&255;a[b+2|0]=(d>>>6&63|128)&255;a[b+3|0]=(d&63|128)&255;f=4;return f|0}else{c[(a4()|0)>>2]=138;f=-1;return f|0}return 0}function kU(a){a=a|0;return}function kV(a){a=a|0;return}function kW(a){a=a|0;return 3824|0}function kX(a){a=a|0;return}function kY(a){a=a|0;return}function kZ(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function k_(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if((d|0)==0){return a|0}else{e=b;f=d;g=a}while(1){d=f-1|0;c[g>>2]=c[e>>2];if((d|0)==0){break}else{e=e+4|0;f=d;g=g+4|0}}return a|0}function k$(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}else{f=d}do{f=f-1|0;c[a+(f<<2)>>2]=c[b+(f<<2)>>2];}while((f|0)!=0);return a|0}else{if(e){return a|0}else{g=b;h=d;i=a}while(1){d=h-1|0;c[i>>2]=c[g>>2];if((d|0)==0){break}else{g=g+4|0;h=d;i=i+4|0}}return a|0}return 0}function k0(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((d|0)==0){return a|0}else{e=d;f=a}while(1){d=e-1|0;c[f>>2]=b;if((d|0)==0){break}else{e=d;f=f+4|0}}return a|0}function k1(a){a=a|0;c[a>>2]=15992;return}function k2(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function k3(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+264|0;g=f|0;h=f+256|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g|0;L244:do{if((j|0)==0|(l|0)==0){m=0;n=d;o=l;p=e;q=j}else{a=g|0;r=l;s=d;t=0;u=e;v=j;while(1){w=s>>>0>=r>>>0;if(!(w|s>>>0>32)){m=t;n=s;o=r;p=u;q=v;break L244}x=w?r:s;y=s-x|0;w=k4(u,h,x,0)|0;if((w|0)==-1){break}if((u|0)==(a|0)){z=a;A=r}else{z=u+w|0;A=r-w|0}x=w+t|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){m=x;n=y;o=A;p=z;q=w;break L244}else{r=A;s=y;t=x;u=z;v=w}}m=-1;n=y;o=0;p=u;q=c[h>>2]|0}}while(0);L255:do{if((q|0)==0){B=m}else{if((o|0)==0|(n|0)==0){B=m;break}else{C=o;D=n;E=m;F=p;G=q}while(1){H=kT(F,c[G>>2]|0,0)|0;if((H+1|0)>>>0<2){break}y=(c[h>>2]|0)+4|0;c[h>>2]=y;z=D-1|0;A=E+1|0;if((C|0)==(H|0)|(z|0)==0){B=A;break L255}else{C=C-H|0;D=z;E=A;F=F+H|0;G=y}}if((H|0)!=0){B=-1;break}c[h>>2]=0;B=E}}while(0);if(!k){i=f;return B|0}c[b>>2]=c[h>>2];i=f;return B|0}function k4(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;if((b|0)==0){h=c[d>>2]|0;j=g|0;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=h;o=k}while(1){if(o>>>0>127){k=kT(j,o,0)|0;if((k|0)==-1){l=-1;p=241;break}else{q=k}}else{q=1}k=q+m|0;h=n+4|0;r=c[h>>2]|0;if((r|0)==0){l=k;p=242;break}else{m=k;n=h;o=r}}if((p|0)==241){i=f;return l|0}else if((p|0)==242){i=f;return l|0}}L281:do{if(e>>>0>3){o=e;n=b;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break L281}if(q>>>0>127){j=kT(n,q,0)|0;if((j|0)==-1){l=-1;break}u=n+j|0;v=o-j|0;w=m}else{a[n]=q&255;u=n+1|0;v=o-1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=v;n=u;m=q}else{s=v;t=u;break L281}}i=f;return l|0}else{s=e;t=b}}while(0);L293:do{if((s|0)==0){x=0}else{b=g|0;u=s;v=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=237;break}if(m>>>0>127){n=kT(b,m,0)|0;if((n|0)==-1){l=-1;p=244;break}if(n>>>0>u>>>0){p=233;break}o=c[w>>2]|0;kT(v,o,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m&255;y=v+1|0;z=u-1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break L293}else{u=z;v=y;w=m}}if((p|0)==233){l=e-u|0;i=f;return l|0}else if((p|0)==237){a[v]=0;x=u;break}else if((p|0)==244){i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function k5(a){a=a|0;lu(a);return}function k6(a){a=a|0;kU(a|0);return}function k7(a){a=a|0;kU(a|0);lu(a);return}function k8(a){a=a|0;kU(a|0);lu(a);return}function k9(a){a=a|0;kU(a|0);lu(a);return}function la(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=ld(b,23568,23552,-1)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}lC(f|0,0,56);c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;cM[c[(c[h>>2]|0)+28>>2]&31](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function lb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;cM[c[(c[g>>2]|0)+28>>2]&31](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function lc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==(c[d+8>>2]|0)){g=d+16|0;h=c[g>>2]|0;if((h|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}h=d+24|0;if((c[h>>2]|0)!=2){return}c[h>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)==0){k=j}else{k=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;cM[c[(c[j>>2]|0)+28>>2]&31](j,d,e+k|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;k=b+24|0;while(1){b=c[k+4>>2]|0;j=b>>8;if((b&1|0)==0){l=j}else{l=c[(c[i>>2]|0)+j>>2]|0}j=c[k>>2]|0;cM[c[(c[j>>2]|0)+28>>2]&31](j,d,e+l|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){m=294;break}b=k+8|0;if(b>>>0<g>>>0){k=b}else{m=293;break}}if((m|0)==293){return}else if((m|0)==294){return}}function ld(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;lC(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;cK[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}cv[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;if((j|0)==0){if((c[n>>2]|0)!=1){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}o=(c[m>>2]|0)==1?c[b>>2]|0:0;i=f;return o|0}else if((j|0)==1){do{if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;i=f;return o|0}if((c[l>>2]|0)!=1){o=0;i=f;return o|0}if((c[m>>2]|0)==1){break}else{o=0}i=f;return o|0}}while(0);o=c[e>>2]|0;i=f;return o|0}else{o=0;i=f;return o|0}return 0}function le(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function lf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function lg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=c[b+12>>2]|0;k=b+16+(j<<3)|0;L475:do{if((j|0)>0){l=d+52|0;m=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;q=e;r=0;s=b+16|0;t=0;L477:while(1){a[l]=0;a[m]=0;u=c[s+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[q>>2]|0)+v>>2]|0}v=c[s>>2]|0;cK[c[(c[v>>2]|0)+20>>2]&63](v,d,e,e+w|0,2-(u>>>1&1)|0,g);if((a[n]&1)!=0){x=t;y=r;break}do{if((a[m]&1)==0){z=t;A=r}else{if((a[l]&1)==0){if((c[o>>2]&1|0)==0){x=1;y=r;break L477}else{z=1;A=r;break}}if((c[p>>2]|0)==1){B=386;break L475}if((c[o>>2]&2|0)==0){B=386;break L475}else{z=1;A=1}}}while(0);u=s+8|0;if(u>>>0<k>>>0){r=A;s=u;t=z}else{x=z;y=A;break}}if(y){C=x;B=385}else{D=x;B=382}}else{D=0;B=382}}while(0);do{if((B|0)==382){c[h>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)!=1){C=D;B=385;break}if((c[d+24>>2]|0)!=2){C=D;B=385;break}a[d+54|0]=1;if(D){B=386}else{B=387}}}while(0);if((B|0)==385){if(C){B=386}else{B=387}}if((B|0)==386){c[i>>2]=3;return}else if((B|0)==387){c[i>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}C=c[b+12>>2]|0;D=b+16+(C<<3)|0;x=c[b+20>>2]|0;y=x>>8;if((x&1|0)==0){E=y}else{E=c[(c[e>>2]|0)+y>>2]|0}y=c[b+16>>2]|0;cv[c[(c[y>>2]|0)+24>>2]&7](y,d,e+E|0,(x&2|0)!=0?f:2,g);x=b+24|0;if((C|0)<=1){return}C=c[b+8>>2]|0;do{if((C&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((C&1|0)==0){E=d+54|0;y=e;A=x;while(1){if((a[E]&1)!=0){B=414;break}if((c[b>>2]|0)==1){B=415;break}z=c[A+4>>2]|0;w=z>>8;if((z&1|0)==0){F=w}else{F=c[(c[y>>2]|0)+w>>2]|0}w=c[A>>2]|0;cv[c[(c[w>>2]|0)+24>>2]&7](w,d,e+F|0,(z&2|0)!=0?f:2,g);z=A+8|0;if(z>>>0<D>>>0){A=z}else{B=416;break}}if((B|0)==414){return}else if((B|0)==415){return}else if((B|0)==416){return}}A=d+24|0;y=d+54|0;E=e;i=x;while(1){if((a[y]&1)!=0){B=424;break}if((c[b>>2]|0)==1){if((c[A>>2]|0)==1){B=421;break}}z=c[i+4>>2]|0;w=z>>8;if((z&1|0)==0){G=w}else{G=c[(c[E>>2]|0)+w>>2]|0}w=c[i>>2]|0;cv[c[(c[w>>2]|0)+24>>2]&7](w,d,e+G|0,(z&2|0)!=0?f:2,g);z=i+8|0;if(z>>>0<D>>>0){i=z}else{B=413;break}}if((B|0)==413){return}else if((B|0)==421){return}else if((B|0)==424){return}}}while(0);G=d+54|0;F=e;C=x;while(1){if((a[G]&1)!=0){B=422;break}x=c[C+4>>2]|0;i=x>>8;if((x&1|0)==0){H=i}else{H=c[(c[F>>2]|0)+i>>2]|0}i=c[C>>2]|0;cv[c[(c[i>>2]|0)+24>>2]&7](i,d,e+H|0,(x&2|0)!=0?f:2,g);x=C+8|0;if(x>>>0<D>>>0){C=x}else{B=423;break}}if((B|0)==422){return}else if((B|0)==423){return}}function lh(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;cv[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;cK[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=442}else{if((a[j]&1)==0){m=1;n=442}}L577:do{if((n|0)==442){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=445;break}a[d+54|0]=1;if(m){break L577}}else{n=445}}while(0);if((n|0)==445){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function li(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((b|0)!=(c[d+8>>2]|0)){i=d+52|0;j=a[i]&1;k=d+53|0;l=a[k]&1;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i]=0;a[k]=0;o=c[b+20>>2]|0;p=o>>8;if((o&1|0)==0){q=p}else{q=c[(c[f>>2]|0)+p>>2]|0}p=c[b+16>>2]|0;cK[c[(c[p>>2]|0)+20>>2]&63](p,d,e,f+q|0,(o&2|0)!=0?g:2,h);L599:do{if((m|0)>1){o=d+24|0;q=b+8|0;p=d+54|0;r=f;s=b+24|0;do{if((a[p]&1)!=0){break L599}do{if((a[i]&1)==0){if((a[k]&1)==0){break}if((c[q>>2]&1|0)==0){break L599}}else{if((c[o>>2]|0)==1){break L599}if((c[q>>2]&2|0)==0){break L599}}}while(0);a[i]=0;a[k]=0;t=c[s+4>>2]|0;u=t>>8;if((t&1|0)==0){v=u}else{v=c[(c[r>>2]|0)+u>>2]|0}u=c[s>>2]|0;cK[c[(c[u>>2]|0)+20>>2]&63](u,d,e,f+v|0,(t&2|0)!=0?g:2,h);s=s+8|0;}while(s>>>0<n>>>0)}}while(0);a[i]=j;a[k]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;l=c[f>>2]|0;if((l|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((l|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;l=c[e>>2]|0;if((l|0)==2){c[e>>2]=g;w=g}else{w=l}if(!((c[d+48>>2]|0)==1&(w|0)==1)){return}a[d+54|0]=1;return}function lj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;cK[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function lk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[5940]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=23800+(h<<2)|0;j=23800+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[5940]=e&~(1<<g)}else{if(l>>>0<(c[5944]|0)>>>0){b7();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{b7();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[5942]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=23800+(p<<2)|0;m=23800+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[5940]=e&~(1<<r)}else{if(l>>>0<(c[5944]|0)>>>0){b7();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{b7();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[5942]|0;if((l|0)!=0){q=c[5945]|0;d=l>>>3;l=d<<1;f=23800+(l<<2)|0;k=c[5940]|0;h=1<<d;do{if((k&h|0)==0){c[5940]=k|h;s=f;t=23800+(l+2<<2)|0}else{d=23800+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[5944]|0)>>>0){s=g;t=d;break}b7();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[5942]=m;c[5945]=e;n=i;return n|0}l=c[5941]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[24064+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[5944]|0;if(r>>>0<i>>>0){b7();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){b7();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){b7();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){b7();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){b7();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{b7();return 0}}}while(0);L741:do{if((e|0)!=0){f=d+28|0;i=24064+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[5941]=c[5941]&~(1<<c[f>>2]);break L741}else{if(e>>>0<(c[5944]|0)>>>0){b7();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L741}}}while(0);if(v>>>0<(c[5944]|0)>>>0){b7();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[5942]|0;if((f|0)!=0){e=c[5945]|0;i=f>>>3;f=i<<1;q=23800+(f<<2)|0;k=c[5940]|0;g=1<<i;do{if((k&g|0)==0){c[5940]=k|g;y=q;z=23800+(f+2<<2)|0}else{i=23800+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[5944]|0)>>>0){y=l;z=i;break}b7();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[5942]=p;c[5945]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[5941]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[24064+(A<<2)>>2]|0;L789:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L789}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[24064+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[5942]|0)-g|0)>>>0){o=g;break}q=K;m=c[5944]|0;if(q>>>0<m>>>0){b7();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){b7();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){b7();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){b7();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){b7();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{b7();return 0}}}while(0);L839:do{if((e|0)!=0){i=K+28|0;m=24064+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[5941]=c[5941]&~(1<<c[i>>2]);break L839}else{if(e>>>0<(c[5944]|0)>>>0){b7();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L839}}}while(0);if(L>>>0<(c[5944]|0)>>>0){b7();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=23800+(e<<2)|0;r=c[5940]|0;j=1<<i;do{if((r&j|0)==0){c[5940]=r|j;O=m;P=23800+(e+2<<2)|0}else{i=23800+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[5944]|0)>>>0){O=d;P=i;break}b7();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=24064+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[5941]|0;l=1<<Q;if((m&l|0)==0){c[5941]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=662;break}else{l=l<<1;m=j}}if((T|0)==662){if(S>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[5944]|0;if(m>>>0<i>>>0){b7();return 0}if(j>>>0<i>>>0){b7();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[5942]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[5945]|0;if(S>>>0>15){R=J;c[5945]=R+o;c[5942]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[5942]=0;c[5945]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[5943]|0;if(o>>>0<J>>>0){S=J-o|0;c[5943]=S;J=c[5946]|0;K=J;c[5946]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[5922]|0)==0){J=b4(8)|0;if((J-1&J|0)==0){c[5924]=J;c[5923]=J;c[5925]=-1;c[5926]=2097152;c[5927]=0;c[6051]=0;c[5922]=(cu(0)|0)&-16^1431655768;break}else{b7();return 0}}}while(0);J=o+48|0;S=c[5924]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[6050]|0;do{if((O|0)!=0){P=c[6048]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L931:do{if((c[6051]&4|0)==0){O=c[5946]|0;L933:do{if((O|0)==0){T=692}else{L=O;P=24208;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=692;break L933}else{P=M}}if((P|0)==0){T=692;break}L=R-(c[5943]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bV(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=701}}while(0);do{if((T|0)==692){O=bV(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[5923]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[6048]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[6050]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bV($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=701}}while(0);L953:do{if((T|0)==701){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=712;break L931}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[5924]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bV(O|0)|0)==-1){bV(m|0)|0;W=Y;break L953}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=712;break L931}}}while(0);c[6051]=c[6051]|4;ad=W;T=709}else{ad=0;T=709}}while(0);do{if((T|0)==709){if(S>>>0>=2147483647){break}W=bV(S|0)|0;Z=bV(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=712}}}while(0);do{if((T|0)==712){ad=(c[6048]|0)+aa|0;c[6048]=ad;if(ad>>>0>(c[6049]|0)>>>0){c[6049]=ad}ad=c[5946]|0;L973:do{if((ad|0)==0){S=c[5944]|0;if((S|0)==0|ab>>>0<S>>>0){c[5944]=ab}c[6052]=ab;c[6053]=aa;c[6055]=0;c[5949]=c[5922];c[5948]=-1;S=0;do{Y=S<<1;ac=23800+(Y<<2)|0;c[23800+(Y+3<<2)>>2]=ac;c[23800+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[5946]=ab+ae;c[5943]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[5947]=c[5926]}else{S=24208;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=724;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==724){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[5946]|0;Y=(c[5943]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[5946]=Z+ai;c[5943]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[5947]=c[5926];break L973}}while(0);if(ab>>>0<(c[5944]|0)>>>0){c[5944]=ab}S=ab+aa|0;Y=24208;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=734;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==734){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[5946]|0)){J=(c[5943]|0)+K|0;c[5943]=J;c[5946]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[5945]|0)){J=(c[5942]|0)+K|0;c[5942]=J;c[5945]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1018:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=23800+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[5944]|0)>>>0){b7();return 0}if((c[U+12>>2]|0)==(Z|0)){break}b7();return 0}}while(0);if((Q|0)==(U|0)){c[5940]=c[5940]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[5944]|0)>>>0){b7();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}b7();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[5944]|0)>>>0){b7();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){b7();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{b7();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=24064+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[5941]=c[5941]&~(1<<c[P>>2]);break L1018}else{if(m>>>0<(c[5944]|0)>>>0){b7();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L1018}}}while(0);if(an>>>0<(c[5944]|0)>>>0){b7();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=23800+(V<<2)|0;P=c[5940]|0;m=1<<J;do{if((P&m|0)==0){c[5940]=P|m;as=X;at=23800+(V+2<<2)|0}else{J=23800+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[5944]|0)>>>0){as=U;at=J;break}b7();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=24064+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[5941]|0;Q=1<<au;if((X&Q|0)==0){c[5941]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=807;break}else{Q=Q<<1;X=m}}if((T|0)==807){if(aw>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[5944]|0;if(X>>>0<$>>>0){b7();return 0}if(m>>>0<$>>>0){b7();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=24208;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[5946]=ab+aB;c[5943]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[5947]=c[5926];c[ac+4>>2]=27;c[W>>2]=c[6052];c[W+4>>2]=c[24212>>2];c[W+8>>2]=c[24216>>2];c[W+12>>2]=c[24220>>2];c[6052]=ab;c[6053]=aa;c[6055]=0;c[6054]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=23800+(K<<2)|0;S=c[5940]|0;m=1<<W;do{if((S&m|0)==0){c[5940]=S|m;aC=Z;aD=23800+(K+2<<2)|0}else{W=23800+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[5944]|0)>>>0){aC=Q;aD=W;break}b7();return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=24064+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[5941]|0;Q=1<<aE;if((Z&Q|0)==0){c[5941]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=842;break}else{Q=Q<<1;Z=m}}if((T|0)==842){if(aG>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[5944]|0;if(Z>>>0<m>>>0){b7();return 0}if(_>>>0<m>>>0){b7();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[5943]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[5943]=_;ad=c[5946]|0;Q=ad;c[5946]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(a4()|0)>>2]=12;n=0;return n|0}function ll(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[5944]|0;if(b>>>0<e>>>0){b7()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){b7()}h=f&-8;i=a+(h-8)|0;j=i;L1190:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){b7()}if((n|0)==(c[5945]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[5942]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=23800+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){b7()}if((c[k+12>>2]|0)==(n|0)){break}b7()}}while(0);if((s|0)==(k|0)){c[5940]=c[5940]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){b7()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}b7()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){b7()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){b7()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){b7()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{b7()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=24064+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[5941]=c[5941]&~(1<<c[v>>2]);q=n;r=o;break L1190}else{if(p>>>0<(c[5944]|0)>>>0){b7()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1190}}}while(0);if(A>>>0<(c[5944]|0)>>>0){b7()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[5944]|0)>>>0){b7()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[5944]|0)>>>0){b7()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){b7()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){b7()}do{if((e&2|0)==0){if((j|0)==(c[5946]|0)){B=(c[5943]|0)+r|0;c[5943]=B;c[5946]=q;c[q+4>>2]=B|1;if((q|0)==(c[5945]|0)){c[5945]=0;c[5942]=0}if(B>>>0<=(c[5947]|0)>>>0){return}ln(0)|0;return}if((j|0)==(c[5945]|0)){B=(c[5942]|0)+r|0;c[5942]=B;c[5945]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1296:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=23800+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[5944]|0)>>>0){b7()}if((c[u+12>>2]|0)==(j|0)){break}b7()}}while(0);if((g|0)==(u|0)){c[5940]=c[5940]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[5944]|0)>>>0){b7()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}b7()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[5944]|0)>>>0){b7()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[5944]|0)>>>0){b7()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){b7()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{b7()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=24064+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[5941]=c[5941]&~(1<<c[t>>2]);break L1296}else{if(f>>>0<(c[5944]|0)>>>0){b7()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1296}}}while(0);if(E>>>0<(c[5944]|0)>>>0){b7()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[5944]|0)>>>0){b7()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[5944]|0)>>>0){b7()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[5945]|0)){H=B;break}c[5942]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=23800+(d<<2)|0;A=c[5940]|0;E=1<<r;do{if((A&E|0)==0){c[5940]=A|E;I=e;J=23800+(d+2<<2)|0}else{r=23800+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[5944]|0)>>>0){I=h;J=r;break}b7()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=24064+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[5941]|0;d=1<<K;do{if((r&d|0)==0){c[5941]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1021;break}else{A=A<<1;J=E}}if((N|0)==1021){if(M>>>0<(c[5944]|0)>>>0){b7()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[5944]|0;if(J>>>0<E>>>0){b7()}if(B>>>0<E>>>0){b7()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[5948]|0)-1|0;c[5948]=q;if((q|0)==0){O=24216}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[5948]=-1;return}function lm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=lk(b)|0;return d|0}if(b>>>0>4294967231){c[(a4()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=lo(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=lk(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;lD(f|0,a|0,e)|0;ll(a);d=f;return d|0}function ln(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[5922]|0)==0){b=b4(8)|0;if((b-1&b|0)==0){c[5924]=b;c[5923]=b;c[5925]=-1;c[5926]=2097152;c[5927]=0;c[6051]=0;c[5922]=(cu(0)|0)&-16^1431655768;break}else{b7();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[5946]|0;if((b|0)==0){d=0;return d|0}e=c[5943]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[5924]|0;g=ag((((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0,f)|0;h=b;i=24208;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bV(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bV(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bV(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[6048]=(c[6048]|0)-j;h=c[5946]|0;m=(c[5943]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[5946]=j+o;c[5943]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[5947]=c[5926];d=(i|0)!=(l|0)|0;return d|0}}while(0);if((c[5943]|0)>>>0<=(c[5947]|0)>>>0){d=0;return d|0}c[5947]=-1;d=0;return d|0}function lo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[5944]|0;if(g>>>0<j>>>0){b7();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){b7();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){b7();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[5924]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;lp(g+b|0,k);n=a;return n|0}if((i|0)==(c[5946]|0)){k=(c[5943]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[5946]=g+b;c[5943]=l;n=a;return n|0}if((i|0)==(c[5945]|0)){l=(c[5942]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[5942]=q;c[5945]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L1516:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=23800+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){b7();return 0}if((c[l+12>>2]|0)==(i|0)){break}b7();return 0}}while(0);if((k|0)==(l|0)){c[5940]=c[5940]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){b7();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}b7();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){b7();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){b7();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){b7();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{b7();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=24064+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[5941]=c[5941]&~(1<<c[t>>2]);break L1516}else{if(s>>>0<(c[5944]|0)>>>0){b7();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L1516}}}while(0);if(y>>>0<(c[5944]|0)>>>0){b7();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[5944]|0)>>>0){b7();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;lp(g+b|0,q);n=a;return n|0}return 0}function lp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L1592:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[5944]|0;if(i>>>0<l>>>0){b7()}if((j|0)==(c[5945]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[5942]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=23800+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){b7()}if((c[p+12>>2]|0)==(j|0)){break}b7()}}while(0);if((q|0)==(p|0)){c[5940]=c[5940]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){b7()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}b7()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){b7()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){b7()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){b7()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{b7()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=24064+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[5941]=c[5941]&~(1<<c[t>>2]);n=j;o=k;break L1592}else{if(m>>>0<(c[5944]|0)>>>0){b7()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L1592}}}while(0);if(y>>>0<(c[5944]|0)>>>0){b7()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[5944]|0)>>>0){b7()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[5944]|0)>>>0){b7()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[5944]|0;if(e>>>0<a>>>0){b7()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[5946]|0)){A=(c[5943]|0)+o|0;c[5943]=A;c[5946]=n;c[n+4>>2]=A|1;if((n|0)!=(c[5945]|0)){return}c[5945]=0;c[5942]=0;return}if((f|0)==(c[5945]|0)){A=(c[5942]|0)+o|0;c[5942]=A;c[5945]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L1691:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=23800+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){b7()}if((c[g+12>>2]|0)==(f|0)){break}b7()}}while(0);if((t|0)==(g|0)){c[5940]=c[5940]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){b7()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}b7()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){b7()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){b7()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){b7()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{b7()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=24064+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[5941]=c[5941]&~(1<<c[l>>2]);break L1691}else{if(m>>>0<(c[5944]|0)>>>0){b7()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L1691}}}while(0);if(C>>>0<(c[5944]|0)>>>0){b7()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[5944]|0)>>>0){b7()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[5944]|0)>>>0){b7()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[5945]|0)){F=A;break}c[5942]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=23800+(z<<2)|0;C=c[5940]|0;b=1<<o;do{if((C&b|0)==0){c[5940]=C|b;G=y;H=23800+(z+2<<2)|0}else{o=23800+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[5944]|0)>>>0){G=d;H=o;break}b7()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=24064+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[5941]|0;z=1<<I;if((o&z|0)==0){c[5941]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=1327;break}else{I=I<<1;J=G}}if((L|0)==1327){if(K>>>0<(c[5944]|0)>>>0){b7()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[5944]|0;if(J>>>0<I>>>0){b7()}if(L>>>0<I>>>0){b7()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function lq(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=lk(b)|0;if((d|0)!=0){e=1371;break}a=(I=c[6908]|0,c[6908]=I+0,I);if((a|0)==0){break}cG[a&3]()}if((e|0)==1371){return d|0}d=cj(4)|0;c[d>>2]=15960;bA(d|0,21992,30);return 0}function lr(a){a=a|0;return lq(a)|0}function ls(a){a=a|0;return}function lt(a){a=a|0;return 4392|0}function lu(a){a=a|0;if((a|0)==0){return}ll(a);return}function lv(a){a=a|0;lu(a);return}function lw(a){a=a|0;lu(a);return}function lx(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((aQ(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==43){i=f;j=0}else if((g<<24>>24|0)==45){i=f;j=1}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=1401}else{if((e|0)>0){v=0.0;w=e;x=l;y=1401}else{z=0.0;A=0.0}}if((y|0)==1401){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10|0)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(a4()|0)>>2]=34;N=1.0;O=416;P=511;y=1418}else{if((m|0)==0){Q=1.0}else{N=1.0;O=416;P=m;y=1418}}if((y|0)==1418){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=1418}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}
function ly(a,b,c){a=a|0;b=b|0;c=c|0;return+(+lx(a,b))}function lz(){var a=0;a=cj(4)|0;c[a>>2]=15960;bA(a|0,21992,30)}function lA(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function lB(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function lC(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function lD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function lE(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{lD(b,c,d)|0}}function lF(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function lG(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function lH(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function lI(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function lJ(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function lK(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function lL(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function lM(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c)|0;f=a>>>16;a=(e>>>16)+(ag(d,f)|0)|0;d=b>>>16;b=ag(d,c)|0;return(K=(a>>>16)+(ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function lN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=lG(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=lG((lS(i,b,lG(g^c,h^d,g,h)|0,K,0)|0)^a,K^e,a,e)|0;return(K=K,f)|0}function lO(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=lG(h^a,j^b,h,j)|0;b=K;a=lG(k^d,l^e,k,l)|0;lS(m,b,a,K,g)|0;a=lG(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,a)|0}function lP(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=lM(e,a)|0;f=K;return(K=(ag(b,a)|0)+(ag(d,e)|0)+f|f&0,c|0|0)|0}function lQ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=lS(a,b,c,d,0)|0;return(K=K,e)|0}function lR(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;lS(a,b,d,e,g)|0;i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function lS(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((lL(l|0)|0)>>>0);return(K=n,o)|0}p=(lK(l|0)|0)-(lK(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(lK(l|0)|0)-(lK(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(lK(j|0)|0)+33-(lK(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(K=n,o)|0}else{p=lL(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=lF(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;lG(e,k,j,a)|0;b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=lG(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(J|0)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function lT(){ck()}function lU(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;cv[a&7](b|0,c|0,d|0,e|0,f|0)}function lV(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;cw[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function lW(a,b){a=a|0;b=b|0;cx[a&511](b|0)}function lX(a,b,c){a=a|0;b=b|0;c=c|0;cy[a&127](b|0,c|0)}function lY(a,b,c){a=a|0;b=b|0;c=c|0;return cz[a&63](b|0,c|0)|0}function lZ(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return cA[a&31](b|0,c|0,d|0,e|0,f|0)|0}function l_(a,b){a=a|0;b=b|0;return cB[a&255](b|0)|0}function l$(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cC[a&63](b|0,c|0,d|0)|0}function l0(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;cD[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function l1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;cE[a&7](b|0,c|0,d|0)}function l2(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;cF[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function l3(a){a=a|0;cG[a&3]()}function l4(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return cH[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function l5(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;cI[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function l6(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;cJ[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function l7(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;cK[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function l8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return cL[a&15](b|0,c|0,d|0,e|0)|0}function l9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;cM[a&31](b|0,c|0,d|0,e|0)}function ma(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0)}function mb(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(1)}function mc(a){a=a|0;ah(2)}function md(a,b){a=a|0;b=b|0;ah(3)}function me(a,b){a=a|0;b=b|0;ah(4);return 0}function mf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(5);return 0}function mg(a){a=a|0;ah(6);return 0}function mh(a,b,c){a=a|0;b=b|0;c=c|0;ah(7);return 0}function mi(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(8)}function mj(a,b,c){a=a|0;b=b|0;c=c|0;ah(9)}function mk(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(10)}function ml(){ah(11)}function mm(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(12);return 0}function mn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(13)}function mo(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(14)}function mp(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(15)}function mq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(16);return 0}function mr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17)}
// EMSCRIPTEN_END_FUNCS
var cv=[ma,ma,lh,ma,le,ma,lg,ma];var cw=[mb,mb,hh,mb,hq,mb,ht,mb,iV,mb,g4,mb,g2,mb,iO,mb,hc,mb,hg,mb,hu,mb,gQ,mb,gK,mb,hf,mb,gz,mb,hr,mb,gO,mb,gB,mb,gw,mb,gx,mb,gq,mb,gA,mb,gu,mb,gs,mb,gG,mb,gF,mb,gD,mb,hv,mb,gd,mb,hd,mb,gh,mb,f9,mb,gb,mb,gf,mb,f6,mb,gn,mb,gm,mb,gj,mb,f3,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb,mb];var cx=[mc,mc,iY,mc,fY,mc,gY,mc,eh,mc,e8,mc,jf,mc,dY,mc,hF,mc,gH,mc,d6,mc,eg,mc,go,mc,fS,mc,fO,mc,ls,mc,dp,mc,d7,mc,jq,mc,jt,mc,hp,mc,gp,mc,k1,mc,fI,mc,iT,mc,jr,mc,dr,mc,fn,mc,fZ,mc,ib,mc,jm,mc,kj,mc,jv,mc,kX,mc,ki,mc,fM,mc,dM,mc,eg,mc,fW,mc,h0,mc,kl,mc,js,mc,ll,mc,iM,mc,kh,mc,fA,mc,dL,mc,fV,mc,d7,mc,kG,mc,gI,mc,ea,mc,dq,mc,ic,mc,fm,mc,fG,mc,hD,mc,ho,mc,fP,mc,h5,mc,lw,mc,e7,mc,kJ,mc,kK,mc,fJ,mc,ff,mc,k8,mc,jN,mc,jL,mc,kV,mc,fo,mc,fN,mc,ip,mc,dG,mc,ii,mc,fK,mc,kM,mc,kY,mc,j1,mc,dS,mc,jl,mc,jp,mc,hE,mc,ix,mc,k5,mc,kg,mc,is,mc,iN,mc,kL,mc,h$,mc,gX,mc,fR,mc,dT,mc,fT,mc,fC,mc,en,mc,iE,mc,iw,mc,kk,mc,eC,mc,ei,mc,dn,mc,kV,mc,k9,mc,fF,mc,eo,mc,fl,mc,dm,mc,fH,mc,iS,mc,ds,mc,fs,mc,fE,mc,dZ,mc,jw,mc,fQ,mc,ij,mc,ha,mc,h6,mc,dB,mc,i1,mc,iI,mc,fB,mc,fe,mc,fD,mc,kI,mc,hb,mc,k7,mc,iZ,mc,dA,mc,k6,mc,hG,mc,iq,mc,ep,mc,ju,mc,ef,mc,fz,mc,kN,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc,mc];var cy=[md,md,kq,md,dC,md,im,md,kn,md,hY,md,km,md,iX,md,ie,md,h4,md,hZ,md,ih,md,h3,md,h1,md,io,md,jo,md,hW,md,dU,md,h_,md,kp,md,ik,md,h8,md,d9,md,h7,md,kr,md,hX,md,ia,md,ko,md,hV,md,eM,md,d_,md,dN,md,i$,md,id,md,hU,md,hT,md,h2,md,eT,md,ig,md,h9,md,il,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md,md];var cz=[me,me,jG,me,d1,me,jb,me,i4,me,eS,me,dQ,me,dW,me,jC,me,dt,me,jI,me,eZ,me,jE,me,di,me,eR,me,dE,me,eY,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me,me];var cA=[mf,mf,jU,mf,jS,mf,kf,mf,i7,mf,jh,mf,j0,mf,jj,mf,fx,mf,je,mf,jQ,mf,fv,mf,j3,mf,mf,mf,mf,mf,mf,mf];var cB=[mg,mg,kF,mg,hO,mg,eQ,mg,kv,mg,fc,mg,kD,mg,hK,mg,jR,mg,jX,mg,g9,mg,kt,mg,d0,mg,fj,mg,eX,mg,kz,mg,kx,mg,j4,mg,kW,mg,eb,mg,kd,mg,ka,mg,ky,mg,jW,mg,kb,mg,eO,mg,hS,mg,kA,mg,d$,mg,dD,mg,hL,mg,jK,mg,kE,mg,j6,mg,hQ,mg,ks,mg,dO,mg,j5,mg,jT,mg,fu,mg,hJ,mg,dP,mg,kc,mg,eP,mg,eV,mg,dV,mg,hM,mg,ja,mg,i9,mg,lt,mg,eW,mg,hH,mg,ku,mg,i8,mg,hI,mg,dJ,mg,hN,mg,hP,mg,kw,mg,hR,mg,hn,mg,dh,mg,kC,mg,kB,mg,jV,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg,mg];var cC=[mh,mh,fw,mh,jH,mh,jF,mh,la,mh,iU,mh,jc,mh,fy,mh,ej,mh,fd,mh,fb,mh,jy,mh,eU,mh,i_,mh,jd,mh,jD,mh,fi,mh,ee,mh,jJ,mh,eN,mh,fk,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh,mh];var cD=[mi,mi,g7,mi,g5,mi,gV,mi,gS,mi,mi,mi,mi,mi,mi,mi];var cE=[mj,mj,ed,mj,fL,mj,mj,mj];var cF=[mk,mk,hC,mk,hB,mk,it,mk,iB,mk,iz,mk,iF,mk,mk,mk];var cG=[ml,ml,lT,ml];var cH=[mm,mm,i5,mm,jP,mm,j$,mm,i6,mm,j2,mm,ke,mm,jO,mm,jM,mm,mm,mm,mm,mm,mm,mm,mm,mm,mm,mm,mm,mm,mm,mm];var cI=[mn,mn,hx,mn,hj,mn,mn,mn];var cJ=[mo,mo,iP,mo,iJ,mo,mo,mo];var cK=[mp,mp,li,mp,g3,mp,gZ,mp,g$,mp,lj,mp,g8,mp,iW,mp,e0,mp,g_,mp,gL,mp,gP,mp,gJ,mp,dg,mp,lf,mp,e_,mp,i0,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp,mp];var cL=[mq,mq,jz,mq,jA,mq,ji,mq,jg,mq,jB,mq,mq,mq,mq,mq];var cM=[mr,mr,dl,mr,lb,mr,lc,mr,e$,mr,k2,mr,e1,mr,dy,mr,fX,mr,fU,mr,mr,mr,mr,mr,mr,mr,mr,mr,mr,mr,mr,mr];return{__GLOBAL__I_a330:d3,_strlen:lB,_free:ll,_main:dF,_realloc:lm,_memmove:lE,__GLOBAL__I_a:dv,_memset:lC,_malloc:lk,_memcpy:lD,_strcpy:lA,runPostSets:c1,stackAlloc:cN,stackSave:cO,stackRestore:cP,setThrew:cQ,setTempRet0:cT,setTempRet1:cU,setTempRet2:cV,setTempRet3:cW,setTempRet4:cX,setTempRet5:cY,setTempRet6:cZ,setTempRet7:c_,setTempRet8:c$,setTempRet9:c0,dynCall_viiiii:lU,dynCall_viiiiiii:lV,dynCall_vi:lW,dynCall_vii:lX,dynCall_iii:lY,dynCall_iiiiii:lZ,dynCall_ii:l_,dynCall_iiii:l$,dynCall_viiiiif:l0,dynCall_viii:l1,dynCall_viiiiiiii:l2,dynCall_v:l3,dynCall_iiiiiiiii:l4,dynCall_viiiiiiiii:l5,dynCall_viiiiiif:l6,dynCall_viiiiii:l7,dynCall_iiiii:l8,dynCall_viiii:l9}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_viiiiif": invoke_viiiiif, "invoke_viii": invoke_viii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiif": invoke_viiiiiif, "invoke_viiiiii": invoke_viiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "__scanString": __scanString, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "__isFloat": __isFloat, "_strtoull": _strtoull, "_fflush": _fflush, "_fputc": _fputc, "_strtok": _strtok, "_fwrite": _fwrite, "_send": _send, "_fputs": _fputs, "_isspace": _isspace, "_clReleaseCommandQueue": _clReleaseCommandQueue, "_read": _read, "_clGetContextInfo": _clGetContextInfo, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "___resumeException": ___resumeException, "_strcmp": _strcmp, "_strncmp": _strncmp, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_clGetDeviceIDs": _clGetDeviceIDs, "_fgetc": _fgetc, "___errno_location": ___errno_location, "_clReleaseContext": _clReleaseContext, "_atexit": _atexit, "_clCreateContext": _clCreateContext, "___cxa_free_exception": ___cxa_free_exception, "_fgets": _fgets, "_clRetainContext": _clRetainContext, "__Z8catcloseP8_nl_catd": __Z8catcloseP8_nl_catd, "_clCreateBuffer": _clCreateBuffer, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "__Z7catopenPKci": __Z7catopenPKci, "_log2": _log2, "__isLeapYear": __isLeapYear, "_asprintf": _asprintf, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___locale_mb_cur_max": ___locale_mb_cur_max, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_call_unexpected": ___cxa_call_unexpected, "_clFinish": _clFinish, "__exit": __exit, "_strftime": _strftime, "_rand": _rand, "___cxa_throw": ___cxa_throw, "_clReleaseKernel": _clReleaseKernel, "_llvm_eh_exception": _llvm_eh_exception, "_printf": _printf, "_pread": _pread, "_fopen": _fopen, "_open": _open, "__arraySum": __arraySum, "_puts": _puts, "_clGetDeviceInfo": _clGetDeviceInfo, "_clEnqueueNDRangeKernel": _clEnqueueNDRangeKernel, "_clReleaseProgram": _clReleaseProgram, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_clSetKernelArg": _clSetKernelArg, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_getenv": _getenv, "_clEnqueueReadBuffer": _clEnqueueReadBuffer, "__ZSt9terminatev": __ZSt9terminatev, "_gettimeofday": _gettimeofday, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "_clReleaseMemObject": _clReleaseMemObject, "_strerror": _strerror, "_llvm_lifetime_start": _llvm_lifetime_start, "_clGetProgramBuildInfo": _clGetProgramBuildInfo, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_vsprintf": _vsprintf, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_strtok_r": _strtok_r, "_abort": _abort, "_fprintf": _fprintf, "_isdigit": _isdigit, "_strtoll": _strtoll, "___buildEnvironment": ___buildEnvironment, "__reallyNegative": __reallyNegative, "_clCreateCommandQueue": _clCreateCommandQueue, "_clBuildProgram": _clBuildProgram, "_clGetKernelWorkGroupInfo": _clGetKernelWorkGroupInfo, "__Z7catgetsP8_nl_catdiiPKc": __Z7catgetsP8_nl_catdiiPKc, "__addDays": __addDays, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_pure_virtual": ___cxa_pure_virtual, "_clCreateKernel": _clCreateKernel, "_vasprintf": _vasprintf, "_clCreateProgramWithSource": _clCreateProgramWithSource, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_llvm_va_end": _llvm_va_end, "___assert_func": ___assert_func, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr, "___fsmu8": ___fsmu8, "_stdout": _stdout, "___dso_handle": ___dso_handle }, buffer);
var __GLOBAL__I_a330 = Module["__GLOBAL__I_a330"] = asm["__GLOBAL__I_a330"];
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
